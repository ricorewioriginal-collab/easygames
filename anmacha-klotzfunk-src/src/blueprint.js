// Baupläne (Etappe 12): große, begehbare Gebäude und Höhlen im Klötzchen-Stil für Generator 4 und die Fanwelten.
// Ein Plan sammelt Blöcke in Weltkoordinaten (nach Chunk sortiert) und Ebnungsflächen; ein Chunk übernimmt beim Erzeugen nur seinen Teil.
// Alles hängt nur von Seed und Position ab: gleiche Welt, egal in welcher Reihenfolge die Chunks entstehen.
import { B, FORM_MATS } from './blocks.js';
import { CS, H } from './consts.js';

const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);
const STAIR_MAT = Object.fromEntries(FORM_MATS.map(([k], i) => [k, 109 + i * 4]));
// Treppe aus Material k, steigt in Richtung d (0 = −z, 1 = +x, 2 = +z, 3 = −x)
export const stair = (k, d) => STAIR_MAT[k] + (d & 3);
export const slab = k => 101 + FORM_MATS.findIndex(m => m[0] === k);
export const deco = k => B['DECO_' + k.toUpperCase()];

export class Plan {
  constructor() { this.by = new Map(); this.pads = []; this.box = null; }
  set(x, y, z, t) {
    if (y < 1 || y >= H || t == null) return;
    const k = ck(x >> 4, z >> 4);
    let m = this.by.get(k);
    if (!m) { m = new Map(); this.by.set(k, m); }
    m.set((x & 15) + ((z & 15) << 4) + (y << 8), t);
    const b = this.box;
    if (!b) this.box = [x, z, x, z]; else { if (x < b[0]) b[0] = x; if (z < b[1]) b[1] = z; if (x > b[2]) b[2] = x; if (z > b[3]) b[3] = z; }
  }
  get(x, y, z) { const m = this.by.get(ck(x >> 4, z >> 4)); return m ? m.get((x & 15) + ((z & 15) << 4) + (y << 8)) : undefined; }
  fill(x0, y0, z0, x1, y1, z1, t) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, z, t);
  }
  // nur leere Stellen des Plans füllen (z. B. Gelände unter Bauten)
  fillSoft(x0, y0, z0, x1, y1, z1, t) {
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (this.get(x, y, z) === undefined) this.set(x, y, z, t);
  }
  // Fläche einebnen: innen auf Höhe y mit Deckblock top, am Rand (edge Blöcke) weich ins Gelände; darüber wird freigeräumt
  pad(x0, z0, x1, z1, y, top = B.GRASS, edge = 5, round = false) { this.pads.push({ x0, z0, x1, z1, y, top, edge, round }); }
  touches(cx, cz) {
    if (this.by.has(ck(cx, cz))) return true;
    const X0 = cx * CS, Z0 = cz * CS;
    return this.pads.some(p => p.x1 + p.edge >= X0 && p.x0 - p.edge < X0 + CS && p.z1 + p.edge >= Z0 && p.z0 - p.edge < Z0 + CS);
  }
  // In einen frisch erzeugten Chunk übernehmen. groundAt(x, z) = natürliche Geländehöhe. Rückgabe: höchste belegte y
  apply(cx, cz, data, groundAt, maxY, onBlock) {
    const X0 = cx * CS, Z0 = cz * CS;
    let top = maxY;
    for (const p of this.pads) {
      if (!(p.x1 + p.edge >= X0 && p.x0 - p.edge < X0 + CS && p.z1 + p.edge >= Z0 && p.z0 - p.edge < Z0 + CS)) continue;
      for (let z = Z0; z < Z0 + CS; z++) for (let x = X0; x < X0 + CS; x++) {
        let d;
        if (p.round) { const cx2 = (p.x0 + p.x1) / 2, cz2 = (p.z0 + p.z1) / 2, r = (p.x1 - p.x0) / 2; d = Math.max(0, Math.hypot(x - cx2, z - cz2) - r); }
        else d = Math.max(0, p.x0 - x, x - p.x1, p.z0 - z, z - p.z1);
        if (d > p.edge) continue;
        const ho = groundAt(x, z), ht = d === 0 ? p.y : Math.round(p.y + (ho - p.y) * d / p.edge);
        const base = (x - X0) + (z - Z0) * CS;
        for (let y = Math.max(1, Math.min(ho + 1, ht - 4)); y < ht; y++) data[base + y * CS * CS] = y < ht - 3 ? B.STONE : B.DIRT;
        data[base + ht * CS * CS] = p.top;
        for (let y = ht + 1, end = Math.min(H - 1, Math.max(ho, ht) + 22); y <= end; y++) data[base + y * CS * CS] = B.AIR;
        if (ht > top) top = ht;
      }
    }
    const m = this.by.get(ck(cx, cz));
    if (m) for (const [i, t] of m) {
      data[i] = t;
      const y = i >> 8;
      if (t && y > top) top = y;
      if (t === B.RADIO && onBlock) onBlock(X0 + (i & 15), y, Z0 + ((i >> 4) & 15), t);
    }
    return top;
  }
}

