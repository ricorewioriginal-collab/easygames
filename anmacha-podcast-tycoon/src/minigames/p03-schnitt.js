/* P03 Schnitt-Challenge: Die Abschnitte der Folge liegen durcheinander auf der Timeline, dazwischen Versprecher-Takes.
   Clips vorhören, Versprecher in den Papierkorb, Rest nach Sendeplan sortieren und exportieren – bevor die Zeit abläuft. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const SEC = {
    'Intro': ['♪ Ta-daa! Fanfare mit Konfetti-Synthesizer.', null],
    'Begrüßung': ['„Hallo und herzlich willkommen im Studio!“', '„Hallo und herzlich … äh … wo war ich?“'],
    'Thema': ['„Heute: die hohe Kunst des perfekten Pausenbrots.“', '„Heute geht es um … Moment, Zettel verloren.“'],
    'Gast': ['„Schön, dass du da bist – erzähl mal von dir!“', '„Schön, dass … *Handy klingelt* … Mist.“'],
    'Gast 1': ['„Schön, dass du da bist – wie fing alles an?“', '„Schön, dass … *Handy klingelt* … Mist.“'],
    'Gast 2': ['„… und seitdem trage ich nur noch Ringelsocken.“', '„… und seitdem … *Stuhl kippt um*“'],
    'Hörerfrage': ['„Die Frage der Woche kommt von Bernd aus dem Hörerpostfach.“', '„Die Frage kommt von … *Hatschi!* … Pardon.“'],
    'Fazit': ['„Unterm Strich: Pausenbrote verbinden Menschen.“', '„Also zusammengefasst … öhm … Dings halt.“'],
    'Abschied': ['„Danke fürs Zuhören – bis nächste Woche!“', '„Tschüss und … oh, Kabel rausgezogen!“'],
    'Outro': ['♪ Schluss-Melodie mit Kuhglocken-Solo.', null]
  };
  const CFG = [ // Locker, Standard, Profi
    { plan: ['Intro', 'Begrüßung', 'Thema', 'Gast', 'Hörerfrage', 'Outro'], bad: 1, time: 75, err: 3, mark: true },
    { plan: ['Intro', 'Begrüßung', 'Thema', 'Gast', 'Hörerfrage', 'Abschied', 'Outro'], bad: 2, time: 80, err: 3, mark: false },
    { plan: ['Intro', 'Begrüßung', 'Thema', 'Gast 1', 'Gast 2', 'Hörerfrage', 'Fazit', 'Abschied', 'Outro'], bad: 3, time: 90, err: 2, mark: false }
  ];
  const COLS = 6, BW = 140, BH = 96, X0 = 30, Y0 = 130, GAP = 12;
  const TRASH = { x: 40, y: 452, w: 220, h: 64 }, EXPORT = { x: 700, y: 452, w: 220, h: 64 };
  const slotX = i => X0 + (i % COLS) * (BW + GAP), slotY = i => Y0 + Math.floor(i / COLS) * (BH + 20);
  const inBox = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  function slotAt(st, x, y) {
    for (let i = 0; i < st.clips.length; i++) if (x >= slotX(i) && x <= slotX(i) + BW && y >= slotY(i) && y <= slotY(i) + BH) return i;
    return -1;
  }
  const sorted = st => st.clips.every((c, i) => !c.bad && c.sec === i);
  function say(st, m, t) { st.msg = m; st.msgT = t || 2.5; }
  function penalty(st, m, sec) {
    st.err++; st.t += sec; MG.fx(st, 'bad'); say(st, m + ' (−' + sec + ' s)');
    if (st.err > st.cfg.err) MG.finish(st, false);
  }
  function trash(st, i) {
    const c = st.clips[i]; if (!c) return;
    if (c.bad) { st.clips.splice(i, 1); st.pick = -1; st.cur = Math.min(st.cur, st.clips.length - 1); st.cut++; MG.fx(st, 'pop'); say(st, 'Versprecher entsorgt – niemand wird je davon erfahren.'); }
    else { st.pick = -1; penalty(st, 'Huch, das war ein guter Take!', 6); }
  }
  function tapSlot(st, i) {
    if (st.pick < 0) { st.pick = i; MG.fx(st, 'click'); return; }
    if (st.pick !== i) { const a = st.clips[st.pick]; st.clips[st.pick] = st.clips[i]; st.clips[i] = a; MG.fx(st, 'whoosh'); }
    st.pick = -1;
  }
  function doExport(st) {
    if (sorted(st)) { MG.fx(st, 'coin'); MG.finish(st, true); return; }
    const right = st.clips.filter((c, i) => !c.bad && c.sec === i).length, bad = st.clips.some(c => c.bad);
    penalty(st, bad ? 'Da ist noch ein Versprecher drin!' : right + ' von ' + st.cfg.plan.length + ' Abschnitten sitzen', 8);
  }
  MG.define({
    id: 'P03', group: 'produktion', name: 'Schnitt-Challenge', icon: '✂️',
    short: 'Clips vorhören, Versprecher rauswerfen, Folge nach Sendeplan sortieren.',
    rules: [
      'Die Abschnitte der Folge liegen durcheinander, dazwischen Versprecher-Takes.',
      'Ausgewählte Clips werden unten vorgehört – Versprecher erkennst du am Gestammel.',
      'Versprecher in den Papierkorb; gute Takes wegwerfen kostet Zeit.',
      'Clips per Tauschen in die Reihenfolge des Sendeplans bringen und exportieren.',
      'Falscher Export kostet Zeit. Zu viele Fehler oder Zeit abgelaufen = verloren.'
    ],
    controls: { key: 'Pfeile: Clip wählen, Leertaste: aufnehmen/tauschen, E: wegwerfen, 1: Export', touch: 'Clip antippen, zweiten antippen = tauschen; Papierkorb/Export antippen', pad: 'Steuerkreuz, A tauschen, B wegwerfen, 1 Export' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b', '1'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, err: 0, cut: 0, cur: 0, pick: -1, msg: 'Hör rein und räum auf!', msgT: 3 };
      const list = c.plan.map((name, i) => ({ sec: i, name, bad: false, txt: SEC[name][0] }));
      const cand = PT.shuffle(st, c.plan.map((n, i) => i).filter(i => SEC[c.plan[i]][1]));
      for (let k = 0; k < c.bad; k++) { const i = cand[k]; list.push({ sec: i, name: c.plan[i], bad: true, txt: SEC[c.plan[i]][1] }); }
      do st.clips = PT.shuffle(st, list); while (st.clips.every((x, i) => x.bad || x.sec === i));
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const n = st.clips.length;
      if (a.type === 'key' && a.down) {
        if (a.key === 'left') st.cur = (st.cur + n - 1) % n;
        else if (a.key === 'right') st.cur = (st.cur + 1) % n;
        else if (a.key === 'up') st.cur = Math.max(0, st.cur - COLS);
        else if (a.key === 'down') st.cur = Math.min(n - 1, st.cur + COLS);
        else if (a.key === 'a') tapSlot(st, st.cur);
        else if (a.key === 'b') trash(st, st.cur);
        else if (a.key === '1') doExport(st);
        if (a.key === 'left' || a.key === 'right' || a.key === 'up' || a.key === 'down') MG.fx(st, 'tick');
      } else if (a.type === 'pointer' && a.phase === 'down') {
        const i = slotAt(st, a.x, a.y);
        if (i >= 0) { st.cur = i; tapSlot(st, i); }
        else if (inBox(TRASH, a.x, a.y)) { if (st.pick >= 0) trash(st, st.pick); else say(st, 'Erst einen Clip antippen, dann den Papierkorb.'); }
        else if (inBox(EXPORT, a.x, a.y)) doExport(st);
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.msgT -= dt;
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won', left = Math.max(0, c.time - st.t);
      const right = st.clips.filter((x, i) => !x.bad && x.sec === i).length;
      const score = won ? PT.clamp(Math.round(55 + 45 * left / c.time - st.err * 4), 50, 100) : PT.clamp(Math.round(40 * right / c.plan.length), 0, 49);
      return { won, score, detail: won ? 'Folge exportiert mit ' + Math.round(left) + ' s Luft und ' + st.err + ' Fehlern.' : 'Schnitt nicht fertig: ' + right + ' von ' + c.plan.length + ' Abschnitten am richtigen Platz.' };
    },
    bot(st, goal) {
      if (goal === 'lose') return [{ type: 'key', key: '1', down: true }];
      const tap = (b) => ({ type: 'pointer', phase: 'down', x: b.x + 20, y: b.y + 20 });
      const bad = st.clips.findIndex(c => c.bad);
      if (bad >= 0) return [st.pick === bad ? tap(TRASH) : tap({ x: slotX(bad), y: slotY(bad) })];
      const i = st.clips.findIndex((c, k) => c.sec !== k);
      if (i < 0) return [tap(EXPORT)];
      if (st.pick !== i) return st.pick >= 0 ? [tap({ x: slotX(st.pick), y: slotY(st.pick) })] : [tap({ x: slotX(i), y: slotY(i) })];
      const j = st.clips.findIndex(c => c.sec === i);
      return [tap({ x: slotX(j), y: slotY(j) })];
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('✂️ Schnitt-Challenge', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText('Fehler ' + st.err + ' / ' + c.err + '   ⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 936, 36);
      g.font = '18px system-ui'; g.textAlign = 'left'; g.fillStyle = '#6ef0ff';
      g.fillText('Sendeplan: ' + c.plan.join(' › '), 24, 76);
      g.fillStyle = '#8f98c8'; g.fillText('Timeline (' + st.clips.length + ' Clips)', 24, 112);
      for (let i = 0; i < st.clips.length; i++) {
        const cl = st.clips[i], x = slotX(i), y = slotY(i), ok = !cl.bad && cl.sec === i;
        g.fillStyle = i === st.pick ? '#3a2f12' : '#1d2342'; g.fillRect(x, y, BW, BH);
        g.fillStyle = ok && st.err > 0 ? '#4be08a' : '#6ef0ff'; g.fillRect(x, y, BW, 6);
        // Wellenform (deterministisch aus Abschnitt)
        g.fillStyle = 'rgba(110,240,255,.35)';
        for (let k = 0; k < 14; k++) { const hgt = 6 + ((cl.sec * 7 + k * 5) % 11) * 2; g.fillRect(x + 8 + k * 9, y + 70 - hgt / 2, 5, hgt); }
        if (cl.bad && c.mark) { g.fillStyle = '#ff4d6d'; g.fillRect(x + 8 + 9 * 9, y + 52, 5, 36); }
        g.fillStyle = '#ffffff'; g.font = '600 19px system-ui'; g.textAlign = 'center'; g.fillText(cl.name, x + BW / 2, y + 34);
        g.lineWidth = 3;
        if (i === st.cur) { g.strokeStyle = '#ffb02e'; g.strokeRect(x - 3, y - 3, BW + 6, BH + 6); }
        if (i === st.pick) { g.strokeStyle = '#ff8fb0'; g.strokeRect(x + 2, y + 2, BW - 4, BH - 4); }
      }
      // Vorhören
      const cl = st.clips[st.pick >= 0 ? st.pick : st.cur];
      g.fillStyle = '#161b38'; g.fillRect(24, 372, 912, 64);
      g.font = '18px system-ui'; g.textAlign = 'left'; g.fillStyle = '#8f98c8'; g.fillText('🎧 Vorhören:', 40, 410);
      g.fillStyle = '#ffffff'; g.fillText(cl ? cl.name + ' – ' + cl.txt : '', 160, 410);
      g.fillStyle = st.pick >= 0 ? '#ff4d6d' : '#3a2030'; g.fillRect(TRASH.x, TRASH.y, TRASH.w, TRASH.h);
      g.fillStyle = '#2f9e64'; g.fillRect(EXPORT.x, EXPORT.y, EXPORT.w, EXPORT.h);
      g.fillStyle = '#ffffff'; g.font = '600 20px system-ui'; g.textAlign = 'center';
      g.fillText('🗑 Papierkorb (E)', TRASH.x + TRASH.w / 2, TRASH.y + 40); g.fillText('📤 Export (1)', EXPORT.x + EXPORT.w / 2, EXPORT.y + 40);
      g.font = '18px system-ui'; g.fillStyle = st.msgT > 0 ? '#ffb02e' : '#8f98c8';
      g.fillText(st.msgT > 0 ? st.msg : 'Versprecher raus: ' + st.cut + ' / ' + c.bad, 480, 490);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
