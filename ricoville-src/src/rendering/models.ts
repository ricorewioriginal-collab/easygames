// Prozedurale Low-Poly-Modelle im Miniatur-Diorama-Stil. Jedes Gebäude wird zu EINER Geometrie mit
// Vertexfarben zusammengefügt → wenige Draw-Calls, keine externen Modelldateien, ein gemeinsames Material.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { BuildingDef, ModelSpec } from '../core/types';

const tmpColor = new THREE.Color();

export class Parts {
  private list: THREE.BufferGeometry[] = [];
  add(geo: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0): this {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute('uv');
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(name)) g.deleteAttribute(name);
    g.clearGroups();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    // Bereits eingefärbte Teilgeometrien (verschachtelte Parts) behalten ihre Farben.
    if (!g.getAttribute('color')) {
      tmpColor.set(color);
      const n = g.getAttribute('position').count;
      const cols = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        cols[i * 3] = tmpColor.r;
        cols[i * 3 + 1] = tmpColor.g;
        cols[i * 3 + 2] = tmpColor.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    }
    this.list.push(g);
    geo.dispose();
    return this;
  }
  box(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0, ry = 0): this {
    return this.add(new THREE.BoxGeometry(w, h, d), color, x, y + h / 2, z, ry);
  }
  cyl(rt: number, rb: number, h: number, color: string, x = 0, y = 0, z = 0, seg = 8): this {
    return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y + h / 2, z);
  }
  cone(r: number, h: number, color: string, x = 0, y = 0, z = 0, seg = 8, ry = 0): this {
    return this.add(new THREE.ConeGeometry(r, h, seg), color, x, y + h / 2, z, ry);
  }
  ball(r: number, color: string, x = 0, y = 0, z = 0, seg = 7): this {
    return this.add(new THREE.IcosahedronGeometry(r, seg > 6 ? 1 : 0), color, x, y, z);
  }
  /** Satteldach: Prisma über w×d, First entlang x. */
  gable(w: number, d: number, h: number, color: string, x = 0, y = 0, z = 0, ry = 0): this {
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0);
    s.lineTo(d / 2, 0);
    s.lineTo(0, h);
    s.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    g.translate(0, 0, -w / 2);
    g.rotateY(Math.PI / 2);
    return this.add(g, color, x, y, z, ry);
  }
  hip(w: number, d: number, h: number, color: string, x = 0, y = 0, z = 0): this {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(w, h, d);
    g.translate(0, h / 2, 0);
    return this.add(g, color, x, y, z);
  }
  dome(r: number, color: string, x = 0, y = 0, z = 0): this {
    return this.add(new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), color, x, y, z);
  }
  /** Fensterreihen auf allen vier Seiten eines Quaders. */
  windows(w: number, d: number, y0: number, floors: number, fh: number, color = '#3a5674', frame?: string): this {
    for (let f = 0; f < floors; f++) {
      const y = y0 + f * fh + fh * 0.35;
      const nx = Math.max(1, Math.floor(w / 0.42));
      const nz = Math.max(1, Math.floor(d / 0.42));
      for (let i = 0; i < nx; i++) {
        const x = -w / 2 + (i + 0.5) * (w / nx);
        this.box(0.2, fh * 0.42, 0.03, color, x, y, d / 2 + 0.005);
        this.box(0.2, fh * 0.42, 0.03, color, x, y, -d / 2 - 0.005);
        if (frame) this.box(0.26, 0.03, 0.05, frame, x, y - 0.02, d / 2 + 0.01);
      }
      for (let i = 0; i < nz; i++) {
        const z = -d / 2 + (i + 0.5) * (d / nz);
        this.box(0.03, fh * 0.42, 0.2, color, w / 2 + 0.005, y, z);
        this.box(0.03, fh * 0.42, 0.2, color, -w / 2 - 0.005, y, z);
      }
    }
    return this;
  }
  build(): THREE.BufferGeometry {
    const g = mergeGeometries(this.list, false)!;
    for (const p of this.list) p.dispose();
    this.list = [];
    g.computeBoundingSphere();
    return g;
  }
}

const shade = (hex: string, f: number): string => {
  const c = new THREE.Color(hex);
  if (f < 1) c.multiplyScalar(f);
  else c.lerp(new THREE.Color('#ffffff'), f - 1);
  return '#' + c.getHexString();
};

function roof(p: Parts, m: ModelSpec, w: number, d: number, y: number): number {
  const rc = m.roofColor ?? '#9c3d2c';
  switch (m.roof) {
    case 'gable':
      p.gable(w + 0.12, d + 0.12, Math.min(w, d) * 0.45, rc, 0, y, 0);
      return y + Math.min(w, d) * 0.45;
    case 'hip':
      p.hip(w + 0.14, d + 0.14, Math.min(w, d) * 0.4, rc, 0, y, 0);
      return y + Math.min(w, d) * 0.4;
    case 'dome':
      p.box(w + 0.06, 0.08, d + 0.06, shade(rc, 0.8), 0, y, 0);
      p.dome(Math.min(w, d) * 0.32, rc, 0, y + 0.08, 0);
      return y + Math.min(w, d) * 0.4;
    case 'shed':
      p.add(new THREE.BoxGeometry(w + 0.12, 0.08, d + 0.2), rc, 0, y + 0.18, 0, 0, 0.18);
      return y + 0.3;
    case 'flat':
      p.box(w + 0.04, 0.08, d + 0.04, rc, 0, y, 0);
      p.box(w * 0.3, 0.18, d * 0.25, shade(rc, 0.8), w * 0.15, y + 0.08, -d * 0.15);
      return y + 0.26;
    default:
      return y;
  }
}

function lot(p: Parts, w: number, d: number, color = '#cfc6b4'): void {
  p.box(w - 0.06, 0.04, d - 0.06, color, 0, 0, 0);
}

