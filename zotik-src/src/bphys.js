/* Echte Physik mit Havok (über Babylon.js, ohne Zeichenfläche): Trümmer von zerschlagenen Kisten und Fässern fliegen,
   prallen vom Boden und von Hindernissen ab und lassen sich von Zotik wegkicken. Gezeichnet wird weiter mit Three –
   jedes Trümmerteil ist ein Three-Mesh, das der Havok-Körper führt. Wird erst beim ersten Zerschlagen geladen (eigener
   Baustein + HavokPhysics.wasm, liegt offline bei). Ohne Trümmer kostet die Physik nichts (kein Schritt, kein Boden). */
import HavokPhysics from '@babylonjs/havok';
import wasmUrl from '@babylonjs/havok/lib/esm/HavokPhysics.wasm?url';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder.js';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder.js';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin.js';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate.js';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin.js';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent.js';

export async function createBPhys({ T, scene3, hgt, COL, HOUSES, max = 28, life = 7, wasmBinary }) {
  const hk = await HavokPhysics(wasmBinary ? { wasmBinary } : { locateFile: () => wasmUrl });
  const engine = new NullEngine(), scene = new Scene(engine);
  scene.enablePhysics(new Vector3(0, -18, 0), new HavokPlugin(true, hk));   /* etwas mehr Fall als echt: wirkt knackiger, wie im Vorbild */
  const pe = scene.getPhysicsEngine(), G = 8, N = 16, _v = new Vector3(), _p = new Vector3();
  let statics = [], gx = 1e9, gz = 1e9, pieces = [], acc = 0, ms = 0;
  const geo = new T.BoxGeometry(1, 1, 1);
  const dropStatics = () => { for (const s of statics) { s.agg.dispose(); s.mesh.dispose(); } statics = []; gx = gz = 1e9; };
  const addStatic = (mesh, type) => { mesh.computeWorldMatrix(true); statics.push({ mesh, agg: new PhysicsAggregate(mesh, type, { mass: 0, friction: .8, restitution: .25 }, scene) }); };
  /* Boden (aus der Höhenfunktion des Spiels) und Hindernisse im Umkreis von G Metern um (x,z) */
  function ground(x, z) {
    if (Math.hypot(x - gx, z - gz) < G * .4) return; dropStatics(); gx = x; gz = z;
    const pos = [], idx = [], st = 2 * G / N;
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const px = x - G + i * st, pz = z - G + j * st; pos.push(px, hgt(px, pz), pz); }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const m = new Mesh('boden', scene), vd = new VertexData(); vd.positions = pos; vd.indices = idx; vd.applyToMesh(m); addStatic(m, PhysicsShapeType.MESH);
    for (const c of COL) if (Math.hypot(c.x - x, c.z - z) < G + c.r) { const h = c.t != null ? Math.max(.4, c.t - hgt(c.x, c.z)) : 6, cy = CreateCylinder('col', { diameter: c.r * 2, height: h, tessellation: 12 }, scene); cy.position.set(c.x, hgt(c.x, c.z) + h / 2 - .2, c.z); addStatic(cy, PhysicsShapeType.CYLINDER); }
    for (const H of HOUSES) { if (Math.hypot(H.x - x, H.z - z) > G + H.R) continue; const ang = Math.atan2(H.s, H.c);
      for (const q of H.segs) { const b = CreateBox('wand', { width: q.hx * 2, height: 4, depth: q.hz * 2 }, scene); b.position.set(q.wx, hgt(q.wx, q.wz) + 2, q.wz); b.rotation.y = -ang; addStatic(b, PhysicsShapeType.BOX); } }
  }
  let lx = 0, lz = 0, lset = false;
  const kill = p => { p.agg.dispose(); p.bm.dispose(); scene3.remove(p.m); p.m.material.dispose(); };
  /* n Trümmerteile bei (x,y,z), Schwung in Richtung (ax,az). art: 'brett' (Kiste), 'daube' (Fass), 'brocken' (Gegner zerfällt; gr = Größe, leuchtet nach) */
  function burst(x, y, z, ax, az, col = 0x8a5a2c, n = 7, art = 'brett', gr = 1) {
    ground(x, z); const out = [], br = art === 'brocken';
    for (let i = 0; i < n; i++) {
      let w, h, d; if (art === 'daube') { w = .16 + Math.random() * .1; h = .6 + Math.random() * .35; d = .07; } else if (br) { w = (.16 + Math.random() * .2) * gr; h = (.14 + Math.random() * .18) * gr; d = (.14 + Math.random() * .2) * gr; } else { w = .42 + Math.random() * .45; h = .08 + Math.random() * .05; d = .16 + Math.random() * .14; }
      const sp0 = br ? .5 * gr : .35, bm = CreateBox('teil', { width: w, height: h, depth: d }, scene); bm.position.set(x + (Math.random() - .5) * 2 * sp0, y + .25 + Math.random() * (br ? 1.2 * gr : .8), z + (Math.random() - .5) * 2 * sp0);
      bm.rotationQuaternion = Quaternion.FromEulerAngles(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
      const mass = br ? .5 * gr : .6, agg = new PhysicsAggregate(bm, PhysicsShapeType.BOX, { mass, friction: .7, restitution: br ? .45 : .35 }, scene);
      const sp = 2.5 + Math.random() * 3.5, an = Math.random() * 6.283, rnd = br ? 3 : 1.8, sx = ax * sp + Math.cos(an) * rnd, sz = az * sp + Math.sin(an) * rnd;
      agg.body.applyImpulse(_v.set(sx * mass, (3 + Math.random() * (br ? 5 : 3.5)) * mass, sz * mass), bm.position);
      agg.body.setAngularVelocity(_v.set((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14));
      const c = new T.Color(col).multiplyScalar(.7 + Math.random() * .5), m = new T.Mesh(geo, new T.MeshStandardMaterial(br ? { color: c, roughness: .45, metalness: .1, emissive: c, emissiveIntensity: .55 } : { color: c, roughness: .85, metalness: 0 })); m.scale.set(w, h, d); m.castShadow = true; m.position.set(bm.position.x, bm.position.y, bm.position.z); scene3.add(m);
      const p = { bm, agg, m, kc: 0, t: (br ? life * .6 : life) + Math.random() * 1.5, w, h, d, mass }; pieces.push(p); out.push(p);
    }
    while (pieces.length > max) kill(pieces.shift());
    return out;
  }
  /* je Bild aufrufen: rechnet in festen 1/60-Schritten (höchstens 3 je Bild) und führt die Three-Meshes nach */
  function step(dt, pl) {
    if (!pieces.length) { if (statics.length) dropStatics(); lset = false; return 0; }
    /* Zotik kickt Trümmer weg: wer hindurchläuft, stößt die Teile in Laufrichtung an (Tempo aus der eigenen Bewegung) */
    if (pl && dt > 0) { const vx = lset ? (pl.x - lx) / dt : 0, vz = lset ? (pl.z - lz) / dt : 0, sp = Math.hypot(vx, vz); lx = pl.x; lz = pl.z; lset = true;
      if (sp > .5 && sp < 30) for (const p of pieces) { const b = p.bm.position, dx = b.x - pl.x, dz = b.z - pl.z, d = Math.hypot(dx, dz); if (d > .85 || b.y < pl.y - .4 || b.y > pl.y + 1.4 || p.kc > 0) continue; p.kc = .3;
        const k = .6 * Math.min(sp, 9); p.agg.body.applyImpulse(_v.set((vx / sp * .7 + dx / (d || 1) * .3) * k * .6, (1.2 + sp * .12) * .6, (vz / sp * .7 + dz / (d || 1) * .3) * k * .6), b); } }
    const t0 = performance.now(); acc = Math.min(acc + dt, .05); let k = 0; while (acc >= 1 / 60 && k < 3) { pe._step(1 / 60); acc -= 1 / 60; k++; } ms = performance.now() - t0;
    for (let i = pieces.length - 1; i >= 0; i--) { const p = pieces[i]; p.t -= dt; if (p.kc > 0) p.kc -= dt; const b = p.bm.position, q = p.bm.rotationQuaternion;
      if (p.t <= 0 || b.y < hgt(b.x, b.z) - 6) { kill(p); pieces.splice(i, 1); continue; }
      p.m.position.set(b.x, b.y, b.z); p.m.quaternion.set(q.x, q.y, q.z, q.w); if (p.t < 1) { const s = Math.max(.01, p.t); p.m.scale.set(p.w * s, p.h * s, p.d * s); } }
    return k;
  }
  /* Druckwelle (Schlag, Zauber): schleudert liegende Trümmer im Umkreis r von (x,z) weg; Rückgabe: Zahl der getroffenen Teile */
  function blast(x, y, z, r = 2.5, pow = 5) { let k = 0; for (const p of pieces) { const b = p.bm.position, dx = b.x - x, dz = b.z - z, d = Math.hypot(dx, dz); if (d > r || Math.abs(b.y - y) > 2.5) continue; const f = pow * (1 - d / r * .6) * p.mass; p.agg.body.applyImpulse(_v.set(dx / (d || 1) * f, f * .7, dz / (d || 1) * f), b); k++; } return k; }
  const clear = () => { for (const p of pieces) kill(p); pieces = []; dropStatics(); };
  return { burst, blast, step, clear, count: () => pieces.length, pieces: () => pieces.map(p => { p.agg.body.getLinearVelocityToRef(_p); return { x: p.bm.position.x, y: p.bm.position.y, z: p.bm.position.z, v: _p.length() }; }), statics: () => statics.length, ms: () => ms };
}
