// The site's starting content (the "seed"). scripts/build.mjs turns it into the pages in public/.
// Once the ERP (/admin) is in use, its saved content (Firebase, firefly_* collections) is laid over this at build time,
// so this file is the fallback and the first copy that the ERP imports.
//
// Facts here come from the old site (fireflyphotography.org, October 2026) and Shelly's redesign brief.
// NEVER change a price, retainer, session length, delivery promise or inclusion without Shelly confirming it.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOURNAL } from './journal-seed.mjs';

export const SITE = 'https://firefly-photography.web.app'; // becomes https://www.fireflyphotography.org at launch
// TEST PERIOD: false keeps search engines away from the test address (robots.txt + noindex on every page), so it
// can't compete with the old site on Google. Set true at launch, together with SITE.
export const LAUNCHED = false;

// System Requests (the "Report / Request" button at the top, like the ASAP, BIC, STLFIT and EMSV sites): notes are saved
// in the shared Firebase project's database, collection firefly_requests (rules: the Firefly block in ..\BIC App\firestore.rules).
// This is the project's public web key — it is meant to be in web pages; the database rules decide what it may do.
// TEST PERIOD (owner 2026-10-16): the button shows for everyone; take it out before the site goes live.
export const REQUESTS = { project: 'bic-dev-e2618', apiKey: 'AIzaSyDs9pql2b8EuFncztmpddsX9rEsMEy-W1Q', collection: 'firefly_requests' };

const PHOTOS = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'photos.json'), 'utf8'));

/** one photo as the pages use it: { src, sm, w, h, alt } — uploads from the ERP have the same shape */
export function pic(set, n, alt = '') {
    const p = PHOTOS[set]?.find((x) => x.src === n);
    if (!p) throw new Error(`no photo ${set}/${n}`);
    return { src: `/img/${set}/${n}.webp`, sm: `/img/${set}/${n}-sm.webp`, w: p.w, h: p.h, alt };
}
const range = (set, from, to, alt) => PHOTOS[set].filter((p) => +p.src >= from && +p.src <= to).map((p) => pic(set, p.src, alt));
const all = (set, alt) => PHOTOS[set].map((p) => pic(set, p.src, alt));

export const BIZ = {
    name: 'Firefly Photography',
    owner: 'Shelly Bowman',
    place: 'Denver & Littleton, Colorado',
    city: 'Littleton', region: 'CO',
    areas: ['Denver', 'Littleton', 'Morrison', 'Evergreen', 'Lakewood', 'Boulder', 'the Front Range'],
    email: 'ShellyLBowman@gmail.com',
    phone: '720-822-2454',
    tel: '+17208222454',
    instagram: { handle: '@fireflyphotographyportfolio', url: 'https://www.instagram.com/fireflyphotographyportfolio' },
    tiktok: { handle: '@fireflyphotographyco', url: 'https://www.tiktok.com/@fireflyphotographyco' },
    tagline: 'Capturing the light in your story.',
};

// Integrations — filled in from ERP → Settings. Empty means "off".
export const SETTINGS = {
    gaId: '',                 // Google Analytics 4 measurement ID, e.g. G-XXXXXXX
    gscVerification: '',      // Google Search Console HTML-tag verification code
    googleReviewsUrl: '',     // "Read all reviews on Google" link (Business Profile)
    googleWriteReviewUrl: '', // "Leave a review" link (g.page/r/…/review)
    googleRating: 5.0,        // shown until the live review connection is set up
    googleReviewCount: 8,
    showBoudoir: true,        // brief: "Boudoir, if we continue advertising this service" — Shelly to confirm
};

