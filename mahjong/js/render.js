/* Mahjong 3D – Darstellung mit Three.js (r128). Zeichnet nur, entscheidet nichts.
 * Sparsam: alle Steine als zwei InstancedMeshes (Körper + Bild), gerendert wird nur bei Änderungen oder laufenden Animationen. */
(function (root) {
  'use strict';
  const T = root.THREE;
  const TW = 1, TH = 1.3125, TD = 0.56;   // Steinbreite, -höhe (Tiefe auf dem Tisch), -dicke

  const THEMES = {
    jade:    { mat: '#1e6b52', mat2: '#0f3f30', rim: '#c9a24a', bg: 'radial-gradient(120% 90% at 50% 30%,#2b8a6a 0%,#0e3b2e 55%,#06201a 100%)' },
    bambus:  { mat: '#4f7a2a', mat2: '#2c4a14', rim: '#d9c28a', bg: 'radial-gradient(120% 90% at 50% 30%,#8fbf5a 0%,#3b6420 55%,#1b330c 100%)' },
    lotus:   { mat: '#1f6f7a', mat2: '#0f3a44', rim: '#f2a7c8', bg: 'radial-gradient(120% 90% at 50% 30%,#46b3bf 0%,#155866 55%,#082a33 100%)' },
    kirsche: { mat: '#7a2f5c', mat2: '#431735', rim: '#ffc1dc', bg: 'radial-gradient(120% 90% at 50% 30%,#f39cc4 0%,#8a356a 55%,#3a1230 100%)' },
    drache:  { mat: '#7a1f1f', mat2: '#3f0d0d', rim: '#f2c14a', bg: 'radial-gradient(120% 90% at 50% 30%,#d9483a 0%,#701a1a 55%,#2a0808 100%)' },
    mond:    { mat: '#24345e', mat2: '#121b36', rim: '#c8d4ff', bg: 'radial-gradient(120% 90% at 50% 30%,#5a6fb8 0%,#1d2752 55%,#0a0f24 100%)' },
    tempel:  { mat: '#0f5c4a', mat2: '#06302a', rim: '#ffd36b', bg: 'radial-gradient(120% 90% at 50% 30%,#1fae86 0%,#0b4a3c 55%,#03201a 100%)' },
    kaiser:  { mat: '#6e1430', mat2: '#360818', rim: '#ffcf4a', bg: 'radial-gradient(120% 90% at 50% 30%,#c9304f 0%,#5c1028 55%,#22040e 100%)' }
  };
  const BACKS = { jade: '#2f8f6a', rubin: '#b3304a', saphir: '#2f5fb3', gold: '#d19a2a', ebenholz: '#3a3330' };

  function makeBodyGeometry() {
    const bt = 0.035, w = TW - 0.04 - 2 * bt, h = TH - 0.04 - 2 * bt, r = 0.11;
    const s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    function part(depth, y0) {
      let g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 2, curveSegments: 3 });
      g.rotateX(-Math.PI / 2); g.translate(0, y0 + bt, 0);
      if (g.index) g = g.toNonIndexed();
      return g;
    }
    const lowH = TD * 0.36, hiH = TD - lowH;
    const a = part(lowH - 2 * bt, 0), b = part(hiH - 2 * bt, lowH);
    const merged = new T.BufferGeometry();
    ['position', 'normal'].forEach(k => {
      const A = a.getAttribute(k).array, B = b.getAttribute(k).array, out = new Float32Array(A.length + B.length);
      out.set(A, 0); out.set(B, A.length); merged.setAttribute(k, new T.BufferAttribute(out, 3));
    });
    // Farbe: unten Rückseite (wird per Uniform getauscht), oben Elfenbein – als Kennwert 0/1 in der Farbe kodiert
    const na = a.getAttribute('position').count, nb = b.getAttribute('position').count, col = new Float32Array((na + nb) * 3);
    for (let i = 0; i < na + nb; i++) { const top = i >= na ? 1 : 0; col[i * 3] = top; col[i * 3 + 1] = top; col[i * 3 + 2] = top; }
    merged.setAttribute('color', new T.BufferAttribute(col, 3));
    a.dispose(); b.dispose();
    merged.computeBoundingSphere(); merged.computeBoundingBox();
    return merged;
  }

  // Tischfilz: runder Lichtkegel, der zum Rand hin durchsichtig wird (keine harten Kanten bei keinem Seitenverhältnis)
  function feltTexture(theme) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, theme.mat); g.addColorStop(0.55, theme.mat); g.addColorStop(0.8, theme.mat2); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const img = x.getImageData(0, 0, 256, 256), d = img.data;
    let s = 12345; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 12; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(img, 0, 0);
    x.strokeStyle = theme.rim; x.globalAlpha = 0.22; x.lineWidth = 1.5; x.beginPath(); x.arc(128, 128, 84, 0, 7); x.stroke(); x.globalAlpha = 1;
    const t = new T.CanvasTexture(c); t.anisotropy = 2;
    return t;
  }

  function Renderer(host, opts) {
    this.host = host; this.opts = opts || {};
    this._frame = this._frame.bind(this); this.raf = 0;
    const q = this.opts.quality || 'hoch';
    const gl = new T.WebGLRenderer({ antialias: q !== 'sparsam', alpha: true, powerPreference: 'default', preserveDrawingBuffer: false });
    this.gl = gl;
    gl.setClearColor(0x000000, 0);
    gl.outputEncoding = T.sRGBEncoding;
    gl.domElement.className = 'stage-canvas';
    host.appendChild(gl.domElement);
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(32, 1, 0.1, 400);
    this.hemi = new T.HemisphereLight(0xfff8ee, 0x3a3f4a, 0.72); this.scene.add(this.hemi);
    this.sun = new T.DirectionalLight(0xffffff, 0.78); this.sun.position.set(-6, 14, 9); this.scene.add(this.sun); this.scene.add(this.sun.target);
    this.fill = new T.DirectionalLight(0xbcd2ff, 0.18); this.fill.position.set(8, 6, -6); this.scene.add(this.fill);
    this.bodyGeo = makeBodyGeometry();
    this.backColor = new T.Color(BACKS.jade).convertSRGBToLinear(); this.ivory = new T.Color('#f7f0e0').convertSRGBToLinear();
    this.bodyMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.0 });
    const self = this;
    this.bodyMat.onBeforeCompile = function (sh) {
      sh.uniforms.backCol = { value: self.backColor }; sh.uniforms.ivoryCol = { value: self.ivory };
      // vColor: x = Kennwert (0 Rückseite, 1 Elfenbein) × Instanz-Tönung (die Tönung steckt in allen drei Kanälen gleich, außer bei Hervorhebung)
      sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', [
        '#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )',
        '  vColor = vec3( 1.0 );',
        '#endif',
        '#ifdef USE_COLOR',
        '  vColor = mix( backCol, ivoryCol, color.x );',
        '#endif',
        '#ifdef USE_INSTANCING_COLOR',
        '  vColor.xyz *= instanceColor.xyz;',
        '#endif'].join('\n'));
      sh.vertexShader = 'uniform vec3 backCol;\nuniform vec3 ivoryCol;\n' + sh.vertexShader;
    };
    this.bodyMat.customProgramCacheKey = () => 'mj-body';
    this.faceGeoBase = new T.PlaneGeometry(TW * 0.86, TH * 0.86); this.faceGeoBase.rotateX(-Math.PI / 2);
    this.faceMat = new T.MeshStandardMaterial({ roughness: 0.5, metalness: 0.0 });
    const sc = root.MJFaces.scale;
    this.faceMat.onBeforeCompile = function (sh) {
      sh.uniforms.faceScale = { value: new T.Vector2(sc[0], sc[1]) };
      sh.vertexShader = 'attribute vec2 faceOff;\nuniform vec2 faceScale;\n' + sh.vertexShader.replace('#include <uv_vertex>',
        '#include <uv_vertex>\n#ifdef USE_UV\n  vUv = uv * faceScale + faceOff;\n#endif');
    };
    this.faceMat.customProgramCacheKey = () => 'mj-face';
    // Tisch
    this.table = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true, depthWrite: false }));
    this.table.rotation.x = -Math.PI / 2; this.table.position.y = -0.002; this.table.receiveShadow = true;
    this.scene.add(this.table);
    // Cursor-Rahmen (Tastatur/Controller)
    const cs = new T.Shape(), hole = new T.Path(), cw = TW * 1.08, ch = TH * 1.06, iw = TW * 0.9, ih = TH * 0.9;
    cs.moveTo(-cw / 2, -ch / 2); cs.lineTo(cw / 2, -ch / 2); cs.lineTo(cw / 2, ch / 2); cs.lineTo(-cw / 2, ch / 2); cs.lineTo(-cw / 2, -ch / 2);
    hole.moveTo(-iw / 2, -ih / 2); hole.lineTo(-iw / 2, ih / 2); hole.lineTo(iw / 2, ih / 2); hole.lineTo(iw / 2, -ih / 2); hole.lineTo(-iw / 2, -ih / 2);
    cs.holes.push(hole);
    const cg = new T.ShapeGeometry(cs); cg.rotateX(-Math.PI / 2);
    this.cursor = new T.Mesh(cg, new T.MeshBasicMaterial({ color: 0x4fe3ff, transparent: true, opacity: 0.95, depthTest: false }));
    this.cursor.renderOrder = 10; this.cursor.visible = false; this.scene.add(this.cursor);
    // Funken
    this.sparkN = 240;
    const sg = new T.BufferGeometry();
    this.sparkPos = new Float32Array(this.sparkN * 3); this.sparkCol = new Float32Array(this.sparkN * 3);
    this.sparkVel = new Float32Array(this.sparkN * 3); this.sparkLife = new Float32Array(this.sparkN);
    sg.setAttribute('position', new T.BufferAttribute(this.sparkPos, 3)); sg.setAttribute('color', new T.BufferAttribute(this.sparkCol, 3));
    this.sparks = new T.Points(sg, new T.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    this.sparks.frustumCulled = false; this.sparks.visible = false; this.scene.add(this.sparks);
    this.sparkNext = 0; this.sparkActive = 0;

    this.view = { yaw: 0, pitch: 24 * Math.PI / 180, zoom: 1, panX: 0, panZ: 0 };
    this.viewGoal = null;
    this.margins = { t: 70, b: 86, l: 10, r: 10 };
    this.anims = []; this.raf = 0; this.dirty = true;
    this.tint = null; this.state = null;
    this.setQuality(q);
    this.setTheme('jade');
    this.resize();
    this._ro = root.ResizeObserver ? new ResizeObserver(() => this.resize()) : null;
    if (this._ro) this._ro.observe(host); else root.addEventListener('resize', () => this.resize());
    gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); if (this.opts.onLost) this.opts.onLost(); });
  }

  Renderer.prototype = {
    setQuality(q) {
      this.quality = q;
      const dpr = root.devicePixelRatio || 1;
      this.gl.setPixelRatio(Math.min(dpr, q === 'hoch' ? 2 : q === 'mittel' ? 1.5 : 1));
      const sh = q !== 'sparsam';
      this.gl.shadowMap.enabled = sh; this.gl.shadowMap.type = T.PCFSoftShadowMap;
      this.sun.castShadow = sh;
      if (sh) {
        const s = q === 'hoch' ? 2048 : 1024;
        this.sun.shadow.mapSize.set(s, s); this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.02;
        if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
      }
      this.bodyMat.needsUpdate = true; this.faceMat.needsUpdate = true; this.table.material.needsUpdate = true;
      this.resize();
    },
    setTheme(id) {
      const th = THEMES[id] || THEMES.jade; this.themeId = id;
      if (this.table.material.map) this.table.material.map.dispose();
      this.table.material.map = feltTexture(th); this.table.material.map.encoding = T.sRGBEncoding; this.table.material.needsUpdate = true;
      if (this.opts.onTheme) this.opts.onTheme(th);
      this.invalidate();
      return th;
    },
    setBack(id) { this.backColor.set(BACKS[id] || BACKS.jade).convertSRGBToLinear(); this.invalidate(); },
    setAtlas(canvas) {
      if (this.atlas) this.atlas.dispose();
      const t = new T.CanvasTexture(canvas);
      t.encoding = T.sRGBEncoding; t.anisotropy = Math.min(4, this.gl.capabilities.getMaxAnisotropy());
      t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
      this.atlas = t; this.faceMat.map = t; this.faceMat.needsUpdate = true; this.invalidate();
    },

    // ---------- Brett ----------
    setBoard(layout, faces, alive) {
      this.clearBoard();
      const n = layout.tiles.length;
      this.layout = layout; this.n = n; this.faces = Int8Array.from(faces); this.alive = Uint8Array.from(alive);
      this.bodies = new T.InstancedMesh(this.bodyGeo, this.bodyMat, n);
      this.bodies.castShadow = true; this.bodies.receiveShadow = true;
      const fg = this.faceGeoBase.clone();
      this.faceOff = new T.InstancedBufferAttribute(new Float32Array(n * 2), 2);
      fg.setAttribute('faceOff', this.faceOff);
      this.facesMesh = new T.InstancedMesh(fg, this.faceMat, n);
      this.facesMesh.receiveShadow = true;
      this.bodies.instanceMatrix.setUsage(T.DynamicDrawUsage); this.facesMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      // Mittelpunkt
      this.w = layout.w / 2 * TW; this.h = layout.h / 2 * TH;
      this.base = layout.tiles.map(t => new T.Vector3((t.x / 2 + 0.5) * TW - this.w / 2, t.z * TD, (t.y / 2 + 0.5) * TH - this.h / 2));
      this.top = layout.layers * TD;
      this.tintArr = new Array(n).fill(null);
      this.lift = new Float32Array(n);
      for (let i = 0; i < n; i++) { this._setFace(i); this.bodies.setColorAt(i, WHITE); this.facesMesh.setColorAt(i, WHITE); }
      this.faceOff.needsUpdate = true;
      this.scene.add(this.bodies); this.scene.add(this.facesMesh);
      // Tisch und Schatten passend zum Brett
      const ts = Math.max(this.w, this.h) * 2.4 + 4;
      this.table.scale.set(ts, ts, 1);
      const sc = this.sun.shadow.camera, ext = Math.max(this.w, this.h) * 0.75 + 2;
      sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 60; sc.updateProjectionMatrix();
      this.sun.position.set(-6, 14, 9); this.sun.target.position.set(0, 0, 0);
      this.anims = [];
      this.updateAll();
      this.fit();
    },
    clearBoard() {
      if (this.bodies) { this.scene.remove(this.bodies); this.bodies.dispose(); this.bodies = null; }
      if (this.facesMesh) { this.scene.remove(this.facesMesh); this.facesMesh.geometry.dispose(); this.facesMesh.dispose(); this.facesMesh = null; }
      this.cursor.visible = false; this.anims = [];
    },
    _setFace(i) { const uv = root.MJFaces.uvOf(this.faces[i]); this.faceOff.setXY(i, uv[0], uv[1]); },
    setFaces(faces) { for (let i = 0; i < this.n; i++) { this.faces[i] = faces[i]; this._setFace(i); } this.faceOff.needsUpdate = true; this.invalidate(); },
    // tint: Funktion i -> Farbe (THREE.Color oder null = weiß); lift: Anheben ausgewählter Steine
    setTints(fn, liftFn) {
      if (!this.bodies) return;
      for (let i = 0; i < this.n; i++) {
        const c = fn(i) || WHITE; this.bodies.setColorAt(i, c); this.facesMesh.setColorAt(i, c);
        this.lift[i] = liftFn ? liftFn(i) : 0;
      }
      this.bodies.instanceColor.needsUpdate = true; this.facesMesh.instanceColor.needsUpdate = true;
      this.updateAll();
    },
    setAlive(alive) { for (let i = 0; i < this.n; i++) this.alive[i] = alive[i]; this.updateAll(); },
    _matrix(i, pos, scale, rotY, tilt) {
      M.makeRotationY(rotY || 0);
      if (tilt) { M2.makeRotationX(tilt); M.multiply(M2); }
      M.scale(V.set(scale, scale, scale));
      M.setPosition(pos);
      this.bodies.setMatrixAt(i, M);
      // Bild: oben auf dem Körper
      V2.set(0, TD + 0.004, 0).applyMatrix4(M3.copy(M).setPosition(0, 0, 0));
      M.setPosition(V2.add(pos));
      this.facesMesh.setMatrixAt(i, M);
    },
    updateAll() {
      if (!this.bodies) return;
      const animated = new Set(this.anims.map(a => a.i));
      for (let i = 0; i < this.n; i++) {
        if (animated.has(i)) continue;
        if (this.alive[i]) this._matrix(i, P.copy(this.base[i]).setY(this.base[i].y + this.lift[i]), 1, 0);
        else this._matrix(i, P.copy(this.base[i]), 0, 0);
      }
      this.bodies.instanceMatrix.needsUpdate = true; this.facesMesh.instanceMatrix.needsUpdate = true;
      this.invalidate();
    },
    // ---------- Animationen ----------
    animate(type, i, extra) {
      this.anims = this.anims.filter(a => a.i !== i);
      this.anims.push(Object.assign({ type, i, t0: performance.now(), dur: type === 'remove' ? 520 : type === 'appear' ? 380 : type === 'shake' ? 360 : type === 'spin' ? 640 : 400 }, extra || {}));
      this.invalidate();
    },
    removePair(a, b) {
      const mid = new T.Vector3().addVectors(this.base[a], this.base[b]).multiplyScalar(0.5);
      mid.y = Math.max(this.base[a].y, this.base[b].y) + 1.4;
      this.alive[a] = 0; this.alive[b] = 0;
      this.animate('remove', a, { to: mid.clone(), side: -1 });
      this.animate('remove', b, { to: mid.clone(), side: 1 });
      this.burst(mid, 26, [1, 0.85, 0.4]);
    },
    restorePair(a, b) { this.alive[a] = 1; this.alive[b] = 1; this.animate('appear', a); this.animate('appear', b); },
    shake(i) { this.animate('shake', i); },
    spinAll(onMid) {
      const t0 = performance.now();
      this.anims = this.anims.filter(a => !this.alive[a.i]);
      for (let i = 0; i < this.n; i++) if (this.alive[i]) this.anims.push({ type: 'spin', i, t0: t0 + (i % 12) * 12, dur: 620 });
      setTimeout(() => { if (onMid) onMid(); }, 320);
      this.invalidate();
    },
    burst(pos, count, rgb, spread) {
      spread = spread || 1;
      for (let k = 0; k < count; k++) {
        const j = this.sparkNext; this.sparkNext = (this.sparkNext + 1) % this.sparkN;
        this.sparkPos[j * 3] = pos.x; this.sparkPos[j * 3 + 1] = pos.y; this.sparkPos[j * 3 + 2] = pos.z;
        const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = (1.5 + Math.random() * 2.5) * spread;
        this.sparkVel[j * 3] = Math.cos(a) * Math.sqrt(1 - u * u) * s; this.sparkVel[j * 3 + 1] = Math.abs(u) * s + 1.2; this.sparkVel[j * 3 + 2] = Math.sin(a) * Math.sqrt(1 - u * u) * s;
        const c = rgb || [Math.random(), Math.random(), Math.random()];
        this.sparkCol[j * 3] = c[0]; this.sparkCol[j * 3 + 1] = c[1]; this.sparkCol[j * 3 + 2] = c[2];
        this.sparkLife[j] = 0.7 + Math.random() * 0.5;
      }
      this.sparks.visible = true; this.sparkActive = 1; this.invalidate();
    },
    fireworks() {
      const cols = [[1, 0.8, 0.3], [1, 0.4, 0.5], [0.4, 0.9, 1], [0.6, 1, 0.5], [1, 0.6, 1]];
      for (let k = 0; k < 6; k++) setTimeout(() => {
        this.burst(new T.Vector3((Math.random() - 0.5) * this.w, 2 + Math.random() * 2, (Math.random() - 0.5) * this.h), 40, cols[k % cols.length], 1.4);
      }, k * 260);
    },
    _stepSparks(dt) {
      let alive = 0;
      for (let j = 0; j < this.sparkN; j++) {
        if (this.sparkLife[j] <= 0) { this.sparkPos[j * 3 + 1] = -100; continue; }
        this.sparkLife[j] -= dt; alive++;
        this.sparkVel[j * 3 + 1] -= 6 * dt;
        this.sparkPos[j * 3] += this.sparkVel[j * 3] * dt; this.sparkPos[j * 3 + 1] += this.sparkVel[j * 3 + 1] * dt; this.sparkPos[j * 3 + 2] += this.sparkVel[j * 3 + 2] * dt;
        const f = Math.max(0, Math.min(1, this.sparkLife[j] * 1.6));
        this.sparkCol[j * 3] *= 0.985; this.sparkCol[j * 3 + 1] *= 0.985; this.sparkCol[j * 3 + 2] *= 0.985;
        if (f <= 0) this.sparkPos[j * 3 + 1] = -100;
      }
      this.sparks.geometry.attributes.position.needsUpdate = true; this.sparks.geometry.attributes.color.needsUpdate = true;
      if (!alive) { this.sparks.visible = false; this.sparkActive = 0; }
    },
    _stepAnims(now) {
      if (!this.bodies || !this.anims.length) return;
      const keep = [];
      for (const a of this.anims) {
        const t = Math.min(1, Math.max(0, (now - a.t0) / a.dur)), i = a.i, b = this.base[i];
        if (a.type === 'remove') {
          const e = t * t * (3 - 2 * t);
          P.lerpVectors(b, a.to, e); P.x += a.side * Math.sin(t * Math.PI) * 0.35;
          this._matrix(i, P, 1 - e * 0.85, a.side * e * 1.2, -e * 0.5);
          if (t >= 1) this._matrix(i, b, 0, 0);
        } else if (a.type === 'appear') {
          const e = 1 - Math.pow(1 - t, 3);
          P.copy(b); P.y += (1 - e) * 1.6 + this.lift[i];
          this._matrix(i, P, 0.4 + 0.6 * e, (1 - e) * 1.5);
        } else if (a.type === 'shake') {
          P.copy(b); P.x += Math.sin(t * Math.PI * 6) * 0.08 * (1 - t); P.y += this.lift[i];
          this._matrix(i, P, 1, 0);
        } else if (a.type === 'spin') {
          const e = t * t * (3 - 2 * t);
          P.copy(b); P.y += Math.sin(t * Math.PI) * 0.5;
          this._matrix(i, P, 1, e * Math.PI * 2);
        }
        if (t < 1) keep.push(a);
      }
      this.anims = keep;
      this.bodies.instanceMatrix.needsUpdate = true; this.facesMesh.instanceMatrix.needsUpdate = true;
      if (!keep.length) this.updateAll();
    },

    // ---------- Kamera ----------
    setMargins(m) { Object.assign(this.margins, m); this.resize(); },
    resize() {
      const r = this.host.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      this.W = w; this.H = h;
      this.gl.setSize(w, h, false);
      this.fit(true);
    },
    _applyView(v, dist) {
      const cam = this.camera, W = this.W, H = this.H, m = this.margins;
      // Hauptpunkt in die Mitte des freien Bereichs legen (zwischen HUD oben/unten)
      const sx = m.l + (W - m.l - m.r) / 2, sy = m.t + (H - m.t - m.b) / 2;
      const fw = 2 * Math.max(sx, W - sx), fh = 2 * Math.max(sy, H - sy);
      cam.aspect = fw / fh;
      const fovFull = this._fovFor(fh);
      cam.fov = fovFull;
      cam.setViewOffset(fw, fh, fw / 2 - sx, fh / 2 - sy, W, H);
      cam.updateProjectionMatrix();
      const tx = v.panX, tz = v.panZ, ty = this.top ? this.top * 0.35 : 0;
      const sp = Math.sin(v.pitch), cp = Math.cos(v.pitch);
      cam.position.set(tx + Math.sin(v.yaw) * sp * dist, ty + cp * dist, tz + Math.cos(v.yaw) * sp * dist);
      cam.up.set(0, 1, 0);
      cam.lookAt(tx, ty, tz);
      cam.updateMatrixWorld();
    },
    _fovFor(fh) { return 2 * Math.atan(Math.tan(16 * Math.PI / 180) * fh / Math.max(1, this.H)) * 180 / Math.PI; },
    // Abstand, bei dem das ganze Brett in den freien Bereich passt
    _fitDist(v) {
      if (!this.bodies) return 30;
      const m = this.margins, W = this.W, H = this.H;
      const x0 = -1 + 2 * m.l / W, x1 = 1 - 2 * m.r / W, y0 = -1 + 2 * m.b / H, y1 = 1 - 2 * m.t / H;
      const hw = this.w / 2 + 0.15, hh = this.h / 2 + 0.15, top = this.top;
      const pts = [];
      [-hw, hw].forEach(x => [-hh, hh].forEach(z => [0, top].forEach(y => pts.push(new T.Vector3(x, y, z)))));
      let lo = 2, hi = 400;
      const vv = { yaw: v.yaw, pitch: v.pitch, zoom: 1, panX: 0, panZ: 0 };
      for (let k = 0; k < 26; k++) {
        const mid = (lo + hi) / 2; this._applyView(vv, mid);
        let ok = true;
        for (const p of pts) { V.copy(p).project(this.camera); if (V.x < x0 || V.x > x1 || V.y < y0 || V.y > y1 || V.z > 1) { ok = false; break; } }
        if (ok) hi = mid; else lo = mid;
      }
      return hi;
    },
    fit(keep) {
      if (!keep) { this.view.zoom = 1; this.view.panX = 0; this.view.panZ = 0; }
      this.fitDist = this._fitDist(this.view);
      this._place();
    },
    _place() {
      const v = this.view;
      this.clampPan();
      this._applyView(v, this.fitDist / v.zoom);
      this.invalidate();
    },
    clampPan() {
      const v = this.view, extra = v.zoom > 1 ? 1 : 0;
      const ex = (this.w || 0) / 2 * (1 - 1 / v.zoom) + extra, ez = (this.h || 0) / 2 * (1 - 1 / v.zoom) + extra;
      v.panX = Math.max(-ex, Math.min(ex, v.panX)); v.panZ = Math.max(-ez, Math.min(ez, v.panZ));
    },
    zoomBy(f, cx, cy) {
      const v = this.view, old = v.zoom;
      v.zoom = Math.max(1, Math.min(3.2, v.zoom * f));
      if (cx !== undefined && v.zoom !== old) {   // zum Finger/Mauszeiger hin zoomen
        const p = this.groundAt(cx, cy);
        if (p) { const k = 1 - old / v.zoom; v.panX += (p.x - v.panX) * k; v.panZ += (p.z - v.panZ) * k; }
      }
      if (v.zoom === 1) { v.panX = 0; v.panZ = 0; }
      this._place();
    },
    panBy(dxPx, dyPx) {
      const v = this.view; if (v.zoom <= 1) return;
      const scale = (this.fitDist / v.zoom) * Math.tan(16 * Math.PI / 180) * 2 / this.H;
      const c = Math.cos(v.yaw), s = Math.sin(v.yaw);
      const dx = -dxPx * scale, dz = -dyPx * scale / Math.max(0.5, Math.cos(v.pitch));
      v.panX += dx * c + dz * s; v.panZ += -dx * s + dz * c;
      this._place();
    },
    rotateBy(dyaw, dpitch) {
      const v = this.view;
      v.yaw = Math.max(-0.75, Math.min(0.75, v.yaw + dyaw));
      v.pitch = Math.max(0.12, Math.min(1.0, v.pitch + (dpitch || 0)));
      this.fitDist = this._fitDist(v); this._place();
    },
    resetView(pitchDeg) {
      this.view.yaw = 0; this.view.pitch = (pitchDeg || this.defaultPitch || 24) * Math.PI / 180;
      this.fit(false);
    },
    setDefaultPitch(deg) { this.defaultPitch = deg; },
    groundAt(cx, cy) {
      const r = this.gl.domElement.getBoundingClientRect();
      RAY.setFromCamera(V2D.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), this.camera);
      const out = new T.Vector3();
      return RAY.ray.intersectPlane(PLANE, out) ? out : null;
    },

    // ---------- Auswahl per Zeiger ----------
    // Ergebnis: Index des getroffenen (lebenden) Steins oder -1
    pick(cx, cy) {
      if (!this.bodies) return -1;
      const r = this.gl.domElement.getBoundingClientRect();
      RAY.setFromCamera(V2D.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), this.camera);
      const hits = RAY.intersectObject(this.bodies, false);
      for (const h of hits) if (h.instanceId !== undefined && this.alive[h.instanceId]) return h.instanceId;
      return -1;
    },
    // Bildschirmposition (Mitte der Oberseite) eines Steins, in CSS-Pixeln relativ zum Fenster
    screenOf(i) {
      const r = this.gl.domElement.getBoundingClientRect();
      V.copy(this.base[i]); V.y += TD + this.lift[i]; V.project(this.camera);
      return { x: r.left + (V.x + 1) / 2 * r.width, y: r.top + (1 - V.y) / 2 * r.height };
    },
    tilePx() {   // ungefähre Breite eines Steins auf dem Bildschirm
      if (!this.bodies) return 40;
      const a = V.set(0, 0, 0).project(this.camera).clone(), b = V.set(TW, 0, 0).project(this.camera);
      return Math.abs(b.x - a.x) / 2 * this.W;
    },
    nearest(cx, cy, list, maxPx) {
      let best = -1, bd = maxPx * maxPx;
      for (const i of list) { const p = this.screenOf(i), d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy); if (d < bd) { bd = d; best = i; } }
      return best;
    },
    setCursor(i) {
      if (i < 0 || !this.bodies || !this.alive[i]) { if (this.cursor.visible) { this.cursor.visible = false; this.invalidate(); } return; }
      this.cursor.visible = true;
      this.cursor.position.copy(this.base[i]); this.cursor.position.y += TD + this.lift[i] + 0.01;
      this.invalidate();
    },

    // ---------- Zeichnen ----------
    invalidate() { if (!this.raf) this.raf = requestAnimationFrame(this._frame); },
    _frame(now) {
      this.raf = 0;
      const dt = Math.min(0.05, (now - (this.lastT || now)) / 1000); this.lastT = now;
      this._stepAnims(now);
      if (this.sparkActive) this._stepSparks(dt);
      if (this.viewGoal) this._stepView(now);
      if (this.onFrame) this.onFrame(dt);
      this.gl.render(this.scene, this.camera);
      if (this.anims.length || this.sparkActive || this.viewGoal || this.keepRunning) this.invalidate();
      else this.lastT = 0;
    },
    _stepView() { this.viewGoal = null; },
    snapshot() { this.gl.render(this.scene, this.camera); return this.gl.domElement; },
    dispose() { this.clearBoard(); if (this._ro) this._ro.disconnect(); this.gl.dispose(); }
  };

  const WHITE = new T.Color(1, 1, 1), M = new T.Matrix4(), M2 = new T.Matrix4(), M3 = new T.Matrix4();
  const V = new T.Vector3(), V2 = new T.Vector3(), P = new T.Vector3(), V2D = new T.Vector2();
  const RAY = new T.Raycaster(), PLANE = new T.Plane(new T.Vector3(0, 1, 0), 0);

  root.MJRender = { Renderer, THEMES, BACKS, TW, TH, TD };
})(window);
