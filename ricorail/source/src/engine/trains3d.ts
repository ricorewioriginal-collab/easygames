// Zugdarstellung: platziert Fahrzeugmodelle entlang des Gleises (Drehgestellpunkte), Animation, Sichtweitenbegrenzung.
import * as THREE from 'three';
import type { Network } from '../railway/network';
import type { World } from '../operations/world';
import type { Train } from '../trains/train';
import type { TrackPos } from '../railway/schema';
import { buildVehicle, wheelRadius, type Quality, type VehicleModel } from './models/vehicles';

/** Momentaufnahme eines Zuges (für Wiederholung) */
export interface TrainPose { id: string; head: TrackPos; trail: { t: string; d: 1 | -1 }[]; odo: number; v: number; doorL: number; doorR: number; panto: number; lights: 0 | 1 | 2; types: string[]; flipped: boolean[]; loads: number[] }

interface VR { model: VehicleModel; uid: string; type: string }
interface TR { vehicles: VR[]; seen: number }

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _m = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);

export class TrainsView {
  readonly group = new THREE.Group();
  private net: Network;
  private q: Quality;
  private trains = new Map<string, TR>();
  private frame = 0;
  /** Weltmatrix des führenden Fahrzeugs des Spielerzuges (für Führerstand/Kamera) */
  readonly leadMatrix = new THREE.Matrix4();
  leadGroup: THREE.Group | null = null;

  constructor(scene: THREE.Scene, net: Network, q: Quality) {
    this.net = net; this.q = q;
    this.group.name = 'trains';
    scene.add(this.group);
  }

  setQuality(q: Quality) { if (q === this.q) return; this.q = q; for (const id of [...this.trains.keys()]) this.drop(id); }

  private drop(id: string) {
    const tr = this.trains.get(id); if (!tr) return;
    for (const v of tr.vehicles) { this.group.remove(v.model.group); v.model.dispose(); }
    this.trains.delete(id);
  }

  /** Synchronisiert alle Züge (live) – nur Züge im Umkreis werden gezeichnet */
  sync(world: World, cam: THREE.Vector3, range: number, playerId: string | null, hideLeadBody = false) {
    this.frame++;
    const net = this.net;
    for (const t of world.trains.values()) {
      const hp = net.pos(t.head);
      const d = Math.hypot(hp.x - cam.x, hp.z - cam.z) - t.length;
      if (d > range && t.id !== playerId) { if (this.trains.has(t.id)) this.drop(t.id); continue; }
      this.place(t.id, t, null, t.id === playerId, hideLeadBody && t.id === playerId, t.v * world.pendingTime);
    }
    for (const id of [...this.trains.keys()]) if (this.trains.get(id)!.seen !== this.frame) this.drop(id);
  }

  /** Zeichnet Momentaufnahmen (Wiederholung) */
  syncPoses(poses: TrainPose[], playerId: string | null) {
    this.frame++;
    for (const p of poses) this.place(p.id, null, p, p.id === playerId, false);
    for (const id of [...this.trains.keys()]) if (this.trains.get(id)!.seen !== this.frame) this.drop(id);
  }

