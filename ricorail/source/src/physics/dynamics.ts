// Zugdynamik: Zugkraft, Fahrwiderstände, Neigung, Haftung, Bremsanlage. Reine Funktionen, deterministisch.
export const G = 9.81;
export const TICK = 1 / 50; // fester Simulationstakt 50 Hz
export const MAX_CATCHUP = 0.25; // max. 0,25 s Simulation pro Bild (Hintergrund-Tab springt nicht)

export type Rail = 'dry' | 'wet' | 'snow' | 'leaves' | 'ice';
export const RAIL_MU: Record<Rail, number> = { dry: 0.33, wet: 0.22, snow: 0.17, leaves: 0.11, ice: 0.09 };
export const RAIL_NAME: Record<Rail, string> = { dry: 'trocken', wet: 'nass', snow: 'Schnee', leaves: 'Laub', ice: 'vereist' };

/** Haftwert unter Berücksichtigung von Sand und Geschwindigkeit (Curtius-Kniffler-ähnlicher Abfall) */
export function adhesion(rail: Rail, vKmh: number, sand: boolean): number {
  const base = RAIL_MU[rail] * (7.5 / (Math.abs(vKmh) + 44) + 0.161) / (7.5 / 44 + 0.161);
  return base * (sand ? (rail === 'dry' ? 1.1 : 1.45) : 1);
}

/** Laufwiderstand eines Fahrzeugs (N): Roll-/Lagerwiderstand + Luftwiderstand */
export function runResistance(massT: number, axles: number, v: number, cdA: number): number {
  const av = Math.abs(v);
  const roll = massT * G * 1.2 + axles * 120 + massT * 0.06 * av; // ≈1,2 ‰ + achsabhängig + geschwindigkeitsabhängig
  const air = 0.5 * 1.2 * cdA * av * av;
  return roll + air;
}

/** Bogenwiderstand nach Röckl (N/kN), Normalspur */
export function curveResistance(massT: number, radius: number): number {
  if (!isFinite(radius) || radius > 3000) return 0;
  const r = Math.max(radius, 120);
  const wr = r >= 300 ? 650 / (r - 55) : 500 / (r - 30);
  return wr * massT * G; // Gewicht in kN (t·g) × Widerstandszahl N/kN = N
}

/** Zugkraftkennlinie: min(Anfahrzugkraft, Leistung/v) in N */
export function tractionForce(tractiveKN: number, powerKW: number, v: number, setting: number): number {
  const av = Math.max(Math.abs(v), 0.5);
  const fMax = tractiveKN * 1000, fP = (powerKW * 1000) / av;
  return Math.min(fMax, fP) * Math.max(0, Math.min(1, setting));
}

/** Elektrische/dynamische Bremskraft (N): Leistungshyperbel, unter 5 km/h abklingend */
export function dynBrakeForce(powerKW: number, v: number, setting: number): number {
  const av = Math.abs(v); if (av < 0.3) return 0;
  const f = Math.min((powerKW * 1000) / av, powerKW * 70);
  return f * Math.min(1, av / 1.5) * Math.max(0, Math.min(1, setting));
}

export interface BrakeState { pipe: number; cyl: number; mainRes: number }
/** Führerbremsventil: Sollwert Hauptluftleitung aus Bremsstellung (0 = Lösen, 1 = Vollbremsung), Schnellbremsung → 0 bar */
export function pipeTarget(cmd: number, emergency: boolean): number { return emergency ? 0 : 5 - 1.5 * Math.max(0, Math.min(1, cmd)); }

/**
 * Integriert die indirekte Druckluftbremse.
 * buildUp: Bremszylinder-Füllzeit in s (P ≈ 4 s, G ≈ 25 s, ep ≈ 1,2 s), lengthM verzögert die Durchschlagszeit.
 */
export function stepBrake(b: BrakeState, cmd: number, emergency: boolean, buildUp: number, lengthM: number, compressorOn: boolean, dt: number): void {
  // Hauptluftbehälter: Kompressor füllt bis 10 bar, Leitung zieht beim Lösen Luft
  if (compressorOn && b.mainRes < 10) b.mainRes = Math.min(10, b.mainRes + 0.12 * dt);
  const target = pipeTarget(cmd, emergency);
  const prop = 1 + lengthM / 400;
  if (target < b.pipe) b.pipe = Math.max(target, b.pipe - (emergency ? 3.0 : 0.45 / prop) * dt);
  else if (target > b.pipe) {
    const avail = b.mainRes > b.pipe + 0.2; // Auffüllen nur mit genügend Vorrat
    if (avail) { const dp = Math.min(target - b.pipe, 0.3 / prop * dt); b.pipe += dp; b.mainRes -= dp * 0.25; }
  }
  const want = Math.max(0, Math.min(1.15, (5 - b.pipe) / 1.5));
  const tau = Math.max(0.3, (want > b.cyl ? buildUp : buildUp * 1.6) / 3);
  b.cyl += (want - b.cyl) * Math.min(1, dt / tau);
  if (b.cyl < 1e-4) b.cyl = 0;
}

/** Bremsweg (m) bei konstanter Verzögerung a (m/s²) inkl. Ansprechzeit t0 */
export function brakingDistance(v: number, a: number, t0 = 0): number { return v * t0 + (v * v) / (2 * Math.max(a, 0.05)); }
