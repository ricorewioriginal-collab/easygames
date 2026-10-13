// Third-Person-Kamera über der rechten Schulter. Der Kamerastrahl geht durch denselben Punkt,
// den der Server als Schussursprung nimmt (Schulterversatz), dadurch trifft das Fadenkreuz.
import * as THREE from 'three';
import { EYE_HEIGHT } from '../../../shared/src/constants';
import { SHOULDER } from '../../../shared/src/match';
import { clamp, lerp } from '../../../shared/src/math';
import { Mode } from '../../../shared/src/types';
import type { World } from '../../../shared/src/world';

export class ThirdPersonCamera {
  readonly cam: THREE.PerspectiveCamera;
  yaw = 0;
  pitch = -0.1;
  private dist = 3.2;
  private shoulder = SHOULDER;
  private height = 0.25;
  baseFov = 70;
  private zoom = 1;
  shake = 0;
  private t = 0;
  reducedMotion = false;
  /** Aktuelle Zielweite (Pivotabstand) für die Darstellung */
  readonly pivot = new THREE.Vector3();
  readonly forward = new THREE.Vector3();

  constructor(aspect: number) {
    this.cam = new THREE.PerspectiveCamera(70, aspect, 0.1, 5000);
  }

  setZoom(z: number): void {
    this.zoom = z;
  }

  update(dt: number, x: number, y: number, z: number, h: number, mode: Mode, aiming: boolean, world: World | null, vehicle: boolean): void {
    this.t += dt;
    let wantDist = 3.1,
      wantShoulder = SHOULDER,
      wantH = 0.25;
    if (mode === Mode.Freefall || mode === Mode.Glide) {
      wantDist = 7;
      wantShoulder = 0;
      wantH = 1.2;
    } else if (vehicle) {
      // Schulter/Höhe wie zu Fuß, damit Beifahrer genau zielen können
      wantDist = aiming ? 2.2 : 6.5;
    } else if (mode === Mode.Bus || mode === Mode.Dead) {
      wantDist = 12;
      wantShoulder = 0;
      wantH = 2;
    } else if (aiming) {
      wantDist = 1.6;
    } else if (mode === Mode.Downed) {
      wantDist = 3.6;
      wantH = 0.6;
    }
    const k = 1 - Math.exp(-dt * 10);
    this.dist = lerp(this.dist, wantDist, k);
    this.shoulder = lerp(this.shoulder, wantShoulder, k);
    this.height = lerp(this.height, wantH, k);
    const fov = this.baseFov / (aiming ? this.zoom : 1);
    if (Math.abs(this.cam.fov - fov) > 0.05) {
      this.cam.fov = lerp(this.cam.fov, fov, 1 - Math.exp(-dt * 14));
      this.cam.updateProjectionMatrix();
    }
    const cp = Math.cos(this.pitch);
    this.forward.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    const rx = Math.cos(this.yaw),
      rz = -Math.sin(this.yaw);
    const eye = y + Math.min(EYE_HEIGHT, h - 0.15);
    this.pivot.set(x + rx * this.shoulder, eye + this.height, z + rz * this.shoulder);
    // Kollision: Kamera nicht in Wände oder Gelände
    let d = this.dist;
    if (world) {
      const hit = world.raycast(this.pivot.x, this.pivot.y, this.pivot.z, -this.forward.x, -this.forward.y, -this.forward.z, this.dist + 0.3);
      if (hit.piece !== -2) d = Math.max(0.4, hit.t - 0.3);
      const ground = world.terrain.height(this.pivot.x - this.forward.x * d, this.pivot.z - this.forward.z * d);
      const camY = this.pivot.y - this.forward.y * d;
      if (camY < ground + 0.3) d = Math.min(d, Math.max(0.4, (this.pivot.y - ground - 0.3) / Math.max(0.05, this.forward.y)));
    }
    this.cam.position.set(this.pivot.x - this.forward.x * d, this.pivot.y - this.forward.y * d, this.pivot.z - this.forward.z * d);
    this.cam.lookAt(this.pivot.x + this.forward.x * 10, this.pivot.y + this.forward.y * 10, this.pivot.z + this.forward.z * 10);
    if (this.shake > 0 && !this.reducedMotion) {
      const s = this.shake * 0.04;
      this.cam.rotation.x += Math.sin(this.t * 61) * s;
      this.cam.rotation.y += Math.sin(this.t * 47) * s;
      this.shake = Math.max(0, this.shake - dt * 3);
    }
  }

  addLook(dx: number, dy: number): void {
    this.yaw -= dx;
    this.pitch = clamp(this.pitch - dy, -1.45, 1.45);
  }
}
