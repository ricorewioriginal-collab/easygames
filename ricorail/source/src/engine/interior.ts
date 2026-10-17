// Wageninneres für den Schaffner-Modus: Boden, Wände mit Fensteröffnungen, Decke mit Licht, Sitze und Fahrgäste.
// Sparsam: nur der Wagen, in dem man gerade steht, und alles als zwei Instanz-Meshes (2 Zeichenaufrufe + Licht + Markierung).
import * as THREE from 'three';
import type { CarInfo, Rider } from '../modes/conductor';

/** Fußbodenhöhe über Schienenoberkante (Fahrzeugsystem) */
export const FLOOR = 1.25;
const CEIL = 3.62, HW = 1.36;

const box = new THREE.BoxGeometry(1, 1, 1);
const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _c = new THREE.Color();

const SKIN = [0xf1c9a5, 0xe0ac84, 0xc68863, 0x8d5a3b, 0x5c3a24];
const HAIR = [0x2b1d14, 0x5a3a22, 0xb08a4a, 0x1a1a1a, 0x8a8a8a, 0xa0522d];
const TOP = [0x2f5d9b, 0xb03a3a, 0x3c7a46, 0xd9a43a, 0x6b4b8a, 0x2a2a2a, 0xe6e6e6, 0x1f7a8c, 0xc96a2b];
const LEG = [0x26324a, 0x3a3a3a, 0x5b4636, 0x1d1d26, 0x6d7a8a];

type Part = [x: number, y: number, z: number, sx: number, sy: number, sz: number, col: number];

export class Interior {
  readonly group = new THREE.Group();
  private mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x262626 });
  private lampMat = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
  /** Decke unbeleuchtet hell (sonst von unten gesehen fast schwarz) */
  private ceilMat = new THREE.MeshBasicMaterial({ color: 0xc9c6bc });
  private ceil: THREE.Mesh | null = null;
  private markMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
  private mark: THREE.Mesh;
  private meshes: THREE.InstancedMesh[] = [];
  private lamp: THREE.Mesh | null = null;
  key = '';

  constructor() {
    this.group.name = 'interior';
    this.mark = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), this.markMat);
    this.mark.visible = false;
    this.group.add(this.mark);
  }

  /** baut den Wagen neu (nur bei Wagenwechsel oder Fahrgastwechsel) */
  build(car: CarInfo, riders: Rider[]) {
    for (const m of this.meshes) { this.group.remove(m); m.dispose(); }
    this.meshes = [];
    if (this.lamp) { this.group.remove(this.lamp); this.lamp = null; }
    if (this.ceil) { this.group.remove(this.ceil); this.ceil = null; }
    const [a, b] = [-car.len / 2 + 0.7, car.len / 2 - (car.cab ? 3.7 : 0.7)];
    const L = b - a, mid = (a + b) / 2;
    const st: Part[] = [];
    const wall = 0xe9e6dc, trim = 0x9aa3ab, seatCol = car.first ? 0x8c2f39 : 0x2e4f86;
    // Boden, Decke, Wände unterhalb und oberhalb der Fenster
    st.push([mid, FLOOR - 0.03, 0, L, 0.06, HW * 2, 0x55595e]);
    st.push([mid, FLOOR, 0, L, 0.012, 0.62, 0x6f6a62]);
    for (const s of [-1, 1]) {
      st.push([mid, (FLOOR + 2.12) / 2, s * HW, L, 2.12 - FLOOR, 0.06, wall]);
      st.push([mid, (3.2 + CEIL) / 2, s * HW, L, CEIL - 3.2, 0.06, wall]);
      st.push([mid, 3.05, s * (HW - 0.25), L, 0.04, 0.42, trim]); // Gepäckablage
      // Fensterpfosten
      for (let x = a + 0.2; x <= b; x += 1.95) st.push([x, 2.66, s * HW, 0.32, 1.1, 0.07, trim]);
    }
    // Stirnwände mit Übergangstür
    for (const x of [a, b]) {
      for (const s of [-1, 1]) st.push([x, (FLOOR + CEIL) / 2, s * (HW + 0.45) / 2, 0.08, CEIL - FLOOR, HW - 0.45, wall]);
      st.push([x, (2.35 + CEIL) / 2, 0, 0.08, CEIL - 2.35, 0.9, wall]);
      st.push([x, (FLOOR + 2.35) / 2, 0, 0.05, 2.35 - FLOOR, 0.86, 0x3b4148]);
    }
    // Sitze: Sitzfläche und Lehne
    for (const s of car.seats) {
      st.push([s.x, FLOOR + 0.44, s.z, 0.5, 0.12, 0.44, seatCol]);
      st.push([s.x - s.face * 0.25, FLOOR + 0.8, s.z, 0.1, 0.7, 0.44, seatCol]);
      st.push([s.x - s.face * 0.25, FLOOR + 1.2, s.z, 0.12, 0.12, 0.44, 0xd8d8d8]);
    }
    // Fahrgäste aus Quadern (sitzend)
    for (const r of riders) {
      if (r.car !== car.idx) continue;
      const s = car.seats[r.seat]; if (!s) continue;
      const f = s.face, k = r.look;
      const skin = SKIN[k % SKIN.length], hair = HAIR[(k >> 3) % HAIR.length], top = TOP[(k >> 6) % TOP.length], leg = LEG[(k >> 10) % LEG.length];
      st.push([s.x - f * 0.1, FLOOR + 0.82, s.z, 0.26, 0.62, 0.38, top]);
      st.push([s.x - f * 0.08, FLOOR + 1.3, s.z, 0.2, 0.25, 0.19, skin]);
      st.push([s.x - f * 0.1, FLOOR + 1.44, s.z, 0.22, 0.07, 0.21, hair]);
      st.push([s.x + f * 0.13, FLOOR + 0.56, s.z, 0.42, 0.14, 0.34, leg]);
      st.push([s.x + f * 0.33, FLOOR + 0.27, s.z, 0.13, 0.48, 0.3, leg]);
    }
    const im = new THREE.InstancedMesh(box, this.mat, st.length);
    st.forEach((p, i) => {
      im.setMatrixAt(i, _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(p[3], p[4], p[5])));
      im.setColorAt(i, _c.setHex(p[6]));
    });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.frustumCulled = false;
    this.meshes.push(im); this.group.add(im);
    this.lamp = new THREE.Mesh(box, this.lampMat);
    this.lamp.position.set(mid, CEIL - 0.04, 0); this.lamp.scale.set(L - 0.6, 0.03, 0.22);
    this.group.add(this.lamp);
    this.ceil = new THREE.Mesh(box, this.ceilMat);
    this.ceil.position.set(mid, CEIL, 0); this.ceil.scale.set(L, 0.05, HW * 2);
    this.group.add(this.ceil);
  }

  /** Markierung über dem nächsten Fahrgast ohne Kontrolle */
  marker(car: CarInfo | null, r: Rider | null, time: number) {
    if (!car || !r) { this.mark.visible = false; return; }
    const s = car.seats[r.seat];
    this.mark.visible = true;
    this.mark.position.set(s.x - s.face * 0.08, FLOOR + 1.75 + Math.sin(time * 4) * 0.04, s.z);
    this.mark.rotation.y = time * 2;
  }

  dispose() {
    for (const m of this.meshes) m.dispose();
    this.meshes = [];
    this.group.removeFromParent();
    this.mat.dispose(); this.lampMat.dispose(); this.ceilMat.dispose(); this.markMat.dispose(); this.mark.geometry.dispose();
  }
}
