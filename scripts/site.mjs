// Everything the site says, in one place. scripts/build.mjs turns it into the pages in public/.
// Taken from the old site (fireflyphotography.org, October 2026): the business details, the packages and prices,
// Shelly's own words, and the Google reviews that were on its About page (copied word for word).

export const SITE = 'https://firefly-photography.web.app'; // change when the domain moves

// System Requests (the "Report / Request" button at the top, like the ASAP, BIC, STLFIT and EMSV sites): notes are saved
// in the shared Firebase project's database, collection firefly_requests (rules: the Firefly block in ..\BIC Appirestore.rules).
// This is the project's public web key — it is meant to be in web pages; the database rules decide what it may do.
// TEST PERIOD (owner 2026-10-16): the button shows for everyone; take it out before the site goes live.
export const REQUESTS = { project: 'bic-dev-e2618', apiKey: 'AIzaSyDs9pql2b8EuFncztmpddsX9rEsMEy-W1Q', collection: 'firefly_requests' };

export const BIZ = {
    name: 'Firefly Photography',
    owner: 'Shelly Bowman',
    place: 'Denver & Littleton, Colorado',
    email: 'ShellyLBowman@gmail.com',
    phone: '720-822-2454',
    tel: '+17208222454',
    instagram: { handle: '@fireflyphotographyportfolio', url: 'https://www.instagram.com/fireflyphotographyportfolio' },
    tiktok: { handle: '@fireflyphotographyco', url: 'https://www.tiktok.com/@fireflyphotographyco' },
};

// the galleries (photos in public/img/<slug>/NN.webp, listed in scripts/photos.json)
export const CATEGORIES = [
    { slug: 'weddings', name: 'Weddings & Elopements', short: 'Weddings', cover: ['featured', '02'],
        blurb: 'Authentic, storytelling coverage — courthouse vows and backyard celebrations, micro weddings and Colorado mountain elopements, and full wedding days from getting ready to the last dance.',
        extra: ['02', '05'] },
    { slug: 'seniors', name: 'High School Seniors', short: 'Seniors', cover: ['seniors', '13'],
        blurb: 'GLAM. STYLE. SENIORS. Immediately YES! Being behind the camera for high school senior portraits is so much fun! From the excitement of capturing milestones to the energy of graduation season, I aim to capture the charm, confidence, and individuality of each senior, in a visual narrative that brings their personalities to life.',
        extra: ['01', '03'] },
    { slug: 'family', name: 'Family', short: 'Family', cover: ['featured', '07'],
        blurb: 'I embrace the unpredictability of candid moments, as they hold an unrivaled power to convey emotions, connections, and stories that words alone often fail to capture. It is in these unscripted instances that true beauty lies — unfiltered expressions, genuine laughter, and tender interactions woven into a timeless story.',
        extra: ['07', '08', '10', '06'] },
    { slug: 'newborn', name: 'Newborn', short: 'Newborn', cover: ['newborn', '03'],
        blurb: 'Those first sleepy weeks go by so fast. Relaxed, gentle sessions in the comfort of your own home — the tiny fingers and toes, the snuggles, and the big love that fills the room.',
        extra: [] },
    { slug: 'maternity', name: 'Maternity', short: 'Maternity', cover: ['maternity', '01'],
        blurb: 'Celebrate the wait. Golden-hour sessions by the creek and in tall Colorado grass, or soft, cozy portraits at home — honoring this season of becoming.',
        extra: [] },
    { slug: 'headshots', name: 'Headshots & Modeling', short: 'Headshots', cover: ['headshots', '02'],
        blurb: 'Headshots for work, personal branding and modeling portfolios — polished, natural and unmistakably you, with a great eye for light.',
        extra: ['09', '04'] },
];

