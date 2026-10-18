// Shared pieces of every page: escaping, photos, icons, the page frame (head, header, footer, booking form).
// Pages themselves are in scripts/pages.mjs; scripts/build.mjs writes them out.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** fields that may carry a little markup (<em> in headlines) — only <em>, <strong>, <br> survive */
export const rich = (s) => esc(s).replace(/&lt;(\/?)(em|strong|br)&gt;/g, '<$1$2>');
export const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '');

/** a photo { src, sm, w, h, alt } as an <img> */
export function img(p, { alt, cls = '', eager = false, sizes = '100vw', small = false } = {}) {
    if (!p) return '';
    const a = alt ?? p.alt ?? '';
    const src = small && p.sm ? p.sm : p.src;
    const srcset = !small && p.sm && p.sm !== p.src ? ` srcset="${esc(p.sm)} 760w, ${esc(p.src)} ${p.w || 1600}w" sizes="${sizes}"` : '';
    const wh = p.w && p.h ? ` width="${p.w}" height="${p.h}"` : '';
    return `<img${cls ? ` class="${cls}"` : ''} src="${esc(src)}"${srcset}${wh} alt="${esc(a)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

export const icon = {
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.7a3 3 0 110-6 3 3 0 010 6zm6-7.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0zM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1C3.7 15 3.6 14.7 3.6 12s0-3 .1-4.1C3.8 5.2 5.1 3.9 7.9 3.8 9 3.7 9.3 3.6 12 3.6zM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.2 3.6 2.1 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.2 5.6-2.1 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.2-3.6-2.1-5.6-5.7-5.7C15.1 2 14.7 2 12 2z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3c.3 2.3 1.7 4 4 4.3v3.1c-1.5 0-2.8-.4-4-1.2V15a6 6 0 11-6-6c.3 0 .7 0 1 .1v3.2a2.9 2.9 0 102 2.7V3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 8.2L4.5 7.5V8l7.5 5.7L19.5 8v-.5z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25c1.1.37 2.3.57 3.6.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5l7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z" fill="#34A853"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 000 9.2z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z" fill="#EA4335"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 5.4L14 4l-8 8 8 8 1.4-1.4L8.8 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.4L10 4l8 8-8 8-1.4-1.4 6.6-6.6z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21l-1.4-1.3C5.4 15 2 11.9 2 8.1 2 5 4.4 2.6 7.5 2.6c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1C19.6 2.6 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6z"/></svg>',
};

export const stars = (n = 5) => `<span class="stars" role="img" aria-label="${n} out of 5 stars">${icon.star.repeat(Math.round(n))}</span>`;
export const logo = () => `<span class="logo"><img class="logo__icon" src="/img/logo/emblem-800.webp" width="1084" height="737" alt=""><span class="logo__text"><span class="logo__word">Firefly</span><span class="logo__sub">Photography</span></span></span>`;
/** the firefly emblem from the logo, big and faint, with a light sweeping over the gold and the two antenna lights glowing */
export const mark = (cls = '') => `<div class="mark ${cls}" aria-hidden="true"><img src="/img/logo/emblem-1600.webp" width="1084" height="737" alt=""><span class="mark__sheen"></span><i class="mark__light mark__light--l"></i><i class="mark__light mark__light--r"></i></div>`;
/** the moving fireflies (drawn by site.js). tone: 'dark' (gold on night) or 'light' (amber on ivory) */
export const flies = (tone = 'dark', density = 1) => `<canvas class="fireflies" data-tone="${tone}" data-density="${density}" aria-hidden="true"></canvas>`;

export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Denver' });
export const readMins = (html) => Math.max(2, Math.round(plain(html).split(/\s+/).length / 220));

/** the whole page */
export function page(C, { path, title, description, image, body, dark = true, ld = [], bookFor = '', noBook = false, noindex = false, bodyClass = '' }) {
    const { SITE, BIZ, SETTINGS, VERSION, REQUESTS } = C;
    const canonical = `${SITE}${path}`;
    const share = image ? (image.src.startsWith('http') ? image.src : `${SITE}${image.src}`) : `${SITE}/img/featured/02.webp`;
    const business = {
        '@context': 'https://schema.org', '@type': ['LocalBusiness', 'ProfessionalService'], '@id': `${SITE}/#business`, name: BIZ.name,
        description: 'Wedding, elopement, family, senior, newborn, maternity and headshot photography in Denver, Littleton and across Colorado.',
        url: `${SITE}/`, telephone: BIZ.tel, email: BIZ.email, image: `${SITE}/img/featured/02.webp`, logo: `${SITE}/img/logo/logo-900.webp`,
        founder: { '@type': 'Person', name: BIZ.owner }, priceRange: '$$',
        address: { '@type': 'PostalAddress', addressLocality: BIZ.city, addressRegion: BIZ.region, addressCountry: 'US' },
        areaServed: BIZ.areas.filter((a) => !a.startsWith('the ')).map((a) => ({ '@type': 'City', name: `${a}, CO` })).concat([{ '@type': 'State', name: 'Colorado' }]),
        sameAs: [BIZ.instagram.url, BIZ.tiktok.url, SETTINGS.googleReviewsUrl].filter(Boolean),
    };
    const lds = [business, ...ld].map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n  ');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  ${noindex ? '<meta name="robots" content="noindex">' : C.LAUNCHED ? '' : '<meta name="robots" content="noindex" data-test-site>'}
  ${SETTINGS.gscVerification ? `<meta name="google-site-verification" content="${esc(SETTINGS.gscVerification)}">` : ''}
  <meta name="theme-color" content="#1b1917">
  <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:site_name" content="${esc(BIZ.name)}">
  <meta property="og:type" content="${path.startsWith('/journal/') && path.split('/').length > 3 ? 'article' : 'website'}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${esc(share)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/site.css?v=${VERSION}">
  <script>document.documentElement.classList.add('js')</script>
  ${lds}
  ${SETTINGS.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(SETTINGS.gaId)}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(SETTINGS.gaId)}');</script>` : ''}
