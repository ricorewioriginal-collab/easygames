// Mehrspieler ohne eigenen Server: Der Gastgeber simuliert alles (wie im Einzelspiel), bis zu drei Gäste besuchen sein
// Grundstück mit je einer eigenen Figur. Den Verbindungsaufbau vermittelt Firebase über ../cloud/fire-peer.js
// (gleiches Projekt wie das Google-Speichern, Rückfall PeerJS); gespielt wird direkt Gerät zu Gerät per WebRTC.
// Gäste schicken nur Befehle, der Gastgeber schickt den Zustand (~6× pro Sekunde) und geänderte Grundstücke.
import { hash } from '../core/rng';
import { TRAITS } from '../data/traits';
import type { AgeStage, Appearance, TraitId } from '../data/types';
import { availability, tripPos } from '../sim/actions';
import { newRuntime, newSim } from '../sim/factory';
import type { Game } from '../sim/game';
import { REG } from '../sim/interact';
import { randomLook } from '../sim/look';
import { applyLot, deserialize, lotData, serialize, type LotData, type SaveData } from '../sim/save';
import type { AnimId, Pet, Rel, Sim } from '../sim/types';

export const MP_VERSION = 1;
export const MP_PREFIX = 'ricolife-';
export const MAX_GUESTS = 3;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normCode = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
export const isCode = (s: string): boolean => /^[A-HJ-NP-Z2-9]{5}$/.test(s);
const newCode = (): string => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const errType = (e: unknown): string => String((e as { type?: string } | undefined)?.type ?? '');

interface PeerConn {
  open: boolean;
  peer: string;
  bufferSize?: number;
  on(ev: string, fn: (x?: unknown) => void): unknown;
  send(d: unknown): void;
  close(): void;
}
interface PeerLike {
  on(ev: string, fn: (x?: unknown) => void): unknown;
  connect(id: string, opt?: Record<string, unknown>): PeerConn;
  destroy(): void;
}
type PeerCtor = new (id?: string) => PeerLike;

let libP: Promise<PeerCtor> | null = null;
/** fire-peer.js erst laden, wenn jemand online spielt (spart Ladezeit im Einzelspiel) */
export function loadPeer(): Promise<PeerCtor> {
  const w = window as unknown as { Peer?: PeerCtor & { isFirePeer?: boolean } };
  if (w.Peer?.isFirePeer) return Promise.resolve(w.Peer);
  libP ??= new Promise<PeerCtor>((res, rej) => {
    const s = document.createElement('script');
    s.src = new URL('../cloud/fire-peer.js', document.baseURI).href;
    s.onload = () => (w.Peer ? res(w.Peer) : rej(new Error('lib')));
    s.onerror = () => {
      libP = null;
      rej(new Error('lib'));
    };
    document.head.appendChild(s);
  });
  return libP;
}

/** Steckbrief, mit dem ein Gast beitritt */
export interface GuestCard {
  first: string;
  last: string;
  pronoun: Sim['pronoun'];
  age: AgeStage;
  traits: TraitId[];
  look: Appearance;
  /** Fortschritt aus früheren Besuchen */
  skills?: Sim['skills'];
}

type SimRow = [string, number, number, number, number, string, number, string, string, string, string, number];
type PetRow = [string, number, number, number, number, string];
interface StateMsg {
  t: 's';
  c: number; // Uhr
  sp: number; // Tempo
  w: Game['weather'];
  f: number; // Kontostand des Gastgeber-Haushalts
  s: SimRow[];
  p: PetRow[];
}
interface MeMsg {
  t: 'me';
  sim: Omit<Sim, 'rt'>;
  rels: [string, Rel][];
}
type HostMsg =
  | { t: 'welcome'; v: number; you: string; save: SaveData; extra: Omit<Sim, 'rt' | 'queue'>[]; host: string }
  | { t: 'full'; reason: string }
  | StateMsg
  | MeMsg
  | { t: 'lot'; lot: string; data: LotData }
  | { t: 'simAdd'; sim: Omit<Sim, 'rt' | 'queue'> }
  | { t: 'simDel'; id: string }
  | { t: 'chat'; from: string; name: string; text: string }
  | { t: 'notify'; text: string; icon: string; kind: string }
  | { t: 'bye'; reason: string };
