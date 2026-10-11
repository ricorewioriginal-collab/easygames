/** Einstellbare Grafikqualität. Wird vom Renderer angewendet und bei Bedarf automatisch abgesenkt. */
export interface QualitySettings {
  /** Obergrenze für devicePixelRatio */
  pixelRatio: number;
  shadows: boolean;
  /** Anteil der Partikel (0 = keine, 1 = voll) */
  particles: number;
  antialias: boolean;
}

export type QualityLevel = 'low' | 'medium' | 'high';

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: { pixelRatio: 1, shadows: false, particles: 0.35, antialias: false },
  medium: { pixelRatio: 1.5, shadows: true, particles: 0.7, antialias: true },
  high: { pixelRatio: 2, shadows: true, particles: 1, antialias: true },
};

/** Gute Voreinstellung je nach Gerät: Touch-Geräte starten mit „mittel“ ohne Kantenglättung-Aufwand. */
export function defaultQuality(): QualityLevel {
  if (typeof matchMedia === 'undefined') return 'medium';
  const coarse = matchMedia('(pointer:coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 700;
  return coarse || small ? 'low' : 'medium';
}
