// node scripts/build.mjs — writes the site's pages into public/ (Firebase Hosting serves that folder as it is).
// Content: scripts/site.mjs. Photos: public/img/<gallery>/NN.webp (+ NN-sm.webp), listed in scripts/photos.json.
// Look and behaviour: public/assets/site.css and site.js (hand-written, not generated).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ABOUT, BIZ, CATEGORIES, PACKAGES, REQUESTS, REVIEWS, SITE } from './site.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const PHOTOS = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photos.json'), 'utf8'));
const VERSION = Date.now().toString(36); // new address for css/js on every build, so nobody sees an old copy

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const photo = (set, n) => { const p = PHOTOS[set].find((x) => x.src === n); if (!p) throw new Error(`no photo ${set}/${n}`); return { ...p, set }; };
const url = (p, small) => `/img/${p.set}/${p.src}${small ? '-sm' : ''}.webp`;
const img = (p, { alt = '', cls = '', small = false, eager = false, sizes } = {}) =>
    `<img${cls ? ` class="${cls}"` : ''} src="${url(p, small)}" ${small ? '' : `srcset="${url(p, true)} 760w, ${url(p)} 1600w" sizes="${sizes || '100vw'}" `}width="${p.w}" height="${p.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
/** a gallery: the extra (featured) photos first, then the gallery's own */
const galleryOf = (c) => [...c.extra.map((n) => photo('featured', n)), ...PHOTOS[c.slug].map((p) => ({ ...p, set: c.slug }))];

const icon = {
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.7a3 3 0 110-6 3 3 0 010 6zm6-7.9a1.1 1.1 0 11-2.200 0 1.1 1.1 0 012.200 0zM12 3.6c2.700 0 3 0 4.100.1 2.700.1 4 1.4 4.100 4.100.1 1.100.1 1.400.1 4.100s0 3-.1 4.100c-.1 2.700-1.400 4-4.100 4.100-1.100.1-1.400.1-4.100.1s-3 0-4.100-.1c-2.700-.1-4-1.400-4.100-4.100C3.700 15 3.600 14.700 3.600 12s0-3 .1-4.100C3.800 5.200 5.100 3.900 7.900 3.800 9 3.700 9.300 3.600 12 3.600zM12 2c-2.700 0-3.100 0-4.200.1C4.200 2.200 2.200 4.200 2.100 7.800 2 8.900 2 9.300 2 12s0 3.100.1 4.200c.2 3.600 2.100 5.600 5.700 5.700 1.100.1 1.500.1 4.200.1s3.100 0 4.200-.1c3.600-.2 5.600-2.100 5.700-5.700.1-1.100.1-1.500.1-4.200s0-3.100-.1-4.200c-.2-3.600-2.100-5.600-5.700-5.700C15.100 2 14.700 2 12 2z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3c.3 2.300 1.700 4 4 4.300v3.100c-1.500 0-2.800-.4-4-1.200V15a6 6 0 11-6-6c.3 0 .7 0 1 .1v3.200a2.900 2.900 0 102 2.700V3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 8.200L4.500 7.500V8l7.500 5.700L19.500 8v-.5z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.600 10.800a15.100 15.100 0 006.600 6.600l2.200-2.200a1 1 0 011-.250c1.100.370 2.300.570 3.600.570a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.500a1 1 0 011 1c0 1.250.200 2.450.570 3.570a1 1 0 01-.250 1z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5l7 7-7 7-1.400-1.400 4.600-4.600H4v-2h12.200l-4.600-4.600z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.100 2 5 5.100 5 9c0 5.200 7 13 7 13s7-7.800 7-13c0-3.900-3.100-7-7-7zm0 9.500a2.500 2.500 0 110-5 2.500 2.500 0 010 5z"/></svg>',
};
const logo = (cls = '') => `<span class="logo ${cls}"><img class="logo__icon" src="/img/logo/emblem-800.webp" width="1084" height="737" alt=""><span class="logo__text"><span class="logo__word">Firefly</span><span class="logo__sub">Photography</span></span></span>`;
// the firefly emblem from the logo, big and faint behind the fireflies (like the crest behind the ASAP site's hero):
// a light sweeps over the gold and the two antenna lights glow (public/img/logo/emblem-*.webp, cut from the old site's logo)
const mark = (cls = '') => `<div class="mark ${cls}" aria-hidden="true"><img src="/img/logo/emblem-1600.webp" width="1084" height="737" alt=""><span class="mark__sheen"></span><i class="mark__light mark__light--l"></i><i class="mark__light mark__light--r"></i></div>`;

// ── the frame of every page
function page({ path, title, description, image = photo('featured', '02'), body, dark = true }) {
    const canonical = `${SITE}${path}`;
    const ld = { '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: BIZ.name,
        description: 'Newborns, families, high school seniors, maternity, headshots, boudoir, elopements and weddings in Denver, Littleton and across Colorado.',
        url: `${SITE}/`, telephone: BIZ.tel, email: BIZ.email, image: `${SITE}${url(photo('featured', '02'))}`, founder: BIZ.owner,
        address: { '@type': 'PostalAddress', addressLocality: 'Littleton', addressRegion: 'CO', addressCountry: 'US' },
        areaServed: ['Denver, CO', 'Littleton, CO', 'Colorado'], sameAs: [BIZ.instagram.url, BIZ.tiktok.url],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: String(REVIEWS.length) } };
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#15110e">
  <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}${url(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/site.css?v=${VERSION}">
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body class="${dark ? 'top-dark' : ''}">
<a class="skip" href="#main">Skip to content</a>
${header(path)}
<main id="main">
${body}
${book()}
</main>
${footer()}
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo">
  <button class="lightbox__close" type="button" aria-label="Close">×</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">›</button>
</div>
<script src="/assets/site.js?v=${VERSION}" defer></script>
<!-- System Requests (TEST PERIOD: shows for everyone; take out before launch) -->
<script>window.FF_REQUESTS = ${JSON.stringify(REQUESTS)};</script>
<script src="/assets/requests.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

function header(path) {
    const on = (p) => (path.startsWith(p) ? ' class="on"' : '');
    return `<header class="header" id="top">
  <div class="wrap header__row">
    <a class="header__logo" href="/" aria-label="${BIZ.name} — home">${logo()}</a>
    <nav class="nav" id="nav" aria-label="Main">
      <details class="drop">
        <summary${path.startsWith('/portfolio') ? ' class="on"' : ''}>Portfolio</summary>
        <div class="drop__panel">
