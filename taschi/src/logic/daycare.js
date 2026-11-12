// Pension und Zucht: Zwei Taschis wohnen in der Pension, sammeln beim Laufen
// EP (1 EP pro Schritt) und legen ein Ei, wenn sie sich verstehen (gemeinsamer
// Typ). Das Ei schlüpft nach einer festen Schrittzahl; das Junge ist die
// Grundform des ersten Elternteils, erbt Werte und passende Attacken.
// Reine Logik: kein DOM, keine Szene.
import { SPECIES } from '../data/species.js';
import { MOVES } from '../data/moves.js';
import { baseForm } from '../data/trainers.js';
import { makeMonster, gainXp, maxPP, maxHp } from './monster.js';
import { learnset } from '../data/species.js';
import { NATURES } from './traits.js';

export const DAYCARE_SLOTS = 2;
export const EGG_CHECK_STEPS = 128;   // so oft wird geprüft, ob ein Ei da ist
export const MAX_EGGS = 6;
export const FEE_BASE = 100, FEE_PER_LEVEL = 25;

export function ensureDaycare(s) {
  s.daycare ||= { mons: [], steps: 0, egg: false };
  s.eggs ||= [];
  return s.daycare;
}

// gemeinsamer Typ = Zuneigung; gleiche Linie = besonders gute Zuneigung
export function compatibility(a, b) {
  if (!a || !b) return 0;
  const sa = SPECIES[a.id], sb = SPECIES[b.id];
  if (SPECIES[a.id].ancient || SPECIES[b.id].ancient) return 0;
  if (baseForm(a.id) === baseForm(b.id)) return 0.7;
  const ta = [sa.type, sa.type2].filter(Boolean), tb = [sb.type, sb.type2].filter(Boolean);
  return ta.some(t => tb.includes(t)) ? 0.4 : 0;
}
export function compatText(c) {
  return c >= 0.7 ? 'Die beiden verstehen sich prächtig!' : c > 0 ? 'Die beiden kommen gut miteinander aus.' : 'Die beiden spielen lieber jeder für sich.';
}

export function deposit(s, team, index) {
  const dc = ensureDaycare(s);
  if (dc.mons.length >= DAYCARE_SLOTS) return { ok: false, text: 'Die Pension ist voll.' };
  if (team.filter(m => m.hp > 0).length <= 1 && team[index]?.hp > 0) return { ok: false, text: 'Dein letztes kampffähiges Taschi bleibt besser bei dir.' };
  if (team.length <= 1) return { ok: false, text: 'Dein letztes Taschi bleibt bei dir.' };
  const [m] = team.splice(index, 1);
  dc.mons.push({ m, steps: 0, startLv: m.lv });
  return { ok: true, text: (m.nick || SPECIES[m.id].name) + ' zieht in die Pension.' };
}
export function fee(entry) { return FEE_BASE + FEE_PER_LEVEL * Math.max(0, entry.m.lv - entry.startLv); }
export function withdraw(s, index) {
  const dc = ensureDaycare(s), e = dc.mons[index];
  if (!e) return { ok: false, text: 'Da ist niemand.' };
  if (s.team.length >= 6) return { ok: false, text: 'Dein Team ist voll.' };
  const cost = fee(e);
  if (s.coins < cost) return { ok: false, text: 'Das kostet ★' + cost + '. Dafür reichen deine Sternmünzen nicht.' };
  s.coins -= cost;
  dc.mons.splice(index, 1);
  e.m.hp = maxHp(e.m);
  s.team.push(e.m);
  if (dc.mons.length < 2) dc.steps = 0;
  return { ok: true, text: (e.m.nick || SPECIES[e.m.id].name) + ' ist wieder bei dir (Lv ' + e.startLv + ' → ' + e.m.lv + ', ★' + cost + ').', cost };
}

// Wachstum ohne Rückfrage: bei vier Attacken verdrängt die neue die älteste.
// Entwicklungen passieren in der Pension nicht (erst wieder beim Training).
function growQuietly(m, amount) {
  const ev = gainXp(m, amount);
  for (const e of ev) if (e.type === 'learnFull') { m.moves.shift(); m.moves.push({ id: e.move, pp: maxPP(e.move) }); }
  return ev.filter(e => e.type === 'levelup').length;
}

