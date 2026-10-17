// Prüft die Bau-Vorlagen: fehlerfrei, deterministisch, alles erreichbar, Häuser bewohnbar, Arbeitsplätze vollständig.
import { describe, expect, it } from 'vitest';
import { LOTS } from '../src/data/lots';
import { HOUSEHOLDS, TOWNSFOLK } from '../src/data/people';
import { getDef } from '../src/world/defs';
import { buildTerrain, lotEntrance } from '../src/world/map';
import { findPath } from '../src/world/nav';
import { applyTemplate, buildAllLots, MODEL_HOMES, TEMPLATE_IDS, templateFits } from '../src/world/templates';
import { cellKey, rotLocal, World, type ObjInst } from '../src/world/world';

function fresh(): { w: World; errors: string[] } {
  const w = new World();
  buildTerrain(w);
  return { w, errors: buildAllLots(w) };
}

const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]] as const;

/** begehbare Nachbarzellen einer Grundfläche (wie nearTarget in sim/actions) */
function near(w: World, l: number, cells: [number, number][]): { x: number; z: number; l: number }[] {
  const own = new Set(cells.map(([x, z]) => cellKey(l, x, z)));
  const out: { x: number; z: number; l: number }[] = [];
  for (const [cx, cz] of cells)
    for (const [dx, dz] of N8) {
      const nx = cx + dx,
        nz = cz + dz;
      if (own.has(cellKey(l, nx, nz)) || !w.cellWalkable(l, nx, nz) || w.wallBetween(l, cx, cz, nx, nz)) continue;
      out.push({ x: nx + 0.5, z: nz + 0.5, l });
    }
  return out;
}

/** Zielzellen, die die Spiellogik für ein Objekt ansteuern würde */
function goalsFor(w: World, o: ObjInst): { x: number; z: number; l: number }[] {
  const d = getDef(o.def);
  if (d.slots?.length && !d.func?.includes('stairs')) {
    const out: { x: number; z: number; l: number }[] = [];
    d.slots.forEach((s, i) => {
      if (!w.slotFree(o, i)) return;
      if (s.kind === 'sit') {
        const a = w.seatAccess(o);
        if (a) out.push({ x: a[0], z: a[1], l: o.l });
      } else if (s.kind === 'sleep') {
        const [cx, cz] = w.centerOf(o);
        for (const [lx, lz] of [[0, d.d / 2 + 0.5], [d.w / 2 + 0.5, 0], [-d.w / 2 - 0.5, 0]] as const) {
          const [dx, dz] = rotLocal(lx, lz, o.r);
          const x = Math.floor(cx + dx),
            z = Math.floor(cz + dz);
          if (w.cellWalkable(o.l, x, z)) out.push({ x: x + 0.5, z: z + 0.5, l: o.l });
        }
      } else {
        const p = w.slotWorld(o, i)!;
        out.push({ x: p.x, z: p.z, l: o.l });
      }
    });
    return out;
  }
  if (d.mount === 'surface') {
    const base = w.objs.get(w.occ.get(cellKey(o.l, o.x, o.z)) ?? '');
    return base ? near(w, o.l, w.cellsOf(base)) : [];
  }
  if (d.mount === 'wall') {
    const cells = w.cellsOf(o);
    const free = cells.filter(([x, z]) => w.cellWalkable(o.l, x, z)).map(([x, z]) => ({ x: x + 0.5, z: z + 0.5, l: o.l }));
    return free.length ? free : near(w, o.l, cells);
  }
  return near(w, o.l, w.cellsOf(o));
}

function unreachable(w: World, lotId: string): string[] {
  const [ex, ez] = lotEntrance(lotId);
  const bad: string[] = [];
  for (const o of w.objsOnLot(lotId)) {
    const d = getDef(o.def);
    if (d.mount === 'opening' || (!d.func?.length && !d.slots?.length)) continue;
    const goals = goalsFor(w, o);
    const path = goals.length ? findPath(w, ex, ez, 0, goals, { allowLot: lotId, maxNodes: 200000 }) : null;
    if (!path) bad.push(`${o.def} @${o.x},${o.z},${o.l}`);
  }
  return bad;
}

const count = (w: World, lot: string, f: string): number => w.objsOnLot(lot).filter((o) => getDef(o.def).func?.includes(f as never)).length;
const sleepSlots = (w: World, lot: string): number =>
  w
    .objsOnLot(lot)
    .filter((o) => getDef(o.def).func?.some((f) => f === 'bed' || f === 'crib'))
    .reduce((n, o) => n + (getDef(o.def).slots?.filter((s) => s.kind === 'sleep').length ?? 0), 0);

function residents(lot: string): { people: number; pets: number } {
  const hh = HOUSEHOLDS.find((h) => h.lot === lot);
  const npc = TOWNSFOLK.filter((p) => p.home === lot).length;
  return { people: (hh?.members.length ?? 0) + npc, pets: hh?.pets?.length ?? 0 };
}

