// TEST PERIOD demo data (owner 2026-10-17: "add a bunch of fake accounts on every page to see what it will look like").
// Every record carries demo: true so "Remove demo data" takes them all out, and the build leaves demo records out of
// the website once LAUNCHED is true (scripts/render.mjs), so none can reach the real site by accident.
// Emails use example.com and phones 555 numbers: nothing here reaches a real inbox or phone.
import { FS, SEED, db, markChanged } from './fb.js';

const PEOPLE = [
    { first: 'Brad', last: 'Dinges', email: 'brad.dinges@example.com', phone: '720-555-0141' },
    { first: 'Danielle', last: 'Fritz', email: 'danielle.fritz@example.com', phone: '720-555-0172' },
    { first: 'Avrie', last: 'Fritz', email: 'avrie.fritz@example.com', phone: '303-555-0118' },
];
const day = (n) => new Date(Date.now() + n * 864e5).toISOString();
const pic = (set, n) => { const p = SEED.PHOTOS[set].find((x) => x.src.endsWith(`/${n}.webp`)); return { ...p, alt: p.alt || `${set} photo` }; };

function records() {
    const [brad, dani, avrie] = PEOPLE;
    const name = (p) => `${p.first} ${p.last}`;
    const inquiries = [
        [dani, 'Families', 'Early October', 'Chautauqua Park', 'Family of five with two little ones and a grandma. We’d love golden hour and something relaxed — our kids are wiggly!', 'Instagram', 'new', -0.2],
        [avrie, 'High School Seniors', 'Late August', 'Downtown Denver murals', 'Senior photos with a city vibe, maybe two outfits. I love the mural photos on your site.', 'A friend', 'new', -1],
        [brad, 'Weddings', 'June 13, 2027', 'Evergreen Lake', 'Around 120 guests, ceremony at 4pm. Looking for full-day coverage and the engagement session.', 'Google', 'replied', -3],
        [dani, 'Maternity', 'Next month', 'Somewhere with tall grass', 'Due in December — hoping for a sunset session with my husband and our dog.', 'Google', 'booked', -6],
        [brad, 'Headshots & Branding', 'Any weekday', 'My office in Lakewood', 'New headshots for me and four team members for our website.', 'LinkedIn', 'replied', -9],
        [avrie, 'Elopements & Micro Weddings', 'Spring 2027', 'Denver courthouse', 'Just the two of us plus parents. Two hours sounds perfect.', 'Instagram', 'closed', -14],
        [dani, 'Newborns', 'Due January 20', 'Our home in Littleton', 'In-home newborn session, first baby! Would love a few with our cat.', 'Instagram', 'booked', -20],
        [brad, 'Families', 'Thanksgiving week', 'Red Rocks', 'Extended family of 14 visiting from out of state.', 'Google', 'archived', -40],
    ].map(([p, session, date, location, message, source, status, ago], i) => ({ id: `demo-inq-${i + 1}`, name: name(p), email: p.email, phone: p.phone, session, date, location, message, source, page: '/contact/', status, createdAt: day(ago), demo: true,
        ...(status !== 'new' ? { notes: status === 'booked' ? 'Retainer paid. Sent prep guide.' : status === 'replied' ? 'Sent pricing and availability.' : '' } : {}) }));

    const reviews = [
        [dani, 'Shelly made our family session so easy. Our kids actually had fun, and the photos are the most beautiful we’ve ever had. (Demo review for testing.)', ['families', 'experience']],
        [avrie, 'My senior pictures turned out amazing! Shelly told me exactly how to pose and it never felt awkward. (Demo review for testing.)', ['seniors', 'experience']],
        [brad, 'Quick, professional headshots for our whole team. Great direction and great light. (Demo review for testing.)', ['headshots']],
    ].map(([p, text, tags], i) => ({ id: `demo-review-${i + 1}`, name: `${p.first} ${p.last[0]}. (demo)`, rating: 5, text, tags, featured: i < 2, order: 100 + i, source: 'demo', demo: true }));

    const story = (slug, title, category, status, publishAt, cover, body) => ({ id: `demo-story-${slug}`, slug: `demo-${slug}`, title: `Demo: ${title}`, category, status, publishAt, cover, gallery: [], demo: true,
        excerpt: 'A demo story to show how Journal posts look. It will be removed before launch.', seoTitle: '', seoDescription: 'Demo story for testing the Journal.', body });
    const journal = [
        story('fritz-family-golden-hour', 'The Fritz Family’s Golden-Hour Session at Chautauqua', 'families', 'published', day(-2), pic('family', '04'),
            '<p class="j-lead">Danielle and Avrie Fritz met me at Chautauqua Park an hour before sunset — and the light did not disappoint.</p><p>This is a demo story so you can see a real session write-up: a short introduction, a couple of section headings, and photos placed through the story.</p><h2>Where we went</h2><p>We started in the meadow below the Flatirons, then wandered up the trail as the sun dropped.</p>'
            + `<figure class="j-wide"><img src="${pic('family', '07').src}" alt="Family laughing together at golden hour"></figure><h2>Favorite moments</h2><p>Avrie made everyone laugh so hard we had to stop walking — that’s the photo they printed for the living room.</p>`),
        story('dinges-wedding-evergreen', 'Brad Dinges’ Evergreen Lake Wedding (Coming Soon)', 'weddings-elopements', 'published', day(5), pic('weddings', '13'),
            '<p>A scheduled demo story: it’s saved as published with a future date, so it appears on the website automatically on that day.</p>'),
        story('what-to-wear-winter', 'What to Wear for Winter Family Photos', 'style-inspiration', 'draft', day(0), pic('family', '01'),
            '<p>A draft demo story: drafts are only visible in the ERP until they’re published.</p>'),
    ];

    const users = PEOPLE.map((p, i) => ({ id: `demo-user-${p.first.toLowerCase()}`, name: `${p.first} ${p.last}`, email: p.email, role: i === 0 ? 'owner' : 'editor', active: i !== 2, demo: true, note: 'Demo person — no sign-in account behind it.' }));

    const media = ['seniors/41', 'maternity/22', 'newborn/18', 'headshots/09', 'weddings/20', 'family/02'].map((k, i) => { const [set, n] = k.split('/'); const p = pic(set, n); return { id: `demo-media-${i + 1}`, ...p, name: `demo-${set}-${n}.webp`, path: '', createdAt: day(-i), demo: true }; });
    return { firefly_inquiries: inquiries, firefly_reviews: reviews, firefly_journal: journal, firefly_users: users, firefly_media: media };
}

