// TASCHI species catalogue – 260 species.
// IDs and names are identical to version 1 so existing saves remain valid.
// Visual "look" descriptions drive the procedural creature builder; every
// family shares a design language and gains features with each stage.
import { TYPE_MOVESET, TYPE_LEARN, MOVES } from './moves.js';

const hsl = (h, s, l) => {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
};

// ---------------------------------------------------------------------------
// Handcrafted core species (v1 originals). Stats/catch/evolutions unchanged.
// ---------------------------------------------------------------------------
const CORE = {
  blitzi: { name: 'Blitzi', type: 'elektro', color: 0xffd23e, hp: 40, atk: 55, def: 40, speed: 90, catch: .49, moves: ['stoss', 'funken'], evo: { to: 'blitzor', level: 18 },
    look: { plan: 'biped', colors: [0xffd23e, 0x3c4a7a, 0xfff3c4], features: { ears: 'tuft', crest: 'spark', tail: 'thin', eyes: 'big', pattern: 'stripes' }, size: .78 },
    bio: 'Blitzi springt auf den Hinterbeinen über Weidezäune und lädt seine Funkenkämme an trockenen Gräsern auf.', behavior: 'playful' },
  blitzor: { name: 'Blitzor', type: 'elektro', color: 0xf9a82e, hp: 65, atk: 90, def: 55, speed: 110, catch: .23, moves: ['funken', 'stoss'], evo: { to: 'donnarion', level: 36 },
    look: { plan: 'biped', colors: [0xf9a82e, 0x2c3560, 0xffe9b0], features: { ears: 'tuft', crest: 'spark', mane: true, tail: 'thin', eyes: 'sharp', pattern: 'stripes', glow: true }, size: 1.2 },
    bio: 'Wenn Blitzor seine Mähne aufstellt, knistert die Luft im Umkreis eines ganzen Feldes.', behavior: 'aggressive' },
  fellino: { name: 'Fellino', type: 'normal', color: 0xb9825a, hp: 55, atk: 55, def: 50, speed: 55, catch: .5, moves: ['stoss', 'hieb'], evo: { to: 'fellisto', level: 18 },
    look: { plan: 'quad', colors: [0xb9825a, 0xf3dfc1, 0xfff4e2], features: { ears: 'long', tail: 'bushy', eyes: 'big', pattern: 'spots' }, size: .85 },
    bio: 'Ein flauschiges Wiesentaschi mit langen Ohren. Es begleitet Wanderer gern ein Stück des Weges.', behavior: 'curious' },
  glutzahn: { name: 'Glutzahn', type: 'feuer', color: 0xf47d3b, hp: 44, atk: 52, def: 43, speed: 65, catch: .44, moves: ['stoss', 'glut'], evo: { to: 'glutdrach', level: 16 },
    look: { plan: 'quad', colors: [0xf47d3b, 0x5a2b24, 0xffd9a0], features: { ears: 'pointy', mane: true, crest: 'flame', tail: 'bushy', eyes: 'big' }, size: .8 },
    bio: 'Glutzahn trägt eine Mähne aus warmer Glut. Wenn es sich freut, flackert sie golden auf.', behavior: 'playful' },
  glutdrach: { name: 'Glutdrach', type: 'feuer', color: 0xda532d, hp: 78, atk: 84, def: 78, speed: 100, catch: .23, moves: ['glut', 'hieb'], evo: { to: 'magmadrach', level: 36 },
    look: { plan: 'quad', colors: [0xda532d, 0x3a1d1d, 0xffc06b], features: { horns: 2, mane: true, crest: 'flame', wings: 'bat', tail: 'spike', eyes: 'sharp', glow: true }, size: 1.35 },
    bio: 'Glutdrach gleitet mit ausgebreiteten Schwingen über Lavafelder und schmiedet mit seinem Atem Steine weich.', behavior: 'aggressive' },
  samenling: { name: 'Samenling', type: 'pflanze', color: 0x59bfa4, hp: 45, atk: 49, def: 49, speed: 45, catch: .48, moves: ['stoss', 'ranke'], evo: { to: 'bluetling', level: 16 },
    look: { plan: 'sprout', colors: [0x59bfa4, 0x2f7d4b, 0xf6f0d0], features: { crest: 'leaf', eyes: 'big' }, size: .7 },
    bio: 'Samenling trägt ein Blatt wie einen Hut und schläft am liebsten in warmer Gartenerde.', behavior: 'shy' },
  bluetling: { name: 'Blütling', type: 'pflanze', color: 0x36bfa0, hp: 80, atk: 82, def: 83, speed: 80, catch: .23, moves: ['ranke', 'hieb'], evo: { to: 'florakron', level: 36 },
    look: { plan: 'sprout', colors: [0x36bfa0, 0x2a6b40, 0xffb3c8], features: { crest: 'crown', tail: 'leaf', eyes: 'sharp', mane: true }, size: 1.25 },
    bio: 'Um den Hals von Blütling öffnet sich ein Kranz aus Blüten, dessen Duft verletzte Taschis beruhigt.', behavior: 'curious' },
  plaetscher: { name: 'Plätscherchen', type: 'wasser', color: 0x5caafa, hp: 44, atk: 48, def: 65, speed: 43, catch: .46, moves: ['stoss', 'spritzer'], evo: { to: 'panzerlon', level: 16 },
    look: { plan: 'quad', colors: [0x5caafa, 0xf7a7b8, 0xe8f6ff], features: { crest: 'fin', tail: 'fin', eyes: 'big', gills: true }, size: .72 },
    bio: 'An Plätscherchens Kopf wehen rosa Kiemenfedern. Es pustet Wasserperlen, um Freunde zu begrüßen.', behavior: 'curious' },
  panzerlon: { name: 'Panzerlon', type: 'wasser', color: 0x367dc9, hp: 79, atk: 83, def: 100, speed: 78, catch: .24, moves: ['spritzer', 'hieb'], evo: { to: 'gezeitenlon', level: 36 },
    look: { plan: 'quad', colors: [0x367dc9, 0xe17a94, 0xcde9ff], features: { crest: 'fin', tail: 'fin', shell: true, gills: true, eyes: 'sharp' }, size: 1.3 },
    bio: 'Panzerlon schützt seinen Rücken mit perlmuttartigen Platten und hält stundenlang Strömungen stand.', behavior: 'aggressive' },
  flatterling: { name: 'Flatterling', type: 'flug', color: 0xc5a07c, hp: 40, atk: 45, def: 40, speed: 56, catch: .7, moves: ['stoss', 'fluegel'], evo: { to: 'segelfalk', level: 17 },
    look: { plan: 'bird', colors: [0xc5a07c, 0x7a5236, 0xf5e6d0], features: { crest: 'feather', tail: 'feather', eyes: 'big' }, size: .6 },
    bio: 'Flatterling sammelt glänzende Steinchen und tauscht sie mit anderen Vögeln gegen Beeren.', behavior: 'shy' },
  felsling: { name: 'Felsling', type: 'gestein', color: 0x9594a4, hp: 40, atk: 80, def: 100, speed: 20, catch: .6, moves: ['stoss', 'stein'], evo: { to: 'felsbrock', level: 22 },
    look: { plan: 'golem', colors: [0x9594a4, 0x5f5e6c, 0xd8d3c4], features: { crystal: true, eyes: 'sleepy' }, size: .8 },
    bio: 'Felsling rollt sich bei Gefahr zu einem Stein zusammen, aus dem nur kleine Kristalle ragen.', behavior: 'sleepy' },
  geisterchen: { name: 'Geisterchen', type: 'geist', color: 0x9675d8, hp: 30, atk: 50, def: 35, speed: 80, catch: .57, moves: ['spuk', 'stoss'], evo: { to: 'gruselgeist', level: 20 },
    look: { plan: 'wisp', colors: [0x9675d8, 0x3b2a63, 0xe9e0ff], features: { eyes: 'big', glow: true }, size: .7 },
    bio: 'Geisterchen kichert in alten Dachböden. Es leuchtet schwach, wenn jemand Angst hat, um ihn zu trösten.', behavior: 'playful' },
  quappi: { name: 'Quappi', type: 'wasser', color: 0x478fd6, hp: 40, atk: 50, def: 40, speed: 90, catch: .66, moves: ['spritzer', 'stoss'], evo: { to: 'quappor', level: 18 },
    look: { plan: 'fish', colors: [0x478fd6, 0xfff1a8, 0xd7ecff], features: { tail: 'fin', crest: 'fin', eyes: 'big' }, size: .6 },
    bio: 'Quappi flitzt in Schwärmen durch klare Teiche und springt bei Sonnenschein aus dem Wasser.', behavior: 'shy' },
  kaeferli: { name: 'Käferli', type: 'pflanze', color: 0x83c64a, hp: 40, atk: 45, def: 55, speed: 40, catch: .7, moves: ['stoss', 'ranke'], evo: { to: 'kaeferon', level: 12 },
    look: { plan: 'insect', colors: [0x83c64a, 0x2c4b23, 0xf2e98a], features: { antennae: true, shell: true, pattern: 'spots', eyes: 'big' }, size: .6 },
    bio: 'Käferli trägt Moos auf seinem Panzer und tarnt sich so zwischen Waldsträuchern.', behavior: 'shy' },
  knister: { name: 'Knister', type: 'elektro', color: 0xffdf42, hp: 35, atk: 60, def: 40, speed: 75, catch: .64, moves: ['funken', 'stoss'], evo: { to: 'knistrion', level: 20 },
    look: { plan: 'insect', colors: [0xffdf42, 0x2d2d48, 0xbff3ff], features: { antennae: true, wings: 'insect', glow: true, eyes: 'big' }, size: .55 },
    bio: 'Nachts sieht man Knister als funkelnde Punkte über Stromleitungen tanzen.', behavior: 'playful' },
  funkli: { name: 'Funkli', type: 'feuer', color: 0xff6d37, hp: 38, atk: 58, def: 38, speed: 70, catch: .64, moves: ['glut', 'stoss'], evo: { to: 'funkolo', level: 18 },
    look: { plan: 'biped', colors: [0xff6d37, 0x6b2a1d, 0xffe08a], features: { crest: 'flame', ears: 'pointy', eyes: 'big', glow: true }, size: .58 },
    bio: 'Funkli wärmt sich an Lagerfeuern und schenkt Reisenden manchmal einen glimmenden Funken.', behavior: 'curious' },
  schlummi: { name: 'Schlummi', type: 'normal', color: 0x947052, hp: 110, atk: 85, def: 70, speed: 25, catch: .3, moves: ['stoss', 'hieb'], evo: { to: 'schlummkoloss', level: 40 },
    look: { plan: 'quad', colors: [0x947052, 0xe6d2b2, 0xf6ead5], features: { ears: 'round', eyes: 'sleepy', longArms: true }, size: 1.3 },
    bio: 'Schlummi hängt tagsüber dösend in Astgabeln. Es wacht nur auf, wenn reife Früchte duften.', behavior: 'sleepy' }
};

