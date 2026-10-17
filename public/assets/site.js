// Firefly Photography — the page's behaviour: fireflies, menu, header, scroll-in, the photo viewer, the inquiry form.
(function () {
  var EMAIL = 'ShellyLBowman@gmail.com';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ── Fireflies: soft glowing dots that drift, blink and wander (only while on screen)
  function fireflies(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var flies = [], w = 0, h = 0, running = false, raf = 0;
    function size() {
      var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, Math.max(18, (w * h) / 22000)));
      flies = Array.from({ length: n }, function () {
        return { x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 1.8, a: Math.random() * Math.PI * 2,
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
        g.addColorStop(0, 'rgba(255, 228, 160,' + (0.85 * glow + 0.08) + ')');
        g.addColorStop(.25, 'rgba(242, 189, 92,' + (0.45 * glow + 0.03) + ')');
        g.addColorStop(1, 'rgba(242, 189, 92, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 9, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    size(); draw();
    if (calm) return;
    window.addEventListener('resize', function () { size(); });
    new IntersectionObserver(function (e) {
      var on = e[0].isIntersecting;
      if (on && !running) { running = true; raf = requestAnimationFrame(draw); }
      if (!on) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }
  document.querySelectorAll('canvas.fireflies').forEach(fireflies);

  // ── The logo's firefly leans a little with the mouse
  if (!calm && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.hero, .page-hero--plain, .book').forEach(function (sec) {
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
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.querySelectorAll('a[href="#book"]').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // ── Portfolio menu: closes on a click elsewhere or Escape
  var drops = document.querySelectorAll('.drop');
  document.addEventListener('click', function (e) { drops.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; }); });

  // ── Scroll-in
  var reveals = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) reveals.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ── Photo viewer: any [data-gallery] list; arrows, keys and swipe
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img'), boxCap = box.querySelector('figcaption');
  var list = [], at = 0, lastFocus = null;
  function show(i) {
    at = (i + list.length) % list.length;
    boxImg.src = list[at]; boxCap.textContent = (at + 1) + ' / ' + list.length;
    var next = new Image(); next.src = list[(at + 1) % list.length]; // the next one is ready when it's asked for
  }
  function open(items, i) { list = items; lastFocus = document.activeElement; box.hidden = false; document.body.style.overflow = 'hidden'; show(i); box.querySelector('.lightbox__close').focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; boxImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); }
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var items = Array.prototype.map.call(g.querySelectorAll('[data-full]'), function (b) { return b.getAttribute('data-full'); });
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-full]'); if (!b) return;
      // the film strip shows its photos twice (for the endless loop): open the real one
      open(items.slice(0, g.querySelectorAll('[data-full]').length), Number(b.getAttribute('data-index')) || 0);
    });
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(at - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(at + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!box.hidden) close(); drops.forEach(function (d) { d.open = false; }); setMenu(false); }
    if (box.hidden) return;
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
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

  // ── Inquiry form: emailed to Shelly through FormSubmit (formsubmit.co — free, no account; the very first
  //    inquiry sends an "activate" email to her inbox that she clicks once). On a failure she can still be emailed.
  var form = document.getElementById('inquiry');
  if (form) {
    var err = form.querySelector('.inquiry__error'), btn = form.querySelector('button[type="submit"]');
    var val = function (n) { return (form.elements[n].value || '').trim(); };
    form.addEventListener('input', function (e) { if (e.target.classList.contains('bad') && e.target.value.trim()) e.target.classList.remove('bad'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = ['name', 'email', 'session'].filter(function (n) { var bad = !val(n) || (n === 'email' && !/^\S+@\S+\.\S+$/.test(val(n))); form.elements[n].classList.toggle('bad', bad); return bad; });
      if (missing.length) { err.textContent = 'Please add your name, a working email and the kind of session.'; err.hidden = false; form.elements[missing[0]].focus(); return; }
      err.hidden = true; btn.disabled = true; btn.querySelector('span').textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/' + EMAIL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'New inquiry: ' + val('session') + ' — ' + val('name'), _template: 'table', _captcha: 'false', _replyto: val('email'),
          Name: val('name'), Email: val('email'), Phone: val('phone') || '—', Session: val('session'), 'Date / season': val('date') || '—', Message: val('message') || '—',
          Page: location.pathname,
        }),
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function () {
        form.querySelector('.inquiry__name').textContent = ', ' + val('name').split(/\s+/)[0];
        form.classList.add('sent'); form.querySelector('.inquiry__done').hidden = false;
      }).catch(function () {
        var body = encodeURIComponent('Hi Shelly,\n\n' + val('message') + '\n\nSession: ' + val('session') + '\nDate: ' + val('date') + '\nPhone: ' + val('phone') + '\n\n' + val('name'));
        err.innerHTML = 'That didn’t go through — check your connection, or <a href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Photo session inquiry') + '&body=' + body + '">email Shelly directly</a>.';
        err.hidden = false;
      }).finally(function () { btn.disabled = false; btn.querySelector('span').textContent = 'Send my inquiry'; });
    });
  }
})();