export const PACKAGES = [
    { name: 'Portrait & Lifestyle', price: '$500', where: 'Greater Denver Area', for: 'Perfect for high school seniors, maternity, families, branding, and lifestyle sessions.',
        includes: ['1-hour session', '15 edited images'], booking: '$250 retainer; remainder due day of session.', notes: ['Travel fees may apply outside the Denver area.'] },
    { name: 'Wedding Photography', price: '$3,800', where: 'Greater Denver Area', for: 'Authentic, storytelling coverage.', featured: true,
        includes: ['8 hours of coverage', '300 edited images', '1-hour engagement session at Mt. Falcon Park with 15 edited images', 'Full gallery in 6 weeks'],
        booking: '$1,500 retainer; balance due one week before the wedding.',
        addons: ['Extra time: $200/hr', '2-week delivery: +$350'],
        notes: ['Colorado mountain weddings: +$500 (50+ miles from Littleton).', 'Destination weddings available worldwide — pricing based on travel.'] },
    { name: 'Micro Weddings & Elopements', price: '$1,800', for: 'Intimate, meaningful coverage for small ceremonies and elopements.',
        includes: ['2 hours of photography', '100 edited images', 'Full gallery in 6 weeks'],
        booking: '$800 retainer; balance due one week before the wedding.',
        addons: ['Extra time: $200/hr (up to 2 hours)', '2-week delivery: +$350'],
        notes: ['Colorado mountain weddings: +$500 (50+ miles from Littleton).', 'Destination weddings available worldwide — pricing based on travel.'] },
    { name: 'Boudoir', price: '$600', for: 'Empowering, artistic sessions designed around your comfort and style.',
        includes: ['1.5-hour session', '20 edited images'], booking: '$100 retainer; remainder due day of session.', notes: ['Travel fees may apply outside the Denver area.'] },
];

// Google reviews from the old About page, word for word (first name and last initial)
export const REVIEWS = [
    { name: 'Justin S.', text: 'Shelly is amazing at what she does. I have had multiple shoots done. She did my family photos from when my mom was sick with cancer and went above and beyond for us making sure everything turned out great and making it feel special. She also did my prom, graduation and my photos for Real Estate. She knocked every one out of the park and they all turned out great!' },
    { name: 'Evija L.', text: 'Shelly is awesome!!!! She did our daughter’s senior pictures which turned out so beautiful that made me want to book her for our family pictures too! Love her style!' },
    { name: 'Jo H.', text: 'Shelly is an amazing photographer! She photographed me and my partner’s wedding and instantly made us feel comfortable and took some amazing shots! She’s very talented and has an eye for all the right angles and lighting! We are lucky to have had her capture our big day.' },
    { name: 'Desiree D.', text: 'Shelly is great and did my headshots for work. She was easy to work with, and very fast and efficient. Great eye for lighting!' },
    { name: 'Terhas G.', text: 'Shelly is AMAZING!! She captured our family pictures beyond what I had ever imagined. We feel very lucky to have found her!' },
    { name: 'Amanda F.', text: 'Shelly was such an amazing experience over all. She made me feel so comfortable in front of the camera! I would recommend her to anyone for any kind of photo shoot.' },
    { name: 'Tanika L.', text: 'Shelly did an amazing job, very professional, knowledgeable and entertaining. She makes the photo shoot fun and engaging. She is my go to photographer for everything, literally, graduation, food photography, family photo. I will most definitely use photos by Shelly again. Thanks Shelly' },
    { name: 'The middle of our world', text: 'Shelly is really great and passionate about what she does. She goes the extra mile to get the perfect shot and make everyone feel comfortable showing off their personalities and it shows in her pictures. You’d be lucky to have her by your side to immortalize these special moments.' },
];

// Shelly's own words (old About page)
export const ABOUT = [
    'I’m a passionate photographer who believes in wearing my heart on my sleeve. A softie at heart, I find profound joy in connecting with people and capturing the genuine moments that make their stories come alive.',
    'As a proud Mama to two amazing adults, they inspire me and remind me of the boundless capacity of love. And by my side is my beloved companion, Rambo, my “teddy-alive” puppy dog, who adds an extra touch of joy and excitement to my life.',
    'Guided by love, humor, and kindness, I strive to create images that evoke deep emotions and leave a lasting impact. Trusting me with your precious moments is an honor I deeply appreciate. Together, let’s embark on this journey, creating timeless images that reflect the true essence of your story and capture the beauty that lies within.',
];