// ---------------------------------------------------------------------------
// 192 regional forms (12 lineages × 16). IDs form_<lineage>_<i> as in v1.
// ---------------------------------------------------------------------------
export const LINEAGES = ['Moos', 'Polar', 'Glanz', 'Schatten', 'Korall', 'Sturm', 'Kristall', 'Sonnen', 'Nebel', 'Mond', 'Wald', 'Dünen'];
const ENDINGS = ['ling', 'dorn', 'feder', 'zahn', 'glut', 'wisp', 'pfote', 'horn', 'stern', 'floss', 'wirbel', 'blitz', 'drache', 'golem', 'schweif', 'geist'];
// family types per lineage (families: 0..5 = endings 0-2, 3-5, 6-8, 9-11, 12-14, 15)
const FAMILY_TYPES = [
  ['pflanze', 'normal', 'pflanze', 'wasser', 'erde', 'geist'],
  ['eis', 'eis', 'normal', 'wasser', 'gestein', 'geist'],
  ['elektro', 'feuer', 'normal', 'elektro', 'gestein', 'geist'],
  ['geist', 'feuer', 'normal', 'wasser', 'erde', 'geist'],
  ['wasser', 'feuer', 'normal', 'wasser', 'gestein', 'flug'],
  ['flug', 'elektro', 'flug', 'wasser', 'gestein', 'geist'],
  ['gestein', 'feuer', 'gestein', 'eis', 'erde', 'geist'],
  ['feuer', 'feuer', 'flug', 'wasser', 'erde', 'feuer'],
  ['wasser', 'geist', 'normal', 'wasser', 'gestein', 'geist'],
  ['geist', 'eis', 'normal', 'wasser', 'gestein', 'flug'],
  ['pflanze', 'feuer', 'pflanze', 'pflanze', 'erde', 'flug'],
  ['erde', 'feuer', 'normal', 'wasser', 'erde', 'elektro']
];
const LINEAGE_HUE = [118, 195, 52, 268, 186, 205, 172, 32, 220, 250, 95, 38];
const LINEAGE_HABITAT = [
  'lebt in feuchten Moospolstern entlang ruhiger Bachläufe',
  'überwintert in Schneehöhlen und gleitet über zugefrorene Seen',
  'sammelt sich an glitzernden Felsen, die das Sonnenlicht spiegeln',
  'zeigt sich nur in der Dämmerung zwischen langen Baumschatten',
  'wohnt zwischen bunten Korallenriffen in warmem Küstenwasser',
  'reitet auf den Aufwinden steiler Klippen',
  'nistet in Kristalladern tief im Berg',
  'badet auf heißen Hochebenen im Licht der Mittagssonne',
  'wandert durch Nebelbänke über stillen Mooren',
  'wird bei Vollmond an stillen Buchten beobachtet',
  'versteckt sich im dichten Unterholz alter Wälder',
  'gräbt Gänge unter windigen Sanddünen'
];
const ENDING_TRAIT = {
  ling: 'Junge Exemplare sind neugierig und folgen Reisenden oft ein Stück.',
  dorn: 'Bei Gefahr stellt es harte Dornen auf und wirkt plötzlich doppelt so groß.',
  feder: 'Seine leichten Schwingen tragen es weite Strecken über das Land.',
  zahn: 'Mit seinen kräftigen Zähnen knackt es selbst harte Nüsse.',
  glut: 'Sein Körper glimmt von innen, wenn es kampfbereit ist.',
  wisp: 'Es scheint manchmal halb durchsichtig zu werden und lautlos zu schweben.',
  pfote: 'Seine weichen Pfoten hinterlassen kaum Spuren.',
  horn: 'Mit seinen Hörnern markiert es Bäume in seinem Revier.',
  stern: 'Auf seiner Stirn leuchtet ein sternförmiges Zeichen.',
  floss: 'Seine breiten Flossen machen es zu einem geschickten Schwimmer.',
  wirbel: 'Es bewegt sich in eleganten Spiralen fort.',
  blitz: 'Bei Gewitter lädt es sich auf und leuchtet in grellen Mustern.',
  drache: 'Es gilt als mutig und stellt sich auch größeren Gegnern.',
  golem: 'Eine dicke Panzerschicht schützt es in dieser Lebensphase.',
  schweif: 'Sein langer Schweif dient ihm als Balance und als Waffe.',
  geist: 'Man sagt, es bewache die Erinnerungen seiner Region.'
};
const ENDING_WEIGHTS = {
  ling: [1, 1, 1, 1.1], dorn: [1, 1.1, 1.2, .9], feder: [1, 1.1, .9, 1.3],
  zahn: [.9, 1.3, .9, 1.1], glut: [1, 1.3, .9, 1.1], wisp: [.9, 1.3, .8, 1.3],
  pfote: [1.1, 1, 1, 1], horn: [1.1, 1.2, 1.1, .8], stern: [1.1, 1.1, 1.1, 1.1],
  floss: [1, .9, 1, 1.2], wirbel: [1.1, 1.1, 1, 1.1], blitz: [1, 1.3, .9, 1.3],
  drache: [1, 1.2, 1, 1], golem: [1.2, 1.1, 1.4, .6], schweif: [1.1, 1.3, 1.1, 1.1],
  geist: [.9, 1.2, .9, 1.3]
};
const BEHAVIORS = ['shy', 'curious', 'playful', 'aggressive', 'sleepy'];

