// Die autoritative Match-Simulation. Läuft im Browser-Worker (Offline-Modus) und auf dem Server.
import { BUILD_COST, BUS_HEIGHT, BUS_SPEED, DT, DOWNED_BLEED, DOWNED_HP, EYE_HEIGHT, INTERACT_RANGE, MAP_CENTER, MAP_SIZE, MAX_HP, MAX_MATERIAL, MAX_REWIND, MAX_SHIELD, PLAYER_RADIUS, REVIVE_RANGE, REVIVE_TIME, TICK_RATE, WATER_LEVEL } from './constants';
import { BUILD_KINDS, computePlacement, findUnsupported, makeBuilt, placementInRange, type BuildPiece } from './building';
import {
  AMMO_MAX,
  CONSUMABLES,
  DropKind,
  GRENADE_ID,
  WEAPONS,
  consumable,
  damageFor,
  reloadFor,
  rollAmmoBox,
  rollChest,
  rollFloor,
  stackSize,
  weapon,
  type DropSpec,
} from './items';
import { Rng, clamp, dist2 } from './math';
import { Body, bodyHeight, fallDamage, newBody, stepBody, MoveEv } from './movement';
import { Kind, Mat, harvestMat, isBuilt, type Piece } from './pieces';
import { Act, Btn, Mode, Phase, actA, actB, actCode, type Cosmetics, type MatchConfig, type PlacementResult, type PlayerInput, type RosterEntry } from './types';
import { VEHICLE_RADIUS, newVehicle, seatPos, stepVehicle, type Vehicle } from './vehicle';
import type { World } from './world';
import type { WorldContent } from './worldgen';
import { newZone, outsideZone, stepZone, type ZoneState } from './zone';

export interface Slot {
  id: number;
  rarity: number;
  qty: number;
}
const emptySlot = (): Slot => ({ id: -1, rarity: 0, qty: 0 });

export const SLOT_COUNT = 6; // 0 = Spitzhacke, 1–5 Schnellzugriff
const HIST = 32;

export interface PlayerStats {
  kills: number;
  damage: number;
  assists: number;
  revives: number;
  built: number;
  harvested: number;
  headshots: number;
  chests: number;
  distance: number;
  knocks: number;
}

export interface Player {
  id: number;
  name: string;
  team: number;
  bot: boolean;
  cos: Cosmetics;
  body: Body;
  yaw: number;
  pitch: number;
  hp: number;
  shield: number;
  /** noch im Spiel (nicht ausgeschieden) */
  alive: boolean;
  bleed: number;
  slots: Slot[];
  sel: number;
  ammo: number[];
  mats: number[];
  build: boolean;
  buildPiece: BuildPiece;
  buildMat: Mat;
  fireCd: number;
  reloadT: number;
  burstLeft: number;
  bloom: number;
  useT: number;
  useTotal: number;
  aiming: boolean;
  firing: boolean;
  reviveT: number;
  reviveTarget: number;
  vehicle: number;
  seat: number;
  emote: number;
  emoteT: number;
  stats: PlayerStats;
  queue: PlayerInput[];
  last: PlayerInput;
  lastSeq: number;
  lastAttacker: number;
  lastAttackerT: number;
  assistBy: Map<number, number>;
  place: number;
  elimTick: number;
  connected: boolean;
  spectate: number;
  /** Lag-Kompensation */
  hx: Float32Array;
  hy: Float32Array;
  hz: Float32Array;
  hh: Float32Array;
  /** Schuss-Zähler (Darstellung) */
  shots: number;
  zoneAcc: number;
  /** Fahrer-Eingabe des letzten Ticks */
  drive: PlayerInput | null;
  /** Feuerknopf im vorigen Kampf-Schritt */
  firePrev: boolean;
  lastX: number;
  lastZ: number;
  inputsThisSecond: number;
}

export interface GroundItem {
  id: number;
  kind: DropKind;
  item: number;
  rarity: number;
  qty: number;
  x: number;
  y: number;
  z: number;
  alive: boolean;
}

export interface Projectile {
  id: number;
  owner: number;
  weapon: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fuse: number;
  alive: boolean;
  rarity: number;
}

export type MatchEvent =
  | { t: 'shot'; pid: number; w: number; ox: number; oy: number; oz: number; ex: number; ey: number; ez: number; hit: number }
  | { t: 'dmg'; to: number; target: number; amt: number; head: boolean; shield: boolean; x: number; y: number; z: number }
  | { t: 'hurt'; to: number; fx: number; fz: number; amt: number }
  | { t: 'piece'; id: number; hp: number }
  | { t: 'pieceKill'; id: number; x: number; y: number; z: number }
  | { t: 'pieceAdd'; p: Piece }
  | { t: 'state'; id: number; state: number }
  | { t: 'item'; it: GroundItem }
  | { t: 'itemDel'; id: number }
  | { t: 'feed'; killer: number; victim: number; w: number; head: boolean; knock: boolean; cause: number }
  | { t: 'elim'; pid: number; place: number; killer: number }
  | { t: 'teamOut'; team: number; place: number }
  | { t: 'boom'; x: number; y: number; z: number; r: number }
  | { t: 'emote'; pid: number; id: number }
  | { t: 'sfx'; k: number; x: number; y: number; z: number; pid: number }
  | { t: 'revived'; pid: number; by: number }
  | { t: 'zone' }
  | { t: 'phase'; phase: Phase }
  | { t: 'end'; winnerTeam: number };

/** Ursache für Ausscheiden / Schaden ohne Waffe */
export const enum Cause {
  Weapon = 0,
  Zone = 1,
  Fall = 2,
  Explosion = 3,
  Vehicle = 4,
  Bleed = 5,
  Leave = 6,
  Melee = 7,
}

/** Kurze Soundereignisse */
export const enum Sfx {
  Jump = 0,
  Land = 1,
  Glide = 2,
  Pad = 3,
  Splash = 4,
  Reload = 5,
  Heal = 6,
  Build = 7,
  Harvest = 8,
  Door = 9,
  Chest = 10,
  Pickup = 11,
  Shield = 12,
  Enter = 13,
  Crash = 14,
  Slide = 15,
  Climb = 16,
  BusJump = 17,
  Empty = 18,
}

export interface BusPath {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

const tmpIn: PlayerInput = { seq: 0, mx: 0, mz: 0, yaw: 0, pitch: 0, buttons: 0, actions: [], viewTick: 0 };

export class Match {
  readonly cfg: MatchConfig;
  readonly world: World;
  readonly content: WorldContent;
  readonly rng: Rng;
  tick = 0;
  phase: Phase = Phase.Bus;
  time = 0;
  readonly players: Player[] = [];
  readonly byId = new Map<number, Player>();
  readonly items: GroundItem[] = [];
  readonly projectiles: Projectile[] = [];
  readonly vehicles: Vehicle[] = [];
  zone: ZoneState = newZone();
  bus: BusPath = { x0: 0, z0: 0, x1: 0, z1: 0 };
  busT = 0;
  busDuration = 1;
  events: MatchEvent[] = [];
  /** Bauteil-Schlüssel → ID (Raster-Belegung) */
  private readonly buildKeys = new Map<string, number>();
  private readonly growing = new Map<number, number>(); // Bauteil → Wachstum 0..1
  private nextItemId = 1;
  private nextProjId = 1;
  private nextPlayerId = 1;
  teamsAlive = 0;
  winnerTeam = -1;
  results: PlacementResult[] = [];
  /** Pro Tick: Spieler, die Bots steuern sollen (wird von außen gesetzt) */
  botThink: ((m: Match, p: Player) => PlayerInput) | null = null;
  /** Zustand der Bot-KI (wird von bot.ts verwaltet) */
  readonly botBrains = new Map<number, unknown>();
  /** geöffnete Kisten / leere Munitionskisten bei Start */
  readonly lootPieces: number[] = [];

  constructor(cfg: MatchConfig, world: World, content: WorldContent) {
    this.cfg = cfg;
    this.world = world;
    this.content = content;
    this.rng = new Rng(cfg.seed);
  }

  // ---------------- Aufbau ----------------

  addPlayer(name: string, team: number, bot: boolean, cos: Cosmetics): Player {
    const id = this.nextPlayerId++;
    const p: Player = {
      id,
      name,
      team,
      bot,
      cos,
      body: newBody(MAP_CENTER, BUS_HEIGHT, MAP_CENTER),
      yaw: 0,
      pitch: 0,
      hp: MAX_HP,
      shield: 0,
      alive: true,
      bleed: 0,
      slots: Array.from({ length: SLOT_COUNT }, emptySlot),
      sel: 0,
      ammo: [0, 0, 0, 0, 0],
      mats: [0, 0, 0],
      build: false,
      buildPiece: 0,
      buildMat: Mat.Wood,
      fireCd: 0,
      reloadT: 0,
      burstLeft: 0,
      bloom: 0,
      useT: 0,
      useTotal: 0,
      aiming: false,
      firing: false,
      reviveT: 0,
      reviveTarget: -1,
      vehicle: -1,
      seat: -1,
      emote: -1,
      emoteT: 0,
      stats: { kills: 0, damage: 0, assists: 0, revives: 0, built: 0, harvested: 0, headshots: 0, chests: 0, distance: 0, knocks: 0 },
      queue: [],
      last: { ...tmpIn, actions: [] },
      lastSeq: 0,
      lastAttacker: -1,
      lastAttackerT: 0,
      assistBy: new Map(),
      place: 0,
      elimTick: 0,
      connected: true,
      spectate: -1,
      hx: new Float32Array(HIST),
      hy: new Float32Array(HIST),
      hz: new Float32Array(HIST),
      hh: new Float32Array(HIST),
      shots: 0,
      zoneAcc: 0,
      drive: null,
      firePrev: false,
      lastX: 0,
      lastZ: 0,
      inputsThisSecond: 0,
    };
    p.slots[0] = { id: 100, rarity: 0, qty: 0 }; // Spitzhacke
    p.body.mode = Mode.Bus;
    this.players.push(p);
    this.byId.set(id, p);
    return p;
  }