type GuestMsg =
  | { t: 'hello'; v: number; name: string; card: GuestCard }
  | { t: 'cmd'; def: string; obj?: string; target?: string; data?: Record<string, string | number | boolean> }
  | { t: 'cancel'; uid: number }
  | { t: 'chat'; text: string }
  | { t: 'bye' };

/** Gast-Befehle, die nie ausgeführt werden (Haushalt, Geld, Familie des Gastgebers) */
const GUEST_BLOCKED = new Set(['goToWork', 'leaveWork', 'goToSchool', 'tryForBaby', 'moveIn', 'sellItem', 'phoneCall', 'goTo', 'adopt', 'throwParty', 'buyLot']);

const round = (v: number, d = 100): number => Math.round(v * d) / d;
const strip = (s: Sim): Omit<Sim, 'rt' | 'queue'> => {
  const { rt, queue, ...rest } = s;
  void rt;
  void queue;
  return { ...rest, trip: undefined };
};

interface Peer2 {
  c: PeerConn;
  sim: string | null;
  name: string;
  known: Set<string>;
  lotVer: Map<string, number>;
  lastMe: number;
  chatT: number[];
}

export interface MpEvents {
  status(text: string): void;
  chat(name: string, text: string, own: boolean): void;
  /** Gast: Verbindung beendet (Gastgeber weg, abgewiesen …) */
  ended(reason: string): void;
  /** Gastgeber: Gast kommt/geht */
  guests?(names: string[]): void;
  /** Gast: aktueller Stand der eigenen Figur (für das Profil) */
  me?(sim: Sim): void;
  notify?(text: string, icon: string, kind: string): void;
}

/** Gastgeber: nimmt bis zu drei Gäste an und hält sie auf dem Laufenden */
export class MpHost {
  code = '';
  private peer: PeerLike | null = null;
  private peers = new Map<string, Peer2>();
  private acc = 0;
  private stopped = false;
  private offNotify: (() => void) | null = null;

  constructor(private g: Game, private ev: MpEvents, private hostName: string) {}

  async listen(): Promise<string> {
    const P = await loadPeer();
    for (let i = 0; i < 6 && !this.stopped; i++) {
      const code = newCode();
      const peer = await new Promise<PeerLike | null>((res, rej) => {
        const p = new P(MP_PREFIX + code);
        let done = false;
        const fin = (f: () => void): void => {
          if (done) return;
          done = true;
          clearTimeout(t);
          f();
        };
        const t = setTimeout(() => fin(() => rej(new Error('Zeitüberschreitung beim Vermittler'))), 15000);
        p.on('open', () => fin(() => res(p)));
        p.on('error', (e) => {
          if (done) return;
          try {
            p.destroy();
          } catch {
            /* egal */
          }
          fin(() => (errType(e) === 'unavailable-id' ? res(null) : rej(new Error('Vermittler nicht erreichbar'))));
        });
      });
      if (!peer) continue;
      if (this.stopped) {
        peer.destroy();
        break;
      }
      this.peer = peer;
      this.code = code;
      this.g.role = 'host';
      peer.on('connection', (c) => this.accept(c as PeerConn));
      peer.on('error', () => this.ev.status('Verbindungsproblem beim Vermittler – Gäste können eventuell nicht beitreten.'));
      // Hinweise zu Gastfiguren an deren Spieler weiterleiten
      this.offNotify = this.g.bus.on('notify', (n) => {
        if (!n.sim) return;
        for (const p of this.peers.values()) if (p.sim === n.sim) this.send(p, { t: 'notify', text: n.text, icon: n.icon ?? 'ℹ️', kind: n.kind ?? 'info' });
      });
      return code;
    }
    throw new Error('Kein freier Raumcode');
  }

  get guestNames(): string[] {
    return [...this.peers.values()].filter((p) => p.sim).map((p) => p.name);
  }

  private send(p: Peer2, m: HostMsg, droppable = false): void {
    if (!p.c.open) return;
    if (droppable && (p.c.bufferSize ?? 0) > 512 * 1024) return; // Leitung voll: Zustandspaket auslassen
    try {
      p.c.send(m);
    } catch {
      /* Kanal zu */
    }
  }

