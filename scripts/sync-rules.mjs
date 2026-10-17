// npm run sync-rules — copy the Firefly block of firebase/firestore.rules and firebase/storage.rules into the shared
// project's rules files in ..\BIC App (replacing an older Firefly block), the same way ASAP does it.
// Deploy afterwards from there:  npm run deploy-rules  (only firestore:rules + storage, nothing else of BIC's).
// Not needed once Firefly has its own Firebase project: then firebase/*.rules are deployed as they are.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BIC = resolve(ROOT, '..', 'BIC App');
const START = '// ======================================================================== Firefly Photography — start';
const END = '// ======================================================================== Firefly Photography — end';
for (const name of ['firestore.rules', 'storage.rules']) {
    const src = readFileSync(join(ROOT, 'firebase', name), 'utf8').replace(/\r\n/g, '\n');
    const a = src.indexOf(START), b = src.indexOf(END);
    if (a < 0 || b < 0) throw new Error(`no Firefly block in firebase/${name}`);
    const block = `    ${src.slice(a, b + END.length)}`;
    const file = join(BIC, name);
    let bic = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const oa = bic.indexOf(START);
    if (oa >= 0) {
        const lineStart = bic.lastIndexOf('\n', oa) + 1;
        bic = bic.slice(0, lineStart) + block + bic.slice(bic.indexOf(END) + END.length);
    } else {
        const last = bic.lastIndexOf('}');
        const inner = bic.lastIndexOf('}', last - 1);
        const lineStart = bic.lastIndexOf('\n', inner) + 1;
        bic = `${bic.slice(0, lineStart)}\n${block}\n${bic.slice(lineStart)}`;
    }
    writeFileSync(file, bic);
    console.log(`${name}: Firefly block → ${file}`);
}