function familyPlan(lineage, family, stage, type) {
  if (family === 5) return 'wisp';
  if (family === 3) return stage === 0 ? 'fish' : 'serpent';
  if (family === 4) return stage === 1 ? 'golem' : 'quad';
  if (lineage === 10 && (family === 0 || family === 2)) return 'insect';
  if (family === 0) return type === 'pflanze' ? 'sprout' : type === 'flug' ? 'bird' : 'biped';
  if (family === 2 && type === 'flug') return 'bird';
  if (lineage === 3 && family === 1) return 'biped';
  return 'quad';
}

function endingFeatures(ending, type) {
  const typeCrest = { feuer: 'flame', pflanze: 'leaf', elektro: 'spark', eis: 'crystal', gestein: 'crystal', wasser: 'fin', flug: 'feather', geist: 'halo', erde: 'horn', normal: 'tuft' }[type];
  switch (ending) {
    case 'ling': return { eyes: 'big' };
    case 'dorn': return { spikes: 5, eyes: 'big' };
    case 'feder': return { spikes: 3, wings: 'feather', crest: typeCrest };
    case 'zahn': return { fangs: true, ears: 'pointy', tail: 'bushy', eyes: 'sharp' };
    case 'glut': return { fangs: true, ears: 'pointy', glow: true, crest: typeCrest, tail: 'bushy' };
    case 'wisp': return { ears: 'pointy', glow: true, crest: typeCrest, tail: 'wisp', aura: true, eyes: 'sharp' };
    case 'pfote': return { ears: 'round', tail: 'thin', eyes: 'big', pattern: 'spots' };
    case 'horn': return { ears: 'round', horns: 2, tail: 'thin', pattern: 'spots' };
    case 'stern': return { horns: 2, crest: 'star', tail: 'bushy', mane: true, glow: true };
    case 'floss': return { crest: 'fin', tail: 'fin', eyes: 'big' };
    case 'wirbel': return { crest: 'fin', tail: 'fin', pattern: 'stripes' };
    case 'blitz': return { crest: 'spark', tail: 'fin', glow: true, pattern: 'stripes', eyes: 'sharp' };
    case 'drache': return { horns: 2, tail: 'spike', eyes: 'big' };
    case 'golem': return { horns: 2, crystal: true, shell: true, eyes: 'sleepy' };
    case 'schweif': return { horns: 2, wings: 'bat', tail: 'spike', crest: typeCrest, eyes: 'sharp', glow: true };
    case 'geist': return { eyes: 'sharp', glow: true, aura: true, crest: 'halo' };
  }
  return {};
}

const GENERATED = {};
for (let lineage = 0; lineage < 12; lineage++) {
  for (let i = 0; i < 16; i++) {
    const id = 'form_' + lineage + '_' + i, ending = ENDINGS[i];
    const family = Math.min(5, Math.floor(i / 3)), stage = i === 15 ? 1 : i % 3;
    const type = FAMILY_TYPES[lineage][family];
    let type2;
    if (ending === 'feder' && type !== 'flug') type2 = 'flug';
    if (ending === 'wisp' && type !== 'geist') type2 = 'geist';
    if (ending === 'blitz' && type !== 'elektro') type2 = 'elektro';
    if (ending === 'golem' && type !== 'gestein') type2 = 'gestein';
    const weights = ENDING_WEIGHTS[ending], sum = weights.reduce((a, b) => a + b, 0);
    const total = 280 + stage * 95 + lineage * 2 + (family === 5 ? 60 : 0);
    const [hp, atk, def, speed] = weights.map(w => Math.round(total * w / sum));
    const hue = (LINEAGE_HUE[lineage] + family * 23) % 360;
    const main = hsl(hue, 52 + stage * 6, 58 - stage * 6);
    const accent = hsl(hue + 140 + lineage * 7, 60, 45 - stage * 4);
    const belly = hsl(hue + 20, 45, 86);
    let evo;
    if (i < 14 && stage !== 2) {
      const level = 17 + stage * 15 + lineage;
      if (stage === 1 && lineage === 6) evo = { to: 'form_' + lineage + '_' + (i + 1), item: 'kristallsplitter' };
      else if (stage === 1 && lineage === 1) evo = { to: 'form_' + lineage + '_' + (i + 1), item: 'eiskristall' };
      else if (stage === 1 && lineage === 9) evo = { to: 'form_' + lineage + '_' + (i + 1), level, night: true };
      else evo = { to: 'form_' + lineage + '_' + (i + 1), level };
    }
    GENERATED[id] = {
      name: LINEAGES[lineage] + ending, type, type2, color: main,
      hp, atk, def, speed,
      catch: Math.max(.12, +(0.58 - stage * .2 - (lineage % 4) * .02 - (family === 5 ? .2 : 0)).toFixed(2)),
      moves: ['stoss', type === 'normal' ? 'hieb' : TYPE_MOVESET[type][0]],
      evo, lineage, family: lineage * 6 + family, stage,
      look: { plan: familyPlan(lineage, family, stage, type), colors: [main, accent, belly], features: endingFeatures(ending, type), size: 0.62 + stage * 0.3 + (family === 4 && stage === 1 ? 0.1 : 0) },
      bio: LINEAGES[lineage] + ending + ' ' + LINEAGE_HABITAT[lineage] + '. ' + ENDING_TRAIT[ending],
      behavior: BEHAVIORS[(lineage * 7 + i * 3) % 5]
    };
  }
}

