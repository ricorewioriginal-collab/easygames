// Mehrspieler-Protokoll ohne Netzwerk-Code (testbar): Gastgeber (Host) ist die Autorität über die Welt.
// Die Übertragung (WebRTC-DataChannel, siehe rtc.js) liefert nur Texte; alles andere passiert hier.
//
// Ablauf: Gast → hello { name, v } · Host → welcome { id, token, Weltdaten in Teilen } · danach tragen alle Nachrichten
// des Gastes das Token. Gäste schicken Wünsche (Blockänderungen, Treffer), der Host prüft und verteilt das Ergebnis.
import { B, BLOCKS } from './blocks.js';
import { H } from './consts.js';

export const PROTO = 1;
export const MAX_GUESTS = 4;
export const REACH_MAX = 9;      // Blöcke vom Auge des Gastes (Spielreichweite 6 plus Spielraum für Verzögerung)
export const PART = 16000;       // Zeichen je Teilnachricht (DataChannel-Grenzen sicher unterschreiten)
export const MAX_SPEED = 60;     // Blöcke/s, schneller gilt als ungültige Position
const RATE = { survival: [64, 32], creative: [8192, 2000] }; // Blockänderungen: Vorrat, Nachschub je Sekunde

// Blöcke ohne Inventar-Eintrag, die Spieler trotzdem erzeugen (Schalter umlegen, säen, hacken)
const PLAYER_SET = new Set([B.SWITCH_ON, B.WHEAT0, B.FARMLAND]);
const num = v => typeof v === 'number' && Number.isFinite(v);
const int = v => Number.isInteger(v);
export const cleanName = s => (typeof s === 'string' ? s.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16) : '') || 'Gast';

export function parseMsg(text) {
  if (typeof text !== 'string' || text.length > 4e6) return null;
  try { const m = JSON.parse(text); return m && typeof m === 'object' && typeof m.k === 'string' ? m : null; } catch { return null; }
}
export function splitText(s, size = PART) {
  const out = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out.length ? out : [''];
}
// Abbau gibt diesen Block (für Rückbuchung bei abgelehnten Änderungen)
export const dropOf = t => (BLOCKS[t] && BLOCKS[t].drop) || t;

// ---------- Gastgeber ----------
// env: { world, mode, info() → { seed, gen, mode, time, edits, pos }, onPlant(x, y, z), onHit(peer, mobId, dmg) → Beute | null,
//        onJoin(peer), onLeave(peer), now() }
export class NetHost {
  constructor(env) {
    this.env = env; this.peers = new Map(); this.nextId = 1; this.blocks = []; this.t = 0; this.mobT = 0;
  }
  // neue Verbindung: send(text) zum Gast. Rückgabe: Peer (receive über host.receive(peer, text))
  addPeer(send) {
    const peer = { id: 0, name: '', send, token: null, pos: null, posT: 0, bucket: 0, bucketT: 0, joined: false };
    return peer;
  }
  get guests() { return [...this.peers.values()]; }
  sendTo(peer, m) { try { peer.send(JSON.stringify(m)); } catch { /* Verbindung weg: wird über close() aufgeräumt */ } }
  broadcast(m, except) { const s = JSON.stringify(m); for (const p of this.peers.values()) if (p !== except) try { p.send(s); } catch { /* s. o. */ } }

  receive(peer, text) {
    const m = parseMsg(text);
    if (!m) return;
    if (!peer.joined) { if (m.k === 'hello') this.hello(peer, m); return; }
    if (m.tk !== peer.token) return; // Sitzungsprüfung: fremde oder alte Nachrichten verwerfen
    if (m.k === 'pos') this.onPos(peer, m);
    else if (m.k === 'sets') this.onSets(peer, m);
    else if (m.k === 'hit' && int(m.id) && num(m.dmg)) {
      const loot = this.env.onHit(peer, m.id, Math.max(0, Math.min(10, m.dmg)));
      if (loot && loot.length) this.sendTo(peer, { k: 'drops', list: loot });
    }
  }

