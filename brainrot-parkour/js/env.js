/* Brainrot Parkour – Renderer-Grundlage für den „KI-Render“-Look: ACES-Tonemapping, sRGB, weiche Schatten und eine
 * Umgebungsspiegelung (PMREM aus einer kleinen Licht-Szene: Himmelsverlauf + helle Flächenlichter). */
(function () {
  'use strict';
  const T = THREE;
  function renderer(canvas, opt) {
    const r = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: !!(opt && opt.alpha) });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, (opt && opt.maxDpr) || 1.75));
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = (opt && opt.exposure) || 1.05;
    r.physicallyCorrectLights = false; r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    return r;
  }
  function gradTex(top, mid, bot) { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, top); g.addColorStop(.5, mid); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; }
  // Umgebung für Spiegelungen: weicher Himmel, warmer Boden, zwei Softboxen und ein Streiflicht
  function env(r, sky) {
    sky = sky || { top: '#8ec8ff', mid: '#fff4e0', bot: '#6a5a4a' };
    const s = new T.Scene(), pm = new T.PMREMGenerator(r);
    const dome = new T.Mesh(new T.SphereGeometry(10, 32, 16), new T.MeshBasicMaterial({ map: gradTex(sky.top, sky.mid, sky.bot), side: T.BackSide })); s.add(dome);
    const box = (w, h, x, y, z, c, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
    box(6, 3, 0, 7, 4, '#ffffff'); box(3, 4, -7, 3, 2, '#fff2dd'); box(3, 3, 7, 2, -3, '#dfeaff'); box(8, 1, 0, 1, -8, '#ffffff');
    const tex = pm.fromScene(s, .02).texture; pm.dispose(); dome.geometry.dispose(); return tex;
  }
  window.BREnv = { renderer, env, gradTex };
})();
