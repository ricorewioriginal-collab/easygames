// Netzwerkprotokoll. Häufige Daten (Eingaben, Spielzustand je Tick) binär, seltene Daten (Lobby, Start,
// Ergebnis) als JSON-Text. Wird für WebSocket (Server) und Worker-Nachrichten (Offline) gleich genutzt.
import { INTEREST_RADIUS, MAP_SIZE } from './constants';
import type { GroundItem, Match, MatchEvent, Player, Slot } from './match';
import { bodyHeight, newBody, type Body } from './movement';
import { makePiece, type Piece } from './pieces';
import { Mode, type Phase, type PlayerInput } from './types';
import { newVehicle, type Vehicle } from './vehicle';

export class BinWriter {
  buf: ArrayBuffer;
  view: DataView;
  pos = 0;
  constructor(size = 4096) {
    this.buf = new ArrayBuffer(size);
    this.view = new DataView(this.buf);
  }
  private need(n: number): void {
    if (this.pos + n <= this.buf.byteLength) return;
    let s = this.buf.byteLength * 2;
    while (s < this.pos + n) s *= 2;
    const nb = new ArrayBuffer(s);
    new Uint8Array(nb).set(new Uint8Array(this.buf, 0, this.pos));
    this.buf = nb;
    this.view = new DataView(nb);
  }
  u8(v: number): void {
    this.need(1);
    this.view.setUint8(this.pos, v);
    this.pos += 1;
  }
  i8(v: number): void {
    this.need(1);
    this.view.setInt8(this.pos, Math.max(-128, Math.min(127, Math.round(v))));
    this.pos += 1;
  }
  u16(v: number): void {
    this.need(2);
    this.view.setUint16(this.pos, Math.max(0, Math.min(65535, Math.round(v))), true);
    this.pos += 2;
  }
  i16(v: number): void {
    this.need(2);
    this.view.setInt16(this.pos, Math.max(-32768, Math.min(32767, Math.round(v))), true);
    this.pos += 2;
  }
  u32(v: number): void {
    this.need(4);
    this.view.setUint32(this.pos, v >>> 0, true);
    this.pos += 4;
  }
  i32(v: number): void {
    this.need(4);
    this.view.setInt32(this.pos, v | 0, true);
    this.pos += 4;
  }
  f32(v: number): void {
    this.need(4);
    this.view.setFloat32(this.pos, v, true);
    this.pos += 4;
  }
  f64(v: number): void {
    this.need(8);
    this.view.setFloat64(this.pos, v, true);
    this.pos += 8;
  }
  done(): ArrayBuffer {
    return this.buf.slice(0, this.pos);
  }
}

export class BinReader {
  view: DataView;
  pos = 0;
  constructor(buf: ArrayBuffer) {
    this.view = new DataView(buf);
  }
  get left(): number {
    return this.view.byteLength - this.pos;
  }
  u8(): number {
    const v = this.view.getUint8(this.pos);
    this.pos += 1;
    return v;
  }
  i8(): number {
    const v = this.view.getInt8(this.pos);
    this.pos += 1;
    return v;
  }
  u16(): number {
    const v = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return v;
  }
  i16(): number {
    const v = this.view.getInt16(this.pos, true);
    this.pos += 2;
    return v;
  }
  u32(): number {
    const v = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }
  i32(): number {
    const v = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return v;
  }
  f32(): number {
    const v = this.view.getFloat32(this.pos, true);
    this.pos += 4;
    return v;
  }
  f64(): number {
    const v = this.view.getFloat64(this.pos, true);
    this.pos += 8;
    return v;
  }
}

// ---------- Nachrichtentypen (erstes Byte) ----------
export const enum Msg {
  Input = 1,
  Frame = 2,
  Spectate = 3,
}

// ---------- Eingaben (Client → Server) ----------

const MAX_INPUTS = 8;
const MAX_ACTIONS = 6;

