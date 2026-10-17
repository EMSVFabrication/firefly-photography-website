// Firefly ERP: the frame (sidebar, top bar, Publish button), sign-in (not required during testing) and the router.
import { AUTH_REQUIRED } from './config.js';
import { AU, CONFIG, FS, auth, db } from './fb.js';
import { fmt, h, toast } from './ui.js';

const VIEWS = [
    { id: 'dashboard', name: 'Dashboard', icon: '◈', load: () => import('./views/dashboard.js') },
    { id: 'inquiries', name: 'Inquiries', icon: '✉', load: () => import('./views/inquiries.js') },
    { id: 'journal', name: 'Journal', icon: '✎', load: () => import('./views/journal.js') },
    { id: 'portfolio', name: 'Portfolio & services', icon: '▦', load: () => import('./views/portfolio.js') },
    { id: 'pages', name: 'Pages & text', icon: '❡', load: () => import('./views/pages.js') },
    { id: 'pricing', name: 'Pricing', icon: '$', load: () => import('./views/pricing.js') },
    { id: 'reviews', name: 'Reviews', icon: '★', load: () => import('./views/reviews.js') },
    { id: 'photos', name: 'Photo library', icon: '◐', load: () => import('./views/photos.js') },
    { id: 'settings', name: 'Settings', icon: '⚙', load: () => import('./views/settings.js') },
    { id: 'guide', name: 'How-to guide', icon: '?', load: () => import('./views/guide.js') },
];

const root = document.getElementById('app');
let current = null;

function shell() {
    const nav = h('nav.side__nav', ...VIEWS.map((v) => h('a.side__link', { href: `#/${v.id}`, 'data-view': v.id }, h('span.side__icon', v.icon), h('span', v.name))));
    const pub = h('button.btn.btn--gold', { type: 'button', id: 'publishBtn', on: { click: publish } }, 'Publish to website');
    const pubState = h('span.pubstate', { id: 'pubState' }, '');
    return h('div.shell',
        h('aside.side',
            h('a.side__brand', { href: '#/dashboard' }, h('img', { src: '/img/logo/emblem-800.webp', alt: '' }), h('span', h('strong', 'Firefly'), h('small', 'Studio ERP'))),
            nav,
            h('div.side__foot',
                h('a', { href: '/', target: '_blank', rel: 'noopener' }, 'View website ↗'),
                h('span.muted', CONFIG.projectId),
                !AUTH_REQUIRED ? h('span.badge.badge--warn', { title: 'Sign-in is switched off during testing (config.js AUTH_REQUIRED).' }, 'Test mode · no sign-in') : null,
                auth.currentUser ? h('button.linkish', { type: 'button', on: { click: () => AU.signOut(auth).then(() => location.reload()) } }, `Sign out ${auth.currentUser.email}`) : null)),
        h('div.main',
            h('header.top', h('button.icon-btn.top__menu', { type: 'button', 'aria-label': 'Menu', on: { click: () => document.body.classList.toggle('side-open') } }, '☰'),
                h('h1#viewTitle', ''), h('div.top__actions', pubState, pub)),
            h('main#view.view')));
}

