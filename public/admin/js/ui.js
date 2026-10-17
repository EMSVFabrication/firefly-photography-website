// Small UI kit for the ERP: element builder, toasts, dialogs, the photo picker and schema-driven forms.
import { SEED, listAll, uploadPhoto } from './fb.js';

// screens pass optional parts as null/false (e.g. a warning that only sometimes shows): leave those out
const replace = Element.prototype.replaceChildren;
Element.prototype.replaceChildren = function (...kids) { return replace.apply(this, kids.flat(Infinity).filter((k) => k != null && k !== false)); };

/** h('div.class#id', { attrs, on: { click } }, ...children) */
export function h(sel, attrs, ...kids) {
    if (attrs == null || typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs)) { kids.unshift(attrs); attrs = {}; }
    const [, tag = 'div', rest = ''] = sel.match(/^([a-z0-9-]*)(.*)$/i);
    const el = document.createElement(tag || 'div');
    for (const m of rest.matchAll(/([.#])([\w-]+)/g)) m[1] === '.' ? el.classList.add(m[2]) : (el.id = m[2]);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k in el && typeof v !== 'string') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
}
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export function toast(msg, kind = 'ok') {
    const t = h(`div.toast.toast--${kind}`, msg);
    document.body.append(t);
    setTimeout(() => t.classList.add('out'), kind === 'error' ? 6000 : 2800);
    setTimeout(() => t.remove(), kind === 'error' ? 6600 : 3400);
}
export function dbError(e, what = 'Saving') {
    console.error(e);
    const perm = /permission|insufficient/i.test(e?.message || '');
    toast(perm ? `${what} needs the Firefly database rules to be deployed (see Settings → System).` : `${what} didn’t work: ${e?.message || e}`, 'error');
}

/** a dialog; returns { el, close } — content is a node or a function(close) → node */
export function modal(title, content, { wide = false, onClose } = {}) {
    const back = h('div.modal');
    const close = () => { back.remove(); document.removeEventListener('keydown', key); onClose?.(); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    const win = h(`div.modal__win${wide ? '.modal__win--wide' : ''}`, { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div.modal__head', h('h2', title), h('button.icon-btn', { type: 'button', 'aria-label': 'Close', on: { click: close } }, '×')),
        h('div.modal__body', typeof content === 'function' ? content(close) : content));
    back.append(h('div.modal__back', { on: { click: close } }), win);
    document.body.append(back); document.addEventListener('keydown', key);
    win.querySelector('input, textarea, select, button.btn')?.focus();
    return { el: win, close };
}
export function confirmBox(title, message, { ok = 'Yes', danger = false } = {}) {
    return new Promise((resolve) => {
        let done = false;
        const m = modal(title, (close) => h('div.stack',
            typeof message === 'string' ? h('p', message) : message,
            h('div.row.row--end',
                h('button.btn.btn--ghost', { type: 'button', on: { click: () => { done = true; close(); resolve(false); } } }, 'Cancel'),
                h(`button.btn${danger ? '.btn--danger' : '.btn--primary'}`, { type: 'button', on: { click: () => { done = true; close(); resolve(true); } } }, ok))), { onClose: () => { if (!done) resolve(false); } });
        return m;
    });
}

// ── photos
export const BUILTIN = Object.entries(SEED.PHOTOS || {}).flatMap(([set, list]) => list.map((p) => ({ ...p, set })));
export const thumb = (p) => p?.sm || p?.src || '';
export function photoTile(p, { onRemove, onAlt, small = false } = {}) {
    return h(`figure.ptile${small ? '.ptile--sm' : ''}`,
        h('img', { src: thumb(p), alt: p?.alt || '', loading: 'lazy' }),
        onAlt ? h('input.ptile__alt', { value: p?.alt || '', placeholder: 'Describe the photo (alt text)', title: 'Alt text — what’s in the photo, for Google and screen readers', on: { input: (e) => onAlt(e.target.value) } }) : null,
        onRemove ? h('button.ptile__x', { type: 'button', title: 'Remove', 'aria-label': 'Remove photo', on: { click: onRemove } }, '×') : null);
}

/** choose photos from the library / the site's own photos / upload new ones. Resolves to an array of photos (or []). */
export function pickPhotos({ multiple = false, title } = {}) {
    return new Promise((resolve) => {
        let chosen = [], done = false;
        const grid = h('div.pgrid'), status = h('p.muted');
        const tabs = h('div.tabs');
        let lib = [];
        const show = (list) => {
            grid.replaceChildren(...list.map((p) => {
                const t = h('button.pick', { type: 'button', title: p.alt || p.name || '' }, h('img', { src: thumb(p), alt: '', loading: 'lazy' }));
                t.addEventListener('click', () => {
                    if (!multiple) { chosen = [p]; finish(); return; }
                    const i = chosen.indexOf(p); i < 0 ? chosen.push(p) : chosen.splice(i, 1);
                    t.classList.toggle('on', i < 0); count.textContent = `${chosen.length} chosen`;
                });
                return t;
            }));
            if (!list.length) grid.append(h('p.muted', 'Nothing here yet.'));
        };
        const sets = [['library', 'Uploaded photos'], ...Object.keys(SEED.PHOTOS || {}).map((s) => [s, `Site: ${s}`])];
        const pick = async (key) => {
            [...tabs.children].forEach((b) => b.classList.toggle('on', b.dataset.k === key));
            if (key === 'library') {
                status.textContent = 'Loading…';
                try { lib = (await listAll('firefly_media')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')); status.textContent = ''; } catch (e) { lib = []; status.textContent = 'The photo library needs the database rules deployed (Settings → System).'; }
                show(lib);
            } else { status.textContent = ''; show(BUILTIN.filter((p) => p.set === key)); }
        };
        sets.forEach(([k, n]) => tabs.append(h('button.tab', { type: 'button', 'data-k': k, on: { click: () => pick(k) } }, n)));
        const file = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, on: { change: async (e) => {
            const files = [...e.target.files]; if (!files.length) return;
            for (let i = 0; i < files.length; i++) {
                status.textContent = `Preparing and uploading ${i + 1} of ${files.length}…`;
                try { const p = await uploadPhoto(files[i]); lib.unshift(p); chosen.push(p); } catch (err) { dbError(err, 'Uploading'); break; }
            }
            status.textContent = ''; pick('library');
            if (!multiple && chosen.length) finish();
            else count.textContent = `${chosen.length} chosen`;
        } } });
        const count = h('span.muted', multiple ? '0 chosen' : '');
        const finish = () => { done = true; m.close(); resolve(chosen); };
        const m = modal(title || (multiple ? 'Choose photos' : 'Choose a photo'), h('div.stack',
            h('div.row', h('button.btn.btn--primary', { type: 'button', on: { click: () => file.click() } }, '⬆ Upload new photos'), file, status),
            tabs, grid,
            multiple ? h('div.row.row--end', count, h('button.btn.btn--primary', { type: 'button', on: { click: finish } }, 'Use these photos')) : null),
        { wide: true, onClose: () => { if (!done) resolve([]); } });
        pick('library');
    });
}

// ── schema forms: render a value from a schema, edit it in place, read it back with form.value
// field: { key, label, type: text|textarea|rich|number|bool|select|list|photo|photos|group|repeat|date, help, options, fields, itemLabel, rows }
export function form(schema, value) {
    const root = h('div.form');
    const state = { value: structuredClone(value ?? {}) };
    const draw = () => root.replaceChildren(...schema.map((f) => field(f, state.value, draw)));
    draw();
    root.read = () => state.value;
    return root;
}
function labelOf(f) { return h('div.field__label', h('span', f.label), f.help ? h('small', f.help) : null); }
function field(f, obj, redraw) {
    const v = obj[f.key];
    const set = (x) => { obj[f.key] = x; };
    switch (f.type) {
        case 'group': {
            if (!obj[f.key] || typeof obj[f.key] !== 'object') obj[f.key] = {};
            return h('fieldset.group', h('legend', f.label), f.help ? h('p.muted', f.help) : null, ...f.fields.map((x) => field(x, obj[f.key], redraw)));
        }
        case 'repeat': {
            if (!Array.isArray(v)) obj[f.key] = [];
            const list = obj[f.key];
            return h('div.field.repeat', labelOf(f),
                ...list.map((item, i) => h('div.repeat__item',
                    h('div.repeat__bar', h('strong', (f.itemLabel?.(item, i)) || `${f.itemName || 'Item'} ${i + 1}`),
                        h('span.row',
                            h('button.icon-btn', { type: 'button', title: 'Move up', disabled: i === 0, on: { click: () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; redraw(); } } }, '↑'),
                            h('button.icon-btn', { type: 'button', title: 'Move down', disabled: i === list.length - 1, on: { click: () => { [list[i + 1], list[i]] = [list[i], list[i + 1]]; redraw(); } } }, '↓'),
                            h('button.icon-btn.icon-btn--danger', { type: 'button', title: 'Remove', on: { click: async () => { if (await confirmBox('Remove this?', `Remove “${(f.itemLabel?.(item, i)) || 'this item'}”?`, { ok: 'Remove', danger: true })) { list.splice(i, 1); redraw(); } } } }, '×'))),
                    ...f.fields.map((x) => field(x, item, redraw)))),
                h('button.btn.btn--ghost', { type: 'button', on: { click: () => { list.push(structuredClone(f.blank || {})); redraw(); } } }, `+ Add ${f.itemName || 'item'}`));
        }
        case 'list': {
            if (!Array.isArray(v)) obj[f.key] = [];
            const list = obj[f.key];
            return h('div.field', labelOf(f),
                h('div.list', ...list.map((s, i) => h('div.list__row',
                    h(f.multiline ? 'textarea' : 'input', { value: s, rows: 2, on: { input: (e) => { list[i] = e.target.value; } } }),
                    h('button.icon-btn', { type: 'button', title: 'Move up', disabled: i === 0, on: { click: () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; redraw(); } } }, '↑'),
                    h('button.icon-btn.icon-btn--danger', { type: 'button', title: 'Remove', on: { click: () => { list.splice(i, 1); redraw(); } } }, '×'))),
                h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: () => { list.push(''); redraw(); } } }, '+ Add line')));
        }
        case 'photo': {
            return h('div.field', labelOf(f), h('div.row.row--top',
                v ? photoTile(v, { onAlt: (a) => { v.alt = a; } }) : h('div.ptile.ptile--empty', 'No photo'),
                h('div.stack', h('button.btn.btn--ghost', { type: 'button', on: { click: async () => { const [p] = await pickPhotos(); if (p) { set(strip(p)); redraw(); } } } }, v ? 'Change photo' : 'Choose photo'),
                    v && !f.required ? h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: () => { set(null); redraw(); } } }, 'Remove') : null)));
        }
        case 'photos': {
            if (!Array.isArray(v)) obj[f.key] = [];
            const list = obj[f.key];
            const grid = h('div.pgrid.pgrid--edit', ...list.map((p, i) => {
                const t = photoTile(p, { small: true, onRemove: () => { list.splice(i, 1); redraw(); }, onAlt: f.alts ? (a) => { p.alt = a; } : null });
                t.draggable = true; t.dataset.i = i;
                t.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', String(i)));
                t.addEventListener('dragover', (e) => e.preventDefault());
                t.addEventListener('drop', (e) => { e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'); const [m] = list.splice(from, 1); list.splice(i, 0, m); redraw(); });
                return t;
            }));
            return h('div.field', labelOf(f), h('p.muted', `${list.length} photos · drag to reorder · the first ${f.lead || 5} make the big opening spread`), grid,
                h('div.row', h('button.btn.btn--ghost', { type: 'button', on: { click: async () => { const ps = await pickPhotos({ multiple: true }); if (ps.length) { list.push(...ps.map(strip)); redraw(); } } } }, '+ Add photos'),
                    list.length ? h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { if (await confirmBox('Remove all photos?', 'This empties the gallery (the photos stay in the library).', { ok: 'Remove all', danger: true })) { list.length = 0; redraw(); } } } }, 'Remove all') : null));
        }
        case 'bool':
            return h('label.check', h('input', { type: 'checkbox', checked: !!v, on: { change: (e) => set(e.target.checked) } }), h('span', f.label), f.help ? h('small.muted', f.help) : null);
        case 'select':
            return h('label.field', labelOf(f), h('select', { on: { change: (e) => set(e.target.value) } }, ...f.options.map(([val, name]) => h('option', { value: val, selected: v === val }, name))));
        case 'number':
            return h('label.field', labelOf(f), h('input', { type: 'number', step: f.step || 'any', value: v ?? '', on: { input: (e) => set(e.target.value === '' ? null : Number(e.target.value)) } }));
        case 'textarea': case 'rich':
            return h('label.field', labelOf(f), h('textarea', { rows: f.rows || 3, value: v ?? '', on: { input: (e) => set(e.target.value) } }), f.type === 'rich' ? h('small.muted', 'Tip: wrap words in <em> … </em> for the gold italic accent.') : null);
        default: {
            const input = h('input', { value: v ?? '', type: f.inputType || 'text', placeholder: f.placeholder || '', maxLength: f.max || null, on: { input: (e) => { set(e.target.value); if (counter) counter.textContent = `${e.target.value.length}${f.max ? ` / ${f.max}` : ''}`; } } });
            const counter = f.count ? h('small.muted', `${String(v ?? '').length}${f.max ? ` / ${f.max}` : ''}`) : null;
            return h('label.field', labelOf(f), input, counter);
        }
    }
}
/** keep only what the site needs from a photo */
export const strip = (p) => ({ src: p.src, sm: p.sm || '', w: p.w || 0, h: p.h || 0, alt: p.alt || '' });