  roster(): RosterEntry[] {
    return this.players.map((p) => ({ id: p.id, name: p.name, team: p.team, bot: p.bot, cos: p.cos }));
  }

  /** Startet das Match: Fährenroute, Beute, Fahrzeuge. */
  start(): void {
    const rng = this.rng;
    // Route quer über die Insel
    const a = rng.next() * Math.PI * 2;
    const off = rng.range(-220, 220);
    const nx = -Math.sin(a),
      nz = Math.cos(a);
    const cx = MAP_CENTER + nx * off,
      cz = MAP_CENTER + nz * off;
    const L = 1000;
    this.bus = { x0: cx - Math.cos(a) * L, z0: cz - Math.sin(a) * L, x1: cx + Math.cos(a) * L, z1: cz + Math.sin(a) * L };
    this.busDuration = (2 * L) / BUS_SPEED;
    this.busT = 0;
    // Bodenbeute
    for (const spot of this.content.loot) {
      if (!rng.chance(0.78)) continue;
      const drops = rollFloor(rng, spot.tier);
      drops.forEach((d, i) => this.spawnItem(d, spot.x + i * 0.6, spot.y, spot.z + (i ? 0.4 : 0), false));
    }
    // Kisten: ein Teil ist leer
    for (const p of this.world.pieces) {
      if ((p.kind === Kind.Chest || p.kind === Kind.AmmoBox) && p.alive) {
        if (!rng.chance(p.kind === Kind.Chest ? 0.82 : 0.9)) p.state = 1;
        this.lootPieces.push(p.id);
      }
    }
    // Fahrzeuge
    this.content.vehicles.forEach((s, i) => {
      if (!rng.chance(0.75)) return;
      const y = this.world.terrain.height(s.x, s.z);
      this.vehicles.push(newVehicle(i, s.x, y, s.z, s.yaw));
    });
    for (const p of this.players) {
      p.body.mode = Mode.Bus;
      this.placeOnBus(p);
    }
    this.teamsAlive = new Set(this.players.map((p) => p.team)).size;
    this.phase = Phase.Bus;
    this.events.push({ t: 'phase', phase: Phase.Bus });
  }

  busPos(): [number, number, number] {
    const t = clamp(this.busT / this.busDuration, 0, 1);
    return [this.bus.x0 + (this.bus.x1 - this.bus.x0) * t, BUS_HEIGHT, this.bus.z0 + (this.bus.z1 - this.bus.z0) * t];
  }

  private placeOnBus(p: Player): void {
    const [x, y, z] = this.busPos();
    p.body.x = clamp(x, 2, MAP_SIZE - 2);
    p.body.y = y;
    p.body.z = clamp(z, 2, MAP_SIZE - 2);
    p.body.vx = p.body.vy = p.body.vz = 0;
  }

  /** Darf man schon abspringen? (Insel erreicht) */
  canJump(): boolean {
    const [x, , z] = this.busPos();
    return this.busT > 3 && x > 60 && z > 60 && x < MAP_SIZE - 60 && z < MAP_SIZE - 60;
  }

  // ---------------- Beute ----------------

  spawnItem(d: DropSpec, x: number, y: number, z: number, announce = true): GroundItem {
    const it: GroundItem = { id: this.nextItemId++, kind: d.kind, item: d.id, rarity: d.rarity, qty: d.qty, x, y, z, alive: true };
    this.items.push(it);
    if (announce) this.events.push({ t: 'item', it });
    return it;
  }

  private removeItem(it: GroundItem): void {
    it.alive = false;
    this.events.push({ t: 'itemDel', id: it.id });
  }

  /** Abgestorbene Einträge gelegentlich entfernen. */
  private compactItems(): void {
    if (this.tick % 150 !== 0) return;
    let w = 0;
    for (const it of this.items) if (it.alive) this.items[w++] = it;
    this.items.length = w;
  }

  private dropAround(p: Player, specs: DropSpec[]): void {
    const n = specs.length;
    const ground = this.world.groundAt(p.body.x, p.body.z, 0.3, p.body.y + 0.5).h;
    specs.forEach((s, i) => {
      const a = (i / Math.max(1, n)) * Math.PI * 2;
      const r = n > 1 ? 1.1 : 0.6;
      const x = p.body.x + Math.cos(a) * r,
        z = p.body.z + Math.sin(a) * r;
      this.spawnItem(s, x, Math.max(ground, this.world.groundAt(x, z, 0.3, p.body.y + 0.5).h, WATER_LEVEL - 1) + 0.05, z);
    });
  }

  /** Gegenstand aufnehmen. Gibt true zurück, wenn etwas aufgenommen wurde. */
  private pickup(p: Player, it: GroundItem, manual: boolean): boolean {
    if (!it.alive) return false;
    if (it.kind === DropKind.Ammo) {
      const cap = AMMO_MAX[it.item] ?? 999;
      const add = Math.min(it.qty, cap - p.ammo[it.item]!);
      if (add <= 0) return false;
      p.ammo[it.item]! += add;
      it.qty -= add;
      if (it.qty <= 0) this.removeItem(it);
      else this.events.push({ t: 'item', it });
      return true;
    }
    if (it.kind === DropKind.Material) {
      const add = Math.min(it.qty, MAX_MATERIAL - p.mats[it.item]!);
      if (add <= 0) return false;
      p.mats[it.item]! += add;
      it.qty -= add;
      if (it.qty <= 0) this.removeItem(it);
      else this.events.push({ t: 'item', it });
      return true;
    }
    if (!manual) return false;
    const stack = stackSize(it.item);
    // stapeln
    if (stack > 1) {
      for (let s = 1; s < SLOT_COUNT && it.qty > 0; s++) {
        const sl = p.slots[s]!;
        if (sl.id === it.item && sl.qty < stack) {
          const add = Math.min(stack - sl.qty, it.qty);
          sl.qty += add;
          it.qty -= add;
        }
      }
      if (it.qty <= 0) {
        this.removeItem(it);
        return true;
      }
    }
    let free = -1;
    for (let s = 1; s < SLOT_COUNT; s++)
      if (p.slots[s]!.id < 0) {
        free = s;
        break;
      }
    if (free < 0) {
      // tauschen mit aktuellem Platz
      const s = p.sel >= 1 ? p.sel : 1;
      const old = p.slots[s]!;
      this.spawnItem({ kind: DropKind.Item, id: old.id, rarity: old.rarity, qty: old.qty }, p.body.x, p.body.y + 0.05, p.body.z);
      free = s;
    }
    const w = weapon(it.item);
    const qty = Math.min(it.qty, stack);
    p.slots[free] = { id: it.item, rarity: it.rarity, qty };
    if (w && w.type === 0) p.slots[free]!.qty = it.qty; // Magazininhalt
    it.qty -= qty;
    if (w && w.type === 0) it.qty = 0;
    if (it.qty <= 0) this.removeItem(it);
    else this.events.push({ t: 'item', it });
    if (p.sel === 0 || p.slots[p.sel]!.id < 0) this.selectSlot(p, free);
    this.sfx(Sfx.Pickup, p);
    return true;
  }

  private selectSlot(p: Player, s: number): void {
    if (s < 0 || s >= SLOT_COUNT) return;
    if (s !== 0 && p.slots[s]!.id < 0) return;
    if (p.sel !== s) {
      p.reloadT = 0;
      p.useT = 0;
      p.burstLeft = 0;
      p.fireCd = Math.max(p.fireCd, 0.12);
    }
    p.sel = s;
    p.build = false;
  }

  // ---------------- Eingaben ----------------

  pushInput(pid: number, input: PlayerInput): void {
    const p = this.byId.get(pid);
    if (!p) return;
    if (input.seq <= p.lastSeq) return;
    if (p.queue.length > 12) p.queue.splice(0, p.queue.length - 12);
    p.queue.push(input);
  }

  private nextInput(p: Player): PlayerInput {
    const inp = p.queue.shift();
    if (inp) {
      p.lastSeq = inp.seq;
      p.last = inp;
      return inp;
    }
    // Keine Eingabe: letzte Eingabe ohne Einmal-Aktionen wiederholen
    tmpIn.seq = p.last.seq;
    tmpIn.mx = p.last.mx;
    tmpIn.mz = p.last.mz;
    tmpIn.yaw = p.last.yaw;
    tmpIn.pitch = p.last.pitch;
    tmpIn.buttons = p.last.buttons & ~Btn.Jump;
    tmpIn.actions = [];
    tmpIn.viewTick = p.last.viewTick;
    return tmpIn;
  }

