// node scripts/fb.mjs <hosting|rules|functions|all> — deploy to the Firebase project named in .firebaserc ("default").
// npm run deploy / deploy-rules / deploy-functions / deploy-all call this.
// Safety: while Firefly still lives in the SHARED BIC/ASAP project (bic-dev-e2618), the rules are never deployed as a
// whole file from here (that would replace BIC's and ASAP's rules): only the Firefly block is copied into
// ..\BIC App and deployed from there. In Shelly's own project, firebase/*.rules are deployed as they are.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = 'bic-dev-e2618';
const what = process.argv[2];
if (!['hosting', 'rules', 'functions', 'all'].includes(what)) { console.error('Use: node scripts/fb.mjs hosting | rules | functions | all'); process.exit(1); }

const rc = JSON.parse(readFileSync(join(ROOT, '.firebaserc'), 'utf8'));
const project = rc.projects?.default;
if (!project) { console.error('No Firebase project set. Run: npm run use-firebase'); process.exit(1); }
const cfg = JSON.parse(readFileSync(join(ROOT, 'firebase', 'config.json'), 'utf8'));
if (cfg.projectId !== project) { console.error(`.firebaserc says ${project} but firebase/config.json says ${cfg.projectId}. Run npm run use-firebase again.`); process.exit(1); }

const cli = join(ROOT, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
if (!existsSync(cli)) { console.error('Firebase tools missing. Run: npm install'); process.exit(1); }
const run = (cmd, args, cwd = ROOT) => spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' }).status === 0;
const firebase = (args, cwd = ROOT) => run('node', [`"${cli}"`, ...args, '--project', project, '--non-interactive'], cwd);
const step = (t) => console.log(`\n── ${t} (${project})`);
const stop = (t) => { console.error(`\n✗ ${t}`); process.exit(1); };

if (what === 'rules' || what === 'all') {
    step('Database and storage rules');
    if (project === SHARED) {
        const bic = resolve(ROOT, '..', 'BIC App');
        if (!existsSync(bic)) stop('Shared project: the rules are deployed from ..\\BIC App, which is not on this computer.');
        if (!run('node', ['scripts/sync-rules.mjs'])) stop('Copying the Firefly block failed.');
        if (!firebase(['deploy', '--only', 'firestore:rules,storage'], bic)) stop('Rules deploy failed.');
    } else if (!firebase(['deploy', '--only', 'firestore:rules,storage'])) stop('Rules deploy failed.');
}
if (what === 'functions' || what === 'all') {
    step('Publish function');
    if (!run('node', ['scripts/prepare-functions.mjs'])) stop('Preparing the function failed.');
    if (!run('npm', ['install', '--no-audit', '--no-fund'], join(ROOT, 'functions-firefly'))) stop('Installing the function’s packages failed.');
    if (!firebase(['deploy', '--only', 'functions:firefly'])) stop('Function deploy failed (if this is the first deploy, wait a minute and run it again — Google turns on the APIs it needs the first time).');
}
if (what === 'hosting' || what === 'all') {
    step('Website');
    if (project !== SHARED) {
        // a project's own hosting site is usually named after the project, but not always: ask Firebase, make one if needed
        const out = spawnSync('node', [`"${cli}"`, 'hosting:sites:list', '--json', '--project', project, '--non-interactive'], { cwd: ROOT, shell: process.platform === 'win32', encoding: 'utf8' });
        let sites = [];
        try { sites = JSON.parse(out.stdout.slice(out.stdout.indexOf('{'))).result?.sites || []; } catch { /* below */ }
        let site = (sites.find((s) => s.type === 'DEFAULT_SITE') || sites[0])?.name?.split('/').pop();
        if (!site) {
            console.log('No hosting site yet — creating one.');
            if (!firebase(['hosting:sites:create', project])) stop('Couldn’t create a hosting site. In the Firebase console open Hosting → Get started, then run this again.');
            site = project;
        }
        const now = JSON.parse(readFileSync(join(ROOT, '.firebaserc'), 'utf8'));
        if (now.targets?.[project]?.hosting?.site?.[0] !== site) {
            now.targets = { ...now.targets, [project]: { hosting: { site: [site] } } };
            writeFileSync(join(ROOT, '.firebaserc'), `${JSON.stringify(now, null, 2)}\n`);
        }
        console.log(`Website address: https://${site}.web.app`);
    }
    if (!run('node', ['scripts/build.mjs'])) stop('Build failed.');
    // the release step sometimes fails with "Failed to make request" — trying again works
    if (!firebase(['deploy', '--only', 'hosting:site']) && !firebase(['deploy', '--only', 'hosting:site'])) stop('Website deploy failed.');
}
console.log('\n✓ Done.');
