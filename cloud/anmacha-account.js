/* AnMaCha Konto – EIN Login mit Google für Radio, Spiele, Homepage, Apps und Einbettungen (Kopf-Knopf mit Auswahlmenü).
 *
 *   <script src="cloud/anmacha-account.js"></script>
 *   AnMaChaAccount.mount('#konto', { items: [{ label: 'Konto', href: 'konto.html', icon: '👤' }, …] });   // Knopf „Anmelden“ bzw. Avatar mit Menü
 *   AnMaChaAccount.user()    // { name, picture } oder null          AnMaChaAccount.login() / logout()      AnMaChaAccount.onChange(fn)
 *
 * Ablauf: Auf Seiten, auf denen die Firebase-Anmeldung der Spiele erlaubt ist (github.io, ricorewi-radio.de), meldet ein Klick dort an und tauscht die Anmeldung beim Server
 * gegen das eigene Konto-Token (account_firebase) – dann gilt derselbe Login auch für Bewertungen und Kommentare. Überall sonst (eigene Seiten mit eingebetteten Spielen, fremde
 * Hosts) öffnet sich die Anmelde-Seite von ricorewi-radio.de als Fenster und liefert das Token per postMessage zurück (nur an die öffnende Seite). Das Token liegt im selben
 * Speicherplatz wie bei den Bewertungen (anmacha-rating-token) und gilt für Spielstände, Favoriten, Bewertungen und Kommentare. Apps koppeln sich über den Browser (anmacha-cloud.js). */
