// Firefly Photography — the server side of the ERP's "Publish to website" button (codebase "firefly", so deploying it
// never touches the other apps' functions in a shared project).
//   publishOnRequest   a doc in firefly_publish → rebuild every page from the saved content and release it to Hosting
//   publishScheduled   every hour: if a scheduled Journal story has come due since the last publish, publish
// How it releases: the pages are rendered in memory with the same code as the PC build (./site = a copy of scripts/
// made by npm run prepare-functions). The current live version's file list is reused for everything else (photos, CSS,
// the ERP), so only the changed pages are uploaded.
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import { GoogleAuth } from 'google-auth-library';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

initializeApp();
const db = getFirestore();
const SITE_ID = process.env.FIREFLY_HOSTING_SITE || 'firefly-photography';
const API = 'https://firebasehosting.googleapis.com/v1beta1';
const META = db.doc('firefly_meta/publish');
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

async function call(method, url, body, raw) {
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();
    const r = await fetch(url.startsWith('http') ? url : `${API}/${url}`, {
        method, headers: { Authorization: `Bearer ${token}`, ...(raw ? { 'Content-Type': 'application/octet-stream' } : body ? { 'Content-Type': 'application/json' } : {}) },
        body: raw || (body ? JSON.stringify(body) : undefined),
    });
    if (!r.ok) throw new Error(`${method} ${url.split('?')[0]}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    return r.status === 204 ? {} : r.json().catch(() => ({}));
}

/** firebase.json-style hosting settings → the Hosting API's version config */
function versionConfig(h) {
    return {
        cleanUrls: !!h.cleanUrls, trailingSlashBehavior: h.trailingSlash ? 'ADD' : 'REMOVE',
        headers: (h.headers || []).map((x) => ({ glob: x.source, headers: Object.fromEntries(x.headers.map((k) => [k.key, k.value])) })),
        redirects: (h.redirects || []).map((x) => ({ glob: x.source, location: x.destination, statusCode: x.type || 301 })),
        rewrites: (h.rewrites || []).map((x) => ({ ...(x.regex ? { regex: x.regex } : { glob: x.source }), path: x.destination })),
    };
}

async function liveFiles() {
    const rel = await call('GET', `sites/${SITE_ID}/releases?pageSize=1`);
    const version = rel.releases?.[0]?.version?.name;
    if (!version) throw new Error('No live version of the site yet — publish once from the PC (npm run deploy).');
    const files = {};
    let token = '';
    do {
        const page = await call('GET', `${version}/files?pageSize=1000${token ? `&pageToken=${token}` : ''}`);
        for (const f of page.files || []) files[f.path] = f.hash;
        token = page.nextPageToken || '';
    } while (token);
    return files;
}

async function publish(reason, by) {
    // one at a time
    const started = new Date().toISOString();
    const busy = await db.runTransaction(async (t) => {
        const d = (await t.get(META)).data() || {};
        if (d.state === 'publishing' && Date.now() - Date.parse(d.startedAt || 0) < 10 * 60 * 1000) return true;
        t.set(META, { state: 'publishing', startedAt: started, reason, by: by || 'ERP' }, { merge: true });
        return false;
    });
    if (busy) { logger.info('A publish is already running.'); return; }
    try {
        const { renderSite } = await import('./site/scripts/render.mjs');
        const { files: rendered, hosting, stats } = await renderSite();
        const live = await liveFiles();
        const all = { ...live };
        const uploads = {};
        // pages that no longer exist (a deleted story) drop out: every generated .html is replaced by this build's set
        for (const p of Object.keys(all)) if (/\.html$/.test(p) && !p.startsWith('/admin/') && !p.startsWith('/assets/')) delete all[p];
        for (const [path, text] of Object.entries(rendered)) {
            const gz = gzipSync(Buffer.from(text, 'utf8'), { level: 9 });
            const hash = createHash('sha256').update(gz).digest('hex');
            all[`/${path}`] = hash; uploads[hash] = gz;
        }
        const version = await call('POST', `sites/${SITE_ID}/versions`, { config: versionConfig(hosting), labels: { source: 'firefly-erp' } });
        const pop = await call('POST', `${version.name}:populateFiles`, { files: all });
        for (const hash of pop.uploadRequiredHashes || []) {
            if (!uploads[hash]) throw new Error(`Hosting asked for a file this build doesn't have (${hash.slice(0, 10)}…)`);
            await call('POST', `${pop.uploadUrl}/${hash}`, null, uploads[hash]);
        }
        await call('PATCH', `${version.name}?update_mask=status`, { status: 'FINALIZED' });
        await call('POST', `sites/${SITE_ID}/releases?versionName=${version.name}`, { message: `ERP publish (${reason})` });
        await META.set({ state: 'done', pending: false, publishedAt: new Date().toISOString(), message: `${stats.pages} pages, ${stats.posts} stories`, nextScheduled: stats.nextScheduled, version: version.name }, { merge: true });
        logger.info(`Published ${stats.pages} pages (${(pop.uploadRequiredHashes || []).length} files uploaded).`);
    } catch (e) {
        logger.error(e);
        await META.set({ state: 'error', message: String(e.message || e).slice(0, 500), failedAt: new Date().toISOString() }, { merge: true });
    }
}

export const publishOnRequest = onDocumentCreated({ document: 'firefly_publish/{id}', memory: '512MiB', timeoutSeconds: 300, maxInstances: 1 }, async (event) => {
    const d = event.data?.data() || {};
    await publish('requested', d.by);
    await event.data.ref.set({ status: 'handled', handledAt: new Date().toISOString() }, { merge: true });
});

export const publishScheduled = onSchedule({ schedule: 'every 60 minutes', timeZone: 'America/Denver', memory: '512MiB', timeoutSeconds: 300, maxInstances: 1 }, async () => {
    const d = (await META.get()).data() || {};
    if (d.nextScheduled && Date.parse(d.nextScheduled) <= Date.now()) await publish('scheduled story', 'schedule');
});
