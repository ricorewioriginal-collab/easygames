import * as THREE from 'three';
import { ARENA } from '@shared/sim/types';
import type { Rng } from '@shared/rng';
import { Batch } from './geometry';
import { attachPointScale, crowdMaterial, glowMaterial, pointsMaterial, sceneryMaterial } from './shaders';
import type { ArenaUniforms } from './shaders';
import type { Palette } from './themes';
import { TEAM_COLORS } from './themes';

const SIDE_ROWS = 10;
const END_ROWS = 8;
const ROW_D = 1.25;
const ROW_H = 0.9;

/** Tribünen rund ums Feld: Stufen, LED-Banden, Publikum (instanziert, Wippen auf der GPU) und blinkende Lichter */
export class StandsView {
  readonly group = new THREE.Group();
  private geos: THREE.BufferGeometry[] = [];
  private mats: THREE.Material[] = [];
  private crowd: THREE.InstancedMesh | null = null;
  /** Anzahl der Personen (für Tests/Berichte) */
  persons = 0;

  constructor(u: ArenaUniforms, pal: Palette, particles: number, rng: Rng) {
    const W = ARENA.halfWidth;
    const L = ARENA.halfLength;
    const D = ARENA.goalDepth;
    const sideZ = L + D + 2; // halbe Länge der Seitentribünen
    const endX = W + 3.5 + SIDE_ROWS * ROW_D + 1;
    const stand = new Batch();
    const leds = new Batch();
    const standCol = new THREE.Color(pal.stand);
    const topCol = new THREE.Color(pal.standTop);
    const lineA = new THREE.Color(pal.lineA);
    const lineB = new THREE.Color(pal.lineB);

    interface Seat {
      x: number;
      y: number;
      z: number;
      end: boolean;
    }
    const seats: Seat[] = [];

    // Seitentribünen
    for (const s of [-1, 1]) {
      for (let k = 0; k < SIDE_ROWS; k++) {
        const x0 = W + 3.5 + k * ROW_D;
        const cx = s * (x0 + ROW_D / 2);
        const top = 1.0 + k * ROW_H;
        stand.box(cx, (top - 1) / 2, 0, ROW_D, top + 1, sideZ * 2, standCol);
        stand.box(cx - s * (ROW_D / 2 - 0.06), top + 0.02, 0, 0.12, 0.05, sideZ * 2, topCol);
        if (k % 3 === 1) {
          leds.box(
            cx - s * (ROW_D / 2 + 0.01),
            top - 0.25,
            0,
            0.05,
            0.12,
            sideZ * 2 - 2,
            k % 2 ? lineA : lineB,
          );
        }
        const nz = Math.floor((sideZ * 2 - 2) / 1.1);
        for (let i = 0; i < nz; i++) {
          seats.push({
            x: cx + rng.float(-0.12, 0.12),
            y: top,
            z: -sideZ + 1 + i * 1.1 + (k % 2) * 0.55 + rng.float(-0.12, 0.12),
            end: false,
          });
        }
      }
      // Rückwand der Tribüne
      stand.box(
        s * (W + 3.5 + SIDE_ROWS * ROW_D + 0.5),
        5.5,
        0,
        1,
        13,
        sideZ * 2 + 12,
        standCol.clone().multiplyScalar(0.7),
      );
      // LED-Bande direkt hinter dem Glas
      for (let z = -sideZ + 3; z < sideZ - 2; z += 6) {
        leds.box(s * (W + 2.6), 0.75, z, 0.12, 1.2, 5.4, ((z + sideZ) / 6) % 2 < 1 ? lineA : lineB);
        stand.box(s * (W + 2.75), 0.45, z, 0.5, 1.2, 5.6, new THREE.Color(0x05060c));
      }
    }
    // Tribünen hinter den Toren
    for (const s of [-1, 1]) {
      for (let k = 0; k < END_ROWS; k++) {
        const z0 = L + D + 3.5 + k * ROW_D;
        const cz = s * (z0 + ROW_D / 2);
        const top = 1.0 + k * ROW_H;
        stand.box(0, (top - 1) / 2, cz, endX * 2, top + 1, ROW_D, standCol);
        stand.box(0, top + 0.02, cz - s * (ROW_D / 2 - 0.06), endX * 2, 0.05, 0.12, topCol);
        if (k % 3 === 1)
          leds.box(
            0,
            top - 0.25,
            cz - s * (ROW_D / 2 + 0.01),
            endX * 2 - 2,
            0.12,
            0.05,
            k % 2 ? lineA : lineB,
          );
        const nx = Math.floor((endX * 2 - 2) / 1.1);
        for (let i = 0; i < nx; i++) {
          seats.push({
            x: -endX + 1 + i * 1.1 + (k % 2) * 0.55 + rng.float(-0.12, 0.12),
            y: top,
            z: cz + rng.float(-0.12, 0.12),
            end: true,
          });
        }
      }
      stand.box(
        0,
        5.5,
        s * (L + D + 3.5 + END_ROWS * ROW_D + 0.5),
        endX * 2 + 6,
        13,
        1,
        standCol.clone().multiplyScalar(0.7),
      );
      // Bande hinter dem Tor
      leds.box(
        0,
        0.75,
        s * (L + 2.6),
        0.12 + 32,
        1.2,
        0.12,
        s < 0 ? new THREE.Color(TEAM_COLORS[0]) : new THREE.Color(TEAM_COLORS[1]),
      );
    }

    const standGeo = stand.build();
    const ledGeo = leds.build();
    this.geos.push(standGeo, ledGeo);
    const standMat = sceneryMaterial(u, pal, 3);
    const ledMat = glowMaterial(u, 0, 1.1);
    this.mats.push(standMat, ledMat);
    this.group.add(new THREE.Mesh(standGeo, standMat), new THREE.Mesh(ledGeo, ledMat));

    // Publikum
    const fill = 0.35 + 0.6 * Math.min(1, Math.max(0, particles));
    const chosen = seats.filter(() => rng.chance(fill));
    this.persons = chosen.length;
    const pb = new Batch();
    pb.box(0, 0.45, 0, 0.46, 0.8, 0.3, new THREE.Color(1, 1, 1), [0, 0]);
    pb.place(
      new THREE.IcosahedronGeometry(0.17, 0),
      0,
      1.02,
      0,
      0,
      0,
      0,
      1,
      new THREE.Color(1, 1, 1),
      [1, 0],
    );
    const personGeo = pb.build();
    this.geos.push(personGeo);
    const crowdMat = crowdMaterial(u, pal);
    this.mats.push(crowdMat);
    const inst = new THREE.InstancedMesh(personGeo, crowdMat, Math.max(1, chosen.length));
    inst.count = chosen.length;
    inst.frustumCulled = false;
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    const t0 = new THREE.Color(TEAM_COLORS[0]);
    const t1 = new THREE.Color(TEAM_COLORS[1]);
    const lights: number[] = [];
    const lightCols: number[] = [];
    const lightSize: number[] = [];
    const lightPhase: number[] = [];
    chosen.forEach((s, i) => {
      d.position.set(s.x, s.y, s.z);
      d.rotation.set(0, rng.float(-0.5, 0.5), 0);
      const h = rng.float(0.92, 1.12);
      d.scale.set(rng.float(0.9, 1.1), h, 1);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
      const teamP = s.end ? 0.55 : 0.2 + 0.5 * Math.min(1, Math.abs(s.z) / sideZ);
      if (rng.chance(teamP)) c.copy(s.z < 0 ? t0 : t1).multiplyScalar(rng.float(0.35, 0.85));
      else c.setHex(rng.pick(pal.shirts)).multiplyScalar(rng.float(0.7, 1.3));
      inst.setColorAt(i, c);
      if (rng.chance(0.13)) {
        lights.push(s.x, s.y + 1.45, s.z);
        const tc = rng.chance(0.55) ? (s.z < 0 ? t0 : t1) : c.setHex(0xffffff);
        lightCols.push(tc.r * 1.4, tc.g * 1.4, tc.b * 1.4);
        lightSize.push(rng.float(0.28, 0.5));
        lightPhase.push(rng.next());
      }
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    this.crowd = inst;
    this.group.add(inst);

    if (lights.length) {
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lights, 3));
      lg.setAttribute('color', new THREE.Float32BufferAttribute(lightCols, 3));
      lg.setAttribute('size', new THREE.Float32BufferAttribute(lightSize, 1));
      lg.setAttribute('phase', new THREE.Float32BufferAttribute(lightPhase, 1));
      this.geos.push(lg);
      const lm = pointsMaterial(u, { blink: true, alpha: 1 });
      this.mats.push(lm);
      const pts = new THREE.Points(lg, lm);
      pts.frustumCulled = false;
      attachPointScale(pts, u);
      this.group.add(pts);
    }
  }

  dispose(): void {
    this.crowd?.dispose();
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    this.group.removeFromParent();
  }
}
