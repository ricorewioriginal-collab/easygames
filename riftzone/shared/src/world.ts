// Kollisionswelt: Gelände + Bauteile in einem Raster. Gemeinsam für Server, Worker und Client-Vorhersage.
import { MAP_SIZE, STEP_HEIGHT } from './constants';
import { Kind, isRampLike, isSolid, rampHeight, type Piece } from './pieces';
import type { Terrain } from './terrain';

export const CELL = 8;
const GN = Math.ceil(MAP_SIZE / CELL) + 2;

export interface RayHit {
  t: number;
  /** Bauteil-ID oder -1 für Gelände, -2 = nichts. */
  piece: number;
  nx: number;
  ny: number;
  nz: number;
}

const cellIndex = (cx: number, cz: number): number => {
  cx = cx < 0 ? 0 : cx >= GN ? GN - 1 : cx;
  cz = cz < 0 ? 0 : cz >= GN ? GN - 1 : cz;
  return cz * GN + cx;
};
const cellOf = (v: number): number => Math.floor(v / CELL) + 1;

export class World {
  readonly terrain: Terrain;
  readonly pieces: Piece[] = [];
  private readonly cells: number[][] = [];
  private stamp = 1;
  private readonly marks: Uint32Array;
  /** Wird bei jeder Änderung hochgezählt (Darstellung). */
  version = 0;
  /** IDs geänderter Bauteile seit dem letzten Abholen. */
  readonly dirty = new Set<number>();
  staticCount = 0;

  constructor(terrain: Terrain) {
    this.terrain = terrain;
    for (let i = 0; i < GN * GN; i++) this.cells.push([]);
    this.marks = new Uint32Array(1 << 17);
  }

  private mark(id: number): boolean {
    if (id >= this.marks.length) return true;
    if (this.marks[id] === this.stamp) return false;
    this.marks[id] = this.stamp;
    return true;
  }
  private nextStamp(): void {
    this.stamp++;
    if (this.stamp > 0xfffffff0) {
      this.marks.fill(0);
      this.stamp = 1;
    }
  }

  add(p: Piece): number {
    p.id = this.pieces.length;
    this.pieces.push(p);
    this.insert(p);
    this.dirty.add(p.id);
    this.version++;
    return p.id;
  }

  /** Bauteil mit vorgegebener ID einfügen (Client übernimmt IDs des Servers). */
  addWithId(p: Piece): void {
    const id = p.id;
    while (this.pieces.length < id) {
      const dummy = { ...p, id: this.pieces.length, alive: false };
      this.pieces.push(dummy);
    }
    const old = this.pieces[id];
    if (old && old.alive) this.unlink(old);
    this.pieces[id] = p;
    if (p.alive) this.insert(p);
    this.dirty.add(id);
    this.version++;
  }

  private insert(p: Piece): void {
    const x0 = cellOf(p.x - p.hx),
      x1 = cellOf(p.x + p.hx),
      z0 = cellOf(p.z - p.hz),
      z1 = cellOf(p.z + p.hz);
    for (let cz = z0; cz <= z1; cz++) for (let cx = x0; cx <= x1; cx++) this.cells[cellIndex(cx, cz)]!.push(p.id);
  }

  private unlink(p: Piece): void {
    const x0 = cellOf(p.x - p.hx),
      x1 = cellOf(p.x + p.hx),
      z0 = cellOf(p.z - p.hz),
      z1 = cellOf(p.z + p.hz);
    for (let cz = z0; cz <= z1; cz++)
      for (let cx = x0; cx <= x1; cx++) {
        const c = this.cells[cellIndex(cx, cz)]!;
        const i = c.indexOf(p.id);
        if (i >= 0) {
          c[i] = c[c.length - 1]!;
          c.pop();
        }
      }
  }

  remove(id: number): void {
    const p = this.pieces[id];
    if (!p || !p.alive) return;
    p.alive = false;
    p.hp = 0;
    this.unlink(p);
    this.dirty.add(id);
    this.version++;
  }

  setState(id: number, state: number): void {
    const p = this.pieces[id];
    if (!p) return;
    p.state = state;
    this.dirty.add(id);
    this.version++;
  }

  setHp(id: number, hp: number): void {
    const p = this.pieces[id];
    if (!p) return;
    p.hp = hp;
    this.dirty.add(id);
  }

