/* F04 Geschenkepacken: Fan-Bestellungen richtig zusammenstellen, den passenden Karton wählen und versenden.
   Kartons sind knapp und Leerraum muss mit begrenztem Füllmaterial ausgestopft werden – wer verschwenderisch packt,
   hat am Ende keinen passenden Karton oder kein Füllmaterial mehr. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const ITEMS = [
    { name: 'Tasse', icon: '☕', vol: 2 }, { name: 'T-Shirt', icon: '👕', vol: 2 }, { name: 'Sticker', icon: '🏷️', vol: 1 },
    { name: 'Poster', icon: '🖼️', vol: 3 }, { name: 'Plüsch-Mikro', icon: '🎤', vol: 3 }, { name: 'Anhänger', icon: '🔑', vol: 1 }
  ];
  const BOXES = [{ name: 'S', cap: 4 }, { name: 'M', cap: 7 }, { name: 'L', cap: 10 }];
  const CFG = [
    { n: 6, maxItems: 3, time: 95, errs: 3, extra: [1, 1, 1], slack: 8 },
    { n: 8, maxItems: 4, time: 90, errs: 2, extra: [0, 1, 0], slack: 4 },
    { n: 10, maxItems: 4, time: 85, errs: 1, extra: [0, 0, 0], slack: 1 }
  ];
  const FANS = ['Lotte', 'Hakan', 'Brigitte', 'Yusuf', 'Paula', 'Dariusz', 'Nele', 'Emre', 'Rosi', 'Finn', 'Ada', 'Willi'];
  // Knöpfe: Reihe 0 = Regal (6 Artikel), Reihe 1 = Kartons S/M/L, Leeren, Versenden
  const ROWS = [
    ITEMS.map((it, i) => ({ x: 20 + i * 155, y: 300, w: 145, h: 84 })),
    [{ x: 20, y: 400, w: 150, h: 84 }, { x: 180, y: 400, w: 150, h: 84 }, { x: 340, y: 400, w: 150, h: 84 }, { x: 500, y: 400, w: 150, h: 84 }, { x: 660, y: 400, w: 280, h: 84 }]
  ];

  const volOf = list => list.reduce((s, i) => s + ITEMS[i].vol, 0);
  const minBox = v => BOXES.findIndex(b => b.cap >= v);
  const same = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();
  function say(st, text, good) { st.msg = { text, good, t: 2 }; }

  function press(st, row, i) {
    if (row === 0) { st.packed.push(i); st.wob = 0.25; MG.fx(st, 'pop'); return; }
    if (i <= 2) {
      if (st.stock[i] <= 0) { say(st, 'Keine ' + BOXES[i].name + '-Kartons mehr da!', false); MG.fx(st, 'beep'); return; }
      st.box = i; MG.fx(st, 'click'); return;
    }
    if (i === 3) { st.packed = []; MG.fx(st, 'whoosh'); return; }
    ship(st);
  }
  function ship(st) {
    const o = st.orders[st.idx];
    if (st.box < 0) { say(st, 'Erst einen Karton wählen!', false); MG.fx(st, 'beep'); return; }
    const v = volOf(st.packed), cap = BOXES[st.box].cap, waste = cap - v;
    let err = '';
    if (!same(st.packed, o.items)) err = 'Falscher Inhalt – vergleiche mit der Bestellung!';
    else if (v > cap) err = 'Passt nicht – der Karton ist zu klein!';
    else if (waste > st.filler) err = 'Zu wenig Füllmaterial – das Paket klappert!';
    if (err) {
      st.errs++; say(st, err, false); MG.fx(st, 'bad');
      if (st.errs > st.cfg.errs) MG.finish(st, false);
      return;
    }
    st.stock[st.box]--; st.filler -= waste; st.done++;
    st.points += 20 + (waste === 0 ? 10 : 0);
    say(st, waste === 0 ? 'Perfekt gepackt – null Leerraum!' : 'Verschickt! (' + waste + ' Füllmaterial verbraucht)', true);
    st.fly = 1; MG.fx(st, 'coin');
    st.idx++; st.packed = []; st.box = -1;
    if (st.idx >= st.orders.length) MG.finish(st, true);
  }

  MG.define({
    id: 'F04', group: 'feelgood', name: 'Geschenkepacken', icon: '🎁',
    short: 'Fan-Pakete packen: richtiger Inhalt, passender Karton, sparsam mit Füllmaterial.',
    rules: [
      'Lege genau die bestellten Artikel in das Paket und wähle einen Karton (S = 4, M = 7, L = 10 Platz).',
      'Leerraum im Karton verbraucht Füllmaterial – davon und von den Kartons gibt es nur begrenzt viel.',
      'Falscher Inhalt, zu kleiner Karton oder fehlendes Füllmaterial beim Versenden = Fehler.',
      'Gewonnen, wenn alle Bestellungen vor Ablauf der Zeit verschickt sind. Zu viele Fehler = verloren.'
    ],
    goal: d => 'Pack und verschick alle ' + CFG[d].n + ' Fan-Bestellungen richtig – in ' + CFG[d].time + ' s, höchstens ' + CFG[d].errs + ' Fehler.',
    how: [
      'Links steht die Bestellung. Tippe die bestellten Artikel im Regal (mittlere Reihe) an – jeder Tipp legt einen ins Paket.',
      'Wähle unten einen Karton: S (Platz 4), M (7) oder L (10). Der Inhalt muss reinpassen.',
      'Tipp: kleinster passender Karton! Leerer Platz verbraucht Füllmaterial – davon gibt es wenig.',
      '„📦 Versenden“ schickt das Paket los. Falscher Inhalt, zu kleiner Karton oder kein Füllmaterial = Fehler.'
    ],
    tip: { key: 'Pfeile + Leertaste: Artikel ins Paket, dann Karton (1–3), dann 4 = versenden', touch: '1. Artikel antippen  2. Karton wählen  3. 📦 Versenden', y: 290 },
    controls: { key: 'Pfeile + Leertaste, E/Q = letzten Artikel raus, 1–3 Karton, 4 versenden', touch: 'Artikel, Karton und „📦 Versenden“ antippen', mouse: 'Artikel, Karton und „📦 Versenden“ anklicken', pad: 'Steuerkreuz + A, B = raus' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, packed: [], box: -1, done: 0, errs: 0, points: 0, row: 0, col: 0, msg: null, wob: 0, fly: 0 };
      st.orders = [];
      const need = [0, 0, 0]; let waste = 0;
      while (st.orders.length < c.n) {
        const k = PT.randInt(st, 2, c.maxItems), items = [];
        for (let i = 0; i < k; i++) items.push(PT.randInt(st, 0, ITEMS.length - 1));
        const v = volOf(items);
        if (v < 3 || v > 10) continue;
        const b = minBox(v); need[b]++; waste += BOXES[b].cap - v;
        st.orders.push({ fan: PT.pick(st, FANS), items: items.sort((a, b2) => a - b2) });
      }
      st.stock = need.map((n, i) => n + c.extra[i]);
      st.filler = waste + c.slack;
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (a.type === 'key' && a.down) {
        const k = a.key, len = ROWS[st.row].length;
        if (k === 'left') { st.col = (st.col + len - 1) % len; MG.fx(st, 'click'); }
        else if (k === 'right') { st.col = (st.col + 1) % len; MG.fx(st, 'click'); }
        else if (k === 'up' || k === 'down') { st.row ^= 1; st.col = Math.min(st.col, ROWS[st.row].length - 1); MG.fx(st, 'click'); }
        else if (k === 'a') press(st, st.row, st.col);
        else if (k === 'b') { if (st.packed.length) { st.packed.pop(); MG.fx(st, 'whoosh'); } }
        else if (k >= '1' && k <= '3') press(st, 1, +k - 1);
        else if (k === '4') press(st, 1, 4);
      } else if (a.type === 'pointer' && a.phase === 'down') {
        ROWS.forEach((row, r) => row.forEach((b, i) => {
          if (a.x >= b.x && a.x <= b.x + b.w && a.y >= b.y && a.y <= b.y + b.h) { st.row = r; st.col = i; press(st, r, i); }
        }));
        // Tippen auf einen Artikel im Paket nimmt ihn wieder heraus
        if (a.y >= 186 && a.y <= 236 && a.x >= 500 && a.x < 500 + st.packed.length * 44) { st.packed.splice(Math.floor((a.x - 500) / 44), 1); MG.fx(st, 'whoosh'); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.msg && (st.msg.t -= dt) <= 0) st.msg = null;
      st.wob = Math.max(0, st.wob - dt); st.fly = Math.max(0, st.fly - dt * 1.5);
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const won = st.status === 'won', c = st.cfg;
      const score = won ? 50 + Math.round(30 * (1 - st.errs / (c.errs + 1)) + 20 * Math.max(0, 1 - st.t / c.time)) : Math.round(45 * st.done / c.n);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49),
        detail: won ? 'Alle ' + c.n + ' Pakete verschickt, ' + st.errs + ' Fehler.' : 'Nur ' + st.done + ' von ' + c.n + ' Paketen verschickt' + (st.errs > c.errs ? ' – zu viele Fehler (' + st.errs + ', erlaubt ' + c.errs + ').' : ' – die Zeit war um.') };
    },
    bot(st, goal) {
      const tap = (r, i) => { const b = ROWS[r][i]; return [{ type: 'pointer', phase: 'down', x: b.x + 10, y: b.y + 10 }]; };
      if (goal === 'lose') return st.box < 0 ? tap(1, st.stock.findIndex(n => n > 0)) : tap(1, 4);
      const o = st.orders[st.idx], have = st.packed.slice();
      const missing = o.items.slice();
      for (const i of have) { const j = missing.indexOf(i); if (j < 0) return [{ type: 'key', key: 'b', down: true }]; missing.splice(j, 1); }
      if (missing.length) return tap(0, missing[0]);
      const v = volOf(o.items);
      const want = BOXES.findIndex((b, i) => b.cap >= v && st.stock[i] > 0 && b.cap - v <= st.filler);
      if (st.box !== want) return tap(1, want);
      return tap(1, 4);
    },
    draw2d(g, st) {
      const c = st.cfg, o = st.orders[Math.min(st.idx, st.orders.length - 1)];
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Paket ' + Math.min(st.idx + 1, c.n) + ' von ' + c.n + '   Fehler: ' + st.errs + ' von max. ' + c.errs + '   Füllmaterial: ' + st.filler, 20, 30);
      g.textAlign = 'right'; g.fillText('Zeit: ' + Math.max(0, Math.ceil(c.time - st.t)) + ' s', 900, 30);
      g.fillStyle = '#1d2342'; g.fillRect(20, 42, 920, 10);
      g.fillStyle = '#ffb02e'; g.fillRect(20, 42, 920 * Math.max(0, 1 - st.t / c.time), 10);
      // Bestellzettel
      g.fillStyle = '#f5ecd7'; g.fillRect(20, 66, 450, 220);
      g.fillStyle = '#5a4a3a'; g.font = '700 21px system-ui'; g.textAlign = 'left';
      g.fillText('Bestellung von ' + o.fan, 36, 96);
      const counts = {}; o.items.forEach(i => counts[i] = (counts[i] || 0) + 1);
      const haveC = {}; st.packed.forEach(i => haveC[i] = (haveC[i] || 0) + 1);
      Object.keys(counts).forEach((k, j) => {
        const ok = haveC[k] === counts[k];
        g.fillStyle = ok ? '#1f6b45' : '#1b1b2a'; g.font = '600 21px system-ui';
        g.fillText((ok ? '✓ ' : '• ') + counts[k] + '× ' + ITEMS[k].icon + ' ' + ITEMS[k].name + '  (Platz ' + ITEMS[k].vol + ')', 36, 132 + j * 32);
      });
      g.fillStyle = '#5a4a3a'; g.font = '600 19px system-ui';
      g.fillText('Platzbedarf: ' + volOf(o.items), 36, 272);
      // Packtisch
      const v = volOf(st.packed), cap = st.box >= 0 ? BOXES[st.box].cap : 0, dx = st.fly * 400;
      g.fillStyle = '#1a2040'; g.fillRect(490, 66, 450, 220);
      g.fillStyle = '#cfd6ff'; g.font = '600 20px system-ui';
      g.fillText(st.box >= 0 ? 'Karton ' + BOXES[st.box].name + ' (Platz ' + cap + ')' : 'Noch kein Karton gewählt', 506, 96);
      g.save(); g.beginPath(); g.rect(490, 66, 450, 220); g.clip();
      g.fillStyle = '#c99a5b'; g.fillRect(500 + dx, 116 + Math.sin(st.wob * 40) * 3, 420, 60);
      g.fillStyle = '#1d2342'; g.fillRect(506 + dx, 150, 408, 20);
      if (cap) { g.fillStyle = v > cap ? '#ff4d6d' : v === cap ? '#4be08a' : '#ffb02e'; g.fillRect(506 + dx, 150, 408 * Math.min(1, v / cap), 20); }
      g.fillStyle = '#10142a'; g.font = '700 18px system-ui'; g.fillText('Inhalt: ' + v + (cap ? ' / ' + cap : ''), 512 + dx, 140);
      g.restore();
      g.font = '30px system-ui';
      st.packed.forEach((it, i) => { if (i < 9) g.fillText(ITEMS[it].icon, 504 + i * 44, 226); });
      g.fillStyle = '#8890b8'; g.font = '500 18px system-ui'; g.fillText('Artikel antippen = wieder herausnehmen', 506, 270);
      // Knöpfe
      ROWS[0].forEach((b, i) => {
        g.fillStyle = '#1d2342'; g.fillRect(b.x, b.y, b.w, b.h);
        g.textAlign = 'center'; g.font = '30px system-ui'; g.fillStyle = '#ffffff'; g.fillText(ITEMS[i].icon, b.x + b.w / 2, b.y + 38);
        g.font = '600 18px system-ui'; g.fillStyle = '#cfd6ff'; g.fillText(ITEMS[i].name + ' · ' + ITEMS[i].vol, b.x + b.w / 2, b.y + 70);
      });
      const lab = ['S · Platz 4', 'M · Platz 7', 'L · Platz 10', 'Leeren', '📦 Versenden (4)'];
      ROWS[1].forEach((b, i) => {
        const dis = i <= 2 && st.stock[i] <= 0;
        g.fillStyle = i === 4 ? '#ffb02e' : i === st.box ? '#2c5a44' : dis ? '#272a3a' : '#1d2342'; g.fillRect(b.x, b.y, b.w, b.h);
        g.textAlign = 'center'; g.fillStyle = i === 4 ? '#10142a' : dis ? '#5a6080' : '#ffffff'; g.font = '700 21px system-ui';
        g.fillText(lab[i], b.x + b.w / 2, b.y + (i <= 2 ? 36 : 50));
        if (i <= 2) { g.font = '500 18px system-ui'; g.fillStyle = dis ? '#ff4d6d' : '#cfd6ff'; g.fillText('noch ' + st.stock[i] + ' (' + (i + 1) + ')', b.x + b.w / 2, b.y + 66); }
      });
      const sb = ROWS[st.row][st.col];
      g.strokeStyle = '#6ef0ff'; g.lineWidth = 4; g.strokeRect(sb.x - 3, sb.y - 3, sb.w + 6, sb.h + 6);
      if (st.msg) {
        g.fillStyle = st.msg.good ? '#4be08a' : '#ff4d6d'; g.font = '800 21px system-ui'; g.textAlign = 'center';
        g.fillText(st.msg.text, 480, 525);
      } else { // nächster Schritt
        g.fillStyle = '#cfd6ff'; g.font = '600 19px system-ui'; g.textAlign = 'center';
        g.fillText(!same(st.packed, o.items) ? 'Schritt 1: bestellte Artikel im Regal antippen' : st.box < 0 ? 'Schritt 2: passenden Karton wählen (S/M/L)' : 'Schritt 3: 📦 Versenden', 480, 525);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
