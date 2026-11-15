// Fanwelten (Etappe 12): fertige, wählbare Welten rund um den Ursprung, jede weiter ausbaubar.
// Taschi-Land, Zotik: Lunaris, AnMaCha – der Podcast (Funkhaus-Stadt), Märchenwald. Drumherum liegt die normale Welt (Generator 4).
// Alle Häuser, Hallen und Höhlen sind begehbar (Türen, Leitern, Treppengänge), Räume groß und breit.
import { B, LOGO0 } from './blocks.js';
import { SEA } from './consts.js';
import { hash } from './noise.js';
import { biomeColumn } from './worldgen.js';
import { Plan, room, door, gableRoof, tower, cone, letters, tree, bigHouse, mound, hall, corridor, figure, stair, deco } from './blueprint.js';

export const FANWORLDS = {
  taschi: { name: 'Taschi-Land', emoji: '🐉', desc: 'Heilzentrum, Labor, Arena, Glimmstein-Höhle und Wiesen voller hohem Gras' },
  zotik: { name: 'Zotik: Lunaris', emoji: '🦊', desc: 'Dorf am Mondblick mit Kirche, Schmiede, Wirtshaus, Weltentor und Risshöhle im Mondwald', time: 0.36 },
  anmacha: { name: 'AnMaCha – der Podcast', emoji: '🎙️', desc: 'Funkhaus mit Studios, Sendemast, Bühne, Café und Plattenladen in der Funkstadt' },
  maerchen: { name: 'Märchenwald', emoji: '🏰', desc: 'Dornröschen-Schloss, Rapunzel-Turm, Hexenhaus, Großmutters Haus und die Zwergenmine' }
};
export const FAN_IDS = Object.keys(FANWORLDS);
const PAD_R = 72;
// Regionen rund um den Ursprung bleiben frei von zufälligen Dörfern, Minen und Höhlen
export const fanSkip = (rx, rz) => (rx === -1 || rx === 0) && (rz === -1 || rz === 0);

const cache = new Map();
export function fanBase(seed) {
  const h = biomeColumn(seed, 0, 0, {}).h;
  return Math.max(SEA + 4, Math.min(SEA + 14, h));
}
export function fanSpawn(id, seed) { const G = fanBase(seed); return { x: 0.5, y: G + 1.01, z: 9.5 }; }
export function fanPlan(id, seed) {
  const k = id + ',' + seed;
  if (!cache.has(k)) { if (cache.size > 8) cache.clear(); cache.set(k, build(id, seed)); }
  return cache.get(k);
}

const C = { white: B.CONCRETE0, black: B.CONCRETE1, red: B.CONCRETE2, orange: B.CONCRETE3, yellow: B.CONCRETE4, green: B.CONCRETE5, blue: B.CONCRETE6, purple: B.CONCRETE7 };

function build(id, seed) {
  const p = new Plan(), G = fanBase(seed), hh = (x, z) => hash(x, z, seed + 900);
  p.pad(-PAD_R, -PAD_R, PAD_R, PAD_R, G, B.GRASS, 10, true);
  const W = { taschi, zotik, anmacha, maerchen }[id];
  W(p, G, hh, seed);
  return p;
}

// ---------- gemeinsame Teile ----------
function path(p, x0, z0, x1, z1, y, t = B.PATH, w = 1) {
  if (x0 === x1) p.fill(x0 - w, y, Math.min(z0, z1), x0 + w, y, Math.max(z0, z1), t);
  else p.fill(Math.min(x0, x1), y, z0 - w, Math.max(x0, x1), y, z0 + w, t);
}
function plaza(p, r, y, t = B.PATH, edge = B.STONEBRICK) {
  for (let z = -r; z <= r; z++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, z); if (d <= r) p.set(x, y, z, d > r - 1 ? edge : t); }
}
function lamps(p, list, y, kind = 'streetlight') { for (const [x, z] of list) p.set(x, y + 1, z, deco(kind)); }
function forest(p, y, hh, leaves = B.LEAVES, r0 = 50, r1 = PAD_R + 6, density = 0.03, keep = () => false) {
  for (let z = -r1; z <= r1; z += 3) for (let x = -r1; x <= r1; x += 3) {
    const d = Math.hypot(x, z), jx = x + Math.floor(hh(x, z) * 3), jz = z + Math.floor(hh(z, x) * 3);
    if (d < r0 || d > r1 || hh(jx * 7, jz * 3) > density * 9 || keep(jx, jz)) continue;
    if (d > PAD_R) continue; // außerhalb der Ebene wächst die normale Welt
    let used = false; // nie in Häuser, Wege oder Hügel
    for (let dz = -3; dz <= 3 && !used; dz += 3) for (let dx = -3; dx <= 3 && !used; dx += 3) for (const yy of [y, y + 1, y + 3]) if (p.get(jx + dx, yy, jz + dz) !== undefined) used = true;
    if (used) continue;
    tree(p, jx, y + 1, jz, 4 + Math.floor(hh(jx, jz * 5) * 3), leaves, B.WOOD, 2);
  }
}
function grassField(p, y, hh, x0, z0, x1, z1, dens = 0.5) {
  for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (p.get(x, y + 1, z) === undefined && p.get(x, y, z) === undefined && hh(x * 3, z * 5) < dens) p.set(x, y + 1, z, B.TALLGRASS);
}
// Höhle in einem Hügel: Eingang in Richtung (fx, fz), Halle mit Kristallen und Laternen
function hillCave(p, cx, y, cz, r, fx, fz, hh, extra) {
  mound(p, cx, y, cz, r, 15, B.GRASS, hh);
  const fy = y + 1;
  hall(p, cx, fy, cz, r - 5, 8, r - 5, B.STONE, hh);
  corridor(p, cx, cz, cx + fx * (r + 1), cz + fz * (r + 1), fy, 5, 2, B.COBBLE);
  for (let k = 3; k < r; k += 4) for (const s of [-3, 3]) p.set(cx + fx * k + fz * s, fy + 3, cz + fz * k + fx * s, B.LANTERN); // Fackeln im Gang
  for (let z = cz - r + 5; z <= cz + r - 5; z++) for (let x = cx - r + 5; x <= cx + r - 5; x++) {
    if (p.get(x, fy, z) !== B.AIR) continue;
    const q = hh(x * 11, z * 13);
    if (q < 0.025) p.set(x, fy, z, B.CRYSTAL);
    else if (q < 0.03) { p.set(x, fy, z, B.FENCE); p.set(x, fy + 1, z, B.LANTERN); }
    let t = fy + 8; while (t > fy && p.get(x, t, z) !== B.AIR) t--;
    if (t > fy + 4 && hh(x * 5, z * 7) < 0.03) p.set(x, t, z, B.CRYSTAL);
    if (hh(x * 3, z * 2) < 0.02) p.set(x, fy - 1, z, q < 0.5 ? B.IRON : B.COPPER);
  }
  if (extra) extra(fy);
}