  // ---------------- Hauptschleife ----------------

  step(): void {
    this.events = [];
    this.tick++;
    this.time += DT;
    if (this.phase === Phase.Ended) return;

    if (this.phase === Phase.Bus) {
      this.busT += DT;
      if (this.busT >= this.busDuration) {
        for (const p of this.players) if (p.body.mode === Mode.Bus) this.ejectFromBus(p);
        this.phase = Phase.Play;
        this.events.push({ t: 'phase', phase: Phase.Play });
      }
    }

    // Bots erzeugen Eingaben
    if (this.botThink) {
      for (const p of this.players) if (p.bot && p.alive) this.pushInput(p.id, this.botThink(this, p));
    }

    for (const p of this.players) {
      if (!p.alive) {
        p.queue.length = 0;
        continue;
      }
      // Bei Rückstand bis zu 2 Eingaben pro Tick verarbeiten
      const n = p.queue.length > 3 ? 2 : 1;
      for (let k = 0; k < n; k++) this.stepPlayer(p, this.nextInput(p));
    }

    this.stepVehicles();
    this.stepProjectiles();
    this.stepGrowing();
    if (this.phase === Phase.Play) {
      if (stepZone(this.zone, DT, this.cfg.zoneScale, this.rng, this.world.terrain)) this.events.push({ t: 'zone' });
      this.zoneDamage();
    }
    this.recordHistory();
    this.compactItems();
    this.checkEnd();
  }

  private ejectFromBus(p: Player): void {
    const b = p.body;
    this.placeOnBus(p);
    b.y -= 4;
    b.mode = Mode.Freefall;
    b.vy = -8;
    const [x1, , z1] = [this.bus.x1, 0, this.bus.z1];
    const d = Math.hypot(x1 - this.bus.x0, z1 - this.bus.z0) || 1;
    b.vx = ((x1 - this.bus.x0) / d) * 8;
    b.vz = ((z1 - this.bus.z0) / d) * 8;
    this.events.push({ t: 'sfx', k: Sfx.BusJump, x: b.x, y: b.y, z: b.z, pid: p.id });
  }

  private stepPlayer(p: Player, inp: PlayerInput): void {
    const b = p.body;
    p.yaw = inp.yaw;
    p.pitch = clamp(inp.pitch, -1.5, 1.5);
    const pressed = inp.buttons & ~b.prevBtn;

    // Bus
    if (b.mode === Mode.Bus) {
      this.placeOnBus(p);
      b.prevBtn = inp.buttons;
      const jump = (pressed & Btn.Jump) !== 0 || inp.actions.some((a) => actCode(a) === Act.JumpBus);
      if (jump && this.canJump()) this.ejectFromBus(p);
      return;
    }

    // Einmal-Aktionen
    for (const a of inp.actions) this.action(p, a);

    if (b.mode === Mode.Dead) return;

    const weaponDef = p.sel > 0 ? weapon(p.slots[p.sel]!.id) : undefined;
    p.aiming = (inp.buttons & Btn.Aim) !== 0 && !p.build && !!weaponDef && b.mode !== Mode.Downed;
    p.firing = (inp.buttons & Btn.Fire) !== 0;

    // Fahrzeug
    if (b.mode === Mode.Vehicle) {
      const v = this.vehicles[p.vehicle];
      if (!v || !v.alive) {
        this.exitVehicle(p);
      } else {
        if ((pressed & Btn.Jump) !== 0 && p.seat > 0) {
          this.exitVehicle(p);
        } else {
          const [sx, sy, sz] = seatPos(v, p.seat);
          b.x = sx;
          b.y = sy;
          b.z = sz;
          b.vx = -Math.sin(v.yaw) * v.speed;
          b.vz = -Math.cos(v.yaw) * v.speed;
          b.prevBtn = inp.buttons;
          if (p.seat > 0) this.combat(p, inp);
          else if (v.seats[0] === p.id) p.drive = { ...inp, actions: [] };
          return;
        }
      }
    }

    // Emote abbrechen bei Bewegung
    if (p.emote >= 0) {
      p.emoteT -= DT;
      if (p.emoteT <= 0 || Math.abs(inp.mx) + Math.abs(inp.mz) > 0.1 || (inp.buttons & (Btn.Fire | Btn.Jump)) !== 0) p.emote = -1;
    }

    const using = p.useT > 0;
    const res = stepBody(b, inp, DT, this.world, {
      aiming: p.aiming,
      canSprint: !using && !(p.firing && !!weaponDef) && p.reloadT <= 0,
      speedMul: using ? 0.6 : 1,
    });
    if (res.ev) this.moveEvents(p, res.ev, res.impact);

    // Distanz für Statistik
    const dd = Math.hypot(b.x - p.lastX, b.z - p.lastZ);
    if (dd < 5) p.stats.distance += dd;
    p.lastX = b.x;
    p.lastZ = b.z;

    // Niedergeschlagen: verbluten
    if (b.mode === Mode.Downed) {
      p.bleed -= DOWNED_BLEED * DT;
      if (p.bleed <= 0) this.eliminate(p, p.lastAttacker, -1, false, Cause.Bleed);
      return;
    }

    // Wiederbeleben (Interagieren halten)
    this.reviveLogic(p, inp);

    // Automatisch Munition und Material aufsammeln
    if (this.tick % 3 === p.id % 3) {
      for (const it of this.items) {
        if (!it.alive || it.kind === DropKind.Item) continue;
        if (dist2(it.x, it.z, b.x, b.z) < 2.2 && Math.abs(it.y - b.y) < 2) this.pickup(p, it, false);
      }
    }

    if (b.mode === Mode.Swim || b.mode === Mode.Freefall || b.mode === Mode.Glide || b.mode === Mode.Climb) {
      p.useT = 0;
      p.burstLeft = 0;
    } else {
      this.combat(p, inp);
    }
  }

  private moveEvents(p: Player, ev: number, impact: number): void {
    const b = p.body;
    if (ev & MoveEv.Jump) this.sfx(Sfx.Jump, p);
    if (ev & MoveEv.Land) {
      this.sfx(Sfx.Land, p);
      const dmg = fallDamage(impact);
      if (dmg > 0) this.damage(p, dmg, p.lastAttackerT > this.time - 10 ? p.lastAttacker : -1, -1, false, Cause.Fall, b.x, b.z, true);
    }
    if (ev & MoveEv.Glide) this.sfx(Sfx.Glide, p);
    if (ev & MoveEv.Pad) this.sfx(Sfx.Pad, p);
    if (ev & MoveEv.Splash) this.sfx(Sfx.Splash, p);
    if (ev & MoveEv.Slide) this.sfx(Sfx.Slide, p);
    if (ev & MoveEv.Climb) this.sfx(Sfx.Climb, p);
  }

  sfx(k: Sfx, p: Player): void {
    this.events.push({ t: 'sfx', k, x: p.body.x, y: p.body.y, z: p.body.z, pid: p.id });
  }

  private action(p: Player, a: number): void {
    const code = actCode(a),
      A = actA(a),
      B = actB(a);
    const b = p.body;
    const downed = b.mode === Mode.Downed;
    switch (code) {
      case Act.Slot:
        if (!downed) this.selectSlot(p, A);
        break;
      case Act.BuildToggle:
        if (!this.cfg.build || downed) break;
        p.build = !p.build;
        p.reloadT = 0;
        p.useT = 0;
        break;
      case Act.BuildPiece:
        if (!this.cfg.build || downed) break;
        if (A <= 2) {
          p.buildPiece = A as BuildPiece;
          p.build = true;
        }
        break;
      case Act.BuildMat:
        if (A <= 2) p.buildMat = A as Mat;
        break;
      case Act.Reload:
        this.startReload(p);
        break;
      case Act.Drop: {
        if (A < 1 || A >= SLOT_COUNT || downed) break;
        const s = p.slots[A]!;
        if (s.id < 0) break;
        this.spawnItem({ kind: DropKind.Item, id: s.id, rarity: s.rarity, qty: s.qty }, b.x - Math.sin(p.yaw) * 1.2, b.y + 0.05, b.z - Math.cos(p.yaw) * 1.2);
        p.slots[A] = emptySlot();
        if (p.sel === A) {
          p.sel = 0;
          p.reloadT = 0;
          p.useT = 0;
        }
        break;
      }
      case Act.DropAmmo: {
        if (A > 4 || downed) break;
        const q = Math.min(p.ammo[A]!, 30);
        if (q > 0) {
          p.ammo[A]! -= q;
          this.spawnItem({ kind: DropKind.Ammo, id: A, rarity: 0, qty: q }, b.x - Math.sin(p.yaw) * 1.2, b.y + 0.05, b.z - Math.cos(p.yaw) * 1.2);
        }
        break;
      }
      case Act.Swap: {
        if (A < 1 || B < 1 || A >= SLOT_COUNT || B >= SLOT_COUNT) break;
        const t = p.slots[A]!;
        p.slots[A] = p.slots[B]!;
        p.slots[B] = t;
        if (p.sel === A) p.sel = B;
        else if (p.sel === B) p.sel = A;
        break;
      }
      case Act.Emote:
        if (b.mode === Mode.Ground && !downed) {
          p.emote = A;
          p.emoteT = 6;
          p.build = false;
          this.events.push({ t: 'emote', pid: p.id, id: A });
        }
        break;
      case Act.InteractPress:
        this.interact(p);
        break;
      case Act.BuildRotate:
        break;
      default:
        break;
    }
  }

