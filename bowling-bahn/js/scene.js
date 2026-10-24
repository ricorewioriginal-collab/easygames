/* Bowling-Bahn 3D – Halle mit Neon, glänzende Holzbahn mit Pfeilen, Rinnen, Nachbarbahnen, Kegel (gedrechselt), Kugel mit Fingerlöchern,
 * Bowler aus EASYCLASH (../easyclash/js/model.js) mit Anlauf und Abwurf, Kamera hinter dem Bowler, folgt der Kugel und zeigt die Kegel.
 * Welt: x_welt = −x (Kern-x zeigt aus Sicht des Bowlers nach rechts), z die Bahn hinunter. */
(function () {
  'use strict';
  const T3 = window.THREE, BW = window.BW, M = window.ECModel;
  let R, SC, CAM, el, low = false, t = 0, L = null, mode = 'menu';
  const perf = { a: 1 / 60, n: 0 };
  let ball, ballMat, pins = [], aimLine, aimArrow, bowler = null, bowlerId = '', handOff = 0, ballQ = new T3.Quaternion();
  const BALLCOL = ['#ff3d9a', '#3dd6ff', '#ffd23f', '#7cff6b', '#a259ff', '#ff8a3d'];
  const wx = x => -x;

  function laneTex() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 2048; const x = c.getContext('2d');
    for (let i = 0; i < 39; i++) { const l = 52 + (i * 37 % 11) - 5; x.fillStyle = 'hsl(32,' + (55 + (i % 3) * 5) + '%,' + l + '%)'; x.fillRect(i * 128 / 39, 0, 128 / 39 + 1, 2048); }
    x.globalAlpha = .08; for (let y = 0; y < 2048; y += 6) { x.fillStyle = y % 12 ? '#fff' : '#5a2d0c'; x.fillRect(0, y, 128, 2); } x.globalAlpha = 1;
    // Pfeile bei ~4,6 m und Punkte bei ~2 m (v = z / Länge)
    const vy = z => 2048 - z / (BW.LANE_L + 1.5) * 2048;
    x.fillStyle = '#2a120a'; for (const b of [5, 10, 15, 20, 25, 30, 35]) { const px = b * 128 / 39, d = Math.abs(b - 20) / 5, py = vy(4.6 + d * .3); x.beginPath(); x.moveTo(px, py - 18); x.lineTo(px - 3, py + 6); x.lineTo(px + 3, py + 6); x.closePath(); x.fill(); }
    for (const b of [3, 5, 8, 11, 14, 25, 28, 31, 34, 36]) { x.beginPath(); x.arc(b * 128 / 39, vy(2.1), 1.6, 0, 7); x.fill(); }
    const tx = new T3.CanvasTexture(c); tx.anisotropy = 4; return tx;
  }
  function ballTex(col) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 26; i++) { x.strokeStyle = 'rgba(255,255,255,' + (.08 + (i % 4) * .05) + ')'; x.lineWidth = 3 + (i % 5) * 2; x.beginPath(); const y0 = (i * 41) % 128; x.moveTo(0, y0); for (let k = 0; k <= 256; k += 16) x.lineTo(k, y0 + Math.sin(k / 30 + i) * 18); x.stroke(); }
    x.fillStyle = '#120a1c'; for (const [u, v, r] of [[60, 50, 7], [84, 50, 7], [72, 80, 8]]) { x.beginPath(); x.arc(u, v, r, 0, 7); x.fill(); }
    return new T3.CanvasTexture(c);
  }
  function pinGeo() {
    const pr = [[0, 0], [.026, 0], [.038, .02], [.055, .085], [.0605, .125], [.057, .165], [.044, .21], [.028, .25], [.0215, .275], [.023, .3], [.029, .33], [.027, .36], [.016, .377], [0, .381]];
    return new T3.LatheGeometry(pr.map(p => new T3.Vector2(p[0], p[1])), low ? 10 : 16);
  }
  function init(container, opt) {
    el = container; low = !!(opt && opt.low);
    R = new T3.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75));
    if (!low) { R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; }
    el.appendChild(R.domElement);
    SC = new T3.Scene(); SC.background = new T3.Color('#0c0716'); SC.fog = new T3.Fog('#0c0716', 14, 34);
    CAM = new T3.PerspectiveCamera(52, 1, .05, 60);
    SC.add(new T3.HemisphereLight(0xd8c8ff, 0x20122e, .7));
    const key = new T3.DirectionalLight(0xffffff, .55); key.position.set(-2, 6, 4); key.target.position.set(0, 0, 6); SC.add(key.target);
    if (!low) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); const c = key.shadow.camera; c.left = -3; c.right = 3; c.top = 6; c.bottom = -6; c.near = 1; c.far = 16; key.shadow.bias = -.001; }
    SC.add(key);
    const spot = new T3.SpotLight(0xffffff, 1.1, 9, .5, .5); spot.position.set(0, 3.2, BW.LANE_L - 2.2); spot.target.position.set(0, 0, BW.LANE_L + .4); SC.add(spot, spot.target);
    M.setup({ low });
    hall();
    ballMat = new T3.MeshPhongMaterial({ map: ballTex(BALLCOL[0]), shininess: 110, specular: 0x888888 });
    ball = new T3.Mesh(new T3.SphereGeometry(BW.BALL_R, 24, 16), ballMat); ball.castShadow = !low; SC.add(ball);
    const pg = pinGeo(), pm = new T3.MeshPhongMaterial({ color: '#fbfaf5', shininess: 70, specular: 0x555555 }), rm = new T3.MeshBasicMaterial({ color: '#e0203a' });
    for (let i = 0; i < 10; i++) {
      const g = new T3.Group(), m = new T3.Mesh(pg, pm); m.castShadow = !low; g.add(m);
      for (const y of [.262, .282]) { const s = new T3.Mesh(new T3.CylinderGeometry(.0228, .0226, .008, 12, 1, true), rm); s.position.y = y; g.add(s); }
      SC.add(g); pins.push({ g, fall: 0 });
    }
    aimLine = new T3.Line(new T3.BufferGeometry(), new T3.LineDashedMaterial({ color: 0xffffff, dashSize: .25, gapSize: .18, transparent: true, opacity: .75 })); SC.add(aimLine);
    const ag = new T3.ConeGeometry(.06, .18, 3); ag.rotateX(Math.PI / 2); aimArrow = new T3.Mesh(ag, new T3.MeshBasicMaterial({ color: 0xff3d9a })); SC.add(aimArrow);
    addEventListener('resize', resize); resize();
  }
  function hall() {
    const LL = BW.LANE_L, HW = BW.HW, G = BW.GUT, len = BW.DECK_END + 1.4;
    const fl = new T3.Mesh(new T3.PlaneGeometry(30, 50), new T3.MeshLambertMaterial({ color: '#1a1026' })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, -.06, 10); fl.receiveShadow = !low; SC.add(fl);
    const tex = laneTex(), lm = new T3.MeshPhongMaterial({ map: tex, shininess: 90, specular: 0x6a5a48 });
    const laneMesh = (x, rec) => { const m = new T3.Mesh(new T3.PlaneGeometry(BW.LANE_W, LL + 1.5), lm); m.rotation.x = -Math.PI / 2; m.position.set(x, 0, (LL + 1.5) / 2); m.receiveShadow = rec; SC.add(m); };
    const pitch = BW.LANE_W + G * 2 + .2;
    for (const k of [-2, -1, 0, 1, 2]) {
      const x = k * pitch; laneMesh(x, !low && k === 0);
      // Anlauf
      const ap = new T3.Mesh(new T3.PlaneGeometry(pitch - .04, 4.5), new T3.MeshPhongMaterial({ color: '#c9925a', shininess: 40 })); ap.rotation.x = -Math.PI / 2; ap.position.set(x, -.001, -2.25); ap.receiveShadow = !low && k === 0; SC.add(ap);
      const foul = new T3.Mesh(new T3.PlaneGeometry(BW.LANE_W + G * 2, .02), new T3.MeshBasicMaterial({ color: '#ff3d6e' })); foul.rotation.x = -Math.PI / 2; foul.position.set(x, .002, 0); SC.add(foul);
      for (const s of [-1, 1]) {
        const gt = new T3.Mesh(new T3.BoxGeometry(G, .02, len), new T3.MeshPhongMaterial({ color: '#2c2a36', shininess: 60 })); gt.position.set(x + s * (HW + G / 2), -.05, len / 2); SC.add(gt);
        const cap = new T3.Mesh(new T3.BoxGeometry(.1, .06, len), new T3.MeshLambertMaterial({ color: '#241534' })); cap.position.set(x + s * (HW + G + .05), .02, len / 2); SC.add(cap);
        const neon = new T3.Mesh(new T3.BoxGeometry(.02, .012, len), new T3.MeshBasicMaterial({ color: k % 2 ? '#3dd6ff' : '#ff3d9a' })); neon.position.set(x + s * (HW + G + .05), .056, len / 2); SC.add(neon);
      }
      // Kegel-Schacht und Maske
      const pit = new T3.Mesh(new T3.BoxGeometry(BW.LANE_W + G * 2, .3, 1.2), new T3.MeshBasicMaterial({ color: '#050208' })); pit.position.set(x, -.17, BW.DECK_END + .6); SC.add(pit);
      if (k) for (const s of BW.SPOTS) { const p = new T3.Mesh(pinGeoCache(), new T3.MeshLambertMaterial({ color: '#efece4' })); p.position.set(x + wx(s[0]), 0, s[1]); SC.add(p); }
    }
    const mask = new T3.Mesh(new T3.BoxGeometry(pitch * 5 + .4, 1.1, .3), new T3.MeshLambertMaterial({ color: '#1d1030' })); mask.position.set(0, 1.25, LL + .9); SC.add(mask);
    for (const k of [-2, -1, 0, 1, 2]) { const s = new T3.Mesh(new T3.PlaneGeometry(pitch - .3, .5), new T3.MeshBasicMaterial({ color: ['#ff3d9a', '#3dd6ff', '#ffd23f', '#3dd6ff', '#ff3d9a'][k + 2], transparent: true, opacity: .85 })); s.position.set(k * pitch, 1.25, LL + .74); s.rotation.y = Math.PI; SC.add(s); }
    const back = new T3.Mesh(new T3.PlaneGeometry(40, 8), new T3.MeshLambertMaterial({ color: '#140a22' })); back.position.set(0, 3, BW.DECK_END + 1.4); back.rotation.y = Math.PI; SC.add(back);
    // Disko-Kugeln über der Halle
    for (const [x, z] of [[-3, 6], [3, 12]]) { const d = new T3.Mesh(new T3.IcosahedronGeometry(.25, 1), new T3.MeshPhongMaterial({ color: '#cccccc', flatShading: true, shininess: 100, specular: 0xffffff })); d.position.set(x, 3.2, z); d.userData.disco = 1; SC.add(d); }
    // Sitzbereich hinten
    for (const s of [-1, 1]) { const so = new T3.Mesh(new T3.BoxGeometry(1.6, .45, .6), new T3.MeshLambertMaterial({ color: '#5b2c91' })); so.position.set(s * 1.4, .2, -4.3); SC.add(so); }
  }
  let pgc = null; const pinGeoCache = () => pgc || (pgc = pinGeo());
  function resize() { if (!R) return; const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight; R.setSize(w, h, false); CAM.aspect = w / h; CAM.fov = CAM.aspect < 1 ? 64 : 52; CAM.updateProjectionMatrix(); }
  function setLane(l) { L = l; ballQ.identity(); pins.forEach(p => { p.fall = 0; }); }
  function setBallColor(i) { ballMat.map = ballTex(BALLCOL[i % BALLCOL.length]); ballMat.needsUpdate = true; }
  function setBowler(ch) {
    if (bowler && bowlerId === (ch && ch.id)) return; if (bowler) { SC.remove(bowler); bowler = null; }
    bowlerId = ch ? ch.id : ''; if (!ch) return;
    bowler = M.build(ch); SC.add(bowler); bowler.userData.F = { state: 'idle', t: 0 };
    bowler.position.set(0, 0, 0); bowler.rotation.y = 0; bowler.updateMatrixWorld(true);
    const v = new T3.Vector3(0, -.42, 0); bowler.userData.J.rEl.localToWorld(v); handOff = v.x;
  }

  /* ---------- Bild ---------- */
  const v3 = new T3.Vector3(), cp = new T3.Vector3(), cl = new T3.Vector3(), q = new T3.Quaternion(), ax = new T3.Vector3(), up = new T3.Vector3(0, 1, 0);
  let camPos = new T3.Vector3(0, 1.8, -4), camLook = new T3.Vector3(0, 0, 8);
  // ui: { aim:{x,angle,spin,power}, bowl:{phase,t}, guide, mood }
  function update(dt, ui) {
    if (!R) return; t += dt; ui = ui || {};
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    SC.children.forEach(o => { if (o.userData.disco) o.rotation.y += dt * .6; });
    // Kegel
    if (L) L.pins.forEach((p, i) => {
      const P = pins[i], g = P.g; if (p.gone && P.fall >= 1.4) { g.visible = false; return; }
      g.visible = true;
      if (p.down) P.fall = Math.min(p.gone ? 1.4 : 1, P.fall + dt * 4.5); else P.fall = 0;
      const a = Math.min(1, P.fall) * Math.PI / 2;
      g.position.set(wx(p.x), Math.sin(a) * .055 - (p.gone ? Math.max(0, P.fall - 1) * .8 : 0), p.z);
      if (a > 0) { v3.set(wx(p.fx || 0), 0, p.fz || 1).normalize(); ax.crossVectors(up, v3).normalize(); g.quaternion.setFromAxisAngle(ax, a); }
      else g.quaternion.identity();
    });
    // Kugel
    const b = L && L.ball, aim = ui.aim;
    if (b) {
      const dx = wx(b.x) - ball.position.x, dz = b.z - ball.position.z, d = Math.sqrt(dx * dx + dz * dz);
      if (d > 1e-6 && d < 1) { ax.set(dz, 0, -dx).normalize(); q.setFromAxisAngle(ax, d / BW.BALL_R); ballQ.premultiply(q); }
      ball.position.set(wx(b.x), BW.BALL_R - (b.gutter ? .05 : 0) - (b.pit ? Math.min(.4, L.after * .8) : 0), b.z); ball.visible = !(b.pit && L.after > .5);
    }
    ball.quaternion.copy(ballQ);
    // Bowler
    if (bowler) {
      const F = bowler.userData.F, bw = ui.bowl || { phase: 'idle', t: 0 }, ballX = bw.x != null ? bw.x : aim ? aim.x : b ? b.x : 0;
      F.state = bw.phase === 'walk' ? 'walk' : ui.mood === 'win' ? 'win' : ui.mood === 'sad' ? 'hit' : 'idle'; F.t = 0;
      M.apply(bowler, F, dt, t);
      let z = -2.3; const k = bw.t;
      if (bw.phase === 'walk') z = -2.3 + k * 1.75; else if (bw.phase === 'swing' || bw.phase === 'release') z = -.55; else if (bw.phase === 'after') z = -.55;
      bowler.position.set(mode === 'select' ? 0 : wx(ballX) - handOff, 0, z); bowler.rotation.y = mode === 'select' ? Math.sin(t * .6) * .5 : 0;
      if (bw.phase === 'swing' || bw.phase === 'release' || (bw.phase === 'after' && bw.t < .6)) bowlPose(bowler.userData.J, bw.phase === 'swing' ? k : 1, bw.phase === 'after' ? Math.max(0, 1 - bw.t / .6) : 1);
      else if (bw.phase === 'walk') { const J = bowler.userData.J; J.rSh.rotation.x = -.2 + Math.sin(k * Math.PI) * .9; J.rEl.rotation.x = 0; J.lSh.rotation.set(-.3, 0, .3); J.lEl.rotation.x = -.4; }
      else if (!ui.mood) { const J = bowler.userData.J; J.rSh.rotation.set(-.12, 0, -.08); J.rEl.rotation.x = -.35; J.lSh.rotation.set(-.15, 0, .18); J.lEl.rotation.x = -.5; }
      // Kugel in der Hand
      if (!b && ui.holding) { bowler.updateMatrixWorld(true); v3.set(0, -.48, 0); bowler.userData.J.rEl.localToWorld(v3); ball.position.copy(v3); ball.position.y = Math.max(BW.BALL_R, v3.y); ball.visible = true; }
    } else if (!b && aim) { ball.position.set(wx(aim.x), BW.BALL_R, -.3); ball.visible = true; }
    // Zielhilfe: Bahn der Kugel auf dem Öl (ohne Kegel)
    const show = !!(aim && ui.guide && !b);
    aimLine.visible = aimArrow.visible = show;
    if (show) {
      const T = { ball: null, pins: [], t: 0, after: 0, ev: [] }; BW.throwBall(T, { x: aim.x, angle: aim.angle, speed: aim.speed || 8, spin: aim.spin }); const pts = [];
      while (T.ball.z < (ui.longGuide ? BW.LANE_L : 11) && !T.ball.gutter && pts.length < 400) { pts.push(new T3.Vector3(wx(T.ball.x), .006, T.ball.z)); BW.step(T, 1 / 30); }
      pts.push(new T3.Vector3(wx(T.ball.x), .006, T.ball.z));
      aimLine.geometry.dispose(); aimLine.geometry = new T3.BufferGeometry().setFromPoints(pts); aimLine.computeLineDistances();
      aimArrow.position.set(wx(aim.x + Math.sin(aim.angle) * 1.1), .02, 1.1 + Math.sin(t * 5) * .05); aimArrow.rotation.y = Math.atan2(wx(Math.sin(aim.angle)), Math.cos(aim.angle));
    }
    camera(dt, ui);
    R.render(SC, CAM);
  }
  // Abwurf-Pose: k 0..1 (Rückschwung → Vorschwung), w = Gewicht
  function bowlPose(J, k, w) {
    const sw = k < .5 ? k / .5 : 1, fw = k < .5 ? 0 : (k - .5) / .5;
    const sh = (1.3 * sw - 2.6 * fw) * w;
    J.rSh.rotation.x = sh; J.rSh.rotation.z = 0; J.rEl.rotation.x = 0;
    J.spine.rotation.x = (.25 + .3 * fw) * w; J.lSh.rotation.set(-.6 * w, 0, .9 * w);
    J.lHip.rotation.x = -1.0 * w; J.lKnee.rotation.x = 1.0 * w; J.rHip.rotation.set(.5 * w, 0, -.5 * w); J.rKnee.rotation.x = .3 * w; J.hip.position.y = .95 - .22 * w;
  }
  function camera(dt, ui) {
    const b = L && L.ball, por = CAM.aspect < 1;
    if (mode === 'select' && bowler) { const p = bowler.position; cp.set(p.x - .6, 1.0, p.z + 3.8); cl.set(p.x, .5, p.z); }
    else if (mode === 'menu' || !L) { const a = t * .12; cp.set(Math.sin(a) * 2.2, 1.6, -2 + Math.cos(a) * .8); cl.set(0, por ? -2.6 : .4, 9); }
    else if (b && b.z > BW.LANE_L - 4.5) { cp.set(wx(b.x) * .3, .85 + (por ? .3 : 0), BW.LANE_L - 2.5 - (por ? 1 : 0)); cl.set(0, .12, BW.LANE_L + .5); }
    else if (b) { cp.set(wx(b.x) * .5, 1.15 + (por ? .4 : 0), b.z - 2.6 - (por ? .8 : 0)); cl.set(wx(b.x) * .3, 0, b.z + 6); }
    else { const bx = ui.bowl && ui.bowl.x != null ? wx(ui.bowl.x) : 0; cp.set(bx + handOff * 2.2, 2.2 + (por ? .6 : 0), -4.7 - (por ? 1.3 : 0)); cl.set(bx * .5, 0, 9); }
    const k = Math.min(1, dt * (b ? 5 : 3)); camPos.lerp(cp, k); camLook.lerp(cl, k); CAM.position.copy(camPos); CAM.lookAt(camLook);
  }
  window.BWScene = { init, setLane, setBowler, setBallColor, update, resize, set mode(v) { mode = v; }, get mode() { return mode; }, BALLCOL, snap() { camPos.copy(cp); camLook.copy(cl); } };
})();
