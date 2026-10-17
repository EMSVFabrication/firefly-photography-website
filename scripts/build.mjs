// node scripts/build.mjs — writes the site's pages into public/ (Firebase Hosting serves that folder as it is).
// Content: scripts/site.mjs (the seed) + what Shelly saved in the ERP (scripts/content.mjs). Pages: scripts/pages.mjs.
// Look and behaviour: public/assets/site.css and site.js (hand-written). The ERP lives in public/admin (not generated).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIREBASE, loadContent } from './content.mjs';
import * as P from './pages.mjs';
import { REDIRECTS, REQUESTS, SITE } from './site.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const PHOTOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photos.json'), 'utf8'));

const { C: raw, from } = await loadContent();
const now = Date.now();

// ── article bodies: keep safe markup only (the ERP is open during testing), and size the photos
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'a', 'em', 'strong', 'b', 'i', 'br', 'hr', 'div', 'span', 'iframe']);
function cleanBody(html = '') {
    let h = String(html)
        .replace(/<(script|style|object|embed|form|input|button|textarea|select)[\s\S]*?<\/\1>/gi, '')
        .replace(/<(script|style|object|embed|link|meta|base)[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"');
    h = h.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, name) => (ALLOWED.has(name.toLowerCase()) ? tag : ''));
    // only video embeds from YouTube / Vimeo
    h = h.replace(/<iframe[^>]*src="([^"]+)"[^>]*>(<\/iframe>)?/gi, (m, src) => (/^https:\/\/(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com)\//.test(src)
        ? `<div class="j-video"><iframe src="${src}" title="Video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>` : ''));
    // site photos get their size and a small version; uploads carry data-w / data-h / data-sm from the ERP
    h = h.replace(/<img\b([^>]*)>/gi, (m, attrs) => {
        const src = (attrs.match(/src="([^"]+)"/) || [])[1] || '';
        const alt = (attrs.match(/alt="([^"]*)"/) || [])[1] || '';
        const loc = src.match(/^\/img\/([a-z]+)\/([^/.]+?)(-sm)?\.webp$/);
        let w = (attrs.match(/data-w="(\d+)"/) || [])[1], hh = (attrs.match(/data-h="(\d+)"/) || [])[1], sm = (attrs.match(/data-sm="([^"]+)"/) || [])[1];
        if (loc) { const p = PHOTOS[loc[1]]?.find((x) => x.src === loc[2]); if (p) { w = p.w; hh = p.h; sm = `/img/${loc[1]}/${loc[2]}-sm.webp`; } }
        return `<img src="${src}"${sm ? ` srcset="${sm} 760w, ${src} ${w || 1600}w" sizes="(max-width: 900px) 100vw, 900px"` : ''}${w && hh ? ` width="${w}" height="${hh}"` : ''} alt="${alt}" loading="lazy" decoding="async">`;
    });
    return h;
}

const posts = (raw.JOURNAL || [])
    .filter((a) => a.status === 'published' && a.slug && Date.parse(a.publishAt || 0) <= now)
    .sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt))
    .map((a) => ({ ...a, bodyHtml: cleanBody(a.body) }));
const services = raw.SERVICES.filter((s) => !s.boudoir || raw.SETTINGS.showBoudoir);

const C = { ...raw, SITE, REQUESTS, FIREBASE, VERSION: now.toString(36), services, posts };

// ── write it all
const out = [
    P.home(C), P.portfolio(C), ...services.map((s, i) => P.service(C, s, i)), P.experience(C), P.pricing(C), P.about(C), P.reviews(C), P.contact(C),
    P.journalIndex(C), ...C.JOURNAL_CATEGORIES.filter((c) => posts.some((a) => a.category === c.slug)).map((c) => P.journalCategory(C, c)),
    ...posts.map((a) => P.article(C, a)), P.articleLive(C),
];
for (const { path, html } of out) { const dir = join(PUB, path); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'index.html'), html); }
writeFileSync(join(PUB, '404.html'), P.notFound(C).html);

// sitemap (live pages only), robots
const listed = out.map((o) => o.path).filter((p) => p !== '/journal/story/');
const lastmod = (p) => { const a = posts.find((x) => `/journal/${x.slug}/` === p); return (a ? (a.updatedAt || a.publishAt) : new Date().toISOString()).slice(0, 10); };
writeFileSync(join(PUB, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);

// firebase.json: old addresses → new pages, and new Journal stories (not built yet) → the live story page
const fbPath = join(ROOT, 'firebase.json');
const fb = JSON.parse(readFileSync(fbPath, 'utf8'));
fb.hosting.redirects = REDIRECTS.map(([source, destination]) => ({ source, destination, type: 301 }));
fb.hosting.rewrites = [{ regex: '^/journal/[a-z0-9-]+/?$', destination: '/journal/story/index.html' }];
writeFileSync(fbPath, `${JSON.stringify(fb, null, 2)}\n`);

// the ERP reads the same Firebase settings
if (existsSync(join(PUB, 'admin'))) writeFileSync(join(PUB, 'admin', 'firebase-config.js'), `// written by scripts/build.mjs from firebase/config.json\nexport const FIREBASE = ${JSON.stringify(FIREBASE, null, 2)};\n`);

console.log(`Built ${out.length} pages · ${posts.length} journal stories · ${services.reduce((s, x) => s + x.gallery.length, 0)} gallery photos · content: seed${from.erp.length ? ` + ERP (${from.erp.join(', ')})` : ''}.`);
