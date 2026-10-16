// Trainer rosters: route trainers, arena trainers, leaders, champions, guild
// members and the Star League. Teams are built deterministically from the
// region's element focus so every playthrough meets the same opponents.
import { SPECIES, SPECIES_IDS, speciesByType } from './species.js';
import { REGIONS, STAR_LEAGUE, LEGACY_TRAINERS } from './regions.js';
import { createRng } from '../core/rng.js';

// Evolve a species forward as far as the level allows.
export function fitSpecies(id, lv) {
  let cur = id, guard = 0;
  while (guard++ < 4) {
    const evo = SPECIES[cur].evo;
    if (!evo) break;
    const need = evo.level || 38;
    if (lv >= need) cur = evo.to; else break;
  }
  return cur;
}
// Base form of a species (for wild pools at low levels).
export function baseForm(id) {
  let cur = id, guard = 0;
  while (guard++ < 4) {
    const prev = SPECIES_IDS.find(k => SPECIES[k].evo?.to === cur);
    if (!prev) break;
    cur = prev;
  }
  return cur;
}

function pickFrom(rng, types, lv, avoid = new Set()) {
  const pool = types.flatMap(t => speciesByType(t)).filter(id => !SPECIES[id].ancient && id !== 'schnurrik');
  const bases = [...new Set(pool.map(baseForm))].filter(id => !avoid.has(id));
  const id = bases.length ? rng.pick(bases) : rng.pick(pool);
  avoid.add(id);
  return fitSpecies(id, lv);
}

// Team spec: [{ id, lv }]
function buildTeam(seed, types, size, topLevel, ace) {
  const rng = createRng('team:' + seed);
  const team = [];
  const avoid = new Set(ace ? [baseForm(ace)] : []);
  for (let i = 0; i < size - (ace ? 1 : 0); i++) {
    const lv = Math.max(2, topLevel - 1 - Math.floor(rng.next() * 3) - (size - i > 3 ? 1 : 0));
    team.push({ id: pickFrom(rng, types, lv, avoid), lv });
  }
  if (ace) team.push({ id: fitSpecies(ace, topLevel), lv: topLevel });
  return team;
}

const ROUTE_CLASSES = {
  valley: ['Wanderer', 'Picknickerin', 'Jungtrainer'], coast: ['Schwimmerin', 'Fischer', 'Seglerin'],
  plains: ['Bastlerin', 'Radfahrer', 'Elektrikerlehrling'], grove: ['Pilgerin', 'Gärtner', 'Teemeisterin'],
  forest: ['Käfersammler', 'Pilzsammlerin', 'Försterin'], cliffs: ['Gleitfliegerin', 'Bergsteiger', 'Drachenläufer'],
  volcanic: ['Feuerspucker', 'Schmiedelehrling', 'Geologin'], 'meadow-night': ['Sternguckerin', 'Nachtwanderer', 'Laternenträgerin'],
  swamp: ['Moorläufer', 'Irrlichtjägerin', 'Stegbauer'], snow: ['Skifahrerin', 'Eisangler', 'Bergführerin'],
  canopy: ['Kletterer', 'Vogelkundlerin', 'Seilbahnerin'], savanna: ['Steppenreiter', 'Karawanenhüterin', 'Trommler'],
  crystal: ['Bergmann', 'Edelsteinsucherin', 'Höhlenforscher'], 'bay-night': ['Taucherin', 'Muschelsammler', 'Poetin'],
  mesa: ['Falknerin', 'Töpfer', 'Sonnenläufer'], sky: ['Himmelsritterin', 'Wolkenweber', 'Ballonfahrerin']
};
const FIRST_NAMES = ['Ari', 'Bela', 'Cora', 'Dario', 'Elif', 'Fritz', 'Gesa', 'Hanno', 'Isa', 'Jonas', 'Kaja', 'Lenz', 'Mara', 'Nico', 'Olga', 'Paul', 'Quirin', 'Rike', 'Sven', 'Tamara', 'Ugo', 'Vera', 'Wim', 'Xenia', 'Yann', 'Zoe', 'Anouk', 'Bruno', 'Carla', 'Detlef', 'Emma', 'Fiete', 'Greta', 'Henrik', 'Ilka', 'Jule', 'Kilian', 'Lotta', 'Matteo', 'Nina', 'Ole', 'Pia', 'Rasmus', 'Selin', 'Theo', 'Uta', 'Valentin', 'Wiebke'];

