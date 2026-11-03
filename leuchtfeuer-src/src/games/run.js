// Spiel 4: Gegenwind – Lauf über den Deich (drei Spuren, springen, ducken, Laternenlichter sammeln)
import { T, E, mat, box, cyl, ground, makeSea, camTo, camSnap, sunFollow, setSky, weather, figure, camShake, rnd } from '../engine.js';
import { SETS } from '../sets.js';
import { scene } from '../world.js';
import * as C from '../core.js';
const PI = Math.PI, LANE = 1.5, SEG = 40, NSEG = 6;

// Deich als eigener Schauplatz: Segmente werden beim Laufen nach vorn versetzt
SETS.deich = (G, o) => {
  const segs = [];
  const path = mat('asphalt', { rep: [1, 8], roughness: 0.6, bumpScale: 0.3 }), grass = mat(o.deich === 'winter' ? 'snow' : 'grass', { rep: [3, 8], roughness: 0.95, bumpScale: 0.4 }), post = mat('#5a4636', { roughness: 0.9 });
  for (let i = 0; i < NSEG; i++) {
    const s = new T.Group();
    const p = new T.Mesh(new T.PlaneGeometry(5.4, SEG), path); p.rotation.x = -PI / 2; p.receiveShadow = true; s.add(p);
    for (const side of [-1, 1]) { const g = new T.Mesh(new T.PlaneGeometry(16, SEG), grass); g.rotation.set(-PI / 2, 0, 0); g.rotation.y = 0; const q = new T.Group(); q.add(g); g.rotation.x = -PI / 2; q.rotation.z = side * 0.32; q.position.set(side * (2.7 + 7.6), -2.4, 0); g.receiveShadow = true; s.add(q); }
    const r = rnd(i + 3);
    for (let k = 0; k < 8; k++) cyl(0.06, 0.07, 1.1, post, 4.2, 0.2, -SEG / 2 + k * 5, s, 6);
    const rail = box(0.05, 0.05, SEG, post, 4.2, 0.65, 0, s, false);
    for (let k = 0; k < 3; k++) { const b = cyl(0.05, 0.05, 3, mat('#3a3a3a'), -3.3, 1.5, -SEG / 2 + r() * SEG, s, 6); const l = new T.Mesh(new T.SphereGeometry(0.14, 10, 8), new T.MeshStandardMaterial({ color: '#fff0c0', emissive: '#ffd27a', emissiveIntensity: 2.5 })); l.position.set(b.position.x, 3.05, b.position.z); s.add(l); }
    for (let k = 0; k < 6; k++) { const sh = new T.Mesh(new T.SphereGeometry(0.35, 10, 8), mat('#f2efe6', { roughness: 1 })); sh.scale.set(1.4, 0.9, 0.9); sh.position.set(9 + r() * 10, -1.8 + r() * 0.6, -SEG / 2 + r() * SEG); if (o.deich === 'winter' || r() < 0.5) sh.visible = false; s.add(sh); }
    s.position.z = -i * SEG + SEG / 2; G.add(s); segs.push(s);
  }
  const sea = makeSea(220, 400, { color: '#1c4560', amp: o.deich === 'storm' ? 0.8 : 0.3 }); sea.position.set(-120, -2.6, -100); G.add(sea);
  return { segs, sea, spots: {}, sky: { rain: 'grey', storm: 'storm', winter: 'snow', dusk: 'dusk' }[o.deich] || 'grey', weather: { rain: 'rain', storm: 'storm', winter: 'snow' }[o.deich] || null, cam: { pos: [0, 3.2, 7], look: [0, 1, -6] } };
};

