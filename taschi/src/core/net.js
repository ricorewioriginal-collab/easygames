// Verbindung zwischen zwei Taschi-Spielern (Online-Tausch und -Kampf).
// Den Verbindungsaufbau vermittelt ../cloud/fire-peer.js über Firebase (wie bei
// allen easygames-Spielen, Rückfall PeerJS), gespielt wird direkt per WebRTC.
// Ein Gerät eröffnet einen Raum (5-stelliger Code), das andere tritt bei.
import { LINK_PREFIX, newCode } from '../logic/link.js';

const PeerCtor = () => window.TaschiPeer || window.Peer;   // TaschiPeer: nur für Browsertests

export class Link {
  constructor() { this.peer = null; this.conn = null; this.role = ''; this.code = ''; this.queue = []; this.waiters = []; this.closed = false; this.listeners = new Set(); }
  get open() { return !!this.conn && !this.closed; }
  // Gastgeber: Raum mit freiem Code eröffnen. onGuest wird gerufen, sobald jemand beitritt.
  async host(onGuest) {
    const P = PeerCtor(); if (!P) throw new Error('lib');
    for (let k = 0; k < 6; k++) {
      const code = newCode();
      const r = await new Promise(res => {
        const p = new P(LINK_PREFIX + code); let done = false;
        p.on('open', () => { done = true; res(p); });
        p.on('error', (e) => { if (done) return; done = true; try { p.destroy(); } catch (x) { } res(e?.type === 'unavailable-id' ? null : 'err'); });
        setTimeout(() => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res('err'); } }, 15000);
      });
      if (r === 'err') throw new Error('broker');
      if (!r) continue;
      this.peer = r; this.role = 'host'; this.code = code;
      r.on('connection', (c) => {
        if (this.conn || this.closed) { c.on('open', () => { try { c.send({ t: 'full' }); } catch (e) { } setTimeout(() => c.close(), 300); }); return; }
        this.wire(c, () => onGuest && onGuest());
      });
      r.on('disconnected', () => { try { r.reconnect(); } catch (e) { } });
      return code;
    }
    throw new Error('broker');
  }
  // Gast: Raum mit Code betreten
  async join(code) {
    const P = PeerCtor(); if (!P) throw new Error('lib');
    await new Promise((res, rej) => {
      const p = new P(); let done = false;
      const fail = (m) => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); };
      setTimeout(() => fail('timeout'), 16000);
      p.on('error', (e) => fail(e?.type === 'peer-unavailable' ? 'nocode' : 'broker'));
      p.on('open', () => { this.peer = p; this.role = 'guest'; this.code = code; this.wire(p.connect(LINK_PREFIX + code, { reliable: true }), () => { if (!done) { done = true; res(); } }); });
    });
  }
  // Feste Kennung belegen (Zufallstausch): 'taken', wenn schon jemand dort wartet.
  async hostAt(id, onGuest) {
    const P = PeerCtor(); if (!P) throw new Error('lib');
    const r = await new Promise(res => {
      const p = new P(id); let done = false;
      p.on('open', () => { done = true; res(p); });
      p.on('error', (e) => { if (done) return; done = true; try { p.destroy(); } catch (x) { } res(e?.type === 'unavailable-id' ? 'taken' : 'err'); });
      setTimeout(() => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res('err'); } }, 12000);
    });
    if (typeof r === 'string') return r;
    this.peer = r; this.role = 'host'; this.code = id;
    r.on('connection', (c) => {
      if (this.conn || this.closed) { c.on('open', () => { try { c.send({ t: 'full' }); } catch (e) { } setTimeout(() => c.close(), 300); }); return; }
      this.wire(c, () => onGuest && onGuest());
    });
    return 'ok';
  }
  // Zu einer festen Kennung verbinden; false, wenn dort niemand wartet
  async joinAt(id, ms = 7000) {
    const P = PeerCtor(); if (!P) throw new Error('lib');
    return new Promise((res) => {
      const p = new P(); let done = false;
      const fail = () => { if (done) return; done = true; try { p.destroy(); } catch (x) { } res(false); };
      setTimeout(fail, ms);
      p.on('error', fail);
      p.on('open', () => { this.peer = p; this.role = 'guest'; this.code = id; this.wire(p.connect(id, { reliable: true }), () => { if (!done) { done = true; res(true); } }); });
    });
  }
  // Verbindung lösen, ohne das Objekt zu schließen (für erneute Versuche)
  reset() { try { this.conn?.close(); } catch (e) { } try { this.peer?.destroy(); } catch (e) { } this.peer = null; this.conn = null; this.role = ''; this.queue = []; }
  wire(c, onOpen) {
    c.on('open', () => { this.conn = c; onOpen && onOpen(); });
    c.on('data', (d) => {
      if (!d || typeof d !== 'object' || typeof d.t !== 'string') return;
      if (d.t === 'full') { this.end('full'); return; }
      if (d.t === 'bye') { this.end('bye'); return; }
      this.deliver(d);
    });
    const gone = () => { if (this.conn === c || !this.conn) this.end('lost'); };
    c.on('close', gone); c.on('error', gone);
  }
  // Nachricht verteilen: zuerst an Zuhörer, dann an Wartende, sonst in die Warteschlange
  deliver(d) {
    for (const fn of this.listeners) if (fn(d) === true) return;   // vom Zuhörer verbraucht
    const w = this.waiters.findIndex(x => x.types.includes(d.t));
    if (w >= 0) { const [x] = this.waiters.splice(w, 1); x.res(d); } else this.queue.push(d);
  }
  send(d) { if (this.open) try { this.conn.send(d); } catch (e) { } }
  // Nächste Nachricht eines Typs (oder mehrerer). Liefert null, wenn die Verbindung endet.
  recv(...types) {
    const i = this.queue.findIndex(d => types.includes(d.t));
    if (i >= 0) return Promise.resolve(this.queue.splice(i, 1)[0]);
    if (this.closed) return Promise.resolve(null);
    return new Promise(res => this.waiters.push({ types, res }));
  }
  // Nachrichten eines Typs aus der Warteschlange verwerfen
  drop(...types) { this.queue = this.queue.filter(d => !types.includes(d.t)); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  end(reason = 'bye') {
    if (this.closed) return;
    this.closed = true; this.reason = reason;
    for (const w of this.waiters.splice(0)) w.res(null);
    for (const fn of this.listeners) fn({ t: 'closed', reason });
    setTimeout(() => { try { this.conn?.close(); } catch (e) { } try { this.peer?.destroy(); } catch (e) { } }, 200);
  }
  close() { this.send({ t: 'bye' }); this.end('bye-self'); }
}