export function encodeInputs(inputs: readonly PlayerInput[]): ArrayBuffer {
  const w = new BinWriter(64 + inputs.length * 40);
  w.u8(Msg.Input);
  const n = Math.min(MAX_INPUTS, inputs.length);
  w.u8(n);
  for (let i = inputs.length - n; i < inputs.length; i++) {
    const inp = inputs[i]!;
    w.u32(inp.seq);
    w.i8(inp.mx * 127);
    w.i8(inp.mz * 127);
    w.f32(inp.yaw);
    w.f32(inp.pitch);
    w.u8(inp.buttons);
    w.f64(inp.viewTick);
    const na = Math.min(MAX_ACTIONS, inp.actions.length);
    w.u8(na);
    for (let k = 0; k < na; k++) w.u32(inp.actions[k]!);
  }
  return w.done();
}

/** Liest Eingaben und prüft sie streng (Server: Schutz gegen Manipulation). */
export function decodeInputs(buf: ArrayBuffer): PlayerInput[] | null {
  try {
    if (buf.byteLength > 1024) return null;
    const r = new BinReader(buf);
    if (r.u8() !== Msg.Input) return null;
    const n = r.u8();
    if (n > MAX_INPUTS) return null;
    const out: PlayerInput[] = [];
    for (let i = 0; i < n; i++) {
      const seq = r.u32();
      const mx = Math.max(-1, Math.min(1, r.i8() / 127));
      const mz = Math.max(-1, Math.min(1, r.i8() / 127));
      let yaw = r.f32();
      let pitch = r.f32();
      if (!Number.isFinite(yaw)) yaw = 0;
      if (!Number.isFinite(pitch)) pitch = 0;
      pitch = Math.max(-1.5, Math.min(1.5, pitch));
      const buttons = r.u8() & 127;
      let viewTick = r.f64();
      if (!Number.isFinite(viewTick)) viewTick = 0;
      const na = r.u8();
      if (na > MAX_ACTIONS) return null;
      const actions: number[] = [];
      for (let k = 0; k < na; k++) actions.push(r.u32());
      out.push({ seq, mx, mz, yaw, pitch, buttons, actions, viewTick });
    }
    return out;
  } catch {
    return null;
  }
}

export function encodeSpectate(target: number): ArrayBuffer {
  const w = new BinWriter(8);
  w.u8(Msg.Spectate);
  w.u16(target);
  return w.done();
}

// ---------- Spielzustand (Server → Client) ----------

export interface SelfState {
  body: Body;
  hp: number;
  shield: number;
  bleed: number;
  sel: number;
  slots: Slot[];
  ammo: number[];
  mats: number[];
  build: boolean;
  buildPiece: number;
  buildMat: number;
  reloadT: number;
  useT: number;
  useTotal: number;
  reviveT: number;
  reviveTarget: number;
  vehicle: number;
  seat: number;
  kills: number;
  knocks: number;
  damage: number;
  alive: boolean;
  place: number;
  interact: number; // 0 nichts, 1 Gegenstand, 2 Tür, 3 Kiste, 4 Munition, 5 Fahrzeug, 6 Aussteigen, 7 Wiederbeleben
  interactId: number;
  vstate: Vehicle | null;
  shots: number;
}

export interface NetPlayer {
  id: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  mode: Mode;
  flags: number;
  weapon: number;
  rarity: number;
  emote: number;
  hp: number;
  shield: number;
  vehicle: number;
  h: number;
}

export const enum PF {
  Crouch = 1,
  Aim = 2,
  Fire = 4,
  Build = 8,
  Reload = 16,
  Use = 32,
  Revive = 64,
  Team = 128,
}

export interface NetVehicle {
  id: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  hp: number;
  seats: number[];
}

export interface NetProjectile {
  id: number;
  weapon: number;
  x: number;
  y: number;
  z: number;
}

