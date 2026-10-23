/* Saftblitz – Spielkern ohne DOM (Browser und Node): Früchte, Modi, Wellen, Treffer, Wertung.
 * Welt: Höhe 1, Breite = Seitenverhältnis (W/H), y wächst nach unten. */
(function (root) {
  'use strict';
  // Früchte: eigene Gestaltung (Schale, Fruchtfleisch, Kerne), Größe relativ
  const FRUITS = {
    apfel: { n: 'Apfel', r: .062, shape: 'round', skin: ['#ff5a5f', '#c81d2b', '#7a0d18'], flesh: '#fff2cf', rind: '#e23a40', seed: '#4a2c12', juice: '#ffe7a3', pts: 1 },
    orange: { n: 'Orange', r: .064, shape: 'round', skin: ['#ffb347', '#ff8a1f', '#c45a05'], flesh: '#ffb04a', rind: '#ff8a1f', seed: '#fff1c8', juice: '#ffa53a', pts: 1, segs: true },
    melone: { n: 'Wassermelone', r: .092, shape: 'round', skin: ['#5fd35a', '#1f8a2f', '#0d4a18'], stripes: '#0f5a1e', flesh: '#ff3d5a', rind: '#d8ffcf', seed: '#2a1308', juice: '#ff4d6a', pts: 1 },
    kiwi: { n: 'Kiwi', r: .052, shape: 'oval', skin: ['#b88a52', '#8a5c2c', '#4d3013'], flesh: '#8bd43a', rind: '#d6f5a0', seed: '#1d1208', juice: '#a6e35a', pts: 1, core: '#f4ffd8' },
    zitrone: { n: 'Zitrone', r: .055, shape: 'lemon', skin: ['#fff36a', '#ffd600', '#c9a200'], flesh: '#fff27a', rind: '#ffe14a', seed: '#fffbe0', juice: '#fff07a', pts: 1, segs: true },
    pflaume: { n: 'Pflaume', r: .05, shape: 'round', skin: ['#c08cff', '#7a2fc9', '#3a0f6b'], flesh: '#ffd34d', rind: '#8f3ad8', seed: '#8a4a12', juice: '#c86cff', pts: 1 },
    erdbeere: { n: 'Erdbeere', r: .05, shape: 'berry', skin: ['#ff6b81', '#e8213f', '#8a0a1d'], flesh: '#ff8fa0', rind: '#ff4d66', seed: '#ffe27a', juice: '#ff3d5a', pts: 1 },
    drache: { n: 'Drachenfrucht', r: .066, shape: 'oval', skin: ['#ff7ac8', '#e0218a', '#8a0a4d'], flesh: '#fbfbff', rind: '#ff4da6', seed: '#111', juice: '#ff9ad4', pts: 1 }
  };
  const FRUIT_KEYS = Object.keys(FRUITS);
  // Besonderes: Bombe, Power-Früchte (Arcade/Rhythmus), Herz (Klassik: +1 Leben), Gold-Kokosnuss (mehrfach schneiden)
  const SPECIAL = {
    bombe: { n: 'Bombe', r: .058 },
    frost: { n: 'Frost', r: .056, color: '#7fe8ff', power: 'frost' },
    rausch: { n: 'Rausch', r: .056, color: '#ff8a1f', power: 'rausch' },
    doppelt: { n: 'Doppelt', r: .056, color: '#ffd84d', power: 'doppelt' },
    herz: { n: 'Herzfrucht', r: .05, color: '#ff3d7f' },
    kokos: { n: 'Gold-Kokosnuss', r: .075, color: '#ffc94d', hits: 8 }
  };
  const MODES = {
    klassik: { n: 'Klassik', lives: 3, time: 0, bombs: 'aus', power: false, heart: true },
    arcade: { n: 'Arcade', lives: 0, time: 60, bombs: 'minus', power: true, crit: true, kokos: true },
    zen: { n: 'Zen', lives: 0, time: 90, bombs: false, power: false },
    rhythmus: { n: 'Radio-Rhythmus', lives: 0, time: 90, bombs: 'minus', power: true, bpm: 112, beat: true },
    duo: { n: '2 Spieler', lives: 0, time: 60, bombs: 'minus', power: false, crit: true }
  };
  const G = 1.55; // Schwerkraft (Welt-Höhen je s²)

  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // Abstand Punkt–Strecke ≤ r?
  function segHit(ax, ay, bx, by, cx, cy, r) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? ((cx - ax) * dx + (cy - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx - cx, py = ay + t * dy - cy;
    return px * px + py * py <= r * r;
  }

  // Wurf von unten: Ziel-Gipfelhöhe peakY (0 = oben), Start x, Richtung zur Mitte
  function launch(rnd, W, peakY, x0) {
    const y0 = 1.12, h = y0 - peakY, vy = -Math.sqrt(2 * G * h), tUp = -vy / G;
    const tx = W * (.2 + rnd() * .6); // Gipfel irgendwo im mittleren Bereich
    const vx = (tx - x0) / tUp * (.7 + rnd() * .4);
    return { x: x0, y: y0, vx, vy, rot: (rnd() - .5) * 6 };
  }

  // Nächste Welle: wird vom Spiel aufgerufen, sobald der Bildschirm (fast) leer ist bzw. nach Takt
  // level: 0…1 steigt mit Spielzeit/Punkten
  function wave(modeKey, level, W, rnd, opt) {
    opt = opt || {};
    const M = MODES[modeKey], out = [];
    const rausch = opt.rausch; // Rausch: Früchte schießen von den Seiten
    let n = Math.max(1, Math.round(1 + level * 4 + rnd() * (1.5 + level * 2)));
    if (rausch) n = 3 + ((rnd() * 4) | 0);
    const salvo = rnd() < .25 + level * .3; // gleichzeitig oder nacheinander
    for (let k = 0; k < n; k++) {
      const x0 = W * (.1 + rnd() * .8), peak = .1 + rnd() * (.32 - level * .08);
      const s = rausch ? side(rnd, W) : launch(rnd, W, peak, x0);
      s.type = FRUIT_KEYS[(rnd() * FRUIT_KEYS.length) | 0];
      s.delay = salvo ? rnd() * .12 : k * (.18 + rnd() * .28);
      out.push(s);
    }
    if (rausch) return out;
    // Bomben
    if (M.bombs) {
      const pb = Math.min(.55, .08 + level * .5);
      const nb = rnd() < pb ? (rnd() < level * .5 ? 2 : 1) : 0;
      for (let k = 0; k < nb; k++) { const s = launch(rnd, W, .15 + rnd() * .25, W * (.15 + rnd() * .7)); s.type = 'bombe'; s.delay = rnd() * .5; out.push(s); }
    }
    if (M.power && rnd() < .14) { const s = launch(rnd, W, .12 + rnd() * .15, W * (.2 + rnd() * .6)); s.type = ['frost', 'rausch', 'doppelt'][(rnd() * 3) | 0]; s.delay = rnd() * .4; out.push(s); }
    if (M.heart && opt.lives < M.lives && rnd() < .05) { const s = launch(rnd, W, .2, W * (.2 + rnd() * .6)); s.type = 'herz'; s.delay = .2; out.push(s); }
    if (M.kokos && opt.late && !opt.kokosDone && rnd() < .35) { const s = launch(rnd, W, .25, W * .5); s.vx *= .3; s.type = 'kokos'; s.delay = .3; out.push(s); }
    return out;
  }
  function side(rnd, W) {
    const left = rnd() < .5, y = .35 + rnd() * .4;
    return { x: left ? -.08 : W + .08, y, vx: (left ? 1 : -1) * (W * (.55 + rnd() * .45)), vy: -(.55 + rnd() * .5), rot: (rnd() - .5) * 8 };
  }

  // Wertung eines Schnitts (alle Treffer eines Wischzugs zusammen)
  // hits: Anzahl Früchte in diesem Zug; opt: { doppelt, crit, onBeat, streak }
  function scoreSwipe(hits, opt) {
    opt = opt || {};
    if (!hits) return { pts: 0, combo: 0 };
    let pts = hits, combo = hits >= 3 ? hits : 0;
    pts += combo;
    if (opt.crit) pts += 10;
    if (opt.onBeat) pts += hits * Math.min(4, 1 + (opt.streak || 0) / 4 | 0);
    if (opt.doppelt) pts *= 2;
    return { pts, combo };
  }
  // Level-Kurve: nach etwa 2 Minuten Klassik voll
  const levelOf = (modeKey, t, score) => modeKey === 'zen' ? Math.min(.75, t / 90) : Math.min(1, Math.max(t / 120, score / 400));

  // Freischaltbares (Klingen, Hintergründe) – nach Gesamtpunkten aller Runden
  const BLADES = [
    { k: 'neon', n: 'Neon', need: 0, c: ['#ffffff', '#00E5FF'] },
    { k: 'anmacha', n: 'AnMaCha', need: 300, c: ['#fff3e0', '#FF8A1F'] },
    { k: 'feuer', n: 'Feuer', need: 900, c: ['#fff1a8', '#ff4d1a'], spark: true },
    { k: 'regen', n: 'Regenbogen', need: 2000, rainbow: true },
    { k: 'blitz', n: 'Blitz', need: 3500, c: ['#ffffff', '#b28bff'], zap: true },
    { k: 'gold', n: 'Gold', need: 6000, c: ['#fffbe6', '#ffc94d'], spark: true }
  ];
  const SCENES = [
    { k: 'studio', n: 'Funkstudio', need: 0 },
    { k: 'strand', n: 'Strand', need: 600 },
    { k: 'nacht', n: 'Neon-Nacht', need: 1500 },
    { k: 'club', n: 'Club', need: 3000 }
  ];
  // Erfolge: id, Text, Prüfung auf den Rundenwerten r = { mode, score, fruits, maxCombo, crit, bombs, power, kokos, perfect, missed, won? } bzw. Gesamtwerte g
  const ACH = [
    ['erst', 'Erster Schnitt – spiele eine Runde', (r) => r.fruits > 0],
    ['k50', 'Klassik: 50 Punkte', (r) => r.mode === 'klassik' && r.score >= 50],
    ['k150', 'Klassik: 150 Punkte', (r) => r.mode === 'klassik' && r.score >= 150],
    ['k300', 'Klassik: 300 Punkte', (r) => r.mode === 'klassik' && r.score >= 300],
    ['a200', 'Arcade: 200 Punkte', (r) => r.mode === 'arcade' && r.score >= 200],
    ['a400', 'Arcade: 400 Punkte', (r) => r.mode === 'arcade' && r.score >= 400],
    ['z150', 'Zen: 150 Punkte', (r) => r.mode === 'zen' && r.score >= 150],
    ['r250', 'Radio-Rhythmus: 250 Punkte', (r) => r.mode === 'rhythmus' && r.score >= 250],
    ['takt30', '30 Schnitte genau im Takt', (r) => r.perfect >= 30],
    ['c4', '4er-Combo', (r) => r.maxCombo >= 4],
    ['c6', '6er-Combo', (r) => r.maxCombo >= 6],
    ['krit', '3 kritische Treffer in einer Runde', (r) => r.crit >= 3],
    ['kokos', 'Gold-Kokosnuss ganz zerlegt', (r) => r.kokos >= 1],
    ['power', '3 Power-Früchte in einer Runde', (r) => r.power >= 3],
    ['clean', 'Klassik: 100 Punkte, ohne eine Frucht fallen zu lassen', (r) => r.mode === 'klassik' && r.score >= 100 && r.missed === 0],
    ['duo', '2-Spieler-Runde gespielt', (r) => r.mode === 'duo'],
    ['tausend', '1000 Früchte insgesamt', (r, g) => g.fruits >= 1000],
    ['alle', 'Alle Klingen freigeschaltet', (r, g) => g.total >= BLADES[BLADES.length - 1].need]
  ];

  const SB = { FRUITS, FRUIT_KEYS, SPECIAL, MODES, G, rng, segHit, launch, wave, scoreSwipe, levelOf, BLADES, SCENES, ACH };
  if (typeof module !== 'undefined' && module.exports) module.exports = SB;
  root.SB = SB;
})(typeof self !== 'undefined' ? self : this);
