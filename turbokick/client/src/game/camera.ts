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

/** Kürzester Winkelabstand (−π … π) */
const angleDiff = (a: number, b: number): number => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

/**
 * Verfolgerkamera wie in Auto-Fußballspielen üblich:
 * - **Ball-Kamera:** Die Kamera steht hinter dem Auto auf der Linie Ball → Auto und blickt auf den Ball.
 *   Der Ball bleibt dadurch immer in der Bildmitte, das Auto unten davor. Liegt der Ball hinter dem Auto,
 *   schwenkt die Kamera mit begrenzter Drehgeschwindigkeit um das Auto herum (kein Springen).
 * - **Auto-Kamera:** Blick in Fahrtrichtung.
 * Die Drehung wird als Winkel geglättet (nie über einen Nullvektor), damit sie nicht flackert.
 * `cfg.fov` ist das HORIZONTALE Sichtfeld; im Hochformat wird automatisch weiter herausgezoomt.
 */
export class ChaseCamera {
  readonly position = new THREE.Vector3(0, 6, -20);
  readonly target = new THREE.Vector3(0, 1, 0);
  /** Vertikales Sichtfeld, das apply() setzt */
  fov = 70;
  private yaw = 0;
  /** Aktuelle Blickrichtung der Kamera als Gierwinkel (atan2(x, z)) */
  get heading(): number {
    return this.yaw;
  }
  private init = false;
  private shakeT = 0;
  private shakeA = 0;
  private time = 0;
  private boostFov = 0;
  private aspect = 16 / 9;
  private readonly want = new THREE.Vector3();
  private readonly look = new THREE.Vector3();

  constructor(public cfg: CameraConfig) {}

  shake(amount = 0.25, sec = 0.35): void {
    if (!this.cfg.shake) return;
    this.shakeA = amount;
    this.shakeT = sec;
  }

  snap(): void {
    this.init = false;
  }

  /** Hochformat: Abstand und Höhe wachsen, damit Ball und Auto trotz schmalem Bild sichtbar bleiben */
  private get portrait(): number {
    return Math.max(0, Math.min(1, (1.25 - this.aspect) / 0.7));
  }

