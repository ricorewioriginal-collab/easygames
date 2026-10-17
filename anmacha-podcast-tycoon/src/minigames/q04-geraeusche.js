/* Q04 Geräuscheraten: Klänge aus PT.DATA.sounds werden synthetisch abgespielt, vier Antworten stehen zur Wahl.
   Auf höheren Stufen gibt es weniger Wiederholungen und ähnlichere Ablenker (gleiche Kategorie). */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { n: 6, time: 16, replays: 9, need: 0.5, sameCat: false },
    { n: 8, time: 12, replays: 2, need: 0.6, sameCat: false },
    { n: 10, time: 9, replays: 1, need: 0.7, sameCat: true }
  ];
  const FB = 2, BOX = [[40, 255], [490, 255], [40, 390], [490, 390]], BW = 430, BH = 112, REP = { x: 640, y: 92, w: 280, h: 64 };
  const COL = ['#ff4d6d', '#6ef0ff', '#ffb02e', '#4be08a'];

  const sounds = () => PT.DATA.sounds;
  const dur = s => s.parts.reduce((m, p) => Math.max(m, (p.t || 0) + p.d), 0);
  function play(st) {
    const s = sounds()[st.rounds[st.idx].snd];
    st.fx.push({ recipe: { parts: s.parts } }); st.playT = 0; st.playDur = dur(s);
  }
  function answer(st, i) {
    if (st.phase !== 'q' || st.pending > 0) return;
    const r = st.rounds[st.idx], ok = i === r.c;
    st.picked = i; st.phase = 'fb'; st.fbT = FB;
    if (ok) { st.right++; st.lastGain = 100 + Math.round(50 * st.qt / st.qMax); st.points += st.lastGain; MG.fx(st, 'good'); }
    else { st.lastGain = 0; MG.fx(st, i < 0 ? 'buzz' : 'bad'); }
  }
  function next(st) {
    st.idx++;
    if (st.idx >= st.rounds.length) return MG.finish(st, st.right >= st.needN);
    st.phase = 'q'; st.sel = 0; st.picked = -1; st.pending = 0.5; st.replays = st.cfg.replays;
  }

  MG.define({
    id: 'Q04', group: 'quiz', name: 'Geräuscheraten', icon: '🔊',
    short: 'Ohren auf! Welches Geräusch spielt der Studio-Synthesizer gerade?',
    rules: [
      'Ein Geräusch wird abgespielt – wähle aus vier Antworten das passende.',
      '„Nochmal hören“ wiederholt den Klang (begrenzt je nach Stufe).',
      'Schnelle richtige Antworten bringen Bonuspunkte, Zeit abgelaufen zählt als falsch.',
      'Gewonnen, wenn du mindestens die Zielzahl richtig erkennst.'
    ],
    controls: { key: '1–4 oder Pfeile + Leertaste, E/Q = nochmal hören', touch: 'Antwort antippen, 🔁 tippen', pad: 'Steuerkreuz + A, B = nochmal' },
    touch: ['1', '2', '3', '4', 'b'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, phase: 'q', sel: 0, picked: -1, right: 0, points: 0, lastGain: 0, fbT: 0, pending: 0.8, replays: c.replays,
        qt: 0, qMax: 1, playT: 99, playDur: 0, player: ((o.players || [])[o.turn | 0] || {}).name || '' };
      const all = sounds(), order = PT.shuffle(st, all.map((s, i) => i)).slice(0, c.n);
      st.rounds = order.map(si => {
        const same = all.map((s, i) => i).filter(i => i !== si && all[i].cat === all[si].cat);
        const other = all.map((s, i) => i).filter(i => i !== si && same.indexOf(i) < 0);
        const pool = c.sameCat ? PT.shuffle(st, same).concat(PT.shuffle(st, other)) : PT.shuffle(st, same.concat(other));
        const opts = PT.shuffle(st, [si].concat(pool.slice(0, 3)));
        return { snd: si, opts, c: opts.indexOf(si) };
      });
      st.needN = Math.ceil(c.n * c.need);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const press = a.type === 'key' && a.down, tap = a.type === 'pointer' && a.phase === 'down';
      if (st.phase === 'fb') { if (st.fbT < FB - 0.4 && ((press && a.key === 'a') || tap)) next(st); return; }
      if (st.pending > 0) return;
      const wantReplay = (press && a.key === 'b') || (tap && a.x >= REP.x && a.x <= REP.x + REP.w && a.y >= REP.y && a.y <= REP.y + REP.h);
      if (wantReplay) { if (st.replays > 0 && st.playT >= st.playDur) { st.replays--; play(st); } else MG.fx(st, 'beep'); return; }
      if (press) {
        const k = a.key;
        if (k >= '1' && k <= '4') answer(st, +k - 1);
        else if (k === 'left' || k === 'right') { st.sel ^= 1; MG.fx(st, 'click'); }
        else if (k === 'up' || k === 'down') { st.sel ^= 2; MG.fx(st, 'click'); }
        else if (k === 'a') answer(st, st.sel);
      } else if (tap) BOX.forEach((b, i) => { if (a.x >= b[0] && a.x <= b[0] + BW && a.y >= b[1] && a.y <= b[1] + BH) { st.sel = i; answer(st, i); } });
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.playT += dt;
      if (st.phase === 'q') {
        if (st.pending > 0) {
          if ((st.pending -= dt) <= 0) { st.pending = 0; play(st); st.qMax = st.cfg.time + st.playDur; st.qt = st.qMax; }
          return;
        }
        const before = st.qt; st.qt -= dt;
        if (before > 3 && st.qt <= 3) MG.fx(st, 'tick');
        if (st.qt <= 0) { st.qt = 0; answer(st, -1); }
      } else if ((st.fbT -= dt) <= 0) next(st);
    },
    result(st) {
      const n = st.rounds.length, r = st.right, won = st.status === 'won';
      const score = won ? 50 + Math.round(50 * (r - st.needN + 1) / (n - st.needN + 1)) : Math.round(49 * r / st.needN);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49), detail: r + ' von ' + n + ' Geräuschen erkannt (Ziel ' + st.needN + ')' };
    },
    bot(st, goal) {
      if (st.phase !== 'q' || st.pending > 0 || st.playT < 0.5) return [];
      const c = st.rounds[st.idx].c;
      return [{ type: 'key', key: String((goal === 'win' ? c : (c + 2) % 4) + 1), down: true }];
    },
    draw2d(g, st) {
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      const r = st.rounds[Math.min(st.idx, st.rounds.length - 1)], all = sounds(), c = st.cfg;
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Geräusch ' + Math.min(st.idx + 1, st.rounds.length) + ' / ' + st.rounds.length + (st.player ? '  ·  ' + st.player : ''), 40, 36);
      g.textAlign = 'right'; g.fillText('Richtig: ' + st.right + ' (Ziel ' + st.needN + ')   Punkte: ' + st.points, 920, 36);
      const tr = st.phase === 'q' && st.pending <= 0 ? st.qt / st.qMax : st.phase === 'q' ? 1 : 0;
      g.fillStyle = '#1d2342'; g.fillRect(40, 50, 880, 12);
      g.fillStyle = tr < 0.25 ? '#ff4d6d' : '#6ef0ff'; g.fillRect(40, 50, 880 * tr, 12);
      // Lautsprecher mit Klangwellen
      const playing = st.playT < st.playDur;
      g.fillStyle = '#1a2040'; g.fillRect(40, 78, 580, 160);
      g.fillStyle = '#ffb02e'; g.fillRect(80, 133, 34, 50);
      g.beginPath(); g.moveTo(114, 133); g.lineTo(160, 100); g.lineTo(160, 216); g.lineTo(114, 183); g.fill();
      for (let i = 0; i < 18; i++) {
        const h = playing ? 12 + 50 * Math.abs(Math.sin(st.playT * (5 + i * 0.7) + i * 1.3)) : 6;
        g.fillStyle = playing ? '#6ef0ff' : '#3a4270'; g.fillRect(200 + i * 22, 158 - h, 14, h * 2);
      }
      g.fillStyle = '#cfd6ff'; g.font = '600 20px system-ui'; g.textAlign = 'left';
      g.fillText(st.pending > 0 && st.phase === 'q' ? 'Gleich geht’s los …' : playing ? 'Hör genau hin!' : 'Was war das?', 200, 225);
      // Nochmal-hören-Knopf
      const canRep = st.phase === 'q' && st.replays > 0 && !playing && st.pending <= 0;
      g.fillStyle = canRep ? '#ffb02e' : '#3a4270'; g.fillRect(REP.x, REP.y, REP.w, REP.h);
      g.fillStyle = '#10142a'; g.font = '700 22px system-ui'; g.textAlign = 'center';
      g.fillText('🔁 Nochmal hören (B)', REP.x + REP.w / 2, REP.y + 30);
      g.font = '500 18px system-ui'; g.fillText(c.replays > 5 ? 'beliebig oft' : 'noch ' + st.replays + '×', REP.x + REP.w / 2, REP.y + 53);
      g.fillStyle = '#cfd6ff'; g.font = '500 18px system-ui';
      g.fillText(st.phase === 'q' && st.pending <= 0 ? 'Noch ' + Math.ceil(st.qt) + ' s' : '', REP.x + REP.w / 2, 200);
      // Antworten
      BOX.forEach((b, i) => {
        let bg = '#1d2342';
        if (st.phase === 'fb') { if (i === r.c) bg = '#1f6b45'; else if (i === st.picked) bg = '#7a2236'; }
        g.fillStyle = bg; g.fillRect(b[0], b[1], BW, BH);
        g.fillStyle = COL[i]; g.fillRect(b[0], b[1], 10, BH);
        if (st.phase === 'q' && i === st.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(b[0] + 2, b[1] + 2, BW - 4, BH - 4); }
        g.textAlign = 'left'; g.fillStyle = COL[i]; g.font = '800 26px system-ui'; g.fillText(String(i + 1), b[0] + 26, b[1] + 64);
        g.fillStyle = '#ffffff'; g.font = '700 24px system-ui'; g.fillText(all[r.opts[i]].name, b[0] + 64, b[1] + 64);
      });
      if (st.phase === 'fb') {
        const ok = st.picked === r.c;
        g.fillStyle = ok ? '#4be08a' : '#ff4d6d'; g.font = '800 22px system-ui'; g.textAlign = 'center';
        g.fillText(ok ? 'Richtig erkannt! +' + st.lastGain : (st.picked < 0 ? 'Zeit um! ' : 'Nein – ') + 'Das war: ' + all[r.snd].name, 480, 528);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
