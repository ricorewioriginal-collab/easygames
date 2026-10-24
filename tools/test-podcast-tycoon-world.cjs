#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: Selbsttest der 3D-Welt ohne Browser (echtes vendor/three-r128.min.js, kopfloser Modus ohne WebGL).
// Prüft Aufbau der Stadt, Kollision (Weltgrenze, Studiowände, gesperrte Bezirke), Interaktionen (Pult, Marco, Job, Bus),
// Neuaufbau nach Bauänderung, Bau-Auswahl (Strahl → Feld/Kante), A*, NPC-Tagesablauf, Kamera-Modi, Minikarte und Aufräumen.
//   node tools/test-podcast-tycoon-world.cjs [--verbose]
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'anmacha-podcast-tycoon', 'src');
global.THREE = require(path.join(root, 'vendor', 'three-r128.min.js'));
global.PT = {};
const load = f => { require(path.join(dir, f)); };
load('core/util.js');
fs.readdirSync(path.join(dir, 'data')).filter(f => f.endsWith('.js')).sort().forEach(f => load('data/' + f));
load('sim/build.js'); load('sim/sim.js'); load('sim/fun.js');
load('world/nav.js'); load('world/textures.js'); load('world/models.js'); load('world/world.js');
const P = global.PT, D = P.DATA, B = P.Build, S = P.Sim, T = global.THREE;
const VERBOSE = process.argv.includes('--verbose');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };
const log = (...a) => { if (VERBOSE) console.log(...a); };
const HALF = D.world.half;

// ── 1. Aufbau ───────────────────────────────────────────────
const st = S.create({ seed: 1 });
let w;
try { w = P.World.create(null, { headless: true, quality: 'low' }); ok(true, 'World.create'); } catch (e) { ok(false, 'World.create: ' + e.message); process.exit(1); }
['THREE', 'scene', 'camera', 'load', 'refreshLot', 'refreshUnlocks', 'update', 'teleport', 'setCamMode', 'buildPan', 'buildZoom', 'buildRotate', 'pick', 'ghost', 'ghostEdge', 'highlightCells', 'cine', 'mgScene', 'renderMg', 'render', 'resize', 'minimap', 'setTime', 'setQuality', 'dispose', 'onContextLost', 'onContextRestored', 'stats', 'playerPos']
  .forEach(k => ok(k in w, 'Schnittstelle ' + k));
ok(w.renderer === null, 'kopflos: kein WebGLRenderer');
w.resize(1280, 720);
const t0 = Date.now();
w.load(st);
log('load ms', Date.now() - t0);
const dbg = w.debug, nav = dbg.nav;
ok(dbg.dists.length === 8, '8 Bezirke gebaut');
ok(dbg.roofs.length >= D.districts.reduce((n, d) => n + d.buildings.length, 0), 'Dächer aller Gebäude');
ok(dbg.inter.filter(i => i.kind === 'travel').length === 8, 'Bushaltestelle in jedem Bezirk');
ok(dbg.inter.filter(i => i.kind === 'job').length === D.jobs.length, 'Pult für jeden Nebenjob');
D.jobs.forEach(j => ok(dbg.inter.some(i => i.kind === 'job' && i.id === j.id), 'Job-Pult ' + j.id));
ok(dbg.inter.some(i => i.kind === 'studio' && i.id === 'studio'), 'Produktionspult im Studio');
ok(dbg.inter.some(i => i.kind === 'radio' && i.id === 'studio'), 'Radio-Sendepult im Radiostudio');
ok(dbg.inter.some(i => i.kind === 'build' && i.id === 'studio'), 'Bau-Terminal am Studio');
ok(dbg.inter.some(i => i.kind === 'lot' && i.id === 'campus'), 'Pachtschild am Campus');
ok(!dbg.inter.some(i => i.kind === 'build' && i.id === 'campus'), 'kein Bau-Terminal am ungepachteten Campus');
ok(dbg.npcs.length === D.npcs.length + 2, 'NPCs + Marco & Andrew');
const pp0 = w.playerPos();
ok(pp0 && pp0.district === 'altstudio', 'Spieler startet im alten Studio');
w.update(1 / 60, {}); w.render();
let s0 = w.stats(); log('stats', s0);
ok(s0.calls > 10 && s0.calls < 150, 'Draw-Calls (Schätzung) < 150: ' + s0.calls);
// Gesperrter Bezirk hat Absperrung
ok(dbg.dists.filter(r => r.barrier).length === D.districts.filter(d => !d.open).length, 'Absperrungen an gesperrten Bezirken');

