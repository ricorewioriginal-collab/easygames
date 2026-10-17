/* Q03 Schätzduell: Schätzfragen aus PT.DATA.quiz.est mit Schieberegler beantworten.
   Punkte je Frage nach relativer Abweichung: bis 2 % volle 100 Punkte, danach linear weniger bis 0 an der Toleranzgrenze. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { n: 5, time: 22, tol: 0.6, need: 45 },
    { n: 6, time: 17, tol: 0.45, need: 50 },
    { n: 7, time: 13, tol: 0.35, need: 55 }
  ];
  const FB = 3.4, TX = 100, TW = 760, TY = 330, OK = { x: 360, y: 420, w: 240, h: 62 };

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  function niceStep(r) { const e = Math.pow(10, Math.floor(Math.log10(r))), m = r / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
  function num(v) {
    const r = Math.round(v * 1000) / 1000;
    if (Number.isInteger(r)) return PT.fmt(r);
    const [i, d] = String(r).split('.'); return PT.fmt(+i) + ',' + d;
  }
  const val = (q, p) => { const v = q.min + p * (q.max - q.min); return PT.clamp(Math.round(v / q.step) * q.step, q.min, q.max); };
  function points(st, dev) { const tol = st.cfg.tol; return dev <= 0.02 ? 100 : Math.max(0, Math.round(100 * (1 - (dev - 0.02) / (tol - 0.02)))); }
  function submit(st) {
    if (st.phase !== 'q') return;
    const q = st.qs[st.idx], guess = val(q, st.p), dev = Math.abs(guess - q.v) / q.v, pts = points(st, dev);
    st.last = { guess, dev, pts }; st.total += pts; st.phase = 'fb'; st.fbT = FB; st.hold = 0; st.drag = false;
    MG.fx(st, pts >= 80 ? 'coin' : pts >= 40 ? 'good' : 'bad');
  }
  function next(st) {
    st.idx++;
    if (st.idx >= st.qs.length) return MG.finish(st, st.total >= st.needTotal);
    st.phase = 'q'; st.qt = st.cfg.time; st.p = 0.5; MG.fx(st, 'whoosh');
  }

  MG.define({
    id: 'Q03', group: 'quiz', name: 'Schätzduell', icon: '📏',
    short: 'Wie hoch, wie weit, wie viele? Schieb den Regler so nah wie möglich ran.',
    rules: [
      'Stelle mit dem Schieberegler deine Schätzung ein und logge sie ein.',
      'Bis 2 % Abweichung gibt es volle 100 Punkte, danach immer weniger – ab der Toleranzgrenze null.',
      'Läuft die Zeit ab, zählt der aktuelle Reglerwert.',
      'Gewonnen, wenn deine Gesamtpunkte das Ziel erreichen.'
    ],
    controls: { key: '←/→ fein (halten = schneller), ↑/↓ große Sprünge, Leertaste einloggen', touch: 'Regler ziehen, „Einloggen“ tippen', pad: 'Steuerkreuz + A' },
    touch: ['left', 'right', 'up', 'down', 'a'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, phase: 'q', qt: c.time, p: 0.5, hold: 0, holdT: 0, drag: false, total: 0, last: null, fbT: 0,
        player: ((o.players || [])[o.turn | 0] || {}).name || '' };
      st.qs = PT.shuffle(st, PT.DATA.quiz.est).slice(0, c.n).map(q => ({ id: q.id, cat: q.cat, q: q.q, v: q.v, unit: q.unit, min: q.min, max: q.max, ex: q.ex, step: Math.max(Number.isInteger(q.v) ? 1 : 0, Math.min(niceStep((q.max - q.min) / 400), niceStep(q.v / 100))) }));
      st.needTotal = c.need * c.n;
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (st.phase === 'fb') {
        if (st.fbT < FB - 0.6 && ((a.type === 'key' && a.down && a.key === 'a') || (a.type === 'pointer' && a.phase === 'down'))) next(st);
        return;
      }
      const q = st.qs[st.idx];
      if (a.type === 'key') {
        if (a.key === 'left' || a.key === 'right') {
          const d = a.key === 'left' ? -1 : 1;
          if (a.down) { st.hold = d; st.holdT = 0; st.p = PT.clamp(st.p + d * q.step / (q.max - q.min), 0, 1); MG.fx(st, 'click'); }
          else if (st.hold === d) st.hold = 0;
        } else if (a.down && (a.key === 'up' || a.key === 'down')) { st.p = PT.clamp(st.p + (a.key === 'up' ? 0.1 : -0.1), 0, 1); MG.fx(st, 'click'); }
        else if (a.down && a.key === 'a') submit(st);
      } else if (a.type === 'pointer') {
        if (a.phase === 'down' && a.x >= OK.x && a.x <= OK.x + OK.w && a.y >= OK.y && a.y <= OK.y + OK.h) return submit(st);
        if (a.phase === 'down' && a.y > TY - 60 && a.y < TY + 50) st.drag = true;
        if (st.drag && (a.phase === 'down' || a.phase === 'move')) st.p = PT.clamp((a.x - TX) / TW, 0, 1);
        if (a.phase === 'up') st.drag = false;
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.phase === 'q') {
        if (st.hold) { st.holdT += dt; if (st.holdT > 0.25) st.p = PT.clamp(st.p + st.hold * Math.min(0.5, 0.04 + st.holdT * 0.18) * dt, 0, 1); }
        const before = st.qt; st.qt -= dt;
        if (before > 3 && st.qt <= 3) MG.fx(st, 'tick');
        if (st.qt <= 0) { st.qt = 0; submit(st); }
      } else if ((st.fbT -= dt) <= 0) next(st);
    },
    result(st) {
      const won = st.status === 'won', max = 100 * st.qs.length;
      const score = won ? 50 + Math.round(50 * (st.total - st.needTotal) / Math.max(1, max - st.needTotal)) : Math.round(49 * st.total / st.needTotal);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49), detail: st.total + ' von ' + max + ' Schätzpunkten (Ziel ' + st.needTotal + ')' };
    },
    bot(st, goal) {
      if (st.phase === 'fb') return st.fbT < 2.5 ? [{ type: 'key', key: 'a', down: true }] : [];
      if (st.cfg.time - st.qt < 0.5) return [];
      const q = st.qs[st.idx];
      const p = goal === 'win' ? (q.v - q.min) / (q.max - q.min) : (q.v - q.min > q.max - q.v ? 0 : 1);
      const x = TX + p * TW;
      return [{ type: 'pointer', phase: 'down', x, y: TY }, { type: 'pointer', phase: 'up', x, y: TY }, { type: 'key', key: 'a', down: true }];
    },
    draw2d(g, st) {
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      const q = st.qs[Math.min(st.idx, st.qs.length - 1)], c = st.cfg;
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Frage ' + Math.min(st.idx + 1, st.qs.length) + ' / ' + st.qs.length + '  ·  ' + q.cat + (st.player ? '  ·  ' + st.player : ''), 40, 36);
      g.textAlign = 'right'; g.fillText('Punkte: ' + st.total + ' / Ziel ' + st.needTotal, 920, 36);
      const tr = st.phase === 'q' ? st.qt / c.time : 0;
      g.fillStyle = '#1d2342'; g.fillRect(40, 50, 880, 12);
      g.fillStyle = tr < 0.25 ? '#ff4d6d' : '#ffb02e'; g.fillRect(40, 50, 880 * tr, 12);
      g.fillStyle = '#1a2040'; g.fillRect(40, 76, 880, 130);
      g.fillStyle = '#ffffff'; g.font = '700 27px system-ui'; g.textAlign = 'center';
      const L = wrap(g, q.q, 830).slice(0, 3), y0 = 145 - (L.length - 1) * 17;
      L.forEach((l, i) => g.fillText(l, 480, y0 + i * 34));
      // Regler
      g.fillStyle = '#1d2342'; g.fillRect(TX, TY - 8, TW, 16);
      g.fillStyle = '#8890b8'; g.font = '500 18px system-ui';
      g.textAlign = 'left'; g.fillText(num(q.min), TX, TY + 40); g.textAlign = 'right'; g.fillText(num(q.max), TX + TW, TY + 40);
      const kx = TX + st.p * TW, guess = st.phase === 'fb' ? st.last.guess : val(q, st.p);
      if (st.phase === 'fb') {
        // Toleranzbereich und wahrer Wert
        const r = q.max - q.min, lo = TX + PT.clamp((q.v * (1 - c.tol) - q.min) / r, 0, 1) * TW, hi = TX + PT.clamp((q.v * (1 + c.tol) - q.min) / r, 0, 1) * TW;
        g.fillStyle = 'rgba(75,224,138,.25)'; g.fillRect(lo, TY - 8, hi - lo, 16);
        const vx = TX + (q.v - q.min) / r * TW;
        g.fillStyle = '#4be08a'; g.fillRect(vx - 3, TY - 30, 6, 74);
        g.font = '700 20px system-ui'; g.textAlign = 'center'; g.fillText('Richtig: ' + num(q.v) + ' ' + q.unit, PT.clamp(vx, 200, 760), TY + 66);
      }
      const gx = st.phase === 'fb' ? TX + (st.last.guess - q.min) / (q.max - q.min) * TW : kx;
      g.fillStyle = '#ffb02e'; g.fillRect(gx - 14, TY - 26, 28, 52);
      if (st.phase === 'q') { g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(gx - 17, TY - 29, 34, 58); }
      g.fillStyle = '#6ef0ff'; g.font = '800 34px system-ui'; g.textAlign = 'center';
      g.fillText(num(guess) + ' ' + q.unit, 480, 268);
      if (st.phase === 'fb') {
        const l = st.last;
        g.fillStyle = l.pts >= 80 ? '#4be08a' : l.pts >= 40 ? '#ffb02e' : '#ff4d6d'; g.font = '800 26px system-ui';
        g.fillText('Abweichung ' + Math.round(l.dev * 100) + ' %  →  ' + l.pts + ' Punkte', 480, 425);
        g.fillStyle = '#cfd6ff'; g.font = '500 19px system-ui';
        g.fillText('100 P bis 2 %, 0 P ab ' + Math.round(c.tol * 100) + ' % Abweichung', 480, 455);
        g.fillStyle = '#ffffff'; wrap(g, q.ex, 840).slice(0, 2).forEach((s, i) => g.fillText(s, 480, 490 + i * 24));
      } else {
        g.fillStyle = '#ffb02e'; g.fillRect(OK.x, OK.y, OK.w, OK.h);
        g.fillStyle = '#10142a'; g.font = '800 26px system-ui'; g.fillText('Einloggen', OK.x + OK.w / 2, OK.y + 40);
        g.fillStyle = '#cfd6ff'; g.font = '500 18px system-ui';
        g.fillText('Noch ' + Math.ceil(st.qt) + ' s  ·  0 Punkte ab ' + Math.round(c.tol * 100) + ' % Abweichung', 480, 515);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