// ── Packages (exactly as on the old site — see the note at the top)
export const PACKAGES = [
    { id: 'portrait', name: 'Portrait & Lifestyle', price: '$500', where: 'Greater Denver Area', process: 'portrait',
        for: 'Perfect for high school seniors, maternity, families, branding, and lifestyle sessions.',
        includes: ['1-hour session', '15 edited images'], booking: '$250 retainer; remainder due day of session.',
        notes: ['Travel fees may apply outside the Denver area.'] },
    { id: 'wedding', name: 'Wedding Photography', price: '$3,800', where: 'Greater Denver Area', process: 'wedding', featured: true,
        for: 'Authentic, storytelling coverage.',
        includes: ['8 hours of coverage', '300 edited images', '1-hour engagement session at Mt. Falcon Park with 15 edited images', 'Full gallery in 6 weeks'],
        booking: '$1,500 retainer; balance due one week before the wedding.',
        addons: ['Extra time: $200/hr', '2-week delivery: +$350'],
        notes: ['Colorado mountain weddings: +$500 (50+ miles from Littleton).', 'Destination weddings available worldwide — pricing based on travel.'] },
    { id: 'elopement', name: 'Micro Weddings & Elopements', price: '$1,800', process: 'wedding',
        for: 'Intimate, meaningful coverage for small ceremonies and elopements.',
        includes: ['2 hours of photography', '100 edited images', 'Full gallery in 6 weeks'],
        booking: '$800 retainer; balance due one week before the wedding.',
        addons: ['Extra time: $200/hr (up to 2 hours)', '2-week delivery: +$350'],
        notes: ['Colorado mountain weddings: +$500 (50+ miles from Littleton).', 'Destination weddings available worldwide — pricing based on travel.'] },
    { id: 'boudoir', name: 'Boudoir', price: '$600', process: 'portrait', boudoir: true,
        for: 'Empowering, artistic sessions designed around your comfort and style.',
        includes: ['1.5-hour session', '20 edited images'], booking: '$100 retainer; remainder due day of session.',
        notes: ['Travel fees may apply outside the Denver area.'] },
];

// ── Google reviews (word for word from the old site; first name + last initial). `tags` pick which pages show them.
export const REVIEWS = [
    { id: 'justin-s', name: 'Justin S.', rating: 5, featured: true, tags: ['families', 'seniors', 'headshots', 'experience'], text: 'Shelly is amazing at what she does. I have had multiple shoots done. She did my family photos from when my mom was sick with cancer and went above and beyond for us making sure everything turned out great and making it feel special. She also did my prom, graduation and my photos for Real Estate. She knocked every one out of the park and they all turned out great!' },
    { id: 'evija-l', name: 'Evija L.', rating: 5, tags: ['seniors', 'families'], text: 'Shelly is awesome!!!! She did our daughter’s senior pictures which turned out so beautiful that made me want to book her for our family pictures too! Love her style!' },
    { id: 'jo-h', name: 'Jo H.', rating: 5, featured: true, tags: ['weddings', 'elopements', 'experience'], text: 'Shelly is an amazing photographer! She photographed me and my partner’s wedding and instantly made us feel comfortable and took some amazing shots! She’s very talented and has an eye for all the right angles and lighting! We are lucky to have had her capture our big day.' },
    { id: 'desiree-d', name: 'Desiree D.', rating: 5, tags: ['headshots'], text: 'Shelly is great and did my headshots for work. She was easy to work with, and very fast and efficient. Great eye for lighting!' },
    { id: 'terhas-g', name: 'Terhas G.', rating: 5, tags: ['families'], text: 'Shelly is AMAZING!! She captured our family pictures beyond what I had ever imagined. We feel very lucky to have found her!' },
    { id: 'amanda-f', name: 'Amanda F.', rating: 5, featured: true, tags: ['experience', 'maternity', 'boudoir', 'headshots'], text: 'Shelly was such an amazing experience over all. She made me feel so comfortable in front of the camera! I would recommend her to anyone for any kind of photo shoot.' },
    { id: 'tanika-l', name: 'Tanika L.', rating: 5, featured: true, tags: ['experience', 'seniors', 'families'], text: 'Shelly did an amazing job, very professional, knowledgeable and entertaining. She makes the photo shoot fun and engaging. She is my go to photographer for everything, literally, graduation, food photography, family photo. I will most definitely use photos by Shelly again. Thanks Shelly' },
    { id: 'middle-of-our-world', name: 'The middle of our world', rating: 5, featured: true, tags: ['experience', 'families', 'newborns', 'maternity'], text: 'Shelly is really great and passionate about what she does. She goes the extra mile to get the perfect shot and make everyone feel comfortable showing off their personalities and it shows in her pictures. You’d be lucky to have her by your side to immortalize these special moments.' },
];