// ---------- Bauteile ----------
// Raum: Boden, Wände (Ecken als Pfosten), Decke; innen Luft
export function room(p, x0, y0, z0, x1, y1, z1, o = {}) {
  const wall = o.wall ?? B.PLANKS, post = o.post ?? wall, floor = o.floor ?? B.PLANKS, ceil = o.ceil;
  for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
    const ex = x === x0 || x === x1, ez = z === z0 || z === z1;
    let t = B.AIR;
    if (y === y0) t = ex || ez ? (o.base ?? floor) : floor;
    else if (y === y1 && ceil != null) t = ceil;
    else if (ex && ez) t = post;
    else if (ex || ez) t = wall;
    p.set(x, y, z, t);
  }
}
// Fensterreihe in einer Wand (zwischen a und b entlang der Wand, Abstand step)
export function windows(p, x0, z0, x1, z1, y0, y1, t = B.PANE, step = 3, w = 2) {
  const alongX = z0 === z1, a = alongX ? x0 : z0, b = alongX ? x1 : z1;
  for (let s = a + 2; s + w - 1 <= b - 2; s += step + w - 1) for (let k = 0; k < w; k++) for (let y = y0; y <= y1; y++) {
    const q = s + k; if (q >= b - 1) continue;
    if (alongX) p.set(q, y, z0, t); else p.set(x0, y, q, t);
  }
}
export function door(p, x, y, z) { p.set(x, y, z, B.DOOR); p.set(x, y + 1, z, B.DOOR); }
// Satteldach aus Treppen (First entlang x oder z), Giebel aus wall; mat = Treppen-Material, ridge = Block am First
export function gableRoof(p, x0, z0, x1, z1, y, mat, wall, alongX = true, ridge = null) {
  const w = alongX ? z1 - z0 : x1 - x0, steps = Math.ceil((w + 1) / 2);
  for (let k = 0; k <= steps; k++) {
    const yy = y + k, lo = (alongX ? z0 : x0) - 1 + k, hi = (alongX ? z1 : x1) + 1 - k;
    if (lo > hi) break;
    for (let s = (alongX ? x0 : z0) - 1; s <= (alongX ? x1 : z1) + 1; s++) {
      const gable = s === (alongX ? x0 : z0) || s === (alongX ? x1 : z1);
      if (lo === hi) { alongX ? p.set(s, yy, lo, ridge ?? stairBlock(mat)) : p.set(lo, yy, s, ridge ?? stairBlock(mat)); continue; }
      if (alongX) { p.set(s, yy, lo, stair(mat, 2)); p.set(s, yy, hi, stair(mat, 0)); }
      else { p.set(lo, yy, s, stair(mat, 1)); p.set(hi, yy, s, stair(mat, 3)); }
      if (gable) for (let q = lo + 1; q < hi; q++) alongX ? p.set(s, yy, q, wall) : p.set(q, yy, s, wall);
    }
    if (lo + 1 === hi) { // gerade Breite: First als volle Reihe obendrauf
      for (let s = (alongX ? x0 : z0) - 1; s <= (alongX ? x1 : z1) + 1; s++) alongX ? (p.set(s, yy + 1, lo, slabOf(mat)), p.set(s, yy + 1, hi, slabOf(mat))) : (p.set(lo, yy + 1, s, slabOf(mat)), p.set(hi, yy + 1, s, slabOf(mat)));
      break;
    }
  }
}
const FULL_OF = { PLANKS: B.PLANKS, COBBLE: B.COBBLE, BRICK: B.BRICK, STONEBRICK: B.STONEBRICK, SANDSTONE: B.SANDSTONE, MARBLE: B.MARBLE, DARKPLANKS: B.DARKPLANKS, SMOOTH: B.SMOOTH };
const stairBlock = mat => FULL_OF[mat] ?? B.PLANKS;
const slabOf = mat => slab(mat);
// runder Turm (Zylinder) mit Wand t; hollow: innen Luft mit Boden alle 'floors' Blöcke
export function tower(p, cx, y0, cz, r, h, t, o = {}) {
  for (let y = y0; y < y0 + h; y++) for (let z = cz - r; z <= cz + r; z++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.hypot(x - cx, z - cz);
    if (d > r + 0.5) continue;
    const shell = d > r - 0.5;
    if (shell) p.set(x, y, z, t);
    else p.set(x, y, z, o.floors && (y - y0) % o.floors === 0 ? (o.floor ?? B.PLANKS) : B.AIR);
  }
}
// Kegeldach über einem runden Turm
export function cone(p, cx, y, cz, r, t) {
  for (let k = 0; r - k * 0.7 > -0.5; k++) {
    const rr = r + 1 - k * 0.7;
    for (let z = Math.floor(cz - rr); z <= cz + rr; z++) for (let x = Math.floor(cx - rr); x <= cx + rr; x++) if (Math.hypot(x - cx, z - cz) <= rr + 0.3) p.set(x, y + k, z, t);
  }
}
// Ellipsoid aushöhlen (Höhlenhalle); rauer Rand über hash
export function cavern(p, cx, cy, cz, rx, ry, rz, hash) {
  for (let y = cy - ry; y <= cy + ry; y++) for (let z = cz - rz; z <= cz + rz; z++) for (let x = cx - rx; x <= cx + rx; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, dz = (z - cz) / rz, d = dx * dx + dy * dy * (y < cy ? 2.2 : 1) + dz * dz;
    const rough = 0.86 + 0.14 * hash(x >> 1, (z >> 1) + y * 31);
    if (d <= rough) p.set(x, y, z, B.AIR);
  }
}
// Gang mit Treppenstufen: von (x, y, z) in Richtung (dx, dz) steigend, bis stop(x, y, z) true; Breite 3, Höhe 4
export function stairTunnel(p, x, y, z, dx, dz, maxLen, stop, mat = 'COBBLE') {
  const d = dx === 1 ? 1 : dx === -1 ? 3 : dz === 1 ? 2 : 0, sx = dz, sz = dx; // quer zur Laufrichtung
  for (let i = 0; i < maxLen; i++) {
    for (let s = -1; s <= 1; s++) {
      const wx = x + sx * s, wz = z + sz * s;
      p.set(wx, y - 1, wz, B.COBBLE);
      p.set(wx, y, wz, stair(mat, d));
      for (let k = 1; k <= 4; k++) p.set(wx, y + k, wz, B.AIR);
    }
    if (i % 6 === 3) p.set(x + sx * 2, y + 2, z + sz * 2, B.LANTERN);
    if (stop(x, y, z)) return { x, y, z };
    x += dx; z += dz; y++;
  }
  return { x, y, z };
}
// Blockschrift 3×5 für Schilder und Leuchtbuchstaben (A–Z, Leerzeichen)
const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101',
  N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', W: '101101111111101', V: '101101101101010', X: '101101010101101', Y: '101101010010010', J: '001001001101010', Q: '010101101111011', Ö: '101010101101010', Z: '111001010100111', Ä: '101010101111101', Ü: '101000101101111', ' ': '000000000000000'
};
// Text an eine senkrechte Fläche schreiben: Start (x, y oben, z), Richtung entlang (ax, az)
export function letters(p, text, x, y, z, ax, az, t) {
  let o = 0;
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch] || FONT[' '];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') p.set(x + ax * (o + c), y - r, z + az * (o + c), t);
    o += 4;
  }
  return o;
}
// Baum mit wählbaren Blättern (Stamm h, Krone r)
export function tree(p, x, y, z, h, leaves = B.LEAVES, wood = B.WOOD, r = 2) {
  for (let k = 0; k < h; k++) p.set(x, y + k, z, wood);
  for (let dy = -1; dy <= 2; dy++) {
    const rr = dy >= 2 ? r - 1 : r;
    for (let dz = -rr; dz <= rr; dz++) for (let dx = -rr; dx <= rr; dx++) {
      if (Math.abs(dx) === rr && Math.abs(dz) === rr && (dy !== 0 || rr > 1)) continue;
      const yy = y + h - 1 + dy;
      if (p.get(x + dx, yy, z + dz) === undefined || p.get(x + dx, yy, z + dz) === B.AIR) p.set(x + dx, yy, z + dz, leaves);
    }
  }
  p.set(x, y + h - 1, z, wood);
}