// ---------- Taschi-Land ----------
function taschi(p, G, hh) {
  plaza(p, 9, G);
  for (const [x0, z0, x1, z1] of [[0, -9, 0, -20], [0, 9, 0, 22], [-9, 0, -20, 0], [9, 0, 24, 0]]) path(p, x0, z0, x1, z1, G);
  // Riesen-Kapsel als Brunnen in der Mitte
  p.fill(-2, G + 1, -2, 2, G + 1, 2, B.STONEBRICK);
  for (let y = 0; y <= 8; y++) for (let z = -4; z <= 4; z++) for (let x = -4; x <= 4; x++) {
    const d = Math.hypot(x, y - 4, z); if (d > 4.3) continue;
    p.set(x, G + 2 + y, z, y === 4 ? C.black : y > 4 ? C.red : C.white);
  }
  for (const zz of [4, -4]) { p.fill(-1, G + 5, zz, 1, G + 7, zz, C.black); p.set(0, G + 6, zz, C.white); } // Knopf vorn und hinten
  lamps(p, [[-7, -7], [7, -7], [7, 7], [-7, 7]], G);
  // Heilzentrum (Norden), Labor (Westen), Taschi-Markt (Süden)
  bigHouse(p, 0, G, -27, 0, 1, { wall: C.white, post: C.red, floor: B.BIRCH, roof: 'BRICK', roofWall: C.white }, 'heil');
  p.fill(-1, G + 10, -20, 1, G + 10, -20, C.red); p.fill(0, G + 9, -20, 0, G + 11, -20, C.red); // rotes Kreuz über der Tür
  bigHouse(p, -27, G, 0, 1, 0, { wall: B.SMOOTH, post: B.BIRCH, floor: B.BIRCH, roof: 'SMOOTH', roofWall: B.SMOOTH }, 'labor');
  bigHouse(p, 0, G, 29, 0, -1, { wall: C.blue, post: C.white, floor: B.PLANKS, roof: 'SMOOTH', roofWall: C.blue }, 'laden');
  // Arena (Osten): Spielfeld mit Linien, Ränge aus Treppen, Flutlicht
  const ax = 40, az = 0, fw = 11, fl = 8;
  for (let z = az - fl; z <= az + fl; z++) for (let x = ax - fw; x <= ax + fw; x++) {
    const line = x === ax - fw || x === ax + fw || z === az - fl || z === az + fl || x === ax || (Math.hypot(x - ax, z - az) > 2.5 && Math.hypot(x - ax, z - az) < 3.5);
    p.set(x, G, z, line ? C.white : B.GRASS);
  }
  for (let k = 1; k <= 4; k++) {
    for (let x = ax - fw - k; x <= ax + fw + k; x++) { p.set(x, G + k, az - fl - k, stair('STONEBRICK', 2)); p.fill(x, G + 1, az - fl - k, x, G + k - 1, az - fl - k, B.STONEBRICK); p.set(x, G + k, az + fl + k, stair('STONEBRICK', 0)); p.fill(x, G + 1, az + fl + k, x, G + k - 1, az + fl + k, B.STONEBRICK); }
    for (let z = az - fl - k + 1; z <= az + fl + k - 1; z++) { if (Math.abs(z - az) <= 1) continue; p.set(ax + fw + k, G + k, z, stair('STONEBRICK', 3)); p.fill(ax + fw + k, G + 1, z, ax + fw + k, G + k - 1, z, B.STONEBRICK); }
  }
  for (const [x, z] of [[ax - fw - 4, az - fl - 4], [ax + fw + 4, az - fl - 4], [ax - fw - 4, az + fl + 4], [ax + fw + 4, az + fl + 4]]) { p.fill(x, G + 1, z, x, G + 10, z, B.IRONBLOCK); p.fill(x - 1, G + 11, z - 1, x + 1, G + 11, z + 1, B.LAMP); }
  p.fill(ax - 11, G + 1, az - fl - 5, ax + 11, G + 12, az - fl - 5, B.STONEBRICK);
  letters(p, 'ARENA', ax - 9, G + 11, az - fl - 4, 1, 0, C.red);
  // Taschi-Statuen auf Sockeln am Platz
  const pedestal = (x, z) => { p.fill(x - 2, G + 1, z - 2, x + 2, G + 1, z + 2, B.STONEBRICK); p.fill(x - 1, G + 2, z - 1, x + 1, G + 2, z + 1, B.SMOOTH); };
  const glutzahn = [[-1, 0, -2, 1, 2, 1, C.orange], [-1, 0, 1, 1, 1, 1, C.yellow], [-1, 2, 1, 1, 4, 3, C.orange], [-1, 2, 3, 1, 2, 3, C.yellow], [-1, 4, 3, -1, 4, 3, C.black], [1, 4, 3, 1, 4, 3, C.black],
    [-1, 5, 2, -1, 5, 2, C.white], [1, 5, 2, 1, 5, 2, C.white], [-3, 2, -1, -2, 3, 0, C.red], [2, 2, -1, 3, 3, 0, C.red], [0, 1, -4, 0, 1, -3, C.orange], [0, 2, -5, 0, 3, -5, B.MAGMA]];
  const plaetscher = [[-2, 0, -2, 2, 2, 2, C.blue], [-1, 0, 2, 1, 1, 2, C.yellow], [-1, 3, -1, 1, 5, 1, C.blue], [-1, 4, 2, 1, 4, 2, C.blue], [-1, 4, 2, -1, 4, 2, C.black], [1, 4, 2, 1, 4, 2, C.black], [0, 6, -1, 0, 6, 1, B.ICE], [-2, 1, -3, 2, 1, -3, B.ICE]];
  const samen = [[-2, 0, -2, 2, 2, 2, C.green], [-1, 3, -1, 1, 4, 1, C.green], [-1, 4, 2, -1, 4, 2, C.black], [1, 4, 2, 1, 4, 2, C.black], [0, 5, 0, 0, 6, 0, B.WOOD], [-1, 7, -1, 1, 7, 1, B.LEAVES], [0, 8, 0, 0, 8, 0, B.FLOWERS]];
  const pelzlo = [[-2, 0, -2, 2, 3, 2, B.WOOL], [-1, 3, 2, -1, 3, 2, C.black], [1, 3, 2, 1, 3, 2, C.black], [0, 2, 3, 0, 2, 3, C.red], [-2, 4, 0, -2, 5, 0, B.CLAY], [2, 4, 0, 2, 5, 0, B.CLAY], [0, 1, -3, 0, 2, -3, B.WOOL]];
  for (const [x, z, f] of [[-13, -13, glutzahn], [13, -13, plaetscher], [-13, 13, samen], [13, 13, pelzlo]]) { pedestal(x, z); figure(p, x, G + 3, z, f, 0); }
  // Glimmstein-Höhle im Hügel (Nordwesten), Eingang nach Südosten
  hillCave(p, -42, G, -40, 18, 1, 0, hh, fy => { p.set(-42, fy, -40, B.CAPSULE); p.set(-42, fy + 1, -40, deco('chest')); });
  // Wiesen mit hohem Gras, Bäume am Rand
  grassField(p, G, hh, -60, -10, -14, 60, 0.45); grassField(p, G, hh, 14, 14, 60, 60, 0.45); grassField(p, G, hh, 14, -60, 60, -16, 0.4);
  forest(p, G, hh, B.LEAVES, 54);
}

