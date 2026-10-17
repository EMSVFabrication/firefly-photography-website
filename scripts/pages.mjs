// Every page of the site. Each function takes the content (C) and returns { path, html }.
import { book, esc, flies, fmtDate, gallery, icon, img, journalCard, mark, packageBlock, page, plain, ratingBar, readMins, reviewCard, reviewsCarousel, rich, stars } from './lib.mjs';

const pkgOf = (C, s) => C.PACKAGES.find((p) => p.id === s.package);
const reviewsFor = (C, tag, n = 3) => { const t = C.REVIEWS.filter((r) => r.tags?.includes(tag)); return (t.length ? t : C.REVIEWS.filter((r) => r.featured)).slice(0, n); };
const crumbs = (C, items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${C.SITE}${path}` })) });

/** the "From the First Hello to Your Final Gallery" timeline (both processes, tabs) */
function timeline(C, first = 'portrait') {
    const tab = (k) => C.PROCESS[k];
    const order = first === 'wedding' ? ['wedding', 'portrait'] : ['portrait', 'wedding'];
    return `<section class="section process" id="process">
  ${flies('dark', 0.6)}
  <div class="wrap">
    <header class="section__head section__head--center reveal">
      <p class="kicker">The process</p>
      <h2>From the First Hello <em>to Your Final Gallery</em></h2>
      <p class="section__sub">Easy, enjoyable and organized — so you always know what comes next.</p>
    </header>
    <div class="tabs reveal" role="tablist" aria-label="Choose a process">
${order.map((k, i) => `      <button class="tabs__btn${i === 0 ? ' on' : ''}" type="button" role="tab" id="tab-${k}" aria-controls="process-${k}" aria-selected="${i === 0}">${esc(tab(k).title)}</button>`).join('\n')}
    </div>
${order.map((k, i) => `    <div class="timeline" id="process-${k === 'wedding' ? 'wedding' : 'portrait'}" role="tabpanel" aria-labelledby="tab-${k}"${i === 0 ? '' : ' hidden'}>
      <p class="timeline__note">${esc(tab(k).note)}</p>
      <ol>
${tab(k).steps.map((st, n) => `        <li class="reveal"><span class="timeline__n">${String(n + 1).padStart(2, '0')}</span><div><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></div></li>`).join('\n')}
      </ol>
    </div>`).join('\n')}
  </div>
</section>`;
}

function faqBlock(C, list = C.FAQS) {
    return `<section class="section faq" id="faq">
  <div class="wrap faq__grid">
    <header class="section__head reveal"><p class="kicker">Good to know</p><h2>Questions, <em>answered.</em></h2><p class="section__sub">Anything else on your mind? <a href="/contact/">Just ask</a> — I’m happy to help.</p></header>
    <div class="faq__list">
${list.map((f) => `      <details class="faq__item reveal"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
    </div>
  </div>
</section>`;
}
const faqLd = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

// ───────────────────────────────────────────── home
export function home(C) {
    const { HOME, EXPERIENCE, ABOUT, BIZ, services } = C;
    const tiles = services.filter((s) => !s.boudoir);
    const strip = services.flatMap((s) => s.gallery.slice(0, 3)).slice(0, 14);
    return { path: '/', html: page(C, {
        path: '/',
        title: 'Firefly Photography | Denver & Littleton Photographer — Weddings, Families, Seniors',
        description: 'Luxury, light-filled photography by Shelly Bowman in Denver, Littleton and across Colorado — weddings, elopements, families, seniors, newborns, maternity and headshots.',
        image: HOME.hero[0],
        body: `<section class="hero" aria-label="Welcome">
  <div class="hero__photos">
${HOME.hero.map((p, i) => `    <div class="hero__photo hero__photo--${i + 1}">${img(p, { eager: i === 0, sizes: '(max-width: 760px) 100vw, 34vw', alt: '' })}</div>`).join('\n')}
  </div>
  <div class="hero__shade" aria-hidden="true"></div>
  ${flies('dark', 1.1)}
  <div class="wrap hero__copy">
    <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Photographer · ${esc(BIZ.place)}</p>
    <h1>Capturing the light <em>in your story.</em></h1>
    <p class="hero__lead">Weddings, families and the moments in between — guided with warmth, photographed with an artist’s eye.</p>
    <div class="hero__actions">
      <a class="btn btn--gold btn--lg" href="/contact/">Inquire about your date ${icon.arrow}</a>
      <a class="btn btn--ghost btn--lg" href="/experience/">Explore the experience</a>
    </div>
  </div>
  <a class="hero__scroll" href="#intro" aria-label="Scroll down"><span></span></a>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${[0, 1].map(() => `<span>${services.map((s) => `<i>${esc(s.name)}</i>`).join('<b>✦</b>')}<b>✦</b></span>`).join('')}</div></div>

<section class="section statement" id="intro">
  ${flies('light', 0.45)}
  <div class="wrap statement__inner reveal">
    <p class="kicker">Firefly Photography</p>
    <p class="statement__text">${esc(HOME.intro)}</p>
    <p class="statement__sign">— Shelly</p>
  </div>
</section>

<section class="section specialties" id="work">
  <div class="wrap">
    <header class="section__head reveal"><p class="kicker">The portfolio</p><h2>Every chapter, <em>beautifully told.</em></h2></header>
    <div class="spec">
${tiles.map((s, i) => `      <a class="spec__tile spec__tile--${i + 1} reveal" style="--d:${i % 3}" href="/${s.slug}/">${img(s.cover, { alt: s.cover.alt || s.name, sizes: i === 0 ? '(max-width: 760px) 100vw, 50vw' : '(max-width: 760px) 100vw, 25vw' })}<span class="spec__shade"></span><span class="spec__text"><small>${String(i + 1).padStart(2, '0')}</small><strong>${esc(s.name)}</strong><span>View the gallery ${icon.arrow}</span></span></a>`).join('\n')}
    </div>
    <p class="center reveal"><a class="link-arrow" href="/portfolio/">All galleries ${icon.arrow}</a></p>
  </div>
</section>

<section class="section xp">
  ${mark('mark--page')}
  ${flies('dark', 0.9)}
  <div class="wrap xp__grid">
    <div class="xp__copy reveal">
      <p class="kicker">The Firefly experience</p>
      <h2>${rich(EXPERIENCE.headline)}</h2>
      <p class="lead">${esc(EXPERIENCE.lead)}</p>
      <p>${esc(EXPERIENCE.body[0])}</p>
      <a class="btn btn--ghost" href="/experience/">Explore the experience ${icon.arrow}</a>
    </div>
    <ul class="pillars">
${EXPERIENCE.pillars.map((p, i) => `      <li class="reveal" style="--d:${i}"><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="section editorial" aria-label="Featured photographs">
  <div class="wrap">
    <div class="ed" data-gallery="featured">
${HOME.featured.map((p, i) => `      <button type="button" class="ed__item ed__item--${i + 1} reveal" data-index="${i}" data-full="${esc(p.src)}" data-alt="${esc(p.alt)}" aria-label="Open photo">${img(p, { sizes: '(max-width: 760px) 50vw, 33vw' })}</button>`).join('\n')}
      <blockquote class="ed__quote reveal"><p>Beautiful photography isn’t just about how a moment looks. <em>It’s about remembering how it felt.</em></p></blockquote>
    </div>
  </div>
</section>

<section class="filmstrip" aria-label="More favorite photos">
  <div class="filmstrip__track" data-gallery="strip">
${strip.map((p, i) => `    <button type="button" class="filmstrip__item" data-index="${i}" data-full="${esc(p.src)}" data-alt="${esc(p.alt)}" aria-label="Open photo">${img(p, { small: true })}</button>`).join('\n')}
  </div>
</section>

${reviewsCarousel(C, C.REVIEWS.filter((r) => r.featured).concat(C.REVIEWS.filter((r) => !r.featured)))}

<section class="section meet">
  <div class="wrap meet__grid">
    <div class="meet__photo reveal">${img(ABOUT.photo, { sizes: '(max-width: 900px) 80vw, 440px' })}<span class="meet__badge">Hi, I’m Shelly ✦</span></div>
    <div class="meet__copy reveal">
      <p class="kicker">Meet your photographer</p>
      <h2>The heart behind <em>Firefly Photography.</em></h2>
      <p class="lead lead--ink">${esc(ABOUT.lead)}</p>
      <p>${esc(ABOUT.body[0])}</p>
      <a class="link-arrow" href="/about/">More about Shelly ${icon.arrow}</a>
    </div>
  </div>
</section>

${C.posts.length ? `<section class="section journal-teaser">
  <div class="wrap">
    <header class="section__head section__head--split reveal"><div><p class="kicker">The Journal</p><h2>Stories, guides <em>&amp; inspiration.</em></h2></div><a class="link-arrow" href="/journal/">Visit the Journal ${icon.arrow}</a></header>
    <div class="jgrid">${C.posts.slice(0, 3).map((a) => journalCard(C, a)).join('')}</div>
  </div>
</section>` : ''}`,
    }) };
}

// ───────────────────────────────────────────── a service + its portfolio
export function service(C, s, i) {
    const list = C.services;
    const prev = list[(i + list.length - 1) % list.length], next = list[(i + 1) % list.length];
    const pkg = pkgOf(C, s);
    const reviews = reviewsFor(C, s.slug, 3);
    const posts = C.posts.filter((a) => (a.services || []).includes(s.slug) || a.category === ({ weddings: 'weddings-elopements', elopements: 'weddings-elopements', families: 'families', seniors: 'seniors', newborns: 'newborns-maternity', maternity: 'newborns-maternity' })[s.slug]).slice(0, 3);
    const ld = [crumbs(C, [['Home', '/'], ['Portfolio', '/portfolio/'], [s.name, `/${s.slug}/`]]),
        { '@context': 'https://schema.org', '@type': 'Service', name: s.long, serviceType: s.long, provider: { '@id': `${C.SITE}/#business` }, areaServed: 'Denver, Littleton and Colorado', url: `${C.SITE}/${s.slug}/`, ...(pkg ? { offers: { '@type': 'Offer', price: pkg.price.replace(/[^0-9.]/g, ''), priceCurrency: 'USD', description: pkg.name } } : {}) }];
    return { path: `/${s.slug}/`, html: page(C, {
        path: `/${s.slug}/`, title: s.seo.title, description: s.seo.description, image: s.cover, ld, bookFor: s.name, bodyClass: `mood-${s.mood}`,
        body: `<section class="page-hero">
  ${img(s.cover, { cls: 'page-hero__bg', eager: true, alt: '' })}
  <div class="page-hero__shade"></div>
  ${flies('dark', 0.8)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow"><a href="/portfolio/">Portfolio</a> <span>/</span> ${esc(s.seo.keyword)}</p>
    <h1>${esc(s.name)}</h1>
    <p class="page-hero__sub">${esc(s.long)} in Denver, Littleton <em>&amp; across Colorado.</em></p>
  </div>
</section>

<section class="section svc-intro">
  ${flies('light', 0.35)}
  <div class="wrap svc-intro__grid">
    <div class="reveal">
      <p class="kicker">${esc(s.kicker)}</p>
      <h2>${rich(s.headline)}</h2>
    </div>
    <div class="reveal" style="--d:1">
      <p class="lead lead--ink">${esc(s.intro)}</p>
      <ul class="ticks ticks--roomy">${s.experience.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      <div class="svc-intro__links"><a class="btn btn--line" href="#book">Tell me your story</a><a class="link-arrow" href="/experience/">The Firefly experience ${icon.arrow}</a></div>
    </div>
  </div>
</section>

<section class="section svc-gallery">
  <div class="wrap">
    ${s.privateGallery || !s.gallery.length
        ? `<div class="private reveal"><p class="kicker">Private by design</p><h2>Galleries shared <em>privately.</em></h2><p>Out of respect for my clients’ privacy, boudoir images aren’t published here. I’m happy to share a curated selection with you personally — just ask.</p><a class="btn btn--gold" href="#book">Ask to see a selection ${icon.arrow}</a></div>`
        : gallery(s.gallery, { name: s.name, id: s.slug })}
  </div>
</section>

<section class="section svc-how">
  <div class="wrap svc-how__grid">
    <div class="reveal">
      <p class="kicker">How it works</p>
      <h2>${s.process === 'wedding' ? 'Calm, organized, <em>and all about you.</em>' : 'Simple from <em>hello to gallery.</em>'}</h2>
      <ol class="mini-steps">${C.PROCESS[s.process].steps.slice(0, s.process === 'wedding' ? 6 : 5).map((st) => `<li><strong>${esc(st.title)}</strong></li>`).join('')}</ol>
      <a class="link-arrow" href="/experience/#process${s.process === 'wedding' ? '-wedding' : ''}">See the full process ${icon.arrow}</a>
    </div>
    ${pkg && (!pkg.boudoir || C.SETTINGS.showBoudoir) ? `<div class="svc-how__pkg">${packageBlock(C, pkg, { compact: true })}<p class="center"><a class="link-arrow" href="/pricing/#pkg-${pkg.id}">Full package details ${icon.arrow}</a></p></div>` : `<div class="svc-how__pkg reveal"><div class="pkg"><div class="pkg__head"><h3>Investment</h3><p class="pkg__for">Every session is a little different. Reach out and I’ll put together the right option for you.</p></div><a class="btn btn--line" href="/pricing/">See pricing</a></div></div>`}
  </div>
</section>

${reviews.length ? `<section class="section svc-reviews">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">Kind words</p><h2>What clients <em>say.</em></h2></header>
    <div class="reviews__grid">${reviews.map((r, n) => `<div class="reveal" style="--d:${n}">${reviewCard(C, r)}</div>`).join('')}</div>
    <p class="center reveal"><a class="link-arrow" href="/reviews/">More kind words ${icon.arrow}</a></p>
  </div>
</section>` : ''}

${posts.length ? `<section class="section journal-teaser journal-teaser--tight"><div class="wrap"><header class="section__head reveal"><p class="kicker">From the Journal</p><h2>Ideas <em>&amp; inspiration.</em></h2></header><div class="jgrid">${posts.map((a) => journalCard(C, a)).join('')}</div></div></section>` : ''}

<nav class="wrap pager" aria-label="More galleries">
  <a href="/${prev.slug}/"><span>‹ Previous</span><strong>${esc(prev.name)}</strong></a>
  <a href="/${next.slug}/"><span>Next ›</span><strong>${esc(next.name)}</strong></a>
</nav>`,
    }) };
}

export function portfolio(C) {
    return { path: '/portfolio/', html: page(C, {
        path: '/portfolio/', title: 'Portfolio | Weddings, Families, Seniors & More — Firefly Photography, Denver',
        description: 'Explore Firefly Photography’s galleries: weddings, elopements, families, high school seniors, newborns, maternity and headshots in Denver, Littleton and Colorado.',
        image: C.services[0].cover, ld: [crumbs(C, [['Home', '/'], ['Portfolio', '/portfolio/']])],
        body: `<section class="page-hero page-hero--plain">
  ${mark('mark--page')}
  ${flies('dark', 1)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">Portfolio</p>
    <h1>Every chapter, <em>beautifully told.</em></h1>
    <p class="lead">Romantic weddings, warm family stories, confident seniors and the quiet first weeks of a new life — each gallery with its own mood, all of it unmistakably Firefly.</p>
  </div>
</section>
<section class="section">
  <div class="wrap pf">
${C.services.map((s, i) => `    <a class="pf__row reveal" href="/${s.slug}/">
      <span class="pf__img">${img(s.cover, { sizes: '(max-width: 760px) 100vw, 50vw', alt: s.cover.alt || s.name })}</span>
      <span class="pf__text"><small>${String(i + 1).padStart(2, '0')}</small><strong>${esc(s.name)}</strong><span>${esc(s.intro)}</span><em>${s.privateGallery ? 'Shared privately' : `${s.gallery.length} photographs`} ${icon.arrow}</em></span>
    </a>`).join('\n')}
  </div>
</section>`,
    }) };
}

// ───────────────────────────────────────────── the Firefly Experience
export function experience(C) {
    const { EXPERIENCE: X } = C;
    const bts = C.EXPERIENCE.moments || [];
    const kind = C.REVIEWS.filter((r) => r.tags?.includes('experience')).slice(0, 4);
    return { path: '/experience/', html: page(C, {
        path: '/experience/', title: 'The Firefly Experience | Relaxed, Guided Photo Sessions in Denver — Firefly Photography',
        description: 'What it’s like to be photographed by Shelly Bowman: gentle direction, beautiful light, real laughter and an organized process from the first hello to your final gallery.',
        image: C.HOME.hero[0], ld: [crumbs(C, [['Home', '/'], ['The Firefly Experience', '/experience/']]), faqLd(C.FAQS)],
        body: `<section class="page-hero page-hero--plain page-hero--xp">
  ${mark('mark--page')}
  ${flies('dark', 1.1)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">The Firefly experience</p>
    <h1>${rich(X.headline)}</h1>
    <p class="lead">${esc(X.lead)}</p>
  </div>
</section>

<section class="section xp-story">
  ${flies('light', 0.4)}
  <div class="wrap xp-story__grid">
    <div class="xp-story__photos reveal">
${(bts.length ? bts : [C.services[2].gallery[4], C.services[0].gallery[0], C.services[3].gallery[0]]).slice(0, 3).map((p, i) => `      <figure class="xp-story__p xp-story__p--${i + 1}">${img(p, { sizes: '(max-width: 900px) 60vw, 30vw' })}</figure>`).join('\n')}
    </div>
    <div class="xp-story__copy reveal">
${X.body.map((p, i) => `      <p${i === 0 ? ' class="lead lead--ink"' : ''}>${esc(p)}</p>`).join('\n')}
      <p class="xp-story__closing">${esc(X.closing)}</p>
    </div>
  </div>
</section>

<section class="section xp-pillars">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">What you can expect</p><h2>More than someone <em>with a camera.</em></h2></header>
    <ul class="pillars pillars--light">
${X.pillars.map((p, i) => `      <li class="reveal" style="--d:${i}"><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>

${timeline(C)}

${kind.length ? `<section class="section svc-reviews">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">In their words</p><h2>“She made me feel <em>so comfortable.”</em></h2></header>
    <div class="reviews__grid">${kind.map((r, n) => `<div class="reveal" style="--d:${n % 3}">${reviewCard(C, r)}</div>`).join('')}</div>
  </div>
</section>` : ''}

${faqBlock(C)}`,
    }) };
}

// ───────────────────────────────────────────── pricing
export function pricing(C) {
    const pk = C.PACKAGES.filter((p) => !p.boudoir || C.SETTINGS.showBoudoir);
    const photoFor = { portrait: C.services[2].cover, wedding: C.services[0].cover, elopement: C.services[1].cover, boudoir: C.services.find((s) => s.boudoir)?.cover };
    return { path: '/pricing/', html: page(C, {
        path: '/pricing/', title: 'Pricing & Packages | Firefly Photography — Denver & Littleton, CO',
        description: 'Photography packages by Firefly Photography: portrait & lifestyle sessions, full wedding days, micro weddings & elopements and boudoir in Denver, Littleton and Colorado.',
        image: C.services[0].gallery[1], ld: [crumbs(C, [['Home', '/'], ['Pricing', '/pricing/']]), faqLd(C.FAQS)],
        body: `<section class="page-hero page-hero--plain">
  ${mark('mark--page')}
  ${flies('dark', 1)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">Pricing &amp; packages</p>
    <h1>An investment in <em>how it felt.</em></h1>
    <p class="lead">Every package includes more than photographs: thoughtful planning, gentle direction, beautiful light and carefully finished images you’ll treasure for decades. Here’s where each experience begins.</p>
  </div>
</section>

<section class="section pricing">
  <div class="wrap pricing__list">
${pk.map((p, i) => `    <div class="pricing__row${i % 2 ? ' pricing__row--flip' : ''}">
      <figure class="pricing__img reveal">${img(photoFor[p.id] || C.HOME.featured[i % C.HOME.featured.length], { sizes: '(max-width: 900px) 100vw, 45vw' })}</figure>
      ${packageBlock(C, p)}
    </div>`).join('\n')}
  </div>
</section>

<section class="section proof">
  ${flies('dark', 0.7)}
  <div class="wrap proof__grid">
    <div class="reveal">
      <p class="kicker">Portrait sessions</p>
      <h2>Your proof gallery &amp; <em>15 favorites.</em></h2>
      <p class="lead">For standard portrait packages, you see everything we captured — then choose the images that matter most to you.</p>
    </div>
    <ol class="proof__steps">
      <li class="reveal"><strong>A private proof gallery</strong><span>After your session I review every frame and share an online gallery of all the usable images.</span></li>
      <li class="reveal" style="--d:1"><strong>You heart your favorites</strong><span>Select your 15 favorite photographs with the gallery’s heart feature — you choose, not me.</span></li>
      <li class="reveal" style="--d:2"><strong>Detailed editing</strong><span>Those 15 receive my full, detailed editing treatment.</span></li>
      <li class="reveal" style="--d:3"><strong>Plus the rest of your proofs</strong><span>You also receive the remaining usable proof images — a broad collection of memories alongside a refined collection of favorites.</span></li>
    </ol>
  </div>
  <p class="wrap proof__note reveal">Weddings and elopements follow their own editing and delivery process — <a href="/experience/#process-wedding">see how it works</a>.</p>
</section>

${faqBlock(C)}`,
    }) };
}

// ───────────────────────────────────────────── about
export function about(C) {
    const { ABOUT: A, BIZ } = C;
    return { path: '/about/', html: page(C, {
        path: '/about/', title: 'About Shelly Bowman | Denver & Littleton Photographer — Firefly Photography',
        description: 'Meet Shelly Bowman, the photographer behind Firefly Photography in Denver and Littleton — an artistic eye, an easygoing personality and a genuine love of connection.',
        image: A.photo, ld: [crumbs(C, [['Home', '/'], ['About', '/about/']]), { '@context': 'https://schema.org', '@type': 'Person', name: BIZ.owner, jobTitle: 'Photographer', worksFor: { '@id': `${C.SITE}/#business` }, image: `${C.SITE}${A.photo.src}`, sameAs: [BIZ.instagram.url] }],
        body: `<section class="page-hero page-hero--plain page-hero--about">
  ${mark('mark--page mark--left')}
  ${flies('dark', 1)}
  <div class="wrap about-hero">
    <div class="about-hero__photo">${img(A.photo, { eager: true, sizes: '(max-width: 900px) 80vw, 460px' })}</div>
    <div class="page-hero__copy">
      <p class="eyebrow">About</p>
      <h1>${rich(A.headline)}</h1>
      <p class="lead">${esc(A.lead)}</p>
    </div>
  </div>
</section>

<section class="section about-story">
  ${flies('light', 0.4)}
  <div class="wrap about-story__inner">
${A.body.map((p, i) => `    <p class="reveal${i === 0 ? ' about-story__first' : ''}">${esc(p)}</p>`).join('\n')}
    <p class="about-story__closing reveal">${A.closing.map(esc).join('<br>')}</p>
  </div>
</section>

<section class="section about-personal">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">A few things about me</p><h2>Behind <em>the camera.</em></h2></header>
    <ul class="personal">
${A.personal.map((p, i) => `      <li class="reveal" style="--d:${i}"><span class="personal__dot" aria-hidden="true"></span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('\n')}
    </ul>
    <p class="center reveal"><a class="btn btn--line" href="/experience/">What working with me is like</a></p>
  </div>
</section>

${reviewsCarousel(C, C.REVIEWS.filter((r) => r.featured))}`,
    }) };
}

// ───────────────────────────────────────────── reviews
export function reviews(C) {
    const tags = [['all', 'All'], ['experience', 'The experience'], ['weddings', 'Weddings'], ['families', 'Families'], ['seniors', 'Seniors'], ['headshots', 'Headshots']]
        .filter(([t]) => t === 'all' || C.REVIEWS.some((r) => r.tags?.includes(t)));
    const top = C.REVIEWS.find((r) => r.featured) || C.REVIEWS[0];
    return { path: '/reviews/', html: page(C, {
        path: '/reviews/', title: 'Client Reviews | Kind Words for Firefly Photography, Denver',
        description: 'Real Google reviews from Firefly Photography clients — weddings, families, seniors and headshots in Denver and Littleton.',
        image: C.HOME.featured[0], ld: [crumbs(C, [['Home', '/'], ['Reviews', '/reviews/']])],
        body: `<section class="page-hero page-hero--plain">
  ${mark('mark--page')}
  ${flies('dark', 1)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">Kind words</p>
    <h1>Kind Words, <em>Lasting Impressions</em></h1>
    <p class="lead">The photographs matter. So does the experience of creating them.</p>
  </div>
</section>
<section class="section reviews-page">
  <div class="wrap">
    ${ratingBar(C)}
    <div class="review-hero reveal">${reviewCard(C, top, { big: true })}</div>
    <div class="chips chips--light reveal" data-filter>
${tags.map(([t, n], i) => `      <button class="chip${i === 0 ? ' on' : ''}" type="button" data-tag="${t}">${esc(n)}</button>`).join('\n')}
    </div>
    <div class="reviews__grid" data-filtered>
${C.REVIEWS.map((r, i) => `      <div class="reveal" style="--d:${i % 3}">${reviewCard(C, r)}</div>`).join('\n')}
    </div>
    <div class="review-cta reveal">
      ${C.SETTINGS.googleReviewsUrl ? `<a class="btn btn--line" href="${esc(C.SETTINGS.googleReviewsUrl)}" target="_blank" rel="noopener">${icon.google} Read reviews on Google</a>` : ''}
      ${C.SETTINGS.googleWriteReviewUrl ? `<a class="btn btn--gold" href="${esc(C.SETTINGS.googleWriteReviewUrl)}" target="_blank" rel="noopener">${icon.star} Leave a review</a>` : ''}
      <p>Reviews are shared from Google exactly as clients wrote them.</p>
    </div>
  </div>
</section>`,
    }) };
}

// ───────────────────────────────────────────── contact
export function contact(C) {
    return { path: '/contact/', html: page(C, {
        path: '/contact/', title: 'Inquire | Book a Photography Session — Firefly Photography, Denver & Littleton',
        description: 'Inquire about your wedding date or book a family, senior, newborn, maternity or headshot session with Firefly Photography in Denver and Littleton, Colorado.',
        noBook: true, ld: [crumbs(C, [['Home', '/'], ['Inquire', '/contact/']])],
        body: `${book(C, '', { standalone: true })}
<section class="section next">
  <div class="wrap">
    <header class="section__head section__head--center reveal"><p class="kicker">What happens next</p><h2>Easy from <em>the very first hello.</em></h2></header>
    <ol class="next__steps">
      <li class="reveal"><span>01</span><h3>You’ll get a confirmation</h3><p>An email lets you know your note arrived safely.</p></li>
      <li class="reveal" style="--d:1"><span>02</span><h3>I’ll reach out personally</h3><p>We’ll talk through your ideas, the location, timing and the feeling you want.</p></li>
      <li class="reveal" style="--d:2"><span>03</span><h3>We plan something beautiful</h3><p>A retainer reserves your date, and I’ll share preparation and styling guidance.</p></li>
    </ol>
  </div>
</section>`,
    }) };
}

// ───────────────────────────────────────────── the Journal
function journalHero(C, title, lead, eyebrow = 'The Journal') {
    return `<section class="page-hero page-hero--plain page-hero--journal">
  ${flies('dark', 0.9)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p class="lead">${esc(lead)}</p>
  </div>
</section>`;
}
const catChips = (C, on = '') => `<nav class="chips chips--light jcats" aria-label="Journal categories"><a class="chip${on ? '' : ' on'}" href="/journal/">All stories</a>${C.JOURNAL_CATEGORIES.filter((c) => C.posts.some((a) => a.category === c.slug)).map((c) => `<a class="chip${c.slug === on ? ' on' : ''}" href="/journal/category/${c.slug}/">${esc(c.name)}</a>`).join('')}</nav>`;

export function journalIndex(C) {
    const [first, ...rest] = C.posts;
    return { path: '/journal/', html: page(C, {
        path: '/journal/', title: 'The Journal | Colorado Photography Stories, Guides & Tips — Firefly Photography',
        description: 'Real sessions, Colorado location guides, what-to-wear ideas and photography tips from Denver photographer Shelly Bowman.',
        image: first?.cover, ld: [crumbs(C, [['Home', '/'], ['Journal', '/journal/']])],
        body: `${journalHero(C, 'The <em>Journal</em>', 'Real sessions, Colorado location guides, styling ideas and a little behind-the-scenes — stories from behind the lens.')}
<section class="section journal">
  <div class="wrap">
    ${catChips(C)}
    ${first ? journalCard(C, first, { big: true }) : '<p class="center">New stories are on their way.</p>'}
    ${rest.length ? `<div class="jgrid">${rest.map((a) => journalCard(C, a)).join('')}</div>` : ''}
  </div>
</section>`,
    }) };
}

export function journalCategory(C, cat) {
    const posts = C.posts.filter((a) => a.category === cat.slug);
    const path = `/journal/category/${cat.slug}/`;
    return { path, html: page(C, {
        path, title: `${cat.name} | The Journal — Firefly Photography, Denver`, description: cat.blurb,
        image: posts[0]?.cover, ld: [crumbs(C, [['Home', '/'], ['Journal', '/journal/'], [cat.name, path]])],
        body: `${journalHero(C, esc(cat.name), cat.blurb, '<a href="/journal/">The Journal</a> <span>/</span> Category')}
<section class="section journal">
  <div class="wrap">
    ${catChips(C, cat.slug)}
    ${posts.length ? `<div class="jgrid">${posts.map((a) => journalCard(C, a)).join('')}</div>` : '<p class="center">New stories are on their way.</p>'}
  </div>
</section>`,
    }) };
}

export function article(C, a) {
    const cat = C.JOURNAL_CATEGORIES.find((c) => c.slug === a.category);
    const related = C.posts.filter((x) => x !== a && (x.category === a.category)).concat(C.posts.filter((x) => x !== a && x.category !== a.category)).slice(0, 3);
    const path = `/journal/${a.slug}/`;
    const url = `${C.SITE}${path}`;
    const ld = [crumbs(C, [['Home', '/'], ['Journal', '/journal/'], [a.title, path]]), {
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.seoDescription || a.excerpt,
        image: a.cover ? (a.cover.src.startsWith('http') ? a.cover.src : `${C.SITE}${a.cover.src}`) : undefined,
        datePublished: a.publishAt, dateModified: a.updatedAt || a.publishAt, author: { '@type': 'Person', name: C.BIZ.owner, url: `${C.SITE}/about/` },
        publisher: { '@id': `${C.SITE}/#business` }, mainEntityOfPage: url }];
    return { path, html: page(C, {
        path, title: a.seoTitle || `${a.title} | Firefly Photography`, description: a.seoDescription || a.excerpt, image: a.cover, ld,
        body: `<article class="art">
  <header class="art-hero">
    ${a.cover ? img(a.cover, { cls: 'art-hero__bg', eager: true, alt: a.cover.alt || '' }) : ''}
    <div class="page-hero__shade"></div>
    ${flies('dark', 0.7)}
    <div class="wrap art-hero__copy">
      <p class="eyebrow"><a href="/journal/">The Journal</a>${cat ? ` <span>/</span> <a href="/journal/category/${cat.slug}/">${esc(cat.name)}</a>` : ''}</p>
      <h1>${esc(a.title)}</h1>
      <p class="art-hero__meta">By ${esc(C.BIZ.owner)} · <time datetime="${esc(a.publishAt)}">${fmtDate(a.publishAt)}</time> · ${readMins(a.body)} min read</p>
    </div>
  </header>
  <div class="art-body">
    ${a.bodyHtml}
    ${a.gallery?.length ? gallery(a.gallery, { name: a.title, id: `art-${a.slug}`, lead: Math.min(3, a.gallery.length) }) : ''}
    <footer class="art-foot">
      <div class="art-share">
        <span>Share this story</span>
        <a href="https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(a.title)}" target="_blank" rel="noopener">Pinterest</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Facebook</a>
        <a href="mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(url)}">Email</a>
      </div>
      <div class="art-author">${img(C.ABOUT.photo, { small: true, alt: C.BIZ.owner })}<div><strong>${esc(C.BIZ.owner)}</strong><p>Photographer and owner of Firefly Photography in Denver &amp; Littleton. <a href="/about/">More about Shelly</a></p></div></div>
    </footer>
  </div>
</article>
${related.length ? `<section class="section journal-teaser"><div class="wrap"><header class="section__head reveal"><p class="kicker">Keep reading</p><h2>More from <em>the Journal.</em></h2></header><div class="jgrid">${related.map((x) => journalCard(C, x)).join('')}</div></div></section>` : ''}`,
    }) };
}

// a page for articles published after the last build: it draws the article from the database (see site.js)
export function articleLive(C) {
    return { path: '/journal/story/', html: page(C, {
        path: '/journal/story/', title: 'The Journal | Firefly Photography', description: 'A story from the Firefly Photography Journal.', noindex: true,
        body: `<article class="art" data-live-article>
  <header class="art-hero"><div class="page-hero__shade"></div>${flies('dark', 0.7)}<div class="wrap art-hero__copy"><p class="eyebrow"><a href="/journal/">The Journal</a></p><h1>Loading the story…</h1></div></header>
  <div class="art-body"><p class="center">One moment…</p></div>
</article>`,
    }) };
}

export function notFound(C) {
    return { path: '/404', html: page(C, {
        path: '/404.html', title: 'Page not found | Firefly Photography', description: 'This page has flown away.', noindex: true,
        body: `<section class="page-hero page-hero--plain page-hero--404">
  ${mark('mark--page')}
  ${flies('dark', 1.4)}
  <div class="wrap page-hero__copy">
    <p class="eyebrow">404</p>
    <h1>This page has <em>flown away.</em></h1>
    <p class="lead">Like a firefly at dusk — here a moment ago. Let’s find you somewhere beautiful instead.</p>
    <div class="hero__actions"><a class="btn btn--gold" href="/">Back to the home page</a><a class="btn btn--ghost" href="/portfolio/">See the portfolio</a></div>
  </div>
</section>`,
    }) };
}
