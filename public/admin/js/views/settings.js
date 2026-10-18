// Settings: Website & Google · People (ERP sign-ins, enforced at launch) · Move Firebase · System.
import { AUTH_REQUIRED, COLLECTIONS, STORAGE_ROOT, SUBCOLLECTIONS } from '../config.js';
import { AU, CONFIG, FS, ST, auth, db, deleteApp, getContent, initializeApp, listAll, saveContent, stamp, storage } from '../fb.js';
import { confirmBox, dbError, fmt, form, h, modal, toast } from '../ui.js';

const TABS = [['site', 'Website & Google'], ['people', 'People & sign-in'], ['move', 'Move Firebase'], ['system', 'System']];

export async function render(view, rest) {
    const tab = TABS.some(([k]) => k === rest) ? rest : 'site';
    const body = h('div');
    view.replaceChildren(h('div.tabs', ...TABS.map(([k, n]) => h(`a.tab${k === tab ? '.on' : ''}`, { href: `#/settings/${k}`, style: { textDecoration: 'none' } }, n))), body);
    await ({ site, people, move, system })[tab](body);
}

// ───────────────────────────── Website & Google
async function site(el) {
    const c = await getContent('settings');
    const f = form([
        { key: 'gaId', label: 'Google Analytics 4 — measurement ID', placeholder: 'G-XXXXXXXXXX', help: 'analytics.google.com → Admin → Data streams → your website. Leave empty to switch analytics off.' },
        { key: 'gscVerification', label: 'Google Search Console — verification code', help: 'search.google.com/search-console → Add property → HTML tag: paste only the content="…" value.' },
        { key: 'googleReviewsUrl', label: '“Read our reviews on Google” link', help: 'Business Profile → Read reviews (copy the link).' },
        { key: 'googleWriteReviewUrl', label: '“Leave a review” link', help: 'Business Profile → Ask for reviews (g.page/r/…/review).' },
        { key: 'googleRating', label: 'Google star rating shown', type: 'number', step: 0.1, help: 'Until the automatic Google sync is connected, keep this matching your profile.' },
        { key: 'googleReviewCount', label: 'Number of Google reviews shown', type: 'number', step: 1 },
        { key: 'showBoudoir', label: 'Advertise boudoir (its page, package and menu entry)', type: 'bool' },
    ], c.value);
    el.replaceChildren(
        c.error ? h('div.note.note--bad', 'Saving needs the database rules deployed (System tab).') : null,
        h('div.card', f),
        h('div.card', h('h2', 'Automatic Google reviews'), h('p', { style: { margin: '8px 0' } }, 'The full collection of Google reviews can sync automatically once Google approves access to the Business Profile API for Firefly (free; you apply once from the Google account that owns the profile). Until then, reviews are added and featured on the Reviews screen, word for word.'),
            h('p.muted', 'Steps and options: docs/google-reviews.md in the website folder (Brad/Claude set up the connection once approved).')),
        h('div.savebar', h('span.muted', c.saved ? `Saved ${fmt(c.updatedAt)}` : 'Not changed yet'),
            h('button.btn.btn--primary', { type: 'button', on: { click: async () => { try { await saveContent('settings', f.read()); toast('Saved. Press “Publish to website” when you’re ready.'); } catch (e) { dbError(e); } } } }, 'Save')));
}

