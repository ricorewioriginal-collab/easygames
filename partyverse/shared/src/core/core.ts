import { Rng, randomSeed } from '../rng';
import { getLayout } from '../levels';
import { outgoing } from '../levels/graph';
import type { Layout } from '../levels/types';
import { MINIGAMES, getMiniGame } from '../minigames/registry';
import { runBot, simulate } from '../minigames/simulate';
import { validateLog } from '../minigames/input';
import { EVENTS, EVENT_IDS, ITEMS, ITEM_IDS, isItemId } from './items';
import {
  ALTAR_COST,
  Action,
  ApplyResult,
  Difficulty,
  EventId,
  FinaleBonus,
  GATE_TOLL,
  GameConfig,
  GameEvent,
  GameState,
  ItemId,
  MAX_ITEMS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MinigameRun,
  Pending,
  PlayerState,
  START_COINS,
} from './types';

export const BOT_SKILL: Record<Difficulty, number> = { easy: 0.3, normal: 0.6, hard: 0.88 };
const FFA_REWARDS: Record<number, number[]> = { 2: [8, 3], 3: [10, 5, 2], 4: [10, 6, 3, 1] };

/** Fehler bei ungültiger Konfiguration (für Lobby/Server) */
export function validateConfig(c: GameConfig, layout?: Layout): string | null {
  if (!c || typeof c !== 'object') return 'Ungültige Konfiguration';
  if (!layout) {
    try {
      getLayout(c.layoutId);
    } catch {
      return 'Unbekanntes Brett';
    }
  }
  if (!Number.isInteger(c.rounds) || c.rounds < 1 || c.rounds > 30) return 'Rundenzahl muss 1 bis 30 sein';
  if (!Array.isArray(c.players) || c.players.length < MIN_PLAYERS || c.players.length > MAX_PLAYERS) return `Es braucht ${MIN_PLAYERS} bis ${MAX_PLAYERS} Spieler`;
  const ids = new Set<string>();
  for (const p of c.players) {
    if (!p || typeof p.id !== 'string' || p.id.length < 1 || p.id.length > 64) return 'Ungültige Spieler-ID';
    if (ids.has(p.id)) return 'Doppelte Spieler-ID';
    ids.add(p.id);
    if (typeof p.name !== 'string' || p.name.trim().length < 1 || p.name.length > 20) return 'Ungültiger Spielername';
    if (p.kind !== 'human' && p.kind !== 'bot') return 'Ungültige Spielerart';
  }
  if (!c.players.some((p) => p.kind === 'human')) return 'Mindestens ein menschlicher Spieler nötig';
  return null;
}

/**
 * Der Spielkern: reine Regeln ohne Oberfläche und ohne Uhr. Wird identisch im Browser (lokale Partie)
 * und im Colyseus-Server (Online) verwendet. Der Zufallsgenerator gehört dem Kern und ist NICHT Teil des
 * sichtbaren Zustands – so kann kein Client Würfel vorhersagen.
 */
export class GameCore {
  readonly layout: Layout;
  state: GameState;
  /** Ereignisse der Initialisierung (Reihenfolge, erste Runde) */
  readonly initialEvents: GameEvent[] = [];
  private rng: Rng;
  private events: GameEvent[] = [];
  /** Mautbrücke, die in diesem Zug bereits geöffnet wurde */
  private openGate = -1;

  constructor(
    readonly config: GameConfig,
    seed: number = randomSeed(),
    layout?: Layout,
  ) {
    const err = validateConfig(config, layout);
    if (err) throw new Error(err);
    this.layout = layout ?? getLayout(config.layoutId);
    this.rng = new Rng(seed);
    const players: Record<string, PlayerState> = {};
    for (const s of config.players) {
      players[s.id] = {
        id: s.id,
        name: s.name.trim(),
        character: s.character,
        kind: s.kind,
        difficulty: s.difficulty ?? 'normal',
        position: this.layout.start,
        coins: config.startCoins ?? START_COINS,
        shards: 0,
        items: [],
        diceMode: 'one',
        mantle: false,
        shield: false,
        frozen: false,
        rollBonus: 0,
        stats: { minigameWins: 0, events: 0, coinsEarned: 0, steps: 0, steals: 0 },
        connected: true,
      };
    }
    this.state = {
      phase: 'turn',
      round: 1,
      rounds: config.rounds,
      foldPhase: 0,
      foldShift: 0,
      order: [],
      turnIndex: 0,
      current: '',
      players,
      altar: this.layout.altarSites[0] ?? 0,
      pending: null,
      lastDice: null,
      minigame: null,
      recentMinigames: [],
      layoutId: config.layoutId,
      rolled: false,
      finale: null,
      version: 0,
    };
    this.events = this.initialEvents;
    this.state.altar = this.rng.pick(this.layout.altarSites);
    this.rollOrder();
    this.startRound(true);
    this.events = [];
  }

