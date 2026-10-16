/*! AnMaCha Ranglisten – öffentliche Bestenlisten je Spiel (Firebase Firestore, nur mit Freigabe des Spielers).
 * Zwei Teile in einer Datei:
 *  1) Bibliothek `window.AnMaChaBoard` (Registry, Erkennung, Lesen, Profil, Einreichen) – genutzt von der zentralen Seite ranglisten.html.
 *  2) Stille Laufzeit in den Spielen (wird von cloud/anmacha-cloud.js nachgeladen, data-board="off" schaltet ab): reicht Bestwerte ein, sobald
 *     der Spieler sie freigegeben hat. KEINE Oberfläche im Spiel – Ansicht, Freigabe, Spitzname und Löschen liegen auf der Ranglisten-Seite
 *     (ranglisten.html, einbettbar per iframe oder EasyGames.open('ranglisten')).
 * Spiele ohne Eintrag in REG bekommen automatisch Ranglisten (Highscore, Gesamtpunkte, Bestzeit, Siege, Sterne, XP), sofern ihr Spielstand
 * passende Felder enthält (detect()). Öffentlich sind NUR Spitzname, Bestwert und Zeitpunkt – keine Google-Daten. Freigabe jederzeit
 * widerrufbar (löscht alle eigenen Einträge). Die Freigabe liegt zusätzlich im eigenen Profil users/<uid>/saves/__board und gilt so auf allen Geräten.
 * Daten: boards/<spiel>[__<modus>]/e/<uid> = { n: Spitzname, s: Wert, o: 'desc'|'asc', t: ms } (Regeln: cloud/firestore.rules).
 * Hinweis: Werte kommen vom Gerät des Spielers und sind nicht manipulationssicher (Spaß-Ranglisten). */
