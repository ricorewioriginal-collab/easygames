/* Titanparcours – 3D-Bühne der Figurenwahl (eigener kleiner Renderer, unabhängig von Studio und Kamera des Spiels):
   Drehteller mit Leuchtring in der Läuferfarbe, Spot + Konturlicht, Figur dreht sich langsam (ziehen = drehen) und jubelt bei der Wahl.
   Dazu Porträtbilder für die Karten, nacheinander im Leerlauf gerendert und für die Sitzung gemerkt. */
import { charLook } from './chars.js';

let toonP = null;
const toonReady = () => toonP || (toonP = new Promise((res, rej) => { if (window.ECModel) return res(); const s = document.createElement('script'); s.src = '../easyclash/js/model.js'; s.onload = res; s.onerror = () => { toonP = null; rej(new Error('Figur nicht ladbar')); }; document.head.appendChild(s); })
  .then(() => { const M = window.ECModel; if (!M.__fp) { M.setup({ low: matchMedia('(pointer:coarse)').matches }); M.__fp = 1; } return M; }));
const thumbs = new Map();
/** Toon-Figuren auf Läufergröße bringen (manche Wesen sind im Ursprungsspiel riesig) – gleiche Regel wie im Studio */
export function fitToon(m) { const T = window.THREE; m.updateMatrixWorld(true); const h = new T.Box3().setFromObject(m).getSize(new T.Vector3()).y; if (h > 2.05) m.scale.multiplyScalar(1.85 / h); m.userData.fit = m.scale.x; }   // Figur → Bild (data-URL), gilt für die ganze Sitzung

/** Figur bauen: { obj, fig?, toon?, dispose } */
async function build(kit, k, color) {
  const T = window.THREE, L = charLook(k, color, kit && kit.fromRoster);
  if (L.look && kit) { const P = window.AMC && window.AMC.People, f = await (P ? P.make(kit, L.look) : kit.make(L.look)); f.root.traverse(o => { o.castShadow = !!o.isMesh; }); return { obj: f.root, fig: f, dispose: () => f.dispose() }; }
  if (L.toon) {
    const M = await toonReady(), m = M.build(L.toon); m.scale.setScalar(1.12); M.apply(m, { state: 'idle' }, 1, 0); fitToon(m);
    m.traverse(o => { if (!o.isMesh) return; [].concat(o.material).forEach(mt => { if (mt.color && !mt.userData.lin) { mt.color.convertSRGBToLinear(); if (mt.emissive) mt.emissive.convertSRGBToLinear(); mt.userData.lin = true; } }); });
    return { obj: m, toon: m, F: { state: 'idle' }, tt: 0, dispose: () => {} };
  }
  return { obj: new T.Group(), dispose: () => {} };
}
function lights(T, s, accent) {
  s.add(new T.HemisphereLight(0xc8d8ff, 0x1a1008, 0.75));
  const key = new T.DirectionalLight(0xfff1e0, 1.5); key.position.set(2.2, 3.4, 4); s.add(key);
  const rimB = new T.DirectionalLight(0x2e8bff, 1.6); rimB.position.set(-3, 2.4, -3); s.add(rimB);
  const rimO = new T.DirectionalLight(accent, 1.1); rimO.position.set(3, 1.2, -2.5); s.add(rimO);
  return rimO;
}

