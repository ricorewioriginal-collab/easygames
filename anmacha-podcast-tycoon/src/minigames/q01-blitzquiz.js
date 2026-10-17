/* Q01 A–D-Blitzquiz: Fragen aus PT.DATA.quiz.mc unter Zeitdruck. Schnelle richtige Antworten bringen Bonuspunkte,
   gewonnen ist ab einer Mindestquote richtiger Antworten. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [ // Locker, Standard, Profi
    { n: 8, time: 16, need: 0.5, diffs: [0, 1] },
    { n: 10, time: 12, need: 0.6, diffs: [0, 1, 2] },
    { n: 12, time: 9, need: 0.7, diffs: [1, 2] }
  ];
  const FB = 1.8; // Sekunden Feedback nach jeder Antwort
  const BOX = [[40, 250], [490, 250], [40, 385], [490, 385]], BW = 430, BH = 115;
  const COL = ['#ff4d6d', '#6ef0ff', '#ffb02e', '#4be08a'];

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  function para(g, s, x, y, w, lh, max) { wrap(g, s, w).slice(0, max || 9).forEach((l, i) => g.fillText(l, x, y + i * lh)); }

  function answer(st, i) {
    if (st.phase !== 'q') return;
    const q = st.qs[st.idx], ok = i === q.c;
    st.picked = i; st.phase = 'fb'; st.fbT = FB;
    if (ok) { st.right++; const bonus = Math.round(50 * st.qt / st.cfg.time); st.points += 100 + bonus; st.lastGain = 100 + bonus; MG.fx(st, 'good'); }
    else { st.lastGain = 0; MG.fx(st, i < 0 ? 'buzz' : 'bad'); }
  }
  function next(st) {
    st.idx++;
    if (st.idx >= st.qs.length) return MG.finish(st, st.right >= st.needN);
    st.phase = 'q'; st.qt = st.cfg.time; st.sel = 0; st.picked = -1; MG.fx(st, 'whoosh');
  }

  MG.define({
    id: 'Q01', group: 'quiz', name: 'A–D-Blitzquiz', icon: '❓',
    short: 'Vier Antworten, eine stimmt – und die Uhr tickt.',
    rules: [
      'Zu jeder Frage gibt es vier Antworten, genau eine ist richtig.',
      'Für jede Frage läuft eine eigene Zeit ab – keine Antwort zählt als falsch.',
      'Richtige Antworten bringen 100 Punkte plus Tempobonus.',
      'Gewonnen, wenn du mindestens die angezeigte Zahl an Fragen richtig hast.'
    ],
    controls: { key: '1–4 direkt oder Pfeile + Leertaste', touch: 'Antwort antippen', pad: 'Steuerkreuz + A' },
    touch: ['1', '2', '3', '4'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, phase: 'q', qt: c.time, sel: 0, picked: -1, right: 0, points: 0, lastGain: 0, fbT: 0,
        player: ((o.players || [])[o.turn | 0] || {}).name || '' };
      const pool = PT.DATA.quiz.mc.filter(q => c.diffs.indexOf(q.diff) >= 0);
      st.qs = PT.shuffle(st, pool).slice(0, c.n).map(q => ({ id: q.id, cat: q.cat, q: q.q, a: q.a.slice(), c: q.c }));
      st.needN = Math.ceil(c.n * c.need);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (st.phase === 'fb') {
        if ((a.type === 'key' && a.down && a.key === 'a') || (a.type === 'pointer' && a.phase === 'down')) { if (st.fbT < FB - 0.3) next(st); }
        return;
      }
      if (a.type === 'key' && a.down) {
        const k = a.key;
        if (k >= '1' && k <= '4') answer(st, +k - 1);
        else if (k === 'left' || k === 'right') { st.sel ^= 1; MG.fx(st, 'click'); }
        else if (k === 'up' || k === 'down') { st.sel ^= 2; MG.fx(st, 'click'); }
        else if (k === 'a') answer(st, st.sel);
      } else if (a.type === 'pointer' && a.phase === 'down') {
        BOX.forEach((b, i) => { if (a.x >= b[0] && a.x <= b[0] + BW && a.y >= b[1] && a.y <= b[1] + BH) { st.sel = i; answer(st, i); } });
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
      const n = st.qs.length, r = st.right, won = st.status === 'won';
      let score;
      if (won) score = 50 + Math.round(50 * (r - st.needN) / Math.max(1, n - st.needN) * 0.8 + Math.min(10, st.points / n / 15));
      else score = Math.round(49 * r / Math.max(1, st.needN));
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49), detail: r + ' von ' + n + ' Fragen richtig (Ziel ' + st.needN + '), ' + st.points + ' Punkte' };
    },
    bot(st, goal) {
      if (st.phase !== 'q' || st.cfg.time - st.qt < 0.6) return [];
      const c = st.qs[st.idx].c;
      return [{ type: 'key', key: String((goal === 'win' ? c : (c + 1) % 4) + 1), down: true }];
    },
    draw2d(g, st) {
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      const q = st.qs[Math.min(st.idx, st.qs.length - 1)], c = st.cfg;
      // Kopfzeile
      g.font = '600 20px system-ui'; g.textAlign = 'left'; g.fillStyle = '#cfd6ff';
      g.fillText('Frage ' + Math.min(st.idx + 1, st.qs.length) + ' / ' + st.qs.length + '  ·  ' + q.cat + (st.player ? '  ·  ' + st.player : ''), 40, 36);
      g.textAlign = 'right';
      g.fillText('Richtig: ' + st.right + ' (Ziel ' + st.needN + ')   Punkte: ' + st.points, 920, 36);
      // Zeitbalken
      const tr = st.phase === 'q' ? st.qt / c.time : 0;
      g.fillStyle = '#1d2342'; g.fillRect(40, 50, 880, 12);
      g.fillStyle = tr < 0.25 ? '#ff4d6d' : '#ffb02e'; g.fillRect(40, 50, 880 * tr, 12);
      // Frage
      g.fillStyle = '#1a2040'; g.fillRect(40, 78, 880, 150);
      g.fillStyle = '#ffffff'; g.font = '700 28px system-ui'; g.textAlign = 'center';
      const lines = wrap(g, q.q, 830).slice(0, 4), y0 = 153 - (lines.length - 1) * 18;
      lines.forEach((l, i) => g.fillText(l, 480, y0 + i * 36));
      // Antworten
      g.font = '600 22px system-ui';
      BOX.forEach((b, i) => {
        let bg = '#1d2342';
        if (st.phase === 'fb') { if (i === q.c) bg = '#1f6b45'; else if (i === st.picked) bg = '#7a2236'; }
        g.fillStyle = bg; g.fillRect(b[0], b[1], BW, BH);
        g.fillStyle = COL[i]; g.fillRect(b[0], b[1], 10, BH);
        if (st.phase === 'q' && i === st.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(b[0] + 2, b[1] + 2, BW - 4, BH - 4); }
        g.fillStyle = COL[i]; g.textAlign = 'left'; g.font = '800 26px system-ui'; g.fillText('ABCD'[i], b[0] + 24, b[1] + 38);
        g.fillStyle = '#ffffff'; g.font = '600 21px system-ui';
        const L = wrap(g, q.a[i], BW - 80).slice(0, 3); L.forEach((l, j) => g.fillText(l, b[0] + 62, b[1] + 38 + j * 26));
        g.fillStyle = '#8890b8'; g.font = '500 18px system-ui'; g.textAlign = 'right'; g.fillText(String(i + 1), b[0] + BW - 12, b[1] + BH - 12);
      });
      // Feedback
      if (st.phase === 'fb') {
        const ok = st.picked === q.c;
        g.fillStyle = ok ? '#4be08a' : '#ff4d6d'; g.font = '800 24px system-ui'; g.textAlign = 'center';
        g.fillText(ok ? 'Richtig! +' + st.lastGain : (st.picked < 0 ? 'Zeit um! ' : 'Leider falsch. ') + 'Richtig: ' + 'ABCD'[q.c], 480, 528);
      } else {
        g.fillStyle = '#cfd6ff'; g.font = '500 18px system-ui'; g.textAlign = 'center';
        g.fillText(Math.ceil(st.qt) + ' s  ·  1–4 oder Pfeile + Leertaste  ·  Antwort antippen', 480, 526);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
