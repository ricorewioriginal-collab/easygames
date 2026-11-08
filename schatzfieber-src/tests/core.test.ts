import { describe, it, expect } from 'vitest';
import { DUNGEONS, ITEMS, SHOP, item } from '../src/core/data';
import { NPCS } from '../src/core/npcs';
import { Puzzle } from '../src/core/puzzle';
import * as S from '../src/core/state';
import type { Gender, Pref } from '../src/core/types';
import { height, POIS, LAGOON } from '../src/world/island';

const player = (gender: Gender, pref: Pref) => ({ name: 'Test', gender, pref, look: NPCS[0].look });

/** Breitensuche (Sokoban-Stil: Zustand = Kisten + Tore, Spielfigur als erreichbare Fläche):
 *  Ist jeder Rätselort mit Schieben, Hebeln, Schloss, Lianen und Altar bis zur Amulett-Truhe lösbar? */
function solvable(p: Puzzle): boolean {
  const [sx, sy] = p.start();
  const target = p.cells('T').concat(p.cells('Z'));
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const seen = new Set<string>();
  const q: { x: number; y: number; crates: string[]; open: string[] }[] = [{ x: sx, y: sy, crates: [...p.crates], open: [...p.open] }];
  const near = (cells: [number, number][], reach: Set<string>) =>
    cells.some(([cx, cy]) => D.some(([dx, dy]) => reach.has(Puzzle.key(cx + dx, cy + dy))));
  while (q.length) {
    const s = q.shift()!;
    p.crates = new Set(s.crates);
    p.open = new Set(s.open);
    // erreichbare Fläche; Rätselelemente in Reichweite lösen, bis sich nichts mehr ändert
    let reach = new Set<string>();
    for (let changed = true; changed; ) {
      reach = new Set([Puzzle.key(s.x, s.y)]);
      const st = [[s.x, s.y]];
      while (st.length) {
        const [x, y] = st.pop()!;
        for (const [dx, dy] of D) {
          const k = Puzzle.key(x + dx, y + dy);
          if (!reach.has(k) && !p.solid(x + dx, y + dy)) {
            reach.add(k);
            st.push([x + dx, y + dy]);
          }
        }
      }
      const before = p.open.size;
      if (near(p.cells('K'), reach)) p.tryCode(p.def.code!);
      if (near(p.cells('Q'), reach)) p.activateAltar();
      for (const v of p.cells('V')) if (near([v], reach)) p.cut(v[0], v[1]);
      if (p.def.leverOrder && '1234'.split('').every((c) => near(p.cells(c), reach))) {
        p.levers = [];
        for (const n of p.def.leverOrder) p.pull(n);
      }
      changed = p.open.size !== before;
    }
    if (near(target, reach)) return true;
    const key = [...reach].sort()[0] + '|' + [...p.crates].sort().join(';') + '|' + [...p.open].sort().join(';');
    if (seen.has(key)) continue;
    seen.add(key);
    const crates = [...p.crates],
      open = [...p.open];
    for (const c of crates) {
      const [cx, cy] = c.split(',').map(Number);
      for (const [dx, dy] of D) {
        if (!reach.has(Puzzle.key(cx - dx, cy - dy))) continue;
        p.crates = new Set(crates);
        p.open = new Set(open);
        if (p.push(cx, cy, dx, dy).moved) q.push({ x: cx - dx, y: cy - dy, crates: [...p.crates], open: [...p.open] });
      }
    }
  }
  return false;
}