export function makePickView(canvas, kit) {
  const T = window.THREE; if (!T) return null;
  const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.2; r.setClearColor(0x000000, 0);
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  const s = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50), accent = new T.Color(0xff7a1f), rim = lights(T, s, accent);
  // Drehteller: dunkler Sockel, leuchtender Ring, weicher Glanz am Boden
  const stage = new T.Group(); s.add(stage);
  const base = new T.Mesh(new T.CylinderGeometry(0.95, 1.02, 0.14, 56), new T.MeshStandardMaterial({ color: 0x15171f, roughness: 0.35, metalness: 0.7 })); base.position.y = -0.07; stage.add(base);
  const ringM = new T.MeshBasicMaterial({ color: accent }), ring = new T.Mesh(new T.TorusGeometry(0.97, 0.018, 8, 90), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = 0.002; stage.add(ring);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.45, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const glowM = new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc), color: accent, transparent: true, blending: T.AdditiveBlending, depthWrite: false });
  const glow = new T.Mesh(new T.PlaneGeometry(3.2, 3.2), glowM); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.004; stage.add(glow);
  const turn = new T.Group(); stage.add(turn);
  let cur = null, tok = 0, spin = 0.5, spinV = 0, drag = null, alive = true, raf = 0, last = performance.now(), time = 0, cheerT = 0, w = 0, h = 0;

  function size() {
    const W = canvas.clientWidth | 0, H = canvas.clientHeight | 0; if (!W || !H || (W === w && H === h)) return; w = W; h = H; r.setSize(W, H, false);
    cam.aspect = W / H; cam.fov = 28; const t = Math.tan(cam.fov * Math.PI / 360), d = Math.max(1.12 / t, 1.15 / (t * cam.aspect));   // ganze Figur samt Drehteller passt immer ins Bild
    cam.position.set(0, 1.2, d); cam.lookAt(0, 0.95, 0); cam.updateProjectionMatrix();
  }
  function frame(now) {
    if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt; size();
    if (!drag) { spinV *= Math.pow(0.04, dt); spin += (0.32 + spinV) * dt; }
    turn.rotation.y = spin; ring.scale.setScalar(1 + Math.sin(time * 2.2) * 0.012); glowM.opacity = 0.55 + Math.sin(time * 2.2) * 0.12;
    if (cur) {
      if (cur.appear < 1) { cur.appear = Math.min(1, cur.appear + dt * 3.2); const e = 1 - Math.pow(1 - cur.appear, 3); cur.obj.scale.setScalar((cur.toon ? cur.toon.userData.fit || 1.12 : 1) * (0.86 + 0.14 * e)); cur.obj.position.y = (1 - e) * 0.25; }
      if (cur.fig) { cur.fig.update(dt); if (cheerT > 0 && (cheerT -= dt) <= 0) cur.fig.play('idle', { fade: 0.4 }); }
      if (cur.toon) { cur.tt += dt; cur.F.state = cheerT > 0 ? 'win' : 'idle'; if (cheerT > 0) cheerT -= dt; window.ECModel.apply(cur.toon, cur.F, dt, cur.tt); }
    }
    r.render(s, cam);
  }
  raf = requestAnimationFrame(frame);
  // Ziehen dreht die Figur, Schwung läuft aus
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, t: performance.now() }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const d = (e.clientX - drag.x) * 0.012, now = performance.now(); spin += d; spinV = d / Math.max(0.016, (now - drag.t) / 1000) * 0.5; drag.x = e.clientX; drag.t = now; });
  const up = () => { drag = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  return {
    /** Figur zeigen (k = Schlüssel, color = Trikotfarbe als Zahl), cheer = kurzer Jubel */
    async show(k, color, cheer) {
      const my = ++tok; accent.setHex(color); ringM.color.copy(accent); glowM.color.copy(accent); rim.color.copy(accent);
      let f; try { f = await build(kit, k, color); } catch (e) { console.warn('Figur', e); return; }
      if (my !== tok || !alive) { f.dispose(); return; }
      if (cur) { turn.remove(cur.obj); cur.dispose(); }
      cur = Object.assign(f, { appear: 0, k }); turn.add(f.obj); spinV = 2.2;
      if (cheer) this.cheer();
    },
    cheer() { if (!cur) return; cheerT = 1.8; if (cur.fig) cur.fig.play(Math.random() < 0.5 ? 'yes' : 'dance', { fade: 0.15, restart: true }); },
    get key() { return cur && cur.k; },
    dispose() { alive = false; cancelAnimationFrame(raf); if (cur) cur.dispose(); cur = null; r.dispose(); try { r.forceContextLoss(); } catch (e) {} }
  };
}

/** Porträts für die Karten: rendert die Figuren der Reihe nach (eine pro Leerlauf-Schritt), cb(k, url) je fertigem Bild */
export function makeThumbs(kit, cb) {
  const T = window.THREE; if (!T) return null;
  const W = 160, H = 200, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  let r = null, s = null, cam = null, queue = [], busy = false, alive = true;
  function init() {
    r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.25; r.setClearColor(0, 0); r.setSize(W, H, false);
    s = new T.Scene(); lights(T, s, new T.Color(0xff7a1f)); cam = new T.PerspectiveCamera(28, W / H, 0.05, 30);
  }
  async function next() {
    if (busy || !alive) return; const k = queue.shift(); if (k == null) return; if (thumbs.has(k)) { cb(k, thumbs.get(k)); return next(); }
    busy = true; if (!r) init();
    try {
      const f = await build(kit, k, 0xff7a1f); if (!alive) { f.dispose(); return; }
      const holder = new T.Group(); holder.rotation.y = 0.38; holder.add(f.obj); s.add(holder);
      if (f.fig) f.fig.update(0.6); if (f.toon) window.ECModel.apply(f.toon, { state: 'idle' }, 1, 0);
      holder.updateMatrixWorld(true); const t = Math.tan(cam.fov * Math.PI / 360);
      if (f.fig) { const top = 1.62 * (f.fig.look && f.fig.look.size || 1); cam.position.set(0, top - 0.08, 0.6 / t); cam.lookAt(0, top - 0.22, 0); }   // Brustbild
      else { const box = new T.Box3().setFromObject(f.obj), hgt = Math.max(0.4, box.max.y - box.min.y), ty = box.min.y + hgt * 0.68; cam.position.set(0, ty + hgt * 0.05, hgt * 0.4 / t); cam.lookAt(0, ty, 0); }
      cam.updateProjectionMatrix();
      r.render(s, cam); const url = cv.toDataURL('image/png'); thumbs.set(k, url); s.remove(holder); f.dispose(); cb(k, url);
    } catch (e) { console.warn('Porträt', e); }
    busy = false; if (alive && queue.length) (window.requestIdleCallback || setTimeout)(() => next(), { timeout: 120 });
  }
  return {
    /** Figuren vorn in die Warteschlange (sichtbare zuerst) */
    want(keys) { const fresh = keys.filter(k => !thumbs.has(k)); keys.filter(k => thumbs.has(k)).forEach(k => cb(k, thumbs.get(k))); queue = fresh.concat(queue.filter(k => !fresh.includes(k))); next(); },
    has: k => thumbs.has(k), get: k => thumbs.get(k),
    dispose() { alive = false; queue = []; if (r) { r.dispose(); try { r.forceContextLoss(); } catch (e) {} } r = null; }
  };
}
