/* Q02 Wahr oder Quatsch: Aussagen aus PT.DATA.quiz.tf bewerten. Nach jeder Antwort erscheint kurz die Erklärung.
   Serien richtiger Antworten erhöhen den Punktefaktor. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { n: 10, time: 12, need: 0.6, diffs: [0, 1] },
    { n: 12, time: 9, need: 0.7, diffs: [0, 1, 2] },
    { n: 14, time: 6.5, need: 0.75, diffs: [1, 2] }
  ];
  const FB = 3.2;
  const BTN = [{ x: 60, label: 'WAHR', col: '#4be08a', key: '1 / ←' }, { x: 500, label: 'QUATSCH', col: '#ff4d6d', key: '2 / →' }], BY = 330, BW = 400, BH = 110;

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  // i: 0 = wahr, 1 = Quatsch, -1 = Zeit um
  function answer(st, i) {
    if (st.phase !== 'q') return;
    const s = st.items[st.idx], ok = i >= 0 && (i === 0) === s.t;
    st.picked = i; st.phase = 'fb'; st.fbT = FB;
    if (ok) { st.right++; st.streak++; st.lastGain = 50 * Math.min(4, st.streak) + Math.round(30 * st.qt / st.cfg.time); st.points += st.lastGain; MG.fx(st, st.streak >= 3 ? 'coin' : 'good'); }
    else { st.streak = 0; st.lastGain = 0; MG.fx(st, i < 0 ? 'buzz' : 'bad'); }
  }
  function next(st) {
    st.idx++;
    if (st.idx >= st.items.length) return MG.finish(st, st.right >= st.needN);
    st.phase = 'q'; st.qt = st.cfg.time; st.picked = -1; MG.fx(st, 'whoosh');
  }

  MG.define({
    id: 'Q02', group: 'quiz', name: 'Wahr oder Quatsch', icon: '🤔',
    short: 'Stimmt das – oder ist es kompletter Quatsch?',
    rules: [
      'Lies die Aussage und entscheide: wahr oder Quatsch?',
      'Nach jeder Antwort siehst du kurz die Erklärung.',
      'Richtige Antworten in Serie zählen mehr (bis vierfach). Zeit abgelaufen = falsch.',
      'Gewonnen, wenn du mindestens die Zielzahl richtig hast.'
    ],
    controls: { key: '← / 1 = Wahr, → / 2 = Quatsch, Leertaste = weiter', touch: 'Knopf antippen', pad: 'Steuerkreuz links/rechts' },
    touch: ['left', 'right', 'a'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, phase: 'q', qt: c.time, picked: -1, right: 0, streak: 0, points: 0, lastGain: 0, fbT: 0,
        player: ((o.players || [])[o.turn | 0] || {}).name || '' };
      const pool = PT.DATA.quiz.tf.filter(q => c.diffs.indexOf(q.diff) >= 0);
      st.items = PT.shuffle(st, pool).slice(0, c.n).map(q => ({ id: q.id, cat: q.cat, s: q.s, t: q.t, ex: q.ex }));
      st.needN = Math.ceil(st.items.length * c.need);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (st.phase === 'fb') {
        if (st.fbT < FB - 0.6 && ((a.type === 'key' && a.down && a.key === 'a') || (a.type === 'pointer' && a.phase === 'down'))) next(st);
        return;
      }
      if (a.type === 'key' && a.down) {
        if (a.key === 'left' || a.key === '1') answer(st, 0);
        else if (a.key === 'right' || a.key === '2') answer(st, 1);
      } else if (a.type === 'pointer' && a.phase === 'down' && a.y >= BY && a.y <= BY + BH) {
        BTN.forEach((b, i) => { if (a.x >= b.x && a.x <= b.x + BW) answer(st, i); });
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.phase === 'q') {
        const before = st.qt; st.qt -= dt;
        if (before > 3 && st.qt <= 3) MG.fx(st, 'tick');
        if (st.qt <= 0) { st.qt = 0; answer(st, -1); }
      } else if ((st.fbT -= dt) <= 0) next(st);
    },
    result(st) {
      const n = st.items.length, r = st.right, won = st.status === 'won';
      const score = won ? 50 + Math.round(50 * (r - st.needN + 1) / (n - st.needN + 1)) : Math.round(49 * r / st.needN);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49), detail: r + ' von ' + n + ' Aussagen richtig eingeschätzt (Ziel ' + st.needN + '), ' + st.points + ' Punkte' };
    },
    bot(st, goal) {
      if (st.phase === 'fb') return st.fbT < 2 ? [{ type: 'key', key: 'a', down: true }] : [];
      if (st.cfg.time - st.qt < 0.8) return [];
      const t = st.items[st.idx].t, wantTrue = goal === 'win' ? t : !t;
      return [{ type: 'key', key: wantTrue ? 'left' : 'right', down: true }];
    },
    draw2d(g, st) {
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      const s = st.items[Math.min(st.idx, st.items.length - 1)], c = st.cfg;
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Aussage ' + Math.min(st.idx + 1, st.items.length) + ' / ' + st.items.length + '  ·  ' + s.cat + (st.player ? '  ·  ' + st.player : ''), 40, 36);
      g.textAlign = 'right';
      g.fillText('Richtig: ' + st.right + ' (Ziel ' + st.needN + ')   Serie ×' + Math.max(1, Math.min(4, st.streak)) + '   ' + st.points + ' P', 920, 36);
      const tr = st.phase === 'q' ? st.qt / c.time : 0;
      g.fillStyle = '#1d2342'; g.fillRect(40, 50, 880, 12);
      g.fillStyle = tr < 0.3 ? '#ff4d6d' : '#6ef0ff'; g.fillRect(40, 50, 880 * tr, 12);
      // Aussage-Karte (leicht wackelnd während der Frage)
      const wob = st.phase === 'q' ? Math.sin(st.t * 2.2) * 2 : 0;
      g.fillStyle = '#1a2040'; g.fillRect(60, 85 + wob, 840, 215);
      g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.strokeRect(60, 85 + wob, 840, 215);
      g.fillStyle = '#ffffff'; g.font = '700 28px system-ui'; g.textAlign = 'center';
      const L = wrap(g, '„' + s.s + '“', 780).slice(0, 5), y0 = 195 + wob - (L.length - 1) * 18;
      L.forEach((l, i) => g.fillText(l, 480, y0 + i * 36));
      if (st.phase === 'fb') {
        const ok = st.picked >= 0 && (st.picked === 0) === s.t;
        g.fillStyle = ok ? '#123d2a' : '#3d1220'; g.fillRect(60, 320, 840, 200);
        g.fillStyle = ok ? '#4be08a' : '#ff4d6d'; g.font = '800 30px system-ui';
        g.fillText((ok ? 'Richtig! +' + st.lastGain + '  ·  ' : st.picked < 0 ? 'Zeit um!  ·  ' : 'Daneben!  ·  ') + (s.t ? 'Das ist WAHR.' : 'Das ist QUATSCH.'), 480, 365);
        g.fillStyle = '#ffffff'; g.font = '500 22px system-ui';
        wrap(g, s.ex, 780).slice(0, 4).forEach((l, i) => g.fillText(l, 480, 410 + i * 28));
        g.fillStyle = '#8890b8'; g.font = '500 18px system-ui'; g.fillText('Leertaste / Tippen = weiter', 480, 508);
        return;
      }
      BTN.forEach((b, i) => {
        g.fillStyle = '#1d2342'; g.fillRect(b.x, BY, BW, BH);
        g.strokeStyle = b.col; g.lineWidth = 4; g.strokeRect(b.x + 2, BY + 2, BW - 4, BH - 4);
        g.fillStyle = b.col; g.font = '800 40px system-ui'; g.fillText(b.label, b.x + BW / 2, BY + 62);
        g.fillStyle = '#8890b8'; g.font = '500 18px system-ui'; g.fillText(b.key, b.x + BW / 2, BY + 94);
      });
      g.fillStyle = '#cfd6ff'; g.font = '600 22px system-ui'; g.fillText('Noch ' + Math.ceil(st.qt) + ' s', 480, 490);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
