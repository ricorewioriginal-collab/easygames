/*! AnMaCha Ranglisten – öffentliche Bestenlisten je Spiel (Firebase Firestore, nur mit Freigabe des Spielers).
 * Wird von cloud/anmacha-cloud.js automatisch nachgeladen (data-board="off" schaltet es ab). Ohne Eintrag in REG für das Spiel tut es nichts.
 * Freigabe: Der Spieler meldet sich mit Google an (☁), wählt einen Spitzname und gibt seine Bestwerte frei. Öffentlich sind NUR Spitzname,
 * Bestwert und Zeitpunkt – keine Google-Daten. Die Freigabe lässt sich jederzeit beenden; dabei werden alle eigenen Einträge gelöscht.
 * Daten: boards/<spiel>[__<modus>]/e/<uid> = { n: Spitzname, s: Wert, o: 'desc'|'asc', t: ms } (Regeln: cloud/firestore.rules).
 * Hinweis: Werte kommen vom Gerät des Spielers und sind nicht manipulationssicher (Spaß-Ranglisten). */
(function () {
  'use strict';
  var Cloud = window.AnMaChaCloud;
  var LS = null;
  try { LS = window.localStorage; } catch (e) {}
  var NS = '/' + 'anmacha-board';

  // ---- Registry: je Spiel die Ranglisten. key = localStorage-Schlüssel, path = Pfad im JSON-Wert ('' = Zahl direkt),
  // order 'desc' = höher ist besser, 'asc' = niedriger ist besser (Zeiten), fmt: 'int' | 'sec' (Sekunden) | 'ms' (Millisekunden)
  var REG = {
    /*REG*/
  };

  function cfgFor(game) { return REG[game] || null; }

  // ---- reine Hilfsfunktionen (getestet in tools/test-board.mjs) ----
  function readValue(raw, path) {
    var v = raw;
    if (v == null) return null;
    if (path) {
      try { v = JSON.parse(raw); } catch (e) { return null; }
      var parts = path.split('.');
      for (var i = 0; i < parts.length; i++) { if (v == null || typeof v !== 'object') return null; v = v[parts[i]]; }
    } else if (typeof v === 'string') {
      v = v.trim();
      if (v.charAt(0) === '{' || v.charAt(0) === '[' || v.charAt(0) === '"') { try { v = JSON.parse(v); } catch (e) { return null; } }
    }
    v = typeof v === 'number' ? v : (typeof v === 'string' && v !== '' ? Number(v) : NaN);
    return isFinite(v) && v >= 0 && v <= 1e12 ? v : null;
  }
  function better(order, a, b) { return b == null ? true : (order === 'asc' ? a < b : a > b); }
  function fmt(kind, v) {
    if (kind === 'sec' || kind === 'ms') {
      var s = kind === 'ms' ? v / 1000 : v, m = Math.floor(s / 60), r = s - m * 60;
      return (m ? m + ':' + (r < 10 ? '0' : '') : '') + r.toFixed(m ? 1 : 2).replace('.', ',') + (m ? '' : ' s');
    }
    return Math.round(v).toLocaleString('de-DE');
  }
  function cleanName(n) {
    n = String(n || '').replace(/[\u0000-\u001f\u007f<>&"']/g, '').replace(/\s+/g, ' ').trim();
    return n.length >= 2 && n.length <= 20 ? n : '';
  }
  function boardId(game, b) { return (b.id && b.id !== 'main' ? game + '__' + b.id : game).replace(/[^\w-]/g, '').slice(0, 60); }
  function entryFields(name, value, order) {
    return { fields: { n: { stringValue: name }, s: { doubleValue: value }, o: { stringValue: order }, t: { integerValue: String(Date.now()) } } };
  }

  var game = Cloud && Cloud.game, boards = game ? cfgFor(game) : null;
  var T = { readValue: readValue, better: better, fmt: fmt, cleanName: cleanName, boardId: boardId, entryFields: entryFields };
  window.AnMaChaBoard = { _t: T, REG: REG };
  if (!Cloud || !boards || !boards.length || !LS) return;

  var FS = Cloud.FS, KEY_SHARE = 'anmacha-board-share', KEY_NICK = 'anmacha-board-nick', KEY_SENT = 'anmacha-board-sent:';
  var uidNow = '', panel = null, btn = null, sel = 0, msg = '', rows = null, loading = false;
  function get(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { LS.setItem(k, v); } catch (e) {} }
  function user() { return Cloud.user ? Cloud.user() : null; }
  function shared() { return get(KEY_SHARE) === '1' && !!cleanName(get(KEY_NICK)); }

  function authFetch(url, opt) {
    var u = user();
    if (!u) return Promise.reject(new Error('login'));
    return u.getIdToken().then(function (t) {
      uidNow = u.uid || uidNow;
      opt = opt || {}; opt.headers = Object.assign({ Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, opt.headers || {});
      return fetch(url, opt);
    });
  }
  function docUrl(id, uid) { return FS + 'boards/' + id + '/e/' + uid; }

  // ---- Einreichen: bessere Bestwerte (oder neuer Spitzname) in die Cloud schreiben ----
  var sending = false;
  function submit() {
    var u = user();
    if (!u || !shared() || sending) return Promise.resolve();
    var name = cleanName(get(KEY_NICK)), jobs = [];
    boards.forEach(function (b) {
      var v = readValue(get(b.key), b.path || '');
      if (v == null || (b.order === 'asc' && v <= 0)) return;
      jobs.push({ b: b, v: v, id: boardId(game, b) });
    });
    if (!jobs.length) return Promise.resolve();
    sending = true;
    return u.getIdToken().then(function () {
      uidNow = u.uid || uidNow;
      return jobs.reduce(function (p, j) {
        return p.then(function () {
          var sk = KEY_SENT + uidNow + ':' + j.id, sent = get(sk), prev = null, sentName = '';
          if (sent) { try { var o = JSON.parse(sent); prev = o.v; sentName = o.n; } catch (e) {} }
          if (prev != null && !better(j.b.order, j.v, prev) && sentName === name) return;
          var send = prev != null && !better(j.b.order, j.v, prev) ? prev : j.v;   // nur Namenswechsel: alten Bestwert behalten
          return authFetch(docUrl(j.id, uidNow), { method: 'PATCH', body: JSON.stringify(entryFields(name, send, j.b.order)) }).then(function (r) {
            if (r.ok) { put(sk, JSON.stringify({ v: send, n: name })); return; }
            if (r.status !== 403) return;
            // Abgelehnt: entweder kennt der Server schon einen besseren Wert (z. B. neues Gerät) oder die Regeln sind noch nicht veröffentlicht.
            return authFetch(docUrl(j.id, uidNow)).then(function (g) { return g.ok ? g.json() : null; }).then(function (d) {
              var sv = d && d.fields && d.fields.s ? Number(d.fields.s.doubleValue != null ? d.fields.s.doubleValue : d.fields.s.integerValue) : null;
              if (sv != null && isFinite(sv)) put(sk, JSON.stringify({ v: sv, n: name }));
              else msg = 'Ranglisten sind noch nicht freigeschaltet.';
            });
          });
        });
      }, Promise.resolve());
    }).catch(function () {}).then(function () { sending = false; });
  }

  // ---- Lesen: Top 25 einer Rangliste (ohne Anmeldung möglich) ----
  function load() {
    var b = boards[sel], id = boardId(game, b);
    loading = true; rows = null; draw();
    var q = { structuredQuery: { from: [{ collectionId: 'e' }], orderBy: [{ field: { fieldPath: 's' }, direction: b.order === 'asc' ? 'ASCENDING' : 'DESCENDING' }], limit: 25 } };
    fetch(FS + 'boards/' + id + ':runQuery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }).then(function (r) {
      if (r.status === 403) throw new Error('Ranglisten sind noch nicht freigeschaltet.');
      if (!r.ok) throw new Error('Rangliste gerade nicht erreichbar.');
      return r.json();
    }).then(function (j) {
      rows = (j || []).filter(function (x) { return x.document; }).map(function (x) {
        var f = x.document.fields || {}, nm = x.document.name || '';
        return { uid: nm.slice(nm.lastIndexOf('/') + 1), n: cleanName(f.n && f.n.stringValue) || '–', s: Number(f.s && (f.s.doubleValue != null ? f.s.doubleValue : f.s.integerValue)) };
      });
      msg = '';
    }).catch(function (e) { rows = []; msg = e.message || 'Rangliste gerade nicht erreichbar.'; }).then(function () { loading = false; draw(); });
  }

  function removeAll() {
    var u = user();
    if (!u) return Promise.resolve();
    return u.getIdToken().then(function () {
      uidNow = u.uid || uidNow;
      var all = [];
      Object.keys(REG).forEach(function (g) { (REG[g] || []).forEach(function (b) { all.push(boardId(g, b)); }); });
      return all.reduce(function (p, id) { return p.then(function () { return authFetch(docUrl(id, uidNow), { method: 'DELETE' }).catch(function () {}); }); }, Promise.resolve());
    }).then(function () {
      try { for (var i = LS.length - 1; i >= 0; i--) { var k = LS.key(i); if (k && k.indexOf(KEY_SENT) === 0) LS.removeItem(k); } } catch (e) {}
    });
  }

  // ---- Oberfläche ----
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  var BS = 'display:block;width:100%;margin:8px 0 0;padding:9px 12px;border:1px solid #dadce0;border-radius:8px;background:#fff;color:#3c4043;font:500 14px system-ui,sans-serif;cursor:pointer;box-sizing:border-box';
  function button(label, fn) { var b = el('button', BS, label); b.type = 'button'; b.onclick = fn; panel.appendChild(b); return b; }
  function draw() {
    if (!panel) return;
    var b = boards[sel], u = user(), mine = shared();
    panel.textContent = '';
    panel.appendChild(el('b', 'font-size:15px', '🏆 Rangliste'));
    if (boards.length > 1) {
      var s = el('select', 'display:block;width:100%;margin:8px 0 0;padding:8px;border-radius:8px;border:1px solid #5f6368;background:#202124;color:#fff;font:14px system-ui,sans-serif');
      boards.forEach(function (x, i) { var o = el('option', '', x.title); o.value = String(i); if (i === sel) o.selected = true; s.appendChild(o); });
      s.onchange = function () { sel = +s.value; load(); };
      panel.appendChild(s);
    } else panel.appendChild(el('div', 'opacity:.75;font-size:12px;margin-top:2px', b.title));
    var list = el('ol', 'list-style:none;margin:10px 0 0;padding:0;max-height:min(40vh,260px);overflow:auto');
    if (loading) list.appendChild(el('li', 'opacity:.7', 'Lade …'));
    else if (rows && rows.length) rows.forEach(function (r, i) {
      var me = uidNow && r.uid === uidNow;
      var li = el('li', 'display:flex;gap:8px;padding:5px 6px;border-radius:6px;' + (me ? 'background:rgba(66,133,244,.35);font-weight:600' : ''));
      li.appendChild(el('span', 'width:22px;opacity:.7;text-align:right;flex:none', String(i + 1)));
      li.appendChild(el('span', 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', r.n));
      li.appendChild(el('span', 'flex:none;font-variant-numeric:tabular-nums', fmt(b.fmt, r.s) + (b.fmt ? '' : (b.unit ? ' ' + b.unit : ''))));
      list.appendChild(li);
    });
    else list.appendChild(el('li', 'opacity:.7', msg || 'Noch keine Einträge – sei der Erste!'));
    panel.appendChild(list);
    if (msg && rows && rows.length) panel.appendChild(el('div', 'margin-top:6px;font-size:12px;color:#f28b82', msg));
    var hr = el('div', 'margin:12px 0 0;padding-top:10px;border-top:1px solid rgba(255,255,255,.2)');
    panel.appendChild(hr);
    if (!u) {
      hr.appendChild(el('div', 'font-size:13px;opacity:.85', 'Zum Mitmachen mit Google anmelden (☁). Öffentlich sind nur Spitzname und Bestwert.'));
      if (Cloud.signIn) button('Mit Google anmelden', function () { Cloud.signIn(); });
    } else if (!mine) {
      hr.appendChild(el('div', 'font-size:13px;opacity:.85', 'Bestwerte freigeben: Andere sehen nur deinen Spitzname und deinen Bestwert – keine Google-Daten. Jederzeit widerrufbar.'));
      var inp = el('input', 'display:block;width:100%;margin:8px 0 0;padding:9px 10px;border-radius:8px;border:1px solid #5f6368;background:#202124;color:#fff;font:14px system-ui,sans-serif;box-sizing:border-box');
      inp.type = 'text'; inp.maxLength = 20; inp.placeholder = 'Spitzname (2–20 Zeichen)'; inp.value = get(KEY_NICK) || ''; inp.setAttribute('aria-label', 'Spitzname');
      hr.appendChild(inp);
      var go = el('button', BS, 'Bestwerte öffentlich zeigen'); go.type = 'button'; hr.appendChild(go);
      go.onclick = function () {
        var n = cleanName(inp.value);
        if (!n) { msg = 'Bitte einen Spitznamen mit 2–20 Zeichen wählen.'; rows = rows || []; draw(); return; }
        put(KEY_NICK, n); put(KEY_SHARE, '1'); msg = '';
        submit().then(load);
      };
    } else {
      hr.appendChild(el('div', 'font-size:13px;color:#81c995', '● Freigegeben als „' + (get(KEY_NICK) || '') + '“'));
      button('Spitzname ändern', function () { var n = cleanName(window.prompt('Neuer Spitzname (2–20 Zeichen):', get(KEY_NICK) || '')); if (n) { put(KEY_NICK, n); submit().then(load); } });
      button('Freigabe beenden & meine Einträge löschen', function () {
        if (!window.confirm('Alle deine Ranglisten-Einträge in allen Spielen löschen und die Freigabe beenden?')) return;
        put(KEY_SHARE, '0'); removeAll().then(function () { msg = ''; load(); });
      });
    }
  }
  function toggle() {
    var open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    if (open) { submit().then(load); }
  }
  function ui() {
    if (!document.body) return;
    btn = el('button', 'position:fixed;left:56px;bottom:8px;z-index:2147483000;width:40px;height:40px;padding:0;border:2px solid #dadce0;border-radius:50%;background:#fff;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.85;box-shadow:0 1px 4px rgba(0,0,0,.4)', '🏆');
    btn.type = 'button'; btn.setAttribute('aria-label', 'Rangliste');
    panel = el('div', 'position:fixed;left:8px;bottom:56px;z-index:2147483001;width:min(300px,calc(100vw - 16px));padding:14px;border-radius:12px;background:rgba(20,20,30,.97);color:#fff;font:14px/1.4 system-ui,sans-serif;display:none;box-sizing:border-box');
    btn.onclick = toggle;
    document.body.appendChild(panel); document.body.appendChild(btn);
  }
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);

  // Bestwerte regelmäßig prüfen und bei Verbesserung einreichen (nur mit Freigabe und Anmeldung)
  setTimeout(submit, 4000);
  setInterval(function () { if (!document.hidden) submit(); }, 20000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) submit(); });
  window.addEventListener('pagehide', submit);
  window.AnMaChaBoard.submit = submit; window.AnMaChaBoard.removeAll = removeAll;
})();