/** add every demo record; returns counts */
export async function addDemo(onStep) {
    const out = {};
    // reviews: the site shows ERP reviews only once the ERP has some, so bring the 8 genuine ones in first
    const existing = await FS.getDocs(FS.collection(db, 'firefly_reviews'));
    if (!existing.docs.some((d) => !d.data().demo)) for (const [i, r] of SEED.REVIEWS.entries()) await FS.setDoc(FS.doc(db, 'firefly_reviews', r.id), { ...r, order: i, source: 'google' });
    // Journal likewise: keep the 4 starting stories on the site
    const stories = await FS.getDocs(FS.collection(db, 'firefly_journal'));
    if (!stories.docs.some((d) => !d.data().demo)) for (const a of SEED.JOURNAL) await FS.setDoc(FS.doc(db, 'firefly_journal', a.slug), a);
    for (const [col, list] of Object.entries(records())) {
        for (const { id, ...rec } of list) {
            if (col === 'firefly_inquiries') {
                // the website form's rule: a new inquiry arrives as "new"; the ERP then moves it along
                const { status, notes, demo, ...first } = rec;
                await FS.setDoc(FS.doc(db, col, id), { ...first, status: 'new' });
                await FS.updateDoc(FS.doc(db, col, id), { status, demo, ...(notes ? { notes } : {}) });
            } else await FS.setDoc(FS.doc(db, col, id), rec);
        }
        out[col] = list.length; onStep?.(`${col}: ${list.length}`);
    }
    await markChanged('demo data');
    return out;
}

/** remove every record marked demo: true */
export async function removeDemo(onStep) {
    let n = 0;
    for (const col of ['firefly_inquiries', 'firefly_reviews', 'firefly_journal', 'firefly_users', 'firefly_media']) {
        const snap = await FS.getDocs(FS.query(FS.collection(db, col), FS.where('demo', '==', true)));
        for (const d of snap.docs) { await FS.deleteDoc(d.ref); n++; }
        onStep?.(`${col}: ${snap.size} removed`);
    }
    await markChanged('demo data removed');
    return n;
}
