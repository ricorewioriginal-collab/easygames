// Einfacher Zielbot für Krawallvögel-Tests: probiert Würfe auf die verbliebenen Schweine und nimmt den besten.
'use strict';
const K = require('../krawallvoegel/levels.js'), S = require('../krawallvoegel/sim.js');
function aimFor(tx, ty, v, high) {
  const g = S.GRAVITY, x = tx - K.SLING.x, y = ty - K.SLING.y, disc = v ** 4 - g * (g * x * x + 2 * y * v * v);
  if (disc < 0) return null;
  return Math.atan2(v * v + (high ? 1 : -1) * Math.sqrt(disc), g * x);
}
function replay(level, shots) {
  const s = S.createSim(level);
  for (const sh of shots) { s.runUntilReady(30); if (!s.canShoot()) break; s.launch(sh[0], sh[1]); if (sh[2]) abilityAt(s, sh[2]); }
  s.runUntilReady(30); return s;
}
function abilityAt(s, t) { const end = s.time + t; while (s.time < end && s.state === 'flying') { s.step(); s.events.length = 0; } s.ability(); }
function candidates(s) {
  const out = [], v = K.SLING.vmax;
  s.ents.filter(e => e.kind === 'pig' && !e.dead).forEach(p => {
    const c = p.body.getPosition();
    [false, true].forEach(high => [1, 0.93].forEach(pw => {
      const a = aimFor(c.x, c.y, v * pw, high); if (a === null) return;
      [-0.025, 0, 0.025].forEach(da => { const ang = a + da; out.push([-Math.cos(ang) * K.SLING.maxPull * pw, -Math.sin(ang) * K.SLING.maxPull * pw]); });
    }));
  });
  return out;
}
function solve(level, opts) {
  opts = opts || {}; const shots = []; let s = replay(level, shots);
  while (s.state !== 'won' && s.state !== 'lost' && s.canShoot()) {
    let best = null;
    const cands = candidates(s), limit = opts.limit || 24;
    for (let i = 0; i < cands.length && i < limit * 6; i += Math.max(1, Math.floor(cands.length / limit))) {
      const trial = replay(level, shots.concat([cands[i]]));
      const val = (trial.state === 'won' ? 1e9 : 0) + (level.pigs.length - trial.pigsLeft) * 1e6 + trial.score;
      if (!best || val > best.val) best = { val, shot:cands[i] };
    }
    if (!best) break;
    shots.push(best.shot); s = replay(level, shots);
  }
  return { won:s.state === 'won', stars:s.stars(), score:s.score, shots:shots.length, birds:level.birds.length, pigsLeft:s.pigsLeft };
}
module.exports = { solve, aimFor, replay };