  // ------------------------------------------------------------------ Abfragen
  get players(): PlayerState[] {
    return this.state.order.map((id) => this.state.players[id] as PlayerState);
  }
  player(id: string): PlayerState {
    const p = this.state.players[id];
    if (!p) throw new Error('Unbekannter Spieler ' + id);
    return p;
  }
  /** Fortschritt nach Faltung: tatsächliche Phase der aktuellen Runde */
  effectivePhase(): number {
    const n = this.layout.foldPhases;
    return n <= 1 ? 0 : (((this.state.round - 1 + this.state.foldShift) % n) + n) % n;
  }
  /** Welche Spieler müssen jetzt etwas tun? */
  pendingActors(): string[] {
    const s = this.state;
    if (s.phase === 'ended') return [];
    if (s.phase === 'turn') return [s.current];
    if (s.phase === 'decision' && s.pending) return [s.pending.player];
    if (s.phase === 'minigame' && s.minigame) {
      const m = s.minigame;
      return s.order.filter((id) => this.player(id).kind === 'human' && (m.stage === 'intro' ? !m.ready[id] : m.results[id] === null));
    }
    return [];
  }

  // ------------------------------------------------------------------ Aktionen
  /** Prüft eine Aktion, ohne sie auszuführen. Gibt eine Fehlermeldung oder null zurück. */
  validate(playerId: string, a: Action): string | null {
    const s = this.state;
    const p = s.players[playerId];
    if (!p) return 'Unbekannter Spieler';
    if (s.phase === 'ended') return 'Das Spiel ist beendet';
    if (!a || typeof a !== 'object' || typeof (a as { type?: unknown }).type !== 'string') return 'Ungültige Aktion';
    switch (a.type) {
      case 'useItem': {
        if (s.phase !== 'turn' || s.current !== playerId) return 'Du bist nicht am Zug';
        if (s.rolled) return 'Du hast schon gewürfelt';
        if (!isItemId(a.item)) return 'Unbekannter Gegenstand';
        const def = ITEMS[a.item];
        if (!def.active) return `${def.name} wirkt automatisch`;
        if (!p.items.includes(a.item)) return 'Du besitzt diesen Gegenstand nicht';
        if (def.needsTarget) {
          const t = typeof a.target === 'string' ? s.players[a.target] : undefined;
          if (!t || t.id === playerId) return 'Wähle einen Mitspieler als Ziel';
        }
        if ((a.item === 'zwillingswuerfel' || a.item === 'praezisionswuerfel') && p.diceMode !== 'one') return 'Du würfelst schon mit einem Spezialwürfel';
        if (a.item === 'schutzschild' && p.shield) return 'Dein Schutzschild ist schon aktiv';
        if (a.item === 'phasenmantel' && p.mantle) return 'Dein Phasenmantel ist schon aktiv';
        return null;
      }
      case 'roll':
        if (s.phase !== 'turn' || s.current !== playerId) return 'Du bist nicht am Zug';
        if (s.rolled) return 'Du hast schon gewürfelt';
        return null;
      case 'chooseBranch': {
        const pd = s.pending;
        if (s.phase !== 'decision' || !pd || pd.kind !== 'branch' || pd.player !== playerId) return 'Keine Routenwahl offen';
        if (!pd.options.includes(a.node)) return 'Diese Route ist nicht begehbar';
        return null;
      }
      case 'gate': {
        const pd = s.pending;
        if (s.phase !== 'decision' || !pd || pd.kind !== 'gate' || pd.player !== playerId) return 'Keine Mautbrücke offen';
        if (a.choice === 'pay' && !pd.canPay) return 'Zu wenig Glimmer für die Maut';
        if (a.choice === 'key' && !pd.hasKey) return 'Kein Schlüsselfragment';
        if (!['pay', 'key', 'back'].includes(a.choice)) return 'Ungültige Wahl';
        return null;
      }
      case 'altar': {
        const pd = s.pending;
        if (s.phase !== 'decision' || !pd || pd.kind !== 'altar' || pd.player !== playerId) return 'Kein Altar-Angebot offen';
        if (typeof a.buy !== 'boolean') return 'Ungültige Wahl';
        return null;
      }
      case 'shopBuy': {
        const pd = s.pending;
        if (s.phase !== 'decision' || !pd || pd.kind !== 'shop' || pd.player !== playerId) return 'Kein Laden offen';
        const it = pd.offers[a.index];
        if (!Number.isInteger(a.index) || it === undefined) return 'Diesen Gegenstand gibt es nicht';
        if (p.coins < ITEMS[it].cost) return 'Zu wenig Glimmer';
        if (p.items.length >= MAX_ITEMS) return `Du kannst höchstens ${MAX_ITEMS} Gegenstände tragen`;
        return null;
      }
      case 'shopLeave': {
        const pd = s.pending;
        if (s.phase !== 'decision' || !pd || pd.kind !== 'shop' || pd.player !== playerId) return 'Kein Laden offen';
        return null;
      }
      case 'minigameReady': {
        const m = s.minigame;
        if (s.phase !== 'minigame' || !m || m.stage !== 'intro') return 'Kein Minispiel in der Vorbereitung';
        if (m.ready[playerId] === undefined) return 'Du nimmst nicht teil';
        return null;
      }
      case 'minigameSubmit': {
        const m = s.minigame;
        if (s.phase !== 'minigame' || !m || m.stage !== 'play') return 'Kein Minispiel läuft';
        if (m.results[playerId] === undefined) return 'Du nimmst nicht teil';
        if (m.results[playerId] !== null) return 'Du hast dein Ergebnis schon abgegeben';
        if (p.kind !== 'human') return 'Bots spielen automatisch';
        const g = getMiniGame(m.gameId);
        if (!validateLog(a.log, Math.ceil(g.duration * 60) + 2)) return 'Ungültiges Eingabeprotokoll';
        return null;
      }
      default:
        return 'Unbekannte Aktion';
    }
  }