// ── Services: one page each (portfolio + the experience + reviews + booking). Order = menu order.
export const SERVICES = [
    { slug: 'weddings', name: 'Weddings', long: 'Wedding Photography', mood: 'romantic', package: 'wedding', process: 'wedding',
        seo: { title: 'Colorado Wedding Photographer | Firefly Photography', description: 'Romantic, cinematic wedding photography in Denver, Littleton and the Colorado mountains by Shelly Bowman — from getting ready to the last dance.', keyword: 'Colorado wedding photographer' },
        kicker: 'Weddings', headline: 'Romantic, cinematic, <em>and entirely yours.</em>',
        intro: 'Your wedding day moves quickly. I’m there for all of it — the nervous laughter while getting ready, the quiet first look, the vows, the toasts and the last dance — photographed with an editorial eye and a whole lot of heart.',
        experience: ['A calm, organized presence on a busy day: I help keep the timeline relaxed and make room for the moments that matter to you.', 'Gentle direction for portraits — where to stand, how to move, where the light is best — so you can simply enjoy each other.', 'An engagement session at Mt. Falcon Park is included, so we know each other well before the big day.'],
        cover: pic('featured', '02', 'Bride and groom embracing in a golden Colorado meadow at sunset'),
        gallery: [pic('featured', '02', 'Couple dancing in a golden mountain meadow'), pic('featured', '05', 'Black-and-white portrait of a newlywed couple in sunlight'), ...range('weddings', 12, 44, 'Wedding day photography in Colorado')] },
    { slug: 'elopements', name: 'Elopements & Micro Weddings', long: 'Elopement & Micro Wedding Photography', mood: 'romantic', package: 'elopement', process: 'wedding',
        seo: { title: 'Denver Elopement & Micro Wedding Photographer | Firefly', description: 'Intimate elopement and micro wedding photography in Denver, at the courthouse and in the Colorado mountains — meaningful coverage for small, beautiful celebrations.', keyword: 'Denver elopement photographer' },
        kicker: 'Elopements & micro weddings', headline: 'Small celebrations, <em>big feeling.</em>',
        intro: 'Courthouse vows, a handful of your favorite people, or just the two of you on a Colorado mountainside — intimate weddings deserve photographs every bit as beautiful as a grand celebration.',
        experience: ['Help choosing a location and time of day for the best light, from downtown Denver to the foothills.', 'Relaxed, natural direction so the day feels like yours, not a photo shoot.', 'Two hours of coverage that captures the ceremony, portraits and the little moments in between.'],
        cover: pic('weddings', '10', 'Couple walking past the Colorado State Capitol after their courthouse wedding'),
        gallery: range('weddings', 1, 11, 'Denver courthouse elopement photography') },
    { slug: 'families', name: 'Families', long: 'Family Photography', mood: 'warm', package: 'portrait', process: 'portrait',
        seo: { title: 'Denver & Littleton Family Photographer | Firefly Photography', description: 'Warm, authentic family photography in Denver, Littleton and the foothills. Relaxed sessions with gentle direction, real laughter and beautiful golden-hour light.', keyword: 'Denver family photographer' },
        kicker: 'Families', headline: 'The real, <em>beautiful</em> chaos of your family.',
        intro: 'I embrace the unpredictability of candid moments — unfiltered expressions, genuine laughter and tender interactions woven into a timeless story. I’ll guide you through the session so everyone can relax, kids included.',
        experience: ['Location ideas around Denver, Littleton and the foothills, timed for soft, flattering light.', 'Easy direction and a bit of play to keep little ones (and reluctant dads) smiling.', 'A mix of thoughtfully composed portraits and the candid moments in between.'],
        cover: pic('featured', '07', 'Young girl holding a pink flower beside a woven basket'),
        gallery: [pic('featured', '07', 'Girl with a pink flower in a red dress'), pic('featured', '08', 'Father and daughter portrait'), pic('featured', '10', 'Toddler reaching toward the camera in a garden'), pic('featured', '06', 'Couple laughing together in tall grass'), ...all('family', 'Family photography in Colorado')] },
    { slug: 'seniors', name: 'High School Seniors', long: 'Senior Portrait Photography', mood: 'bold', package: 'portrait', process: 'portrait',
        seo: { title: 'Littleton Senior Photographer | Firefly Photography', description: 'Contemporary, confident high school senior portraits in Littleton, Denver and around Colorado — urban murals, golden fields and everything in between.', keyword: 'Littleton senior photographer' },
        kicker: 'High school seniors', headline: 'Confident, creative, <em>completely you.</em>',
        intro: 'Glam. Style. Seniors. I love capturing the charm, confidence and individuality of each senior — a visual story that brings their personality to life, whether that’s downtown murals, a favorite park or golden fields.',
        experience: ['Help planning outfits and locations that fit your style.', 'Posing direction that feels natural, never stiff — I’ll show you exactly what to do.', 'A fun, upbeat session with music, movement and plenty of laughs.'],
        cover: pic('seniors', '13', 'High school senior in a pearl statement necklace in downtown Denver'),
        gallery: [pic('featured', '01', 'Senior portrait on a wooden bridge'), pic('featured', '03', 'Senior portrait in a golden summer field'), ...all('seniors', 'High school senior portrait in Denver')] },
    { slug: 'newborns', name: 'Newborns', long: 'Newborn Photography', mood: 'intimate', package: 'portrait', process: 'portrait',
        seo: { title: 'Denver Newborn Photographer | Firefly Photography', description: 'Gentle, timeless in-home newborn photography in Denver and Littleton — the tiny fingers and toes, the snuggles and the big love that fills the room.', keyword: 'Denver newborn photographer' },
        kicker: 'Newborns', headline: 'Those first sleepy weeks, <em>held forever.</em>',
        intro: 'Relaxed, gentle sessions in the comfort of your own home — the tiny fingers and toes, the snuggles, and the big love that fills the room. No elaborate props, just your family as it really is.',
        experience: ['Unhurried and baby-led: feeding and cuddle breaks are always part of the plan.', 'I work with the natural light in your home and help you get comfortable — no posing experience needed.', 'Simple guidance beforehand on what to wear and how to prepare.'],
        cover: pic('newborn', '03', 'Newborn baby cradled in a parent’s hands'),
        gallery: all('newborn', 'In-home newborn photography in Denver') },
    { slug: 'maternity', name: 'Maternity', long: 'Maternity Photography', mood: 'intimate', package: 'portrait', process: 'portrait',
        seo: { title: 'Denver Maternity Photographer | Firefly Photography', description: 'Timeless maternity photography in Denver and Littleton — golden-hour sessions by the creek and in tall Colorado grass, or soft portraits at home.', keyword: 'Denver maternity photographer' },
        kicker: 'Maternity', headline: 'Celebrate <em>the wait.</em>',
        intro: 'Golden-hour sessions by the creek and in tall Colorado grass, or soft, cozy portraits at home — honoring this season of becoming, with your partner, your kids or simply you.',
        experience: ['Guidance on wardrobe, timing and location so you feel beautiful and comfortable.', 'Flattering, gentle posing direction — I’ll show you exactly what works.', 'A mix of polished portraits and quiet, connected moments.'],
        cover: pic('maternity', '01', 'Expecting couple at golden hour beside a wooden fence'),
        gallery: all('maternity', 'Maternity photography in Colorado') },
    { slug: 'headshots', name: 'Headshots & Branding', long: 'Professional Headshot & Branding Photography', mood: 'bold', package: 'portrait', process: 'portrait',
        seo: { title: 'Denver Headshot & Branding Photographer | Firefly Photography', description: 'Professional headshots and personal branding photography in Denver — polished, natural and unmistakably you, for LinkedIn, your website, real estate and modeling.', keyword: 'Denver professional headshot photographer' },
        kicker: 'Headshots & branding', headline: 'Polished, natural, <em>unmistakably you.</em>',
        intro: 'Headshots for work, personal branding for your business and portfolios for modeling — with a great eye for light and direction that helps you look confident and approachable.',
        experience: ['Quick, efficient sessions that respect your schedule.', 'Expression coaching and posing so you never feel awkward.', 'Studio-clean or on-location images in downtown Denver, your office or outdoors.'],
        cover: pic('headshots', '02', 'Branding portrait of a woman in a hat at a Denver cafe'),
        gallery: [pic('featured', '09', 'Professional headshot of a woman in a white blazer'), pic('featured', '04', 'Musician performing on stage, black and white'), ...all('headshots', 'Professional headshot and branding photography in Denver')] },
    { slug: 'boudoir', name: 'Boudoir', long: 'Boudoir Photography', mood: 'intimate', package: 'boudoir', process: 'portrait', boudoir: true,
        seo: { title: 'Denver Boudoir Photographer | Firefly Photography', description: 'Empowering, artistic boudoir photography in Denver — private sessions designed around your comfort and style.', keyword: 'Denver boudoir photographer' },
        kicker: 'Boudoir', headline: 'Empowering, artistic, <em>and all about you.</em>',
        intro: 'Boudoir sessions are designed around your comfort and style. I’ll guide every pose and every moment, so you can relax and see yourself the way the people who love you do.',
        experience: ['A private, judgement-free session at your pace.', 'Detailed posing guidance for every body — you never have to guess.', 'Your images are kept private and never shared without your permission.'],
        cover: pic('headshots', '24', 'Artistic portrait with soft window light'),
        gallery: [], privateGallery: true },
];

