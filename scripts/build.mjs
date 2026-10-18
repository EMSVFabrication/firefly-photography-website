// node scripts/build.mjs — writes the site's pages into public/ (Firebase Hosting serves that folder as it is).
// The pages come from scripts/render.mjs (content: scripts/site.mjs + what Shelly saved in the ERP).
// Look and behaviour: public/assets/site.css and site.js (hand-written). The ERP lives in public/admin.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite } from './render.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');

const { files, hosting, from, stats } = await renderSite();
for (const [path, text] of Object.entries(files)) { const f = join(PUB, path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); }

// firebase.json: the same hosting settings the Publish function uses
const fbPath = join(ROOT, 'firebase.json');
const fb = JSON.parse(readFileSync(fbPath, 'utf8'));
Object.assign(fb.hosting, hosting);
writeFileSync(fbPath, `${JSON.stringify(fb, null, 2)}\n`);

console.log(`Built ${stats.pages} pages · ${stats.posts} journal stories · ${stats.photos} gallery photos · content: seed${from.erp.length ? ` + ERP (${from.erp.join(', ')})` : ''}.`);
