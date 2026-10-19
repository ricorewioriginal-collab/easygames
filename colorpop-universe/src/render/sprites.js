/* ColorPop Universe – Stein-Grafiken (Canvas2D, einmal je Größe/Design vorgezeichnet und zwischengespeichert).
 * Jede Farbe hat ein eigenes Symbol (Würfel, Sonne, Tropfen, Blatt, Stern, Blitz, Mond) – Farbe ist nie die einzige Information. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var C = CPU.cell, K = CPU.K;
  var cache = new Map(), MAXC = 900;

  function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function shade(hex, f, sat) {   // f > 0 heller, f < 0 dunkler; sat = Sättigung
    var c = hexRgb(hex), g = (c[0] + c[1] + c[2]) / 3;
    c = c.map(function (v) { v = g + (v - g) * (sat || 1); return f >= 0 ? v + (255 - v) * f : v * (1 + f); });
    return 'rgb(' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))); }).join(',') + ')';
  }
  function rrect(x, y, w, h, r, ctx) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  CPU.rrect = rrect;

  // Symbole im Bereich −1…1
  var SYM = [
    function (c) { c.beginPath(); c.moveTo(0, -1); c.lineTo(.87, -.5); c.lineTo(.87, .5); c.lineTo(0, 1); c.lineTo(-.87, .5); c.lineTo(-.87, -.5); c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = .16; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, .95); c.moveTo(0, 0); c.lineTo(-.82, -.47); c.moveTo(0, 0); c.lineTo(.82, -.47); c.stroke(); c.globalCompositeOperation = 'source-over'; },
    function (c) { c.beginPath(); c.arc(0, 0, .45, 0, 7); c.fill(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(a - .2) * .58, Math.sin(a - .2) * .58); c.lineTo(Math.cos(a) * 1, Math.sin(a) * 1); c.lineTo(Math.cos(a + .2) * .58, Math.sin(a + .2) * .58); c.closePath(); c.fill(); } },
    function (c) { c.beginPath(); c.moveTo(0, -1); c.bezierCurveTo(.25, -.55, .78, -.05, .78, .35); c.arc(0, .35, .78, 0, Math.PI); c.bezierCurveTo(-.78, -.05, -.25, -.55, 0, -1); c.fill(); },
    function (c) { c.beginPath(); c.moveTo(-.85, .85); c.bezierCurveTo(-.95, -.2, -.2, -.95, .95, -.95); c.bezierCurveTo(.95, .2, .2, .95, -.85, .85); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = .14; c.beginPath(); c.moveTo(-.7, .7); c.lineTo(.6, -.6); c.stroke(); c.globalCompositeOperation = 'source-over'; },
    function (c) { c.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
    function (c) { c.beginPath(); c.moveTo(.2, -1); c.lineTo(-.65, .12); c.lineTo(-.05, .12); c.lineTo(-.25, 1); c.lineTo(.68, -.2); c.lineTo(.06, -.2); c.closePath(); c.fill(); },
    function (c) { c.beginPath(); c.arc(0, 0, .9, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(.38, -.25, .72, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; }
  ];
  // Symbole mit Aussparungen (destination-out) erst auf eine eigene Fläche zeichnen, sonst würde der Stein darunter mit ausgestanzt
  var symCanvas = null;
  CPU.drawSymbol = function (ctx, color, x, y, r, fill) {
    var n = Math.max(4, Math.ceil(r * 2 + 4));
    if (!symCanvas) symCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(n, n) : document.createElement('canvas');
    if (symCanvas.width < n || symCanvas.height < n) { symCanvas.width = n; symCanvas.height = n; }
    var c = symCanvas.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, symCanvas.width, symCanvas.height);
    c.translate(n / 2, n / 2); c.scale(r, r); c.fillStyle = fill; c.strokeStyle = fill; SYM[color % 7](c);
    ctx.drawImage(symCanvas, 0, 0, n, n, x - n / 2, y - n / 2, n, n);
  };

  function noise(seed) { var r = CPU.rng(seed); return r; }
  function body(ctx, s, col, st, hc, ci) {
    var pad = s * 0.06, w = s - pad * 2, rr = s * (st.r + (ci === 2 || ci === 6 ? 0.08 : 0)), x = pad, y = pad;
    // Schatten
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)'; rrect(x + s * .02, y + s * .06, w, w, rr, ctx); ctx.fill(); ctx.restore();
    rrect(x, y, w, w, rr, ctx);
    ctx.save(); ctx.clip();
    var mat = st.mat, sat = st.sat || 1;
    if (mat === 'flat') ctx.fillStyle = shade(col, 0, sat);
    else if (mat === 'neon') ctx.fillStyle = shade(col, -0.72, sat);
    else { var g = ctx.createLinearGradient(0, y, 0, y + w); g.addColorStop(0, shade(col, 0.32, sat)); g.addColorStop(0.55, shade(col, 0, sat)); g.addColorStop(1, shade(col, -0.32, sat)); ctx.fillStyle = g; }
    ctx.fillRect(0, 0, s, s);
    var r = noise(ci * 977 + 13), i;
    if (mat === 'jelly' || mat === 'candy' || mat === 'soft') { var rg = ctx.createRadialGradient(s * .5, s * .62, 0, s * .5, s * .62, s * .55); rg.addColorStop(0, 'rgba(255,255,255,.28)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, s, s); }
    if (mat === 'candy') { ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = s * .09; for (i = -2; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * s * .32, s); ctx.lineTo(i * s * .32 + s, 0); ctx.stroke(); } }
    if (mat === 'facet' || mat === 'crystal') {
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w * .78, y + w * .26); ctx.lineTo(x + w * .22, y + w * .26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.moveTo(x, y + w); ctx.lineTo(x + w, y + w); ctx.lineTo(x + w * .78, y + w * .74); ctx.lineTo(x + w * .22, y + w * .74); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * .22, y + w * .26); ctx.lineTo(x + w * .22, y + w * .74); ctx.lineTo(x, y + w); ctx.closePath(); ctx.fill();
      if (mat === 'crystal') { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = s * .03; ctx.beginPath(); ctx.moveTo(x + w * .15, y + w * .85); ctx.lineTo(x + w * .85, y + w * .15); ctx.stroke(); }
    }
    if (mat === 'pearl' || mat === 'nebula') { for (i = 0; i < 4; i++) { var px = r() * s, py = r() * s, pr = s * (.2 + r() * .3), pg = ctx.createRadialGradient(px, py, 0, px, py, pr); pg.addColorStop(0, mat === 'pearl' ? (i % 2 ? 'rgba(255,190,240,.35)' : 'rgba(170,240,255,.35)') : 'rgba(255,255,255,.25)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = pg; ctx.fillRect(0, 0, s, s); } }
    if (mat === 'rough' || mat === 'ceramic' || mat === 'frost') { ctx.fillStyle = mat === 'frost' ? 'rgba(255,255,255,.35)' : mat === 'rough' ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.1)'; for (i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(r() * s, r() * s, s * (.008 + r() * .02), 0, 7); ctx.fill(); } }
    if (mat === 'marble') { ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = s * .025; for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0, r() * s); ctx.bezierCurveTo(s * .3, r() * s, s * .6, r() * s, s, r() * s); ctx.stroke(); } }
    if (mat === 'metal') { for (i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'; ctx.fillRect(0, y + i * w / 6, s, w / 12); } }
    if (mat === 'pixel') { var q = w / 5; for (var a = 0; a < 5; a++) for (var b2 = 0; b2 < 5; b2++) { ctx.fillStyle = 'rgba(' + ((a + b2) % 2 ? '255,255,255,.07' : '0,0,0,.07') + ')'; ctx.fillRect(x + a * q, y + b2 * q, q, q); } }
    if (mat === 'glass') { ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(0, 0, s, s); }
    // Glanz
    if (st.gloss > 0) { var gl = ctx.createLinearGradient(0, y, 0, y + w * .5); gl.addColorStop(0, 'rgba(255,255,255,' + (.55 * st.gloss) + ')'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(s * .5, y + w * .2, w * .4, w * .2, 0, 0, 7); ctx.fill(); }
    ctx.restore();
    // Kanten
    if (st.bevel > 0 && mat !== 'flat') {
      ctx.save(); rrect(x, y, w, w, rr, ctx); ctx.clip();
      ctx.lineWidth = s * .07; ctx.strokeStyle = 'rgba(255,255,255,' + (.35 * st.bevel) + ')'; rrect(x + s * .02, y + s * .03, w - s * .04, w, rr, ctx); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,' + (.3 * st.bevel) + ')'; rrect(x + s * .02, y - s * .03, w - s * .04, w, rr, ctx); ctx.stroke();
      ctx.restore();
    }
    if (mat === 'neon') { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = s * .18; ctx.strokeStyle = shade(col, .2, 1.2); ctx.lineWidth = s * .07; rrect(x + s * .05, y + s * .05, w - s * .1, w - s * .1, rr * .8, ctx); ctx.stroke(); ctx.restore(); }
    if (mat === 'gold') { ctx.strokeStyle = '#ffd86b'; ctx.lineWidth = s * .05; rrect(x + s * .025, y + s * .025, w - s * .05, w - s * .05, rr, ctx); ctx.stroke(); }
    if (hc) { ctx.strokeStyle = '#000'; ctx.lineWidth = s * .06; rrect(x, y, w, w, rr, ctx); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = s * .025; rrect(x + s * .04, y + s * .04, w - s * .08, w - s * .08, rr * .8, ctx); ctx.stroke(); }
    return { x: x, y: y, w: w, rr: rr };
  }
  function symbol(ctx, ci, cx, cy, r, hc, mat) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = r * .3; ctx.shadowOffsetY = r * .08;
    CPU.drawSymbol(ctx, ci, cx, cy, r, hc ? '#ffffff' : mat === 'neon' ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.82)');
    ctx.restore();
  }
  function icon(ctx, k, a, s, col) {
    var cx = s / 2, cy = s / 2, u = s / 2;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (k === K.BOMB) {
      ctx.fillStyle = '#1d1630'; ctx.beginPath(); ctx.arc(cx, cy + u * .1, u * .42, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(cx - u * .14, cy - u * .06, u * .12, 0, 7); ctx.fill();
      ctx.strokeStyle = '#d9b07a'; ctx.lineWidth = u * .1; ctx.beginPath(); ctx.moveTo(cx + u * .22, cy - u * .22); ctx.quadraticCurveTo(cx + u * .4, cy - u * .55, cx + u * .5, cy - u * .5); ctx.stroke();
      ctx.fillStyle = a & 1 ? '#ff3b1f' : '#ffd23f'; ctx.beginPath(); ctx.arc(cx + u * .52, cy - u * .52, u * .12, 0, 7); ctx.fill();
      if (a & 1) { ctx.strokeStyle = 'rgba(255,80,40,.9)'; ctx.lineWidth = u * .08; ctx.beginPath(); ctx.arc(cx, cy, u * .8, 0, 7); ctx.stroke(); }
    } else if (k === K.ROCKET) {
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = u * .14;
      ctx.translate(cx, cy); if (a & 1) ctx.rotate(Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(-u * .55, 0); ctx.lineTo(u * .55, 0); ctx.stroke();
      [-1, 1].forEach(function (d) { ctx.beginPath(); ctx.moveTo(d * u * .72, 0); ctx.lineTo(d * u * .4, -u * .26); ctx.lineTo(d * u * .4, u * .26); ctx.closePath(); ctx.fill(); });
    } else if (k === K.WIND) {
      ctx.translate(cx, cy); ctx.rotate([Math.PI / 2, Math.PI, -Math.PI / 2, 0][a & 3]);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = u * .12;
      for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-u * .5, i * u * .26); ctx.lineTo(u * .3, i * u * .26); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(u * .7, 0); ctx.lineTo(u * .3, -u * .4); ctx.lineTo(u * .3, u * .4); ctx.closePath(); ctx.fill();
    } else if (k === K.RAINBOW) {
      var cols = ['#ff4f6d', '#ffc93c', '#2ed38a', '#2f8cff', '#a46bff'];
      ctx.lineWidth = u * .1; cols.forEach(function (c, j) { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(cx, cy + u * .3, u * (.62 - j * .1), Math.PI, 0); ctx.stroke(); });
      ctx.fillStyle = CPU.COLORS[a % 7]; ctx.strokeStyle = '#fff'; ctx.lineWidth = u * .06; ctx.beginPath(); ctx.arc(cx, cy + u * .32, u * .2, 0, 7); ctx.fill(); ctx.stroke();
      CPU.drawSymbol(ctx, a % 7, cx, cy + u * .32, u * .12, '#fff');
    } else if (k === K.CHAIN) {
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = u * .09;
      [[-.32, -.32], [.32, .32]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(cx + p[0] * u, cy + p[1] * u, u * .3, u * .18, Math.PI / 4, 0, 7); ctx.stroke(); });
      ctx.beginPath(); ctx.ellipse(cx, cy, u * .3, u * .18, -Math.PI / 4, 0, 7); ctx.stroke();
    } else if (k === K.ANCHOR) {
      ctx.strokeStyle = '#eef3ff'; ctx.lineWidth = u * .1;
      ctx.beginPath(); ctx.arc(cx, cy - u * .42, u * .12, 0, 7); ctx.moveTo(cx, cy - u * .3); ctx.lineTo(cx, cy + u * .5); ctx.moveTo(cx - u * .25, cy - u * .12); ctx.lineTo(cx + u * .25, cy - u * .12); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy + u * .1, u * .42, Math.PI * .15, Math.PI * .85); ctx.stroke();
    }
    ctx.restore();
  }
  function special(ctx, v, s, opt) {
    var k = C.kind(v), a = C.arg(v), cx = s / 2, cy = s / 2, u = s / 2, i;
    if (k === K.PRISM) {
      var pad = s * .1, g;
      try { g = ctx.createConicGradient(0, cx, cy); ['#ff4f6d', '#ffc93c', '#2ed38a', '#2f8cff', '#a46bff', '#ff4f6d'].forEach(function (c, j) { g.addColorStop(j / 5, c); }); }
      catch (e) { g = ctx.createLinearGradient(0, 0, s, s); g.addColorStop(0, '#ff4f6d'); g.addColorStop(.5, '#2ed38a'); g.addColorStop(1, '#a46bff'); }
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = s * .08; ctx.shadowOffsetY = s * .04;
      ctx.beginPath(); for (i = 0; i < 6; i++) { var an = -Math.PI / 2 + i * Math.PI / 3; ctx.lineTo(cx + Math.cos(an) * (u - pad), cy + Math.sin(an) * (u - pad)); } ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(cx, cy - u + pad); ctx.lineTo(cx + (u - pad) * .87, cy - (u - pad) * .5); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s * .04; ctx.stroke();
      return;
    }
    if (k === K.WOOD) {
      var coral = opt.world === 4;
      body(ctx, s, coral ? '#ff7f8f' : '#b7793f', { r: .16, gloss: .2, bevel: .7, sat: .9, mat: 'ceramic' }, opt.hc, 9);
      ctx.strokeStyle = coral ? 'rgba(255,255,255,.45)' : 'rgba(70,35,10,.45)'; ctx.lineWidth = s * .035;
      for (i = 0; i < 3; i++) { ctx.beginPath(); if (coral) { ctx.arc(s * (.3 + i * .2), s * .6, s * .1, Math.PI, 0); } else { ctx.moveTo(s * .16, s * (.3 + i * .2)); ctx.bezierCurveTo(s * .4, s * (.26 + i * .2), s * .6, s * (.36 + i * .2), s * .84, s * (.3 + i * .2)); } ctx.stroke(); }
      return;
    }
    if (k === K.ROCK) {
      var lava = opt.world === 6;
      body(ctx, s, lava ? '#4a2a28' : '#7d8597', { r: .2, gloss: .15, bevel: .9, sat: .6, mat: 'rough' }, opt.hc, 10);
      ctx.strokeStyle = lava ? '#ff7a2f' : 'rgba(20,20,30,.6)'; ctx.lineWidth = s * .04; if (lava) { ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = s * .12; }
      ctx.beginPath(); ctx.moveTo(s * .3, s * .2); ctx.lineTo(s * .45, s * .45); ctx.lineTo(s * .35, s * .7); ctx.moveTo(s * .45, s * .45); ctx.lineTo(s * .72, s * .55); ctx.stroke(); ctx.shadowBlur = 0;
      for (i = 0; i < a; i++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * (.5 + (i - (a - 1) / 2) * .17), s * .84, s * .05, 0, 7); ctx.fill(); }
      return;
    }
    if (k === K.ITEM) {
      ctx.save(); ctx.translate(cx, cy); ctx.shadowColor = a === 1 ? '#7ff' : a === 3 ? '#9ff' : '#ffd23f'; ctx.shadowBlur = s * .2;
      if (a === 0) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); for (i = 0; i < 10; i++) { var aa = -Math.PI / 2 + i * Math.PI / 5, rr2 = (i % 2 ? .3 : .72) * u; ctx.lineTo(Math.cos(aa) * rr2, Math.sin(aa) * rr2); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff6c2'; ctx.lineWidth = s * .04; ctx.stroke(); }
      else if (a === 1) { ctx.fillStyle = '#ffd6e7'; ctx.beginPath(); ctx.moveTo(-u * .7, u * .25); ctx.quadraticCurveTo(-u * .7, -u * .7, 0, -u * .7); ctx.quadraticCurveTo(u * .7, -u * .7, u * .7, u * .25); ctx.lineTo(u * .2, u * .55); ctx.lineTo(-u * .2, u * .55); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c86b9a'; ctx.lineWidth = s * .03; for (i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * u * .1, u * .5); ctx.lineTo(i * u * .3, -u * .6); ctx.stroke(); } }
      else if (a === 2) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = s * .1; ctx.beginPath(); ctx.arc(-u * .25, -u * .2, u * .26, 0, 7); ctx.moveTo(0, -u * .05); ctx.lineTo(u * .6, u * .55); ctx.moveTo(u * .35, u * .3); ctx.lineTo(u * .2, u * .45); ctx.moveTo(u * .5, u * .45); ctx.lineTo(u * .35, u * .6); ctx.stroke(); }
      else { ctx.fillStyle = '#7ef9ff'; ctx.beginPath(); ctx.moveTo(-u * .6, -u * .2); ctx.lineTo(-u * .3, -u * .6); ctx.lineTo(u * .3, -u * .6); ctx.lineTo(u * .6, -u * .2); ctx.lineTo(0, u * .7); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(-u * .3, -u * .6); ctx.lineTo(0, -u * .2); ctx.lineTo(u * .3, -u * .6); ctx.closePath(); ctx.fill(); }
      ctx.restore(); return;
    }
    if (k === K.PORTAL) {
      ctx.save(); ctx.translate(cx, cy);
      for (i = 0; i < 4; i++) { ctx.strokeStyle = ['#b197fc', '#7950f2', '#e599f7', '#5f3dc4'][i]; ctx.lineWidth = s * .06; ctx.beginPath(); ctx.ellipse(0, 0, u * (.8 - i * .16), u * (.42 - i * .08), 0, 0, 7); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(s * .26) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String.fromCharCode(65 + a), 0, 0);
      ctx.restore(); return;
    }
  }
  // Zellwert → vorgezeichnete Grafik (ohne Eis; das ist eine eigene Ebene)
  function get(v, size, opt) {
    var base = C.setIce(v, 0), k = C.kind(base);
    var key = base + '|' + size + '|' + opt.skin + '|' + (opt.hc ? 1 : 0) + '|' + ((k === K.WOOD || k === K.ROCK) ? opt.world : 0);
    var cv = cache.get(key); if (cv) return cv;
    if (cache.size > MAXC) cache.clear();
    cv = (typeof OffscreenCanvas !== 'undefined' && !opt.noOffscreen) ? new OffscreenCanvas(size, size) : document.createElement('canvas');
    cv.width = size; cv.height = size;
    var ctx = cv.getContext('2d'), ci = C.color(base);
    if (ci >= 0) {
      var st = (CPU.SKINS.stone.filter(function (x) { return x.id === opt.skin; })[0] || CPU.SKINS.stone[0]).s;
      var col = (opt.hc ? CPU.COLORS_HC : CPU.COLORS)[ci];
      body(ctx, size, col, st, opt.hc, ci);
      if (k === K.BOMB || k === K.ROCKET || k === K.WIND || k === K.RAINBOW) { symbol(ctx, ci, size * .26, size * .26, size * .11, opt.hc, st.mat); icon(ctx, k, C.arg(base), size, col); }
      else { symbol(ctx, ci, size / 2, size / 2, size * .25, opt.hc, st.mat); if (k !== K.NORMAL) icon(ctx, k, C.arg(base), size, col); }
      if (k === K.NEON) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = size * .25; ctx.lineWidth = size * .05; rrect(size * .1, size * .1, size * .8, size * .8, size * .22, ctx); ctx.stroke(); ctx.restore(); }
      if (k === K.ANCHOR) { ctx.strokeStyle = 'rgba(230,236,255,.9)'; ctx.lineWidth = size * .06; rrect(size * .07, size * .07, size * .86, size * .86, size * .18, ctx); ctx.stroke(); }
      if (k === K.CHAIN) { ctx.save(); ctx.setLineDash([size * .08, size * .06]); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = size * .05; rrect(size * .1, size * .1, size * .8, size * .8, size * .2, ctx); ctx.stroke(); ctx.restore(); }
    } else special(ctx, base, size, opt);
    cache.set(key, cv);
    return cv;
  }
  function ice(layers, size, resin) {
    var key = 'ice' + layers + '|' + size + '|' + (resin ? 1 : 0), cv = cache.get(key); if (cv) return cv;
    cv = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(size, size) : document.createElement('canvas'); cv.width = cv.height = size;
    var ctx = cv.getContext('2d'), p = size * .04;
    ctx.fillStyle = resin ? 'rgba(255,170,40,' + (.28 + layers * .14) + ')' : 'rgba(190,235,255,' + (.3 + layers * .15) + ')';
    rrect(p, p, size - p * 2, size - p * 2, size * .18, ctx); ctx.fill();
    ctx.strokeStyle = resin ? 'rgba(255,220,140,.9)' : 'rgba(255,255,255,.9)'; ctx.lineWidth = size * (.03 + layers * .02); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = size * .025;
    if (resin) { for (var d = 0; d < layers + 1; d++) { ctx.beginPath(); ctx.moveTo(size * (.25 + d * .22), p); ctx.lineTo(size * (.25 + d * .22), size * (.25 + (d % 2) * .15)); ctx.stroke(); } }
    else { ctx.beginPath(); ctx.moveTo(size * .2, size * .25); ctx.lineTo(size * .38, size * .4); ctx.lineTo(size * .3, size * .62); if (layers > 1) { ctx.moveTo(size * .7, size * .2); ctx.lineTo(size * .62, size * .45); ctx.lineTo(size * .8, size * .6); } if (layers > 2) { ctx.moveTo(size * .45, size * .75); ctx.lineTo(size * .6, size * .82); } ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(size * .22) + 'px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    if (layers > 1) ctx.fillText(String(layers), size * .9, size * .94);
    cache.set(key, cv); return cv;
  }
  CPU.sprites = { get: get, ice: ice, clear: function () { cache.clear(); }, shade: shade };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
