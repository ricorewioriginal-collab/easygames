// Autonomie (Nutzen-KI): Figuren wählen selbstständig, was ihre Bedürfnisse am besten erfüllt.
// Bewertung = Σ Attraktivität × Dringlichkeit + Persönlichkeit + Nähe + etwas Zufall. Entscheidungen sind gedrosselt (ressourcensparend).
import { NEED_IDS, type NeedId } from '../data/types';
import { traitById } from '../data/traits';
import { lotById } from '../data/lots';
import { getDef } from '../world/defs';
import type { ObjInst } from '../world/world';
import { availability, tickSim } from './actions';
import { REG, type IDef, type QCtx } from './interact';
import { SOCIALS, socialAvail, type SocialDef } from './socials';
import type { Game } from './game';
import type { Pet, Sim } from './types';

/** Dringlichkeit eines Bedürfnisses 0..~2 */
export function urgency(v: number): number {
  const x = Math.max(0, Math.min(1, (100 - v) / 100));
  return x * x * 2 + 0.04;
}

/** Diese Dinge erledigen Gäste nicht auf fremden Grundstücken */
const HOME_ONLY = new Set(['sleep', 'nap', 'shower', 'bath', 'cook', 'payBills', 'changeOutfit', 'editLook', 'garden', 'gardenHarvest', 'fillBowl', 'tryForBaby']);

// Index: Funktion → Interaktionen (einmalig nach Registrierung aufgebaut)
let byFunc: Map<string, IDef[]> | null = null;
let noFunc: IDef[] = [];
let selfDefs: IDef[] = [];
let petDefs: IDef[] = [];
function index(): void {
  byFunc = new Map();
  noFunc = [];
  selfDefs = [];
  petDefs = [];
  for (const d of REG.values()) {
    if (d.auto === false || d.social) continue;
    if (!d.adv && !d.advFn) continue;
    if (d.on === 'self') selfDefs.push(d);
    else if (d.on === 'pet') petDefs.push(d);
    else if (d.on === 'obj') {
      if (!d.func) noFunc.push(d);
      else
        for (const f of d.func) {
          let l = byFunc.get(f);
          if (!l) byFunc.set(f, (l = []));
          l.push(d);
        }
    }
  }
}
export function resetAutonomyIndex(): void {
  byFunc = null;
}

export interface Choice {
  d: IDef;
  o?: ObjInst;
  t?: Sim;
  p?: Pet;
  score: number;
  data?: Record<string, string | number | boolean>;
}

function likeOf(s: Sim, id: string): number {
  let f = 1;
  for (const t of s.traits) f *= traitById(t).likes?.[id] ?? 1;
  return f;
}

function needScore(s: Sim, adv: Partial<Record<NeedId, number>> | undefined, onlyNeed: NeedId | null): number {
  if (!adv) return 0;
  let sc = 0;
  for (const n of NEED_IDS) {
    const a = adv[n];
    if (!a) continue;
    if (onlyNeed && n !== onlyNeed) continue;
    sc += a * urgency(s.needs[n]);
  }
  return sc;
}

/** Bedürfnis, das bei niedriger Autonomie allein zählt (unter 35) */
function criticalNeed(s: Sim): NeedId | null {
  let best: NeedId | null = null,
    bv = 35;
  for (const n of NEED_IDS)
    if (s.needs[n] < bv) {
      bv = s.needs[n];
      best = n;
    }
  return best;
}

function scoreDef(g: Game, s: Sim, d: IDef, c: QCtx, onlyNeed: NeedId | null): number {
  let sc = needScore(s, d.adv, onlyNeed);
  if (d.advFn && !onlyNeed) sc += d.advFn(c);
  else if (d.advFn && onlyNeed && sc > 0) sc += Math.min(0, d.advFn(c));
  if (sc <= 0) return 0;
  sc *= likeOf(s, d.goal ?? d.id);
  // Stimmungen beeinflussen Vorlieben leicht
  if (s.emo === 'tired' && (d.id === 'sleep' || d.id === 'nap')) sc *= 1.2;
  if (s.emo === 'playful' && d.adv?.fun) sc *= 1.15;
  if (s.emo === 'inspired' && d.skill && ['painting', 'music', 'writing', 'photography'].includes(d.skill)) sc *= 1.4;
  if (s.emo === 'focused' && d.skill && ['logic', 'programming', 'writing'].includes(d.skill)) sc *= 1.3;
  if (s.emo === 'confident' && d.skill === 'fitness') sc *= 1.4;
  void g;
  return sc;
}

