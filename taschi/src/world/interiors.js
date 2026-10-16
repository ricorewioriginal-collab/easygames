// Interior maps: heal centres, shops, labs, homes, arenas, caves, the guild
// research station and the Star League hall. Each interior returns its 3D
// group, a rectangle-based collision grid, spawn/exit points, NPC slots and
// interaction points.
import { THREE } from '../engine/three.js';
import { Builder, matrix, lumpy } from '../engine/geometry.js';
import { envMaterial, glowMaterial } from '../engine/materials.js';
import { windowMaterial, ballModel, chestModel, captureDevice, cage } from '../engine/buildings.js';
import { signTexture, emblemTexture, floorTexture, wallTexture } from '../engine/textures.js';
import { REGIONS } from '../data/regions.js';
import { TYPES } from '../data/types.js';
import { createRng } from '../core/rng.js';

const C = (c) => new THREE.Color(c);
const shade = (c, f) => C(c).multiplyScalar(f).getHex();
const mix = (a, b, t) => C(a).lerp(C(b), t).getHex();

class RectGrid {
  constructor(w, d) { this.w = w; this.d = d; this.blocks = []; this.dyn = []; }
  block(x, z, hw, hd) { this.blocks.push([x - hw, z - hd, x + hw, z + hd]); }
  at(x, z) {
    if (Math.abs(x) > this.w / 2 - 0.6 || Math.abs(z) > this.d / 2 - 0.6) return 1;
    for (const [a, b, c, d] of this.blocks) if (x > a && x < c && z > b && z < d) return 1;
    for (const f of this.dyn) if (f(x, z)) return 1;
    return 0;
  }
}

function room(b, w, d, h, { wall, floor, trim, floorKind = 'tile' }) {
  // floor and walls as textured meshes; trim and furniture in the builder
  const g = new THREE.Group();
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: floorKind === 'wood' ? floorTexture(shade(floor, 0.9), floor, 6) : floorKind === 'stone' ? wallTexture(floor, 'stone') : floorTexture(floor, shade(floor, 0.92), 10) }));
  fm.material.map.repeat.set(w / 4, d / 4); fm.rotation.x = -Math.PI / 2; fm.receiveShadow = true; g.add(fm);
  const wm = new THREE.MeshLambertMaterial({ map: wallTexture(wall, 'plaster') });
  for (const [x, z, ww, ry] of [[0, -d / 2, w, 0], [-w / 2, 0, d, Math.PI / 2], [w / 2, 0, d, -Math.PI / 2], [0, d / 2, w, Math.PI]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, h), wm); m.position.set(x, h / 2, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m);
  }
  b.box(w, 0.3, 0.2, trim, 0, 0.15, -d / 2 + 0.1); b.box(0.2, 0.3, d, trim, -w / 2 + 0.1, 0.15, 0); b.box(0.2, 0.3, d, trim, w / 2 - 0.1, 0.15, 0);
  b.box(w, 0.3, 0.2, trim, 0, h - 0.15, -d / 2 + 0.1);
  // ceiling beams
  for (let i = -2; i <= 2; i++) b.box(w, 0.25, 0.35, shade(trim, 0.9), 0, h - 0.12, i * d / 5);
  return g;
}
function door(b, x, z, color = 0x6a4a32) { b.box(2.2, 2.6, 0.15, shade(color, 0.8), x, 1.3, z); b.box(1.8, 2.4, 0.18, color, x, 1.2, z); b.box(2.6, 0.08, 1.6, 0xb84a4a, x, 0.04, z - 1); }
function plant(b, x, z, s = 1) { b.cyl(0.3 * s, 0.25 * s, 0.5 * s, 0xb87a4a, x, 0.25 * s, z, 10); b.sphere(0.45 * s, 0x4f9a5a, x, 0.85 * s, z, 1, 1.1, 1, 8); b.sphere(0.3 * s, 0x6fb35a, x + 0.2 * s, 1.15 * s, z, 1, 1, 1, 7); }
function table(b, x, z, w = 1.6, d = 1, color = 0x9a6a44) { b.box(w, 0.1, d, color, x, 0.8, z); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(0.08, 0.8, 0.08, shade(color, 0.8), x + sx * (w / 2 - 0.1), 0.4, z + sz * (d / 2 - 0.1)); }
function shelf(b, x, z, w = 2.4, ry = 0, colors = [0xd8483a, 0x3a7fd0, 0xf0c040, 0x5ac88a]) {
  const rot = (dx, dz) => [x + Math.cos(ry) * dx + Math.sin(ry) * dz, z - Math.sin(ry) * dx + Math.cos(ry) * dz];
  b.box(w, 2.2, 0.6, 0x8a6444, ...[x, 1.1, z], ry);
  for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const [px, pz] = rot(-w / 2 + 0.25 + i * (w - 0.5) / 5, 0.25); b.box(0.28, 0.4, 0.28, colors[(i + k) % colors.length], px, 0.45 + k * 0.65, pz, ry); }
}
function sofa(b, x, z, ry = 0, color = 0x3a7fd0) { b.box(2.2, 0.5, 0.9, color, x, 0.35, z, ry); b.box(2.2, 0.7, 0.25, shade(color, 0.85), x - Math.sin(ry) * 0.35, 0.75, z - Math.cos(ry) * 0.35, ry); }
function bed(b, x, z, color = 0xe86a6a) { b.box(1.2, 0.5, 2.2, 0x8a6444, x, 0.25, z); b.box(1.1, 0.2, 1.6, color, x, 0.55, z + 0.25); b.box(1, 0.2, 0.45, 0xffffff, x, 0.6, z - 0.75); }
function poster(group, text, x, y, z, ry, bg) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTexture(text, { bg, font: 46 }) })); m.position.set(x, y, z); m.rotation.y = ry; group.add(m); }

