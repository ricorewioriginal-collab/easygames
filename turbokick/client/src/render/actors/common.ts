import * as THREE from 'three';

/** Gemeinsame Hilfen der Akteure: Teamfarben, prozedurale Texturen, Mesh-Baukasten, Blob-Schatten. */

export const TEAM_COLORS = [
  { main: 0xff7a1a, accent: 0xffd08a },
  { main: 0x19c8ff, accent: 0xb8f3ff },
] as const;
export const NEUTRAL_GLOW = 0xdfe8ff;

export function teamColors(team: number): { main: number; accent: number } {
  return team === 1 ? TEAM_COLORS[1] : TEAM_COLORS[0];
}

export const TAU = Math.PI * 2;
export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
export const finite3 = (v: ArrayLike<number> | undefined | null): boolean =>
  !!v && v.length >= 3 && Number.isFinite(v[0]) && Number.isFinite(v[1]) && Number.isFinite(v[2]);
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function markShared<T extends { userData: Record<string, unknown> }>(o: T): T {
  o.userData.shared = true;
  return o;
}

/* ---------------------------------------------------------------- Texturen */

function canvasTex(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData.shared = true;
  return t;
}

function pixelTex(w: number, h: number, f: (u: number, v: number) => number): THREE.CanvasTexture {
  return canvasTex(w, h, (g) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // v = 0 unten (Textur-Koordinate), Bildzeile 0 = oben
        const a = clamp01(f((x + 0.5) / w, 1 - (y + 0.5) / h));
        const i = (y * w + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
  });
}

const texCache = new Map<string, THREE.CanvasTexture>();
function cachedTex(key: string, make: () => THREE.CanvasTexture): THREE.CanvasTexture {
  let t = texCache.get(key);
  if (!t) {
    t = make();
    texCache.set(key, t);
  }
  return t;
}

/** Weicher Lichtpunkt (weiß, Alpha fällt nach außen ab) */
export const glowTexture = (): THREE.CanvasTexture =>
  cachedTex('glow', () =>
    pixelTex(64, 64, (u, v) => {
      const d = Math.hypot(u - 0.5, v - 0.5) * 2;
      return d >= 1 ? 0 : Math.pow(1 - d, 1.7) * 1.05;
    }),
  );

/** Weiche dunkle Scheibe (Blob-Schatten); Alpha ist die Form */
export const shadowTexture = (): THREE.CanvasTexture =>
  cachedTex('shadow', () =>
    pixelTex(64, 64, (u, v) => {
      const d = Math.hypot(u - 0.5, v - 0.5) * 2;
      return d >= 1 ? 0 : Math.pow(1 - d * d, 1.4);
    }),
  );

/** Ring mit weichen Kanten (Schockwellen) */
export const ringTexture = (): THREE.CanvasTexture =>
  cachedTex('ring', () =>
    pixelTex(128, 128, (u, v) => {
      const d = Math.hypot(u - 0.5, v - 0.5) * 2;
      if (d > 1) return 0;
      if (d < 0.62) return Math.pow(d / 0.62, 4) * 0.12;
      const k = (d - 0.62) / 0.38;
      return Math.pow(Math.sin(Math.pow(k, 0.55) * Math.PI), 1.6);
    }),
  );

/** Längsverlauf: u = 0 (Ansatz) hell → u = 1 (Spitze) transparent, quer weich */
export const streakTexture = (): THREE.CanvasTexture =>
  cachedTex('streak', () =>
    pixelTex(64, 16, (u, v) => Math.pow(1 - u, 1.5) * Math.pow(Math.sin(v * Math.PI), 1.1)),
  );

/** Senkrechter Verlauf: unten hell, oben transparent (Lichtsäulen) */
export const columnTexture = (): THREE.CanvasTexture =>
  cachedTex('column', () =>
    pixelTex(
      32,
      64,
      (u, v) => Math.pow(1 - v, 1.3) * Math.min(1, v * 14 + 0.25) * Math.pow(Math.sin(u * Math.PI), 1.3),
    ),
  );

/* ------------------------------------------------------------ Mesh-Baukasten */

export type V3 = [number, number, number];

/** Sammelt Dreiecke (flach schattiert) und baut daraus eine Geometrie mit Draufsicht-UVs (für Aufkleber). */
export class MeshBuilder {
  private pos: number[] = [];

  tri(a: V3, b: V3, c: V3): void {
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  }
  quad(a: V3, b: V3, c: V3, d: V3): void {
    this.tri(a, b, c);
    this.tri(a, c, d);
  }
  mark(): number {
    return this.pos.length;
  }
  /** Spiegelt alles seit `since` an x = 0 dazu */
  mirrorX(since: number): void {
    const p = this.pos;
    const n = p.length;
    for (let i = since; i < n; i += 9) {
      p.push(
        -p[i]!,
        p[i + 1]!,
        p[i + 2]!,
        -p[i + 6]!,
        p[i + 7]!,
        p[i + 8]!,
        -p[i + 3]!,
        p[i + 4]!,
        p[i + 5]!,
      );
    }
  }
  get empty(): boolean {
    return this.pos.length === 0;
  }

  /**
   * Verbindet Ringe (gleiche Punktzahl) zu einem Rohr. Ring-Umlaufsinn: gegen den Uhrzeigersinn, vom Zielende zurückgeblickt
   * (also Rechtssystem: „rechts × oben = Laufrichtung“). Enden werden als Fächer geschlossen.
   */
  loft(rings: V3[][], caps = true): void {
    for (let r = 0; r + 1 < rings.length; r++) {
      const A = rings[r] as V3[];
      const B = rings[r + 1] as V3[];
      const m = A.length;
      for (let i = 0; i < m; i++) {
        const j = (i + 1) % m;
        this.quad(A[i] as V3, A[j] as V3, B[j] as V3, B[i] as V3);
      }
    }
    if (caps && rings.length > 0) {
      const f = rings[0] as V3[];
      const l = rings[rings.length - 1] as V3[];
      for (let i = 1; i + 1 < f.length; i++) this.tri(f[0] as V3, f[i + 1] as V3, f[i] as V3);
      for (let i = 1; i + 1 < l.length; i++) this.tri(l[0] as V3, l[i] as V3, l[i + 1] as V3);
    }
  }

