/* Sonnenhof – Hof-Ansicht auf einem Canvas: Gras je Jahreszeit (einmal vorgezeichnet), Felder, Pflanzen in vier Wachstumsstufen,
 * Gebäude, Ställe mit Tieren, Teich, Wege, Tag/Nacht, Regen/Schnee/Gewitter, schwebende Texte. Kamera mit Verschieben und Zoom. */
(function (root) {
  'use strict';
  const C = root.SHCore, T = 48;
  let cv, cx, bg = null, bgKey = '', W = 0, H = 0, dpr = 1;
  const cam = { x: 0, y: 0, z: 1 }, fx = [], drops = [];
  let cursor = null, flash = 0;
  const SEAS = [   // Gras, Grashalm, Erde, Laub
    { g: '#7cc95a', g2: '#5fae44', leaf: '#3f9a3a', fl: ['#fff', '#ffd2ec', '#ffe45a'] },
    { g: '#6dbb4a', g2: '#529c37', leaf: '#2f8a2f', fl: ['#ffe45a', '#ff8a3a', '#fff'] },
    { g: '#b5b552', g2: '#93923c', leaf: '#d0782a', fl: ['#ffb43a', '#c2502a'] },
    { g: '#e9f0f5', g2: '#cfdbe3', leaf: '#6b8a7a', fl: [] }];
  function init(canvas) { cv = canvas; cx = cv.getContext('2d'); resize(); addEventListener('resize', resize); }
  function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); fit(); }
  function minZ() { return Math.max(.45, Math.min(W / (C.W * T), H / (C.H * T)) * .98); }
  function fit() { const wf = Math.min(W / (C.W * T), (H - 120) / (C.H * T)); if (wf >= .72) { cam.z = clampZ(Math.min(1.5, wf)); center(C.W / 2, C.H / 2 + .4); } else { cam.z = clampZ(Math.min(1.2, W / (9.5 * T))); center(6, 6.5); } }
  const clampZ = z => Math.max(minZ(), Math.min(2.4, z));
  function center(tx, ty) { cam.x = tx * T - W / 2 / cam.z; cam.y = ty * T - H / 2 / cam.z; clampCam(); }
  function clampCam() { const vw = W / cam.z, vh = H / cam.z, ww = C.W * T, wh = C.H * T;
    cam.x = vw >= ww ? (ww - vw) / 2 : Math.max(-T * .5, Math.min(ww - vw + T * .5, cam.x)); cam.y = vh >= wh ? (wh - vh) / 2 : Math.max(-T * .5, Math.min(wh - vh + T * .5, cam.y)); }
  function pan(dx, dy) { cam.x -= dx / cam.z; cam.y -= dy / cam.z; clampCam(); }
  function zoom(f, sx, sy) { const wx = cam.x + sx / cam.z, wy = cam.y + sy / cam.z; cam.z = clampZ(cam.z * f); cam.x = wx - sx / cam.z; cam.y = wy - sy / cam.z; clampCam(); }
  function toTile(sx, sy) { return { x: Math.floor((cam.x + sx / cam.z) / T), y: Math.floor((cam.y + sy / cam.z) / T) }; }
  function toScreen(tx, ty) { return { x: (tx * T - cam.x) * cam.z, y: (ty * T - cam.y) * cam.z }; }
  function follow(tx, ty) { const p = toScreen(tx + .5, ty + .5), m = 90; if (p.x < m || p.y < m + 50 || p.x > W - m || p.y > H - m - 70) center(tx + .5, ty + .5); }

  // ---------- Hintergrund (je Jahreszeit einmal) ----------
  const isPath = (x, y) => (x === 10 && y >= 1) || (y === 10 && x <= 10) || (y === 5 && x >= 10 && x <= 16) || (x === 14 && y >= 4 && y <= 5);
  function buildBg(s) {
    const c = document.createElement('canvas'); c.width = C.W * T; c.height = C.H * T; const g = c.getContext('2d'), S = SEAS[s], r = C.rng(77 + s);
    g.fillStyle = S.g; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() < .5 ? S.g2 : 'rgba(255,255,255,.12)'; const x = r() * c.width, y = r() * c.height; g.fillRect(x, y, 2, 4 + r() * 4); }
    for (let i = 0; i < 70 && S.fl.length; i++) { const x = r() * c.width, y = r() * c.height, tx = Math.floor(x / T), ty = Math.floor(y / T); if (C.inField(tx, ty) || C.placeAt(tx, ty) || isPath(tx, ty)) continue; g.fillStyle = S.fl[Math.floor(r() * S.fl.length)]; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); }
    // Wege
    for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) if (isPath(x, y)) { g.fillStyle = s === 3 ? '#d8d2c8' : '#d9b77a'; g.fillRect(x * T, y * T, T, T); g.fillStyle = 'rgba(120,80,30,.18)'; for (let i = 0; i < 6; i++) g.fillRect(x * T + r() * T, y * T + r() * T, 3, 3); }
    // Bäume am Rand
    const trees = [[0, 0], [1, 0], [0, 3], [0, 6], [0, 9], [0, 12], [17, 0], [17, 3], [17, 8], [12, 0], [5, 0], [8, 0], [1, 13], [11, 13], [17, 13], [16, 4]];
    trees.forEach(([x, y]) => tree(g, x * T + T / 2, y * T + T / 2 + 6, S, s));
    // Teich
    const P = C.PLACES.teich; g.fillStyle = s === 3 ? '#cfe8f5' : '#3fa3d8'; g.beginPath(); g.ellipse((P.x + 1) * T, (P.y + 1) * T, T * .95, T * .8, 0, 0, 7); g.fill();
    g.strokeStyle = s === 3 ? '#a8c8da' : '#7a6a4a'; g.lineWidth = 4; g.stroke(); if (s !== 3) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect((P.x + .6) * T, (P.y + .7) * T, 18, 3); g.fillStyle = '#4caf50'; g.beginPath(); g.arc((P.x + 1.4) * T, (P.y + 1.3) * T, 7, 0, 7); g.fill(); }
    return c;
  }
  function tree(g, x, y, S, s) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + 14, 16, 6, 0, 0, 7); g.fill(); g.fillStyle = '#7a4a24'; g.fillRect(x - 3, y, 6, 14);
    if (s === 3) { g.fillStyle = '#6b7f74'; tri(g, x, y - 26, 18, 30); g.fillStyle = '#fff'; tri(g, x, y - 26, 12, 12); return; }
    g.fillStyle = S.leaf; [[0, -12, 15], [-9, -4, 11], [9, -4, 11]].forEach(([a, b, rr]) => { g.beginPath(); g.arc(x + a, y + b, rr, 0, 7); g.fill(); }); g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.arc(x - 4, y - 16, 6, 0, 7); g.fill();
    if (s === 1) { g.fillStyle = '#e83a3a'; [[-6, -8], [5, -14], [8, -2]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a, y + b, 2.4, 0, 7); g.fill(); }); } }
  function tri(g, x, y, w, h) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - w, y + h); g.lineTo(x + w, y + h); g.closePath(); g.fill(); }

  // ---------- Zeichnen ----------
  function emoji(e, x, y, size) { cx.fillStyle = '#000'; cx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(e, x, y); }
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function bubble(x, y, e, col) { cx.fillStyle = col || '#fff'; cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = 2; rr(x - 13, y - 13, 26, 24, 9); cx.fill(); cx.stroke(); cx.beginPath(); cx.moveTo(x - 4, y + 10); cx.lineTo(x, y + 16); cx.lineTo(x + 4, y + 10); cx.fill(); emoji(e, x, y - 1, 15); }
  function drawCrop(t, px, py, now, s) {
    const c = C.CROPS[t.crop], st = C.stageOf(t), sway = Math.sin(now / 600 + px * .05) * 1.5, mx = px + T / 2, my = py + T / 2;
    if (t.dead) { cx.fillStyle = '#6a5a3a'; cx.fillRect(mx - 10, my, 20, 3); cx.fillRect(mx - 2, my - 10, 3, 12); emoji('🥀', mx, my - 2, 20); return; }
    const leaf = s === 3 ? '#4f8a5a' : '#3fae3a', leaf2 = '#2c8a2c';
    if (st === 0) { cx.fillStyle = '#5a3a1a'; [[-8, -4], [6, 2], [-2, 8], [9, -8]].forEach(([a, b]) => { cx.beginPath(); cx.arc(mx + a, my + b, 2.2, 0, 7); cx.fill(); }); cx.fillStyle = leaf; cx.fillRect(mx - 1, my - 2, 2, 5); return; }
    if (st === 1) { cx.strokeStyle = leaf; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(mx, my + 10); cx.quadraticCurveTo(mx + sway, my, mx + sway, my - 6); cx.stroke(); cx.fillStyle = leaf;
      cx.beginPath(); cx.ellipse(mx - 6 + sway, my - 5, 7, 3.5, -.5, 0, 7); cx.fill(); cx.beginPath(); cx.ellipse(mx + 6 + sway, my - 7, 7, 3.5, .5, 0, 7); cx.fill(); return; }
    // Stufe 2 und 3: volle Pflanze
    const tall = { weizen: 1, mais: 1, sonnenblume: 1, tomate: 1 }[t.crop];
    cx.fillStyle = leaf2; if (tall) { cx.fillRect(mx - 2 + sway / 2, my - 18, 4, 30); for (let i = 0; i < 3; i++) { cx.beginPath(); cx.ellipse(mx + (i % 2 ? 8 : -8) + sway, my - 4 - i * 8, 9, 3.5, i % 2 ? .6 : -.6, 0, 7); cx.fill(); } }
    else { cx.fillStyle = leaf; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .55; cx.beginPath(); cx.ellipse(mx + Math.cos(a) * 9 + sway, my + 4 + Math.sin(a) * 9, 9, 4.5, a, 0, 7); cx.fill(); } }
    if (st === 3) { const b = Math.sin(now / 300 + px) * 1.5; cx.fillStyle = 'rgba(255,240,120,.35)'; cx.beginPath(); cx.arc(mx, my - 4, 20, 0, 7); cx.fill(); emoji(c.e, mx + sway, my - 8 + b, tall ? 24 : 22); }
    else { cx.fillStyle = c.col; cx.globalAlpha = .55; cx.beginPath(); cx.arc(mx + sway, my - (tall ? 16 : 2), 4, 0, 7); cx.fill(); cx.globalAlpha = 1; }
  }
  function building(P, col, roof, e, label, built, now) {
    const x = P.x * T, y = P.y * T, w = P.w * T, h = P.h * T;
    cx.fillStyle = 'rgba(0,0,0,.2)'; rr(x + 6, y + h * .35 + 6, w - 8, h * .65 - 2, 6); cx.fill();
    if (!built) { cx.setLineDash([6, 5]); cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 3; rr(x + 5, y + 5, w - 10, h - 10, 10); cx.stroke(); cx.setLineDash([]); cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fill(); emoji('🔨', x + w / 2, y + h / 2 - 6, 24); emoji(e, x + w / 2, y + h / 2 + 18, 14); return; }
    cx.fillStyle = col; rr(x + 4, y + h * .35, w - 8, h * .62, 6); cx.fill(); cx.fillStyle = roof; cx.beginPath(); cx.moveTo(x - 2, y + h * .42); cx.lineTo(x + w / 2, y + 2); cx.lineTo(x + w + 2, y + h * .42); cx.closePath(); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.2)'; cx.beginPath(); cx.moveTo(x + w / 2, y + 2); cx.lineTo(x + w + 2, y + h * .42); cx.lineTo(x + w / 2 + 6, y + h * .42); cx.fill();
    cx.fillStyle = '#6a3a1a'; rr(x + w / 2 - 9, y + h - 26, 18, 24, 4); cx.fill(); cx.fillStyle = '#ffe9a8'; rr(x + 10, y + h * .5, 14, 12, 3); cx.fill(); rr(x + w - 24, y + h * .5, 14, 12, 3); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.92)'; rr(x + w / 2 - 17, y + h * .2, 34, 28, 10); cx.fill(); emoji(e, x + w / 2, y + h * .2 + 14, 20);
    if (label) { cx.font = 'bold 11px Fredoka,system-ui,sans-serif'; cx.fillStyle = 'rgba(0,0,0,.55)'; const tw = cx.measureText(label).width + 10; rr(x + w / 2 - tw / 2, y + h - 2, tw, 15, 7); cx.fill(); cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(label, x + w / 2, y + h + 5.5); }
  }
  function pen(P, a, g, now) {
    const x = P.x * T, y = P.y * T, w = P.w * T, h = P.h * T, D = C.ANIMALS[a], A = g.animals[a], n = A ? A.list.length : 0, s = C.season(g);
    cx.fillStyle = a === 'biene' ? 'rgba(255,220,120,.25)' : a === 'schwein' ? 'rgba(140,90,50,.45)' : s === 3 ? 'rgba(255,255,255,.4)' : 'rgba(170,140,60,.35)'; rr(x + 4, y + 4, w - 8, h - 8, 8); cx.fill();
    cx.strokeStyle = '#8a5a2a'; cx.lineWidth = 3; rr(x + 4, y + 4, w - 8, h - 8, 8); cx.stroke(); cx.fillStyle = '#8a5a2a'; for (let i = 0; i <= P.w * 2; i++) { cx.fillRect(x + 4 + i * (w - 8) / (P.w * 2) - 2, y, 4, 10); cx.fillRect(x + 4 + i * (w - 8) / (P.w * 2) - 2, y + h - 10, 4, 10); }
    if (!n) { cx.globalAlpha = .55; emoji(D.e, x + w / 2, y + h / 2, 26); cx.globalAlpha = 1; if (D.lv <= g.lv) emoji('➕', x + w - 14, y + 14, 14); else { cx.fillStyle = 'rgba(0,0,0,.5)'; rr(x + w / 2 - 22, y + h - 22, 44, 16, 8); cx.fill(); cx.font = 'bold 11px Fredoka,system-ui'; cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.fillText('🔒 Lv ' + D.lv, x + w / 2, y + h - 14); } return; }
    let ready = 0, hungry = 0;
    A.list.forEach((it, i) => { const cols = Math.min(n, Math.max(2, P.w * 2 - 1)), ix = i % cols, iy = Math.floor(i / cols), ax = x + 18 + ix * ((w - 36) / Math.max(1, cols - 1 || 1)) + (cols === 1 ? (w - 36) / 2 : 0), ay = y + h * .45 + iy * 22;
      const bob = a === 'biene' ? Math.sin(now / 150 + i) * 4 : Math.abs(Math.sin(now / 400 + i * 1.7)) * -3, wal = a === 'biene' ? Math.cos(now / 200 + i) * 6 : Math.sin(now / 1800 + i * 2) * 5;
      cx.fillStyle = 'rgba(0,0,0,.15)'; cx.beginPath(); cx.ellipse(ax + wal, ay + 12, 10, 4, 0, 0, 7); cx.fill(); emoji(a === 'biene' ? '🐝' : D.e, ax + wal, ay + bob, a === 'biene' ? 16 : 26); if (it.ready) ready++; else if (D.feed && !it.fed) hungry++; });
    if (a === 'biene') { cx.fillStyle = '#e8b030'; rr(x + w / 2 - 12, y + h - 30, 24, 22, 6); cx.fill(); cx.fillStyle = '#a8701a'; for (let i = 0; i < 3; i++) cx.fillRect(x + w / 2 - 12, y + h - 26 + i * 6, 24, 2); }
    if (ready) bubble(x + w / 2, y - 6 + Math.sin(now / 250) * 2, C.GOODS[D.out].e); else if (hungry) bubble(x + w / 2, y - 6, '🌾', '#ffe1e1');
  }
  function draw(g, now) {
    if (!cx) return; const s = C.season(g), key = s + ':' + T;
    if (bgKey !== key) { bg = buildBg(s); bgKey = key; }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.fillStyle = SEAS[s].g2; cx.fillRect(0, 0, W, H);
    cx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, -cam.x * cam.z * dpr, -cam.y * cam.z * dpr); cx.imageSmoothingEnabled = true; cx.drawImage(bg, 0, 0);
    // Felder
    const F = C.FIELD; cx.fillStyle = '#8a5a2a'; rr(F.x0 * T - 8, F.y0 * T - 8, F.w * T + 16, F.h * T + 16, 10); cx.globalAlpha = .35; cx.fill(); cx.globalAlpha = 1;
    for (let fy = 0; fy < F.h; fy++) for (let fx2 = 0; fx2 < F.w; fx2++) {
      const x = F.x0 + fx2, y = F.y0 + fy, px = x * T, py = y * T, open = C.fieldOpen(g, fx2, fy), t = C.tile(g, x, y);
      if (!open) { cx.fillStyle = 'rgba(40,60,20,.28)'; cx.fillRect(px + 1, py + 1, T - 2, T - 2); continue; }
      if (!t) { cx.fillStyle = 'rgba(255,255,255,.12)'; cx.fillRect(px + 2, py + 2, T - 4, T - 4); cx.strokeStyle = 'rgba(90,60,20,.35)'; cx.setLineDash([4, 4]); cx.lineWidth = 1.5; cx.strokeRect(px + 3, py + 3, T - 6, T - 6); cx.setLineDash([]); continue; }
      cx.fillStyle = t.wet ? '#5a3a1e' : '#9a6a38'; rr(px + 2, py + 2, T - 4, T - 4, 6); cx.fill(); cx.fillStyle = t.wet ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.1)'; for (let i = 0; i < 3; i++) cx.fillRect(px + 6, py + 10 + i * 12, T - 12, 3);
      if (s === 3 && !t.crop) { cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(px + 4, py + 4, T - 8, 6); }
      if (t.fert) { cx.fillStyle = '#b06aff'; cx.fillRect(px + T - 10, py + 4, 6, 6); }
      if (t.crop) { drawCrop(t, px, py, now, s); if (!t.wet && !t.dead && C.stageOf(t) < 3) { cx.globalAlpha = .9; emoji('💧', px + T - 10, py + 10, 13); cx.globalAlpha = 1; } }
    }
    // Ausbau-Schild
    const nx = C.EXPAND[g.expand + 1]; if (nx) { const e = nx, px = (F.x0 + (e.cols[1] > C.EXPAND[g.expand].cols[1] ? C.EXPAND[g.expand].cols[1] : 0)) * T, py = (F.y0 + (e.rows[1] > C.EXPAND[g.expand].rows[1] ? C.EXPAND[g.expand].rows[1] : 0)) * T;
      cx.fillStyle = 'rgba(0,0,0,.45)'; rr(px + 4, py + 10, T * 2 - 8, 26, 10); cx.fill(); cx.font = 'bold 12px Fredoka,system-ui'; cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('🟫 ' + e.cost + ' 🪙' + ((e.lv || 1) > g.lv ? ' · Lv ' + e.lv : ''), px + T, py + 23); }
    // Gebäude
    const PL = C.PLACES; building(PL.haus, '#f4e1c0', '#c8452a', '🏡', g.name, true, now);
    building(PL.markt, '#ffd27a', '#e04a3a', '🛒', 'Markt', true, now); building(PL.brett, '#c89a5a', '#7a4a24', '📋', g.orders.length ? 'Aufträge ' + g.orders.length : 'Aufträge', true, now);
    Object.keys(C.SHOPS).forEach(k => { const S = g.shops[k], D = C.SHOPS[k]; building(PL[k], '#f0d8b0', ['#3a7ad8', '#d84a8a', '#3aa86a', '#d8782a', '#8a5ad8', '#5a6a7a'][Object.keys(C.SHOPS).indexOf(k)], D.e, S ? D.n : D.lv > g.lv ? '🔒 Lv ' + D.lv : D.n, !!S, now);
      if (S) { const P = PL[k], busy = S.jobs.filter(j => !j.done), done = S.jobs.filter(j => j.done).length; if (done) bubble((P.x + P.w / 2) * T, P.y * T - 4 + Math.sin(now / 250) * 2, C.GOODS[S.jobs.find(j => j.done).out].e);
        else if (busy.length) { const j = busy[0], f = Math.min(1, (now - j.start) / Math.max(1, j.end - j.start)); cx.fillStyle = 'rgba(0,0,0,.5)'; rr(P.x * T + 10, P.y * T - 2, P.w * T - 20, 8, 4); cx.fill(); cx.fillStyle = '#ffd23a'; rr(P.x * T + 11, P.y * T - 1, (P.w * T - 22) * f, 6, 3); cx.fill(); if (k === 'muehle') { cx.save(); cx.translate((P.x + P.w / 2) * T, P.y * T + 14); cx.rotate(now / 400); cx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { cx.rotate(Math.PI / 2); cx.fillRect(-2, 0, 4, 18); } cx.restore(); } } } });
    Object.keys(C.ANIMALS).forEach(a => pen(PL[a], a, g, now));
    // Briefkasten-Hinweis am Brett
    if (g.orders.some(o => C.hasAll(g, o.items))) bubble((PL.brett.x + .5) * T, PL.brett.y * T - 4 + Math.sin(now / 250) * 2, '✅', '#e1ffe1');
    // Cursor
    if (cursor) { const ok = C.canUse(g, cursor.x, cursor.y) || C.placeAt(cursor.x, cursor.y); cx.strokeStyle = ok ? '#fff' : 'rgba(255,255,255,.4)'; cx.lineWidth = 3; cx.setLineDash([8, 5]); cx.lineDashOffset = -now / 60; rr(cursor.x * T + 1, cursor.y * T + 1, T - 2, T - 2, 8); cx.stroke(); cx.setLineDash([]); }
    // Effekte
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i], a = (now - f.t) / 1100; if (a >= 1) { fx.splice(i, 1); continue; } cx.globalAlpha = 1 - a * a; cx.font = 'bold 15px Fredoka,system-ui,sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 4; cx.strokeStyle = 'rgba(0,0,0,.6)'; const y = f.y - a * 34; cx.strokeText(f.txt, f.x, y); cx.fillStyle = f.col || '#fff'; cx.fillText(f.txt, f.x, y); cx.globalAlpha = 1; }
    // Tageszeit und Wetter (Bildschirm)
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const h = hour(g), dark = h < 7 ? (7 - h) / 2 * .4 : h > 19 ? Math.min(.45, (h - 19) / 5 * .45) : 0;
    if (h > 17.5 && h < 20.5) { cx.fillStyle = 'rgba(255,120,40,' + (0.12 * (1 - Math.abs(h - 19) / 1.5)) + ')'; cx.fillRect(0, 0, W, H); }
    if (dark > 0) { cx.fillStyle = 'rgba(15,20,70,' + dark + ')'; cx.fillRect(0, 0, W, H); }
    weather(g, now);
  }
  let lastW = 0;
  function weather(g, now) {
    const w = g.weather, dt = Math.min(50, now - (lastW || now)); lastW = now; if (w === 'sonne' || w === 'wolken') { drops.length = 0; if (w === 'wolken') { cx.fillStyle = 'rgba(120,130,150,.12)'; cx.fillRect(0, 0, W, H); } return; }
    const snow = w === 'schnee', want = snow ? 90 : 140; while (drops.length < want) drops.push({ x: Math.random() * W, y: Math.random() * H, v: snow ? 30 + Math.random() * 30 : 500 + Math.random() * 300, p: Math.random() * 6 });
    cx.fillStyle = 'rgba(60,70,100,.14)'; cx.fillRect(0, 0, W, H); cx.strokeStyle = 'rgba(200,220,255,.55)'; cx.fillStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 1.5; cx.beginPath();
    drops.forEach(d => { d.y += d.v * dt / 1000; d.x += (snow ? Math.sin(now / 700 + d.p) * 12 : -60) * dt / 1000; if (d.y > H) { d.y = -10; d.x = Math.random() * (W + 60); } if (snow) { cx.moveTo(d.x + 2, d.y); cx.arc(d.x, d.y, 2, 0, 7); } else { cx.moveTo(d.x, d.y); cx.lineTo(d.x - 3, d.y + 12); } });
    snow ? cx.fill() : cx.stroke();
    if (w === 'gewitter') { if (Math.random() < .002 * dt / 16) flash = now; if (now - flash < 160) { cx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - (now - flash) / 160)) + ')'; cx.fillRect(0, 0, W, H); } }
  }
  const hour = g => 6 + (g.dayT / C.DAY_MS) * 18;
  function pop(tx, ty, txt, col) { fx.push({ x: (tx + .5) * T, y: ty * T + 8, txt, col, t: Date.now() }); }
  const API = { T, cam, init, resize, draw, fit, center, pan, zoom, toTile, toScreen, follow, pop, hour, setCursor: c => { cursor = c; }, getCursor: () => cursor, reset() { bgKey = ''; } };
  root.SHRender = API;
})(window);
