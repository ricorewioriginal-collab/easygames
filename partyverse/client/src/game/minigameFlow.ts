import type { GameState } from '@shared/core/types';
import { getMiniGame } from '@shared/minigames/registry';
import { BotRunner } from '@shared/minigames/simulate';
import type { MiniGame } from '@shared/minigames/types';
import type { App } from '../app/app';
import type { Screen } from '../render/engine';
import { MiniInput } from '../input/controls';
import { MiniStage } from '../minigames/stage';
import type { GameSession } from '../net/session';
import { t } from '../i18n';
import { btn, clear, h } from '../ui/dom';
import { PLAYER_SYMBOLS, playerColor } from '../app/theme';

/**
 * Führt die Minispiele durch: Anleitung → (Gerät weitergeben) → Countdown → Spiel → Ergebnis abgeben.
 * Arbeitet zustandsgesteuert: `update(state)` wird bei jeder Änderung aufgerufen und entscheidet, was angezeigt wird.
 */
export class MinigameFlow {
  readonly el = h('div', { class: 'mgflow' });
  private runKey = '';
  private submitted = new Set<string>();
  private busy = false; // gerade Countdown/Spiel
  private stage: MiniStage | null = null;
  private input: MiniInput | null = null;
  private hud: HTMLElement | null = null;
  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private raf = 0;
  private disposed = false;
  paused = false;

  constructor(
    private readonly app: App,
    private readonly session: GameSession,
    private readonly area: HTMLElement,
    private readonly restore: () => Screen | null,
  ) {}

  private nameOf(id: string): string {
    return this.session.players.find((p) => p.id === id)?.name ?? id;
  }
  private colorIdx(id: string): number {
    return Math.max(
      0,
      this.session.players.findIndex((p) => p.id === id),
    );
  }

  /** Reagiert auf den aktuellen Spielzustand */
  update(s: GameState): void {
    const m = s.minigame;
    if (!m || s.phase !== 'minigame') {
      this.reset();
      return;
    }
    const key = `${m.gameId}:${m.seed}:${s.round}`;
    if (key !== this.runKey) {
      this.reset();
      this.runKey = key;
    }
    if (this.busy) return;
    const game = getMiniGame(m.gameId);
    const mine = this.session.localIds;
    if (m.stage === 'intro') {
      const pend = mine.filter((id) => m.ready[id] === false);
      this.showIntro(game, s, pend[0] ?? null, mine.length > 1);
    } else {
      const todo = mine.filter((id) => m.results[id] === null && !this.submitted.has(id));
      if (todo.length) this.begin(game, s, todo[0] as string, mine.length > 1);
      else this.showWait(game);
    }
  }

  private reset(): void {
    if (!this.busy) clear(this.el);
    if (this.runKey && !this.busy) this.runKey = '';
    this.submitted.clear();
  }

  private cover(...c: Array<Node | null>): void {
    clear(this.el);
    this.el.appendChild(h('div', { class: 'cover' }, ...c));
  }

  private showIntro(g: MiniGame, s: GameState, who: string | null, hot: boolean): void {
    const touch = this.app.touch;
    const idx = who ? this.colorIdx(who) : 0;
    this.cover(
      h(
        'div',
        { class: 'panel' },
        h('div', { class: 'badge' }, t('mg.cat.' + g.category)),
        h('h2', null, g.name),
        h('p', null, g.tagline),
        h('ul', { class: 'instr' }, ...g.instructions.map((x) => h('li', null, x))),
        h('h3', null, t('mg.controls')),
        h('p', null, touch ? g.controls.touch : g.controls.desktop),
        h('p', null, t('mg.duration', { sec: g.duration })),
        who
          ? h(
              'div',
              { style: 'text-align:right;margin-top:10px' },
              btn(
                hot
                  ? t('mg.readyFor', { name: this.nameOf(who) }) + ' ' + (PLAYER_SYMBOLS[idx % 4] ?? '')
                  : t('mg.ready'),
                () => {
                  this.session.act(who, { type: 'minigameReady' });
                },
                'hot big',
              ),
            )
          : h('p', null, t('mg.waitOthers')),
      ),
    );
    void s;
  }

  private showWait(g: MiniGame): void {
    this.cover(h('div', { class: 'panel' }, h('h2', null, g.name), h('p', null, t('mg.waitResults'))));
  }