function itemMesh(it, G) {
  const g = new T.Group();
  if (it.type === 'drift') { const l = cyl(0.22, 0.26, 1.4, mat('#7a6a58', { roughness: 0.95 }), 0, 0.25, 0, g, 10); l.rotation.z = PI / 2; const b = cyl(0.08, 0.1, 0.7, l.material, 0.3, 0.45, 0.15, g, 6); b.rotation.set(0.6, 0, 0.3); }
  else if (it.type === 'pfuetze') { const p = new T.Mesh(new T.CircleGeometry(0.75, 24), new T.MeshPhysicalMaterial({ color: '#2a3a4a', roughness: 0.02, metalness: 0.2, clearcoat: 1 })); p.rotation.x = -PI / 2; p.position.y = 0.02; p.scale.set(1, 1.3, 1); g.add(p); const rim = cyl(0.7, 0.7, 0.04, mat('#3a3a2a', { roughness: 1 }), 0, 0.0, 0, g, 24); rim.scale.z = 1.3; }
  else if (it.type === 'moewe') { const body = new T.Mesh(new T.CapsuleGeometry(0.12, 0.3, 4, 10), mat('#f4f4f2', { roughness: 0.7 })); body.rotation.x = PI / 2; g.add(body); const wm = mat('#9aa2aa', { roughness: 0.7, side: T.DoubleSide }); for (const sd of [-1, 1]) { const w = new T.Mesh(new T.PlaneGeometry(0.7, 0.22), wm); w.position.x = sd * 0.38; w.rotation.x = -PI / 2; g.add(w); g.userData['w' + sd] = w; } const bk = new T.Mesh(new T.ConeGeometry(0.03, 0.12, 6), mat('#e8b23a')); bk.rotation.x = PI / 2; bk.position.z = 0.3; g.add(bk); g.position.y = 1.35; g.rotation.y = PI; }
  else if (it.type === 'welle') { const w = new T.Mesh(new T.CylinderGeometry(0.6, 0.6, LANE * 2.2, 20, 1, false, 0, PI), new T.MeshPhysicalMaterial({ color: '#3a7a9a', roughness: 0.1, transparent: true, opacity: 0.8, clearcoat: 1 })); w.rotation.z = PI / 2; w.position.y = 0.0; g.add(w); const foam = new T.Mesh(new T.TorusGeometry(0.6, 0.08, 6, 20, PI), mat('#f4fbff')); foam.rotation.y = PI / 2; foam.scale.set(1, 1, 1); g.add(foam); g.userData.wave = true; }
  else if (it.type === 'bank') { const wd = mat('wood', { rep: [1, 0.3] }); for (let i = 0; i < 3; i++) box(1.3, 0.05, 0.12, wd, 0, 0.45, -0.15 + i * 0.15, g); box(1.3, 0.3, 0.05, wd, 0, 0.75, -0.25, g); for (const sx of [-0.55, 0.55]) box(0.06, 0.45, 0.4, mat('#2d3238', { metalness: 0.5 }), sx, 0.22, 0, g); }
  else if (it.type === 'licht') { const l = new T.Mesh(new T.OctahedronGeometry(0.16), new T.MeshStandardMaterial({ color: '#fff3c0', emissive: '#ffcf5a', emissiveIntensity: 3 })); g.add(l); const halo = new T.Mesh(new T.SphereGeometry(0.32, 12, 10), new T.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false })); g.add(halo); g.position.y = it.y || 0.9; }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const x = it.lanes ? (it.lanes[0] + it.lanes[1]) / 2 * LANE : it.lane * LANE; g.position.x = x; g.position.z = -it.z; G.add(g); return g;
}

