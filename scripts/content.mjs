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

export async function loadContent() {
    const C = structuredClone(SEED);
    const from = { seed: true, erp: [] };
    if (process.env.FF_OFFLINE === '1') return { C, from };
    try {
        const [site, reviews, journal] = await Promise.all([list('firefly_site'), list('firefly_reviews'), list('firefly_journal')]);
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
