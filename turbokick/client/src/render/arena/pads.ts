import * as THREE from 'three';
import { BIG_PAD_RESPAWN, SMALL_PAD_RESPAWN } from '@shared/sim/types';
import type { PadState, SimState } from '@shared/sim/types';
import { Batch } from './geometry';
import type { Palette } from './themes';

/** Weicher runder Schein (klein, prozedural, wird vom Aufrufer freigegeben) */
export function makeGlowTexture(size = 64): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot((x + 0.5) / size - 0.5, (y + 0.5) / size - 0.5) * 2;
      const a = Math.pow(Math.max(0, 1 - d), 2.2);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(a * 255);
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

function flatten(g: THREE.BufferGeometry): THREE.BufferGeometry {
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * Die Boost-Felder: kleine = flache leuchtende Scheiben mit Blitz, große = Sechseck-Plattform mit schwebendem Nitro-Kanister.
 * Alles instanziert (4 Zeichenaufrufe). Wird beim ersten update() anhand von state.pads aufgebaut.
 */
export class PadsView {
  readonly group = new THREE.Group();
  private built = false;
  private count = 0;
  private small!: THREE.InstancedMesh;
  private big!: THREE.InstancedMesh;
  private can!: THREE.InstancedMesh;
  private halo!: THREE.InstancedMesh;
  private slot: number[] = [];
  private wasActive: boolean[] = [];
  private pop: Float32Array = new Float32Array(0);
  private tex: THREE.DataTexture | null = null;
  private readonly dummy = new THREE.Object3D();
  private readonly cOff: THREE.Color;
  private readonly cBig: THREE.Color;
  private readonly cSmall: THREE.Color;
  private readonly tmp = new THREE.Color();
  private meshes: THREE.InstancedMesh[] = [];
  private readonly geos: THREE.BufferGeometry[] = [];
  private readonly mats: THREE.Material[] = [];
  private time = 0;

  constructor(pal: Palette) {
    this.cOff = new THREE.Color(pal.padOff);
    this.cBig = new THREE.Color(pal.padBig);
    this.cSmall = new THREE.Color(pal.padSmall);
  }

  private build(pads: PadState[]): void {
    this.built = true;
    this.count = pads.length;
    let ns = 0;
    let nb = 0;
    for (const p of pads) {
      this.slot.push(p.big ? nb++ : ns++);
      this.wasActive.push(true);
    }
    this.pop = new Float32Array(pads.length);

    // kleine Scheibe: dunkler Sockel, leuchtende Fläche, Ring, Blitz
    const sb = new Batch();
    sb.place(new THREE.CylinderGeometry(1.08, 1.2, 0.12, 28), 0, 0.06, 0, 0, 0, 0, 1, g(0.05));
    sb.place(flatten(new THREE.CircleGeometry(0.8, 28)), 0, 0.126, 0, 0, 0, 0, 1, g(0.7));
    sb.place(flatten(new THREE.RingGeometry(0.88, 1.0, 40)), 0, 0.13, 0, 0, 0, 0, 1, g(1.4));
    const bolt = new THREE.Shape();
    bolt.moveTo(0.12, 0.5); bolt.lineTo(-0.3, -0.05); bolt.lineTo(-0.02, -0.05); bolt.lineTo(-0.12, -0.5);
    bolt.lineTo(0.3, 0.05); bolt.lineTo(0.02, 0.05); bolt.closePath();
    sb.place(flatten(new THREE.ShapeGeometry(bolt)), 0, 0.134, 0, 0, 0, 0, 1, g(0.12));
    const smallGeo = sb.build();
    this.geos.push(smallGeo);
    const smallMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.mats.push(smallMat);

    // große Plattform: Sechseck
    const bb = new Batch();
    bb.place(new THREE.CylinderGeometry(2.45, 2.75, 0.3, 6), 0, 0.15, 0, 0, Math.PI / 6, 0, 0.66, g(0.05));
    bb.place(flatten(new THREE.RingGeometry(1.95, 2.28, 6)), 0, 0.312, 0, 0, 0, Math.PI / 6, 0.66, g(1.4));
    bb.place(flatten(new THREE.CircleGeometry(1.75, 6)), 0, 0.308, 0, 0, 0, Math.PI / 6, 0.66, g(0.3));
    bb.place(flatten(new THREE.RingGeometry(1.2, 1.35, 6)), 0, 0.314, 0, 0, 0, Math.PI / 6, 0.66, g(0.9));
    const bigGeo = bb.build();
    this.geos.push(bigGeo);

    // Kanister
    const cb = new Batch();
    cb.place(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 18), 0, 0, 0, 0, 0, 0, 1, g(0.5));
    cb.place(new THREE.CylinderGeometry(0.585, 0.585, 0.14, 18), 0, 0.45, 0, 0, 0, 0, 1, g(1.5));
    cb.place(new THREE.CylinderGeometry(0.585, 0.585, 0.14, 18), 0, -0.45, 0, 0, 0, 0, 1, g(1.5));
    cb.place(new THREE.CylinderGeometry(0.22, 0.5, 0.3, 18), 0, 0.85, 0, 0, 0, 0, 1, g(0.9));
    cb.place(new THREE.CylinderGeometry(0.5, 0.4, 0.14, 18), 0, -0.77, 0, 0, 0, 0, 1, g(0.3));
    cb.place(new THREE.BoxGeometry(0.2, 0.55, 0.06), 0, 0, 0.545, 0, 0, 0, 1, g(2.2));
    cb.place(new THREE.BoxGeometry(0.2, 0.55, 0.06), 0, 0, -0.545, 0, 0, 0, 1, g(2.2));
    const canGeo = cb.build();
    this.geos.push(canGeo);
    const canMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.mats.push(canMat);

    this.tex = makeGlowTexture();
    const haloGeo = flatten(new THREE.PlaneGeometry(1, 1));
    this.geos.push(haloGeo);
    const haloMat = new THREE.MeshBasicMaterial({
      map: this.tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mats.push(haloMat);

    this.small = new THREE.InstancedMesh(smallGeo, smallMat, Math.max(1, ns));
    this.big = new THREE.InstancedMesh(bigGeo, smallMat, Math.max(1, nb));
    this.can = new THREE.InstancedMesh(canGeo, canMat, Math.max(1, nb));
    this.halo = new THREE.InstancedMesh(haloGeo, haloMat, pads.length);
    this.meshes = [this.small, this.big, this.can, this.halo];
    for (const m of this.meshes) {
      m.frustumCulled = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.setColorAt(0, this.cOff);
      (m.instanceColor as THREE.InstancedBufferAttribute).setUsage(THREE.DynamicDrawUsage);
      this.group.add(m);
    }
    this.small.count = ns;
    this.big.count = nb;
    this.can.count = nb;
    this.halo.renderOrder = 3;
  }

  update(dt: number, state: SimState): void {
    const pads = state.pads;
    if (!this.built || pads.length !== this.count) {
      if (this.built) this.clear();
      if (pads.length === 0) return;
      this.build(pads);
    }
    this.time += dt;
    const t = this.time;
    const d = this.dummy;
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i] as PadState;
      const respawn = p.big ? BIG_PAD_RESPAWN : SMALL_PAD_RESPAWN;
      const prog = p.active ? 1 : Math.min(1, Math.max(0, 1 - p.timer / respawn));
      if (p.active && !this.wasActive[i]) this.pop[i] = 1;
      this.wasActive[i] = p.active;
      this.pop[i] = Math.max(0, (this.pop[i] as number) - dt * 2.2);
      const pop = this.pop[i] as number;
      // Rückkehr: in den letzten Sekunden hebt sich das Feld und lädt sich auf
      const rise = p.active ? 1 : smooth(0.72, 1, prog);
      const charge = p.active ? 1 : smooth(0.55, 1, prog) * 0.55;
      const on = p.big ? this.cBig : this.cSmall;
      const slot = this.slot[i] as number;
      const y = Math.max(0, p.pos[1]);

      this.tmp.copy(this.cOff).lerp(on, charge);
      if (pop > 0) this.tmp.lerp(WHITE, pop * 0.7);
      const body = p.big ? this.big : this.small;
      d.position.set(p.pos[0], y - (1 - rise) * 0.09, p.pos[2]);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, 0.45 + 0.55 * rise, 1);
      d.updateMatrix();
      body.setMatrixAt(slot, d.matrix);
      body.setColorAt(slot, this.tmp);

      if (p.big) {
        const grow = p.active ? 1 + pop * 0.35 : smooth(0.8, 1, prog) * 0.9;
        d.position.set(p.pos[0], y + 1.55 + Math.sin(t * 2.1 + i) * 0.16, p.pos[2]);
        d.rotation.set(0, t * 1.5 + i, 0);
        d.scale.setScalar(Math.max(0.0001, grow));
        d.updateMatrix();
        this.can.setMatrixAt(slot, d.matrix);
        this.tmp.copy(on).multiplyScalar(p.active ? 1 : 0.35 + 0.65 * smooth(0.8, 1, prog));
        if (pop > 0) this.tmp.lerp(WHITE, pop * 0.6);
        this.can.setColorAt(slot, this.tmp);
      }

      // Schein am Boden
      const r = p.big ? 4.4 : 3.0;
      d.position.set(p.pos[0], y + 0.05, p.pos[2]);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(r * (1 + pop * 0.5));
      d.updateMatrix();
      this.halo.setMatrixAt(i, d.matrix);
      const k = p.active ? 0.45 + 0.12 * Math.sin(t * 3 + i * 1.7) + pop * 1.3 : 0.05 + charge * 0.12;
      this.tmp.copy(on).multiplyScalar(k);
      this.halo.setColorAt(i, this.tmp);
    }
    this.small.instanceMatrix.needsUpdate = true;
    this.big.instanceMatrix.needsUpdate = true;
    this.can.instanceMatrix.needsUpdate = true;
    this.halo.instanceMatrix.needsUpdate = true;
    for (let k = 0; k < 4; k++) ((this.meshes[k] as THREE.InstancedMesh).instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;
  }

  private clear(): void {
    for (const m of this.meshes) {
      m.dispose();
      m.removeFromParent();
    }
    this.disposeShared();
    this.slot = [];
    this.wasActive = [];
    this.built = false;
  }

  private disposeShared(): void {
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    this.geos.length = 0;
    this.mats.length = 0;
    this.tex?.dispose();
    this.tex = null;
  }

  dispose(): void {
    if (this.built) this.clear();
    this.group.removeFromParent();
  }
}

const WHITE = new THREE.Color(1, 1, 1);
const g = (v: number): THREE.Color => new THREE.Color(v, v, v);

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
