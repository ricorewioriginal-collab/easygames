'use strict';
/* Bunte Insel – Highlight-Spiele der Welten (jede Welt eine andere Spielart, alle 2D im Mini-Spiel-Rahmen aus mini.js):
   🏝️ Heli-Rettung (Hauptinsel) – Flug-Geschicklichkeit: halten = steigen, Felsentore, Vögel, Sterne
   🏙️ Taxi-Rush (Stadt) – Spurwechsel-Rennen: Autos ausweichen, Fahrgäste und Münzen einsammeln
   🎢 Dosen-Knall (Freizeitpark) – Wurfbude: Ball ziehen und loslassen, Dosenpyramiden umwerfen
   🌈 Pride-Disco (Regenbogenwelt) – Rhythmus-Tanzspiel: Pfeile im Takt treffen (eigener Beat, Töne im Browser erzeugt)
   🐉 Drachenflug (Drachenhöhen) – Ring-Flug in Pseudo-3D, ziehen/zielen
   🎬 Hafen-Kran (Dampfer-Hafen) – Kisten stapeln: im richtigen Moment loslassen
   🏗️ Pixel-Plan (Bauland) – Merkspiel: Bauplan merken, aus dem Gedächtnis nachbauen
   💧 Strömungs-Rätsel (Atlantis) – Leitungs-Puzzle: Rohre drehen, bis das Wasser fließt
   (🐶 Fellretter-Sprint = Jump 'n' Run der Fellretter-Bucht steht in jump.js.)
   Alle starten über den Spielautomaten in der Welt (arcade.js) oder über das 🎮-Spiele-Menü; bei „Mit Freunden“ gleicher Startwert = gleiche Strecke/Pyramiden/Noten. */