${CATEGORIES.map((c) => `          <a href="/portfolio/${c.slug}/">${img(photo(...c.cover), { small: true, alt: '' })}<span>${esc(c.name)}</span></a>`).join('\n')}
        </div>
      </details>
      <a href="/pricing/"${on('/pricing')}>Pricing</a>
      <a href="/about/"${on('/about')}>About</a>
      <a href="/#reviews">Reviews</a>
      <a class="nav__social" href="${BIZ.instagram.url}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}<span>Instagram</span></a>
    </nav>
    <button class="rq-btn" type="button" data-request title="Report a problem or request a change"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2zm7 3v5h2V7h-2zm0 6.500v2h2v-2h-2z"/></svg><span>Report / Request</span></button>
    <a class="btn btn--glow btn--sm header__book" href="#book">Book a session</a>
    <button class="menu" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
  </div>
</header>`;
}

function book() {
    const options = [...CATEGORIES.map((c) => c.name), 'Boudoir', 'Branding / lifestyle', 'Something else'];
    return `<section class="book" id="book">
  ${mark('mark--book')}
  <canvas class="fireflies" aria-hidden="true"></canvas>
  <div class="wrap book__grid">
    <div class="book__copy reveal">
      <p class="kicker">Let’s create something beautiful</p>
      <h2>Book your <em>session.</em></h2>
      <p class="lead">Tell me a little about what you have in mind — the who, the when and the feeling you want to remember. I’ll get back to you personally.</p>
      <ul class="book__contact">
        <li><a href="mailto:${BIZ.email}">${icon.mail}${BIZ.email}</a></li>
        <li><a href="tel:${BIZ.tel}">${icon.phone}Call or text ${BIZ.phone}</a></li>
        <li><span>${icon.pin}${BIZ.place} · travel available</span></li>
      </ul>
      <div class="social">
        <a href="${BIZ.instagram.url}" target="_blank" rel="noopener">${icon.ig}${BIZ.instagram.handle}</a>
        <a href="${BIZ.tiktok.url}" target="_blank" rel="noopener">${icon.tt}${BIZ.tiktok.handle}</a>
      </div>
    </div>
    <form class="inquiry reveal" id="inquiry" novalidate>
      <div class="row2">
        <label class="field"><span>Your name</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <div class="row2">
        <label class="field"><span>Phone <em>optional</em></span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="field"><span>Session</span><select name="session" required><option value="">Choose one…</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Date or season <em>optional</em></span><input name="date" placeholder="e.g. June 14, or “early fall”"></label>
      <label class="field"><span>Tell me about it</span><textarea name="message" rows="4" placeholder="Who’s in the photos, where you’d love to shoot, anything that matters to you…"></textarea></label>
      <p class="inquiry__error" hidden role="alert"></p>
      <button class="btn btn--glow btn--lg" type="submit"><span>Send my inquiry</span>${icon.arrow}</button>
      <div class="inquiry__done" hidden>
        <span class="inquiry__spark" aria-hidden="true"></span>
        <h3>Thank you<span class="inquiry__name"></span>!</h3>
        <p>Your note is on its way to Shelly. You’ll hear back from her soon.</p>
      </div>
    </form>
  </div>