  /** Führt eine Aktion aus. Bei Fehlern bleibt der Zustand unverändert. */
  apply(playerId: string, a: Action): ApplyResult {
    const err = this.validate(playerId, a);
    if (err) return { ok: false, error: err, events: [] };
    return this.run(() => this.dispatch(playerId, a));
  }

  private run(fn: () => void): ApplyResult {
    const snapshot = JSON.stringify(this.state);
    const rngState = this.rng.state;
    const gate = this.openGate;
    this.events = [];
    try {
      fn();
      this.state.version++;
      return { ok: true, events: this.events };
    } catch (e) {
      this.state = JSON.parse(snapshot) as GameState;
      this.rng.state = rngState;
      this.openGate = gate;
      return { ok: false, error: 'Interner Fehler: ' + (e as Error).message, events: [] };
    }
  }

  private emit(e: GameEvent): void {
    this.events.push(e);
  }

  private dispatch(id: string, a: Action): void {
    switch (a.type) {
      case 'useItem':
        return this.useItem(id, a.item, a.target);
      case 'roll':
        return this.roll(id);
      case 'chooseBranch':
        return this.chooseBranch(id, a.node);
      case 'gate':
        return this.resolveGate(id, a.choice);
      case 'altar':
        return this.resolveAltar(id, a.buy);
      case 'shopBuy':
        return this.shopBuy(id, a.index);
      case 'shopLeave':
        return this.shopLeave(id);
      case 'minigameReady':
        return this.minigameReady(id);
      case 'minigameSubmit':
        return this.minigameSubmit(id, a.log);
    }
  }

  // ------------------------------------------------------------------ Zugablauf
  private useItem(id: string, item: ItemId, targetId?: string): void {
    const p = this.player(id);
    p.items.splice(p.items.indexOf(item), 1);
    this.emit({ t: 'itemUsed', player: id, item, ...(targetId ? { target: targetId } : {}) });
    const target = targetId ? this.player(targetId) : null;
    switch (item) {
      case 'zwillingswuerfel':
        p.diceMode = 'two';
        break;
      case 'praezisionswuerfel':
        p.diceMode = 'best';
        break;
      case 'phasenmantel':
        p.mantle = true;
        break;
      case 'schutzschild':
        p.shield = true;
        break;
      case 'tauschkristall':
        if (target && !this.shielded(target, 'Platztausch')) this.swapPositions(p, target, 'Tauschkristall');
        break;
      case 'taschenspiegel':
        if (target && !this.shielded(target, 'Diebstahl')) this.steal(target, p, 6, 'Taschenspiegel');
        break;
      case 'frostuhr':
        if (target) target.frozen = true;
        break;
      default:
        break;
    }
  }

  /** Prüft ein Schutzschild (wird verbraucht) */
  private shielded(target: PlayerState, reason: string): boolean {
    if (target.shield) {
      target.shield = false;
      this.emit({ t: 'blocked', player: target.id, reason: `Schutzschild: ${reason} abgewehrt` });
      return true;
    }
    return false;
  }

  private die(): number {
    return this.rng.range(1, 6);
  }

