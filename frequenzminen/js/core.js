/* Frequenz-Minen 3D – Spiellogik (ohne DOM, auch in Node testbar).
 * Raster aus Funkplatten, darunter versteckte Störsender. Eine aufgedeckte Platte zeigt, wie viele Störsender ringsum (8 Nachbarn) rauschen.
 * Der erste Klick ist immer sicher (er und seine Nachbarn sind frei). Sieg: alle freien Platten aufgedeckt. */
(function (root) {
  'use strict';
  const DIFF = {
    leicht: { w: 9, h: 9, m: 10, mult: 1, par: 120, n: 'Leicht' },
    mittel: { w: 12, h: 12, m: 24, mult: 2, par: 300, n: 'Mittel' },
    schwer: { w: 12, h: 18, m: 44, mult: 4, par: 600, n: 'Schwer' },
    daily: { w: 12, h: 12, m: 26, mult: 2, par: 300, n: 'Tagesrätsel' }
  };
  const HINTS = 3, HINT_SEC = 20;
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // Spielfeld anlegen; Störsender werden erst beim ersten Aufdecken verteilt (erster Klick sicher)
  function newBoard(w, h, m, seed) {
    m = Math.max(1, Math.min(m, w * h - 9));
    return { w, h, m, seed: seed == null ? (Math.random() * 4294967296) >>> 0 : seed >>> 0, mine: new Uint8Array(w * h), num: new Uint8Array(w * h),
      st: new Uint8Array(w * h), placed: false, opened: 0, flags: 0, done: false, won: false, boom: -1, hints: HINTS, hintsUsed: 0 };
  }
  // st: 0 = verdeckt, 1 = offen, 2 = Peiler (Fahne)
  function nb(b, i) { const x = i % b.w, y = (i / b.w) | 0, r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < b.w && ny < b.h) r.push(ny * b.w + nx); } return r; }
  function place(b, safe) {
    const rnd = mulberry(b.seed), ban = new Set([safe].concat(nb(b, safe))), free = [];
    for (let i = 0; i < b.w * b.h; i++) if (!ban.has(i)) free.push(i);
    for (let k = 0; k < b.m; k++) { const j = k + Math.floor(rnd() * (free.length - k)); const t = free[k]; free[k] = free[j]; free[j] = t; b.mine[free[k]] = 1; }
    for (let i = 0; i < b.w * b.h; i++) b.num[i] = nb(b, i).reduce((s, j) => s + b.mine[j], 0);
    b.placed = true;
  }
  // Aufdecken mit Flutfüllung; liefert die neu geöffneten Felder in Reihenfolge (für die Welle in 3D)
  function reveal(b, i) {
    if (b.done || b.st[i] !== 0) return { res: 'noop', opened: [] };
    if (!b.placed) place(b, i);
    if (b.mine[i]) { b.st[i] = 1; b.done = true; b.won = false; b.boom = i; return { res: 'boom', opened: [i] }; }
    const opened = [], q = [i]; b.st[i] = 1;
    while (q.length) { const c = q.shift(); opened.push(c); b.opened++; if (b.num[c] === 0) for (const n of nb(b, c)) if (b.st[n] === 0 && !b.mine[n]) { b.st[n] = 1; q.push(n); } }
    if (b.opened === b.w * b.h - b.m) { b.done = true; b.won = true; }
    return { res: b.won ? 'win' : 'open', opened };
  }
  function flag(b, i) {
    if (b.done || b.st[i] === 1) return false;
    if (b.st[i] === 2) { b.st[i] = 0; b.flags--; } else { b.st[i] = 2; b.flags++; }
    return true;
  }
  // Zahl antippen: stimmen die Peiler ringsum, werden alle übrigen Nachbarn aufgedeckt
  function chord(b, i) {
    if (b.done || b.st[i] !== 1 || !b.num[i]) return { res: 'noop', opened: [] };
    const ns = nb(b, i); if (ns.filter(n => b.st[n] === 2).length !== b.num[i]) return { res: 'noop', opened: [] };
    let all = [];
    for (const n of ns) if (b.st[n] === 0) { const r = reveal(b, n); all = all.concat(r.opened); if (r.res === 'boom') return { res: 'boom', opened: all }; }
    return { res: b.won ? 'win' : all.length ? 'open' : 'noop', opened: all };
  }
  // Peilung (Hinweis): deckt eine sichere Platte auf – bevorzugt am Rand des aufgedeckten Bereichs
  function hint(b) {
    if (b.done || b.hints <= 0) return -1;
    const cand = [], edge = [];
    for (let i = 0; i < b.w * b.h; i++) if (b.st[i] !== 1 && !b.mine[i]) { cand.push(i); if (nb(b, i).some(n => b.st[n] === 1)) edge.push(i); }
    if (!b.placed) return -1;
    const pool = edge.length ? edge : cand; if (!pool.length) return -1;
    const i = pool[Math.floor(mulberry(b.seed + b.opened * 31 + b.hintsUsed)() * pool.length)];
    if (b.st[i] === 2) { b.st[i] = 0; b.flags--; }
    b.hints--; b.hintsUsed++; return i;
  }
  // Punkte: freie Platten × Faktor, beim Sieg Bonus für Tempo, Abzug für Peilungen
  function points(b, diff, sec) {
    const d = DIFF[diff] || DIFF.mittel, base = b.opened * d.mult;
    if (!b.won) return base;
    return Math.max(base, base + d.mult * (500 + Math.max(0, d.par - sec) * 5) - b.hintsUsed * 50 * d.mult);
  }
  function daily(d) { const k = dayKey(d), c = DIFF.daily; return { key: k, board: newBoard(c.w, c.h, c.m, hash('frequenzminen:' + k)) }; }
  // Tagesrätsel: erster Klick immer in der Mitte, damit alle dasselbe Feld bekommen
  function dailyStart(b) { return ((b.h / 2) | 0) * b.w + ((b.w / 2) | 0); }
  function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

  const FM = { DIFF, HINTS, HINT_SEC, mulberry, hash, dayKey, newBoard, nb, place, reveal, flag, chord, hint, points, daily, dailyStart, fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = FM;
  root.FM = FM;
})(typeof window !== 'undefined' ? window : globalThis);
