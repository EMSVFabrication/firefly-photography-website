// Google reviews shown on the site: feature, order, topics; add new ones exactly as written on Google.
// (Automatic sync from the Google Business Profile is set up in Settings → Website & Google once Google approves access.)
import { FS, SEED, clean, db, getContent, listAll, markChanged, stamp } from '../fb.js';
import { confirmBox, dbError, h, modal, slugify, toast } from '../ui.js';

const TAGS = [['experience', 'The experience'], ['weddings', 'Weddings'], ['elopements', 'Elopements'], ['families', 'Families'], ['seniors', 'Seniors'], ['newborns', 'Newborns'], ['maternity', 'Maternity'], ['headshots', 'Headshots'], ['boudoir', 'Boudoir']];

export async function render(view) {
    let list, error = null;
    try { list = (await listAll('firefly_reviews')).sort((a, b) => (a.order ?? 999) - (b.order ?? 999)); } catch (e) { list = []; error = e; }
    const settings = (await getContent('settings')).value;
    const seedOnly = !error && !list.length;
    const rows = seedOnly ? SEED.REVIEWS : list;
    const save = async (r) => { const { id, ...rest } = r; await FS.setDoc(FS.doc(db, 'firefly_reviews', id), clean({ ...rest, ...stamp() })); await markChanged('reviews'); };
    const edit = (r) => {
        const isNew = !r;
        r = structuredClone(r || { id: '', name: '', rating: 5, text: '', tags: [], featured: false, source: 'google', date: '' });
        const name = h('input', { value: r.name }), text = h('textarea', { rows: 6, value: r.text }), rating = h('select', ...[5, 4, 3, 2, 1].map((n) => h('option', { value: n, selected: r.rating === n }, '★'.repeat(n))));
        const date = h('input', { value: r.date || '', placeholder: 'e.g. 2026-09-12 (optional)' });
        const feat = h('input', { type: 'checkbox', checked: !!r.featured }), hid = h('input', { type: 'checkbox', checked: !!r.hidden });
        const tags = TAGS.map(([k, n]) => h('label.check', h('input', { type: 'checkbox', checked: (r.tags || []).includes(k), 'data-k': k }), h('span', n)));
        modal(isNew ? 'Add a Google review' : `Review by ${r.name}`, (close) => h('div.stack',
            isNew ? h('div.note', 'Copy the review from Google exactly as written — the website must always show genuine Google feedback.') : null,
            h('label.field', h('span.field__label', 'Reviewer name (as on Google)'), name),
            h('label.field', h('span.field__label', 'Stars'), rating),
            h('label.field', h('span.field__label', 'Review text (word for word)'), text),
            h('label.field', h('span.field__label', 'Date'), date),
            h('div.field', h('span.field__label', h('span', 'Topics'), h('small', 'Which service pages show it. “The experience” = about feeling comfortable / having fun.')), h('div.row', ...tags)),
            h('label.check', feat, h('span', 'Feature it (homepage carousel and About page)')),
            h('label.check', hid, h('span', 'Hide it from the website')),
            h('div.row.row--between',
                !isNew ? h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { if (!(await confirmBox('Delete this review from the website?', 'It stays on Google, of course.', { ok: 'Delete', danger: true }))) return; try { await FS.deleteDoc(FS.doc(db, 'firefly_reviews', r.id)); await markChanged('reviews'); close(); render(view); } catch (e) { dbError(e, 'Deleting'); } } } }, 'Delete') : h('span'),
                h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                    Object.assign(r, { name: name.value.trim(), text: text.value.trim(), rating: +rating.value, date: date.value.trim(), featured: feat.checked, hidden: hid.checked, tags: tags.map((t) => t.querySelector('input')).filter((i) => i.checked).map((i) => i.dataset.k) });
                    if (!r.name || !r.text) return toast('Add the reviewer’s name and the review text.', 'error');
                    if (!r.id) { r.id = `${slugify(r.name)}-${Date.now().toString(36)}`; r.order = list.length; }
                    try { await save(r); close(); toast('Saved. Press “Publish to website” when you’re ready.'); render(view); } catch (e) { dbError(e); }
                } } }, 'Save'))));
    };
    const move = async (i, d) => { const j = i + d; [list[i], list[j]] = [list[j], list[i]]; try { await Promise.all(list.map((r, k) => FS.updateDoc(FS.doc(db, 'firefly_reviews', r.id), { order: k }))); await markChanged('reviews'); render(view); } catch (e) { dbError(e); } };
    view.replaceChildren(
        error ? h('div.note.note--bad', 'Reviews need the database rules deployed (Settings → System). Showing the reviews that are on the website now.') : null,
        seedOnly ? h('div.note', h('strong', 'The website shows the 8 Google reviews from the old site. '), 'Bring them into the ERP to feature, reorder or tag them. ',
            h('button.btn.btn--primary.btn--sm', { type: 'button', on: { click: async () => {
                try { await Promise.all(SEED.REVIEWS.map((r, i) => save({ ...r, order: i, source: 'google' }))); toast('Reviews are in the ERP now.'); render(view); } catch (e) { dbError(e, 'Importing'); }
            } } }, 'Bring them in')) : null,
        h('div.card', { style: { marginTop: '14px' } },
            h('div.card__head', h('div', h('h2', 'On the website'), h('p.muted', `Rating shown: ${settings.googleRating} ★ from ${settings.googleReviewCount} reviews — change it in Settings → Website & Google (until the automatic Google sync is connected).`)),
                !seedOnly && !error ? h('button.btn.btn--primary', { type: 'button', on: { click: () => edit(null) } }, '+ Add a review') : null),
            h('table.table', h('tbody', ...rows.map((r, i) => h(`tr${seedOnly ? '' : '.click'}`, { on: { click: (e) => { if (!seedOnly && !e.target.closest('button')) edit(r); } } },
                h('td', h('strong', r.name), ' ', h('span', { style: { color: '#c99d4e' } }, '★'.repeat(r.rating || 5)), h('p.muted', `${String(r.text).slice(0, 160)}${r.text.length > 160 ? '…' : ''}`)),
                h('td', { style: { whiteSpace: 'nowrap' } }, r.featured ? h('span.badge.badge--ok', 'Featured') : null, ' ', r.hidden ? h('span.badge.badge--bad', 'Hidden') : null),
                !seedOnly ? h('td', { style: { whiteSpace: 'nowrap' } }, h('button.icon-btn', { type: 'button', title: 'Move up', disabled: i === 0, on: { click: () => move(i, -1) } }, '↑'), h('button.icon-btn', { type: 'button', title: 'Move down', disabled: i === rows.length - 1, on: { click: () => move(i, 1) } }, '↓')) : null))))));
}
