/** Rätselorte als Raster: Kisten schieben, Druckplatten, Hebel-Reihenfolge, Symbolschloss, Lianen, Altar, Truhen */
import type { DungeonDef } from './types';
import type { DungeonSave } from './state';

export const CELL = 3; // Meter je Feld
const OBJECTS = '1234HtTQZ';
const DOORS = 'ABCLKOV';

export class Puzzle {
  readonly w: number;
  readonly h: number;
  private base: string[][];
  private initCrates: string[];
  crates: Set<string>;
  open: Set<string>;
  chests: Set<string>;
  levers: number[];

  constructor(readonly def: DungeonDef, s?: DungeonSave) {
    this.h = def.grid.length;
    this.w = def.grid[0].length;
    this.base = def.grid.map((r) => r.split('').map((c) => (c === 'C' ? '.' : c)));
    this.initCrates = [];
    def.grid.forEach((r, y) => r.split('').forEach((c, x) => c === 'C' && this.initCrates.push(Puzzle.key(x, y))));
    this.crates = new Set(s?.crates?.length ? s.crates : this.initCrates);
    this.open = new Set(s?.open || []);
    this.chests = new Set(s?.chests || []);
    this.levers = [...(s?.levers || [])];
  }
  static key = (x: number, y: number) => x + ',' + y;
  at(x: number, y: number): string {
    return this.base[y]?.[x] ?? '#';
  }
  /** Feldmitte in Weltkoordinaten (x, z) */
  static pos(x: number, y: number): [number, number] {
    return [x * CELL, y * CELL];
  }
  static cellOf(px: number, pz: number): [number, number] {
    return [Math.round(px / CELL), Math.round(pz / CELL)];
  }
  isOpen(x: number, y: number) {
    return this.open.has(Puzzle.key(x, y));
  }
  /** Für Spielfigur unpassierbar? */
  solid(x: number, y: number): boolean {
    const c = this.at(x, y);
    if (c === '#' || c === ' ' || c === '~') return true;
    if (this.crates.has(Puzzle.key(x, y))) return true;
    if (DOORS.includes(c)) return !this.isOpen(x, y);
    return OBJECTS.includes(c);
  }
  /** Kann eine Kiste hierhin? */
  crateFree(x: number, y: number): boolean {
    const c = this.at(x, y);
    if (this.crates.has(Puzzle.key(x, y))) return false;
    if (c === '.' || c === 'S' || 'abc'.includes(c)) return true;
    return 'ABCLKO'.includes(c) && this.isOpen(x, y);
  }
  start(): [number, number] {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.base[y][x] === 'S') return [x, y];
    return [1, 1];
  }
  cells(ch: string): [number, number][] {
    const out: [number, number][] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.base[y][x] === ch) out.push([x, y]);
    return out;
  }
  /** Kiste schieben; liefert die neu geöffneten Tore */
  push(x: number, y: number, dx: number, dy: number): { moved: boolean; opened: string[] } {
    const k = Puzzle.key(x, y);
    if (!this.crates.has(k) || !this.crateFree(x + dx, y + dy)) return { moved: false, opened: [] };
    this.crates.delete(k);
    this.crates.add(Puzzle.key(x + dx, y + dy));
    return { moved: true, opened: this.checkPlates() };
  }
  platesDone(g: string): boolean {
    const p = this.cells(g);
    return p.length > 0 && p.every(([x, y]) => this.crates.has(Puzzle.key(x, y)));
  }
  /** Tore öffnen, sobald alle Platten einer Gruppe belegt sind (bleiben dann offen) */
  checkPlates(): string[] {
    const out: string[] = [];
    for (const g of 'abc')
      if (this.platesDone(g))
        for (const [x, y] of this.cells(g.toUpperCase())) {
          const k = Puzzle.key(x, y);
          if (!this.open.has(k)) {
            this.open.add(k);
            out.push(k);
          }
        }
    return out;
  }
  private openAll(ch: string): string[] {
    const out: string[] = [];
    for (const [x, y] of this.cells(ch)) {
      const k = Puzzle.key(x, y);
      if (!this.open.has(k)) {
        this.open.add(k);
        out.push(k);
      }
    }
    return out;
  }
  /** Hebel ziehen: 'ok' (weiter), 'open' (richtig, Tor offen), 'reset' (falsche Reihenfolge), 'done' (schon gelöst) */
  pull(n: number): 'ok' | 'open' | 'reset' | 'done' {
    const order = this.def.leverOrder || [];
    if (this.cells('L').every(([x, y]) => this.isOpen(x, y))) return 'done';
    if (this.levers.includes(n)) return 'ok';
    this.levers.push(n);
    if (this.levers.length < order.length) return 'ok';
    if (this.levers.every((v, i) => v === order[i])) {
      this.openAll('L');
      return 'open';
    }
    this.levers = [];
    return 'reset';
  }
  tryCode(code: number[]): boolean {
    const want = this.def.code || [];
    if (code.length !== want.length || !code.every((v, i) => v === want[i])) return false;
    this.openAll('K');
    return true;
  }
  cut(x: number, y: number): boolean {
    if (this.at(x, y) !== 'V' || this.isOpen(x, y)) return false;
    this.open.add(Puzzle.key(x, y));
    return true;
  }
  activateAltar(): string[] {
    return this.openAll('O');
  }
  /** Truhe öffnen: Inhalt (Gegenstand) oder null, wenn schon offen */
  openChest(x: number, y: number): string | null {
    const k = Puzzle.key(x, y),
      c = this.at(x, y);
    if (this.chests.has(k) || !'tTZ'.includes(c)) return null;
    this.chests.add(k);
    if (c === 'T' || c === 'Z') return this.def.amulet;
    const idx = this.cells('t').findIndex(([cx, cy]) => cx === x && cy === y);
    return this.def.loot[idx] || 'coin_gold';
  }
  /** Kisten und Hebel zurücksetzen (geöffnete Tore und Truhen bleiben) */
  reset(): void {
    this.crates = new Set(this.initCrates);
    this.levers = [];
  }
  save(): DungeonSave {
    return { crates: [...this.crates], open: [...this.open], chests: [...this.chests], levers: [...this.levers] };
  }
  /** Fest platzierte Objekte und Tore (für die 3D-Darstellung) */
  objects(): { ch: string; x: number; y: number }[] {
    const out: { ch: string; x: number; y: number }[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const c = this.base[y][x];
        if (OBJECTS.includes(c) || DOORS.includes(c) || 'abcS'.includes(c)) out.push({ ch: c, x, y });
      }
    return out;
  }
}
