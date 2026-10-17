/* P04 Studio-Störungssuche: Die Signalkette vom Mikro bis zum Kopfhörer hat einen (Profi: zwei) Defekt(e).
   Messpunkte zeigen „Signal ok“ oder „kein Signal“ am Ausgang eines Geräts. Mit wenigen Messungen eingrenzen,
   dann das defekte Teil tauschen. Falscher Tausch, leerer Messgeräte-Akku oder Zeitablauf machen es teuer. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  // [Name, Icon, Eltern-Index, Spalte, Zeile] – Zeile 1 läuft von rechts nach links (Schlange)
  const CHAINS = [
    [['Mikro', '🎙️', -1, 0, 0], ['XLR-Kabel', '〰️', 0, 1, 0], ['Interface', '🎛️', 1, 2, 0], ['Mischpult', '🎚️', 2, 3, 0], ['Rechner', '💻', 3, 4, 0], ['Kopfhörer', '🎧', 4, 4, 1]],
    [['Mikro', '🎙️', -1, 0, 0], ['XLR-Kabel', '〰️', 0, 1, 0], ['Vorverstärker', '📶', 1, 2, 0], ['Interface', '🎛️', 2, 3, 0], ['USB-Kabel', '🔌', 3, 4, 0],
      ['Rechner', '💻', 4, 4, 1], ['Mischpult', '🎚️', 5, 3, 1], ['KH-Verstärker', '🔊', 6, 2, 1], ['Kopfhörer', '🎧', 7, 1, 1]],
    [['Mikro', '🎙️', -1, 0, 0], ['XLR-Kabel', '〰️', 0, 1, 0], ['Vorverstärker', '📶', 1, 2, 0], ['Interface', '🎛️', 2, 3, 0], ['USB-Kabel', '🔌', 3, 4, 0],
      ['Rechner', '💻', 4, 4, 1], ['Mischpult', '🎚️', 5, 3, 1], ['KH-Verstärker', '🔊', 6, 2, 1], ['Klinke Marco', '〰️', 7, 1, 1], ['KH Marco', '🎧', 8, 0, 1],
      ['Klinke Andrew', '〰️', 7, 1, 2], ['KH Andrew', '🎧', 10, 0, 2]]
  ];
  const CFG = [ // Locker, Standard, Profi
    { defects: 1, budget: 5, time: 60, err: 2 },
    { defects: 1, budget: 5, time: 70, err: 1 },
    { defects: 2, budget: 9, time: 90, err: 1 }
  ];
  const PROBE = 0.9, BTN_M = { x: 290, y: 456, w: 180, h: 60 }, BTN_T = { x: 490, y: 456, w: 180, h: 60 };
  const nx = n => 40 + n[3] * 180 + 80, ny = n => 150 + n[4] * 110;
  const inBox = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  function sig(st, i) { for (; i >= 0; i = st.nodes[i][2]) if (st.def[i]) return false; return true; }
  function say(st, m, t) { st.msg = m; st.msgT = t || 2.5; }
  function measure(st) {
    if (st.probe) return;
    if (st.used >= st.cfg.budget) { MG.fx(st, 'buzz'); say(st, 'Messgeräte-Akku leer! Jetzt hilft nur noch Köpfchen.'); return; }
    st.used++; st.probe = { i: st.cur, t: PROBE }; MG.fx(st, 'beep');
  }
  function swap(st) {
    if (st.probe) return;
    const i = st.cur;
    if (st.def[i]) {
      st.def[i] = false; st.fixed++; st.meas = st.meas.map(() => 0); MG.fx(st, 'good');
      if (st.fixed >= st.cfg.defects) { say(st, st.nodes[i][0] + ' getauscht – es rauscht nicht mehr, es klingt!'); MG.finish(st, true); }
      else say(st, st.nodes[i][0] + ' war kaputt! Aber irgendwo hakt es noch …', 3);
    } else {
      st.err++; st.t += 6; MG.fx(st, 'bad'); say(st, st.nodes[i][0] + ' war heil – Ersatzteil verschwendet (−6 s).');
      if (st.err > st.cfg.err) MG.finish(st, false);
    }
  }
  MG.define({
    id: 'P04', group: 'produktion', name: 'Studio-Störungssuche', icon: '🔍',
    short: 'Signalkette durchmessen, defektes Teil eingrenzen und tauschen.',
    rules: [
      'Irgendwo in der Signalkette ist ein Gerät defekt (Profi: zwei).',
      'Messen zeigt am Ausgang eines Geräts „Signal ok“ oder „kein Signal“.',
      'Der Messgeräte-Akku reicht nur für wenige Messungen – clever eingrenzen!',
      'Tauschen repariert ein defektes Teil; ein heiles Teil tauschen ist ein Fehler.',
      'Alles repariert = gewonnen. Zu viele Fehltausche oder Zeit abgelaufen = verloren.'
    ],
    controls: { key: 'Pfeile: Gerät wählen, Leertaste: messen, E: tauschen', touch: 'Gerät antippen, dann Messen oder Tauschen', pad: 'Steuerkreuz, A messen, B tauschen' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const d = o.difficulty | 0, c = CFG[d], nodes = CHAINS[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, nodes, t: 0, cur: 0, used: 0, err: 0, fixed: 0, probe: null,
        def: nodes.map(() => false), meas: nodes.map(() => 0), msg: 'Kein Ton im Kopfhörer! Finde den Übeltäter.', msgT: 3 };
      const order = PT.shuffle(st, nodes.map((n, i) => i));
      for (let k = 0; k < c.defects; k++) st.def[order[k]] = true;
      st.leaves = nodes.map((n, i) => i).filter(i => !nodes.some(m => m[2] === i));
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const n = st.nodes.length;
      if (a.type === 'key' && a.down) {
        if (a.key === 'right' || a.key === 'down') { st.cur = (st.cur + 1) % n; MG.fx(st, 'tick'); }
        else if (a.key === 'left' || a.key === 'up') { st.cur = (st.cur + n - 1) % n; MG.fx(st, 'tick'); }
        else if (a.key === 'a') measure(st);
        else if (a.key === 'b') swap(st);
      } else if (a.type === 'pointer' && a.phase === 'down') {
        if (inBox(BTN_M, a.x, a.y)) return measure(st);
        if (inBox(BTN_T, a.x, a.y)) return swap(st);
        for (let i = 0; i < n; i++) if (Math.abs(a.x - nx(st.nodes[i])) < 82 && Math.abs(a.y - ny(st.nodes[i])) < 42) { st.cur = i; MG.fx(st, 'tick'); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.msgT -= dt;
      if (st.probe && (st.probe.t -= dt) <= 0) {
        const i = st.probe.i, ok = sig(st, i); st.meas[i] = ok ? 1 : -1; st.probe = null;
        MG.fx(st, ok ? 'good' : 'buzz'); say(st, 'Ausgang ' + st.nodes[i][0] + ': ' + (ok ? 'Signal ok ✓' : 'kein Signal ✗'));
      }
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won', left = Math.max(0, c.time - st.t);
      const score = won ? PT.clamp(Math.round(50 + 25 * left / c.time + 25 * (c.budget - st.used) / c.budget - st.err * 8), 50, 100) : PT.clamp(Math.round(40 * st.fixed / c.defects), 0, 49);
      return { won, score, detail: won ? 'Repariert mit ' + st.used + ' Messungen und ' + st.err + ' Fehltauschen.' : 'Störung nicht behoben: ' + st.fixed + ' von ' + c.defects + ' Defekten gefunden.' };
    },
    bot(st, goal) {
      let target = st.def.indexOf(true);
      if (goal === 'lose') target = st.def.indexOf(false);
      if (st.cur !== target) return [{ type: 'key', key: st.cur < target ? 'right' : 'left', down: true }];
      return [{ type: 'key', key: 'b', down: true }];
    },
    draw2d(g, st) {
      const c = st.cfg, nodes = st.nodes;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('🔍 Studio-Störungssuche', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText('🔋 ' + (c.budget - st.used) + '   Fehler ' + st.err + '/' + c.err + '   ⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 936, 36);
      g.font = '18px system-ui'; g.textAlign = 'center'; g.fillStyle = st.msgT > 0 ? '#ffb02e' : '#8f98c8';
      g.fillText(st.msgT > 0 ? st.msg : 'Ziel: ' + c.defects + (c.defects > 1 ? ' Defekte' : ' Defekt') + ' finden · repariert ' + st.fixed, 480, 80);
      g.lineWidth = 4;
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i][2]; if (p < 0) continue;
        g.strokeStyle = st.meas[p] === 1 ? '#4be08a' : st.meas[p] === -1 ? '#ff4d6d' : '#3a4380';
        g.beginPath(); g.moveTo(nx(nodes[p]), ny(nodes[p])); g.lineTo(nx(nodes[i]), ny(nodes[i])); g.stroke();
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i], x = nx(n), y = ny(n), m = st.meas[i];
        g.fillStyle = '#1d2342'; g.fillRect(x - 78, y - 38, 156, 76);
        g.lineWidth = 3; g.strokeStyle = m === 1 ? '#4be08a' : m === -1 ? '#ff4d6d' : '#3a4380'; g.strokeRect(x - 78, y - 38, 156, 76);
        g.fillStyle = '#ffffff'; g.font = '22px system-ui'; g.fillText(n[1], x, y - 6);
        g.font = '600 18px system-ui'; g.fillText(n[0], x, y + 24);
        if (m) { g.fillStyle = m === 1 ? '#4be08a' : '#ff4d6d'; g.fillText(m === 1 ? '✓' : '✗', x + 64, y - 14); }
        if (st.leaves.indexOf(i) >= 0) { const s = sig(st, i); g.fillStyle = s ? '#4be08a' : '#ff4d6d'; g.fillText(s ? 'hört Ton' : 'hört nichts', x, y + 58); }
        if (i === st.cur) { g.strokeStyle = '#ffb02e'; g.lineWidth = 4; g.strokeRect(x - 84, y - 44, 168, 88); }
      }
      if (st.probe) {
        const n = nodes[st.probe.i], k = 1 - st.probe.t / PROBE;
        g.fillStyle = '#6ef0ff'; g.beginPath(); g.arc(nx(n) + 78, ny(n), 6 + 6 * Math.sin(k * 12), 0, 6.283); g.fill();
      }
      g.fillStyle = st.used < c.budget ? '#2a5c9e' : '#33384f'; g.fillRect(BTN_M.x, BTN_M.y, BTN_M.w, BTN_M.h);
      g.fillStyle = '#9e3a4f'; g.fillRect(BTN_T.x, BTN_T.y, BTN_T.w, BTN_T.h);
      g.fillStyle = '#ffffff'; g.font = '600 20px system-ui';
      g.fillText('📏 Messen', BTN_M.x + 90, BTN_M.y + 38); g.fillText('🔧 Tauschen', BTN_T.x + 90, BTN_T.y + 38);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
