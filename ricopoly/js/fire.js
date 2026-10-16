/*! RicoPoly 3D – Firebase im Spark-Tarif, ohne SDK (nur REST): anonyme Anmeldung, weltweite Rangliste und
 * Vermittlung für Online-Räume. Firestore-Regeln: ../cloud/firestore.rules (Abschnitt RicoPoly).
 * Ist die anonyme Anmeldung in der Firebase-Konsole aus, meldet available() false und das Spiel nutzt PeerJS. */
(function (root) {
  'use strict';
  // Öffentliche Web-Konfiguration wie in ../cloud/anmacha-cloud.js (der apiKey ist öffentlich gedacht, Schutz sind die Regeln)
  var CFG = { projectId: 'ricorewi-games-save', apiKey: 'AIzaSyB-4IuC85PsOrvsY0GkBGsCIXdW_i1SrnM' };
  var EMU = root.RICOPOLY_FIRE_EMU || null;   // nur für Tests: { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' }
  var GA = EMU ? EMU.auth + '/' : 'https://';
  var DOCS = 'projects/' + CFG.projectId + '/databases/(default)/documents';
  var FS = (EMU ? EMU.fs : 'https://firestore.googleapis.com') + '/v1/' + DOCS;
  var KEY = 'ricopolyFire';   // bewusst außerhalb von "ricopoly.v1.": die Kennung gehört zum Gerät, nicht in den Cloud-Abgleich
  var LS = null; try { LS = root.localStorage; } catch (e) {}
  var sess = null, tok = null, exp = 0, signP = null, off = false;

  function load() { try { return JSON.parse(LS.getItem(KEY)) || null; } catch (e) { return null; } }
  function store(o) { try { if (o) LS.setItem(KEY, JSON.stringify(o)); else LS.removeItem(KEY); } catch (e) {} }
  function req(url, opt) {
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : {}; } catch (e) {}
        if (!r.ok) { var e = new Error((j && j.error && (j.error.message || j.error.status)) || 'HTTP ' + r.status); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function token() {
    if (off) return Promise.reject(new Error('off'));
    if (tok && Date.now() < exp) return Promise.resolve(tok);
    if (signP) return signP;
    sess = sess || load();
    var refresh = !!(sess && sess.rt);
    var p = refresh
      ? req(GA + 'securetoken.googleapis.com/v1/token?key=' + CFG.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(sess.rt) })
        .then(function (j) { return { id: j.id_token, rt: j.refresh_token, uid: j.user_id, ex: +j.expires_in }; })
      : req(GA + 'identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + CFG.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' })
        .then(function (j) { return { id: j.idToken, rt: j.refreshToken, uid: j.localId, ex: +j.expiresIn }; });
    signP = p.then(function (r) {
      sess = { rt: r.rt, uid: r.uid }; store(sess); tok = r.id; exp = Date.now() + Math.max(60, (r.ex || 3600) - 120) * 1000; signP = null;
      return tok;
    }, function (e) {
      signP = null;
      if (refresh && e.status === 400) { sess = null; store(null); return token(); }   // Kennung ungültig: einmal neu anmelden
      if (/ADMIN_ONLY_OPERATION|OPERATION_NOT_ALLOWED|CONFIGURATION_NOT_FOUND|API_KEY|PROJECT_NOT_FOUND/.test(e.message)) off = true;
      throw e;
    });
    return signP;
  }
  function uid() { return token().then(function () { return sess.uid; }); }

  // Firestore-Werte (nur die hier gebrauchten Typen)
  function enc(v) {
    if (typeof v === 'string') return { stringValue: v };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return { integerValue: String(Math.floor(v)) };
    return { nullValue: null };
  }
  function dec(f) {
    var o = {}, k, v;
    for (k in f || {}) {
      v = f[k];
      o[k] = 'stringValue' in v ? v.stringValue : 'integerValue' in v ? +v.integerValue : 'booleanValue' in v ? v.booleanValue
        : 'timestampValue' in v ? Date.parse(v.timestampValue) : null;
    }
    return o;
  }
  function api(path, method, body) {
    return token().then(function (t) {
      return req(FS + path, { method: method || 'GET', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    });
  }
  function get(path) { return api('/' + path).then(function (j) { return dec(j.fields); }, function (e) { if (e.status === 404) return null; throw e; }); }
  function del(path) { return api('/' + path, 'DELETE'); }
  // Schreibt das ganze Dokument; das Feld t setzt der Server (die Regeln prüfen t == request.time). pre: { exists: true|false }
  function write(path, data, pre) {
    var fields = {}, k; for (k in data) fields[k] = enc(data[k]);
    var w = { update: { name: DOCS + '/' + path, fields: fields }, updateTransforms: [{ fieldPath: 't', setToServerValue: 'REQUEST_TIME' }] };
    if (pre) w.currentDocument = pre;
    return api(':commit', 'POST', { writes: [w] });
  }
  function query(parent, q) {
    return api((parent ? '/' + parent : '') + ':runQuery', 'POST', { structuredQuery: q }).then(function (rows) {
      return (rows || []).filter(function (r) { return r.document; }).map(function (r) { var d = dec(r.document.fields); d.id = r.document.name.split('/').pop(); return d; });
    });
  }
  function clean(s) { return String(s == null ? '' : s).replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24); }

  // ---------- Weltweite Rangliste ----------
  // Ein Eintrag je Gerät (anonyme Kennung); die Regeln erlauben je Partie genau +1 Partie und höchstens +1 Sieg.
  function submit(name, char, won) {
    return uid().then(function (u) {
      var path = 'ricopoly_board/' + u;
      return get(path).then(function (cur) {
        return write(path, { n: clean(name) || '?', c: String(char || '').slice(0, 16), w: (cur ? cur.w : 0) + (won ? 1 : 0), g: (cur ? cur.g : 0) + 1 }, { exists: !!cur });
      }).then(function (r) { topCache = null; return r; });
    });
  }
  var topCache = null;
  function top(n) {
    if (topCache && Date.now() - topCache.t < 120000) return Promise.resolve(topCache.rows);   // spart Lesezugriffe
    return query('', { from: [{ collectionId: 'ricopoly_board' }], orderBy: [{ field: { fieldPath: 'w' }, direction: 'DESCENDING' }], limit: n || 25 }).then(function (rows) {
      rows = rows.map(function (r) { return { uid: r.id, name: clean(r.n) || '?', char: String(r.c || ''), wins: Math.max(0, r.w | 0), games: Math.max(0, r.g | 0) }; });
      topCache = { t: Date.now(), rows: rows };
      return rows;
    });
  }

  root.RicoFire = {
    available: function () { return token().then(function () { return true; }, function () { return false; }); },
    isOff: function () { return off; }, myUid: function () { return sess && sess.uid; },
    uid: uid, get: get, del: del, write: write, query: query, submit: submit, top: top,
    flush: function () { topCache = null; }
  };
})(typeof self !== 'undefined' ? self : this);
