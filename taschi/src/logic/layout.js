// Region layout generator (pure, deterministic). Produces everything the 3D
// map builder and the collision grid need: terrain heights, roads, water,
// buildings with doors, gates, grass, trees, NPC homes, trainers, items,
// puzzle area, champion pavilion, guild camp, cave and legend shrine.
import { REGIONS } from '../data/regions.js';
import { createRng } from '../core/rng.js';
import { createNoise, smoothstep, distToPolyline, smoothPath } from '../core/noise.js';

// The walkable land reaches ~108 units from the centre; the outer ring beyond
// the town (routes, meadows and side fields) makes every region roughly twice
// as large as before while keeping the 1.25-unit terrain cell size.
export const SIZE = 260, HALF = 130, CELLS = 208, CELL = SIZE / CELLS;
// Gate/spawn distance from the centre along the north-south axis.
export const GATE_Z = 122, SPAWN_Z = 114;

export const BIOMES = {
  valley: { hill: 7, ground: 'grass', water: 'river', trees: { oak: 5, pine: 1, bush: 3 }, density: 1, rocks: 0.6, flowers: 1 },
  coast: { hill: 5, ground: 'grass', water: 'sea', trees: { palm: 4, oak: 1, bush: 2 }, density: 0.6, rocks: 1, flowers: 0.6 },
  plains: { hill: 4, ground: 'grass', water: 'lake', trees: { oak: 3, bush: 3, pine: 1 }, density: 0.45, rocks: 0.5, flowers: 1.4 },
  grove: { hill: 6, ground: 'grass', water: 'pond', trees: { blossom: 6, oak: 1, bush: 2 }, density: 0.9, rocks: 0.5, flowers: 1.6 },
  forest: { hill: 7, ground: 'forest', water: 'river', trees: { oak: 3, pine: 4, mushroom: 1.4, bush: 3 }, density: 1.9, rocks: 0.8, flowers: 0.6 },
  cliffs: { hill: 13, ground: 'grass', water: 'seaLow', trees: { pine: 3, bush: 2 }, density: 0.5, rocks: 1.8, flowers: 0.7 },
  volcanic: { hill: 9, ground: 'ash', water: 'lava', trees: { dead: 3, bush: 0.6 }, density: 0.35, rocks: 2.2, flowers: 0.1 },
  'meadow-night': { hill: 5, ground: 'grass', water: 'lake', trees: { oak: 2, blossom: 1, bush: 2 }, density: 0.6, rocks: 0.6, flowers: 1.3 },
  swamp: { hill: 3, ground: 'swamp', water: 'swamp', trees: { willow: 4, dead: 1, bush: 2 }, density: 1.1, rocks: 0.4, flowers: 0.3 },
  snow: { hill: 9, ground: 'snow', water: 'ice', trees: { snowpine: 6, bush: 0.5 }, density: 1, rocks: 1.4, flowers: 0 },
  canopy: { hill: 6, ground: 'forest', water: 'river', trees: { giant: 2, oak: 3, pine: 1, bush: 3 }, density: 1.5, rocks: 0.5, flowers: 0.8 },
  savanna: { hill: 4, ground: 'dry', water: 'lake', trees: { acacia: 4, bush: 2 }, density: 0.3, rocks: 1.1, flowers: 0.4 },
  crystal: { hill: 11, ground: 'rocky', water: 'lake', trees: { pine: 2, crystal: 3 }, density: 0.5, rocks: 2, flowers: 0.3 },
  'bay-night': { hill: 5, ground: 'grass', water: 'bay', trees: { palm: 2, oak: 2, bush: 2 }, density: 0.6, rocks: 1, flowers: 0.6 },
  mesa: { hill: 10, ground: 'dry', water: 'canyon', trees: { acacia: 2, cactus: 3 }, density: 0.35, rocks: 1.6, flowers: 0.2 },
  sky: { hill: 4, ground: 'grass', water: 'clouds', trees: { blossom: 2, oak: 2, bush: 3 }, density: 0.5, rocks: 0.6, flowers: 1.4 }
};

// Building footprints (w along local x, d along local z; door on local +z).
export const BUILDING_SIZE = { heal: [12, 10], shop: [10, 8], lab: [12, 9], house: [8, 7], arena: [20, 16], pavilion: [10, 10], dome: [12, 12], station: [14, 10], league: [22, 18] };
const FACE_YAW = { s: 0, e: Math.PI / 2, n: Math.PI, w: -Math.PI / 2 };