  private roll(id: string): void {
    const p = this.player(id);
    let dice: number[];
    let base: number;
    if (p.diceMode === 'two') {
      dice = [this.die(), this.die()];
      base = dice[0]! + dice[1]!;
    } else if (p.diceMode === 'best') {
      dice = [this.die(), this.die()];
      base = Math.max(dice[0]!, dice[1]!);
    } else {
      dice = [this.die()];
      base = dice[0]!;
    }
    const bonus = p.rollBonus;
    let total = Math.max(1, base + bonus);
    if (p.frozen) total = Math.max(1, Math.floor(total / 2));
    p.diceMode = 'one';
    p.rollBonus = 0;
    p.frozen = false;
    this.state.rolled = true;
    this.state.lastDice = { player: id, dice, total };
    this.emit({ t: 'dice', player: id, dice, total, bonus });
    this.openGate = -1;
    this.moveLoop(id, total);
  }

  /** Läuft Schritt für Schritt, bis ein Halt, eine Entscheidung oder das Ziel erreicht ist. */
  private moveLoop(id: string, remaining: number): void {
    const p = this.player(id);
    const s = this.state;
    while (remaining > 0) {
      const opts = outgoing(this.layout, p.position, this.effectivePhase());
      if (opts.length === 0) {
        this.land(id, p.position);
        return;
      }
      if (opts.length > 1) {
        s.pending = { kind: 'branch', player: id, options: opts.map((e) => e.to), remaining };
        s.phase = 'decision';
        return;
      }
      const next = (opts[0] as { to: number }).to;
      const r = this.enter(id, next, remaining);
      if (r === 'wait') return;
      if (r === 'stop') {
        this.finishTurn(id);
        return;
      }
      remaining = r;
    }
    this.land(id, p.position);
  }

  /** Betritt ein Feld. Rückgabe: verbleibende Schritte, 'wait' (Entscheidung nötig) oder 'stop' (Bewegung beendet). */
  private enter(id: string, to: number, remaining: number): number | 'wait' | 'stop' {
    const p = this.player(id);
    const s = this.state;
    const node = this.layout.nodes[to] as Layout['nodes'][number];
    if (node.kind === 'gate' && this.openGate !== to) {
      const canPay = p.coins >= GATE_TOLL;
      const hasKey = p.items.includes('schluesselfragment');
      if (!canPay && !hasKey) {
        this.emit({ t: 'blocked', player: id, reason: 'Die Mautbrücke bleibt verschlossen – du hast weder Glimmer noch Schlüssel.' });
        return 'stop';
      }
      s.pending = { kind: 'gate', player: id, node: to, toll: GATE_TOLL, canPay, hasKey, remaining };
      s.phase = 'decision';
      return 'wait';
    }
    this.openGate = -1;
    const from = p.position;
    p.position = to;
    p.stats.steps++;
    const left = remaining - 1;
    this.emit({ t: 'step', player: id, from, to, remaining: left });
    // Überholen: Gegner auf dem Feld, auf dem wir nicht stehen bleiben
    if (left > 0) {
      for (const o of this.players) {
        if (o.id !== id && o.position === to && o.coins > 0 && !p.mantle) {
          this.emit({ t: 'pass', player: id, other: o.id, node: to });
          if (!this.shielded(o, 'Überholen')) this.steal(o, p, 1, 'Überholt');
          break;
        }
      }
    }
    if (to === s.altar && p.coins >= ALTAR_COST) {
      s.pending = { kind: 'altar', player: id, cost: ALTAR_COST, remaining: left };
      s.phase = 'decision';
      return 'wait';
    }
    return left;
  }

  private chooseBranch(id: string, node: number): void {
    const s = this.state;
    const pd = s.pending as Extract<Pending, { kind: 'branch' }>;
    s.pending = null;
    s.phase = 'turn';
    const r = this.enter(id, node, pd.remaining);
    if (r === 'wait') return;
    if (r === 'stop') return this.finishTurn(id);
    this.moveLoop(id, r);
  }

  private resolveGate(id: string, choice: 'pay' | 'key' | 'back'): void {
    const s = this.state;
    const p = this.player(id);
    const pd = s.pending as Extract<Pending, { kind: 'gate' }>;
    s.pending = null;
    s.phase = 'turn';
    if (choice === 'back') {
      this.emit({ t: 'blocked', player: id, reason: 'Du drehst vor der Mautbrücke um.' });
      return this.finishTurn(id);
    }
    if (choice === 'pay') this.addCoins(p, -pd.toll, 'Maut');
    else {
      p.items.splice(p.items.indexOf('schluesselfragment'), 1);
      this.emit({ t: 'itemUsed', player: id, item: 'schluesselfragment' });
    }
    this.openGate = pd.node;
    const r = this.enter(id, pd.node, pd.remaining);
    if (r === 'wait') return;
    if (r === 'stop') return this.finishTurn(id);
    this.moveLoop(id, r);
  }