// ---------- Zotik: Lunaris ----------
function zotik(p, G, hh) {
  plaza(p, 10, G, B.STONEBRICK, B.MOONSTONE);
  for (const [x0, z0, x1, z1] of [[0, -10, 0, -18], [0, 10, 0, 22], [-10, 0, -18, 0], [10, 0, 18, 0]]) path(p, x0, z0, x1, z1, G, B.GRAVEL);
  lamps(p, [[-8, -8], [8, -8], [8, 8], [-8, 8], [-3, 16], [3, 16]], G);
  // Zotik-Statue: aufrechter oranger Fuchs mit grünem Schal, Weste, Reiseklinge mit Kristall und buschigem Schwanz
  p.fill(-4, G + 1, -4, 4, G + 2, 4, B.STONEBRICK); p.fill(-3, G + 3, -3, 3, G + 3, 3, B.SMOOTH);
  const O = C.orange, Wt = C.white;
  figure(p, 0, G + 4, 0, [
    [-2, 0, -1, -1, 1, 1, B.DARKPLANKS], [1, 0, -1, 2, 1, 1, B.DARKPLANKS], [-2, 2, -1, -1, 4, 0, O], [1, 2, -1, 2, 4, 0, O],
    [-2, 5, -1, 2, 9, 1, O], [-1, 5, 1, 1, 8, 1, Wt], [-2, 6, -1, -2, 9, 1, B.DARKPLANKS], [2, 6, -1, 2, 9, 1, B.DARKPLANKS],
    [-3, 6, 0, -3, 9, 0, O], [3, 6, 0, 3, 9, 0, O], [-2, 10, -2, 2, 10, 2, C.green], [1, 7, -2, 1, 9, -2, C.green],
    [-2, 11, -2, 2, 14, 2, O], [-1, 11, 3, 1, 12, 4, Wt], [0, 12, 5, 0, 12, 5, C.black], [-1, 13, 3, -1, 13, 3, C.black], [1, 13, 3, 1, 13, 3, C.black],
    [-2, 15, 0, -1, 16, 0, O], [1, 15, 0, 2, 16, 0, O], [-2, 17, 0, -2, 17, 0, C.black], [2, 17, 0, 2, 17, 0, C.black],
    [-2, 3, -3, 2, 7, -5, O], [-1, 6, -6, 1, 9, -7, O], [-1, 9, -7, 1, 10, -8, Wt],
    [4, 6, 1, 4, 7, 1, B.DARKPLANKS], [4, 8, 1, 4, 8, 1, B.CRYSTAL], [4, 9, 1, 4, 15, 1, B.IRONBLOCK]
  ], 0);
  // Kirche (Norden): Schiff aus Steinziegeln mit Buntglas, Glockenturm, Bänke, Altar mit Gold
  const kz0 = -44, kz1 = -22, kx = 6;
  room(p, -kx, G, kz0, kx, G + 8, kz1, { wall: B.STONEBRICK, post: B.SMOOTH, floor: B.SMOOTH, base: B.STONEBRICK });
  for (let z = kz0 + 3; z <= kz1 - 3; z += 4) for (const x of [-kx, kx]) p.fill(x, G + 3, z, x, G + 6, z + 1, B.STAINED1);
  gableRoof(p, -kx, kz0, kx, kz1, G + 9, 'STONEBRICK', B.STONEBRICK, false);
  door(p, 0, G + 1, kz1);
  p.fill(-2, G + 6, kz1, 2, G + 7, kz1, B.STAINED1);
  for (let z = kz1 - 4; z >= kz0 + 7; z -= 2) for (const x of [-4, -3, 3, 4]) p.set(x, G + 1, z, deco('bench'));
  p.fill(-2, G + 1, kz0 + 2, 2, G + 1, kz0 + 3, B.MARBLE); p.set(0, G + 2, kz0 + 2, B.GOLDBLOCK); p.set(-2, G + 2, kz0 + 2, deco('candles')); p.set(2, G + 2, kz0 + 2, deco('candles'));
  for (let z = kz1 - 1; z >= kz0 + 4; z--) p.set(0, G + 1, z, deco('rug'));
  for (const z of [kz0 + 5, kz0 + 11, kz1 - 4]) p.set(0, G + 7, z, B.LANTERN);
  room(p, kx + 1, G, kz1 - 6, kx + 7, G + 22, kz1, { wall: B.STONEBRICK, post: B.SMOOTH, floor: B.SMOOTH }); // Turm
  for (let y = G + 1; y <= G + 21; y++) p.set(kx + 6, y, kz1 - 3, B.LADDER);
  p.fill(kx, G + 1, kz1 - 3, kx + 1, G + 2, kz1 - 3, B.AIR); // Durchgang Kirche → Turm
  for (const y of [G + 7, G + 14]) p.fill(kx + 2, y, kz1 - 5, kx + 5, y, kz1 - 1, B.PLANKS);
  p.fill(kx + 2, G + 18, kz1 - 6, kx + 6, G + 20, kz1 - 6, B.AIR); p.fill(kx + 2, G + 18, kz1, kx + 6, G + 20, kz1, B.AIR);
  p.set(kx + 4, G + 21, kz1 - 3, B.GOLDBLOCK);
  for (let k = 0; k < 4; k++) p.fill(kx + 1 + k, G + 23 + k, kz1 - 6 + k, kx + 7 - k, G + 23 + k, kz1 - k, B.MOONSTONE);
  // Schmiede, Wirtshaus „Zum Mondfuchs“, Magieladen, Wohnhaus
  bigHouse(p, -28, G, 2, 1, 0, { wall: B.COBBLE, post: B.DARKPLANKS, roof: 'COBBLE', roofWall: B.COBBLE }, 'schmied');
  bigHouse(p, 28, G, 2, -1, 0, { wall: B.DARKPLANKS, post: B.WOOD, roof: 'BRICK', roofWall: B.DARKPLANKS }, 'wirt');
  bigHouse(p, -24, G, 30, 0, -1, { wall: B.MOONSTONE, post: B.DARKPLANKS, floor: B.DARKPLANKS, roof: 'DARKPLANKS', roofWall: B.MOONSTONE }, 'laden');
  bigHouse(p, 24, G, 30, 0, -1, { wall: B.PLANKS, post: B.WOOD, roof: 'DARKPLANKS', roofWall: B.PLANKS }, 'wohnen');
  // Weltentor: Ring aus Mondstein auf einer Plattform, Tor aus blauem Glas
  const tz = 22;
  p.fill(-7, G + 1, tz - 2, 7, G + 1, tz + 2, B.STONEBRICK);
  for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
    const d = Math.hypot(x, y); const yy = G + 9 + y;
    if (d >= 5.5 && d <= 7.2 && yy > G + 1) p.set(x, yy, tz, (x + y) % 4 === 0 ? B.CRYSTAL : B.MOONSTONE);
    else if (d < 5.5 && yy > G + 1) p.set(x, yy, tz, B.STAINED1);
  }
  // Mondwald und Risshöhle (Nordosten, Eingang nach Westen)
  hillCave(p, 44, G, -40, 18, -1, 0, hh, fy => { for (const [x, z] of [[40, -44], [48, -36], [44, -46], [40, -36]]) p.fill(x, fy, z, x, fy + 6, z, B.MOONSTONE); p.set(44, fy, -40, deco('chest')); });
  forest(p, G, hh, B.MOONLEAVES, 40, PAD_R + 6, 0.05);
}