export interface NetZone {
  phase: number;
  shrinking: boolean;
  timer: number;
  cx: number;
  cz: number;
  r: number;
  tx: number;
  tz: number;
  tr: number;
  dps: number;
}

export interface Frame {
  tick: number;
  ack: number;
  phase: Phase;
  busT: number;
  viewId: number;
  self: SelfState | null;
  zone: NetZone;
  alive: number;
  teams: number;
  players: NetPlayer[];
  vehicles: NetVehicle[];
  projectiles: NetProjectile[];
  events: MatchEvent[];
}

const qx = (v: number): number => (v / MAP_SIZE) * 65535;
const dqx = (v: number): number => (v / 65535) * MAP_SIZE;

const enum Ev {
  Shot = 1,
  Dmg,
  Hurt,
  Piece,
  PieceKill,
  PieceAdd,
  State,
  Item,
  ItemDel,
  Feed,
  Elim,
  TeamOut,
  Boom,
  Emote,
  Sfx,
  Revived,
  Zone,
  Phase,
  End,
}

function writeBody(w: BinWriter, b: Body): void {
  w.f32(b.x);
  w.f32(b.y);
  w.f32(b.z);
  w.f32(b.vx);
  w.f32(b.vy);
  w.f32(b.vz);
  w.u8(b.mode);
  w.u8((b.crouch ? 1 : 0) | (b.canGlide ? 2 : 0));
  w.u8(b.prevBtn);
  w.f32(b.airTime);
  w.f32(b.wallNx);
  w.f32(b.wallNz);
  w.f32(b.wallTop);
  const climbing = b.mode === Mode.Climb;
  w.u8(climbing ? 1 : 0);
  if (climbing) {
    w.f32(b.climbT);
    w.f32(b.c0x);
    w.f32(b.c0y);
    w.f32(b.c0z);
    w.f32(b.c1x);
    w.f32(b.c1y);
    w.f32(b.c1z);
  }
}

function readBody(r: BinReader): Body {
  const b = newBody();
  b.x = r.f32();
  b.y = r.f32();
  b.z = r.f32();
  b.vx = r.f32();
  b.vy = r.f32();
  b.vz = r.f32();
  b.mode = r.u8();
  const f = r.u8();
  b.crouch = (f & 1) !== 0;
  b.canGlide = (f & 2) !== 0;
  b.prevBtn = r.u8();
  b.airTime = r.f32();
  b.wallNx = r.f32();
  b.wallNz = r.f32();
  b.wallTop = r.f32();
  if (r.u8()) {
    b.climbT = r.f32();
    b.c0x = r.f32();
    b.c0y = r.f32();
    b.c0z = r.f32();
    b.c1x = r.f32();
    b.c1y = r.f32();
    b.c1z = r.f32();
  }
  return b;
}

function writeVehicleFull(w: BinWriter, v: Vehicle): void {
  w.u8(v.id);
  w.f32(v.x);
  w.f32(v.y);
  w.f32(v.z);
  w.f32(v.yaw);
  w.f32(v.speed);
  w.f32(v.vy);
  w.f32(v.hp);
  w.f32(v.boost);
  for (const s of v.seats) w.i16(s);
}

function readVehicleFull(r: BinReader): Vehicle {
  const v = newVehicle(r.u8(), 0, 0, 0, 0);
  v.x = r.f32();
  v.y = r.f32();
  v.z = r.f32();
  v.yaw = r.f32();
  v.speed = r.f32();
  v.vy = r.f32();
  v.hp = r.f32();
  v.boost = r.f32();
  v.seats = [r.i16(), r.i16(), r.i16(), r.i16()];
  return v;
}

const INTERACT_CODES: Record<string, number> = { item: 1, door: 2, chest: 3, ammo: 4, vehicle: 5, exit: 6, revive: 7 };

