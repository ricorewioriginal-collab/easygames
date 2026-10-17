// Bau-/Kaufmodus: Befehle, Geld, Rückgängig/Wiederholen, Prüfungen.
import { beforeAll, describe, expect, it } from 'vitest';
import { lotById, type LotDef } from '../src/data/lots';
import { History } from '../src/build/history';
import { execute, planDeleteWalls, planFloor, planMove, planOpening, planPaint, planPlace, planRoom, planSell, planTemplate, planWalls, lineEdges, RESALE, WALL_COST, type Ctx } from '../src/build/ops';
import { createGame, moveHousehold } from '../src/sim/setup';
import type { Game } from '../src/sim/game';
import { lotData } from '../src/sim/save';
import { buyable, getDef } from '../src/world/defs';
import { cellKey, edgeKey } from '../src/world/world';

let g: Game;
let lot: LotDef;
let hh: string;
const ctx = (): Ctx => ({ g, hh, lot });
const funds = (): number => g.hhs.get(hh)!.funds;
const state = (): string => JSON.stringify(lotData(g, lot.id), (_k, v) => (v && typeof v === 'object' && 'st' in v ? { ...v, st: undefined } : v));

beforeAll(() => {
  g = createGame({ seed: 7 });
  hh = g.activeHh!;
  // leeres Grundstück für reproduzierbare Tests
  const r = moveHousehold(g, hh, 'sh-6', false);
  expect(r).toBe(true);
  lot = lotById('sh-6')!;
  g.hhs.get(hh)!.funds = 50000;
  g.settings.creative = false;
}, 60000);

describe('Wände', () => {
  it('bauen, rückgängig, wiederholen – Welt und Geld exakt', () => {
    const hist = new History();
    const before = state();
    const f0 = funds();
    let buildEvents = 0;
    const off = g.bus.on('build', (e) => (buildEvents += e.kind === 'wall' ? e.n : 0));
    const edges = lineEdges(lot.x + 3, lot.z + 3, lot.x + 7, lot.z + 3);
    expect(edges.length).toBe(4);
    const plan = planWalls(ctx(), 0, edges, 0);
    expect(plan.ok).toBe(true);
    expect(plan.cost).toBe(4 * WALL_COST[0]);
    const r = execute(ctx(), plan);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    hist.push(r.cmd);
    expect(g.world.walls.has(edgeKey(0, lot.x + 3, lot.z + 3, 0))).toBe(true);
    expect(funds()).toBe(f0 - 4 * WALL_COST[0]);
    expect(g.world.modified.has(lot.id)).toBe(true);
    expect(buildEvents).toBe(4);
    const after = state();

    expect(hist.undo()?.res).toBe(true);
    expect(state()).toBe(before);
    expect(funds()).toBe(f0);
    expect(hist.redo()?.res).toBe(true);
    expect(state()).toBe(after);
    expect(funds()).toBe(f0 - 4 * WALL_COST[0]);

    // abreißen (Erstattung) und rückgängig
    const del = execute(ctx(), planDeleteWalls(ctx(), 0, edges.slice(0, 2)));
    expect(del.ok).toBe(true);
    expect(funds()).toBe(f0 - 2 * WALL_COST[0]);
    if (del.ok) hist.push(del.cmd);
    hist.undo();
    expect(state()).toBe(after);
    hist.undo();
    expect(state()).toBe(before);
    expect(funds()).toBe(f0);
    off();
  });

  it('außerhalb des Grundstücks wird abgelehnt', () => {
    const p = planWalls(ctx(), 0, lineEdges(lot.x - 6, lot.z - 3, lot.x - 2, lot.z - 3), 0);
    expect(p.ok).toBe(false);
    expect(p.reason).toMatch(/Grundstück/);
    expect(execute(ctx(), p).ok).toBe(false);
    const o = planPlace(ctx(), buyable().find((d) => d.mount !== 'opening' && d.mount !== 'wall' && d.mount !== 'surface')!.id, lot.x - 5, lot.z - 5, 0, 0);
    expect(o.ok).toBe(false);
    expect(o.reason).toBe('Außerhalb des Grundstücks');
  });

  it('Wände streichen ist rückgängig machbar', () => {
    const hist = new History();
    const edges = lineEdges(lot.x + 3, lot.z + 8, lot.x + 5, lot.z + 8);
    const r = execute(ctx(), planWalls(ctx(), 0, edges, 0));
    if (!r.ok) throw new Error(r.reason);
    hist.push(r.cmd);
    const mid = state();
    const p = execute(ctx(), planPaint(ctx(), 0, edges, 1, 5));
    if (!p.ok) throw new Error(p.reason);
    hist.push(p.cmd);
    expect(g.world.walls.get(edgeKey(0, lot.x + 3, lot.z + 8, 0))!.b).toBe(5);
    hist.undo();
    expect(state()).toBe(mid);
    hist.undo();
  });
});

