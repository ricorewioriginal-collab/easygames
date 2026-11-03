// Spiel 1: Leuchtturm – Briefe in Flaschen (Strahl drehen, Flaschenpost fangen, Kutter leiten)
import { T, E, mat, camSnap, camTo, seaHeight, bulb, camShake } from '../engine.js';
import { scene, fig } from '../world.js';
import * as C from '../core.js';
const PI = Math.PI;

const SKY = { night: 'night', fog: 'fog', snow: 'winterNight', dusk: 'dusk', storm: 'storm' };
const WEA = { snow: 'snow', storm: 'storm' };

let HALO = null;
function haloTex() { if (HALO) return HALO; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (HALO = new T.CanvasTexture(c)); }
function bottleMesh() {
  const pts = [[0, 0], [0.07, 0], [0.08, 0.02], [0.08, 0.2], [0.06, 0.26], [0.025, 0.31], [0.025, 0.38], [0, 0.38]].map(p => new T.Vector2(p[0], p[1]));
  const g = new T.Group();
  const glass = new T.Mesh(new T.LatheGeometry(pts, 16), new T.MeshPhysicalMaterial({ color: '#7fc3a8', roughness: 0.08, transparent: true, opacity: 0.62, emissive: '#ffd27a', emissiveIntensity: 0 })); g.add(glass);
  const cork = new T.Mesh(new T.CylinderGeometry(0.026, 0.024, 0.05, 10), mat('#a07a4a')); cork.position.y = 0.39; g.add(cork);
  const paper = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.16, 10), new T.MeshStandardMaterial({ color: '#f2e8cf', emissive: '#ffd27a', emissiveIntensity: 0 })); paper.position.y = 0.12; g.add(paper);
  const halo = new T.Sprite(new T.SpriteMaterial({ map: haloTex(), color: '#bfe8ff', transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, fog: false })); halo.scale.setScalar(0.9); halo.position.y = 0.2; g.add(halo);
  g.rotation.z = PI / 2.3; g.scale.setScalar(2.4); g.userData = { glass, paper, halo }; return g;
}
function cutter() {
  const g = new T.Group();
  const hull = new T.Mesh(new T.BoxGeometry(1.6, 0.9, 5), mat('#2a4e6e', { roughness: 0.5 })); hull.position.y = 0.2; g.add(hull);
  const bow = new T.Mesh(new T.ConeGeometry(0.8, 1.6, 4), hull.material); bow.rotation.set(-PI / 2, PI / 4, 0); bow.scale.set(1, 1, 0.56); bow.position.set(0, 0.2, -3.2); g.add(bow);
  const cab = new T.Mesh(new T.BoxGeometry(1.2, 1, 1.4), mat('#f2efe6', { roughness: 0.6 })); cab.position.set(0, 1.1, 0.8); g.add(cab);
  const mast = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 3.4, 8), mat('#ddd')); mast.position.set(0, 2.3, -0.6); g.add(mast);
  const win = bulb('#ffe0a0', 0.08, 0, 1.2, 1.51, g, 4); bulb('#ff3a3a', 0.07, -0.82, 0.8, -1, g, 5); const green = bulb('#3aff6a', 0.07, 0.82, 0.8, -1, g, 5);
  const top = bulb('#ffffff', 0.08, 0, 4, -0.6, g, 2); g.userData = { top, green }; g.scale.setScalar(1.2); return g;
}

