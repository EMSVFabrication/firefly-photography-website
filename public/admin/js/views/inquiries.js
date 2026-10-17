// Inquiries from the website form (each one is also emailed to Shelly through FormSubmit).
import { FS, db, listAll, stamp } from '../fb.js';
import { confirmBox, dbError, fmt, h, modal, toast } from '../ui.js';

const STATUSES = [['new', 'New'], ['replied', 'Replied'], ['booked', 'Booked'], ['closed', 'Not booked'], ['archived', 'Archived']];
const badge = (s) => h(`span.badge${s === 'new' ? '.badge--new' : s === 'booked' ? '.badge--ok' : s === 'replied' ? '.badge--blue' : ''}`, (STATUSES.find((x) => x[0] === s) || [s, s])[1]);
let tab = 'open';

export async function render(view, rest) {
    let list;
    try { list = (await listAll('firefly_inquiries')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')); }
    catch (e) { view.replaceChildren(h('div.note.note--bad', 'Inquiries need the Firefly database rules deployed (Settings → System). Until then they still arrive by email.')); return; }
    const draw = () => {
        const shown = list.filter((x) => tab === 'all' || (tab === 'open' ? ['new', 'replied'].includes(x.status) : x.status === tab));
        view.replaceChildren(
            h('p.muted', { style: { marginBottom: '14px' } }, 'Every inquiry is emailed to you and saved here. The client automatically receives a confirmation email.'),
            h('div.tabs', ...[['open', 'Open'], ...STATUSES, ['all', 'All']].map(([k, n]) => h(`button.tab${tab === k ? '.on' : ''}`, { type: 'button', on: { click: () => { tab = k; draw(); } } }, `${n} (${list.filter((x) => k === 'all' || (k === 'open' ? ['new', 'replied'].includes(x.status) : x.status === k)).length})`))),
            h('div.card', shown.length ? h('table.table',
                h('thead', h('tr', h('th', 'Who'), h('th', 'Session'), h('th.hide-sm', 'Date wanted'), h('th', 'Status'), h('th.hide-sm', 'Received'))),
                h('tbody', ...shown.map((x) => h('tr.click', { on: { click: () => open(x) } },
                    h('td', h('strong', x.name), h('div.muted', x.email)), h('td', x.session), h('td.hide-sm', x.date || '—'), h('td', badge(x.status)), h('td.muted.hide-sm', fmt(x.createdAt)))))) : h('p.empty', 'Nothing here.')));
    };
    const open = (x) => {
        const notes = h('textarea', { rows: 3, value: x.notes || '', placeholder: 'Private notes (only you see these)' });
        const status = h('select', ...STATUSES.map(([k, n]) => h('option', { value: k, selected: x.status === k }, n)));
        const reply = `mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent(`Your ${x.session || 'photography'} inquiry — Firefly Photography`)}&body=${encodeURIComponent(`Hi ${String(x.name || '').split(' ')[0]},\n\nThank you so much for reaching out!\n\n`)}`;
        modal(x.name, (close) => h('div.stack',
            h('dl.kv', ...[['Email', h('a', { href: `mailto:${x.email}` }, x.email)], ['Phone', x.phone ? h('a', { href: `tel:${x.phone}` }, x.phone) : '—'], ['Session', x.session], ['Date wanted', x.date || '—'], ['Location', x.location || '—'], ['Found me through', x.source || '—'], ['Sent from', x.page || '—'], ['Received', fmt(x.createdAt)]].flatMap(([k, v]) => [h('dt', k), h('dd', v)])),
            h('div', h('div.field__label', 'What they’re envisioning'), h('p.inq__msg', x.message || '—')),
            h('label.field', h('span.field__label', 'Status'), status),
            h('label.field', h('span.field__label', 'Notes'), notes),
            h('div.row.row--between',
                h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { if (!(await confirmBox('Delete this inquiry?', 'It will be gone for good (the email copy stays in your inbox).', { ok: 'Delete', danger: true }))) return; try { await FS.deleteDoc(FS.doc(db, 'firefly_inquiries', x.id)); list = list.filter((y) => y !== x); close(); draw(); toast('Deleted.'); } catch (e) { dbError(e, 'Deleting'); } } } }, 'Delete'),
                h('div.row', h('a.btn.btn--ghost', { href: reply }, '✉ Reply by email'),
                    h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                        const patch = { status: status.value, notes: notes.value, ...stamp() };
                        try { await FS.updateDoc(FS.doc(db, 'firefly_inquiries', x.id), patch); Object.assign(x, patch); close(); draw(); toast('Saved.'); } catch (e) { dbError(e); }
                    } } }, 'Save')))));
    };
    draw();
    if (rest) { const x = list.find((y) => y.id === rest); if (x) open(x); }
}
