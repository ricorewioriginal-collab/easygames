import { Terrain, setTerrain } from '../shared/src/terrain';

let t: Terrain | null = null;
/** Eine Insel für alle Tests (Berechnung dauert ~2 s) */
export function sharedTerrain(): Terrain {
  if (!t) {
    t = new Terrain();
    setTerrain(t);
  }
  return t;
}

/** Flache Testwelt auf Höhe h */
export function flatTerrain(h = 10): Terrain {
  const n = sharedTerrain().h.length;
  return new Terrain(new Float32Array(n).fill(h));
}
