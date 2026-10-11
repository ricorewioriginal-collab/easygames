import { Rng } from '../rng';
import { edgeActive } from '../levels/graph';
import type { Layout } from '../levels/types';
import { ITEMS } from './items';
import type { GameCore } from './core';
import { ALTAR_COST, Action, Difficulty, ItemId, PlayerState } from './types';

/** Kürzeste Schrittzahl von jedem Feld zum Ziel in der aktuellen Faltungsphase (Rückwärtssuche). */
export function distancesTo(layout: Layout, target: number, phase: number): number[] {
  const rev: number[][] = layout.nodes.map(() => []);
  for (const e of layout.edges) if (edgeActive(e, phase)) rev[e.to]?.push(e.from);
  const d = layout.nodes.map(() => Infinity);
  d[target] = 0;
  const q = [target];
  for (let i = 0; i < q.length; i++) {
    const n = q[i] as number;
    for (const f of rev[n] ?? []) if (d[f] === Infinity) ((d[f] = (d[n] as number) + 1), q.push(f));
  }
  return d;
}

/**
 * Entscheidungslogik der Bots. Nutzt NUR öffentliche Informationen (Positionen, Münzen, Gegenstände,
 * Altar-Ort, Brettdaten) – dieselben, die ein Mensch am Bildschirm sieht. Kein Zugriff auf den Würfelzufall,
 * keine Bonusmünzen für höhere Schwierigkeit: Die Stufen unterscheiden sich nur in der Qualität der Entscheidungen.
 */
export function decide(core: GameCore, id: string, rng: Rng): Action | null {
  const s = core.state;
  const me = core.player(id);
  const level: Difficulty = me.difficulty;
  const layout = core.layout;
  const phase = core.effectivePhase();
  const toAltar = distancesTo(layout, s.altar, phase);
  const foes = core.players.filter((p) => p.id !== id);

  const landing = (node: number): number => {
    const n = layout.nodes[node] as Layout['nodes'][number];
    switch (n.kind) {
      case 'glimmer':
        return 3;
      case 'thorn':
        return me.mantle ? 0 : -3;
      case 'item':
        return me.items.length < 3 ? 2 : 0.5;
      case 'event':
        return 0.5;
      case 'shop':
        return me.coins >= 6 ? 1.5 : 0;
      case 'chaos':
        return leading() ? -1.5 : 1;
      case 'gate':
        return -1;
      default:
        return 0;
    }
  };
  const leading = (): boolean => foes.every((f) => me.shards > f.shards || (me.shards === f.shards && me.coins >= f.coins));
  const pass = (node: number): number => (node === s.altar && me.coins >= ALTAR_COST ? 14 : 0);
  const memo = new Map<number, number>();
  const best = (node: number, k: number): number => {
    const key = node * 64 + k;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let v: number;
    if (k === 0) v = landing(node) + pass(node);
    else {
      v = -Infinity;
      for (const e of layout.edges) if (e.from === node && edgeActive(e, phase)) v = Math.max(v, (k > 1 ? pass(e.to) : 0) + best(e.to, k - 1));
      if (v === -Infinity) v = landing(node);
    }
    memo.set(key, v);
    return v;
  };

  const pd = s.pending;
  if (s.phase === 'decision' && pd && pd.player === id) {
    switch (pd.kind) {
      case 'branch': {
        if (level === 'easy' && rng.chance(0.45)) return { type: 'chooseBranch', node: rng.pick(pd.options) };
        const depth = Math.min(pd.remaining - 1, level === 'hard' ? 10 : level === 'normal' ? 6 : 2);
        const wantAltar = me.coins >= ALTAR_COST - (level === 'hard' ? 4 : 0);
        let bestNode = pd.options[0] as number;
        let bestScore = -Infinity;
        for (const o of pd.options) {
          let v = (pd.remaining > 1 ? pass(o) : 0) + best(o, depth);
          if (wantAltar) v -= (level === 'easy' ? 0.1 : 0.55) * (toAltar[o] as number);
          else if (level === 'hard') v += 0.1 * rng.next();
          v += rng.next() * (level === 'easy' ? 3 : 0.2);
          if (v > bestScore) ((bestScore = v), (bestNode = o));
        }
        return { type: 'chooseBranch', node: bestNode };
      }
      case 'gate': {
        if (pd.hasKey) return { type: 'gate', choice: 'key' };
        if (pd.canPay && (me.coins >= 8 || level === 'easy' || rng.chance(0.4))) return { type: 'gate', choice: 'pay' };
        return { type: 'gate', choice: 'back' };
      }
      case 'altar':
        return { type: 'altar', buy: true };
      case 'shop': {
        const offers = pd.offers.map((it, i) => ({ it, i })).filter((o) => ITEMS[o.it].cost <= me.coins && me.items.length < 3);
        if (!offers.length) return { type: 'shopLeave' };
        const surplus = (c: number): boolean => me.coins - c >= ALTAR_COST || (me.coins < ALTAR_COST && me.coins - c >= 0 && rng.chance(level === 'hard' ? 0.5 : 0.35));
        const prio: ItemId[] = ['zwillingswuerfel', 'schutzschild', 'praezisionswuerfel', 'taschenspiegel', 'frostuhr', 'phasenmantel', 'schluesselfragment', 'tauschkristall'];
        if (level === 'easy' && rng.chance(0.6)) return { type: 'shopLeave' };
        const pick = offers.filter((o) => surplus(ITEMS[o.it].cost)).sort((a, b) => prio.indexOf(a.it) - prio.indexOf(b.it))[0];
        return pick ? { type: 'shopBuy', index: pick.i } : { type: 'shopLeave' };
      }
    }
  }

  if (s.phase === 'turn' && s.current === id && !s.rolled) {
    const item = pickItem(core, me, foes, toAltar, rng, level);
    if (item) return item;
    return { type: 'roll' };
  }
  return null;
}