// ── The Firefly Experience (Shelly's own words from the brief)
export const EXPERIENCE = {
    headline: 'Beautiful photographs begin with feeling comfortable enough <em>to be yourself.</em>',
    lead: 'Being in front of a camera doesn’t come naturally to everyone. That’s where I come in.',
    body: [
        'I’ll guide you through the process, find the beautiful light, help with the little details, and give you direction when you need it. You don’t have to know what to do with your hands or how to pose. That’s my job.',
        'Along the way, we’ll laugh, move around, try things, and leave room for the moments nobody could have planned.',
        'My approach blends thoughtful direction with genuine connection, creating photographs that feel polished and beautiful without losing what makes them yours.',
    ],
    closing: 'The goal isn’t simply to look incredible in your photographs. It’s to feel comfortable, confident, and genuinely enjoy creating them.',
    pillars: [
        { title: 'Guided, never stiff', text: 'Posing, hands, angles, where to look — I direct the details so you can stop worrying and simply be there.' },
        { title: 'Chasing beautiful light', text: 'I plan locations and timing around the most flattering light, from Colorado golden hour to soft window light at home.' },
        { title: 'Room for real moments', text: 'Between the composed portraits, we laugh, move and play — and that’s often where the favorite photographs happen.' },
        { title: 'Organized from hello to gallery', text: 'Clear planning, an easy proof gallery and carefully finished images. You always know what comes next.' },
    ],
};

