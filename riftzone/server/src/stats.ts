// Dauerhafte Spielerstatistik für die Server-Rangliste (JSON-Datei, atomar geschrieben).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PlacementResult } from '../../shared/src/types';

export interface StatEntry {
  name: string;
  wins: number;
  kills: number;
  matches: number;
  damage: number;
  level: number;
  lastSeen: number;
}

export class StatsStore {
  private data: Record<string, StatEntry> = {};
  private readonly file: string;
  private dirty = false;
  totalMatches = 0;

  constructor(dir: string) {
    mkdirSync(dir, { recursive: true });
    this.file = join(dir, 'stats.json');
    try {
      const j = JSON.parse(readFileSync(this.file, 'utf8')) as { players: Record<string, StatEntry>; totalMatches: number };
      this.data = j.players ?? {};
      this.totalMatches = j.totalMatches ?? 0;
    } catch {
      this.data = {};
    }
    setInterval(() => this.flush(), 15000).unref();
  }

  record(id: string, name: string, level: number, r: PlacementResult): void {
    const e = (this.data[id] ??= { name, wins: 0, kills: 0, matches: 0, damage: 0, level, lastSeen: 0 });
    e.name = name;
    e.level = level;
    e.matches++;
    e.kills += r.kills;
    e.damage += r.damage;
    if (r.won) e.wins++;
    e.lastSeen = Date.now();
    this.dirty = true;
  }

  matchPlayed(): void {
    this.totalMatches++;
    this.dirty = true;
  }

  top(n = 50): (StatEntry & { id: string })[] {
    return Object.entries(this.data)
      .map(([id, e]) => ({ id, ...e }))
      .sort((a, b) => b.wins - a.wins || b.kills - a.kills || b.matches - a.matches)
      .slice(0, n);
  }

  flush(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const tmp = this.file + '.tmp';
    try {
      writeFileSync(tmp, JSON.stringify({ players: this.data, totalMatches: this.totalMatches }));
      renameSync(tmp, this.file);
    } catch (e) {
      console.error('Statistik konnte nicht gespeichert werden:', e);
    }
  }
}
