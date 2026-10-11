import * as THREE from 'three';

export type V3 = [number, number, number];

/**
 * Gitterkoordinaten einer Achse zwischen lo und hi. In den Rundungen (Radius r) sind die Stützstellen
 * gleichmäßig im Winkel verteilt (s = r·tan θ), dazwischen liegen `midDiv` gleich große Abschnitte
 * plus die Pflicht-Stützstellen `extras` (z. B. Torkanten, damit der Ausschnitt sauber geschnitten wird).
 */
export function axisCoords(
  lo: number,
  hi: number,
  r: number,
  steps: number,
  extras: number[],
  midDiv: number,
): number[] {
  const out: number[] = [];
  for (let k = 0; k <= steps; k++) out.push(lo + r - r * Math.tan((Math.PI / 4) * (1 - k / steps)));
  for (let k = 0; k <= steps; k++) out.push(hi - r + r * Math.tan((Math.PI / 4) * (k / steps)));
  for (let k = 1; k < midDiv; k++) out.push(lo + r + ((hi - lo - 2 * r) * k) / midDiv);
  for (const e of extras) if (e > lo && e < hi) out.push(e);
  out.sort((a, b) => a - b);
  const res: number[] = [];
  for (const v of out) if (res.length === 0 || v - (res[res.length - 1] as number) > 1e-4) res.push(v);
  return res;
}

export interface TriCtx {
  cx: number;
  cy: number;
  cz: number;
  minY: number;
  maxY: number;
}

/**
 * Innenfläche eines abgerundeten Quaders (Minkowski-Summe aus Kernquader und Kugel mit Radius r).
 * Normalen zeigen nach innen. Dreiecke lassen sich über `keep` aussortieren (Tor-Ausschnitt, ebener Boden …).
 */