// ---------- AnMaCha – der Podcast: Funkhaus-Stadt ----------
function anmacha(p, G, hh) {
  // Straßen mit Mittellinie, Gehwege
  for (const [x0, z0, x1, z1, alongX] of [[-70, 0, 70, 0, 1], [0, -16, 0, 70, 0]]) {
    for (let s = -3; s <= 3; s++) for (let q = alongX ? x0 : z0; q <= (alongX ? x1 : z1); q++) {
      const t = Math.abs(s) === 3 ? B.SMOOTH : s === 0 && q % 4 < 2 ? C.white : C.black;
      alongX ? p.set(q, G, s, t) : p.set(s, G, q, t);
    }
    for (const s of [-5, -4, 4, 5]) for (let q = alongX ? x0 : z0; q <= (alongX ? x1 : z1); q++) alongX ? p.set(q, G, s, B.SMOOTH) : p.set(s, G, q, B.SMOOTH); // Gehwege
  }
  p.fill(-17, G, -38, 17, G, -11, B.SMOOTH); p.fill(-12, G, 38, 12, G, 62, B.SMOOTH); // Vorplatz Funkhaus, Platz vor der Bühne
  for (const x of [-30, -15, 15, 30]) { p.set(x, G + 1, -4, deco('streetlight')); p.set(x, G + 1, 4, deco('streetlight')); }
  for (const z of [14, 28, 42]) { p.set(-4, G + 1, z, deco('streetlight')); p.set(4, G + 1, z, deco('streetlight')); }
  p.set(4, G + 1, -4, deco('trafficlight')); p.set(-4, G + 1, 4, deco('trafficlight'));
  for (const [x, z, k] of [[-10, -5, 'bench'], [10, -5, 'bench'], [-20, 5, 'hydrant'], [20, 5, 'trash'], [-5, 20, 'bench'], [5, 34, 'hydrant']]) p.set(x, G + 1, z, deco(k));
  // Funkhaus: drei Etagen, Glasfront, Lobby mit Senderwand, Studios mit Schaumstoff und On-Air-Schild, Dachterrasse mit Leuchtschrift
  const x0 = -15, x1 = 15, z0 = -34, z1 = -12, FH = 6;
  for (let f = 0; f < 3; f++) room(p, x0, G + f * FH, z0, x1, G + (f + 1) * FH, z1, { wall: C.white, post: C.black, floor: f ? B.DARKPLANKS : B.MARBLE, base: C.black, ceil: B.SMOOTH });
  for (let f = 0; f < 3; f++) for (let x = x0 + 1; x < x1; x++) for (let y = G + f * FH + 1; y <= G + f * FH + 4; y++) { if ((x - x0) % 6 !== 0) p.set(x, y, z1, B.GLASS); }
  for (let y = G + 1; y <= G + 3; y++) for (let x = -2; x <= 2; x++) p.set(x, y, z1, B.AIR);
  // Lobby
  for (let i = 0; i < 16; i++) p.set(-8 + i + (i >= 8 ? 1 : 0), G + 2 + (i % 2), z0 + 1, LOGO0 + i); // Senderwand mit 16 Funk-Logos
  for (let x = -9; x <= 9; x++) for (const y of [G + 1, G + 4]) p.set(x, y, z0 + 1, C.black);
  for (const u of [-3, -2, -1, 0, 1, 2, 3]) p.set(u, G + 1, z0 + 6, deco('cabinet'));
  p.set(0, G + 2, z0 + 6, deco('tablelamp')); p.set(-6, G + 1, z1 - 3, deco('couch')); p.set(6, G + 1, z1 - 3, deco('couch')); p.set(-6, G + 1, z1 - 5, deco('table')); p.set(6, G + 1, z1 - 5, deco('table'));
  for (const [x, z] of [[-13, z1 - 2], [13, z1 - 2], [-13, z0 + 2], [13, z0 + 2]]) p.set(x, G + 1, z, deco('bush'));
  for (const [x, z] of [[-8, -24], [8, -24], [0, -18]]) for (let f = 0; f < 3; f++) p.set(x, G + f * FH + 5, z, B.LANTERN);
  // Leitern zwischen den Etagen (Ostseite)
  for (let y = G + 1; y <= G + 2 * FH + 1; y++) p.set(x1 - 1, y, z0 + 3, B.LADDER);
  // 1. Etage: zwei Studios
  const S1 = G + FH;
  for (const [sx0, sx1] of [[x0 + 1, -2], [2, x1 - 2]]) {
    for (let y = S1 + 1; y <= S1 + 5; y++) for (let x = sx0; x <= sx1; x++) { p.set(x, y, z0 + 1, B.FOAM); p.set(x, y, z0 + 11, x === Math.round((sx0 + sx1) / 2) && y <= S1 + 2 ? B.AIR : B.FOAM); }
    for (let y = S1 + 1; y <= S1 + 5; y++) for (let z = z0 + 1; z <= z0 + 11; z++) { p.set(sx0, y, z, B.FOAM); p.set(sx1, y, z, B.FOAM); }
    const mx = Math.round((sx0 + sx1) / 2);
    p.set(mx, S1 + 4, z0 + 12, B.ONAIR);
    for (const x of [mx - 2, mx + 2]) { p.set(x, S1 + 1, z0 + 5, deco('tablelong')); p.set(x, S1 + 2, z0 + 5, deco('tablelamp')); p.set(x, S1 + 1, z0 + 6, deco('armchair')); p.set(x, S1 + 1, z0 + 4, deco('armchair')); }
    p.set(mx, S1 + 1, z0 + 8, deco('rug')); p.set(mx, S1 + 4, z0 + 6, B.LANTERN); p.set(sx0 + 1, S1 + 1, z0 + 2, deco('shelf')); p.set(mx, S1 + 3, z0 + 2, deco('picture'));
  }
  p.fill(x1 - 1, S1, z0 + 3, x1 - 1, S1, z0 + 3, B.LADDER);
  // 2. Etage: Lounge
  const S2 = G + 2 * FH;
  p.set(x1 - 1, S2, z0 + 3, B.LADDER);
  for (const x of [-8, 0, 8]) { p.set(x, S2 + 1, -24, deco('couch')); p.set(x, S2 + 1, -22, deco('table')); p.set(x, S2 + 2, -22, deco('books')); }
  p.set(-12, S2 + 1, -30, deco('keg')); p.set(12, S2 + 1, -30, deco('crates')); p.set(-12, S2 + 1, -16, deco('lamp')); p.set(12, S2 + 1, -16, deco('lamp'));
  // Dach: Leuchtschrift ANMACHA, Antenne
  const R = G + 3 * FH;
  p.fill(-14, R + 1, z1, 14, R + 6, z1, C.black);
  letters(p, 'ANMACHA', -13, R + 6, z1 + 1, 1, 0, B.NEON_P);
  p.fill(10, R + 1, -28, 10, R + 10, -28, B.IRONBLOCK); p.set(10, R + 11, -28, B.NEON_R);
  // Sendemast (Nordosten): Gittermast bis fast an den Himmel, rote Lichter
  const mx = 40, mz = -36, top = Math.min(92, G + 60);
  for (let y = G + 1; y <= top; y++) {
    const w = Math.max(1, Math.round(4 - (y - G) / 16));
    for (const [dx, dz] of [[-w, -w], [w, -w], [w, w], [-w, w]]) p.set(mx + dx, y, mz + dz, B.IRONBLOCK);
    if ((y - G) % 6 === 0) for (let k = -w; k <= w; k++) { p.set(mx + k, y, mz - w, B.IRONBLOCK); p.set(mx + k, y, mz + w, B.IRONBLOCK); p.set(mx - w, y, mz + k, B.IRONBLOCK); p.set(mx + w, y, mz + k, B.IRONBLOCK); }
    if ((y - G) % 12 === 0) p.set(mx, y, mz, B.NEON_R);
  }
  p.set(mx, top + 1, mz, B.NEON_R);
  for (let y = G + 1; y <= G + 20; y++) p.set(mx, y, mz - 4, B.LADDER);
  p.fill(mx - 4, G + 21, mz - 4, mx + 4, G + 21, mz + 4, B.IRONBLOCK); p.set(mx, G + 21, mz - 4, B.LADDER); p.set(mx, G + 22, mz - 4, B.LADDER);
  // Bühne „Podcast live“ (Süden)
  const bz = 50;
  p.fill(-9, G + 1, bz, 9, G + 2, bz + 6, B.DARKPLANKS);
  for (let x = -9; x <= 9; x++) p.set(x, G + 1, bz - 1, stair('DARKPLANKS', 0));
  p.fill(-9, G + 3, bz + 7, 9, G + 12, bz + 7, B.FOAM);
  for (const x of [-8, 8]) { p.fill(x, G + 3, bz + 6, x, G + 5, bz + 6, B.FOAM); p.set(x, G + 6, bz + 6, B.NEON_B); }
  p.fill(-9, G + 13, bz, 9, G + 13, bz, B.IRONBLOCK); for (const x of [-9, 9]) p.fill(x, G + 3, bz, x, G + 12, bz, B.IRONBLOCK);
  for (let x = -7; x <= 7; x += 2) p.set(x, G + 12, bz, x % 4 === 1 ? B.NEON_P : B.LAMP);
  letters(p, 'LIVE', 7, G + 11, bz + 6, -1, 0, B.ONAIR); // Publikum blickt nach +z: Schrift läuft nach -x
  p.set(0, G + 3, bz + 3, deco('tablelong')); p.set(-1, G + 3, bz + 4, deco('armchair')); p.set(1, G + 3, bz + 4, deco('armchair')); p.set(0, G + 4, bz + 3, deco('tablelamp'));
  for (let z = bz - 12; z <= bz - 4; z += 2) for (let x = -8; x <= 8; x += 2) if (Math.abs(x) > 1) p.set(x, G + 1, z, deco('stool'));
  // Café und Plattenladen
  bigHouse(p, -32, G, 20, 1, 0, { wall: C.orange, post: C.white, floor: B.BIRCH, roof: 'SMOOTH', roofWall: C.orange }, 'wirt');
  bigHouse(p, 32, G, 20, -1, 0, { wall: C.purple, post: C.black, floor: B.DARKPLANKS, roof: 'SMOOTH', roofWall: C.purple }, 'funker');
  for (const [x, z] of [[-45, -45], [-50, 40], [50, 45], [-55, -10], [55, -10]]) tree(p, x, G + 1, z, 5, B.LEAVES, B.WOOD, 2);
}