// ── "From the First Hello to Your Final Gallery" (Shelly's process, from the brief)
export const PROCESS = {
    portrait: {
        title: 'Portrait sessions', note: 'Families, seniors, maternity, newborns, headshots and other portrait packages.',
        steps: [
            { title: 'Inquiry & planning', text: 'You tell me about the session you’re envisioning. We talk through the location, timing, overall look and any special requests, and I’ll recommend beautiful Colorado locations and share preparation and styling guidance.' },
            { title: 'The photography session', text: 'We meet at the location and I guide you through everything — posing, natural movement, flattering angles and light, and comfortable interactions. We capture both thoughtfully composed portraits and candid moments.' },
            { title: 'Your proof gallery', text: 'After the session I review every frame and prepare a private online proof gallery with all the usable images, so you can see everything we captured.' },
            { title: 'Choosing your favorites', text: 'You select your 15 favorite photographs for detailed editing, simply by tapping the heart on the ones you love. You choose the images that matter most to you — I don’t make every final decision for you.' },
            { title: 'Detailed editing & delivery', text: 'Your 15 favorites receive my full, detailed editing treatment. You also receive the remaining usable proof images as part of your package — a broad collection of memories alongside a carefully refined collection of favorite portraits.' },
        ],
    },
    wedding: {
        title: 'Weddings & elopements', note: 'Weddings and elopements follow their own process — the 15-favorites selection doesn’t apply.',
        steps: [
            { title: 'Inquiry & consultation', text: 'We talk through your date, venue, guest count and the feel you want your photographs to have, and find the coverage that fits.' },
            { title: 'Reserve your date', text: 'A retainer holds your date; the balance is due one week before the wedding.' },
            { title: 'Engagement session', text: 'Full wedding packages include a one-hour engagement session at Mt. Falcon Park — a relaxed way to get comfortable in front of the camera together.' },
            { title: 'Planning the day', text: 'We map out the timeline, family photo list and the best light for portraits, so the day feels calm and nothing important is missed.' },
            { title: 'Your wedding day', text: 'Storytelling coverage from beginning to end, with gentle direction for portraits and an eye for every candid moment.' },
            { title: 'Your full gallery', text: 'Your edited gallery is delivered within six weeks — or in two weeks with the rush delivery add-on.' },
        ],
    },
};

