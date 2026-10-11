// Landwirtschaft: Wachstum über Zeitstempel statt Dauer-Simulation.
// Jede Pflanze merkt sich, wann (Spielzeit in Sekunden) sie gesetzt wurde; die Stufe wird daraus berechnet,
// sobald ihr Chunk geladen ist. Die Stufe steht als Block-Id in den Welt-Änderungen und überlebt so das Speichern.
import { B, CROPS } from './blocks.js';
import { I } from './items.js';

export const STAGE_SECS = 90; // Sekunden Spielzeit je Wachstumsstufe (reif nach 4,5 Minuten)
export const MAX_CROPS = 4096;

export const cropStage = (t0, age) => Math.max(0, Math.min(CROPS.length - 1, Math.floor((age - t0) / STAGE_SECS)));
export const isCrop = t => CROPS.includes(t);

// Ernte: reif = Weizen + 1–2 Samen, unreif = Samen zurück
export function cropDrops(t, rnd = Math.random) {
  if (t === CROPS[CROPS.length - 1]) return [[I.WHEAT, 1], [I.SEEDS, 1 + Math.floor(rnd() * 2)]];
  return [[I.SEEDS, 1]];
}

const key = (x, y, z) => x + ',' + y + ',' + z;

export class Farm {
  constructor(saved) {
    this.plants = new Map();
    if (saved && typeof saved === 'object') for (const [k, t0] of Object.entries(saved)) {
      const p = k.split(',').map(Number);
      if (p.length === 3 && p.every(Number.isInteger) && Number.isFinite(t0) && this.plants.size < MAX_CROPS) this.plants.set(k, t0);
    }
  }
  plant(x, y, z, age) { if (this.plants.size >= MAX_CROPS) return false; this.plants.set(key(x, y, z), age); return true; }
  remove(x, y, z) { this.plants.delete(key(x, y, z)); }

  // Stufen für geladene Pflanzen nachziehen; Rückgabe: Anzahl geänderter Blöcke
  update(world, age) {
    let n = 0;
    for (const [k, t0] of this.plants) {
      const [x, y, z] = k.split(',').map(Number);
      if (!world.isLoaded(x, z)) continue;
      const cur = world.getBlock(x, y, z);
      if (!isCrop(cur)) { this.plants.delete(k); continue; }            // abgeerntet oder überbaut
      if (world.getBlock(x, y - 1, z) !== B.FARMLAND) {                    // Boden weg: Pflanze vergeht
        world.setBlock(x, y, z, B.AIR); this.plants.delete(k); n++; continue;
      }
      const want = CROPS[cropStage(t0, age)];
      if (want !== cur && world.setBlock(x, y, z, want)) n++;
    }
    return n;
  }

  serialize() { return Object.fromEntries(this.plants); }
}