</head>
<body class="${[dark ? 'top-dark' : '', bodyClass].filter(Boolean).join(' ')}">
<a class="skip" href="#main">Skip to content</a>
${header(C, path)}
<main id="main">
${body}
${noBook ? '' : book(C, bookFor)}
</main>
${footer(C)}
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button class="lightbox__close" type="button" aria-label="Close">×</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">${icon.prev}</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">${icon.next}</button>
</div>
<script>window.FF = ${JSON.stringify({ email: BIZ.email, firebase: C.FIREBASE, inquiries: 'firefly_inquiries' })};</script>
<script src="/assets/site.js?v=${VERSION}" defer></script>
<!-- System Requests (TEST PERIOD: shows for everyone; take out before launch) -->
<script>window.FF_REQUESTS = ${JSON.stringify(REQUESTS)};</script>
<script src="/assets/requests.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

function header(C, path) {
    const { BIZ, services } = C;
    const on = (p) => (path.startsWith(p) ? ' class="on" aria-current="page"' : '');
    const inPortfolio = path === '/portfolio/' || services.some((s) => path.startsWith(`/${s.slug}/`));
    return `<header class="header" id="top">
  <div class="wrap header__row">
    <a class="header__logo" href="/" aria-label="${esc(BIZ.name)} — home">${logo()}</a>
    <nav class="nav" id="nav" aria-label="Main">
      <details class="drop">
        <summary${inPortfolio ? ' class="on"' : ''}>Portfolio</summary>
        <div class="drop__panel">
${services.map((s) => `          <a href="/${s.slug}/">${img(s.cover, { small: true, alt: '' })}<span>${esc(s.name)}</span></a>`).join('\n')}
          <a class="drop__all" href="/portfolio/"><span>All galleries ${icon.arrow}</span></a>
        </div>
      </details>
      <a href="/experience/"${on('/experience')}>Experience</a>
      <a href="/pricing/"${on('/pricing')}>Pricing</a>
      <a href="/journal/"${on('/journal')}>Journal</a>
      <a href="/about/"${on('/about')}>About</a>
      <a href="/reviews/"${on('/reviews')}>Reviews</a>
      <a class="nav__cta" href="/contact/">Inquire</a>
      <a class="nav__erp" href="/admin/">Studio ERP ↗</a>
    </nav>
    <!-- TEST PERIOD (owner 2026-10-17): a way into the ERP from the site; take out before launch with the Report / Request button -->
    <a class="rq-btn erp-btn" href="/admin/" title="Open the Firefly Studio ERP"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg><span>ERP</span></a>
    <button class="rq-btn" type="button" data-request title="Report a problem or request a change"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2zm7 3v5h2V7h-2zm0 6.5v2h2v-2h-2z"/></svg><span>Report / Request</span></button>
    <a class="btn btn--gold btn--sm header__book" href="/contact/">Inquire</a>
    <button class="menu" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
  </div>
</header>`;
}

