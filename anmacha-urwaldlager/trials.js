/* Urwaldlager – die fünf Prüfungs-Minispiele (Canvas 2D, Maus & Touch & Tastatur) */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), snd = () => root.USnd || { star() { }, bad() { }, gag() { }, swallow() { }, thud() { }, splash() { }, pad() { }, drum() { }, click() { } };
  const FONT = 'Inter,system-ui,"Segoe UI",Roboto,Arial,sans-serif', EMO = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

  // ---------- Zeichenhelfer ----------
  function starPath(c, x, y, r, rot) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .46 : r; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
  function drawStar(c, x, y, r, rot, glow, a) {
    c.save(); if (a != null) c.globalAlpha = a; if (glow) { c.shadowColor = '#ffcf4a'; c.shadowBlur = glow; }
    starPath(c, x, y, r, rot || 0); const g = c.createLinearGradient(x, y - r, x, y + r); g.addColorStop(0, '#fff6b0'); g.addColorStop(1, '#ffb300'); c.fillStyle = g; c.fill(); c.shadowBlur = 0; c.lineWidth = 2; c.strokeStyle = '#a86a00'; c.stroke(); c.restore();
  }
  function leaf(c, x, y, len, wid, rot, col) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -wid, len, 0); c.quadraticCurveTo(len * .5, wid, 0, 0); c.fill(); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .92, 0); c.stroke(); c.restore(); }
  // vorgerenderter Dschungel-Hintergrund
  function makeBg(W, H, top, bot, seed) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
    let s = seed || 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 26; i++) { const side = r() < .5, x = side ? -10 + r() * W * .18 : W + 10 - r() * W * .18, y = r() * H; leaf(c, x, y, 70 + r() * 110, 14 + r() * 18, (side ? 0 : Math.PI) + (r() - .5) * 1.6, `hsla(${120 + r() * 40},55%,${10 + r() * 16}%,.85)`); }
    const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    return cv;
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function text(c, s, x, y, size, col, align, wt) { c.font = `${wt || 800} ${size}px ${FONT}`; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = col || '#fff'; c.fillText(s, x, y); }
  function emoji(c, s, x, y, size) { c.font = `${size}px ${EMO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
  function hud(g, frac, label) {
    const c = g.ctx, W = g.W, pad = 12, bw = Math.min(W - pad * 2, 520), bx = (W - bw) / 2;
    if (frac != null) {
      c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, bx, 10, bw, 10, 5); c.fill(); c.fillStyle = frac < .25 ? '#ff6b4a' : '#9dff5c'; rr(c, bx, 10, Math.max(0, bw * clamp(frac, 0, 1)), 10, 5); c.fill(); }
    const n = g.max, sz = Math.min(26, (bw - 4) / n - 4), x0 = W / 2 - (n * (sz + 5)) / 2 + sz / 2;
    for (let i = 0; i < n; i++) { const got = i < g.shown; c.save(); if (!got) c.globalAlpha = .28; drawStar(c, x0 + i * (sz + 5), 40, sz / 2, 0, got ? 8 : 0); c.restore(); }
    if (label) text(c, label, W / 2, 68, 14, 'rgba(255,255,255,.85)', 'center', 700);
  }
  // Tiere (nach oben schauend gezeichnet)
  function spider(c, x, y, s, rot, t) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.strokeStyle = '#161616'; c.lineWidth = 2.2; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const w = Math.sin(t * 14 + i * 1.3 + sd) * 4; c.beginPath(); c.moveTo(0, 2); c.lineTo(sd * 13, (i - 1.5) * 8 + w * .5); c.lineTo(sd * 23, (i - 1.5) * 12 + w + 5); c.stroke(); }
    c.fillStyle = '#262626'; c.beginPath(); c.ellipse(0, 5, 8.5, 11, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -8, 6, 0, TAU); c.fill(); c.fillStyle = '#e0412b'; c.fillRect(-3.5, -11, 2.4, 2.4); c.fillRect(1.2, -11, 2.4, 2.4);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(-2, 2, 2.5, 5, 0, 0, TAU); c.fill(); c.restore();
  }
  function roach(c, x, y, s, rot, t) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.strokeStyle = '#4a2a10'; c.lineWidth = 1.8; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { const w = Math.sin(t * 18 + i * 2 + sd) * 3; c.beginPath(); c.moveTo(sd * 5, (i - 1) * 7); c.lineTo(sd * 15, (i - 1) * 9 + w); c.stroke(); }
    c.beginPath(); c.moveTo(-2, -14); c.quadraticCurveTo(-8, -26, -12 + Math.sin(t * 9) * 3, -30); c.moveTo(2, -14); c.quadraticCurveTo(8, -26, 12 - Math.sin(t * 9) * 3, -30); c.stroke();
    const g = c.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#5a2e10'); g.addColorStop(.5, '#a8621f'); g.addColorStop(1, '#5a2e10'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 2, 9.5, 15, 0, 0, TAU); c.fill(); c.fillStyle = '#3a1c08'; c.beginPath(); c.ellipse(0, -12, 6, 5, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 16); c.stroke(); c.restore();
  }
  function worm(c, x, y, s, rot, t) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); for (let i = 0; i < 9; i++) { const yy = i * 7 - 28, xx = Math.sin(t * 8 + i * .8) * 5; c.fillStyle = i % 2 ? '#e48a9a' : '#d06a7d'; c.beginPath(); c.arc(xx, yy, 6.2 - i * .18, 0, TAU); c.fill(); }
    c.fillStyle = '#f3a7b3'; c.beginPath(); c.arc(Math.sin(t * 8 - 4) * 5, -29, 6.4, 0, TAU); c.fill(); c.fillStyle = '#222'; c.fillRect(-4 + Math.sin(t * 8 - 4) * 5, -31, 2, 2); c.fillRect(2 + Math.sin(t * 8 - 4) * 5, -31, 2, 2); c.restore();
  }
  const BUGS = [spider, roach, worm];
  // einfacher Mini-Charakter / Gesicht
  function face(c, x, y, r, skin, mood, hair) {
    c.save(); c.translate(x, y); c.fillStyle = skin; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
    if (hair) { c.fillStyle = hair; c.beginPath(); c.arc(0, -r * .12, r * 1.02, Math.PI * 1.06, Math.PI * 1.94); c.quadraticCurveTo(0, -r * .35, -r * .98, -r * .1); c.fill(); }
    if (mood === 'gag') { c.fillStyle = 'rgba(130,210,70,.45)'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); }
    c.strokeStyle = '#222'; c.fillStyle = '#222'; c.lineWidth = Math.max(1.5, r * .07); c.lineCap = 'round';
    const ey = -r * .12, ex = r * .36;
    if (mood === 'gag' || mood === 'chew') { for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * ex - r * .16, ey + r * .04); c.quadraticCurveTo(sd * ex, ey - r * .12, sd * ex + r * .16, ey + r * .04); c.stroke(); } }
    else { for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * ex, ey, r * .09, 0, TAU); c.fill(); } }
    c.beginPath(); if (mood === 'gag') { c.fillStyle = '#6a1e1e'; c.ellipse(0, r * .45, r * .32, r * .2, 0, 0, TAU); c.fill(); } else if (mood === 'chew') { c.arc(0, r * .38, r * .2, 0, TAU); c.stroke(); } else if (mood === 'sad') { c.arc(0, r * .62, r * .26, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } else { c.arc(0, r * .26, r * .3, .2, Math.PI - .2); c.stroke(); }
    c.restore();
  }

  // ---------- Prüfungs-Spiele ----------
  const T = {};

  // 1) Krabbelkiste – Sterne antippen, Tiere meiden
  T.kiste = g => {
    const dur = g.short ? 16 : 26, full = Math.round(dur * .78), need = i => Math.max(1, Math.round(full * (i + 1) / g.max));
    let stars = [], bugs = [], pts = 0, st = 0, bt = 0, shake = 0, fx = [], bg = null, lost = 0, hitMsg = 0;
    const life = 2.0 * (1 - g.handi * .45);
    function spawnStar() { const m = 54; stars.push({ x: rnd(m, g.W - m), y: rnd(100, g.H - m), r: 24 + rnd(0, 6), a: 0, life, rot: rnd(0, 6) }); }
    function spawnBug() { const k = Math.floor(rnd(0, 3)), side = Math.floor(rnd(0, 4)); let x, y, d; const W = g.W, H = g.H; if (side === 0) { x = -30; y = rnd(110, H); d = rnd(-.4, .4); } else if (side === 1) { x = W + 30; y = rnd(110, H); d = Math.PI + rnd(-.4, .4); } else if (side === 2) { x = rnd(0, W); y = H + 30; d = -Math.PI / 2 + rnd(-.4, .4); } else { x = rnd(0, W); y = 80; d = Math.PI / 2 + rnd(-.4, .4); } bugs.push({ k, x, y, d, sp: rnd(70, 140), s: 1.1 + rnd(0, .5), t: rnd(0, 5) }); }
    return {
      dbg: () => ({ stars, bugs, pts }),
      init() { bg = makeBg(g.W, g.H, '#2a1a0c', '#0f0a05', 3); },
      resize() { bg = makeBg(g.W, g.H, '#2a1a0c', '#0f0a05', 3); },
      update(dt) {
        g.time += dt; st -= dt; bt -= dt; shake = Math.max(0, shake - dt);
        if (st <= 0) { spawnStar(); st = rnd(.42, .75) * (1 + g.handi * .3); }
        if (bt <= 0) { spawnBug(); bt = rnd(.7, 1.3); }
        stars.forEach(s => { s.a = Math.min(1, s.a + dt * 6); s.life -= dt; }); stars = stars.filter(s => s.life > 0);
        bugs.forEach(b => { b.x += Math.cos(b.d) * b.sp * dt; b.y += Math.sin(b.d) * b.sp * dt; b.t += dt; b.d += Math.sin(b.t * 3) * dt * .8; }); bugs = bugs.filter(b => b.x > -60 && b.x < g.W + 60 && b.y > 60 && b.y < g.H + 60);
        fx.forEach(f => { f.t += dt; }); fx = fx.filter(f => f.t < .6); hitMsg = Math.max(0, hitMsg - dt);
        g.shown = 0; for (let i = 0; i < g.max; i++) if (pts >= need(i)) g.shown = i + 1;
        g.frac = 1 - g.time / dur; if (g.time >= dur) g.end();
      },
      pointer(t, x, y) {
        if (t !== 'down') return;
        for (let i = bugs.length - 1; i >= 0; i--) { const b = bugs[i]; if (Math.hypot(b.x - x, b.y - y) < 30 * b.s) { shake = .35; g.time += 1.6; lost++; hitMsg = .8; fx.push({ x, y, t: 0, bad: 1 }); snd().gag(); bugs.splice(i, 1); return; } }
        for (let i = stars.length - 1; i >= 0; i--) { const s = stars[i]; if (Math.hypot(s.x - x, s.y - y) < s.r + 14) { pts++; fx.push({ x: s.x, y: s.y, t: 0 }); snd().star(); stars.splice(i, 1); return; } }
      },
      draw(c) {
        c.save(); if (shake) c.translate(rnd(-5, 5) * shake * 3, rnd(-5, 5) * shake * 3);
        c.drawImage(bg, 0, 0, g.W, g.H);
        // Holzkisten-Rahmen
        c.strokeStyle = '#7a4a1e'; c.lineWidth = 14; c.strokeRect(7, 78, g.W - 14, g.H - 85); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 3; c.strokeRect(14, 85, g.W - 28, g.H - 99);
        stars.forEach(s => drawStar(c, s.x, s.y, s.r * (.9 + Math.sin(g.time * 8 + s.rot) * .06), Math.sin(g.time * 3 + s.rot) * .25, 18, s.a * Math.min(1, s.life * 2)));
        bugs.forEach(b => BUGS[b.k](c, b.x, b.y, b.s, b.d + Math.PI / 2, b.t));
        fx.forEach(f => { const k = f.t / .6; c.globalAlpha = 1 - k; if (f.bad) text(c, 'IIIH!', f.x, f.y - k * 40, 26, '#8fd14f', 'center', 900); else { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(f.x + Math.cos(a) * k * 40, f.y + Math.sin(a) * k * 40, 4 * (1 - k), 0, TAU); c.fill(); } } c.globalAlpha = 1; });
        c.restore(); hud(g, g.frac, hitMsg > 0 ? 'Iiiih! −1,6 Sekunden' : 'Tippe Sterne – Finger weg von den Krabbeltieren!');
      }
    };
  };

  // 2) Wackelbrücke – Balance halten
  T.bruecke = g => {
    const n = g.max, gap = g.short ? 320 : 380, startX = 420, total = startX + n * gap + 260, speed = 105;
    let b = 0, vb = 0, pos = 0, falls = 0, fallT = 0, inp = 0, got = new Array(n).fill(false), msg = 0, bg = null, bats = [];
    const keys = { l: 0, r: 0 }, ptr = { x: null };
    const sk = g.opt.skin || '#e8b98f', hair = g.opt.hair || '#3b2a1c', top = g.opt.top || '#2a9d8f';
    return {
      dbg: () => ({ b, pos, falls }),
      init() { bg = makeBg(g.W, g.H, '#3b1c36', '#10331f', 11); for (let i = 0; i < 5; i++) bats.push({ x: rnd(0, g.W), y: rnd(90, g.H * .4), s: rnd(.6, 1.1), t: rnd(0, 6) }); },
      resize() { bg = makeBg(g.W, g.H, '#3b1c36', '#10331f', 11); },
      key(d, k) { if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = d; if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = d; },
      pointer(t, x) { if (t === 'down' || t === 'move') ptr.x = (t === 'move' && ptr.x == null) ? null : x; if (t === 'up') ptr.x = null; },
      update(dt) {
        g.time += dt; inp = (keys.r - keys.l) || (ptr.x != null ? (ptr.x > g.W / 2 ? 1 : -1) : 0);
        const wind = (Math.sin(g.time * .9) * .8 + Math.sin(g.time * 2.3 + 1) * .6 + Math.sin(g.time * 5.1) * .2) * (1 + g.handi * .7);
        if (fallT > 0) { fallT -= dt; if (fallT <= 0) { b = 0; vb = 0; pos = Math.max(0, pos - 70); } }
        else {
          vb += (b * 1.25 + wind * .55 + inp * 2.5) * dt; vb *= 1 - .55 * dt; b += vb * dt; pos += speed * dt * (Math.abs(b) < .6 ? 1 : .55);
          if (Math.abs(b) >= 1) { falls++; fallT = 1.1; snd().thud(); snd().splash(); msg = 1.1; if (falls >= 3) { g.shown = got.filter(Boolean).length; g.end(); return; } }
          for (let i = 0; i < n; i++) if (!got[i] && pos >= startX + i * gap - 22) { if (Math.abs(b) < .55) { got[i] = true; snd().star(); } else got[i] = null; }
        }
        bats.forEach(a => { a.t += dt; a.x -= 40 * a.s * dt; if (a.x < -30) a.x = g.W + 30; });
        msg = Math.max(0, msg - dt); g.shown = got.filter(Boolean).length; g.frac = 1 - falls / 3; if (pos >= total - 120) g.end();
      },
      draw(c) {
        const W = g.W, H = g.H, cx = W * .3, by = H * .62; c.drawImage(bg, 0, 0, W, H);
        // Glut der Schlucht
        const lg = c.createLinearGradient(0, H * .78, 0, H); lg.addColorStop(0, 'rgba(255,90,40,0)'); lg.addColorStop(1, 'rgba(255,110,40,.55)'); c.fillStyle = lg; c.fillRect(0, H * .78, W, H * .22);
        bats.forEach(a => { c.fillStyle = '#12091a'; const f = Math.sin(a.t * 14) * 7; c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(a.x - 14 * a.s, a.y - 10 * a.s - f, a.x - 26 * a.s, a.y); c.quadraticCurveTo(a.x - 12 * a.s, a.y + 4, a.x, a.y + 6); c.quadraticCurveTo(a.x + 12 * a.s, a.y + 4, a.x + 26 * a.s, a.y); c.quadraticCurveTo(a.x + 14 * a.s, a.y - 10 * a.s - f, a.x, a.y); c.fill(); });
        const sway = Math.sin(g.time * 1.4) * 4, off = (x) => cx + (x - pos);
        // Seile
        c.strokeStyle = '#7a5a2e'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, by - 70 + sway); c.lineTo(W, by - 70 - sway); c.stroke(); c.beginPath(); c.moveTo(0, by + 10 + sway); c.lineTo(W, by + 10 - sway); c.stroke();
        for (let x = -((pos % 60) + 60); x < W + 60; x += 60) { const px = x, k = px / W; c.fillStyle = '#6b4a22'; c.fillRect(px, by + 8 + (sway - 2 * sway * k), 46, 9); c.strokeStyle = 'rgba(90,60,25,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 6, by - 68 + (sway - 2 * sway * k)); c.lineTo(px + 6, by + 8 + (sway - 2 * sway * k)); c.stroke(); }
        // Sterne
        for (let i = 0; i < n; i++) { const sx = off(startX + i * gap); if (sx < -40 || sx > W + 40 || got[i] === true) continue; if (got[i] === null) { c.globalAlpha = .35; } drawStar(c, sx, by - 62 + Math.sin(g.time * 3 + i) * 5, 22, g.time + i, got[i] === null ? 0 : 16); c.globalAlpha = 1; }
        // Figur
        const fy = by + 8 + sway * .3, ang = b * .62; c.save(); c.translate(cx, fy + (fallT > 0 ? Math.pow(1.1 - fallT, 2) * 420 : 0)); if (fallT > 0) c.rotate((1.1 - fallT) * 5); else c.rotate(ang);
        c.strokeStyle = '#222'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-8 + Math.sin(g.time * 8) * 4, 18); c.moveTo(6, 0); c.lineTo(8 - Math.sin(g.time * 8) * 4, 18); c.stroke();
        c.fillStyle = top; rr(c, -12, -38, 24, 40, 8); c.fill(); c.strokeStyle = sk; c.lineWidth = 5; c.beginPath(); c.moveTo(-12, -30); c.lineTo(-30, -38 - b * 12); c.moveTo(12, -30); c.lineTo(30, -38 + b * 12); c.stroke();
        face(c, 0, -52, 15, sk, fallT > 0 || Math.abs(b) > .7 ? 'gag' : 'n', hair); c.restore();
        // Balance-Anzeige
        const mw = Math.min(W - 40, 300), mx = (W - mw) / 2, my = H - 40; c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, mx, my, mw, 14, 7); c.fill(); c.fillStyle = 'rgba(157,255,92,.4)'; c.fillRect(mx + mw * .5 - mw * .13, my, mw * .26, 14); c.fillStyle = Math.abs(b) > .7 ? '#ff6b4a' : '#fff'; c.beginPath(); c.arc(mx + mw * (.5 + clamp(b, -1, 1) * .5), my + 7, 11, 0, TAU); c.fill();
        text(c, '◀', mx - 16, my + 7, 18, '#fff'); text(c, '▶', mx + mw + 16, my + 7, 18, '#fff');
        if (msg > 0) text(c, 'PLUMPS!', W / 2, H * .35, 40, '#ff8a5a', 'center', 900);
        const lives = '❤'.repeat(3 - falls) + '♡'.repeat(falls); hud(g, null, 'Gegensteuern! Leben: ' + lives);
      }
    };
  };

  // 3) Schleimbecken – tauchen & Sterne holen
  T.schleim = g => {
    const dur = g.short ? 20 : 30, spawnEvery = 1.7, total = Math.floor(dur / spawnEvery), need = i => Math.max(1, Math.round(total * .55 * (i + 1) / g.max));
    let px = 0.5, tx = .5, py = 0, vy = 0, air = 1, hold = false, gasp = 0, items = [], eels = [], bub = [], st = .4, et = 2, pts = 0, inv = 0, bg = null, fx = [], key = { l: 0, r: 0, d: 0 };
    const sk = g.opt.skin || '#e8b98f', hair = g.opt.hair || '#3b2a1c';
    const top = () => g.H * .22, bot = () => g.H * .92;
    return {
      dbg: () => ({ items, px, py, tp: top(), bt: bot(), air }),
      init() { bg = makeBg(g.W, g.H, '#1f4a1a', '#0d2a0a', 5); },
      resize() { bg = makeBg(g.W, g.H, '#1f4a1a', '#0d2a0a', 5); },
      key(d, k) { if (k === 'ArrowLeft' || k === 'a') key.l = d; if (k === 'ArrowRight' || k === 'd') key.r = d; if (k === 'ArrowDown' || k === ' ' || k === 's') key.d = d; },
      pointer(t, x) { if (x != null) tx = clamp(x / g.W, .06, .94); if (t === 'down') hold = true; if (t === 'up') hold = false; },
      update(dt) {
        g.time += dt; st -= dt; et -= dt; inv = Math.max(0, inv - dt); gasp = Math.max(0, gasp - dt);
        if (key.l || key.r) tx = clamp(tx + (key.r - key.l) * dt * .7, .06, .94);
        px += (tx - px) * Math.min(1, dt * 6); const dive = (hold || key.d) && gasp <= 0 && air > 0;
        vy += ((dive ? 1 : -1.3) * 400 - vy * 2.2) * dt * 1.4; py = clamp(py + vy * dt / (bot() - top()), 0, 1);
        const under = py > .03; if (under) air -= dt * (.075 + .06 * py) * (1 + g.handi * .5); else air = Math.min(1, air + dt * .7);
        if (air <= 0 && under) { air = 0; gasp = 1.6; g.time += 1.5; fx.push({ x: px * g.W, y: top() + py * (bot() - top()), t: 0, bad: 1 }); snd().gag(); }
        if (gasp > 0) { hold = false; } if (gasp > 0 && !under) air = Math.min(1, air + dt * .5);
        if (st <= 0) { items.push({ x: rnd(.08, .92), d: rnd(.3, 1), life: 7, a: 0, rot: rnd(0, 6) }); st = spawnEvery; }
        if (et <= 0) { const dir = Math.random() < .5 ? 1 : -1; eels.push({ x: dir > 0 ? -.08 : 1.08, d: rnd(.2, .95), dir, sp: rnd(.12, .22), t: 0 }); et = rnd(1.6, 2.6); }
        items.forEach(i => { i.a = Math.min(1, i.a + dt * 4); i.life -= dt; }); items = items.filter(i => i.life > 0);
        eels.forEach(e => { e.x += e.dir * e.sp * dt; e.t += dt; }); eels = eels.filter(e => e.x > -.15 && e.x < 1.15);
        const ay = top() + py * (bot() - top());
        for (let i = items.length - 1; i >= 0; i--) { const it = items[i], iy = top() + it.d * (bot() - top()); if (Math.hypot(it.x * g.W - px * g.W, iy - ay) < 36) { pts++; items.splice(i, 1); fx.push({ x: it.x * g.W, y: iy, t: 0 }); snd().star(); } }
        if (!inv) eels.forEach(e => { const ey = top() + e.d * (bot() - top()); if (Math.hypot(e.x * g.W - px * g.W, ey - ay) < 34) { air = Math.max(0, air - .2); inv = 1; fx.push({ x: px * g.W, y: ay, t: 0, bad: 1 }); snd().bad(); } });
        if (Math.random() < dt * 6) bub.push({ x: px * g.W + rnd(-8, 8), y: ay - 10, v: rnd(30, 70), a: 1 }); bub.forEach(b => { b.y -= b.v * dt; b.a -= dt * .5; }); bub = bub.filter(b => b.a > 0 && b.y > top() - 10);
        fx.forEach(f => f.t += dt); fx = fx.filter(f => f.t < .6);
        g.shown = 0; for (let i = 0; i < g.max; i++) if (pts >= need(i)) g.shown = i + 1;
        g.frac = 1 - g.time / dur; if (g.time >= dur) g.end();
      },
      draw(c) {
        const W = g.W, H = g.H; c.drawImage(bg, 0, 0, W, H);
        // Becken
        const tp = top(); c.fillStyle = '#2a5a1e'; c.fillRect(0, 0, W, tp - 6); c.fillStyle = '#5c3b1a'; c.fillRect(0, tp - 18, W, 14);
        const sg = c.createLinearGradient(0, tp, 0, H); sg.addColorStop(0, 'rgba(120,230,70,.88)'); sg.addColorStop(1, 'rgba(30,120,30,.96)'); c.fillStyle = sg; c.fillRect(8, tp, W - 16, H - tp - 6);
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 3; c.beginPath(); for (let x = 8; x <= W - 8; x += 8) c.lineTo(x, tp + Math.sin(x * .05 + g.time * 2) * 3); c.stroke();
        bub.forEach(b => { c.strokeStyle = `rgba(255,255,255,${b.a * .6})`; c.lineWidth = 1.6; c.beginPath(); c.arc(b.x, b.y, 4 + (1 - b.a) * 3, 0, TAU); c.stroke(); });
        items.forEach(it => drawStar(c, it.x * W, tp + it.d * (H * .92 - tp) + Math.sin(g.time * 2 + it.rot) * 4, 22, g.time * .8 + it.rot, 14, it.a * Math.min(1, it.life)));
        eels.forEach(e => { const ey = tp + e.d * (H * .92 - tp), x0 = e.x * W; c.save(); c.translate(x0, ey); c.scale(e.dir, 1); c.fillStyle = '#2a0f26'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-i * 9, Math.sin(e.t * 9 - i * .7) * 5, 9 - i * .8, 7 - i * .6, 0, 0, TAU); c.fill(); } c.fillStyle = '#ff5a6a'; c.beginPath(); c.arc(4, -2, 2.4, 0, TAU); c.fill(); c.restore(); });
        // Taucher
        const ay = tp + py * (H * .92 - tp), ax = px * W; c.save(); if (inv > 0 && Math.floor(g.time * 14) % 2) c.globalAlpha = .45; face(c, ax, ay, 19, sk, gasp > 0 ? 'gag' : air < .25 ? 'sad' : 'n', hair); c.strokeStyle = '#1d3a8a'; c.lineWidth = 4; c.beginPath(); c.arc(ax - 7, ay - 2, 6.5, 0, TAU); c.arc(ax + 7, ay - 2, 6.5, 0, TAU); c.stroke(); c.fillStyle = 'rgba(160,220,255,.35)'; c.beginPath(); c.arc(ax - 7, ay - 2, 6, 0, TAU); c.arc(ax + 7, ay - 2, 6, 0, TAU); c.fill(); c.restore();
        fx.forEach(f => { const k = f.t / .6; c.globalAlpha = 1 - k; if (f.bad) text(c, gasp > 0 ? 'LUFT!' : 'BLUTEGEL!', f.x, f.y - 30 - k * 30, 22, '#ff8a8a', 'center', 900); else { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(f.x + Math.cos(a) * k * 40, f.y + Math.sin(a) * k * 40, 4 * (1 - k), 0, TAU); c.fill(); } } c.globalAlpha = 1; });
        // Luft-Anzeige
        const bx = W - 34, bh = Math.min(160, H * .4), by = H - bh - 22; c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, bx, by, 16, bh, 8); c.fill(); c.fillStyle = air < .3 ? '#ff6b4a' : '#7fd8ff'; const h2 = bh * air; rr(c, bx, by + bh - h2, 16, Math.max(2, h2), 8); c.fill(); text(c, 'LUFT', bx + 8, by - 10, 11, '#fff');
        hud(g, g.frac, gasp > 0 ? 'Japs! Du musst erst nach oben.' : 'Halten = tauchen · loslassen = auftauchen · Zeiger = schwimmen');
      }
    };
  };

  // 4) Tierstimmen-Echo – Reihenfolge merken
  T.echo = g => {
    const n = g.max, PADS = [{ e: '🦜', c: '#33c26b', n: 'Papagei' }, { e: '🐸', c: '#e0c030', n: 'Frosch' }, { e: '🐆', c: '#ff8a2a', n: 'Jaguar' }, { e: '🐒', c: '#e8508a', n: 'Äffchen' }];
    let round = 0, seq = [], state = 'wait', step = 0, tm = 1, lit = -1, litT = 0, lives = 2, bugsA = [], fogT = 0, bg = null, msg = '', msgT = 0, pi = 0;
    const base = g.short ? 2 : 2, mk = () => { seq = []; for (let i = 0; i < base + round; i++) seq.push(Math.floor(rnd(0, 4))); };
    const rects = () => { const s = Math.min(g.W - 40, g.H - 190, 460), gp = 14, p = (s - gp) / 2, x0 = (g.W - s) / 2, y0 = 92 + (g.H - 92 - s) / 2 - 10; return [0, 1, 2, 3].map(i => ({ x: x0 + (i % 2) * (p + gp), y: y0 + Math.floor(i / 2) * (p + gp), w: p, h: p })); };
    function press(i) { lit = i; litT = .28; snd().pad(i); }
    return {
      dbg: () => ({ seq, state, pi, rects: rects(), round }),
      init() { mk(); bg = makeBg(g.W, g.H, '#1c3a2a', '#08150e', 9); tm = 1.0; state = 'wait'; },
      resize() { bg = makeBg(g.W, g.H, '#1c3a2a', '#08150e', 9); },
      key(d, k) { if (!d) return; const m = { '1': 0, '2': 1, '3': 2, '4': 3, q: 0, w: 1, e: 2, r: 3 }[k]; if (m != null) this.tap(m); },
      pointer(t, x, y) { if (t !== 'down') return; const r = rects(); for (let i = 0; i < 4; i++) if (x >= r[i].x && x <= r[i].x + r[i].w && y >= r[i].y && y <= r[i].y + r[i].h) { this.tap(i); return; } },
      tap(i) {
        if (state !== 'input') return; press(i);
        if (seq[pi] === i) { pi++; if (pi >= seq.length) { round++; g.shown = round; snd().star(); msg = 'Richtig!'; msgT = .8; state = 'wait'; tm = .9; if (round >= n) { g.end(); } } }
        else { lives--; snd().bad(); msg = lives > 0 ? 'Falsch! Nochmal zuhören…' : 'Zu viele Fehler'; msgT = 1; if (lives <= 0) { g.shown = round; state = 'dead'; tm = .9; } else { state = 'wait'; tm = 1.1; } }
      },
      update(dt) {
        g.time += dt; litT = Math.max(0, litT - dt); if (!litT) lit = -1; msgT = Math.max(0, msgT - dt); fogT += dt;
        if (Math.random() < dt * (round >= 2 ? .8 : .2)) bugsA.push({ k: Math.floor(rnd(0, 3)), x: rnd(0, 1), y: -.05, sp: rnd(.08, .16), t: 0, d: rnd(.9, 1.5) });
        bugsA.forEach(b => { b.y += b.sp * dt; b.x += Math.sin(b.t * 2) * .01; b.t += dt; }); bugsA = bugsA.filter(b => b.y < 1.1);
        if (state === 'wait') { tm -= dt; if (tm <= 0) { pi = 0; step = 0; if (round >= 0 && (!seq.length || pi === 0 && seq.length < base + round)) mk(); state = 'show'; tm = .35; } }
        else if (state === 'show') { tm -= dt; if (tm <= 0) { if (step < seq.length) { press(seq[step]); step++; tm = Math.max(.34, .66 - round * .05 - g.handi * 0); } else { state = 'input'; pi = 0; } } }
        else if (state === 'dead') { tm -= dt; if (tm <= 0) g.end(); }
        g.frac = lives / 2;
      },
      draw(c) {
        const W = g.W, H = g.H; c.drawImage(bg, 0, 0, W, H); const r = rects();
        r.forEach((p, i) => { const on = lit === i, col = PADS[i].c; c.save(); if (on) { c.shadowColor = col; c.shadowBlur = 40; } const gr = c.createLinearGradient(p.x, p.y, p.x, p.y + p.h); gr.addColorStop(0, on ? '#ffffff' : col); gr.addColorStop(1, on ? col : 'rgba(0,0,0,.55)'); c.fillStyle = gr; c.globalAlpha = on ? 1 : .75; rr(c, p.x, p.y, p.w, p.h, 26); c.fill(); c.restore(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 3; rr(c, p.x, p.y, p.w, p.h, 26); c.stroke(); c.fillStyle = '#fff'; emoji(c, PADS[i].e, p.x + p.w / 2, p.y + p.h / 2 - 8, Math.min(p.w * .42, 80) * (on ? 1.15 : 1)); text(c, PADS[i].n + '  [' + (i + 1) + ']', p.x + p.w / 2, p.y + p.h - 20, 13, 'rgba(255,255,255,.9)', 'center', 700); });
        bugsA.forEach(b => BUGS[b.k](c, b.x * W, b.y * H, .9, Math.PI, b.t * 2));
        if (round >= 3) { c.fillStyle = `rgba(190,230,200,${.1 + Math.sin(fogT * 1.3) * .08})`; c.fillRect(0, 0, W, H); }
        const lv = '❤'.repeat(lives) + '♡'.repeat(2 - lives), who = state === 'input' ? 'Du bist dran!' : state === 'show' ? 'Gut zuhören…' : '', ln = `Runde ${Math.min(round + 1, n)}/${n} · Leben ${lv}`;
        if (msgT > 0) text(c, msg, W / 2, 86 + 12, 20, msg === 'Richtig!' ? '#9dff5c' : '#ff8a5a', 'center', 900);
        hud(g, null, ln + (who ? ' · ' + who : ''));
      }
    };
  };

  // 5) Delikatessen-Dinner – Timing
  T.fress = g => {
    const n = g.max, names = ['Mehlwurm-Mousse', 'Fischaugen-Gelee', 'Gebratene Heuschrecken', 'Käferlarven-Pralinen', 'Würmer-Spaghetti', 'Dreitage-Fischsoße', 'Schleimiger Kaktus-Smoothie', 'Krabbelkäfer-Knusper'];
    const order = names.map((nn, i) => ({ n: nn, k: i % 5 })).sort(() => Math.random() - .5);
    let d = 0, c0 = 0, dir = 1, zc = .5, zw = .22, gags = 0, state = 'aim', tm = 0, mood = 'n', res = '', bg = null, got = 0, wait = 0;
    const sk = g.opt.skin || '#e8b98f', hair = g.opt.hair || '#3b2a1c';
    const speed = () => (.8 + d * .2) * (1 + g.handi * .25), setup = () => { zw = Math.max(.1, .23 - d * .022) * (1 - g.handi * .3); zc = rnd(.2 + zw / 2, .8 - zw / 2); c0 = 0; dir = 1; wait = 0; state = 'aim'; };
    function dish(c, x, y, s, i, t) {
      c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#f2f2f2'; c.beginPath(); c.ellipse(0, 20, 110, 34, 0, 0, TAU); c.fill(); c.fillStyle = '#d9d9d9'; c.beginPath(); c.ellipse(0, 18, 82, 22, 0, 0, TAU); c.fill();
      const k = i % 5;
      if (k === 0) { c.fillStyle = '#e9d9a0'; for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(Math.cos(j) * 40, Math.sin(j) * 8 + 4 - j * 3, 17, 0, TAU); c.fill(); } c.fillStyle = '#c8b57a'; for (let j = 0; j < 9; j++) c.fillRect(-45 + j * 11, -8 - (j % 3) * 3, 3, 8); }
      else if (k === 1) { c.fillStyle = 'rgba(120,220,160,.85)'; rr(c, -48, -26, 96, 46, 20); c.fill(); for (let j = 0; j < 3; j++) { c.fillStyle = '#fff'; c.beginPath(); c.arc(-28 + j * 28, -4, 10, 0, TAU); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(-28 + j * 28 + Math.sin(t * 3 + j) * 2, -4, 4.5, 0, TAU); c.fill(); } }
      else if (k === 2) { c.strokeStyle = '#7a5a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-70, 6); c.lineTo(70, -30); c.stroke(); for (let j = 0; j < 4; j++) { c.fillStyle = '#9b6a26'; c.beginPath(); c.ellipse(-48 + j * 28, -4 - j * 7, 15, 7, -.28, 0, TAU); c.fill(); c.strokeStyle = '#5a3a14'; c.beginPath(); c.moveTo(-54 + j * 28, -10 - j * 7); c.lineTo(-62 + j * 28, -18 - j * 7); c.stroke(); } }
      else if (k === 3) { for (let j = 0; j < 6; j++) { c.fillStyle = j % 2 ? '#3a1d10' : '#4d2a18'; c.beginPath(); c.ellipse(-50 + j * 20, -2 + Math.sin(j * 2) * 6, 13, 9, 0, 0, TAU); c.fill(); c.fillStyle = '#f0e0c0'; c.fillRect(-52 + j * 20, -8 + Math.sin(j * 2) * 6, 5, 3); } }
      else { c.strokeStyle = '#e8a0b0'; c.lineWidth = 7; c.lineCap = 'round'; for (let j = 0; j < 7; j++) { c.beginPath(); c.moveTo(-50, 4 + j * 2 - 10); for (let x = -50; x <= 50; x += 10) c.lineTo(x, Math.sin(x * .12 + j + t * 2) * 8 - 8 + j * 2); c.stroke(); } }
      c.restore();
    }
    return {
      dbg: () => ({ c0, zc, zw, state }),
      init() { bg = makeBg(g.W, g.H, '#3a1220', '#150810', 13); setup(); },
      resize() { bg = makeBg(g.W, g.H, '#3a1220', '#150810', 13); },
      key(dn, k) { if (dn && (k === ' ' || k === 'Enter')) this.go(); },
      pointer(t) { if (t === 'down') this.go(); },
      go() {
        if (state !== 'aim') return; const dist = Math.abs(c0 - zc);
        if (dist <= zw / 2) { state = 'eat'; tm = .9; mood = 'chew'; res = 'Runter damit!'; got++; g.shown = got; snd().swallow(); }
        else if (dist <= zw / 2 + .09) { state = 'eat'; tm = 1; mood = 'gag'; res = 'Würg… gerade so geschafft'; snd().gag(); }
        else { gags++; state = 'eat'; tm = 1.2; mood = 'gag'; res = 'BÄH! Ausgespuckt!'; snd().gag(); }
      },
      update(dt) {
        g.time += dt;
        if (state === 'aim') { c0 += dir * speed() * dt; if (c0 > 1) { c0 = 1; dir = -1; } if (c0 < 0) { c0 = 0; dir = 1; } wait += dt; if (wait > 7) this.go(); mood = 'n'; }
        else { tm -= dt; if (tm <= 0) { if (gags >= 3) { g.end(); return; } d++; if (d >= n) { g.end(); return; } setup(); } }
        g.frac = 1 - gags / 3;
      },
      draw(c) {
        const W = g.W, H = g.H, cx = W / 2; c.drawImage(bg, 0, 0, W, H);
        // Tisch
        c.fillStyle = '#4a2a14'; c.fillRect(0, H * .56, W, H * .44); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, H * .56, W, 6);
        const gone = state === 'eat' && mood === 'chew' && tm < .55; if (!gone) dish(c, cx, H * .5, Math.min(1.25, W / 360), order[d % order.length].k, g.time);
        text(c, order[d % order.length].n, cx, H * .27 - 6, Math.min(26, W / 14), '#ffd9a0', 'center', 900); text(c, `Gang ${Math.min(d + 1, n)} von ${n}`, cx, H * .27 + 20, 14, 'rgba(255,255,255,.65)', 'center', 700);
        face(c, cx, H * .83, Math.min(48, H * .1), sk, state === 'eat' ? mood : (c0 > zc - zw && c0 < zc + zw ? 'sad' : 'n'), hair);
        // Schieber
        const bw = Math.min(W - 40, 420), bx = cx - bw / 2, by = H * .68; c.fillStyle = 'rgba(0,0,0,.55)'; rr(c, bx, by, bw, 24, 12); c.fill(); c.fillStyle = 'rgba(255,200,80,.35)'; c.fillRect(bx + bw * (zc - zw / 2 - .09), by, bw * (zw + .18), 24); c.fillStyle = '#58d65a'; c.fillRect(bx + bw * (zc - zw / 2), by, bw * zw, 24);
        c.fillStyle = '#fff'; rr(c, bx + bw * c0 - 5, by - 7, 10, 38, 5); c.fill();
        if (state === 'eat') text(c, res, cx, H * .6 + 4, Math.min(24, W / 16), mood === 'chew' ? '#9dff5c' : '#ff9a7a', 'center', 900);
        else text(c, 'Tippen, wenn der Schieber im Grünen ist!', cx, by + 52, 14, 'rgba(255,255,255,.75)', 'center', 700);
        const wl = '🤢'.repeat(gags); hud(g, g.frac, 'Würgeanfälle: ' + (wl || '–') + ' / 3');
      }
    };
  };

  // ---------- Laufzeit ----------
  function run(id, cv, opt, done) {
    opt = opt || {}; const ctx = cv.getContext('2d'), max = opt.max || 6;
    const g = { ctx, W: 300, H: 300, time: 0, max, shown: 0, frac: 1, opt, short: !!opt.short, handi: clamp(opt.handi || 0, 0, .6), end: null };
    let stopped = false, raf = 0, last = 0, phase = 'count', cd = 3.2, over = 0, game = null;
    function fit() { const r = cv.getBoundingClientRect(), dpr = Math.min(2, root.devicePixelRatio || 1); g.W = Math.max(240, r.width); g.H = Math.max(240, r.height); cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (game && game.resize) game.resize(); }
    g.end = () => { if (phase === 'play') { phase = 'over'; over = 1.1; } };
    fit(); game = T[id](g); game.init && game.init(); fit();
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const pd = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { } const [x, y] = pos(e); if (phase === 'play' && game.pointer) game.pointer('down', x, y); };
    const pm = e => { const [x, y] = pos(e); if (phase === 'play' && game.pointer) game.pointer('move', x, y); };
    const pu = e => { const [x, y] = pos(e); if (game.pointer) game.pointer('up', x, y); };
    const kd = e => { if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) e.preventDefault(); if (phase === 'play' && game.key) game.key(1, e.key); };
    const ku = e => { if (game.key) game.key(0, e.key); };
    cv.addEventListener('pointerdown', pd); cv.addEventListener('pointermove', pm); cv.addEventListener('pointerup', pu); cv.addEventListener('pointercancel', pu); root.addEventListener('keydown', kd); root.addEventListener('keyup', ku); root.addEventListener('resize', fit);
    function frame(ts) {
      if (stopped) return; const dt = Math.min(.05, last ? (ts - last) / 1000 : .016); last = ts;
      try {
        if (phase === 'count') { cd -= dt; if (cd <= 0) phase = 'play'; }
        else if (phase === 'play') game.update(dt);
        else if (phase === 'over') { over -= dt; if (over <= 0) { stopped = true; cleanup(); done({ stars: clamp(g.shown, 0, max), max }); return; } }
        game.draw(ctx);
        if (phase === 'count') { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, g.W, g.H); const n = Math.ceil(cd - .2); text(ctx, n > 0 ? String(n) : 'LOS!', g.W / 2, g.H / 2, Math.min(150, g.W * .3), '#ffd24a', 'center', 900); }
        if (phase === 'over') text(ctx, 'Geschafft!', g.W / 2, g.H / 2, Math.min(56, g.W * .13), '#fff', 'center', 900);
      } catch (err) { stopped = true; cleanup(); console.error(err); done({ stars: clamp(g.shown, 0, max), max, error: String(err) }); return; }
      raf = requestAnimationFrame(frame);
    }
    function cleanup() { cancelAnimationFrame(raf); cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointermove', pm); cv.removeEventListener('pointerup', pu); cv.removeEventListener('pointercancel', pu); root.removeEventListener('keydown', kd); root.removeEventListener('keyup', ku); root.removeEventListener('resize', fit); }
    raf = requestAnimationFrame(frame);
    return { stop() { if (!stopped) { stopped = true; cleanup(); } }, g, game };
  }
  root.Trials = { run, ids: Object.keys(T) };
})(typeof window !== 'undefined' ? window : globalThis);
