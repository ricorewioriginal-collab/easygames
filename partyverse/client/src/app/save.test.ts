import { describe, expect, it } from 'vitest';
import { SaveStore, defaultSave, normalizeServerUrl, sanitize, type StorageLike } from './save';

const mem = (init: Record<string, string> = {}): StorageLike & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

describe('Speicher', () => {
  it('beschädigte Daten ergeben Standardwerte und werden gesichert', () => {
    const st = mem({ 'partyverse.save': '{kaputt' });
    const s = new SaveStore(st);
    expect(s.recovered).toBe(true);
    expect(s.data).toEqual(defaultSave());
    expect(st.m.get('partyverse.save.backup')).toBe('{kaputt');
  });
  it('ungültige Werte werden bereinigt', () => {
    const d = sanitize({ settings: { master: 7, music: 'laut', quality: 'ultra', serverUrl: 'http://x' }, profile: { name: '<b>Ab</b>' + 'x'.repeat(30), character: 'nix' }, stats: { games: -4, wins: NaN } });
    expect(d.settings.master).toBe(1);
    expect(d.settings.music).toBe(defaultSave().settings.music);
    expect(d.settings.quality).toBe('auto');
    expect(d.settings.serverUrl).toBe('');
    expect(d.profile.name.length).toBeLessThanOrEqual(14);
    expect(d.profile.name).not.toMatch(/[<>]/);
    expect(d.profile.character).toBe('pip');
    expect(d.stats.games).toBe(0);
    expect(d.stats.wins).toBe(0);
  });
  it('speichert, lädt und migriert ältere Versionen', () => {
    const st = mem();
    const a = new SaveStore(st);
    a.update((d) => (d.profile.name = 'Eva'));
    const b = new SaveStore(st);
    expect(b.data.profile.name).toBe('Eva');
    const old = mem({ 'partyverse.save': JSON.stringify({ version: 1, profile: { name: 'Alt' } }) });
    const c = new SaveStore(old);
    expect(c.data.profile.name).toBe('Alt');
    expect(c.data.version).toBeGreaterThanOrEqual(2);
  });
  it('läuft weiter, wenn Speichern fehlschlägt oder gesperrt ist', () => {
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
  it('Server-Adressen: nur ws/wss ohne Zugangsdaten', () => {
    expect(normalizeServerUrl('')).toBe('');
    expect(normalizeServerUrl('ws://localhost:2567')).toBe('ws://localhost:2567');
    expect(normalizeServerUrl('wss://spiel.example.org/')).toBe('wss://spiel.example.org');
    expect(normalizeServerUrl('http://x')).toBeNull();
    expect(normalizeServerUrl('wss://u:p@x')).toBeNull();
    expect(normalizeServerUrl('quatsch')).toBeNull();
  });
});