/** the invitation + inquiry form at the bottom of most pages (and the whole of /contact/) */
export function book(C, preset = '', { standalone = false } = {}) {
    const { BIZ, services } = C;
    const options = [...services.map((s) => s.name), 'Something else'];
    return `<section class="book${standalone ? ' book--page' : ''}" id="book">
  ${mark('mark--book')}
  ${flies('dark', 0.8)}
  <div class="wrap book__grid">
    <div class="book__copy reveal">
      <p class="kicker">Let’s create something beautiful</p>
      ${standalone ? '<h1>Tell me <em>your story.</em></h1>' : '<h2>Tell me <em>your story.</em></h2>'}
      <p class="lead">Share a little about what you’re dreaming of — who’s in the photos, when and where, and the feeling you want to remember. I read every note myself and will be in touch personally.</p>
      <ul class="book__contact">
        <li><a href="mailto:${esc(BIZ.email)}">${icon.mail}${esc(BIZ.email)}</a></li>
        <li><a href="tel:${esc(BIZ.tel)}">${icon.phone}Call or text ${esc(BIZ.phone)}</a></li>
        <li><span>${icon.pin}${esc(BIZ.place)} · travel available</span></li>
      </ul>
      <div class="social">
        <a href="${esc(BIZ.instagram.url)}" target="_blank" rel="noopener">${icon.ig}${esc(BIZ.instagram.handle)}</a>
        <a href="${esc(BIZ.tiktok.url)}" target="_blank" rel="noopener">${icon.tt}${esc(BIZ.tiktok.handle)}</a>
      </div>
    </div>
    <form class="inquiry reveal" id="inquiry" novalidate>
      <div class="row2">
        <label class="field"><span>Your name</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
      </div>
      <div class="row2">
        <label class="field"><span>Phone <em>optional</em></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label>
        <label class="field"><span>Type of photography</span><select name="session" required><option value="">Choose one…</option>${options.map((o) => `<option${o === preset ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
      </div>
      <div class="row2">
        <label class="field"><span>Preferred date <em>or season</em></span><input name="date" placeholder="e.g. June 14, or “early fall”"></label>
        <label class="field"><span>Location <em>if you know it</em></span><input name="location" placeholder="e.g. Chautauqua Park, our home"></label>
      </div>
      <label class="field"><span>What are you envisioning?</span><textarea name="message" rows="4" placeholder="Who’s in the photos, the feeling you want, anything that matters to you…"></textarea></label>
      <label class="field"><span>How did you find me? <em>optional</em></span><input name="source" placeholder="Instagram, Google, a friend…"></label>
      <label class="hp" aria-hidden="true">Leave this empty<input name="_honey" tabindex="-1" autocomplete="off"></label>
      <p class="inquiry__error" hidden role="alert"></p>
      <button class="btn btn--gold btn--lg" type="submit"><span>Send my inquiry</span>${icon.arrow}</button>
      <p class="inquiry__fine">You’ll receive an email confirming your note arrived. Your details are only used to reply to you.</p>
      <div class="inquiry__done" hidden>
        <span class="inquiry__spark" aria-hidden="true"></span>
        <h3>Thank you<span class="inquiry__name"></span>!</h3>
        <p>Your note is on its way to Shelly, and a confirmation is heading to your inbox. You’ll hear back from her personally, soon.</p>
      </div>
    </form>
  </div>
</section>`;
}

function footer(C) {
    const { BIZ, services, SETTINGS } = C;
    return `<footer class="footer">
  ${flies('dark', 0.35)}
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a href="/" aria-label="${esc(BIZ.name)} — home"><img class="footer__logo" src="/img/logo/logo-420.webp" width="420" height="380" alt="${esc(BIZ.name)}" loading="lazy"></a>
      <p class="footer__tag">${esc(BIZ.tagline)}</p>
      <p>Weddings, elopements, families, seniors, newborns, maternity and headshots in ${esc(BIZ.areas.slice(0, -1).join(', '))} and ${esc(BIZ.areas.at(-1))}.</p>
    </div>
    <nav aria-label="Portfolio"><strong>Portfolio</strong>${services.map((s) => `<a href="/${s.slug}/">${esc(s.name)}</a>`).join('')}</nav>
    <nav aria-label="Studio"><strong>Studio</strong><a href="/experience/">The Firefly Experience</a><a href="/pricing/">Pricing &amp; packages</a><a href="/about/">About Shelly</a><a href="/reviews/">Kind words</a><a href="/journal/">The Journal</a><a href="/contact/">Inquire</a></nav>
    <div><strong>Say hello</strong><a href="mailto:${esc(BIZ.email)}">${esc(BIZ.email)}</a><a href="tel:${esc(BIZ.tel)}">${esc(BIZ.phone)}</a><a href="${esc(BIZ.instagram.url)}" target="_blank" rel="noopener">Instagram</a><a href="${esc(BIZ.tiktok.url)}" target="_blank" rel="noopener">TikTok</a>${SETTINGS.googleReviewsUrl ? `<a href="${esc(SETTINGS.googleReviewsUrl)}" target="_blank" rel="noopener">Google reviews</a>` : ''}</div>
  </div>
  <div class="wrap footer__row"><span>© <span class="year">2026</span> ${esc(BIZ.name)} · ${esc(BIZ.owner)} · ${esc(BIZ.place)}</span><a href="#top">Back to top ↑</a></div>
</footer>`;
}

// ── shared blocks
export const reviewCard = (C, r, { big = false } = {}) => `<figure class="review${big ? ' review--big' : ''}" data-tags="${esc((r.tags || []).join(' '))}">
  <span class="review__mark" aria-hidden="true">“</span>${stars(r.rating || 5)}
  <blockquote>${esc(r.text)}</blockquote>
  <figcaption><strong>${esc(r.name)}</strong><span>${r.source === 'demo' ? 'Demo review (testing)' : `${icon.google} Google review`}</span></figcaption>
</figure>`;

export function reviewsCarousel(C, list, { head = true } = {}) {
    const { SETTINGS } = C;
    return `<section class="section kind" id="reviews" aria-label="Client reviews">
  ${flies('light', 0.5)}
  <div class="wrap">
    ${head ? `<header class="section__head section__head--center reveal">
      <p class="kicker">Kind words</p>
      <h2>Kind Words, <em>Lasting Impressions</em></h2>
      <p class="section__sub">The photographs matter. So does the experience of creating them.</p>
    </header>` : ''}
    ${ratingBar(C)}
    <div class="carousel reveal" data-carousel>
      <div class="carousel__track">
${list.map((r) => `        <div class="carousel__slide">${reviewCard(C, r, { big: true })}</div>`).join('\n')}
      </div>
      <div class="carousel__ui">
        <button class="carousel__btn" type="button" data-prev aria-label="Previous review">${icon.prev}</button>
        <div class="carousel__dots" role="tablist"></div>
        <button class="carousel__btn" type="button" data-next aria-label="Next review">${icon.next}</button>
      </div>
    </div>
    <p class="center reveal kind__links"><a class="link-arrow" href="/reviews/">Read every review ${icon.arrow}</a>${SETTINGS.googleWriteReviewUrl ? ` <a class="link-arrow" href="${esc(SETTINGS.googleWriteReviewUrl)}" target="_blank" rel="noopener">Leave a review ${icon.arrow}</a>` : ''}</p>
  </div>
</section>`;
}

export function ratingBar(C) {
    const { SETTINGS } = C;
    const r = Number(SETTINGS.googleRating || 5).toFixed(1);
    const inner = `${icon.google}<span class="rating__num">${r}</span>${stars(Number(r))}<span class="rating__count">${SETTINGS.googleReviewCount} Google reviews</span>`;
    return `<div class="rating reveal">${SETTINGS.googleReviewsUrl ? `<a href="${esc(SETTINGS.googleReviewsUrl)}" target="_blank" rel="noopener">${inner}</a>` : `<span>${inner}</span>`}</div>`;
}

export function packageBlock(C, p, { compact = false } = {}) {
    const portrait = p.process === 'portrait';
    return `<article class="pkg${p.featured ? ' pkg--featured' : ''} reveal" id="pkg-${esc(p.id)}">
  <div class="pkg__head">
    ${p.featured ? '<span class="pkg__tag">The full day</span>' : ''}
    <h3>${esc(p.name)}</h3>
    <p class="pkg__price">${esc(p.price)}</p>
    ${p.where ? `<p class="pkg__where">${esc(p.where)}</p>` : ''}
    <p class="pkg__for">${esc(p.for)}</p>
  </div>
  <div class="pkg__body">
    <p class="pkg__label">Included</p>
    <ul class="ticks">${p.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    ${compact ? '' : `${p.addons?.length ? `<p class="pkg__label">Add-ons</p><ul class="plain">${p.addons.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    <p class="pkg__label">Reserving your date</p><p class="pkg__note">${esc(p.booking)}</p>
    ${p.notes?.length ? `<p class="pkg__label">Travel</p><ul class="plain">${p.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    <p class="pkg__process">${portrait
        ? `${icon.heart}<span>You’ll choose your favorites from a private proof gallery for detailed editing, and receive the remaining usable proofs too. <a href="/experience/#process">How it works</a></span>`
        : `${icon.heart}<span>Weddings and elopements have their own editing and delivery process. <a href="/experience/#process-wedding">How it works</a></span>`}</p>`}
  </div>
  <a class="btn ${p.featured ? 'btn--gold' : 'btn--line'}" href="/contact/?session=${encodeURIComponent(p.id)}">Inquire about this</a>
</article>`;
}

export function journalCard(C, a, { big = false } = {}) {
    const cat = C.JOURNAL_CATEGORIES.find((c) => c.slug === a.category);
    return `<article class="jcard${big ? ' jcard--big' : ''} reveal">
  <a href="/journal/${esc(a.slug)}/" class="jcard__img">${img(a.cover, { sizes: big ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 640px) 100vw, 33vw', alt: a.cover?.alt || '' })}</a>
  <div class="jcard__text">
    <p class="jcard__meta">${cat ? `<a href="/journal/category/${esc(cat.slug)}/">${esc(cat.name)}</a> · ` : ''}<time datetime="${esc(a.publishAt)}">${fmtDate(a.publishAt)}</time></p>
    <h3><a href="/journal/${esc(a.slug)}/">${esc(a.title)}</a></h3>
    ${big || a.excerpt ? `<p class="jcard__excerpt">${esc(a.excerpt)}</p>` : ''}
    <a class="link-arrow" href="/journal/${esc(a.slug)}/">Read the story ${icon.arrow}</a>
  </div>
</article>`;
}

/** an editorial gallery: a featured spread of the first photos, then a masonry wall; every photo opens the viewer */
export function gallery(list, { name = '', id = 'g', lead = 5 } = {}) {
    if (!list.length) return '';
    const spread = list.slice(0, Math.min(lead, list.length));
    const rest = list.slice(spread.length);
    const btn = (p, n, cls, sizes) => `<button type="button" class="${cls}" data-index="${n}" data-full="${esc(p.src)}" data-alt="${esc(p.alt || name)}" aria-label="Open photo ${n + 1} of ${list.length}">${img(p, { alt: p.alt || `${name} photo ${n + 1}`, sizes })}</button>`;
    return `<div class="egallery" data-gallery="${esc(id)}">
  <div class="spread spread--${spread.length}">
${spread.map((p, n) => `    ${btn(p, n, `spread__item spread__item--${n + 1} reveal`, n === 0 ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 900px) 50vw, 30vw')}`).join('\n')}
  </div>
  ${rest.length ? `<div class="masonry">
${rest.map((p, i) => `    ${btn(p, i + spread.length, 'masonry__item reveal', '(max-width: 640px) 50vw, 33vw')}`).join('\n')}
  </div>` : ''}
</div>`;
}
