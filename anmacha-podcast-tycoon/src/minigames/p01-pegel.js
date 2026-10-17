/* P01 Mikrofon-Pegel: Die Stimme schwankt (leise Passagen, Lacher, Husten). Mit dem Fader die Verstärkung so nachführen,
   dass der Ausgangspegel im grünen Bereich bleibt. Zu laut = Übersteuerung (Clip). */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const LO = 0.52, HI = 0.80, CLIP = 0.97;
  const CFG = [ // Locker, Standard, Profi
    { time: 35, need: 0.58, clips: 8, rate: 0.9, wild: 0.6 },
    { time: 45, need: 0.66, clips: 5, rate: 0.8, wild: 0.85 },
    { time: 55, need: 0.74, clips: 3, rate: 0.7, wild: 1.1 }
  ];
  // Eingangssignal: Folge von Passagen mit eigener Grundlautstärke, deterministisch aus dem Seed
  function makePhrases(st, total, wild) {
    const out = []; let t = 0;
    while (t < total + 2) {
      const len = 1.2 + PT.rand(st) * 2.4;
      const kind = PT.rand(st);
      let base = 0.45 + (PT.rand(st) - 0.5) * 0.5 * wild; // normale Rede
      let label = 'Rede';
      if (kind < 0.18) { base = 0.18 + PT.rand(st) * 0.12; label = 'Flüstern'; }
      else if (kind < 0.34) { base = 0.85 + PT.rand(st) * 0.35 * wild; label = 'Lacher'; }
      else if (kind < 0.42) { base = 1.05 + PT.rand(st) * 0.3; label = 'Husten'; }
      out.push({ t0: t, t1: t + len, base: PT.clamp(base, 0.12, 1.4), label });
      t += len;
    }
    return out;
  }
  function inputLevel(st, t) {
    const ph = st.phrases.find(p => t >= p.t0 && t < p.t1) || st.phrases[st.phrases.length - 1];
    const syll = 0.92 + 0.08 * Math.sin(t * 17.3 + ph.t0 * 3) * Math.sin(t * 5.1); // Silben-Wackeln
    // weiche Übergänge zwischen Passagen
    const edge = Math.min(1, (t - ph.t0) / 0.4);
    const prev = st.phrases[st.phrases.indexOf(ph) - 1];
    const base = prev ? PT.lerp(prev.base, ph.base, edge) : ph.base;
    return { level: base * syll, base: base, phrase: ph };
  }
  MG.define({
    id: 'P01', group: 'produktion', name: 'Mikrofon-Pegel', icon: '🎙️',
    short: 'Halte die Stimme im grünen Bereich – leise anheben, laut absenken.',
    rules: [
      'Die Stimme im Studio wird mal leiser (Flüstern), mal lauter (Lacher, Husten).',
      'Führe den Fader nach, damit der Ausgangspegel im grünen Bereich bleibt.',
      'Über dem roten Strich übersteuert das Signal (Clip). Zu viele Clips = verloren.',
      'Gewonnen, wenn der Pegel lange genug im grünen Bereich war.'
    ],
    goal: d => 'Halte die blaue Linie insgesamt ' + Math.round(CFG[d].need * CFG[d].time) + ' von ' + CFG[d].time + ' Sekunden im grünen Band – und höchstens ' + CFG[d].clips + '× über die rote Linie.',
    how: [
      'Die blaue Linie zeigt, wie laut die Stimme gerade ankommt. Sie schwankt von selbst.',
      'Linie zu tief? Regler rechts hoch. Linie zu hoch? Regler runter.',
      'Nie über die rote Linie – das übersteuert (zählt als Fehler).',
      'Oben steht, was gleich kommt: „Lacher“ = laut → schon mal runter, „Flüstern“ = leise → hoch.'
    ],
    pic: '<svg viewBox="0 0 340 120"><rect x="0" y="0" width="340" height="120" rx="10" fill="#10142a"/><rect x="10" y="40" width="240" height="34" fill="rgba(75,224,138,.25)"/><text x="16" y="92" fill="#4be08a" font-size="13" font-weight="700">↑ grünes Band = gut</text><line x1="10" y1="16" x2="250" y2="16" stroke="#ff4d6d" stroke-width="2"/><text x="16" y="31" fill="#ff4d6d" font-size="12">zu laut</text><path d="M10 100 C50 90 80 50 120 58 S180 66 250 56" stroke="#6ef0ff" stroke-width="3" fill="none"/><rect x="292" y="10" width="8" height="100" fill="#2a3160"/><rect x="276" y="50" width="40" height="18" rx="3" fill="#ffb02e"/><text x="322" y="30" fill="#cfd6ff" font-size="16">▲</text><text x="322" y="104" fill="#cfd6ff" font-size="16">▼</text><text x="262" y="100" fill="#cfd6ff" font-size="11">Regler</text></svg>',
    tip: { key: 'Halte die blaue Linie im grünen Band: ↑ = lauter, ↓ = leiser', touch: 'Halte die Linie im grünen Band: Regler rechts hoch/runter ziehen', y: 300 },
    controls: { key: '↑ = lauter, ↓ = leiser (oder W/S)', touch: 'Regler rechts mit dem Finger hoch/runter ziehen oder ▲/▼ tippen', mouse: 'Regler rechts anklicken und hoch/runter ziehen', pad: 'Stick/Steuerkreuz hoch = lauter, runter = leiser' },
    touch: ['up', 'down'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', t: 0, score: 0, seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, gain: 1, inZone: 0, clips: 0, clipCool: 0, hold: 0, out: 0.45, hist: [], fx: [] };
      st.phrases = makePhrases(st, c.time, c.wild);
      st.cfg = c; return st;
    },
    input(st, a) {
      if (a.type === 'key' && (a.key === 'up' || a.key === 'down')) st.hold = a.down ? (a.key === 'up' ? 1 : -1) : (st.hold === (a.key === 'up' ? 1 : -1) ? 0 : st.hold);
      if (a.type === 'pointer' && (a.phase === 'down' || a.phase === 'move') && a.x > 720) {
        // Fader: y 90 (oben, laut) .. 470 (unten, leise) -> Verstärkung 2.6 .. 0.3
        st.gain = PT.clamp(PT.lerp(2.6, 0.3, (a.y - 90) / 380), 0.3, 2.6); st.hold = 0;
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg; st.t += dt;
      st.gain = PT.clamp(st.gain + st.hold * c.rate * 1.6 * dt, 0.3, 2.6);
      const inp = inputLevel(st, st.t);
      st.inLevel = inp.level; st.phrase = inp.phrase.label;
      st.out = PT.lerp(st.out, inp.level * st.gain, Math.min(1, dt * 14));
      if (st.out >= LO && st.out <= HI) st.inZone += dt;
      st.clipCool -= dt;
      if (st.out > CLIP && st.clipCool <= 0) { st.clips++; st.clipCool = 0.6; MG.fx(st, 'bad'); }
      st.hist.push(st.out); if (st.hist.length > 240) st.hist.shift();
      st.score = Math.round(100 * st.inZone / Math.max(1, st.t));
      if (st.clips > c.clips) MG.finish(st, false);
      else if (st.t >= c.time) MG.finish(st, st.inZone / c.time >= c.need);
    },
    result(st) {
      const c = st.cfg, ratio = st.inZone / Math.max(1, Math.min(st.t, c.time));
      const score = Math.round(PT.clamp(ratio * 100 - st.clips * 4, 0, 100));
      const pct = Math.round(ratio * 100), need = Math.round(c.need * 100);
      const detail = st.clips > c.clips ? 'Zu oft übersteuert: ' + st.clips + '× über der roten Linie (erlaubt ' + c.clips + '×).'
        : st.status === 'won' ? pct + ' % im grünen Bereich (nötig ' + need + ' %), ' + st.clips + '× übersteuert.'
        : 'Nur ' + pct + ' % im grünen Bereich – nötig sind ' + need + ' %.';
      return { won: st.status === 'won', score: st.status === 'won' ? Math.max(score, 50) : Math.min(score, 49), detail };
    },
    bot(st, goal) {
      if (goal === 'lose') return st.hold !== 1 ? [{ type: 'key', key: 'up', down: true }] : [];
      // Blick 0,15 s voraus und Ziel 0,66 ansteuern
      const next = Math.max(inputLevel(st, st.t + 0.1).base, inputLevel(st, st.t + 0.3).base) * 0.92;
      const want = PT.clamp(0.66 / Math.max(0.05, next), 0.3, 2.6);
      return [{ type: 'pointer', phase: 'move', x: 800, y: 90 + (2.6 - want) / 2.3 * 380 }];
    },
    draw2d(g, st) {
      const W = 960, H = 540;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, W, H);
      // Verlauf
      g.fillStyle = 'rgba(80,230,140,.2)'; const y0 = 470 - HI * 380, y1 = 470 - LO * 380; g.fillRect(40, y0, 640, y1 - y0);
      g.strokeStyle = 'rgba(80,230,140,.7)'; g.lineWidth = 2; g.strokeRect(40, y0, 640, y1 - y0);
      g.font = '700 18px system-ui'; g.textAlign = 'left'; g.fillStyle = '#4be08a'; g.fillText('GRÜNES BAND – hier halten', 50, y0 + 24);
      g.strokeStyle = '#ff4d6d'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 470 - CLIP * 380); g.lineTo(680, 470 - CLIP * 380); g.stroke();
      g.fillStyle = '#ff4d6d'; g.fillText('zu laut (übersteuert)', 50, 470 - CLIP * 380 - 8);
      g.strokeStyle = '#6ef0ff'; g.lineWidth = 3; g.beginPath();
      st.hist.forEach((v, i) => { const x = 40 + i * (640 / 240), y = 470 - PT.clamp(v, 0, 1.15) * 380; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
      // VU-Balken
      const v = PT.clamp(st.out, 0, 1.15), col = v > CLIP ? '#ff4d6d' : v >= LO && v <= HI ? '#4be08a' : '#ffc84a';
      g.fillStyle = '#1d2342'; g.fillRect(620, 90, 60, 380);
      g.fillStyle = col; g.fillRect(620, 470 - v * 380, 60, v * 380);
      // Fader
      g.fillStyle = '#1d2342'; g.fillRect(790, 90, 20, 380);
      const fy = 90 + (2.6 - st.gain) / 2.3 * 380;
      g.fillStyle = '#ffb02e'; g.fillRect(760, fy - 16, 80, 32); g.fillStyle = '#10142a'; g.fillRect(764, fy - 2, 72, 4);
      g.fillStyle = '#cfd6ff'; g.font = '600 20px system-ui'; g.textAlign = 'center';
      g.fillText('Regler', 800, 52); g.fillText('▲ lauter', 800, 80); g.fillText('▼ leiser', 800, 494); g.fillText('Pegel', 650, 80);
      // Richtungshinweis am Regler, wenn die Linie das Band verlässt
      if (st.t > 0.5 && (st.out < LO || st.out > HI)) {
        const up = st.out < LO, pulse = 0.6 + 0.4 * Math.sin(st.t * 10);
        g.globalAlpha = pulse; g.fillStyle = up ? '#ffc84a' : '#ff4d6d'; g.font = '800 22px system-ui';
        g.fillText(up ? '▲ hoch!' : '▼ runter!', 800, up ? fy - 26 : fy + 42); g.globalAlpha = 1;
      }
      const c = st.cfg, nx = st.phrases.find(p => p.t0 > st.t), hint = l => l === 'Flüstern' ? ' (leise)' : l === 'Rede' ? '' : ' (laut!)';
      g.font = '600 20px system-ui'; g.textAlign = 'left';
      g.fillText('Jetzt: ' + (st.phrase || 'Rede') + hint(st.phrase || 'Rede') + (nx ? '   ·   in ' + Math.max(0, nx.t0 - st.t).toFixed(1) + ' s: ' + nx.label + hint(nx.label) : ''), 40, 34);
      g.textAlign = 'right'; g.fillText('⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 900, 34);
      // Fortschritt: Sekunden im Band gegen das Ziel
      const need = c.need * c.time, pr = Math.min(1, st.inZone / need);
      g.fillStyle = '#1d2342'; g.fillRect(40, 500, 440, 26); g.fillStyle = pr >= 1 ? '#4be08a' : '#2f9e64'; g.fillRect(40, 500, 440 * pr, 26);
      g.fillStyle = '#ffffff'; g.font = '600 18px system-ui'; g.textAlign = 'center';
      g.fillText('Im grünen Band: ' + st.inZone.toFixed(0) + ' von ' + need.toFixed(0) + ' s', 260, 519);
      g.textAlign = 'right'; g.fillStyle = st.clips ? '#ff4d6d' : '#cfd6ff'; g.fillText('Übersteuert: ' + st.clips + ' von max. ' + c.clips, 680, 519);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
