import type { MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';

/** PLATZHALTER – wird durch die echte Implementierung ersetzt. */
export const game: MiniGame<{ t: number }> = {
  id: 'raketenflug',
  name: 'Raketenflug',
  tagline: 'Platzhalter',
  instructions: ['Platzhalter.', 'Wird ersetzt.'],
  controls: { desktop: 'Platzhalter', touch: 'Platzhalter' },
  category: 'reaction',
  duration: 10,
  touch: { stick: false, a: true, b: false },
  init: () => ({ t: 0 }),
  step: (s) => { s.t++; },
  done: (s) => s.t >= 600,
  score: (s) => s.t,
  bot: () => ({ ...NEUTRAL_INPUT }),
  hud: (s) => ({ left: '', right: String(s.t) }),
};
