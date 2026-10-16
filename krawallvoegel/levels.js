/* Krawallvögel 3D – Vögel, Schweine, Material, Welten und Level-Generator. Ohne DOM, in Node testbar. */
(function (root) {
'use strict';

// Vogeltypen nach dem Vorbild des Originals (eigene Namen und Gestaltung).
// mult = Schadensfaktor gegen Glas/Holz/Stein, ability = Fähigkeit beim Tippen im Flug.
const BIRDS = {
  red:    { name:'Rudi', r:0.45, density:4, color:0xd92a2a, belly:0xf4d6b0, ability:'none', mult:{ glass:1, wood:1, stone:0.6 },
            info:'Der Anführer. Kein Trick, aber viel Wut im Bauch – solide gegen alles außer Stein.' },
  blue:   { name:'Blitz-Trio', r:0.3, density:4, color:0x4aa8f0, belly:0xd8eefc, ability:'split', mult:{ glass:3.2, wood:0.5, stone:0.3 },
            info:'Tippen teilt den Vogel in drei. Zerschmettert Glas mühelos.' },
  yellow: { name:'Zisch', r:0.45, density:4, color:0xf5d020, belly:0xfff3b0, ability:'boost', mult:{ glass:1, wood:3, stone:0.4 },
            info:'Tippen gibt Turbo in Flugrichtung. Durchschlägt Holz.' },
  black:  { name:'Bumm', r:0.58, density:5.5, color:0x24262c, belly:0x5a5e68, ability:'bomb', mult:{ glass:1, wood:1, stone:1.3 },
            info:'Tippen (oder kurz nach dem Aufprall) lässt ihn explodieren. Sprengt Stein.' },
  white:  { name:'Mathilde', r:0.52, density:3.6, color:0xf3f1ea, belly:0xffffff, ability:'egg', mult:{ glass:1, wood:1, stone:0.7 },
            info:'Tippen wirft ein explosives Ei senkrecht nach unten, sie selbst schießt davon.' },
  green:  { name:'Kurvi', r:0.5, density:4, color:0x5dbb3c, belly:0xc9f0a8, ability:'boomerang', mult:{ glass:1.2, wood:1.2, stone:0.8 },
            info:'Tippen lässt ihn wie einen Bumerang zurückfliegen – trifft Schweine von hinten.' },
  big:    { name:'Brocken', r:0.85, density:5, color:0xa8141c, belly:0xe8b896, ability:'none', mult:{ glass:1.6, wood:1.6, stone:1.4 },
            info:'Riesig und schwer. Walzt ganze Burgen nieder.' },
  orange: { name:'Pustebacke', r:0.45, density:3.2, color:0xff8a1c, belly:0xffd2a0, ability:'inflate', mult:{ glass:1, wood:1, stone:0.8 },
            info:'Tippen bläst ihn riesig auf und drückt alles in der Nähe weg.' }
};
const BIRD_ORDER = ['red', 'blue', 'yellow', 'black', 'white', 'green', 'big', 'orange'];

const PIGS = {
  small:  { name:'Ferkel', r:0.38, hp:2.2, score:5000, info:'Klein, frech, zerbrechlich.' },
  medium: { name:'Grunzer', r:0.52, hp:3.6, score:5000, info:'Das Standardschwein.' },
  large:  { name:'Dicker Grunzer', r:0.76, hp:7, score:5000, info:'Viel Speck, hält mehr aus.' },
  helmet: { name:'Helmschwein', r:0.52, hp:9, score:5000, info:'Der Helm schützt – erst ab hartem Treffer kaputt.' },
  beard:  { name:'Bart-Vorarbeiter', r:0.66, hp:8.5, score:5000, info:'Der Schnauzbart-Boss der Baustelle.' },
  king:   { name:'König Grunz', r:1.05, hp:16, score:10000, info:'Der Herrscher aller Schweine. Mit Krone und viel Ausdauer.' }
};

// hp gilt je Quadratmeter (mindestens minHp), score = Punkte fürs Zerstören.
const MATERIALS = {
  glass: { name:'Glas', density:0.9, friction:0.3, restitution:0.08, hp:3.4, minHp:1.4, score:500 },
  wood:  { name:'Holz', density:0.75, friction:0.65, restitution:0.08, hp:6.5, minHp:2.4, score:500 },
  stone: { name:'Stein', density:2.4, friction:0.85, restitution:0.04, hp:15, minHp:6, score:750 },
  tnt:   { name:'TNT', density:0.8, friction:0.6, restitution:0.05, hp:2.2, minHp:2.2, score:1000 },
  logo:  { name:'Sender-Kiste', density:0.75, friction:0.6, restitution:0.05, hp:3, minHp:3, score:3000 },
  gold:  { name:'Goldene Sender-Kiste', density:0.5, friction:0.6, restitution:0.05, hp:0.3, minHp:0.3, score:10000 }
};

// Senderlogos aus ../anmacha-memory/logos/NN.png (gleiche Reihenfolge wie dort).
const STATIONS = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24',
  'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio', 'AnMaChaCast', 'SenderWelt', 'RicoReWi Radioportal'];
// Logos, die über Sterne in der Senderwand freigeschaltet werden (Logo-Nummer → nötige Sterne).
const STAR_LOGOS = [{ logo:8, stars:40 }, { logo:13, stars:100 }, { logo:14, stars:170 }, { logo:15, stars:250 }, { logo:1, stars:340 }, { logo:16, stars:450 }];

// Jede Welt wird von einem Sender präsentiert (Logo im Level, goldene Kiste, Werbetafeln).
const WORLDS = [
  { name:'Sonnenstrand', logo:2, theme:'beach', sky:[0x6fc8ff, 0xffe3a6], ground:0xe9cf8a, grass:0x6cc04a, hill:0xd9b86a, far:0x7fbf9a, music:{ root:60, tempo:112, scale:'major' },
    intro:{ 0:'red', 5:'blue', 10:'yellow' }, text:'YourTime-FM lädt an den Strand – doch die Schweine haben die Strandbar besetzt!' },
  { name:'Beton-Block', logo:3, theme:'city', sky:[0x1d1f4a, 0x8a4fa8], ground:0x5a5a66, grass:0x3e8f4e, hill:0x6d6d7c, far:0x2c2f5a, music:{ root:57, tempo:94, scale:'minor' },
    intro:{ 0:'black' }, text:'RapRadio 24 bei Nacht: Die Schweine bauen Betonburgen zwischen den Hochhäusern.' },
  { name:'Festzelt-Alm', logo:4, theme:'alps', sky:[0x8fd3ff, 0xe8f7ff], ground:0x7a5a3a, grass:0x79c94a, hill:0x5fae47, far:0xb8d8f0, music:{ root:65, tempo:126, scale:'major' },
    intro:{ 0:'white' }, text:'SchlagerPop 24 feiert auf der Alm – und die Schweine haben das Festzelt geklaut.' },
  { name:'Wolken-Hitparade', logo:5, theme:'clouds', sky:[0x4f8fe8, 0xc9e6ff], ground:0x8ac6e8, grass:0xffffff, hill:0xeef6ff, far:0xdbeeff, music:{ root:62, tempo:118, scale:'major' },
    intro:{ 0:'green' }, text:'ChartRadio 24 hoch über den Wolken: Die Schweine stehen auf Platz 1 – noch!' },
  { name:'Neon-Keller', logo:6, theme:'club', sky:[0x0b0620, 0x35115a], ground:0x241a3a, grass:0x4a2a7a, hill:0x2e2050, far:0x180c33, music:{ root:55, tempo:128, scale:'minor' },
    intro:{ 0:'big' }, text:'ClubRadio 24 im Neon-Keller: Bass an, Schweine raus!' },
  { name:'Vulkan-Bühne', logo:9, theme:'volcano', sky:[0x3a0d0d, 0xff7b3a], ground:0x3b2a26, grass:0x6a3424, hill:0x51352d, far:0x5a1e14, music:{ root:52, tempo:140, scale:'minor' },
    intro:{ 0:'orange' }, text:'RockRadio 24 rockt am Vulkan – die Schweine haben die Bühne aus Stein gebaut.' },
  { name:'Retro-Wüste', logo:11, theme:'desert', sky:[0xffb36b, 0xfff0c2], ground:0xe0a85a, grass:0xc98a3a, hill:0xd19347, far:0xe8b57a, music:{ root:59, tempo:104, scale:'dorian' },
    intro:{}, text:'KultRadio 24 spielt die alten Hits – in der Wüste lauern Kult-Schweine.' },
  { name:'Pixel-Arena', logo:12, theme:'arcade', sky:[0x0a1a3a, 0x1f6fa8], ground:0x1a2a4a, grass:0x22508a, hill:0x223a66, far:0x12244a, music:{ root:64, tempo:132, scale:'minor' },
    intro:{}, text:'Zocker-FM schaltet auf Highscore: Die Schweine zocken um die Arena.' },
  { name:'Winterfunk', logo:10, theme:'winter', sky:[0x8ab4e8, 0xf2f7ff], ground:0xe9f2fb, grass:0xffffff, hill:0xdfeaf6, far:0xb9cde6, music:{ root:67, tempo:110, scale:'major' },
    intro:{}, text:'ChristmasRadio 24: Die Schweine haben die Geschenke im Schnee versteckt.' },
  { name:'Königsburg', logo:7, theme:'castle', sky:[0x2a3a6a, 0xf0a060], ground:0x4a4a3a, grass:0x5a9a3a, hill:0x6a6a5a, far:0x3a4a6a, music:{ root:60, tempo:120, scale:'minor' },
    intro:{}, text:'AnMaCha 24 präsentiert das große Finale: Stürmt die Burg von König Grunz!' }
];
const LEVELS_PER_WORLD = 15, WORLD_COUNT = WORLDS.length, LEVEL_COUNT = WORLD_COUNT * LEVELS_PER_WORLD;
const SLING = { x:0, y:3.1, maxPull:2.4, vmax:24 };
const MAX_X = 52;

function rngFor(seed) {
  let a = seed >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pickW = (rng, entries) => { // [[wert, gewicht], …]
  let sum = 0; entries.forEach(e => { sum += Math.max(0, e[1]); });
  let r = rng() * sum;
  for (const e of entries) { r -= Math.max(0, e[1]); if (r <= 0) return e[0]; }
  return entries[entries.length - 1][0];
};

function birdsUnlocked(w, l) {
  const out = [];
  WORLDS.forEach((W, wi) => Object.keys(W.intro).forEach(li => { if (wi < w || (wi === w && Number(li) <= l)) out.push(W.intro[li]); }));
  return BIRD_ORDER.filter(b => out.includes(b));
}

// ---------- Bausteine (lokale Koordinaten: x ab 0 nach rechts, y ab Untergrund) ----------
function Prefab() { return { blocks:[], pigs:[], tops:[], w:0, h:0 }; }
const box = (p, m, x, y, w, h) => { p.blocks.push({ t:'box', m, x, y, w, h }); };
const circ = (p, m, x, y, r) => { p.blocks.push({ t:'circle', m, x, y, r }); };
const tri = (p, m, x, y, pts) => { p.blocks.push({ t:'tri', m, x, y, pts }); };
const pig = (p, k, x, y) => { p.pigs.push({ k, x, y: y + PIGS[k].r }); };

function hut(p, mats, k, x0, y0, span, H) {
  box(p, mats.post, x0 + 0.2, y0 + H / 2, 0.4, H);
  box(p, mats.post, x0 + span - 0.2, y0 + H / 2, 0.4, H);
  box(p, mats.plank, x0 + span / 2, y0 + H + 0.2, span, 0.4);
  if (k) pig(p, k, x0 + span / 2, y0);
  return y0 + H + 0.4;
}
function spanFor(k) { return Math.max(2.4, k ? 2 * PIGS[k].r + 1.0 : 2.4); }

const PREFABS = {
  hut(rng, mats, pk) {
    const p = Prefab(), k = pk(0.78), span = spanFor(k);
    const top = hut(p, mats, k, 0, 0, span, 2.0);
    if (rng() < 0.35) { // Giebeldach
      const hw = span / 2;
      tri(p, mats.block, hw / 2, top + 0.5, [[-hw / 2, -0.5], [hw / 2, -0.5], [hw / 2, 0.5]]);
      tri(p, mats.block, hw + hw / 2, top + 0.5, [[-hw / 2, -0.5], [hw / 2, -0.5], [-hw / 2, 0.5]]);
      p.h = top + 1;
    } else { p.tops.push({ x:span / 2, y:top, w:span }); p.h = top; }
    p.w = span; return p;
  },
  tower(rng, mats, pk, floors) {
    const p = Prefab(), n = floors || 2, span = 2.6; let y = 0;
    for (let f = 0; f < n; f++) { const k = f === 0 || rng() < 0.6 ? pk(0.66) : null; y = hut(p, mats, k, 0, y, span, 2.0); }
    p.tops.push({ x:span / 2, y, w:span }); p.w = span; p.h = y; return p;
  },
  pyramid(rng, mats, pk) {
    const p = Prefab(), n = 3 + Math.floor(rng() * 2), s = 1, g = 0.04;
    for (let row = 0; row < n; row++) for (let i = 0; i < n - row; i++) box(p, mats.block, row * (s + g) / 2 + i * (s + g) + s / 2, row * s + s / 2, s, s);
    p.w = n * s + (n - 1) * g; p.h = n * s;
    const k = pk(0.66); pig(p, k, p.w / 2, p.h); p.h += 2 * PIGS[k].r; return p;
  },
  hall(rng, mats, pk) {
    const p = Prefab(), spans = 2 + (rng() < 0.4 ? 1 : 0), L = 3.2, H = 2.0;
    for (let i = 0; i <= spans; i++) box(p, mats.post, 0.2 + i * L, H / 2, 0.4, H);
    for (let i = 0; i < spans; i++) {
      box(p, mats.plank, 0.2 + (i + 0.5) * L, H + 0.2, L, 0.4);
      if (rng() < 0.75) pig(p, pk(0.78), 0.2 + (i + 0.5) * L, 0);
      p.tops.push({ x:0.2 + (i + 0.5) * L, y:H + 0.4, w:L - 0.6 });
    }
    if (!p.pigs.length) pig(p, pk(0.78), 0.2 + 0.5 * L, 0);
    p.w = spans * L + 0.4; p.h = H + 0.4; return p;
  },
  pedestal(rng, mats, pk) {
    const p = Prefab(), n = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) box(p, mats.block, 0.5, i + 0.5, 1, 1);
    const k = pk(0.52); pig(p, k, 0.5, n); p.w = 1; p.h = n + 2 * PIGS[k].r; return p;
  },
  stilts(rng, mats, pk) {
    const p = Prefab(), H = 3.4, span = 2.2;
    box(p, mats.post, 0.2, H / 2, 0.4, H); box(p, mats.post, span - 0.2, H / 2, 0.4, H);
    box(p, mats.plank, span / 2, H + 0.2, span, 0.4);
    const k = pk(0.66); pig(p, k, span / 2, H + 0.4);
    if (rng() < 0.6) pig(p, 'small', span / 2, 0);
    p.w = span; p.h = H + 0.4 + 2 * PIGS[k].r; return p;
  },
  tntHouse(rng, mats, pk) {
    const p = Prefab(), span = 3.4, H = 2.0;
    const top = hut(p, mats, null, 0, 0, span, H);
    box(p, 'tnt', 0.4 + 0.04 + 0.45, 0.45, 0.9, 0.9);
    const k = pk(0.5); pig(p, k, span - 0.4 - 0.04 - PIGS[k].r, 0);
    p.tops.push({ x:span / 2, y:top, w:span }); p.w = span; p.h = top; return p;
  },
  ballTrap(rng, mats, pk) {
    const p = Prefab(), span = 3.2, H = 2.0;
    const top = hut(p, mats, pk(0.78), 0, 0, span, H);
    box(p, mats.block, 0.25, top + 0.25, 0.5, 0.5); box(p, mats.block, span - 0.25, top + 0.25, 0.5, 0.5);
    circ(p, 'stone', span / 2 - 0.5, top + 0.45, 0.45); circ(p, 'stone', span / 2 + 0.5, top + 0.45, 0.45);
    p.w = span; p.h = top + 0.9; return p;
  },
  bunker(rng, mats, pk) {
    const p = Prefab();
    tri(p, mats.block, 0.8, 0.8, [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8]]);
    box(p, mats.block, 1.64 + 0.5, 0.5, 1, 1); box(p, mats.block, 1.64 + 0.5, 1.5, 1, 1);
    const k = pk(0.66), px = 2.68 + PIGS[k].r; pig(p, k, px, 0);
    const wx = px + PIGS[k].r + 0.04;
    box(p, mats.post, wx + 0.2, 1.0, 0.4, 2.0);
    box(p, mats.plank, (1.64 + wx + 0.4) / 2, 2.2, wx + 0.4 - 1.64, 0.4);
    p.w = wx + 0.4; p.h = 2.4; p.tops.push({ x:(1.64 + wx + 0.4) / 2, y:2.4, w:wx + 0.4 - 1.64 }); return p;
  },
  tower3(rng, mats, pk) { return PREFABS.tower(rng, mats, pk, 3); }
};
// Ab welchem Schwierigkeitsgrad (0–149) ein Bauwerk vorkommt und wie oft.
const PREFAB_POOL = [['hut', 0, 3], ['pedestal', 1, 1.5], ['pyramid', 2, 2], ['tower', 3, 3], ['hall', 6, 2.5], ['stilts', 8, 1.5],
  ['tntHouse', 10, 2], ['ballTrap', 14, 1.5], ['bunker', 20, 2], ['tower3', 30, 2]];