export function buildLayout(r) {
  if (r === 16) return buildSummitLayout();
  const region = REGIONS[r];
  const biome = BIOMES[region.biome] || BIOMES.valley;
  const rng = createRng('layout:' + r);
  const noise = createNoise('terrain:' + r);
  const M = r % 2 ? -1 : 1; // mirror odd regions
  const X = (x) => x * M;
  const face = (f) => M < 0 ? ({ e: 'w', w: 'e' }[f] || f) : f;
  const L = { region: r, biome: region.biome, cfg: biome, size: SIZE, mirror: M, roads: [], buildings: [], gates: [], grass: [], water: [], bridges: [], trees: [], rocks: [], bushes: [], props: [], npcs: [], trainers: [], items: [], signs: [], areas: [], spawn: {} };
  const jit = (a) => (rng.next() - 0.5) * 2 * a;

  // --- water bodies ------------------------------------------------------
  const W = biome.water;
  if (W === 'river' || W === 'canyon' || W === 'lava') {
    const pts = smoothPath([[X(-134), -38 + jit(10)], [X(-104), -30], [X(-64), -2 + jit(6)], [X(-52), 34 + jit(6)], [X(-68), 70], [X(-80), 104], [X(-86), 134]], 4);
    L.water.push({ kind: W === 'lava' ? 'lava' : 'river', pts, width: W === 'canyon' ? 7 : 8, depth: W === 'canyon' ? 6 : 2.2 });
  }
  if (W === 'sea') L.water.push({ kind: 'sea', side: M, line: 64, wobble: 6, depth: 4 });
  if (W === 'seaLow') L.water.push({ kind: 'sea', side: -M, line: 70, wobble: 4, depth: 10, cliff: true });
  if (W === 'bay') L.water.push({ kind: 'bay', cx: X(70), cz: 70, r: 46, depth: 4 });
  if (W === 'lake' || W === 'ice') L.water.push({ kind: W === 'ice' ? 'ice' : 'lake', cx: X(44), cz: 62, rx: 13 + jit(2), rz: 9 + jit(2), depth: 2.4 });
  if (W === 'pond') L.water.push({ kind: 'lake', cx: X(-44), cz: 46, rx: 10, rz: 7, depth: 1.8 });
  if (W === 'swamp') for (let i = 0; i < 7; i++) L.water.push({ kind: 'lake', cx: X(jit(70) - 10), cz: jit(70), rx: 6 + rng.next() * 6, rz: 4 + rng.next() * 5, depth: 1.2, swamp: true });
  if (W === 'clouds') L.water.push({ kind: 'clouds', radius: 84 });

  // --- core places ---------------------------------------------------------
  const plaza = { x: 0, z: 16, r: 13 };
  L.plaza = plaza;
  const B = (kind, x, z, f, extra = {}) => {
    const [w, d] = BUILDING_SIZE[kind];
    const fc = face(f), yaw = FACE_YAW[fc];
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    const b = { kind, x: X(x), z, face: fc, yaw, w, d, door: { x: X(x) + dx * (d / 2 + 1.2), z: z + dz * (d / 2 + 1.2) }, ...extra };
    b.id = extra.id || kind;
    L.buildings.push(b);
    return b;
  };
  B('heal', -21, 18, 'e', { label: 'Heilzentrum', enter: 'heal' });
  B('shop', 21, 20, 'w', { label: 'Laden', enter: 'shop' });
  if (r === 0) {
    B('lab', -30, -2, 'e', { label: 'Labor Professor Ulme', enter: 'lab' });
    L.dome = { x: X(-15), z: -2, r: 6.5, yaw: FACE_YAW[face('e')], podium: { x: X(-15.5), z: -2 } };
    L.areas.push({ kind: 'dome', x: L.dome.x, z: L.dome.z, r: 7.5 });
  } else B('lab', -20, -2, 'e', { label: 'Labor ' + region.professor.title, enter: 'lab' });
  B('house', 19, 1, 'w', { id: 'house0', label: 'Wohnhaus', enter: 'house' });
  B('house', -18, 39, 'e', { id: 'house1', label: 'Wohnhaus' });
  B('house', 19, 41, 'w', { id: 'house2', label: 'Wohnhaus' });
  B('house', 33, 6, 'w', { id: 'house3', label: 'Wohnhaus' });
  const arena = B('arena', -42, -34, 's', { label: region.gym.theme, enter: 'arena' });
  const puzzle = { x: X(-42), z: -12, size: 20, kind: region.puzzle.kind };
  L.puzzle = puzzle;
  L.areas.push({ kind: 'puzzle', x: puzzle.x, z: puzzle.z, r: 13 });
  const pav = { x: X(50), z: -36, kind: 'pavilion' };
  L.pavilion = pav;
  B('pavilion', 50, -36, 's', { label: 'Champion-Pavillon', open: true });
  L.areas.push({ kind: 'hill', x: pav.x, z: pav.z, r: 16, height: 4.5 });

  // guild camp, cave, legend: choose first free candidate
  const inWater = (x, z, pad = 4) => waterDistance(L, x, z) < pad;
  const choose = (cands, pad = 10) => cands.map(([x, z]) => [X(x), z]).find(([x, z]) => !inWater(x, z, pad)) || [X(cands[0][0]), cands[0][1]];
  if (region.guild !== undefined) {
    const [gx, gz] = choose([[52, 46], [-52, 52], [46, 60], [-46, -64]], 14);
    L.guild = { x: gx, z: gz, r: 12 };
    L.areas.push({ kind: 'guild', x: gx, z: gz, r: 13 });
    if (region.guild === 2) { L.guild.station = true; B('station', gx * M, gz - 18, 's', { id: 'station', label: 'Forschungsstation', enter: 'station' }); }
  }
  if (region.cave) {
    const [cx, cz] = choose([[-114, 34], [-114, -56], [114, -60]], 6);
    L.cave = { x: cx, z: cz, name: region.cave };
  }
  if (region.legend) {
    const [lx, lz] = choose([[66, -74], [-66, -74], [70, 20]], 8);
    L.legend = { x: lx, z: lz };
    L.areas.push({ kind: 'shrine', x: lx, z: lz, r: 6 });
  }
  const [mx, mz] = choose(landmarkCandidates(region.landmark.kind), 4);
  L.landmark = { x: mx, z: mz, kind: region.landmark.kind, name: region.landmark.name };
  L.areas.push({ kind: 'landmark', x: mx, z: mz, r: landmarkRadius(region.landmark.kind) });

  // --- roads ---------------------------------------------------------------
  const road = (pts, kind = 'dirt', width = 4.4, smooth = true) => { L.roads.push({ pts: smooth ? smoothPath(pts, 3) : pts, kind, width }); };
  const south = [[0, 134], [X(-5), 112], [jit(4), 86], [X(6 + jit(6)), 64], [X(jit(3)), 42], [0, plaza.z + plaza.r - 1]];
  const north = [[0, plaza.z - plaza.r + 1], [X(4), -6], [X(10 + jit(5)), -26], [X(-6 + jit(6)), -54], [X(4 + jit(5)), -76], [X(-7), -100], [0, -134]];
  if (r > 0) road(south, 'dirt', 5); else road(south.slice(1), 'dirt', 5);
  road(north, 'dirt', 5);
  // town streets (cobbled)
  road([[0, plaza.z + plaza.r], [0, 44]], 'cobble', 5.2, false);
  road([[0, plaza.z - plaza.r], [X(3), -4]], 'cobble', 5.2, false);
  for (const b of L.buildings) {
    if (['heal', 'shop', 'lab', 'house'].includes(b.kind)) road([[b.door.x, b.door.z], [b.door.x + (plaza.x - b.door.x) * 0.45, b.door.z + (plaza.z - b.door.z) * 0.45], [plaza.x + (b.door.x - plaza.x) * 0.3, plaza.z + (b.door.z - plaza.z) * 0.3]], 'cobble', 3.4);
  }
  if (L.dome) road([[L.dome.x + Math.sin(L.dome.yaw) * 6, L.dome.z], [X(-4), 6], [X(-2), 10]], 'cobble', 3.6);
  // arena branch passes through the puzzle area to the arena door
  road([[X(3), -2], [X(-16), -10], [X(-30), -11], [puzzle.x, puzzle.z + 9], [puzzle.x, puzzle.z]], 'dirt', 4);
  road([[puzzle.x, puzzle.z - 9], [arena.door.x, arena.door.z]], 'cobble', 4.4, false);
  // champion branch climbs the hill
  road([[X(-5 + 0), -52], [X(20), -46], [X(36), -40], [pav.x, pav.z + 6]], 'dirt', 3.8);
  if (L.guild) road([[X(4), 52], [(L.guild.x + X(4)) / 2, (L.guild.z + 52) / 2 + 4], [L.guild.x, L.guild.z]], 'dirt', 3.4);
  if (L.cave) road([[X(-10), 22], [X(-34), 26], [(L.cave.x + X(-34)) / 2, (L.cave.z + 26) / 2], [L.cave.x * 0.94, L.cave.z]], 'dirt', 3.4);
  if (L.legend) road([[pav.x, pav.z - 5], [(pav.x + L.legend.x) / 2 + X(6), (pav.z + L.legend.z) / 2], [L.legend.x, L.legend.z + 4]], 'dirt', 3);
  road([[0, 44], [X(6), 52]], 'dirt', 4, false);
  road([[mx * 0.55, mz * 0.55 + 8], [mx, mz]], 'dirt', 3.2);
  // Moostal: tie the mill road from the plaza
  if (r === 0) road([[X(-10), 8], [mx * 0.55, mz * 0.55 + 8]], 'dirt', 3.2);

  // bridges where roads cross rivers
  for (const w of L.water.filter(w => w.kind === 'river' || w.kind === 'lava')) {
    for (const rd of L.roads) {
      for (let i = 1; i < rd.pts.length; i++) {
        const [x, z] = rd.pts[i];
        const d = distToPolyline(x, z, w.pts);
        if (d < 1.2) {
          const [px, pz] = rd.pts[Math.max(0, i - 3)], [nx, nz] = rd.pts[Math.min(rd.pts.length - 1, i + 3)];
          if (!L.bridges.some(b => Math.hypot(b.x - x, b.z - z) < 10)) L.bridges.push({ x, z, yaw: Math.atan2(nx - px, nz - pz), len: w.width + 6, width: rd.width + 1 });
        }
      }
    }
  }
  if (W === 'swamp') for (const rd of L.roads) if (rd.kind === 'dirt') rd.kind = 'boardwalk';

  // --- gates -----------------------------------------------------------------
  if (r > 0) L.gates.push({ id: 'south', x: 0, z: GATE_Z, yaw: 0, to: r - 1, label: 'Nach ' + REGIONS[r - 1].name });
  L.gates.push({ id: 'north', x: 0, z: -GATE_Z, yaw: Math.PI, to: r === 15 ? 16 : r + 1, label: r === 15 ? 'Zum Sternengipfel' : 'Nach ' + REGIONS[r + 1].name });

  // --- spawn points -----------------------------------------------------------
  const heal = L.buildings.find(b => b.kind === 'heal');
  L.spawn.south = { x: 0, z: SPAWN_Z, ry: Math.PI };
  L.spawn.north = { x: 0, z: -SPAWN_Z, ry: 0 };
  L.spawn.heal = { x: heal.door.x + Math.sin(heal.yaw) * 1.5, z: heal.door.z, ry: heal.yaw };
  L.spawn.start = r === 0 ? { x: X(6), z: 10, ry: -M * Math.PI / 2 } : L.spawn.south;
  if (r === 0) L.ulme = { x: X(-6), z: 2.5 };
  if (r === 0) L.firstWild = { x: X(-6), z: -7 };

  // --- meadows (tall grass) -------------------------------------------------------
  // Large, irregular meadows along both routes and in the side fields. Roads
  // cut through them, so every route forces a choice: path or grass.
  addMeadows(L, r, X, inWater);

  // --- NPCs with daily routines -------------------------------------------------
  const homes = L.buildings.filter(b => b.kind === 'house' || b.kind === 'shop' || b.kind === 'lab');
  region.npcs.forEach((n, i) => {
    const a = (i / region.npcs.length) * Math.PI * 2 + 0.4;
    const day = { x: plaza.x + Math.cos(a) * (plaza.r - 3.5), z: plaza.z + Math.sin(a) * (plaza.r - 3.5) };
    const home = homes[i % homes.length].door;
    const wander = { x: plaza.x + Math.cos(a + 0.6) * (plaza.r + 4), z: plaza.z + Math.sin(a + 0.6) * (plaza.r + 4) };
    L.npcs.push({ idx: i, role: n.role, name: n.name, x: day.x, z: day.z,
      schedule: [{ from: 6 * 60, to: 12 * 60, at: day }, { from: 12 * 60, to: 18 * 60, at: wander }, { from: 18 * 60, to: 22 * 60, at: day }, { from: 22 * 60, to: 6 * 60, at: { x: home.x + 1.5, z: home.z + 1 } }] });
  });

  // --- trainers -----------------------------------------------------------------
  const T = (id, x, z, ry) => L.trainers.push({ id, x: X(x), z, ry: M < 0 ? -ry : ry });
  T('route_' + r + '_0', 9, 76, -Math.PI / 2);
  T('route_' + r + '_1', -9, -60, Math.PI / 2);
  T('route_' + r + '_2', 24, -50, Math.PI);
  if (r % 2 === 1) { T('double_' + r, -8, -86, Math.PI / 2); }

  // --- items -----------------------------------------------------------------------
  const lost = (region.quests || []).find(q => q.kind === 'find');
  const itemSpots = [[-70, -40], [72, 10], [-30, 72], [60, 76], [-74, -80]].map(([x, z]) => [X(x), z]).filter(([x, z]) => !inWater(x, z, 3));
  const loot = ['trank', 'netzball', 'heilkraut', 'superball', 'flinkball', 'supertrank', 'daemmerball', 'sternsplitter', 'timerball', 'aetherperle', 'levelbonbon'];
  itemSpots.slice(0, 4).forEach(([x, z], i) => L.items.push({ id: 'hidden:' + r + ':' + i, x, z, item: loot[(r + i * 3) % loot.length], count: 1 + (i % 2), hidden: true }));
  const landSpot = (x, z) => {
    for (let k = 0; k < 40; k++) {
      if (waterDistance(L, x, z) > 3 && Math.abs(x) < HALF - 22 && Math.abs(z) < HALF - 22 && (L.landmark.kind !== 'volcano' || Math.hypot(x - L.landmark.x, z - L.landmark.z) > 24)) return [x, z];
      x += (0 - x) * 0.08; z += (10 - z) * 0.08;
    }
    return [x, z];
  };
  if (lost) {
    const [lx, lz] = landSpot(mx + (mx > 0 ? -7 : 7), mz + 6);
    L.items.push({ id: 'lost:' + lost.id, x: lx, z: lz, quest: lost.id, flag: 'lost:' + lost.id, hidden: true, label: lost.title });
  }
  { const [cx, cz] = landSpot(mx + (mx > 0 ? 6 : -6), mz - 4); L.chest = { x: cx, z: cz }; }
  // ability-gated optional spot (boulder / thorns / water stone)
  const gateKinds = ['boulder', 'thorns', 'boulder', 'thorns'];
  L.obstacle = { kind: gateKinds[r % 4], x: X(-72), z: -20, reward: { x: X(-80), z: -26, item: r < 8 ? 'supertrank' : 'vitaltrank', id: 'gated:' + r } };
  if (inWater(L.obstacle.x, L.obstacle.z, 6)) { L.obstacle.x = X(74); L.obstacle.z = -6; L.obstacle.reward.x = X(82); L.obstacle.reward.z = -2; }
  road([[X(-42), -11 + 0], [L.obstacle.x * 0.8, L.obstacle.z + 2], [L.obstacle.x, L.obstacle.z]], 'dirt', 3);

  // --- signs ---------------------------------------------------------------------
  L.signs.push({ x: X(4), z: 46, text: region.town + ' · ' + region.name });
  if (r > 0) L.signs.push({ x: X(4), z: 108, text: '↓ ' + REGIONS[r - 1].name });
  L.signs.push({ x: X(5), z: -108, text: '↑ ' + (r === 15 ? 'Sternengipfel' : REGIONS[r + 1].name) });
  L.signs.push({ x: X(-14), z: -6, text: '← ' + region.gym.theme });
  L.signs.push({ x: X(10), z: -48, text: '→ Champion-Pavillon' });

  // --- terrain heights -----------------------------------------------------------
  computeHeights(L, noise);

  // --- vegetation and rocks (deterministic scatter) ----------------------------------
  scatter(L, rng, noise);
  return L;
}