  private place(id: string, t: Train | null, pose: TrainPose | null, isPlayer: boolean, hideLead: boolean, ext = 0) {
    const net = this.net;
    let tr = this.trains.get(id);
    const types = t ? t.consist.map((v) => v.type) : pose!.types.map((x) => ({ id: x }));
    const uids = t ? t.consist.map((v) => v.uid) : pose!.types.map((x, i) => `${x}#${i}`);
    // Zusammensetzung geändert (Kuppeln/Wenden)?
    if (tr && (tr.vehicles.length !== uids.length || tr.vehicles.some((v, i) => v.uid !== uids[i]))) { this.drop(id); tr = undefined; }
    if (!tr) {
      tr = { vehicles: [], seen: this.frame };
      const cons = t ? t.consist : pose!.types.map((x) => ({ type: vehicleType(x) }));
      cons.forEach((c, i) => {
        const model = buildVehicle(c.type, this.q);
        this.group.add(model.group);
        tr!.vehicles.push({ model, uid: uids[i], type: c.type.id });
      });
      this.trains.set(id, tr);
    }
    tr.seen = this.frame;
    // Positionierung: entlang der Spur hinter der Spitze
    let head = t ? t.head : pose!.head;
    let trail = t ? t.trail : pose!.trail;
    // Zwischen zwei Simulationstakten weiterrechnen (sonst ruckelt die Fahrt sichtbar)
    ext = Math.max(-2, Math.min(2, ext));
    let back = 0;
    if (ext > 0.001) {
      const m = net.move(head, ext);
      if (m.entered.length) trail = [...m.entered].reverse().concat(trail);
      head = m.pos;
    } else if (ext < -0.001) back = -ext;
    const behind = (x: number): TrackPos => posBehind(net, head, trail, x + back);
    let off = 0;
    const n = tr.vehicles.length;
    const cons = t ? t.consist : null;
    for (let i = 0; i < n; i++) {
      const vr = tr.vehicles[i];
      const type = cons ? cons[i].type : vehicleType(pose!.types[i]);
      const flipped = cons ? cons[i].flipped : pose!.flipped[i];
      const c = off + type.len / 2;
      const bo = Math.max(2, Math.max(...type.bogies.map(Math.abs)));
      const pf = net.pos(behind(c - bo)), pr = net.pos(behind(c + bo));
      _a.set(pf.x, pf.y, pf.z); _b.set(pr.x, pr.y, pr.z);
      _x.subVectors(_a, _b); if (_x.lengthSq() < 1e-6) _x.set(pf.dx, pf.dy, pf.dz); _x.normalize();
      if (flipped) _x.negate();
      _z.crossVectors(_x, UP).normalize();
      _y.crossVectors(_z, _x).normalize();
      _m.makeBasis(_x, _y, _z);
      const g = vr.model.group;
      g.quaternion.setFromRotationMatrix(_m);
      g.position.addVectors(_a, _b).multiplyScalar(0.5);
      g.visible = !(hideLead && i === 0);
      // Animation
      const odo = t ? t.odo + Math.abs(ext) : pose!.odo;
      const lights = t ? t.ctl.lights : pose!.lights;
      const first = i === 0, last = i === n - 1;
      const dl = t ? t.doorL : pose!.doorL, dr = t ? t.doorR : pose!.doorR;
      const load = cons ? (cons[i].type.payload ? cons[i].load / cons[i].type.payload! : 0) : pose!.loads[i];
      const vabs = Math.abs(t ? t.v : pose!.v);
      vr.model.update({
        wheelAngle: (flipped ? -1 : 1) * odo / wheelRadius(type),
        panto: t ? t.pantoUp : pose!.panto,
        doorL: flipped ? dr : dl, doorR: flipped ? dl : dr,
        frontLights: (first && !flipped ? lights : last && flipped && n > 1 ? 3 : 0) as 0 | 1 | 2,
        rearLights: (first && flipped ? (lights ? 2 : 0) : last && !flipped && n > 1 ? 1 : 0) as 0 | 1 | 2,
        cabLight: !!(t && first && t.ctl.cabLight),
        load, cargo: cons ? cons[i].cargo : null,
        smoke: type.traction === 'steam' ? Math.min(1, 0.25 + (t ? t.ctl.throttle : 0.3)) : type.traction === 'diesel' ? (t ? t.ctl.throttle * 0.6 : 0) : 0,
        speed: vabs,
      });
      if (isPlayer && first) { g.updateMatrixWorld(); this.leadMatrix.copy(g.matrixWorld); this.leadGroup = g; }
      off += type.len + 0.8;
    }
  }

  /** Mittelpunkt eines Fahrzeugs des Spielerzuges (Kamera) */
  vehicleGroup(id: string, idx: number): THREE.Group | null { return this.trains.get(id)?.vehicles[idx]?.model.group ?? null; }
  vehicleCount(id: string): number { return this.trains.get(id)?.vehicles.length ?? 0; }

  dispose() { for (const id of [...this.trains.keys()]) this.drop(id); this.group.removeFromParent(); }
}

import { vehicle } from '../trains/stock';
const vehicleType = (id: string) => vehicle(id);

/** Position x m hinter der Spitze entlang einer Spur (wie Train.posBehind) */
export function posBehind(net: Network, head: TrackPos, trail: { t: string; d: 1 | -1 }[], x: number): TrackPos {
  let remain = x;
  if (remain < 0) return { ...head };
  for (let i = 0; i < trail.length; i++) {
    const st = trail[i], len = net.track(st.t).len;
    const front = i === 0 ? head.s : st.d > 0 ? len : 0;
    const avail = st.d > 0 ? front : len - front;
    if (remain <= avail || i === trail.length - 1) return { t: st.t, s: front - Math.min(remain, avail) * st.d, d: st.d };
    remain -= avail;
  }
  return { ...head };
}

export function poseOf(t: Train): TrainPose {
  return { id: t.id, head: { ...t.head }, trail: t.trail.slice(0, 12).map((s) => ({ ...s })), odo: t.odo, v: t.v, doorL: t.doorL, doorR: t.doorR, panto: t.pantoUp, lights: t.ctl.lights, types: t.consist.map((v) => v.type.id), flipped: t.consist.map((v) => v.flipped), loads: t.consist.map((v) => (v.type.payload ? v.load / v.type.payload : 0)) };
}
