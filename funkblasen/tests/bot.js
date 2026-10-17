// Einfacher, gieriger Test-Spieler: probiert viele Winkel (mit und ohne Tausch) und nimmt den besten Schuss.
// Wird von den Tests genutzt, um alle 150 Level wirklich mit der Spiel-Engine durchzuspielen.
'use strict';
const E = require('../engine.js');

const ANGLES = []; for (let a = E.MIN_ANG; a <= Math.PI - E.MIN_ANG + 1e-9; a += 0.022) ANGLES.push(a);

function evaluate(st, ang) {
  const t = E.clone(st), sim = E.simulate(t, ang), bubble = t.cur;
  const before = t.rescued, ev = E.land(t, sim, bubble), cell = sim.cell;
  const eff = cell.r + t.ceil;
  let s = ev.popped.length * 3 + ev.dropped.length * 4 + (t.rescued - before) * 25 + ev.thawed.length * 2;
  if (!ev.popped.length && bubble.c >= 0) {   // Vorbereitung: gleiche Farbe daneben
    let same = 0; for (const [a, b] of E.neighbors(t, cell.r, cell.c)) { const n = t.grid[a][b]; if (n && E.matchable(n) && n.c === bubble.c) same++; }
    s += same * 1.6 - 1.5;
  }
  if (st.goal.type === 'clear' && E.coloredCount(t) === 0) s += 1000;
  if (st.goal.type === 'rescue' && t.rescued >= t.goal.n) s += 1000;
  if (E.maxRow(t) >= E.DANGER) s -= 500;
  s -= eff * 0.15;
  return s;
}
function bestShot(st) {
  let best = { s: -Infinity, ang: Math.PI / 2, swap: false };
  const seen = new Map();
  for (const swap of [false, true]) {
    const t = swap ? E.clone(st) : st; if (swap) E.swap(t);
    for (const ang of ANGLES) {
      const sim = E.simulate(t, ang), key = (swap ? 1 : 0) + ':' + sim.cell.r + ':' + sim.cell.c;
      let s = seen.get(key);
      if (s == null) { s = evaluate(t, ang); seen.set(key, s); }
      if (s > best.s + 1e-9) best = { s, ang, swap };
    }
  }
  return best;
}
// Spielt ein Level komplett. Rückgabe: { win, shots, stars, score, reason }
function play(def, maxShots) {
  const st = E.createState(def);
  for (let i = 0; i < (maxShots || 400); i++) {
    const b = bestShot(st);
    if (b.swap) E.swap(st);
    const { sim, bubble } = E.shoot(st, b.ang);
    E.land(st, sim, bubble);
    const res = E.afterShot(st);
    if (res.status === 'win') return { win: true, shots: st.shotsUsed, left: st.shotsLeft, stars: E.stars(st), score: st.score };
    if (res.status === 'lose') return { win: false, shots: st.shotsUsed, left: st.shotsLeft, reason: res.reason, score: st.score, rest: E.coloredCount(st) };
  }
  return { win: false, reason: 'timeout', shots: st.shotsUsed };
}
module.exports = { play, bestShot, evaluate };