function house(p: Parts, m: ModelSpec, W: number, D: number): void {
  const v = m.variant ?? 0;
  lot(p, W, D, '#a9cf7b');
  const floors = m.floors ?? 1;
  const fh = 0.42;
  const w = W * 0.62;
  const d = D * 0.55;
  const z0 = -D * 0.06;
  p.box(w + 0.08, 0.08, d + 0.08, '#b9b1a3', 0, 0.04, z0);
  const g = new Parts();
  g.box(w, floors * fh, d, m.color ?? '#eee', 0, 0.12, 0).windows(w, d, 0.12, floors, fh, '#4f7aa3', '#ffffff');
  if (m.accent) for (let f = 0; f < floors; f++) g.box(w + 0.02, 0.04, d + 0.02, m.accent, 0, 0.12 + f * fh, 0);
  // Tür
  g.box(0.2, 0.3, 0.04, shade(m.roofColor ?? '#7a4f2e', 0.7), 0, 0.12, d / 2 + 0.01);
  const top = roof(g, m, w, d, 0.12 + floors * fh);
  if (v % 3 === 1) g.box(0.12, 0.3, 0.12, '#8d6e63', w * 0.25, top - 0.25, -d * 0.2); // Schornstein
  p.add(g.build(), '#ffffff', 0, 0, z0);
  // Garten: Zaun, Busch, Weg
  p.box(0.22, 0.02, D * 0.42, '#d7ccb8', 0, 0.04, D * 0.27);
  p.ball(0.16, '#4f9a3a', -W * 0.36, 0.18, D * 0.3);
  if (v % 2) p.ball(0.12, '#e57393', W * 0.36, 0.14, D * 0.32);
  else p.box(0.24, 0.12, 0.24, '#7cb342', W * 0.36, 0.04, D * 0.32);
  if (v % 4 === 3) p.box(W * 0.9, 0.12, 0.04, '#ffffff', 0, 0.04, D / 2 - 0.08);
}

function tower(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#c9c3b6');
  const floors = m.floors ?? 4;
  const fh = 0.38;
  const w = W * 0.7;
  const d = D * 0.7;
  p.box(w, 0.3, d, shade(m.color ?? '#ddd', 0.85), 0, 0.04, 0);
  p.box(w * 0.94, floors * fh, d * 0.94, m.color ?? '#ddd', 0, 0.34, 0);
  p.windows(w * 0.94, d * 0.94, 0.34, floors, fh, (m.variant ?? 0) % 2 ? '#9fc6e4' : '#4a6a8c');
  if (floors >= 7) for (let f = 2; f < floors; f += 3) p.box(w * 0.98, 0.05, d * 0.98, shade(m.color ?? '#ddd', 0.8), 0, 0.34 + f * fh, 0);
  roof(p, m, w * 0.94, d * 0.94, 0.34 + floors * fh);
  if (floors >= 9) p.cyl(0.02, 0.02, 0.5, '#888888', w * 0.2, 0.6 + floors * fh, 0);
  p.ball(0.18, '#5aa83f', -W * 0.42, 0.2, D * 0.42);
}

function villa(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#9ccc65');
  const fh = 0.44;
  const fl = m.floors ?? 2;
  p.box(W * 0.5, fl * fh, D * 0.4, m.color ?? '#fff', -W * 0.08, 0.04, -D * 0.1).windows(W * 0.5, D * 0.4, 0.04, fl, fh, '#4f7aa3');
  roof(p, m, W * 0.5, D * 0.4, 0.04 + fl * fh);
  p.box(W * 0.28, fh, D * 0.3, m.color ?? '#fff', W * 0.28, 0.04, D * 0.05).windows(W * 0.28, D * 0.3, 0.04, 1, fh, '#4f7aa3');
  p.box(W * 0.3, 0.06, D * 0.32, m.roofColor ?? '#777', W * 0.28, 0.04 + fh, D * 0.05);
  p.box(W * 0.3, 0.04, D * 0.18, '#4fc3f7', -W * 0.15, 0.05, D * 0.32); // Pool
  for (const s of [-1, 1]) p.cone(0.14, 0.7, '#2f6b3a', s * W * 0.42, 0.04, -D * 0.4, 6);
}

function signBoard(p: Parts, color: string, w: number, y: number, z: number): void {
  p.box(w, 0.2, 0.05, color, 0, y, z);
  p.box(w + 0.06, 0.03, 0.07, shade(color, 0.7), 0, y - 0.02, z);
}

function shop(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#d9d2c3');
  const fl = m.floors ?? 1;
  const w = W * 0.8;
  const d = D * 0.62;
  const z0 = -D * 0.08;
  const g = new Parts();
  g.box(w, 0.5 + (fl - 1) * 0.4, d, m.color ?? '#eee', 0, 0.04, 0);
  g.box(w * 0.8, 0.28, 0.03, '#bfe3f5', 0, 0.1, d / 2 + 0.005); // Schaufenster
  if (fl > 1) g.windows(w, d, 0.54, fl - 1, 0.4, '#4f7aa3');
  // Markise mit Streifen
  const stripes = Math.max(4, Math.round(w / 0.16));
  for (let i = 0; i < stripes; i++) {
    const col = i % 2 ? '#ffffff' : (m.accent ?? '#e56b2f');
    g.add(new THREE.BoxGeometry(w / stripes, 0.03, 0.3), col, -w / 2 + (i + 0.5) * (w / stripes), 0.46, d / 2 + 0.13, 0, 0.45);
  }
  const top = 0.54 + (fl - 1) * 0.4;
  signBoard(g, m.accent ?? '#e56b2f', w * 0.7, top, d / 2 - 0.02);
  roof(g, { ...m, roof: m.roof === 'gable' && W <= 2 ? 'gable' : 'flat' }, w, d, top);
  p.add(g.build(), '#fff', 0, 0, z0);
  p.box(0.3, 0.2, 0.2, '#8d6e63', W * 0.35, 0.04, D * 0.38); // Kisten vor der Tür
  p.box(0.18, 0.14, 0.18, '#a1887f', W * 0.35, 0.24, D * 0.38);
  p.cyl(0.08, 0.08, 0.02, '#ffffff', -W * 0.3, 0.04, D * 0.36);
  p.cyl(0.015, 0.015, 0.2, '#555', -W * 0.3, 0.04, D * 0.36);
}

