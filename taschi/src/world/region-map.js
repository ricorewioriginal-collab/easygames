// Builds the 3D representation of a region layout. Construction is split
// into async steps (yielding to the browser between them) so loading a
// region never freezes the page; a progress callback drives the load screen.
import { THREE } from '../engine/three.js';
import { REGIONS } from '../data/regions.js';
import { TYPES } from '../data/types.js';
import { buildTerrain } from '../engine/terrain.js';
import { heightAt, HALF, grassAt } from '../logic/layout.js';
import { buildWalkGrid } from '../logic/walkgrid.js';
import { InstanceField, vegetationGeometry, rockGeometry, tallGrassGeometry, tuftGeometry, flowerGeometry, MATERIALS } from '../engine/vegetation.js';
import * as BLD from '../engine/buildings.js';
import { Builder, matrix } from '../engine/geometry.js';
import { envMaterial, waterMaterial, glowMaterial, foliageMaterial } from '../engine/materials.js';
import { createRng } from '../core/rng.js';
import { distToPolyline } from '../core/noise.js';
import { particleTexture } from '../engine/textures.js';

const frame = () => new Promise(r => requestAnimationFrame(() => r()));

export const SUMMIT_PALETTE = { grass: 0xb8b4d0, grass2: 0x9a98c0, dirt: 0xd8d0e8, rock: 0x8a88a8, sky: [0x2a3a8a, 0xf0c8e8], fog: 0xd8c8e8, water: 0xffffff, roof: 0x3c5fa8, wall: 0xf1eef8, trim: 0xd8b04a, accent: 0xffd27a };

export function paletteFor(r) {
  if (r === 16) return { ...SUMMIT_PALETTE, stone: 0xc8c4d8 };
  const p = REGIONS[r].palette;
  return { ...p, stone: { volcanic: 0x5a5050, snow: 0xb8c4cc, crystal: 0x8a88a0, mesa: 0xc89a6a }[REGIONS[r].biome] || 0xa8a296, leaf: p.leaf, blossom: REGIONS[r].biome === 'grove' ? 0xf7b3cc : 0xf5a9c6 };
}

const HOUSE_STYLE = { valley: 'timber', coast: 'plaster', plains: 'timber', grove: 'plaster', forest: 'timber', cliffs: 'stone', volcanic: 'stone', 'meadow-night': 'plaster', swamp: 'stilts', snow: 'snow', canopy: 'timber', savanna: 'adobe', crystal: 'stone', 'bay-night': 'plaster', mesa: 'adobe', sky: 'dome' };

