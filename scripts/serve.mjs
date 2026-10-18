// node scripts/serve.mjs — the site on this PC at http://localhost:5210 (no installs needed). Ctrl+C stops it.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUB = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
createServer((req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '');
    let file = join(PUB, path);
    if (!file.startsWith(PUB)) { res.writeHead(403).end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    // like Firebase Hosting: a new Journal story → the live story page; anything else missing → the 404 page
    if (!existsSync(file) && /^journal[\/][a-z0-9-]+[\/]?$/.test(path)) file = join(PUB, 'journal', 'story', 'index.html');
    if (!existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(readFileSync(join(PUB, '404.html'))); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(readFileSync(file));
}).listen(5210, () => console.log('Firefly Photography: http://localhost:5210'));
