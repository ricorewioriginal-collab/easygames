/* Ortsschilder wie im Open-World-Krimi: beim Wechsel in ein anderes Viertel blendet unten rechts kurz der Name ein. */
export interface Area { id: string; name: string; sub: string }
const IN = (x: number, z: number, cx: number, cz: number, r: number) => (x - cx) ** 2 + (z - cz) ** 2 < r * r;

/** Viertel an einer Stelle der Stadt (Inseln übergibt der Aufrufer, wenn eine aktiv ist) */
export function areaAt(x: number, z: number): Area {
  if (x > 60 && x < 92 && Math.abs(z) < 8) return { id: 'bruecke', name: 'Regenbogenbrücke', sub: 'zwischen Innenstadt und Hochstadt' };
  if (x >= 92 && x < 125 && z > -34 && z < -8) return { id: 'meile', name: 'Laternenmeile', sub: 'Hochstadt' };
  if (x >= 92) return { id: 'hochstadt', name: 'Hochstadt', sub: 'Rainbow City' };
  if (x < -60) return { id: 'hafen', name: 'Hafen & Kai', sub: 'Rainbow City' };
  if (IN(x, z, -15, 18, 20)) return { id: 'plaza', name: 'Pride Plaza', sub: 'Innenstadt' };
  if (IN(x, z, 40, 40, 22)) return { id: 'park', name: 'Regenbogenpark', sub: 'Innenstadt' };
  return { id: 'innen', name: 'Innenstadt', sub: 'Rainbow City' };
}

/** Merkt sich das Viertel; meldet einen Wechsel erst, wenn man ein paar Sekunden dort ist (kein Flackern an Grenzen) */
export class AreaWatch {
  cur = '';
  private cand = '';
  private t = 0;
  update(dt: number, a: Area): Area | null {
    if (a.id === this.cur) { this.cand = ''; return null; }
    if (a.id !== this.cand) { this.cand = a.id; this.t = 0; }
    if ((this.t += dt) < 1.5) return null;
    const first = this.cur === ''; this.cur = a.id; this.cand = '';
    return first ? null : a;
  }
}