function writePiece(w: BinWriter, p: Piece): void {
  w.u32(p.id);
  w.u8(p.kind);
  w.f32(p.x);
  w.f32(p.y);
  w.f32(p.z);
  w.f32(p.hx);
  w.f32(p.hy);
  w.f32(p.hz);
  w.u8(p.dir);
  w.u8(p.mat);
  w.u8(p.style);
  w.u16(p.hp);
  w.u16(p.maxHp);
  w.i16(p.team);
}

function readPiece(r: BinReader): Piece {
  const id = r.u32();
  const kind = r.u8();
  const x = r.f32(),
    y = r.f32(),
    z = r.f32(),
    hx = r.f32(),
    hy = r.f32(),
    hz = r.f32();
  const dir = r.u8(),
    mat = r.u8(),
    style = r.u8();
  const hp = r.u16(),
    maxHp = r.u16(),
    team = r.i16();
  const p = makePiece(kind, x, y, z, hx, hy, hz, { dir, mat, style, team, hp: maxHp });
  p.id = id;
  p.hp = hp;
  return p;
}

function writeItem(w: BinWriter, it: GroundItem): void {
  w.u32(it.id);
  w.u8(it.kind);
  w.u8(it.item);
  w.u8(it.rarity);
  w.u16(it.qty);
  w.f32(it.x);
  w.f32(it.y);
  w.f32(it.z);
}

function readItem(r: BinReader): GroundItem {
  return { id: r.u32(), kind: r.u8(), item: r.u8(), rarity: r.u8(), qty: r.u16(), x: r.f32(), y: r.f32(), z: r.f32(), alive: true };
}

/** Darf der Betrachter dieses Ereignis sehen? (Interessenbereich) */
function relevant(e: MatchEvent, viewer: Player | null, vx: number, vz: number): boolean {
  const near = (x: number, z: number, r: number): boolean => (x - vx) ** 2 + (z - vz) ** 2 < r * r;
  switch (e.t) {
    case 'dmg':
    case 'hurt':
      return !!viewer && e.to === viewer.id;
    case 'shot':
      return near(e.ox, e.oz, 320) || near(e.ex, e.ez, 120);
    case 'boom':
      return near(e.x, e.z, 450);
    case 'sfx':
      return near(e.x, e.z, 140) || (!!viewer && e.pid === viewer.id);
    case 'emote':
      return true;
    default:
      return true;
  }
}

export interface FrameOpts {
  /** Spieler, aus dessen Sicht gesendet wird (null = Zuschauer ohne Figur) */
  viewer: Player | null;
  /** Zuschauen: dieser Spieler bestimmt den Interessenbereich */
  focus: Player | null;
  ack: number;
  /** Ereignisse seit dem letzten Frame (Standard: die des aktuellen Ticks) */
  events?: MatchEvent[];
}

