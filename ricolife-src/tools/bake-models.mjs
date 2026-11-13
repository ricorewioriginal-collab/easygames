// Backt die CC0-Modelle aus assets-src/kenney/*.glb in eine kleine Binärdatei public/models/kenney.bin.
// Im Spiel ist dann weder GLTFLoader noch Meshopt-Decoder nötig (weniger Code, weniger Arbeit am Handy).
// Aufruf: node tools/bake-models.mjs   (einmal nach Änderung der Modelle; Ergebnis wird eingecheckt)
//
// Je Modell: indizierte Dreiecke, Position int16 (auf die Hüllbox normiert), Normale int8, Farbe RGB8 (linear),
// Kennung je Vertex (Material-Art): 0 = feste Farbe, 1 = Laub, 2 = Gras/Blätter, 3 = Blüte, 4 = Rinde, 5 = Holz innen, 6 = Stein.
// Texturierte Modelle (Autos, Farbpalette „colormap“) werden je Vertex aus der Textur eingefärbt.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(root, 'assets-src', 'kenney');
const OUT = path.join(root, 'public', 'models', 'kenney.bin');

const TAG = (name) => {
  const n = name.toLowerCase();
  if (n.startsWith('leaf')) return 1;
  if (n === 'grass') return 2;
  if (n.startsWith('color')) return 3;
  if (n === 'woodinner') return 5;
  if (n.startsWith('wood') || n.includes('bark')) return 4;
  if (n === 'dirt' || n.includes('stone') || n.includes('rock')) return 6;
  return 0;
};

// ---------- PNG (8 Bit, RGB/RGBA/Palette, ohne Interlace) ----------
function decodePng(buf) {
  let o = 8, w = 0, h = 0, ct = 0, bd = 0, pal = null, trns = null;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; if (d[12]) throw new Error('PNG interlace'); }
    else if (type === 'PLTE') pal = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  if (bd !== 8) throw new Error(`PNG Bittiefe ${bd}`);
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 3 ? 1 : ct === 4 ? 2 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch, px = new Uint8Array(w * h * ch);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= ch && y ? px[(y - 1) * stride + x - ch] : 0;
      let v = src[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  const rgb = (x, y) => {
    const i = (y * w + x) * ch;
    if (ct === 3) { const k = px[i] * 3; return [pal[k], pal[k + 1], pal[k + 2]]; }
    if (ct === 0 || ct === 4) return [px[i], px[i], px[i]];
    return [px[i], px[i + 1], px[i + 2]];
  };
  void trns;
  return { w, h, rgb };
}

const srgbToLin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };

// ---------- GLB ----------
async function readGlb(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('kein GLB');
  let o = 12, json = null, bin = null;
  while (o < b.length) {
    const len = b.readUInt32LE(o), type = b.readUInt32LE(o + 4);
    if (type === 0x4e4f534a) json = JSON.parse(b.subarray(o + 8, o + 8 + len).toString());
    else if (type === 0x004e4942) bin = b.subarray(o + 8, o + 8 + len);
    o += 8 + len;
  }
  const views = [];
  for (const bv of json.bufferViews) {
    const ext = bv.extensions?.EXT_meshopt_compression;
    if (ext) {
      const src = new Uint8Array(bin.buffer, bin.byteOffset + (ext.byteOffset ?? 0), ext.byteLength);
      const dst = new Uint8Array(ext.count * ext.byteStride);
      MeshoptDecoder.decodeGltfBuffer(dst, ext.count, ext.byteStride, src, ext.mode, ext.filter ?? 'NONE');
      views.push({ data: dst, stride: ext.byteStride });
    } else views.push({ data: new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength), stride: bv.byteStride });
  }
  const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const accessor = (i) => {
    const a = json.accessors[i], v = views[a.bufferView], n = SIZE[a.type], out = new Float32Array(a.count * n);
    const ct = a.componentType, cs = ct === 5126 || ct === 5125 ? 4 : ct === 5122 || ct === 5123 ? 2 : 1;
    const stride = v.stride || n * cs, dv = new DataView(v.data.buffer, v.data.byteOffset, v.data.byteLength), base = a.byteOffset ?? 0;
    for (let k = 0; k < a.count; k++)
      for (let c = 0; c < n; c++) {
        const p = base + k * stride + c * cs;
        let x;
        switch (ct) {
          case 5126: x = dv.getFloat32(p, true); break;
          case 5125: x = dv.getUint32(p, true); break;
          case 5123: x = dv.getUint16(p, true); if (a.normalized) x /= 65535; break;
          case 5122: x = dv.getInt16(p, true); if (a.normalized) x = Math.max(x / 32767, -1); break;
          case 5121: x = dv.getUint8(p); if (a.normalized) x /= 255; break;
          default: x = dv.getInt8(p); if (a.normalized) x = Math.max(x / 127, -1);
        }
        out[k * n + c] = x;
      }
    return out;
  };
  let tex = null;
  if (json.images?.length) {
    const im = json.images[0], v = views[im.bufferView];
    tex = decodePng(Buffer.from(v.data));
  }
  // Knoten-Hierarchie
  const prims = [];
  const visit = (ni, parent) => {
    const nd = json.nodes[ni], m = new THREE.Matrix4();
    if (nd.matrix) m.fromArray(nd.matrix);
    else m.compose(new THREE.Vector3(...(nd.translation ?? [0, 0, 0])), new THREE.Quaternion(...(nd.rotation ?? [0, 0, 0, 1])), new THREE.Vector3(...(nd.scale ?? [1, 1, 1])));
    const wm = parent.clone().multiply(m);
    if (nd.mesh !== undefined) for (const p of json.meshes[nd.mesh].primitives) prims.push({ p, m: wm });
    for (const c of nd.children ?? []) visit(c, wm);
  };
  for (const n of json.scenes[json.scene ?? 0].nodes) visit(n, new THREE.Matrix4());

  const P = [], N = [], C = [], T = [], I = [];
  for (const { p, m } of prims) {
    if ((p.mode ?? 4) !== 4) continue;
    const pos = accessor(p.attributes.POSITION), nor = p.attributes.NORMAL !== undefined ? accessor(p.attributes.NORMAL) : null;
    const uv = p.attributes.TEXCOORD_0 !== undefined ? accessor(p.attributes.TEXCOORD_0) : null;
    const mat = json.materials?.[p.material] ?? { name: '' };
    const pbr = mat.pbrMetallicRoughness ?? {};
    const tt = pbr.baseColorTexture?.extensions?.KHR_texture_transform ?? {};
    const tag = TAG(mat.name ?? '');
    const fc = pbr.baseColorFactor ?? [1, 1, 1, 1];
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    const base = P.length / 3, v = new THREE.Vector3();
    for (let k = 0; k < pos.length / 3; k++) {
      v.set(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]).applyMatrix4(m);
      P.push(v.x, v.y, v.z);
      if (nor) v.set(nor[k * 3], nor[k * 3 + 1], nor[k * 3 + 2]).applyMatrix3(nm).normalize();
      else v.set(0, 1, 0);
      N.push(v.x, v.y, v.z);
      let col = [fc[0], fc[1], fc[2]];
      if (tex && uv && pbr.baseColorTexture) {
        const off = tt.offset ?? [0, 0], sc = tt.scale ?? [1, 1];
        let u = uv[k * 2] * sc[0] + off[0], w = uv[k * 2 + 1] * sc[1] + off[1];
        u -= Math.floor(u); w -= Math.floor(w);
        const [r, g, b] = tex.rgb(Math.min(tex.w - 1, Math.floor(u * tex.w)), Math.min(tex.h - 1, Math.floor(w * tex.h)));
        col = [srgbToLin(r) * fc[0], srgbToLin(g) * fc[1], srgbToLin(b) * fc[2]];
      }
      C.push(...col);
      T.push(tag);
    }
    const idx = p.indices !== undefined ? accessor(p.indices) : Float32Array.from({ length: pos.length / 3 }, (_, i) => i);
    const flip = m.determinant() < 0;
    for (let k = 0; k < idx.length; k += 3) {
      if (flip) I.push(base + idx[k], base + idx[k + 2], base + idx[k + 1]);
      else I.push(base + idx[k], base + idx[k + 1], base + idx[k + 2]);
    }
  }
  return { P, N, C, T, I };
}

