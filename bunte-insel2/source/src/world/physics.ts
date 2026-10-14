/* Einfache, robuste Spielphysik ohne Three.js: Gelände-Höhe + Körper (Quader, Zylinder, Rampen) mit Ober-/Unterkante.
   Figuren sind senkrechte Zylinder. Was niedrig genug ist (Stufe), wird betreten; Höheres blockiert seitlich. */

export type SolidKind = 'box' | 'circle' | 'ramp';
export interface Solid {
  id: number;
  kind: SolidKind;
  x: number; z: number;
  hw: number; hd: number;   // halbe Breite/Tiefe (box/ramp)
  r: number;                // Radius (circle)
  rot: number;              // Drehung um y
  y0: number; y1: number;   // Unter-/Oberkante (bei Rampe: Höhe am -hd-Ende = y0, am +hd-Ende = y1)
  tag: string;              // Besitzer (Welt-ID), zum Entladen
  noWalk?: boolean;         // Oberseite nicht begehbar (z. B. Baumkrone, Zaun)
  water?: boolean;          // Wasserbecken: Fläche zählt als Wasser bis y1
}
export interface GroundHit { y: number; solid: Solid | null; water: number }

const CELL = 16;
export const STEP_UP = 0.55;

export class Physics {
  private cells = new Map<number, Solid[]>();
  private all = new Map<number, Solid>();
  private nextId = 1;
  terrain: (x: number, z: number) => number = () => -6;
  seaLevel = 0;

