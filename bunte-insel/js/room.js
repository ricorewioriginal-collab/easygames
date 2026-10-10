'use strict';
/* Bunte Insel – Zimmer einrichten: Tapete, Teppich, Bettwäsche und Deko im eigenen Kinderzimmer (wird im Spielstand gemerkt). */
BI.createRoom = function (G) {
  const { scene, A, fx, P, save, persist, say } = G, $ = id => document.getElementById(id), K = { open: false }, mat = BI.mat();
  const WALL = [0, 0xfff0b0, 0xffc4dc, 0xbfe6ff, 0xc9f0c0, 0xe2d0ff, 0xffd6a0], RUG = [0, 0xff6b6b, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xffd23f, 0x222831], BED = [0, 0xff5a8a, 0x3fa0ff, 0x4cd07d, 0xb36bff, 0xffd23f, 0xffffff];
  const DECO = [['', '✖'], ['lamp', '💡'], ['plant', '🪴'], ['teddy', '🧸'], ['globe', '🌍'], ['fish', '🐠'], ['balloons', '🎈']];
  const WALLD = [['', '✖'], ['garland', '⭐'], ['clock', '🕒'], ['flags', '🚩']];
  const SPOTS = [[-1.2, .8], [2.9, .8], [.4, 5.2], [-1.8, 5.6]];
  const st = () => { const r = save.room || (save.room = {}); r.wall |= 0; r.rug |= 0; r.bed |= 0; if (!Array.isArray(r.d)) r.d = [0, 0, 0, 0]; r.w |= 0; return r; };
  K.state = st;
  const group = new THREE.Group(); scene.add(group); let flat = null;
  const hex = c => '#' + c.toString(16).padStart(6, '0');
  function model(b, k, x, z) {
    if (k === 'lamp') { b.cyl(x, 0, z, .22, .26, .08, 0x555a66, 8); b.cyl(x, .08, z, .05, .05, 1.3, 0x555a66, 6); b.cone(x, 1.25, z, .42, .5, 0xffe27a, 8); }
    else if (k === 'plant') { b.cyl(x, 0, z, .3, .22, .5, 0xc2453d, 8); b.sph(x, .95, z, .5, 0x3fa84e, 1, 1, 1.2, 1); b.sph(x + .2, 1.25, z, .25, 0x56c46a, 1); }
    else if (k === 'teddy') { b.sph(x, .35, z, .32, 0xb07840, 1); b.sph(x, .85, z, .24, 0xb07840, 1); b.sph(x - .17, 1.04, z, .09, 0xb07840, 0); b.sph(x + .17, 1.04, z, .09, 0xb07840, 0); b.sph(x, .8, z + .2, .08, 0xe8c9a0, 0); b.sph(x - .08, .9, z + .2, .035, 0x111111, 0); b.sph(x + .08, .9, z + .2, .035, 0x111111, 0); }
    else if (k === 'globe') { b.cyl(x, 0, z, .3, .3, .06, 0x8a5a33, 8); b.cyl(x, .06, z, .05, .05, .6, 0x8a5a33, 6); b.sph(x, 1.0, z, .38, 0x3fa0ff, 1); b.sph(x + .12, 1.08, z + .27, .15, 0x4cd07d, 0); b.sph(x - .2, .92, z + .22, .11, 0x4cd07d, 0); }
    else if (k === 'fish') { b.box(x, .5, z, 1.1, .8, .6, 0x8fd8ff); b.box(x, .45, z, 1.14, .08, .64, 0x3a3d45); b.box(x, 1.35 - .5, z, 1.14, .06, .64, 0x3a3d45); b.sph(x - .1, .85, z, .12, 0xff8a1f, 1, 1.4, 1, 1); b.sph(x + .22, .65, z, .1, 0xffd23f, 1, 1.4, 1, 1); b.sph(x, .45, z, .08, 0x56c46a, 0); }
    else if (k === 'balloons') { for (const [dx, dy, c] of [[-.25, 1.7, 0xff5a5a], [.05, 2.0, 0x4da3ff], [.3, 1.65, 0xffd23f]]) { b.sph(x + dx, dy, z, .28, c, 1, 1, 1.15, 1); b.box(x + dx * .3, .95 + dy * .2, z, .015, dy - .5, .015, 0xffffff); } b.cyl(x, 0, z, .12, .14, .15, 0x555a66, 6); }
  }
  function wallModel(b, k, cx, zb) {
    const z = zb + .24; if (k === 'garland') for (let i = 0; i < 7; i++) b.sph(cx + 1.2 + i * .7, 2.7 - Math.sin(i / 6 * Math.PI) * .35, z, .17, [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d][i % 4], 0);
    else if (k === 'clock') { b.cyl(cx + 3.2, 2.0, z - .06, .55, .55, .08, 0xffffff, 16); b.box(cx + 3.2, 2.12, z + .02, .04, .3, .02, 0x222222); b.box(cx + 3.3, 2.0, z + .02, .24, .04, .02, 0x222222); }
    else if (k === 'flags') for (let i = 0; i < 6; i++) b.cone(cx + 1.2 + i * .75, 2.7 - Math.abs(i - 2.5) * .08, z, .22, .4, [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8a1f][i], 3);
  }
  K.build = function () {
    while (group.children.length) { const c = group.children.pop(); c.geometry.dispose(); } if (!flat) return; const r = st(), b = new BI.Batch(), cx = flat.cx, zb = flat.zB, FW = flat.x1 - flat.x0;
    if (r.wall) b.box(cx, 1.65, zb + .205, FW - .5, 3.1, .01, WALL[r.wall]);
    if (r.rug) b.box(cx + .2, .08, zb + 5.1, 4.4, .02, 2.6, RUG[r.rug]);
    if (r.bed) b.box(cx - 3.6, .78, zb + 2.6, 1.9, .04, 2.0, BED[r.bed]);
    r.d.forEach((i, s) => { if (i && DECO[i]) model(b, DECO[i][0], cx + SPOTS[s][0], zb + SPOTS[s][1]); }); if (r.w && WALLD[r.w]) wallModel(b, WALLD[r.w][0], cx, zb);
    if (!b.p.length) return; const m = b.mesh(mat); m.frustumCulled = false; group.add(m);
  };
  K.place = f => { if (f === flat) return; flat = f; K.build(); };
  function render() {
    const r = st(), box = $('roomBox'); box.innerHTML = '';
    const row = (title, n, get, set, mk) => { const d = document.createElement('div'); d.className = 'lab'; d.textContent = title; box.appendChild(d); const rw = document.createElement('div'); rw.className = 'row'; for (let i = 0; i < n; i++) { const b = mk(i); b.classList.toggle('sel', get() === i); b.onclick = () => { set(i); persist(); K.build(); A.pop(); render(); }; rw.appendChild(b); } box.appendChild(rw); };
    const sw = (arr) => i => { const b = document.createElement('button'); b.className = 'sw'; if (arr[i]) b.style.background = hex(arr[i]); else { b.style.background = '#fff'; b.textContent = '✖'; } b.setAttribute('aria-label', 'Farbe ' + i); return b; };
    const ic = arr => i => { const b = document.createElement('button'); b.className = 'hat'; b.textContent = arr[i][1]; return b; };
    row('🎨 Tapete', WALL.length, () => r.wall, v => r.wall = v, sw(WALL)); row('🟥 Teppich', RUG.length, () => r.rug, v => r.rug = v, sw(RUG)); row('🛏️ Bettwäsche', BED.length, () => r.bed, v => r.bed = v, sw(BED));
    for (let s = 0; s < 4; s++) row('🪑 Deko ' + (s + 1), DECO.length, () => r.d[s], v => r.d[s] = v, ic(DECO)); row('🖼️ Wand', WALLD.length, () => r.w, v => r.w = v, ic(WALLD));
  }
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); render(); $('roomPanel').hidden = false; };
  K.close = function () { K.open = false; $('roomPanel').hidden = true; G.updateButtons(true); G.earn && G.earn('room'); };
  $('roomClose').addEventListener('click', K.close);
  return K;
};