function pickItem(core: GameCore, me: PlayerState, foes: PlayerState[], toAltar: number[], rng: Rng, level: Difficulty): Action | null {
  if (me.items.length === 0) return null;
  if (level === 'easy' && !rng.chance(0.35)) return null;
  const has = (i: ItemId): boolean => me.items.includes(i);
  const myDist = toAltar[me.position] as number;
  const richest = foes.filter((f) => f.coins >= 5).sort((a, b) => b.coins - a.coins)[0];
  const closest = foes.slice().sort((a, b) => (toAltar[a.position] as number) - (toAltar[b.position] as number))[0];
  if (has('taschenspiegel') && richest) return { type: 'useItem', item: 'taschenspiegel', target: richest.id };
  if (has('tauschkristall') && closest && me.coins >= ALTAR_COST && (toAltar[closest.position] as number) + 5 < myDist) return { type: 'useItem', item: 'tauschkristall', target: closest.id };
  if (has('frostuhr')) {
    const threat = foes.slice().sort((a, b) => b.shards * 10 + b.coins - (a.shards * 10 + a.coins))[0];
    if (threat && (threat.coins >= 15 || threat.shards > me.shards)) return { type: 'useItem', item: 'frostuhr', target: threat.id };
  }
  if (me.diceMode === 'one') {
    const goal = me.coins >= ALTAR_COST;
    if (has('zwillingswuerfel') && ((goal && myDist >= 6 && myDist <= 12) || (!goal && rng.chance(0.25)))) return { type: 'useItem', item: 'zwillingswuerfel' };
    if (has('praezisionswuerfel') && ((goal && myDist >= 3 && myDist <= 6) || (!goal && rng.chance(0.3)))) return { type: 'useItem', item: 'praezisionswuerfel' };
  }
  if (has('schutzschild') && !me.shield && me.coins >= 10) return { type: 'useItem', item: 'schutzschild' };
  if (has('phasenmantel') && !me.mantle && me.coins >= 12 && rng.chance(0.5)) return { type: 'useItem', item: 'phasenmantel' };
  void core;
  return null;
}
