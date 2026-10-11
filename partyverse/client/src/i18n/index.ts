import { de } from './de';

/** Sprachen: Aktuell nur Deutsch; weitere Sprachen werden als Wörterbuch mit denselben Schlüsseln ergänzt (siehe docs/i18n.md). */
export type Dict = Record<string, string>;
const dicts: Record<string, Dict> = { de };
let current = 'de';

export function setLocale(code: string): void {
  if (dicts[code]) current = code;
}
export function registerLocale(code: string, dict: Dict): void {
  dicts[code] = dict;
}
export const locales = (): string[] => Object.keys(dicts);

/** Übersetzt einen Schlüssel; {name}-Platzhalter werden ersetzt. Unbekannte Schlüssel liefern den Schlüssel selbst (auffällig, aber nie ein Absturz). */
export function t(key: string, vars?: Record<string, string | number>): string {
  const s = dicts[current]?.[key] ?? dicts.de?.[key] ?? key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`)) : s;
}
