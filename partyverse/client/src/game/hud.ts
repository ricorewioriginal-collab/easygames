import type { PlayerSetup, ItemId } from '@shared/core/types';
import { ITEMS } from '@shared/core/items';
import { PLAYER_SYMBOLS } from '../app/theme';
import { t } from '../i18n';
import { btn, clear, h } from '../ui/dom';

export interface Shown {
  coins: number;
  shards: number;
  items: ItemId[];
  shield: boolean;
}

/** Bedienoberfläche über dem Brett: Punktetafel, Rundenanzeige, Hinweisband, Aktionsleiste, Dialoge, Schwebetexte */
export class Hud {
  readonly el = h('div', { class: 'hud' });
  private sb = h('div', { class: 'sb', 'aria-label': t('hud.scores') });
  private cards = new Map<string, { el: HTMLElement; coins: HTMLElement; shards: HTMLElement; items: HTMLElement }>();
  private round = h('div', { class: 'round' });
  private banner = h('div', { class: 'banner', 'aria-live': 'polite' });
  private actions = h('div', { class: 'actions' });
  private dialog = h('div', { class: 'dialog-wrap' });
  private floats = h('div', { class: 'floats' });
  private bigDice = h('div', { class: 'bigdice' });
  private ticker = h('div', { class: 'ticker', 'aria-live': 'polite' });
  private tickTimer: ReturnType<typeof setTimeout> | null = null;
  readonly menuBtn: HTMLButtonElement;

  constructor(
    readonly players: PlayerSetup[],
    onMenu: () => void,
  ) {
    players.forEach((p, i) => {
      const coins = h('span', { class: 'coins' });
      const shards = h('span', { class: 'shards' });
      const items = h('span', { class: 'items' });
      const el = h('div', { class: `pcard pc${(i % 4) + 1}` }, h('span', { class: 'sym' }, PLAYER_SYMBOLS[i % 4]), h('b', { class: 'nm' }, p.kind === 'bot' ? '🤖 ' + p.name : p.name), coins, shards, items);
      this.cards.set(p.id, { el, coins, shards, items });
      this.sb.appendChild(el);
    });
    this.menuBtn = btn('☰', onMenu, 'ghost menubtn', { 'aria-label': t('pause.title') });
    this.el.append(this.sb, this.round, this.menuBtn, this.banner, this.ticker, this.floats, this.bigDice, this.actions, this.dialog);
  }

  setScores(shown: Record<string, Shown>, current: string | null): void {
    for (const [id, c] of this.cards) {
      const s = shown[id];
      if (!s) continue;
      c.coins.textContent = `✦ ${s.coins}`;
      c.shards.textContent = `◈ ${s.shards}`;
      c.items.textContent = s.items.map((i) => ITEMS[i].icon).join('') + (s.shield ? '🛡️' : '');
      c.el.classList.toggle('now', id === current);
    }
  }
  setRound(round: number, rounds: number, phase: number, phases: number): void {
    this.round.textContent = t('hud.round', { round, rounds }) + (phases > 1 ? ' · ' + t('hud.fold', { phase: phase + 1, phases }) : '');
  }
  setBanner(text: string | null): void {
    this.banner.textContent = text ?? '';
    this.banner.classList.toggle('on', !!text);
  }
  /** Kurze Meldung (verschwindet von selbst) */
  say(text: string, ms = 2600): void {
    this.ticker.textContent = text;
    this.ticker.classList.add('on');
    if (this.tickTimer) clearTimeout(this.tickTimer);
    this.tickTimer = setTimeout(() => this.ticker.classList.remove('on'), ms);
  }
  showDice(total: number, dice: number[]): void {
    this.bigDice.textContent = dice.length > 1 ? `${dice.join(' + ')} = ${total}` : String(total);
    this.bigDice.classList.remove('on');
    void this.bigDice.offsetWidth;
    this.bigDice.classList.add('on');
  }
  hideDice(): void {
    this.bigDice.classList.remove('on');
  }
  float(text: string, x: number, y: number, kind: 'good' | 'bad' | 'info' = 'info'): void {
    const f = h('div', { class: 'float ' + kind, style: `left:${x}px;top:${y}px` }, text);
    this.floats.appendChild(f);
    setTimeout(() => f.remove(), 1500);
  }

  clearActions(): void {
    clear(this.actions);
  }
  setActions(...nodes: Array<Node | null>): void {
    clear(this.actions);
    for (const n of nodes) if (n) this.actions.appendChild(n);
  }
  /** Dialog in der Mitte (Laden, Maut, Altar …) */
  showDialog(title: string, ...body: Array<Node | null>): void {
    clear(this.dialog);
    this.dialog.appendChild(h('div', { class: 'dialog panel', role: 'dialog', 'aria-label': title }, h('h2', null, title), ...body));
    this.dialog.classList.add('on');
  }
  hideDialog(): void {
    clear(this.dialog);
    this.dialog.classList.remove('on');
  }
  get dialogOpen(): boolean {
    return this.dialog.classList.contains('on');
  }
  dispose(): void {
    if (this.tickTimer) clearTimeout(this.tickTimer);
  }
}
