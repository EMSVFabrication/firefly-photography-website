// Firefly Photography — the page's behaviour: fireflies, menu, header, scroll-in, photo viewer, review carousel,
// process tabs, review filter, the inquiry form, and Journal stories published since the last build.
(function () {
  var FF = window.FF || {};
  var EMAIL = FF.email || 'ShellyLBowman@gmail.com';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 760px)').matches;
  var loadedAt = Date.now();
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ── Fireflies: soft glowing dots that drift, blink and wander (only while on screen; fewer on phones).
  //    data-tone="light" = warm amber for ivory sections; data-density scales how many.
  function fireflies(canvas) {
    var ctx = canvas.getContext('2d');
    var light = canvas.getAttribute('data-tone') === 'light';
    var density = Number(canvas.getAttribute('data-density')) || 1;
    var dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
    var flies = [], w = 0, h = 0, running = false, raf = 0, lastW = 0;
    var c1 = light ? '232, 168, 60' : '255, 228, 160', c2 = light ? '214, 150, 50' : '242, 189, 92';
    function size() {
      var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(phone ? 34 : 70, Math.max(10, (w * h) / (phone ? 26000 : 22000))) * density * (light ? .6 : 1));
      flies = Array.from({ length: n }, function () {
        return { x: Math.random() * w, y: Math.random() * h, r: (light ? .8 : 1) + Math.random() * 1.8, a: Math.random() * Math.PI * 2,
          s: .15 + Math.random() * .45, t: Math.random() * 1000, blink: 0.004 + Math.random() * 0.01 };
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flies.length; i++) {
        var f = flies[i];
        f.t += 1; f.a += (Math.random() - .5) * .25;
        f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s - .08;
        if (f.x < -10) f.x = w + 10; if (f.x > w + 10) f.x = -10; if (f.y < -10) f.y = h + 10; if (f.y > h + 10) f.y = -10;
        var glow = Math.pow(Math.max(0, Math.sin(f.t * f.blink)), 3);
        var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 9);
        g.addColorStop(0, 'rgba(' + c1 + ',' + ((light ? .7 : .85) * glow + (light ? .05 : .08)) + ')');
        g.addColorStop(.25, 'rgba(' + c2 + ',' + ((light ? .3 : .45) * glow + .03) + ')');
        g.addColorStop(1, 'rgba(' + c2 + ', 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 9, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    size(); draw();
    if (calm) return;
    // phones fire resize when the address bar slides; only re-seed when the width really changes
    window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; size(); } });
    lastW = window.innerWidth;
    new IntersectionObserver(function (e) {
      var on = e[0].isIntersecting;
      if (on && !running) { if (!w) size(); running = true; raf = requestAnimationFrame(draw); }
      if (!on) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { running = false; cancelAnimationFrame(raf); } });
  }
  document.querySelectorAll('canvas.fireflies').forEach(fireflies);

  // ── The logo's firefly leans a little with the mouse
  if (!calm && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.page-hero--plain, .book, .xp').forEach(function (sec) {
      sec.addEventListener('pointermove', function (e) {
        var r = sec.getBoundingClientRect();
        sec.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        sec.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
      sec.addEventListener('pointerleave', function () { sec.style.setProperty('--px', 0); sec.style.setProperty('--py', 0); });
    });
  }

  // ── Header: solid once the page scrolls
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ── Phone menu
  var menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  // ── Portfolio menu: closes on a click elsewhere or Escape
  var drops = document.querySelectorAll('.drop');
  document.addEventListener('click', function (e) { drops.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; }); });

  // ── Scroll-in
  function reveal(root) {
    var els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (calm || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
    els.forEach(function (el) { io.observe(el); });
  }
  reveal();

  // ── Photo viewer: any [data-gallery] list; arrows, keys and swipe
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img'), boxCap = box.querySelector('figcaption');
  var list = [], at = 0, lastFocus = null;
  function show(i) {
    at = (i + list.length) % list.length;
    boxImg.src = list[at].src; boxImg.alt = list[at].alt || '';
    boxCap.textContent = (list[at].alt ? list[at].alt + ' · ' : '') + (at + 1) + ' / ' + list.length;
    var next = new Image(); next.src = list[(at + 1) % list.length].src; // the next one is ready when it's asked for
  }
  function open(items, i) { list = items; lastFocus = document.activeElement; box.hidden = false; document.body.style.overflow = 'hidden'; show(i); box.querySelector('.lightbox__close').focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; boxImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); }
  function bindGallery(g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-full]'); if (!b || !g.contains(b)) return;
      // the film strip shows its photos twice (for the endless loop): only the first copy counts
      var all = Array.prototype.filter.call(g.querySelectorAll('[data-full]'), function (x) { return !x.hasAttribute('aria-hidden'); });
      open(all.map(function (x) { return { src: x.getAttribute('data-full'), alt: x.getAttribute('data-alt') }; }), Number(b.getAttribute('data-index')) || 0);
    });
  }
  document.querySelectorAll('[data-gallery]').forEach(bindGallery);
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(at - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(at + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!box.hidden) close(); drops.forEach(function (d) { d.open = false; }); setMenu(false); }
    if (box.hidden) return;
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'Tab') { e.preventDefault(); var f = box.querySelectorAll('button'); var k = Array.prototype.indexOf.call(f, document.activeElement); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
  });

  // ── Film strip: a second copy of the photos makes the loop endless
  var strip = document.querySelector('.filmstrip__track');
  if (strip && !calm) strip.insertAdjacentHTML('beforeend', strip.innerHTML.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" '));

  // ── Review carousel: swipe or scroll natively; arrows, dots, and a slow auto-advance that pauses on touch/hover
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track'), slides = track.children, dots = car.querySelector('.carousel__dots');
    function per() { return Math.max(1, Math.round(track.clientWidth / slides[0].getBoundingClientRect().width)); }
    function pages() { return Math.max(1, Math.ceil(slides.length / per())); }
    function page() { return Math.round(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth) * (pages() - 1)) || 0; }
    function go(p) { var n = pages(); p = (p + n) % n; track.scrollTo({ left: p * per() * (slides[0].getBoundingClientRect().width + 20), behavior: calm ? 'auto' : 'smooth' }); }
    function drawDots() {
      dots.innerHTML = '';
      for (var i = 0; i < pages(); i++) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Show reviews ' + (i + 1));
        b.addEventListener('click', (function (k) { return function () { go(k); stop(); }; })(i)); dots.appendChild(b);
      }
      mark();
    }
    function mark() { var p = page(); Array.prototype.forEach.call(dots.children, function (d, i) { d.setAttribute('aria-selected', i === p ? 'true' : 'false'); }); }
    car.querySelector('[data-prev]').addEventListener('click', function () { go(page() - 1); stop(); });
    car.querySelector('[data-next]').addEventListener('click', function () { go(page() + 1); stop(); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
    window.addEventListener('resize', drawDots);
    drawDots();
    var timer = null;
    function stop() { clearInterval(timer); timer = null; }
    if (!calm) {
      timer = setInterval(function () { if (!document.hidden) go(page() + 1); }, 7000);
      ['pointerenter', 'touchstart', 'focusin'].forEach(function (ev) { car.addEventListener(ev, stop, { passive: true }); });
    }
  });

  // ── Process tabs (portrait / wedding); a link to #process-wedding opens that tab
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('[role="tab"]');
    function pick(btn) {
      btns.forEach(function (b) { var on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); document.getElementById(b.getAttribute('aria-controls')).hidden = !on; });
      reveal(document.getElementById(btn.getAttribute('aria-controls')));
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
    function fromHash() { var t = location.hash === '#process-wedding' ? tabs.querySelector('[aria-controls="process-wedding"]') : null; if (t) { pick(t); document.getElementById('process').scrollIntoView(); } }
    fromHash(); window.addEventListener('hashchange', fromHash);
  });

  // ── Reviews page filter
  var filter = document.querySelector('[data-filter]'), filtered = document.querySelector('[data-filtered]');
  if (filter && filtered) filter.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tag]'); if (!b) return;
    filter.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
    var t = b.getAttribute('data-tag');
    Array.prototype.forEach.call(filtered.children, function (card) {
      var tags = (card.querySelector('[data-tags]') || {}).getAttribute ? card.querySelector('[data-tags]').getAttribute('data-tags').split(' ') : [];
      card.classList.toggle('out', t !== 'all' && tags.indexOf(t) < 0); card.classList.add('in');
    });
  });

  // ── Inquiry form
  //    1. emailed to Shelly through FormSubmit (formsubmit.co), which also sends the client an automatic confirmation
  //       (_autoresponse). The very first inquiry sends Shelly an "activate" email that she clicks once.
  //    2. saved in the database (firefly_inquiries) so it shows in the ERP even if the email is delayed.
  //    Spam: a hidden field people never fill in, and a minimum time on the page.
  var form = document.getElementById('inquiry');
  if (form) {
    var err = form.querySelector('.inquiry__error'), btn = form.querySelector('button[type="submit"]');
    var val = function (n) { return form.elements[n] ? (form.elements[n].value || '').trim() : ''; };
    var params = new URLSearchParams(location.search), want = (params.get('session') || '').toLowerCase();
    if (want) {
      var map = { portrait: 'Families', wedding: 'Weddings', elopement: 'Elopements & Micro Weddings', boudoir: 'Boudoir' };
      var target = map[want] || want;
      Array.prototype.forEach.call(form.elements.session.options, function (o) { if (o.text.toLowerCase() === String(target).toLowerCase() || o.text.toLowerCase().indexOf(want) === 0) form.elements.session.value = o.value || o.text; });
    }
    form.addEventListener('input', function (e) { if (e.target.classList.contains('bad') && e.target.value.trim()) e.target.classList.remove('bad'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = ['name', 'email', 'session'].filter(function (n) { var bad = !val(n) || (n === 'email' && !/^\S+@\S+\.\S+$/.test(val(n))); form.elements[n].classList.toggle('bad', bad); return bad; });
      if (missing.length) { err.textContent = 'Please add your name, a working email and the type of photography.'; err.hidden = false; form.elements[missing[0]].focus(); return; }
      var first = val('name').split(/\s+/)[0];
      function done() { form.querySelector('.inquiry__name').textContent = ', ' + first; form.classList.add('sent'); form.querySelector('.inquiry__done').hidden = false; if (window.gtag) window.gtag('event', 'generate_lead', { session_type: val('session') }); }
      if (val('_honey') || Date.now() - loadedAt < 2500) { done(); return; } // a bot: look polite, send nothing
      err.hidden = true; btn.disabled = true; btn.querySelector('span').textContent = 'Sending…';
      var data = { name: val('name'), email: val('email'), phone: val('phone'), session: val('session'), date: val('date'), location: val('location'), message: val('message'), source: val('source'), page: location.pathname };
      var mail = fetch('https://formsubmit.co/ajax/' + EMAIL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'New inquiry: ' + data.session + ' — ' + data.name, _template: 'table', _captcha: 'false', _replyto: data.email,
          _autoresponse: 'Hi ' + first + ', thank you for reaching out to Firefly Photography! Your note arrived safely, and I’ll be in touch personally very soon. — Shelly Bowman, Firefly Photography · ' + EMAIL + ' · 720-822-2454',
          Name: data.name, Email: data.email, Phone: data.phone || '—', 'Type of photography': data.session, 'Preferred date': data.date || '—', Location: data.location || '—',
          'What they’re envisioning': data.message || '—', 'Found me through': data.source || '—', Page: data.page,
        }),
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return true; });
      var save = saveInquiry(data);
      Promise.allSettled([mail, save]).then(function (res) {
        if (res[0].status === 'fulfilled' || res[1].status === 'fulfilled') return done();
        var body = encodeURIComponent('Hi Shelly,\n\n' + data.message + '\n\nType: ' + data.session + '\nDate: ' + data.date + '\nLocation: ' + data.location + '\nPhone: ' + data.phone + '\n\n' + data.name);
        err.innerHTML = 'That didn’t go through — check your connection, or <a href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Photo session inquiry') + '&body=' + body + '">email Shelly directly</a>.';
        err.hidden = false;
      }).finally(function () { btn.disabled = false; btn.querySelector('span').textContent = 'Send my inquiry'; });
    });
  }

  // ── The database (Firestore REST — no library needed on the public site)
  var fb = FF.firebase || {};
  var DB = fb.projectId ? 'https://firestore.googleapis.com/v1/projects/' + fb.projectId + '/databases/(default)/documents' : '';
  function enc(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
    if (typeof v === 'object') { var f = {}; Object.keys(v).forEach(function (k) { f[k] = enc(v[k]); }); return { mapValue: { fields: f } }; }
    return { stringValue: String(v) };
  }
  function dec(v) {
    if (!v) return v;
    if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return Number(v.integerValue); if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue; if ('nullValue' in v) return null; if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; Object.keys(f).forEach(function (k) { o[k] = dec(f[k]); }); return o; }
  }
  function saveInquiry(d) {
    if (!DB) return Promise.reject(new Error('no database'));
    var doc = { status: 'new', createdAt: new Date().toISOString(), device: navigator.userAgent.slice(0, 200) };
    Object.keys(d).forEach(function (k) { doc[k] = String(d[k] || '').slice(0, k === 'message' ? 5000 : 300); });
    return fetch(DB + '/firefly_inquiries?key=' + fb.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: enc(doc).mapValue.fields }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return true; });
  }

  // ── A Journal story published after the last build (the address is /journal/<slug>/; Hosting shows this page)
  var live = document.querySelector('[data-live-article]');
  if (live && DB) {
    var preview = new URLSearchParams(location.search).get('preview'); // the ERP's Preview button (drafts too)
    var slug = preview || location.pathname.replace(/^\/journal\/|\/$/g, '');
    var bySlug = { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } };
    // the public may only read published stories, so the query has to ask for exactly those (a preview asks for any)
    var where = preview ? bySlug : { compositeFilter: { op: 'AND', filters: [bySlug, { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } }] } };
    var q = { structuredQuery: { from: [{ collectionId: 'firefly_journal' }], where: where, limit: 1 } };
    fetch(DB + ':runQuery?key=' + fb.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        var row = (rows || []).filter(function (x) { return x.document; })[0];
        var a = row ? dec({ mapValue: row.document }) : null;
        if (!a || (!preview && (a.status !== 'published' || Date.parse(a.publishAt) > Date.now()))) throw new Error('not found');
        if (preview) { var bar = document.createElement('p'); bar.className = 'center'; bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;margin:0;padding:10px;background:#f1d79f;color:#1b1917;font:600 13px/1.4 Manrope,sans-serif'; bar.textContent = 'Preview — ' + (a.status === 'published' ? (Date.parse(a.publishAt) > Date.now() ? 'scheduled' : 'published') : 'draft, not on the website yet'); document.body.appendChild(bar); }
        document.title = (a.seoTitle || a.title) + ' | Firefly Photography';
        var h = live.querySelector('.art-hero');
        if (a.cover && a.cover.src) { var im = document.createElement('img'); im.className = 'art-hero__bg'; im.src = a.cover.src; im.alt = a.cover.alt || ''; h.insertBefore(im, h.firstChild); }
        h.querySelector('h1').textContent = a.title;
        var meta = document.createElement('p'); meta.className = 'art-hero__meta';
        meta.textContent = 'By Shelly Bowman · ' + new Date(a.publishAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        h.querySelector('.art-hero__copy').appendChild(meta);
        // keep safe markup only
        var doc = new DOMParser().parseFromString('<div>' + (a.body || '') + '</div>', 'text/html');
        doc.querySelectorAll('script,style,iframe:not([src^="https://www.youtube"]):not([src^="https://player.vimeo"]),object,embed,form,link,meta').forEach(function (n) { n.remove(); });
        doc.querySelectorAll('*').forEach(function (n) { Array.prototype.slice.call(n.attributes).forEach(function (at) { if (/^on/i.test(at.name) || /^\s*(javascript|data|vbscript):/i.test(at.value)) n.removeAttribute(at.name); }); });
        live.querySelector('.art-body').innerHTML = doc.body.firstChild.innerHTML;
        reveal(live);
      })
      .catch(function () { live.querySelector('h1').textContent = 'This story has flown away.'; live.querySelector('.art-body').innerHTML = '<p class="center"><a href="/journal/">Back to the Journal</a></p>'; });
  }
})();
