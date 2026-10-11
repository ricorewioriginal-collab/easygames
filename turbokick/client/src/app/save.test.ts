import { describe, expect, it } from 'vitest';
import { SaveStore, defaultSave, sanitize, type StorageLike } from './save';

const mem = (init: Record<string, string> = {}): StorageLike & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

describe('Speicher', () => {
  it('beschädigte Daten ergeben Standardwerte und werden gesichert', () => {
    const st = mem({ 'turbokick.save': '{kaputt' });
    const s = new SaveStore(st);
    expect(s.recovered).toBe(true);
    expect(s.data).toEqual(defaultSave());
    expect(st.m.get('turbokick.save.backup')).toBe('{kaputt');
  });
  it('ungültige Werte werden bereinigt', () => {
    const d = sanitize({ version: 2, settings: { master: 7, fov: 500, quality: 'ultra' }, profile: { name: '<b>Ab</b>' + 'x'.repeat(30) }, garage: { accent: 'rot' }, stats: { matches: -4, wins: NaN }, lastSetup: { teamSize: 9, minutes: 99 } });
    expect(d.settings.master).toBe(1);
    expect(d.settings.fov).toBe(120);
    expect(sanitize({ version: 1, settings: { fov: 80 } }).settings.fov).toBe(100);
    expect(d.settings.quality).toBe('auto');
    expect(d.profile.name.length).toBeLessThanOrEqual(14);
    expect(d.profile.name).not.toMatch(/[<>]/);
    expect(d.garage.accent).toBe('');
    expect(d.stats.matches).toBe(0);
    expect(d.stats.wins).toBe(0);
    expect(d.lastSetup.teamSize).toBe(2);
    expect(d.lastSetup.minutes).toBe(10);
  });
  it('speichert und lädt; läuft weiter, wenn Speichern fehlschlägt', () => {
    const st = mem();
    new SaveStore(st).update((d) => (d.profile.name = 'Eva'));
    expect(new SaveStore(st).data.profile.name).toBe('Eva');
    const s = new SaveStore({ getItem: () => null, setItem: () => { throw new Error('voll'); } });
    expect(() => s.update((d) => (d.profile.name = 'X'))).not.toThrow();
    expect(s.persistent).toBe(false);
    expect(new SaveStore(null).persistent).toBe(false);
  });
  it('Import prüft die Daten', () => {
    const s = new SaveStore(mem());
    expect(s.importJson('kein json')).toBe(false);
    expect(s.importJson('[]')).toBe(false);
    expect(s.importJson(JSON.stringify({ profile: { name: 'Neu' } }))).toBe(true);
    expect(s.data.profile.name).toBe('Neu');
  });
});
