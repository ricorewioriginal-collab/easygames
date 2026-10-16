'use strict';
/* AnMaCha Casino – Symbole selbst gezeichnet (Canvas 2D, keine Bilddateien außer den Sender-Logos).
   Alle Zeichnungen arbeiten in einem 200×200-Raster und werden auf die gewünschte Größe skaliert. */
(function (G) {
  const logos = {};
  const loadLogo = n => {
    if (!logos[n]) { const im = new Image(); im.decoding = 'async'; im.src = 'logos/' + n + '.png'; logos[n] = im; }
    return logos[n];
  };
  const whenLogos = list => Promise.all(list.map(n => { const im = loadLogo(n); return im.complete ? Promise.resolve() : new Promise(r => { im.onload = im.onerror = r; }); }));

  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const lg = (g, x0, y0, x1, y1, ...st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const rg = (g, x, y, r0, r1, ...st) => { const q = g.createRadialGradient(x, y, r0, x, y, r1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const FONT = '"Trebuchet MS","Arial Black",Impact,system-ui,sans-serif';
  const text = (g, t, x, y, size, fill, stroke, sw, italic) => {
    g.font = (italic ? 'italic ' : '') + '900 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (stroke) { g.lineWidth = sw || size * 0.14; g.strokeStyle = stroke; g.strokeText(t, x, y); }
    g.fillStyle = fill; g.fillText(t, x, y);
  };
  const shine = (g, x, y, r) => { g.fillStyle = rg(g, x, y, 0, r, 'rgba(255,255,255,.95)', 'rgba(255,255,255,0)'); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const star = (g, cx, cy, ro, ri, n) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : ro; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); };
  const ball = (g, x, y, r, c0, c1, c2) => { g.fillStyle = rg(g, x - r * .35, y - r * .4, r * .1, r * 1.1, c0, c1, c2); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const GOLD = ['#fff6c8', '#ffd24a', '#e39400', '#8a4b00'];
  const gold = (g, y0, y1) => lg(g, 0, y0, 0, y1, ...GOLD);

  const ART = {
    seven(g, c) { const col = c || ['#ffb3b3', '#ff2a3d', '#8a0012'];
      text(g, '7', 100, 106, 178, lg(g, 0, 30, 0, 180, ...col), '#3a0008', 26, true);
      g.save(); g.globalAlpha = .55; text(g, '7', 96, 100, 178, 'rgba(0,0,0,0)', '#fff', 4, true); g.restore();
      text(g, '7', 100, 106, 178, lg(g, 0, 30, 0, 180, ...col), null, 0, true); shine(g, 82, 52, 22); },
    blueSeven(g) { ART.seven(g, ['#c9f3ff', '#1e9bff', '#0a2f8a']); },
    bar(g, n) {
      const h = n === 1 ? 64 : n === 2 ? 46 : 36, gap = 8, tot = n * h + (n - 1) * gap; let y = 100 - tot / 2;
      for (let i = 0; i < n; i++) { rr(g, 22, y, 156, h, 12); g.fillStyle = lg(g, 0, y, 0, y + h, '#5b5b6a', '#14141c', '#3a3a48'); g.fill(); g.lineWidth = 5; g.strokeStyle = gold(g, y, y + h); g.stroke();
        text(g, 'BAR', 100, y + h / 2 + 2, h * .62, gold(g, y, y + h), '#1a0d00', 5); y += h + gap; } },
    bar1(g) { ART.bar(g, 1); }, bar2(g) { ART.bar(g, 2); }, bar3(g) { ART.bar(g, 3); },
    cherry(g) {
      g.lineCap = 'round'; g.strokeStyle = '#1f7a2c'; g.lineWidth = 9; g.beginPath(); g.moveTo(70, 132); g.quadraticCurveTo(80, 70, 130, 36); g.moveTo(136, 136); g.quadraticCurveTo(128, 80, 130, 36); g.stroke();
      g.fillStyle = lg(g, 120, 30, 175, 70, '#9cff7a', '#2fb84a'); g.beginPath(); g.ellipse(150, 46, 30, 13, -.5, 0, 7); g.fill();
      ball(g, 66, 142, 40, '#ff9aa6', '#e0102e', '#5a0010'); ball(g, 136, 146, 38, '#ff9aa6', '#e0102e', '#5a0010'); shine(g, 54, 128, 12); shine(g, 124, 132, 11); },
    lemon(g) { g.fillStyle = rg(g, 80, 80, 10, 100, '#fffbc0', '#ffe229', '#c99400'); g.beginPath(); g.ellipse(100, 104, 78, 58, -.25, 0, 7); g.fill();
      g.beginPath(); g.ellipse(176, 84, 12, 9, -.25, 0, 7); g.ellipse(26, 124, 12, 9, -.25, 0, 7); g.fill(); shine(g, 74, 80, 20); },
    orange(g) { ball(g, 100, 108, 74, '#ffd9a0', '#ff8a00', '#a34200'); g.fillStyle = '#2fb84a'; g.beginPath(); g.ellipse(118, 34, 24, 11, -.4, 0, 7); g.fill(); g.fillStyle = '#5a3a00'; g.beginPath(); g.arc(100, 38, 6, 0, 7); g.fill(); shine(g, 74, 80, 20); },
    plum(g) { g.fillStyle = rg(g, 74, 76, 6, 100, '#e7b3ff', '#8e2bd6', '#2e0756'); g.beginPath(); g.ellipse(100, 110, 70, 76, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(40,0,70,.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(104, 40); g.quadraticCurveTo(122, 110, 100, 182); g.stroke();
      g.fillStyle = '#2fb84a'; g.beginPath(); g.ellipse(124, 32, 26, 10, -.5, 0, 7); g.fill(); shine(g, 72, 82, 18); },
    grapes(g) { const P = [[64, 70], [100, 64], [136, 70], [82, 102], [118, 102], [154, 100], [46, 100], [100, 134], [136, 132], [64, 132], [118, 164], [82, 164]];
      g.fillStyle = '#2fb84a'; g.beginPath(); g.ellipse(100, 34, 34, 13, 0, 0, 7); g.fill();
      P.forEach(p => ball(g, p[0], p[1], 21, '#e8c8ff', '#8b2fd6', '#2b0650')); P.slice(0, 6).forEach(p => shine(g, p[0] - 7, p[1] - 7, 6)); },
    melon(g) { g.save(); g.translate(100, 112); g.beginPath(); g.arc(0, -10, 92, 0.05 * Math.PI, 0.95 * Math.PI); g.closePath(); g.fillStyle = '#1f9a3a'; g.fill();
      g.beginPath(); g.arc(0, -10, 80, 0.06 * Math.PI, 0.94 * Math.PI); g.closePath(); g.fillStyle = '#e8ffd8'; g.fill();
      g.beginPath(); g.arc(0, -10, 72, 0.07 * Math.PI, 0.93 * Math.PI); g.closePath(); g.fillStyle = lg(g, 0, -10, 0, 70, '#ff6b7a', '#e0142e'); g.fill();
      g.fillStyle = '#1a0a0a'; [[-40, 12], [-14, 26], [14, 26], [40, 12], [-26, 44], [0, 48], [26, 44]].forEach(p => { g.beginPath(); g.ellipse(p[0], p[1], 5, 8, 0, 0, 7); g.fill(); }); g.restore(); },
    bell(g) { g.beginPath(); g.moveTo(100, 24); g.bezierCurveTo(150, 24, 146, 92, 154, 128); g.lineTo(176, 150); g.lineTo(24, 150); g.lineTo(46, 128); g.bezierCurveTo(54, 92, 50, 24, 100, 24); g.closePath();
      g.fillStyle = lg(g, 40, 0, 160, 0, '#a86400', '#ffe27a', '#ffc21a', '#9a5a00'); g.fill(); g.lineWidth = 5; g.strokeStyle = '#5a3200'; g.stroke();
      ball(g, 100, 166, 18, '#fff6c8', '#ffb300', '#7a4500'); g.fillStyle = '#ffe27a'; g.fillRect(90, 12, 20, 16); shine(g, 78, 62, 18); },
    star(g) { star(g, 100, 102, 88, 40, 5); g.fillStyle = lg(g, 0, 14, 0, 190, '#fffbd0', '#ffd42a', '#e08a00'); g.fill(); g.lineWidth = 7; g.strokeStyle = '#7a4500'; g.stroke(); shine(g, 82, 76, 22); },
    diamond(g, col) { const c = col || '#3be0ff';
      const P = [[100, 176], [20, 78], [56, 30], [144, 30], [180, 78]]; g.beginPath(); P.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p[0], p[1])); g.closePath();
      g.fillStyle = lg(g, 0, 30, 0, 176, '#ffffff', c, shade(c, -.55)); g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 78); g.lineTo(180, 78); g.moveTo(56, 30); g.lineTo(80, 78); g.lineTo(100, 176); g.lineTo(120, 78); g.lineTo(144, 30); g.moveTo(100, 30); g.lineTo(80, 78); g.moveTo(100, 30); g.lineTo(120, 78); g.stroke(); shine(g, 72, 50, 18); },
    gem(g, col) { ART.diamond(g, col); },
    crown(g) { g.beginPath(); g.moveTo(30, 150); g.lineTo(18, 60); g.lineTo(62, 98); g.lineTo(100, 36); g.lineTo(138, 98); g.lineTo(182, 60); g.lineTo(170, 150); g.closePath();
      g.fillStyle = gold(g, 36, 150); g.fill(); g.lineWidth = 6; g.strokeStyle = '#6a3a00'; g.stroke(); rr(g, 26, 148, 148, 24, 8); g.fillStyle = gold(g, 148, 172); g.fill(); g.stroke();
      [[18, 60], [100, 36], [182, 60]].forEach(p => ball(g, p[0], p[1], 12, '#ffd6e0', '#ff2d55', '#6a0018')); ball(g, 100, 120, 14, '#d6f7ff', '#1e9bff', '#06286a'); },
    clover(g) { const L = [[100, 64], [140, 104], [100, 144], [60, 104]];
      g.strokeStyle = '#0f5a22'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(100, 104); g.quadraticCurveTo(120, 160, 150, 186); g.stroke();
      L.forEach(p => { g.save(); g.translate(p[0], p[1]); g.rotate(Math.atan2(p[1] - 104, p[0] - 100) + Math.PI / 2); g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-46, 6, -30, -40, 0, -20); g.bezierCurveTo(30, -40, 46, 6, 0, 30); g.fillStyle = rg(g, 0, -8, 4, 44, '#b9ffb0', '#22c55e', '#0b5a22'); g.fill(); g.restore(); });
      shine(g, 86, 60, 14); },
    horseshoe(g) { g.lineCap = 'round'; g.lineWidth = 40; g.strokeStyle = '#5a3a00'; g.beginPath(); g.arc(100, 96, 58, Math.PI * .82, Math.PI * .18 + Math.PI * 2); g.stroke();
      g.lineWidth = 28; g.strokeStyle = lg(g, 0, 30, 0, 180, '#ffffff', '#cfd8e6', '#7a879c'); g.stroke();
      g.fillStyle = '#4a5468'; for (let i = 0; i < 7; i++) { const a = Math.PI * .9 + i * Math.PI * 1.2 / 6; g.beginPath(); g.arc(100 + Math.cos(a) * 58, 96 + Math.sin(a) * 58, 4, 0, 7); g.fill(); } },
    letter(g, ch) { const cols = { A: ['#ffe0e6', '#ff3b5c', '#7a0016'], K: ['#d9f2ff', '#2b9bff', '#082d6e'], Q: ['#f0dcff', '#a855f7', '#3b0a6e'], J: ['#dcffe8', '#22c55e', '#064d22'], '10': ['#fff1cc', '#ff9f1a', '#7a3d00'], '9': ['#e0fbff', '#06b6d4', '#064a5a'] }[ch] || ['#fff', '#aaa', '#333'];
      text(g, ch, 100, 108, ch.length > 1 ? 112 : 150, lg(g, 0, 30, 0, 180, ...cols), '#12091f', 16); shine(g, 80, 60, 16); },
    A(g) { ART.letter(g, 'A'); }, K(g) { ART.letter(g, 'K'); }, Q(g) { ART.letter(g, 'Q'); }, J(g) { ART.letter(g, 'J'); }, 10(g) { ART.letter(g, '10'); },
    wildBadge(g, label, c0, c1, c2, sub) {
      star(g, 100, 96, 92, 66, 12); g.fillStyle = lg(g, 0, 0, 0, 200, c0, c1, c2); g.fill(); g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke();
      text(g, label, 100, sub ? 92 : 100, label.length > 4 ? 46 : 54, gold(g, 70, 125), '#2a0a00', 10, true);
      if (sub) text(g, sub, 100, 136, 26, '#fff', '#2a0a00', 6); },
    wild(g) { ART.wildBadge(g, 'WILD', '#ff9ae0', '#ff2d95', '#5a0a3a'); },
    diamondWild(g) { ART.diamond(g, '#7df9ff'); text(g, 'WILD', 100, 152, 40, gold(g, 132, 172), '#06204a', 8, true); },
    rainbowWild(g) { const C = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de']; g.lineWidth = 12; C.forEach((c, i) => { g.strokeStyle = c; g.beginPath(); g.arc(100, 130, 84 - i * 12, Math.PI, 0); g.stroke(); });
      text(g, 'WILD', 100, 150, 50, gold(g, 128, 172), '#2a0a00', 10, true); text(g, '×2', 100, 92, 34, '#fff', '#2a0a00', 7); },
    fireWild(g) { g.fillStyle = rg(g, 100, 150, 10, 110, '#fff3a0', '#ff9f0a', '#ff2d00', 'rgba(255,0,0,0)'); g.beginPath(); g.moveTo(100, 10); g.bezierCurveTo(150, 60, 190, 100, 170, 160); g.bezierCurveTo(150, 196, 50, 196, 30, 160); g.bezierCurveTo(10, 100, 60, 60, 100, 10); g.fill();
      text(g, 'WILD', 100, 130, 54, '#fff8d0', '#7a0a00', 10, true); },
    jokerWild(g) { emoji(g, '🃏', 120); text(g, 'JOKER', 100, 172, 34, gold(g, 156, 190), '#2a0040', 7); },
    tnt(g) { for (let i = 0; i < 3; i++) { rr(g, 40 + i * 42, 46, 36, 110, 10); g.fillStyle = lg(g, 0, 46, 0, 156, '#ff6b5a', '#c8102e', '#5a0010'); g.fill(); g.lineWidth = 4; g.strokeStyle = '#2a0006'; g.stroke(); }
      g.fillStyle = '#2a1a0a'; g.fillRect(34, 92, 132, 18); text(g, 'TNT', 100, 102, 22, '#ffd24a'); g.strokeStyle = '#ddd'; g.lineWidth = 4; g.beginPath(); g.moveTo(100, 46); g.quadraticCurveTo(110, 22, 134, 20); g.stroke();
      shine(g, 136, 18, 16); text(g, 'WILD', 100, 178, 38, gold(g, 160, 196), '#2a0a00', 8, true); },
    bonus(g) { ball(g, 100, 100, 86, '#fff6c8', '#ffcc22', '#9a5a00'); g.lineWidth = 6; g.strokeStyle = '#6a3a00'; g.beginPath(); g.arc(100, 100, 86, 0, 7); g.stroke();
      star(g, 100, 86, 52, 24, 5); g.fillStyle = lg(g, 0, 34, 0, 140, '#ffffff', '#ff2d95'); g.fill(); text(g, 'BONUS', 100, 152, 34, '#fff', '#5a0a3a', 7); },
    gong(g) { ball(g, 100, 100, 84, '#fff3c0', '#e8a400', '#7a3a00'); g.strokeStyle = '#7a0010'; g.lineWidth = 10; g.beginPath(); g.arc(100, 100, 84, 0, 7); g.stroke();
      g.fillStyle = '#c8102e'; g.beginPath(); g.arc(100, 100, 44, 0, 7); g.fill(); text(g, '福', 100, 104, 58, '#ffd24a'); text(g, 'BONUS', 100, 168, 26, '#fff', '#7a0010', 6); },
    book(g) { g.save(); g.translate(100, 104); g.rotate(-.08); rr(g, -70, -84, 140, 168, 10); g.fillStyle = lg(g, -70, 0, 70, 0, '#5a1a00', '#a33a0a', '#5a1a00'); g.fill(); g.lineWidth = 7; g.strokeStyle = gold(g, -84, 84); g.stroke();
      g.fillStyle = '#f5e6c8'; g.fillRect(64, -78, 6, 156); text(g, '★', 0, -18, 70, gold(g, -60, 20), '#3a1400', 6); text(g, 'FUNK', 0, 46, 32, gold(g, 30, 64), '#3a1400', 6); g.restore(); },
    mic(g) { g.save(); g.translate(100, 100); g.rotate(.5); rr(g, -14, 10, 28, 84, 10); g.fillStyle = lg(g, -14, 0, 14, 0, '#333', '#888', '#222'); g.fill();
      ball(g, 0, -30, 46, '#ffffff', '#b8c2d6', '#3a4256'); g.strokeStyle = 'rgba(30,30,50,.5)'; g.lineWidth = 2; for (let i = -40; i <= 40; i += 10) { g.beginPath(); g.moveTo(i, -72); g.lineTo(i, 12); g.stroke(); } g.restore(); shine(g, 76, 56, 16); },
    headphones(g) { g.lineWidth = 16; g.strokeStyle = lg(g, 0, 20, 0, 120, '#ff7ad9', '#a21caf'); g.beginPath(); g.arc(100, 110, 66, Math.PI, 0); g.stroke();
      [[34, 120], [166, 120]].forEach(p => { rr(g, p[0] - 24, p[1] - 10, 48, 70, 18); g.fillStyle = lg(g, 0, p[1] - 10, 0, p[1] + 60, '#3a3a4a', '#0e0e16'); g.fill(); rr(g, p[0] - 16, p[1], 32, 50, 12); g.fillStyle = '#ff2d95'; g.fill(); }); },
    vinyl(g) { ball(g, 100, 100, 86, '#555', '#141414', '#000'); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; for (let r = 30; r < 84; r += 7) { g.beginPath(); g.arc(100, 100, r, 0, 7); g.stroke(); }
      g.fillStyle = rg(g, 100, 100, 2, 30, '#ffd24a', '#ff6a00'); g.beginPath(); g.arc(100, 100, 30, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(100, 100, 5, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(100, 100, 70, -2.4, -1.6); g.stroke(); },
    radio(g) { rr(g, 18, 56, 164, 112, 18); g.fillStyle = lg(g, 0, 56, 0, 168, '#5eead4', '#0f766e'); g.fill(); g.lineWidth = 6; g.strokeStyle = '#053b36'; g.stroke();
      g.strokeStyle = '#053b36'; g.lineWidth = 6; g.beginPath(); g.moveTo(60, 56); g.lineTo(130, 16); g.stroke();
      ball(g, 66, 112, 36, '#ccc', '#333', '#111'); rr(g, 116, 78, 52, 24, 6); g.fillStyle = '#fef3c7'; g.fill(); g.fillStyle = '#c2410c'; g.fillRect(138, 80, 4, 20);
      ball(g, 128, 136, 10, '#fff', '#aaa', '#444'); ball(g, 158, 136, 10, '#fff', '#aaa', '#444'); },
    coin(g, val) { ball(g, 100, 100, 88, '#fff6c8', '#ffcc22', '#8a4b00'); g.lineWidth = 6; g.strokeStyle = '#7a4500'; g.beginPath(); g.arc(100, 100, 74, 0, 7); g.stroke();
      if (val) { const jp = /[A-Z]/.test(val); text(g, val, 100, 104, jp ? (val.length > 5 ? 30 : 36) : (val.length > 3 ? 46 : 60), jp ? '#fff' : '#5a2a00', jp ? '#7a0a3a' : '#fff6c8', jp ? 7 : 5); }
      else text(g, '$', 100, 106, 96, gold(g, 40, 160), '#6a3a00', 8); shine(g, 70, 60, 20); },
    blank() {}
  };
  function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255; const t = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round((t - r) * p) + r; gg = Math.round((t - gg) * p) + gg; b = Math.round((t - b) * p) + b; return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1); }
  function emoji(g, e, size) { g.font = size + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 10; g.shadowOffsetY = 6; g.fillText(e, 100, 108); g.shadowColor = 'transparent'; }
  function logo(g, n) { const im = loadLogo(n); rr(g, 20, 20, 160, 160, 30); g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(0, 0, 200, 200);
    if (im.complete && im.naturalWidth) { const s = Math.min(150 / im.naturalWidth, 150 / im.naturalHeight); g.drawImage(im, 100 - im.naturalWidth * s / 2, 100 - im.naturalHeight * s / 2, im.naturalWidth * s, im.naturalHeight * s); }
    g.restore(); g.lineWidth = 6; g.strokeStyle = gold(g, 20, 180); rr(g, 20, 20, 160, 160, 30); g.stroke(); }

  // Nur die Zeichnung (transparent) in ein 200er-Raster
  function drawArt(g, art, extra) {
    if (!art) return;
    if (art.startsWith('emoji:')) return emoji(g, art.slice(6), 132);
    if (art.startsWith('logo:')) return logo(g, art.slice(5));
    if (art.startsWith('gem:')) return ART.gem(g, art.slice(4));
    if (art === 'coin') return ART.coin(g, extra);
    (ART[art] || ART.blank)(g, extra);
  }
  // Symbol-Kachel mit Hintergrund (für Walzen)
  function tile(art, theme, size, opt) {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
    paintTile(g, 0, 0, size, art, theme, opt);
    return c;
  }
  function paintTile(g, x, y, size, art, theme, opt) {
    opt = opt || {};
    g.save(); g.translate(x, y); g.scale(size / 200, size / 200);
    g.fillStyle = lg(g, 0, 0, 0, 200, theme.tile[0], theme.tile[1]); g.fillRect(0, 0, 200, 200);
    if (art && art !== 'blank') { g.fillStyle = rg(g, 100, 96, 10, 110, hexA(theme.a, opt.hot ? .55 : .22), 'rgba(0,0,0,0)'); g.fillRect(0, 0, 200, 200); }
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1); g.lineTo(200, 1); g.moveTo(0, 199); g.lineTo(200, 199); g.stroke();
    g.translate(100, 100); g.scale(.86, .86); g.translate(-100, -100);
    drawArt(g, art, opt.val);
    g.restore();
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  G.CasinoSymbols = { drawArt, tile, paintTile, whenLogos, loadLogo, text, rr, lg, rg, gold, star, hexA, shade, FONT };
})(typeof globalThis !== 'undefined' ? globalThis : this);
