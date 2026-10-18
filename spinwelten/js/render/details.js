/* Spinwelten 3D – animierte Inseldetails (je Welt 4–6 aus world.anim): Vögel, Boote, Glühwürmchen, Wolken, Zahnräder,
 * Wasserfall, Laternen, Fische, Rauch, Polarlicht, Funkeln, Ballons, Schmetterlinge, Schnee, Glut, Blasen, Blätter,
 * Luftschiff, Regen, Fahnen, Windmühle. Alles leichtgewichtig (Instancing/Punkte), gemeinsame Materialien. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  // Punktwolke mit eigener Bewegungsfunktion
  function field(isl, n, color, size, init, step, add) {
    const THREE = T(), p = new Float32Array(n * 3), st = [];
    for (let i = 0; i < n; i++) { const s = init(i); st.push(s); p[i * 3] = s.x; p[i * 3 + 1] = s.y; p[i * 3 + 2] = s.z; }
    const g = isl.own(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ color: new THREE.Color(color), size, transparent: true, opacity: 0.9, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, map: dotTexture() });
    const pts = new THREE.Points(g, m); pts.userData.ownMat = true; isl.items.push(pts); isl.root.add(pts);
    return { update(dt, t) { for (let i = 0; i < n; i++) { const s = st[i]; step(s, dt, t, i); p[i * 3] = s.x; p[i * 3 + 1] = s.y; p[i * 3 + 2] = s.z; } g.attributes.position.needsUpdate = true; if (add) m.opacity = 0.65 + 0.3 * Math.sin(t * 3); } };
  }
  let dt0 = null;
  function dotTexture() {
    if (dt0) return dt0;
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32); dt0 = new (T().CanvasTexture)(c); return dt0;
  }
  function instanced(isl, geo, mat, n, place) {
    const THREE = T(), im = new THREE.InstancedMesh(geo, mat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    isl.root.add(im);
    return { im, set(i, x, y, z, ry, sc, rx, rz) { e.set(rx || 0, ry || 0, rz || 0); q.setFromEuler(e); m.compose(v.set(x, y, z), q, s.set(sc, sc, sc)); im.setMatrixAt(i, m); }, done() { im.instanceMatrix.needsUpdate = true; }, place };
  }
  const D = {
    birds(isl, w) {
      const M = Mo(), n = 9, r = isl.r, wing = instanced(isl, M.box(0.7, 0.04, 0.22), M.mat('#ffffff'), n * 2);
      const b = Array.from({ length: n }, (_, i) => ({ a: i * 0.7, h: r * 0.6 + (i % 3) * 1.2, rad: r * 1.1 + (i % 4) * 1.5, sp: 0.18 + (i % 3) * 0.04 }));
      void w;
      return { update(dt, t) { b.forEach((o, i) => { o.a += dt * o.sp; const x = Math.cos(o.a) * o.rad, z = Math.sin(o.a) * o.rad, y = o.h + Math.sin(t + i) * 0.6, fl = Math.sin(t * 9 + i) * 0.6; wing.set(i * 2, x, y, z, -o.a, 1, 0, fl); wing.set(i * 2 + 1, x, y, z, -o.a, 1, 0, -fl); }); wing.done(); } };
    },
    boats(isl, w) {
      const M = Mo(), THREE = T(), list = [];
      if (!['water', 'ice', 'candy'].includes(w.sea)) return D.airship(isl, w);
      for (let i = 0; i < 3; i++) {
        const g = M.grp(); const hull = M.mesh(M.sph(1, 12, 8, Math.PI / 2, Math.PI / 2), M.mat(i % 2 ? w.pal.accent : '#9a6a3f', { side: 1 })); hull.scale.set(0.8, 0.6, 2); hull.rotation.x = Math.PI; g.add(hull);
        g.add(M.mesh(M.cyl(0.05, 0.05, 2.2, 6), M.mat('#6a4a30'), 0, 1.1, 0)); const s = M.mesh(new THREE.PlaneGeometry(1.2, 1.4), M.mat('#fff8ec', { side: 1 }), 0, 1.3, 0.1); s.rotation.y = Math.PI / 2; isl.own(s); g.add(s);
        g.userData.a = i * 2.1; isl.root.add(g); list.push(g);
      }
      const y0 = isl.sea.position.y + 0.4;
      return { update(dt, t) { list.forEach((g, i) => { g.userData.a += dt * 0.05; const R = isl.r * 2.2 + i * 6; g.position.set(Math.cos(g.userData.a) * R, y0 + Math.sin(t * 1.2 + i) * 0.35, Math.sin(g.userData.a) * R); g.rotation.y = -g.userData.a; g.rotation.z = Math.sin(t + i) * 0.08; }); } };
    },
    airship(isl, w) {
      const M = Mo(), g = M.grp(); const bal = M.mesh(M.sph(1.2, 16, 10), M.mat(w.pal.accent || '#ff7a6b')); bal.scale.set(1, 0.85, 2.0); g.add(bal);
      g.add(M.mesh(M.rbox(0.9, 0.5, 1.6, 0.1), M.mat('#9a6a3f'), 0, -1.5, 0)); for (const s of [-1, 1]) g.add(M.mesh(M.cyl(0.02, 0.02, 0.9, 4), M.mat('#3b3550'), s * 0.4, -1.0, 0));
      const prop = M.grp(); prop.add(M.mesh(M.box(0.08, 0.9, 0.06), M.mat('#d8b26a', { metal: 0.6 }))); prop.position.set(0, -1.3, -0.95); g.add(prop);
      isl.root.add(g);
      return { update(dt, t) { const a = t * 0.08, R = isl.r * 1.7; g.position.set(Math.cos(a) * R, isl.r * 0.55 + Math.sin(t * 0.5), Math.sin(a) * R); g.rotation.y = -a; prop.rotation.z += dt * 12; } };
    },
    fireflies(isl, w) { const r = isl.r; return field(isl, 70, w.pal.glow || '#fff4a0', 0.35, () => ({ x: (Math.random() - 0.5) * r * 1.5, y: 0.5 + Math.random() * 3, z: (Math.random() - 0.5) * r * 1.5, ph: Math.random() * 6 }), (s, dt, t) => { s.x += Math.sin(t * 0.7 + s.ph) * dt * 0.5; s.z += Math.cos(t * 0.6 + s.ph) * dt * 0.5; s.y += Math.sin(t * 1.3 + s.ph) * dt * 0.3; }, true); },
    sparkles(isl, w) { const r = isl.r; return field(isl, 90, w.pal.glow || '#ffffff', 0.3, () => ({ x: (Math.random() - 0.5) * r * 2.2, y: Math.random() * 8, z: (Math.random() - 0.5) * r * 2.2, v: 0.3 + Math.random() * 0.5 }), (s, dt) => { s.y += s.v * dt; if (s.y > 9) s.y = 0; }, true); },
    snow(isl) { const r = isl.r; return field(isl, 220, '#ffffff', 0.28, () => ({ x: (Math.random() - 0.5) * r * 3, y: Math.random() * 16 - 3, z: (Math.random() - 0.5) * r * 3, ph: Math.random() * 6 }), (s, dt, t) => { s.y -= dt * 1.2; s.x += Math.sin(t + s.ph) * dt * 0.4; if (s.y < -4) s.y = 13; }); },
    rain(isl) { const r = isl.r; return field(isl, 260, '#bcd6ff', 0.18, () => ({ x: (Math.random() - 0.5) * r * 3, y: Math.random() * 18 - 4, z: (Math.random() - 0.5) * r * 3 }), (s, dt) => { s.y -= dt * 14; if (s.y < -4) s.y = 14; }); },
    embers(isl) { const r = isl.r; return field(isl, 120, '#ff8a3d', 0.32, () => ({ x: (Math.random() - 0.5) * r * 2, y: Math.random() * 10 - 2, z: (Math.random() - 0.5) * r * 2, ph: Math.random() * 6 }), (s, dt, t) => { s.y += dt * 1.4; s.x += Math.sin(t * 2 + s.ph) * dt * 0.5; if (s.y > 12) s.y = -1; }, true); },
    leaves(isl, w) { const r = isl.r; return field(isl, 90, w.pal.accent2 || '#ffb35a', 0.32, () => ({ x: (Math.random() - 0.5) * r * 2, y: Math.random() * 10, z: (Math.random() - 0.5) * r * 2, ph: Math.random() * 6 }), (s, dt, t) => { s.y -= dt * 0.7; s.x += Math.sin(t * 1.5 + s.ph) * dt * 0.8; s.z += Math.cos(t * 1.1 + s.ph) * dt * 0.5; if (s.y < 0) s.y = 10; }); },
    bubbles(isl, w) {
      const M = Mo(), n = 24, b = instanced(isl, M.sph(0.25, 10, 8), M.mat('#dffaff', { op: 0.35, rough: 0.05 }), n), r = isl.r;
      const st = Array.from({ length: n }, () => ({ x: (Math.random() - 0.5) * r * 2, y: Math.random() * 10 - 2, z: (Math.random() - 0.5) * r * 2, s: 0.5 + Math.random() }));
      void w;
      return { update(dt, t) { st.forEach((o, i) => { o.y += dt * 0.8; if (o.y > 10) o.y = -2; b.set(i, o.x + Math.sin(t + i) * 0.4, o.y, o.z, 0, o.s); }); b.done(); } };
    },
    clouds(isl) {
      const M = Mo(), n = 10, c = instanced(isl, M.sph(1, 12, 8), M.mat('#ffffff', { rough: 1, op: 0.92, em: '#eef4ff', emi: 0.35 }), n * 3), r = isl.r;
      const st = Array.from({ length: n }, (_, i) => ({ a: i * 0.63, d: r * (1.5 + (i % 3) * 0.5), y: -r * 0.4 + (i % 4) * 2.5, s: 1.5 + (i % 3) }));
      return { update(dt) { st.forEach((o, i) => { o.a += dt * 0.02; const x = Math.cos(o.a) * o.d, z = Math.sin(o.a) * o.d; c.set(i * 3, x, o.y, z, 0, o.s); c.set(i * 3 + 1, x + o.s * 0.9, o.y - 0.2, z, 0, o.s * 0.7); c.set(i * 3 + 2, x - o.s * 0.8, o.y - 0.3, z + 0.3, 0, o.s * 0.65); }); c.done(); } };
    },
    gears(isl, w) {
      const M = Mo(), list = [];
      for (let i = 0; i < 3; i++) { const g = M.gearMesh(1.2 + i * 0.5, M.mat(w.pal.accent2 || '#d8b26a', { metal: 0.75, rough: 0.35 })); const a = i * 2.2 + 0.5; g.position.set(Math.cos(a) * isl.r * 1.15, 1 + i * 1.5, Math.sin(a) * isl.r * 1.15); g.rotation.y = -a + Math.PI / 2; isl.root.add(g); list.push(g); }
      return { update(dt) { list.forEach((g, i) => { g.rotation.z += dt * (i % 2 ? -0.4 : 0.5); }); } };
    },
    waterfall(isl, w) {
      const THREE = T(), c = document.createElement('canvas'); c.width = 32; c.height = 128; const x = c.getContext('2d');
      for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.25 + Math.random() * 0.5) + ')'; x.fillRect(Math.random() * 32, Math.random() * 128, 2 + Math.random() * 3, 10 + Math.random() * 30); }
      const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(w.pal.sea || '#8fd0ff').lerp(new THREE.Color('#ffffff'), 0.4), map: tex, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
      const a = 1.9, R = isl.r * 0.99, h = isl.r * 1.3;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, h), mat); pl.position.set(Math.cos(a) * R, -h / 2 + 0.1, Math.sin(a) * R); pl.rotation.y = -a + Math.PI / 2; isl.root.add(pl);
      pl.userData.own = pl.userData.ownMat = true; isl.items.push(pl);
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), mat); strip.rotation.x = -Math.PI / 2; strip.rotation.z = -a + Math.PI / 2; strip.position.set(Math.cos(a) * (R - 1.2), 0.08, Math.sin(a) * (R - 1.2)); isl.root.add(strip); strip.userData.own = true; isl.items.push(strip);
      const mist = field(isl, 40, '#ffffff', 0.6, () => ({ x: Math.cos(a) * R + (Math.random() - 0.5) * 2.5, y: -h + Math.random() * 2, z: Math.sin(a) * R + (Math.random() - 0.5) * 2.5 }), (s, dt) => { s.y += dt * 0.8; if (s.y > -h + 3) s.y = -h; });
      return { update(dt, t) { tex.offset.y = -t * 1.2; mist.update(dt, t); } };
    },
    lanterns(isl, w) {
      const M = Mo(), n = 14, L = instanced(isl, M.cyl(0.22, 0.16, 0.42, 8), M.mat(w.pal.accent || '#ffb35a', { em: w.pal.glow || '#ffd98a', emi: 0.9 }), n), r = isl.r;
      const st = Array.from({ length: n }, () => ({ x: (Math.random() - 0.5) * r * 2.4, y: Math.random() * 14, z: (Math.random() - 0.5) * r * 2.4, v: 0.4 + Math.random() * 0.4 }));
      return { update(dt, t) { st.forEach((o, i) => { o.y += dt * o.v; if (o.y > 16) o.y = 1; L.set(i, o.x + Math.sin(t * 0.5 + i) * 0.5, o.y, o.z, t * 0.2 + i, 1); }); L.done(); } };
    },
    fish(isl, w) {
      const M = Mo(), n = 5, F = instanced(isl, M.sph(0.35, 10, 6), M.mat(w.pal.accent2 || '#3fd8e8', { rough: 0.3 }), n);
      const water = ['water', 'ice', 'candy'].includes(w.sea), y0 = water ? isl.sea.position.y : 0;
      const st = Array.from({ length: n }, (_, i) => ({ a: i * 1.3, ph: i * 0.8, R: isl.r * (water ? 1.6 + i * 0.25 : 1.1 + i * 0.1) }));
      return { update(dt, t) { st.forEach((o, i) => { const k = ((t * 0.4 + o.ph) % 2); const jump = water ? Math.max(0, Math.sin(k * Math.PI)) * 3 : 2 + Math.sin(t + i); o.a += dt * 0.12; F.set(i, Math.cos(o.a) * o.R, y0 + jump - (water && k > 1 ? 3 : 0), Math.sin(o.a) * o.R, -o.a, 1, 0, Math.cos(k * Math.PI) * 0.8); }); F.done(); } };
    },
    smoke(isl) {
      const M = Mo(), n = 16, S = instanced(isl, M.sph(0.45, 8, 6), M.mat('#e8e4f0', { rough: 1, op: 0.55 }), n);
      const src = isl.slots.slice(0, 2);
      const st = Array.from({ length: n }, (_, i) => ({ s: src[i % src.length], k: i / n }));
      return { update(dt) { st.forEach((o, i) => { o.k = (o.k + dt * 0.15) % 1; const p = o.s; S.set(i, p.x + 0.6 + o.k * 1.2, p.y + 4 + o.k * 5, p.z + 0.3, 0, 0.4 + o.k * 1.4); }); S.done(); } };
    },
    aurora(isl, w) {
      const THREE = T(), list = [];
      for (let i = 0; i < 3; i++) {
        const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false,
          uniforms: { t: { value: 0 }, c: { value: new THREE.Color(i === 1 ? (w.pal.accent2 || '#ff8ae0') : (w.pal.glow || '#7dffcf')) } },
          vertexShader: 'uniform float t; varying vec2 vU; void main(){ vU = uv; vec3 p = position; p.z += sin(p.x*0.05+t*0.4)*12.0; gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0); }',
          fragmentShader: 'uniform float t; uniform vec3 c; varying vec2 vU; void main(){ float a = smoothstep(0.0,0.5,vU.y)*(1.0-vU.y)*(0.6+0.4*sin(vU.x*30.0+t)); gl_FragColor = vec4(c*a, a*0.7); }' });
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(320, 60, 40, 1), m); pl.position.set(0, 70 + i * 12, -160 + i * 25); pl.userData.own = pl.userData.ownMat = true; isl.items.push(pl); isl.root.add(pl); list.push(m);
      }
      return { update(dt, t) { list.forEach((m, i) => { m.uniforms.t.value = t + i; }); } };
    },
    balloons(isl, w) {
      const M = Mo(), n = 6, cols = [w.pal.accent, w.pal.accent2, w.pal.glow, '#ff7a6b', '#3fd8e8', '#f2d08a'];
      const list = cols.map((c, i) => { const g = M.grp(); g.add(M.mesh(M.sph(0.6, 14, 10), M.mat(c || '#ff7a6b', { rough: 0.4 }), 0, 0, 0)); g.add(M.mesh(M.cyl(0.01, 0.01, 1.4, 4), M.mat('#ffffff'), 0, -1.2, 0, false)); const a = i * 1.05; g.userData.p = [Math.cos(a) * isl.r * 0.95, 4 + i * 0.6, Math.sin(a) * isl.r * 0.95]; isl.root.add(g); return g; });
      void n;
      return { update(dt, t) { list.forEach((g, i) => { const p = g.userData.p; g.position.set(p[0] + Math.sin(t * 0.5 + i) * 0.4, p[1] + Math.sin(t * 0.9 + i) * 0.5, p[2]); }); } };
    },
    butterflies(isl, w) {
      const M = Mo(), n = 10, B = instanced(isl, M.box(0.3, 0.02, 0.2), M.mat(w.pal.accent2 || '#ff8ae0', { side: 1 }), n * 2), r = isl.r;
      const st = Array.from({ length: n }, (_, i) => ({ x: (Math.random() - 0.5) * r, z: (Math.random() - 0.5) * r, ph: i }));
      return { update(dt, t) { st.forEach((o, i) => { const x = o.x + Math.sin(t * 0.6 + o.ph) * 2, z = o.z + Math.cos(t * 0.5 + o.ph) * 2, y = 1 + Math.sin(t * 2 + o.ph) * 0.4, f = Math.sin(t * 16 + i) * 0.9; B.set(i * 2, x, y, z, t + i, 1, 0, f); B.set(i * 2 + 1, x, y, z, t + i, 1, 0, -f); }); B.done(); } };
    },
    banners(isl, w) {
      const M = Mo(), list = [];
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.2, R = isl.r * 0.9; const g = M.grp(); g.add(M.mesh(M.cyl(0.05, 0.05, 2.4, 6), M.mat('#6a4a30'), 0, 1.2, 0)); const f = M.mesh(M.box(0.9, 0.5, 0.02), M.mat(i % 2 ? w.pal.accent : w.pal.accent2, { side: 1 }), 0.46, 2.05, 0, false); g.add(f); g.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); g.rotation.y = -a; isl.root.add(g); list.push(f); }
      return { update(dt, t) { list.forEach((f, i) => { f.rotation.y = Math.sin(t * 3 + i) * 0.35; }); } };
    },
    windmill(isl, w) {
      const M = Mo(), g = M.grp(), a = 4.0, R = isl.r * 0.8;
      g.add(M.mesh(M.cyl(0.35, 0.55, 2.6, 8), M.mat('#f6ecd9'), 0, 1.3, 0)); g.add(M.mesh(M.cone(0.6, 0.8, 8), M.mat(w.pal.accent || '#d0465e'), 0, 3.0, 0));
      const hub = M.grp(); hub.position.set(0, 2.4, 0.5); for (let i = 0; i < 4; i++) { const arm = M.grp(); arm.rotation.z = i * Math.PI / 2; arm.add(M.mesh(M.box(0.2, 1.4, 0.03), M.mat('#fff8ec', { side: 1 }), 0, 0.7, 0)); hub.add(arm); } g.add(hub);
      g.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); g.rotation.y = -a + Math.PI / 2; isl.root.add(g);
      return { update(dt) { hub.rotation.z += dt * 1.2; } };
    }
  };
  SW.Details = {
    add(isl, w) {
      const out = [];
      for (const k of w.anim || []) { const f = D[k]; if (!f) continue; try { const d = f(isl, w); if (d) out.push(d); } catch (e) { if (globalThis.console) console.warn('detail', k, e); } }
      return out;
    },
    TYPES: Object.keys(D)
  };
})(globalThis.SW = globalThis.SW || {});