function finish(group, b) { const m = new THREE.Mesh(b.build(), envMaterial({ scale: 1, strength: 0.25 })); m.castShadow = true; m.receiveShadow = true; group.add(m); return group; }

export function buildInterior(kind, regionId, save) {
  const region = REGIONS[Math.min(15, regionId)] || REGIONS[0];
  const pal = region.palette;
  const b = new Builder();
  let w = 16, d = 12, h = 4.2;
  const out = { kind, region: regionId, npcs: [], interact: [], spawn: null, exit: null, light: 0xfff2dc, ambience: 'indoor', music: 'lab', animators: [], dynamic: [] };
  let group;
  const grid = (W, D) => (out.grid = new RectGrid(W, D));
  switch (kind) {
    case 'heal': {
      w = 18; d = 13; grid(w, d);
      group = room(b, w, d, h, { wall: 0xfff4f0, floor: 0xf4e6e8, trim: 0xe0566e });
      b.box(8, 1.1, 1.4, 0xf3e6ea, 0, 0.55, -3.6); b.box(8.3, 0.12, 1.6, 0xe0566e, 0, 1.15, -3.6);
      out.grid.block(0, -3.6, 4.3, 0.9);
      b.box(2.4, 1.2, 1, 0xd8d0d8, 2.5, 1.8, -4.4); for (let i = 0; i < 6; i++) b.sphere(0.16, 0xe9523f, 2.5 - 0.8 + (i % 3) * 0.8, 2.45, -4.4 + Math.floor(i / 3) * 0.4 - 0.2, 1, 1, 1, 8);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), glowMaterial(0xffb0c0, 0)); glow.position.set(2.5, 2.4, -4.4); out.healGlow = glow;
      b.box(1.2, 1.6, 0.7, 0x5d7f99, -7.6, 0.8, -5.6); b.box(1, 0.7, 0.05, 0x9ad6f0, -7.6, 1.35, -5.24); out.grid.block(-7.6, -5.6, 0.7, 0.5);
      b.box(1.2, 1.1, 0.8, 0xc8a26a, 7.4, 0.55, -5.4); b.box(1, 0.12, 0.7, 0xf2e6c8, 7.4, 1.15, -5.4); out.grid.block(7.4, -5.4, 0.7, 0.5);
      sofa(b, -5.5, 3.2, 0, 0x6aa8e8); sofa(b, 5.5, 3.2, 0, 0x6aa8e8); out.grid.block(-5.5, 3.2, 1.2, 0.6); out.grid.block(5.5, 3.2, 1.2, 0.6);
      table(b, 0, 3.4, 1.4, 0.9, 0xd8c8b0); out.grid.block(0, 3.4, 0.8, 0.5);
      plant(b, -8.2, 5.4); plant(b, 8.2, 5.4); plant(b, -8.2, -2); plant(b, 8.2, -2);
      door(b, 0, d / 2 - 0.1);
      poster(group, 'Heilzentrum ' + region.town, 0, 3.2, -d / 2 + 0.05, 0, '#d84f68');
      out.spawn = { x: 0, z: d / 2 - 1.6, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      out.npcs.push({ id: 'nurse', role: 'nurse', name: 'Schwester Hanna', x: 0, z: -4.9, ry: 0 });
      out.interact.push({ id: 'counter', kind: 'heal', x: 0, z: -2.5, r: 1.8, label: 'Rezeption', prompt: 'Heilen' });
      out.interact.push({ id: 'pc', kind: 'pc', x: -7.6, z: -4.6, r: 1.6, label: 'Taschi-Lager', prompt: 'Lager' });
      out.interact.push({ id: 'savebook', kind: 'save', x: 7.4, z: -4.4, r: 1.6, label: 'Reisetagebuch', prompt: 'Speichern' });
      out.interact.push({ id: 'travel', kind: 'travel', x: -5.5, z: 2.0, r: 1.6, label: 'Flugtaxi-Schalter', prompt: 'Reisen' });
      b.box(1.4, 1, 0.6, 0x3e8fd8, -5.5, 0.5, 1.4); poster(group, '✈ Flugtaxi', -5.5, 2.2, -d / 2 + 0.06, 0, '#3e8fd8');
      group.add(out.healGlow);
      out.music = 'lab';
      break;
    }
    case 'shop': {
      w = 14; d = 11; grid(w, d);
      group = room(b, w, d, h, { wall: 0xeef4fa, floor: 0xd8c8a8, trim: 0x3f7fc4, floorKind: 'wood' });
      b.box(5, 1.1, 1.2, 0x8a6444, -3.2, 0.55, -2.6); b.box(5.2, 0.1, 1.3, 0x3f7fc4, -3.2, 1.15, -2.6); out.grid.block(-3.2, -2.6, 2.7, 0.8);
      shelf(b, 4, -4.9, 3.4); shelf(b, -2, -4.9, 3); out.grid.block(4, -4.9, 1.8, 0.5); out.grid.block(-2, -4.9, 1.6, 0.5);
      shelf(b, 6.2, 1, 3, -Math.PI / 2); out.grid.block(6.2, 1, 0.5, 1.6);
      for (let i = 0; i < 3; i++) { b.box(0.8, 0.8, 0.8, 0xa87a50, -5.6, 0.4 + i * 0.01, 2.5 + i * 0.9, i * 0.2); } out.grid.block(-5.6, 3.4, 0.6, 1.6);
      plant(b, 5.8, 4.2); door(b, 0, d / 2 - 0.1, 0x3f6a9a);
      poster(group, 'Laden ' + region.town, 0, 3.2, -d / 2 + 0.05, 0, '#3f7fc4');
      out.spawn = { x: 0, z: d / 2 - 1.6, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      out.npcs.push({ id: 'clerk', role: 'clerk', name: 'Verkäufer', x: -3.2, z: -3.8, ry: 0 });
      out.interact.push({ id: 'counter', kind: 'shop', x: -3.2, z: -1.4, r: 1.8, label: 'Verkaufstresen', prompt: 'Einkaufen' });
      out.music = 'lab';
      break;
    }
    case 'lab': {
      w = 18; d = 13; grid(w, d);
      group = room(b, w, d, h, { wall: 0xf4f6f6, floor: 0xd8e2e8, trim: 0x5d7f99 });
      for (const x of [-6.5, -2.5]) { shelf(b, x, -5.9, 3.2, 0, [0x8a5a3a, 0x3a5a8a, 0x5a8a3a, 0xa8823a]); out.grid.block(x, -5.9, 1.7, 0.5); }
      table(b, 4, -1, 3, 1.4, 0xe8eef2); out.grid.block(4, -1, 1.6, 0.8);
      b.box(0.6, 0.5, 0.4, 0x3a3d45, 3.2, 1.1, -1); b.box(0.5, 0.35, 0.05, 0x7ad0f0, 3.2, 1.2, -0.79);
      b.cyl(0.25, 0.25, 0.4, 0x9ad6f0, 4.8, 1.05, -1, 10);
      for (let i = 0; i < 3; i++) { b.box(1.2, 2.2, 1, 0x5d7f99, 7.6, 1.1, -4 + i * 2.2); b.box(0.8, 0.6, 0.05, [0x7af0a0, 0xf0d07a, 0x7ad0f0][i], 7.08, 1.6, -4 + i * 2.2); out.grid.block(7.6, -4 + i * 2.2, 0.7, 0.6); }
      plant(b, -8, 4.5); plant(b, -8, 1); bed(b, -6.5, 3.8, 0x9ad6f0); out.grid.block(-6.5, 3.8, 0.7, 1.2);
      door(b, 0, d / 2 - 0.1, 0x6f8fa6);
      poster(group, 'Labor ' + region.professor.title, 0, 3.2, -d / 2 + 0.05, 0, '#4f6f8a');
      out.spawn = { x: 0, z: d / 2 - 1.6, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      if (regionId === 0) out.npcs.push({ id: 'assistant', role: 'forscher', name: 'Assistent Jo', x: 3, z: -2.4, ry: 0, talk: 'assistant' });
      out.npcs.push({ id: 'professor', role: 'professor', name: region.professor.title, x: regionId === 0 ? -1 : 0.5, z: -2.6, ry: 0, professor: true, hidden: regionId === 0 && !save?.flags?.firstQuest });
      out.interact.push({ id: 'pcLab', kind: 'dexinfo', x: 3.2, z: 0.4, r: 1.4, label: 'Forschungscomputer', prompt: 'Lesen' });
      out.music = 'lab';
      break;
    }
    case 'house': {
      w = 12; d = 9; grid(w, d);
      group = room(b, w, d, 3.6, { wall: mix(pal.wall, 0xffffff, 0.3), floor: 0xc8a070, trim: pal.trim, floorKind: 'wood' });
      table(b, 1.5, -0.5, 2, 1.2); out.grid.block(1.5, -0.5, 1.1, 0.7);
      for (const sx of [-1, 1]) b.box(0.5, 0.5, 0.5, 0x9a6a44, 1.5 + sx * 1.4, 0.25, -0.5);
      bed(b, -4.4, -2.2, OUTFIT[(regionId * 3) % OUTFIT.length]); out.grid.block(-4.4, -2.2, 0.7, 1.2);
      b.box(3, 1, 0.7, 0xe8e0d0, 3.5, 0.5, -3.9); b.box(0.8, 0.6, 0.6, 0x3a3d45, 4.6, 1.3, -3.9); out.grid.block(3.5, -3.9, 1.6, 0.5);
      plant(b, -5.2, 3.2, 0.8); b.cyl(0.9, 0.9, 0.04, 0xd84a4a, -1.5, 0.02, 1.8, 20);
      // wardrobe: change clothes here as well as in the menu
      b.box(1.8, 2.2, 0.6, 0x8a6444, -1.4, 1.1, -4.1); b.box(0.04, 2, 0.02, 0x5a4030, -1.4, 1.1, -3.79); for (const sx of [-1, 1]) b.box(0.06, 0.25, 0.05, 0xd8c070, -1.4 + sx * 0.12, 1.2, -3.77);
      out.grid.block(-1.4, -4.1, 0.9, 0.4);
      out.interact.push({ id: 'wardrobe', kind: 'wardrobe', x: -1.4, z: -3.3, r: 1.3, label: 'Kleiderschrank', prompt: 'Umkleiden' });
      door(b, 0, d / 2 - 0.1);
      out.spawn = { x: 0, z: d / 2 - 1.5, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      const fam = region.npcs.find(n => n.role === 'familie') || region.npcs[0];
      out.npcs.push({ id: 'family', role: 'familie', name: fam.name + ' (zu Hause)', x: 1.5, z: -1.8, ry: 0, talk: 'family' });
      out.interact.push({ id: 'tv', kind: 'look', x: 4.6, z: -3.2, r: 1.3, label: 'Fernseher', text: 'Im Fernsehen läuft eine Reportage: „Taschi-Arenen der sechzehn Regionen – wer holt sich dieses Jahr alle Siegel?“' });
      break;
    }
    case 'arena': {
      w = 26; d = 40; h = 9; grid(w, d);
      const tc = new THREE.Color(TYPES[region.types[0]].color).getHex();
      group = room(b, w, d, h, { wall: mix(pal.wall, 0xe8e2d4, 0.5), floor: mix(tc, 0xd8d0c0, 0.75), trim: tc, floorKind: 'stone' });
      // tribunes
      for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { b.box(2, 0.5 + i * 0.5, d - 6, shade(tc, 0.7 + i * 0.05), sx * (w / 2 - 1 - i * 0.0), 0.25 + i * 0.25, 0); }
      out.grid.block(-w / 2 + 1.2, 0, 1.4, d / 2); out.grid.block(w / 2 - 1.2, 0, 1.4, d / 2);
      // leader platform
      b.cyl(4.2, 4.6, 0.6, shade(tc, 1.1), 0, 0.3, -15, 24); b.cyl(3.6, 3.6, 0.08, 0xf5cd77, 0, 0.62, -15, 24);
      for (const sx of [-1, 1]) { b.cyl(0.4, 0.5, 6, 0xf3eee2, sx * 6, 3, -16, 12); b.box(1.6, 3.4, 0.1, tc, sx * 6, 4.5, -15.4); }
      // barrier opened by the arena challenge
      const barrier = new THREE.Group(), bb = new Builder();
      for (let i = -5; i <= 5; i++) bb.cyl(0.12, 0.12, 3.2, 0xf5cd77, i * 0.9, 1.6, 0, 6);
      bb.box(10.4, 0.3, 0.3, tc, 0, 3.2, 0);
      barrier.add(new THREE.Mesh(bb.build(), envMaterial())); barrier.position.set(0, 0, -8); group.add(barrier);
      out.barrier = barrier;
      out.grid.dyn.push((x, z) => !save?.puzzles?.['gym:' + regionId] && Math.abs(z + 8) < 0.7 && Math.abs(x) < 5.2);
      out.grid.dyn.push((x, z) => Math.abs(z + 8) < 0.7 && Math.abs(x) >= 5.2);
      b.box(w, 0.4, 0.5, shade(tc, 0.6), 0, 0.2, -8);
      door(b, 0, d / 2 - 0.1);
      const crest = new THREE.Mesh(new THREE.CircleGeometry(2, 28), new THREE.MeshBasicMaterial({ map: emblemTexture(TYPES[region.types[0]].icon, '#fff8e2', '#' + C(tc).getHexString()) }));
      crest.position.set(0, 5.5, -d / 2 + 0.05); group.add(crest);
      out.spawn = { x: 0, z: d / 2 - 2, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      out.puzzleArea = { x: 0, z: 4, kind: region.gym.mechanic, key: 'gym:' + regionId };
      out.npcs.push({ id: 'gymtr_' + regionId + '_0', trainer: 'gymtr_' + regionId + '_0', role: 'trainer', x: -4.5, z: 12, ry: Math.PI / 2 });
      out.npcs.push({ id: 'gymtr_' + regionId + '_1', trainer: 'gymtr_' + regionId + '_1', role: 'trainer', x: 4.5, z: -11, ry: -Math.PI / 2 });
      out.npcs.push({ id: 'leader', trainer: 'leader_' + regionId, role: 'leader', name: region.gym.leader, x: 0, z: -15.5, ry: 0, leader: true });
      out.interact.push({ id: 'gymguide', kind: 'look', x: 3, z: 16, r: 1.6, label: 'Arena-Berater', text: region.gym.theme + ': ' + region.gym.intro });
      b.box(0.6, 1.8, 0.6, 0x5d7f99, 3, 0.9, 17); out.grid.block(3, 17, 0.4, 0.4);
      out.music = 'gym';
      out.light = 0xfff8ec;
      break;
    }
    case 'cave': {
      w = 44; d = 44; h = 10; grid(w, d);
      group = new THREE.Group();
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: wallTexture(0x5a5f6a, 'stone') }));
      floor.material.map.repeat.set(6, 6); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; group.add(floor);
      const rng = createRng('cave:' + regionId);
      const rockC = [0x5a5f6a, 0x4a4f5a, 0x6a6a72];
      // perimeter walls and pillars
      for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2, r = 20 + rng.next() * 2; b.add(lumpy(new THREE.DodecahedronGeometry(3 + rng.next() * 2, 1), 0.2, i), rockC[i % 3], matrix(Math.cos(a) * r, 2 + rng.next() * 3, Math.sin(a) * r, i, i * 0.3, 0, 1, 1.6, 1), { shade: 0.4 }); }
      const pillars = [[-8, -6], [7, -9], [10, 6], [-10, 8], [0, -14], [-14, -12]];
      for (const [x, z] of pillars) { b.add(lumpy(new THREE.DodecahedronGeometry(2.2, 1), 0.2, x), rockC[1], matrix(x, 3, z, 0, x, 0, 1, 2.2, 1), { shade: 0.4 }); out.grid.block(x, z, 1.8, 1.8); }
      out.grid.dyn.push((x, z) => Math.hypot(x, z) > 18.5 && !(Math.abs(x) < 2.5 && z > 15));
      const crystals = [[-14, 2], [12, -4], [2, 12]];
      const caveName = region.cave || 'Höhle';
      const cc = [0x73dded, 0xffc072, 0xae96fa, 0x98e5cf][['Flüsterhöhle', 'Bernsteingrotte', 'Kristallgrotte', 'Mondhöhle'].indexOf(caveName)] ?? 0x73dded;
      crystals.forEach(([x, z], i) => {
        const found = save?.found?.['crystal:' + caveName + ':' + i];
        const cm = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: cc, emissive: cc, emissiveIntensity: found ? 0.1 : 0.6 }));
        cm.position.set(x, 1.4, z); cm.scale.set(0.7, 1.4, 0.7); group.add(cm);
        const pl = new THREE.PointLight(cc, found ? 0.2 : 1.1, 10); pl.position.set(x, 2, z); group.add(pl);
        out.interact.push({ id: 'crystal' + i, kind: 'crystal', idx: i, cave: caveName, x, z, r: 1.8, label: 'Leuchtkristall', prompt: 'Untersuchen', mesh: cm, light: pl });
        out.grid.block(x, z, 0.6, 0.6);
      });
      out.animators.push((t) => crystals.forEach((_, i) => { const it = out.interact.find(e => e.id === 'crystal' + i); if (it) it.mesh.rotation.y = t * 0.5 + i; }));
      const ch = chestModel(!!save?.chests?.['cave:' + regionId]); ch.position.set(-15, 0, -4); ch.rotation.y = Math.PI / 2; group.add(ch);
      out.interact.push({ id: 'cavechest', kind: 'chest', chestKey: 'cave:' + regionId, x: -15, z: -4, r: 1.8, label: 'Truhe', prompt: 'Öffnen', mesh: ch });
      out.grid.block(-15, -4, 0.6, 0.6);
      // rare encounter spot
      out.interact.push({ id: 'rare', kind: 'rare', x: 0, z: -4, r: 2.2, label: 'Funkelnder Spalt', prompt: 'Nachsehen' });
      b.add(new THREE.ConeGeometry(0.8, 2.4, 6), cc, matrix(0, 1.2, -5.2, 0, 0, 0.2));
      out.grid.block(0, -5.2, 0.6, 0.6);
      // exit
      b.box(6, 0.1, 3, 0x2a2f3a, 0, 0.02, 19);
      out.spawn = { x: 0, z: 16, ry: Math.PI }; out.exit = { x: 0, z: 19.4 };
      out.light = 0x8fb8ff; out.ambience = 'cave'; out.music = 'cave'; out.dark = true;
      out.encounters = { habitat: 'cave', rate: 0.07 };
      out.name = caveName;
      break;
    }
    case 'station': {
      w = 30; d = 22; h = 6; grid(w, d);
      group = room(b, w, d, h, { wall: 0x5a5d66, floor: 0x4a4d55, trim: 0x7d4fa3, floorKind: 'stone' });
      for (let i = 0; i < 4; i++) { b.add(cage(), null, matrix(-11 + i * 3, 0, -8)); out.grid.block(-11 + i * 3, -8, 0.9, 0.9); }
      const dev = captureDevice(); dev.position.set(8, 0, -6); dev.scale.setScalar(1.8); group.add(dev); out.grid.block(8, -6, 1.6, 1.6);
      out.animators.push((t) => { dev.userData.light.material.opacity = 0.5 + Math.sin(t * 7) * 0.4; });
      for (let i = 0; i < 5; i++) { b.box(1.2, 2.4, 1, 0x3a3d45, 13, 1.2, -8 + i * 3.4); b.box(0.06, 0.6, 0.8, [0xff6a3a, 0x7d4fa3, 0xf0974f][i % 3], 12.4, 1.6, -8 + i * 3.4); out.grid.block(13, -8 + i * 3.4, 0.7, 0.6); }
      table(b, -6, 3, 3, 1.2, 0x5a5d66); out.grid.block(-6, 3, 1.6, 0.7);
      door(b, 0, d / 2 - 0.1, 0x3a3d45);
      poster(group, 'Projekt Lichtspeicher', 0, 4, -d / 2 + 0.05, 0, '#5e3a7c');
      out.spawn = { x: 0, z: d / 2 - 2, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      out.npcs.push({ id: 'g2_grunt2', trainer: 'g2_grunt2', role: 'grunt', x: -3, z: 2, ry: Math.PI / 2 });
      out.npcs.push({ id: 'g2_brix', trainer: 'g2_brix', role: 'brix', name: 'Brix', x: 6, z: -4, ry: 0 });
      out.interact.push({ id: 'machine', kind: 'machine', x: 8, z: -3.6, r: 2.6, label: 'Lichtspeicher-Maschine', prompt: 'Untersuchen' });
      out.music = 'guild'; out.light = 0xffd8c0;
      break;
    }
    case 'league': {
      w = 24; d = 60; h = 10; grid(w, d);
      group = room(b, w, d, h, { wall: 0xf1eef8, floor: 0xd8d4e8, trim: 0xd8b04a, floorKind: 'stone' });
      for (let i = 0; i < 5; i++) {
        const z = 18 - i * 10;
        b.cyl(3, 3.3, 0.5, [0x4fb86a, 0x4d9ef0, 0xa39c86, 0xf2c935, 0xffd27a][i], 0, 0.25, z - 3, 24);
        for (const sx of [-1, 1]) { b.cyl(0.45, 0.5, 8, 0xffffff, sx * 9, 4, z, 12); }
        if (i < 4) {
          const gate = new THREE.Group(), gb = new Builder();
          for (let k = -4; k <= 4; k++) gb.cyl(0.1, 0.1, 3.4, 0xd8b04a, k * 0.9, 1.7, 0, 6);
          gate.add(new THREE.Mesh(gb.build(), envMaterial())); gate.position.set(0, 0, z - 6.5); group.add(gate);
          out.dynamic.push({ kind: 'leagueGate', idx: i, mesh: gate });
          out.grid.dyn.push((x, zz) => (save?.league ?? 0) <= i && Math.abs(zz - (z - 6.5)) < 0.6 && Math.abs(x) < 4.2);
        }
        out.grid.dyn.push((x, zz) => Math.abs(zz - (z - 6.5)) < 0.6 && Math.abs(x) >= 4.2);
        b.box(w, 0.6, 0.8, 0xd8d4e8, 0, 0.3, z - 6.5);
        out.npcs.push({ id: 'league_' + i, trainer: 'league_' + i, role: i === 4 ? 'lyra' : 'champion', x: 0, z: z - 3.5, ry: 0, league: i });
      }
      door(b, 0, d / 2 - 0.1, 0x3a2f5a);
      b.cyl(1.2, 1.4, 1, 0xd8d0f0, -6, 0.5, 26); out.grid.block(-6, 26, 1.2, 1.2);
      out.interact.push({ id: 'leagueHeal', kind: 'heal', x: -6, z: 24.4, r: 1.8, label: 'Sternenquelle', prompt: 'Heilen' });
      out.interact.push({ id: 'leagueSave', kind: 'save', x: 6, z: 25, r: 1.6, label: 'Chronik', prompt: 'Speichern' });
      b.box(1, 1.1, 0.8, 0xc8a26a, 6, 0.55, 26); out.grid.block(6, 26, 0.6, 0.5);
      out.spawn = { x: 0, z: d / 2 - 2, ry: Math.PI }; out.exit = { x: 0, z: d / 2 - 0.5 };
      out.music = 'league'; out.light = 0xfff6e0;
      break;
    }
  }
  finish(group, b);
  out.group = group;
  out.w = w; out.d = d; out.h = h;
  return out;
}

const OUTFIT = [0xe86a6a, 0x6aa8e8, 0x6ad89a, 0xf0c040, 0xc58af0];
void windowMaterial; void ballModel;
