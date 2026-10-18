// npm run prepare-functions — copy the site's page code into functions-firefly/site so the Publish function renders
// exactly the same pages as the PC build. Run before deploying the functions (npm run deploy-functions does it).
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'functions-firefly', 'site');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'scripts'), { recursive: true });
mkdirSync(join(OUT, 'firebase'), { recursive: true });
for (const f of ['render.mjs', 'content.mjs', 'pages.mjs', 'lib.mjs', 'site.mjs', 'journal-seed.mjs', 'photos.json']) copyFileSync(join(ROOT, 'scripts', f), join(OUT, 'scripts', f));
for (const f of ['config.json', 'firestore.rules', 'storage.rules']) copyFileSync(join(ROOT, 'firebase', f), join(OUT, 'firebase', f));
console.log('functions-firefly/site is up to date.');
