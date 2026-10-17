/*! AnMaCha Bindung & Verwaltung – Firestore-REST-Bausteine für Nutzungsstatistik, Tagesherausforderung, Profil/Freunde/Einladungen und die Betreiber-Auswertung (reine Funktionen ohne DOM).
 *  Regeln: cloud/firestore.rules (Abschnitte „Nutzungsstatistik“, „Tagesherausforderung“, „Profil, Freunde, Einladungen“); Tests: node tools/test-engage.mjs, ricoville-src/firebase/engage.rules.test.mjs. */
(function (root) {
  'use strict';
  var ADMIN_EMAIL = 'ricorewioriginal@gmail.com';
  function str(v) { return { stringValue: String(v) }; }
  function int(v) { return { integerValue: String(Math.round(v)) }; }
  function project(fs) { var m = /projects\/([^/]+)\//.exec(fs); return m ? m[1] : ''; }
  function docName(fs, path) { return 'projects/' + project(fs) + '/databases/(default)/documents/' + path; }
  function commitUrl(fs) { return fs.replace(/\/$/, '') + ':commit'; }
  function rootQueryUrl(fs) { return fs.replace(/\/$/, '') + ':runQuery'; }
  function rid() {
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '', i, r = new Uint8Array(20);
    try { (root.crypto || {}).getRandomValues(r); } catch (e) { for (i = 0; i < 20; i++) r[i] = Math.floor(Math.random() * 256); }
    for (i = 0; i < 20; i++) s += a[r[i] % a.length];
    return s;
  }
  var T = [{ fieldPath: 't', setToServerValue: 'REQUEST_TIME' }];
  function dayNum(d) { d = d || new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }   // lokaler Tag JJJJMMTT (wie die Spielspuren)
  function dayIndex(n) { return Math.round(Date.UTC(Math.floor(n / 10000), Math.floor(n / 100) % 100 - 1, n % 100) / 86400000); }
  function cleanGame(g) { return String(g || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50); }

  // ---- Nutzungsstatistik: je Spieler, Spiel und Tag ein Zähler-Dokument (eigene uid in der Kennung); cur = bisheriger Stand {s,t,a} oder null ----
  function statId(game, day, uid) { return cleanGame(game) + '_' + day + '_' + uid; }
  function statUrl(fs, game, day, uid) { return fs.replace(/\/$/, '') + '/stats/' + statId(game, day, uid); }
  function statCommit(fs, uid, game, day, seconds, cur) {
    var g = cleanGame(game), t = Math.max(5, Math.min(3600, Math.round(seconds || 0))), c = cur || { s: 0, t: 0, a: 0 };
    return { writes: [{ update: { name: docName(fs, 'stats/' + statId(g, day, uid)), fields: { g: str(g), d: int(day), s: int((c.s || 0) + 1), t: int((c.t || 0) + t), a: int((c.a || 0) + (t < 20 ? 1 : 0)) } }, updateTransforms: [{ fieldPath: 'l', setToServerValue: 'REQUEST_TIME' }] }] };
  }
  function statQuery(sinceDay, game) {
    var f = { fieldFilter: { field: { fieldPath: 'd' }, op: 'GREATER_THAN_OR_EQUAL', value: { integerValue: String(sinceDay) } } };
    if (game) f = { compositeFilter: { op: 'AND', filters: [f, { fieldFilter: { field: { fieldPath: 'g' }, op: 'EQUAL', value: str(cleanGame(game)) } }] } };
    return { structuredQuery: { from: [{ collectionId: 'stats' }], where: f, limit: 1500 } };
  }
  function simple(f) { var o = {}; Object.keys(f || {}).forEach(function (k) { var v = f[k]; o[k] = v.stringValue != null ? v.stringValue : v.integerValue != null ? Number(v.integerValue) : v.doubleValue != null ? v.doubleValue : v.timestampValue != null ? v.timestampValue : v.booleanValue != null ? v.booleanValue : ''; }); return o; }
  function parseDocs(rows) { return (Array.isArray(rows) ? rows : []).filter(function (r) { return r && r.document && r.document.fields; }).map(function (r) { return { id: r.document.name.split('/').pop(), f: simple(r.document.fields) }; }); }
  // Auswertung je Spiel: [{ g, s, t, a, avg, abort, days, players }] absteigend nach Sitzungen
  function aggregate(rows) {
    var by = {};
    rows.forEach(function (r) { var f = r.f, o = by[f.g] || (by[f.g] = { g: f.g, s: 0, t: 0, a: 0, days: 0, u: {} }); o.s += f.s || 0; o.t += f.t || 0; o.a += f.a || 0; o.days++; o.u[r.id.split('_').pop()] = 1; });
    return Object.keys(by).map(function (k) { var o = by[k]; o.players = Object.keys(o.u).length; delete o.u; o.avg = o.s ? Math.round(o.t / o.s) : 0; o.abort = o.s ? Math.round(100 * o.a / o.s) : 0; return o; }).sort(function (a, b) { return b.s - a.s; });
  }

  // ---- Tagesherausforderung: Spiel des Tages (für alle gleich), Eintrag „heute dabei“ ----
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  // list = Katalogeinträge mit cloud.game; nur Spiele mit Bestwert-Wertung kommen infrage (ok(g) entscheidet). Gleicher Tag → gleiches Spiel für alle.
  function dailyPick(list, day, ok) {
    var c = (list || []).filter(function (g) { return g && g.cloud && g.cloud.game && (!ok || ok(g)); }).sort(function (a, b) { return a.cloud.game < b.cloud.game ? -1 : 1; });
    if (!c.length) return null;
    return c[hash('easygames-daily-' + day) % c.length];
  }
  function dailyBody(fs, uid, day, nick, score, order, game) {
    return { writes: [{ update: { name: docName(fs, 'daily/' + day + '/e/' + uid), fields: { n: str(nick), s: { doubleValue: Number(score) }, o: str(order), g: str(cleanGame(game)) } }, updateTransforms: T }] };
  }
  function dailyQuery(order) { return { structuredQuery: { from: [{ collectionId: 'e' }], orderBy: [{ field: { fieldPath: 's' }, direction: order === 'asc' ? 'ASCENDING' : 'DESCENDING' }], limit: 25 } }; }
  function dailyListUrl(fs, day) { return fs.replace(/\/$/, '') + '/daily/' + day + ':runQuery'; }

  // ---- Profil, Freunde, Einladungen ----
  var EMOJIS = ['🎮', '🕹️', '🦊', '🐼', '🐸', '🦄', '🐙', '🦁', '🐯', '🐧', '🚀', '⭐', '🔥', '🌈', '🍀', '👑', '🎯', '🎲', '🧩', '🏆', '🤖', '👾', '🐲', '🦉'];
  function profileBody(fs, uid, p) {
    var f = { n: str(p.n), e: str(p.e || '🎮') };
    if (p.r) f.r = str(String(p.r).slice(0, 24)); if (p.p != null) f.p = int(Math.max(0, p.p)); if (p.a != null) f.a = int(Math.max(0, p.a)); if (p.g) f.g = str(String(p.g).slice(0, 200));
    return { writes: [{ update: { name: docName(fs, 'profiles/' + uid), fields: f }, updateTransforms: T }] };
  }
  function friendBody(fs, uid, fid, nick) { return { writes: [{ update: { name: docName(fs, 'friends/' + uid + '/f/' + fid), fields: { n: str(String(nick || '').slice(0, 20)), t: int(Date.now()) } } }] }; }
  function friendsUrl(fs, uid) { return fs.replace(/\/$/, '') + '/friends/' + uid + ':runQuery'; }
  function friendsQuery() { return { structuredQuery: { from: [{ collectionId: 'f' }], limit: 100 } }; }
  function inviteBody(fs, from, nick, to, game) {
    return { writes: [
      { update: { name: docName(fs, 'invites/' + to + '/i/' + rid()), fields: { f: str(from), n: str(nick), g: str(cleanGame(game)) } }, updateTransforms: T, currentDocument: { exists: false } },
      { update: { name: docName(fs, 'invite_last/' + from), fields: {} }, updateTransforms: T }
    ] };
  }
  function invitesUrl(fs, uid) { return fs.replace(/\/$/, '') + '/invites/' + uid + ':runQuery'; }
  function invitesQuery() { return { structuredQuery: { from: [{ collectionId: 'i' }], orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: 20 } }; }

  var api = { ADMIN_EMAIL: ADMIN_EMAIL, EMOJIS: EMOJIS, rid: rid, project: project, docName: docName, commitUrl: commitUrl, rootQueryUrl: rootQueryUrl, dayNum: dayNum, dayIndex: dayIndex, cleanGame: cleanGame,
    statId: statId, statUrl: statUrl, statCommit: statCommit, statQuery: statQuery, parseDocs: parseDocs, aggregate: aggregate, simple: simple,
    dailyPick: dailyPick, dailyBody: dailyBody, dailyQuery: dailyQuery, dailyListUrl: dailyListUrl,
    profileBody: profileBody, friendBody: friendBody, friendsUrl: friendsUrl, friendsQuery: friendsQuery, inviteBody: inviteBody, invitesUrl: invitesUrl, invitesQuery: invitesQuery };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaEngage = api;
})(typeof window !== 'undefined' ? window : this);
