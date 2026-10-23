/* FABELKICK 3D – 3D-Welt: Renderer, Stadion, Figuren, Ball, Effekte */
'use strict';
(function () {
  const T = THREE;
  const P = FK.P = { L: 100, W: 64, GW: 7.6, GH: 2.6, BOX_D: 16.5, BOX_W: 40.3, SIX_D: 5.5, SIX_W: 18.3, SPOT: 11, BALL_R: 0.22 };
  const col = h => new T.Color(h).convertSRGBToLinear();
  FK.col = col;

  // gemeinsame Geometrien (einmal für alle Figuren)
  const G = {
    sph: new T.SphereGeometry(1, 14, 11), sphLo: new T.SphereGeometry(1, 10, 8),
    cyl: new T.CylinderGeometry(1, 0.82, 1, 12), cylS: new T.CylinderGeometry(1, 1, 1, 10),
    cone: new T.ConeGeometry(1, 1, 10), box: new T.BoxGeometry(1, 1, 1),
    ring: new T.RingGeometry(0.62, 0.8, 32), disc: new T.CircleGeometry(1, 20),
    ico: new T.IcosahedronGeometry(1, 0), oct: new T.OctahedronGeometry(1, 0), dode: new T.DodecahedronGeometry(1, 0)
  };
  G.cyl.translate(0, -0.5, 0); // Gliedmaßen hängen vom Gelenk nach unten
  G.ring.rotateX(-Math.PI / 2); G.disc.rotateX(-Math.PI / 2);

  function canvasTex(w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; }
    return t;
  }
  // weicher Schatten-Fleck
  const blobTex = canvasTex(64, 64, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,0.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  const blobMat = new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });

  class World {
    constructor(canvas) {
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
      this.renderer.outputEncoding = T.sRGBEncoding;
      this.renderer.toneMapping = T.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(40, 1, 0.5, 900);
      this.camera.position.set(0, 30, 50); this.camera.lookAt(0, 0, 0);
      this.mats = {}; this.charGeo = {}; this.time = 0;
      this.charMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0 }); this.crowd = []; this.cheer = 0; this.boards = null;
      this.env = new T.Group(); this.scene.add(this.env);
      this.fixed = new T.Group(); this.scene.add(this.fixed);
      this.quality = 'hoch';
      this.buildFixed();
      this.particles = new Particles(this.scene);
      this.resize();
      addEventListener('resize', () => this.resize());
    }
    mat(key, make) { return this.mats[key] || (this.mats[key] = make()); }
    std(hex, o) { return this.mat('s' + hex + JSON.stringify(o || {}), () => new T.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: 0.75, metalness: 0 }, o || {}))); }

    setQuality(q) {
      if (q === 'auto') q = (matchMedia('(pointer:coarse)').matches || Math.min(screen.width, screen.height) < 700) ? 'mittel' : 'hoch';
      this.quality = q;
      const dpr = window.devicePixelRatio || 1;
      this.renderer.setPixelRatio(Math.min(dpr, q === 'hoch' ? 2 : q === 'mittel' ? 1.5 : 1));
      const sh = q === 'hoch';
      if (this.renderer.shadowMap.enabled !== sh) {
        this.renderer.shadowMap.enabled = sh;
        this.scene.traverse(o => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); } });
      }
      if (this.sun) this.sun.castShadow = sh;
      this.crowd.forEach((m, i) => { m.visible = q !== 'niedrig' || i % 2 === 0; });
      this.resize();
    }
    resize() {
      const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
      this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    }

    // ---------- Feste Teile: Spielfeld, Linien, Tore, Tribünen ----------
    buildFixed() {
      const f = this.fixed;
      // Spielfeld mit Mähstreifen
      this.pitchMat = new T.MeshStandardMaterial({ roughness: 0.95 });
      const pitch = new T.Mesh(new T.PlaneGeometry(P.L + 16, P.W + 14), this.pitchMat);
      pitch.rotation.x = -Math.PI / 2; pitch.receiveShadow = true; f.add(pitch);
      this.outerMat = new T.MeshStandardMaterial({ roughness: 1 });
      const outer = new T.Mesh(new T.PlaneGeometry(900, 900), this.outerMat);
      outer.rotation.x = -Math.PI / 2; outer.position.y = -0.05; f.add(outer);
      // Linien
      const lm = new T.MeshBasicMaterial({ color: col('#f4f7f2'), polygonOffset: true, polygonOffsetFactor: -2 });
      const lw = 0.13, y = 0.015;
      const line = (x, z, w, d) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), lm); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); f.add(m); };
      const L2 = P.L / 2, W2 = P.W / 2;
      line(0, -W2, P.L + lw, lw); line(0, W2, P.L + lw, lw); line(-L2, 0, lw, P.W); line(L2, 0, lw, P.W); line(0, 0, lw, P.W);
      const ring = (x, z, r, a0, a1) => {
        const g = new T.RingGeometry(r - lw / 2, r + lw / 2, 64, 1, a0 || 0, a1 || Math.PI * 2);
        const m = new T.Mesh(g, lm); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); f.add(m);
      };
      ring(0, 0, 9.15);
      const spot = (x, z) => { const m = new T.Mesh(new T.CircleGeometry(0.22, 16), lm); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); f.add(m); };
      spot(0, 0);
      [-1, 1].forEach(s => {
        const gx = s * L2;
        // Strafraum
        line(gx - s * P.BOX_D, 0, lw, P.BOX_W); line(gx - s * P.BOX_D / 2, -P.BOX_W / 2, P.BOX_D, lw); line(gx - s * P.BOX_D / 2, P.BOX_W / 2, P.BOX_D, lw);
        line(gx - s * P.SIX_D, 0, lw, P.SIX_W); line(gx - s * P.SIX_D / 2, -P.SIX_W / 2, P.SIX_D, lw); line(gx - s * P.SIX_D / 2, P.SIX_W / 2, P.SIX_D, lw);
        spot(gx - s * P.SPOT, 0);
        const a = Math.acos((P.BOX_D - P.SPOT) / 9.15);
        ring(gx - s * P.SPOT, 0, 9.15, s > 0 ? Math.PI - a : -a, 2 * a);
        [-1, 1].forEach(t => ring(gx, t * W2, 1, s > 0 ? (t > 0 ? Math.PI : Math.PI / 2) : (t > 0 ? 1.5 * Math.PI : 0), Math.PI / 2));
        this.buildGoal(s);
        // Eckfahnen
        [-1, 1].forEach(t => {
          const pole = new T.Mesh(G.cylS, this.std('#eeeeee')); pole.scale.set(0.03, 1.5, 0.03); pole.position.set(gx, 0.75, t * W2); f.add(pole);
          const flag = new T.Mesh(new T.PlaneGeometry(0.5, 0.35), this.std('#ff4d6d', { side: T.DoubleSide })); flag.position.set(gx, 1.3, t * W2 + 0.25 * -t); flag.rotation.y = Math.PI / 2; f.add(flag);
        });
      });
      this.buildStands();
      // Licht
      this.hemi = new T.HemisphereLight(0xffffff, 0x334422, 0.7); this.scene.add(this.hemi);
      this.sun = new T.DirectionalLight(0xffffff, 2); this.sun.position.set(-35, 80, 40);
      const sc = this.sun.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 50; sc.bottom = -50; sc.near = 10; sc.far = 220;
      this.sun.shadow.mapSize.set(2048, 2048); this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.03;
      this.scene.add(this.sun); this.scene.add(this.sun.target);
      this.amb = new T.AmbientLight(0xffffff, 0.12); this.scene.add(this.amb);
      // Himmel
      this.skyMat = new T.ShaderMaterial({
        side: T.BackSide, depthWrite: false, fog: false,
        uniforms: { top: { value: new T.Color() }, mid: { value: new T.Color() }, bot: { value: new T.Color() } },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, bot, smoothstep(0.0, -0.2, h)); gl_FragColor = vec4(c, 1.0); }'
      });
      const sky = new T.Mesh(new T.SphereGeometry(600, 32, 16), this.skyMat); sky.renderOrder = -1; this.scene.add(sky);
    }

    buildGoal(s) {
      const f = this.fixed, x = s * P.L / 2, D = 2.1, gw = P.GW, gh = P.GH;
      const wm = this.std('#ffffff', { roughness: 0.35, metalness: 0.2 });
      const post = (px, pz, h, ry) => { const m = new T.Mesh(G.cylS, wm); m.scale.set(0.07, h, 0.07); m.position.set(px, h / 2, pz); m.castShadow = true; f.add(m); return m; };
      post(x, -gw / 2, gh); post(x, gw / 2, gh);
      const bar = new T.Mesh(G.cylS, wm); bar.scale.set(0.07, gw + 0.14, 0.07); bar.rotation.x = Math.PI / 2; bar.position.set(x, gh, 0); bar.castShadow = true; f.add(bar);
      const bx = x + s * D;
      post(bx, -gw / 2, gh); post(bx, gw / 2, gh);
      const netTex = canvasTex(64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w); }, true);
      const net = (w, h, setup) => {
        const t = netTex.clone(); t.needsUpdate = true; t.repeat.set(w / 0.25, h / 0.25);
        const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: t, transparent: true, side: T.DoubleSide, depthWrite: false, opacity: 0.75 }));
        setup(m); f.add(m); return m;
      };
      const back = net(gw, gh, m => { m.rotation.y = Math.PI / 2; m.position.set(bx, gh / 2, 0); });
      net(D, gw, m => { m.rotation.x = -Math.PI / 2; m.position.set(x + s * D / 2, gh, 0); });
      [-1, 1].forEach(t => net(D, gh, m => { m.position.set(x + s * D / 2, gh / 2, t * gw / 2); }));
      if (!this.nets) this.nets = {};
      this.nets[s] = back; back.userData.baseX = bx;
    }

    buildStands() {
      const f = this.fixed;
      this.standMat = new T.MeshStandardMaterial({ color: col('#2c3440'), roughness: 0.9 });
      this.roofMat = new T.MeshStandardMaterial({ color: col('#1a1e26'), roughness: 0.6, metalness: 0.3 });
      const fanGeo = new T.CylinderGeometry(0.2, 0.26, 0.85, 6); fanGeo.translate(0, 0.42, 0);
      const fanMat = new T.MeshLambertMaterial({ color: 0xffffff });
      const rows = 9, step = 0.85, rise = 0.62, gap = 9;
      const sides = [
        { len: P.L + 30, off: P.W / 2 + gap, rot: 0 }, { len: P.L + 30, off: P.W / 2 + gap, rot: Math.PI },
        { len: P.W + 6, off: P.L / 2 + gap, rot: Math.PI / 2 }, { len: P.W + 6, off: P.L / 2 + gap, rot: -Math.PI / 2 }
      ];
      const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(1, 1, 1), p = new T.Vector3(), yAx = new T.Vector3(0, 1, 0);
      sides.forEach((sd, si) => {
        const g = new T.Group(); g.rotation.y = sd.rot; f.add(g);
        // Grundkörper der Tribüne als Stufen
        for (let r = 0; r < rows; r++) {
          const b = new T.Mesh(G.box, this.standMat); b.scale.set(sd.len, 0.5 + r * rise, step);
          b.position.set(0, (0.5 + r * rise) / 2, sd.off + r * step); b.receiveShadow = true; g.add(b);
        }
        const back = new T.Mesh(G.box, this.standMat); back.scale.set(sd.len, rows * rise + 4, 1); back.position.set(0, (rows * rise + 4) / 2, sd.off + rows * step + 0.5); g.add(back);
        const roof = new T.Mesh(G.box, this.roofMat); roof.scale.set(sd.len, 0.4, rows * step + 3); roof.position.set(0, rows * rise + 5, sd.off + rows * step / 2 - 0.5); roof.rotation.x = -0.08; g.add(roof);
        // Werbebanden
        const boardMat = this.boardMat || (this.boardMat = new T.MeshBasicMaterial({ map: this.boardTex() }));
        const bd = new T.Mesh(new T.PlaneGeometry(sd.len - 20, 0.9), boardMat); bd.position.set(0, 0.45, sd.off - gap + 4.5); bd.rotation.y = Math.PI; g.add(bd);
        // Publikum, in Abschnitte geteilt (für die Welle beim Tor)
        const parts = 3, per = sd.len / parts;
        for (let k = 0; k < parts; k++) {
          const pos = [];
          for (let r = 0; r < rows; r++) for (let x = -per / 2 + 0.5; x < per / 2 - 0.3; x += 0.82) {
            if (Math.random() < 0.12) continue;
            pos.push([x + (k - (parts - 1) / 2) * per + (Math.random() - 0.5) * 0.2, 0.5 + r * rise, sd.off + r * step + 0.1]);
          }
          const im = new T.InstancedMesh(fanGeo, fanMat, pos.length);
          pos.forEach((v, i) => { p.set(v[0], v[1], v[2]); q.setFromAxisAngle(yAx, (Math.random() - 0.5) * 0.6); sc.set(1, 0.85 + Math.random() * 0.3, 1); m4.compose(p, q, sc); im.setMatrixAt(i, m4); im.setColorAt(i, col('#888888')); });
          im.instanceMatrix.needsUpdate = true; im.userData = { phase: si * 1.7 + k * 0.9, base: 0 };
          g.add(im); this.crowd.push(im);
        }
      });
      // Flutlichtmasten
      this.lightPanels = [];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const g = new T.Group(); g.position.set(sx * (P.L / 2 + 16), 0, sz * (P.W / 2 + 18)); f.add(g);
        const mast = new T.Mesh(G.cylS, this.roofMat); mast.scale.set(0.5, 30, 0.5); mast.position.y = 15; g.add(mast);
        const pm = new T.MeshBasicMaterial({ color: col('#fffbe8') });
        const panel = new T.Mesh(G.box, pm); panel.scale.set(5, 3, 0.4); panel.position.y = 31; panel.lookAt(-sx * 60, 0, -sz * 60); g.add(panel);
        this.lightPanels.push(pm);
      });
    }

    boardTex() {
      const words = ['FABELKICK', 'easygames', 'ELFEN-LIMO', 'DRACHENCHILI', 'BANANA BOOST', 'ZWERGEN-SCHMIEDE', 'YETI-EIS', 'TROLL-TAXI'];
      const t = canvasTex(2048, 64, (g, w, h) => {
        const cs = ['#ff3d6e', '#16c7ff', '#ffd23f', '#8b5cf6', '#22c55e', '#ff7a00', '#0ea5e9', '#e11d48'];
        const seg = w / words.length;
        words.forEach((wd, i) => {
          g.fillStyle = i % 2 ? '#0d1020' : cs[i]; g.fillRect(i * seg, 0, seg, h);
          g.fillStyle = i % 2 ? cs[i] : '#ffffff'; g.font = 'italic 900 40px system-ui,Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(wd, i * seg + seg / 2, h / 2 + 2);
        });
      }, true);
      t.repeat.set(3, 1); this.boards = t; return t;
    }

    // ---------- Arena (Himmel, Licht, Deko) ----------
    setArena(a) {
      this.arena = a;
      // alte Deko entsorgen
      this.env.traverse(o => { if (o.geometry && !Object.values(G).includes(o.geometry)) o.geometry.dispose(); if (o.material && o.material.userData.own) o.material.dispose(); });
      this.env.clear();
      const u = this.skyMat.uniforms; u.top.value = col(a.sky[0]); u.mid.value = col(a.sky[1]); u.bot.value = col(a.sky[2]);
      this.scene.fog = new T.Fog(col(a.fog), 160, 520);
      this.sun.color = col(a.sun); this.sun.intensity = a.sunI;
      this.hemi.color = col(a.hemi[0]); this.hemi.groundColor = col(a.hemi[1]); this.hemi.intensity = a.hemiI;
      this.sun.position.set(a.night ? 0 : -35, 80, a.night ? 25 : 40);
      this.pitchMat.map && this.pitchMat.map.dispose();
      this.pitchMat.map = canvasTex(1024, 256, (g, w, h) => {
        const n = 20; for (let i = 0; i < n; i++) { g.fillStyle = a.grass[i % 2]; g.fillRect(i * w / n, 0, w / n + 1, h); }
        for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},0.035)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        // Rand außerhalb der Linien etwas dunkler
        g.fillStyle = 'rgba(0,0,0,0.12)'; const mx = 8 / (P.L + 16) * w, mz = 7 / (P.W + 14) * h;
        g.fillRect(0, 0, mx, h); g.fillRect(w - mx, 0, mx, h); g.fillRect(0, 0, w, mz); g.fillRect(0, h - mz, w, mz);
      });
      this.pitchMat.needsUpdate = true;
      this.outerMat.color = col(a.outer); this.standMat.color = col(a.stand);
      this.lightPanels.forEach(m => m.color = col(a.night ? '#ffffff' : '#c9c9c0'));
      this.amb.intensity = a.night ? 0.18 : 0.1;
      const e = this.env, M = (hex, o) => { const m = new T.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: 0.8, flatShading: true }, o || {})); m.userData.own = true; return m; };
      const ring = (n, r0, r1, fn) => { for (let i = 0; i < n; i++) { const a2 = i / n * Math.PI * 2 + Math.random() * 0.2, r = r0 + Math.random() * (r1 - r0); fn(Math.cos(a2) * r * 1.25, Math.sin(a2) * r, i); } };
      this.floaters = [];
      if (a.decor === 'trees') {
        const trunk = M('#5a3b22'), leaf = [M('#2f8a3a'), M('#3fa64a'), M('#257a33')], vine = M('#4f9a2f');
        ring(26, 95, 135, (x, z, i) => {
          const h = 30 + Math.random() * 25, g = new T.Group(); g.position.set(x, 0, z); e.add(g);
          const t = new T.Mesh(G.cylS, trunk); t.scale.set(2.2, h, 2.2); t.position.y = h / 2; g.add(t);
          for (let k = 0; k < 4; k++) { const l = new T.Mesh(G.ico, leaf[k % 3]); const s = 9 + Math.random() * 7; l.scale.set(s, s * 0.7, s); l.position.set((Math.random() - 0.5) * 10, h + (Math.random() - 0.2) * 6, (Math.random() - 0.5) * 10); g.add(l); }
          if (i % 3 === 0) { const v = new T.Mesh(G.cylS, vine); v.scale.set(0.25, h * 0.6, 0.25); v.position.set(4, h * 0.7, 0); g.add(v); }
        });
        // Bananen-Ballons über dem Stadion
        for (let i = 0; i < 5; i++) { const b = new T.Mesh(G.sphLo, M('#ffd84a', { emissive: col('#553300') })); b.scale.set(3, 1.2, 1.2); b.position.set((i - 2) * 30, 48 + Math.random() * 10, -70 - Math.random() * 20); b.rotation.z = 0.4; e.add(b); this.floaters.push(b); }
      } else if (a.decor === 'crystals') {
        const cm = [M('#7ef9ff', { emissive: col('#1aa8c8'), roughness: 0.2, metalness: 0.3 }), M('#c18cff', { emissive: col('#6a2bd1'), roughness: 0.2, metalness: 0.3 })];
        ring(22, 95, 140, (x, z, i) => {
          for (let k = 0; k < 3; k++) { const c = new T.Mesh(G.oct, cm[(i + k) % 2]); const s = 4 + Math.random() * 6; c.scale.set(s * 0.5, s * 2.2, s * 0.5); c.position.set(x + (Math.random() - 0.5) * 12, s * 1.6, z + (Math.random() - 0.5) * 12); c.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * 3, (Math.random() - 0.5) * 0.5); e.add(c); }
        });
        for (let i = 0; i < 8; i++) { const c = new T.Mesh(G.oct, cm[i % 2]); c.scale.set(1.5, 3.5, 1.5); const ang = i / 8 * Math.PI * 2; c.position.set(Math.cos(ang) * 75, 42, Math.sin(ang) * 55); e.add(c); this.floaters.push(c); }
        const moonA = new T.Mesh(G.sph, new T.MeshBasicMaterial({ color: col('#e8f0ff'), fog: false })); moonA.material.userData.own = true; moonA.scale.setScalar(26); moonA.position.set(-160, 190, -380); e.add(moonA);
        const moonB = new T.Mesh(G.sph, new T.MeshBasicMaterial({ color: col('#ffc8f0'), fog: false })); moonB.material.userData.own = true; moonB.scale.setScalar(12); moonB.position.set(120, 150, -400); e.add(moonB);
        const sg = new T.BufferGeometry(), sp = [];
        for (let i = 0; i < 900; i++) { const th = Math.random() * Math.PI * 2, ph = Math.random() * 1.3; sp.push(Math.cos(th) * Math.sin(ph) * 500, Math.cos(ph) * 500 + 40, Math.sin(th) * Math.sin(ph) * 500); }
        sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
        const st = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })); st.material.userData.own = true; e.add(st);
      } else if (a.decor === 'volcano') {
        const rock = M('#3a2a26'), lava = M('#ff5a1f', { emissive: col('#ff3a00'), roughness: 0.4 });
        ring(9, 150, 220, (x, z) => {
          const h = 60 + Math.random() * 60, r = h * 0.8; const c = new T.Mesh(G.cone, rock); c.scale.set(r, h, r); c.position.set(x, h / 2 - 2, z); e.add(c);
          const top = new T.Mesh(G.cone, lava); top.scale.set(r * 0.18, h * 0.12, r * 0.18); top.position.set(x, h - 2 - h * 0.05, z); e.add(top);
        });
        for (let i = 0; i < 10; i++) { const r = new T.Mesh(G.dode, rock); const s = 3 + Math.random() * 5; r.scale.set(s, s * 0.7, s); const ang = i / 10 * Math.PI * 2; r.position.set(Math.cos(ang) * 90, 35 + Math.random() * 20, Math.sin(ang) * 70); e.add(r); this.floaters.push(r); }
        const lr = new T.Mesh(new T.RingGeometry(120, 128, 64), lava); lr.rotation.x = -Math.PI / 2; lr.position.y = 0.05; lr.scale.set(1.25, 1, 1); e.add(lr);
      }
    }

    setCrowdColors(c1, c2) {
      const cs = [col(c1), col(c2), col('#e8e8e8'), col('#333a48'), col('#d04848'), col('#3f7fd8')];
      const tmp = new T.Color();
      this.crowd.forEach((im, k) => {
        for (let i = 0; i < im.count; i++) {
          const r = Math.random(); const base = r < 0.38 ? cs[0] : r < 0.7 ? cs[1] : cs[2 + Math.floor(Math.random() * 4)];
          tmp.copy(base).multiplyScalar(0.75 + Math.random() * 0.35); im.setColorAt(i, tmp);
        }
        im.instanceColor.needsUpdate = true;
      });
    }

    update(dt) {
      this.time += dt;
      if (this.boards) this.boards.offset.x = (this.boards.offset.x + dt * 0.03) % 1;
      this.cheer = Math.max(0, this.cheer - dt * 0.25);
      const t = this.time;
      for (const im of this.crowd) {
        if (!im.visible) continue;
        im.position.y = Math.max(0, Math.sin(t * 9 + im.userData.phase * 3)) * 0.35 * this.cheer + Math.sin(t * 2 + im.userData.phase) * 0.03;
      }
      if (this.floaters) this.floaters.forEach((o, i) => { o.position.y += Math.sin(t * 0.7 + i) * dt * 0.8; o.rotation.y += dt * 0.25; });
      this.particles.update(dt);
    }
    render() { this.renderer.render(this.scene, this.camera); }

    // ---------- Figuren ----------
    makeChar(team, opts) { return new Char(this, team, opts || {}); }
    makeBall() {
      const tex = canvasTex(512, 256, (g, w, h) => {
        g.fillStyle = '#f7f7f2'; g.fillRect(0, 0, w, h);
        const hex = (x, y, r, c) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fillStyle = c; g.fill(); };
        const pts = [[64, 64], [192, 40], [320, 64], [448, 40], [0, 150], [128, 160], [256, 150], [384, 160], [512, 150], [64, 236], [192, 220], [320, 236], [448, 220]];
        pts.forEach(([x, y], i) => hex(x, y, 34, i % 3 === 0 ? '#7c3aed' : '#16181f'));
        g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 3; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 32, h); g.stroke(); }
      });
      const m = new T.Mesh(new T.SphereGeometry(P.BALL_R, 24, 16), new T.MeshStandardMaterial({ map: tex, roughness: 0.45 }));
      m.castShadow = true;
      const blob = new T.Mesh(G.disc, blobMat); blob.scale.setScalar(0.32); blob.renderOrder = 1;
      this.scene.add(m); this.scene.add(blob);
      return { mesh: m, blob };
    }
    marker(color) {
      const g = new T.Group();
      const r = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: col(color), transparent: true, opacity: 0.9, depthWrite: false }));
      r.position.y = 0.03; r.renderOrder = 2; g.add(r);
      const a = new T.Mesh(G.cone, new T.MeshBasicMaterial({ color: col(color) })); a.scale.set(0.22, -0.35, 0.22); a.position.y = 2.6; g.add(a);
      g.userData.arrow = a; this.scene.add(g); return g;
    }
  }

  // ---------- Fantasy-Spielerfigur ----------
  class Char {
    constructor(world, team, o) {
      const sp = FK.SPECIES[team.species], W = world, s = sp.scale, w = sp.w;
      const kit = o.gk ? { shirt: o.gkColor || '#33e07a', shorts: '#1b1b22', socks: o.gkColor || '#33e07a', trim: '#111111' } : team.kit;
      const M = (hex, opt) => W.std(hex, opt);
      const shirt = M(kit.shirt), shorts = M(kit.shorts), socks = M(kit.socks), trim = M(kit.trim), fur = M(sp.fur), face = M(sp.face), boot = M('#15161c', { roughness: 0.4 });
      const white = M('#ffffff', { roughness: 0.3 }), black = M('#0b0b10', { roughness: 0.3 });
      const g = this.group = new T.Group(), rig = this.rig = new T.Group(); g.add(rig);
      this.scale = s;
      const add = (parent, geo, mat, sx, sy, sz, x, y, z) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; parent.add(m); return m; };
      const hip = 0.92;
      // Beine
      const leg = side => {
        const p = new T.Group(); p.position.set(side * 0.13 * w, hip, 0); rig.add(p);
        add(p, G.cyl, shorts, 0.11 * w, 0.4, 0.11 * w, 0, 0, 0);
        add(p, G.cyl, sp.feats.includes('muzzle') || sp.feats.includes('furHead') ? fur : socks, 0.075 * w, 0.48, 0.075 * w, 0, -0.38, 0);
        add(p, G.box, boot, 0.13 * w, 0.1, 0.26, 0, -0.86, 0.06);
        return p;
      };
      this.legL = leg(1); this.legR = leg(-1);
      // Körper
      this.torso = add(rig, G.sph, shirt, 0.27 * w, 0.36, 0.19 * w, 0, hip + 0.33, 0);
      add(rig, G.sph, shorts, 0.24 * w, 0.14, 0.17 * w, 0, hip + 0.02, 0);
      add(rig, G.cylS, trim, 0.255 * w, 0.05, 0.18 * w, 0, hip + 0.1, 0); // Gürtel-Streifen
      add(rig, G.sph, trim, 0.06, 0.06, 0.03, 0.1 * w, hip + 0.48, 0.17 * w); // Wappen
      // Arme
      const al = 0.27 * sp.arm;
      const arm = side => {
        const p = new T.Group(); p.position.set(side * 0.29 * w, hip + 0.58, 0); rig.add(p);
        add(p, G.cyl, shirt, 0.085 * w, 0.24, 0.085 * w, 0, 0, 0);
        add(p, G.cyl, fur, 0.065 * w, al, 0.065 * w, 0, -0.22, 0);
        add(p, G.sphLo, sp.feats.includes('muzzle') ? face : fur, 0.075 * w, 0.075, 0.075 * w, 0, -0.24 - al, 0);
        return p;
      };
      this.armL = arm(1); this.armR = arm(-1);
      // Kopf
      const hs = sp.head, head = this.head = new T.Group(); head.position.set(0, hip + 0.82 + 0.05 * hs, 0); rig.add(head);
      add(head, G.sph, fur, 0.2 * hs, 0.21 * hs, 0.2 * hs, 0, 0.02, 0);
      const ey = 0.06 * hs, ez = 0.165 * hs, ex = 0.07 * hs;
      [-1, 1].forEach(k => { add(head, G.sphLo, white, 0.045 * hs, 0.05 * hs, 0.03, k * ex, ey, ez); add(head, G.sphLo, black, 0.024 * hs, 0.028 * hs, 0.02, k * ex, ey, ez + 0.022); });
      const F = sp.feats;
      if (F.includes('muzzle')) add(head, G.sph, face, 0.13 * hs, 0.1 * hs, 0.09 * hs, 0, -0.06 * hs, 0.14 * hs);
      if (F.includes('brow')) add(head, G.sph, fur, 0.17 * hs, 0.04 * hs, 0.06 * hs, 0, 0.12 * hs, 0.13 * hs);
      if (F.includes('roundEars')) [-1, 1].forEach(k => add(head, G.sphLo, face, 0.03, 0.065 * hs, 0.065 * hs, k * 0.2 * hs, 0.02, 0));
      if (F.includes('crest')) add(head, G.sph, fur, 0.1 * hs, 0.12 * hs, 0.16 * hs, 0, 0.15 * hs, -0.03);
      if (F.includes('tusks')) [-1, 1].forEach(k => { const t = add(head, G.cone, white, 0.025, 0.09, 0.025, k * 0.07 * hs, -0.08 * hs, 0.15 * hs); t.rotation.x = -0.3; });
      if (F.includes('pointEars')) [-1, 1].forEach(k => { const t = add(head, G.cone, fur, 0.04, 0.16, 0.04, k * 0.2 * hs, 0.06, 0); t.rotation.z = -k * 1.2; });
      if (F.includes('topknot')) add(head, G.sphLo, black, 0.06, 0.1, 0.06, 0, 0.24 * hs, -0.04);
      if (F.includes('longEars')) [-1, 1].forEach(k => { const t = add(head, G.cone, fur, 0.035, 0.22, 0.035, k * 0.21 * hs, 0.08, -0.02); t.rotation.z = -k * 1.05; t.rotation.x = 0.3; });
      if (F.includes('hair')) { add(head, G.sph, M(sp.hair), 0.21 * hs, 0.17 * hs, 0.21 * hs, 0, 0.08, -0.02); add(head, G.sph, M(sp.hair), 0.13, 0.28, 0.08, 0, -0.12, -0.15); }
      if (F.includes('beard')) { const b = add(head, G.cone, M(sp.hair), 0.17 * hs, 0.32, 0.12 * hs, 0, -0.2 * hs, 0.08); b.rotation.x = Math.PI; }
      if (F.includes('helmet')) { add(head, G.sph, M('#9aa3ad', { metalness: 0.6, roughness: 0.35 }), 0.215 * hs, 0.12 * hs, 0.215 * hs, 0, 0.11 * hs, 0); [-1, 1].forEach(k => { const h = add(head, G.cone, white, 0.04, 0.14, 0.04, k * 0.2 * hs, 0.2 * hs, 0); h.rotation.z = -k * 0.9; }); }
      if (F.includes('bigNose')) { const n = add(head, G.cone, face, 0.06, 0.2 * hs, 0.06, 0, -0.02, 0.24 * hs); n.rotation.x = Math.PI / 2; }
      if (F.includes('smallEars')) [-1, 1].forEach(k => add(head, G.sphLo, fur, 0.03, 0.05, 0.05, k * 0.2 * hs, 0, 0));
      if (F.includes('moss')) add(head, G.sph, M('#4f7f2f'), 0.16 * hs, 0.08 * hs, 0.16 * hs, 0, 0.18 * hs, -0.02);
      if (F.includes('snout')) add(head, G.sph, face, 0.12 * hs, 0.08 * hs, 0.16 * hs, 0, -0.05 * hs, 0.17 * hs);
      if (F.includes('horns')) [-1, 1].forEach(k => { const h = add(head, G.cone, M(team.species === 'yeti' ? '#c9b48a' : '#f1e6c8'), 0.04, 0.18, 0.04, k * 0.12 * hs, 0.2 * hs, -0.04); h.rotation.z = -k * 0.5; h.rotation.x = -0.4; });
      if (F.includes('crestSpikes')) for (let i = 0; i < 3; i++) { const c = add(head, G.cone, M('#ffcf3a'), 0.03, 0.1, 0.03, 0, 0.2 * hs - i * 0.06, -0.08 - i * 0.07); c.rotation.x = -0.6 - i * 0.3; }
      if (F.includes('furHead')) add(head, G.sph, fur, 0.23 * hs, 0.12 * hs, 0.22 * hs, 0, 0.14 * hs, -0.02);
      if (F.includes('tail')) { this.tail = new T.Group(); this.tail.position.set(0, hip, -0.15); rig.add(this.tail); const tl = add(this.tail, G.cyl, fur, 0.07, 0.6, 0.07, 0, 0, 0); this.tail.rotation.x = -2.0; tl.position.y = 0; }
      if (team.species === 'ape') { this.tail = new T.Group(); this.tail.position.set(0, hip, -0.14); rig.add(this.tail); add(this.tail, G.cyl, fur, 0.035, 0.7, 0.035); this.tail.rotation.x = -2.4; }
      g.scale.setScalar(s * (o.gk ? 1.04 : 1));
      // Teile je Gelenk zu einem Mesh zusammenfassen: ~7 statt ~40 Zeichenaufrufe pro Figur
      const key = team.id + (o.gk ? ':gk:' + (o.gkColor || '') : '');
      const cache = W.charGeo[key] || (W.charGeo[key] = []);
      [rig, this.legL, this.legR, this.armL, this.armR, this.head, this.tail].forEach((grp, gi) => {
        if (!grp) return;
        const meshes = grp.children.filter(c => c.isMesh);
        if (!meshes.length) return;
        const geo = cache[gi] || (cache[gi] = mergeParts(meshes));
        meshes.forEach(m => grp.remove(m));
        const mm = new T.Mesh(geo, W.charMat); mm.castShadow = true; grp.add(mm);
      });
      // Schatten-Fleck
      this.blob = new T.Mesh(G.disc, blobMat); this.blob.scale.setScalar(0.55 * w); this.blob.position.y = 0.02; this.blob.renderOrder = 1;
      W.scene.add(g); W.scene.add(this.blob);
      this.phase = Math.random() * 6; this.world = W;
    }
    setShadows(on) { this.group.traverse(m => { if (m.isMesh) m.castShadow = on; }); }
    dispose() { this.world.scene.remove(this.group); this.world.scene.remove(this.blob); }
    // p: { x, z, face, speed, state, t (Zustandszeit), dive (-1/1), kick (0..1) }
    pose(p, dt) {
      const g = this.group, r = this.rig;
      g.position.set(p.x, 0, p.z); g.rotation.y = p.face;
      this.blob.position.set(p.x, 0.02, p.z);
      const L = this.legL.rotation, R = this.legR.rotation, AL = this.armL.rotation, AR = this.armR.rotation;
      r.rotation.set(0, 0, 0); r.position.set(0, 0, 0); this.head.rotation.set(0, 0, 0);
      L.set(0, 0, 0); R.set(0, 0, 0); AL.set(0, 0, 0.12); AR.set(0, 0, -0.12);
      const sp = p.speed || 0;
      this.phase += dt * (2.2 + sp * 1.55);
      const ph = this.phase, st = p.state;
      if (st === 'slide') {
        r.rotation.x = -1.15; r.position.y = -0.5; r.position.z = 0.2; L.x = -1.4; R.x = -0.9; AL.z = 1.2; AR.z = -1.2;
      } else if (st === 'stun') {
        const k = Math.min(1, p.t * 4); r.rotation.x = 1.35 * k; r.position.y = -0.55 * k; AL.x = -2.6 * k; AR.x = -2.6 * k;
      } else if (st === 'dive') {
        const k = Math.min(1, p.t * 5); r.rotation.z = -p.dive * 1.3 * k; r.position.y = 0.35 * k * (1 - Math.max(0, p.t - 0.35) * 2); r.position.x = p.dive * 0.4 * k;
        AL.z = 2.9; AR.z = -2.9; L.z = 0.3; R.z = -0.3;
      } else if (st === 'celebrate') {
        r.position.y = Math.abs(Math.sin(ph * 0.9)) * 0.45; AL.z = 2.6 + Math.sin(ph * 2) * 0.3; AR.z = -2.6 - Math.sin(ph * 2) * 0.3; L.x = Math.sin(ph) * 0.4; R.x = -Math.sin(ph) * 0.4;
      } else if (st === 'hold') {
        AL.x = -1.2; AR.x = -1.2; AL.z = -0.25; AR.z = 0.25;
        if (p.throwT > 0) { AL.x = AR.x = -3.0 + p.throwT * 6; }
      } else if (st === 'sad') {
        this.head.rotation.x = 0.5; AL.z = 0.05; AR.z = -0.05; r.rotation.x = 0.15;
      } else {
        const amp = Math.min(1, sp / 6.5);
        const s1 = Math.sin(ph);
        L.x = s1 * 0.95 * amp; R.x = -s1 * 0.95 * amp;
        AL.x = -s1 * 0.8 * amp; AR.x = s1 * 0.8 * amp;
        r.position.y = Math.abs(Math.cos(ph)) * 0.07 * amp;
        r.rotation.x = sp * 0.022;
        if (sp < 0.4) { r.position.y = Math.sin(this.world.time * 2.4 + this.phase) * 0.01; AL.z = 0.14 + Math.sin(this.world.time * 1.6) * 0.03; AR.z = -AL.z; }
        if (p.kick > 0) { // Schussbewegung rechtes Bein
          const k = p.kick; R.x = k > 0.6 ? (1 - k) / 0.4 * 0.9 : 0.9 - (0.6 - k) / 0.6 * 2.2; L.x = 0.2; AL.z = 0.9; AR.z = -0.6;
          r.rotation.x = 0.12;
        }
        if (st === 'keeper') { L.z = 0.25; R.z = -0.25; AL.z = 0.7; AR.z = -0.7; AL.x = AR.x = -0.6; r.position.y -= 0.08; }
      }
      if (this.tail) this.tail.rotation.z = Math.sin(ph * 0.7) * 0.4;
    }
  }

  // Meshes mit Farbe je Ecke zu einer Geometrie verschmelzen (ein Material für alle Figuren)
  function mergeParts(meshes) {
    let nv = 0, ni = 0;
    meshes.forEach(m => { nv += m.geometry.attributes.position.count; ni += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), colA = new Float32Array(nv * 3), idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni);
    const v = new T.Vector3(), nm = new T.Matrix3();
    let vo = 0, io = 0;
    meshes.forEach(m => {
      m.updateMatrix(); nm.getNormalMatrix(m.matrix);
      const g = m.geometry, P = g.attributes.position, N = g.attributes.normal, c = m.material.color;
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m.matrix); pos.set([v.x, v.y, v.z], (vo + i) * 3);
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor.set([v.x, v.y, v.z], (vo + i) * 3);
        colA.set([c.r, c.g, c.b], (vo + i) * 3);
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.getX(i) + vo;
      else for (let i = 0; i < P.count; i++) idx[io + i] = vo + i;
      io += g.index ? g.index.count : P.count; vo += P.count;
    });
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(colA, 3));
    out.setIndex(new T.BufferAttribute(idx, 1)); out.computeBoundingSphere();
    return out;
  }

  // ---------- Partikel (ein einziger Zeichenaufruf) ----------
  class Particles {
    constructor(scene) {
      const N = this.N = 500; this.i = 0;
      const g = this.geo = new T.BufferGeometry();
      this.pos = new Float32Array(N * 3); this.col = new Float32Array(N * 3); this.size = new Float32Array(N); this.alpha = new Float32Array(N);
      this.vel = new Float32Array(N * 3); this.life = new Float32Array(N); this.max = new Float32Array(N); this.grav = new Float32Array(N); this.s0 = new Float32Array(N);
      g.setAttribute('position', new T.BufferAttribute(this.pos, 3)); g.setAttribute('color', new T.BufferAttribute(this.col, 3));
      g.setAttribute('size', new T.BufferAttribute(this.size, 1)); g.setAttribute('alpha', new T.BufferAttribute(this.alpha, 1));
      const m = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending, vertexColors: true,
        uniforms: { scale: { value: 300 } },
        vertexShader: 'attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float scale; void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; gl_FragColor = vec4(vC, vA * (1.0 - r * 4.0)); }'
      });
      this.mat = m;
      this.pts = new T.Points(g, m); this.pts.frustumCulled = false; scene.add(this.pts);
      this.active = 0;
    }
    emit(x, y, z, vx, vy, vz, color, life, size, grav) {
      const i = this.i; this.i = (this.i + 1) % this.N; const c = typeof color === 'string' ? col(color) : color;
      this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
      this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
      this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
      this.life[i] = life; this.max[i] = life; this.s0[i] = size; this.grav[i] = grav || 0; this.active = 2;
    }
    burst(x, y, z, color, n, spd, life, size, grav) {
      const c = col(color);
      for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, b = Math.random() * 2 - 1, s = spd * (0.4 + Math.random() * 0.6), q = Math.sqrt(1 - b * b); this.emit(x, y, z, Math.cos(a) * q * s, Math.abs(b) * s, Math.sin(a) * q * s, c, life * (0.6 + Math.random() * 0.4), size, grav); }
    }
    update(dt) {
      if (!this.active) return;
      let any = false;
      for (let i = 0; i < this.N; i++) {
        if (this.life[i] <= 0) { if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.size[i] = 0; } continue; }
        any = true; this.life[i] -= dt;
        this.vel[i * 3 + 1] -= this.grav[i] * dt;
        this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
        const k = Math.max(0, this.life[i] / this.max[i]); this.alpha[i] = k; this.size[i] = this.s0[i] * (0.4 + 0.6 * k);
      }
      const a = this.geo.attributes; a.position.needsUpdate = a.color.needsUpdate = a.size.needsUpdate = a.alpha.needsUpdate = true;
      if (!any) this.active--;
    }
  }

  FK.World = World;
})();
