// TASCHI species catalogue – 214 species.
// IDs and names are identical to version 1 so existing saves remain valid.
// Visual "look" descriptions drive the procedural creature builder; every
// family shares a design language and gains features with each stage.
import { TYPE_MOVESET } from './moves.js';

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
  blitzor: { name: 'Blitzor', type: 'elektro', color: 0xf9a82e, hp: 65, atk: 90, def: 55, speed: 110, catch: .23, moves: ['funken', 'stoss'],
    look: { plan: 'biped', colors: [0xf9a82e, 0x2c3560, 0xffe9b0], features: { ears: 'tuft', crest: 'spark', mane: true, tail: 'thin', eyes: 'sharp', pattern: 'stripes', glow: true }, size: 1.2 },
    bio: 'Wenn Blitzor seine Mähne aufstellt, knistert die Luft im Umkreis eines ganzen Feldes.', behavior: 'aggressive' },
  fellino: { name: 'Fellino', type: 'normal', color: 0xb9825a, hp: 55, atk: 55, def: 50, speed: 55, catch: .5, moves: ['stoss', 'hieb'],
    look: { plan: 'quad', colors: [0xb9825a, 0xf3dfc1, 0xfff4e2], features: { ears: 'long', tail: 'bushy', eyes: 'big', pattern: 'spots' }, size: .85 },
    bio: 'Ein flauschiges Wiesentaschi mit langen Ohren. Es begleitet Wanderer gern ein Stück des Weges.', behavior: 'curious' },
  glutzahn: { name: 'Glutzahn', type: 'feuer', color: 0xf47d3b, hp: 44, atk: 52, def: 43, speed: 65, catch: .44, moves: ['stoss', 'glut'], evo: { to: 'glutdrach', level: 16 },
    look: { plan: 'quad', colors: [0xf47d3b, 0x5a2b24, 0xffd9a0], features: { ears: 'pointy', mane: true, crest: 'flame', tail: 'bushy', eyes: 'big' }, size: .8 },
    bio: 'Glutzahn trägt eine Mähne aus warmer Glut. Wenn es sich freut, flackert sie golden auf.', behavior: 'playful' },
  glutdrach: { name: 'Glutdrach', type: 'feuer', color: 0xda532d, hp: 78, atk: 84, def: 78, speed: 100, catch: .23, moves: ['glut', 'hieb'],
    look: { plan: 'quad', colors: [0xda532d, 0x3a1d1d, 0xffc06b], features: { horns: 2, mane: true, crest: 'flame', wings: 'bat', tail: 'spike', eyes: 'sharp', glow: true }, size: 1.35 },
    bio: 'Glutdrach gleitet mit ausgebreiteten Schwingen über Lavafelder und schmiedet mit seinem Atem Steine weich.', behavior: 'aggressive' },
  samenling: { name: 'Samenling', type: 'pflanze', color: 0x59bfa4, hp: 45, atk: 49, def: 49, speed: 45, catch: .48, moves: ['stoss', 'ranke'], evo: { to: 'bluetling', level: 16 },
    look: { plan: 'sprout', colors: [0x59bfa4, 0x2f7d4b, 0xf6f0d0], features: { crest: 'leaf', eyes: 'big' }, size: .7 },
    bio: 'Samenling trägt ein Blatt wie einen Hut und schläft am liebsten in warmer Gartenerde.', behavior: 'shy' },
  bluetling: { name: 'Blütling', type: 'pflanze', color: 0x36bfa0, hp: 80, atk: 82, def: 83, speed: 80, catch: .23, moves: ['ranke', 'hieb'],
    look: { plan: 'sprout', colors: [0x36bfa0, 0x2a6b40, 0xffb3c8], features: { crest: 'crown', tail: 'leaf', eyes: 'sharp', mane: true }, size: 1.25 },
    bio: 'Um den Hals von Blütling öffnet sich ein Kranz aus Blüten, dessen Duft verletzte Taschis beruhigt.', behavior: 'curious' },
  plaetscher: { name: 'Plätscherchen', type: 'wasser', color: 0x5caafa, hp: 44, atk: 48, def: 65, speed: 43, catch: .46, moves: ['stoss', 'spritzer'], evo: { to: 'panzerlon', level: 16 },
    look: { plan: 'quad', colors: [0x5caafa, 0xf7a7b8, 0xe8f6ff], features: { crest: 'fin', tail: 'fin', eyes: 'big', gills: true }, size: .72 },
    bio: 'An Plätscherchens Kopf wehen rosa Kiemenfedern. Es pustet Wasserperlen, um Freunde zu begrüßen.', behavior: 'curious' },
  panzerlon: { name: 'Panzerlon', type: 'wasser', color: 0x367dc9, hp: 79, atk: 83, def: 100, speed: 78, catch: .24, moves: ['spritzer', 'hieb'],
    look: { plan: 'quad', colors: [0x367dc9, 0xe17a94, 0xcde9ff], features: { crest: 'fin', tail: 'fin', shell: true, gills: true, eyes: 'sharp' }, size: 1.3 },
    bio: 'Panzerlon schützt seinen Rücken mit perlmuttartigen Platten und hält stundenlang Strömungen stand.', behavior: 'aggressive' },
  flatterling: { name: 'Flatterling', type: 'flug', color: 0xc5a07c, hp: 40, atk: 45, def: 40, speed: 56, catch: .7, moves: ['stoss', 'fluegel'],
    look: { plan: 'bird', colors: [0xc5a07c, 0x7a5236, 0xf5e6d0], features: { crest: 'feather', tail: 'feather', eyes: 'big' }, size: .6 },
    bio: 'Flatterling sammelt glänzende Steinchen und tauscht sie mit anderen Vögeln gegen Beeren.', behavior: 'shy' },
  felsling: { name: 'Felsling', type: 'gestein', color: 0x9594a4, hp: 40, atk: 80, def: 100, speed: 20, catch: .6, moves: ['stoss', 'stein'],
    look: { plan: 'golem', colors: [0x9594a4, 0x5f5e6c, 0xd8d3c4], features: { crystal: true, eyes: 'sleepy' }, size: .8 },
    bio: 'Felsling rollt sich bei Gefahr zu einem Stein zusammen, aus dem nur kleine Kristalle ragen.', behavior: 'sleepy' },
  geisterchen: { name: 'Geisterchen', type: 'geist', color: 0x9675d8, hp: 30, atk: 50, def: 35, speed: 80, catch: .57, moves: ['spuk', 'stoss'],
    look: { plan: 'wisp', colors: [0x9675d8, 0x3b2a63, 0xe9e0ff], features: { eyes: 'big', glow: true }, size: .7 },
    bio: 'Geisterchen kichert in alten Dachböden. Es leuchtet schwach, wenn jemand Angst hat, um ihn zu trösten.', behavior: 'playful' },
  quappi: { name: 'Quappi', type: 'wasser', color: 0x478fd6, hp: 40, atk: 50, def: 40, speed: 90, catch: .66, moves: ['spritzer', 'stoss'],
    look: { plan: 'fish', colors: [0x478fd6, 0xfff1a8, 0xd7ecff], features: { tail: 'fin', crest: 'fin', eyes: 'big' }, size: .6 },
    bio: 'Quappi flitzt in Schwärmen durch klare Teiche und springt bei Sonnenschein aus dem Wasser.', behavior: 'shy' },
  kaeferli: { name: 'Käferli', type: 'pflanze', color: 0x83c64a, hp: 40, atk: 45, def: 55, speed: 40, catch: .7, moves: ['stoss', 'ranke'],
    look: { plan: 'insect', colors: [0x83c64a, 0x2c4b23, 0xf2e98a], features: { antennae: true, shell: true, pattern: 'spots', eyes: 'big' }, size: .6 },
    bio: 'Käferli trägt Moos auf seinem Panzer und tarnt sich so zwischen Waldsträuchern.', behavior: 'shy' },
  knister: { name: 'Knister', type: 'elektro', color: 0xffdf42, hp: 35, atk: 60, def: 40, speed: 75, catch: .64, moves: ['funken', 'stoss'],
    look: { plan: 'insect', colors: [0xffdf42, 0x2d2d48, 0xbff3ff], features: { antennae: true, wings: 'insect', glow: true, eyes: 'big' }, size: .55 },
    bio: 'Nachts sieht man Knister als funkelnde Punkte über Stromleitungen tanzen.', behavior: 'playful' },
  funkli: { name: 'Funkli', type: 'feuer', color: 0xff6d37, hp: 38, atk: 58, def: 38, speed: 70, catch: .64, moves: ['glut', 'stoss'],
    look: { plan: 'biped', colors: [0xff6d37, 0x6b2a1d, 0xffe08a], features: { crest: 'flame', ears: 'pointy', eyes: 'big', glow: true }, size: .58 },
    bio: 'Funkli wärmt sich an Lagerfeuern und schenkt Reisenden manchmal einen glimmenden Funken.', behavior: 'curious' },
  schlummi: { name: 'Schlummi', type: 'normal', color: 0x947052, hp: 110, atk: 85, def: 70, speed: 25, catch: .3, moves: ['stoss', 'hieb'],
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

// Final ordered catalogue (dex order identical to v1)
export const SPECIES = { ...CORE, ...GENERATED, ...ANCIENTS, ...SCHNURRIK };
export const SPECIES_IDS = Object.keys(SPECIES);
SPECIES_IDS.forEach((id, i) => {
  const s = SPECIES[id];
  s.id = id;
  s.dexNo = i + 1;
  if (!s.behavior) s.behavior = 'curious';
});

// Coverage type learned by single-type species so nobody is walled completely.
const COVERAGE = { normal: 'erde', feuer: 'erde', wasser: 'eis', pflanze: 'erde', elektro: 'eis', gestein: 'erde', flug: 'gestein', geist: 'eis', eis: 'gestein', erde: 'gestein' };

// Learnsets: [level, moveId]. Starting moves at level 1, then type progression.
export function learnset(id) {
  const s = SPECIES[id];
  if (!s) return [];
  const out = [];
  for (const m of s.moves) if (!out.some(x => x[1] === m)) out.push([1, m]);
  const set = TYPE_MOVESET[s.type];
  const add = (lv, m) => { if (m && !out.some(x => x[1] === m)) out.push([lv, m]); };
  add(7, set[3]);
  add(14, set[1]);
  if (s.type !== 'normal') add(18, 'hieb');
  if (s.type2) add(22, TYPE_MOVESET[s.type2][0]);
  add(28, set[2]);
  if (s.type2) add(34, TYPE_MOVESET[s.type2][1]);
  else add(25, TYPE_MOVESET[COVERAGE[s.type]][s.dexNo % 2 ? 0 : 1]);
  add(40, set[2]);
  if (id === 'schnurrik') add(12, 'krallenfinte');
  if (s.behavior === 'sleepy') add(24, 'heilgesang');
  if (s.behavior === 'aggressive') add(20, 'konzentration');
  if (s.behavior === 'playful') add(10, 'blitzsprung');
  if (s.ancient) add(1, s.moves[2]);
  return out.sort((a, b) => a[0] - b[0]);
}

// Moves known at a given level (latest four).
export function movesAtLevel(id, level) {
  const known = learnset(id).filter(([lv]) => lv <= level).map(([, m]) => m);
  return known.slice(-4);
}

export const STARTERS = ['glutzahn', 'plaetscher', 'samenling'];
export const ANCIENT_IDS = ANCIENT_LIST.map(a => a.id);

export function speciesByType(type, { includeAncient = false } = {}) {
  return SPECIES_IDS.filter(id => (includeAncient || !SPECIES[id].ancient) && id !== 'schnurrik' && (SPECIES[id].type === type || SPECIES[id].type2 === type));
}
