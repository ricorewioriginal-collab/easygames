import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveStore, SAVE_VERSION, migrate, defaultSettings } from '../src/save/store';
import { NETWORK_SCHEMA, type NetworkDef } from '../src/railway/schema';

// Kleiner localStorage-Ersatz im Speicher
class MemStorage {
  m = new Map<string, string>();
  failWrites = false;
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { if (this.failWrites && k !== 'ricorail.probe') { const e = new Error('voll'); (e as any).name = 'QuotaExceededError'; throw e; } this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
let ls: MemStorage;
beforeEach(() => { ls = new MemStorage(); (globalThis as any).localStorage = ls; delete (globalThis as any).indexedDB; });

const net = (id: string, name: string): NetworkDef => ({ schema: NETWORK_SCHEMA, id, name, world: 'custom', theme: { terrain: 'plain' }, nodes: [], tracks: [], switches: [], signals: [], stations: [], industries: [], crossings: [], speeds: [] });

describe('SaveStore', () => {
  it('öffnet, wählt, speichert und prüft', async () => {
    const s = await SaveStore.open();
    expect(s.activeId).toBe(0);
    expect(s.active.name).toBe('Spieler 1');
    expect(s.active.settings).toEqual(defaultSettings());
    s.active.career.xp = 1234; s.active.scenarios['s1'] = { best: 900, stars: 3, done: true };
    expect(await s.save()).toBe(true);
    expect(s.lastError).toBe('');
    const raw = JSON.parse(ls.getItem('ricorail.save')!);
    expect(raw.v).toBe(SAVE_VERSION);
    const s2 = await SaveStore.open();
    expect(s2.active.career.xp).toBe(1234);
    expect(s2.active.scenarios.s1.stars).toBe(3);
    // nur eigene Schlüssel
    for (const k of ls.m.keys()) expect(k.startsWith('ricorail')).toBe(true);
  });

  it('legt bei zweitem Speichern eine Vorgängerkopie an', async () => {
    const s = await SaveStore.open();
    s.active.stats.km = 1; await s.save();
    s.active.stats.km = 2; await s.save();
    expect(JSON.parse(ls.getItem('ricorail.save.prev')!).profiles[0].stats.km).toBe(1);
    expect(JSON.parse(ls.getItem('ricorail.save')!).profiles[0].stats.km).toBe(2);
  });

  it('beschädigtes JSON wird gesichert, Standardwerte geladen', async () => {
    ls.setItem('ricorail.save', '{kaputt');
    const s = await SaveStore.open();
    expect(s.active.name).toBe('Spieler 1');
    const bk = [...ls.m.keys()].filter((k) => k.startsWith('ricorail.backup.'));
    expect(bk.length).toBe(1);
    expect(ls.getItem(bk[0])).toBe('{kaputt');
    expect(s.notice).not.toBe('');
  });

  it('beschädigt → letzte gute Kopie wird verwendet', async () => {
    const s = await SaveStore.open(); s.active.career.xp = 77; await s.save(); s.active.career.xp = 78; await s.save();
    ls.setItem('ricorail.save', 'null-kaputt');
    const s2 = await SaveStore.open();
    expect(s2.active.career.xp).toBe(77);
  });

  it('Schreibfehler (Speicher voll) → false, alte Daten bleiben', async () => {
    const s = await SaveStore.open(); s.active.career.xp = 5; await s.save();
    ls.failWrites = true; s.active.career.xp = 6;
    expect(await s.save()).toBe(false);
    expect(s.lastError).toMatch(/Speicher voll/);
    ls.failWrites = false;
    expect(JSON.parse(ls.getItem('ricorail.save')!).profiles[0].career.xp).toBe(5);
  });

  it('localStorage nicht verfügbar → Speicher im RAM, Fehlertext', async () => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    try {
      const s = await SaveStore.open();
      expect(s.persistent).toBe(false);
      expect(s.active.name).toBe('Spieler 1');
      expect(await s.save()).toBe(false);
      expect(s.lastError).not.toBe('');
    } finally { Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: ls }); }
  });

  it('migriert v0 → v1', () => {
    const r = migrate({ name: 'Alt', career: { xp: 10 } });
    expect(r.from).toBe(0);
    expect(r.data.v).toBe(1);
    expect(r.data.profiles[0].name).toBe('Alt');
    const e = migrate(null); expect(e.data.v).toBe(1); expect(e.data.profiles).toEqual([null, null, null]);
    const c = migrate({ v: 1, active: 2, profiles: [] }); expect(c.from).toBe(1); expect(c.data.active).toBe(2);
  });

