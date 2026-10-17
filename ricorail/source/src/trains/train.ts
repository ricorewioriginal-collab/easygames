// Zug: Fahrzeugverband, topologische Position (Kopf + Spur), Fahrzeugsysteme und Physikschritt.
import type { CargoType, Dir, TrackPos } from '../railway/schema';
import { Network, type Step, walkBack } from '../railway/network';
import { vehicle, type VehicleType } from './stock';
import {
  G, adhesion, curveResistance, dynBrakeForce, runResistance, stepBrake, tractionForce, type BrakeState, type Rail,
} from '../physics/dynamics';

export const COUPLER_GAP = 0.8;

export interface VehicleState {
  uid: string;
  type: VehicleType;
  load: number;            // t
  cargo: CargoType | null;
  flipped: boolean;
  handbrake: boolean;
  /** Ziel/Auftrag (Güterwagen) */
  dest?: string;
  /** Verschleiß 0..1 (Bahngesellschaft) */
  wear?: number;
}

export interface Controls {
  throttle: number;     // 0..1 (Dampf: Regler)
  brake: number;        // 0..1 Führerbremsventil (Betriebsbremse)
  dyn: number;          // 0..1 dynamische Bremse (bei Kombihebel automatisch)
  emergency: boolean;
  reverser: -1 | 0 | 1; // Fahrtrichtungsschalter
  cutoff: number;       // Dampf: Steuerung -0.8..0.8
  battery: boolean;
  panto: boolean;
  mainSwitch: boolean;
  engine: boolean;
  sand: boolean;
  horn: boolean;
  lights: 0 | 1 | 2;
  cabLight: boolean;
  wipers: boolean;
  parking: boolean;
  releaseL: boolean; releaseR: boolean;
  openL: boolean; openR: boolean;
  /** Dampf: Injektor (Speisewasser) und Feuern */
  injector: boolean; firing: number;
}

export interface TrainEvent { type: string; msg: string; sev: 'info' | 'warn' | 'error'; data?: unknown }

export interface Env { rail: Rail; /** automatischer Heizer/Zugvorbereitung (Einfach) */ assist: 'easy' | 'standard' | 'expert' }