  private accept(c: PeerConn): void {
    const p: Peer2 = { c, sim: null, name: 'Gast', known: new Set(), lotVer: new Map(), lastMe: 0, chatT: [] };
    const id = c.peer || newCode();
    c.on('open', () => {
      if (this.stopped) return c.close();
      this.peers.set(id, p);
    });
    c.on('data', (d) => {
      try {
        this.onData(id, p, d as GuestMsg);
      } catch (e) {
        console.warn('[mp] Nachricht verworfen', e);
      }
    });
    const gone = (): void => this.drop(id, 'hat das Spiel verlassen');
    c.on('close', gone);
    c.on('error', gone);
  }

  private drop(id: string, why: string): void {
    const p = this.peers.get(id);
    if (!p) return;
    this.peers.delete(id);
    if (p.sim) {
      const s = this.g.sims.get(p.sim);
      if (s) {
        this.g.release(s.id);
        // laufende Interaktionen anderer mit dem Gast beenden
        for (const o of this.g.sims.values()) for (const a of o.queue) if (a.target === s.id) a.phase = 'done';
        this.g.sims.delete(s.id);
        for (const k of [...this.g.rels.keys()]) if (k.split('|').includes(s.id)) this.g.rels.delete(k);
      }
      this.g.notify(`${p.name} ${why}.`, '👋');
      for (const o of this.peers.values()) {
        o.known.delete(p.sim);
        this.send(o, { t: 'simDel', id: p.sim });
      }
    }
    this.ev.guests?.(this.guestNames);
    try {
      p.c.close();
    } catch {
      /* egal */
    }
  }

  private onData(id: string, p: Peer2, m: GuestMsg): void {
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
    if (m.t === 'hello') {
      if (p.sim) return;
      if (m.v !== MP_VERSION) {
        this.send(p, { t: 'full', reason: 'Unterschiedliche Spielversionen – bitte beide Geräte aktualisieren.' });
        return void setTimeout(() => this.drop(id, 'wurde abgewiesen'), 300);
      }
      if (this.guestNames.length >= MAX_GUESTS) {
        this.send(p, { t: 'full', reason: 'Das Haus ist voll (höchstens drei Gäste).' });
        return void setTimeout(() => this.drop(id, 'wurde abgewiesen'), 300);
      }
      const lot = this.g.hh?.lot;
      if (!lot) {
        this.send(p, { t: 'full', reason: 'Der Gastgeber hat gerade kein Zuhause.' });
        return void setTimeout(() => this.drop(id, 'wurde abgewiesen'), 300);
      }
      const s = this.spawnGuest(id, m.card, lot);
      p.sim = s.id;
      p.name = s.first;
      const extra = [...this.g.sims.values()].filter((x) => x.guest).map(strip);
      this.send(p, { t: 'welcome', v: MP_VERSION, you: s.id, save: serialize(this.g), extra, host: this.hostName });
      for (const x of this.g.sims.keys()) p.known.add(x);
      for (const L of this.allLots()) p.lotVer.set(L, this.g.world.lotVersion.get(L) ?? 0);
      for (const o of this.peers.values()) if (o !== p && o.sim) {
        this.send(o, { t: 'simAdd', sim: strip(s) });
        o.known.add(s.id);
      }
      this.g.notify(`${s.first} ist zu Besuch gekommen!`, '🎉', undefined, 'good');
      this.ev.guests?.(this.guestNames);
      return;
    }
    const s = p.sim ? this.g.sims.get(p.sim) : undefined;
    if (!s) return;
    if (m.t === 'cmd') {
      if (typeof m.def !== 'string' || GUEST_BLOCKED.has(m.def)) return;
      const d = REG.get(m.def);
      if (!d) return;
      const o = typeof m.obj === 'string' ? this.g.world.objs.get(m.obj) : undefined;
      const t = typeof m.target === 'string' ? this.g.sims.get(m.target) : undefined;
      const pet: Pet | undefined = typeof m.target === 'string' ? this.g.pets.get(m.target) : undefined;
      if (d.on === 'obj' && !o) return;
      if (d.on === 'sim' && !t) return;
      if (d.on === 'pet' && !pet) return;
      const data = m.data && typeof m.data === 'object' ? sanitizeData(m.data) : undefined;
      const av = availability(this.g, d, { g: this.g, s, o, t, p: pet, a: data ? ({ data } as never) : undefined });
      if (av !== true) {
        if (typeof av === 'string') this.send(p, { t: 'notify', text: av, icon: '⚠️', kind: 'warn' });
        return;
      }
      this.g.queueAction(s, d.id, { user: true, obj: o?.id, target: t?.id ?? pet?.id, data });
    } else if (m.t === 'cancel') {
      if (typeof m.uid === 'number') this.g.cancelAction(s, m.uid);
    } else if (m.t === 'chat') {
      const now = Date.now();
      p.chatT = p.chatT.filter((x) => now - x < 10000);
      if (p.chatT.length >= 5) return; // Spamschutz
      p.chatT.push(now);
      const text = String(m.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 140);
      if (!text) return;
      this.say(s, p.name, text, false);
    } else if (m.t === 'bye') this.drop(id, 'hat das Spiel verlassen');
  }