(function () {
  'use strict';
  var Cloud = window.AnMaChaCloud;
  var LS = null;
  try { LS = window.localStorage; } catch (e) {}

  // ---- Registry: je Spiel die Ranglisten. key = localStorage-Schlüssel, path = Pfad im JSON-Wert ('' = Zahl direkt),
  // order 'desc' = höher ist besser, 'asc' = niedriger ist besser (Zeiten), fmt: 'int' | 'sec' (Sekunden) | 'ms' (Millisekunden)
  var REG = {
    'ricoville': [
      { id: 'main', title: 'Höchstes Level', key: 'ricoville.profile.best', path: 'level', order: 'desc', unit: 'Level' },
      { id: 'pop', title: 'Meiste Einwohner', key: 'ricoville.profile.best', path: 'pop', order: 'desc', unit: 'Einwohner' }
    ],
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

  var T = { readValue: readValue, walk: walk, detect: detect, SLOTS: SLOTS, better: better, fmt: fmt, cleanName: cleanName, boardId: boardId, entryFields: entryFields };
  var KEY_SHARE = 'anmacha-board-share', KEY_NICK = 'anmacha-board-nick', KEY_SENT = 'anmacha-board-sent:', KEY_PROF = 'anmacha-board-prof:';
  function get(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { LS.setItem(k, v); } catch (e) {} }
  function C() { return window.AnMaChaCloud || Cloud || null; }
  function FSb() { var c = C(); return c && c.FS; }
  function user() { var c = C(); return c && c.user ? c.user() : null; }
  function shared() { return get(KEY_SHARE) === '1' && !!cleanName(get(KEY_NICK)); }
  function isOptOut(game) { return !!REG[game] && REG[game].length === 0; }
  function boardsFor(game) { return REG[game] || SLOTS; }
  function isAuto(game) { return !REG[game]; }

  function authFetch(url, opt) {
    var u = user();
    if (!u) return Promise.reject(new Error('login'));
    return u.getIdToken().then(function (t) {
      opt = opt || {}; opt.headers = Object.assign({ Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, opt.headers || {});
      return fetch(url, opt);
    });
  }
  function uidOf(u) { return u.getIdToken().then(function () { return u.uid || ''; }); }
  function docUrl(id, uid) { return FSb() + 'boards/' + id + '/e/' + uid; }
  function profUrl(uid) { return FSb() + 'users/' + uid + '/saves/__board'; }

  // ---- Lesen: Top-Liste (ohne Anmeldung möglich) ----
  function query(game, b, limit) {
    var q = { structuredQuery: { from: [{ collectionId: 'e' }], orderBy: [{ field: { fieldPath: 's' }, direction: b.order === 'asc' ? 'ASCENDING' : 'DESCENDING' }], limit: limit || 25 } };
    return fetch(FSb() + 'boards/' + boardId(game, b) + ':runQuery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }).then(function (r) {
      if (r.status === 403) throw new Error('Ranglisten sind noch nicht freigeschaltet.');
      if (!r.ok) throw new Error('Rangliste gerade nicht erreichbar.');
      return r.json();
    }).then(function (j) {
      return (j || []).filter(function (x) { return x.document; }).map(function (x) {
        var f = x.document.fields || {}, nm = x.document.name || '';
        return { uid: nm.slice(nm.lastIndexOf('/') + 1), n: cleanName(f.n && f.n.stringValue) || '–', s: Number(f.s && (f.s.doubleValue != null ? f.s.doubleValue : f.s.integerValue)) };
      });
    });
  }
  // Welche Ranglisten eines Spiels gibt es? Kuratierte: alle; automatische: nur mit Einträgen oder eigenem Wert (pairs = lokale Spielstand-Schlüssel).
  function probe(game, pairs) {
    var list = boardsFor(game);
    if (isOptOut(game)) return Promise.resolve([]);
    if (!isAuto(game)) return Promise.resolve(list);
    var det = detect(pairs || []);
    return Promise.all(list.map(function (b) {
      return query(game, b, 1).then(function (r) { return det[b.id] != null || r.length > 0; }).catch(function () { return det[b.id] != null; });
    })).then(function (has) { return list.filter(function (b, i) { return has[i]; }); });
  }

  // ---- Profil: Freigabe und Spitzname (lokal und im eigenen Firestore-Profil, damit sie auf allen Geräten/Ursprüngen gelten) ----
  function loadProfile(force) {
    var u = user();
    if (!u || !FSb()) return Promise.resolve(shared());
    return uidOf(u).then(function (uid) {
      var at = Number(get(KEY_PROF + uid)) || 0;
      if (!force && Date.now() - at < 600000) return shared();
      return authFetch(profUrl(uid)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        var v = d && d.fields && d.fields.d && d.fields.d.stringValue, p = null;
        if (v) { try { p = JSON.parse(v); } catch (e) {} }
        if (p) { put(KEY_SHARE, p.s ? '1' : '0'); if (cleanName(p.n)) put(KEY_NICK, cleanName(p.n)); }
        put(KEY_PROF + uid, String(Date.now()));
        return shared();
      });
    }).catch(function () { return shared(); });
  }
  function saveProfile(share, nick) {
    var u = user(), n = cleanName(nick);
    if (!u) return Promise.reject(new Error('login'));
    if (share && !n) return Promise.reject(new Error('Bitte einen Spitznamen mit 2–20 Zeichen wählen.'));
    put(KEY_SHARE, share ? '1' : '0'); if (n) put(KEY_NICK, n);
    return uidOf(u).then(function (uid) {
      var body = { fields: { d: { stringValue: JSON.stringify({ s: share ? 1 : 0, n: n || cleanName(get(KEY_NICK)) || '' }) }, t: { integerValue: String(Date.now()) } } };
      return authFetch(profUrl(uid), { method: 'PATCH', body: JSON.stringify(body) }).then(function () { put(KEY_PROF + uid, String(Date.now())); });
    });
  }

  // ---- Einreichen: bessere Bestwerte (oder neuer Spitzname) in die Cloud schreiben ----
  var sending = false, lastMsg = '';
  function submitGame(game, pairs) {
    var u = user();
    if (!u || !shared() || sending || isOptOut(game)) return Promise.resolve();
    var name = cleanName(get(KEY_NICK)), jobs = [], auto = isAuto(game), det = auto ? detect(pairs || []) : null;
    boardsFor(game).forEach(function (b) {
      var v = auto ? (det[b.id] != null ? det[b.id] : null) : readValue(pairsGet(pairs, b.key), b.path || '', b.agg);
      if (v == null || (b.order === 'asc' && v <= 0)) return;
      jobs.push({ b: b, v: v, id: boardId(game, b) });
    });
    if (!jobs.length) return Promise.resolve();
    sending = true;
    return uidOf(u).then(function (uid) {
      return jobs.reduce(function (p, j) {
        return p.then(function () {
          var sk = KEY_SENT + uid + ':' + j.id, sent = get(sk), prev = null, sentName = '';
          if (sent) { try { var o = JSON.parse(sent); prev = o.v; sentName = o.n; } catch (e) {} }
          if (prev != null && !better(j.b.order, j.v, prev) && sentName === name) return;
          var send = prev != null && !better(j.b.order, j.v, prev) ? prev : j.v;   // nur Namenswechsel: alten Bestwert behalten
          return authFetch(docUrl(j.id, uid), { method: 'PATCH', body: JSON.stringify(entryFields(name, send, j.b.order)) }).then(function (r) {
            if (r.ok) { put(sk, JSON.stringify({ v: send, n: name })); return; }
            if (r.status !== 403) return;
            // Abgelehnt: entweder kennt der Server schon einen besseren Wert (z. B. neues Gerät) oder die Regeln sind noch nicht veröffentlicht.
            return authFetch(docUrl(j.id, uid)).then(function (g) { return g.ok ? g.json() : null; }).then(function (d) {
              var sv = d && d.fields && d.fields.s ? Number(d.fields.s.doubleValue != null ? d.fields.s.doubleValue : d.fields.s.integerValue) : null;
              if (sv != null && isFinite(sv)) put(sk, JSON.stringify({ v: sv, n: name }));
              else lastMsg = 'Ranglisten sind noch nicht freigeschaltet.';
            });
          });
        });
      }, Promise.resolve());
    }).catch(function () {}).then(function () { sending = false; });
  }
  function pairsGet(pairs, key) { for (var i = 0; i < (pairs || []).length; i++) if (pairs[i][0] === key) return pairs[i][1]; return null; }

  // Lokale Spielstände eines Spiels (Schlüssel passend zu den Präfixen bzw. – in einem Spiel – laut Cloud-Skript)
  function localPairs(prefixes) {
    var out = [], i, k, c = C();
    try {
      for (i = 0; i < LS.length; i++) {
        k = LS.key(i);
        if (!k || k.indexOf('anmacha-') === 0) continue;
        if (prefixes ? prefixes.some(function (p) { return k.indexOf(p) === 0; }) : (c && c.mine && c.mine(k))) out.push([k, LS.getItem(k)]);
      }
    } catch (e) {}
    return out;
  }
  // Zentrale Seite: alle auf diesem Ursprung gespeicherten Spiele einreichen (games = Katalog-Einträge mit cloud: {game, prefix})
  function submitLocal(games) {
    return (games || []).reduce(function (p, g) {
      return p.then(function () {
        if (!g.cloud) return;
        var pre = String(g.cloud.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        return pre.length ? submitGame(g.cloud.game, localPairs(pre)) : undefined;
      });
    }, Promise.resolve());
  }

  // Freigabe beenden: alle eigenen Einträge löschen (Registry, automatische Ranglisten aller Katalogspiele und auf diesem Gerät eingereichte)
  function removeAll(games) {
    var u = user();
    if (!u) return Promise.resolve();
    return uidOf(u).then(function (uid) {
      var all = [];
      function add(id) { if (all.indexOf(id) < 0) all.push(id); }
      Object.keys(REG).forEach(function (g) { (REG[g] || []).forEach(function (b) { add(boardId(g, b)); }); });
      (games || []).forEach(function (g) { if (g.cloud && !REG[g.cloud.game]) SLOTS.forEach(function (b) { add(boardId(g.cloud.game, b)); }); });
      var cg = C() && C().game; if (cg && !REG[cg]) SLOTS.forEach(function (b) { add(boardId(cg, b)); });
      try { for (var i = 0, k, pre = KEY_SENT + uid + ':'; i < LS.length; i++) { k = LS.key(i); if (k && k.indexOf(pre) === 0) add(k.slice(pre.length)); } } catch (e) {}
      return all.reduce(function (p, id) { return p.then(function () { return authFetch(docUrl(id, uid), { method: 'DELETE' }).catch(function () {}); }); }, Promise.resolve()).then(function () {
        try { for (var i = LS.length - 1, k; i >= 0; i--) { k = LS.key(i); if (k && k.indexOf(KEY_SENT) === 0) LS.removeItem(k); } } catch (e) {}
      });
    });
  }

  var API = { _t: T, REG: REG, SLOTS: SLOTS, boardsFor: boardsFor, isOptOut: isOptOut, isAuto: isAuto, query: query, probe: probe, loadProfile: loadProfile, saveProfile: saveProfile,
    shared: shared, nick: function () { return cleanName(get(KEY_NICK)); }, submitGame: submitGame, submitLocal: submitLocal, removeAll: removeAll, localPairs: localPairs,
    fmt: fmt, cleanName: cleanName, message: function () { return lastMsg; } };
  window.AnMaChaBoard = API;

  // ---- Stille Laufzeit im Spiel: nur Einreichen, keine Oberfläche ----
  var game = Cloud && Cloud.game;
  if (!game || !LS || isOptOut(game)) return;
  function run() { return loadProfile(false).then(function () { return submitGame(game, localPairs(null)); }); }
  API.submit = run;
  setTimeout(run, 4000);
  setInterval(function () { if (!document.hidden) run(); }, 20000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) run(); });
  window.addEventListener('pagehide', run);
})();
