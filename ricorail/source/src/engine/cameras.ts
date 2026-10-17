// Kameras: Führerstand (mit Umsehen), Verfolger, Front, Heck, Fahrgast, Streckenrand, freie Kamera (nur Foto/Editor).
import * as THREE from 'three';
import type { Network } from '../railway/network';
import type { Train } from '../trains/train';

export type CamMode = 'cab' | 'chase' | 'front' | 'rear' | 'passenger' | 'trackside' | 'free' | 'walk';
export const CAM_NAMES: Record<CamMode, string> = { cab: 'Führerstand', chase: 'Verfolger', front: 'Front', rear: 'Heck', passenger: 'Fahrgast', trackside: 'Streckenrand', free: 'Freie Kamera', walk: 'Schaffner' };

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');

export class CameraRig {
  readonly cam: THREE.PerspectiveCamera;
  mode: CamMode = 'cab';
  /** Umsehen (Führerstand/Fahrgast) bzw. Orbit (Verfolger) */
  yaw = 0; pitch = -0.05; dist = 45;
  private side: THREE.Vector3 | null = null;
  private freePos = new THREE.Vector3();
  private freeYaw = 0; private freePitch = -0.2;
  move = { f: 0, r: 0, u: 0 };
  /** Schaffner: Wagen (Index im Zug) und Standort im Wagen (lokales x), Augenhöhe */
  walk = { car: 0, x: 0, eye: 2.9 };
  /** Kamera ruckelfrei nachziehen */
  private smooth = new THREE.Vector3(); private hasSmooth = false;

  constructor(aspect: number) {
    this.cam = new THREE.PerspectiveCamera(62, aspect, 0.15, 6000);
  }

  set(mode: CamMode) {
    if (mode === this.mode) return;
    if (mode === 'free') { this.freePos.copy(this.cam.position); const d = this.cam.getWorldDirection(_v); this.freeYaw = Math.atan2(-d.x, -d.z); this.freePitch = Math.asin(Math.max(-1, Math.min(1, d.y))); }
    this.mode = mode; this.yaw = 0; this.pitch = mode === 'chase' ? -0.25 : mode === 'walk' ? -0.15 : -0.05; this.side = null; this.hasSmooth = false;
    this.baseFov = mode === 'walk' ? 70 : mode === 'cab' || mode === 'passenger' ? 62 : 55; this.applyFov();
  }

  /** Blickwinkel fürs Querformat; im Hochformat breiter, damit seitlich nicht zu viel abgeschnitten wird */
  private baseFov = 62;
  applyFov() {
    const a = this.cam.aspect, ref = 1.2;
    let fov = this.baseFov;
    if (a < ref) { const t = Math.tan((fov * Math.PI) / 360) * ref / a; fov = Math.min(95, (Math.atan(t) * 360) / Math.PI); }
    this.cam.fov = fov; this.cam.updateProjectionMatrix();
  }

  look(dx: number, dy: number) {
    if (this.mode === 'free') { this.freeYaw -= dx * 0.004; this.freePitch = Math.max(-1.4, Math.min(1.4, this.freePitch - dy * 0.004)); return; }
    this.yaw -= dx * 0.005; this.pitch = Math.max(-1.2, Math.min(0.9, this.pitch - dy * 0.004));
    if (this.mode === 'cab' || this.mode === 'passenger') this.yaw = Math.max(-2.6, Math.min(2.6, this.yaw));
  }
  zoom(f: number) {
    if (this.mode === 'cab' || this.mode === 'passenger' || this.mode === 'walk') { this.baseFov = Math.max(25, Math.min(80, this.baseFov * f)); this.applyFov(); }
    else this.dist = Math.max(12, Math.min(400, this.dist * f));
  }
  resetLook() { this.yaw = 0; this.pitch = this.mode === 'chase' ? -0.25 : this.mode === 'walk' ? -0.15 : -0.05; }