  private resolveAltar(id: string, buy: boolean): void {
    const s = this.state;
    const p = this.player(id);
    const pd = s.pending as Extract<Pending, { kind: 'altar' }>;
    s.pending = null;
    s.phase = 'turn';
    if (buy && p.coins >= pd.cost) {
      this.addCoins(p, -pd.cost, 'Zeitsplitter');
      p.shards++;
      this.emit({ t: 'shard', player: id });
      this.relocateAltar();
    }
    this.moveLoop(id, pd.remaining);
  }

  private relocateAltar(): void {
    const sites = this.layout.altarSites.filter((n) => n !== this.state.altar);
    this.state.altar = this.rng.pick(sites.length ? sites : this.layout.altarSites);
    this.emit({ t: 'altarMoved', node: this.state.altar });
  }

  // ------------------------------------------------------------------ Landung und Felder
  private addCoins(p: PlayerState, delta: number, reason: string): number {
    const real = delta < 0 ? -Math.min(p.coins, -delta) : delta;
    p.coins += real;
    if (real > 0) p.stats.coinsEarned += real;
    if (real !== 0) this.emit({ t: 'coins', player: p.id, delta: real, reason });
    return real;
  }

  private steal(from: PlayerState, to: PlayerState, amount: number, reason: string): void {
    const real = Math.min(amount, from.coins);
    if (real <= 0) return;
    from.coins -= real;
    to.coins += real;
    to.stats.coinsEarned += real;
    to.stats.steals++;
    this.emit({ t: 'steal', from: from.id, to: to.id, amount: real, reason });
  }

  private swapPositions(a: PlayerState, b: PlayerState, reason: string): void {
    const t = a.position;
    a.position = b.position;
    b.position = t;
    this.emit({ t: 'swap', a: a.id, b: b.id, reason });
  }

  private giveItem(p: PlayerState, item: ItemId, from: 'field' | 'shop' | 'event'): void {
    if (p.items.length >= MAX_ITEMS) {
      this.addCoins(p, 4, 'Gegenstand zu schwer');
      return;
    }
    p.items.push(item);
    this.emit({ t: 'itemGot', player: p.id, item, from });
  }

  private randomItem(): ItemId {
    const total = ITEM_IDS.reduce((a, id) => a + ITEMS[id].weight, 0);
    let x = this.rng.next() * total;
    for (const id of ITEM_IDS) {
      x -= ITEMS[id].weight;
      if (x <= 0) return id;
    }
    return ITEM_IDS[0] as ItemId;
  }

  private land(id: string, node: number): void {
    const p = this.player(id);
    const s = this.state;
    const n = this.layout.nodes[node] as Layout['nodes'][number];
    this.emit({ t: 'land', player: id, node, kind: n.kind });
    switch (n.kind) {
      case 'glimmer':
        this.addCoins(p, 3, 'Glimmer-Feld');
        break;
      case 'thorn':
        if (p.mantle) this.emit({ t: 'blocked', player: id, reason: 'Der Phasenmantel schützt vor dem Dornenfeld.' });
        else this.addCoins(p, -3, 'Dornenfeld');
        break;
      case 'item':
        this.giveItem(p, this.randomItem(), 'field');
        break;
      case 'event':
        this.randomEvent(p);
        break;
      case 'shop': {
        const offers: ItemId[] = [];
        while (offers.length < 3) {
          const it = this.randomItem();
          if (!offers.includes(it)) offers.push(it);
        }
        s.pending = { kind: 'shop', player: id, offers };
        s.phase = 'decision';
        return;
      }
      case 'portal': {
        const to = n.portal as number;
        this.emit({ t: 'teleport', player: id, from: node, to, reason: 'Portal' });
        p.position = to;
        break;
      }
      case 'chaos': {
        const others = this.players.filter((o) => o.id !== id);
        if (others.length === 0) break;
        if (p.mantle) {
          this.emit({ t: 'blocked', player: id, reason: 'Der Phasenmantel schützt vor dem Chaos-Feld.' });
          break;
        }
        const o = this.rng.pick(others);
        if (!this.shielded(o, 'Chaos-Tausch')) this.swapPositions(p, o, 'Chaos-Feld');
        break;
      }
      default:
        break;
    }
    // Rempler: Wer auf demselben Feld landet wie ein Gegner, schnappt sich 2 Glimmer
    const victims = this.players.filter((o) => o.id !== id && o.position === p.position && o.coins > 0);
    if (victims.length && !p.mantle) {
      const o = this.rng.pick(victims);
      if (!this.shielded(o, 'Rempler')) this.steal(o, p, 2, 'Rempler');
    }
    this.finishTurn(id);
  }