  /** Chat (auch vom Gastgeber selbst) an alle verteilen */
  say(s: Sim | undefined, name: string, text: string, own: boolean): void {
    if (s) s.rt.speech = text;
    if (s) s.rt.bubble = { icon: '💬', until: this.g.clock.min + 3 };
    this.ev.chat(name, text, own);
    for (const o of this.peers.values()) if (o.sim) this.send(o, { t: 'chat', from: s?.id ?? '', name, text });
  }
  chat(text: string): void {
    const t = text.replace(/\s+/g, ' ').trim().slice(0, 140);
    if (t) this.say(this.g.active, this.hostName, t, true);
  }

  private spawnGuest(peerId: string, card: GuestCard, lot: string): Sim {
    const c = sanitizeCard(card, peerId);
    const id = `g-${peerId.replace(/[^a-zA-Z0-9]/g, '').slice(-10) || newCode()}`;
    this.g.sims.delete(id);
    const host = this.g.active;
    const s = newSim(this.g, { id, first: c.first, last: c.last, pronoun: c.pronoun, age: c.age, traits: c.traits, look: c.look, hh: null, npc: false, home: '', x: host?.x ?? 0, z: host?.z ?? 0 });
    s.guest = peerId;
    s.l = host?.l ?? 0;
    s.loc = lot;
    s.visit = { lot, until: 1e12 };
    s.rt.spawned = true;
    s.school = null;
    if (c.skills) for (const [k, v] of Object.entries(c.skills)) if (typeof v === 'number' && Number.isFinite(v)) s.skills[k as keyof Sim['skills']] = Math.max(0, Math.min(5000, v));
    // Gastgeber-Familie und Gast kennen sich
    for (const m of this.g.members()) {
      const r = this.g.rel(s.id, m.id);
      r.met = true;
      r.f = Math.max(r.f, 25);
    }
    return s;
  }

  private allLots(): string[] {
    return [...this.g.world.lotVersion.keys()];
  }