// Erdhügel (für Höhlen in den Fanwelten): Stein, Erde, Deckschicht top
export function mound(p, cx, y, cz, r, h, top = B.GRASS, hash = () => 0.5) {
  for (let z = cz - r; z <= cz + r; z++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.hypot(x - cx, z - cz) / r;
    if (d > 1) continue;
    const hh = Math.round(h * Math.pow(1 - d * d, 0.6) + (hash(x, z) - 0.5) * 2);
    for (let k = 1; k <= hh; k++) p.set(x, y + k, z, k === hh ? top : k > hh - 3 ? B.DIRT : B.STONE);
  }
}
// Halle mit ebenem Boden (fy) und Kuppeldecke, Boden aus floor
export function hall(p, cx, fy, cz, rx, h, rz, floor = null, hash = () => 0.5) {
  for (let y = fy; y <= fy + h; y++) {
    const k = Math.sqrt(Math.max(0, 1 - Math.pow((y - fy) / (h + 1), 2)));
    for (let z = cz - rz; z <= cz + rz; z++) for (let x = cx - rx; x <= cx + rx; x++) {
      const dx = (x - cx) / (rx * k + 0.01), dz = (z - cz) / (rz * k + 0.01);
      if (dx * dx + dz * dz <= 0.9 + 0.1 * hash(x, z + y * 17)) { p.set(x, y, z, B.AIR); if (y === fy && floor != null) p.set(x, fy - 1, z, floor); }
    }
  }
}
// Gang (Breite 2w+1, Höhe h) von a nach b auf Bodenhöhe y, nur entlang einer Achse
export function corridor(p, x0, z0, x1, z1, y, h = 4, w = 1, floor = null) {
  for (let z = Math.min(z0, z1) - (x0 === x1 ? 0 : w); z <= Math.max(z0, z1) + (x0 === x1 ? 0 : w); z++)
    for (let x = Math.min(x0, x1) - (x0 === x1 ? w : 0); x <= Math.max(x0, x1) + (x0 === x1 ? w : 0); x++) {
      for (let k = 0; k < h; k++) p.set(x, y + k, z, B.AIR);
      if (floor != null) p.set(x, y - 1, z, floor);
    }
}
// Figur aus Quadern: parts = [[x0, y0, z0, x1, y1, z1, Block], …] relativ zu (x, y, z); rot = 0 Blick +z, 1 +x, 2 −z, 3 −x
export function figure(p, x, y, z, parts, rot = 0) {
  const R = (u, w) => rot === 0 ? [u, w] : rot === 1 ? [w, -u] : rot === 2 ? [-u, -w] : [-w, u];
  for (const [a, b, c, d, e, f, t] of parts) for (let yy = b; yy <= e; yy++) for (let w = c; w <= f; w++) for (let u = a; u <= d; u++) {
    const [dx, dz] = R(u, w); p.set(x + dx, y + yy, z + dz, t);
  }
}