let uidCounter = 1;
export const newUid = (p = 'v') => `${p}${(uidCounter++).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export function makeVehicles(ids: string[], flipped: number[] = [], loads: number[] = [], cargo?: (CargoType | null)[]): VehicleState[] {
  return ids.map((id, i) => {
    const type = vehicle(id);
    const load = Math.min(type.payload ?? 0, loads[i] ?? 0);
    return { uid: newUid(), type, load, cargo: load > 0 ? (cargo?.[i] ?? type.cargo?.[0] ?? null) : (cargo?.[i] ?? null), flipped: flipped.includes(i), handbrake: false, wear: 0 };
  });
}

export function defaultControls(): Controls {
  return {
    throttle: 0, brake: 0, dyn: 0, emergency: false, reverser: 0, cutoff: 0, battery: true, panto: true, mainSwitch: true, engine: true,
    sand: false, horn: false, lights: 1, cabLight: false, wipers: false, parking: false, releaseL: false, releaseR: false, openL: false, openR: false,
    injector: false, firing: 0.5,
  };
}

export class Train {
  id: string; name: string;
  consist: VehicleState[];
  head: TrackPos;
  trail: Step[];
  /** Geschwindigkeit in m/s, positiv = in Richtung Kopf */
  v = 0;
  acc = 0;
  ctl: Controls = defaultControls();
  brake: BrakeState = { pipe: 5, cyl: 0, mainRes: 9 };
  ai = false;
  /** Fahrzeuge ohne Triebfahrzeug (abgestellte Wagengruppe) */
  get isCut(): boolean { return !this.consist.some((v) => v.type.traction !== 'none' || v.type.cab); }
  // Zustände
  pantoUp = 1;          // 0..1 Animation
  engineRpm = 0;        // 0..1
  doorL = 0; doorR = 0; // 0..1
  slip = false; slide = false; flat = 0;
  odo = 0; energyKWh = 0; fuel = 0; water = 0; coal = 0;
  boiler = 14; glass = 0.7; fire = 0.7;
  tracF = 0; brakeF = 0;
  /** Komfortwert 0..100 */
  comfort = 100;
  sifaT = 0; sifaWarn = false;
  forcedBrake: string | null = null;
  events: TrainEvent[] = [];
  /** Fahrplan/Leitdaten (gesetzt vom Betrieb) */
  meta: Record<string, unknown> = {};
  length = 0;

  constructor(id: string, name: string, consist: VehicleState[], head: TrackPos, net: Network) {
    this.id = id; this.name = name; this.consist = consist; this.head = { ...head };
    this.recalc();
    const wb = walkBack(net, head, this.length + 5);
    this.trail = wb.trail;
    for (const v of consist) {
      if (v.type.fuel) this.fuel += v.type.fuel;
      if (v.type.water) this.water += v.type.water;
      if (v.type.coal) this.coal += v.type.coal;
    }
  }

  recalc() { this.length = this.consist.reduce((a, v) => a + v.type.len, 0) + COUPLER_GAP * Math.max(0, this.consist.length - 1); }
  get mass(): number { return this.consist.reduce((a, v) => a + v.type.mass + v.load, 0); }
  get vmax(): number { return Math.min(...this.consist.map((v) => v.type.vmax)); }
  get kmh(): number { return this.v * 3.6; }
  get cabVehicle(): VehicleState | undefined { return this.consist[0]?.type.cab ? this.consist[0] : undefined; }
  get traction(): 'electric' | 'diesel' | 'steam' | 'none' {
    const p = this.consist.find((v) => v.type.traction !== 'none'); return p ? p.type.traction : 'none';
  }
  get seats(): number { return this.consist.reduce((a, v) => a + (v.type.seats ?? 0), 0); }
  get doorsOpen(): boolean { return this.doorL > 0.02 || this.doorR > 0.02; }
  get hasDoors(): boolean { return this.seats > 0; }
  emit(type: string, msg: string, sev: TrainEvent['sev'] = 'info', data?: unknown) { this.events.push({ type, msg, sev, data }); }

  /** Belegte Gleisabschnitte [t, sMin, sMax] */
  span(net: Network): { t: string; s0: number; s1: number }[] {
    const out: { t: string; s0: number; s1: number }[] = [];
    let remain = this.length;
    for (let i = 0; i < this.trail.length && remain > 0; i++) {
      const st = this.trail[i], len = net.track(st.t).len;
      let front: number;
      if (i === 0) front = this.head.s; else front = st.d > 0 ? len : 0;
      const avail = st.d > 0 ? front : len - front;
      const use = Math.min(avail, remain);
      const back = front - use * st.d;
      out.push({ t: st.t, s0: Math.min(front, back), s1: Math.max(front, back) });
      remain -= use;
    }
    return out;
  }

  /** Position x Meter hinter der Zugspitze (Richtung = Fahrtrichtung des Zuges) */
  posBehind(net: Network, x: number): TrackPos {
    let remain = x;
    for (let i = 0; i < this.trail.length; i++) {
      const st = this.trail[i], len = net.track(st.t).len;
      const front = i === 0 ? this.head.s : st.d > 0 ? len : 0;
      const avail = st.d > 0 ? front : len - front;
      if (remain <= avail || i === this.trail.length - 1) {
        const s = front - Math.min(remain, avail) * st.d;
        return { t: st.t, s, d: st.d };
      }
      remain -= avail;
    }
    return { ...this.head };
  }

  tail(net: Network): TrackPos { return this.posBehind(net, this.length); }

  /** Mittelpunkt-Abstände der Fahrzeuge hinter der Spitze */
  vehicleOffsets(): number[] {
    const o: number[] = []; let x = 0;
    for (const v of this.consist) { o.push(x + v.type.len / 2); x += v.type.len + COUPLER_GAP; }
    return o;
  }

  /** Dreht den Zug um (Führerstandswechsel / Rückwärtsfahrt): Schluss wird Spitze. */
  flip(net: Network, keepConsist = false) {
    const tl = this.tail(net);
    const steps: Step[] = [];
    let remain = this.length;
    // Spur in umgekehrter Reihenfolge, nur der tatsächlich belegte Teil
    for (let i = 0; i < this.trail.length && remain > 0; i++) {
      const st = this.trail[i], len = net.track(st.t).len;
      const front = i === 0 ? this.head.s : st.d > 0 ? len : 0;
      const avail = st.d > 0 ? front : len - front;
      steps.push(st); remain -= avail;
    }
    this.trail = steps.reverse().map((s) => ({ t: s.t, d: (s.d * -1) as Dir }));
    this.head = { t: tl.t, s: tl.s, d: (tl.d * -1) as Dir };
    this.v = -this.v;
    if (!keepConsist) {
      this.consist.reverse();
      for (const v of this.consist) v.flipped = !v.flipped;
      this.ctl.reverser = 0;
    }
  }

  /** Bewegt den Zug um ds Meter (vorzeichenbehaftet). Liefert Prellbock-/Weichenereignisse. */
  advance(net: Network, ds: number) {
    if (ds === 0) return;
    if (ds < 0) { this.flip(net, true); this.advance(net, -ds); this.flip(net, true); return; }
    let rest = ds;
    for (let guard = 0; guard < 50 && rest > 1e-9; guard++) {
      const r = net.move(this.head, rest, false);
      this.head = r.pos;
      for (const e of r.entered) this.trail.unshift(e);
      rest = r.rest;
      if (r.blocked === 'buffer') {
        if (Math.abs(this.v) > 1.5) this.emit('buffer', `Aufprall auf Prellbock mit ${Math.round(Math.abs(this.v) * 3.6)} km/h`, 'error');
        else if (Math.abs(this.v) > 0.2) this.emit('buffer_touch', 'Prellbock berührt', 'warn');
        this.v = 0; break;
      }
      if (r.blocked === 'switch') {
        // Weiche wird aufgefahren: Lage wird erzwungen, Weiche ist danach gestört
        const node = net.nodeOf(this.head.t, this.head.d);
        const sw = net.switchAt.get(node);
        if (sw) {
          const li = sw.legs.indexOf(this.head.t);
          sw.state = li; net.failed.add(sw.id); net.version++;
          this.emit('trailed', `Weiche ${sw.id} aufgefahren – Weiche gestört`, 'error', sw.id);
        } else break;
      }
    }
    // Spur kürzen
    let need = this.length + 2, i = 0;
    for (; i < this.trail.length; i++) {
      const st = this.trail[i], len = net.track(st.t).len;
      const front = i === 0 ? this.head.s : st.d > 0 ? len : 0;
      need -= st.d > 0 ? front : len - front;
      if (need <= 0) break;
    }
    if (i + 1 < this.trail.length) this.trail.length = i + 1;
    this.odo += Math.abs(ds);
  }

  /** Physikschritt (fester Takt) */
  step(net: Network, env: Env, dt: number) {
    const c = this.ctl, vk = Math.abs(this.v) * 3.6;
    const mass = this.mass, massKg = mass * 1000, mEff = massKg * 1.06;
    const powered = this.consist.filter((v) => v.type.traction !== 'none');
    const offs = this.vehicleOffsets();
    // Fahrzeugsysteme
    const elec = this.traction === 'electric';
    const headTrack = net.track(this.head.t).def;
    if (elec) {
      const want = c.battery && c.panto ? 1 : 0;
      this.pantoUp += Math.sign(want - this.pantoUp) * Math.min(Math.abs(want - this.pantoUp), dt / 3);
      if (c.mainSwitch && (this.pantoUp < 0.99 || !headTrack.elec)) {
        if (c.mainSwitch && this.pantoUp >= 0.99 && !headTrack.elec) this.emit('nocatenary', 'Keine Oberleitung – Hauptschalter ausgelöst', 'warn');
        c.mainSwitch = false;
      }
    }
    const dieselOk = this.traction === 'diesel' && c.engine && this.fuel > 0;
    this.engineRpm += ((dieselOk ? 0.25 + 0.75 * c.throttle : 0) - this.engineRpm) * Math.min(1, dt * (dieselOk ? 0.8 : 0.4));
    const compressor = (elec && c.mainSwitch) || dieselOk || (this.traction === 'steam' && this.boiler > 6) || (this.traction === 'none' && false);
    // Dampf: Kessel
    if (this.traction === 'steam') this.stepSteam(env, dt);
    // Türen
    const canOpen = Math.abs(this.v) < 0.05;
    const tL = c.releaseL && c.openL && canOpen ? 1 : 0, tR = c.releaseR && c.openR && canOpen ? 1 : 0;
    this.doorL += Math.sign(tL - this.doorL) * Math.min(Math.abs(tL - this.doorL), dt / 2.5);
    this.doorR += Math.sign(tR - this.doorR) * Math.min(Math.abs(tR - this.doorR), dt / 2.5);
    if (this.doorsOpen && Math.abs(this.v) > 0.6 && !c.emergency) { c.emergency = true; this.emit('doors_moving', 'Fahrt mit offenen Türen – Notbremsung!', 'error'); }
    // Bremse
    const ep = this.consist.every((v) => v.type.ep);
    const freight = this.consist.some((v) => v.type.cls === 12 && v.type.traction === 'none') && !ep;
    const buildUp = ep ? 1.2 : freight ? 22 : 4;
    const brakeCmd = this.forcedBrake ? 1 : c.brake;
    stepBrake(this.brake, brakeCmd, c.emergency || !!this.forcedBrake && this.forcedBrake.startsWith('!'), buildUp, this.length, compressor, dt);
    // Neigung/Bogen je Fahrzeug
    let fGrav = 0, fCurve = 0, fRun = 0;
    const tmp: TrackPos = { t: '', s: 0, d: 1 };
    let elecHere = true;
    this.consist.forEach((veh, i) => {
      const p = this.posBehind(net, offs[i]);
      tmp.t = p.t; tmp.s = p.s; tmp.d = p.d;
      const tr = net.track(p.t), m = veh.type.mass + veh.load;
      fGrav += -m * 1000 * G * tr.grade(p.s) * p.d;
      fCurve += curveResistance(m, tr.radius(p.s));
      const axles = veh.type.bogies.length * 2;
      fRun += runResistance(m, axles, this.v, i === 0 ? veh.type.cdA : Math.min(veh.type.cdA, 1.0) * 0.6);
      if (veh.type.traction === 'electric' && !tr.def.elec) elecHere = false;
    });
    if (elec && !elecHere && c.mainSwitch) { c.mainSwitch = false; this.emit('nocatenary', 'Oberleitung endet – Hauptschalter ausgelöst', 'warn'); }
    // Zugkraft
    const mu = adhesion(env.rail, vk, c.sand);
    let fTr = 0, dir = 0;
    const tracBlocked = this.doorsOpen || c.emergency || !!this.forcedBrake || this.brake.cyl > 0.35;
    if (this.traction === 'steam') dir = Math.sign(c.cutoff); else dir = c.reverser;
    if (dir !== 0 && !tracBlocked && vk < this.vmax + 1) {
      for (const p of powered) {
        const ty = p.type;
        let set = c.throttle;
        if (ty.traction === 'electric' && !(c.mainSwitch && this.pantoUp > 0.99)) set = 0;
        if (ty.traction === 'diesel' && !dieselOk) set = 0;
        if (ty.traction === 'diesel') set *= Math.min(1, this.engineRpm * 1.15);
        if (ty.traction === 'steam') set = c.throttle * Math.min(1, Math.abs(c.cutoff) / 0.5) * Math.min(1, Math.max(0, (this.boiler - 3) / 11));
        fTr += tractionForce(ty.tractive ?? 0, ty.power ?? 0, this.v, set);
      }
      if (vk > this.vmax - 3) fTr *= Math.max(0, (this.vmax + 1 - vk) / 4);
    }
    // Haftungsgrenze Antrieb
    const onRack = net.track(this.head.t).def.rack && powered.some((p) => p.type.rack);
    const adhMass = powered.reduce((a, p) => a + p.type.mass + p.load, 0) * 1000;
    const fAdh = mu * adhMass * G;
    this.slip = false;
    if (!onRack && fTr > fAdh) {
      const modern = powered.every((p) => p.type.ep || p.type.traction === 'electric');
      fTr = modern ? fAdh * 0.95 : fAdh * 0.7;
      this.slip = !modern || fTr > 0;
      if (!modern) this.emit('slip', 'Räder schleudern – Leistung zurücknehmen oder sanden', 'warn');
    }
    // Bremskraft
    let fBr = 0;
    for (const veh of this.consist) {
      const bm = (veh.type.mass + veh.load * 0.5) * 1000;
      fBr += this.brake.cyl * (veh.type.brakePct / 100) * bm * 0.67;
      if (veh.handbrake) fBr += 0.1 * (veh.type.mass + veh.load) * 1000 * G;
      if (c.parking && veh.type.traction !== 'none') fBr += 0.14 * (veh.type.mass + veh.load) * 1000 * G;
      if ((c.emergency || this.forcedBrake?.startsWith('!')) && veh.type.mgBrake && vk > 3) fBr += veh.type.mgBrake * 1000;
    }
    const dynSet = Math.max(c.dyn, ep ? c.brake : 0);
    let fDyn = 0;
    for (const p of powered) if (p.type.dynBrake && (p.type.traction !== 'electric' || c.mainSwitch) && (p.type.traction !== 'diesel' || dieselOk)) fDyn += dynBrakeForce(p.type.dynBrake, this.v, dynSet);
    if (ep) fBr = Math.max(0, fBr - fDyn * 0.8);
    let fBrakeTotal = fBr + fDyn;
    const fBrAdh = mu * 1.05 * massKg * G + (onRack ? massKg * G * 0.3 : 0);
    this.slide = false;
    if (fBrakeTotal > fBrAdh && Math.abs(this.v) > 0.5) {
      const wsp = ep || this.consist.every((v) => v.type.cls !== 12);
      fBrakeTotal = fBrAdh * (wsp ? 0.92 : 0.75); this.slide = true;
      if (!wsp) this.flat = Math.min(1, this.flat + dt * 0.02);
    }
    this.tracF = fTr * dir; this.brakeF = fBrakeTotal;
    // Integration
    const fDrive = fTr * dir + fGrav;
    const fResist = fBrakeTotal + fRun + fCurve;
    const v0 = this.v;
    if (Math.abs(this.v) < 0.03) {
      if (Math.abs(fDrive) <= fResist) this.v = 0;
      else this.v += ((fDrive - Math.sign(fDrive) * fResist) / mEff) * dt;
    } else {
      const sgn = Math.sign(this.v);
      const nv = this.v + ((fDrive - sgn * fResist) / mEff) * dt;
      this.v = Math.sign(nv) !== sgn && Math.abs(fDrive) <= fResist ? 0 : nv;
    }
    const a = (this.v - v0) / dt;
    const jerk = Math.abs(a - this.acc) / dt;
    this.acc = a;
    if (this.hasDoors && (Math.abs(a) > 1.35 || jerk > 2.5)) this.comfort = Math.max(0, this.comfort - dt * (Math.abs(a) > 1.35 ? 6 : 2));
    // Energie
    if (fTr > 0) {
      const p = (fTr * Math.abs(this.v)) / 1000; // kW
      if (this.traction === 'electric') this.energyKWh += (p * dt) / 3600 / 0.85;
      if (this.traction === 'diesel') this.fuel = Math.max(0, this.fuel - (p * dt) / 3600 * 0.26);
    }
    if (this.traction === 'diesel' && dieselOk) this.fuel = Math.max(0, this.fuel - dt * 0.004);
    this.advance(net, this.v * dt);
    // Sifa (Sicherheitsfahrschaltung) im Expertenmodus
    if (env.assist === 'expert' && Math.abs(this.v) > 2 && !this.ai) {
      this.sifaT += dt;
      if (this.sifaT > 30 && !this.sifaWarn) { this.sifaWarn = true; this.emit('sifa_warn', 'Sifa: Bitte quittieren (Taste V)', 'warn'); }
      if (this.sifaT > 35 && this.forcedBrake !== '!Sifa') { this.forcedBrake = '!Sifa'; this.emit('sifa_brake', 'Sifa-Zwangsbremsung', 'error'); }
    } else if (Math.abs(this.v) <= 2) this.sifaT = 0;
  }

  sifaAck() { this.sifaT = 0; this.sifaWarn = false; if (this.forcedBrake === '!Sifa' && Math.abs(this.v) < 0.1) this.forcedBrake = null; }

  private stepSteam(env: Env, dt: number) {
    const c = this.ctl;
    const use = c.throttle * (0.25 + Math.abs(c.cutoff)) * (0.4 + Math.min(1.5, Math.abs(this.v) / 20)) * 0.55;
    if (env.assist !== 'expert') { c.firing = this.boiler < 14.5 ? Math.min(1, 0.3 + use * 1.4) : 0.15; c.injector = this.glass < 0.6; }
    if (this.coal <= 0) c.firing = 0;
    this.fire += (c.firing - this.fire) * Math.min(1, dt * 0.08);
    this.boiler = Math.max(0, Math.min(16, this.boiler + (this.fire * 0.55 - use * 0.75 - (c.injector ? 0.08 : 0) - 0.02) * dt * 0.35));
    if (this.boiler >= 16) this.boiler = 15.8; // Sicherheitsventil
    this.coal = Math.max(0, this.coal - this.fire * dt * 0.9);
    const inj = c.injector && this.water > 0 ? 0.015 : 0;
    this.glass = Math.max(0, Math.min(1, this.glass + (inj - use * 0.004 - 0.0003) * dt));
    if (inj) this.water = Math.max(0, this.water - dt * 15);
    if (this.glass < 0.12) { c.throttle = 0; this.emit('boiler', 'Wasserstand zu niedrig – Regler geschlossen, Injektor öffnen!', 'error'); }
  }

  /** Vollständige Zugvorbereitung (Einfach-Modus bzw. KI) */
  prepare() {
    const c = this.ctl;
    c.battery = true; c.panto = true; c.mainSwitch = true; c.engine = true; c.parking = false; c.lights = 1;
    this.pantoUp = 1; this.engineRpm = 0.3; this.brake.mainRes = 9; this.brake.pipe = 5; this.brake.cyl = 0;
    if (this.traction === 'steam') { this.boiler = 14; this.glass = 0.7; this.fire = 0.7; }
  }
  /** Kalter Zug (Lok abgerüstet) */
  coldStart() {
    const c = this.ctl;
    c.panto = false; c.mainSwitch = false; c.engine = false; c.parking = true; c.brake = 1; c.lights = 0; c.reverser = 0; c.throttle = 0;
    this.pantoUp = 0; this.engineRpm = 0; this.brake.mainRes = 4.5; this.brake.pipe = 3.5; this.brake.cyl = 1;
    if (this.traction === 'steam') { this.boiler = 9; this.fire = 0.4; }
  }
}