/** Spielzustand für einen Empfänger kodieren. */
export function encodeFrame(m: Match, o: FrameOpts): ArrayBuffer {
  const w = new BinWriter(8192);
  const viewer = o.viewer;
  const focus = o.focus ?? viewer;
  const vx = focus ? focus.body.x : m.zone.cx,
    vz = focus ? focus.body.z : m.zone.cz;
  w.u8(Msg.Frame);
  w.u32(m.tick);
  w.u32(o.ack);
  w.u8(m.phase);
  w.f32(m.busT);
  w.u16(focus ? focus.id : 0);
  // eigener Zustand
  if (viewer) {
    w.u8(1);
    const p = viewer;
    writeBody(w, p.body);
    w.f32(p.hp);
    w.f32(p.shield);
    w.f32(p.bleed);
    w.u8(p.sel);
    for (const s of p.slots) {
      w.i16(s.id);
      w.u8(s.rarity);
      w.u16(s.qty);
    }
    for (const a of p.ammo) w.u16(a);
    for (const a of p.mats) w.u16(a);
    w.u8((p.build ? 1 : 0) | (p.alive ? 2 : 0));
    w.u8(p.buildPiece);
    w.u8(p.buildMat);
    w.f32(p.reloadT);
    w.f32(p.useT);
    w.f32(p.useTotal);
    w.f32(p.reviveT);
    w.i16(p.reviveTarget);
    w.i16(p.vehicle);
    w.i8(p.seat);
    w.u16(p.stats.kills);
    w.u16(p.stats.knocks);
    w.u32(Math.round(p.stats.damage));
    w.u8(p.place);
    const it = p.alive ? m.interactTarget(p) : null;
    w.u8(it ? INTERACT_CODES[it.type] ?? 0 : 0);
    w.i32(it ? it.id : -1);
    w.u32(p.shots);
    const v = p.vehicle >= 0 && p.seat === 0 ? m.vehicles[p.vehicle] : undefined;
    if (v) {
      w.u8(1);
      writeVehicleFull(w, v);
    } else w.u8(0);
  } else w.u8(0);
  // Zone
  const z = m.zone;
  w.i8(z.phase);
  w.u8(z.shrinking ? 1 : 0);
  w.f32(z.timer);
  w.f32(z.cx);
  w.f32(z.cz);
  w.f32(z.r);
  w.f32(z.tx);
  w.f32(z.tz);
  w.f32(z.tr);
  w.f32(z.dps);
  w.u8(m.aliveCount());
  w.u8(m.teamsAlive);
  // andere Spieler
  const list: Player[] = [];
  const R2 = INTEREST_RADIUS * INTEREST_RADIUS;
  for (const q of m.players) {
    if (q === viewer) continue;
    if (q.body.mode === Mode.Dead && m.tick - q.elimTick > 90) continue;
    const team = !!viewer && q.team === viewer.team;
    if (!team && (q.body.x - vx) ** 2 + (q.body.z - vz) ** 2 > R2) continue;
    if (q.body.mode === Mode.Bus && !team) continue;
    list.push(q);
  }
  w.u16(list.length);
  for (const q of list) {
    const b = q.body;
    const team = !!viewer && q.team === viewer.team;
    w.u16(q.id);
    w.u16(qx(b.x));
    w.i16(b.y * 50);
    w.u16(qx(b.z));
    w.i16((q.yaw % (Math.PI * 2)) * 10000);
    w.i8(q.pitch * 80);
    w.u8(b.mode);
    let f = 0;
    if (b.crouch || b.mode === Mode.Slide) f |= PF.Crouch;
    if (q.aiming) f |= PF.Aim;
    if (q.firing) f |= PF.Fire;
    if (q.build) f |= PF.Build;
    if (q.reloadT > 0) f |= PF.Reload;
    if (q.useT > 0) f |= PF.Use;
    if (q.reviveT > 0) f |= PF.Revive;
    if (team) f |= PF.Team;
    w.u8(f);
    const sl = q.slots[q.sel]!;
    w.i16(q.build ? -2 : sl.id);
    w.u8(sl.rarity);
    w.i8(q.emote);
    w.u8(team || focus === q ? Math.round(q.body.mode === Mode.Downed ? q.bleed : q.hp) : 255);
    w.u8(team || focus === q ? Math.round(q.shield) : 255);
    w.i8(q.vehicle);
  }
  // Fahrzeuge
  const vs = m.vehicles.filter((v) => v.alive && (v.x - vx) ** 2 + (v.z - vz) ** 2 < 500 * 500);
  w.u8(vs.length);
  for (const v of vs) {
    w.u8(v.id);
    w.f32(v.x);
    w.f32(v.y);
    w.f32(v.z);
    w.f32(v.yaw);
    w.i16(v.speed * 100);
    w.u16(v.hp);
    for (const s of v.seats) w.i16(s);
  }
  // Geschosse
  const ps = m.projectiles.filter((p) => p.alive && (p.x - vx) ** 2 + (p.z - vz) ** 2 < 400 * 400);
  w.u8(Math.min(255, ps.length));
  for (const p of ps.slice(0, 255)) {
    w.u16(p.id);
    w.u8(p.weapon);
    w.f32(p.x);
    w.f32(p.y);
    w.f32(p.z);
  }
  // Ereignisse
  const evs = (o.events ?? m.events).filter((e) => relevant(e, viewer, vx, vz));
  w.u16(evs.length);
  for (const e of evs) writeEvent(w, e);
  return w.done();
}