describe('Rätselorte', () => {
  for (const d of DUNGEONS)
    it(`${d.name} ist lösbar und gültig`, () => {
      expect(d.grid.every((r) => r.length === d.grid[0].length)).toBe(true);
      const p = new Puzzle(d);
      expect(p.cells('S')).toHaveLength(1);
      for (const k of Object.keys(d.hints)) {
        const [x, y] = k.split(',').map(Number);
        expect(p.at(x, y)).toBe('H');
      }
      expect(p.cells('H')).toHaveLength(Object.keys(d.hints).length);
      expect(p.cells('t').length).toBe(d.loot.length);
      expect(solvable(new Puzzle(d))).toBe(true);
    });
  it('Hebel: falsche Reihenfolge setzt zurück, richtige öffnet', () => {
    const p = new Puzzle(DUNGEONS[1]);
    expect(p.pull(1)).toBe('ok');
    p.pull(2);
    p.pull(3);
    expect(p.pull(4)).toBe('reset');
    expect(p.levers).toEqual([]);
    for (const n of [3, 4, 2]) p.pull(n);
    expect(p.pull(1)).toBe('open');
    const [lx, ly] = p.cells('L')[0];
    expect(p.solid(lx, ly)).toBe(false);
  });
  it('Schloss, Truhen, Zurücksetzen und Speichern', () => {
    const p = new Puzzle(DUNGEONS[0]);
    expect(p.tryCode([0, 0, 0])).toBe(false);
    expect(p.tryCode([0, 4, 3])).toBe(true);
    const [tx, ty] = p.cells('t')[0];
    expect(p.openChest(tx, ty)).toBe('dagger');
    expect(p.openChest(tx, ty)).toBe(null);
    const [cx, cy] = p.cells('T')[0];
    expect(p.openChest(cx, cy)).toBe('amulet_sun');
    const crate = [...p.crates][0].split(',').map(Number);
    expect(p.push(crate[0], crate[1], 1, 0).moved).toBe(true);
    const copy = new Puzzle(DUNGEONS[0], p.save());
    expect([...copy.crates]).toEqual([...p.crates]);
    expect(copy.chests.size).toBe(2);
    copy.reset();
    expect(copy.chests.size).toBe(2);
    expect([...copy.crates]).toEqual(['6,7']);
  });
});

describe('Romanzen und Orientierung', () => {
  it('jede Kombination hat mindestens drei mögliche Romanzen', () => {
    for (const g of ['m', 'w', 'd'] as Gender[])
      for (const pref of ['m', 'w', 'all'] as Pref[]) {
        if (g === 'd' && pref !== 'all') continue;
        const n = NPCS.filter((x) => S.compatible(x, player(g, pref))).length;
        expect(n, `${g}/${pref}`).toBeGreaterThanOrEqual(3);
      }
  });
  it('Hetero-Figur kein Match für gleiches Geschlecht, schwule Figur kein Match für Frauen', () => {
    const jonas = NPCS.find((n) => n.id === 'jonas')!,
      marlon = NPCS.find((n) => n.id === 'marlon')!;
    expect(S.compatible(jonas, player('m', 'm'))).toBe(false);
    expect(S.compatible(jonas, player('w', 'm'))).toBe(true);
    expect(S.compatible(marlon, player('w', 'm'))).toBe(false);
    expect(S.compatible(marlon, player('m', 'm'))).toBe(true);
    expect(S.compatible(marlon, player('m', 'w'))).toBe(false);
  });
  it('alle Daten sind vollständig', () => {
    expect(NPCS).toHaveLength(10);
    for (const n of NPCS) {
      expect(n.steps).toHaveLength(5);
      expect(n.age).toBeGreaterThanOrEqual(21);
      for (const id of [...n.loves, ...n.likesItems, ...n.dislikes]) expect(item(id), `${n.id}:${id}`).toBeTruthy();
      for (const st of n.steps) {
        if (st.need.t === 'item') expect(item(st.need.id)).toBeTruthy();
        if (st.reward?.item) expect(item(st.reward.item)).toBeTruthy();
        if (st.need.t === 'date') expect(POIS.some((p) => p.id === (st.need as { poi: string }).poi)).toBe(true);
      }
      for (const sp of Object.values(n.schedule)) if (sp) expect(POIS.some((p) => p.id === sp.poi)).toBe(true);
      expect(n.date.length + n.kiss.length + n.night.length).toBeGreaterThan(6);
    }
    for (const id of SHOP) expect(item(id).price).toBeGreaterThan(0);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });
  it('Fortschritt: Gespräch, Geschenk, Schritt, Romanze, Date, Szenen', () => {
    const s = S.newSave(player('m', 'w'));
    const lea = NPCS.find((n) => n.id === 'lea')!;
    expect(S.stepReady(s, lea)).toBe(false); // braucht Tagebuch
    S.addItem(s, 'journal');
    expect(S.stepReady(s, lea)).toBe(true);
    expect(S.completeStep(s, lea)!.text).toContain('Karte');
    expect(s.flags.leaMap).toBe(1);
    expect(s.rel.lea.lvl).toBe(1);
    S.addItem(s, 'book');
    expect(S.giveGift(s, lea, 'book')).toBe('love');
    expect(S.giveGift(s, lea, 'book')).toBe('already');
    expect(S.talkDaily(s, lea)).toBe(true);
    expect(S.talkDaily(s, lea)).toBe(false);
    s.museum = ['pottery', 'cannonball', 'coin_silver'];
    expect(S.setRomance(s, lea, true)).toBe(true);
    expect(S.stepReady(s, lea)).toBe(true);
    S.completeStep(s, lea);
    expect(s.rel.lea.lvl).toBe(2);
    // Date
    s.rel.lea.pts = 40;
    s.time = 15 * 60;
    const d = S.arrangeDate(s, lea)!;
    expect(d.day).toBe(s.day);
    expect(S.dateNow(s, lea)).toBe(false);
    s.time = 19 * 60;
    expect(S.dateNow(s, lea)).toBe(true);
    expect(S.npcSpot(s, lea)!.poi).toBe('lagoon');
    expect(S.completeStep(s, lea)!.scene).toBe('lea_date');
    expect(s.gallery).toContain('lea_date');
  });
  it('Freundschaft statt Romanze bei unpassender Orientierung', () => {
    const s = S.newSave(player('m', 'w'));
    const marlon = NPCS.find((n) => n.id === 'marlon')!;
    expect(S.setRomance(s, marlon, true)).toBe(false);
    S.addItem(s, 'coconut', 3);
    S.completeStep(s, marlon);
    s.rel.marlon.pts = 99;
    S.completeStep(s, marlon);
    s.time = 18 * 60;
    S.arrangeDate(s, marlon);
    s.time = 19 * 60;
    expect(S.completeStep(s, marlon)!.scene).toBe('marlon_hang');
  });
});

