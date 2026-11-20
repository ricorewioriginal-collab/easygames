/* Online: Freund*innen besuchen deine Stadt. Wer die Stadt öffnet, ist Gastgeber*in und verteilt die Nachrichten an alle
   (Sternnetz, bis zu fünf Gäste). Jede*r spielt den eigenen Spielstand weiter; geteilt werden nur Ort, Aussehen,
   Gesten und kurze Sprüche. Verbindung über ../cloud/fire-peer.js (PeerJS-kompatibel, Firebase vermittelt).
   Alles, was von außen kommt, wird geprüft und begrenzt, bevor es ins Spiel gelangt. */
import { OUTFITS, CLIPS, type Look, type Outfit } from './Actor';
import { PALETTES, BODIES } from './palettes';
import { AVATARS } from './avatars';
import { CAR_DEFS } from './vehicles';

export const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const PRE = 'pridecity-';
export const MAX_GUESTS = 5;
export const SEND_MS = 110;
export const normCode = (s: string) => Array.from(String(s || '').toUpperCase()).filter((c) => ALPHA.includes(c)).join('').slice(0, 4);
export const mkCode = (rnd: () => number = Math.random) => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[Math.floor(rnd() * ALPHA.length) % ALPHA.length]; return c; };

/** Kurze Sprüche statt freiem Text: kein Platz für Beleidigungen, funktioniert auf jedem Gerät */
export const QUICK = ['👋 Hallo!', '💃 Lass uns tanzen!', '🚗 Steig ein, ich fahre!', '🍕 Treffen wir uns bei Pizza Nonna?', '🏳️‍🌈 Auf zur Parade!', '🌈 Schau mal, ein Regenbogen!', '❤️ Schön, dass du da bist!', '😂 Haha!', '👍 Okay!', '⏳ Bin gleich da.', '📍 Komm zu mir!', '🌙 Ich muss los. Bis bald!'];
export const EMOTES: Array<[string, string, string]> = [['wave', '👋', 'Winken'], ['dance1', '💃', 'Tanzen'], ['dance2', '🕺', 'Tanzen (wild)'], ['cheer', '🎉', 'Jubeln'], ['clap', '👏', 'Klatschen'], ['laugh', '😂', 'Lachen']];

/** Lage einer Figur: Ort, Blickrichtung, Bewegung, Wagen ('' = zu Fuß), Lackfarbe */
export interface PState { x: number; z: number; r: number; a: string; c: string; h: number }
export interface Member { id: string; name: string; look: Look; st: PState }
export type Msg =
  | { t: 'hi'; id?: string; n: string; l: Look; s: PState }
  | { t: 'ros'; p: Member[] }
  | { t: 's'; id?: string; s: PState }
  | { t: 'e'; id?: string; k: string }
  | { t: 'q'; id?: string; i: number }
  | { t: 'bye'; id: string }
  | { t: 'full' };

const num = (v: unknown, min: number, max: number, d = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : d; };
export const cleanName = (v: unknown) => (String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16)) || 'Gast';
/** Aussehen aus dem Netz: nur bekannte Werte; ohne 18+ auf diesem Gerät immer angezogen */
export function cleanLook(v: unknown, adult: boolean): Look {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const rb = AVATARS.some((a) => a.id === o.rb) ? String(o.rb) : undefined;
  const body = rb || (BODIES.some((b) => b.id === o.body) ? String(o.body) : BODIES[0].id);
  let outfit = (OUTFITS.some((x) => x.id === o.outfit) ? o.outfit : 'clothed') as Outfit;
  if (!adult && OUTFITS.find((x) => x.id === outfit)?.adult) outfit = 'clothed';
  const hair = o.hair === undefined ? undefined : Math.round(num(o.hair, 0, 10));
  return { body, rb, palette: PALETTES.some((p) => p.id === o.palette) ? String(o.palette) : PALETTES[0].id, skin: Math.round(num(o.skin, 0, 5)), hair, outfit, top: !!o.top, cape: !!o.cape, hot: adult && !!o.hot };
}
export function cleanState(v: unknown): PState {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return { x: num(o.x, -400, 400), z: num(o.z, -400, 400), r: num(o.r, -100, 100), a: CLIPS.includes(String(o.a)) ? String(o.a) : 'idle', c: CAR_DEFS.some((c) => c.id === o.c) ? String(o.c) : '', h: Math.round(num(o.h, -1, 360, -1)) };
}

