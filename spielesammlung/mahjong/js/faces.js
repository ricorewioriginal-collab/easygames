/* Mahjong 3D – Steinbilder: werden einmal in eine Textur (Atlas 1024×1024, 8×6 Felder à 128×168) gezeichnet.
 * Keine Bilddateien. Chinesische Schriftzeichen nur, wenn das Gerät eine passende Schrift hat – sonst gezeichnete Ersatzzeichen. */
(function (root) {
  'use strict';
  const CW = 128, CH = 168, COLS = 8, SIZE = 1024;
  const CJK_FONT = '"Noto Serif CJK SC","Noto Serif SC","Songti SC","STSong","SimSun","Noto Sans CJK SC","Noto Sans SC","PingFang SC","Microsoft YaHei","Hiragino Sans GB","Source Han Serif SC",serif';
  const NUM_CJK = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const WIND_CJK = ['東', '南', '西', '北'], WIND_DE = ['O', 'S', 'W', 'N'], WIND_NAME = ['Ost', 'Süd', 'West', 'Nord'];
  const C = { blue: '#1f4fa8', green: '#1d8a4a', red: '#cc2a2a', ink: '#1d2333', gold: '#c98a12' };

  let cjk = null;
  function hasCJK() {
    if (cjk !== null) return cjk;
    try {
      const c = document.createElement('canvas'); c.width = 40; c.height = 40;
      const x = c.getContext('2d', { willReadFrequently: true });
      const draw = ch => { x.clearRect(0, 0, 40, 40); x.fillStyle = '#000'; x.font = '32px ' + CJK_FONT; x.textBaseline = 'middle'; x.fillText(ch, 4, 20); return x.getImageData(0, 0, 40, 40).data; };
      const a = draw('東'), b = draw(''), d = draw('發');
      let diff = 0, diff2 = 0, ink = 0;
      for (let i = 3; i < a.length; i += 4) { if (a[i] !== b[i]) diff++; if (a[i] !== d[i]) diff2++; if (a[i] > 0) ink++; }
      cjk = diff > 30 && diff2 > 30 && ink > 30;
    } catch (e) { cjk = false; }
    return cjk;
  }

  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }

  // ---------- Kreise ----------
  function coin(x, cx, cy, r, col) {
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(cx, cy, r * 0.72, 0, 7); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r * 0.5, 0, 7); x.fill();
    x.strokeStyle = '#fffaf0'; x.lineWidth = Math.max(1, r * 0.1);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2); x.lineTo(cx + Math.cos(a) * r * 0.48, cy + Math.sin(a) * r * 0.48); x.stroke(); }
    x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(cx, cy, r * 0.16, 0, 7); x.fill();
  }
  const DOTS = {
    1: [[64, 84, 40, 'multi']],
    2: [[64, 48, 22, C.green], [64, 120, 22, C.blue]],
    3: [[34, 40, 18, C.blue], [64, 84, 18, C.red], [94, 128, 18, C.green]],
    4: [[38, 50, 20, C.blue], [90, 50, 20, C.green], [38, 118, 20, C.green], [90, 118, 20, C.blue]],
    5: [[36, 44, 18, C.blue], [92, 44, 18, C.green], [64, 84, 18, C.red], [36, 124, 18, C.green], [92, 124, 18, C.blue]],
    6: [[40, 36, 16, C.green], [88, 36, 16, C.green], [40, 88, 16, C.red], [88, 88, 16, C.red], [40, 132, 16, C.red], [88, 132, 16, C.red]],
    7: [[36, 32, 13, C.green], [66, 46, 13, C.green], [96, 60, 13, C.green], [42, 102, 15, C.red], [86, 102, 15, C.red], [42, 138, 15, C.red], [86, 138, 15, C.red]],
    8: [[40, 26, 14, C.blue], [88, 26, 14, C.blue], [40, 64, 14, C.blue], [88, 64, 14, C.blue], [40, 102, 14, C.blue], [88, 102, 14, C.blue], [40, 140, 14, C.blue], [88, 140, 14, C.blue]],
    9: [[30, 42, 14, C.blue], [64, 42, 14, C.blue], [98, 42, 14, C.blue], [30, 88, 14, C.red], [64, 88, 14, C.red], [98, 88, 14, C.red], [30, 134, 14, C.green], [64, 134, 14, C.green], [98, 134, 14, C.green]]
  };
  function drawDots(x, n) {
    DOTS[n].forEach(d => {
      if (d[3] === 'multi') {
        x.fillStyle = C.green; x.beginPath(); x.arc(d[0], d[1], d[2], 0, 7); x.fill();
        x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(d[0], d[1], d[2] * 0.82, 0, 7); x.fill();
        x.fillStyle = C.blue; x.beginPath(); x.arc(d[0], d[1], d[2] * 0.7, 0, 7); x.fill();
        for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; x.fillStyle = k % 2 ? '#fffaf0' : C.green; x.beginPath(); x.arc(d[0] + Math.cos(a) * d[2] * 0.5, d[1] + Math.sin(a) * d[2] * 0.5, d[2] * 0.12, 0, 7); x.fill(); }
        x.fillStyle = C.red; x.beginPath(); x.arc(d[0], d[1], d[2] * 0.3, 0, 7); x.fill();
        x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(d[0], d[1], d[2] * 0.12, 0, 7); x.fill();
      } else coin(x, d[0], d[1], d[2], d[3]);
    });
  }

  // ---------- Bambus ----------
  function stick(x, cx, cy, len, col, ang) {
    x.save(); x.translate(cx, cy); if (ang) x.rotate(ang);
    const w = 10, h = len;
    x.fillStyle = col; rr(x, -w / 2, -h / 2, w, h, 4); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(-w / 2 + 2, -h / 2 + 3, 2.4, h - 6);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-w / 2 - 1, -1.5, w + 2, 3); x.fillRect(-w / 2 - 1, -h / 2 + 1, w + 2, 2.5); x.fillRect(-w / 2 - 1, h / 2 - 3.5, w + 2, 2.5);
    x.restore();
  }
  const BAM = {
    2: [[64, 50, C.green], [64, 118, C.blue]],
    3: [[64, 50, C.green], [40, 118, C.blue], [88, 118, C.blue]],
    4: [[42, 50, C.blue], [86, 50, C.green], [42, 118, C.green], [86, 118, C.blue]],
    5: [[36, 50, C.green], [92, 50, C.blue], [64, 84, C.red], [36, 118, C.blue], [92, 118, C.green]],
    6: [[32, 50, C.green], [64, 50, C.green], [96, 50, C.green], [32, 118, C.blue], [64, 118, C.blue], [96, 118, C.blue]],
    7: [[64, 30, C.red], [32, 84, C.green], [64, 84, C.green], [96, 84, C.green], [32, 136, C.blue], [64, 136, C.blue], [96, 136, C.blue]],
    9: [[32, 34, C.green], [64, 34, C.red], [96, 34, C.blue], [32, 84, C.green], [64, 84, C.red], [96, 84, C.blue], [32, 134, C.green], [64, 134, C.red], [96, 134, C.blue]]
  };
  function drawBamboo(x, n) {
    if (n === 1) { bird(x); return; }
    if (n === 8) {
      const s = 0.42;
      [[30, 50, -s], [52, 50, s], [76, 50, -s], [98, 50, s]].forEach(p => stick(x, p[0], p[1], 52, C.green, p[2]));
      [[30, 118, s], [52, 118, -s], [76, 118, s], [98, 118, -s]].forEach(p => stick(x, p[0], p[1], 52, C.blue, p[2]));
      return;
    }
    const len = n >= 7 ? 40 : 54;
    BAM[n].forEach(p => stick(x, p[0], p[1], len, p[2]));
  }
  function bird(x) {
    // Pfau: Schwanzfächer, Körper, Kopf
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.32;
      x.strokeStyle = C.green; x.lineWidth = 5; x.beginPath(); x.moveTo(64, 110); x.lineTo(64 + Math.cos(a) * 70, 110 + Math.sin(a) * 70); x.stroke();
      x.fillStyle = C.blue; x.beginPath(); x.arc(64 + Math.cos(a) * 68, 110 + Math.sin(a) * 68, 8, 0, 7); x.fill();
      x.fillStyle = C.gold; x.beginPath(); x.arc(64 + Math.cos(a) * 68, 110 + Math.sin(a) * 68, 3.5, 0, 7); x.fill();
    }
    x.fillStyle = C.green; x.beginPath(); x.ellipse(64, 116, 20, 26, 0, 0, 7); x.fill();
    x.fillStyle = C.red; x.beginPath(); x.arc(64, 84, 11, 0, 7); x.fill();
    x.fillStyle = C.gold; x.beginPath(); x.moveTo(72, 82); x.lineTo(84, 86); x.lineTo(72, 90); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(66, 82, 3, 0, 7); x.fill();
    x.fillStyle = C.ink; x.beginPath(); x.arc(67, 82, 1.6, 0, 7); x.fill();
    x.strokeStyle = C.red; x.lineWidth = 4; x.beginPath(); x.moveTo(56, 140); x.lineTo(52, 156); x.moveTo(72, 140); x.lineTo(76, 156); x.stroke();
  }

  // ---------- Zeichen (Ersatz ohne CJK-Schrift) ----------
  function seal(x, cx, cy, s) {
    x.fillStyle = C.red; rr(x, cx - s / 2, cy - s / 2, s, s, s * 0.14); x.fill();
    x.strokeStyle = '#fffaf0'; x.lineWidth = s * 0.08; x.lineCap = 'round';
    const a = s * 0.28;
    x.beginPath();
    x.moveTo(cx - a, cy - a * 0.9); x.lineTo(cx + a, cy - a * 0.9);
    x.moveTo(cx - a * 0.4, cy - a * 1.2); x.lineTo(cx - a * 0.4, cy - a * 0.5);
    x.moveTo(cx + a * 0.4, cy - a * 1.2); x.lineTo(cx + a * 0.4, cy - a * 0.5);
    x.rect(cx - a * 0.7, cy - a * 0.3, a * 1.4, a * 0.7);
    x.moveTo(cx, cy - a * 0.3); x.lineTo(cx, cy + a * 0.4);
    x.moveTo(cx - a, cy + a * 1.2); x.lineTo(cx - a * 0.8, cy + a * 0.6); x.lineTo(cx + a * 0.8, cy + a * 0.6); x.lineTo(cx + a, cy + a * 1.2);
    x.stroke(); x.lineCap = 'butt';
  }
  function drawChar(x, n) {
    if (hasCJK()) {
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = C.ink; x.font = '700 54px ' + CJK_FONT; x.fillText(NUM_CJK[n - 1], 64, 50);
      x.fillStyle = C.red; x.font = '700 66px ' + CJK_FONT; x.fillText('萬', 64, 118);
    } else {
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = C.ink; x.font = '800 66px Georgia,"Times New Roman",serif'; x.fillText(String(n), 64, 54);
      seal(x, 64, 120, 58);
    }
  }
  function drawWind(x, k) {
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = C.ink;
    if (hasCJK()) { x.font = '700 84px ' + CJK_FONT; x.fillText(WIND_CJK[k], 64, 88); }
    else {
      x.font = '800 88px Georgia,"Times New Roman",serif'; x.fillText(WIND_DE[k], 64, 92);
      x.strokeStyle = C.ink; x.lineWidth = 3; x.beginPath(); x.arc(64, 88, 50, 0, 7); x.stroke();
    }
  }
  function drawDragon(x, k) {
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (k === 2) {   // weißer Drache: blauer Doppelrahmen
      x.strokeStyle = C.blue; x.lineWidth = 6; rr(x, 22, 26, 84, 116, 8); x.stroke();
      x.lineWidth = 3; rr(x, 32, 36, 64, 96, 5); x.stroke();
      return;
    }
    if (hasCJK()) { x.fillStyle = k === 0 ? C.red : C.green; x.font = '700 86px ' + CJK_FONT; x.fillText(k === 0 ? '中' : '發', 64, 88); return; }
    if (k === 0) {   // 中 gezeichnet
      x.strokeStyle = C.red; x.lineWidth = 12; x.lineCap = 'round';
      rr(x, 26, 58, 76, 46, 6); x.stroke();
      x.beginPath(); x.moveTo(64, 28); x.lineTo(64, 146); x.stroke(); x.lineCap = 'butt';
    } else {         // grüner Drache: Drachenspirale
      x.strokeStyle = C.green; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath();
      for (let t = 0; t < 14; t += 0.2) { const r = 6 + t * 3.4, a = t; const px = 64 + Math.cos(a) * r, py = 86 + Math.sin(a) * r; t === 0 ? x.moveTo(px, py) : x.lineTo(px, py); }
      x.stroke(); x.lineCap = 'butt';
      x.fillStyle = C.green; x.beginPath(); x.arc(64, 86, 7, 0, 7); x.fill();
    }
  }

  // ---------- Blumen und Jahreszeiten ----------
  function badge(x, n, col) {
    x.fillStyle = col; x.beginPath(); x.arc(104, 24, 14, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = '800 18px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 104, 25);
  }
  function petals(x, cx, cy, n, r, w, col, rot) {
    x.fillStyle = col;
    for (let k = 0; k < n; k++) { const a = rot + k * Math.PI * 2 / n; x.beginPath(); x.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.95, w, a, 0, 7); x.fill(); }
  }
  function stem(x, pts, col) { x.strokeStyle = col; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.stroke(); x.lineCap = 'butt'; }
  function leaf(x, cx, cy, l, w, a, col) { x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = col; x.beginPath(); x.ellipse(l / 2, 0, l / 2, w, 0, 0, 7); x.fill(); x.restore(); }
  function drawFlower(x, k) {
    if (k === 0) {        // Pflaume
      stem(x, [30, 150, 50, 110, 80, 90, 100, 60], '#6b3f22');
      [[52, 104], [86, 80], [96, 50], [44, 62]].forEach((p, i) => { petals(x, p[0], p[1], 5, 11, 9, i % 2 ? '#e84a6a' : '#f07a96', 0.3); x.fillStyle = C.gold; x.beginPath(); x.arc(p[0], p[1], 4, 0, 7); x.fill(); });
    } else if (k === 1) { // Orchidee
      stem(x, [64, 156, 62, 120, 58, 100], C.green);
      leaf(x, 62, 150, 56, 7, -2.3, C.green); leaf(x, 62, 150, 52, 7, -0.9, C.green);
      petals(x, 60, 76, 5, 20, 12, '#9b4fd1', -Math.PI / 2);
      x.fillStyle = '#f7d6ff'; x.beginPath(); x.arc(60, 76, 9, 0, 7); x.fill();
      x.fillStyle = C.gold; x.beginPath(); x.arc(60, 76, 4, 0, 7); x.fill();
    } else if (k === 2) { // Chrysantheme
      stem(x, [64, 156, 64, 110], C.green); leaf(x, 64, 132, 34, 8, -0.6, C.green); leaf(x, 64, 140, 34, 8, -2.5, C.green);
      petals(x, 64, 76, 14, 24, 6, '#f2a516', 0); petals(x, 64, 76, 10, 14, 5, '#ffcf3a', 0.3);
      x.fillStyle = '#b35a00'; x.beginPath(); x.arc(64, 76, 8, 0, 7); x.fill();
    } else {              // Bambus-Blume
      stick(x, 50, 96, 110, C.green); stick(x, 80, 110, 80, C.green);
      leaf(x, 52, 60, 40, 8, -0.5, '#2fae5e'); leaf(x, 52, 72, 38, 8, -2.6, '#2fae5e'); leaf(x, 82, 84, 36, 8, -0.4, '#2fae5e');
    }
    badge(x, k + 1, C.red);
  }
  function drawSeason(x, k) {
    if (k === 0) {        // Frühling: Kirschblüte
      stem(x, [24, 150, 60, 110, 100, 96], '#6b3f22'); stem(x, [60, 110, 70, 70], '#6b3f22');
      [[70, 64, 1], [100, 92, 0.8], [40, 128, 0.7]].forEach(p => { petals(x, p[0], p[1], 5, 14 * p[2], 11 * p[2], '#ff9ec2', -Math.PI / 2); x.fillStyle = '#ffe36b'; x.beginPath(); x.arc(p[0], p[1], 4, 0, 7); x.fill(); });
    } else if (k === 1) { // Sommer: Sonne
      x.strokeStyle = '#f08a16'; x.lineWidth = 6; x.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.beginPath(); x.moveTo(64 + Math.cos(a) * 34, 84 + Math.sin(a) * 34); x.lineTo(64 + Math.cos(a) * 50, 84 + Math.sin(a) * 50); x.stroke(); }
      x.lineCap = 'butt';
      const g = x.createRadialGradient(58, 78, 4, 64, 84, 30); g.addColorStop(0, '#ffe36b'); g.addColorStop(1, '#f2a516');
      x.fillStyle = g; x.beginPath(); x.arc(64, 84, 28, 0, 7); x.fill();
    } else if (k === 2) { // Herbst: Ahornblatt
      x.fillStyle = '#d9541e'; x.beginPath();
      const pts = [[64, 30], [74, 58], [100, 48], [92, 74], [116, 84], [88, 98], [96, 122], [70, 108], [64, 136], [58, 108], [32, 122], [40, 98], [12, 84], [36, 74], [28, 48], [54, 58]];
      pts.forEach((p, i) => { i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.closePath(); x.fill();
      stem(x, [64, 100, 64, 156], '#8a3a12');
      x.strokeStyle = '#ffb36b'; x.lineWidth = 2; x.beginPath(); x.moveTo(64, 104); x.lineTo(64, 44); x.moveTo(64, 96); x.lineTo(96, 66); x.moveTo(64, 96); x.lineTo(32, 66); x.stroke();
    } else {              // Winter: Schneeflocke
      x.strokeStyle = '#3a8fd8'; x.lineWidth = 6; x.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, ex = 64 + Math.cos(a) * 46, ey = 84 + Math.sin(a) * 46;
        x.beginPath(); x.moveTo(64, 84); x.lineTo(ex, ey); x.stroke();
        const mx = 64 + Math.cos(a) * 28, my = 84 + Math.sin(a) * 28;
        x.lineWidth = 4; x.beginPath();
        x.moveTo(mx, my); x.lineTo(mx + Math.cos(a + 0.8) * 14, my + Math.sin(a + 0.8) * 14);
        x.moveTo(mx, my); x.lineTo(mx + Math.cos(a - 0.8) * 14, my + Math.sin(a - 0.8) * 14); x.stroke(); x.lineWidth = 6;
      }
      x.lineCap = 'butt';
      x.fillStyle = '#9fd3ff'; x.beginPath(); x.arc(64, 84, 8, 0, 7); x.fill();
    }
    badge(x, k + 1, C.blue);
  }

  // ---------- Klar-Stil: große Zahl + Symbol ----------
  function drawClear(x, f) {
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (f < 27) {
      const suit = Math.floor(f / 9), n = f % 9 + 1, col = [C.blue, C.green, C.red][suit];
      x.fillStyle = col; x.font = '900 80px system-ui,"Segoe UI",Roboto,sans-serif'; x.fillText(String(n), 64, 62);
      if (suit === 0) { coin(x, 64, 132, 22, C.blue); }
      else if (suit === 1) { stick(x, 50, 132, 46, C.green); stick(x, 78, 132, 46, C.green); }
      else if (hasCJK()) { x.fillStyle = C.red; x.font = '700 44px ' + CJK_FONT; x.fillText('萬', 64, 134); }
      else seal(x, 64, 132, 44);
      return;
    }
    if (f < 31) {
      const k = f - 27;
      x.fillStyle = C.ink; x.font = '900 70px system-ui,"Segoe UI",Roboto,sans-serif'; x.fillText(WIND_DE[k], 64, 64);
      x.font = '700 22px system-ui,sans-serif'; x.fillText(WIND_NAME[k], 64, 128);
      return;
    }
    if (f < 34) { drawDragon(x, f - 31); return; }
    if (f < 38) { drawFlower(x, f - 34); return; }
    drawSeason(x, f - 38);
  }

  function drawFace(x, f, style) {
    if (style === 'clear') { drawClear(x, f); return; }
    if (f < 9) drawDots(x, f + 1);
    else if (f < 18) drawBamboo(x, f - 8);
    else if (f < 27) drawChar(x, f - 17);
    else if (f < 31) drawWind(x, f - 27);
    else if (f < 34) drawDragon(x, f - 31);
    else if (f < 38) drawFlower(x, f - 34);
    else drawSeason(x, f - 38);
  }
  // kleines Hilfszeichen oben links (Zahl/Buchstabe)
  function indexLabel(f) {
    if (f < 27) return { t: String(f % 9 + 1), c: [C.blue, C.green, C.red][Math.floor(f / 9)] };
    if (f < 31) return { t: WIND_DE[f - 27], c: C.ink };
    if (f < 34) return { t: ['R', 'G', 'W'][f - 31], c: [C.red, C.green, C.blue][f - 31] };
    if (f < 38) return { t: 'B', c: C.red };
    return { t: 'J', c: C.blue };
  }

  function build(opts) {
    opts = opts || {};
    if (opts.latin) cjk = false;   // nur für Tests: Ersatzzeichen erzwingen
    const cv = document.createElement('canvas'); cv.width = SIZE; cv.height = SIZE;
    const x = cv.getContext('2d');
    x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, SIZE, SIZE);
    for (let f = 0; f < 42; f++) {
      const col = f % COLS, row = Math.floor(f / COLS);
      x.save(); x.translate(col * CW, row * CH);
      x.beginPath(); x.rect(0, 0, CW, CH); x.clip();
      const g = x.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#f1e7d0');
      x.fillStyle = g; x.fillRect(0, 0, CW, CH);
      x.strokeStyle = 'rgba(150,120,80,.18)'; x.lineWidth = 2; rr(x, 5, 5, CW - 10, CH - 10, 10); x.stroke();
      drawFace(x, f, opts.style);
      if (opts.index && !(opts.style === 'clear' && f < 31)) {
        const L = indexLabel(f);
        x.font = '800 22px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top';
        x.lineWidth = 4; x.strokeStyle = '#fffaf0'; x.strokeText(L.t, 9, 7); x.fillStyle = L.c; x.fillText(L.t, 9, 7);
      }
      x.restore();
    }
    return cv;
  }
  // UV-Versatz für ein Bild (Three.js: v läuft von unten nach oben)
  function uvOf(f) {
    const col = f % COLS, row = Math.floor(f / COLS);
    return [col * CW / SIZE, 1 - (row + 1) * CH / SIZE];
  }
  // Einzelbild als kleines Canvas (für Menüs/Anleitung)
  function thumb(atlas, f, w) {
    const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * CH / CW);
    const col = f % COLS, row = Math.floor(f / COLS);
    c.getContext('2d').drawImage(atlas, col * CW, row * CH, CW, CH, 0, 0, c.width, c.height);
    return c;
  }
  function name(f) {
    if (f < 9) return (f + 1) + ' Kreise';
    if (f < 18) return (f - 8) + ' Bambus';
    if (f < 27) return (f - 17) + ' Zeichen';
    if (f < 31) return WIND_NAME[f - 27] + 'wind';
    if (f < 34) return ['Roter', 'Grüner', 'Weißer'][f - 31] + ' Drache';
    if (f < 38) return ['Pflaume', 'Orchidee', 'Chrysantheme', 'Bambus'][f - 34] + ' (Blume)';
    return ['Frühling', 'Sommer', 'Herbst', 'Winter'][f - 38] + ' (Jahreszeit)';
  }

  root.MJFaces = { build, uvOf, thumb, name, hasCJK, CW, CH, SIZE, scale: [CW / SIZE, CH / SIZE] };
})(window);