// ───────────────────────────── People
async function people(el) {
    let list = [];
    try { list = await listAll('firefly_users'); } catch (e) { el.replaceChildren(h('div.note.note--bad', 'People need the database rules deployed (System tab).')); return; }
    const add = () => modal('Add a person', (close) => {
        const name = h('input'), email = h('input', { type: 'email' }), role = h('select', h('option', { value: 'owner' }, 'Owner — everything, incl. people & Firebase'), h('option', { value: 'editor' }, 'Editor — content, Journal, photos, inquiries'));
        const pass = h('input', { value: Math.random().toString(36).slice(2, 8) + 'Ff!' + Math.floor(Math.random() * 90 + 10) });
        return h('div.stack', h('label.field', h('span.field__label', 'Name'), name), h('label.field', h('span.field__label', 'Email'), email), h('label.field', h('span.field__label', 'Role'), role),
            h('label.field', h('span.field__label', h('span', 'Temporary password'), h('small', 'Tell them, and they can change it with “Forgot password?” on the sign-in screen.')), pass),
            h('div.row.row--end', h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                try {
                    // a second, throwaway Firebase app creates the account so this screen stays signed in as you
                    const tmp = initializeApp(CONFIG, `create-${Date.now()}`);
                    const cred = await AU.createUserWithEmailAndPassword(AU.getAuth(tmp), email.value.trim(), pass.value);
                    await FS.setDoc(FS.doc(db, 'firefly_users', cred.user.uid), { name: name.value.trim(), email: email.value.trim(), role: role.value, active: true, ...stamp() });
                    await deleteApp(tmp); close(); toast('Added.'); people(el);
                } catch (e) { toast(/operation-not-allowed/.test(e.code) ? 'Turn on Email/Password sign-in in the Firebase console (Authentication → Sign-in method) first.' : `Couldn’t add: ${e.message}`, 'error'); }
            } } }, 'Add person')));
    });
    el.replaceChildren(
        h('div.note', AUTH_REQUIRED ? 'Sign-in is ON: only the people below (active) can open the ERP.' : h('span', h('strong', 'Sign-in is OFF during testing. '), 'Anyone with the link can open the ERP. Add the people now; at launch sign-in is switched on (How-to guide → Launch) and only they can get in.')),
        h('div.card', { style: { marginTop: '14px' } }, h('div.card__head', h('h2', 'People'), h('button.btn.btn--primary', { type: 'button', on: { click: add } }, '+ Add a person')),
            list.length ? h('table.table', h('tbody', ...list.map((u) => h('tr',
                h('td', h('strong', u.name || u.email), h('div.muted', u.email)), h('td', h('span.badge', u.role)), h('td', u.active ? h('span.badge.badge--ok', 'Active') : h('span.badge.badge--bad', 'Off')),
                h('td.row.row--end',
                    h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { await AU.sendPasswordResetEmail(auth, u.email).then(() => toast('Password reset email sent.')).catch((e) => toast(e.message, 'error')); } } }, 'Send reset email'),
                    h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { try { await FS.updateDoc(FS.doc(db, 'firefly_users', u.id), { active: !u.active, ...stamp() }); people(el); } catch (e) { dbError(e); } } } }, u.active ? 'Switch off' : 'Switch on'))))))
                : h('p.empty', 'No one yet. Add Shelly (owner) before launch.')));
}

