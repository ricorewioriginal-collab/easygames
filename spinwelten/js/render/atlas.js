/* Spinwelten 3D – Himmelsatlas: Die 30 Inseln steigen als Wendel um den Sternenturm auf, je Kapitel ein Ring.
 * Drehbar, zoombar, Inseln anklickbar; Reiseanimation mit Luftschiff entlang der Sternenstraße. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  function posOf(i) {
    // Wendel: 5 Inseln je Kapitel, jedes Kapitel eine Vierteldrehung höher
    const a = i * 0.72 + Math.floor(i / 5) * 0.35, r = 15 + (i % 5) * 0.9 + Math.floor(i / 5) * 1.2, y = i * 1.25 - 16;
    return new (T().Vector3)(Math.cos(a) * r, y, Math.sin(a) * r);
  }
  class Atlas {
    constructor() {
      const THREE = T(), M = Mo();
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color('#0b1636');
      this.scene.fog = new THREE.Fog('#0b1636', 60, 150);
      this.camera = new THREE.PerspectiveCamera(50, 1, 0.5, 400);
      this.scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x1a1030, 0.9));
      const sun = new THREE.DirectionalLight(0xfff2d8, 0.9); sun.position.set(20, 40, 15); this.scene.add(sun);
      this.cam = { yaw: 0.4, pitch: 0.3, dist: 62, ty: 0 }; this.goal = null;
      // Sternenhimmel
      const n = 600, p = new Float32Array(n * 3), rng = SW.rng.seeded('atlas');
      for (let i = 0; i < n; i++) { const a = rng.next() * 6.283, e = rng.next() * 2 - 1, r = 180; p[i * 3] = Math.cos(a) * Math.sqrt(1 - e * e) * r; p[i * 3 + 1] = e * r; p[i * 3 + 2] = Math.sin(a) * Math.sqrt(1 - e * e) * r; }
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3));
      this.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false, fog: false })));
      // Sternenturm in der Mitte
      const tower = M.grp(); this.scene.add(tower);
      tower.add(M.mesh(M.cyl(1.6, 2.6, 40, 10), M.mat('#24386e', { rough: 0.5 }), 0, 0, 0, false));
      for (let k = 0; k < 6; k++) { const ring = M.mesh(M.tor(2.4, 0.18, 6, 28), M.mat('#d8b26a', { metal: 0.8, rough: 0.3 }), 0, -16 + k * 7, 0, false); ring.rotation.x = Math.PI / 2; tower.add(ring); }
      this.top = M.mesh(M.oct(2.2), M.mat('#9ff0ff', { em: '#7ad8ff', emi: 0.9, rough: 0.2 }), 0, 22, 0, false); tower.add(this.top);
      // Sternenstraße
      const pts = []; for (let i = 0; i < 30; i++) pts.push(posOf(i).add(new THREE.Vector3(0, 0.6, 0)));
      this.curve = new THREE.CatmullRomCurve3(pts);
      this.road = new THREE.Mesh(new THREE.TubeGeometry(this.curve, 300, 0.09, 4, false), new THREE.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.55 }));
      this.scene.add(this.road);
      // Inseln
      this.isles = []; this.hit = [];
      const rockG = M.cone(2.2, 3.2, 7), topG = M.cyl(2.3, 2.1, 0.6, 9), hitG = M.cyl(2.8, 2.8, 4, 8);
      const flagG = M.box(0.7, 0.45, 0.04), poleG = M.cyl(0.05, 0.05, 1.8, 5);
      const lockMat = M.mat('#3a4466', { rough: 0.9 }), lockTop = M.mat('#55608a', { rough: 0.9 }), flagMat = M.mat('#ffd75e', { em: '#ffb020', emi: 0.4 });
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      (SW.WORLDS || []).forEach((w, i) => {
        const g = M.grp(), pos = posOf(i); g.position.copy(pos); this.scene.add(g);
        const rock = M.mesh(rockG, M.mat(w.pal.rock, { rough: 0.85 }), 0, -1.6, 0, false); rock.rotation.x = Math.PI; g.add(rock);
        const top = M.mesh(topG, M.mat(w.pal.grass, { rough: 0.8 }), 0, 0.3, 0, false); g.add(top);
        const mark = M.mesh(M.oct(0.45), M.mat(w.pal.accent, { em: w.pal.glow, emi: 0.6 }), 0, 1.3, 0, false); g.add(mark);
        const pole = M.mesh(poleG, M.mat('#d8d0c0'), 1.2, 1.4, 0, false), flag = M.mesh(flagG, flagMat, 1.55, 2.05, 0, false); g.add(pole); g.add(flag);
        const h = new THREE.Mesh(hitG, hitMat); h.userData.i = i; g.add(h); this.hit.push(h);
        this.isles.push({ g, rock, top, mark, pole, flag, mats: [rock.material, top.material, mark.material], w, i, rockMat: rock.material, topMat: top.material });
      });
      this.lockMat = lockMat; this.lockTop = lockTop;
      // Auswahlring und Spielerposition
      this.sel = M.mesh(M.tor(3.1, 0.12, 6, 36), M.basic('#ffe680', 0.9, true), 0, 0, 0, false); this.sel.rotation.x = Math.PI / 2; this.scene.add(this.sel);
      this.ship = this.makeShip(); this.scene.add(this.ship);
      this.current = 0; this.selected = 0; this.trip = null; this.t = 0;
    }
    makeShip() {
      const M = Mo(), g = M.grp();
      const bal = M.mesh(M.sph(0.8, 12, 8), M.mat('#ff8f6b', { rough: 0.6 }), 0, 1.0, 0, false); bal.scale.set(1.5, 0.8, 0.8); g.add(bal);
      g.add(M.mesh(M.rbox(1.0, 0.35, 0.5, 0.1), M.mat('#8a5a34'), 0, 0, 0, false));
      g.add(M.mesh(M.sph(0.25, 8, 6), M.mat('#9ff0ff', { em: '#9ff0ff', emi: 0.8 }), -0.7, 0.1, 0, false));
      return g;
    }
    // state: { island, islandsDone, ngp }
    setState(st) {
      const cur = st.island - 1; this.current = cur;
      this.isles.forEach(o => {
        const locked = o.i > cur, done = o.i < cur || (o.i === cur && false);
        o.rock.material = locked ? this.lockMat : o.rockMat; o.top.material = locked ? this.lockTop : o.topMat;
        o.mark.visible = !locked; o.flag.visible = o.pole.visible = done; o.locked = locked; o.done = done;
        o.g.scale.setScalar(o.i === cur ? 1.25 : 1);
      });
      if (!this.trip) this.ship.position.copy(posOf(cur)).add(new (T().Vector3)(0, 3, 0));
      this.select(cur, true);
    }
    select(i, instant) {
      this.selected = Math.max(0, Math.min(29, i));
      const p = posOf(this.selected);
      this.goal = { yaw: Math.atan2(p.x, p.z), ty: p.y, dist: this.cam.dist, pitch: this.cam.pitch };
      if (instant) { this.cam.yaw = this.goal.yaw; this.cam.ty = this.goal.ty; }
      return this.selected;
    }
    // Reise von a nach b (Inselindex 0-basiert); onDone nach der Animation
    travel(a, b, dur, onDone) {
      const ta = a / 29, tb = b / 29;
      this.trip = { ta, tb, t: 0, d: dur || 2.6, onDone };
    }
    pick(ndc) {
      const rc = new (T().Raycaster)(); rc.setFromCamera(ndc, this.camera);
      const h = rc.intersectObjects(this.hit, false); return h.length ? h[0].object.userData.i : -1;
    }
    orbit(dx, dy) { this.cam.yaw -= dx * 0.006; this.cam.pitch = Math.max(0.05, Math.min(1.2, this.cam.pitch + dy * 0.004)); this.goal = null; }
    climb(d) { this.cam.ty = Math.max(-18, Math.min(22, this.cam.ty + d)); this.goal = null; }
    zoom(f) { this.cam.dist = Math.max(22, Math.min(90, this.cam.dist * f)); }
    resize(w, h) { this.camera.aspect = w / h; this.camera.fov = h > w ? 62 : 48; this.camera.updateProjectionMatrix(); this.portrait = h > w; }
    update(dt, t) {
      this.t = t; const c = this.cam, gl = this.goal;
      if (gl) { const k = Math.min(1, dt * 2.5); let dy = gl.yaw - c.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); c.yaw += dy * k; c.ty += (gl.ty - c.ty) * k; }
      const d = c.dist * (this.portrait ? 1.3 : 1);
      this.camera.position.set(Math.sin(c.yaw) * Math.cos(c.pitch) * d, c.ty + Math.sin(c.pitch) * d, Math.cos(c.yaw) * Math.cos(c.pitch) * d);
      this.camera.lookAt(0, c.ty, 0);
      this.top.rotation.y += dt * 0.6;
      this.isles.forEach(o => { o.g.position.y = posOf(o.i).y + Math.sin(t * 0.8 + o.i) * 0.25; o.mark.rotation.y += dt * 1.2; });
      const sp = posOf(this.selected); this.sel.position.set(sp.x, sp.y + Math.sin(t * 0.8 + this.selected) * 0.25 + 0.15, sp.z); this.sel.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      if (this.trip) {
        const tr = this.trip; tr.t += dt; const u = Math.min(1, tr.t / tr.d), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const k = tr.ta + (tr.tb - tr.ta) * e, p = this.curve.getPointAt(Math.max(0, Math.min(1, k)));
        this.ship.position.set(p.x, p.y + 2.4 + Math.sin(u * Math.PI) * 3, p.z);
        const ahead = this.curve.getPointAt(Math.max(0, Math.min(1, k + 0.01))); this.ship.lookAt(ahead.x, this.ship.position.y, ahead.z); this.ship.rotateY(-Math.PI / 2);
        c.yaw += (Math.atan2(p.x, p.z) - c.yaw) * Math.min(1, dt * 3); c.ty += (p.y - c.ty) * Math.min(1, dt * 3);
        if (u >= 1) { const cb = tr.onDone; this.trip = null; if (cb) cb(); }
      } else this.ship.position.y += Math.sin(t * 2) * 0.004;
    }
    dispose() { Mo().disposeTree(this.scene); }
  }
  SW.Atlas = Atlas; SW.atlasPos = posOf;
})(globalThis.SW = globalThis.SW || {});
