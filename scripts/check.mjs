// node scripts/check.mjs — checks the built site in public/: every internal link and image exists, one <h1> per page,
// unique titles and descriptions of a sensible length, alt text on every photo, canonical present. Exit code 1 on problems.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const fb = JSON.parse(readFileSync(join(ROOT, 'firebase.json'), 'utf8')).hosting;
const redirects = new Set((fb.redirects || []).map((r) => r.source));

const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== 'admin') walk(p); } else if (f.endsWith('.html')) pages.push(p); } })(PUB);

const problems = [], warn = [];
const titles = new Map(), descs = new Map();
function exists(url) {
    const path = decodeURIComponent(url.split(/[?#]/)[0]);
    if (redirects.has(path.replace(/\/$/, '')) || redirects.has(path)) return true;
    const f = join(PUB, path);
    if (existsSync(f) && statSync(f).isFile()) return true;
    if (existsSync(join(f, 'index.html'))) return true;
    if (existsSync(`${f.replace(/\/$/, '')}.html`)) return true;
    if (/^\/journal\/[a-z0-9-]+\/?$/.test(path)) return true; // rewritten to the live story page
    return false;
}
for (const file of pages) {
    const rel = file.slice(PUB.length).replace(/\\/g, '/');
    const html = readFileSync(file, 'utf8');
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) problems.push(`${rel}: ${h1} <h1> tags`);
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    const noindex = html.includes('name="robots" content="noindex"');
    if (!title) problems.push(`${rel}: no title`);
    if (!noindex) {
        if (title.length > 70) warn.push(`${rel}: title ${title.length} chars`);
        if (desc.length < 70 || desc.length > 170) warn.push(`${rel}: description ${desc.length} chars`);
        if (titles.has(title)) problems.push(`${rel}: same title as ${titles.get(title)}`); else titles.set(title, rel);
        if (descs.has(desc)) problems.push(`${rel}: same description as ${descs.get(desc)}`); else descs.set(desc, rel);
        if (!html.includes('rel="canonical"')) problems.push(`${rel}: no canonical`);
    }
    for (const [, attr, url] of html.matchAll(/\s(href|src|data-full)="(\/[^"]*)"/g)) {
        if (url.startsWith('//')) continue;
        if (!exists(url)) problems.push(`${rel}: broken ${attr} ${url}`);
    }
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(tag)) problems.push(`${rel}: <img> without alt: ${tag.slice(0, 80)}`);
}
console.log(`Checked ${pages.length} pages.`);
if (warn.length) console.log(`\nWorth a look (${warn.length}):\n  ${[...new Set(warn)].join('\n  ')}`);
if (problems.length) { console.log(`\nProblems (${problems.length}):\n  ${[...new Set(problems)].join('\n  ')}`); process.exit(1); }
console.log('No problems found.');
