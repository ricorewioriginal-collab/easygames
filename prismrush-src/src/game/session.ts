/**
 * Reine Spiellogik eines Laufs, unabhängig von Rendering und Audio. Sie wird mit
 * der Songzeit der Audiouhr angetrieben und ist dadurch exakt taktsynchron und
 * vollständig testbar.
 */
import { clamp } from '../core/math';
import { STEPS_PER_BEAT } from '../audio/music';
import { LANES, type ChartEvent } from './chart';
import type { DifficultySpec } from './difficulty';
import type { ModeRules } from './modes';
import { ScoreKeeper, WINDOWS, judge, multiplierFor, type Judgement } from './scoring';
import type { Track } from './track';

export type SessionStatus = 'playing' | 'complete' | 'failed';

export type SessionEvent =
  | {
      type: 'judge';
      judgement: Judgement;
      lane: number;
      event: ChartEvent;
      delta: number;
      points: number;
    }
  | { type: 'orb'; lane: number; event: ChartEvent; points: number }
  | { type: 'wall'; lanes: number[]; event: ChartEvent; damaged: boolean }
  | { type: 'overdrive'; active: boolean }
  | { type: 'milestone'; combo: number }
  | { type: 'complete' }
  | { type: 'fail' };

export const OVERDRIVE_BEATS = 16;
const ENERGY_GAIN: Record<Judgement, number> = {
  perfect: 0.045,
  great: 0.03,
  good: 0.015,
  miss: 0,
};

export class GameSession {
  lane = 1;
  health = 1;
  energy = 0;
  status: SessionStatus = 'playing';
  time = 0;
  readonly score: ScoreKeeper;
  private overdriveEnd = -1;
  private cursor = 0;
  private readonly resolved = new Set<number>();
  /** Getroffene Noten und eingesammelte Orbs verschwinden aus der Darstellung. */
  private readonly gone = new Set<number>();
  private readonly listeners: ((e: SessionEvent) => void)[] = [];
  private readonly window: number;

  constructor(
    readonly track: Track,
    readonly rules: ModeRules,
    readonly difficulty: DifficultySpec,
  ) {
    this.score = new ScoreKeeper(difficulty.scoreMul * rules.scoreMul);
    this.window = WINDOWS.good * difficulty.windowScale;
  }

  on(listener: (e: SessionEvent) => void): void {
    this.listeners.push(listener);
  }

  private emit(e: SessionEvent): void {
    for (const l of this.listeners) l(e);
  }

  get overdriveActive(): boolean {
    return this.time < this.overdriveEnd;
  }

  get multiplier(): number {
    return multiplierFor(this.score.combo) * (this.overdriveActive ? 2 : 1);
  }

  isResolved(id: number): boolean {
    return this.resolved.has(id);
  }

  isGone(id: number): boolean {
    return this.gone.has(id);
  }

  /** Index des ersten noch offenen Ereignisses (für das Rendering). */
  get firstOpenIndex(): number {
    return this.cursor;
  }

  update(t: number): void {
    if (this.status !== 'playing') return;
    const wasOverdrive = this.overdriveActive;
    this.time = t;
    this.track.ensureUntil(this.track.stepAt(t + 6));
    const evs = this.track.events;
    for (let i = this.cursor; i < evs.length; i++) {
      const ev = evs[i];
      if (ev.time > t) break;
      if (this.resolved.has(ev.id)) continue;
      if (ev.kind === 'note') {
        if (t > ev.time + this.window) this.resolveNote(ev, 'miss', t - ev.time);
      } else if (ev.kind === 'orb') {
        this.resolved.add(ev.id);
        const got = this.lane === ev.lane;
        const pts = this.score.orb(got, this.overdriveActive ? 2 : 1);
        if (got) {
          this.gone.add(ev.id);
          this.energy = clamp(this.energy + 0.03, 0, 1);
          this.health = clamp(this.health + 0.005, 0, 1);
          this.emit({ type: 'orb', lane: ev.lane, event: ev, points: pts });
        }
      } else {
        this.resolved.add(ev.id);
        const hit = ev.lanes.includes(this.lane);
        if (hit) {
          this.score.wall();
          if (this.rules.wallDamage) this.damage(this.difficulty.wallDamage);
          if (this.rules.oneMistakeFails) this.health = 0;
        }
        this.emit({ type: 'wall', lanes: ev.lanes, event: ev, damaged: hit });
      }
      if (this.status !== 'playing') return;
    }
    while (this.cursor < evs.length && this.resolved.has(evs[this.cursor].id)) {
      this.cursor++;
    }
    if (wasOverdrive && !this.overdriveActive) this.emit({ type: 'overdrive', active: false });
    this.checkEnd();
  }

  private checkEnd(): void {
    if (this.status !== 'playing') return;
    if (this.rules.canFail && this.health <= 0) {
      this.status = 'failed';
      this.emit({ type: 'fail' });
      return;
    }
    if (
      !this.track.endless &&
      this.time >= this.track.duration &&
      this.cursor >= this.track.events.length
    ) {
      this.status = 'complete';
      this.emit({ type: 'complete' });
    }
  }