// ── Hilfen: Fahren mit Eingaben und Wandprüfung ─────────────
const cellOf = v => Math.floor(v + HALF);
const lockedCell = (gx, gz) => { const v = dbg.distMap[gz * nav.S + gx]; return v < 8 && st.unlocks.districts[dbg.dists[v].d.id] === false; };
const extra = (nx, nz, fx, fz) => lockedCell(nx, nz) && !lockedCell(fx, fz);
const pass = (ax, az, bx, bz) => nav.passable(ax, az, bx, bz, extra);
let wallViol = 0, outViol = 0, frames = 0;
const studioLot = st.lots.studio, sDef = D.districts.find(d => d.id === 'altstudio');
const sox = sDef.cx + sDef.lot.x, soz = sDef.cz + sDef.lot.z;
function crossesStudioWall(x0, z0, x1, z1) {
  // Kante zwischen zwei Feldern im Studio-Raster gesperrt (Wand/Fenster)?
  const ax = Math.floor(x0 - sox), az = Math.floor(z0 - soz), bx = Math.floor(x1 - sox), bz = Math.floor(z1 - soz);
  const blk = (x1_, z1_, x2_, z2_) => { const e = studioLot.walls[B.edgeKey(x1_, z1_, x2_, z2_)]; return e === 'wall' || e === 'window'; };
  if (ax !== bx && az !== bz) return blk(ax, az, bx, az) && blk(ax, az, ax, bz);
  if (ax !== bx || az !== bz) return blk(ax, az, bx, bz);
  return false;
}
function step(inp, dt) {
  const p = dbg.player, x0 = p.x, z0 = p.z;
  const r = w.update(dt || 1 / 60, inp || {}); frames++;
  const x1 = p.x, z1 = p.z;
  if (Math.abs(x1) > HALF - 0.5 || Math.abs(z1) > HALF - 0.5 || !isFinite(x1) || !isFinite(z1)) outViol++;
  const a = [cellOf(x0), cellOf(z0)], b = [cellOf(x1), cellOf(z1)];
  if (a[0] !== b[0] || a[1] !== b[1]) {
    let good;
    if (a[0] !== b[0] && a[1] !== b[1]) good = (pass(a[0], a[1], b[0], a[1]) && pass(b[0], a[1], b[0], b[1])) || (pass(a[0], a[1], a[0], b[1]) && pass(a[0], b[1], b[0], b[1]));
    else good = pass(a[0], a[1], b[0], b[1]);
    if (!good || crossesStudioWall(x0, z0, x1, z1)) { wallViol++; log('Wand durchquert', x0, z0, '→', x1, z1); }
  }
  return r;
}
function inputToward(tx, tz, slow) {
  const p = dbg.player, yaw = dbg.cam.yaw, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -fz, rz = fx;
  const dx = tx - p.x, dz = tz - p.z;
  let mx = dx * rx + dz * rz, mz = -(dx * fx + dz * fz); const l = Math.hypot(mx, mz) || 1;
  const k = slow ? Math.max(0.3, Math.min(1, Math.hypot(dx, dz) * 1.5)) : 1;
  return { mx: mx / l * k, mz: mz / l * k };
}
function driveTo(tx, tz, tol, maxF) {
  let pth = null, pi = 0, re = 0, last = null;
  for (let f = 0; f < (maxF || 4000); f++) {
    const p = dbg.player;
    if (Math.hypot(p.x - tx, p.z - tz) < (tol || 0.4)) return last || step({});
    if (!pth || f - re > 300) { pth = nav.findPath(p.x, p.z, tx, tz, { maxIter: 60000, extra }); pi = 0; re = f; if (!pth) return null; }
    let wp = pth[pi];
    while (pi < pth.length - 1 && Math.hypot(wp[0] - p.x, wp[1] - p.z) < 0.3) wp = pth[++pi];
    last = step(inputToward(wp[0], wp[1], pi === pth.length - 1));
  }
  return null;
}