  // ---------------- Interaktion ----------------

  /** Was würde „Interagieren“ jetzt tun? (für Hinweise) */
  interactTarget(p: Player): { type: 'item' | 'door' | 'chest' | 'ammo' | 'vehicle' | 'exit' | 'revive'; id: number } | null {
    const b = p.body;
    if (b.mode === Mode.Vehicle) return { type: 'exit', id: p.vehicle };
    if (b.mode === Mode.Downed || b.mode === Mode.Dead || b.mode === Mode.Bus) return null;
    // Wiederbeleben
    for (const q of this.players) {
      if (q === p || q.team !== p.team || q.body.mode !== Mode.Downed || !q.alive) continue;
      if (dist2(q.body.x, q.body.z, b.x, b.z) < REVIVE_RANGE * REVIVE_RANGE && Math.abs(q.body.y - b.y) < 2) return { type: 'revive', id: q.id };
    }
    // Fahrzeuge
    for (const v of this.vehicles) {
      if (!v.alive) continue;
      if (dist2(v.x, v.z, b.x, b.z) < 3.6 * 3.6 && Math.abs(v.y - b.y) < 2.5 && v.seats.some((s) => s < 0)) return { type: 'vehicle', id: v.id };
    }
    // Blickrichtung
    const fx = -Math.sin(p.yaw),
      fz = -Math.cos(p.yaw);
    let best: { type: 'item' | 'door' | 'chest' | 'ammo'; id: number } | null = null;
    let bestScore = Infinity;
    this.world.query(b.x - INTERACT_RANGE, b.z - INTERACT_RANGE, b.x + INTERACT_RANGE, b.z + INTERACT_RANGE, (pc) => {
      if (!pc.alive) return;
      const isDoor = pc.kind === Kind.Door,
        isChest = pc.kind === Kind.Chest && pc.state === 0,
        isAmmo = pc.kind === Kind.AmmoBox && pc.state === 0;
      if (!isDoor && !isChest && !isAmmo) return;
      const cx = clamp(b.x, pc.x - pc.hx, pc.x + pc.hx),
        cz = clamp(b.z, pc.z - pc.hz, pc.z + pc.hz);
      const d = Math.hypot(cx - b.x, cz - b.z);
      if (d > INTERACT_RANGE || Math.abs(pc.y - (b.y + 1)) > 2.2) return;
      const facing = ((pc.x - b.x) * fx + (pc.z - b.z) * fz) / (Math.hypot(pc.x - b.x, pc.z - b.z) || 1);
      const score = d - facing * 0.8 + (isDoor ? 0.6 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = { type: isDoor ? 'door' : isChest ? 'chest' : 'ammo', id: pc.id };
      }
    });
    for (const it of this.items) {
      if (!it.alive || it.kind !== DropKind.Item) continue;
      const d2 = dist2(it.x, it.z, b.x, b.z);
      if (d2 > 2.4 * 2.4 || Math.abs(it.y - b.y) > 1.8) continue;
      const d = Math.sqrt(d2);
      const facing = ((it.x - b.x) * fx + (it.z - b.z) * fz) / (d || 1);
      const score = d - facing * 1.2 - 0.5;
      if (score < bestScore) {
        bestScore = score;
        best = { type: 'item', id: it.id };
      }
    }
    return best;
  }

  private interact(p: Player): void {
    const t = this.interactTarget(p);
    if (!t) return;
    const b = p.body;
    switch (t.type) {
      case 'exit':
        this.exitVehicle(p);
        break;
      case 'vehicle': {
        const v = this.vehicles[t.id];
        if (!v) break;
        const seat = v.seats.findIndex((s) => s < 0);
        if (seat < 0) break;
        v.seats[seat] = p.id;
        p.vehicle = v.id;
        p.seat = seat;
        b.mode = Mode.Vehicle;
        p.build = false;
        p.useT = 0;
        this.sfx(Sfx.Enter, p);
        break;
      }
      case 'door': {
        const pc = this.world.pieces[t.id]!;
        const ns = pc.state ? 0 : 1;
        // Tür nicht schließen, wenn jemand darin steht
        if (ns === 0) {
          for (const q of this.players) {
            if (!q.alive) continue;
            const qb = q.body;
            if (Math.abs(qb.x - pc.x) < pc.hx + PLAYER_RADIUS && Math.abs(qb.z - pc.z) < pc.hz + PLAYER_RADIUS && qb.y < pc.y + pc.hy && qb.y + 1.8 > pc.y - pc.hy) return;
          }
        }
        this.world.setState(pc.id, ns);
        this.events.push({ t: 'state', id: pc.id, state: ns });
        this.sfx(Sfx.Door, p);
        break;
      }
      case 'chest':
      case 'ammo': {
        const pc = this.world.pieces[t.id]!;
        if (pc.state) break;
        this.world.setState(pc.id, 1);
        this.events.push({ t: 'state', id: pc.id, state: 1 });
        const specs = t.type === 'chest' ? rollChest(this.rng, 0) : rollAmmoBox(this.rng);
        // Gegenstände zwischen Kiste und Spieler auffächern
        let tx = b.x - pc.x,
          tz = b.z - pc.z;
        const tl = Math.hypot(tx, tz) || 1;
        tx /= tl;
        tz /= tl;
        specs.forEach((s, i) => {
          const side = (i - (specs.length - 1) / 2) * 0.75;
          const x = pc.x + tx * (pc.hx + pc.hz + 0.5) - tz * side,
            z = pc.z + tz * (pc.hx + pc.hz + 0.5) + tx * side;
          const gy = this.world.groundAt(x, z, 0.2, pc.y + pc.hy + 0.2).h;
          this.spawnItem(s, x, gy + 0.05, z);
        });
        if (t.type === 'chest') p.stats.chests++;
        this.sfx(Sfx.Chest, p);
        break;
      }
      case 'item': {
        const it = this.items.find((i) => i.id === t.id);
        if (it) this.pickup(p, it, true);
        break;
      }
      default:
        break;
    }
  }

  private exitVehicle(p: Player): void {
    const v = this.vehicles[p.vehicle];
    const b = p.body;
    if (v) {
      const i = v.seats.indexOf(p.id);
      if (i >= 0) v.seats[i] = -1;
      const side = p.seat % 2 === 0 ? -1 : 1;
      const c = Math.cos(v.yaw),
        s = Math.sin(v.yaw);
      b.x = v.x + side * 2.4 * c;
      b.z = v.z - side * 2.4 * s;
      b.y = this.world.groundAt(b.x, b.z, PLAYER_RADIUS, v.y + 2).h;
      b.vx = -Math.sin(v.yaw) * v.speed * 0.5;
      b.vz = -Math.cos(v.yaw) * v.speed * 0.5;
    }
    p.vehicle = -1;
    p.seat = -1;
    b.mode = Mode.Air;
    b.vy = 2;
  }

  private reviveLogic(p: Player, inp: PlayerInput): void {
    const holding = (inp.buttons & Btn.Interact) !== 0;
    if (!holding || p.body.mode === Mode.Downed) {
      p.reviveT = 0;
      p.reviveTarget = -1;
      return;
    }
    const t = this.interactTarget(p);
    if (!t || t.type !== 'revive') {
      p.reviveT = 0;
      p.reviveTarget = -1;
      return;
    }
    if (p.reviveTarget !== t.id) {
      p.reviveTarget = t.id;
      p.reviveT = 0;
    }
    p.reviveT += DT;
    if (p.reviveT >= REVIVE_TIME) {
      const q = this.byId.get(t.id);
      if (q && q.body.mode === Mode.Downed) {
        q.body.mode = Mode.Ground;
        q.hp = 30;
        q.shield = 0;
        q.bleed = 0;
        p.stats.revives++;
        this.events.push({ t: 'revived', pid: q.id, by: p.id });
      }
      p.reviveT = 0;
      p.reviveTarget = -1;
    }
  }

  // ---------------- Kampf ----------------

  private startReload(p: Player): void {
    const s = p.slots[p.sel];
    if (!s) return;
    const w = weapon(s.id);
    if (!w || w.type !== 0 || p.reloadT > 0) return;
    if (s.qty >= w.mag || p.ammo[w.ammo]! <= 0) return;
    p.reloadT = reloadFor(w, s.rarity);
    p.burstLeft = 0;
    this.sfx(Sfx.Reload, p);
  }