</section>`;
}

function footer() {
    return `<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <a href="/" aria-label="${BIZ.name} — home"><img class="footer__logo" src="/img/logo/logo-420.webp" width="420" height="380" alt="${BIZ.name}" loading="lazy"></a>
      <p>Natural, light-filled photography for the moments that matter — newborns to weddings, across ${BIZ.place}.</p>
    </div>
    <nav aria-label="Portfolio"><strong>Portfolio</strong>${CATEGORIES.map((c) => `<a href="/portfolio/${c.slug}/">${esc(c.name)}</a>`).join('')}</nav>
    <nav aria-label="More"><strong>Studio</strong><a href="/pricing/">Services &amp; pricing</a><a href="/about/">About Shelly</a><a href="/#reviews">Reviews</a><a href="#book">Book a session</a></nav>
    <div><strong>Say hello</strong><a href="mailto:${BIZ.email}">${BIZ.email}</a><a href="tel:${BIZ.tel}">${BIZ.phone}</a><a href="${BIZ.instagram.url}" target="_blank" rel="noopener">Instagram</a><a href="${BIZ.tiktok.url}" target="_blank" rel="noopener">TikTok</a></div>
  </div>
  <div class="wrap footer__row"><span>© <span class="year">2026</span> ${BIZ.name} · ${BIZ.owner}</span><a href="#top">Back to top ↑</a></div>
