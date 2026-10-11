import * as THREE from 'three';
import { ARENA, type BallState, type CarState } from '@shared/sim/types';

export interface CameraConfig {
  /** Sichtfeld in Grad (Grundwert) */
  fov: number;
  /** Abstandsfaktor 0.7 … 1.4 */
  distance: number;
  shake: boolean;
}

const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();

/** Begrenzt einen Punkt auf das Innere der Arena (mit Rand), damit die Kamera nie in Wänden steckt */
export function clampInsideArena(p: THREE.Vector3, margin = 0.6): THREE.Vector3 {
  const hw = ARENA.halfWidth - margin;
  const hl = ARENA.halfLength + ARENA.goalDepth - margin;
  p.x = Math.max(-hw, Math.min(hw, p.x));
  p.y = Math.max(margin, Math.min(ARENA.height - margin, p.y));
  // Hinter den Toren ist nur im Torraum Platz
  const inGoalLane = Math.abs(p.x) < ARENA.goalHalfWidth - margin && p.y < ARENA.goalHeight - margin;
  const lim = inGoalLane ? hl : ARENA.halfLength - margin;
  p.z = Math.max(-lim, Math.min(lim, p.z));
  return p;
}

/**
 * Verfolgerkamera: „Auto-Kamera" (hinter dem Auto in Fahrtrichtung) oder „Ball-Kamera" (Auto und Ball im Bild).
 * Weiche Nachführung, Sichtfeld wächst mit dem Tempo und beim Boost.
 */
export class ChaseCamera {
  readonly position = new THREE.Vector3(0, 6, -20);
  readonly target = new THREE.Vector3(0, 1, 0);
  fov = 80;
  private dir = new THREE.Vector3(0, 0, 1);
  private shakeT = 0;
  private shakeA = 0;
  private init = false;
  private time = 0;

  constructor(public cfg: CameraConfig) {
    this.fov = cfg.fov;
  }

  shake(amount = 0.25, sec = 0.35): void {
    if (!this.cfg.shake) return;
    this.shakeA = amount;
    this.shakeT = sec;
  }

  snap(): void {
    this.init = false;
  }

  /** Normale Fahrt-Kamera. `car` darf zerstört sein (dann Überblick auf den Ball). */
  update(dt: number, car: CarState, ball: BallState, ballCam: boolean, speed: number): void {
    this.time += dt;
    const dist = 3.7 * this.cfg.distance;
    const height = 1.35 * this.cfg.distance;
    const carPos = tmpA.set(car.pos[0], car.pos[1], car.pos[2]);
    const ballPos = tmpB.set(ball.pos[0], ball.pos[1], ball.pos[2]);
    // Blickrichtung des Autos (Nase) und Fahrtrichtung
    tmpQ.set(car.quat[0], car.quat[1], car.quat[2], car.quat[3]);
    const fwd = tmpC.set(0, 0, 1).applyQuaternion(tmpQ);
    const want = new THREE.Vector3();
    if (car.demolished > 0) {
      want.copy(ballPos).sub(carPos);
      want.y = 0;
    } else if (ballCam) {
      want.copy(ballPos).sub(carPos);
      want.y = 0;
      // Liegt der Ball hinter dem Auto, nimmt die Kamera die Fahrtrichtung (sonst stünde sie vor dem Auto)
      const f2 = Math.hypot(fwd.x, fwd.z) || 1;
      if (want.lengthSq() < 0.01 || (want.x * fwd.x + want.z * fwd.z) / (Math.sqrt(want.lengthSq()) * f2) < -0.15) want.set(fwd.x, 0, fwd.z);
    } else {
      const sp = Math.hypot(car.vel[0], car.vel[2]);
      if (sp > 4 && (car.vel[0] * fwd.x + car.vel[2] * fwd.z) > 0) want.set(car.vel[0], 0, car.vel[2]);
      else want.set(fwd.x, 0, fwd.z);
    }
    if (want.lengthSq() < 1e-6) want.set(0, 0, 1);
    want.normalize();
    if (!this.init) {
      this.dir.copy(want);
      this.init = true;
    } else {
      const k = 1 - Math.exp(-dt * (ballCam ? 7 : 5));
      this.dir.lerp(want, k).normalize();
    }
    const base = car.demolished > 0 ? ballPos : carPos;
    const pos = new THREE.Vector3().copy(base).addScaledVector(this.dir, -dist);
    pos.y = base.y + height + (car.demolished > 0 ? 6 : 0);
    // Beim Wandfahren die Kamera am „Oben" des Autos ausrichten
    const upCar = new THREE.Vector3(0, 1, 0).applyQuaternion(tmpQ);
    if (upCar.y < 0.7 && car.demolished <= 0) pos.addScaledVector(upCar, height * 0.6);
    clampInsideArena(pos);
    const look = new THREE.Vector3().copy(base);
    if (ballCam && car.demolished <= 0) look.lerp(ballPos, 0.55);
    look.y += 0.55;
    const kp = 1 - Math.exp(-dt * 12);
    if (this.position.lengthSq() === 0) this.position.copy(pos);
    this.position.lerp(pos, kp);
    this.target.lerp(look, 1 - Math.exp(-dt * 14));
    const fovWant = this.cfg.fov + Math.min(10, speed * 0.28) + (car.boosting ? 4 : 0);
    this.fov += (fovWant - this.fov) * (1 - Math.exp(-dt * 4));
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeA * Math.max(0, this.shakeT) * 3;
      this.position.x += Math.sin(this.time * 90) * a * 0.1;
      this.position.y += Math.cos(this.time * 77) * a * 0.1;
    }
  }

  /** Kreisende Torjubel-/Überblickskamera um einen Punkt */
  orbit(dt: number, center: THREE.Vector3, radius: number, height: number, angularSpeed: number): void {
    this.time += dt;
    const a = this.time * angularSpeed;
    const pos = new THREE.Vector3(center.x + Math.sin(a) * radius, center.y + height, center.z + Math.cos(a) * radius);
    clampInsideArena(pos, 1);
    const k = 1 - Math.exp(-dt * 3);
    this.position.lerp(pos, k);
    this.target.lerp(center, 1 - Math.exp(-dt * 6));
    this.fov += (this.cfg.fov - 10 - this.fov) * (1 - Math.exp(-dt * 3));
  }

  apply(cam: THREE.PerspectiveCamera): void {
    cam.position.copy(this.position);
    cam.fov = this.fov;
    cam.updateProjectionMatrix();
    cam.up.copy(UP);
    cam.lookAt(this.target);
  }
}
