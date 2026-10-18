/* Spinwelten 3D – private Online-Räume: Regeln und Protokoll (ohne DOM, in Node testbar).
 * Der Gastgeber ist die Autorität: Er würfelt, prüft jede Aktion (Folgenummer + eindeutige Aktions-ID) und verteilt den
 * Zustand mit Versionsnummer und Prüfsumme. Gäste schicken nur Wünsche. Leere Plätze besetzen Computer-Spieler (als Bot markiert).
 * Modi: Inselrennen (Punkte aus Spins), Schatzduell (verdeckte Fundstellen, gleiche Wahl teilt die Beute), Weltenhilfe (gemeinsames Ziel). */
(function (SW) {
  'use strict';
  const MODES = {
    race: { rounds: 10, name: { de: 'Inselrennen', en: 'Island Race' }, desc: { de: 'Alle drehen gleichzeitig. Wer nach 10 Runden die meisten Baupunkte hat, gewinnt.', en: 'Everyone spins at once. Most build points after 10 rounds wins.' } },
    duel: { rounds: 8, name: { de: 'Schatzduell', en: 'Treasure Duel' }, desc: { de: 'Jede Runde sechs verdeckte Fundstellen. Wählen mehrere dieselbe, wird die Beute geteilt.', en: 'Six hidden spots each round. Players picking the same spot share its loot.' } },
    coop: { rounds: 10, name: { de: 'Weltenhilfe', en: 'World Aid' }, desc: { de: 'Gemeinsam eine Insel aufbauen: Alle Spins zählen für das Teamziel.', en: 'Build an island together: every spin counts toward the team goal.' } }
  };
  const DUEL_VALUES = [60, 35, 25, 15, 8, 0];
  const BOT_NAMES = ['Tara', 'Bruno', 'Nila', 'Pip', 'Momo', 'Lio', 'Yara', 'Ole'];
  const ROUND_MS = 20000, MAX_PLAYERS = 8, MIN_SEATS = 2;
  // Kurzer deutscher Code: Wort + 2 Ziffern, nur Zeichen ohne Verwechslungsgefahr (passt zum Server-Format: 5 Zeichen ohne I, L, O, 0, 1)
  const WORDS = ['BAU', 'BUS', 'HUT', 'MUT', 'TAU', 'ZUG', 'WEG', 'TEE', 'SEE', 'REH', 'KUH', 'BAD', 'ARM', 'AST', 'RAD', 'DAX', 'BAR', 'ZWERG'.slice(0, 3)];
  function makeCode(rng) { const r = rng || SW.rng.secure(); return r.pick(WORDS) + r.range(2, 9) + '' + r.range(2, 9); }
  function validCode(c) { return /^[A-HJKMNP-Z]{3}[2-9]{2}$/.test(String(c || '').trim().toUpperCase()); }
  // Prüfsumme über eine kanonische JSON-Darstellung (FNV-1a, 32 Bit)
  function canon(o) { if (o === null || typeof o !== 'object') return JSON.stringify(o); if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']'; return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}'; }
  function checksum(o) { const s = canon(o); let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }
  function spinPoints(rng) {
    const r = SW.ECON.roll(rng), ev = SW.ECON.evaluate(r.ids), p = ev.pay || {};
    let pts = Math.round((p.coins || 0) / 2) + (p.material || 0) * 2 + (p.spins || 0) + (p.shield ? 6 : 0) + (p.action ? 8 : 0) + (p.relics ? 3 : 0);
    if (r.ids[0] === r.ids[1] && r.ids[1] === r.ids[2]) pts += 5;
    return { ids: r.ids, pts: Math.max(1, Math.min(300, pts)) };
  }
  class Host {
    constructor(o) {
      this.rng = o.rng || SW.rng.secure(); this.now = o.now || (() => Date.now());
      this.st = { v: 0, mode: MODES[o.mode] ? o.mode : 'race', phase: 'lobby', round: 0, rounds: 0, code: o.code || makeCode(this.rng), max: Math.min(MAX_PLAYERS, Math.max(2, o.max || 4)),
        players: [], log: [], goal: 0, team: 0, reveal: null, deadline: 0, session: SW.rng.uid(10) };
      this.seq = {}; this.aids = {}; this.layout = null; this.acted = {};
      this.join(o.hostId, o.hostName || 'Host', true);
    }
    get code() { return this.st.code; }
    bump() { this.st.v++; }
    player(id) { return this.st.players.find(p => p.id === id); }
    join(id, name, isHost) {
      const st = this.st; name = String(name || 'Gast').replace(/[<>]/g, '').slice(0, 16) || 'Gast';
      const old = this.player(id);
      if (old) { old.on = true; old.name = name; this.bump(); return { ok: true, rejoin: true }; }
      if (st.phase !== 'lobby') {
        // Laufendes Spiel: ein Bot-Platz kann übernommen werden
        const seat = st.players.find(p => p.bot);
        if (!seat) return { error: 'started' };
        seat.id = id; seat.name = name; seat.bot = false; seat.on = true; this.bump(); return { ok: true, took: true };
      }
      if (st.players.length >= st.max) return { error: 'full' };
      st.players.push({ id, name, bot: false, host: !!isHost, on: true, score: 0, last: null });
      this.bump(); return { ok: true };
    }
    leave(id) { const p = this.player(id); if (!p) return; if (this.st.phase === 'lobby' && !p.host) this.st.players = this.st.players.filter(x => x !== p); else p.on = false; this.bump(); }
    setMode(m) { if (this.st.phase === 'lobby' && MODES[m]) { this.st.mode = m; this.bump(); } }
    start(fillBots) {
      const st = this.st; if (st.phase !== 'lobby') return { error: 'started' };
      let k = 0; const want = Math.max(MIN_SEATS, fillBots ? Math.min(st.max, 4) : 0);
      while (st.players.length < want) st.players.push({ id: 'bot' + k, name: BOT_NAMES[k++ % BOT_NAMES.length] + ' 🤖', bot: true, on: true, score: 0, last: null });
      st.phase = 'play'; st.rounds = MODES[st.mode].rounds; st.round = 0; st.goal = st.mode === 'coop' ? 45 * st.players.length : 0; st.team = 0;
      this.nextRound(); return { ok: true };
    }
    nextRound() {
      const st = this.st; st.round++; this.acted = {}; st.reveal = null;
      st.players.forEach(p => { p.last = null; p.done = false; });
      if (st.mode === 'duel') this.layout = this.rng.shuffle(DUEL_VALUES.slice());
      st.deadline = this.now() + ROUND_MS; this.bump();
    }
    // Aktion eines Spielers. msg: { aid, seq, kind, data }
    action(id, msg) {
      const st = this.st, p = this.player(id);
      if (!p) return { error: 'unknown' };
      if (!msg || typeof msg.aid !== 'string' || !/^[a-z0-9]{6,24}$/.test(msg.aid)) return { error: 'aid' };
      const box = this.aids[id] || (this.aids[id] = {});
      if (box[msg.aid]) return Object.assign({ dup: true }, box[msg.aid]);     // gleiche Aktion erneut: gleiches Ergebnis, nichts doppelt
      const last = this.seq[id] || 0;
      if (!(Number.isInteger(msg.seq) && msg.seq > last)) return { error: 'seq' };
      const res = this.apply(p, msg.kind, msg.data || {});
      if (!res.error) { this.seq[id] = msg.seq; box[msg.aid] = res; const ks = Object.keys(box); if (ks.length > 40) delete box[ks[0]]; }
      return res;
    }
    apply(p, kind, data) {
      const st = this.st;
      if (st.phase !== 'play') return { error: 'phase' };
      if (p.done) return { error: 'done' };
      if (st.mode === 'duel') {
        if (kind !== 'dig') return { error: 'kind' };
        const i = data.i; if (!(Number.isInteger(i) && i >= 0 && i < 6)) return { error: 'bad' };
        p.pick = i; p.done = true; p.last = { pick: i };
      } else {
        if (kind !== 'spin') return { error: 'kind' };
        const r = spinPoints(this.rng); p.score += r.pts; p.done = true; p.last = r;
        if (st.mode === 'coop') st.team += r.pts;
      }
      this.bump(); this.maybeEnd(); return { ok: true, last: p.last };
    }
    // Zeitgeber: Bots und abwesende Spieler ziehen automatisch, Runde endet wenn alle fertig sind
    tick() {
      const st = this.st; if (st.phase !== 'play') return false;
      let changed = false; const late = this.now() >= st.deadline;
      for (const p of st.players) if (!p.done && (p.bot || (!p.on && late) || late)) {
        if (st.mode === 'duel') this.apply(p, 'dig', { i: this.rng.int(6) }); else this.apply(p, 'spin', {});
        changed = true; if (st.phase !== 'play') break;
      }
      return changed;
    }
    maybeEnd() {
      const st = this.st; if (!st.players.every(p => p.done)) return;
      if (st.mode === 'duel') {
        const cnt = {}; st.players.forEach(p => { cnt[p.pick] = (cnt[p.pick] || 0) + 1; });
        st.players.forEach(p => { const g = Math.floor(this.layout[p.pick] / cnt[p.pick]); p.score += g; p.last = { pick: p.pick, got: g }; });
        st.reveal = this.layout.slice();
      }
      st.log.unshift({ r: st.round, s: st.players.map(p => [p.id, p.score]) }); if (st.log.length > 12) st.log.length = 12;
      if (st.round >= st.rounds || (st.mode === 'coop' && st.team >= st.goal)) { st.phase = 'end'; st.result = this.result(); this.bump(); return; }
      // kurze Pause für die Anzeige, dann nächste Runde (über tickRound vom Transport)
      st.between = this.now() + 2500; this.bump();
    }
    pump() { const st = this.st; if (st.phase === 'play' && st.between && this.now() >= st.between) { st.between = 0; this.nextRound(); return true; } return this.tick(); }
    result() {
      const st = this.st;
      if (st.mode === 'coop') { const win = st.team >= st.goal; return { win, places: st.players.map(p => [p.id, win ? 1 : 2]) }; }
      const sorted = st.players.slice().sort((a, b) => b.score - a.score); let place = 0, prev = null;
      const places = sorted.map((p, i) => { if (p.score !== prev) { place = i + 1; prev = p.score; } return [p.id, place]; });
      return { win: true, places };
    }
    snapshot() { const s = JSON.parse(JSON.stringify(this.st)); return { v: s.v, sum: checksum(s), st: s }; }
    // Wiederherstellung nach Neuladen der Gastgeber-Seite
    serialize() { return JSON.stringify({ st: this.st, seq: this.seq, layout: this.layout }); }
    static restore(json, o) {
      const d = JSON.parse(json), h = Object.create(Host.prototype);
      h.rng = (o && o.rng) || SW.rng.secure(); h.now = (o && o.now) || (() => Date.now());
      h.st = d.st; h.seq = d.seq || {}; h.aids = {}; h.layout = d.layout; h.acted = {}; h.st.players.forEach(p => { if (!p.host && !p.bot) p.on = false; }); h.bump();
      return h;
    }
  }
  // Gastseite: hält Folgenummer, prüft Prüfsumme, erkennt Lücken
  class Guest {
    constructor(id) { this.id = id; this.seq = 0; this.v = -1; this.st = null; this.pending = {}; }
    nextAction(kind, data) { const aid = SW.rng.uid(12).toLowerCase().replace(/[^a-z0-9]/g, 'x'); this.seq++; const m = { aid, seq: this.seq, kind, data: data || {} }; this.pending[aid] = m; return m; }
    receive(snap) {
      if (!snap || typeof snap.v !== 'number' || !snap.st) return 'bad';
      if (checksum(snap.st) !== snap.sum) return 'checksum';
      if (snap.v < this.v) return 'old';
      this.v = snap.v; this.st = snap.st; return 'ok';
    }
    me() { return this.st ? this.st.players.find(p => p.id === this.id) : null; }
  }
  SW.Room = { MODES, Host, Guest, makeCode, validCode, checksum, spinPoints, ROUND_MS, MAX_PLAYERS, WORDS };
})(globalThis.SW = globalThis.SW || {});