export function prevLevel(r) { return r === 0 ? 3 : REGIONS[r - 1].gym.level; }

export const TRAINERS = {};
function reg(t) { TRAINERS[t.id] = t; return t; }

for (const region of REGIONS) {
  const r = region.id, gl = region.gym.level, pl = prevLevel(r);
  const classes = ROUTE_CLASSES[region.biome] || ROUTE_CLASSES.valley;
  const rng = createRng('trainers:' + r);
  // three route trainers, levels between previous and current arena
  for (let i = 0; i < 3; i++) {
    const legacy = LEGACY_TRAINERS.filter(t => t.region === r)[i];
    const lv = Math.round(pl + (gl - pl) * (0.3 + i * 0.25)) - 1;
    const name = legacy ? legacy.name : FIRST_NAMES[(r * 3 + i * 7) % FIRST_NAMES.length];
    const size = 1 + Math.min(2, Math.floor((r + i) / 5));
    const team = legacy && size === 1 ? [{ id: legacy.species, lv: Math.max(legacy.level, lv) }] : buildTeam('route:' + r + ':' + i, region.types, size, Math.max(3, lv), legacy?.species);
    reg({ id: 'route_' + r + '_' + i, region: r, kind: 'route', cls: classes[i % 3], name, team, ai: r < 4 ? 1 : 2,
      reward: 40 + lv * 12, legacyId: legacy ? legacy.id : undefined, sight: 7,
      intro: rng.pick(['Unsere Blicke haben sich getroffen – das heißt Kampf!', 'Ich trainiere hier jeden Tag. Zeig mal, was du kannst!', 'Hey! Lust auf ein ehrliches Duell?', 'Mein Team ist bereit. Und deins?', 'Endlich ein Gegner! Los geht’s!']),
      defeat: rng.pick(['Wow, du bist richtig gut!', 'Na gut, du hast gewonnen. Fair ist fair.', 'Ich muss wohl noch mehr trainieren …', 'Was für ein Kampf!']) });
  }
  // a double battle pair on every second route
  if (r % 2 === 1) {
    const lv = Math.round((pl + gl) / 2);
    reg({ id: 'double_' + r, region: r, kind: 'route', format: 'double', cls: 'Geschwister', name: ['Lina & Leo', 'Mats & Merle', 'Pit & Paula', 'Tom & Tilda', 'Jan & Juna', 'Rik & Ronja', 'Ben & Bea', 'Kai & Kiki'][(r - 1) / 2],
      team: buildTeam('double:' + r, region.types, 2, lv), ai: 2, reward: 80 + lv * 14, sight: 7,
      intro: 'Zu zweit sind wir unschlagbar! Ein Doppelkampf!', defeat: 'Zu zweit verloren … aber zusammen!' });
  }
  // arena trainers
  for (let i = 0; i < 2; i++) {
    const lv = gl - 4 + i * 2;
    reg({ id: 'gymtr_' + r + '_' + i, region: r, kind: 'gymTrainer', cls: 'Arena-Schüler' + (i ? 'in' : ''), name: FIRST_NAMES[(r * 5 + i * 11 + 3) % FIRST_NAMES.length],
      team: buildTeam('gymtr:' + r + ':' + i, region.types, 1 + (r >= 6 ? 1 : 0) + (r >= 12 ? 1 : 0), lv), ai: 2, reward: 60 + lv * 15,
      intro: 'Bevor du zur Leitung kommst, musst du an mir vorbei!', defeat: 'Unsere Leitung wird dich trotzdem schlagen!' });
  }
  const leaderSize = r < 3 ? 2 : r < 6 ? 3 : r < 10 ? 4 : r < 14 ? 5 : 6;
  reg({ id: 'leader_' + r, region: r, kind: 'leader', cls: 'Arenaleitung', name: region.gym.leader, team: buildTeam('leader:' + r, region.types, leaderSize, gl, region.gym.ace),
    ai: r < 2 ? 1 : r < 8 ? 2 : 3, reward: 300 + gl * 30, items: { trank: r < 6 ? 1 : 0, supertrank: r >= 6 ? 2 : 0 }, intro: region.gym.intro, defeat: region.gym.defeat });
  reg({ id: 'champ_' + r, region: r, kind: 'champion', cls: 'Regionaler Champion', name: region.champion.name, team: buildTeam('champ:' + r, region.types, Math.min(6, leaderSize + 1), gl + 3, region.champion.ace),
    ai: r < 4 ? 2 : 3, reward: 500 + gl * 35, items: { supertrank: 1 + (r >= 8 ? 1 : 0) }, intro: region.champion.intro, defeat: region.champion.defeat });
}