export const ABOUT = {
    headline: 'Meet Shelly — <em>the heart behind Firefly Photography.</em>',
    lead: 'I believe the most memorable photographs come from genuine connection.',
    body: [
        'My approach combines an artistic eye with an easygoing, personable experience. I love finding beautiful light, noticing the small details, and creating images that feel both thoughtfully composed and naturally you.',
        'Whether I’m photographing a wedding, a growing family, a graduating senior, or someone stepping in front of the camera for the first time, I want the experience to feel comfortable, enjoyable, and personal.',
        'I’ll provide guidance, help you feel at ease, and encourage those moments of real laughter and connection that often become the photographs people treasure most.',
    ],
    closing: ['Because beautiful photography isn’t just about how a moment looks.', 'It’s about remembering how it felt.'],
    personal: [
        { title: 'A softie at heart', text: 'I wear my heart on my sleeve and find real joy in connecting with people and their stories.' },
        { title: 'Proud mama', text: 'My two amazing adult kids remind me every day of the boundless capacity of love.' },
        { title: 'Rambo', text: 'My “teddy-alive” puppy dog adds an extra touch of joy (and chaos) to every day.' },
        { title: 'Love, humor & kindness', text: 'The three things that guide every session — and every photograph I deliver.' },
    ],
    photo: pic('shelly', 'shelly', 'Shelly Bowman, photographer and owner of Firefly Photography'),
};

export const HOME = {
    hero: [pic('featured', '02', 'Couple in a golden Colorado meadow'), pic('maternity', '01', 'Maternity portrait at golden hour'), pic('featured', '07', 'Child holding a flower')],
    intro: 'Firefly Photography is Shelly Bowman — a Denver and Littleton photographer for weddings, elopements, families, seniors, newborns, maternity and headshots. Natural light, thoughtful direction and genuine connection, for photographs that feel as good as they look.',
    featured: [pic('featured', '05'), pic('seniors', '13'), pic('newborn', '07'), pic('maternity', '22'), pic('family', '08'), pic('weddings', '06')],
};

