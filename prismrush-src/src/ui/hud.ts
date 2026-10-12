/** In-Game-Anzeige mit großen Touch-Bedienelementen. */
import { h } from '../core/dom';
import { formatScore, formatTime } from '../core/math';
import type { GameAction } from '../input/actions';
import type { Judgement } from '../game/scoring';

export interface HudState {
  score: number;
  combo: number;
  multiplier: number;
  health: number;
  energy: number;
  overdrive: number;
  progress: number;
  elapsed: number;
  endless: boolean;
  lane: number;
  showHealth: boolean;
}

const JUDGE_TEXT: Record<Judgement, string> = {
  perfect: 'PERFEKT',
  great: 'SUPER',
  good: 'GUT',
  miss: 'VERFEHLT',
};

export class Hud {
  readonly root: HTMLElement;
  private readonly score = h('div', {
    class: 'hud-score',
    attrs: { 'data-testid': 'hud-score' },
    text: '0',
  });
  private readonly combo = h('div', { class: 'hud-combo', attrs: { 'data-testid': 'hud-combo' } });
  private readonly mult = h('div', { class: 'hud-mult', text: '×1' });
  private readonly healthFill = h('div', { class: 'bar-fill health' });
  private readonly healthBar = h(
    'div',
    { class: 'bar', attrs: { 'aria-label': 'Energie des Gleiters' } },
    [this.healthFill],
  );
  private readonly energyFill = h('div', { class: 'bar-fill energy' });
  private readonly progressFill = h('div', { class: 'progress-fill' });
  private readonly timeLabel = h('div', { class: 'hud-time' });
  private readonly judge = h('div', {
    class: 'hud-judge',
    attrs: { 'data-testid': 'hud-judge', 'aria-live': 'polite' },
  });
  private readonly countdown = h('div', {
    class: 'hud-countdown',
    attrs: { 'data-testid': 'hud-countdown' },
  });
  private readonly hint = h('div', { class: 'hud-hint', attrs: { 'data-testid': 'hud-hint' } });
  private readonly odButton: HTMLButtonElement;
  private readonly pads: HTMLElement;
  private readonly padButtons: HTMLButtonElement[] = [];
  private last: Partial<Record<string, string>> = {};
  private judgeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(emit: (a: GameAction, at: number) => void, onPause: () => void) {
    const pauseBtn = h('button', {
      class: 'hud-pause',
      text: 'II',
      attrs: { type: 'button', 'aria-label': 'Pause', 'data-testid': 'pause-button' },
      on: {
        pointerdown: (e) => e.stopPropagation(),
        click: (e) => {
          e.stopPropagation();
          onPause();
        },
      },
    });
    this.odButton = h('button', {
      class: 'hud-od',
      text: '⚡',
      attrs: {
        type: 'button',
        'aria-label': 'Overdrive zünden',
        'data-testid': 'overdrive-button',
      },
      on: {
        pointerdown: (e) => {
          e.preventDefault();
          e.stopPropagation();
          emit({ type: 'overdrive' }, e.timeStamp);
        },
      },
    });
    const labels = ['◀', '●', '▶'];
    this.pads = h('div', { class: 'pads', attrs: { 'data-testid': 'touch-pads' } });
    for (let l = 0; l < 3; l++) {
      const b = h('button', {
        class: 'pad',
        text: labels[l],
        attrs: { type: 'button', 'aria-label': `Spur ${l + 1}`, 'data-testid': `pad-${l}` },
        on: {
          pointerdown: (e) => {
            e.preventDefault();
            e.stopPropagation();
            emit({ type: 'lane', lane: l }, e.timeStamp);
            b.classList.remove('flash');
            void b.offsetWidth;
            b.classList.add('flash');
          },
          contextmenu: (e) => e.preventDefault(),
        },
      });
      this.padButtons.push(b);
      this.pads.append(b);
    }
    this.root = h('div', { class: 'hud', attrs: { 'data-testid': 'hud', hidden: true } }, [
      h('div', { class: 'hud-top' }, [
        h('div', { class: 'hud-left' }, [
          this.score,
          h('div', { class: 'hud-row' }, [this.mult, this.combo]),
        ]),
        h('div', { class: 'hud-right' }, [this.timeLabel, pauseBtn]),
      ]),
      h('div', { class: 'hud-progress' }, [this.progressFill]),
      h('div', { class: 'hud-bars' }, [
        this.healthBar,
        h('div', { class: 'bar energy-bar' }, [this.energyFill]),
        this.odButton,
      ]),
      this.countdown,
      this.judge,
      this.hint,
      this.pads,
    ]);
  }

  show(visible: boolean): void {
    this.root.hidden = !visible;
  }

  setPadsVisible(visible: boolean): void {
    this.pads.hidden = !visible;
    this.root.classList.toggle('with-pads', visible);
  }

  private set(key: string, el: HTMLElement, text: string): void {
    if (this.last[key] === text) return;
    this.last[key] = text;
    el.textContent = text;
  }

  update(s: HudState): void {
    this.set('score', this.score, formatScore(s.score));
    this.set('combo', this.combo, s.combo >= 2 ? `${s.combo} Combo` : '');
    this.set('mult', this.mult, `×${s.multiplier}`);
    this.mult.classList.toggle('hot', s.multiplier >= 4);
    this.healthBar.hidden = !s.showHealth;
    this.healthFill.style.transform = `scaleX(${s.health.toFixed(3)})`;
    this.healthFill.classList.toggle('low', s.health < 0.3);
    const energy = s.overdrive > 0 ? s.overdrive : s.energy;
    this.energyFill.style.transform = `scaleX(${energy.toFixed(3)})`;
    this.energyFill.classList.toggle('active', s.overdrive > 0);
    this.odButton.classList.toggle('ready', s.energy >= 1 && s.overdrive === 0);
    this.progressFill.style.transform = `scaleX(${s.progress.toFixed(4)})`;
    this.set('time', this.timeLabel, formatTime(s.elapsed));
    for (let l = 0; l < 3; l++) this.padButtons[l].classList.toggle('current', l === s.lane);
  }

  showJudgement(j: Judgement, combo: number): void {
    this.judge.textContent =
      j === 'miss' ? JUDGE_TEXT[j] : `${JUDGE_TEXT[j]}${combo >= 10 ? ` ${combo}` : ''}`;
    this.judge.className = `hud-judge show j-${j}`;
    if (this.judgeTimer) clearTimeout(this.judgeTimer);
    this.judgeTimer = setTimeout(() => (this.judge.className = 'hud-judge'), 420);
  }

  flashMessage(text: string): void {
    this.judge.textContent = text;
    this.judge.className = 'hud-judge show j-special';
    if (this.judgeTimer) clearTimeout(this.judgeTimer);
    this.judgeTimer = setTimeout(() => (this.judge.className = 'hud-judge'), 900);
  }

  setCountdown(text: string): void {
    this.set('countdown', this.countdown, text);
    this.countdown.classList.toggle('show', text !== '');
  }

  setHint(text: string | null): void {
    this.set('hint', this.hint, text ?? '');
    this.hint.classList.toggle('show', !!text);
  }

  reset(): void {
    this.last = {};
    this.judge.className = 'hud-judge';
    this.setCountdown('');
    this.setHint(null);
  }
}