function writeEvent(w: BinWriter, e: MatchEvent): void {
  switch (e.t) {
    case 'shot':
      w.u8(Ev.Shot);
      w.u16(e.pid);
      w.u8(e.w);
      w.f32(e.ox);
      w.f32(e.oy);
      w.f32(e.oz);
      w.f32(e.ex);
      w.f32(e.ey);
      w.f32(e.ez);
      w.u8(e.hit);
      break;
    case 'dmg':
      w.u8(Ev.Dmg);
      w.u16(e.target);
      w.u16(e.amt);
      w.u8((e.head ? 1 : 0) | (e.shield ? 2 : 0));
      w.f32(e.x);
      w.f32(e.y);
      w.f32(e.z);
      break;
    case 'hurt':
      w.u8(Ev.Hurt);
      w.f32(e.fx);
      w.f32(e.fz);
      w.u16(e.amt);
      break;
    case 'piece':
      w.u8(Ev.Piece);
      w.u32(e.id);
      w.u16(e.hp);
      break;
    case 'pieceKill':
      w.u8(Ev.PieceKill);
      w.u32(e.id);
      break;
    case 'pieceAdd':
      w.u8(Ev.PieceAdd);
      writePiece(w, e.p);
      break;
    case 'state':
      w.u8(Ev.State);
      w.u32(e.id);
      w.u8(e.state);
      break;
    case 'item':
      w.u8(Ev.Item);
      writeItem(w, e.it);
      break;
    case 'itemDel':
      w.u8(Ev.ItemDel);
      w.u32(e.id);
      break;
    case 'feed':
      w.u8(Ev.Feed);
      w.i16(e.killer);
      w.u16(e.victim);
      w.i16(e.w);
      w.u8((e.head ? 1 : 0) | (e.knock ? 2 : 0));
      w.u8(e.cause);
      break;
    case 'elim':
      w.u8(Ev.Elim);
      w.u16(e.pid);
      w.u8(e.place);
      w.i16(e.killer);
      break;
    case 'teamOut':
      w.u8(Ev.TeamOut);
      w.u16(e.team);
      w.u8(e.place);
      break;
    case 'boom':
      w.u8(Ev.Boom);
      w.f32(e.x);
      w.f32(e.y);
      w.f32(e.z);
      w.f32(e.r);
      break;
    case 'emote':
      w.u8(Ev.Emote);
      w.u16(e.pid);
      w.u8(e.id);
      break;
    case 'sfx':
      w.u8(Ev.Sfx);
      w.u8(e.k);
      w.f32(e.x);
      w.f32(e.y);
      w.f32(e.z);
      w.i16(e.pid);
      break;
    case 'revived':
      w.u8(Ev.Revived);
      w.u16(e.pid);
      w.u16(e.by);
      break;
    case 'zone':
      w.u8(Ev.Zone);
      break;
    case 'phase':
      w.u8(Ev.Phase);
      w.u8(e.phase);
      break;
    case 'end':
      w.u8(Ev.End);
      w.i16(e.winnerTeam);
      break;
  }
}

