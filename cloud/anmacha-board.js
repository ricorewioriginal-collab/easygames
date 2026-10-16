/*! AnMaCha Ranglisten – öffentliche Bestenlisten je Spiel (Firebase Firestore, nur mit Freigabe des Spielers).
 * Wird von cloud/anmacha-cloud.js automatisch nachgeladen (data-board="off" schaltet es ab). Spiele ohne Eintrag in REG bekommen automatisch Ranglisten (Highscore, Gesamtpunkte, Bestzeit, Siege, Sterne, XP), sofern ihr Spielstand passende Felder enthält (detect()).
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
    'ricopoly': [
      { id: 'main', title: 'Höchster Kontostand', key: 'ricopoly.v1.profile', path: 'stats.highestMoney', order: 'desc', unit: '€' }
    ],
    'krawallvoegel': [
      { id: 'main', title: 'Gesamtpunkte (alle Level)', key: 'easygames.krawallvoegel.v1', path: 'lv.*.1', agg: 'sum', order: 'desc', unit: 'Punkte' }
    ],
    'rico-flap': [
      { id: 'main', title: 'Endlos-Rekord', key: 'easygames.rico-flap.v1', path: 'endless', order: 'desc', unit: 'Punkte' }
    ],
    'kiko-sterneninseln': [
      { id: 'main', title: 'Gesamtpunkte (20 Level)', key: 'kiko-sterneninseln-v1', path: 'best.*', agg: 'sum', order: 'desc', unit: 'Punkte' }
    ],
    'radio-maze': [
      { id: 'main', title: 'Highscore', key: 'easygames.radio-maze.v1', path: 'best', order: 'desc', unit: 'Punkte' }
    ],
    'pufi-farbwind': [
      { id: 'main', title: 'Gesamtpunkte (alle Level)', key: 'easygames.pufi-farbwind.v2', path: 'best.*', agg: 'sum', order: 'desc', unit: 'Punkte' }
    ],
    'lumo': [
      { id: 'main', title: 'Highscore', key: 'easygames.lumo.v1', path: 'hiscore', order: 'desc', unit: 'Punkte' }
    ],
    'riftzone': [
      { id: 'main', title: 'Siege gesamt', key: 'riftzone.profile', path: 'totals.wins', order: 'desc', unit: 'Siege' }
    ],
    'radio-surfer': [
      { id: 'main', title: 'Highscore', key: 'anmachaRadioSurferBest', order: 'desc', unit: 'Punkte' }
    ],
    'flipper': [
      { id: 'main', title: 'Highscore', key: 'anmachaFlipperBest', order: 'desc', unit: 'Punkte' }
    ],
    'beat-surfer': [
      { id: 'main', title: 'Gesamtpunkte (alle Tracks)', key: 'anmachaBeatBest', path: '*', agg: 'sum', order: 'desc', unit: 'Punkte' }
    ],
    'prismrush': [
      { id: 'main', title: 'Endlos (normal) – Highscore', key: 'prismrush.save.v1', path: 'records.endless:endless:normal.bestScore', order: 'desc', unit: 'Punkte' }
    ],
    'snake': [
      { id: 'main', title: 'Highscore', key: 'anmachaSnake3d', path: 'best', order: 'desc', unit: 'Punkte' }
    ],
    'tower-defense': [
      { id: 'main', title: 'Highscore', key: 'anmachaTD3d', path: 'rank.0.s', order: 'desc', unit: 'Punkte' }
    ],
    'quiz': [
      { id: 'ladder', title: 'Leiter – Gewinn', key: 'amqSave', path: 'hof.ladder.0.v', order: 'desc', unit: '€' },
      { id: 'night', title: 'Quiznacht – Punkte', key: 'amqSave', path: 'hof.night.0.v', order: 'desc', unit: 'Punkte' }
    ],
    'koffer-dealer': [
      { id: 'main', title: 'Höchster Gewinn', key: 'akdSave', path: 'hof.0.v', order: 'desc', unit: '€' }
    ],
    'gesucht': [
      { id: 'hint', title: 'Hinweis-Modus – Punkte', key: 'ggSave', path: 'top.hint.0.1', order: 'desc', unit: 'Punkte' },
      { id: 'ask', title: 'Frage-Modus – Punkte', key: 'ggSave', path: 'top.ask.0.1', order: 'desc', unit: 'Punkte' },
      { id: 'band', title: 'Band-Modus – Punkte', key: 'ggSave', path: 'top.band.0.1', order: 'desc', unit: 'Punkte' }
    ],
    'kart': [
      { id: 'wiese', title: 'Beste Runde – Wiese', key: 'akSave', path: 'best.wiese.lap', order: 'asc', fmt: 'sec' },
      { id: 'strand', title: 'Beste Runde – Strand', key: 'akSave', path: 'best.strand.lap', order: 'asc', fmt: 'sec' },
      { id: 'gruft', title: 'Beste Runde – Gruft', key: 'akSave', path: 'best.gruft.lap', order: 'asc', fmt: 'sec' },
      { id: 'fantasia', title: 'Beste Runde – Fantasia', key: 'akSave', path: 'best.fantasia.lap', order: 'asc', fmt: 'sec' },
      { id: 'neon', title: 'Beste Runde – Neon', key: 'akSave', path: 'best.neon.lap', order: 'asc', fmt: 'sec' },
      { id: 'vulkan', title: 'Beste Runde – Vulkan', key: 'akSave', path: 'best.vulkan.lap', order: 'asc', fmt: 'sec' },
      { id: 'eis', title: 'Beste Runde – Eis', key: 'akSave', path: 'best.eis.lap', order: 'asc', fmt: 'sec' },
      { id: 'dschungel', title: 'Beste Runde – Dschungel', key: 'akSave', path: 'best.dschungel.lap', order: 'asc', fmt: 'sec' },
      { id: 'kosmos', title: 'Beste Runde – Kosmos', key: 'akSave', path: 'best.kosmos.lap', order: 'asc', fmt: 'sec' },
      { id: 'wueste', title: 'Beste Runde – Wüste', key: 'akSave', path: 'best.wueste.lap', order: 'asc', fmt: 'sec' }
    ],
    'wobbel': [
      { id: 'main', title: 'Sterne gesamt', key: 'wobbelSave1', path: 'levels.*.stars', agg: 'sum', order: 'desc', unit: '★' }
    ],
    'funkparcours': [
      { id: 'main', title: 'Finale – Bestzeit', key: 'fpBest1', path: '2.t', order: 'asc', fmt: 'sec' }
    ],
    'turbokick': [
      { id: 'main', title: 'Siege gesamt', key: 'turbokick.save', path: 'stats.wins', order: 'desc', unit: 'Siege' }
    ],
    'partyverse': [
      { id: 'main', title: 'Siege gesamt', key: 'partyverse.save', path: 'stats.wins', order: 'desc', unit: 'Siege' }
    ],
    'gold-reels': [
      { id: 'main', title: 'Größter Einzelgewinn', key: 'agrCasino', path: 'best', order: 'desc', unit: '€' }
    ],
    // Leerer Eintrag = bewusst keine Rangliste (Sandbox/Story, deren „Sterne“ o. Ä. eine ausgebbare Währung sind)
    'bunte-insel': [],
    'bunte-insel2': [],
    'klotzfunk': [],
    'showdown': [
      { id: 'main', title: 'Siege gegen den Bot', key: 'asdSave', path: 'stats.*.0', agg: 'sum', order: 'desc', unit: 'Siege' }
    ],
    'zotik2': [
      { id: 'main', title: 'Minispiele – Gesamtpunkte', key: 'zotik_mini_records_v1', path: '*', agg: 'sum', order: 'desc', unit: 'Punkte', local: true }
    ],
    'urwaldlager': [
      { id: 'main', title: 'Sterne gesamt', key: 'ul_best', path: 'stars', order: 'desc', unit: '★' }
    ],
    'gay-life': [
      { id: 'main', title: 'Gesamt-XP', key: 'anmachaGayLife', path: 'xp', order: 'desc', unit: 'XP' }
    ]
  };

  function cfgFor(game) { return REG[game] || null; }

  // ---- reine Hilfsfunktionen (getestet in tools/test-board.mjs) ----
  // path: Punkt-getrennt, '*' = alle Kinder (Objekt/Array); agg ('sum'|'max'|'min') fasst die Treffer zusammen (z. B. Punkte über alle Level)
  function walk(v, parts) {
    if (!parts.length) return [v];
    var k = parts[0], rest = parts.slice(1), kids, out = [], i;
    if (v == null || typeof v !== 'object') return out;
    if (k === '*') { kids = Array.isArray(v) ? v : Object.keys(v).map(function (x) { return v[x]; }); for (i = 0; i < kids.length; i++) out = out.concat(walk(kids[i], rest)); return out; }
    return walk(v[k], rest);
  }
  function num(v) { v = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN); return isFinite(v) && v >= 0 && v <= 1e12 ? v : null; }
  function readValue(raw, path, agg) {
    if (raw == null) return null;
    var v = raw;
    if (path || agg) { try { v = JSON.parse(raw); } catch (e) { return null; } }
    else if (typeof v === 'string') {
      v = v.trim();
      if (v.charAt(0) === '{' || v.charAt(0) === '[' || v.charAt(0) === '"') { try { v = JSON.parse(v); } catch (e) { return null; } }
    }
    if (path) {
      var hits = walk(v, path.split('.')).map(num).filter(function (x) { return x != null; });
      if (!agg) return hits.length === 1 && path.indexOf('*') < 0 ? hits[0] : null;
      if (!hits.length) return null;
      var r = hits[0];
      for (var i = 1; i < hits.length; i++) r = agg === 'sum' ? r + hits[i] : agg === 'max' ? Math.max(r, hits[i]) : Math.min(r, hits[i]);
      return r;
    }
    return num(v);
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

  // ---- Automatische Erkennung für Spiele OHNE Eintrag in REG (auch neue Spiele): feste Ranglisten, Werte aus den synchronisierten Spielständen ----
  var SLOTS = [
    { id: 'hi', title: 'Highscore', order: 'desc', unit: 'Punkte' },
    { id: 'sum', title: 'Gesamtpunkte', order: 'desc', unit: 'Punkte' },
    { id: 'time', title: 'Bestzeit', order: 'asc', fmt: 'sec' },
    { id: 'wins', title: 'Siege', order: 'desc', unit: 'Siege' },
    { id: 'stars', title: 'Sterne', order: 'desc', unit: '★' },
    { id: 'xp', title: 'Erfahrung', order: 'desc', unit: 'XP' }
  ];
  var N_HI = /^(hiscore|highscore|bestscore|topscore|best|record|highest|bestpoints|recordscore|rekord|rekordpunkte)$/;
  var N_TIME = /^(besttime|bestlap|bestzeit|rekordzeit|lap|time|zeit|t)$/, BAD_TIME = /play|elapsed|total|session|remain|left|duration|age|cur|now|start|end|last|ms$/;
  var N_WINS = /^(wins|totalwins|siege|victories|won|gewonnen)$/, N_XP = /^(xp|totalxp|exp|experience|erfahrung)$/, N_STARS = /^(stars|totalstars|sterne)$/;
  var N_CONT = /^(best|records?|scores|points|highscores|hiscores|rekorde|bestscores|bestpoints)$/, N_LIST = /rank|hof|top|score|best|leader|ruhm|liste|highscore/;
  function norm(k) { return String(k).toLowerCase().replace(/[^a-z]/g, ''); }
  function isNum(v) { return typeof v === 'number' && isFinite(v) && v > 0 && v <= 1e12; }
  function entryScore(el) {
    var i, f;
    if (Array.isArray(el)) return typeof el[0] === 'string' && isNum(el[1]) ? el[1] : null;
    if (el && typeof el === 'object') {
      for (i = 0, f = ['n', 'name', 'player', 'spieler']; i < f.length; i++) if (typeof el[f[i]] === 'string') break;
      if (i === f.length) return null;
      for (i = 0, f = ['s', 'v', 'score', 'points', 'punkte', 'pts']; i < f.length; i++) if (isNum(el[f[i]])) return el[f[i]];
    }
    return null;
  }
  // pairs = [[localStorage-Schlüssel, Rohwert], …] -> { hi, sum, time, wins, stars, xp } (nur gefundene)
  function detect(pairs) {
    var C = { hi: [], sum: [], time: [], wins: [], stars: [], xp: [] }, count = 0;
    function leaf(path, v) {
      if (!isNum(v)) return;
      var last = norm(path[path.length - 1]), parent = path.slice(0, -1).map(norm).join('/');
      if (N_HI.test(last)) C.hi.push(v);
      else if (N_TIME.test(last) && !BAD_TIME.test(last) && (/best|record|top|rekord/.test(parent) || /^best/.test(last))) C.time.push(v);
      else if (N_WINS.test(last)) C.wins.push(v);
      else if (N_XP.test(last)) C.xp.push(v);
      else if (N_STARS.test(last)) C.stars.push(v);
    }
    function visit(v, path, depth) {
      if (++count > 6000) return;
      if (typeof v === 'number') { leaf(path, v); return; }
      if (!v || typeof v !== 'object' || depth > 5) return;
      var arr = Array.isArray(v), keys = arr ? v.map(function (x, i) { return i; }) : Object.keys(v), name = path.length ? norm(path[path.length - 1]) : '', i, nums, sc, best;
      if (N_CONT.test(name) || N_STARS.test(name)) {
        nums = keys.map(function (k) { return v[k]; }).filter(function (x) { return typeof x === 'number' && isFinite(x) && x >= 0 && x <= 1e12; });
        sc = nums.reduce(function (a, b) { return a + b; }, 0);
        if (nums.length >= 2 && nums.length >= keys.length * 0.7 && sc > 0) (N_STARS.test(name) ? C.stars : C.sum).push(sc);
      }
      if (arr && v.length && path.some(function (x) { return N_LIST.test(norm(x)); })) {
        best = null;
        for (i = 0; i < v.length; i++) { sc = entryScore(v[i]); if (sc != null && (best == null || sc > best)) best = sc; }
        if (best != null) C.hi.push(best);
      }
      for (i = 0; i < keys.length; i++) visit(v[keys[i]], path.concat([String(keys[i])]), depth + 1);
    }
    (pairs || []).forEach(function (kv) {
      var key = kv[0], raw = kv[1], v, nk = norm(key);
      if (raw == null) return;
      raw = String(raw).trim();
      if (raw.length > 300000) return;
      if (raw.charAt(0) === '{' || raw.charAt(0) === '[') { try { v = JSON.parse(raw); } catch (e) { return; } visit(v, [], 0); return; }
      v = Number(raw);
      if (!isNum(v)) return;
      if (/(hiscore|highscore|bestscore|best|record)$/.test(nk)) C.hi.push(v);
      else if (/wins$/.test(nk)) C.wins.push(v);
      else if (/xp$/.test(nk)) C.xp.push(v);
      else if (/(besttime|bestlap)$/.test(nk)) C.time.push(v);
    });
    var out = {};
    ['hi', 'sum', 'wins', 'stars', 'xp'].forEach(function (k) { if (C[k].length) out[k] = Math.max.apply(null, C[k]); });
    if (C.time.length) out.time = Math.min.apply(null, C.time);
    return out;
  }

  var game = Cloud && Cloud.game, auto = !!game && !cfgFor(game), boards = game ? (cfgFor(game) || SLOTS) : null;
  var T = { readValue: readValue, walk: walk, detect: detect, SLOTS: SLOTS, better: better, fmt: fmt, cleanName: cleanName, boardId: boardId, entryFields: entryFields };
  window.AnMaChaBoard = { _t: T, REG: REG };
  if (!Cloud || !boards || !boards.length || !LS) return;

  var FS = Cloud.FS, KEY_SHARE = 'anmacha-board-share', KEY_NICK = 'anmacha-board-nick', KEY_SENT = 'anmacha-board-sent:';
  var uidNow = '', panel = null, btn = null, sel = 0, msg = '', rows = null, loading = false, shown = auto ? [] : boards, probedAt = 0, probed = !auto;
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

  // Alle synchronisierten Spielstand-Schlüssel dieses Spiels (für die automatische Erkennung)
  function localPairs() {
    var out = [], i, k;
    try { for (i = 0; i < LS.length; i++) { k = LS.key(i); if (k && k.indexOf('anmacha-') !== 0 && (!Cloud.mine || Cloud.mine(k))) out.push([k, LS.getItem(k)]); } } catch (e) {}
    return out;
  }
  // Automatische Spiele: welche Ranglisten gibt es (Einträge vorhanden oder eigener Wert erkannt)? Je Rangliste eine kleine Abfrage, 60 s zwischengespeichert.
  function probe() {
    if (!auto || (probed && Date.now() - probedAt < 60000)) return Promise.resolve();
    var det = detect(localPairs());
    return Promise.all(SLOTS.map(function (b) {
      var q = { structuredQuery: { from: [{ collectionId: 'e' }], orderBy: [{ field: { fieldPath: 's' }, direction: b.order === 'asc' ? 'ASCENDING' : 'DESCENDING' }], limit: 1 } };
      return fetch(FS + 'boards/' + boardId(game, b) + ':runQuery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
        .then(function (r) { if (r.status === 403) { msg = 'Ranglisten sind noch nicht freigeschaltet.'; return false; } return r.ok ? r.json() : false; })
        .then(function (j) { return det[b.id] != null || !!(j && j.some && j.some(function (x) { return x.document; })); }).catch(function () { return det[b.id] != null; });
    })).then(function (has) {
      shown = SLOTS.filter(function (b, i) { return has[i]; });
      if (sel >= shown.length) sel = 0;
      probed = true; probedAt = Date.now();
    });
  }

  // ---- Einreichen: bessere Bestwerte (oder neuer Spitzname) in die Cloud schreiben ----
  var sending = false;
  function submit() {
    var u = user();
    if (!u || !shared() || sending) return Promise.resolve();
    var name = cleanName(get(KEY_NICK)), jobs = [];
    var det = auto ? detect(localPairs()) : null;
    boards.forEach(function (b) {
      var v = auto ? (det[b.id] != null ? det[b.id] : null) : readValue(get(b.key), b.path || '', b.agg);
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
    var b = shown[sel];
    if (!b) { rows = []; loading = false; draw(); return; }
    var id = boardId(game, b);
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
      SLOTS.forEach(function (b) { all.push(boardId(game, b)); });
      try { for (var i = 0, k, pre = KEY_SENT + uidNow + ':'; i < LS.length; i++) { k = LS.key(i); if (k && k.indexOf(pre) === 0 && all.indexOf(k.slice(pre.length)) < 0) all.push(k.slice(pre.length)); } } catch (e) {}   // Ranglisten anderer Spiele, die dieses Gerät eingereicht hat
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
    var b = shown[sel] || boards[0], u = user(), mine = shared();
    panel.textContent = '';
    panel.appendChild(el('b', 'font-size:15px', '🏆 Rangliste'));
    if (shown.length > 1) {
      var s = el('select', 'display:block;width:100%;margin:8px 0 0;padding:8px;border-radius:8px;border:1px solid #5f6368;background:#202124;color:#fff;font:14px system-ui,sans-serif');
      shown.forEach(function (x, i) { var o = el('option', '', x.title); o.value = String(i); if (i === sel) o.selected = true; s.appendChild(o); });
      s.onchange = function () { sel = +s.value; load(); };
      panel.appendChild(s);
    } else if (shown.length) panel.appendChild(el('div', 'opacity:.75;font-size:12px;margin-top:2px', b.title));
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
    else list.appendChild(el('li', 'opacity:.7', msg || (shown.length ? 'Noch keine Einträge – sei der Erste!' : (probed ? 'Für dieses Spiel gibt es noch keine Rangliste – spiele ein paar Runden, dann erscheint sie automatisch.' : 'Lade …'))));
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
        probedAt = 0; submit().then(probe).then(load);
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
    if (open) { submit().then(probe).then(load); }
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
