// Pages & text: homepage, the Firefly Experience, the process timeline, About, FAQs, contact details, Journal categories.
import { getContent, saveContent } from '../fb.js';
import { dbError, form, h, toast } from '../ui.js';

const AREAS = {
    home: { name: 'Homepage', help: 'The opening photos (three side by side on a computer, one after another on a phone), the introduction and the featured photo arrangement.', schema: [
        { key: 'hero', label: 'Opening photos', type: 'photos', alts: true, lead: 3, help: 'Use 3 tall (portrait) photos. The middle one is the widest.' },
        { key: 'intro', label: 'Introduction', type: 'textarea', rows: 4 },
        { key: 'featured', label: 'Featured photos (editorial arrangement)', type: 'photos', alts: true, lead: 6, help: 'Exactly 6 work best. The 4th shows in black & white until someone hovers over it.' },
    ] },
    experience: { name: 'The Firefly Experience', help: 'The page that explains what it’s like to work with you.', schema: [
        { key: 'headline', label: 'Headline', type: 'rich', rows: 2 },
        { key: 'lead', label: 'Opening line', type: 'textarea', rows: 2 },
        { key: 'body', label: 'Paragraphs', type: 'list', multiline: true },
        { key: 'closing', label: 'Closing thought', type: 'textarea', rows: 2 },
        { key: 'moments', label: 'Behind-the-scenes photos (3)', type: 'photos', alts: true, lead: 3, help: 'Candid moments from sessions. Leave empty to use photos from the galleries.' },
        { key: 'pillars', label: 'What clients can expect', type: 'repeat', itemName: 'point', itemLabel: (x) => x.title, fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', rows: 2 }] },
    ] },
    process: { name: 'Process timeline', help: '“From the First Hello to Your Final Gallery” — on the Experience page and linked from every service.', schema: [
        { key: 'portrait', label: 'Portrait sessions', type: 'group', fields: [{ key: 'title', label: 'Tab name' }, { key: 'note', label: 'Note under the tabs' },
            { key: 'steps', label: 'Steps', type: 'repeat', itemName: 'step', itemLabel: (x, i) => `${i + 1}. ${x.title || ''}`, fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', rows: 3 }] }] },
        { key: 'wedding', label: 'Weddings & elopements', type: 'group', fields: [{ key: 'title', label: 'Tab name' }, { key: 'note', label: 'Note under the tabs' },
            { key: 'steps', label: 'Steps', type: 'repeat', itemName: 'step', itemLabel: (x, i) => `${i + 1}. ${x.title || ''}`, fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', rows: 3 }] }] },
    ] },
    about: { name: 'About', help: 'Meet Shelly.', schema: [
        { key: 'photo', label: 'Your photo', type: 'photo', required: true },
        { key: 'headline', label: 'Headline', type: 'rich', rows: 2 },
        { key: 'lead', label: 'Opening line', type: 'textarea', rows: 2 },
        { key: 'body', label: 'Paragraphs', type: 'list', multiline: true },
        { key: 'closing', label: 'Closing lines', type: 'list' },
        { key: 'personal', label: 'A few things about me', type: 'repeat', itemName: 'detail', itemLabel: (x) => x.title, fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', rows: 2 }] },
    ] },
    faqs: { name: 'FAQs', help: 'Shown on the Experience and Pricing pages (and given to Google as FAQ information).', list: true, schema: [
        { key: 'items', label: 'Questions', type: 'repeat', itemName: 'question', itemLabel: (x) => x.q, fields: [{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer', type: 'textarea', rows: 3 }] },
    ] },
    business: { name: 'Contact & business info', help: 'Used in the header, footer, inquiry section and for Google.', schema: [
        { key: 'name', label: 'Business name' }, { key: 'owner', label: 'Owner' }, { key: 'tagline', label: 'Tagline' },
        { key: 'email', label: 'Email (inquiries go here)', inputType: 'email' }, { key: 'phone', label: 'Phone (as shown)' }, { key: 'tel', label: 'Phone for tap-to-call', help: 'e.g. +17208222454' },
        { key: 'place', label: 'Area line', help: 'e.g. Denver & Littleton, Colorado' }, { key: 'city', label: 'City (for Google)' }, { key: 'region', label: 'State (for Google)' },
        { key: 'areas', label: 'Areas served', type: 'list' },
        { key: 'instagram', label: 'Instagram', type: 'group', fields: [{ key: 'handle', label: 'Handle' }, { key: 'url', label: 'Link' }] },
        { key: 'tiktok', label: 'TikTok', type: 'group', fields: [{ key: 'handle', label: 'Handle' }, { key: 'url', label: 'Link' }] },
    ] },
    categories: { name: 'Journal categories', help: 'Each category has its own page once it has a published story.', list: true, schema: [
        { key: 'items', label: 'Categories', type: 'repeat', itemName: 'category', itemLabel: (x) => x.name, fields: [{ key: 'name', label: 'Name' }, { key: 'slug', label: 'Web address part', help: 'Lowercase-with-dashes. Changing it changes the category page address.' }, { key: 'blurb', label: 'Description', type: 'textarea', rows: 2 }] },
    ] },
};

export async function render(view, rest) {
    const key = AREAS[rest] ? rest : 'home';
    const area = AREAS[key];
    const c = await getContent(key);
    const value = area.list ? { items: c.value } : c.value;
    const f = form(area.schema, value);
    view.replaceChildren(
        h('div.tabs', ...Object.entries(AREAS).map(([k, a]) => h(`a.tab${k === key ? '.on' : ''}`, { href: `#/pages/${k}`, style: { textDecoration: 'none' } }, a.name))),
        h('p.muted', { style: { marginBottom: '14px' } }, area.help),
        c.error ? h('div.note.note--bad', 'Saving needs the database rules deployed (Settings → System).') : null,
        h('div.card', f),
        h('div.savebar', h('span.muted', c.saved ? `Saved ${new Date(c.updatedAt).toLocaleString()} by ${c.updatedBy}` : 'Showing the starting content (not changed yet)'),
            h('button.btn.btn--primary', { type: 'button', on: { click: async () => {
                const v = f.read();
                try { await saveContent(key, area.list ? v.items : v); toast('Saved. Press “Publish to website” when you’re ready.'); } catch (e) { dbError(e); }
            } } }, 'Save')));
}
