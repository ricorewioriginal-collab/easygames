/* ColorPop Universe – Brett-Darstellung (Canvas2D). Zeichnet nur, was die Engine vorgibt; kennt keine Spielregeln.
 * Läuft nur, solange sich etwas bewegt (kein Dauer-Rendering), Delta-Zeit begrenzt, Qualitätsstufen und reduzierte Bewegung. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var C = CPU.cell, K = CPU.K;
  var QUAL = { high: { parts: 260, per: 1, dpr: 2, shake: true }, mid: { parts: 120, per: .55, dpr: 1.5, shake: false }, low: { parts: 36, per: .2, dpr: 1, shake: false } };

  function Renderer(canvas, wrap) {
    this.cv = canvas; this.wrap = wrap; this.ctx = canvas.getContext('2d');
    this.vis = new Map(); this.ghosts = []; this.parts = []; this.floats = []; this.rings = []; this.lines = [];
    this.hover = null; this.cursor = -1; this.cursorOn = false; this.zoom = 1; this.zf = { x: 0, y: 0 };
    this.opts = { skin: 'jelly', pop: 'spark', hc: false, quality: 'high', reduce: false, speed: 1, world: 1, showPoints: true, resin: false };
    this.running = false; this.last = 0; this.cs = 40; this.pad = 14; this.game = null; this.grav = 0; this.shake = 0; this.frames = 0; this.slow = 0;
    this.onIdle = null;
    var self = this; this._frame = function (t) { self.frame(t); };
  }
  var R = Renderer.prototype;
  R.q = function () { return QUAL[this.opts.quality] || QUAL.high; };
  R.setOpts = function (o) { var re = o.skin !== this.opts.skin || o.hc !== this.opts.hc; Object.assign(this.opts, o); if (re) CPU.sprites.clear(); this.resize(); };
  R.setGame = function (game, info) {
    this.game = game; this.info = info || {}; this.vis.clear(); this.ghosts = []; this.parts = []; this.floats = []; this.rings = []; this.lines = []; this.hover = null; this.zoom = 1;
    this.syncAll(true); this.resize();
  };
  R.resize = function () {
    if (!this.game) return;
    var b = this.game.board, ww = this.wrap.clientWidth, wh = this.wrap.clientHeight;
    if (!ww || !wh) return;
    var padF = 0.42, cs = Math.floor(Math.min(ww / (b.w + padF * 2), wh / (b.h + padF * 2), 84));
    cs = Math.max(14, cs);
    this.cs = cs; this.pad = Math.round(cs * padF);
    var cw = cs * b.w + this.pad * 2, ch = cs * b.h + this.pad * 2;
    var dpr = Math.min(root.devicePixelRatio || 1, this.q().dpr);
    this.dpr = dpr; this.W = cw; this.H = ch;
    this.cv.style.width = cw + 'px'; this.cv.style.height = ch + 'px';
    this.cv.width = Math.round(cw * dpr); this.cv.height = Math.round(ch * dpr);
    this.zf = { x: cw / 2, y: ch / 2 };
    this.spr = Math.round(cs * dpr * this.zoom);
    this.draw();
  };
  R.cellXY = function (i) { var w = this.game.board.w, x = i % w; return { x: x, y: (i - x) / w }; };
  // Alle Steine auf ihre Plätze (ohne Animation)
  R.syncAll = function () {
    var b = this.game.board; this.vis.clear();
    for (var i = 0; i < b.cells.length; i++) { var id = b.ids[i]; if (!id) continue; var p = this.cellXY(i); this.vis.set(id, { x: p.x, y: p.y, tx: p.x, ty: p.y, vx: 0, vy: 0, sq: 0 }); }
  };
  // Nach einem Zug: Entferntes verpufft, alles andere fällt/rutscht zu seinem neuen Platz
  R.apply = function (res, opt) {
    opt = opt || {};
    var b = this.game.board, self = this, q = this.q(), reduce = this.opts.reduce;
    this.grav = res.gravity || 0;
    var gone = (res.removed || []).concat(res.passive || []);
    var sx = 0, sy = 0, n = 0;
    gone.forEach(function (r) {
      var vv = self.vis.get(r.id), p = vv ? { x: vv.x, y: vv.y } : self.cellXY(r.i);
      self.ghosts.push({ x: p.x, y: p.y, v: r.v, t: 0 });
      if (res.group && res.group.indexOf(r.i) >= 0) { sx += p.x; sy += p.y; n++; }
      if (!reduce) self.burst(p.x + .5, p.y + .5, C.color(r.v), Math.max(1, Math.round(self.popCount() * q.per)));
      self.vis.delete(r.id);
    });
    (res.collected || []).forEach(function (r) { var vv = self.vis.get(r.id); if (vv) { self.floats.push({ x: vv.x + .5, y: vv.y, text: '✓', t: 0, col: '#ffe066' }); self.ghosts.push({ x: vv.x, y: vv.y, v: r.v, t: 0, up: true }); } self.vis.delete(r.id); });
    var live = new Set();
    for (var i = 0; i < b.cells.length; i++) {
      var id = b.ids[i]; if (!id) continue; live.add(id);
      var p = this.cellXY(i), v = this.vis.get(id);
      if (!v) { v = { x: p.x, y: -1.2 - Math.random() * 0.01 - (b.h - p.y) * 0.05, tx: p.x, ty: p.y, vx: 0, vy: 0, sq: 0 }; if (reduce) v.y = p.y; this.vis.set(id, v); }
      v.tx = p.x; v.ty = p.y;
      if (reduce) { v.x = p.x; v.y = p.y; }
    }
    this.vis.forEach(function (v, id) { if (!live.has(id)) self.vis.delete(id); });
    (res.effects || []).forEach(function (e) { self.effect(e); });
    if (n && this.opts.showPoints && (res.gain || res.gain === 0)) {
      var cx = sx / n + .5, cy = sy / n + .5;
      this.floats.push({ x: cx, y: cy, text: (res.gain > 0 ? '+' : '') + res.gain.toLocaleString('de-DE'), t: 0, col: '#fff', big: res.group.length >= 10 });
      if (res.combo > 0) this.floats.push({ x: cx, y: cy + .7, text: 'Combo ×' + (1 + Math.min(10, res.combo) * .1).toFixed(1).replace('.', ','), t: -.08, col: '#ffe066' });
      if (res.group.length >= 8 && !reduce) this.rings.push({ x: cx, y: cy, t: 0, max: Math.min(6, res.group.length / 3), col: CPU.COLORS[C.color(res.removed[0].v)] || '#fff' });
      if (res.group.length >= 14 && q.shake && !reduce) this.shake = .25;
    }
    if (res.clearBonus) this.floats.push({ x: b.w / 2, y: b.h / 2, text: 'Brett leer! +1.000', t: 0, col: '#7cf2b3', big: true });
    if (res.timeBonus) this.floats.push({ x: b.w / 2, y: .5, text: '+' + res.timeBonus + ' s', t: 0, col: '#7ef9ff' });
    this.hover = null;
    this.start();
  };
  R.popCount = function () { var p = CPU.SKINS.pop.filter(function (x) { return x.id === this.opts.pop; }, this)[0] || CPU.SKINS.pop[0]; return p.p.n; };
  R.burst = function (x, y, ci, n) {
    if (this.parts.length > this.q().parts) return;
    var col = ci >= 0 ? CPU.COLORS[ci] : '#ffffff', shape = (CPU.SKINS.pop.filter(function (p) { return p.id === this.opts.pop; }, this)[0] || CPU.SKINS.pop[0]).p.shape;
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
      this.parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.5, life: .55 + Math.random() * .4, t: 0, col: shape === 'prism' ? CPU.COLORS[k % 6] : col, shape: shape, s: .12 + Math.random() * .14, rot: Math.random() * 6 });
    }
  };
  R.effect = function (e) {
    var p = e.i != null ? this.cellXY(e.i) : null, b = this.game.board;
    if (this.opts.reduce) return;
    if (e.t === 'bomb') this.rings.push({ x: p.x + .5, y: p.y + .5, t: 0, max: 2.2, col: '#ffb02e', thick: true });
    else if (e.t === 'rocket') this.lines.push({ t: 0, x0: e.v ? p.x + .5 : 0, y0: e.v ? 0 : p.y + .5, x1: e.v ? p.x + .5 : b.w, y1: e.v ? b.h : p.y + .5, col: '#fff' });
    else if (e.t === 'chain' || e.t === 'rainbow' || e.t === 'wind' || e.t === 'paint') this.rings.push({ x: p.x + .5, y: p.y + .5, t: 0, max: 1.6, col: e.t === 'rainbow' ? '#e599f7' : '#7ef9ff' });
    else if (e.t === 'portal') { var a = this.cellXY(e.a), c = this.cellXY(e.b); this.rings.push({ x: a.x + .5, y: a.y + .5, t: 0, max: 1, col: '#b197fc' }, { x: c.x + .5, y: c.y + .5, t: 0, max: 1, col: '#b197fc' }); }
    else if (e.t === 'shuffle') this.rings.push({ x: b.w / 2, y: b.h / 2, t: 0, max: Math.max(b.w, b.h) / 1.5, col: '#fff' });
  };
  R.celebrate = function (style) {
    if (this.opts.reduce || !this.game) return;
    var b = this.game.board, map = { confetti: 'confetti', shards: 'shard', feathers: 'leaf', bubbles: 'bubble', fireflies: 'spark', sparks: 'flame', laser: 'ring', snowflakes: 'snow', cogs: 'pixel', starburst: 'star', swirl: 'heart', prism: 'prism' };
    var shape = map[style] || 'confetti', n = Math.round(60 * this.q().per) + 8;
    for (var k = 0; k < n; k++) this.parts.push({ x: Math.random() * b.w, y: b.h + .5, vx: (Math.random() - .5) * 4, vy: -8 - Math.random() * 7, life: 1.2 + Math.random() * .6, t: 0, col: CPU.COLORS[k % 6], shape: shape, s: .2 + Math.random() * .2, rot: Math.random() * 6 });
    this.start();
  };
  R.setHover = function (h) { this.hover = h; this.requestDraw(); };
  R.setCursor = function (i, on) { this.cursor = i; this.cursorOn = on; this.requestDraw(); };
  R.setZoom = function (z, cx, cy) {
    z = Math.max(1, Math.min(2.2, z)); if (z === this.zoom) return;
    if (cx != null) { var r = this.cv.getBoundingClientRect(); var px = cx - r.left, py = cy - r.top; var bx = (px - this.zf.x) / this.zoom + this.zf.x, by = (py - this.zf.y) / this.zoom + this.zf.y; this.zf = { x: bx, y: by }; }
    if (z === 1) this.zf = { x: this.W / 2, y: this.H / 2 };
    this.zoom = z; this.spr = Math.round(this.cs * this.dpr * z); this.requestDraw();
  };
  // Bildschirmkoordinate → Feldnummer (−1 außerhalb)
  R.cellAt = function (clientX, clientY) {
    if (!this.game) return -1;
    var r = this.cv.getBoundingClientRect(), px = clientX - r.left, py = clientY - r.top;
    px = (px - this.zf.x) / this.zoom + this.zf.x; py = (py - this.zf.y) / this.zoom + this.zf.y;
    var x = Math.floor((px - this.pad) / this.cs), y = Math.floor((py - this.pad) / this.cs), b = this.game.board;
    if (x < 0 || y < 0 || x >= b.w || y >= b.h) return -1;
    return x + y * b.w;
  };
  R.busy = function () {
    if (this.ghosts.length) return true;
    var moving = false; this.vis.forEach(function (v) { if (v.x !== v.tx || v.y !== v.ty) moving = true; });
    return moving;
  };
  R.start = function () { if (!this.running) { this.running = true; this.last = 0; root.requestAnimationFrame(this._frame); } };
  R.requestDraw = function () { if (!this.running) { this.running = true; this.last = 0; this.once = true; root.requestAnimationFrame(this._frame); } };
  R.frame = function (t) {
    var dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0.016; this.last = t;
    if (dt > 0.034) this.slow++; else if (this.slow > 0) this.slow -= .25;
    var active = this.step(dt * this.opts.speed);
    this.draw(); this.frames++;
    if (active && !this.once) root.requestAnimationFrame(this._frame);
    else if (this.once && active) { this.once = false; root.requestAnimationFrame(this._frame); }
    else { this.running = false; this.once = false; if (this.onIdle) this.onIdle(); }
  };
  R.step = function (dt) {
    var active = false, horizFirst = this.grav === 1 || this.grav === 3, G = 70, VMAX = 32;
    this.vis.forEach(function (v) {
      var primY = !horizFirst, dy = v.ty - v.y, dx = v.tx - v.x;
      if (primY ? dy !== 0 : dx !== 0) {
        active = true;
        if (primY) { v.vy = Math.min(VMAX, Math.abs(v.vy) + G * dt); var s = v.vy * dt; if (Math.abs(dy) <= s) { v.y = v.ty; if (v.vy > 9) v.sq = .12; v.vy = 0; } else v.y += Math.sign(dy) * s; }
        else { v.vx = Math.min(VMAX, Math.abs(v.vx) + G * dt); var s2 = v.vx * dt; if (Math.abs(dx) <= s2) { v.x = v.tx; if (v.vx > 9) v.sq = .12; v.vx = 0; } else v.x += Math.sign(dx) * s2; }
      } else if (primY ? dx !== 0 : dy !== 0) {
        active = true; var d = primY ? dx : dy, step = Math.max(.04, Math.min(Math.abs(d), (Math.abs(d) * 9 + 3) * dt));
        if (Math.abs(d) <= step) { if (primY) v.x = v.tx; else v.y = v.ty; } else if (primY) v.x += Math.sign(d) * step; else v.y += Math.sign(d) * step;
      }
      if (v.sq > 0) { v.sq = Math.max(0, v.sq - dt); active = true; }
    });
    var k;
    for (k = this.ghosts.length - 1; k >= 0; k--) { var g = this.ghosts[k]; g.t += dt; if (g.t > .2) this.ghosts.splice(k, 1); }
    for (k = this.parts.length - 1; k >= 0; k--) { var p = this.parts[k]; p.t += dt; p.vy += 12 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 5; if (p.t > p.life) this.parts.splice(k, 1); }
    for (k = this.floats.length - 1; k >= 0; k--) { var f = this.floats[k]; f.t += dt; if (f.t > 1) this.floats.splice(k, 1); }
    for (k = this.rings.length - 1; k >= 0; k--) { var r = this.rings[k]; r.t += dt; if (r.t > .5) this.rings.splice(k, 1); }
    for (k = this.lines.length - 1; k >= 0; k--) { var l = this.lines[k]; l.t += dt; if (l.t > .3) this.lines.splice(k, 1); }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    return active || this.ghosts.length || this.parts.length || this.floats.length || this.rings.length || this.lines.length || this.shake > 0;
  };
  R.draw = function () {
    if (!this.game || !this.W) return;
    var ctx = this.ctx, b = this.game.board, cs = this.cs, pad = this.pad, z = this.zoom, d = this.dpr, self = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    var shx = this.shake > 0 ? (Math.random() - .5) * cs * .15 : 0, shy = this.shake > 0 ? (Math.random() - .5) * cs * .15 : 0;
    ctx.setTransform(d * z, 0, 0, d * z, d * (this.zf.x - this.zf.x * z + shx), d * (this.zf.y - this.zf.y * z + shy));
    var world = CPU.WORLDS[(this.opts.world || 1) - 1] || CPU.WORLDS[0], x, y, i, v;
    // Brettfläche (Löcher bleiben offen)
    ctx.fillStyle = 'rgba(8,4,20,.35)'; CPU.rrect(pad * .35, pad * .35, b.w * cs + pad * 1.3, b.h * cs + pad * 1.3, cs * .4, ctx); ctx.fill();
    for (y = 0; y < b.h; y++) for (x = 0; x < b.w; x++) {
      i = x + y * b.w; v = b.cells[i];
      if (v && C.kind(v) === K.VOID) { ctx.fillStyle = 'rgba(255,255,255,.06)'; CPU.rrect(pad + x * cs + cs * .3, pad + y * cs + cs * .3, cs * .4, cs * .4, cs * .2, ctx); ctx.fill(); continue; }
      ctx.fillStyle = (x + y) % 2 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.035)';
      ctx.fillRect(pad + x * cs, pad + y * cs, cs, cs);
    }
    ctx.strokeStyle = world.accent; ctx.globalAlpha = .35; ctx.lineWidth = 2; CPU.rrect(pad - 3, pad - 3, b.w * cs + 6, b.h * cs + 6, cs * .3, ctx); ctx.stroke(); ctx.globalAlpha = 1;
    // Zielmarker
    if (b.marks) for (i = 0; i < b.marks.length; i++) if (b.marks[i]) { var mp = this.cellXY(i); ctx.save(); ctx.shadowColor = '#ffe066'; ctx.shadowBlur = cs * .3; ctx.strokeStyle = '#ffe066'; ctx.lineWidth = Math.max(2, cs * .07); CPU.rrect(pad + mp.x * cs + 2, pad + mp.y * cs + 2, cs - 4, cs - 4, cs * .22, ctx); ctx.stroke(); ctx.restore(); }
    this.drawEdges(ctx);
    // Steine
    var spr = Math.max(8, Math.round(cs * d * z)), sopt = { skin: this.opts.skin, hc: this.opts.hc, world: this.opts.world }, hov = this.hover && this.hover.set;
    for (i = 0; i < b.cells.length; i++) {
      v = b.cells[i]; if (!v) continue;
      var k = C.kind(v); if (k === K.VOID) continue;
      var id = b.ids[i], vv = this.vis.get(id), px = vv ? vv.x : i % b.w, py = vv ? vv.y : Math.floor(i / b.w);
      var sx = pad + px * cs, sy = pad + py * cs, sq = vv ? vv.sq : 0;
      var im = CPU.sprites.get(v, spr, sopt);
      if (sq > 0) { var f = sq / .12 * .1; ctx.drawImage(im, sx - cs * f / 2, sy + cs * f, cs * (1 + f), cs * (1 - f)); }
      else ctx.drawImage(im, sx, sy, cs, cs);
      if (C.ice(v)) ctx.drawImage(CPU.sprites.ice(C.ice(v), spr, this.opts.resin), sx, sy, cs, cs);
      if (hov && hov.has(i)) { ctx.fillStyle = 'rgba(255,255,255,.22)'; CPU.rrect(sx + cs * .06, sy + cs * .06, cs * .88, cs * .88, cs * .25, ctx); ctx.fill(); }
    }
    // Gruppenumriss
    if (hov) {
      ctx.save(); ctx.strokeStyle = this.hover.armed ? '#ffe066' : '#fff'; ctx.lineWidth = Math.max(2, cs * (this.hover.armed ? .09 : .06)); ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = cs * .25; ctx.lineCap = 'round';
      ctx.beginPath();
      hov.forEach(function (j) {
        var gx = j % b.w, gy = (j - gx) / b.w, X = pad + gx * cs, Y = pad + gy * cs;
        if (!hov.has(j - b.w) || gy === 0) { ctx.moveTo(X, Y); ctx.lineTo(X + cs, Y); }
        if (!hov.has(j + b.w) || gy === b.h - 1) { ctx.moveTo(X, Y + cs); ctx.lineTo(X + cs, Y + cs); }
        if (gx === 0 || !hov.has(j - 1)) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + cs); }
        if (gx === b.w - 1 || !hov.has(j + 1)) { ctx.moveTo(X + cs, Y); ctx.lineTo(X + cs, Y + cs); }
      });
      ctx.stroke(); ctx.restore();
      if (this.opts.showPoints && this.hover.at != null) {
        var hp = this.cellXY(this.hover.at), label = this.hover.label;
        ctx.font = '700 ' + Math.max(12, Math.round(cs * .36)) + 'px Fredoka, system-ui, sans-serif'; var tw = ctx.measureText(label).width + cs * .4;
        var lx = Math.max(tw / 2 + 2, Math.min(this.W - tw / 2 - 2, pad + hp.x * cs + cs / 2)), ly = Math.max(cs * .3, pad + hp.y * cs - cs * .2);
        ctx.fillStyle = 'rgba(20,10,40,.88)'; CPU.rrect(lx - tw / 2, ly - cs * .3, tw, cs * .55, cs * .27, ctx); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx, ly - cs * .02);
      }
    }
    // Cursor (Tastatur/Controller)
    if (this.cursorOn && this.cursor >= 0) { var cp = this.cellXY(this.cursor); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(3, cs * .1); ctx.shadowColor = '#7ef9ff'; ctx.shadowBlur = cs * .4; CPU.rrect(pad + cp.x * cs - 1, pad + cp.y * cs - 1, cs + 2, cs + 2, cs * .28, ctx); ctx.stroke(); ctx.restore(); }
    // Verpuffen
    this.ghosts.forEach(function (g) {
      var t = g.t / .2, sc = 1 + t * .3, a = 1 - t;
      ctx.globalAlpha = Math.max(0, a); var gs = cs * sc;
      ctx.drawImage(CPU.sprites.get(g.v, spr, sopt), pad + (g.x + .5) * cs - gs / 2, pad + (g.y + .5) * cs - gs / 2 - (g.up ? t * cs : 0), gs, gs);
      ctx.globalAlpha = 1;
    });
    this.lines.forEach(function (l) { ctx.save(); ctx.globalAlpha = 1 - l.t / .3; ctx.strokeStyle = l.col; ctx.lineWidth = cs * .5 * (1 - l.t / .3); ctx.shadowColor = '#7ef9ff'; ctx.shadowBlur = cs; ctx.beginPath(); ctx.moveTo(pad + l.x0 * cs, pad + l.y0 * cs); ctx.lineTo(pad + l.x1 * cs, pad + l.y1 * cs); ctx.stroke(); ctx.restore(); });
    this.rings.forEach(function (r) { var t = r.t / .5; ctx.save(); ctx.globalAlpha = (1 - t) * .9; ctx.strokeStyle = r.col; ctx.lineWidth = cs * (r.thick ? .3 : .14) * (1 - t); ctx.beginPath(); ctx.arc(pad + r.x * cs, pad + r.y * cs, cs * (.3 + r.max * t), 0, 7); ctx.stroke(); ctx.restore(); });
    this.parts.forEach(function (p) { self.drawPart(ctx, p, pad, cs); });
    this.floats.forEach(function (f) {
      if (f.t < 0) return;
      var a = f.t < .7 ? 1 : 1 - (f.t - .7) / .3, fsz = Math.round(cs * (f.big ? .7 : .48));
      ctx.save(); ctx.globalAlpha = a; ctx.font = '700 ' + fsz + 'px Fredoka, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var fx = Math.max(fsz * 2, Math.min(self.W - fsz * 2, pad + f.x * cs)), fy = pad + (f.y - f.t * 1.1) * cs;
      ctx.lineWidth = fsz * .16; ctx.strokeStyle = 'rgba(20,8,40,.85)'; ctx.strokeText(f.text, fx, fy); ctx.fillStyle = f.col; ctx.fillText(f.text, fx, fy); ctx.restore();
    });
  };
  R.drawPart = function (ctx, p, pad, cs) {
    var a = 1 - p.t / p.life, s = p.s * cs, x = pad + p.x * cs, y = pad + p.y * cs;
    ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(x, y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.strokeStyle = p.col;
    switch (p.shape) {
      case 'confetti': ctx.fillRect(-s, -s * .45, s * 2, s * .9); break;
      case 'bubble': ctx.lineWidth = s * .3; ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.stroke(); break;
      case 'star': ctx.beginPath(); for (var i = 0; i < 10; i++) { var an = i * Math.PI / 5, r = i % 2 ? s * .45 : s * 1.1; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); break;
      case 'shard': ctx.beginPath(); ctx.moveTo(0, -s * 1.3); ctx.lineTo(s * .6, 0); ctx.lineTo(0, s * 1.3); ctx.lineTo(-s * .6, 0); ctx.fill(); break;
      case 'leaf': ctx.beginPath(); ctx.ellipse(0, 0, s * 1.2, s * .5, 0, 0, 7); ctx.fill(); break;
      case 'snow': ctx.lineWidth = s * .25; for (var j = 0; j < 3; j++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); } break;
      case 'pixel': ctx.fillRect(-s * .7, -s * .7, s * 1.4, s * 1.4); break;
      case 'heart': ctx.beginPath(); ctx.moveTo(0, s); ctx.bezierCurveTo(-s * 1.6, -s * .2, -s * .6, -s * 1.4, 0, -s * .4); ctx.bezierCurveTo(s * .6, -s * 1.4, s * 1.6, -s * .2, 0, s); ctx.fill(); break;
      case 'ring': ctx.lineWidth = s * .3; ctx.beginPath(); ctx.arc(0, 0, s * (1 + p.t * 3), 0, 7); ctx.stroke(); break;
      case 'flame': ctx.fillStyle = p.t < p.life * .4 ? '#ffe066' : p.col; ctx.beginPath(); ctx.arc(0, 0, s * (1 - p.t / p.life * .6), 0, 7); ctx.fill(); break;
      default: ctx.beginPath(); ctx.moveTo(0, -s * 1.2); ctx.lineTo(s * .3, 0); ctx.lineTo(0, s * 1.2); ctx.lineTo(-s * .3, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  // Pfeile am Rand: Schwerkraft-Richtung (wenn nicht „unten“ oder wechselnd) und Förderbänder
  R.drawEdges = function (ctx) {
    var g = this.game, b = g.board, cs = this.cs, pad = this.pad, dir = g.gravityNow(), nxt = g.gravityNext(), self = this;
    function chev(x, y, ang, col, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, s * .22); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-s * .35, -s * .5); ctx.lineTo(s * .3, 0); ctx.lineTo(-s * .35, s * .5); ctx.stroke(); ctx.restore(); }
    var ANG = [Math.PI / 2, Math.PI, -Math.PI / 2, 0];
    if (dir !== 0 || nxt) {
      var col = '#7ef9ff', s = pad * .7;
      for (var k = 0; k < 3; k++) {
        var f = (k + 1) / 4;
        if (dir === 0) chev(pad + b.w * cs * f, pad + b.h * cs + pad * .55, ANG[0], col, s);
        if (dir === 2) chev(pad + b.w * cs * f, pad * .45, ANG[2], col, s);
        if (dir === 1) chev(pad * .45, pad + b.h * cs * f, ANG[1], col, s);
        if (dir === 3) chev(pad + b.w * cs + pad * .55, pad + b.h * cs * f, ANG[3], col, s);
      }
    }
    (g.rules.conveyors || []).forEach(function (row) {
      if (row < 0 || row >= b.h) return;
      var y = pad + row * cs + cs / 2;
      chev(pad * .5, y, 0, '#ffd23f', pad * .7); chev(pad + b.w * cs + pad * .5, y, 0, '#ffd23f', pad * .7);
      ctx.fillStyle = 'rgba(255,210,63,.12)'; ctx.fillRect(pad, pad + row * cs, b.w * cs, cs);
    });
    void self;
  };
  CPU.Renderer = Renderer;
})(typeof window !== 'undefined' ? window : globalThis);