function materialSet(rng, t, theme) {
  const wGlass = theme === 'winter' ? 0.55 : 0.32, wStone = 0.04 + 0.5 * t + (theme === 'volcano' || theme === 'castle' ? 0.2 : 0);
  const pick = () => pickW(rng, [['glass', wGlass], ['wood', 0.62 - 0.25 * t], ['stone', wStone]]);
  const base = pick();
  if (rng() < 0.35) return { post:pick(), plank:pick(), block:base };
  return { post:base, plank:base, block:base };
}
function pigPicker(rng, t) {
  return maxR => {
    const list = [['small', 1.4 - t], ['medium', 1], ['large', 0.15 + 0.6 * t], ['helmet', t < 0.1 ? 0 : 0.2 + 0.8 * t], ['beard', t < 0.2 ? 0 : 0.5 * t]]
      .filter(e => PIGS[e[0]].r <= maxR);
    return pickW(rng, list.length ? list : [['small', 1]]);
  };
}

function goldLevel(w) { return 2 + ((w * 7 + 3) % 12); }

function buildBoss(rng, w, t) {
  const p = Prefab(), hard = w >= 4 ? 'stone' : 'wood';
  const stone = { post:hard, plank:'wood', block:hard }, glass = { post:'glass', plank:w >= 3 ? 'stone' : 'wood', block:'glass' };
  const pk = () => (w > 0 && rng() < 0.5 ? 'helmet' : 'medium');
  let y = 0;
  for (let f = 0; f < 3; f++) y = hut(p, stone, f < 2 ? pk() : 'small', 0, y, 2.6, 2.0);
  const hx = 3.2, L = 3.4;
  for (let i = 0; i <= 2; i++) box(p, hard, hx + 0.2 + i * L, 1.2, 0.4, 2.4);
  for (let i = 0; i < 2; i++) { box(p, 'wood', hx + 0.2 + (i + 0.5) * L, 2.6, L, 0.4); box(p, 'tnt', hx + 0.2 + (i + 0.5) * L, 0.45, 0.9, 0.9); }
  const kx = hx + 0.2 + L; // König im Glaspalast über der Halle
  const span = 3.2, top = hut(p, glass, null, kx - span / 2, 2.8, span, 2.4);
  pig(p, 'king', kx, 2.8);
  tri(p, 'wood', kx - span / 4, top + 0.5, [[-span / 4, -0.5], [span / 4, -0.5], [span / 4, 0.5]]);
  tri(p, 'wood', kx + span / 4, top + 0.5, [[-span / 4, -0.5], [span / 4, -0.5], [-span / 4, 0.5]]);
  const rx = hx + 2 * L + 0.4 + 0.6; y = 0;
  for (let f = 0; f < 3; f++) y = hut(p, stone, f < 2 ? pk() : 'beard', rx, y, 2.6, 2.0);
  p.w = rx + 2.6; p.h = Math.max(y, top + 1);
  p.boss = true; p.bossHp = 1.6 + w * 0.25 + t;
  return p;
}

