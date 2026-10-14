/* GeoBuilder: viele einfache Körper zu EINER Geometrie mit Vertexfarben bündeln (wenige Zeichenaufrufe).
   Grundformen werden einmal erzeugt und per Matrix eingefügt. Unterstützt Drehung, Skalierung und Farbverläufe. */

const protoCache = new Map<string, THREE.BufferGeometry>();
function proto(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = protoCache.get(key);
  if (!g) {
    g = make();
    if (g.index) g = g.toNonIndexed();
    if (!g.attributes.normal) g.computeVertexNormals();
    protoCache.set(key, g);
  }
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _c = new THREE.Color(), _c2 = new THREE.Color();

export interface PrimOpts { rx?: number; ry?: number; rz?: number; color2?: number; shade?: number; }

export class GeoBuilder {
  pos: number[] = [];
  nor: number[] = [];
  col: number[] = [];
  get empty(): boolean { return this.pos.length === 0; }

  /** Fügt eine Prototyp-Geometrie mit Matrix und Farbe ein. color2 = Farbe oben (Verlauf in y). */
  addGeo(g: THREE.BufferGeometry, m: THREE.Matrix4, color: number, o?: PrimOpts): void {
    const p = g.attributes.position, n = g.attributes.normal;
    _n.getNormalMatrix(m);
    _c.setHex(color);
    if (o?.shade) _c.multiplyScalar(o.shade);
    const grad = o?.color2 !== undefined;
    if (grad) _c2.setHex(o!.color2!);
    let ymin = 0, ymax = 1;
    if (grad) { ymin = Infinity; ymax = -Infinity; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < ymin) ymin = y; if (y > ymax) ymax = y; } }
    for (let i = 0; i < p.count; i++) {
      _v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m);
      this.pos.push(_v.x, _v.y, _v.z);
      _v.set(n.getX(i), n.getY(i), n.getZ(i));
      const e = _n.elements, x = _v.x, y = _v.y, z = _v.z;
      const nx = e[0] * x + e[3] * y + e[6] * z, ny = e[1] * x + e[4] * y + e[7] * z, nz = e[2] * x + e[5] * y + e[8] * z;
      const l = Math.hypot(nx, ny, nz) || 1;
      this.nor.push(nx / l, ny / l, nz / l);
      if (grad) {
        const t = (p.getY(i) - ymin) / (ymax - ymin || 1);
        this.col.push(_c.r + (_c2.r - _c.r) * t, _c.g + (_c2.g - _c.g) * t, _c.b + (_c2.b - _c.b) * t);
      } else this.col.push(_c.r, _c.g, _c.b);
    }
  }
  private mat(x: number, y: number, z: number, sx: number, sy: number, sz: number, o?: PrimOpts): THREE.Matrix4 {
    _e.set(o?.rx || 0, o?.ry || 0, o?.rz || 0, 'YXZ');
    _q.setFromEuler(_e);
    return _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
  }
  /** Quader; y = Unterkante. */
  box(x: number, y: number, z: number, w: number, h: number, d: number, color: number, o?: PrimOpts): this {
    const g = proto('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
    this.addGeo(g, this.mat(x, y, z, w, h, d, o), color, o);
    return this;
  }
  /** Abgerundeter Quader (für freundliche Formen); y = Unterkante. */
  rbox(x: number, y: number, z: number, w: number, h: number, d: number, color: number, o?: PrimOpts): this {
    const g = proto('rbox', () => {
      const b = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
      const p = b.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const k = 0.42, cx = Math.max(-k, Math.min(k, x)), cy = Math.max(-k, Math.min(k, y)), cz = Math.max(-k, Math.min(k, z));
        let dx = x - cx, dy = y - cy, dz = z - cz; const l = Math.hypot(dx, dy, dz) || 1; const r = 0.08;
        dx = dx / l * r; dy = dy / l * r; dz = dz / l * r;
        p.setXYZ(i, cx + dx, cy + dy, cz + dz);
      }
      b.computeVertexNormals();
      return b.translate(0, 0.5, 0);
    });
    this.addGeo(g, this.mat(x, y, z, w, h, d, o), color, o);
    return this;
  }
  /** Zylinder; y = Unterkante. */
  cyl(x: number, y: number, z: number, rTop: number, rBot: number, h: number, color: number, seg = 12, o?: PrimOpts): this {
    const g = proto('cyl' + seg, () => new THREE.CylinderGeometry(1, 1, 1, seg).translate(0, 0.5, 0));
    if (rTop === rBot) { this.addGeo(g, this.mat(x, y, z, rTop, h, rTop, o), color, o); return this; }
    const key = 'cylT' + seg + '_' + (rTop / rBot).toFixed(3);
    const gt = proto(key, () => new THREE.CylinderGeometry(rTop / rBot, 1, 1, seg).translate(0, 0.5, 0));
    this.addGeo(gt, this.mat(x, y, z, rBot, h, rBot, o), color, o);
    return this;
  }
  cone(x: number, y: number, z: number, r: number, h: number, color: number, seg = 10, o?: PrimOpts): this {
    const g = proto('cone' + seg, () => new THREE.ConeGeometry(1, 1, seg).translate(0, 0.5, 0));
    this.addGeo(g, this.mat(x, y, z, r, h, r, o), color, o);
    return this;
  }
  /** Kugel/Ellipsoid um den Mittelpunkt. */
  sph(x: number, y: number, z: number, r: number, color: number, o?: PrimOpts & { sy?: number; sx?: number; sz?: number; detail?: number }): this {
    const d = o?.detail ?? 1;
    const g = proto('ico' + d, () => new THREE.IcosahedronGeometry(1, d));
    this.addGeo(g, this.mat(x, y, z, r * (o?.sx ?? 1), r * (o?.sy ?? 1), r * (o?.sz ?? 1), o), color, o);
    return this;
  }
  /** Glatte Kugel (mehr Segmente). */
  ball(x: number, y: number, z: number, r: number, color: number, o?: PrimOpts & { sy?: number; sx?: number; sz?: number }): this {
    const g = proto('ball', () => new THREE.SphereGeometry(1, 14, 10));
    this.addGeo(g, this.mat(x, y, z, r * (o?.sx ?? 1), r * (o?.sy ?? 1), r * (o?.sz ?? 1), o), color, o);
    return this;
  }
  torus(x: number, y: number, z: number, r: number, tube: number, color: number, o?: PrimOpts): this {
    const k = (tube / r).toFixed(3);
    const g = proto('torus' + k, () => new THREE.TorusGeometry(1, tube / r, 6, 20));
    this.addGeo(g, this.mat(x, y, z, r, r, r, o), color, o);
    return this;
  }
  /** Flache Scheibe (Boden-Deko), leicht über y. */
  disc(x: number, y: number, z: number, r: number, color: number, seg = 24): this {
    const g = proto('disc' + seg, () => new THREE.CircleGeometry(1, seg).rotateX(-Math.PI / 2));
    this.addGeo(g, this.mat(x, y, z, r, 1, r), color);
    return this;
  }
  ring(x: number, y: number, z: number, r0: number, r1: number, color: number, seg = 32): this {
    const key = 'ring' + seg + '_' + (r0 / r1).toFixed(3);
    const g = proto(key, () => new THREE.RingGeometry(r0 / r1, 1, seg).rotateX(-Math.PI / 2));
    this.addGeo(g, this.mat(x, y, z, r1, 1, r1), color);
    return this;
  }
  /** Flaches Rechteck (Weg, Platz) – Mitte x/z, Länge entlang Drehung ry. */
  quad(x: number, y: number, z: number, w: number, d: number, color: number, ry = 0): this {
    const g = proto('quad', () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    this.addGeo(g, this.mat(x, y, z, w, 1, d, { ry }), color);
    return this;
  }
  /** Dreiseitiges Prisma (Satteldach); y = Unterkante. */
  roof(x: number, y: number, z: number, w: number, h: number, d: number, color: number, o?: PrimOpts): this {
    const g = proto('prism', () => {
      const b = new THREE.BufferGeometry();
      const P = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0, 1, -0.5, -0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, 0.5];
      const tri = (a: number, bb: number, c: number, arr: number[]) => arr.push(P[a * 3], P[a * 3 + 1], P[a * 3 + 2], P[bb * 3], P[bb * 3 + 1], P[bb * 3 + 2], P[c * 3], P[c * 3 + 1], P[c * 3 + 2]);
      const arr: number[] = [];
      tri(0, 2, 1, arr); tri(3, 5, 4, arr); tri(0, 3, 4, arr); tri(0, 4, 2, arr); tri(1, 2, 4, arr); tri(1, 4, 5, arr); tri(0, 1, 5, arr); tri(0, 5, 3, arr);
      b.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      b.computeVertexNormals();
      return b;
    });
    this.addGeo(g, this.mat(x, y, z, w, h, d, o), color, o);
    return this;
  }
  /** Weitere Geometrie anhängen (z. B. Gelände). */
  merge(o: GeoBuilder): this { this.pos.push(...o.pos); this.nor.push(...o.nor); this.col.push(...o.col); return this; }
  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    return g;
  }
  mesh(mat: THREE.Material, shadows = true): THREE.Mesh {
    const m = new THREE.Mesh(this.build(), mat);
    m.castShadow = shadows; m.receiveShadow = true;
    return m;
  }
}
