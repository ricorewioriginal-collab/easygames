/* Babylon.js-Kollisionswelt (Phase 1 der Umstellung): läuft ohne Zeichenfläche (NullEngine), gespeist aus den
   vorhandenen Hindernissen (COL = Rundhindernisse, HOUSES.segs = Hauswände, OB = Rätselblöcke).
   Wird nur per ?bjs geladen (eigener Chunk, normaler Start bleibt unverändert). Es sind nur Hindernisse im Umkreis
   des Spielers als Proxys da (Handy-schonend). */
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder.js';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder.js';
import '@babylonjs/core/Collisions/collisionCoordinator.js';
import '@babylonjs/core/Meshes/instancedMesh.js';

export function createBWorld({ COL, HOUSES, OB, obPass, radius = 40 }) {
  const engine = new NullEngine(), scene = new Scene(engine);
  scene.collisionsEnabled = true;
  const cylSrc = CreateCylinder('cyl', { diameter: 2, height: 8, tessellation: 10 }, scene), boxSrc = CreateBox('box', { size: 1 }, scene);
  for (const m of [cylSrc, boxSrc]) { m.isVisible = false; m.checkCollisions = true; m.position.y = -999; m.computeWorldMatrix(true); }
  const _ell = new Vector3(), _vel = new Vector3();
  const mover = CreateBox('mover', { size: 1 }, scene); mover.checkCollisions = false;
  let proxies = [], cx = 1e9, cz = 1e9;
  const clear = () => { for (const p of proxies) p.dispose(); proxies = []; };
  const add = (src, x, y, z, sx, sy, sz, ry, top) => { const m = src.createInstance('p'); m.position.set(x, y, z); m.scaling.set(sx, sy, sz); m.rotation.y = ry || 0; m.checkCollisions = true; m._top = top; m.computeWorldMatrix(true); proxies.push(m); };
  /* Proxys um (x,z) neu aufbauen, wenn sich der Spieler weit genug bewegt hat oder force gesetzt ist */
  let sig = -1;
  function focus(x, z, force) {
    const sg = COL.length * 31 + HOUSES.length * 7 + (OB ? OB.length : 0); if (sg !== sig) { sig = sg; force = true; }
    if (!force && Math.hypot(x - cx, z - cz) < radius * .4) return false;
    cx = x; cz = z; clear();
    const R = radius;
    for (const c of COL) if (Math.abs(c.x - x) < R + c.r && Math.abs(c.z - z) < R + c.r) add(cylSrc, c.x, 0, c.z, c.r, 1, c.r, 0, c.t);
    for (const H of HOUSES) { if (Math.hypot(H.x - x, H.z - z) > R + H.R) continue; const ang = Math.atan2(H.s, H.c);
      for (const q of H.segs) add(boxSrc, q.wx, 1.5, q.wz, q.hx * 2, 3, q.hz * 2, -ang, H.top); }
    if (OB) for (const o of OB) if ((!obPass || !obPass(o)) && Math.abs(o.x - x) < R && Math.abs(o.z - z) < R) add(boxSrc, o.x, 1.5, o.z, o.hw * 2, 3, o.hd * 2);
    return true;
  }
  /* Spieler/Gegner (Punkt o.x,o.z, Radius r) um (dx,dz) bewegen; Rückgabe: tatsächlich gelaufene Strecke */
  function move(o, dx, dz, r = .4, h = 1.8) {
    focus(o.x, o.z);
    if (o.y != null) for (const m of proxies) m.checkCollisions = !(m._top != null && o.y > m._top - .5);   /* Dächer/Plattformen: oben drüber frei */
    _ell.set(r, h / 2, r); mover.ellipsoid = _ell; mover.position.set(o.x, h / 2, o.z); mover.computeWorldMatrix(true);
    mover.checkCollisions = true; mover.moveWithCollisions(_vel.set(dx, 0, dz)); mover.checkCollisions = false;
    for (const m of proxies) m.checkCollisions = true;
    const nx = mover.position.x, nz = mover.position.z, d = Math.hypot(nx - o.x, nz - o.z);
    o.x = nx; o.z = nz; return d;
  }
  return { scene, engine, focus, move, count: () => proxies.length, dispose() { clear(); scene.dispose(); engine.dispose(); } };
}
