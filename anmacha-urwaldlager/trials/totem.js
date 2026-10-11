/* Prüfung: Der Totem-Turm (2D) – Holzblöcke hängen an einem schwingenden Lianen-Kran; Laufkatze & Seillänge steuern, loslassen, stabil stapeln.
   Vereinfachte Starrkörper-Statik: Schwerpunkt aller Blöcke über jeder Auflagefläche muss innerhalb der Auflage liegen (plus Wind & Nachschwingen). */
(function () {
  'use strict';
  const T = UTrials, D = T.draw, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  function hudBottom() { const el = document.getElementById('thud'); if (!el) return 92; const r = el.getBoundingClientRect(); return clamp(r.bottom + 6, 56, 170); }
  const G = 9.8, PED = 1.6; // halbe Sockelbreite
  // Blockformen: w Breite unten, h Höhe, tw Breite oben (Auflage), to Versatz oben, co Schwerpunktversatz, m Masse-Faktor
  const SHAPES = {
    quader: { n: 'Quader', w: 1.4, h: .7, tw: 1.4, to: 0, co: 0 },
    balken: { n: 'Balken', w: 2.1, h: .42, tw: 2.1, to: 0, co: 0 },
    keil: { n: 'Keil', w: 1.5, h: .72, tw: .8, to: 0, co: 0 },
    schief: { n: 'Schräg-Keil', w: 1.4, h: .75, tw: .7, to: -.35, co: -.2 },
    maske: { n: 'Maske', w: 1.05, h: 1.1, tw: 1.05, to: 0, co: .16 },
    kugel: { n: 'Kugelkopf', w: .95, h: .95, tw: .4, to: 0, co: 0 }
  };
  const COLS = [['#b0703a', '#7a4620'], ['#c98a4a', '#8a5426'], ['#9a5a2e', '#5e3416'], ['#d39a5a', '#93602e']];
  const PAINT = ['#e8463a', '#2a9d8f', '#ffcf4a', '#3a86e8', '#ff8a2a'];

  T.def({
    id: 'totem', name: 'Der Totem-Turm', kind: 'Geschick', stat: 'kopf', e: '🗿', mode: '2d',
    desc: 'Bau den höchsten Totem-Turm des Dschungels! Die geschnitzten Holzblöcke hängen an einem schwingenden Lianen-Kran. Fahr die Laufkatze, stell die Seillänge ein und lass im richtigen Moment los. Schwerpunkt beachten: Masken sind kopflastig, Keile haben wenig Auflage – und der Wind wackelt mit. Eine Höhenmarke zählt erst, wenn der Turm stehen bleibt.',
    how: { pc: '<b>A/D</b> bzw. <b>←/→</b> = Laufkatze fahren · <b>W/S</b> bzw. <b>↑/↓</b> = Seil kürzer/länger · <b>Leertaste</b> = Block loslassen · (oder Maus: ziehen = steuern, Klick = loslassen)', touch: '<b>Ziehen</b> = Kran steuern (links/rechts fahren, hoch/runter Seil) · <b>Tippen</b> oder Taste <b>Los!</b> = Block loslassen' },
    controls: false,
    create(ctx) {
      const I = ctx.I, d = ctx.diff, S = ctx.S;
      let sd = Math.floor(Math.random() * 1e9) + 1; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const nMarks = ctx.max, step = ctx.short ? .95 + d * .2 : 1.0 + d * .3, marks = []; for (let i = 0; i < nMarks; i++) marks.push({ h: step * (i + 1), got: false });
      const limit = ctx.short ? 44 - d * 4 : 105 - d * 15;
      // Blockfolge: erst einfache, dann gemischt
      const bag = []; function nextShape() { if (!bag.length) { const pool = ['quader', 'quader', 'balken', 'keil', 'maske', 'schief']; if (d > .4) pool.push('maske', 'schief'); if (d > .6) pool.push('kugel'); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; } bag.push(...pool); } return bag.shift(); }
      function mkBlock(kind) { const s = SHAPES[kind], flip = (kind === 'maske' || kind === 'schief') && rnd() < .5 ? -1 : 1; return { kind, w: s.w, h: s.h, tw: s.tw, to: s.to * flip, co: s.co * flip, m: s.w * s.h * (kind === 'maske' ? 1.3 : 1), flip, col: COLS[Math.floor(rnd() * COLS.length)], paint: PAINT[Math.floor(rnd() * PAINT.length)], face: Math.floor(rnd() * 3), x: 0, y: 0, rot: 0 }; }
      const stack = [], debris = []; let cur = mkBlock('quader'), nextB = mkBlock(nextShape()), fallB = null;
      // Kran
      const K = { tx: -1.5, tv: 0, l: 1.6, phi: 0, om: 0, beam: 4.2, cool: 0 };
      let sway = 0, swayV = 0, wind = 0, windT = 2.5, windTarget = 0, time = 0, over = false, got = 0, collapse = null, stableT = 0, maxH = 0, drops = 0, lost = 0, msgT = 0, relT = 0, towerH = 0, camY = 3.5;
      // ---- Statik
      function topOf(i) { const b = stack[i]; return b.y + b.h; }
      function supportOf(i) { const b = stack[i]; if (i === 0) return [Math.max(b.x - b.w / 2, -PED), Math.min(b.x + b.w / 2, PED)]; const u = stack[i - 1], c = u.x + u.to; return [Math.max(b.x - b.w / 2, c - u.tw / 2), Math.min(b.x + b.w / 2, c + u.tw / 2)]; }
      // liefert {k, dir, margin} – k = niedrigste instabile Fuge (oder -1)
      function analyse(st, sw, wd) {
        let worst = 1, k = -1, dir = 0;
        for (let i = 0; i < st.length; i++) {
          let M = 0, X = 0, Hc = 0; const base = st[i].y; for (let j = i; j < st.length; j++) { const b = st[j]; M += b.m; X += b.m * (b.x + b.co); Hc += b.m * (b.y + b.h / 2 - base); }
          X /= M; Hc /= M; X += (sw * 1.0 + wd * .012) * Hc;
          const sup = i === 0 ? [Math.max(st[0].x - st[0].w / 2, -PED), Math.min(st[0].x + st[0].w / 2, PED)] : (() => { const u = st[i - 1], c = u.x + u.to, b = st[i]; return [Math.max(b.x - b.w / 2, c - u.tw / 2), Math.min(b.x + b.w / 2, c + u.tw / 2)]; })();
          if (sup[1] - sup[0] < .04) { return { k: i, dir: st[i].x > (i ? st[i - 1].x : 0) ? 1 : -1, margin: -1 }; }
          const half = (sup[1] - sup[0]) / 2, mid = (sup[0] + sup[1]) / 2, mg = 1 - Math.abs(X - mid) / half;
          if (mg < 0 && k < 0) { k = i; dir = Math.sign(X - mid) || 1; }
          worst = Math.min(worst, mg);
        }
        return { k, dir, margin: worst };
      }
      function height() { return stack.length ? topOf(stack.length - 1) : 0; }
      // ---- Darstellung
      let W = ctx.W, H = ctx.H, topY = 92, ppm = 40, bg = null, portrait = false, viewH = 9;
      const relBtn = { x: 0, y: 0, r: 42, held: false };
      function layout() {
        W = ctx.W; H = ctx.H; topY = hudBottom(); portrait = H > W * 1.05;
        viewH = portrait ? 11.5 : 7.4; ppm = Math.min((H - topY - 8) / viewH, W / (portrait ? 7.4 : 9));
        relBtn.r = 42; relBtn.x = W - 16 - 42; relBtn.y = H - 16 - 42; bg = render();
      }
      const sx = x => W / 2 + x * ppm + (portrait ? 0 : -W * .04);
      const sy = y => topY + (H - topY) * .5 - (y - camY) * ppm;
      function render() {
        const cv = document.createElement('canvas'), dpr = Math.min(1.5, ctx.dpr || 1); cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * 1.6 * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr);
        const h = H * 1.6, g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa9e6'); g.addColorStop(.45, '#a8dcf0'); g.addColorStop(.75, '#f3e3b0'); g.addColorStop(1, '#b8d890'); c.fillStyle = g; c.fillRect(0, 0, W, h);
        let s2 = 5; const r = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 7; i++) { const cx = r() * W, cy = r() * h * .4; c.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(cx + k * 22, cy + Math.sin(k) * 6, 18 + r() * 10, 0, TAU); c.fill(); } }
        for (let layer = 0; layer < 3; layer++) { c.fillStyle = ['rgba(90,150,110,.55)', 'rgba(50,110,70,.75)', 'rgba(30,80,45,.9)'][layer]; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= W; x += 14) { const y = h * (.62 + layer * .1) - (Math.sin(x * .01 + layer * 2) * .5 + .5) * h * .06 - r() * 6; c.lineTo(x, y); } c.lineTo(W, h); c.fill(); }
        for (let i = 0; i < 9; i++) { const x = r() * W, base = h * (.8 + r() * .1), th = h * (.25 + r() * .2); c.fillStyle = '#2a4a22'; c.fillRect(x - 5, base - th, 10, th); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .45; c.strokeStyle = '#2f6a2a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, base - th); c.quadraticCurveTo(x + Math.cos(a) * 40, base - th + Math.sin(a) * 30, x + Math.cos(a) * 70, base - th + 20); c.stroke(); } }
        return { cv, h };
      }
      layout(); camY = viewH / 2 - .6;
      function hangPos() { return { x: K.tx + Math.sin(K.phi) * K.l, y: K.beam - Math.cos(K.phi) * K.l }; } // Oberkante-Mitte des Blocks
      // ---- Steuerung (Zeiger)
      const ptr = { id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0, moved: false, tx: null, ty: null };
      let relReq = false;
      const api = {
        resize() { layout(); },
        pointer(type, x, y, id) {
          if (type === 'down') { if (ctx.I.touch && Math.hypot(x - relBtn.x, y - relBtn.y) < relBtn.r + 8) { relBtn.held = true; relReq = true; return; } if (ptr.id == null) { ptr.id = id; ptr.sx = ptr.x = x; ptr.sy = ptr.y = y; ptr.t = 0; ptr.moved = false; ptr.b0 = { tx: K.tx, l: K.l }; } return; }
          if (type === 'move' && ptr.id === id) { ptr.x = x; ptr.y = y; if (Math.hypot(x - ptr.sx, y - ptr.sy) > 10) ptr.moved = true; if (ptr.moved) { ptr.tx = clamp(ptr.b0.tx + (x - ptr.sx) / ppm, -4, 4); ptr.ty = clamp(ptr.b0.l + (y - ptr.sy) / ppm, 1, 3.8); } return; }
          if (type === 'up') { relBtn.held = false; if (ptr.id === id) { if (!ptr.moved && ptr.t < .35) relReq = true; ptr.id = null; ptr.tx = ptr.ty = null; } }
        },
        update(dt) {
          relT += dt; if (relT > .5) { relT = 0; if (Math.abs(hudBottom() - topY) > 3) layout(); }
          if (ptr.id != null) ptr.t += dt;
          if (over) return;
          time += dt; const left = limit - time; ctx.hud.time(left, left / limit); if (left <= 0) { over = true; ctx.finish(got, 'time'); return; }
          // Wind
          windT -= dt; if (windT <= 0) { windT = 3 + Math.random() * 3; windTarget = Math.random() < .3 ? 0 : (Math.random() < .5 ? -1 : 1) * (.5 + Math.random()) * (.5 + d * 1.6); }
          wind += (windTarget - wind) * Math.min(1, dt); ctx.hud.meter('wind', Math.min(1, Math.abs(wind) / 2.5), wind > .3 ? 'Wind →' : wind < -.3 ? '← Wind' : 'Wind', Math.abs(wind) > 1.5 ? '#ff6b4a' : '#37d6e8');
          // Kran: Ziel-Höhe des Balkens folgt dem Turm
          const H0 = height(); K.beam = lerp(K.beam, Math.max(4.4, H0 + 3.6), Math.min(1, dt * 1.5));
          let ax = 0; const mv = I.move;
          let want = mv.x * 2.6; if (ptr.tx != null) want = clamp((ptr.tx - K.tx) * 4, -2.8, 2.8);
          const acc = clamp((want - K.tv) * 6, -7, 7); K.tv += acc * dt; K.tx += K.tv * dt; if (K.tx < -4 || K.tx > 4) { K.tx = clamp(K.tx, -4, 4); K.tv = 0; } ax = acc;
          if (ptr.ty != null) K.l += clamp((ptr.ty - K.l) * 5, -2, 2) * dt; else K.l -= mv.y * 1.6 * dt; K.l = clamp(K.l, 1, Math.min(3.8, K.beam - H0 - (cur ? cur.h : 0) - .15));
          const phiA = (-G * Math.sin(K.phi) - ax * Math.cos(K.phi) + wind * .35 * Math.cos(K.phi)) / K.l - .28 * K.om; K.om += phiA * dt; K.phi += K.om * dt;
          K.cool = Math.max(0, K.cool - dt);
          if (cur) { const hp = hangPos(); cur.x = hp.x; cur.y = hp.y - cur.h; cur.rot = K.phi; }
          const rel = I.pressed('jump') || I.pressed('act') || relReq; relReq = false;
          if (rel && cur && !fallB && !collapse && K.cool <= 0) { const hp = hangPos(); fallB = cur; fallB.vx = K.tv + K.om * K.l * Math.cos(K.phi); fallB.vy = K.om * K.l * Math.sin(K.phi); fallB.rot = 0; cur = null; drops++; S.click(); }
          // fallender Block
          if (fallB) {
            const b = fallB, py = b.y; b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.pow(.9, dt);
            const n = stack.length, surf = n ? topOf(n - 1) : 0;
            let lo, hi; if (n) { const u = stack[n - 1], c = u.x + u.to; lo = c - u.tw / 2; hi = c + u.tw / 2; } else { lo = -PED; hi = PED; }
            const ov = Math.min(b.x + b.w / 2, hi) - Math.max(b.x - b.w / 2, lo);
            if (b.y <= surf && py >= surf - .02 && ov > .03) {
              b.y = surf; b.x += b.vx * .08; const imp = Math.abs(b.vy); swayV += b.vx * .05 + (b.x - (n ? stack[n - 1].x : 0)) * .01 * imp; b.vx = b.vy = 0; stack.push(b); fallB = null; S.thud(); stableT = 0;
              const a = analyse(stack, sway, 0); if (a.k >= 0) startCollapse(a.k, a.dir);
              spawn();
            } else if (b.y < surf - 2.5 || b.y < -1) { debris.push(Object.assign(b, { om: (Math.random() - .5) * 4, life: 2 })); fallB = null; lost++; S.bad(); ctx.hud.toast('Daneben! Der Block kullert weg.', 'bad'); spawn(); }
          }
          // Nachschwingen & Wind am Turm
          const hgt = height(); swayV += (-sway * 14 - swayV * 2.2 + wind * .0025 * hgt) * dt; sway += swayV * dt;
          if (!collapse && stack.length) { const a = analyse(stack, sway, wind); if (a.k >= 0) startCollapse(a.k, a.dir); }
          // Einsturz-Animation
          if (collapse) { collapse.t += dt; collapse.ang = collapse.dir * collapse.t * collapse.t * 2.2; if (Math.abs(collapse.ang) > .6) { const fallen = stack.splice(collapse.k); fallen.forEach((b, i) => { const cx = collapse.px, cy = collapse.py, rx = b.x - cx, ry = b.y + b.h / 2 - cy, ca = Math.cos(-collapse.ang), sa = Math.sin(-collapse.ang); b.x = cx + rx * ca - ry * sa; b.y = cy + rx * sa + ry * ca - b.h / 2; b.rot = -collapse.ang; b.vx = collapse.dir * (1.5 + i * .5 + Math.random()); b.vy = 1 + Math.random(); b.om = -collapse.dir * (1.5 + Math.random() * 2); b.life = 2.4; debris.push(b); }); collapse = null; sway = swayV = 0; S.bad(); ctx.hud.toast('💥 Der Turm kippt!', 'bad'); } }
          debris.forEach(b => { b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += (b.om || 0) * dt; if (b.y < -.6 && b.vy < 0) { b.y = -.6; b.vy *= -.3; b.vx *= .6; b.om *= .5; } b.life -= dt; });
          for (let i = debris.length - 1; i >= 0; i--) if (debris[i].life <= 0) debris.splice(i, 1);
          // Höhe zählt nur stabil
          towerH = height(); if (!collapse && !fallB && Math.abs(swayV) < .05) stableT += dt; else if (collapse) stableT = 0;
          if (stableT > 1.1) { marks.forEach(m => { if (!m.got && towerH >= m.h - .02) { m.got = true; got++; ctx.hud.stars(got); ctx.hud.toast(`★ ${m.h.toFixed(1)} m – steht!`, 'good'); } }); maxH = Math.max(maxH, towerH); if (got >= nMarks) { over = true; ctx.finish(got, 'done'); return; } }
          camY = lerp(camY, Math.max(viewH / 2 - .6, towerH + (portrait ? .5 : 1.6) - viewH * .18), Math.min(1, dt * 1.5));
          const a = stack.length ? analyse(stack, sway, wind) : { margin: 1 };
          ctx.hud.meter('stab', clamp(a.margin, 0, 1), a.margin < .25 ? '⚠ Wackelig!' : 'Stabilität', a.margin < .25 ? '#ff6b4a' : a.margin < .5 ? '#ffcf4a' : '#9dff5c');
        },
        draw(c) {
          const t = time; c.drawImage(bg.cv, 0, 0, bg.cv.width, bg.cv.height, 0, -(bg.h - H) + clamp((camY - 4) * ppm * .25, 0, bg.h - H), W, bg.h);
          // Boden
          const gy = sy(0); c.fillStyle = '#4a7a2a'; c.fillRect(0, gy + 8, W, H - gy); c.fillStyle = '#3a6a22'; for (let x = 0; x < W; x += 12) { c.beginPath(); c.moveTo(x, gy + 10); c.lineTo(x + 4, gy - 2 - (x * 7 % 9)); c.lineTo(x + 8, gy + 10); c.fill(); }
          // Sockel
          const p0 = sx(-PED - .1), p1 = sx(PED + .1); const pg = c.createLinearGradient(p0, 0, p1, 0); pg.addColorStop(0, '#7a7a74'); pg.addColorStop(.5, '#b4b2a8'); pg.addColorStop(1, '#6a6a64'); c.fillStyle = pg; c.fillRect(p0, gy, p1 - p0, ppm * .6 + 10); c.fillStyle = '#5a5a54'; c.fillRect(p0 - 6, gy + ppm * .6, p1 - p0 + 12, 12); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(p0 + (p1 - p0) * k / 4, gy + 4); c.lineTo(p0 + (p1 - p0) * k / 4, gy + ppm * .55); c.stroke(); }
          // Höhenmarken
          marks.forEach((m, i) => { const y = sy(m.h); if (y < topY - 10 || y > H + 10) return; c.strokeStyle = m.got ? 'rgba(255,207,74,.9)' : 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(sx(-2.6), y); c.lineTo(sx(2.6), y); c.stroke(); c.setLineDash([]); c.save(); if (!m.got) c.globalAlpha = .6; D.star(c, sx(2.95), y, Math.max(9, ppm * .28), m.got ? 0 : Math.sin(t * 2 + i) * .2); c.restore(); D.text(c, m.h.toFixed(1) + ' m', sx(-3.05), y, Math.max(10, ppm * .26), m.got ? '#ffe27a' : '#fff'); });
          // Kran-Gerüst (links) + Balken
          const by = sy(K.beam); const fx = sx(-4.6); c.strokeStyle = '#6a4a26'; c.lineWidth = Math.max(5, ppm * .18); c.lineCap = 'round'; c.beginPath(); c.moveTo(fx - ppm * .5, gy); c.lineTo(fx, by); c.lineTo(fx + ppm * .5, gy); c.moveTo(fx - ppm * .3, (gy + by) / 2); c.lineTo(fx + ppm * .3, (gy + by) / 2); c.stroke();
          const bg2 = c.createLinearGradient(0, by - 8, 0, by + 8); bg2.addColorStop(0, '#9a6a3a'); bg2.addColorStop(1, '#5a3a1a'); c.fillStyle = bg2; D.rr(c, fx - 8, by - 7, sx(4.4) - fx + 16, 14, 6); c.fill(); for (let x = fx; x < sx(4.4); x += 26) { c.fillStyle = '#3f8f35'; c.beginPath(); c.ellipse(x, by - 6, 8, 4, .4, 0, TAU); c.fill(); }
          monkey(c, fx, by - 6, ppm, t, K.tv);
          // Laufkatze + Liane
          const tx = sx(K.tx); c.fillStyle = '#3a2a1a'; D.rr(c, tx - 14, by - 4, 28, 14, 4); c.fill(); c.fillStyle = '#888'; c.beginPath(); c.arc(tx - 8, by - 5, 4, 0, TAU); c.arc(tx + 8, by - 5, 4, 0, TAU); c.fill();
          const hp = hangPos(); c.strokeStyle = '#4f8a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, by + 8); c.lineTo(sx(hp.x), sy(hp.y)); c.stroke();
          // Lot-Linie (Zielhilfe)
          if (cur) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([4, 6]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx(cur.x), sy(cur.y)); c.lineTo(sx(cur.x), sy(height())); c.stroke(); c.setLineDash([]); }
          // Turm (bei Einsturz Teil um Kippkante gedreht)
          stack.forEach((b, i) => { if (collapse && i >= collapse.k) { c.save(); c.translate(sx(collapse.px), sy(collapse.py)); c.rotate(collapse.ang); c.translate(-sx(collapse.px), -sy(collapse.py)); drawBlock(c, b, 0); c.restore(); } else drawBlock(c, b, wobbleFor(i)); });
          if (cur) drawBlock(c, cur, cur.rot, true);
          if (fallB) drawBlock(c, fallB, 0);
          debris.forEach(b => { c.save(); c.globalAlpha = clamp(b.life, 0, 1); drawBlock(c, b, b.rot || 0); c.restore(); });
          // Vorschau
          const pw = 74, ph = 62, px = 10, py = H - ph - 10; c.fillStyle = 'rgba(0,0,0,.45)'; D.rr(c, px, py, pw, ph, 12); c.fill(); D.text(c, 'Nächster', px + pw / 2, py + 10, 11, '#cfe8d0'); const sc2 = 26 / Math.max(nextB.w, nextB.h); c.save(); c.translate(px + pw / 2, py + ph * .62); c.scale(sc2 / ppm, sc2 / ppm); c.translate(-sx(0), -sy(nextB.h / 2)); drawBlock(c, Object.assign({}, nextB, { x: 0, y: 0 }), 0); c.restore();
          // Wind-Blätter
          if (Math.abs(wind) > .3) for (let i = 0; i < 8; i++) { const x = ((i * 137 + t * wind * 120) % (W + 40) + W + 40) % (W + 40) - 20, y = topY + 30 + ((i * 89) % Math.max(1, H - topY - 60)) + Math.sin(t * 3 + i) * 10; c.fillStyle = 'rgba(80,160,60,.8)'; c.beginPath(); c.ellipse(x, y, 7, 3, t * 4 + i, 0, TAU); c.fill(); }
          if (ctx.I.touch) { c.save(); c.fillStyle = relBtn.held ? 'rgba(255,207,74,.9)' : 'rgba(46,168,77,.75)'; c.beginPath(); c.arc(relBtn.x, relBtn.y, relBtn.r, 0, TAU); c.fill(); c.strokeStyle = '#eaffd0'; c.lineWidth = 2; c.stroke(); D.text(c, 'Los!', relBtn.x, relBtn.y, 15, '#fff'); c.restore(); }
          if (stack.length && towerH > 0) D.text(c, `Turm: ${towerH.toFixed(1)} m`, sx(0), Math.min(H - 14, gy + ppm * .6 + 26), 13, '#fff');
        },
        debug: () => ({ n: stack.length, h: +towerH.toFixed(2), got, tx: +K.tx.toFixed(2), l: +K.l.toFixed(2), phi: +K.phi.toFixed(3), drops, lost, collapse: !!collapse, sway: +sway.toFixed(3), time: +time.toFixed(1) }),
        details: () => ({ bloecke: drops, daneben: lost, maxHoehe: +maxH.toFixed(1) }),
        bot() {
          if (over || !cur || fallB || collapse) return {};
          // beste Ablageposition: größte Stabilitätsreserve (ohne Wind)
          if (bt.for !== cur) {
            const n = stack.length; let best = 0, bm = -9; const lo = n ? stack[n - 1].x + stack[n - 1].to - 1 : -1.2, hi = lo + 2.4;
            for (let k = 0; k <= 48; k++) { const x = lerp(lo, hi, k / 48); const b = Object.assign({}, cur, { x, y: n ? topOf(n - 1) : 0 }); const a = analyse(stack.concat([b]), 0, 0); const m = a.k >= 0 ? -1 : a.margin - Math.abs(x) * .02; if (m > bm) { bm = m; best = x; } }
            bt.for = cur; bt.x = best; bt.t = 0;
          }
          bt.t += 1 / 60;
          const H0 = height(), wantL = clamp(K.beam - H0 - cur.h - .45, 1, 3.8), hp = hangPos();
          // Laufkatze: zum Ziel + Pendel dämpfen
          const ex = bt.x - K.tx, mx = clamp(ex * 1.6 - K.tv * .7 - K.om * K.l * .9 + K.phi * 1.5, -1, 1);
          const my = clamp((K.l - wantL) * 2, -1, 1);
          const ok = Math.abs(hp.x + cur.co * 0 - bt.x) < .05 && Math.abs(K.tv) < .12 && Math.abs(K.om) < .08 && Math.abs(K.l - wantL) < .25 && Math.abs(wind) < 1.6;
          return ok ? { press: ['jump'] } : { move: { x: Math.abs(mx) < .04 ? 0 : mx, y: Math.abs(my) < .05 ? 0 : my } };
        }
      };
      const bt = { for: null, x: 0, t: 0 };
      function spawn() { cur = nextB; nextB = mkBlock(nextShape()); K.phi = 0; K.om = 0; K.cool = .5; K.l = Math.min(K.l, 1.6); }
      function startCollapse(k, dir) { const sup = supportOf(k); collapse = { k, dir, t: 0, ang: 0, px: dir > 0 ? sup[1] : sup[0], py: stack[k].y }; stableT = 0; S.thud(); }
      function wobbleFor(i) { if (!stack.length) return 0; return -sway * .4 * (i + 1) / stack.length; }
      function drawBlock(c, b, rot, hanging) {
        const x = sx(b.x), y = sy(b.y), w = b.w * ppm, h = b.h * ppm;
        c.save(); if (hanging) { c.translate(x, sy(b.y + b.h)); c.rotate(-rot); c.translate(0, h); } else { c.translate(x, y - h / 2); c.rotate(-rot); c.translate(0, h / 2); }
        // lokale Koordinaten: (0,0) = Mitte unten, y nach oben = negativ
                const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, b.col[1]); g.addColorStop(.45, b.col[0]); g.addColorStop(1, b.col[1]); c.fillStyle = g;
        const tw = b.tw * ppm, to = b.to * ppm; c.beginPath();
        if (b.kind === 'kugel') { c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.lineTo(w / 2, -h * .45); c.arc(0, -h * .45, w / 2, 0, Math.PI, true); c.closePath(); }
        else { c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.lineTo(to + tw / 2, -h); c.lineTo(to - tw / 2, -h); c.closePath(); }
        c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowOffsetX = 4; c.shadowOffsetY = 4; c.fill(); c.restore(); c.strokeStyle = 'rgba(50,25,10,.6)'; c.lineWidth = 1.5; c.stroke();
        // Maserung
        c.save(); c.clip(); c.strokeStyle = 'rgba(60,30,10,.18)'; c.lineWidth = 1; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(-w / 2, -h * k / 5); c.bezierCurveTo(-w / 4, -h * k / 5 - 3, w / 4, -h * k / 5 + 3, w / 2, -h * k / 5); c.stroke(); }
        c.fillStyle = b.paint; c.globalAlpha = .85; c.fillRect(-w / 2, -h * .18, w, h * .08); c.globalAlpha = 1; c.restore();
        // Gesicht
        const fs = Math.min(w, h) * .5, fy = b.kind === 'kugel' ? -h * .5 : -h * .55;
        if (b.kind === 'maske' || b.kind === 'kugel' || b.face === 0) {
          const fl = b.flip || 1; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-fs * .35 + fl * fs * .08, fy, fs * .2, fs * .26, 0, 0, TAU); c.ellipse(fs * .35 + fl * fs * .08, fy, fs * .2, fs * .26, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(-fs * .35 + fl * fs * .14, fy + 1, fs * .1, 0, TAU); c.arc(fs * .35 + fl * fs * .14, fy + 1, fs * .1, 0, TAU); c.fill();
          c.fillStyle = '#5a1a10'; c.beginPath(); c.ellipse(fl * fs * .08, fy + fs * .5, fs * .32, fs * .14, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.fillRect(fl * fs * .08 - fs * .25, fy + fs * .42, fs * .5, fs * .06);
          if (b.kind === 'maske') { c.fillStyle = b.col[1]; c.beginPath(); c.moveTo(fl * fs * .1, fy - fs * .1); c.lineTo(fl * fs * .75, fy + fs * .25); c.lineTo(fl * fs * .1, fy + fs * .3); c.fill(); c.strokeStyle = b.paint; c.lineWidth = 3; c.beginPath(); c.moveTo(-w * .4, -h * .9); c.lineTo(w * .4, -h * .9); c.stroke(); }
        } else if (b.face === 1) { c.strokeStyle = 'rgba(40,20,5,.7)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-fs * .5, fy - fs * .1); c.lineTo(-fs * .15, fy + fs * .1); c.moveTo(fs * .5, fy - fs * .1); c.lineTo(fs * .15, fy + fs * .1); c.stroke(); c.fillStyle = b.paint; c.beginPath(); c.arc(0, fy + fs * .35, fs * .12, 0, TAU); c.fill(); }
        else { c.fillStyle = b.paint; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(k * fs * .6, fy - fs * .25); c.lineTo(k * fs * .6 + fs * .2, fy + fs * .15); c.lineTo(k * fs * .6 - fs * .2, fy + fs * .15); c.fill(); } }
        c.restore();
      }
      ctx.hud.stars(0); ctx.hud.hint('Block über den Turm fahren, Schwingen beruhigen – dann loslassen!');
      return api;
    }
  });
  function monkey(c, x, y, ppm, t, v) { const s = ppm / 40, j = Math.abs(v) > .3 ? Math.sin(t * 14) * 3 : 0; c.save(); c.translate(x, y); c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(0, -14 * s, 9 * s, 11 * s, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -30 * s, 8 * s, 0, TAU); c.fill(); c.fillStyle = '#e8c49a'; c.beginPath(); c.ellipse(0, -28 * s, 5.5 * s, 4.5 * s, 0, 0, TAU); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(-2.5 * s, -31 * s, 1.2 * s, 0, TAU); c.arc(2.5 * s, -31 * s, 1.2 * s, 0, TAU); c.fill(); c.strokeStyle = '#7a4a22'; c.lineWidth = 3.5 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6 * s, -18 * s); c.lineTo(-14 * s, -22 * s + j); c.moveTo(6 * s, -18 * s); c.lineTo(14 * s, -22 * s - j); c.moveTo(5 * s, -4 * s); c.quadraticCurveTo(18 * s, 4 * s, 14 * s, -12 * s); c.stroke(); c.restore(); }
})();
