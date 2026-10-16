// Terrain mesh with a painted ground texture (grass variation, roads, cobbled
// plaza, shores, rock on slopes, soft contact shadows under objects).
import { THREE } from './three.js';
import { CELLS, CELL, HALF, SIZE, heightAt } from '../logic/layout.js';
import { createNoise } from '../core/noise.js';
import { terrainMaterial } from './materials.js';
import { cobbleTexture } from './textures.js';

const col = (c) => new THREE.Color(c);

export function buildTerrainGeometry(L) {
  const n = CELLS + 1;
  const pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i;
    pos[k * 3] = -HALF + i * CELL; pos[k * 3 + 1] = L.heights[k]; pos[k * 3 + 2] = -HALF + j * CELL;
    uv[k * 2] = i / CELLS; uv[k * 2 + 1] = 1 - j / CELLS;
  }
  const idx = new Uint32Array(CELLS * CELLS * 6);
  let o = 0;
  for (let j = 0; j < CELLS; j++) for (let i = 0; i < CELLS; i++) {
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    idx[o++] = a; idx[o++] = c; idx[o++] = b; idx[o++] = b; idx[o++] = c; idx[o++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

function groundColors(L, pal) {
  const g = L.cfg.ground;
  const base = {
    grass: [pal.grass, pal.grass2], forest: [pal.grass, new THREE.Color(pal.grass).lerp(col(0x3d5a2e), 0.4).getHex()],
    ash: [pal.grass, 0x6b5a50], swamp: [pal.grass, 0x5d6b4a], snow: [0xf1f6fa, 0xd9e6ee], dry: [pal.grass, pal.grass2],
    rocky: [pal.grass, pal.rock], summit: [0xc9c3d8, 0xa6a3c4]
  }[g] || [pal.grass, pal.grass2];
  return { a: col(base[0]), b: col(base[1]), dirt: col(pal.dirt), rock: col(pal.rock), sand: col(g === 'snow' ? 0xdfe8ee : g === 'ash' ? 0x5a4a44 : g === 'swamp' ? 0x6a5a40 : 0xe7d3a1) };
}

export function paintTerrain(L, pal, res = 1024) {
  const noise = createNoise('paint:' + L.region);
  const small = 512;
  const c0 = document.createElement('canvas'); c0.width = c0.height = small;
  const x0 = c0.getContext('2d');
  const img = x0.createImageData(small, small);
  const C = groundColors(L, pal);
  const n = CELLS + 1;
  const tmp = new THREE.Color();
  const wdAt = (x, z) => {
    const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL;
    const i = Math.max(0, Math.min(CELLS, Math.round(fx))), j = Math.max(0, Math.min(CELLS, Math.round(fz)));
    return L.waterDist[j * n + i];
  };
  for (let py = 0; py < small; py++) for (let px = 0; px < small; px++) {
    const x = -HALF + (px + 0.5) / small * SIZE, z = -HALF + (py + 0.5) / small * SIZE;
    const h = heightAt(L, x, z);
    const e = 1.2;
    const slope = Math.hypot(heightAt(L, x + e, z) - heightAt(L, x - e, z), heightAt(L, x, z + e) - heightAt(L, x, z - e)) / (2 * e);
    const nv = noise.fbm(x * 0.05, z * 0.05, 3), nv2 = noise.fbm(x * 0.21 + 9, z * 0.21, 2);
    tmp.copy(C.a).lerp(C.b, Math.min(1, Math.max(0, (nv - 0.35) * 2.2)));
    tmp.multiplyScalar(0.9 + nv2 * 0.2);
    if (L.cfg.ground === 'dry' || L.cfg.ground === 'ash') tmp.lerp(C.dirt, Math.max(0, nv2 - 0.55) * 1.5);
    if (L.cfg.ground === 'snow') tmp.lerp(col(0xbfd3e0), Math.max(0, 0.5 - nv) * 0.6);
    // height tint
    tmp.multiplyScalar(1 + Math.max(-0.12, Math.min(0.1, h * 0.012)));
    // rock on steep slopes
    const rk = Math.min(1, Math.max(0, (slope - 0.55) * 2.2));
    if (rk > 0) tmp.lerp(C.rock.clone().multiplyScalar(0.85 + nv2 * 0.3), rk);
    // shores
    const wd = wdAt(x, z);
    if (wd < 4 && L.cfg.water !== 'clouds') tmp.lerp(C.sand, Math.min(1, Math.max(0, (4 - wd) / 3.2)) * 0.9);
    if (wd < 0.5) tmp.multiplyScalar(0.7);
    const k = (py * small + px) * 4;
    img.data[k] = Math.min(255, tmp.r * 255); img.data[k + 1] = Math.min(255, tmp.g * 255); img.data[k + 2] = Math.min(255, tmp.b * 255); img.data[k + 3] = 255;
  }
  x0.putImageData(img, 0, 0);
  const c = document.createElement('canvas'); c.width = c.height = res;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = true;
  x.drawImage(c0, 0, 0, res, res);
  const S = res / SIZE;
  const P = (wx, wz) => [(wx + HALF) * S, (wz + HALF) * S];
  // contact shadows (soft) under trees, rocks and buildings
  x.fillStyle = 'rgba(20,30,15,0.18)';
  for (const t of L.trees) { const [px, py] = P(t.x + 0.6, t.z + 0.6); x.beginPath(); x.arc(px, py, (t.type === 'giant' ? 6 : 1.9) * t.s * S, 0, Math.PI * 2); x.fill(); }
  for (const b of L.buildings) {
    const rot = Math.abs(Math.sin(b.yaw)) > 0.5, w = (rot ? b.d : b.w) + 1.6, d = (rot ? b.w : b.d) + 1.6;
    const [px, py] = P(b.x - w / 2 + 0.4, b.z - d / 2 + 0.6);
    x.fillStyle = 'rgba(25,25,20,0.22)'; x.fillRect(px, py, w * S, d * S);
  }
  // tall grass underlay
  x.fillStyle = 'rgba(30,70,25,0.32)';
  for (const g of L.grass) {
    const [px, py] = P(g.x, g.z);
    x.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * Math.PI * 2, wob = 1 + 0.12 * Math.sin(a * 3 + g.seed) + 0.06 * Math.sin(a * 7 + g.seed * 2);
      const ex = px + Math.cos(a) * g.rx * wob * S, ey = py + Math.sin(a) * g.rz * wob * S;
      i ? x.lineTo(ex, ey) : x.moveTo(ex, ey);
    }
    x.fill();
  }
  // roads
  const dirt = C.dirt;
  const rgba = (c, a, m = 1) => `rgba(${Math.round(Math.min(255, c.r * 255 * m))},${Math.round(Math.min(255, c.g * 255 * m))},${Math.round(Math.min(255, c.b * 255 * m))},${a})`;
  x.lineCap = 'round'; x.lineJoin = 'round';
  const strokePath = (pts) => { x.beginPath(); pts.forEach(([wx, wz], i) => { const [px, py] = P(wx, wz); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  for (const rd of L.roads.filter(r => r.kind === 'dirt' || r.kind === 'boardwalk')) {
    x.strokeStyle = rgba(dirt, 0.35, 0.8); x.lineWidth = (rd.width + 1.6) * S; strokePath(rd.pts);
    x.strokeStyle = rgba(dirt, 0.92, 1); x.lineWidth = rd.width * S; strokePath(rd.pts);
    x.strokeStyle = rgba(dirt, 0.55, 1.1); x.lineWidth = rd.width * 0.45 * S; strokePath(rd.pts);
  }
  // pebbles on dirt roads
  const pn = createNoise('pebbles' + L.region);
  for (const rd of L.roads.filter(r => r.kind === 'dirt')) for (let i = 0; i < rd.pts.length; i++) {
    for (let k = 0; k < 3; k++) {
      const [wx, wz] = rd.pts[i];
      const ox = (pn.value(i * 3.1 + k, 1) - 0.5) * rd.width, oz = (pn.value(i * 1.7, k * 4.3) - 0.5) * rd.width;
      const [px, py] = P(wx + ox, wz + oz);
      x.fillStyle = rgba(dirt, 0.6, pn.value(i, k) > 0.5 ? 0.78 : 1.18);
      x.beginPath(); x.arc(px, py, 0.13 * S, 0, Math.PI * 2); x.fill();
    }
  }
  // cobbled streets and plaza with a pattern
  const cob = cobbleTexture(pal.cobble || 0xbdb4a4).image;
  const pattern = x.createPattern(cob, 'repeat');
  const scale = (1.1 * S) / 32;
  pattern.setTransform && pattern.setTransform(new DOMMatrix([scale, 0, 0, scale, 0, 0]));
  for (const rd of L.roads.filter(r => r.kind === 'cobble')) {
    x.strokeStyle = 'rgba(70,60,50,0.4)'; x.lineWidth = (rd.width + 0.8) * S; strokePath(rd.pts);
    x.strokeStyle = pattern; x.lineWidth = rd.width * S; strokePath(rd.pts);
  }
  if (L.plaza) {
    const [px, py] = P(L.plaza.x, L.plaza.z);
    x.fillStyle = 'rgba(70,60,50,0.45)'; x.beginPath(); x.arc(px, py, (L.plaza.r + 0.6) * S, 0, Math.PI * 2); x.fill();
    x.fillStyle = pattern; x.beginPath(); x.arc(px, py, L.plaza.r * S, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(255,245,220,0.35)'; x.lineWidth = 0.5 * S;
    for (const rr of [L.plaza.r * 0.45, L.plaza.r * 0.8]) { x.beginPath(); x.arc(px, py, rr * S, 0, Math.PI * 2); x.stroke(); }
  }
  // puzzle area and camp floors
  if (L.puzzle) { const [px, py] = P(L.puzzle.x - L.puzzle.size / 2 - 1, L.puzzle.z - L.puzzle.size / 2 - 1); x.fillStyle = 'rgba(110,100,85,0.35)'; x.fillRect(px, py, (L.puzzle.size + 2) * S, (L.puzzle.size + 2) * S); }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function buildTerrain(L, pal, quality) {
  const geo = buildTerrainGeometry(L);
  const tex = paintTerrain(L, pal, quality === 'high' ? 2048 : 1024);
  const mesh = new THREE.Mesh(geo, terrainMaterial(tex));
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return mesh;
}