// ---------- Märchenwald ----------
function maerchen(p, G, hh) {
  plaza(p, 7, G, B.PATH, B.COBBLE);
  for (const [x0, z0, x1, z1] of [[0, -7, 0, -24], [0, 7, 0, 30], [-7, 0, -26, 0], [7, 0, 30, 0]]) path(p, x0, z0, x1, z1, G);
  // Froschkönig-Brunnen mit goldener Kugel
  for (let z = -3; z <= 3; z++) for (let x = -3; x <= 3; x++) { const d = Math.hypot(x, z); if (d <= 3.4) p.set(x, G + 1, z, d > 2.4 ? B.MARBLE : B.WATER); }
  p.fill(0, G + 1, 0, 0, G + 3, 0, B.MARBLE); p.set(0, G + 4, 0, B.GOLDBLOCK); p.set(2, G + 2, 0, C.green);
  // Dornröschen-Schloss (Norden): Mauer mit Zinnen, vier Rundtürme, Torhaus, Thronsaal
  const sx0 = -16, sx1 = 16, sz0 = -60, sz1 = -30;
  for (let z = sz0; z <= sz1; z++) for (let x = sx0; x <= sx1; x++) {
    const edge = x === sx0 || x === sx1 || z === sz0 || z === sz1;
    p.set(x, G, z, edge ? B.STONEBRICK : B.PATH);
    if (edge) { p.fill(x, G + 1, z, x, G + 7, z, B.STONEBRICK); if ((x + z) % 2 === 0) p.set(x, G + 8, z, B.STONEBRICK); }
  }
  for (const [x, z] of [[sx0, sz0], [sx1, sz0], [sx0, sz1], [sx1, sz1]]) {
    tower(p, x, G, z, 3, 15, B.STONEBRICK, { floors: 5, floor: B.PLANKS });
    cone(p, x, G + 15, z, 3, C.blue);
    const gx = x < 0 ? 1 : -1, gz = z < -45 ? 1 : -1; // Richtung Hof
    for (let y = G + 1; y <= G + 14; y++) p.set(x - gx * 2, y, z, B.LADDER); // Leiter an der Außenwand
    for (let k = 1; k <= 3; k++) for (const y of [G + 1, G + 2]) p.set(x + gx * k, y, z + gz * k, B.AIR); // Zugang vom Hof
  }
  p.fill(-2, G + 1, sz1, 2, G + 5, sz1, B.AIR); // Tor
  p.fill(-3, G + 6, sz1, 3, G + 10, sz1, B.STONEBRICK); for (let x = -3; x <= 3; x += 2) p.set(x, G + 11, sz1, B.STONEBRICK);
  for (const x of [-4, 4]) p.set(x, G + 4, sz1 + 1, deco('torch'));
  // Thronsaal
  const tz0 = sz0 + 3, tz1 = sz0 + 17, tx = 8;
  room(p, -tx, G, tz0, tx, G + 9, tz1, { wall: B.MARBLE, post: B.STONEBRICK, floor: B.MARBLE, ceil: B.STONEBRICK });
  gableRoof(p, -tx, tz0, tx, tz1, G + 10, 'STONEBRICK', B.MARBLE, false);
  door(p, 0, G + 1, tz1);
  for (let z = tz0 + 3; z <= tz1 - 2; z += 3) for (const x of [-tx, tx]) p.fill(x, G + 3, z, x, G + 6, z, B.STAINED0);
  for (let z = tz1 - 1; z >= tz0 + 3; z--) p.set(0, G + 1, z, deco('rug'));
  p.fill(-2, G + 1, tz0 + 1, 2, G + 1, tz0 + 2, B.GOLDBLOCK); p.set(0, G + 2, tz0 + 1, stair('MARBLE', 0)); p.set(-1, G + 2, tz0 + 1, B.GOLDBLOCK); p.set(1, G + 2, tz0 + 1, B.GOLDBLOCK);
  p.set(0, G + 4, tz0 + 1, deco('banner')); p.set(-3, G + 4, tz0 + 1, deco('banner')); p.set(3, G + 4, tz0 + 1, deco('banner'));
  for (const x of [-5, 5]) for (let z = tz0 + 5; z <= tz1 - 3; z += 4) { p.set(x, G + 1, z, deco('tablelong')); p.set(x, G + 2, z, deco('candles')); p.set(x - 1, G + 1, z, deco('chair')); p.set(x + 1, G + 1, z, deco('chair')); }
  for (const z of [tz0 + 4, tz0 + 9, tz1 - 3]) p.set(0, G + 8, z, B.LANTERN);
  // Dornröschens Schlafgemach im Westflügel
  room(p, sx0 + 1, G, sz1 - 9, sx0 + 9, G + 6, sz1 - 1, { wall: B.MARBLE, post: B.STONEBRICK, floor: B.BIRCH, ceil: B.STONEBRICK });
  door(p, sx0 + 9, G + 1, sz1 - 5); p.set(sx0 + 4, G + 1, sz1 - 6, deco('bed')); p.set(sx0 + 2, G + 1, sz1 - 3, deco('cabinet')); p.set(sx0 + 2, G + 2, sz1 - 3, deco('candles'));
  p.set(sx0 + 6, G + 1, sz1 - 4, deco('rug')); p.set(sx0 + 5, G + 5, sz1 - 5, B.LANTERN);
  // Rosenhecke rund ums Schloss
  for (let z = sz0 - 4; z <= sz1 + 4; z++) for (let x = sx0 - 4; x <= sx1 + 4; x++) {
    const ring = x === sx0 - 4 || x === sx1 + 4 || z === sz0 - 4 || z === sz1 + 4;
    if (ring && !(Math.abs(x) <= 2 && z === sz1 + 4)) p.fill(x, G + 1, z, x, G + 2, z, B.ROSELEAVES);
  }
  path(p, 0, sz1 + 1, 0, -7, G);
  // Rapunzel-Turm (Osten): hoch, mit Etagen und Leiter bis zum Fenster ganz oben
  const rx = 40, rz = -12;
  tower(p, rx, G, rz, 3, 28, B.STONEBRICK, { floors: 7, floor: B.PLANKS });
  cone(p, rx, G + 28, rz, 3, C.purple);
  for (let y = G + 1; y <= G + 27; y++) p.set(rx + 2, y, rz, B.LADDER);
  p.fill(rx - 3, G + 1, rz, rx - 3, G + 2, rz, B.AIR); door(p, rx - 3, G + 1, rz);
  p.fill(rx, G + 23, rz - 3, rx, G + 24, rz - 3, B.AIR); p.set(rx, G + 22, rz + 1, deco('bed')); p.set(rx - 1, G + 22, rz - 1, deco('candles')); p.set(rx - 1, G + 26, rz, B.LANTERN);
  for (let k = 0; k < 18; k++) p.set(rx, G + 22 - k, rz - 4, k % 2 ? B.HAY : C.yellow); // Rapunzels Zopf
  // Hexenhaus (Westen): Lebkuchen mit Zuckerguss, Ofen und Käfig
  bigHouse(p, -34, G, 6, 1, 0, { wall: B.GINGERBREAD, post: B.ICING, floor: B.PLANKS, base: B.ICING, roof: 'MARBLE', roofWall: B.ICING }, 'wohnen');
  p.set(-38, G + 1, 9, B.FURNACE); p.set(-37, G + 1, 9, B.FURNACE);
  for (const [x, z] of [[-30, 2], [-30, 3]]) p.fill(x, G + 1, z, x, G + 2, z, B.FENCE);
  for (const z of [3, 4, 8, 9]) for (const y of [G + 2, G + 3]) p.set(-28, y, z, (z + y) % 2 ? B.STAINED0 : B.STAINED2); // Bonbon-Fenster
  // Großmutters Haus im Wald (Südosten)
  bigHouse(p, 34, G, 34, -1, 0, { wall: B.PLANKS, post: B.WOOD, roof: 'BRICK', roofWall: B.PLANKS }, 'wohnen');
  path(p, 28, 0, 28, 33, G); p.fill(26, G, 32, 27, G, 34, B.PATH);
  // Sieben-Zwerge-Mine im Hügel (Südwesten): sieben Betten, langer Tisch, Erz und Schienen
  hillCave(p, -40, G, 42, 18, 1, 0, hh, fy => {
    for (let k = 0; k < 7; k++) { p.set(-46 + k * 2, fy, 34, deco('bed')); p.set(-46 + k * 2, fy, 36, deco('candles')); }
    for (let k = 0; k < 7; k++) p.set(-46 + k * 2, fy, 44, deco('stool'));
    p.set(-42, fy, 43, deco('tablelong')); p.set(-40, fy, 43, deco('tablelong')); p.set(-44, fy, 43, deco('tablelong'));
    for (let x = -50; x <= -34; x++) p.set(x, fy, 48, B.RAIL);
    for (const [x, z] of [[-48, 40], [-33, 38], [-36, 47]]) { p.set(x, fy, z, B.IRON); p.set(x, fy + 1, z, B.CRYSTAL); }
  });
  forest(p, G, hh, B.LEAVES, 48, PAD_R + 6, 0.05);
  for (const [x, z] of [[18, 40], [24, 46], [44, 26], [46, 44]]) tree(p, x, G + 1, z, 6, B.ROSELEAVES, B.WOOD, 2);
}
