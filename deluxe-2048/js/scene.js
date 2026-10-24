/* 2048 Deluxe – 3D (Three.js r128): schwebendes Glas-Brett, Kacheln als runde Blöcke (höher je größer die Zahl), Schieben/Verschmelzen/
 * Neue-Kachel-Animationen, Funkenregen, Brett kippt leicht in Schieberichtung, und Moderator „Rico“ als Comic-Figur neben dem Brett
 * (stachelige braune Haare, Vollbart, Septum-Ring, Ohr-Plug mit Kreuz, lila Shirt, Kopfhörer, Podcast-Mikro), der auf das Spiel reagiert. */
(function () {
  'use strict';
  const T3 = window.THREE;
  let R, SC, CAM, el, low = false, grad, OUT, t = 0;
  const perf = { a: 1 / 60, n: 0 };
  const toon = (c, o) => new T3.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, o || {}));
  function outline(mesh, s) { if (low) return mesh; const o = new T3.Mesh(mesh.geometry, OUT); o.scale.setScalar(s || 1.06); mesh.add(o); return mesh; }
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const back = x => { x = Math.min(1, Math.max(0, x)); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  /* ---------- Farben der Kacheln ---------- */
  const PAL = { 2: ['#f4ecff', '#4a2a7a'], 4: ['#e4d0ff', '#4a2a7a'], 8: ['#ffa6cf', '#fff'], 16: ['#ff7aa8', '#fff'], 32: ['#ff6b6b', '#fff'], 64: ['#ff9440', '#fff'],
    128: ['#ffd23f', '#5a3a00'], 256: ['#9be37a', '#21430f'], 512: ['#3ddcc8', '#083b36'], 1024: ['#4aa8ff', '#fff'], 2048: ['#7a2ee8', '#fff'], 4096: ['#2b1a4a', '#ffd23f'] };
  const pal = v => PAL[v] || PAL[4096];
  const lv = v => Math.round(Math.log2(v));
  const tileH = v => .22 + Math.min(14, lv(v)) * .035;

  function roundRect(w, r) { const s = new T3.Shape(), h = w / 2; s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h); s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h); return s; }
  function slab(w, h, r, bev) { const g = new T3.ExtrudeGeometry(roundRect(w - bev * 2, r), { depth: h - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: low ? 1 : 2, curveSegments: low ? 3 : 5 }); g.rotateX(-Math.PI / 2); g.translate(0, bev, 0); return g; }
  const GEO = {}, MAT = {}, LAB = {};
  function tileGeo(v) { const k = Math.min(14, lv(v)); return GEO[k] || (GEO[k] = slab(.88, tileH(v), .14, .07)); }
  function tileMat(v) {
    if (MAT[v]) return MAT[v]; const c = new T3.Color(pal(v)[0]);
    return MAT[v] = toon(c, v >= 128 ? { emissive: c.clone().multiplyScalar(v >= 2048 ? .18 : .22) } : {});
  }
  function labelMat(v) {
    if (LAB[v]) return LAB[v];
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), s = String(v), col = pal(v)[1];
    const fs = s.length <= 2 ? 70 : s.length === 3 ? 58 : s.length === 4 ? 50 : s.length === 5 ? 36 : 30;
    x.font = '900 ' + fs + 'px system-ui,"Segoe UI",Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (col === '#fff') { x.fillStyle = 'rgba(40,10,70,.35)'; x.fillText(s, 64, 68); }
    x.fillStyle = col; x.fillText(s, 64, 64);
    if (v >= 2048) { x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.strokeRect(10, 10, 108, 108); }
    const tx = new T3.CanvasTexture(cv); tx.anisotropy = 2;
    return LAB[v] = new T3.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false });
  }
  let LABGEO;

  /* ---------- Szene ---------- */
  const B = { n: 4, g: null, base: null, slots: null, tiles: new Map(), anim: [], S: 4.6, tilt: { x: 0, z: 0, vx: 0, vz: 0 }, cursor: null, cur: -1 };
  let parts, pData = [], floaters, fData = [];
  function init(container, opt) {
    el = container; low = !!(opt && opt.low);
    grad = (function () { const d = new Uint8Array([85, 155, 225]); const tx = new T3.DataTexture(d, 3, 1, T3.LuminanceFormat); tx.minFilter = tx.magFilter = T3.NearestFilter; tx.needsUpdate = true; return tx; })();
    OUT = new T3.MeshBasicMaterial({ color: 0x1a0b2e, side: T3.BackSide });
    R = new T3.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.5)); el.appendChild(R.domElement);
    SC = new T3.Scene(); CAM = new T3.PerspectiveCamera(38, 1, .1, 100);
    SC.add(new T3.HemisphereLight(0xfff0ff, 0x3a1a66, .75));
    const dl = new T3.DirectionalLight(0xffffff, .75); dl.position.set(-3, 9, 6); SC.add(dl);
    LABGEO = new T3.PlaneGeometry(.8, .8); LABGEO.rotateX(-Math.PI / 2);
    B.g = new T3.Group(); SC.add(B.g);
    // Funken (ein InstancedMesh für alle)
    const PN = low ? 60 : 140; parts = new T3.InstancedMesh(new T3.BoxGeometry(.09, .09, .09), new T3.MeshBasicMaterial({ color: 0xffffff }), PN);
    parts.instanceMatrix.setUsage(T3.DynamicDrawUsage); const hid = new T3.Matrix4().makeScale(0, 0, 0), wc = new T3.Color(1, 1, 1);
    for (let i = 0; i < PN; i++) { parts.setMatrixAt(i, hid); parts.setColorAt(i, wc); pData.push({ life: 0 }); }
    parts.frustumCulled = false; SC.add(parts);
    // schwebende Deko-Würfel im Hintergrund
    const FN = low ? 10 : 26; floaters = new T3.InstancedMesh(new T3.BoxGeometry(.5, .5, .5), toon(0xffffff, { transparent: true, opacity: .55 }), FN);
    const cols = ['#ff7aa8', '#a259ff', '#4aa8ff', '#ffd23f', '#3ddcc8'];
    for (let i = 0; i < FN; i++) { fData.push({ x: (Math.random() - .5) * 26, y: -3 - Math.random() * 6, z: -6 - Math.random() * 10, s: .4 + Math.random() * .9, r: Math.random() * 6, sp: .2 + Math.random() * .5 }); floaters.setColorAt(i, new T3.Color(cols[i % cols.length])); }
    floaters.frustumCulled = false; SC.add(floaters);
    Rico.build(); SC.add(Rico.g);
    addEventListener('resize', resize); resize();
  }
  function buildBoard(n) {
    if (B.base) { B.g.remove(B.base); B.base.geometry.dispose(); }
    if (B.slots) { B.g.remove(B.slots); B.slots.geometry.dispose(); }
    for (const m of B.tiles.values()) B.g.remove(m); B.tiles.clear(); B.anim.length = 0;
    B.n = n; const sc = B.S / n; B.g.scale.setScalar(sc);
    B.base = outline(new T3.Mesh(slab(n + .3, .45, .35, .1), toon(0x2c1656)), 1.012); B.base.position.y = -.45; B.g.add(B.base);
    const rim = new T3.Mesh(slab(n + .42, .12, .4, .04), toon(0xa259ff, { emissive: new T3.Color(0x5a20b0) })); rim.position.y = -.5; B.base.add(rim); rim.position.set(0, -.08, 0);
    B.slots = new T3.InstancedMesh(slab(.9, .05, .14, .02), toon(0x452675), n * n); const m = new T3.Matrix4();
    for (let i = 0; i < n * n; i++) { const p = cellPos(i); m.makeTranslation(p.x, -.02, p.z); B.slots.setMatrixAt(i, m); }
    B.g.add(B.slots);
    if (!B.cursor) { B.cursor = new T3.Mesh(new T3.TorusGeometry(.56, .045, 6, 28), new T3.MeshBasicMaterial({ color: 0xffd23f })); B.cursor.rotation.x = Math.PI / 2; B.cursor.visible = false; }
    B.g.add(B.cursor); B.cur = -1; B.cursor.visible = false;
    layout();
  }
  const cellPos = i => { const n = B.n, x = i % n, y = (i / n) | 0; return { x: x - (n - 1) / 2, z: y - (n - 1) / 2 }; };
  function makeTile(t, i) {
    const g = new T3.Group(), body = outline(new T3.Mesh(tileGeo(t.v), tileMat(t.v)), 1.035), lab = new T3.Mesh(LABGEO, labelMat(t.v));
    lab.position.y = tileH(t.v) + .012; g.add(body, lab); const p = cellPos(i); g.position.set(p.x, 0, p.z); g.userData = { id: t.id, v: t.v, i };
    B.g.add(g); B.tiles.set(t.id, g); return g;
  }
  function setGame(G) {
    if (G.n !== B.n || !B.base) buildBoard(G.n);
    for (const m of B.tiles.values()) B.g.remove(m); B.tiles.clear(); B.anim.length = 0;
    G.cells.forEach((c, i) => { if (c) makeTile(c, i); });
  }
  function finish() { for (const a of B.anim) { a.t = 1e9; stepAnim(a); } B.anim.length = 0; }
  const SL = .1;
  function apply(res) {
    finish();
    for (const mv of res.moves) { const g = B.tiles.get(mv.id); if (!g) continue; const a = cellPos(mv.from), b = cellPos(mv.to); B.anim.push({ k: 'slide', g, a, b, t: 0, d: SL }); }
    for (const mg of res.merges) B.anim.push({ k: 'merge', mg, t: -SL, d: .2 });
    if (res.spawn) B.anim.push({ k: 'spawn', s: res.spawn, t: -SL - .03, d: .16 });
    (res.extra || []).forEach((sp, k) => B.anim.push({ k: 'spawn', s: sp, t: -SL - .12 - k * .08, d: .16 }));
  }
  function stepAnim(a) {
    const x = a.t / a.d;
    if (a.k === 'slide') { const e = ease(x); a.g.position.x = a.a.x + (a.b.x - a.a.x) * e; a.g.position.z = a.a.z + (a.b.z - a.a.z) * e; return x >= 1; }
    if (a.k === 'merge') {
      if (x < 0) return false;
      if (!a.g) {
        for (const id of [a.mg.a, a.mg.b]) { const o = B.tiles.get(id); if (o) { B.g.remove(o); B.tiles.delete(id); } }
        a.g = makeTile({ id: a.mg.id, v: a.mg.v }, a.mg.to); burst(a.mg.to, a.mg.v, a.mg.v >= 128 ? 16 : 7);
      }
      const s = x >= 1 ? 1 : 1 + Math.sin(Math.min(1, x) * Math.PI) * .22; a.g.scale.set(s, 1 + (s - 1) * 2, s); return x >= 1;
    }
    if (a.k === 'spawn') {
      if (x < 0) return false;
      if (!a.g) a.g = makeTile({ id: a.s.id, v: a.s.v }, a.s.i);
      const s = Math.max(.01, back(x)); a.g.scale.set(s, s, s); return x >= 1;
    }
    if (a.k === 'smash') {
      if (x < 0) return false; const s = Math.max(.01, 1 - x); a.g.scale.set(1 + x * .4, s, 1 + x * .4); a.g.position.y = -x * .2;
      if (x >= 1) { B.g.remove(a.g); return true; } return false;
    }
    return true;
  }
  function smash(info, extra) { finish(); const g = B.tiles.get(info.id); if (!g) return; B.tiles.delete(info.id); B.anim.push({ k: 'smash', g, t: 0, d: .22 }); burst(info.i, info.v, 22); (extra || []).forEach((sp, k) => B.anim.push({ k: 'spawn', s: sp, t: -.25 - k * .08, d: .16 })); }
  function select(id, ids) { if (id == null || id < 0) { B.sel = null; for (const g of B.tiles.values()) g.position.y = 0; } else B.sel = { id, p: new Set(ids || []) }; }
  function tilt(dir) { const d = { up: [-1, 0], down: [1, 0], left: [0, 1], right: [0, -1] }[dir]; if (!d) return; B.tilt.vx += d[0] * .45; B.tilt.vz += d[1] * .45; }
  const bump = () => { B.tilt.vx += (Math.random() - .5) * .8; B.tilt.vz += (Math.random() - .5) * .8; };

  // Funken: aus Brett-Koordinaten in Weltkoordinaten
  const tmpV = new T3.Vector3(), tmpM = new T3.Matrix4(), tmpQ = new T3.Quaternion(), tmpS = new T3.Vector3(), tmpC = new T3.Color();
  function burst(i, v, n) {
    const p = cellPos(i); tmpV.set(p.x, tileH(v) + .1, p.z); B.g.localToWorld(tmpV); tmpC.set(pal(v)[0]);
    let k = 0; for (let j = 0; j < pData.length && k < n; j++) { const d = pData[j]; if (d.life > 0) continue; k++;
      const a = Math.random() * 6.283, sp = 1.5 + Math.random() * 2.5; Object.assign(d, { life: .55 + Math.random() * .35, x: tmpV.x, y: tmpV.y, z: tmpV.z, vx: Math.cos(a) * sp, vy: 2.5 + Math.random() * 3, vz: Math.sin(a) * sp, r: Math.random() * 3 });
      parts.setColorAt(j, Math.random() < .3 ? new T3.Color(1, 1, 1) : tmpC); }
    if (parts.instanceColor) parts.instanceColor.needsUpdate = true;
  }
  function confetti(n) { for (let k = 0; k < n; k++) burst(Math.floor(Math.random() * B.n * B.n), [128, 256, 512, 1024, 2048, 8][k % 6], 1); }

  /* ---------- Rico, der Moderator ---------- */
  const Rico = {
    g: null, j: {}, state: 'idle', st: 0, talkT: 0, blinkT: 2, look: 0, face: 0,
    build() {
      const C = { skin: toon(0xf2c6a4), skin2: toon(0xe0a985), hair: toon(0x4b2e1a), beard: toon(0x5e3b22), shirt: toon(0x8645e0), jeans: toon(0x2c3554), shoe: toon(0xf2f2f6), sole: toon(0x333344),
        black: toon(0x17141c), metal: toon(0xe8ebf6, { emissive: new T3.Color(0x55556a) }), white: toon(0xffffff), iris: toon(0x5a3216), mouth: toon(0x3a1010), mic: toon(0x26232b), grey: toon(0x6d6a78) };
      const g = this.g = new T3.Group(), J = this.j, M = (geo, mat, o) => { const m = new T3.Mesh(geo, mat); if (o !== false) outline(m, o || 1.06); return m; };
      // Podest
      const pod = M(new T3.CylinderGeometry(.85, .95, .22, 28), toon(0x2c1656), 1.03); pod.position.y = .11; g.add(pod);
      const ring = new T3.Mesh(new T3.TorusGeometry(.86, .035, 6, 36), new T3.MeshBasicMaterial({ color: 0xff7aa8 })); ring.rotation.x = Math.PI / 2; ring.position.y = .22; g.add(ring);
      const body = J.body = new T3.Group(); body.position.y = .22; g.add(body);
      // Beine und Schuhe
      for (const s of [-1, 1]) {
        const leg = M(new T3.CylinderGeometry(.15, .13, .82, 10), C.jeans, 1.08); leg.position.set(s * .17, .5, 0); body.add(leg);
        const sh = M(new T3.BoxGeometry(.24, .14, .4), C.shoe, 1.08); sh.position.set(s * .18, .07, .07); body.add(sh);
        const so = new T3.Mesh(new T3.BoxGeometry(.25, .04, .41), C.sole); so.position.set(s * .18, .02, .07); body.add(so);
      }
      const up = J.up = new T3.Group(); up.position.y = .9; body.add(up);
      const hip = M(new T3.CylinderGeometry(.33, .31, .2, 16), C.jeans, 1.04); hip.position.y = .02; up.add(hip);
      const torso = M(new T3.CylinderGeometry(.36, .34, .72, 18), C.shirt, 1.04); torso.position.y = .44; up.add(torso);
      const belly = new T3.Mesh(new T3.SphereGeometry(.355, 18, 12), C.shirt); belly.scale.set(1, .9, 1.04); belly.position.set(0, .32, .02); up.add(belly);
      const sho = M(new T3.SphereGeometry(.37, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), C.shirt, 1.04); sho.scale.set(1.08, .45, .9); sho.position.y = .79; up.add(sho);
      // Shirt-Aufdruck: kleine Schallwelle
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const x = cv.getContext('2d'); x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round';
      [10, 22, 34, 18, 40, 26, 14, 30, 12].forEach((h, i) => { x.beginPath(); x.moveTo(16 + i * 12, 32 - h / 2); x.lineTo(16 + i * 12, 32 + h / 2); x.stroke(); });
      const pr = new T3.Mesh(new T3.PlaneGeometry(.34, .17), new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(cv), transparent: true, depthWrite: false })); pr.position.set(0, .5, .372); up.add(pr);
      // Arme (Schulter-Gelenke)
      for (const s of [-1, 1]) {
        const sh = J[s < 0 ? 'armR' : 'armL'] = new T3.Group(); sh.position.set(s * .43, .74, 0); up.add(sh);
        const sl = M(new T3.CylinderGeometry(.14, .13, .3, 10), C.shirt, 1.08); sl.position.y = -.12; sh.add(sl);
        const arm = M(new T3.CylinderGeometry(.095, .085, .5, 10), C.skin, 1.1); arm.position.y = -.45; sh.add(arm);
        const hand = M(new T3.SphereGeometry(.11, 10, 8), C.skin, 1.1); hand.position.y = -.74; sh.add(hand); sh.userData.hand = hand;
      }
      // Kopfhörer um den Hals
      const hp = new T3.Mesh(new T3.TorusGeometry(.27, .035, 6, 20, Math.PI), C.black); hp.rotation.x = Math.PI / 2 + .3; hp.position.set(0, .86, .02); hp.rotation.z = Math.PI; up.add(hp);
      for (const s of [-1, 1]) { const cup = M(new T3.CylinderGeometry(.09, .09, .07, 14), C.black, 1.1); cup.rotation.z = Math.PI / 2; cup.position.set(s * .27, .84, .06); up.add(cup); }
      const neck = new T3.Mesh(new T3.CylinderGeometry(.12, .13, .16, 10), C.skin); neck.position.y = .88; up.add(neck);
      // Kopf
      const head = J.head = new T3.Group(); head.position.y = 1.32; up.add(head);
      const hd = M(new T3.SphereGeometry(.42, 24, 18), C.skin, 1.04); hd.scale.set(1, 1.06, .98); head.add(hd);
      for (const s of [-1, 1]) { const ear = M(new T3.SphereGeometry(.09, 10, 8), C.skin, 1.1); ear.scale.set(.55, 1, .8); ear.position.set(s * .41, -.02, -.02); head.add(ear); }
      // Bart (Vollbart von Ohr zu Ohr) und Schnurrbart
      const bd = M(new T3.SphereGeometry(.445, 24, 14, 0, Math.PI, Math.PI * .58, Math.PI * .36), C.beard, 1.03); bd.scale.set(1.02, 1.18, 1.08); bd.position.set(0, .02, .01); head.add(bd);
      for (const s of [-1, 1]) { const sb = M(new T3.SphereGeometry(.1, 10, 8), C.beard, 1.06); sb.scale.set(.5, 1.5, .9); sb.position.set(s * .385, -.1, .06); head.add(sb); }
      // Kinn-Teil des Barts (rund nach vorn)
      const chin = M(new T3.SphereGeometry(.2, 14, 10), C.beard, 1.05); chin.scale.set(1.25, .85, .8); chin.position.set(0, -.36, .23); head.add(chin);
      for (const s of [-1, 1]) { const mu = M(new T3.SphereGeometry(.08, 10, 8), C.beard, 1.08); mu.scale.set(1.5, .55, .7); mu.position.set(s * .085, -.13, .39); mu.rotation.z = s * -.35; head.add(mu); }
      const mouth = J.mouth = new T3.Mesh(new T3.SphereGeometry(.06, 12, 8), C.mouth); mouth.scale.set(1.5, .35, .5); mouth.position.set(0, -.205, .455); head.add(mouth);
      // Nase mit Septum-Ring
      const nose = M(new T3.SphereGeometry(.07, 12, 10), C.skin2, 1.08); nose.scale.set(1, .95, 1.1); nose.position.set(0, -.03, .43); head.add(nose);
      const sept = new T3.Mesh(new T3.TorusGeometry(.042, .014, 6, 16), C.metal); sept.position.set(0, -.105, .465); sept.rotation.x = -.5; head.add(sept);
      // Augen (braun) und kräftige Augenbrauen
      J.eyes = [];
      for (const s of [-1, 1]) {
        const eye = new T3.Group(); eye.position.set(s * .15, .07, .39); head.add(eye); J.eyes.push(eye);
        const w = new T3.Mesh(new T3.SphereGeometry(.075, 12, 10), C.white); w.scale.set(1, 1.1, .5); eye.add(w);
        const ir = new T3.Mesh(new T3.SphereGeometry(.045, 10, 8), C.iris); ir.scale.set(1, 1, .5); ir.position.z = .03; eye.add(ir);
        const pu = new T3.Mesh(new T3.SphereGeometry(.022, 8, 6), C.black); pu.position.z = .05; eye.add(pu);
        const hl = new T3.Mesh(new T3.SphereGeometry(.012, 6, 4), C.white); hl.position.set(.015, .018, .062); eye.add(hl);
        const br = new T3.Mesh(new T3.BoxGeometry(.15, .04, .04), C.hair); br.position.set(s * .15, .19, .385); br.rotation.z = s * -.12; head.add(br); (J.brows || (J.brows = [])).push(br);
      }
      // Ohr-Plug (schwarz) mit kleinem Kreuz am linken Ohr
      const plug = new T3.Mesh(new T3.CylinderGeometry(.05, .05, .035, 12), C.black); plug.rotation.z = Math.PI / 2; plug.position.set(.455, -.08, 0); head.add(plug);
      const cross = J.cross = new T3.Group(); cross.position.set(.46, -.11, 0); head.add(cross);
      const ch = new T3.Mesh(new T3.CylinderGeometry(.006, .006, .05, 4), C.metal); ch.position.y = -.025; cross.add(ch);
      const cv1 = new T3.Mesh(new T3.BoxGeometry(.016, .085, .016), C.black); cv1.position.y = -.09; cross.add(cv1);
      const ch2 = new T3.Mesh(new T3.BoxGeometry(.055, .016, .016), C.black); ch2.position.y = -.075; cross.add(ch2);
      // Haare: Kappe + wilde Stacheln
      const cap = M(new T3.SphereGeometry(.44, 22, 12, 0, Math.PI * 2, 0, Math.PI * .4), C.hair, 1.03); cap.position.set(0, .03, -.02); cap.rotation.x = -.18; head.add(cap);
      const sp = [[0, .44, .1, -.35, 0], [.16, .42, .18, -.6, -.35], [-.16, .42, .17, -.6, .4], [.3, .34, .05, -.2, -.85], [-.3, .35, .06, -.2, .9], [.08, .44, -.14, .4, -.2], [-.12, .43, -.1, .35, .3], [.24, .38, -.2, .6, -.6], [-.24, .37, -.2, .6, .6], [0, .36, .3, -1.05, .05], [.2, .3, .3, -1.0, -.4], [-.2, .31, .3, -1.0, .45]];
      const cone = new T3.ConeGeometry(.1, .28, 7);
      for (const [x2, y2, z2, rx, rz] of sp) { const c = M(cone, C.hair, 1.08); c.position.set(x2, y2, z2); c.rotation.set(rx, 0, rz); head.add(c); }
      // Podcast-Mikro am Ständer, vor ihm etwas seitlich
      const mic = J.mic = new T3.Group(); mic.position.set(-.74, 0, .4); body.add(mic);
      const mb = M(new T3.CylinderGeometry(.16, .18, .05, 16), C.mic, 1.06); mb.position.y = .03; mic.add(mb);
      const pole = new T3.Mesh(new T3.CylinderGeometry(.025, .025, 1.6, 6), C.grey); pole.position.y = .82; mic.add(pole);
      const boom = new T3.Mesh(new T3.CylinderGeometry(.02, .02, .42, 6), C.grey); boom.rotation.z = Math.PI / 2 - .2; boom.position.set(.16, 1.6, 0); mic.add(boom);
      const cap2 = M(new T3.CylinderGeometry(.075, .07, .3, 14), C.mic, 1.08); cap2.position.set(.33, 1.62, .02); cap2.rotation.z = .2; mic.add(cap2);
      const grill = new T3.Mesh(new T3.SphereGeometry(.078, 12, 8), C.grey); grill.position.set(.36, 1.77, .02); mic.add(grill);
      const lamp = J.lamp = new T3.Mesh(new T3.SphereGeometry(.02, 6, 4), new T3.MeshBasicMaterial({ color: 0xff3355 })); lamp.position.set(.33, 1.55, .095); mic.add(lamp);
      // ON-AIR-Schild über ihm
      const ca = document.createElement('canvas'); ca.width = 256; ca.height = 96; const y = ca.getContext('2d'); y.fillStyle = '#1b0c30'; y.fillRect(0, 0, 256, 96); y.strokeStyle = '#ff3d6e'; y.lineWidth = 8; y.strokeRect(6, 6, 244, 84);
      y.fillStyle = '#ff3d6e'; y.font = '900 52px system-ui,Arial,sans-serif'; y.textAlign = 'center'; y.textBaseline = 'middle'; y.fillText('ON AIR', 128, 52);
      const air = J.air = new T3.Mesh(new T3.BoxGeometry(.9, .34, .06), [C.black, C.black, C.black, C.black, new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(ca) }), C.black]); air.position.set(0, 3.15, -.2); g.add(air);
      // weicher Schatten
      const sc2 = document.createElement('canvas'); sc2.width = sc2.height = 64; const z = sc2.getContext('2d'), gr = z.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(10,0,30,.5)'); gr.addColorStop(1, 'rgba(10,0,30,0)'); z.fillStyle = gr; z.fillRect(0, 0, 64, 64);
      const shd = new T3.Mesh(new T3.PlaneGeometry(2.4, 2.4), new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(sc2), transparent: true, depthWrite: false })); shd.rotation.x = -Math.PI / 2; shd.position.y = .005; g.add(shd);
    },
    set(state, dur) { this.state = state; this.st = dur || 0; },
    talk(sec) { this.talkT = Math.max(this.talkT, sec); },
    update(dt) {
      const J = this.j, s = this.state, k = Math.min(1, dt * 10), L = (o, p, v) => { o[p] += (v - o[p]) * k; };
      if (this.st > 0) { this.st -= dt; if (this.st <= 0 && s !== 'sad' && s !== 'dance') this.state = 'idle'; }
      let bodyY = 0, upRX = 0, upRZ = Math.sin(t * 1.3) * .03, hRX = Math.sin(t * .9) * .04, hRY = this.look, aLX = 0, aLZ = .12, aRX = 0, aRZ = -.12, mic = 0;
      if (s === 'cheer') { const j = Math.abs(Math.sin(t * 9)); bodyY = j * .22; aLZ = 2.6; aRZ = -2.6; aLX = aRX = -.2; hRX = -.15; }
      else if (s === 'wow') { aLZ = 2.3; aRZ = -2.3; aLX = aRX = -.9; hRX = -.2; upRX = -.08; }
      else if (s === 'point') { aRX = -1.35; aRZ = -.35; hRY = this.look * 1.3; }
      else if (s === 'thumbs') { aLX = -1.2; aLZ = .5; bodyY = Math.abs(Math.sin(t * 6)) * .05; }
      else if (s === 'sad') { hRX = .35; upRX = .12; aLZ = .05; aRZ = -.05; }
      else if (s === 'dance') { bodyY = Math.abs(Math.sin(t * 7)) * .16; upRZ = Math.sin(t * 7) * .15; aLZ = 1.6 + Math.sin(t * 7) * .9; aRZ = -1.6 + Math.sin(t * 7) * .9; hRX = Math.sin(t * 14) * .1; }
      else if (s === 'think') { aRX = -1.9; aRZ = .55; hRX = .1; hRY = .25; }
      if (this.talkT > 0 && s === 'idle') { mic = 1; hRY = .35 + this.look * .3; hRX = .05 + Math.sin(t * 11) * .03; }
      L(J.body.position, 'y', .22 + bodyY + Math.sin(t * 2) * .01); L(J.up.rotation, 'x', upRX); L(J.up.rotation, 'z', upRZ);
      L(J.head.rotation, 'x', hRX); L(J.head.rotation, 'y', hRY + (mic ? -.5 : 0));
      L(J.armL.rotation, 'x', aLX); L(J.armL.rotation, 'z', aLZ); L(J.armR.rotation, 'x', aRX); L(J.armR.rotation, 'z', aRZ);
      // Mund, Blinzeln, Kreuz pendelt
      let mo = .35; if (this.talkT > 0) { this.talkT -= dt; mo = .35 + Math.abs(Math.sin(t * 17)) * 1.4; } if (s === 'cheer' || s === 'wow' || s === 'dance') mo = 1.7; if (s === 'sad') mo = .2;
      J.mouth.scale.y += (mo - J.mouth.scale.y) * Math.min(1, dt * 20);
      this.blinkT -= dt; const bl = this.blinkT < .12 ? .1 : 1; if (this.blinkT < 0) this.blinkT = 2 + Math.random() * 3.5; for (const e of J.eyes) e.scale.y = bl;
      const by = s === 'sad' ? -.03 : s === 'wow' || s === 'cheer' ? .04 : 0; J.brows.forEach(b => { b.position.y += (.19 + by - b.position.y) * k; });
      J.cross.rotation.z = Math.sin(t * 3.1) * .25 + (J.head.rotation.y) * .2; J.cross.rotation.x = Math.sin(t * 2.3) * .15;
      J.lamp.material.color.setHex(this.talkT > 0 || s === 'cheer' || s === 'dance' ? 0xff2a4f : 0x551122);
      J.air.material[4].color.setScalar(this.talkT > 0 || s !== 'idle' ? 1 : .55);
    }
  };

  /* ---------- Kamera: Brett und Rico passen immer ins Bild ---------- */
  let W = 1, H = 1, portrait = false; const TOP = { v: 80, b: 90, l: 0, r: 0 };
  function resize() { if (!R) return; W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; R.setSize(W, H, false); layout(); }
  function setMargins(top, bottom, left, right) { TOP.v = top; TOP.b = bottom; TOP.l = left || 0; TOP.r = right || 0; layout(); }
  function layout() {
    if (!CAM) return; portrait = (W - TOP.l - TOP.r) / Math.max(1, H - TOP.v - TOP.b) < 1.12; const S = B.S, hs = S / 2;
    if (portrait) { Rico.g.position.set(-hs + .95, -.25, -hs - .75); Rico.g.rotation.y = .25; Rico.g.scale.setScalar(1.15); Rico.look = .15; }
    else { Rico.g.position.set(-hs - 1.55, -.45, -.1); Rico.g.rotation.y = .55; Rico.g.scale.setScalar(1.15); Rico.look = .2; }
    const pts = [[-hs, 0, -hs], [hs, 0, -hs], [-hs, 0, hs], [hs, 0, hs], [-hs, -.6, hs], [hs, -.6, hs]];
    const rp = Rico.g.position, rs = Rico.g.scale.x; pts.push([rp.x - .8 * rs, rp.y, rp.z], [rp.x + .8 * rs, rp.y + .2, rp.z], [rp.x, rp.y + 3.4 * rs, rp.z]);
    if (!portrait) pts.push([rp.x - .5, rp.y + 2.6 * rs, rp.z]);
    const el2 = portrait ? 1.0 : .9, dir = new T3.Vector3(0, Math.sin(el2), Math.cos(el2));
    // Kamera für den freien Bereich (ohne HUD/Menü) einpassen, dann per Bildausschnitt (setViewOffset) genau dorthin legen
    const rx0 = TOP.l, ry0 = TOP.v, rw = Math.max(50, W - TOP.l - TOP.r), rh = Math.max(50, H - TOP.v - TOP.b), lim = .94;
    CAM.clearViewOffset(); CAM.aspect = rw / rh; CAM.updateProjectionMatrix();
    const tgt = new T3.Vector3(); for (const p of pts) tgt.x += p[0] / pts.length, tgt.y += p[1] / pts.length, tgt.z += p[2] / pts.length;
    const v = new T3.Vector3(), right = new T3.Vector3(), upv = new T3.Vector3();
    let d = 12, bb = null;
    const place = dd => { CAM.position.copy(tgt).addScaledVector(dir, dd); CAM.lookAt(tgt); CAM.updateMatrixWorld(); };
    const box = () => { let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { v.set(p[0], p[1], p[2]).project(CAM); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); } return [x0, x1, y0, y1]; };
    for (let it = 0; it < 4; it++) {
      let lo = 2, hi = 80;
      for (let k = 0; k < 24; k++) { d = (lo + hi) / 2; place(d); bb = box(); if (bb[0] >= -lim && bb[1] <= lim && bb[2] >= -lim && bb[3] <= lim) hi = d; else lo = d; }
      d = hi; place(d); bb = box();
      const hh = Math.tan(CAM.fov * Math.PI / 360) * d; right.setFromMatrixColumn(CAM.matrixWorld, 0); upv.setFromMatrixColumn(CAM.matrixWorld, 1);
      tgt.addScaledVector(right, (bb[0] + bb[1]) / 2 * hh * CAM.aspect).addScaledVector(upv, (bb[2] + bb[3]) / 2 * hh);
    }
    place(d); CAM.setViewOffset(rw, rh, -rx0, -ry0, W, H); CAM.updateProjectionMatrix(); CAM.updateMatrixWorld(); CAM.userData.d = d;
  }

  /* ---------- Auswahl (Hammer): Bildschirm → Feld ---------- */
  const ray = new T3.Raycaster(), ndc = new T3.Vector2();
  function pick(cx, cy) {
    const r = R.domElement.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, CAM);
    const hits = ray.intersectObjects(Array.from(B.tiles.values()), true); let p = null;
    if (hits.length) p = B.g.worldToLocal(hits[0].point.clone());
    else { const pl = new T3.Plane(new T3.Vector3(0, 1, 0), 0), q = new T3.Vector3(); if (!ray.ray.intersectPlane(pl, q)) return -1; p = B.g.worldToLocal(q); }
    const n = B.n, x = Math.round(p.x + (n - 1) / 2), y = Math.round(p.z + (n - 1) / 2); return x >= 0 && y >= 0 && x < n && y < n ? y * n + x : -1;
  }
  function cursor(i) { B.cur = i; if (!B.cursor) return; B.cursor.visible = i >= 0; if (i >= 0) { const p = cellPos(i); B.cursor.position.set(p.x, .6, p.z); } }
  // Bildschirmposition über Ricos Kopf (für die Sprechblase)
  function bubblePos() { const v = new T3.Vector3(); Rico.j.head.getWorldPosition(v); v.y += .75 * Rico.g.scale.x; v.project(CAM); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, portrait }; }

  /* ---------- Bildschleife ---------- */
  function update(dt) {
    if (!R) return; t += dt;
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    for (let i = B.anim.length - 1; i >= 0; i--) { const a = B.anim[i]; a.t += dt; if (stepAnim(a)) B.anim.splice(i, 1); }
    // Brett kippt federnd
    const tl = B.tilt; tl.vx += (-tl.x * 120 - tl.vx * 22) * dt; tl.vz += (-tl.z * 120 - tl.vz * 22) * dt; tl.x += tl.vx * dt; tl.z += tl.vz * dt;
    B.g.rotation.x = tl.x * .07; B.g.rotation.z = tl.z * .07; B.g.position.y = Math.sin(t * 1.2) * .04;
    // Antippen: gewählte Kachel schwebt, passende Partner wippen
    if (B.sel) for (const [id, g] of B.tiles) { const on = id === B.sel.id, pt = B.sel.p.has(id), ty = on ? .32 : pt ? .05 + Math.abs(Math.sin(t * 6)) * .1 : 0; if (on || pt || g.position.y) g.position.y += (ty - g.position.y) * Math.min(1, dt * 14); }
    if (B.cursor && B.cursor.visible) { B.cursor.rotation.z = t * 2; const s = 1 + Math.sin(t * 8) * .06; B.cursor.scale.set(s, s, s); }
    // Funken
    let any = false;
    for (let j = 0; j < pData.length; j++) { const d = pData[j]; if (d.life <= 0) continue; any = true; d.life -= dt;
      if (d.life <= 0) { tmpM.makeScale(0, 0, 0); parts.setMatrixAt(j, tmpM); continue; }
      d.vy -= 9 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; d.r += dt * 8;
      tmpQ.setFromAxisAngle(tmpV.set(.5, 1, .2).normalize(), d.r); const s = Math.min(1, d.life * 3); tmpS.set(s, s, s); tmpM.compose(tmpV.set(d.x, d.y, d.z), tmpQ, tmpS); parts.setMatrixAt(j, tmpM); }
    if (any || parts.userData.any) parts.instanceMatrix.needsUpdate = true; parts.userData.any = any;
    for (let i = 0; i < fData.length; i++) { const f = fData[i]; f.y += f.sp * dt; f.r += dt * f.sp; if (f.y > 9) f.y = -6; tmpQ.setFromAxisAngle(tmpV.set(.3, 1, .5).normalize(), f.r); tmpS.set(f.s, f.s, f.s); tmpM.compose(tmpV.set(f.x, f.y, f.z), tmpQ, tmpS); floaters.setMatrixAt(i, tmpM); }
    floaters.instanceMatrix.needsUpdate = true;
    Rico.update(dt);
    R.render(SC, CAM);
  }

  window.D2048Scene = { init, setGame, apply, select, smash, tilt, bump, burst, confetti, pick, cursor, bubblePos, update, resize, setMargins, finish, rico: Rico, get busy() { return B.anim.length > 0; } };
})();