(function (root) {
  'use strict';
  if (root.AnMaChaAccount) return;
  var doc = root.document, LS = null;
  try { LS = root.localStorage; } catch (e) { LS = null; }
  var HOST = (root.location && root.location.hostname) || '';
  var PORTAL = 'https://www.ricorewi-radio.de/';
  var API = /(^|\.)ricorewi-radio\.de$/.test(HOST) ? '/cms/api.php' : PORTAL + 'cms/api.php';
  var TOK = 'anmacha-rating-token', USR = 'anmacha-rating-user', ON = 'anmacha-cloud-on';
  var APP = HOST === 'appassets.local' || HOST === 'appassets.androidplatform.net' || !!root.EasyGamesApp || /(RicoReWi|EasyGames)App\//.test(root.navigator.userAgent);
  var listeners = [], mounts = [], busy = null, lastErr = '';
  var framed = root.parent !== root;
  // Eingebettet in eine fremde Seite (anderer Ursprung): dort sind Firebase-Anmeldung und Speicher oft gesperrt/getrennt → Anmelde-Fenster + Weitergabe über die einbettende Seite
  var crossFramed = (function () { if (!framed) return false; try { void root.parent.location.href; return false; } catch (e) { return true; } })();
  function toParent(t, u) { if (framed) { try { root.parent.postMessage({ type: 'anmacha-account', token: t || '', user: t ? { name: u && u.name || '', picture: u && u.picture || '' } : null }, '*'); } catch (e) { } } }

  function store(k, v) { try { if (v === undefined) return LS ? LS.getItem(k) : null; if (v === null) LS && LS.removeItem(k); else LS && LS.setItem(k, v); } catch (e) { } return null; }
  function token() { return store(TOK) || ''; }
  function ownUser() { try { var u = JSON.parse(store(USR) || 'null'); return token() && u && u.name ? u : null; } catch (e) { return null; } }
  function cloud() { return root.AnMaChaCloud || null; }
  // Angemeldete Person: eigenes Konto, sonst (alte Anmeldungen) die Firebase-Anmeldung der Spiele
  function user() {
    var o = ownUser(); if (o) return o;
    var c = cloud(), f = c && c.user && c.user();
    return f ? { name: f.displayName || 'Spieler', picture: f.photoURL || '' } : null;
  }
  function fbHost() { return /(^|\.)github\.io$|(^|\.)ricorewi-radio\.de$/.test(HOST); }
  function emit() { listeners.forEach(function (f) { try { f(user()); } catch (e) { } }); mounts.forEach(draw); }

  function setSession(t, u, fromParent) {
    if (!fromParent) toParent(t, u);
    store(TOK, t); store(USR, JSON.stringify({ name: u.name || 'Spieler', picture: u.picture || '' })); store(ON, '1');
    lastErr = ''; emit();
    var c = cloud(); if (c && c.refresh) c.refresh();
    if (root.AnMaChaRating && root.AnMaChaRating.refresh) try { root.AnMaChaRating.refresh(); } catch (e) { }
  }
  function post(action, body) {
    return root.fetch(API + '?action=' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  // Firebase-Anmeldung → eigenes Token (still, ohne Rückfrage)
  function exchange() {
    var c = cloud(); if (!c || !c.account) return Promise.resolve(false);
    return c.account().then(function (a) {
      if (!a || !a.token) return false;
      return post('account_firebase', { idToken: a.token }).then(function (j) { if (j.status === 'ok' && j.token) { setSession(j.token, j.user || { name: a.name }); return true; } return false; });
    }).catch(function () { return false; });
  }
  // Fenster mit der Anmelde-Seite; Antwort nur von ricorewi-radio.de und nur im Fenster, das wir geöffnet haben
  function popup() {
    var w = root.open(PORTAL + 'anmelden.html?o=' + encodeURIComponent(root.location.origin), 'anmacha-login', 'width=440,height=640,noopener=no');
    if (!w) return Promise.reject(new Error('Das Anmelde-Fenster wurde blockiert. Bitte Pop-ups erlauben.'));
    return new Promise(function (res, rej) {
      var t = setInterval(function () { if (w.closed) { cleanup(); rej(new Error('')); } }, 500);
      function cleanup() { clearInterval(t); root.removeEventListener('message', on); }
      function on(e) {
        if (e.source !== w || !/^https:\/\/(www\.)?ricorewi-radio\.de$/.test(e.origin) || !e.data || e.data.type !== 'anmacha-login' || !e.data.token) return;
        cleanup(); res(e.data);
      }
      root.addEventListener('message', on);
    });
  }
  function login() {
    if (busy) return busy;
    var c = cloud(), p;
    if (APP) { p = c && c.firebaseSignIn ? Promise.resolve(c.firebaseSignIn()) : Promise.resolve(); }   // App: Kopplung über den Browser
    else if (fbHost() && !crossFramed && c && c.firebaseSignIn) p = Promise.resolve(c.firebaseSignIn()).then(function () { return exchange(); });
    else p = popup().then(function (d) { setSession(d.token, d.user || {}); });
    busy = p.catch(function (e) { lastErr = e && e.message || ''; emit(); }).then(function () { busy = null; emit(); });
    emit(); return busy;
  }
  function logout() {
    var t = token(); if (t) { try { root.fetch(API + '?action=ratings_logout', { method: 'POST', headers: { Authorization: 'Bearer ' + t } }); } catch (e) { } }
    store(TOK, null); store(USR, null); toParent('');
    var c = cloud(), p = c && c.signOut ? Promise.resolve(c.signOut()) : Promise.resolve();
    return p.then(function () { emit(); if (root.AnMaChaRating && root.AnMaChaRating.refresh) try { root.AnMaChaRating.refresh(); } catch (e) { } });
  }
  function wantedCloud() { return store(ON) === '1'; }
  function onChange(f) { listeners.push(f); }

  /* ───────── Oberfläche ───────── */
  var G = '<svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  var CSS = '.eg-acc{position:relative;display:inline-block;font:14px/1.3 system-ui,-apple-system,Segoe UI,sans-serif;color:inherit}' +
    '.eg-acc-b{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 14px 4px 6px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.08);color:inherit;font:inherit;font-weight:600;cursor:pointer;max-width:200px}' +
    '.eg-acc-b:hover{background:rgba(255,255,255,.14)}.eg-acc-b:focus-visible{outline:2px solid #22d3ee;outline-offset:2px}' +
    '.eg-acc-b.out{padding:4px 14px 4px 10px}.eg-acc-b .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.eg-acc-av{width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;background:linear-gradient(135deg,#b57cff,#22d3ee);color:#fff;font-weight:700;overflow:hidden}' +
    '.eg-acc-av img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.eg-acc-m{position:absolute;right:0;top:calc(100% + 8px);z-index:2147482000;width:min(300px,calc(100vw - 24px));padding:8px;border-radius:16px;background:#141a2b;color:#f4f6ff;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 50px rgba(0,0,0,.5)}' +
    '.eg-acc-m[hidden]{display:none}.eg-acc-h{display:flex;align-items:center;gap:10px;padding:8px 8px 12px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:6px}' +
    '.eg-acc-h .av{width:42px;height:42px}.eg-acc-h b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.eg-acc-h small{color:#9aa5bd}' +
    '.eg-acc-i{display:flex;align-items:center;gap:10px;width:100%;padding:10px 10px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;text-align:left;text-decoration:none;cursor:pointer}' +
    '.eg-acc-i:hover,.eg-acc-i:focus-visible{background:rgba(255,255,255,.1);outline:none}.eg-acc-i .ic{width:22px;text-align:center;flex:none}' +
    '.eg-acc-sep{height:1px;margin:6px 4px;background:rgba(255,255,255,.1)}.eg-acc-note{padding:6px 10px;color:#9aa5bd;font-size:13px}.eg-acc-err{padding:6px 10px;color:#f28b82;font-size:13px}' +
    '@media(max-width:520px){.eg-acc-b .n{display:none}.eg-acc-b{padding:4px}.eg-acc-b.out{width:42px;height:42px;padding:0;justify-content:center}}';
  function css() { if (doc.getElementById('eg-acc-css')) return; var s = doc.createElement('style'); s.id = 'eg-acc-css'; s.textContent = CSS; (doc.head || doc.documentElement).appendChild(s); }
  function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function avatar(u, cls) {
    var a = el('span', 'eg-acc-av ' + (cls || ''));
    if (u && u.picture && /^https:\/\//.test(u.picture)) { var i = el('img'); i.src = u.picture; i.alt = ''; i.referrerPolicy = 'no-referrer'; i.onerror = function () { i.remove(); a.textContent = initial(u); }; a.appendChild(i); } else a.textContent = initial(u);
    return a;
  }
  function initial(u) { return u && u.name ? u.name.trim().charAt(0).toUpperCase() : '👤'; }
  function first(u) { return u.name.trim().split(/\s+/)[0]; }
  function draw(m) {
    var u = user(), host = m.el, open = m.open && !!u;
    host.textContent = '';
    var b = el('button', 'eg-acc-b' + (u ? '' : ' out'));
    b.type = 'button'; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (u) { b.appendChild(avatar(u)); b.appendChild(el('span', 'n', first(u))); b.setAttribute('aria-label', 'Konto von ' + u.name); }
    else { var g = el('span'); g.innerHTML = G; g.style.display = 'inline-flex'; b.appendChild(g); b.appendChild(el('span', 'n', busy ? 'Anmelden …' : 'Anmelden')); b.setAttribute('aria-label', 'Mit Google anmelden'); b.disabled = !!busy; }
    b.onclick = function (e) { e.stopPropagation(); if (!user()) { login(); return; } m.open = !m.open; draw(m); if (m.open) { var f = m.menu && m.menu.querySelector('.eg-acc-i'); if (f) f.focus(); } };
    host.appendChild(b);
    var menu = el('div', 'eg-acc-m'); menu.hidden = !open; menu.setAttribute('role', 'menu'); m.menu = menu;
    if (u) {
      var h = el('div', 'eg-acc-h'); h.appendChild(avatar(u, 'av')); var w = el('div'); w.appendChild(el('b', '', u.name)); w.appendChild(el('small', '', 'Mit Google angemeldet')); h.appendChild(w); menu.appendChild(h);
      (m.items || []).forEach(function (it) {
        if (it === '-' || it.sep) { menu.appendChild(el('div', 'eg-acc-sep')); return; }
        if (it.note) { menu.appendChild(el('div', 'eg-acc-note', it.note)); return; }
        var a = it.href ? el('a', 'eg-acc-i') : el('button', 'eg-acc-i'); a.setAttribute('role', 'menuitem');
        if (it.href) { a.href = it.href; if (it.blank) { a.target = '_blank'; a.rel = 'noopener'; } } else a.type = 'button';
        a.appendChild(el('span', 'ic', it.icon || '')); a.appendChild(el('span', '', it.label));
        a.onclick = function () { m.open = false; draw(m); if (it.fn) it.fn(); };
        menu.appendChild(a);
      });
      menu.appendChild(el('div', 'eg-acc-sep'));
      var lo = el('button', 'eg-acc-i'); lo.type = 'button'; lo.setAttribute('role', 'menuitem'); lo.appendChild(el('span', 'ic', '⎋')); lo.appendChild(el('span', '', 'Abmelden'));
      lo.onclick = function () { m.open = false; logout(); }; menu.appendChild(lo);
    }
    if (lastErr && !u) menu.appendChild(el('div', 'eg-acc-err', lastErr));
    host.appendChild(menu);
    if (lastErr && !u) { var er = el('div', 'eg-acc-err', lastErr); er.style.cssText = 'position:absolute;right:0;top:calc(100% + 6px);width:240px;background:#141a2b;border-radius:10px;z-index:2147482000'; host.appendChild(er); }
  }
  function mount(target, o) {
    css(); o = o || {};
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return null;
    var m = { el: host, items: o.items || [], open: false };
    host.classList.add('eg-acc'); mounts.push(m); draw(m); return m;
  }
  doc.addEventListener('click', function (e) { mounts.forEach(function (m) { if (m.open && !m.el.contains(e.target)) { m.open = false; draw(m); } }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') mounts.forEach(function (m) { if (m.open) { m.open = false; draw(m); var b = m.el.querySelector('.eg-acc-b'); if (b) b.focus(); } }); });
  // Fenster in anderen Tabs: Konto-Wechsel übernehmen
  root.addEventListener('storage', function (e) { if (e.key === TOK || e.key === USR) emit(); });
  root.addEventListener('anmacha-account', function () { if (!token()) toParent(''); emit(); });
  if (framed) {   // Konto der einbettenden Seite übernehmen (easygames.js merkt es sich dort und gibt es an alle eingebetteten Spiele weiter)
    root.addEventListener('message', function (e) {
      var d = e.data; if (e.source !== root.parent || !d || d.type !== 'anmacha-account') return;
      if (d.token && typeof d.token === 'string' && d.user && d.user.name) { if (d.token !== token()) setSession(d.token, d.user, true); }
      else if (token()) { store(TOK, null); store(USR, null); emit(); var c = cloud(); if (c && c.refresh) c.refresh(); }
    });
    try { root.parent.postMessage({ type: 'anmacha-account-hello' }, '*'); } catch (e) { }
  }
  // Bestehende Firebase-Anmeldung (frühere Besuche) einmal pro Sitzung still gegen das eigene Konto tauschen
  setTimeout(function () {
    var c = cloud(); if (ownUser() || !c || !wantedCloud()) return;
    try { if (root.sessionStorage.getItem('anmacha-acc-x')) return; root.sessionStorage.setItem('anmacha-acc-x', '1'); } catch (e) { }
    exchange().then(function () { emit(); });
  }, 1500);

  root.AnMaChaAccount = { mount: mount, user: user, token: token, login: login, logout: logout, onChange: onChange, api: API };
})(window);