const ANCIENT_LIST = [
  { id: 'auraflamme', name: 'Auraflamme', type: 'feuer', type2: 'flug', color: 0xff9654, hp: 115, atk: 125, def: 94, speed: 106, catch: .045, moves: ['glut', 'hieb', 'sonnenflamme'], region: 14,
    look: { plan: 'bird', colors: [0xff9654, 0xffe17a, 0xfff2d0], features: { wings: 'feather', crest: 'flame', tail: 'flame', glow: true, aura: true, eyes: 'sharp' }, size: 1.8 },
    bio: 'Ein uraltes Taschi des Sonnenfeuers. Wo es landet, blühen im Winter Sonnenblumen.' },
  { id: 'tiefenlied', name: 'Tiefenlied', type: 'wasser', color: 0x478fc7, hp: 120, atk: 105, def: 114, speed: 91, catch: .045, moves: ['spritzer', 'spuk', 'tiefenruf'], region: 1,
    look: { plan: 'serpent', colors: [0x478fc7, 0xa8f0ff, 0xe4f7ff], features: { crest: 'fin', tail: 'fin', glow: true, aura: true, horns: 2, eyes: 'sharp' }, size: 2.0 },
    bio: 'Wächter der tiefsten Korallenströme. Sein Gesang lenkt Meeresströmungen.' },
  { id: 'sturmkron', name: 'Sturmkron', type: 'elektro', type2: 'flug', color: 0xf4d974, hp: 103, atk: 132, def: 86, speed: 124, catch: .04, moves: ['funken', 'fluegel', 'sturmkrone'], region: 11,
    look: { plan: 'quad', colors: [0xf4d974, 0x30346b, 0xfff6cc], features: { wings: 'feather', crest: 'crown', mane: true, tail: 'spike', glow: true, aura: true, eyes: 'sharp' }, size: 1.9 },
    bio: 'Der sagenumwobene Herrscher des Sturmwinds. Seine Krone aus Blitzen erhellt ganze Steppen.' },
  { id: 'mondhueter', name: 'Mondhüter', type: 'geist', color: 0x9a8bd6, hp: 111, atk: 112, def: 110, speed: 105, catch: .04, moves: ['spuk', 'ranke', 'mondschleier'], region: 13,
    look: { plan: 'quad', colors: [0x9a8bd6, 0xdcd6ff, 0xf3f0ff], features: { horns: 4, crest: 'halo', tail: 'wisp', glow: true, aura: true, eyes: 'sharp' }, size: 1.85 },
    bio: 'Ein stiller Beschützer des Mondlichts. Sein Geweih trägt silberne Sicheln.' }
];
const ANCIENTS = {};
for (const a of ANCIENT_LIST) ANCIENTS[a.id] = { ...a, ancient: true, behavior: 'sleepy' };

const SCHNURRIK = {
  schnurrik: { name: 'Schnurrik', type: 'normal', color: 0xd4aa78, hp: 48, atk: 61, def: 50, speed: 75, catch: .24, moves: ['stoss', 'hieb'],
    look: { plan: 'quad', colors: [0x7d5a9e, 0xf0974f, 0xf6e5cf], features: { ears: 'tuft', tail: 'ringed', mask: true, eyes: 'sharp', pattern: 'stripes' }, size: .9 },
    bio: 'Ein gewitztes Katzentaschi mit Luchsohren und geringeltem Schweif. Die Schattengilde setzt es als Späher ein, doch es folgt nur Menschen, die es respektieren.', behavior: 'curious' }
};

