import { describe, expect, it } from 'vitest';
import { OBJECTS } from '../src/data/objects';
import { PROPS } from '../src/data/props';
import { OF_BROKEN, OF_ON, objectGeometry, objectRaw, surfaceTop } from '../src/render/object-mesh';
import type { Raw } from '../src/render/geo-builder';
import { World } from '../src/world/world';
import { buildTerrain } from '../src/world/map';
import { buildAllLots } from '../src/world/templates';
import { LOTS } from '../src/data/lots';
import { FULL_VARIANT, buildLot, makeLotOut } from '../src/render/lot-builder';

/** Dreiecksbudget je Objekt (alle Materialgruppen zusammen) */
const TRI_BUDGET = 1500;

const finite = (r: Raw): boolean => {
  for (let i = 0; i < r.v * 3; i++) if (!Number.isFinite(r.p[i]!) || !Number.isFinite(r.n[i]!) || !Number.isFinite(r.c[i]!)) return false;
  return true;
};

describe('object-mesh', () => {
  const defs = [...OBJECTS, ...PROPS];
  it('baut jede Definition ohne NaN und im Dreiecksbudget', () => {
    let total = 0;
    let maxTris = 0;
    let maxId = '';
    for (const d of defs) {
      const nA = Math.max(1, d.colorsA?.length ?? 1);
      for (let ca = 0; ca < nA; ca++) {
        for (const flags of [0, OF_ON, OF_BROKEN]) {
          const r = objectRaw(d.id, ca, 0, flags);
          expect(finite(r.solid) && finite(r.glass) && finite(r.emis), `${d.id} NaN`).toBe(true);
          expect(r.solid.v % 3).toBe(0);
          expect(r.tris, `${d.id} Dreiecke`).toBeGreaterThan(0);
          expect(r.tris, `${d.id} Dreiecke`).toBeLessThanOrEqual(TRI_BUDGET);
          if (r.tris > maxTris) {
            maxTris = r.tris;
            maxId = d.id;
          }
        }
      }
      total += objectRaw(d.id).tris;
      // Bounding-Box plausibel: Grundfläche ungefähr im Raster, nicht unter dem Boden
      const r = objectRaw(d.id);
      expect(r.min[1], `${d.id} unter dem Boden`).toBeGreaterThan(-0.2);
      expect(r.max[1], `${d.id} zu hoch`).toBeLessThan(4);
      expect(Math.abs(r.min[0]), `${d.id} breiter als Grundfläche`).toBeLessThan(d.w / 2 + 0.6);
    }
    console.log(`Objekte: ${defs.length}, Dreiecke gesamt ${total}, Mittel ${(total / defs.length).toFixed(0)}, Maximum ${maxTris} (${maxId})`);
  });

  it('liefert gecachte Geometrie mit Gruppen', () => {
    const g1 = objectGeometry('tv-flimmerkiste', 0, 0, OF_ON);
    const g2 = objectGeometry('tv-flimmerkiste', 0, 0, OF_ON);
    expect(g1).toBe(g2);
    expect(g1.groups.length).toBeGreaterThanOrEqual(2); // solid + emissive (eingeschaltet)
    const off = objectGeometry('tv-flimmerkiste', 0, 0, 0);
    expect(off.groups.length).toBe(1);
    expect(g1.getAttribute('position').count).toBe(g1.getAttribute('color').count);
  });

  it('Abstellhöhe von Theken/Tischen ist plausibel', () => {
    for (const d of OBJECTS) {
      if (!d.func?.some((f) => f === 'counter' || f === 'table' || f === 'desk')) continue;
      const t = surfaceTop(d.id);
      expect(t, d.id).toBeGreaterThan(0.2);
      expect(t, d.id).toBeLessThan(1.3);
    }
  });

  it('baut alle Vorlagen-Grundstücke (alle Ansichten) ohne NaN', () => {
    const w = new World();
    buildTerrain(w);
    buildAllLots(w);
    const out = makeLotOut();
    let total = 0;
    for (const lot of LOTS) {
      for (const v of [FULL_VARIANT, { mode: 'cut' as const, level: 0, cx: 0.7, cz: 0.7 }, { mode: 'low' as const, level: 1, cx: 0, cz: 1 }]) {
        buildLot(w, lot, w.objsOnLot(lot.id), v, out);
        let ok = true;
        for (const b of [out.shell, out.indoor, out.glass, out.emis]) for (let i = 0; i < b.v * 3; i++) if (!Number.isFinite(b.p[i]!) || !Number.isFinite(b.n[i]!)) ok = false;
        expect(ok, lot.id).toBe(true);
        // Etagenmarken monoton
        expect(out.shellMarks[0]!).toBeLessThanOrEqual(out.shellMarks[1]!);
        expect(out.shellMarks[1]!).toBeLessThanOrEqual(out.shellMarks[2]!);
        if (v === FULL_VARIANT) total += (out.shell.v + out.indoor.v + out.glass.v + out.emis.v) / 3;
      }
      expect(out.picks.length).toBeGreaterThanOrEqual(0);
    }
    console.log(`Lots: Dreiecke gesamt ${Math.round(total)}`);
    expect(total).toBeLessThan(600000);
  }, 30000);
});