// ── 2. Freies Laufen (600 Schritte) mit Kollision ───────────
for (let i = 0; i < 600; i++) step({ mx: Math.sin(i / 37) * 0.9, mz: -0.8 + Math.cos(i / 53) * 0.5, run: i % 200 > 120 });
ok(outViol === 0, 'Spieler bleibt in der Welt (' + outViol + ')');
ok(wallViol === 0, 'keine Wand durchquert beim freien Laufen (' + wallViol + ')');
const pp1 = w.playerPos(); ok(Math.hypot(pp1.x - pp0.x, pp1.z - pp0.z) > 3, 'Spieler hat sich bewegt');
// Gegen die Weltgrenze laufen
w.teleport('festival'); for (let i = 0; i < 400; i++) step({ mx: 0, mz: 1, run: true }); // Blick nach Norden → mz=+1 läuft nach Süden zur Grenze
ok(Math.abs(dbg.player.z) < HALF - 0.5, 'Weltgrenze hält (z=' + dbg.player.z.toFixed(2) + ')');
// Hinein ins Studio und gegen alle Wände laufen
w.teleport('altstudio');
const pultIt = dbg.inter.find(i => i.kind === 'studio' && i.id === 'studio');
const marco = dbg.npcs.find(n => n.id === 'marco'), andrew = dbg.npcs.find(n => n.id === 'andrew');
ok(marco && marco.x > sox && marco.x < sox + 20 && marco.z > soz && marco.z < soz + 14, 'Marco steht im Studio');
ok(andrew && Math.hypot(andrew.x - marco.x, andrew.z - marco.z) > 0.5, 'Andrew steht neben Marco');
// Feld nahe Pult, das näher am Pult als an jeder Figur liegt
let pultCell = null;
for (let r = 1; r <= 3 && !pultCell; r++) for (let dz = -r; dz <= r && !pultCell; dz++) for (let dx = -r; dx <= r && !pultCell; dx++) {
  const gx = cellOf(pultIt.x) + dx, gz = cellOf(pultIt.z) + dz; if (nav.solid(gx, gz)) continue;
  const x = gx - HALF + 0.5, z = gz - HALF + 0.5, dp = Math.hypot(x - pultIt.x, z - pultIt.z);
  if (dp < 1.8 && dbg.npcs.every(n => Math.hypot(n.x - x, n.z - z) > dp + 0.3)) pultCell = [x, z];
}
ok(!!pultCell, 'freies Feld am Pult gefunden');
let r1 = pultCell ? driveTo(pultCell[0], pultCell[1], 0.35, 5000) : null;
ok(r1 && r1.near && r1.near.kind === 'studio', 'near = studio am Produktionspult (' + JSON.stringify(r1 && r1.near) + ')');
ok(r1 && r1.district === 'altstudio', 'Bezirk altstudio im Studio');
// im Studio: Dach ausgeblendet
const sRoof = dbg.roofs.find(r => r.lot === 'studio');
ok(sRoof && sRoof.mesh.visible === false, 'Studiodach ausgeblendet, wenn Spieler drinnen');
// Zu Marco
const mCell = nav.nearestFree(cellOf(marco.x) + 1, cellOf(marco.z) + 1, 3);
let r2 = null;
for (const c of [[marco.x, marco.z + 1], [marco.x - 1, marco.z], [marco.x, marco.z - 1], mCell ? [mCell[0] - HALF + 0.5, mCell[1] - HALF + 0.5] : null]) {
  if (!c || nav.solid(cellOf(c[0]), cellOf(c[1]))) continue;
  r2 = driveTo(c[0], c[1], 0.3, 3000); if (r2 && r2.near && r2.near.kind === 'npc' && r2.near.id === 'marco') break;
}
ok(r2 && r2.near && r2.near.kind === 'npc' && r2.near.id === 'marco', "near = npc 'marco' (" + JSON.stringify(r2 && r2.near) + ')');
// Wände im Studio rammen (alle Richtungen)
for (let i = 0; i < 800; i++) step({ mx: Math.cos(i * 0.21) , mz: Math.sin(i * 0.13), run: i % 3 === 0 });
ok(wallViol === 0, 'keine Studiowand durchquert (' + wallViol + ')');
// Bau-Terminal
const term = dbg.inter.find(i => i.kind === 'build' && i.id === 'studio');
const tc = nav.nearestFree(cellOf(term.x), cellOf(term.z) + 1, 3);
const r3 = driveTo(tc[0] - HALF + 0.5, tc[1] - HALF + 0.5, 0.35, 4000);
ok(r3 && r3.near && r3.near.kind === 'build', 'near = build am Bau-Terminal');
// Bushaltestelle
const bus = dbg.inter.find(i => i.kind === 'travel' && i.id === 'altstudio');
const bc = nav.nearestFree(cellOf(bus.x), cellOf(bus.z), 3);
const r4 = driveTo(bc[0] - HALF + 0.5, bc[1] - HALF + 0.5, 0.35, 3000);
ok(r4 && r4.near && r4.near.kind === 'travel' && r4.near.id === 'altstudio', 'near = travel an der Bushaltestelle');
// Job in der Medienstraße
w.teleport('medien');
const job = dbg.inter.find(i => i.kind === 'job' && i.id === 'j_post');
const jc = nav.nearestFree(cellOf(job.x), cellOf(job.z) + 1, 3);
const r5 = driveTo(jc[0] - HALF + 0.5, jc[1] - HALF + 0.5, 0.35, 6000);
ok(r5 && r5.near && (r5.near.kind === 'job' || r5.near.kind === 'npc'), 'near = job am Job-Pult (' + JSON.stringify(r5 && r5.near) + ')');
ok(wallViol === 0 && outViol === 0, 'Kollision auf allen Wegen ok');