export async function start(ctx) {
  const L = C.RUN_LEVELS[ctx.lvl] || C.RUN_LEVELS[0], who = ctx.who || 'finn';
  const data = await scene('deich', [who], { deich: L.weather, winter: L.weather === 'winter' });
  const s = C.newRun(ctx.lvl, { diff: ctx.diff }), f = (await figure(who, { winter: L.weather === 'winter' }));
  f.root.position.set(0, 0, 0); f.root.rotation.y = PI; f.play('jog', { fade: 0 });
  const G = new T.Group(); E.root.add(G); const M = new Map();
  camSnap(new T.Vector3(0, 3.4, 7), new T.Vector3(0, 1, -8));
  let end = false, airAnim = false;
  const tick = (dt, t) => {
    if (end || ctx.paused()) return;
    C.runTick(s, dt);
    const z = -s.z; f.root.position.set(s.x * LANE, s.y, z);
    const lean = s.gust > 0 ? s.gustDir * 0.12 : 0; f.root.rotation.z += (lean - f.root.rotation.z) * Math.min(1, dt * 5);
    if (s.y > 0.05) { if (!airAnim) { f.play('jump', { fade: 0.08 }); airAnim = true; } } else if (s.duck > 0) { f.play('slide', { fade: 0.08 }); airAnim = false; } else { airAnim = false; f.play(s.hurt > 1.0 ? 'knock' : 'sprint', { speed: Math.min(1.4, s.speed / 10), fade: 0.12 }); }
    f.root.visible = s.hurt > 0 ? Math.floor(t * 12) % 2 === 0 : true;
    // Segmente nach vorn versetzen
    for (const sg of data.segs) if (sg.position.z > z + SEG) sg.position.z -= NSEG * SEG;
    data.sea.position.z = z - 100;
    for (const it of s.items) { if (it.done && M.has(it.id)) { const m = M.get(it.id); G.remove(m); M.delete(it.id); continue; } if (!M.has(it.id) && !it.done && it.z < s.z + 90) M.set(it.id, itemMesh(it, G)); }
    for (const [id, m] of M) { if (!s.items.some(i => i.id === id)) { G.remove(m); M.delete(id); continue; } if (m.userData['w1']) { const fl = Math.sin(t * 10 + id) * 0.5; m.userData['w1'].rotation.z = fl; m.userData['w-1'].rotation.z = -fl; } if (m.userData.wave) m.position.y = Math.sin(t * 3 + id) * 0.15; if (m.children.length === 2 && m.children[1].material.blending === T.AdditiveBlending) m.rotation.y = t * 2; }
    for (const ev of s.ev) {
      if (ev.k === 'light') ctx.sfx('light'); if (ev.k === 'jump') ctx.sfx('jump'); if (ev.k === 'hit') { ctx.sfx('hit'); camShake(0.8); ctx.toast({ drift: 'Treibgut!', moewe: 'Eine Möwe!', pfuetze: 'Platsch!', welle: 'Die Welle hat dich erwischt!', bank: 'Autsch, die Bank!' }[ev.type]); }
      if (ev.k === 'gust') { ctx.sfx('wind'); ctx.toast(ev.dir < 0 ? '💨 Böe von rechts!' : '💨 Böe von links!'); }
      if (ev.k === 'end') finish();
    }
    s.ev.length = 0;
    camTo(new T.Vector3(s.x * LANE * 0.55, 3.3 + s.y * 0.3, z + 6.6), new T.Vector3(s.x * LANE * 0.6, 1.1, z - 7), 7);
    sunFollow(0, z - 10);
    ctx.hud({ time: L.len ? Math.round(Math.max(0, L.len - s.z)) + ' m' : Math.round(s.z) + ' m', score: C.runScore(s), a: '❤'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, 3 - s.lives)), b: `✨ ${s.lights}`, prog: L.len ? s.z / L.len : 0 });
  };
  E.hooks.add(tick);
  function finish() {
    end = true; E.hooks.delete(tick); f.root.visible = true; f.root.rotation.z = 0;
    if (s.won) { f.play('yes', { once: true }); f.root.rotation.y = 0; camTo(new T.Vector3(1.4, 1.8, -s.z - 3.2), new T.Vector3(0, 1.3, -s.z), 2); ctx.sfx('win'); } else f.play('down', { once: true });
    setTimeout(() => ctx.end({ score: C.runScore(s), stars: C.runStars(s), lost: !s.won && !!L.len, rows: [['Strecke', Math.round(s.z) + ' m'], ['Laternenlichter', s.lights], ['Herzen übrig', Math.max(0, s.lives)]] }), 1500);
  }
  let tx = null, ty = null;
  return {
    key(code, down) {
      if (!down) return false;
      if (code === 'ArrowLeft' || code === 'KeyA' || code === 'KeyQ') { C.runMove(s, -1); return true; }
      if (code === 'ArrowRight' || code === 'KeyD' || code === 'KeyE') { C.runMove(s, 1); return true; }
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space' || code === 'Enter') { C.runJump(s); return true; }
      if (code === 'ArrowDown' || code === 'KeyS' || code === 'KeyF' || code === 'ShiftLeft') { C.runDuck(s); return true; }
      return false;
    },
    pointer(type, nx, ny) {
      if (type === 'down') { tx = nx; ty = ny; }
      else if (type === 'up' && tx != null) { const dx = nx - tx, dy = ny - ty; if (Math.max(Math.abs(dx), Math.abs(dy)) < 0.03) C.runJump(s); else if (Math.abs(dx) > Math.abs(dy)) C.runMove(s, Math.sign(dx)); else if (dy < 0) C.runJump(s); else C.runDuck(s); tx = null; }
    },
    stop() { end = true; E.hooks.delete(tick); }
  };
}