  it('lädt unversionierten (v0) Spielstand', async () => {
    ls.setItem('ricorail.save', JSON.stringify({ name: 'Rico', career: { rank: 2, xp: 500, exams: ['a'], licences: [] }, settings: { volume: { master: 5 }, quality: 'x' } }));
    const s = await SaveStore.open();
    expect(s.active.name).toBe('Rico');
    expect(s.active.career.rank).toBe(2);
    expect(s.active.settings.volume.master).toBe(1); // geklemmt
    expect(s.active.settings.quality).toBe('auto');   // ungültig → Standard
  });

  it('Export/Import Rundreise', async () => {
    const s = await SaveStore.open(); s.rename(0, 'Anna'); s.select(2).career.xp = 99; await s.save();
    const txt = s.exportJSON();
    ls.clear();
    const s2 = await SaveStore.open();
    expect(s2.importJSON(txt)).toEqual({ ok: true, msg: expect.any(String) });
    expect(s2.profiles()[0]!.name).toBe('Anna');
    expect(s2.profiles()[2]!.career.xp).toBe(99);
    expect(s2.activeId).toBe(2);
    const s3 = await SaveStore.open();
    expect(s3.profiles()[2]!.career.xp).toBe(99);
  });

  it('Import von Unsinn wird abgelehnt, Daten unverändert', async () => {
    const s = await SaveStore.open(); s.active.career.xp = 42; await s.save();
    const before = ls.getItem('ricorail.save');
    for (const bad of ['', 'hallo', '[1,2]', '{"foo":1}', '{"v":1}', '{"app":"other","profiles":[{"name":"x"}]}', 'null']) {
      const r = s.importJSON(bad);
      expect(r.ok).toBe(false);
      expect(r.msg).toMatch(/Import fehlgeschlagen/);
    }
    expect(ls.getItem('ricorail.save')).toBe(before);
    expect(s.active.career.xp).toBe(42);
  });

  it('drei Profile sind unabhängig', async () => {
    const s = await SaveStore.open();
    s.select(0).career.xp = 1; s.select(1).career.xp = 2; s.select(2).career.xp = 3;
    s.rename(1, '  Bob  ');
    await s.save();
    const s2 = await SaveStore.open();
    const p = s2.profiles();
    expect(p.map((x) => x!.career.xp)).toEqual([1, 2, 3]);
    expect(p[1]!.name).toBe('Bob');
    expect(p.map((x) => x!.id)).toEqual([0, 1, 2]);
    s2.reset(1);
    expect(s2.profiles()[1]!.career.xp).toBe(0);
    expect(s2.profiles()[1]!.name).toBe('Bob');
    expect(s2.profiles()[0]!.career.xp).toBe(1);
  });

  it('Autosave speichert verzögert', async () => {
    vi.useFakeTimers();
    try {
      const s = await SaveStore.open();
      s.active.career.xp = 8; s.autosave();
      expect(ls.getItem('ricorail.save')).toBeNull();
      vi.advanceTimersByTime(2100);
      expect(JSON.parse(ls.getItem('ricorail.save')!).profiles[0].career.xp).toBe(8);
    } finally { vi.useRealTimers(); }
  });

  it('Editor-Netze über localStorage-Ersatz', async () => {
    const s = await SaveStore.open();
    expect(await s.listNets()).toEqual([]);
    expect(await s.saveNet(net('custom-1', 'Eins'))).toBe(true);
    expect(await s.saveNet(net('custom-2', 'Zwei'))).toBe(true);
    const l = await s.listNets();
    expect(l.map((x) => x.id).sort()).toEqual(['custom-1', 'custom-2']);
    expect((await s.loadNet('custom-2'))!.name).toBe('Zwei');
    expect(await s.loadNet('fehlt')).toBeNull();
    await s.deleteNet('custom-1');
    expect((await s.listNets()).map((x) => x.id)).toEqual(['custom-2']);
    // große Netze nicht unter dem Cloud-Präfix
    expect([...ls.m.keys()].some((k) => k.startsWith('ricorail.') && k.includes('custom-2'))).toBe(false);
    expect(await s.saveNet({ ...net('x', 'x'), schema: 99 })).toBe(false);
  });
});