  private begin(g: MiniGame, s: GameState, who: string, hot: boolean): void {
    const go = (): void => void this.countdown(g, s, who);
    if (hot)
      this.cover(
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('mg.passDevice', { name: this.nameOf(who) })),
          h('p', null, t('mg.getReady')),
          h('div', { style: 'text-align:right' }, btn(t('mg.go'), go, 'hot big')),
        ),
      );
    else go();
  }

  private async countdown(g: MiniGame, s: GameState, who: string): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    const m = s.minigame;
    if (!m) {
      this.busy = false;
      return;
    }
    this.app.audio.music('minigame');
    for (const n of ['3', '2', '1', t('mg.start')]) {
      if (this.disposed) return;
      this.cover(h('div', { class: 'count' }, n));
      this.app.audio.sfx(n === t('mg.start') ? 'go' : 'countdown');
      await new Promise<void>((r) => this.timers.push(setTimeout(r, n === t('mg.start') ? 450 : 700)));
      while (this.paused && !this.disposed)
        await new Promise<void>((r) => this.timers.push(setTimeout(r, 120)));
    }
    if (this.disposed) return;
    clear(this.el);
    this.area.classList.add('mg-on');
    this.input = new MiniInput(this.area, g, this.app.touch);
    const idx = s.order.indexOf(who);
    const stage = new MiniStage(
      g,
      m.seed,
      { playerIndex: Math.max(0, idx), players: s.order.length },
      { quality: this.app.engine.quality, sfx: (n) => this.app.audio.sfx(n), input: this.input },
    );
    this.stage = stage;
    this.hud = h('div', { class: 'mg-hud' }, h('span'), h('span'));
    const hint = h('div', { class: 'mg-hint' });
    const rivals = this.rivalBoard(g, s, who, stage);
    this.el.append(this.hud, hint, rivals.el);
    this.app.engine.setScreen(stage);
    stage.onFinish = (r) => {
      cancelAnimationFrame(this.raf);
      this.submitted.add(who);
      this.session.act(who, { type: 'minigameSubmit', log: r.log });
      this.endRun();
      this.app.audio.sfx('win');
      const back = this.restore();
      if (back) this.app.engine.setScreen(back);
      this.app.audio.music(null);
      this.update(this.session.state);
    };
    const tick = (): void => {
      if (!this.stage) return;
      const hd = g.hud(stage.state);
      const spans = this.hud?.children;
      if (spans?.[0]) spans[0].textContent = hd.left;
      if (spans?.[1]) spans[1].textContent = hd.right;
      hint.textContent = hd.hint ?? '';
      rivals.update();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
    stage.start();
    stage.running = !this.paused;
  }

  /**
   * Live-Punktestand aller Spieler im Minispiel. Bots laufen mit ihrem Seed Takt für Takt mit (gleiches Ergebnis wie
   * im Spielkern), andere Menschen erscheinen, sobald ihr Ergebnis da ist.
   */
  private rivalBoard(
    g: MiniGame,
    s: GameState,
    who: string,
    stage: MiniStage,
  ): { el: HTMLElement; update: () => void } {
    const m = s.minigame;
    const el = h('div', { class: 'mg-rivals' });
    el.setAttribute('aria-hidden', 'true');
    if (!m || s.order.length < 2) return { el, update: () => undefined };
    const team = (id: string): string =>
      m.mode === 'team' ? (m.teams[0]?.includes(id) ? ' A' : m.teams[1]?.includes(id) ? ' B' : '') : '';
    const rows = s.order.map((id, i) => {
      const res = m.results[id];
      const ghost = res?.bot
        ? new BotRunner(g, m.seed, { playerIndex: i, players: s.order.length }, res.bot.skill, res.bot.seed)
        : null;
      const val = h('b', null, '…');
      const idx = this.colorIdx(id);
      const row = h(
        'div',
        { class: id === who ? 'me' : '', style: `--c:${playerColor(idx)}` },
        h('span', null, `${PLAYER_SYMBOLS[idx % 4] ?? ''} ${this.nameOf(id)}${team(id)}`),
        val,
      );
      el.appendChild(row);
      return { id, ghost, val, row, score: -1 };
    });
    const update = (): void => {
      for (const r of rows) {
        let sc: number | undefined;
        if (r.id === who) sc = Math.max(0, g.score(stage.state) || 0);
        else if (r.ghost) {
          for (let n = 0; n < 12 && r.ghost.tick < stage.tick && !r.ghost.done; n++) r.ghost.step();
          sc = r.ghost.score();
        } else sc = this.session.state.minigame?.results[r.id]?.score;
        if (sc === undefined) continue;
        const v = Math.round(sc);
        if (v === r.score) continue;
        r.score = v;
        r.val.textContent = String(v);
      }
      // nach Punkten sortieren (nur wenn sich die Reihenfolge ändert)
      const sorted = rows.slice().sort((a, b) => b.score - a.score);
      if (sorted.some((r, i) => el.children[i] !== r.row)) for (const r of sorted) el.appendChild(r.row);
    };
    return { el, update };
  }

  setPaused(p: boolean): void {
    this.paused = p;
    if (this.stage && !this.stage.finished) this.stage.running = !p;
  }

  private endRun(): void {
    this.area.classList.remove('mg-on');
    this.input?.dispose?.();
    this.input = null;
    this.stage?.dispose();
    this.stage = null;
    this.hud = null;
    clear(this.el);
    this.busy = false;
  }

  dispose(): void {
    this.disposed = true;
    this.area.classList.remove('mg-on');
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    if (this.stage) {
      this.input?.dispose?.();
      this.stage.dispose();
      this.stage = null;
    }
    this.busy = false;
    clear(this.el);
  }
}
