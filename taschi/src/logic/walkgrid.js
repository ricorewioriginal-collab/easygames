// Collision / walkability grid for a region layout (1 m cells). Pure, so the
// tests can verify that every interaction point is reachable on foot.
import { HALF, SIZE, heightAt, slopeAt, waterDistance } from './layout.js';
import { distToPolyline } from '../core/noise.js';

export const FREE = 0, BLOCK = 1, WATER = 2;

export function footprint(b) {
  const rot = Math.abs(Math.sin(b.yaw)) > 0.5;
  return { hw: (rot ? b.d : b.w) / 2, hd: (rot ? b.w : b.d) / 2 };
}

export function buildWalkGrid(L) {
  const N = SIZE;
  const g = new Uint8Array(N * N);
  const idx = (x, z) => { const i = Math.floor(x + HALF), j = Math.floor(z + HALF); return (i < 0 || j < 0 || i >= N || j >= N) ? -1 : j * N + i; };
  const roadKinds = L.roads;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = -HALF + i + 0.5, z = -HALF + j + 0.5;
    if (i < 2 || j < 2 || i >= N - 2 || j >= N - 2) { g[j * N + i] = BLOCK; continue; }
    const wd = waterDistance(L, x, z);
    let onWalkway = false;
    if (wd < 0.3) {
      for (const br of L.bridges) {
        const dx = x - br.x, dz = z - br.z, c = Math.cos(br.yaw), s = Math.sin(br.yaw);
        const lx = dx * c - dz * s, lz = dx * s + dz * c;
        if (Math.abs(lx) < br.width / 2 && Math.abs(lz) < br.len / 2) onWalkway = true;
      }
      for (const rd of roadKinds) if (rd.kind === 'boardwalk' && distToPolyline(x, z, rd.pts) < rd.width / 2) onWalkway = true;
      if (L.water.some(w => w.kind === 'ice' && waterDistance({ water: [w] }, x, z) < 0.3)) onWalkway = true;
      if (!onWalkway) { g[j * N + i] = WATER; continue; }
    }
    if (!onWalkway && slopeAt(L, x, z) > 0.95) { g[j * N + i] = BLOCK; continue; }
  }
  const rect = (cx, cz, hw, hd, v = BLOCK) => {
    for (let z = Math.floor(cz - hd); z < Math.ceil(cz + hd); z++) for (let x = Math.floor(cx - hw); x < Math.ceil(cx + hw); x++) {
      const k = idx(x + 0.5, z + 0.5); if (k >= 0) g[k] = v;
    }
  };
  const circle = (cx, cz, r, v = BLOCK) => {
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) { const k = idx(x + 0.5, z + 0.5); if (k >= 0) g[k] = v; }
    }
  };
  for (const b of L.buildings) {
    const { hw, hd } = footprint(b);
    if (b.kind === 'pavilion') { for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) circle(b.x + dx * (hw - 0.8), b.z + dz * (hd - 0.8), 0.6); continue; }
    rect(b.x, b.z, hw, hd);
  }
  if (L.dome) {
    // glass dome: ring wall with an opening facing the plaza
    const { x, z, r, yaw } = L.dome;
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const da = Math.atan2(Math.sin(a - yaw), Math.cos(a - yaw));
      if (Math.abs(da) < 0.42) continue;
      circle(x + Math.sin(a) * r, z + Math.cos(a) * r, 0.5);
    }
    circle(L.dome.podium.x, L.dome.podium.z, 1.6);
  }
  for (const t of L.trees) circle(t.x, t.z, t.type === 'giant' ? 3.2 * t.s : t.type === 'mushroom' ? 0.9 * t.s : 0.55 * t.s);
  for (const r of L.rocks) circle(r.x, r.z, 0.8 * r.s);
  for (const s of L.signs) circle(s.x, s.z, 0.35);
  if (L.landmark) {
    const k = L.landmark.kind, rr = { mill: 4.5, lighthouse: 3, windmills: 2, shrine: 2.5, mushrooms: 2.5, windtower: 3, volcano: 12, observatory: 4.5, boardwalk: 0, frozenlake: 0, bigtree: 4, stormtowers: 2.5, crystalspires: 3, moonarch: 2, suntemple: 4.5, skybridge: 0, machine: 4 }[k] ?? 3;
    if (rr) circle(L.landmark.x, L.landmark.z, rr);
  }
  if (L.guild) circle(L.guild.x, L.guild.z - 4, 1.8);
  if (L.chest) circle(L.chest.x, L.chest.z, 0.7);
  if (L.obstacle) circle(L.obstacle.x, L.obstacle.z, 1.4);
  // gates: walls left and right of the opening
  for (const gt of L.gates) { rect(gt.x - 8, gt.z, 3, 1); rect(gt.x + 8, gt.z, 3, 1); }
  return { N, g, idx, at: (x, z) => { const k = idx(x, z); return k < 0 ? BLOCK : g[k]; } };
}

export function walkable(grid, x, z) { return grid.at(x, z) === FREE; }

// BFS reachability from a start point; returns a function telling whether a
// point (with a tolerance radius) is reachable.
export function reachability(grid, sx, sz) {
  const { N, g } = grid;
  const seen = new Uint8Array(N * N);
  const start = grid.idx(sx, sz);
  if (start < 0) return () => false;
  const q = [start]; seen[start] = 1;
  for (let qi = 0; qi < q.length; qi++) {
    const k = q[qi], i = k % N, j = (k / N) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
      const nk = nj * N + ni;
      if (seen[nk] || g[nk] !== FREE) continue;
      seen[nk] = 1; q.push(nk);
    }
  }
  return (x, z, tol = 2.5) => {
    for (let dz = -tol; dz <= tol; dz += 0.5) for (let dx = -tol; dx <= tol; dx += 0.5) {
      const k = grid.idx(x + dx, z + dz);
      if (k >= 0 && seen[k]) return true;
    }
    return false;
  };
}

export function groundHeight(L, x, z) { return heightAt(L, x, z); }