  hello(peer, m) {
    if (m.v !== PROTO) { this.sendTo(peer, { k: 'bye', why: 'Andere Spielversion – bitte beide die Seite neu laden.' }); return; }
    if (this.peers.size >= MAX_GUESTS) { this.sendTo(peer, { k: 'bye', why: `Die Welt ist voll (höchstens ${MAX_GUESTS} Gäste).` }); return; }
    peer.id = this.nextId++; peer.name = cleanName(m.name); peer.joined = true;
    peer.token = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    const info = this.env.info(), data = JSON.stringify(info.edits || {}), parts = splitText(data);
    peer.pos = { x: info.pos.x, y: info.pos.y, z: info.pos.z, yaw: 0, pitch: 0 }; peer.posT = this.env.now();
    peer.bucket = RATE[info.mode === 'creative' ? 'creative' : 'survival'][0]; peer.bucketT = this.env.now();
    this.sendTo(peer, { k: 'welcome', id: peer.id, tk: peer.token, seed: info.seed, gen: info.gen, mode: info.mode, time: info.time, pos: info.pos, host: info.name, parts: parts.length });
    parts.forEach((s, i) => this.sendTo(peer, { k: 'part', i, s }));
    // wer schon da ist
    this.sendTo(peer, { k: 'pp', id: 0, name: info.name, ...info.pos });
    for (const p of this.peers.values()) {
      this.sendTo(peer, { k: 'pp', id: p.id, name: p.name, ...p.pos });
      this.sendTo(p, { k: 'pp', id: peer.id, name: peer.name, ...peer.pos });
    }
    this.peers.set(peer.id, peer);
    this.env.onJoin(peer);
  }

  close(peer) {
    if (!this.peers.has(peer.id)) return;
    this.peers.delete(peer.id);
    this.broadcast({ k: 'left', id: peer.id });
    this.env.onLeave(peer);
  }
  kick(peer, why) { this.sendTo(peer, { k: 'bye', why }); this.close(peer); }

  onPos(peer, m) {
    if (![m.x, m.y, m.z, m.yaw, m.pitch].every(num) || m.y < -10 || m.y > H + 60) return;
    const now = this.env.now(), dt = Math.max(0.05, (now - peer.posT) / 1000), d = Math.hypot(m.x - peer.pos.x, m.y - peer.pos.y, m.z - peer.pos.z);
    if (d > MAX_SPEED * dt + 4) return; // Sprung über große Strecken: Position nicht übernehmen
    peer.pos = { x: m.x, y: m.y, z: m.z, yaw: m.yaw, pitch: m.pitch }; peer.posT = now;
    this.broadcast({ k: 'pp', id: peer.id, x: m.x, y: m.y, z: m.z, yaw: m.yaw }, peer);
  }

  // Blockwünsche: [[x, y, z, vorher, nachher], …]; Antwort ack { r, bad: [[Index, tatsächlicher Block], …] }
  onSets(peer, m) {
    if (!Array.isArray(m.list) || !int(m.r)) return;
    const w = this.env.world, mode = this.env.info().mode, [cap, refill] = RATE[mode === 'creative' ? 'creative' : 'survival'];
    const now = this.env.now();
    peer.bucket = Math.min(cap, peer.bucket + (now - peer.bucketT) / 1000 * refill); peer.bucketT = now;
    const bad = [], eye = peer.pos;
    m.list.forEach((c, i) => {
      if (!Array.isArray(c) || c.length !== 5 || !c.every(int)) { bad.push([i, -1]); return; }
      const [x, y, z, from, to] = c;
      if (y < 1 || y >= H || !BLOCKS[to] || !BLOCKS[from]) { bad.push([i, -1]); return; }
      if (mode !== 'creative' && to && !BLOCKS[to].inv && !PLAYER_SET.has(to)) { bad.push([i, -1]); return; } // z. B. kein Wasser „bauen“
      if (w.ensure) w.ensure(x >> 4, z >> 4);
      const cur = w.getBlock(x, y, z);
      // Reichweite (Kreativ: Formen und Einfügen dürfen weiter reichen), Rate, gleicher Ausgangszustand (keine Doppel-Ernte)
      const far = Math.hypot(x + 0.5 - eye.x, y + 0.5 - (eye.y + 1.6), z + 0.5 - eye.z) > (mode === 'creative' ? 200 : REACH_MAX);
      if (far || peer.bucket < 1 || cur !== from) { bad.push([i, cur]); return; }
      peer.bucket--;
      w.setBlock(x, y, z, to);
      if (BLOCKS[to].shape === 'cross' && from === 0) this.env.onPlant(x, y, z);
    });
    this.sendTo(peer, { k: 'ack', r: m.r, bad });
  }

  // Host-Welt hat sich geändert (eigene Aktionen, Wachstum, Signale, Gast-Wünsche): an alle verteilen
  queueBlock(x, y, z, t) { this.blocks.push([x, y, z, t]); }
  hurt(peerId, dmg, cause, from) { const p = this.peers.get(peerId); if (p) this.sendTo(p, { k: 'hurt', dmg, cause, from }); }

