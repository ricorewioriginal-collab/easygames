// Wolkenhopser – Logik-Tests.  node --test wolkenhopser/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const WH = require('../js/core.js');
// Einfache Steuer-KI: lenkt zur nächsten tragfähigen Plattform über sich (mit Bildschirm-Durchgang), schießt auf Monster
function bot(G) {
  const p = G.p, cx = p.x + WH.PW / 2;
  // Ziel nur direkt nach dem Absprung wählen: höchste tragfähige Plattform, die noch erreichbar ist
  if (!G._t || p.vy > WH.JUMP * .9 || !G._t.alive || G._t.gone) {
    let best = null; for (const q of G.plats) { if (!q.alive || q.type === 'break' || q.gone) continue; const apex = p.y + Math.max(0, p.vy) ** 2 / (2 * WH.GRAV); if (q.y > p.y + 8 && q.y + WH.PLH < apex - 10 && (!best || q.y > best.y)) best = q; }
    if (best) G._t = best;
  }
  const t = G._t; if (!t) return { x: 0 };
  let dx = t.x + t.w / 2 - cx; if (Math.abs(dx) > WH.W / 2) dx -= Math.sign(dx) * WH.W;
  return { x: Math.max(-1, Math.min(1, dx / 25)), shoot: G.mons.some(m => m.alive && m.y > p.y && m.y < p.y + 500 && Math.abs(m.x + m.w / 2 - cx) < 60) };
}
function play(seed, sec, vh) { const G = WH.newGame(seed); for (let k = 0; k < sec * 120 && !G.dead; k++) { WH.step(G, bot(G), 1 / 120, vh || 700); G.ev.length = 0; } return G; }

test('Start: Hopsi springt automatisch und steigt', () => {
  const G = WH.newGame(1), ev = []; for (let k = 0; k < 240; k++) { WH.step(G, { x: 0 }, 1 / 120, 700); ev.push(...G.ev); G.ev.length = 0; }
  assert.ok(ev.some(e => e.k === 'jump')); assert.ok(!G.dead); assert.ok(G.maxY > 150);
});

test('Jeder Abstand zwischen tragenden Plattformen ist erreichbar', () => {
  const G = WH.newGame(5); WH.gen(G, 30000);
  const ys = G.plats.filter(p => p.type !== 'break').map(p => p.y).sort((a, b) => a - b), hmax = WH.JUMP * WH.JUMP / (2 * WH.GRAV);
  for (let i = 1; i < ys.length; i++) assert.ok(ys[i] - ys[i - 1] < hmax - 10, 'Lücke ' + (ys[i] - ys[i - 1]).toFixed(0) + ' bei ' + ys[i].toFixed(0));
});

test('Bot kommt in den meisten Welten weit hoch (Spielbarkeit)', () => {
  let far = 0; const hs = [];
  for (let s = 1; s <= 12; s++) { const G = play(s * 977, 90); hs.push(Math.round(G.maxY / 10)); if (G.maxY > 3000) far++; }
  assert.ok(far >= 8, 'nur ' + far + '/12 über Höhe 300: ' + hs.join(','));
});

test('Brüchige Plattform trägt nicht, Feder schießt höher, Bildschirmrand ist Durchgang', () => {
  const G = WH.newGame(2); G.plats = [{ id: 900, x: 100, y: 100, w: 64, type: 'break', vx: 0, alive: true }]; G.items = []; G.mons = []; G.holes = [];
  G.p.x = 110; G.p.y = 130; G.p.vy = -200; G.topY = 1e9;
  const ev = []; for (let k = 0; k < 30; k++) { WH.step(G, { x: 0 }, 1 / 120, 700); ev.push(...G.ev); G.ev.length = 0; }
  assert.ok(ev.some(e => e.k === 'break') && !ev.some(e => e.k === 'jump'));
  const H = WH.newGame(3); H.plats = [{ id: 901, x: 100, y: 100, w: 64, type: 'normal', vx: 0, alive: true }]; H.items = [{ type: 'spring', pid: 901, dx: 20, used: 0 }]; H.mons = []; H.holes = []; H.topY = 1e9;
  H.p.x = 100; H.p.y = 115; H.p.vy = -300; WH.step(H, { x: 0 }, 1 / 120, 700); assert.strictEqual(H.p.vy, WH.SPRING);
  H.p.x = WH.W - 5; H.p.vx = 300; WH.step(H, { x: 1 }, 1 / 60, 700); assert.ok(H.p.x < 20, 'rechts raus, links rein');
});

test('Monster: drauf springen besiegt es, seitlich erwischt es dich, Schuss trifft', () => {
  const mk = () => { const G = WH.newGame(4); G.plats = []; G.items = []; G.holes = []; G.topY = 1e9; G.mons = [{ id: 1, kind: 'blob', x: 100, y: 300, x0: 100, ph: 0, w: 48, h: 40, alive: true, hp: 1 }]; return G; };
  let G = mk(); G.p.x = 105; G.p.y = 345; G.p.vy = -300; for (let k = 0; k < 20; k++) WH.step(G, { x: 0 }, 1 / 120, 700); assert.ok(!G.mons[0].alive && !G.dead && G.kills === 1, 'Draufspringen');
  G = mk(); G.p.x = 60; G.p.y = 305; G.p.vy = 200; G.p.vx = 400; for (let k = 0; k < 30 && !G.dead; k++) WH.step(G, { x: 1 }, 1 / 120, 700); assert.ok(G.dead && G.cause === 'monster', 'seitlich');
  G = mk(); G.p.x = 105; G.p.y = 150; G.p.vy = 0; G.camY = 0; WH.step(G, { x: 0, shoot: true }, 1 / 120, 700); for (let k = 0; k < 40; k++) WH.step(G, { x: 0 }, 1 / 120, 700); assert.ok(!G.mons[0].alive, 'Schuss');
});

test('Tagesrekord: gleiche Welt für alle, Absturz beendet das Spiel', () => {
  const d = WH.daily(new Date(2026, 9, 24)), a = WH.newGame(d.seed), b = WH.newGame(d.seed);
  assert.deepStrictEqual(a.plats.map(p => [p.x, p.y, p.type]), b.plats.map(p => [p.x, p.y, p.type]));
  const G = WH.newGame(9); G.plats = []; G.topY = 1e9; for (let k = 0; k < 400 && !G.dead; k++) WH.step(G, { x: 0 }, 1 / 120, 700); assert.ok(G.dead && G.cause === 'fall');
});