function civic(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#d4cbb8');
  const fl = m.floors ?? 2;
  const fh = 0.45;
  const w = W * 0.72;
  const d = D * 0.55;
  const z0 = -D * 0.1;
  const g = new Parts();
  g.box(w + 0.1, 0.12, d + 0.1, '#bdb3a2', 0, 0.04, 0);
  g.box(w, fl * fh, d, m.color ?? '#eee', 0, 0.16, 0).windows(w, d, 0.16, fl, fh, '#4f7aa3', '#ffffff');
  // Säulenportal
  for (let i = 0; i < 4; i++) g.cyl(0.05, 0.05, fl * fh * 0.7, '#ffffff', -w * 0.25 + i * (w * 0.5) / 3, 0.16, d / 2 + 0.18, 6);
  g.box(w * 0.65, 0.1, 0.35, shade(m.color ?? '#eee', 1.2), 0, 0.16 + fl * fh * 0.7, d / 2 + 0.12);
  g.gable(w * 0.65, 0.4, 0.18, m.roofColor ?? '#888', 0, 0.26 + fl * fh * 0.7, d / 2 + 0.12, Math.PI / 2);
  roof(g, m, w, d, 0.16 + fl * fh);
  g.box(0.3, 0.06, 0.6, '#cfc6b4', 0, 0.04, d / 2 + 0.5);
  p.add(g.build(), '#fff', 0, 0, z0);
  p.cyl(0.02, 0.02, 1.0, '#9e9e9e', W * 0.38, 0.04, D * 0.38);
  p.box(0.25, 0.14, 0.02, m.roofColor ?? '#c33', W * 0.38 + 0.13, 0.86, D * 0.38);
  for (const s of [-1, 1]) p.ball(0.2, '#4f9a3a', s * W * 0.4, 0.22, D * 0.1);
}

function plaza(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, m.color ?? '#d9c7a7');
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 1 : -1) * W * 0.28;
    const z = (i < 2 ? 1 : -1) * D * 0.28;
    p.box(0.5, 0.3, 0.4, '#a1887f', x, 0.04, z);
    p.add(new THREE.ConeGeometry(0.45, 0.25, 4), i % 2 ? (m.accent ?? '#e85d3f') : '#ffffff', x, 0.47, z, Math.PI / 4);
    p.box(0.1, 0.1, 0.1, ['#e53935', '#fdd835', '#43a047', '#fb8c00'][i]!, x + 0.1, 0.34, z + 0.1);
  }
  p.cyl(0.35, 0.4, 0.15, '#cfd8dc', 0, 0.04, 0, 12);
  p.cyl(0.05, 0.05, 0.6, '#b0bec5', 0, 0.19, 0, 6);
  p.ball(0.12, '#81d4fa', 0, 0.82, 0);
}

function stage(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#7cb342');
  p.box(W * 0.7, 0.3, D * 0.4, m.color ?? '#333', 0, 0.04, -D * 0.2);
  p.box(W * 0.75, 0.06, D * 0.45, m.accent ?? '#fc0', 0, 1.2, -D * 0.2);
  for (const s of [-1, 1]) {
    p.box(0.08, 0.9, 0.08, '#555', s * W * 0.36, 0.34, -D * 0.02);
    p.box(0.08, 0.9, 0.08, '#555', s * W * 0.36, 0.34, -D * 0.38);
    p.box(0.25, 0.4, 0.2, '#222', s * W * 0.3, 0.34, -D * 0.05);
  }
  for (let i = 0; i < 3; i++) p.box(W * 0.7, 0.08, 0.15, '#a1887f', 0, 0.04, D * 0.1 + i * 0.3);
}

function greenhouse(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#9ccc65');
  p.box(W * 0.6, 0.6, D * 0.45, m.color ?? '#bfe8d8', 0, 0.04, -D * 0.1);
  p.dome(W * 0.28, shade(m.color ?? '#bfe8d8', 1.15), 0, 0.64, -D * 0.1);
  for (let i = -2; i <= 2; i++) p.box(0.03, 0.62, D * 0.46, m.accent ?? '#3c8d5a', i * W * 0.12, 0.04, -D * 0.1);
  for (let i = 0; i < 6; i++) p.ball(0.18, ['#e57373', '#ffd54f', '#81c784', '#ba68c8'][i % 4]!, -W * 0.35 + i * W * 0.14, 0.15, D * 0.35);
}

function zoo(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#8bc34a');
  for (const [x, z, c] of [
    [-0.25, -0.25, '#cdbb8e'],
    [0.25, -0.25, '#7cb342'],
    [-0.25, 0.25, '#4fc3f7'],
  ] as [number, number, string][]) {
    p.box(W * 0.42, 0.04, D * 0.42, c, x * W, 0.04, z * D);
    for (let i = 0; i < 4; i++) p.box(W * 0.42, 0.18, 0.03, '#795548', x * W, 0.04, z * D + (i < 2 ? -1 : 1) * D * 0.21);
  }
  // Giraffe, Elefant, Pinguine (stilisiert)
  p.box(0.15, 0.25, 0.3, '#f6c445', -W * 0.25, 0.1, -D * 0.25).box(0.06, 0.5, 0.06, '#f6c445', -W * 0.25, 0.3, -D * 0.33);
  p.box(0.35, 0.3, 0.45, '#9e9e9e', W * 0.25, 0.1, -D * 0.25).ball(0.14, '#9e9e9e', W * 0.25, 0.45, -D * 0.05);
  for (let i = 0; i < 3; i++) p.cone(0.06, 0.2, '#263238', -W * 0.3 + i * 0.15, 0.08, D * 0.25, 6);
  p.box(0.6, 0.5, 0.4, m.accent ?? '#6d8f3a', W * 0.25, 0.04, D * 0.25);
  p.gable(0.7, 0.5, 0.25, '#795548', W * 0.25, 0.54, D * 0.25);
}

function stadium(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#bdbdbd');
  p.cyl(W * 0.47, W * 0.47, 0.7, m.color ?? '#ddd', 0, 0.04, 0, 20);
  p.cyl(W * 0.36, W * 0.36, 0.06, '#43a047', 0, 0.72, 0, 20);
  p.box(W * 0.3, 0.02, 0.02, '#ffffff', 0, 0.79, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    p.cyl(0.03, 0.03, 1.2, '#9e9e9e', Math.cos(a) * W * 0.45, 0.04, Math.sin(a) * D * 0.45, 5);
    p.box(0.2, 0.12, 0.05, '#fff59d', Math.cos(a) * W * 0.45, 1.24, Math.sin(a) * D * 0.45);
  }
  p.cyl(W * 0.48, W * 0.48, 0.08, m.accent ?? '#2e86de', 0, 0.7, 0, 20);
}