  /** pro Frame (Echtzeit) */
  update(dt: number, speed: number): void {
    if (!this.peers.size) return;
    this.acc += dt;
    if (this.acc < 0.16) return;
    this.acc = 0;
    const g = this.g;
    const now = performance.now();
    const lot = g.hh?.lot ?? null;
    const live = [...g.sims.values()].filter((s) => (s.rt.spawned || s.guest || s.trip) && (!s.away || s.trip));
    const rows: SimRow[] = live.map((s) => {
      const tp = s.trip ? tripPos(s) : null;
      return [s.id, round(tp ? tp[0] : s.x), round(tp ? tp[1] : s.z), s.l, round(tp ? tp[2] : s.rot), s.rt.anim, round(s.rt.y), s.rt.holding ?? '', s.rt.bubble && s.rt.bubble.until > g.clock.min ? s.rt.bubble.icon : '', s.emo, s.outfit, s.trip ? 1 : 0];
    });
    const pets: PetRow[] = [...g.pets.values()].filter((p) => p.rt.spawned).map((p) => [p.id, round(p.x), round(p.z), p.l, round(p.rot), p.rt.anim]);
    const st: StateMsg = { t: 's', c: round(g.clock.min, 10), sp: speed, w: g.weather, f: g.hh?.funds ?? 0, s: rows, p: pets };
    // geänderte Grundstücke (Bauen, Kaufen, Teller, Beete …) – höchstens eines pro Paket je Gast
    const vers = g.world.lotVersion;
    for (const p of this.peers.values()) {
      if (!p.sim) continue;
      for (const s of live)
        if (!p.known.has(s.id)) {
          p.known.add(s.id);
          this.send(p, { t: 'simAdd', sim: strip(s) });
        }
      this.send(p, st, true);
      for (const [L, v] of vers) {
        if ((p.lotVer.get(L) ?? -1) === v) continue;
        if (L !== lot && !live.some((s) => s.loc === L)) {
          // fernes Grundstück: erst senden, wenn jemand dort ist
          continue;
        }
        const data = lotData(g, L);
        p.lotVer.set(L, v);
        if (data) this.send(p, { t: 'lot', lot: L, data });
        break;
      }
      const me = p.sim ? g.sims.get(p.sim) : undefined;
      if (me && now - p.lastMe > 900) {
        p.lastMe = now;
        const { rt, ...rest } = me;
        void rt;
        const rels = [...g.rels.entries()].filter(([k]) => k.split('|').includes(me.id));
        this.send(p, { t: 'me', sim: { ...rest, trip: undefined, queue: me.queue.map((a) => ({ ...a })) }, rels }, true);
      }
    }
  }

  stop(): void {
    this.stopped = true;
    for (const [id, p] of [...this.peers]) {
      this.send(p, { t: 'bye', reason: 'Der Gastgeber hat das Spiel beendet.' });
      this.drop(id, 'ist gegangen');
    }
    this.offNotify?.();
    try {
      this.peer?.destroy();
    } catch {
      /* egal */
    }
    this.peer = null;
    this.g.role = 'solo';
  }
}

/** Gast: verbindet sich, baut das Spiel aus dem Stand des Gastgebers und spiegelt ihn */
export class MpGuest {
  g: Game | null = null;
  you = '';
  hostName = '';
  speed = 1;
  private peer: PeerLike | null = null;
  private c: PeerConn | null = null;
  private closed = false;

  constructor(private ev: MpEvents) {}

  /** Verbindet und liefert das gespiegelte Spiel */
  async join(code: string, name: string, card: GuestCard): Promise<Game> {
    const P = await loadPeer();
    return new Promise<Game>((res, rej) => {
      let done = false;
      const fin = (f: () => void): void => {
        if (done) return;
        done = true;
        clearTimeout(t);
        f();
      };
      const fail = (msg: string): void =>
        fin(() => {
          this.leave(true);
          rej(new Error(msg));
        });
      const t = setTimeout(() => fail('Keine Antwort – stimmt der Code und ist der Gastgeber online?'), 20000);
      const peer = new P();
      this.peer = peer;
      peer.on('error', (e) => {
        if (!done) fail(errType(e) === 'peer-unavailable' ? 'Kein Spiel mit diesem Code gefunden.' : 'Verbindung fehlgeschlagen.');
        else this.end('Verbindung unterbrochen.');
      });
      peer.on('open', () => {
        const c = peer.connect(MP_PREFIX + normCode(code), { reliable: true });
        this.c = c;
        c.on('open', () => c.send({ t: 'hello', v: MP_VERSION, name, card } satisfies GuestMsg));
        c.on('data', (d) => {
          const m = d as HostMsg;
          if (!m || typeof m !== 'object') return;
          if (!done) {
            if (m.t === 'full') return fail(m.reason);
            if (m.t !== 'welcome') return;
            try {
              const g = deserialize(m.save);
              g.role = 'guest';
              for (const x of m.extra) g.sims.set(x.id, { ...(x as Sim), queue: [], rt: newRuntime() });
              for (const s of g.sims.values()) s.rt.spawned = !!s.guest || s.rt.spawned;
              g.activeSim = m.you;
              this.g = g;
              this.you = m.you;
              this.hostName = m.host;
              installGuestSystem(g);
              fin(() => res(g));
            } catch (e) {
              fail('Spielstand des Gastgebers konnte nicht geladen werden: ' + (e as Error).message);
            }
            return;
          }
          try {
            this.onData(m);
          } catch (e) {
            console.warn('[mp] Nachricht verworfen', e);
          }
        });
        c.on('close', () => (done ? this.end('Der Gastgeber ist nicht mehr erreichbar.') : fail('Verbindung abgelehnt.')));
        c.on('error', () => (done ? this.end('Verbindung unterbrochen.') : fail('Verbindung fehlgeschlagen.')));
      });
    });
  }