  /** Ruft cb für jedes lebende Bauteil, dessen Rasterzellen den Bereich berühren (ohne Doppelte). */
  query(minX: number, minZ: number, maxX: number, maxZ: number, cb: (p: Piece) => void): void {
    this.nextStamp();
    const x0 = cellOf(minX),
      x1 = cellOf(maxX),
      z0 = cellOf(minZ),
      z1 = cellOf(maxZ);
    for (let cz = z0; cz <= z1; cz++)
      for (let cx = x0; cx <= x1; cx++) {
        const c = this.cells[cellIndex(cx, cz)]!;
        for (let k = 0; k < c.length; k++) {
          const id = c[k]!;
          if (!this.mark(id)) continue;
          const p = this.pieces[id]!;
          if (p.x + p.hx < minX || p.x - p.hx > maxX || p.z + p.hz < minZ || p.z - p.hz > maxZ) continue;
          cb(p);
        }
      }
  }

  /** Höchste begehbare Oberfläche unter den Füßen (Gelände, Böden, Rampen). */
  groundAt(x: number, z: number, r: number, feetY: number, step = STEP_HEIGHT): { h: number; piece: number } {
    let best = this.terrain.height(x, z),
      piece = -1;
    const lim = feetY + step + 0.001;
    const rr = r * 0.75;
    this.query(x - rr, z - rr, x + rr, z + rr, (p) => {
      if (!isSolid(p)) return;
      if (isRampLike(p.kind)) {
        if (x < p.x - p.hx - 0.05 || x > p.x + p.hx + 0.05 || z < p.z - p.hz - 0.05 || z > p.z + p.hz + 0.05) return;
        const h = rampHeight(p, x, z);
        if (h <= lim && h > best) {
          best = h;
          piece = p.id;
        }
        return;
      }
      const top = p.y + p.hy;
      if (top > lim || top <= best) return;
      const cx = Math.max(p.x - p.hx, Math.min(x, p.x + p.hx));
      const cz = Math.max(p.z - p.hz, Math.min(z, p.z + p.hz));
      if ((cx - x) ** 2 + (cz - z) ** 2 <= rr * rr) {
        best = top;
        piece = p.id;
      }
    });
    return { h: best, piece };
  }

  /** Niedrigste Unterkante über dem Kopf. */
  ceilingAt(x: number, z: number, r: number, feetY: number, headY: number): number {
    let best = Infinity;
    const rr = r * 0.7;
    this.query(x - rr, z - rr, x + rr, z + rr, (p) => {
      if (!isSolid(p)) return;
      let bottom = p.y - p.hy;
      if (isRampLike(p.kind)) {
        if (x < p.x - p.hx || x > p.x + p.hx || z < p.z - p.hz || z > p.z + p.hz) return;
        bottom = rampHeight(p, x, z) - 0.3;
      } else {
        const cx = Math.max(p.x - p.hx, Math.min(x, p.x + p.hx));
        const cz = Math.max(p.z - p.hz, Math.min(z, p.z + p.hz));
        if ((cx - x) ** 2 + (cz - z) ** 2 > rr * rr) return;
      }
      if (bottom > feetY + STEP_HEIGHT && bottom < best && bottom < headY + 2) best = bottom;
    });
    return best;
  }