  /** Löst ein bestimmtes Ereignis aus (Tests und Serverbefehle). */
  forceEvent(playerId: string, id: EventId): ApplyResult {
    return this.run(() => this.randomEvent(this.player(playerId), id));
  }

  private randomEvent(p: PlayerState, forced?: EventId): void {
    const id = forced ?? (this.rng.pick(EVENT_IDS) as EventId);
    p.stats.events++;
    const s = this.state;
    const ev: GameEvent = { t: 'event', player: p.id, id };
    this.emit(ev);
    const bad = !EVENTS[id].good;
    if (bad && p.mantle) {
      this.emit({ t: 'blocked', player: p.id, reason: 'Der Phasenmantel schützt vor dem Ereignis.' });
      return;
    }
    const others = this.players.filter((o) => o.id !== p.id);
    switch (id) {
      case 'glueck':
        this.addCoins(p, 6, 'Glitzerregen');
        break;
      case 'dornen':
        this.addCoins(p, -4, 'Dornenwind');
        break;
      case 'schatz':
        this.giveItem(p, this.randomItem(), 'event');
        break;
      case 'dieb': {
        const o = others.length ? this.rng.pick(others) : null;
        if (o) this.steal(p, o, 5, 'Taschendieb');
        break;
      }
      case 'spende':
        for (const o of this.players) this.addCoins(o, o.id === p.id ? 4 : 2, 'Spende');
        break;
      case 'umverteilung': {
        const sorted = this.players.slice().sort((a, b) => b.coins - a.coins);
        const rich = sorted[0] as PlayerState;
        const poor = sorted[sorted.length - 1] as PlayerState;
        if (rich.id !== poor.id) this.steal(rich, poor, 3, 'Umverteilung');
        break;
      }
      case 'faltung':
        s.foldShift++;
        s.foldPhase = this.effectivePhase();
        this.emit({ t: 'fold', phase: s.foldPhase, reason: 'event' });
        break;
      case 'rueckenwind':
        p.rollBonus += 3;
        break;
      case 'gegenwind':
        p.rollBonus -= 2;
        break;
      case 'ausgleich': {
        const last = this.players.slice().sort((a, b) => a.shards - b.shards || a.coins - b.coins)[0] as PlayerState;
        this.addCoins(last, 5, 'Sternschnuppe');
        break;
      }
      case 'portalblitz': {
        const portals = this.layout.nodes.filter((n) => n.kind === 'portal' && n.id !== p.position);
        if (portals.length) {
          const to = (this.rng.pick(portals) as { id: number }).id;
          this.emit({ t: 'teleport', player: p.id, from: p.position, to, reason: 'Portalblitz' });
          p.position = to;
        } else this.addCoins(p, 3, 'Portalblitz');
        break;
      }
      case 'altarruf':
        this.relocateAltar();
        break;
    }
  }

  private shopBuy(id: string, index: number): void {
    const p = this.player(id);
    const pd = this.state.pending as Extract<Pending, { kind: 'shop' }>;
    const item = pd.offers[index] as ItemId;
    this.addCoins(p, -ITEMS[item].cost, 'Laden');
    this.giveItem(p, item, 'shop');
    pd.offers.splice(index, 1);
    if (pd.offers.length === 0 || p.items.length >= MAX_ITEMS) this.shopLeave(id);
  }

  private shopLeave(id: string): void {
    this.state.pending = null;
    this.state.phase = 'turn';
    this.finishTurn(id);
  }

  // ------------------------------------------------------------------ Zug- und Rundenwechsel
  private finishTurn(id: string): void {
    const s = this.state;
    const p = this.player(id);
    p.mantle = false;
    s.pending = null;
    s.phase = 'turn';
    s.rolled = false;
    this.openGate = -1;
    this.emit({ t: 'turnEnd', player: id });
    s.turnIndex++;
    if (s.turnIndex >= s.order.length) return this.startMinigame();
    s.current = s.order[s.turnIndex] as string;
    this.emit({ t: 'turn', player: s.current });
  }

