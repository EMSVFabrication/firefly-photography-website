// Pricing & packages. A save that changes a price, retainer, session length or inclusion asks for confirmation first.
import { getContent, saveContent } from '../fb.js';
import { confirmBox, dbError, form, h, toast } from '../ui.js';

const SCHEMA = [{ key: 'items', label: 'Packages', type: 'repeat', itemName: 'package', itemLabel: (p) => `${p.name || 'Package'} — ${p.price || ''}`, blank: { id: '', name: '', price: '', process: 'portrait', includes: [], notes: [] }, fields: [
    { key: 'name', label: 'Package name' },
    { key: 'id', label: 'Short code', help: 'Lowercase, no spaces (used to link services to this package). e.g. portrait' },
    { key: 'price', label: 'Price (as shown)', help: 'e.g. $500' },
    { key: 'where', label: 'Area note', help: 'e.g. Greater Denver Area' },
    { key: 'for', label: 'Who it’s for', type: 'textarea', rows: 2 },
    { key: 'includes', label: 'Included', type: 'list' },
    { key: 'addons', label: 'Add-ons', type: 'list' },
    { key: 'booking', label: 'Retainer / payment', type: 'textarea', rows: 2 },
    { key: 'notes', label: 'Travel notes', type: 'list' },
    { key: 'process', label: 'Process', type: 'select', options: [['portrait', 'Portrait (proof gallery + 15 favorites)'], ['wedding', 'Wedding / elopement (own process)']] },
    { key: 'featured', label: 'Highlight this package (dark card)', type: 'bool' },
    { key: 'boudoir', label: 'This is the boudoir package (hidden when boudoir is switched off in Settings)', type: 'bool' },
] }];

const money = ['price', 'booking', 'includes', 'addons', 'notes'];
function changes(before, after) {
    const out = [];
    for (const p of after) {
        const old = before.find((x) => x.id === p.id);
        if (!old) { out.push(`New package: ${p.name} (${p.price})`); continue; }
        for (const k of money) if (JSON.stringify(old[k] ?? '') !== JSON.stringify(p[k] ?? '')) out.push(`${p.name} — ${k}: “${[].concat(old[k] ?? '').join('; ')}” → “${[].concat(p[k] ?? '').join('; ')}”`);
    }
    for (const o of before) if (!after.some((p) => p.id === o.id)) out.push(`Removed package: ${o.name}`);
    return out;
}

export async function render(view) {
    const c = await getContent('packages');
    const before = structuredClone(c.value);
    const f = form(SCHEMA, { items: c.value });
    view.replaceChildren(
        h('div.note', h('strong', 'Prices are exactly as they were on the old site. '), 'Please check every price, retainer, session length, delivery time and inclusion. Anything you change here asks you to confirm before it’s saved.'),
        c.error ? h('div.note.note--bad', { style: { marginTop: '10px' } }, 'Saving needs the database rules deployed (Settings → System).') : null,
        h('div.card', { style: { marginTop: '16px' } }, f),
        h('div.savebar', h('span.muted', c.saved ? `Saved ${new Date(c.updatedAt).toLocaleString()}` : 'Showing the prices from the old site'),
            h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                const items = f.read().items;
                if (items.some((p) => !p.id || !p.name || !p.price)) return toast('Each package needs a name, a short code and a price.', 'error');
                const diff = changes(before, items);
                if (diff.length && !(await confirmBox('Confirm these changes', h('div.stack', h('p', 'These will show on the website after you publish:'), h('ul', ...diff.map((d) => h('li', d)))), { ok: 'Yes, these are correct' }))) return;
                try { await saveContent('packages', items); before.splice(0, before.length, ...structuredClone(items)); toast('Saved. Press “Publish to website” when you’re ready.'); } catch (e) { dbError(e); }
            } } }, 'Save')));
}
