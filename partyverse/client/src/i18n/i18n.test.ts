import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { de } from './de';
import { t } from './index';

const root = join(__dirname, '..');
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
  });
}

describe('i18n', () => {
  it('jeder im Code verwendete Schlüssel t(\'…\') existiert im deutschen Wörterbuch', () => {
    const missing: string[] = [];
    for (const f of files(root)) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) {
        const key = m[1] as string;
        if (key.endsWith('.')) continue; // dynamische Schlüssel werden unten geprüft
        if (!(key in de)) missing.push(`${f.replace(root, '')}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('dynamische Schlüssel (Schwierigkeit, Feldart, Kategorie, Finale-Bonus) sind vollständig', () => {
    for (const k of ['easy', 'normal', 'hard']) expect(de['diff.' + k]).toBeTruthy();
    for (const k of ['start', 'glimmer', 'thorn', 'event', 'item', 'shop', 'portal', 'gate', 'chaos']) expect(de['kind.' + k]).toBeTruthy();
    for (const k of ['reaction', 'race', 'platform', 'collect', 'memory', 'rhythm', 'survival', 'physics', 'aim', 'puzzle']) expect(de['mg.cat.' + k]).toBeTruthy();
    for (const k of ['minigame', 'coins', 'events']) expect(de['finale.bonus.' + k]).toBeTruthy();
  });

  it('Platzhalter werden ersetzt, unbekannte Schlüssel brechen nichts', () => {
    expect(t('hud.round', { round: 2, rounds: 9 })).toBe('Runde 2/9');
    expect(t('gibt.es.nicht')).toBe('gibt.es.nicht');
  });
});
