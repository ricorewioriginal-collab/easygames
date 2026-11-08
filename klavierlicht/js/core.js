/* Klavierlicht – Spielkern (auch in Node testbar): Liednotation → Chart, Chart → spielbare Lichter je Schwierigkeit,
 * Spuren nach Melodieverlauf, Begleitung (Bass + Akkorde), Treffer-Wertung, Sterne. Zeiten in Sekunden. */
(function (root) {
  'use strict';
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
  const ROOT = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, H: 11 };
  const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LEVELS = { leicht: { lanes: 4, fall: 2.1, gap: 0.34, any: true, n: 'Leicht', medal: 'bronze' }, normal: { lanes: 5, fall: 1.7, gap: 0.2, any: false, n: 'Mittel', medal: 'silber' }, profi: { lanes: 6, fall: 1.35, gap: 0.1, any: false, n: 'Schwer', medal: 'gold' } };
  // Spielmodi: tiles = Kacheln mit Leben (Piano-Tiles-Art), lights = Lichter (Magic-Piano-Art, ohne Verlieren)
  const MODES = {
    klassisch: { n: 'Klassisch', ic: '🎹', view: 'tiles', lives: 3, crowns: true, d: 'Kacheln im Takt tippen – danach schneller für bis zu drei Kronen 👑. Drei Fehler und es ist vorbei.' },
    magie: { n: 'Magie', ic: '✨', view: 'lights', lives: 0, d: 'Leuchtende Lichter fallen auf die Tasten – entspannt spielen, ohne Verlieren.' },
    endlos: { n: 'Endlos', ic: '♾️', view: 'tiles', lives: 3, loop: true, d: 'Das Lied läuft immer weiter und wird jede Runde schneller – wie lange hältst du durch?' },
    ueben: { n: 'Üben', ic: '🧘', view: 'tiles', lives: 0, practice: true, d: 'Ohne Fehler-Strafe und mit wählbarem Tempo – zum Lernen neuer Lieder.' },
    tag: { n: 'Tages-Challenge', ic: '📅', view: 'tiles', lives: 3, daily: true, crowns: true, d: 'Jeden Tag ein anderes Lied auf Mittel – schaffst du drei Sterne?' },
    battle: { n: 'Battle', ic: '⚔️', view: 'tiles', lives: 0, net: true, d: 'Zwei Geräte, ein Lied – wer holt mehr Punkte?' },
    duett: { n: 'Duett', ic: '🤝', view: 'tiles', lives: 0, net: true, d: 'Zwei Geräte spielen zusammen: einer die Melodie, einer den Bass.' },
    hoeren: { n: 'Zuhören', ic: '🎧', view: 'lights', lives: 0, auto: true, d: 'Das Klavier spielt das Lied ganz allein vor.' },
    turnier: { n: 'Turnier der Woche', ic: '🏆', view: 'tiles', lives: 3, tour: true, d: 'Fünf Lieder hintereinander, für alle gleich – mit Wochen-Rangliste für angemeldete Spieler.' },
    lernen: { n: 'Klavier lernen', ic: '🎓', view: 'keys', lives: 0, practice: true, learn: true, d: 'Das Lied läuft, die nächsten Tasten leuchten farbig in der richtigen Reihenfolge – spiel live mit.' },
    frei: { n: 'Freies Klavier', ic: '🎼', view: 'keys', lives: 0, free: true, d: 'Ein echtes Klavier mit allen Tönen – frei spielen, mit Oktaven und Haltepedal.' }
  };
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
    return { v: 1, id: s.id, title: s.title, artist: s.artist, cat: s.cat, bpm: s.bpm, step: step * 1000, off: 0, mel, chords, bass, builtin: true, lic: s.lic || '', src: 'Klaviersatz: easygames (eigene Notensetzung)' };
  }
  function check(c) { return c && c.v === 1 && Array.isArray(c.mel) && c.mel.length > 0 && c.step > 0; }
  // Spielbare Lichter: Melodienoten mit Mindestabstand je Schwierigkeit; Spur folgt dem Melodieverlauf (höher = weiter rechts)
  function playable(c, level, lanes) {
    const L = LEVELS[level] || LEVELS.normal, st = c.step / 1000, off = (c.off || 0) / 1000, notes = [];
    for (const [s, p, d] of c.mel) { const t = off + s * st; if (notes.length && t - notes[notes.length - 1].t < L.gap) continue; notes.push({ t, p, d: Math.max(st, d * st), lane: 0, hit: null }); }
    return lanesFor(notes, lanes || L.lanes);
  }
  // gleitendes Fenster: Tonhöhe relativ zu den Nachbarn → Spur (sieht aus wie die Melodie, springt nicht wild)
  function lanesFor(notes, N) {
    if (!notes.length) return notes;
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
    if (Array.isArray(c.acc) && c.acc.length) {   // Original-Satz (z. B. Bach-Choral, Klavierstück): echte Begleitstimmen
      for (const [s, p, d] of c.acc) ev.push([off + s * st, p, Math.max(st, d * st), p < 50 ? 0.34 : 0.24]);
      return ev.sort((a, b) => a[0] - b[0]);
    }
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
  // Tempo ändern (Üben, Endlos): gleiche Noten, anderer Takt
  function withRate(c, rate) { return Object.assign({}, c, { step: c.step / rate, off: (c.off || 0) / rate, bpm: (c.bpm || 100) * rate }); }
  // Tages-Lied: fest je Datum (alle Spieler bekommen dasselbe)
  function dailyIndex(n, date) { const d = date || new Date(), s = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(); let x = (s * 2654435761) >>> 0; x ^= x >>> 13; return x % n; }
  /* Doppelkacheln (Magic-Tiles-Art): auf betonten Zählzeiten eine zweite Kachel mit dem Begleitton, der gleichzeitig erklingt.
   * every = Abstand in Sechzehnteln (16 = jeder Takt, 8 = jeder halbe Takt). Der Begleitton wird aus der Begleitung genommen (v = 0). */
  function doubles(c, notes, acc, every, lanes) {
    if (!every || !acc.length) return 0; const st = c.step / 1000, off = (c.off || 0) / 1000; let n = 0, ai = 0;
    const out = [];
    for (const m of notes) {
      const slot = Math.round((m.t - off) / st); if (slot % every) continue;
      while (ai < acc.length && acc[ai][0] < m.t - 0.03) ai++;
      let best = -1; for (let j = ai; j < acc.length && acc[j][0] <= m.t + 0.03; j++) if (acc[j][3] > 0 && acc[j][1] < m.p - 2 && (best < 0 || acc[j][1] < acc[best][1])) best = j;
      if (best < 0) continue;
      const lane = m.lane < lanes / 2 ? m.lane + Math.floor(lanes / 2) : m.lane - Math.floor(lanes / 2);
      if (notes.some(o => o.lane === lane && Math.abs(o.t - m.t) < 0.5) || out.some(o => o.lane === lane && Math.abs(o.t - m.t) < 0.5)) continue;
      out.push({ t: m.t, p: acc[best][1], d: Math.min(m.d, acc[best][2]), lane, hit: null, twin: true }); acc[best][3] = 0; n++;
    }
    for (const o of out) notes.push(o); notes.sort((a, b) => a.t - b.t || a.lane - b.lane); return n;
  }
  // Ausschnitt eines Liedes (Sechzehntel from..to), reps-mal hintereinander – zum Üben von Fehlerstellen
  function slice(c, from, to, reps) {
    const L = to - from, pick = a => (a || []).filter(x => x[0] >= from && x[0] < to).map(x => { const y = x.slice(); y[0] -= from; return y; });
    const base = { mel: pick(c.mel), acc: pick(c.acc), chords: pick(c.chords), bass: pick(c.bass) }, out = Object.assign({}, c, { mel: [], acc: [], chords: [], bass: [], off: 0 });
    for (let r = 0; r < (reps || 1); r++) for (const k of ['mel', 'acc', 'chords', 'bass']) for (const x of base[k]) { const y = x.slice(); y[0] += r * L; out[k].push(y); }
    return out;
  }
  /* Klaviertastatur: schwarze Tasten, Tonbereich für ein Lied, Lage der Tasten (für Lernen und freies Spiel) */
  const isBlack = p => [1, 3, 6, 8, 10].includes(((p % 12) + 12) % 12);
  const DE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'];
  const keyName = p => DE[((p % 12) + 12) % 12] + (Math.floor(p / 12) - 1);
  // Tonbereich: höchstens maxSemis Halbtöne; Töne außerhalb werden oktaviert. Ränder auf weiße Tasten. Ändert notes[].p.
  function keyRange(notes, maxSemis) {
    if (!notes.length) return { lo: 60, hi: 83 };
    const ps = notes.map(n => n.p), lo0 = Math.min(...ps), hi0 = Math.max(...ps); let a = lo0;
    if (hi0 - lo0 > maxSemis) { let best = -1; for (let x = lo0; x <= hi0 - maxSemis; x++) { const c = ps.filter(p => p >= x && p <= x + maxSemis).length; if (c > best) { best = c; a = x; } } }
    const b = Math.min(hi0, a + maxSemis);
    for (const n of notes) { while (n.p < a) n.p += 12; while (n.p > b) n.p -= 12; }
    let lo = Math.min(...notes.map(n => n.p)), hi = Math.max(...notes.map(n => n.p));
    lo--; while (isBlack(lo)) lo--; hi++; while (isBlack(hi)) hi++;
    return { lo, hi };
  }
  // Tasten zwischen lo und hi (beide weiß) auf Breite W: weiße gleich breit, schwarze schmaler darüber
  function keyLayout(lo, hi, W) {
    const whites = []; for (let p = lo; p <= hi; p++) if (!isBlack(p)) whites.push(p);
    const ww = W / whites.length, bw = ww * 0.62, keys = [], pos = {};
    whites.forEach((p, i) => { pos[p] = i; keys.push({ p, black: false, x: i * ww, w: ww }); });
    for (let p = lo; p <= hi; p++) if (isBlack(p) && pos[p - 1] != null) keys.push({ p, black: true, x: (pos[p - 1] + 1) * ww - bw / 2, w: bw });
    return { keys, ww, bw, whites: whites.length };
  }
  // Taste unter dem Punkt (rx 0..W, ry 0..1 von oben über die Tastatur): schwarze Tasten zuerst
  function keyAt(lay, rx, ry) {
    if (ry < 0.62) for (const k of lay.keys) if (k.black && rx >= k.x && rx < k.x + k.w) return k.p;
    for (const k of lay.keys) if (!k.black && rx >= k.x && rx < k.x + k.w) return k.p;
    return null;
  }
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const API = { NAMES, LEVELS, MODES, withRate, dailyIndex, WIN, midi, fromNotation, check, playable, accompaniment, judge, scoreHit, newState, accuracy, stars, difficulty, duration, fmt, isBlack, keyName, keyRange, keyLayout, keyAt, doubles, slice, lanesFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLCore = API;
})(typeof window !== 'undefined' ? window : globalThis);