function funpark(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, m.color ?? '#9fd27a');
  // Achterbahn-Pfeiler mit Schiene
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const h = 0.5 + Math.sin(a * 2) * 0.35 + 0.4;
    p.cyl(0.025, 0.025, h, '#eeeeee', Math.cos(a) * W * 0.34, 0.04, Math.sin(a) * D * 0.34, 5);
    p.box(0.42, 0.04, 0.12, m.accent ?? '#ff5a7a', Math.cos(a) * W * 0.34, 0.04 + h, Math.sin(a) * D * 0.34, -a);
  }
  p.cone(0.4, 0.5, '#ffd54f', 0, 0.04, 0, 8);
  p.cyl(0.42, 0.42, 0.25, '#4fc3f7', 0, 0.04, 0, 8);
  p.ball(0.12, '#e53935', 0, 0.62, 0);
}

function lighthouse(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#d7c79e');
  for (let i = 0; i < 5; i++) p.cyl(0.36 - i * 0.04, 0.4 - i * 0.04, 0.4, i % 2 ? (m.accent ?? '#d33') : (m.color ?? '#fff'), 0, 0.04 + i * 0.4, 0, 10);
  p.cyl(0.24, 0.24, 0.3, '#fff59d', 0, 2.04, 0, 8);
  p.cone(0.3, 0.3, m.accent ?? '#d33', 0, 2.34, 0, 8);
  p.box(0.5, 0.3, 0.4, '#ffffff', W * 0.25, 0.04, D * 0.25);
}

function wheel(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#cfc6b4');
  const r = W * 0.42;
  const cy = r + 0.3;
  const ring = new THREE.TorusGeometry(r, 0.04, 6, 24);
  p.add(ring, m.color ?? '#fff', 0, cy, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    p.add(new THREE.BoxGeometry(0.03, r * 2, 0.03), '#e0e0e0', 0, cy, 0, 0, 0, a);
    p.box(0.2, 0.2, 0.2, ['#ff6b9d', '#4fc3f7', '#ffd54f', '#81c784'][i % 4]!, Math.cos(a) * r, cy + Math.sin(a) * r - 0.1, 0);
  }
  for (const s of [-1, 1]) p.add(new THREE.BoxGeometry(0.06, cy * 1.1, 0.06), '#bdbdbd', s * 0.3, cy / 2, 0.15, 0, 0, s * 0.3);
}

function clocktower(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#cfc6b4');
  p.box(W * 0.45, 2.2, D * 0.45, m.color ?? '#e6d3b3', 0, 0.04, 0);
  for (const [x, z, r] of [[0, D * 0.23, 0], [0, -D * 0.23, 0], [W * 0.23, 0, Math.PI / 2], [-W * 0.23, 0, Math.PI / 2]] as number[][])
    p.add(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16), '#ffffff', x!, 1.8, z!, r!, Math.PI / 2);
  p.hip(W * 0.55, D * 0.55, 0.7, m.accent ?? '#2f4f6f', 0, 2.24, 0);
}

function plot(p: Parts, m: ModelSpec, W: number, D: number): void {
  p.box(W - 0.08, 0.06, D - 0.08, '#7a5534', 0, 0, 0);
  for (let i = 0; i < 4; i++) p.box(W - 0.2, 0.05, 0.12, '#5d3f27', 0, 0.06, -D / 2 + 0.3 + i * ((D - 0.6) / 3));
  if (m.variant === 1) {
    for (const s of [-1, 1]) p.box(0.04, 0.6, D - 0.1, '#e0f2f1', s * (W / 2 - 0.05), 0.06, 0);
    p.gable(D - 0.1, W - 0.05, 0.3, '#b2ebf2', 0, 0.66, 0, Math.PI / 2);
  } else for (const s of [-1, 1]) p.box(W - 0.06, 0.08, 0.04, '#a1887f', 0, 0.02, s * (D / 2 - 0.03));
}

function mill(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#a5d6a7');
  p.cyl(0.38, 0.5, 1.2, m.color ?? '#f1e3c6', 0, 0.04, 0, 8);
  p.cone(0.48, 0.45, m.accent ?? '#8e5b3a', 0, 1.24, 0, 8);
  p.box(0.2, 0.3, 0.05, '#6d4c41', 0, 0.04, 0.48);
  p.box(0.6, 0.35, 0.4, '#d7ccc8', W * 0.28, 0.04, D * 0.25);
}

function factory(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#c8c0b0');
  p.box(W * 0.7, 0.6, D * 0.5, m.color ?? '#ddd', 0, 0.04, -D * 0.08).windows(W * 0.7, D * 0.5, 0.04, 1, 0.6, '#5b7c99');
  for (let i = 0; i < 3; i++) p.gable(D * 0.5, W * 0.7 / 3, 0.25, m.accent ?? '#888', -W * 0.7 / 3 + i * (W * 0.7 / 3), 0.64, -D * 0.08, Math.PI / 2);
  p.cyl(0.1, 0.13, 1.2, '#8d6e63', W * 0.3, 0.04, -D * 0.3, 8);
  p.box(0.5, 0.3, 0.3, '#a1887f', -W * 0.25, 0.04, D * 0.32);
  p.box(0.3, 0.2, 0.3, '#bcaaa4', W * 0.2, 0.04, D * 0.35);
  signBoard(p, m.accent ?? '#888', W * 0.4, 0.4, D * 0.18 + 0.02);
}

function barn(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#a5d6a7');
  p.box(W * 0.7, 0.75, D * 0.6, m.color ?? '#b8322a', 0, 0.04, -D * 0.05);
  p.gable(D * 0.66, W * 0.76, 0.45, '#5d4037', 0, 0.79, -D * 0.05, Math.PI / 2);
  p.box(0.4, 0.5, 0.03, m.accent ?? '#fff', 0, 0.04, D * 0.25 + 0.01);
  p.add(new THREE.BoxGeometry(0.55, 0.04, 0.035), m.accent ?? '#fff', 0, 0.3, D * 0.25 + 0.02, 0, 0, 0.7);
  p.add(new THREE.BoxGeometry(0.55, 0.04, 0.035), m.accent ?? '#fff', 0, 0.3, D * 0.25 + 0.02, 0, 0, -0.7);
  p.cyl(0.18, 0.18, 0.2, '#e8c25a', W * 0.36, 0.04, D * 0.35, 8);
}

function silo(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#a5d6a7');
  for (const s of [-1, 1]) {
    p.cyl(0.3, 0.3, 1.4, m.color ?? '#ddd', s * 0.33, 0.04, 0, 12);
    p.dome(0.3, m.accent ?? '#888', s * 0.33, 1.44, 0);
  }
}

