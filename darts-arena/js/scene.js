/* Darts-Arena 3D – Szene: Neon-Kneipe mit Ziegelwand, Dartboard nach Turniermaß (Sisal-Fasern, Spinne aus Draht, Zahlenring,
 * LED-Ring), Darts mit Spitze, Barrel, Schaft und Flights; Flugbahn mit Bogen und Taumeln, stecken bleiben, abprallen, herausziehen.
 * Welt in Metern: Board-Mitte (0, 1.73, 0), Abwurflinie bei z = 2.37. Board-Koordinaten (mm) aus js/core.js. */
(function () {
  'use strict';
  const T3 = window.THREE, DA = window.DA;
  const BY = 1.73, OCHE = 2.37, MM = .001;
  let R, SC, CAM, el, low = false, t = 0, mode = 'menu';
  const perf = { a: 1 / 60, n: 0 };
  let reticle, reticleDot, held = null, heldColor = 0;
  const darts = [];   // { g, phase:'fly'|'stuck'|'fall'|'pull', t, p0, p1, arc, dur, hit, off }
  const COL = ['#3dd6ff', '#ffd23f', '#ff3d6e', '#7cff6b', '#b57cff', '#ff8a3d'];
  const wpos = (x, y, z) => new T3.Vector3(x * MM, BY + y * MM, z || 0);

  /* ---------- Texturen ---------- */
  function boardTex() {
    const S = low ? 1024 : 2048, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    const k = S / 2 / 228, cx = S / 2, cy = S / 2, P = r => r * k;
    x.fillStyle = '#0d0d10'; x.fillRect(0, 0, S, S);
    const seg = (r0, r1, i, col) => { const a = (i * 18 - 9 - 90) * Math.PI / 180, b = (i * 18 + 9 - 90) * Math.PI / 180; x.beginPath(); x.arc(cx, cy, P(r1), a, b); x.arc(cx, cy, P(r0), b, a, true); x.closePath(); x.fillStyle = col; x.fill(); };
    for (let i = 0; i < 20; i++) {
      const even = i % 2 === 0, single = even ? '#141416' : '#efe0bd', ring = even ? '#d2202f' : '#0e8a45';
      seg(DA.R_OB, DA.R_TI, i, single); seg(DA.R_TI, DA.R_TO, i, ring); seg(DA.R_TO, DA.R_DI, i, single); seg(DA.R_DI, DA.R_DO, i, ring);
    }
    x.beginPath(); x.arc(cx, cy, P(DA.R_OB), 0, 7); x.fillStyle = '#0e8a45'; x.fill();
    x.beginPath(); x.arc(cx, cy, P(DA.R_IB), 0, 7); x.fillStyle = '#d2202f'; x.fill();
    // Sisal: feine Fasern (radial gepresst) als helle/dunkle Punkte
    const n = low ? 9000 : 32000; for (let i = 0; i < n; i++) { const r = Math.sqrt(Math.random()) * DA.R_DO, a = Math.random() * 7; x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)'; x.fillRect(cx + Math.sin(a) * P(r), cy - Math.cos(a) * P(r), 1.5, 1.5); }
    // Zahlenring
    x.fillStyle = '#f4f4f4'; x.font = '900 ' + Math.round(P(25)) + 'px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    DA.ORDER.forEach((num, i) => { const a = i * 18 * Math.PI / 180; x.fillText(String(num), cx + Math.sin(a) * P(198), cy - Math.cos(a) * P(198)); });
    x.strokeStyle = 'rgba(200,205,215,.55)'; x.lineWidth = P(1.6); x.beginPath(); x.arc(cx, cy, P(180), 0, 7); x.stroke();
    const tx = new T3.CanvasTexture(c); tx.anisotropy = 8; return tx;
  }
  function brickTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#2a1416'; x.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 16; r++) for (let q = -1; q < 5; q++) { const w = 128, h = 32, ox = (r % 2) * 64 + q * w; const l = 18 + Math.random() * 10; x.fillStyle = 'hsl(' + (4 + Math.random() * 10) + ',45%,' + l + '%)'; x.fillRect(ox + 3, r * h + 3, w - 6, h - 6); }
    const tx = new T3.CanvasTexture(c); tx.wrapS = tx.wrapT = T3.RepeatWrapping; tx.repeat.set(6, 3); return tx;
  }
  function woodTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 16; i++) { x.fillStyle = 'hsl(26,' + (35 + i % 3 * 6) + '%,' + (16 + (i * 7) % 9) + '%)'; x.fillRect(0, i * 16, 256, 15); }
    const tx = new T3.CanvasTexture(c); tx.wrapS = tx.wrapT = T3.RepeatWrapping; tx.repeat.set(4, 8); return tx;
  }
  function signTex(txt, col) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d');
    x.font = '900 170px "Trebuchet MS", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = col; x.shadowBlur = 40; x.fillStyle = col; x.fillText(txt, 512, 130); x.shadowBlur = 12; x.fillStyle = '#fff'; x.fillText(txt, 512, 130);
    return new T3.CanvasTexture(c);
  }

  /* ---------- Dart-Modell (Spitze bei z = 0, Flight hinten bei +z) ---------- */
  const geo = {};
  function dartGeo() {
    if (geo.tip) return geo;
    geo.tip = new T3.CylinderGeometry(.0013, .0004, .032, 8); geo.tip.rotateX(Math.PI / 2); geo.tip.translate(0, 0, .016);
    // Barrel mit Rillen (LatheGeometry)
    const pr = [[0, 0], [.0028, .002]]; for (let i = 0; i < 9; i++) { const z = .006 + i * .0045; pr.push([.0036, z], [.0031, z + .002], [.0036, z + .0035]); } pr.push([.0034, .049], [.0022, .052], [0, .052]);
    geo.barrel = new T3.LatheGeometry(pr.map(p => new T3.Vector2(p[0], p[1])), low ? 8 : 14); geo.barrel.rotateX(Math.PI / 2); geo.barrel.translate(0, 0, .032);
    geo.shaft = new T3.CylinderGeometry(.0018, .002, .036, 8); geo.shaft.rotateX(Math.PI / 2); geo.shaft.translate(0, 0, .102);
    // Standard-Flight: Fünfeck, zwei gekreuzte Flächen
    const s = new T3.Shape(); s.moveTo(0, 0); s.lineTo(.016, .012); s.lineTo(.017, .036); s.lineTo(0, .040); s.lineTo(0, 0);
    const f = new T3.ShapeGeometry(s); f.rotateX(Math.PI / 2); f.translate(0, 0, .112);
    const f2 = f.clone(); f2.rotateZ(Math.PI / 2); const f3 = f.clone(); f3.rotateZ(Math.PI); const f4 = f.clone(); f4.rotateZ(-Math.PI / 2);
    geo.flights = [f, f2, f3, f4];
    return geo;
  }
  const mats = {};
  function dartMat(ci) {
    const k = 'c' + ci; if (mats[k]) return mats[k];
    return (mats[k] = { fl: new T3.MeshPhongMaterial({ color: COL[ci % COL.length], side: T3.DoubleSide, shininess: 40, emissive: new T3.Color(COL[ci % COL.length]).multiplyScalar(.18) }), sh: new T3.MeshPhongMaterial({ color: new T3.Color(COL[ci % COL.length]).multiplyScalar(.6), shininess: 80 }) });
  }
  function buildDart(ci) {
    const G = dartGeo(), m = dartMat(ci), g = new T3.Group();
    g.add(new T3.Mesh(G.tip, mats.steel), new T3.Mesh(G.barrel, mats.tung), new T3.Mesh(G.shaft, m.sh));
    G.flights.forEach(f => g.add(new T3.Mesh(f, m.fl)));
    return g;
  }

  /* ---------- Aufbau ---------- */
  function init(container, opt) {
    el = container; low = !!(opt && opt.low);
    R = new T3.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : matchMedia('(pointer: coarse)').matches ? 1.6 : 1.8));
    if (!low) { R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; }
    el.appendChild(R.domElement);
    SC = new T3.Scene(); SC.background = new T3.Color('#0b0710'); SC.fog = new T3.Fog('#0b0710', 6, 14);
    CAM = new T3.PerspectiveCamera(30, 1, .02, 40);
    mats.steel = new T3.MeshPhongMaterial({ color: '#d9dde3', shininess: 120, specular: 0xffffff });
    mats.tung = new T3.MeshPhongMaterial({ color: '#8d939c', shininess: 90, specular: 0xbbbbbb });
    SC.add(new T3.HemisphereLight(0xffe6d0, 0x1a0c18, .55));
    // Board-Beleuchtung: LED-Ring + zwei Spots von oben (wie auf der Bühne)
    const key = new T3.SpotLight(0xffffff, 1.25, 6, .55, .55); key.position.set(0, BY + 1.2, 1.1); key.target.position.set(0, BY, 0);
    if (!low) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004; key.shadow.camera.near = .3; key.shadow.camera.far = 4; }
    SC.add(key, key.target);
    const fill = new T3.PointLight(0xff5aa8, .5, 7); fill.position.set(-2.2, 2.4, 2.5); SC.add(fill);
    const fill2 = new T3.PointLight(0x3dd6ff, .45, 7); fill2.position.set(2.2, 2.2, 2.5); SC.add(fill2);
    room();
    // Board
    const bg = new T3.Group(); bg.position.set(0, BY, 0); SC.add(bg);
    const side = new T3.Mesh(new T3.CylinderGeometry(.229, .229, .04, 64, 1, true), new T3.MeshLambertMaterial({ color: '#111' })); side.rotation.x = Math.PI / 2; side.position.z = -.02; bg.add(side);
    const face = new T3.Mesh(new T3.CircleGeometry(.229, 96), new T3.MeshLambertMaterial({ map: boardTex() })); face.receiveShadow = !low; bg.add(face);
    // Drahtspinne: Ringe und 20 Speichen
    const wire = new T3.MeshPhongMaterial({ color: '#cfd5dc', shininess: 120, specular: 0xffffff });
    for (const r of [DA.R_IB, DA.R_OB, DA.R_TI, DA.R_TO, DA.R_DI, DA.R_DO]) { const w = new T3.Mesh(new T3.TorusGeometry(r * MM, .0006, 4, r > 50 ? 96 : 32), wire); w.position.z = .0006; bg.add(w); }
    for (let i = 0; i < 20; i++) { const a = (i * 18 + 9) * Math.PI / 180, len = (DA.R_DO - DA.R_OB) * MM, w = new T3.Mesh(new T3.BoxGeometry(.0009, len, .0012), wire); const rm = (DA.R_DO + DA.R_OB) / 2 * MM; w.position.set(Math.sin(a) * rm, Math.cos(a) * rm, .0006); w.rotation.z = -a; bg.add(w); }
    // LED-Ring um das Board
    const led = new T3.Mesh(new T3.TorusGeometry(.262, .012, 8, 96), new T3.MeshBasicMaterial({ color: '#fff5e0' })); led.position.z = .03; bg.add(led);
    const ledHousing = new T3.Mesh(new T3.TorusGeometry(.262, .02, 8, 96), new T3.MeshPhongMaterial({ color: '#1c1c22' })); ledHousing.position.z = .02; bg.add(ledHousing);
    // Zielkreuz
    reticle = new T3.Mesh(new T3.RingGeometry(.0085, .0115, 40), new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .9, depthTest: false }));
    reticleDot = new T3.Mesh(new T3.CircleGeometry(.0022, 16), new T3.MeshBasicMaterial({ color: '#3dd6ff', depthTest: false }));
    reticle.renderOrder = reticleDot.renderOrder = 10; SC.add(reticle, reticleDot); reticle.visible = reticleDot.visible = false;
    addEventListener('resize', resize); resize();
  }
  function room() {
    const wall = new T3.Mesh(new T3.PlaneGeometry(12, 5), new T3.MeshLambertMaterial({ map: brickTex() })); wall.position.set(0, 2.5, -.06); wall.receiveShadow = !low; SC.add(wall);
    const floor = new T3.Mesh(new T3.PlaneGeometry(12, 10), new T3.MeshLambertMaterial({ map: woodTex() })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); SC.add(floor);
    for (const s of [-1, 1]) { const sw = new T3.Mesh(new T3.PlaneGeometry(10, 5), new T3.MeshLambertMaterial({ color: '#160b18' })); sw.position.set(s * 4, 2.5, 4); sw.rotation.y = -s * Math.PI / 2; SC.add(sw); }
    // Kabinett (Holztüren offen) und Matte mit Abwurflinie
    const wood = new T3.MeshPhongMaterial({ color: '#3a2014', shininess: 30 });
    const back = new T3.Mesh(new T3.BoxGeometry(.66, .78, .03), new T3.MeshPhongMaterial({ color: '#24120c', shininess: 20 })); back.position.set(0, BY, -.045); SC.add(back);
    for (const s of [-1, 1]) { const d = new T3.Mesh(new T3.BoxGeometry(.33, .78, .025), wood); d.position.set(s * .5, BY, .14); d.rotation.y = s * 1.15; SC.add(d); const panel = new T3.Mesh(new T3.PlaneGeometry(.26, .62), new T3.MeshLambertMaterial({ color: '#0e2a1c' })); panel.position.set(s * .5 + s * .01, BY, .155); panel.rotation.y = s * 1.15 + (s > 0 ? 0 : 0); SC.add(panel); }
    const mat = new T3.Mesh(new T3.PlaneGeometry(.8, 3.2), new T3.MeshLambertMaterial({ color: '#141418' })); mat.rotation.x = -Math.PI / 2; mat.position.set(0, .002, 1.8); SC.add(mat);
    const oche = new T3.Mesh(new T3.BoxGeometry(.7, .038, .05), new T3.MeshBasicMaterial({ color: '#ffd23f' })); oche.position.set(0, .02, OCHE); SC.add(oche);
    // Neon-Schriftzüge
    const sign = new T3.Mesh(new T3.PlaneGeometry(1.5, .38), new T3.MeshBasicMaterial({ map: signTex('DARTS', '#ff3d6e'), transparent: true })); sign.position.set(0, 2.55, -.03); SC.add(sign);
    const s2 = new T3.Mesh(new T3.PlaneGeometry(1.1, .28), new T3.MeshBasicMaterial({ map: signTex('180!', '#3dd6ff'), transparent: true })); s2.position.set(-1.35, 2.05, -.03); SC.add(s2);
    const s3 = new T3.Mesh(new T3.PlaneGeometry(1.1, .28), new T3.MeshBasicMaterial({ map: signTex('GAME ON', '#ffd23f'), transparent: true })); s3.position.set(1.4, 1.35, -.03); SC.add(s3);
    // Kreide-Tafel rechts
    const chalk = new T3.Mesh(new T3.BoxGeometry(.55, .75, .02), new T3.MeshLambertMaterial({ color: '#1a2420' })); chalk.position.set(.82, 1.62, -.04); SC.add(chalk);
    const frame = new T3.Mesh(new T3.BoxGeometry(.6, .8, .015), wood); frame.position.set(.82, 1.62, -.05); SC.add(frame);
    // Lampe über dem Board
    const shade = new T3.Mesh(new T3.ConeGeometry(.16, .14, 24, 1, true), new T3.MeshPhongMaterial({ color: '#1f4d33', side: T3.DoubleSide })); shade.position.set(0, BY + 1.15, 1.1); SC.add(shade);
    const bulb = new T3.Mesh(new T3.SphereGeometry(.04, 12, 8), new T3.MeshBasicMaterial({ color: '#fff3c8' })); bulb.position.set(0, BY + 1.1, 1.1); SC.add(bulb);
  }
  function resize() { if (!R) return; const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight; R.setSize(w, h, false); CAM.aspect = w / h; CAM.updateProjectionMatrix(); }

  /* ---------- Darts ---------- */
  function handPos(cpu) { return cpu ? new T3.Vector3(.28, 1.45, 2.05) : new T3.Vector3(.07, 1.5, OCHE - .45); }
  function setHeld(ci, on) { heldColor = ci; if (held) { SC.remove(held); held = null; } if (on) { held = buildDart(ci); SC.add(held); } }
  // Wurf: aus Board-Punkt (mm) auf das Board; info.off = am Board vorbei
  function throwDart(ci, x, y, opt) {
    opt = opt || {}; const g = buildDart(ci); g.traverse(m => { if (m.isMesh) m.castShadow = !low; }); SC.add(g);
    const p0 = held && !opt.cpu ? held.position.clone() : handPos(opt.cpu), r = Math.hypot(x, y), off = r > DA.R_BOARD;
    const p1 = off ? wpos(x, y, .0) : wpos(x, y, -.011);
    const d = { g, phase: 'fly', t: 0, p0, p1, arc: .09 + Math.random() * .03, dur: .36 + p0.distanceTo(p1) * .03, off, wob: Math.random() * 6, roll: Math.random() * 6, tilt: (Math.random() - .5) * .12, vy: 0 };
    darts.push(d); if (held && !opt.cpu) held.visible = false; return d;
  }
  function pullAll() { darts.forEach(d => { if (d.phase !== 'pull') { d.phase = 'pull'; d.t = 0; d.from = d.g.position.clone(); } }); }
  function clearAll() { darts.forEach(d => SC.remove(d.g)); darts.length = 0; }
  const flying = () => darts.some(d => d.phase === 'fly');

  /* ---------- Bild ---------- */
  const v = new T3.Vector3(), v2 = new T3.Vector3(), camPos = new T3.Vector3(0, 1.7, 3.4), camLook = new T3.Vector3(0, BY, 0), cp = new T3.Vector3(), cl = new T3.Vector3();
  // ui: { aim:{x,y} | null (mm, mit Zittern), reticle, zoom, cpu }
  function update(dt, ui) {
    if (!R) return; t += dt; ui = ui || {};
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    const aim = ui.aim;
    reticle.visible = reticleDot.visible = !!(aim && ui.reticle);
    if (aim) { reticle.position.copy(wpos(aim.x, aim.y, .004)); reticleDot.position.copy(wpos(aim.x, aim.y, .0045)); const s = 1 + Math.sin(t * 6) * .06; reticle.scale.set(s, s, 1); }
    for (let i = darts.length - 1; i >= 0; i--) {
      const d = darts[i], g = d.g; d.t += dt;
      if (d.phase === 'fly') {
        const k = Math.min(1, d.t / d.dur), e = k;
        v.lerpVectors(d.p0, d.p1, e); v.y += d.arc * 4 * e * (1 - e); g.position.copy(v);
        // Ausrichtung: entlang der Flugbahn (Ableitung), dazu leichtes Taumeln
        v2.subVectors(d.p1, d.p0); v2.y += d.arc * 4 * (1 - 2 * e); v2.normalize();
        g.lookAt(v.clone().sub(v2)); g.rotateY(Math.sin(d.t * 38 + d.wob) * .05 * (1 - e)); g.rotateZ(d.roll + d.t * 14);
        if (k >= 1) {
          if (d.off) { d.phase = 'fall'; d.vy = -.2; d.vz = .6; }
          else { d.phase = 'stuck'; g.rotateX(d.tilt); d.t = 0; }
        }
      } else if (d.phase === 'stuck') { if (d.t < .25) g.rotateX(Math.sin(d.t * 70) * .012 * (1 - d.t / .25)); }
      else if (d.phase === 'fall') { d.vy -= 9.8 * dt; g.position.y += d.vy * dt; g.position.z += d.vz * dt; g.rotateX(dt * 6); if (g.position.y < .02) { g.position.y = .02; d.vy = 0; d.vz *= .5; } }
      else if (d.phase === 'pull') { const k = Math.min(1, d.t / .35); g.position.lerpVectors(d.from, v.set(d.from.x * .3 + .15, 1.35, 1.2), k * k); if (k >= 1) { SC.remove(g); darts.splice(i, 1); } }
    }
    camera(dt, ui);
    // gehaltener Dart: unten rechts im Bild (vor der Kamera), zeigt aufs Ziel; beim Ausholen zieht er zurück
    if (held) {
      held.visible = !!(aim && !ui.cpu && !flying() && mode === 'game');
      if (held.visible) {
        const a = aim, pull = ui.pull || 0, d = .4, tv = Math.tan(CAM.fov * Math.PI / 360) * d;
        CAM.getWorldDirection(f3); r3.crossVectors(f3, CAM.up).normalize(); u3.crossVectors(r3, f3).normalize();
        held.position.copy(CAM.position).addScaledVector(f3, d - pull * .05).addScaledVector(u3, -tv * (.62 + pull * .15)).addScaledVector(r3, tv * CAM.aspect * .34);
        held.lookAt(v.copy(wpos(a.x, a.y, 0))); held.rotateY(Math.PI);
      }
    }
    R.render(SC, CAM);
  }
  const f3 = new T3.Vector3(), r3 = new T3.Vector3(), u3 = new T3.Vector3();
  function camera(dt, ui) {
    const por = CAM.aspect < 1;
    if (mode === 'game') {
      // Board passt ins Bild: Hochformat nach der Breite, Querformat nach der Höhe; beim Zielen heranzoomen
      const zoom = ui.zoom && ui.aim, z = zoom ? .74 : 1, dist = OCHE - .05;
      const half = (por ? .3 : .3 / (ui.space || .72)) * z, tanV = por ? half / dist / CAM.aspect : half / dist;
      const fovV = 2 * Math.atan(tanV) * 180 / Math.PI;
      CAM.fov += (fovV - CAM.fov) * Math.min(1, dt * 6); CAM.updateProjectionMatrix();
      const a = zoom ? ui.aim : { x: 0, y: 0 }, lift = por ? -.03 : 0;
      cp.set(.06 + a.x * MM * .2, BY + .09 + a.y * MM * .2, dist); cl.set(a.x * MM * .5, BY + lift + a.y * MM * .5, 0);
    } else if (mode === 'card') {
      // Vorschaubild: schräg von unten rechts, Darts im Triple 20 gut sichtbar
      CAM.fov += (34 - CAM.fov) * Math.min(1, dt * 3); CAM.updateProjectionMatrix();
      cp.set(.42, BY + .02, .62); cl.set(-.04, BY + .06, 0);
    } else {
      const s = Math.sin(t * .15); CAM.fov += ((por ? 52 : 40) - CAM.fov) * Math.min(1, dt * 3); CAM.updateProjectionMatrix();
      cp.set(s * .9, 1.75, 3.1 + Math.cos(t * .15) * .2); cl.set(s * .2, BY - (por ? .1 : .05), 0);
    }
    const k = Math.min(1, dt * 4); camPos.lerp(cp, k); camLook.lerp(cl, k); CAM.position.copy(camPos); CAM.lookAt(camLook);
  }
  // Board-Punkt (mm) → Bildschirm (px)
  function project(x, y) { v.copy(wpos(x, y, 0)).project(CAM); const r = R.domElement.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; }
  function pxPerMm() { const a = project(0, 0), b = project(100, 0); return Math.max(.2, Math.hypot(b.x - a.x, b.y - a.y) / 100); }
  window.DAScene = { init, update, resize, throwDart, pullAll, clearAll, setHeld, flying, project, pxPerMm, COL, set mode(m) { mode = m; }, get mode() { return mode; }, snap() { camPos.copy(cp); camLook.copy(cl); }, get count() { return darts.length; } };
})();
