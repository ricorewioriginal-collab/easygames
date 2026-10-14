/* Verdrahtet alle Spielsysteme mit dem Spiel-Kern. */
import type { Game } from './game.ts';
import type { AudioEngine } from './audio/music.ts';
import { THEMES } from './audio/themes.ts';
import type { Hud } from './ui/hud.ts';

export interface Systems { pauseExtras(): { label: string; act: () => void; cls?: string }[]; attachHud(h: Hud): void }

export function installSystems(g: Game, audio: AudioEngine): Systems {
  // Musik & Umgebung je Welt/Zone
  g.addSystem({
    id: 'klang',
    update: (dt) => {
      const z = g.currentZone, w = g.currentWorld;
      const theme = (z?.theme && THEMES[z.theme]) || (w && THEMES[w.theme]) || THEMES.insel;
      audio.setTheme(theme);
      audio.night = g.env.isNight;
      const p = g.player.pos, ground = g.field.height(p.x, p.z);
      const coast = w ? Math.min(1, Math.max(0, (Math.hypot(p.x - w.shape.x, p.z - w.shape.z) - (w.shape.r - 40)) / 40)) : 1;
      audio.ambient(w?.underground ? 0 : Math.min(1, coast * 0.85 + (ground < 0.5 ? 0.3 : 0.1)), Math.min(1, Math.max(0, (p.y - 3) / 15)) + 0.2, z?.combat || w?.underground ? 0 : 1, dt);
    }
  });
  return {
    pauseExtras: () => [],
    attachHud: () => { }
  };
}