function station(p: Parts, m: ModelSpec, W: number, D: number): void {
  lot(p, W, D, '#bdb6a8');
  p.box(W * 0.5, 0.7, D * 0.4, m.color ?? '#e8d6b8', 0, 0.04, -D * 0.15).windows(W * 0.5, D * 0.4, 0.04, 1, 0.7, '#5b7c99');
  p.hip(W * 0.55, D * 0.45, 0.35, m.accent ?? '#8b3a2f', 0, 0.74, -D * 0.15);
  p.box(0.3, 0.45, 0.3, m.color ?? '#e8d6b8', 0, 1.0, -D * 0.15);
  p.cone(0.22, 0.3, m.accent ?? '#8b3a2f', 0, 1.45, -D * 0.15, 4, Math.PI / 4);
  // Bahnsteig mit Dach und Gleis
  p.box(W * 0.92, 0.12, D * 0.22, '#cfc6b4', 0, 0.04, D * 0.22);
  for (let i = -3; i <= 3; i++) p.cyl(0.03, 0.03, 0.5, '#5d4037', i * W * 0.13, 0.16, D * 0.22, 5);
  p.box(W * 0.94, 0.05, D * 0.26, '#8b3a2f', 0, 0.66, D * 0.22);
  for (const s of [-1, 1]) p.box(W - 0.02, 0.04, 0.04, '#9e9e9e', 0, 0.04, D * 0.4 + s * 0.08);
}

function harbor(p: Parts, m: ModelSpec, W: number, D: number): void {
  p.box(W - 0.04, 0.2, D - 0.04, '#9e8f78', 0, 0, 0);
  for (let i = 0; i < 6; i++) p.box(0.12, 0.14, D * 0.9, '#6d4c41', -W / 2 + 0.1 + i * 0.6, 0.2, 0);
  p.box(W * 0.35, 0.6, D * 0.35, m.color ?? '#c9b79c', W * 0.25, 0.2, -D * 0.2);
  p.gable(W * 0.35, D * 0.35, 0.25, m.accent ?? '#1f6f9f', W * 0.25, 0.8, -D * 0.2);
  // Kran und Container
  p.box(0.1, 1.5, 0.1, '#f9a825', -W * 0.2, 0.2, -D * 0.2);
  p.box(1.0, 0.08, 0.08, '#f9a825', -W * 0.2 - 0.3, 1.7, -D * 0.2);
  const cc = ['#e53935', '#1e88e5', '#43a047', '#fb8c00'];
  for (let i = 0; i < 4; i++) p.box(0.5, 0.25, 0.25, cc[i]!, -W * 0.1 + (i % 2) * 0.55, 0.2 + Math.floor(i / 2) * 0.25, D * 0.25);
}

function airport(p: Parts, m: ModelSpec, W: number, D: number): void {
  p.box(W - 0.04, 0.04, D - 0.04, '#9e9e9e', 0, 0, 0);
  p.box(W * 0.95, 0.02, D * 0.22, '#424242', 0, 0.04, D * 0.28);
  for (let i = 0; i < 8; i++) p.box(0.3, 0.01, 0.04, '#ffffff', -W * 0.42 + i * W * 0.12, 0.065, D * 0.28);
  p.box(W * 0.5, 0.5, D * 0.3, m.color ?? '#e4e8ec', -W * 0.15, 0.04, -D * 0.22);
  p.box(W * 0.5, 0.2, 0.03, '#90caf9', -W * 0.15, 0.2, -D * 0.07);
  p.add(new THREE.CylinderGeometry(D * 0.15, D * 0.15, W * 0.5, 12, 1, false, 0, Math.PI), m.accent ?? '#2e86de', -W * 0.15, 0.54, -D * 0.22, 0, 0, Math.PI / 2);
  p.cyl(0.12, 0.15, 1.4, '#cfd8dc', W * 0.35, 0.04, -D * 0.25, 8);
  p.cyl(0.28, 0.22, 0.3, '#90caf9', W * 0.35, 1.44, -D * 0.25, 8);
}

// ---------------------------------------------------------------- Deko
function tree(p: Parts, m: ModelSpec): void {
  const v = m.variant ?? 0;
  const c = m.color ?? '#4f9a3a';
  if (v === 2 || v === 7) {
    p.cyl(0.04, 0.05, 0.2, '#6d4c41', 0, 0, 0, 5);
    if (v === 7) p.cone(0.14, 0.9, c, 0, 0.15, 0, 7);
    else for (let i = 0; i < 3; i++) p.cone(0.32 - i * 0.07, 0.4, shade(c, 1 - i * 0.05), 0, 0.15 + i * 0.22, 0, 7);
    return;
  }
  if (v === 5) {
    p.add(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 5), '#a1887f', 0.05, 0.45, 0, 0, 0, -0.12);
    for (let i = 0; i < 6; i++) p.add(new THREE.BoxGeometry(0.42, 0.03, 0.12), c, 0.1 + Math.cos((i / 6) * 6.28) * 0.18, 0.88, Math.sin((i / 6) * 6.28) * 0.18, -(i / 6) * 6.28, 0, -0.4);
    return;
  }
  p.cyl(0.04, 0.06, 0.35, v === 1 ? '#f5f5f5' : '#6d4c41', 0, 0, 0, 5);
  p.ball(0.3, c, 0, 0.55, 0);
  p.ball(0.2, shade(c, 1.12), 0.12, 0.7, 0.06);
  if (v === 4) for (let i = 0; i < 5; i++) p.ball(0.04, '#e53935', Math.cos(i) * 0.25, 0.5 + (i % 2) * 0.15, Math.sin(i) * 0.25, 3);
}

