/* Verfolgerkamera: weich, kollisionsbewusst, folgt hinter der Figur, wenn man läuft; Zielerfassung im Kampf; kurze Kamerafahrten. */
import { clamp, damp, dampAngle, lerp } from '../core/math.ts';
import type { Physics } from '../world/physics.ts';

export class CameraRig {
  yaw = Math.PI;
  pitch = 0.32;
  dist = 7.5;
  private presets = [5.2, 7.5, 11, 15];
  private preset = 1;
  private curDist = 7.5;
  readonly focus = new THREE.Vector3();
  private shake = 0;
  private idle = 0;
  private cine: { from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number } | null = null;
  lockTarget: THREE.Vector3 | null = null;
  vehicleMode = false;
  firstPerson = false;

  constructor(public cam: THREE.PerspectiveCamera, private physics: Physics) { }
  cyclePreset(): void { this.preset = (this.preset + 1) % this.presets.length; this.dist = this.presets[this.preset]; }
  addShake(a: number): void { this.shake = Math.max(this.shake, a); }
  /** Kurze Kamerafahrt zu einem Punkt (Zwischensequenz), danach zurück. */
  showPoint(x: number, y: number, z: number, sec: number): void {
    this.cine = { from: this.cam.position.clone(), to: new THREE.Vector3(x, y, z), t: 0, dur: sec };
  }
  get inCinematic(): boolean { return !!this.cine; }
  snapBehind(yaw: number): void { this.yaw = yaw; }

  update(dt: number, target: THREE.Vector3, targetYaw: number, moving: boolean, lookX: number, lookY: number, zoom: number, height = 1.4): void {
    if (zoom) { this.dist = clamp(this.dist + zoom * 1.2, 3.5, 18); }
    if (lookX || lookY) this.idle = 0; else this.idle += dt;
    this.yaw -= lookX;
    this.pitch = clamp(this.pitch + lookY, -0.35, 1.25);
    // sanft hinter die Figur drehen, wenn man läuft und die Kamera nicht bewegt
    if (moving && this.idle > 1.2) this.yaw = dampAngle(this.yaw, targetYaw, this.vehicleMode ? 2.4 : 0.9, dt);
    if (this.lockTarget) {
      const ty = Math.atan2(this.lockTarget.x - target.x, this.lockTarget.z - target.z);
      this.yaw = dampAngle(this.yaw, ty, 5, dt);
    }
    const fy = target.y + height;
    this.focus.set(damp(this.focus.x, target.x, 14, dt), damp(this.focus.y, fy, 9, dt), damp(this.focus.z, target.z, 14, dt));
    if (Math.abs(this.focus.x - target.x) > 30 || Math.abs(this.focus.z - target.z) > 30) this.focus.set(target.x, fy, target.z);
    const want = this.vehicleMode ? Math.max(this.dist, 9) : this.dist;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const dirX = -Math.sin(this.yaw) * cp, dirY = sp, dirZ = -Math.cos(this.yaw) * cp;
    // Hindernisse zwischen Figur und Kamera
    const bx = this.focus.x + dirX * want, by = this.focus.y + dirY * want, bz = this.focus.z + dirZ * want;
    const t = this.physics.rayBlock(this.focus.x, this.focus.y, this.focus.z, bx, by, bz);
    const d = Math.max(1.8, want * t);
    this.curDist = d < this.curDist ? d : damp(this.curDist, d, 3, dt);
    let px = this.focus.x + dirX * this.curDist, py = this.focus.y + dirY * this.curDist, pz = this.focus.z + dirZ * this.curDist;
    const gy = this.physics.terrain(px, pz) + 0.6;
    if (py < gy) py = gy;
    if (this.firstPerson) { px = target.x + Math.sin(targetYaw) * 0.3; py = target.y + height * 1.05; pz = target.z + Math.cos(targetYaw) * 0.3; }
    if (this.cine) {
      const c = this.cine; c.t += dt;
      const k = c.t < 0.8 ? c.t / 0.8 : c.t > c.dur - 0.8 ? Math.max(0, (c.dur - c.t) / 0.8) : 1;
      const s = k * k * (3 - 2 * k);
      const ox = c.to.x + 14, oy = c.to.y + 8, oz = c.to.z + 14;
      this.cam.position.set(lerp(px, ox, s), lerp(py, oy, s), lerp(pz, oz, s));
      const lx = lerp(this.focus.x, c.to.x, s), ly = lerp(this.focus.y, c.to.y, s), lz = lerp(this.focus.z, c.to.z, s);
      this.cam.lookAt(lx, ly, lz);
      if (c.t >= c.dur) this.cine = null;
      return;
    }
    this.cam.position.set(px, py, pz);
    if (this.shake > 0) { this.cam.position.x += (Math.random() - 0.5) * this.shake; this.cam.position.y += (Math.random() - 0.5) * this.shake; this.shake = Math.max(0, this.shake - dt * 2); }
    if (this.firstPerson) this.cam.lookAt(px + Math.sin(targetYaw) * 5, py - 0.3, pz + Math.cos(targetYaw) * 5);
    else this.cam.lookAt(this.focus.x, this.focus.y + 0.1, this.focus.z);
  }
}