  private key(cx: number, cz: number): number { return (cx + 4096) * 8192 + (cz + 4096); }
  private bounds(s: Solid): [number, number, number, number] {
    const r = s.kind === 'circle' ? s.r : Math.hypot(s.hw, s.hd);
    return [s.x - r, s.z - r, s.x + r, s.z + r];
  }
  add(p: Omit<Solid, 'id'>): Solid {
    const s: Solid = { ...p, id: this.nextId++ };
    this.all.set(s.id, s);
    const [x0, z0, x1, z1] = this.bounds(s);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++)
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const k = this.key(cx, cz);
        let a = this.cells.get(k);
        if (!a) { a = []; this.cells.set(k, a); }
        a.push(s);
      }
    return s;
  }
  box(tag: string, x: number, z: number, w: number, d: number, y0: number, y1: number, rot = 0, extra?: Partial<Solid>): Solid {
    return this.add({ kind: 'box', x, z, hw: w / 2, hd: d / 2, r: 0, rot, y0, y1, tag, ...extra });
  }
  circle(tag: string, x: number, z: number, r: number, y0: number, y1: number, extra?: Partial<Solid>): Solid {
    return this.add({ kind: 'circle', x, z, hw: 0, hd: 0, r, rot: 0, y0, y1, tag, ...extra });
  }
  /** Rampe: Länge d entlang der Drehrichtung, steigt von yA (Anfang) auf yB (Ende). */
  ramp(tag: string, x: number, z: number, w: number, d: number, yA: number, yB: number, rot = 0): Solid {
    return this.add({ kind: 'ramp', x, z, hw: w / 2, hd: d / 2, r: 0, rot, y0: yA, y1: yB, tag });
  }
  remove(s: Solid): void {
    if (!this.all.delete(s.id)) return;
    const [x0, z0, x1, z1] = this.bounds(s);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++)
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const a = this.cells.get(this.key(cx, cz));
        if (a) { const i = a.indexOf(s); if (i >= 0) a.splice(i, 1); }
      }
  }
  removeTag(tag: string): number {
    let n = 0;
    for (const s of [...this.all.values()]) if (s.tag === tag) { this.remove(s); n++; }
    return n;
  }
  get count(): number { return this.all.size; }
  near(x: number, z: number, r: number): Solid[] {
    const out = new Set<Solid>();
    for (let cx = Math.floor((x - r) / CELL); cx <= Math.floor((x + r) / CELL); cx++)
      for (let cz = Math.floor((z - r) / CELL); cz <= Math.floor((z + r) / CELL); cz++) {
        const a = this.cells.get(this.key(cx, cz));
        if (a) for (const s of a) out.add(s);
      }
    return [...out];
  }
  /** Lokale Koordinaten eines Punktes im Körper. */
  private local(s: Solid, x: number, z: number): [number, number] {
    const dx = x - s.x, dz = z - s.z, c = Math.cos(-s.rot), sn = Math.sin(-s.rot);
    return [dx * c + dz * sn, -dx * sn + dz * c];
  }
  private inside(s: Solid, x: number, z: number, pad = 0): boolean {
    if (s.kind === 'circle') return Math.hypot(x - s.x, z - s.z) <= s.r + pad;
    const [lx, lz] = this.local(s, x, z);
    return Math.abs(lx) <= s.hw + pad && Math.abs(lz) <= s.hd + pad;
  }
  /** Oberkante an einem Punkt (Rampe: interpoliert). */
  topAt(s: Solid, x: number, z: number): number {
    if (s.kind !== 'ramp') return s.y1;
    const [, lz] = this.local(s, x, z);
    const t = Math.max(0, Math.min(1, (lz + s.hd) / (2 * s.hd)));
    return s.y0 + (s.y1 - s.y0) * t;
  }
  /** Boden unter den Füßen: Gelände oder höchste begehbare Oberfläche, die man erreichen kann. */
  ground(x: number, z: number, feetY = Infinity, stepUp = STEP_UP): GroundHit {
    let y = this.terrain(x, z), solid: Solid | null = null, water = -Infinity;
    for (const s of this.near(x, z, 0)) {
      if (!this.inside(s, x, z)) continue;
      if (s.water) { water = Math.max(water, s.y1); continue; }
      if (s.noWalk) continue;
      const top = this.topAt(s, x, z);
      if (top <= feetY + stepUp && top > y) { y = top; solid = s; }
    }
    if (y < this.seaLevel) water = Math.max(water, this.seaLevel);
    return { y, solid, water };
  }
  /** Bewegt einen Zylinder (Radius r, Höhe h, Füße bei y) und schiebt ihn aus blockierenden Körpern heraus. */
  move(p: { x: number; y: number; z: number }, dx: number, dz: number, r: number, h: number, stepUp = STEP_UP): { hit: boolean; nx: number; nz: number } {
    let hit = false, nx = 0, nz = 0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (r * 0.8)));
    for (let k = 0; k < steps; k++) {
      const ox = p.x, oz = p.z;
      p.x += dx / steps; p.z += dz / steps;
      // Steile Geländekante (Klippe): zurücksetzen
      const tNew = this.terrain(p.x, p.z);
      if (tNew > p.y + stepUp + 0.25 && tNew > this.terrain(ox, oz) + 0.35) {
        const tx = this.terrain(p.x, oz), tz = this.terrain(ox, p.z);
        if (tx <= p.y + stepUp) p.z = oz; else if (tz <= p.y + stepUp) p.x = ox; else { p.x = ox; p.z = oz; }
        hit = true;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (const s of this.near(p.x, p.z, r + 1)) {
          if (s.kind === 'ramp' || s.water) continue;
          const top = s.y1;
          if (p.y >= top - stepUp && !s.noWalk) continue;      // drauf oder Stufe
          if (p.y + h <= s.y0) continue;                       // darunter durch
          if (s.kind === 'circle') {
            const ddx = p.x - s.x, ddz = p.z - s.z, d = Math.hypot(ddx, ddz), min = s.r + r;
            if (d < min) {
              const ux = d > 1e-5 ? ddx / d : 1, uz = d > 1e-5 ? ddz / d : 0;
              p.x = s.x + ux * min; p.z = s.z + uz * min; hit = true; nx = ux; nz = uz;
            }
          } else {
            const [lx, lz] = this.local(s, p.x, p.z);
            const cx = Math.max(-s.hw, Math.min(s.hw, lx)), cz = Math.max(-s.hd, Math.min(s.hd, lz));
            let ex = lx - cx, ez = lz - cz, d = Math.hypot(ex, ez);
            if (d >= r) continue;
            let pushX: number, pushZ: number;
            if (d > 1e-5) { pushX = ex / d * (r - d); pushZ = ez / d * (r - d); }
            else { // Mittelpunkt im Körper: kürzester Weg hinaus
              const px = s.hw - Math.abs(lx), pz = s.hd - Math.abs(lz);
              if (px < pz) { pushX = (lx < 0 ? -1 : 1) * (px + r); pushZ = 0; } else { pushX = 0; pushZ = (lz < 0 ? -1 : 1) * (pz + r); }
              ex = pushX; ez = pushZ; d = Math.hypot(ex, ez) || 1;
            }
            const c = Math.cos(s.rot), sn = Math.sin(s.rot);
            const wx = pushX * c + pushZ * sn, wz = -pushX * sn + pushZ * c;
            p.x += wx; p.z += wz; hit = true;
            const wl = Math.hypot(wx, wz) || 1; nx = wx / wl; nz = wz / wl;
          }
        }
      }
    }
    return { hit, nx, nz };
  }
  /** Sichtlinie für die Kamera: erster blockierender Punkt auf einer Strecke (grob, in Schritten). */
  rayBlock(ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
    const L = Math.hypot(bx - ax, by - ay, bz - az), n = Math.max(2, Math.ceil(L / 0.6));
    for (let i = 1; i <= n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
      if (this.terrain(x, z) > y - 0.3) return Math.max(0, t - 1 / n);
      for (const s of this.near(x, z, 0)) {
        if (s.kind === 'ramp' || s.water || s.noWalk) continue;
        if (y > s.y0 && y < s.y1 && this.inside(s, x, z, 0.2) && s.y1 - s.y0 > 1.2) return Math.max(0, t - 1 / n);
      }
    }
    return 1;
  }
}
