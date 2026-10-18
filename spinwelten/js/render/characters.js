/* Spinwelten 3D – Begleiter-Modelle (12 eigene Figuren aus Grundformen) und die Bühne für Begleiter und Truhen. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  function eyes(g, y, z, sx, r, M) {
    const w = M.mat('#ffffff', { em: '#ffffff', emi: 0.35 }), b = M.mat('#14204a', { rough: 0.3 });
    for (const s of [-1, 1]) { g.add(M.mesh(M.sph(r, 12, 10), w, s * sx, y, z, false)); g.add(M.mesh(M.sph(r * 0.55, 10, 8), b, s * sx, y + r * 0.1, z + r * 0.6, false)); }
  }
  // Jede Figur ist ungefähr 2 Einheiten hoch, steht auf y=0
  const SHAPES = {
    kivi(g, c, c2, M) {
      const body = M.mesh(M.sph(0.75, 20, 14), M.mat(c, { rough: 0.35, metal: 0.3 }), 0, 1.1, 0); g.add(body);
      const ring = M.mesh(M.tor(0.78, 0.07, 8, 32), M.mat(c2, { metal: 0.8, rough: 0.3 }), 0, 1.1, 0); ring.rotation.x = Math.PI / 2; g.add(ring);
      const needle = M.mesh(M.cone(0.12, 0.7, 4), M.mat('#ff6b6b'), 0, 1.95, 0); needle.userData.wiggle = 1; g.add(needle);
      for (const s of [-1, 1]) { const w = M.mesh(M.sph(0.4, 10, 6), M.mat('#7bd88f', { side: 1 }), s * 0.85, 1.2, 0); w.scale.set(1, 0.2, 0.6); w.userData.flap = s; g.add(w); }
      eyes(g, 1.2, 0.6, 0.22, 0.13, M);
    },
    crystal(g, c, c2, M) {
      const k = M.mesh(M.oct(0.8), M.mat(c, { em: c2, emi: 0.5, rough: 0.15, flat: true }), 0, 1.2, 0); k.scale.set(0.8, 1.3, 0.8); k.userData.spinY = 0.8; g.add(k);
      for (let i = 0; i < 3; i++) { const s = M.mesh(M.oct(0.22), M.mat(c2, { em: c2, emi: 0.7 }), Math.cos(i * 2.1) * 1.1, 1.2, Math.sin(i * 2.1) * 1.1); s.userData.orbit = i; g.add(s); }
      eyes(g, 1.3, 0.48, 0.18, 0.1, M);
    },
    fox(g, c, c2, M) {
      const body = M.mesh(M.sph(0.6, 16, 12), M.mat(c), 0, 0.7, 0); body.scale.set(1, 0.9, 1.2); g.add(body);
      const head = M.mesh(M.sph(0.5, 16, 12), M.mat(c), 0, 1.45, 0.35); g.add(head);
      g.add(M.mesh(M.sph(0.3, 12, 10), M.mat(c2), 0, 1.3, 0.7));
      for (const s of [-1, 1]) g.add(M.mesh(M.cone(0.18, 0.45, 6), M.mat(c), s * 0.3, 1.95, 0.3));
      const tail = M.mesh(M.sph(0.35, 12, 8), M.mat(c2), 0, 0.9, -0.85); tail.scale.set(0.8, 0.8, 1.6); tail.userData.wag = 1; g.add(tail);
      eyes(g, 1.55, 0.78, 0.2, 0.09, M);
    },
    golem(g, c, c2, M) {
      g.add(M.mesh(M.rbox(1.3, 1.1, 0.9, 0.2), M.mat(c, { rough: 0.9, flat: true }), 0, 0.35, 0));
      g.add(M.mesh(M.rbox(0.9, 0.7, 0.75, 0.18), M.mat(c, { rough: 0.9 }), 0, 1.45, 0.05));
      const rune = M.mesh(M.oct(0.2), M.mat(c2, { em: c2, emi: 1 }), 0, 1.0, 0.48); rune.userData.glow = 1; g.add(rune);
      for (const s of [-1, 1]) g.add(M.mesh(M.rbox(0.35, 0.9, 0.4, 0.12), M.mat(c, { rough: 0.9 }), s * 0.85, 0.5, 0));
      eyes(g, 1.55, 0.43, 0.2, 0.09, M);
    },
    spark(g, c, c2, M) {
      const core = M.mesh(M.ico(0.6, 1), M.mat(c, { em: c, emi: 0.7, flat: true }), 0, 1.2, 0); core.userData.spinY = 2; g.add(core);
      for (let i = 0; i < 5; i++) { const b = M.mesh(M.cone(0.1, 0.6, 4), M.mat(c2, { em: c2, emi: 1 }), 0, 1.2, 0); b.rotation.z = i * 1.256; b.translateY(0.8); g.add(b); }
      eyes(g, 1.3, 0.5, 0.2, 0.11, M);
    },
    robot(g, c, c2, M) {
      g.add(M.mesh(M.rbox(1.0, 0.9, 0.8, 0.15), M.mat(c, { metal: 0.6, rough: 0.35 }), 0, 0.45, 0));
      g.add(M.mesh(M.rbox(0.85, 0.65, 0.7, 0.15), M.mat(c, { metal: 0.6, rough: 0.35 }), 0, 1.35, 0));
      g.add(M.mesh(M.cyl(0.03, 0.03, 0.4, 5), M.mat('#888'), 0, 1.85, 0));
      const bulb = M.mesh(M.sph(0.1, 8, 6), M.mat(c2, { em: c2, emi: 1 }), 0, 2.08, 0); bulb.userData.glow = 1; g.add(bulb);
      const scr = M.mesh(M.box(0.6, 0.3, 0.02), M.mat('#13284a', { em: '#3fd8e8', emi: 0.3 }), 0, 1.38, 0.36); g.add(scr);
      for (const s of [-1, 1]) { const e = M.mesh(M.sph(0.06, 8, 6), M.mat('#9ff0ff', { em: '#9ff0ff', emi: 1 }), s * 0.14, 1.4, 0.38); g.add(e); }
      for (const s of [-1, 1]) M.put(g, M.mesh(M.cyl(0.18, 0.18, 0.15, 12), M.mat('#333'), s * 0.4, 0.05, 0)).rotation.z = Math.PI / 2;
    },
    owl(g, c, c2, M) {
      const b = M.mesh(M.sph(0.7, 16, 12), M.mat(c), 0, 0.95, 0); b.scale.set(1, 1.25, 0.9); g.add(b);
      M.put(g, M.mesh(M.sph(0.45, 12, 10), M.mat(c2), 0, 0.8, 0.35)).scale.set(1, 1.2, 0.5);
      for (const s of [-1, 1]) g.add(M.mesh(M.cone(0.15, 0.4, 5), M.mat(c), s * 0.38, 1.9, 0));
      for (const s of [-1, 1]) { const w = M.mesh(M.sph(0.35, 10, 8), M.mat(c), s * 0.7, 0.95, -0.05); w.scale.set(0.4, 1, 0.8); w.userData.flap = s * 0.4; g.add(w); }
      M.put(g, M.mesh(M.cone(0.08, 0.2, 4), M.mat('#ffb84a'), 0, 1.3, 0.62)).rotation.x = Math.PI / 2;
      eyes(g, 1.5, 0.48, 0.24, 0.16, M);
    },
    beaver(g, c, c2, M) {
      const b = M.mesh(M.sph(0.65, 16, 12), M.mat(c), 0, 0.75, 0); b.scale.set(1, 1.05, 1); g.add(b);
      g.add(M.mesh(M.sph(0.5, 14, 10), M.mat(c), 0, 1.55, 0.15));
      g.add(M.mesh(M.box(0.18, 0.15, 0.05), M.mat('#ffffff'), 0, 1.35, 0.62));
      const tail = M.mesh(M.rbox(0.6, 0.12, 0.9, 0.05), M.mat('#6a4a30'), 0, 0.2, -0.8); tail.userData.wag = 1; g.add(tail);
      const hat = M.mesh(M.cyl(0.35, 0.4, 0.2, 12), M.mat(c2), 0, 2.05, 0.1); g.add(hat);
      eyes(g, 1.65, 0.55, 0.2, 0.09, M);
    },
    jelly(g, c, c2, M) {
      const top = M.mesh(M.sph(0.75, 18, 12, 0, Math.PI / 2), M.mat(c, { op: 0.8, em: c, emi: 0.3, side: 1 }), 0, 1.0, 0); top.userData.pulseS = 1; g.add(top);
      for (let i = 0; i < 6; i++) { const t = M.mesh(M.cyl(0.05, 0.02, 0.9, 5), M.mat(c2, { em: c2, emi: 0.5 }), Math.cos(i) * 0.45, 0.55, Math.sin(i) * 0.45); t.userData.sway = i; g.add(t); }
      eyes(g, 1.3, 0.6, 0.22, 0.1, M);
    },
    bird(g, c, c2, M) {
      const b = M.mesh(M.sph(0.6, 16, 12), M.mat(c), 0, 1.0, 0); b.scale.set(1, 0.95, 1.2); g.add(b);
      M.put(g, M.mesh(M.cone(0.12, 0.35, 5), M.mat('#ffb84a'), 0, 1.05, 0.75)).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) { const w = M.mesh(M.sph(0.45, 10, 6), M.mat(c2), s * 0.7, 1.15, -0.1); w.scale.set(1, 0.18, 0.6); w.userData.flap = s; g.add(w); }
      const crest = M.mesh(M.cone(0.12, 0.45, 5), M.mat(c2), 0, 1.65, 0.1); g.add(crest);
      eyes(g, 1.2, 0.5, 0.22, 0.1, M);
    },
    planet(g, c, c2, M) {
      const p = M.mesh(M.sph(0.7, 20, 14), M.mat(c, { rough: 0.5 }), 0, 1.2, 0); p.userData.spinY = 0.5; g.add(p);
      const ring = M.mesh(M.tor(1.05, 0.06, 6, 40), M.mat(c2, { em: c2, emi: 0.5 }), 0, 1.2, 0); ring.rotation.x = 1.2; g.add(ring);
      const moon = M.mesh(M.sph(0.16, 10, 8), M.mat('#e8e8ff'), 1.3, 1.2, 0); moon.userData.orbit = 0; g.add(moon);
      eyes(g, 1.3, 0.62, 0.2, 0.1, M);
    },
    sunflower(g, c, c2, M) {
      g.add(M.mesh(M.cyl(0.08, 0.1, 1.1, 6), M.mat('#4caf50'), 0, 0.55, 0));
      const head = M.grp(); head.position.set(0, 1.4, 0.05); g.add(head);
      M.put(head, M.mesh(M.cyl(0.42, 0.42, 0.15, 18), M.mat(c2), 0, 0, 0)).rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) { const pt = M.mesh(M.sph(0.22, 8, 6), M.mat(c), Math.cos(i * 0.524) * 0.6, Math.sin(i * 0.524) * 0.6, 0); pt.scale.set(1, 0.5, 0.3); pt.rotation.z = i * 0.524; head.add(pt); }
      head.userData.spinZ = 0.3;
      for (const s of [-1, 1]) M.put(g, M.mesh(M.sph(0.25, 8, 6), M.mat('#66bb6a'), s * 0.3, 0.5, 0)).scale.set(1, 0.3, 0.6);
      eyes(head, 0.05, 0.08, 0.15, 0.08, M);
    }
  };
  function model(def, lvl) {
    const M = Mo(), g = M.grp(), f = SHAPES[def.shape] || SHAPES.kivi;
    f(g, def.col, def.col2, M);
    // ab Stufe 5 Glanzring, ab 10 Krone
    if ((lvl || 1) >= 5) { const r = M.mesh(M.tor(0.9, 0.04, 6, 36), M.basic('#ffe680', 0.7, true), 0, 0.05, 0, false); r.rotation.x = Math.PI / 2; g.add(r); }
    if ((lvl || 1) >= 10) { const c = M.mesh(M.cyl(0.25, 0.3, 0.18, 6), M.mat('#ffd75e', { metal: 0.9, rough: 0.2 }), 0, 2.35, 0, false); g.add(c); }
    return g;
  }
  function animateModel(g, t, dt) {
    g.traverse(o => {
      const u = o.userData;
      if (u.flap) o.rotation.z = u.flap * (0.25 + Math.sin(t * 10) * 0.35);
      if (u.wag) o.rotation.y = Math.sin(t * 5) * 0.4;
      if (u.spinY) o.rotation.y += dt * u.spinY;
      if (u.spinZ) o.rotation.z += dt * u.spinZ;
      if (u.wiggle) o.rotation.z = Math.sin(t * 3) * 0.3;
      if (u.orbit !== undefined) { const a = t * 1.5 + u.orbit * 2.1; o.position.x = Math.cos(a) * 1.15; o.position.z = Math.sin(a) * 1.15; }
      if (u.sway !== undefined) o.rotation.x = Math.sin(t * 2 + u.sway) * 0.25;
      if (u.pulseS) o.scale.set(1 + Math.sin(t * 3) * 0.05, 1 - Math.sin(t * 3) * 0.05, 1 + Math.sin(t * 3) * 0.05);
    });
  }
  // Bühne: zeigt einen Begleiter oder eine Truhe
  class Stage {
    constructor() {
      const THREE = T(), M = Mo();
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#162a5c');
      this.camera = new THREE.PerspectiveCamera(36, 1, 0.3, 100); this.camera.position.set(0, 2.2, 7); this.camera.lookAt(0, 1.1, 0);
      this.scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x2a1a40, 0.95));
      const k = new THREE.DirectionalLight(0xfff0d8, 0.9); k.position.set(3, 5, 4); this.scene.add(k);
      this.base = M.mesh(M.cyl(1.6, 1.8, 0.4, 32), M.mat('#24386e', { rough: 0.4, metal: 0.3 }), 0, -0.2, 0, false); this.scene.add(this.base);
      const rim = M.mesh(M.tor(1.65, 0.06, 6, 48), M.mat('#d8b26a', { metal: 0.8, rough: 0.3 }), 0, 0, 0, false); rim.rotation.x = Math.PI / 2; this.scene.add(rim);
      this.holder = M.grp(); this.scene.add(this.holder); this.fx = SW.VFX ? new SW.VFX(this.scene, 300) : null;
      this.item = null; this.chest = null; this.t = 0; this.drag = 0;
    }
    clearItem() { if (this.item) { this.holder.remove(this.item); this.item = null; } this.chest = null; }
    show(def, lvl) { this.clearItem(); this.item = model(def, lvl); this.holder.add(this.item); this.kind = 'comp'; this.holder.rotation.y = 0; }
    showChest(type) {
      const M = Mo(), c = (SW.CHESTS && SW.CHESTS[type] && SW.CHESTS[type].col) || '#b07a40';
      this.clearItem(); const g = M.grp();
      g.add(M.mesh(M.rbox(1.6, 0.9, 1.1, 0.12), M.mat(c, { rough: 0.6 }), 0, 0.45, 0));
      g.add(M.mesh(M.box(1.65, 0.12, 1.15), M.mat('#d8b26a', { metal: 0.8, rough: 0.3 }), 0, 0.85, 0));
      const lid = M.grp(); lid.position.set(0, 0.9, -0.55); g.add(lid);
      const lm = M.mesh(M.cyl(0.55, 0.55, 1.6, 16, 1), M.mat(c, { rough: 0.6 }), 0, 0, 0.55); lm.rotation.z = Math.PI / 2; lm.scale.set(1, 1, 1); lid.add(lm);
      lid.add(M.mesh(M.box(0.25, 0.3, 0.1), M.mat('#ffd75e', { metal: 0.9, rough: 0.2 }), 0, 0, 1.12));
      this.item = g; this.holder.add(g); this.chest = { lid, t: -1 }; this.kind = 'chest'; this.chestCol = c; this.holder.rotation.y = -0.4;
    }
    openChest(onDone) { if (this.chest) { this.chest.t = 0; this.chest.cb = onDone; } else if (onDone) onDone(); }
    rotate(dx) { this.drag = dx * 0.01; this.holder.rotation.y += this.drag; }
    resize(w, h) { this.camera.aspect = w / h; this.camera.fov = h > w ? 46 : 32; this.camera.updateProjectionMatrix(); }
    update(dt, t) {
      this.t = t;
      if (this.item && this.kind === 'comp') { this.holder.rotation.y += dt * 0.4; this.item.position.y = Math.sin(t * 2) * 0.06; animateModel(this.item, t, dt); }
      const ch = this.chest;
      if (ch && ch.t >= 0) {
        ch.t += dt; const u = Math.min(1, ch.t / 0.9);
        this.item.position.x = u < 0.5 ? Math.sin(ch.t * 40) * 0.04 * (1 - u) : 0;
        ch.lid.rotation.x = u < 0.45 ? 0 : -Math.min(1.9, (u - 0.45) / 0.55 * 1.9);
        if (u >= 1) { ch.t = -1; if (this.fx) this.fx.burst(new (T().Vector3)(0, 1.2, 0.3), { n: 90, color: '#ffe680', color2: this.chestCol, speed: 5, up: 5, life: 1.3 }); const cb = ch.cb; ch.cb = null; if (cb) cb(); }
      }
      if (this.fx) this.fx.update(dt);
    }
  }
  SW.Characters = { model, animateModel, Stage, SHAPES: Object.keys(SHAPES) };
})(globalThis.SW = globalThis.SW || {});