  /**
   * lead: Weltmatrix des führenden Fahrzeugs; eye: Augpunkt im Fahrzeug (lokal); groundAt: Geländehöhe
   */
  update(dt: number, net: Network, t: Train | null, lead: THREE.Matrix4 | null, eye: THREE.Vector3, vehicles: (i: number) => THREE.Object3D | null, groundAt: (x: number, z: number) => number) {
    const c = this.cam;
    if (this.mode === 'free' || !t || !lead) {
      _e.set(this.freePitch, this.freeYaw, 0);
      c.quaternion.setFromEuler(_e);
      const sp = 40 * dt * (this.move.u > 1 ? 4 : 1);
      _v.set(this.move.r, 0, -this.move.f).applyQuaternion(c.quaternion).multiplyScalar(sp);
      this.freePos.add(_v); this.freePos.y += (this.move.u === 1 ? 1 : this.move.u === -1 ? -1 : 0) * sp;
      this.freePos.y = Math.max(this.freePos.y, groundAt(this.freePos.x, this.freePos.z) + 1.2);
      c.position.copy(this.freePos);
      return;
    }
    const pos = _v.setFromMatrixPosition(lead);
    const fwd = _w.set(lead.elements[0], lead.elements[1], lead.elements[2]).normalize();
    // Fahrtrichtung: Spitze des Zuges zeigt in Richtung des Kopfgleises
    const hp = net.pos(t.head);
    const dirSign = fwd.x * hp.dx * t.head.d + fwd.z * hp.dz * t.head.d >= 0 ? 1 : -1;
    switch (this.mode) {
      case 'cab': {
        c.position.copy(eye).applyMatrix4(lead);
        _q.setFromRotationMatrix(lead);
        c.quaternion.copy(_q);
        // Modell: +x vorn → Kamera blickt entlang −z: um −90° drehen
        c.rotateY(-Math.PI / 2);
        c.rotateY(this.yaw); c.rotateX(this.pitch);
        break;
      }
      case 'passenger': {
        const g = vehicles(Math.min(1, 9)) ?? vehicles(0);
        if (!g) break;
        g.updateMatrixWorld();
        c.position.set(0, 2.4, 0.9).applyMatrix4(g.matrixWorld);
        c.quaternion.setFromRotationMatrix(g.matrixWorld);
        c.rotateY(-Math.PI); // Blick zur rechten Fensterseite (+z)
        c.rotateY(this.yaw); c.rotateX(this.pitch);
        break;
      }
      case 'walk': {
        const g = vehicles(this.walk.car);
        if (!g) break;
        g.updateMatrixWorld();
        c.position.set(this.walk.x, this.walk.eye, 0).applyMatrix4(g.matrixWorld);
        c.quaternion.setFromRotationMatrix(g.matrixWorld);
        c.rotateY(-Math.PI / 2); // Blick entlang +x (Fahrzeugspitze)
        c.rotateY(this.yaw); c.rotateX(this.pitch);
        break;
      }
      case 'chase': case 'front': case 'rear': {
        let target: THREE.Vector3;
        if (this.mode === 'rear') {
          const tail = net.pos(t.posBehind(net, t.length));
          target = new THREE.Vector3(tail.x, tail.y + 2.5, tail.z);
        } else target = pos.clone().add(new THREE.Vector3(0, 2.5, 0));
        const base = Math.atan2(fwd.x * dirSign, fwd.z * dirSign);
        const a = base + Math.PI + this.yaw + (this.mode === 'front' ? Math.PI : 0) + (this.mode === 'rear' ? Math.PI : 0);
        const d = this.mode === 'chase' ? this.dist : this.dist * 0.6;
        const want = new THREE.Vector3(target.x + Math.sin(a) * d * Math.cos(this.pitch), target.y - Math.sin(this.pitch) * d, target.z + Math.cos(a) * d * Math.cos(this.pitch));
        want.y = Math.max(want.y, groundAt(want.x, want.z) + 1.5);
        if (!this.hasSmooth) { this.smooth.copy(want); this.hasSmooth = true; }
        this.smooth.lerp(want, 1 - Math.exp(-dt * 6));
        c.position.copy(this.smooth);
        c.lookAt(target);
        break;
      }
      case 'trackside': {
        if (!this.side || this.side.distanceTo(pos) > 700 || this.behind(pos, fwd.clone().multiplyScalar(dirSign))) {
          const ahead = t.posBehind(net, -350);
          const p = net.pos(ahead);
          const off = 9 + Math.random() * 6;
          this.side = new THREE.Vector3(p.x - p.dz * off, 0, p.z + p.dx * off);
          this.side.y = Math.max(p.y + 1.7, groundAt(this.side.x, this.side.z) + 1.7);
        }
        c.position.copy(this.side);
        c.lookAt(pos.x, pos.y + 2, pos.z);
        break;
      }
    }
  }

  private behind(pos: THREE.Vector3, fwd: THREE.Vector3): boolean {
    if (!this.side) return true;
    const dx = this.side.x - pos.x, dz = this.side.z - pos.z;
    return dx * fwd.x + dz * fwd.z < -80;
  }
}
