/* Hauptinsel Sonnenhafen – der Mittelpunkt: Ort mit Rathaus, Polizei, Feuerwehr, Krankenhaus, Haus Sonnenschein, Bauernhof,
   Freibad, Badestrand, See, Camp, Kino, Leuchtturm mit Regenbogen-Kompass, Zugring und im Nordwesten der Verbotene Wald. */
import type { WorldDef, WorldCtx } from '../registry.ts';
import type { IslandShape, PathSeg } from '../terrain.ts';
import { ISLES } from '../layout.ts';
import { arch, bench, fence, floatLabel, fountain, frame, furniture, house, lamp, rock, sign, stall, statue, tower } from '../props.ts';
import { chest, emojiTex, spot } from '../kit.ts';

const I = ISLES.hub;
const H = 1.2;
const STONE = 0xe3ddd0, ROAD = 0x8f949c, PATH = 0xe8d3a3, PLAZA = 0xd9d2c3;
export const FOREST = { x: -150, z: -120, r: 62, gate: { x: -104, z: -80 } };
export const LIGHTHOUSE = { x: 154, z: -42 };
export const HOME = { x: -58, z: 58, rot: 2.35 };
export const RING_R = 96;

const ring = (r: number, n: number, w: number, color: number): PathSeg[] => {
  const out: PathSeg[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    out.push({ ax: Math.cos(a0) * r, az: Math.sin(a0) * r, bx: Math.cos(a1) * r, bz: Math.sin(a1) * r, w, color });
  }
  return out;
};

const shape: IslandShape = {
  id: 'hub', x: I.x, z: I.z, r: I.r, height: H, beach: 12, bumps: 1.4,
  lobes: [{ x: FOREST.x, z: FOREST.z, r: FOREST.r }, { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, r: 22 }],
  hills: [
    { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, r: 20, h: 5, flat: 9 },
    { x: -40, z: -95, r: 26, h: 6 }, { x: 95, z: -70, r: 22, h: 4 }, { x: -170, z: -150, r: 26, h: 5 },
    { x: -120, z: 95, r: 16, h: 2.5 }
  ],
  flats: [
    { x: 0, z: 0, r: 26, y: H }, { x: -62, z: 30, r: 13, y: -0.9, edge: 6 }, { x: -18, z: 105, r: 9, y: -0.4, edge: 1.5 },
    { x: -168, z: -102, r: 15, y: H + 0.2 }, { x: -182, z: -150, r: 17, y: H + 2.5 }
  ],
  paths: [
    ...ring(52, 20, 6, ROAD),
    { ax: 0, az: -26, bx: 0, bz: -150, w: 7, color: ROAD }, { ax: 0, az: 26, bx: -9, bz: 148, w: 6, color: ROAD },
    { ax: 26, az: 0, bx: 150, bz: 0, w: 7, color: ROAD }, { ax: -26, az: 0, bx: -145, bz: -22, w: 6, color: ROAD },
    { ax: 32, az: -40, bx: 112, bz: -95, w: 6, color: ROAD }, { ax: 38, az: 36, bx: 120, bz: 80, w: 6, color: ROAD },
    { ax: -36, az: 36, bx: -132, bz: 60, w: 5, color: PATH }, { ax: -32, az: 40, bx: -75, bz: 124, w: 5, color: PATH },
    { ax: 34, az: 40, bx: 60, bz: 131, w: 5, color: PATH }, { ax: -36, az: -36, bx: FOREST.gate.x, bz: FOREST.gate.z, w: 5, color: PATH },
    { ax: 112, az: -10, bx: 142, bz: -36, w: 4, color: PATH },
    ...ring(RING_R, 32, 3.2, 0x7a6450)
  ],
  paints: [
    { x: 0, z: 0, r: 25, color: PLAZA }, { x: 0, z: 0, r: 25, color: STONE, ring: 2 },
    { x: 52, z: 22, r: 6, color: 0x9aa0a8 }, { x: 52, z: 22, r: 6, color: 0xffffff, ring: 0.5 },
    { x: 92, z: 70, r: 15, color: 0x8a6a3a }, { x: 112, z: 52, r: 11, color: 0xc9a85a },
    { x: -18, z: 105, r: 11, color: 0xdfe6ee }, { x: -100, z: 78, r: 9, color: 0xc9b48a },
    { x: FOREST.x, z: FOREST.z, r: FOREST.r + 4, color: 0x3d7a46 }, { x: -168, z: -102, r: 15, color: 0x6a5a3a }, { x: -182, z: -150, r: 17, color: 0x5a4a6a }
  ],
  grass: 0x6fcf5a, grass2: 0x5cbf4f, sand: 0xf2dca0, rock: 0x9aa3ad,
  colorFn: (x, z) => {
    // Felder am Hof: Streifen
    if (x > 80 && x < 104 && z > 60 && z < 80) return Math.floor((x - 80) / 2) % 2 ? 0xc9a85a : 0x9a7a3a;
    // Wald: dunkler Boden
    const df = Math.hypot(x - FOREST.x, z - FOREST.z);
    if (df < FOREST.r + 2 && df > 18) return (Math.floor(x * 0.3) + Math.floor(z * 0.3)) % 3 === 0 ? 0x335f3c : 0x3d6f45;
    return null;
  }
};

