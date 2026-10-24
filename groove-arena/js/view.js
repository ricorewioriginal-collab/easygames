/* Groove Arena – 3D-Bühne: Vortänzer-Figur aus glänzenden Körperteilen (Lage = GACore.joints, also genau die Pose, die bewertet wird),
 * neun eigene Tänzer-Typen je Stil, Leucht-Umriss, LED-Tanzfläche im Takt, Lichtkegel, Funken; Piktogramme der nächsten Moves (2D).
 * Kamera fest von vorn: rechts im Bild = linke Seite der Figur – der Spieler tanzt spiegelbildlich mit. */
(function () {
  'use strict';
  const T = THREE, PI = Math.PI, C = GACore;
  let R, scene, cam, key, rim, W = 1, H = 1, time = 0, floor = null, beams = [], fig = null, look = null, spark = null, glowK = 0, beatPh = 0;
  const lin = c => new T.Color(c).convertSRGBToLinear();
  // eigene Tänzer-Typen (kein Vorbild): Haut, Haare, Oberteil, Hose, Schuhe, Umriss, Extra
  const LOOKS = {
    pop: { name: 'Mila', skin: '#f1c7a5', hair: '#ff5aa8', top: '#3ad8ff', pants: '#2a2a6a', shoe: '#ffffff', glow: '#ff3aa8', extra: 'pony', bg: ['#2a0a5a', '#ff3aa8'] },
    hiphop: { name: 'Kenzo', skin: '#8a5a3a', hair: '#1a1a1a', top: '#ffd23a', pants: '#3a3a3a', shoe: '#ff3a3a', glow: '#ffd23a', extra: 'cap', bg: ['#101030', '#ffb020'] },
    latin: { name: 'Luz', skin: '#d8a070', hair: '#2a1208', top: '#ff3a4a', pants: '#1a0a1a', shoe: '#ffd23a', glow: '#ff6a3a', extra: 'flower', bg: ['#3a0a1a', '#ff6a3a'] },
    kpop: { name: 'Yuna', skin: '#f3d2b8', hair: '#c8a8ff', top: '#ffffff', pants: '#ff7ad0', shoe: '#ffffff', glow: '#b06aff', extra: 'buns', bg: ['#1a0a3a', '#b06aff'] },
    disco: { name: 'Dex', skin: '#c88a5a', hair: '#2a1a0a', top: '#ffe040', pants: '#ff3aa8', shoe: '#ffffff', glow: '#3ad8ff', extra: 'afro', bg: ['#1a0838', '#3ad8ff'] },
    kids: { name: 'Kiki', skin: '#f4d0b0', hair: '#ff8a3a', top: '#3ae07a', pants: '#3a8aff', shoe: '#ffd23a', glow: '#3ae07a', extra: 'ears', bg: ['#0a2a4a', '#3ae07a'] },
    fitness: { name: 'Max', skin: '#e0a880', hair: '#3a2010', top: '#ff3a6a', pants: '#1a1a2a', shoe: '#3ad8ff', glow: '#ff3a6a', extra: 'band', bg: ['#1a0a1a', '#ff3a6a'] },
    line: { name: 'Dolly', skin: '#f0c8a8', hair: '#ffd86a', top: '#3a8aff', pants: '#5a3a1a', shoe: '#8a4a1a', glow: '#ffb020', extra: 'hat', bg: ['#2a1608', '#ffb020'] },
    party: { name: 'Toni', skin: '#e8b890', hair: '#4a2a1a', top: '#b06aff', pants: '#2a2a3a', shoe: '#ffffff', glow: '#ffd23a', extra: 'shades', bg: ['#1a0a3a', '#ffd23a'] },
    schlager: { name: 'Sepp', skin: '#f0c0a0', hair: '#c88a3a', top: '#ffffff', pants: '#3a5a2a', shoe: '#3a2a1a', glow: '#3ae07a', extra: 'feather', bg: ['#0a2a1a', '#3ae07a'] },
  };
  const MC = {}; const mat = (c, o) => { const k = c + JSON.stringify(o || {}); return MC[k] || (MC[k] = new T.MeshPhysicalMaterial(Object.assign({ color: lin(c), roughness: .35, clearcoat: .7, clearcoatRoughness: .25 }, o || {}))); };
  const glowMat = c => new T.MeshBasicMaterial({ color: lin(c), side: T.BackSide, transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false });
  // Kapsel (Höhe 1, entlang y, Mitte 0) – wird pro Glied gestreckt
  function capsule(r1, r2, seg) { const pts = []; const n = 6; for (let i = 0; i <= n; i++) { const a = -PI / 2 + i / n * PI / 2; pts.push(new T.Vector2(Math.cos(a) * r1, -.5 + Math.sin(a) * r1)); } for (let i = 0; i <= n; i++) { const a = i / n * PI / 2; pts.push(new T.Vector2(Math.cos(a) * r2, .5 + Math.sin(a) * r2)); } return new T.LatheGeometry(pts, seg || 14); }
  function init(canvas) {
    R = BREnv.renderer(canvas, { maxDpr: matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75, exposure: 1.15, alpha: true }); scene = new T.Scene();
    scene.environment = BREnv.env(R, { top: '#5a3aaa', mid: '#ffc8e8', bot: '#201040' });
    cam = new T.PerspectiveCamera(32, 1, .1, 120); cam.position.set(0, 1.25, 6.2); cam.lookAt(0, 1.0, 0);
    scene.add(new T.HemisphereLight(0xd8c8ff, 0x302048, .6));
    key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(2.5, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -1, near: 1, far: 20 }); key.shadow.bias = -.0005; scene.add(key);
    rim = new T.PointLight(0xff3aa8, 1.6, 12); rim.position.set(-2.5, 2.5, -2); scene.add(rim); const rim2 = new T.PointLight(0x3ad8ff, 1.3, 12); rim2.position.set(2.5, 2, -1.5); scene.add(rim2);
    // LED-Tanzfläche
    const fc = document.createElement('canvas'); fc.width = fc.height = 512; const fx = fc.getContext('2d'); const ft = new T.CanvasTexture(fc); ft.encoding = T.sRGBEncoding;
    floor = new T.Mesh(new T.CircleGeometry(3.4, 64), new T.MeshPhysicalMaterial({ map: ft, color: new T.Color(.35, .35, .4), emissiveMap: ft, emissive: new T.Color(1, 1, 1), emissiveIntensity: .7, roughness: .45, clearcoat: .25, envMapIntensity: .25 })); floor.rotation.x = -PI / 2; floor.receiveShadow = true; floor.userData = { fx, ft }; scene.add(floor);
    const ring = new T.Mesh(new T.TorusGeometry(3.4, .04, 8, 96), new T.MeshBasicMaterial({ color: 0xffffff })); ring.rotation.x = PI / 2; ring.position.y = .01; scene.add(ring); floor.userData.ring = ring;
    // Lichtkegel hinter der Figur
    const cg = new T.ConeGeometry(1.1, 9, 24, 1, true); cg.translate(0, -4.5, 0);
    for (let i = 0; i < 6; i++) { const m = new T.Mesh(cg, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .08, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); m.position.set(-4 + i * 1.6, 7.5, -4); m.userData.i = i; scene.add(m); beams.push(m); }
    // Funken
    const sg = new T.BufferGeometry(), N = 160, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 9; pos[i * 3 + 1] = Math.random() * 5; pos[i * 3 + 2] = -3 - Math.random() * 3; } sg.setAttribute('position', new T.BufferAttribute(pos, 3));
    spark = new T.Points(sg, new T.PointsMaterial({ size: .05, color: 0xffffff, transparent: true, opacity: .8, blending: T.AdditiveBlending, depthWrite: false })); scene.add(spark);
    setLook('pop');
  }
  function resize(w, h) { W = Math.max(1, w); H = Math.max(1, h); R.setSize(W, H, false); cam.aspect = W / H; cam.fov = W < H * .8 ? 44 : 32; cam.position.z = W < H * .8 ? 5.6 : 6.2; cam.updateProjectionMatrix(); }
  /* ---------- Figur ---------- */
  function setLook(style) {
    look = LOOKS[style] || LOOKS.pop; if (fig) { scene.remove(fig.g); fig.g.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); }
    const g = new T.Group(), parts = {}, L = look, skin = mat(L.skin, { clearcoat: .3, roughness: .45 }), top = mat(L.top), pants = mat(L.pants), shoe = mat(L.shoe, { clearcoat: 1, roughness: .2 }), hair = mat(L.hair, { roughness: .5 }), gm = glowMat(L.glow);
    const limb = (n, r1, r2, m) => { const geo = capsule(r1, r2), me = new T.Mesh(geo, m); me.castShadow = true; const gl = new T.Mesh(geo, gm); gl.scale.set(1.18, 1, 1.18); me.add(gl); gl.userData.glow = 1; g.add(me); parts[n] = me; return me; };
    limb('uaL', .075, .065, top); limb('uaR', .075, .065, top); limb('faL', .06, .05, skin); limb('faR', .06, .05, skin);
    limb('thL', .11, .085, pants); limb('thR', .11, .085, pants); limb('snL', .08, .065, pants); limb('snR', .08, .065, pants);
    { const pts = [[.13, -.5], [.165, -.36], [.15, -.12], [.18, .12], [.205, .3], [.19, .42], [.1, .5], [.04, .52]].map(([r, y]) => new T.Vector2(r, y)), geo = new T.LatheGeometry(pts, 24), me = new T.Mesh(geo, top); me.castShadow = true; const gl = new T.Mesh(geo, gm); gl.scale.set(1.12, 1.03, 1.12); gl.userData.glow = 1; me.add(gl); g.add(me); parts.torso = me; me.userData.sz = .74; }
    limb('neck', .05, .05, skin);
    // Gelenk-Kugeln (weiche Übergänge an Schultern, Ellbogen, Hüfte, Knien)
    [['jshL', .08, top], ['jshR', .08, top], ['jelL', .064, top], ['jelR', .064, top], ['jknL', .085, pants], ['jknR', .085, pants], ['jhpL', .11, pants], ['jhpR', .11, pants]].forEach(([n, r, m]) => { const me = new T.Mesh(new T.SphereGeometry(r, 16, 12), m); me.castShadow = true; g.add(me); parts[n] = me; });
    const pelvis = new T.Mesh(new T.SphereGeometry(.19, 20, 14), pants); pelvis.scale.set(1.05, .7, .8); pelvis.castShadow = true; g.add(pelvis); parts.pelvis = pelvis;
    const head = new T.Group(); g.add(head); parts.head = head; const hm = new T.Mesh(new T.SphereGeometry(.15, 28, 20), skin); hm.scale.set(1, 1.1, 1); hm.castShadow = true; head.add(hm);
    const hg = new T.Mesh(new T.SphereGeometry(.15, 20, 14), gm); hg.scale.set(1.14, 1.24, 1.14); head.add(hg);
    const hairCap = new T.Mesh(new T.SphereGeometry(.168, 24, 14, 0, PI * 2, 0, PI * .6), hair); hairCap.rotation.x = -.35; hairCap.position.set(0, .02, -.01); hairCap.scale.set(1.02, 1.1, 1.05); head.add(hairCap);
    [-1, 1].forEach(s => { const e = new T.Mesh(new T.SphereGeometry(.026, 12, 8), mat('#ffffff', { roughness: .1 })); e.position.set(s * .052, .02, .135); head.add(e); const p = new T.Mesh(new T.SphereGeometry(.014, 10, 6), mat('#1a1020', { roughness: .1 })); p.position.set(s * .052, .02, .157); head.add(p); });
    const smile = new T.Mesh(new T.TorusGeometry(.04, .009, 6, 12, PI), mat('#a02a4a')); smile.rotation.z = PI; smile.position.set(0, -.045, .14); head.add(smile);
    // Extras je Typ
    const ex = L.extra;
    if (ex === 'pony') { const p = new T.Mesh(capsule(.05, .03), hair); p.scale.set(1, .32, 1); p.position.set(0, .06, -.16); p.rotation.x = .9; head.add(p); }
    if (ex === 'cap') { const c = new T.Mesh(new T.SphereGeometry(.162, 20, 10, 0, PI * 2, 0, PI / 2), mat('#ff3a3a')); c.position.y = .03; head.add(c); const b = new T.Mesh(new T.CylinderGeometry(.13, .13, .015, 20, 1, false, -PI / 2, PI), mat('#ff3a3a')); b.position.set(0, .035, .1); b.scale.z = 1.3; head.add(b); }
    if (ex === 'flower') { const f = new T.Mesh(new T.SphereGeometry(.045, 10, 8), mat('#ffd23a')); f.position.set(.12, .08, .06); head.add(f); }
    if (ex === 'buns') [-1, 1].forEach(s => { const b = new T.Mesh(new T.SphereGeometry(.06, 12, 10), hair); b.position.set(s * .1, .14, -.02); head.add(b); });
    if (ex === 'afro') { const a = new T.Mesh(new T.IcosahedronGeometry(.21, 2), hair); a.position.set(0, .11, -.07); a.scale.set(1.05, .95, .8); head.add(a); }
    if (ex === 'ears') [-1, 1].forEach(s => { const e = new T.Mesh(new T.ConeGeometry(.05, .1, 8), hair); e.position.set(s * .1, .17, 0); e.rotation.z = -s * .4; head.add(e); });
    if (ex === 'band') { const b = new T.Mesh(new T.TorusGeometry(.152, .018, 8, 24), mat('#ffffff')); b.rotation.x = PI / 2 - .2; b.position.y = .06; head.add(b); }
    if (ex === 'hat') { const br = new T.Mesh(new T.CylinderGeometry(.3, .3, .02, 24), mat('#c87a3a')); br.position.y = .1; br.scale.z = .8; head.add(br); const cr = new T.Mesh(new T.CylinderGeometry(.13, .16, .14, 18), mat('#c87a3a')); cr.position.y = .17; head.add(cr); }
    if (ex === 'shades') { const s = new T.Mesh(new T.BoxGeometry(.2, .05, .02), mat('#101018', { metalness: .8, roughness: .1 })); s.position.set(0, .025, .15); head.add(s); }
    if (ex === 'feather') { const h = new T.Mesh(new T.CylinderGeometry(.12, .15, .1, 18), mat('#3a5a2a')); h.position.y = .15; head.add(h); const f = new T.Mesh(new T.ConeGeometry(.02, .18, 6), mat('#ffffff')); f.position.set(.1, .24, -.02); f.rotation.z = -.4; head.add(f); }
    ['haL', 'haR'].forEach(n => { const h = new T.Mesh(new T.SphereGeometry(.058, 14, 10), skin); h.castShadow = true; g.add(h); parts[n] = h; });
    ['toL', 'toR'].forEach(n => { const s = new T.Mesh(capsule(.065, .06), shoe); s.castShadow = true; g.add(s); parts[n] = s; });
    scene.add(g); fig = { g, parts }; setBg(look.bg); return look;
  }
  const _a = new T.Vector3(), _b = new T.Vector3(), _d = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
  function place(m, A, B, extra) { _a.set(A[0], A[1], A[2]); _b.set(B[0], B[1], B[2]); _d.subVectors(_b, _a); const l = _d.length(); m.position.copy(_a).addScaledVector(_d, .5); m.quaternion.setFromUnitVectors(UP, _d.normalize()); m.scale.set(1, Math.max(.01, l + (extra || 0)), 1); }
  let smooth = null;
  function pose(p, dt) {
    if (!fig) return; if (!smooth) smooth = Object.assign({}, p); const k = Math.min(1, (dt || .016) * 30); for (const key in p) smooth[key] = smooth[key] === undefined ? p[key] : smooth[key] + (p[key] - smooth[key]) * k;
    const J = C.joints(smooth), P = fig.parts;
    place(P.uaL, J.shL, J.elL); place(P.uaR, J.shR, J.elR); place(P.faL, J.elL, J.wrL); place(P.faR, J.elR, J.wrR);
    place(P.thL, J.hpL, J.knL); place(P.thR, J.hpR, J.knR); place(P.snL, J.knL, J.anL); place(P.snR, J.knR, J.anR);
    place(P.torso, J.pelvis, J.neck, -.06); P.torso.scale.x = 1; P.torso.scale.z = .74; P.torso.rotation.y += 0;
    for (const n of ['shL', 'shR', 'elL', 'elR', 'knL', 'knR', 'hpL', 'hpR']) { const j = J[n]; P['j' + n].position.set(j[0], j[1], j[2]); } place(P.neck, J.neck, J.head, -.12);
    P.pelvis.position.set(J.pelvis[0], J.pelvis[1] - .02, J.pelvis[2]); P.pelvis.rotation.y = (smooth.ry || 0) * PI / 180;
    P.head.position.set(J.head[0], J.head[1] + .02, J.head[2]); P.head.rotation.set(0, ((smooth.ry || 0) + (smooth.hy || 0)) * PI / 180, -(smooth.ht || 0) * PI / 180 - (smooth.tilt || 0) * PI / 360);
    P.haL.position.set(J.haL[0], J.haL[1], J.haL[2]); P.haR.position.set(J.haR[0], J.haR[1], J.haR[2]); place(P.toL, J.anL, J.toL, -.08); place(P.toR, J.anR, J.toR, -.08);
  }
  function setBg(c) { const cv = R.domElement; cv.style.background = `radial-gradient(ellipse at 50% 30%, ${c[1]}88, ${c[0]} 65%)`; }
  function beat(ph) { beatPh = ph; }
  function gold() { glowK = 1; }
  function drawFloor() { const { fx, ft } = floor.userData, s = 512, n = 12, pulse = Math.pow(1 - beatPh, 3); fx.fillStyle = '#0a0418'; fx.fillRect(0, 0, s, s); const cols = [look.glow, look.top, look.hair, '#ffffff'];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const d = Math.hypot(i - n / 2 + .5, j - n / 2 + .5), on = ((Math.floor(time * 2) + i * 3 + j * 5) % 7 === 0) || (d < 1 + pulse * 5 && d > pulse * 5 - 1.5); fx.fillStyle = on ? cols[(i + j) % cols.length] : '#1a1030'; fx.globalAlpha = on ? .55 + pulse * .45 : 1; fx.fillRect(i * s / n + 2, j * s / n + 2, s / n - 4, s / n - 4); }
    fx.globalAlpha = 1; ft.needsUpdate = true; }
  let fl = 0;
  function render(dt) { time += dt; fl += dt; if (fl > .05) { fl = 0; drawFloor(); }
    glowK = Math.max(0, glowK - dt * .8); const gc = glowK > 0 ? lin('#ffd23a') : lin(look.glow);
    if (fig) fig.g.traverse(o => { if (o.userData.glow || (o.material && o.material.blending === T.AdditiveBlending && o.material.side === T.BackSide)) { o.material.color.copy(gc); o.material.opacity = .4 + Math.pow(1 - beatPh, 2) * .25 + glowK * .5; } });
    beams.forEach(b => { b.rotation.z = Math.sin(time * .8 + b.userData.i) * .5; b.material.opacity = .05 + Math.pow(1 - beatPh, 2) * .07 + glowK * .15; b.material.color.copy(lin([look.glow, '#ffffff', look.top][b.userData.i % 3])); });
    spark.rotation.y = Math.sin(time * .2) * .2; floor.userData.ring.material.color.copy(lin(glowK > 0 ? '#ffd23a' : look.glow));
    cam.position.x = Math.sin(time * .3) * .15; cam.lookAt(0, 1.0, 0); R.render(scene, cam); }
  let q = 2; function quality(l) { if (l === undefined) return q; q = l; R.setPixelRatio(l >= 2 ? Math.min(devicePixelRatio || 1, 1.75) : l === 1 ? 1 : .7); R.shadowMap.enabled = l > 0; key.castShadow = l > 0; resize(W, H); }

  /* ---------- Piktogramme (2D) ---------- */
  const PC = {};
  function picto(mv, hit, col, sz) { // Strichfigur der Haltung am Treffer-Zeitpunkt
    const k = mv.n + (mv.mirror ? '~' : '') + hit + col + sz; if (PC[k]) return PC[k];
    const c = document.createElement('canvas'); c.width = c.height = sz; const x = c.getContext('2d'), J = C.joints(C.poseAt(mv, hit)), s = sz / 2.3, X = p => sz / 2 + p[0] * s, Y = p => sz * .96 - p[1] * s;
    const segs = [['shL', 'elL', 'wrL', 'haL'], ['shR', 'elR', 'wrR', 'haR'], ['hpL', 'knL', 'anL', 'toL'], ['hpR', 'knR', 'anR', 'toR'], ['pelvis', 'neck']];
    const stroke = (w, cc) => { x.strokeStyle = cc; x.lineWidth = w; x.lineCap = x.lineJoin = 'round'; for (const sg of segs) { x.beginPath(); sg.forEach((n, i) => i ? x.lineTo(X(J[n]), Y(J[n])) : x.moveTo(X(J[n]), Y(J[n]))); x.stroke(); } x.beginPath(); x.moveTo(X(J.shL), Y(J.shL)); x.lineTo(X(J.shR), Y(J.shR)); x.stroke(); x.beginPath(); x.moveTo(X(J.hpL), Y(J.hpL)); x.lineTo(X(J.hpR), Y(J.hpR)); x.stroke(); };
    stroke(sz * .11, '#ffffff'); stroke(sz * .07, col); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(X(J.head), Y(J.head), sz * .085, 0, 7); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(X(J.head), Y(J.head), sz * .062, 0, 7); x.fill();
    // Bewegungs-Pfeil: wohin die linke Hand der Figur (rechte Hand des Spielers) als Nächstes geht
    const nx = C.joints(C.poseAt(mv, Math.min(mv.b - .01, hit + .5))).haL, d = [X(nx) - X(J.haL), Y(nx) - Y(J.haL)], dl = Math.hypot(d[0], d[1]);
    if (dl > sz * .08) { x.strokeStyle = '#ffffff'; x.lineWidth = sz * .035; x.beginPath(); x.moveTo(X(J.haL), Y(J.haL)); x.lineTo(X(J.haL) + d[0] * .8, Y(J.haL) + d[1] * .8); x.stroke(); }
    return PC[k] = c;
  }
  window.GAView = { init, resize, setLook, pose, beat, gold, render, quality, picto, LOOKS, get look() { return look; } };
})();