export async function start(ctx) {
  const L = C.BEAM_LEVELS[ctx.lvl] || C.BEAM_LEVELS[0];
  const data = await scene('kap', L.finale ? ['finn', 'ben'] : [], { winter: L.sky === 'snow', sky: SKY[L.sky], weather: WEA[L.sky] || null, sea: L.sea, beamOn: true, spots: { finn: [-2.2, -6.5, PI * 0.9], ben: [-1.2, -6.6, PI * 1.1] } });
  const s = C.newBeam(ctx.lvl, { diff: ctx.diff });
  const rig = data.rig, top = data.lh.userData.top;
  rig.add(data.cone); data.cone.visible = true; data.beamL.intensity = 900;
  data.cone.material.opacity = L.fog ? 0.32 : 0.2;
  const camPos = new T.Vector3(0, top + 1.5, -2.5);   // auf der Galerie vor dem Laternenhaus, Blick aufs Meer
  camSnap(camPos, new T.Vector3(0, 5, -60));
  const G = new T.Group(); E.root.add(G);
  const B = new Map(), S = new Map();
  const toW = (a, d) => [Math.sin(a) * (d + 8), -Math.cos(a) * (d + 8)];
  let aimX = null, keyDir = 0, end = false, lastLetter = -1;
  const sc = (a) => { const r = C.beamRange(s); data.cone.scale.set(C.beamWidth(s) / 0.34, C.beamWidth(s) / 0.34, r / 46); };

  const tick = (dt, t) => {
    if (end || ctx.paused()) return;
    if (aimX != null) C.beamAim(s, aimX, dt); else C.beamInput(s, keyDir, dt);
    C.beamTick(s, dt);
    rig.rotation.y = -s.angle; sc();
    // Kamera schaut ein wenig mit
    camTo(camPos, new T.Vector3(Math.sin(s.angle) * 0.6 * 60, 5, -Math.cos(s.angle * 0.6) * 60), 2.5);
    // Flaschen
    for (const b of s.bottles) {
      let m = B.get(b.id); if (!m) { m = bottleMesh(); G.add(m); B.set(b.id, m); }
      const [x, z] = toW(b.a, b.d); m.position.set(x, seaHeight(data.sea, x, z) - 0.55 + Math.sin(t * 2 + b.bob) * 0.06, z); m.rotation.y = t * 0.3 + b.bob;
      const g = Math.min(1, b.glow / 0.7); m.userData.glass.material.emissiveIntensity = g * 1.5; m.userData.paper.material.emissiveIntensity = g * 2.5; m.userData.halo.material.opacity = 0.28 + Math.sin(t * 3 + b.bob) * 0.08 + g * 0.6; m.userData.halo.material.color.set(g > 0.05 ? '#ffd27a' : '#bfe8ff');
    }
    for (const [id, m] of B) if (!s.bottles.some(b => b.id === id) && !m.userData.fly) { G.remove(m); B.delete(id); }
    // Kutter
    for (const sh of s.ships) {
      let m = S.get(sh.id); if (!m) { m = cutter(); G.add(m); S.set(sh.id, m); }
      const [x, z] = toW(sh.a, sh.d); m.position.set(x, seaHeight(data.sea, x, z) - 0.6, z); m.rotation.y = -sh.a + (sh.va > 0 ? -PI / 2 : PI / 2); m.rotation.z = Math.sin(t * 1.3 + sh.id) * 0.05;
      m.userData.top.material.emissive.set(sh.done ? '#3aff6a' : '#ffffff');
    }
    for (const [id, m] of S) if (!s.ships.some(x => x.id === id)) { G.remove(m); S.delete(id); }
    for (const ev of s.ev) {
      if (ev.k === 'bottle') { const m = B.get(ev.id); if (m) { m.userData.fly = true; const p0 = m.position.clone(); let k = 0; const fly = d => { k += d * 1.4; m.position.lerpVectors(p0, new T.Vector3(0, top, 0), Math.min(1, k)); m.scale.setScalar(2.4 * (1 - k * 0.7)); if (k >= 1) { E.hooks.delete(fly); G.remove(m); B.delete(ev.id); } }; E.hooks.add(fly); }
        const li = (ctx.lvl * 3 + ev.letter) % C.LETTERS.length; lastLetter = li; ctx.letter(C.LETTERS[li], li); ctx.sfx('bottle'); }
      if (ev.k === 'ship') { ctx.sfx('horn'); ctx.toast('⚓ Kutter sicher geleitet! +250'); }
      if (ev.k === 'shipLost') ctx.toast('Ein Kutter ist im Dunkeln vorbeigefahren.');
      if (ev.k === 'sink') ctx.sfx('sink');
      if (ev.k === 'flash') { ctx.sfx('flash'); camShake(0.4); }
      if (ev.k === 'end') finish();
    }
    s.ev.length = 0;
    ctx.hud({ time: Math.max(0, Math.ceil(s.dur - s.t)), score: s.score, a: `🍾 ${s.caught}/${s.total}`, b: `⚓ ${s.guided}/${L.ships}`, flash: s.flashCd <= 0 });
  };
  E.hooks.add(tick);
  function finish() {
    end = true; E.hooks.delete(tick);
    const stars = C.beamStars(s);
    if (L.finale) { const f = fig('finn'), b = fig('ben'); if (f && b) { camTo(new T.Vector3(-1.7, 1.6, -3.4), new T.Vector3(-1.7, 1.4, -6.6), 1.2); f.play('yes', { once: true }); } }
    setTimeout(() => ctx.end({ score: s.score, stars, rows: [['Flaschenpost', s.caught + ' / ' + s.total], ['Kutter geleitet', s.guided + ' / ' + L.ships], ['Briefe gelesen', s.letters.length]] }), L.finale ? 2200 : 600);
  }
  return {
    key(code, down) {
      if (code === 'ArrowLeft' || code === 'KeyA' || code === 'KeyQ') { keyDir = down ? -1 : (keyDir === -1 ? 0 : keyDir); aimX = null; return true; }
      if (code === 'ArrowRight' || code === 'KeyD' || code === 'KeyE') { keyDir = down ? 1 : (keyDir === 1 ? 0 : keyDir); aimX = null; return true; }
      if (down && (code === 'Space' || code === 'KeyF' || code === 'Enter' || code === 'ArrowUp' || code === 'KeyW')) { C.beamFlash(s); return true; }
      return false;
    },
    pointer(type, nx) { if (type === 'down' || type === 'move') aimX = (nx - 0.5) * 2 * 1.3; },
    flash: () => C.beamFlash(s),
    stop() { end = true; E.hooks.delete(tick); }
  };
}
