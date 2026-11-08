/** Einfache Kollision für die Spielfigur: Kreise (Bäume, Felsen) und gedrehte Quader (Häuser, Stege) in einem Raster */
export interface Circle { k: 'c'; x: number; z: number; r: number }
export interface Box { k: 'b'; x: number; z: number; hx: number; hz: number; rot: number; top: number; cos: number; sin: number }
type Shape = Circle | Box;

const G = 16;
export class Colliders {
  private grid = new Map<string, Shape[]>();
  readonly boxes: Box[] = [];

  private cellsFor(x: number, z: number, r: number, f: (k: string) => void) {
    for (let i = Math.floor((x - r) / G); i <= Math.floor((x + r) / G); i++) for (let j = Math.floor((z - r) / G); j <= Math.floor((z + r) / G); j++) f(i + ',' + j);
  }
  private add(s: Shape, r: number) {
    this.cellsFor(s.x, s.z, r, (k) => {
      let a = this.grid.get(k);
      if (!a) this.grid.set(k, (a = []));
      a.push(s);
    });
  }
  circle(x: number, z: number, r: number) {
    this.add({ k: 'c', x, z, r }, r);
  }
  /** Quader mit Mittelpunkt, halber Breite/Tiefe, Drehung um y und Oberkante (darüber kann man stehen) */
  box(x: number, z: number, hx: number, hz: number, rot = 0, top = 99) {
    const b: Box = { k: 'b', x, z, hx, hz, rot, top, cos: Math.cos(rot), sin: Math.sin(rot) };
    this.boxes.push(b);
    this.add(b, Math.hypot(hx, hz));
  }
  clear() {
    this.grid.clear();
    this.boxes.length = 0;
  }
  /** Schiebt einen Kreis (Spielfigur) aus allen Hindernissen; y = Fußhöhe */
  resolve(p: { x: number; z: number }, r: number, y: number): boolean {
    const near = new Set<Shape>();
    this.cellsFor(p.x, p.z, r, (k) => this.grid.get(k)?.forEach((s) => near.add(s)));
    let hit = false;
    for (const s of near) {
      if (s.k === 'c') {
        const dx = p.x - s.x,
          dz = p.z - s.z,
          d = Math.hypot(dx, dz),
          m = s.r + r;
        if (d < m && d > 1e-5) {
          p.x = s.x + (dx / d) * m;
          p.z = s.z + (dz / d) * m;
          hit = true;
        }
      } else {
        if (y >= s.top - 0.05) continue;
        // in lokale Koordinaten
        const dx = p.x - s.x,
          dz = p.z - s.z;
        const lx = dx * s.cos - dz * s.sin,
          lz = dx * s.sin + dz * s.cos;
        const cx = Math.max(-s.hx, Math.min(s.hx, lx)),
          cz = Math.max(-s.hz, Math.min(s.hz, lz));
        let ox = lx - cx,
          oz = lz - cz;
        const d = Math.hypot(ox, oz);
        if (d >= r) continue;
        hit = true;
        let nx: number, nz: number;
        if (d > 1e-5) {
          ox = (ox / d) * r;
          oz = (oz / d) * r;
          nx = cx + ox;
          nz = cz + oz;
        } else {
          // Mittelpunkt im Quader: zur nächsten Kante hinaus
          const ex = s.hx - Math.abs(lx),
            ez = s.hz - Math.abs(lz);
          if (ex < ez) {
            nx = Math.sign(lx || 1) * (s.hx + r);
            nz = lz;
          } else {
            nx = lx;
            nz = Math.sign(lz || 1) * (s.hz + r);
          }
        }
        p.x = s.x + nx * s.cos + nz * s.sin;
        p.z = s.z - nx * s.sin + nz * s.cos;
      }
    }
    return hit;
  }
  /** Begehbare Oberkante (Stege, Terrassen) unter einem Punkt, sonst -Infinity */
  floorAt(x: number, z: number, y: number): number {
    let best = -Infinity;
    this.cellsFor(x, z, 0.1, (k) =>
      this.grid.get(k)?.forEach((s) => {
        if (s.k !== 'b' || s.top > 50) return;
        const dx = x - s.x,
          dz = z - s.z,
          lx = dx * s.cos - dz * s.sin,
          lz = dx * s.sin + dz * s.cos;
        if (Math.abs(lx) <= s.hx && Math.abs(lz) <= s.hz && s.top <= y + 0.6) best = Math.max(best, s.top);
      }),
    );
    return best;
  }
  /** Abstand eines Strahls (Kamera) bis zum ersten Quader */
  rayBoxes(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxD: number): number {
    let best = maxD;
    for (const b of this.boxes) {
      if (b.top > 50 && Math.hypot(b.x - ox, b.z - oz) > maxD + Math.hypot(b.hx, b.hz)) continue;
      if (b.top <= 50) continue; // flache Stege ignorieren
      const lx = (ox - b.x) * b.cos - (oz - b.z) * b.sin,
        lz = (ox - b.x) * b.sin + (oz - b.z) * b.cos;
      const ldx = dx * b.cos - dz * b.sin,
        ldz = dx * b.sin + dz * b.cos;
      let t0 = 0,
        t1 = best;
      for (const [o, d, h] of [
        [lx, ldx, b.hx],
        [lz, ldz, b.hz],
      ]) {
        if (Math.abs(d) < 1e-6) {
          if (Math.abs(o) > h) {
            t0 = 1e9;
            break;
          }
          continue;
        }
        let a = (-h - o) / d,
          c = (h - o) / d;
        if (a > c) [a, c] = [c, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, c);
      }
      if (t0 <= t1 && t0 < best && oy + dy * t0 < 7) best = Math.max(0.3, t0 - 0.2);
    }
    return best;
  }
}
