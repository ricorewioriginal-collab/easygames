import * as THREE from 'three';
import { getLayout } from '@shared/levels';
import { EVENTS, ITEMS } from '@shared/core/items';
import type { GameEvent, GameState, ItemId, PlayerSetup } from '@shared/core/types';
import type { WorldId } from '@shared/levels/types';
import type { App } from '../app/app';
import { recordGame } from '../app/achievements';
import { playerColorHex } from '../app/theme';
import type { GameSession } from '../net/session';
import { LocalSession } from '../net/session';
import { t } from '../i18n';
import { btn, clear, h, slider, toast, toggle } from '../ui/dom';
import { BoardStage } from './boardStage';
import { FinaleStage, finaleOverlay } from './finale';
import { Hud, type Shown } from './hud';
import { MinigameFlow } from './minigameFlow';

const KIND_ICON: Record<string, string> = {
  start: '🏁',
  glimmer: '✦',
  thorn: '☠',
  event: '❓',
  item: '🎁',
  shop: '🛒',
  portal: '🌀',
  gate: '🚧',
  chaos: '🎭',
};
const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Das laufende Spiel: verbindet Sitzung (lokal/online), 3D-Brett, Oberfläche, Minispiele und Siegerehrung. */
export class GameScreen {
  readonly el = h('div', { class: 'game' });
  private readonly layout = getLayout(this.session.layoutId);
  private readonly stage: BoardStage;
  private readonly hud: Hud;
  private readonly flow: MinigameFlow;
  private readonly overlay = h('div', { class: 'overlay' });
  private queue: GameEvent[] = [];
  private pumping = false;
  private shown: Record<string, Shown> = {};
  private scores: Record<string, number> = {};
  private offs: Array<() => void> = [];
  private disposed = false;
  private paused = false;
  private handover: string | null = null;
  private finaleStage: FinaleStage | null = null;
  private finaleDone = false;
  private minigamesSeen = 0;
  private minigameWins = 0;
  private startedAt = Date.now();
  private cleanup: Array<() => void> = [];
  private connEl: HTMLElement | null = null;
  private lastPromptKey = '';

  constructor(
    private readonly app: App,
    private readonly session: GameSession,
  ) {
    const s = app.store.data;
    const mainId = session.localIds[0] ?? null;
    this.stage = new BoardStage(this.layout, session.players, {
      quality: app.engine.quality,
      shake: s.settings.cameraShake,
      calm: s.settings.reducedMotion,
      hat: s.cosmetics.hat,
      trail: s.cosmetics.trail,
      dice: s.cosmetics.dice,
      cosmeticFor: mainId,
    });
    this.hud = new Hud(session.players, () => this.openPause());
    this.flow = new MinigameFlow(app, session, this.el, () => (this.finaleStage ? null : this.stage));
    this.el.append(this.hud.el, this.flow.el, this.overlay);
  }

  private get state(): GameState {
    return this.session.state;
  }
  private nameOf(id: string): string {
    return this.session.players.find((p) => p.id === id)?.name ?? id;
  }
  private idx(id: string): number {
    return Math.max(
      0,
      this.session.players.findIndex((p) => p.id === id),
    );
  }

  // ------------------------------------------------------------------ Start
  start(): void {
    const { app, session, stage } = this;
    app.engine.setScreen(stage);
    app.engine.start();
    app.audio.music(this.layout.world as WorldId);
    this.syncAll();
    this.offs.push(
      session.onUpdate((events, full) => this.enqueue(events, full)),
      session.onMessage((k, text) => toast(text, k === 'error' ? 'error' : 'info')),
      session.onConnection((c) => this.onConnection(c)),
    );
    this.bindInput();
    if (this.state.phase === 'ended') this.reflect();
    else if (session.initialEvents.length && this.state.round === 1 && !this.state.lastDice)
      this.enqueue(session.initialEvents, false);
    else this.reflect();
    if (session instanceof LocalSession) session.start();
  }