// Meadow candidates (x before mirroring, z, radius x, radius z, habitat).
const MEADOWS = [
  [14, 98, 15, 10], [-17, 112, 13, 8], [14, 68, 9, 13], [-14, 58, 9, 12],
  [18, -104, 15, 10], [-20, -114, 13, 7], [18, -64, 10, 12], [-17, -80, 10, 9],
  [-102, 8, 13, 24], [102, -22, 13, 24], [96, 72, 15, 12, 'flowers'], [-96, -92, 13, 13, 'flowers'],
  [34, -58, 9, 7, 'flowers'], [-32, 72, 10, 9, 'flowers'], [78, -96, 12, 9], [-78, 100, 12, 9]
];

function addMeadows(L, r, X, inWater) {
  const add = (x, z, rx, rz, habitat = 'grass', extra = {}) => L.grass.push({ x, z, rx, rz, w: rx * 2, d: rz * 2, habitat, seed: L.grass.length * 1.7 + r, ...extra });
  for (const [mx, mz, rx, rz, hab] of MEADOWS) {
    const x = X(mx), z = mz;
    if (inWater(x, z, Math.min(rx, rz) * 0.6 + 2)) continue;
    if (Math.abs(x) + rx > HALF - 18 || Math.abs(z) + rz > HALF - 12) continue;
    const pad = 3;
    if (L.buildings.some(b => Math.abs(x - b.x) < b.w / 2 + rx + pad && Math.abs(z - b.z) < b.d / 2 + rz + pad)) continue;
    if (L.areas.some(a => Math.hypot(x - a.x, z - a.z) < a.r + Math.min(rx, rz) * 0.6)) continue;
    if (Math.hypot(x - L.plaza.x, z - L.plaza.z) < L.plaza.r + Math.max(rx, rz)) continue;
    // reed meadows on the shore hold water Taschis
    const habitat = hab || (waterDistance(L, x, z) < Math.max(rx, rz) + 5 ? 'water' : 'grass');
    add(x, z, rx, rz, habitat);
  }
  // Moostal: the flower bed in front of the dome used by the first battle
  if (r === 0) add(X(-6), -8, 3.6, 2.6, 'grass', { nocut: true });
  for (const rd of L.roads) rd.bb = rd.pts.reduce((b, [x, z]) => [Math.min(b[0], x), Math.max(b[1], x), Math.min(b[2], z), Math.max(b[3], z)], [Infinity, -Infinity, Infinity, -Infinity]);
}