// ── 3. Gesperrter Bezirk ────────────────────────────────────
ok(st.unlocks.districts.tvstudio === false, 'TV-Studio ist anfangs gesperrt');
const blockX = 45;
function pushEast(n) { dbg.player.x = 40; dbg.player.z = 4.5; dbg.player.ry = 0; dbg.cam.yaw = Math.PI; for (let i = 0; i < n; i++) step({ mx: 1, mz: 0, run: true }); return dbg.player.x; }
const xLocked = pushEast(150);
ok(xLocked < blockX, 'Absperrung hält Spieler draußen (x=' + xLocked.toFixed(2) + ')');
st.unlocks.districts.tvstudio = true; w.refreshUnlocks();
ok(!dbg.dists.find(r => r.d.id === 'tvstudio').barrier, 'Absperrung nach Freischaltung entfernt');
const xOpen = pushEast(150);
ok(xOpen > blockX + 1, 'nach Freischaltung begehbar (x=' + xOpen.toFixed(2) + ')');
// automatische Erkennung im update
st.unlocks.districts.bahnhof = true; for (let i = 0; i < 40; i++) step({});
ok(!dbg.dists.find(r => r.d.id === 'bahnhof').barrier, 'Freischaltung wird im update erkannt');

// ── 4. Bauänderung → refreshLot ─────────────────────────────
const oldStatic = dbg.lotsR.studio.static; let disposedOld = false;
oldStatic.geometry.addEventListener('dispose', () => { disposedOld = true; });
const sofa = { u: 'tsofa', id: 'mo_sofa', x: 10, z: 9, r: 0 };
const cp = B.canPlace(studioLot, sofa);
ok(cp.ok, 'Sofa ist platzierbar (' + (cp.err || '') + ')');
B.apply(studioLot, { t: 'place', o: sofa });
B.apply(studioLot, { t: 'wall', k: 'v:17,3', to: 'wall' });
w.refreshLot('studio');
ok(disposedOld, 'alte Studio-Geometrie freigegeben');
ok(dbg.lotsR.studio.static !== oldStatic, 'Studio neu aufgebaut');
ok(nav.solid(cellOf(sox + 10.5), cellOf(soz + 9.5)) && nav.solid(cellOf(sox + 11.5), cellOf(soz + 9.5)), 'Sofa blockiert seine Felder');
ok(!nav.passable(cellOf(sox + 16.5), cellOf(soz + 3.5), cellOf(sox + 17.5), cellOf(soz + 3.5)), 'neue Wand sperrt die Kante');
// automatische Erkennung über lot.ver
const st2 = dbg.lotsR.studio.static;
B.apply(studioLot, { t: 'remove', o: sofa });
for (let i = 0; i < 40; i++) step({});
ok(dbg.lotsR.studio.static !== st2 && !nav.solid(cellOf(sox + 10.5), cellOf(soz + 9.5)), 'Bauänderung wird im update erkannt');
// Campus pachten → Terminal statt Schild
st.flags['lot:campus'] = true; const buy = S.buyLot(st, 'campus');
ok(buy.ok, 'Campus gepachtet');
w.refreshLot('campus');
ok(dbg.inter.some(i => i.kind === 'build' && i.id === 'campus') && !dbg.inter.some(i => i.kind === 'lot'), 'Campus: Bau-Terminal statt Pachtschild');

