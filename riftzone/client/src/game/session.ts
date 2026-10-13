// Client-Seite eines Matches: Weltkopie, Bodenbeute, Zwischenspeicher für Interpolation, Vorhersage der
// eigenen Figur (inkl. Fahrzeug) mit Abgleich gegen den Server.
import { DT, PLAYER_RADIUS, TICK_RATE } from '../../../shared/src/constants';
import { lerp, lerpAngle } from '../../../shared/src/math';
import type { GroundItem, MatchEvent } from '../../../shared/src/match';
import { copyBody, newBody, stepBody, type Body } from '../../../shared/src/movement';
import { decodeFrame, encodeInputs, encodeSpectate, type Frame, type NetPlayer, type NetVehicle, type SelfState, type StartInfo, type SyncData } from '../../../shared/src/protocol';
import { getTerrain } from '../../../shared/src/terrain';
import { Btn, Mode, Phase, type MatchConfig, type PlacementResult, type PlayerInput, type RosterEntry } from '../../../shared/src/types';
import { copyVehicle, newVehicle, stepVehicle, type Vehicle } from '../../../shared/src/vehicle';
import { World } from '../../../shared/src/world';
import { generateWorld, type WorldContent } from '../../../shared/src/worldgen';
import { weapon } from '../../../shared/src/items';
import type { Transport } from '../net/transport';

interface Pending {
  input: PlayerInput;
}

export interface SessionHandlers {
  onStart?: () => void;
  onEvents?: (evs: MatchEvent[], frame: Frame) => void;
  onResults?: (r: PlacementResult[], winnerTeam: number) => void;
  onWorldChanged?: (ids: number[]) => void;
  onItems?: () => void;
  onClose?: (reason: string) => void;
}

export class Session {
  readonly transport: Transport;
  world: World | null = null;
  content: WorldContent | null = null;
  readonly items = new Map<number, GroundItem>();
  start: StartInfo | null = null;
  config: MatchConfig | null = null;
  readonly roster = new Map<number, RosterEntry>();
  selfId = 0;
  team = 0;
  frames: Frame[] = [];
  latest: Frame | null = null;
  self: SelfState | null = null;
  results: PlacementResult[] | null = null;
  winnerTeam = -1;
  bus = { x0: 0, z0: 0, x1: 0, z1: 0, duration: 1 };
  phase: Phase = Phase.Bus;
  handlers: SessionHandlers = {};
  // Zeit
  private clockTick = 0;
  private clockSet = false;
  readonly interpDelay: number;
  // Vorhersage
  pred: Body = newBody();
  predPrev: Body = newBody();
  predVehicle: Vehicle | null = null;
  predVehiclePrev: Vehicle | null = null;
  private pending: Pending[] = [];
  private seq = 0;
  predicting = false;
  /** Darstellungs-Versatz nach Korrekturen (wird abgebaut) */
  readonly smooth = { x: 0, y: 0, z: 0 };
  lastAck = 0;
  ping = 0;
  private lastSendTime = new Map<number, number>();
  private sendQueue: PlayerInput[] = [];
  closed = false;

  constructor(transport: Transport, online: boolean) {
    this.transport = transport;
    this.interpDelay = online ? 4.2 : 2.2;
    transport.onMessage = (d) => this.receive(d);
    transport.onClose = (r) => {
      this.closed = true;
      this.handlers.onClose?.(r);
    };
  }

  private receive(d: ArrayBuffer | string): void {
    if (typeof d === 'string') {
      let msg: { t: string } & Record<string, unknown>;
      try {
        msg = JSON.parse(d);
      } catch {
        return;
      }
      if (msg.t === 'start') this.onStart(msg as unknown as StartInfo);
      else if (msg.t === 'sync') this.onSync(msg as unknown as SyncData);
      else if (msg.t === 'results') {
        this.results = msg.results as PlacementResult[];
        this.winnerTeam = msg.winnerTeam as number;
        this.handlers.onResults?.(this.results, this.winnerTeam);
      }
      return;
    }
    const f = decodeFrame(d);
    if (f) this.onFrame(f);
  }

  private onStart(s: StartInfo): void {
    this.start = s;
    this.config = s.config;
    this.selfId = s.selfId;
    this.team = s.team;
    this.roster.clear();
    for (const r of s.roster) this.roster.set(r.id, r);
    if (!this.world) {
      this.world = new World(getTerrain());
      this.content = generateWorld(this.world);
    }
  }

  private onSync(s: SyncData): void {
    const w = this.world;
    if (!w) return;
    this.bus = s.bus;
    this.phase = s.phase;
    for (const [id, alive, hp, state] of s.pieces) {
      const p = w.pieces[id];
      if (!p) continue;
      if (!alive) w.remove(id);
      else {
        w.setHp(id, hp);
        w.setState(id, state);
      }
    }
    for (const p of s.built) {
      if (!w.pieces[p.id] || !w.pieces[p.id]!.alive) w.addWithId({ ...p, alive: true });
    }
    this.items.clear();
    for (const it of s.items) this.items.set(it.id, { ...it, alive: true });
    this.clockTick = s.tick;
    this.clockSet = true;
    this.handlers.onWorldChanged?.(w.takeDirty());
    this.handlers.onItems?.();
    this.handlers.onStart?.();
  }

