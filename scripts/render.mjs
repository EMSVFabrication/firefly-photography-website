// The whole website as files in memory: { files: { 'index.html': '…', … }, hosting } — no disk writes.
// Used by scripts/build.mjs (this PC) and by the Publish function (functions-firefly), so both make the same site.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIREBASE, loadContent } from './content.mjs';
import * as P from './pages.mjs';
import { REDIRECTS, REQUESTS, SEED, SITE } from './site.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PHOTOS = JSON.parse(readFileSync(join(HERE, 'photos.json'), 'utf8'));
const FIREBASE_DIR = join(HERE, '..', 'firebase');

// ── article bodies: keep safe markup only (the ERP is open during testing), and size the photos
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'a', 'em', 'strong', 'b', 'i', 'br', 'hr', 'div', 'span', 'iframe']);
export function cleanBody(html = '') {
    let h = String(html)
        .replace(/<(script|style|object|embed|form|input|button|textarea|select)[\s\S]*?<\/\1>/gi, '')
        .replace(/<(script|style|object|embed|link|meta|base)[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"');
    h = h.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, name) => (ALLOWED.has(name.toLowerCase()) ? tag : ''));
    // only video embeds from YouTube / Vimeo (the ERP wraps them in a j-video box; the build makes its own)
    h = h.replace(/<div class="j-video"[^>]*>\s*(<iframe[\s\S]*?<\/iframe>)\s*<\/div>/gi, '$1');
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

/** Firebase Hosting settings for the site (firebase.json "hosting" + the Publish function's version config) */
export function hostingConfig() {
    return {
        cleanUrls: true, trailingSlash: true,
        headers: [
            { source: '/img/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
            { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
            { source: '/admin/**', headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
        ],
        redirects: REDIRECTS.map(([source, destination]) => ({ source, destination, type: 301 })),
        // new Journal stories published since the last build → the page that draws them from the database
        rewrites: [{ regex: '^/journal/[a-z0-9-]+/?$', destination: '/journal/story/index.html' }],
    };
}

export async function renderSite() {
    const FILE_FIREBASE = { ...FIREBASE }; // before a Firebase move pointer is followed
    const { C: raw, from } = await loadContent();
    const now = Date.now();
    const posts = (raw.JOURNAL || [])
        .filter((a) => a.status === 'published' && a.slug && Date.parse(a.publishAt || 0) <= now)
        .sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt))
        .map((a) => ({ ...a, bodyHtml: cleanBody(a.body) }));
    const scheduled = (raw.JOURNAL || []).filter((a) => a.status === 'published' && Date.parse(a.publishAt || 0) > now).map((a) => a.publishAt).sort();
    const services = raw.SERVICES.filter((s) => !s.boudoir || raw.SETTINGS.showBoudoir);
    const C = { ...raw, SITE, REQUESTS, FIREBASE, VERSION: now.toString(36), services, posts };

    const pages = [
        P.home(C), P.portfolio(C), ...services.map((s, i) => P.service(C, s, i)), P.experience(C), P.pricing(C), P.about(C), P.reviews(C), P.contact(C),
        P.journalIndex(C), ...C.JOURNAL_CATEGORIES.filter((c) => posts.some((a) => a.category === c.slug)).map((c) => P.journalCategory(C, c)),
        ...posts.map((a) => P.article(C, a)), P.articleLive(C),
    ];
    const files = {};
    for (const { path, html } of pages) files[`${path.replace(/^\//, '')}index.html`] = html;
    files['404.html'] = P.notFound(C).html;

    // sitemap (live pages only), robots
    const listed = pages.map((o) => o.path).filter((p) => p !== '/journal/story/');
    const lastmod = (p) => { const a = posts.find((x) => `/journal/${x.slug}/` === p); return (a ? (a.updatedAt || a.publishAt) : new Date().toISOString()).slice(0, 10); };
    files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}\n</urlset>\n`;
    files['robots.txt'] = `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`;

    // the ERP: the same Firebase settings, the starting content (shown until something is saved), the site's own photos
    // (for the photo picker) and the rules (Settings → System, for a new project)
    files['admin/firebase-config.js'] = `// written by scripts/render.mjs from firebase/config.json\nexport const FIREBASE = ${JSON.stringify(FILE_FIREBASE, null, 2)};\n`;
    const library = Object.fromEntries(Object.entries(PHOTOS).map(([set, list]) => [set, list.map((p) => ({ src: `/img/${set}/${p.src}.webp`, sm: `/img/${set}/${p.src}-sm.webp`, w: p.w, h: p.h, alt: '' }))]));
    files['admin/seed.json'] = JSON.stringify({ ...SEED, PHOTOS: library });
    for (const r of ['firestore.rules', 'storage.rules']) files[`admin/rules/${r}`] = readFileSync(join(FIREBASE_DIR, r), 'utf8');

    return { files, hosting: hostingConfig(), from, stats: { pages: pages.length, posts: posts.length, photos: services.reduce((s, x) => s + x.gallery.length, 0), nextScheduled: scheduled[0] || null } };
}
