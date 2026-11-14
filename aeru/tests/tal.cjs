// Zusammenhängende Welt als Höhenfeld: überall Boden, begehbare Hänge von der Talwiese auf jede Hochfläche, Weltgrenze.
//   node tests/tal.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
const h = load(); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); const {api} = h;
function walk(ux, uz, ticks, stop) { const c = api.cam().yaw, d = Math.hypot(ux, uz); ux /= d; uz /= d; api.stick(ux * Math.cos(c) - uz * Math.sin(c), ux * Math.sin(c) + uz * Math.cos(c)); for (let i = 0; i < ticks; i++) { h.tick(1); if (stop && stop(h.snap().state)) break; } api.stick(0, 0); }
for (let lv = 0; lv < 7; lv++) {
  api.level(lv, false); h.tick(2);
  const T = api.terrain();
  // Überall Boden, nirgends ein Loch.
  for (let a = 0; a < 24; a++) for (const r of [10, 30, 60, 100, 140]) assert(api.floorAt(Math.cos(a / 24 * 6.283) * r, Math.sin(a / 24 * 6.283) * r) > T.valleyY - 6, `Welt ${lv + 1}: Boden bei ${a}/${r}`);
  // Von der Talwiese zu Fuß den Hang hinauf auf jede Hochfläche (Hauptland, Gebiete, Heimathain), aus mehreren Richtungen.
  const tops = T.plateaus.filter(q => q.r >= 15);
  assert(tops.length >= (lv === 0 ? 6 : 5), `Welt ${lv + 1}: Hochflächen (${tops.length})`);
  for (const q of tops) for (const ang of [.4, 2.2, 4.1]) {
    const sx = q.x + Math.cos(ang) * (q.r + 9), sz = q.z + Math.sin(ang) * (q.r + 9), gy = api.floorAt(sx, sz);
    if (gy > q.y - 2 || Math.hypot(sx, sz) > 135) continue;
    api.teleport(sx, gy, sz, 0); h.tick(3); let max = -99;
    walk(q.x - sx, q.z - sz, 400, s => { max = Math.max(max, s.y); return s.onGround && s.y === q.y && Math.hypot(s.x - q.x, s.z - q.z) < q.r - 1; });
    const s = h.snap().state; assert(s.onGround && s.y === q.y, `Welt ${lv + 1}: Hang hinauf bei ${q.x | 0}/${q.z | 0}, Winkel ${ang} (y ${s.y.toFixed(2)}, max ${max.toFixed(2)})`);
  }
}
// Von der Brücke fallen: Landung am Hang oder im Tal, kein Rücksetzen.
api.level(0, false); h.tick(2);
api.teleport(0, 0, -40, 0); h.tick(5); const cp = {...h.snap().state.checkpoint}; walk(1, 0, 200, s => s.onGround && s.y < -1); h.tick(60);
let s = h.snap().state; assert(s.onGround && s.y < -1 && Math.hypot(s.x, s.z + 40) < 15, `unten gelandet (${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${s.z.toFixed(1)})`);
// Hangabwärts bleibt Aeru am Boden.
let air = 0; walk(1, 0, 90, st => { if (!st.onGround) air++; return false; }); assert(air < 6, `hangabwärts am Boden (${air} Schritte in der Luft)`);
// Weltgrenze: auch im Flug geht es nicht über die Berge hinaus.
api.teleport(140, 40, 0, 0); api.flight(); walk(1, 0, 300); s = h.snap().state;
assert(Math.hypot(s.x, s.z) <= api.terrain().worldR + .01, 'Weltgrenze hält');
console.log('PASS tal: Höhenfeld in allen 7 Welten ohne Löcher, Hänge von der Talwiese auf jede Hochfläche zu Fuß, Sturz von der Brücke landet am Hang, hangabwärts am Boden, Weltgrenze im Flug.');