// The meadow covering (x, z), or null. Roads and water cut holes into meadows;
// the same test drives encounters, grass rendering and the minimap.
export function grassAt(L, x, z) {
  for (const g of L.grass) {
    const dx = (x - g.x) / g.rx, dz = (z - g.z) / g.rz;
    const k = dx * dx + dz * dz;
    if (k > 1.3) continue;
    const wob = 1 + 0.12 * Math.sin(Math.atan2(dz, dx) * 3 + g.seed) + 0.06 * Math.sin(Math.atan2(dz, dx) * 7 + g.seed * 2);
    if (k > wob * wob) continue;
    if (g.nocut) return g;
    if (onRoad(L, x, z, 0.4)) return null;
    if (L.water.length && waterDistance(L, x, z) < 0.8) return null;
    return g;
  }
  return null;
}

export function onRoad(L, x, z, pad = 0) {
  for (const rd of L.roads) {
    const bb = rd.bb;
    if (bb && (x < bb[0] - 8 || x > bb[1] + 8 || z < bb[2] - 8 || z > bb[3] + 8)) continue;
    if (distToPolyline(x, z, rd.pts) < rd.width / 2 + pad) return true;
  }
  return false;
}

function landmarkCandidates(kind) {
  switch (kind) {
    case 'mill': return [[-46, 32], [-40, 52]];
    case 'lighthouse': return [[58, -16], [52, -30], [-58, 30]];
    case 'windmills': return [[46, 22], [-50, 34]];
    case 'volcano': return [[64, -66], [-64, -66]];
    case 'bigtree': return [[48, 18], [-50, 40]];
    case 'frozenlake': return [[44, 40], [-44, 40]];
    case 'moonarch': return [[54, 40], [44, 30]];
    case 'suntemple': return [[54, 16], [-54, 34]];
    default: return [[48, 18], [-50, 36], [52, 34]];
  }
}
function landmarkRadius(kind) { return { volcano: 18, bigtree: 9, windmills: 10, observatory: 8, suntemple: 9, crystalspires: 9, stormtowers: 9, mill: 7 }[kind] || 7; }

