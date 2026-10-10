/*! AnMaCha Cloud-Speicher – optionales Sync-Skript für alle Spiele.
 * Einbinden:  <script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake,anmachaMemory" defer></script>
 * data-game   = Spielname (eigener Speicherplatz pro Spiel)
 * data-prefix = kommagetrennte localStorage-Schlüsselanfänge, die synchronisiert werden
 * data-ui="off" blendet den Cloud-Knopf aus.
 * Anmeldung per Google (Firebase Auth), Spielstand pro Nutzer. Ohne Eintragungen in CONFIG tut das Skript nichts (Spiele laufen weiter nur mit localStorage). */
(function () {
  'use strict';
  // <- aus der Firebase-Konsole eintragen (siehe cloud/README.md); authDomain leer = <projectId>.firebaseapp.com
  var CONFIG = { projectId: 'ricorewi-games-save', apiKey: 'AIzaSyB-4IuC85PsOrvsY0GkBGsCIXdW_i1SrnM', authDomain: 'ricorewi-games-save.firebaseapp.com' };
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

  var s = document.currentScript;
  if (!s || !CONFIG.projectId || !window.fetch || !window.Promise) return;
  var game = (s.dataset.game || 'spiel').replace(/[^\w-]/g, '').slice(0, 40);
  var prefixes = (s.dataset.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  if (!prefixes.length) return;

  var LS = window.localStorage, P = Storage.prototype;
  var rawSet = P.setItem, rawRemove = P.removeItem;
  var ON_KEY = 'anmacha-cloud-on', META_KEY = 'anmacha-cloud-meta:' + game, RL = 'anmacha-cloud-rl';
  var meta = {}, timer = 0, busy = false, again = false, first = true, lastErr = '';
  try { meta = JSON.parse(LS.getItem(META_KEY)) || {}; } catch (e) {}

  function match(k) { return prefixes.some(function (p) { return k.indexOf(p) === 0; }); }
  function saveMeta() { try { rawSet.call(LS, META_KEY, JSON.stringify(meta)); } catch (e) {} }
  var auth = null, user = null, fb = null, sdkP = null;
  function wanted() { try { return LS.getItem(ON_KEY) === '1'; } catch (e) { return false; } }
  function loadSdk() {
    return sdkP || (sdkP = Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js')]).then(function (m) {
      fb = m[1];
      auth = fb.getAuth(m[0].initializeApp({ apiKey: CONFIG.apiKey, authDomain: CONFIG.authDomain || CONFIG.projectId + '.firebaseapp.com', projectId: CONFIG.projectId }));
      return new Promise(function (res) {
        var off = fb.onAuthStateChanged(auth, function (u) { user = u; off(); res(u); render(); });
      });
    }));
  }
  function signIn() {
    return loadSdk().then(function () { return fb.signInWithPopup(auth, new fb.GoogleAuthProvider()); }).then(function (r) {
      user = r.user; rawSet.call(LS, ON_KEY, '1'); first = true; return sync();
    }).catch(function (e) { lastErr = e.code === 'auth/popup-closed-by-user' ? '' : (e.message || 'Anmeldung fehlgeschlagen'); render(); });
  }
  function signOut() {
    rawRemove.call(LS, ON_KEY);
    return (auth ? fb.signOut(auth) : Promise.resolve()).then(function () { user = null; render(); });
  }

  // Zeitstempel pro Schlüssel mitführen
  P.setItem = function (k, v) {
    rawSet.call(this, k, v);
    if (this === LS && match(k)) { meta[k] = Date.now(); saveMeta(); queue(); }
  };
  P.removeItem = function (k) {
    rawRemove.call(this, k);
    if (this === LS && match(k)) { meta[k] = Date.now(); saveMeta(); queue(); }
  };

  function localState() {
    var o = {}, i, k;
    for (i = 0; i < LS.length; i++) {
      k = LS.key(i);
      if (match(k)) o[k] = { v: LS.getItem(k), t: meta[k] || 1 };
    }
    for (k in meta) if (match(k) && !(k in o)) o[k] = { v: null, t: meta[k] }; // gelöscht
    return o;
  }

  function url() {
    return 'https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId + '/databases/(default)/documents/users/' + user.uid + '/saves/' + game;
  }
  function pull(tok) {
    return fetch(url(), { headers: { Authorization: 'Bearer ' + tok } }).then(function (r) {
      if (r.status === 404) return {};
      if (!r.ok) throw new Error('Laden ' + r.status);
      return r.json().then(function (j) { try { return JSON.parse(j.fields.d.stringValue); } catch (e) { return {}; } });
    });
  }
  function push(tok, state, keep) {
    var body = JSON.stringify({ fields: { d: { stringValue: JSON.stringify(state) }, t: { integerValue: String(Date.now()) } } });
    return fetch(url() + '?updateMask.fieldPaths=d&updateMask.fieldPaths=t', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: body, keepalive: !!keep && body.length < 60000
    }).then(function (r) { if (!r.ok) throw new Error('Speichern ' + r.status); });
  }

  function sync(keep) {
    if (!wanted()) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true;
    return loadSdk().then(function () {
      if (!user) throw new Error('Bitte neu anmelden');
      return user.getIdToken();
    }).then(function (tok) {
      return pull(tok).then(function (remote) {
        var local = localState(), merged = {}, changed = false, dirty = false, k;
        for (k in remote) merged[k] = remote[k];
        for (k in local) {
          if (!remote[k] || local[k].t > remote[k].t) { merged[k] = local[k]; if (!remote[k] || remote[k].v !== local[k].v) dirty = true; }
        }
        for (k in merged) {
          if (merged[k] !== local[k] && (!local[k] || merged[k].t > local[k].t) && (!local[k] || merged[k].v !== local[k].v)) {
            if (merged[k].v === null) rawRemove.call(LS, k); else rawSet.call(LS, k, merged[k].v);
            meta[k] = merged[k].t; changed = true;
          }
        }
        saveMeta();
        lastErr = '';
        var p = dirty ? push(tok, merged, keep) : Promise.resolve();
        return p.then(function () {
          if (changed && first && !sessionStorage.getItem(RL)) { sessionStorage.setItem(RL, '1'); location.reload(); }
        });
      });
    }).catch(function (e) { lastErr = e.message || 'Fehler'; render(); })
      .then(function () {
        busy = false; first = false; try { sessionStorage.removeItem(RL); } catch (e) {} render();
        if (again) { again = false; queue(); }
      });
  }
  function queue() { clearTimeout(timer); timer = setTimeout(sync, 3000); }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sync(true); else sync();
  });
  window.addEventListener('pagehide', function () { sync(true); });

  // ---- kleine Oberfläche ----
  var btn, panel;
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt) e.textContent = txt; return e; }
  function render() {
    if (!panel || s.dataset.ui === 'off') return;
    var on = wanted() && user;
    panel.textContent = '';
    var bs = 'margin:8px 4px 0 0;padding:8px 12px;border:0;border-radius:8px;background:#3a7bd5;color:#fff;font:inherit;cursor:pointer';
    panel.appendChild(el('b', '', '☁ Cloud-Speicher'));
    if (on) {
      panel.appendChild(el('div', 'margin:8px 0 2px', '✓ Angemeldet als ' + (user.displayName || user.email || 'Spieler')));
      panel.appendChild(el('div', 'opacity:.8', lastErr ? '⚠ ' + lastErr : 'Dein Fortschritt wird auf jedem Gerät geladen, auf dem du dich anmeldest.'));
      var b2 = el('button', bs.replace('#3a7bd5', '#666'), 'Abmelden');
      b2.onclick = signOut; panel.appendChild(b2);
    } else {
      panel.appendChild(el('div', 'margin:8px 0;opacity:.8', lastErr ? '⚠ ' + lastErr : 'Melde dich an und spiele auf jedem Gerät mit deinem Fortschritt weiter.'));
      var b0 = el('button', bs, 'Mit Google anmelden');
      b0.onclick = signIn; panel.appendChild(b0);
    }
  }
  function ui() {
    if (s.dataset.ui === 'off') return;
    btn = el('button', 'position:fixed;left:8px;bottom:8px;z-index:2147483000;width:34px;height:34px;border:0;border-radius:50%;background:rgba(20,20,30,.6);color:#fff;font-size:17px;cursor:pointer;opacity:.55', '☁');
    btn.setAttribute('aria-label', 'Cloud-Speicher');
    panel = el('div', 'position:fixed;left:8px;bottom:48px;z-index:2147483000;max-width:min(300px,calc(100vw - 16px));padding:12px;border-radius:12px;background:rgba(20,20,30,.95);color:#fff;font:14px/1.4 system-ui,sans-serif;display:none');
    btn.onclick = function () { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
    document.body.appendChild(panel); document.body.appendChild(btn); render();
  }
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);
  if (wanted()) sync();
  window.AnMaChaCloud = { sync: sync };
})();
