/*! AnMaCha Cloud-Speicher – optionales Sync-Skript für alle Spiele.
 * Einbinden:  <script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake,anmachaMemory" defer></script>
 * data-game   = Spielname (eigener Speicherplatz pro Spiel)
 * data-prefix = kommagetrennte localStorage-Schlüsselanfänge, die synchronisiert werden
 * data-ui="off" blendet den Cloud-Knopf aus.
 * Ohne Eintragungen in CONFIG tut das Skript nichts (Spiele laufen weiter nur mit localStorage). */
(function () {
  'use strict';
  var CONFIG = { projectId: '', apiKey: '' }; // <- aus der Firebase-Konsole eintragen (siehe cloud/README.md)

  var s = document.currentScript;
  if (!s || !CONFIG.projectId || !window.crypto || !crypto.subtle || !window.fetch) return;
  var game = (s.dataset.game || 'spiel').replace(/[^\w-]/g, '').slice(0, 40);
  var prefixes = (s.dataset.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  if (!prefixes.length) return;

  var LS = window.localStorage, P = Storage.prototype;
  var rawSet = P.setItem, rawRemove = P.removeItem;
  var CODE_KEY = 'anmacha-cloud-code', META_KEY = 'anmacha-cloud-meta:' + game, RL = 'anmacha-cloud-rl';
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var meta = {}, timer = 0, busy = false, again = false, first = true, lastErr = '';
  try { meta = JSON.parse(LS.getItem(META_KEY)) || {}; } catch (e) {}

  function match(k) { return prefixes.some(function (p) { return k.indexOf(p) === 0; }); }
  function saveMeta() { try { rawSet.call(LS, META_KEY, JSON.stringify(meta)); } catch (e) {} }
  function getCode() { try { return LS.getItem(CODE_KEY) || ''; } catch (e) { return ''; } }
  function normCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z2-9]/g, '').replace(/[IO]/g, ''); }
  function newCode() {
    var b = crypto.getRandomValues(new Uint8Array(12)), c = '';
    for (var i = 0; i < 12; i++) c += ALPHA[b[i] & 31];
    return c;
  }
  function fmt(c) { return c.replace(/(.{4})(?=.)/g, '$1-'); }

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

  function docId(code) {
    var data = new TextEncoder().encode('anmacha:' + game + ':' + code);
    return crypto.subtle.digest('SHA-256', data).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function url(id) {
    return 'https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId + '/databases/(default)/documents/saves/' + id +
      '?key=' + CONFIG.apiKey;
  }
  function pull(id) {
    return fetch(url(id)).then(function (r) {
      if (r.status === 404) return {};
      if (!r.ok) throw new Error('Laden ' + r.status);
      return r.json().then(function (j) { try { return JSON.parse(j.fields.d.stringValue); } catch (e) { return {}; } });
    });
  }
  function push(id, state, keep) {
    var body = JSON.stringify({ fields: { d: { stringValue: JSON.stringify(state) }, t: { integerValue: String(Date.now()) } } });
    return fetch(url(id) + '&updateMask.fieldPaths=d&updateMask.fieldPaths=t', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: !!keep && body.length < 60000
    }).then(function (r) { if (!r.ok) throw new Error('Speichern ' + r.status); });
  }

  function sync(keep) {
    var code = getCode();
    if (!code) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true;
    return docId(code).then(function (id) {
      return pull(id).then(function (remote) {
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
        var p = dirty ? push(id, merged, keep) : Promise.resolve();
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
    var code = getCode();
    panel.textContent = '';
    var bs = 'margin:4px 4px 0 0;padding:7px 10px;border:0;border-radius:8px;background:#3a7bd5;color:#fff;font:inherit;cursor:pointer';
    panel.appendChild(el('b', '', '☁ Cloud-Speicher'));
    if (code) {
      panel.appendChild(el('div', 'margin:8px 0 2px;opacity:.8', 'Dein Code (geheim halten):'));
      panel.appendChild(el('div', 'font:700 18px monospace;letter-spacing:1px;user-select:all', fmt(code)));
      panel.appendChild(el('div', 'margin:6px 0;opacity:.8', lastErr ? '⚠ ' + lastErr : '✓ Fortschritt wird gesichert. Auf anderen Geräten: „Mit Code verbinden“.'));
    } else {
      panel.appendChild(el('div', 'margin:8px 0;opacity:.8', 'Sichere deinen Fortschritt und spiele auf jedem Gerät weiter. Kein Konto nötig.'));
      var b0 = el('button', bs, 'Speicher erstellen');
      b0.onclick = function () { rawSet.call(LS, CODE_KEY, newCode()); sync(); render(); };
      panel.appendChild(b0);
    }
    var b1 = el('button', bs, 'Mit Code verbinden');
    b1.onclick = function () {
      var c = normCode(prompt('Code eingeben (z.B. ABCD-EFGH-JKLM):'));
      if (c.length !== 12) { if (c) alert('Der Code muss 12 Zeichen haben.'); return; }
      rawSet.call(LS, CODE_KEY, c); first = true; sync(); render();
    };
    panel.appendChild(b1);
    if (code) {
      var b2 = el('button', bs.replace('#3a7bd5', '#666'), 'Trennen');
      b2.onclick = function () { if (confirm('Dieses Gerät vom Cloud-Speicher trennen? Lokale Daten bleiben erhalten.')) { rawRemove.call(LS, CODE_KEY); render(); } };
      panel.appendChild(b2);
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
  sync();
  window.AnMaChaCloud = { sync: sync, code: getCode };
})();