  private rollOrder(): void {
    const ids = this.config.players.map((p) => p.id);
    const rolls: Record<string, number> = {};
    for (const id of ids) rolls[id] = this.die();
    // Gleichstand: Nachwürfeln (deterministisch über den Kern-Zufall)
    const key: Record<string, number> = {};
    for (const id of ids) key[id] = (rolls[id] as number) * 1000;
    const sorted = ids.slice();
    let guard = 0;
    for (;;) {
      sorted.sort((a, b) => (key[b] as number) - (key[a] as number));
      let tie = false;
      for (let i = 0; i + 1 < sorted.length; i++) {
        const a = sorted[i] as string;
        const b = sorted[i + 1] as string;
        if (key[a] === key[b]) {
          tie = true;
          key[a] = (key[a] as number) + this.die();
          key[b] = (key[b] as number) + this.die();
        }
      }
      if (!tie || guard++ > 50) break;
    }
    this.state.order = sorted;
    this.emit({ t: 'order', order: sorted, rolls });
  }

  private startRound(first = false): void {
    const s = this.state;
    s.foldPhase = this.effectivePhase();
    s.turnIndex = 0;
    s.current = s.order[0] as string;
    s.phase = 'turn';
    s.rolled = false;
    this.emit({ t: 'round', round: s.round, foldPhase: s.foldPhase });
    if (!first && this.layout.foldPhases > 1) this.emit({ t: 'fold', phase: s.foldPhase, reason: 'round' });
    this.emit({ t: 'turn', player: s.current });
  }

  // ------------------------------------------------------------------ Minispiele
  private startMinigame(): void {
    const s = this.state;
    const recent = new Set(s.recentMinigames.slice(-6));
    const pool = MINIGAMES.filter((g) => !recent.has(g.id));
    const game = this.rng.pick(pool.length ? pool : MINIGAMES);
    s.recentMinigames.push(game.id);
    const ids = s.order.slice();
    const team = ids.length === 4 && this.rng.chance(0.4);
    const shuffled = team ? this.rng.shuffle(ids) : [];
    const teams = team ? [shuffled.slice(0, 2), shuffled.slice(2)] : [];
    const seed = this.rng.int(2147483647);
    const run: MinigameRun = { gameId: game.id, seed, mode: team ? 'team' : 'ffa', teams, ready: {}, results: {}, stage: 'intro' };
    ids.forEach((id, i) => {
      const p = this.player(id);
      if (p.kind === 'bot') {
        const r = runBot(game, seed, { playerIndex: i, players: ids.length }, BOT_SKILL[p.difficulty], this.rng.int(2147483647));
        run.results[id] = { score: r.score, source: 'bot' };
      } else {
        run.results[id] = null;
        run.ready[id] = false;
      }
    });
    s.minigame = run;
    s.phase = 'minigame';
    s.pending = null;
    this.emit({ t: 'minigameStart', gameId: game.id, mode: run.mode, teams });
    if (Object.keys(run.ready).length === 0) {
      run.stage = 'play';
      this.maybeFinishMinigame();
    }
  }

  private minigameReady(id: string): void {
    const m = this.state.minigame as MinigameRun;
    m.ready[id] = true;
    if (Object.values(m.ready).every(Boolean)) m.stage = 'play';
  }

  private minigameSubmit(id: string, log: number[]): void {
    const m = this.state.minigame as MinigameRun;
    const g = getMiniGame(m.gameId);
    const idx = this.state.order.indexOf(id);
    const r = simulate(g, m.seed, { playerIndex: idx, players: this.state.order.length }, log);
    this.setResult(id, r.score, 'human');
  }

  private setResult(id: string, score: number, source: 'human' | 'bot' | 'auto'): void {
    const m = this.state.minigame as MinigameRun;
    m.results[id] = { score, source };
    this.emit({ t: 'minigameResult', player: id, score });
    this.maybeFinishMinigame();
  }

  private maybeFinishMinigame(): void {
    const m = this.state.minigame as MinigameRun;
    if (Object.values(m.results).some((r) => r === null)) return;
    this.finishMinigame();
  }

