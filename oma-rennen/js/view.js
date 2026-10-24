/* Oma-Rennen – 3D-Ansicht (Three.js r128): Stadt-Strecken (Kopfsteinpflaster, Kurpark, Einkaufszentrum, Promenade,
 * Weihnachtsmarkt, Geister-Altenheim) mit Häusern, Ständen, Laternen; Omas auf Raketen-Rollatoren; Gegenstände, Kameras,
 * geteilter Bildschirm für bis zu 4 Spielerinnen. Die Rennsimulation kommt aus Kart Rush (../anmacha-kart/sim.js). */
(function () {
  'use strict';
  const T = THREE, PI2 = Math.PI * 2;
  let R = null, scene, hemi, sun, sky, world = null, tr = null, def = null, W = 1, H = 1, low = false, prMax = 1.5;
  let karts = [], cams = [], boxM = [], padM = [], hazM = new Map(), projM = new Map(), crM = [], ptM = [], fx = [], time = 0;
  const mats = {}, lam = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
  const bas = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const G = {}, geo = (k, f) => G[k] || (G[k] = f());
  const box = () => geo('box', () => new T.BoxGeometry(1, 1, 1)), sph = () => geo('sph', () => new T.SphereGeometry(1, 14, 10)), cyl = () => geo('cyl', () => new T.CylinderGeometry(1, 1, 1, 12)), cone = () => geo('cone', () => new T.ConeGeometry(1, 1, 12));
  const tor = () => geo('tor', () => new T.TorusGeometry(1, .28, 8, 18));
  function part(p, g, m, x, y, z, sx, sy, sz, rx, ry, rz) { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); p.add(o); return o; }
  function tex(w, h, draw, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; }
  const rr = (a, b) => a + Math.random() * (b - a);

  function init(canvas, opt) {
    low = !!(opt && opt.low);
    R = new T.WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance' }); R.setScissorTest(true);
    prMax = Math.min(devicePixelRatio || 1, low ? 1 : 1.6); R.setPixelRatio(prMax);
    scene = new T.Scene(); hemi = new T.HemisphereLight(0xffffff, 0x556644, .8); scene.add(hemi); sun = new T.DirectionalLight(0xffffff, .75); sun.position.set(80, 140, 40); scene.add(sun);
    const sg = new T.SphereGeometry(800, 16, 10); sg.setAttribute('color', new T.BufferAttribute(new Float32Array(sg.attributes.position.count * 3), 3));
    sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
    scene.fog = new T.Fog(0xdbe8f5, 160, 620);
  }
  function setSky(c) {
    const a = new T.Color(c[0]), b = new T.Color(c[1]), d = new T.Color(c[2]), p = sky.geometry.attributes.position, col = sky.geometry.attributes.color, tmp = new T.Color();
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 800; if (y > .2) tmp.copy(b).lerp(a, Math.min(1, (y - .2) / .8)); else tmp.copy(d).lerp(b, Math.max(0, (y + .1) / .3)); col.setXYZ(i, tmp.r, tmp.g, tmp.b); }
    col.needsUpdate = true;
  }
  /* ---------- Texturen ---------- */
  function roadTex(theme, base) {
    return tex(256, 256, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      if (theme === 'markt' || theme === 'xmas' || theme === 'grusel') for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { const o = (r % 2) * 16, l = 35 + ((r * 7 + c * 13) % 9) * 3; x.fillStyle = `hsl(${theme === 'grusel' ? 260 : 30},${theme === 'grusel' ? 10 : 12}%,${theme === 'grusel' ? l - 12 : l}%)`; x.beginPath(); x.roundRect ? x.roundRect(c * 32 + o + 2, r * 16 + 2, 28, 12, 4) : x.rect(c * 32 + o + 2, r * 16 + 2, 28, 12); x.fill(); }
      else if (theme === 'park') { for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${90 + (i % 50)},${70 + (i % 30)},40,.25)`; x.fillRect((i * 37) % w, (i * 91) % h, 3, 3); } }
      else if (theme === 'mall') { x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; for (let i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }
      else if (theme === 'strand') { for (let i = 0; i < h; i += 32) { x.fillStyle = i % 64 ? '#b49a7a' : '#a68c6c'; x.fillRect(0, i, w, 30); } }
      if (theme === 'xmas') { x.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 300; i++) x.fillRect((i * 53) % w, (i * 29) % h, 6, 4); }
    }, 1, 1);
  }
  function facadeTex(hue, night, shop) {
    return tex(128, 256, (x, w, h) => {
      x.fillStyle = `hsl(${hue},45%,${night ? 22 : 72}%)`; x.fillRect(0, 0, w, h);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) { const lit = night ? ((r * 3 + c * 5) % 4 > 0) : false; x.fillStyle = lit ? '#ffd27a' : night ? '#1a1830' : '#3a5a7a'; x.fillRect(12 + c * 38, 18 + r * 40, 26, 28); x.fillStyle = night ? '#000' : '#fff'; x.fillRect(12 + c * 38, 30 + r * 40, 26, 2); }
      if (shop) { x.fillStyle = `hsl(${(hue + 160) % 360},70%,55%)`; x.fillRect(0, 210, w, 46); for (let i = 0; i < w; i += 16) { x.fillStyle = i % 32 ? '#fff' : `hsl(${(hue + 160) % 360},70%,55%)`; x.fillRect(i, 198, 16, 12); } x.fillStyle = '#ffe9a8'; x.fillRect(14, 222, w - 28, 30); }
    });
  }
  /* ---------- Strecke ---------- */
  function setTrack(d, track) {
    def = d; tr = track; if (world) { scene.remove(world); world.traverse(o => { if (o.geometry && !Object.values(G).includes(o.geometry)) o.geometry.dispose(); }); }
    world = new T.Group(); scene.add(world); setSky(d.sky); scene.fog.color.set(d.fog); scene.fog.near = d.night ? 90 : 170; scene.fog.far = d.night ? 420 : 640;
    hemi.intensity = d.night ? .55 : .85; sun.intensity = d.night ? .25 : .75; hemi.color.set(d.night ? '#8a9aff' : '#ffffff');
    const N = tr.N, P = tr.P, Nm = tr.Nm, h = tr.height || (() => 0);
    // Boden
    let cx = 0, cz = 0; for (let i = 0; i < N; i++) { cx += P[i * 2]; cz += P[i * 2 + 1]; } cx /= N; cz /= N;
    const gm = def.theme === 'strand' ? lam('#f0d898') : lam(d.ground); const gr = part(world, new T.PlaneGeometry(1600, 1600), gm, cx, -.05, cz, 1, 1, 1, -Math.PI / 2);
    if (def.theme === 'strand') { const sea = part(world, new T.PlaneGeometry(1600, 700), new T.MeshLambertMaterial({ color: '#2a8ad0', transparent: true, opacity: .9 }), cx, .02, cz + 560, 1, 1, 1, -Math.PI / 2); sea.userData.sea = true; }
    void gr;
    // Fahrbahn, Bordstein, Geländer
    const rt = roadTex(d.theme, d.road);
    world.add(ribbon(i => [P[i * 2] + Nm[i * 2] * tr.half, P[i * 2 + 1] + Nm[i * 2 + 1] * tr.half], i => [P[i * 2] - Nm[i * 2] * tr.half, P[i * 2 + 1] - Nm[i * 2 + 1] * tr.half], i => h(i) + .03, new T.MeshLambertMaterial({ map: rt }), 6));
    const curb = tex(64, 16, (x) => { for (let i = 0; i < 64; i += 16) { x.fillStyle = (i / 16) % 2 ? '#ffffff' : (d.theme === 'xmas' ? '#d0202a' : d.theme === 'grusel' ? '#ff7a1a' : '#e84a5a'); x.fillRect(i, 0, 16, 16); } }, 1, 1);
    for (const s of [1, -1]) {
      world.add(ribbon(i => [P[i * 2] + Nm[i * 2] * s * tr.half, P[i * 2 + 1] + Nm[i * 2 + 1] * s * tr.half], i => [P[i * 2] + Nm[i * 2] * s * (tr.half + 1.6), P[i * 2 + 1] + Nm[i * 2 + 1] * s * (tr.half + 1.6)], i => h(i) + .08, new T.MeshLambertMaterial({ map: curb }), 2.5));
      world.add(ribbon(i => [P[i * 2] + Nm[i * 2] * s * (tr.half + 1.6), P[i * 2 + 1] + Nm[i * 2 + 1] * s * (tr.half + 1.6)], i => [P[i * 2] + Nm[i * 2] * s * (tr.wallD + .3), P[i * 2 + 1] + Nm[i * 2 + 1] * s * (tr.wallD + .3)], i => h(i) + .05, lam(d.theme === 'park' ? '#7ac860' : d.theme === 'strand' ? '#e8d0a0' : d.theme === 'xmas' ? '#f4f8ff' : '#cfc6b8'), 4));
      wall(s);
    }
    // Brückenpfeiler
    for (let i = 0; i < N; i += 6) { const y = h(i); if (y > 2) for (const s of [1, -1]) part(world, cyl(), lam('#9a8f84'), P[i * 2] + Nm[i * 2] * s * tr.half * .8, y / 2, P[i * 2 + 1] + Nm[i * 2 + 1] * s * tr.half * .8, .9, y, .9); }
    // Start/Ziel
    const st = tex(64, 16, x => { for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) { x.fillStyle = (r + c) % 2 ? '#111' : '#fff'; x.fillRect(c * 8, r * 8, 8, 8); } });
    const i0 = 0, ang = Math.atan2(tr.T[0], tr.T[1]); const sl = part(world, new T.PlaneGeometry(tr.W, 3), new T.MeshBasicMaterial({ map: st }), P[0], h(0) + .06, P[1], 1, 1, 1, -Math.PI / 2, 0, 0); sl.rotation.set(-Math.PI / 2, 0, ang); void i0;
    const arch = new T.Group(); arch.position.set(P[0], h(0), P[1]); arch.rotation.y = ang; world.add(arch);
    for (const s of [-1, 1]) part(arch, box(), lam('#ffffff'), s * (tr.half + 1), 4, 0, .6, 8, .6);
    const ban = tex(512, 64, x => { x.fillStyle = '#ff2d95'; x.fillRect(0, 0, 512, 64); x.fillStyle = '#fff'; x.font = 'bold 38px sans-serif'; x.textAlign = 'center'; x.fillText('ZIEL · OMA-RENNEN', 256, 46); });
    for (const r of [0, Math.PI]) part(arch, new T.PlaneGeometry(tr.W + 2, 2.4), new T.MeshBasicMaterial({ map: ban }), 0, 7.4, r ? .05 : -.05, 1, 1, 1, 0, r, 0);
    scenery(cx, cz);
  }
  function ribbon(fa, fb, fy, mat, vScale) {
    const N = tr.N, pos = new Float32Array((N + 1) * 6), uv = new Float32Array((N + 1) * 4), idx = [];
    let v = 0;
    for (let k = 0; k <= N; k++) {
      const i = k % N, a = fa(i), b = fb(i), y = fy(i); pos.set([a[0], y, a[1], b[0], y, b[1]], k * 6); uv.set([0, v, 1, v], k * 4);
      v += (tr.len / N) / (vScale || 6);
      if (k < N) { const o = k * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.Mesh(g, mat); m.material.side = T.DoubleSide; return m;
  }
  function wall(s) {
    const N = tr.N, P = tr.P, Nm = tr.Nm, h = tr.height || (() => 0), th = def.theme;
    const col = th === 'park' ? '#2f7a2a' : th === 'mall' ? '#c8d8ff' : th === 'strand' ? '#ffffff' : th === 'xmas' ? '#8a5a2a' : th === 'grusel' ? '#3a3a4a' : '#5a5a62';
    const ht = th === 'park' ? 1.3 : 1;
    const pos = [], idx = []; for (let k = 0; k <= N; k++) { const i = k % N, x = P[i * 2] + Nm[i * 2] * s * tr.wallD, z = P[i * 2 + 1] + Nm[i * 2 + 1] * s * tr.wallD, y = h(i); pos.push(x, y, z, x, y + ht, z); if (k < N) { const o = k * 2; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); g.computeVertexNormals();
    world.add(new T.Mesh(g, new T.MeshLambertMaterial({ color: col, side: T.DoubleSide, transparent: th === 'mall', opacity: th === 'mall' ? .55 : 1 })));
    if (th !== 'park') for (let i = 0; i < N; i += 4) part(world, cyl(), lam(th === 'strand' ? '#2a6ad0' : '#2a2a30'), P[i * 2] + Nm[i * 2] * s * tr.wallD, h(i) + .6, P[i * 2 + 1] + Nm[i * 2 + 1] * s * tr.wallD, .09, 1.3, .09);
  }
  // Bauten neben der Strecke (nur dort, wo Platz ist)
  const tmpN = { i: 0, f: 0, d: 0 };
  function yAt(x, z) { if (!tr.height) return 0; tr.nearest(x, z, -1, tmpN); return tr.height(tmpN.f); }
  function freeAt(x, z, m) { tr.nearest(x, z, -1, tmpN); return Math.abs(tmpN.d) > tr.wallD + m; }
  function scenery(cx, cz) {
    const th = def.theme, night = def.night, N = tr.N, P = tr.P, Nm = tr.Nm;
    const fac = [0, 1, 2, 3].map(k => new T.MeshLambertMaterial({ map: facadeTex(th === 'mall' ? 280 + k * 20 : th === 'grusel' ? 250 : [20, 45, 190, 340][k], night, k % 2 === 0) }));
    const roof = lam(th === 'xmas' ? '#ffffff' : th === 'grusel' ? '#1a1424' : '#b04a3a');
    let placed = 0;
    // Häuserzeilen entlang der Strecke
    for (let i = 0; i < N && placed < (low ? 50 : 90); i += 9) for (const s of [1, -1]) {
      if (th === 'strand' && s < 0) continue;
      const off = tr.wallD + 12 + (i % 3) * 3, x = P[i * 2] + Nm[i * 2] * s * off, z = P[i * 2 + 1] + Nm[i * 2 + 1] * s * off; if (!freeAt(x, z, 8)) continue;
      const hgt = th === 'mall' ? rr(14, 24) : rr(9, 17), w = rr(9, 13), a = Math.atan2(tr.T[i * 2], tr.T[i * 2 + 1]);
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = a; world.add(g); placed++;
      part(g, box(), fac[(i + (s > 0 ? 1 : 0)) % 4], 0, hgt / 2, 0, w, hgt, 9);
      if (th !== 'mall') { const r = part(g, cone(), roof, 0, hgt + 2.5, 0, w * .75, 5, 6.5); r.rotation.y = Math.PI / 4; }
      else part(g, box(), bas(['#ff2d95', '#00e5ff', '#ffd24a', '#7cff6a'][i % 4]), 0, hgt + .6, 0, w * .9, 1.2, 9.4);
    }
    // Deko je Welt
    const props = { markt: ['stall', 'lamp', 'tree', 'bench', 'church'], park: ['tree', 'tree', 'fountain', 'bench', 'lamp', 'pavilion'], mall: ['palmpot', 'lamp', 'bench', 'escal'], strand: ['palm', 'chair', 'chair', 'lamp', 'boat'], xmas: ['stall', 'xtree', 'lamp', 'snowman'], grusel: ['grave', 'grave', 'pumpkin', 'deadtree', 'lamp'] }[th];
    for (let k = 0; k < (low ? 60 : 120); k++) {
      const i = Math.floor(Math.random() * N), s = Math.random() < .5 ? 1 : -1, off = tr.wallD + rr(2.5, 9), x = P[i * 2] + Nm[i * 2] * s * off, z = P[i * 2 + 1] + Nm[i * 2 + 1] * s * off;
      if (!freeAt(x, z, 1.8)) continue; prop(props[k % props.length], x, z, Math.atan2(tr.T[i * 2], tr.T[i * 2 + 1]) + (s > 0 ? Math.PI / 2 : -Math.PI / 2));
    }
    // ferne Hügel/Skyline
    for (let k = 0; k < 18; k++) { const a = k / 18 * PI2, r = 520; part(world, cone(), lam(night ? '#151830' : th === 'strand' ? '#d8b878' : '#7aa070'), cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r, rr(60, 120), rr(40, 90), rr(60, 120)); }
    if (night) { const moon = part(world, sph(), bas('#fff4cf', { fog: false }), cx + 300, 260, cz - 400, 22); void moon; }
    if (th === 'strand') part(world, sph(), bas('#ffb060', { fog: false }), cx, 40, cz + 700, 60, 60, 4);
  }
  function prop(k, x, z, a) {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = a; world.add(g); const night = def.night;
    if (k === 'tree') { part(g, cyl(), lam('#6a4a2a'), 0, 1.6, 0, .35, 3.2, .35); part(g, sph(), lam('#3a9a3a'), 0, 4.4, 0, 2.2, 2.4, 2.2); }
    else if (k === 'lamp') { part(g, cyl(), lam('#2a2a30'), 0, 2.6, 0, .12, 5.2, .12); part(g, sph(), bas(night ? '#ffe9a0' : '#fff8e0'), 0, 5.3, 0, .45); }
    else if (k === 'bench') { part(g, box(), lam('#8a5a2a'), 0, .55, 0, 2.4, .15, .7); part(g, box(), lam('#8a5a2a'), 0, 1, -.32, 2.4, .7, .12); part(g, box(), lam('#2a2a2a'), -1, .27, 0, .12, .55, .6); part(g, box(), lam('#2a2a2a'), 1, .27, 0, .12, .55, .6); }
    else if (k === 'stall') { const c = ['#e84a5a', '#3a8ae8', '#40c070', '#ffb020'][Math.floor(Math.random() * 4)]; part(g, box(), lam('#c8a070'), 0, .6, 0, 3.2, 1.2, 1.8); part(g, box(), lam(c), 0, 2.6, 0, 3.6, .25, 2.4, .25); for (const s of [-1, 1]) part(g, cyl(), lam('#6a4a2a'), s * 1.5, 1.4, .8, .08, 2.6, .08); for (let i = 0; i < 4; i++) part(g, sph(), lam(['#ff4a4a', '#ffd040', '#7ac040', '#ff8a2a'][i]), -1.1 + i * .7, 1.35, 0, .28); if (night) part(g, box(), bas('#ffe9a0'), 0, 2.4, 1.2, 3.4, .12, .12); }
    else if (k === 'church') { part(g, box(), lam('#d8c8b0'), 0, 7, 0, 5, 14, 5); part(g, cone(), lam('#3a6a5a'), 0, 17, 0, 3.6, 7, 3.6); part(g, cyl(), bas('#fff8e0'), 0, 11, 2.6, 1.2, .2, 1.2, Math.PI / 2); }
    else if (k === 'fountain') { part(g, cyl(), lam('#c0c0c8'), 0, .4, 0, 2.6, .8, 2.6); part(g, cyl(), lam('#5ab0ff'), 0, .82, 0, 2.3, .05, 2.3); part(g, cyl(), lam('#c0c0c8'), 0, 1.4, 0, .3, 2, .3); part(g, sph(), lam('#9ad8ff', { transparent: true, opacity: .7 }), 0, 2.6, 0, .8, .5, .8); }
    else if (k === 'pavilion') { part(g, cyl(), lam('#ffffff'), 0, .3, 0, 3, .6, 3); for (let i = 0; i < 6; i++) { const b = i / 6 * PI2; part(g, cyl(), lam('#ffffff'), Math.cos(b) * 2.6, 2, Math.sin(b) * 2.6, .12, 3.4, .12); } part(g, cone(), lam('#3a8a5a'), 0, 4.4, 0, 3.4, 1.8, 3.4); }
    else if (k === 'palm' || k === 'palmpot') { if (k === 'palmpot') part(g, cyl(), lam('#c06a3a'), 0, .5, 0, .8, 1, .8); part(g, cyl(), lam('#a8844a'), 0, 3, 0, .22, 6, .22, .08); for (let i = 0; i < 6; i++) { const b = i / 6 * PI2; part(g, box(), lam('#3aa04a'), Math.cos(b) * 1.2, 6, Math.sin(b) * 1.2, 2.6, .12, .6, 0, -b, .4); } }
    else if (k === 'chair') { part(g, box(), lam('#ffffff'), 0, .8, 0, 1.6, 1.6, 1.2); part(g, box(), lam(['#3a8ae8', '#e84a5a', '#40c070'][Math.floor(Math.random() * 3)]), 0, 1.4, -.1, 1.7, 1.3, 1.25); part(g, box(), lam('#d8b878'), 0, .9, .3, 1.4, .1, .8); }
    else if (k === 'boat') { part(g, box(), lam('#ffffff'), 0, .6, 0, 1.4, .8, 4); part(g, cyl(), lam('#6a4a2a'), 0, 3, 0, .08, 4.5, .08); part(g, cone(), lam('#ff6a4a'), .6, 3.4, 0, .1, 3, 1.2); }
    else if (k === 'xtree') { part(g, cyl(), lam('#6a4a2a'), 0, .8, 0, .4, 1.6, .4); for (let i = 0; i < 3; i++) part(g, cone(), lam('#2a7a3a'), 0, 3 + i * 1.8, 0, 2.6 - i * .7, 2.8, 2.6 - i * .7); for (let i = 0; i < 10; i++) { const b = i * 2.3; part(g, sph(), bas(['#ff3a3a', '#ffd040', '#5ab0ff'][i % 3]), Math.cos(b) * (2 - i * .15), 2.6 + i * .5, Math.sin(b) * (2 - i * .15), .2); } part(g, sph(), bas('#ffe060'), 0, 8.2, 0, .45); }
    else if (k === 'snowman') { part(g, sph(), lam('#ffffff'), 0, .9, 0, 1); part(g, sph(), lam('#ffffff'), 0, 2.2, 0, .7); part(g, sph(), lam('#ffffff'), 0, 3.2, 0, .5); part(g, cone(), lam('#ff8a2a'), 0, 3.2, .55, .1, .5, .1, Math.PI / 2); part(g, cyl(), lam('#202020'), 0, 3.8, 0, .4, .5, .4); }
    else if (k === 'grave') { part(g, box(), lam('#8a8a96'), 0, .9, 0, 1.2, 1.8, .3); part(g, cyl(), lam('#8a8a96'), 0, 1.8, 0, .6, .3, .6, Math.PI / 2); }
    else if (k === 'pumpkin') { part(g, sph(), lam('#ff7a1a'), 0, .6, 0, .9, .65, .9); part(g, cyl(), lam('#3a6a2a'), 0, 1.3, 0, .1, .4, .1); part(g, sph(), bas('#ffe060'), 0, .7, .8, .18); }
    else if (k === 'deadtree') { part(g, cyl(), lam('#3a2a2a'), 0, 2.5, 0, .3, 5, .3); for (let i = 0; i < 4; i++) part(g, cyl(), lam('#3a2a2a'), Math.cos(i * 1.6) * .8, 4 + i * .3, Math.sin(i * 1.6) * .8, .1, 2, .1, .9, i * 1.6, 0); }
    else if (k === 'escal') { part(g, box(), lam('#c0c8d8'), 0, 3, 0, 2.4, .4, 9, -.55); part(g, box(), bas('#00e5ff'), 0, 3.25, 0, 2.5, .08, 9.1, -.55); }
  }
  /* ---------- Omas auf Rollatoren ---------- */
  function makeOma(o, accent) {
    const g = new T.Group(), skin = lam('#f2c8a8'), m = lam(o.walker), dark = lam('#2a2a30');
    // Rollator: Rahmen, Räder, Korb, Griffe, Rakete
    for (const s of [-1, 1]) {
      part(g, cyl(), m, s * .55, .75, .55, .045, 1.25, .045, -.25); part(g, cyl(), m, s * .55, .75, -.25, .045, 1.25, .045, .45);
      part(g, cyl(), dark, s * .55, 1.38, -.48, .07, .3, .07, Math.PI / 2);
    }
    part(g, cyl(), m, 0, .55, .25, .04, 1.1, .04, 0, 0, Math.PI / 2); part(g, cyl(), m, 0, 1.33, -.38, .04, 1.1, .04, 0, 0, Math.PI / 2);
    const wh = []; for (const [x, z] of [[-.55, .75], [.55, .75], [-.55, -.5], [.55, -.5]]) wh.push(part(g, tor(), dark, x, .2, z, .18, .18, .18, 0, Math.PI / 2, 0));
    const basket = part(g, box(), lam('#c08a4a'), 0, .75, .5, .9, .35, .55); void basket;
    part(g, sph(), lam('#e8b060'), -.15, 1, .5, .18, .12, .3); part(g, sph(), lam(accent || '#ff4a8a'), .2, .98, .45, .13);   // Brot und Blume
    // Brett und Rakete
    part(g, box(), lam('#3a3a42'), 0, .25, -.85, .8, .08, .7);
    const rk = new T.Group(); rk.position.set(0, .5, -1.25); g.add(rk); part(rk, cyl(), lam('#c8ccd4'), 0, 0, 0, .18, .7, .18, Math.PI / 2); part(rk, cone(), lam('#e84a3a'), 0, 0, .45, .18, .3, .18, Math.PI / 2); part(rk, cyl(), lam('#3a3a42'), 0, 0, -.4, .22, .15, .22, Math.PI / 2);
    const flame = part(rk, cone(), bas('#ffb020', { transparent: true, opacity: .9 }), 0, 0, -.9, .2, .9, .2, -Math.PI / 2); flame.visible = false;
    // Oma: steht auf dem Brett, hält die Griffe
    const om = new T.Group(); om.position.set(0, .3, -.9); g.add(om);
    if (o.bun >= 0) { part(om, cyl(), lam(o.dress), 0, .55, 0, .38, 1.0, .32); part(om, cone(), lam(o.dress), 0, .25, 0, .5, .6, .42, Math.PI); }
    else { part(om, cyl(), lam('#3a3a4a'), -.14, .4, 0, .12, .8, .12); part(om, cyl(), lam('#3a3a4a'), .14, .4, 0, .12, .8, .12); part(om, cyl(), lam(o.dress), 0, 1, 0, .36, .7, .3); }
    part(om, cyl(), lam(o.cardi), 0, 1.25, .05, .4, .5, .34);
    for (const s of [-1, 1]) part(om, cyl(), lam(o.cardi), s * .38, 1.2, .35, .09, .7, .09, 1.2, 0, s * -.15);
    const head = new T.Group(); head.position.set(0, 1.8, .1); om.add(head);
    part(head, sph(), skin, 0, 0, 0, .38); part(head, sph(), skin, 0, -.05, .36, .07);
    part(head, sph(), lam(o.hair), 0, .12, -.05, .4, .32, .4);
    if (o.bun === 1) part(head, sph(), lam(o.hair), 0, .38, -.15, .2);
    else if (o.bun === 2) for (let i = 0; i < 7; i++) part(head, sph(), lam(o.hair), Math.cos(i) * .32, .12 + Math.sin(i * 2) * .1, Math.sin(i) * .25 - .05, .14);
    else if (o.bun === -1) { part(head, cyl(), lam('#5a4a3a'), 0, .28, 0, .42, .08, .42); part(head, cyl(), lam('#5a4a3a'), 0, .4, 0, .3, .25, .3); }
    for (const s of [-1, 1]) { part(head, sph(), lam('#1a1a1a'), s * .13, .03, .33, .045); if (o.glasses) part(head, tor(), lam('#3a3a3a'), s * .13, .03, .35, .09, .09, .09); }
    part(head, sph(), lam('#e88a8a'), -.2, -.12, .28, .07); part(head, sph(), lam('#e88a8a'), .2, -.12, .28, .07);
    // Handtasche am Griff
    const bag = part(g, box(), lam(o.bag), .62, 1.0, -.48, .12, .32, .38); void bag;
    const shield = part(g, sph(), new T.MeshBasicMaterial({ color: '#7ad0ff', transparent: true, opacity: .25 }), 0, 1.2, -.2, 1.7); shield.visible = false;
    const umb = new T.Group(); umb.position.set(0, 3, -.6); umb.visible = false; g.add(umb); part(umb, cone(), lam('#ff4a8a'), 0, 0, 0, 1.2, .5, 1.2); part(umb, cyl(), dark, 0, -.7, 0, .04, 1.4, .04);
    g.userData = { wh, flame, head, om, shield, umb, rk };
    return g;
  }
  /* ---------- Rennen ---------- */
  let Sref = null;
  function setupRace(S, views, omaOf) {
    Sref = S; karts.forEach(k => scene.remove(k)); karts = S.karts.map((k, i) => { const m = makeOma(OMA_DATA.OMAS[k.kart % OMA_DATA.OMAS.length], k.color); scene.add(m); return m; });
    boxM.forEach(b => scene.remove(b)); boxM = S.boxes.map(b => { const g = new T.Group(); part(g, box(), lam('#ff4a8a'), 0, 0, 0, 1.4, 1.4, 1.4); part(g, box(), lam('#ffd040'), 0, 0, 0, 1.45, 1.45, .3); part(g, box(), lam('#ffd040'), 0, 0, 0, .3, 1.45, 1.45); part(g, sph(), lam('#ffd040'), 0, .85, 0, .3, .2, .3); g.position.set(b.x, (tr.height ? tr.height(b.f) : 0) + 1.4, b.z); scene.add(g); return g; });
    padM.forEach(p => scene.remove(p)); padM = S.pads.map(p => { const t = tex(64, 64, x => { x.fillStyle = '#ffb020'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#ff2d95'; for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(8, 50 - i * 28); x.lineTo(32, 26 - i * 28 + 22); x.lineTo(56, 50 - i * 28); x.lineTo(56, 40 - i * 28); x.lineTo(32, 16 - i * 28 + 22); x.lineTo(8, 40 - i * 28); x.fill(); } }); const m = part(scene, new T.PlaneGeometry(3.6, 5), new T.MeshBasicMaterial({ map: t, transparent: true }), p.x, (tr.height ? tr.height(p.f) : 0) + .08, p.z, 1, 1, 1); m.rotation.set(-Math.PI / 2, 0, p.th + Math.PI); return m; });
    crM.forEach(c => scene.remove(c)); crM = (S.creatures || []).map(() => { const g = new T.Group(); const ghost = def.theme === 'grusel'; if (ghost) { part(g, sph(), new T.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: .75 }), 0, 1.5, 0, .9, 1.2, .9); part(g, sph(), lam('#000'), -.3, 1.8, .75, .12); part(g, sph(), lam('#000'), .3, 1.8, .75, .12); } else { part(g, sph(), lam(def.theme === 'strand' ? '#ffffff' : '#8a8a9a'), 0, .5, 0, .45, .4, .6); part(g, sph(), lam(def.theme === 'strand' ? '#ffffff' : '#6a6a7a'), 0, .9, .35, .25); part(g, cone(), lam('#ffb020'), 0, .88, .62, .07, .2, .07, Math.PI / 2); } scene.add(g); return g; });
    ptM.forEach(p => scene.remove(p)); ptM = (S.portals || []).map(p => { const g = new T.Group(); g.position.set(p.x, tr.height ? tr.height(p.from) : 0, p.z); part(g, tor(), bas('#00e5ff'), 0, 3, 0, 4.5, 4.5, 4.5); const bs = tex(128, 40, x => { x.fillStyle = '#ffd040'; x.fillRect(0, 0, 128, 40); x.fillStyle = '#2a2a2a'; x.font = 'bold 22px sans-serif'; x.textAlign = 'center'; x.fillText(def.theme === 'mall' ? 'ROLLTREPPE' : 'BUS', 64, 28); }); part(g, new T.PlaneGeometry(5, 1.6), new T.MeshBasicMaterial({ map: bs, side: T.DoubleSide }), 0, 8.5, 0, 1); scene.add(g); return g; });
    for (const [, m] of hazM) scene.remove(m); hazM.clear(); for (const [, m] of projM) scene.remove(m); projM.clear();
    cams = views.map(() => { const c = new T.PerspectiveCamera(66, 1, .3, 900); c.userData = { pos: new T.Vector3(), look: new T.Vector3(), init: false }; return c; });
    void omaOf;
  }
  function hazMesh(kind) {
    const g = new T.Group();
    if (kind === 'banana') { part(g, sph(), lam('#ff8aa0'), 0, .25, 0, .6, .22, .45); for (let i = 0; i < 6; i++) part(g, box(), lam('#ffffff'), -.4 + i * .16, .42, .32, .13, .16, .08); }
    else { part(g, sph(), lam('#c04ab0'), 0, .55, 0, .55); part(g, tor(), lam('#e070d0'), 0, .55, 0, .5, .5, .5, .5, .3, 0); part(g, cyl(), lam('#d8c8b0'), .3, .9, 0, .03, 1, .03, .6, 0, .4); }
    scene.add(g); return g;
  }
  function projMesh(kind) {
    const g = new T.Group();
    if (kind === 'rock') { part(g, box(), lam('#6a2a1a'), 0, .8, 0, .7, .55, .3); part(g, tor(), lam('#3a1a0a'), 0, 1.15, 0, .22, .22, .22); }
    else { part(g, box(), lam('#5a2a1a'), 0, 1, 0, 1, .4, 1); part(g, box(), lam('#ffd040'), 0, 1.22, 0, 1.05, .05, .2); part(g, cone(), bas('#ffb020'), 0, 1, -.8, .25, .6, .25, -Math.PI / 2); }
    scene.add(g); return g;
  }
  function burst(x, y, z, col, n) {
    for (let i = 0; i < n; i++) { let m = fx.find(f => !f.visible); if (!m) { if (fx.length > 120) return; m = new T.Mesh(sph(), bas(col)); m.scale.setScalar(.18); scene.add(m); fx.push(m); } m.material = bas(col); m.visible = true; m.position.set(x, y, z); m.userData = { vx: rr(-6, 6), vy: rr(3, 8), vz: rr(-6, 6), t: rr(.4, .8) }; }
  }
  const lerpA = (a, b, t) => { let d = b - a; while (d > Math.PI) d -= PI2; while (d < -Math.PI) d += PI2; return a + d * t; };
  function update(S, dt, alpha) {
    time += dt; const hgt = tr.height || (() => 0);
    S.karts.forEach((k, i) => {
      const m = karts[i]; if (!m) return; const x = k.px == null ? k.x : k.px + (k.x - k.px) * alpha, z = k.pz == null ? k.z : k.pz + (k.z - k.pz) * alpha, th = k.pth == null ? k.th : lerpA(k.pth, k.th, alpha);
      m.position.set(x, hgt(k.f) + (k.spinT > 0 ? Math.abs(Math.sin(k.spinT * 8)) * .6 : 0), z); m.rotation.y = th; m.rotation.z = k.drift ? k.drift * -.12 : (k.steer || 0) * -.05;
      const u = m.userData; u.wh.forEach(w => { w.rotation.x += k.vf * dt * 2.5; });
      u.flame.visible = k.boostT > 0 || k.draftT > 0; if (u.flame.visible) u.flame.scale.set(.2, .7 + Math.random() * .5, .2);
      u.om.rotation.x = Math.min(.35, Math.max(0, k.vf / 120)) + (k.boostT > 0 ? .15 : 0); u.head.rotation.y = Math.sin(time * 3 + i) * .15;
      u.shield.visible = k.shieldT > 0; u.umb.visible = k.shieldT > 0;
      if (k.drift && Math.random() < .5) burst(x - Math.sin(th) * 1.2, hgt(k.f) + .2, z - Math.cos(th) * 1.2, ['#ffffff', '#5ab0ff', '#ffb020', '#ff2d95'][k.dTier], 1);
    });
    S.boxes.forEach((b, i) => { const m = boxM[i]; if (!m) return; m.visible = b.cd <= 0; m.rotation.y += dt * 1.5; m.position.y = (tr.height ? tr.height(b.f) : 0) + 1.4 + Math.sin(time * 2 + i) * .2; });
    const seenH = new Set(); for (const h of S.hazards) { let m = hazM.get(h); if (!m) { m = hazMesh(h.kind); hazM.set(h, m); m.userData.y = yAt(h.x, h.z); } m.position.set(h.x, m.userData.y, h.z); m.rotation.y += dt; seenH.add(h); }
    for (const [h, m] of hazM) if (!seenH.has(h)) { scene.remove(m); hazM.delete(h); }
    const seenP = new Set(); for (const p of S.proj) { let m = projM.get(p); if (!m) { m = projMesh(p.kind); projM.set(p, m); } m.position.set(p.x, yAt(p.x, p.z), p.z); m.rotation.y = p.th; if (p.kind === 'rock') m.rotation.x += dt * 12; seenP.add(p); }
    for (const [p, m] of projM) if (!seenP.has(p)) { scene.remove(m); projM.delete(p); }
    (S.creatures || []).forEach((c, i) => { const m = crM[i]; if (!m) return; m.position.set(c.x, yAt(c.x, c.z) + (def.theme === 'grusel' ? Math.sin(time * 2 + i) * .5 : 0), c.z); m.rotation.y = time * (i % 2 ? 1 : -1); });
    ptM.forEach(p => { p.children[0].rotation.y += dt * 2; });
    fx.forEach(f => { if (!f.visible) return; const u = f.userData; u.t -= dt; if (u.t <= 0) { f.visible = false; return; } f.position.x += u.vx * dt; f.position.y += u.vy * dt; f.position.z += u.vz * dt; u.vy -= 18 * dt; });
    world.children.forEach(o => { if (o.userData && o.userData.sea) o.position.y = .02 + Math.sin(time) * .05; });
  }
  function camFor(c, k, dt, mode) {
    const hgt = tr.height ? tr.height(k.f) : 0, fx = Math.sin(k.th), fz = Math.cos(k.th), u = c.userData, back = mode === 'far' ? 11 : 7.2, up = mode === 'far' ? 5.5 : 3.4;
    const fr = mode === 'front', want = fr ? new T.Vector3(k.x + fx * 4.4 + fz * 2.2, hgt + 2, k.z + fz * 4.4 - fx * 2.2) : new T.Vector3(k.x - fx * back, hgt + up, k.z - fz * back), look = fr ? new T.Vector3(k.x - fx * 1.5, hgt + 1.5, k.z - fz * 1.5) : new T.Vector3(k.x + fx * 7, hgt + 1.2, k.z + fz * 7);
    if (!u.init) { u.pos.copy(want); u.look.copy(look); u.init = true; } else { const t = 1 - Math.exp(-dt * 7); u.pos.lerp(want, t); u.look.lerp(look, 1 - Math.exp(-dt * 10)); }
    c.position.copy(u.pos); c.lookAt(u.look); c.fov = 66 + Math.min(14, Math.max(0, k.vf - 30) * .6) + (k.boostT > 0 ? 6 : 0); c.updateProjectionMatrix();
  }
  // Viewports: 1 = voll, 2 = übereinander (quer) bzw. nebeneinander, 3–4 = Viertel
  function rects(n, w, h) {
    if (n <= 1) return [[0, 0, w, h]];
    if (n === 2) return w > h * 1.2 ? [[0, 0, w / 2, h], [w / 2, 0, w / 2, h]] : [[0, h / 2, w, h / 2], [0, 0, w, h / 2]];
    return [[0, h / 2, w / 2, h / 2], [w / 2, h / 2, w / 2, h / 2], [0, 0, w / 2, h / 2], [w / 2, 0, w / 2, h / 2]];
  }
  function render(S, dt, alpha, views, mode) {
    if (!R) return; update(S, dt, alpha);
    const rs = rects(views.length, W, H);
    views.forEach((ki, v) => { const c = cams[v], k = S.karts[ki], r = rs[v]; camFor(c, k, dt, mode); c.aspect = r[2] / r[3]; c.updateProjectionMatrix(); sky.position.copy(c.position); R.setViewport(r[0], r[1], r[2], r[3]); R.setScissor(r[0], r[1], r[2], r[3]); R.render(scene, c); });
  }
  // Menü-Ansicht: Kamera kreist über der Strecke, eine Oma fährt Probe
  let menuCam = null, menuF = 0;
  function renderMenu(dt, kartsS) {
    if (!R || !tr) return; time += dt; if (!menuCam) menuCam = new T.PerspectiveCamera(55, 1, .3, 900);
    menuF = (menuF + dt * 18) % tr.N; const p = {}; tr.at(menuF, 0, p); const q = {}; tr.at(menuF + 14, 0, q); const hgt = tr.height ? tr.height(menuF) : 0;
    menuCam.position.set(p.x + Math.cos(time * .2) * 20, hgt + 14, p.z + Math.sin(time * .2) * 20); menuCam.lookAt(q.x, hgt + 1, q.z); menuCam.aspect = W / H; menuCam.updateProjectionMatrix();
    if (kartsS) update(kartsS, dt, 1);
    sky.position.copy(menuCam.position); R.setViewport(0, 0, W, H); R.setScissor(0, 0, W, H); R.render(scene, menuCam);
  }
  // Vorschau einer Oma (eigene kleine Szene in einem Canvas)
  let pv = null;
  function preview(canvas, o) {
    if (!pv) { const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); const s = new T.Scene(); s.add(new T.HemisphereLight(0xffffff, 0x8899aa, 1)); const d = new T.DirectionalLight(0xffffff, .6); d.position.set(3, 6, 4); s.add(d); const c = new T.PerspectiveCamera(35, 1, .1, 50); c.position.set(3.2, 2.6, 4.2); c.lookAt(0, 1.1, -.3); pv = { r, s, c, m: null }; }
    if (pv.m) pv.s.remove(pv.m); pv.m = makeOma(o, '#ff4a8a'); pv.s.add(pv.m);
    const w = canvas.clientWidth || 260, h = canvas.clientHeight || 220; pv.r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); pv.r.setSize(w, h, false); pv.c.aspect = w / h; pv.c.updateProjectionMatrix();
  }
  function previewFrame(dt) { if (!pv || !pv.m) return; pv.m.rotation.y += dt * .8; pv.m.userData.head.rotation.y = Math.sin(time * 2) * .3; pv.r.render(pv.s, pv.c); }
  function resize(w, h) { W = w; H = h; if (R) R.setSize(w, h, false); }
  function lowerQuality() { if (!R) return; const p = Math.max(.6, R.getPixelRatio() - .25); R.setPixelRatio(p); R.setSize(W, H, false); }
  function fxAt(k, col, n) { const hgt = tr.height ? tr.height(k.f) : 0; burst(k.x, hgt + 1.5, k.z, col, n); }
  window.OmaView = { init, setTrack, setupRace, render, renderMenu, preview, previewFrame, resize, lowerQuality, fxAt, rects };
})();
