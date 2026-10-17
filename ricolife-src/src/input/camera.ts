// Kamera: schräge Draufsicht mit Drehen, Zoomen, Verschieben; weiche Bewegung, Grenzen der Stadt.
import * as THREE from 'three';
import { MAP_W, MAP_H, LEVEL_H } from '../world/world';

export class CameraRig {
  readonly cam: THREE.PerspectiveCamera;
  /** Zielpunkt am Boden */
  tx = 30;
  tz = 36;
  ty = 0;
  yaw = Math.PI * 0.25;
  pitch = 0.82;
  dist = 15;
  // geglättete Werte
  private x = 30;
  private z = 36;
  private y = 0;
  private yw = Math.PI * 0.25;
  private pt = 0.82;
  private d = 15;
  reduceMotion = false;

  constructor(aspect: number) {
    this.cam = new THREE.PerspectiveCamera(36, aspect, 0.3, 400);
  }
  setAspect(a: number): void {
    this.cam.aspect = a;
    this.cam.updateProjectionMatrix();
  }
  focus(x: number, z: number, snap = false): void {
    this.tx = x;
    this.tz = z;
    if (snap || this.reduceMotion) {
      this.x = x;
      this.z = z;
    }
  }
  setLevel(l: number): void {
    this.ty = l * LEVEL_H;
  }
  /** Bildschirm-Ziehen in Pixeln: der Boden folgt dem Finger */
  pan(dxPx: number, dyPx: number): void {
    const s = this.dist * 0.0019;
    this.move(-dxPx * s, dyPx * s);
  }
  /** Verschiebung in Weltmetern relativ zur Blickrichtung */
  move(right: number, fwd: number): void {
    const c = Math.cos(this.yaw),
      s = Math.sin(this.yaw);
    // Blickrichtung (vom Auge zum Ziel) am Boden: (-sin, -cos)
    this.tx += right * c - fwd * s;
    this.tz += -right * s - fwd * c;
    this.clamp();
  }
  rotate(d: number): void {
    this.yaw += d;
  }
  zoom(f: number): void {
    this.dist = Math.max(4, Math.min(100, this.dist * f));
  }
  /** zoomen und dabei den Bodenpunkt (gx, gz) unter dem Zeiger festhalten */
  zoomAt(f: number, gx: number, gz: number): void {
    const before = this.dist;
    this.zoom(f);
    const k = 1 - this.dist / before;
    this.tx += (gx - this.tx) * k;
    this.tz += (gz - this.tz) * k;
    this.clamp();
  }
  tilt(d: number): void {
    this.pitch = Math.max(0.45, Math.min(1.35, this.pitch + d));
  }
  private clamp(): void {
    this.tx = Math.max(-5, Math.min(MAP_W + 8, this.tx));
    this.tz = Math.max(-5, Math.min(MAP_H + 5, this.tz));
  }
  /** pro Frame */
  update(dt: number): void {
    const k = this.reduceMotion ? 1 : 1 - Math.exp(-dt * 10);
    this.x += (this.tx - this.x) * k;
    this.z += (this.tz - this.z) * k;
    this.y += (this.ty - this.y) * k;
    this.yw += (this.yaw - this.yw) * k;
    this.pt += (this.pitch - this.pt) * k;
    this.d += (this.dist - this.d) * k;
    const h = Math.sin(this.pt) * this.d,
      r = Math.cos(this.pt) * this.d;
    this.cam.position.set(this.x + Math.sin(this.yw) * r, this.y + h, this.z + Math.cos(this.yw) * r);
    this.cam.lookAt(this.x, this.y + 0.8, this.z);
  }
  get focusX(): number {
    return this.x;
  }
  get focusZ(): number {
    return this.z;
  }
  get smoothYaw(): number {
    return this.yw;
  }
}