// Distance from a point to the nearest water surface (negative = inside).
export function waterDistance(L, x, z) {
  let d = Infinity;
  for (const w of L.water) {
    if (w.kind === 'river' || w.kind === 'lava') d = Math.min(d, distToPolyline(x, z, w.pts) - w.width / 2);
    else if (w.kind === 'lake' || w.kind === 'ice') {
      const nx = (x - w.cx) / w.rx, nz = (z - w.cz) / w.rz, k = Math.hypot(nx, nz);
      d = Math.min(d, (k - 1) * Math.min(w.rx, w.rz));
    } else if (w.kind === 'sea') {
      const line = w.line + Math.sin(z * 0.06) * w.wobble;
      d = Math.min(d, w.side > 0 ? line - x : x + line);
    } else if (w.kind === 'bay') d = Math.min(d, Math.hypot(x - w.cx, z - w.cz) - w.r);
    else if (w.kind === 'clouds') d = Math.min(d, Math.abs(x) < 7 ? 50 : w.radius - Math.hypot(x, z * 1.04));
  }
  return d;
}

function computeHeights(L, noise) {
  const n = CELLS + 1, H = new Float32Array(n * n), WD = new Float32Array(n * n);
  const amp = L.cfg.hill;
  const flatFeatures = [];
  for (const b of L.buildings) flatFeatures.push({ x: b.x, z: b.z, r: Math.hypot(b.w, b.d) / 2 + 4 });
  flatFeatures.push({ x: L.plaza.x, z: L.plaza.z, r: L.plaza.r + 6 });
  for (const a of L.areas) if (a.kind !== 'hill') flatFeatures.push({ x: a.x, z: a.z, r: a.r + 3 });
  const hills = L.areas.filter(a => a.kind === 'hill');
  const isSky = L.water.some(w => w.kind === 'clouds');
  for (const rd of L.roads) {
    rd.bb = rd.pts.reduce((b, [x, z]) => [Math.min(b[0], x), Math.max(b[1], x), Math.min(b[2], z), Math.max(b[3], z)], [Infinity, -Infinity, Infinity, -Infinity]);
  }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -HALF + i * CELL, z = -HALF + j * CELL;
    let road = Infinity;
    for (const rd of L.roads) {
      const [x0, x1, z0, z1] = rd.bb;
      const bx = Math.max(x0 - x, 0, x - x1), bz = Math.max(z0 - z, 0, z - z1);
      if (bx * bx + bz * bz > 400) continue;
      road = Math.min(road, distToPolyline(x, z, rd.pts) - rd.width / 2);
    }
    let flat = road;
    for (const f of flatFeatures) flat = Math.min(flat, Math.hypot(x - f.x, z - f.z) - f.r);
    const mask = smoothstep(0, 16, flat);
    let h = (noise.fbm(x * 0.012, z * 0.012, 3) - 0.5) * 3;
    h += mask * (noise.fbm(x * 0.022 + 7, z * 0.022 + 3, 4) - 0.35) * amp * 2;
    for (const hl of hills) { const d = Math.hypot(x - hl.x, z - hl.z); h += hl.height * (1 - smoothstep(hl.r * 0.55, hl.r * 1.8, d)); }
    // boundary cliffs (open at the gates)
    const edge = Math.max(Math.abs(x), Math.abs(z));
    const gateOpen = Math.abs(x) < 9 && Math.abs(z) > 80;
    if (!isSky && !gateOpen) h += smoothstep(HALF - 22, HALF - 4, edge) * (14 + amp);
    // landmark specifics
    if (L.landmark.kind === 'volcano') { const d = Math.hypot(x - L.landmark.x, z - L.landmark.z); h += Math.max(0, 26 - d * 1.15) + (d < 9 ? -(9 - d) * 1.2 : 0); }
    if (L.landmark.kind === 'crystalspires' || L.biome === 'crystal') h += mask * smoothstep(40, 90, Math.hypot(x, z)) * 6;
    // water carving
    WD[j * n + i] = waterDistance(L, x, z);
    for (const w of L.water) {
      if (w.kind === 'clouds') continue;
      const local = waterDistance({ water: [w] }, x, z);
      if (local < 3) h = Math.min(h, h * smoothstep(-2, 3, local) - w.depth * (1 - smoothstep(-3, 3, local)));
    }
    if (isSky && Math.abs(x) >= 7) { const rr = Math.hypot(x, z * 1.04); h -= smoothstep(80, 92, rr) * 30; }
    H[j * n + i] = h;
  }
  // roads: lightly smooth heights along roads to avoid bumps
  L.heights = H;
  L.waterDist = WD;
  L.waterLevel = -0.55;
}