describe('Bau-Vorlagen', () => {
  const { w, errors } = fresh();

  it('baut alle Lots ohne Fehler', () => {
    expect(errors).toEqual([]);
    for (const lot of LOTS) expect(TEMPLATE_IDS).toContain(lot.template);
  });

  it('ist deterministisch', () => {
    const b = fresh().w;
    const snap = (x: World): string => JSON.stringify([[...x.objs.values()], [...x.walls], [...x.floors]]);
    expect(snap(b)).toBe(snap(w));
  });

  it.each(LOTS.map((l) => l.id))('alle Objekte auf %s sind vom Eingang erreichbar', (id) => {
    expect(unreachable(w, id)).toEqual([]);
  });

  it.each(LOTS.filter((l) => l.kind === 'home' && l.template !== 'empty').map((l) => l.id))('Haus %s ist bewohnbar', (id) => {
    for (const f of ['fridge', 'stove', 'sink', 'toilet', 'counter', 'trash', 'table', 'seat', 'sofa', 'tv', 'mailbox', 'mirror', 'door', 'window'])
      expect(count(w, id, f), `${id}: ${f}`).toBeGreaterThan(0);
    expect(count(w, id, 'shower') + count(w, id, 'bathtub')).toBeGreaterThan(0);
    const r = residents(id);
    expect(sleepSlots(w, id)).toBeGreaterThanOrEqual(Math.max(2, r.people));
    if (r.pets) {
      expect(count(w, id, 'petbowl')).toBeGreaterThan(0);
      expect(count(w, id, 'petbed')).toBeGreaterThan(0);
    }
  });

  it('mindestens zwei Häuser haben ein Obergeschoss mit Treppe', () => {
    const homes = LOTS.filter((l) => l.kind === 'home');
    expect(homes.filter((l) => count(w, l.id, 'stairs') > 0 && w.objsOnLot(l.id).some((o) => o.l === 1)).length).toBeGreaterThanOrEqual(2);
  });

  it('Arbeitsplätze haben ihre Funktionsobjekte', () => {
    const need: Record<string, string[]> = {
      'hv-cafe': ['register', 'espresso', 'toilet', 'table', 'seat'],
      'as-klinik': ['examtable', 'medcabinet', 'register', 'toilet'],
      'hv-radio': ['radiodesk', 'mixer', 'computer', 'coffee', 'toilet'],
      'hv-pier': ['fishingspot', 'bench', 'grill', 'workbench'],
      'sh-schule': ['blackboard', 'desk', 'toilet', 'bookshelf'],
      'as-laden': ['shelfshop', 'register', 'toilet'],
      'hv-markt': ['shelfshop', 'register'],
      'hv-bar': ['bar', 'dancefloor', 'jukebox', 'toilet'],
      'as-restaurant': ['register', 'stove', 'fridge', 'sink', 'table', 'toilet'],
      'as-fitness': ['treadmill', 'weights', 'punchbag', 'yogamat', 'shower', 'toilet'],
      'as-galerie': ['easel', 'piano', 'toilet'],
      'as-bibliothek': ['bookshelf', 'computer', 'chess', 'toilet'],
      'as-rathaus': ['computer', 'toilet'],
      'sh-park': ['bench', 'chess', 'grill'],
      'sh-spielplatz': ['swing', 'slide', 'bench', 'gardenbed'],
    };
    for (const [lot, fs] of Object.entries(need)) for (const f of fs) expect(count(w, lot, f), `${lot}: ${f}`).toBeGreaterThan(0);
    expect(count(w, 'hv-pier', 'fishingspot')).toBeGreaterThanOrEqual(3);
  });

  it('öffentliche Gebäude haben eine Tür', () => {
    for (const lot of LOTS.filter((l) => l.kind !== 'home' && !['sh-park', 'sh-spielplatz'].includes(l.id))) expect(count(w, lot.id, 'door'), lot.id).toBeGreaterThan(0);
  });

  it('Fertighäuser lassen sich auf passende Grundstücke setzen', () => {
    const v = fresh().w;
    for (const m of MODEL_HOMES) {
      const target = LOTS.find((l) => l.kind === 'home' && templateFits(m.id, l.id) && l.id === 'sh-6') ?? LOTS.find((l) => l.kind === 'home' && templateFits(m.id, l.id))!;
      const res = applyTemplate(v, target.id, m.id);
      expect(res.errors, `${m.id} auf ${target.id}`).toEqual([]);
      expect(unreachable(v, target.id), `${m.id} auf ${target.id}`).toEqual([]);
    }
    // erneutes Anwenden der Originalvorlage ist sauber
    expect(applyTemplate(v, 'sh-6').errors).toEqual([]);
    expect(v.objsOnLot('sh-6').length).toBe(1);
  });
});