/** Wer gerade da ist. Rein, damit es sich prüfen lässt. */
export class Roster {
  readonly members = new Map<string, Member>();
  constructor(private adult: () => boolean) {}
  /** liefert, was sich getan hat (oder null) */
  apply(m: unknown): { ev: 'join' | 'leave' | 'look' | 'state' | 'emote' | 'quick' | 'full'; who?: Member; k?: string; text?: string } | null {
    if (!m || typeof m !== 'object') return null;
    const o = m as Record<string, unknown>, id = typeof o.id === 'string' ? o.id.slice(0, 80) : '';
    if (o.t === 'full') return { ev: 'full' };
    if (o.t === 'ros' && Array.isArray(o.p)) { for (const p of o.p.slice(0, MAX_GUESTS + 1)) if (p && typeof p.id === 'string') this.add(p.id.slice(0, 80), p.name, p.look, p.st); return null; }
    if (!id) return null;
    if (o.t === 'hi') { const old = this.members.get(id), who = this.add(id, o.n, o.l, o.s); return !old ? { ev: 'join', who } : JSON.stringify(old.look) !== JSON.stringify(who.look) ? { ev: 'look', who } : null; }
    const who = this.members.get(id); if (!who) return null;
    if (o.t === 'bye') { this.members.delete(id); return { ev: 'leave', who }; }
    if (o.t === 's') { who.st = cleanState(o.s); return { ev: 'state', who }; }
    if (o.t === 'e') { const e = EMOTES.find((x) => x[0] === o.k); return e ? { ev: 'emote', who, k: e[0], text: `${e[1]} ${who.name}` } : null; }
    if (o.t === 'q') { const q = QUICK[Math.round(num(o.i, 0, QUICK.length - 1))]; return { ev: 'quick', who, text: `${who.name}: ${q}` }; }
    return null;
  }
  private add(id: string, n: unknown, l: unknown, s: unknown): Member {
    const who: Member = { id, name: cleanName(n), look: cleanLook(l, this.adult()), st: cleanState(s) };
    this.members.set(id, who); return who;
  }
  clear() { this.members.clear(); }
}

/* ---------- Verbindung ---------- */
interface Conn { peer: string; open: boolean; send(d: unknown): void; close(): void; on(ev: string, fn: (d?: unknown) => void): void }
interface PeerLike { on(ev: string, fn: (d?: any) => void): void; connect(id: string, o?: unknown): Conn; destroy(): void; reconnect?(): void }
declare global { interface Window { Peer?: new (id?: string) => PeerLike; EasyGamesLink?: { share(u: string): string } } }

export class Net {
  role: '' | 'host' | 'guest' = '';
  code = '';
  private peer: PeerLike | null = null;
  private conns = new Map<string, Conn>();
  /** Nachricht ist bereits mit Absender (id) versehen */
  onMsg: (m: unknown) => void = () => {};
  onClosed: () => void = () => {};
  /** Gastgeber*in: neue Person verbunden; Rückgabe = Begrüßung (Liste der Anwesenden) */
  onGuest: (id: string) => unknown = () => null;
  get on() { return !!this.role; }
  get count() { return this.conns.size; }

  /** Einladungslink: immer über die easygames-Homepage (Mehrspieler-Regel) */
  link() { const u = location.href.split('#')[0].split('?')[0] + '?join=' + this.code; return window.EasyGamesLink ? window.EasyGamesLink.share(u) : u; }