function decoModel(p: Parts, m: ModelSpec, W: number, D: number): void {
  const c = m.color ?? '#888';
  switch (m.kind) {
    case 'tree':
      return tree(p, m);
    case 'flowers':
      p.box(0.8, 0.08, 0.8, '#6d4c41', 0, 0, 0);
      for (let i = 0; i < 9; i++) p.ball(0.08, i % 3 === 1 ? '#7cb342' : c, -0.25 + (i % 3) * 0.25, 0.14, -0.25 + Math.floor(i / 3) * 0.25, 3);
      return;
    case 'planter':
      p.cyl(0.22, 0.16, 0.25, '#bcaaa4', 0, 0, 0, 8);
      p.ball(0.2, '#66bb6a', 0, 0.32, 0);
      for (let i = 0; i < 4; i++) p.ball(0.06, c, Math.cos(i * 1.6) * 0.15, 0.38, Math.sin(i * 1.6) * 0.15, 3);
      return;
    case 'hedge':
      p.box(0.9, 0.35, 0.35, c, 0, 0, 0);
      return;
    case 'topiary':
      p.cyl(0.12, 0.1, 0.12, '#a1887f', 0, 0, 0, 6);
      p.ball(0.26, c, 0, 0.36, 0);
      return;
    case 'bench':
      p.box(0.7, 0.04, 0.22, c, 0, 0.18, 0).box(0.7, 0.2, 0.04, c, 0, 0.22, -0.1);
      for (const s of [-1, 1]) p.box(0.04, 0.18, 0.2, '#424242', s * 0.3, 0, 0);
      return;
    case 'lamp':
      p.cyl(0.025, 0.035, 0.9, c, 0, 0, 0, 6);
      p.box(m.variant ? 0.14 : 0.3, 0.06, 0.12, c, m.variant ? 0 : 0.1, 0.9, 0);
      p.ball(0.06, '#fff59d', m.variant ? 0 : 0.18, 0.86, 0, 3);
      return;
    case 'fence':
      for (let i = -2; i <= 2; i++) p.box(0.05, 0.3, 0.05, c, i * 0.2, 0, 0);
      p.box(0.9, 0.04, 0.03, c, 0, 0.12, 0).box(0.9, 0.04, 0.03, c, 0, 0.24, 0);
      return;
    case 'fountain': {
      const r = m.variant ? 0.8 : 0.38;
      p.cyl(r, r + 0.05, 0.15, c, 0, 0, 0, 12);
      p.cyl(r - 0.06, r - 0.06, 0.02, '#4fc3f7', 0, 0.14, 0, 12);
      p.cyl(0.06, 0.08, 0.45, c, 0, 0.15, 0, 6);
      p.cyl(r * 0.4, r * 0.25, 0.06, c, 0, 0.55, 0, 10);
      p.ball(0.08, '#b3e5fc', 0, 0.7, 0);
      return;
    }
    case 'statue':
      p.box(0.4, 0.3, 0.4, '#bdbdbd', 0, 0, 0);
      p.cyl(0.08, 0.12, 0.45, c, 0, 0.3, 0, 6).ball(0.09, c, 0, 0.84, 0);
      p.add(new THREE.BoxGeometry(0.05, 0.3, 0.05), c, 0.12, 0.75, 0, 0, 0, -0.6);
      return;
    case 'sculpture':
      p.box(0.4, 0.12, 0.4, '#e0e0e0', 0, 0, 0);
      p.add(new THREE.TorusKnotGeometry(0.16, 0.05, 32, 5), c, 0, 0.45, 0);
      return;
    case 'obelisk':
      p.box(0.4, 0.15, 0.4, '#bcaaa4', 0, 0, 0).box(0.2, 1.1, 0.2, c, 0, 0.15, 0);
      p.cone(0.15, 0.2, c, 0, 1.25, 0, 4, Math.PI / 4);
      return;
    case 'playground':
      p.box(W - 0.1, 0.03, D - 0.1, '#f6d58e', 0, 0, 0);
      for (const [x, z] of [[-0.4, -0.4], [0.2, -0.4], [-0.4, 0.2], [0.2, 0.2]]) p.cyl(0.03, 0.03, 0.7, c, x!, 0, z!, 5);
      p.box(0.7, 0.05, 0.7, '#ff7043', -0.1, 0.7, -0.1);
      p.add(new THREE.BoxGeometry(0.2, 0.03, 0.8), '#29b6f6', 0.45, 0.35, 0.3, 0, 0.7, 0);
      p.cone(0.45, 0.3, '#fdd835', -0.1, 0.75, -0.1, 4, Math.PI / 4);
      return;
    case 'swing':
      for (const s of [-1, 1]) p.add(new THREE.BoxGeometry(0.04, 0.8, 0.04), c, s * 0.35, 0.38, 0, 0, 0.2 * s);
      p.box(0.8, 0.04, 0.04, c, 0, 0.76, 0);
      p.box(0.18, 0.03, 0.1, '#795548', 0, 0.25, 0);
      return;
    case 'sandbox':
      p.box(0.8, 0.12, 0.8, '#a1887f', 0, 0, 0).box(0.7, 0.13, 0.7, c, 0, 0, 0);
      p.cone(0.12, 0.12, '#e6c27a', 0.1, 0.13, 0.1, 6);
      return;
    case 'pavilion':
      p.cyl(0.85, 0.85, 0.1, '#e0e0e0', 0, 0, 0, 8);
      for (let i = 0; i < 6; i++) p.cyl(0.04, 0.04, 0.8, c, Math.cos((i / 6) * 6.28) * 0.7, 0.1, Math.sin((i / 6) * 6.28) * 0.7, 5);
      p.cone(1.0, 0.45, m.accent ?? '#4c8c4a', 0, 0.9, 0, 6);
      return;
    case 'pond':
      p.cyl(0.85, 0.9, 0.05, '#8d6e63', 0, 0, 0, 12).cyl(0.8, 0.8, 0.02, c, 0, 0.04, 0, 12);
      for (let i = 0; i < 4; i++) p.cyl(0.1, 0.1, 0.01, '#66bb6a', Math.cos(i * 1.7) * 0.45, 0.065, Math.sin(i * 1.7) * 0.45, 6);
      p.ball(0.04, '#f48fb1', 0.45, 0.08, 0.1, 3);
      return;
    case 'flag':
      p.cyl(0.02, 0.025, 1.3, '#bdbdbd', 0, 0, 0, 5).box(0.4, 0.25, 0.02, c, 0.2, 1.0, 0);
      return;
    case 'stall':
      p.box(0.7, 0.35, 0.45, '#a1887f', 0, 0, 0);
      for (const s of [-1, 1]) p.box(0.03, 0.5, 0.03, '#795548', s * 0.33, 0.35, 0.2);
      p.add(new THREE.BoxGeometry(0.8, 0.04, 0.6), c, 0, 0.85, 0.05, 0, -0.2);
      for (let i = 0; i < 3; i++) p.ball(0.07, ['#e53935', '#fdd835', '#43a047'][i]!, -0.2 + i * 0.2, 0.42, 0.05, 3);
      return;
    case 'busstop':
      p.box(0.8, 0.03, 0.4, '#bdbdbd', 0, 0, 0);
      p.box(0.75, 0.6, 0.03, '#b3e5fc', 0, 0.03, -0.17).box(0.85, 0.04, 0.45, c, 0, 0.63, 0);
      p.box(0.5, 0.04, 0.15, '#8d6e63', 0, 0.2, -0.08);
      return;
    case 'mailbox':
      p.cyl(0.025, 0.025, 0.4, '#616161', 0, 0, 0, 5).box(0.2, 0.25, 0.15, c, 0, 0.4, 0);
      return;
    case 'bikerack':
      for (let i = 0; i < 3; i++) p.add(new THREE.TorusGeometry(0.13, 0.015, 4, 10, Math.PI), c, -0.25 + i * 0.25, 0, 0);
      p.add(new THREE.TorusGeometry(0.1, 0.012, 4, 10), '#e53935', -0.25, 0.12, 0.08);
      p.add(new THREE.TorusGeometry(0.1, 0.012, 4, 10), '#e53935', -0.05, 0.12, 0.08);
      return;
    case 'picnic':
      p.box(0.7, 0.04, 0.4, c, 0, 0.3, 0);
      for (const s of [-1, 1]) p.box(0.7, 0.04, 0.12, c, 0, 0.16, s * 0.3).box(0.04, 0.3, 0.35, c, s * 0.3, 0, 0);
      return;
    case 'cart':
      p.box(0.6, 0.35, 0.35, c, 0, 0.12, 0);
      for (const s of [-1, 1]) p.add(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), '#424242', s * 0.2, 0.1, 0.19, 0, Math.PI / 2);
      if (m.variant === 2) for (let i = 0; i < 5; i++) p.ball(0.08, ['#ff80ab', '#ffd54f', '#b39ddb'][i % 3]!, -0.2 + i * 0.1, 0.52, 0, 3);
      else p.add(new THREE.ConeGeometry(0.5, 0.3, 4), m.variant ? '#e53935' : '#ffffff', 0, 0.85, 0, Math.PI / 4).cyl(0.02, 0.02, 0.4, '#9e9e9e', 0, 0.47, 0, 4);
      return;
    case 'umbrella':
      p.cyl(0.02, 0.02, 0.8, '#eeeeee', 0, 0, 0, 4).cone(0.45, 0.2, c, 0, 0.75, 0, 8);
      return;
    case 'deckchair':
      p.add(new THREE.BoxGeometry(0.3, 0.04, 0.6), c, 0, 0.18, 0, 0, 0.5);
      p.box(0.3, 0.15, 0.04, '#bcaaa4', 0, 0, 0.2).box(0.3, 0.25, 0.04, '#bcaaa4', 0, 0, -0.2);
      return;
    case 'arch':
      p.add(new THREE.TorusGeometry(0.38, 0.06, 6, 14, Math.PI), '#558b2f', 0, 0.35, 0);
      for (let i = 0; i < 6; i++) p.ball(0.06, c, Math.cos((i / 5) * Math.PI) * 0.38, 0.35 + Math.sin((i / 5) * Math.PI) * 0.38, 0.05, 3);
      for (const s of [-1, 1]) p.box(0.1, 0.35, 0.1, '#558b2f', s * 0.38, 0, 0);
      return;
    case 'birdbath':
      p.cyl(0.06, 0.1, 0.35, c, 0, 0, 0, 6).cyl(0.22, 0.12, 0.08, c, 0, 0.35, 0, 10).cyl(0.18, 0.18, 0.01, '#4fc3f7', 0, 0.43, 0, 10);
      return;
    case 'clockpost':
      p.cyl(0.05, 0.07, 1.0, c, 0, 0, 0, 6).box(0.3, 0.3, 0.12, c, 0, 1.0, 0);
      p.add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 12), '#ffffff', 0, 1.15, 0.07, 0, Math.PI / 2);
      return;
    case 'path':
      p.box(0.98, 0.03, 0.98, c, 0, 0, 0);
      if (m.variant !== 2) for (let i = 0; i < 4; i++) p.box(0.44, 0.012, 0.44, shade(c, 0.92), -0.24 + (i % 2) * 0.48, 0.03, -0.24 + Math.floor(i / 2) * 0.48);
      return;
    case 'snowman':
      p.ball(0.22, c, 0, 0.2, 0).ball(0.16, c, 0, 0.5, 0).ball(0.11, c, 0, 0.72, 0);
      p.cone(0.03, 0.12, '#ff7043', 0, 0.72, 0.1, 5).cyl(0.1, 0.1, 0.12, '#212121', 0, 0.8, 0, 8);
      return;
    case 'xmastree':
      p.cyl(0.05, 0.05, 0.15, '#6d4c41', 0, 0, 0, 5);
      for (let i = 0; i < 3; i++) p.cone(0.38 - i * 0.09, 0.4, c, 0, 0.12 + i * 0.25, 0, 8);
      for (let i = 0; i < 7; i++) p.ball(0.04, ['#e53935', '#ffd54f', '#42a5f5'][i % 3]!, Math.cos(i * 2) * (0.28 - i * 0.03), 0.25 + i * 0.1, Math.sin(i * 2) * (0.28 - i * 0.03), 3);
      p.cone(0.06, 0.1, '#ffd54f', 0, 0.9, 0, 5);
      return;
    case 'pumpkins':
      for (const [x, z, r] of [[-0.15, 0, 0.16], [0.15, 0.05, 0.14], [0, -0.15, 0.12], [0, 0.05, 0.11]]) p.ball(r!, c, x!, r! + (x === 0 && z === 0.05 ? 0.22 : 0), z!);
      p.box(0.5, 0.15, 0.3, '#e6c27a', 0.15, 0, 0.25);
      return;
    case 'leaves':
      for (let i = 0; i < 5; i++) p.cone(0.25 - i * 0.03, 0.18, i % 2 ? c : '#e67e22', (i - 2) * 0.08, 0, (i % 2) * 0.1, 6);
      return;
    case 'eggs':
      p.cyl(0.3, 0.25, 0.1, '#a1887f', 0, 0, 0, 10);
      for (let i = 0; i < 5; i++) p.add(new THREE.SphereGeometry(0.07, 6, 5).scale(1, 1.3, 1), ['#a29bfe', '#ff7675', '#55efc4', '#ffeaa7', '#74b9ff'][i]!, Math.cos(i * 1.25) * 0.15, 0.15, Math.sin(i * 1.25) * 0.15);
      return;
    case 'beachchair':
      p.box(0.5, 0.25, 0.4, '#f5f5f5', 0, 0, 0).box(0.55, 0.6, 0.1, c, 0, 0.1, -0.18);
      p.add(new THREE.CylinderGeometry(0.26, 0.26, 0.5, 8, 1, false, 0, Math.PI), c, 0, 0.7, -0.05, 0, 0, Math.PI / 2);
      return;
    default:
      p.box(0.5, 0.5, 0.5, c, 0, 0, 0);
  }
}