// Wird mit gelaufenen Schritten aufgerufen. Gibt Ereignisse zurück:
// { egg: true } wenn ein Ei bereitliegt, { hatched: [Ei, …] } wenn Eier schlüpfen.
export function walk(s, steps, rng) {
  const dc = ensureDaycare(s), out = { egg: false, hatched: [] };
  steps = Math.max(0, Math.floor(steps));
  if (!steps) return out;
  for (const e of dc.mons) { e.steps += steps; growQuietly(e.m, steps); }
  if (dc.mons.length === 2 && !dc.egg) {
    dc.steps += steps;
    const c = compatibility(dc.mons[0].m, dc.mons[1].m);
    while (dc.steps >= EGG_CHECK_STEPS && !dc.egg) { dc.steps -= EGG_CHECK_STEPS; if (c && rng.next() < c) { dc.egg = true; out.egg = true; } }
  }
  for (const egg of s.eggs) {
    egg.left = Math.max(0, egg.left - steps);
    if (egg.left === 0) out.hatched.push(egg);
  }
  return out;
}

export function hatchSteps(id) {
  const sp = SPECIES[id], total = sp.hp + sp.atk + sp.def + sp.speed;
  return Math.round(Math.min(2600, Math.max(700, total * 3.4)) / 50) * 50;
}

// Das Ei abholen: Art, Werte, Wesen und Erbattacken stehen beim Legen fest.
export function makeEgg(a, b, rng) {
  const id = baseForm(a.id);
  const iv = {};
  const stats = ['hp', 'atk', 'def', 'speed'];
  const inherit = new Set();
  while (inherit.size < 3) inherit.add(stats[rng.int(0, 3)]);
  for (const k of stats) iv[k] = inherit.has(k) ? (rng.next() < 0.5 ? a : b).iv?.[k] ?? rng.int(0, 15) : rng.int(0, 15);
  const nature = rng.next() < 0.5 ? (rng.next() < 0.5 ? a : b).nature ?? rng.int(0, NATURES.length - 1) : rng.int(0, NATURES.length - 1);
  // Erbattacken: was ein Elternteil kann und das Junge irgendwann (oder per Typ) lernen könnte
  const can = new Set(learnset(id).map(([, mv]) => mv));
  const sp = SPECIES[id];
  const known = [...a.moves, ...b.moves].map(x => x.id).filter((mv, i, arr) => arr.indexOf(mv) === i && MOVES[mv] && mv !== 'verzweiflung');
  const eggMoves = known.filter(mv => can.has(mv) || MOVES[mv].type === sp.type || (sp.type2 && MOVES[mv].type === sp.type2)).slice(0, 2);
  return { id, iv, nature, eggMoves, shiny: rng.next() < 1 / 300 || (!!a.shiny && !!b.shiny && rng.next() < 0.1), left: hatchSteps(id), total: hatchSteps(id) };
}
export function collectEgg(s, rng) {
  const dc = ensureDaycare(s);
  if (!dc.egg || dc.mons.length < 2) return { ok: false, text: 'Noch kein Ei da.' };
  if (s.eggs.length >= MAX_EGGS) return { ok: false, text: 'Du kannst nur ' + MAX_EGGS + ' Eier gleichzeitig tragen.' };
  const egg = makeEgg(dc.mons[0].m, dc.mons[1].m, rng);
  dc.egg = false;
  s.eggs.push(egg);
  return { ok: true, egg, text: 'Du bekommst ein Ei! Trag es mit dir herum, bis es schlüpft.' };
}
export function hatch(s, egg, rng) {
  const i = s.eggs.indexOf(egg); if (i < 0) return null;
  s.eggs.splice(i, 1);
  const m = makeMonster(egg.id, 1, rng, { iv: { ...egg.iv }, nature: egg.nature, friendship: 120 });
  for (const mv of egg.eggMoves) {
    if (m.moves.some(x => x.id === mv)) continue;
    if (m.moves.length >= 4) m.moves.shift();
    m.moves.push({ id: mv, pp: maxPP(mv) });
  }
  if (egg.shiny) m.shiny = true;
  m.hp = maxHp(m);
  m.hatched = true;
  if (s.team.length < 6) s.team.push(m); else s.box.push(m);
  s.dex[m.id] = 2;
  s.stats.hatched = (s.stats.hatched || 0) + 1;
  return m;
}
export function eggHint(egg) {
  const f = egg.left / egg.total;
  return f > 0.66 ? 'Es scheint noch eine ganze Weile zu dauern.' : f > 0.33 ? 'Ab und zu wackelt es ein bisschen.' : f > 0.1 ? 'Man hört Geräusche von innen!' : 'Es schlüpft bald!';
}