// ---------- großes, voll eingerichtetes Haus (zwei Etagen, 11×11 Räume, Satteldach) ----------
// (cx, y, cz) Mitte am Boden, (fx, fz) Blickrichtung der Tür nach außen. st = Stil { wall, post, floor, roof (Treppen-Material), roofWall }
// role: Einrichtung unten (bauer | schmied | funker | hirte | wirt | wohnen | laden | labor | heil | kirche)
export function bigHouse(p, cx, y, cz, fx, fz, st = {}, role = 'wohnen', half = 6) {
  const wall = st.wall ?? B.PLANKS, post = st.post ?? B.WOOD, floor = st.floor ?? B.PLANKS, base = st.base ?? B.COBBLE;
  const rx = -fz, rz = fx; // rechts von der Tür aus gesehen (nach innen blickend gespiegelt egal)
  const L = (u, v) => [cx + rx * u + fx * v, cz + rz * u + fz * v]; // u quer, v nach vorn (Tür bei v = half)
  const put = (u, yy, v, t) => { const [x, z] = L(u, v); p.set(x, yy, z, t); };
  const H1 = 5; // Raumhöhe Erdgeschoss (Boden y, Decke y + H1)
  // Fundament, Erdgeschoss, Obergeschoss
  room(p, cx - half, y, cz - half, cx + half, y + H1, cz + half, { wall, post, floor, base, ceil: floor });
  room(p, cx - half, y + H1, cz - half, cx + half, y + H1 + 4, cz + half, { wall, post, floor, base: wall });
  for (let k = 1; k < H1 + 4; k++) for (const [u, v] of [[-half, 0], [half, 0], [0, -half]]) put(u, y + k, v, post); // Mittelbalken
  for (let k = 1; k < H1 + 4; k++) put(0, y + k, half, post);
  // Fenster
  for (const yy of [y + 2, y + 3, y + H1 + 2]) for (const s of [-3, -2, 2, 3]) { put(s, yy, -half, B.PANE); put(s, yy, half, B.PANE); put(-half, yy, s, B.PANE); put(half, yy, s, B.PANE); }
  // Tür mit Vordach und Stufe
  put(0, y + 1, half, B.AIR); put(0, y + 2, half, B.AIR); { const [x, z] = L(0, half); door(p, x, y + 1, z); }
  put(-1, y + 3, half + 1, deco('torch')); put(1, y + 3, half + 1, deco('torch'));
  for (const u of [-1, 0, 1]) put(u, y, half + 1, base);
  // Dach (First quer zur Tür)
  const [ax, az] = L(-half, -half), [bx, bz] = L(half, half);
  gableRoof(p, Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz), y + H1 + 5, st.roof ?? 'DARKPLANKS', st.roofWall ?? wall, fx === 0);
  // Leiter in der hinteren rechten Ecke durch eine Öffnung in der Decke
  for (let k = 1; k <= H1 + 1; k++) put(half - 1, y + k, -half + 1, B.LADDER);
  // Licht: Laternen unter der Decke beider Etagen
  for (const [u, v] of [[-3, -3], [3, 3], [-3, 3], [3, -3]]) put(u, y + H1 - 1, v, B.LANTERN);
  put(0, y + H1 + 3, 0, B.LANTERN);
  // Erdgeschoss je nach Rolle
  const D = deco;
  const groundFurniture = {
    wohnen: () => { put(-2, y + 1, 0, D('table')); put(-2, y + 1, 1, D('chair')); put(-2, y + 1, -1, D('chair')); put(-3, y + 1, 0, D('chair')); put(-1, y + 1, 0, D('chair'));
      put(-2, y + 2, 0, D('candles')); put(2, y + 1, -5, D('couch')); put(3, y + 1, -2, D('rug')); put(5, y + 1, 2, D('shelf')); put(-5, y + 1, -4, D('cabinet')); put(-5, y + 2, -4, D('tablelamp'));
      put(-5, y + 1, 4, B.BOOKS); put(-5, y + 2, 4, B.BOOKS); put(-4, y + 1, 5, D('barrel')); put(4, y + 1, -5, D('lamp')); put(0, y + 3, -half + 1, D('picture')); },
    bauer: () => { groundFurniture.wohnen(); put(5, y + 1, -2, B.WORKBENCH); put(5, y + 1, -1, B.HAY); put(4, y + 1, 4, B.HAY); put(5, y + 1, 4, D('crates')); },
    schmied: () => { put(5, y + 1, -2, B.FURNACE); put(5, y + 1, -1, B.FURNACE); put(5, y + 1, 0, B.WORKBENCH); put(4, y + 1, 4, B.IRONBLOCK); put(-5, y + 1, 3, D('barrel')); put(-5, y + 1, 4, D('crates'));
      put(-2, y + 1, 0, D('tablelong')); put(-2, y + 1, 1, D('stool')); put(-5, y + 1, -4, D('chest')); put(0, y + 3, -half + 1, D('banner')); put(4, y + 1, -5, D('lamp')); },
    funker: () => { groundFurniture.wohnen(); put(5, y + 1, -2, B.RADIO); put(5, y + 1, -1, B.SENDER); put(5, y + 2, -2, D('tablelamp')); },
    hirte: () => { groundFurniture.wohnen(); put(5, y + 1, -2, B.WOOL); put(5, y + 1, -1, B.WOOL); put(5, y + 2, -2, B.WOOL); put(4, y + 1, 4, B.HAY); },
    wirt: () => { for (const v of [-3, 0, 3]) { put(-2, y + 1, v, D('tablelong')); put(-3, y + 1, v, D('stool')); put(-1, y + 1, v, D('stool')); put(-2, y + 2, v, D('candles')); }
      for (const v of [-4, -3, -2, -1]) put(4, y + 1, v, D('keg')); put(4, y + 1, 1, D('barrel')); put(5, y + 1, 3, D('barrel')); put(3, y + 1, 4, D('crates')); put(0, y + 3, -half + 1, D('banner')); put(4, y + 1, -5, D('lamp')); },
    laden: () => { for (const u of [-3, -2, -1, 0, 1, 2]) put(u, y + 1, -2, D('cabinet')); put(-3, y + 2, -2, D('books')); put(0, y + 2, -2, D('tablelamp'));
      for (const v of [-5, -4]) for (const u of [-4, 0, 4]) put(u, y + 1, v, D('shelf')); put(4, y + 1, 4, D('crates')); put(-4, y + 1, 4, D('barrel')); put(-5, y + 1, 0, D('chest')); }
  };
  groundFurniture.heil = () => { for (const u of [-3, -2, -1, 0, 1, 2, 3]) put(u, y + 1, -2, D('cabinet')); put(0, y + 2, -2, D('tablelamp')); put(-2, y + 2, -2, D('books'));
    for (const v of [-1, 1, 3]) { put(-5, y + 1, v, D('bed')); put(5, y + 1, v, D('bed')); } put(-3, y + 1, 4, D('couch')); put(3, y + 1, 4, D('couch')); put(0, y + 1, 2, D('rug'));
    put(-4, y + 1, -5, D('lamp')); put(4, y + 1, -5, D('bush')); put(0, y + 3, -half + 1, D('picture')); };
  groundFurniture.labor = () => { for (const v of [-1, 2]) { put(-2, y + 1, v, D('tablelong')); put(-2, y + 2, v, B.CAPSULE); put(2, y + 1, v, D('tablelong')); put(2, y + 2, v, D('books')); }
    for (const u of [-4, -3, -2, -1, 0, 1, 2, 3, 4]) { put(u, y + 1, -5, B.BOOKS); put(u, y + 2, -5, B.BOOKS); } put(-5, y + 1, 4, B.RADIO); put(-5, y + 2, 4, D('tablelamp')); put(5, y + 1, 4, B.CRYSTAL);
    put(0, y + 1, 4, D('chair')); put(5, y + 1, -2, D('cabinet')); put(5, y + 2, -2, B.CAPSULE); put(-5, y + 1, 0, D('lamp')); };
  (groundFurniture[role] || groundFurniture.wohnen)();
  // Obergeschoss: Schlafzimmer
  const Y2 = y + H1 + 1;
  put(-4, Y2, -4, D('bed')); put(-1, Y2, -4, D('bed')); put(-5, Y2, 0, D('cabinet')); put(-5, Y2 + 1, 0, D('tablelamp')); put(3, Y2, -4, D('chest'));
  put(3, Y2, 3, D('armchair')); put(0, Y2, 2, D('rug')); put(-4, Y2, 4, D('shelf')); put(2, Y2, 0, D('table')); put(2, Y2 + 1, 0, D('books'));
  put(0, Y2 + 1, -half + 1, D('picture')); put(-half + 1, Y2 + 1, 2, D('picture'));
  return { door: L(0, half), front: L(0, half + 2) };
}
