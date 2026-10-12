/** Musiktheorie-Hilfen: Skalen, Akkorde, Frequenzen. */
export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  lydian: [0, 2, 4, 6, 7, 9, 11],
} as const;

export type ScaleName = keyof typeof SCALES;

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** MIDI-Note für eine (auch negative oder >6) Skalenstufe. */
export function degreeToMidi(root: number, scale: readonly number[], degree: number): number {
  const n = scale.length;
  const octave = Math.floor(degree / n);
  const idx = ((degree % n) + n) % n;
  return root + scale[idx] + 12 * octave;
}

/** Dreiklang (Grundton, Terz, Quinte) auf einer Skalenstufe. */
export function triad(root: number, scale: readonly number[], degree: number): number[] {
  return [0, 2, 4].map((o) => degreeToMidi(root, scale, degree + o));
}

export const PROGRESSIONS: readonly (readonly number[])[] = [
  [0, 5, 3, 4],
  [0, 3, 4, 3],
  [0, 6, 5, 4],
  [0, 5, 2, 6],
  [0, 3, 0, 4],
  [5, 3, 0, 4],
  [0, 4, 5, 3],
  [0, 2, 3, 5],
];
