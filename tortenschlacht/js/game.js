/* Tortenschlacht – Grafik (Canvas 2D), Eingabe, Modi, Ton, Radio und Online (Handy als Zielgerät).
 * Logik: js/core.js (TS). Online: PeerJS-kompatibel über ../cloud/fire-peer.js, Einladung über EasyGamesLink.share (easygames-Homepage).
 * Eingabe: Maus/Touch, Tastatur (Pfeile/WASD, Leertaste, R, Q), Gamecontroller (Stick, A/RT, X, Y/RB, Start). In Menüs übernimmt ../gamepad.js. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const P = 'tortenschlacht-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, vib: true, low: false, station: '' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const COLS = ['#FF4FAE', '#00E5FF', '#FFC94D', '#2EE6A0'];
  const SKIN = ['#f6d1b1', '#e8b48f', '#c98e66', '#9b6a45', '#6b4630'], HAIR = ['#2b1d14', '#7a4220', '#d9a441', '#151515', '#b9b9b9'];
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };

  /* ---------- Leinwand ---------- */
  const cv = $('c'), cx = cv.getContext('2d');
  let DPR = 1, CW = 1, CH = 1, A = 1.78, sceneC = null, sceneKey = '';
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, SET.low ? 1 : 1.75);
    CW = Math.round(innerWidth * DPR); CH = Math.round(innerHeight * DPR); cv.width = CW; cv.height = CH; A = CW / CH;
    if (G.g && !G.g.solo) { G.g.WW = G.g.A = A; } if (G.g) G.g.A = A;
    sceneKey = '';
  }
  addEventListener('resize', resize);
  const logos = []; for (let i = 1; i <= 14; i++) { const im = new Image(); im.onload = () => { sceneKey = ''; }; im.src = '../anmacha-memory/logos/' + String(i).padStart(2, '0') + '.png'; logos[i] = im; }
  const imgOk = im => im && im.complete && im.naturalWidth > 0;

  /* ---------- Kulisse (einmal vorgezeichnet, in Welt-Einheiten; Gebäude und Türme kommen aus der Logik) ---------- */
  function buildScene(g) {
    const key = g.WW.toFixed(3) + '|' + CH + '|' + logos.filter(imgOk).length; if (key === sceneKey && sceneC) return; sceneKey = key;
    const k = Math.min(1, 4096 / (g.WW * CH)); sceneC = sceneC || document.createElement('canvas');
    sceneC.width = Math.ceil(g.WW * CH * k); sceneC.height = Math.ceil(CH * k); sceneC.k = k;
    const c = sceneC.getContext('2d'); c.setTransform(CH * k, 0, 0, CH * k, 0, 0); c.clearRect(0, 0, g.WW, 1);
    const R = TS.mulberry(91), W = g.WW, L = TS.LAYERS, ST = g.stations;
    const band = (y0, col, amp, fr) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 1.1); for (let x = 0; x <= W + .05; x += .05) c.lineTo(x, y0 + Math.sin(x * fr) * amp + Math.sin(x * fr * 2.3 + 1) * amp * .5); c.lineTo(W + .05, 1.1); c.fill(); };
    const text = (t, x, y, px, col, bold) => { c.save(); c.translate(x, y); c.scale(.001, .001); c.fillStyle = col; c.font = (bold || 'bold') + ' ' + px + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 0, 1); c.restore(); };
    band(.52, '#4c8f45', .01, 3);
    let li = 1;
    for (const b of ST.buildings) {
      const { x, w: bw, h: bh, y } = b;
      c.fillStyle = '#ece7f8'; c.fillRect(x, y - bh, bw, bh); c.fillStyle = '#cfc8ea'; c.fillRect(x, y - bh, bw, .012); c.fillRect(x, y - .012, bw, .012);
      c.fillStyle = '#3b2a7a'; c.beginPath(); c.moveTo(x - .02, y - bh); c.lineTo(x + bw / 2, y - bh - .05); c.lineTo(x + bw + .02, y - bh); c.fill();
      for (const wn of b.win) { c.fillStyle = '#2a3560'; c.fillRect(wn.x, wn.y, wn.w, wn.h); c.fillStyle = '#7fc8ff'; c.fillRect(wn.x + .003, wn.y + .003, wn.w - .006, wn.h - .006); c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(wn.x + .006, wn.y + .006, .008, wn.h - .012); c.fillStyle = '#b9b2dc'; c.fillRect(wn.x - .004, wn.y + wn.h, wn.w + .008, .005); }
      const oa = b.onair; c.fillStyle = '#7a0a18'; c.fillRect(oa.x - oa.w / 2, oa.y - oa.h / 2, oa.w, oa.h); text('ON AIR', oa.x, oa.y, 17, '#ffb0b8');
      const im = logos[li]; if (imgOk(im)) { c.fillStyle = '#fff'; c.fillRect(x + .025, y - .085, .07, .07); c.drawImage(im, x + .03, y - .08, .06, .06); } li = li % 13 + 1;
      c.fillStyle = '#6b4a2a'; c.fillRect(x + bw / 2 - .02, y - .055, .04, .055);
    }
    for (const t of ST.tower) {
      const x = t.x, base = L[0].g + .01, top = .14;
      c.strokeStyle = '#d6d6e6'; c.lineWidth = .004; c.beginPath(); c.moveTo(x - .035, base); c.lineTo(x - .008, top); c.moveTo(x + .035, base); c.lineTo(x + .008, top); c.stroke();
      c.lineWidth = .002; c.beginPath(); for (let i = 0; i < 12; i++) { const y0 = base - (base - top) * i / 12, y1 = base - (base - top) * (i + 1) / 12, w0 = .035 - .027 * i / 12, w1 = .035 - .027 * (i + 1) / 12; c.moveTo(x - w0, y0); c.lineTo(x + w1, y1); c.moveTo(x + w0, y0); c.lineTo(x - w1, y1); } c.stroke();
      for (let i = 1; i < 6; i++) { const y = base - (base - top) * i / 6; c.fillStyle = i % 2 ? '#e8402f' : '#fff'; c.fillRect(x - .03 + .025 * i / 6, y - .004, .06 - .05 * i / 6, .008); }
      c.strokeStyle = '#999'; c.lineWidth = .003; c.beginPath(); c.moveTo(x, top); c.lineTo(x, .1); c.stroke();
    }
    band(.62, '#58a94f', .012, 2.1);
    for (let i = 0; i < W * 4; i++) { const x = R() * W, y = .6 + R() * .08, r = .02 + R() * .03; c.fillStyle = '#6b4a2a'; c.fillRect(x - .004, y - r * .2, .008, r * 1.1); c.fillStyle = ['#2f7a3a', '#3a8f45', '#277033'][i % 3]; c.beginPath(); c.arc(x, y - r * .6, r, 0, 7); c.arc(x - r * .6, y - r * .2, r * .7, 0, 7); c.arc(x + r * .6, y - r * .2, r * .7, 0, 7); c.fill(); }
    band(.785, '#67c25a', .01, 1.7);
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < W * 140; i++) c.fillRect(R() * W, .8 + R() * .2, .002, .008);
    for (const m of ST.mic) { const s = L[m.layer].s * TS.HMAN, gy = L[m.layer].g, x = m.x + s * .2; c.strokeStyle = '#333'; c.lineWidth = s * .025; c.beginPath(); c.moveTo(x - s * .12, gy); c.lineTo(x, gy - s * .02); c.lineTo(x + s * .12, gy); c.moveTo(x, gy); c.lineTo(x, gy - s * .8); c.lineTo(x - s * .14, gy - s * .86); c.stroke(); c.fillStyle = '#222'; c.beginPath(); c.ellipse(x - s * .15, gy - s * .87, s * .035, s * .045, -.6, 0, 7); c.fill(); }
  }
  function drawSky(g) {
    const gr = cx.createLinearGradient(0, 0, 0, CH * .6); gr.addColorStop(0, '#2a1b6b'); gr.addColorStop(.55, '#ff7a6a'); gr.addColorStop(1, '#ffc46b');
    cx.fillStyle = gr; cx.fillRect(0, 0, CW, CH);
    cx.fillStyle = 'rgba(255,240,200,.9)'; cx.beginPath(); cx.arc(CW * .78 - G.camX * CH * .1, CH * .28, CH * .07, 0, 7); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 5; i++) { const x = ((i * .9 + G.time * .01 - G.camX * .2) % 4.5 + 4.5) % 4.5 - .5, y = .1 + (i % 3) * .07; cx.beginPath(); cx.ellipse(x * CH, y * CH, CH * .09, CH * .025, 0, 0, 7); cx.ellipse(x * CH + CH * .05, y * CH - CH * .015, CH * .05, CH * .025, 0, 0, 7); cx.fill(); }
    const off = G.camX * .35; cx.fillStyle = '#6a4f9e'; cx.beginPath(); cx.moveTo(0, CH); for (let px = 0; px <= CW + 20; px += 20) { const x = px / CH + off; cx.lineTo(px, CH * (.45 + Math.sin(x * 2.1) * .04 + Math.sin(x * 5.3) * .015)); } cx.lineTo(CW, CH); cx.fill();
  }

  /* ---------- Menschen zeichnen (Ursprung = Füße, Blick nach rechts, u = Körpergröße in Pixeln) ---------- */
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function blob(c, x, y, r, drips) { c.beginPath(); c.arc(x, y, r, 0, 7); c.arc(x - r * .7, y + r * .2, r * .6, 0, 7); c.arc(x + r * .65, y + r * .25, r * .55, 0, 7); c.arc(x + r * .1, y - r * .55, r * .5, 0, 7); c.fill(); if (drips) for (let i = -1; i <= 1; i++) { const l = r * (1.1 + ((i + 2) % 2) * .6); c.fillRect(x + i * r * .45 - r * .1, y, r * .2, l); c.beginPath(); c.arc(x + i * r * .45, y + l, r * .12, 0, 7); c.fill(); } }
  const SHIRTS = ['#4fa8ff', '#FF4FAE', '#2EE6A0', '#8B5CF6', '#ff8a1f', '#e8e8f0', '#d0102a', '#1f9aa8', '#f2c94c', '#3a3a5a'], PANTS = ['#2b2f55', '#1f2a44', '#4a3a2a', '#555c66', '#20202a', '#6a5a8a'];
  function outfit(p) {
    const r = TS.mulberry(p.look), o = { skin: SKIN[(r() * SKIN.length) | 0], hair: HAIR[(r() * HAIR.length) | 0], hs: (r() * 6) | 0, shirt: SHIRTS[(r() * SHIRTS.length) | 0], pants: PANTS[(r() * PANTS.length) | 0], skirt: r() < .25, glasses: r() < .2, beard: r() < .18, shoe: r() < .5 ? '#1a1a1a' : '#f2f2f2', acc: {} };
    const t = p.type;
    if (t === 'mod') { o.acc.phones = 1; o.shirt = '#FF4FAE'; }
    if (t === 'dj') { o.acc.phones = 1; o.acc.cap = '#d0102a'; o.shirt = '#1a1a1a'; o.print = 'DJ'; }
    if (t === 'prak') o.acc.tray = !p.landed;
    if (t === 'tech') { o.acc.helmet = '#ffd400'; o.shirt = '#ff8a1f'; o.vest = 1; o.skirt = false; }
    if (t === 'chef') { o.jacket = '#2b2b3a'; o.shirt = '#fff'; o.pants = '#2b2b3a'; o.acc.tie = 1; o.hs = 4; o.beard = true; o.skirt = false; }
    if (t === 'kond') { o.shirt = '#fff'; o.pants = '#e6e6e6'; o.acc.toque = 1; o.skirt = false; }
    if (t === 'fan') { o.shirt = '#ffc94d'; o.logo = 7; }
    if (t === 'cannon') { o.acc.helmet = '#d0102a'; o.shirt = '#ffffff'; o.pants = '#d0102a'; o.skirt = false; }
    if (t === 'jet') { o.acc.helmet = '#c0c0d0'; o.acc.goggles = 1; o.skirt = false; }
    if (t === 'para') { o.acc.helmet = '#2EE6A0'; o.skirt = false; }
    if (t === 'bike') { o.acc.helmet = '#00E5FF'; o.skirt = false; }
    return o;
  }
  const limb = (c, x0, y0, a1, l1, a2, l2, w, col) => { const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); return [x2, y2]; };
  function human(c, u, o, pose, ph, face) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    const hipY = -u * .48, shY = -u * .79, hx = u * .035;
    // Beine (Winkel: 0 = senkrecht nach unten, positiv = nach vorn)
    let lA = [0, 0], lB = [0, 0];
    if (pose === 'walk' || pose === 'run') { const s = pose === 'run' ? .75 : .42, a = Math.sin(ph) * s; lA = [a, a - Math.max(0, -Math.sin(ph)) * .9]; lB = [-a, -a - Math.max(0, Math.sin(ph)) * .9]; }
    else if (pose === 'bike') { const a = Math.sin(ph) * .5; lA = [.9 + a, -.3 + a]; lB = [.9 - a, -.3 - a]; }
    else if (pose === 'fly') { lA = [-.35, -.5]; lB = [-.15, -.25]; }
    else if (pose === 'para') { const a = Math.sin(ph * .5) * .15; lA = [.15 + a, .05]; lB = [-.1 - a, -.1]; }
    else if (pose === 'panic') { const a = Math.sin(ph) * .6; lA = [a, a - .4]; lB = [-a, -a - .4]; }
    const legW = u * .075, legCol = o.pants;
    for (const [i, L] of [[1, lB], [0, lA]]) { const f = limb(c, (i ? -hx : hx), hipY, L[0], u * .235, L[1], u * .235, legW, legCol); c.fillStyle = o.shoe; c.beginPath(); c.ellipse(f[0] + u * .03, f[1] + u * .005, u * .055, u * .025, 0, 0, 7); c.fill(); if (i) { c.globalAlpha = 1; } }
    if (o.skirt && pose !== 'bike' && pose !== 'fly') { c.fillStyle = o.pants; c.beginPath(); c.moveTo(-u * .085, -u * .55); c.lineTo(u * .085, -u * .55); c.lineTo(u * .13, -u * .33); c.lineTo(-u * .13, -u * .33); c.fill(); }
    // Arme: Winkel Oberarm/Unterarm (0 = nach unten, π = nach oben, positiv = nach vorn)
    let aF = [.2, .5], aB = [-.2, .1];
    if (pose === 'walk' || pose === 'run') { const s = pose === 'run' ? .9 : .45, a = Math.sin(ph) * s; aF = [-a + .1, -a + .6]; aB = [a - .1, a + .3]; }
    else if (pose === 'panic') { const w = Math.sin(ph * 1.7) * .25; aF = [2.6 + w, 2.9 + w]; aB = [-2.6 - w, -2.9 - w]; }
    else if (pose === 'aim') aF = [2.9, 2.6];
    else if (pose === 'wave') aF = [2.4, 2.9 + Math.sin(ph * 2) * .4];
    else if (pose === 'para') { aF = [2.6, 3]; aB = [-2.6, -3]; }
    else if (pose === 'fly') { aF = [2.2, 2.2]; aB = [1.6, 1.4]; }
    else if (pose === 'bike') { aF = [1.1, 1.4]; aB = [1.0, 1.3]; }
    else if (pose === 'tray') { aF = [.9, 1.57]; }
    else if (pose === 'dj') { aF = [1 + Math.sin(ph * 2) * .3, 1.4]; aB = [.9 - Math.sin(ph * 2) * .3, 1.4]; }
    const sleeve = o.jacket || o.shirt, armW = u * .06;
    const handB = limb(c, -u * .1, shY + u * .02, aB[0], u * .17, aB[1], u * .16, armW, sleeve);
    c.fillStyle = o.skin; c.beginPath(); c.arc(handB[0], handB[1], u * .03, 0, 7); c.fill();
    // Rumpf
    c.fillStyle = o.jacket || o.shirt; c.beginPath(); c.moveTo(-u * .12, shY); c.quadraticCurveTo(0, shY - u * .025, u * .12, shY); c.lineTo(u * .095, hipY + u * .02); c.lineTo(-u * .095, hipY + u * .02); c.closePath(); c.fill();
    if (o.jacket) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-u * .035, shY); c.lineTo(u * .035, shY); c.lineTo(0, shY + u * .14); c.fill(); }
    if (o.acc.tie) { c.fillStyle = '#d0102a'; c.beginPath(); c.moveTo(-u * .015, shY + u * .01); c.lineTo(u * .015, shY + u * .01); c.lineTo(u * .02, shY + u * .17); c.lineTo(0, shY + u * .2); c.lineTo(-u * .02, shY + u * .17); c.fill(); }
    if (o.vest) { c.fillStyle = '#fff36b'; c.fillRect(-u * .1, shY + u * .14, u * .2, u * .025); }
    if (o.acc.toque) { c.fillStyle = '#ddd'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(u * .03, shY + u * .08 + i * u * .06, u * .01, 0, 7); c.fill(); } }
    if (o.logo && imgOk(logos[o.logo])) c.drawImage(logos[o.logo], -u * .065, shY + u * .06, u * .13, u * .13);
    if (o.print) { c.fillStyle = '#FF4FAE'; c.font = '900 ' + (u * .07) + 'px system-ui'; c.textAlign = 'center'; c.fillText(o.print, 0, shY + u * .16); }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-u * .095, hipY - u * .01, u * .19, u * .025);
    // Kopf
    const HY = -u * .905, HR = u * .075;
    c.fillStyle = o.skin; c.fillRect(-u * .022, shY - u * .045, u * .044, u * .05);
    if (o.hs === 1 || o.hs === 2 || o.hs === 5) { c.fillStyle = o.hair; if (o.hs === 1) rr(c, -u * .085, HY - u * .03, u * .1, u * .15, u * .04), c.fill(); }
    c.fillStyle = o.skin; c.beginPath(); c.ellipse(0, HY, HR * .93, HR, 0, 0, 7); c.fill(); c.beginPath(); c.arc(-u * .01, HY + u * .005, u * .016, 0, 7); c.fill();
    c.fillStyle = o.hair;
    if (o.hs === 4) { c.beginPath(); c.arc(-u * .02, HY - u * .005, HR * .98, Math.PI * .85, Math.PI * 1.15); c.lineTo(-u * .02, HY); c.fill(); }
    else if (o.hs === 3) { for (let i = 0; i < 7; i++) { const a = Math.PI * (1 + i / 6); c.beginPath(); c.arc(Math.cos(a) * HR * .85 - u * .005, HY + Math.sin(a) * HR * .85, u * .03, 0, 7); c.fill(); } }
    else { c.beginPath(); c.ellipse(-u * .008, HY - u * .02, HR * .98, HR * .78, 0, Math.PI * .92, Math.PI * 2.04); c.fill(); if (o.hs === 2) { c.beginPath(); c.ellipse(-u * .095, HY + u * .01, u * .025, u * .06, .5, 0, 7); c.fill(); } if (o.hs === 5) { c.beginPath(); c.arc(-u * .05, HY - u * .075, u * .03, 0, 7); c.fill(); } }
    if (o.beard) { c.fillStyle = o.hs === 4 ? '#5a3a1a' : o.hair; c.beginPath(); c.ellipse(u * .03, HY + u * .045, u * .045, u * .03, 0, 0, Math.PI); c.fill(); }
    // Gesicht
    const ex = u * .035, ey = HY - u * .008;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, u * .016, face === 'shock' ? u * .02 : u * .013, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(ex + u * .033, ey, u * .012, face === 'shock' ? u * .018 : u * .012, 0, 0, 7); c.fill();
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(ex + u * .005, ey + u * .002, u * .007, 0, 7); c.arc(ex + u * .037, ey + u * .002, u * .006, 0, 7); c.fill();
    c.strokeStyle = '#2a1a10'; c.lineWidth = u * .008; c.beginPath();
    if (face === 'angry') { c.moveTo(ex - u * .015, ey - u * .028); c.lineTo(ex + u * .015, ey - u * .016); c.moveTo(ex + u * .025, ey - u * .016); c.lineTo(ex + u * .047, ey - u * .026); }
    else { c.moveTo(ex - u * .013, ey - u * .024 - (face === 'shock' ? u * .008 : 0)); c.lineTo(ex + u * .013, ey - u * .026 - (face === 'shock' ? u * .008 : 0)); }
    c.stroke();
    c.fillStyle = o.skin; c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = u * .005; c.beginPath(); c.moveTo(u * .062, HY + u * .002); c.lineTo(u * .078, HY + u * .022); c.lineTo(u * .06, HY + u * .025); c.stroke();
    c.fillStyle = '#7a2020'; c.strokeStyle = '#7a2020'; c.lineWidth = u * .008;
    if (face === 'shock') { c.beginPath(); c.ellipse(u * .045, HY + u * .045, u * .016, u * .02, 0, 0, 7); c.fill(); }
    else if (face === 'angry') { c.beginPath(); c.moveTo(u * .03, HY + u * .05); c.lineTo(u * .062, HY + u * .046); c.stroke(); }
    else { c.beginPath(); c.arc(u * .045, HY + u * .03, u * .02, .3, Math.PI - .3); c.stroke(); }
    if (o.glasses) { c.strokeStyle = '#1a1a1a'; c.lineWidth = u * .006; c.beginPath(); c.arc(ex, ey, u * .019, 0, 7); c.moveTo(ex + u * .052, ey); c.arc(ex + u * .033, ey, u * .017, 0, 7); c.stroke(); }
    // Kopfbedeckung
    if (o.acc.helmet) { c.fillStyle = o.acc.helmet; c.beginPath(); c.arc(0, HY - u * .01, HR * 1.06, Math.PI * .95, Math.PI * 2.05); c.fill(); c.fillRect(-HR, HY - u * .015, HR * 2.1, u * .015); }
    if (o.acc.goggles) { c.fillStyle = '#00E5FF'; rr(c, u * .015, ey - u * .018, u * .065, u * .03, u * .012); c.fill(); }
    if (o.acc.cap) { c.fillStyle = o.acc.cap; c.beginPath(); c.arc(0, HY - u * .015, HR * 1.02, Math.PI, 0); c.fill(); c.fillRect(0, HY - u * .02, u * .12, u * .02); }
    if (o.acc.toque) { c.fillStyle = '#fff'; c.strokeStyle = '#ddd'; c.lineWidth = u * .004; rr(c, -u * .07, HY - u * .2, u * .14, u * .15, u * .05); c.fill(); c.stroke(); c.fillRect(-u * .08, HY - u * .085, u * .16, u * .03); }
    if (o.acc.phones) { c.strokeStyle = '#222'; c.lineWidth = u * .016; c.beginPath(); c.arc(-u * .005, HY - u * .005, HR * 1.12, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); c.fillStyle = '#222'; rr(c, -u * .035, HY - u * .025, u * .035, u * .055, u * .012); c.fill(); }
    // vorderer Arm (über dem Rumpf)
    const hand = limb(c, u * .1, shY + u * .02, aF[0], u * .17, aF[1], u * .16, armW, sleeve);
    c.fillStyle = o.skin; c.beginPath(); c.arc(hand[0], hand[1], u * .03, 0, 7); c.fill();
    return { hand, handB };
  }
  function drawPie(x, y, r) {
    cx.fillStyle = '#c7843f'; cx.beginPath(); cx.ellipse(x, y + r * .25, r, r * .45, 0, 0, 7); cx.fill();
    cx.fillStyle = '#fffaf0'; cx.beginPath(); cx.ellipse(x, y, r * .95, r * .42, 0, 0, 7); cx.fill();
    for (let i = -2; i <= 2; i++) { cx.beginPath(); cx.arc(x + i * r * .38, y - r * .12, r * .16, 0, 7); cx.fill(); }
    cx.fillStyle = '#d0102a'; cx.beginPath(); cx.arc(x, y - r * .3, r * .16, 0, 7); cx.fill();
  }
  const CALLS = ['Hey!', 'Iiih!', 'Mein Hemd!', 'Sahne?!', 'Nicht die Frisur!', 'Uff!', 'Lecker …', 'Na warte!'];
  function drawPerson(p, g) {
    const b = TS.body(p), u = b.s * CH, X = (p.x - G.camX) * CH, GY = b.gy * CH;
    if (X < -u * 3 || X > CW + u * 3) return;
    if (p.type === 'board') return drawBoard(p, b, u, X, GY);
    if (p.type === 'plane') return drawPlane(p, X, GY);
    const o = p.o || (p.o = outfit(p)), st = p.state, hitNow = st === 'hit' || st === 'flee' || st === 'drop';
    let pose = 'stand', ph = p.t * 9, face = p.splats.length ? 'shock' : 'happy', rot = p.rot || 0, lift = 0;
    if (st === 'walk' || st === 'walk2') pose = p.type === 'prak' && !p.landed ? 'walk' : 'walk';
    if (p.type === 'mod' && st === 'walk') pose = 'walk';
    if (p.type === 'prak' && !p.landed && (st === 'walk' || st === 'stand')) pose = 'walk';
    if (p.type === 'bike') pose = 'bike', ph = p.t * 14;
    if (p.type === 'dj') pose = 'dj';
    if (p.type === 'window' || p.type === 'close') { pose = p.angry ? 'panic' : 'wave'; face = p.angry ? 'angry' : face; }
    if (p.type === 'tech') { pose = 'para'; ph = p.t * 4; }
    if (p.type === 'kond' && st === 'aim') { pose = 'aim'; face = 'angry'; }
    if (p.type === 'chef' && !hitNow) face = 'angry';
    if (p.type === 'para' && st === 'fly') pose = 'para';
    if ((p.type === 'jet' || p.type === 'cannon') && st === 'fly') { pose = 'fly'; if (p.type === 'jet') rot = p.dir * 1.1; }
    if (p.type === 'balloon') pose = 'wave';
    if (st === 'hit') { face = 'shock'; if (p.slip) { const k = p.hitT < .2 ? p.hitT / .2 : p.hitT < .8 ? 1 : Math.max(0, 1 - (p.hitT - .8) / .2); rot = k * 1.45 * p.fallDir; pose = 'panic'; ph = 0; } else { lift = Math.sin(Math.min(1, p.hitT / .45) * Math.PI) * u * .12; pose = 'panic'; } }
    if (st === 'flee') { face = 'shock'; pose = TS.TYPES[p.type].kind === 'ground' ? 'run' : pose; ph = p.t * 16; }
    if (st === 'drop') { face = 'shock'; pose = 'panic'; ph = p.t * 14; }
    if (p.type === 'bike' && (st === 'flee' || st === 'hit')) pose = st === 'hit' ? 'panic' : 'run';
    cx.save(); if (b.clip < 9) { cx.beginPath(); cx.rect(X - u * 2, -CH, u * 4, b.clip * CH + CH); cx.clip(); }
    // Fallschirm / Ballon / Jetpack hinter der Figur
    if (p.type === 'para' && st !== 'drop') drawChute(X, GY, u, p);
    if (p.type === 'balloon') drawBalloon(X, GY, u, p, st === 'drop');
    cx.translate(X, GY - lift); cx.rotate(rot);
    cx.save(); cx.scale(p.dir < 0 ? -1 : 1, 1);
    if (p.type === 'bike' && st !== 'flee' && st !== 'hit') drawBike(u, ph, o);
    if (p.type === 'jet') { cx.fillStyle = '#9aa0b8'; rr(cx, -u * .2, -u * .8, u * .09, u * .28, u * .03); cx.fill(); if (st === 'fly') { cx.fillStyle = Math.sin(G.time * 40) > 0 ? '#ffc94d' : '#ff6a2a'; cx.beginPath(); cx.moveTo(-u * .19, -u * .52); cx.lineTo(-u * .155, -u * (.35 + Math.random() * .1)); cx.lineTo(-u * .12, -u * .52); cx.fill(); } }
    const hs = human(cx, u, o, pose, ph, face);
    if (p.type === 'prak' && o.acc.tray && !hitNow) { cx.fillStyle = '#b0b0c0'; cx.fillRect(hs.hand[0] - u * .02, hs.hand[1] - u * .02, u * .2, u * .015); cx.fillStyle = '#fff'; cx.fillRect(hs.hand[0] + u * .02, hs.hand[1] - u * .065, u * .04, u * .045); cx.fillRect(hs.hand[0] + u * .1, hs.hand[1] - u * .065, u * .04, u * .045); }
    if (p.type === 'kond' && (st === 'walk' || st === 'aim')) drawPie(hs.hand[0], hs.hand[1] - u * .03, u * .09);
    if (p.type === 'mod' && st === 'stand') { cx.fillStyle = '#222'; }
    cx.restore();
    cx.fillStyle = '#fffaf0'; for (const s of p.splats) blob(cx, s.dx * u, s.dy * u + lift * 0, s.r * u, s.r > .1);
    cx.restore();
    if (p.type === 'balloon') drawBasket(X, GY, u);
    if (p.type === 'dj') drawDesk(p, b, u, X);
    if (p.type === 'window' && p.up > .1 && p.angry && !hitNow) bubble(X, GY - u * .98, 'Was soll das?!', u);
    if (hitNow && p.hitT < 1.1 && st !== 'drop') bubble(X, GY - u * 1.05 - lift, CALLS[p.id % CALLS.length], Math.max(u, CH * .12));
    if (st === 'drop' && p.hitT < 1) bubble(X, GY - u * 1.1, p.type === 'plane' ? 'Mayday!' : 'Waaah!', Math.max(u, CH * .12));
    if (p.type === 'kond' && st === 'aim') { cx.fillStyle = Math.sin(G.time * 20) > 0 ? '#ff2d2d' : '#fff'; cx.font = '1000 ' + (u * .3) + 'px system-ui'; cx.textAlign = 'center'; cx.fillText('!', X, GY - u * 1.25); }
    if (p.type === 'fan' && !hitNow) { cx.fillStyle = 'rgba(255,230,120,' + (.5 + .5 * Math.sin(G.time * 8)) + ')'; for (let i = 0; i < 3; i++) { const a = G.time * 2 + i * 2.1; cx.beginPath(); cx.arc(X + Math.cos(a) * u * .3, GY - u * .6 + Math.sin(a) * u * .3, u * .025, 0, 7); cx.fill(); } }
  }
  function bubble(x, y, t, u) { cx.font = '900 ' + Math.round(Math.max(12 * DPR, u * .13)) + 'px system-ui'; cx.textAlign = 'center'; cx.lineWidth = 4 * DPR; cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.strokeText(t, x, y); cx.fillStyle = '#fff'; cx.fillText(t, x, y); }
  function drawBike(u, ph, o) {
    cx.strokeStyle = '#222'; cx.lineWidth = u * .02; for (const x of [-u * .26, u * .26]) { cx.beginPath(); cx.arc(x, -u * .17, u * .17, 0, 7); cx.stroke(); cx.save(); cx.translate(x, -u * .17); cx.rotate(ph * .5); cx.beginPath(); cx.moveTo(-u * .17, 0); cx.lineTo(u * .17, 0); cx.moveTo(0, -u * .17); cx.lineTo(0, u * .17); cx.lineWidth = u * .006; cx.stroke(); cx.restore(); }
    cx.strokeStyle = '#00E5FF'; cx.lineWidth = u * .03; cx.beginPath(); cx.moveTo(-u * .26, -u * .17); cx.lineTo(-u * .04, -u * .45); cx.lineTo(u * .2, -u * .45); cx.lineTo(u * .26, -u * .17); cx.moveTo(-u * .04, -u * .45); cx.lineTo(0, -u * .2); cx.lineTo(u * .2, -u * .45); cx.moveTo(u * .2, -u * .45); cx.lineTo(u * .22, -u * .6); cx.stroke();
    cx.fillStyle = '#222'; cx.fillRect(-u * .09, -u * .5, u * .1, u * .025);
  }
  function drawChute(X, GY, u, p) {
    const cy = GY - u * 1.55, w = u * .62; cx.strokeStyle = 'rgba(40,40,40,.6)'; cx.lineWidth = Math.max(1, u * .006); cx.beginPath(); for (const s of [-1, -.4, .4, 1]) { cx.moveTo(X + s * w * .9, cy + u * .02); cx.lineTo(X + s * u * .12, GY - u * .95); } cx.stroke();
    for (let i = 0; i < 6; i++) { cx.fillStyle = i % 2 ? '#FF4FAE' : '#fff'; cx.beginPath(); cx.moveTo(X, cy); cx.arc(X, cy + u * .05, w, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); cx.closePath(); cx.fill(); }
  }
  function drawBalloon(X, GY, u, p, drop) {
    const by = GY - u * 2.1, r = u * .75, sq = drop ? Math.max(.3, 1 - p.hitT * .8) : 1;
    cx.strokeStyle = '#6b4a2a'; cx.lineWidth = Math.max(1, u * .01); cx.beginPath(); cx.moveTo(X - u * .22, GY - u * .45); cx.lineTo(X - r * .55, by + r * .6 * sq); cx.moveTo(X + u * .22, GY - u * .45); cx.lineTo(X + r * .55, by + r * .6 * sq); cx.stroke();
    cx.save(); cx.translate(X, by); cx.scale(1, sq); for (let i = 0; i < 6; i++) { cx.fillStyle = ['#FF4FAE', '#ffc94d', '#00E5FF'][i % 3]; cx.beginPath(); cx.ellipse(0, 0, r * (1 - i / 6.5), r * 1.1, 0, 0, 7); cx.fill(); }
    const im = logos[1]; if (imgOk(im)) cx.drawImage(im, -r * .35, -r * .35, r * .7, r * .7); cx.restore();
  }
  function drawBasket(X, GY, u) { cx.fillStyle = '#9a6a3a'; rr(cx, X - u * .24, GY - u * .46, u * .48, u * .4, u * .04); cx.fill(); cx.strokeStyle = '#6b4a2a'; cx.lineWidth = Math.max(1, u * .012); for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(X - u * .24, GY - u * .46 + i * u * .1); cx.lineTo(X + u * .24, GY - u * .46 + i * u * .1); cx.stroke(); } }
  function drawPlane(p, X, Y) {
    const s = CH * .07, d = p.dir;
    cx.save(); cx.translate(X, Y); cx.rotate(p.rot || 0); cx.scale(d, 1);
    // Banner hinter dem Flieger
    cx.strokeStyle = '#555'; cx.lineWidth = 1.5 * DPR; cx.beginPath(); cx.moveTo(-s * 1.1, 0); cx.lineTo(-s * 1.8, 0); cx.stroke();
    const bw = s * 5.2, bx = -s * 1.8 - bw, wave = Math.sin(G.time * 6) * s * .05;
    cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(bx, -s * .3 + wave); cx.lineTo(bx + bw, -s * .3); cx.lineTo(bx + bw, s * .3); cx.lineTo(bx, s * .3 + wave); cx.fill();
    cx.save(); if (d < 0) { cx.translate(bx + bw / 2, 0); cx.scale(-1, 1); cx.translate(-(bx + bw / 2), 0); } cx.fillStyle = '#d0102a'; cx.font = '900 ' + Math.round(s * .36) + 'px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('RicoReWi-Radio ♥ easygames', bx + bw / 2, wave / 2); cx.textBaseline = 'alphabetic'; cx.restore();
    cx.fillStyle = '#ff8a1f'; rr(cx, -s * 1.1, -s * .22, s * 2.1, s * .44, s * .2); cx.fill();
    cx.fillStyle = '#fff'; cx.fillRect(-s * .3, -s * .55, s * .5, s * 1.1); cx.fillStyle = '#ff8a1f'; cx.beginPath(); cx.moveTo(-s * 1.1, -s * .2); cx.lineTo(-s * 1.25, -s * .6); cx.lineTo(-s * .8, -s * .2); cx.fill();
    cx.fillStyle = '#7fc8ff'; cx.beginPath(); cx.arc(s * .35, -s * .2, s * .18, Math.PI, 0); cx.fill(); cx.fillStyle = SKIN[p.look % 5]; cx.beginPath(); cx.arc(s * .32, -s * .28, s * .1, 0, 7); cx.fill();
    cx.fillStyle = '#333'; cx.fillRect(s * 1, -s * .4, s * .05, s * .8 * Math.abs(Math.sin(G.time * 50)));
    cx.restore();
    cx.fillStyle = '#fffaf0'; for (const sp of p.splats) blob(cx, X + sp.dx * s * .4, Y + sp.dy * s * .2, s * .25, false);
    if (p.state === 'drop') { for (let i = 0; i < 3; i++) { cx.fillStyle = 'rgba(80,80,80,' + (.4 - i * .1) + ')'; cx.beginPath(); cx.arc(X - d * s * (1 + i * .6), Y - s * .2 - i * s * .2, s * (.3 + i * .15), 0, 7); cx.fill(); } }
  }
  function drawDesk(p, b, u, X) {
    const y = b.clip * CH, h = (p.gy - b.clip) * CH + 2, w = u * .62;
    cx.fillStyle = '#2a2140'; rr(cx, X - w / 2, y, w, h, u * .03); cx.fill(); cx.fillStyle = '#3a2f5c'; cx.fillRect(X - w / 2, y, w, u * .05);
    for (const s of [-1, 1]) { cx.fillStyle = '#111'; cx.beginPath(); cx.ellipse(X + s * w * .26, y + u * .025, u * .09, u * .022, 0, 0, 7); cx.fill(); }
    cx.fillStyle = '#FF4FAE'; cx.fillRect(X - u * .04, y + u * .1, u * .08, u * .03);
  }
  function drawBoard(p, b, u, X, GY) {
    if (p.up < .02) return;
    cx.save(); cx.beginPath(); cx.rect(X - u, 0, u * 2, b.clip * CH); cx.clip();
    cx.fillStyle = '#8a6a3a'; cx.fillRect(X - u * .03, GY - u * .5, u * .06, u * .55);
    cx.fillStyle = '#fff'; rr(cx, X - u * .5, GY - u * 1.0, u, u * .62, u * .06); cx.fill();
    const im = logos[p.logo]; if (imgOk(im)) cx.drawImage(im, X - u * .27, GY - u * .97, u * .54, u * .54);
    cx.fillStyle = '#fffaf0'; for (const s of p.splats) blob(cx, X + s.dx * u, GY + s.dy * u, s.r * u, false);
    cx.restore();
    const by = b.clip * CH; cx.fillStyle = '#3f9a3a'; cx.beginPath(); for (let i = -2; i <= 2; i++) cx.arc(X + i * u * .2, by + u * .05, u * .17, 0, 7); cx.fill();
  }
  function drawProps(g) {
    for (const pr of g.stations.props) {
      const X = (pr.x - G.camX) * CH, Y = pr.y * CH; if (X < -CH * .3 || X > CW + CH * .3) continue;
      if (pr.k === 'sign') {
        const w = pr.w * CH, h = pr.h * CH;
        cx.fillStyle = '#6b4a2a'; cx.fillRect(X - w * .4, Y, w * .05, (TS.LAYERS[1].g - pr.y) * CH); cx.fillRect(X + w * .35, Y, w * .05, (TS.LAYERS[1].g - pr.y) * CH);
        cx.fillStyle = '#0b0f2a'; rr(cx, X - w / 2, Y - h / 2, w, h, h * .15); cx.fill(); cx.strokeStyle = '#FF4FAE'; cx.lineWidth = h * .08; cx.stroke();
        cx.fillStyle = '#fff'; cx.font = '800 ' + (h * .3) + 'px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('Schön, dass du', X, Y - h * .16); cx.fillText('da bist!', X, Y + h * .2); cx.textBaseline = 'alphabetic';
        if (pr.hit) { cx.fillStyle = '#fffaf0'; blob(cx, X, Y, h * .4, true); }
      } else if (pr.k === 'onair') { if (pr.hit) { cx.fillStyle = 'rgba(255,40,60,' + (.6 + .4 * Math.sin(G.time * 6)) + ')'; cx.fillRect(X - pr.w * CH / 2, Y - pr.h * CH / 2, pr.w * CH, pr.h * CH); cx.fillStyle = '#fff'; cx.font = '900 ' + (pr.h * CH * .7) + 'px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('ON AIR', X, Y); cx.textBaseline = 'alphabetic'; cx.fillStyle = '#fffaf0'; blob(cx, X + pr.w * CH * .3, Y, pr.h * CH * .5, true); } }
      else if (pr.k === 'lamp') { cx.fillStyle = pr.hit ? '#fffaf0' : (Math.sin(G.time * 3) > 0 ? '#ff2020' : '#801010'); cx.beginPath(); cx.arc(X, Y, CH * .007, 0, 7); cx.fill(); if (pr.hit) blob(cx, X, Y, CH * .01, true); }
    }
  }

  /* ---------- Effekte ---------- */
  const FX = [], POP = [];
  function burst(x, y, n, col, sp) { for (let i = 0; i < n && FX.length < 260; i++) { const a = Math.random() * 6.28, v = (.3 + Math.random()) * (sp || 1) * CH * .5; FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - CH * .2, life: .5 + Math.random() * .4, r: (2 + Math.random() * 5) * DPR, col: col || '#fffaf0' }); } }
  function popup(x, y, text, col) { const m = Math.min(CW * .45, text.length * CH * .011 + 10); POP.push({ x: Math.max(m, Math.min(CW - m, x)), y: Math.max(CH * .12, y), text, col: col || '#fff', life: 1.1 }); }

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(k, v) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t = AC.currentTime;
      const tone = (f, d, vol, type, f2, at) => { const o = AC.createOscillator(), gn = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t + (at || 0)); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (at || 0) + d); gn.gain.setValueAtTime(.0001, t + (at || 0)); gn.gain.exponentialRampToValueAtTime(vol, t + (at || 0) + .01); gn.gain.exponentialRampToValueAtTime(.0001, t + (at || 0) + d); o.connect(gn); gn.connect(AC.destination); o.start(t + (at || 0)); o.stop(t + (at || 0) + d + .02); };
      const noise = (d, f, vol, f2) => { const n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain(); s.buffer = b; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); gn.gain.value = vol; s.connect(fl); fl.connect(gn); gn.connect(AC.destination); s.start(t); };
      if (k === 'throw') noise(.18, 800, .25, 3000);
      else if (k === 'squirt') noise(.06, 2500, .12, 900);
      else if (k === 'splat') { noise(.22, 1400, .55, 200); tone(180, .12, .15, 'sine', 70); }
      else if (k === 'miss') noise(.14, 700, .25, 150);
      else if (k === 'yelp') { const f = 500 + (v || 0) * 160; tone(f, .22, .12, 'triangle', f * 1.8); tone(f * 1.5, .14, .06, 'square', f * 2.2, .06); }
      else if (k === 'combo') tone(660 * Math.pow(1.12, v || 1), .14, .1, 'triangle');
      else if (k === 'reload') { tone(300, .05, .12, 'square', 200); tone(500, .05, .12, 'square', 700, .5); }
      else if (k === 'empty') tone(200, .06, .1, 'square', 150);
      else if (k === 'warn') { tone(880, .1, .12, 'square'); tone(880, .1, .12, 'square', 0, .18); }
      else if (k === 'blind') { noise(.45, 1200, .7, 150); tone(140, .3, .2, 'sine', 50); }
      else if (k === 'bomb') { noise(.6, 600, .8, 60); tone(90, .4, .3, 'sine', 40); }
      else if (k === 'parry') { noise(.15, 2000, .3, 400); tone(1200, .12, .1, 'triangle', 1800); }
      else if (k === 'bonus') [0, 1, 2, 3].forEach(i => tone(523 * Math.pow(1.26, i), .14, .1, 'triangle', 0, i * .07));
      else if (k === 'tick') tone(1000, .04, .06, 'square');
      else if (k === 'end') [0, 1, 2, 4].forEach((i, n) => tone(392 * Math.pow(1.12, i * 2), .25, .12, 'triangle', 0, n * .14));
    } catch (e) { }
  }

  /* ---------- Radio (laut.fm, wie Funk-Minigolf) ---------- */
  const STATIONS = [null, ['RicoReWi Radio', 'ricorewi'], ['YourTime-FM', 'yourtime-fm'], ['Rapradio 24', 'rapradio24'], ['Schlagerpop 24', 'schlagerpop24'], ['Chartradio 24', 'chartradio24'], ['Clubradio 24', 'clubradio24'], ['AnMaCha 24', 'anmacha24'],
    ['RadioFloh!', 'radiofloh'], ['Rockradio 24', 'rockradio24'], ['Christmasradio 24', 'christmasradio24'], ['Kultradio 24', 'kultradio24'], ['Zocker-FM', 'zockerfm'], ['Special-Radio', 'special-radio']];
  const RAD = { el: null, slug: '' };
  function radioSync(announce) {
    const st = STATIONS.find(x => x && x[1] === SET.station) || null;
    for (const b of [$('bRadio'), $('bRadioM'), $('pRadio')]) b.classList.toggle('on', !!st);
    $('bRadioM').textContent = '📻 Radio: ' + (st ? st[0] : 'aus');
    if (!st || document.hidden) { if (RAD.el && !RAD.el.paused) RAD.el.pause(); return; }
    if (!RAD.el) { RAD.el = new Audio(); RAD.el.preload = 'none'; RAD.el.volume = .5; RAD.el.addEventListener('error', () => { if (SET.station) toast('📻 Sender gerade nicht erreichbar'); }); }
    const changed = RAD.slug !== st[1]; if (changed) { RAD.slug = st[1]; RAD.el.src = 'https://stream.laut.fm/' + st[1]; }
    if (RAD.el.paused || changed) { const pr = RAD.el.play(); if (pr && pr.catch) pr.catch(() => { }); }
    if (announce) { toast('📻 ' + st[0] + ' live'); try { fetch('https://api.laut.fm/station/' + st[1] + '/current_song').then(r => r.ok ? r.json() : null).then(j => { if (j && j.title && RAD.slug === st[1] && SET.station) toast('📻 ' + st[0] + ': ' + (j.artist && j.artist.name ? j.artist.name + ' – ' : '') + j.title); }).catch(() => { }); } catch (e) { } }
  }
  let radioBack = null;
  function openRadio(back) {
    radioBack = back || null;
    const it = (v, img, label) => '<button class="rItem' + (SET.station === v ? ' on' : '') + '" data-v="' + v + '">' + img + '<span>' + label + '</span></button>';
    $('radioList').innerHTML = it('', '<i>🔇</i>', 'Aus') + STATIONS.map((x, k) => x ? it(x[1], '<img src="../anmacha-memory/logos/' + String(k).padStart(2, '0') + '.png" alt="" loading="lazy">', esc(x[0])) : '').join('');
    $('ovRadio').hidden = false; padNav(true); focusEl($('radioList').querySelector('.on') || $('radioX'));
  }
  $('radioList').onclick = e => { const b = e.target.closest('.rItem'); if (!b) return; SET.station = b.dataset.v; saveSet(); $('radioList').querySelectorAll('.rItem').forEach(x => x.classList.toggle('on', x === b)); radioSync(true); if (!SET.station) toast('📻 Radio aus'); };
  $('radioX').onclick = () => { $('ovRadio').hidden = true; if (radioBack) { radioBack.hidden = false; focusEl(radioBack.querySelector('.btn')); } else padNav(G.state === 'menu'); };

  /* ---------- Zustand ---------- */
  const G = { shake: 0, banner: null, state: 'menu', mode: 'solo', g: null, camX: 0, time: 0, paused: false, slots: [], net: null, lastDev: 'mouse', mouse: { x: .5, y: .5, seen: false }, warnT: 0, lastTick: 0 };
  function padNav(on) { if (window.EasyGamesPad && EasyGamesPad.enabled) try { EasyGamesPad.enabled(on); } catch (e) { } }
  const anyOv = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  function focusEl(el) { if (el && !('ontouchstart' in window)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }

  function startGame() {
    const solo = G.mode === 'solo', slots = solo ? [{ dev: 'any', name: 'Du', col: COLS[0] }] : G.slots.slice(0, 4);
    G.g = TS.newGame({ solo, WW: solo ? 3.2 : A, A, players: slots.map((s, i) => ({ name: s.name, col: s.col, dev: s.dev, cid: s.cid, x: (solo ? .3 : A * (i + 1) / (slots.length + 1)), y: .55 })) });
    G.camX = 0; G.g.camX = 0; G.paused = false; G.state = 'play'; G.lastTick = 0; FX.length = 0; POP.length = 0; FLY.length = 0; G.banner = null; G.noHud = false;
    scr(''); $('hud').hidden = false; $('tBtns').hidden = !(solo && matchMedia('(pointer: coarse)').matches); padNav(false);
    for (const o of ['ovEnd', 'ovPause']) $(o).hidden = true;
    sendAll({ t: 'ph', ph: 'play' });
  }
  function endGame() {
    G.state = 'end'; sfx('end');
    const g = G.g, r = TS.ranking(g), solo = g.solo;
    $('endTitle').textContent = solo ? '🎂 Zeit um!' : '🏆 ' + r[0].name + ' gewinnt!';
    $('endRank').innerHTML = r.map((p, i) => '<li class="' + (i === 0 && !solo ? 'win' : '') + '"><span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + p.col + ';margin-right:8px"></i>' + (solo ? 'Punkte' : (i + 1) + '. ' + esc(p.name)) + '<small>' + p.hits + ' Treffer · ' + p.heads + ' Kopftreffer · beste Serie ' + p.best + ' · Quote ' + (p.shots ? Math.round(p.hits / p.shots * 100) : 0) + ' %</small></span><b>' + p.score + '</b></li>').join('');
    const st = LS.get(P + 'stats', {}); st.spiele = (st.spiele || 0) + 1; st.treffer = (st.treffer || 0) + r.reduce((s, p) => s + p.hits, 0); st.serie = Math.max(st.serie || 0, ...r.map(p => p.best)); LS.set(P + 'stats', st);
    let info = '';
    if (solo) { const prev = LS.get(P + 'highscore', 0); if (r[0].score > prev) { LS.set(P + 'highscore', r[0].score); info = '🏆 Neuer Rekord! (vorher ' + prev + ')'; } else info = 'Rekord: ' + prev + ' Punkte'; }
    $('endInfo').textContent = info; $('ovEnd').hidden = false; padNav(true); focusEl($('endAgain'));
    r.forEach((p, i) => { if (p.dev && p.dev.startsWith('net:')) G.net && G.net.sendTo(p.dev.slice(4), { t: 'end', rank: i + 1, n: r.length, sc: p.score }); });
  }
  function toMenu() { G.state = 'menu'; G.g = null; $('hud').hidden = true; for (const o of ['ovEnd', 'ovPause']) $(o).hidden = true; if (G.net && G.net.role === 'host') { sendAll({ t: 'ph', ph: 'bye' }); G.net.close(); G.net = null; } scr('sMenu'); menuStat(); padNav(true); focusEl($('bSolo')); }
  function pause(on) { if (G.state !== 'play') return; G.paused = on; $('ovPause').hidden = !on; $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; padNav(on); if (on) focusEl($('pGo')); for (const p of G.g.players) p.fire = false; }

  /* ---------- Ereignisse aus der Logik ---------- */
  function handle(ev) {
    const g = G.g, pl = ev.pl != null ? g.players[ev.pl] : null, sx = ev.x != null ? (ev.x - G.camX) * CH : 0, sy = ev.y != null ? ev.y * CH : 0;
    switch (ev.k) {
      case 'throw': sfx(ev.w === 'spritze' ? 'squirt' : 'throw'); FLY.push({ x: ev.x, y: ev.y, w: ev.w, t: 0, T: ev.w === 'spritze' ? .06 : .13, sx: Math.max(CW * .1, Math.min(CW * .9, (ev.x - G.camX) * CH * .7 + CW * .15)) }); break;
      case 'hit': { sfx('splat'); sfx('yelp', ev.p % 5); burst(sx, sy, 22); const mul = ev.m > 1 ? ' ×' + ev.m : ''; popup(sx, sy, '+' + ev.pts + mul + (ev.head ? ' Volltreffer!' : ''), pl.col); if (ev.m > 1) sfx('combo', ev.m); if (ev.z >= 3) G.shake = .25; if (pl.combo > 0 && pl.combo % 5 === 0) { G.banner = { text: (g.solo ? '' : pl.name + ': ') + pl.combo + 'er SAHNE-SERIE!', life: 1.4 }; sfx('bonus'); } netVib(pl, 40); break; }
      case 'splash': sfx('squirt'); burst(sx, sy, 5); break;
      case 'miss': sfx('miss'); burst(sx, sy, ev.w === 'spritze' ? 2 : 8, '#fffaf0', .5); break;
      case 'bomb': G.shake = .35; sfx('bomb'); burst(sx, sy, 60, '#ffeef5', 2); burst(sx, sy, 20, '#d0102a', 1.5); break;
      case 'bonus': sfx('bonus'); popup(sx, sy - 40, '🍒 Kirschbombe! (Waffe wechseln)', '#ffc94d'); if (g.solo) toast('🍒 Kirschbombe bekommen – mit Q, Y, Mausrad oder 🎂 auswählen'); break;
      case 'secret': sfx('bonus'); popup(sx, sy, ev.what === 'onair' ? '+25 ON AIR getroffen!' : '+25 Turmlampe!', '#FFC94D'); burst(sx, sy, 14); break;
      case 'peek': sfx('yelp', 4); break;
      case 'sign': sfx('bonus'); popup(sx, sy, '+10 Sekunden!', '#2EE6A0'); burst(sx, sy, 20); break;
      case 'parry': sfx('parry'); popup(sx, sy, 'Abgewehrt! +10', '#00E5FF'); burst(sx, sy, 26); break;
      case 'warn': sfx('warn'); break;
      case 'blind': G.shake = .3; sfx('blind'); if (pl) { netVib(pl, [80, 40, 120]); if (!g.solo) popup((pl.x - G.camX) * CH, pl.y * CH, 'Sahne im Gesicht!', '#fff'); } break;
      case 'reload': if (!pl || pl.dev !== 'net') sfx('reload'); break;
      case 'empty': sfx('empty'); break;
      case 'chef': toast('😠 Der Chef ist sauer – jetzt rennen alle schneller!'); break;
      case 'end': endGame(); break;
    }
  }

  /* ---------- Hauptschleife ---------- */
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now; G.time += dt;
    const g = G.g;
    if (!g) { drawIdle(); return; }
    if (G.state === 'play' && !G.paused) {
      input(dt); TS.step(g, dt);
      for (const ev of g.events.splice(0)) handle(ev);
      if (g.t < 10 && Math.ceil(g.t) !== G.lastTick && !g.over) { G.lastTick = Math.ceil(g.t); sfx('tick'); }
      netState(dt);
    }
    for (const f of FX) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += CH * 1.4 * dt; } for (let i = FX.length - 1; i >= 0; i--) if (FX[i].life <= 0) FX.splice(i, 1);
    for (const f of FLY) f.t += dt; for (let i = FLY.length - 1; i >= 0; i--) if (FLY[i].t >= FLY[i].T) { const f = FLY.splice(i, 1)[0]; burst((f.x - G.camX) * CH, f.y * CH, f.w === 'spritze' ? 3 : 10); }
    if (G.shake > 0) G.shake -= dt; if (G.banner) G.banner.life -= dt;
    for (const p of POP) { p.life -= dt; p.y -= CH * .06 * dt; } for (let i = POP.length - 1; i >= 0; i--) if (POP[i].life <= 0) POP.splice(i, 1);
    draw(g);
  }
  function drawIdle() { // Menü-Hintergrund: Kulisse mit ein paar Leuten
    if (!G.demo) { G.demo = TS.newGame({ solo: true, WW: Math.max(A, 2), A, seed: 5 }); G.demo.players[0].x = -9; }
    const g = G.demo; g.t = 99; TS.step(g, 1 / 60); g.events.length = 0; G.camX = Math.max(0, (g.WW - A) / 2 + Math.sin(G.time * .05) * (g.WW - A) / 2); g.camX = G.camX; draw(g, true);
  }
  const FLY = []; // Torten im Flug (nur Optik, getroffen ist schon)
  function draw(g, idle) {
    cx.save(); if (G.shake > 0) cx.translate((Math.random() - .5) * CH * .02 * G.shake * 4, (Math.random() - .5) * CH * .02 * G.shake * 4);
    buildScene(g); drawSky(g);
    const k = sceneC.k; cx.drawImage(sceneC, G.camX * CH * k, 0, A * CH * k, CH * k, 0, 0, CW, CH);
    drawProps(g);
    const ppl = g.people.slice().sort((a, b) => a.z - b.z); let li = 0;
    const splats = layer => { cx.fillStyle = 'rgba(255,250,240,.92)'; for (const s of g.splats) if (s.layer === layer) { const X = (s.x - G.camX) * CH; if (X > -50 && X < CW + 50) blob(cx, X, s.y * CH, s.r * CH, s.w === 'torte'); } };
    splats(0);
    for (const p of ppl) { while (li < 2 && p.z >= li + 1) { li++; splats(li); } drawPerson(p, g); }
    while (li < 2) { li++; splats(li); }
    if (!idle) {
      for (const f of FLY) { const k2 = Math.min(1, f.t / f.T), tx = (f.x - G.camX) * CH, ty = f.y * CH, sx = f.sx, sy = CH * 1.08, x = sx + (tx - sx) * k2, y = sy + (ty - sy) * k2 - Math.sin(k2 * Math.PI) * CH * .06, r = CH * (.06 * (1 - k2) + .03 * k2);
        if (f.w === 'spritze') { cx.strokeStyle = 'rgba(255,250,240,.9)'; cx.lineWidth = CH * .012; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(sx, sy); cx.quadraticCurveTo((sx + tx) / 2, Math.min(sy, ty) - CH * .06, x, y); cx.stroke(); }
        else if (f.w === 'bombe') { cx.fillStyle = '#d0102a'; cx.beginPath(); cx.arc(x, y, r * .6, 0, 7); cx.fill(); }
        else drawPie(x, y, r); }
      for (const pie of g.pies) { const x = (pie.x - G.camX) * CH, y = pie.y * CH, r = pie.r * CH * 1.6; cx.strokeStyle = 'rgba(255,45,45,' + (.4 + .4 * Math.sin(G.time * 25)) + ')'; cx.lineWidth = 4 * DPR; cx.beginPath(); cx.arc(x, y, r * 1.3, 0, 7); cx.stroke(); drawPie(x, y, r); }
      for (const f of FX) { cx.globalAlpha = Math.min(1, f.life * 2); cx.fillStyle = f.col; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 7); cx.fill(); } cx.globalAlpha = 1;
      cx.textAlign = 'center'; for (const p of POP) { cx.globalAlpha = Math.min(1, p.life * 2); cx.font = '900 ' + Math.round(CH * .035) + 'px system-ui'; cx.lineWidth = 5 * DPR; cx.strokeStyle = 'rgba(0,0,0,.55)'; cx.strokeText(p.text, p.x, p.y); cx.fillStyle = p.col; cx.fillText(p.text, p.x, p.y); } cx.globalAlpha = 1;
    }
    cx.restore();
    if (idle || G.noHud) return;
    if (G.banner && G.banner.life > 0) { const b = G.banner, s = 1 + Math.max(0, b.life - .8) * 2; cx.save(); cx.globalAlpha = Math.min(1, b.life * 2); cx.translate(CW / 2, CH * .3); cx.scale(s, s); cx.font = '1000 ' + Math.round(CH * .075) + 'px system-ui'; cx.textAlign = 'center'; cx.lineWidth = 8 * DPR; cx.strokeStyle = 'rgba(60,0,40,.7)'; cx.strokeText(b.text, 0, 0); cx.fillStyle = '#FFC94D'; cx.fillText(b.text, 0, 0); cx.restore(); }
    for (const pl of g.players) drawCross(pl, g);
    for (const pl of g.players) if (pl.stun > 0) {
      const a = Math.min(1, pl.stun / .6); cx.globalAlpha = a; cx.fillStyle = '#fffaf0';
      if (g.solo) { blob(cx, CW * .5, CH * .45, CH * .32, true); blob(cx, CW * .25, CH * .3, CH * .14, true); blob(cx, CW * .75, CH * .62, CH * .16, true); cx.fillStyle = 'rgba(200,120,60,.6)'; for (let i = 0; i < 6; i++) { cx.beginPath(); cx.arc(CW * .5 + Math.cos(i) * CH * .2, CH * .42 + Math.sin(i * 2) * CH * .12, CH * .02, 0, 7); cx.fill(); } }
      else blob(cx, (pl.x - G.camX) * CH, pl.y * CH, CH * .1, true);
      cx.globalAlpha = 1;
    }
    drawHud(g);
  }
  function drawCross(pl, g) {
    const x = (pl.x - G.camX) * CH, y = pl.y * CH, r = CH * .035;
    if (g.solo && pl.stun > .3) return;
    cx.lineWidth = Math.max(2, CH * .005); cx.strokeStyle = 'rgba(0,0,0,.5)'; cx.beginPath(); cx.arc(x, y, r + 1.5, 0, 7); cx.stroke();
    cx.strokeStyle = pl.col; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.moveTo(x - r * 1.5, y); cx.lineTo(x - r * .4, y); cx.moveTo(x + r * .4, y); cx.lineTo(x + r * 1.5, y); cx.moveTo(x, y - r * 1.5); cx.lineTo(x, y - r * .4); cx.moveTo(x, y + r * .4); cx.lineTo(x, y + r * 1.5); cx.stroke();
    if (pl.reload > 0) { cx.lineWidth = Math.max(3, CH * .008); cx.strokeStyle = '#fff'; cx.beginPath(); cx.arc(x, y, r * 1.3, -Math.PI / 2, -Math.PI / 2 + (1 - pl.reload / TS.RELOAD) * Math.PI * 2); cx.stroke(); }
    if (!g.solo) { cx.font = '800 ' + Math.round(CH * .022) + 'px system-ui'; cx.textAlign = 'center'; cx.fillStyle = pl.col; cx.fillText(pl.name, x, y + r * 2.4); const w = pl.weapon === 'spritze' ? 'spritze' : 'torte', n = pl.ammo[w], mx = TS.WEAPONS[w].mag; cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillRect(x - r, y + r * 2.7, r * 2 * n / mx, Math.max(3, CH * .006)); }
  }
  function drawHud(g) {
    const pad = CH * .025, fs = Math.round(CH * .05);
    cx.textBaseline = 'top'; cx.lineWidth = 5 * DPR; cx.strokeStyle = 'rgba(0,0,0,.45)';
    const tt = Math.ceil(g.t), ts = Math.floor(tt / 60) + ':' + String(tt % 60).padStart(2, '0');
    cx.font = '1000 ' + fs + 'px system-ui'; cx.textAlign = 'center'; cx.strokeText(ts, CW / 2, pad); cx.fillStyle = g.t < 10 ? '#ff5470' : '#fff'; cx.fillText(ts, CW / 2, pad);
    cx.textAlign = 'left';
    if (g.solo) {
      const pl = g.players[0]; cx.font = '1000 ' + fs + 'px system-ui'; cx.strokeText(String(pl.score), pad, pad); cx.fillStyle = '#fff'; cx.fillText(String(pl.score), pad, pad);
      const m = TS.mult(pl); if (m > 1 || pl.combo > 1) { cx.font = '900 ' + Math.round(fs * .5) + 'px system-ui'; const t = '×' + m + '  Serie ' + pl.combo; cx.strokeText(t, pad, pad + fs * 1.1); cx.fillStyle = '#FFC94D'; cx.fillText(t, pad, pad + fs * 1.1); }
      // Munition unten rechts
      const w = pl.weapon, y = CH - pad - CH * .07, r = CH * .03;
      cx.textAlign = 'right'; cx.font = '800 ' + Math.round(fs * .42) + 'px system-ui'; cx.fillStyle = '#fff';
      const label = pl.reload > 0 ? 'Nachladen …' : w === 'bombe' ? '🍒 Kirschbombe ×' + pl.bombs : w === 'spritze' ? '💦 Sahnespritze' : '🎂 Torte'; cx.strokeText(label, CW - pad, y - CH * .055); cx.fillText(label, CW - pad, y - CH * .055);
      if (w === 'torte') for (let i = 0; i < TS.WEAPONS.torte.mag; i++) { cx.globalAlpha = i < pl.ammo.torte ? 1 : .25; drawPie(CW - pad - r - i * r * 2.3, y + r, r); } else if (w === 'spritze') { const bw = CH * .3; cx.fillStyle = 'rgba(0,0,0,.4)'; cx.fillRect(CW - pad - bw, y + r * .5, bw, r); cx.fillStyle = '#fffaf0'; cx.fillRect(CW - pad - bw, y + r * .5, bw * pl.ammo.spritze / TS.WEAPONS.spritze.mag, r); }
      cx.globalAlpha = 1;
      if (pl.bombs > 0 && w !== 'bombe') { cx.textAlign = 'right'; cx.fillStyle = '#FFC94D'; cx.fillText('🍒×' + pl.bombs, CW - pad, y - CH * .1); }
      // Welt-Übersicht (wo bin ich?)
      const mw = CH * .22, mx = CW / 2 - mw / 2, my = pad + fs * 1.15; cx.fillStyle = 'rgba(0,0,0,.3)'; cx.fillRect(mx, my, mw, CH * .008); cx.fillStyle = '#fff'; cx.fillRect(mx + mw * G.camX / g.WW, my, mw * A / g.WW, CH * .008);
    } else {
      cx.font = '900 ' + Math.round(fs * .5) + 'px system-ui'; let y = pad;
      for (const pl of TS.ranking(g)) { const t = pl.name + '  ' + pl.score + (TS.mult(pl) > 1 ? '  ×' + TS.mult(pl) : ''); cx.strokeText(t, pad + CH * .03, y); cx.fillStyle = pl.col; cx.beginPath(); cx.arc(pad + CH * .01, y + fs * .25, CH * .01, 0, 7); cx.fill(); cx.fillText(t, pad + CH * .03, y); y += fs * .62; }
    }
    cx.textBaseline = 'alphabetic';
  }

  /* ---------- Eingabe ---------- */
  const keys = new Set();
  const solo = () => G.g && G.g.solo;
  function devPlayer(dev) { const g = G.g; if (!g) return null; if (g.solo) return g.players[0]; return g.players.find(p => p.dev === dev) || null; }
  function toWorld(cxp, cyp) { return { x: G.camX + cxp * DPR / CH, y: cyp * DPR / CH }; }
  function input(dt) {
    const g = G.g;
    // Maus folgt dem Zeiger (auch während die Landschaft scrollt)
    const mp = devPlayer('mouse'); if (mp && G.mouse.seen && (!g.solo || G.lastDev === 'mouse')) { const w = toWorld(G.mouse.x, G.mouse.y); mp.x = w.x; mp.y = w.y; }
    // Tastatur
    const kp = devPlayer('kbd');
    if (kp) { let dx = 0, dy = 0; if (keys.has('arrowleft') || keys.has('a')) dx--; if (keys.has('arrowright') || keys.has('d')) dx++; if (keys.has('arrowup') || keys.has('w')) dy--; if (keys.has('arrowdown') || keys.has('s')) dy++; if (dx || dy) { const sp = (keys.has('shift') ? 1.5 : .85) * dt; kp.x += dx * sp; kp.y += dy * sp; G.lastDev = 'kbd'; } }
    pollPads(dt);
    // Kamera (Solo) und Grenzen
    if (g.solo) {
      const pl = g.players[0], m = Math.min(.18, A * .1), sxp = pl.x - G.camX;
      if (sxp < m) G.camX -= (m - sxp) / m * 1.6 * dt; if (sxp > A - m) G.camX += (sxp - (A - m)) / m * 1.6 * dt;
      G.camX = Math.max(0, Math.min(g.WW - A, G.camX));
      if (G.lastDev !== 'mouse') pl.x = Math.max(G.camX + .01, Math.min(G.camX + A - .01, pl.x));
    } else G.camX = 0;
    g.camX = G.camX; g.A = A;
    for (const pl of g.players) { pl.x = Math.max(0, Math.min(g.WW, pl.x)); pl.y = Math.max(.02, Math.min(.99, pl.y)); }
  }
  function press(pl, on) { if (!pl || !G.g || G.state !== 'play' || G.paused) return; pl.fire = on; if (on) TS.fire(G.g, pl); }
  cv.addEventListener('pointermove', e => { G.mouse.x = e.clientX; G.mouse.y = e.clientY; G.mouse.seen = true; if (e.pointerType === 'mouse') G.lastDev = 'mouse'; });
  cv.addEventListener('pointerdown', e => {
    G.mouse.x = e.clientX; G.mouse.y = e.clientY; G.mouse.seen = true; G.lastDev = 'mouse';
    if (G.state !== 'play' || G.paused || anyOv()) return;
    const pl = devPlayer('mouse'); if (!pl) return;
    const w = toWorld(e.clientX, e.clientY); pl.x = w.x; pl.y = w.y;
    if (e.button === 2) { TS.reload(G.g, pl); return; }
    try { cv.setPointerCapture(e.pointerId); } catch (x) { } press(pl, true);
  });
  const up = () => { const pl = devPlayer('mouse'); if (pl) pl.fire = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => { const pl = devPlayer('mouse'); if (pl && G.state === 'play') { if (!G.wheelT || G.time - G.wheelT > .25) { G.wheelT = G.time; TS.switchWeapon(G.g, pl); } } }, { passive: true });
  $('tWeapon').onclick = () => { const pl = devPlayer('mouse'); if (pl) TS.switchWeapon(G.g, pl); }; $('tReload').onclick = () => { const pl = devPlayer('mouse'); if (pl) TS.reload(G.g, pl); };
  for (const id of ['tWeapon', 'tReload']) $(id).addEventListener('pointerdown', e => e.stopPropagation());
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ($('sLobby').classList.contains('on') && (k === ' ' || k === 'enter') && !(e.target && /BUTTON|INPUT/.test(e.target.tagName))) { e.preventDefault(); lobbyJoin('kbd'); return; }
    if ($('sLobby').classList.contains('on') && k === ' ') { e.preventDefault(); lobbyJoin('kbd'); return; }
    if (G.state !== 'play') { if (k === 'escape') { const o = anyOv(); if (o && o.id !== 'ovEnd') { o.hidden = true; if (o.id === 'ovRadio') $('radioX').click(); } } return; }
    if (k === 'escape' || k === 'p') { e.preventDefault(); pause(!G.paused); return; }
    if (G.paused || anyOv()) return;
    const pl = devPlayer('kbd'); if (!pl) return;
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'tab'].includes(k)) e.preventDefault();
    keys.add(k); G.lastDev = G.g.solo && /^(arrow|[wasd]$)/.test(k) ? 'kbd' : G.lastDev;
    if (e.repeat) return;
    if (k === ' ') press(pl, true); else if (k === 'r') TS.reload(G.g, pl); else if (k === 'q' || k === 'tab' || k === 'e') TS.switchWeapon(G.g, pl);
  });
  addEventListener('keyup', e => { const k = e.key.toLowerCase(); keys.delete(k); if (k === ' ') { const pl = devPlayer('kbd'); if (pl) pl.fire = false; } });
  addEventListener('blur', () => keys.clear());

  const prevPad = {};
  function pollPads(dt) {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : [];
    for (const pad of pads) {
      const bt = i => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .5)), pv = prevPad[pad.index] || {};
      const st = { f: bt(0) || bt(7), x: bt(2), y: bt(3) || bt(5) || bt(4), start: bt(9) }; prevPad[pad.index] = st;
      if (G.state !== 'play') continue;
      if (st.start && !pv.start) { pause(!G.paused); continue; }
      if (G.paused || anyOv()) continue;
      const pl = devPlayer('pad:' + pad.index); if (!pl) continue;
      let ax = pad.axes[0] || 0, ay = pad.axes[1] || 0; if (bt(14)) ax = -1; if (bt(15)) ax = 1; if (bt(12)) ay = -1; if (bt(13)) ay = 1;
      const m = Math.hypot(ax, ay); if (m > .15) { const sp = 1.2 * Math.pow(Math.min(1, (m - .15) / .85), 1.6) * dt / m; pl.x += ax * sp; pl.y += ay * sp; if (G.g.solo) G.lastDev = 'pad'; }
      if (st.f && !pv.f) press(pl, true); else if (!st.f && pv.f) pl.fire = false;
      if (st.x && !pv.x) TS.reload(G.g, pl); if (st.y && !pv.y) TS.switchWeapon(G.g, pl);
    }
  }
  addEventListener('gamepadconnected', () => { if (G.state === 'play' && solo()) toast('🎮 Controller: Stick zielt, A wirft, X lädt nach, Y wechselt'); });

  /* ---------- Lobby (Mehrspieler und Online) ---------- */
  function lobbyOpen(online) {
    G.mode = online ? 'online' : 'local'; G.slots = []; scr('sLobby'); padNav(false);
    $('lobTitle').textContent = online ? '🌐 Online & Handys' : '👥 Mehrspieler'; $('qrBox').hidden = !online;
    $('lobHow').innerHTML = (online ? '📱 <b>Handy:</b> QR-Code scannen · ' : '') + '🖱️ <b>Maus/Touch:</b> Knopf unten · ⌨️ <b>Tastatur:</b> Leertaste (Pfeile zielen) · 🎮 <b>Controller:</b> A drücken (B = raus)';
    renderLobby(); if (online) hostOpen();
    G.state = 'lobby'; lobbyPads();
  }
  function lobbyJoin(dev, name, extra) {
    if (G.state !== 'lobby') return; if (G.slots.some(s => s.dev === dev)) return; if (G.slots.length >= 4) { toast('Schon 4 Spieler – mehr passen nicht aufs Feld'); return; }
    const used = G.slots.map(s => s.col), col = COLS.find(c => !used.includes(c));
    const label = { mouse: 'Maus', kbd: 'Tastatur' }[dev] || (dev.startsWith('pad:') ? 'Controller ' + (+dev.slice(4) + 1) : 'Handy');
    G.slots.push(Object.assign({ dev, name: name || ('Spieler ' + (G.slots.length + 1)), col, label }, extra || {})); sfx('bonus'); renderLobby();
  }
  function lobbyLeave(dev) { G.slots = G.slots.filter(s => s.dev !== dev); renderLobby(); }
  function renderLobby() {
    const rows = G.slots.map(s => '<div class="slot"><i style="background:' + s.col + '"></i>' + esc(s.name) + '<small>' + s.label + '</small></div>');
    for (let i = G.slots.length; i < 4; i++) rows.push('<div class="slot empty"><i style="background:rgba(255,255,255,.2)"></i>frei</div>');
    $('lobSlots').innerHTML = rows.join('');
    const need = G.mode === 'online' ? 1 : 2; $('lobStart').disabled = G.slots.length < need;
    $('lobStart').textContent = G.slots.length < need ? 'Noch ' + (need - G.slots.length) + ' Spieler …' : '▶ Los geht\'s! (' + G.slots.length + ')';
    $('lobMouse').hidden = G.slots.some(s => s.dev === 'mouse');
  }
  function lobbyPads() {
    if (G.state !== 'lobby') return; requestAnimationFrame(lobbyPads);
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : [];
    for (const pad of pads) { const bt = i => !!(pad.buttons[i] && pad.buttons[i].pressed), pv = prevPad[pad.index] || {}, st = { a: bt(0), b: bt(1), start: bt(9) }; prevPad[pad.index] = st;
      if (st.a && !pv.a) lobbyJoin('pad:' + pad.index); if (st.b && !pv.b) lobbyLeave('pad:' + pad.index); if (st.start && !pv.start && !$('lobStart').disabled) $('lobStart').click(); }
  }
  $('lobMouse').onclick = () => lobbyJoin('mouse');
  $('lobStart').onclick = () => { if (G.slots.length) startGame(); };
  $('lobBack').onclick = () => toMenu();

  /* ---------- Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js, wie Funkmaler) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'tortenschlacht-';
    const N = { role: '', code: '', peer: null, conns: new Map() }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    N.host = async function () {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Steht der Code richtig auf dem Fernseher?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code vom Fernseher eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let wake = null; function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }

  // Gastgeber (Fernseher/PC)
  async function hostOpen() {
    $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…';
    if (G.net) G.net.close(); G.net = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    try {
      const code = await G.net.host(); if (G.mode !== 'online') return;
      $('code').textContent = code; $('url').textContent = G.net.link(); keepAwake();
      G.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(G.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  function hostMsg(peer, d) {
    const dev = 'net:' + peer;
    if (d.t === 'hi') {
      const name = String(d.name || '').replace(/[<>]/g, '').trim().slice(0, 14) || 'Handy';
      if (G.state === 'lobby') { const old = G.slots.find(s => s.cid && s.cid === d.cid); if (old) { old.dev = dev; renderLobby(); } else lobbyJoin(dev, name, { cid: d.cid }); const s = G.slots.find(x => x.dev === dev); if (s) G.net.sendTo(peer, { t: 'wel', col: s.col, name: s.name, ph: 'lobby' }); else G.net.sendTo(peer, { t: 'full' }); return; }
      const pl = G.g && G.g.players.find(p => p.cid && p.cid === d.cid);
      if (pl) { pl.dev = dev; G.net.sendTo(peer, { t: 'wel', col: pl.col, name: pl.name, ph: G.state === 'play' ? 'play' : 'end' }); }
      else G.net.sendTo(peer, { t: 'running' });
      return;
    }
    if (G.state !== 'play' || G.paused) return;
    const pl = devPlayer(dev); if (!pl) return;
    if (d.t === 'a') { pl.x = Math.max(0, Math.min(1, +d.x || 0)) * G.g.WW; pl.y = Math.max(0, Math.min(1, +d.y || 0)); }
    else if (d.t === 'f') { if (d.x != null) { pl.x = Math.max(0, Math.min(1, +d.x)) * G.g.WW; pl.y = Math.max(0, Math.min(1, +d.y)); } press(pl, !!d.on); }
    else if (d.t === 'r') TS.reload(G.g, pl);
    else if (d.t === 'w') TS.switchWeapon(G.g, pl);
  }
  function hostLeave(peer) { if (G.state === 'lobby') lobbyLeave('net:' + peer); }
  function sendAll(d) { if (G.net && G.net.role === 'host') G.net.send(d); }
  function netVib(pl, pat) { if (pl && pl.dev && pl.dev.startsWith('net:') && G.net) G.net.sendTo(pl.dev.slice(4), { t: 'v', p: pat }); }
  let netT = 0;
  function netState(dt) {
    if (!G.net || G.net.role !== 'host') return; netT -= dt; if (netT > 0) return; netT = .25;
    for (const pl of G.g.players) if (pl.dev && pl.dev.startsWith('net:')) { const w = pl.weapon === 'spritze' ? 'spritze' : 'torte'; G.net.sendTo(pl.dev.slice(4), { t: 'st', sc: pl.score, w: pl.weapon, am: pl.ammo[w], mx: TS.WEAPONS[w].mag, b: pl.bombs, rl: pl.reload > 0 ? 1 : 0, sn: pl.stun > 0 ? 1 : 0, tm: Math.ceil(G.g.t), m: TS.mult(pl) }); }
  }

  // Handy (Gast)
  const C = { net: null, name: '', col: '#fff', cid: LS.get(P + 'cid', '') || Math.random().toString(36).slice(2, 10), code: '', joined: false, last: 0, fire: false };
  LS.set(P + 'cid', C.cid);
  function joinScreen(code) { scr('sPhone'); $('joinBox').hidden = false; $('ctrl').hidden = true; $('jCode').value = code || ''; $('jName').value = LS.get(P + 'name', ''); focusEl($('jName')); G.state = 'phone'; }
  $('bJoin').onclick = async () => {
    const name = $('jName').value.trim().slice(0, 14); if (!name) { $('jMsg').textContent = 'Bitte gib deinen Namen ein.'; return; }
    LS.set(P + 'name', name); C.name = name; C.code = $('jCode').value; $('jMsg').textContent = 'Verbinde …'; $('bJoin').disabled = true;
    try { C.net = C.net || null; if (C.net) C.net.close(); C.net = mkNet({ onMsg: guestMsg, onLeave: guestLost }); await C.net.join(C.code); C.net.send({ t: 'hi', name, cid: C.cid }); keepAwake(); }
    catch (e) { $('jMsg').textContent = netErr(e); }
    $('bJoin').disabled = false;
  };
  function guestMsg(_, d) {
    if (d.t === 'wel') { C.joined = true; C.col = d.col; $('joinBox').hidden = true; $('ctrl').hidden = false; $('cName').innerHTML = '<i style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + d.col + ';margin-right:6px"></i>' + esc(d.name); $('padDot').style.borderColor = d.col; $('cInfo').textContent = d.ph === 'lobby' ? 'Warte auf den Start …' : ''; vib(30); }
    else if (d.t === 'full') $('jMsg').textContent = 'Das Spiel ist voll (4 Spieler).';
    else if (d.t === 'running') $('jMsg').textContent = 'Das Spiel läuft schon – bei der nächsten Runde bist du dabei.';
    else if (d.t === 'ph') { if (d.ph === 'play') $('cInfo').textContent = 'Los! Ziel auf dem Fernseher'; if (d.ph === 'bye') { $('cInfo').textContent = 'Der Fernseher hat das Spiel beendet.'; } }
    else if (d.t === 'st') { $('cScore').textContent = d.sc; $('cInfo').textContent = '⏱ ' + d.tm + ' s' + (d.m > 1 ? ' · ×' + d.m : '') + (d.rl ? ' · Nachladen …' : d.sn ? ' · Sahne im Gesicht!' : ' · ' + d.am + '/' + d.mx); $('cWeapon').textContent = d.w === 'bombe' ? '🍒 ×' + d.b : d.w === 'spritze' ? '💦 Spritze' : '🎂 Torte' + (d.b ? ' · 🍒' + d.b : ''); }
    else if (d.t === 'v') vib(d.p);
    else if (d.t === 'end') { $('cInfo').textContent = '🏁 Platz ' + d.rank + ' von ' + d.n + ' – ' + d.sc + ' Punkte'; vib([60, 60, 60]); }
  }
  function guestLost() { if (!C.joined) return; $('cInfo').textContent = 'Verbindung weg – verbinde neu …'; setTimeout(async () => { try { await C.net.join(C.code); C.net.send({ t: 'hi', name: C.name, cid: C.cid }); } catch (e) { guestLost(); } }, 2500); }
  const padEl = $('pad');
  function padSend(e, force) {
    const r = padEl.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    $('padDot').style.left = x * 100 + '%'; $('padDot').style.top = y * 100 + '%'; C.x = x; C.y = y;
    const now = performance.now(); if (force || now - C.last > 33) { C.last = now; if (C.net) C.net.send({ t: 'a', x: +x.toFixed(4), y: +y.toFixed(4) }); }
  }
  padEl.addEventListener('pointerdown', e => { try { padEl.setPointerCapture(e.pointerId); } catch (x) { } padSend(e, true); });
  padEl.addEventListener('pointermove', e => { if (e.buttons || e.pointerType !== 'mouse') padSend(e); });
  const fireBtn = $('cFire');
  fireBtn.addEventListener('pointerdown', e => { e.preventDefault(); fireBtn.classList.add('down'); if (C.net) C.net.send({ t: 'f', on: 1, x: C.x, y: C.y }); vib(15); });
  const fireUp = () => { fireBtn.classList.remove('down'); if (C.net) C.net.send({ t: 'f', on: 0 }); };
  fireBtn.addEventListener('pointerup', fireUp); fireBtn.addEventListener('pointercancel', fireUp);
  $('cReload').onclick = () => { if (C.net) C.net.send({ t: 'r' }); vib(10); }; $('cWeapon').onclick = () => { if (C.net) C.net.send({ t: 'w' }); vib(10); };

  /* ---------- Menüs ---------- */
  $('bSolo').onclick = () => { G.mode = 'solo'; startGame(); if (!LS.get(P + 'seenHelp', 0)) { LS.set(P + 'seenHelp', 1); toast('Zielen und klicken/tippen – an den Rand zielen scrollt!'); } };
  $('bLocal').onclick = () => lobbyOpen(false); $('bOnline').onclick = () => lobbyOpen(true);
  $('bHelp').onclick = () => { $('ovHelp').hidden = false; focusEl($('helpX')); }; $('helpX').onclick = () => { $('ovHelp').hidden = true; focusEl($('bSolo')); };
  $('bSet').onclick = () => { $('sSound').checked = SET.sound; $('sVib').checked = SET.vib; $('sLow').checked = SET.low; $('ovSet').hidden = false; focusEl($('setX')); };
  $('setX').onclick = () => { const low = SET.low; SET.sound = $('sSound').checked; SET.vib = $('sVib').checked; SET.low = $('sLow').checked; saveSet(); $('ovSet').hidden = true; if (low !== SET.low) resize(); focusEl($('bSolo')); };
  $('bRadioM').onclick = () => openRadio(); $('bRadio').onclick = e => { if (G.state === 'play') { pause(true); $('ovPause').hidden = true; openRadio($('ovPause')); } if (e.detail) e.currentTarget.blur(); };
  $('pRadio').onclick = () => { $('ovPause').hidden = true; openRadio($('ovPause')); };
  $('bPause').onclick = e => { pause(true); if (e.detail) e.currentTarget.blur(); };
  $('pGo').onclick = () => pause(false);
  $('pSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('pQuit').onclick = () => { G.paused = false; toMenu(); };
  $('endMenu').onclick = () => toMenu();
  $('endAgain').onclick = () => { $('ovEnd').hidden = true; if (G.mode === 'solo') startGame(); else { G.slots = G.g.players.map(p => ({ dev: p.dev, name: p.name, col: p.col, label: '', cid: p.cid })); startGame(); } };
  function menuStat() { const st = LS.get(P + 'stats', {}), hs = LS.get(P + 'highscore', 0); $('menuStat').textContent = st.spiele ? 'Rekord ' + hs + ' Punkte · ' + st.spiele + ' Schlachten · ' + st.treffer + ' Leute eingesaut · beste Serie ' + (st.serie || 0) : 'Wie viele schaffst du in 90 Sekunden?'; }
  addEventListener('visibilitychange', () => { if (document.hidden) { if (G.state === 'play' && G.mode === 'solo') pause(true); if (RAD.el) RAD.el.pause(); } else { radioSync(); if (G.net) keepAwake(); } });

  /* ---------- Start ---------- */
  resize(); if (window.self !== window.top) $('backLink').hidden = true; menuStat(); radioSync(); requestAnimationFrame(frame);
  const kick = () => { if (SET.station && RAD.el && RAD.el.paused) radioSync(); }; addEventListener('pointerdown', kick, { once: true }); addEventListener('keydown', kick, { once: true });
  const q = new URLSearchParams(location.search), jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
  if (jm) joinScreen(jm[1].toUpperCase());
  else if (q.has('tv') || (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv())) lobbyOpen(true);
  else { setTimeout(() => padNav(true), 300); focusEl($('bSolo')); }
  window.TORTEN = { state: () => ({ state: G.state, mode: G.mode, slots: G.slots.length, code: G.net && G.net.code, t: G.g && G.g.t, players: G.g ? G.g.players.map(p => ({ name: p.name, score: p.score, x: p.x, y: p.y, ammo: p.ammo, weapon: p.weapon, stun: p.stun, hits: p.hits, dev: p.dev })) : [], people: G.g ? G.g.people.length : 0, camX: G.camX }),
    game: () => G.g, toScreen: (x, y) => ({ x: (x - G.camX) * CH / DPR, y: y * CH / DPR }), guest: () => ({ joined: C.joined }), still: camX => { G.paused = true; G.noHud = true; G.camX = camX; } }; // für Tests
})();