const BIG: Record<string, (p: Parts, m: ModelSpec, W: number, D: number) => void> = {
  house, tower, villa, shop, civic, plaza, stage, greenhouse, zoo, stadium, funpark, lighthouse, wheel, clocktower, plot, mill, factory, barn, silo, station, harbor, airport,
};

const geoCache = new Map<string, THREE.BufferGeometry>();

/** Geometrie für ein Gebäude in lokalen Koordinaten (Mitte der Grundfläche, Boden y=0, unrotiert). */
export function buildingGeometry(def: BuildingDef): THREE.BufferGeometry {
  let g = geoCache.get(def.id);
  if (!g) {
    const p = new Parts();
    const fn = BIG[def.model.kind];
    if (fn) fn(p, def.model, def.w, def.h);
    else decoModel(p, def.model, def.w, def.h);
    g = p.build();
    geoCache.set(def.id, g);
  }
  return g;
}

export function scaffoldGeometry(w: number, h: number): THREE.BufferGeometry {
  const k = `scaffold${w}x${h}`;
  let g = geoCache.get(k);
  if (!g) {
    const p = new Parts();
    p.box(w - 0.1, 0.06, h - 0.1, '#a1887f', 0, 0, 0);
    const H = Math.min(1.4, 0.4 + Math.max(w, h) * 0.25);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(0.06, H, 0.06, '#d7a86e', sx * (w / 2 - 0.25), 0.06, sz * (h / 2 - 0.25));
    for (let y = 0.4; y < H; y += 0.4) {
      p.box(w - 0.5, 0.04, 0.05, '#d7a86e', 0, y, h / 2 - 0.25).box(w - 0.5, 0.04, 0.05, '#d7a86e', 0, y, -h / 2 + 0.25);
      p.box(0.05, 0.04, h - 0.5, '#d7a86e', w / 2 - 0.25, y, 0).box(0.05, 0.04, h - 0.5, '#d7a86e', -w / 2 + 0.25, y, 0);
    }
    p.box(w * 0.5, H * 0.5, h * 0.5, '#e0d6c8', 0, 0.06, 0);
    p.box(0.3, 0.2, 0.3, '#8d6e63', w * 0.3, 0.06, h * 0.3).box(0.25, 0.25, 0.25, '#ffb300', -w * 0.3, 0.06, h * 0.32);
    for (let i = 0; i < 5; i++) p.box(0.05, 0.25, 0.05, i % 2 ? '#ff7043' : '#ffffff', -w / 2 + 0.1 + i * 0.2, 0.06, h / 2 - 0.08);
    g = p.build();
    geoCache.set(k, g);
  }
  return g;
}

