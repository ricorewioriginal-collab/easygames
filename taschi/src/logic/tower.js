// Kampfturm: Mit drei eigenen Taschis (auf Level 50 angeglichen, ohne Items aus
// der Tasche) gegen eine endlose Folge von Trainern. Nach jedem Kampf wird
// geheilt; jede Etage hat 7 Kämpfe. Siege bringen Turmpunkte (TP), die man
// im Turm gegen seltene Belohnungen tauscht. Reine Logik.
import { SPECIES, SPECIES_IDS } from '../data/species.js';
import { fitSpecies, baseForm } from '../data/trainers.js';
import { makeMonster, healMonster } from './monster.js';
import { createRng } from '../core/rng.js';

export const TOWER_LEVEL = 50, TOWER_TEAM = 3, FLOOR_SIZE = 7, TOWER_BADGES = 8;
const CLASSES = ['Turmläuferin', 'Turmläufer', 'Strategin', 'Taktiker', 'Ass-Trainerin', 'Ass-Trainer', 'Turmwächterin', 'Turmmeister'];
const NAMES = ['Mira', 'Jonas', 'Ella', 'Finn', 'Lea', 'Noah', 'Ida', 'Ben', 'Mila', 'Paul', 'Zoe', 'Theo', 'Nele', 'Emil', 'Romy', 'Kai'];
const HELD = ['heilbeere', 'klarbeere', 'kraftband', 'fokusband', 'lernband'];

export const TOWER_SHOP = [
  { item: 'levelbonbon', tp: 3 }, { item: 'vitaltrank', tp: 2 }, { item: 'fokusband', tp: 6 }, { item: 'kraftband', tp: 5 },
  { item: 'heilbeere', tp: 1 }, { item: 'klarbeere', tp: 1 }, { item: 'sternsplitter', tp: 4 }, { item: 'sternball', tp: 2 }, { item: 'disk_gigastoss', tp: 12 }
];

export function towerOpen(s) { return (s.badges || 0) >= TOWER_BADGES; }
export function ensureTower(s) { s.tower ||= {}; s.tower.best ??= 0; s.tower.tp ??= 0; return s.tower; }

// Kopien auf Level 50 mit eigener uid: das Original bleibt unberührt
export function towerCopy(m) {
  const c = makeMonster(m.id, TOWER_LEVEL, null, { iv: { ...m.iv }, nature: m.nature, friendship: m.friendship ?? 70, shiny: m.shiny, nick: m.nick });
  c.uid = 'tw_' + m.uid;
  c.moves = m.moves.map(x => ({ id: x.id, pp: x.pp }));
  if (m.held) c.held = m.held;
  healMonster(c);
  return c;
}

export function startRun(s, picked) {
  const t = ensureTower(s);
  if (picked.length !== TOWER_TEAM) return { ok: false, text: 'Wähle genau drei Taschis.' };
  t.run = { uids: picked.map(m => m.uid), streak: 0, seed: Date.now() % 1e9 };
  return { ok: true };
}

// Gegner Nummer n (0-basiert): je höher die Serie, desto stärker (KI, Items, Ass)
export function opponent(run) {
  const n = run.streak, rng = createRng('tower:' + run.seed + ':' + n);
  const pool = SPECIES_IDS.filter(id => !SPECIES[id].ancient && id !== 'schnurrik' && baseForm(id) === id);
  const team = [];
  const used = new Set();
  while (team.length < TOWER_TEAM) {
    const base = rng.pick(pool); if (used.has(base)) continue; used.add(base);
    const id = fitSpecies(base, TOWER_LEVEL);
    team.push({ id, lv: TOWER_LEVEL - (n < 7 ? 3 : n < 14 ? 1 : 0) });
  }
  const boss = (n + 1) % FLOOR_SIZE === 0;
  const name = rng.pick(NAMES), cls = boss ? 'Etagenboss' : CLASSES[Math.min(CLASSES.length - 1, Math.floor(n / 3))];
  const held = team.map((x, i) => (boss || n >= 7) && (i === TOWER_TEAM - 1 || rng.next() < Math.min(0.8, n / 20)) ? HELD[Math.floor(rng.next() * HELD.length)] : null);
  return { id: 'tower_' + n, kind: 'tower', cls, name, team, held, ai: n < 3 ? 2 : 3, boss, items: n >= 14 ? { supertrank: 1 } : {},
    intro: boss ? 'Du hast es bis zu mir geschafft. Zeig mir, was dein Team kann!' : 'Etage ' + floorOf(n) + ', Kampf ' + (n % FLOOR_SIZE + 1) + '. Los geht’s!',
    defeat: boss ? 'Beeindruckend. Die nächste Etage wartet.' : 'Stark gekämpft!' };
}
export function floorOf(n) { return Math.floor(n / FLOOR_SIZE) + 1; }
export function buildFoe(op, rng) {
  return op.team.map((x, i) => { const m = makeMonster(x.id, x.lv, rng); if (op.held[i]) m.held = op.held[i]; return m; });
}

// Ergebnis eines Turmkampfs verbuchen. TP: 1 pro Sieg, +3 für den Etagenboss.
export function recordWin(s) {
  const t = ensureTower(s), run = t.run; if (!run) return 0;
  const boss = (run.streak + 1) % FLOOR_SIZE === 0;
  run.streak++;
  const tp = 1 + (boss ? 3 : 0) + (run.streak >= 21 ? 1 : 0);
  t.tp += tp;
  t.best = Math.max(t.best, run.streak);
  return tp;
}
export function endRun(s) { const t = ensureTower(s), streak = t.run?.streak || 0; t.run = null; return streak; }

export function buy(s, entry) {
  const t = ensureTower(s);
  if (t.tp < entry.tp) return { ok: false, text: 'Dafür brauchst du ' + entry.tp + ' TP.' };
  t.tp -= entry.tp;
  s.bag[entry.item] = (s.bag[entry.item] | 0) + 1;
  return { ok: true };
}
