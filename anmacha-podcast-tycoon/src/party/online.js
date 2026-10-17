/* AnMaCha Podcast Tycoon 3D – „🌐 Online-Quizshow“ (2–8 Geräte, Host spielt mit).
   Verbindung über ../cloud/fire-peer.js (PeerJS-kompatibles window.Peer, Vermittlung über Firebase), keine eigene Vermittlung.
   Teil 1: PT.OnlineCore – reine Logik ohne Netzwerk/DOM (Node-testbar: tools/test-podcast-tycoon-online.cjs).
           Der Host prüft allein: Lösungen verlassen ihn erst bei der Auflösung, jede Nachricht wird gegen die Verbindung geprüft.
   Teil 2: PT.Online – Oberfläche + PeerJS-Anbindung.
     PT.Online.open(el, { name, onExit(), onResult(res) })        Startbildschirm „Show hosten“ / „Beitreten“
     PT.Online.join(el, code, { name, onExit, onResult })         direkter Beitritt (?join=CODE)
       → { close() }      res = { won, place, players, score } (nach der Siegerehrung)
   Nachrichten: JSON-Objekte { v: 1, t: '<typ>', … }; unbekannte oder kaputte Nachrichten werden ignoriert. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const V = 1;
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // ohne Verwechsler I, L, O, 0, 1
  const CODE_LEN = 5, PEER_PREFIX = 'ptq-';
  const CFG = { minPlayers: 2, maxPlayers: 8, rounds: [8, 12, 16], qMs: 15000, estMs: 20000, revealMs: 7000, graceMs: 700 };
  const MIXES = { bunt: 'Bunt gemischt', abcd: 'Nur A–D', wq: 'A–D + Wahr/Quatsch' };
  const CATS = ['Technik', 'Radio & Podcast', 'Bahn & Reisen', 'Camping & Natur', 'Film & Fernsehen', 'Musik', 'Allgemeinwissen', 'Wissenschaft', 'Geografie', 'Essen & Trinken'];
  const KEY_RE = /^[A-Za-z0-9]{8,32}$/;

  // ---------- kleine Helfer ----------
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const isStr = (x, max) => typeof x === 'string' && x.length <= (max || 200);
  const isInt = x => typeof x === 'number' && Number.isInteger(x);
  const isNum = x => typeof x === 'number' && isFinite(x);
  const msg = (t, o) => Object.assign({ v: V, t }, o || {});
  function rnd() { return Math.random(); }
  function makeCode(r) { r = r || rnd; let s = ''; for (let i = 0; i < CODE_LEN; i++) s += CODE_CHARS[Math.floor(r() * CODE_CHARS.length)]; return s; }
  function normCode(s) { return String(s || '').toUpperCase().split('').filter(c => CODE_CHARS.indexOf(c) >= 0).join('').slice(0, CODE_LEN); }
  function makeKey(r) { r = r || rnd; const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < 16; i++) s += a[Math.floor(r() * a.length)]; return s; }
  function cleanName(s) {
    s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16).trim();
    return s || 'Gast';
  }
  /** Nachricht annehmen (Objekt oder JSON-Text) – nur Version 1 mit Typ, sonst null. */
  function parse(raw) {
    let m = raw;
    if (typeof m === 'string') { if (m.length > 30000) return null; try { m = JSON.parse(m); } catch (e) { return null; } }
    if (!isObj(m) || m.v !== V || !isStr(m.t, 20)) return null;
    return m;
  }
  /** Rangliste: nach Punkten, gleiche Punkte = gleicher Platz. */
  function board(players) {
    const list = players.map(p => ({ pid: p.pid, name: p.name, score: p.score, on: p.on !== false, host: !!p.host }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    list.forEach((p, i) => { p.place = i && list[i - 1].score === p.score ? list[i - 1].place : i + 1; });
    return list;
  }

  /** Fragenfolge aus Seed (deterministisch). settings = { rounds, mix, cat }; used = Set bereits gestellter IDs (werden nach hinten sortiert). */
  function buildQuestions(seed, settings, data, used) {
    data = data || (PT.DATA && PT.DATA.quiz) || { mc: [], tf: [], est: [] };
    const st = { seed: seed >>> 0 }, n = settings.rounds, mix = settings.mix, cat = settings.cat;
    const inCat = list => cat === 'alle' ? list.length : list.filter(x => x.cat === cat).length;
    let nEst = mix === 'bunt' ? Math.round(n * 0.2) : 0;
    let nTf = mix === 'abcd' ? 0 : Math.round(n * (mix === 'wq' ? 0.35 : 0.2));
    nEst = Math.min(nEst, inCat(data.est)); nTf = Math.min(nTf, inCat(data.tf));
    const nMc = n - nEst - nTf;
    const rank = x => (cat === 'alle' || x.cat === cat ? 0 : 2) + (used && used.has(x.id) ? 1 : 0);
    const take = (list, k, kind) => PT.shuffle(st, list).map((x, i) => ({ x, i, r: rank(x) }))
      .sort((a, b) => a.r - b.r || a.i - b.i).slice(0, k).map(o => Object.assign({ kind }, o.x));
    return PT.shuffle(st, take(data.mc, nMc, 'mc').concat(take(data.tf, nTf, 'tf'), take(data.est, nEst, 'est')));
  }
  /** Frage ohne Lösung (geht an alle Geräte). */
  function publicQuestion(q) {
    const o = { kind: q.kind, id: q.id, cat: q.cat };
    if (q.kind === 'mc') { o.q = q.q; o.opts = q.a.slice(0, 4); }
    else if (q.kind === 'tf') o.q = q.s;
    else { o.q = q.q; o.unit = q.unit; o.min = q.min; o.max = q.max; }
    return o;
  }
  function validAnswer(q, a) {
    if (q.kind === 'mc') return isInt(a) && a >= 0 && a <= 3;
    if (q.kind === 'tf') return typeof a === 'boolean';
    return isNum(a) && a >= q.min && a <= q.max;
  }
  function dur(q) { return q.kind === 'est' ? CFG.estMs : CFG.qMs; }

  // ================= Host (Raumzustand, prüft alles) =================
  /** opt: { code, seed, hostName, hostKey, send(connId, msg), data } – der Host selbst ist die Verbindung 'host'. */
  function Host(opt) {
    this.code = opt.code || makeCode();
    this.seed = (opt.seed == null ? Math.floor(rnd() * 4294967296) : opt.seed) >>> 0;
    this.out = opt.send || function () {};
    this.data = opt.data || null;
    this.players = []; this.nextPid = 1; this.games = 0; this.used = new Set();
    this.phase = 'lobby'; this.settings = { rounds: 8, mix: 'bunt', cat: 'alle' };
    this.qs = []; this.qi = -1; this.qStart = 0; this.deadline = 0; this.revealUntil = 0; this.lastReveal = null;
    this.rejects = [];   // abgewiesene Nachrichten (für Tests/Fehlersuche)
    this._add('host', opt.hostName, opt.hostKey || makeKey(), true);
  }
  Host.prototype = {
    _send(conn, m) { try { this.out(conn, m); } catch (e) { /* Verbindung weg – egal */ } },
    _bcast(m) { this.players.forEach(p => { if (p.on && p.conn) this._send(p.conn, m); }); },
    /** Begrüßung für den eigenen Spieler des Hosts (Verbindung 'host'). */
    greetHost() { const p = this.players.find(x => x.host); this._send('host', msg('welcome', { pid: p.pid, name: p.name, code: this.code, key: p.key })); this._send('host', this.stateMsg()); },
    _byConn(conn) { return this.players.find(p => p.on && p.conn === conn) || null; },
    _uniqueName(name, self) {
      const taken = n => this.players.some(p => p !== self && p.name.toLowerCase() === n.toLowerCase());
      if (!taken(name)) return name;
      for (let i = 2; i < 99; i++) { const n = name.slice(0, 13) + ' ' + i; if (!taken(n)) return n; }
      return name.slice(0, 10) + ' ' + this.nextPid;
    },
    _add(conn, name, key, host) {
      const p = { pid: 'p' + (this.nextPid++), key, conn, on: true, host: !!host, ready: !!host, score: 0, ans: {}, name: '' };
      p.name = this._uniqueName(cleanName(name), p);
      this.players.push(p); return p;
    },
    _reject(conn, why, m) { this.rejects.push({ conn, why, t: m && m.t }); return { ok: false, why }; },
    pub() {
      const q = this.phase === 'question' ? this.qi : -1;
      return this.players.map(p => ({ pid: p.pid, name: p.name, score: p.score, ready: p.ready, on: p.on, host: p.host, done: q >= 0 && !!p.ans[q] }));
    },
    stateMsg() { return msg('state', { code: this.code, phase: this.phase, players: this.pub(), settings: Object.assign({}, this.settings), qi: this.qi, total: this.qs.length }); },
    _qMsg(now) {
      const q = this.qs[this.qi], d = dur(q);
      return msg('q', { qi: this.qi, total: this.qs.length, dur: d, left: Math.max(0, this.deadline - now), q: publicQuestion(q) });
    },
    canStart() {
      const on = this.players.filter(p => p.on);
      if (this.phase !== 'lobby') return 'Show läuft schon';
      if (on.length < CFG.minPlayers) return 'Mindestens ' + CFG.minPlayers + ' Spieler nötig';
      const wait = on.filter(p => !p.host && !p.ready);
      return wait.length ? 'Warte auf: ' + wait.map(p => p.name).join(', ') : '';
    },
    /** Eingehende Nachricht von Verbindung conn. Gibt { ok, why } zurück. */
    receive(conn, raw, now) {
      const m = parse(raw);
      if (!m) return this._reject(conn, 'format', null);
      if (this.phase === 'aborted') return this._reject(conn, 'aborted', m);
      if (m.t === 'hello') return this._hello(conn, m, now);
      const p = this._byConn(conn);
      if (!p) return this._reject(conn, 'unknown', m);
      if (m.pid !== p.pid) return this._reject(conn, 'pid', m);   // fremde oder fehlende Spieler-ID
      switch (m.t) {
        case 'ready':
          if (this.phase !== 'lobby' || typeof m.r !== 'boolean' || p.host) return this._reject(conn, 'bad', m);
          p.ready = m.r; this._bcast(this.stateMsg()); return { ok: true };
        case 'answer': return this._answer(p, m, now);
        case 'bye':
          this.disconnect(conn, now, true); return { ok: true };
        case 'set': case 'start': case 'next': case 'again':
          if (!p.host) return this._reject(conn, 'not-host', m);
          return this._hostCmd(m, now);
        default: return this._reject(conn, 'type', m);
      }
    },
    _hello(conn, m, now) {
      if (!isStr(m.name, 60) || (m.key != null && !(isStr(m.key, 40) && KEY_RE.test(m.key)))) return this._reject(conn, 'bad', m);
      if (this._byConn(conn)) return this._reject(conn, 'dup-hello', m);
      let p = m.key ? this.players.find(p => p.key === m.key) : null;
      if (p && p.host && conn !== 'host') return this._reject(conn, 'bad', m);
      if (p) {   // Wiederverbindung: gleicher Schlüssel → gleicher Platz, Punkte bleiben
        if (p.on && p.conn !== conn) { this._send(p.conn, msg('err', { code: 'replaced', text: 'Auf einem anderen Gerät neu verbunden.' })); }
        p.conn = conn; p.on = true;
      } else {
        if (this.players.filter(x => x.on).length >= CFG.maxPlayers) { this._send(conn, msg('err', { code: 'full', text: 'Die Show ist voll (höchstens ' + CFG.maxPlayers + ' Spieler).' })); return this._reject(conn, 'full', m); }
        if (this.phase === 'final') { this._send(conn, msg('err', { code: 'over', text: 'Diese Show ist gerade zu Ende.' })); return this._reject(conn, 'over', m); }
        p = this._add(conn, m.name, m.key || makeKey());
      }
      this._send(conn, msg('welcome', { pid: p.pid, name: p.name, code: this.code, key: p.key }));
      this._bcast(this.stateMsg());
      if (this.phase === 'question') { this._send(conn, this._qMsg(now)); const a = p.ans[this.qi]; if (a) this._send(conn, msg('ack', { qi: this.qi, a: a.a })); }
      else if (this.phase === 'reveal' && this.lastReveal) this._send(conn, this.lastReveal);
      else if (this.phase === 'final') this._send(conn, msg('final', { board: board(this.players) }));
      return { ok: true, pid: p.pid };
    },
    _answer(p, m, now) {
      if (this.phase !== 'question' || m.qi !== this.qi) return this._reject(p.conn, 'phase', m);
      if (p.ans[this.qi]) return this._reject(p.conn, 'dup', m);
      if (now > this.deadline + CFG.graceMs) return this._reject(p.conn, 'late', m);
      const q = this.qs[this.qi];
      if (!validAnswer(q, m.a)) return this._reject(p.conn, 'bad', m);
      p.ans[this.qi] = { a: m.a, at: Math.min(now, this.deadline) };
      this._send(p.conn, msg('ack', { qi: this.qi, a: m.a }));
      if (this.players.every(x => !x.on || x.ans[this.qi])) this._reveal(now);
      else this._bcast(this.stateMsg());
      return { ok: true };
    },
    _hostCmd(m, now) {
      if (m.t === 'set') {
        if (this.phase !== 'lobby') return this._reject('host', 'phase', m);
        const s = Object.assign({}, this.settings);
        if (m.rounds != null) { if (CFG.rounds.indexOf(m.rounds) < 0) return this._reject('host', 'bad', m); s.rounds = m.rounds; }
        if (m.mix != null) { if (!MIXES[m.mix]) return this._reject('host', 'bad', m); s.mix = m.mix; }
        if (m.cat != null) { if (m.cat !== 'alle' && CATS.indexOf(m.cat) < 0) return this._reject('host', 'bad', m); s.cat = m.cat; }
        this.settings = s; this._bcast(this.stateMsg()); return { ok: true };
      }
      if (m.t === 'start') {
        const why = this.canStart(); if (why) return this._reject('host', 'not-ready', m);
        this.players = this.players.filter(p => p.on);
        this.players.forEach(p => { p.score = 0; p.ans = {}; });
        this.games++;
        this.qs = buildQuestions(PT.hash(this.seed + ':' + this.games), this.settings, this.data, this.used);
        this.qs.forEach(q => this.used.add(q.id));
        this._ask(0, now); return { ok: true };
      }
      if (m.t === 'next') { if (this.phase !== 'reveal') return this._reject('host', 'phase', m); this._next(now); return { ok: true }; }
      if (m.t === 'again') {
        if (this.phase !== 'final') return this._reject('host', 'phase', m);
        this.phase = 'lobby'; this.qs = []; this.qi = -1; this.lastReveal = null;
        this.players = this.players.filter(p => p.on);
        this.players.forEach(p => { p.score = 0; p.ans = {}; p.ready = p.host; });
        this._bcast(this.stateMsg()); return { ok: true };
      }
      return this._reject('host', 'type', m);
    },
    _ask(i, now) {
      this.phase = 'question'; this.qi = i; this.qStart = now; this.deadline = now + dur(this.qs[i]); this.lastReveal = null;
      this._bcast(this.stateMsg()); this._bcast(this._qMsg(now));
    },
    /** Punkte: A–D und Wahr/Quatsch richtig = 500 + bis 500 Tempo; Schätzung nach Abstand (bis 800) + 200 für die nächste. */
    _score(q, ans, d) {
      if (q.kind !== 'est') {
        const ok = q.kind === 'mc' ? ans.a === q.c : ans.a === q.t;
        return { ok, pts: ok ? 500 + Math.round(500 * Math.max(0, Math.min(1, (this.deadline - ans.at) / d))) : 0 };
      }
      const err = Math.abs(ans.a - q.v) / Math.max(1e-9, q.max - q.min);
      return { ok: err <= 0.05, pts: Math.round(800 * Math.max(0, 1 - 4 * err)), err };
    },
    _reveal(now) {
      const q = this.qs[this.qi], d = dur(q), res = [];
      let dist = q.kind === 'mc' ? [0, 0, 0, 0] : q.kind === 'tf' ? [0, 0] : [];
      this.players.forEach(p => {
        const ans = p.ans[this.qi]; if (!ans) { res.push({ pid: p.pid, a: null, ok: false, pts: 0 }); return; }
        const s = this._score(q, ans, d);
        res.push({ pid: p.pid, a: ans.a, ok: s.ok, pts: s.pts, err: s.err });
        if (q.kind === 'mc') dist[ans.a]++; else if (q.kind === 'tf') dist[ans.a ? 0 : 1]++; else dist.push({ pid: p.pid, a: ans.a });
      });
      if (q.kind === 'est') {
        const best = Math.min.apply(null, res.filter(r => r.a != null).map(r => r.err).concat([Infinity]));
        res.forEach(r => { if (r.a != null && r.err === best) { r.pts += 200; r.best = true; } });
      }
      res.forEach(r => { delete r.err; const p = this.players.find(x => x.pid === r.pid); p.score += r.pts; });
      this.phase = 'reveal'; this.revealUntil = now + CFG.revealMs;
      const correct = q.kind === 'mc' ? q.c : q.kind === 'tf' ? q.t : q.v;
      this.lastReveal = msg('reveal', { qi: this.qi, total: this.qs.length, q: publicQuestion(q), correct, ex: q.ex || '', dist, res, board: board(this.players), last: this.qi + 1 >= this.qs.length });
      this._bcast(this.stateMsg()); this._bcast(this.lastReveal);
    },
    _next(now) {
      if (this.qi + 1 < this.qs.length) this._ask(this.qi + 1, now);
      else { this.phase = 'final'; this._bcast(this.stateMsg()); this._bcast(msg('final', { board: board(this.players) })); }
    },
    /** Zeit fortschreiben (UI ruft das regelmäßig auf). */
    tick(now) {
      if (this.phase === 'question' && now > this.deadline + CFG.graceMs) this._reveal(now);
      else if (this.phase === 'reveal' && now >= this.revealUntil) this._next(now);
    },
    /** Verbindung weg: in der Lobby Platz frei, im Spiel bleibt der Spieler mit Punkten (offline) für die Wiederverbindung. */
    disconnect(conn, now, bye) {
      const p = this._byConn(conn); if (!p || p.host) return;
      if (this.phase === 'lobby') this.players = this.players.filter(x => x !== p);
      else { p.on = false; p.conn = null; }
      if (this.phase === 'question' && this.players.every(x => !x.on || x.ans[this.qi])) this._reveal(now || 0);
      else this._bcast(this.stateMsg());
      return !!bye;
    },
    /** Host beendet die Show: alle bekommen eine saubere Meldung. */
    abort() { if (this.phase === 'aborted') return; this._bcast(msg('abort', { reason: 'host', text: 'Der Host hat die Show beendet.' })); this.phase = 'aborted'; }
  };

  // ================= Client (Ansicht aus Host-Nachrichten) =================
  function Client() {
    this.v = { phase: 'connecting', me: null, name: '', key: '', code: '', players: [], settings: null, q: null, qi: -1, total: 0,
      deadline: 0, dur: 0, mine: null, reveal: null, board: null, error: null };
  }
  const validPlayers = l => Array.isArray(l) && l.length <= 16 && l.every(p => isObj(p) && isStr(p.pid, 8) && isStr(p.name, 40) && isNum(p.score));
  function validPubQ(q) {
    if (!isObj(q) || !isStr(q.q, 400) || !isStr(q.cat || '', 60)) return false;
    if (q.kind === 'mc') return Array.isArray(q.opts) && q.opts.length === 4 && q.opts.every(o => isStr(o, 200));
    if (q.kind === 'tf') return true;
    return q.kind === 'est' && isNum(q.min) && isNum(q.max) && q.max > q.min && isStr(q.unit || '', 40);
  }
  Client.prototype = {
    /** Nachricht vom Host übernehmen; true, wenn gültig. */
    apply(raw, now) {
      const m = parse(raw), v = this.v; if (!m) return false;
      switch (m.t) {
        case 'welcome':
          if (!isStr(m.pid, 8) || !isStr(m.name, 40) || !(isStr(m.key, 40) && KEY_RE.test(m.key))) return false;
          if (v.phase === 'aborted' || v.phase === 'error') return false;
          v.me = m.pid; v.name = m.name; v.key = m.key; v.code = isStr(m.code, 8) ? m.code : v.code; v.error = null;
          if (v.phase === 'connecting') v.phase = 'wait';
          return true;
        case 'state':
          if (v.phase === 'aborted' || v.phase === 'error') return false;
          if (!validPlayers(m.players) || ['lobby', 'question', 'reveal', 'final'].indexOf(m.phase) < 0 || !isObj(m.settings)) return false;
          v.players = m.players; v.settings = m.settings; v.total = isInt(m.total) ? m.total : v.total;
          if (m.phase === 'lobby') { v.q = null; v.reveal = null; v.board = null; v.mine = null; v.qi = -1; v.phase = 'lobby'; }
          else if (v.phase === 'connecting' || v.phase === 'lobby') v.phase = 'wait';   // q/reveal/final folgt direkt
          return true;
        case 'q':
          if (v.phase === 'aborted' || v.phase === 'error') return false;
          if (!isInt(m.qi) || !isNum(m.left) || !isNum(m.dur) || !validPubQ(m.q) || m.q.kind == null) return false;
          if (m.qi !== v.qi) v.mine = null;
          v.phase = 'question'; v.qi = m.qi; v.total = m.total; v.q = m.q; v.dur = m.dur; v.deadline = (now || 0) + m.left; v.reveal = null;
          return true;
        case 'ack':
          if (m.qi !== v.qi) return false; v.mine = m.a; return true;
        case 'reveal':
          if (!isInt(m.qi) || !Array.isArray(m.res) || !validPlayers(m.board) || !validPubQ(m.q)) return false;
          v.phase = 'reveal'; v.qi = m.qi; v.total = m.total; v.q = m.q; v.reveal = m; v.board = m.board;
          return true;
        case 'final':
          if (!validPlayers(m.board)) return false; v.phase = 'final'; v.board = m.board; return true;
        case 'abort': v.phase = 'aborted'; v.error = isStr(m.text) ? m.text : 'Der Host hat die Show beendet.'; return true;
        case 'err': if (!isStr(m.code, 20)) return false; v.error = isStr(m.text) ? m.text : 'Fehler'; if (m.code !== 'late') v.phase = 'error'; return true;
        default: return false;
      }
    },
    hello(name, key) { return msg('hello', { name: cleanName(name), key: key || undefined }); },
    ready(r) { return msg('ready', { pid: this.v.me, r: !!r }); },
    answer(a) { return msg('answer', { pid: this.v.me, qi: this.v.qi, a }); },
    set(o) { return msg('set', Object.assign({ pid: this.v.me }, o)); },
    cmd(t) { return msg(t, { pid: this.v.me }); },
    bye() { return msg('bye', { pid: this.v.me }); },
    /** Ergebnis für die Karriere (nach final). */
    result() {
      const b = this.v.board || [], me = b.find(p => p.pid === this.v.me);
      return { won: !!me && me.place === 1, place: me ? me.place : b.length, players: b.length, score: me ? me.score : 0 };
    }
  };

  PT.OnlineCore = { V, CFG, MIXES, CATS, CODE_CHARS, CODE_LEN, PEER_PREFIX, makeCode, normCode, makeKey, cleanName, parse, board, buildQuestions, publicQuestion,
    createHost: o => new Host(o || {}), createClient: () => new Client() };

  // ================= Teil 2: Oberfläche + Netzwerk (nur im Browser) =================
  const CSS = `
.pt-on{position:fixed;inset:0;z-index:50;background:#10142a;color:#eef1ff;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow-y:auto;-webkit-overflow-scrolling:touch}
.pt-on *{box-sizing:border-box}
.pt-on-wrap{max-width:560px;margin:0 auto;padding:16px 16px 32px;min-height:100%;display:flex;flex-direction:column;gap:12px}
.pt-on h2{margin:4px 0 0;font-size:24px}.pt-on h3{margin:0;font-size:17px;color:#ffb066}
.pt-on-info{color:#b9c0e0;font-size:14px;margin:0}
.pt-on-card{background:#1a2042;border:1px solid #2b3366;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.pt-on-btn{min-height:48px;padding:10px 16px;border-radius:12px;border:2px solid #2f3a75;background:#222a55;color:#eef1ff;font:inherit;font-weight:700;cursor:pointer;touch-action:manipulation}
.pt-on-btn:hover{border-color:#ff8a1e}.pt-on-btn:focus-visible{outline:3px solid #ff8a1e;outline-offset:2px}
.pt-on-btn[disabled]{opacity:.45;cursor:default}
.pt-on-pri{background:#ff8a1e;border-color:#ff8a1e;color:#1b1206}
.pt-on-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pt-on-row>*{flex:1 1 auto}
.pt-on input[type=text],.pt-on input[type=number],.pt-on select{min-height:48px;border-radius:12px;border:2px solid #2f3a75;background:#0c1022;color:#fff;font:inherit;padding:8px 12px;width:100%}
.pt-on-code{font:800 40px/1 ui-monospace,Consolas,monospace;letter-spacing:6px;color:#ff8a1e;text-align:center}
.pt-on-link{font-size:13px;color:#b9c0e0;word-break:break-all;text-align:center}
.pt-on-qr{width:180px;height:180px;margin:0 auto;background:#fff;padding:8px;border-radius:10px}.pt-on-qr svg{width:100%;height:100%;display:block}
.pt-on-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.pt-on-list li{display:flex;justify-content:space-between;gap:8px;padding:8px 12px;background:#141a38;border-radius:10px}
.pt-on-off{opacity:.45}.pt-on-me{outline:2px solid #ff8a1e}
.pt-on-seg{display:flex;gap:6px}.pt-on-seg .pt-on-btn{flex:1}.pt-on-seg .on{background:#ff8a1e;color:#1b1206;border-color:#ff8a1e}
.pt-on-top{display:flex;justify-content:space-between;color:#b9c0e0;font-size:14px}
.pt-on-bar{height:10px;border-radius:5px;background:#252c58;overflow:hidden}.pt-on-bar i{display:block;height:100%;background:#ff8a1e;width:100%}
.pt-on-q{font-size:21px;font-weight:700;margin:4px 0}
.pt-on-ans{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pt-on-ans .pt-on-btn{min-height:72px;text-align:left;display:flex;gap:10px;align-items:center;font-weight:600}
.pt-on-ans b{display:inline-grid;place-items:center;min-width:32px;height:32px;border-radius:8px;background:#0c1022;color:#ff8a1e}
.pt-on-ans .sel{border-color:#ff8a1e;box-shadow:0 0 0 2px #ff8a1e inset}
.pt-on-ans .ok{background:#1f6b3a;border-color:#3fd37a}.pt-on-ans .no{background:#5a1f2a;border-color:#ff5d73}
.pt-on-big{font:800 30px/1.1 ui-monospace,Consolas,monospace;text-align:center;color:#ff8a1e}
.pt-on input[type=range]{width:100%;height:44px;accent-color:#ff8a1e}
.pt-on-dist{display:flex;flex-direction:column;gap:4px;font-size:14px}.pt-on-dist div{display:flex;gap:8px;align-items:center}
.pt-on-dist span{flex:0 0 70px}.pt-on-dist em{flex:1;height:14px;background:#252c58;border-radius:7px;overflow:hidden}.pt-on-dist em i{display:block;height:100%;background:#ff8a1e}
.pt-on-pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;margin-top:8px}
.pt-on-pod div{flex:1;max-width:150px;text-align:center;background:#222a55;border-radius:12px 12px 0 0;padding:8px 4px;display:flex;flex-direction:column;justify-content:flex-end}
.pt-on-pod .p1{height:170px;background:#ff8a1e;color:#1b1206}.pt-on-pod .p2{height:130px}.pt-on-pod .p3{height:100px}
.pt-on-pod strong{font-size:28px}.pt-on-err{color:#ff9aa8}.pt-on-good{color:#6ff0a0}`;

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
  }
  const ensurePeer = () => root.Peer ? Promise.resolve() : loadScript('../vendor/peerjs-1.5.4.min.js');
  const ensureQR = () => root.qrcode ? Promise.resolve() : loadScript('../vendor/qrcode-generator-1.4.4.js').catch(() => {});
  const fx = n => { try { if (PT.Audio && PT.Audio.fx) PT.Audio.fx(n); } catch (e) {} };
  const esc = s => PT.esc ? PT.esc(s) : String(s);
  const store = {
    get(k, ses) { try { return (ses ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, val, ses) { try { (ses ? sessionStorage : localStorage).setItem(k, val); } catch (e) {} }
  };
  const fmtNum = n => (+n).toLocaleString('de-DE', { maximumFractionDigits: 3 });
  function shareUrl(code) {
    const u = location.href.split('#')[0].split('?')[0] + '?join=' + code;
    return window.EasyGamesLink ? EasyGamesLink.share(u) : u;
  }
  function niceStep(min, max) { const r = (max - min) / 400, p = Math.pow(10, Math.floor(Math.log10(r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }   // 1/2/5 × 10^k

  function Session(el, opts, joinCode) {
    const S = this;
    opts = opts || {};
    S.el = el; S.opts = opts; S.timers = []; S.closed = false; S.resultSent = false; S.sel = 0;
    if (!document.getElementById('pt-online-css')) { const st = document.createElement('style'); st.id = 'pt-online-css'; st.textContent = CSS; document.head.appendChild(st); }
    S.box = document.createElement('div'); S.box.className = 'pt-on'; S.box.setAttribute('role', 'dialog'); S.box.setAttribute('aria-label', 'Online-Quizshow');
    el.appendChild(S.box);
    S.name = cleanName(opts.name || store.get('pt-online-name') || '');
    S.onKey = e => S.key(e); document.addEventListener('keydown', S.onKey);
    S.box.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) S.act(b.dataset.a, b.dataset.v, b); });
    S.box.addEventListener('change', e => { const t = e.target; if (t.dataset.set) S.toHost(S.client.set({ [t.dataset.set]: t.value })); });
    S.box.addEventListener('input', e => { const t = e.target; if (t.dataset.est != null) { S.est = +t.value; const o = S.box.querySelector(t.type === 'range' ? '[data-est-n]' : '[data-est-r]'); if (o && o !== t) o.value = t.value; const big = S.box.querySelector('.pt-on-big'); if (big) big.textContent = fmtNum(S.est); } });
    S.loop = setInterval(() => S.tick(), 200);
    if (joinCode) S.join(joinCode); else S.menu();
  }
  Session.prototype = {
    later(fn, ms) { const t = setTimeout(() => { S_remove(this.timers, t); if (!this.closed) fn(); }, ms); this.timers.push(t); return t; },
    screen(key, html) { this.key_ = key; this.box.innerHTML = '<div class="pt-on-wrap">' + html + '</div>'; const f = this.box.querySelector('[autofocus]'); if (f) try { f.focus(); } catch (e) {} },
    header() { return '<h2>🌐 Online-Quizshow</h2>'; },
    menu(err, code) {
      this.cleanupNet(); this.mode = null;
      this.screen('menu', this.header() +
        '<p class="pt-on-info">Hoste deine eigene Quizshow oder tritt einer bei. Mitspieler können per Link, Code oder QR-Code von überall beitreten – 2 bis 8 Geräte.</p>' +
        (err ? '<p class="pt-on-err">' + esc(err) + '</p>' : '') +
        '<div class="pt-on-card"><label for="pt-on-name">Dein Name</label><input id="pt-on-name" type="text" maxlength="16" autocomplete="nickname" value="' + esc(this.name) + '">' +
        '<button class="pt-on-btn pt-on-pri" data-a="host">🎙️ Show hosten</button></div>' +
        '<div class="pt-on-card"><label for="pt-on-code">Beitreten mit Code</label><div class="pt-on-row"><input id="pt-on-code" type="text" maxlength="5" autocapitalize="characters" autocomplete="off" placeholder="z. B. K7QX2" value="' + esc(code || '') + '">' +
        '<button class="pt-on-btn" data-a="join">Beitreten</button></div></div>' +
        '<button class="pt-on-btn" data-a="exit">← Zurück</button>');
    },
    readName() { const i = this.box.querySelector('#pt-on-name'); if (i) this.name = cleanName(i.value); store.set('pt-online-name', this.name); },
    busy(text) { this.screen('busy', this.header() + '<div class="pt-on-card"><p>' + esc(text) + '</p></div><button class="pt-on-btn" data-a="menu">Abbrechen</button>'); },
    fail(text, retry) {
      this.cleanupNet();
      this.retry = retry;
      this.screen('fail', this.header() + '<div class="pt-on-card"><p class="pt-on-err">' + esc(text) + '</p></div>' +
        (retry ? '<button class="pt-on-btn pt-on-pri" data-a="retry" autofocus>🔄 Nochmal</button>' : '') + '<button class="pt-on-btn" data-a="menu">Zurück</button>');
    },
    cleanupNet() {
      clearTimeout(this.connTo); this.connTo = null;
      if (this.conns) this.conns.forEach(c => { try { c.close(); } catch (e) {} });
      if (this.conn) { try { this.conn.close(); } catch (e) {} }
      if (this.peer) { try { this.peer.destroy(); } catch (e) {} }
      this.conns = null; this.conn = null; this.peer = null; this.host = null;
    },
    // ---------- Host ----------
    startHost(tries) {
      tries = tries || 0; this.mode = 'host'; this.busy('Show wird eröffnet …');
      const S = this, code = makeCode();
      S.client = new Client(); S.client.v.code = code;
      S.host = new Host({ code, hostName: S.name, send: (to, m) => S.hostSend(to, m) });
      S.host.greetHost();
      S.conns = new Map(); let n = 0;
      Promise.all([ensurePeer(), ensureQR()]).then(() => {
        if (S.closed || S.mode !== 'host' || S.host === null) return;
        let peer; try { peer = new root.Peer(PEER_PREFIX + code); } catch (e) { S.fail('Online-Verbindung nicht möglich.', () => S.startHost()); return; }
        S.peer = peer;
        S.connTo = setTimeout(() => S.fail('Keine Verbindung zum Online-Dienst. Bitte Internet prüfen.', () => S.startHost()), 15000);
        peer.on('open', () => { clearTimeout(S.connTo); S.open = true; S.render(); });
        peer.on('error', e => {
          if (S.peer !== peer) return;
          if (e && e.type === 'unavailable-id' && tries < 5) { S.cleanupNet(); S.startHost(tries + 1); return; }
          if (!S.open) S.fail('Online-Verbindung nicht möglich (' + ((e && e.type) || 'Fehler') + ').', () => S.startHost());
        });
        peer.on('connection', c => {
          const id = 'c' + (++n); S.conns.set(id, c);
          c.on('data', d => { if (S.host) { S.host.receive(id, d, Date.now()); } });
          const gone = () => { if (S.conns && S.conns.get(id) === c) { S.conns.delete(id); if (S.host) S.host.disconnect(id, Date.now()); } };
          c.on('close', gone); c.on('error', gone);
        });
      }, () => S.fail('Online-Modul konnte nicht geladen werden (Internet?).', () => S.startHost()));
    },
    hostSend(to, m) {
      if (to === 'host') { Promise.resolve().then(() => { if (!this.closed && this.client) { this.client.apply(m, Date.now()); this.onView(m); } }); return; }
      const c = this.conns && this.conns.get(to); if (c && c.open) c.send(m);
    },
    // ---------- Client ----------
    join(code) {
      code = normCode(code);
      if (code.length !== CODE_LEN) { this.menu('Der Code hat ' + CODE_LEN + ' Zeichen.', code); return; }
      this.mode = 'client'; this.code = code; this.open = false;
      const S = this; S.client = new Client(); S.client.v.code = code;
      S.busy('Verbinde mit Show ' + code + ' …');
      ensurePeer().then(() => {
        if (S.closed || S.mode !== 'client') return;
        let peer; try { peer = new root.Peer(); } catch (e) { S.fail('Online-Verbindung nicht möglich.', () => S.join(code)); return; }
        S.peer = peer;
        S.connTo = setTimeout(() => S.fail('Keine Antwort von Show ' + code + '. Stimmt der Code und läuft die Show noch?', () => S.join(code)), 20000);
        peer.on('error', e => {
          if (S.peer !== peer) return;
          if (e && e.type === 'peer-unavailable') S.fail('Show ' + code + ' nicht gefunden. Stimmt der Code und läuft die Show noch?', () => S.join(code));
          else if (!S.conn || !S.conn.open) S.fail('Verbindungsfehler (' + ((e && e.type) || 'unbekannt') + ').', () => S.join(code));
        });
        peer.on('open', () => {
          const c = peer.connect(PEER_PREFIX + code, { reliable: true }); S.conn = c;
          c.on('open', () => { clearTimeout(S.connTo); S.open = true; c.send(S.client.hello(S.name, store.get('pt-online-key-' + code, true) || makeKey())); });
          c.on('data', d => { if (S.conn === c && S.client.apply(d, Date.now())) S.onView(parse(d)); });
          c.on('close', () => { if (S.conn !== c) return; S.conn = null; const ph = S.client.v.phase; if (ph !== 'aborted' && ph !== 'error' && ph !== 'final') S.fail('Verbindung zur Show verloren.', () => S.join(code)); });
        });
      }, () => S.fail('Online-Modul konnte nicht geladen werden (Internet?).', () => S.join(code)));
    },
    toHost(m) {
      if (this.mode === 'host') { if (this.host) this.host.receive('host', m, Date.now()); }
      else if (this.conn && this.conn.open) this.conn.send(m);
    },
    // ---------- Ansicht ----------
    onView(m) {
      const v = this.client.v;
      if (m && m.t === 'welcome' && this.mode === 'client') store.set('pt-online-key-' + v.code, v.key, true);
      if (m && m.t === 'q' && this.lastQ !== v.qi) { this.lastQ = v.qi; this.sel = -1; this.est = null; this.timeUp = -1; fx('pop'); }
      if (m && m.t === 'reveal') { const r = m.res.find(x => x.pid === v.me); fx(r && r.pts > 0 ? 'good' : 'bad'); }
      if (m && m.t === 'final') { fx('win'); if (!this.resultSent) this.later(() => this.sendResult(), 3500); }
      if (m && m.t === 'state' && v.phase === 'lobby') this.resultSent = false;
      this.render();
    },
    sendResult() { if (this.resultSent || !this.client || this.client.v.phase !== 'final') return; this.resultSent = true; try { this.opts.onResult && this.opts.onResult(this.client.result()); } catch (e) {} },
    render() {
      if (this.closed || !this.client) return;
      const v = this.client.v;
      if (this.mode === 'host' && !this.open) return;
      if (v.phase === 'aborted' || v.phase === 'error') { const t = v.error || 'Die Show wurde beendet.'; this.cleanupNet(); this.fail(t, null); return; }
      if (v.phase === 'lobby') return this.lobby(v);
      if (v.phase === 'question' && v.q) return this.question(v);
      if (v.phase === 'reveal' && v.reveal) return this.reveal(v);
      if (v.phase === 'final' && v.board) return this.final(v);
      if (this.key_ !== 'wait') this.screen('wait', this.header() + '<div class="pt-on-card"><p>Verbunden – gleich geht es los …</p></div><button class="pt-on-btn" data-a="leave">Verlassen</button>');
    },
    playerList(v, showReady) {
      return v.players.map(p => '<li class="' + (p.on ? '' : 'pt-on-off ') + (p.pid === v.me ? 'pt-on-me' : '') + '"><span>' + (p.host ? '🎙️ ' : '') + esc(p.name) + (p.on ? '' : ' (weg)') + '</span><span>' +
        (showReady ? (p.host ? 'Host' : p.ready ? '✅ bereit' : '⏳') : (v.phase === 'question' ? (p.done ? '✔️ ' : '… ') : '') + PT.fmt(p.score)) + '</span></li>').join('');
    },
    lobby(v) {
      const isHost = this.mode === 'host', url = shareUrl(v.code), me = v.players.find(p => p.pid === v.me) || {};
      if (this.key_ !== 'lobby') {
        let qr = '';
        if (isHost && root.qrcode) { try { const q = root.qrcode(0, 'M'); q.addData(url); q.make(); qr = '<div class="pt-on-qr" aria-label="QR-Code zum Beitreten">' + q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }) + '</div>'; } catch (e) {} }
        const seg = (key, vals) => '<div class="pt-on-seg">' + vals.map(x => '<button class="pt-on-btn" data-a="set" data-v="' + key + ':' + x + '">' + x + '</button>').join('') + '</div>';
        this.screen('lobby', this.header() +
          '<div class="pt-on-card"><h3>Show-Code</h3><div class="pt-on-code">' + esc(v.code) + '</div>' + qr +
          '<div class="pt-on-link">' + esc(url) + '</div><div class="pt-on-row"><button class="pt-on-btn" data-a="copy">🔗 Link kopieren</button>' +
          (navigator.share ? '<button class="pt-on-btn" data-a="share">📤 Teilen</button>' : '') + '</div>' +
          '<p class="pt-on-info">Mitspieler können per Link, Code oder QR-Code von überall beitreten.</p></div>' +
          '<div class="pt-on-card"><h3>Spieler <span data-n></span></h3><ul class="pt-on-list" data-list></ul></div>' +
          (isHost ? '<div class="pt-on-card"><h3>Einstellungen</h3><label>Fragen</label>' + seg('rounds', CFG.rounds) +
            '<label for="pt-on-mix">Fragen-Mix</label><select id="pt-on-mix" data-set="mix">' + Object.keys(MIXES).map(k => '<option value="' + k + '">' + MIXES[k] + '</option>').join('') + '</select>' +
            '<label for="pt-on-cat">Kategorie</label><select id="pt-on-cat" data-set="cat"><option value="alle">Alle Kategorien</option>' + CATS.map(c => '<option>' + esc(c) + '</option>').join('') + '</select></div>' +
            '<p class="pt-on-info" data-why></p><button class="pt-on-btn pt-on-pri" data-a="start">▶ Show starten</button>'
            : '<p class="pt-on-info" data-set-info></p><button class="pt-on-btn pt-on-pri" data-a="ready"></button>') +
          '<button class="pt-on-btn" data-a="leave">' + (isHost ? 'Show beenden' : 'Verlassen') + '</button>');
      }
      const $ = s => this.box.querySelector(s);
      $('[data-list]').innerHTML = this.playerList(v, true);
      $('[data-n]').textContent = '(' + v.players.filter(p => p.on).length + '/' + CFG.maxPlayers + ')';
      const s = v.settings || {};
      if (isHost) {
        this.box.querySelectorAll('[data-a=set]').forEach(b => b.classList.toggle('on', b.dataset.v === 'rounds:' + s.rounds));
        $('#pt-on-mix').value = s.mix; $('#pt-on-cat').value = s.cat;
        const why = this.host ? this.host.canStart() : ''; $('[data-why]').textContent = why || 'Alle bereit – los geht’s!'; $('[data-a=start]').disabled = !!why;
      } else {
        $('[data-set-info]').textContent = (s.rounds || 8) + ' Fragen · ' + (MIXES[s.mix] || '') + ' · ' + (s.cat === 'alle' || !s.cat ? 'Alle Kategorien' : s.cat) + ' – der Host startet, wenn alle bereit sind.';
        const b = $('[data-a=ready]'); b.textContent = me.ready ? '✅ Bereit (zurücknehmen)' : '✋ Ich bin bereit'; b.classList.toggle('pt-on-pri', !me.ready);
      }
    },
    question(v) {
      const k = 'q' + v.qi + ':' + (v.mine != null);
      const q = v.q, locked = v.mine != null || Date.now() > v.deadline;
      if (this.key_ !== k) {
        let body = '';
        if (q.kind === 'mc') body = '<div class="pt-on-ans">' + q.opts.map((o, i) => '<button class="pt-on-btn' + (v.mine === i ? ' sel' : '') + '" data-a="ans" data-v="' + i + '"' + (locked ? ' disabled' : '') + '><b>' + 'ABCD'[i] + '</b><span>' + esc(o) + '</span></button>').join('') + '</div>';
        else if (q.kind === 'tf') body = '<div class="pt-on-ans">' + [['true', '✔ Wahr'], ['false', '✖ Quatsch']].map((o, i) => '<button class="pt-on-btn' + (v.mine === (i === 0) ? ' sel' : '') + '" data-a="ans" data-v="' + o[0] + '"' + (locked ? ' disabled' : '') + '><b>' + (i + 1) + '</b><span>' + o[1] + '</span></button>').join('') + '</div>';
        else {
          const step = niceStep(q.min, q.max), val = v.mine != null ? v.mine : this.est != null ? this.est : Math.round((q.min + q.max) / 2 / step) * step;
          this.est = val;
          body = '<div class="pt-on-card"><div class="pt-on-big">' + fmtNum(val) + '</div><div class="pt-on-info" style="text-align:center">' + esc(q.unit) + '</div>' +
            '<input type="range" data-est data-est-r min="' + q.min + '" max="' + q.max + '" step="' + step + '" value="' + val + '"' + (locked ? ' disabled' : '') + ' aria-label="Schätzwert">' +
            '<div class="pt-on-row"><input type="number" data-est data-est-n min="' + q.min + '" max="' + q.max + '" step="any" value="' + val + '"' + (locked ? ' disabled' : '') + ' aria-label="Schätzwert eintippen">' +
            '<button class="pt-on-btn pt-on-pri" data-a="est"' + (locked ? ' disabled' : '') + '>Einloggen</button></div>' +
            '<div class="pt-on-info">' + fmtNum(q.min) + ' – ' + fmtNum(q.max) + ' ' + esc(q.unit) + '</div></div>';
        }
        this.screen(k, '<div class="pt-on-top"><span>Frage ' + (v.qi + 1) + '/' + v.total + '</span><span>' + esc(q.cat || '') + '</span><span data-time></span></div>' +
          '<div class="pt-on-bar"><i data-bar></i></div><div class="pt-on-q">' + esc(q.q) + '</div>' + body +
          '<p class="pt-on-info" data-st>' + (v.mine != null ? '🔒 Antwort eingeloggt – warte auf die anderen …' : q.kind === 'mc' ? 'Tasten 1–4 oder Pfeile + Enter' : q.kind === 'tf' ? 'Taste 1 = Wahr, 2 = Quatsch' : 'Regler, Pfeiltasten oder Zahl eintippen, dann Enter') + '</p>' +
          '<div class="pt-on-card"><ul class="pt-on-list" data-list></ul></div><button class="pt-on-btn" data-a="leave">' + (this.mode === 'host' ? 'Show beenden' : 'Verlassen') + '</button>');
        this.hilite();
      }
      this.box.querySelector('[data-list]').innerHTML = this.playerList(v, false);
      this.tick();
    },
    hilite() { if (this.client.v.mine != null) return; this.box.querySelectorAll('[data-a=ans]').forEach((b, i) => b.classList.toggle('sel', i === this.sel)); },
    reveal(v) {
      const k = 'r' + v.qi;
      if (this.key_ === k) return;
      const r = v.reveal, q = r.q, mine = r.res.find(x => x.pid === v.me), names = {};
      v.players.forEach(p => { names[p.pid] = p.name; });
      let body = '';
      if (q.kind === 'mc' || q.kind === 'tf') {
        const labels = q.kind === 'mc' ? q.opts : ['✔ Wahr', '✖ Quatsch'], right = q.kind === 'mc' ? r.correct : r.correct ? 0 : 1;
        const mineIdx = mine && mine.a != null ? (q.kind === 'mc' ? mine.a : mine.a ? 0 : 1) : -1, sum = Math.max(1, r.dist.reduce((a, b) => a + b, 0));
        body = '<div class="pt-on-ans">' + labels.map((o, i) => '<button class="pt-on-btn ' + (i === right ? 'ok' : i === mineIdx ? 'no' : '') + '" disabled><b>' + (q.kind === 'mc' ? 'ABCD'[i] : i + 1) + '</b><span>' + esc(o) + ' · ' + r.dist[i] + '×</span></button>').join('') + '</div>' +
          '<div class="pt-on-dist">' + labels.map((o, i) => '<div><span>' + (q.kind === 'mc' ? 'ABCD'[i] : i ? 'Quatsch' : 'Wahr') + '</span><em><i style="width:' + Math.round(100 * r.dist[i] / sum) + '%"></i></em><span>' + r.dist[i] + '</span></div>').join('') + '</div>';
      } else {
        const sorted = r.dist.slice().sort((a, b) => Math.abs(a.a - r.correct) - Math.abs(b.a - r.correct));
        body = '<div class="pt-on-card"><div class="pt-on-big">' + fmtNum(r.correct) + ' ' + esc(q.unit) + '</div><ul class="pt-on-list">' +
          sorted.map(d => { const x = r.res.find(y => y.pid === d.pid) || {}; return '<li><span>' + (x.best ? '🎯 ' : '') + esc(names[d.pid] || '?') + '</span><span>' + fmtNum(d.a) + ' · +' + x.pts + '</span></li>'; }).join('') + '</ul></div>';
      }
      this.screen(k, '<div class="pt-on-top"><span>Auflösung ' + (v.qi + 1) + '/' + v.total + '</span><span>' + esc(q.cat || '') + '</span></div><div class="pt-on-q">' + esc(q.q) + '</div>' + body +
        '<p class="' + (mine && mine.pts > 0 ? 'pt-on-good' : 'pt-on-err') + '"><strong>' + (!mine || mine.a == null ? '⏰ Keine Antwort' : mine.pts > 0 ? (mine.ok ? '✔ Richtig!' : '👍 Nah dran!') + ' +' + mine.pts : '✖ Leider falsch') + '</strong></p>' +
        (r.ex ? '<p class="pt-on-info">💡 ' + esc(r.ex) + '</p>' : '') +
        '<div class="pt-on-card"><h3>Zwischenstand</h3><ul class="pt-on-list">' + r.board.map(p => '<li class="' + (p.pid === v.me ? 'pt-on-me' : '') + '"><span>' + p.place + '. ' + esc(p.name) + '</span><span>' + PT.fmt(p.score) + '</span></li>').join('') + '</ul></div>' +
        (this.mode === 'host' ? '<button class="pt-on-btn pt-on-pri" data-a="next" autofocus>' + (r.last ? '🏆 Zur Siegerehrung' : 'Weiter ▶') + '</button>' : '<p class="pt-on-info">Gleich geht es weiter …</p>'));
    },
    final(v) {
      if (this.key_ === 'final') return;
      const b = v.board, top = [b[1], b[0], b[2]];
      this.screen('final', this.header() + '<h3>🏆 Siegerehrung</h3><div class="pt-on-pod">' + top.map((p, i) => p ? '<div class="p' + p.place + '"><strong>' + ['🥈', '🥇', '🥉'][i] + '</strong>' + esc(p.name) + '<br>' + PT.fmt(p.score) + '</div>' : '').join('') + '</div>' +
        '<div class="pt-on-card"><ul class="pt-on-list">' + b.map(p => '<li class="' + (p.pid === v.me ? 'pt-on-me' : '') + '"><span>' + p.place + '. ' + esc(p.name) + '</span><span>' + PT.fmt(p.score) + '</span></li>').join('') + '</ul></div>' +
        (this.mode === 'host' ? '<button class="pt-on-btn pt-on-pri" data-a="again">🔁 Nochmal spielen</button>' : '') +
        '<button class="pt-on-btn" data-a="done" autofocus>Fertig</button>');
    },
    tick() {
      if (this.closed) return;
      const now = Date.now();
      if (this.host) this.host.tick(now);
      const v = this.client && this.client.v;
      if (!v || v.phase !== 'question' || !this.key_ || this.key_[0] !== 'q') return;
      const left = Math.max(0, v.deadline - now), bar = this.box.querySelector('[data-bar]'), t = this.box.querySelector('[data-time]');
      if (bar) bar.style.width = (100 * left / Math.max(1, v.dur)) + '%';
      const s = Math.ceil(left / 1000);
      if (t && t.textContent !== s + ' s') { t.textContent = s + ' s'; if (s <= 5 && s > 0 && v.mine == null) fx('tick'); }
      if (!left && v.mine == null && this.timeUp !== v.qi) { this.timeUp = v.qi; this.box.querySelectorAll('[data-a=ans],[data-a=est],[data-est]').forEach(b => { b.disabled = true; }); const st = this.box.querySelector('[data-st]'); if (st) st.textContent = '⏰ Zeit ist um!'; }
    },
    answer(a) {
      const v = this.client.v; if (v.phase !== 'question' || v.mine != null || Date.now() > v.deadline) return;
      fx('click'); v.mine = a; this.toHost(this.client.answer(a)); this.render();
    },
    act(a, val) {
      const v = this.client && this.client.v;
      switch (a) {
        case 'host': this.readName(); this.open = false; this.startHost(); break;
        case 'join': { this.readName(); const i = this.box.querySelector('#pt-on-code'); this.join(i ? i.value : ''); break; }
        case 'exit': this.exit(); break;
        case 'menu': this.leave(true); break;
        case 'retry': if (this.retry) this.retry(); break;
        case 'leave': this.leave(true); break;
        case 'copy': this.copy(); break;
        case 'share': try { navigator.share({ title: 'AnMaCha Online-Quizshow', text: 'Spiel mit in meiner Quizshow! Code: ' + v.code, url: shareUrl(v.code) }).catch(() => {}); } catch (e) {} break;
        case 'set': { const p = String(val).split(':'); this.toHost(this.client.set({ [p[0]]: +p[1] })); break; }
        case 'ready': { const me = v.players.find(p => p.pid === v.me); this.toHost(this.client.ready(!(me && me.ready))); break; }
        case 'start': this.toHost(this.client.cmd('start')); break;
        case 'next': this.toHost(this.client.cmd('next')); break;
        case 'again': this.toHost(this.client.cmd('again')); break;
        case 'ans': this.answer(v.q.kind === 'mc' ? +val : val === 'true'); break;
        case 'est': { const n = this.box.querySelector('[data-est-n]'); let x = n ? +String(n.value).replace(',', '.') : this.est; if (!isFinite(x)) return; x = Math.min(v.q.max, Math.max(v.q.min, x)); this.answer(x); break; }
        case 'done': this.sendResult(); this.leave(false); this.exit(); break;
      }
    },
    copy() {
      const url = shareUrl(this.client.v.code), b = this.box.querySelector('[data-a=copy]');
      const ok = () => { if (b) { b.textContent = '✔ Kopiert'; this.later(() => { b.textContent = '🔗 Link kopieren'; }, 1800); } };
      const old = () => { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} t.remove(); };
      try { navigator.clipboard.writeText(url).then(ok, old); } catch (e) { old(); }
    },
    key(e) {
      if (this.closed || e.defaultPrevented) return;
      const v = this.client && this.client.v, tag = e.target && e.target.tagName, inInput = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (this.key_ === 'menu') { if (e.key === 'Enter' && e.target && e.target.id === 'pt-on-code') { e.preventDefault(); this.act('join'); } return; }
      if (!v) return;
      if (v.phase === 'question' && v.q && v.mine == null) {
        const q = v.q;
        if (q.kind === 'est') {
          if (e.key === 'Enter') { e.preventDefault(); if (e.target && e.target.type === 'range') { const n = this.box.querySelector('[data-est-n]'); if (n) n.value = this.est; } this.act('est'); return; }
          if (!inInput && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault(); const r = this.box.querySelector('[data-est-r]'); if (!r) return;
            const d = (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1) * (q.max - q.min) / 100;
            r.value = Math.min(q.max, Math.max(q.min, +r.value + d)); r.dispatchEvent(new Event('input', { bubbles: true }));
          }
          return;
        }
        if (inInput) return;
        const n = q.kind === 'mc' ? 4 : 2, num = parseInt(e.key, 10);
        if (num >= 1 && num <= n) { e.preventDefault(); this.act('ans', q.kind === 'mc' ? String(num - 1) : num === 1 ? 'true' : 'false'); return; }
        const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: q.kind === 'mc' ? -2 : -1, ArrowDown: q.kind === 'mc' ? 2 : 1 }[e.key];
        if (mv) { e.preventDefault(); this.sel = this.sel < 0 ? 0 : (this.sel + mv + n) % n; this.hilite(); return; }
        if (e.key === 'Enter' && this.sel >= 0 && tag !== 'BUTTON') { e.preventDefault(); this.act('ans', q.kind === 'mc' ? String(this.sel) : this.sel === 0 ? 'true' : 'false'); }
        return;
      }
      if (e.key !== 'Enter' || inInput || (tag === 'BUTTON')) return;   // Knopf mit Fokus löst Enter selbst aus
      if (v.phase === 'lobby') { e.preventDefault(); this.act(this.mode === 'host' ? 'start' : 'ready'); }
      else if (v.phase === 'reveal' && this.mode === 'host') { e.preventDefault(); this.act('next'); }
      else if (v.phase === 'final') { e.preventDefault(); this.act('done'); }
    },
    /** Show verlassen; toMenu: zurück zum Startbildschirm. Host beendet die Show sauber für alle. */
    leave(toMenu) {
      if (this.host) { this.host.abort(); const peer = this.peer, conns = this.conns; this.peer = null; this.conns = null; this.host = null;
        setTimeout(() => { if (conns) conns.forEach(c => { try { c.close(); } catch (e) {} }); if (peer) try { peer.destroy(); } catch (e) {} }, 300); }
      else if (this.conn && this.conn.open && this.client) { try { this.conn.send(this.client.bye()); } catch (e) {} const c = this.conn, p = this.peer; this.conn = null; this.peer = null; setTimeout(() => { try { c.close(); } catch (e) {} try { p && p.destroy(); } catch (e) {} }, 200); }
      this.cleanupNet(); this.client = null; this.open = false;
      if (toMenu) this.menu();
    },
    exit() { const f = this.opts.onExit; this.close(); try { f && f(); } catch (e) {} },
    close() {
      if (this.closed) return;
      this.leave(false); this.closed = true;
      clearInterval(this.loop); this.timers.forEach(clearTimeout); this.timers = [];
      document.removeEventListener('keydown', this.onKey);
      if (this.box.parentNode) this.box.parentNode.removeChild(this.box);
    }
  };
  function S_remove(arr, x) { const i = arr.indexOf(x); if (i >= 0) arr.splice(i, 1); }

  PT.Online = {
    open(el, opts) { const s = new Session(el || document.body, opts); return { close: () => s.close() }; },
    join(el, code, opts) { const s = new Session(el || document.body, opts, code || ' '); return { close: () => s.close() }; },
    shareUrl
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PT.OnlineCore;
})(typeof window !== 'undefined' ? window : globalThis);