  private combat(p: Player, inp: PlayerInput): void {
    const b = p.body;
    p.fireCd = Math.max(0, p.fireCd - DT);
    p.bloom = Math.max(0, p.bloom - DT * 0.12);
    const downed = b.mode === Mode.Downed;
    if (downed) return;
    const fire = (inp.buttons & Btn.Fire) !== 0;
    const firePressed = fire && !p.firePrev;
    p.firePrev = fire;

    // Bauen
    if (p.build) {
      if (fire && p.fireCd <= 0) this.tryBuild(p);
      return;
    }

    const slot = p.slots[p.sel]!;
    // Nachladen
    if (p.reloadT > 0) {
      p.reloadT -= DT;
      if (p.reloadT <= 0) {
        const w = weapon(slot.id);
        if (w) {
          const need = w.mag - slot.qty;
          const take = Math.min(need, p.ammo[w.ammo]!);
          slot.qty += take;
          p.ammo[w.ammo]! -= take;
        }
        p.reloadT = 0;
      }
      return;
    }

    // Verbrauchsgüter
    const cons = consumable(slot.id);
    if (cons) {
      if (p.useT > 0) {
        p.useT -= DT;
        if (p.useT <= 0) {
          p.useT = 0;
          if (cons.hp > 0 && p.hp < cons.hpCap) p.hp = Math.min(cons.hpCap, MAX_HP, p.hp + cons.hp);
          if (cons.shield > 0 && p.shield < cons.shieldCap) p.shield = Math.min(cons.shieldCap, MAX_SHIELD, p.shield + cons.shield);
          slot.qty--;
          if (slot.qty <= 0) {
            p.slots[p.sel] = emptySlot();
            p.sel = 0;
          }
          this.sfx(cons.shield > 0 ? Sfx.Shield : Sfx.Heal, p);
        }
        return;
      }
      if (fire && p.fireCd <= 0) {
        const can = (cons.hp > 0 && p.hp < cons.hpCap) || (cons.shield > 0 && p.shield < cons.shieldCap);
        if (can) {
          p.useT = cons.time;
          p.useTotal = cons.time;
        } else p.fireCd = 0.4;
      }
      return;
    }

    // Spitzhacke
    if (p.sel === 0) {
      if (fire && p.fireCd <= 0) this.swing(p);
      return;
    }

    const w = weapon(slot.id);
    if (!w) return;

    // Granate
    if (w.id === GRENADE_ID) {
      if (fire && p.fireCd <= 0 && slot.qty > 0) {
        this.throwGrenade(p);
        slot.qty--;
        p.fireCd = 1;
        if (slot.qty <= 0) {
          p.slots[p.sel] = emptySlot();
          p.sel = 0;
        }
      }
      return;
    }

    // Gedrückt halten feuert mit der Feuerrate der Waffe (auch Halbautomatik – angenehmer auf Touch)
    if ((!fire && p.burstLeft <= 0) || p.fireCd > 0) return;
    if (slot.qty <= 0) {
      p.burstLeft = 0;
      if (p.ammo[w.ammo]! > 0) this.startReload(p);
      else if (firePressed) {
        this.sfx(Sfx.Empty, p);
        p.fireCd = 0.3;
      }
      return;
    }
    slot.qty--;
    p.shots++;
    this.fireWeapon(p, w.id, slot.rarity, inp.viewTick);
    if (w.burst) {
      if (p.burstLeft > 0) p.burstLeft--;
      else p.burstLeft = w.burst - 1;
      p.fireCd = p.burstLeft > 0 ? 0.075 : 1 / w.rate;
    } else p.fireCd = 1 / w.rate;
    p.emote = -1;
    if (slot.qty <= 0 && p.ammo[w.ammo]! > 0) {
      p.burstLeft = 0;
      this.startReload(p);
    }
  }

  /** Augenposition und Zielstrahl (Kamera-Schulter-Versatz wie im Client). */
  aimRay(p: Player): { ox: number; oy: number; oz: number; dx: number; dy: number; dz: number; ex: number; ey: number; ez: number } {
    const b = p.body;
    const h = bodyHeight(b);
    const ey = b.y + Math.min(EYE_HEIGHT, h - 0.15);
    const cp = Math.cos(p.pitch);
    const dx = -Math.sin(p.yaw) * cp,
      dy = Math.sin(p.pitch),
      dz = -Math.cos(p.yaw) * cp;
    // Schulterversatz (rechts) – der Kamerastrahl geht durch diesen Punkt
    const rx = Math.cos(p.yaw),
      rz = -Math.sin(p.yaw);
    const sh = SHOULDER;
    return { ox: b.x + rx * sh, oy: ey + 0.25, oz: b.z + rz * sh, dx, dy, dz, ex: b.x, ey, ez: b.z };
  }

  private spreadDir(p: Player, w: (typeof WEAPONS)[number], dx: number, dy: number, dz: number): [number, number, number] {
    const b = p.body;
    const moving = Math.hypot(b.vx, b.vz) > 1;
    let s = p.aiming ? w.spreadAim : w.spreadHip;
    if (moving) s += w.spreadMove;
    if (b.mode === Mode.Air || b.mode === Mode.Vehicle) s += 0.03;
    if (b.crouch && !moving) s *= 0.75;
    s += p.bloom;
    if (s <= 0) return [dx, dy, dz];
    // zufällige Abweichung in einem Kegel
    const r = s * Math.sqrt(this.rng.next());
    const a = this.rng.next() * Math.PI * 2;
    // Basis senkrecht zu d
    let ux = -dz,
      uy = 0,
      uz = dx;
    let ul = Math.hypot(ux, uy, uz);
    if (ul < 1e-6) {
      ux = 1;
      uz = 0;
      ul = 1;
    }
    ux /= ul;
    uz /= ul;
    const vx = dy * uz - dz * uy,
      vy = dz * ux - dx * uz,
      vz = dx * uy - dy * ux;
    const ca = Math.cos(a) * r,
      sa = Math.sin(a) * r;
    const nx = dx + ux * ca + vx * sa,
      ny = dy + uy * ca + vy * sa,
      nz = dz + uz * ca + vz * sa;
    const nl = Math.hypot(nx, ny, nz);
    return [nx / nl, ny / nl, nz / nl];
  }

  private fireWeapon(p: Player, wid: number, rarity: number, viewTick: number): void {
    const w = WEAPONS[wid]!;
    const ray = this.aimRay(p);
    if (w.projectile) {
      this.spawnRocket(p, wid, rarity, ray);
      return;
    }
    const dmg = damageFor(w, rarity);
    const rewind = this.rewindTick(viewTick);
    for (let i = 0; i < w.pellets; i++) {
      const [dx, dy, dz] = this.spreadDir(p, w, ray.dx, ray.dy, ray.dz);
      const hit = this.traceShot(p, ray.ox, ray.oy, ray.oz, dx, dy, dz, w.range, rewind, ray.ex, ray.ey, ray.ez);
      const ex = ray.ox + dx * hit.t,
        ey = ray.oy + dy * hit.t,
        ez = ray.oz + dz * hit.t;
      let kind = 0;
      if (hit.player) {
        const fall = hit.t <= w.falloffStart ? 1 : Math.max(w.falloffMin, 1 - ((hit.t - w.falloffStart) / Math.max(1, w.range - w.falloffStart)) * (1 - w.falloffMin));
        const amount = dmg * fall * (hit.head ? w.headMul : 1);
        this.damage(hit.player, amount, p.id, wid, hit.head, Cause.Weapon, ray.ex, ray.ez);
        kind = hit.head ? 3 : 2;
      } else if (hit.piece >= 0) {
        this.damagePiece(hit.piece, dmg * w.structMul * 0.5, p);
        kind = 1;
      }
      // Für Schrot nur einige Leuchtspuren senden
      if (i < 3 || kind >= 2) this.events.push({ t: 'shot', pid: p.id, w: wid, ox: ray.ex, oy: ray.ey, oz: ray.ez, ex, ey, ez, hit: kind });
    }
    p.bloom = Math.min(0.08, p.bloom + w.spreadHip * 0.18);
  }

  private rewindTick(viewTick: number): number {
    const min = this.tick - MAX_REWIND * TICK_RATE;
    if (!viewTick || viewTick > this.tick) return this.tick;
    return Math.max(min, viewTick);
  }

  /** Strahl gegen Spieler (zurückgespult) und Welt. */
  traceShot(
    shooter: Player,
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    range: number,
    atTick: number,
    eyeX: number,
    eyeY: number,
    eyeZ: number,
  ): { t: number; player: Player | null; head: boolean; piece: number } {
    const wh = this.world.raycast(ox, oy, oz, dx, dy, dz, range);
    let bestT = wh.t,
      bestP: Player | null = null,
      head = false;
    for (const q of this.players) {
      if (q === shooter || !q.alive || q.body.mode === Mode.Bus) continue;
      if (q.team === shooter.team && q.body.mode !== Mode.Dead) continue;
      if (q.body.mode === Mode.Dead) continue;
      const [qx, qy, qz, qh] = this.historyAt(q, atTick);
      // Grobfilter
      const cx = qx - ox,
        cz = qz - oz;
      const along = cx * dx + cz * dz;
      if (along < -2 || along > bestT + 2) continue;
      const hit = rayCapsule(ox, oy, oz, dx, dy, dz, qx, qy, qz, qh);
      if (hit && hit.t < bestT) {
        bestT = hit.t;
        bestP = q;
        head = hit.head;
      }
    }
    // Verdeckung zwischen Auge und Trefferpunkt prüfen (keine Schüsse um Ecken aus der Kamera)
    const hx = ox + dx * bestT,
      hy = oy + dy * bestT,
      hz = oz + dz * bestT;
    const ddx = hx - eyeX,
      ddy = hy - eyeY,
      ddz = hz - eyeZ;
    const dl = Math.hypot(ddx, ddy, ddz);
    if (dl > 0.6) {
      const block = this.world.raycast(eyeX, eyeY, eyeZ, ddx / dl, ddy / dl, ddz / dl, dl - 0.3);
      if (block.piece !== -2) {
        const t = Math.hypot(eyeX + (ddx / dl) * block.t - ox, eyeY + (ddy / dl) * block.t - oy, eyeZ + (ddz / dl) * block.t - oz);
        return { t, player: null, head: false, piece: block.piece };
      }
    }
    return { t: bestT, player: bestP, head, piece: bestP ? -2 : wh.piece };
  }