  /** Setzt Figuren, Altar, Faltung und Anzeigewerte direkt auf den Spielzustand (Start, Wiederverbindung) */
  private syncAll(): void {
    const s = this.state;
    for (const p of this.session.players) {
      const ps = s.players[p.id];
      if (ps) this.stage.place(p.id, ps.position);
    }
    this.stage.setAltar(s.altar);
    this.stage.setFold(this.session.core.effectivePhase(), true);
    this.syncShown();
    if (s.current) {
      this.stage.setActive(s.current);
      this.stage.viewFollow(s.current);
    }
  }
  private syncShown(): void {
    for (const [id, p] of Object.entries(this.state.players))
      this.shown[id] = { coins: p.coins, shards: p.shards, items: [...p.items], shield: p.shield };
    this.hud.setScores(this.shown, this.state.current || null);
    this.hud.setRound(
      this.state.round,
      this.state.rounds,
      this.session.core.effectivePhase(),
      this.layout.foldPhases,
    );
  }

  // ------------------------------------------------------------------ Ereignisse
  private enqueue(events: GameEvent[], full: boolean): void {
    if (this.disposed) return;
    if (full) {
      this.queue = [];
      this.syncAll();
      this.reflect();
      return;
    }
    this.queue.push(...events);
    if (this.queue.length) void this.pump();
    else if (!this.pumping) this.reflect();
  }

  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;
    this.session.setBusy(true);
    this.hud.clearActions();
    this.hud.setBanner(null);
    this.stage.highlight([]);
    while (this.queue.length && !this.disposed) {
      const ev = this.queue.shift() as GameEvent;
      try {
        await this.animate(ev);
      } catch (e) {
        console.error(e);
      }
      while (this.paused && !this.disposed) await delay(100);
    }
    this.pumping = false;
    if (this.disposed) return;
    this.syncShown();
    this.session.setBusy(false);
    this.reflect();
  }

  private float(id: string, text: string, kind: 'good' | 'bad' | 'info'): void {
    const r = this.el.getBoundingClientRect();
    const p = this.stage.project(this.stage.tokenHead(id), r.width, r.height);
    if (p.visible) this.hud.float(text, p.x, p.y, kind);
  }
  private refreshScores(): void {
    this.hud.setScores(this.shown, this.state.current || null);
  }

  private async animate(ev: GameEvent): Promise<void> {
    const { stage, hud, app } = this;
    const sfx = (n: string): void => app.audio.sfx(n);
    switch (ev.t) {
      case 'order':
        hud.say(t('ev.order', { names: ev.order.map((id) => this.nameOf(id)).join(' → ') }), 2800);
        await delay(1400);
        break;
      case 'round':
        hud.setRound(ev.round, this.state.rounds, ev.foldPhase, this.layout.foldPhases);
        if (this.layout.foldPhases > 1) stage.setFold(ev.foldPhase);
        stage.viewOverview();
        hud.say(t('ev.round', { round: ev.round }), 1800);
        sfx('fold');
        await delay(1300);
        break;
      case 'turn':
        stage.setActive(ev.player);
        stage.viewFollow(ev.player);
        this.refreshScoresFor(ev.player);
        hud.setBanner(t('ev.turn', { name: this.nameOf(ev.player) }));
        sfx('turn');
        await delay(550);
        break;
      case 'itemUsed':
        hud.say(t('ev.item', { name: this.nameOf(ev.player), item: ITEMS[ev.item].name }));
        sfx('item');
        stage.burstAt(ev.player, 0x9a7bff, 16);
        this.removeItem(ev.player, ev.item);
        await delay(900);
        break;
      case 'dice':
        sfx('dice');
        await stage.rollDice(ev.player, ev.dice);
        sfx('diceLand');
        hud.showDice(ev.total, ev.dice);
        if (ev.bonus)
          hud.say(
            ev.bonus > 0 ? t('ev.bonusPlus', { n: ev.bonus }) : t('ev.bonusMinus', { n: -ev.bonus }),
            1800,
          );
        await delay(850);
        stage.hideDice();
        break;
      case 'step':
        hud.setBanner(ev.remaining > 0 ? t('ev.steps', { n: ev.remaining }) : null);
        await stage.hop(ev.player, ev.to);
        sfx('step');
        break;
      case 'pass':
        this.float(ev.player, t('ev.pass', { name: this.nameOf(ev.other) }), 'info');
        break;
      case 'land':
        hud.setBanner(null);
        stage.burstNode(ev.node, ev.kind === 'thorn' ? 0xff5a7a : 0xffffff, 10);
        await delay(180);
        break;
      case 'coins': {
        const s = this.shown[ev.player];
        if (s) s.coins = Math.max(0, s.coins + ev.delta);
        this.refreshScores();
        this.float(ev.player, `${ev.delta > 0 ? '+' : ''}${ev.delta} ✦`, ev.delta > 0 ? 'good' : 'bad');
        sfx(ev.delta > 0 ? 'coin' : 'coinLoss');
        stage.burstAt(ev.player, ev.delta > 0 ? 0xffd23f : 0xff5a7a, 10);
        if (ev.delta < 0) stage.react(ev.player, 'shock');
        await delay(520);
        break;
      }
      case 'shard': {
        const s = this.shown[ev.player];
        if (s) s.shards++;
        this.refreshScores();
        stage.viewFocus(this.state.altar, 11);
        stage.react(ev.player, 'win');
        stage.burstAt(ev.player, 0x35f0ff, 40);
        hud.say(t('ev.shard', { name: this.nameOf(ev.player) }), 2200);
        sfx('shard');
        stage.shake();
        await delay(1700);
        break;
      }
      case 'itemGot': {
        const s = this.shown[ev.player];
        if (s && s.items.length < 3) s.items.push(ev.item);
        this.refreshScores();
        this.float(ev.player, ITEMS[ev.item].icon + ' ' + ITEMS[ev.item].name, 'good');
        sfx('item');
        await delay(650);
        break;
      }
      case 'teleport':
        sfx('portal');
        stage.shake(0.2, 0.3);
        await stage.teleport(ev.player, ev.to);
        stage.viewFollow(ev.player);
        break;
      case 'swap':
        sfx('swap');
        hud.say(t('ev.swap', { a: this.nameOf(ev.a), b: this.nameOf(ev.b) }));
        await stage.swap(ev.a, ev.b);
        break;
      case 'steal':
        sfx('steal');
        this.float(ev.from, `−${ev.amount} ✦`, 'bad');
        this.float(ev.to, `+${ev.amount} ✦`, 'good');
        hud.say(t('ev.steal', { to: this.nameOf(ev.to), from: this.nameOf(ev.from), n: ev.amount }), 2200);
        await delay(900);
        break;
      case 'blocked':
        sfx('bad');
        hud.say(ev.reason, 2200);
        await delay(800);
        break;
      case 'event': {
        const def = EVENTS[ev.id];
        sfx('event');
        hud.say(`${def.icon} ${def.name}: ${def.text}`, 3000);
        stage.react(ev.player, def.good ? 'cheer' : 'shock');
        await delay(1900);
        break;
      }
      case 'fold':
        stage.setFold(ev.phase);
        sfx('fold');
        stage.shake(0.4, 0.8);
        hud.say(t('ev.fold'), 2200);
        stage.viewOverview();
        await delay(1500);
        break;
      case 'altarMoved':
        stage.setAltar(ev.node);
        stage.viewFocus(ev.node, 14);
        hud.say(t('ev.altar'), 2000);
        sfx('event');
        await delay(1300);
        break;
      case 'minigameStart':
        this.scores = {};
        this.minigamesSeen++;
        stage.viewOverview();
        hud.say(t('ev.minigame'), 1600);
        sfx('fanfare');
        await delay(1200);
        break;
      case 'minigameResult':
        this.scores[ev.player] = ev.score;
        break;
      case 'minigameDone':
        if (ev.winners.some((w) => this.session.localIds.includes(w))) this.minigameWins++;
        await this.showMinigameResults(ev.ranking, ev.rewards, ev.winners);
        app.audio.music(this.layout.world as WorldId);
        break;
      case 'turnEnd':
        stage.hideDice();
        hud.hideDice();
        break;
      case 'finale':
        break;
    }
  }

  private refreshScoresFor(current: string): void {
    this.hud.setScores(this.shown, current);
  }
  private removeItem(id: string, item: ItemId): void {
    const s = this.shown[id];
    if (!s) return;
    const i = s.items.indexOf(item);
    if (i >= 0) s.items.splice(i, 1);
    this.refreshScores();
  }

  private showMinigameResults(
    ranking: string[],
    rewards: Record<string, number>,
    winners: string[],
  ): Promise<void> {
    return new Promise((resolve) => {
      this.app.audio.music('results');
      const list = h('div', { class: 'rank' });
      ranking.forEach((id, i) => {
        const sc = this.scores[id];
        list.appendChild(
          h(
            'div',
            { class: `rrow pc${(this.idx(id) % 4) + 1}${winners.includes(id) ? ' w' : ''}` },
            h('span', { class: 'pos' }, ['🥇', '🥈', '🥉', '4.'][i] ?? String(i + 1)),
            h('span', null, this.nameOf(id)),
            h('span', null, sc === undefined ? '' : String(Math.round(sc))),
            h('span', { class: 'coins' }, `+${rewards[id] ?? 0} ✦`),
          ),
        );
      });
      for (const id of winners) this.stage.react(id, 'celebrate');
      let done = false;
      const finish = (): void => {
        if (done) return;
        done = true;
        clear(this.overlay);
        resolve();
      };
      clear(this.overlay);
      this.overlay.appendChild(
        h(
          'div',
          { class: 'cover' },
          h(
            'div',
            { class: 'panel' },
            h('h2', null, t('mg.results')),
            list,
            h('div', { style: 'text-align:right' }, btn(t('mg.continue'), finish, 'hot')),
          ),
        ),
      );
      this.app.audio.sfx(winners.some((w) => this.session.localIds.includes(w)) ? 'win' : 'lose');
      setTimeout(finish, 12000);
    });
  }

  // ------------------------------------------------------------------ Zustand → Oberfläche
  private reflect(): void {
    if (this.disposed || this.pumping) return;
    const s = this.state;
    const { hud, stage } = this;
    this.syncShown();
    // Figuren-Position absichern (z. B. nach Neusynchronisierung)
    for (const p of this.session.players) {
      const ps = s.players[p.id];
      if (ps && stage.positionOf(p.id) !== ps.position) stage.place(p.id, ps.position);
    }
    if (s.phase === 'ended') {
      this.startFinale();
      return;
    }
    this.flow.update(s);
    hud.hideDialog();
    stage.highlight([]);
    if (s.phase === 'minigame') {
      hud.clearActions();
      hud.setBanner(null);
      return;
    }
    const actors = this.session.core.pendingActors();
    const mine = actors.find(
      (id) => this.session.localIds.includes(id) && this.session.core.player(id).kind === 'human',
    );
    if (!mine) {
      hud.clearActions();
      const who = actors[0];
      hud.setBanner(who ? t('hud.thinking', { name: this.nameOf(who) }) : null);
      return;
    }
    // Hot-Seat: Gerät weitergeben, wenn ein anderer lokaler Mensch dran ist
    if (this.session.localIds.length > 1 && this.handover !== mine && s.phase === 'turn') {
      this.askHandover(mine);
      return;
    }
    this.handover = mine;
    this.prompt(mine, s);
  }

  private askHandover(id: string): void {
    this.hud.clearActions();
    clear(this.overlay);
    this.overlay.appendChild(
      h(
        'div',
        { class: 'cover' },
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('hot.pass', { name: this.nameOf(id) })),
          h('p', null, t('hot.hint')),
          h(
            'div',
            { style: 'text-align:right' },
            btn(
              t('hot.ready'),
              () => {
                this.handover = id;
                clear(this.overlay);
                this.reflect();
              },
              'hot big',
            ),
          ),
        ),
      ),
    );
  }

  private prompt(id: string, s: GameState): void {
    const { hud, stage } = this;
    const me = s.players[id];
    if (!me) return;
    stage.setActive(id);
    stage.viewFollow(id);
    const key = `${s.version}:${id}`;
    this.lastPromptKey = key;
    if (s.phase === 'turn' && !s.rolled) {
      const roll = btn(t('act.roll'), () => this.act(id, { type: 'roll' }), 'hot roll');
      const items = [...new Set(me.items)]
        .filter((i) => ITEMS[i].active)
        .map((i) =>
          btn(`${ITEMS[i].icon} ${ITEMS[i].name}`, () => this.useItem(id, i), 'ghost', {
            title: ITEMS[i].description,
          }),
        );
      hud.setBanner(t('hud.yourTurn', { name: this.nameOf(id) }));
      hud.setActions(...items, roll);
      return;
    }
    const pd = s.pending;
    if (s.phase !== 'decision' || !pd) return;
    switch (pd.kind) {
      case 'branch': {
        stage.highlight(pd.options);
        hud.setBanner(t('hud.chooseWay', { n: pd.remaining }));
        hud.setActions(
          ...pd.options.map((n) =>
            btn(
              `${KIND_ICON[this.layout.nodes[n]?.kind ?? 'glimmer'] ?? '•'} ${t('kind.' + (this.layout.nodes[n]?.kind ?? 'glimmer'))}`,
              () => this.act(id, { type: 'chooseBranch', node: n }),
              'good',
            ),
          ),
        );
        break;
      }
      case 'gate':
        hud.showDialog(
          t('gate.title'),
          h('p', null, t('gate.text', { toll: pd.toll })),
          h(
            'div',
            { class: 'chips' },
            btn(
              t('gate.pay', { toll: pd.toll }),
              () => this.act(id, { type: 'gate', choice: 'pay' }),
              'good',
              { disabled: !pd.canPay },
            ),
            btn(t('gate.key'), () => this.act(id, { type: 'gate', choice: 'key' }), 'hot', {
              disabled: !pd.hasKey,
            }),
            btn(t('gate.back'), () => this.act(id, { type: 'gate', choice: 'back' }), 'ghost'),
          ),
        );
        break;
      case 'altar':
        stage.viewFocus(s.altar, 11);
        hud.showDialog(
          t('altar.title'),
          h('p', null, t('altar.text', { cost: pd.cost, coins: me.coins })),
          h(
            'div',
            { class: 'chips' },
            btn(t('altar.buy', { cost: pd.cost }), () => this.act(id, { type: 'altar', buy: true }), 'good', {
              disabled: me.coins < pd.cost,
            }),
            btn(t('altar.skip'), () => this.act(id, { type: 'altar', buy: false }), 'ghost'),
          ),
        );
        break;
      case 'shop': {
        const offers = pd.offers.map((it, i) => {
          const d = ITEMS[it];
          return h(
            'div',
            { class: 'offer' },
            h('span', null, d.icon),
            h('span', { class: 'lbl' }, d.name, h('small', null, d.description)),
            btn(`${d.cost} ✦`, () => this.act(id, { type: 'shopBuy', index: i }), 'good', {
              disabled: me.coins < d.cost || me.items.length >= 3,
            }),
          );
        });
        hud.showDialog(
          t('shop.title'),
          h('p', null, t('shop.coins', { coins: me.coins })),
          ...offers,
          h(
            'div',
            { style: 'text-align:right;margin-top:8px' },
            btn(t('shop.leave'), () => this.act(id, { type: 'shopLeave' }), 'hot'),
          ),
        );
        break;
      }
    }
  }

  private useItem(id: string, item: ItemId): void {
    const def = ITEMS[item];
    if (!def.needsTarget) return void this.act(id, { type: 'useItem', item });
    const others = this.session.players.filter((p) => p.id !== id);
    this.hud.showDialog(
      `${def.icon} ${def.name}`,
      h('p', null, def.description),
      h(
        'div',
        { class: 'chips' },
        ...others.map((p) =>
          btn(
            p.name,
            () => {
              this.hud.hideDialog();
              this.act(id, { type: 'useItem', item, target: p.id });
            },
            'hot',
          ),
        ),
        btn(t('back'), () => this.hud.hideDialog(), 'ghost'),
      ),
    );
  }

  private act(id: string, a: Parameters<GameSession['act']>[1]): void {
    if (this.paused || this.pumping) return;
    this.hud.hideDialog();
    this.hud.clearActions();
    this.app.audio.sfx(a.type === 'roll' ? 'whoosh' : 'click');
    const err = this.session.act(id, a);
    if (err) this.reflect();
  }

  // ------------------------------------------------------------------ Eingabe
  private bindInput(): void {
    const el = this.el;
    let down: { x: number; y: number; moved: boolean } | null = null;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (e: PointerEvent): void => {
      if ((e.target as HTMLElement).closest('.hud .actions, .menubtn, .cover, .dialog')) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY, moved: false };
      if (pts.size === 2) {
        const [a, b] = [...pts.values()] as [{ x: number; y: number }, { x: number; y: number }];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent): void => {
      const p = pts.get(e.pointerId);
      if (!p || this.finaleStage) return;
      const dx = e.clientX - p.x;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()] as [{ x: number; y: number }, { x: number; y: number }];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) this.stage.zoomBy(pinch / d);
        pinch = d;
        if (down) down.moved = true;
        return;
      }
      if (down && (Math.abs(e.clientX - down.x) > 8 || Math.abs(e.clientY - down.y) > 8)) down.moved = true;
      if (down?.moved) this.stage.orbit(-dx * 0.006);
    };
    const onUp = (e: PointerEvent): void => {
      const wasTap = down && !down.moved && pts.size === 1;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (wasTap && down) this.onTap(e.clientX, e.clientY);
      if (pts.size === 0) down = null;
    };
    const onWheel = (e: WheelEvent): void => {
      if (this.finaleStage) return;
      this.stage.zoomBy(e.deltaY > 0 ? 1.08 : 0.92);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (this.paused) this.closePause();
        else this.openPause();
        return;
      }
      if (
        (e.code === 'Space' || e.key === 'Enter') &&
        !this.paused &&
        !this.hud.dialogOpen &&
        !this.overlay.firstChild &&
        !this.flow.el.firstChild
      ) {
        const roll = this.el.querySelector<HTMLButtonElement>('.actions .roll');
        if (roll) {
          e.preventDefault();
          roll.click();
        }
      }
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    this.cleanup.push(() => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    });
  }

  private onTap(x: number, y: number): void {
    const s = this.state;
    const pd = s.pending;
    if (this.paused || this.pumping || s.phase !== 'decision' || !pd || pd.kind !== 'branch') return;
    if (!this.session.localIds.includes(pd.player)) return;
    const r = this.el.getBoundingClientRect();
    const n = this.stage.pickNode(
      ((x - r.left) / r.width) * 2 - 1,
      -(((y - r.top) / r.height) * 2 - 1),
      pd.options,
    );
    if (n !== null) this.act(pd.player, { type: 'chooseBranch', node: n });
  }

  // ------------------------------------------------------------------ Pause / Menü
  private openPause(): void {
    if (this.paused || this.finaleStage) return;
    this.paused = true;
    const online = this.session.kind === 'online' || this.session.shared === true;
    if (!online) {
      this.app.engine.stop();
      this.session.setBusy(true);
    }
    this.flow.setPaused(!online);
    const s = this.app.store;
    const body = h(
      'div',
      { class: 'panel' },
      h('h2', null, t('pause.title')),
      online ? h('p', null, t('pause.onlineNote')) : null,
      slider(t('opt.master'), s.data.settings.master, 0, 1, 0.05, (v) =>
        s.update((d) => {
          d.settings.master = v;
        }),
      ),
      slider(t('opt.music'), s.data.settings.music, 0, 1, 0.05, (v) =>
        s.update((d) => {
          d.settings.music = v;
        }),
      ),
      toggle(t('opt.mute'), s.data.settings.muted, (v) =>
        s.update((d) => {
          d.settings.muted = v;
        }),
      ),
      h(
        'div',
        { class: 'pausebtns' },
        btn(t('pause.resume'), () => this.closePause(), 'good big'),
        btn(t('pause.rules'), () => this.showRulesBrief(), 'ghost'),
        btn(t('pause.leave'), () => this.confirmLeave(), 'ghost'),
      ),
    );
    clear(this.overlay);
    this.overlay.appendChild(h('div', { class: 'cover' }, body));
  }
  private closePause(): void {
    if (!this.paused) return;
    this.paused = false;
    clear(this.overlay);
    if (this.session.kind === 'local' && !this.session.shared) {
      this.app.engine.start();
      this.session.setBusy(this.pumping);
    }
    this.flow.setPaused(false);
  }
  private showRulesBrief(): void {
    clear(this.overlay);
    this.overlay.appendChild(
      h(
        'div',
        { class: 'cover' },
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('pause.rules')),
          h('p', null, t('rules.goal', { cost: 20 })),
          h('p', null, t('rules.turn')),
          h('p', null, t('rules.fold')),
          h(
            'div',
            { style: 'text-align:right' },
            btn(
              t('back'),
              () => {
                this.paused = false;
                this.openPause();
              },
              'hot',
            ),
          ),
        ),
      ),
    );
  }
  private confirmLeave(): void {
    clear(this.overlay);
    this.overlay.appendChild(
      h(
        'div',
        { class: 'cover' },
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('pause.leaveAsk')),
          h('p', null, t('pause.leaveWarn')),
          h(
            'div',
            { class: 'chips' },
            btn(t('pause.leaveYes'), () => void this.app.toMenu(), 'hot'),
            btn(
              t('back'),
              () => {
                this.paused = false;
                this.openPause();
              },
              'ghost',
            ),
          ),
        ),
      ),
    );
  }

  // ------------------------------------------------------------------ Verbindung (online)
  private onConnection(c: 'ok' | 'lost' | 'closed'): void {
    if (c === 'ok') {
      this.connEl?.remove();
      this.connEl = null;
      return;
    }
    if (c === 'closed') {
      toast(t('online.closed'), 'error', 5000);
      void this.app.toMenu();
      return;
    }
    if (!this.connEl) {
      this.connEl = h('div', { class: 'conn', role: 'alert' }, t('online.reconnecting'));
      this.el.appendChild(this.connEl);
    }
    void this.tryReconnect(0);
  }
  private async tryReconnect(n: number): Promise<void> {
    const net = this.app.online;
    if (!net || this.disposed) return;
    if (n >= 8) {
      toast(t('online.closed'), 'error', 5000);
      void this.app.toMenu();
      return;
    }
    await delay(1500);
    if (this.disposed) return;
    if (await net.tryReconnect()) {
      this.connEl?.remove();
      this.connEl = null;
      toast(t('online.reconnected'), 'good');
    } else void this.tryReconnect(n + 1);
  }

  // ------------------------------------------------------------------ Finale
  private startFinale(): void {
    if (this.finaleStage) return;
    const s = this.state;
    const ranking = s.finale?.ranking ?? s.order;
    const world = this.layout.world as WorldId;
    const fs = new FinaleStage(
      ranking,
      this.session.players,
      world,
      this.app.engine.quality,
      this.app.store.data.settings.reducedMotion,
    );
    this.finaleStage = fs;
    this.el.classList.add('finale-on');
    this.hud.clearActions();
    this.hud.setBanner(null);
    this.flow.update(s);
    this.app.engine.setScreen(fs);
    this.app.audio.music('finale');
    clear(this.overlay);
    const again =
      this.session instanceof LocalSession && this.session.canRestart
        ? (): void => void this.restartLocal()
        : null;
    const ov = finaleOverlay(s, this.session.players, fs, (n) => this.app.audio.sfx(n), {
      again,
      menu: () => void this.app.toMenu(),
    });
    this.overlay.appendChild(ov.el);
    this.cleanup.push(ov.dispose);
    this.recordStats(ranking);
  }

  private recordStats(ranking: string[]): void {
    if (this.finaleDone) return;
    this.finaleDone = true;
    const me = this.session.localIds[0];
    if (!me) return;
    const p = this.state.players[me];
    if (!p) return;
    const rank = ranking.indexOf(me);
    const world = this.layout.world;
    try {
      let newly: string[] = [];
      this.app.store.update((d) => {
        newly = recordGame(d, {
          layoutId: this.layout.id,
          world,
          won: rank === 0,
          online: this.session.kind === 'online' || this.session.shared === true,
          rounds: this.state.rounds,
          players: this.session.players.length,
          coinsEarned: p.stats.coinsEarned,
          steps: p.stats.steps,
          minigameWins: p.stats.minigameWins,
          minigamesPlayed: this.minigamesSeen,
          seconds: Math.round((Date.now() - this.startedAt) / 1000),
          finalShards: p.shards,
          rank: rank + 1,
        });
      });
      for (const id of newly) toast(t('ach.new', { id }), 'good', 4500);
    } catch (e) {
      console.error(e);
    }
  }

  private async restartLocal(): Promise<void> {
    const ls = this.session as LocalSession;
    const cfg = { ...ls.config };
    await this.app.startGame(new LocalSession(cfg));
  }

  dispose(): void {
    this.disposed = true;
    this.offs.forEach((o) => o());
    this.cleanup.forEach((c) => c());
    this.flow.dispose();
    this.hud.dispose();
    this.session.dispose();
    this.app.engine.setScreen(null);
    this.finaleStage?.dispose();
    this.stage.dispose();
    this.app.audio.music(null);
    void THREE;
    void playerColorHex;
    void this.lastPromptKey;
    void (null as PlayerSetup | null);
  }
}
