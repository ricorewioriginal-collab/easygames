/* P02 Soundmixer: Mehrere Spuren (Marco, Andrew, Gast, Musikbett, Jingle) ändern im Lauf der Sendung ihre Lautstärke.
   Mit den Fadern jede Spur in ihr Wertungsfenster bringen: Sprache klar über der Musik, Stimmen ausgeglichen.
   Nur wenn alle Spuren gleichzeitig passen, füllt sich die Leiste „Sauberer Mix“. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const TRACKS = [
    { name: 'Marco', target: 0.70, col: '#ffb02e', up: 'Marco lacht ins Mikro!', down: 'Marco lehnt sich zurück …' },
    { name: 'Andrew', target: 0.70, col: '#6ef0ff', up: 'Andrew wird leidenschaftlich!', down: 'Andrew murmelt in den Bart …' },
    { name: 'Gast', target: 0.70, col: '#c89bff', up: 'Der Gast taut auf und wird laut!', down: 'Der Gast spricht ganz leise …' },
    { name: 'Musikbett', target: 0.30, col: '#4be08a', up: 'Das Musikbett schwillt an!', down: 'Die Musik wird ganz zahm …' },
    { name: 'Jingle', target: 0.50, col: '#ff8fb0', up: 'Der Jingle dreht auf!', down: 'Dem Jingle geht die Puste aus …' }
  ];
  const CFG = [ // Locker, Standard, Profi
    { n: 4, time: 60, need: 22, tol: 0.12, ev: 6.5, swing: 0.35 },
    { n: 5, time: 65, need: 28, tol: 0.09, ev: 5.0, swing: 0.45 },
    { n: 5, time: 70, need: 34, tol: 0.07, ev: 4.0, swing: 0.55 }
  ];
  const TOP = 140, BOT = 440, HGT = BOT - TOP, SCALE = 1.2, CLIP = 1.0, SPEED = 0.55;
  const stripW = st => 900 / st.cfg.n;
  const faderX = (st, i) => 30 + i * stripW(st) + stripW(st) * 0.66;
  const out = (st, i) => st.src[i] * st.fad[i] * 2 * (1 + 0.03 * Math.sin(st.t * 7 + i * 1.7));
  const ok = (st, i) => Math.abs(out(st, i) - TRACKS[i].target) <= st.cfg.tol;

  function newEvent(st) {
    const c = st.cfg, i = PT.randInt(st, 0, c.n - 1), cur = st.goal[i];
    let dir = PT.rand(st) < 0.5 ? -1 : 1;
    if (cur > 0.78) dir = -1; else if (cur < 0.5) dir = 1;
    st.goal[i] = PT.clamp(cur * (1 + dir * c.swing * (0.5 + PT.rand(st) * 0.5)), 0.38, 0.95);
    st.msg = dir > 0 ? TRACKS[i].up : TRACKS[i].down; st.msgT = 3; st.flash = i;
    MG.fx(st, 'whoosh');
  }

  MG.define({
    id: 'P02', group: 'produktion', name: 'Soundmixer', icon: '🎚️',
    short: 'Alle Spuren gleichzeitig ins Wertungsfenster mischen – während sich die Pegel ständig ändern.',
    rules: [
      'Jede Spur hat ein Wertungsfenster (heller Balken): Stimmen deutlich, Musik leise darunter.',
      'Im Lauf der Sendung werden Spuren lauter oder leiser – nachregeln!',
      'Nur wenn ALLE Spuren im Fenster sind, füllt sich die Leiste „Sauberer Mix“.',
      'Übersteuerung (über 100 %) kostet Mix-Sekunden.',
      'Gewonnen, wenn die Leiste vor Sendeschluss voll ist.'
    ],
    controls: { key: '←/→ Spur wählen, ↑/↓ Fader, 1–4 Spur direkt', touch: 'Fader ziehen oder ◀ ▶ ▲ ▼', pad: 'Steuerkreuz: Spur wählen und Fader bewegen' },
    touch: ['left', 'right', 'up', 'down'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, prog: 0, sel: 0, hold: 0, drag: -1,
        src: [], goal: [], fad: [], nextEv: 3, msg: 'Sendung läuft – mische sauber!', msgT: 3, flash: -1, clips: 0, clipCool: 0 };
      for (let i = 0; i < c.n; i++) {
        st.goal[i] = st.src[i] = 0.4 + PT.rand(st) * 0.5;
        st.fad[i] = PT.clamp(0.15 + PT.rand(st) * 0.7, 0, 1); // absichtlich daneben
      }
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const n = st.cfg.n;
      if (a.type === 'key') {
        if (a.key === 'up' || a.key === 'down') {
          const d = a.key === 'up' ? 1 : -1;
          st.hold = a.down ? d : (st.hold === d ? 0 : st.hold);
        } else if (a.down && (a.key === 'left' || a.key === 'right')) { st.sel = (st.sel + (a.key === 'left' ? n - 1 : 1)) % n; MG.fx(st, 'click'); }
        else if (a.down && '1234'.indexOf(a.key) >= 0 && +a.key <= n) st.sel = +a.key - 1;
      } else if (a.type === 'pointer') {
        if (a.phase === 'up') { st.drag = -1; return; }
        if (a.phase === 'down') {
          const i = Math.floor((a.x - 30) / stripW(st));
          if (i < 0 || i >= n || a.y < TOP - 40 || a.y > BOT + 40) return;
          st.drag = st.sel = i;
        }
        if (st.drag >= 0) { st.fad[st.drag] = PT.clamp((BOT - a.y) / HGT, 0, 1); st.hold = 0; }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg; st.t += dt;
      if (st.hold) st.fad[st.sel] = PT.clamp(st.fad[st.sel] + st.hold * SPEED * dt, 0, 1);
      if (st.t >= st.nextEv) { newEvent(st); st.nextEv = st.t + c.ev * (0.75 + PT.rand(st) * 0.5); }
      let good = 0, clip = false;
      for (let i = 0; i < c.n; i++) {
        st.src[i] += (st.goal[i] - st.src[i]) * Math.min(1, dt * 2.2);
        if (ok(st, i)) good++;
        if (out(st, i) > CLIP) clip = true;
      }
      st.good = good;
      if (good === c.n) st.prog += dt;
      st.clipCool -= dt;
      if (clip && st.clipCool <= 0) { st.clips++; st.prog = Math.max(0, st.prog - 1.5); st.clipCool = 1; MG.fx(st, 'bad'); st.msg = 'Übersteuert! Das zwickt in den Ohren.'; st.msgT = 2; }
      st.msgT -= dt;
      if (st.prog >= c.need) { st.prog = c.need; MG.finish(st, true); }
      else if (st.t >= c.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won';
      const score = won ? PT.clamp(Math.round(55 + 45 * (1 - st.t / c.time) - st.clips * 2), 50, 100) : PT.clamp(Math.round(49 * st.prog / c.need), 0, 49);
      return { won, score, detail: won ? 'Mix sauber nach ' + Math.round(st.t) + ' s, ' + st.clips + ' Übersteuerungen – die Hörer sind entzückt.' : 'Nur ' + Math.round(st.prog) + ' von ' + c.need + ' Sekunden sauberer Mix geschafft.' };
    },
    bot(st, goal) {
      const acts = [];
      for (let i = 0; i < st.cfg.n; i++) {
        const f = goal === 'lose' ? 1 : PT.clamp(TRACKS[i].target / (2 * st.src[i]), 0, 1);
        acts.push({ type: 'pointer', phase: 'down', x: faderX(st, i), y: BOT - f * HGT });
      }
      acts.push({ type: 'pointer', phase: 'up', x: 0, y: 0 });
      return acts;
    },
    draw2d(g, st) {
      const c = st.cfg, w = stripW(st);
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('🎚️ Soundmixer', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff'; g.fillText('⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 936, 36);
      // Fortschritt
      g.fillStyle = '#1d2342'; g.fillRect(250, 18, 440, 24);
      g.fillStyle = st.good === c.n ? '#4be08a' : '#2f9e64'; g.fillRect(250, 18, 440 * st.prog / c.need, 24);
      g.font = '600 18px system-ui'; g.textAlign = 'center'; g.fillStyle = '#ffffff';
      g.fillText('Sauberer Mix ' + st.prog.toFixed(1) + ' / ' + c.need + ' s', 470, 36);
      g.fillStyle = st.msgT > 0 ? '#ffb02e' : '#8f98c8'; g.fillText(st.msgT > 0 ? st.msg : 'Spuren im Fenster: ' + (st.good || 0) + ' / ' + c.n, 480, 80);
      for (let i = 0; i < c.n; i++) {
        const T = TRACKS[i], x0 = 30 + i * w, o = out(st, i), inside = Math.abs(o - T.target) <= c.tol;
        g.fillStyle = i === st.sel ? '#1f2850' : '#161b38'; g.fillRect(x0 + 4, 96, w - 8, 430);
        if (i === st.sel) { g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.strokeRect(x0 + 4, 96, w - 8, 430); }
        g.fillStyle = T.col; g.font = '600 20px system-ui'; g.textAlign = 'center'; g.fillText(T.name, x0 + w / 2, 124);
        // Pegelanzeige mit Fenster
        const mx = x0 + w * 0.18, mw = w * 0.26;
        g.fillStyle = '#0b0f22'; g.fillRect(mx, TOP, mw, HGT);
        g.fillStyle = 'rgba(110,240,255,.22)';
        const yHi = BOT - (T.target + c.tol) / SCALE * HGT, yLo = BOT - (T.target - c.tol) / SCALE * HGT;
        g.fillRect(mx - 6, yHi, mw + 12, yLo - yHi);
        const lv = Math.min(o, SCALE);
        g.fillStyle = o > CLIP ? '#ff4d6d' : inside ? '#4be08a' : '#ffc84a';
        g.fillRect(mx, BOT - lv / SCALE * HGT, mw, lv / SCALE * HGT);
        g.strokeStyle = '#ff4d6d'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx - 6, BOT - CLIP / SCALE * HGT); g.lineTo(mx + mw + 6, BOT - CLIP / SCALE * HGT); g.stroke();
        // Fader
        const fx = faderX(st, i), fy = BOT - st.fad[i] * HGT;
        g.fillStyle = '#2a3160'; g.fillRect(fx - 4, TOP, 8, HGT);
        g.fillStyle = i === st.sel ? '#ffb02e' : '#cfd6ff'; g.fillRect(fx - 24, fy - 12, 48, 24);
        g.fillStyle = '#10142a'; g.fillRect(fx - 20, fy - 2, 40, 4);
        g.fillStyle = inside ? '#4be08a' : '#cfd6ff'; g.font = '600 18px system-ui';
        g.fillText(Math.round(o * 100) + ' %', x0 + w / 2, 470);
        if (st.flash === i && st.msgT > 0) { g.fillStyle = '#ffb02e'; g.fillText('⚡', x0 + w / 2, 500); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
