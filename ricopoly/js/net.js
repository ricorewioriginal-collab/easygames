/*! RicoPoly 3D – Online-Mehrspieler. Der Gastgeber ist die einzige Quelle der Wahrheit (serverautoritativ im Gastgeber-Browser):
 * Nur er würfelt, prüft und führt Aktionen aus; Mitspieler senden Aktionswünsche und bekommen den geprüften Spielstand zurück.
 * Verbindung über WebRTC (PeerJS, vorhandene Bibliothek im Repo). HostCore ist ohne Netzwerk testbar (tests/net.test.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./rules.js'), require('./ai.js'));
  else root.RicoNet = factory(root.RicoRules, root.RicoAI);
})(typeof self !== 'undefined' ? self : this, function (R, AI) {
  'use strict';
  var VERSION = 1, PREFIX = 'ricopoly-', PUB_SLOTS = 8;
  var ALLOWED = { roll: 1, payJail: 1, useCard: 1, buy: 1, decline: 1, bid: 1, pass: 1, build: 1, sell: 1, mortgage: 1, unmortgage: 1, payDebt: 1, bankrupt: 1, resign: 1, endTurn: 1, propose: 1, accept: 1, reject: 1, cancel: 1, counter: 1 };

  function code6() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function clean(str, n) { return String(str == null ? '' : str).replace(/[<>\u0000-\u001f]/g, '').slice(0, n || 24); }
  // Spielstand für Mitspieler: ohne Zufallszustand (sonst ließen sich Würfel vorhersagen)
  function sanitize(s) { var c = R.clone(s); c.rng = 0; c.seen = []; return c; }
  function sideClean(x) { x = x || {}; return { money: Math.max(0, Math.floor(+x.money || 0)), props: Array.isArray(x.props) ? x.props.slice(0, 28).map(function (v) { return v | 0; }) : [], cards: Math.max(0, Math.min(2, x.cards | 0)) }; }
  function cleanAction(a, seat) {
    if (!a || !ALLOWED[a.type]) return null;
    var o = { type: a.type, p: seat };
    if (a.aid != null) o.aid = clean(a.aid, 40);
    if (a.tid != null) o.tid = a.tid | 0;
    if (a.sq != null) o.sq = a.sq | 0;
    if (a.amount != null) o.amount = Math.floor(+a.amount) || 0;
    if (a.id != null) o.id = a.id | 0;
    if (a.to != null) o.to = a.to | 0;
    if (a.give) o.give = sideClean(a.give);
    if (a.get) o.get = sideClean(a.get);
    return o;
  }

  // ---------- Spiellogik des Gastgebers (transportunabhängig) ----------
  function HostCore(opt) {
    opt = opt || {};
    this.code = opt.code || code6(); this.isPublic = !!opt.isPublic; this.now = opt.now || function () { return Date.now(); };
    this.send = opt.send || function () {};          // send(clientId, msg)
    this.onChange = opt.onChange || function () {};  // Gastgeber-Oberfläche aktualisieren
    this.settings = { world: 'metropolis', mode: 'classic', cfg: {}, bots: [], max: 6, afk: 45 };
    this.seats = [];     // { cid, token, name, char, look, ready, online, host, lastSeen }
    this.state = null; this.rate = {}; this.started = false; this.offlineSince = {};
  }
  HostCore.prototype.lobbyInfo = function () {
    return { code: this.code, pub: this.isPublic, started: this.started, settings: this.settings,
      seats: this.seats.map(function (s, i) { return { i: i, name: s.name, char: s.char, look: s.look, ready: s.ready, online: s.online, host: s.host }; }) };
  };
  HostCore.prototype.broadcast = function (msg) { var self = this; this.seats.forEach(function (s) { if (s.cid && s.online && !s.host) self.send(s.cid, msg); }); };
  HostCore.prototype.addHost = function (p) { this.seats.unshift({ cid: 'host', token: p.token || 'host', name: clean(p.name) || 'Host', char: p.char, look: p.look, ready: true, online: true, host: true }); };
  HostCore.prototype.seatOf = function (cid) { for (var i = 0; i < this.seats.length; i++) if (this.seats[i].cid === cid) return i; return -1; };
  HostCore.prototype.limited = function (cid) {   // Rate-Limit: höchstens 20 Nachrichten pro Sekunde
    var t = this.now(), r = this.rate[cid] || (this.rate[cid] = { t: t, n: 0 });
    if (t - r.t > 1000) { r.t = t; r.n = 0; }
    return ++r.n > 20;
  };
  HostCore.prototype.receive = function (cid, msg) {
    if (!msg || typeof msg !== 'object' || this.limited(cid)) return;
    var seat = this.seatOf(cid);
    switch (msg.t) {
      case 'hello': return this.hello(cid, msg);
      case 'ready': if (seat > 0 && !this.started) { this.seats[seat].ready = !!msg.v; this.pushLobby(); } return;
      case 'look': if (seat >= 0 && !this.started) { this.seats[seat].char = clean(msg.char, 20); this.seats[seat].look = msg.look && typeof msg.look === 'object' ? msg.look : null; this.pushLobby(); } return;
      case 'act': if (seat >= 0) this.act(seat, msg.a, cid); return;
      case 'sync': if (seat >= 0 && this.state) this.send(cid, { t: 'state', s: sanitize(this.state), ev: [] }); else if (seat >= 0) this.send(cid, { t: 'lobby', lobby: this.lobbyInfo() }); return;
      case 'emote': if (seat >= 0) this.broadcast({ t: 'emote', seat: seat, e: clean(msg.e, 12) }), this.onChange({ emote: { seat: seat, e: clean(msg.e, 12) } }); return;
      case 'ping': this.send(cid, { t: 'pong' }); return;
    }
  };
  HostCore.prototype.hello = function (cid, msg) {
    if (msg.v !== VERSION) { this.send(cid, { t: 'reject', reason: 'version' }); return; }
    var token = clean(msg.token, 40), i, s;
    // Wiederbeitritt: gleicher geheimer Schlüssel → gleicher Platz
    for (i = 0; i < this.seats.length; i++) if (this.seats[i].token === token && !this.seats[i].host) {
      s = this.seats[i]; s.cid = cid; s.online = true; delete this.offlineSince[i];
      this.send(cid, { t: 'welcome', seat: i, code: this.code });
      if (this.state) this.send(cid, { t: 'state', s: sanitize(this.state), ev: [] }); else this.pushLobby();
      this.pushLobby(); this.onChange({ rejoin: i }); return;
    }
    if (this.started) { this.send(cid, { t: 'reject', reason: 'started' }); return; }
    if (this.seats.length + this.settings.bots.length >= this.settings.max) { this.send(cid, { t: 'reject', reason: 'full' }); return; }
    if (!token || token.length < 8) { this.send(cid, { t: 'reject', reason: 'token' }); return; }
    this.seats.push({ cid: cid, token: token, name: clean(msg.name) || 'Gast', char: clean(msg.char, 20) || 'businessman', look: msg.look && typeof msg.look === 'object' ? msg.look : null, ready: false, online: true, host: false });
    this.send(cid, { t: 'welcome', seat: this.seats.length - 1, code: this.code });
    this.pushLobby();
  };
  HostCore.prototype.disconnect = function (cid) {
    var i = this.seatOf(cid); if (i < 0) return;
    if (!this.started) { this.seats.splice(i, 1); this.pushLobby(); return; }
    this.seats[i].online = false; this.offlineSince[i] = this.now(); this.pushLobby(); this.onChange({ offline: i });
  };
  HostCore.prototype.pushLobby = function () { var l = this.lobbyInfo(); this.broadcast({ t: 'lobby', lobby: l }); this.onChange({ lobby: l }); };
  HostCore.prototype.configure = function (s) {   // nur der Gastgeber (lokal)
    if (this.started) return;
    var t = this.settings;
    if (s.world) t.world = s.world; if (s.mode) t.mode = s.mode; if (s.cfg) t.cfg = s.cfg;
    if (Array.isArray(s.bots)) t.bots = s.bots.slice(0, Math.max(0, 6 - this.seats.length));
    if (s.afk) t.afk = Math.max(15, Math.min(300, s.afk | 0));
    this.pushLobby();
  };
  HostCore.prototype.canStart = function () { return !this.started && this.seats.length + this.settings.bots.length >= 2 && this.seats.every(function (s) { return s.ready; }); };
  HostCore.prototype.start = function (seed) {
    if (!this.canStart()) return false;
    var players = this.seats.map(function (s) { return { name: s.name, char: s.char, look: s.look, human: true }; });
    this.settings.bots.forEach(function (b, k) { players.push({ name: b.name || ('Bot ' + (k + 1)), char: b.char || 'robot', bot: b.level || 'medium', human: false }); });
    this.state = R.newGame({ players: players, mode: this.settings.mode, cfg: this.settings.cfg, world: this.settings.world, online: true, seed: seed, first: 0 });
    this.started = true; this.mark();
    this.broadcast({ t: 'state', s: sanitize(this.state), ev: [], start: true });
    this.onChange({ state: this.state, events: [] });
    return true;
  };
  HostCore.prototype.resume = function (state, seats) {   // Gastgeber setzt eine gespeicherte Online-Partie fort
    this.state = state; this.started = true; this.mark();
    this.seats = seats.map(function (s, i) { return { cid: s.host ? 'host' : null, token: s.token, name: s.name, char: s.char, look: s.look, ready: true, online: !!s.host, host: !!s.host }; });
    var self = this; this.seats.forEach(function (s, i) { if (!s.online) self.offlineSince[i] = self.now(); });
  };
  HostCore.prototype.mark = function () {   // Beginn des aktuellen Entscheidungsschritts (für Zugtimer)
    var k = this.state.turnId + ':' + R.actor(this.state) + ':' + this.state.phase;
    if (k !== this.turnKey) { this.turnKey = k; this.turnStart = this.now(); }
  };
  HostCore.prototype.act = function (seat, a, cid) {
    if (!this.state) return { ok: false, err: 'notStarted' };
    var act = cleanAction(a, seat);
    if (!act) { if (cid && cid !== 'host') this.send(cid, { t: 'err', err: 'badAction', aid: a && a.aid }); return { ok: false, err: 'badAction' }; }
    return this.apply(act, cid);
  };
  HostCore.prototype.apply = function (act, cid) {
    var r = R.apply(this.state, act);
    if (r.ok && !r.dup) {
      this.state = r.state; this.mark();
      this.broadcast({ t: 'state', s: sanitize(this.state), ev: r.events });
      this.onChange({ state: this.state, events: r.events });
    } else if (!r.ok) {
      if (r.state !== this.state) { this.state = r.state; this.broadcast({ t: 'state', s: sanitize(this.state), ev: r.events }); this.onChange({ state: this.state, events: r.events }); }
      if (cid && cid !== 'host') this.send(cid, { t: 'err', err: r.err, aid: act.aid });
    }
    return r;
  };
  // Zeitüberschreitung / Verbindungsabbruch: Bots und abwesende Spieler werden vom Gastgeber nach denselben Regeln vertreten
  HostCore.prototype.tick = function () {
    if (!this.state || this.state.phase === 'over') return null;
    var s = this.state, who = R.actor(s), now = this.now();
    if (who < 0) return null;
    var pl = s.players[who], seat = this.seats[who];
    var away = seat && !seat.online && this.offlineSince[who] != null && now - this.offlineSince[who] > this.settings.afk * 1000;
    var timer = s.cfg.turnTimer && this.turnStart && now - this.turnStart > s.cfg.turnTimer * 1000 && pl.human;
    if (!pl.human || away || timer) {
      var orig = pl.bot; if (pl.human) s.players[who].bot = 'easy';
      var a = AI.next(s, who); if (pl.human) s.players[who].bot = orig;
      if (a) { a.aid = 'h' + now + ':' + who; a.tid = s.turnId; return this.apply(a, 'host'); }
    }
    // Offene Angebote an Bots oder abwesende Spieler beantworten
    for (var k = 0; k < s.trades.length; k++) {
      var tr = s.trades[k], target = s.players[tr.to], tseat = this.seats[tr.to];
      if (!target.human || (tseat && !tseat.online && now - (this.offlineSince[tr.to] || now) > this.settings.afk * 1000)) {
        var resp = target.human ? { type: 'reject', p: tr.to, id: tr.id } : AI.respond(s, tr.to, tr);
        return this.apply(resp, 'host');
      }
    }
    return null;
  };
  HostCore.prototype.saveData = function () { return { code: this.code, pub: this.isPublic, settings: this.settings, seats: this.seats.map(function (s) { return { token: s.token, name: s.name, char: s.char, look: s.look, host: s.host }; }) }; };

  // ---------- WebRTC über PeerJS ----------
  function peerOpts() { return { debug: 0 }; }
  function Host(opt) {
    var self = this; this.opt = opt; this.conns = {}; this.beacon = null; this.closed = false;
    this.core = new HostCore({ code: opt.code, isPublic: opt.isPublic, send: function (cid, msg) { var c = self.conns[cid]; if (c && c.open) try { c.send(msg); } catch (e) {} }, onChange: opt.onChange });
    this.core.addHost(opt.me);
    if (opt.resume) this.core.resume(opt.resume.state, opt.resume.seats);
    this.open();
  }
  Host.prototype.open = function () {
    var self = this, P = root.Peer;
    if (!P) { this.fail('nopeer'); return; }
    this.peer = new P(PREFIX + this.core.code, peerOpts());
    this.peer.on('open', function () { if (self.opt.onOpen) self.opt.onOpen(self.core.code); if (self.core.isPublic) self.announce(1); });
    this.peer.on('connection', function (conn) {
      var cid = conn.peer + ':' + (conn.connectionId || Math.random());
      self.conns[cid] = conn;
      conn.on('data', function (m) { self.core.receive(cid, m); });
      conn.on('close', function () { delete self.conns[cid]; self.core.disconnect(cid); });
      conn.on('error', function () {});
    });
    this.peer.on('error', function (e) {
      if (e && e.type === 'unavailable-id') self.fail('codeTaken');
      else if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error')) self.fail('network');
    });
    this.peer.on('disconnected', function () { if (!self.closed) setTimeout(function () { try { self.peer.reconnect(); } catch (e) {} }, 2000); });
    this.timer = setInterval(function () { self.core.tick(); }, 1000);
  };
  // Öffentliche Räume: Der Gastgeber belegt einen der festen Suchplätze "ricopoly-pub-1..8" und beantwortet dort Raumanfragen.
  Host.prototype.announce = function (n) {
    var self = this, P = root.Peer; if (n > PUB_SLOTS || this.closed) return;
    var b = new P(PREFIX + 'pub-' + n, peerOpts());
    b.on('open', function () { self.beacon = b; });
    b.on('connection', function (c) { c.on('data', function (m) { if (m && m.t === 'info') { var l = self.core.lobbyInfo(); try { c.send({ t: 'info', code: l.code, host: l.seats[0] && l.seats[0].name, n: l.seats.length + l.settings.bots.length, max: l.settings.max, world: l.settings.world, mode: l.settings.mode, started: l.started }); } catch (e) {} setTimeout(function () { try { c.close(); } catch (e) {} }, 500); } }); });
    b.on('error', function (e) { if (e && e.type === 'unavailable-id') { try { b.destroy(); } catch (x) {} self.announce(n + 1); } });
  };
  Host.prototype.fail = function (why) { if (this.opt.onError) this.opt.onError(why); };
  Host.prototype.act = function (a) { return this.core.act(0, a, 'host'); };
  Host.prototype.close = function () { this.closed = true; clearInterval(this.timer); try { if (this.beacon) this.beacon.destroy(); } catch (e) {} try { this.peer.destroy(); } catch (e) {} };

  function Client(opt) { this.opt = opt; this.closed = false; this.seat = -1; this.n = 0; this.connect(); }
  Client.prototype.connect = function () {
    var self = this, P = root.Peer;
    if (!P) { this.fail('nopeer'); return; }
    if (!this.peer || this.peer.destroyed) {
      this.peer = new P(peerOpts());
      this.peer.on('error', function (e) { if (e && e.type === 'peer-unavailable') { self.fail('noRoom'); self.retry(); } else if (e && e.type === 'network') { self.fail('network'); self.retry(); } });
      this.peer.on('open', function () { self.dial(); });
    } else this.dial();
  };
  Client.prototype.dial = function () {
    var self = this, c = this.peer.connect(PREFIX + this.opt.code, { reliable: true });
    this.conn = c;
    c.on('open', function () { self.backoff = 0; c.send({ t: 'hello', v: VERSION, name: self.opt.me.name, char: self.opt.me.char, look: self.opt.me.look, token: self.opt.me.token }); if (self.opt.onStatus) self.opt.onStatus('online'); });
    c.on('data', function (m) {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'welcome') { self.seat = m.seat; if (self.opt.onWelcome) self.opt.onWelcome(m); }
      else if (m.t === 'lobby' && self.opt.onLobby) self.opt.onLobby(m.lobby);
      else if (m.t === 'state' && self.opt.onState) self.opt.onState(m.s, m.ev || [], m.start);
      else if (m.t === 'err' && self.opt.onReject) self.opt.onReject(m.err, m.aid);
      else if (m.t === 'reject') { self.closed = true; self.fail(m.reason); }
      else if (m.t === 'emote' && self.opt.onEmote) self.opt.onEmote(m.seat, m.e);
    });
    c.on('close', function () { if (self.opt.onStatus) self.opt.onStatus('offline'); self.retry(); });
  };
  Client.prototype.retry = function () {
    var self = this; if (this.closed) return;
    clearTimeout(this.rt); this.backoff = Math.min(15000, (this.backoff || 1500) * 1.5);
    this.rt = setTimeout(function () { if (!self.closed) self.connect(); }, this.backoff);
  };
  Client.prototype.fail = function (why) { if (this.opt.onError) this.opt.onError(why); };
  Client.prototype.send = function (m) { if (this.conn && this.conn.open) { try { this.conn.send(m); return true; } catch (e) {} } return false; };
  Client.prototype.act = function (a, tid) { a.aid = this.opt.me.token.slice(0, 8) + ':' + (++this.n) + ':' + Date.now().toString(36); if (tid != null) a.tid = tid; return this.send({ t: 'act', a: a }); };
  Client.prototype.close = function () { this.closed = true; clearTimeout(this.rt); try { this.peer.destroy(); } catch (e) {} };

  // Öffentliche Räume suchen
  function scan(cb) {
    var P = root.Peer; if (!P) { cb([]); return; }
    var p = new P(peerOpts()), found = [], left = PUB_SLOTS, done = false;
    function end() { if (done) return; done = true; try { p.destroy(); } catch (e) {} cb(found); }
    p.on('open', function () {
      for (var n = 1; n <= PUB_SLOTS; n++) (function (n) {
        var c = p.connect(PREFIX + 'pub-' + n), fin = false;
        var to = setTimeout(function () { if (!fin) { fin = true; if (--left <= 0) end(); } }, 4000);
        c.on('open', function () { c.send({ t: 'info' }); });
        c.on('data', function (m) { if (m && m.t === 'info' && !m.started && /^[A-Z0-9]{6}$/.test(m.code)) found.push(m); if (!fin) { fin = true; clearTimeout(to); if (--left <= 0) end(); } });
      })(n);
    });
    p.on('error', function () {});
    setTimeout(end, 6000);
  }

  return { HostCore: HostCore, Host: Host, Client: Client, scan: scan, sanitize: sanitize, cleanAction: cleanAction, code6: code6, VERSION: VERSION };
});
