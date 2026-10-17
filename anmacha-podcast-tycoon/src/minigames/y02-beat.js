/* Y02 Beat-Session: Ein selbst erzeugter Groove (Bass + Akkorde aus st.fx-Rezepten) läuft, der Spieler trommelt
   Kick, Snare, Hi-Hat und Glocke auf vier Spuren im Takt. Trefferfenster mit einstellbarer Latenz (st.latency, ms). */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { bpm: 88, bars: 14, perfect: 0.07, good: 0.15, need: 0.55, miss: 7, speed: 260, eighths: false, chords: false, dens: 0.5 },
    { bpm: 108, bars: 16, perfect: 0.055, good: 0.12, need: 0.65, miss: 9, speed: 320, eighths: true, chords: false, dens: 0.45 },
    { bpm: 128, bars: 18, perfect: 0.045, good: 0.1, need: 0.72, miss: 10, speed: 380, eighths: true, chords: true, dens: 0.55 }
  ];
  const LANE_COL = ['#ff4d6d', '#ffb02e', '#6ef0ff', '#4be08a'], LANE_NAME = ['Kick', 'Snare', 'Hi-Hat', 'Glocke'], LANE_KEY = ['1 ←', '2 ↓', '3 ↑', '4 →'];
  const KEYMAP = { '1': 0, '2': 1, '3': 2, '4': 3, left: 0, down: 1, up: 2, right: 3 };
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16], PROG = [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]];
  const hz = semi => 220 * Math.pow(2, semi / 12);
  function sound(lane, pitch) {
    if (lane === 0) return [{ wave: 'sine', f: 150, f2: 45, t: 0, d: 0.18, v: 0.8 }];
    if (lane === 1) return [{ wave: 'noise', f: 1800, t: 0, d: 0.14, v: 0.45, filter: { type: 'bandpass', f: 1800, q: 0.8 } }, { wave: 'triangle', f: 220, f2: 170, t: 0, d: 0.08, v: 0.3 }];
    if (lane === 2) return [{ wave: 'noise', f: 8000, t: 0, d: 0.05, v: 0.28, filter: { type: 'highpass', f: 7000, q: 1 } }];
    return [{ wave: 'triangle', f: hz(pitch + 12), t: 0, d: 0.28, v: 0.32 }, { wave: 'sine', f: hz(pitch + 24), t: 0, d: 0.15, v: 0.12 }];
  }
  function makeSong(st, c) {
    const b = 60 / c.bpm, notes = [], steps = c.eighths ? 8 : 4, phrase = [];
    for (let s = 0; s < steps * 2; s++) { // zweitaktiges Grundmuster, später leicht variiert
      const q = c.eighths ? s % 8 : (s % 4) * 2, lanes = [];
      if (q === 0 || q === 4 && PT.rand(st) < 0.7 || q === 6 && PT.rand(st) < 0.25) lanes.push(0);
      if ((q === 2 || q === 6) && PT.rand(st) < 0.85) lanes.push(1);
      if (q % 2 === 1 && PT.rand(st) < c.dens + 0.2) lanes.push(2);
      if (PT.rand(st) < c.dens * 0.4) lanes.push(3);
      phrase.push(lanes);
    }
    for (let bar = 0; bar < c.bars; bar++) for (let s = 0; s < steps; s++) {
      let lanes = phrase[(bar % 2) * steps + s].slice();
      if (bar % 4 === 3 && PT.rand(st) < 0.5) lanes = [PT.randInt(st, 0, 3)]; // kleine Fills
      if (!c.chords && lanes.length > 1) lanes = [lanes[(bar + s) % lanes.length]];
      if (c.chords && lanes.length > 2) lanes = lanes.slice(0, 2);
      if (!lanes.length && PT.rand(st) < 0.15) lanes = [3];
      const t = (4 + bar * 4 + s * 4 / steps) * b;
      lanes.forEach(l => notes.push({ t, l, p: SCALE[PT.randInt(st, 0, SCALE.length - 1)], j: 0 }));
    }
    return notes;
  }
  function judge(st, lane) {
    const c = st.cfg, ta = st.t - st.latency / 1000; let best = null, bd = 1e9;
    for (let i = st.ni; i < st.notes.length; i++) { const n = st.notes[i]; if (n.t - ta > c.good) break; if (!n.j && n.l === lane && Math.abs(n.t - ta) < bd) { bd = Math.abs(n.t - ta); best = n; } }
    st.flash[lane] = st.t;
    if (best && bd <= c.good) {
      const perf = bd <= c.perfect; best.j = perf ? 1 : 2; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo);
      if (perf) st.perf++; else st.good++;
      st.points += (perf ? 3 : 2) * (1 + Math.floor(st.combo / 8) * 0.25); st.energy = Math.min(100, st.energy + (perf ? 4 : 2));
      st.fx.push({ recipe: { parts: sound(lane, best.p) } }); st.judge = { s: perf ? 'Perfekt!' : 'Gut', t: st.t, ok: true };
    } else { st.combo = 0; st.energy -= 3; st.wrong++; st.fx.push({ recipe: { parts: [{ wave: 'square', f: 110, t: 0, d: 0.06, v: 0.15 }] } }); st.judge = { s: 'Daneben', t: st.t, ok: false }; }
  }
  MG.define({
    id: 'Y02', group: 'party', name: 'Beat-Session', icon: '🥁',
    short: 'Trommel Kick, Snare, Hi-Hat und Glocke genau im Takt zum Studio-Groove.',
    rules: [
      'Bunte Noten fallen auf vier Spuren zur Trefferlinie. Drück die passende Taste, wenn sie die Linie berühren.',
      'Genau = „Perfekt!“, knapp = „Gut“. Treffer in Serie geben Combo-Bonus.',
      'Verpasste Noten und Fehlschläge leeren die Stimmungsleiste – ist sie leer, ist die Session vorbei.',
      'Gewonnen, wenn am Ende die Trefferquote das Ziel erreicht. Mehrere Spieler: reihum, höchste Punktzahl gewinnt.'
    ],
    goal: d => 'Triff im ganzen Lied mindestens ' + Math.round(CFG[d].need * 100) + ' % der Noten im Takt – und lass die Stimmungsleiste links nicht leer laufen.',
    how: [
      'Ton an! Nach dem Einzählen (4-3-2-1) fallen bunte Blöcke in vier Spalten nach unten.',
      'Genau wenn ein Block die weiße Linie berührt: Tippe auf seine Spalte (oder Taste 1–4 bzw. ← ↓ ↑ →).',
      'Genau getroffen = „Perfekt!“, knapp = „Gut“. Daneben oder verpasst kostet Stimmung.',
      'Die Trefferquote rechts zählt über das ganze Lied – sie steigt, je mehr du triffst.'
    ],
    tip: { key: 'Drück 1–4 (← ↓ ↑ →), wenn ein Block die weiße Linie berührt', touch: 'Tippe die Spalte an, wenn ihr Block die weiße Linie berührt', y: 370 },
    controls: { key: '1–4 oder ← ↓ ↑ → (je eine Spalte)', touch: 'Spalte antippen oder Tasten 1–4 unten', mouse: 'Spalte anklicken', pad: 'Steuerkreuz ← ↓ ↑ →' },
    touch: ['1', '2', '3', '4'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, latency: +o.latency || 0, ni: 0, beat: -1,
        player: (o.players || []).length > 1 ? ((o.players[o.turn | 0] || {}).name || '') : '', perf: 0, good: 0, missed: 0, wrong: 0, combo: 0, maxCombo: 0, points: 0, energy: 60, flash: [-9, -9, -9, -9], judge: null };
      st.notes = makeSong(st, c); st.end = st.notes[st.notes.length - 1].t + 1.2;
      st.roots = []; for (let i = 0; i < c.bars; i++) st.roots.push(PT.randInt(st, 0, 3));
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (a.type === 'key' && a.down && KEYMAP[a.key] !== undefined) judge(st, KEYMAP[a.key]);
      if (a.type === 'pointer' && a.phase === 'down') judge(st, PT.clamp(Math.floor((a.x - 280) / 100), 0, 3));
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, b = 60 / c.bpm; st.t += dt;
      const beat = Math.floor(st.t / b);
      if (beat !== st.beat) { // Begleitung: Einzähler, dann Bass jeden Schlag und Akkord je Takt
        st.beat = beat;
        if (beat < 4) MG.fx(st, 'tick');
        else if (beat < 4 + c.bars * 4) {
          const bar = Math.floor((beat - 4) / 4), ch = PROG[st.roots[bar]], parts = [{ wave: 'triangle', f: hz(ch[0] - 24 + (beat % 2 ? 12 : 0)), t: 0, d: b * 0.8, v: 0.3, filter: { type: 'lowpass', f: 600, q: 1 } }];
          if (beat % 4 === 0) ch.forEach(s => parts.push({ wave: 'sawtooth', f: hz(s), t: 0, d: b * 3.6, v: 0.06, filter: { type: 'lowpass', f: 900, q: 0.7 } }));
          st.fx.push({ recipe: { parts } });
        }
      }
      const ta = st.t - st.latency / 1000;
      while (st.ni < st.notes.length && (st.notes[st.ni].j || st.notes[st.ni].t < ta - c.good)) {
        const n = st.notes[st.ni++];
        if (!n.j) { n.j = 3; st.missed++; st.combo = 0; st.energy -= c.miss; st.judge = { s: 'Verpasst', t: st.t, ok: false }; }
      }
      const total = st.notes.length;
      st.acc = (st.perf + 0.6 * st.good) / total;
      if (st.energy <= 0) { st.energy = 0; MG.finish(st, false); }
      else if (st.t >= st.end) MG.finish(st, st.acc >= c.need);
    },
    result(st) {
      const c = st.cfg, acc = (st.perf + 0.6 * st.good) / st.notes.length, who = st.player ? st.player + ': ' : '';
      const det = who + Math.round(acc * 100) + ' % Treffer, beste Combo ' + st.maxCombo + ', ' + Math.round(st.points) + ' Punkte.';
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 50 * (acc - c.need) / (1 - c.need), 50, 100)), detail: det };
      return { won: false, score: Math.round(PT.clamp(49 * acc / c.need, 0, 49)), detail: (st.energy <= 0 ? 'Stimmungsleiste leer – zu viele verpasste Noten. ' : 'Nur ' + Math.round(acc * 100) + ' % getroffen – nötig waren ' + Math.round(c.need * 100) + ' %. ') + det };
    },
    bot(st, goal) {
      if (goal === 'lose') return [];
      const ta = st.t - st.latency / 1000, out = [];
      for (let i = st.ni; i < st.notes.length; i++) { const n = st.notes[i]; if (n.t - ta > 0.009) break; if (!n.j && out.every(a => a.key !== String(n.l + 1))) out.push({ type: 'key', key: String(n.l + 1), down: true }); }
      return out;
    },
    draw2d(g, st) {
      const c = st.cfg, b = 60 / c.bpm, ta = st.t - st.latency / 1000, HY = 450;
      const pulse = Math.max(0, 1 - (st.t % b) / b * 3);
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.fillStyle = 'rgba(255,77,157,' + (0.12 * pulse) + ')'; g.fillRect(0, 0, 960, 540);
      for (let l = 0; l < 4; l++) {
        const x = 284 + l * 100, fl = Math.max(0, 1 - (st.t - st.flash[l]) * 6);
        g.fillStyle = '#1a2040'; g.fillRect(x, 60, 92, 470);
        if (fl > 0) { g.globalAlpha = fl * 0.5; g.fillStyle = LANE_COL[l]; g.fillRect(x, 60, 92, 470); g.globalAlpha = 1; }
        g.fillStyle = LANE_COL[l]; g.font = '700 20px system-ui'; g.textAlign = 'center'; g.fillText(LANE_KEY[l], x + 46, 520); g.font = '18px system-ui'; g.fillText(LANE_NAME[l], x + 46, 84);
      }
      g.fillStyle = '#fff'; g.fillRect(280, HY - 3, 400, 6);
      g.font = '700 18px system-ui'; g.textAlign = 'right'; g.fillText('jetzt tippen →', 274, HY + 6); g.textAlign = 'left'; g.fillText('← Linie', 686, HY + 6);
      for (let i = st.ni; i < st.notes.length; i++) {
        const n = st.notes[i], y = HY - (n.t - ta) * c.speed; if (y < 60) break; if (n.j || y > 500) continue;
        g.fillStyle = LANE_COL[n.l]; g.fillRect(290 + n.l * 100, y - 12, 80, 24); g.fillStyle = '#ffffff88'; g.fillRect(290 + n.l * 100, y - 12, 80, 6);
      }
      if (st.judge && st.t - st.judge.t < 0.6) { g.fillStyle = st.judge.ok ? '#4be08a' : '#ff4d6d'; g.font = '800 34px system-ui'; g.textAlign = 'center'; g.fillText(st.judge.s, 480, 300); }
      if (st.t < 4 * b) { g.fillStyle = '#ffb02e'; g.font = '800 64px system-ui'; g.textAlign = 'center'; g.fillText(String(4 - Math.floor(st.t / b)), 480, 260); }
      g.textAlign = 'left'; g.font = '700 22px system-ui'; g.fillStyle = '#fff';
      g.fillText('Stimmung', 30, 90); g.fillStyle = '#1d2342'; g.fillRect(30, 104, 40, 360);
      g.fillStyle = st.energy < 25 ? '#ff4d6d' : '#4be08a'; g.fillRect(30, 104 + 360 * (1 - st.energy / 100), 40, 360 * st.energy / 100);
      g.fillStyle = '#ffb02e'; g.fillText('Combo ' + st.combo, 90, 140);
      g.fillStyle = '#cfd6ff'; g.font = '18px system-ui'; g.fillText(c.bpm + ' BPM', 90, 176); g.fillText('Latenz ' + st.latency + ' ms', 90, 204);
      if (st.player) g.fillText('🥁 ' + st.player, 90, 232);
      g.textAlign = 'right'; g.font = '700 22px system-ui'; g.fillStyle = '#fff';
      g.fillText('Treffer ' + Math.round((st.acc || 0) * 100) + ' %', 935, 90);
      g.fillStyle = '#6ef0ff'; g.fillText('nötig ' + Math.round(c.need * 100) + ' %', 935, 124);
      g.fillStyle = '#ffc84a'; g.fillText(Math.round(st.points) + ' Punkte', 935, 158);
      g.fillStyle = '#cfd6ff'; g.font = '18px system-ui'; g.fillText('Noch ' + Math.ceil(Math.max(0, st.end - st.t)) + ' s', 935, 192);
      g.fillStyle = '#1d2342'; g.fillRect(715, 210, 220, 12); g.fillStyle = '#ff4d9d'; g.fillRect(715, 210, 220 * PT.clamp(st.t / st.end, 0, 1), 12);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