// ───────────────────────────── Move Firebase (brief: "a way in the ERP to enter the new Firebase information with a button to transfer everything and then start using the new Firebase")
function parseConfig(text) {
    const get = (k) => (text.match(new RegExp(`["']?${k}["']?\\s*[:=]\\s*["']([^"']+)["']`)) || [])[1] || '';
    const c = { apiKey: get('apiKey'), authDomain: get('authDomain'), projectId: get('projectId'), storageBucket: get('storageBucket'), messagingSenderId: get('messagingSenderId'), appId: get('appId') };
    return c.apiKey && c.projectId ? c : null;
}
async function move(el) {
    const ta = h('textarea', { rows: 9, placeholder: 'Paste the firebaseConfig from Shelly’s project:\n\nconst firebaseConfig = {\n  apiKey: "…",\n  authDomain: "….firebaseapp.com",\n  projectId: "…",\n  storageBucket: "….firebasestorage.app",\n  messagingSenderId: "…",\n  appId: "…"\n};' });
    const log = h('div.stack', { style: { fontSize: '13.5px' } });
    const say = (t, kind = '') => { log.append(h(`p${kind ? `.${kind}` : ''}`, t)); log.lastChild.scrollIntoView({ block: 'nearest' }); };
    let target = null, tapp = null;
    const connect = async () => {
        const cfg = parseConfig(ta.value);
        if (!cfg) { toast('That doesn’t look like a firebaseConfig — it needs at least apiKey and projectId.', 'error'); return null; }
        if (cfg.projectId === CONFIG.projectId) { toast('That’s the project already in use.', 'error'); return null; }
        if (tapp) await deleteApp(tapp).catch(() => {});
        tapp = initializeApp(cfg, `target-${Date.now()}`);
        target = { cfg, db: FS.getFirestore(tapp), storage: ST.getStorage(tapp), auth: AU.getAuth(tapp) };
        return target;
    };
    const check = async () => {
        log.replaceChildren(); if (!(await connect())) return false;
        say(`Checking ${target.cfg.projectId}…`);
        let ok = true;
        try { await FS.setDoc(FS.doc(target.db, 'firefly_meta', 'move-check'), { at: new Date().toISOString() }); say('✓ Database reachable and the Firefly rules allow writing.'); }
        catch (e) { ok = false; say(`✗ Database: ${e.code || e.message}. Create a Firestore database in that project and deploy the Firefly rules (System tab → “Rules for the new project”).`, 'error'); }
        try { const r = ST.ref(target.storage, `${STORAGE_ROOT}/_move-check.webp`); await ST.uploadBytes(r, new Blob([new Uint8Array([82, 73, 70, 70])], { type: 'image/webp' })); await ST.deleteObject(r); say('✓ File storage reachable and the Firefly storage rules allow uploads.'); }
        catch (e) { ok = false; say(`✗ Storage: ${e.code || e.message}. Turn on Storage in that project and deploy the Firefly storage rules.`, 'error'); }
        say(ok ? 'Ready to copy.' : 'Fix the items above, then check again.', ok ? '' : 'error');
        return ok;
    };
    const copy = async () => {
        if (!(await check())) return;
        if (!(await confirmBox('Copy everything?', `All Firefly data and photos will be copied from ${CONFIG.projectId} to ${target.cfg.projectId}. Nothing is deleted from either. You can run it again; it overwrites with the latest copy.`, { ok: 'Copy everything' }))) return;
        const started = Date.now();
        // 1. files: every file under firefly/ — copied first so the data can point at the new copies
        const urlMap = new Map();
        const files = [];
        const walk = async (ref) => { const r = await ST.listAll(ref); files.push(...r.items); for (const p of r.prefixes) await walk(p); };
        try { await walk(ST.ref(storage, STORAGE_ROOT)); } catch (e) { say(`✗ Couldn’t list the photos: ${e.message}`, 'error'); return; }
        say(`Copying ${files.length} files…`);
        let n = 0, failed = 0;
        for (const f of files) {
            try {
                const [blob, meta, oldUrl] = await Promise.all([ST.getBlob(f), ST.getMetadata(f), ST.getDownloadURL(f)]);
                const to = ST.ref(target.storage, f.fullPath);
                await ST.uploadBytes(to, blob, { contentType: meta.contentType, cacheControl: meta.cacheControl || 'public, max-age=31536000' });
                urlMap.set(f.fullPath, await ST.getDownloadURL(to));
                urlMap.set(oldUrl, urlMap.get(f.fullPath));
            } catch (e) {
                failed++;
                if (failed === 1) say(`✗ ${f.fullPath}: ${e.message}${/CORS|network|Failed to fetch/i.test(e.message) ? ' — the old bucket must allow downloads from this page (System tab → “Photo copy (CORS)”).' : ''}`, 'error');
            }
            if (++n % 10 === 0) say(`  …${n} of ${files.length}`);
        }
        say(failed ? `Files: ${n - failed} copied, ${failed} failed.` : `✓ ${n} files copied.`, failed ? 'error' : '');
        // 2. data: every firefly_* collection (photo links rewritten to the new copies)
        const oldBucket = CONFIG.storageBucket;
        const swap = (v) => {
            if (typeof v === 'string') {
                if (urlMap.has(v)) return urlMap.get(v);
                const m = v.match(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/);
                if (m && m[1] === oldBucket) return urlMap.get(decodeURIComponent(m[2])) || v;
                return v;
            }
            if (Array.isArray(v)) return v.map(swap);
            if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
            return v;
        };
        const counts = {};
        for (const col of COLLECTIONS) {
            if (col === 'firefly_meta') continue;
            try {
                const snap = await FS.getDocs(FS.collection(db, col));
                for (const d of snap.docs) {
                    await FS.setDoc(FS.doc(target.db, col, d.id), swap(d.data()));
                    for (const sub of SUBCOLLECTIONS[col] || []) {
                        const ss = await FS.getDocs(FS.collection(db, col, d.id, sub));
                        for (const s of ss.docs) await FS.setDoc(FS.doc(target.db, col, d.id, sub, s.id), swap(s.data()));
                    }
                }
                counts[col] = snap.size; say(`✓ ${col}: ${snap.size}`);
            } catch (e) { counts[col] = -1; say(`✗ ${col}: ${e.message}`, 'error'); }
        }
        const pub = await FS.getDoc(FS.doc(db, 'firefly_meta', 'publish')).catch(() => null);
        if (pub?.exists()) await FS.setDoc(FS.doc(target.db, 'firefly_meta', 'publish'), { ...pub.data(), pending: true }).catch(() => {});
        await FS.setDoc(FS.doc(db, 'firefly_meta', 'move'), { to: target.cfg.projectId, copiedAt: new Date().toISOString(), counts, files: n - failed, failedFiles: failed, ...stamp() }).catch(() => {});
        say(`Done in ${Math.round((Date.now() - started) / 1000)} s. Check the numbers, then press “Switch to the new Firebase”.`);
        say('Note: sign-in accounts don’t copy from a browser. Add people again in the new project (People & sign-in), or Brad/Claude can export/import them with the Firebase tools.', 'muted');
    };
    const verify = async () => {
        if (!(await connect())) return;
        say('Comparing…');
        for (const col of COLLECTIONS) {
            if (col === 'firefly_meta') continue;
            const [a, b] = await Promise.all([FS.getCountFromServer(FS.collection(db, col)).then((s) => s.data().count).catch(() => '?'), FS.getCountFromServer(FS.collection(target.db, col)).then((s) => s.data().count).catch(() => '?')]);
            say(`${a === b ? '✓' : '✗'} ${col}: ${a} here · ${b} there`, a === b ? '' : 'error');
        }
    };
    const switchOver = async () => {
        if (!(await connect())) return;
        if (!(await confirmBox('Start using the new Firebase?', h('div.stack', h('p', `From now on the ERP and the website read and save in ${target.cfg.projectId}.`), h('p.muted', 'The old project keeps its copy (nothing is deleted). A pointer is saved in both projects so every page follows. Then: update firebase/config.json and publish (Brad/Claude).')), { ok: 'Switch now' }))) return;
        const pointer = { active: target.cfg, from: CONFIG.projectId, movedAt: new Date().toISOString(), movedBy: auth.currentUser?.email || 'ERP (testing)' };
        try {
            await FS.setDoc(FS.doc(target.db, 'firefly_meta', 'firebase'), pointer);
            await FS.setDoc(FS.doc(db, 'firefly_meta', 'firebase'), pointer);
            toast('Switched. Reloading…'); setTimeout(() => location.reload(), 1200);
        } catch (e) { dbError(e, 'Switching'); }
    };
    let pointer = null;
    try { pointer = (await FS.getDoc(FS.doc(db, 'firefly_meta', 'move'))).data(); } catch { /* rules */ }
    el.replaceChildren(
        h('div.card.stack',
            h('h2', 'Move to Shelly’s own Firebase'),
            h('p', `Right now Firefly lives in a shared project (${CONFIG.projectId}). Before launch, everything moves to Shelly’s own Firebase project. This copies all the data (content, Journal, reviews, inquiries, photo library, people) and every uploaded photo, then switches the ERP and website over.`),
            h('ol', { style: { paddingLeft: '20px', display: 'grid', gap: '4px', color: '#4a423b' } },
                h('li', 'In Shelly’s Google account: console.firebase.google.com → Add project. Then add a Web app (</> icon) and copy its firebaseConfig.'),
                h('li', 'In that project turn on: Firestore Database, Storage, and Authentication → Email/Password.'),
                h('li', 'Deploy the Firefly rules to it (System tab → “Rules for the new project”).'),
                h('li', 'Paste the config below → Check → Copy everything → Compare → Switch.')),
            pointer ? h('p.note', `Last copy: to ${pointer.to}, ${fmt(pointer.copiedAt)} — ${pointer.files} files${pointer.failedFiles ? `, ${pointer.failedFiles} failed` : ''}.`) : null,
            ta,
            h('div.row', h('button.btn.btn--ghost', { type: 'button', on: { click: check } }, '1. Check the new project'), h('button.btn.btn--primary', { type: 'button', on: { click: copy } }, '2. Copy everything'),
                h('button.btn.btn--ghost', { type: 'button', on: { click: verify } }, '3. Compare'), h('button.btn.btn--gold', { type: 'button', on: { click: switchOver } }, '4. Switch to the new Firebase'))),
        h('div.card', h('h3', 'Progress'), log));
}

