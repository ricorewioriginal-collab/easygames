/*! AnMaCha Chat – Firestore-REST-Bausteine für den easygames-Chat (chat.html): Abfragen und Schreibvorgänge als reine Funktionen ohne DOM
 *  (Test: node tools/test-chat.mjs; gegen die echten Regeln: ricoville-src/firebase/chat.rules.test.mjs). Regeln: cloud/firestore.rules (Abschnitt „easygames-Chat“).
 *  Aufbau: chat/<raum>/m/<id> {u,n,x,t}, chat_last/<uid> {t} (Flutschutz), chat_online/<uid> {n,t}, chat_reports/<id>, chat_ban/<uid>, chat_admin/<uid>. */
(function (root) {
  'use strict';
  var ROOMS = [['lobby', '💬 Allgemein'], ['mitspieler', '🎮 Mitspieler gesucht'], ['tipps', '💡 Tipps & Hilfe']];
  var ROOM_RE = /^[a-z0-9-]{1,40}$/;
  function str(v) { return { stringValue: String(v) }; }
  function rid() {
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '', i, r = new Uint8Array(20);
    try { (root.crypto || {}).getRandomValues(r); } catch (e) { for (i = 0; i < 20; i++) r[i] = Math.floor(Math.random() * 256); }
    for (i = 0; i < 20; i++) s += a[r[i] % a.length];
    return s;
  }
  // fs = Cloud.FS ("https://firestore.googleapis.com/v1/projects/<p>/databases/(default)/documents/")
  function project(fs) { var m = /projects\/([^/]+)\//.exec(fs); return m ? m[1] : ''; }
  function docName(fs, path) { return 'projects/' + project(fs) + '/databases/(default)/documents/' + path; }
  function serverTime(path) { return [{ fieldPath: 't', setToServerValue: 'REQUEST_TIME' }]; }
  function commitUrl(fs) { return fs.replace(/\/$/, '') + ':commit'; }

  // Nachricht senden: Nachricht + Flutschutz-Dokument in EINEM Schreibvorgang (verlangen die Regeln)
  function sendBody(fs, room, uid, nick, text, id) {
    if (!ROOM_RE.test(room)) throw new Error('Raum');
    id = id || rid();
    return { id: id, body: { writes: [
      { update: { name: docName(fs, 'chat/' + room + '/m/' + id), fields: { u: str(uid), n: str(nick), x: str(text) } }, updateTransforms: serverTime(), currentDocument: { exists: false } },
      { update: { name: docName(fs, 'chat_last/' + uid), fields: {} }, updateTransforms: serverTime() }
    ] } };
  }
  // Lebenszeichen im Chat (Online-Liste)
  function presenceBody(fs, uid, nick) {
    return { writes: [{ update: { name: docName(fs, 'chat_online/' + uid), fields: { n: str(nick) } }, updateTransforms: serverTime() }] };
  }
  function reportBody(fs, room, msg, reporter) {
    return { writes: [{ update: { name: docName(fs, 'chat_reports/' + rid()), fields: { room: str(room), m: str(msg.id), u: str(msg.u), x: str(msg.x), r: str(reporter) } }, updateTransforms: serverTime(), currentDocument: { exists: false } }] };
  }
  function banBody(fs, uid) { return { writes: [{ update: { name: docName(fs, 'chat_ban/' + uid), fields: {} }, updateTransforms: serverTime() }] }; }

  // Abfragen: Start = neueste 50 (absteigend, dann umdrehen), danach nur neuere als die zuletzt gesehene Zeit
  function listQuery(after) {
    var q = { from: [{ collectionId: 'm' }], limit: after ? 60 : 50 };
    if (after) { q.where = { fieldFilter: { field: { fieldPath: 't' }, op: 'GREATER_THAN', value: { timestampValue: after } } }; q.orderBy = [{ field: { fieldPath: 't' }, direction: 'ASCENDING' }]; }
    else q.orderBy = [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }];
    return { structuredQuery: q };
  }
  function roomQueryUrl(fs, room) { return fs.replace(/\/$/, '') + '/chat/' + room + ':runQuery'; }
  function onlineQuery(sinceMs) {
    return { structuredQuery: { from: [{ collectionId: 'chat_online' }], where: { fieldFilter: { field: { fieldPath: 't' }, op: 'GREATER_THAN', value: { timestampValue: new Date(sinceMs).toISOString() } } }, orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: 60 } };
  }
  function rootQueryUrl(fs) { return fs.replace(/\/$/, '') + ':runQuery'; }

  function val(f, k) { var v = f && f[k]; return v ? (v.stringValue != null ? v.stringValue : v.timestampValue != null ? v.timestampValue : '') : ''; }
  // runQuery-Antwort → [{ id, u, n, x, ts, t(ms) }] (aufsteigend nach Zeit)
  function parse(rows, asc) {
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (r) {
      var d = r && r.document; if (!d || !d.fields) return;
      var ts = val(d.fields, 't'), t = Date.parse(ts);
      out.push({ id: d.name.split('/').pop(), u: val(d.fields, 'u'), n: val(d.fields, 'n'), x: val(d.fields, 'x'), ts: ts, t: isFinite(t) ? t : 0 });
    });
    out.sort(function (a, b) { return a.t - b.t || (a.id < b.id ? -1 : 1); });
    return out;
  }
  function parseOnline(rows) {
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (r) { var d = r && r.document; if (d && d.fields) out.push({ u: d.name.split('/').pop(), n: val(d.fields, 'n'), t: Date.parse(val(d.fields, 't')) || 0 }); });
    return out;
  }
  function roomTitle(room, games) {
    var i; for (i = 0; i < ROOMS.length; i++) if (ROOMS[i][0] === room) return ROOMS[i][1];
    var m = /^g-(.+)$/.exec(room), g = null;
    (games || []).forEach(function (x) { if (m && x.cloud && x.cloud.game === m[1]) g = x; });
    return g ? (g.icon || '🎮') + ' ' + String(g.title || m[1]).split(' – ')[0] : '💬 ' + room;
  }
  var api = { ROOMS: ROOMS, ROOM_RE: ROOM_RE, rid: rid, project: project, docName: docName, commitUrl: commitUrl, sendBody: sendBody, presenceBody: presenceBody, reportBody: reportBody, banBody: banBody, listQuery: listQuery, roomQueryUrl: roomQueryUrl, onlineQuery: onlineQuery, rootQueryUrl: rootQueryUrl, parse: parse, parseOnline: parseOnline, roomTitle: roomTitle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaChat = api;
})(typeof window !== 'undefined' ? window : this);
