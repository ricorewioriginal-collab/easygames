/*! AnMaCha Fehlermeldungen – Bausteine für bug.html (Firestore-REST, reine Funktionen). Regeln: cloud/firestore.rules (Abschnitt „Fehlermeldungen“);
 *  Test: node tools/test-bug.cjs (Browser) und ricoville-src/firebase/bug.rules.test.mjs (Regeln). Aufbau: bugs/<id> {u,g,c,x,i,p,t}, bug_last/<uid> {t}. */
(function (root) {
  'use strict';
  var KINDS = [['absturz', '💥 Absturz / hängt'], ['anzeige', '🖼️ Anzeige / Grafik'], ['steuerung', '🎮 Steuerung'], ['ton', '🔊 Ton'], ['online', '🌐 Online / Mehrspieler'], ['speichern', '☁️ Speichern / Anmeldung'], ['sonstiges', '❓ Sonstiges']];
  var REPO = 'https://github.com/ricorewioriginal-collab/easygames/issues/new';
  function str(v) { return { stringValue: String(v) }; }
  function project(fs) { var m = /projects\/([^/]+)\//.exec(fs); return m ? m[1] : ''; }
  function docName(fs, path) { return 'projects/' + project(fs) + '/databases/(default)/documents/' + path; }
  function rid() {
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '', i, r = new Uint8Array(20);
    try { (root.crypto || {}).getRandomValues(r); } catch (e) { for (i = 0; i < 20; i++) r[i] = Math.floor(Math.random() * 256); }
    for (i = 0; i < 20; i++) s += a[r[i] % a.length];
    return s;
  }
  var T = [{ fieldPath: 't', setToServerValue: 'REQUEST_TIME' }];
  function cut(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, n); }
  // Meldung + Flutschutz-Dokument in EINEM Schreibvorgang (verlangen die Regeln). r = { game, kind, text, info, page }
  function sendBody(fs, uid, r) {
    var f = { u: str(uid), g: str(cut(r.game, 40)), c: str(r.kind), x: str(cut(r.text, 1000).trim()) };
    if (r.info) f.i = str(cut(r.info, 600)); if (r.page) f.p = str(cut(r.page, 200));
    return { writes: [
      { update: { name: docName(fs, 'bugs/' + rid()), fields: f }, updateTransforms: T, currentDocument: { exists: false } },
      { update: { name: docName(fs, 'bug_last/' + uid), fields: {} }, updateTransforms: T }
    ] };
  }
  function commitUrl(fs) { return fs.replace(/\/$/, '') + ':commit'; }
  function rootQueryUrl(fs) { return fs.replace(/\/$/, '') + ':runQuery'; }
  function listQuery(coll) { return { structuredQuery: { from: [{ collectionId: coll || 'bugs' }], orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: 50 } }; }
  function val(f, k) { var v = f && f[k]; return v ? (v.stringValue != null ? v.stringValue : v.timestampValue != null ? v.timestampValue : '') : ''; }
  function parse(rows) {
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (r) { var d = r && r.document; if (!d || !d.fields) return; var f = d.fields; out.push({ id: d.name.split('/').pop(), u: val(f, 'u'), g: val(f, 'g'), c: val(f, 'c'), x: val(f, 'x'), i: val(f, 'i'), p: val(f, 'p'), room: val(f, 'room'), m: val(f, 'm'), r: val(f, 'r'), t: Date.parse(val(f, 't')) || 0 }); });
    return out;
  }
  // Technische Angaben, die mitgeschickt werden (Gerät/Browser/App, Bildschirm, Sprache, Adresse) – keine Spielstände, keine Konto-Daten
  function deviceInfo(w) {
    w = w || root; var n = w.navigator || {}, s = w.screen || {}, l = w.location || {}, o = { ua: cut(n.userAgent, 220), scr: (s.width || 0) + 'x' + (s.height || 0) + '@' + (w.devicePixelRatio || 1), lang: cut(n.language, 12), host: cut(l.hostname, 60) };
    try { o.app = !!(w.EasyGamesApp || /(RicoReWi|EasyGames)App\//.test(n.userAgent || '') || /appassets/.test(l.hostname || '')); } catch (e) {}
    try { o.tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    return JSON.stringify(o);
  }
  // Ausweg ohne Anmeldung: vorausgefülltes GitHub-Issue
  function githubUrl(r) {
    var title = '[' + (r.game || 'easygames') + '] ' + cut(r.text, 60).replace(/\s+/g, ' ').trim();
    var body = '**Art:** ' + r.kind + '\n**Spiel:** ' + (r.game || '-') + '\n\n' + cut(r.text, 1000) + (r.info ? '\n\n<details><summary>Technische Angaben</summary>\n\n```json\n' + cut(r.info, 600) + '\n```\n</details>' : '');
    return REPO + '?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body) + '&labels=bug';
  }
  var api = { KINDS: KINDS, sendBody: sendBody, commitUrl: commitUrl, rootQueryUrl: rootQueryUrl, listQuery: listQuery, parse: parse, deviceInfo: deviceInfo, githubUrl: githubUrl, docName: docName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaBug = api;
})(typeof window !== 'undefined' ? window : this);