describe('Wirtschaft, Zeit und Welt', () => {
  it('Laden, Verkauf, Museum, Ausbau', () => {
    const s = S.newSave(player('w', 'all'));
    expect(S.buy(s, 'lamp')).toBe(true);
    expect(S.buy(s, 'lamp')).toBe(false); // Werkzeug nur einmal
    expect(s.flags.bought).toBe(1);
    S.addItem(s, 'coin_gold', 2);
    expect(S.sell(s, 'coin_gold')).toBe(45);
    expect(S.donate(s, 'coin_gold').ok).toBe(true);
    expect(S.donate(s, 'coin_gold').ok).toBe(false);
    expect(S.renovate(s)).toBe(false); // erst Tagebuch
    S.addItem(s, 'journal');
    s.money = 1000;
    expect(S.renovate(s)).toBe(true);
    expect(s.flags.renov1).toBe(1);
  });
  it('Tageszeiten, Schlaf, tägliche Stellen', () => {
    expect(S.slotOf(8 * 60)).toBe('morning');
    expect(S.slotOf(13 * 60)).toBe('day');
    expect(S.slotOf(19 * 60)).toBe('evening');
    expect(S.slotOf(25 * 60)).toBe('night');
    expect(S.clock(25 * 60 + 5)).toBe('01:05');
    const s = S.newSave(player('d', 'all'));
    s.picked = ['x'];
    S.sleep(s);
    expect(s.day).toBe(2);
    expect(s.picked).toEqual([]);
    const a = S.dailyPick(3, 30, 6, 1);
    expect(a).toHaveLength(6);
    expect(new Set(a).size).toBe(6);
    expect(S.dailyPick(3, 30, 6, 1)).toEqual(a);
  });
  it('Orte liegen an Land, Lagune über dem Grund', () => {
    for (const p of POIS) expect(height(p.x, p.z), p.id).toBeGreaterThan(0.8);
    expect(height(LAGOON.x, LAGOON.z)).toBeLessThan(LAGOON.y);
  });
  it('Enden', () => {
    const s = S.newSave(player('w', 'all'));
    expect(S.endingOptions(s).couples).toEqual([]);
    for (const id of ['lea', 'mira']) {
      s.rel[id].romance = true;
      s.rel[id].lvl = 5;
    }
    expect(S.endingOptions(s).couples).toEqual(['lea', 'mira']);
    expect(S.endingOptions(s).open).toBe(false);
    s.rel.lea.open = s.rel.mira.open = true;
    expect(S.endingOptions(s).open).toBe(true);
  });
});
