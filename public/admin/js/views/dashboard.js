// Dashboard: what needs attention, the numbers, and the launch checklist.
import { AUTH_REQUIRED } from '../config.js';
import { CONFIG, FS, SEED, db, getContent, listAll } from '../fb.js';
import { fmt, h } from '../ui.js';

export async function render(view) {
    const safe = (p) => p.catch(() => null);
    const [inq, journal, media, reviews, settings, pub] = await Promise.all([
        safe(listAll('firefly_inquiries')), safe(listAll('firefly_journal')), safe(listAll('firefly_media')), safe(listAll('firefly_reviews')),
        getContent('settings'), safe(FS.getDoc(FS.doc(db, 'firefly_meta', 'publish')).then((s) => s.data() || {})),
    ]);
    const connected = inq !== null;
    const S = settings.value || {};
    const now = Date.now();
    const posts = journal || [];
    const live = posts.filter((a) => a.status === 'published' && Date.parse(a.publishAt) <= now).length;
    const scheduled = posts.filter((a) => a.status === 'published' && Date.parse(a.publishAt) > now).length;
    const drafts = posts.filter((a) => a.status !== 'published').length;
    const newInq = (inq || []).filter((x) => x.status === 'new');

    const stat = (n, label, href) => h('a.stat', { href }, h('strong', n), h('span', label));
    const todo = [
        [connected, 'Firefly database rules deployed', 'The ERP can only save once the Firefly rules are live in Firebase. Settings → System.'],
        [!!pub?.publishedAt, 'Website published from the ERP at least once', 'Use “Publish to website” (top right) after making changes.'],
        [!!S.googleReviewsUrl && !!S.googleWriteReviewUrl, 'Google review links added', 'Settings → Website & Google: “Read reviews” and “Leave a review” links from the Business Profile.'],
        [!!S.gaId, 'Google Analytics connected', 'Settings → Website & Google: your GA4 measurement ID (G-…).'],
        [!!S.gscVerification, 'Google Search Console verified', 'Settings → Website & Google: the HTML-tag verification code.'],
        [false, 'Shelly confirms prices, packages and photo permissions', 'Pricing screen — nothing was changed from the old site.'],
        [CONFIG.projectId !== 'bic-dev-e2618', 'Moved to Shelly’s own Firebase', 'Settings → Move Firebase (before launch).'],
        [AUTH_REQUIRED, 'ERP sign-in switched on', 'At launch (see the How-to guide → Launch).'],
    ];
    view.replaceChildren(
        connected ? null : h('div.note.note--bad', h('strong', 'Not connected to the database yet. '), 'You can look around and everything shows the starting content, but saving needs the Firefly database rules deployed (Settings → System).'),
        h('div.cards', { style: { marginTop: connected ? 0 : '16px' } },
            stat(newInq.length, 'new inquiries', '#/inquiries'),
            stat(live, `published stories${scheduled ? ` · ${scheduled} scheduled` : ''}${drafts ? ` · ${drafts} drafts` : ''}`, '#/journal'),
            stat((reviews && reviews.length) || SEED.REVIEWS.length, 'Google reviews shown', '#/reviews'),
            stat((media || []).length, 'uploaded photos', '#/photos')),
        h('div.split', { style: { marginTop: '20px' } },
            h('div.card', h('div.card__head', h('h2', 'Latest inquiries'), h('a', { href: '#/inquiries' }, 'All inquiries →')),
                (inq || []).length ? h('table.table', h('tbody', ...(inq || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6).map((x) =>
                    h('tr.click', { on: { click: () => { location.hash = `#/inquiries/${x.id}`; } } }, h('td', h('strong', x.name), h('div.muted', x.session)), h('td.hide-sm', x.date || '—'), h('td', x.status === 'new' ? h('span.badge.badge--new', 'New') : h('span.badge', x.status)), h('td.muted.hide-sm', fmt(x.createdAt)))))) : h('p.empty', connected ? 'No inquiries yet. They appear here the moment someone sends the form.' : 'Inquiries show here once the database is connected.')),
            h('div.card', h('h2', 'Before launch'), h('ul.stack', { style: { listStyle: 'none', padding: 0, marginTop: '14px' } },
                ...todo.map(([ok, title, help]) => h('li', h('div.row', h('span.badge', { class: `badge ${ok ? 'badge--ok' : 'badge--warn'}` }, ok ? 'Done' : 'To do'), h('strong', title)), h('p.muted', help)))))),
        h('div.card', h('h2', 'Quick actions'), h('div.row', { style: { marginTop: '12px' } },
            h('a.btn.btn--primary', { href: '#/journal/new' }, '✎ Write a Journal story'),
            h('a.btn.btn--ghost', { href: '#/portfolio' }, '▦ Add photos to a gallery'),
            h('a.btn.btn--ghost', { href: '#/pages/home' }, '❡ Change homepage photos'),
            h('a.btn.btn--ghost', { href: '#/pricing' }, '$ Update pricing'),
            h('a.btn.btn--ghost', { href: '/', target: '_blank' }, 'View the website ↗'))));
}