function readEvent(r: BinReader): MatchEvent | null {
  const t = r.u8();
  switch (t) {
    case Ev.Shot:
      return { t: 'shot', pid: r.u16(), w: r.u8(), ox: r.f32(), oy: r.f32(), oz: r.f32(), ex: r.f32(), ey: r.f32(), ez: r.f32(), hit: r.u8() };
    case Ev.Dmg: {
      const target = r.u16(),
        amt = r.u16(),
        f = r.u8();
      return { t: 'dmg', to: 0, target, amt, head: (f & 1) !== 0, shield: (f & 2) !== 0, x: r.f32(), y: r.f32(), z: r.f32() };
    }
    case Ev.Hurt:
      return { t: 'hurt', to: 0, fx: r.f32(), fz: r.f32(), amt: r.u16() };
    case Ev.Piece:
      return { t: 'piece', id: r.u32(), hp: r.u16() };
    case Ev.PieceKill:
      return { t: 'pieceKill', id: r.u32(), x: 0, y: 0, z: 0 };
    case Ev.PieceAdd:
      return { t: 'pieceAdd', p: readPiece(r) };
    case Ev.State:
      return { t: 'state', id: r.u32(), state: r.u8() };
    case Ev.Item:
      return { t: 'item', it: readItem(r) };
    case Ev.ItemDel:
      return { t: 'itemDel', id: r.u32() };
    case Ev.Feed: {
      const killer = r.i16(),
        victim = r.u16(),
        wpn = r.i16(),
        f = r.u8(),
        cause = r.u8();
      return { t: 'feed', killer, victim, w: wpn, head: (f & 1) !== 0, knock: (f & 2) !== 0, cause };
    }
    case Ev.Elim:
      return { t: 'elim', pid: r.u16(), place: r.u8(), killer: r.i16() };
    case Ev.TeamOut:
      return { t: 'teamOut', team: r.u16(), place: r.u8() };
    case Ev.Boom:
      return { t: 'boom', x: r.f32(), y: r.f32(), z: r.f32(), r: r.f32() };
    case Ev.Emote:
      return { t: 'emote', pid: r.u16(), id: r.u8() };
    case Ev.Sfx:
      return { t: 'sfx', k: r.u8(), x: r.f32(), y: r.f32(), z: r.f32(), pid: r.i16() };
    case Ev.Revived:
      return { t: 'revived', pid: r.u16(), by: r.u16() };
    case Ev.Zone:
      return { t: 'zone' };
    case Ev.Phase:
      return { t: 'phase', phase: r.u8() };
    case Ev.End:
      return { t: 'end', winnerTeam: r.i16() };
    default:
      return null;
  }
}