export async function buildRegionMap(L, { quality, onProgress = () => {}, save }) {
  const r = L.region, pal = paletteFor(r);
  const region = REGIONS[r];
  const root = new THREE.Group(); root.name = 'region:' + r;
  const animators = [], interact = [], dynamic = [];
  const H = (x, z) => heightAt(L, x, z);
  const place = (obj, x, z, yaw = 0, yOff = 0) => { obj.position.set(x, H(x, z) + yOff, z); obj.rotation.y = yaw; root.add(obj); return obj; };
  const typeColor = r === 16 ? 0x3c5fa8 : new THREE.Color(TYPES[region.types[0]].color).getHex();

  onProgress(0.05, 'Gelände formen …');
  await frame();
  const terrain = buildTerrain(L, pal, quality.terrainRes > 1024 ? 'high' : 'medium');
  root.add(terrain);
  onProgress(0.25, 'Wasser und Wege …');
  await frame();

  // ---------------------------------------------------------------- water
  for (const w of L.water) {
    if (w.kind === 'lake' || w.kind === 'ice') {
      const geo = new THREE.CircleGeometry(1, 48);
      const mat = w.kind === 'ice' ? new THREE.MeshPhongMaterial({ color: 0xd8f0fa, shininess: 120, specular: 0xffffff, transparent: true, opacity: 0.92 }) : waterMaterial(w.swamp ? 0x4f7a5a : pal.water);
      const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.scale.set(w.rx + 0.6, w.rz + 0.6, 1);
      m.position.set(w.cx, w.kind === 'ice' ? -0.25 : L.waterLevel, w.cz); m.receiveShadow = true; root.add(m);
    } else if (w.kind === 'river' || w.kind === 'lava') {
      const pts = w.pts, pos = [], idx = [];
      for (let i = 0; i < pts.length; i++) {
        const [x, z] = pts[i], [nx, nz] = pts[Math.min(pts.length - 1, i + 1)], [px, pz] = pts[Math.max(0, i - 1)];
        const dx = nx - px, dz = nz - pz, len = Math.hypot(dx, dz) || 1, ox = -dz / len * (w.width / 2 + 1.4), oz = dx / len * (w.width / 2 + 1.4);
        const bank = Math.min(H(x + ox * 1.3, z + oz * 1.3), H(x - ox * 1.3, z - oz * 1.3));
        const y = Math.max(bank - 0.45, H(x, z) + 0.6);
        pos.push(x + ox, y, z + oz, x - ox, y, z - oz);
        if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const mat = w.kind === 'lava' ? new THREE.MeshBasicMaterial({ color: 0xff6a2a }) : waterMaterial(pal.water);
      if (w.kind === 'lava') { mat.onBeforeCompile = (s) => { s.uniforms.uTime = { value: 0 }; }; animators.push((t) => mat.color.setHSL(0.04 + Math.sin(t * 2) * 0.01, 1, 0.5 + Math.sin(t * 3) * 0.05)); }
      const m = new THREE.Mesh(g, mat); m.receiveShadow = true; root.add(m);
    } else if (w.kind === 'sea' || w.kind === 'bay') {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 1, 1), waterMaterial(pal.water, { opacity: 0.9 }));
      m.rotation.x = -Math.PI / 2; m.position.y = L.waterLevel - (w.cliff ? 6 : 0); root.add(m);
    } else if (w.kind === 'clouds') {
      const cm = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshLambertMaterial({ color: 0xfaf4ff, emissive: 0x6a6080, emissiveIntensity: 0.25 }));
      cm.rotation.x = -Math.PI / 2; cm.position.y = -26; root.add(cm);
      const puffs = new THREE.Group(), pm = new THREE.SpriteMaterial({ map: particleTexture('soft'), color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false });
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, d = 95 + (i % 5) * 18; const s = new THREE.Sprite(pm); s.scale.set(40, 22, 1); s.position.set(Math.cos(a) * d, -14 + (i % 3) * 4, Math.sin(a) * d); puffs.add(s); }
      root.add(puffs);
      animators.push((t) => { puffs.rotation.y = t * 0.01; });
    }
  }
  // waterfall decoration where rivers leave the map edge (cliffs/forest)
  for (const w of L.water.filter(w => w.kind === 'river')) {
    const end = w.pts[w.pts.length - 1];
    if (Math.abs(end[1]) > HALF - 8) {
      const wf = new THREE.Mesh(new THREE.PlaneGeometry(w.width, 12), waterMaterial(0xdff4ff, { opacity: 0.7 }));
      wf.position.set(end[0], H(end[0], end[1] - Math.sign(end[1]) * 8) + 4, end[1] - Math.sign(end[1]) * 3); root.add(wf);
    }
  }

  // ---------------------------------------------------------------- bridges & boardwalks
  for (const br of L.bridges) { const b = BLD.bridge(br.len, br.width); b.rotation.y = br.yaw; b.position.set(br.x, Math.max(H(br.x, br.z), L.waterLevel) - 0.05 + 0.35, br.z); root.add(b); }
  for (const rd of L.roads.filter(r => r.kind === 'boardwalk')) {
    for (let i = 1; i < rd.pts.length; i += 2) {
      const [ax, az] = rd.pts[i - 1], [bx, bz] = rd.pts[Math.min(rd.pts.length - 1, i + 1)];
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, len = Math.hypot(bx - ax, bz - az);
      if (len < 0.5) continue;
      const m = new THREE.Mesh(BLD.boardwalkSegment(len + 0.4, rd.width), envMaterial());
      m.position.set(mx, Math.max(H(mx, mz), L.waterLevel + 0.15), mz); m.rotation.y = Math.atan2(bx - ax, bz - az); m.receiveShadow = true; root.add(m);
    }
  }
  onProgress(0.4, 'Gebäude errichten …');
  await frame();

  // ---------------------------------------------------------------- buildings
  const style = HOUSE_STYLE[L.biome] || 'timber';
  let houseVariant = 0;
  for (const b of L.buildings) {
    let obj;
    if (b.kind === 'house') obj = BLD.house(pal, style, houseVariant++);
    else if (b.kind === 'heal') obj = BLD.healCenter(pal);
    else if (b.kind === 'shop') obj = BLD.shop(pal);
    else if (b.kind === 'lab') obj = BLD.lab(pal);
    else if (b.kind === 'arena') obj = BLD.arena(pal, typeColor, TYPES[region.types[0]].icon);
    else if (b.kind === 'pavilion') obj = BLD.pavilion(pal, typeColor);
    else if (b.kind === 'station') obj = BLD.station();
    else if (b.kind === 'league') obj = BLD.leagueHall();
    if (!obj) continue;
    place(obj, b.x, b.z, b.yaw);
    if (b.enter) interact.push({ id: 'door:' + b.id, kind: 'door', x: b.door.x, z: b.door.z, r: 1.9, label: b.label, target: b.enter, building: b, prompt: 'Betreten' });
    if (b.kind === 'house' && !b.enter) interact.push({ id: 'knock:' + b.id, kind: 'knock', x: b.door.x, z: b.door.z, r: 1.6, label: b.label, prompt: 'Klopfen' });
    if (b.kind === 'pavilion') interact.push({ id: 'champion', kind: 'champion', x: b.x, z: b.z, r: 3.5, label: region?.champion?.name, prompt: 'Champion' });
  }
  if (L.dome) {
    const d = BLD.glassDome(L.dome.r);
    place(d, L.dome.x, L.dome.z, L.dome.yaw, 0.05);
    const pod = BLD.podium();
    place(pod, L.dome.podium.x, L.dome.podium.z, L.dome.yaw, 0.25);
    const balls = [];
    ['glutzahn', 'plaetscher', 'samenling'].forEach((id, i) => {
      const ball = BLD.ballModel([0xf1845b, 0x64b7e4, 0x79be88][i], 0.26);
      const lx = (i - 1) * 0.8;
      const wx = L.dome.podium.x + Math.cos(L.dome.yaw) * lx, wz = L.dome.podium.z - Math.sin(L.dome.yaw) * lx;
      ball.position.set(wx, H(L.dome.podium.x, L.dome.podium.z) + 1.35, wz);
      ball.rotation.y = L.dome.yaw;
      root.add(ball); balls.push(ball);
      // interaction points fan out around the podium so each ball has its own spot
      const fa = L.dome.yaw + (i - 1) * 0.75;
      interact.push({ id: 'starter:' + i, kind: 'starter', idx: i, species: id, x: L.dome.podium.x + Math.sin(fa) * 2.3, z: L.dome.podium.z + Math.cos(fa) * 2.3, r: 0.9, label: ['Roter', 'Blauer', 'Grüner'][i] + ' Taschiball', prompt: 'Untersuchen' });
    });
    dynamic.push({ kind: 'starterBalls', balls });
    animators.push((t) => balls.forEach((b, i) => { b.visible = !(save?.flags?.starterChosen && save.flags.starter === ['glutzahn', 'plaetscher', 'samenling'][i]); b.position.y = H(L.dome.podium.x, L.dome.podium.z) + 1.35 + Math.sin(t * 2 + i) * 0.04; }));
  }
  onProgress(0.55, 'Stadt gestalten …');
  await frame();

  // ---------------------------------------------------------------- town props
  if (L.plaza && r !== 16) {
    place(BLD.fountain(pal), L.plaza.x, L.plaza.z);
    interact.push({ id: 'fountain', kind: 'look', x: L.plaza.x, z: L.plaza.z, r: 4.2, label: 'Brunnen', text: 'Das Wasser des Brunnens glitzert im Licht. Eine Inschrift: „' + region.town + ' – gegründet von Menschen und Taschis.“' });
    const benches = new Builder(), lampB = new Builder(), lampGlow = new Builder();
    const lamp = BLD.streetLamp();
    // positions come from L.props (addProps in layout.js), which also makes them solid
    for (const p of L.props) {
      const x = p.x, z = p.z, a = p.a;
      if (p.kind === 'lamp') { lampB.add(lamp.geo.clone(), null, matrix(x, H(x, z), z)); lampGlow.add(lamp.glow.clone(), null, matrix(x, H(x, z), z)); }
      else if (p.kind === 'bench') benches.add(BLD.bench(), null, matrix(x, H(x, z), z, 0, -a + Math.PI / 2 + Math.PI, 0));
      else if (p.kind === 'flowerbed') { benches.box(2.2, 0.35, 1.2, 0x8a6a4a, x, H(x, z) + 0.17, z, -a); for (let k = 0; k < 6; k++) benches.sphere(0.18, [0xf47a8a, 0xffd25a, 0xffffff, 0xc58af0, 0xff9a5a][k % 5], x + Math.cos(-a) * (k - 2.5) * 0.33, H(x, z) + 0.5, z + Math.sin(-a) * (k - 2.5) * 0.33, 1, 0.8, 1, 6); }
    }
    const bm = new THREE.Mesh(benches.build(), envMaterial()); bm.castShadow = true; bm.receiveShadow = true; root.add(bm);
    const lm = new THREE.Mesh(lampB.build(), envMaterial()); lm.castShadow = true; root.add(lm);
    root.add(new THREE.Mesh(lampGlow.build(), BLD.windowMaterial));
  }
  for (const s of L.signs) { const sp = BLD.signpost(s.text); place(sp, s.x, s.z, Math.atan2(-s.x, 16 - s.z)); interact.push({ id: 'sign:' + s.text, kind: 'look', x: s.x, z: s.z, r: 1.6, label: 'Wegweiser', text: s.text, prompt: 'Lesen' }); }
  for (const g of L.gates) {
    const gt = BLD.gate(pal, g.label, true);
    place(gt, g.x, g.z, g.yaw);
    interact.push({ id: 'gate:' + g.id, kind: 'gate', x: g.x, z: g.z + (g.id === 'south' ? -2 : 2), r: 3.4, label: g.label, to: g.to, gate: g.id, prompt: 'Reisen' });
    const barrier = new THREE.Group();
    const bb = new Builder();
    for (let i = -3; i <= 3; i++) bb.box(0.16, 4.6, 0.16, 0x5a4636, i * 0.9, 2.3, 0);
    bb.box(6.4, 0.2, 0.2, 0x5a4636, 0, 3.8, 0); bb.box(6.4, 0.2, 0.2, 0x5a4636, 0, 1.2, 0);
    barrier.add(new THREE.Mesh(bb.build(), envMaterial()));
    place(barrier, g.x, g.z, g.yaw);
    dynamic.push({ kind: 'gateBarrier', gate: g.id, mesh: barrier, to: g.to });
  }

  // landmark
  if (L.landmark) {
    const lm = BLD.landmark(L.landmark.kind, pal);
    const yOff = L.landmark.kind === 'volcano' ? 0 : 0;
    place(lm, L.landmark.x, L.landmark.z, Math.atan2(-L.landmark.x, 16 - L.landmark.z), yOff);
    if (L.landmark.kind === 'volcano') lm.position.y = 0;
    if (lm.userData.animate) animators.push(lm.userData.animate);
    interact.push({ id: 'landmark', kind: 'landmark', x: L.landmark.x, z: L.landmark.z, r: landmarkReach(L.landmark.kind), label: L.landmark.name, prompt: 'Ansehen' });
  }
  // chest, items
  if (L.chest) {
    const opened = !!save?.chests?.['region:' + r];
    const ch = BLD.chestModel(opened);
    place(ch, L.chest.x, L.chest.z, Math.atan2(-L.chest.x, 10 - L.chest.z));
    interact.push({ id: 'chest', kind: 'chest', x: L.chest.x, z: L.chest.z, r: 1.8, label: 'Truhe', prompt: 'Öffnen', mesh: ch });
  }
  const sparkleMat = new THREE.SpriteMaterial({ map: particleTexture('star'), color: 0xfff2a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  for (const it of L.items) {
    const s = new THREE.Sprite(sparkleMat); s.scale.set(0.6, 0.6, 1);
    place(s, it.x, it.z, 0, 0.45);
    const entry = { id: 'item:' + it.id, kind: 'item', x: it.x, z: it.z, r: 1.4, label: it.quest ? it.label : 'Glitzern', prompt: 'Aufheben', item: it, mesh: s };
    interact.push(entry);
  }
  animators.push((t) => { sparkleMat.opacity = 0.55 + Math.sin(t * 4) * 0.35; sparkleMat.rotation = t; });

  // obstacle (needs a Taschi ability)
  if (L.obstacle) {
    const o = L.obstacle;
    const ob = new Builder();
    if (o.kind === 'boulder') ob.add(new THREE.DodecahedronGeometry(1.4, 1), pal.rock || 0x8a8a8a, matrix(0, 1.1, 0), { shade: 0.3 });
    else for (let i = 0; i < 9; i++) ob.add(new THREE.ConeGeometry(0.25, 1.6, 5), 0x5a6a3a, matrix(Math.cos(i * 0.7) * 0.9, 0.8, Math.sin(i * 0.7) * 0.9, Math.sin(i) * 0.4, i, Math.cos(i) * 0.4));
    const om = new THREE.Mesh(ob.build(), envMaterial()); om.castShadow = true;
    place(om, o.x, o.z);
    interact.push({ id: 'obstacle', kind: 'obstacle', x: o.x, z: o.z, r: 2.6, label: o.kind === 'boulder' ? 'Großer Felsbrocken' : 'Dorniges Gestrüpp', prompt: 'Untersuchen', obstacle: o, mesh: om });
    const rewardBall = BLD.ballModel(0xf0c040, 0.22);
    place(rewardBall, o.reward.x, o.reward.z, 0, 0.25);
    interact.push({ id: 'gatedItem', kind: 'gatedItem', x: o.reward.x, z: o.reward.z, r: 1.4, label: 'Gegenstand', prompt: 'Aufheben', reward: o.reward, mesh: rewardBall });
  }
  // cave entrance
  if (L.cave) {
    const cb = new Builder();
    for (let i = 0; i < 9; i++) { const a = Math.PI * (i / 8); cb.add(new THREE.DodecahedronGeometry(1.8 + (i % 3) * 0.4, 0), pal.rock || 0x7a7a7a, matrix(Math.cos(a) * 3.4, Math.sin(a) * 3.6, 0, i, i * 0.7, 0), { shade: 0.3 }); }
    cb.add(new THREE.CircleGeometry(3, 18, 0, Math.PI), 0x0d0d12, matrix(0, 0, 0.6));
    const cm = new THREE.Mesh(cb.build(), envMaterial()); cm.castShadow = true;
    const yaw = Math.atan2(-L.cave.x, -L.cave.z) ;
    place(cm, L.cave.x, L.cave.z, yaw);
    interact.push({ id: 'cave', kind: 'door', target: 'cave', x: L.cave.x + Math.sin(yaw) * 2.5, z: L.cave.z + Math.cos(yaw) * 2.5, r: 2.4, label: L.cave.name, prompt: 'Betreten' });
  }
  // legend shrine
  if (L.legend) {
    const sm = new THREE.Mesh(BLD.shrineStone(0xd8d0f0), envMaterial()); sm.castShadow = true;
    place(sm, L.legend.x, L.legend.z);
    interact.push({ id: 'legend', kind: 'legend', x: L.legend.x, z: L.legend.z + 1, r: 3.2, label: 'Uralter Schrein', prompt: 'Untersuchen' });
  }
  // guild camp
  if (L.guild) {
    const camp = new THREE.Group();
    const balloon = BLD.guildBalloon(); balloon.position.set(0, 0, -4); camp.add(balloon);
    const tb = new Builder();
    const tg = BLD.tent(); tb.add(tg, null, matrix(-5, 0, 2)); tb.add(BLD.tent(0xf0974f), null, matrix(5, 0, 1, 0, 0.6, 0));
    const cages = [];
    for (let i = 0; i < 3; i++) { tb.add(BLD.cage(), null, matrix(-3 + i * 3, 0, 5.5)); cages.push([-3 + i * 3, 5.5]); }
    for (let i = 0; i < 4; i++) tb.box(0.9, 0.9, 0.9, 0x6a4a3a, 6 + (i % 2) * 1.1, 0.45 + Math.floor(i / 2) * 0.9, -2 - (i % 2) * 0.3, i * 0.3);
    const tm = new THREE.Mesh(tb.build(), envMaterial({ side: THREE.DoubleSide })); tm.castShadow = true; camp.add(tm);
    const dev = BLD.captureDevice(); dev.position.set(-6, 0, -3); camp.add(dev);
    place(camp, L.guild.x, L.guild.z);
    const bl = balloon.userData.balloon;
    animators.push((t) => { bl.position.y = Math.sin(t * 0.8) * 0.3; bl.rotation.y = Math.sin(t * 0.3) * 0.1; bl.userData.flame.scale.setScalar(0.8 + Math.random() * 0.4); dev.userData.light.material.opacity = 0.5 + Math.sin(t * 6) * 0.4; });
    dynamic.push({ kind: 'guildCamp', group: camp, cages, device: dev });
    interact.push({ id: 'guild', kind: 'guild', x: L.guild.x, z: L.guild.z + 2, r: 7, label: 'Schattengilde', prompt: 'Eingreifen', site: region.guild });
  }
  if (r === 16) {
    const lm = root.children.find(c => c.userData.core);
    void lm;
    interact.push({ id: 'summitHeal', kind: 'heal', x: L.healStation.x, z: L.healStation.z, r: 2.2, label: 'Heilquelle', prompt: 'Heilen' });
    const hs = new THREE.Mesh(BLD.shrineStone(0xffd27a), envMaterial()); place(hs, L.healStation.x, L.healStation.z);
    interact.push({ id: 'summitMachine', kind: 'guild', x: 0, z: -12, r: 7, label: 'Vargas Maschine', prompt: 'Eingreifen', site: 7 });
  }
  onProgress(0.7, 'Pflanzen wachsen lassen …');
  await frame();

  // ---------------------------------------------------------------- vegetation (instanced)
  const field = new InstanceField({ chunk: 40, lodDistance: quality.lodDistance, drawDistance: quality.drawDistance });
  const rng = createRng('veg:' + r);
  const types = new Set();
  const densityKeep = quality.vegetation;
  for (const t of L.trees) { t.hidden = rng.next() > densityKeep && t.type !== 'giant'; if (t.hidden) continue; const tint = new THREE.Color(1, 1, 1).offsetHSL((rng.next() - 0.5) * 0.04, 0, (rng.next() - 0.5) * 0.14).getHex(); field.add(t.type, t.x, t.y - 0.1, t.z, t.s, t.ry, tint); types.add(t.type); }
  for (const b of L.bushes) { if (rng.next() > densityKeep) continue; field.add('bush', b.x, b.y - 0.05, b.z, b.s, b.ry, new THREE.Color(1, 1, 1).offsetHSL(0, 0, (rng.next() - 0.5) * 0.15).getHex()); types.add('bush'); }
  for (const k of L.rocks) { field.add('rock_' + k.kind, k.x, k.y - 0.15, k.z, k.s, k.ry, new THREE.Color(1, 1, 1).offsetHSL(0, 0, (rng.next() - 0.5) * 0.15).getHex()); types.add('rock_' + k.kind); }
  // tall grass patches
  // meadows: clumps only where grassAt() says so, so the visible grass and the
  // encounter zone always match (roads and water stay free). Density follows
  // the quality preset to keep phones fast.
  const grassDensity = 0.62 * Math.max(0.45, quality.vegetation);
  const tint = new THREE.Color();
  for (const g of L.grass) {
    const n = Math.round(Math.PI * g.rx * g.rz * grassDensity * 1.25);
    for (let i = 0; i < n; i++) {
      const x = g.x + (rng.next() - 0.5) * g.w * 1.12, z = g.z + (rng.next() - 0.5) * g.d * 1.12;
      const s = 0.8 + rng.next() * 0.45, ry = rng.next() * 6, l = (rng.next() - 0.5) * 0.12;
      if (grassAt(L, x, z) !== g) continue;
      field.add('tallgrass', x, H(x, z) - 0.05, z, s, ry, tint.setRGB(1, 1, 1).offsetHSL(0, 0, l).getHex());
    }
  }
  types.add('tallgrass');
  // tufts and flowers scattered on open ground
  const tuftCount = Math.round(3600 * quality.tufts * (L.cfg.ground === 'snow' ? 0.2 : 1));
  const flowerCount = Math.round(950 * quality.tufts * L.cfg.flowers);
  const flowerCols = [0xffd75a, 0xf47a8a, 0xffffff, 0xc58af0, 0xff9a5a, 0x7ab8ff];
  const okGround = (x, z) => L.waterDist[0] !== undefined && Math.abs(x) < HALF - 4 && Math.abs(z) < HALF - 4 && !L.roads.some(rd => Math.abs(rd.pts[0][0] - x) < 400 && distToPolyline(x, z, rd.pts) < rd.width / 2 + 0.4) && Math.hypot(x - L.plaza.x, z - L.plaza.z) > L.plaza.r + 0.5;
  for (let i = 0, tries = 0; i < tuftCount && tries < tuftCount * 3; tries++) {
    const x = (rng.next() - 0.5) * 2 * (HALF - 4), z = (rng.next() - 0.5) * 2 * (HALF - 4);
    if (!okGround(x, z) || insideBuilding(L, x, z) || waterNear(L, x, z)) continue;
    field.add('tuft', x, H(x, z), z, 0.8 + rng.next() * 0.8, rng.next() * 6, new THREE.Color(1, 1, 1).offsetHSL(0, 0, (rng.next() - 0.5) * 0.2).getHex()); i++;
  }
  for (let i = 0, tries = 0; i < flowerCount && tries < flowerCount * 3; tries++) {
    const cx = (rng.next() - 0.5) * 2 * (HALF - 8), cz = (rng.next() - 0.5) * 2 * (HALF - 8);
    const col = flowerCols[Math.floor(rng.next() * flowerCols.length)];
    for (let k = 0; k < 6; k++) { const x = cx + (rng.next() - 0.5) * 3, z = cz + (rng.next() - 0.5) * 3; if (!okGround(x, z) || insideBuilding(L, x, z) || waterNear(L, x, z)) continue; field.add('flower', x, H(x, z), z, 0.8 + rng.next() * 0.5, rng.next() * 6, col); i++; }
  }
  types.add('tuft'); types.add('flower');
  const leafPal = { ...pal, leaf: new THREE.Color(pal.grass).multiplyScalar(L.biome === 'snow' ? 0.6 : 0.78).getHex() };
  const geos = {};
  for (const t of types) {
    if (t.startsWith('rock_')) { const g = rockGeometry(t.slice(5) === 'crystal' ? 'crystal' : L.biome === 'snow' ? 'snow' : t.slice(5), t.slice(5) === 'crystal' ? (pal.accent || 0xbff4ff) : pal.rock); geos[t] = { ...g, material: MATERIALS.rock(), castShadow: quality.shadows > 0, receiveShadow: true }; }
    else if (t === 'tallgrass') geos[t] = { high: tallGrassGeometry(new THREE.Color(pal.grass).multiplyScalar(0.72).getHex()), material: MATERIALS.grass(), castShadow: false, far: 0.6 };
    else if (t === 'tuft') geos[t] = { high: tuftGeometry(new THREE.Color(pal.grass2 || pal.grass).multiplyScalar(0.85).getHex()), material: MATERIALS.grass(), far: 0.35 };
    else if (t === 'flower') geos[t] = { high: flowerGeometry(), material: foliageMaterial({ sway: 0.5, detail: false }), far: 0.4 };
    else { const g = vegetationGeometry(t, leafPal); geos[t] = { ...g, material: t === 'crystal' ? MATERIALS.rock() : MATERIALS.foliage(), castShadow: quality.shadows > 0, receiveShadow: false, extent: t === 'giant' ? 10 : 0 }; }
  }
  root.add(field.build(geos));
  onProgress(0.85, 'Kollisionen berechnen …');
  await frame();
  const grid = buildWalkGrid(L);
  onProgress(0.95, 'Bereit');
  return {
    root, layout: L, grid, interact, animators, dynamic, field, palette: pal, region: r,
    height: (x, z) => H(x, z),
    update(t, dt, camera, focus) { for (const a of animators) a(t, this.night || 0); this.visibleChunks = field.update(camera, focus); }
  };
}

function landmarkReach(kind) { return { volcano: 22, bigtree: 8, windmills: 8, observatory: 7.5, suntemple: 9.5, crystalspires: 6, mill: 7, lighthouse: 6, machine: 8 }[kind] || 6; }
function insideBuilding(L, x, z) {
  for (const b of L.buildings) { const rot = Math.abs(Math.sin(b.yaw)) > 0.5, hw = (rot ? b.d : b.w) / 2 + 0.5, hd = (rot ? b.w : b.d) / 2 + 0.5; if (Math.abs(x - b.x) < hw && Math.abs(z - b.z) < hd) return true; }
  if (L.puzzle && Math.abs(x - L.puzzle.x) < L.puzzle.size / 2 + 1 && Math.abs(z - L.puzzle.z) < L.puzzle.size / 2 + 1) return true;
  if (L.dome && Math.hypot(x - L.dome.x, z - L.dome.z) < L.dome.r) return true;
  return false;
}
function waterNear(L, x, z) {
  const n = 161, i = Math.round((x + 100) / 1.25), j = Math.round((z + 100) / 1.25);
  return (L.waterDist[j * n + i] ?? 10) < 1.2;
}

void glowMaterial;