  // jedes Bild: Blöcke sofort, Positionen 10×/s, Uhrzeit 1×/s, Tiere 5×/s
  tick(dt, me, time, mobs) {
    if (!this.peers.size) { this.blocks.length = 0; return; }
    if (this.blocks.length) { this.broadcast({ k: 'bs', list: this.blocks }); this.blocks = []; }
    this.t -= dt; this.mobT -= dt;
    if (this.t <= 0) {
      this.t = 0.1;
      this.broadcast({ k: 'pp', id: 0, x: me.x, y: me.y, z: me.z, yaw: me.yaw });
      if ((this.tt = (this.tt || 0) + 1) % 10 === 0) this.broadcast({ k: 'time', t: time });
    }
    if (this.mobT <= 0 && mobs) {
      this.mobT = 0.2;
      for (const p of this.peers.values()) {
        const list = [];
        for (const m of mobs) if (Math.hypot(m.x - p.pos.x, m.z - p.pos.z) < 64) list.push(mobRecord(m));
        this.sendTo(p, { k: 'mobs', list });
      }
    }
  }
}
export const mobRecord = m => [m.id, m.type, +m.x.toFixed(2), +m.y.toFixed(2), +m.z.toFixed(2), +m.yaw.toFixed(2), m.hurtT > 0 ? 1 : 0, m.moving ? 1 : 0, m.npc ? m.role || '' : '', m.npc ? m.name || '' : ''];

// ---------- Gast ----------
// env: { onWelcome(info), onBlocks(list), onPlayer(id, p), onLeft(id), onMobs(list), onHurt(m), onDrops(list), onTime(t), onReject(cells), onBye(why) }
export class NetGuest {
  constructor(env, send, name) {
    this.env = env; this.send = send; this.name = cleanName(name); this.token = null; this.id = 0;
    this.welcome = null; this.parts = null; this.r = 0; this.pending = new Map(); this.out = [];
  }
  hello() { this.send(JSON.stringify({ k: 'hello', v: PROTO, name: this.name })); }
  post(m) { if (this.token) this.send(JSON.stringify({ ...m, tk: this.token })); }
  receive(text) {
    const m = parseMsg(text);
    if (!m) return;
    switch (m.k) {
      case 'welcome':
        if (this.token || !int(m.parts) || m.parts < 1) return;
        this.welcome = m; this.parts = new Array(m.parts); this.got = 0; this.token = m.tk; this.id = m.id;
        return;
      case 'part': {
        if (!this.parts || !int(m.i) || m.i < 0 || m.i >= this.parts.length || this.parts[m.i] !== undefined || typeof m.s !== 'string') return;
        this.parts[m.i] = m.s;
        if (++this.got < this.parts.length) return;
        let edits = {};
        try { edits = JSON.parse(this.parts.join('')); } catch { this.env.onBye('Weltdaten beschädigt'); return; }
        const w = this.welcome; this.parts = null;
        this.env.onWelcome({ seed: w.seed, gen: w.gen, mode: w.mode, time: w.time, pos: w.pos, host: w.host, edits, id: w.id });
        return;
      }
      case 'bs': if (Array.isArray(m.list)) this.env.onBlocks(m.list.filter(c => Array.isArray(c) && c.length === 4 && c.every(int))); return;
      case 'pp': if (int(m.id) && m.id !== this.id && [m.x, m.y, m.z].every(num)) this.env.onPlayer(m.id, m); return;
      case 'left': if (int(m.id)) this.env.onLeft(m.id); return;
      case 'mobs': if (Array.isArray(m.list)) this.env.onMobs(m.list); return;
      case 'hurt': if (num(m.dmg)) this.env.onHurt(m); return;
      case 'drops': if (Array.isArray(m.list)) this.env.onDrops(m.list.filter(d => Array.isArray(d) && int(d[0]) && int(d[1]) && d[1] > 0 && d[1] < 100)); return;
      case 'time': if (num(m.t)) this.env.onTime(m.t); return;
      case 'ack': {
        const p = this.pending.get(m.r);
        if (!p) return;
        this.pending.delete(m.r);
        const bad = Array.isArray(m.bad) ? m.bad.filter(b => Array.isArray(b) && int(b[0]) && p[b[0]]).map(b => [...p[b[0]], b[1]]) : [];
        if (bad.length) this.env.onReject(bad); // [x, y, z, vorher, nachher, tatsächlich]
        return;
      }
      case 'bye': this.env.onBye(typeof m.why === 'string' ? m.why.slice(0, 120) : 'Verbindung beendet'); return;
    }
  }
  // eigene Blockänderung (schon lokal ausgeführt): sammeln, mit flush() als ein Wunsch schicken
  local(x, y, z, from, to) { this.out.push([x, y, z, from, to]); }
  flush() {
    if (!this.out.length || !this.token) return;
    const r = ++this.r;
    for (let i = 0; i < this.out.length; i += 4096) { // große Formen in Stücken
      const list = this.out.slice(i, i + 4096), rr = i ? ++this.r : r;
      this.pending.set(rr, list);
      this.post({ k: 'sets', r: rr, list });
    }
    this.out = [];
  }
  pos(p) { this.post({ k: 'pos', x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), yaw: +p.yaw.toFixed(2), pitch: +p.pitch.toFixed(2) }); }
  hit(id, dmg) { this.post({ k: 'hit', id, dmg }); }
}
