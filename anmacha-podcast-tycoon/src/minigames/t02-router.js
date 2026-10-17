/* T02 Routerpakete: Datenpakete mit Zieladresse laufen von links durch einen Baum aus Weichen (Routern).
   Jede Weiche zeigt nach oben oder unten; umschalten, bevor ein Paket ankommt, damit es im richtigen
   Netzsegment landet. Falsch zugestellte Pakete zählen als Fehler. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const SEGS = [
    ['Studio', 'Schnitt', 'Regie', 'Archiv'],
    ['Studio A', 'Studio B', 'Schnittplatz', 'Regie', 'Archiv', 'Gästelounge', 'Kaffeeküche', 'Spamfilter']
  ];
  const COLS = ['#ffb02e', '#6ef0ff', '#ff4d6d', '#4be08a', '#c89bff', '#ff8fb0', '#f5e663', '#8f98c8'];
  const CFG = [ // Locker, Standard, Profi
    { d: 2, speed: 105, spawn: 3.4, need: 12, err: 4 },
    { d: 3, speed: 120, spawn: 3.0, need: 15, err: 3 },
    { d: 3, speed: 150, spawn: 2.4, need: 18, err: 2 }
  ];
  // Knoten: 0 = Quelle, 1 .. 2^d-1 = Weichen (Heap-Ordnung), 2^d .. 2^(d+1)-1 = Segmente
  const lvl = k => 31 - Math.clz32(k);
  function pos(d, k) {
    if (k === 0) return [40, 310];
    const l = lvl(k), i = k - (1 << l);
    return [170 + l * 570 / d, 100 + (i + 0.5) * 420 / (1 << l)];
  }
  const elen = (d, a, b) => { const p = pos(d, a), q = pos(d, b); return Math.hypot(q[0] - p[0], q[1] - p[1]); };
  function dirFor(d, k, dest) { // 0 = oben, 1 = unten, -1 = Ziel nicht unter dieser Weiche
    let n = (1 << d) + dest;
    while (n > 1 && (n >> 1) !== k) n >>= 1;
    return n > 1 ? n & 1 : -1;
  }
  function toggle(st, k) { st.set[k] ^= 1; st.cur = k; MG.fx(st, 'click'); }
  MG.define({
    id: 'T02', group: 'tec', name: 'Routerpakete', icon: '📦',
    short: 'Weichen schalten, damit jedes Datenpaket im richtigen Netzsegment ankommt.',
    rules: [
      'Pakete mit Zieladresse fließen von links durch die Weichen.',
      'Jede Weiche schickt Pakete nach oben oder unten – umschalten, bevor eins ankommt.',
      'Die Farbe und Nummer des Pakets zeigen sein Zielsegment rechts.',
      'Genug Pakete richtig zugestellt = gewonnen. Zu viele Fehlzustellungen = verloren.'
    ],
    goal: d => 'Stelle ' + CFG[d].need + ' Pakete richtig zu – bei mehr als ' + CFG[d].err + ' verirrten Paketen ist das Spiel verloren.',
    how: [
      'Links kommen farbige Pakete mit einer Nummer. Die Nummer zeigt, wohin sie müssen (Liste rechts).',
      'Die gelben Kreise sind Weichen: ▲ schickt nach oben, ▼ nach unten. Antippen schaltet um.',
      'Rechts neben den Zielen siehst du, wo jedes Paket gerade landen würde: ✓ passt, ✗ falsch → Weiche umschalten!',
      'Erst umschalten, wenn das Paket davor durch ist.'
    ],
    tip: { key: 'Pfeile wählen eine Weiche, Leertaste schaltet ▲/▼ um', touch: 'Tippe die gelben Weichen ▲/▼ an, damit die Pakete zur richtigen Nummer fahren', y: 470 },
    controls: { key: 'Pfeile: Weiche wählen (weißer Ring), Leertaste: umschalten', touch: 'Gelbe Weiche antippen = umschalten', mouse: 'Gelbe Weiche anklicken = umschalten', pad: 'Steuerkreuz wählen, A umschalten' },
    touch: ['left', 'right', 'up', 'down', 'a'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, ok: 0, bad: 0, cur: 1, next: 1, pk: [], set: [0], msg: 'Pakete im Anflug!', msgT: 2, flash: [] };
      for (let k = 1; k < (1 << c.d); k++) st.set[k] = PT.randInt(st, 0, 1);
      for (let k = 0; k < (1 << c.d); k++) st.flash[k] = 0;
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const d = st.cfg.d, k = st.cur, l = lvl(k), i = k - (1 << l);
      if (a.type === 'key' && a.down) {
        if (a.key === 'a') toggle(st, k);
        else if (a.key === 'left' && k > 1) st.cur = k >> 1;
        else if (a.key === 'right' && l < d - 1) st.cur = 2 * k + st.set[k];
        else if (a.key === 'up' && i > 0) st.cur = k - 1;
        else if (a.key === 'down' && i < (1 << l) - 1) st.cur = k + 1;
      } else if (a.type === 'pointer' && a.phase === 'down') {
        for (let n = 1; n < (1 << d); n++) { const p = pos(d, n); if (Math.abs(a.x - p[0]) < 40 && Math.abs(a.y - p[1]) < 34) return toggle(st, n); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, d = c.d, leaf0 = 1 << d;
      st.t += dt; st.msgT -= dt;
      for (let k = 0; k < leaf0; k++) if (st.flash[k] > 0) st.flash[k] -= dt;
      if (st.t >= st.next) {
        st.pk.push({ dest: PT.randInt(st, 0, leaf0 - 1), from: 0, to: 1, p: 0 });
        st.next = st.t + c.spawn; MG.fx(st, 'pop');
      }
      for (let n = st.pk.length - 1; n >= 0; n--) {
        const q = st.pk[n];
        q.p += c.speed * dt / elen(d, q.from, q.to);
        if (q.p < 1) continue;
        if (q.to < leaf0) { q.from = q.to; q.to = 2 * q.to + st.set[q.to]; q.p = 0; continue; }
        const seg = q.to - leaf0, good = seg === q.dest;
        st.pk.splice(n, 1); st.flash[seg] = 0.6 * (good ? 1 : -1);
        if (good) { st.ok++; MG.fx(st, 'coin'); }
        else { st.bad++; MG.fx(st, 'bad'); st.msg = 'Paket für ' + SEGS[d - 2][q.dest] + ' landete in ' + SEGS[d - 2][seg] + '!'; st.msgT = 2.5; }
      }
      if (st.bad > c.err) MG.finish(st, false);
      else if (st.ok >= c.need) MG.finish(st, true);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won';
      const score = won ? PT.clamp(100 - st.bad * 12, 50, 100) : PT.clamp(Math.round(45 * st.ok / c.need), 0, 49);
      return { won, score, detail: won ? c.need + ' Pakete zugestellt, nur ' + st.bad + ' verirrt – das Netz schnurrt.' : st.bad + ' Pakete verirrt (erlaubt ' + c.err + '), nur ' + st.ok + ' von ' + c.need + ' richtig angekommen.' };
    },
    bot(st, goal) {
      const d = st.cfg.d, acts = [];
      for (let k = 1; k < (1 << d); k++) {
        let best = null;
        for (const q of st.pk) if (q.to === k && (!best || q.p > best.p)) best = q;
        if (!best) continue;
        const want = dirFor(d, k, best.dest);
        if (want < 0) continue;
        if ((st.set[k] === want) === (goal === 'lose')) { const p = pos(d, k); acts.push({ type: 'pointer', phase: 'down', x: p[0], y: p[1] }); }
      }
      return acts;
    },
    draw2d(g, st) {
      const c = st.cfg, d = c.d, leaf0 = 1 << d, names = SEGS[d - 2];
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('📦 Routerpakete', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText('Zugestellt ' + st.ok + ' / ' + c.need + '   Verirrt ' + st.bad + ' / ' + c.err, 900, 36);
      g.font = '18px system-ui'; g.textAlign = 'center'; g.fillStyle = st.msgT > 0 ? '#ff4d6d' : '#8f98c8';
      g.fillText(st.msgT > 0 ? st.msg : 'Paket-Nummer = Ziel rechts · Weichen ▲▼ antippen zum Umschalten', 470, 76);
      // Leitungen
      g.lineWidth = 3;
      const s = pos(d, 0), r = pos(d, 1);
      g.strokeStyle = '#3a4380'; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(r[0], r[1]); g.stroke();
      for (let k = 1; k < leaf0; k++) {
        const p = pos(d, k);
        for (let b = 0; b < 2; b++) {
          const q = pos(d, 2 * k + b), on = st.set[k] === b;
          g.strokeStyle = on ? '#6ef0ff' : '#2a3160'; g.lineWidth = on ? 5 : 3;
          g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
        }
      }
      // Segmente
      for (let k = 0; k < leaf0; k++) {
        const p = pos(d, leaf0 + k), h = Math.min(60, 420 / leaf0 - 6);
        g.fillStyle = st.flash[k] > 0 ? '#2f9e64' : st.flash[k] < 0 ? '#9e2f45' : '#1d2342'; g.fillRect(p[0], p[1] - h / 2, 200, h);
        g.fillStyle = COLS[k]; g.fillRect(p[0], p[1] - h / 2, 8, h);
        g.textAlign = 'left'; g.font = '600 18px system-ui'; g.fillText((k + 1) + ' ' + names[k], p[0] + 16, p[1] + 6);
      }
      // Weichen
      for (let k = 1; k < leaf0; k++) {
        const p = pos(d, k);
        g.fillStyle = '#ffb02e'; g.beginPath(); g.arc(p[0], p[1], 20, 0, 6.283); g.fill();
        g.fillStyle = '#10142a'; g.textAlign = 'center'; g.font = '600 20px system-ui'; g.fillText(st.set[k] ? '▼' : '▲', p[0], p[1] + 7);
        if (k === st.cur) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.beginPath(); g.arc(p[0], p[1], 27, 0, 6.283); g.stroke(); }
      }
      g.fillStyle = '#4be08a'; g.fillRect(s[0] - 22, s[1] - 22, 44, 44); g.fillStyle = '#10142a'; g.fillText('🌐', s[0], s[1] + 7);
      // Vorschau: wo landet jedes Paket mit den aktuellen Weichen?
      const hits = {};
      for (const q of st.pk) {
        let n = q.to; while (n < leaf0) n = 2 * n + st.set[n];
        const seg = n - leaf0, p = pos(d, n), h = Math.min(60, 420 / leaf0 - 6), k = hits[seg] = (hits[seg] || 0) + 1;
        const x = p[0] - 2 - 32 * k, ok = seg === q.dest;
        g.fillStyle = COLS[q.dest]; g.fillRect(x, p[1] - h / 2 + 4, 28, h - 8);
        g.fillStyle = '#10142a'; g.textAlign = 'center'; g.font = '600 16px system-ui'; g.fillText(String(q.dest + 1), x + 14, p[1] + 6);
        g.fillStyle = ok ? '#4be08a' : '#ff4d6d'; g.font = '800 18px system-ui'; g.fillText(ok ? '✓' : '✗', x + 14, p[1] - h / 2 + 2);
      }
      // Pakete
      for (const q of st.pk) {
        const a = pos(d, q.from), b = pos(d, q.to), x = a[0] + (b[0] - a[0]) * q.p, y = a[1] + (b[1] - a[1]) * q.p;
        g.fillStyle = COLS[q.dest]; g.fillRect(x - 17, y - 14, 34, 28);
        g.fillStyle = '#10142a'; g.font = '600 18px system-ui'; g.fillText(String(q.dest + 1), x, y + 6);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