export function heightAt(L, x, z) {
  const n = CELLS + 1;
  const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL;
  const i = Math.max(0, Math.min(CELLS - 1, Math.floor(fx))), j = Math.max(0, Math.min(CELLS - 1, Math.floor(fz)));
  const u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fz - j));
  const H = L.heights;
  const a = H[j * n + i], b = H[j * n + i + 1], c = H[(j + 1) * n + i], d = H[(j + 1) * n + i + 1];
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
export function slopeAt(L, x, z) {
  const e = 0.8;
  return Math.hypot(heightAt(L, x + e, z) - heightAt(L, x - e, z), heightAt(L, x, z + e) - heightAt(L, x, z - e)) / (2 * e);
}

function clearOf(L, x, z, pad) {
  if (Math.abs(x) > HALF - 3 || Math.abs(z) > HALF - 3) return false;
  if (waterDistance(L, x, z) < pad * 0.6) return false;
  for (const rd of L.roads) if (distToPolyline(x, z, rd.pts) < rd.width / 2 + pad) return false;
  for (const b of L.buildings) if (Math.abs(x - b.x) < b.w / 2 + pad + 1.5 && Math.abs(z - b.z) < b.d / 2 + pad + 1.5 + (Math.abs(Math.sin(b.yaw)) > 0.5 ? b.w : 0) * 0) return false;
  for (const b of L.buildings) if (Math.hypot(x - b.door.x, z - b.door.z) < 4 + pad) return false;
  if (Math.hypot(x - L.plaza.x, z - L.plaza.z) < L.plaza.r + pad + 1) return false;
  for (const a of L.areas) if (Math.hypot(x - a.x, z - a.z) < a.r + pad) return false;
  for (const g of L.grass) if (Math.abs(x - g.x) < g.w / 2 + pad * 0.5 && Math.abs(z - g.z) < g.d / 2 + pad * 0.5) return false;
  for (const t of L.trainers) if (Math.hypot(x - t.x, z - t.z) < 3 + pad) return false;
  for (const it of L.items) if (Math.hypot(x - it.x, z - it.z) < 2.5 + pad) return false;
  for (const n of L.npcs) if (Math.hypot(x - n.x, z - n.z) < 2 + pad) return false;
  if (L.chest && Math.hypot(x - L.chest.x, z - L.chest.z) < 3 + pad) return false;
  if (L.cave && Math.hypot(x - L.cave.x, z - L.cave.z) < 8 + pad) return false;
  if (L.obstacle && (Math.hypot(x - L.obstacle.x, z - L.obstacle.z) < 4 + pad || Math.hypot(x - L.obstacle.reward.x, z - L.obstacle.reward.z) < 3 + pad)) return false;
  for (const s of L.signs) if (Math.hypot(x - s.x, z - s.z) < 2 + pad) return false;
  for (const br of L.bridges) if (Math.hypot(x - br.x, z - br.z) < br.len / 2 + 2 + pad) return false;
  for (const g of L.gates) if (Math.hypot(x - g.x, z - g.z) < 12 + pad) return false;
  return true;
}

