// Chunk-Mesher: Flächen-Culling, weiche Ecken-Beleuchtung (Ambient Occlusion + Himmelslicht),
// je Chunk bis zu drei Meshes (opak / transparent / Funk-Logos).
import { CS, H, ATLAS_COLS, ATLAS_ROWS } from './consts.js';
import { B, OPAQUE, LOGO0, EMIT, TRANS, SELF, CROSS, TILES, isLogo as isLogoId } from './blocks.js';
export { TILES };

// n = Normale, o = Ursprungsecke, a/b = Kantenvektoren (a × b = n, also gegen den Uhrzeigersinn von außen)
// Reihenfolge = Flächen-Index im Shader: +X, -X, +Z, -Z, +Y, -Y
const FACES = [
  { n: [1, 0, 0], o: [1, 0, 1], a: [0, 0, -1], b: [0, 1, 0], k: 1 },
  { n: [-1, 0, 0], o: [0, 0, 0], a: [0, 0, 1], b: [0, 1, 0], k: 1 },
  { n: [0, 0, 1], o: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0], k: 1 },
  { n: [0, 0, -1], o: [1, 0, 0], a: [-1, 0, 0], b: [0, 1, 0], k: 1 },
  { n: [0, 1, 0], o: [0, 1, 0], a: [0, 0, 1], b: [1, 0, 0], k: 0 },
  { n: [0, -1, 0], o: [0, 0, 0], a: [1, 0, 0], b: [0, 0, 1], k: 2 }
];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
for (const f of FACES) {
  f.c = CORNERS.map(([i, j]) => {
    const sa = i ? 1 : -1, sb = j ? 1 : -1;
    const v = (m, p, q) => [f.n[0] * m + f.a[0] * p + f.b[0] * q, f.n[1] * m + f.a[1] * p + f.b[1] * q, f.n[2] * m + f.a[2] * p + f.b[2] * q];
    return {
      i, j,
      p: [f.o[0] + i * f.a[0] + j * f.b[0], f.o[1] + i * f.a[1] + j * f.b[1], f.o[2] + i * f.a[2] + j * f.b[2]],
      s1: v(1, sa, 0), s2: v(1, 0, sb), cn: v(1, sa, sb)
    };
  });
}

const AO = [0.45, 0.66, 0.84, 1.0];
const SKY_D = [1, 0.62, 0.38, 0.18]; // Himmelslicht nach Tiefe unter der Oberfläche

function visible(t, nb) {
  if (nb === B.AIR) return true;
  if (OPAQUE[nb]) return false;
  if (t === nb) return SELF[t] === 1;
  return true;
}

class Part {
  constructor() { this.pos = []; this.uv = []; this.col = []; this.idx = []; this.n = 0; }
  finish() {
    if (!this.n) return null;
    return {
      pos: new Float32Array(this.pos), uv: new Float32Array(this.uv), col: new Float32Array(this.col),
      idx: this.n > 16383 ? new Uint32Array(this.idx) : new Uint16Array(this.idx)
    };
  }
}

// UV-Rechteck einer Kachel: Raster 8x8 (Blöcke) bzw. 4x4 (Logos), Rand innen versetzt gegen Mip-Bluten
// [u0, v0, Breite, Höhe] einer Kachel; Block-Atlas 8×16, Logo-Atlas 4×4
function tileUv(tile, logo) {
  const cols = logo ? 4 : ATLAS_COLS, rows = logo ? 4 : ATLAS_ROWS, tu = 1 / cols, tv = 1 / rows;
  const eu = (logo ? 3 : 2) / 512, ev = logo ? eu : 2 / (64 * ATLAS_ROWS);
  return [(tile % cols) * tu + eu, 1 - (Math.floor(tile / cols) + 1) * tv + ev, tu - 2 * eu, tv - 2 * ev];
}

