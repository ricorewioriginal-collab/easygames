// Progression rules: unlocks, quests, objectives and rewards.
import { REGIONS } from '../data/regions.js';
import { SPECIES } from '../data/species.js';
import { ITEMS } from '../data/items.js';
import { GUILD_BATTLES } from '../data/trainers.js';
import { add as addItem } from './items.js';

export const caughtCount = (s) => Object.values(s.dex).filter(v => v === 2).length;
export const seenCount = (s) => Object.keys(s.dex).length;

export function regionUnlocked(s, r) { return r === 0 || !!s.champions[r - 1]; }
export function northGateOpen(s, r) { return r < 15 ? !!s.champions[r] : !!s.champions[15] && s.badges >= 16; }
export function arenaOpen(s, r) { return !!s.puzzles['region:' + r]; }
export function leaderAvailable(s, r) {
  const g = REGIONS[r].guild;
  return s.badges === r && (g === undefined || guildNext(s, g) === 'done');
}
export function championAvailable(s, r) { return s.badges > r && !s.champions[r]; }
export function summitOpen(s) { return s.badges >= 16 && !!s.champions[15] && !!s.bag.brixcode; }
export function leagueOpen(s) { return !!s.flags.summitDone; }
export function postgame(s) { return s.league >= 5; }

// Guild site state: which battle index is next (0..n), 'done' when finished.
export function guildNext(s, site) {
  const st = s.guild[site];
  if (st === 'done') return 'done';
  const list = GUILD_BATTLES[site] || [];
  const i = list.findIndex(t => !s.trainers[t.id]);
  return i < 0 ? 'done' : i;
}
export function guildActive(s, site) {
  // a guild site becomes active once the player reached its region (and for
  // the station, after obtaining the key from the camp grunt)
  if (site === 7) return summitOpen(s);
  const region = REGIONS.find(r => r.guild === site);
  return !!region && regionUnlocked(s, region.id);
}

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------
export function regionQuests(r) {
  const region = REGIONS[r];
  const list = (region.quests || []).map(q => ({ ...q, region: r, steps: q.kind === 'find'
    ? [{ kind: 'flag', flag: 'lost:' + q.id, text: q.desc }, { kind: 'talk', text: 'Bringe den Fund zu ' + q.giver + '.' }]
    : [{ kind: q.kind, type: q.type, count: q.count, text: q.desc }, { kind: 'talk', text: 'Sprich mit ' + q.giver + '.' }] }));
  // multi-part research assignment by the regional professor
  list.push({
    id: 'prof_' + r, region: r, giver: region.professor.title, title: 'Forschungsauftrag ' + region.name,
    desc: region.professor.title + ' bittet dich um Hilfe bei der Erforschung der Region.',
    reward: { coins: 200 + r * 60, items: r < 5 ? { superball: 3 } : r < 10 ? { supertrank: 3, superball: 3 } : { vitaltrank: 2, sternball: 2 } },
    steps: [
      { kind: 'seenType', types: region.types, count: 3 + Math.floor(r / 4), text: 'Sieh dir ' + (3 + Math.floor(r / 4)) + ' verschiedene Arten der Typen ' + region.types.join(' / ') + ' an.' },
      { kind: 'catchIn', region: r, count: 1, text: 'Fange ein Taschi in ' + region.name + '.' },
      { kind: 'talk', text: 'Berichte ' + region.professor.title + ' im Labor.' }
    ]
  });
  return list;
}
export const ALL_QUESTS = REGIONS.flatMap(r => regionQuests(r.id));
export const questById = (id) => ALL_QUESTS.find(q => q.id === id);

function stepMet(s, step) {
  switch (step.kind) {
    case 'catchType': return Object.keys(s.dex).filter(id => s.dex[id] === 2 && (SPECIES[id].type === step.type || SPECIES[id].type2 === step.type)).length >= step.count;
    case 'dexCount': return caughtCount(s) >= step.count;
    case 'seenType': return Object.keys(s.dex).filter(id => step.types.includes(SPECIES[id].type) || step.types.includes(SPECIES[id].type2)).length >= step.count;
    case 'catchIn': return (s.stats['caughtIn:' + step.region] || 0) >= step.count;
    case 'flag': return !!s.flags[step.flag];
    case 'talk': return false; // completed by talking
  }
  return false;
}
export function stepProgress(s, step) {
  switch (step.kind) {
    case 'catchType': return Math.min(step.count, Object.keys(s.dex).filter(id => s.dex[id] === 2 && (SPECIES[id].type === step.type || SPECIES[id].type2 === step.type)).length) + '/' + step.count;
    case 'dexCount': return Math.min(step.count, caughtCount(s)) + '/' + step.count;
    case 'seenType': return Math.min(step.count, Object.keys(s.dex).filter(id => step.types.includes(SPECIES[id].type) || step.types.includes(SPECIES[id].type2)).length) + '/' + step.count;
    case 'catchIn': return Math.min(step.count, s.stats['caughtIn:' + step.region] || 0) + '/' + step.count;
  }
  return '';
}