// ── 5. Bau-Modus: Strahl → Feld/Kante ───────────────────────
w.setCamMode('build', { lot: 'studio' }); w.update(1 / 60, {});
ok(dbg.roofs.find(r => r.lot === 'studio').mesh.visible === false && dbg.lotsR.studio.upper.visible === false, 'Bau-Modus blendet Dach und obere Wände aus');
ok(dbg.lotsR.studio.grid.visible === true, 'Raster im Bau-Modus sichtbar');
const toScreen = (x, z) => { const v = new T.Vector3(x, 0.05, z).project(w.camera); return [(v.x + 1) / 2 * 1280, (1 - v.y) / 2 * 720]; };
let pk = w.pick(...toScreen(sox + 5.5, soz + 5.5));
ok(pk && pk.lot === 'studio' && pk.x === 5 && pk.z === 5, 'pick Feld (5,5): ' + JSON.stringify(pk));
pk = w.pick(...toScreen(sox + 7.5, soz + 3.04));
ok(pk && pk.edge === 'h:7,3', 'pick Kante h:7,3: ' + (pk && pk.edge));
pk = w.pick(...toScreen(sox + 9.03, soz + 4.5));
ok(pk && pk.edge === 'v:9,4', 'pick Kante v:9,4: ' + (pk && pk.edge));
w.buildRotate(1); w.buildZoom(1.3); w.buildPan(2, -1); for (let i = 0; i < 60; i++) w.update(1 / 60, {});
pk = w.pick(...toScreen(sox + 12.5, soz + 8.5));
ok(pk && pk.x === 12 && pk.z === 8, 'pick nach Drehen/Zoomen/Schieben: ' + JSON.stringify(pk));
ok(w.pick(-5000, -5000) === null || !w.pick(-5000, -5000).inside, 'pick außerhalb → null');
w.ghost('mo_sofa', { x: 3, z: 3, r: 1, ok: false }); w.ghostEdge('h:4,2', 'door', true); w.highlightCells([[3, 3], [4, 3]], '#ff4d6d');
let gm = null; w.scene.traverse(o => { if (o.material === dbg.mats.ghost) gm = o; });
ok(gm && gm.visible, 'Geister-Vorschau sichtbar');
w.ghost(null); w.ghostEdge(null); w.highlightCells(null);
ok(!gm.visible, 'Vorschau ausgeblendet');
w.setCamMode('build', { lot: 'campus' }); w.update(1 / 60, {});
pk = w.pick(...toScreen(D.districts.find(d => d.id === 'campus').cx + D.districts.find(d => d.id === 'campus').lot.x + 3.5, D.districts.find(d => d.id === 'campus').cz + D.districts.find(d => d.id === 'campus').lot.z + 2.5));
ok(pk && pk.lot === 'campus' && pk.x === 3 && pk.z === 2, 'pick auf dem Campus: ' + JSON.stringify(pk));
w.setCamMode('follow'); w.update(1 / 60, {});
ok(dbg.lotsR.studio.grid.visible === false, 'Raster außerhalb des Bau-Modus aus');

// ── 6. A* zwischen Bezirken ─────────────────────────────────
const a = D.districts.find(d => d.id === 'altstudio'), b = D.districts.find(d => d.id === 'tecpark');
const tA = Date.now();
const pth = nav.findPath(a.cx + a.spawn.x, a.cz + a.spawn.z, b.cx + b.spawn.x, b.cz + b.spawn.z, { maxIter: 60000 });
log('A* ms', Date.now() - tA, 'Punkte', pth && pth.length);
ok(pth && pth.length > 3, 'A* findet Weg altstudio → tecpark');
let losOk = true, prev = [a.cx + a.spawn.x, a.cz + a.spawn.z];
(pth || []).forEach(q => { if (!nav.los(prev[0], prev[1], q[0], q[1])) losOk = false; prev = q; });
ok(losOk, 'A*-Weg ist durchgehend begehbar');
const last = pth[pth.length - 1]; ok(Math.hypot(last[0] - (b.cx + b.spawn.x), last[1] - (b.cz + b.spawn.z)) < 1, 'A* endet am Ziel');
const camp = D.districts.find(d => d.id === 'camping');
ok(!!nav.findPath(a.cx + a.spawn.x, a.cz + a.spawn.z, camp.cx + camp.spawn.x, camp.cz + camp.spawn.z, { maxIter: 60000 }), 'A* findet Weg altstudio → camping (diagonal über die Stadt)');
// Ziel in Gebäude (Café)
const cafe = D.districts.find(d => d.id === 'medien');
const pIn = nav.findPath(cafe.cx, cafe.cz + 14, cafe.cx + cafe.spots.cafe[0], cafe.cz + cafe.spots.cafe[1], { maxIter: 60000 });
ok(pIn && pIn.length >= 2, 'A* findet Weg durch die Tür ins Café');

