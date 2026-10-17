/* R02 Bahnhofsplanung: Das Podcast-Team reist mit Technikkoffern zum Interview. Für jeden Abschnitt einen Zug wählen –
   Abfahrten, Gleise, Umsteigezeiten und Verspätungsmeldungen kombinieren. Jedes Rätsel hat genau eine Lösung. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const STATIONS = ['Funkstadt Hbf', 'Kabelbrück', 'Mikrofonhausen', 'Pegelsdorf', 'Echoburg', 'Wellenau', 'Hallingen', 'Studioheim', 'Rauschtal', 'Senderberg'];
  const CFG = [
    { time: 100, rounds: [2, 2], errs: 2, same: 2, diff: 4, delayOnCard: true, lift: false },
    { time: 110, rounds: [2, 3, 3], errs: 2, same: 2, diff: 5, delayOnCard: false, lift: false },
    { time: 100, rounds: [3, 3, 3], errs: 1, same: 2, diff: 5, delayOnCard: false, lift: true }
  ];
  function need(c, pz, a, b) { // Umsteigezeit von Gleis a nach Gleis b
    if (a === b) return c.same;
    return c.diff + (pz.lift && (a === pz.lift || b === pz.lift) ? 3 : 0);
  }
  function check(c, pz, ch) { // → { ok, why }
    let t = pz.now, plat = 0;
    for (let i = 0; i < pz.legs.length; i++) {
      const z = pz.legs[i][ch[i]], dep = z.dep + z.delay;
      if (i === 0 && dep < t) return { ok: false, why: z.name + ' fährt ' + PT.timeStr(dep) + ' – da steht ihr noch nicht am Bahnsteig.' };
      if (i > 0) { const n = need(c, pz, plat, z.gl); if (dep - t < n) return { ok: false, why: 'Umstieg in ' + pz.st[i] + ': nur ' + Math.max(0, dep - t) + ' Min, nötig ' + n + ' Min.' }; }
      t = z.arr + z.delay; plat = z.gl2;
    }
    if (t > pz.dead) return { ok: false, why: 'Ankunft ' + PT.timeStr(t) + ' – zu spät für das Interview um ' + PT.timeStr(pz.dead) + '.' };
    return { ok: true, why: '' };
  }
  function combos(n, f) { const ch = new Array(n).fill(0); for (;;) { f(ch.slice()); let i = n - 1; while (i >= 0 && ++ch[i] > 3) ch[i--] = 0; if (i < 0) return; } }
  function makePuzzle(st, c, n, d) {
    const names = PT.shuffle(st, STATIONS).slice(0, n + 1), used = {};
    const train = (dep, dur, gl, gl2, delay) => { let num; do num = PT.randInt(st, 10, 99); while (used[num]); used[num] = 1; return { name: (PT.rand(st) < 0.55 ? 'RA ' : 'FB ') + num, dep, arr: dep + dur, gl, gl2, delay }; };
    const pz = { st: names, now: 7 * 60 + PT.randInt(st, 0, 30) * 5, legs: [], lift: c.lift ? PT.randInt(st, 1, 6) : 0 };
    let t = pz.now, plat = 0; const sol = [];
    for (let i = 0; i < n; i++) {
      const gl = PT.randInt(st, 1, 6), delay = d > 0 && PT.rand(st) < 0.3 ? PT.randInt(st, 2, 6) : 0;
      const eff = i === 0 ? t + PT.randInt(st, 3, 10) : t + need(c, pz, plat, gl) + PT.randInt(st, 0, 3);
      const z = train(eff - delay, PT.randInt(st, 16, 36), gl, PT.randInt(st, 1, 6), delay);
      sol.push(z); t = z.arr + z.delay; plat = z.gl2;
    }
    pz.dead = t + PT.randInt(st, 2, 6);
    const distr = (z, late) => {
      const base = z.dep + z.delay, kind = PT.randInt(st, 0, 3);
      let dep = base + PT.randInt(st, -14, 22), delay = d > 0 && PT.rand(st) < 0.35 ? PT.randInt(st, 3, 9) : 0;
      if (kind === 0) dep = base - PT.randInt(st, 1, 5); // knapp zu früh
      if (kind === 1 && d > 0) { dep = base - PT.randInt(st, 1, 4); delay = PT.randInt(st, 4, 9); } // sieht gut aus, ist aber verspätet
      if (late) { dep = pz.dead + PT.randInt(st, 1, 15); delay = 0; } // Notlösung: zu spät
      return train(dep, PT.randInt(st, 14, 38), PT.randInt(st, 1, 6), PT.randInt(st, 1, 6), delay);
    };
    pz.legs = sol.map(z => [z, distr(z), distr(z), distr(z)]);
    for (let tries = 0; ; tries++) { // so lange einzelne Ablenkzüge neu würfeln, bis die Lösung eindeutig ist
      let alt = null; combos(n, ch => { if (!alt && ch.some(v => v) && check(c, pz, ch).ok) alt = ch; });
      if (!alt) break;
      const ks = alt.map((v, k) => v ? k : -1).filter(k => k >= 0), k = PT.pick(st, ks);
      delete used[+pz.legs[k][alt[k]].name.slice(3)];
      pz.legs[k][alt[k]] = distr(sol[k], tries > 300);
    }
    pz.legs = pz.legs.map(l => l.slice().sort((a, b) => a.dep - b.dep || (a.name < b.name ? -1 : 1)));
    combos(n, ch => { if (check(c, pz, ch).ok) pz.sol = ch; });
    return pz;
  }
  function layout(n) { const w = (920 - (n - 1) * 16) / n; return { w, x: i => 20 + i * (w + 16), y: r => 134 + r * 64 }; }
  function confirm(st) {
    const pz = st.pz[st.round];
    if (st.sel.some(v => v < 0)) { st.msg = 'Erst für jeden Abschnitt einen Zug wählen.'; st.msgOk = false; MG.fx(st, 'buzz'); return; }
    const r = check(st.cfg, pz, st.sel);
    if (r.ok) {
      MG.fx(st, 'coin'); st.fx.push({ recipe: { parts: [{ wave: 'sine', f: 660, t: 0, d: 0.15, v: 0.4 }, { wave: 'sine', f: 880, t: 0.15, d: 0.25, v: 0.4 }] } });
      st.round++; st.msg = 'Passt! Alle Koffer kommen pünktlich an.'; st.msgOk = true;
      if (st.round >= st.pz.length) MG.finish(st, true); else { st.sel = st.pz[st.round].legs.map(() => -1); st.cur = { col: 0, row: 0 }; }
    } else {
      st.errs++; st.msg = r.why; st.msgOk = false; MG.fx(st, 'bad'); st.sel = st.sel.map(() => -1); st.cur = { col: 0, row: 0 };
      if (st.errs > st.cfg.errs) MG.finish(st, false);
    }
  }
  function choose(st, col, row) { st.sel[col] = row; MG.fx(st, 'click'); const n = st.sel.length; st.cur = col < n - 1 ? { col: col + 1, row } : { col, row: 4 }; }
  MG.define({
    id: 'R02', group: 'roadtrip', name: 'Bahnhofsplanung', icon: '🚆',
    short: 'Finde mit Funkbahn und Regio-Anmacher die einzige Verbindung, die pünktlich zum Interview führt.',
    rules: [
      'Wähle für jeden Abschnitt genau einen Zug – die Technikkoffer reisen mit.',
      'Umsteigen braucht Zeit: gleiches Gleis geht schnell, Gleiswechsel dauert länger.',
      'Verspätungsmeldungen verschieben Abfahrt und Ankunft eines Zuges.',
      'Nur eine Verbindung erreicht den Termin. Falsche Wahl = Fehler, zu viele Fehler oder Zeit um = verloren.'
    ],
    goal: d => 'Finde in ' + CFG[d].rounds.length + ' Rätseln jeweils die einzige Zugverbindung, die pünktlich zum Interview kommt – in ' + CFG[d].time + ' s, höchstens ' + CFG[d].errs + ' Fehler.',
    how: [
      'Jede Spalte ist ein Reiseabschnitt (z. B. „1: A → B“). Tippe pro Spalte genau einen Zug an.',
      'Der erste Zug muss nach „Jetzt“ abfahren. Beim Umsteigen brauchst du Zeit: Ankunft + Umstiegszeit (steht oben) ≤ nächste Abfahrt.',
      'Gleiches Gleis (Gl.) = schneller Umstieg, anderes Gleis = länger. Verspätungen (📢 / rote Zahl) verschieben Ab- und Ankunft.',
      'Letzte Ankunft spätestens zur Interview-Zeit. Dann „Losfahren ▶“ – falsche Verbindung = Fehler.'
    ],
    tip: { key: 'Pfeile + Leertaste: je Spalte einen Zug wählen, dann „Losfahren ▶“', touch: 'Tippe in jeder Spalte einen Zug an, dann „Losfahren ▶“', y: 300 },
    controls: { key: 'Pfeile wählen, Leertaste nimmt den Zug, ganz unten „Losfahren“; Q löscht', touch: 'In jeder Spalte einen Zug antippen, dann „Losfahren ▶“', mouse: 'In jeder Spalte einen Zug anklicken, dann „Losfahren ▶“', pad: 'Steuerkreuz, A wählen, B löschen' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, errs: 0, round: 0, msg: '', msgOk: true, cur: { col: 0, row: 0 } };
      st.pz = c.rounds.map(n => makePuzzle(st, c, n, d));
      st.sel = st.pz[0].legs.map(() => -1);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const n = st.sel.length, cu = st.cur;
      if (a.type === 'key' && a.down) {
        if (a.key === 'left' && cu.row < 4) cu.col = Math.max(0, cu.col - 1);
        else if (a.key === 'right' && cu.row < 4) cu.col = Math.min(n - 1, cu.col + 1);
        else if (a.key === 'up') cu.row = Math.max(0, cu.row - 1);
        else if (a.key === 'down') cu.row = Math.min(4, cu.row + 1);
        else if (a.key === 'a') { if (cu.row === 4) confirm(st); else choose(st, cu.col, cu.row); }
        else if (a.key === 'b') { if (cu.row < 4) st.sel[cu.col] = -1; else st.sel = st.sel.map(() => -1); MG.fx(st, 'click'); }
        else if (/^[1-4]$/.test(a.key) && cu.row < 4) choose(st, cu.col, +a.key - 1);
      }
      if (a.type === 'pointer' && a.phase === 'down') {
        const L = layout(n);
        if (a.x >= 640 && a.y >= 468 && a.y <= 524) { st.cur = { col: cu.col, row: 4 }; confirm(st); return; }
        for (let i = 0; i < n; i++) for (let r = 0; r < 4; r++)
          if (a.x >= L.x(i) && a.x <= L.x(i) + L.w && a.y >= L.y(r) && a.y <= L.y(r) + 58) choose(st, i, r);
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      const left = st.cfg.time - st.t;
      if (left < 10 && Math.floor(left + dt) !== Math.floor(left)) MG.fx(st, 'tick');
      if (left <= 0) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg;
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 40 * (1 - st.t / c.time) + 10 * (1 - st.errs / (c.errs + 1)), 50, 100)), detail: 'Alle ' + st.pz.length + ' Reisen geplant – mit ' + st.errs + ' Fehlern.' };
      return { won: false, score: Math.round(PT.clamp(40 * st.round / st.pz.length, 0, 49)), detail: (st.errs > c.errs ? 'Zu viele falsche Verbindungen (' + st.errs + ', erlaubt ' + c.errs + ')' : 'Die Zeit am Fahrkartenschalter ist abgelaufen') + ' – ' + st.round + ' von ' + st.pz.length + ' Reisen geplant.' };
    },
    bot(st, goal) {
      const pz = st.pz[st.round], n = st.sel.length, cu = st.cur;
      if (goal === 'lose') {
        let bad = null; combos(n, ch => { if (!bad && !check(st.cfg, pz, ch).ok) bad = ch; });
        if (!bad) return [];
        const L = layout(n), i = st.sel.findIndex((v, k) => v !== bad[k]);
        return [i < 0 ? { type: 'pointer', phase: 'down', x: 780, y: 495 } : { type: 'pointer', phase: 'down', x: L.x(i) + 20, y: L.y(bad[i]) + 20 }];
      }
      const i = st.sel.findIndex((v, k) => v !== pz.sol[k]), key = k => [{ type: 'key', key: k, down: true }];
      if (i < 0) return cu.row < 4 ? key('down') : key('a');
      if (cu.row === 4) return key('up');
      if (cu.col !== i) return key(cu.col < i ? 'right' : 'left');
      if (cu.row !== pz.sol[i]) return key(cu.row < pz.sol[i] ? 'down' : 'up');
      return key('a');
    },
    draw2d(g, st) {
      const c = st.cfg, pz = st.pz[Math.min(st.round, st.pz.length - 1)], n = pz.legs.length, L = layout(n), cu = st.cur;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.fillStyle = '#fff'; g.font = '700 24px system-ui'; g.textAlign = 'left';
      g.fillText('🚆 Rätsel ' + Math.min(st.round + 1, st.pz.length) + ' / ' + st.pz.length, 20, 34);
      g.textAlign = 'center'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#ffb02e'; g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 480, 34);
      g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText('Fehler: ' + st.errs + ' / ' + c.errs, 900, 34);
      g.font = '600 20px system-ui'; g.textAlign = 'left'; g.fillStyle = '#cfd6ff';
      g.fillText('Jetzt ' + PT.timeStr(pz.now) + ' in ' + pz.st[0] + ' · Ziel: Interview in ' + pz.st[n] + ' um ' + PT.timeStr(pz.dead), 20, 64);
      g.font = '18px system-ui'; g.fillStyle = '#6ef0ff';
      g.fillText('Umstieg: gleiches Gleis ' + c.same + ' Min · Gleiswechsel ' + c.diff + ' Min (mit Koffern)', 20, 92);
      for (let i = 0; i < n; i++) {
        const x = L.x(i);
        g.fillStyle = '#cfd6ff'; g.font = '600 18px system-ui'; g.fillText((i + 1) + ': ' + pz.st[i] + ' → ' + pz.st[i + 1], x, 124);
        for (let r = 0; r < 4; r++) {
          const z = pz.legs[i][r], y = L.y(r), on = st.sel[i] === r, cur = cu.row === r && cu.col === i;
          g.fillStyle = on ? '#2f5d4a' : '#1d2342'; g.fillRect(x, y, L.w, 58);
          if (on) { g.strokeStyle = '#4be08a'; g.lineWidth = 3; g.strokeRect(x + 1, y + 1, L.w - 2, 56); }
          if (cur) { g.strokeStyle = '#ffb02e'; g.lineWidth = 4; g.strokeRect(x - 3, y - 3, L.w + 6, 64); }
          g.fillStyle = z.name[0] === 'F' ? '#ff4d6d' : '#6ef0ff'; g.font = '700 18px system-ui'; g.fillText(z.name, x + 10, y + 24);
          g.fillStyle = '#fff'; g.font = '18px system-ui';
          g.fillText('ab ' + PT.timeStr(z.dep) + '  Gl. ' + z.gl, x + 70, y + 24);
          g.fillText('an ' + PT.timeStr(z.arr) + '  Gl. ' + z.gl2, x + 70, y + 48);
          if (c.delayOnCard && z.delay) { g.fillStyle = '#ff4d6d'; g.font = '700 18px system-ui'; g.fillText('+' + z.delay, x + 10, y + 48); }
        }
      }
      const notes = [];
      if (!c.delayOnCard) pz.legs.forEach(l => l.forEach(z => { if (z.delay) notes.push(z.name + ' +' + z.delay + ' Min'); }));
      g.font = '18px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffc84a';
      if (notes.length) { g.fillText('📢 Heute: ' + notes.slice(0, 5).join(' · '), 20, 418); if (notes.length > 5) g.fillText('     ' + notes.slice(5).join(' · '), 20, 442); }
      else if (c.delayOnCard) g.fillText('📢 Rote Zahl = Verspätung in Minuten (gilt für Ab- und Ankunft).', 20, 418);
      if (pz.lift) { g.fillStyle = '#ff4d6d'; g.fillText('🛗 Aufzug an Gleis ' + pz.lift + ' defekt: Gleiswechsel von/zu Gleis ' + pz.lift + ' +3 Min', 20, 466); }
      g.fillStyle = st.msgOk ? '#4be08a' : '#ff4d6d'; g.font = '600 18px system-ui';
      const m = st.msg, cut = m.length > 56 ? m.lastIndexOf(' ', 56) : m.length;
      if (m) { g.fillText(m.slice(0, cut), 20, 496); g.fillText(m.slice(cut + 1), 20, 520); }
      const full = st.sel.every(v => v >= 0);
      if (!m) { g.fillStyle = '#cfd6ff'; g.fillText(full ? 'Alle Abschnitte gewählt → „Losfahren ▶“' : 'Gewählt: ' + st.sel.filter(v => v >= 0).length + ' von ' + n + ' Abschnitten – tippe je Spalte einen Zug', 20, 508); }
      g.fillStyle = full ? '#4be08a' : '#2a3050'; g.fillRect(640, 468, 300, 56);
      if (cu.row === 4) { g.strokeStyle = '#ffb02e'; g.lineWidth = 4; g.strokeRect(636, 464, 308, 64); }
      g.fillStyle = full ? '#10142a' : '#8890b8'; g.font = '700 24px system-ui'; g.textAlign = 'center'; g.fillText('Losfahren ▶', 790, 504);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
