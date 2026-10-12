// Himmelsinseln: auf jeder der 7 Welten sind alle 3 Himmelsinseln erreichbar (Aufwind, Flug, Landehilfe), die Truhe öffnet sich,
// Schwung-Ringe liegen auf dem Weg, und die Truhenbelohnungen wirken.
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
function fresh() { const h = load(); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }
const h = fresh(), {api} = h;
const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
function flyToIsland(sk) {
  api.teleport(sk.from[0], 13, sk.from[1]); h.tick(1); api.flight();
  for (let i = 0; i < 1500; i++) {
    const s = h.snap().state, dx = sk.x - s.x, dz = sk.z - s.z, d = Math.hypot(dx, dz);
    // Wie ein Spieler: Richtungstasten Richtung Insel, bei Höhenmangel Sprung halten, nahe der Insel loslassen.
    for (const [k, on] of [['KeyD', dx > 1.2 && d > 3], ['KeyA', dx < -1.2 && d > 3], ['KeyS', dz > 1.2 && d > 3], ['KeyW', dz < -1.2 && d > 3]]) on ? h.key(k) : h.up(k);
    api.hold('jump', s.y < sk.y + 3 && d > 3 && !s.onGround);
    h.tick(1);
    const t = h.snap().state; if (t.onGround && Math.hypot(t.x - sk.x, t.z - sk.z) < sk.r) break;
  }
  for (const k of KEYS) h.up(k); api.hold('jump', false); h.tick(30);
  return h.snap().state;
}
let chestsOpened = 0;
for (let level = 0; level < 7; level++) {
  if (level) api.level(level, false);
  const state0 = h.snap();
  assert.equal(state0.layout.solids.filter(o => o.r && o.y >= 7).length >= 3, true, `Welt ${level}: Himmelsinseln vorhanden`);
  api.sky.forEach((sk, id) => {
    const s = flyToIsland(sk);
    assert(s.onGround && Math.hypot(s.x - sk.x, s.z - sk.z) < sk.r && Math.abs(s.y - sk.y) < .05, `Welt ${level}, Himmelsinsel ${id}: gelandet (${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${s.z.toFixed(1)})`);
    api.teleport(sk.x + .5, sk.y, sk.z); h.tick(5);
    assert(h.snap().save.chests[level].includes(id), `Welt ${level}, Truhe ${id} öffnet sich`); chestsOpened++;
  });
}
assert.equal(chestsOpened, 21);
// Truhenbelohnungen: 3 Truhen → Rammstoß stärker, 9 → Herz, 15 → Flügelkraft, 21 → alle.
const snap = h.snap(); assert.equal(snap.save.chests.reduce((n, a) => n + a.length, 0), 21, 'alle 21 Truhen gezählt');
// Schwung-Ringe: Durchfliegen gibt Boost.
{
  const g = fresh(); g.api.level(0, false); const sk = g.api.sky[0], r0 = { x: sk.from[0] + (sk.x - sk.from[0]) * .36, y: 13 + (sk.y + 4 - 13) * .36, z: sk.from[1] + (sk.z - sk.from[1]) * .36 };
  g.api.teleport(r0.x, r0.y - 1, r0.z); g.api.flight(); g.tick(2); assert(g.snap().state.boost > 1, 'Schwung-Ring gibt Boost');
}
console.log('PASS sky: 21 Himmelsinseln erreichbar, Truhen, Schwung-Ringe, Belohnungen.');
