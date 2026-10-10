// Chunk-Mesher: Flächen-Culling + Ambient Occlusion, ein Mesh pro Chunk (opak / transparent).
import { CS, H, B, OPAQUE } from './world.js';

// n = Normale, o = Ursprungsecke, a/b = Kantenvektoren (a × b = n, also gegen den Uhrzeigersinn von außen)
const FACES = [
  { n: [1, 0, 0], o: [1, 0, 1], a: [0, 0, -1], b: [0, 1, 0], shade: 0.7, k: 1 },
  { n: [-1, 0, 0], o: [0, 0, 0], a: [0, 0, 1], b: [0, 1, 0], shade: 0.7, k: 1 },
  { n: [0, 0, 1], o: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0], shade: 0.85, k: 1 },
  { n: [0, 0, -1], o: [1, 0, 0], a: [-1, 0, 0], b: [0, 1, 0], shade: 0.85, k: 1 },
  { n: [0, 1, 0], o: [0, 1, 0], a: [0, 0, 1], b: [1, 0, 0], shade: 1.0, k: 0 },
  { n: [0, -1, 0], o: [0, 0, 0], a: [1, 0, 0], b: [0, 0, 1], shade: 0.55, k: 2 }
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

// Atlas-Kachel je Block und Flächenart (0 oben, 1 Seite, 2 unten)
export const TILES = {
  [B.GRASS]: [0, 1, 2], [B.DIRT]: [2, 2, 2], [B.STONE]: [3, 3, 3], [B.SAND]: [4, 4, 4],
  [B.WOOD]: [6, 5, 6], [B.LEAVES]: [7, 7, 7], [B.PLANKS]: [8, 8, 8], [B.GLASS]: [9, 9, 9],
  [B.LAMP]: [10, 10, 10], [B.WATER]: [11, 11, 11]
};
const AO = [0.5, 0.7, 0.85, 1.0];
const EPS = 0.002, TS = 0.25;

function visible(t, nb) {
  if (nb === B.AIR) return true;
  if (OPAQUE[nb]) return false;
  if (t === nb) return t === B.LEAVES;
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

export function buildMesh(world, chunk) {
  const nb = world.neighborhood(chunk);
  if (!nb) return null;
  const data = chunk.data;
  const get = (x, y, z) => {
    if (y < 0) return B.STONE;
    if (y >= H) return B.AIR;
    const d = nb[(z < 0 ? 0 : z >= CS ? 2 : 1) * 3 + (x < 0 ? 0 : x >= CS ? 2 : 1)];
    return d[(x & 15) + ((z & 15) << 4) + (y << 8)];
  };
  const O = new Part(), T = new Part(), ao = [0, 0, 0, 0];
  const top = Math.min(H - 1, chunk.maxY + 1);
  for (let y = 0; y <= top; y++) {
    for (let z = 0; z < CS; z++) {
      for (let x = 0; x < CS; x++) {
        const t = data[x + (z << 4) + (y << 8)];
        if (t === B.AIR) continue;
        const part = (t === B.GLASS || t === B.WATER) ? T : O;
        const lamp = t === B.LAMP ? 1 : 0;
        const lower = t === B.WATER && get(x, y + 1, z) !== B.WATER;
        const tiles = TILES[t];
        for (let fi = 0; fi < 6; fi++) {
          const f = FACES[fi];
          if (!visible(t, get(x + f.n[0], y + f.n[1], z + f.n[2]))) continue;
          const tile = tiles[f.k];
          const u0 = (tile & 3) * TS + EPS, v0 = 1 - ((tile >> 2) + 1) * TS + EPS, du = TS - 2 * EPS;
          const useAo = !lamp && t !== B.WATER && t !== B.GLASS;
          for (let k = 0; k < 4; k++) {
            const c = f.c[k];
            let a = 3;
            if (useAo) {
              const s1 = OPAQUE[get(x + c.s1[0], y + c.s1[1], z + c.s1[2])];
              const s2 = OPAQUE[get(x + c.s2[0], y + c.s2[1], z + c.s2[2])];
              const cn = OPAQUE[get(x + c.cn[0], y + c.cn[1], z + c.cn[2])];
              a = s1 && s2 ? 0 : 3 - (s1 + s2 + cn);
            }
            ao[k] = a;
            const sh = f.shade * AO[a];
            part.pos.push(x + c.p[0], y + c.p[1] - (lower && c.p[1] === 1 ? 0.12 : 0), z + c.p[2]);
            part.uv.push(u0 + c.i * du, v0 + c.j * du);
            part.col.push(sh, sh, sh, lamp);
          }
          const b = part.n * 4;
          if (ao[0] + ao[2] < ao[1] + ao[3]) part.idx.push(b + 1, b + 2, b + 3, b + 1, b + 3, b);
          else part.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
          part.n++;
        }
      }
    }
  }
  return { opaque: O.finish(), trans: T.finish() };
}
