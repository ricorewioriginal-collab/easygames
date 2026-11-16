/* Urwaldlager – Bühnen: Namensschilder, Kamerafahrten, Moderationsposten (Dschungel-Baumhaus oder Studio-Pult) */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;

  // ---------- Namensschilder und Sprechblasen ----------
  const Tags = UL.Tags = { list: new Map() };
  const v = new T.Vector3();
  Tags.set = (id, getPos, html, cls = 'tag', ttl = 0) => {
    let t = Tags.list.get(id);
    if (!t) { const el = document.createElement('div'); document.getElementById('labels').appendChild(el); t = { el }; Tags.list.set(id, t); }
    t.getPos = getPos; t.ttl = ttl; if (t.html !== html || t.cls !== cls) { t.el.className = cls; t.el.innerHTML = html; t.html = html; t.cls = cls; }
    return t;
  };
  Tags.del = (id) => { const t = Tags.list.get(id); if (t) { t.el.remove(); Tags.list.delete(id); } };
  Tags.clear = () => { Tags.list.forEach(t => t.el.remove()); Tags.list.clear(); };
  Tags.bubble = (id, getPos, text, sec = 3) => Tags.set('b:' + id, getPos, UL.esc(text), 'bubble', sec);
  Tags.update = (dt, cam) => {
    if (!cam) return;
    const w = innerWidth, h = innerHeight;
    Tags.list.forEach((t, id) => {
      if (t.ttl) { t.ttl -= dt; if (t.ttl <= 0) { Tags.del(id); return; } }
      t.getPos(v); v.project(cam);
      const vis = v.z < 1 && v.z > -1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      t.el.style.display = vis ? '' : 'none';
      if (vis) { const x = (v.x + 1) / 2 * w, m = t.cls === 'bubble' ? Math.min(w / 2, 115) : 0; t.el.style.left = (m ? UL.clamp(x, m, w - m) : x).toFixed(0) + 'px'; t.el.style.top = ((1 - v.y) / 2 * h).toFixed(0) + 'px'; }
    });
  };

  // ---------- Kamerafahrt ----------
  UL.Cine = class {
    constructor(cam) { this.cam = cam; this.from = null; this.to = null; this.t = 1; this.dur = 1; this.look = new T.Vector3(); this.lookFrom = new T.Vector3(); this.lookTo = new T.Vector3(); this.drift = 0; }
    cut(pos, look) { this.cam.position.copy(pos); this.look.copy(look); this.lookTo.copy(look); this.to = pos.clone(); this.from = pos.clone(); this.t = 1; this.cam.lookAt(look); }
    move(pos, look, dur = 1.5) { this.from = this.cam.position.clone(); this.to = pos.clone(); this.lookFrom.copy(this.look); this.lookTo.copy(look); this.t = 0; this.dur = dur; }
    update(dt) {
      if (this.t < 1 && this.to) {
        this.t = Math.min(1, this.t + dt / this.dur); const k = UL.smooth(this.t);
        this.cam.position.lerpVectors(this.from, this.to, k); this.look.lerpVectors(this.lookFrom, this.lookTo, k);
      } else if (this.drift && this.to) { this.cam.position.x += Math.sin(performance.now() / 2400) * this.drift * dt; }
      this.cam.lookAt(this.look);
    }
  };

  // ---------- Figuren-Helfer ----------
  UL.makeFig = (look, h) => new A.Figure(look, { height: h || 1.75 });
  UL.faceTo = (fig, x, z) => { fig.root.rotation.y = Math.atan2(x - fig.root.position.x, z - fig.root.position.z); };

  // ---------- Moderationsposten ----------
  // Dschungel: Holzplattform am Waldrand mit Schild und Fackeln. Studio: Pult auf der Bühne vor der LED-Wand.
  UL.HostSet = class extends R.Stage {
    constructor(theme, { tod = 'day', withDoc = false, extra = null } = {}) {
      super();
      this.theme = theme;
      const sc = this.scene;
      if (theme === 'studio') {
        this.env = Env().studio(sc, { radius: 14, screenText: ['URWALDLAGER', tod === 'night' ? 'DIE ENTSCHEIDUNG' : 'LIVE'] });
        this.updaters.push(dt => this.env.update(dt));
        const desk = A.sized('kf_table_medium', 1.0); desk.scale.x *= 2.2; desk.position.set(0, 0, -1.2); sc.add(desk);
        const front = R.sign(['URWALDLAGER', 'Die Promi-Show'], 2.6, 0.7, { w: 512, h: 140, font: '900 54px system-ui' }); front.position.set(0, 0.5, -0.55); sc.add(front);
        this.spot = new T.SpotLight(R.lin(0xfff2d0), 1.3, 30, 0.5, 0.6); this.spot.position.set(0, 9, 7); this.spot.target.position.set(0, 1, -1.5); sc.add(this.spot, this.spot.target);
      } else {
        this.env = Env().jungle(sc, { tod, radius: 10, clear: [{ x: 0, z: 0, r: 6 }], seed: 11 });
        // Plattform aus Planken mit Geländer, Schild, Fackeln
        const wood = R.mat(0x8a5a32), dark = R.mat(0x5a3a1e);
        const deck = new T.Mesh(new T.BoxGeometry(7, 0.3, 4), wood); deck.position.set(0, 0.15, -1.5); deck.receiveShadow = deck.castShadow = true; sc.add(deck);
        for (let i = -3; i <= 3; i++) { const p = new T.Mesh(new T.CylinderGeometry(0.09, 0.1, 1.2, 6), dark); p.position.set(i, 0.9, -3.4); sc.add(p); }
        const rail = new T.Mesh(new T.BoxGeometry(7, 0.1, 0.1), dark); rail.position.set(0, 1.45, -3.4); sc.add(rail);
        const board = R.sign(['URWALDLAGER', 'Die Promi-Show im Dschungel'], 3.2, 1.1, { bg: '#5a3a1e', w: 512, h: 176, font: '900 60px system-ui' });
        board.position.set(0, 2.6, -3.5); sc.add(board);
        for (const x of [-3.6, 3.6]) {
          const pole = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 2, 6), dark); pole.position.set(x, 1.15, -1.2); sc.add(pole);
          const f = R.fire(0.35); f.position.set(x, 2.1, -1.2); this.add(f);
        }
        const br = this.bridge = UL.ropeBridge(14, 1.6); br.position.set(6, 1.6, -10); br.rotation.y = 0.4; sc.add(br);
      }
      this.hosts = UL.D.HOSTS.map((h, i) => { const f = UL.makeFig(h.look, i ? 1.82 : 1.72); f.root.position.set(i ? 0.75 : -0.75, theme === 'studio' ? 0 : 0.3, -1.6); f.root.rotation.y = i ? -0.18 : 0.18; sc.add(f.root); this.figs.push(f); return f; });
      if (withDoc) { const d = this.doc = UL.makeFig(UL.D.DOC.look, 1.7); d.root.position.set(2.2, theme === 'studio' ? 0 : 0.3, -1.2); d.root.rotation.y = -0.6; sc.add(d.root); this.figs.push(d); }
      this.cine = new UL.Cine(this.camera);
      this.wide(true);
      if (extra) extra(this);
    }
    eye(f) { return f.root.position.clone().add(new T.Vector3(0, f.height * 0.82, 0)); }
    wide(cut) { const y = this.theme === 'studio' ? 0 : 0.3; const p = new T.Vector3(0, 1.9 + y, 4.6), l = new T.Vector3(0, 1.25 + y, -1.4); cut ? this.cine.cut(p, l) : this.cine.move(p, l, 1.2); }
    close(i) {
      const f = i === 'doc' ? this.doc : this.hosts[i]; if (!f) return;
      const e = this.eye(f), dir = new T.Vector3(Math.sin(f.root.rotation.y), 0, Math.cos(f.root.rotation.y));
      this.cine.move(e.clone().add(dir.multiplyScalar(2.4)).add(new T.Vector3(i === 0 ? 0.5 : -0.5, 0.1, 0)), e.clone().add(new T.Vector3(0, -0.15, 0)), 0.8);
    }
    // eine Zeile sprechen: Kamera auf Sprecher, Gestik
    async line(who, text) {
      const i = who === 'lotte' ? 0 : who === 'mats' ? 1 : who === 'doc' ? 'doc' : -1;
      if (i !== -1) { if (Math.random() < 0.65) this.close(i); else this.wide(); const f = i === 'doc' ? this.doc : this.hosts[i]; if (f) f.play(UL.pick(['interact', 'use', 'idle2']), {}); }
      await UL.UI.say(who, text);
    }
    async mod(key, vars, all) {
      const L = UL.D.MOD[key]; if (!L) return;
      const list = all ? L : [UL.pick(L)];
      for (const [w, t] of list) await this.line(w, UL.UI.fmt(t, vars));
    }
    update(dt) { this.tick(dt); this.cine.update(dt); }
  };
  const Env = () => UL.Env;

  // ---------- Hängebrücke (Seile + Planken) ----------
  UL.ropeBridge = (len = 12, sag = 1.2, width = 1.3) => {
    const g = new T.Group(), plank = R.mat(0x9a6a3a), rope = R.mat(0xd9c08a);
    const n = Math.round(len / 0.45), pg = new T.BoxGeometry(width, 0.06, 0.32);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = 0, z = (t - 0.5) * len, y = -Math.sin(t * Math.PI) * sag;
      const p = new T.Mesh(pg, plank); p.position.set(x, y, z); p.rotation.x = Math.cos(t * Math.PI) * sag / len * 2.6; p.castShadow = true; p.receiveShadow = true; g.add(p);
      pts.push(new T.Vector3(0, y, z));
    }
    for (const sx of [-1, 1]) for (const h of [0.05, 0.9]) {
      const curve = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(sx * width / 2, p.y + h, p.z)));
      g.add(new T.Mesh(new T.TubeGeometry(curve, n, 0.025, 4), rope));
    }
    for (const z of [-len / 2, len / 2]) for (const sx of [-1, 1]) { const post = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, 2.2, 6), R.mat(0x6b4426)); post.position.set(sx * width / 2, 0.4, z); g.add(post); }
    g.userData.y = (z) => { const t = UL.clamp(z / len + 0.5, 0, 1); return -Math.sin(t * Math.PI) * sag; };
    return g;
  };

  // ---------- einfache Hütte mit Strohdach ----------
  UL.hut = (w = 3, d = 3, h = 2.4, wall = 0x8a6a42, roof = 0xc9a45a, sign = null) => {
    const g = new T.Group();
    const wm = R.mat(wall), rm = R.mat(roof);
    const back = new T.Mesh(new T.BoxGeometry(w, h, 0.15), wm); back.position.set(0, h / 2, -d / 2); g.add(back);
    for (const s of [-1, 1]) { const side = new T.Mesh(new T.BoxGeometry(0.15, h, d), wm); side.position.set(s * w / 2, h / 2, 0); g.add(side); }
    for (const s of [-1, 1]) { const fr = new T.Mesh(new T.BoxGeometry(w * 0.3, h, 0.15), wm); fr.position.set(s * w * 0.35, h / 2, d / 2); g.add(fr); }
    const r = new T.Mesh(new T.ConeGeometry(Math.max(w, d) * 0.85, h * 0.7, 4), rm); r.position.y = h + h * 0.33; r.rotation.y = Math.PI / 4; g.add(r);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    if (sign) { const s = R.sign(sign, 1.4, 0.5, { bg: '#3a2412', w: 256, h: 92, font: '900 40px system-ui' }); s.position.set(0, h + 0.05, d / 2 + 0.1); g.add(s); }
    return g;
  };
})();
