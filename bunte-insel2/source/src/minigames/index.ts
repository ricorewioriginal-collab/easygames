/* Minispiel-Verzeichnis: welche Spielart mit welchen Einstellungen, Belohnung beim ersten Sieg und Bestwerte. */
import type { Game } from '../game.ts';
import type { AudioEngine, MusicTheme } from '../audio/music.ts';
import { THEMES } from '../audio/themes.ts';
import { type Minigame, type MgOpts, runMinigame } from './base.ts';
import { Flight, Frequency, Memory, Penalty, Rhythm, Runner, Simon, Stack } from './games.ts';
import { RunenDuell } from './runen.ts';

type Ctor = new (g: Game, a: AudioEngine, o: MgOpts) => Minigame;
export const MINIGAMES: Record<string, { cls: Ctor; opts?: MgOpts; reward: number; music?: string }> = {
  ki_parcours: { cls: Runner, opts: { title: 'Ki-Parcours', icon: '🥋', theme: 'ki', level: 1 }, reward: 6, music: 'arena' },
  ki_turnier: { cls: Runner, opts: { title: 'Ki-Turnier: Finale', icon: '🏆', theme: 'ki', level: 3 }, reward: 15, music: 'arena' },
  ki_flug: { cls: Flight, opts: { title: 'Ki-Flugprüfung', icon: '🌀' }, reward: 8 },
  fellretter_sprint: { cls: Runner, opts: { title: 'Fellretter-Sprint', icon: '🐕', theme: 'hund', level: 1 }, reward: 6 },
  huepf_abenteuer: { cls: Runner, opts: { title: 'Hüpf-Abenteuer', icon: '🦕', theme: 'dino', level: 2 }, reward: 8 },
  drachenflug: { cls: Flight, opts: { title: 'Drachenflug', icon: '🐉' }, reward: 8, music: 'drachen' },
  heli_rettung: { cls: Flight, opts: { title: 'Heli-Rettung', icon: '🚁' }, reward: 6 },
  hafenkran: { cls: Stack, opts: { title: 'Hafen-Kran', icon: '🏗️' }, reward: 6, music: 'dampfer' },
  bauturm: { cls: Stack, opts: { title: 'Bauland-Turm', icon: '🧱' }, reward: 6, music: 'bauland' },
  disco: { cls: Rhythm, opts: { title: 'Regenbogen-Disco', icon: '💃' }, reward: 6, music: 'buehne' },
  orchester: { cls: Rhythm, opts: { title: 'Dampfer-Orchester', icon: '🎺', level: 2 }, reward: 6, music: 'dampfer' },
  pixelplan: { cls: Memory, opts: { title: 'Pixel-Plan', icon: '🧩', set: ['🧱', '🏠', '🌳', '🚗', '⭐', '🏰', '🌈', '🚂'] }, reward: 6 },
  taschi_memory: { cls: Memory, opts: { title: 'Taschi-Memory', icon: '🔴', set: ['🦊', '🐢', '🐦', '🐸', '🦔', '🐲', '🐙', '🦄'] }, reward: 6 },
  harfe: { cls: Simon, opts: { title: 'Kristall-Harfe', icon: '🎵', symbols: ['💎', '🔷', '🟢', '🟡', '🟣'], target: 7 }, reward: 8, music: 'atlantis' },
  burger: { cls: Simon, opts: { title: 'Burger-Bestellung', icon: '🍔', symbols: ['🍞', '🥩', '🧀', '🥬', '🍅'], target: 6 }, reward: 5 },
  mondkristall: { cls: Simon, opts: { title: 'Mondkristall-Melodie', icon: '🌙', symbols: ['🌑', '🌒', '🌓', '🌔', '🌕'], target: 6 }, reward: 8, music: 'zotik' },
  elfmeter: { cls: Penalty, opts: { level: 1 }, reward: 6, music: 'fussball' },
  elfmeter_turnier: { cls: Penalty, opts: { level: 3 }, reward: 15, music: 'fussball' },
  frequenz: { cls: Frequency, reward: 6, music: 'radio' },
  runen: { cls: RunenDuell, reward: 8, music: 'spiel' }
};

export class Minigames {
  private active: string | null = null;
  constructor(private g: Game, private audio: AudioEngine) { }
  music(): MusicTheme | null { const m = this.active ? MINIGAMES[this.active]?.music : null; return m ? THEMES[m] ?? null : null; }
  start(id: string, extra: Record<string, unknown> = {}): void {
    const def = MINIGAMES[id];
    if (!def) { this.g.toast('Dieses Spiel gibt es noch nicht.', '🎮'); return; }
    this.active = id;
    const game = new def.cls(this.g, this.audio, { ...def.opts, ...extra });
    runMinigame(this.g, game, r => {
      this.active = null;
      const s = this.g.save;
      const bestKey = 'best_' + id;
      if (r.score > (s.stats[bestKey] ?? 0)) { s.stats[bestKey] = r.score; if (r.score > 0) this.g.toast('Neuer Rekord: ' + r.score, '🏅'); }
      if (r.win) {
        const firstKey = 'win_' + id;
        const first = !s.stats[firstKey];
        s.stats[firstKey] = (s.stats[firstKey] ?? 0) + 1;
        this.g.addStars(first ? def.reward : Math.max(1, Math.round(def.reward / 3)), first ? 'erster Sieg!' : '');
        this.g.addXp(first ? 20 : 5);
      }
      this.g.events.emit('minigame', { id, score: r.score, win: r.win });
      (extra.onEnd as ((w: boolean) => void) | undefined)?.(r.win);
    });
  }
}