/** sammelt Kandidaten auf dem aktuellen Grundstück */
export function candidates(g: Game, s: Sim, max = 60): Choice[] {
  if (!byFunc) index();
  const out: Choice[] = [];
  const lot = g.lotOf(s);
  const home = g.homeLotOf(s);
  const guestHere = !!lot && lot !== home;
  const onlyNeed = g.isControllable(s) && g.settings.autonomy === 1 ? criticalNeed(s) : null;
  if (g.isControllable(s) && g.settings.autonomy === 1 && !onlyNeed) return out;
  const lotDef = lotById(lot);
  // Objekte
  if (lot) {
    for (const o of g.world.objs.values()) {
      if (o.lot !== lot) continue;
      const od = getDef(o.def);
      const defs: IDef[] = [];
      if (od.func) for (const f of od.func) for (const d of byFunc!.get(f) ?? []) if (!defs.includes(d)) defs.push(d);
      if (od.hidden || o.def.startsWith('prop-') || o.st?.broken) for (const d of noFunc) defs.push(d);
      if (!defs.length) continue;
      const [cx, cz] = g.world.centerOf(o);
      const dist = Math.hypot(cx - s.x, cz - s.z) + (o.l !== s.l ? 8 : 0);
      for (const d of defs) {
        if (guestHere && HOME_ONLY.has(d.id)) continue;
        if (lotDef?.kind !== 'home' && (d.id === 'sleep' || d.id === 'shower')) continue;
        const c: QCtx = { g, s, o };
        if (availability(g, d, c) !== true) continue;
        const sc = scoreDef(g, s, d, c, onlyNeed);
        if (sc <= 0) continue;
        out.push({ d, o, score: sc - dist * 0.35 });
      }
    }
  }
  // Eigene Handlungen
  for (const d of selfDefs) {
    const c: QCtx = { g, s };
    if (availability(g, d, c) !== true) continue;
    const sc = scoreDef(g, s, d, c, onlyNeed);
    if (sc > 0) out.push({ d, score: sc });
  }
  // Haustiere
  if (lot && petDefs.length)
    for (const p of g.pets.values()) {
      if (g.world.lotAt(p.x, p.z)?.id !== lot || !p.rt.spawned) continue;
      for (const d of petDefs) {
        const c: QCtx = { g, s, p };
        if (availability(g, d, c) !== true) continue;
        const sc = scoreDef(g, s, d, c, onlyNeed);
        if (sc > 0) out.push({ d, p, score: sc - Math.hypot(p.x - s.x, p.z - s.z) * 0.3 });
      }
    }
  // Soziales
  if (!onlyNeed || onlyNeed === 'social') out.push(...socialCandidates(g, s, lot));
  out.sort((a, b) => b.score - a.score);
  if (out.length > max) out.length = max;
  return out;
}

