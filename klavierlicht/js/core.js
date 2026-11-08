/* Klavierlicht – Spielkern (auch in Node testbar): Liednotation → Chart, Chart → spielbare Lichter je Schwierigkeit,
 * Spuren nach Melodieverlauf, Begleitung (Bass + Akkorde), Treffer-Wertung, Sterne. Zeiten in Sekunden. */
(function (root) {
  'use strict';
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
  const ROOT = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, H: 11 };
  const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LEVELS = { leicht: { lanes: 4, fall: 2.1, gap: 0.32, any: true, n: 'Leicht' }, normal: { lanes: 5, fall: 1.7, gap: 0.2, any: false, n: 'Normal' }, profi: { lanes: 6, fall: 1.35, gap: 0.09, any: false, n: 'Profi' } };
  const WIN = { perfect: 0.075, good: 0.15 };

  function len(tok) { const m = /(?:\*([\d.]+)|\/([\d.]+))$/.exec(tok); return m ? (m[1] ? +m[1] : 1 / +m[2]) : 1; }
  function midi(name) { const m = /^([A-H])(#|b)?(-?\d)$/.exec(name); if (!m) return null; return (+m[3] + 1) * 12 + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
  // Notation (songs.js) → Chart im gleichen Format wie die Archiv-Dateien (Raster = Sechzehntel)
  function fromNotation(s) {
    const step = 60 / s.bpm / 4, mel = [], chords = [], bass = [];
    let t = 0;
    s.mel.trim().split(/\s+/).forEach(tok => { const d = Math.round(len(tok) * 4), n = tok.replace(/[*/][\d.]+$/, ''); if (n !== '-') { const p = midi(n); if (p != null) mel.push([t, p, d]); } t += d; });
    t = 0;
    (s.chords || '').trim().split(/\s+/).filter(Boolean).forEach(tok => { const d = Math.round(len(tok) * 4), n = tok.replace(/[*/][\d.]+$/, ''); const m = /^([A-H](?:#|b)?)(m?)$/.exec(n);
      if (n !== '-' && m) { chords.push([t, ROOT[m[1]], m[2], d]); for (let b = 0; b < d; b += 4) bass.push([t + b, 36 + ((ROOT[m[1]] + 4) % 12) - 4 + (b % 8 ? 7 : 0), Math.min(4, d - b)]); }
      t += d; });
    // kurze Lieder (eine Strophe) mehrfach spielen, damit eine Runde mindestens ~35 Sekunden dauert
    const L = t, reps = Math.max(1, Math.min(3, Math.ceil(35 / (L * step || 1))));
    for (let r = 1; r < reps; r++) { const o = r * L; [mel, chords, bass].forEach(a => { const n = a.length / r; for (let i = 0; i < n; i++) { const x = a[i].slice(); x[0] += o; a.push(x); } }); }
    return { v: 1, id: s.id, title: s.title, artist: s.artist, cat: s.cat, bpm: s.bpm, step: step * 1000, off: 0, mel, chords, bass, builtin: true };
  }
  function check(c) { return c && c.v === 1 && Array.isArray(c.mel) && c.mel.length > 0 && c.step > 0; }
  // Spielbare Lichter: Melodienoten mit Mindestabstand je Schwierigkeit; Spur folgt dem Melodieverlauf (höher = weiter rechts)
  function playable(c, level) {
    const L = LEVELS[level] || LEVELS.normal, st = c.step / 1000, off = (c.off || 0) / 1000, notes = [];
    for (const [s, p, d] of c.mel) { const t = off + s * st; if (notes.length && t - notes[notes.length - 1].t < L.gap) continue; notes.push({ t, p, d: Math.max(st, d * st), lane: 0, hit: null }); }
    if (!notes.length) return notes;
    // gleitendes Fenster: Tonhöhe relativ zu den Nachbarn → Spur (sieht aus wie die Melodie, springt nicht wild)
    const N = L.lanes;
    let prevLane = Math.floor(N / 2);
    for (let i = 0; i < notes.length; i++) {
      const w = notes.slice(Math.max(0, i - 6), i + 7).map(n => n.p), lo = Math.min(...w), hi = Math.max(...w);
      let lane = hi === lo ? prevLane : Math.round((notes[i].p - lo) / (hi - lo) * (N - 1));
      if (i && notes[i].p > notes[i - 1].p && lane <= prevLane) lane = Math.min(N - 1, prevLane + 1);
      if (i && notes[i].p < notes[i - 1].p && lane >= prevLane) lane = Math.max(0, prevLane - 1);
      if (i && notes[i].p === notes[i - 1].p) lane = prevLane;
      notes[i].lane = lane; prevLane = lane;
    }
    return notes;
  }
  // Begleitung: Bass auf jedem Schlag, Akkord als gebrochene Achtel in mittlerer Lage (Ereignisse: t, Tonhöhe, Dauer, Lautstärke)
  function accompaniment(c) {
    const st = c.step / 1000, off = (c.off || 0) / 1000, ev = [];
    for (const [s, p, d] of c.bass || []) { let q = p; while (q < 36) q += 12; while (q > 52) q -= 12; ev.push([off + s * st, q, Math.max(st * 3, d * st), 0.42]); }
    for (const [s, r, q, d] of c.chords || []) {
      const tri = [0, q === 'm' ? 3 : 4, 7].map(i => 55 + ((r + i - 7 + 12) % 12));   // Akkordtöne zwischen G3 und F#4
      tri.sort((a, b) => a - b);
      for (let k = 0; k < d; k += 2) { const t = off + (s + k) * st, pos = (k / 2) % 4, p = pos === 0 ? tri[0] : pos === 1 ? tri[1] : pos === 2 ? tri[2] : tri[1]; ev.push([t + (k % 4 ? 0 : 0.004), p, st * 3, k % 8 === 0 ? 0.26 : 0.18]); }
    }
    ev.sort((a, b) => a[0] - b[0]);
    return ev;
  }
  function judge(dt) { const a = Math.abs(dt); return a <= WIN.perfect ? 'perfect' : a <= WIN.good ? 'good' : null; }
  // Wertung: Perfekt 100, Gut 60, Combo-Bonus bis ×2
  function scoreHit(state, kind) { if (kind) { state.combo++; state.max = Math.max(state.max, state.combo); state[kind]++; state.score += Math.round((kind === 'perfect' ? 100 : 60) * (1 + Math.min(1, state.combo / 50))); } else { state.combo = 0; state.miss++; } return state; }
  function newState() { return { score: 0, combo: 0, max: 0, perfect: 0, good: 0, miss: 0 }; }
  function accuracy(s) { const n = s.perfect + s.good + s.miss; return n ? (s.perfect + s.good * 0.6) / n : 0; }
  function stars(s) { const a = accuracy(s); return a >= 0.92 ? 3 : a >= 0.75 ? 2 : a >= 0.5 ? 1 : 0; }
  function difficulty(c) { const st = c.step / 1000, dur = (c.mel[c.mel.length - 1][0] - c.mel[0][0]) * st || 1; const nps = c.mel.length / dur; return nps < 1.3 ? 1 : nps < 2 ? 2 : nps < 2.8 ? 3 : 4; }
  function duration(c) { const st = c.step / 1000, l = c.mel[c.mel.length - 1]; return (c.off || 0) / 1000 + (l[0] + l[2]) * st; }
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const API = { NAMES, LEVELS, WIN, midi, fromNotation, check, playable, accompaniment, judge, scoreHit, newState, accuracy, stars, difficulty, duration, fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLCore = API;
})(typeof window !== 'undefined' ? window : globalThis);
