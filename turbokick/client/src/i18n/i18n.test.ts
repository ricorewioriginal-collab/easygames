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
  it("jeder im Code verwendete Schlüssel t('…') existiert im deutschen Wörterbuch", () => {
    const missing: string[] = [];
    for (const f of files(root)) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) {
        const key = m[1] as string;
        if (key.endsWith('.')) continue;
        if (!(key in de)) missing.push(`${f.replace(root, '')}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
  it('dynamische Schlüssel sind vollständig', () => {
    for (const k of ['easy', 'normal', 'hard', 'pro']) expect(de['diff.' + k]).toBeTruthy();
    for (const k of ['neon', 'eis', 'canyon', 'random']) expect(de['arena.' + k]).toBeTruthy();
    for (const k of ['quick', 'split', 'training']) expect(de['play.modeHelp.' + k]).toBeTruthy();
  });
  it('Platzhalter werden ersetzt, unbekannte Schlüssel brechen nichts', () => {
    expect(t('lobby.hostConfig', { size: 2, minutes: 3, arena: 'X' })).toContain('2 vs 2');
    expect(t('gibt.es.nicht')).toBe('gibt.es.nicht');
  });
});