  /** Querschnitte in der xy-Ebene entlang z */
  loftZ(rings: Array<{ z: number; p: Array<[number, number]> }>, caps = true): void {
    this.loft(
      rings.map((r) => r.p.map((q): V3 => [q[0], q[1], r.z])),
      caps,
    );
  }

  /** Achsenparallele (konische) Kiste entlang z: halbe Maße vorn/hinten */
  prism(
    z0: number,
    z1: number,
    cx: number,
    cy: number,
    hx0: number,
    hy0: number,
    hx1 = hx0,
    hy1 = hy0,
  ): void {
    this.loftZ([
      { z: z0, p: rect(cx, cy, hx0, hy0) },
      { z: z1, p: rect(cx, cy, hx1, hy1) },
    ]);
  }
  box(cx: number, cy: number, cz: number, hx: number, hy: number, hz: number): void {
    this.prism(cz - hz, cz + hz, cx, cy, hx, hy);
  }

  /** Dünner Balken von a nach b */
  bar(a: V3, b: V3, t: number, t2 = t): void {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    const d: V3 = [dx / len, dy / len, dz / len];
    // rechts = up0 × d, oben = d × rechts
    let up0: V3 = [0, 1, 0];
    if (Math.abs(d[1]) > 0.95) up0 = [1, 0, 0];
    let rx = up0[1] * d[2] - up0[2] * d[1];
    let ry = up0[2] * d[0] - up0[0] * d[2];
    let rz = up0[0] * d[1] - up0[1] * d[0];
    const rl = Math.hypot(rx, ry, rz) || 1;
    rx /= rl;
    ry /= rl;
    rz /= rl;
    const ux = d[1] * rz - d[2] * ry;
    const uy = d[2] * rx - d[0] * rz;
    const uz = d[0] * ry - d[1] * rx;
    const ring = (p: V3): V3[] => [
      [p[0] - rx * t - ux * t2, p[1] - ry * t - uy * t2, p[2] - rz * t - uz * t2],
      [p[0] + rx * t - ux * t2, p[1] + ry * t - uy * t2, p[2] + rz * t - uz * t2],
      [p[0] + rx * t + ux * t2, p[1] + ry * t + uy * t2, p[2] + rz * t + uz * t2],
      [p[0] - rx * t + ux * t2, p[1] - ry * t + uy * t2, p[2] - rz * t + uz * t2],
    ];
    this.loft([ring(a), ring(b)]);
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(this.pos);
    const uv = new Float32Array((p.length / 3) * 2);
    for (let i = 0, k = 0; i < p.length; i += 3, k += 2) {
      uv[k] = (p[i] as number) / 0.9 + 0.5;
      uv[k + 1] = 0.5 + (p[i + 2] as number) / 1.5;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    g.userData.shared = true;
    return g;
  }
}

export function rect(cx: number, cy: number, hx: number, hy: number): Array<[number, number]> {
  return [
    [cx - hx, cy - hy],
    [cx + hx, cy - hy],
    [cx + hx, cy + hy],
    [cx - hx, cy + hy],
  ];
}

/** Sechseck-Querschnitt: unten, Schulter (größte Breite), oben */
export function hex(
  z: number,
  wb: number,
  ws: number,
  yb: number,
  ym: number,
  yt: number,
  wt: number,
): { z: number; p: Array<[number, number]> } {
  return {
    z,
    p: [
      [-wb, yb],
      [wb, yb],
      [ws, ym],
      [wt, yt],
      [-wt, yt],
      [-ws, ym],
    ],
  };
}

/* ----------------------------------------------------------- Blob-Schatten */

let shadowGeo: THREE.PlaneGeometry | null = null;
function shadowGeometry(): THREE.PlaneGeometry {
  if (!shadowGeo) {
    shadowGeo = new THREE.PlaneGeometry(1, 1);
    shadowGeo.rotateX(-Math.PI / 2);
    shadowGeo.userData.shared = true;
  }
  return shadowGeo;
}

/** Weiche Scheibe auf dem Boden: Größe/Deckkraft nach Höhe */
export class BlobShadow {
  readonly mesh: THREE.Mesh;
  private readonly mat: THREE.MeshBasicMaterial;
  constructor(
    parent: THREE.Object3D,
    private readonly sx: number,
    private readonly sz: number,
    private readonly lift: number,
    private readonly strength = 0.6,
  ) {
    this.mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      map: shadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.mesh = new THREE.Mesh(shadowGeometry(), this.mat);
    this.mesh.renderOrder = 1;
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    parent.add(this.mesh);
  }
  /** (x, y, z) = Mittelpunkt des Objekts, yaw = Blickrichtung um y */
  update(x: number, y: number, z: number, yaw: number, show: boolean, fade = 1): void {
    const h = Math.max(0, y - this.lift);
    if (!show || h > 30) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;
    const k = 1 + h * 0.1;
    this.mesh.position.set(x, 0.025, z);
    this.mesh.rotation.y = yaw;
    this.mesh.scale.set(this.sx * k, 1, this.sz * k);
    this.mat.opacity = (this.strength * fade) / (1 + h * 0.2);
  }
  dispose(): void {
    this.mesh.removeFromParent();
    this.mat.dispose();
  }
}