// ---------------------------------------------------------------------------
// Expansion: third stages for the original lines and eight new handcrafted
// three-stage families. Appended after the v1 catalogue so dex numbers and
// saves stay valid.
// ---------------------------------------------------------------------------
const X = (id, name, type, type2, [hp, atk, def, speed], c, moves, look, bio, behavior, evo) => ({ [id]: { name, type, ...(type2 ? { type2 } : {}), color: look.colors[0], hp, atk, def, speed, catch: c, moves, look, bio, behavior, ...(evo ? { evo } : {}) } });
const EXTENDED = {
  // third stages of the starters and original lines
  ...X('magmadrach', 'Magmadrach', 'feuer', 'flug', [95, 118, 92, 112], .1, ['glut', 'fluegel'],
    { plan: 'quad', colors: [0xc23a22, 0x2a1414, 0xffb347], features: { horns: 2, mane: true, crest: 'flame', wings: 'bat', tail: 'spike', eyes: 'sharp', glow: true, aura: true, spikes: 5 }, size: 1.6 },
    'Magmadrach schläft in erkalteten Lavaröhren. Erwacht es, steigt sein Atem als glühende Säule in den Himmel.', 'aggressive'),
  ...X('gezeitenlon', 'Gezeitenlon', 'wasser', 'eis', [100, 98, 125, 84], .1, ['spritzer', 'frosthauch'],
    { plan: 'quad', colors: [0x24609e, 0xe9f6ff, 0x9fd8ff], features: { crest: 'fin', tail: 'fin', shell: true, gills: true, eyes: 'sharp', spikes: 5, glow: true }, size: 1.55 },
    'Der Panzer von Gezeitenlon ist mit Raureif überzogen. Es kann die Brandung mit einem Ruf zum Stillstand bringen.', 'aggressive'),
  ...X('florakron', 'Florakron', 'pflanze', 'erde', [100, 102, 106, 88], .1, ['ranke', 'schlammwurf'],
    { plan: 'sprout', colors: [0x2f9a7e, 0x5a3a24, 0xff8fb0], features: { crest: 'crown', tail: 'leaf', eyes: 'sharp', mane: true, horns: 2, aura: true }, size: 1.5 },
    'Wo Florakron Wurzeln schlägt, wächst innerhalb einer Nacht ein ganzer Hain. Alte Wälder gelten als seine Schlafplätze.', 'curious'),
  ...X('donnarion', 'Donnarion', 'elektro', null, [85, 120, 72, 132], .1, ['funken', 'blitzsprung'],
    { plan: 'biped', colors: [0xffc21e, 0x1f244a, 0xfff6d0], features: { ears: 'tuft', crest: 'spark', mane: true, tail: 'spike', eyes: 'sharp', pattern: 'stripes', glow: true, aura: true }, size: 1.45 },
    'Donnarion rennt schneller als sein eigener Donner. Nach einem Gewitter findet man seine Spuren als verglaste Sandstreifen.', 'aggressive'),
  ...X('fellisto', 'Fellisto', 'normal', null, [70, 72, 62, 74], .3, ['stoss', 'hieb'],
    { plan: 'quad', colors: [0xa8724c, 0xf3dfc1, 0xfff4e2], features: { ears: 'long', tail: 'bushy', eyes: 'big', pattern: 'spots', mane: true }, size: 1.05 },
    'Fellisto trommelt mit seinen Hinterpfoten Botschaften, die man über drei Wiesen hinweg hört.', 'curious', { to: 'fellmajor', level: 34 }),
  ...X('fellmajor', 'Fellmajor', 'normal', null, [95, 98, 82, 95], .12, ['hieb', 'ansturm'],
    { plan: 'quad', colors: [0x8e5c3a, 0xf3dfc1, 0xfff4e2], features: { ears: 'long', tail: 'bushy', eyes: 'sharp', pattern: 'spots', mane: true, horns: 2 }, size: 1.35 },
    'Fellmajor führt ganze Herden durch die Wiesen. Bei Gefahr stellt es sich schützend vor die Jüngsten.', 'aggressive'),
  ...X('segelfalk', 'Segelfalk', 'flug', 'normal', [62, 65, 58, 82], .3, ['fluegel', 'stoss'],
    { plan: 'bird', colors: [0xa77f58, 0x5a3a22, 0xf5e6d0], features: { crest: 'feather', tail: 'feather', eyes: 'sharp', wings: 'feather' }, size: .95 },
    'Segelfalk gleitet stundenlang auf warmen Aufwinden und erspäht von dort oben jede raschelnde Wiese.', 'curious', { to: 'sturmfalk', level: 35 }),
  ...X('sturmfalk', 'Sturmfalk', 'flug', 'normal', [83, 90, 75, 118], .12, ['sturzflug', 'hieb'],
    { plan: 'bird', colors: [0x7e5636, 0x2a1a10, 0xffe7b0], features: { crest: 'crown', tail: 'feather', eyes: 'sharp', wings: 'feather', glow: true }, size: 1.3 },
    'Sturmfalk stürzt sich mit solcher Wucht herab, dass die Luft hinter ihm pfeift wie ein Sturm.', 'aggressive'),
  ...X('felsbrock', 'Felsbrock', 'gestein', 'erde', [60, 95, 115, 35], .3, ['stein', 'schlammwurf'],
    { plan: 'golem', colors: [0x86858f, 0x55545e, 0xd8d3c4], features: { crystal: true, eyes: 'sleepy', horns: 2 }, size: 1.1 },
    'Felsbrock rollt Bergpfade hinab und frisst unterwegs Kiesel. Manchmal rumpelt es nachts gegen Hauswände.', 'sleepy', { to: 'bergkoloss', level: 38 }),
  ...X('bergkoloss', 'Bergkoloss', 'gestein', 'erde', [85, 118, 140, 42], .1, ['felssturz', 'erdstoss'],
    { plan: 'golem', colors: [0x6e6d78, 0x3e3d47, 0xe8e0c8], features: { crystal: true, eyes: 'sharp', horns: 4, shell: true, spikes: 5 }, size: 1.6 },
    'Wanderer verwechseln den schlafenden Bergkoloss oft mit einem Hügel – bis der Hügel gähnt.', 'sleepy'),
  ...X('gruselgeist', 'Gruselgeist', 'geist', null, [48, 72, 50, 98], .3, ['spuk', 'schauderblick'],
    { plan: 'wisp', colors: [0x7d5cc8, 0x2c1f4f, 0xe0d4ff], features: { eyes: 'sharp', glow: true, aura: true, crest: 'halo' }, size: .9 },
    'Gruselgeist versteckt sich in Kleiderschränken und lacht, wenn jemand die Tür öffnet. Böse meint es das nie.', 'playful', { to: 'phantomfuerst', level: 38 }),
  ...X('phantomfuerst', 'Phantomfürst', 'geist', null, [70, 112, 72, 120], .1, ['schattenklaue', 'albtraum'],
    { plan: 'wisp', colors: [0x5a3aa8, 0x170f30, 0xc9b8ff], features: { eyes: 'sharp', glow: true, aura: true, crest: 'crown', horns: 2 }, size: 1.3 },
    'Phantomfürst herrscht über verlassene Burgen. In Vollmondnächten tanzen kleine Geister nach seinem Takt.', 'aggressive'),
  ...X('quappor', 'Quappor', 'wasser', null, [62, 70, 60, 105], .3, ['spritzer', 'gischtwelle'],
    { plan: 'fish', colors: [0x2f73c0, 0xfff1a8, 0xd7ecff], features: { tail: 'fin', crest: 'fin', eyes: 'sharp', pattern: 'stripes' }, size: .9 },
    'Quappor springt in hohen Bögen über Wasserfälle hinauf, um die Quellen der Flüsse zu erreichen.', 'playful', { to: 'strudelquapp', level: 34 }),
  ...X('strudelquapp', 'Strudelquapp', 'wasser', 'normal', [88, 95, 82, 122], .12, ['gischtwelle', 'blitzsprung'],
    { plan: 'serpent', colors: [0x1f5aa8, 0xffe07a, 0xcde9ff], features: { tail: 'fin', crest: 'fin', eyes: 'sharp', pattern: 'stripes', glow: true }, size: 1.35 },
    'Strudelquapp dreht sich so schnell im Kreis, dass im ruhigsten See ein Strudel entsteht.', 'aggressive'),
  ...X('kaeferon', 'Käferon', 'pflanze', 'gestein', [55, 60, 80, 42], .35, ['ranke', 'stein'],
    { plan: 'insect', colors: [0x6aa83a, 0x2c4b23, 0xf2e98a], features: { antennae: true, shell: true, pattern: 'spots', eyes: 'sharp', horns: 2 }, size: .8 },
    'Käferon gräbt sich bei Regen in weiche Erde ein. Auf seinem harten Panzer wachsen kleine Farne.', 'shy', { to: 'panzerkaefer', level: 26 }),
  ...X('panzerkaefer', 'Panzerkäfer', 'pflanze', 'gestein', [78, 95, 120, 55], .12, ['blattwirbel', 'felssturz'],
    { plan: 'insect', colors: [0x4a8a2a, 0x1c3214, 0xf2e98a], features: { antennae: true, shell: true, pattern: 'spots', eyes: 'sharp', horns: 4, spikes: 5 }, size: 1.2 },
    'Mit seinem Stirnhorn hebt Panzerkäfer umgestürzte Bäume an, damit kleine Taschis darunter hervorkommen.', 'aggressive'),
  ...X('knistrion', 'Knistrion', 'elektro', 'flug', [55, 80, 55, 92], .3, ['funken', 'fluegel'],
    { plan: 'insect', colors: [0xffcf2a, 0x24243e, 0xbff3ff], features: { antennae: true, wings: 'insect', glow: true, eyes: 'sharp' }, size: .8 },
    'Schwärme von Knistrion leuchten über Sommerwiesen wie ein zweiter Sternenhimmel.', 'playful', { to: 'voltrion', level: 36 }),
  ...X('voltrion', 'Voltrion', 'elektro', 'flug', [75, 108, 70, 118], .1, ['donnerkeil', 'sturzflug'],
    { plan: 'insect', colors: [0xffb800, 0x1a1a30, 0xa8f0ff], features: { antennae: true, wings: 'insect', glow: true, aura: true, eyes: 'sharp', spikes: 3 }, size: 1.2 },
    'Voltrion lädt seine Flügel in Gewitterwolken auf und kann ein ganzes Dorf eine Nacht lang beleuchten.', 'aggressive'),
  ...X('funkolo', 'Funkolo', 'feuer', null, [58, 80, 55, 88], .3, ['glut', 'blitzsprung'],
    { plan: 'biped', colors: [0xff5a24, 0x5a2016, 0xffe08a], features: { crest: 'flame', ears: 'pointy', eyes: 'sharp', glow: true, tail: 'bushy' }, size: .9 },
    'Funkolo jongliert mit kleinen Glutbällen. Wer ihm zusieht, vergisst die Kälte des Abends.', 'playful', { to: 'flammaro', level: 34 }),
  ...X('flammaro', 'Flammaro', 'feuer', 'normal', [80, 112, 72, 108], .12, ['flammenrad', 'hieb'],
    { plan: 'biped', colors: [0xe8401a, 0x3a1410, 0xffd060], features: { crest: 'flame', ears: 'pointy', eyes: 'sharp', glow: true, aura: true, tail: 'bushy', mane: true }, size: 1.3 },
    'Flammaro tanzt um Lagerfeuer, bis die Flammen im Takt seiner Schritte lodern.', 'aggressive'),
  ...X('doesi', 'Dösi', 'normal', null, [80, 55, 45, 15], .55, ['stoss', 'heilgesang'],
    { plan: 'quad', colors: [0xa88466, 0xe6d2b2, 0xf6ead5], features: { ears: 'round', eyes: 'sleepy' }, size: .7 },
    'Dösi schläft fast den ganzen Tag. Wird es geweckt, gähnt es so ansteckend, dass alle in der Nähe müde werden.', 'sleepy', { to: 'schlummi', level: 20 }),
  ...X('schlummkoloss', 'Schlummkoloss', 'normal', 'erde', [150, 112, 92, 30], .1, ['hieb', 'erdstoss'],
    { plan: 'quad', colors: [0x7a5a40, 0xd8c09a, 0xf6ead5], features: { ears: 'round', eyes: 'sleepy', longArms: true, horns: 2 }, size: 1.7 },
    'Wenn Schlummkoloss sich im Schlaf umdreht, bebt der Boden. Es wacht nur für ein Festmahl auf.', 'sleepy'),
  // new families
  ...X('floeckchen', 'Flöckchen', 'eis', null, [45, 50, 45, 60], .5, ['stoss', 'frosthauch'],
    { plan: 'quad', colors: [0xdff4ff, 0x6aa8d8, 0xffffff], features: { ears: 'round', tail: 'bushy', eyes: 'big', crest: 'crystal' }, size: .65 },
    'Flöckchen rollt sich bei Schneefall zu einer Kugel zusammen. Kinder bauen es manchmal versehentlich in Schneemänner ein.', 'playful', { to: 'frostpfote', level: 20 }),
  ...X('frostpfote', 'Frostpfote', 'eis', null, [65, 75, 62, 82], .25, ['frosthauch', 'krallenfinte'],
    { plan: 'quad', colors: [0xbfe6ff, 0x3e78b0, 0xffffff], features: { ears: 'pointy', tail: 'bushy', eyes: 'sharp', crest: 'crystal', fangs: true }, size: 1.05 },
    'Frostpfote hinterlässt Eisblumen, wo es auftritt. Auf gefrorenen Seen läuft es schneller als jedes andere Taschi.', 'curious', { to: 'gletscherloewe', level: 38 }),
  ...X('gletscherloewe', 'Gletscherlöwe', 'eis', 'gestein', [92, 110, 90, 102], .1, ['eissplitter', 'kristallspeer'],
    { plan: 'quad', colors: [0x9fd6ff, 0x24507e, 0xf4fbff], features: { ears: 'pointy', mane: true, tail: 'bushy', eyes: 'sharp', crest: 'crystal', fangs: true, crystal: true, aura: true }, size: 1.5 },
    'Die Mähne des Gletscherlöwen besteht aus ewigem Eis. Sein Brüllen lässt Lawinen in fernen Tälern abgehen.', 'aggressive'),
  ...X('buddelmaus', 'Buddelmaus', 'erde', null, [45, 55, 50, 50], .55, ['stoss', 'schlammwurf'],
    { plan: 'quad', colors: [0xb08a5a, 0x5a3a22, 0xf0dcc0], features: { ears: 'round', tail: 'thin', eyes: 'big', fangs: true }, size: .6 },
    'Buddelmaus gräbt Tunnel unter Feldwegen. Bauern mögen es, weil es den Boden für die Saat lockert.', 'shy', { to: 'grabolin', level: 18 }),
  ...X('grabolin', 'Grabolin', 'erde', null, [65, 80, 72, 62], .28, ['schlammwurf', 'krallenfinte'],
    { plan: 'quad', colors: [0x96703e, 0x402816, 0xf0dcc0], features: { ears: 'round', tail: 'thin', eyes: 'sharp', fangs: true, spikes: 3 }, size: .95 },
    'Grabolin besitzt Krallen wie Schaufeln. In einer Nacht gräbt es einen Gang bis ins nächste Dorf.', 'curious', { to: 'erdbrecher', level: 36 }),
  ...X('erdbrecher', 'Erdbrecher', 'erde', 'gestein', [90, 115, 100, 70], .1, ['erdstoss', 'felssturz'],
    { plan: 'quad', colors: [0x7a5428, 0x2a1a0e, 0xe8c890], features: { ears: 'round', tail: 'spike', eyes: 'sharp', fangs: true, spikes: 5, horns: 2, shell: true }, size: 1.45 },
    'Erdbrecher stampft einmal auf und spaltet Felsen. Bergleute folgen ihm, weil es zielsicher Erzadern findet.', 'aggressive'),
  ...X('wollini', 'Wollini', 'normal', null, [55, 40, 55, 40], .6, ['stoss', 'bruellen'],
    { plan: 'quad', colors: [0xf6f2ea, 0x8a7a6a, 0xffffff], features: { ears: 'round', tail: 'bushy', eyes: 'big', mane: true }, size: .65 },
    'Das flauschige Fell von Wollini lädt sich beim Grasen auf. Wer es streichelt, bekommt einen kleinen Schlag.', 'curious', { to: 'wollmond', level: 16 }),
  ...X('wollmond', 'Wollmond', 'normal', 'flug', [72, 58, 72, 58], .3, ['hieb', 'fluegel'],
    { plan: 'quad', colors: [0xe9e4f4, 0x6a5a8a, 0xffffff], features: { ears: 'round', tail: 'bushy', eyes: 'big', mane: true, horns: 2 }, size: 1 },
    'Wollmond wird so leicht, dass es an windigen Tagen über die Wiesen schwebt. Es landet stets bei Mondaufgang.', 'sleepy', { to: 'wolkenwidder', level: 32 }),
  ...X('wolkenwidder', 'Wolkenwidder', 'normal', 'flug', [95, 85, 95, 80], .12, ['ansturm', 'orkan'],
    { plan: 'quad', colors: [0xdcd8f0, 0x4a3a6a, 0xffffff], features: { ears: 'round', tail: 'bushy', eyes: 'sharp', mane: true, horns: 4, wings: 'feather', aura: true }, size: 1.45 },
    'Wolkenwidder zieht Regenwolken mit seinen Hörnern zusammen und bringt dürren Feldern Wasser.', 'curious'),
  ...X('glimmstein', 'Glimmstein', 'gestein', 'feuer', [45, 55, 70, 30], .45, ['stein', 'glut'],
    { plan: 'golem', colors: [0x6a5a54, 0xff7a2a, 0xffd0a0], features: { crystal: true, eyes: 'big', glow: true }, size: .6 },
    'Glimmstein glüht im Inneren wie ein Kohlestück. Reisende nehmen es in kalten Nächten gern mit ins Zelt.', 'sleepy', { to: 'lavabrocken', level: 24 }),
  ...X('lavabrocken', 'Lavabrocken', 'gestein', 'feuer', [65, 82, 95, 38], .25, ['felssturz', 'flammenrad'],
    { plan: 'golem', colors: [0x4e403a, 0xff5a1a, 0xffc070], features: { crystal: true, eyes: 'sharp', glow: true, horns: 2 }, size: 1.05 },
    'Aus den Ritzen von Lavabrocken tropft flüssiges Gestein. Es kühlt zu glänzendem Obsidian ab.', 'aggressive', { to: 'vulkanit', level: 40 }),
  ...X('vulkanit', 'Vulkanit', 'gestein', 'feuer', [90, 115, 125, 45], .1, ['kristallspeer', 'feuersturm'],
    { plan: 'golem', colors: [0x3a2e2a, 0xff4a10, 0xffb050], features: { crystal: true, eyes: 'sharp', glow: true, aura: true, horns: 4, spikes: 5 }, size: 1.55 },
    'Vulkanit ruht im Krater erloschener Vulkane. Wenn es erwacht, erzählen die Alten, beginnt der Berg wieder zu atmen.', 'sleepy'),
  ...X('troepfli', 'Tröpfli', 'wasser', null, [50, 45, 45, 55], .55, ['stoss', 'spritzer'],
    { plan: 'fish', colors: [0x6ac8ff, 0xffffff, 0xd7f2ff], features: { tail: 'fin', eyes: 'big', gills: true }, size: .55 },
    'Tröpfli sieht aus wie ein Wassertropfen mit Augen. Nach Regenschauern hüpft es fröhlich durch Pfützen.', 'playful', { to: 'wellenspringer', level: 20 }),
  ...X('wellenspringer', 'Wellenspringer', 'wasser', null, [70, 68, 62, 85], .28, ['gischtwelle', 'blitzsprung'],
    { plan: 'serpent', colors: [0x3aa0e8, 0xfff8e0, 0xcdeeff], features: { tail: 'fin', crest: 'fin', eyes: 'big', gills: true }, size: 1.05 },
    'Wellenspringer reitet auf den Kämmen der Brandung und begleitet Fischerboote bis aufs offene Meer.', 'curious', { to: 'ozeanwal', level: 40 }),
  ...X('ozeanwal', 'Ozeanwal', 'wasser', 'eis', [140, 95, 100, 60], .08, ['flutstrahl', 'blizzard'],
    { plan: 'fish', colors: [0x1e5aa0, 0xeef8ff, 0xa8dcff], features: { tail: 'fin', crest: 'fin', eyes: 'sleepy', gills: true, glow: true }, size: 1.9 },
    'Der Gesang von Ozeanwal reicht über das ganze Meer. Seeleute sagen, er warne sie vor Stürmen.', 'sleepy'),
  ...X('laternchen', 'Laternchen', 'geist', 'feuer', [40, 55, 40, 60], .45, ['spuk', 'glut'],
    { plan: 'wisp', colors: [0xffb85a, 0x5a2a6a, 0xfff0c0], features: { eyes: 'big', glow: true, crest: 'flame' }, size: .55 },
    'Laternchen leuchtet verirrten Wanderern den Heimweg – meistens jedenfalls. Manchmal führt es sie lieber zum Spielen ins Moor.', 'playful', { to: 'irrlicht', level: 22 }),
  ...X('irrlicht', 'Irrlicht', 'geist', 'feuer', [58, 78, 55, 88], .25, ['schattenklaue', 'flammenrad'],
    { plan: 'wisp', colors: [0xff8f3a, 0x3a1a4a, 0xffe0a0], features: { eyes: 'sharp', glow: true, aura: true, crest: 'flame' }, size: .9 },
    'Irrlicht tanzt über nebligen Mooren. Wer seinen Flammen folgt, findet entweder einen Schatz oder nasse Füße.', 'curious', { to: 'sternlaterne', level: 38 }),
  ...X('sternlaterne', 'Sternlaterne', 'geist', 'feuer', [78, 108, 75, 110], .1, ['albtraum', 'feuersturm'],
    { plan: 'wisp', colors: [0xffd06a, 0x2a1240, 0xfff4d0], features: { eyes: 'sharp', glow: true, aura: true, crest: 'star', horns: 2 }, size: 1.3 },
    'Sternlaterne trägt ein Licht in sich, das angeblich von einem der sechzehn Himmelslichter stammt.', 'sleepy'),
  ...X('summsel', 'Summsel', 'elektro', null, [40, 50, 40, 70], .55, ['stoss', 'funken'],
    { plan: 'insect', colors: [0xffe04a, 0x2a2a2a, 0xffffff], features: { antennae: true, wings: 'insect', eyes: 'big', pattern: 'stripes' }, size: .5 },
    'Summsel sammelt statt Nektar elektrische Ladung von Blüten nach einem Gewitter.', 'playful', { to: 'brummblitz', level: 16 }),
  ...X('brummblitz', 'Brummblitz', 'elektro', 'flug', [55, 70, 52, 90], .28, ['funken', 'fluegel'],
    { plan: 'insect', colors: [0xffcc1a, 0x1e1e1e, 0xe0f8ff], features: { antennae: true, wings: 'insect', eyes: 'sharp', pattern: 'stripes', glow: true }, size: .85 },
    'Das Brummen von Brummblitz knistert im Radio. Bienenzüchter halten es als Wächter ihrer Stöcke.', 'aggressive', { to: 'gewitterhummel', level: 32 }),
  ...X('gewitterhummel', 'Gewitterhummel', 'elektro', 'flug', [80, 102, 75, 112], .1, ['gewitterzorn', 'sturzflug'],
    { plan: 'insect', colors: [0xffb400, 0x141414, 0xc8f4ff], features: { antennae: true, wings: 'insect', eyes: 'sharp', pattern: 'stripes', glow: true, aura: true, spikes: 3 }, size: 1.25 },
    'Gewitterhummel fliegt einer Sturmfront voraus. Wo ihr Summen zu hören ist, schlagen bald Blitze ein.', 'aggressive'),
  ...X('pilzling', 'Pilzling', 'pflanze', null, [55, 45, 55, 30], .55, ['stoss', 'sporenwolke'],
    { plan: 'sprout', colors: [0xe8604a, 0xfff2e0, 0xf6f0d0], features: { crest: 'leaf', eyes: 'big', pattern: 'spots' }, size: .6 },
    'Pilzling trägt einen roten, weiß gepunkteten Hut. Es versteckt sich zwischen echten Pilzen und kichert, wenn man es pflücken will.', 'shy', { to: 'hutpilz', level: 18 }),
  ...X('hutpilz', 'Hutpilz', 'pflanze', 'geist', [70, 65, 75, 40], .28, ['saugwurzel', 'spuk'],
    { plan: 'sprout', colors: [0xc8483a, 0xfff2e0, 0xd8c8f0], features: { crest: 'crown', eyes: 'sleepy', pattern: 'spots', glow: true }, size: .95 },
    'Der Hut von Hutpilz leuchtet nachts schwach. Seine Sporen schenken süße Träume – oder sehr seltsame.', 'sleepy', { to: 'sporenfuerst', level: 34 }),
  ...X('sporenfuerst', 'Sporenfürst', 'pflanze', 'geist', [95, 90, 100, 55], .1, ['bluetensturm', 'albtraum'],
    { plan: 'sprout', colors: [0xa8302a, 0xfff2e0, 0xb8a0f0], features: { crest: 'crown', eyes: 'sharp', pattern: 'spots', glow: true, aura: true, mane: true }, size: 1.45 },
    'Sporenfürst verbindet die Wurzeln eines ganzen Waldes. Es hört, was jeder Baum flüstert.', 'curious')
};