  private finishMinigame(): void {
    const s = this.state;
    const m = s.minigame as MinigameRun;
    const ids = s.order;
    const score = (id: string): number => (m.results[id] as { score: number }).score;
    const rewards: Record<string, number> = {};
    let ranking: string[];
    let winners: string[];
    if (m.mode === 'team') {
      const tscore = m.teams.map((t) => t.reduce((a, id) => a + score(id), 0));
      const a = tscore[0] as number;
      const b = tscore[1] as number;
      m.teams.forEach((t, ti) => {
        const mine = tscore[ti] as number;
        const other = tscore[1 - ti] as number;
        for (const id of t) rewards[id] = mine > other ? 8 : mine === other ? 5 : 2;
      });
      winners = a === b ? [] : (m.teams[a > b ? 0 : 1] as string[]);
      ranking = ids.slice().sort((x, y) => (rewards[y] as number) - (rewards[x] as number) || score(y) - score(x));
    } else {
      ranking = ids.slice().sort((x, y) => score(y) - score(x) || ids.indexOf(x) - ids.indexOf(y));
      const table = FFA_REWARDS[ids.length] as number[];
      let i = 0;
      while (i < ranking.length) {
        let j = i;
        while (j + 1 < ranking.length && score(ranking[j + 1] as string) === score(ranking[i] as string)) j++;
        const share = Math.floor(table.slice(i, j + 1).reduce((x, y) => x + y, 0) / (j - i + 1));
        for (let k = i; k <= j; k++) rewards[ranking[k] as string] = share;
        i = j + 1;
      }
      const top = score(ranking[0] as string);
      winners = ranking.filter((id) => score(id) === top);
    }
    for (const id of ids) this.addCoins(this.player(id), rewards[id] as number, 'Minispiel');
    for (const id of winners) this.player(id).stats.minigameWins++;
    this.emit({ t: 'minigameDone', ranking, rewards, winners });
    s.minigame = null;
    this.endRound();
  }

  private endRound(): void {
    const s = this.state;
    if (s.round >= s.rounds) return this.finale();
    s.round++;
    this.startRound();
  }

  private finale(): void {
    const s = this.state;
    const ps = this.players;
    const bonuses: FinaleBonus[] = [];
    const best = (f: (p: PlayerState) => number, id: FinaleBonus['id']): void => {
      const max = Math.max(...ps.map(f));
      if (max <= 0) return;
      bonuses.push({ id, players: ps.filter((p) => f(p) === max).map((p) => p.id) });
    };
    best((p) => p.stats.minigameWins, 'minigame');
    best((p) => p.coins, 'coins');
    best((p) => p.stats.events, 'events');
    for (const b of bonuses) for (const id of b.players) this.player(id).shards++;
    const ranking = ps
      .slice()
      .sort((a, b) => b.shards - a.shards || b.coins - a.coins || b.stats.minigameWins - a.stats.minigameWins || s.order.indexOf(a.id) - s.order.indexOf(b.id))
      .map((p) => p.id);
    s.finale = { bonuses, ranking };
    s.phase = 'ended';
    s.pending = null;
    this.emit({ t: 'finale', bonuses, ranking });
  }

  // ------------------------------------------------------------------ Hilfen für Zeitlimits, Verbindungsabbrüche und Tests
  /** Setzt die Verbindung eines Spielers (Anzeige) */
  setConnected(id: string, connected: boolean): void {
    this.player(id).connected = connected;
    this.state.version++;
  }

  /** Bestätigt für alle noch nicht bereiten Spieler (Zeitüberschreitung der Anleitung) */
  forceReady(): ApplyResult {
    if (this.state.phase !== 'minigame' || this.state.minigame?.stage !== 'intro') return { ok: false, error: 'Keine Anleitung offen', events: [] };
    return this.run(() => {
      const m = this.state.minigame as MinigameRun;
      for (const id of Object.keys(m.ready)) m.ready[id] = true;
      m.stage = 'play';
    });
  }

  /** Setzt für alle fehlenden Ergebnisse ein KI-Ergebnis (Zeitüberschreitung/Verbindungsabbruch) */
  forceResults(): ApplyResult {
    const m = this.state.minigame;
    if (this.state.phase !== 'minigame' || !m || m.stage !== 'play') return { ok: false, error: 'Kein Minispiel läuft', events: [] };
    return this.run(() => {
      const g = getMiniGame(m.gameId);
      this.state.order.forEach((id, i) => {
        if (m.results[id] !== null) return;
        const r = runBot(g, m.seed, { playerIndex: i, players: this.state.order.length }, BOT_SKILL.easy * 0.7, this.rng.int(2147483647));
        m.results[id] = { score: r.score, source: 'auto' };
        this.emit({ t: 'minigameResult', player: id, score: r.score });
      });
      this.maybeFinishMinigame();
    });
  }

  /** Wählt für einen Spieler eine einfache Standardaktion (Zeitüberschreitung im Zug) */
  fallbackAction(playerId: string): Action | null {
    const s = this.state;
    if (s.phase === 'turn' && s.current === playerId) return { type: 'roll' };
    const pd = s.pending;
    if (s.phase === 'decision' && pd && pd.player === playerId) {
      switch (pd.kind) {
        case 'branch':
          return { type: 'chooseBranch', node: pd.options[0] as number };
        case 'gate':
          return { type: 'gate', choice: pd.hasKey ? 'key' : pd.canPay ? 'pay' : 'back' };
        case 'altar':
          return { type: 'altar', buy: true };
        case 'shop':
          return { type: 'shopLeave' };
      }
    }
    return null;
  }
}
