'use strict';
/* Bunte Insel – Zimmer einrichten: Tapete, Teppich, Bettwäsche und Deko im eigenen Kinderzimmer (wird im Spielstand gemerkt). */
BI.createRoom = function (G) {
  const { scene, A, fx, P, save, persist, say } = G, $ = id => document.getElementById(id), K = { open: false }, mat = BI.mat();
  const WALL = [0, 0xfff0b0, 0xffc4dc, 0xbfe6ff, 0xc9f0c0, 0xe2d0ff, 0xffd6a0], RUG = [0, 0xff6b6b, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xffd23f, 0x222831], BED = [0, 0xff5a8a, 0x3fa0ff, 0x4cd07d, 0xb36bff, 0xffd23f, 0xffffff];
  const DECO = [['', '✖'], ['lamp', '💡'], ['plant', '🪴'], ['teddy', '🧸'], ['globe', '🌍'], ['fish', '🐠'], ['balloons', '🎈'], ['piano', '🎹', 'deco_piano'], ['rocket', '🚀', 'deco_rocket'], ['dino', '🦖', 'deco_dino'], ['castle', '🏰', 'deco_castle'], ['racecar', '🏎️', 'deco_racecar']];
  const WALLD = [['', '✖'], ['garland', '⭐'], ['clock', '🕒'], ['flags', '🚩'], ['rainbow', '🌈', 'deco_rainbow'], ['stars2', '🌟', 'deco_stars']];
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
    else if (k === 'piano') { b.box(x, .45, z, 1.5, .7, .6, 0x1b1b25); for (let i = 0; i < 9; i++) b.box(x - .64 + i * .16, 1.16, z + .12, .13, .05, .3, 0xffffff); b.box(x - .65, 0, z, .08, .45, .5, 0x1b1b25); b.box(x + .65, 0, z, .08, .45, .5, 0x1b1b25); }
    else if (k === 'rocket') { b.cyl(x, .2, z, .38, .38, 1.5, 0xf4f6fa, 10); b.cone(x, 1.7, z, .38, .6, 0xe0382b, 10); for (const a of [0, 2.1, 4.2]) b.box(x + Math.sin(a) * .42, .25, z + Math.cos(a) * .42, .08, .5, .3, 0xe0382b, a); b.sph(x, 1.1, z + .36, .12, 0x3fa0ff, 0); b.cyl(x, 0, z, .45, .45, .2, 0x555a66, 8); }
    else if (k === 'dino') { b.sph(x, .6, z, .5, 0x4cd07d, 1, 1, .9, 1.4); b.sph(x, 1.05, z + .55, .3, 0x4cd07d, 1); b.box(x, .95, z + .8, .3, .14, .2, 0xffffff); b.cone(x, .5, z - .75, .3, .9, 0x4cd07d, 6, Math.PI / 2); for (let i = 0; i < 4; i++) b.cone(x, 1.05 + (i % 2) * .05, z - .4 + i * .3, .08, .25, 0xffd23f, 4); for (const sd of [-1, 1]) b.box(x + sd * .3, 0, z + .2, .16, .3, .2, 0x3aa85e); }
    else if (k === 'castle') { b.box(x, 0, z, 1.3, .8, .8, 0xb9c0cc); for (const [dx, dz] of [[-.55, -.3], [.55, -.3], [-.55, .3], [.55, .3]]) { b.cyl(x + dx, 0, z + dz, .22, .22, 1.2, 0xc9ced6, 8); b.cone(x + dx, 1.2, z + dz, .28, .4, 0xe0382b, 8); } b.box(x, 0, z + .41, .35, .55, .05, 0x5a3d2b); }
    else if (k === 'racecar') { b.box(x, .2, z, .7, .25, 1.4, 0xe0382b); b.box(x, .42, z - .1, .55, .22, .7, 0xa8dcff); b.box(x, .55, z - .6, .6, .06, .25, 0x23262d); for (const sx of [-1, 1]) for (const sz of [-.45, .5]) b.cyl(x + sx * .38, .02, z + sz, .2, .2, .12, 0x23262d, 8, 0, 0, Math.PI / 2); }
    else if (k === 'balloons') { for (const [dx, dy, c] of [[-.25, 1.7, 0xff5a5a], [.05, 2.0, 0x4da3ff], [.3, 1.65, 0xffd23f]]) { b.sph(x + dx, dy, z, .28, c, 1, 1, 1.15, 1); b.box(x + dx * .3, .95 + dy * .2, z, .015, dy - .5, .015, 0xffffff); } b.cyl(x, 0, z, .12, .14, .15, 0x555a66, 6); }
  }
  function wallModel(b, k, cx, zb) {
    const z = zb + .24; if (k === 'garland') for (let i = 0; i < 7; i++) b.sph(cx + 1.2 + i * .7, 2.7 - Math.sin(i / 6 * Math.PI) * .35, z, .17, [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d][i % 4], 0);
    else if (k === 'clock') { b.cyl(cx + 3.2, 2.0, z - .06, .55, .55, .08, 0xffffff, 16); b.box(cx + 3.2, 2.12, z + .02, .04, .3, .02, 0x222222); b.box(cx + 3.3, 2.0, z + .02, .24, .04, .02, 0x222222); }
    else if (k === 'rainbow') { const cs = [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x4a4fe0, 0x9b4de0]; for (let i = 0; i < 7; i++) for (let a = 0; a <= 8; a++) { const t = a / 8 * Math.PI; b.box(cx + 3.0 + Math.cos(t) * (1.1 - i * .09), 1.1 + Math.sin(t) * (1.1 - i * .09), z, .14, .14, .05, cs[i]); } }
    else if (k === 'stars2') for (let i = 0; i < 14; i++) b.sph(cx + .8 + (i * 37 % 100) / 100 * 4.6, 1.2 + (i * 53 % 100) / 100 * 1.8, z, .08 + (i % 3) * .03, 0xffe14a, 0);
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
    const ic = arr => i => { const b = document.createElement('button'); b.className = 'hat'; const lock = arr[i][2] && !save.owned.includes(arr[i][2]); b.textContent = lock ? '🔒' : arr[i][1]; if (lock) { b.disabled = true; b.title = 'Gibt es im Spielzeugladen'; } return b; };
    row('🎨 Tapete', WALL.length, () => r.wall, v => r.wall = v, sw(WALL)); row('🟥 Teppich', RUG.length, () => r.rug, v => r.rug = v, sw(RUG)); row('🛏️ Bettwäsche', BED.length, () => r.bed, v => r.bed = v, sw(BED));
    for (let s = 0; s < 4; s++) row('🪑 Deko ' + (s + 1), DECO.length, () => r.d[s], v => r.d[s] = v, ic(DECO)); row('🖼️ Wand', WALLD.length, () => r.w, v => r.w = v, ic(WALLD));
  }
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); render(); $('roomPanel').hidden = false; };
  K.close = function () { K.open = false; $('roomPanel').hidden = true; G.updateButtons(true); G.earn && G.earn('room'); };
  $('roomClose').addEventListener('click', K.close);
  return K;
};