// ───────────────────────────── System
async function system(el) {
    const row = (ok, title, text) => h('li', h('div.row', h('span.badge', { class: `badge ${ok === null ? '' : ok ? 'badge--ok' : 'badge--bad'}` }, ok === null ? '…' : ok ? 'OK' : 'Not yet'), h('strong', title)), text ? h('p.muted', text) : null);
    let rules = false, pub = null;
    try { await FS.setDoc(FS.doc(db, 'firefly_meta', 'ping'), { at: new Date().toISOString() }); rules = true; } catch { /* not deployed */ }
    try { pub = (await FS.getDoc(FS.doc(db, 'firefly_meta', 'publish'))).data(); } catch { /* */ }
    const fetchText = (p) => fetch(p).then((r) => (r.ok ? r.text() : '')).catch(() => '');
    const [fsRules, stRules] = await Promise.all([fetchText('./rules/firestore.rules'), fetchText('./rules/storage.rules')]);
    const show = (title, text) => modal(title, h('div.stack', h('textarea', { rows: 18, readOnly: true, value: text, style: { fontFamily: 'monospace', fontSize: '12px' } }), h('button.btn.btn--primary', { type: 'button', on: { click: () => navigator.clipboard.writeText(text).then(() => toast('Copied.')) } }, 'Copy')), { wide: true });
    const cors = `[{"origin": ["${location.origin}"], "method": ["GET"], "maxAgeSeconds": 3600}]`;
    el.replaceChildren(
        h('div.card', h('h2', 'Status'), h('ul.stack', { style: { listStyle: 'none', padding: 0, marginTop: '12px' } },
            row(true, `Firebase project: ${CONFIG.projectId}`, 'Where the ERP reads and saves.'),
            row(rules, 'Firefly database rules', rules ? 'Saving works.' : 'Not deployed yet in this project, so the ERP can’t save. Brad/Claude: npm run sync-rules, then npm run deploy-rules.'),
            row(!!pub?.publishedAt, 'Publishing service', pub?.publishedAt ? `Last published ${fmt(pub.publishedAt)}.` : 'The “Publish to website” button needs the Firefly publishing function deployed (npm run deploy-functions). Until then, Brad/Claude publish with npm run deploy.'),
            row(AUTH_REQUIRED, 'ERP sign-in required', AUTH_REQUIRED ? 'Only people in People & sign-in can open the ERP.' : 'Off during testing — switched on at launch.'))),
        h('div.card', h('h2', 'Demo data (testing)'),
            h('p.muted', { style: { margin: '6px 0 12px' } }, 'Fills every screen with sample clients (Brad Dinges, Danielle Fritz, Avrie Fritz): inquiries, Journal stories (published, scheduled and a draft), reviews marked “(demo)”, people and library photos. Everything is tagged as demo, never reaches a real inbox, and is left out of the website automatically once it launches. Press “Publish to website” afterwards to see it on the site.'),
            h('div.row', h('button.btn.btn--primary', { type: 'button', on: { click: async (e) => {
                const b = e.currentTarget; b.disabled = true; b.textContent = 'Adding…';
                try { const { addDemo } = await import('../demo.js'); await addDemo(); toast('Demo data added. Press “Publish to website” to see it on the site.'); } catch (x) { dbError(x, 'Adding demo data'); }
                b.disabled = false; b.textContent = 'Add demo data';
            } } }, 'Add demo data'),
            h('button.btn.btn--ghost', { type: 'button', on: { click: async (e) => {
                if (!(await confirmBox('Remove all demo data?', 'Every record marked as demo is deleted. Real content is not touched.', { ok: 'Remove demo data', danger: true }))) return;
                const b = e.currentTarget; b.disabled = true;
                try { const { removeDemo } = await import('../demo.js'); const n = await removeDemo(); toast(`${n} demo records removed. Publish to update the site.`); } catch (x) { dbError(x, 'Removing demo data'); }
                b.disabled = false;
            } } }, 'Remove demo data'))),
        h('div.card', h('h2', 'Rules for the new project'), h('p.muted', { style: { margin: '6px 0 12px' } }, 'Paste these into the new project’s Firebase console (Firestore → Rules, Storage → Rules) and Publish — or Brad/Claude deploy them from firebase/*.rules.'),
            h('div.row', h('button.btn.btn--ghost', { type: 'button', on: { click: () => show('Firestore rules', fsRules) } }, 'Show Firestore rules'), h('button.btn.btn--ghost', { type: 'button', on: { click: () => show('Storage rules', stRules) } }, 'Show Storage rules'))),
        h('div.card', h('h2', 'Photo copy (CORS)'), h('p.muted', { style: { margin: '6px 0 12px' } }, 'Copying photos to a new project downloads them in this browser, which the old storage bucket must allow once:'),
            h('pre', { style: { whiteSpace: 'pre-wrap', background: '#f2ede4', padding: '12px', borderRadius: '8px', fontSize: '12px' } }, `echo '${cors}' > cors.json\ngsutil cors set cors.json gs://${CONFIG.storageBucket}`)));
}