// Star League – five trials of increasing difficulty
STAR_LEAGUE.forEach((l, i) => {
  reg({ id: 'league_' + i, kind: 'league', cls: i === 4 ? 'Sternenmeisterin' : 'Meisterprüfung ' + (i + 1), name: l.name, team: buildTeam('league:' + i, l.types, 5 + (i >= 2 ? 1 : 0), l.level, l.ace),
    ai: 3, reward: 1500 + i * 500, items: { vitaltrank: 2 }, intro: l.intro, defeat: i === 4 ? 'Die sechzehn Lichter haben richtig gewählt. Du bist Sternenmeister.' : 'Du darfst zur nächsten Prüfung weitergehen.' });
});

// Postgame rematches: champions at level 55-65
for (const region of REGIONS) {
  const lv = 55 + Math.round(region.id * 0.6);
  reg({ id: 'rematch_' + region.id, region: region.id, kind: 'rematch', cls: 'Champion-Revanche', name: region.champion.name, team: buildTeam('rematch:' + region.id, region.types, 6, lv, region.champion.ace),
    ai: 3, reward: 2000 + region.id * 100, items: { vitaltrank: 2 }, intro: 'Seit unserem letzten Kampf habe ich hart trainiert. Diesmal gehe ich aufs Ganze!', defeat: 'Du bist wirklich ein Sternenmeister.' });
}

// ---------------------------------------------------------------------------
// Schattengilde – recurring characters with distinct personalities
// ---------------------------------------------------------------------------
export const GUILD_MEMBERS = {
  varga: { name: 'Kommandantin Varga', look: 'varga', personality: 'kühl, berechnend, hält sich für eine Retterin' },
  selma: { name: 'Selma', look: 'selma', personality: 'theatralisch, eitel, liebt glänzende Federn' },
  brix: { name: 'Brix', look: 'brix', personality: 'schüchterner Tüftler mit schlechtem Gewissen' },
  kett: { name: 'Kett & Kora', look: 'twins', personality: 'streitlustige Zwillinge, die sich ständig ins Wort fallen' },
  grunt: { name: 'Gildenhelfer', look: 'grunt', personality: 'Mitläufer' }
};

function guildTeam(seed, types, size, lv, ace) { return buildTeam('guild:' + seed, types, size, lv, ace); }

