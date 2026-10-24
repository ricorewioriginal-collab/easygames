/*! easygames – Online-Kopplung über Firebase (gleiches Projekt wie ../cloud/anmacha-cloud.js und RicoPoly).
 * Ersetzt window.Peer durch eine PeerJS-kompatible Klasse: Firebase vermittelt nur den Verbindungsaufbau
 * (WebRTC-Angebot und -Antwort in Firestore, anonyme Anmeldung, nur REST, ohne SDK), gespielt wird direkt Gerät zu Gerät.
 * Ist Firebase nicht erreichbar oder sind die Regeln noch nicht veröffentlicht, läuft alles wie bisher über PeerJS
 * (wird dann erst bei Bedarf aus ../vendor/ geladen). Einbinden vor dem Spielcode:
 *   <script src="../cloud/fire-peer.js"></script>
 * Regeln: cloud/firestore.rules (Abschnitt „Online-Kopplung“). Tests: node tools/test-fire-peer.js */
(function (W) {
  'use strict';
  if (!W || W.FirePeer) return;
  // Mehrspieler-Regel: Einladungs- und Spiellinks zeigen immer auf die easygames-Homepage, nie auf eine lokale
  // App-Adresse (Android-App appassets…, file://, localhost, LAN). So öffnet jedes Gerät den Link, egal ob Browser, App oder TV.
  // EasyGamesLink.share(url) macht aus jeder Adresse dieses Spiels die Homepage-Adresse (Pfad, ?… und #… bleiben gleich).
  // Andere Homepage nur über window.EASYGAMES_PUBLIC_BASE (oder EasyGamesConfig.publicBase). Gleiche Adresse wie in ../device.js.
  // Eingebettet mit ?eg_share=<Adresse> (z. B. https://www.ricorewi-radio.de/#games/<id>): Teilen-Links für DIESES Spiel zeigen auf die
  // einbindende Seite. Gilt nur im iframe und nur, wenn die Adresse zur einbindenden Seite passt; Einladungs- und TV-Links (mit ?… oder #…)
  // bleiben auf der easygames-Homepage. Gleicher Baustein in device.js und cloud/fire-peer.js.
  if (!W.EasyGamesEmbedShare) W.EasyGamesEmbedShare = (function () {
    var dir = function (p) { var m = /\/([^\/]+)\/(?:index\.html)?$/.exec(p || ''); return m ? m[1] : ''; };
    var own = dir(W.location && W.location.pathname), K = 'eg-embed-share:' + own, v = null, m = null;
    try {
      m = /[?&]eg_share=([^&#]*)/.exec(W.location.search);
      v = m ? decodeURIComponent(m[1]) : W.sessionStorage.getItem(K);
      if (v) {
        var u = new URL(v), ref = W.document.referrer ? new URL(W.document.referrer).origin : '';
        v = W.parent !== W && /^https?:$/.test(u.protocol) && (!ref || ref === u.origin || ref === W.location.origin) ? u.href : null;
      }
    } catch (e) { v = null; }
    if (v && m) try { W.sessionStorage.setItem(K, v); } catch (e) { }
    function link(u) {
      if (!v || !own) return u;
      try { var x = new URL(u, W.location.href), q = new URLSearchParams(x.search); q.delete('eg_build'); q.delete('eg_share'); return dir(x.pathname) === own && !q.toString() && !x.hash ? v : u; } catch (e) { return u; }
    }
    return { url: function () { return v; }, link: link };
  })();
  if (!W.EasyGamesLink) (function () {
    var HOME = 'https://ricorewioriginal-collab.github.io/easygames/';
    var me = W.document && W.document.currentScript && W.document.currentScript.src;
    var ROOT = me ? new URL('../', me).href : '';   // Wurzel von easygames auf dem aktuellen Gerät (Datei liegt in cloud/)
    function home() {
      var c = W.EASYGAMES_PUBLIC_BASE || (W.EasyGamesConfig && W.EasyGamesConfig.publicBase);
      return c ? (/\/$/.test(c) ? c : c + '/') : HOME;
    }
    function share(u) {
      try {
        var x = new URL(u || W.location.href, W.location && W.location.href), h = home(), rel = null, m;
        if (x.href.indexOf(h) === 0) return W.EasyGamesEmbedShare.link(x.href);
        if (ROOT && x.href.indexOf(ROOT) === 0) rel = x.href.slice(ROOT.length);
        else if ((m = /\/easygames\/(.*)$/.exec(x.pathname))) rel = m[1] + x.search + x.hash;
        return W.EasyGamesEmbedShare.link(rel === null ? x.href : h + rel);
      } catch (e) { return u; }
    }
    W.EasyGamesLink = { home: home, share: share };
  })();
  var CFG = { projectId: 'ricorewi-games-save', apiKey: 'AIzaSyB-4IuC85PsOrvsY0GkBGsCIXdW_i1SrnM' };   // öffentlich gedacht, Schutz sind die Regeln
  var EMU = W.FIRE_PEER_EMU || null;   // nur für Tests: { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' }
  var GA = EMU ? EMU.auth + '/' : 'https://';
  var DOCS = 'projects/' + CFG.projectId + '/databases/(default)/documents';
  var FS = (EMU ? EMU.fs : 'https://firestore.googleapis.com') + '/v1/' + DOCS;
  var KEY = 'easygamesFire';            // anonyme Kennung des Geräts (bewusst kein Spiel-Präfix, also nicht im Cloud-Abgleich)
  var COL = 'p2p', STALE = 15 * 60000, BEAT = 5 * 60000, CHUNK = 16000;
  // Gleiche STUN/TURN-Server wie PeerJS 1.5.4, damit auch Handy-Netze verbinden
  var ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' }];
  var ME = W.document && W.document.currentScript && W.document.currentScript.src;
  var PJS = ME ? new URL('../vendor/peerjs-1.5.4.min.js', ME).href : 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  var LS = null; try { LS = W.localStorage; } catch (e) {}
  var Orig = typeof W.Peer === 'function' ? W.Peer : null;
  var FORCE_PJS = /[?&]p2p=peerjs\b/.test((W.location && W.location.search) || '');
  function noop() {}
  function rnd(n) { var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = ''; for (var i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ---------- Firebase (REST) ----------
  var sess = null, tok = null, exp = 0, signP = null, off = false, blocked = false;
  function load() { try { return JSON.parse(LS.getItem(KEY)) || null; } catch (e) { return null; } }
  function store(o) { try { if (o) LS.setItem(KEY, JSON.stringify(o)); else LS.removeItem(KEY); } catch (e) {} }
  function req(url, opt) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null, to = ac && setTimeout(function () { ac.abort(); }, 9000);
    if (ac) opt.signal = ac.signal;
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        clearTimeout(to);
        var j = null; try { j = t ? JSON.parse(t) : {}; } catch (e) {}
        if (!r.ok) { var e = new Error((j && j.error && (j.error.message || j.error.status)) || 'HTTP ' + r.status); e.status = r.status; throw e; }
        return j;
      });
    }, function (e) { clearTimeout(to); throw e; });
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
  function enc(v) { return typeof v === 'string' ? { stringValue: v } : typeof v === 'number' ? { integerValue: String(Math.floor(v)) } : { nullValue: null }; }
  function dec(f) {
    var o = {}, k, v;
    for (k in f || {}) {
      v = f[k];
      o[k] = 'stringValue' in v ? v.stringValue : 'integerValue' in v ? +v.integerValue : 'timestampValue' in v ? Date.parse(v.timestampValue) : null;
    }
    return o;
  }
  function api(path, method, body, keepalive) {
    return token().then(function (t) {
      return req(FS + path, { method: method || 'GET', keepalive: !!keepalive, headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    });
  }
  function get(path) { return api('/' + path).then(function (j) { return dec(j.fields); }, function (e) { if (e.status === 404) return null; throw e; }); }
  function del(path, keepalive) { return api('/' + path, 'DELETE', null, keepalive); }
  // Schreibt Felder; t setzt der Server (die Regeln prüfen t == request.time). pre: { exists: true|false }, mask: nur diese Felder ändern
  function write(path, data, pre, mask) {
    var fields = {}, k; for (k in data) fields[k] = enc(data[k]);
    var w = { update: { name: DOCS + '/' + path, fields: fields }, updateTransforms: [{ fieldPath: 't', setToServerValue: 'REQUEST_TIME' }] };
    if (pre) w.currentDocument = pre;
    if (mask) w.updateMask = { fieldPaths: mask };
    return api(':commit', 'POST', { writes: [w] });
  }
  function query(parent, q) {
    return api((parent ? '/' + parent : '') + ':runQuery', 'POST', { structuredQuery: q }).then(function (rows) {
      return (rows || []).filter(function (r) { return r.document; }).map(function (r) { var d = dec(r.document.fields); d.id = r.document.name.split('/').pop(); return d; });
    });
  }
  // Kennung belegen: frei → anlegen; eigene oder seit 15 min verwaiste → übernehmen; sonst false
  function claim(id, me) {
    var path = COL + '/' + id;
    return write(path, { h: me }, { exists: false }).then(function () { return true; }, function (e) {
      if (e.status === 403) { blocked = true; throw e; }   // Regeln noch nicht veröffentlicht → PeerJS
      if (e.status !== 409 && e.status !== 400) throw e;
      return get(path).then(function (cur) {
        if (!cur) throw e;
        if (cur.h !== me && !(Date.now() - cur.t > STALE)) return false;
        return write(path, { h: me }, { exists: true }).then(function () { return true; }, function (x) { if (x.status === 403) return false; throw x; });
      });
    });
  }
  function fireOk(opt) { return !FORCE_PJS && !off && !blocked && !(opt && opt.host) && typeof fetch === 'function' && typeof W.RTCPeerConnection === 'function'; }

  // ---------- PeerJS als Rückfall (erst bei Bedarf geladen) ----------
  var pjP = null;
  function loadPeerJS() {
    if (Orig) return Promise.resolve(Orig);
    return pjP || (pjP = new Promise(function (res, rej) {
      var s = W.document.createElement('script'); s.src = PJS; s.async = true;
      s.onload = function () { if (Orig) res(Orig); else { pjP = null; rej(new Error('peerjs')); } };
      s.onerror = function () { pjP = null; rej(new Error('peerjs')); };
      W.document.head.appendChild(s);
    }));
  }

  // ---------- Ereignisse wie bei PeerJS ----------
  function Em() {}
  Em.prototype.on = function (e, f) { var m = this._ev || (this._ev = {}); (m[e] || (m[e] = [])).push(f); return this; };
  Em.prototype.addListener = Em.prototype.on;
  Em.prototype.once = function (e, f) { var self = this; function g(a) { self.off(e, g); f.call(self, a); } return this.on(e, g); };
  Em.prototype.off = function (e, f) { var l = this._ev && this._ev[e]; if (l) this._ev[e] = f ? l.filter(function (g) { return g !== f; }) : []; return this; };
  Em.prototype.removeListener = Em.prototype.off;
  Em.prototype.removeAllListeners = function (e) { if (e) { if (this._ev) delete this._ev[e]; } else this._ev = {}; return this; };
  Em.prototype.emit = function (e, a) {
    var l = this._ev && this._ev[e], self = this; if (!l || !l.length) return false;
    l.slice().forEach(function (f) { try { f.call(self, a); } catch (x) { setTimeout(function () { throw x; }); } });
    return true;
  };
  function err(type, msg) { var e = new Error(msg || type); e.type = type; return e; }

  // ---------- Datenverbindung (Schnittstelle wie PeerJS DataConnection) ----------
  function Conn(peerId, opt) {
    opt = opt || {};
    this.peer = peerId; this.metadata = opt.metadata; this.label = opt.label || ''; this.reliable = true; this.serialization = 'json';
    this.type = 'data'; this.connectionId = 'fc_' + rnd(12); this.open = false; this.done = false;
    this.peerConnection = null; this.dataChannel = null; this._rc = null; this._parts = {};
  }
  Conn.prototype = Object.create(Em.prototype);
  Conn.prototype._channel = function (pc, dc) {
    var self = this; this.peerConnection = pc;
    function wire(d) {
      self.dataChannel = d; d.binaryType = 'arraybuffer';
      d.onopen = function () { if (self.done) return; self.open = true; self.emit('open'); };
      d.onmessage = function (e) { self._recv(e.data); };
      d.onclose = function () { self.close(); };
      d.onerror = function () { self.emit('error', err('connection-closed', 'Datenkanal gestört')); };
    }
    if (dc) wire(dc); else pc.ondatachannel = function (e) { wire(e.channel); };
    pc.onconnectionstatechange = function () { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') self.close(); };
  };
  Conn.prototype._real = function (rc) {   // PeerJS-Verbindung durchreichen (Rückfall)
    var self = this; this._rc = rc;
    rc.on('open', function () { if (self.done) return; self.open = true; self.peerConnection = rc.peerConnection; self.dataChannel = rc.dataChannel; self.emit('open'); });
    rc.on('data', function (d) { self.emit('data', d); });
    rc.on('close', function () { self.close(); });
    rc.on('error', function (e) { self.emit('error', e); });
  };
  Conn.prototype._recv = function (s) {
    var b = this._bin;
    if (typeof s !== 'string') {   // Binärdaten (ArrayBuffer) kommen unverändert an, große in Teilen nach einer Ankündigung
      if (!(s instanceof ArrayBuffer)) return;
      if (!b) { this.emit('data', s); return; }
      b.l.push(new Uint8Array(s)); b.size += s.byteLength;
      if (b.l.length < b.n) return;
      this._bin = null;
      var all = new Uint8Array(b.size), o = 0;
      b.l.forEach(function (x) { all.set(x, o); o += x.byteLength; });
      this.emit('data', all.buffer); return;
    }
    if (s.charCodeAt(0) === 2) { var k = +s.slice(1); this._bin = k > 0 && k < 4096 ? { n: k, l: [], size: 0 } : null; return; }
    if (s.charCodeAt(0) === 1) {   // Teilstück großer Nachrichten: \x01id,i,n,Daten
      var a = s.indexOf(','), b = s.indexOf(',', a + 1), c = s.indexOf(',', b + 1);
      var id = s.slice(1, a), i = +s.slice(a + 1, b), n = +s.slice(b + 1, c), p = this._parts[id] || (this._parts[id] = { n: 0, l: [] });
      if (!(n > 0 && n < 4096 && i >= 0 && i < n) || p.l[i] != null) return;
      p.l[i] = s.slice(c + 1);
      if (++p.n < n) return;
      delete this._parts[id]; s = p.l.join('');
    }
    var v; try { v = JSON.parse(s); } catch (e) { return; }
    this.emit('data', v);
  };
  Conn.prototype.send = function (d) {
    if (this._rc) return this._rc.send(d);
    var dc = this.dataChannel; if (!this.open || !dc || dc.readyState !== 'open') return;
    if (d instanceof ArrayBuffer || ArrayBuffer.isView(d)) {   // Binär: direkt, über 60 kB angekündigt und in Teilen
      var u = d instanceof ArrayBuffer ? new Uint8Array(d) : new Uint8Array(d.buffer, d.byteOffset, d.byteLength), BIN = 60000;
      if (u.byteLength <= BIN) { dc.send(u.byteOffset || u.byteLength !== u.buffer.byteLength ? u.slice() : u.buffer); return; }
      dc.send('\u0002' + Math.ceil(u.byteLength / BIN));
      for (var j = 0; j < u.byteLength; j += BIN) dc.send(u.slice(j, j + BIN));
      return;
    }
    var s = JSON.stringify(d === undefined ? null : d);
    if (s.length <= CHUNK) { dc.send(s); return; }
    for (var id = rnd(6), n = Math.ceil(s.length / CHUNK), i = 0; i < n; i++) dc.send('\u0001' + id + ',' + i + ',' + n + ',' + s.slice(i * CHUNK, (i + 1) * CHUNK));
  };
  Object.defineProperty(Conn.prototype, 'bufferSize', { get: function () { return this._rc ? this._rc.bufferSize : this.dataChannel ? this.dataChannel.bufferedAmount : 0; } });
  Conn.prototype.close = function () {
    if (this.done) return; this.done = true;
    var was = this.open; this.open = false;
    if (this._gone) this._gone();
    if (this._rc) { try { this._rc.close(); } catch (e) {} }
    try { if (this.dataChannel) this.dataChannel.close(); } catch (e) {}
    try { if (this.peerConnection) this.peerConnection.close(); } catch (e) {}
    if (was) this.emit('close');
  };
  function gathered(pc) {   // ohne Trickle-ICE: alle Kandidaten stehen im Angebot, so reicht je ein Schreibzugriff
    return new Promise(function (res) {
      if (pc.iceGatheringState === 'complete') return res();
      var to = setTimeout(res, 3000);
      pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') { clearTimeout(to); res(); } });
      pc.addEventListener('icecandidate', function (e) { if (e.candidate && / typ relay/.test(e.candidate.candidate)) { clearTimeout(to); to = setTimeout(res, 300); } });   // TURN da: nicht länger warten
    });
  }

  // ---------- Peer (Schnittstelle wie PeerJS) ----------
  function Peer(id, opt) {
    if (!(this instanceof Peer)) return new Peer(id, opt);
    if (id && typeof id === 'object') { opt = id; id = null; }
    var self = this;
    this.options = opt || {}; this.id = null; this.open = false; this.destroyed = false; this.disconnected = false;
    this.via = null;                          // 'firebase' oder 'peerjs'
    this._want = id ? String(id) : null; this._conns = []; this._seen = {}; this._act = Date.now(); this._beat = Date.now();
    this._ready = new Promise(function (r) { self._go = r; });
    setTimeout(function () { self._start(); }, 0);
  }
  Peer.prototype = Object.create(Em.prototype);
  Peer.prototype._rtc = function () { var c = this.options.config; return new W.RTCPeerConnection(c && c.iceServers ? c : { iceServers: ICE }); };
  Peer.prototype._start = function () {
    var self = this;
    if (this.destroyed) return;
    if (!fireOk(this.options) || (this._want && !/^[A-Za-z0-9_-]{3,64}$/.test(this._want))) return this._fallback();
    uid().then(function (me) {
      if (self.destroyed) return;
      self._uid = me;
      if (!self._want) return self._opened('fp' + rnd(18));
      return claim(self._want, me).then(function (ok) {
        if (self.destroyed) { if (ok) del(COL + '/' + self._want).catch(noop); return; }
        if (!ok) { self.destroy(); self.emit('error', err('unavailable-id', 'ID "' + self._want + '" is taken')); return; }
        self._host = true; self._opened(self._want); self._poll(); self._life();
      });
    }).catch(function () { if (!self.destroyed && !self.open) self._fallback(); });
  };
  Peer.prototype._opened = function (id) {
    this.via = 'firebase'; this.id = id; this.open = true; this._fire = true;
    this._go(); this.emit('open', id);
  };
  Peer.prototype._fallback = function () {
    var self = this;
    loadPeerJS().then(function (P) {
      if (self.destroyed) return;
      var r = self._pj = self._want ? new P(self._want, self.options) : new P(self.options);
      self.via = 'peerjs';
      r.on('open', function (id) { self.id = id; self.open = true; self.disconnected = false; self._go(); self.emit('open', id); });
      r.on('connection', function (c) { self.emit('connection', c); });
      r.on('call', function (c) { self.emit('call', c); });
      r.on('error', function (e) { self.emit('error', e); });
      r.on('disconnected', function (id) { self.disconnected = true; self.emit('disconnected', id); });
      r.on('close', function () { if (self.destroyed) return; self.destroyed = true; self.open = false; self.emit('close'); });
    }, function () { if (!self.destroyed) self.emit('error', err('network', 'Verbindung nicht möglich (PeerJS nicht ladbar)')); });
  };
  // Gastgeber: Beitrittswünsche abholen. In den ersten 2 min nach dem Öffnen und nach jedem Beitritt alle 2 s, danach bis 10 min alle 4 s,
  // wer länger wartet alle 8 s, im Hintergrund alle 30 s (spart Lesezugriffe: jede Abfrage zählt, auch ohne Treffer). Alle 5 min ein Lebenszeichen.
  Peer.prototype._poll = function () {
    var self = this; clearTimeout(this._pt);
    if (this.destroyed || this.disconnected) return;
    var hidden = W.document && W.document.hidden, idle = Date.now() - this._act, ms = hidden ? 30000 : idle < 120000 ? 2000 : idle < 600000 ? 4000 : 8000;
    this._pt = setTimeout(function () {
      if (self.destroyed || self.disconnected) return;
      if (Date.now() - self._beat > BEAT) { self._beat = Date.now(); claim(self.id, self._uid).catch(noop); }
      query(COL + '/' + self.id, { from: [{ collectionId: 'in_' + self._uid }], where: { fieldFilter: { field: { fieldPath: 'a' }, op: 'EQUAL', value: { stringValue: '' } } }, limit: 10 })
        .then(function (rows) { rows.forEach(function (r) { self._answer(r); }); }, noop)
        .then(function () { self._poll(); });
    }, ms);
  };
  Peer.prototype._answer = function (r) {
    if (this._seen[r.id]) return; this._seen[r.id] = 1; this._act = Date.now();
    var self = this, path = COL + '/' + this.id + '/in_' + this._uid + '/' + r.id;
    if (!r.o || Date.now() - r.t > 600000) { del(path).catch(noop); return; }   // liegengebliebene Anfrage
    var meta; try { meta = r.m ? JSON.parse(r.m) : undefined; } catch (e) {}
    var c = new Conn(/^[A-Za-z0-9_-]{1,64}$/.test(r.p || '') ? r.p : r.id, { metadata: meta, label: r.l }), pc = this._rtc();
    c._channel(pc, null); this._track(c);
    c.on('open', function () { self._act = Date.now(); });
    c.on('close', function () { self._act = Date.now(); });
    this.emit('connection', c);
    pc.setRemoteDescription({ type: 'offer', sdp: r.o })
      .then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); })
      .then(function () { return gathered(pc); })
      .then(function () { if (!c.done) return write(path, { a: pc.localDescription.sdp }, { exists: true }, ['a']); })
      .then(function () { setTimeout(function () { if (!c.open) c.close(); }, 30000); }, function () { c.close(); });
  };
  Peer.prototype._life = function () {   // Tab zu → Kennung freigeben; aus dem Zwischenspeicher zurück → wieder belegen
    var self = this;
    this._hide = function () { if (self._fire && self._host && !self.destroyed) del(COL + '/' + self.id, true).catch(noop); };
    this._show = function (e) { if (e.persisted && self._host && !self.destroyed) claim(self.id, self._uid).catch(noop); };
    W.addEventListener('pagehide', this._hide); W.addEventListener('pageshow', this._show);
  };
  Peer.prototype._track = function (c) { this._conns = this._conns.filter(function (x) { return !x.done; }); this._conns.push(c); };
  Peer.prototype.connect = function (rid, opt) {
    opt = opt || {};
    if (this._pj) return this._pj.connect(rid, opt);
    var self = this, c = new Conn(String(rid), opt);
    this._track(c);
    this._ready.then(function () { if (!self.destroyed && !c.done) self._dial(c, String(rid), opt); });
    return c;
  };
  // Gast: Gastgeber in Firebase suchen; nicht gefunden → über PeerJS versuchen (Gastgeber im Rückfall oder ältere Version)
  Peer.prototype._dial = function (c, rid, opt) {
    var self = this;
    if (this._pj) return c._real(this._pj.connect(rid, opt));
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(rid)) return this._viaPeerJS(c, rid, opt);
    get(COL + '/' + rid).then(function (h) {
      if (self.destroyed || c.done) return;
      if (!h || !h.h || Date.now() - h.t > STALE) return self._viaPeerJS(c, rid, opt);
      var pc = self._rtc(), path = COL + '/' + rid + '/in_' + h.h + '/' + self._uid + '_' + rnd(10), tries = 0;
      c._channel(pc, pc.createDataChannel(opt.label || 'eg', { ordered: true }));
      function fail() { if (c.done) return; c._gone = null; del(path).catch(noop); c.done = true; try { pc.close(); } catch (e) {} if (!self.destroyed) self.emit('error', err('peer-unavailable', 'Could not connect to peer ' + rid)); }
      c.on('open', function () { c._gone = null; del(path).catch(noop); });
      c._gone = function () { c._gone = null; del(path).catch(noop); };   // vor dem Öffnen abgebrochen: Angebot wegräumen
      var m = opt.metadata === undefined ? '' : JSON.stringify(opt.metadata);
      var doc = { o: '', a: '', p: self.id }; if (m && m.length <= 2000) doc.m = m; if (opt.label) doc.l = String(opt.label).slice(0, 40);
      return pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { return gathered(pc); })
        .then(function () { doc.o = pc.localDescription.sdp; return write(path, doc, { exists: false }); })
        .then(function poll() {
          if (self.destroyed || c.done || c.open) return;
          if (++tries > 25) return fail();
          return get(path).then(function (d) {
            if (c.done) return;
            if (!d) return fail();
            if (!d.a) return wait(tries < 10 ? 1000 : 2000).then(poll);
            return pc.setRemoteDescription({ type: 'answer', sdp: d.a }).then(function () { setTimeout(function () { if (!c.open) fail(); }, 15000); });
          });
        }).catch(fail);
    }, function (e) { if (e && e.status === 403) blocked = true; if (!self.destroyed && !c.done) self._viaPeerJS(c, rid, opt); });
  };
  Peer.prototype._viaPeerJS = function (c, rid, opt) {
    var self = this;
    if (!this._sideP) this._sideP = loadPeerJS().then(function (P) {
      return new Promise(function (res, rej) {
        var s = new P(self.options); self._side = s;
        s.on('open', function () { res(s); });
        s.on('error', function (e) { if (!self.destroyed) self.emit('error', e); if (!s.open) rej(e); });
      });
    });
    this._sideP.then(function (s) { if (!self.destroyed && !c.done) c._real(s.connect(rid, opt)); }, function () { self._sideP = null; });
  };
  Peer.prototype.disconnect = function () {
    if (this._pj) return this._pj.disconnect();
    if (this.destroyed || this.disconnected) return;
    this.disconnected = true; this.open = false; clearTimeout(this._pt);
    if (this._host) del(COL + '/' + this.id).catch(noop);
    this.emit('disconnected', this.id);
  };
  Peer.prototype.reconnect = function () {
    if (this._pj) return this._pj.reconnect();
    if (this.destroyed || !this.disconnected) return;
    var self = this; this.disconnected = false;
    (this._host ? claim(this.id, this._uid) : Promise.resolve(true)).then(function (ok) {
      if (self.destroyed) return;
      if (!ok) { self.emit('error', err('unavailable-id', 'ID "' + self.id + '" is taken')); return; }
      self.open = true; self._act = Date.now(); if (self._host) self._poll(); self.emit('open', self.id);
    }, function () { self.disconnected = true; self.emit('error', err('network', 'Firebase nicht erreichbar')); });
  };
  Peer.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true; this.open = false; clearTimeout(this._pt);
    this._conns.forEach(function (c) { try { c.close(); } catch (e) {} }); this._conns = [];
    if (this._hide) { W.removeEventListener('pagehide', this._hide); W.removeEventListener('pageshow', this._show); }
    try { if (this._side) this._side.destroy(); } catch (e) {}
    if (this._pj) { try { this._pj.destroy(); } catch (e) {} }
    if (this._fire && this._host) del(COL + '/' + this.id).catch(noop);
    this.emit('close');
  };
  Peer.prototype.getConnection = function (pid, cid) {
    for (var i = 0; i < this._conns.length; i++) if (this._conns[i].peer === pid && this._conns[i].connectionId === cid) return this._conns[i];
    return this._pj ? this._pj.getConnection(pid, cid) : null;
  };
  Peer.prototype.listAllPeers = function (cb) { if (cb) cb([]); };

  // window.Peer gehört ab jetzt dieser Klasse; lädt jemand PeerJS nach, wird es nur noch als Rückfall gemerkt.
  Peer.isFirePeer = true;
  W.FirePeer = Peer;
  W.FirePeer.firebase = { uid: uid, get: get, write: write, del: del, query: query, available: function () { return fireOk() ? uid().then(function () { return true; }, function () { return false; }) : Promise.resolve(false); } };
  try {
    Object.defineProperty(W, 'Peer', { configurable: true, enumerable: true, get: function () { return Peer; }, set: function (v) { if (typeof v === 'function' && v !== Peer) Orig = v; } });
  } catch (e) { W.Peer = Peer; }
})(typeof window !== 'undefined' ? window : this);