export function decodeFrame(buf: ArrayBuffer): Frame | null {
  const r = new BinReader(buf);
  if (r.u8() !== Msg.Frame) return null;
  const tick = r.u32(),
    ack = r.u32(),
    phase = r.u8() as Phase,
    busT = r.f32(),
    viewId = r.u16();
  let self: SelfState | null = null;
  if (r.u8()) {
    const body = readBody(r);
    const hp = r.f32(),
      shield = r.f32(),
      bleed = r.f32(),
      sel = r.u8();
    const slots: Slot[] = [];
    for (let i = 0; i < 6; i++) slots.push({ id: r.i16(), rarity: r.u8(), qty: r.u16() });
    const ammo = [r.u16(), r.u16(), r.u16(), r.u16(), r.u16()];
    const mats = [r.u16(), r.u16(), r.u16()];
    const fl = r.u8();
    const buildPiece = r.u8(),
      buildMat = r.u8();
    const reloadT = r.f32(),
      useT = r.f32(),
      useTotal = r.f32(),
      reviveT = r.f32(),
      reviveTarget = r.i16(),
      vehicle = r.i16(),
      seat = r.i8();
    const kills = r.u16(),
      knocks = r.u16(),
      damage = r.u32(),
      place = r.u8(),
      interact = r.u8(),
      interactId = r.i32(),
      shots = r.u32();
    const vstate = r.u8() ? readVehicleFull(r) : null;
    self = {
      body,
      hp,
      shield,
      bleed,
      sel,
      slots,
      ammo,
      mats,
      build: (fl & 1) !== 0,
      alive: (fl & 2) !== 0,
      buildPiece,
      buildMat,
      reloadT,
      useT,
      useTotal,
      reviveT,
      reviveTarget,
      vehicle,
      seat,
      kills,
      knocks,
      damage,
      place,
      interact,
      interactId,
      vstate,
      shots,
    };
  }
  const zone: NetZone = {
    phase: r.i8(),
    shrinking: r.u8() === 1,
    timer: r.f32(),
    cx: r.f32(),
    cz: r.f32(),
    r: r.f32(),
    tx: r.f32(),
    tz: r.f32(),
    tr: r.f32(),
    dps: r.f32(),
  };
  const alive = r.u8(),
    teams = r.u8();
  const np = r.u16();
  const players: NetPlayer[] = [];
  for (let i = 0; i < np; i++) {
    const id = r.u16();
    const x = dqx(r.u16()),
      y = r.i16() / 50,
      z = dqx(r.u16());
    const yaw = r.i16() / 10000,
      pitch = r.i8() / 80;
    const mode = r.u8() as Mode,
      flags = r.u8();
    const weapon = r.i16(),
      rarity = r.u8(),
      emote = r.i8(),
      hp = r.u8(),
      shield = r.u8(),
      vehicle = r.i8();
    const tmp = newBody();
    tmp.mode = mode;
    tmp.crouch = (flags & PF.Crouch) !== 0;
    players.push({ id, x, y, z, yaw, pitch, mode, flags, weapon, rarity, emote, hp, shield, vehicle, h: bodyHeight(tmp) });
  }
  const nv = r.u8();
  const vehicles: NetVehicle[] = [];
  for (let i = 0; i < nv; i++) {
    vehicles.push({ id: r.u8(), x: r.f32(), y: r.f32(), z: r.f32(), yaw: r.f32(), speed: r.i16() / 100, hp: r.u16(), seats: [r.i16(), r.i16(), r.i16(), r.i16()] });
  }
  const npj = r.u8();
  const projectiles: NetProjectile[] = [];
  for (let i = 0; i < npj; i++) projectiles.push({ id: r.u16(), weapon: r.u8(), x: r.f32(), y: r.f32(), z: r.f32() });
  const ne = r.u16();
  const events: MatchEvent[] = [];
  for (let i = 0; i < ne; i++) {
    const e = readEvent(r);
    if (!e) break;
    events.push(e);
  }
  return { tick, ack, phase, busT, viewId, self, zone, alive, teams, players, vehicles, projectiles, events };
}

// ---------- Erstsynchronisierung (JSON) ----------

export interface SyncData {
  tick: number;
  phase: Phase;
  bus: { x0: number; z0: number; x1: number; z1: number; duration: number };
  busT: number;
  /** Weltbauteile mit abweichendem Zustand: [id, alive(0/1), hp, state] */
  pieces: [number, number, number, number][];
  /** gebaute Teile (vollständig) */
  built: Piece[];
  items: GroundItem[];
}

export function makeSync(m: Match): SyncData {
  const pieces: [number, number, number, number][] = [];
  const built: Piece[] = [];
  for (let i = 0; i < m.world.pieces.length; i++) {
    const p = m.world.pieces[i]!;
    if (i >= m.world.staticCount) {
      if (p.alive) built.push(p);
      continue;
    }
    if (!p.alive || p.hp !== p.maxHp || p.state !== 0) pieces.push([p.id, p.alive ? 1 : 0, Math.round(p.hp), p.state]);
  }
  return {
    tick: m.tick,
    phase: m.phase,
    bus: { ...m.bus, duration: m.busDuration },
    busT: m.busT,
    pieces,
    built,
    items: m.items.filter((i) => i.alive),
  };
}

export interface StartInfo {
  selfId: number;
  team: number;
  config: import('./types').MatchConfig;
  roster: import('./types').RosterEntry[];
  online: boolean;
  matchId: string;
}