(BI.MINI_EXT = BI.MINI_EXT || []).push(function (M, h) {
  const A = h.A, COLS = ['#ff3b3b', '#ff9a2e', '#ffe14a', '#4cd07d', '#3fa0ff', '#9b4de0'], snd = n => { try { A[n] && A[n](); } catch (e) { } };
  const rr = (c, x, y, w, hh, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, hh, r); else c.rect(x, y, w, hh); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hearts = (n, x, y) => { for (let i = 0; i < n; i++) h.emoji('❤️', x + i * 30, y, 26); };

  /* =====================  🏝️ HELI-RETTUNG  ===================== */
  const heli = () => {
    const G = {}; let p, obs, items, sp, t, dist, nextGate, life, inv, hold, over, msg, msgT, lastY, ph;
    G.init = function () { const H = h.H(), W = h.W(); p = { x: W * .25, y: H * .5, vy: 0 }; obs = []; items = []; sp = W * .34; t = 0; dist = 0; nextGate = W * .9; life = 3; inv = 0; hold = false; over = false; msg = ''; msgT = 0; lastY = H * .5; ph = 0; };
    G.resize = function () { };
    G.tap = () => { hold = true; }; G.up = () => { hold = false; };
    G.keydown = c => { if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') hold = true; }; G.keyup = c => { if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') hold = false; };
    G.dbg = () => ({ p, obs, items, life, sp, why: G.why, set: v => { hold = v; } });
    const say = (s, d) => { msg = s; msgT = d || 1.4; };
    G.update = function (dt) {
      if (over) return; const W = h.W(), H = h.H(); t += dt; ph += dt * 30; sp = W * (.34 + Math.min(.3, t * .0045)); dist += sp * dt; inv = Math.max(0, inv - dt); msgT = Math.max(0, msgT - dt);
      p.vy += (hold ? -H * 2.1 : H * 1.7) * dt; p.vy = clamp(p.vy, -H * .85, H * .95); p.y += p.vy * dt;
      if (p.y < H * .08) { p.y = H * .08; p.vy = 0; } if (p.y > H * .9) { p.y = H * .9; p.vy = -H * .3; crash('floor'); }
      /* Tore: oben und unten Fels, dazwischen die Lücke (wird mit der Zeit enger) */
      nextGate -= sp * dt; if (nextGate <= 0) { const gap = H * Math.max(.3, .46 - t * .0025), cy = clamp(lastY + (h.rnd() - .5) * H * .42, H * .12 + gap / 2, H * .86 - gap / 2); lastY = cy; obs.push({ k: 'g', x: W + 60, w: 64, top: cy - gap / 2, bot: cy + gap / 2, pass: false });
        items.push({ k: 's', x: W + 60 + 32, y: cy, got: false }); if (h.rnd() < .28) obs.push({ k: 'b', x: W + 60 + W * .22, y: H * (.2 + h.rnd() * .55), ph: h.rnd() * 6, dead: false }); if (h.rnd() < .2) items.push({ k: 'r', x: W + 60 + W * .2, y: H * (.25 + h.rnd() * .5), got: false }); nextGate = W * Math.max(.4, .62 - t * .003); }
      for (const o of obs) { o.x -= sp * dt * (o.k === 'b' ? 1.25 : 1); if (o.k === 'b') o.y += Math.sin(t * 3 + o.ph) * H * .25 * dt; }
      for (const it of items) it.x -= sp * dt; obs = obs.filter(o => o.x > -120); items = items.filter(i => i.x > -60);
      const hx = p.x, hy = p.y, R = H * .045;
      for (const o of obs) {
        if (o.k === 'g') { if (hx + R > o.x && hx - R < o.x + o.w && (hy - R * .7 < o.top || hy + R * .7 > o.bot)) crash('gate'); if (!o.pass && o.x + o.w < hx - R) { o.pass = true; h.add(1, hx, hy - 40); } }
        else if (!o.dead && Math.hypot(o.x - hx, o.y - hy) < R * 1.2) { o.dead = true; crash('bird'); }
      }
      for (const it of items) if (!it.got && Math.hypot(it.x - hx, it.y - hy) < R * 1.5) { it.got = true; if (it.k === 's') { h.add(2, it.x, it.y); snd('ding'); } else { h.add(10, it.x, it.y); snd('star'); h.burst(it.x, it.y, 14, ['#ffe27a', '#fff', '#8fd8ff']); say('🙋 Gerettet! +10', 1.2); } }
    };
    function crash(why) { if (inv > 0) return; life--; G.why = (G.why || []).concat([why + '@' + Math.round(p.y) + ' t=' + t.toFixed(1)]); snd('bonk'); if (life <= 0) { over = true; M.over = true; say('💥 Bruchlandung!', 99); return; } inv = 1.6; const H = h.H(); p.y = lastY; p.vy = -H * .2; say('Autsch! Noch ' + life + ' ❤️', 1.2); }
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(); h.bg('#5bbcff', '#e8f8ff'); c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 5; i++) { const x = ((i * 280 - dist * .25) % (W + 260) + W + 260) % (W + 260) - 120; c.beginPath(); c.ellipse(x, 90 + i * 55, 60, 20, 0, 0, 6.283); c.fill(); }
      c.fillStyle = '#3aa0e8'; c.fillRect(0, H * .9, W, H); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 8; i++) c.fillRect(((i * 160 - dist * .6) % (W + 160) + W + 160) % (W + 160) - 80, H * .93 + (i % 3) * 8, 60, 4);
      for (const o of obs) { if (o.k === 'g') { c.fillStyle = '#7a6a58'; c.fillRect(o.x, 0, o.w, o.top); c.fillRect(o.x, o.bot, o.w, H - o.bot); c.fillStyle = '#4cb85a'; c.fillRect(o.x - 4, o.top - 10, o.w + 8, 10); c.fillRect(o.x - 4, o.bot, o.w + 8, 10); } else if (!o.dead) h.emoji('🦅', o.x, o.y, H * .09); }
      for (const it of items) if (!it.got) h.emoji(it.k === 's' ? '⭐' : '🙋', it.x, it.y + Math.sin(t * 5 + it.x) * 4, H * (it.k === 's' ? .07 : .09));
      if (!(inv > 0 && Math.floor(t * 14) % 2)) { c.save(); c.translate(p.x, p.y); c.rotate(clamp(p.vy / H * .35, -.35, .35)); h.emoji('🚁', 0, 0, H * .13); c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(-H * .06, -H * .055); c.lineTo(H * .06, -H * .055); c.stroke(); c.restore(); }
      hearts(life, 28, 76); if (msgT > 0 || over) h.text(msg, W / 2, H * .3, Math.min(40, W / 14), '#ffe27a'); if (t < 5 && !over) h.text('Halten = steigen · loslassen = sinken · Lücken treffen!', W / 2, H * .18, Math.min(24, W / 26), '#16335e');
    };
    return G;
  };

  /* =====================  🏙️ TAXI-RUSH  ===================== */
  const taxi = () => {
    const G = {}; let objs, t, dist, spawnAcc, life, inv, lane, px, over, msg, msgT, scroll, hitFlash;
    const LN = 4, geo = () => { const W = h.W(), H = h.H(), rw = Math.min(W * .66, 460), lw = rw / LN, x0 = (W - rw) / 2; return { W, H, rw, lw, x0, py: H * .8 }; };
    G.init = function () { objs = []; t = 0; dist = 0; spawnAcc = 0; life = 3; inv = 0; lane = 1; px = 1; over = false; msg = ''; msgT = 0; scroll = 0; hitFlash = 0; };
    G.resize = function () { };
    G.keydown = c => { if (c === 'ArrowLeft' || c === 'KeyA') lane = Math.max(0, lane - 1); else if (c === 'ArrowRight' || c === 'KeyD') lane = Math.min(LN - 1, lane + 1); };
    G.tap = x => { const g = geo(); if (x < g.x0 || x > g.x0 + g.rw) lane = clamp(lane + (x < g.W / 2 ? -1 : 1), 0, LN - 1); else lane = clamp(Math.floor((x - g.x0) / g.lw), 0, LN - 1); };
    G.move = x => { const g = geo(); lane = clamp(Math.floor((x - g.x0) / g.lw), 0, LN - 1); };
    G.dbg = () => ({ objs, lane, life, px, geo: geo(), setLane: l => { lane = l; } });
    const say = (s, d) => { msg = s; msgT = d || 1.2; };
    G.update = function (dt) {
      if (over) return; const g = geo(); t += dt; inv = Math.max(0, inv - dt); msgT = Math.max(0, msgT - dt); hitFlash = Math.max(0, hitFlash - dt);
      const v = g.H * (.55 + Math.min(.5, t * .008)); scroll += v * dt; dist += v * dt; px += (lane - px) * Math.min(1, dt * 14);
      /* Reihen: 1–3 Spuren belegt (Autos/Sperren), mindestens eine frei – dort liegen Fahrgäste und Münzen */
      spawnAcc += v * dt; const spacing = g.H * Math.max(.34, .52 - t * .0035);
      if (spawnAcc >= spacing) { spawnAcc = 0; const nb = 1 + (h.rnd() < Math.min(.6, .15 + t * .007) ? 1 : 0) + (h.rnd() < Math.min(.3, t * .004) ? 1 : 0), free = (h.rnd() * LN) | 0, used = [];
        for (let i = 0; i < LN && used.length < nb; i++) { const l = (free + 1 + ((h.rnd() * (LN - 1)) | 0) + i) % LN; if (l !== free && !used.includes(l)) used.push(l); }
        for (const l of used) objs.push({ k: h.rnd() < .22 ? 'x' : 'c', l, y: -g.lw * 1.4, col: ['#e0382b', '#2d6be0', '#4cd07d', '#9b4de0', '#ff8a1f'][(h.rnd() * 5) | 0], s: h.rnd() < .3 ? 1.5 : 1, near: false, rel: h.rnd() * .25 });
        const r = h.rnd(); objs.push({ k: r < .35 ? 'p' : 'o', l: free, y: -g.lw * 1.4, got: false }); if (r >= .35) objs.push({ k: 'o', l: free, y: -g.lw * 2.4, got: false }); }
      const my = g.py;
      for (const o of objs) {
        o.y += v * dt * (o.k === 'c' ? (.62 - (o.rel || 0)) : o.k === 'x' ? 1 : 1);
        const ox = g.x0 + (o.l + .5) * g.lw, hx = g.x0 + (px + .5) * g.lw, ph = o.k === 'c' ? g.lw * .95 * (o.s || 1) : g.lw * .7, dx = Math.abs(ox - hx), dy = Math.abs(o.y - my);
        if (o.k === 'c' || o.k === 'x') { if (dx < g.lw * .55 && dy < ph * .5 + g.lw * .42) { if (inv <= 0) { life--; inv = 1.4; hitFlash = .3; snd('bonk'); h.burst(ox, o.y, 14, ['#ffe27a', '#fff', '#ff8a1f']); if (life <= 0) { over = true; M.over = true; say('💥 Unfall! Fahrt beendet', 99); } else say('Autsch! Noch ' + life + ' ❤️', 1.1); } o.k = 'dead'; }
          else if (!o.near && o.y > my + g.lw * .3 && dx < g.lw * 1.15 && dx > g.lw * .55) { o.near = true; h.add(1, ox, my - 30); say('Knapp! +1', .7); } }
        else if (o.k === 'p' && !o.got && dx < g.lw * .6 && dy < g.lw * .7) { o.got = true; h.add(5, ox, o.y); snd('star'); h.burst(ox, o.y, 10, ['#ffe27a', '#fff']); }
        else if (o.k === 'o' && !o.got && dx < g.lw * .5 && dy < g.lw * .55) { o.got = true; h.add(1, ox, o.y); snd('ding'); }
      }
      objs = objs.filter(o => o.y < g.H + g.lw * 2 && o.k !== 'dead' && !o.got);
    };
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#ffb27a', '#ffe8cc');
      for (let i = 0; i < 2; i++) { const side = i ? g.x0 + g.rw : 0, wid = i ? W - side : g.x0; c.fillStyle = '#6b6f80'; c.fillRect(side, 0, wid, H); for (let y = -((scroll * .5) % 150); y < H; y += 150) { c.fillStyle = ['#8a6a9a', '#5a7aa8', '#a86a6a'][(Math.floor((y + scroll * .5) / 150) + i + 9) % 3]; c.fillRect(side + (i ? 12 : wid - 12 - wid * .6), y + 10, wid * .6, 120); c.fillStyle = 'rgba(255,230,150,.7)'; for (let k = 0; k < 3; k++) c.fillRect(side + (i ? 22 : wid - 12 - wid * .6 + 10) + k * 34, y + 30, 14, 18); } }
      c.fillStyle = '#3a3f4e'; c.fillRect(g.x0, 0, g.rw, H); c.fillStyle = '#ffd23f'; c.fillRect(g.x0 - 5, 0, 5, H); c.fillRect(g.x0 + g.rw, 0, 5, H); c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 1; i < LN; i++) for (let y = -((scroll) % 80); y < H; y += 80) c.fillRect(g.x0 + i * g.lw - 3, y, 6, 40);
      for (const o of objs) { const ox = g.x0 + (o.l + .5) * g.lw; if (o.k === 'c') car(c, ox, o.y, g.lw * .62, g.lw * .95 * (o.s || 1), o.col, false); else if (o.k === 'x') h.emoji('🚧', ox, o.y, g.lw * .8); else if (o.k === 'p') h.emoji('🙋', ox, o.y, g.lw * .75); else h.emoji('🪙', ox, o.y, g.lw * .5); }
      if (!(inv > 0 && Math.floor(t * 14) % 2)) car(c, g.x0 + (px + .5) * g.lw, g.py, g.lw * .62, g.lw * .95, '#ffd23f', true);
      if (hitFlash > 0) { c.fillStyle = 'rgba(255,60,60,' + hitFlash + ')'; c.fillRect(0, 0, W, H); }
      hearts(life, 28, 76); if (msgT > 0 || over) h.text(msg, W / 2, H * .3, Math.min(36, W / 16), '#fff'); if (t < 5 && !over) h.text('Tippen/Ziehen oder ←/→: Spur wechseln · 🙋 +5', W / 2, H * .16, Math.min(22, W / 28), '#fff');
    };
    function car(c, x, y, w, hh, col, taxiMark) { c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, x - w / 2 + 4, y - hh / 2 + 6, w, hh, 10); c.fill(); c.fillStyle = col; rr(c, x - w / 2, y - hh / 2, w, hh, 10); c.fill(); c.fillStyle = 'rgba(190,230,255,.9)'; rr(c, x - w * .38, y - hh * .22, w * .76, hh * .22, 5); c.fill(); rr(c, x - w * .36, y + hh * .2, w * .72, hh * .16, 4); c.fill(); c.fillStyle = '#fff4b0'; c.fillRect(x - w * .4, y - hh / 2, w * .16, 5); c.fillRect(x + w * .24, y - hh / 2, w * .16, 5); if (taxiMark) { c.fillStyle = '#222'; rr(c, x - w * .22, y - hh * .02, w * .44, hh * .13, 3); c.fill(); h.text('TAXI', x, y + hh * .045, Math.max(9, hh * .1), '#ffd23f'); } }
    return G;
  };

  /* =====================  🎢 DOSEN-KNALL  ===================== */
  const cans = () => {
    const G = {}; let ball, cn, rack, shots, aim, aimX, aimY, t, over, msg, msgT, wait, stage, shelf, hitThisShot, score0;
    const geo = () => { const W = h.W(), H = h.H(); return { W, H, gy: H * .88, r: H * .03, cw: H * .062, chh: H * .082, g: H * 1.7, bx: W * .14, by: H * .72, vmax: Math.sqrt(W * .75 * H * 1.7) * 1.15, drag: H * .3 }; };
    G.init = function () { const g = geo(); stage = 0; shots = 3; t = 0; over = false; msg = ''; msgT = 0; aim = false; ball = null; wait = 0; hitThisShot = 0; newRack(); };
    G.resize = function () { };
    function newRack() { const g = geo(); stage++; shots = 3; cn = []; const rows = stage <= 2 ? 3 : 4, sx = g.W * (.58 + h.rnd() * .12), top = g.H * (.52 + h.rnd() * .06); shelf = { x0: sx - g.cw * (rows + 1.2), x1: sx + g.cw * (rows + 1.2), y: top };
      for (let r = 0; r < rows; r++) for (let i = 0; i <= (rows - 1 - r); i++) cn.push({ x: sx + (i - (rows - 1 - r) / 2) * g.cw * 1.04, y: top - g.chh * (r + .5), vx: 0, vy: 0, a: 0, va: 0, st: 1, gold: false, out: false });
      cn[cn.length - 1].gold = true; hitThisShot = 0; ball = null; wait = 0; if (stage > 1) say('Nächste Pyramide! (' + stage + '/5)', 1.4); }
    const say = (s, d) => { msg = s; msgT = d || 1.3; };
    function vel(x, y) { const g = geo(), dx = g.bx - x, dy = g.by - y, l = Math.min(Math.hypot(dx, dy), g.drag); const a = Math.atan2(dy, dx); return { vx: Math.cos(a) * l / g.drag * g.vmax, vy: Math.sin(a) * l / g.drag * g.vmax, l }; }
    G.tap = (x, y) => { if (over || ball || wait > 0) return; const g = geo(); if (Math.hypot(x - g.bx, y - g.by) < g.H * .22) { aim = true; aimX = x; aimY = y; } };
    G.move = (x, y) => { if (aim) { aimX = x; aimY = y; } };
    G.up = () => { if (!aim) return; aim = false; const g = geo(), v = vel(aimX, aimY); if (v.l < g.H * .035) return; ball = { x: g.bx, y: g.by, vx: v.vx, vy: v.vy, t: 0, bounces: 0 }; shots--; hitThisShot = 0; snd('whoosh'); };
    G.dbg = () => ({ cn, ball, shots, stage, shelf, launch: (vx, vy) => { const g = geo(); ball = { x: g.bx, y: g.by, vx, vy, t: 0, bounces: 0 }; shots--; hitThisShot = 0; }, vel: v => vel(v[0], v[1]) });
    G.update = function (dt) {
      if (over) return; const g = geo(); t += dt; msgT = Math.max(0, msgT - dt); const n = Math.ceil(dt * 120);
      for (let s = 0; s < n; s++) physics(dt / n, g);
      if (!ball && wait > 0) { wait -= dt; if (wait <= 0) { if (cn.every(q => q.out)) { h.add(5 + shots, g.W / 2, g.H * .4); say('🥫 Alle weg! Bonus', 1.5); snd('fanfare'); if (stage >= 5) { over = true; M.over = true; return; } newRack(); } else if (shots <= 0) { if (stage >= 5) { over = true; M.over = true; return; } newRack(); } } }
    };
    function physics(dt, g) {
      if (ball) { ball.t += dt; ball.vy += g.g * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.y > g.gy - g.r) { ball.y = g.gy - g.r; ball.vy *= -.45; ball.vx *= .8; ball.bounces++; } if (ball.x > g.W - g.r) { ball.x = g.W - g.r; ball.vx *= -.4; }
        for (const q of cn) { if (q.out) continue; const rx = Math.abs(ball.x - q.x) - g.cw / 2, ry = Math.abs(ball.y - q.y) - g.chh / 2; if (rx < g.r && ry < g.r && (rx < 0 || ry < 0 || Math.hypot(rx, ry) < g.r)) { q.st = 0; q.vx += ball.vx * .7; q.vy += ball.vy * .5 - g.H * .35; q.va += ball.vx * .01; ball.vx *= .55; ball.vy *= -.35; ball.x -= Math.sign(ball.vx || 1) * 2; snd('bonk'); h.burst(q.x, q.y, 6, ['#ffe27a', '#fff', '#c0c8d8']); } }
        if (ball.x < -50 || ball.t > 4 || (ball.bounces > 3) || (Math.hypot(ball.vx, ball.vy) < 12 && ball.y > g.gy - g.r - 2)) { ball = null; wait = 1.1; } }
      /* wacklige Dosen: wer keine Stütze mehr hat, fällt */
      for (const q of cn) if (q.st && !q.out) { const sup = q.y + g.chh / 2 >= shelf.y - 1 || cn.some(o => o !== q && !o.out && o.st && Math.abs(o.x - q.x) < g.cw * 1.05 && o.y > q.y && o.y - q.y < g.chh * 1.2); if (!sup) q.st = 0; }
      for (const q of cn) { if (q.st || q.out) continue; q.vy += g.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.a += q.va * dt; const onShelf = q.x > shelf.x0 && q.x < shelf.x1;
        if (onShelf && q.y + g.chh / 2 > shelf.y && q.y - g.chh / 2 < shelf.y + g.chh) { q.y = shelf.y - g.chh / 2; q.vy *= -.25; q.vx *= .985; q.va *= .9; }
        if (q.y > g.gy - g.chh / 2) { q.y = g.gy - g.chh / 2; q.vy *= -.25; q.vx *= .9; }
        if (q.y > shelf.y + g.chh * .9 && !q.out) { q.out = true; const pts = q.gold ? 5 : 2; h.add(pts, q.x, q.y - 20); hitThisShot++; snd('ding'); if (hitThisShot >= 3 && hitThisShot % 3 === 0) { h.add(2, q.x, q.y - 50); say('Kombo! +2', .9); } }
        if (q.x > g.W + 40 || q.x < -40) q.out = true; }
      for (let i = 0; i < cn.length; i++) for (let j = i + 1; j < cn.length; j++) { const a = cn[i], b = cn[j]; if (a.out || b.out || (a.st && b.st)) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = g.cw * .95; if (d < m && d > 1e-3) { const nx = dx / d, ny = dy / d, o = (m - d) / 2; if (!a.st) { a.x -= nx * o; a.y -= ny * o; } if (!b.st) { b.x += nx * o; b.y += ny * o; } const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const imp = -rv * .7; if (!a.st) { a.vx -= nx * imp; a.vy -= ny * imp; } if (!b.st) { b.vx += nx * imp; b.vy += ny * imp; } if (a.st) { a.st = 0; } if (b.st) { b.st = 0; } } } }
    }
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#ff9acb', '#ffe9b8'); c.fillStyle = '#7a4a2a'; c.fillRect(0, g.gy, W, H); c.fillStyle = '#a8703c'; c.fillRect(0, g.gy, W, 8);
      for (let i = 0; i < 14; i++) { c.fillStyle = COLS[i % 6]; c.beginPath(); c.moveTo(i * W / 13, 0); c.lineTo(i * W / 13 + W / 26, H * .08); c.lineTo(i * W / 13 + W / 13, 0); c.closePath(); c.fill(); }
      c.fillStyle = '#8a5a33'; rr(c, shelf.x0, shelf.y, shelf.x1 - shelf.x0, g.chh * .7, 6); c.fill(); c.fillRect(shelf.x0 + 14, shelf.y, 12, g.gy - shelf.y); c.fillRect(shelf.x1 - 26, shelf.y, 12, g.gy - shelf.y);
      for (const q of cn) { if (q.out) continue; c.save(); c.translate(q.x, q.y); c.rotate(q.a); c.fillStyle = q.gold ? '#ffd23f' : COLS[(Math.round(q.x / g.cw) + 60) % 6]; rr(c, -g.cw / 2, -g.chh / 2, g.cw, g.chh, 5); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-g.cw / 2 + 4, -g.chh / 2 + 6, g.cw - 8, 5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-g.cw / 2 + 4, g.chh / 2 - 10, g.cw - 8, 5); c.restore(); }
      /* Schleuder + Vorschau */
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 8; c.beginPath(); c.moveTo(g.bx, g.by + g.r * 3); c.lineTo(g.bx, g.gy); c.moveTo(g.bx - g.r * 2.2, g.by - g.r * .5); c.lineTo(g.bx, g.by + g.r * 2); c.lineTo(g.bx + g.r * 2.2, g.by - g.r * .5); c.stroke();
      if (aim) { const v = vel(aimX, aimY); let x = g.bx, y = g.by, vx = v.vx, vy = v.vy; c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 26; i++) { x += vx * .045; y += vy * .045; vy += g.g * .045; if (y > g.gy) break; c.beginPath(); c.arc(x, y, Math.max(2.5, 5 - i * .12), 0, 6.283); c.fill(); } c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.bx - g.r * 2.2, g.by - g.r * .5); c.lineTo(aimX, aimY); c.lineTo(g.bx + g.r * 2.2, g.by - g.r * .5); c.stroke(); }
      const bp = ball || (aim ? { x: aimX, y: aimY } : (shots > 0 && wait <= 0 ? { x: g.bx, y: g.by } : null)); if (bp) { c.fillStyle = '#e0382b'; c.beginPath(); c.arc(bp.x, bp.y, g.r, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(bp.x - g.r * .3, bp.y - g.r * .3, g.r * .35, 0, 6.283); c.fill(); }
      for (let i = 0; i < shots; i++) { c.fillStyle = '#e0382b'; c.beginPath(); c.arc(30 + i * 28, 100, 10, 0, 6.283); c.fill(); } h.text('Pyramide ' + Math.min(stage, 5) + '/5', W - 20, 70, 22, '#fff', 'right');
      if (msgT > 0) h.text(msg, W / 2, H * .3, Math.min(34, W / 18), '#fff'); if (t < 6 && stage === 1) h.text('Ball ziehen, zielen und loslassen!', W / 2, H * .18, Math.min(26, W / 24), '#16335e');
    };
    return G;
  };

  /* =====================  🌈 PRIDE-DISCO (Rhythmus)  ===================== */
  const dance = () => {
    const G = {}, BPM = 124, SPB = 60 / BPM, LEAD = 2, BARS = 28; let notes, a0, fb, clk, combo, best, hitN, missN, over, jt, jtT, flash, sched, endAt, started;
    const FREQ = [261.6, 329.6, 392, 523.3], BASS = [130.8, 98, 110, 87.3], GL = ['◀', '▼', '▲', '▶'], KEYS = [['KeyD', 'ArrowLeft'], ['KeyF', 'ArrowDown'], ['KeyJ', 'ArrowUp'], ['KeyK', 'ArrowRight']], LC = ['#ff3b3b', '#ffe14a', '#4cd07d', '#3fa0ff'];
    const geo = () => { const W = h.W(), H = h.H(), lw = Math.min(W * .17, 120), x0 = W / 2 - lw * 2, hy = H * .78; return { W, H, lw, x0, hy, fall: 1.7 }; };
    G.init = function () { notes = []; combo = 0; best = 0; hitN = 0; missN = 0; over = false; jt = ''; jtT = 0; flash = [0, 0, 0, 0]; fb = -.3; a0 = A.now() + .3; clk = -.3; sched = 0; started = false;
      const r = h.rnd; let prev = 1; for (let b = 0; b < BARS; b++) for (let s = 0; s < 8; s++) { const p = .42 + b / BARS * .3 + (s % 2 === 0 ? .18 : 0); if (b < 1 && s > 3) continue; if (r() < p) { let l = clamp(prev + [-1, 0, 1, 1, -2, 2][(r() * 6) | 0], 0, 3); if (notes.length > 1 && notes[notes.length - 1].l === l && notes[notes.length - 2].l === l) l = (l + 1 + ((r() * 2) | 0)) % 4; const t = LEAD + (b * 8 + s) * SPB / 2; notes.push({ t, l, hit: false, miss: false, g: 0 }); prev = l; if (b > 6 && r() < .1 + b / BARS * .12) notes.push({ t, l: (l + 2) % 4, hit: false, miss: false, g: 0 }); } }
      endAt = LEAD + BARS * 4 * SPB + 1.2; };
    G.resize = function () { };
    const press = l => {
      if (over) return; flash[l] = .18; let best2 = null, bd = .24; for (const n of notes) if (n.l === l && !n.hit && !n.miss) { const d = Math.abs(n.t - clk); if (d < bd) { bd = d; best2 = n; } }
      if (!best2) { combo = 0; return; } best2.hit = true; const g = bd < .07 ? 3 : bd < .14 ? 2 : 1; best2.g = g; combo++; hitN++; if (combo > best) best = combo; const mult = 1 + Math.min(3, Math.floor(combo / 10)), pts = g * mult; const geo2 = geo();
      h.add(pts, geo2.x0 + (l + .5) * geo2.lw, geo2.hy - 50); h.burst(geo2.x0 + (l + .5) * geo2.lw, geo2.hy, g === 3 ? 14 : 7, [LC[l], '#fff', '#ffe27a']); jt = g === 3 ? 'PERFEKT!' : g === 2 ? 'Gut!' : 'Okay'; jtT = .5; A.note(FREQ[l] * (1 + (Math.floor(clk / (SPB * 4)) % 2) * 1), .35, 'triangle', .12, 0);
    };
    G.keydown = c => { for (let l = 0; l < 4; l++) if (KEYS[l].includes(c)) press(l); };
    G.tap = x => { const g = geo(); press(clamp(Math.floor((x - g.x0) / g.lw), 0, 3)); };
    G.dbg = () => ({ notes, clk, combo, hitN, missN, press, over });
    G.update = function (dt) {
      if (over) return; fb += dt; const ac = A.now(); clk = ac > 0 ? ac - a0 : fb; jtT = Math.max(0, jtT - dt); for (let i = 0; i < 4; i++) flash[i] = Math.max(0, flash[i] - dt);
      /* Begleitung (Kick, Snare, Hi-Hat, Bass) ein Stück vorausplanen */
      const half = SPB / 2; while (sched * half <= clk + .5) { const tt = sched * half, delay = Math.max(0, tt - clk), beat = Math.floor(sched / 2), bar = Math.floor(beat / 4), inb = beat % 4;
        if (sched % 2 === 0) { A.drum('k', delay); if (inb === 1 || inb === 3) A.drum('s', delay); if (inb % 2 === 0) A.note(BASS[bar % 4], SPB * 1.6, 'sine', .18, delay); } else A.drum('h', delay); sched++; if (tt > endAt) break; }
      for (const n of notes) if (!n.hit && !n.miss && clk - n.t > .24) { n.miss = true; missN++; combo = 0; jt = 'Daneben'; jtT = .4; }
      if (clk > endAt) { over = true; M.over = true; }
    };
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H, bp = Math.floor(clk / SPB), ph = (clk / SPB) % 1; h.bg('#1d0f3d', '#5a2a8a');
      for (let i = 0; i < 6; i++) { c.fillStyle = COLS[i]; c.globalAlpha = .22 + (bp % 6 === i ? .25 * (1 - ph) : 0); c.fillRect(0, H * .1 + i * H * .1, W, H * .1); } c.globalAlpha = 1;
      for (let l = 0; l < 4; l++) { c.fillStyle = 'rgba(255,255,255,' + (.08 + flash[l] * 2) + ')'; c.fillRect(g.x0 + l * g.lw + 3, 0, g.lw - 6, H); c.fillStyle = LC[l]; c.globalAlpha = .75; rr(c, g.x0 + l * g.lw + 8, g.hy - g.lw * .36, g.lw - 16, g.lw * .72, 14); c.lineWidth = 5; c.strokeStyle = LC[l]; c.stroke(); c.globalAlpha = 1; h.text(GL[l], g.x0 + (l + .5) * g.lw, g.hy, g.lw * .4, 'rgba(255,255,255,.55)'); }
      for (const n of notes) { if (n.hit) continue; const y = g.hy - (n.t - clk) / g.fall * g.hy; if (y < -40 || y > H + 40) continue; const x = g.x0 + (n.l + .5) * g.lw; c.globalAlpha = n.miss ? .3 : 1; c.fillStyle = LC[n.l]; c.beginPath(); c.arc(x, y, g.lw * .36, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); h.text(GL[n.l], x, y + 2, g.lw * .38, '#fff'); c.globalAlpha = 1; }
      const dy = Math.abs(Math.sin(clk * Math.PI / SPB)) * H * .05; h.emoji(bp % 2 ? '🕺' : '💃', W * .12, H * .62 - dy, H * .16); h.emoji(bp % 2 ? '💃' : '🕺', W * .88, H * .62 - dy, H * .16); h.emoji('🐕', W * .5, H * .12 - dy * .5, H * .1);
      if (combo > 1) h.text(combo + ' Kombo ×' + (1 + Math.min(3, Math.floor(combo / 10))), W / 2, H * .24, Math.min(34, W / 20), '#ffe27a'); if (jtT > 0) h.text(jt, W / 2, H * .34, Math.min(46, W / 14), jt === 'PERFEKT!' ? '#ffe27a' : jt === 'Daneben' ? '#ff8a8a' : '#fff');
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(W * .3, 58, W * .4, 6); c.fillStyle = '#ffd23f'; c.fillRect(W * .3, 58, W * .4 * clamp(clk / endAt, 0, 1), 6);
      if (clk < LEAD * .9) h.text('Pfeile im Takt treffen: D F J K · ←↓↑→ · oder auf die Spuren tippen', W / 2, H * .46, Math.min(24, W / 26), '#fff');
      if (over) h.text(hitN + ' Treffer · Bester Kombo ' + best, W / 2, H * .3, Math.min(34, W / 18), '#ffe27a');
    };
    return G;
  };

  /* =====================  🐉 DRACHENFLUG (Drachenhöhen, Ring-Flug in Pseudo-3D)  ===================== */
  const flug = () => {
    const G = {}; let rings, items, px, py, tx, ty, t, life, over, msg, msgT, zoff, combo, inv, ph;
    const ZMAX = 26, geo = () => { const W = h.W(), H = h.H(); return { W, H, cx: W / 2, cy: H * .46, S: Math.min(W, H) * .62 }; };
    G.init = function () { rings = []; items = []; px = 0; py = 0; tx = 0; ty = 0; t = 0; life = 3; over = false; msg = ''; msgT = 0; zoff = 0; combo = 0; inv = 0; ph = 0; for (let i = 0; i < 6; i++) spawn(8 + i * 4); };
    G.resize = function () { };
    function spawn(z) { const r = h.rnd, a = r() * 6.283, d = r() * Math.min(.85, .3 + t * .01); rings.push({ z, x: Math.cos(a) * d, y: Math.sin(a) * d * .8, got: false, miss: false }); const k = r();
      for (let j = 1; j <= 2; j++) if (k < .8) items.push({ k: 'g', z: z + j * 1.4, x: Math.cos(a) * d * (1 - j * .12), y: Math.sin(a) * d * .8, got: false }); if (r() < Math.min(.55, .12 + t * .008)) items.push({ k: 'x', z: z + 2, x: (r() - .5) * 1.7, y: (r() - .5) * 1.4, got: false }); }
    const key = { l: 0, r: 0, u: 0, d: 0 }; G.keydown = c => { if (c === 'ArrowLeft' || c === 'KeyA') key.l = 1; else if (c === 'ArrowRight' || c === 'KeyD') key.r = 1; else if (c === 'ArrowUp' || c === 'KeyW') key.u = 1; else if (c === 'ArrowDown' || c === 'KeyS') key.d = 1; };
    G.keyup = c => { if (c === 'ArrowLeft' || c === 'KeyA') key.l = 0; else if (c === 'ArrowRight' || c === 'KeyD') key.r = 0; else if (c === 'ArrowUp' || c === 'KeyW') key.u = 0; else if (c === 'ArrowDown' || c === 'KeyS') key.d = 0; };
    const aim = (x, y) => { const g = geo(); tx = clamp((x - g.cx) / (g.W * .36), -1, 1); ty = clamp((y - g.cy) / (g.H * .34), -1, 1); };
    G.tap = (x, y) => aim(x, y); G.move = (x, y) => aim(x, y);
    G.dbg = () => ({ rings, items, px, py, life, aim: (a, b) => { tx = a; ty = b; } });
    const say = (s, d) => { msg = s; msgT = d || 1.2; };
    G.update = function (dt) {
      if (over) return; t += dt; ph += dt; inv = Math.max(0, inv - dt); msgT = Math.max(0, msgT - dt); const v = 7 + Math.min(9, t * .17);
      tx = clamp(tx + (key.r - key.l) * dt * 2.2, -1, 1); ty = clamp(ty + (key.d - key.u) * dt * 2.2, -1, 1); px += (tx - px) * Math.min(1, dt * 6); py += (ty - py) * Math.min(1, dt * 6);
      for (const r of rings) r.z -= v * dt; for (const it of items) it.z -= v * dt;
      for (const r of rings) if (!r.got && !r.miss && r.z <= 1) { const d = Math.hypot(r.x - px, r.y - py); if (d < .3) { r.got = true; combo++; const perfect = d < .1; h.add(3 + (perfect ? 2 : 0) + Math.min(3, combo - 1), h.W() / 2, h.H() * .4); snd(perfect ? 'star' : 'ding'); say(perfect ? 'Perfekt!' : 'Ring!', .6); h.burst(h.W() / 2, h.H() * .46, 12, ['#ffe27a', '#fff', '#8fd8ff']); } else { r.miss = true; combo = 0; } }
      for (const it of items) if (!it.got && it.z <= 1 && it.z > -1) { const d = Math.hypot(it.x - px, it.y - py); if (d < (it.k === 'g' ? .26 : .22)) { it.got = true; if (it.k === 'g') { h.add(1, h.W() / 2, h.H() * .52); snd('ding'); } else if (inv <= 0) { life--; inv = 1.4; combo = 0; snd('bonk'); say('Autsch! Gewitterwolke!', 1); if (life <= 0) { over = true; M.over = true; say('💥 Bruchlandung!', 99); } } } }
      rings = rings.filter(r => r.z > -1); items = items.filter(i => i.z > -1.5); let far = rings.reduce((m, r) => Math.max(m, r.z), 0); while (far < ZMAX) { far += 4 - Math.min(1.2, t * .02); spawn(far); }
    };
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#2a1d5a', '#ff9a6c'); c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(W * .75, H * .25, H * .09, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(40,30,90,.55)'; for (let i = 0; i < 7; i++) { const x = ((i * 190 - px * 60 - t * 12) % (W + 260) + W + 260) % (W + 260) - 130; c.beginPath(); c.moveTo(x, H * .75); c.lineTo(x + 90, H * (.5 + (i % 3) * .06)); c.lineTo(x + 180, H * .75); c.fill(); } c.fillStyle = 'rgba(255,255,255,.14)'; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283, f = ((t * 1.3 + i * .37) % 1); c.fillRect(g.cx + Math.cos(a) * f * W * .7, g.cy + Math.sin(a) * f * H * .7, 3 + f * 8, 3 + f * 8); }
      const draw = [], proj = (x, y, z) => { const k = 1 / Math.max(.15, z); return [g.cx + (x - px) * g.S * k, g.cy + (y - py) * g.S * k, k]; };
      for (const r of rings) draw.push({ z: r.z, r }); for (const it of items) draw.push({ z: it.z, it }); draw.sort((a, b) => b.z - a.z);
      for (const d of draw) { if (d.r) { const r = d.r, [x, y, k] = proj(r.x, r.y, r.z); const R = g.S * .3 * k; c.lineWidth = Math.max(2, 14 * k); c.strokeStyle = r.got ? 'rgba(120,255,160,' + Math.max(0, r.z + 1) / 2 + ')' : r.miss ? 'rgba(150,150,170,.35)' : (r === rings.find(q => !q.got && !q.miss) ? '#ffd23f' : '#9ab8ff'); c.beginPath(); c.arc(x, y, R, 0, 6.283); c.stroke(); }
        else { const it = d.it; if (it.got) continue; const [x, y, k] = proj(it.x, it.y, it.z); if (it.k === 'g') h.emoji('💎', x, y, g.S * .16 * k); else h.emoji('⛈️', x, y, g.S * .3 * k); } }
      /* Drache (Zündel von hinten) */
      if (!(inv > 0 && Math.floor(t * 14) % 2)) { const x = g.cx, y = g.cy + g.S * .55, f = Math.sin(ph * 12); c.save(); c.translate(x + px * 20, y + py * 14); c.rotate((tx - px) * .5); c.fillStyle = '#6cc6ff'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 18, -6); c.quadraticCurveTo(sd * 90, -50 - f * 22, sd * 70, 8); c.quadraticCurveTo(sd * 40, -2, sd * 18, 6); c.fill(); } c.fillStyle = '#5fd6a8'; c.beginPath(); c.ellipse(0, 0, 24, 30, 0, 0, 6.283); c.fill(); c.fillStyle = '#ffb347'; c.beginPath(); c.ellipse(0, 6, 14, 20, 0, 0, 6.283); c.fill(); c.fillStyle = '#5fd6a8'; c.beginPath(); c.arc(0, -34, 17, 0, 6.283); c.fill(); c.fillStyle = '#fff0c8'; c.beginPath(); c.moveTo(-12, -44); c.lineTo(-18, -62); c.lineTo(-5, -48); c.moveTo(12, -44); c.lineTo(18, -62); c.lineTo(5, -48); c.fill(); c.restore(); }
      for (let i = 0; i < life; i++) h.emoji('❤️', 28 + i * 30, 76, 26); if (combo > 1) h.text('Kombo ×' + combo, W / 2, H * .17, Math.min(30, W / 22), '#ffe27a'); if (msgT > 0 || over) h.text(msg, W / 2, H * .3, Math.min(38, W / 15), '#fff'); if (t < 5 && !over) h.text('Ziehen/Tippen oder ←→↑↓: Flieg durch die Ringe, sammle 💎, weiche ⛈️ aus!', W / 2, H * .88, Math.min(22, W / 28), '#fff');
    };
    return G;
  };

  /* =====================  🏗️ HAFEN-KRAN (Dampfer-Hafen, Kisten stapeln)  ===================== */
  const crane = () => {
    const G = {}; let blocks, cur, spd, t, over, msg, msgT, fall, streak, camY, pos;
    const geo = () => { const W = h.W(), H = h.H(); return { W, H, bh: Math.min(H * .075, 46), bw0: Math.min(W * .36, 250), base: H * .88 }; };
    G.init = function () { const g = geo(); blocks = [{ x: g.W / 2, w: g.bw0 }]; spd = 1; t = 0; over = false; msg = ''; msgT = 0; fall = []; streak = 0; camY = 0; pos = 0; spawn(); };
    G.resize = function () { };
    function spawn() { const g = geo(), w = blocks[blocks.length - 1].w; cur = { w, ph: 0 }; }
    const drop = () => {
      if (over || !cur) return; const g = geo(), top = blocks[blocks.length - 1], x = cur.x, a0 = Math.max(x - cur.w / 2, top.x - top.w / 2), a1 = Math.min(x + cur.w / 2, top.x + top.w / 2), ov = a1 - a0;
      if (ov <= 4) { fall.push({ x, y: 0, w: cur.w, vy: 0, i: blocks.length, a: 0 }); over = true; M.over = true; msg = '💥 Daneben! ' + (blocks.length - 1) + ' Kisten hoch'; msgT = 99; snd('bonk'); cur = null; return; }
      const perfect = Math.abs(x - top.x) < 7; let nx = (a0 + a1) / 2, nw = ov; if (perfect) { nx = top.x; nw = Math.min(g.bw0, top.w + (top.w < g.bw0 ? 8 : 0)); streak++; } else { streak = 0; const cut = cur.w - ov; fall.push({ x: x < top.x ? a0 - cut / 2 : a1 + cut / 2, y: 0, w: cut, vy: 0, i: blocks.length, a: 0 }); }
      blocks.push({ x: nx, w: nw }); h.add(perfect ? 2 + Math.min(3, streak - 1) : 1, nx, g.base - blocks.length * g.bh + camY); snd(perfect ? 'star' : 'ding'); if (perfect) { msg = streak > 1 ? 'Perfekt ×' + streak + '!' : 'Perfekt!'; msgT = .8; h.burst(nx, g.base - blocks.length * g.bh + camY, 10, ['#fff', '#ffe27a']); } spd = Math.min(2.6, 1 + blocks.length * .05); spawn();
    };
    G.tap = () => drop(); G.keydown = c => { if (c === 'Space' || c === 'ArrowDown' || c === 'Enter') drop(); };
    G.dbg = () => ({ blocks, cur, drop, over });
    G.update = function (dt) {
      if (over) { for (const f of fall) { f.vy += 1500 * dt; f.y += f.vy * dt; f.a += dt * 2; } return; } const g = geo(); t += dt; msgT = Math.max(0, msgT - dt); pos += dt * spd * 1.5; const span = g.W * .5 - cur.w / 2 - 20; cur.x = g.W / 2 + Math.sin(pos * 1.4) * span * (.55 + Math.min(.45, blocks.length * .02));
      for (const f of fall) { f.vy += 1500 * dt; f.y += f.vy * dt; f.a += dt * 2; } fall = fall.filter(f => f.y < g.H); const wantCam = Math.max(0, (blocks.length - 5) * g.bh); camY += (wantCam - camY) * Math.min(1, dt * 4);
    };
    const crate = (c, x, y, w, hh, k) => { c.fillStyle = k % 2 ? '#b9b9b9' : '#a8a8a8'; c.fillRect(x - w / 2, y, w, hh); c.strokeStyle = '#555'; c.lineWidth = 3; c.strokeRect(x - w / 2, y, w, hh); c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y + hh); c.moveTo(x + w / 2, y); c.lineTo(x - w / 2, y + hh); c.stroke(); c.fillStyle = '#222'; c.fillRect(x - w / 2 + 4, y + 4, 8, 8); c.fillRect(x + w / 2 - 12, y + 4, 8, 8); };
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#e8e8e8', '#9a9a9a'); c.fillStyle = '#b4b4b4'; c.fillRect(0, H * .9, W, H); c.fillStyle = '#7a7a7a'; c.fillRect(0, g.base, W, H);
      c.fillStyle = '#1e1e22'; for (let i = 0; i < 3; i++) { const x = (i * W * .42 + t * 14) % (W + 200) - 100, y = H * .78; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 150, y); c.lineTo(x + 125, y + 26); c.lineTo(x + 20, y + 26); c.closePath(); c.fill(); c.fillStyle = '#f4f4f4'; c.fillRect(x + 40, y - 22, 50, 22); c.fillStyle = '#1e1e22'; c.fillRect(x + 100, y - 40, 14, 40); }
      /* Kran-Ausleger oben */ c.fillStyle = '#222'; c.fillRect(0, 26, W, 14); c.fillRect(W / 2 - 6, 26, 12, 16);
      blocks.forEach((b, i) => crate(c, b.x, g.base - (i + 1) * g.bh + camY, b.w, g.bh, i));
      for (const f of fall) { c.save(); c.translate(f.x, g.base - f.i * g.bh + camY + f.y); c.rotate(f.a); crate(c, 0, 0, f.w, g.bh, 1); c.restore(); }
      if (cur && !over) { const y = g.base - (blocks.length + 1) * g.bh + camY - g.bh * 1.4; c.strokeStyle = '#444'; c.lineWidth = 3; c.beginPath(); c.moveTo(cur.x, 40); c.lineTo(cur.x, Math.max(40, y)); c.stroke(); crate(c, cur.x, Math.max(48, y), cur.w, g.bh, 3); }
      if (msgT > 0 || over) h.text(msg, W / 2, H * .3, Math.min(38, W / 15), '#16335e'); if (t < 5 && !over) h.text('Tippen: Kiste fallen lassen – möglichst genau auf die darunter!', W / 2, H * .17, Math.min(24, W / 26), '#16335e');
      h.text(blocks.length - 1 + ' 📦', W - 20, 70, 26, '#16335e', 'right');
    };
    return G;
  };


  /* =====================  🏗️ PIXEL-PLAN (Bauland)  ===================== */
  /* Merkspiel: Bauplan kurz ansehen, dann Farbe wählen und die Felder aus dem Gedächtnis nachbauen. Muster wachsen von 3×3 bis 5×5. */
  const plan = () => {
    const G = {}, PAL = ['#ff3b3b', '#3f8cff', '#ffd23f', '#4cd07d', '#a66bff', '#ff8a1f']; let lv, n, ncol, pat, grid, phase, pt, sel, msg, msgT, ok;
    const lay = () => { const W = h.W(), H = h.H(), s = Math.min(W * .84 / n, H * .46 / n, 110); return { W, H, s, gx: (W - s * n) / 2, gy: H * .17, pw: Math.min(64, W / (ncol + 1.5)), py: H * .77 }; };
    function next() { n = lv < 3 ? 3 : lv < 6 ? 4 : 5; ncol = Math.min(6, 3 + (lv >> 1)); pat = []; grid = []; for (let i = 0; i < n * n; i++) { pat.push((h.rnd() * ncol) | 0); grid.push(-1); } phase = 'show'; pt = 1.2 + n * n * .22 - Math.min(1.2, lv * .08); sel = 0; }
    G.init = function () { lv = 0; msg = ''; msgT = 0; ok = 0; next(); };
    G.resize = function () { };
    function check() {
      const L = lay(); ok = 0; for (let i = 0; i < pat.length; i++) if (grid[i] === pat[i]) { ok++; h.add(1, L.gx + (i % n + .5) * L.s, L.gy + ((i / n | 0) + .5) * L.s); }
      const perfect = ok === pat.length; if (perfect) { h.add(5, L.W / 2, L.gy - 10); snd('star'); msg = 'Perfekt! +5'; h.burst(L.W / 2, L.gy + n * L.s / 2, 16, ['#fff', '#ffe27a', '#ff8fc8']); } else { snd('ding'); msg = ok + ' von ' + pat.length + ' richtig'; }
      msgT = 1.6; phase = 'check'; pt = 1.6; if (perfect || ok >= Math.ceil(pat.length * .7)) lv++;
    }
    const act = (x, y) => {
      const L = lay(); if (phase !== 'build') return;
      for (let k = 0; k < ncol; k++) { const px = L.W / 2 + (k - (ncol - 1) / 2) * (L.pw + 8); if (Math.abs(x - px) < L.pw / 2 + 4 && Math.abs(y - L.py) < L.pw / 2 + 4) { sel = k; snd('pop'); return; } }
      const bx = L.W / 2, by = L.H * .91; if (Math.abs(x - bx) < 90 && Math.abs(y - by) < 28) { if (grid.every(v => v >= 0)) check(); else { msg = 'Fülle erst alle Felder'; msgT = 1.2; } return; }
      const cx = Math.floor((x - L.gx) / L.s), cy = Math.floor((y - L.gy) / L.s); if (cx >= 0 && cy >= 0 && cx < n && cy < n) { grid[cy * n + cx] = sel; snd('pop'); if (grid.every(v => v >= 0)) { /* automatisch prüfen, wenn alles gefüllt ist */ } }
    };
    G.tap = (x, y) => act(x, y); G.keydown = c => { const d = parseInt(c.replace('Digit', ''), 10); if (d >= 1 && d <= ncol) sel = d - 1; if (c === 'Enter' && phase === 'build' && grid.every(v => v >= 0)) check(); };
    G.update = function (dt) {
      msgT = Math.max(0, msgT - dt); pt -= dt;
      if (phase === 'show' && pt <= 0) { phase = 'build'; pt = 0; snd('whoosh'); }
      else if (phase === 'check' && pt <= 0) next();
    };
    G.draw = function () {
      const c = h.ctx(), L = lay(), W = L.W, H = L.H; h.bg('#9ad7ff', '#e8f7ff'); c.fillStyle = '#7fd66b'; c.fillRect(0, H * .72, W, H); c.fillStyle = '#6cc25a'; c.fillRect(0, H * .72, W, 8);
      c.font = 'bold ' + Math.round(Math.min(34, W * .06)) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#fff'; const ttl = phase === 'show' ? '👀 Merk dir den Bauplan!' : phase === 'build' ? '🔨 Jetzt nachbauen!' : msg; c.strokeText(ttl, W / 2, L.gy - 36); c.fillStyle = '#16335e'; c.fillText(ttl, W / 2, L.gy - 36);
      for (let i = 0; i < n * n; i++) {
        const x = L.gx + (i % n) * L.s, y = L.gy + ((i / n) | 0) * L.s, v = phase === 'show' ? pat[i] : grid[i];
        rr(c, x + 3, y + 3, L.s - 6, L.s - 6, 10); c.fillStyle = v >= 0 ? PAL[v] : 'rgba(255,255,255,.55)'; c.fill(); c.lineWidth = 3; c.strokeStyle = v >= 0 ? 'rgba(0,0,0,.25)' : 'rgba(22,51,94,.35)'; if (v < 0) c.setLineDash([6, 6]); c.stroke(); c.setLineDash([]);
        if (phase === 'check') { const good = grid[i] === pat[i]; c.font = Math.round(L.s * .4) + 'px system-ui'; c.fillStyle = '#fff'; c.fillText(good ? '✔' : '✖', x + L.s / 2, y + L.s / 2); if (!good) { c.fillStyle = PAL[pat[i]]; c.beginPath(); c.arc(x + L.s - 14, y + 14, 9, 0, 6.3); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); } }
      }
      if (phase === 'show') { const tot = 1.2 + n * n * .22 - Math.min(1.2, lv * .08); c.fillStyle = 'rgba(22,51,94,.25)'; rr(c, W * .2, L.gy + n * L.s + 14, W * .6, 12, 6); c.fill(); c.fillStyle = '#ffd23f'; rr(c, W * .2, L.gy + n * L.s + 14, W * .6 * Math.max(0, pt / tot), 12, 6); c.fill(); }
      if (phase === 'build') {
        for (let k = 0; k < ncol; k++) { const px = W / 2 + (k - (ncol - 1) / 2) * (L.pw + 8); rr(c, px - L.pw / 2, L.py - L.pw / 2, L.pw, L.pw, 14); c.fillStyle = PAL[k]; c.fill(); c.lineWidth = k === sel ? 7 : 3; c.strokeStyle = k === sel ? '#16335e' : '#fff'; c.stroke(); }
        const full = grid.every(v => v >= 0); rr(c, W / 2 - 90, H * .91 - 26, 180, 52, 26); c.fillStyle = full ? '#3fb85c' : '#9aa7b8'; c.fill(); c.font = 'bold 24px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.fillText('✔ Fertig', W / 2, H * .91 + 1);
        if (msgT > 0) { c.font = 'bold 22px Fredoka, system-ui, sans-serif'; c.fillStyle = '#e8453c'; c.fillText(msg, W / 2, L.py + L.pw / 2 + 22); }
      }
      c.font = 'bold 20px Fredoka, system-ui, sans-serif'; c.textAlign = 'left'; c.fillStyle = '#16335e'; c.fillText('Stufe ' + (lv + 1), 16, H - 22); c.textAlign = 'center';
    };
    return G;
  };

  /* =====================  💧 STRÖMUNGS-RÄTSEL (Atlantis)  ===================== */
  /* Leitungs-Puzzle: Kacheln antippen = um 90° drehen, bis das Wasser von der Quelle (links) bis zum Becken (rechts) fließt. Felder wachsen von 4×4 bis 6×6. */
  const stroem = () => {
    const G = {}; let n, T, sr, er, lv, wet, done, doneT, msg, msgT, lvT, flowT; const N = 1, E = 2, S = 4, Wd = 8, DX = [0, 1, 0, -1], DZ = [-1, 0, 1, 0], BIT = [N, E, S, Wd], OPP = [S, Wd, N, E];
    const rot = m => ((m << 1) | (m >> 3)) & 15, geo = () => { const W = h.W(), H = h.H(), s = Math.min(W * .86 / n, H * .66 / n, 96); return { W, H, s, gx: (W - s * n) / 2, gy: H * .2 }; };
    function gen() {
      n = lv < 2 ? 4 : lv < 5 ? 5 : 6; T = []; for (let i = 0; i < n * n; i++) T.push(0);
      sr = (h.rnd() * n) | 0; let x = 0, z = sr, from = 3; const seen = new Set([x + ',' + z]); er = sr; // from = Seite, von der das Wasser kommt (3 = links)
      for (let guard = 0; guard < 100; guard++) {
        if (x === n - 1) { T[z * n + x] = BIT[from] | E; er = z; break; }
        const opts = [1, 1]; if (z > 0 && !seen.has(x + ',' + (z - 1))) opts.push(0); if (z < n - 1 && !seen.has(x + ',' + (z + 1))) opts.push(2);
        const d = opts[(h.rnd() * opts.length) | 0]; T[z * n + x] = BIT[from] | BIT[d]; x += DX[d]; z += DZ[d]; from = OPP[d]; seen.add(x + ',' + z);
      }
      for (let i = 0; i < n * n; i++) { if (!T[i]) { const k = (h.rnd() * 5) | 0; T[i] = k === 0 ? 0 : k === 1 ? 5 : k === 2 ? 3 : k === 3 ? 7 : 15 & ~BIT[(h.rnd() * 4) | 0]; } }
      for (let i = 0; i < n * n; i++) { const k = (h.rnd() * 4) | 0; for (let j = 0; j < k; j++) T[i] = rot(T[i]); }
      flow(); if (done) gen();
    }
    function flow() {
      wet = new Set(); done = false; const q = []; if (T[sr * n] & Wd) { wet.add(sr * n); q.push([0, sr]); }
      while (q.length) { const [x, z] = q.shift(); for (let d = 0; d < 4; d++) if (T[z * n + x] & BIT[d]) { const nx = x + DX[d], nz = z + DZ[d]; if (nx < 0 || nz < 0 || nx >= n || nz >= n || wet.has(nz * n + nx)) continue; if (T[nz * n + nx] & OPP[d]) { wet.add(nz * n + nx); q.push([nx, nz]); } } }
      if (wet.has(er * n + n - 1) && (T[er * n + n - 1] & E)) done = true;
    }
    G.init = function () { lv = 0; msg = ''; msgT = 0; lvT = 0; flowT = 0; gen(); };
    G.resize = function () { };
    G.tap = function (x, y) {
      if (done) return; const g = geo(), cx = Math.floor((x - g.gx) / g.s), cz = Math.floor((y - g.gy) / g.s); if (cx < 0 || cz < 0 || cx >= n || cz >= n) return;
      T[cz * n + cx] = rot(T[cz * n + cx]); snd('pop'); flow();
      if (done) { const pts = 4 + Math.min(4, lv); h.add(pts, g.gx + g.s * n, g.gy + (er + .5) * g.s); snd('star'); msg = 'Das Wasser fließt! +' + pts; msgT = 1.6; doneT = 1.3; h.burst(g.gx + g.s * n, g.gy + (er + .5) * g.s, 16, ['#7fe8ff', '#fff', '#35d6e0']); }
    };
    G.update = function (dt) { lvT += dt; flowT += dt; msgT = Math.max(0, msgT - dt); if (done) { doneT -= dt; if (doneT <= 0) { lv++; gen(); } } };
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H, s = g.s; h.bg('#0e5a7a', '#02101f');
      for (let i = 0; i < 26; i++) { const x = (i * 97.3 + flowT * (6 + i % 5)) % W, y = H - ((i * 53.7 + flowT * (10 + i % 7)) % H); c.fillStyle = 'rgba(160,240,255,.25)'; c.beginPath(); c.arc(x, y, 2 + i % 4, 0, 6.3); c.fill(); }
      c.font = 'bold ' + Math.round(Math.min(30, W * .055)) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#bff6ff'; c.fillText(msgT > 0 ? msg : '💧 Dreh die Rohre – leite das Wasser nach rechts!', W / 2, g.gy - 34);
      rr(c, g.gx - 10, g.gy - 10, s * n + 20, s * n + 20, 18); c.fillStyle = 'rgba(3,30,48,.8)'; c.fill();
      for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) {
        const m = T[z * n + x], px = g.gx + x * s, py = g.gy + z * s, w = wet.has(z * n + x); rr(c, px + 3, py + 3, s - 6, s - 6, 10); c.fillStyle = w ? 'rgba(53,214,224,.18)' : 'rgba(255,255,255,.08)'; c.fill();
        c.lineCap = 'round'; for (const pass of [0, 1]) { c.lineWidth = pass ? s * .16 : s * .26; c.strokeStyle = pass ? (w ? '#7fe8ff' : '#6a8aa0') : (w ? '#0f6a86' : '#30485a'); c.beginPath(); const cx = px + s / 2, cy = py + s / 2; for (let d = 0; d < 4; d++) if (m & BIT[d]) { c.moveTo(cx, cy); c.lineTo(cx + DX[d] * s / 2, cy + DZ[d] * s / 2); } c.stroke(); }
      }
      /* Quelle links, Becken rechts */
      c.fillStyle = '#35d6e0'; c.beginPath(); c.arc(g.gx - 6, g.gy + (sr + .5) * s, s * .22, 0, 6.3); c.fill(); c.fillStyle = done ? '#7fffd0' : '#ffd23f'; c.beginPath(); c.arc(g.gx + s * n + 6, g.gy + (er + .5) * s, s * .22, 0, 6.3); c.fill();
      c.font = 'bold 18px Fredoka, system-ui, sans-serif'; c.textAlign = 'left'; c.fillStyle = '#bff6ff'; c.fillText('Stufe ' + (lv + 1), 16, H - 22); c.textAlign = 'center';
    };
    return G;
  };
  h.register('heli_insel', heli(), { icon: '🚁', name: 'Heli-Rettung', help: 'Flieg den Rettungs-Heli durch die Felsentore: Halten = steigen. Sterne und Gerettete einsammeln!', dur: 75, goal: 40, zone: 'insel' });
  h.register('taxi_stadt', taxi(), { icon: '🚕', name: 'Taxi-Rush', help: 'Wechsle die Spur, weiche Autos aus und sammle Fahrgäste und Münzen!', dur: 70, goal: 40, zone: 'stadt' });
  h.register('cans_park', cans(), { icon: '🥫', name: 'Dosen-Knall', help: 'Ball ziehen, zielen, loslassen: Wirf die Dosenpyramiden um!', dur: 90, goal: 30, zone: 'park' });
  h.register('dance_regenbogen', dance(), { icon: '💃', name: 'Pride-Disco', help: 'Triff die Pfeile im Takt – Perfekt-Treffer und Kombos geben mehr Punkte!', dur: 62, goal: 400, zone: null });
  h.register('crane_dampfer', crane(), { icon: '🏗️', name: 'Hafen-Kran', help: 'Stapel die Kisten am Kran so genau wie möglich – Überstehendes wird abgeschnitten!', dur: 90, goal: 25, zone: 'dampfer' });
  h.register('bauplan_bauland', plan(), { icon: '🏗️', name: 'Pixel-Plan', help: 'Merke dir den Bauplan – dann Farbe wählen und die Felder aus dem Gedächtnis nachbauen. Mit jeder Stufe wird das Muster größer!', dur: 80, goal: 30, zone: 'bauland' });
  h.register('stroemung_atlantis', stroem(), { icon: '💧', name: 'Strömungs-Rätsel', help: 'Tippe die Rohre an, um sie zu drehen – leite das Wasser von der Quelle links bis zum Becken rechts! Mit jeder Stufe wird das Feld größer.', dur: 90, goal: 30, zone: 'atlantis' });
  h.register('ringflug_drache', flug(), { icon: '🐉', name: 'Drachenflug', help: 'Flieg als Drache durch die goldenen Ringe, sammle Funkelsteine und weiche den Gewitterwolken aus!', dur: 60, goal: 40, zone: 'drachen' });
  /* =====================  ⚔️ ELEMENTAR-KAMPF (Zotik / Lunaris)  ===================== */
  /* Rundenkampf im Elementkreis: Feuer › Natur › Licht › Schatten › Wasser › Feuer. Wähle das Element, das den Gegner schlägt (doppelter Schaden); das falsche Element schlägt zurück. */
  const elem = () => {
    const G = {}, EL = [{ n: 'Feuer', e: '🔥', c: '#ff7a2e' }, { n: 'Natur', e: '🌿', c: '#4cd07d' }, { n: 'Licht', e: '✨', c: '#ffe27a' }, { n: 'Schatten', e: '🌑', c: '#9b6ae8' }, { n: 'Wasser', e: '💧', c: '#4da3ff' }];
    const MON = [['Moosling', '🌱', 1], ['Dornenwolf', '🐺', 1], ['Frostgeist', '👻', 4], ['Lavadrache', '🐲', 0], ['Schattenwandler', '🥷', 3], ['Waldhüter', '🌳', 1], ['Pilzling', '🍄', 2], ['Abyssal', '🐙', 4]];
    let mi, hp, hearts, cd, atk, atkT, combo, msg, msgT, shake, flash, ko, kills;
    const spawn = () => { mi = (mi + 1) % MON.length; hp = 6; atk = Math.max(1.8, 3.6 - kills * .12); atkT = atk; };
    const geo = () => { const W = h.W(), H = h.H(), bs = Math.min(W / 5.6, H * .15, 92); return { W, H, bs, by: H - bs * 1.05 - 14, bx: i => W / 2 + (i - 2) * bs * 1.12 }; };
    G.init = function () { mi = -1; kills = 0; hearts = 5; cd = 0; combo = 0; msg = ''; msgT = 0; shake = 0; flash = 0; ko = 0; spawn(); };
    G.resize = function () { };
    const say = (s, d) => { msg = s; msgT = d || 1.2; };
    function pick(i) {
      if (ko > 0 || cd > 0) return; const e = MON[mi][2], g = geo(); cd = .32; const rel = (i + 1) % 5 === e ? 2 : (e + 1) % 5 === i ? 0 : 1;
      if (rel === 0) { hearts--; combo = 0; shake = .35; flash = .25; snd('bonk'); say(EL[e].n + ' schlägt ' + EL[i].n + '! Au!', 1.1); if (hearts <= 0) { ko = 1.6; say('Erschöpft – kurze Pause …', 1.6); } return; }
      hp -= rel === 2 ? 2 : 1; if (rel === 2) { combo++; say('Wirkungsvoll!' + (combo > 1 ? ' x' + combo : ''), .9); snd('star'); } else { combo = 0; say('Treffer', .6); snd('pop'); } h.burst(g.W / 2, g.H * .34, rel === 2 ? 14 : 6, [EL[i].c, '#fff']);
      if (hp <= 0) { const pts = 3 + Math.min(4, combo); kills++; h.add(pts, g.W / 2, g.H * .3); h.burst(g.W / 2, g.H * .34, 22, ['#ffe27a', '#fff', EL[e].c]); snd('ding'); if (hearts < 5 && kills % 2 === 0) hearts++; spawn(); }
    }
    G.tap = function (x, y) { const g = geo(); for (let i = 0; i < 5; i++) if (Math.abs(x - g.bx(i)) < g.bs * .56 && Math.abs(y - g.by) < g.bs * .62) { pick(i); return; } };
    G.keydown = c => { const k = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4 }[c]; if (k != null) pick(k); };
    G.update = function (dt) {
      cd = Math.max(0, cd - dt); msgT = Math.max(0, msgT - dt); shake = Math.max(0, shake - dt); flash = Math.max(0, flash - dt);
      if (ko > 0) { ko -= dt; if (ko <= 0) { hearts = 3; combo = 0; spawn(); } return; }
      atkT -= dt; if (atkT <= 0) { atkT = atk; hearts--; combo = 0; shake = .35; flash = .25; snd('bonk'); say(MON[mi][0] + ' greift an!', 1); if (hearts <= 0) { ko = 1.6; say('Erschöpft – kurze Pause …', 1.6); } }
    };
    G.dbg = () => ({ mi, hp, hearts, kills, el: MON[mi][2], pick });
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H, m = MON[mi], e = m[2]; h.bg('#2a1a6a', '#0a0620');
      for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,' + (.25 + (i % 4) * .15) + ')'; c.fillRect((i * 83.7) % W, (i * 47.3) % (H * .6), 2, 2); }
      c.save(); if (shake > 0) c.translate(Math.sin(shake * 90) * 6, 0);
      c.fillStyle = EL[e].c + '33'; c.beginPath(); c.arc(W / 2, H * .34, Math.min(W, H) * .24, 0, 6.3); c.fill();
      h.emoji(m[1], W / 2, H * .34 + Math.sin(performance.now() / 400) * 6, Math.min(W, H) * .3);
      c.font = 'bold ' + Math.round(Math.min(26, W * .05)) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(m[0] + '  ' + EL[e].e + ' ' + EL[e].n, W / 2, H * .12);
      const bw = Math.min(W * .6, 320); rr(c, W / 2 - bw / 2, H * .17, bw, 14, 7); c.fillStyle = 'rgba(0,0,0,.45)'; c.fill(); rr(c, W / 2 - bw / 2, H * .17, Math.max(0, bw * hp / 6), 14, 7); c.fillStyle = '#ff5a6a'; c.fill();
      if (ko <= 0) { rr(c, W / 2 - bw / 2, H * .17 + 20, bw, 6, 3); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); rr(c, W / 2 - bw / 2, H * .17 + 20, bw * Math.max(0, atkT / atk), 6, 3); c.fillStyle = '#ffd23f'; c.fill(); }
      c.restore();
      if (msgT > 0) { c.font = 'bold ' + Math.round(Math.min(34, W * .065)) + 'px Fredoka, system-ui, sans-serif'; c.fillStyle = '#ffe9a8'; c.fillText(msg, W / 2, H * .6); }
      for (let i = 0; i < 5; i++) {
        const x = g.bx(i), eff = (i + 1) % 5 === e && kills < 4 && ko <= 0; rr(c, x - g.bs * .5, g.by - g.bs * .5, g.bs, g.bs, 16); c.fillStyle = cd > 0 ? 'rgba(255,255,255,.1)' : EL[i].c + 'cc'; c.fill(); c.lineWidth = eff ? 5 : 2; c.strokeStyle = eff ? '#fff' : 'rgba(255,255,255,.4)'; c.stroke();
        h.emoji(EL[i].e, x, g.by - 4, g.bs * .5); c.font = 'bold ' + Math.round(g.bs * .17) + 'px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.fillText(EL[i].n, x, g.by + g.bs * .36);
      }
      for (let i = 0; i < 5; i++) h.emoji(i < hearts ? '❤️' : '🖤', 28 + i * 30, H - 16 - g.bs * 1.65, 24);
      if (flash > 0) { c.fillStyle = 'rgba(255,60,60,' + flash * .8 + ')'; c.fillRect(0, 0, W, H); }
      c.font = '600 ' + Math.round(Math.min(16, W * .03)) + 'px Fredoka, system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText('Feuer › Natur › Licht › Schatten › Wasser › Feuer', W / 2, H - 8);
    };
    return G;
  };
  h.register('elementar_zotik', elem(), { icon: '⚔️', name: 'Elementar-Kampf', help: 'Rundenkampf im Elementkreis: Feuer schlägt Natur, Natur schlägt Licht, Licht schlägt Schatten, Schatten schlägt Wasser, Wasser schlägt Feuer. Wähle das passende Element!', dur: 75, goal: 30, zone: 'zotik' });
  /* =====================  📻 FREQUENZ-DREHER (Funkwelle)  ===================== */
  /* Geschicklichkeit/Timing: Die Nadel wandert über die Skala – tippe genau dann, wenn sie im leuchtenden Bereich des gesuchten Senders steht. Je besser, desto mehr Punkte; der Bereich wird mit jedem Treffer schmaler. */
  const freq = () => {
    const G = {}; let nx, nv, band, bw, st_, combo, msg, msgT, flash, lv, nm, cl;
    const NAMES = () => (BI.RADIO ? BI.RADIO.stations.map(s => s.n) : ['Radio']);
    const next = () => { nm = NAMES()[(h.rnd() * NAMES().length) | 0]; cl = (h.rnd() * 360) | 0; bw = Math.max(.05, .2 - lv * .012); band = .12 + h.rnd() * (.76 - bw * .5); };
    G.init = function () { nx = 0; nv = .55; st_ = 0; combo = 0; msg = ''; msgT = 0; flash = 0; lv = 0; next(); };
    G.resize = function () { };
    function lock() { const d = Math.abs(nx - band), hit = d <= bw / 2; if (hit) { combo++; const pts = 3 + (d < bw * .12 ? 3 : d < bw * .3 ? 1 : 0) + Math.min(3, combo >> 1), W = h.W(), H = h.H(); h.add(pts, W / 2, H * .4); h.burst(W * (.1 + .8 * nx), H * .5, 16, ['#6ad0ff', '#ff5ab4', '#fff']); snd('star'); msg = d < bw * .12 ? 'Perfekt eingestellt!' : 'Empfang!'; lv++; nv = Math.min(1.5, .55 + lv * .06); next(); } else { combo = 0; snd('bonk'); msg = 'Rauschen … nochmal!'; flash = .25; } msgT = .9; }
    G.tap = function () { lock(); };
    G.keydown = c => { if (c === 'Space' || c === 'Enter') lock(); };
    G.update = function (dt) { st_ += dt; msgT = Math.max(0, msgT - dt); flash = Math.max(0, flash - dt); nx += nv * dt * (G.dir || 1); if (nx > 1) { nx = 1; G.dir = -1; } if (nx < 0) { nx = 0; G.dir = 1; } };
    G.dbg = () => ({ nx, band, bw, lock });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(); h.bg('#12185a', '#04061c'); const sw = W * .84, sx = (W - sw) / 2, sy = H * .5;
      c.font = 'bold ' + Math.round(Math.min(34, W * .06)) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText('Stelle ein: ' + nm, W / 2, H * .15);
      c.font = '600 ' + Math.round(Math.min(20, W * .035)) + 'px Fredoka, system-ui, sans-serif'; c.fillStyle = '#9aa6d8'; c.fillText('Tippe, wenn die Nadel im leuchtenden Bereich steht', W / 2, H * .24);
      rr(c, sx - 10, sy - 40, sw + 20, 80, 18); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill(); for (let k = 0; k <= 40; k++) { c.fillStyle = 'rgba(255,255,255,' + (k % 5 ? .25 : .6) + ')'; c.fillRect(sx + sw * k / 40 - 1, sy + 14, 2, k % 5 ? 10 : 20); }
      const bx = sx + sw * (band - bw / 2); c.fillStyle = 'hsla(' + cl + ',90%,60%,' + (.45 + .2 * Math.sin(st_ * 6)) + ')'; c.fillRect(bx, sy - 34, sw * bw, 56); c.strokeStyle = 'hsl(' + cl + ',90%,70%)'; c.lineWidth = 3; c.strokeRect(bx, sy - 34, sw * bw, 56);
      const px = sx + sw * nx; c.fillStyle = '#ff3b3b'; c.fillRect(px - 2, sy - 44, 4, 88); c.beginPath(); c.arc(px, sy - 44, 7, 0, 6.3); c.fill();
      h.emoji('📻', W / 2, H * .78, Math.min(64, W * .12)); if (combo > 1) { c.font = 'bold 22px Fredoka, system-ui, sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Serie x' + combo, W / 2, H * .9); }
      if (msgT > 0) { c.font = 'bold ' + Math.round(Math.min(34, W * .06)) + 'px Fredoka, system-ui, sans-serif'; c.fillStyle = '#ffe9a8'; c.fillText(msg, W / 2, H * .62); }
      if (flash > 0) { c.fillStyle = 'rgba(255,60,60,' + flash * .6 + ')'; c.fillRect(0, 0, W, H); }
    };
    return G;
  };
  h.register('frequenz_radio', freq(), { icon: '📻', name: 'Frequenz-Dreher', help: 'Geschicklichkeit: Die Nadel wandert über die Radio-Skala – tippe genau, wenn sie im leuchtenden Bereich des gesuchten Senders steht. Der Bereich wird immer schmaler!', dur: 60, goal: 30, zone: 'radio' });
});