  private recordHistory(): void {
    const i = this.tick % HIST;
    for (const p of this.players) {
      p.hx[i] = p.body.x;
      p.hy[i] = p.body.y;
      p.hz[i] = p.body.z;
      p.hh[i] = bodyHeight(p.body);
    }
  }

  /** Position eines Spielers zu einem (gebrochenen) vergangenen Tick. */
  historyAt(p: Player, t: number): [number, number, number, number] {
    if (t >= this.tick - 0.001) return [p.body.x, p.body.y, p.body.z, bodyHeight(p.body)];
    const t0 = Math.floor(t),
      f = t - t0;
    const i0 = ((t0 % HIST) + HIST) % HIST,
      i1 = (((t0 + 1) % HIST) + HIST) % HIST;
    if (this.tick - t0 >= HIST - 1) return [p.body.x, p.body.y, p.body.z, bodyHeight(p.body)];
    const x = p.hx[i0]! + (p.hx[i1]! - p.hx[i0]!) * f;
    const y = p.hy[i0]! + (p.hy[i1]! - p.hy[i0]!) * f;
    const z = p.hz[i0]! + (p.hz[i1]! - p.hz[i0]!) * f;
    // Sprünge (Teleport) nicht interpolieren
    if (Math.abs(p.hx[i1]! - p.hx[i0]!) > 8) return [p.hx[i1]!, p.hy[i1]!, p.hz[i1]!, p.hh[i1]!];
    return [x, y, z, p.hh[i1]!];
  }

  private swing(p: Player): void {
    p.fireCd = 0.5;
    p.emote = -1;
    const ray = this.aimRay(p);
    // Nahkampf vom Auge aus
    const eyeOx = ray.ex,
      eyeOy = ray.ey,
      eyeOz = ray.ez;
    const range = 2.9;
    const wh = this.world.raycast(eyeOx, eyeOy, eyeOz, ray.dx, ray.dy, ray.dz, range);
    // Spieler in Reichweite?
    let target: Player | null = null,
      tt = wh.t;
    for (const q of this.players) {
      if (q === p || !q.alive || q.team === p.team || q.body.mode === Mode.Dead || q.body.mode === Mode.Bus) continue;
      const h = rayCapsule(eyeOx, eyeOy, eyeOz, ray.dx, ray.dy, ray.dz, q.body.x, q.body.y, q.body.z, bodyHeight(q.body), 0.25);
      if (h && h.t < tt) {
        tt = h.t;
        target = q;
      }
    }
    this.events.push({ t: 'shot', pid: p.id, w: 100, ox: eyeOx, oy: eyeOy, oz: eyeOz, ex: eyeOx + ray.dx * tt, ey: eyeOy + ray.dy * tt, ez: eyeOz + ray.dz * tt, hit: target ? 2 : wh.piece >= 0 ? 1 : 0 });
    if (target) {
      this.damage(target, 14, p.id, 100, false, Cause.Melee, p.body.x, p.body.z);
      return;
    }
    if (wh.piece >= 0) {
      const pc = this.world.pieces[wh.piece]!;
      const m = harvestMat(pc);
      if (m !== Mat.None && !isBuilt(pc.kind) && pc.team < 0) {
        const gain = pc.kind === Kind.Tree ? 7 : pc.kind === Kind.Rock || pc.kind === Kind.Crystal ? 6 : pc.kind === Kind.Car ? 8 : 4;
        const add = Math.min(gain, MAX_MATERIAL - p.mats[m]!);
        p.mats[m]! += add;
        p.stats.harvested += add;
      }
      this.damagePiece(wh.piece, pc.kind === Kind.Tree || pc.kind === Kind.Rock ? 55 : 50, p);
      this.sfx(Sfx.Harvest, p);
    }
  }

  private throwGrenade(p: Player): void {
    const ray = this.aimRay(p);
    const sp = 22;
    this.projectiles.push({
      id: this.nextProjId++,
      owner: p.id,
      weapon: GRENADE_ID,
      x: ray.ex,
      y: ray.ey + 0.2,
      z: ray.ez,
      vx: ray.dx * sp + p.body.vx * 0.5,
      vy: ray.dy * sp + 5,
      vz: ray.dz * sp + p.body.vz * 0.5,
      fuse: 2.6,
      alive: true,
      rarity: 1,
    });
  }

  private spawnRocket(p: Player, wid: number, rarity: number, ray: ReturnType<Match['aimRay']>): void {
    const sp = 55;
    // Zielpunkt aus Kamerastrahl, Rakete startet an der Figur
    const wh = this.world.raycast(ray.ox, ray.oy, ray.oz, ray.dx, ray.dy, ray.dz, 400);
    const tx = ray.ox + ray.dx * wh.t,
      ty = ray.oy + ray.dy * wh.t,
      tz = ray.oz + ray.dz * wh.t;
    let dx = tx - ray.ex,
      dy = ty - ray.ey,
      dz = tz - ray.ez;
    const l = Math.hypot(dx, dy, dz) || 1;
    dx /= l;
    dy /= l;
    dz /= l;
    this.projectiles.push({ id: this.nextProjId++, owner: p.id, weapon: wid, x: ray.ex + dx * 0.8, y: ray.ey + dy * 0.8, z: ray.ez + dz * 0.8, vx: dx * sp, vy: dy * sp, vz: dz * sp, fuse: 8, alive: true, rarity });
    this.events.push({ t: 'shot', pid: p.id, w: wid, ox: ray.ex, oy: ray.ey, oz: ray.ez, ex: ray.ex + dx * 2, ey: ray.ey + dy * 2, ez: ray.ez + dz * 2, hit: 0 });
  }

  private stepProjectiles(): void {
    for (const pr of this.projectiles) {
      if (!pr.alive) continue;
      pr.fuse -= DT;
      const grenade = pr.weapon === GRENADE_ID;
      if (grenade) pr.vy -= 20 * DT;
      const sp = Math.hypot(pr.vx, pr.vy, pr.vz);
      const step = sp * DT;
      if (step > 0) {
        const dx = pr.vx / sp,
          dy = pr.vy / sp,
          dz = pr.vz / sp;
        const h = this.world.raycast(pr.x, pr.y, pr.z, dx, dy, dz, step);
        // Spielertreffer (Raketen)
        let hitPlayer = false;
        if (!grenade) {
          for (const q of this.players) {
            if (!q.alive || q.id === pr.owner || q.body.mode === Mode.Dead || q.body.mode === Mode.Bus) continue;
            const c = rayCapsule(pr.x, pr.y, pr.z, dx, dy, dz, q.body.x, q.body.y, q.body.z, bodyHeight(q.body), 0.2);
            if (c && c.t < h.t) hitPlayer = true;
          }
        }
        if (h.piece !== -2 || hitPlayer) {
          if (grenade && !hitPlayer) {
            // abprallen
            pr.x += dx * h.t * 0.95;
            pr.y += dy * h.t * 0.95;
            pr.z += dz * h.t * 0.95;
            const dot = pr.vx * h.nx + pr.vy * h.ny + pr.vz * h.nz;
            pr.vx = (pr.vx - 2 * dot * h.nx) * 0.45;
            pr.vy = (pr.vy - 2 * dot * h.ny) * 0.45;
            pr.vz = (pr.vz - 2 * dot * h.nz) * 0.45;
          } else {
            pr.x += dx * h.t;
            pr.y += dy * h.t;
            pr.z += dz * h.t;
            this.explode(pr);
            continue;
          }
        } else {
          pr.x += pr.vx * DT;
          pr.y += pr.vy * DT;
          pr.z += pr.vz * DT;
        }
      }
      if (pr.fuse <= 0 || pr.y < -20) this.explode(pr);
    }
    if (this.tick % 60 === 0) {
      let w = 0;
      for (const pr of this.projectiles) if (pr.alive) this.projectiles[w++] = pr;
      this.projectiles.length = w;
    }
  }

