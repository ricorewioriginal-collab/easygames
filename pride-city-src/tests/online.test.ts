import { describe, it, expect } from 'vitest';
import { normCode, mkCode, ALPHA, Roster, cleanLook, cleanState, cleanName, QUICK, Net, MAX_GUESTS } from '../src/game/online';

const st = { x: 1, z: 2, r: 0, a: 'idle', c: '', h: -1 };
const look = { body: 'Man', palette: 'rainbow', skin: 2, outfit: 'harness', hot: true };

describe('Online: Code', () => {
  it('räumt Eingaben auf und kennt keine verwechselbaren Zeichen', () => {
    expect(normCode(' ab-c2 ')).toBe('ABC2');
    expect(normCode('O0I1LAAAA')).toBe('AAAA');
    for (let i = 0; i < 50; i++) { const c = mkCode(); expect(c).toHaveLength(4); expect(normCode(c)).toBe(c); }
    expect(ALPHA).not.toMatch(/[O01IL]/);
  });
});

describe('Online: Eingehendes wird geprüft', () => {
  it('Name ohne Markup und begrenzt', () => {
    expect(cleanName('<b>Max</b>')).toBe('bMax/b');
    expect(cleanName('x'.repeat(40))).toHaveLength(16);
    expect(cleanName('')).toBe('Gast');
  });
  it('Aussehen: unbekannte Werte fallen auf Vorgaben, ohne 18+ immer angezogen', () => {
    const a = cleanLook(look, false);
    expect(a.outfit).toBe('clothed'); expect(a.hot).toBe(false);
    expect(cleanLook(look, true).outfit).toBe('harness');
    const b = cleanLook({ body: '../../x', palette: 'nope', skin: 99, rb: 'evil' }, true);
    expect(b.rb).toBeUndefined(); expect(b.skin).toBe(5); expect(b.body).not.toContain('/');
    expect(cleanLook(null, true).outfit).toBe('clothed');
  });
  it('Lage: Zahlen begrenzt, Bewegung und Wagen nur aus der Liste', () => {
    const s = cleanState({ x: 1e9, z: 'abc', r: NaN, a: 'explode', c: 'panzer', h: 999 });
    expect(s).toEqual({ x: 400, z: 0, r: 0, a: 'idle', c: '', h: 360 });
    expect(cleanState({ ...st, a: 'dance1', c: 'sport' })).toMatchObject({ a: 'dance1', c: 'sport' });
  });
});

describe('Online: Wer ist da', () => {
  it('kommen, bewegen, rufen, gehen', () => {
    const r = new Roster(() => false);
    expect(r.apply({ t: 's', id: 'a', s: st })).toBeNull();   // Unbekannte bewegen nichts
    expect(r.apply({ t: 'hi', id: 'a', n: 'Kim', l: look, s: st })?.ev).toBe('join');
    expect(r.apply({ t: 'hi', id: 'a', n: 'Kim', l: look, s: st })).toBeNull();
    expect(r.apply({ t: 'hi', id: 'a', n: 'Kim', l: { ...look, palette: 'trans' }, s: st })?.ev).toBe('look');
    expect(r.apply({ t: 's', id: 'a', s: { ...st, x: 9 } })?.who?.st.x).toBe(9);
    expect(r.apply({ t: 'q', id: 'a', i: 1 })?.text).toBe('Kim: ' + QUICK[1]);
    expect(r.apply({ t: 'q', id: 'a', i: 999 })?.text).toBe('Kim: ' + QUICK[QUICK.length - 1]);
    expect(r.apply({ t: 'e', id: 'a', k: 'rm -rf' })).toBeNull();
    expect(r.apply({ t: 'e', id: 'a', k: 'wave' })?.ev).toBe('emote');
    expect(r.apply({ t: 'bye', id: 'a' })?.ev).toBe('leave');
    expect(r.members.size).toBe(0);
  });
  it('Liste der Anwesenden beim Beitritt', () => {
    const r = new Roster(() => true);
    r.apply({ t: 'ros', p: [{ id: 'host', name: 'Rico', look, st }, { id: 'b', name: 'Sam', look, st }, null, { id: 5 }] });
    expect([...r.members.keys()]).toEqual(['host', 'b']);
  });
});

