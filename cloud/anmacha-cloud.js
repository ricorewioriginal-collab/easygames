/*! AnMaCha Cloud-Speicher – optionales Sync-Skript für alle Spiele.
 * Einbinden:  <script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake,anmachaMemory" defer></script>
 * data-game   = Spielname (eigener Speicherplatz pro Spiel)
 * data-prefix = kommagetrennte localStorage-Schlüsselanfänge, die synchronisiert werden
 * data-idb / data-idb-files = optional für Godot-Exporte: IndexedDB-Pfad (z.B. /userfs) und Dateinamen-Anfang der Speicherdateien
 * data-save-btn = CSS-Selektor(en) der spieleigenen Speichern-Knöpfe: daneben erscheint „Mit Google speichern“ samt Hinweis, dass sonst nur lokal gespeichert wird
 * data-mount  = CSS-Selektor: Anmelde-Bereich dort einbetten statt schwebendem Knopf; data-hint = Einleitungstext dazu
 * data-ui="off" blendet den Cloud-Knopf aus.
 * Anmeldung per Google (Firebase Auth), Spielstand pro Nutzer (gzip ab 20 KB). Ohne Eintragungen in CONFIG tut das Skript nichts (Spiele laufen weiter nur mit localStorage). */
(function () {
  'use strict';
  // <- aus der Firebase-Konsole eintragen (siehe cloud/README.md); authDomain leer = <projectId>.firebaseapp.com
  var CONFIG = { projectId: 'ricorewi-games-save', apiKey: 'AIzaSyB-4IuC85PsOrvsY0GkBGsCIXdW_i1SrnM', authDomain: 'ricorewi-games-save.firebaseapp.com' };
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

  var s = document.currentScript;
  if (!s || !CONFIG.projectId || !window.fetch || !window.Promise) return;
  var game = (s.dataset.game || 'spiel').replace(/[^\w-]/g, '').slice(0, 40);
  var prefixes = (s.dataset.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  var idbPath = s.dataset.idb || '', idbFiles = (s.dataset.idbFiles || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  if (!prefixes.length && !(idbPath && idbFiles.length)) return;

  var LS = window.localStorage, P = Storage.prototype;
  var rawSet = P.setItem, rawRemove = P.removeItem;
  var ON_KEY = 'anmacha-cloud-on', META_KEY = 'anmacha-cloud-meta:' + game, RL = 'anmacha-cloud-rl';
  var meta = {}, timer = 0, busy = false, again = false, first = true, lastErr = '';
  try { meta = JSON.parse(LS.getItem(META_KEY)) || {}; } catch (e) {}

  function match(k) { return prefixes.some(function (p) { return k.indexOf(p) === 0; }); }

  // Kompression (gzip, nativ) für größere Spielstände
  function b64(u) { var t = '', i; for (i = 0; i < u.length; i += 8192) t += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(t); }
  function unb64(t) { var a = atob(t), u = new Uint8Array(a.length), i; for (i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u; }
  function gz(text) {
    if (text.length < 20000 || !window.CompressionStream) return Promise.resolve(text);
    var cs = new CompressionStream('gzip'), w = cs.writable.getWriter();
    w.write(new TextEncoder().encode(text)); w.close();
    return new Response(cs.readable).arrayBuffer().then(function (b) { return 'z:' + b64(new Uint8Array(b)); });
  }
  function ungz(t) {
    if (t.slice(0, 2) !== 'z:') return Promise.resolve(t);
    var ds = new DecompressionStream('gzip'), w = ds.writable.getWriter();
    w.write(unb64(t.slice(2))); w.close();
    return new Response(ds.readable).text();
  }

  // IndexedDB (Emscripten/Godot IDBFS): Dateien /userfs/<name> als Einträge "idb:<pfad>"
  function idbOpen() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(idbPath, 21);
      r.onupgradeneeded = function () {
        var db = r.result;
        if (!db.objectStoreNames.contains('FILE_DATA')) db.createObjectStore('FILE_DATA').createIndex('timestamp', 'timestamp', { unique: false });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbMatch(k) { return idbFiles.some(function (p) { return k.indexOf(idbPath + '/' + p) === 0; }); }
  function idbRead() {
    if (!idbPath || !idbFiles.length || !window.indexedDB) return Promise.resolve({});
    return idbOpen().then(function (db) {
      return new Promise(function (res) {
        var o = {}, c = db.transaction('FILE_DATA', 'readonly').objectStore('FILE_DATA').openCursor();
        c.onsuccess = function () {
          var cur = c.result;
          if (!cur) { db.close(); return res(o); }
          var v = cur.value;
          if (typeof cur.key === 'string' && idbMatch(cur.key) && v && v.contents) o['idb:' + cur.key] = { v: b64(new Uint8Array(v.contents)), t: +new Date(v.timestamp) || 1 };
          cur.continue();
        };
        c.onerror = function () { db.close(); res(o); };
      });
    }).catch(function () { return {}; });
  }
  function idbWrite(key, item) {
    return idbOpen().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('FILE_DATA', 'readwrite'), st = tx.objectStore('FILE_DATA');
        if (item.v === null) st.delete(key); else st.put({ timestamp: new Date(item.t), mode: 33206, contents: unb64(item.v) }, key);
        tx.oncomplete = function () { db.close(); res(); };
        tx.onerror = function () { db.close(); rej(tx.error); };
      });
    });
  }
  function saveMeta() { try { rawSet.call(LS, META_KEY, JSON.stringify(meta)); } catch (e) {} }
  var auth = null, user = null, fb = null, sdkP = null;
  function wanted() { try { return LS.getItem(ON_KEY) === '1'; } catch (e) { return false; } }
  // ---- App-Modus (Android/Windows-App): Google sperrt die Anmeldung im App-Fenster. Die Anmeldung läuft deshalb im Browser
  // (Link mit Kopplungscode auf ricorewi-radio.de), die App holt sich danach das Aktualisierungs-Token und nutzt es per REST. ----
  var APP = location.hostname === 'appassets.local', RT = 'anmacha-cloud-rt', PAIR = null;
  var PORTAL = 'https://www.ricorewi-radio.de/';
  var FS = 'https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId + '/databases/(default)/documents/';
  function post(u, body, form) {
    return fetch(u, { method: 'POST', headers: { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' }, body: body }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(r.status === 400 ? 'Bitte neu koppeln (Anmeldung abgelaufen)' : 'Fehler ' + r.status);
        return j;
      });
    });
  }
  function appUser(rt) {
    var tok = '', exp = 0, u = { uid: '', displayName: '', email: '', photoURL: '' };
    u.getIdToken = function () {
      if (tok && Date.now() < exp - 60000) return Promise.resolve(tok);
      return post('https://securetoken.googleapis.com/v1/token?key=' + CONFIG.apiKey, 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(rt), true).then(function (j) {
        tok = j.id_token; exp = Date.now() + (+j.expires_in || 3600) * 1000; u.uid = j.user_id;
        if (j.refresh_token && j.refresh_token !== rt) { rt = j.refresh_token; rawSet.call(LS, RT, rt); }
        return tok;
      });
    };
    u.load = function () {
      return u.getIdToken().then(function (t) { return post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CONFIG.apiKey, JSON.stringify({ idToken: t })); }).then(function (j) {
        var p = (j.users || [])[0] || {};
        u.displayName = p.displayName || ''; u.email = p.email || ''; u.photoURL = p.photoUrl || '';
        return u;
      });
    };
    return u;
  }
  function startPair() {
    var a = new Uint8Array(16), id;
    crypto.getRandomValues(a);
    id = Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    PAIR = { id: id, until: Date.now() + 15 * 60000 }; lastErr = ''; render();
    (function poll() {
      if (!PAIR || PAIR.id !== id) return;
      if (Date.now() > PAIR.until) { PAIR = null; lastErr = 'Kopplung abgelaufen, bitte neu starten.'; render(); return; }
      fetch(FS + 'pair/' + id).then(function (r) {
        if (r.status === 404) return null;
        if (r.status === 403) { PAIR = null; lastErr = 'Kopplung ist noch nicht freigeschaltet.'; render(); return null; }
        if (!r.ok) throw new Error('x');
        return r.json();
      }).then(function (j) {
        if (!PAIR || PAIR.id !== id) return;
        if (!j) { setTimeout(poll, 3000); return; }
        var rt = j.fields && j.fields.rt && j.fields.rt.stringValue;
        fetch(FS + 'pair/' + id, { method: 'DELETE' }).catch(function () {});
        if (!rt) throw new Error('x');
        rawSet.call(LS, RT, rt); rawSet.call(LS, ON_KEY, '1'); PAIR = null; user = appUser(rt);
        return user.load().catch(function () {}).then(function () { first = true; render(); return sync(); });
      }).catch(function () { setTimeout(poll, 5000); });
    })();
  }
  // Browserseite: Kopplung bestätigen (Link aus der App, #koppeln=<Code>)
  function pairPage(id) {
    var o = el('div', 'position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box');
    var b = el('div', 'max-width:360px;width:100%;padding:20px;border-radius:14px;background:#14141e;color:#fff;font:15px/1.45 system-ui,sans-serif;text-align:center');
    var msg = el('div', 'margin:0 0 14px', 'Melde dich mit Google an, um deine Spielstände in der App zu nutzen.');
    b.appendChild(el('b', 'display:block;font-size:17px;margin-bottom:8px', 'App koppeln')); b.appendChild(msg);
    var go = el('button', 'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px 12px;border:1px solid #dadce0;border-radius:8px;background:#fff;color:#3c4043;font:500 14px system-ui,sans-serif;cursor:pointer');
    go.innerHTML = G + '<span>Mit Google anmelden</span>';
    var x = el('button', 'margin-top:10px;background:none;border:0;color:#aaa;font:13px system-ui,sans-serif;cursor:pointer', 'Schließen');
    x.onclick = function () { o.remove(); };
    go.onclick = function () {
      go.disabled = true; msg.textContent = 'Einen Moment …';
      loadSdk().then(function (u) { return u ? { user: u } : fb.signInWithPopup(auth, new fb.GoogleAuthProvider()); }).then(function (r) {
        user = r.user; rawSet.call(LS, ON_KEY, '1');
        return user.getIdToken().then(function (tok) {
          return fetch(FS + 'pair/' + id + '?currentDocument.exists=false', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
            body: JSON.stringify({ fields: { rt: { stringValue: user.refreshToken }, t: { integerValue: String(Date.now()) } } })
          });
        });
      }).then(function (r) {
        if (!r.ok) throw new Error('Kopplung fehlgeschlagen (' + r.status + ')');
        go.remove(); msg.textContent = 'Fertig! Du kannst jetzt zur App zurückkehren.';
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      }).catch(function (e) { go.disabled = false; msg.textContent = e.code === 'auth/popup-closed-by-user' ? 'Anmeldung abgebrochen.' : (e.message || 'Anmeldung fehlgeschlagen'); });
    };
    b.appendChild(go); b.appendChild(x); o.appendChild(b); document.body.appendChild(o);
  }
  function loadSdk() {
    if (APP) {
      var r0 = ''; try { r0 = LS.getItem(RT) || ''; } catch (e) {}
      if (!user && r0) { user = appUser(r0); user.load().then(render, render); }
      return Promise.resolve(user);
    }
    return sdkP || (sdkP = Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js')]).then(function (m) {
      fb = m[1];
      auth = fb.getAuth(m[0].initializeApp({ apiKey: CONFIG.apiKey, authDomain: CONFIG.authDomain || CONFIG.projectId + '.firebaseapp.com', projectId: CONFIG.projectId }));
      return new Promise(function (res) {
        var off = fb.onAuthStateChanged(auth, function (u) { user = u; off(); res(u); render(); });
      });
    }));
  }
  function signIn() {
    if (APP) return startPair();
    return loadSdk().then(function () { return fb.signInWithPopup(auth, new fb.GoogleAuthProvider()); }).then(function (r) {
      user = r.user; rawSet.call(LS, ON_KEY, '1'); first = true; return sync();
    }).catch(function (e) { lastErr = e.code === 'auth/popup-closed-by-user' ? '' : (e.message || 'Anmeldung fehlgeschlagen'); render(); });
  }
  function signOut() {
    rawRemove.call(LS, ON_KEY);
    if (APP) { rawRemove.call(LS, RT); PAIR = null; user = null; render(); return Promise.resolve(); }
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
    return idbRead().then(function (x) { for (k in x) o[k] = x[k]; return o; });
  }

  function url() {
    return 'https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId + '/databases/(default)/documents/users/' + user.uid + '/saves/' + game;
  }
  function pull(tok) {
    return fetch(url(), { headers: { Authorization: 'Bearer ' + tok } }).then(function (r) {
      if (r.status === 404) return {};
      if (!r.ok) throw new Error('Laden ' + r.status);
      return r.json().then(function (j) { return ungz(j.fields.d.stringValue).then(JSON.parse).catch(function () { return {}; }); });
    });
  }
  function push(tok, state, keep) {
    return gz(JSON.stringify(state)).then(function (d) {
      if (d.length > 900000) throw new Error('Spielstand zu groß für die Cloud');
      var body = JSON.stringify({ fields: { d: { stringValue: d }, t: { integerValue: String(Date.now()) } } });
      return fetch(url() + '?updateMask.fieldPaths=d&updateMask.fieldPaths=t', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: body, keepalive: !!keep && body.length < 60000
      }).then(function (r) { if (!r.ok) throw new Error('Speichern ' + r.status); });
    });
  }

  function sync(keep) {
    if (!wanted()) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true;
    return loadSdk().then(function () {
      if (!user) throw new Error('Bitte neu anmelden');
      return user.getIdToken();
    }).then(function (tok) {
      return Promise.all([pull(tok), localState()]).then(function (rl) {
        var remote = rl[0], local = rl[1], merged = {}, changed = false, dirty = false, k, writes = [];
        for (k in remote) merged[k] = remote[k];
        for (k in local) {
          if (!remote[k] || local[k].t > remote[k].t) { merged[k] = local[k]; if (!remote[k] || remote[k].v !== local[k].v) dirty = true; }
        }
        for (k in merged) {
          if (merged[k] !== local[k] && (!local[k] || merged[k].t > local[k].t) && (!local[k] || merged[k].v !== local[k].v)) {
            if (k.slice(0, 4) === 'idb:') writes.push(idbWrite(k.slice(4), merged[k]));
            else { if (merged[k].v === null) rawRemove.call(LS, k); else rawSet.call(LS, k, merged[k].v); meta[k] = merged[k].t; }
            changed = true;
          }
        }
        saveMeta();
        lastErr = ''; lastOk = Date.now();
        var p = Promise.all(writes).then(function () { return dirty ? push(tok, merged, keep) : null; });
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
  if (idbPath && idbFiles.length) { // Godot schreibt ohne localStorage: alle 20 s auf geänderte Dateien prüfen
    var seen = null;
    setInterval(function () {
      if (document.visibilityState !== 'visible' || !wanted()) return;
      idbRead().then(function (x) {
        var sig = Object.keys(x).sort().map(function (k) { return k + x[k].t; }).join('|');
        if (seen !== null && sig !== seen) queue();
        seen = sig;
      });
    }, 20000);
  }

  // ---- kleine Oberfläche ----
  var btn, panel, lastOk = 0;
  var G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt) e.textContent = txt; return e; }
  function restore() {
    if (!confirm('Spielstand aus der Cloud wiederherstellen?\nDer Stand auf diesem Gerät wird durch den Cloud-Stand ersetzt.')) return;
    loadSdk().then(function () { return user.getIdToken(); }).then(pull).then(function (remote) {
      var k, n = 0, w = [];
      for (k in remote) {
        if (k.slice(0, 4) === 'idb:') w.push(idbWrite(k.slice(4), remote[k]));
        else { if (remote[k].v === null) rawRemove.call(LS, k); else rawSet.call(LS, k, remote[k].v); meta[k] = remote[k].t; }
        n++;
      }
      if (!n) { lastErr = 'In der Cloud liegt noch kein Spielstand.'; render(); return; }
      saveMeta();
      return Promise.all(w).then(function () { location.reload(); });
    }).catch(function (e) { lastErr = e.message || 'Wiederherstellen fehlgeschlagen'; render(); });
  }
  function openPanel() { if (panel) { panel.style.display = 'block'; render(); } }
  // Spieleigene Speichern-Knöpfe: Google-Knopf und Hinweis daneben, Original bleibt unverändert
  function labels() {
    var on = wanted() && user, i, l = document.querySelectorAll('.anmacha-gbtn-t'), h = document.querySelectorAll('.anmacha-gbtn-h');
    var lt = on ? 'Mit Google verbunden' : 'Mit Google speichern', ht = on ? 'Wird zusätzlich in deinem Google-Konto gesichert.' : 'Ohne Google wird nur lokal auf diesem Gerät gespeichert.';
    for (i = 0; i < l.length; i++) if (l[i].textContent !== lt) l[i].textContent = lt; // nur bei Änderung (sonst Endlosschleife mit dem Observer)
    for (i = 0; i < h.length; i++) if (h[i].textContent !== ht) h[i].textContent = ht;
  }
  function enhance() {
    var sel = s.dataset.saveBtn;
    if (!sel || s.dataset.ui === 'off' || !window.MutationObserver) return;
    function run() {
      var list = document.querySelectorAll(sel), i, t, b, ic, n;
      for (i = 0; i < list.length; i++) {
        t = list[i];
        if (t.dataset.cloudDone) continue;
        t.dataset.cloudDone = '1';
        b = t.cloneNode(false); b.removeAttribute('id'); b.removeAttribute('data-a'); b.removeAttribute('disabled');
        b.type = 'button'; b.textContent = ''; b.classList.add('anmacha-gbtn');
        ic = el('span', 'display:inline-flex;vertical-align:middle;margin-right:6px'); ic.innerHTML = G;
        b.appendChild(ic); b.appendChild(el('span', '', '')).className = 'anmacha-gbtn-t';
        n = el('small', 'display:block;opacity:.75;font-size:12px;margin-top:4px;color:inherit;font-weight:400'); n.className = 'anmacha-gbtn-h';
        t.insertAdjacentElement('afterend', b); b.insertAdjacentElement('afterend', n);
      }
      if (list.length) labels();
    }
    // Klicks per Delegation (überlebt, wenn ein Spiel sein Menü neu aufbaut)
    document.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('.anmacha-gbtn');
      if (g) { e.stopPropagation(); e.preventDefault(); openPanel(); return; }
      if (e.target.closest && e.target.closest(sel)) setTimeout(function () { if (wanted()) sync(); }, 800);
    }, true);
    run(); new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
  function render() {
    labels();
    if (!panel || s.dataset.ui === 'off') return;
    var on = wanted() && user, k;
    panel.textContent = '';
    var bs = 'display:flex;align-items:center;gap:8px;width:100%;margin:8px 0 0;padding:9px 12px;border:1px solid #dadce0;border-radius:8px;background:#fff;color:#3c4043;font:500 14px system-ui,sans-serif;cursor:pointer;box-sizing:border-box';
    function row(label, fn, icon) {
      var b = el('button', bs); if (icon) { var i = el('span', 'display:flex'); i.innerHTML = icon; b.appendChild(i); }
      b.appendChild(el('span', '', label)); b.onclick = fn; panel.appendChild(b); return b;
    }
    if (on) {
      var head = el('div', 'display:flex;align-items:center;gap:10px');
      if (user.photoURL) { var im = el('img', 'width:40px;height:40px;border-radius:50%;flex:none'); im.src = user.photoURL; im.referrerPolicy = 'no-referrer'; im.alt = ''; head.appendChild(im); }
      var who = el('div', 'min-width:0');
      who.appendChild(el('div', 'font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', user.displayName || 'Spieler'));
      who.appendChild(el('div', 'opacity:.7;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', user.email || ''));
      head.appendChild(who); panel.appendChild(head);
      panel.appendChild(el('div', 'margin:8px 0 0;font-size:13px;color:' + (lastErr ? '#f28b82' : '#81c995'),
        lastErr ? '⚠ ' + lastErr : '● Mit Google verbunden' + (lastOk ? ' · zuletzt gesichert ' + new Date(lastOk).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '')));
      row('Jetzt in Google speichern', function () { first = false; sync(); }, G);
      row('Spielstand mit Google wiederherstellen', restore, G);
      row('Abmelden', signOut);
    } else if (PAIR) {
      var lk = PORTAL + '#koppeln=' + PAIR.id;
      panel.appendChild(el('b', '', 'App mit Google koppeln'));
      panel.appendChild(el('div', 'margin:6px 0 0;opacity:.85', 'Öffne diesen Link im Browser (auch auf einem anderen Gerät), melde dich mit Google an und komm hierher zurück. Das Fenster erkennt die Kopplung automatisch.'));
      var a = el('a', 'display:block;margin:8px 0 0;padding:9px 12px;border-radius:8px;background:#4285F4;color:#fff;text-align:center;text-decoration:none;font:500 14px system-ui,sans-serif', 'Link im Browser öffnen');
      a.href = lk; a.target = '_blank'; a.rel = 'noopener'; panel.appendChild(a);
      row('Link kopieren', function () { try { navigator.clipboard.writeText(lk); } catch (e) {} });
      row('Abbrechen', function () { PAIR = null; render(); });
    } else {
      panel.appendChild(el('b', '', 'Spielstand sichern'));
      panel.appendChild(el('div', 'margin:6px 0 0;opacity:.8', lastErr ? '⚠ ' + lastErr : (s.dataset.hint || 'Speichere deinen Fortschritt mit Google und spiele auf jedem Gerät weiter.')));
      row('Mit Google speichern', signIn, G);
      row('Spielstand mit Google wiederherstellen', signIn, G);
    }
    if (btn) {
      btn.textContent = '';
      if (on && user.photoURL) { var av = el('img', 'width:100%;height:100%;border-radius:50%;display:block'); av.src = user.photoURL; av.referrerPolicy = 'no-referrer'; av.alt = ''; btn.appendChild(av); }
      else btn.innerHTML = G;
      btn.style.borderColor = on ? '#34A853' : '#dadce0';
    }
  }
  function ui() {
    if (s.dataset.ui === 'off') return;
    var mt = s.dataset.mount && document.querySelector(s.dataset.mount);
    if (mt) {
      panel = el('div', 'margin:10px 0 0;padding:12px;border-radius:12px;background:rgba(127,127,127,.14);color:inherit;font:14px/1.4 system-ui,sans-serif;box-sizing:border-box');
      mt.appendChild(panel); render(); return;
    }
    btn = el('button', 'position:fixed;left:8px;bottom:8px;z-index:2147483000;width:40px;height:40px;padding:0;border:2px solid #dadce0;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;opacity:.85;box-shadow:0 1px 4px rgba(0,0,0,.4)');
    btn.setAttribute('aria-label', 'Mit Google speichern');
    panel = el('div', 'position:fixed;left:8px;bottom:56px;z-index:2147483000;width:min(290px,calc(100vw - 16px));padding:14px;border-radius:12px;background:rgba(20,20,30,.96);color:#fff;font:14px/1.4 system-ui,sans-serif;display:none;box-sizing:border-box');
    btn.onclick = function () { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
    document.body.appendChild(panel); document.body.appendChild(btn); render();
  }
  function boot() {
    ui(); enhance();
    var pm = !APP && /[#&]koppeln=([0-9a-f]{32})\b/.exec(location.hash);
    if (pm) pairPage(pm[1]);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
  if (wanted()) sync();
  window.AnMaChaCloud = { sync: sync };
})();