  private explode(pr: Projectile): void {
    pr.alive = false;
    const w = WEAPONS[pr.weapon]!;
    const R = pr.weapon === GRENADE_ID ? 5 : 4.2;
    const owner = this.byId.get(pr.owner);
    this.events.push({ t: 'boom', x: pr.x, y: pr.y, z: pr.z, r: R });
    const dmg = damageFor(w, pr.rarity);
    for (const q of this.players) {
      if (!q.alive || q.body.mode === Mode.Dead || q.body.mode === Mode.Bus) continue;
      if (owner && q.team === owner.team && q !== owner) continue;
      const d = Math.hypot(q.body.x - pr.x, q.body.y + 0.9 - pr.y, q.body.z - pr.z);
      if (d > R) continue;
      if (!this.world.lineOfSight(pr.x, pr.y + 0.3, pr.z, q.body.x, q.body.y + 1, q.body.z)) continue;
      const amt = dmg * (1 - (d / R) * 0.6) * (q === owner ? 0.5 : 1);
      this.damage(q, amt, pr.owner, pr.weapon, false, Cause.Explosion, pr.x, pr.z);
    }
    // Bauteile
    this.world.query(pr.x - R, pr.z - R, pr.x + R, pr.z + R, (pc) => {
      if (!pc.alive || !pc.destructible) return;
      const cx = clamp(pr.x, pc.x - pc.hx, pc.x + pc.hx),
        cy = clamp(pr.y, pc.y - pc.hy, pc.y + pc.hy),
        cz = clamp(pr.z, pc.z - pc.hz, pc.z + pc.hz);
      const d = Math.hypot(cx - pr.x, cy - pr.y, cz - pr.z);
      if (d > R) return;
      this.damagePiece(pc.id, dmg * w.structMul * (1 - (d / R) * 0.5), owner ?? null);
    });
    // Fahrzeuge
    for (const v of this.vehicles) {
      if (!v.alive) continue;
      const d = Math.hypot(v.x - pr.x, v.y - pr.y, v.z - pr.z);
      if (d < R + 1) this.damageVehicle(v, dmg * 2 * (1 - d / (R + 1)), pr.owner);
    }
  }

  // ---------------- Schaden ----------------

  damage(target: Player, amount: number, attackerId: number, wid: number, head: boolean, cause: Cause, fromX: number, fromZ: number, ignoreShield = false): void {
    if (!target.alive || target.body.mode === Mode.Dead || target.body.mode === Mode.Bus) return;
    const attacker = attackerId >= 0 ? this.byId.get(attackerId) : undefined;
    if (attacker && attacker !== target && attacker.team === target.team) return;
    amount = Math.max(1, Math.round(amount));
    const b = target.body;
    let shieldHit = false;
    if (b.mode === Mode.Downed) {
      target.bleed -= amount;
    } else {
      let rest = amount;
      if (!ignoreShield && target.shield > 0) {
        const s = Math.min(target.shield, rest);
        target.shield -= s;
        rest -= s;
        shieldHit = true;
      }
      target.hp -= rest;
    }
    target.useT = 0;
    target.emote = -1;
    if (attacker && attacker !== target) {
      attacker.stats.damage += amount;
      if (head) attacker.stats.headshots++;
      target.lastAttacker = attacker.id;
      target.lastAttackerT = this.time;
      target.assistBy.set(attacker.id, this.time);
      this.events.push({ t: 'dmg', to: attacker.id, target: target.id, amt: amount, head, shield: shieldHit && target.shield > 0, x: b.x, y: b.y + 1.9, z: b.z });
    }
    this.events.push({ t: 'hurt', to: target.id, fx: fromX, fz: fromZ, amt: amount });

    if (b.mode === Mode.Downed) {
      if (target.bleed <= 0) this.eliminate(target, attacker ? attacker.id : target.lastAttacker, wid, head, cause);
      return;
    }
    if (target.hp <= 0) {
      target.hp = 0;
      // Teamkameraden noch stehend? → niederschlagen
      const mates = this.players.some((q) => q !== target && q.team === target.team && q.alive && q.body.mode !== Mode.Downed && q.body.mode !== Mode.Dead);
      if (mates && cause !== Cause.Zone && b.mode !== Mode.Swim) {
        this.knock(target, attacker ? attacker.id : -1, wid, head, cause);
      } else {
        this.eliminate(target, attacker ? attacker.id : target.lastAttackerT > this.time - 10 ? target.lastAttacker : -1, wid, head, cause);
      }
    }
  }

  private knock(p: Player, killer: number, wid: number, head: boolean, cause: Cause): void {
    if (p.body.mode === Mode.Vehicle) this.exitVehicle(p);
    p.body.mode = Mode.Downed;
    p.body.crouch = false;
    p.bleed = DOWNED_HP;
    p.build = false;
    p.useT = 0;
    p.reloadT = 0;
    p.emote = -1;
    const k = this.byId.get(killer);
    if (k) k.stats.knocks++;
    this.events.push({ t: 'feed', killer, victim: p.id, w: wid, head, knock: true, cause });
  }

  eliminate(p: Player, killer: number, wid: number, head: boolean, cause: Cause): void {
    if (!p.alive) return;
    if (p.body.mode === Mode.Vehicle) this.exitVehicle(p);
    p.alive = false;
    p.hp = 0;
    p.shield = 0;
    p.elimTick = this.tick;
    p.body.mode = Mode.Dead;
    p.emote = -1;
    const k = killer >= 0 && killer !== p.id ? this.byId.get(killer) : undefined;
    if (k) k.stats.kills++;
    for (const [aid, t] of p.assistBy) if (aid !== killer && t > this.time - 15) this.byId.get(aid)!.stats.assists++;
    this.events.push({ t: 'feed', killer: k ? k.id : -1, victim: p.id, w: wid, head, knock: false, cause });
    // Inventar fallen lassen
    const drops: DropSpec[] = [];
    for (let s = 1; s < SLOT_COUNT; s++) {
      const sl = p.slots[s]!;
      if (sl.id >= 0) drops.push({ kind: DropKind.Item, id: sl.id, rarity: sl.rarity, qty: sl.qty });
    }
    p.ammo.forEach((a, i) => {
      if (a > 0) drops.push({ kind: DropKind.Ammo, id: i, rarity: 0, qty: a });
    });
    p.mats.forEach((m, i) => {
      if (m > 0) drops.push({ kind: DropKind.Material, id: i, rarity: 0, qty: m });
    });
    if (p.body.y > WATER_LEVEL - 1.5) this.dropAround(p, drops);
    p.slots = Array.from({ length: SLOT_COUNT }, emptySlot);
    p.slots[0] = { id: 100, rarity: 0, qty: 0 };
    p.ammo = [0, 0, 0, 0, 0];
    p.mats = [0, 0, 0];
    // Team ausgeschieden?
    const teamAlive = this.players.some((q) => q.team === p.team && q.alive && q.body.mode !== Mode.Downed);
    if (!teamAlive) {
      const place = this.teamsAlive;
      for (const q of this.players) {
        if (q.team !== p.team) continue;
        if (q.alive) {
          // Niedergeschlagene Teamkameraden scheiden mit aus
          q.alive = false;
          q.body.mode = Mode.Dead;
          q.elimTick = this.tick;
          this.events.push({ t: 'feed', killer: k ? k.id : -1, victim: q.id, w: wid, head: false, knock: false, cause: Cause.Bleed });
        }
        q.place = place;
        this.events.push({ t: 'elim', pid: q.id, place, killer: k ? k.id : -1 });
      }
      this.teamsAlive--;
      this.events.push({ t: 'teamOut', team: p.team, place });
    }
  }

  damagePiece(id: number, amount: number, _by: Player | null): void {
    const pc = this.world.pieces[id];
    if (!pc || !pc.alive || !pc.destructible) return;
    if (pc.kind === Kind.Chest || pc.kind === Kind.AmmoBox || pc.kind === Kind.Pad) return;
    const hp = Math.max(0, pc.hp - amount);
    if (hp <= 0) {
      this.destroyPiece(id);
    } else {
      this.world.setHp(id, hp);
      this.events.push({ t: 'piece', id, hp: Math.round(hp) });
    }
  }

  destroyPiece(id: number): void {
    const pc = this.world.pieces[id]!;
    this.world.remove(id);
    this.growing.delete(id);
    for (const [k, v] of this.buildKeys) if (v === id) this.buildKeys.delete(k);
    this.events.push({ t: 'pieceKill', id, x: pc.x, y: pc.y, z: pc.z });
    // Türen fallen mit der Wand; gebaute Teile ohne Halt stürzen ein
    if (isBuilt(pc.kind) || pc.group >= 0) {
      const fall = findUnsupported(this.world, pc.x, pc.z, 48);
      for (const f of fall) {
        if (!this.world.pieces[f]!.alive) continue;
        const q = this.world.pieces[f]!;
        this.world.remove(f);
        for (const [k, v] of this.buildKeys) if (v === f) this.buildKeys.delete(k);
        this.events.push({ t: 'pieceKill', id: f, x: q.x, y: q.y, z: q.z });
      }
    }
  }