export function questState(s, q) {
  const st = s.quests[q.id];
  if (!st) return { status: 'new', step: 0 };
  if (st.done) return { status: 'done', step: q.steps.length };
  let step = st.step || 0;
  while (step < q.steps.length && stepMet(s, q.steps[step])) step++;
  if (step !== st.step) st.step = step;
  const ready = q.steps[step]?.kind === 'talk';
  return { status: ready ? 'ready' : 'active', step };
}

export function acceptQuest(s, q) { if (!s.quests[q.id]) s.quests[q.id] = { step: 0 }; return questState(s, q); }

export function grantReward(s, reward = {}) {
  const got = [];
  if (reward.coins) { s.coins += reward.coins; got.push('★' + reward.coins); }
  for (const [id, n] of Object.entries(reward.items || {})) { if (!n) continue; addItem(s.bag, id, n); got.push(n + '× ' + ITEMS[id].name); }
  if (reward.keyItem) { addItem(s.bag, reward.keyItem, 1); got.push(ITEMS[reward.keyItem].name); }
  return got;
}

// Hand in a quest at its giver. Returns { ok, rewards } or { ok:false }.
export function turnInQuest(s, q) {
  const st = questState(s, q);
  if (st.status !== 'ready') return { ok: false };
  s.quests[q.id] = { step: q.steps.length, done: true };
  return { ok: true, rewards: grantReward(s, q.reward) };
}

export function activeQuests(s) {
  return ALL_QUESTS.filter(q => s.quests[q.id] && !s.quests[q.id].done).map(q => ({ q, st: questState(s, q) }));
}

// ---------------------------------------------------------------------------
// Main objective (shown in the HUD and quest book)
// ---------------------------------------------------------------------------
export function mainObjective(s) {
  const f = s.flags;
  if (!f.metUlme) return { text: 'Sprich mit Professor Ulme vor der Glaskuppel.', region: 0, target: 'professor' };
  if (!f.starterChosen) return { text: 'Untersuche die Taschibälle auf dem Podest unter der Kuppel.', region: 0, target: 'podium' };
  if (!f.firstBattle) return { text: 'Besiege das wilde Taschi im Beet vor der Kuppel.', region: 0, target: 'professor' };
  if (!f.firstQuest) return { text: 'Sprich noch einmal mit Professor Ulme.', region: 0, target: 'professor' };
  if (s.badges < 16) {
    const r = s.badges;
    const g = REGIONS[r].guild;
    if (r > 0 && !s.champions[r - 1]) return { text: 'Besiege ' + REGIONS[r - 1].champion.name + ' im Champion-Pavillon von ' + REGIONS[r - 1].name + '.', region: r - 1, target: 'champion' };
    if (g !== undefined && guildNext(s, g) !== 'done') return { text: 'Stoppe die Schattengilde in ' + REGIONS[r].name + ' – ' + (r === 6 ? 'ihre Forschungsstation liegt am Glutkegel.' : 'ihr Ballon wurde nahe der Stadt gesehen.'), region: r, target: 'guild' };
    if (!s.puzzles['region:' + r]) return { text: 'Löse das Rätsel „' + REGIONS[r].puzzle.name + '“ in ' + REGIONS[r].name + '.', region: r, target: 'puzzle' };
    return { text: 'Gewinne das Licht-Siegel bei ' + REGIONS[r].gym.leader + ' (' + REGIONS[r].gym.theme + ').', region: r, target: 'arena' };
  }
  if (!s.champions[15]) return { text: 'Besiege ' + REGIONS[15].champion.name + ' in Himmelskrone.', region: 15, target: 'champion' };
  if (!s.bag.brixcode) return { text: 'Hilf Brix in der Sonnenhöhe – er hat die Zugangskarte zum Sternengipfel.', region: 14, target: 'guild' };
  if (!f.summitDone) return { text: 'Steige durch das Nordtor von Himmelskrone zum Sternengipfel und stoppe Varga.', region: 15, target: 'north' };
  if (s.league < 5) return { text: 'Bestehe Meisterprüfung ' + (s.league + 1) + '/5 der Sternenliga am Sternengipfel.', region: 16, target: 'league' };
  const legends = ['tiefenlied', 'sturmkron', 'mondhueter', 'auraflamme'].filter(id => s.dex[id] !== 2).length;
  if (legends) return { text: 'Postgame: Finde die ' + legends + ' verbleibenden uralten Wächter.', region: null, target: 'legend' };
  return { text: 'Postgame: Vervollständige den Taschidex (' + caughtCount(s) + '/214) und fordere Champions zur Revanche.', region: null, target: null };
}

export function chapterOf(s) {
  if (s.league >= 5) return 6;
  if (s.flags.summitDone) return 5;
  if (s.bag?.brixcode || s.guild[6] === 'done') return 4;
  if (s.guild[3] === 'done' || s.badges >= 9) return 3;
  if (s.guild[2] === 'done' || s.badges >= 7) return 2;
  if (s.guild[0] === 'done' || s.badges >= 3) return 1;
  return 0;
}