  private onFrame(f: Frame): void {
    const w = this.world;
    if (!w) return;
    // Uhr nachführen
    if (!this.clockSet) {
      this.clockTick = f.tick;
      this.clockSet = true;
    } else {
      const diff = f.tick - this.clockTick;
      if (Math.abs(diff) > 15) this.clockTick = f.tick;
      else this.clockTick += diff * 0.08;
    }
    this.phase = f.phase;
    this.frames.push(f);
    if (this.frames.length > 40) this.frames.splice(0, this.frames.length - 40);
    this.latest = f;
    // Ereignisse auf Welt anwenden
    let itemsChanged = false;
    for (const e of f.events) {
      switch (e.t) {
        case 'piece':
          w.setHp(e.id, e.hp);
          break;
        case 'pieceKill': {
          const p = w.pieces[e.id];
          if (p) {
            e.x = p.x;
            e.y = p.y;
            e.z = p.z;
          }
          w.remove(e.id);
          break;
        }
        case 'pieceAdd':
          w.addWithId({ ...e.p, alive: true });
          break;
        case 'state':
          w.setState(e.id, e.state);
          break;
        case 'item':
          this.items.set(e.it.id, { ...e.it, alive: true });
          itemsChanged = true;
          break;
        case 'itemDel':
          this.items.delete(e.id);
          itemsChanged = true;
          break;
        default:
          break;
      }
    }
    if (w.dirty.size) this.handlers.onWorldChanged?.(w.takeDirty());
    if (itemsChanged) this.handlers.onItems?.();
    // Eigener Zustand + Abgleich
    if (f.self) {
      this.self = f.self;
      this.reconcile(f);
    }
    // Ping aus Bestätigungen
    const sent = this.lastSendTime.get(f.ack);
    if (sent !== undefined) {
      this.ping = this.ping * 0.8 + (performance.now() - sent) * 0.2;
      for (const k of this.lastSendTime.keys()) if (k <= f.ack) this.lastSendTime.delete(k);
    }
    this.handlers.onEvents?.(f.events, f);
  }

  private canPredict(b: Body): boolean {
    return b.mode !== Mode.Bus && b.mode !== Mode.Dead && b.mode !== Mode.Vehicle;
  }

  private reconcile(f: Frame): void {
    const s = f.self!;
    const w = this.world!;
    this.lastAck = f.ack;
    this.pending = this.pending.filter((p) => p.input.seq > f.ack);
    const before = { x: this.pred.x, y: this.pred.y, z: this.pred.z };
    const hadPred = this.predicting;
    copyBody(s.body, this.pred);
    // Fahrer: Fahrzeug vorhersagen
    if (s.vstate && s.seat === 0) {
      this.predVehicle = copyVehicle(s.vstate, this.predVehicle ?? newVehicle(0, 0, 0, 0, 0));
    } else this.predVehicle = null;
    this.predicting = this.canPredict(s.body) || !!this.predVehicle;
    if (!this.predicting) {
      this.smooth.x = this.smooth.y = this.smooth.z = 0;
      return;
    }
    for (const p of this.pending) this.simulate(p.input, false);
    if (hadPred) {
      const dx = before.x - this.pred.x,
        dy = before.y - this.pred.y,
        dz = before.z - this.pred.z;
      if (dx * dx + dy * dy + dz * dz < 4 * 4) {
        this.smooth.x += dx;
        this.smooth.y += dy;
        this.smooth.z += dz;
      } else {
        this.smooth.x = this.smooth.y = this.smooth.z = 0;
      }
    }
    void w;
  }

  /** Einen Eingabeschritt lokal vorhersagen. */
  private simulate(input: PlayerInput, record: boolean): void {
    const w = this.world!;
    const s = this.self;
    if (this.predVehicle && s && s.seat === 0) {
      if (record) this.predVehiclePrev = copyVehicle(this.predVehicle, this.predVehiclePrev ?? newVehicle(0, 0, 0, 0, 0));
      stepVehicle(this.predVehicle, input, DT, w);
      return;
    }
    if (!this.canPredict(this.pred)) return;
    const wdef = s && s.sel > 0 ? weapon(s.slots[s.sel]!.id) : undefined;
    const using = !!s && s.useT > 0;
    const firing = (input.buttons & Btn.Fire) !== 0;
    stepBody(this.pred, input, DT, w, {
      aiming: (input.buttons & Btn.Aim) !== 0 && !!wdef && !(s?.build ?? false) && this.pred.mode !== Mode.Downed,
      canSprint: !using && !(firing && !!wdef) && (s?.reloadT ?? 0) <= 0,
      speedMul: using ? 0.6 : 1,
    });
  }

