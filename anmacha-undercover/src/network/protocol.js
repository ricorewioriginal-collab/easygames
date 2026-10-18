/* AnMaCha UNDERCOVER 3D – Online-Protokoll (ohne DOM, Node-testbar). Der Gastgeber ist autoritativ:
   Gäste schicken nur Eingaben/Aktionen, der Gastgeber schickt jedem Gast seine eigene, geschwärzte Sicht (viewFor) plus
   seine eigenen Ereignisse (drain). Rollen, Wort und private Hinweise erreichen so nur die berechtigte Person.
   Nachricht: { v: Version, k: Art, s: laufende Nummer, d: Daten }.
   Gast → Gastgeber: hello, input, act, ready, look, bye, ping    Gastgeber → Gast: welcome, lobby, roster, start, view, ev, end, kick, pong */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const U = () => AMU.U;
  const V = 1, MAX_IN = 16000, CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', CODE_LEN = 5, PEER_PREFIX = 'amu-';
  // Flutschutz je Verbindung: Eimer (Kapazität, Nachfüllung pro Sekunde)
  const RATE = { input: [40, 30], act: [16, 8], hello: [3, 0.2], ready: [6, 2], look: [4, 1], ping: [4, 2], bye: [2, 1] };
  const ACTS_SIM = ['use', 'task_done', 'cancel', 'report', 'button', 'kill', 'vent', 'sab', 'ability', 'quick', 'chat', 'vote', 'present', 'tag', 'search', 'pulse', 'sprint', 'hide', 'unhide', 'rescue', 'tamper', 'ready'];
  const ACTS_WORD = ['clue', 'chat', 'quick', 'ready', 'vote', 'guess'];
  const VIEW_MS = { play: 100, meeting: 250, intro: 250, end: 1000, word: 250 };
  const BOT_TAKEOVER_MS = 10000;

  function makeCode(rng) { let s = ''; for (let i = 0; i < CODE_LEN; i++) s += CODE_CHARS[Math.floor((rng ? rng() : Math.random()) * CODE_CHARS.length)]; return s; }
  function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LEN); }
  function validCode(s) { return typeof s === 'string' && s.length === CODE_LEN && [...s].every(c => CODE_CHARS.includes(c)); }
  function makeKey() { let s = ''; for (let i = 0; i < 16; i++) s += 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]; return s; }
  function msg(k, d, s) { return { v: V, k, s: s || 0, d: d == null ? null : d }; }
  function parse(raw) {
    let m = raw;
    if (typeof raw === 'string') { if (raw.length > MAX_IN) return null; try { m = JSON.parse(raw); } catch (e) { return null; } }
    else { try { if (JSON.stringify(raw).length > MAX_IN) return null; } catch (e) { return null; } }
    if (!m || typeof m !== 'object' || Array.isArray(m) || m.v !== V || typeof m.k !== 'string' || m.k.length > 12) return null;
    if (m.s != null && !(typeof m.s === 'number' && isFinite(m.s))) return null;
    return m;
  }
  /** Prüft Form einer Aktion (Inhalt prüfen Sim/Wortspiel selbst). Gibt bereinigte Kopie oder null zurück. */
  function cleanAct(a, kind) {
    const u = U();
    if (!u.isObj(a) || typeof a.a !== 'string') return null;
    const list = kind === 'word' ? ACTS_WORD : ACTS_SIM;
    if (!list.includes(a.a)) return null;
    const o = { a: a.a };
    const str = (k, max) => { if (a[k] == null) return true; if (!u.isStr(a[k], max)) return false; o[k] = a[k]; return true; };
    const int = (k, lo, hi) => { if (a[k] == null) return true; if (!u.isInt(a[k]) || a[k] < lo || a[k] > hi) return false; o[k] = a[k]; return true; };
    if (!str('target', 24) || !str('p', 24) || !str('body', 24) || !str('text', 200) || !str('txt', 200) || !str('type', 12) || !str('what', 12) || !str('q', 12) || !str('claim', 12)) return null;
    if (!int('room', 0, 99) || !int('r', 0, 99) || !int('card', 0, 20) || !int('opt', 0, 20) || !int('clue', 0, 99)) return null;
    if (a.a === 'task_done') {
      if (!Array.isArray(a.acts) || a.acts.length > 600) return null;
      for (const x of a.acts) { if (!u.isObj(x)) return null; }
      try { if (JSON.stringify(a.acts).length > 12000) return null; } catch (e) { return null; }
      o.acts = a.acts;
    }
    return o;
  }

  // Eimer-Flutschutz
  function Bucket() { this.b = {}; }
  Bucket.prototype.take = function (k, now) {
    const r = RATE[k] || [5, 1]; let e = this.b[k];
    if (!e) e = this.b[k] = { n: r[0], t: now };
    e.n = Math.min(r[0], e.n + (now - e.t) / 1000 * r[1]); e.t = now;
    if (e.n < 1) return false; e.n -= 1; return true;
  };

  /** Sicht für das Netz verkleinern: Aussehen/Namen stehen im Roster (nur bei Änderung gesendet). */
  function slimView(v) {
    if (!v || v.kind === 'word') return v;
    const o = Object.assign({}, v);
    delete o.roster;
    if (o.players) o.players = o.players.map(p => { const q = Object.assign({}, p); delete q.look; delete q.n; delete q.sym; return q; });
    return o;
  }

  // =====================================================================================
  // Gastgeber: Lobby + Spiel. send(connId, msgObj) wird vom Netzwerkteil (peer.js) gesetzt.
  // =====================================================================================
  function Host(opt) {
    this.send = opt.send || function () {};
    this.onChange = opt.onChange || function () {};
    this.max = opt.max || 12;
    this.players = [];          // { id, name, look, conn, key, bot, diff, connected, ready, host }
    this.settings = AMU.cleanSettings(opt.settings || {}, null);
    this.code = opt.code || '';
    this.game = null; this.kind = null; this.seq = 0; this.conns = {};
    this.lastSent = {}; this.lastRoster = {}; this.goneAt = {}; this.nextId = 1;
    if (opt.hostPlayer) this.players.push({ id: 'h', name: AMU.U.cleanName(opt.hostPlayer.name, 16) || 'Gastgeber', look: valLook(opt.hostPlayer.look), conn: null, key: null, bot: false, connected: true, ready: true, host: true });
  }
  function valLook(l) { const C = AMU.COSMETICS; return C ? C.validLook(l || C.randomLook(AMU.RNG(Math.random() * 1e9 | 0))) : (l || {}); }
  Host.prototype = {
    out(connId, k, d) { this.send(connId, msg(k, d, ++this.seq)); },
    toAll(k, d) { Object.keys(this.conns).forEach(c => this.out(c, k, d)); },
    humans() { return this.players.filter(p => !p.bot); },
    lobbyState() {
      return { code: this.code, settings: this.settings, running: !!this.game,
        players: this.players.map(p => ({ id: p.id, n: p.name, look: p.look, bot: p.bot ? 1 : 0, diff: p.diff, host: p.host ? 1 : 0, conn: p.connected ? 1 : 0, ready: p.ready ? 1 : 0 })) };
    },
    broadcastLobby() { this.toAll('lobby', this.lobbyState()); this.onChange('lobby'); },
    /** Eingehende Nachricht. now in ms. Gibt { ok, why } zurück (für Tests). */
    receive(connId, raw, now) {
      const m = parse(raw); if (!m) return { ok: false, why: 'format' };
      const c = this.conns[connId] || (this.conns[connId] = { bucket: new Bucket(), lastS: -1, pid: null, joined: false });
      if (!c.bucket.take(m.k, now)) return { ok: false, why: 'flut' };
      if (typeof m.s === 'number') { if (m.s <= c.lastS) return { ok: false, why: 'alt' }; c.lastS = m.s; }
      const d = m.d;
      if (m.k === 'hello') return this.hello(connId, c, d, now);
      if (!c.joined) return { ok: false, why: 'nicht beigetreten' };
      const p = this.players.find(x => x.id === c.pid); if (!p) return { ok: false, why: 'unbekannt' };
      switch (m.k) {
        case 'ping': this.out(connId, 'pong', { t: AMU.U.isNum(d && d.t) ? d.t : 0 }); return { ok: true };
        case 'bye': this.drop(connId, now, true); return { ok: true };
        case 'ready': if (this.game) return { ok: false, why: 'läuft' }; p.ready = !!(d && d.on); this.broadcastLobby(); return { ok: true };
        case 'look': {
          if (this.game) return { ok: false, why: 'läuft' };
          if (!AMU.U.isObj(d)) return { ok: false, why: 'form' };
          if (d.name != null) { const n = AMU.U.cleanName(d.name, 16); if (n) p.name = this.uniqueName(n, p.id); }
          if (d.look != null) p.look = valLook(d.look);
          this.broadcastLobby(); return { ok: true };
        }
        case 'input': {
          if (!this.game || this.kind !== 'sim' || !AMU.U.isObj(d)) return { ok: false, why: 'form' };
          const mx = +d.x, my = +d.y; if (!isFinite(mx) || !isFinite(my)) return { ok: false, why: 'zahl' };
          this.game.setInput(p.id, Math.max(-1, Math.min(1, mx)), Math.max(-1, Math.min(1, my))); return { ok: true };
        }
        case 'act': {
          if (!this.game) return { ok: false, why: 'kein Spiel' };
          const a = cleanAct(d, this.kind); if (!a) return { ok: false, why: 'aktion' };
          const r = this.game.act(p.id, a) || { ok: false };
          this.out(connId, 'res', { a: a.a, ok: r.ok ? 1 : 0, why: r.ok ? null : String(r.why || '').slice(0, 40), data: r.ok && r.data && AMU.U.isObj(r.data) ? r.data : null });
          return { ok: !!r.ok, why: r.why };
        }
      }
      return { ok: false, why: 'art' };
    },
    uniqueName(n, selfId) {
      let name = n, i = 2;
      while (this.players.some(p => p.id !== selfId && p.name.toLowerCase() === name.toLowerCase())) name = n.slice(0, 13) + ' ' + (i++);
      return name;
    },
    hello(connId, c, d, now) {
      if (!AMU.U.isObj(d)) return { ok: false, why: 'form' };
      if (d.ver !== V) { this.out(connId, 'kick', { why: 'version' }); return { ok: false, why: 'version' }; }
      // Wiederverbindung mit Schlüssel
      if (AMU.U.isStr(d.key, 32) && d.key) {
        const p = this.players.find(x => x.key === d.key && !x.bot);
        if (p) {
          if (p.conn && p.conn !== connId && this.conns[p.conn]) { this.out(p.conn, 'kick', { why: 'anderswo' }); delete this.conns[p.conn]; }
          p.conn = connId; p.connected = true; c.pid = p.id; c.joined = true; delete this.goneAt[p.id];
          if (this.game) { this.game.setConnected(p.id, true); this.game.release && this.game.release(p.id); }
          this.out(connId, 'welcome', { id: p.id, key: p.key, code: this.code });
          this.lastSent[p.id] = null; this.lastRoster[p.id] = null;
          if (this.game) this.out(connId, 'start', this.startInfo());
          this.broadcastLobby(); return { ok: true, rejoin: true };
        }
      }
      if (this.game) { this.out(connId, 'kick', { why: 'läuft' }); return { ok: false, why: 'läuft' }; }
      if (this.humans().length >= this.max) { this.out(connId, 'kick', { why: 'voll' }); return { ok: false, why: 'voll' }; }
      // Bots machen Platz für Menschen
      if (this.players.length >= this.max) { const b = this.players.filter(p => p.bot).pop(); if (b) this.players.splice(this.players.indexOf(b), 1); }
      const id = 'g' + (this.nextId++);
      const p = { id, name: this.uniqueName(AMU.U.cleanName(d.name, 16) || 'Gast', id), look: valLook(d.look), conn: connId, key: makeKey(), bot: false, connected: true, ready: false };
      this.players.push(p); c.pid = id; c.joined = true;
      this.out(connId, 'welcome', { id, key: p.key, code: this.code });
      this.broadcastLobby(); return { ok: true };
    },
    /** Verbindung weg (close/error). Im Spiel übernimmt nach kurzer Zeit ein Bot (wenn eingestellt). */
    drop(connId, now, bye) {
      const c = this.conns[connId]; delete this.conns[connId];
      if (!c || !c.pid) return;
      const p = this.players.find(x => x.id === c.pid); if (!p || p.conn !== connId) return;
      p.connected = false; p.conn = null;
      if (!this.game) { this.players.splice(this.players.indexOf(p), 1); this.broadcastLobby(); return; }
      this.game.setConnected(p.id, false); this.goneAt[p.id] = now; if (bye) this.goneAt[p.id] = now - BOT_TAKEOVER_MS;
      this.broadcastLobby();
    },
    // ----- Lobby-Steuerung (nur Gastgeber, lokal) -----
    setSettings(s) { if (this.game) return; this.settings = AMU.cleanSettings(Object.assign({}, this.settings, s), null); this.fillBots(); this.broadcastLobby(); },
    fillBots() {
      const want = this.settings.players, humans = this.humans().length;
      let bots = this.players.filter(p => p.bot);
      const need = Math.max(0, want - humans);
      while (bots.length > need) { const b = bots.pop(); this.players.splice(this.players.indexOf(b), 1); }
      const C = AMU.COSMETICS, NAMES = AMU.BOT_NAMES || ['Funkfuchs', 'Pegel-Paul', 'Mira Mikro', 'Kabel-Kai', 'Lina Loop', 'DJ Delta', 'Tara Ton', 'Bassbert', 'Echo-Ella', 'Rauschi', 'Volker Volt', 'Sina Sinus'];
      let i = 0;
      while (this.players.filter(p => p.bot).length < need) {
        const n = NAMES.find(x => !this.players.some(p => p.name === x)) || ('Bot ' + (++i));
        this.players.push({ id: 'b' + (this.nextId++), name: n, look: valLook(C ? C.randomLook(AMU.RNG(this.nextId * 977)) : null), bot: true, diff: this.settings.diff, connected: true, ready: true });
      }
    },
    kick(pid) {
      const p = this.players.find(x => x.id === pid); if (!p || p.host) return;
      if (p.conn) { this.out(p.conn, 'kick', { why: 'entfernt' }); delete this.conns[p.conn]; }
      if (!this.game) { this.players.splice(this.players.indexOf(p), 1); this.broadcastLobby(); }
    },
    startInfo() {
      return { kind: this.kind, mode: this.settings.mode, map: this.settings.map, settings: this.settings,
        roster: this.players.map(p => ({ id: p.id, n: p.name, look: p.look, bot: p.bot ? 1 : 0 })) };
    },
    /** Spiel starten (Seed vom Gastgeber; Wort/Rollen werden nur beim Gastgeber bestimmt). */
    start(seed, opts) {
      if (this.game) return { ok: false, why: 'läuft' };
      this.fillBots();
      const ps = this.players.map(p => ({ id: p.id, name: p.name, look: p.look, bot: p.bot, diff: p.bot ? p.diff : undefined }));
      const mode = AMU.modeById(this.settings.mode);
      if (ps.length < (mode.min || 3)) return { ok: false, why: 'zu wenige' };
      const filter = opts && opts.filter;
      if (this.settings.mode === 'wort') { this.kind = 'word'; this.game = AMU.WordGame.create({ seed, settings: this.settings, players: ps, filter, recent: opts && opts.recent, wish: opts && opts.wish }); }
      else { this.kind = 'sim'; this.game = AMU.Sim.create({ seed, mode: this.settings.mode, map: this.settings.map, settings: this.settings, players: ps, filter, wish: opts && opts.wish }); }
      this.lastSent = {}; this.lastRoster = {}; this.viewT = {};
      this.toAll('start', this.startInfo());
      this.onChange('start');
      return { ok: true };
    },
    /** Spiel weiterrechnen und Sichten verschicken. dtMs: vergangene Zeit; now: Uhrzeit in ms. */
    tick(dtMs, now) {
      const g = this.game; if (!g) return;
      // Bots übernehmen getrennte Spieler
      Object.keys(this.goneAt).forEach(id => {
        if (now - this.goneAt[id] >= BOT_TAKEOVER_MS) { delete this.goneAt[id]; if (this.settings.botTakeover) g.takeover(id); }
      });
      g.step(dtMs);
      this.players.forEach(p => {
        if (p.bot || p.host || !p.conn || !this.conns[p.conn]) { if (!p.host && !p.bot) g.drain(p.id); return; }
        const ev = g.drain(p.id);
        if (ev.length) this.out(p.conn, 'ev', ev);
        const ph = this.kind === 'word' ? 'word' : g.phase;
        const every = VIEW_MS[ph] || 200;
        this.viewT[p.id] = (this.viewT[p.id] || 0) + dtMs;
        if (this.viewT[p.id] < every && ev.length === 0) return;
        this.viewT[p.id] = 0;
        const v = g.viewFor(p.id);
        if (this.kind === 'sim') {
          const rs = JSON.stringify(v.roster || []);
          if (rs !== this.lastRoster[p.id]) { this.lastRoster[p.id] = rs; this.out(p.conn, 'roster', v.roster || []); }
        }
        const sv = slimView(v), js = JSON.stringify(sv);
        if (js === this.lastSent[p.id]) return;
        this.lastSent[p.id] = js;
        this.out(p.conn, 'view', sv);
      });
      if (g.phase === 'end' && !this.ended) { this.ended = true; this.onChange('end'); }
    },
    /** Nach Rundenende zurück in die Lobby */
    toLobby() { this.game = null; this.kind = null; this.ended = false; this.goneAt = {}; this.players = this.players.filter(p => p.bot || p.connected || p.host); this.players.forEach(p => { if (!p.bot && !p.host) p.ready = false; }); this.toAll('lobby', this.lobbyState()); this.onChange('lobby'); },
    close() { this.toAll('end', { why: 'host' }); }
  };

  // =====================================================================================
  // Gast
  // =====================================================================================
  function Client(opt) {
    this.send = opt.send || function () {};
    this.on = opt.on || function () {};   // on(kind, data)
    this.seq = 0; this.id = null; this.key = opt.key || null; this.lobby = null; this.view = null; this.roster = []; this.start = null; this.lastIn = -1;
    this.inT = 0; this.lastAxis = '';
  }
  Client.prototype = {
    out(k, d) { this.send(msg(k, d, ++this.seq)); },
    hello(name, look) { this.out('hello', { ver: V, name, look, key: this.key || null }); },
    input(x, y, now) {
      const k = x.toFixed(2) + ',' + y.toFixed(2);
      if (k === this.lastAxis && now - this.inT < 500) return;   // nur Änderungen, sonst alle 0,5 s
      if (now - this.inT < 40 && k !== '0.00,0.00') return;
      this.lastAxis = k; this.inT = now; this.out('input', { x: +x.toFixed(2), y: +y.toFixed(2) });
    },
    act(a) { this.out('act', a); },
    ready(on) { this.out('ready', { on: !!on }); },
    look(name, look) { this.out('look', { name, look }); },
    bye() { this.out('bye', null); },
    ping(t) { this.out('ping', { t }); },
    receive(raw) {
      const m = parse(raw); if (!m) return false;
      if (typeof m.s === 'number') { if (m.s <= this.lastIn) return false; this.lastIn = m.s; }
      const d = m.d;
      switch (m.k) {
        case 'welcome': if (AMU.U.isObj(d)) { this.id = d.id; this.key = d.key; } break;
        case 'lobby': this.lobby = d; break;
        case 'roster': if (Array.isArray(d)) this.roster = d; break;
        case 'start': this.start = d; this.view = null; if (d && Array.isArray(d.roster) && d.kind === 'sim') this.roster = d.roster.map(r => ({ id: r.id, n: r.n, look: r.look, bot: r.bot })); break;
        case 'view': this.view = this.fatten(d); break;
        case 'ev': case 'res': case 'end': case 'kick': case 'pong': break;
        default: return false;
      }
      this.on(m.k, m.k === 'view' ? this.view : d);
      return true;
    },
    /** Sicht wieder mit Namen/Aussehen aus dem Roster anreichern */
    fatten(v) {
      if (!v || v.kind === 'word') return v;
      const by = {}; this.roster.forEach(r => { by[r.id] = r; });
      v.roster = this.roster;
      if (v.players) v.players.forEach(p => { const r = by[p.id]; if (r) { p.n = r.n; p.look = r.look; p.sym = r.sym; } });
      return v;
    }
  };

  AMU.Net = { V, CODE_CHARS, CODE_LEN, PEER_PREFIX, RATE, ACTS_SIM, ACTS_WORD, makeCode, normCode, validCode, makeKey, msg, parse, cleanAct, slimView, Host, Client, BOT_TAKEOVER_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Net;
})(typeof window !== 'undefined' ? window : globalThis);