/** Pflanzen auf einem Acker: Stufe 0 (Keimling) bis 2 (reif). */
export function cropGeometry(color: string, stage: number, w: number, h: number): THREE.BufferGeometry {
  const k = `crop${color}${stage}${w}${h}`;
  let g = geoCache.get(k);
  if (!g) {
    const p = new Parts();
    const s = [0.35, 0.65, 1][stage]!;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const x = -w / 2 + 0.32 + i * ((w - 0.64) / 3);
        const z = -h / 2 + 0.3 + j * ((h - 0.6) / 3);
        p.cone(0.09 * s + 0.03, 0.32 * s, '#6aa84f', x, 0.08, z, 5);
        if (stage === 2) p.ball(0.08, color, x, 0.08 + 0.3 * s, z, 3);
      }
    g = p.build();
    geoCache.set(k, g);
  }
  return g;
}

export function carGeometry(color: string, kind: number): THREE.BufferGeometry {
  const k = `car${color}${kind}`;
  let g = geoCache.get(k);
  if (!g) {
    const p = new Parts();
    const L = kind === 2 ? 0.7 : 0.42;
    p.box(L, 0.12, 0.22, color, 0, 0.05, 0);
    if (kind === 1) p.box(L * 0.55, 0.18, 0.21, '#eceff1', -L * 0.12, 0.17, 0).box(0.1, 0.12, 0.2, '#90caf9', L * 0.22, 0.17, 0);
    else if (kind === 2) p.box(L * 0.95, 0.16, 0.21, color, 0, 0.17, 0).box(L * 0.9, 0.07, 0.215, '#90caf9', 0, 0.22, 0);
    else p.box(L * 0.55, 0.11, 0.2, '#b3e5fc', -L * 0.05, 0.17, 0).box(L * 0.45, 0.02, 0.21, color, -L * 0.05, 0.28, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.add(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), '#263238', sx * L * 0.32, 0.05, sz * 0.11, 0, Math.PI / 2);
    g = p.build();
    geoCache.set(k, g);
  }
  return g;
}

export function personGeometry(skin: string, shirt: string, pants: string, hair: string, part: 'body' | 'leg'): THREE.BufferGeometry {
  const k = `p${skin}${shirt}${pants}${hair}${part}`;
  let g = geoCache.get(k);
  if (!g) {
    const p = new Parts();
    if (part === 'leg') p.box(0.035, 0.1, 0.035, pants, 0, -0.1, 0);
    else {
      p.box(0.11, 0.12, 0.07, shirt, 0, 0.1, 0);
      p.ball(0.045, skin, 0, 0.27, 0, 3);
      p.box(0.095, 0.035, 0.095, hair, 0, 0.3, -0.005);
      p.box(0.025, 0.1, 0.03, skin, 0.07, 0.11, 0).box(0.025, 0.1, 0.03, skin, -0.07, 0.11, 0);
    }
    g = p.build();
    geoCache.set(k, g);
  }
  return g;
}
