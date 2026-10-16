'use strict';
/* AnMaCha Casino – gemeinsame 3D-Technik (three.js r128): ein Renderer für alle Szenen, sparsame Bildrate,
   Kamera-Einpassung in den freien Bildschirmbereich, Hintergründe, Münzregen, Aufräumen. */
(function (G) {
  const THREE = G.THREE;
  const Gfx = { ok: false };
  const shared = new Set();          // geteilte Texturen/Materialien, die beim Szenenwechsel bleiben
  Gfx.share = x => { shared.add(x); return x; };
  let renderer = null, cur = null, last = 0, acc = 0, raf = 0, wake = 0;
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Gfx.reduced = reduced;

  Gfx.init = canvas => {
    try {
      const dpr = Math.min(G.devicePixelRatio || 1, 2);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 1.5, alpha: false, powerPreference: 'high-performance' });
      renderer.setClearColor(0x07060f, 1);
      Gfx.ok = true;
    } catch (e) { Gfx.ok = false; return false; }
    Gfx.renderer = renderer; Gfx.resize();
    addEventListener('resize', () => { Gfx.resize(); Gfx.kick(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) Gfx.kick(); });
    Gfx.kick();
    return true;
  };
  Gfx.resize = () => {
    if (!renderer) return;
    const w = innerWidth, h = innerHeight;
    let dpr = Math.min(G.devicePixelRatio || 1, 2);
    if (w * h * dpr * dpr > 3.2e6) dpr = Math.max(1, Math.sqrt(3.2e6 / (w * h)));     // große Bildschirme: Pixel sparen
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    if (cur && cur.resize) cur.resize(w, h);
  };
  // Szene setzen: { scene, camera, update(dt, t) → true solange etwas Schnelles läuft, idleFps, resize(w,h) }
  Gfx.set = s => { cur = s; if (s && s.resize) s.resize(innerWidth, innerHeight); Gfx.kick(); };
  Gfx.kick = () => { wake = performance.now() + 400; if (!raf && renderer) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  function frame(now) {
    raf = 0;
    if (document.hidden || !cur) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const busy = cur.update ? cur.update(dt, now / 1000) : false;
    const fps = busy || now < wake ? 60 : (reduced ? 4 : (cur.idleFps || 24));
    acc += dt;
    if (fps >= 60 || acc >= 1 / fps - 0.004) { acc = 0; renderer.render(cur.scene, cur.camera); }
    raf = requestAnimationFrame(frame);
  }

  // Objekt (Breite w, Höhe h, Mitte bei 0,0,0) in das Rechteck rect (CSS-Pixel) einpassen
  Gfx.fit = (cam, w, h, rect, opt) => {
    opt = opt || {};
    const W = innerWidth, H = innerHeight; cam.aspect = W / H;
    const tanH = Math.tan(cam.fov * Math.PI / 360);
    const needH = h * H / Math.max(60, rect.h), needW = w * W / Math.max(60, rect.w) / cam.aspect;
    const dist = Math.max(needH, needW) / (2 * tanH) * (opt.pad || 1.04);
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
    cam.setViewOffset(W, H, -(cx - W / 2), -(cy - H / 2), W, H);
    cam.updateProjectionMatrix();
    return dist;
  };
  // freier Bereich zwischen den HTML-Leisten
  Gfx.freeRect = (top, bottom, left, right) => ({ x: left || 0, y: top || 0, w: innerWidth - (left || 0) - (right || 0), h: innerHeight - (top || 0) - (bottom || 0) });

  Gfx.canvasTex = (c, opt) => { const t = new THREE.CanvasTexture(c); t.anisotropy = Math.min(4, renderer ? renderer.capabilities.getMaxAnisotropy() : 1); if (opt && opt.noMip) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; } return t; };
  Gfx.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // Hintergrund: Farbverlauf + langsam schwebende Lichtpunkte
  Gfx.backdrop = (scene, theme, opt) => {
    opt = opt || {};
    const c = Gfx.canvas(512, 512), g = c.getContext('2d');
    g.fillStyle = '#030208'; g.fillRect(0, 0, 512, 512);
    const q = g.createRadialGradient(256, 230, 10, 256, 256, 380); q.addColorStop(0, theme.bg); q.addColorStop(1, '#030208'); g.fillStyle = q; g.fillRect(0, 0, 512, 512);
    g.globalAlpha = opt.glow || 0.42; const q1 = g.createRadialGradient(256, 210, 10, 256, 240, 300); q1.addColorStop(0, theme.c || theme.a); q1.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = q1; g.fillRect(0, 0, 512, 512); g.globalAlpha = 1;
    g.globalAlpha = 0.18; for (let i = 0; i < 9; i++) { g.strokeStyle = i % 2 ? theme.a : theme.b; g.lineWidth = 3; g.beginPath(); g.arc(256, 600, 260 + i * 40, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    const tex = Gfx.canvasTex(c, { noMip: true });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshBasicMaterial({ map: tex, depthWrite: false }));
    plane.position.z = opt.z || -14; scene.add(plane);
    // Lichtpunkte
    const n = opt.dots || 70, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const ca = new THREE.Color(theme.a), cb = new THREE.Color(theme.b);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 34; pos[i * 3 + 1] = (Math.random() - 0.5) * 20; pos[i * 3 + 2] = -4 - Math.random() * 8; const k = Math.random() < 0.5 ? ca : cb; col.set([k.r, k.g, k.b], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.35, map: Gfx.dotTex(), vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(pts);
    return { plane, pts, update(t) { pts.position.y = Math.sin(t * 0.15) * 0.4; pts.position.x = Math.cos(t * 0.1) * 0.5; pts.material.opacity = 0.55 + Math.sin(t * 0.8) * 0.15; } };
  };
  let dotT = null;
  Gfx.dotTex = () => { if (dotT) return dotT; const c = Gfx.canvas(64, 64), g = c.getContext('2d'); const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.3, 'rgba(255,255,255,.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); dotT = Gfx.share(Gfx.canvasTex(c)); return dotT; };

  // Goldmünzen-Material (geteilt)
  let coinMats = null;
  Gfx.coinMaterials = () => {
    if (coinMats) return coinMats;
    const c = Gfx.canvas(128, 128), g = c.getContext('2d');
    const q = g.createRadialGradient(50, 44, 4, 64, 64, 64); q.addColorStop(0, '#fff6c8'); q.addColorStop(0.5, '#ffcc22'); q.addColorStop(1, '#a86400'); g.fillStyle = q; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = '#8a4b00'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = '#9a5a00'; g.font = '900 64px "Trebuchet MS",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', 64, 68);
    const face = new THREE.MeshStandardMaterial({ map: Gfx.canvasTex(c), metalness: 0.6, roughness: 0.3, emissive: 0x3a2400 });
    const edge = new THREE.MeshStandardMaterial({ color: 0xd99a10, metalness: 0.8, roughness: 0.3, emissive: 0x2a1800 });
    coinMats = [edge, face, face]; [edge, face, face.map].forEach(Gfx.share);
    return coinMats;
  };

  // Münzregen (InstancedMesh, nur aktiv solange er läuft)
  Gfx.coinShower = scene => {
    const N = 70, geo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 20); geo.rotateX(Math.PI / 2);
    const mesh = new THREE.InstancedMesh(geo, Gfx.coinMaterials(), N); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);
    const P = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    let active = 0, emit = 0;
    const api = {
      mesh,
      start(power, at) { emit = Math.min(1, power || 0.5) * 2.4; mesh.visible = true; api.origin = at || new THREE.Vector3(0, 0, 1);
        for (let i = 0; i < N; i++) P[i] = P[i] || {}; for (const p of P) p.life = 0; active = 1; },
      stop() { emit = 0; },
      update(dt) {
        if (!active) return false;
        let alive = 0; emit = Math.max(0, emit - dt);
        for (let i = 0; i < N; i++) {
          const p = P[i];
          if (p.life <= 0 && emit > 0 && Math.random() < dt * 40) {
            p.life = 3; p.x = api.origin.x + (Math.random() - 0.5) * 1.5; p.y = api.origin.y - 0.5; p.z = api.origin.z + Math.random();
            p.vx = (Math.random() - 0.5) * 7; p.vy = 4 + Math.random() * 6; p.vz = Math.random() * 3; p.rx = Math.random() * 6; p.ry = Math.random() * 6; p.wr = (Math.random() - 0.5) * 16;
          }
          if (p.life > 0) {
            p.life -= dt; p.vy -= 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rx += p.wr * dt; p.ry += p.wr * 0.7 * dt; alive++;
            m4.compose(v.set(p.x, p.y, p.z), q.setFromEuler(e.set(p.rx, p.ry, 0)), s);
          } else m4.makeScale(0, 0, 0);
          mesh.setMatrixAt(i, m4);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (!alive && emit <= 0) { active = 0; mesh.visible = false; }
        return true;
      }
    };
    return api;
  };

  // Standard-Licht
  Gfx.lights = (scene, theme) => {
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(2, 4, 6); scene.add(d);
    const h = new THREE.HemisphereLight(new THREE.Color(theme.a), new THREE.Color(theme.bg), 0.45); scene.add(h);
  };

  // Alles freigeben, was eine Szene belegt hat (Speicher sparen beim Wechsel)
  Gfx.dispose = root => {
    if (!root) return;
    root.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) { if (shared.has(m)) continue; for (const k in m) { const v = m[k]; if (v && v.isTexture && !shared.has(v)) v.dispose(); } m.dispose(); }
    });
  };

  // Projektion 3D → Bildschirm (CSS-Pixel)
  const pv = new THREE.Vector3();
  Gfx.project = (cam, x, y, z, out) => {
    pv.set(x, y, z).project(cam);
    out = out || {}; out.x = (pv.x + 1) / 2 * innerWidth; out.y = (1 - pv.y) / 2 * innerHeight; return out;
  };

  // Glühender Rahmen (für Gewinnfelder)
  let frameTex = null;
  Gfx.frameTex = () => {
    if (frameTex) return frameTex;
    const c = Gfx.canvas(128, 128), g = c.getContext('2d');
    g.shadowColor = '#fff2a0'; g.shadowBlur = 14; g.strokeStyle = '#ffe680'; g.lineWidth = 7;
    const r = 18; g.beginPath(); g.moveTo(10 + r, 10); g.arcTo(118, 10, 118, 118, r); g.arcTo(118, 118, 10, 118, r); g.arcTo(10, 118, 10, 10, r); g.arcTo(10, 10, 118, 10, r); g.closePath(); g.stroke(); g.stroke();
    frameTex = Gfx.share(Gfx.canvasTex(c)); return frameTex;
  };

  G.CasinoGfx = Gfx;
})(window);
