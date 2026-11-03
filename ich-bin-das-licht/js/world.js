// Ich bin das Licht – 3D-Welt (Three.js r128, echte Figuren aus ../figuren/)
(function (root) {
  'use strict';
  const T = root.THREE, D = root.IBDL;
  const PI = Math.PI;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let R, scene, cam, clock, kit, envTex, aniso = 4, quality = 'hoch';
  const sets = {}, figs = {}, figP = {};
  let cur = null, camPos = new T.Vector3(0, 1.6, 5), camLook = new T.Vector3(0, 1.2, 0), camT = 0, light = 30;
  const tmpV = new T.Vector3(), tmpV2 = new T.Vector3();

  // ------------------------------------------------------------ Texturen (Canvas, scharf, ohne Dateien)
  function cTex(w, h, draw, rep, color = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new T.CanvasTexture(c); t.anisotropy = aniso; if (color) t.encoding = T.sRGBEncoding;
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function rnd(s) { let x = s || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
  const TEX = {};
  function tex(name) {
    if (TEX[name]) return TEX[name];
    const r = rnd(name.length * 97 + 11);
    const make = {
      planks: () => cTex(1024, 1024, (g, w, h) => {
        const n = 8; for (let i = 0; i < n; i++) {
          const y = i * h / n, base = 92 + r() * 30; g.fillStyle = `rgb(${base + 40},${base},${base * 0.62})`; g.fillRect(0, y, w, h / n);
          for (let k = 0; k < 70; k++) { g.strokeStyle = `rgba(60,34,18,${0.05 + r() * 0.12})`; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); const yy = y + r() * h / n; g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + (r() - 0.5) * 8, w * 0.6, yy + (r() - 0.5) * 8, w, yy + (r() - 0.5) * 6); g.stroke(); }
          g.fillStyle = 'rgba(30,16,8,.55)'; g.fillRect(0, y, w, 2); const cut = r() * w; g.fillRect(cut, y, 2, h / n);
        }
      }, [3, 3]),
      wallpaper: () => cTex(512, 512, (g, w, h) => {
        g.fillStyle = '#4c5466'; g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(x, 0, 30, h); }
        g.strokeStyle = 'rgba(220,210,190,.10)'; g.lineWidth = 2;
        for (let y = 32; y < h; y += 128) for (let x = 32; x < w; x += 128) { g.beginPath(); g.ellipse(x, y, 18, 30, 0, 0, PI * 2); g.stroke(); g.beginPath(); g.moveTo(x, y - 40); g.lineTo(x, y + 40); g.stroke(); }
      }, [4, 2]),
      warmwall: () => cTex(512, 512, (g, w, h) => {
        g.fillStyle = '#b07a5a'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() < .5 ? 255 : 80},${r() < .5 ? 200 : 60},150,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 3, 3); }
      }, [3, 2]),
      brick: () => cTex(1024, 1024, (g, w, h) => {
        g.fillStyle = '#2a2024'; g.fillRect(0, 0, w, h); const bh = 42, bw = 128;
        for (let y = 0, row = 0; y < h; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < w; x += bw) {
          const v = 70 + r() * 50; g.fillStyle = `rgb(${v + 50},${v * 0.55},${v * 0.5})`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
          for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.15})`; g.fillRect(x + r() * bw, y + r() * bh, 4, 3); }
        }
      }, [4, 3]),
      brickN: () => cTex(512, 512, (g, w, h) => {
        g.fillStyle = '#8080ff'; g.fillRect(0, 0, w, h); const bh = 21, bw = 64;
        for (let y = 0, row = 0; y < h; y += bh, row++) { g.fillStyle = '#80a0ff'; g.fillRect(0, y, w, 2); g.fillStyle = '#8060ff'; g.fillRect(0, y + bh - 2, w, 2); for (let x = -(row % 2) * bw / 2; x < w; x += bw) { g.fillStyle = '#a080ff'; g.fillRect(x, y, 2, bh); g.fillStyle = '#6080ff'; g.fillRect(x + bw - 2, y, 2, bh); } }
      }, [4, 3], false),
      cobble: () => cTex(1024, 1024, (g, w, h) => {
        g.fillStyle = '#16161c'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 52) for (let x = (y / 52 % 2) * 30; x < w; x += 60) { const v = 38 + r() * 30; g.fillStyle = `rgb(${v},${v},${v + 8})`; g.beginPath(); g.roundRect ? g.roundRect(x + 4, y + 4, 52, 44, 12) : g.rect(x + 4, y + 4, 52, 44); g.fill(); }
      }, [6, 10]),
      puddle: () => cTex(512, 512, (g, w, h) => {
        g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h, s = 30 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, '#060606'); gr.addColorStop(0.7, '#202020'); gr.addColorStop(1, 'rgba(154,154,154,0)'); g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2); }
      }, [6, 10], false),
      fabric: () => cTex(512, 512, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? '#d9d9d9' : '#ffffff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.06})`; g.fillRect(r() * w, r() * h, 1, 4); }
      }, [3, 1]),
      glitter: () => cTex(1024, 1024, (g, w, h) => {
        g.fillStyle = '#b8b8b8'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 26000; i++) { const v = r() < 0.5 ? 255 : 90; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * w, r() * h, 2, 2); }
      }, [6, 6], false),
      glitterN: () => cTex(1024, 1024, (g, w, h) => {
        g.fillStyle = '#8080ff'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 30000; i++) { g.fillStyle = `rgb(${(r() * 255) | 0},${(r() * 255) | 0},255)`; g.fillRect(r() * w, r() * h, 2, 2); }
      }, [6, 6], false),
      sky: () => cTex(2048, 768, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05061a'); gr.addColorStop(0.55, '#1b1f6e'); gr.addColorStop(0.8, '#5b2a8e'); gr.addColorStop(1, '#c23f9a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.8})`; g.fillRect(r() * w, r() * h * 0.5, 1.5, 1.5); }
        g.fillStyle = '#0a0a1c'; let x = 0;
        while (x < w) { const bw = 40 + r() * 90, bh = 90 + r() * 260; g.fillRect(x, h - bh, bw, bh); for (let yy = h - bh + 10; yy < h - 8; yy += 14) for (let xx = x + 6; xx < x + bw - 8; xx += 12) if (r() < 0.35) { g.fillStyle = r() < .5 ? '#ffd38a' : '#9fc1ff'; g.fillRect(xx, yy, 5, 7); g.fillStyle = '#0a0a1c'; } x += bw + 2; }
        // Fernsehturm wie auf dem Buchcover
        const tx = w * 0.62; g.fillStyle = '#0d0d22'; g.fillRect(tx - 7, h - 560, 14, 560); g.beginPath(); g.arc(tx, h - 470, 34, 0, PI * 2); g.fill(); g.fillRect(tx - 2, h - 700, 4, 150);
        g.fillStyle = '#ff3355'; g.beginPath(); g.arc(tx, h - 700, 4, 0, PI * 2); g.fill();
      }),
      screenTV: () => cTex(512, 288, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b55ff'); gr.addColorStop(0.5, '#a23dff'); gr.addColorStop(1, '#ff2f9a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + i * 0.03})`; g.beginPath(); g.moveTo(w * 0.5, 0); g.lineTo(w * (i / 6), h); g.lineTo(w * (i / 6) + 30, h); g.fill(); }
        g.fillStyle = 'rgba(10,6,20,.85)'; [[0.42, 1], [0.58, 1]].forEach(([x]) => { g.beginPath(); g.arc(w * x, h * 0.45, 18, 0, PI * 2); g.fill(); g.fillRect(w * x - 18, h * 0.52, 36, 120); });
      }),
      clock: () => cTex(256, 256, (g, w, h) => {
        g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(128, 128, 124, 0, PI * 2); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke();
        for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; g.fillStyle = '#222'; g.save(); g.translate(128, 128); g.rotate(a); g.fillRect(-3, -112, 6, i % 3 ? 12 : 22); g.restore(); }
        g.lineCap = 'round'; g.strokeStyle = '#111'; g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(PI * 2 * 6.5 / 12) * 60, 128 - Math.cos(PI * 2 * 6.5 / 12) * 60); g.stroke();
        g.lineWidth = 5; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 128 + 92); g.stroke();
      }),
      weave: () => cTex(256, 256, (g, w, h) => { g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`; g.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.06})`; g.fillRect(x, 0, 1, h); } }, [8, 8]),
      denim: () => cTex(256, 256, (g, w, h) => { g.fillStyle = '#dcdcdc'; g.fillRect(0, 0, w, h); for (let i = -h; i < w; i += 3) { g.strokeStyle = `rgba(0,0,0,${0.06 + r() * 0.08})`; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.15})`; g.fillRect(r() * w, r() * h, 2, 1); } }, [6, 6]),
      glow: () => cTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
      beam: () => cTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.9)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, null, false),
      lane: () => cTex(64, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,.75)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h); }),
      poster2: () => cTex(512, 768, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1b2a8f'); gr.addColorStop(1, '#ff2f9a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(255,255,255,.9)'; g.font = 'bold 74px Georgia, serif'; g.textAlign = 'center'; g.fillText('QUEEN', w / 2, 300); g.fillText('OF', w / 2, 390); g.fillText('DRAGS', w / 2, 480);
        for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${r()})`; g.fillRect(r() * w, r() * h, 2, 2); }
      }),
      neonText: () => cTex(1024, 256, (g, w, h) => {
        g.clearRect(0, 0, w, h); g.font = 'italic 700 120px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = '#ff3fb0'; g.shadowBlur = 40; g.fillStyle = '#ffd6ef'; g.fillText('One Love Bar', w / 2, h / 2); g.shadowBlur = 12; g.fillText('One Love Bar', w / 2, h / 2);
      })
    };
    TEX[name] = make[name]();
    return TEX[name];
  }
  function posterTex() {
    if (TEX.poster) return TEX.poster;
    const t = new T.TextureLoader().load('img/poster.jpg'); t.encoding = T.sRGBEncoding; t.anisotropy = aniso; TEX.poster = t; return t;
  }

  // ------------------------------------------------------------ Bausteine (glatt, mit Rundungen)
  const M = (o) => new T.MeshStandardMaterial(o), MP = (o) => new T.MeshPhysicalMaterial(o);
  function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; }
  function rbox(w, h, d, r, mat, x, y, z, parent) {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const s = new T.Shape(), a = w / 2 - r, b = h / 2 - r;
    s.moveTo(-a, -h / 2); s.lineTo(a, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -b); s.lineTo(w / 2, b); s.quadraticCurveTo(w / 2, h / 2, a, h / 2);
    s.lineTo(-a, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, b); s.lineTo(-w / 2, -b); s.quadraticCurveTo(-w / 2, -h / 2, -a, -h / 2);
    const g = new T.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: 6, curveSegments: 10 });
    g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
    return mesh(g, mat, x, y, z, parent);
  }
  function lathe(pts, mat, x, y, z, parent, seg = 64) { return mesh(new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg), mat, x, y, z, parent); }
  function glowSprite(color, size, x, y, z, parent, op = 0.9) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex('glow'), color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }));
    s.scale.set(size, size, 1); s.position.set(x, y, z); if (parent) parent.add(s); return s;
  }
  function bulb(color, x, y, z, parent, r = 0.035) { const m = mesh(new T.SphereGeometry(r, 24, 16), new T.MeshBasicMaterial({ color }), x, y, z, parent); m.castShadow = false; glowSprite(color, r * 9, x, y, z, parent, 0.55); return m; }
  function pLight(color, intens, dist, x, y, z, parent) { const l = new T.PointLight(color, intens, dist, 2); l.position.set(x, y, z); parent.add(l); return l; }
  function spot(color, intens, x, y, z, tx, ty, tz, parent, shadow, angle = 0.5) {
    const l = new T.SpotLight(color, intens, 30, angle, 0.45, 1.6); l.position.set(x, y, z); l.target.position.set(tx, ty, tz); parent.add(l); parent.add(l.target);
    if (shadow && quality !== 'spar') { l.castShadow = true; l.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.camera.near = 0.5; l.shadow.camera.far = 25; }
    return l;
  }
  function beamCone(color, x, y, z, tx, ty, tz, rad, parent) {
    const len = Math.hypot(tx - x, ty - y, tz - z), g = new T.CylinderGeometry(0.06, rad, len, 48, 1, true); g.translate(0, -len / 2, 0);
    const m = new T.Mesh(g, new T.MeshBasicMaterial({ color, map: tex('beam'), transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(tx, ty, tz); m.rotateX(-PI / 2); parent.add(m); return m;
  }
  function room(g, w, d, h, floorMat, wallMat, ceil = true) {
    const fl = mesh(new T.PlaneGeometry(w, d), floorMat, 0, 0, 0, g); fl.rotation.x = -PI / 2; fl.castShadow = false;
    const bk = mesh(new T.PlaneGeometry(w, h), wallMat, 0, h / 2, -d / 2, g); bk.castShadow = false;
    const lw = mesh(new T.PlaneGeometry(d, h), wallMat, -w / 2, h / 2, 0, g); lw.rotation.y = PI / 2; lw.castShadow = false;
    const rw = mesh(new T.PlaneGeometry(d, h), wallMat, w / 2, h / 2, 0, g); rw.rotation.y = -PI / 2; rw.castShadow = false;
    if (ceil) { const c = mesh(new T.PlaneGeometry(w, d), M({ color: 0x1c1a22, roughness: 0.9 }), 0, h, 0, g); c.rotation.x = PI / 2; }
    // Fußleisten
    const sk = M({ color: 0xe8e2d8, roughness: 0.5 });
    rbox(w, 0.1, 0.03, 0.01, sk, 0, 0.05, -d / 2 + 0.015, g); const l2 = rbox(d, 0.1, 0.03, 0.01, sk, -w / 2 + 0.015, 0.05, 0, g); l2.rotation.y = PI / 2; const r2 = rbox(d, 0.1, 0.03, 0.01, sk, w / 2 - 0.015, 0.05, 0, g); r2.rotation.y = PI / 2;
  }
  function windowNight(g, x, y, z, w, h, ry = 0) {
    const fr = new T.Group(); fr.position.set(x, y, z); fr.rotation.y = ry; g.add(fr);
    const sky = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex('sky') })); sky.position.z = -0.05; fr.add(sky);
    const fm = M({ color: 0xf2f0ea, roughness: 0.4 });
    rbox(w + 0.12, 0.07, 0.08, 0.02, fm, 0, h / 2, 0, fr); rbox(w + 0.12, 0.07, 0.14, 0.02, fm, 0, -h / 2, 0.03, fr);
    rbox(0.07, h, 0.08, 0.02, fm, -w / 2, 0, 0, fr); rbox(0.07, h, 0.08, 0.02, fm, w / 2, 0, 0, fr); rbox(0.04, h, 0.06, 0.015, fm, 0, 0, 0, fr);
    const glass = new T.Mesh(new T.PlaneGeometry(w, h), MP({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.12, clearcoat: 1 })); fr.add(glass);
    return fr;
  }
  function chair(g, x, z, ry, mat) {
    const c = new T.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    rbox(0.46, 0.05, 0.44, 0.02, mat, 0, 0.46, 0, c); rbox(0.44, 0.5, 0.04, 0.02, mat, 0, 0.74, -0.2, c);
    for (const [a, b] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) mesh(new T.CylinderGeometry(0.02, 0.018, 0.46, 20), mat, a, 0.23, b, c);
    return c;
  }
  function plate(g, x, y, z) {
    lathe([[0, 0], [0.11, 0], [0.12, 0.006], [0.13, 0.016], [0.128, 0.02], [0.11, 0.012], [0, 0.01]], MP({ color: 0xffffff, roughness: 0.15, clearcoat: 1 }), x, y, z, g);
    lathe([[0.001, 0], [0.03, 0], [0.032, 0.01], [0.036, 0.11], [0.033, 0.11], [0.028, 0.012], [0.001, 0.012]], MP({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 0.9, transparent: true, opacity: 0.45 }), x + 0.18, y, z - 0.08, g);
  }
  function plant(g, x, z) {
    lathe([[0, 0], [0.14, 0], [0.17, 0.32], [0.16, 0.33], [0, 0.3]], M({ color: 0xc8b8a6, roughness: 0.6 }), x, 0, z, g);
    const lm = M({ color: 0x2f6b3a, roughness: 0.55, side: T.DoubleSide });
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2, h = 0.5 + (i % 3) * 0.15; const l = mesh(new T.SphereGeometry(0.09, 20, 12), lm, x + Math.cos(a) * 0.1, 0.3 + h * 0.6, z + Math.sin(a) * 0.1, g); l.scale.set(0.5, 1.6, 0.18); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); }
  }
  function bottles(g, x, y, z, n, w) {
    const cols = [0x2f8f5a, 0x8a5a2a, 0x2a4f9a, 0xc23f6a, 0xdcdcdc, 0x6a2a9a];
    for (let i = 0; i < n; i++) {
      const c = cols[i % cols.length], h = 0.24 + (i % 3) * 0.05;
      lathe([[0.001, 0], [0.035, 0], [0.037, h * 0.62], [0.014, h * 0.82], [0.012, h], [0.001, h]], MP({ color: c, roughness: 0.05, metalness: 0, transmission: 0.6, transparent: true, opacity: 0.8, clearcoat: 1 }), x - w / 2 + (i + 0.5) * w / n, y, z, g, 32);
    }
  }
  function neonHeart(g, x, y, z, s, color) {
    const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120 * PI * 2; pts.push(new T.Vector3(16 * Math.sin(t) ** 3 * s / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s / 17, 0)); }
    const tube = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 200, s * 0.035, 16, true), new T.MeshBasicMaterial({ color }), x, y, z, g); tube.castShadow = false;
    glowSprite(color, s * 4, x, y, z + 0.05, g, 0.5); pLight(color, 1.6, 6, x, y, z + 0.4, g);
    return tube;
  }
  function stringLights(g, a, b, n, sag) {
    const cols = [0xfff1c4, 0xffd38a, 0xffb3e0];
    for (let i = 0; i <= n; i++) { const t = i / n; bulb(cols[i % 3], a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * sag, a[2] + (b[2] - a[2]) * t, g, 0.022); }
  }

  // ------------------------------------------------------------ Kulissen
  function fovFor(f) { const a = innerWidth / innerHeight; return a < 1 ? Math.min(78, f * (1 + (1 - a) * 0.9)) : f; }
  function camOf(pos, look, fov = 45) { return { pos: new T.Vector3(...pos), look: new T.Vector3(...look), fov }; }
  const BUILD = {
    dining() {
      const g = new T.Group();
      room(g, 7, 6, 2.8, M({ map: tex('planks'), roughness: 0.42, metalness: 0 }), M({ map: tex('wallpaper'), roughness: 0.85 }));
      windowNight(g, -1.4, 1.55, -2.97, 1.3, 1.2);
      const clk = mesh(new T.CircleGeometry(0.22, 64), M({ map: tex('clock'), roughness: 0.3 }), 1.1, 2.0, -2.98, g); clk.castShadow = false;
      mesh(new T.TorusGeometry(0.225, 0.018, 16, 64), M({ color: 0x2b2b2b, metalness: 0.8, roughness: 0.3 }), 1.1, 2.0, -2.97, g);
      const wood = M({ color: 0x6a3f22, roughness: 0.35, map: tex('planks') });
      rbox(2.2, 0.06, 1.1, 0.025, wood, 0, 0.76, 0, g);
      for (const [a, b] of [[-1, -0.45], [1, -0.45], [-1, 0.45], [1, 0.45]]) mesh(new T.CylinderGeometry(0.035, 0.03, 0.73, 24), wood, a, 0.365, b, g);
      const cloth = mesh(new T.PlaneGeometry(0.5, 1.12), M({ color: 0xd8d2c4, map: tex('fabric'), roughness: 0.9 }), 0, 0.795, 0, g); cloth.rotation.x = -PI / 2;
      plate(g, -0.7, 0.79, 0.25); plate(g, 0.7, 0.79, 0.25); plate(g, 0, 0.79, -0.3);
      lathe([[0.001, 0], [0.09, 0], [0.12, 0.08], [0.13, 0.1], [0.001, 0.1]], M({ color: 0x9c6b3c, roughness: 0.7 }), 0, 0.79, 0.1, g);
      chair(g, -0.7, 0.75, PI, wood); chair(g, 0.7, 0.75, PI, wood); chair(g, 0, -0.85, 0, wood);
      // Pendelleuchte
      mesh(new T.CylinderGeometry(0.004, 0.004, 1.0, 8), M({ color: 0x111111 }), 0, 2.3, 0, g);
      lathe([[0.02, 0.22], [0.08, 0.2], [0.26, 0.02], [0.27, 0], [0.255, 0.0], [0.07, 0.19], [0.02, 0.21]], M({ color: 0x2f4a3a, roughness: 0.35, metalness: 0.4, side: T.DoubleSide }), 0, 1.58, 0, g);
      bulb(0xffe2a8, 0, 1.62, 0, g, 0.05);
      const lamp = pLight(0xffd59a, 2.2, 7, 0, 1.55, 0, g);
      spot(0xffe0b0, 2.4, 0, 2.6, 0.2, 0, 0.7, 0, g, true, 0.9);
      // Fernseher auf der Anrichte
      rbox(1.6, 0.6, 0.45, 0.03, M({ color: 0x3b2a20, roughness: 0.45 }), 2.3, 0.3, -2.6, g);
      rbox(1.15, 0.68, 0.05, 0.02, M({ color: 0x0b0b0e, roughness: 0.25, metalness: 0.4 }), 2.3, 1.0, -2.62, g);
      const scr = new T.Mesh(new T.PlaneGeometry(1.08, 0.6), new T.MeshBasicMaterial({ map: tex('screenTV') })); scr.position.set(2.3, 1.0, -2.59); g.add(scr);
      pLight(0xb050ff, 1.4, 4, 2.3, 1.0, -2.2, g);
      plant(g, -3.0, -2.5);
      return { g, cam: camOf([2.6, 1.75, 3.0], [0, 0.95, -0.3]), spots: { vater: [0, -0.9, 0, 'sit'], mutter: [-0.7, 0.9, PI, 'sit'], leon: [0.7, 0.9, PI, 'sit'] }, amb: [0x8890b0, 0x2a2018, 0.45], tick: t => { lamp.intensity = 2.2 + Math.sin(t * 7) * 0.02; scr.material.color.setHSL(0, 0, 0.85 + Math.sin(t * 3) * 0.15); } };
    },
    bedroom(v) {
      const g = new T.Group(), warm = v === 'samira';
      room(g, 5.5, 5, 2.6, M({ map: tex('planks'), roughness: 0.5 }), M({ map: warm ? tex('warmwall') : tex('wallpaper'), roughness: 0.9, color: warm ? 0xffffff : 0x9aa6c8 }));
      windowNight(g, 1.3, 1.5, -2.47, 1.1, 1.0);
      // Bett
      const frame = M({ color: warm ? 0xe8dcc8 : 0x2b2f3a, roughness: 0.5 });
      rbox(2.05, 0.3, 1.45, 0.04, frame, -1.0, 0.2, -1.4, g);
      rbox(1.95, 0.22, 1.35, 0.09, M({ color: 0xf2f0f5, roughness: 0.85, map: tex('fabric') }), -1.0, 0.45, -1.4, g);
      rbox(1.35, 0.08, 1.38, 0.04, M({ color: warm ? 0xd65b3b : 0x3a4f9a, roughness: 0.9, map: tex('fabric') }), -0.7, 0.58, -1.4, g);
      rbox(1.5, 0.9, 0.08, 0.04, frame, -1.0, 0.65, -2.15, g);
      for (const z of [-1.75, -1.05]) { const p = mesh(new T.SphereGeometry(0.3, 40, 24), M({ color: warm ? 0xf2c14e : 0xe8e8f2, roughness: 0.9 }), -1.75, 0.66, z, g); p.scale.set(0.55, 0.32, 0.9); }
      // Laptop auf dem Bett
      const lap = new T.Group(); lap.position.set(-0.6, 0.63, -1.1); lap.rotation.y = 0.5; g.add(lap);
      rbox(0.34, 0.015, 0.24, 0.006, M({ color: 0xb8bcc8, metalness: 0.9, roughness: 0.25 }), 0, 0, 0, lap);
      const lid = new T.Group(); lid.position.set(0, 0.008, -0.12); lid.rotation.x = -0.3; lap.add(lid);
      rbox(0.34, 0.23, 0.01, 0.005, M({ color: 0xb8bcc8, metalness: 0.9, roughness: 0.25 }), 0, 0.115, 0, lid);
      const sc = new T.Mesh(new T.PlaneGeometry(0.31, 0.2), new T.MeshBasicMaterial({ map: tex('screenTV') })); sc.position.set(0, 0.115, 0.006); lid.add(sc);
      const lapL = pLight(0x9a6bff, 1.6, 2.5, -0.6, 0.85, -0.9, g);
      // Schreibtisch, Poster, Lichterkette
      rbox(1.3, 0.05, 0.6, 0.02, M({ color: 0xe9e4da, roughness: 0.4 }), 1.6, 0.75, -2.1, g);
      for (const x of [1.0, 2.2]) rbox(0.04, 0.75, 0.55, 0.01, M({ color: 0xe9e4da, roughness: 0.4 }), x, 0.375, -2.1, g);
      const post = mesh(new T.PlaneGeometry(0.6, 0.9), M({ map: warm ? posterTex() : tex('poster2'), roughness: 0.6 }), -0.2, 1.65, -2.48, g); post.castShadow = false;
      stringLights(g, [-2.7, 2.35, -2.45], [0.4, 2.35, -2.45], 22, 0.25);
      pLight(0xffd8a0, 0.9, 5, -1.2, 2.1, -2.0, g);
      spot(warm ? 0xffd2a0 : 0x9fb0ff, warm ? 2.4 : 1.4, 1.5, 2.5, 1.2, -0.8, 0.5, -1.2, g, true, 0.8);
      if (warm) { const lampG = new T.Group(); lampG.position.set(1.9, 0.78, -2.1); g.add(lampG); lathe([[0.001, 0], [0.08, 0], [0.02, 0.02], [0.012, 0.35], [0.001, 0.35]], M({ color: 0xc9a25a, metalness: 0.8, roughness: 0.3 }), 0, 0, 0, lampG); lathe([[0.06, 0.48], [0.14, 0.32], [0.13, 0.31], [0.055, 0.47]], M({ color: 0xfff1d6, roughness: 0.8, side: T.DoubleSide, emissive: 0x6b4a20 }), 0, 0, 0, lampG); pLight(0xffc880, 1.4, 4, 1.9, 1.15, -2.0, g); }
      plant(g, 2.4, -0.8);
      const spots = warm ? { leon: [-0.45, -0.95, 0.35, 'sit'], samira: [-1.25, -0.95, -0.2, 'sit'] } : { leon: [-0.95, -0.95, 0.2, 'sit'] };
      return { g, cam: camOf([1.6, 1.4, 2.3], [-0.8, 0.85, -1.1]), spots, amb: warm ? [0xffd0b0, 0x302018, 0.5] : [0x5060a0, 0x101020, 0.35], tick: t => { lapL.intensity = 1.5 + Math.sin(t * 5) * 0.25 + Math.sin(t * 13) * 0.1; } };
    },
    street(v) {
      const g = new T.Group(), club = v === 'door';
      const ground = mesh(new T.PlaneGeometry(14, 24), M({ map: tex('cobble'), roughnessMap: tex('puddle'), roughness: 0.55, metalness: 0.35 }), 0, 0, -4, g); ground.rotation.x = -PI / 2; ground.castShadow = false;
      const sky = new T.Mesh(new T.PlaneGeometry(40, 15), new T.MeshBasicMaterial({ map: tex('sky') })); sky.position.set(0, 6, -16); g.add(sky);
      const brick = M({ map: tex('brick'), normalMap: tex('brickN'), roughness: 0.85 });
      const wall = mesh(new T.BoxGeometry(14, 7, 0.4), brick, 0, 3.5, -3.2, g); wall.castShadow = false; if (!club) wall.position.set(-4.2, 3.5, -4), wall.scale.x = 0.45;
      if (!club) { const w2 = mesh(new T.BoxGeometry(6.3, 7, 0.4), brick, 4.8, 3.5, -5, g); w2.castShadow = false; }
      // Tür mit buntem Licht
      const dx = club ? 0.4 : -2.2, dz = club ? -2.98 : -3.78;
      rbox(1.3, 2.4, 0.12, 0.03, M({ color: 0x14101a, roughness: 0.3, metalness: 0.4 }), dx, 1.2, dz, g);
      const door = mesh(new T.PlaneGeometry(1.0, 2.15), new T.MeshBasicMaterial({ color: 0xffffff, map: tex('screenTV') }), dx + 0.28, 1.1, dz + 0.08, g); door.castShadow = false; door.rotation.y = -0.6;
      spot(0xff4fd0, 9, dx, 2.2, dz + 0.3, dx + 0.8, 0, dz + 3.5, g, true, 0.75); spot(0x4f8bff, 6, dx + 0.3, 2.2, dz + 0.3, dx - 0.6, 0, dz + 3.2, g, false, 0.6);
      glowSprite(0xff7ad8, 3, dx, 1.2, dz + 0.3, g, 0.35);
      if (club) {
        neonHeart(g, dx, 2.95, dz + 0.25, 0.42, 0xff3fa8);
        const sign = mesh(new T.PlaneGeometry(2.4, 0.6), new T.MeshBasicMaterial({ map: tex('neonText'), transparent: true, depthWrite: false }), -1.9, 2.6, dz + 0.22, g); sign.castShadow = false;
        pLight(0xff5fc0, 1.8, 6, -1.9, 2.6, dz + 0.8, g);
        const post = mesh(new T.PlaneGeometry(1.0, 1.5), M({ map: posterTex(), roughness: 0.35 }), 2.3, 1.5, dz + 0.22, g); post.castShadow = false;
        rbox(1.1, 1.6, 0.06, 0.02, M({ color: 0xd9d9e8, metalness: 0.9, roughness: 0.2 }), 2.3, 1.5, dz + 0.19, g);
      }
      // Laternen
      for (const lx of club ? [-3.6, 3.8] : [1.6, -5]) {
        const lz = club ? -2.4 : -1.5; lathe([[0.001, 0], [0.08, 0], [0.06, 0.15], [0.04, 3.2], [0.001, 3.2]], M({ color: 0x1c2024, metalness: 0.8, roughness: 0.35 }), lx, 0, lz, g, 32);
        lathe([[0.001, 3.2], [0.16, 3.25], [0.2, 3.5], [0.03, 3.62], [0.001, 3.62]], M({ color: 0x1c2024, metalness: 0.8, roughness: 0.35 }), lx, 0, lz, g, 32);
        bulb(0xffd28a, lx, 3.3, lz, g, 0.07); spot(0xffd28a, 5, lx, 3.3, lz, lx, 0, lz + 0.3, g, false, 0.9);
      }
      // Regen
      const N = coarse ? 900 : 2200, pos = new Float32Array(N * 6), vel = new Float32Array(N);
      for (let i = 0; i < N; i++) { const x = (Math.random() - 0.5) * 12, y = Math.random() * 7, z = -6 + Math.random() * 10; pos.set([x, y, z, x - 0.02, y - 0.22, z], i * 6); vel[i] = 7 + Math.random() * 3; }
      const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.BufferAttribute(pos, 3));
      const rain = new T.LineSegments(rg, new T.LineBasicMaterial({ color: 0xaab8ff, transparent: true, opacity: 0.35, depthWrite: false })); rain.frustumCulled = false; g.add(rain);
      const spots = club ? { leon: [-0.9, 0.2, 0.25, 'idle'], velvet: [0.55, -2.55, -0.35, 'idle'] } : { mert: [-1.6, -2.6, -0.7, 'walk'], leon: [0.4, 0.4, -0.4, 'idle'], tobi: [-0.6, -0.4, 0.4, 'idle'] };
      return { g, cam: club ? camOf([0.8, 1.6, 4.6], [-0.2, 1.4, -1.5]) : camOf([1.2, 1.6, 4.4], [-1.0, 1.3, -1.8]), spots, amb: [0x4058a0, 0x100818, 0.4],
        tick: (t, dt) => { const p = rg.attributes.position.array; for (let i = 0; i < N; i++) { const o = i * 6, d = vel[i] * dt; p[o + 1] -= d; p[o + 4] -= d; if (p[o + 4] < 0) { p[o + 1] += 7; p[o + 4] += 7; } } rg.attributes.position.needsUpdate = true; } };
    },
    mirror() {
      const g = new T.Group();
      room(g, 5, 4.5, 2.7, M({ color: 0x2a1a2a, roughness: 0.25, metalness: 0.1 }), M({ color: 0x3a2440, roughness: 0.8, map: tex('fabric') }));
      // Schminktisch und Spiegel mit Glühbirnen
      rbox(1.8, 0.06, 0.55, 0.02, M({ color: 0xf0ece4, roughness: 0.3 }), 0, 0.78, -1.95, g);
      for (const x of [-0.8, 0.8]) rbox(0.05, 0.78, 0.5, 0.015, M({ color: 0xf0ece4, roughness: 0.3 }), x, 0.39, -1.95, g);
      const mir = mesh(new T.PlaneGeometry(1.4, 1.0), M({ color: 0xffffff, metalness: 1, roughness: 0.04 }), 0, 1.55, -2.22, g); mir.castShadow = false;
      rbox(1.6, 1.2, 0.05, 0.02, M({ color: 0xd8b26a, metalness: 0.9, roughness: 0.25 }), 0, 1.55, -2.24, g);
      for (let i = 0; i < 6; i++) { bulb(0xfff2d0, -0.72 + i * 0.288, 2.12, -2.18, g, 0.04); bulb(0xfff2d0, -0.72 + i * 0.288, 0.98, -2.18, g, 0.04); }
      for (let i = 1; i < 4; i++) { bulb(0xfff2d0, -0.75, 0.98 + i * 0.285, -2.18, g, 0.04); bulb(0xfff2d0, 0.75, 0.98 + i * 0.285, -2.18, g, 0.04); }
      pLight(0xfff0d0, 2.4, 5, 0, 1.6, -1.6, g);
      // Perückenköpfe
      const head = M({ color: 0xf2efe8, roughness: 0.6 }), wigC = [0xf2b6c8, 0xd6267e, 0x2a3f9e];
      for (let i = 0; i < 3; i++) { const x = -0.6 + i * 0.6; lathe([[0.001, 0], [0.06, 0], [0.04, 0.12], [0.05, 0.14], [0.001, 0.14]], head, x, 0.81, -2.0, g, 32); const hd = mesh(new T.SphereGeometry(0.09, 40, 28), head, x, 1.03, -2.0, g); hd.scale.set(0.85, 1.1, 0.95); const w = mesh(new T.SphereGeometry(0.13, 48, 32), M({ color: wigC[i], roughness: 0.6, map: tex('fabric') }), x, 1.07, -2.03, g); w.scale.set(1, 1.15, 1); }
      // Kleiderstange
      const chrome = M({ color: 0xdddde8, metalness: 1, roughness: 0.15 });
      mesh(new T.CylinderGeometry(0.015, 0.015, 1.8, 24), chrome, 1.9, 1.75, -0.6, g).rotation.x = PI / 2;
      for (const z of [-1.5, 0.3]) mesh(new T.CylinderGeometry(0.015, 0.015, 1.75, 24), chrome, 1.9, 0.875, z, g);
      const dc = [0xff2f9a, 0xd9dce8, 0x7b3dff, 0xf2c14e, 0x2e6bff];
      dc.forEach((c, i) => lathe([[0.001, 1.65], [0.12, 1.62], [0.13, 1.35], [0.11, 1.2], [0.28, 0.3], [0.001, 0.32]], MP({ color: c, metalness: 0.5, roughness: 0.3, roughnessMap: tex('glitter'), clearcoat: 1, normalMap: tex('glitterN') }), 1.9, 0, -1.3 + i * 0.35, g, 48));
      spot(0xffe6f2, 3.2, 0.6, 2.6, 1.6, 0, 0.9, -0.6, g, true, 0.75);
      spot(0xb07aff, 3, -2, 2.4, 0.4, 0, 1, -0.6, g, false, 0.6);
      return { g, cam: camOf([0.25, 1.45, 2.3], [0, 1.05, -0.6]), spots: { leon: [0, -0.6, 0, 'idle'], luma: [0, -0.6, 0, 'idle'] }, amb: [0xd0a0e0, 0x201018, 0.45], studioCam: camOf([0, 1.25, 1.9], [0, 0.95, -0.6], 38) };
    },
    cafe() {
      const g = new T.Group();
      room(g, 7, 5.5, 3, M({ map: tex('planks'), roughness: 0.45, color: 0xd8c0a0 }), M({ map: tex('warmwall'), roughness: 0.9, color: 0xffe6d0 }));
      windowNight(g, 3.47, 1.6, -0.5, 2.2, 1.6, -PI / 2);
      const counter = M({ color: 0x3a2b24, roughness: 0.45, map: tex('planks') });
      rbox(3.2, 1.0, 0.7, 0.03, counter, -0.4, 0.5, -1.4, g); rbox(3.3, 0.05, 0.8, 0.02, M({ color: 0xe8e4dc, roughness: 0.15, metalness: 0.1 }), -0.4, 1.02, -1.4, g);
      // Kuchenvitrine aus Glas
      const glass = MP({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 0.95, transparent: true, opacity: 0.25, clearcoat: 1 });
      rbox(1.0, 0.42, 0.55, 0.03, glass, 0.6, 1.25, -1.4, g).castShadow = false;
      [[0.35, 0xf3c6d6], [0.65, 0x6b3a24], [0.9, 0xfff0c0]].forEach(([x, c]) => { lathe([[0.001, 0], [0.11, 0], [0.11, 0.09], [0.1, 0.1], [0.001, 0.1]], M({ color: c, roughness: 0.6 }), x, 1.06, -1.4, g); bulb(0xff3355, x, 1.18, -1.4, g, 0.012); });
      // Kaffeemaschine
      rbox(0.55, 0.45, 0.4, 0.04, M({ color: 0xd8d8e0, metalness: 1, roughness: 0.18 }), -1.4, 1.27, -1.55, g);
      rbox(0.5, 0.06, 0.35, 0.02, M({ color: 0x8a1f2a, roughness: 0.3, metalness: 0.4 }), -1.4, 1.53, -1.55, g);
      for (const x of [-1.52, -1.28]) mesh(new T.CylinderGeometry(0.03, 0.03, 0.1, 24), M({ color: 0x222222, metalness: 0.8, roughness: 0.3 }), x, 1.12, -1.35, g);
      // Hängelampen
      for (const x of [-1.4, -0.2, 1.0]) { mesh(new T.CylinderGeometry(0.004, 0.004, 1, 8), M({ color: 0x111111 }), x, 2.5, -1.4, g); lathe([[0.001, 0.25], [0.04, 0.24], [0.15, 0.03], [0.16, 0], [0.15, 0], [0.035, 0.23]], M({ color: 0xd8a64a, metalness: 0.9, roughness: 0.25, side: T.DoubleSide }), x, 1.75, -1.4, g); bulb(0xffe0a0, x, 1.77, -1.4, g, 0.035); pLight(0xffcf88, 0.9, 4, x, 1.7, -1.3, g); }
      // Türglocke
      lathe([[0.001, 0.08], [0.02, 0.075], [0.035, 0.02], [0.04, 0], [0.001, 0.005]], M({ color: 0xd8b26a, metalness: 1, roughness: 0.2 }), 2.6, 2.4, 1.8, g, 32);
      for (const [x, z] of [[1.6, 0.6], [-1.8, 0.8]]) { lathe([[0.001, 0.74], [0.4, 0.74], [0.4, 0.77], [0.001, 0.77]], M({ color: 0xf5f2ec, roughness: 0.3 }), x, 0, z, g); mesh(new T.CylinderGeometry(0.03, 0.03, 0.74, 20), M({ color: 0x222222, metalness: 0.8 }), x, 0.37, z, g); }
      spot(0xffffff, 1.6, 3.2, 2.5, -0.5, 0, 0.8, -0.6, g, true, 0.8);
      return { g, cam: camOf([2.2, 1.65, 3.2], [-0.2, 1.15, -0.6]), spots: { leon: [-0.2, -2.1, 0, 'idle'], mia: [-1.1, -2.05, 0.2, 'idle'], julian: [0.5, 0.0, PI + 0.3, 'idle'] }, amb: [0xffe0c0, 0x302018, 0.55] };
    },
    bar() {
      const g = new T.Group();
      room(g, 9, 7, 3.4, M({ map: tex('planks'), roughness: 0.35, color: 0x8a6a5a }), M({ map: tex('brick'), normalMap: tex('brickN'), roughness: 0.85 }));
      const counter = M({ color: 0x24121e, roughness: 0.3, metalness: 0.2 });
      rbox(4, 1.1, 0.7, 0.04, counter, -1.2, 0.55, -2.4, g); rbox(4.1, 0.06, 0.8, 0.02, M({ color: 0xd8b26a, metalness: 0.9, roughness: 0.2 }), -1.2, 1.12, -2.4, g);
      for (let s = 0; s < 3; s++) { rbox(3.6, 0.04, 0.3, 0.01, M({ color: 0x3a2b24, roughness: 0.4 }), -1.2, 1.5 + s * 0.45, -3.3, g); bottles(g, -1.2, 1.52 + s * 0.45, -3.3, 14, 3.4); }
      for (let i = 0; i < 4; i++) { const x = -2.7 + i * 1; lathe([[0.001, 0], [0.2, 0], [0.04, 0.05], [0.03, 0.72], [0.18, 0.74], [0.18, 0.8], [0.001, 0.8]], M({ color: 0xd8d8e0, metalness: 1, roughness: 0.2 }), x, 0, -1.7, g, 32); }
      neonHeart(g, 2.6, 2.6, -3.42, 0.5, 0xff3fa8);
      // Umbau: Leiter und Farbeimer
      const lad = M({ color: 0xb8bcc8, metalness: 0.9, roughness: 0.3 });
      for (const x of [2.0, 2.45]) { const r = mesh(new T.CylinderGeometry(0.02, 0.02, 2.2, 16), lad, x, 1.05, -1.2, g); r.rotation.x = 0.18; }
      for (let i = 0; i < 6; i++) { const r = mesh(new T.CylinderGeometry(0.015, 0.015, 0.45, 16), lad, 2.225, 0.25 + i * 0.33, -1.2 - Math.sin(0.18) * (0.25 + i * 0.33) + 0.2, g); r.rotation.z = PI / 2; }
      [[2.9, -0.6, 0xff2f9a], [3.2, -0.3, 0x2e6bff]].forEach(([x, z, c]) => { lathe([[0.001, 0], [0.13, 0], [0.15, 0.25], [0.001, 0.25]], M({ color: 0xe8e8ee, metalness: 0.6, roughness: 0.3 }), x, 0, z, g, 48); const p = mesh(new T.CircleGeometry(0.145, 48), M({ color: c, roughness: 0.2 }), x, 0.251, z, g); p.rotation.x = -PI / 2; });
      const post = mesh(new T.PlaneGeometry(1.2, 1.8), M({ map: posterTex(), roughness: 0.35 }), -3.6, 1.9, -3.42, g); post.castShadow = false;
      spot(0xfff0e0, 3.5, 0, 3.2, 1.0, 0, 0.5, -1.0, g, true, 0.8);
      const shaft = beamCone(0xffe8c0, -2.5, 3.3, -1, -1.5, 0, 0.8, 1.2, g); shaft.material.opacity = 0.09;
      pLight(0xff7ad8, 1.2, 7, 0, 2.5, -2, g);
      return { g, cam: camOf([2.6, 1.75, 4.0], [-0.4, 1.25, -1.2]), spots: { leon: [0.2, 0.2, 0.2, 'idle'], velvet: [-0.9, -0.6, 0.5, 'idle'], nadine: [1.0, -0.4, -0.5, 'idle'] }, amb: [0xc0a0d0, 0x201018, 0.5] };
    },
    stage() {
      const g = new T.Group();
      const floor = mesh(new T.PlaneGeometry(22, 22), M({ color: 0x0b0a12, roughness: 0.18, metalness: 0.4 }), 0, 0, 0, g); floor.rotation.x = -PI / 2; floor.castShadow = false;
      const back = mesh(new T.PlaneGeometry(22, 10), M({ map: tex('brick'), normalMap: tex('brickN'), color: 0x5a4a6a, roughness: 0.9 }), 0, 5, -10, g); back.castShadow = false;
      // Bühne
      rbox(8, 0.6, 4, 0.05, M({ color: 0x16111e, roughness: 0.25, metalness: 0.3 }), 0, 0.3, -7.5, g);
      rbox(8.1, 0.06, 0.12, 0.02, M({ color: 0xd8b26a, metalness: 1, roughness: 0.2 }), 0, 0.6, -5.5, g);
      for (let i = 0; i < 24; i++) bulb(i % 2 ? 0xff7ad8 : 0x9ab8ff, -3.9 + i * 0.339, 0.5, -5.43, g, 0.025);
      // Vorhang aus Samt (gefaltet)
      const cg = new T.PlaneGeometry(3.4, 5.2, 120, 1), cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 9) * 0.09); cg.computeVertexNormals();
      const velvet = MP({ color: 0x7a0f3a, roughness: 0.65, sheen: new T.Color(0xff6fb0), map: tex('fabric') });
      for (const s of [-1, 1]) { const c = mesh(cg, velvet, s * 3.6, 3.2, -9.0, g); c.castShadow = false; }
      const top = new T.PlaneGeometry(10, 1.0, 160, 1), tp = top.attributes.position; for (let i = 0; i < tp.count; i++) tp.setZ(i, Math.sin(tp.getX(i) * 7) * 0.07); top.computeVertexNormals();
      mesh(top, velvet, 0, 5.4, -8.6, g).castShadow = false;
      // Buchcover als großes Plakat mit Glühbirnenrahmen
      const pw = 2.4, ph = pw * 1536 / 1011;
      const pst = mesh(new T.PlaneGeometry(pw, ph), new T.MeshBasicMaterial({ map: posterTex() }), 0, 3.0, -9.3, g); pst.castShadow = false;
      rbox(pw + 0.2, ph + 0.2, 0.08, 0.03, M({ color: 0xd8b26a, metalness: 1, roughness: 0.22 }), 0, 3.0, -9.38, g);
      for (let i = 0; i <= 8; i++) { bulb(0xfff2d0, -pw / 2 - 0.05 + i * (pw + 0.1) / 8, 3.0 + ph / 2 + 0.06, -9.28, g, 0.03); bulb(0xfff2d0, -pw / 2 - 0.05 + i * (pw + 0.1) / 8, 3.0 - ph / 2 - 0.06, -9.28, g, 0.03); }
      // Traverse mit Scheinwerfern und Lichtkegeln
      const truss = M({ color: 0x9a9aa8, metalness: 1, roughness: 0.3 });
      for (const y of [6.0, 6.3]) for (const z of [-6.2, -5.9]) { const b = mesh(new T.CylinderGeometry(0.025, 0.025, 10, 16), truss, 0, y, z, g); b.rotation.z = PI / 2; }
      const cols = [0x3d7bff, 0xa05cff, 0xff3fb0, 0xffc86b, 0x3d7bff, 0xff3fb0], cones = [], movers = [];
      cols.forEach((c, i) => {
        const x = -3.75 + i * 1.5, hd = new T.Group(); hd.position.set(x, 5.85, -6.05); g.add(hd);
        lathe([[0.001, 0], [0.11, 0], [0.14, 0.32], [0.12, 0.34], [0.001, 0.34]], M({ color: 0x15151a, metalness: 0.7, roughness: 0.35 }), 0, -0.34, 0, hd, 40);
        bulb(c, x, 5.5, -6.05, g, 0.06);
        const tz = -7.5, tx = x * 0.4;
        cones.push(beamCone(c, x, 5.5, -6.05, tx, 0.6, tz, 0.9, g));
        movers.push(spot(c, 3.5, x, 5.5, -6.05, tx, 0.6, tz, g, i === 2, 0.35));
      });
      // Discokugel
      const ball = mesh(new T.IcosahedronGeometry(0.35, 4), M({ color: 0xffffff, metalness: 1, roughness: 0.08, flatShading: true }), 0, 4.8, -4.5, g);
      const key = spot(0xfff0f6, 4.5, 0, 5.5, -2, 0, 0.6, -7.4, g, true, 0.38);
      pLight(0xff4fc0, 1.5, 12, -4, 2, -6, g); pLight(0x3d7bff, 1.5, 12, 4, 2, -6, g);
      // Konfetti
      const NC = coarse ? 300 : 700, cpos = new Float32Array(NC * 3), ccol = new Float32Array(NC * 3), cvel = new Float32Array(NC * 3);
      const pal = [new T.Color(0xff3fb0), new T.Color(0x3d7bff), new T.Color(0xffd36b), new T.Color(0xffffff), new T.Color(0xa05cff)];
      for (let i = 0; i < NC; i++) { cpos[i * 3 + 1] = -50; const c = pal[i % pal.length]; ccol.set([c.r, c.g, c.b], i * 3); }
      const cgeo = new T.BufferGeometry(); cgeo.setAttribute('position', new T.BufferAttribute(cpos, 3)); cgeo.setAttribute('color', new T.BufferAttribute(ccol, 3));
      const conf = new T.Points(cgeo, new T.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })); conf.frustumCulled = false; g.add(conf);
      let ci = 0;
      const S = {
        g, cam: camOf([0, 1.9, 1.2], [0, 1.6, -7.4], 42), spots: { luma: [0, -7.4, 0, 'idle'], leon: [0, -7.4, 0, 'idle'], velvet: [-1.8, -7.0, 0.5, 'idle'], julian: [1.1, -7.0, -0.5, 'idle'], vater: [3.8, -5.0, -1.0, 'idle'],
          samira: [-3.3, -3.0, PI + 0.35, 'dance'], mert: [-2.6, -1.9, PI + 0.25, 'dance'], mia: [2.8, -2.4, PI - 0.3, 'dance'] },
        amb: [0x6070c0, 0x200a20, 0.35], showCam: camOf([0, 3.0, 6.2], [0, 0.8, -4.5], 48),
        confetti(n, x = 0, z = -6.5) { for (let k = 0; k < n; k++) { const i = ci++ % NC; cpos.set([x + (Math.random() - 0.5) * 4, 5.5 + Math.random() * 1.5, z + (Math.random() - 0.5) * 3], i * 3); cvel.set([(Math.random() - 0.5) * 1.2, -0.8 - Math.random() * 1.2, (Math.random() - 0.5) * 1.2], i * 3); } },
        tick: (t, dt) => {
          ball.rotation.y += dt * 0.4;
          movers.forEach((l, i) => { const a = t * (0.5 + i * 0.07) + i; l.target.position.set(Math.sin(a) * 2.2, 0.6, -7.4 + Math.cos(a * 1.3) * 1.2); cones[i].lookAt(l.target.position); cones[i].rotateX(-PI / 2); });
          for (let i = 0; i < NC; i++) { const o = i * 3; if (cpos[o + 1] < -10) continue; cpos[o] += cvel[o] * dt + Math.sin(t * 3 + i) * dt * 0.3; cpos[o + 1] += cvel[o + 1] * dt; cpos[o + 2] += cvel[o + 2] * dt; if (cpos[o + 1] < 0.01) { cpos[o + 1] = 0.01; cvel[o] = cvel[o + 1] = cvel[o + 2] = 0; } }
          cgeo.attributes.position.needsUpdate = true;
          key.intensity = 4 + light / 25;
        }
      };
      return S;
    }
  };
  BUILD.samira = () => BUILD.bedroom('samira');
  BUILD.door = () => BUILD.street('door');

  function getSet(name) {
    if (sets[name]) return sets[name];
    const s = BUILD[name](); s.g.visible = false; scene.add(s.g); sets[name] = s; return s;
  }


  // ------------------------------------------------------------ Echte Kleidung: geglättete Stoffschicht über dem Grundkörper
  // Dreiecke werden nach ihrem Hauptknochen ausgewählt, verschweißt, geglättet (Muskeln verschwinden) und nach außen versetzt.
  const GARMENT = {
    long: ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r'],
    tee: ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r'],
    bodice: ['spine_01', 'spine_02', 'spine_03'],
    pants: ['pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r'],
    shorts: ['pelvis', 'thigh_l', 'thigh_r'],
    shoes: ['foot_l', 'foot_r', 'ball_l', 'ball_r'],
    gloves: ['lowerarm_l', 'lowerarm_r', 'hand_l', 'hand_r', 'index_01_l', 'index_02_l', 'index_03_l', 'middle_01_l', 'middle_02_l', 'middle_03_l', 'ring_01_l', 'ring_02_l', 'ring_03_l', 'pinky_01_l', 'pinky_02_l', 'pinky_03_l', 'thumb_01_l', 'thumb_02_l', 'thumb_03_l', 'index_01_r', 'index_02_r', 'index_03_r', 'middle_01_r', 'middle_02_r', 'middle_03_r', 'ring_01_r', 'ring_02_r', 'ring_03_r', 'pinky_01_r', 'pinky_02_r', 'pinky_03_r', 'thumb_01_r', 'thumb_02_r', 'thumb_03_r']
  };
  const clothCache = {};
  function bodyMesh(f) { let b = null; f.scene.traverse(o => { if (o.isSkinnedMesh && o.material && o.material.userData && o.material.userData.u) b = o; }); return b; }
  function garmentGeo(body, bodyKey, kind, offM, smooth) {
    const ck = bodyKey + '|' + kind + '|' + offM + '|' + smooth; if (clothCache[ck]) return clothCache[ck];
    const G = body.geometry, pos = G.attributes.position, nor = G.attributes.normal, si = G.attributes.skinIndex, sw = G.attributes.skinWeight, idx = G.index.array;
    const names = body.skeleton.bones.map(b => b.name), want = new Set(GARMENT[kind]);
    body.skeleton.bones[0].updateMatrixWorld(true);
    const Dm = new T.Matrix4().multiplyMatrices(body.skeleton.bones[0].matrixWorld, body.skeleton.boneInverses[0]).multiply(body.bindMatrix);
    const unit = Dm.getMaxScaleOnAxis() || 1, off = offM / unit, n = pos.count;
    const dom = new Int16Array(n);
    for (let i = 0; i < n; i++) { let bw = -1, bi = 0; for (let k = 0; k < 4; k++) { const w = sw.getComponent ? sw.getComponent(i, k) : [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)][k]; if (w > bw) { bw = w; bi = si.getComponent ? si.getComponent(i, k) : [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)][k]; } } dom[i] = bi; }
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) { let c = 0; for (let k = 0; k < 3; k++) if (want.has(names[dom[idx[t + k]]])) c++; if (c >= 2) keep.push(idx[t], idx[t + 1], idx[t + 2]); }
    // verschweißen (Nähte der UV-Karte) und Nachbarn sammeln
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), weld = new Int32Array(n), map = new Map();
    const dq = a => !a.normalized ? 1 : ({ Int8Array: 1 / 127, Uint8Array: 1 / 255, Int16Array: 1 / 32767, Uint16Array: 1 / 65535 })[a.array.constructor.name] || 1, kp = dq(pos), kn = dq(nor);
    for (let i = 0; i < n; i++) { P[i * 3] = pos.getX(i) * kp; P[i * 3 + 1] = pos.getY(i) * kp; P[i * 3 + 2] = pos.getZ(i) * kp; N[i * 3] = nor.getX(i) * kn; N[i * 3 + 1] = nor.getY(i) * kn; N[i * 3 + 2] = nor.getZ(i) * kn;
      const key = Math.round(P[i * 3] / unit * 2000) + ',' + Math.round(P[i * 3 + 1] / unit * 2000) + ',' + Math.round(P[i * 3 + 2] / unit * 2000); if (!map.has(key)) map.set(key, map.size); weld[i] = map.get(key); }
    const W = map.size, nb = Array.from({ length: W }, () => new Set()), wp = new Float32Array(W * 3), wn = new Float32Array(W * 3), cnt = new Float32Array(W), used = new Uint8Array(W);
    for (let i = 0; i < n; i++) { const w = weld[i]; wp[w * 3] = P[i * 3]; wp[w * 3 + 1] = P[i * 3 + 1]; wp[w * 3 + 2] = P[i * 3 + 2]; wn[w * 3] += N[i * 3]; wn[w * 3 + 1] += N[i * 3 + 1]; wn[w * 3 + 2] += N[i * 3 + 2]; cnt[w]++; }
    for (let t = 0; t < keep.length; t += 3) for (let k = 0; k < 3; k++) { const a = weld[keep[t + k]], b = weld[keep[t + (k + 1) % 3]]; nb[a].add(b); nb[b].add(a); used[a] = used[b] = 1; }
    // Rand der Stoffschicht nicht glätten, damit Ärmel und Saum anliegen
    const edge = new Uint8Array(W); { const ec = new Map(); for (let t = 0; t < keep.length; t += 3) for (let k = 0; k < 3; k++) { const a = weld[keep[t + k]], b = weld[keep[t + (k + 1) % 3]], key = a < b ? a + '_' + b : b + '_' + a; ec.set(key, (ec.get(key) || 0) + 1); } for (const [key, c] of ec) if (c === 1) { const [a, b] = key.split('_'); edge[+a] = edge[+b] = 1; } }
    const tmp = new Float32Array(W * 3);
    for (let it = 0; it < smooth; it++) {
      for (let w = 0; w < W; w++) { if (!used[w] || edge[w] || !nb[w].size) { tmp[w * 3] = wp[w * 3]; tmp[w * 3 + 1] = wp[w * 3 + 1]; tmp[w * 3 + 2] = wp[w * 3 + 2]; continue; }
        let x = 0, y = 0, z = 0; for (const o of nb[w]) { x += wp[o * 3]; y += wp[o * 3 + 1]; z += wp[o * 3 + 2]; } const m = nb[w].size, lam = it % 2 ? -0.53 : 0.5;   // Taubin: glättet, ohne zu schrumpfen
        tmp[w * 3] = wp[w * 3] + lam * (x / m - wp[w * 3]); tmp[w * 3 + 1] = wp[w * 3 + 1] + lam * (y / m - wp[w * 3 + 1]); tmp[w * 3 + 2] = wp[w * 3 + 2] + lam * (z / m - wp[w * 3 + 2]); }
      wp.set(tmp);
    }
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const w = weld[i], l = Math.hypot(wn[w * 3], wn[w * 3 + 1], wn[w * 3 + 2]) || 1; const o = edge[w] ? off * 0.6 : off; out[i * 3] = wp[w * 3] + wn[w * 3] / l * o; out[i * 3 + 1] = wp[w * 3 + 1] + wn[w * 3 + 1] / l * o; out[i * 3 + 2] = wp[w * 3 + 2] + wn[w * 3 + 2] / l * o; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(out, 3)); g.setAttribute('uv', G.attributes.uv); g.setAttribute('skinIndex', si); g.setAttribute('skinWeight', sw);
    g.setIndex(keep); g.computeVertexNormals();
    return (clothCache[ck] = g);
  }
  function fabricMat(c, kind) {
    const col = new T.Color(c).convertSRGBToLinear();
    if (kind === 'sparkle') { const m = sparkleMat(c); m.side = T.FrontSide; return m; }
    if (kind === 'satin') return MP({ color: col, roughness: 0.32, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: new T.Color(c).multiplyScalar(0.6), map: tex('weave') });
    if (kind === 'leather') return MP({ color: col, roughness: 0.38, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.3 });
    if (kind === 'denim') return M({ color: col, roughness: 0.9, map: tex('denim') });
    return M({ color: col, roughness: 0.82, map: tex('weave') });
  }
  // spec: [[garment, color, stoff, versatz in m, Glättung]]
  function clothe(f, spec) {
    const body = bodyMesh(f); if (!body) return;
    f.cloth = f.cloth || [];
    const bodyKey = f.look.body || 'm';
    for (const [kind, color, fab, off, sm] of spec) {
      const g = garmentGeo(body, bodyKey, kind, off, sm == null ? 10 : sm), mat = fabricMat(color, fab); mat.skinning = true; const m = new T.SkinnedMesh(g, mat);
      m.bind(body.skeleton, body.bindMatrix); m.position.copy(body.position); m.quaternion.copy(body.quaternion); m.scale.copy(body.scale);
      m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; m.userData.cloth = true; body.parent.add(m); f.cloth.push(m); f.mats.push(m.material);
    }
  }
  function outfit(look) {
    const L = look, spec = [];
    const top = L.topStyle === 'tank' ? 'bodice' : L.topStyle === 'tee' ? 'tee' : 'long';
    spec.push([top, L.top, L.fab || 'cotton', L.coat ? 0.012 : 0.014, 12]);
    if (L.coat) spec.push(['long', L.coat, L.coatFab || 'cotton', 0.03, 14]);
    spec.push([L.bottomStyle === 'shorts' ? 'shorts' : 'pants', L.bottom, L.botFab || 'denim', 0.013, 10]);
    spec.push(['shoes', L.shoes || '#222', 'leather', 0.009, 4]);
    return spec;
  }

  // ------------------------------------------------------------ Figuren
  function figure(id, look) {
    const key = id; if (figP[key]) return figP[key];
    const L = look || D.PEOPLE[id].look; figP[key] = kit.make(Object.assign({ bulk: L.body === 'w' ? 0.8 : 0.84 }, L)).then(f => { f.id = id; f.root.scale.x *= 0.93; f.root.scale.z *= 0.96; clothe(f, outfit(L)); prepSit(f); figs[key] = f; return f; });
    return figP[key];
  }
  // Sitzen: Oberschenkel nach vorn, Unterschenkel nach unten (nach jeder Animation angewendet)
  const SIT = new T.Vector3(), DOWN = new T.Vector3(0, -1, 0), QA = new T.Quaternion(), QB = new T.Quaternion(), QC = new T.Quaternion();
  function aimBone(bone, child, dir) {
    if (!bone || !child) return;
    bone.getWorldPosition(tmpV); child.getWorldPosition(tmpV2); tmpV2.sub(tmpV).normalize();
    QA.setFromUnitVectors(tmpV2, dir); bone.parent.getWorldQuaternion(QB); const wq = bone.getWorldQuaternion(QC); wq.premultiply(QA);
    bone.quaternion.copy(QB.invert ? QB.invert() : QB.inverse()).multiply(wq); bone.updateMatrixWorld(true);
  }
  function prepSit(f) {
    const B = f.bones; f.legs = [['thigh_l', 'calf_l', 'foot_l'], ['thigh_r', 'calf_r', 'foot_r']].map(a => a.map(n => B[n]));
    f.scene.updateMatrixWorld(true);
    const a = f.legs[0][0].getWorldPosition(new T.Vector3()), b = f.legs[0][1].getWorldPosition(new T.Vector3()); f.thighLen = a.distanceTo(b);
  }
  function applySit(f) {
    if (!f.sitting) return; f.scene.updateMatrixWorld(true);
    SIT.set(Math.sin(f.root.rotation.y), -0.05, Math.cos(f.root.rotation.y)).normalize();
    for (const [th, ca, fo] of f.legs) { aimBone(th, ca, SIT); aimBone(ca, fo, DOWN); }
  }

  // Lady Luma: Leons Körper, Perücke, Kleid und Schmuck
  let lumaKey = '', lumaP = null;
  function lumaLook(look, wig) {
    const L = D.normLook(look), w = D.pick('wig', L.wig), dc = D.pick('dressColor', L.dressColor).c, kind = D.pick('dress', L.dress).kind, j = L.jewel;
    const base = JSON.parse(JSON.stringify(D.PEOPLE.leon.look));
    if (wig !== false) base.hair = { style: w.style, color: D.pick('wigColor', L.wigColor).c };
    base.beard = null;
    base.top = kind === 'cape' ? '#1a1424' : dc; base.topStyle = kind === 'suit' ? 'long' : kind === 'cape' ? 'long' : 'tank';
    base.bottom = kind === 'mini' ? '#1a1424' : kind === 'cape' ? '#1a1424' : dc; base.bottomStyle = 'pants'; base.shoes = kind === 'gown' ? dc : '#d9d9e8';
    if (j === 'crown' || j === 'both') base.hat = { type: 'crown', color: '#e6e8f2' };
    const glove = kind === 'gown' ? (dc === '#1a1424' ? '#e6e8f2' : '#1a1424') : dc;
    const spec = kind === 'suit' ? [['long', dc, 'sparkle', 0.014, 12], ['pants', dc, 'sparkle', 0.014, 10], ['shoes', '#e6e8f2', 'leather', 0.01, 4]]
      : kind === 'cape' ? [['long', '#1a1424', 'satin', 0.013, 12], ['pants', '#1a1424', 'satin', 0.012, 10], ['shoes', '#e6e8f2', 'leather', 0.01, 4]]
      : kind === 'gown' ? [['long', dc, 'sparkle', 0.014, 12], ['pants', dc, 'sparkle', 0.006, 8], ['shoes', dc, 'leather', 0.01, 4]]
      : [['tee', dc, 'sparkle', 0.013, 12], ['gloves', glove, 'satin', 0.006, 6], ['pants', kind === 'mini' ? '#2a1830' : dc, kind === 'mini' ? 'satin' : 'sparkle', 0.006, 8], ['shoes', kind === 'gown' ? dc : '#e6e8f2', 'leather', 0.01, 4]];
    return { base, L, w, dc, kind, j, wig, spec };
  }
  function sparkleMat(c) { return MP({ color: c, metalness: 0.55, roughness: 0.32, roughnessMap: tex('glitter'), normalMap: tex('glitterN'), normalScale: new T.Vector2(0.6, 0.6), clearcoat: 1, clearcoatRoughness: 0.08, sheen: new T.Color(c), side: T.DoubleSide }); }
  function attach(f, bone, m) { f.scene.updateMatrixWorld(true); const inv = new T.Matrix4().copy(bone.matrixWorld); inv.invert ? inv.invert() : inv.getInverse(bone.matrixWorld); m.updateMatrix(); m.matrix.premultiply(inv); m.matrix.decompose(m.position, m.quaternion, m.scale); bone.add(m); m.castShadow = true; }
  function dressUp(f, o) {
    const B = f.bones, P = n => B[n].getWorldPosition(new T.Vector3());
    f.scene.updateMatrixWorld(true);
    const pel = P('pelvis'), sp1 = P('spine_01'), sp3 = P('spine_03'), waist = (pel.y + sp1.y) / 2 + 0.04;
    if (o.kind === 'gown' || o.kind === 'mini') {
      const hem = o.kind === 'gown' ? 0.03 : pel.y - 0.32, flare = o.kind === 'gown' ? 0.5 : 0.3, n = 14, pts = [];
      for (let i = 0; i <= n; i++) { const t = i / n, y = waist + (hem - waist) * t; pts.push(new T.Vector2(0.15 + (flare - 0.15) * Math.pow(t, o.kind === 'gown' ? 1.6 : 1.1) + (t < 0.15 ? 0.02 * Math.sin(t / 0.15 * PI) : 0), y)); }
      const geo = new T.LatheGeometry(pts, 96); const pp = geo.attributes.position;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = pp.getZ(i), y = pp.getY(i), a = Math.atan2(z, x), k = (waist - y) / (waist - hem); const f2 = 1 + Math.sin(a * 12) * 0.035 * k; pp.setX(i, x * f2); pp.setZ(i, z * f2 * 0.82); }
      geo.computeVertexNormals();
      const sk = new T.Mesh(geo, sparkleMat(o.dc)); sk.position.set(pel.x, 0, pel.z + 0.01); attach(f, B.pelvis, sk);
      // Gürtel mit Strass
      const belt = new T.Mesh(new T.TorusGeometry(0.155, 0.012, 16, 96), MP({ color: 0xe8e8f4, metalness: 1, roughness: 0.12, clearcoat: 1 })); belt.rotation.x = PI / 2; belt.scale.set(1, 0.82, 1); belt.position.set(pel.x, waist, pel.z + 0.01); attach(f, B.pelvis, belt);
    }
    if (o.kind === 'cape') {
      const geo = new T.CylinderGeometry(0.2, 0.62, sp3.y + 0.05, 96, 12, true, PI * 0.62, PI * 0.76); const pp = geo.attributes.position;
      for (let i = 0; i < pp.count; i++) { const a = Math.atan2(pp.getX(i), pp.getZ(i)); pp.setX(i, pp.getX(i) * (1 + Math.sin(a * 10) * 0.04)); }
      geo.computeVertexNormals(); geo.translate(0, -(sp3.y + 0.05) / 2, 0);
      const c = new T.Mesh(geo, sparkleMat(o.dc)); c.position.set(sp3.x, sp3.y + 0.06, sp3.z - 0.02); attach(f, B.spine_03, c);
      const col = new T.Mesh(new T.TorusGeometry(0.13, 0.03, 20, 80), sparkleMat(o.dc)); col.rotation.x = PI / 2 - 0.2; col.position.set(sp3.x, sp3.y + 0.05, sp3.z); attach(f, B.spine_03, col);
    }
    if (o.kind === 'suit') {
      for (const s of ['l', 'r']) { const fl = new T.Mesh(new T.CylinderGeometry(0.07, 0.13, 0.28, 64, 1, true), sparkleMat(o.dc)); const ft = B['calf_' + s].getWorldPosition(new T.Vector3()), fo = B['foot_' + s].getWorldPosition(new T.Vector3()); fl.position.set(fo.x, (fo.y + ft.y) / 2 - 0.06, fo.z); attach(f, B['calf_' + s], fl); }
    }
    // Kronleuchter-Ohrringe wie auf dem Cover
    if (o.j === 'chandelier' || o.j === 'both') {
      const hd = B.head || B.Head, hb = new T.Box3(); hd.children.forEach(m => { if (m.isMesh && m.userData.shared) hb.expandByObject(m); }); if (hb.isEmpty()) hb.setFromCenterAndSize((B.head || B.Head).getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 0.1, 0)), new T.Vector3(0.17, 0.24, 0.2));
      const cx = (hb.min.x + hb.max.x) / 2, cz = (hb.min.z + hb.max.z) / 2, half = Math.min(0.09, (hb.max.x - hb.min.x) / 2 * 0.62), ey = (B.head || B.Head).getWorldPosition(new T.Vector3()).y + 0.035;
      const gem = MP({ color: 0xf4f6ff, metalness: 0.9, roughness: 0.05, clearcoat: 1, envMapIntensity: 2.2 });
      for (const s of [-1, 1]) {
        const e = new T.Group(); e.position.set(cx + s * half, ey, cz + 0.005);
        const add = (geo, y, sx = 1) => { const m = new T.Mesh(geo, gem); m.position.y = y; m.scale.setScalar(sx); e.add(m); };
        add(new T.SphereGeometry(0.008, 20, 14), 0); add(new T.SphereGeometry(0.011, 20, 14), -0.022); add(new T.TorusGeometry(0.016, 0.003, 12, 40), -0.045);
        for (let k = 0; k < 5; k++) add(new T.SphereGeometry(0.0075, 16, 12), -0.065 - k * 0.011);
        add(new T.OctahedronGeometry(0.014, 2), -0.13, 1);
        e.updateMatrixWorld(true); attach(f, hd, e);
      }
    }
    // Perücke größer machen (Drag-Volumen)
    if (o.wig !== false) {
      const hd = B.head || B.Head, hairs = hd.children.filter(m => m.isMesh && m.material && m.material.map && !m.material.metalness);
      const main = hairs.find(m => m.userData.shared) || hairs[0];
      if (main) { main.geometry.computeBoundingBox(); const pv = main.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(main.matrix); pv.y -= 0.03;
        for (const m of hairs) { m.position.sub(pv).multiplyScalar(o.w.scale).add(pv); m.scale.multiplyScalar(o.w.scale); } }
      if (o.w.tower) { const hb = new T.Box3().setFromObject(hd); const top = new T.Mesh(new T.SphereGeometry(0.11, 48, 32), new T.MeshStandardMaterial({ color: new T.Color(D.pick('wigColor', o.L.wigColor).c).convertSRGBToLinear(), roughness: 0.7, map: tex('fabric') })); top.scale.set(1, 1.35, 1.05); top.position.set((hb.min.x + hb.max.x) / 2, hb.max.y + 0.06, (hb.min.z + hb.max.z) / 2 - 0.02); attach(f, hd, top); }
    }
  }
  async function luma(look, wig) {
    const o = lumaLook(look, wig), key = JSON.stringify([o.L, wig !== false]);
    if (key === lumaKey && lumaP) return lumaP;
    const old = figs.luma; lumaKey = key;
    lumaP = kit.make(Object.assign({ bulk: 0.8 }, o.base)).then(f => { f.id = 'luma'; f.root.scale.x *= 0.92; f.root.scale.z *= 0.95; clothe(f, o.spec); dressUp(f, o); prepSit(f); if (old && old !== f) { const p = old.root.position.clone(), r = old.root.rotation.y, vis = old.root.visible && old.root.parent; f.root.position.copy(p); f.root.rotation.y = r; if (vis) old.root.parent.add(f.root); f.play(old.curName || 'idle', { fade: 0 }); old.dispose(); } figs.luma = f; figP.luma = Promise.resolve(f); return f; });
    figP.luma = lumaP; return lumaP;
  }

  // ------------------------------------------------------------ Show (Spuren und Noten)
  const LANE_C = [0x3d7bff, 0xa05cff, 0xff3fb0, 0xffb36b], LANE_X = [-1.2, -0.4, 0.4, 1.2], HIT_Z = 2.0, FAR_Z = -5.3, LANE_Y = 0.02;
  let show = null;
  function buildShow() {
    if (show) return show;
    const g = new T.Group(); g.visible = false; scene.add(g);
    const lanes = LANE_X.map((x, i) => { const m = new T.Mesh(new T.PlaneGeometry(0.72, HIT_Z - FAR_Z + 0.6), new T.MeshBasicMaterial({ color: LANE_C[i], map: tex('lane'), transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })); m.rotation.x = -PI / 2; m.position.set(x, LANE_Y, (HIT_Z + FAR_Z) / 2 + 0.3); g.add(m); return m; });
    const pads = LANE_X.map((x, i) => { const p = new T.Mesh(new T.TorusGeometry(0.28, 0.035, 24, 96), MP({ color: LANE_C[i], emissive: LANE_C[i], emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.2, clearcoat: 1 })); p.rotation.x = -PI / 2; p.position.set(x, 0.05, HIT_Z); g.add(p); const gl = glowSprite(LANE_C[i], 1.1, x, 0.1, HIT_Z, g, 0.25); return { p, gl, pulse: 0 }; });
    const bar = new T.Mesh(new T.BoxGeometry(3.4, 0.015, 0.03), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); bar.position.set(0, 0.04, HIT_Z); g.add(bar);
    const geo = new T.SphereGeometry(0.2, 40, 28), pool = [];
    for (let i = 0; i < 72; i++) { const lane = i % 4; const m = new T.Mesh(geo, MP({ color: LANE_C[lane], emissive: LANE_C[lane], emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.15, clearcoat: 1 })); m.castShadow = false; m.visible = false; const gs = glowSprite(LANE_C[lane], 1.0, 0, 0, 0, m, 0.6); gs.position.set(0, 0, 0); g.add(m); pool.push({ m, lane }); }
    const bursts = [];
    show = { g, lanes, pads, pool, bursts };
    return show;
  }

  // ------------------------------------------------------------ öffentliche Schnittstelle
  const W = {
    async init(canvas, opt = {}) {
      quality = opt.quality || 'auto'; if (quality === 'auto') quality = coarse && (navigator.hardwareConcurrency || 4) <= 4 ? 'spar' : 'hoch';
      R = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      R.setPixelRatio(Math.min(devicePixelRatio || 1, quality === 'spar' ? 1.5 : 2));
      R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1;
      R.shadowMap.enabled = quality !== 'spar'; R.shadowMap.type = T.PCFSoftShadowMap; R.physicallyCorrectLights = false;
      aniso = Math.min(8, R.capabilities.getMaxAnisotropy());
      scene = new T.Scene(); scene.background = new T.Color(0x06050c); scene.fog = new T.FogExp2(0x06050c, 0.025);
      cam = new T.PerspectiveCamera(45, 1, 0.05, 80); clock = new T.Clock();
      // Spiegelungen: kleine Lichtbox als Umgebung
      const pm = new T.PMREMGenerator(R), es = new T.Scene(); es.background = new T.Color(0x0c0a14);
      const box = new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x15121f, side: T.BackSide })); es.add(box);
      [[0, 4.9, 0, 6, 0.2, 6, 0xffffff, 3], [-4.9, 2, 0, 0.2, 3, 6, 0xff5fc0, 2], [4.9, 2, 0, 0.2, 3, 6, 0x5f8bff, 2], [0, 1, -4.9, 6, 1, 0.2, 0xffe2b0, 1.5]].forEach(([x, y, z, w, h, d, c, k]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k) })); m.position.set(x, y, z); es.add(m); });
      envTex = pm.fromScene(es, 0.03).texture; scene.environment = envTex; pm.dispose();
      W.hemi = new T.HemisphereLight(0xffffff, 0x202020, 0.4); scene.add(W.hemi);
      kit = root.EasyFiguren.create({ THREE: T, base: '../figuren/', srgb: true });
      W.resize(); addEventListener('resize', W.resize);
      return kit.load();
    },
    resize() { if (!R) return; const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); },
    preload(ids) { return Promise.all(ids.map(id => id === 'luma' ? luma(W.look || D.DEFAULT_LOOK) : figure(id))); },
    set look(v) { this._look = v; }, get look() { return this._look; },
    async scene(name, cast, o = {}) {
      const s = getSet(name);
      for (const k in sets) sets[k].g.visible = sets[k] === s;
      if (show && !o.keepShow) show.g.visible = false;
      cur = s; W.hemi.color.set(s.amb[0]); W.hemi.groundColor.set(s.amb[1]); W.hemi.intensity = s.amb[2];
      const view = o.view && s[o.view] ? s[o.view] : s.cam; camPos.copy(view.pos); camLook.copy(view.look); cam.fov = fovFor(view.fov); cam.updateProjectionMatrix(); camT = 0;
      // Figuren
      const want = await Promise.all(cast.map(id => id === 'luma' ? luma(W.look || D.DEFAULT_LOOK, o.wig) : figure(id)));
      for (const k in figs) if (figs[k].root.parent && !want.includes(figs[k])) figs[k].root.parent.remove(figs[k].root);
      want.forEach((f, i) => {
        const id = cast[i], sp = (s.spots[id] || [i * 0.8 - 0.8, 0, 0, 'idle']);
        f.root.position.set(sp[0], name === 'stage' && /luma|leon|velvet|julian/.test(id) && sp[1] < -5.4 ? 0.6 : 0, sp[1]); f.root.rotation.y = sp[2];
        f.sitting = sp[3] === 'sit'; if (f.sitting) f.root.position.y -= f.thighLen * 0.92;
        f.play(f.sitting ? 'idle' : sp[3], { fade: 0 }); s.g.add(f.root);
      });
      return s;
    },
    pose(id, anim, o = {}) {
      const f = figs[id]; if (!f) return; const prev = o.once ? (f.curName && f.curName !== anim ? f.curName : 'idle') : null;
      f.play(anim, Object.assign({ restart: !!o.once }, o)); clearTimeout(f.backT);
      if (o.once && f.cur) f.backT = setTimeout(() => f.play(prev), Math.max(400, f.cur.getClip().duration / (o.speed || 1) * 1000 - 250));
    },
    turn(id, ry) { const f = figs[id]; if (f) f.root.rotation.y = ry; },
    setLook(look, wig) { W._look = look; return luma(look, wig); },
    light(v) { light = v; },
    confetti(n) { if (sets.stage) sets.stage.confetti(n); },
    camView(view) { const v = cur && cur[view]; if (v) { camPos.copy(v.pos); camLook.copy(v.look); cam.fov = fovFor(v.fov); cam.updateProjectionMatrix(); } },
    showOn(on) { const S = buildShow(); S.g.visible = on; if (on) { W.camView('showCam'); } },
    showDraw(notes, now, fall) {
      const S = show; if (!S || !S.g.visible) return; let k = 0; const used = [0, 0, 0, 0];
      for (const p of S.pool) p.m.visible = false;
      for (const n of notes) {
        const d = n.t - now; if (d > fall) break; if (d < -0.25 || n.hit) continue;
        let p = null; for (let i = used[n.lane] * 4 + n.lane; i < S.pool.length; i += 4) { p = S.pool[i]; used[n.lane]++; break; } if (!p) continue;
        const z = HIT_Z - (d / fall) * (HIT_Z - FAR_Z); p.m.visible = true; p.m.position.set(LANE_X[n.lane], 0.22 + Math.max(0, -d) * 0, z); const s = 0.75 + 0.25 * (1 - d / fall); p.m.scale.setScalar(s); k++;
      }
      return k;
    },
    padHit(lane, j) {
      const S = show; if (!S) return; const p = S.pads[lane]; p.pulse = 1;
      if (j && j !== 'miss') { for (let i = 0; i < (j === 'perfect' ? 14 : 8); i++) { const b = glowSprite(LANE_C[lane], 0.35, LANE_X[lane], 0.25, HIT_Z, S.g, 0.9); b.userData.v = new T.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 3, (Math.random() - 0.5) * 2); b.userData.life = 0.6; S.bursts.push(b); } }
    },
    frame() {
      if (!R) return; const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
      camT += dt;
      const sway = show && show.g.visible ? 0.04 : 0.12;
      cam.position.set(camPos.x + Math.sin(camT * 0.21) * sway, camPos.y + Math.sin(camT * 0.33) * sway * 0.4, camPos.z + Math.cos(camT * 0.17) * sway * 0.5); cam.lookAt(camLook);
      for (const k in figs) { const f = figs[k]; if (f.root.parent) { f.update(dt); applySit(f); } }
      if (cur && cur.tick) cur.tick(t, dt);
      if (show && show.g.visible) {
        for (const p of show.pads) { p.pulse = Math.max(0, p.pulse - dt * 4); const s = 1 + p.pulse * 0.35; p.p.scale.set(s, s, s); p.gl.material.opacity = 0.25 + p.pulse * 0.6; }
        for (let i = show.bursts.length - 1; i >= 0; i--) { const b = show.bursts[i]; b.userData.life -= dt; b.position.addScaledVector(b.userData.v, dt); b.userData.v.y -= 6 * dt; b.material.opacity = Math.max(0, b.userData.life / 0.6); if (b.userData.life <= 0) { show.g.remove(b); b.material.dispose(); show.bursts.splice(i, 1); } }
      }
      const target = 0.62 + light / 100 * 0.62; R.toneMappingExposure += (target - R.toneMappingExposure) * Math.min(1, dt * 2);
      R.render(scene, cam);
    },
    get renderer() { return R; },
  };
  root.IBDLWorld = W;
})(window);
