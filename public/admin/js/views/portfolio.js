// Portfolio & services: one page per specialty — its text, cover, gallery, mood, package and Google wording.
import { getContent, saveContent } from '../fb.js';
import { confirmBox, dbError, form, h, slugify, toast } from '../ui.js';

const SCHEMA = (packages) => [
    { key: 'name', label: 'Name', help: 'As shown in the menu, e.g. “Families”.' },
    { key: 'long', label: 'Full name', help: 'e.g. “Family Photography”.' },
    { key: 'cover', label: 'Cover photo', type: 'photo', required: true, help: 'The big photo at the top of the page and on the homepage tile.' },
    { key: 'gallery', label: 'Gallery', type: 'photos', alts: true, help: 'Drag to reorder. The first five make the big editorial spread. Add a short description to each photo for Google.' },
    { key: 'kicker', label: 'Small label above the headline' },
    { key: 'headline', label: 'Headline', type: 'rich', rows: 2 },
    { key: 'intro', label: 'Introduction', type: 'textarea', rows: 4 },
    { key: 'experience', label: 'What the experience includes', type: 'list', multiline: true },
    { key: 'mood', label: 'Mood of the page', type: 'select', options: [['romantic', 'Romantic & cinematic'], ['warm', 'Warm & authentic'], ['bold', 'Contemporary & bold (dark gallery)'], ['intimate', 'Intimate & timeless']] },
    { key: 'process', label: 'Which process applies', type: 'select', options: [['portrait', 'Portrait (proof gallery + 15 favorites)'], ['wedding', 'Wedding / elopement']] },
    { key: 'package', label: 'Package shown on this page', type: 'select', options: [['', '— none —'], ...packages.map((p) => [p.id, `${p.name} (${p.price})`])] },
    { key: 'privateGallery', label: 'Keep the gallery private (show “shared privately” instead of photos)', type: 'bool' },
    { key: 'seo', label: 'Google', type: 'group', fields: [
        { key: 'title', label: 'Google title', count: true, max: 70 },
        { key: 'description', label: 'Google description', type: 'textarea', rows: 3 },
        { key: 'keyword', label: 'Main search phrase', help: 'e.g. “Denver family photographer” — shown small at the top of the page.' },
    ] },
];

export async function render(view, rest) {
    const [svc, pk, settings] = await Promise.all([getContent('services'), getContent('packages'), getContent('settings')]);
    const services = svc.value;
    if (rest) {
        const i = services.findIndex((s) => s.slug === rest);
        if (i < 0) { location.hash = '#/portfolio'; return; }
        const s = services[i];
        const f = form(SCHEMA(pk.value), s);
        view.replaceChildren(
            h('div.row.row--between', { style: { marginBottom: '12px' } }, h('a', { href: '#/portfolio' }, '← All specialties'), h('a', { href: `/${s.slug}/`, target: '_blank' }, `View /${s.slug}/ ↗`)),
            svc.error ? h('div.note.note--bad', 'Saving needs the database rules deployed (Settings → System).') : null,
            h('div.card', f),
            h('div.savebar', h('span.muted', svc.saved ? `Saved ${new Date(svc.updatedAt).toLocaleString()}` : 'Showing the starting content'),
                h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                    services[i] = { ...s, ...f.read() };
                    try { await saveContent('services', services); toast('Saved. Press “Publish to website” when you’re ready.'); } catch (e) { dbError(e); }
                } } }, 'Save')));
        return;
    }
    const draw = () => view.replaceChildren(
        h('p.muted', { style: { marginBottom: '14px' } }, 'Each specialty has its own page on the website with its gallery, text, package and reviews. The order here is the order in the menu.'),
        svc.error ? h('div.note.note--bad', 'Saving needs the database rules deployed (Settings → System).') : null,
        h('div.card', h('table.table', h('tbody', ...services.map((s, i) => h('tr',
            h('td', { style: { width: '84px' } }, s.cover ? h('img', { src: s.cover.sm || s.cover.src, alt: '', style: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' } }) : null),
            h('td', h('strong', s.name), h('div.muted', `/${s.slug}/ · ${s.privateGallery ? 'private gallery' : `${s.gallery.length} photos`}`), s.boudoir && !settings.value.showBoudoir ? h('span.badge.badge--warn', 'Hidden (Settings)') : null),
            h('td.row.row--end', h('button.icon-btn', { type: 'button', title: 'Move up', disabled: i === 0, on: { click: async () => { [services[i - 1], services[i]] = [services[i], services[i - 1]]; await persist(); } } }, '↑'),
                h('button.icon-btn', { type: 'button', title: 'Move down', disabled: i === services.length - 1, on: { click: async () => { [services[i + 1], services[i]] = [services[i], services[i + 1]]; await persist(); } } }, '↓'),
                h('a.btn.btn--ghost.btn--sm', { href: `#/portfolio/${s.slug}` }, 'Edit')))))),
            h('div.row', { style: { marginTop: '14px' } }, h('button.btn.btn--ghost', { type: 'button', on: { click: add } }, '+ Add a specialty'))));
    const persist = async () => { try { await saveContent('services', services); draw(); } catch (e) { dbError(e); } };
    const add = async () => {
        const name = prompt('Name of the new specialty (e.g. “Pets” or “Engagements”):'); if (!name) return;
        const slug = slugify(name);
        if (services.some((s) => s.slug === slug)) return toast('There is already a specialty with that name.', 'error');
        if (!(await confirmBox('Add a new page?', `This adds a new page at /${slug}/ with an empty gallery. You can fill it in next.`, { ok: 'Add it' }))) return;
        services.push({ slug, name, long: `${name} Photography`, mood: 'warm', package: 'portrait', process: 'portrait', kicker: name, headline: `${name}, <em>beautifully told.</em>`, intro: '', experience: [], cover: services[0].cover, gallery: [],
            seo: { title: `Denver ${name} Photographer | Firefly Photography`, description: `${name} photography by Shelly Bowman in Denver, Littleton and across Colorado.`, keyword: `Denver ${name.toLowerCase()} photographer` } });
        await persist(); location.hash = `#/portfolio/${slug}`;
    };
    draw();
}
