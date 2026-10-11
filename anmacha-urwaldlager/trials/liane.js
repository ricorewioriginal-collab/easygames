/* Prüfung: Der Lianen-Schwung (2D, Seitenansicht) – Pendelphysik mit Schwungholen, Loslassen, Greifen, Plattformen, Wind und reißende Lianen */
(function () {
  'use strict';
  const T = UTrials, D = T.draw, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  function hudBottom() { const el = document.getElementById('thud'); if (!el) return 92; const r = el.getBoundingClientRect(); return clamp(r.bottom + 6, 56, 170); }
  function mkBtns(ctx, list) {
    const P = { btns: list.map(b => Object.assign({ x: 0, y: 0, r: 34, held: false, edge: false, pid: null }, b)) };
    P.pointer = (type, x, y, id) => {
      if (type === 'down') { if (!ctx.I.touch) return false; for (const b of P.btns) if (Math.hypot(x - b.x, y - b.y) < b.r + 8) { b.held = true; b.edge = true; b.pid = id; return true; } return false; }
      if (type === 'up') { let u = false; for (const b of P.btns) if (b.pid === id) { b.held = false; b.pid = null; u = true; } return u; }
      return P.btns.some(b => b.pid === id);
    };
    P.down = id => !!P.btns.find(b => b.id === id && b.held);
    P.edge = id => { const b = P.btns.find(b => b.id === id); if (b && b.edge) { b.edge = false; return true; } return false; };
    P.draw = c => { if (!ctx.I.touch) return; P.btns.forEach(b => { c.save(); c.fillStyle = b.held ? 'rgba(255,207,74,.9)' : b.big ? 'rgba(46,168,77,.72)' : 'rgba(10,30,18,.6)'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke(); D.text(c, b.label, b.x, b.y, b.big ? 14 : 22, b.held ? '#2a1700' : '#fff', 'center', 900); c.restore(); }); };
    return P;
  }
  const G = 11, BODY = 1.55;

  T.def({
    id: 'liane', name: 'Der Lianen-Schwung', kind: 'Geschick', stat: 'mut', e: '🐒', mode: '2d',
    desc: 'Über die Brüllaffen-Schlucht geht’s nur an Lianen! Hol Schwung durch Gewichtsverlagerung, lass im richtigen Moment los und schnapp dir die nächste Liane. Sterne schweben hoch in der Luft – nur mit viel Schwung erreichbar. Vorsicht: Manche Lianen reißen, und der Wind schiebt. Unten wartet das (lauwarme) Wasser mit dem Gummi-Krokodil.',
    how: { pc: '<b>A/D</b> bzw. <b>←/→</b> = Gewicht verlagern (im Takt des Schwungs!) · <b>Leertaste</b> = loslassen / springen · Greifen geht automatisch · auf Plattformen <b>A/D</b> = laufen', touch: 'Tasten <b>◀ ▶</b> halten = Schwung holen / laufen · <b>Sprung</b> oder irgendwo tippen = loslassen / springen' },
    controls: false,
    create(ctx) {
      const I = ctx.I, d = ctx.diff, S = ctx.S, who = Object.assign({ skin: '#e8b98f', hair: '#3b2a1c', top: '#2a9d8f' }, ctx.who || {});
      let sd = Math.floor(Math.random() * 1e9) + 1; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      // ---- Strecke erzeugen
      const nL = ctx.short ? 6 : 11, platEvery = ctx.short ? 3 : 4;
      const lianas = [], plats = [], stars = [];
      plats.push({ x0: -8, x1: 0, y: 4, bank: true });
      let x = 2.3;
      for (let i = 0; i < nL; i++) {
        const ay = 11 + rnd() * .5, bot = 6.1 + rnd() * .5, kind = i > 0 && rnd() < .12 + d * .28 ? 'tear' : i > 1 && rnd() < .25 ? 'wobble' : 'ok';
        lianas.push({ x, ay, L: ay - bot, kind, phi: 0, om: 0, held: 0, torn: false, wob: rnd() * TAU, i });
        if ((i + 1) % platEvery === 0 && i < nL - 1) { const pw = 2.4 - d * .5, px0 = x + 2.6 + d * .6; plats.push({ x0: px0, x1: px0 + pw, y: 3.7 + rnd() * .6 }); x = px0 + pw + 1.6 + rnd() * .4; }
        else x += 3.3 + d * .9 + rnd() * .5;
      }
      const endX = x - 1.2; plats.push({ x0: endX, x1: endX + 10, y: 4, bank: true, end: true });
      const finalStar = { x: endX + 2.2, y: 5.4, got: false, final: true };
      // ---- Spielfigur
      const P = { st: 'stand', x: -1.2, y: 4 + BODY + .15, vx: 0, vy: 0, li: -1, r: 0, th: 0, om: 0, face: 1, plat: 0, leg: 0, legV: 0, relT: 0, lastLi: -1, walkPh: 0 };
      let check = 0, falls = 0, time = 0, over = false, wind = 0, windT = 3, windTarget = 0, splash = null, gotN = 0, msg = '', msgT = 0, camX = 0, camY = 5.5, tearWarn = 0;
      const limit = ctx.short ? 46 - d * 6 : 95 - d * 15;
      const leaves = []; for (let i = 0; i < 18; i++) leaves.push({ x: rnd(), y: rnd(), r: rnd() * TAU, s: .6 + rnd() * .8 });
      const birds = []; for (let i = 0; i < 3; i++) birds.push({ x: rnd() * 60, y: 9 + rnd() * 3, t: rnd() * 5, c: ['#ff4f4f', '#37d6e8', '#ffcf4a'][i] });
      // ---- Physik
      function anchor(l, t) { return l.kind === 'wobble' ? { x: l.x + Math.sin(t * 1.7 + l.wob) * .45, y: l.ay + Math.sin(t * 2.3 + l.wob) * .15 } : { x: l.x, y: l.ay }; }
      function ropeBottom(l, t) { const a = anchor(l, t); return { x: a.x + Math.sin(l.phi) * l.L, y: a.y - Math.cos(l.phi) * l.L }; }
      function swingStep(s, dt, inX, aw) { // s: {th, om, r}
        const amp = Math.abs(s.th), damp = .1 + Math.max(0, amp - 1.15) * 2.2;
        const a = -(G / s.r) * Math.sin(s.th) - damp * s.om + inX * (2.6 / Math.sqrt(s.r)) * Math.cos(s.th) + aw * Math.cos(s.th) / s.r;
        s.om += a * dt; s.th += s.om * dt; s.th = clamp(s.th, -1.55, 1.55);
      }
      function tryGrab(px, py, t, skip) {
        for (const l of lianas) {
          if (l.torn || l.i === skip) continue; const a = anchor(l, t), b = ropeBottom(l, t);
          const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy, k = clamp(((px - a.x) * vx + (py - a.y) * vy) / L2, .2, 1), cx = a.x + vx * k, cy = a.y + vy * k;
          if (Math.hypot(px - cx, py - cy) < .6) return { l, r: Math.max(l.L * .6, Math.hypot(px - a.x, py - a.y)), a };
        }
        return null;
      }
      function platAt(x, yFeet, yPrev) { for (let i = 0; i < plats.length; i++) { const p = plats[i]; if (x > p.x0 - .15 && x < p.x1 + .15 && yFeet <= p.y && yPrev >= p.y - .05) return i; } return -1; }
      function grabLiana(g) { ev('grab ' + g.l.i + ' r' + g.r.toFixed(1)); const l = g.l, a = g.a; P.st = 'swing'; P.li = l.i; P.r = Math.min(g.r, l.L); P.th = Math.atan2(P.x - a.x, a.y - P.y); const tx = Math.cos(P.th), ty = Math.sin(P.th); P.om = clamp((P.vx * tx + P.vy * ty) * .78 / P.r, -8.5 / P.r, 8.5 / P.r); l.held = 0; S.thud(); }
      // Simulation für Bot & Sternplatzierung: Flug ab Zustand → Ergebnis
      function simFlight(x0, y0, vx, vy, t0, skip, starList, wd) {
        let x = x0, y = y0, t = t0, hit = null; const dt = 1 / 60; if (wd == null) wd = wind;
        for (let k = 0; k < 200; k++) {
          const py = y; vy -= G * dt; x += vx * dt; y += vy * dt; t += dt; vx += wd * dt;
          if (starList) for (const s of starList) if (!s.got && Math.hypot(s.x - x, s.y - (y - .6)) < .8) hit = s;
          if (k > 4) { const g = tryGrab(x, y, t, skip); if (g) return { ok: 'liana', li: g.l.i, star: hit, x }; }
          const pi = platAt(x, y - BODY, py - BODY); if (pi >= 0 && vy < 0) return { ok: 'plat', pi, star: hit, x };
          if (y < 0) return { ok: null };
        }
        return { ok: null };
      }
      function relVel(s) { const tx = Math.cos(s.th), ty = Math.sin(s.th), sp = s.om * s.r; return { vx: tx * sp, vy: ty * sp + .35 }; }
      // Sterne in die Luft: auf erreichbaren Flugbahnen platzieren
      const nAir = ctx.max - 1, segs = []; for (let i = 0; i < nL - 1; i++) segs.push(i);
      const pick = []; for (let k = 0; k < nAir; k++) pick.push(segs[Math.min(segs.length - 1, Math.floor((k + .5) * segs.length / nAir))]);
      pick.forEach(i => {
        const l = lianas[i], a = { x: l.x, y: l.ay }; let best = null;
        for (let amp = .75; amp <= 1.0; amp += .05) for (let th = -.3; th <= amp; th += .05) {
          const r = l.L * .95, om = Math.sqrt(Math.max(0, 2 * G / r * (Math.cos(th) - Math.cos(amp)))); if (!om) continue;
          const s = { th, om, r }, v = relVel(s), x0 = a.x + Math.sin(th) * r, y0 = a.y - Math.cos(th) * r;
          let x1 = x0, y1 = y0, vx = v.vx, vy = v.vy, top = { x: x0, y: y0 }; let ok = false;
          for (let k = 0; k < 160; k++) { vy -= G / 60; x1 += vx / 60; y1 += vy / 60; if (y1 > top.y) top = { x: x1, y: y1 }; if (k > 12) { const g = tryGrab(x1, y1, 0, i); if (g && g.l.i === i + 1) { ok = true; break; } if (g) break; } if (y1 < 0) break; }
          if (ok && (!best || top.y > best.y) && top.y < 10.4) best = { x: top.x, y: top.y - .6 };
        }
        if (best) stars.push({ x: best.x, y: best.y - .25 * (1 - d), got: false, seg: i });
        else { const n2 = lianas[i + 1]; stars.push({ x: (l.x + n2.x) / 2, y: 7.6, got: false, seg: i }); }
      });
      function respawn() { const p = plats[check]; P.st = 'stand'; P.plat = check; P.x = p.bank && !p.end ? p.x1 - .8 : (p.x0 + p.x1) / 2; P.y = p.y + BODY + .15; P.vx = P.vy = 0; P.li = -1; lianas.forEach(l => { if (l.kind === 'tear' && l.torn) { l.torn = false; l.held = 0; l.phi = 0; } }); }
      // ---- Darstellung
      let W = ctx.W, H = ctx.H, topY = 92, ppm = 30, far = null, mid = null, relT = 0;
      const btn = mkBtns(ctx, [{ id: 'l', label: '◀' }, { id: 'r', label: '▶' }, { id: 'j', label: 'Sprung', big: true }]);
      function layout() {
        W = ctx.W; H = ctx.H; topY = hudBottom(); const portrait = H > W;
        ppm = portrait ? Math.min(W / 11, (H - topY) / 13) : Math.min(W / 13, (H - topY + 30) / 11.6);
        const b = btn.btns; b[0].r = b[1].r = 32; b[2].r = 42; b[0].x = 16 + 32; b[1].x = 16 + 32 * 3 + 14; b[0].y = b[1].y = H - 16 - 32; b[2].x = W - 16 - 42; b[2].y = H - 16 - 42;
        far = strip('far'); mid = strip('mid');
      }
      function strip(kind) {
        const w = Math.ceil(Math.max(W, 600)), h = Math.ceil(H), cv = document.createElement('canvas'), dpr = Math.min(1.5, ctx.dpr || 1); cv.width = w * dpr; cv.height = h * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr);
        let s2 = kind === 'far' ? 11 : 23; const r = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        if (kind === 'far') {
          const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffb36b'); g.addColorStop(.45, '#f7d78f'); g.addColorStop(.75, '#9fd0b0'); g.addColorStop(1, '#4a8a6a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
          c.fillStyle = 'rgba(255,240,200,.75)'; c.beginPath(); c.arc(w * .7, h * .3, Math.min(w, h) * .09, 0, TAU); c.fill();
          for (let layer = 0; layer < 2; layer++) { c.fillStyle = layer ? 'rgba(70,120,95,.75)' : 'rgba(120,160,140,.6)'; c.beginPath(); c.moveTo(0, h); const base = h * (.55 + layer * .1); for (let xx = 0; xx <= w; xx += 20) { const yy = base - (Math.sin(xx / w * TAU * 2 + layer) * .5 + .5) * h * .12 - (Math.sin(xx / w * TAU * 5 + layer * 2) * .5 + .5) * h * .05; c.lineTo(xx, yy); } c.lineTo(w, h); c.fill(); }
        } else {
          for (let i = 0; i < 26; i++) { const xx = (i / 26) * w + r() * 30, hh = h * (.35 + r() * .3), tw = 10 + r() * 14; c.fillStyle = 'rgba(30,70,45,.85)'; c.fillRect(xx, h - hh, tw, hh); for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(${30 + k * 8},${80 + k * 10},${50 + k * 5},.9)`; c.beginPath(); c.arc(xx + tw / 2 + (r() - .5) * 50, h - hh + (r() - .5) * 30, 26 + r() * 22, 0, TAU); c.fill(); } }
          // Kacheln nahtlos: Ränder spiegeln nicht nötig, leichte Ungleichheit fällt kaum auf
        }
        return { cv, w, h };
      }
      const wx = x => (x - camX) * ppm + W / 2;
      // y-Bildschirm: Mitte des freien Bereichs ↔ camY
      const sy = y => topY + (H - topY) / 2 - (y - camY) * ppm;
      layout(); respawn(); camX = P.x + 3; ctx.hud.stars(0);
      function feetY() { return P.y - BODY; }
      // ---- Update
      const evlog = []; function ev(t) { evlog.push(time.toFixed(1) + ' ' + t); if (evlog.length > 12) evlog.shift(); }
      function release() { ev('rel li' + P.li + ' th' + P.th.toFixed(2) + ' om' + P.om.toFixed(2)); const s = { th: P.th, om: P.om, r: P.r }, v = relVel(s); P.st = 'fly'; P.vx = v.vx; P.vy = v.vy; P.lastLi = P.li; P.relT = 0; P.li = -1; S.click(); }
      function fall(why) { ev('fall x' + P.x.toFixed(1) + ' ' + (why || '')); P.st = 'fall'; falls++; time += 3; splash = { x: P.x, t: 0 }; S.splash(); S.bad(); ctx.hud.toast('💦 Platsch! ' + (why || '') + ' −3 s', 'bad'); setTimeout(() => { }, 0); P.fallT = 1.3; }
      const api = {
        resize() { layout(); },
        pointer(type, x, y, id) { if (btn.pointer(type, x, y, id)) return; if (type === 'down') api._tap = true; },
        update(dt) {
          relT += dt; if (relT > .5) { relT = 0; if (Math.abs(hudBottom() - topY) > 3) layout(); }
          if (over) return;
          time += dt; const left = limit - time; ctx.hud.time(left, left / limit); if (left <= 0) { over = true; ctx.finish(gotN, 'time'); return; }
          // Wind
          windT -= dt; if (windT <= 0) { windT = 3 + Math.random() * 3; windTarget = (Math.random() < .5 ? -1 : 1) * (Math.random() < .35 ? 0 : (.6 + Math.random() * 1.4) * (.4 + d * 1.2)); if (Math.abs(windTarget) > 1) ctx.hud.toast(windTarget > 0 ? '💨 Rückenwind →' : '💨 ← Gegenwind', ''); }
          wind += (windTarget - wind) * Math.min(1, dt * 1.2);
          ctx.hud.meter('wind', Math.min(1, Math.abs(wind) / 2.2), wind > .2 ? 'Wind →' : wind < -.2 ? '← Wind' : 'Wind', Math.abs(wind) > 1.3 ? '#ff6b4a' : '#37d6e8');
          const inX = clamp(I.move.x + (btn.down('r') ? 1 : 0) - (btn.down('l') ? 1 : 0), -1, 1);
          const jump = I.pressed('jump') || I.pressed('act') || btn.edge('j') || api._tap; api._tap = false;
          // freie Lianen pendeln leicht
          lianas.forEach(l => { if (l.i === P.li) return; const a = -(G / l.L) * Math.sin(l.phi) - 1.8 * l.om + wind * .25 / l.L; l.om += a * dt; l.phi += l.om * dt; });
          if (P.st === 'swing') {
            const l = lianas[P.li]; if (P.r < l.L * .95) { const nr = Math.min(l.L * .95, P.r + dt * 3.5); P.om *= (P.r / nr) * (P.r / nr); P.r = nr; } const s = { th: P.th, om: P.om, r: P.r }; swingStep(s, dt, inX, wind); P.th = s.th; P.om = s.om; l.phi = P.th; l.om = P.om;
            const a = anchor(l, time); P.x = a.x + Math.sin(P.th) * P.r; P.y = a.y - Math.cos(P.th) * P.r; P.face = P.om >= 0 ? 1 : -1;
            P.legV += (-(P.om) * 1.2 - P.leg) * dt * 10; P.leg += P.legV * dt; P.legV *= .9;
            if (l.kind === 'tear') { l.held += dt; const tl = 3.2 - d * 1.2; tearWarn = l.held / tl; if (l.held > tl) { l.torn = true; ctx.hud.toast('😱 Die Liane reißt!', 'bad'); S.bad(); const v = relVel(s); P.st = 'fly'; P.vx = v.vx; P.vy = v.vy - .4; P.lastLi = l.i; P.relT = 0; P.li = -1; } }
            else tearWarn = 0;
            if (P.st === 'swing' && jump) release();
          } else if (P.st === 'fly') {
            P.relT += dt; const py = feetY(); P.vy -= G * dt; P.vx += wind * dt; P.x += P.vx * dt; P.y += P.vy * dt; P.leg = lerp(P.leg, -P.vx * .1, .1); P.face = P.vx >= 0 ? 1 : -1;
            const g = P.relT > .08 ? tryGrab(P.x, P.y, time, P.lastLi) : null; if (g) grabLiana(g);
            else { const pi = platAt(P.x, feetY(), py); if (pi >= 0 && P.vy < 0) { P.st = 'stand'; P.plat = pi; P.y = plats[pi].y + BODY; P.vx *= .3; S.thud(); if (pi > check) { check = pi; if (!plats[pi].end) ctx.hud.toast('🌴 Verschnaufpause – Checkpoint!', 'good'); } } }
            // Plattform-Seiten
            for (const p of plats) if (P.st === 'fly' && P.x > p.x0 - .2 && P.x < p.x1 + .2 && feetY() < p.y - .1 && feetY() > p.y - 6) { P.x = P.vx > 0 ? p.x0 - .21 : p.x1 + .21; P.vx *= -.2; }
            if (feetY() < .3) fall();
          } else if (P.st === 'stand') {
            const p = plats[P.plat]; P.vx = lerp(P.vx, inX * 3.2, Math.min(1, dt * 10)); P.x += P.vx * dt; if (Math.abs(P.vx) > .2) { P.face = Math.sign(P.vx); P.walkPh += dt * 10; }
            P.y = p.y + BODY; if (P.x > p.x1 + .1 || P.x < p.x0 - .1) { P.st = 'fly'; P.vy = 0; P.relT = 1; }
            if (p.end) { if (!finalStar.got && P.x > p.x0 + .4) { finalStar.got = true; gotN++; ctx.hud.stars(gotN); over = true; S.win(); ctx.hud.toast('🏆 Anderes Ufer erreicht!', 'good'); ctx.finish(gotN, 'done'); return; } }
            else if (jump) { P.st = 'fly'; P.vx = P.face * 5 + P.vx * .2; P.vy = 6.6; P.relT = 0; P.lastLi = -1; S.click(); }
          } else if (P.st === 'fall') { P.fallT -= dt; P.y -= dt * 3; if (P.fallT <= 0) respawn(); }
          // Sterne
          if (P.st !== 'fall') stars.forEach(s => { if (!s.got && Math.hypot(s.x - P.x, s.y - (P.y - .6)) < .8) { s.got = true; gotN++; ctx.hud.stars(gotN); ctx.hud.toast('★ Luftstern!', 'good'); } });
          // Kamera
          const look = P.st === 'stand' ? 2.5 : P.vx > 0 || P.om > 0 ? 3 : 2; camX = lerp(camX, P.x + look * (H > W ? .5 : 1), Math.min(1, dt * 2.5)); camX = clamp(camX, -2, endX + 4);
          const portrait = H > W; camY = lerp(camY, portrait ? clamp(P.y - 1, 5, 7) : 5.6, Math.min(1, dt * 2));
          if (splash) { splash.t += dt; if (splash.t > 1.2) splash = null; }
          birds.forEach(b => { b.t += dt; b.x += dt * 2.2; if (b.x > camX + 30) b.x = camX - 30; });
        },
        draw(c) {
          const t = time;
          // Parallax-Hintergrund
          const fx = -((camX * ppm * .15) % far.w); c.drawImage(far.cv, fx, 0, far.w, far.h); c.drawImage(far.cv, fx + far.w, 0, far.w, far.h);
          const mx = -((camX * ppm * .45) % mid.w); const my = sy(0) - mid.h + 10; c.globalAlpha = .45; c.drawImage(mid.cv, mx, my, mid.w, mid.h); c.drawImage(mid.cv, mx + mid.w, my, mid.w, mid.h); c.globalAlpha = 1;
          // Vögel
          birds.forEach(b => { const bx = wx(b.x) * .7 + W * .15, by = sy(b.y); c.fillStyle = b.c; c.beginPath(); c.ellipse(bx, by, 7, 4, 0, 0, TAU); c.fill(); const f = Math.sin(b.t * 12) * 6; c.beginPath(); c.moveTo(bx - 2, by); c.lineTo(bx - 8, by - 6 - f); c.lineTo(bx + 3, by - 1); c.fill(); });
          // Schlucht-Tiefe
          const wyT = sy(.4); const dg = c.createLinearGradient(0, sy(4), 0, wyT); dg.addColorStop(0, 'rgba(30,60,40,0)'); dg.addColorStop(1, 'rgba(10,30,25,.6)'); c.fillStyle = dg; c.fillRect(0, sy(4), W, wyT - sy(4));
          // Wasser
          const wg = c.createLinearGradient(0, wyT, 0, H); wg.addColorStop(0, '#3fb0b8'); wg.addColorStop(1, '#0d4a5a'); c.fillStyle = wg; c.beginPath(); c.moveTo(0, H); for (let xx = 0; xx <= W + 10; xx += 10) c.lineTo(xx, wyT + Math.sin(xx * .03 + t * 2) * 3); c.lineTo(W, H); c.fill();
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const xx = ((k * 157 - camX * ppm * .9) % (W + 100) + W + 100) % (W + 100) - 50; c.beginPath(); c.moveTo(xx, wyT + 8 + k % 3 * 6); c.lineTo(xx + 30, wyT + 8 + k % 3 * 6); c.stroke(); }
          // Gummi-Krokodil
          { const kx = wx(camX + Math.sin(t * .2) * 6), ky = wyT + 4 + Math.sin(t * 1.5) * 2; c.fillStyle = '#4caf50'; c.beginPath(); c.ellipse(kx, ky, 34, 8, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#3d8b40'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(kx - 22 + k * 10, ky - 6); c.lineTo(kx - 18 + k * 10, ky - 12); c.lineTo(kx - 14 + k * 10, ky - 6); c.fill(); } c.fillStyle = '#fff'; c.beginPath(); c.arc(kx + 24, ky - 7, 4, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(kx + 25, ky - 7, 2, 0, TAU); c.fill(); }
          if (splash) { const k = splash.t / 1.2, sx2 = wx(splash.x); c.fillStyle = `rgba(220,250,255,${1 - k})`; for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; c.beginPath(); c.arc(sx2 + Math.cos(a) * k * 50, wyT - Math.abs(Math.sin(a)) * k * 60 + k * k * 60, 4, 0, TAU); c.fill(); } }
          // Plattformen / Ufer
          plats.forEach(p => { const x0 = wx(p.x0), x1 = wx(p.x1), y0 = sy(p.y); if (x1 < -20 || x0 > W + 20) return;
            const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#6b5038'); g.addColorStop(.5, '#8a6a48'); g.addColorStop(1, '#5a4030'); c.fillStyle = g;
            if (p.bank) { c.fillRect(x0, y0, x1 - x0, H - y0); c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 8; k++) c.fillRect(x0 + ((k * 37) % Math.max(1, x1 - x0)), y0 + 20 + k * 25, 30, 6); }
            else { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - (x1 - x0) * .2, H); c.lineTo(x0 + (x1 - x0) * .2, H); c.closePath(); c.fill(); }
            c.fillStyle = '#3f9a3a'; D.rr(c, x0 - 4, y0 - 6, x1 - x0 + 8, 12, 6); c.fill(); c.fillStyle = '#5cc24f'; for (let xx = x0; xx < x1; xx += 9) { c.beginPath(); c.moveTo(xx, y0 - 4); c.lineTo(xx + 3, y0 - 12 - (xx % 5)); c.lineTo(xx + 6, y0 - 4); c.fill(); }
            if (p.end) { const fx2 = wx(p.x0 + 3.6), fy2 = y0; c.strokeStyle = '#5a3a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx2, fy2); c.lineTo(fx2, fy2 - 3 * ppm); c.stroke(); c.fillStyle = '#ff4fa0'; c.beginPath(); c.moveTo(fx2, fy2 - 3 * ppm); c.lineTo(fx2 + 1.4 * ppm, fy2 - 2.6 * ppm); c.lineTo(fx2, fy2 - 2.2 * ppm); c.fill(); D.text(c, 'ZIEL', fx2 + .55 * ppm, fy2 - 2.6 * ppm, Math.max(10, ppm * .32), '#fff');
              monkey(c, wx(p.x0 + 5.5), y0, ppm, t); }
          });
          // Äste oben + Lianen
          lianas.forEach(l => { const a = anchor(l, t), ax = wx(a.x), ay = sy(a.y); if (ax < -4 * ppm || ax > W + 4 * ppm) return;
            c.strokeStyle = '#4a3220'; c.lineWidth = Math.max(6, ppm * .35); c.lineCap = 'round'; c.beginPath(); c.moveTo(ax - 2 * ppm, ay - .4 * ppm); c.quadraticCurveTo(ax, ay + .2 * ppm, ax + 2 * ppm, ay - .5 * ppm); c.stroke();
            for (let k = -2; k <= 2; k++) { c.fillStyle = k % 2 ? '#2f7d3a' : '#3c9a45'; c.beginPath(); c.ellipse(ax + k * .8 * ppm, ay - .6 * ppm, .9 * ppm, .5 * ppm, k * .3, 0, TAU); c.fill(); }
            if (l.torn) { c.strokeStyle = '#6a5a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + Math.sin(t * 2) * 4, ay + .8 * ppm); c.stroke(); return; }
            const len = l.i === P.li ? P.r : l.L, ang = l.i === P.li ? P.th : l.phi, bx = ax + Math.sin(ang) * len * ppm, by = ay + Math.cos(ang) * len * ppm;
            const tear = l.kind === 'tear', warnA = l.i === P.li && tear ? tearWarn : 0;
            c.strokeStyle = tear ? (warnA > .6 && Math.sin(t * 30) > 0 ? '#d04a2a' : '#9a7a3a') : '#4f8a2a'; c.lineWidth = Math.max(2.5, ppm * (tear ? .09 : .12)); c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo((ax + bx) / 2 - Math.cos(ang) * ppm * .3, (ay + by) / 2 + Math.sin(ang) * ppm * .1, bx, by); c.stroke();
            for (let k = 1; k < 7; k++) { const f = k / 7, lx = lerp(ax, bx, f), ly = lerp(ay, by, f); c.fillStyle = tear ? '#b09a50' : (k % 2 ? '#5cc24f' : '#3f9a3a'); c.beginPath(); c.ellipse(lx + (k % 2 ? 5 : -5), ly, ppm * .16, ppm * .08, k % 2 ? .6 : -.6, 0, TAU); c.fill(); }
            if (tear) { c.fillStyle = '#ffcf4a'; D.text(c, '⚠', ax + ppm * .35, ay + ppm * .6, Math.max(10, ppm * .35), '#ffcf4a'); }
            if (l.kind === 'wobble') { c.fillStyle = 'rgba(255,255,255,.5)'; D.text(c, '〰', ax, ay - ppm * .9, Math.max(10, ppm * .3), '#fff'); }
          });
          // Sterne
          stars.concat([finalStar]).forEach((s, i) => { if (s.got) return; const x = wx(s.x), y = sy(s.y) + Math.sin(t * 3 + i) * 3; if (x < -30 || x > W + 30) return; c.save(); c.shadowColor = '#ffcf4a'; c.shadowBlur = 16; D.star(c, x, y, ppm * (s.final ? .5 : .38), Math.sin(t * 2 + i) * .3); c.restore(); });
          // Figur
          drawHero(c);
          // Wind-Blätter
          leaves.forEach(lf => { lf.x += (wind * .02 + .002) / 60 * 10; lf.y += .0015; lf.r += .05; if (lf.x > 1.1) lf.x = -.1; if (lf.x < -.1) lf.x = 1.1; if (lf.y > 1) lf.y = 0; if (Math.abs(wind) < .3 && lf.s < .9) return; const x = lf.x * W, y = topY + lf.y * (H - topY); c.save(); c.translate(x, y); c.rotate(lf.r); c.fillStyle = 'rgba(90,170,70,.75)'; c.beginPath(); c.ellipse(0, 0, 7 * lf.s, 3 * lf.s, 0, 0, TAU); c.fill(); c.restore(); });
          // Fortschritt
          const pr = clamp((P.x) / endX, 0, 1); c.fillStyle = 'rgba(0,0,0,.4)'; D.rr(c, W * .25, H - 8, W * .5, 4, 2); c.fill(); c.fillStyle = '#ffcf4a'; D.rr(c, W * .25, H - 8, W * .5 * pr, 4, 2); c.fill();
          if (P.st === 'swing' && lianas[P.li] && lianas[P.li].kind === 'tear' && tearWarn > .3) D.text(c, 'Knirsch … die Liane gibt nach!', W / 2, topY + 16, 15, '#ffcf4a');
          btn.draw(c);
        },
        debug: () => ({ st: P.st, x: +P.x.toFixed(2), y: +P.y.toFixed(2), li: P.li, th: +P.th.toFixed(2), om: +P.om.toFixed(2), got: gotN, stars: stars.length, falls, time: +time.toFixed(1), endX: +endX.toFixed(1), check, ev: evlog.join(' | ') }),
        details: () => ({ stuerze: falls }),
        bot() {
          if (over) return {};
          if (P.st === 'swing') {
            const l = lianas[P.li], s = { th: P.th, om: P.om, r: P.r }, v = relVel(s);
            const good = r => r.ok && (r.ok === 'liana' ? r.li > P.li : plats[r.pi].x0 > P.x - 1 && r.pi >= check && P.x > lianas[P.li].x - .5);
            const sim = simFlight(P.x, P.y, v.vx, v.vy, time, P.li, stars);
            const fwd = good(sim) && good(simFlight(P.x, P.y, v.vx, v.vy, time, P.li, null, wind - .6)) && good(simFlight(P.x, P.y, v.vx, v.vy, time, P.li, null, wind + .6));
            const segStar = stars.find(st => !st.got && st.seg === P.li);
            bt.on = (bt.li === P.li ? bt.on : 0) + 1 / 60; bt.li = P.li;
            const tearSoon = l.kind === 'tear' && l.held > (3.2 - d * 1.2) * .7;
            if (fwd && (sim.star || (!segStar || bt.on > 4) || tearSoon) && P.om > 0) { ev('bot ' + sim.ok + (sim.li != null ? sim.li : sim.pi) + ' w' + wind.toFixed(1)); return { press: ['jump'] }; }
            return { move: { x: Math.sign(P.om) || 1, y: 0 } };
          }
          if (P.st === 'stand') {
            const p = plats[P.plat]; if (p.end) return { move: { x: 1, y: 0 } };
            let best = null; for (let k = 0; k <= 12; k++) { const xx = lerp(p.x0 + .1, p.x1 - .1, k / 12); const r = simFlight(xx, p.y + BODY, 5.1, 6.6, time, -1, null); if (r.ok === 'liana' && lianas[r.li].x > xx) { best = xx; } }
            if (best == null) { best = p.x1 - .25; if (Math.abs(P.x - best) > .12) return { move: { x: Math.sign(best - P.x), y: 0 } }; return {}; }
            if (Math.abs(P.x - best) > .12) return { move: { x: Math.sign(best - P.x), y: 0 } };
            return Math.abs(P.vx) < .5 ? { press: ['jump'], move: { x: 1, y: 0 } } : {};
          }
          return {};
        }
      };
      const bt = { li: -1, on: 0 };
      // Spielfigur (Seitenansicht)
      function drawHero(c) {
        const hx = wx(P.x), hy = sy(P.y), s = ppm / 30;
        if (P.st === 'fall' && P.fallT < 1) return;
        c.save(); c.translate(hx, hy);
        let ang = 0; if (P.st === 'swing') ang = P.th; else if (P.st === 'fly') ang = clamp(P.vx * .05, -.4, .4);
        if (P.st === 'stand') { c.translate(0, BODY * ppm); drawStanding(c, s); c.restore(); return; }
        c.rotate(-ang * .9);
        const skin = who.skin, top = who.top, hair = who.hair, f = P.face;
        // Arme hoch zur Hand
        c.strokeStyle = skin; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5 * s, 14 * s); c.lineTo(-2 * s, 0); c.moveTo(5 * s, 14 * s); c.lineTo(2 * s, 0); c.stroke();
        c.fillStyle = skin; c.beginPath(); c.arc(0, 0, 3.6 * s, 0, TAU); c.fill();
        // Kopf
        c.fillStyle = skin; c.beginPath(); c.arc(f * 1.5 * s, 18 * s, 7.5 * s, 0, TAU); c.fill(); c.fillStyle = hair; c.beginPath(); c.arc(f * .5 * s, 16 * s, 7.8 * s, Math.PI * 1.05, Math.PI * 2.0); c.fill();
        c.fillStyle = '#222'; c.beginPath(); c.arc(f * 4.5 * s, 18 * s, 1.2 * s, 0, TAU); c.fill(); c.strokeStyle = '#6a1e1e'; c.lineWidth = 1.4 * s; c.beginPath(); c.arc(f * 4 * s, 21.5 * s, 2 * s, 0, Math.PI); c.stroke();
        // Körper
        const g = c.createLinearGradient(-7 * s, 0, 7 * s, 0); g.addColorStop(0, top); g.addColorStop(.5, '#ffffff33'); g.addColorStop(1, top); c.fillStyle = top; D.rr(c, -7 * s, 24 * s, 14 * s, 20 * s, 5 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; D.rr(c, -3 * s, 25 * s, 4 * s, 17 * s, 2 * s); c.fill();
        // Beine (Trägheit)
        c.strokeStyle = '#2c3e66'; c.lineWidth = 5.5 * s; const lg = clamp(P.leg, -1, 1); c.beginPath(); c.moveTo(-3 * s, 43 * s); c.lineTo(-3 * s + Math.sin(lg) * 13 * s, 43 * s + Math.cos(lg) * 13 * s); c.moveTo(3 * s, 43 * s); c.lineTo(3 * s + Math.sin(lg * 1.3) * 13 * s, 43 * s + Math.cos(lg * 1.3) * 13 * s); c.stroke();
        c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(-3 * s + Math.sin(lg) * 13 * s, 43 * s + Math.cos(lg) * 13 * s, 3 * s, 0, TAU); c.arc(3 * s + Math.sin(lg * 1.3) * 13 * s, 43 * s + Math.cos(lg * 1.3) * 13 * s, 3 * s, 0, TAU); c.fill();
        c.restore();
      }
      function drawStanding(c, s) {
        const skin = who.skin, top = who.top, hair = who.hair, f = P.face, w = Math.sin(P.walkPh) * (Math.abs(P.vx) > .2 ? 1 : 0);
        c.strokeStyle = '#2c3e66'; c.lineWidth = 5.5 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3 * s, -20 * s); c.lineTo(-3 * s + w * 6 * s, 0); c.moveTo(3 * s, -20 * s); c.lineTo(3 * s - w * 6 * s, 0); c.stroke();
        c.fillStyle = top; D.rr(c, -7 * s, -40 * s, 14 * s, 21 * s, 5 * s); c.fill();
        c.strokeStyle = skin; c.lineWidth = 4.5 * s; c.beginPath(); c.moveTo(-6 * s, -36 * s); c.lineTo(-8 * s - w * 4 * s, -24 * s); c.moveTo(6 * s, -36 * s); c.lineTo(8 * s + w * 4 * s, -24 * s); c.stroke();
        c.fillStyle = skin; c.beginPath(); c.arc(f * 1.5 * s, -48 * s, 7.5 * s, 0, TAU); c.fill(); c.fillStyle = hair; c.beginPath(); c.arc(f * .5 * s, -50 * s, 7.8 * s, Math.PI * 1.05, Math.PI * 2); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(f * 4.5 * s, -48 * s, 1.2 * s, 0, TAU); c.fill();
      }
      return api;
    }
  });
  function monkey(c, x, y, ppm, t) { const s = ppm / 30, j = Math.abs(Math.sin(t * 5)) * 8 * s; c.save(); c.translate(x, y - j); c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(0, -16 * s, 10 * s, 13 * s, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -34 * s, 9 * s, 0, TAU); c.fill(); c.fillStyle = '#e8c49a'; c.beginPath(); c.ellipse(0, -32 * s, 6 * s, 5 * s, 0, 0, TAU); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(-3 * s, -35 * s, 1.3 * s, 0, TAU); c.arc(3 * s, -35 * s, 1.3 * s, 0, TAU); c.fill(); c.strokeStyle = '#7a4a22'; c.lineWidth = 4 * s; c.lineCap = 'round'; const a = Math.sin(t * 10) * .5; c.beginPath(); c.moveTo(-8 * s, -22 * s); c.lineTo(-16 * s, -40 * s + a * 6 * s); c.moveTo(8 * s, -22 * s); c.lineTo(16 * s, -40 * s - a * 6 * s); c.moveTo(6 * s, -6 * s); c.quadraticCurveTo(22 * s, 0, 18 * s, -18 * s); c.stroke(); c.restore(); }
})();