// ── 7. NPC-Tagesablauf ──────────────────────────────────────
st.time.min = 9 * 60; for (let i = 0; i < 30; i++) w.update(1 / 30, {});
const lea = dbg.npcs.find(n => n.id === 'lea');
const leaGoal9 = lea.goalKey;
const pos9 = dbg.npcs.map(n => [n.x, n.z]);
w.teleport('medien'); // Spieler in der Nähe, damit gelaufen (nicht gesprungen) wird
st.time.min = 13 * 60;
let searches0 = nav.searches, maxPer = 0;
for (let i = 0; i < 1800; i++) { const s1 = nav.searches; w.update(1 / 30, {}); maxPer = Math.max(maxPer, nav.searches - s1); }
ok(leaGoal9 === 'medien.agentur' && lea.goalKey === 'medien.cafe', 'Lea wechselt von Agentur zum Café (' + leaGoal9 + ' → ' + lea.goalKey + ')');
const cafeP = [cafe.cx + cafe.spots.cafe[0], cafe.cz + cafe.spots.cafe[1]];
ok(Math.hypot(lea.x - cafeP[0], lea.z - cafeP[1]) < 3, 'Lea ist im Café angekommen (' + lea.x.toFixed(1) + ',' + lea.z.toFixed(1) + ')');
const moved = dbg.npcs.filter((n, i) => Math.hypot(n.x - pos9[i][0], n.z - pos9[i][1]) > 2).length;
ok(moved >= 4, 'mehrere NPCs bewegen sich im Tagesverlauf (' + moved + ')');
ok(maxPer <= 2, 'höchstens 2 Pfadsuchen pro Bild (' + maxPer + ')');
ok(nav.searches > searches0, 'NPCs nutzen A*');
ok(dbg.npcs.every(n => Math.abs(n.x) < HALF && Math.abs(n.z) < HALF && !nav.solid(cellOf(n.x), cellOf(n.z)) || n.host), 'NPCs stehen auf freien Feldern');
// eingestellte Figur kommt tagsüber ins Studio
st.unlocks.hire = true; st.money += 5000; const hr = S.hire(st, 'bodo');
if (hr.ok) {
  st.time.min = 11 * 60; w.teleport('altstudio');
  for (let i = 0; i < 1500; i++) w.update(1 / 30, {});
  const bodo = dbg.npcs.find(n => n.id === 'bodo');
  ok(bodo.x > sox - 1 && bodo.x < sox + 21 && bodo.z > soz - 1 && bodo.z < soz + 15, 'eingestellter Bodo arbeitet im Studio (' + bodo.x.toFixed(1) + ',' + bodo.z.toFixed(1) + ')');
} else ok(false, 'Einstellen für Test: ' + hr.err);