  /** Vom Spiel pro festem Tick aufgerufen: Eingabe senden und lokal vorhersagen. */
  tickInput(input: PlayerInput): void {
    input.seq = ++this.seq;
    input.viewTick = this.renderTick();
    copyBody(this.pred, this.predPrev);
    if (this.predicting) {
      this.simulate(input, true);
      this.pending.push({ input });
      if (this.pending.length > 90) this.pending.shift();
    }
    this.sendQueue.push(input);
    this.lastSendTime.set(input.seq, performance.now());
    // Doppelt senden: letzte 2 Eingaben (verlorene Pakete sind bei WS selten, schadet aber nicht)
    const batch = this.sendQueue.slice(-2);
    this.sendQueue = batch.slice(-1);
    this.transport.send(encodeInputs(batch));
    // Glättung abbauen
    const k = Math.exp(-DT * 12);
    this.smooth.x *= k;
    this.smooth.y *= k;
    this.smooth.z *= k;
  }

  spectate(target: number): void {
    this.transport.send(encodeSpectate(target));
  }

  /** Fortschreiben der Uhr (pro Bildschirmbild). */
  advance(dt: number): void {
    if (this.clockSet) this.clockTick += dt * TICK_RATE;
  }

  serverTick(): number {
    return this.clockTick;
  }

  renderTick(): number {
    return this.clockTick - this.interpDelay;
  }

  /** Interpolierter Zustand eines anderen Spielers. */
  remote(id: number, t = this.renderTick()): NetPlayer | null {
    const fr = this.frames;
    if (!fr.length) return null;
    let a: Frame | null = null,
      b: Frame | null = null;
    for (let i = fr.length - 1; i >= 0; i--) {
      if (fr[i]!.tick <= t) {
        a = fr[i]!;
        b = fr[i + 1] ?? null;
        break;
      }
    }
    if (!a) a = fr[0]!;
    const pa = a.players.find((p) => p.id === id);
    const pb = b ? b.players.find((p) => p.id === id) : undefined;
    if (!pa) return pb ?? this.latest?.players.find((p) => p.id === id) ?? null;
    if (!pb || !b) return pa;
    const k = Math.max(0, Math.min(1, (t - a.tick) / Math.max(1, b.tick - a.tick)));
    if (Math.abs(pa.x - pb.x) > 20 || Math.abs(pa.z - pb.z) > 20) return k < 0.5 ? pa : pb;
    return {
      ...pb,
      x: lerp(pa.x, pb.x, k),
      y: lerp(pa.y, pb.y, k),
      z: lerp(pa.z, pb.z, k),
      yaw: lerpAngle(pa.yaw, pb.yaw, k),
      pitch: lerp(pa.pitch, pb.pitch, k),
      h: lerp(pa.h, pb.h, k),
    };
  }

  /** IDs der Spieler im aktuellen Interessenbereich */
  visibleIds(): number[] {
    return this.latest ? this.latest.players.map((p) => p.id) : [];
  }

  vehicle(id: number, t = this.renderTick()): NetVehicle | null {
    const fr = this.frames;
    let a: Frame | null = null,
      b: Frame | null = null;
    for (let i = fr.length - 1; i >= 0; i--) {
      if (fr[i]!.tick <= t) {
        a = fr[i]!;
        b = fr[i + 1] ?? null;
        break;
      }
    }
    if (!a) a = fr[0] ?? null;
    if (!a) return null;
    const va = a.vehicles.find((v) => v.id === id);
    const vb = b?.vehicles.find((v) => v.id === id);
    if (!va) return vb ?? null;
    if (!vb || !b) return va;
    const k = Math.max(0, Math.min(1, (t - a.tick) / Math.max(1, b.tick - a.tick)));
    return { ...vb, x: lerp(va.x, vb.x, k), y: lerp(va.y, vb.y, k), z: lerp(va.z, vb.z, k), yaw: lerpAngle(va.yaw, vb.yaw, k) };
  }

  /** Eigene Darstellungsposition (Vorhersage interpoliert oder Server-Zustand). */
  selfRender(alpha: number): { x: number; y: number; z: number } {
    if (this.predicting && !this.predVehicle) {
      return {
        x: lerp(this.predPrev.x, this.pred.x, alpha) + this.smooth.x,
        y: lerp(this.predPrev.y, this.pred.y, alpha) + this.smooth.y,
        z: lerp(this.predPrev.z, this.pred.z, alpha) + this.smooth.z,
      };
    }
    const s = this.self?.body;
    return s ? { x: s.x, y: s.y, z: s.z } : { x: 768, y: 200, z: 768 };
  }

  /** Vorhergesagtes Fahrzeug (interpoliert) */
  vehicleRender(alpha: number): Vehicle | null {
    if (!this.predVehicle) return null;
    const a = this.predVehiclePrev ?? this.predVehicle,
      b = this.predVehicle;
    const v = copyVehicle(b, newVehicle(0, 0, 0, 0, 0));
    v.x = lerp(a.x, b.x, alpha);
    v.y = lerp(a.y, b.y, alpha);
    v.z = lerp(a.z, b.z, alpha);
    v.yaw = lerpAngle(a.yaw, b.yaw, alpha);
    return v;
  }

  name(id: number): string {
    return this.roster.get(id)?.name ?? '???';
  }

  leave(): void {
    this.closed = true;
    this.transport.leave();
  }

  static readonly RADIUS = PLAYER_RADIUS;
}
