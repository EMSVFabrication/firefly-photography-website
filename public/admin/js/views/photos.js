// The photo library: everything uploaded through the ERP (resized for the web automatically).
import { FS, db, deletePhoto, listAll, uploadPhoto } from '../fb.js';
import { confirmBox, dbError, fmt, h, modal, toast } from '../ui.js';

export async function render(view) {
    let list;
    try { list = (await listAll('firefly_media')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')); }
    catch (e) { view.replaceChildren(h('div.note.note--bad', 'The photo library needs the database rules deployed (Settings → System).')); return; }
    const status = h('span.muted');
    const file = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, on: { change: async (e) => {
        const files = [...e.target.files];
        for (let i = 0; i < files.length; i++) { status.textContent = `Preparing and uploading ${i + 1} of ${files.length}…`; try { await uploadPhoto(files[i]); } catch (err) { dbError(err, 'Uploading'); break; } }
        status.textContent = ''; toast('Uploaded. Add them to a gallery from Portfolio & services.'); render(view);
    } } });
    const drop = h('div.card', { style: { borderStyle: 'dashed', textAlign: 'center', padding: '30px' } }, h('p', 'Drag photos here, or ', h('button.btn.btn--primary.btn--sm', { type: 'button', on: { click: () => file.click() } }, 'choose photos')), h('p.muted', 'Full-size JPEGs from Lightroom are fine — they’re resized for the web (1600px and 760px) before uploading.'), status, file);
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.style.borderColor = '#c99d4e'; });
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.style.borderColor = ''; file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); });
    const open = (m) => {
        const alt = h('input', { value: m.alt || '' });
        modal(m.name || 'Photo', (close) => h('div.stack', h('img', { src: m.src, alt: '', style: { maxHeight: '55vh', margin: '0 auto', borderRadius: '8px' } }),
            h('p.muted', `${m.w}×${m.h} · uploaded ${fmt(m.createdAt)}`),
            h('label.field', h('span.field__label', h('span', 'Description (alt text)'), h('small', 'Used where the photo appears, for Google and screen readers.')), alt),
            h('div.row.row--between',
                h('button.btn.btn--ghost.btn--sm', { type: 'button', on: { click: async () => { if (!(await confirmBox('Delete this photo?', 'If it’s used in a gallery, story or page, it will disappear there too. This can’t be undone.', { ok: 'Delete', danger: true }))) return; try { await deletePhoto(m); close(); render(view); } catch (e) { dbError(e, 'Deleting'); } } } }, 'Delete'),
                h('button.btn.btn--primary', { type: 'button', on: { click: async () => { try { await FS.updateDoc(FS.doc(db, 'firefly_media', m.id), { alt: alt.value }); m.alt = alt.value; close(); toast('Saved.'); } catch (e) { dbError(e); } } } }, 'Save'))));
    };
    view.replaceChildren(drop, h('div.card', h('div.card__head', h('h2', `${list.length} uploaded photos`)),
        list.length ? h('div.pgrid', { style: { maxHeight: 'none' } }, ...list.map((m) => h('button.pick', { type: 'button', title: m.alt || m.name, on: { click: () => open(m) } }, h('img', { src: m.sm || m.src, alt: '', loading: 'lazy' })))) : h('p.empty', 'No uploads yet. The website’s original photos are always available when choosing photos for a gallery.')));
}