describe('Raum und Boden', () => {
  it('Raumwerkzeug legt Boden und umlaufende Wände', () => {
    const f0 = funds();
    const before = state();
    const x0 = lot.x + 2,
      z0 = lot.z + 2;
    const plan = planRoom(ctx(), 0, x0, z0, x0 + 3, z0 + 2, 1, 2);
    expect(plan.ok).toBe(true);
    const r = execute(ctx(), plan);
    if (!r.ok) throw new Error(r.reason);
    for (let z = z0; z <= z0 + 2; z++) for (let x = x0; x <= x0 + 3; x++) expect(g.world.floors.get(cellKey(0, x, z))).toBe(1);
    // 2·4 + 2·3 = 14 Wände
    let n = 0;
    for (let x = x0; x <= x0 + 3; x++) n += +g.world.walls.has(edgeKey(0, x, z0, 0)) + +g.world.walls.has(edgeKey(0, x, z0 + 3, 0));
    for (let z = z0; z <= z0 + 2; z++) n += +g.world.walls.has(edgeKey(0, x0, z, 1)) + +g.world.walls.has(edgeKey(0, x0 + 4, z, 1));
    expect(n).toBe(14);
    // Innenseite der oberen Wand ist Seite B
    expect(g.world.walls.get(edgeKey(0, x0, z0, 0))!.b).toBe(2);
    expect(funds()).toBe(f0 - 14 * 70 - 12 * 10);
    r.cmd.undo();
    expect(state()).toBe(before);
    expect(funds()).toBe(f0);
  });

  it('Obergeschoss braucht Halt', () => {
    const p = planFloor(ctx(), 1, lot.x + 10, lot.z + 10, lot.x + 11, lot.z + 11, 1);
    expect(p.ok).toBe(false);
    expect(p.reason).toMatch(/Halt/);
  });
});

