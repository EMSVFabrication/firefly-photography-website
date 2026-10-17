// The first Journal articles (drafted for Shelly to review — her voice, her facts). Once the ERP is in use, articles
// live in Firebase (firefly_journal) and these are only the starting copies it imports.
// body: simple HTML (p, h2, h3, ul/ol, blockquote, figure). Photos use /img/... paths or uploaded photo URLs.

const fig = (src, alt, cls = '') => `<figure${cls ? ` class="${cls}"` : ''}><img src="${src}" alt="${alt}" loading="lazy"></figure>`;
const duo = (a, b) => `<div class="j-duo">${fig(a[0], a[1])}${fig(b[0], b[1])}</div>`;

export const JOURNAL = [
    {
        slug: 'what-to-expect-during-your-firefly-photography-session',
        title: 'What to Expect During Your Firefly Photography Session',
        category: 'style-inspiration',
        status: 'published', publishAt: '2026-10-10T15:00:00.000Z',
        excerpt: 'Never been in front of a professional camera? Here’s exactly how a session with me works — from the first hello to your final gallery.',
        seoTitle: 'What to Expect at Your Photo Session | Firefly Photography, Denver',
        seoDescription: 'How a Firefly Photography portrait session works, step by step: planning, gentle posing direction, your proof gallery and choosing 15 favorites for detailed editing.',
        cover: { src: '/img/featured/06.webp', sm: '/img/featured/06-sm.webp', w: 1280, h: 1600, alt: 'Couple laughing together in tall Colorado grass' },
        body: `
<p class="j-lead">Most people I photograph tell me the same thing before we start: “I’m so awkward in front of the camera.” If that’s you, you’re in good company — and you’re exactly who I love working with.</p>
<p>Here’s what a portrait session with me actually looks like, so you can walk in knowing what to expect.</p>
<h2>Before the session: planning together</h2>
<p>It starts with a conversation. You tell me what you’re envisioning — who’s in the photos, the feeling you want, any must-have shots — and we choose a location and time of day that gives us beautiful light. I’ll recommend Colorado spots that fit your style and share preparation and outfit guidance so nothing feels like guesswork.</p>
${fig('/img/featured/03.webp', 'Woman walking through a golden summer field at sunset', 'j-wide')}
<h2>During the session: you don’t have to know how to pose</h2>
<p>This is the part people worry about most, and it’s the part I enjoy most. I’ll guide you the whole way: where to stand, what to do with your hands, how to angle toward the light, when to move. Between the composed portraits we’ll laugh, walk, try things and leave room for the moments nobody could have planned.</p>
<blockquote>You don’t have to know what to do with your hands or how to pose. That’s my job.</blockquote>
${duo(['/img/family/03.webp', 'Family blowing bubbles together on a hillside'], ['/img/seniors/41.webp', 'Senior portrait in warm evening light'])}
<h2>After the session: your proof gallery</h2>
<p>I review everything we captured and prepare a private online proof gallery of all the usable images. You’ll get to see the whole session, not just a handful of selects.</p>
<h2>Choosing your 15 favorites</h2>
<p>For standard portrait packages, you choose the 15 photographs you love most just by tapping the heart in your gallery. Those 15 go through my detailed editing process. You also receive the remaining usable proof images — so you end up with a broad collection of memories <em>and</em> a carefully refined collection of favorite portraits.</p>
<p><em>Weddings and elopements follow their own process and delivery, which we’ll go over together when you book.</em></p>
<h2>The part that matters most</h2>
<p>The goal isn’t simply to look incredible in your photographs. It’s to feel comfortable, confident, and genuinely enjoy creating them. If you’re ready, <a href="/contact/">tell me your story</a> — I’d love to hear it.</p>`,
    },
    {
        slug: 'why-golden-hour-is-so-beautiful-for-outdoor-portraits',
        title: 'Why Golden Hour Is So Beautiful for Outdoor Portraits',
        category: 'style-inspiration',
        status: 'published', publishAt: '2026-10-03T15:00:00.000Z',
        excerpt: 'That warm, glowing light right before sunset isn’t just pretty — it’s the most flattering light of the day. Here’s why I plan sessions around it.',
        seoTitle: 'Why Golden Hour Is Best for Outdoor Portraits | Denver Photographer',
        seoDescription: 'What golden hour is, why it’s so flattering for portraits, and how Firefly Photography plans Denver and Colorado sessions around the best light.',
        cover: { src: '/img/featured/02.webp', sm: '/img/featured/02-sm.webp', w: 1280, h: 1600, alt: 'Couple embracing in a meadow as the sun sets behind the mountains' },
        body: `
<p class="j-lead">If you’ve ever noticed how everyone looks a little more beautiful in the last hour before sunset, you’ve already discovered golden hour.</p>
<h2>What is golden hour?</h2>
<p>Golden hour is the time shortly after sunrise and before sunset when the sun sits low in the sky. Its light travels through more of the atmosphere, which softens it and warms it into those honey and amber tones we all love.</p>
<h2>Why it’s so flattering</h2>
<ul>
<li><strong>Soft light, soft shadows.</strong> Midday sun creates harsh shadows under eyes and noses. Low sun wraps gently around faces instead.</li>
<li><strong>Warm, glowing skin.</strong> The warm color is naturally flattering on every skin tone.</li>
<li><strong>Backlight and glow.</strong> With the sun behind you, I can create that dreamy rim of light in your hair and through tall grass.</li>
<li><strong>No squinting.</strong> Lower, gentler light means relaxed eyes and natural expressions.</li>
</ul>
${fig('/img/maternity/01.webp', 'Expecting couple backlit by golden evening light', 'j-wide')}
<h2>Golden hour in Colorado</h2>
<p>Our mountains change the math a little. On the west side of Denver and in the foothills, the sun can drop behind the peaks earlier than the official sunset, so I plan start times around each location — not just the clock. Out on the open plains, we often get light a little longer.</p>
${duo(['/img/maternity/06.webp', 'Maternity portrait in tall summer grass'], ['/img/featured/03.webp', 'Woman holding a basket in a golden field'])}
<h2>What if golden hour doesn’t work for us?</h2>
<p>Schedules are real, and little ones have bedtimes. Open shade, overcast days and soft window light at home can all be beautiful too — finding the best light wherever we are is part of my job.</p>
<p>Thinking about an outdoor session? <a href="/contact/">Let’s find your light.</a></p>`,
    },
    {
        slug: 'how-to-prepare-for-your-newborn-photography-session',
        title: 'How to Prepare for Your Newborn Photography Session',
        category: 'newborns-maternity',
        status: 'published', publishAt: '2026-09-26T15:00:00.000Z',
        excerpt: 'Simple, stress-free tips for an in-home newborn session — what to wear, how to get your home ready, and why there’s no such thing as a “perfect” baby day.',
        seoTitle: 'How to Prepare for a Newborn Photo Session | Denver Newborn Photographer',
        seoDescription: 'Practical tips for an in-home newborn photography session in Denver: timing, what to wear, preparing your space and keeping baby comfortable.',
        cover: { src: '/img/newborn/07.webp', sm: '/img/newborn/07-sm.webp', w: 1500, h: 1002, alt: 'Parents smiling down at their newborn baby' },
        body: `
<p class="j-lead">The best newborn photos aren’t about elaborate props or perfect poses. They’re about the way you look at your baby — and that’s already there. Here’s how to make the session easy.</p>
<h2>Relax: the session follows your baby</h2>
<p>Newborn sessions are unhurried. Feeding breaks, diaper changes and cuddles are all part of the plan, and some of the sweetest images happen in between.</p>
<h2>Getting your home ready</h2>
<ul>
<li><strong>Light is everything.</strong> Open the curtains in the room with the most natural light — often a bedroom or living room. I’ll help find the best spot when I arrive.</li>
<li><strong>Keep it warm.</strong> Newborns love a cozy room, especially if we capture some skin-to-skin moments.</li>
<li><strong>Tidy one or two spaces.</strong> You don’t need a spotless house — just clear the area where we’ll photograph.</li>
</ul>
${fig('/img/newborn/11.webp', 'Mother holding her newborn close by a bright window', 'j-wide')}
<h2>What to wear</h2>
<p>Soft, neutral, comfortable clothes photograph beautifully and keep the attention on your baby. Think creams, soft whites, muted earth tones and simple textures. Avoid big logos and busy patterns. Barefoot is perfect.</p>
${duo(['/img/newborn/18.webp', 'Mother smiling at her newborn'], ['/img/newborn/32.webp', 'Newborn baby looking up in a parent’s hands'])}
<h2>Siblings and pets</h2>
<p>Absolutely include them! I keep sibling photos short and playful, and a gentle family dog can make for some of the most treasured frames.</p>
<h2>Most importantly</h2>
<p>There’s no such thing as a “perfect” baby day — and you don’t need one. Bring your love; I’ll take care of the rest. <a href="/newborns/">See newborn sessions</a> or <a href="/contact/">tell me about your little one</a>.</p>`,
    },
    {
        slug: 'beautiful-places-for-family-photos-near-denver',
        title: '10 Beautiful Places for Family Photos Near Denver',
        category: 'location-guides',
        status: 'published', publishAt: '2026-09-19T15:00:00.000Z',
        excerpt: 'From foothill meadows to tree-lined city parks, these are some of my favorite Denver-area spots for family photos — and what makes each one special.',
        seoTitle: '10 Best Places for Family Photos Near Denver | Firefly Photography',
        seoDescription: 'A Denver family photographer’s guide to beautiful family photo locations near Denver, Littleton, Morrison, Evergreen and Boulder — with tips on light and timing.',
        cover: { src: '/img/family/05.webp', sm: '/img/family/05-sm.webp', w: 1500, h: 1129, alt: 'Family portrait on a Colorado hillside' },
        body: `
<p class="j-lead">One of the best parts of photographing families around Denver is how much variety is close by — open meadows, foothills, lakes and leafy city parks, often within a short drive.</p>
<p>Here are ten places I love, with a few notes on what makes each one special. (Some parks charge entry fees or require photography permits; we’ll talk it through when we plan your session.)</p>
<h2>1. Chautauqua Park, Boulder</h2>
<p>The Flatirons make an iconic backdrop, and the open meadow glows at golden hour.</p>
<h2>2. Mount Falcon Park, Morrison</h2>
<p>Sweeping foothill views and golden grasses — a favorite of mine for engagement and family sessions alike.</p>
<h2>3. Red Rocks Park, Morrison</h2>
<p>Dramatic red sandstone formations for families who want something bold and unmistakably Colorado.</p>
<h2>4. Evergreen Lake, Evergreen</h2>
<p>Water, pines and mountain light. Gorgeous in fall, and magical with a dusting of snow.</p>
${fig('/img/family/07.webp', 'Extended family laughing together outdoors in Colorado', 'j-wide')}
<h2>5. Lair o’ the Bear Park, Idledale</h2>
<p>A creek, cottonwoods and wooded trails — perfect for playful, wandering sessions with kids.</p>
<h2>6. Chatfield State Park, Littleton</h2>
<p>Open prairie, water views and long, soft evening light on the plains side of the metro area.</p>
<h2>7. Washington Park, Denver</h2>
<p>Classic tree-lined paths, gardens and lakes right in the city — easy for families with little ones.</p>
<h2>8. Hudson Gardens, Littleton</h2>
<p>Lush, beautifully kept gardens for a romantic, timeless feel.</p>
<h2>9. Deer Creek Canyon, Littleton</h2>
<p>Rolling foothills and wide open sky just minutes from town.</p>
<h2>10. Your own backyard</h2>
<p>Honestly? Some of my favorite family sessions happen at home, where everyone is most relaxed.</p>
${duo(['/img/family/02.webp', 'Girl in a lavender dress holding wildflowers'], ['/img/family/08.webp', 'Two friends laughing in a golden field'])}
<h2>Choosing the right spot for your family</h2>
<p>Think about the feeling you want: wide open and airy, or cozy and wooded? How far are your kids willing to walk? And what time of day can you realistically be there? I’ll help match a location to your family and plan around the best light. <a href="/families/">See family sessions</a> or <a href="/contact/">start planning yours</a>.</p>`,
    },
];
