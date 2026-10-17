// The Journal: list, write, schedule and publish stories (brief section 9).
import { FS, SEED, clean, db, getContent, listAll, markChanged, stamp } from '../fb.js';
import { confirmBox, dbError, esc, fmt, form, h, modal, pickPhotos, slugify, strip, toast } from '../ui.js';

let tab = 'all';
const stateOf = (a) => (a.status !== 'published' ? 'draft' : Date.parse(a.publishAt) > Date.now() ? 'scheduled' : 'live');
const badge = (a) => ({ draft: h('span.badge', 'Draft'), scheduled: h('span.badge.badge--blue', 'Scheduled'), live: h('span.badge.badge--ok', 'Published') })[stateOf(a)];

export async function render(view, rest) {
    let list, error = null;
    try { list = await listAll('firefly_journal'); } catch (e) { list = []; error = e; }
    const cats = (await getContent('categories')).value || SEED.JOURNAL_CATEGORIES;
    if (rest) return editor(view, rest === 'new' ? null : list.find((a) => a.id === rest), list, cats);

    const seedOnly = !error && !list.length;
    const shown = (seedOnly || error ? SEED.JOURNAL : list).filter((a) => tab === 'all' || stateOf(a) === tab).sort((a, b) => (b.publishAt || b.updatedAt || '').localeCompare(a.publishAt || a.updatedAt || ''));
    view.replaceChildren(
        error ? h('div.note.note--bad', 'The Journal needs the Firefly database rules deployed to save stories (Settings → System). Below are the starting stories that are on the website now.') : null,
        seedOnly ? h('div.note', h('strong', 'The website shows 4 starting stories. '), 'Bring them into the ERP to edit them (they stay exactly as they are). ',
            h('button.btn.btn--primary.btn--sm', { type: 'button', on: { click: async () => {
                try { for (const a of SEED.JOURNAL) await FS.addDoc(FS.collection(db, 'firefly_journal'), clean({ ...a, ...stamp() })); toast('The starting stories are in the ERP now.'); render(view); } catch (e) { dbError(e, 'Importing'); }
            } } }, 'Bring them in')) : null,
        h('div.row.row--between', { style: { margin: '14px 0' } },
            h('div.tabs', { style: { margin: 0 } }, ...[['all', 'All'], ['live', 'Published'], ['scheduled', 'Scheduled'], ['draft', 'Drafts']].map(([k, n]) => h(`button.tab${tab === k ? '.on' : ''}`, { type: 'button', on: { click: () => { tab = k; render(view); } } }, n))),
            h('a.btn.btn--primary', { href: '#/journal/new' }, '✎ Write a new story')),
        h('div.card', shown.length ? h('table.table',
            h('thead', h('tr', h('th', ''), h('th', 'Story'), h('th.hide-sm', 'Category'), h('th', 'Status'), h('th.hide-sm', 'Date'))),
            h('tbody', ...shown.map((a) => h(`tr${a.id ? '.click' : ''}`, { on: { click: () => { if (a.id) location.hash = `#/journal/${a.id}`; else toast('Bring the starting stories in first (button above).'); } } },
                h('td', { style: { width: '70px' } }, a.cover ? h('img', { src: a.cover.sm || a.cover.src, alt: '', style: { width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' } }) : null),
                h('td', h('strong', a.title || '(untitled)'), h('div.muted', `/journal/${a.slug || ''}/`)),
                h('td.hide-sm', (cats.find((c) => c.slug === a.category) || {}).name || '—'), h('td', badge(a)), h('td.muted.hide-sm', fmt(a.publishAt || a.updatedAt)))))) : h('p.empty', 'No stories here yet.')),
        h('div.card', h('h2', 'Categories'), h('p.muted', { style: { margin: '6px 0 12px' } }, 'Each category gets its own page on the website (only once it has a published story).'),
            h('a.btn.btn--ghost', { href: '#/pages/categories' }, 'Edit categories')));
}

function editor(view, a, list, cats) {
    const isNew = !a;
    const d = structuredClone(a || { title: '', slug: '', category: cats[0]?.slug || '', status: 'draft', publishAt: new Date().toISOString(), excerpt: '', seoTitle: '', seoDescription: '', cover: null, gallery: [], body: '<p></p>' });
    let slugTouched = !!d.slug;

    // ── the writing area
    const area = h('div.editor__area', { contenteditable: 'true', html: d.body || '<p></p>', spellcheck: 'true' });
    let saved = null;
    const keep = () => { const s = getSelection(); if (s.rangeCount && area.contains(s.anchorNode)) saved = s.getRangeAt(0).cloneRange(); };
    area.addEventListener('keyup', keep); area.addEventListener('mouseup', keep); area.addEventListener('blur', keep);
    const restore = () => { area.focus(); if (saved) { const s = getSelection(); s.removeAllRanges(); s.addRange(saved); } };
    const cmd = (c, v) => { restore(); document.execCommand(c, false, v); keep(); };
    const insert = (html) => { restore(); document.execCommand('insertHTML', false, html); keep(); };
    const figure = (p, cls = '') => `<figure${cls ? ` class="${cls}"` : ''}><img src="${esc(p.src)}" alt="${esc(p.alt || '')}"${p.w ? ` data-w="${p.w}" data-h="${p.h}"` : ''}${p.sm ? ` data-sm="${esc(p.sm)}"` : ''}></figure><p><br></p>`;
    const askAlt = async (p) => { const alt = prompt('Describe this photo in a few words (helps Google and screen readers):', p.alt || ''); return { ...p, alt: alt ?? p.alt ?? '' }; };
    const bar = h('div.editor__bar',
        ...[['¶ Text', () => cmd('formatBlock', 'p')], ['H2 Heading', () => cmd('formatBlock', 'h2')], ['H3', () => cmd('formatBlock', 'h3')],
            ['B', () => cmd('bold')], ['I', () => cmd('italic')],
            ['🔗 Link', () => { const u = prompt('Link to (a full address, or /pricing/ for a page on this site):'); if (u) cmd('createLink', u); }],
            ['❝ Quote', () => cmd('formatBlock', 'blockquote')], ['• List', () => cmd('insertUnorderedList')], ['1. List', () => cmd('insertOrderedList')],
            ['Intro paragraph', () => { cmd('formatBlock', 'p'); const s = getSelection(); const p = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement).closest('p'); if (p && area.contains(p)) p.classList.toggle('j-lead'); }],
            ['🖼 Photo', async () => { keep(); const [p] = await pickPhotos(); if (p) insert(figure(await askAlt(p))); }],
            ['🖼 Wide photo', async () => { keep(); const [p] = await pickPhotos(); if (p) insert(figure(await askAlt(p), 'j-wide')); }],
            ['🖼🖼 Two photos', async () => { keep(); const ps = await pickPhotos({ multiple: true, title: 'Choose two photos' }); if (ps.length >= 2) insert(`<div class="j-duo">${figure(ps[0]).replace('<p><br></p>', '')}${figure(ps[1]).replace('<p><br></p>', '')}</div><p><br></p>`); else if (ps.length) toast('Choose two photos for a pair.'); }],
            ['▶ Video', () => { const u = prompt('Paste a YouTube or Vimeo link:'); if (!u) return; const yt = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/), vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/); const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}` : vm ? `https://player.vimeo.com/video/${vm[1]}` : ''; if (!src) return toast('That doesn’t look like a YouTube or Vimeo link.', 'error'); insert(`<div class="j-video"><iframe src="${src}" title="Video"></iframe></div><p><br></p>`); }],
            ['↶ Undo', () => cmd('undo')], ['Clear formatting', () => cmd('removeFormat')]]
            .map(([n, fn]) => h('button', { type: 'button', on: { mousedown: (e) => e.preventDefault(), click: fn } }, n)));
    // pasted text arrives clean (no fonts or colors from Word/Google Docs)
    area.addEventListener('paste', (e) => { e.preventDefault(); const t = e.clipboardData.getData('text/plain'); document.execCommand('insertHTML', false, t.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')); });

    // ── the side panel
    const title = h('input', { value: d.title, placeholder: 'Story title', style: { fontFamily: 'var(--serif)', fontSize: '30px', border: 0, padding: '6px 0', background: 'transparent' }, on: { input: (e) => { d.title = e.target.value; if (!slugTouched) { d.slug = slugify(d.title); slug.value = d.slug; } preview(); } } });
    const slug = h('input', { value: d.slug, on: { input: (e) => { slugTouched = true; d.slug = slugify(e.target.value); preview(); } } });
    const status = h('select', h('option', { value: 'draft', selected: d.status !== 'published' }, 'Draft (not on the website)'), h('option', { value: 'published', selected: d.status === 'published' }, 'Published (or scheduled)'));
    const local = (iso) => { const t = new Date(iso || Date.now()); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 16); };
    const when = h('input', { type: 'datetime-local', value: local(d.publishAt) });
    const cat = h('select', ...cats.map((c) => h('option', { value: c.slug, selected: d.category === c.slug }, c.name)));
    const meta = form([
        { key: 'excerpt', label: 'Short summary', type: 'textarea', rows: 3, help: 'Shown on the Journal cards.' },
        { key: 'cover', label: 'Cover photo', type: 'photo', help: 'The big photo at the top of the story.' },
        { key: 'gallery', label: 'Photo gallery at the end (optional)', type: 'photos', lead: 3 },
        { key: 'seoTitle', label: 'Google title', count: true, max: 70, help: 'About 50–60 characters. Leave empty to use the story title.' },
        { key: 'seoDescription', label: 'Google description', type: 'textarea', rows: 3, help: 'About 140–160 characters: what the reader will get.' },
    ], d);
    const gp = h('div.gpreview');
    const preview = () => {
        const m = meta.read();
        gp.replaceChildren(h('div.gpreview__url', `fireflyphotography.org › journal › ${d.slug || 'your-story'}`), h('div.gpreview__title', (m.seoTitle || d.title || 'Your story title').slice(0, 70)), h('div.gpreview__desc', (m.seoDescription || m.excerpt || 'Your description shows here.').slice(0, 165)));
    };
    meta.addEventListener('input', preview); preview();

    const collect = () => {
        const m = meta.read();
        return clean({ ...d, ...m, title: d.title.trim(), slug: d.slug || slugify(d.title), category: cat.value, status: status.value,
            publishAt: new Date(when.value || Date.now()).toISOString(), body: area.innerHTML, cover: m.cover ? strip(m.cover) : null, gallery: (m.gallery || []).map(strip), ...stamp() });
    };
    const save = async (asStatus) => {
        if (asStatus) status.value = asStatus;
        const x = collect();
        if (!x.title) return toast('Give the story a title first.', 'error');
        if (list.some((o) => o.slug === x.slug && o.id !== a?.id)) return toast('Another story already uses that web address — change the URL.', 'error');
        if (x.status === 'published' && !x.cover) return toast('Add a cover photo before publishing.', 'error');
        delete x.id;
        try {
            if (a?.id) await FS.setDoc(FS.doc(db, 'firefly_journal', a.id), x);
            else { const ref = await FS.addDoc(FS.collection(db, 'firefly_journal'), x); a = { id: ref.id }; list.push({ id: ref.id, ...x }); history.replaceState(null, '', `#/journal/${ref.id}`); }
            await markChanged('journal');
            toast(x.status === 'published' ? (Date.parse(x.publishAt) > Date.now() ? `Scheduled for ${fmt(x.publishAt)}. Press “Publish to website” so it goes live on time.` : 'Saved. Press “Publish to website” (top right) to put it live.') : 'Draft saved.');
        } catch (e) { dbError(e); }
    };
    const previewWin = () => {
        const x = collect();
        const w = window.open('', '_blank');
        if (!w) return toast('Allow pop-ups to see the preview.', 'error');
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview: ${esc(x.title)}</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css"></head><body><p style="position:fixed;z-index:9;left:0;right:0;bottom:0;margin:0;padding:10px;text-align:center;background:#f1d79f;font:600 13px Manrope,sans-serif">Preview — not on the website until it’s published</p><article class="art"><header class="art-hero">${x.cover ? `<img class="art-hero__bg" src="${esc(x.cover.src)}" alt="">` : ''}<div class="page-hero__shade"></div><div class="wrap art-hero__copy"><p class="eyebrow">The Journal</p><h1>${esc(x.title)}</h1><p class="art-hero__meta">By Shelly Bowman · ${new Date(x.publishAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div></header><div class="art-body">${x.body}</div></article></body></html>`);
        w.document.close();
    };

    view.replaceChildren(
        h('div.row.row--between', { style: { marginBottom: '12px' } }, h('a', { href: '#/journal' }, '← All stories'), a ? badge(a) : h('span.badge', 'New story')),
        h('div.split',
            h('div.stack', title, h('div.editor', bar, area), h('p.muted', 'Tips: paste text from anywhere (formatting is cleaned up). Use H2 for section headings so Google understands the story. Every photo asks for a short description.')),
            h('div.stack',
                h('div.card.stack',
                    h('label.field', h('span.field__label', 'Status'), status),
                    h('label.field', h('span.field__label', h('span', 'Publish date & time'), h('small', 'A future time = scheduled.')), when),
                    h('label.field', h('span.field__label', 'Category'), cat),
                    h('label.field', h('span.field__label', h('span', 'Web address'), h('small', '/journal/<this>/')), slug),
                    h('div.row', h('button.btn.btn--ghost', { type: 'button', on: { click: () => save('draft') } }, 'Save draft'), h('button.btn.btn--primary', { type: 'button', on: { click: () => save('published') } }, isNew || a?.status !== 'published' ? 'Publish' : 'Update'), h('button.btn.btn--ghost', { type: 'button', on: { click: previewWin } }, 'Preview'))),
                h('div.card.stack', meta, h('div.field__label', 'How it may look on Google'), gp),
                a?.id ? h('button.btn.btn--ghost', { type: 'button', on: { click: async () => {
                    if (!(await confirmBox('Delete this story?', `“${d.title}” will be removed from the ERP, and from the website at the next publish.`, { ok: 'Delete', danger: true }))) return;
                    try { await FS.deleteDoc(FS.doc(db, 'firefly_journal', a.id)); await markChanged('journal'); toast('Story deleted.'); location.hash = '#/journal'; } catch (e) { dbError(e, 'Deleting'); }
                } } }, 'Delete this story') : null)));
}
