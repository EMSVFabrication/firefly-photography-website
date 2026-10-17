// Firebase for the ERP: which project is live, the database and file helpers every screen uses.
import { FIREBASE as FILE_CONFIG } from '../firebase-config.js';
import { CONTENT_KEYS, SDK } from './config.js';

const { initializeApp, deleteApp } = await import(`${SDK}/firebase-app.js`);
const FS = await import(`${SDK}/firebase-firestore.js`);
const ST = await import(`${SDK}/firebase-storage.js`);
const AU = await import(`${SDK}/firebase-auth.js`);
export { FS, ST, AU, initializeApp, deleteApp };

/** the live project: firefly_meta/firebase in the file's project may point at a newer one (after a Firebase move) */
async function pickConfig() {
    let cfg = FILE_CONFIG;
    try {
        const probe = initializeApp(FILE_CONFIG, 'probe');
        const snap = await FS.getDoc(FS.doc(FS.getFirestore(probe), 'firefly_meta', 'firebase'));
        const active = snap.exists() ? snap.data().active : null;
        if (active?.projectId && active.apiKey && active.projectId !== FILE_CONFIG.projectId) cfg = active;
        await deleteApp(probe);
    } catch { /* not readable yet (rules) or offline: use the file's project */ }
    return cfg;
}
export const CONFIG = await pickConfig();
export const app = initializeApp(CONFIG);
export const db = FS.getFirestore(app);
export const storage = ST.getStorage(app);
export const auth = AU.getAuth(app);

// ── the starting content (written by the build from scripts/site.mjs) and the site's own photos
const seedRes = await fetch(`./seed.json?v=${Date.now()}`);
export const SEED = await seedRes.json();

const who = () => auth.currentUser?.email || 'ERP (no sign-in during testing)';
const now = () => new Date().toISOString();

/** an area's content: what's saved in the ERP, else the starting copy */
export async function getContent(key) {
    try {
        const snap = await FS.getDoc(FS.doc(db, 'firefly_site', key));
        if (snap.exists() && snap.data().value !== undefined) return { value: snap.data().value, saved: true, updatedAt: snap.data().updatedAt, updatedBy: snap.data().updatedBy };
    } catch (e) {
        return { value: structuredClone(SEED[CONTENT_KEYS[key]]), saved: false, error: e };
    }
    return { value: structuredClone(SEED[CONTENT_KEYS[key]]), saved: false };
}
export async function saveContent(key, value) {
    await FS.setDoc(FS.doc(db, 'firefly_site', key), { value: clean(value), updatedAt: now(), updatedBy: who() });
    await markChanged(key);
}
/** Firestore refuses undefined values: drop them */
export function clean(v) {
    if (Array.isArray(v)) return v.map(clean).filter((x) => x !== undefined);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, clean(x)]));
    return v;
}
/** remember that the site has changes waiting to be published */
export async function markChanged(what) {
    try { await FS.setDoc(FS.doc(db, 'firefly_meta', 'publish'), { pending: true, lastChange: now(), lastChangeWhat: what, lastChangeBy: who() }, { merge: true }); } catch { /* not fatal */ }
}

export async function listAll(col, ...constraints) {
    const snap = await FS.getDocs(constraints.length ? FS.query(FS.collection(db, col), ...constraints) : FS.collection(db, col));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export const stamp = () => ({ updatedAt: now(), updatedBy: who() });

// ── photos: made web-sized in the browser (1600px + 760px WebP), then uploaded to firefly/media/<id>/
async function resize(file, max) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const c = new OffscreenCanvas(w, h);
    c.getContext('2d').drawImage(bmp, 0, 0, w, h);
    const blob = await c.convertToBlob({ type: 'image/webp', quality: .84 });
    return { blob, w, h };
}
export async function uploadPhoto(file, { alt = '', folder = 'media', onProgress } = {}) {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const big = await resize(file, 1600), small = await resize(file, 760);
    const put = async (blob, name) => {
        const r = ST.ref(storage, `firefly/${folder}/${id}/${name}.webp`);
        await ST.uploadBytes(r, blob, { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' });
        return ST.getDownloadURL(r);
    };
    onProgress?.('uploading');
    const [src, sm] = await Promise.all([put(big.blob, 'full'), put(small.blob, 'sm')]);
    const photo = { src, sm, w: big.w, h: big.h, alt, name: file.name, path: `firefly/${folder}/${id}`, createdAt: now() };
    await FS.setDoc(FS.doc(db, 'firefly_media', id), photo);
    return { id, ...photo };
}
export async function deletePhoto(m) {
    for (const n of ['full', 'sm']) { try { await ST.deleteObject(ST.ref(storage, `${m.path}/${n}.webp`)); } catch { /* already gone */ } }
    await FS.deleteDoc(FS.doc(db, 'firefly_media', m.id));
}
