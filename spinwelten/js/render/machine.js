/* Spinwelten 3D – die Runenmaschine: asymmetrisches Gehäuse (Mitternachtsblau/Messing), Kristallmotor links,
 * Steuerhebel rechts, Sternenkompass oben, drei echte Walzen-Trommeln mit je 10 Symbolfeldern.
 * spin(ids) dreht die Trommeln auf das bereits feststehende Ergebnis (gestaffelter Stopp, Ausrollen mit leichtem Nachfedern). */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  const N = 10, STEP = Math.PI * 2 / N;
  class Machine {
    constructor() {
      const THREE = T(), M = Mo();
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, 1, 0.5, 100);
      this.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a1a40, 0.85));
      const key = new THREE.DirectionalLight(0xfff0d8, 1.1); key.position.set(4, 6, 9); this.scene.add(key);
      const rim = new THREE.DirectionalLight(0x7fe8ff, 0.6); rim.position.set(-6, 3, -4); this.scene.add(rim);
      const g = this.group = new THREE.Group(); this.scene.add(g);
      const navy = M.mat('#14295a', { rough: 0.35, metal: 0.25 }), navy2 = M.mat('#0d1b3d', { rough: 0.4, metal: 0.2 });
      const brass = M.mat('#d8b26a', { rough: 0.28, metal: 0.85 }), brass2 = M.mat('#b88a40', { rough: 0.32, metal: 0.8 });
      const jade = M.mat('#2ec4a6', { rough: 0.3, metal: 0.2 }), coral = M.mat('#ff7a6b', { rough: 0.4 });
      // Sockel (abgestuft, leicht asymmetrisch nach rechts versetzt)
      g.add(M.mesh(M.rbox(7.4, 0.5, 3.0, 0.2), navy2, 0.25, -2.9, 0));
      g.add(M.mesh(M.rbox(6.8, 0.25, 2.6, 0.1), brass2, 0.2, -2.45, 0));
      // Hauptgehäuse mit Fensteröffnung (rbox steht auf seiner Unterkante)
      g.add(M.mesh(M.rbox(6.2, 2.0, 2.2, 0.35), navy, 0, -0.05, -0.2));
      for (const s of [-1, 1]) g.add(M.mesh(M.rbox(0.75, 2.4, 2.2, 0.2), navy, s * 2.75, -2.3, -0.2));
      g.add(M.mesh(M.box(5.2, 2.3, 0.2), M.mat('#0a1430', { rough: 0.7 }), 0, -1.12, -1.25));
      // Messingrahmen um die Walzen
      g.add(M.mesh(M.box(5.4, 0.2, 0.3), brass, 0, 0.0, 0.9)); g.add(M.mesh(M.box(5.4, 0.2, 0.3), brass, 0, -2.25, 0.9));
      for (const s of [-1, 1]) g.add(M.mesh(M.box(0.2, 2.45, 0.3), brass, s * 2.6, -1.12, 0.9));
      for (const x of [-0.8, 0.8]) g.add(M.mesh(M.box(0.08, 2.1, 0.12), brass2, x, -1.12, 0.85));
      // Krone mit Sternenkompass (oben, links versetzt)
      const crown = M.grp(); crown.position.set(-0.35, 2.0, 0); g.add(crown);
      M.put(crown, M.mesh(M.cyl(1.25, 1.35, 0.5, 32), navy, 0, -0.1, 0)).rotation.x = Math.PI / 2;
      crown.add(M.mesh(M.tor(1.3, 0.12, 10, 40), brass, 0, 0, 0.2));
      this.compass = M.grp(); crown.add(this.compass); this.compass.position.z = 0.3;
      for (let i = 0; i < 8; i++) { const sp = M.mesh(M.cone(0.12, i % 2 ? 0.55 : 0.95, 4), i % 2 ? brass2 : M.mat('#f2d08a', { metal: 0.6, rough: 0.3 }), 0, 0, 0); const a = i * Math.PI / 4; sp.position.set(Math.sin(a) * (i % 2 ? 0.35 : 0.5), Math.cos(a) * (i % 2 ? 0.35 : 0.5), 0); sp.rotation.z = -a; this.compass.add(sp); }
      this.gem = M.mesh(M.oct(0.28), M.mat('#7fe8ff', { em: '#3fd8e8', emi: 1.1, rough: 0.15 }), 0, 0, 0.15); this.compass.add(this.gem);
      // Seitenflügel rechts (höher) und links (Kristallmotor)
      g.add(M.mesh(M.rbox(1.1, 3.6, 1.8, 0.25), navy2, 3.4, -2.0, -0.25));
      g.add(M.mesh(M.tor(0.45, 0.08, 8, 24), brass, 3.4, 0.0, 0.7));
      // Kristallmotor
      const eng = M.grp(); eng.position.set(-3.6, -1.0, 0.1); g.add(eng);
      eng.add(M.mesh(M.cyl(0.75, 0.85, 0.35, 20), brass, 0, -1.6, 0)); eng.add(M.mesh(M.cyl(0.75, 0.85, 0.35, 20), brass, 0, 1.75, 0));
      eng.add(M.mesh(M.cyl(0.62, 0.62, 3.1, 20, 1), M.mat('#bfefff', { op: 0.28, rough: 0.05, metal: 0.1 }), 0, 0.08, 0, false));
      this.core = M.mesh(M.ico(0.45, 0), M.mat('#3fd8e8', { em: '#3fd8e8', emi: 1.0, rough: 0.2, flat: true }), 0, 0.1, 0); eng.add(this.core);
      this.coreHalo = M.mesh(M.sph(0.75, 16, 12), M.basic('#3fd8e8', 0.22, true), 0, 0.1, 0, false); eng.add(this.coreHalo);
      for (let i = 0; i < 3; i++) eng.add(M.mesh(M.cyl(0.05, 0.05, 3.2, 6), brass2, Math.cos(i * 2.1) * 0.7, 0.08, Math.sin(i * 2.1) * 0.7));
      // Hebel rechts
      this.lever = M.grp(); this.lever.position.set(4.05, -1.5, 0.3); g.add(this.lever);
      M.put(this.lever, M.mesh(M.cyl(0.3, 0.3, 0.35, 16), brass, 0, 0, 0)).rotation.z = Math.PI / 2;
      const arm = M.mesh(M.cyl(0.07, 0.09, 2.2, 10), brass2, 0.25, 1.05, 0); this.lever.add(arm);
      this.lever.add(M.mesh(M.sph(0.3, 16, 12), coral, 0.25, 2.2, 0));
      // Walzen
      this.reels = [];
      const tex = SW.REELS.SYMBOLS.map(s => { const t = new THREE.CanvasTexture(SW.Symbols.symbol(s.id, 256, true)); t.anisotropy = 4; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.05 }); });
      this.symMats = tex;
      const R = 1.05, pw = 1.36, ph = 2 * R * Math.tan(STEP / 2) * 1.02;
      const panel = new THREE.PlaneGeometry(pw, ph);
      for (let k = 0; k < 3; k++) {
        const drum = new THREE.Group(); drum.position.set((k - 1) * 1.6, -1.12, -0.25); g.add(drum);
        const core = M.mesh(M.cyl(R * 0.92, R * 0.92, pw * 0.98, 20), M.mat('#efe0c4', { rough: 0.8 }), 0, 0, 0, false); core.rotation.z = Math.PI / 2; drum.add(core);
        for (let i = 0; i < N; i++) {
          const th = i * STEP, p = new THREE.Mesh(panel, tex[i]);
          p.position.set(0, R * Math.sin(th), R * Math.cos(th)); p.rotation.x = -th; drum.add(p);
        }
        for (const s of [-1, 1]) { const ring = M.mesh(M.tor(R + 0.02, 0.07, 8, 32), brass, s * pw / 2, 0, 0, false); ring.rotation.y = Math.PI / 2; drum.add(ring); }
        this.reels.push({ drum, phi: (k * 3) * STEP, from: 0, to: 0, t: 0, d: 0, done: true });
        drum.rotation.x = this.reels[k].phi;
      }
      // Glasscheibe mit Glanz + Gewinnlinie
      this.line = M.mesh(M.box(5.0, 0.05, 0.02), M.basic('#ffd98a', 0.0, true), 0, -1.12, 0.92, false); g.add(this.line);
      g.add(M.mesh(new THREE.PlaneGeometry(4.9, 2.1), M.mat('#bfefff', { op: 0.08, rough: 0.05 }), 0, -1.12, 0.95, false));
      // Lichterkette um das Fenster
      this.bulbs = [];
      for (let i = 0; i < 18; i++) {
        const t = i / 18, per = 2 * (5.5 + 2.7); let d = t * per, x, y;
        if (d < 5.5) { x = -2.75 + d; y = 0.25; } else if (d < 8.2) { x = 2.75; y = 0.25 - (d - 5.5); } else if (d < 13.7) { x = 2.75 - (d - 8.2); y = -2.45; } else { x = -2.75; y = -2.45 + (d - 13.7); }
        const b = new THREE.Mesh(M.sph(0.09, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc94a, emissiveIntensity: 0.4, roughness: 0.3 }));
        b.position.set(x, y, 1.0); g.add(b); this.bulbs.push(b);
      }
      // Kleine Zahnräder an der Seite
      this.gears = [M.gearMesh(0.55, brass2), M.gearMesh(0.38, brass)];
      this.gears[0].position.set(3.35, -3.1 + 1.3, 0.72); this.gears[1].position.set(2.75, -3.1 + 0.7, 0.72);
      this.gears.forEach(x => g.add(x));
      // Jade-Plakette
      g.add(M.mesh(M.rbox(2.2, 0.36, 0.12, 0.08), jade, 0.2, -2.86, 1.46));
      this.fx = SW.VFX ? new SW.VFX(this.scene, 300) : null;
      this.t = 0; this.spinning = false; this.leverT = 1; this.speed = 1; this.glow = 0; this.flashCol = new THREE.Color('#ffc94a');
      this.layout = { top: 0.15, bottom: 0.2 };
    }
    resize(w, h) {
      // Maschine passt zwischen obere Leiste und unteren Aktionsbereich
      const cam = this.camera, aspect = w / h; cam.aspect = aspect;
      const bandTop = this.layout.top, bandBot = this.layout.bottom, band = Math.max(0.3, 1 - bandTop - bandBot);
      const fov = cam.fov * Math.PI / 180, wantH = 7.2 / band, wantW = 9.4;
      const distH = wantH / 2 / Math.tan(fov / 2), distW = wantW / 2 / Math.tan(fov / 2) / aspect;
      const dist = Math.max(distH, distW);
      cam.position.set(0, 0.6, dist); cam.lookAt(0, -0.4, 0);
      // Bildmitte verschieben, damit die Maschine in der Mitte des freien Bereichs sitzt
      const shift = (bandTop - bandBot) / 2 * h;
      cam.setViewOffset(w, h, 0, -shift, w, h);
      cam.updateProjectionMatrix();
    }
    // ids: drei Symbol-IDs; dur: Grunddauer (s); fertig -> onStop(k) je Walze, onDone()
    spin(ids, opts) {
      opts = opts || {};
      const sp = opts.speed || 1, base = (opts.skip ? 0.08 : 1.0) / sp;
      this.spinning = true; this.leverT = 0; this.onStop = opts.onStop; this.onDone = opts.onDone;
      ids.forEach((id, k) => {
        const r = this.reels[k], i = SW.REELS.SYMBOLS.findIndex(s => s.id === id);
        const cur = r.phi, target0 = i * STEP;
        let to = target0 + Math.ceil((cur - target0) / (Math.PI * 2)) * Math.PI * 2;
        to += Math.PI * 2 * (opts.skip ? 1 : 2 + k);
        r.from = cur; r.to = to; r.t = 0; r.d = base * (1 + k * 0.45); r.done = false;
      });
    }
    finishNow() { for (const r of this.reels) if (!r.done) { r.t = r.d; } }
    win(color, big) { this.flashCol.set(color || '#ffc94a'); this.glow = big ? 2.2 : 1.2; if (this.fx) this.fx.burst(new (T().Vector3)(0, -1.1, 1.2), { n: big ? 140 : 50, color: color || '#ffd98a', color2: '#ffffff', speed: big ? 9 : 5, up: 4, life: big ? 1.8 : 1.1, gravity: 7 }); }
    update(dt, t) {
      this.t = t;
      let any = false;
      this.reels.forEach((r, k) => {
        if (!r.done) {
          r.t += dt; const u = Math.min(1, r.t / r.d);
          // ease-out mit kurzem Nachfedern
          const e = u < 1 ? 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.012 : 1;
          r.phi = r.from + (r.to - r.from) * e;
          if (u >= 1) { r.phi = r.to % (Math.PI * 2); r.from = r.to = r.phi; r.done = true; if (this.onStop) this.onStop(k); }
          else any = true;
        }
        r.drum.rotation.x = r.phi;
      });
      if (this.spinning && !any) { this.spinning = false; const cb = this.onDone; this.onDone = null; if (cb) cb(); }
      // Hebel, Kern, Kompass, Lichter
      if (this.leverT < 1) { this.leverT = Math.min(1, this.leverT + dt * 2.2); this.lever.rotation.x = Math.sin(this.leverT * Math.PI) * 0.9; }
      const busy = this.spinning ? 1 : 0;
      this.core.rotation.y += dt * (0.6 + busy * 6); this.core.rotation.x += dt * 0.3;
      this.coreHalo.material.opacity = 0.18 + 0.1 * Math.sin(t * 3) + busy * 0.15;
      this.compass.rotation.z += dt * (0.15 + busy * 2.0);
      this.gears[0].rotation.z += dt * (0.4 + busy * 3); this.gears[1].rotation.z -= dt * (0.6 + busy * 4.5);
      this.glow = Math.max(0, this.glow - dt * 0.8);
      this.bulbs.forEach((b, i) => {
        const chase = busy ? (Math.floor(t * 14) % 6 === i % 6 ? 1.6 : 0.25) : 0.35 + 0.25 * Math.sin(t * 2 + i * 0.5);
        b.material.emissiveIntensity = chase + this.glow * (i % 2 ? 1 : 0.6);
        if (this.glow > 0.1) b.material.emissive.copy(this.flashCol); else b.material.emissive.setHex(0xffc94a);
      });
      this.line.material.opacity = Math.min(0.9, this.glow * 0.6);
      if (this.fx) this.fx.update(dt);
    }
    pickLever(ndc) {
      const THREE = T(), rc = new THREE.Raycaster(); rc.setFromCamera(ndc, this.camera);
      return rc.intersectObject(this.group, true).length > 0;
    }
  }
  SW.Machine = Machine;
})(globalThis.SW = globalThis.SW || {});
