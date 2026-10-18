/* Spinwelten 3D – die Runenmaschine. Große Walzen stehen im Mittelpunkt: drei Trommeln mit je 10 quadratischen
 * Symbolfeldern, sichtbar sind 3 Reihen (Mitte = Gewinnlinie). Schmaler Messingrahmen mit Lichterkette, Sternenkompass
 * oben, Kristallsäule links, Hebel rechts. spin(ids) dreht auf das bereits feststehende Ergebnis: schneller Anlauf mit
 * Bewegungsunschärfe, gestaffelter Stopp mit Nachfedern, Spannung auf der dritten Walze, wenn zwei gleiche stehen. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  const N = 10, STEP = Math.PI * 2 / N;
  const PW = 1.86, PITCH = 1.98, R = PW / (2 * Math.tan(STEP / 2)), WIN_W = PITCH * 3 + 0.06, WIN_H = 5.0;
  // Maße für die Kamera: Rahmen füllt die Breite, Säule und Hebel dürfen am Rand angeschnitten sein
  const FIT_W = 7.3, TOP = 4.75, BOT = -3.45;
  // Symbolkachel mit senkrechter Bewegungsunschärfe (für schnell drehende Walzen)
  function blurTile(id) {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d');
    const src = SW.Symbols.symbol(id, s, true);
    x.globalAlpha = 1; x.drawImage(src, 0, 0);
    x.globalAlpha = 0.22; for (let k = -4; k <= 4; k++) if (k) x.drawImage(src, 0, k * s * 0.07);
    return c;
  }
  function gradTex(top) {
    const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(top ? 0 : 1, 'rgba(6,10,30,0.92)'); g.addColorStop(top ? 1 : 0, 'rgba(6,10,30,0)');
    x.fillStyle = g; x.fillRect(0, 0, 4, 64); return new (T().CanvasTexture)(c);
  }
  class Machine {
    constructor() {
      const THREE = T(), M = Mo();
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(22, 1, 1, 200);
      this.scene.add(new THREE.HemisphereLight(0xeef3ff, 0x2a1a40, 0.9));
      const key = new THREE.DirectionalLight(0xfff0d8, 1.0); key.position.set(3, 6, 10); this.scene.add(key);
      const rim = new THREE.DirectionalLight(0x7fe8ff, 0.5); rim.position.set(-6, 3, -4); this.scene.add(rim);
      const root = this.root = new THREE.Group(); this.scene.add(root);
      const g = this.group = new THREE.Group(); root.add(g);
      const navy = M.mat('#1a3270', { rough: 0.35, metal: 0.3 }), navy2 = M.mat('#0d1b3d', { rough: 0.4, metal: 0.2 });
      const brass = M.mat('#e2bb6e', { rough: 0.26, metal: 0.85 }), brass2 = M.mat('#b88a40', { rough: 0.32, metal: 0.8 });
      const jade = M.mat('#2ec4a6', { rough: 0.3, metal: 0.2 }), coral = M.mat('#ff6b5b', { rough: 0.35 });
      const hw = WIN_W / 2, hh = WIN_H / 2;
      // Rückwand hinter den Walzen
      g.add(M.mesh(M.box(WIN_W + 0.4, WIN_H + 0.4, 0.2), M.mat('#081028', { rough: 0.8 }), 0, 0, -R - 0.4, false));
      // Rahmen (oben/unten breiter, Seiten schmal) mit Messingkante
      g.add(M.mesh(M.rbox(WIN_W + 1.1, 0.7, 1.0, 0.18), navy, 0, hh, 0.05));
      g.add(M.mesh(M.rbox(WIN_W + 1.1, 0.8, 1.0, 0.18), navy, 0, -hh - 0.8, 0.05));
      for (const s of [-1, 1]) g.add(M.mesh(M.rbox(0.6, WIN_H + 1.5, 1.0, 0.16), navy, s * (hw + 0.27), -hh - 0.8, 0.05));
      g.add(M.mesh(M.box(WIN_W + 0.16, 0.1, 0.12), brass, 0, hh + 0.02, 0.62)); g.add(M.mesh(M.box(WIN_W + 0.16, 0.1, 0.12), brass, 0, -hh - 0.02, 0.62));
      for (const s of [-1, 1]) g.add(M.mesh(M.box(0.1, WIN_H + 0.12, 0.12), brass, s * (hw + 0.03), 0, 0.62));
      // Trennstege zwischen den Walzen
      for (const x of [-PITCH / 2, PITCH / 2]) g.add(M.mesh(M.box(0.07, WIN_H, 0.1), brass2, x, 0, 0.12, false));
      // Kopfteil mit Sternenkompass
      g.add(M.mesh(M.rbox(WIN_W * 0.62, 0.55, 0.9, 0.2), navy2, 0, hh + 0.6, 0));
      const crown = M.grp(); crown.position.set(0, hh + 1.55, 0.1); g.add(crown);
      M.put(crown, M.mesh(M.cyl(0.95, 1.0, 0.45, 32), navy, 0, 0, 0)).rotation.x = Math.PI / 2;
      crown.add(M.mesh(M.tor(1.0, 0.1, 10, 40), brass, 0, 0, 0.22));
      this.compass = M.grp(); crown.add(this.compass); this.compass.position.z = 0.3;
      for (let i = 0; i < 8; i++) { const sp = M.mesh(M.cone(0.1, i % 2 ? 0.42 : 0.75, 4), i % 2 ? brass2 : M.mat('#f2d08a', { metal: 0.6, rough: 0.3 }), 0, 0, 0, false); const a = i * Math.PI / 4; sp.position.set(Math.sin(a) * (i % 2 ? 0.28 : 0.4), Math.cos(a) * (i % 2 ? 0.28 : 0.4), 0); sp.rotation.z = -a; this.compass.add(sp); }
      this.gem = M.mesh(M.oct(0.22), M.mat('#7fe8ff', { em: '#3fd8e8', emi: 1.1, rough: 0.15 }), 0, 0, 0.12, false); this.compass.add(this.gem);
      // Kristallsäule links
      const eng = M.grp(); eng.position.set(-hw - 0.95, -0.4, 0); g.add(eng);
      eng.add(M.mesh(M.cyl(0.42, 0.5, 0.3, 18), brass, 0, -2.3, 0)); eng.add(M.mesh(M.cyl(0.42, 0.5, 0.3, 18), brass, 0, 2.3, 0));
      eng.add(M.mesh(M.cyl(0.34, 0.34, 4.3, 18, 1), M.mat('#bfefff', { op: 0.3, rough: 0.05, metal: 0.1 }), 0, 0, 0, false));
      this.core = M.mesh(M.ico(0.26, 0), M.mat('#3fd8e8', { em: '#3fd8e8', emi: 1.0, rough: 0.2, flat: true }), 0, 0, 0, false); eng.add(this.core);
      this.coreHalo = M.mesh(M.sph(0.4, 14, 10), M.basic('#3fd8e8', 0.22, true), 0, 0, 0, false); eng.add(this.coreHalo);
      // Hebel rechts
      this.lever = M.grp(); this.lever.position.set(hw + 0.85, 0.2, 0.1); g.add(this.lever);
      M.put(this.lever, M.mesh(M.cyl(0.28, 0.28, 0.4, 16), brass, 0, 0, 0)).rotation.z = Math.PI / 2;
      this.lever.add(M.mesh(M.cyl(0.06, 0.08, 2.0, 10), brass2, 0.2, 1.0, 0));
      this.lever.add(M.mesh(M.sph(0.3, 16, 12), coral, 0.2, 2.05, 0));
      // Walzen: quadratische Felder, Radius passend zu 10 Feldern
      this.sharp = SW.REELS.SYMBOLS.map(s => { const t = new THREE.CanvasTexture(SW.Symbols.symbol(s.id, 256, true)); t.anisotropy = 4; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.02 }); });
      this.blur = SW.REELS.SYMBOLS.map(s => new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blurTile(s.id)), color: 0xdddddd }));
      const panel = new THREE.PlaneGeometry(PW, PW * 1.012);
      this.reels = [];
      for (let k = 0; k < 3; k++) {
        const drum = new THREE.Group(); drum.position.set((k - 1) * PITCH, 0, -R); g.add(drum);
        const core = M.mesh(M.cyl(R * 0.94, R * 0.94, PW * 0.98, 24), M.mat('#efe0c4', { rough: 0.85 }), 0, 0, 0, false); core.rotation.z = Math.PI / 2; drum.add(core);
        const panels = [];
        for (let i = 0; i < N; i++) {
          const th = i * STEP, p = new THREE.Mesh(panel, this.sharp[i]);
          p.position.set(0, R * Math.sin(th), R * Math.cos(th)); p.rotation.x = -th; drum.add(p); panels.push(p);
        }
        this.reels.push({ drum, panels, phi: (k * 3) * STEP, from: 0, to: 0, t: 0, d: 0, done: true, blurred: false, last: 0, idx: k * 3 });
        drum.rotation.x = this.reels[k].phi;
      }
      // Schatten oben/unten im Fenster (Tiefe der Trommeln), Glas
      const shade = (top) => { const m = new THREE.MeshBasicMaterial({ map: gradTex(top), transparent: true, depthWrite: false }); const o = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W, 1.35), m); o.position.set(0, top ? hh - 0.67 : -hh + 0.67, 0.3); o.renderOrder = 2; return o; };
      g.add(shade(true)); g.add(shade(false));
      const glass = M.mesh(new THREE.PlaneGeometry(WIN_W, WIN_H), M.mat('#bfefff', { op: 0.06, rough: 0.05 }), 0, 0, 0.5, false); glass.renderOrder = 3; g.add(glass);
      // Gewinnlinie mit Pfeilen links/rechts
      this.line = M.mesh(M.box(WIN_W, 0.07, 0.02), M.basic('#ffd98a', 0.0, true).clone(), 0, 0, 0.45, false); this.line.renderOrder = 4; g.add(this.line);
      const arrowGeo = new THREE.ConeGeometry(0.2, 0.36, 3);
      for (const s of [-1, 1]) { const a = M.mesh(arrowGeo, M.mat('#ffd98a', { em: '#ffb020', emi: 0.5, metal: 0.4 }), s * (hw + 0.3), 0, 0.62, false); a.rotation.z = s * Math.PI / 2; g.add(a); }
      // Lichterkette rund um den Rahmen
      this.bulbs = [];
      const bmat = () => new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc94a, emissiveIntensity: 0.4, roughness: 0.3 });
      const bw = hw + 0.27, bt = hh + 0.38, bb = -hh - 0.42, per = 2 * (2 * bw + (bt - bb));
      for (let i = 0; i < 28; i++) {
        let d = i / 28 * per, x, y;
        if (d < 2 * bw) { x = -bw + d; y = bt; } else if ((d -= 2 * bw) < bt - bb) { x = bw; y = bt - d; } else if ((d -= bt - bb) < 2 * bw) { x = bw - d; y = bb; } else { d -= 2 * bw; x = -bw; y = bb + d; }
        const b = new THREE.Mesh(M.sph(0.085, 10, 8), bmat()); b.position.set(x, y, 0.6); g.add(b); this.bulbs.push(b);
      }
      // Jade-Plakette unten
      g.add(M.mesh(M.rbox(2.4, 0.3, 0.12, 0.08), jade, 0, -hh - 0.62, 0.56, false));
      this.fx = SW.VFX ? new SW.VFX(this.scene, 300) : null;
      this.t = 0; this.spinning = false; this.leverT = 1; this.glow = 0; this.flashCol = new THREE.Color('#ffc94a');
      this.shake = 0; this.bump = 0; this.tease = -1; this.hit = null; this.hitT = 0;
      this.layout = { top: 0.15, bottom: 0.2 };
    }
    resize(w, h) {
      // Maschine füllt den freien Bereich zwischen oberer Leiste und den Knöpfen unten
      const cam = this.camera, aspect = w / h; cam.aspect = aspect;
      const lo = this.layout, bandTop = lo.top, bandBot = lo.bottom, band = Math.max(0.25, 1 - bandTop - bandBot);
      const bl = lo.left || 0, br = lo.right || 0, bandW = Math.max(0.3, 1 - bl - br);
      const fov = cam.fov * Math.PI / 180, wantH = (TOP - BOT) / band;
      const distH = wantH / 2 / Math.tan(fov / 2), distW = FIT_W / 2 / Math.tan(fov / 2) / (aspect * bandW);
      const dist = Math.max(distH, distW), cy = (TOP + BOT) / 2;
      cam.position.set(0, cy + 0.4, dist); cam.lookAt(0, cy, 0);
      // ist mehr Platz als nötig, sitzt die Maschine unten im Bereich (oben bleibt die Insel sichtbar)
      const visH = 2 * dist * Math.tan(fov / 2), spare = Math.max(0, band - (TOP - BOT) / visH);
      const shift = (bandTop - bandBot + spare * 0.7) / 2 * h, shiftX = (bl - br) / 2 * w;
      cam.setViewOffset(w, h, -shiftX, -shift, w, h);
      cam.updateProjectionMatrix();
      this.w = w; this.h = h;
    }
    // Bildschirmposition (px) der Fenstermitte bzw. eines Punkts der Maschine
    screen(x, y) {
      const v = new (T().Vector3)(x || 0, y || 0, 0.6); this.group.localToWorld(v); v.project(this.camera);
      return { x: (v.x + 1) / 2 * this.w, y: (1 - v.y) / 2 * this.h };
    }
    // ids: drei Symbol-IDs; opts: speed, skip, onStop(k), onDone(), onTease()
    spin(ids, opts) {
      opts = opts || {};
      const sp = opts.speed || 1, base = (opts.skip ? 0.12 : 0.95) / sp;
      this.spinning = true; this.leverT = 0; this.onStop = opts.onStop; this.onDone = opts.onDone; this.onTease = opts.onTease;
      this.hit = null; this.tease = !opts.skip && ids[0] === ids[1] ? 2 : -1;
      ids.forEach((id, k) => {
        const r = this.reels[k], i = SW.REELS.SYMBOLS.findIndex(s => s.id === id);
        const cur = r.phi, target0 = i * STEP;
        let to = target0 + Math.ceil((cur - target0) / (Math.PI * 2)) * Math.PI * 2;
        let turns = opts.skip ? 1 : 3 + k, d = base * (1 + k * 0.38);
        if (k === this.tease) { turns += 3; d += 1.0 / sp; }
        to += Math.PI * 2 * turns;
        r.from = cur; r.to = to; r.t = 0; r.d = d; r.done = false; r.idx = i; r.teased = false;
      });
    }
    finishNow() { for (const r of this.reels) if (!r.done) r.t = Math.max(r.t, r.d - 0.12); }
    // mask: welche Walzen gewonnen haben (Felder pulsieren), big: kräftiger mit Wackeln
    win(color, big, mask) {
      this.flashCol.set(color || '#ffc94a'); this.glow = big ? 2.4 : 1.4; this.hit = mask || [true, true, true]; this.hitT = 0;
      if (big) this.shake = 0.6;
      if (this.fx) this.fx.burst(new (T().Vector3)(0, 0, 1.2), { n: big ? 160 : 60, color: color || '#ffd98a', color2: '#ffffff', speed: big ? 10 : 6, up: 4, life: big ? 1.8 : 1.1, gravity: 7 });
    }
    update(dt, t) {
      this.t = t;
      let any = false;
      this.reels.forEach((r, k) => {
        if (!r.done) {
          r.t += dt; const u = Math.min(1, r.t / r.d);
          // ease-out mit Nachfedern (Back), vorne kurz Schwung holen
          const c1 = 1.25, c3 = c1 + 1, q = u - 1;
          const e = u < 1 ? 1 + c3 * q * q * q + c1 * q * q : 1;
          const wind = u < 0.08 ? -Math.sin(u / 0.08 * Math.PI) * 0.06 : 0;
          const phi = r.from + (r.to - r.from) * e + wind;
          const vel = Math.abs(phi - r.phi) / Math.max(dt, 1e-3);
          r.phi = phi;
          const fast = vel > 9;
          if (fast !== r.blurred) { r.blurred = fast; r.panels.forEach((p, i) => { p.material = fast ? this.blur[i] : this.sharp[i]; }); }
          if (k === this.tease && !r.teased && this.reels[1].done) { r.teased = true; if (this.onTease) this.onTease(); }
          if (u >= 1) {
            r.phi = r.to % (Math.PI * 2); r.from = r.to = r.phi; r.done = true; this.bump = 0.12;
            if (r.blurred) { r.blurred = false; r.panels.forEach((p, i) => { p.material = this.sharp[i]; }); }
            if (this.onStop) this.onStop(k);
          } else any = true;
        }
        r.drum.rotation.x = r.phi;
      });
      if (this.spinning && !any) { this.spinning = false; this.tease = -1; const cb = this.onDone; this.onDone = null; if (cb) cb(); }
      // Gewinnfelder pulsieren
      if (this.hit) {
        this.hitT += dt; const s = 1 + Math.max(0, Math.sin(this.hitT * 9)) * 0.09 * Math.max(0, 1 - this.hitT / 1.8);
        const out = (p, i, f) => { p.scale.setScalar(f); const th = i * STEP, q = 1 + (f - 1) * 0.6; p.position.set(0, R * Math.sin(th) * q, R * Math.cos(th) * q); };
        this.reels.forEach((r, k) => out(r.panels[r.idx], r.idx, this.hit[k] ? s : 1));
        if (this.hitT > 1.9) { this.reels.forEach(r => out(r.panels[r.idx], r.idx, 1)); this.hit = null; }
      }
      // Wackeln (großer Gewinn) und kleiner Ruck beim Walzenstopp
      this.shake = Math.max(0, this.shake - dt); this.bump = Math.max(0, this.bump - dt);
      const sh = this.shake * 0.25, bp = this.bump * 0.35;
      this.root.position.set(sh ? (Math.random() - 0.5) * sh : 0, (sh ? (Math.random() - 0.5) * sh : 0) - bp * 0.4, 0);
      // Hebel, Kern, Kompass, Lichter
      if (this.leverT < 1) { this.leverT = Math.min(1, this.leverT + dt * 2.2); this.lever.rotation.x = Math.sin(this.leverT * Math.PI) * 0.9; }
      const busy = this.spinning ? 1 : 0, teasing = this.spinning && this.tease >= 0 && this.reels[1].done;
      this.core.rotation.y += dt * (0.6 + busy * 6); this.core.rotation.x += dt * 0.3;
      this.coreHalo.material.opacity = 0.18 + 0.1 * Math.sin(t * 3) + busy * 0.15;
      this.compass.rotation.z += dt * (0.15 + busy * 2.0 + (teasing ? 6 : 0));
      this.glow = Math.max(0, this.glow - dt * 0.8);
      const n = this.bulbs.length;
      this.bulbs.forEach((b, i) => {
        let v;
        if (teasing) v = Math.floor(t * 18) % 2 === i % 2 ? 2.2 : 0.2;
        else if (busy) v = Math.floor(t * 16) % 7 === i % 7 ? 1.8 : 0.25;
        else v = 0.35 + 0.3 * Math.sin(t * 2.2 - i / n * Math.PI * 4);
        b.material.emissiveIntensity = v + this.glow * (i % 2 ? 1 : 0.6);
        if (this.glow > 0.1) b.material.emissive.copy(this.flashCol); else if (teasing) b.material.emissive.setHex(0xff7a6b); else b.material.emissive.setHex(0xffc94a);
      });
      this.line.material.opacity = Math.min(0.95, this.glow * 0.6);
      if (this.fx) this.fx.update(dt);
    }
    pickLever(ndc) {
      const THREE = T(), rc = new THREE.Raycaster(); rc.setFromCamera(ndc, this.camera);
      return rc.intersectObject(this.group, true).length > 0;
    }
  }
  SW.Machine = Machine;
})(globalThis.SW = globalThis.SW || {});
