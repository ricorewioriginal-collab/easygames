/* T03 Kamerakalibrierung: Das Live-Bild der Studiokamera soll wie das Referenzbild aussehen.
   Regler für Helligkeit, Schärfe, Weißabgleich (Profi: + Kontrast) einstellen und übernehmen.
   Jede Runde neue Zielwerte; mehrere Runden vor Ablauf der Zeit. Falsches Übernehmen ist ein Fehler. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const SL = ['☀️ Helligkeit', '🔍 Schärfe', '🌡️ Farbton', '◐ Kontrast'];
  const LO_HI = [['dunkel', 'hell'], ['unscharf', 'scharf'], ['warm/orange', 'kalt/blau'], ['flau', 'kräftig']];
  const CFG = [ // hint 2 = Zielmarken, 1 = Richtungspfeile, 0 = nur Bildvergleich + Übereinstimmung
    { n: 3, rounds: 3, time: 60, tol: 8, err: 3, hint: 2 },
    { n: 3, rounds: 4, time: 70, tol: 6, err: 2, hint: 1 },
    { n: 4, rounds: 5, time: 95, tol: 5, err: 2, hint: 0 }
  ];
  const SX = 250, SW = 540, SY = 360, ROW = 42, BTN = { x: 820, y: 352, w: 120, h: 150 }, SPEED = 32;
  const rowY = i => SY + i * ROW;
  const match = st => { let s = 0; for (let i = 0; i < st.cfg.n; i++) s += Math.abs(st.v[i] - st.tg[i]); return PT.clamp(Math.round(100 - 2 * s / st.cfg.n), 0, 100); };
  const fits = st => st.v.every((v, i) => Math.abs(v - st.tg[i]) <= st.cfg.tol);
  function newRound(st) {
    const c = st.cfg;
    for (let i = 0; i < c.n; i++) st.tg[i] = PT.randInt(st, 10, 90);
    let far = 0; for (let i = 0; i < c.n; i++) far = Math.max(far, Math.abs(st.v[i] - st.tg[i]));
    if (far < 3 * c.tol) { const i = PT.randInt(st, 0, c.n - 1); st.tg[i] = st.v[i] > 50 ? PT.randInt(st, 10, 25) : PT.randInt(st, 75, 90); }
  }
  function confirm(st) {
    if (fits(st)) {
      st.round++; MG.fx(st, 'good'); st.msg = 'Bild sitzt! ' + (st.round < st.cfg.rounds ? 'Nächste Szene …' : ''); st.msgT = 2;
      if (st.round >= st.cfg.rounds) MG.finish(st, true); else newRound(st);
    } else {
      st.err++; MG.fx(st, 'bad'); st.msg = 'Das sieht noch schief aus (' + match(st) + ' % Übereinstimmung).'; st.msgT = 2;
      if (st.err > st.cfg.err) MG.finish(st, false);
    }
  }
  // Testbild: Hintergrund, Farbbalken, Moderator mit Mikro; Effekte relativ zur Mitte 50
  function scene(g, x, y, w, h) {
    g.fillStyle = '#34508a'; g.fillRect(x, y, w, h);
    g.fillStyle = '#6b4a3a'; g.fillRect(x, y + h * 0.72, w, h * 0.28);
    const cols = ['#f2f2f2', '#f5e663', '#6ef0ff', '#4be08a', '#ff8fb0', '#ff4d6d', '#3b58ff'];
    for (let k = 0; k < 7; k++) { g.fillStyle = cols[k]; g.fillRect(x + w * 0.05 + k * w * 0.06, y + h * 0.1, w * 0.055, h * 0.45); }
    g.fillStyle = '#ffb02e'; g.fillRect(x + w * 0.6, y + h * 0.5, w * 0.24, h * 0.3);
    g.fillStyle = '#f0c8a0'; g.beginPath(); g.arc(x + w * 0.72, y + h * 0.36, h * 0.13, 0, 6.283); g.fill();
    g.fillStyle = '#10142a'; g.fillRect(x + w * 0.69, y + h * 0.33, w * 0.012, h * 0.03); g.fillRect(x + w * 0.74, y + h * 0.33, w * 0.012, h * 0.03);
    g.fillStyle = '#2a2a2a'; g.fillRect(x + w * 0.52, y + h * 0.45, w * 0.03, h * 0.3);
    g.fillStyle = '#9aa0b8'; g.beginPath(); g.arc(x + w * 0.535, y + h * 0.43, h * 0.05, 0, 6.283); g.fill();
  }
  function picture(g, x, y, w, h, v, n) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const blur = Math.max(0, 50 - v[1]) / 50;
    if (blur > 0.04) {
      scene(g, x, y, w, h); g.globalAlpha = 0.4;
      scene(g, x - blur * 12, y, w, h); scene(g, x + blur * 12, y + blur * 4, w, h); g.globalAlpha = 1;
    } else scene(g, x, y, w, h);
    if (v[1] > 55) { // Überschärfe: harte Kanten
      g.strokeStyle = 'rgba(255,255,255,' + ((v[1] - 55) / 45 * 0.8).toFixed(2) + ')'; g.lineWidth = 2;
      for (let k = 0; k < 7; k++) g.strokeRect(x + w * 0.05 + k * w * 0.06, y + h * 0.1, w * 0.055, h * 0.45);
      g.beginPath(); g.arc(x + w * 0.72, y + h * 0.36, h * 0.13, 0, 6.283); g.stroke();
    }
    const wb = (v[2] - 50) / 50;
    g.fillStyle = (wb < 0 ? 'rgba(255,140,30,' : 'rgba(70,140,255,') + (Math.abs(wb) * 0.5).toFixed(2) + ')'; g.fillRect(x, y, w, h);
    if (n > 3) {
      const ct = (v[3] - 50) / 50;
      if (ct < 0) { g.fillStyle = 'rgba(128,128,128,' + (-ct * 0.65).toFixed(2) + ')'; g.fillRect(x, y, w, h); }
      else { g.fillStyle = 'rgba(0,0,0,' + (ct * 0.5).toFixed(2) + ')'; g.fillRect(x, y + h * 0.72, w, h * 0.28); g.fillRect(x, y, w * 0.04, h); g.fillRect(x + w * 0.88, y, w * 0.12, h); }
    }
    const e = (v[0] - 50) / 50;
    g.fillStyle = (e > 0 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + (Math.abs(e) * 0.7).toFixed(2) + ')'; g.fillRect(x, y, w, h);
    g.restore();
  }
  MG.define({
    id: 'T03', group: 'tec', name: 'Kamerakalibrierung', icon: '📷',
    short: 'Stell die Kamera so ein, dass das Live-Bild dem Referenzbild gleicht.',
    rules: [
      'Links siehst du das Referenzbild, rechts das Live-Bild der Kamera.',
      'Stell Helligkeit, Schärfe und Weißabgleich (Profi: auch Kontrast) passend ein.',
      'Übernehmen, wenn alles stimmt – jede Runde bringt eine neue Szene mit neuen Zielwerten.',
      'Falsch übernehmen ist ein Fehler. Alle Runden geschafft = gewonnen.',
      'Zeit abgelaufen oder zu viele Fehler = verloren.'
    ],
    goal: d => 'Stell ' + CFG[d].rounds + ' Szenen so ein, dass das Live-Bild (rechts) wie das Referenzbild (links) aussieht – in ' + CFG[d].time + ' s, höchstens ' + CFG[d].err + ' Fehlversuche.',
    how: [
      'Vergleiche die zwei Bilder: Links ist das Ziel, rechts deine Kamera.',
      'Zieh die Regler unten nach links/rechts, bis beide Bilder gleich aussehen' + ' (Locker: grünes Feld = Zielwert, Standard: Pfeile zeigen die Richtung).',
      'Stimmt alles? Drück ✅ Übernehmen. Danach kommt die nächste Szene.',
      'Übernehmen, obwohl es noch nicht passt, ist ein Fehlversuch.'
    ],
    tip: { key: '↑/↓ Regler wählen, ←/→ verstellen – dann Leertaste = Übernehmen', touch: 'Zieh die Regler, bis rechts wie links aussieht – dann ✅ antippen', y: 200 },
    controls: { key: '↑/↓ Regler wählen, ←/→ verstellen, Leertaste: übernehmen', touch: 'Regler-Knopf nach links/rechts ziehen, dann ✅ Übernehmen antippen', mouse: 'Regler anklicken und ziehen, dann ✅ Übernehmen klicken', pad: 'Steuerkreuz, A übernehmen' },
    touch: ['left', 'right', 'up', 'down', 'a'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, round: 0, err: 0, sel: 0, hold: 0, drag: -1, v: [], tg: [], msg: 'Kamera läuft warm …', msgT: 2 };
      for (let i = 0; i < c.n; i++) st.v[i] = 50;
      newRound(st);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const n = st.cfg.n;
      if (a.type === 'key') {
        if (a.key === 'left' || a.key === 'right') {
          const d = a.key === 'left' ? -1 : 1;
          if (a.down) { st.hold = d; st.v[st.sel] = PT.clamp(st.v[st.sel] + d, 0, 100); } else if (st.hold === d) st.hold = 0;
        } else if (a.down && a.key === 'up') { st.sel = (st.sel + n - 1) % n; st.hold = 0; MG.fx(st, 'tick'); }
        else if (a.down && a.key === 'down') { st.sel = (st.sel + 1) % n; st.hold = 0; MG.fx(st, 'tick'); }
        else if (a.down && a.key === 'a') confirm(st);
      } else if (a.type === 'pointer') {
        if (a.phase === 'up') { st.drag = -1; return; }
        if (a.phase === 'down') {
          if (a.x >= BTN.x && a.x <= BTN.x + BTN.w && a.y >= BTN.y && a.y <= BTN.y + BTN.h) return confirm(st);
          const i = Math.floor((a.y - SY + ROW / 2) / ROW);
          if (i < 0 || i >= n || a.x < SX - 30 || a.x > SX + SW + 30) return;
          st.drag = st.sel = i;
        }
        if (st.drag >= 0) st.v[st.drag] = PT.clamp((a.x - SX) / SW * 100, 0, 100);
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.msgT -= dt;
      if (st.hold) st.v[st.sel] = PT.clamp(st.v[st.sel] + st.hold * SPEED * dt, 0, 100);
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won', left = Math.max(0, c.time - st.t);
      const score = won ? PT.clamp(Math.round(55 + 45 * left / c.time - st.err * 5), 50, 100) : PT.clamp(Math.round(45 * st.round / c.rounds), 0, 49);
      return { won, score, detail: won ? 'Alle ' + c.rounds + ' Szenen kalibriert, ' + st.err + ' Fehlversuche – gestochen scharf!' : (st.err > c.err ? 'Zu viele Fehlversuche (' + st.err + ', erlaubt ' + c.err + ') – ' : 'Zeit abgelaufen – ') + st.round + ' von ' + c.rounds + ' Szenen kalibriert.' };
    },
    bot(st, goal) {
      if (goal === 'lose') return [{ type: 'key', key: 'a', down: true }];
      const acts = [];
      for (let i = 0; i < st.cfg.n; i++) if (Math.abs(st.v[i] - st.tg[i]) > 0.5) acts.push({ type: 'pointer', phase: 'down', x: SX + st.tg[i] / 100 * SW, y: rowY(i) });
      acts.push({ type: 'pointer', phase: 'up', x: 0, y: 0 });
      if (acts.length === 1) acts.push({ type: 'key', key: 'a', down: true });
      return acts;
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('📷 Kamerakalibrierung', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText('Szene ' + Math.min(st.round + 1, c.rounds) + ' / ' + c.rounds + '   Fehler ' + st.err + '/' + c.err + '   ⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 900, 36);
      picture(g, 40, 80, 420, 236, st.tg, c.n); picture(g, 500, 80, 420, 236, st.v, c.n);
      g.font = '600 18px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffffff';
      g.fillText('🎯 Ziel (Referenz)', 50, 104); g.fillText('🔴 Deine Kamera', 510, 104);
      g.font = '800 28px system-ui'; g.textAlign = 'center'; g.fillText('=?', 480, 206); g.font = '600 18px system-ui';
      const m = match(st);
      g.textAlign = 'center'; g.fillStyle = st.msgT > 0 ? '#ffb02e' : m >= 90 ? '#4be08a' : '#8f98c8';
      const allOk = c.hint > 0 && fits(st);
      if (allOk && st.msgT <= 0) g.fillStyle = '#4be08a';
      g.fillText(st.msgT > 0 ? st.msg : allOk ? '✓ Alle Regler passen – jetzt ✅ Übernehmen!' : 'Übereinstimmung: ' + m + ' % · Regler ziehen, bis rechts = links', 480, 338);
      for (let i = 0; i < c.n; i++) {
        const y = rowY(i), dev = st.v[i] - st.tg[i];
        g.textAlign = 'left'; g.fillStyle = i === st.sel ? '#ffb02e' : '#cfd6ff'; g.font = '600 18px system-ui'; g.fillText(SL[i], 30, y + 6);
        g.fillStyle = '#1d2342'; g.fillRect(SX, y - 5, SW, 10);
        g.font = '14px system-ui'; g.fillStyle = '#8f98c8'; g.textAlign = 'left'; g.fillText(LO_HI[i][0], SX, y + 21); g.textAlign = 'right'; g.fillText(LO_HI[i][1], SX + SW, y + 21); g.font = '600 18px system-ui';
        if (c.hint === 2) { g.fillStyle = 'rgba(75,224,138,.45)'; g.fillRect(SX + (st.tg[i] - c.tol) / 100 * SW, y - 12, 2 * c.tol / 100 * SW, 24); }
        g.fillStyle = i === st.sel ? '#ffb02e' : '#6ef0ff'; g.fillRect(SX + st.v[i] / 100 * SW - 9, y - 15, 18, 30);
        if (i === st.sel) { g.strokeStyle = '#ffb02e'; g.lineWidth = 2; g.strokeRect(SX - 12, y - 20, SW + 24, 40); }
        if (c.hint === 1) { g.textAlign = 'center'; g.fillStyle = Math.abs(dev) <= c.tol ? '#4be08a' : '#ff4d6d'; g.fillText(Math.abs(dev) <= c.tol ? '✓' : dev < 0 ? '→' : '←', SX - 22, y + 6); }
      }
      g.fillStyle = allOk ? '#3fc77e' : '#2f9e64'; g.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
      g.strokeStyle = allOk ? '#ffffff' : 'rgba(255,255,255,.5)'; g.lineWidth = allOk ? 4 : 2; g.strokeRect(BTN.x, BTN.y, BTN.w, BTN.h);
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = '600 18px system-ui';
      g.fillText('✅', BTN.x + 60, BTN.y + 62); g.fillText('Über-', BTN.x + 60, BTN.y + 92); g.fillText('nehmen', BTN.x + 60, BTN.y + 114);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