function socialCandidates(g: Game, s: Sim, lot: string): Choice[] {
  if (s.age === 'baby' || s.age === 'toddler') return [];
  const out: Choice[] = [];
  const near: Sim[] = [];
  for (const t of g.sims.values()) {
    if (t === s || t.away || t.trip || t.age === 'baby') continue;
    if (t.npc && !t.rt.spawned && !t.visit) continue;
    if (t.l !== s.l) continue;
    const d = Math.hypot(t.x - s.x, t.z - s.z);
    if (d > 14) continue;
    if (lot && g.lotOf(t) !== lot && d > 6) continue;
    const cur = t.queue[0];
    if (cur && (cur.def === 'sleep' || cur.def === 'toilet' || cur.def === 'shower' || cur.def === 'bath' || cur.def.startsWith('work'))) continue;
    if (t.rt.socialWith) continue;
    near.push(t);
  }
  if (!near.length) return out;
  // höchstens drei zufällige Gesprächspartner prüfen
  for (let i = near.length - 1; i > 0; i--) {
    const j = g.rng.int(0, i);
    [near[i], near[j]] = [near[j]!, near[i]!];
  }
  const u = urgency(s.needs.social);
  for (const t of near.slice(0, 3)) {
    const r = g.peekRel(s.id, t.id);
    const dist = Math.hypot(t.x - s.x, t.z - s.z);
    let best: { sd: SocialDef; sc: number } | null = null;
    for (const sd of SOCIALS) {
      if (sd.auto <= 0) continue;
      if (socialAvail(g, sd, s, t) !== true) continue;
      let sc = sd.auto * (1 + u * 3);
      const f = r?.f ?? 0;
      if (sd.cat === 'romantic') {
        if (!r || (r.r < 25 && !r.k)) continue;
        sc *= 0.6 + r.r / 50;
      }
      if (sd.cat === 'mean') {
        if (f > -20 && !g.hasTrait(s, 'grumpy') && !g.hasTrait(s, 'hothead')) continue;
        sc *= s.emo === 'angry' ? 2 : 0.7;
      }
      if (sd.cat === 'deep' && f < 30) sc *= 0.4;
      if (sd.cat === 'funny' && s.emo === 'playful') sc *= 1.6;
      sc *= likeOf(s, sd.id);
      sc += f * 0.08;
      if (!best || sc > best.sc) best = { sd, sc };
    }
    if (best) {
      const d = REG.get(`soc:${best.sd.id}`);
      if (d) out.push({ d, t, score: best.sc * (g.hasTrait(s, 'social') ? 1.4 : g.hasTrait(s, 'loner') ? 0.6 : 1) - dist * 0.4 });
    }
  }
  return out;
}

/** wählt unter den besten Möglichkeiten gewichtet aus (Menschen sind nicht perfekt) */
export function choose(g: Game, list: Choice[]): Choice | null {
  const top = list.filter((c) => c.score > 2).slice(0, 4);
  if (!top.length) return null;
  return g.rng.weighted(top, (c) => c.score * c.score) ?? top[0]!;
}

export function decide(g: Game, s: Sim): boolean {
  const ch = choose(g, candidates(g, s));
  if (!ch) return false;
  g.queueAction(s, ch.d.id, { obj: ch.o?.id, target: ch.t?.id ?? ch.p?.id, user: false, data: ch.data });
  return true;
}

/** Wird eine Figur detailliert simuliert? (ferne Stadtbewohner laufen abstrakt) */
export function isLive(s: Sim): boolean {
  return !(s.npc && !s.rt.spawned && !s.visit);
}

export function installAutonomy(g: Game): void {
  let rr = 0;
  g.systems.push({
    name: 'sims',
    tick: (g2, dt) => {
      let budget = 4; // Entscheidungen je Teilschritt
      const list = [...g2.sims.values()];
      for (const s of list) {
        if (!isLive(s)) continue;
        tickSim(g2, s, dt);
      }
      if (!list.length) return;
      for (let i = 0; i < list.length && budget > 0; i++) {
        const s = list[(rr + i) % list.length]!;
        if (!isLive(s) || s.away || s.trip || s.queue.length) continue;
        if (s.age === 'baby') continue;
        const ctrl = g2.isControllable(s) || !!s.guest;
        if (s.rt.idle < (s.guest ? 1.2 : ctrl ? 0.6 : 0.3)) continue;
        if (ctrl && g2.settings.autonomy === 0) continue;
        budget--;
        if (!decide(g2, s)) s.rt.idle = 0; // später erneut versuchen
      }
      rr = (rr + 4) % Math.max(1, list.length);
    },
  });
}
