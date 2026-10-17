/* R01 Camper-Parken: Den Podcast-Camper (Fahrradmodell: Gas, Bremse, Rückwärtsgang, Lenkwinkel) ohne Rempler
   in die markierte Parklücke bringen. Profi: enge Lücke, rückwärts einparken. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const WB = 46, HL = 35, HW = 16, OFS = 23, MAXS = 0.62, FX0 = 20, FX1 = 940, FY0 = 70, FY1 = 525, Y0 = 420, R = 110, SY = 150;
  const CFG = [
    { time: 70, errs: 5, pitch: 68, spotW: 60, tolP: 14, tolA: 15, poles: 3, rev: false },
    { time: 60, errs: 3, pitch: 58, spotW: 50, tolP: 11, tolA: 10, poles: 5, rev: false },
    { time: 60, errs: 2, pitch: 52, spotW: 44, tolP: 9, tolA: 8, poles: 6, rev: true }
  ];
  const norm = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  const center = c => ({ x: c.x + Math.cos(c.h) * OFS, y: c.y + Math.sin(c.h) * OFS });
  // Trennachsen-Test: Auto (gedrehtes Rechteck) gegen achsenparalleles Rechteck {x,y,w,h} (Mitte, halbe Maße)
  function obbHitsRect(cx, cy, h, r) {
    const ax = [[1, 0], [0, 1], [Math.cos(h), Math.sin(h)], [-Math.sin(h), Math.cos(h)]];
    const cu = ax[2], cv = ax[3];
    for (const a of ax) {
      const d = Math.abs((r.x - cx) * a[0] + (r.y - cy) * a[1]);
      const ra = HL * Math.abs(cu[0] * a[0] + cu[1] * a[1]) + HW * Math.abs(cv[0] * a[0] + cv[1] * a[1]);
      const rb = r.w * Math.abs(a[0]) + r.h * Math.abs(a[1]);
      if (d > ra + rb) return false;
    }
    return true;
  }
  function poleDist(cx, cy, h, p) {
    const dx = p.x - cx, dy = p.y - cy, lx = dx * Math.cos(h) + dy * Math.sin(h), ly = -dx * Math.sin(h) + dy * Math.cos(h);
    const qx = lx - PT.clamp(lx, -HL, HL), qy = ly - PT.clamp(ly, -HW, HW);
    return Math.hypot(qx, qy);
  }
  function hits(st, rear, h) {
    const c = center({ x: rear.x, y: rear.y, h });
    for (const s of [-1, 1]) for (const t of [-1, 1]) {
      const x = c.x + Math.cos(h) * HL * s - Math.sin(h) * HW * t, y = c.y + Math.sin(h) * HL * s + Math.cos(h) * HW * t;
      if (x < FX0 || x > FX1 || y < FY0 || y > FY1) return true;
    }
    for (const p of st.poles) if (poleDist(c.x, c.y, h, p) < 9) return true;
    for (const r of st.campers) if (obbHitsRect(c.x, c.y, h, r)) return true;
    return false;
  }
  function line(pts, a, b) { const n = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 4)); for (let i = 1; i <= n; i++) pts.push({ x: PT.lerp(a.x, b.x, i / n), y: PT.lerp(a.y, b.y, i / n) }); }
  function arc(pts, cx, cy, sgn) { for (let i = 1; i <= 44; i++) { const q = i / 44 * Math.PI / 2; pts.push({ x: cx + sgn * R * Math.sin(q), y: cy + R * Math.cos(q) }); } }
  function makePaths(sx, rev) { // Pfade der Hinterachse für den Bot (und Freihaltezonen für Poller)
    const st0 = { x: 70, y: Y0 };
    if (!rev) { const p = [st0]; line(p, st0, { x: sx - R, y: Y0 }); arc(p, sx - R, Y0 - R, 1); line(p, { x: sx, y: Y0 - R }, { x: sx, y: SY + OFS }); return [{ pts: p, rev: false }]; }
    const p1 = [st0]; line(p1, st0, { x: sx + R + 50, y: Y0 });
    const p2 = [{ x: sx + R + 50, y: Y0 }]; line(p2, p2[0], { x: sx + R, y: Y0 }); arc(p2, sx + R, Y0 - R, -1); line(p2, { x: sx, y: Y0 - R }, { x: sx, y: SY - OFS });
    return [{ pts: p1, rev: false }, { pts: p2, rev: true }];
  }
  MG.define({
    id: 'R01', group: 'roadtrip', name: 'Camper-Parken', icon: '🚐',
    short: 'Park den Podcast-Camper rempelfrei in die markierte Lücke.',
    rules: [
      'Fahr den Camper in das leuchtende Parkfeld und bleib kurz stehen.',
      'Der Camper lenkt wie ein echtes Auto: Lenkeinschlag wirkt nur beim Rollen.',
      'Poller, andere Camper und der Rand kosten je einen Rempler – zu viele Rempler = verloren.',
      'Profi: Die Lücke ist eng und der Camper muss rückwärts hinein (Pfeil beachten).',
      'Läuft die Zeit ab, bevor du stehst, ist die Parkplatzsuche gescheitert.'
    ],
    goal: d => 'Park den Camper im leuchtenden Feld oben' + (CFG[d].rev ? ' – rückwärts, Nase nach unten –' : '') + ' und bleib kurz stehen: in ' + CFG[d].time + ' s, höchstens ' + CFG[d].errs + ' Rempler.',
    how: [
      'Du bist der orange Camper unten links. Das leuchtende Rechteck oben ist dein Parkfeld.',
      'Halte den Finger (oder die gedrückte Maus) dorthin, wo der Camper hinfahren soll – er lenkt von selbst. Hinter ihm = rückwärts.',
      'Tastatur: ↑ Gas, ↓ Bremse/rückwärts, ←/→ lenken (lenkt nur, wenn er rollt).',
      'Steht er im Feld (wird grün), loslassen und stillstehen, bis 100 % erreicht sind. Poller, Camper und Rand = Rempler.'
    ],
    tip: { key: '↑ Gas · ↓ rückwärts · ←/→ lenken – ab ins leuchtende Feld!', touch: 'Finger aufs Feld halten – der Camper fährt hin', y: 300 },
    controls: { key: '↑ Gas, ↓ Bremse/Rückwärts, ←/→ lenken', touch: 'Finger halten: Camper fährt dorthin (hinter den Camper tippen = rückwärts)', mouse: 'Maustaste gedrückt halten: Camper fährt zum Zeiger', pad: 'Steuerkreuz: Gas/Bremse und Lenken' },
    touch: ['left', 'right', 'up', 'down'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, errs: 0, cool: 0, park: 0,
        player: (o.players || []).length > 1 ? ((o.players[o.turn | 0] || {}).name || '') : '', car: { x: 70, y: Y0, h: 0, v: 0, s: 0 },
        keys: { up: false, down: false, left: false, right: false }, ptr: null, poles: [], campers: [], bm: { seg: 0, idx: 0 } };
      const slots = []; for (let x = 60; x <= 900; x += c.pitch) slots.push(x);
      const ok = slots.map((x, i) => i).filter(i => slots[i] >= 230 && slots[i] <= 700);
      const k = PT.pick(st, ok); st.sx = slots[k];
      slots.forEach((x, i) => { if (i !== k && (Math.abs(i - k) === 1 && d > 0 || PT.rand(st) < 0.6)) st.campers.push({ x, y: SY, w: 17, h: 36 }); });
      st.paths = makePaths(st.sx, c.rev);
      const free = (x, y, rad) => st.paths.every(sg => sg.pts.every((p, i) => {
        if (i % 2) return true; const q = sg.pts[Math.min(sg.pts.length - 1, i + 1)], pr = sg.pts[Math.max(0, i - 1)];
        let h = Math.atan2(q.y - pr.y, q.x - pr.x); if (sg.rev) h += Math.PI;
        const cc = center({ x: p.x, y: p.y, h }); return poleDist(cc.x, cc.y, h, { x, y }) > rad;
      }));
      for (let n = 0, tries = 0; n < c.poles && tries < 400; tries++) {
        const p = { x: PT.randInt(st, 60, 900), y: PT.randInt(st, 235, 505) };
        if (free(p.x, p.y, 34) && st.poles.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 50)) { st.poles.push(p); n++; }
      }
      for (let n = 0, tries = 0; n < (d ? 2 : 1) && tries < 200; tries++) { // abgestellte Camper am unteren Rand
        const r = { x: PT.randInt(st, 120, 860), y: 492, w: 36, h: 17 };
        if (free(r.x, r.y, 60) && free(r.x - 25, r.y, 50) && free(r.x + 25, r.y, 50)) { st.campers.push(r); n++; }
      }
      return st;
    },
    input(st, a) {
      if (a.type === 'key' && st.keys[a.key] !== undefined) st.keys[a.key] = !!a.down;
      if (a.type === 'pointer') st.ptr = a.phase === 'up' ? null : { x: a.x, y: a.y };
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, car = st.car, k = st.keys; st.t += dt; st.cool -= dt;
      let thr = (k.up ? 1 : 0) - (k.down ? 1 : 0), want = k.right ? MAXS : k.left ? -MAXS : 0;
      if (st.ptr) { // Zeigersteuerung: zum Finger fahren
        const cc = center(car), dx = st.ptr.x - cc.x, dy = st.ptr.y - cc.y;
        const fw = dx * Math.cos(car.h) + dy * Math.sin(car.h), sd = -dx * Math.sin(car.h) + dy * Math.cos(car.h);
        const far = Math.hypot(dx, dy) > 45;
        if (fw > -20) { want = PT.clamp(Math.atan2(sd, Math.max(fw, 1)), -MAXS, MAXS); thr = far ? (car.v < 70 ? 1 : 0) : (car.v > 2 ? -1 : 0); }
        else { want = PT.clamp(-Math.atan2(sd, -fw), -MAXS, MAXS); thr = far ? (car.v > -45 ? -1 : 0) : (car.v < -2 ? 1 : 0); }
      }
      car.s += PT.clamp(want - car.s, -3 * dt, 3 * dt);
      if (thr > 0) car.v += (car.v < 0 ? 260 : 140) * dt; else if (thr < 0) car.v -= (car.v > 0 ? 260 : 110) * dt;
      else car.v -= Math.sign(car.v) * Math.min(Math.abs(car.v), 70 * dt);
      car.v = PT.clamp(car.v, -70, 150);
      const nh = car.h + car.v / WB * Math.tan(car.s) * dt, nx = car.x + Math.cos(car.h) * car.v * dt, ny = car.y + Math.sin(car.h) * car.v * dt;
      if (hits(st, { x: nx, y: ny }, nh)) {
        car.v = -car.v * 0.3;
        if (st.cool <= 0) { st.errs++; st.cool = 0.7; MG.fx(st, 'bad'); st.fx.push({ recipe: { parts: [{ wave: 'noise', f: 300, t: 0, d: 0.18, v: 0.5, filter: { type: 'lowpass', f: 600, q: 1 } }] } }); }
      } else { car.x = nx; car.y = ny; car.h = norm(nh); }
      const cc = center(car), dp = Math.hypot(cc.x - st.sx, cc.y - SY);
      let da = norm(car.h - (c.rev ? Math.PI / 2 : -Math.PI / 2)); if (!c.rev) da = Math.min(Math.abs(da), Math.PI - Math.abs(da));
      st.inSpot = dp < c.tolP && Math.abs(da) * 180 / Math.PI < c.tolA;
      if (st.inSpot && Math.abs(car.v) < 8) { if (st.park === 0) MG.fx(st, 'tick'); st.park += dt; } else st.park = 0;
      if (st.errs > c.errs) MG.finish(st, false);
      else if (st.park >= 0.8) MG.finish(st, true);
      else if (st.t >= c.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, cc = center(st.car), dp = Math.hypot(cc.x - st.sx, cc.y - SY);
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 35 * (1 - st.t / c.time) + 15 * (1 - st.errs / (c.errs + 1)), 50, 100)), detail: 'Eingeparkt in ' + st.t.toFixed(1) + ' s mit ' + st.errs + ' Remplern.' };
      return { won: false, score: Math.round(PT.clamp(40 * (1 - dp / 500), 0, 49)), detail: st.errs > c.errs ? 'Zu viele Rempler (' + st.errs + ', erlaubt ' + c.errs + ') – der Platzwart winkt ab.' : 'Zeit abgelaufen – der Camper stand nicht still im leuchtenden Feld' + (c.rev ? ' (rückwärts, Nase nach unten)' : '') + '.' };
    },
    bot(st, goal) {
      const want = { up: false, down: false, left: false, right: false }, car = st.car;
      if (goal === 'lose') want.up = true;
      else {
        const bm = st.bm, sg = st.paths[Math.min(bm.seg, st.paths.length - 1)], P = sg.pts;
        let j = bm.idx, best = 1e9;
        for (let i = bm.idx; i < Math.min(P.length, bm.idx + 40); i++) { const d = Math.hypot(P[i].x - car.x, P[i].y - car.y); if (d < best) { best = d; j = i; } }
        bm.idx = j;
        let la = j; while (la < P.length - 1 && Math.hypot(P[la].x - car.x, P[la].y - car.y) < 30) la++;
        const end = P[P.length - 1], dEnd = Math.hypot(end.x - car.x, end.y - car.y);
        const hv = sg.rev ? car.h + Math.PI : car.h, al = norm(Math.atan2(P[la].y - car.y, P[la].x - car.x) - hv);
        const ld = Math.max(10, Math.hypot(P[la].x - car.x, P[la].y - car.y));
        let sDes = Math.atan(2 * Math.sin(al) * WB / ld); if (sg.rev) sDes = -sDes;
        const along = (end.x - car.x) * Math.cos(hv) + (end.y - car.y) * Math.sin(hv);
        let vd = along < 1.5 ? 0 : Math.min(sg.rev ? 45 : 80, 6 + Math.min(dEnd, along) * 1.3);
        if (sg.rev) vd = -vd;
        if (vd === 0 && Math.abs(car.v) < 1 && bm.seg < st.paths.length - 1) { bm.seg++; bm.idx = 0; }
        if (vd - car.v > 4) want.up = true; else if (vd - car.v < -4) want.down = true;
        if (sDes > car.s + 0.05) want.right = true; else if (sDes < car.s - 0.05) want.left = true;
      }
      const out = [];
      for (const k in want) if (want[k] !== st.keys[k]) out.push({ type: 'key', key: k, down: want[k] });
      return out;
    },
    draw2d(g, st) {
      const c = st.cfg, car = st.car;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.fillStyle = '#262b45'; g.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
      g.strokeStyle = '#cfd6ff'; g.lineWidth = 2;
      for (let x = st.sx - c.pitch * 12; x <= 940; x += c.pitch) { if (x < 30) continue; g.beginPath(); g.moveTo(x - c.pitch / 2, SY - 44); g.lineTo(x - c.pitch / 2, SY + 44); g.stroke(); }
      const pulse = 0.5 + 0.5 * Math.sin(st.t * 5);
      g.fillStyle = st.inSpot ? 'rgba(75,224,138,.45)' : 'rgba(110,240,255,' + (0.15 + 0.2 * pulse) + ')';
      g.fillRect(st.sx - c.spotW / 2, SY - 42, c.spotW, 84);
      g.strokeStyle = '#6ef0ff'; g.lineWidth = 3; g.strokeRect(st.sx - c.spotW / 2, SY - 42, c.spotW, 84);
      g.fillStyle = '#6ef0ff'; g.font = '700 26px system-ui'; g.textAlign = 'center';
      g.fillText(c.rev ? '▼' : '⇅', st.sx, SY + 9);
      g.font = '600 18px system-ui'; g.fillText(c.rev ? 'Nase nach unten' : 'Parkfeld', st.sx, SY + 66);
      for (const r of st.campers) { g.fillStyle = '#7a86c9'; g.fillRect(r.x - r.w, r.y - r.h, r.w * 2, r.h * 2); g.fillStyle = '#ffffff55'; g.fillRect(r.x - r.w + 4, r.y - r.h + 4, r.w * 2 - 8, 8); }
      for (const p of st.poles) { g.fillStyle = '#ffb02e'; g.beginPath(); g.arc(p.x, p.y, 9, 0, 7); g.fill(); g.fillStyle = '#10142a'; g.fillRect(p.x - 9, p.y - 2, 18, 4); }
      const cc = center(car);
      g.save(); g.translate(cc.x, cc.y); g.rotate(car.h);
      g.fillStyle = '#111'; for (const s of [-1, 1]) { g.fillRect(-OFS - 8, s * HW - 4, 16, 8); g.save(); g.translate(WB - OFS, s * HW); g.rotate(car.s); g.fillRect(-8, -4, 16, 8); g.restore(); }
      g.fillStyle = st.cool > 0.4 ? '#ff4d6d' : '#ff9f1c'; g.fillRect(-HL, -HW, HL * 2, HW * 2);
      g.fillStyle = '#6ef0ff'; g.fillRect(HL - 14, -HW + 3, 9, HW * 2 - 6);
      g.fillStyle = '#fff'; g.fillRect(-HL + 6, -5, 30, 10);
      g.restore();
      if (st.ptr) { g.strokeStyle = '#ffb02e'; g.lineWidth = 2; g.beginPath(); g.arc(st.ptr.x, st.ptr.y, 16, 0, 7); g.stroke(); }
      else if (!st.inSpot && st.t < 8) { // Wegweiser zum Parkfeld in den ersten Sekunden
        g.globalAlpha = 0.5 + 0.4 * Math.sin(st.t * 6); g.strokeStyle = '#6ef0ff'; g.lineWidth = 3; g.setLineDash([10, 10]);
        g.beginPath(); g.moveTo(cc.x, cc.y); g.lineTo(st.sx, SY + 48); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      }
      g.fillStyle = '#ffffff'; g.font = '600 18px system-ui'; g.textAlign = 'center'; g.fillText('DU', cc.x, cc.y - 26);
      g.fillStyle = '#fff'; g.font = '700 22px system-ui'; g.textAlign = 'left';
      g.fillText('⏱ ' + Math.max(0, c.time - st.t).toFixed(1) + ' s', 24, 44);
      g.fillText('Rempler: ' + st.errs + ' / ' + c.errs, 190, 44);
      g.textAlign = 'right'; g.fillStyle = st.park > 0 ? '#4be08a' : '#fff';
      g.fillText(st.park > 0 ? '✓ Im Feld – stehen bleiben … ' + Math.round(st.park / 0.8 * 100) + ' %' : st.inSpot ? '✓ Im Feld – jetzt anhalten!' : (st.player ? st.player + ': ' : '') + 'Ziel: ins leuchtende Feld' + (c.rev ? ' (rückwärts)' : ''), 900, 44);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