async function route() {
    const id = (location.hash.match(/^#\/([\w-]+)/) || [])[1] || 'dashboard';
    const v = VIEWS.find((x) => x.id === id) || VIEWS[0];
    const rest = location.hash.replace(/^#\/[\w-]+\/?/, '');
    document.querySelectorAll('.side__link').forEach((a) => a.classList.toggle('on', a.dataset.view === v.id));
    document.body.classList.remove('side-open');
    document.getElementById('viewTitle').textContent = v.name;
    document.title = `${v.name} · Firefly ERP`;
    const view = document.getElementById('view');
    if (current?.leave) current.leave();
    view.replaceChildren(h('p.muted', 'Loading…'));
    try {
        const mod = await v.load();
        current = mod;
        await mod.render(view, rest);
    } catch (e) { console.error(e); view.replaceChildren(h('div.card', h('h2', 'Something went wrong'), h('p', e.message))); }
}

// ── Publish: ask the server to rebuild and release the website with everything saved here
let pubTimer = null;
async function publish() {
    const btn = document.getElementById('publishBtn');
    btn.disabled = true; btn.textContent = 'Publishing…';
    try {
        await FS.addDoc(FS.collection(db, 'firefly_publish'), { requestedAt: new Date().toISOString(), by: auth.currentUser?.email || 'ERP (testing)', status: 'requested' });
        toast('Publishing… the website updates in a minute or two.');
        clearTimeout(pubTimer);
        pubTimer = setTimeout(() => { const s = document.getElementById('pubState'); if (s && /Publishing/.test(btn.textContent)) { btn.disabled = false; btn.textContent = 'Publish to website'; s.textContent = 'No answer from the publishing service yet — see Settings → System.'; } }, 120000);
    } catch (e) {
        btn.disabled = false; btn.textContent = 'Publish to website';
        toast(/permission/i.test(e.message) ? 'Publishing needs the Firefly database rules deployed (Settings → System).' : `Couldn’t publish: ${e.message}`, 'error');
    }
}
function watchPublish() {
    try {
        FS.onSnapshot(FS.doc(db, 'firefly_meta', 'publish'), (snap) => {
            const d = snap.data() || {};
            const s = document.getElementById('pubState'), btn = document.getElementById('publishBtn');
            if (!s) return;
            if (d.state === 'publishing') { btn.disabled = true; btn.textContent = 'Publishing…'; s.textContent = 'Building the website…'; return; }
            btn.disabled = false; btn.textContent = 'Publish to website';
            if (d.state === 'error') s.textContent = `Last publish failed: ${d.message || ''}`;
            else if (d.pending) s.textContent = `Unpublished changes (${d.lastChangeWhat || 'content'}, ${fmt(d.lastChange)})`;
            else s.textContent = d.publishedAt ? `Live · published ${fmt(d.publishedAt)}` : '';
            btn.classList.toggle('btn--pulse', !!d.pending);
        }, () => { /* rules not deployed yet */ });
    } catch { /* ignore */ }
}

// ── sign-in (built for launch; skipped while AUTH_REQUIRED is false)
function signIn() {
    const err = h('p.error', { hidden: true });
    const email = h('input', { type: 'email', autocomplete: 'username', required: true });
    const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true });
    const f = h('form.login', { on: { submit: async (e) => {
        e.preventDefault(); err.hidden = true;
        try { await AU.signInWithEmailAndPassword(auth, email.value.trim(), pass.value); location.reload(); }
        catch (x) { err.textContent = 'That email and password didn’t match.'; err.hidden = false; }
    } } },
    h('img', { src: '/img/logo/emblem-800.webp', alt: '' }), h('h1', 'Firefly Studio'),
    h('label.field', h('span.field__label', 'Email'), email), h('label.field', h('span.field__label', 'Password'), pass), err,
    h('button.btn.btn--gold', { type: 'submit' }, 'Sign in'),
    h('button.linkish', { type: 'button', on: { click: async () => { if (!email.value) { err.textContent = 'Type your email first.'; err.hidden = false; return; } await AU.sendPasswordResetEmail(auth, email.value.trim()).catch(() => {}); toast('If that email has an account, a reset link is on its way.'); } } }, 'Forgot password?'));
    root.replaceChildren(h('div.login-wrap', f));
}
async function allowed(user) {
    if (!user) return false;
    try { const d = (await FS.getDoc(FS.doc(db, 'firefly_users', user.uid))).data(); return !!(d?.active && ['owner', 'editor'].includes(d.role)); } catch { return false; }
}

AU.onAuthStateChanged(auth, async (user) => {
    if (AUTH_REQUIRED && !(await allowed(user))) {
        if (user) { await AU.signOut(auth); toast('This account doesn’t have access to the Firefly ERP.', 'error'); }
        signIn(); return;
    }
    if (!document.querySelector('.shell')) { root.replaceChildren(shell()); window.addEventListener('hashchange', route); watchPublish(); }
    route();
});
