// Sicherer Zugriff auf localStorage (kann in privaten Fenstern oder iframes fehlen).

const PREFIX = 'riftzone.';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const v = JSON.parse(raw) as T;
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback) && v && typeof v === 'object') return { ...fallback, ...v };
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Speicher voll oder gesperrt – ignorieren */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* egal */
  }
}