  private tryBuild(p: Player): void {
    const b = p.body;
    if (b.mode === Mode.Swim || b.mode === Mode.Vehicle || b.mode === Mode.Downed) return;
    if (p.mats[p.buildMat]! < BUILD_COST) {
      // automatisch auf vorhandenes Material wechseln
      const alt = [0, 1, 2].find((m) => p.mats[m]! >= BUILD_COST);
      if (alt === undefined) {
        p.fireCd = 0.3;
        return;
      }
      p.buildMat = alt as Mat;
    }
    const pl = computePlacement(p.buildPiece, b.x, b.y, b.z, p.yaw, p.pitch);
    if (!placementInRange(pl, b.x, b.y, b.z)) return;
    if (this.buildKeys.has(pl.key)) {
      p.fireCd = 0.05;
      return;
    }
    if (pl.y + pl.hy < this.world.terrain.height(pl.x, pl.z) - 0.2 && pl.kind !== BUILD_KINDS[0]) return;
    const piece = makeBuilt(pl, p.buildMat, p.team);
    // Startet mit wenig Leben und wächst
    piece.hp = Math.round(piece.maxHp * 0.3);
    const id = this.world.add(piece);
    this.buildKeys.set(pl.key, id);
    this.growing.set(id, 0);
    p.mats[p.buildMat]! -= BUILD_COST;
    p.stats.built++;
    p.fireCd = 0.15;
    this.events.push({ t: 'pieceAdd', p: piece });
    this.sfx(Sfx.Build, p);
  }

  private stepGrowing(): void {
    if (!this.growing.size) return;
    for (const [id, g] of this.growing) {
      const pc = this.world.pieces[id]!;
      if (!pc.alive) {
        this.growing.delete(id);
        continue;
      }
      const ng = g + DT / 2.4;
      const add = (pc.maxHp * 0.7 * DT) / 2.4;
      pc.hp = Math.min(pc.maxHp, pc.hp + add);
      if (ng >= 1) {
        this.growing.delete(id);
        this.events.push({ t: 'piece', id, hp: Math.round(pc.hp) });
      } else this.growing.set(id, ng);
    }
  }

  // ---------------- Fahrzeuge ----------------

  private stepVehicles(): void {
    for (const v of this.vehicles) {
      if (!v.alive) continue;
      const driver = v.seats[0]! >= 0 ? this.byId.get(v.seats[0]!) : undefined;
      const inp = driver && driver.alive && driver.body.mode === Mode.Vehicle ? driver.drive : null;
      stepVehicle(v, inp, DT, this.world);
      if (v.crash > 9) {
        if (v.crashPiece >= 0) this.damagePiece(v.crashPiece, v.crash * 9, null);
        this.damageVehicle(v, v.crash * 1.5, -1);
        this.events.push({ t: 'sfx', k: Sfx.Crash, x: v.x, y: v.y, z: v.z, pid: -1 });
      }
      // Spieler anfahren
      const sp = Math.abs(v.speed);
      if (sp > 7) {
        for (const q of this.players) {
          if (!q.alive || q.vehicle === v.id || q.body.mode === Mode.Dead || q.body.mode === Mode.Bus || q.body.mode === Mode.Vehicle) continue;
          if (dist2(q.body.x, q.body.z, v.x, v.z) < (VEHICLE_RADIUS + 0.5) ** 2 && Math.abs(q.body.y - v.y) < 1.6) {
            const drv = v.seats[0]!;
            this.damage(q, sp * 2.2, drv >= 0 ? drv : -1, 101, false, Cause.Vehicle, v.x, v.z);
            q.body.vx += -Math.sin(v.yaw) * sp * 0.6;
            q.body.vz += -Math.cos(v.yaw) * sp * 0.6;
            q.body.vy = 5;
            q.body.mode = q.body.mode === Mode.Downed ? Mode.Downed : Mode.Air;
            v.speed *= 0.8;
          }
        }
      }
      // Insassen nachführen
      for (let s = 0; s < v.seats.length; s++) {
        const pid = v.seats[s]!;
        if (pid < 0) continue;
        const q = this.byId.get(pid);
        if (!q || !q.alive || q.body.mode !== Mode.Vehicle) {
          v.seats[s] = -1;
          continue;
        }
        const [x, y, z] = seatPos(v, s);
        q.body.x = x;
        q.body.y = y;
        q.body.z = z;
      }
    }
  }

  damageVehicle(v: Vehicle, amount: number, by: number): void {
    v.hp -= amount;
    if (v.hp <= 0 && v.alive) {
      v.alive = false;
      this.events.push({ t: 'boom', x: v.x, y: v.y + 0.8, z: v.z, r: 5 });
      for (const pid of v.seats) {
        const q = pid >= 0 ? this.byId.get(pid) : undefined;
        if (q) {
          this.exitVehicle(q);
          this.damage(q, 40, by, 102, false, Cause.Explosion, v.x, v.z);
        }
      }
    }
  }

  // ---------------- Zone & Ende ----------------

  private zoneDamage(): void {
    const z = this.zone;
    for (const p of this.players) {
      if (!p.alive || p.body.mode === Mode.Bus || p.body.mode === Mode.Dead) continue;
      if (!outsideZone(z, p.body.x, p.body.z)) {
        p.zoneAcc = 0;
        continue;
      }
      p.zoneAcc += DT;
      if (p.zoneAcc >= 1) {
        p.zoneAcc -= 1;
        if (p.body.mode === Mode.Downed) {
          p.bleed -= z.dps * 2;
          if (p.bleed <= 0) this.eliminate(p, p.lastAttacker, -1, false, Cause.Zone);
        } else this.damage(p, z.dps, -1, -1, false, Cause.Zone, z.cx, z.cz, true);
      }
    }
  }

  private checkEnd(): void {
    if (this.phase === Phase.Ended) return;
    const teams = new Set<number>();
    for (const p of this.players) if (p.alive) teams.add(p.team);
    if (teams.size <= 1) {
      this.phase = Phase.Ended;
      this.winnerTeam = teams.size === 1 ? [...teams][0]! : -1;
      for (const p of this.players) {
        if (p.team === this.winnerTeam) p.place = 1;
      }
      this.buildResults();
      this.events.push({ t: 'phase', phase: Phase.Ended });
      this.events.push({ t: 'end', winnerTeam: this.winnerTeam });
    }
  }

  buildResults(): void {
    const endTick = this.tick;
    this.results = this.players.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      bot: p.bot,
      place: p.place || 1,
      kills: p.stats.kills,
      damage: Math.round(p.stats.damage),
      assists: p.stats.assists,
      revives: p.stats.revives,
      survived: Math.round(((p.alive ? endTick : p.elimTick) / TICK_RATE) * 10) / 10,
      built: p.stats.built,
      harvested: p.stats.harvested,
      headshots: p.stats.headshots,
      chests: p.stats.chests,
      distance: Math.round(p.stats.distance),
      won: p.team === this.winnerTeam,
    }));
  }

  /** Spieler verlässt das Match endgültig. */
  leave(pid: number): void {
    const p = this.byId.get(pid);
    if (!p || !p.alive) return;
    this.eliminate(p, p.lastAttackerT > this.time - 10 ? p.lastAttacker : -1, -1, false, Cause.Leave);
  }

  /** Liste der noch nicht ausgeschiedenen Spieler. */
  aliveCount(): number {
    let n = 0;
    for (const p of this.players) if (p.alive) n++;
    return n;
  }

  /** Verbrauchsgut-IDs (für Bots) */
  static readonly CONSUMABLE_IDS = CONSUMABLES.map((c) => c.id);
  static readonly MAX_SHIELD = MAX_SHIELD;
}

export const SHOULDER = 0.55;

/** Strahl gegen eine stehende Kapsel (Zylinder + Kopfkugel). */
export function rayCapsule(
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  px: number,
  py: number,
  pz: number,
  h: number,
  extra = 0,
): { t: number; head: boolean } | null {
  const R = 0.42 + extra;
  let best: { t: number; head: boolean } | null = null;
  // Kopf
  const hr = 0.27 + extra,
    hcx = px,
    hcy = py + h - 0.22,
    hcz = pz;
  {
    const lx = ox - hcx,
      ly = oy - hcy,
      lz = oz - hcz;
    const b = lx * dx + ly * dy + lz * dz;
    const c = lx * lx + ly * ly + lz * lz - hr * hr;
    const disc = b * b - c;
    if (disc >= 0) {
      const t = -b - Math.sqrt(disc);
      if (t >= 0) best = { t, head: true };
    }
  }
  // Körper (senkrechter Zylinder bis unter den Kopf)
  const top = py + h - 0.45;
  const lx = ox - px,
    lz = oz - pz;
  const a = dx * dx + dz * dz;
  if (a > 1e-9) {
    const b = lx * dx + lz * dz;
    const c = lx * lx + lz * lz - R * R;
    const disc = b * b - a * c;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      for (const t of [(-b - sq) / a, (-b + sq) / a]) {
        if (t < 0) continue;
        const y = oy + dy * t;
        if (y >= py && y <= top) {
          if (!best || t < best.t) best = { t, head: false };
          break;
        }
      }
    }
  }
  // Deckel des Zylinders (Schüsse von oben/unten)
  if (Math.abs(dy) > 1e-6) {
    for (const yy of [top, py]) {
      const t = (yy - oy) / dy;
      if (t < 0) continue;
      const x = ox + dx * t - px,
        z = oz + dz * t - pz;
      if (x * x + z * z <= R * R && (!best || t < best.t)) best = { t, head: false };
    }
  }
  return best;
}