  /**
   * Schiebt einen stehenden Zylinder aus Wänden heraus. Gibt zurück, ob etwas berührt wurde, und
   * schreibt die Kontaktnormale (XZ) in out.
   */
  pushOut(
    pos: { x: number; z: number },
    r: number,
    feetY: number,
    height: number,
    out: { nx: number; nz: number; piece: number; top: number },
  ): boolean {
    let hit = false;
    out.nx = 0;
    out.nz = 0;
    out.piece = -1;
    out.top = 0;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      this.query(pos.x - r, pos.z - r, pos.x + r, pos.z + r, (p) => {
        if (!isSolid(p)) return;
        let top: number;
        if (isRampLike(p.kind)) {
          const cx = Math.max(p.x - p.hx, Math.min(pos.x, p.x + p.hx));
          const cz = Math.max(p.z - p.hz, Math.min(pos.z, p.z + p.hz));
          const rh = rampHeight(p, cx, cz);
          if (rh <= feetY + STEP_HEIGHT || rh - 0.35 >= feetY + height) return;
          top = rh;
        } else {
          const bottom = p.y - p.hy;
          top = p.y + p.hy;
          if (top <= feetY + STEP_HEIGHT || bottom >= feetY + height - 0.02) return;
        }
        const minX = p.x - p.hx,
          maxX = p.x + p.hx,
          minZ = p.z - p.hz,
          maxZ = p.z + p.hz;
        const cx = Math.max(minX, Math.min(pos.x, maxX));
        const cz = Math.max(minZ, Math.min(pos.z, maxZ));
        let dx = pos.x - cx,
          dz = pos.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) return;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          dx /= d;
          dz /= d;
          pos.x = cx + dx * r;
          pos.z = cz + dz * r;
        } else {
          // Mittelpunkt im Quader: zur nächsten Seite hinaus
          const l = pos.x - minX,
            rr2 = maxX - pos.x,
            f = pos.z - minZ,
            b = maxZ - pos.z;
          const m = Math.min(l, rr2, f, b);
          if (m === l) {
            pos.x = minX - r;
            dx = -1;
            dz = 0;
          } else if (m === rr2) {
            pos.x = maxX + r;
            dx = 1;
            dz = 0;
          } else if (m === f) {
            pos.z = minZ - r;
            dx = 0;
            dz = -1;
          } else {
            pos.z = maxZ + r;
            dx = 0;
            dz = 1;
          }
        }
        out.nx += dx;
        out.nz += dz;
        if (out.piece < 0 || top > out.top) {
          out.piece = p.id;
          out.top = top;
        }
        hit = true;
        moved = true;
      });
      if (!moved) break;
    }
    const l = Math.hypot(out.nx, out.nz);
    if (l > 0) {
      out.nx /= l;
      out.nz /= l;
    }
    return hit;
  }

  /** Prüft, ob ein Quader (z. B. neues Bauteil) feste Teile schneidet. */
  boxBlocked(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, ignoreBuilt = false): boolean {
    let blocked = false;
    this.query(minX, minZ, maxX, maxZ, (p) => {
      if (blocked || !isSolid(p)) return;
      if (ignoreBuilt && p.team >= 0) return;
      if (p.kind === Kind.Tree && p.y + p.hy < minY) return;
      if (p.y + p.hy <= minY || p.y - p.hy >= maxY) return;
      blocked = true;
    });
    return blocked;
  }

  /** Strahl gegen Gelände und Bauteile. dx,dy,dz normiert. */
  raycast(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxD: number,
    hitTerrain = true,
    skip: (p: Piece) => boolean = () => false,
  ): RayHit {
    const res: RayHit = { t: maxD, piece: -2, nx: 0, ny: 1, nz: 0 };
    // Gelände
    if (hitTerrain) {
      const tt = this.raycastTerrain(ox, oy, oz, dx, dy, dz, maxD);
      if (tt < res.t) {
        res.t = tt;
        res.piece = -1;
        const n = this.terrain.normal(ox + dx * tt, oz + dz * tt, { x: 0, y: 1, z: 0 });
        res.nx = n.x;
        res.ny = n.y;
        res.nz = n.z;
      }
    }
    // Rasterlauf (2D-DDA)
    this.nextStamp();
    let cx = cellOf(ox),
      cz = cellOf(oz);
    const stepX = dx > 0 ? 1 : -1,
      stepZ = dz > 0 ? 1 : -1;
    const invX = Math.abs(dx) > 1e-9 ? 1 / Math.abs(dx) : Infinity;
    const invZ = Math.abs(dz) > 1e-9 ? 1 / Math.abs(dz) : Infinity;
    const gx = (cx - 1) * CELL,
      gz = (cz - 1) * CELL;
    let tMaxX = dx > 0 ? (gx + CELL - ox) * invX : (ox - gx) * invX;
    let tMaxZ = dz > 0 ? (gz + CELL - oz) * invZ : (oz - gz) * invZ;
    const tDX = CELL * invX,
      tDZ = CELL * invZ;
    for (let guard = 0; guard < 600; guard++) {
      if (cx < 0 || cz < 0 || cx >= GN || cz >= GN) break;
      const c = this.cells[cz * GN + cx]!;
      for (let k = 0; k < c.length; k++) {
        const id = c[k]!;
        if (!this.mark(id)) continue;
        const p = this.pieces[id]!;
        if (!isSolid(p) || skip(p)) continue;
        this.rayPiece(p, ox, oy, oz, dx, dy, dz, res);
      }
      const tNext = Math.min(tMaxX, tMaxZ);
      if (res.t <= tNext || tNext > maxD) break;
      if (tMaxX < tMaxZ) {
        cx += stepX;
        tMaxX += tDX;
      } else {
        cz += stepZ;
        tMaxZ += tDZ;
      }
    }
    return res;
  }

  private rayPiece(p: Piece, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, res: RayHit): void {
    if (isRampLike(p.kind)) {
      // Schräge Ebene durch die Rampe
      const H = 2 * p.hy;
      let ax = 0,
        az = 0,
        L = 1;
      switch (p.dir) {
        case 0:
          ax = 1;
          L = 2 * p.hx;
          break;
        case 1:
          az = 1;
          L = 2 * p.hz;
          break;
        case 2:
          ax = -1;
          L = 2 * p.hx;
          break;
        default:
          az = -1;
          L = 2 * p.hz;
      }
      // Ebene: y = y0 + s*(H/L), s = Abstand entlang (ax,az) vom unteren Rand
      const k = H / L;
      const sx0 = ax !== 0 ? (ax > 0 ? p.x - p.hx : p.x + p.hx) : 0;
      const sz0 = az !== 0 ? (az > 0 ? p.z - p.hz : p.z + p.hz) : 0;
      const y0 = p.y - p.hy;
      // f(t) = oy+dy t - y0 - k*((ox+dx t - sx0)*ax + (oz+dz t - sz0)*az)
      const f0 = oy - y0 - k * ((ox - sx0) * ax + (oz - sz0) * az);
      const f1 = dy - k * (dx * ax + dz * az);
      if (Math.abs(f1) < 1e-9) return;
      const t = -f0 / f1;
      if (t < 0 || t >= res.t) return;
      const hx = ox + dx * t,
        hz = oz + dz * t;
      if (hx < p.x - p.hx || hx > p.x + p.hx || hz < p.z - p.hz || hz > p.z + p.hz) return;
      res.t = t;
      res.piece = p.id;
      const nl = Math.hypot(k, 1);
      res.nx = (-ax * k) / nl;
      res.ny = 1 / nl;
      res.nz = (-az * k) / nl;
      if (f0 < 0) {
        res.nx = -res.nx;
        res.ny = -res.ny;
        res.nz = -res.nz;
      }
      return;
    }
    // Quader (Slab-Test)
    let tmin = 0,
      tmax = res.t,
      nAxis = -1,
      nSign = 0;
    const lo = [p.x - p.hx, p.y - p.hy, p.z - p.hz],
      hi = [p.x + p.hx, p.y + p.hy, p.z + p.hz],
      o = [ox, oy, oz],
      d = [dx, dy, dz];
    for (let a = 0; a < 3; a++) {
      const da = d[a]!,
        oa = o[a]!;
      if (Math.abs(da) < 1e-12) {
        if (oa < lo[a]! || oa > hi[a]!) return;
        continue;
      }
      let t1 = (lo[a]! - oa) / da,
        t2 = (hi[a]! - oa) / da,
        s = -1;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        s = 1;
      }
      if (t1 > tmin) {
        tmin = t1;
        nAxis = a;
        nSign = s;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return;
    }
    if (nAxis < 0) return; // Start innerhalb
    if (tmin < res.t) {
      res.t = tmin;
      res.piece = p.id;
      res.nx = nAxis === 0 ? nSign : 0;
      res.ny = nAxis === 1 ? nSign : 0;
      res.nz = nAxis === 2 ? nSign : 0;
    }
  }

  raycastTerrain(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxD: number): number {
    const T = this.terrain;
    const step = 1.5;
    let prevT = 0;
    let prevAbove = oy - T.height(ox, oz);
    if (prevAbove < 0) return 0;
    for (let t = step; t <= maxD + step; t += step) {
      const tt = Math.min(t, maxD);
      const x = ox + dx * tt,
        y = oy + dy * tt,
        z = oz + dz * tt;
      const above = y - T.height(x, z);
      if (above < 0) {
        // Halbierung
        let a = prevT,
          b = tt;
        for (let i = 0; i < 10; i++) {
          const m = (a + b) * 0.5;
          if (oy + dy * m - T.height(ox + dx * m, oz + dz * m) < 0) b = m;
          else a = m;
        }
        return a;
      }
      prevT = tt;
      prevAbove = above;
      if (tt >= maxD) break;
      // Über dem höchsten Gipfel und steigend: kein Treffer mehr möglich
      if (y > 140 && dy >= 0) break;
    }
    return Infinity;
  }

  /** Freie Sicht zwischen zwei Punkten? */
  lineOfSight(ax: number, ay: number, az: number, bx: number, by: number, bz: number): boolean {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az;
    const d = Math.hypot(dx, dy, dz);
    if (d < 0.01) return true;
    const h = this.raycast(ax, ay, az, dx / d, dy / d, dz / d, d);
    return h.piece === -2;
  }

  /** Geänderte IDs abholen (Darstellung). */
  takeDirty(): number[] {
    const out = [...this.dirty];
    this.dirty.clear();
    return out;
  }
}
