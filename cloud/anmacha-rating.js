/*! AnMaCha Bewertungen – Sterne für Spiele, Sender und RicoReWi Radio / AnMaCha, zentral gespeichert (RicoReWi-Radio-Server), ohne Firebase.
 *  Anmeldung nur zur Verifizierung per „Sign in with Google“; der Server prüft das Token selbst und gibt ein eigenes Zugriffs-Token zurück (hier im localStorage).
 *  Einbinden:  <script src="../cloud/anmacha-rating.js" defer></script>, dann
 *    AnMaChaRating.mount(element, { subject: 'game:anmacha-quiz', title: 'Quiz' })      // Sterne-Anzeige mit Bewertungsfunktion
 *    AnMaChaRating.top({ kind: 'game', limit: 4 }).then(function (items) { … })        // Rangliste (kind: game | station | radio | leer = alle)
 *  Gegenstände: radio:ricorewi, radio:anmacha, station:<kennung>, game:<ordnername>.  Ereignis „amr-change“ (document) nach jeder Bewertung.
 *  Quelle: easygames/cloud/anmacha-rating.js (Spiegel im Radio-Portal: assets/js/anmacha-rating.js). Tests: ricorewi-radio scripts/test-ratings.php */
(function (root) {
  'use strict';
  if (root.AnMaChaRating) return;
  var doc = root.document, LS = null;
  try { LS = root.localStorage; } catch (e) { LS = null; }
  var HOST = (root.location && root.location.hostname) || '';
  var API = /(^|\.)ricorewi-radio\.de$/.test(HOST) ? '/cms/api.php' : 'https://www.ricorewi-radio.de/cms/api.php';
  var TOK = 'anmacha-rating-token', USR = 'anmacha-rating-user';
  var cfg = null, cfgP = null, gsiP = null, cache = {}, mounts = [];

  function store(k, v) { try { if (v === undefined) return LS ? LS.getItem(k) : null; if (v === null) LS && LS.removeItem(k); else LS && LS.setItem(k, v); } catch (e) { } return null; }
  function token() { return store(TOK) || ''; }
  function me() { try { return JSON.parse(store(USR) || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(n) { return String(n).replace('.', ','); }

  function call(action, opt) {
    opt = opt || {};
    var h = { Accept: 'application/json' }, t = token();
    if (t) h.Authorization = 'Bearer ' + t;
    var o = { method: opt.body ? 'POST' : 'GET', headers: h, cache: 'no-store' };
    if (opt.body) { h['Content-Type'] = 'application/json'; o.body = JSON.stringify(opt.body); }
    return root.fetch(API + '?action=' + action + (opt.q ? '&' + opt.q : ''), o).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; });
    });
  }
  // Einstellungen (an/aus, Client-ID, Anmeldung gültig?) einmal laden
  function settings() {
    return cfgP || (cfgP = call('ratings_settings').then(function (j) {
      cfg = { enabled: !!j.enabled, clientId: j.google_client_id || '', user: j.user || null };
      if (j.user) store(USR, JSON.stringify(j.user)); else if (token() && j._status === 200) { /* Token abgelaufen oder ungültig */ }
      return cfg;
    }).catch(function () { cfg = { enabled: false, clientId: '', user: null }; return cfg; }));
  }

  // ---- Google-Anmeldung (nur auf Klick, Skript von Google wird erst dann geladen) ----
  function consentOk() { var c = root.RRWConsent; return !(c && c.has) || c.has('external'); }
  function loadGsi() {
    if (root.google && root.google.accounts && root.google.accounts.id) return Promise.resolve();
    return gsiP || (gsiP = new Promise(function (res, rej) {
      var s = doc.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { gsiP = null; rej(new Error('Google konnte nicht geladen werden.')); };
      doc.head.appendChild(s);
    }));
  }
  function login(host, msg) {
    return settings().then(function (c) {
      if (!c.enabled || !c.clientId) throw new Error('Bewertungen sind gerade nicht verfügbar.');
      if (!consentOk()) {
        host.innerHTML = '<div class="amr-note">' + esc(msg || 'Zum Bewerten kurz mit Google bestätigen.') + '</div><button type="button" class="amr-btn" data-amr="consent">Externe Inhalte erlauben</button><div class="amr-hint">Dafür muss das Google-Anmeldeskript erlaubt sein.</div>';
        return new Promise(function () { });
      }
      host.innerHTML = '<div class="amr-note">' + esc(msg || 'Zum Bewerten kurz mit Google bestätigen.') + '</div><div class="amr-gsi"></div><div class="amr-hint">Nur zur Verifizierung – kein Passwort. Wir speichern deine Google-Kennung, deinen Namen und deine E-Mail-Adresse; öffentlich sichtbar ist nur der Durchschnitt.</div>';
      return loadGsi().then(function () {
        return new Promise(function (res, rej) {
          root.google.accounts.id.initialize({
            client_id: c.clientId, ux_mode: 'popup',
            callback: function (r) {
              call('ratings_login', { body: { credential: r && r.credential || '' } }).then(function (j) {
                if (j.status !== 'ok') { rej(new Error(j.message || 'Anmeldung fehlgeschlagen')); return; }
                store(TOK, j.token); store(USR, JSON.stringify(j.user)); cfg.user = j.user; res(j.user);
              }, rej);
            }
          });
          root.google.accounts.id.renderButton(host.querySelector('.amr-gsi'), { theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'pill', locale: 'de' });
        });
      });
    });
  }
  function logout() {
    if (root.AnMaChaAccount && root.AnMaChaAccount.token() && !logout.busy) { logout.busy = true; try { return root.AnMaChaAccount.logout(); } finally { logout.busy = false; } }   // ein Konto: Spielstände, Kopf-Knopf und Bewertungen melden zusammen ab
    var t = token(); store(TOK, null); store(USR, null); if (cfg) cfg.user = null;
    try { root.google && root.google.accounts && root.google.accounts.id.disableAutoSelect(); } catch (e) { }
    if (t) call('ratings_logout').catch(function () { });
    mounts.forEach(function (m) { m.mine = 0; draw(m); });
  }

  // ---- Daten ----
  function get(subjects) {
    return call('ratings_get', { q: 'subjects=' + encodeURIComponent(subjects.join(',')) }).then(function (j) {
      if (j.status !== 'ok') return { enabled: false, items: {}, mine: {} };
      return j;
    }).catch(function () { return { enabled: false, items: {}, mine: {} }; });
  }
  function set(subject, stars) {
    return call('ratings_set', { body: { subject: subject, stars: stars } });
  }
  function top(o) {
    o = o || {};
    var q = 'limit=' + (o.limit || 4) + (o.kind ? '&kind=' + encodeURIComponent(o.kind) : '') + (o.days ? '&days=' + (+o.days) : '');
    return call('ratings_top', { q: q }).then(function (j) { return j.status === 'ok' && j.enabled ? (j.items || []) : []; }).catch(function () { return []; });
  }

  // ---- Oberfläche ----
  var CSS = '.amr{display:inline-flex;flex-direction:column;gap:6px;font:inherit;color:inherit;max-width:100%}.amr[hidden],.amr-login[hidden],.amr-msg[hidden]{display:none}'
    + '.amr-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.amr-stars{display:inline-flex;gap:2px}'
    + '.amr-s{appearance:none;border:0;background:none;padding:2px;margin:0;cursor:pointer;font-size:1.35em;line-height:1;color:rgba(128,128,150,.55);transition:transform .12s,color .12s}'
    + '.amr-s.on{color:#fbbf24}.amr-s.mine{color:#f59e0b}.amr-s:hover{transform:scale(1.18)}.amr-s:focus-visible{outline:2px solid #67e8f9;outline-offset:2px;border-radius:4px}'
    + '.amr-ro .amr-s{cursor:default}.amr-ro .amr-s:hover{transform:none}'
    + '.amr-sum{font-size:.82em;opacity:.85;white-space:nowrap}.amr-sum b{font-weight:800}'
    + '.amr-mine{font-size:.78em;opacity:.8}.amr-msg{font-size:.78em;color:#fca5a5}.amr-msg.ok{color:#86efac}'
    + '.amr-login{margin-top:2px;padding:10px 12px;border-radius:12px;border:1px solid rgba(128,128,150,.35);background:rgba(128,128,150,.12);display:grid;gap:8px}'
    + '.amr-note{font-weight:700;font-size:.88em}.amr-hint{font-size:.72em;opacity:.75;line-height:1.4}.amr-gsi{min-height:44px;display:flex;align-items:center}'
    + '.amr-btn{appearance:none;border:1px solid rgba(128,128,150,.5);background:rgba(128,128,150,.18);color:inherit;border-radius:999px;padding:8px 14px;font:inherit;font-size:.85em;font-weight:700;cursor:pointer}'
    + '.amr-link{appearance:none;border:0;background:none;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;font:inherit;font-size:.78em;padding:0}';
  function css() { if (doc.getElementById('amr-css')) return; var s = doc.createElement('style'); s.id = 'amr-css'; s.textContent = CSS; (doc.head || doc.documentElement).appendChild(s); }

  function stars(avg, mine, ro) {
    var h = '', i, on;
    for (i = 1; i <= 5; i++) {
      on = mine ? i <= mine : i <= Math.round(avg || 0);
      h += '<button type="button" class="amr-s' + (on ? ' on' : '') + (on && mine ? ' mine' : '') + '" data-star="' + i + '" aria-label="' + i + (i === 1 ? ' Stern' : ' Sterne') + '"' + (ro ? ' tabindex="-1"' : '') + '>★</button>';
    }
    return h;
  }
  function draw(m) {
    var a = m.agg || { count: 0, avg: 0 }, u = token() ? ((cfg && cfg.user) || me()) : null;
    m.el.hidden = !(cfg && cfg.enabled);
    if (m.el.hidden) return;
    m.el.className = 'amr' + (m.compact ? ' amr-compact' : '');
    var sum = a.count ? '<span class="amr-sum"><b>' + num(a.avg) + '</b> von 5 · ' + a.count + (a.count === 1 ? ' Bewertung' : ' Bewertungen') + '</span>' : '<span class="amr-sum">Noch keine Bewertung</span>';
    m.el.innerHTML = '<div class="amr-row"><span class="amr-stars" role="group" aria-label="' + esc(m.title ? 'Bewertung: ' + m.title : 'Bewertung') + '">' + stars(a.avg, m.mine) + '</span>' + sum + '</div>'
      + (m.mine ? '<div class="amr-mine">Deine Bewertung: ' + m.mine + ' ★ · <button type="button" class="amr-link" data-amr="out">Abmelden' + (u && u.name ? ' (' + esc(u.name) + ')' : '') + '</button></div>' : '')
      + '<div class="amr-msg" role="status" hidden></div><div class="amr-login" hidden></div>';
  }
  function say(m, text, ok) { var e = m.el.querySelector('.amr-msg'); if (!e) return; e.hidden = !text; e.textContent = text || ''; e.className = 'amr-msg' + (ok ? ' ok' : ''); }
  function rate(m, n) {
    var box = m.el.querySelector('.amr-login');
    var go = function () {
      return set(m.subject, n).then(function (j) {
        if (j.status === 401) { store(TOK, null); store(USR, null); if (cfg) cfg.user = null; return ask(m, n); }
        if (j.status !== 'ok') { say(m, j.message || 'Bewertung nicht möglich'); return; }
        m.mine = n; m.agg = { count: j.count, avg: j.avg }; cache[m.subject] = m.agg; draw(m); say(m, 'Danke für deine Bewertung!', true);
        try { doc.dispatchEvent(new CustomEvent('amr-change', { detail: { subject: m.subject, stars: n, count: j.count, avg: j.avg } })); } catch (e) { }
        mounts.forEach(function (x) { if (x !== m && x.subject === m.subject) { x.agg = m.agg; x.mine = n; draw(x); } });
      });
    };
    if (!token()) return ask(m, n);
    return go().catch(function () { say(m, 'Bewertung nicht möglich. Bitte später erneut versuchen.'); });
    function ask(mm, nn) {
      var b = mm.el.querySelector('.amr-login'); b.hidden = false;
      return login(b, 'Zum Bewerten kurz mit Google bestätigen.').then(function () { b.hidden = true; return rate(mm, nn); }).catch(function (e) { say(mm, e.message || 'Anmeldung fehlgeschlagen'); });
    }
  }
  function mount(el, o) {
    if (!el || !o || !o.subject) return null;
    css();
    var m = el.__amr, fresh = !m;
    if (fresh) { m = el.__amr = { el: el }; mounts.push(m); }
    m.subject = o.subject; m.title = o.title || ''; m.compact = !!o.compact; m.agg = cache[o.subject] || null; m.mine = 0;
    if (fresh) el.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-star],[data-amr]'); if (!b) return;
      if (b.dataset.star) rate(m, +b.dataset.star);
      else if (b.dataset.amr === 'out') logout();
      else if (b.dataset.amr === 'consent' && root.RRWConsent) root.RRWConsent.open();
    });
    var tk0 = token();   // Antwort auf eine ältere Anfrage darf ein inzwischen neu ausgestelltes Konto nicht löschen
    settings().then(function (c) {
      if (!c.enabled) { el.hidden = true; return; }
      return get([o.subject]).then(function (j) {
        m.agg = (j.items || {})[o.subject] || { count: 0, avg: 0 }; m.mine = ((j.mine || {})[o.subject]) || 0;
        if (j.user) { cfg.user = j.user; store(USR, JSON.stringify(j.user)); }
        else if (token() && token() === tk0) { store(TOK, null); store(USR, null); cfg.user = null; m.mine = 0; }   // Token abgelaufen oder Konto gesperrt
        cache[o.subject] = m.agg; draw(m);
      });
    });
    return m;
  }
  function refresh() { cfgP = null; cache = {}; mounts.slice().forEach(function (m) { mount(m.el, { subject: m.subject, title: m.title, compact: m.compact }); }); }   // nach Login/Logout durch anmacha-account.js
  root.AnMaChaRating = { refresh: refresh, mount: mount, top: top, get: get, set: set, settings: settings, logout: logout, user: function () { return token() ? me() : null; }, api: API };
})(typeof window !== 'undefined' ? window : this);