  private end(reason: string): void {
    if (this.closed) return;
    this.leave(true);
    this.ev.ended(reason);
  }

  private onData(m: HostMsg): void {
    const g = this.g;
    if (!g) return;
    switch (m.t) {
      case 's': {
        g.clock.min = m.c;
        this.speed = m.sp;
        g.weather = m.w;
        const hh = g.hh;
        if (hh) hh.funds = m.f;
        const seen = new Set<string>();
        for (const r of m.s) {
          const s = g.sims.get(r[0]);
          if (!s) continue;
          seen.add(s.id);
          const first = !s.rt.spawned || Math.hypot(s.x - r[1], s.z - r[2]) > 6 || s.l !== r[3];
          s.rt.nx = r[1];
          s.rt.nz = r[2];
          s.rt.nRot = r[4];
          if (first) {
            s.x = r[1];
            s.z = r[2];
            s.rot = r[4];
          }
          s.l = r[3];
          s.rt.anim = r[5] as AnimId;
          s.rt.y = r[6];
          s.rt.holding = r[7] || null;
          s.rt.bubble = r[8] ? { icon: r[8], until: g.clock.min + 1 } : s.rt.speech ? s.rt.bubble : null;
          s.emo = r[9] as Sim['emo'];
          s.outfit = r[10] as Sim['outfit'];
          s.rt.spawned = true;
          s.away = null;
          if (r[11]) s.trip = s.trip ?? { pts: [], t: 0, len: 0, to: '', tx: 0, tz: 0 };
          else s.trip = undefined;
        }
        for (const s of g.sims.values()) if (s.rt.spawned && !seen.has(s.id)) s.rt.spawned = false;
        const pseen = new Set<string>();
        for (const r of m.p) {
          const p = g.pets.get(r[0]);
          if (!p) continue;
          pseen.add(p.id);
          p.x = r[1];
          p.z = r[2];
          p.l = r[3];
          p.rot = r[4];
          p.rt.anim = r[5];
          p.rt.spawned = true;
        }
        for (const p of g.pets.values()) if (!pseen.has(p.id)) p.rt.spawned = false;
        break;
      }
      case 'me': {
        const s = g.sims.get(m.sim.id);
        if (!s) break;
        Object.assign(s, { ...m.sim, x: s.x, z: s.z, rot: s.rot, l: s.l, rt: s.rt });
        for (const [k, r] of m.rels) g.rels.set(k, r);
        this.ev.me?.(s);
        break;
      }
      case 'lot':
        applyLot(g, m.lot, m.data);
        g.world.rebuildFlags();
        g.world.rebuildLinks();
        break;
      case 'simAdd':
        if (!g.sims.has(m.sim.id)) g.sims.set(m.sim.id, { ...(m.sim as Sim), queue: [], rt: newRuntime() });
        break;
      case 'simDel':
        if (m.id !== this.you) g.sims.delete(m.id);
        break;
      case 'chat': {
        const s = g.sims.get(m.from);
        if (s) {
          s.rt.speech = m.text;
          s.rt.bubble = { icon: '💬', until: g.clock.min + 3 };
        }
        this.ev.chat(m.name, m.text, m.from === this.you);
        break;
      }
      case 'notify':
        this.ev.notify?.(m.text, m.icon, m.kind);
        break;
      case 'bye':
        this.end(m.reason);
        break;
    }
  }