export function buildMesh(world, chunk) {
  const nb = world.neighborhood(chunk);
  if (!nb) return null;
  const hms = [];
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) hms.push(world.heightmap(world.getChunk(chunk.cx + dx, chunk.cz + dz)));
  const data = chunk.data;
  const idxOf = (x, z) => (z < 0 ? 0 : z >= CS ? 2 : 1) * 3 + (x < 0 ? 0 : x >= CS ? 2 : 1);
  const get = (x, y, z) => {
    if (y < 0) return B.STONE;
    if (y >= H) return B.AIR;
    return nb[idxOf(x, z)][(x & 15) + ((z & 15) << 4) + (y << 8)];
  };
  const sky = (x, y, z) => {
    const top = hms[idxOf(x, z)][(x & 15) + ((z & 15) << 4)];
    return y >= top ? 1 : SKY_D[Math.min(3, top - y)];
  };
  const O = new Part(), T = new Part(), L = new Part(), br = [0, 0, 0, 0];
  const top = Math.min(H - 1, chunk.maxY + 1);
  for (let y = 0; y <= top; y++) {
    for (let z = 0; z < CS; z++) {
      for (let x = 0; x < CS; x++) {
        const t = data[x + (z << 4) + (y << 8)];
        if (t === B.AIR) continue;
        if (CROSS[t]) { cross(O, x, y, z, TILES[t][0], sky(x, y, z)); continue; }
        const isLogo = isLogoId(t);
        const part = isLogo ? L : TRANS[t] ? T : O;
        const lamp = EMIT[t];
        const lower = t === B.WATER && get(x, y + 1, z) !== B.WATER;
        const tiles = TILES[t];
        const useAo = lamp === 0 && !TRANS[t];
        for (let fi = 0; fi < 6; fi++) {
          const f = FACES[fi];
          if (!visible(t, get(x + f.n[0], y + f.n[1], z + f.n[2]))) continue;
          const tile = isLogo ? t - LOGO0 : tiles[f.k];
          const [u0, v0, du, dv] = tileUv(tile, isLogo);
          for (let k = 0; k < 4; k++) {
            const c = f.c[k];
            const sc = sky(x + f.n[0], y + f.n[1], z + f.n[2]);
            const x1 = x + c.s1[0], y1 = y + c.s1[1], z1 = z + c.s1[2];
            const x2 = x + c.s2[0], y2 = y + c.s2[1], z2 = z + c.s2[2];
            const x3 = x + c.cn[0], y3 = y + c.cn[1], z3 = z + c.cn[2];
            const b1 = OPAQUE[get(x1, y1, z1)], b2 = OPAQUE[get(x2, y2, z2)], b3 = OPAQUE[get(x3, y3, z3)];
            const a = useAo ? (b1 && b2 ? 0 : 3 - (b1 + b2 + b3)) : 3;
            // weiches Himmelslicht: Mittel aus Flächenzelle und drei Nachbarzellen (feste Zellen zählen wie die Flächenzelle)
            const s = (sc + (b1 ? sc : sky(x1, y1, z1)) + (b2 ? sc : sky(x2, y2, z2)) + (b3 ? sc : sky(x3, y3, z3))) / 4;
            br[k] = AO[a] * (0.5 + 0.5 * s);
            part.pos.push(x + c.p[0], y + c.p[1] - (lower && c.p[1] === 1 ? 0.12 : 0), z + c.p[2]);
            part.uv.push(u0 + c.i * du, v0 + c.j * dv);
            part.col.push(AO[a], s, lamp, fi);
          }
          const b = part.n * 4;
          if (br[0] + br[2] < br[1] + br[3]) part.idx.push(b + 1, b + 2, b + 3, b + 1, b + 3, b);
          else part.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
          part.n++;
        }
      }
    }
  }
  return { opaque: O.finish(), trans: T.finish(), logo: L.finish() };
}

// Pflanze: zwei diagonale Flächen, beidseitig (opakes Mesh, Alpha-Ausschnitt)
const CROSS_Q = [[[0.15, 0.15], [0.85, 0.85]], [[0.85, 0.15], [0.15, 0.85]]];
function cross(P, x, y, z, tile, s) {
  const [u0, v0, du, dv] = tileUv(tile, false);
  for (const [[ax, az], [bx, bz]] of CROSS_Q) {
    for (const flip of [0, 1]) {
      const b = P.n * 4;
      const pts = flip ? [[bx, bz], [ax, az]] : [[ax, az], [bx, bz]];
      P.pos.push(x + pts[0][0], y, z + pts[0][1], x + pts[1][0], y, z + pts[1][1], x + pts[1][0], y + 1, z + pts[1][1], x + pts[0][0], y + 1, z + pts[0][1]);
      P.uv.push(u0, v0, u0 + du, v0, u0 + du, v0 + dv, u0, v0 + dv);
      for (let k = 0; k < 4; k++) P.col.push(0.9, s, 0, 4);
      P.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      P.n++;
    }
  }
}

// Einheitswürfel (für Hand-Block): gleiche Vertex-Daten wie der Welt-Mesher
export function cubeData(type) {
  const isLogo = isLogoId(type), tiles = TILES[type], P = new Part();
  for (let fi = 0; fi < 6; fi++) {
    const f = FACES[fi], [u0, v0, du, dv] = tileUv(isLogo ? type - LOGO0 : tiles[f.k], isLogo);
    for (let k = 0; k < 4; k++) {
      const c = f.c[k];
      P.pos.push(c.p[0] - 0.5, c.p[1] - 0.5, c.p[2] - 0.5); P.uv.push(u0 + c.i * du, v0 + c.j * dv); P.col.push(1, 1, EMIT[type], fi);
    }
    const b = P.n * 4; P.idx.push(b, b + 1, b + 2, b, b + 2, b + 3); P.n++;
  }
  return P.finish();
}
