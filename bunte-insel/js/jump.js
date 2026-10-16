'use strict';
/* Bunte Insel – Jump 'n' Run als Mini-Spiel (2D, wird in mini.js eingehängt): in jeder Welt ein eigenes Highlight-Level.
   Nur für die Fellretter-Bucht (Highlight-Spiel dieser Welt; jede andere Welt hat eine andere Spielart, siehe minis2.js).
   Kein Kinderkram: Lauf- und Sprungsteuerung mit Doppelsprung, Lücken, Stacheln, Gegner (draufspringen!), bewegliche Plattformen, Sprungfedern,
   Checkpoints, 3 Leben, versteckte Sterne und ein Ziel. Das Level entsteht aus dem Startwert (seed): bei „Mit Freunden“ spielen alle dasselbe.
   Steuerung: Tastatur (←/→ oder A/D, Leertaste/↑/W) oder Touch-Knöpfe (◀ ▶ links, Sprung rechts; auch mehrere Finger gleichzeitig). */
BI.JUMP = {
  /* Pro Welt ein Thema: Farben, Emojis, Länge, Schwierigkeit (0..1) */
  THEMES: {
    jump_bucht: { name: 'Fellretter-Sprint', icon: '🐶', hero: '🐕‍🦺', help: 'Der schwerste Einsatz: Rette das Kätzchen am Ende! Wenig Fehler erlaubt.', len: 300, diff: .85, goal: 60,
      sky: ['#46b4ff', '#d8f2ff'], ground: '#e0b46c', top: '#2d6be0', plat: '#ff7a1a', coin: '🦴', star: '⭐', walker: '🦀', flyer: '🦅', goal: '🐱', bg: 'sea' },
    /* Hüpfland 🍄: Röhren (mit Kicher-Blume, die ab und zu herausschaut) und Sternblöcke (von unten anstoßen = Münzen) – alles eigene Entwürfe */
    jump_huepf: { name: 'Hüpf-Abenteuer', icon: '🦖', hero: '🦖', help: 'Hüpf mit Tupfi bis zur Burg! Stoß von unten gegen die ⭐-Blöcke, spring über die Röhren (Vorsicht, wenn die Kicher-Blume herausschaut) und hüpf auf die Schnecken.', len: 230, diff: .55, goal: 40,
      sky: ['#5ac8ff', '#e6f7ff'], ground: '#9a6a3a', top: '#4cd07d', plat: '#e8a040', coin: '🪙', star: '⭐', walker: '🐌', flyer: '🐝', goal: '🏰', bg: 'hills', zone: 'huepf', pipes: true, blocks: true }
  },
  onWin: null, /* (kind) => … wird aufgerufen, wenn ein Level geschafft ist (z. B. Sticker der Welt) */
  install(M, h) {
    const COLS = ['#ff3b3b', '#ff9a2e', '#ffe14a', '#4cd07d', '#3fa0ff', '#9b4de0'], A = h.A;
    const snd = n => { try { A[n] && A[n](); } catch (e) { } };
    for (const kind of Object.keys(BI.JUMP.THEMES)) { const T = BI.JUMP.THEMES[kind]; T.key = kind; h.register(kind, make(T), { icon: T.icon, name: T.name, help: T.help, dur: 150, goal: T.goal, zone: T.zone || 'fellretter' }); }

    /* ---------- Level aus dem Startwert bauen ---------- */
    function build(T) {
      const rnd = h.rnd, L = T.len, cols = new Array(L + 24).fill(null), plats = [], haz = [], en = [], items = [], springs = [], cps = [], pipes = [], pipeCols = new Set(), blocks = [];
      const R = (a, b) => a + rnd() * (b - a), RI = (a, b) => Math.floor(R(a, b + .999));
      let x = 0, gy = 8, stars = 0, hearts = 0, nextCp = 50;
      const flat = (n, y) => { for (let i = 0; i < n; i++) cols[x + i] = y; x += n; };
      const pit = n => { x += n; };
      const coins = (x0, y, n, arc) => { for (let i = 0; i < n; i++) items.push({ k: 'c', x: x0 + i + .5, y: y - (arc ? Math.sin((i + .5) / n * Math.PI) * arc : 0) }); };
      const clampY = y => Math.max(6, Math.min(9, y));
      flat(12, gy); coins(5, gy - 1.2, 5);
      while (x < L - 18) {
        const p = x / L, d = T.diff * (.45 + p * .75);
        if (x >= nextCp) { flat(4, gy); cps.push({ x: x - 2, y: gy, on: false }); nextCp += 55; continue; }
        const wantStar = stars < 3 && x > L * (stars + 1) * .22, wantHeart = hearts < 2 && x > L * (hearts + 1) * .36 && rnd() < .5;
        let t = rnd();
        if (wantStar) t = t < .5 ? .92 : .8;
        else if (t < .13) t = .05; else if (t < .13 + .2) t = .2; else if (t < .13 + .2 + .1 * (1 - d)) t = .35; else t = .45 + rnd() * .5;
        if (!wantStar && T.blocks && !blocks.length && x > L * .12) t = .05; else if (!wantStar && T.pipes && !pipes.length && x > L * .3) t = .45; /* Hilfe verspricht Sternblöcke und Röhren: mindestens je eine Stelle */
        if (t < .1) { const n = T.blocks && !blocks.length ? RI(5, 7) : RI(4, 7); flat(n, gy); if (T.blocks && n >= 5) { const bx = x - n + 1; for (let i = 0; i < 3; i++) { const b = { x: bx + i, y: gy - 3.4, hit: 0, bump: 0 }; blocks.push(b); plats.push({ x: b.x, y: b.y, w: 1, mv: false, ax: 0, sp: 0, ph: 0, ox: b.x, dx: 0, dy: 0, blk: b }); } } else coins(x - n, gy - 1.2, n); }
        else if (t < .3) { /* Lücke */ const w = Math.min(5, 2 + Math.floor(R(0, 1.3 + 3.3 * d))), ny = clampY(gy + RI(-1, 1)); const x0 = x; pit(w); flat(RI(3, 5), ny); coins(x0, gy - 1.5, w, 1.6); gy = ny; }
        else if (t < .4) { /* Treppe */ const up = rnd() < .5, n = RI(2, 3); for (let i = 0; i < n; i++) { const ny = clampY(gy + (up ? -1 : 1)); gy = ny; flat(RI(2, 3), gy); } coins(x - 3, gy - 1.2, 3); }
        else if (t < .5 && T.pipes && (rnd() < .6 || !pipes.length)) { /* Röhre: 2 breit, 2–3 hoch; manchmal schaut die Kicher-Blume heraus */ flat(3, gy); const top = gy - RI(2, 3), px = x; for (let i = 0; i < 2; i++) { cols[x + i] = top; pipeCols.add(x + i); } x += 2; pipes.push({ x: px, top, fl: rnd() < .65 ? rnd() * 6 : null }); coins(px - 1, top - 1.6, 4, 1.4); flat(3, gy); }
        else if (t < .5) { /* Stacheln */ flat(3, gy); const sx = x; flat(8, gy); haz.push({ x: sx + 2.5, w: 2, y: gy }); coins(sx + 1.5, gy - 1.6, 4, 1.8); flat(2, gy); }
        else if (t < .62) { /* Läufer */ const sx = x; flat(11, gy); en.push({ k: 'w', x: sx + 5, y: gy, dir: 1, x0: sx + 1.5, x1: sx + 9.5, v: R(1.2, 2.0) * (1 + d * .4), ph: 0, dead: 0 }); coins(sx + 3, gy - 2.2, 5, 1.4); }
        else if (t < .72) { /* Flieger */ const sx = x; flat(10, gy); en.push({ k: 'f', x: sx + 5, y: gy - 2.6, by: gy - 2.6, amp: R(.8, 1.4), v: R(1.5, 2.4), x0: sx + 2, x1: sx + 8, dir: 1, ph: rnd() * 6, dead: 0 }); coins(sx + 2, gy - 1.2, 3); }
        else if (t < .8) { /* Plattformen über der Schlucht (bei höherer Schwierigkeit eine bewegliche) */
          const n = 2 + (d > .5 ? 1 : 0), gapG = R(1.3, 2.1), pw = 2.5, W = n * pw + (n + 1) * gapG, x0 = x; pit(Math.ceil(W));
          for (let i = 0; i < n; i++) { const px = x0 + gapG + i * (pw + gapG), py = gy - R(.4, 1.6) - (i === 1 ? .6 : 0), mv = d > .55 && i === 1; plats.push({ x: px, y: py, w: pw, mv, ax: mv ? 1.2 : 0, sp: R(.9, 1.4), ph: rnd() * 6, ox: px, dx: 0, dy: 0 }); coins(px, py - 1.1, 2); }
          if (wantStar) { const q = plats[plats.length - 1]; items.push({ k: 's', x: q.x + q.w / 2, y: q.y - 1.4 }); stars++; }
          flat(RI(3, 4), gy);
        }
        else if (t < .88) { /* Sprungfeder: nur mit Feder (oder Doppelsprung) über die lange Schlucht */
          flat(3, gy); springs.push({ x: x - 1.5, y: gy, sq: 0 }); const x0 = x; pit(6); plats.push({ x: x0 + 1.8, y: gy - 3.8, w: 3, mv: false, ax: 0, sp: 0, ph: 0, ox: x0 + 1.8, dx: 0, dy: 0 }); items.push({ k: wantStar ? 's' : 'c', x: x0 + 3.3, y: gy - 5.2 }); if (wantStar) stars++; flat(4, gy); }
        else { /* Turm: hohe Insel zum Abholen von Herz oder Stern */
          const sx = x; flat(9, gy); plats.push({ x: sx + 2.5, y: gy - 2, w: 2.2, mv: false, ax: 0, sp: 0, ph: 0, ox: sx + 2.5, dx: 0, dy: 0 }, { x: sx + 5.2, y: gy - 3.8, w: 2.2, mv: false, ax: 0, sp: 0, ph: 0, ox: sx + 5.2, dx: 0, dy: 0 });
          items.push({ k: wantStar ? 's' : wantHeart ? 'h' : 'c', x: sx + 6.3, y: gy - 5.2 }); if (wantStar) stars++; else if (wantHeart) hearts++; }
      }
      while (stars < 3) { items.push({ k: 's', x: L * (.2 * (stars + 1)) + 3, y: 4 }); stars++; }
      flat(16, gy); const goalX = x - 8;
      return { L, cols, plats, haz, en, items, springs, cps, goalX, pipes, pipeCols, blocks };
    }

    /* ---------- Spiel ---------- */
    function make(T) {
      const G = {}; let lv, p, cam, tm, keys, touch, over, cpI, msg, msgT, shake;
      G.init = function () {
        lv = build(T); p = { x: 2, y: lv.cols[2], vx: 0, vy: 0, g: true, face: 1, coy: 0, buf: 0, dj: true, life: 3, inv: 0, run: 0, onP: null, hold: false };
        cam = 0; tm = 0; keys = { l: 0, r: 0 }; touch = {}; over = false; cpI = -1; msg = ''; msgT = 0; shake = 0;
      };
      G.resize = function () { };
      G.dbg = () => ({ lv, p, over, tm });
      const colTop = xi => (xi < 0 || xi >= lv.cols.length) ? null : lv.cols[xi];
      const say = (t, s) => { msg = t; msgT = s || 1.6; };
      const finish = ok => { if (over) return; over = true; if (ok && BI.JUMP.onWin) { try { BI.JUMP.onWin(T.key, M.score); } catch (e) { } } if (ok) { h.add(25, h.W() / 2, h.H() * .4); h.add(p.life * 3, h.W() / 2, h.H() * .46); h.add(Math.max(0, Math.floor((M.dur - M.t) * .2)), h.W() / 2, h.H() * .52); snd('fanfare'); say('🏁 Geschafft!', 99); } else { say('💔 Leider verloren – nochmal versuchen!', 99); snd('bonk'); } M.over = true; };
      const hurt = () => { if (p.inv > 0 || over) return; p.life--; snd('bonk'); shake = .25; if (p.life <= 0) { finish(false); return; } p.inv = 1.6; p.vy = -9; p.vx = -p.face * 5; p.g = false; };
      const die = () => { p.life--; snd('bonk'); if (p.life <= 0) { finish(false); return; } const c = cpI >= 0 ? lv.cps[cpI] : { x: 2, y: lv.cols[2] }; p.x = c.x; p.y = c.y; p.vx = p.vy = 0; p.inv = 1.8; p.g = true; p.onP = null; say('Weiter geht’s! Noch ' + p.life + ' ❤️', 1.4); };
      const jump = () => { p.buf = .13; p.hold = true; };
      const release = () => { p.hold = false; if (p.vy < -6) p.vy = -6; };
      G.keydown = c => { if (c === 'ArrowLeft' || c === 'KeyA') keys.l = 1; else if (c === 'ArrowRight' || c === 'KeyD') keys.r = 1; else if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') { if (!p.hold) jump(); } };
      G.keyup = c => { if (c === 'ArrowLeft' || c === 'KeyA') keys.l = 0; else if (c === 'ArrowRight' || c === 'KeyD') keys.r = 0; else if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') release(); };
      /* Touch-Knöpfe: ◀ ▶ links, Sprung rechts; mehrere Finger gleichzeitig (Zeiger-ID) */
      const btn = () => { const W = h.W(), H = h.H(), r = Math.min(W, H) * .1; return { l: { x: W * .09, y: H * .84, r }, r: { x: W * .09 + r * 2.4, y: H * .84, r }, j: { x: W * .9, y: H * .82, r: r * 1.25 } }; };
      G.tap = function (x, y, id) { if (over) return; const B = btn(); let k = 'j'; for (const n of ['l', 'r', 'j']) if (Math.hypot(x - B[n].x, y - B[n].y) < B[n].r * 1.35) { k = n; break; } touch[id] = k; if (k === 'j') jump(); };
      G.up = function (id) { const k = touch[id]; delete touch[id]; if (k === 'j') release(); };
      const held = k => keys[k] || Object.values(touch).includes(k);
      function plat(pl, t) { if (pl.mv) { const nx = pl.ox + Math.sin(t * pl.sp + pl.ph) * pl.ax; pl.dx = nx - pl.x; pl.x = nx; } }
      function step(dt) {
        tm += dt; for (const pl of lv.plats) plat(pl, tm);
        if (p.onP) { p.x += p.onP.dx; }
        const tg = (held('r') ? 1 : 0) - (held('l') ? 1 : 0); if (tg) p.face = tg;
        p.vx += (tg * 7 - p.vx) * Math.min(1, (p.g ? 14 : 8) * dt); if (!tg && p.g) p.vx *= Math.max(0, 1 - 12 * dt);
        p.vy = Math.min(22, p.vy + 38 * dt); p.inv = Math.max(0, p.inv - dt); p.coy = p.g ? .11 : Math.max(0, p.coy - dt); p.buf = Math.max(0, p.buf - dt);
        if (p.buf > 0 && p.coy > 0) { p.vy = -15.5; p.coy = 0; p.buf = 0; p.g = false; p.onP = null; p.dj = true; snd('whoosh'); }
        else if (p.buf > 0 && !p.g && p.dj) { p.vy = -13; p.dj = false; p.buf = 0; h.burst(sx(p.x), sy(p.y), 8, ['#fff', '#ffe27a']); snd('whoosh'); }
        /* waagerecht (hohe Stufen sind Wände) */
        const hw = .32; let nx = p.x + p.vx * dt;
        for (let xi = Math.floor(nx - hw); xi <= Math.floor(nx + hw); xi++) { const top = colTop(xi); if (top != null && top < p.y - .55) { nx = p.vx > 0 ? xi - hw - .001 : xi + 1 + hw + .001; p.vx = 0; } }
        nx = Math.max(hw, Math.min(lv.L + 20, nx)); p.x = nx;
        const prev = p.y; p.y += p.vy * dt; p.g = false; let sup = null, supP = null;
        if (p.vy < 0) for (const b of lv.blocks) { const bot = b.y + 1; if (p.x + hw > b.x && p.x - hw < b.x + 1 && prev - 1 >= bot - 1e-6 && p.y - 1 < bot) { p.y = bot + 1.001; p.vy = 3; b.bump = .18; if (!b.hit) { b.hit = 1; h.add(2, sx(b.x + .5), sy(b.y) - 20); h.burst(sx(b.x + .5), sy(b.y), 10, ['#ffe27a', '#fff']); snd('ding'); } else snd('bonk'); break; } }
        for (const pp of lv.pipes) { if (pp.fl == null) continue; const out = Math.sin(tm * 1.3 + pp.fl) > .35; pp.out = out; if (out && Math.abs(p.x - (pp.x + 1)) < .75 && p.y > pp.top - 1.5 && p.y <= pp.top + .05) hurt(); }
        if (p.vy >= 0) {
          for (let xi = Math.floor(p.x - hw); xi <= Math.floor(p.x + hw); xi++) { const top = colTop(xi); if (top != null && p.y >= top - 1e-6 && prev <= top + .6 && (sup == null || top < sup)) sup = top; }
          for (const pl of lv.plats) { if (p.x + hw > pl.x && p.x - hw < pl.x + pl.w && p.y >= pl.y - 1e-6 && prev <= pl.y + .3 + Math.abs(pl.dy) && (sup == null || pl.y < sup)) { sup = pl.y; supP = pl; } }
        }
        if (sup != null) { p.y = sup; if (p.vy > 6) h.burst(sx(p.x), sy(p.y), 4, ['#fff', '#ddd']); p.vy = 0; p.g = true; p.dj = true; p.onP = supP; } else p.onP = null;
        /* Federn */
        for (const s of lv.springs) { if (p.vy > 0 && Math.abs(p.x - s.x) < .7 && p.y >= s.y - .5 && prev <= s.y) { p.vy = -24; p.g = false; p.dj = true; s.sq = .25; snd('whoosh'); h.burst(sx(s.x), sy(s.y), 8, ['#ff8a1f', '#fff']); } s.sq = Math.max(0, s.sq - dt); }
        /* Stacheln */
        for (const z of lv.haz) if (p.x + hw > z.x && p.x - hw < z.x + z.w && p.y > z.y - .55 && p.y <= z.y + .6) hurt();
        /* Gegner */
        for (const e of lv.en) {
          if (e.dead) continue;
          if (e.k === 'w') { e.x += e.dir * e.v * dt; if (e.x > e.x1) e.dir = -1; else if (e.x < e.x0) e.dir = 1; } else { e.x += e.dir * e.v * .6 * dt; if (e.x > e.x1) e.dir = -1; else if (e.x < e.x0) e.dir = 1; e.y = e.by + Math.sin(tm * e.v + e.ph) * e.amp; }
          const ey = e.k === 'w' ? e.y : e.y + .5; if (Math.abs(p.x - e.x) < .7 && p.y > ey - 1.0 && p.y - .9 < ey) { if (p.vy > .5 && p.y < ey - .35) { e.dead = 1; p.vy = -11; p.dj = true; h.add(3, sx(e.x), sy(e.y) - 30); h.burst(sx(e.x), sy(e.y), 10, ['#ffe27a', '#fff']); snd('ding'); } else hurt(); }
        }
        /* Sammeln */
        for (const it of lv.items) { if (it.got) continue; if (Math.abs(p.x - it.x) < .75 && Math.abs((p.y - .55) - it.y) < .95) { it.got = 1; if (it.k === 'c') { h.add(1, sx(it.x), sy(it.y)); snd('ding'); } else if (it.k === 's') { h.add(10, sx(it.x), sy(it.y)); snd('star'); h.burst(sx(it.x), sy(it.y), 14, ['#ffe27a', '#fff', '#8fd8ff']); say('⭐ Versteckter Stern! +10', 1.4); } else if (it.k === 'h') { p.life = Math.min(5, p.life + 1); snd('star'); say('❤️ Extra-Leben!', 1.4); } } }
        /* Checkpoints, Ziel, Sturz */
        lv.cps.forEach((c, i) => { if (i > cpI && p.x >= c.x) { cpI = i; c.on = true; say('🚩 Checkpoint!', 1.2); snd('star'); } });
        if (p.x >= lv.goalX) { finish(true); return; }
        if (p.y > 13.5) die();
        p.run += Math.abs(p.vx) * dt;
      }
      G.update = function (dt) {
        if (over) return; shake = Math.max(0, shake - dt); msgT = Math.max(0, msgT - dt); const n = Math.max(1, Math.ceil(dt * 90)); for (let i = 0; i < n && !over; i++) step(dt / n);
        const S = h.H() / 11, tx = Math.max(0, Math.min(lv.L + 24 - h.W() / S, p.x - h.W() / S * .38)); cam += (tx - cam) * Math.min(1, dt * 8);
      };
      const sx = x => (x - cam) * (h.H() / 11), sy = y => y * (h.H() / 11);
      /* ---------- Zeichnen ---------- */
      G.draw = function () {
        const ctx = h.ctx(), W = h.W(), H = h.H(), S = H / 11; h.bg(T.sky[0], T.sky[1]);
        drawBg(ctx, W, H, S);
        const x0 = Math.floor(cam) - 1, x1 = Math.ceil(cam + W / S) + 1; ctx.save(); if (shake > 0) ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 8);
        for (let xi = x0; xi <= x1; xi++) { const top = colTop(xi); if (top == null) continue; const X = (xi - cam) * S, Y = top * S; if (lv.pipeCols.has(xi)) continue; ctx.fillStyle = T.ground; ctx.fillRect(X, Y, S + 1, H - Y); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(X, Y + S * .5, S + 1, H); ctx.fillStyle = T.top === 'rainbow' ? COLS[((xi % 6) + 6) % 6] : T.top; ctx.fillRect(X, Y, S + 1, S * .3); }
        for (const z of lv.haz) { const X = (z.x - cam) * S; if (X < -S * 4 || X > W + S) continue; ctx.fillStyle = '#e6edf7'; for (let i = 0; i < z.w * 2; i++) { ctx.beginPath(); ctx.moveTo(X + i * S * .5, z.y * S); ctx.lineTo(X + i * S * .5 + S * .25, z.y * S - S * .55); ctx.lineTo(X + i * S * .5 + S * .5, z.y * S); ctx.closePath(); ctx.fill(); } ctx.fillStyle = '#e0382b'; ctx.fillRect(X, z.y * S - 3, z.w * S, 4); }
        for (const pp of lv.pipes) { const X = (pp.x - cam) * S, Y = pp.top * S; if (X < -S * 3 || X > W + S) continue;
          if (pp.fl != null) { const k = Math.max(0, Math.min(1, (Math.sin(tm * 1.3 + pp.fl) - .1) * 1.6)); if (k > 0) { ctx.fillStyle = '#3a9a3a'; ctx.fillRect(X + S * .92, Y - S * 1.1 * k, S * .16, S * 1.1 * k); h.emoji('🌻', X + S, Y - S * 1.15 * k, S * 1.05); } }
          ctx.fillStyle = '#2fb84a'; ctx.fillRect(X + S * .12, Y + S * .45, S * 1.76, H - Y); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(X + S * .3, Y + S * .5, S * .22, H - Y);
          ctx.fillStyle = '#25a03e'; rr(ctx, X - S * .05, Y, S * 2.1, S * .55, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(X + S * .15, Y + S * .08, S * .25, S * .38); ctx.strokeStyle = '#14602a'; ctx.lineWidth = 2; rr(ctx, X - S * .05, Y, S * 2.1, S * .55, 6); ctx.stroke(); }
        for (const b of lv.blocks) { const X = (b.x - cam) * S, Y = (b.y - (b.bump > 0 ? b.bump : 0)) * S; b.bump = Math.max(0, b.bump - .012); if (X < -S || X > W + S) continue; ctx.fillStyle = b.hit ? '#a8763a' : '#ffc928'; rr(ctx, X + 1, Y + 1, S - 2, S - 2, 6); ctx.fill(); ctx.strokeStyle = b.hit ? '#6a4420' : '#c88a00'; ctx.lineWidth = 3; rr(ctx, X + 1, Y + 1, S - 2, S - 2, 6); ctx.stroke(); if (!b.hit) h.emoji('⭐', X + S / 2, Y + S / 2, S * .62); }
        for (const pl of lv.plats) { if (pl.blk) continue; const X = (pl.x - cam) * S; if (X < -S * 4 || X > W + S) continue; ctx.fillStyle = T.plat; rr(ctx, X, pl.y * S, pl.w * S, S * .4, 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; rr(ctx, X + 4, pl.y * S + 3, pl.w * S - 8, S * .09, 4); ctx.fill(); if (pl.mv) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(X + pl.w * S / 2 - 3, pl.y * S + S * .4, 6, 6); } }
        for (const s of lv.springs) { const X = (s.x - cam) * S; ctx.fillStyle = '#ff8a1f'; rr(ctx, X - S * .4, s.y * S - S * (.35 - s.sq), S * .8, S * (.35 - s.sq), 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(X - S * .3, s.y * S - S * (.35 - s.sq), S * .6, 4); }
        lv.cps.forEach(c => { const X = (c.x - cam) * S; if (X < -S || X > W + S) return; ctx.fillStyle = '#ddd'; ctx.fillRect(X - 2, c.y * S - S * 1.6, 4, S * 1.6); h.emoji(c.on ? '✅' : '🚩', X + S * .4, c.y * S - S * 1.3, S * .8); });
        { const X = (lv.goalX - cam) * S; if (X > -S * 3 && X < W + S * 3) { ctx.fillStyle = '#fff'; ctx.fillRect(X - 3, lv.cols[Math.floor(lv.goalX)] * S - S * 3, 6, S * 3); h.emoji(T.goal, X, lv.cols[Math.floor(lv.goalX)] * S - S * 1.2, S * 2.2); h.emoji('🏁', X + S * 1.6, lv.cols[Math.floor(lv.goalX)] * S - S * 1.0, S * 1.1); } }
        for (const it of lv.items) { if (it.got) continue; const X = (it.x - cam) * S; if (X < -S || X > W + S) continue; const b = Math.sin(tm * 4 + it.x) * S * .08; if (it.k === 's') { ctx.fillStyle = 'rgba(255,230,120,.35)'; ctx.beginPath(); ctx.arc(X, it.y * S + b, S * .75, 0, 6.283); ctx.fill(); h.emoji(T.star, X, it.y * S + b, S * 1.1); } else if (it.k === 'h') h.emoji('❤️', X, it.y * S + b, S * .9); else h.emoji(T.coin, X, it.y * S + b, S * .65); }
        for (const e of lv.en) { if (e.dead) continue; const X = (e.x - cam) * S; if (X < -S || X > W + S) continue; ctx.save(); ctx.translate(X, e.k === 'w' ? e.y * S - S * .45 : e.y * S); if (e.dir < 0) ctx.scale(-1, 1); h.emoji(e.k === 'w' ? T.walker : T.flyer, 0, 0, S * 1.05); ctx.restore(); }
        /* Spieler */
        { const X = (p.x - cam) * S; if (!(p.inv > 0 && Math.floor(tm * 14) % 2)) { ctx.save(); ctx.translate(X, p.y * S - S * .5 + (p.g ? Math.abs(Math.sin(p.run * 2.2)) * -S * .08 : 0)); ctx.scale(p.face < 0 ? 1 : -1, 1); ctx.rotate(p.g ? 0 : Math.max(-.3, Math.min(.3, p.vy * .02)) * p.face * -1); h.emoji(T.hero, 0, 0, S * 1.15); ctx.restore(); } }
        ctx.restore();
        /* HUD: Leben, Fortschritt, Hinweis, Knöpfe */
        for (let i = 0; i < p.life; i++) h.emoji('❤️', 28 + i * 30, 76, 26);
        { const bw = Math.min(W * .4, 320), bx = (W - bw) / 2, by = 60; ctx.fillStyle = 'rgba(0,0,0,.28)'; rr(ctx, bx, by, bw, 10, 5); ctx.fill(); ctx.fillStyle = '#ffd23f'; rr(ctx, bx, by, Math.max(10, bw * Math.min(1, p.x / lv.goalX)), 10, 5); ctx.fill(); h.emoji(T.hero, bx + bw * Math.min(1, p.x / lv.goalX), by + 5, 22); }
        if (msgT > 0 || over) h.text(msg, W / 2, H * .3, Math.min(40, W / 14), '#ffe27a');
        if (!over) { const B = btn(); ctx.globalAlpha = .45; for (const n of ['l', 'r', 'j']) { ctx.fillStyle = held(n === 'j' ? 'j' : n) ? '#ffd23f' : '#ffffff'; ctx.beginPath(); ctx.arc(B[n].x, B[n].y, B[n].r, 0, 6.283); ctx.fill(); } ctx.globalAlpha = .9; h.text('◀', B.l.x, B.l.y, B.l.r * .9, '#16335e'); h.text('▶', B.r.x, B.r.y, B.r.r * .9, '#16335e'); h.text('⤒', B.j.x, B.j.y, B.j.r * .95, '#16335e'); ctx.globalAlpha = 1; }
        if (tm < 5 && !over) h.text('Springen · 2× tippen = Doppelsprung · auf Gegner hüpfen!', W / 2, H * .18, Math.min(24, W / 26), '#fff');
      };
      const rr = (c, x, y, w, hh, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, hh, r); else c.rect(x, y, w, hh); };
      function drawBg(ctx, W, H, S) {
        const cx = cam * S, k = T.bg;
        if (k === 'hills' || k === 'sea' || k === 'rainbow') { for (let l = 0; l < 2; l++) { ctx.fillStyle = l ? 'rgba(80,170,110,.55)' : 'rgba(120,200,150,.4)'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, H * (.62 + l * .08) - Math.sin((x + cx * (.15 + l * .12)) / (110 - l * 30)) * H * .06); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); } }
        if (k === 'sea') { ctx.fillStyle = 'rgba(60,150,230,.35)'; ctx.fillRect(0, H * .72, W, H); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const X = ((i * 330 - cx * .25) % (W + 300) + W + 300) % (W + 300) - 100; ctx.globalAlpha = .7; ctx.beginPath(); ctx.ellipse(X, H * .2 + i * 25, 70, 20, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; } }
        if (k === 'rainbow') { for (let i = 0; i < 6; i++) { ctx.strokeStyle = COLS[i]; ctx.globalAlpha = .45; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(W * .5 - (cx * .1 % W), H * 1.05, H * (.85 - i * .045), Math.PI, 0); ctx.stroke(); } ctx.globalAlpha = 1; }
        if (k === 'city') { for (let i = 0; i < 14; i++) { const w = 70 + (i * 37) % 60, hh = H * (.25 + ((i * 53) % 40) / 100), X = ((i * 120 - cx * .3) % (W + 240) + W + 240) % (W + 240) - 120; ctx.fillStyle = 'rgba(60,40,90,.35)'; ctx.fillRect(X, H - hh, w, hh); ctx.fillStyle = 'rgba(255,230,150,.5)'; for (let y = H - hh + 14; y < H - 20; y += 26) for (let x = X + 10; x < X + w - 10; x += 22) if ((x + y) % 3) ctx.fillRect(x, y, 8, 10); } }
        if (k === 'park') { ctx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { ctx.globalAlpha = .6; ctx.fillRect((i * 97 - cx * .05 + 5000) % W, (i * 53) % (H * .5), 2, 2); } ctx.globalAlpha = 1; const X = ((W * .7 - cx * .2) % (W + 400) + W + 400) % (W + 400) - 200; ctx.strokeStyle = 'rgba(255,210,63,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(X, H * .55, H * .3, 0, 6.283); ctx.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.beginPath(); ctx.moveTo(X, H * .55); ctx.lineTo(X + Math.cos(a) * H * .3, H * .55 + Math.sin(a) * H * .3); ctx.stroke(); ctx.fillStyle = COLS[i % 6]; ctx.beginPath(); ctx.arc(X + Math.cos(a) * H * .3, H * .55 + Math.sin(a) * H * .3, 7, 0, 6.283); ctx.fill(); } }
        if (k === 'hills') { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 4; i++) { const X = ((i * 300 - cx * .2) % (W + 300) + W + 300) % (W + 300) - 100; ctx.beginPath(); ctx.ellipse(X, 80 + i * 40, 60, 22, 0, 0, 6.283); ctx.fill(); } }
      }
      return G;
    }
  }
};
(BI.MINI_EXT = BI.MINI_EXT || []).push(BI.JUMP.install);