/* Vermittlung nachgestellt: alle Peers in einem Raum, Nachrichten gehen sofort durch */
function fakePeers() {
  const peers = new Map<string, any>(); let n = 0;
  const emitter = () => { const h: Record<string, Array<(d?: any) => void>> = {}; return { on: (e: string, f: (d?: any) => void) => { (h[e] ||= []).push(f); }, emit: (e: string, d?: any) => (h[e] || []).forEach((f) => f(d)) }; };
  class P {
    id: string; e = emitter();
    constructor(id?: string) { this.id = id || 'g' + ++n; queueMicrotask(() => { if (id && peers.has(id)) this.e.emit('error', { type: 'unavailable-id' }); else { peers.set(this.id, this); this.e.emit('open'); } }); }
    on(ev: string, f: (d?: any) => void) { this.e.on(ev, f); }
    connect(to: string) {
      const a: any = { peer: to, open: false, ...emitter() }, b: any = { peer: this.id, open: false, ...emitter() };
      a.send = (d: unknown) => queueMicrotask(() => b.emit('data', JSON.parse(JSON.stringify(d)))); b.send = (d: unknown) => queueMicrotask(() => a.emit('data', JSON.parse(JSON.stringify(d))));
      a.close = b.close = () => { if (!a.open && !b.open) return; a.open = b.open = false; a.emit('close'); b.emit('close'); };
      queueMicrotask(() => { const t = peers.get(to); if (!t) { this.e.emit('error', { type: 'peer-unavailable' }); return; } t.e.emit('connection', b); a.open = b.open = true; b.emit('open'); a.emit('open'); });
      return a;
    }
    destroy() { peers.delete(this.id); }
  }
  return P;
}
const tick = () => new Promise((r) => setTimeout(r, 5));

describe('Online: Verbindung im Sternnetz', () => {
  it('Gastgeber*in begrüßt, reicht weiter und setzt den Absender selbst', async () => {
    (globalThis as any).window = { Peer: fakePeers() }; (globalThis as any).location = { href: 'https://x.test/pride-city/?a=1#b' };
    const host = new Net(), g1 = new Net(), g2 = new Net();
    const seen: Record<string, any[]> = { host: [], g1: [], g2: [] };
    host.onMsg = (m) => seen.host.push(m); g1.onMsg = (m) => seen.g1.push(m); g2.onMsg = (m) => seen.g2.push(m);
    host.onGuest = () => ({ t: 'ros', p: [] });
    const code = await host.host();
    expect(host.link()).toBe('https://x.test/pride-city/?join=' + code);
    await g1.join(code.toLowerCase()); await g2.join(code); await tick();
    expect(host.count).toBe(2);
    expect(seen.g1[0]).toEqual({ t: 'ros', p: [] });
    g1.send({ t: 'hi', n: 'Kim', id: 'gefälscht' }); await tick();
    const got = seen.host.find((m) => m.t === 'hi');
    expect(got.id).not.toBe('gefälscht');
    expect(seen.g2.find((m) => m.t === 'hi').id).toBe(got.id);
    expect(seen.g1.some((m) => m.t === 'hi')).toBe(false);
    g1.send({ t: 'bye', id: 'host' }); await tick();   // Gäste können niemanden abmelden
    expect(seen.g2.some((m) => m.t === 'bye')).toBe(false);
    g1.close(); await tick();
    expect(seen.g2.find((m) => m.t === 'bye').id).toBe(got.id);
    let closed = false; g2.onClosed = () => { closed = true; };
    host.close(); await tick();
    expect(closed).toBe(true); expect(g2.on).toBe(false);
  });
  it('falscher Code und volle Stadt', async () => {
    (globalThis as any).window = { Peer: fakePeers() };
    await expect(new Net().join('ZZZZ')).rejects.toThrow('nocode');
    await expect(new Net().join('Z')).rejects.toThrow('code');
    const host = new Net(), code = await host.host(), full: any[] = [];
    for (let i = 0; i < MAX_GUESTS; i++) await new Net().join(code);
    const late = new Net(); late.onMsg = (m) => full.push(m);
    late.join(code).catch(() => {}); await tick();
    expect(host.count).toBe(MAX_GUESTS);
    expect(full).toContainEqual({ t: 'full' });
  });
});

describe('Online: Nachtleben im Club', () => {
  it('Ort drinnen nur als einfache ID, draußen ohne w', () => {
    expect(cleanState({ ...st, w: 'club' }).w).toBe('club');
    expect(cleanState({ ...st, w: '<script>' }).w).toBeUndefined();
    expect('w' in cleanState(st)).toBe(false);
  });
  it('Club-Einladung: nur bekannte DJs, Deko und Themennächte', async () => {
    const { cleanInvite } = await import('../src/game/online');
    expect(cleanInvite({ p: 'club', n: '<b>Prisma</b>', dj: 'bass', deco: 'disco', e: 'stonewall', door: 9, aw: 1 })).toEqual({ p: 'club', n: 'bPrisma/b', dj: 'bass', deco: 'disco', e: 'stonewall', door: 2, aw: true });
    expect(cleanInvite({ p: '../x' })).toBeNull();
    expect(cleanInvite({ p: 'club', dj: 'hacker', deco: 'x', e: 'y' })).toMatchObject({ dj: 'haus', deco: '', e: '' });
    const r = new Roster(() => false); r.apply({ t: 'hi', id: 'a', n: 'Kim', l: look, s: st });
    expect(r.apply({ t: 'club', id: 'a', p: 'club', n: 'Club Prisma' })?.ev).toBe('invite');
  });
});
