// Headless playthrough simulation used by tests: plays the whole game through
// the logic layer (no rendering) – starter, wild battles, catching, quests,
// puzzles (solved with the real solvers), guild, arenas, champions, summit,
// Star League. Returns statistics that tests assert on.
import { createRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { REGIONS } from '../src/data/regions.js';
import { TRAINERS, GUILD_BATTLES } from '../src/data/trainers.js';
import { MOVES } from '../src/data/moves.js';
import { effectiveness } from '../src/data/types.js';
import { makeMonster, healMonster, maxHp, evolve, firstHealthy } from '../src/logic/monster.js';
import { createBattle, runTurn, replace, activeMon, targetsFor } from '../src/logic/battle.js';
import { rollEncounter } from '../src/logic/encounters.js';
import { newSave } from '../src/logic/save.js';
import * as P from '../src/logic/progress.js';
import * as Items from '../src/logic/items.js';
import { generatePuzzle, solve } from '../src/logic/puzzles.js';

function bestMove(b, slot) {
  const me = activeMon(b, 0, slot);
  const foes = targetsFor(b, 0);
  let best = null, score = -1;
  for (const mv of me.moves) {
    if (mv.pp <= 0) continue;
    const data = MOVES[mv.id];
    for (const t of foes) {
      const foe = activeMon(b, 1, t);
      const sp = SPECIES[me.id];
      const sc = data.power * data.acc * effectiveness(data.type, SPECIES[foe.id]) * ((data.type === sp.type || data.type === sp.type2) ? 1.5 : 1);
      if (sc > score) { score = sc; best = { slot, type: 'move', move: mv.id, target: t }; }
    }
  }
  return best || { slot, type: 'move', move: 'verzweiflung', target: foes[0] };
}

export function fight(save, rng, foeTeam, opts = {}) {
  const bag = save.bag;
  const b = createBattle({ rng, kind: opts.kind || 'trainer', format: opts.format, player: { team: save.team, bag }, foe: { team: foeTeam, ai: opts.ai ?? 1, trainer: opts.kind !== 'wild', name: opts.name || 'X', items: opts.items || {} }, canCatch: opts.kind === 'wild' });
  let guard = 0;
  while (!b.result && guard++ < 300) {
    if (b.phase === 'replace') {
      for (const slot of [...b.needReplace]) {
        const i = save.team.findIndex((m, idx) => m.hp > 0 && !b.sides[0].active.includes(idx));
        replace(b, slot, i);
      }
      continue;
    }
    const choices = [];
    b.sides[0].active.forEach((i, slot) => {
      const m = i === null ? null : save.team[i];
      if (!m || m.hp <= 0) return;
      if (opts.catchIt && bag.taschiball > 0 && b.sides[1].team[0].hp < maxHp(b.sides[1].team[0]) * 0.5) choices.push({ slot, type: 'item', item: bag.sternball ? 'sternball' : bag.superball ? 'superball' : 'taschiball' });
      else if (m.hp < maxHp(m) * 0.25 && (bag.supertrank || bag.trank) && opts.kind !== 'wild') choices.push({ slot, type: 'item', item: bag.supertrank ? 'supertrank' : 'trank', target: m.uid });
      else choices.push(bestMove(b, slot));
    });
    runTurn(b, choices);
  }
  for (const e of b.pendingEvolutions) { const m = save.team.find(x => x.uid === e.uid); if (m) evolve(m, e.to); }
  // learn new moves by replacing the weakest one (the UI asks the player)
  for (const req of b.learnRequests) {
    const m = save.team.find(x => x.uid === req.uid); if (!m) continue;
    let weakest = 0;
    m.moves.forEach((x, i) => { if ((MOVES[x.id].power || 30) < (MOVES[m.moves[weakest].id].power || 30)) weakest = i; });
    if ((MOVES[req.move].power || 30) > (MOVES[m.moves[weakest].id].power || 30)) m.moves[weakest] = { id: req.move, pp: MOVES[req.move].pp };
  }
  if (b.result?.outcome === 'caught') {
    const c = b.result.caught;
    save.dex[c.id] = 2;
    if (save.team.length < 6) save.team.push(c); else save.box.push(c);
    save.stats['caughtIn:' + opts.region] = (save.stats['caughtIn:' + opts.region] || 0) + 1;
  }
  for (const m of foeTeam) save.dex[m.id] ||= 1;
  return b.result?.outcome;
}

const heal = (s) => s.team.forEach(healMonster);
const mk = (spec, rng) => spec.map(x => makeMonster(x.id, x.lv, rng));
const avgTeamLevel = (s) => s.team.slice(0, 4).reduce((a, m) => a + m.lv, 0) / Math.min(4, s.team.length);

export function simulate(seed = 'sim', starter = 'plaetscher') {
  const rng = createRng(seed);
  const save = newSave({ name: 'Sim' });
  const stats = { wild: 0, trainer: 0, losses: 0, caught: 0, puzzles: 0, quests: 0 };
  save.flags.metUlme = true;
  save.team.push(makeMonster(starter, 5, rng)); save.dex[starter] = 2; save.flags.starterChosen = true;
  fight(save, rng, [makeMonster('fellino', 3, rng)], { kind: 'wild', region: 0 });
  Object.assign(save.flags, { firstBattle: true, firstQuest: true, travelStarted: true });
  const train = (r, target) => {
    let n = 0;
    while (avgTeamLevel(save) < target && n++ < 400) {
      heal(save);
      const wild = rollEncounter(r, rng);
      const catchIt = save.team.length < 6 && !save.dex[wild.id] && rng.next() < 0.8;
      Items.add(save.bag, 'taschiball', 1);
      fight(save, rng, [wild], { kind: 'wild', catchIt, region: r });
      stats.wild++;
    }
    // rotate weakest team member out once the box has stronger options
    save.team.sort((a, b) => b.lv - a.lv);
  };
  const beat = (t, extra = {}) => {
    let tries = 0;
    while (tries++ < 8) {
      heal(save);
      const res = fight(save, rng, mk(t.team, rng), { kind: 'trainer', ai: t.ai, format: t.format, items: { ...(t.items || {}) }, ...extra });
      stats.trainer++;
      if (res === 'win') { save.trainers[t.id] = true; save.coins += t.reward; return true; }
      stats.losses++;
      const top = Math.max(...t.team.map(m => m.lv));
      train(extra.region ?? 0, top + 2);
    }
    throw new Error('Could not beat ' + t.id + ' team ' + JSON.stringify(t.team) + ' mine ' + JSON.stringify(save.team.map(m => [m.id, m.lv, m.moves.map(x => x.id)])) + ' wild ' + stats.wild);
  };
  for (const region of REGIONS) {
    const r = region.id;
    save.visited[r] = true;
    for (const q of P.regionQuests(r)) P.acceptQuest(save, q);
    train(r, region.gym.level - 1);
    for (let i = 0; i < 3; i++) beat(TRAINERS['route_' + r + '_' + i], { region: r });
    if (TRAINERS['double_' + r]) beat(TRAINERS['double_' + r], { region: r });
    if (region.guild !== undefined) {
      for (const t of GUILD_BATTLES[region.guild]) beat(TRAINERS[t.id], { region: r });
      save.guild[region.guild] = 'done';
      if (region.guild === 6) Items.add(save.bag, 'brixcode', 1);
    }
    const pz = generatePuzzle(region.puzzle.kind, r, Math.floor(r / 4));
    if (!solve(pz)) throw new Error('unsolvable puzzle in ' + region.name);
    save.puzzles['region:' + r] = true; stats.puzzles++;
    const gz = generatePuzzle(region.gym.mechanic, 'gym' + r, Math.floor(r / 4));
    if (!solve(gz)) throw new Error('unsolvable gym puzzle in ' + region.name);
    save.puzzles['gym:' + r] = true;
    for (let i = 0; i < 2; i++) beat(TRAINERS['gymtr_' + r + '_' + i], { region: r });
    if (!P.leaderAvailable(save, r)) throw new Error('leader locked in ' + region.name);
    train(r, region.gym.level + 1);
    beat(TRAINERS['leader_' + r], { region: r });
    save.badges = r + 1;
    train(r, region.gym.level + 3);
    beat(TRAINERS['champ_' + r], { region: r });
    save.champions[r] = true;
    // quests: catch-type goals are fulfilled by catching; find quests by flag
    for (const q of P.regionQuests(r)) {
      if (q.steps[0].kind === 'flag') save.flags[q.steps[0].flag] = true;
      if (P.questState(save, q).status === 'ready' && P.turnInQuest(save, q).ok) stats.quests++;
    }
  }
  if (!P.summitOpen(save)) throw new Error('summit not open');
  for (const t of GUILD_BATTLES[7]) { train(15, Math.max(...TRAINERS[t.id].team.map(m => m.lv)) + 1); beat(TRAINERS[t.id], { region: 15 }); }
  save.flags.summitDone = true;
  if (!P.leagueOpen(save)) throw new Error('league closed');
  for (let i = 0; i < 5; i++) { train(15, TRAINERS['league_' + i].team.at(-1).lv + 2); beat(TRAINERS['league_' + i], { region: 15 }); save.league = i + 1; }
  stats.caught = Object.values(save.dex).filter(v => v === 2).length;
  stats.objective = P.mainObjective(save).text;
  stats.teamLevels = save.team.map(m => m.lv);
  return { save, stats };
}