export const hub: WorldDef = {
  id: 'hub', name: 'Hauptinsel Sonnenhafen', icon: '🏝️', desc: 'Der Mittelpunkt der Bunten Insel: Ort, Haus Sonnenschein, Bauernhof, Freibad, Leuchtturm – und der Verbotene Wald.',
  shape, theme: 'insel', chapter: 0,
  spawn: { x: 0, z: 30, yaw: Math.PI },
  zones: [
    { id: 'wald', name: 'Verbotener Wald', x: FOREST.x, z: FOREST.z, r: FOREST.r - 6, theme: 'wald', combat: true, icon: '🌲' },
    { id: 'hof', name: 'Bauernhof', x: 92, z: 62, r: 30, theme: 'farm', icon: '🚜' },
    { id: 'freibad', name: 'Freibad', x: -18, z: 105, r: 18, theme: 'pool', icon: '🏊' },
    { id: 'strand', name: 'Badestrand', x: 70, z: 130, r: 30, theme: 'pool', icon: '🏖️' },
    { id: 'camp', name: 'Camp', x: -100, z: 78, r: 16, theme: 'camp', icon: '⛺' },
    { id: 'ort', name: 'Ortsplatz', x: 0, z: 0, r: 40, icon: '⛲' },
    { id: 'leuchtturm', name: 'Leuchtturm', x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, r: 20, icon: '🗼' }
  ],
  pois: {
    platz: { x: 0, z: 12, name: 'Ortsplatz', icon: '⛲' },
    rathaus: { x: 0, z: -22, name: 'Rathaus', icon: '🏛️' },
    home: { x: HOME.x + 7, z: HOME.z + 7, name: 'Haus Sonnenschein', icon: '🏠' },
    hof: { x: 76, z: 52, name: 'Bauernhof', icon: '🚜' },
    zoo: { x: 60, z: 88, name: 'Streichelzoo', icon: '🐄' },
    leuchtturm: { x: 140, z: -30, name: 'Leuchtturm', icon: '🗼' },
    leuchtturm_top: { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, name: 'Leuchtturm-Spitze', icon: '🧭', y: 25 },
    waldtor: { x: FOREST.gate.x + 4, z: FOREST.gate.z + 4, name: 'Tor zum Verbotenen Wald', icon: '🌲' },
    training: { x: -168, z: -102, name: 'Trainings-Lichtung', icon: '🥋' },
    boss: { x: -182, z: -150, name: 'Herz des Waldes', icon: '🌑' },
    freibad: { x: -18, z: 92, name: 'Freibad', icon: '🏊' },
    strand: { x: 80, z: 128, name: 'Badestrand', icon: '🏖️' },
    steg: { x: 30, z: 142, name: 'Steg', icon: '⛵' },
    see: { x: -62, z: 45, name: 'Ententeich', icon: '🦆' },
    camp: { x: -100, z: 78, name: 'Camp', icon: '⛺' },
    kino: { x: 62, z: -50, name: 'Kino', icon: '🎬' },
    spielzeug: { x: -26, z: 12, name: 'Spielzeugladen', icon: '🧸' },
    krankenhaus: { x: 30, z: 14, name: 'Krankenhaus', icon: '🏥' },
    feuerwehr: { x: 26, z: -22, name: 'Feuerwehr', icon: '🚒' },
    polizei: { x: -26, z: -22, name: 'Polizei', icon: '🚓' },
    bahnhof: { x: 8, z: 96, name: 'Bahnhof Süd', icon: '🚉' },
    piratenschiff: { x: -62, z: 136, name: 'Piratenschiff-Spielplatz', icon: '🏴‍☠️' },
    atlantis_treppe: { x: 96, z: 102, name: 'Treppe zur Tiefe (Atlantis)', icon: '🔱' }
  },
  groundCover: { grass: 1, flowers: [0xff6fb5, 0xfff07a, 0xffffff, 0x8fd3ff, 0xff8a1f] },
  vehicles: [
    { type: 'auto', x: 12, z: 46, yaw: 0.4, color: 0x3f8cff }, { type: 'auto', x: -44, z: 44, yaw: 2.2, color: 0xff6fb5 },
    { type: 'polizei', x: -40, z: -36, yaw: 0.75 }, { type: 'feuerwehr', x: 40, z: -38, yaw: -0.75 }, { type: 'krankenwagen', x: 46, z: 8, yaw: -1.6 },
    { type: 'bus', x: -6, z: 58, yaw: 1.57 }, { type: 'eiswagen', x: -28, z: 42, yaw: 2.6 }, { type: 'traktor', x: 86, z: 52, yaw: -2 },
    { type: 'fahrrad', x: HOME.x + 9, z: HOME.z + 4, yaw: 2.3 }, { type: 'roller', x: HOME.x + 10, z: HOME.z + 6, yaw: 2.3 },
    { type: 'heli', x: 52, z: 22, yaw: 0 }, { type: 'segelboot', x: 34, z: 160, yaw: 0 }, { type: 'zug', x: 0, z: 96, yaw: 0, id: 'hub:zug' }
  ],
  build: buildHub,
  proxy: (b, h) => { b.cyl(LIGHTHOUSE.x, h(LIGHTHOUSE.x, LIGHTHOUSE.z), LIGHTHOUSE.z, 2.6, 3.2, 18, 0xffffff, 10); b.cone(LIGHTHOUSE.x, h(LIGHTHOUSE.x, LIGHTHOUSE.z) + 20, LIGHTHOUSE.z, 3, 3, 0xe8453c, 10); }
};

