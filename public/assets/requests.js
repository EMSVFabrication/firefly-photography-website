// "Report / Request" — the System Requests window of the ASAP, BIC, STLFIT and EMSV sites, for this static site.
// Something is wrong, or a change / idea: sent with the page, the time, the device and screen size, this tab's last
// error messages and (if ticked) a picture of the screen or one picked from the phone. Saved in the database
// (firefly_requests in the shared Firebase project); Claude reads the new ones and marks them done when built.
//   firefly_requests/{id} = { kind: 'bug' | 'change', text, page, pageLabel, status: 'new', byName, createdAt, device,
//       errors: [{ at, kind, msg }], hasPicture, site }   later: doneAt / doneBy / doneNote, updatedAt / updatedBy
//     /picture/screen = { dataUrl (JPEG), width, height } — a doc of its own so the list stays light
// "See requests" in the window lists them all (newest first), with their pictures and New / Working on it / Done; the
// top button shows how many are new. (owner 2026-10-16: "some sort of way to see the requests")
// TEST PERIOD: the button shows for everyone (owner 2026-10-16); take it out before the site goes live.
(function () {
  var CFG = window.FF_REQUESTS; if (!CFG) return;
  var DB = 'https://firestore.googleapis.com/v1/projects/' + CFG.project + '/databases/(default)/documents';
  var MAX_TEXT = 4000, MAX_SIDE = 1280, MAX_DATA_URL = 900 * 1024;

  // ── the last error messages of this tab (sent along, so whoever fixes it sees what went wrong)
  var errors = [];
  function keep(kind, msg) { msg = String(msg || '').replace(/\s+/g, ' ').trim().slice(0, 400); if (msg) { errors.push({ at: new Date().toISOString(), kind: kind, msg: msg }); if (errors.length > 15) errors.shift(); } }
  window.addEventListener('error', function (e) { keep('error', (e.error && e.error.message) || e.message); });
  window.addEventListener('unhandledrejection', function (e) { keep('promise', e.reason && (e.reason.message || e.reason)); });
  var original = console.error; console.error = function () { try { keep('console', Array.prototype.join.call(arguments, ' ')); } catch (_) { /* never break */ } return original.apply(console, arguments); };

  // ── the pages a note can be about
  var PAGES = [['home', 'Home page'], ['weddings', 'Weddings & Elopements'], ['seniors', 'High School Seniors'], ['family', 'Family'], ['newborn', 'Newborn'],
    ['maternity', 'Maternity'], ['headshots', 'Headshots & Modeling'], ['pricing', 'Services & pricing'], ['about', 'About'], ['book', 'Booking form'], ['general', 'Whole site']];
  function pageNow() {
    var p = location.pathname;
    if (p === '/' || p === '/index.html') return 'home';
    var m = /^\/portfolio\/([^/]+)/.exec(p); if (m) return m[1];
    if (p.indexOf('/pricing') === 0) return 'pricing';
    if (p.indexOf('/about') === 0) return 'about';
    return 'general';
  }
  var label = function (id) { for (var i = 0; i < PAGES.length; i++) if (PAGES[i][0] === id) return PAGES[i][1]; return 'Whole site'; };

  function device() {
    var ua = navigator.userAgent || '', touch = (navigator.maxTouchPoints || 0) > 0, w = innerWidth, h = innerHeight;
    var os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'other';
    var browser = /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'other';
    return { kind: w < 768 ? 'phone' : w < 1024 && touch ? 'tablet' : 'desktop', os: os, browser: browser, viewport: w + ' × ' + h,
      screen: (screen.width || 0) + ' × ' + (screen.height || 0), dpr: String(Math.round((devicePixelRatio || 1) * 100) / 100), touch: touch, online: navigator.onLine !== false, ua: ua.slice(0, 300) };
  }

  // ── pictures: of the page behind the window (html2canvas, fetched only when needed), or one picked from the device
  function toJpeg(canvas) {
    var qs = [0.72, 0.55, 0.4];
    for (var i = 0; i < qs.length; i++) { var d = canvas.toDataURL('image/jpeg', qs[i]); if (d.length <= MAX_DATA_URL) return { dataUrl: d, width: canvas.width, height: canvas.height }; }
    return null;
  }
  var h2c = null;
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (!h2c) h2c = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = function () { ok(window.html2canvas); }; s.onerror = function () { h2c = null; no(new Error('no html2canvas')); }; document.head.appendChild(s);
    });
    return h2c;
  }
  function screenPicture() {
    var w = innerWidth, h = innerHeight;
    var root = document.documentElement;
    var draw = function (side) {
      return loadH2C().then(function (html2canvas) {
        // html2canvas scrolls its copy of the page to where the visitor is; with the site's smooth scrolling on, the
        // copy is still at the top when it is drawn — so it goes off (inline, which the copy takes along) meanwhile
        var smooth = root.style.scrollBehavior; root.style.scrollBehavior = 'auto';
        return html2canvas(document.body, {
          onclone: function (doc) {
            // the copy: animations at their end state (so nothing is half-faded), the firefly canvases as still pictures
            var st = doc.createElement('style'); st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}.reveal{opacity:1!important;translate:none!important}' +
              // html2canvas draws a closed menu as open and a gradient-filled heading as a solid box
              '.drop:not([open]) .drop__panel{display:none!important}h1 em{background:none!important;-webkit-text-fill-color:#f2bd5c!important;color:#f2bd5c!important}'; doc.head.appendChild(st);
            var live = document.querySelectorAll('canvas.fireflies'), copies = doc.querySelectorAll('canvas.fireflies');
            for (var i = 0; i < copies.length && i < live.length; i++) { try { var im = doc.createElement('img'); im.src = live[i].toDataURL(); im.className = copies[i].className; copies[i].replaceWith(im); } catch (_) { /* skip */ } }
          }, scale: Math.min(devicePixelRatio || 1, side / Math.max(w, h)), logging: false, useCORS: true, backgroundColor: '#15110e',
          width: w, height: h, windowWidth: w, windowHeight: h, x: scrollX, y: scrollY, ignoreElements: function (el) { return el.id === 'rq'; } })
          .finally(function () { root.style.scrollBehavior = smooth; });
      }).then(toJpeg);
    };
    var timeout = new Promise(function (ok) { setTimeout(function () { ok(null); }, 20000); });
    return Promise.race([draw(MAX_SIDE).then(function (p) { return p || draw(MAX_SIDE / 2); }), timeout]).catch(function () { return null; });
  }
  function filePicture(file) {
    if (!file || !/^image\//.test(file.type) || !window.createImageBitmap) return Promise.resolve(null);
    return createImageBitmap(file).then(function (bmp) {
      var sides = [MAX_SIDE, MAX_SIDE / 2];
      for (var i = 0; i < sides.length; i++) {
        var k = Math.min(1, sides[i] / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        var j = toJpeg(c); if (j) return j;
      }
      return null;
    }).catch(function () { return null; });
  }

  // ── saving: one write of the note and its picture together (Firestore's REST "commit")
  function value(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string') return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(value) } };
    var f = {}; Object.keys(v).forEach(function (k) { f[k] = value(v[k]); }); return { mapValue: { fields: f } };
  }
  var randomId = function () { var a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', s = ''; for (var i = 0; i < 20; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  function send(note, picture) {
    var id = randomId(), base = 'projects/' + CFG.project + '/databases/(default)/documents/' + CFG.collection + '/' + id;
    var writes = [{ update: { name: base, fields: value(note).mapValue.fields }, currentDocument: { exists: false } }];
    if (picture) writes.push({ update: { name: base + '/picture/screen', fields: value(picture).mapValue.fields }, currentDocument: { exists: false } });
    return fetch(DB + ':commit?key=' + CFG.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ writes: writes }) })
      .then(function (r) { if (!r.ok) return r.json().catch(function () { return {}; }).then(function (b) { throw new Error(r.status === 403 ? 'The database refused it.' : ((b.error && b.error.message) || 'Could not send (' + r.status + ').')); }); return id; },
        function () { throw new Error('No connection. Check the internet and try again.'); });
  }

  // ── reading them back, and moving one between New / Working on it / Done
  function plain(v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(plain);
    if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; Object.keys(f).forEach(function (k) { o[k] = plain(f[k]); }); return o; }
    return null;
  }
  var offline = function () { throw new Error('No connection. Check the internet and try again.'); };
  function listAll() {
    return fetch(DB + '/' + CFG.collection + '?pageSize=300&key=' + CFG.apiKey).then(function (r) {
      if (!r.ok) throw new Error('Could not load the requests (' + r.status + ').');
      return r.json();
    }, offline).then(function (b) {
      return (b.documents || []).map(function (d) { var n = plain({ mapValue: { fields: d.fields } }); n.id = d.name.split('/').pop(); return n; })
        .sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
    });
  }
  function loadPicture(id) {
    return fetch(DB + '/' + CFG.collection + '/' + id + '/picture/screen?key=' + CFG.apiKey).then(function (r) { return r.ok ? r.json() : null; }, offline)
      .then(function (b) { return b && b.fields && b.fields.dataUrl ? b.fields.dataUrl.stringValue : null; });
  }
  function setStatus(id, status) {
    var at = new Date().toISOString(), by = 'Website test mode';
    var fields = { status: status, updatedAt: at, updatedBy: by };
    if (status === 'working') { fields.workingAt = at; fields.workingBy = by; }
    if (status === 'done') { fields.doneAt = at; fields.doneBy = by; }
    // fields named in the mask but left out are removed: back to New clears the working / done stamps
    var mask = ['status', 'updatedAt', 'updatedBy'].concat(status === 'working' ? ['workingAt', 'workingBy', 'doneAt', 'doneBy', 'doneNote'] : status === 'done' ? ['doneAt', 'doneBy'] : ['workingAt', 'workingBy', 'doneAt', 'doneBy', 'doneNote']);
    return fetch(DB + '/' + CFG.collection + '/' + id + '?' + mask.map(function (m) { return 'updateMask.fieldPaths=' + m; }).join('&') + '&key=' + CFG.apiKey,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: value(fields).mapValue.fields }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status === 403 ? 'The database refused it.' : 'Could not change it (' + r.status + ').'); }, offline);
  }

  // ── how many are new, on the top button
  function showCount(list) {
    var n = list.filter(function (x) { return x.status === 'new'; }).length;
    document.querySelectorAll('[data-request]').forEach(function (b) {
      var c = b.querySelector('.rq-count');
      if (!c) { c = document.createElement('b'); c.className = 'rq-count'; b.appendChild(c); }
      c.textContent = n; c.hidden = !n;
      b.classList.toggle('has-new', n > 0);
      b.setAttribute('aria-label', 'Report a problem or request a change' + (n ? ' — ' + n + ' new request' + (n === 1 ? '' : 's') : ''));
    });
  }
  function refreshCount() { return listAll().then(function (l) { showCount(l); return l; }, function () { return null; }); }

  // ── the window
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ICON = {
    bug: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>',
    idea: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21h6v-1H9v1zm3-19a7 7 0 00-4 12.700V17a1 1 0 001 1h6a1 1 0 001-1v-2.300A7 7 0 0012 2z"/></svg>',
    pic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.500 13.500l2.500 3 3.500-4.500 4.500 6H5l3.500-4.500z"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.400 20.400L22 12 2.400 3.600 2.400 10.200 16 12 2.400 13.800z"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h2v2H4V6zm4 0h12v2H8V6zm-4 5h2v2H4v-2zm4 0h12v2H8v-2zm-4 5h2v2H4v-2zm4 0h12v2H8v-2z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.800l5.600-5.600L12 4l-8 8 8 8 1.400-1.400L7.800 13H20v-2z"/></svg>',
  };
  var STATUS = { new: 'New', working: 'Working on it', done: 'Done' };
  var box = null, draft = null, picture = { state: 'none' }, withPicture = true, shot = 0, lastFocus = null;
  var view = 'compose', list = { state: 'idle', items: [], filter: 'open', error: '', pics: {} };
  var fresh = function () { return { kind: 'bug', text: '', page: pageNow() }; };

  function build() {
    box = document.createElement('div'); box.id = 'rq'; box.className = 'rq'; box.hidden = true;
    box.innerHTML = '<div class="rq__back"></div><div class="rq__win" role="dialog" aria-modal="true" aria-labelledby="rqTitle"><div class="rq__head"><h2 id="rqTitle">Report a problem or request a change</h2><button type="button" class="rq__x" aria-label="Close">×</button></div><div class="rq__body"></div></div>';
    document.body.appendChild(box);
    box.querySelector('.rq__back').addEventListener('click', close);
    box.querySelector('.rq__x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  }

  function takePicture() {
    var my = ++shot; picture = { state: 'taking' }; render();
    setTimeout(function () { screenPicture().then(function (p) { if (my === shot) { picture = p ? { state: 'ready', data: p, from: 'screen' } : { state: 'failed' }; render(); } }); }, 80);
  }

  function render(sent, problem) {
    var body = box.querySelector('.rq__body');
    box.querySelector('#rqTitle').textContent = view === 'list' ? 'System requests' : 'Report a problem or request a change';
    if (view === 'list') { renderList(body); return; }
    if (sent) {
      body.innerHTML = '<div class="rq__sent"><span class="rq__spark" aria-hidden="true"></span><h3>Sent — thank you.</h3><p>It’s on the System Requests list now. Changes are made from there, and it’s marked done when it’s live.</p><div class="rq__row"><button type="button" class="btn btn--line" data-act="another">Send another</button><button type="button" class="btn btn--glow" data-act="close">Close</button></div><button type="button" class="rq__link" data-act="list">See all requests</button></div>';
      body.querySelector('[data-act=another]').onclick = function () { draft = fresh(); withPicture = true; takePicture(); };
      body.querySelector('[data-act=close]').onclick = close;
      body.querySelector('[data-act=list]').onclick = showList;
      return;
    }
    var bug = draft.kind === 'bug', left = MAX_TEXT - draft.text.length;
    var alsoSent = ['the page', 'the time', 'your device and screen size'];
    if (errors.length) alsoSent.push(errors.length + ' recent error message' + (errors.length === 1 ? '' : 's'));
    var pic = '';
    if (withPicture) {
      if (picture.state === 'taking') pic = '<p class="rq__loading"><span class="rq__spin" aria-hidden="true"></span>Getting the picture…</p>';
      else if (picture.state === 'failed') pic = '<p class="rq__warn">Couldn’t get a picture — the note goes without one.</p>';
      else if (picture.state === 'ready') pic = '<img class="rq__preview" src="' + picture.data.dataUrl + '" alt="The picture, as it will be sent">';
      pic += '<label class="btn btn--line btn--sm rq__file">' + ICON.pic + (picture.state === 'ready' ? 'Use a different picture' : 'Choose a picture') + '<input type="file" accept="image/*"></label>';
    }
    var newCount = list.items.filter(function (x) { return x.status === 'new'; }).length;
    body.innerHTML =
      '<form class="rq__form" novalidate>' +
      '<button type="button" class="rq__seeall" data-act="list">' + ICON.list + '<span>See requests</span>' + (newCount ? '<b>' + newCount + ' new</b>' : '') + '<i aria-hidden="true">›</i></button>' +
      '<div class="rq__kinds">' +
      '<button type="button" class="rq__kind' + (bug ? ' on' : '') + '" data-kind="bug" aria-pressed="' + bug + '">' + ICON.bug + '<span><b>Something’s wrong</b>A bug or a mistake</span></button>' +
      '<button type="button" class="rq__kind' + (!bug ? ' on' : '') + '" data-kind="change" aria-pressed="' + !bug + '">' + ICON.idea + '<span><b>Change or idea</b>Something new or different</span></button></div>' +
      '<label class="rq__field"><span>Page</span><select name="page">' + PAGES.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === draft.page ? ' selected' : '') + '>' + esc(p[1]) + '</option>'; }).join('') + '</select></label>' +
      '<label class="rq__field"><span>' + (bug ? 'What happened? What did you expect?' : 'What would you like changed or added?') + '</span>' +
      '<textarea name="text" rows="5" maxlength="' + MAX_TEXT + '" placeholder="' + (bug ? 'e.g. The pricing page cuts off on my phone.' : 'e.g. Add a gallery for engagement photos.') + '">' + esc(draft.text) + '</textarea>' +
      (left < 300 ? '<small>' + left + ' characters left</small>' : '') + '</label>' +
      '<div class="rq__box"><label class="rq__check"><input type="checkbox" name="pic"' + (withPicture ? ' checked' : '') + '><span>Add a picture of the screen</span></label>' + pic + '</div>' +
      '<p class="rq__fine">Also sent: ' + alsoSent.join(', ') + '.' + (errors.length ? ' <button type="button" class="rq__link" data-act="errs">Show them</button><pre class="rq__pre" hidden>' + esc(errors.map(function (e) { return e.at.slice(11, 19) + ' ' + e.kind + ': ' + e.msg; }).join('\n')) + '</pre>' : '') + '</p>' +
      (problem ? '<p class="rq__error" role="alert">' + esc(problem) + '</p>' : '') +
      '<div class="rq__row"><button type="button" class="btn btn--line" data-act="cancel">' + (draft.text.trim() ? 'Later' : 'Cancel') + '</button>' +
      '<button type="submit" class="btn btn--glow"' + (draft.text.trim().length < 3 || (withPicture && picture.state === 'taking') ? ' disabled' : '') + '>' + ICON.send + '<span>Send</span></button></div></form>';

    var form = body.querySelector('form'), ta = form.elements.text;
    body.querySelectorAll('[data-kind]').forEach(function (b) { b.onclick = function () { draft.kind = b.getAttribute('data-kind'); render(); }; });
    form.elements.page.onchange = function () { draft.page = this.value; };
    ta.oninput = function () {
      draft.text = ta.value;
      var s = form.querySelector('[type=submit]'); s.disabled = draft.text.trim().length < 3 || (withPicture && picture.state === 'taking');
      form.querySelector('[data-act=cancel]').textContent = draft.text.trim() ? 'Later' : 'Cancel';
    };
    form.elements.pic.onchange = function () { withPicture = this.checked; if (withPicture && picture.state !== 'ready' && picture.state !== 'taking') takePicture(); else render(); };
    var file = form.querySelector('input[type=file]');
    if (file) file.onchange = function () {
      var f = file.files && file.files[0]; if (!f) return; var my = ++shot; picture = { state: 'taking' }; render();
      filePicture(f).then(function (p) { if (my === shot) { picture = p ? { state: 'ready', data: p, from: 'file' } : { state: 'failed' }; render(); } });
    };
    var errBtn = form.querySelector('[data-act=errs]');
    if (errBtn) errBtn.onclick = function () { var pre = form.querySelector('.rq__pre'); pre.hidden = !pre.hidden; errBtn.textContent = pre.hidden ? 'Show them' : 'Hide them'; };
    form.querySelector('[data-act=cancel]').onclick = close;
    form.querySelector('[data-act=list]').onclick = showList;
    form.onsubmit = function (e) {
      e.preventDefault();
      var text = draft.text.trim(); if (text.length < 3) return;
      var btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.querySelector('span').textContent = 'Sending…';
      var pic = withPicture && picture.state === 'ready' ? picture.data : null;
      send({ kind: draft.kind === 'change' ? 'change' : 'bug', text: text, page: draft.page, pageLabel: label(draft.page), status: 'new', byName: 'Website test mode',
        createdAt: new Date().toISOString(), device: device(), errors: errors.slice(-10), hasPicture: !!pic, site: (location.host + location.pathname + location.hash).slice(0, 200) },
        pic ? { dataUrl: pic.dataUrl, width: pic.width, height: pic.height } : null)
        .then(function () { draft = fresh(); shot++; picture = { state: 'none' }; render(true); refreshCount().then(function (l) { if (l) list.items = l; }); },
          function (err) { render(false, err.message); });
    };
    if (!problem) setTimeout(function () { ta.focus(); }, 30);
  }

  // ── the list of requests
  function showList() { view = 'list'; list.state = 'loading'; render(); loadList(); }
  function loadList() {
    listAll().then(function (l) { list.items = l; list.state = 'ready'; showCount(l); if (view === 'list') render(); },
      function (e) { list.state = 'error'; list.error = e.message; if (view === 'list') render(); });
  }
  var when = function (iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
  function renderList(body) {
    var items = list.items, f = list.filter;
    var counts = { open: 0, new: 0, working: 0, done: 0, all: items.length };
    items.forEach(function (x) { counts[x.status] = (counts[x.status] || 0) + 1; if (x.status !== 'done') counts.open++; });
    var shown = items.filter(function (x) { return f === 'all' || (f === 'open' ? x.status !== 'done' : x.status === f); });
    var tabs = [['open', 'To do'], ['new', 'New'], ['working', 'Working on it'], ['done', 'Done'], ['all', 'All']];
    var html = '<div class="rq__listbar"><button type="button" class="btn btn--line btn--sm" data-act="back">' + ICON.back + 'New request</button>' +
      '<button type="button" class="rq__link" data-act="reload">Refresh</button></div>' +
      '<div class="rq__tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (f === t[0]) + '" class="rq__tab' + (f === t[0] ? ' on' : '') + '" data-filter="' + t[0] + '">' + t[1] + ' <small>' + counts[t[0]] + '</small></button>'; }).join('') + '</div>';
    if (list.state === 'loading' && !items.length) html += '<p class="rq__loading"><span class="rq__spin" aria-hidden="true"></span>Loading the requests…</p>';
    else if (list.state === 'error') html += '<p class="rq__error" role="alert">' + esc(list.error) + '</p>';
    else if (!shown.length) html += '<p class="rq__empty">' + (f === 'open' ? 'Nothing to do — every request is done. ✦' : 'None here.') + '</p>';
    else html += '<ul class="rq__items">' + shown.map(function (x) {
      var pic = list.pics[x.id];
      var dev = x.device ? [x.device.kind, x.device.os, x.device.browser].filter(Boolean).join(' · ') : '';
      var next = x.status === 'new' ? [['working', 'Start working'], ['done', 'Mark done']] : x.status === 'working' ? [['done', 'Mark done'], ['new', 'Back to new']] : [['new', 'Reopen']];
      return '<li class="rq__item rq__item--' + esc(x.status) + '">' +
        '<div class="rq__itemhead"><span class="rq__badge rq__badge--' + esc(x.status) + '">' + esc(STATUS[x.status] || x.status) + '</span>' +
        '<span class="rq__kindtag">' + (x.kind === 'change' ? ICON.idea + 'Change or idea' : ICON.bug + 'Something’s wrong') + '</span>' +
        '<time>' + esc(when(x.createdAt)) + '</time></div>' +
        '<p class="rq__text">' + esc(x.text) + '</p>' +
        '<p class="rq__meta">' + esc(x.pageLabel || '') + (dev ? ' · ' + esc(dev) : '') + (x.errors && x.errors.length ? ' · ' + x.errors.length + ' error message' + (x.errors.length === 1 ? '' : 's') : '') + '</p>' +
        (x.status === 'done' && (x.doneNote || x.doneAt) ? '<p class="rq__done">✓ Done' + (x.doneAt ? ' ' + esc(when(x.doneAt)) : '') + (x.doneNote ? ' — ' + esc(x.doneNote) : '') + '</p>' : '') +
        (x.hasPicture ? (pic === 'loading' ? '<p class="rq__loading"><span class="rq__spin" aria-hidden="true"></span>Loading the picture…</p>'
          : pic ? '<button type="button" class="rq__shot" data-zoom="' + esc(x.id) + '" aria-label="Show the picture bigger"><img src="' + pic + '" alt="Picture sent with this request"></button>'
          : '<button type="button" class="rq__link" data-pic="' + esc(x.id) + '">' + (pic === null ? 'Picture couldn’t load — try again' : 'Show the picture') + '</button>') : '') +
        '<div class="rq__itemacts">' + next.map(function (n) { return '<button type="button" class="btn btn--sm ' + (n[0] === 'done' ? 'btn--glow' : 'btn--line') + '" data-status="' + n[0] + '" data-id="' + esc(x.id) + '">' + n[1] + '</button>'; }).join('') + '</div>' +
        '</li>';
    }).join('') + '</ul>';
    body.innerHTML = '<div class="rq__list">' + html + '</div>';

    body.querySelector('[data-act=back]').onclick = function () { view = 'compose'; render(); };
    body.querySelector('[data-act=reload]').onclick = function () { list.state = 'loading'; render(); loadList(); };
    body.querySelectorAll('[data-filter]').forEach(function (b) { b.onclick = function () { list.filter = b.getAttribute('data-filter'); render(); }; });
    body.querySelectorAll('[data-pic]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-pic'); list.pics[id] = 'loading'; render();
        loadPicture(id).then(function (d) { list.pics[id] = d; render(); }, function () { list.pics[id] = null; render(); });
      };
    });
    body.querySelectorAll('[data-zoom]').forEach(function (b) { b.onclick = function () { b.classList.toggle('big'); }; });
    body.querySelectorAll('[data-status]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-id'), st = b.getAttribute('data-status');
        body.querySelectorAll('[data-id="' + id + '"]').forEach(function (x) { x.disabled = true; });
        setStatus(id, st).then(function () {
          list.items.forEach(function (x) { if (x.id === id) { x.status = st; if (st === 'done') x.doneAt = new Date().toISOString(); } });
          showCount(list.items); render();
        }, function (e) { list.state = 'error'; list.error = e.message; render(); });
      };
    });
  }

  function open() {
    if (!box) build();
    view = 'compose';
    lastFocus = document.activeElement;
    if (!draft || !draft.text.trim()) { draft = fresh(); withPicture = true; box.hidden = true; takePicture(); } // an unsent draft keeps its picture
    box.hidden = false; document.body.classList.add('rq-open'); render();
  }
  function close() { if (!box) return; box.hidden = true; document.body.classList.remove('rq-open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  refreshCount().then(function (l) { if (l) list.items = l; });
  document.querySelectorAll('[data-request]').forEach(function (b) { b.addEventListener('click', function () { var nav = document.getElementById('nav'); if (nav && nav.classList.contains('open')) document.getElementById('menuBtn').click(); setTimeout(open, 60); }); });
})();
