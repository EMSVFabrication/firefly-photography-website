// npm run use-firebase — point this folder at a Firebase project.
// Paste the project's web-app config (Firebase console → Project settings → Your apps → SDK setup → Config) into
// firebase/new-project.txt, save, and run this. It writes firebase/config.json (what the site and ERP use) and
// .firebaserc (where the deploy commands go). Run with --shared to go back to the temporary shared project.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = { apiKey: 'AIzaSyDs9pql2b8EuFncztmpddsX9rEsMEy-W1Q', authDomain: 'bic-dev-e2618.firebaseapp.com', projectId: 'bic-dev-e2618',
    storageBucket: 'bic-dev-e2618.firebasestorage.app', messagingSenderId: '476528341413', appId: '1:476528341413:web:d0a6656e8ec0b9853cf84c' };

let cfg;
if (process.argv.includes('--shared')) cfg = SHARED;
else {
    const file = join(ROOT, 'firebase', 'new-project.txt');
    if (!existsSync(file)) {
        writeFileSync(file, '// Paste the firebaseConfig from the Firebase console here (the whole { … } block), save, then run: npm run use-firebase\n');
        console.log('Made firebase/new-project.txt — paste the firebaseConfig into it, save, and run npm run use-firebase again.');
        process.exit(0);
    }
    const text = readFileSync(file, 'utf8');
    const get = (k) => (text.match(new RegExp(`["']?${k}["']?\\s*[:=]\\s*["']([^"']+)["']`)) || [])[1] || '';
    cfg = { apiKey: get('apiKey'), authDomain: get('authDomain'), projectId: get('projectId'), storageBucket: get('storageBucket'), messagingSenderId: get('messagingSenderId'), appId: get('appId') };
    const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) { console.error(`firebase/new-project.txt is missing: ${missing.join(', ')}. Paste the whole firebaseConfig block.`); process.exit(1); }
}

writeFileSync(join(ROOT, 'firebase', 'config.json'), `${JSON.stringify({
    _note: cfg.projectId === SHARED.projectId
        ? 'TEMPORARY: the shared ASAP/BIC project. npm run use-firebase switches to Shelly’s own project.'
        : 'Shelly’s own Firebase project. Set with npm run use-firebase.',
    ...cfg }, null, 2)}\n`);

// the hosting site: the shared project uses its "firefly-photography" site; a project of its own uses its default site
const site = cfg.projectId === SHARED.projectId ? 'firefly-photography' : cfg.projectId;
writeFileSync(join(ROOT, '.firebaserc'), `${JSON.stringify({ projects: { default: cfg.projectId }, targets: { [cfg.projectId]: { hosting: { site: [site] } } } }, null, 2)}\n`);
console.log(`✓ This folder now uses Firebase project ${cfg.projectId} (website: https://${site}.web.app).`);
console.log('  Next: npm run deploy-all   (rules, Publish function and website).');