// Final ordered catalogue (dex order identical to v1, expansion appended)
export const SPECIES = { ...CORE, ...GENERATED, ...ANCIENTS, ...SCHNURRIK, ...EXTENDED };
export const SPECIES_IDS = Object.keys(SPECIES);
SPECIES_IDS.forEach((id, i) => {
  const s = SPECIES[id];
  s.id = id;
  s.dexNo = i + 1;
  if (!s.behavior) s.behavior = 'curious';
});

// Coverage type learned by single-type species so nobody is walled completely.
const COVERAGE = { normal: 'erde', feuer: 'erde', wasser: 'eis', pflanze: 'erde', elektro: 'eis', gestein: 'erde', flug: 'gestein', geist: 'eis', eis: 'gestein', erde: 'gestein' };

// Learnsets: [level, moveId]. Starting moves at level 1, then the type's full
// progression (TYPE_LEARN), the second type or a coverage type, and a few
// behaviour-based extras. Cached because battles and menus ask often.
const LEARN_CACHE = new Map();
const tierMove = (type, lo, hi) => (TYPE_LEARN[type].find(([, m]) => MOVES[m].power >= lo && MOVES[m].power <= hi) || [])[1];
export function learnset(id) {
  const s = SPECIES[id];
  if (!s) return [];
  if (LEARN_CACHE.has(id)) return LEARN_CACHE.get(id);
  const out = [];
  const add = (lv, m) => { if (m && MOVES[m] && !out.some(x => x[1] === m)) out.push([lv, m]); };
  for (const m of s.moves) add(1, m);
  for (const [lv, m] of TYPE_LEARN[s.type]) add(lv, m);
  if (s.type !== 'normal') add(13, 'hieb');
  if (s.type2) {
    add(15, tierMove(s.type2, 50, 65));
    add(27, tierMove(s.type2, 66, 85));
    add(39, tierMove(s.type2, 86, 100));
  } else {
    add(21, tierMove(COVERAGE[s.type], 50, 65));
    add(33, tierMove(COVERAGE[s.type], 66, 85));
  }
  if (id === 'schnurrik') add(12, 'krallenfinte');
  if (s.behavior === 'sleepy') add(24, 'heilgesang');
  if (s.behavior === 'aggressive') add(20, 'konzentration');
  if (s.behavior === 'playful') add(9, 'blitzsprung');
  if (s.ancient) add(1, s.moves[2]);
  out.sort((a, b) => a[0] - b[0]);
  LEARN_CACHE.set(id, out);
  return out;
}

// Moves known at a given level: the three newest attacks plus the newest
// support move (or a fourth attack), so wild and trainer Taschis fight sensibly.
export function movesAtLevel(id, level) {
  const known = learnset(id).filter(([lv]) => lv <= level).map(([, m]) => m);
  const dmg = known.filter(m => MOVES[m].power > 0), sup = known.filter(m => !MOVES[m].power);
  const pick = dmg.slice(-3);
  if (sup.length) pick.unshift(sup[sup.length - 1]);
  else if (dmg.length > 3) pick.unshift(dmg[dmg.length - 4]);
  const chosen = known.filter(m => pick.includes(m)).slice(-4);
  // attacks first, support last – matches the battle menu layout
  return [...chosen.filter(m => MOVES[m].power > 0), ...chosen.filter(m => !MOVES[m].power)];
}

export const STARTERS = ['glutzahn', 'plaetscher', 'samenling'];
export const ANCIENT_IDS = ANCIENT_LIST.map(a => a.id);

export function speciesByType(type, { includeAncient = false } = {}) {
  return SPECIES_IDS.filter(id => (includeAncient || !SPECIES[id].ancient) && id !== 'schnurrik' && (SPECIES[id].type === type || SPECIES[id].type2 === type));
}