  private reg(c: Conn, onOpen?: () => void) {
    c.on('open', () => {
      if (this.role === 'host' && this.conns.size >= MAX_GUESTS) { try { c.send({ t: 'full' }); } catch { /* egal */ } setTimeout(() => { try { c.close(); } catch { /* egal */ } }, 400); return; }
      this.conns.set(c.peer, c);
      if (this.role === 'host') { const hello = this.onGuest(c.peer); if (hello) try { c.send(hello); } catch { /* egal */ } }
      onOpen?.();
    });
    c.on('data', (d) => {
      if (!d || typeof d !== 'object') return;
      if (this.role === 'host') {
        // Gäste dürfen nur für sich selbst sprechen: Absender wird hier gesetzt, dann an alle anderen weitergereicht
        const m = { ...(d as object), id: c.peer } as { t?: string };
        if (m.t === 'ros' || m.t === 'bye' || m.t === 'full') return;
        this.onMsg(m);
        for (const [id, o] of this.conns) if (id !== c.peer && o.open) try { o.send(m); } catch { /* egal */ }
      } else this.onMsg(d);
    });
    const gone = () => {
      if (this.conns.get(c.peer) !== c) return;
      this.conns.delete(c.peer);
      if (this.role === 'host') { const m = { t: 'bye', id: c.peer }; this.onMsg(m); this.send(m); }
      else { this.close(); this.onClosed(); }
    };
    c.on('close', gone); c.on('error', gone);
  }

  async host(): Promise<string> {
    this.close();
    const P = window.Peer; if (!P) throw new Error('lib');
    for (let k = 0; k < 6 && !this.peer; k++) {
      const code = mkCode();
      const ok = await new Promise<boolean | 'err'>((res) => {
        const p = new P(PRE + code); let done = false;
        const t = setTimeout(() => { if (!done) { done = true; try { p.destroy(); } catch { /* egal */ } res('err'); } }, 15000);
        p.on('open', () => { if (done) return; done = true; clearTimeout(t); this.peer = p; this.code = code; this.role = 'host'; res(true); });
        p.on('error', (e) => { if (done) return; done = true; clearTimeout(t); try { p.destroy(); } catch { /* egal */ } res(e && e.type === 'unavailable-id' ? false : 'err'); });
      });
      if (ok === 'err') throw new Error('broker');
    }
    if (!this.peer) throw new Error('code');
    const p = this.peer as PeerLike;
    p.on('connection', (c: Conn) => this.reg(c));
    p.on('disconnected', () => { try { p.reconnect?.(); } catch { /* egal */ } });
    return this.code;
  }

  async join(raw: string): Promise<void> {
    const code = normCode(raw); if (code.length !== 4) throw new Error('code');
    this.close();
    const P = window.Peer; if (!P) throw new Error('lib');
    await new Promise<void>((res, rej) => {
      const p = new P(); let done = false;
      const fail = (m: string) => { if (done) return; done = true; try { p.destroy(); } catch { /* egal */ } this.peer = null; this.role = ''; this.code = ''; rej(new Error(m)); };
      setTimeout(() => fail('timeout'), 15000);
      p.on('error', (e) => fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'));
      p.on('open', () => { this.peer = p; this.role = 'guest'; this.code = code; this.reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); });
    });
  }

  send(d: unknown) { for (const [, c] of this.conns) if (c.open) try { c.send(d); } catch { /* egal */ } }
  close() {
    for (const [, c] of this.conns) try { c.close(); } catch { /* egal */ }
    this.conns.clear();
    if (this.peer) try { this.peer.destroy(); } catch { /* egal */ }
    this.peer = null; this.role = ''; this.code = '';
  }
}

export const netError = (e: unknown) => {
  const m = e instanceof Error ? e.message : '';
  return m === 'nocode' ? 'Unter diesem Code ist gerade keine Stadt offen.' : m === 'code' ? 'Der Code hat vier Zeichen.' : m === 'timeout' ? 'Keine Antwort. Prüfe den Code und deine Verbindung.' : m === 'lib' ? 'Online ist auf diesem Gerät gerade nicht verfügbar.' : 'Keine Verbindung zum Online-Dienst. Versuch es gleich noch einmal.';
};
