/* Titanparcours – Planer-Bot: simuliert kurze Zukünfte mit der echten Physik und wählt die beste Aktion.
   Wird für Tests (sind die Parcours machbar?) und als Computer-Gegner/Geist benutzt. */
import { Sim, DT, G, PH, swingBall, LOG_HW, LOG_HH, LADDER_HOP, LADDER_EARLY } from './engine.js';
const CANDS = [{ r: 1 }, { r: 1, j: 1, hold: 0.4 }, { r: 1, j: 1, hold: 0.14 }, { r: 1, j: 1, hold: 0.24 }, {}, { l: 1 }, { r: 1, d: 1, hold: 0.4 }, { d: 1, hold: 0.3 }, { pol: 1, hold: 0.3 }];
/** Muss der Läufer gleich ducken? (Tor oder tief schwingender Pendelbalken kurz voraus) */
const duckAhead = s => {
  for (const q of s.solids) if (q.gate && q.x0 - (s.x + 0.25) < 1.3 && q.x1 > s.x - 0.3) return true;
  // Pendelbalken: im ganzen Schwingbereich geduckt bleiben (sicher, aber langsamer als den richtigen Moment abzupassen)
  for (const o of s.c.o) if (o.k === 'log' && Math.abs(o.py - o.len - s.y - 1.36) < 0.6 && Math.abs(o.px - s.x) < o.len * Math.sin(o.amp) + LOG_HW + 0.8) return true;
  return false;
};
// Fortsetzung: rennen, am Plattformrand springen (an den Stangen greift der Läufer von selbst)
export const policy = s => {
  if (s.ladder) return { j: !s.prevJ && s.ladder.cool <= LADDER_HOP - LADDER_EARLY - 0.04 ? 1 : 0 };   // Lachsleiter: im Takt drücken
  if (s.hang) { const o = s.c.o[s.hang.bar]; return { r: 1, j: o.ledge && s.x >= o.x2 - 0.1 ? 1 : 0 }; }   // Griffleiste: am Ende hechten
  if (s.rope) return { r: 1, j: s.rope.a > 0.2 && s.rope.da > 0 ? 1 : 0 };   // am Seil: loslassen, wenn es nach vorn schwingt
  if (s.onGround && s.ground && s.ground.x1 - s.x >= 0.6 && duckAhead(s)) return { r: 1, d: 1 };
  if (s.onGround && s.ground) { const g = s.ground; if (g.x1 - s.x >= 0.45 || g.wall) return { r: 1, j: 0 };
    // schließt die nächste Fläche fast nahtlos an (z. B. Drehwalzen), einfach weiterlaufen
    return { r: 1, j: s.solids.some(q => q !== g && !q.wall && Math.abs(q.top - g.top) < 0.05 && q.x0 > g.x1 - 0.05 && q.x0 - g.x1 < 0.45) ? 0 : 1 }; }
  // in der Luft: Sprung halten, außer der volle Sprung flöge über die nächste Fläche hinaus (dann kurz = kleiner Sprung)
  if (s.vy <= 0.5) return { r: 1, j: 0 };
  let nx = null; for (const q of s.solids) if (q.x1 > s.x + 0.6 && q.top <= s.y + 1.6 && !q.wall && (!nx || q.x0 < nx.x0)) nx = q;
  if (nx) { const t = (s.vy + Math.sqrt(s.vy * s.vy + 2 * G * Math.max(0, s.y - nx.top))) / G; if (s.x + s.vx * t > nx.x1 - 0.35) return { r: 1, j: 0 }; }
  return { r: 1, j: 1 };
};
function score(sim, c0, H) {
  const s = sim.clone(); const n0 = Math.round((c0.hold || 0.12) / DT); let steps = 0;
  for (; steps < n0 && !s.dead && !s.finished; steps++) { const inp = c0.pol ? policy(s) : { l: c0.l, r: c0.r, j: c0.j && steps * DT < (c0.hold || 0), d: c0.d }; s.step(inp); }
  const HN = Math.round(H / DT); for (let k = 0; k < HN && !s.dead && !s.finished; k++, steps++) { const p = policy(s); s.step(p); }
  if (s.finished) return 100000 - s.t; if (s.dead) return -1000 + steps * 0.5 + s.dist * 0.01;
  return s.x + (s.onGround || s.hang ? 0.5 : 0) + s.y * 0.05 - s.hits * 3;
}
export function plan(sim, opts = {}) {
  if (sim.ladder) return CANDS[CANDS.length - 1];   // an der Lachsleiter zählt nur der Takt
  const H = opts.horizon || 2.0; let best = -Infinity, pick = CANDS[0];
  CANDS.forEach((c, i) => { const v = score(sim, c, H) - i * 0.002; if (v > best + 1e-9) { best = v; pick = c; } }); return pick;
}
/** Läuft einen kompletten Parcours; latency = Verzögerung der Eingaben in Sekunden (menschlich ≈ 0.12). Liefert {finished, time, dist, dead, frames}. */
export function runBot(course, { maxT = 150, latency = 0, horizon = 2.0, record = false, startX = null, t0 = 0, untilX = Infinity } = {}) {
  const sim = new Sim(course); let cur = {}, holdUntil = 0, decideAt = t0; const queue = [], frames = [];
  if (startX != null) { const p = course.o.find(o => (o.k === 'plat') && o.x <= startX && o.x + o.w >= startX); sim.x = startX; sim.y = p ? p.y : sim.y; sim.t = t0; sim.collect(); }
  while (!sim.dead && !sim.finished && sim.t < maxT && !(sim.x >= untilX && sim.onGround)) {
    if (sim.t >= decideAt) { const c = plan(sim, { horizon }); cur = c; holdUntil = sim.t + (c.hold || 0.1); decideAt = sim.t + 0.05; queue.push({ at: sim.t + latency, c: Object.assign({}, c, { until: sim.t + (c.hold || 0.1) + latency }) }); }
    let inp = {}; for (let i = queue.length - 1; i >= 0; i--) if (queue[i].at <= sim.t) { inp = queue[i].c; while (queue.length > 12) queue.shift(); break; }
    sim.step(inp.pol ? policy(sim) : { l: inp.l, r: inp.r, j: inp.j && sim.t < (inp.until || 0), d: inp.d });
    if (record && frames.length < 20000) frames.push(Math.round(sim.x * 100) / 100, Math.round(sim.y * 100) / 100);
  }
  return { finished: sim.finished, time: sim.t, dist: sim.dist, dead: sim.dead, hits: sim.hits, frames, x: sim.x, passed: sim.finished || sim.x >= untilX };
}