  private damage(amount: number): void {
    if (!this.rules.canFail) return;
    this.health = clamp(this.health - amount, 0, 1);
  }

  private resolveNote(ev: ChartEvent, j: Judgement, delta: number): void {
    this.resolved.add(ev.id);
    const pts = this.score.register(j, this.overdriveActive ? 2 : 1);
    if (j === 'miss') {
      this.damage(this.difficulty.missDamage);
      if (this.rules.oneMistakeFails) this.health = 0;
    } else {
      this.gone.add(ev.id);
      this.energy = clamp(this.energy + ENERGY_GAIN[j], 0, 1);
      this.health = clamp(this.health + (j === 'perfect' ? 0.015 : 0.008), 0, 1);
      if (this.score.combo > 0 && this.score.combo % 25 === 0) {
        this.emit({ type: 'milestone', combo: this.score.combo });
      }
    }
    this.emit({ type: 'judge', judgement: j, lane: ev.lane, event: ev, delta, points: pts });
  }

  /** Spur wählen und dort einen Treffer versuchen (Spurtasten, Tippen). */
  pressLane(lane: number, t: number): Judgement | null {
    if (this.status !== 'playing') return null;
    this.lane = clamp(Math.round(lane), 0, LANES - 1);
    return this.tryHit(this.lane, t);
  }

  /** Spur relativ wechseln (Wischgesten, Pfeiltasten im Wechselmodus). */
  shift(dir: -1 | 1): void {
    if (this.status !== 'playing') return;
    this.lane = clamp(this.lane + dir, 0, LANES - 1);
  }

  /** Treffer auf der aktuellen Spur (Leertaste, Tippen). */
  hit(t: number): Judgement | null {
    if (this.status !== 'playing') return null;
    return this.tryHit(this.lane, t);
  }

  private tryHit(lane: number, t: number): Judgement | null {
    const evs = this.track.events;
    let best: ChartEvent | null = null;
    let bestD = Infinity;
    for (let i = this.cursor; i < evs.length; i++) {
      const ev = evs[i];
      if (ev.time > t + this.window) break;
      if (ev.kind !== 'note' || ev.lane !== lane || this.resolved.has(ev.id)) continue;
      const d = Math.abs(ev.time - t);
      if (d < bestD) {
        bestD = d;
        best = ev;
      }
    }
    if (!best) return null;
    const j = judge(t - best.time, this.difficulty.windowScale);
    if (!j) return null;
    this.resolveNote(best, j, t - best.time);
    return j;
  }

  activateOverdrive(): boolean {
    if (this.status !== 'playing' || this.energy < 1 || this.overdriveActive) return false;
    this.energy = 0;
    this.overdriveEnd = this.time + this.track.timeOfStep(OVERDRIVE_BEATS * STEPS_PER_BEAT);
    this.emit({ type: 'overdrive', active: true });
    return true;
  }

  /** Verbleibende Overdrive-Zeit als Anteil 0..1. */
  overdriveRemaining(): number {
    if (!this.overdriveActive) return 0;
    return (
      (this.overdriveEnd - this.time) / this.track.timeOfStep(OVERDRIVE_BEATS * STEPS_PER_BEAT)
    );
  }

  /** Fortschritt 0..1 bei endlichen Strecken. */
  progress(): number {
    if (this.track.endless) return 0;
    return clamp(this.time / this.track.duration, 0, 1);
  }

  /** Springt ohne Wertung zu Zeit t (Einstieg mitten im Stück). */
  skipTo(t: number): void {
    const evs = this.track.events;
    for (const ev of evs) {
      if (ev.time >= t) break;
      this.resolved.add(ev.id);
      this.gone.add(ev.id);
    }
    while (this.cursor < evs.length && this.resolved.has(evs[this.cursor].id)) this.cursor++;
    this.time = t;
  }

  /** Nächste offene Note (für Autoplay/Tests). */
  nextNote(): ChartEvent | null {
    const evs = this.track.events;
    for (let i = this.cursor; i < evs.length; i++) {
      if (evs[i].kind === 'note' && !this.resolved.has(evs[i].id)) return evs[i];
    }
    return null;
  }

  /** Spur, die bei Zeit t frei von Wänden ist und erreichbar bleibt. */
  safeLaneAt(t: number, preferred: number): number {
    const evs = this.track.events;
    const blocked = new Set<number>();
    for (let i = this.cursor; i < evs.length; i++) {
      const ev = evs[i];
      if (ev.time > t + 0.12) break;
      if (ev.kind === 'wall' && ev.time >= t - 0.02 && !this.resolved.has(ev.id)) {
        for (const l of ev.lanes) blocked.add(l);
      }
    }
    if (!blocked.has(preferred)) return preferred;
    for (const l of [1, 0, 2]) if (!blocked.has(l)) return l;
    return preferred;
  }
}