  private tx(m: GuestMsg): void {
    if (!this.c?.open) return;
    try {
      this.c.send(m);
    } catch {
      /* Kanal zu */
    }
  }
  command(def: string, obj?: string, target?: string, data?: Record<string, string | number | boolean>): void {
    this.tx({ t: 'cmd', def, obj, target, data });
  }
  cancel(uid: number): void {
    this.tx({ t: 'cancel', uid });
  }
  chat(text: string): void {
    const t = text.replace(/\s+/g, ' ').trim().slice(0, 140);
    if (t) this.tx({ t: 'chat', text: t });
  }
  /** Spiel verlassen (silent: ohne ended-Ereignis) */
  leave(silent = false): void {
    if (this.closed) return;
    this.closed = true;
    this.tx({ t: 'bye' });
    const c = this.c,
      p = this.peer;
    setTimeout(() => {
      try {
        c?.close();
      } catch {
        /* egal */
      }
      try {
        p?.destroy();
      } catch {
        /* egal */
      }
    }, 150);
    if (!silent) this.ev.ended('Du hast das Spiel verlassen.');
  }
}

/** Gast: Figuren gleiten weich zu den gemeldeten Positionen, Sprechblasen laufen ab */
export function installGuestSystem(g: Game): void {
  g.systems.push({
    name: 'guest',
    tick: (g2, _dt) => {
      const k = 0.25;
      for (const s of g2.sims.values()) {
        if (!s.rt.spawned || s.rt.nx === undefined || s.rt.nz === undefined) continue;
        s.x += (s.rt.nx - s.x) * k;
        s.z += (s.rt.nz - s.z) * k;
        if (s.rt.nRot !== undefined) {
          let d = s.rt.nRot - s.rot;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          s.rot += d * k;
        }
        if (s.rt.speech && (!s.rt.bubble || s.rt.bubble.until < g2.clock.min)) s.rt.speech = undefined;
      }
    },
  });
}

// ---------- Prüfung fremder Daten ----------
const AGES: AgeStage[] = ['teen', 'youngadult', 'adult', 'senior'];
const cleanName = (v: unknown, fb: string): string => {
  const s = String(v ?? '').replace(/[<>{}\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  return s || fb;
};
const colorOk = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v);

export function sanitizeCard(card: Partial<GuestCard> | undefined, seed: string): GuestCard {
  const c = card ?? {};
  const age = AGES.includes(c.age as AgeStage) ? (c.age as AgeStage) : 'youngadult';
  const valid = new Set(TRAITS.map((t) => t.id));
  const traits = (Array.isArray(c.traits) ? c.traits : []).filter((t) => valid.has(t)).slice(0, 3) as TraitId[];
  const base = randomLook(hash(seed), age);
  const look: Appearance = { ...base };
  const src = (c.look ?? {}) as unknown as Record<string, unknown>;
  for (const k of Object.keys(base) as (keyof Appearance)[]) {
    const bv = base[k] as unknown;
    const v = src[k];
    if (typeof bv === 'number' && typeof v === 'number' && Number.isFinite(v)) (look as unknown as Record<string, unknown>)[k] = Math.max(-1, Math.min(40, v));
    else if (typeof bv === 'string' && colorOk(v)) (look as unknown as Record<string, unknown>)[k] = v;
  }
  if (src.outfits && typeof src.outfits === 'object') {
    const o = src.outfits as Record<string, Record<string, unknown>>;
    const outfits = { ...base.outfits };
    for (const kind of Object.keys(outfits) as (keyof Appearance['outfits'])[]) {
      const b = outfits[kind] as unknown as Record<string, unknown>;
      const v = o[kind];
      if (!v || typeof v !== 'object') continue;
      const n: Record<string, unknown> = { ...b };
      for (const f of Object.keys(b)) {
        if (typeof b[f] === 'number' && typeof v[f] === 'number' && Number.isFinite(v[f] as number)) n[f] = Math.max(0, Math.min(40, v[f] as number));
        else if (typeof b[f] === 'string' && colorOk(v[f])) n[f] = v[f];
      }
      (outfits as Record<string, unknown>)[kind] = n;
    }
    look.outfits = outfits;
  }
  look.frame = look.frame === 1 ? 1 : 0;
  return {
    first: cleanName(c.first, 'Gast'),
    last: cleanName(c.last, 'Besuch'),
    pronoun: c.pronoun === 'sie' || c.pronoun === 'er' ? c.pronoun : 'they',
    age,
    traits,
    look,
    skills: c.skills && typeof c.skills === 'object' ? c.skills : undefined,
  };
}

function sanitizeData(d: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  let n = 0;
  for (const [k, v] of Object.entries(d)) {
    if (++n > 8 || k.length > 20) break;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 40);
  }
  return out;
}