export function buildShell(
  lo: V3,
  hi: V3,
  r: number,
  grids: [number[], number[], number[]],
  keep?: (t: TriCtx) => boolean,
): THREE.BufferGeometry {
  const clo = lo.map((v) => v + r);
  const chi = hi.map((v) => v - r);
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const ctx: TriCtx = { cx: 0, cy: 0, cz: 0, minY: 0, maxY: 0 };

  const pushTri = (a: number, b: number, c: number): void => {
    const ax = pos[a * 3] as number,
      ay = pos[a * 3 + 1] as number,
      az = pos[a * 3 + 2] as number;
    const bx = pos[b * 3] as number,
      by = pos[b * 3 + 1] as number,
      bz = pos[b * 3 + 2] as number;
    const cx = pos[c * 3] as number,
      cy = pos[c * 3 + 1] as number,
      cz = pos[c * 3 + 2] as number;
    ctx.cx = (ax + bx + cx) / 3;
    ctx.cy = (ay + by + cy) / 3;
    ctx.cz = (az + bz + cz) / 3;
    ctx.minY = Math.min(ay, by, cy);
    ctx.maxY = Math.max(ay, by, cy);
    if (keep && !keep(ctx)) return;
    // Entartete Dreiecke weglassen und Umlaufsinn so wählen, dass die Vorderseite nach innen zeigt
    const ux = bx - ax,
      uy = by - ay,
      uz = bz - az;
    const vx = cx - ax,
      vy = cy - ay,
      vz = cz - az;
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    if (nx * nx + ny * ny + nz * nz < 1e-12) return;
    const avx = (nor[a * 3] as number) + (nor[b * 3] as number) + (nor[c * 3] as number);
    const avy = (nor[a * 3 + 1] as number) + (nor[b * 3 + 1] as number) + (nor[c * 3 + 1] as number);
    const avz = (nor[a * 3 + 2] as number) + (nor[b * 3 + 2] as number) + (nor[c * 3 + 2] as number);
    if (nx * avx + ny * avy + nz * avz >= 0) idx.push(a, b, c);
    else idx.push(a, c, b);
  };

  for (let axis = 0; axis < 3; axis++) {
    for (let sign = 0; sign < 2; sign++) {
      const a1 = (axis + 1) % 3;
      const a2 = (axis + 2) % 3;
      const g1 = grids[a1];
      const g2 = grids[a2];
      const base = pos.length / 3;
      const p: V3 = [0, 0, 0];
      for (let i = 0; i < g1.length; i++) {
        for (let j = 0; j < g2.length; j++) {
          p[axis] = sign ? hi[axis] : lo[axis];
          p[a1] = g1[i] as number;
          p[a2] = g2[j] as number;
          const cxp = Math.min(Math.max(p[0], clo[0] as number), chi[0] as number);
          const cyp = Math.min(Math.max(p[1], clo[1] as number), chi[1] as number);
          const czp = Math.min(Math.max(p[2], clo[2] as number), chi[2] as number);
          let dx = p[0] - cxp,
            dy = p[1] - cyp,
            dz = p[2] - czp;
          const len = Math.hypot(dx, dy, dz) || 1;
          dx /= len;
          dy /= len;
          dz /= len;
          pos.push(cxp + dx * r, cyp + dy * r, czp + dz * r);
          nor.push(-dx, -dy, -dz);
        }
      }
      const n2 = g2.length;
      for (let i = 0; i < g1.length - 1; i++) {
        for (let j = 0; j < n2 - 1; j++) {
          const v00 = base + i * n2 + j;
          const v01 = v00 + 1;
          const v10 = v00 + n2;
          const v11 = v10 + 1;
          pushTri(v00, v10, v11);
          pushTri(v00, v11, v01);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** Sammelt viele Teilgeometrien (mit Farbe) zu EINEM Mesh – für statische Kulisse mit einem einzigen Zeichenaufruf. */
export class Batch {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private uv: number[] = [];
  private idx: number[] = [];
  private nm = new THREE.Matrix3();
  private v = new THREE.Vector3();
  private unitBox = new THREE.BoxGeometry(1, 1, 1);
  private tmp = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private s = new THREE.Vector3();
  private t = new THREE.Vector3();
  private c = new THREE.Color();

  /** uvConst überschreibt die UV-Koordinaten aller Eckpunkte (z. B. u = Gebäudekennung, v = Dachhöhe). */
  add(
    geo: THREE.BufferGeometry,
    m: THREE.Matrix4,
    color: THREE.Color | number,
    uvConst?: [number, number],
  ): void {
    this.c.set(color);
    this.nm.getNormalMatrix(m);
    const p = geo.getAttribute('position');
    const n = geo.getAttribute('normal');
    const uv = geo.getAttribute('uv');
    const base = this.pos.length / 3;
    for (let i = 0; i < p.count; i++) {
      this.v.fromBufferAttribute(p, i).applyMatrix4(m);
      this.pos.push(this.v.x, this.v.y, this.v.z);
      this.v.fromBufferAttribute(n, i).applyMatrix3(this.nm).normalize();
      this.nor.push(this.v.x, this.v.y, this.v.z);
      this.col.push(this.c.r, this.c.g, this.c.b);
      if (uvConst) this.uv.push(uvConst[0], uvConst[1]);
      else this.uv.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    }
    const ix = geo.getIndex();
    if (ix) for (let i = 0; i < ix.count; i++) this.idx.push(base + ix.getX(i));
    else for (let i = 0; i < p.count; i++) this.idx.push(base + i);
  }

  box(
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    color: THREE.Color | number,
    uvConst?: [number, number],
    rotY = 0,
  ): void {
    this.e.set(0, rotY, 0);
    this.q.setFromEuler(this.e);
    this.tmp.compose(this.t.set(cx, cy, cz), this.q, this.s.set(sx, sy, sz));
    this.add(this.unitBox, this.tmp, color, uvConst);
  }

  /** Beliebige Geometrie an Position/Drehung/Skalierung einfügen */
  place(
    geo: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    sc: number | V3,
    color: THREE.Color | number,
    uvConst?: [number, number],
  ): void {
    this.e.set(rx, ry, rz);
    this.q.setFromEuler(this.e);
    if (typeof sc === 'number') this.s.set(sc, sc, sc);
    else this.s.set(sc[0], sc[1], sc[2]);
    this.tmp.compose(this.t.set(x, y, z), this.q, this.s);
    this.add(geo, this.tmp, color, uvConst);
  }

  get empty(): boolean {
    return this.pos.length === 0;
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(
      this.idx.length > 65535
        ? new THREE.Uint32BufferAttribute(this.idx, 1)
        : new THREE.Uint16BufferAttribute(this.idx, 1),
    );
    this.unitBox.dispose();
    return g;
  }
}
