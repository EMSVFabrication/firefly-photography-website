// Where the build gets its content: the seed in site.mjs, with whatever Shelly saved in the ERP laid on top.
// ERP storage (Firestore, all public-readable except inquiries/users):
//   firefly_site/{key}   { value, updatedAt }   key ∈ CONTENT_KEYS (business, settings, packages, services, …)
//   firefly_reviews/{id} a review           firefly_journal/{id} an article
// Offline (no network, or FF_OFFLINE=1) the seed alone is used, so a build never fails because of the database.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED } from './site.mjs';

export const FIREBASE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'firebase', 'config.json'), 'utf8'));
delete FIREBASE._note;

// ERP key → seed field
export const CONTENT_KEYS = { business: 'BIZ', settings: 'SETTINGS', packages: 'PACKAGES', services: 'SERVICES', experience: 'EXPERIENCE',
    process: 'PROCESS', about: 'ABOUT', home: 'HOME', faqs: 'FAQS', categories: 'JOURNAL_CATEGORIES' };

/** Firestore REST value → plain JS */
export function decode(v) {
    if (!v || typeof v !== 'object') return v;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('nullValue' in v) return null;
    if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
    if ('mapValue' in v) return fields(v.mapValue.fields);
    return undefined;
}
const fields = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));

async function list(collection) {
    const out = [];
    let token = '';
    do {
        const u = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/${collection}?pageSize=300&key=${FIREBASE.apiKey}${token ? `&pageToken=${token}` : ''}`;
        const r = await fetch(u, { signal: AbortSignal.timeout(20000) });
        if (!r.ok) throw new Error(`${collection}: HTTP ${r.status}`);
        const j = await r.json();
        for (const d of j.documents || []) out.push({ id: d.name.split('/').pop(), ...fields(d.fields) });
        token = j.nextPageToken || '';
    } while (token);
    return out;
}

/** the published Journal articles (the rules only let the public read those) */
async function published() {
    const u = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents:runQuery?key=${FIREBASE.apiKey}`;
    const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'firefly_journal' }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } } } }) });
    if (!r.ok) throw new Error(`firefly_journal: HTTP ${r.status}`);
    return (await r.json()).filter((x) => x.document).map((x) => ({ id: x.document.name.split('/').pop(), ...fields(x.document.fields) }));
}

/** which project is live: firefly_meta/firebase in the configured project can point at a newer one (ERP → Move Firebase) */
export async function activeFirebase() {
    try {
        const r = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/firefly_meta/firebase?key=${FIREBASE.apiKey}`, { signal: AbortSignal.timeout(15000) });
        if (!r.ok) return FIREBASE;
        const d = fields((await r.json()).fields);
        if (d.active?.projectId && d.active.apiKey && d.active.projectId !== FIREBASE.projectId) {
            console.warn(`Firebase has moved to ${d.active.projectId} — using it. (Update firebase/config.json to match.)`);
            Object.assign(FIREBASE, d.active);
        }
    } catch { /* offline: keep the file's project */ }
    return FIREBASE;
}

export async function loadContent() {
    const C = structuredClone(SEED);
    const from = { seed: true, erp: [] };
    if (process.env.FF_OFFLINE === '1') return { C, from };
    try {
        await activeFirebase();
        const got = await Promise.allSettled([list('firefly_site'), list('firefly_reviews'), published()]);
        got.filter((g) => g.status === 'rejected').forEach((g) => console.warn(`(database: ${g.reason.message} — using the seed for that part)`));
        const [site, reviews, journal] = got.map((g) => (g.status === 'fulfilled' ? g.value : []));
        for (const d of site) {
            const k = CONTENT_KEYS[d.id];
            if (k && d.value !== undefined && d.value !== null) { C[k] = Array.isArray(C[k]) || typeof d.value !== 'object' || Array.isArray(d.value) ? d.value : { ...C[k], ...d.value }; from.erp.push(d.id); }
        }
        if (reviews.length) { C.REVIEWS = reviews.filter((r) => !r.hidden).sort((a, b) => (a.order ?? 999) - (b.order ?? 999)); from.erp.push('reviews'); }
        if (journal.length) { C.JOURNAL = journal; from.erp.push('journal'); }
    } catch (e) {
        console.warn(`(database not reached — building from the seed only: ${e.message})`);
    }
    return { C, from };
}