export const FAQS = [
    { q: 'Do I need to know how to pose?', a: 'Not at all — that’s my job. I’ll guide you through where to stand, what to do with your hands and how to move, and give you direction whenever you need it.' },
    { q: 'How many photos will I receive?', a: 'Portrait & Lifestyle sessions include 15 favorites that you choose for detailed editing, plus the remaining usable proof images. Wedding and elopement packages list their edited image counts on the pricing page.' },
    { q: 'How do I choose my 15 favorites?', a: 'After your portrait session you’ll receive a private online proof gallery. Just tap the heart on the photographs you love most, and those 15 receive my detailed editing.' },
    { q: 'Where do sessions take place?', a: 'Anywhere around Denver, Littleton and the Front Range — parks, foothills, downtown, or your own home. I’m happy to recommend locations with beautiful light for the look you want.' },
    { q: 'Do you travel?', a: 'Yes. Travel fees may apply outside the Denver area, Colorado mountain weddings 50+ miles from Littleton are +$500, and destination weddings are priced based on travel.' },
    { q: 'How do I reserve my date?', a: 'A retainer reserves your date. For portrait sessions the remainder is due on the day of your session; for weddings and elopements the balance is due one week before the wedding.' },
    { q: 'What should we wear?', a: 'I’ll share styling guidance when we plan your session. In general, coordinated (not matching) colors, comfortable clothes you feel great in and a few textures photograph beautifully.' },
];

// Old site (Squarespace) addresses → new pages, so Google visibility carries over at launch (firebase.json redirects)
export const REDIRECTS = [
    // (/about needs no entry: the new page has the same address, and Hosting adds the slash itself — an entry loops)
    ['/services-and-pricing', '/pricing/'],
    ['/portfolio/weddings-and-elopements', '/weddings/'],
    ['/portfolio/seniors-42lnx', '/seniors/'],
    ['/portfolio/family-photos', '/families/'],
    ['/portfolio/newborn', '/newborns/'],
    ['/portfolio/headshots-and-modeling', '/headshots/'],
    ['/portfolio/maternity', '/maternity/'],
    // the preliminary new site's addresses
    ['/portfolio/weddings', '/weddings/'], ['/portfolio/family', '/families/'], ['/portfolio/seniors', '/seniors/'],
    ['/portfolio/newborn', '/newborns/'], ['/portfolio/headshots', '/headshots/'],
];

export const JOURNAL_CATEGORIES = [
    { slug: 'weddings-elopements', name: 'Weddings & Elopements', blurb: 'Real weddings, location inspiration, Colorado elopement planning and wedding photography advice.' },
    { slug: 'families', name: 'Families', blurb: 'Family photography inspiration, real sessions, outfit ideas and preparation tips.' },
    { slug: 'seniors', name: 'High School Seniors', blurb: 'Senior portrait locations, outfit planning and session ideas.' },
    { slug: 'newborns-maternity', name: 'Newborns & Maternity', blurb: 'Newborn and maternity preparation tips, real-life sessions and milestone photography in Colorado.' },
    { slug: 'location-guides', name: 'Colorado Location Guides', blurb: 'The best photography locations around Denver, Littleton, Morrison, Evergreen, Boulder and beyond.' },
    { slug: 'style-inspiration', name: 'Style & Inspiration', blurb: 'What to wear, seasonal palettes, session preparation and creative ideas.' },
];

export { JOURNAL };

/** everything the pages need, in one object (the ERP stores the same shape) */
export const SEED = { BIZ, SETTINGS, PACKAGES, REVIEWS, SERVICES, EXPERIENCE, PROCESS, ABOUT, HOME, FAQS, JOURNAL_CATEGORIES, JOURNAL };