describe('Kaufen und Verkaufen', () => {
  const sofa = (): string => buyable().find((d) => d.func?.includes('sofa'))!.id;

  it('kaufen, verschieben, verkaufen und alles rückgängig', () => {
    const hist = new History();
    const f0 = funds();
    const before = state();
    let bought = 0;
    const off = g.bus.on('buy', (e) => (bought += e.price));
    const def = getDef(sofa());
    const plan = planPlace(ctx(), def.id, lot.x + 6, lot.z + 6, 0, 0, 1);
    expect(plan.ok).toBe(true);
    const r = execute(ctx(), plan);
    if (!r.ok) throw new Error(r.reason);
    hist.push(r.cmd);
    expect(funds()).toBe(f0 - def.price);
    expect(bought).toBe(def.price);
    const o = [...g.world.objs.values()].find((x) => x.lot === lot.id && x.def === def.id)!;
    expect(o.ca).toBe(1);
    const afterBuy = state();
    // Doppelt belegen geht nicht
    expect(planPlace(ctx(), def.id, lot.x + 6, lot.z + 6, 0, 0).ok).toBe(false);

    const mv = execute(ctx(), planMove(ctx(), o.id, lot.x + 8, lot.z + 9, 0, 2));
    if (!mv.ok) throw new Error(mv.reason);
    hist.push(mv.cmd);
    expect(g.world.objs.get(o.id)!.x).toBe(lot.x + 8);
    expect(funds()).toBe(f0 - def.price);

    const sell = execute(ctx(), planSell(ctx(), o.id));
    if (!sell.ok) throw new Error(sell.reason);
    hist.push(sell.cmd);
    expect(g.world.objs.has(o.id)).toBe(false);
    expect(funds()).toBe(f0 - def.price + Math.round(def.price * RESALE));

    hist.undo();
    expect(g.world.objs.get(o.id)!.x).toBe(lot.x + 8);
    expect(funds()).toBe(f0 - def.price);
    hist.undo();
    expect(state()).toBe(afterBuy);
    hist.undo();
    expect(state()).toBe(before);
    expect(funds()).toBe(f0);
    off();
  });

  it('zu wenig Geld blockiert den Kauf, Kreativmodus ist kostenlos', () => {
    const h = g.hhs.get(hh)!;
    const keep = h.funds;
    h.funds = 10;
    const def = getDef(sofa());
    const r = execute(ctx(), planPlace(ctx(), def.id, lot.x + 6, lot.z + 6, 0, 0));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Nicht genug Geld/);
    expect(h.funds).toBe(10);
    expect(g.world.objsOnLot(lot.id).some((o) => o.def === def.id)).toBe(false);
    g.settings.creative = true;
    const c = execute(ctx(), planPlace(ctx(), def.id, lot.x + 6, lot.z + 6, 0, 0));
    expect(c.ok).toBe(true);
    expect(h.funds).toBe(10);
    if (c.ok) c.cmd.undo();
    expect(h.funds).toBe(10);
    g.settings.creative = false;
    h.funds = keep;
  });

  it('Tür in eine Wand setzen', () => {
    const edges = lineEdges(lot.x + 3, lot.z + 5, lot.x + 6, lot.z + 5);
    const w = execute(ctx(), planWalls(ctx(), 0, edges, 0));
    if (!w.ok) throw new Error(w.reason);
    const door = buyable().find((d) => d.cat === 'door')!;
    expect(planOpening(ctx(), door.id, lot.x + 3, lot.z + 9, 0, 0, 0).ok).toBe(false);
    const d = execute(ctx(), planOpening(ctx(), door.id, lot.x + 4, lot.z + 5, 0, 0, 0));
    if (!d.ok) throw new Error(d.reason);
    expect(g.world.openings.has(edgeKey(0, lot.x + 4, lot.z + 5, 0))).toBe(true);
    d.cmd.undo();
    w.cmd.undo();
  });
});

describe('Fertighäuser', () => {
  it('Vorlage anwenden ist rückgängig machbar', () => {
    const before = state();
    const f0 = funds();
    const p = planTemplate(ctx(), 'home-bungalow', 'Sonnendeck');
    expect(p.ok).toBe(true);
    expect(p.cost).toBeGreaterThan(0);
    const r = execute(ctx(), p);
    if (!r.ok) throw new Error(r.reason);
    expect(g.world.objsOnLot(lot.id).length).toBeGreaterThan(10);
    expect(funds()).toBe(f0 - p.cost);
    // alle Figuren des Haushalts stehen begehbar
    for (const s of g.members(hh)) if (g.lotOf(s) === lot.id) expect(g.world.cellWalkable(s.l, Math.floor(s.x), Math.floor(s.z))).toBe(true);
    r.cmd.undo();
    expect(state()).toBe(before);
    expect(funds()).toBe(f0);
    expect(r.cmd.redo()).toBe(true);
    expect(funds()).toBe(f0 - p.cost);
    r.cmd.undo();
  });
});
