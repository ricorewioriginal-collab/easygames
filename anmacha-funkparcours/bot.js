/* Funkparcours – Planer-Bot: simuliert kurze Zukünfte mit der echten Physik und wählt die beste Aktion.
   Wird für Tests (sind die Parcours machbar?) und als Computer-Gegner/Geist benutzt. */
import { Sim, DT } from './engine.js';
const CANDS = [{ r: 1 }, { r: 1, j: 1, hold: 0.4 }, { r: 1, j: 1, hold: 0.14 }, { r: 1, j: 1, hold: 0.24 }, { r: 1, j: 1, g: 1, hold: 0.4 }, { r: 1, g: 1 }, {}, { l: 1 }];
// Fortsetzung: rennen, am Plattformrand springen, in der Luft nahe Stangen greifen
const policy = s => {
  if (s.hang) return { r: 1, g: 1 };
  if (s.onGround && s.ground) return { r: 1, j: s.ground.x1 - s.x < 0.45 && !s.ground.wall ? 1 : 0 };
  return { r: 1, j: s.vy > 0.5 ? 1 : 0, g: s.nearBar() ? 1 : 0 };
};
function score(sim, c0, H) {
  const s = sim.clone(); const n0 = Math.round((c0.hold || 0.12) / DT); let steps = 0;
  for (; steps < n0 && !s.dead && !s.finished; steps++) { const inp = { l: c0.l, r: c0.r, j: c0.j && steps * DT < (c0.hold || 0), g: c0.g }; s.step(inp); }
  const HN = Math.round(H / DT); for (let k = 0; k < HN && !s.dead && !s.finished; k++, steps++) { const p = policy(s); s.step(p); }
  if (s.finished) return 100000 - s.t; if (s.dead) return -1000 + steps * 0.5 + s.dist * 0.01;
  return s.x + (s.onGround || s.hang ? 0.5 : 0) + s.y * 0.05 - s.hits * 3;
}
export function plan(sim, opts = {}) {
  const H = opts.horizon || 2.0; let best = -Infinity, pick = CANDS[0];
  CANDS.forEach((c, i) => { const v = score(sim, c, H) - i * 0.002; if (v > best + 1e-9) { best = v; pick = c; } }); return pick;
}
/** Läuft einen kompletten Parcours; latency = Verzögerung der Eingaben in Sekunden (menschlich ≈ 0.12). Liefert {finished, time, dist, dead, frames}. */
export function runBot(course, { maxT = 150, latency = 0, horizon = 2.0, record = false } = {}) {
  const sim = new Sim(course); let cur = {}, holdUntil = 0, decideAt = 0; const queue = [], frames = [];
  while (!sim.dead && !sim.finished && sim.t < maxT) {
    if (sim.t >= decideAt) { const c = plan(sim, { horizon }); cur = c; holdUntil = sim.t + (c.hold || 0.1); decideAt = sim.t + 0.05; queue.push({ at: sim.t + latency, c: Object.assign({}, c, { until: sim.t + (c.hold || 0.1) + latency }) }); }
    let inp = {}; for (let i = queue.length - 1; i >= 0; i--) if (queue[i].at <= sim.t) { inp = queue[i].c; while (queue.length > 12) queue.shift(); break; }
    const j = inp.j && inp.until !== undefined && sim.t < inp.until - (latency ? 0 : 0) && sim.t - (inp.until - (inp.hold || 0.36)) < (inp.hold || 0.36);
    sim.step({ l: inp.l, r: inp.r, j: inp.j && sim.t < (inp.until || 0), g: inp.g });
    if (record && frames.length < 20000) frames.push(Math.round(sim.x * 100) / 100, Math.round(sim.y * 100) / 100);
  }
  return { finished: sim.finished, time: sim.t, dist: sim.dist, dead: sim.dead, hits: sim.hits, frames };
}