function generateLevel(w, l) {
  const W = WORLDS[w], d = w * LEVELS_PER_WORLD + l, t = d / (LEVEL_COUNT - 1);
  const rng = rngFor(0x9e3779b1 ^ (d * 7919 + 17));
  const level = { id:d, world:w, index:l, name:(w + 1) + '-' + (l + 1), theme:W.theme, blocks:[], pigs:[], terrain:[], birds:[], intro:W.intro[l] || null,
    gold:false, boss:l === LEVELS_PER_WORLD - 1 };
  let x = 17 + Math.min(7, d * 0.05) + rng() * 2.5;
  const place = (p, baseX, baseY) => {
    p.blocks.forEach(b => level.blocks.push(Object.assign({}, b, { x:b.x + baseX, y:b.y + baseY })));
    p.pigs.forEach(q => level.pigs.push(Object.assign({}, q, { x:q.x + baseX, y:q.y + baseY })));
    return p.tops.map(tp => ({ x:tp.x + baseX, y:tp.y + baseY, w:tp.w }));
  };
  let tops = [], prefabCount = 0, last = null;
  if (level.boss) {
    const p = buildBoss(rng, w, t); last = { x, y:0, p };
    tops = place(p, x, 0); x += p.w; prefabCount = 3; level.bossHp = p.bossHp;
  } else {
    const want = Math.min(4, 1 + Math.floor(Math.min(3, l / 5 + w * 0.32)));
    const pool = PREFAB_POOL.filter(e => e[1] <= d);
    const pk = pigPicker(rng, t);
    for (let i = 0; i < want; i++) {
      const kind = pickW(rng, pool.map(e => [e[0], e[2]]));
      const p = PREFABS[kind](rng, materialSet(rng, t, W.theme), pk);
      const hillChance = (W.theme === 'clouds' ? 0.55 : 0.12 + 0.3 * t);
      const hill = p.h < 7.5 && rng() < hillChance ? 1.2 + rng() * (2 + 2.5 * t) : 0, slope = hill ? hill * 0.8 + 0.6 : 0;
      const need = p.w + 2 * slope + 1;
      if (i > 0 && x + need > MAX_X) break;
      if (hill) {
        const tw = p.w + 1;
        level.terrain.push({ pts:[[x, 0], [x + tw + 2 * slope, 0], [x + slope + tw, hill], [x + slope, hill]] });
        tops = tops.concat(place(p, x + slope + 0.5, hill));
        last = { x:x + slope + 0.5, y:hill, p };
      } else { tops = tops.concat(place(p, x, 0)); last = { x, y:0, p }; }
      x += need - 1 + 1.4 + rng() * 2;
      prefabCount++;
    }
    // Zusätzliche Schweine und Sender-Kisten auf freien Dächern
    tops.sort(() => rng() - 0.5);
    for (const tp of tops) {
      const roll = rng();
      if (roll < 0.25 + 0.2 * t && tp.w >= 0.9) { level.pigs.push({ k:'small', x:tp.x, y:tp.y + PIGS.small.r }); }
      else if (roll < 0.5 && tp.w >= 1.04) { level.blocks.push({ t:'box', m:'logo', x:tp.x, y:tp.y + 0.5, w:1, h:1, logo:1 + Math.floor(rng() * STATIONS.length) }); }
    }
  }
  // Goldene Sender-Kiste: einmal je Welt, schwer erreichbar
  if (l === goldLevel(w) && last) {
    let gx = x + 2 + rng() * 2, gy = 6 + rng() * 3;
    if (gx > MAX_X) { gx = last.x + last.p.w / 2; gy = last.y + last.p.h + 3.5 + rng() * 1.5; }
    level.terrain.push({ pts:[[gx - 1.1, gy - 0.4], [gx + 1.1, gy - 0.4], [gx + 1.1, gy], [gx - 1.1, gy]], ledge:true });
    level.blocks.push({ t:'box', m:'gold', x:gx, y:gy + 0.4, w:0.8, h:0.8, logo:W.logo });
    level.gold = true;
  }
  if (level.boss) level.pigs.forEach(q => { if (q.k === 'king') q.hpScale = level.bossHp; });
  level.width = Math.max(30, x + 4);
  // Vögel
  const mats = { glass:0, wood:0, stone:0 };
  level.blocks.forEach(b => { if (mats[b.m] !== undefined) mats[b.m] += b.t === 'box' ? b.w * b.h : 1; });
  const total = mats.glass + mats.wood + mats.stone || 1, share = { glass:mats.glass / total, wood:mats.wood / total, stone:mats.stone / total };
  let count = prefabCount + 1 + (level.pigs.length > prefabCount * 2 ? 1 : 0) + (share.stone > 0.4 ? 1 : 0) + (level.boss ? 1 : 0)
    + (level.pigs.filter(q => q.k === 'helmet' || q.k === 'beard' || q.k === 'large').length >= 2 ? 1 : 0);
  count = Math.max(3, Math.min(8, count));
  const pool = birdsUnlocked(w, l);
  const weight = { red:1, blue:0.4 + 2.2 * share.glass, yellow:0.4 + 2.2 * share.wood, black:0.6 + 3 * share.stone, white:0.9, green:0.8, big:0.4 + 2 * share.stone, orange:0.8 };
  if (level.intro) level.birds.push(level.intro, level.intro);
  while (level.birds.length < count) { const b = pickW(rng, pool.map(q => [q, weight[q]])); level.birds.push(b); weight[b] *= 0.45; }
  // Sterne-Schwellen
  let blockScore = 0;
  level.blocks.forEach(b => { if (b.m !== 'gold' && b.m !== 'logo') blockScore += MATERIALS[b.m].score; });
  const pigScore = level.pigs.reduce((s, q) => s + PIGS[q.k].score, 0);
  const spare = Math.max(0, count - prefabCount - 1);
  level.stars = [pigScore, Math.round((pigScore + blockScore * 0.22 + 10000 * Math.max(0, spare - 1)) / 1000) * 1000,
    Math.round((pigScore + blockScore * 0.45 + 10000 * spare) / 1000) * 1000];
  level.stars[1] = Math.max(level.stars[1], level.stars[0] + 5000);
  level.stars[2] = Math.max(level.stars[2], level.stars[1] + 8000);
  level.prefabs = prefabCount;
  return level;
}

const cache = new Map();
function getLevel(id) {
  if (!cache.has(id)) cache.set(id, generateLevel(Math.floor(id / LEVELS_PER_WORLD), id % LEVELS_PER_WORLD));
  return cache.get(id);
}

const api = { BIRDS, BIRD_ORDER, PIGS, MATERIALS, STATIONS, STAR_LOGOS, WORLDS, LEVELS_PER_WORLD, WORLD_COUNT, LEVEL_COUNT, SLING,
  getLevel, birdsUnlocked, goldLevel, rngFor };
root.KVLevels = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