function buildHub(ctx: WorldCtx): void {
  const { b, rng, api } = ctx;
  /* ---------- Ortsplatz ---------- */
  fountain(ctx, 0, 0, 5.2);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; lamp(ctx, Math.cos(a) * 21, Math.sin(a) * 21); }
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.6; bench(ctx, Math.cos(a) * 15, Math.sin(a) * 15, -a + Math.PI / 2 + Math.PI); }
  floatLabel(ctx, 0, H + 7.5, 0, 'Sonnenhafen', '🏝️', 1.6);
  stall(ctx, 14, 12, -2.2, 0xe8453c, [0xe8453c, 0xffd23f, 0x4cd07d]);
  stall(ctx, -14, -12, 0.9, 0x3f8cff, [0xff8a1f, 0xb36bff, 0xffffff]);
  /* ---------- Gebäude um den Platz ---------- */
  const rh = house(ctx, { x: 0, z: -32, rot: 0, w: 14, d: 10, h: 5, wall: 0xfff1d6, roof: 0x5b4bd6, enter: true, name: 'Rathaus', icon: '🏛️', trim: 0xffd23f });
  { const p = rh.f.at(0, -6); b.box(p.x, rh.y + 5, p.z, 2, 4, 2, 0xfff1d6); b.cone(p.x, rh.y + 9, p.z, 1.6, 2.4, 0x5b4bd6, 4); ctx.glow.cyl(p.x, rh.y + 7, rh.f.at(0, -4.98).z, 0.7, 0.7, 0.08, 0xffffff, 16, { rx: Math.PI / 2 }); }
  furniture(ctx, rh, 'tisch', 0, -2); furniture(ctx, rh, 'regal', -5, -4.4); furniture(ctx, rh, 'pflanze', 5.6, -4); furniture(ctx, rh, 'teppich', 0, 1, 0xe8453c);
  const pol = house(ctx, { x: -32, z: -28, rot: 0.75, w: 11, d: 9, wall: 0xdfe9ff, roof: 0x2f5fc0, enter: true, name: 'Polizei', icon: '🚓', trim: 0x2f5fc0 });
  furniture(ctx, pol, 'tisch', -2, -1.5); furniture(ctx, pol, 'schrank', 3.5, -3.6, 0x3f8cff); furniture(ctx, pol, 'pflanze', -4.6, -3.6);
  const fw = house(ctx, { x: 32, z: -28, rot: -0.75, w: 12, d: 10, wall: 0xffe3d6, roof: 0xe8453c, enter: true, name: 'Feuerwehr', icon: '🚒', trim: 0xe8453c });
  furniture(ctx, fw, 'schrank', -4.4, -4, 0xe8453c); furniture(ctx, fw, 'tisch', 2, -2);
  const kh = house(ctx, { x: 37, z: 14, rot: -1.65, w: 13, d: 10, h: 4, wall: 0xffffff, roof: 0x7fd8ff, enter: true, name: 'Krankenhaus', icon: '🏥', roofType: 'flat' });
  furniture(ctx, kh, 'bett', -4, -3, 0x7fd8ff); furniture(ctx, kh, 'bett', -1, -3, 0x7fd8ff); furniture(ctx, kh, 'theke', 3, 1);
  ctx.b.cyl(52, ctx.h(52, 22), 22, 5.5, 5.5, 0.12, 0x9aa0a8, 24); ctx.glow.box(52, ctx.h(52, 22) + 0.13, 22, 1, 0.02, 5, 0xffffff); ctx.glow.box(52, ctx.h(52, 22) + 0.13, 22, 3.5, 0.02, 1, 0xffffff);
  const toy = house(ctx, { x: -36, z: 12, rot: 1.6, w: 10, d: 8, wall: 0xffd6f0, roof: 0xff6fb5, enter: true, name: 'Spielzeugladen', icon: '🧸', trim: 0xffd23f });
  furniture(ctx, toy, 'theke', 0, -2); furniture(ctx, toy, 'regal', -3.4, -3.3); furniture(ctx, toy, 'regal', 3.4, -3.3);
  const eis = house(ctx, { x: -20, z: 36, rot: 2.6, w: 8, d: 6, wall: 0xfff6c0, roof: 0x7fd8ff, enter: true, name: 'Eisdiele', icon: '🍦', roofType: 'flat' });
  furniture(ctx, eis, 'theke', 0, -1.6);
  const school = house(ctx, { x: 22, z: 37, rot: -2.6, w: 13, d: 9, wall: 0xffe9b0, roof: 0xb36bff, enter: true, name: 'Schule', icon: '🏫' });
  for (let i = 0; i < 3; i++) furniture(ctx, school, 'tisch', -3.5 + i * 3.5, 0.5);
  furniture(ctx, school, 'regal', 0, -3.8);
  // weitere Wohnhäuser
  const homes: [number, number, number, number, number][] = [[-50, -8, 1.6, 0xd8f5c4, 0xe8453c], [50, -6, -1.6, 0xbfe8ff, 0xff8a1f], [-48, 26, 2.2, 0xffd6a8, 0x3f8cff], [62, 30, -2.0, 0xf6d6ff, 0x4cd07d], [-8, -58, 0, 0xffe3e3, 0x8a5a33], [18, -60, 0.2, 0xe3ffe9, 0x5b4bd6], [-24, 60, 2.8, 0xfff1d6, 0xe8453c]];
  homes.forEach(([x, z, r, w, rf], i) => {
    const hs = house(ctx, { x, z, rot: r, w: 8, d: 7, wall: w, roof: rf, enter: true });
    furniture(ctx, hs, i % 2 ? 'sofa' : 'bett', -1.5, -2.2, [0xe8453c, 0x3f8cff, 0x4cd07d][i % 3]);
    furniture(ctx, hs, 'tisch', 1.8, 0.4);
    furniture(ctx, hs, 'pflanze', 3.2, -2.8);
  });
  /* ---------- Haus Sonnenschein (Zuhause) ---------- */
  const home = house(ctx, { x: HOME.x, z: HOME.z, rot: HOME.rot, w: 14, d: 10, wall: 0xffd6a8, roof: 0xe8453c, enter: true, name: 'Haus Sonnenschein', icon: '🏠', trim: 0xffffff, floor: 0xe8c79a });
  const bed = furniture(ctx, home, 'bett', -5, -2.6, 0x4da3ff);
  const wardrobe = furniture(ctx, home, 'schrank', -1.5, -4.3, 0xb07a45);
  const chest = furniture(ctx, home, 'kiste', 2, -4.2);
  furniture(ctx, home, 'sofa', 3.5, 1, 0xff6fb5, Math.PI);
  furniture(ctx, home, 'teppich', 0, 0, 0xffd23f);
  furniture(ctx, home, 'tv', 3.5, -1.6, 0, Math.PI);
  furniture(ctx, home, 'pflanze', 6, -4.2);
  ctx.interact({ id: 'home_bed', x: bed.x, y: bed.y, z: bed.z, r: 2.2, icon: '😴', label: () => api.isNight() ? 'Schlafen bis zum Morgen' : 'Ausruhen bis zum Abend', act: () => api.openPanel('sleep') });
  ctx.interact({ id: 'home_wardrobe', x: wardrobe.x, y: wardrobe.y, z: wardrobe.z, r: 2.2, icon: '👕', label: 'Kleiderschrank (Aussehen ändern)', act: () => api.openPanel('editor') });
  ctx.interact({ id: 'home_chest', x: chest.x, y: chest.y, z: chest.z, r: 2, icon: '🧰', label: 'Schatzkiste (Lager)', act: () => api.openPanel('inventory') });
  // Garten hinter dem Haus
  { const f = frame(HOME.x, HOME.z, HOME.rot); const g = f.at(0, -11);
    fence(ctx, f.at(-7, -6).x, f.at(-7, -6).z, f.at(-7, -16).x, f.at(-7, -16).z, 0xffffff, 0.9);
    fence(ctx, f.at(7, -6).x, f.at(7, -6).z, f.at(7, -16).x, f.at(7, -16).z, 0xffffff, 0.9);
    fence(ctx, f.at(-7, -16).x, f.at(-7, -16).z, f.at(7, -16).x, f.at(7, -16).z, 0xffffff, 0.9);
    for (let i = 0; i < 3; i++) { const p = f.at(-4 + i * 4, -11); b.box(p.x, ctx.h(p.x, p.z), p.z, 2.6, 0.3, 4, 0x6b4a2a, { ry: HOME.rot }); for (let k = 0; k < 4; k++) { const q = f.at(-4 + i * 4 + (k % 2 - 0.5) * 1.2, -12 + Math.floor(k / 2) * 2); b.sph(q.x, ctx.h(q.x, q.z) + 0.45, q.z, 0.28, [0x4cbf55, 0xff8a1f, 0xe8453c][i]); } }
    ctx.interact({ id: 'home_garden', x: g.x, y: ctx.h(g.x, g.z), z: g.z, r: 4, icon: '🥕', label: 'Garten ernten', act: () => api.openPanel('garden') });
  }
  /* ---------- Leuchtturm mit dem Regenbogen-Kompass ---------- */
  const lt = tower(ctx, LIGHTHOUSE.x, LIGHTHOUSE.z, 3, 22, 0xffffff, 0xe8453c, 0xe8453c);
  ctx.interact({ id: 'kompass', x: LIGHTHOUSE.x - 3.6, y: lt.topY, z: LIGHTHOUSE.z, r: 4.5, icon: '🧭', label: () => api.flag('kompass_broken') && !api.flag('kompass_fixed') ? 'Kompass-Splitter einsetzen' : 'Regenbogen-Kompass ansehen', act: () => api.openPanel('kompass'), priority: 2 });
  floatLabel(ctx, LIGHTHOUSE.x, lt.topY + 6, LIGHTHOUSE.z, 'Leuchtturm', '🗼', 1.1);
  /* ---------- Bauernhof ---------- */
  const barn = house(ctx, { x: 76, z: 46, rot: -2.0, w: 13, d: 10, h: 5, wall: 0xc0392b, roof: 0x6b3a1e, enter: true, name: 'Scheune', icon: '🚜', trim: 0xffffff });
  furniture(ctx, barn, 'kiste', -4, -3); furniture(ctx, barn, 'kiste', -2.8, -3.6);
  for (let i = 0; i < 5; i++) { const p = barn.f.at(3 + (i % 2) * 1.3, -3 + Math.floor(i / 2) * 1.2); b.cyl(p.x, barn.y, p.z, 0.55, 0.55, 1, 0xe8c85a, 10, { rz: Math.PI / 2 }); }
  fence(ctx, 44, 74, 76, 74); fence(ctx, 76, 74, 76, 100); fence(ctx, 76, 100, 44, 100); fence(ctx, 44, 100, 44, 82);
  sign(ctx, 42, 78, Math.PI / 2, 'Streichelzoo', '🐄', 0.55);
  ctx.b.box(60, ctx.h(60, 96), 96, 4, 0.6, 1.2, 0x8a5a33); ctx.b.box(60, ctx.h(60, 96) + 0.45, 96, 3.8, 0.1, 1, 0xd9c24a);
  sign(ctx, 100, 58, -1.6, 'Felder', '🌾', 0.55);
  /* ---------- Freibad ---------- */
  { const y = ctx.h(-18, 105), pool = H - 0.25;
    // Beckenrand als Ring aus Platten (innen tiefer: Gelände ist dort abgesenkt)
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, x = -18 + Math.cos(a) * 9.4, z = 105 + Math.sin(a) * 9.4; b.box(x, -0.6, z, 2.3, H + 0.75, 1.2, 0xdfe6ee, { ry: -a + Math.PI / 2 }); ctx.box(x, z, 2.3, 1.2, -1, H + 0.15, -a + Math.PI / 2); }
    b.cyl(-18, -0.42, 105, 8.8, 8.8, 0.02, 0x7fd8ff, 32);
    const wm = new THREE.Mesh(new THREE.CircleGeometry(8.7, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4fd6ff, transparent: true, opacity: 0.72, roughness: 0.15 }));
    (wm.material as THREE.Material).userData.disposeWithWorld = true;
    wm.position.set(-18, pool, 105); wm.renderOrder = 3; ctx.add(wm);
    ctx.circle(-18, 105, 8.7, -2, pool, { water: true });
    // Sprungturm
    b.box(-18, y, 116, 2, 4, 2, 0xdfe6ee); b.box(-18, y + 4, 113.5, 0.8, 0.12, 4, 0x3f8cff);
    ctx.box(-18, 116, 2, 2, y, y + 4); ctx.box(-18, 113.5, 0.8, 4, y + 3.9, y + 4.05);
    ctx.ramp(-21, 116, 1.2, 6, y, y + 4, Math.PI / 2);
    // Rutsche
    b.box(-28, y, 98, 2, 3.2, 2, 0xff8a1f); ctx.box(-28, 98, 2, 2, y, y + 3.2);
    ctx.ramp(-31.5, 98, 1.4, 5, y, y + 3.2, Math.PI / 2);
    b.box(-24.5, y + 1.7, 100.5, 1.2, 0.15, 5, 0x3fbfff, { ry: -0.9, rx: 0.5 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.box(-18 + Math.cos(a) * 11.5, y, 105 + Math.sin(a) * 11.5, 1.8, 0.35, 0.7, 0xffffff, { ry: -a }); }
    sign(ctx, -6, 98, -0.9, 'Freibad', '🏊', 0.6);
  }
  /* ---------- Ententeich ---------- */
  { const wm = new THREE.Mesh(new THREE.CircleGeometry(15, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x46b9e0, transparent: true, opacity: 0.85, roughness: 0.2 }));
    (wm.material as THREE.Material).userData.disposeWithWorld = true;
    wm.position.set(-62, 0.35, 30); wm.renderOrder = 3; ctx.add(wm);
    ctx.circle(-62, 30, 15, -3, 0.35, { water: true });
    for (let i = 0; i < 10; i++) { const a = i * 0.63; rock(ctx, -62 + Math.cos(a) * 15.5, 30 + Math.sin(a) * 15.5, 0.6 + (i % 3) * 0.2); }
    // Steg in den Teich
    b.box(-62, 0.6, 46, 2, 0.2, 6, 0xb07a45); ctx.box(-62, 46, 2, 6, -1, 0.8);
  }
  /* ---------- Camp ---------- */
  { const y = ctx.h(-100, 78);
    b.cyl(-100, y, 78, 1.2, 1.4, 0.3, 0x7a7a7a, 10);
    for (let i = 0; i < 6; i++) { const a = i; b.cyl(-100 + Math.cos(a) * 0.5, y + 0.2, 78 + Math.sin(a) * 0.5, 0.08, 0.08, 1.1, 0x8a5a33, 5, { rx: Math.cos(a) * 0.8, rz: Math.sin(a) * 0.8 }); }
    const fire = new THREE.PointLight(0xff9a3a, 1.2, 14, 2); fire.position.set(-100, y + 1.2, 78); ctx.add(fire);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0xffa21f, transparent: true, opacity: 0.9 }));
    (flame.material as THREE.Material).userData.disposeWithWorld = true;
    flame.position.set(-100, y + 0.8, 78); ctx.add(flame);
    ctx.onUpdate((_dt, t) => { flame.scale.set(1 + Math.sin(t * 13) * 0.12, 1 + Math.sin(t * 9) * 0.2, 1); fire.intensity = 1.1 + Math.sin(t * 11) * 0.2; });
    for (const [x, z, c] of [[-108, 70, 0x4cd07d], [-92, 70, 0xff8a1f], [-108, 88, 0x3f8cff]] as const) { b.cone(x, ctx.h(x, z), z, 2.2, 2.6, c, 4, { ry: 0.78 }); ctx.circle(x, z, 1.8, ctx.h(x, z), ctx.h(x, z) + 2.4); }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; b.cyl(-100 + Math.cos(a) * 3.2, y, 78 + Math.sin(a) * 3.2, 0.35, 0.35, 1.6, 0x8a5a33, 8, { rz: Math.PI / 2, ry: a }); }
    ctx.interact({ id: 'campfire', x: -100, y, z: 78, r: 4.5, icon: '🔥', label: 'Am Lagerfeuer sitzen (Geschichte hören)', act: () => api.openPanel('campfire') });
  }
  /* ---------- Kino ---------- */
  const kino = house(ctx, { x: 64, z: -56, rot: -0.9, w: 14, d: 11, h: 5.5, wall: 0x3a2a5a, roof: 0x2a1a3a, enter: true, name: 'Kino', icon: '🎬', trim: 0xffd23f, roofType: 'flat' });
  { const p = kino.f.at(0, -5.2); ctx.glow.box(p.x, kino.y + 1.2, p.z, 9, 3.6, 0.1, 0xf4f4ff, { ry: -0.9 });
    for (let r = 0; r < 3; r++) for (let s = 0; s < 5; s++) { const q = kino.f.at(-3.6 + s * 1.8, 0.5 + r * 1.6); b.rbox(q.x, kino.y, q.z, 1.3, 0.5, 0.9, 0xe8453c, { ry: -0.9 }); }
    const sc = kino.f.at(0, -4.6);
    ctx.interact({ id: 'kino_film', x: sc.x, y: kino.y, z: sc.z, r: 7, icon: '🎞️', label: 'Film ansehen', act: () => api.openPanel('cinema') });
  }
  /* ---------- Bahnhof Süd + Gleisring (Bahnsteige) ---------- */
  for (const [a, name] of [[Math.PI / 2, 'Bahnhof Süd'], [0, 'Halt Ost'], [-Math.PI / 2, 'Halt Nord'], [Math.PI, 'Halt West']] as const) {
    const cx = Math.cos(a) * (RING_R + 5), cz = Math.sin(a) * (RING_R + 5), y = ctx.h(cx, cz), rot = -a + Math.PI / 2;
    b.box(cx, y, cz, 10, 0.5, 3, 0xcfd6e2, { ry: rot });
    ctx.box(cx, cz, 10, 3, y - 1, y + 0.5, rot);
    const f = frame(cx, cz, rot);
    for (const s of [-4, 4]) { const p = f.at(s, 0.8); b.cyl(p.x, y + 0.5, p.z, 0.1, 0.1, 2.6, 0x3a4250, 6); }
    { const p = f.at(0, 0.8); b.box(p.x, y + 3.1, p.z, 10.4, 0.2, 2.4, 0x3f8cff, { ry: rot }); }
    sign(ctx, f.at(0, 1.8).x, f.at(0, 1.8).z, rot, name, '🚉', 0.55);
  }
  // Schwellen des Gleisrings
  for (let i = 0; i < 180; i++) { const a = (i / 180) * Math.PI * 2, x = Math.cos(a) * RING_R, z = Math.sin(a) * RING_R; b.box(x, ctx.h(x, z) + 0.02, z, 0.35, 0.1, 2.6, 0x6b4a2a, { ry: -a }); }
  for (const rr of [RING_R - 0.75, RING_R + 0.75]) for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2, a2 = ((i + 1) / 90) * Math.PI * 2, x = Math.cos((a + a2) / 2) * rr, z = Math.sin((a + a2) / 2) * rr; b.box(x, ctx.h(x, z) + 0.1, z, 0.12, 0.12, (2 * Math.PI * rr) / 90 + 0.05, 0xb7bcc4, { ry: -(a + a2) / 2 }); }
  /* ---------- Strand, Steg, Piratenschiff ---------- */
  { // Steg
    const y = 0.9;
    for (let i = 0; i < 10; i++) { const z = 136 + i * 2.2; b.box(30, y - 0.2, z, 3, 0.2, 2.2, 0xb07a45); b.cyl(28.4, -3, z, 0.15, 0.15, y + 2.8, 0x6b4a2a, 6); b.cyl(31.6, -3, z, 0.15, 0.15, y + 2.8, 0x6b4a2a, 6); }
    ctx.box(30, 146, 3, 22, -3, y);
    sign(ctx, 33, 135, 0, 'Steg', '⛵', 0.5);
  }
  { // Piratenschiff-Spielplatz auf dem Sand
    const x = -62, z = 136, y = ctx.h(x, z), rot = 0.3, f = frame(x, z, rot);
    b.rbox(x, y, z, 6, 2.2, 15, 0x8a5a33, { ry: rot });
    b.box(x, y + 2.2, z, 5.4, 0.15, 14, 0xc9a26b, { ry: rot });
    ctx.box(x, z, 6, 15, y - 1, y + 2.35, rot);
    const ramp = f.at(-4.8, -2); ctx.ramp(ramp.x, ramp.z, 2, 6, y, y + 2.35, rot + Math.PI / 2);
    b.box(ramp.x, y + 0.6, ramp.z, 6, 0.15, 2, 0xb07a45, { ry: rot + Math.PI / 2, rz: -0.38 });
    const m = f.at(0, 0); b.cyl(m.x, y + 2.3, m.z, 0.25, 0.3, 9, 0x6b4a2a, 8);
    b.box(m.x, y + 5.5, m.z, 0.1, 3.4, 4.6, 0xffffff, { ry: rot + Math.PI / 2 }); b.box(m.x, y + 9.3, m.z, 0.05, 1, 1.5, 0x111111, { ry: rot + Math.PI / 2 });
    for (const s of [-1, 1]) { const c = f.at(s * 2.9, 3); b.cyl(c.x, y + 2.5, c.z, 0.3, 0.3, 1.4, 0x333333, 8, { rz: Math.PI / 2, ry: rot }); }
    const tr = f.at(0, -5);
    b.rbox(tr.x, y + 2.35, tr.z, 1.2, 0.7, 0.8, 0x8a5a33, { ry: rot }); b.box(tr.x, y + 2.95, tr.z, 1.25, 0.12, 0.85, 0xffc83d, { ry: rot });
    ctx.interact({ id: 'pirat_truhe', x: tr.x, y: y + 2.35, z: tr.z, r: 2.2, icon: '🏴‍☠️', label: 'Piratentruhe öffnen', act: () => api.openPanel('piratentruhe') });
    sign(ctx, x + 8, z - 8, 0.3, 'Piratenschiff', '🏴‍☠️', 0.5);
  }
  for (let i = 0; i < 6; i++) { const x = 60 + i * 7, z = 124 + (i % 2) * 4, y = ctx.h(x, z); b.cyl(x, y, z, 0.05, 0.05, 2.4, 0xffffff, 6); b.cone(x, y + 2.1, z, 1.6, 0.6, [0xff6fb5, 0x3f8cff, 0xffd23f][i % 3], 8); b.box(x + 1.4, y, z, 0.8, 0.3, 1.9, 0xffffff); }
  /* ---------- Atlantis-Treppe ---------- */
  arch(ctx, 96, 102, 0.8, 5, 4.2, 0x7fd8ff, 0x2fb9a8);
  ctx.interact({ id: 'atlantis_in', x: 96, y: ctx.h(96, 102), z: 102, r: 3.5, icon: '🔱', label: 'Die Treppe nach Atlantis hinabsteigen', act: () => api.openPanel('travel', 'atlantis'), priority: 2 });
  floatLabel(ctx, 96, ctx.h(96, 102) + 6.2, 102, 'Atlantis', '🔱', 0.9);
  /* ---------- Verbotener Wald ---------- */
  { const g = FOREST.gate, rot = Math.atan2(g.x - FOREST.x, g.z - FOREST.z);
    arch(ctx, g.x, g.z, rot + Math.PI / 2, 6, 5, 0x4a3a5a, 0x2f5d3a);
    floatLabel(ctx, g.x, ctx.h(g.x, g.z) + 7, g.z, 'Verbotener Wald', '🌲', 1.1, 'Nur hier wird gekämpft');
    sign(ctx, g.x + 5, g.z + 5, rot, 'Achtung: Wald-Monster!', '⚠️', 0.45);
    // dichter Baumgürtel mit Lücke am Tor
    for (let i = 0; i < 140; i++) {
      const a = (i / 140) * Math.PI * 2, r = FOREST.r - 4 + (i % 3) * 2.2, x = FOREST.x + Math.cos(a) * r, z = FOREST.z + Math.sin(a) * r;
      if (Math.hypot(x - g.x, z - g.z) < 9) continue;
      if (Math.hypot(x, z) < I.r - 8 && Math.hypot(x - FOREST.x, z - FOREST.z) > FOREST.r - 7) continue;
      ctx.tree(i % 4 === 0 ? 'tanne' : 'dunkel', x, z, 1.15 + (i % 4) * 0.1);
    }
    for (let i = 0; i < 70; i++) {
      const a = rng() * Math.PI * 2, r = 14 + rng() * (FOREST.r - 22), x = FOREST.x + Math.cos(a) * r, z = FOREST.z + Math.sin(a) * r;
      if (Math.hypot(x + 168, z + 102) < 17 || Math.hypot(x + 182, z + 150) < 20 || Math.hypot(x - g.x, z - g.z) < 12) continue;
      ctx.tree(rng() < 0.15 ? 'pilz' : rng() < 0.5 ? 'dunkel' : 'tanne', x, z, 0.9 + rng() * 0.5);
    }
    // Trainings-Lichtung (Kampfmeister Kai)
    for (let i = 0; i < 4; i++) { const a = i * 1.57; const x = -168 + Math.cos(a) * 9, z = -102 + Math.sin(a) * 9, y = ctx.h(x, z); b.cyl(x, y, z, 0.4, 0.5, 2.2, 0xc9a26b, 8); b.sph(x, y + 2.4, z, 0.5, 0xe8453c); ctx.circle(x, z, 0.5, y, y + 2.6); }
    floatLabel(ctx, -168, ctx.h(-168, -102) + 4.5, -102, 'Trainings-Lichtung', '🥋', 0.8);
    // Herz des Waldes
    { const y = ctx.h(-182, -150);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; b.cyl(-182 + Math.cos(a) * 16, y, -150 + Math.sin(a) * 16, 0.8, 1, 3 + (i % 3), 0x6a6a7a, 7); ctx.circle(-182 + Math.cos(a) * 16, -150 + Math.sin(a) * 16, 1, y, y + 4); }
      ctx.glow.sph(-182, y + 0.3, -150, 1.2, 0x8f7fff, { sy: 0.3 });
      floatLabel(ctx, -182, y + 6, -150, 'Herz des Waldes', '🌑', 0.9);
    }
    // Leuchtpilze
    for (let i = 0; i < 30; i++) { const a = rng() * Math.PI * 2, r = 10 + rng() * 44, x = FOREST.x + Math.cos(a) * r, z = FOREST.z + Math.sin(a) * r, y = ctx.h(x, z); ctx.glow.sph(x, y + 0.25, z, 0.22, [0x8fe7ff, 0xc79bff, 0x7fffb0][i % 3], { sy: 0.6 }); b.cyl(x, y, z, 0.05, 0.06, 0.22, 0xf4e6c8, 5); }
  }
  /* ---------- Bäume, Büsche, Steine ---------- */
  const avoid = (x: number, z: number): boolean => {
    const r = Math.hypot(x, z);
    if (r < 60 || Math.abs(r - RING_R) < 4 || r > I.r - 14) return true;
    if (Math.hypot(x - FOREST.x, z - FOREST.z) < FOREST.r + 8) return true;
    for (const [px, pz, pr] of [[-18, 105, 16], [-62, 30, 20], [-100, 78, 12], [92, 70, 22], [60, 87, 18], [76, 46, 12], [64, -56, 12], [HOME.x, HOME.z, 16], [-62, 136, 14], [96, 102, 6], [30, 140, 6], [LIGHTHOUSE.x, LIGHTHOUSE.z, 26]] as const) if (Math.hypot(x - px, z - pz) < pr) return true;
    for (const p of shape.paths) { const vx = p.bx - p.ax, vz = p.bz - p.az, L = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - p.ax) * vx + (z - p.az) * vz) / L)); if (Math.hypot(x - p.ax - vx * t, z - p.az - vz * t) < p.w / 2 + 2.5) return true; }
    return false;
  };
  let placed = 0;
  for (let i = 0; i < 900 && placed < 170; i++) {
    const a = rng() * Math.PI * 2, r = 30 + Math.sqrt(rng()) * (I.r - 30), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (avoid(x, z)) continue;
    const kind = r > I.r - 26 ? (rng() < 0.6 ? 'palme' : 'laub') : rng() < 0.12 ? 'kirsch' : rng() < 0.3 ? 'busch' : rng() < 0.2 ? 'tanne' : 'laub';
    ctx.tree(kind, x, z, 0.85 + rng() * 0.45);
    placed++;
  }
  for (let i = 0; i < 26; i++) { const a = rng() * Math.PI * 2, r = 40 + rng() * 100, x = Math.cos(a) * r, z = Math.sin(a) * r; if (!avoid(x, z)) rock(ctx, x, z, 0.6 + rng() * 1.1); }
  // Gärten um Wohnhäuser
  for (const [x, z] of [[-50, -8], [50, -6], [-48, 26], [62, 30]] as const) for (let k = 0; k < 3; k++) ctx.tree('busch', x + (k - 1) * 3, z + (x > 0 ? -6 : 6), 0.8, false);
  statue(ctx, -7, -18, Math.PI, 0xffc83d, 1.6, 'hund');
  questObjects(ctx);
}