export const GUILD_SITES = REGIONS.filter(r => r.guild !== undefined).map(r => r.guild);
// guild battles per site index (0..6) plus 7 = Sternengipfel finale
const G = [];
const gl = (r) => REGIONS[r].gym.level;
G[0] = [
  { id: 'g0_grunt', member: 'grunt', team: guildTeam('g0a', ['normal', 'elektro'], 1, gl(2) - 3) },
  { id: 'g0_twins', member: 'kett', format: 'double', team: guildTeam('g0b', ['elektro', 'normal'], 2, gl(2) - 1) }
];
G[1] = [
  { id: 'g1_grunt', member: 'grunt', team: guildTeam('g1a', ['flug', 'normal'], 2, gl(4) - 3) },
  { id: 'g1_selma', member: 'selma', team: guildTeam('g1b', ['flug', 'pflanze'], 2, gl(4), 'flatterling') }
];
G[2] = [
  { id: 'g2_grunt', member: 'grunt', team: guildTeam('g2a', ['feuer', 'normal'], 2, gl(6) - 2) },
  { id: 'g2_grunt2', member: 'grunt', team: guildTeam('g2c', ['gestein', 'feuer'], 2, gl(6) - 1) },
  { id: 'g2_brix', member: 'brix', team: [...guildTeam('g2b', ['elektro', 'gestein'], 2, gl(6) - 1), { id: 'schnurrik', lv: gl(6) + 1 }] }
];
G[3] = [
  { id: 'g3_grunt', member: 'grunt', team: guildTeam('g3a', ['geist', 'wasser'], 2, gl(8) - 2) },
  { id: 'g3_varga', member: 'varga', team: guildTeam('g3b', ['geist', 'eis', 'erde'], 3, gl(8) + 1) }
];
G[4] = [
  { id: 'g4_grunt', member: 'grunt', team: guildTeam('g4a', ['pflanze', 'normal'], 2, gl(10) - 2) },
  { id: 'g4_selma', member: 'selma', team: guildTeam('g4b', ['flug', 'feuer'], 4, gl(10) + 1, 'form_5_2') }
];
G[5] = [
  { id: 'g5_grunt', member: 'grunt', team: guildTeam('g5a', ['gestein', 'erde'], 3, gl(12) - 2) },
  { id: 'g5_twins', member: 'kett', format: 'double', team: guildTeam('g5b', ['elektro', 'gestein', 'erde'], 4, gl(12) + 1) }
];
G[6] = [
  { id: 'g6_grunt', member: 'grunt', team: guildTeam('g6a', ['feuer', 'flug'], 3, gl(14) - 1) },
  { id: 'g6_selma', member: 'selma', team: guildTeam('g6b', ['flug', 'feuer', 'geist'], 5, gl(14) + 1, 'form_5_2') }
];
G[7] = [
  { id: 'g7_grunts', member: 'grunt', format: 'double', team: guildTeam('g7a', ['normal', 'geist'], 4, gl(15) + 1) },
  { id: 'g7_twins', member: 'kett', format: 'double', team: guildTeam('g7b', ['elektro', 'erde', 'eis'], 4, gl(15) + 2) },
  { id: 'g7_varga', member: 'varga', team: guildTeam('g7c', ['geist', 'eis', 'erde', 'feuer'], 6, gl(15) + 4) }
];
export const GUILD_BATTLES = G;
G.forEach((list, site) => list.forEach((t, i) => reg({
  ...t, kind: 'guild', site, order: i, cls: t.member === 'grunt' ? 'Schattengilde' : 'Schattengilde', name: GUILD_MEMBERS[t.member].name,
  ai: t.member === 'grunt' ? 1 : t.member === 'varga' ? 3 : 2, reward: 120 + i * 120 + site * 60, items: t.member === 'varga' ? { supertrank: 2 } : {}
})));

export function trainerById(id) { return TRAINERS[id]; }
export function regionTrainers(r, kind) { return Object.values(TRAINERS).filter(t => t.region === r && (!kind || t.kind === kind)); }

// ---------------------------------------------------------------- rival
// Rian meets the player when arriving in these regions. The team grows with
// every meeting and always leads with the starter that beats the player's.
export const RIVAL_STAGES = [
  { region: 1, level: 10, size: 2, ai: 1 },
  { region: 4, level: 20, size: 3, ai: 2 },
  { region: 8, level: 31, size: 4, ai: 2 },
  { region: 12, level: 40, size: 5, ai: 3 },
  { region: 15, level: 48, size: 6, ai: 3 }
];
const RIVAL_STARTER = { glutzahn: 'plaetscher', plaetscher: 'samenling', samenling: 'glutzahn' };
const RIVAL_PARTNERS = ['flatterling', 'knister', 'felsling', 'laternchen', 'floeckchen'];

export function rivalTrainer(stage, playerStarter) {
  const st = RIVAL_STAGES[stage];
  if (!st) return null;
  const ace = RIVAL_STARTER[playerStarter] || 'samenling';
  const team = [];
  for (let i = 0; i < st.size - 1; i++) {
    const lv = Math.max(3, st.level - 2 - ((st.size - 2 - i) % 3));
    team.push({ id: fitSpecies(RIVAL_PARTNERS[i], lv), lv });
  }
  team.push({ id: fitSpecies(ace, st.level), lv: st.level });
  return { id: 'rival_' + stage, region: st.region, kind: 'rival', cls: 'Rivale', name: 'Rian', team, ai: st.ai,
    reward: 200 + stage * 250, items: stage >= 2 ? { supertrank: stage >= 4 ? 2 : 1 } : {}, intro: '', defeat: '' };
}