</footer>`;
}

const stars = `<span class="stars" aria-label="5 out of 5 stars">${icon.star.repeat(5)}</span>`;
const reviewCard = (r) => `<figure class="review"><span class="review__mark" aria-hidden="true">“</span>${stars}<blockquote>${esc(r.text)}</blockquote><figcaption><strong>${esc(r.name)}</strong><span>Google review</span></figcaption></figure>`;

function packageCard(p, full) {
    return `<article class="package${p.featured ? ' package--featured' : ''} reveal">
  ${p.featured ? '<span class="package__tag">The full day</span>' : ''}
  <h3>${esc(p.name)}</h3>
  <p class="package__price">${esc(p.price)}</p>
  <p class="package__for">${esc(p.for)}</p>
  <ul class="ticks">${p.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
  ${full ? `${p.addons ? `<p class="package__label">Add-ons</p><ul class="plain">${p.addons.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  <p class="package__label">Booking</p><p class="package__note">${esc(p.booking)}</p>
  ${p.notes?.length ? `<p class="package__label">Travel</p><ul class="plain">${p.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}` : ''}
  <a class="btn ${p.featured ? 'btn--glow' : 'btn--line'}" href="#book">Book this</a>
</article>`;
}

// ── home
function home() {
    const f = (n) => photo('featured', n);
    const strip = ['02', '07', '01', '05', '10', '06', '09', '03', '08', '04'].map((n) => f(n));
    return page({
        path: '/',
        title: 'Firefly Photography | Denver & Littleton Photographer — Weddings, Families, Seniors, Newborns',
        description: 'Natural, light-filled photography by Shelly Bowman in Denver, Littleton and across Colorado: weddings and elopements, families, high school seniors, newborns, maternity and headshots.',
        body: `<section class="hero">
  ${mark('mark--hero')}
  <canvas class="fireflies" aria-hidden="true"></canvas>
  <div class="hero__grain" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Photographer · ${BIZ.place}</p>
      <h1>Capturing the light <em>in your story.</em></h1>
      <p class="lead">Newborns and first steps, senior year and wedding days — honest, glowing photographs of the people you love, made with heart, humor and a whole lot of golden hour.</p>
      <div class="hero__actions">
        <a class="btn btn--glow btn--lg" href="#book">Book a session ${icon.arrow}</a>
        <a class="btn btn--ghost btn--lg" href="#work">See the work</a>
      </div>
      <ul class="hero__proof">
        <li>${stars}<span>${REVIEWS.length} five-star Google reviews</span></li>
        <li><strong>6</strong><span>kinds of sessions</span></li>
      </ul>
    </div>
    <div class="hero__stack" aria-hidden="true">
      ${img(photo('seniors', '13'), { cls: 'hero__p hero__p--a', sizes: '(max-width: 900px) 40vw, 300px', eager: true })}
      ${img(f('02'), { cls: 'hero__p hero__p--b', sizes: '(max-width: 900px) 60vw, 420px', eager: true })}
      ${img(f('07'), { cls: 'hero__p hero__p--c', sizes: '(max-width: 900px) 40vw, 280px', eager: true })}
    </div>
  </div>
  <a class="hero__scroll" href="#work" aria-label="Scroll down"><span></span></a>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${[...Array(2)].map(() => `<span>${CATEGORIES.map((c) => `<i>${esc(c.short)}</i>`).join('<b>✦</b>')}<b>✦</b><i>Boudoir</i><b>✦</b></span>`).join('')}</div></div>

<section class="section intro">
  <div class="wrap intro__grid">
    <div class="intro__photo reveal">${img(photo('shelly', 'shelly'), { alt: 'Shelly Bowman, the photographer behind Firefly Photography', sizes: '(max-width: 900px) 80vw, 420px' })}<span class="intro__badge">Hi, I’m Shelly ✦</span></div>
    <div class="intro__copy reveal">
      <p class="kicker">The heart behind the lens</p>
      <h2>A softie at heart, <em>chasing the light.</em></h2>
      <p>${esc(ABOUT[0])}</p>
      <p>Guided by love, humor and kindness, I make photographs that feel like you — relaxed, real, and full of the little in-between moments you’ll want to hold onto forever.</p>
      <a class="link-arrow" href="/about/">More about me ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="section work" id="work">
  <div class="wrap">
    <header class="section__head reveal"><p class="kicker">Portfolio</p><h2>Every chapter, <em>beautifully told.</em></h2></header>
    <div class="tiles">
${CATEGORIES.map((c, i) => `      <a class="tile reveal" style="--d:${i % 3}" href="/portfolio/${c.slug}/">${img(photo(...c.cover), { alt: c.name, sizes: '(max-width: 640px) 92vw, (max-width: 1020px) 46vw, 380px' })}<span class="tile__shade"></span><span class="tile__text"><strong>${esc(c.name)}</strong><span>${galleryOf(c).length} photos ${icon.arrow}</span></span></a>`).join('\n')}
    </div>
  </div>
</section>

<section class="filmstrip" aria-label="Favorite photos">
  <div class="filmstrip__track" data-gallery="featured">
${strip.map((p, i) => `    <button type="button" class="filmstrip__item" data-index="${i}" data-full="${url(p)}" aria-label="Open photo">${img(p, { small: true })}</button>`).join('\n')}
  </div>
</section>

<section class="section reviews" id="reviews">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">Kind words</p><h2>Loved by <em>real clients.</em></h2><p>${stars} 5.0 on Google · ${REVIEWS.length} reviews</p></header>
    <div class="reviews__grid">
${REVIEWS.slice(0, 6).map((r, i) => `      <div class="reveal" style="--d:${i % 3}">${reviewCard(r)}</div>`).join('\n')}
    </div>
    <p class="center reveal"><a class="link-arrow" href="/about/#reviews">Read all ${REVIEWS.length} reviews ${icon.arrow}</a></p>
  </div>
</section>

<section class="section steps-sec">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">How it works</p><h2>Easy from <em>hello to gallery.</em></h2></header>
    <ol class="steps">
      <li class="reveal"><span>01</span><h3>Say hello</h3><p>Send an inquiry, a text or an email. We’ll talk through your ideas, the location and the feel you’re after.</p></li>
      <li class="reveal" style="--d:1"><span>02</span><h3>Save your date</h3><p>A small retainer holds your date; the rest is due on the day of your session (or a week before a wedding).</p></li>
      <li class="reveal" style="--d:2"><span>03</span><h3>Have fun</h3><p>No stiff poses — just you, your people and plenty of laughs while I chase the best light.</p></li>
      <li class="reveal" style="--d:3"><span>04</span><h3>Relive it</h3><p>Your edited photos arrive as a full gallery, ready to share, print and treasure.</p></li>
    </ol>
  </div>
</section>

<section class="section pricing-teaser">
  <div class="wrap">
    <header class="section__head reveal"><p class="kicker">Services &amp; pricing</p><h2>Simple, <em>honest packages.</em></h2><p>Every session is tailored to you. Here’s where it starts.</p></header>
    <div class="packages">${PACKAGES.map((p) => packageCard(p, false)).join('')}</div>
    <p class="center reveal"><a class="link-arrow" href="/pricing/">Full details, add-ons &amp; travel ${icon.arrow}</a></p>
  </div>
</section>`,
    });
}

// ── one gallery page per category
function gallery(c, i) {
    const list = galleryOf(c);
    const prev = CATEGORIES[(i + CATEGORIES.length - 1) % CATEGORIES.length];
    const next = CATEGORIES[(i + 1) % CATEGORIES.length];
    const cover = photo(...c.cover);
    return page({
        path: `/portfolio/${c.slug}/`,
        title: `${c.name} Photography in Denver & Littleton, CO | Firefly Photography`,
        description: `${c.name} photography by Shelly Bowman of Firefly Photography — Denver, Littleton and across Colorado. ${c.blurb.slice(0, 110)}…`,
        image: cover,
        body: `<section class="page-hero">
  ${img(cover, { cls: 'page-hero__bg', eager: true, alt: '' })}
  <div class="page-hero__shade"></div>
  <canvas class="fireflies" aria-hidden="true"></canvas>
  <div class="wrap page-hero__copy">
    <p class="eyebrow"><a href="/#work">Portfolio</a> <span>/</span> ${esc(c.short)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="lead">${esc(c.blurb)}</p>
    <div class="chips">${CATEGORIES.map((x) => `<a class="chip${x === c ? ' on' : ''}" href="/portfolio/${x.slug}/">${esc(x.short)}</a>`).join('')}</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="masonry" data-gallery="${c.slug}">
${list.map((p, n) => `      <button type="button" class="masonry__item reveal" data-index="${n}" data-full="${url(p)}" aria-label="Open photo ${n + 1} of ${list.length}">${img(p, { alt: `${c.name} photo ${n + 1}`, small: true })}</button>`).join('\n')}
    </div>
    <nav class="pager" aria-label="More galleries">
      <a href="/portfolio/${prev.slug}/"><span>‹ Previous</span><strong>${esc(prev.name)}</strong></a>
      <a href="/portfolio/${next.slug}/"><span>Next ›</span><strong>${esc(next.name)}</strong></a>
    </nav>
  </div>
</section>`,
    });
}

function pricing() {
    return page({
        path: '/pricing/',
        title: 'Services & Pricing | Firefly Photography — Denver & Littleton, CO',
        description: 'Portrait & lifestyle sessions from $500, weddings $3,800, micro weddings & elopements $1,800, boudoir $600. Denver, Littleton and Colorado mountain weddings.',
        image: photo('featured', '05'),
        body: `<section class="page-hero page-hero--plain">
  ${mark('mark--page')}
  <canvas class="fireflies" aria-hidden="true"></canvas>
  <div class="wrap page-hero__copy">
    <p class="eyebrow">Services &amp; pricing</p>
    <h1>Packages made <em>for your moment.</em></h1>
    <p class="lead">From a one-hour portrait session to a full wedding day — clear prices, beautifully edited images and a gallery you’ll love. Not sure which fits? Just ask.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="packages packages--full">${PACKAGES.map((p) => packageCard(p, true)).join('')}</div>
    <div class="howto reveal">
      <div><p class="kicker">How to book</p><h2>Ready when <em>you are.</em></h2></div>
      <div class="howto__ways">
        <a href="mailto:${BIZ.email}">${icon.mail}<span>Email</span><strong>${BIZ.email}</strong></a>
        <a href="tel:${BIZ.tel}">${icon.phone}<span>Call / text</span><strong>${BIZ.phone}</strong></a>
        <a href="#book">${icon.arrow}<span>Online</span><strong>Send an inquiry</strong></a>
      </div>
    </div>
  </div>
</section>`,
    });
}

function about() {
    return page({
        path: '/about/',
        title: 'About Shelly | Firefly Photography — Denver & Littleton Photographer',
        description: 'Meet Shelly Bowman, the photographer behind Firefly Photography in Denver and Littleton, Colorado — and read what her clients say.',
        image: photo('shelly', 'shelly'),
        body: `<section class="page-hero page-hero--plain">
  ${mark('mark--page mark--left')}
  <canvas class="fireflies" aria-hidden="true"></canvas>
  <div class="wrap about-hero">
    <div class="about-hero__photo">${img(photo('shelly', 'shelly'), { eager: true, alt: 'Shelly Bowman', sizes: '(max-width: 900px) 80vw, 460px' })}</div>
    <div class="page-hero__copy">
      <p class="eyebrow">About</p>
      <h1>Hi, I’m <em>Shelly.</em></h1>
${ABOUT.map((p) => `      <p class="lead">${esc(p)}</p>`).join('\n')}
      <ul class="about-facts"><li>${icon.pin}Based in ${BIZ.place}</li><li>${icon.star}${REVIEWS.length} five-star reviews</li><li>${icon.ig}<a href="${BIZ.instagram.url}" target="_blank" rel="noopener">${BIZ.instagram.handle}</a></li></ul>
    </div>
  </div>
</section>
<section class="section reviews" id="reviews">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">Kind words</p><h2>What clients <em>say.</em></h2><p>${stars} 5.0 on Google · ${REVIEWS.length} reviews</p></header>
    <div class="reviews__grid">
${REVIEWS.map((r, i) => `      <div class="reveal" style="--d:${i % 3}">${reviewCard(r)}</div>`).join('\n')}
    </div>
  </div>
</section>`,
    });
}

// ── write it all
const write = (path, html) => { const dir = join(PUB, path); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'index.html'), html); };
write('', home());
CATEGORIES.forEach((c, i) => write(`portfolio/${c.slug}`, gallery(c, i)));
write('pricing', pricing());
write('about', about());
const pages = ['/', ...CATEGORIES.map((c) => `/portfolio/${c.slug}/`), '/pricing/', '/about/'];
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(PUB, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages · ${CATEGORIES.reduce((s, c) => s + galleryOf(c).length, 0)} gallery photos.`);
