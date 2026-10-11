/* Prüfung: Das Ekel-Dinner (2D) – fünf Gänge aus der Showküche (alles harmlos: Gelee, Nudeln, Pudding, Keks, Lebensmittelfarbe),
   jeder Gang mit eigener Bedienung; übergreifend steigt der Würgreiz, Durchatmen senkt ihn (kostet Zeit). */
(function () {
  'use strict';
  const T = UTrials, D = T.draw, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, rnd = (a, b) => a + Math.random() * (b - a);
  const EMO = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  function hudBottom() { const el = document.getElementById('thud'); if (!el) return 92; const r = el.getBoundingClientRect(); return clamp(r.bottom + 6, 56, 170); }
  // Tasten im Canvas (auch per Maus klickbar)
  function mkBtns(ctx, list) {
    const P = { btns: list.map(b => Object.assign({ x: 0, y: 0, r: 34, held: false, edge: false, pid: null }, b)) };
    P.pointer = (type, x, y, id) => {
      if (type === 'down') { for (const b of P.btns) if (!b.hidden && Math.hypot(x - b.x, y - b.y) < b.r + 6) { b.held = true; b.edge = true; b.pid = id; return true; } return false; }
      if (type === 'up') { let u = false; for (const b of P.btns) if (b.pid === id) { b.held = false; b.pid = null; u = true; } return u; }
      return P.btns.some(b => b.pid === id);
    };
    P.down = id => { const b = P.btns.find(b => b.id === id); return ctx.I.down(id) || !!(b && b.held); };
    P.draw = c => P.btns.forEach(b => { if (b.hidden) return; c.save(); c.fillStyle = b.held ? 'rgba(255,207,74,.9)' : 'rgba(20,60,80,.72)'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.lineWidth = 2.5; c.strokeStyle = b.held ? '#fff' : 'rgba(160,230,255,.8)'; c.stroke(); D.emoji(c, b.icon || '', b.x, b.y - 9, 20); D.text(c, b.label, b.x, b.y + 13, 11, b.held ? '#2a1700' : '#fff', 'center', 900); c.restore(); });
    return P;
  }
  // Rauschen für Zittern
  const nz = t => Math.sin(t * 7.1) * .5 + Math.sin(t * 13.7 + 1.3) * .3 + Math.sin(t * 23.3 + 2.1) * .2;

  T.def({
    id: 'dinner', name: 'Das Ekel-Dinner', kind: 'Ekel', stat: 'ekel', e: '🍽️', mode: '2d',
    desc: 'Die Showküche serviert ein „Gourmet“-Menü: Sumpfsuppe, Käfer-Krokant, Glibber-Augen, Stinkfrucht-Smoothie und Schleimnudeln. Klingt wild – ist aber alles nur Gelee, Keks, Pudding, Nudeln und Lebensmittelfarbe. Jeder Gang wird anders gegessen. Pass auf deinen Würgreiz auf: Durchatmen hilft, kostet aber Zeit.',
    how: { pc: 'Jeder Gang erklärt sich oben: <b>Maus</b> ziehen/klicken oder <b>WASD/Pfeile</b> + <b>Leertaste/E</b> · <b>Q halten</b> = Durchatmen (senkt den Würgreiz)', touch: 'Ziehen und Tippen direkt auf dem Teller · Taste <b>Durchatmen</b> halten senkt den Würgreiz' },
    controls: false,
    create(ctx) {
      const I = ctx.I, d = ctx.diff, S = ctx.S, who = Object.assign({ skin: '#e8b98f', hair: '#3b2a1c', hs: 'short', top: '#2a9d8f' }, ctx.who || {});
      const nCourse = clamp(ctx.max, 3, 5), bonus = Math.max(0, ctx.max - nCourse);
      const ALL = ['suppe', 'krokant', 'augen', 'smoothie', 'nudeln'];
      const menu = nCourse >= 5 ? ALL : ctx.short ? ['suppe', 'augen', 'nudeln', 'krokant', 'smoothie'].slice(0, nCourse) : ALL.slice(0, nCourse);
      const btn = mkBtns(ctx, [{ id: 'alt', label: 'Durchatmen', icon: '😮‍💨' }]);
      // Avatar-Bilder
      const imgs = {}; if (root().Avatar) ['n', 'happy', 'gag', 'scared', 'sad', 'cool'].forEach(m => { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(root().Avatar.svg(who, m)); imgs[m] = im; });
      let W = ctx.W, H = ctx.H, topY = 92, land = true, F = { x: 0, y: 0, s: 100 }, M = { x: 0, y: 0 }, A = { x: 0, y: 0, w: 100, h: 100 }, sc = 1, bg = null;
      let gag = .12, peak = 0, attacks = 0, won = 0, stars = 0, ci = -1, C = null, phase = 'intro', phT = 0, cTime = 0, cDur = 20, over = false, lastTimeout = false, time = 0, breathing = false;
      let mood = 'n', moodT = 0, chewT = 0, mouthOpen = 0, shake = 0, bubble = '', bubbleT = 0, parts = [], flies = [], relT = 0, cloche = 0;
      for (let i = 0; i < 4; i++) flies.push({ x: Math.random(), y: Math.random(), a: rnd(0, TAU), t: rnd(0, 9) });
      function layout() {
        W = ctx.W; H = ctx.H; topY = hudBottom(); land = W > H * 1.15;
        if (land) { const fs = Math.min(W * .28, (H - topY - 84) / 1.1); F = { x: W * .03 + (W * .28 - fs) / 2, y: topY + 2, s: fs }; const ax = W * .34; A = { x: ax, y: topY + 4, w: W - ax - 12, h: H - topY - 12 }; btn.btns[0].x = W * .03 + W * .14; btn.btns[0].y = H - 44; }
        else { const fs = Math.min(W * .48, (H - topY) * .26); F = { x: (W - fs) / 2, y: topY + 2, s: fs }; const ay = F.y + fs * 1.1 + 6; A = { x: 10, y: ay, w: W - 20, h: H - ay - 92 }; btn.btns[0].x = W / 2; btn.btns[0].y = H - 46; }
        M = { x: F.x + F.s * .5, y: F.y + F.s * .6 }; sc = Math.min(A.w, A.h) / 300; bg = render(); if (C && C.resize) C.resize();
      }
      function root() { return window; }
      function render() {
        const cv = document.createElement('canvas'), dpr = ctx.dpr || 1; cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr);
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#24452c'); g.addColorStop(.6, '#11261a'); g.addColorStop(1, '#0a160f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        let s = 17; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 46; i++) { const x = r() * W, y = r() * H * .7; c.save(); c.translate(x, y); c.rotate(r() * TAU); c.fillStyle = `hsla(${100 + r() * 50},55%,${14 + r() * 18}%,.7)`; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(40, -18, 90, 0); c.quadraticCurveTo(40, 18, 0, 0); c.fill(); c.restore(); }
        // Lichterkette
        c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.beginPath(); for (let x = 0; x <= W; x += 8) c.lineTo(x, topY - 6 + Math.sin(x / W * Math.PI * 3) * 8); c.stroke();
        for (let x = 20; x < W; x += 46) { const y = topY - 6 + Math.sin(x / W * Math.PI * 3) * 8 + 5, col = ['#ffcf4a', '#ff6b4a', '#9dff5c', '#37d6e8'][(x / 46 | 0) % 4]; const lg = c.createRadialGradient(x, y, 0, x, y, 14); lg.addColorStop(0, col); lg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = lg; c.fillRect(x - 14, y - 14, 28, 28); c.fillStyle = col; c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); }
        // Tisch mit Karo-Decke
        const ty = land ? H * .55 : A.y + A.h * .35; c.fillStyle = '#5a3418'; c.fillRect(0, ty, W, H - ty);
        const n = Math.ceil(W / 34) + 2; for (let i = 0; i < n; i++) for (let j = 0; j < Math.ceil((H - ty) / 20) + 1; j++) { if ((i + j) % 2) continue; c.fillStyle = 'rgba(200,40,40,.55)'; const x0 = i * 34 - 17 + (j * 4), y0 = ty + j * 20; c.fillRect(x0, y0, 34, 20); }
        const tg = c.createLinearGradient(0, ty, 0, H); tg.addColorStop(0, 'rgba(255,255,255,.12)'); tg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = tg; c.fillRect(0, ty, W, H - ty);
        // Spot auf den Teller
        const sp = c.createRadialGradient(A.x + A.w / 2, A.y + A.h * .55, 10, A.x + A.w / 2, A.y + A.h * .55, Math.max(A.w, A.h) * .7); sp.addColorStop(0, 'rgba(255,240,200,.22)'); sp.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = sp; c.fillRect(0, 0, W, H);
        // Schild
        if (land) { c.save(); c.translate(F.x + F.s / 2, H - 92); c.fillStyle = '#7a4a1e'; D.rr(c, -70, -14, 140, 26, 8); c.fill(); D.text(c, '🍴 Urwald-Bistro', 0, -1, 13, '#ffe9b0'); c.restore(); }
        const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
        return cv;
      }
      function addGag(v) { gag = clamp(gag + v, 0, 1.2); peak = Math.max(peak, Math.min(1, gag)); }
      function say(t, dur) { bubble = t; bubbleT = dur || 1.8; }
      function setMood(m, t) { mood = m; moodT = t || 1.2; }
      function swallow(v, line) { addGag(v); chewT = .9; S.swallow(); if (line) say(line); }
      function puff(x, y, col, n) { for (let i = 0; i < (n || 8); i++) parts.push({ x, y, vx: rnd(-80, 80), vy: rnd(-120, 20), t: 0, life: rnd(.5, .9), col: col || '#9a6a3a', r: rnd(2, 4.5) }); }

      // ---------- Gänge
      const COURSES = {
        // 1) Suppe löffeln: ziehen, nicht zu schnell, Zittern ausgleichen
        suppe() {
          const need = ctx.short ? 3 : 3 + (d > .6 ? 1 : 0);
          let sp = { x: 0, y: 0, tx: 0, ty: 0, c: 0, v: 0 }, n = 0, grab = null, drops = [], warn = 0, bowl = null;
          const o = {
            name: 'Sumpfsuppe à la Kiki', sub: 'Spinat-Gelee-Brühe mit Algen aus Lebensmittelfarbe', how: 'Löffel ziehen: eintauchen, dann LANGSAM zum Mund – nicht kleckern!',
            resize() { bowl = { x: A.x + A.w * (land ? .62 : .5), y: A.y + A.h * (land ? .68 : .62), rx: 92 * sc, ry: 42 * sc }; if (!sp.x) { sp.x = sp.tx = bowl.x + bowl.rx * 1.25; sp.y = sp.ty = bowl.y - 20 * sc; } },
            prog: () => n / need,
            dbg: () => ({ x: sp.x | 0, y: sp.y | 0, tx: sp.tx | 0, ty: sp.ty | 0, c: +sp.c.toFixed(2), b: o._b, M, grab }),
            vSafe: () => Math.hypot(bowl.x - M.x, bowl.y - M.y) / (1.25 + d * .5),
            update(dt, act) {
              const m = I.move; if (act && (m.x || m.y)) { sp.tx += m.x * 260 * sc * dt; sp.ty -= m.y * 260 * sc * dt; }
              sp.tx = clamp(sp.tx, 8, W - 8); sp.ty = clamp(sp.ty, M.y - 10, H - 8);
              const ox = sp.x, oy = sp.y; const k = 1 - Math.pow(.0008, dt); sp.x += (sp.tx - sp.x) * k; sp.y += (sp.ty - sp.y) * k;
              const v = Math.hypot(sp.x - ox, sp.y - oy) / Math.max(dt, 1e-4); sp.v = lerp(sp.v, v, .3);
              const inBowl = ((sp.x - bowl.x) / bowl.rx) ** 2 + ((sp.y - bowl.y) / bowl.ry) ** 2 < 1;
              if (inBowl && act) { sp.c = Math.min(1, sp.c + dt * 3); }
              else if (sp.c > 0) {
                const ex = Math.max(0, sp.v - o.vSafe()) / o.vSafe(), trem = .03 + gag * .08;
                const loss = (ex * 1.5 + trem) * dt; if (ex > 0) warn = .4; sp.c = Math.max(0, sp.c - loss);
                if (Math.random() < loss * 30) drops.push({ x: sp.x + rnd(-6, 6), y: sp.y, vy: 40, t: 0 });
              }
              warn = Math.max(0, warn - dt);
              const tx = trem(), mx = sp.x + tx.x, my = sp.y + tx.y;
              if (act && Math.hypot(mx - M.x, my - M.y) < 30 * Math.max(.8, sc)) {
                if (sp.c > .35) { n++; swallow(.1 + d * .05 + sp.c * .03, ['Schmeckt nach … Sumpf!', 'Glibbrig-grün!', 'Noch ein Löffel …', 'Bitte nicht nachwürzen!'][n % 4]); setMood('gag', .7); sp.c = 0; if (n >= need) return 'win'; }
                else if (sp.c > 0 || !o._empty) { say('Löffel leer – alles gekleckert!'); sp.c = 0; o._empty = true; }
              }
              if (!(Math.hypot(mx - M.x, my - M.y) < 30 * sc)) o._empty = false;
              drops.forEach(p => { p.vy += 600 * dt; p.y += p.vy * dt; p.t += dt; }); drops = drops.filter(p => p.t < .8);
              mouthOpen = lerp(mouthOpen, Math.hypot(sp.x - M.x, sp.y - M.y) < 140 * sc && sp.c > .2 ? 1 : 0, .15);
              return null;
            },
            draw(c) {
              // Schüssel
              c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(bowl.x + 8, bowl.y + bowl.ry * 1.4, bowl.rx * 1.05, bowl.ry * .6, 0, 0, TAU); c.fill();
              const bg2 = c.createLinearGradient(bowl.x - bowl.rx, 0, bowl.x + bowl.rx, 0); bg2.addColorStop(0, '#c9d6e0'); bg2.addColorStop(.5, '#ffffff'); bg2.addColorStop(1, '#a8b6c2'); c.fillStyle = bg2; c.beginPath(); c.ellipse(bowl.x, bowl.y, bowl.rx, bowl.ry, 0, 0, Math.PI); c.lineTo(bowl.x + bowl.rx * .7, bowl.y + bowl.ry * 1.6); c.lineTo(bowl.x - bowl.rx * .7, bowl.y + bowl.ry * 1.6); c.closePath(); c.fill();
              c.fillStyle = '#e8eef3'; c.beginPath(); c.ellipse(bowl.x, bowl.y, bowl.rx, bowl.ry, 0, 0, TAU); c.fill();
              const sg = c.createRadialGradient(bowl.x - 20 * sc, bowl.y - 8 * sc, 4, bowl.x, bowl.y, bowl.rx); sg.addColorStop(0, '#8fbf3a'); sg.addColorStop(1, '#3d6a1a'); c.fillStyle = sg; c.beginPath(); c.ellipse(bowl.x, bowl.y + 2, bowl.rx * .9, bowl.ry * .78, 0, 0, TAU); c.fill();
              for (let i = 0; i < 6; i++) { const a = time * .4 + i, bx = bowl.x + Math.cos(a) * bowl.rx * .55, by = bowl.y + 2 + Math.sin(a * 1.3) * bowl.ry * .4; c.fillStyle = 'rgba(200,255,120,.5)'; c.beginPath(); c.arc(bx, by, (3 + Math.sin(time * 3 + i) * 1.5) * sc, 0, TAU); c.fill(); }
              c.font = `${16 * sc}px ${EMO}`; c.fillText('🌿', bowl.x - bowl.rx * .3, bowl.y); c.fillText('👁️', bowl.x + bowl.rx * .35, bowl.y + 4 * sc);
              for (let i = 0; i < 3; i++) { const yy = (time * 30 + i * 30) % 70; c.strokeStyle = `rgba(220,255,200,${.25 * (1 - yy / 70)})`; c.lineWidth = 3; c.beginPath(); c.moveTo(bowl.x - 30 * sc + i * 30 * sc, bowl.y - 10 - yy); c.quadraticCurveTo(bowl.x - 20 * sc + i * 30 * sc, bowl.y - 25 - yy, bowl.x - 30 * sc + i * 30 * sc, bowl.y - 40 - yy); c.stroke(); }
              drops.forEach(p => { c.fillStyle = '#6aa02a'; c.beginPath(); c.ellipse(p.x, p.y, 3, 4.5, 0, 0, TAU); c.fill(); });
              // Löffel (mit Zittern)
              const tr = trem(), x = sp.x + tr.x, y = sp.y + tr.y;
              c.save(); c.translate(x, y); const ang = Math.atan2(y - (bowl.y + 60 * sc), x - (bowl.x + bowl.rx * 1.6)) * 0 + .6; c.rotate(ang);
              c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(4, 6, 20 * sc, 13 * sc, 0, 0, TAU); c.fill();
              const lg = c.createLinearGradient(0, 0, 90 * sc, 0); lg.addColorStop(0, '#d8dde2'); lg.addColorStop(1, '#8a949c'); c.fillStyle = lg; D.rr(c, 12 * sc, -4 * sc, 90 * sc, 8 * sc, 4 * sc); c.fill();
              c.fillStyle = '#e8edf2'; c.beginPath(); c.ellipse(0, 0, 20 * sc, 13 * sc, 0, 0, TAU); c.fill(); c.strokeStyle = '#8a949c'; c.lineWidth = 1.5; c.stroke();
              if (sp.c > 0) { c.fillStyle = '#5e9a24'; c.beginPath(); c.ellipse(0, 0, 17 * sc * Math.sqrt(sp.c), 10 * sc * Math.sqrt(sp.c), 0, 0, TAU); c.fill(); }
              c.restore();
              // Geschwindigkeitsanzeige am Löffel
              if (sp.c > 0) { const f = clamp(sp.v / o.vSafe(), 0, 1.6); c.fillStyle = 'rgba(0,0,0,.5)'; D.rr(c, x - 26, y + 22 * sc, 52, 7, 3); c.fill(); c.fillStyle = f > 1 ? '#ff6b4a' : f > .75 ? '#ffcf4a' : '#9dff5c'; D.rr(c, x - 26, y + 22 * sc, 52 * Math.min(1, f / 1.6), 7, 3); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 26 + 52 / 1.6, y + 21 * sc, 2, 9); }
              if (warn > 0) D.text(c, 'Langsam! Es schwappt!', x, y - 30 * sc, 14, '#ffcf4a');
              D.text(c, `Löffel ${n} / ${need}`, A.x + A.w / 2, A.y + 14, 15, '#fff');
            },
            pointer(t, x, y, id) { if (t === 'down') { grab = id; sp.tx = x; sp.ty = y; } else if (t === 'move' && (grab === id || !ctx.I.touch)) { if (grab === id || (grab == null && !ctx.I.touch && false)) { sp.tx = x; sp.ty = y; } } else if (t === 'up' && grab === id) grab = null; },
            bot(dt) {
              if (sp.c >= .98) o._full = true; else if (sp.c < .3) o._full = false;
              const v = o.vSafe() * .7, tgt = !o._full ? { x: bowl.x, y: bowl.y } : { x: M.x, y: M.y + 4 };
              if (!o._b || grab == null) { o._b = { x: sp.tx, y: sp.ty }; return { pointer: [['down', sp.tx, sp.ty, 7]] }; }
              const b = o._b, dx = tgt.x - b.x, dy = tgt.y - b.y, L = Math.hypot(dx, dy), stepL = Math.min(L, v * dt); if (L > 1) { b.x += dx / L * stepL; b.y += dy / L * stepL; }
              return { pointer: [['move', b.x, b.y, 7]] };
            }
          };
          function trem() { const a = (5 + gag * 12 + d * 4) * Math.max(.7, sc); return { x: nz(time * 1.3) * a, y: nz(time * 1.1 + 5) * a }; }
          return o;
        },
        // 2) Krokant im Rhythmus kauen
        krokant() {
          const need = ctx.short ? 10 : 12 + Math.round(d * 4);
          let ph = 0, per = 1.0 - d * .2, n = 0, hitSide = 0, lastX = 0, flash = 0, flashOk = true, combo = 0, pieces = [];
          for (let i = 0; i < 9; i++) pieces.push({ a: rnd(0, TAU), r: rnd(0, 1), rot: rnd(0, TAU), s: rnd(.7, 1.1) });
          const win = .16 + (1 - d) * .06;
          const o = {
            name: 'Knusper-Käfer-Krokant', sub: 'Keks-Krokant in Käferform mit Karamell-Beinchen', how: 'Im Takt kauen: tippe LINKS / RECHTS, wenn die Kau-Anzeige außen ankommt!',
            prog: () => n / need,
            // Pendel: pos = -cos(ph*π) → bei ph ganzzahlig: gerade = links (-1), ungerade = rechts (+1)
            pos: () => -Math.cos(ph * Math.PI),
            update(dt, act) {
              if (act) ph += dt / per;
              const k = Math.round(ph), side = k % 2 ? 1 : -1, near = Math.abs(ph - k) < win;
              // verpasster Schlag
              if (act && ph - hitSide > 1 + win) combo = 0;
              const mx = I.move.x, edge = (Math.abs(mx) > .5 && Math.abs(lastX) <= .5) ? Math.sign(mx) : 0; lastX = mx;
              const tap = edge || o._tap || 0; o._tap = 0;
              if (tap && act) {
                if (near && tap === side && hitSide !== k) { hitSide = k; n++; combo++; flash = .25; flashOk = true; S.thud(); chewT = .35; puff(M.x + side * 14, M.y + 6, '#c98a3a', 5); if (n % 5 === 0) swallow(.07 + d * .04, ['Knack! Karamell-Beinchen!', 'Knusprig … zu knusprig!', 'Das knackt wie echt!'][(n / 5 | 0) % 3]); else addGag(.012); per = Math.max(.62, per - .012); if (n >= need) return 'win'; }
                else { flash = .3; flashOk = false; combo = 0; addGag(.06); S.bad(); say(['Autsch, Zunge!', 'Aus dem Takt!', 'Falsche Seite!'][Math.floor(Math.random() * 3)], 1); setMood('sad', .6); }
              }
              flash = Math.max(0, flash - dt); mouthOpen = lerp(mouthOpen, .2 + .5 * Math.abs(Math.sin(ph * Math.PI)), .2);
              return null;
            },
            draw(c) {
              const cx = A.x + A.w / 2, cy = A.y + A.h * .62, pr = Math.min(A.w * .42, A.h * .36);
              plate(c, cx, cy, pr, pr * .55);
              pieces.forEach((p, i) => { if (i >= Math.ceil(9 * (1 - n / need))) return; const x = cx + Math.cos(p.a) * pr * .55 * p.r, y = cy + Math.sin(p.a) * pr * .3 * p.r; beetle(c, x, y, 16 * sc * p.s, p.rot + Math.sin(time * 2 + i) * .1); });
              // Kau-Anzeige
              const bw = Math.min(A.w * .8, 360), bx = cx - bw / 2, by = A.y + Math.max(30, A.h * .14);
              c.fillStyle = 'rgba(0,0,0,.55)'; D.rr(c, bx - 8, by - 18, bw + 16, 36, 18); c.fill();
              for (const sd of [-1, 1]) { const zx = cx + sd * bw / 2, k = Math.round(ph), active = (k % 2 ? 1 : -1) === sd && Math.abs(ph - k) < win; c.fillStyle = active ? 'rgba(157,255,92,.85)' : 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(zx, by, 16, 0, TAU); c.fill(); D.text(c, sd < 0 ? 'L' : 'R', zx, by, 14, active ? '#123' : '#fff', 'center', 900); }
              const px = cx + o.pos() * (bw / 2); c.save(); c.shadowColor = '#ffcf4a'; c.shadowBlur = 10; c.fillStyle = '#ffcf4a'; c.beginPath(); c.arc(px, by, 10, 0, TAU); c.fill(); c.restore();
              if (flash > 0) D.text(c, flashOk ? 'KNACK!' : 'AUTSCH!', cx, by + 34, 18, flashOk ? '#9dff5c' : '#ff6b4a', 'center', 900);
              D.text(c, `Kauen ${n} / ${need}` + (combo > 3 ? `  · Takt ×${combo}` : ''), cx, by - 30, 14, '#fff');
              // Tippzonen
              if (ctx.I.touch || true) { c.save(); c.globalAlpha = .18 + (o._zl > 0 ? .3 : 0); c.fillStyle = '#fff'; D.rr(c, A.x + 4, cy - pr * .4, A.w * .22, pr * .9, 14); c.fill(); c.globalAlpha = .18 + (o._zr > 0 ? .3 : 0); D.rr(c, A.x + A.w * .78 - 4, cy - pr * .4, A.w * .22, pr * .9, 14); c.fill(); c.restore(); D.text(c, '◀ links', A.x + 4 + A.w * .11, cy + pr * .05, 13, '#fff'); D.text(c, 'rechts ▶', A.x + A.w * .89 - 4, cy + pr * .05, 13, '#fff'); }
              o._zl = Math.max(0, (o._zl || 0) - 1 / 60); o._zr = Math.max(0, (o._zr || 0) - 1 / 60);
            },
            pointer(t, x, y) { if (t !== 'down' || y < A.y) return; const sd = x < A.x + A.w / 2 ? -1 : 1; o._tap = sd; if (sd < 0) o._zl = .2; else o._zr = .2; },
            bot() { const k = Math.round(ph), side = k % 2 ? 1 : -1; if (Math.abs(ph - k) < win * .5 && hitSide !== k && !o._held) { o._held = 2; return { move: { x: side, y: 0 } }; } if (o._held) { o._held--; } return { move: { x: 0, y: 0 } }; }
          };
          return o;
        },
        // 3) Glibber-Augen aufspießen
        augen() {
          const need = ctx.short ? 3 : 4 + Math.round(d * 1.5), cnt = need + 2;
          let eyes = [], fork = { x: 0, y: 0, down: 0, tx: 0, ty: 0, hit: -1 }, n = 0, cool = 0, cx = 0, cy = 0, rx = 1, ry = 1, msgMiss = 0;
          const spd = (70 + d * 70) * 1;
          const o = {
            name: 'Glibber-Augen-Gelee', sub: 'Litschi-Gelee mit Heidelbeer-Pupillen', how: 'Gabel zielen und zustechen (tippen/klicken bzw. Leertaste) – sie rollen weg!',
            resize() { cx = A.x + A.w / 2; cy = A.y + A.h * .58; rx = Math.min(A.w * .44, A.h * .62); ry = rx * .55; if (!eyes.length) { for (let i = 0; i < cnt; i++) { const a = rnd(0, TAU), r = rnd(0, .7); eyes.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, vx: rnd(-1, 1), vy: rnd(-1, 1), wob: rnd(0, 6), blink: rnd(1, 4), alive: true, col: ['#ff5a5a', '#5ad1ff', '#9dff5c', '#ffcf4a'][i % 4] }); } fork.x = fork.tx = cx; fork.y = fork.ty = cy - ry * .4; } },
            prog: () => n / need,
            update(dt, act) {
              if (act) { const m = I.move; if (m.x || m.y) { fork.tx += m.x * 300 * sc * dt; fork.ty -= m.y * 300 * sc * dt; } }
              fork.tx = clamp(fork.tx, cx - rx, cx + rx); fork.ty = clamp(fork.ty, cy - ry * 1.3, cy + ry);
              fork.x += (fork.tx - fork.x) * Math.min(1, dt * 18); fork.y += (fork.ty - fork.y) * Math.min(1, dt * 18);
              if (act && (I.pressed('jump') || I.pressed('act') || o._stab) && fork.down <= 0 && cool <= 0) { fork.down = .2; fork.sx = fork.x; fork.sy = fork.y; }
              o._stab = false;
              if (fork.down > 0) { fork.down -= dt; if (fork.down <= 0) { cool = .35; // Aufprall
                let best = -1, bd = 1e9; eyes.forEach((e, i) => { if (!e.alive) return; const ex = cx + e.x * rx, ey = cy + e.y * ry, dd = Math.hypot(ex - fork.sx, ey - (fork.sy + 0)); if (dd < bd) { bd = dd; best = i; } });
                if (best >= 0 && bd < 22 * Math.max(.8, sc)) { const e = eyes[best]; e.alive = false; n++; fork.hit = best; swallow(.09 + d * .04, ['Es hat mich angeguckt!', 'Plopp! Glibber!', 'Augen zu und durch!', 'Schmeckt nach Litschi … igitt!'][n % 4]); setMood('scared', .8); puff(fork.sx, fork.sy, '#e8f0ff', 6); if (n >= need) return 'win'; }
                else { S.click(); msgMiss = .6; addGag(.015); eyes.forEach(e => { e.vx += rnd(-1, 1) * .6; e.vy += rnd(-1, 1) * .6; }); }
              } }
              cool = Math.max(0, cool - dt); msgMiss = Math.max(0, msgMiss - dt);
              eyes.forEach(e => { if (!e.alive) return; e.wob += dt; e.blink -= dt; if (e.blink < -.15) e.blink = rnd(1.5, 4); // Fluchtreflex vor der Gabel
                const fx = (fork.x - cx) / rx, fy = (fork.y - cy) / ry, dx = e.x - fx, dy = e.y - fy, dd = Math.hypot(dx, dy) + .01; if (dd < .45) { e.vx += dx / dd * dt * (1.5 + d * 2.5); e.vy += dy / dd * dt * (1.5 + d * 2.5); }
                e.vx += Math.sin(time * .9 + e.wob) * dt * .4; e.vy += Math.cos(time * 1.1 + e.wob) * dt * .4;
                const sp = Math.hypot(e.vx, e.vy), mx = (spd / Math.max(80, rx)) * 1.4; if (sp > mx) { e.vx *= mx / sp; e.vy *= mx / sp; } if (sp < mx * .35) { e.vx *= 1.02; e.vy *= 1.02; }
                e.x += e.vx * dt; e.y += e.vy * dt; const r = Math.hypot(e.x, e.y); if (r > .82) { const nx = e.x / r, ny = e.y / r, dot = e.vx * nx + e.vy * ny; if (dot > 0) { e.vx -= 2 * dot * nx; e.vy -= 2 * dot * ny; } e.x = nx * .82; e.y = ny * .82; } });
              // Augen stoßen sich ab
              for (let i = 0; i < eyes.length; i++) for (let j = i + 1; j < eyes.length; j++) { const a = eyes[i], b = eyes[j]; if (!a.alive || !b.alive) continue; const dx = (b.x - a.x) * rx, dy = (b.y - a.y) * ry, dd = Math.hypot(dx, dy); if (dd < 30 * sc && dd > .01) { const p = (30 * sc - dd) / 2; a.x -= dx / dd * p / rx; a.y -= dy / dd * p / ry; b.x += dx / dd * p / rx; b.y += dy / dd * p / ry; } }
              mouthOpen = lerp(mouthOpen, fork.hit >= 0 && cool > 0 ? 1 : .1, .2);
              return null;
            },
            draw(c) {
              plate(c, cx, cy, rx * 1.12, ry * 1.25);
              const wob = Math.sin(time * 5) * .03; c.fillStyle = 'rgba(160,230,120,.35)'; c.beginPath(); c.ellipse(cx, cy, rx * (.95 + wob), ry * (.95 - wob), 0, 0, TAU); c.fill();
              eyes.forEach(e => { if (!e.alive) return; const x = cx + e.x * rx, y = cy + e.y * ry, r = 16 * sc * Math.max(.85, 1); eyeball(c, x, y, r, fork.x - x, fork.y - y, e.blink < 0, e.col, time + e.wob); });
              // Gabel
              const dz = fork.down > 0 ? 1 - fork.down / .2 : 0, gx = fork.down > 0 ? fork.sx : fork.x, gy = (fork.down > 0 ? fork.sy : fork.y);
              c.save(); c.globalAlpha = .35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(gx, gy, 10 * sc * (1 + dz), 5 * sc * (1 + dz), 0, 0, TAU); c.fill(); c.restore();
              const lift = (1 - dz) * 46 * sc; c.save(); c.translate(gx, gy - lift); c.strokeStyle = '#c9d0d6'; c.lineWidth = 3.5; c.lineCap = 'round'; for (let k = -1.5; k <= 1.5; k++) { c.beginPath(); c.moveTo(k * 5 * sc, 0); c.lineTo(k * 5 * sc, -22 * sc); c.stroke(); } c.lineWidth = 5; c.beginPath(); c.moveTo(-8 * sc, -22 * sc); c.quadraticCurveTo(0, -30 * sc, 8 * sc, -22 * sc); c.moveTo(0, -27 * sc); c.lineTo(0, -80 * sc); c.stroke(); c.restore();
              if (fork.down <= 0) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(fork.x, fork.y, 22 * Math.max(.8, sc), 0, TAU); c.stroke(); }
              if (msgMiss > 0) D.text(c, 'Pling! Daneben', fork.x, fork.y - 70 * sc, 15, '#ffcf4a');
              D.text(c, `Augen ${n} / ${need}`, A.x + A.w / 2, A.y + 14, 15, '#fff');
            },
            pointer(t, x, y) { if (t === 'move' || t === 'down') { fork.tx = x; fork.ty = y; fork.x = x; fork.y = y; } if (t === 'down') o._stab = true; },
            bot() {
              if (fork.down > 0 || cool > 0) return {};
              let best = null, bd = 1e9; eyes.forEach(e => { if (!e.alive) return; const ex = cx + (e.x + e.vx * .22) * rx, ey = cy + (e.y + e.vy * .22) * ry, dd = Math.hypot(ex - fork.x, ey - fork.y); if (dd < bd) { bd = dd; best = { x: ex, y: ey }; } });
              if (!best) return {}; o._bt = (o._bt || 0) + 1; if (o._bt % 20) return { pointer: [['move', best.x, best.y, 3]] };
              return { pointer: [['down', best.x, best.y, 3], ['up', best.x, best.y, 3]] };
            }
          };
          return o;
        },
        // 4) Smoothie durch den Strohhalm – Stückchen ausweichen
        smoothie() {
          let level = 1, tip = .5, ttip = .5, chunks = [], suck = false, choke = 0, g = null, bubbles = [];
          const nCh = ctx.short ? 4 : 4 + Math.round(d * 4), rate = ctx.short ? .12 : .11;
          for (let i = 0; i < nCh; i++) chunks.push({ x: rnd(.1, .9), y: rnd(.15, .95), vx: rnd(-.15, .15), vy: rnd(-.1, .1), r: rnd(.8, 1.2), rot: rnd(0, TAU), k: i % 3 });
          const o = {
            name: 'Stinkfrucht-Smoothie', sub: 'Bananen-Mango-Mix mit Käsewürfeln (nur der Geruch ist echt)', how: 'Gedrückt halten = saugen, Strohhalm seitlich lenken – keine Stückchen einsaugen!',
            resize() { const gh = Math.min(A.h * .74, 250 * sc + 30), gw = Math.min(A.w * .5, gh * .62); g = { x: A.x + A.w / 2 - gw / 2, y: A.y + A.h - gh - 6, w: gw, h: gh }; },
            prog: () => 1 - level,
            update(dt, act) {
              const m = I.move; if (act && m.x) ttip = clamp(ttip + m.x * dt * .9, .08, .92);
              tip += (ttip - tip) * Math.min(1, dt * 8);
              suck = act && choke <= 0 && (I.down('jump') || I.down('act') || o._hold);
              if (choke > 0) choke -= dt;
              const lt = 1 - level; // Flüssigkeit: y von lt..1 (0 oben)
              chunks.forEach(ch => { ch.rot += dt * ch.vx * 3; // Strömung zum Halm
                const dx = tip - ch.x, dy = .97 - ch.y, dd = Math.hypot(dx, dy * .7) + .02; if (suck) { const f = .3 / (dd * 4 + .3); ch.vx += dx / dd * f * dt; ch.vy += dy / dd * f * dt; }
                ch.vx += Math.sin(time * .8 + ch.r * 9) * dt * .06; ch.vy += Math.cos(time * .7 + ch.r * 7) * dt * .06; ch.vx *= Math.pow(.6, dt); ch.vy *= Math.pow(.6, dt);
                ch.x += ch.vx * dt; ch.y += ch.vy * dt; if (ch.x < .08) { ch.x = .08; ch.vx = Math.abs(ch.vx); } if (ch.x > .92) { ch.x = .92; ch.vx = -Math.abs(ch.vx); } if (ch.y < lt + .05) { ch.y = lt + .05; ch.vy = Math.abs(ch.vy); } if (ch.y > .96) { ch.y = .96; ch.vy = -Math.abs(ch.vy) * .5; }
                if (suck && Math.abs(ch.x - tip) < .085 * ch.r && ch.y > .86) { ch.y = lt + .08; ch.x = rnd(.1, .9); ch.vx = ch.vy = 0; choke = .9; addGag(.17 + d * .05); S.gag(); say(['Stückchen im Halm! Hust!', 'Bäh, ein Brocken!', 'Klumpen-Alarm!'][Math.floor(Math.random() * 3)]); setMood('gag', 1); shake = .4; } });
              if (suck) { level = Math.max(0, level - rate * dt); addGag(.02 * dt * (1 + d)); if (Math.random() < dt * 12) bubbles.push({ x: tip + rnd(-.03, .03), y: .95, t: 0 }); if (level <= .02) { swallow(.04, 'Leer! Und der Geruch bleibt …'); return 'win'; } }
              bubbles.forEach(b => { b.t += dt; b.y -= dt * .5; }); bubbles = bubbles.filter(b => b.y > 1 - level && b.t < 2);
              mouthOpen = lerp(mouthOpen, suck ? .35 : 0, .2);
              return null;
            },
            draw(c) {
              const { x, y, w, h } = g, lt = 1 - level;
              c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + w / 2 + 6, y + h + 4, w * .55, 10, 0, 0, TAU); c.fill();
              c.save(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w * .9, y + h); c.lineTo(x + w * .1, y + h); c.closePath(); c.clip();
              const sg = c.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, '#d9c24a'); sg.addColorStop(1, '#8a9a2a'); c.fillStyle = sg; c.fillRect(x, y + h * lt, w, h * (1 - lt));
              c.strokeStyle = 'rgba(255,255,220,.5)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 20; i++) { const xx = x + w * i / 20; c.lineTo(xx, y + h * lt + Math.sin(i + time * 4) * 2); } c.stroke();
              chunks.forEach(ch => { const cxp = x + w * ch.x, cyp = y + h * ch.y; c.save(); c.translate(cxp, cyp); c.rotate(ch.rot); const s = 11 * sc * ch.r; c.fillStyle = ['#f2e2a0', '#ffd860', '#c8a050'][ch.k]; D.rr(c, -s, -s * .8, s * 2, s * 1.6, s * .4); c.fill(); c.strokeStyle = 'rgba(90,60,10,.6)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = 'rgba(120,90,20,.5)'; c.beginPath(); c.arc(-s * .3, -s * .2, s * .2, 0, TAU); c.arc(s * .4, s * .25, s * .15, 0, TAU); c.fill(); c.restore(); });
              bubbles.forEach(b => { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x + w * b.x, y + h * b.y, 3, 0, TAU); c.stroke(); });
              c.restore();
              // Glas
              c.strokeStyle = 'rgba(220,240,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .1, y + h); c.lineTo(x + w * .9, y + h); c.lineTo(x + w, y); c.stroke(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + w * .1, y + 6, 6, h - 12);
              // Halm
              const sx = x + w * tip, sy = y + h * .97; c.strokeStyle = '#ff4fa0'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx, y - 26); c.quadraticCurveTo(sx, y - 46, sx + (M.x - sx) * .3, y - 50); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 2, sy); c.lineTo(sx - 2, y - 26); c.stroke();
              c.strokeStyle = suck ? 'rgba(157,255,92,.7)' : 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.arc(sx, sy, w * .085, 0, TAU); c.stroke(); c.setLineDash([]);
              // Gestank + Fliegen
              for (let i = 0; i < 3; i++) { const yy = (time * 22 + i * 26) % 80; c.strokeStyle = `rgba(170,220,80,${.4 * (1 - yy / 80)})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * (.3 + i * .2), y - yy); c.bezierCurveTo(x + w * (.2 + i * .2), y - yy - 10, x + w * (.4 + i * .2), y - yy - 20, x + w * (.3 + i * .2), y - yy - 30); c.stroke(); }
              flies.forEach(f => { const fx = x + w * (.5 + Math.cos(f.a) * .7), fy = y - 20 + Math.sin(f.a * 1.7) * 30; fly(c, fx, fy, time + f.t); });
              D.text(c, choke > 0 ? 'HUST!' : `Smoothie ${Math.round(level * 100)} %`, A.x + A.w / 2, A.y + 14, 15, choke > 0 ? '#ff6b4a' : '#fff');
            },
            pointer(t, xx, yy, id) { if (t === 'down') { o._hold = true; o._id = id; ttip = clamp((xx - g.x) / g.w, .08, .92); } else if (t === 'move' && o._hold && o._id === id) ttip = clamp((xx - g.x) / g.w, .08, .92); else if (t === 'up' && o._id === id) o._hold = false; },
            bot() {
              let bestX = tip, bestS = -1; for (let k = 0; k <= 16; k++) { const xx = .1 + k * .05; let s = 9; chunks.forEach(ch => { s = Math.min(s, Math.hypot(ch.x - xx, (ch.y - .97) * .8)); }); s -= Math.abs(xx - tip) * .15; if (s > bestS) { bestS = s; bestX = xx; } }
              let nearest = 9; chunks.forEach(ch => { nearest = Math.min(nearest, Math.hypot(ch.x - tip, (ch.y - .97) * .9)); });
              const mv = clamp((bestX - ttip) * 6, -1, 1);
              return { move: { x: Math.abs(bestX - ttip) > .02 ? mv : 0, y: 0 }, hold: nearest > .13 && choke <= 0 ? { act: true } : {} };
            }
          };
          return o;
        },
        // 5) Schleimnudeln aufwickeln (Kreisbewegung)
        nudeln() {
          const need = ctx.short ? 2 : 3, turns = 2.5 + d;
          let wound = 0, n = 0, ang = 0, lastA = null, w = 0, slip = 0, cx = 0, cy = 0, pr = 100, lift = 0, keyW = 0;
          const wMin = 2.2, wMax = 11 - d * 3;
          const o = {
            name: 'Schleimnudeln mit Glupschi-Soße', sub: 'Glasnudeln in Apfel-Gelee, Augen aus Zuckerguss', how: 'Kreise um die Gabel ziehen (oder A/D im Wechsel) – nicht zu schnell, sonst rutscht’s! Dann Leertaste/Tippen = essen.',
            resize() { cx = A.x + A.w / 2; cy = A.y + A.h * .6; pr = Math.min(A.w * .42, A.h * .42); },
            prog: () => (n + Math.min(1, wound / (turns * TAU))) / need,
            update(dt, act) {
              if (lift > 0) { lift -= dt; if (lift <= 0) { n++; wound = 0; swallow(.1 + d * .05, ['Schlürf! Glitschig!', 'Die Augen kleben am Gaumen!', 'Nudeln mit Gesicht …'][n % 3]); setMood('gag', .8); if (n >= need) return 'win'; } return null; }
              // Tastatur: A/D halten dreht (beschleunigt), Joystick: Winkel des Steuerknüppels
              const m = I.move; let dA = 0;
              if (act) {
                if (Math.hypot(m.x, m.y) > .6 && (Math.abs(m.x) < .9 || Math.abs(m.y) > .1) && !o._ptr) { const a = Math.atan2(-m.y, m.x); if (o._ka != null) { let da = a - o._ka; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; dA += Math.abs(da); } o._ka = a; } else o._ka = null;
                if (Math.abs(m.x) > .5 && Math.abs(m.y) < .3 && !o._ptr) { keyW = Math.min(16, keyW + dt * 9); dA += keyW * dt; } else keyW = Math.max(0, keyW - dt * 20);
                dA += o._pa || 0;
              }
              o._pa = 0; const wNow = dA / Math.max(dt, 1e-4); w = lerp(w, wNow, .15); ang += dA;
              if (w > wMax) { slip += dt; wound = Math.max(0, wound - dt * 4); if (slip > .15 && !o._sm) { say('Zu schnell – alles rutscht ab!', 1); S.bad(); o._sm = true; } } else { slip = 0; o._sm = false; if (w > wMin) wound += dA; }
              if (wound >= turns * TAU) { wound = turns * TAU; if (I.pressed('jump') || I.pressed('act') || o._eat) { lift = .7; o._eat = false; mouthOpen = 1; } }
              o._eat = false; addGag(dA * .003);
              mouthOpen = lerp(mouthOpen, lift > 0 ? 1 : 0, .2);
              return null;
            },
            draw(c) {
              plate(c, cx, cy, pr * 1.15, pr * .62);
              const full = wound / (turns * TAU);
              // Nudelhaufen
              const left = 1 - (n + full * .6) / need; c.lineCap = 'round';
              for (let i = 0; i < 26 * Math.max(.2, left); i++) { const a0 = i * 2.39, r0 = pr * .7 * Math.sqrt((i % 13) / 13), x0 = cx + Math.cos(a0) * r0, y0 = cy + Math.sin(a0) * r0 * .5; c.strokeStyle = i % 2 ? 'rgba(190,255,150,.85)' : 'rgba(150,230,110,.85)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + Math.sin(i + time) * 30 * sc, y0 - 20 * sc, cx + Math.cos(i) * 20 * sc, cy - 10 * sc, cx + Math.cos(a0 + ang) * 6 * sc, cy - 12 * sc); c.stroke(); }
              // Soße mit Glupschaugen
              for (let i = 0; i < 5; i++) { const a = i * 1.3 + 1, x = cx + Math.cos(a) * pr * .45, y = cy + Math.sin(a) * pr * .24; c.fillStyle = 'rgba(160,60,140,.55)'; c.beginPath(); c.ellipse(x, y, 16 * sc, 9 * sc, 0, 0, TAU); c.fill(); googly(c, x, y - 3 * sc, 6 * sc, time + i); }
              // Gabel mit Wickel
              const ly = lift > 0 ? (1 - lift / .7) : 0, fx = lerp(cx, M.x, ly), fy = lerp(cy - 14 * sc, M.y, ly);
              c.save(); c.translate(fx, fy); c.strokeStyle = '#c9d0d6'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -90 * sc); c.stroke();
              if (full > 0) { const R = 8 * sc + full * 16 * sc; c.fillStyle = 'rgba(170,240,130,.95)'; c.beginPath(); c.ellipse(0, -6 * sc, R, R * .7, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(90,160,60,.8)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(0, -6 * sc, R * (1 - k * .2), R * .7 * (1 - k * .2), ang * .3, 0, Math.PI * 1.6); c.stroke(); } }
              c.restore();
              // Drehanzeige
              const gr = pr * .95; c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 8; c.beginPath(); c.ellipse(cx, cy, gr, gr * .55, 0, 0, TAU); c.stroke();
              c.strokeStyle = w > wMax ? '#ff6b4a' : w > wMin ? '#9dff5c' : '#ffcf4a'; c.beginPath(); c.ellipse(cx, cy, gr, gr * .55, 0, -Math.PI / 2, -Math.PI / 2 + TAU * full); c.stroke();
              const mx = cx + Math.cos(ang) * gr, my = cy + Math.sin(ang) * gr * .55; c.fillStyle = '#fff'; c.beginPath(); c.arc(mx, my, 9, 0, TAU); c.fill();
              const sl = clamp(w / (wMax * 1.3), 0, 1), bw = Math.min(200, A.w * .5), bx = A.x + A.w / 2 - bw / 2, by = A.y + 30; c.fillStyle = 'rgba(0,0,0,.5)'; D.rr(c, bx, by, bw, 10, 5); c.fill(); c.fillStyle = 'rgba(157,255,92,.35)'; c.fillRect(bx + bw * wMin / (wMax * 1.3), by, bw * (wMax - wMin) / (wMax * 1.3), 10); c.fillStyle = w > wMax ? '#ff6b4a' : '#fff'; c.beginPath(); c.arc(bx + bw * sl, by + 5, 7, 0, TAU); c.fill();
              D.text(c, full >= 1 && lift <= 0 ? '✔ Aufgewickelt! Leertaste / Tippen = essen' : `Gabel ${n + 1} / ${need}`, A.x + A.w / 2, A.y + 14, 15, full >= 1 ? '#9dff5c' : '#fff');
            },
            pointer(t, x, y, id) {
              if (t === 'down') { o._ptr = true; o._pid = id; lastA = Math.atan2((y - cy) / .55, x - cx); if (wound >= turns * TAU) o._eat = true; }
              else if (t === 'move' && o._ptr && o._pid === id) { const a = Math.atan2((y - cy) / .55, x - cx); if (lastA != null) { let da = a - lastA; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; if (Math.hypot(x - cx, y - cy) > 20) o._pa = (o._pa || 0) + Math.abs(da); } lastA = a; }
              else if (t === 'up' && o._pid === id) { o._ptr = false; lastA = null; }
            },
            bot(dt) {
              if (lift > 0) return {};
              if (wound >= turns * TAU) { o._ba = null; return { pointer: [['up', cx, cy, 5], ['down', cx, cy, 5], ['up', cx, cy, 5]] }; }
              const rr2 = pr * .8; if (o._ba == null || !o._ptr) { o._ba = 0; return { pointer: [['down', cx + rr2, cy, 5]] }; }
              o._ba += (wMin + wMax) * .5 * dt; return { pointer: [['move', cx + Math.cos(o._ba) * rr2, cy + Math.sin(o._ba) * rr2 * .55, 5]] };
            }
          };
          return o;
        }
      };
      // ---------- Ablauf
      function nextCourse() {
        ci++; if (ci >= nCourse) { end(); return; }
        C = COURSES[menu[ci]](); if (C.resize) C.resize(); phase = 'intro'; phT = 1.8; cloche = 0; cDur = Math.round((ctx.short ? 13 : 25 - d * 4) * (menu[ci] === 'krokant' && !ctx.short ? 1.15 : 1));
        cTime = cDur; ctx.hud.part(`Gang ${ci + 1} / ${nCourse}`); ctx.hud.hint(C.how); S.reveal();
      }
      function courseDone(ok, why) {
        if (ok) { won++; stars++; ctx.hud.stars(stars); ctx.hud.toast('★ Gang geschafft!', 'good'); setMood('happy', 1.6); }
        else { ctx.hud.toast(why === 'gag' ? '🤢 Würgeanfall! Gang verloren' : '⏰ Zu langsam – Teller wird abgeräumt', 'bad'); setMood(why === 'gag' ? 'gag' : 'sad', 1.6); }
        lastTimeout = !ok && why === 'time'; phase = 'between'; phT = 1.5;
      }
      function end() {
        if (over) return; over = true; let b = 0; if (bonus && attacks === 0 && peak < .85 && won >= nCourse - 1) { b = bonus; ctx.hud.toast('★ Bonus: eiserner Magen!', 'good'); }
        stars += b; ctx.hud.stars(stars); ctx.finish(stars, won === 0 && lastTimeout ? 'time' : lastTimeout && won < nCourse / 2 ? 'time' : 'done');
      }
      layout(); nextCourse();
      return {
        resize() { layout(); },
        pointer(type, x, y, id) { if (btn.pointer(type, x, y, id)) return; if (C && phase === 'eat' && !btn.down('alt') && C.pointer) C.pointer(type, x, y, id); },
        idle(dt) { time += dt; },
        update(dt) {
          time += dt; relT += dt; if (relT > .5) { relT = 0; if (Math.abs(hudBottom() - topY) > 3) layout(); }
          moodT -= dt; if (moodT <= 0) mood = gag > .72 ? 'gag' : gag > .5 ? 'scared' : 'n';
          chewT = Math.max(0, chewT - dt); bubbleT = Math.max(0, bubbleT - dt); shake = Math.max(0, shake - dt);
          parts.forEach(p => { p.t += dt; p.vy += 400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }); parts = parts.filter(p => p.t < p.life);
          flies.forEach(f => { f.a += dt * (2 + Math.sin(time + f.t)); });
          if (over) return;
          ctx.hud.meter('gag', Math.min(1, gag), breathing ? '😮‍💨 Durchatmen …' : gag > .75 ? '⚠ Würgreiz' : 'Würgreiz', gag > .75 ? '#ff6b4a' : gag > .5 ? '#ffcf4a' : '#9dff5c');
          if (phase === 'intro') { phT -= dt; cloche = clamp(1 - (phT - .3) / 1.2, 0, 1); ctx.hud.time(cTime, 1); if (phT <= 0) { phase = 'eat'; say(['Na dann … guten Appetit?', 'Das riecht … interessant.', 'Mama, hol mich hier raus!', 'Ich schaff das!', 'Ist das … Pudding?'][ci % 5], 1.6); } return; }
          if (phase === 'between') { phT -= dt; if (phT <= 0) nextCourse(); return; }
          if (phase === 'gagging') { phT -= dt; shake = .2; if (phT <= 0) { gag = .45; courseDone(false, 'gag'); } return; }
          // Essen
          cTime -= dt; ctx.hud.time(cTime, cTime / cDur);
          breathing = btn.down('alt');
          if (breathing) { gag = Math.max(0, gag - dt * .32); mouthOpen = lerp(mouthOpen, .3, .1); if (Math.random() < dt * 2) say('Hhhh … ffffff …', .6); }
          else addGag(dt * (.005 + d * .007));
          const r = C.update(dt, !breathing);
          ctx.hud.meter('prog', C.prog(), 'Gang', '#37d6e8');
          if (r === 'win') { courseDone(true); return; }
          if (gag >= 1) { attacks++; phase = 'gagging'; phT = 1.4; setMood('gag', 2); S.gag(); say('WÜÜÜRG!', 1.4); return; }
          if (cTime <= 0) { courseDone(false, 'time'); return; }
        },
        draw(c) {
          c.drawImage(bg, 0, 0, W, H);
          // Kandidat
          const sx = shake > 0 ? Math.sin(time * 60) * 4 : 0, im = imgs[mood] || imgs.n;
          c.save(); c.translate(sx, Math.sin(time * 2) * 1.5);
          const glow = c.createRadialGradient(M.x, F.y + F.s * .5, 10, M.x, F.y + F.s * .5, F.s * .8); glow.addColorStop(0, 'rgba(255,240,200,.18)'); glow.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = glow; c.fillRect(F.x - F.s * .3, F.y - 10, F.s * 1.6, F.s * 1.3);
          if (im && im.complete && im.naturalWidth) c.drawImage(im, F.x, F.y, F.s, F.s * 1.1); else { c.fillStyle = who.skin; c.beginPath(); c.arc(M.x, F.y + F.s * .45, F.s * .3, 0, TAU); c.fill(); }
          // Mund (offen/kauend) über dem Avatar
          const mo = Math.max(mouthOpen, chewT > 0 ? Math.abs(Math.sin(chewT * 14)) * .7 : 0);
          if (mo > .08 && mood !== 'gag') { const mw = F.s * .1, mh = F.s * .085 * mo; c.fillStyle = who.skin; c.beginPath(); c.ellipse(M.x, M.y + F.s * .015, F.s * .1, F.s * .055, 0, 0, TAU); c.fill(); c.fillStyle = '#5a1a1a'; c.beginPath(); c.ellipse(M.x, M.y + F.s * .02, mw, Math.max(1.5, mh), 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.fillRect(M.x - mw * .6, M.y + F.s * .02 - Math.max(1.5, mh) + .5, mw * 1.2, Math.min(3, mh * .35)); if (mo > .5) { c.fillStyle = '#d0505a'; c.beginPath(); c.ellipse(M.x, M.y + F.s * .02 + mh * .5, mw * .55, mh * .35, 0, 0, TAU); c.fill(); } }
          if (gag > .6) { c.globalAlpha = (gag - .6) * 1.2; c.fillStyle = '#8fd14f'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(F.x + F.s * (.2 + i * .3), F.y + F.s * .2 + Math.sin(time * 3 + i) * 4, 3, 0, TAU); c.fill(); } c.globalAlpha = 1; }
          if (breathing) { c.strokeStyle = 'rgba(180,230,255,.7)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { const k = (time * .8 + i / 3) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.arc(M.x + 10 + k * 40, M.y - k * 10, 6 + k * 14, -1, 1); c.stroke(); } c.globalAlpha = 1; }
          c.restore();
          // Sprechblase
          if (bubbleT > 0 && bubble) { c.save(); c.globalAlpha = Math.min(1, bubbleT * 3); c.font = `800 13px Inter,system-ui,sans-serif`; const tw = Math.min(c.measureText(bubble).width + 20, W * .6); let bx = land ? F.x + F.s * .7 : M.x + F.s * .35, by = F.y + 8; if (bx + tw > W - 6) bx = W - 6 - tw; c.fillStyle = '#fff'; D.rr(c, bx, by, tw, 28, 12); c.fill(); c.beginPath(); c.moveTo(bx + 14, by + 26); c.lineTo(bx + 4, by + 38); c.lineTo(bx + 26, by + 26); c.fill(); D.text(c, bubble, bx + tw / 2, by + 14, 13, '#1a1a1a'); c.restore(); }
          // Gang
          if (C) {
            if (phase === 'intro' || phase === 'eat' || phase === 'gagging' || phase === 'between') { c.save(); if (phase === 'between') c.globalAlpha = clamp(phT / 1.2, 0, 1); C.draw(c); c.restore(); }
            if (phase === 'intro') { // Glocke hebt sich
              const cx = A.x + A.w / 2, cy = A.y + A.h * .6, r = Math.min(A.w, A.h) * .38, up = cloche * A.h * .9;
              c.save(); c.globalAlpha = 1 - clamp((cloche - .7) / .3, 0, 1); c.translate(cx, cy - up); const cg = c.createLinearGradient(-r, -r, r, 0); cg.addColorStop(0, '#ffffff'); cg.addColorStop(.5, '#c9d2da'); cg.addColorStop(1, '#7d8994'); c.fillStyle = cg; c.beginPath(); c.ellipse(0, 0, r, r * .8, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#9aa6b0'; c.fillRect(-r, -2, r * 2, 6); c.beginPath(); c.arc(0, -r * .8, 8, 0, TAU); c.fill(); c.restore();
              c.save(); c.fillStyle = 'rgba(0,0,0,.6)'; D.rr(c, A.x + 8, A.y + 6, A.w - 16, 50, 14); c.fill(); D.text(c, `Gang ${ci + 1}: ${C.name}`, A.x + A.w / 2, A.y + 22, Math.min(18, A.w / 18), '#ffe27a', 'center', 900); D.text(c, `(${C.sub})`, A.x + A.w / 2, A.y + 42, Math.min(12, A.w / 28), '#cfe8d0', 'center', 700); c.restore();
            }
            if (phase === 'gagging') { D.text(c, 'WÜRG!', A.x + A.w / 2, A.y + A.h * .45, 46, '#8fd14f', 'center', 900); }
          }
          parts.forEach(p => { c.globalAlpha = 1 - p.t / p.life; c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); }); c.globalAlpha = 1;
          if (breathing && phase === 'eat') { c.fillStyle = 'rgba(10,40,60,.35)'; c.fillRect(A.x, A.y, A.w, A.h); D.text(c, 'Tief durchatmen … (Zeit läuft!)', A.x + A.w / 2, A.y + A.h * .5, 16, '#cfefff'); }
          btn.draw(c);
        },
        debug: () => ({ ci, course: menu[ci], phase, gag: +gag.toFixed(2), won, stars, attacks, prog: C ? +C.prog().toFixed(2) : 0, cd: C && C.dbg ? C.dbg() : null, cTime: +cTime.toFixed(1) }),
        details: () => ({ gaenge: won, wuergeanfaelle: attacks, maxWuergreiz: Math.round(peak * 100) }),
        bot(dt) {
          if (over || !C || phase !== 'eat') return {};
          return (gag > .7 || (breathing && gag > .3)) ? { hold: { alt: true } } : (C.bot(dt) || {});
        }
      };
    }
  });
  // ---------- Zeichenhelfer
  function plate(c, x, y, rx, ry) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 6, y + 8, rx, ry, 0, 0, TAU); c.fill(); const g = c.createRadialGradient(x - rx * .3, y - ry * .4, 4, x, y, rx); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c4ccd4'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(90,110,130,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, rx * .78, ry * .76, 0, 0, TAU); c.stroke(); c.strokeStyle = '#2a9d8f'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, rx * .95, ry * .94, 0, 0, TAU); c.stroke(); }
  function beetle(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = '#6a3a10'; c.lineWidth = Math.max(1.5, s * .12); c.lineCap = 'round'; for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * s * .4, i * s * .35); c.lineTo(sd * s * .95, i * s * .5 + s * .1); c.stroke(); } const g = c.createLinearGradient(-s * .6, 0, s * .6, 0); g.addColorStop(0, '#8a4e18'); g.addColorStop(.5, '#d99a4a'); g.addColorStop(1, '#8a4e18'); c.fillStyle = g; c.beginPath(); c.ellipse(0, s * .1, s * .55, s * .75, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,40,10,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -s * .55); c.lineTo(0, s * .85); c.stroke(); c.fillStyle = '#5a3010'; c.beginPath(); c.arc(0, -s * .7, s * .28, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-s * .2, -s * .1, s * .1, s * .3, 0, 0, TAU); c.fill(); c.restore(); }
  function eyeball(c, x, y, r, lx, ly, closed, col, t) {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + 3, y + r * .7, r, r * .45, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#f0e6e6'); g.addColorStop(1, '#d4b4b4'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(220,60,60,.5)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95); c.quadraticCurveTo(x + Math.cos(a + .3) * r * .7, y + Math.sin(a + .3) * r * .7, x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55); c.stroke(); }
    if (closed) { c.fillStyle = '#c99'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#633'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - r * .7, y); c.quadraticCurveTo(x, y + r * .4, x + r * .7, y); c.stroke(); return; }
    const L = Math.hypot(lx, ly) || 1, px = x + lx / L * r * .42, py = y + ly / L * r * .42; c.fillStyle = col; c.beginPath(); c.arc(px, py, r * .45, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(px, py, r * .22, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(px - r * .12, py - r * .12, r * .08, 0, TAU); c.fill();
  }
  function googly(c, x, y, r, t) { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + Math.cos(t * 3) * r * .4, y + Math.abs(Math.sin(t * 3)) * r * .4, r * .5, 0, TAU); c.fill(); }
  function fly(c, x, y, t) { c.fillStyle = '#111'; c.beginPath(); c.ellipse(x, y, 3.5, 2.5, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(220,240,255,.7)'; const f = Math.sin(t * 60) * 2; c.beginPath(); c.ellipse(x - 2, y - 3 - f * .3, 3, 1.6, -.5, 0, TAU); c.ellipse(x + 2, y - 3 - f * .3, 3, 1.6, .5, 0, TAU); c.fill(); }
})();