  update(dt: number, car: CarState, ball: BallState, ballCam: boolean, speed: number): void {
    this.time += dt;
    const p = this.portrait;
    const dist = (3.9 + p * 1.6) * this.cfg.distance;
    const height = (1.45 + p * 0.7) * this.cfg.distance;
    const carPos = tmpA.set(car.pos[0], car.pos[1], car.pos[2]);
    const ballPos = tmpB.set(ball.pos[0], ball.pos[1], ball.pos[2]);
    const dead = car.demolished > 0;
    tmpQ.set(car.quat[0], car.quat[1], car.quat[2], car.quat[3]);
    const fwd = tmpC.set(0, 0, 1).applyQuaternion(tmpQ);
    // Gewünschte Blickrichtung (Gierwinkel um die Hochachse)
    let wantYaw: number;
    const toBallX = ballPos.x - carPos.x;
    const toBallZ = ballPos.z - carPos.z;
    const ballDist = Math.hypot(toBallX, toBallZ);
    if ((ballCam || dead) && ballDist > 0.8) wantYaw = Math.atan2(toBallX, toBallZ);
    else {
      const sp = Math.hypot(car.vel[0], car.vel[2]);
      const fx = Math.hypot(fwd.x, fwd.z) > 0.3 ? fwd.x : car.vel[0];
      const fz = Math.hypot(fwd.x, fwd.z) > 0.3 ? fwd.z : car.vel[2];
      // Beim Rückwärtsfahren nicht umdrehen; an Wänden der Bewegung folgen
      wantYaw =
        sp > 6 && Math.hypot(fwd.x, fwd.z) < 0.5 ? Math.atan2(car.vel[0], car.vel[2]) : Math.atan2(fx, fz);
    }
    if (!Number.isFinite(wantYaw)) wantYaw = this.yaw;
    if (!this.init) {
      this.yaw = wantYaw;
      this.init = true;
    } else {
      // Exponentiell nachführen, aber höchstens ~3 Umdrehungen pro Sekunde
      const d = angleDiff(this.yaw, wantYaw);
      const step = d * (1 - Math.exp(-dt * (ballCam ? 9 : 6)));
      const maxStep = 6 * dt;
      this.yaw += Math.max(-maxStep, Math.min(maxStep, step));
    }
    const dx = Math.sin(this.yaw);
    const dz = Math.cos(this.yaw);
    const base = dead ? ballPos : carPos;
    const want = this.want.set(
      base.x - dx * dist,
      Math.max(base.y, 0.2) + height + (dead ? 5 : 0),
      base.z - dz * dist,
    );
    clampInsideArena(want);
    // Blickziel: Ball-Kamera schaut auf den Ball (Höhe begrenzt, damit das Auto nicht aus dem Bild fällt), sonst vor das Auto
    const look = this.look;
    if ((ballCam || dead) && ballDist > 0.8) {
      look.copy(ballPos);
      const maxUp = base.y + height + Math.max(2, ballDist * 0.45);
      look.y = Math.min(look.y, maxUp);
      // Nahe am Auto etwas tiefer blicken, damit das eigene Auto sichtbar bleibt
      look.lerp(base, ballDist < 6 ? 0.35 : 0.12);
    } else look.set(base.x + dx * 6, base.y + 0.9, base.z + dz * 6);
    if (!this.position.lengthSq() || !this.initPos) {
      this.position.copy(want);
      this.target.copy(look);
      this.initPos = true;
    }
    // Position folgt fest (kein Gummiband-Gefühl), Blickziel etwas weicher
    this.position.lerp(want, 1 - Math.exp(-dt * 16));
    this.target.lerp(look, 1 - Math.exp(-dt * 12));
    this.boostFov +=
      ((car.boosting ? 5 : 0) + Math.min(8, speed * 0.25) - this.boostFov) * (1 - Math.exp(-dt * 4));
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeA * Math.max(0, this.shakeT) * 3;
      this.position.x += Math.sin(this.time * 90) * a * 0.1;
      this.position.y += Math.cos(this.time * 77) * a * 0.1;
    }
  }
  private initPos = false;

  /** Kreisende Torjubel-/Überblickskamera um einen Punkt */
  orbit(dt: number, center: THREE.Vector3, radius: number, height: number, angularSpeed: number): void {
    this.time += dt;
    const a = this.time * angularSpeed;
    const pos = new THREE.Vector3(
      center.x + Math.sin(a) * radius,
      center.y + height,
      center.z + Math.cos(a) * radius,
    );
    clampInsideArena(pos, 1);
    // Die Jubelkamera bleibt im Spielfeld (nicht im Tornetz)
    pos.z = Math.max(-(ARENA.halfLength - 2), Math.min(ARENA.halfLength - 2, pos.z));
    const k = 1 - Math.exp(-dt * 3);
    this.position.lerp(pos, k);
    this.target.lerp(center, 1 - Math.exp(-dt * 6));
    this.boostFov += (0 - this.boostFov) * k;
    this.init = false;
  }

  /** Setzt Kamera-Position/-Blick; rechnet das horizontale Sichtfeld in das vertikale um (Hoch- und Querformat) */
  apply(cam: THREE.PerspectiveCamera): void {
    this.aspect = cam.aspect > 0 ? cam.aspect : 16 / 9;
    const hfov = Math.min(120, this.cfg.fov + this.boostFov) * (Math.PI / 180);
    let vfov = 2 * Math.atan(Math.tan(hfov / 2) / this.aspect) * (180 / Math.PI);
    vfov = Math.max(45, Math.min(100, vfov));
    this.fov = vfov;
    cam.position.copy(this.position);
    cam.fov = vfov;
    cam.updateProjectionMatrix();
    cam.up.copy(UP);
    cam.lookAt(this.target);
  }
}
