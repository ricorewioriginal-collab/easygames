/** Farbwelten: Leveltöne oder freigeschaltete Paletten. */
import { Color } from 'three';

export interface Palette {
  primary: Color;
  secondary: Color;
  background: Color;
  danger: Color;
}

const PRESETS: Record<string, [number, number] | null> = {
  level: null,
  mono: [0.62, 0.6],
  infrared: [0.97, 0.88],
  aurora: [0.38, 0.5],
  gold: [0.11, 0.07],
  rainbow: null,
};

export function makePalette(
  id: string,
  hue: number,
  hue2: number,
  time: number,
  out?: Palette,
): Palette {
  const p: Palette = out ?? {
    primary: new Color(),
    secondary: new Color(),
    background: new Color(),
    danger: new Color(),
  };
  let h1 = hue;
  let h2 = hue2;
  let sat = 1;
  const preset = PRESETS[id];
  if (preset) [h1, h2] = preset;
  if (id === 'rainbow') {
    h1 = (time * 0.05) % 1;
    h2 = (h1 + 0.33) % 1;
  }
  if (id === 'mono') sat = 0.25;
  p.primary.setHSL(h1, sat, 0.62);
  p.secondary.setHSL(h2, sat, 0.56);
  p.background.setHSL(h1, 0.7 * sat, 0.014);
  p.danger.setHSL(id === 'infrared' ? 0.15 : 0.0, 1, 0.58);
  return p;
}
