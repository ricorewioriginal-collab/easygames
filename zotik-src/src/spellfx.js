/* Zaubereffekte: Runenkreise am Boden, Wirbel, Blitzbögen, Sternenfall, Dornen aus dem Boden, Kristallsplitter,
   Heil-Ringe. Alles aus festen Vorräten (kein Neuanlegen im Kampf), additiv und kurz – handyfreundlich. */
export function createSpellFX({ T, scene }) {
  const ADD = { transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false };
  const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); return t; };
  /* Runenkreis: zwei Ringe, Sternzeichen, kleine Runen rundherum */
  const RUNE = cvs(256, 256, (x, w) => { const c = w / 2; x.translate(c, c); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 6;
    x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 120, 0, 7); x.stroke(); x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 104, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 0, 58, 0, 7); x.stroke();
    x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * 4 * Math.PI / 6 * 1.5 - Math.PI / 2; const px = Math.cos(a) * 104, py = Math.sin(a) * 104; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    x.font = 'bold 15px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; const R = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗ';
    for (let i = 0; i < 20; i++) { x.save(); x.rotate(i / 20 * Math.PI * 2); x.fillText(R[i], 0, -112); x.restore(); }
    for (let i = 0; i < 8; i++) { x.save(); x.rotate(i / 8 * Math.PI * 2); x.beginPath(); x.arc(0, -81, 5, 0, 7); x.fill(); x.restore(); } });
  /* Wirbel-Streifen (für den Zylinder des Wirbels) */
  const STREAK = cvs(128, 64, (x, w, h) => { for (let i = 0; i < 9; i++) { const y = Math.random() * h, g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,' + (.5 + Math.random() * .5) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(Math.random() * w * .3, y, w * .7, 2 + Math.random() * 3); } });
  STREAK.wrapS = STREAK.wrapT = T.RepeatWrapping;
  /* Stern-Glanz (vierzackig) */
  const FLARE = cvs(128, 128, (x, w) => { const c = w / 2, g = x.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.2, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.fillStyle = '#fff'; for (const r of [0, Math.PI / 2]) { x.save(); x.translate(c, c); x.rotate(r); x.beginPath(); x.moveTo(-c, 0); x.quadraticCurveTo(0, -3, c, 0); x.quadraticCurveTo(0, 3, -c, 0); x.fill(); x.restore(); } });
  const pool = (n, mk) => { const a = []; for (let i = 0; i < n; i++) { const o = mk(); o.m.visible = false; scene.add(o.m); a.push(o); } a.i = 0; return a; };
  const take = a => a[a.i++ % a.length];
  const live = [];   /* alle aktiven Effekte: {o, t, d, fn} */
  const start = (o, d, fn) => { o.t = 0; o.d = d; o.fn = fn; o.m.visible = true; if (!live.includes(o)) live.push(o); };

  const circles = pool(6, () => { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial(Object.assign({ map: RUNE, color: 0xffffff }, ADD))); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; return { m }; });
  const vortex = pool(4, () => { const m = new T.Mesh(new T.CylinderGeometry(1, .7, 1, 20, 1, true), new T.MeshBasicMaterial(Object.assign({ map: STREAK.clone(), side: T.DoubleSide }, ADD))); m.material.map.needsUpdate = true; m.material.map.wrapS = m.material.map.wrapT = T.RepeatWrapping; return { m }; });
  const flares = pool(14, () => ({ m: new T.Sprite(new T.SpriteMaterial(Object.assign({ map: FLARE }, ADD))) }));
  const rings = pool(6, () => ({ m: new T.Mesh(new T.TorusGeometry(1, .05, 6, 40), new T.MeshBasicMaterial(Object.assign({}, ADD))) }));
  const BOLTN = 12;
  const segGeo = new T.CylinderGeometry(.045, .045, 1, 4, 1, true); segGeo.translate(0, .5, 0); segGeo.rotateX(Math.PI / 2);
  const bolts = pool(6, () => { const g = new T.Group(), mat = new T.MeshBasicMaterial(Object.assign({}, ADD)); for (let i = 0; i < BOLTN - 1; i++) g.add(new T.Mesh(segGeo, mat)); g.userData.p = Array.from({ length: BOLTN }, () => new T.Vector3()); g.userData.mat = mat; return { m: g }; });
  const spikeGeo = new T.ConeGeometry(.22, 1.4, 5), shardGeo = new T.OctahedronGeometry(.18);
  const spikes = pool(3, () => { const g = new T.Group(); for (let i = 0; i < 10; i++) g.add(new T.Mesh(spikeGeo, new T.MeshStandardMaterial({ color: 0x3a8a3a, emissive: 0x1a5a1a, roughness: .6, flatShading: true }))); return { m: g }; });
  const shards = pool(3, () => { const g = new T.Group(); for (let i = 0; i < 10; i++) { const s = new T.Mesh(shardGeo, new T.MeshBasicMaterial(Object.assign({ color: 0xbfefff }, ADD))); s.userData.v = new T.Vector3(); g.add(s); } return { m: g }; });
  const stars = pool(6, () => { const g = new T.Group(); const s = new T.Sprite(new T.SpriteMaterial(Object.assign({ map: FLARE }, ADD))); s.scale.set(2.2, 2.2, 1); const tail = new T.Mesh(new T.CylinderGeometry(.02, .26, 1, 8, 1, true), new T.MeshBasicMaterial(Object.assign({ side: T.DoubleSide, opacity: .7 }, ADD))); g.add(s, tail); g.userData = { s, tail }; return { m: g }; });

  /** Runenkreis am Boden (drehend, wächst auf, verblasst) */
  function circle(x, y, z, col, r, d) { const o = take(circles); o.m.material.color.setHex(col); o.m.position.set(x, y + .07, z); o.r = r || 3;
    start(o, d || 1, (o, k) => { const s = o.r * (k < .2 ? k / .2 : 1) * 2; o.m.scale.set(s, s, 1); o.m.rotation.z = k * 2.4; o.m.material.opacity = .85 * (k < .7 ? 1 : (1 - k) / .3); }); }
  /** Glanzpunkt (Stern-Blitz) */
  function flare(x, y, z, col, s, d) { const o = take(flares); o.m.material.color.setHex(col); o.m.position.set(x, y, z); o.s = s || 2.4;
    start(o, d || .4, (o, k) => { const q = o.s * (k < .3 ? k / .3 : 1 + (k - .3) * .4); o.m.scale.set(q, q, 1); o.m.material.rotation = k * 1.5; o.m.material.opacity = .8 * (1 - k * k); }); }
  /** aufsteigender oder sich ausbreitender Ring */
  function ring(x, y, z, col, r, d, up) { const o = take(rings); o.m.material.color.setHex(col); o.m.position.set(x, y, z); o.y0 = y; o.r = r || 2; o.up = up || 0; o.m.rotation.set(Math.PI / 2, 0, 0);
    start(o, d || .6, (o, k) => { const s = o.up ? o.r : o.r * (.2 + k); o.m.scale.set(s, s, s); o.m.position.y = o.y0 + o.up * k; o.m.material.opacity = 1 - k; }); }
  /** Wirbel aus Lichtstreifen */
  function swirl(x, y, z, col, r, h, d) { const o = take(vortex); o.m.material.color.setHex(col); o.m.position.set(x, y + h / 2, z); o.r = r || 2; o.h = h || 2.5;
    start(o, d || .7, (o, k) => { const s = o.r * (.5 + k * .7); o.m.scale.set(s, o.h * (.6 + k * .5), s); o.m.rotation.y += .35; o.m.material.map.offset.x = k * 2; o.m.material.opacity = k < .2 ? k / .2 : (1 - k) / .8; }); }
  /** Blitzbogen zwischen zwei Punkten (flackert, neu gezackt) */
  function bolt(ax, ay, az, bx, by, bz, col, d) { const o = take(bolts), u = o.m.userData; u.mat.color.setHex(col || 0xfff27a); o.a = [ax, ay, az]; o.b = [bx, by, bz];
    const zig = o => { const [ax, ay, az] = o.a, [bx, by, bz] = o.b, L = Math.hypot(bx - ax, bz - az) * .1 + .15, P = u.p;
      for (let i = 0; i < BOLTN; i++) { const f = i / (BOLTN - 1), j = i && i < BOLTN - 1 ? L : 0; P[i].set(ax + (bx - ax) * f + (Math.random() - .5) * j, ay + (by - ay) * f + (Math.random() - .5) * j, az + (bz - az) * f + (Math.random() - .5) * j); }
      o.m.children.forEach((m, i) => { m.position.copy(P[i]); m.lookAt(P[i + 1]); m.scale.set(1, 1, P[i].distanceTo(P[i + 1])); }); };
    zig(o); start(o, d || .3, (o, k) => { if (Math.random() < .5) zig(o); u.mat.opacity = Math.random() < .2 ? .25 : 1 - k * .6; }); flare(bx, by, bz, col || 0xfff27a, 1.8, .25); }
  /** Dornen brechen ringförmig aus dem Boden */
  function thorns(x, y, z, r, col) { const o = take(spikes); o.m.position.set(x, y, z); o.m.children.forEach((s, i) => { const a = i / 10 * Math.PI * 2 + Math.random() * .3, rr = r * (.55 + Math.random() * .45); s.position.set(Math.cos(a) * rr, -.8, Math.sin(a) * rr); s.rotation.set(Math.sin(a) * .35, 0, -Math.cos(a) * .35); s.userData.s = .7 + Math.random() * .6; if (col) s.material.color.setHex(col); });
    start(o, 1.1, (o, k) => { const up = k < .15 ? k / .15 : k > .75 ? 1 - (k - .75) / .25 : 1; o.m.children.forEach(s => { s.position.y = -.8 + up * .75 * s.userData.s; s.scale.setScalar(s.userData.s); }); }); }
  /** Kristallsplitter fliegen auseinander */
  function burstShards(x, y, z, col, pow) { const o = take(shards); o.m.position.set(x, y, z); o.m.children.forEach(s => { s.material.color.setHex(col || 0xbfefff); s.position.set(0, 0, 0); const a = Math.random() * 6.28, u = Math.random(); s.userData.v.set(Math.cos(a) * (2 + u * 4) * (pow || 1), 3 + Math.random() * 4, Math.sin(a) * (2 + u * 4) * (pow || 1)); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); });
    start(o, .7, (o, k, dt) => { o.m.children.forEach(s => { const v = s.userData.v; v.y -= 14 * dt; s.position.addScaledVector(v, dt); s.rotation.x += dt * 8; s.scale.setScalar(1 - k * .7); s.material.opacity = 1 - k; }); }); }
  /** fallender Stern aus dem Himmel bis zum Ziel */
  function starfall(x, y, z, col, d, onHit) { const o = take(stars); const u = o.m.userData; u.s.material.color.setHex(col || 0xffe27a); u.tail.material.color.setHex(col || 0xffe27a); o.x = x; o.y = y; o.z = z; o.hit = onHit; o.done = false; o.ox = (Math.random() - .5) * 5;
    start(o, d || .45, (o, k) => { const h = (1 - k) * 16; o.m.position.set(o.x + o.ox * (1 - k), o.y + h, o.z); u.tail.position.set(o.ox * .12, 2.1, 0); u.tail.scale.set(1, 4, 1); u.tail.rotation.z = -Math.atan2(o.ox, 16); u.s.material.rotation += .3;
      if (k >= .98 && !o.done) { o.done = true; flare(o.x, o.y + .5, o.z, col || 0xffe27a, 4.5, .4); ring(o.x, o.y + .1, o.z, col || 0xffe27a, 3, .5); if (o.hit) o.hit(); } }); }
  /** Heilzauber: aufsteigende Ringe, Glanz, Runenkreis */
  function heal(x, y, z, col) { col = col || 0x9affc8; circle(x, y, z, col, 2.4, 1.1); for (let i = 0; i < 3; i++) ring(x, y + .2 + i * .4, z, col, 1.2 - i * .2, .9, 2.2); flare(x, y + 1.6, z, 0xffffff, 2.2, .5); }

  function update(dt) { for (let i = live.length - 1; i >= 0; i--) { const o = live[i]; o.t += dt; const k = Math.min(1, o.t / o.d); o.fn(o, k, dt); if (k >= 1) { o.m.visible = false; live.splice(i, 1); } } }
  return { circle, flare, ring, swirl, bolt, thorns, burstShards, starfall, heal, update, get n() { return live.length; } };
}