function scatter(L, rng, noise) {
  const types = Object.entries(L.cfg.trees);
  const total = types.reduce((a, [, w]) => a + w, 0);
  const pickType = () => { let v = rng.next() * total; for (const [t, w] of types) { v -= w; if (v <= 0) return t; } return types[0][0]; };
  const target = Math.round(600 * L.cfg.density);
  let tries = 0;
  while (L.trees.length + L.bushes.length < target && tries++ < target * 12) {
    const x = (rng.next() - 0.5) * (SIZE - 8), z = (rng.next() - 0.5) * (SIZE - 8);
    const cluster = noise.fbm(x * 0.03 + 50, z * 0.03 - 20, 3);
    if (cluster < 0.47 - L.cfg.density * 0.06 && rng.next() < 0.75) continue;
    const t = pickType();
    const pad = t === 'bush' ? 0.8 : t === 'giant' ? 6 : 2;
    if (!clearOf(L, x, z, pad)) continue;
    if (slopeAt(L, x, z) > 1.1) continue;
    const list = t === 'bush' ? L.bushes : L.trees;
    const minD = t === 'bush' ? 1.6 : t === 'giant' ? 14 : 3.2;
    if (list.some(o => Math.abs(o.x - x) < minD && Math.abs(o.z - z) < minD)) continue;
    list.push({ type: t, x, z, s: t === 'giant' ? 1.4 + rng.next() * 0.4 : 0.8 + rng.next() * 0.55, ry: rng.next() * Math.PI * 2, y: heightAt(L, x, z) });
  }
  const rockTarget = Math.round(100 * L.cfg.rocks);
  tries = 0;
  while (L.rocks.length < rockTarget && tries++ < rockTarget * 15) {
    const x = (rng.next() - 0.5) * (SIZE - 6), z = (rng.next() - 0.5) * (SIZE - 6);
    if (!clearOf(L, x, z, 1)) continue;
    if (L.trees.some(o => Math.hypot(o.x - x, o.z - z) < 3)) continue;
    L.rocks.push({ x, z, s: 0.5 + rng.next() * 1.5, ry: rng.next() * 6, y: heightAt(L, x, z), kind: rng.next() < 0.3 ? 'flat' : 'round' });
  }
}