// ── 8. Schnellreise, Zeit, Kamera, Minispiel, Minikarte ─────
D.districts.forEach(d => { w.teleport(d.id); const q = w.playerPos(); ok(q.district === d.id, 'Schnellreise nach ' + d.id + ' (' + q.district + ')'); });
w.teleport('plaza'); ok(w.playerPos().district === 'plaza', 'Funkplatz erkannt');
const bgDay = (w.setTime(12 * 60), w.scene.background.clone()); w.setTime(23 * 60); const bgNight = w.scene.background.clone();
ok(bgDay.r + bgDay.g + bgDay.b > bgNight.r + bgNight.g + bgNight.b + 0.5, 'Nacht ist dunkler als Tag');
ok(dbg.mats.glass.color.r > dbg.mats.glass.color.b, 'Fenster leuchten nachts warm');
w.cine('tvstudio', 1); ok(w.camMode() === 'cine', 'Kamerafahrt startet');
for (let i = 0; i < 80; i++) w.update(1 / 60, {});
ok(w.camMode() === 'follow', 'Kamerafahrt endet wieder im Folgemodus');
const mg = w.mgScene();
ok(mg && mg.THREE === T && mg.scene && mg.camera && Math.abs(mg.camera.aspect - 16 / 9) < 1e-6, 'mgScene mit 16:9-Kamera');
mg.scene.add(new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial()));
const mg2 = w.mgScene(); ok(mg2.scene.children.length === 0, 'mgScene räumt Reste auf');
w.setCamMode('mg'); w.render(); w.renderMg(); w.setCamMode('follow');
const calls = [];
const fakeCtx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : (...args) => { calls.push(k); })), set: (t, k, v) => { t[k] = v; return true; } });
let mmOk = true; try { w.minimap(fakeCtx, 200, 200, { target: 'medien' }); w.minimap(fakeCtx, 400, 300, { target: 'lea', big: true }); w.minimap(fakeCtx, 100, 100, {}); } catch (e) { mmOk = false; console.error(e); }
ok(mmOk && calls.includes('fillRect') && calls.includes('arc'), 'Minikarte zeichnet ohne Fehler');
['low', 'mid', 'high'].forEach(q => { let e = null; try { w.setQuality(q); w.update(1 / 60, {}); w.render(); } catch (x) { e = x; } ok(!e, 'Qualität ' + q + (e ? ': ' + e.message : '')); });
w.setQuality('low');
w.setRemotePlayers([{ id: 'p2', x: 0, z: 5, ry: 0, look: { shirt: '#ff00ff' } }]); w.update(1 / 60, {});
ok(dbg.figSys.figs.filter(f => f && !f.free).length === dbg.npcs.length + 2, 'weitere Spielerfigur hinzugefügt');
w.setRemotePlayers([]); ok(dbg.figSys.figs.filter(f => f && !f.free).length === dbg.npcs.length + 1, 'weitere Spielerfigur entfernt');
w.onContextLost(() => {}); w.onContextRestored(() => {});
const sLow = w.stats(); log('stats low', sLow);
ok(sLow.calls < 150, 'Draw-Calls low < 150 (' + sLow.calls + ')');

// ── 9. Robustheit: fehlende Daten ───────────────────────────
let w2, robust = true;
try { w2 = P.World.create(null, { headless: true }); w2.load({}); for (let i = 0; i < 30; i++) w2.update(1 / 60, { mx: 1, mz: 0 }); w2.refreshLot('studio'); w2.refreshUnlocks(); w2.minimap(fakeCtx, 100, 100, { target: 'nix' }); w2.pick(10, 10); w2.ghost('gibtsnicht', {}); w2.teleport('gibtsnicht'); w2.dispose(); } catch (e) { robust = false; console.error(e); }
ok(robust, 'kein Absturz bei leerem Zustand / unbekannten IDs');

// ── 10. Aufräumen ───────────────────────────────────────────
const geos = new Set(); w.scene.traverse(o => { if (o.geometry) geos.add(o.geometry); });
let disposed = 0; geos.forEach(g => g.addEventListener('dispose', () => { disposed++; }));
const matsAll = Object.values(dbg.mats).filter(Boolean); let mDisp = 0; matsAll.forEach(m => m.addEventListener('dispose', () => { mDisp++; }));
w.dispose();
ok(disposed >= geos.size * 0.95, 'dispose gibt Geometrien frei (' + disposed + '/' + geos.size + ')');
ok(mDisp === matsAll.length, 'dispose gibt Materialien frei (' + mDisp + '/' + matsAll.length + ')');
let left = 0; w.scene.traverse(o => { if (o.isMesh) left++; }); ok(left === 0, 'Szene leer nach dispose (' + left + ')');
let afterOk = true; try { w.update(1 / 60, {}); w.render(); } catch (e) { afterOk = false; }
ok(afterOk, 'Aufrufe nach dispose stürzen nicht ab');

console.log((fails ? 'FEHLER' : 'OK') + ': ' + passes + ' Prüfungen bestanden, ' + fails + ' fehlgeschlagen');
process.exit(fails ? 1 : 0);