await MeshoptDecoder.ready;
const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.glb')).sort();
const meta = { v: 1, models: {} };
const chunks = [];
let off = 0;
const add = (u8) => {
  const pad = (4 - (off % 4)) % 4;
  if (pad) { chunks.push(new Uint8Array(pad)); off += pad; }
  const at = off;
  chunks.push(u8);
  off += u8.byteLength;
  return at;
};
let totalV = 0, totalT = 0;
for (const f of files) {
  const { P, N, C, T, I } = await readGlb(path.join(SRC, f));
  const vc = P.length / 3;
  if (vc > 65535) throw new Error(`${f}: zu viele Vertices`);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k < vc; k++) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], P[k * 3 + c]); max[c] = Math.max(max[c], P[k * 3 + c]); }
  const qp = new Int16Array(vc * 3), qn = new Int8Array(vc * 3), qc = new Uint8Array(vc * 3), qt = new Uint8Array(vc);
  for (let k = 0; k < vc; k++) {
    for (let c = 0; c < 3; c++) {
      const span = max[c] - min[c] || 1;
      qp[k * 3 + c] = Math.round(((P[k * 3 + c] - min[c]) / span) * 65535 - 32768);
      qn[k * 3 + c] = Math.round(Math.max(-1, Math.min(1, N[k * 3 + c])) * 127);
      qc[k * 3 + c] = Math.round(Math.max(0, Math.min(1, C[k * 3 + c])) * 255);
    }
    qt[k] = T[k];
  }
  const qi = Uint16Array.from(I);
  const name = f.replace(/\.glb$/, '');
  meta.models[name] = {
    vc, ic: qi.length, min: min.map((x) => +x.toFixed(4)), max: max.map((x) => +x.toFixed(4)),
    p: add(new Uint8Array(qp.buffer)), n: add(new Uint8Array(qn.buffer)), c: add(qc), t: add(qt), i: add(new Uint8Array(qi.buffer)),
  };
  totalV += vc;
  totalT += qi.length / 3;
}
const js = Buffer.from(JSON.stringify(meta));
const head = Buffer.alloc(8);
head.write('RLM1', 0, 'ascii');
head.writeUInt32LE(js.length, 4);
const jpad = Buffer.alloc((4 - ((8 + js.length) % 4)) % 4, 0x20);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([head, js, jpad, ...chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength))]));
console.log(`${files.length} Modelle, ${totalV} Vertices, ${totalT} Dreiecke → ${path.relative(root, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
for (const [k, m] of Object.entries(meta.models)) console.log(`  ${k}: ${m.vc} V, ${m.ic / 3} T, Größe ${m.max.map((x, i) => (x - m.min[i]).toFixed(2)).join(' × ')}`);