/* Objekte für die Abenteuer der Hauptinsel (erscheinen nur, solange sie gebraucht werden). */
function questObjects(ctx: WorldCtx): void {
  const api = ctx.api, st = (q: string) => api.questStage(q);
  // Hühner
  ([['huhn1', -76, 24, 'Gackerlotte'], ['huhn2', -112, 82, 'Federica'], ['huhn3', 30, 48, 'Eierlinde']] as const).forEach(([id, x, z, nm]) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex('🐔'), transparent: true }));
    (spr.material as THREE.Material).userData.disposeWithWorld = true;
    spr.scale.setScalar(1.1); const y = ctx.h(x, z); spr.position.set(x, y + 0.6, z); ctx.add(spr);
    const show = () => st('h_huehner') === 0 && !api.flag('huhn_' + id);
    ctx.onUpdate((_d, t) => { spr.visible = show(); spr.position.y = y + 0.6 + Math.abs(Math.sin(t * 6 + x)) * 0.2; });
    spot(ctx, id, x, z, '🐔', 'Huhn ' + nm + ' nach Hause scheuchen', () => { api.setFlag('huhn_' + id); api.sfx('chicken'); api.burst(x, y + 1, z, [0xffffff, 0xffd23f], 12); api.toast(nm + ' flattert zurück zum Hof!', '🐔'); }, { when: show, priority: 2 });
  });
  // Feuer im Camp
  ([[1, -94, 72], [2, -106, 74], [3, -98, 86]] as const).forEach(([n, x, z]) => {
    const y = ctx.h(x, z), key = 'feuer_aus_' + n;
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 8), new THREE.MeshBasicMaterial({ color: 0xff7a1f, transparent: true, opacity: 0.85 }));
    (fl.material as THREE.Material).userData.disposeWithWorld = true;
    fl.position.set(x, y + 1.1, z); ctx.add(fl);
    const burning = () => st('h_feuer') === 0 && !api.flag(key);
    ctx.onUpdate((_d, t) => { fl.visible = burning(); fl.scale.set(1 + Math.sin(t * 12 + n) * 0.15, 1 + Math.sin(t * 9 + n) * 0.25, 1); if (fl.visible && Math.random() < 0.3) api.burst(x, y + 2, z, [0x555555], 1); });
    ctx.interact({ id: 'feuer:' + n, x, y, z, r: 3, icon: '🔥', label: 'Glutnest – dafür brauchst du das Löschfahrzeug!', priority: 1, vehicleOk: false, when: burning,
      act: () => api.toast('Zu heiß! Hol das Löschfahrzeug von der Feuerwache und spritze mit ⤓ / ✦.', '🔥', 3500),
      onWater: () => { api.setFlag(key); api.sfx('splash'); api.burst(x, y + 1, z, [0x9fe8ff, 0xffffff], 20); api.events.emit('interact', { id: 'feuer:' + n, kind: 'fire' }); api.toast('Feuer ' + n + ' gelöscht!', '💦'); } });
  });
  // Piets Truhen
  chest(ctx, 'piet1', 150, -14, 0.4, { stars: 6, item: ['feder', 1] }, () => st('h_schatz') >= 0);
  chest(ctx, 'piet2', -54, 144, 0.3, { stars: 10, item: ['muschel', 2] }, () => st('h_schatz') >= 1);
  // Herz des Waldes: Boss-Altar
  spot(ctx, 'boss_altar', -182, -150, '🌑', 'Steinkreis: Wächter herausfordern', () => api.openPanel('bossAltar'), { r: 4, priority: 2 });
}