// Sternengipfel: summit plateau with the guild machine and the league hall.
function buildSummitLayout() {
  const L = { region: 16, biome: 'summit', cfg: { hill: 3, ground: 'summit', water: 'clouds', trees: {}, density: 0, rocks: 0.6, flowers: 0.3 }, size: SIZE, mirror: 1, roads: [], buildings: [], gates: [], grass: [], water: [{ kind: 'clouds', radius: 70 }], bridges: [], trees: [], rocks: [], bushes: [], props: [], npcs: [], trainers: [], items: [], signs: [], areas: [], spawn: {} };
  L.plaza = { x: 0, z: 10, r: 14 };
  L.landmark = { x: 0, z: -18, kind: 'machine', name: 'Vargas Lichtmaschine' };
  L.areas.push({ kind: 'landmark', x: 0, z: -18, r: 9 });
  L.roads.push({ pts: smoothPath([[0, 66], [6, 44], [0, 24]], 3), kind: 'cobble', width: 5 });
  L.roads.push({ pts: [[0, -4], [0, -40]], kind: 'cobble', width: 6 });
  const yaw = 0;
  L.buildings.push({ kind: 'league', id: 'league', x: 0, z: -52, face: 's', yaw, w: 22, d: 18, door: { x: 0, z: -41.8 }, label: 'Halle der Sternenliga', enter: 'league' });
  L.gates.push({ id: 'south', x: 0, z: 62, yaw: 0, to: 15, label: 'Nach Himmelskrone' });
  L.spawn = { south: { x: 0, z: 56, ry: Math.PI }, heal: { x: 6, z: 18, ry: Math.PI }, start: { x: 0, z: 56, ry: Math.PI } };
  L.signs.push({ x: 6, z: 40, text: 'Sternengipfel' });
  L.healStation = { x: 10, z: 16 };
  L.waterLevel = -0.55;
  const n = CELLS + 1, H = new Float32Array(n * n), noise = createNoise('summit');
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -HALF + i * CELL, z = -HALF + j * CELL, rr = Math.hypot(x, z * 0.85);
    let h = (noise.fbm(x * 0.03, z * 0.03, 3) - 0.5) * 2;
    h -= smoothstep(58, 74, rr) * 40;
    H[j * n + i] = h;
  }
  L.heights = H;
  L.waterDist = new Float32Array(n * n).fill(50);
  const rng = createRng('summit-rocks');
  for (let i = 0; i < 40; i++) {
    const a = rng.next() * Math.PI * 2, d = 30 + rng.next() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.abs(x) < 8 || (Math.abs(x) < 16 && z < -30)) continue;
    L.rocks.push({ x, z, s: 0.8 + rng.next() * 1.8, ry: rng.next() * 6, y: heightAt(L, x, z), kind: 'crystal' });
  }
  return L;
}
