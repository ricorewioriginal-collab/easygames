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

  /* ---------- Kulisse (einmal vorgezeichnet, in Welt-Einheiten) ---------- */
  function buildScene(g) {
    const key = g.WW.toFixed(3) + '|' + CH + '|' + logos.filter(imgOk).length; if (key === sceneKey && sceneC) return; sceneKey = key;
    const k = Math.min(1, 4096 / (g.WW * CH)); sceneC = sceneC || document.createElement('canvas');
    sceneC.width = Math.ceil(g.WW * CH * k); sceneC.height = Math.ceil(CH * k); sceneC.k = k;
    const c = sceneC.getContext('2d'); c.setTransform(CH * k, 0, 0, CH * k, 0, 0); c.clearRect(0, 0, g.WW, 1);
    const R = TS.mulberry(77), W = g.WW, L = TS.LAYERS;
    const band = (y0, col, amp, fr) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 1.1); for (let x = 0; x <= W + .05; x += .05) c.lineTo(x, y0 + Math.sin(x * fr) * amp + Math.sin(x * fr * 2.3 + 1) * amp * .5); c.lineTo(W + .05, 1.1); c.fill(); };
    band(.52, '#4c8f45', .01, 3); // hintere Wiese
    // Studiogebäude mit Senderlogos zwischen den Funktürmen
    let li = 1;
    for (let x = .25; x < W - .3; x += 1.05) {
      const bw = .42 + R() * .12, bh = .15 + R() * .05, y = .6;
      c.fillStyle = '#e9e4f7'; c.fillRect(x, y - bh, bw, bh); c.fillStyle = '#c9c2e8'; c.fillRect(x, y - bh, bw, .012);
      c.fillStyle = '#3b2a7a'; c.beginPath(); c.moveTo(x - .02, y - bh); c.lineTo(x + bw / 2, y - bh - .05); c.lineTo(x + bw + .02, y - bh); c.fill();
      for (let wx = x + .03; wx < x + bw - .06; wx += .07) { c.fillStyle = '#7fc8ff'; c.fillRect(wx, y - bh + .03, .045, .04); }
      c.fillStyle = '#d0102a'; c.fillRect(x + bw - .1, y - bh + .085, .08, .025); c.save(); c.translate(x + bw - .06, y - bh + .098); c.scale(.001, .001); c.fillStyle = '#fff'; c.font = 'bold 17px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ON AIR', 0, 1); c.restore();
      const im = logos[li]; if (imgOk(im)) c.drawImage(im, x + .03, y - bh + .08, .06, .06); li = li % 13 + 1;
      c.fillStyle = '#6b4a2a'; c.fillRect(x + bw / 2 - .02, y - .05, .04, .05);
    }
    // Funktürme
    for (const t of g.stations.tower) {
      const x = t.x, base = L[0].g + .01, top = .12;
      c.strokeStyle = '#d6d6e6'; c.lineWidth = .004;
      c.beginPath(); c.moveTo(x - .035, base); c.lineTo(x - .008, top); c.moveTo(x + .035, base); c.lineTo(x + .008, top); c.stroke();
      c.lineWidth = .002; c.beginPath(); for (let i = 0; i < 12; i++) { const y0 = base - (base - top) * i / 12, y1 = base - (base - top) * (i + 1) / 12, w0 = .035 - .027 * i / 12, w1 = .035 - .027 * (i + 1) / 12; c.moveTo(x - w0, y0); c.lineTo(x + w1, y1); c.moveTo(x + w0, y0); c.lineTo(x - w1, y1); } c.stroke();
      for (let i = 1; i < 6; i++) { const y = base - (base - top) * i / 6; c.fillStyle = i % 2 ? '#e8402f' : '#fff'; c.fillRect(x - .03 + .025 * i / 6, y - .004, .06 - .05 * i / 6, .008); }
      c.strokeStyle = '#999'; c.beginPath(); c.moveTo(x, top); c.lineTo(x, top - .06); c.stroke();
    }
    band(.62, '#58a94f', .012, 2.1); // mittlere Wiese
    // Bäume und Büsche
    for (let i = 0; i < W * 4; i++) { const x = R() * W, y = .6 + R() * .08, r = .02 + R() * .03; c.fillStyle = '#6b4a2a'; c.fillRect(x - .004, y - r * .2, .008, r * 1.1); c.fillStyle = ['#2f7a3a', '#3a8f45', '#277033'][i % 3]; c.beginPath(); c.arc(x, y - r * .6, r, 0, 7); c.arc(x - r * .6, y - r * .2, r * .7, 0, 7); c.arc(x + r * .6, y - r * .2, r * .7, 0, 7); c.fill(); }
    band(.785, '#67c25a', .01, 1.7); // vordere Wiese
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < W * 140; i++) { c.fillRect(R() * W, .8 + R() * .2, .002, .008); }
    // Mikrofonständer
    for (const m of g.stations.mic) { const s = L[m.layer].s * TS.HMAN, gy = L[m.layer].g, x = m.x + s * .22; c.strokeStyle = '#333'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(x - s * .12, gy); c.lineTo(x, gy - s * .02); c.lineTo(x + s * .12, gy); c.moveTo(x, gy); c.lineTo(x, gy - s * .78); c.lineTo(x - s * .16, gy - s * .84); c.stroke(); c.fillStyle = '#222'; c.beginPath(); c.ellipse(x - s * .17, gy - s * .85, s * .04, s * .05, -.6, 0, 7); c.fill(); }
  }
  function drawSky(g) {
    const gr = cx.createLinearGradient(0, 0, 0, CH * .6); gr.addColorStop(0, '#2a1b6b'); gr.addColorStop(.55, '#ff7a6a'); gr.addColorStop(1, '#ffc46b');
    cx.fillStyle = gr; cx.fillRect(0, 0, CW, CH);
    cx.fillStyle = 'rgba(255,240,200,.9)'; cx.beginPath(); cx.arc(CW * .78 - G.camX * CH * .1, CH * .28, CH * .07, 0, 7); cx.fill();
    // Wolken und Berge (Parallaxe)
    cx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 5; i++) { const x = ((i * .9 + G.time * .01 - G.camX * .2) % 4.5 + 4.5) % 4.5 - .5, y = .1 + (i % 3) * .07; cx.beginPath(); cx.ellipse(x * CH, y * CH, CH * .09, CH * .025, 0, 0, 7); cx.ellipse(x * CH + CH * .05, y * CH - CH * .015, CH * .05, CH * .025, 0, 0, 7); cx.fill(); }
    const off = G.camX * .35; cx.fillStyle = '#6a4f9e'; cx.beginPath(); cx.moveTo(0, CH); for (let px = 0; px <= CW + 20; px += 20) { const x = px / CH + off; cx.lineTo(px, CH * (.45 + Math.sin(x * 2.1) * .04 + Math.sin(x * 5.3) * .015)); } cx.lineTo(CW, CH); cx.fill();
  }

  /* ---------- Figuren zeichnen ---------- */
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function blob(c, x, y, r, drips) { c.beginPath(); c.arc(x, y, r, 0, 7); c.arc(x - r * .7, y + r * .2, r * .6, 0, 7); c.arc(x + r * .65, y + r * .25, r * .55, 0, 7); c.arc(x + r * .1, y - r * .55, r * .5, 0, 7); c.fill(); if (drips) for (let i = -1; i <= 1; i++) { c.fillRect(x + i * r * .45 - r * .1, y, r * .2, r * (1.1 + ((i + 2) % 2) * .6)); c.beginPath(); c.arc(x + i * r * .45, y + r * (1.1 + ((i + 2) % 2) * .6), r * .12, 0, 7); c.fill(); } }
  const LOOK = { prak: ['#4fa8ff', '#2b2f55'], mod: ['#FF4FAE', '#2b2f55'], dj: ['#1a1a1a', '#333'], tech: ['#ff8a1f', '#3a3a5a'], chef: ['#2b2b3a', '#2b2b3a'], kond: ['#ffffff', '#e8e8e8'], fan: ['#ffc94d', '#3a2a12'] };
  function drawPerson(p, g) {
    const b = TS.body(p), u = b.s * CH, X = (p.x - G.camX) * CH, GY = b.gy * CH;
    if (X < -u || X > CW + u) return;
    if (p.type === 'board') return drawBoard(p, b, u, X, GY);
    const fleeing = p.state === 'flee', hit = fleeing || p.splats.length > 0, moving = fleeing || p.state === 'walk' || p.state === 'walk2' || (p.type === 'mod' && p.state !== 'stand') || (p.type === 'tech');
    const ph = p.t * (fleeing ? 18 : 9), sw = moving ? Math.sin(ph) * .5 : 0, [shirt, pants] = LOOK[p.type], skin = SKIN[p.skin], hair = HAIR[p.look];
    cx.save(); if (b.clip < 9) { cx.beginPath(); cx.rect(X - u, 0, u * 2, b.clip * CH); cx.clip(); }
    cx.translate(X, GY); cx.scale(p.dir < 0 ? -1 : 1, 1);
    cx.lineCap = 'round';
    // Beine
    cx.strokeStyle = pants; cx.lineWidth = u * .075;
    for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * u * .06, -u * .38); cx.lineTo(s * u * .06 + s * sw * u * .14, -u * .03); cx.stroke(); cx.fillStyle = '#222'; cx.beginPath(); cx.ellipse(s * u * .06 + s * sw * u * .14 + u * .025, -u * .02, u * .055, u * .025, 0, 0, 7); cx.fill(); }
    // Arme
    const armUp = fleeing || p.state === 'aim' || (p.type === 'dj' && Math.sin(p.t * 6) > 0);
    cx.strokeStyle = shirt === '#ffffff' ? '#eee' : shirt; cx.lineWidth = u * .065;
    for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * u * .15, -u * .68); const ax = armUp ? s * u * .26 : s * u * .2 + (p.type === 'prak' && s > 0 ? u * .08 : -s * sw * u * .1), ay = armUp ? -u * (.96 + (fleeing ? Math.sin(ph + s) * .05 : 0)) : -u * .42; cx.lineTo(ax, ay); cx.stroke(); cx.fillStyle = skin; cx.beginPath(); cx.arc(ax, ay, u * .035, 0, 7); cx.fill(); }
    // Rumpf
    cx.fillStyle = shirt; rr(cx, -u * .16, -u * .75, u * .32, u * .4, u * .08); cx.fill();
    if (p.type === 'kond' || p.type === 'chef') { cx.strokeStyle = p.type === 'kond' ? '#ccc' : '#fff'; cx.lineWidth = u * .015; cx.beginPath(); cx.moveTo(0, -u * .74); cx.lineTo(0, -u * .38); cx.stroke(); }
    if (p.type === 'chef') { cx.fillStyle = '#d0102a'; cx.beginPath(); cx.moveTo(-u * .025, -u * .72); cx.lineTo(u * .025, -u * .72); cx.lineTo(u * .018, -u * .5); cx.lineTo(0, -u * .46); cx.lineTo(-u * .018, -u * .5); cx.fill(); }
    if (p.type === 'tech') { cx.fillStyle = '#fff36b'; cx.fillRect(-u * .16, -u * .58, u * .32, u * .03); }
    if (p.type === 'fan') { const im = logos[7]; if (imgOk(im)) cx.drawImage(im, -u * .09, -u * .68, u * .18, u * .18); }
    if (p.type === 'dj') { cx.fillStyle = '#FF4FAE'; cx.font = 'bold ' + (u * .08) + 'px system-ui'; cx.textAlign = 'center'; cx.fillText('DJ', 0, -u * .52); }
    if (p.type === 'prak' && !fleeing) { cx.fillStyle = '#b0b0c0'; cx.fillRect(u * .12, -u * .45, u * .2, u * .02); cx.fillStyle = '#fff'; cx.fillRect(u * .15, -u * .5, u * .045, u * .05); cx.fillRect(u * .23, -u * .5, u * .045, u * .05); }
    // Kopf
    cx.fillStyle = skin; cx.fillRect(-u * .03, -u * .78, u * .06, u * .05); cx.beginPath(); cx.arc(0, -u * .86, u * .12, 0, 7); cx.fill();
    cx.fillStyle = hair;
    if (p.type === 'chef') { cx.beginPath(); cx.arc(0, -u * .86, u * .121, Math.PI * 1.05, Math.PI * 1.25); cx.lineTo(0, -u * .86); cx.fill(); cx.fillStyle = '#5a3a1a'; cx.fillRect(u * .01, -u * .82, u * .08, u * .018); }
    else if (p.type === 'kond') { cx.fillStyle = '#fff'; rr(cx, -u * .1, -u * 1.1, u * .2, u * .16, u * .06); cx.fill(); cx.fillRect(-u * .12, -u * .97, u * .24, u * .04); }
    else if (p.type === 'tech') { cx.fillStyle = '#ffd400'; cx.beginPath(); cx.arc(0, -u * .9, u * .125, Math.PI, 0); cx.fill(); cx.fillRect(-u * .15, -u * .91, u * .3, u * .025); }
    else if (p.type === 'dj') { cx.fillStyle = '#d0102a'; cx.beginPath(); cx.arc(0, -u * .9, u * .123, Math.PI, 0); cx.fill(); cx.fillRect(0, -u * .92, u * .2, u * .03); }
    else { cx.beginPath(); cx.arc(0, -u * .88, u * .125, Math.PI * .95, Math.PI * 2.05); cx.fill(); if (p.type === 'prak' || p.look === 2) { cx.beginPath(); cx.ellipse(-u * .14, -u * .82, u * .05, u * .11, .3, 0, 7); cx.fill(); } }
    if (p.type === 'mod' || p.type === 'dj') { cx.strokeStyle = '#222'; cx.lineWidth = u * .025; cx.beginPath(); cx.arc(0, -u * .88, u * .14, Math.PI * 1.05, Math.PI * 1.95); cx.stroke(); cx.fillStyle = '#222'; cx.fillRect(-u * .16, -u * .9, u * .05, u * .08); cx.fillRect(u * .11, -u * .9, u * .05, u * .08); }
    // Gesicht
    cx.fillStyle = '#1a1a1a';
    if (hit) { cx.lineWidth = u * .012; cx.strokeStyle = '#1a1a1a'; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(u * .04 + s * u * .035 - u * .015, -u * .885); cx.lineTo(u * .04 + s * u * .035 + u * .015, -u * .875); cx.stroke(); } cx.beginPath(); cx.ellipse(u * .045, -u * .81, u * .025, u * .03, 0, 0, 7); cx.fill(); }
    else { for (const s of [-1, 1]) { cx.beginPath(); cx.arc(u * .04 + s * u * .035, -u * .875, u * .013, 0, 7); cx.fill(); } cx.lineWidth = u * .012; cx.strokeStyle = '#1a1a1a'; cx.beginPath(); cx.arc(u * .045, -u * .83, u * .03, .2, Math.PI - .2); cx.stroke(); }
    if (p.type === 'chef' || p.type === 'kond' && p.state === 'aim') { cx.strokeStyle = '#1a1a1a'; cx.lineWidth = u * .014; cx.beginPath(); cx.moveTo(u * .005, -u * .915); cx.lineTo(u * .06, -u * .9); cx.moveTo(u * .07, -u * .9); cx.lineTo(u * .11, -u * .915); cx.stroke(); }
    // Konditor holt mit der Torte aus
    if (p.type === 'kond' && (p.state === 'walk' || p.state === 'aim')) { const up = p.state === 'aim', px = up ? u * .26 : u * .22, py = up ? -u * (1.02 + Math.sin(p.aimT * 9) * .02) : -u * .42; drawPie(px, py, u * .1); }
    cx.restore();
    // Sahne auf der Figur (nicht gespiegelt)
    cx.save(); if (b.clip < 9) { cx.beginPath(); cx.rect(X - u, 0, u * 2, b.clip * CH); cx.clip(); }
    cx.fillStyle = '#fffaf0'; for (const s of p.splats) blob(cx, X + s.dx * u, GY + s.dy * u, s.r * u, s.r > .1);
    cx.restore();
    if (fleeing && p.hitT < 1.2) { cx.fillStyle = '#fff'; cx.font = '900 ' + Math.max(12, u * .14) + 'px system-ui'; cx.textAlign = 'center'; cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.lineWidth = 4; const t = ['Hey!', 'Iiih!', '#@!', 'Mein Hemd!', 'Sahne?!'][p.id % 5]; cx.strokeText(t, X, GY - u * 1.08); cx.fillText(t, X, GY - u * 1.08); }
    if (p.type === 'kond' && p.state === 'aim') { cx.fillStyle = Math.sin(G.time * 20) > 0 ? '#ff2d2d' : '#fff'; cx.font = '1000 ' + (u * .3) + 'px system-ui'; cx.textAlign = 'center'; cx.fillText('!', X, GY - u * 1.2); }
    if (p.type === 'fan' && !fleeing) { cx.fillStyle = 'rgba(255,230,120,' + (.5 + .5 * Math.sin(G.time * 8)) + ')'; for (let i = 0; i < 3; i++) { const a = G.time * 2 + i * 2.1; cx.beginPath(); cx.arc(X + Math.cos(a) * u * .3, GY - u * .6 + Math.sin(a) * u * .3, u * .025, 0, 7); cx.fill(); } }
    if (p.type === 'dj') drawDesk(p, b, u, X);
  }
  function drawDesk(p, b, u, X) {
    const y = b.clip * CH, h = (p.g - b.clip) * CH + 2, w = u * .62;
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
    // Busch davor
    const by = b.clip * CH; cx.fillStyle = '#3f9a3a'; cx.beginPath(); for (let i = -2; i <= 2; i++) cx.arc(X + i * u * .2, by + u * .05, u * .17, 0, 7); cx.fill();
  }
  function drawSign(g) {
    const S = g.sign, X = (S.x - G.camX) * CH, Y = S.y * CH, w = S.w * CH, h = S.h * CH;
    if (X < -w || X > CW + w) return;
    cx.fillStyle = '#6b4a2a'; cx.fillRect(X - w * .4, Y, w * .05, (TS.LAYERS[1].g - S.y) * CH); cx.fillRect(X + w * .35, Y, w * .05, (TS.LAYERS[1].g - S.y) * CH);
    cx.fillStyle = '#0b0f2a'; rr(cx, X - w / 2, Y - h / 2, w, h, h * .15); cx.fill(); cx.strokeStyle = '#FF4FAE'; cx.lineWidth = h * .08; cx.stroke();
    cx.fillStyle = '#fff'; cx.font = '800 ' + (h * .3) + 'px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('Schön, dass du', X, Y - h * .16); cx.fillText('da bist!', X, Y + h * .2); cx.textBaseline = 'alphabetic';
    if (S.hit) { cx.fillStyle = '#fffaf0'; blob(cx, X, Y, h * .4, true); }
  }
  function drawPie(x, y, r) {
    cx.fillStyle = '#c7843f'; cx.beginPath(); cx.ellipse(x, y + r * .25, r, r * .45, 0, 0, 7); cx.fill();
    cx.fillStyle = '#fffaf0'; cx.beginPath(); cx.ellipse(x, y, r * .95, r * .42, 0, 0, 7); cx.fill();
    for (let i = -2; i <= 2; i++) { cx.beginPath(); cx.arc(x + i * r * .38, y - r * .12, r * .16, 0, 7); cx.fill(); }
    cx.fillStyle = '#d0102a'; cx.beginPath(); cx.arc(x, y - r * .3, r * .16, 0, 7); cx.fill();
  }

  /* ---------- Effekte ---------- */
  const FX = [], POP = [];
  function burst(x, y, n, col, sp) { for (let i = 0; i < n && FX.length < 260; i++) { const a = Math.random() * 6.28, v = (.3 + Math.random()) * (sp || 1) * CH * .5; FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - CH * .2, life: .5 + Math.random() * .4, r: (2 + Math.random() * 5) * DPR, col: col || '#fffaf0' }); } }
  function popup(x, y, text, col) { POP.push({ x, y, text, col: col || '#fff', life: 1.1 }); }

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
  const G = { state: 'menu', mode: 'solo', g: null, camX: 0, time: 0, paused: false, slots: [], net: null, lastDev: 'mouse', mouse: { x: .5, y: .5, seen: false }, warnT: 0, lastTick: 0 };
  function padNav(on) { if (window.EasyGamesPad && EasyGamesPad.enabled) try { EasyGamesPad.enabled(on); } catch (e) { } }
  const anyOv = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  function focusEl(el) { if (el && !('ontouchstart' in window)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }

  function startGame() {
    const solo = G.mode === 'solo', slots = solo ? [{ dev: 'any', name: 'Du', col: COLS[0] }] : G.slots.slice(0, 4);
    G.g = TS.newGame({ solo, WW: solo ? 3.2 : A, A, players: slots.map((s, i) => ({ name: s.name, col: s.col, dev: s.dev, cid: s.cid, x: (solo ? .3 : A * (i + 1) / (slots.length + 1)), y: .55 })) });
    G.camX = 0; G.g.camX = 0; G.paused = false; G.state = 'play'; G.lastTick = 0; FX.length = 0; POP.length = 0;
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
      case 'throw': sfx(ev.w === 'spritze' ? 'squirt' : 'throw'); break;
      case 'hit': { sfx('splat'); sfx('yelp', ev.p % 5); burst(sx, sy, 22); const mul = ev.m > 1 ? ' ×' + ev.m : ''; popup(sx, sy, '+' + ev.pts + mul + (ev.head ? ' Volltreffer!' : ''), pl.col); if (ev.m > 1) sfx('combo', ev.m); netVib(pl, 40); break; }
      case 'splash': sfx('squirt'); burst(sx, sy, 5); break;
      case 'miss': sfx('miss'); burst(sx, sy, ev.w === 'spritze' ? 2 : 8, '#fffaf0', .5); break;
      case 'bomb': sfx('bomb'); burst(sx, sy, 60, '#ffeef5', 2); burst(sx, sy, 20, '#d0102a', 1.5); break;
      case 'bonus': sfx('bonus'); popup(sx, sy - 40, '🍒 Kirschbombe! (Waffe wechseln)', '#ffc94d'); if (g.solo) toast('🍒 Kirschbombe bekommen – mit Q, Y, Mausrad oder 🎂 auswählen'); break;
      case 'sign': sfx('bonus'); popup(sx, sy, '+10 Sekunden!', '#2EE6A0'); burst(sx, sy, 20); break;
      case 'parry': sfx('parry'); popup(sx, sy, 'Abgewehrt! +10', '#00E5FF'); burst(sx, sy, 26); break;
      case 'warn': sfx('warn'); break;
      case 'blind': sfx('blind'); if (pl) { netVib(pl, [80, 40, 120]); if (!g.solo) popup((pl.x - G.camX) * CH, pl.y * CH, 'Sahne im Gesicht!', '#fff'); } break;
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
    for (const p of POP) { p.life -= dt; p.y -= CH * .06 * dt; } for (let i = POP.length - 1; i >= 0; i--) if (POP[i].life <= 0) POP.splice(i, 1);
    draw(g);
  }
  function drawIdle() { // Menü-Hintergrund: Kulisse mit ein paar Leuten
    if (!G.demo) { G.demo = TS.newGame({ solo: true, WW: Math.max(A, 2), A, seed: 5 }); G.demo.players[0].x = -9; }
    const g = G.demo; g.t = 99; TS.step(g, 1 / 60); g.events.length = 0; G.camX = Math.max(0, (g.WW - A) / 2 + Math.sin(G.time * .05) * (g.WW - A) / 2); g.camX = G.camX; draw(g, true);
  }
  function draw(g, idle) {
    buildScene(g); drawSky(g);
    const k = sceneC.k; cx.drawImage(sceneC, G.camX * CH * k, 0, A * CH * k, CH * k, 0, 0, CW, CH);
    const L = TS.LAYERS;
    for (let layer = 0; layer < 3; layer++) {
      cx.fillStyle = 'rgba(255,250,240,.92)';
      for (const s of g.splats) if (s.layer === layer) { const X = (s.x - G.camX) * CH; if (X > -50 && X < CW + 50) blob(cx, X, s.y * CH, s.r * CH, s.w === 'torte'); }
      if (layer === 1) drawSign(g);
      for (const p of g.people) if (p.layer === layer) drawPerson(p, g);
    }
    if (idle) return;
    // Würfe im Flug
    for (const s of g.shots) {
      const f = 1 - s.t / s.T, tx = (s.x - G.camX) * CH, ty = s.y * CH, pl = g.players[s.pl];
      if (s.w === 'spritze') { cx.strokeStyle = 'rgba(255,250,240,.85)'; cx.lineWidth = CH * .012; cx.lineCap = 'round'; const sx = ((pl.x - G.camX) * CH * .5 + CW * .5), sy0 = CH * 1.02; cx.beginPath(); cx.moveTo(sx, sy0); cx.quadraticCurveTo((sx + tx) / 2, Math.min(sy0, ty) - CH * .08, sx + (tx - sx) * Math.min(1, f + .5), sy0 + (ty - sy0) * Math.min(1, f + .5)); cx.stroke(); continue; }
      const sx = tx * .6 + CW * .2, sy0 = CH * 1.1, x = sx + (tx - sx) * f, y = sy0 + (ty - sy0) * f - Math.sin(f * Math.PI) * CH * .1, r = CH * (.07 * (1 - f) + TS.WEAPONS[s.w === 'bombe' ? 'bombe' : 'torte'].r * 1.2 * f);
      if (s.w === 'bombe') { cx.fillStyle = '#d0102a'; cx.beginPath(); cx.arc(x, y, r * .6, 0, 7); cx.fill(); cx.strokeStyle = '#2a7a2a'; cx.lineWidth = r * .12; cx.beginPath(); cx.moveTo(x, y - r * .5); cx.quadraticCurveTo(x + r * .3, y - r, x + r * .5, y - r * 1.1); cx.stroke(); }
      else drawPie(x, y, r);
    }
    // Konditor-Torten im Anflug
    for (const pie of g.pies) { const x = (pie.x - G.camX) * CH, y = pie.y * CH, r = pie.r * CH * 1.6; cx.strokeStyle = 'rgba(255,45,45,' + (.4 + .4 * Math.sin(G.time * 25)) + ')'; cx.lineWidth = 4 * DPR; cx.beginPath(); cx.arc(x, y, r * 1.3, 0, 7); cx.stroke(); drawPie(x, y, r); }
    // Effekte
    for (const f of FX) { cx.globalAlpha = Math.min(1, f.life * 2); cx.fillStyle = f.col; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 7); cx.fill(); } cx.globalAlpha = 1;
    cx.textAlign = 'center'; for (const p of POP) { cx.globalAlpha = Math.min(1, p.life * 2); cx.font = '900 ' + Math.round(CH * .035) + 'px system-ui'; cx.lineWidth = 5 * DPR; cx.strokeStyle = 'rgba(0,0,0,.55)'; cx.strokeText(p.text, p.x, p.y); cx.fillStyle = p.col; cx.fillText(p.text, p.x, p.y); } cx.globalAlpha = 1;
    if (G.noHud) return;
    // Fadenkreuze
    for (const pl of g.players) drawCross(pl, g);
    // Sahne im Gesicht (Solo: ganzer Bildschirm)
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
