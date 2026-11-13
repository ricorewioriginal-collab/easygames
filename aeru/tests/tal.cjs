// Zusammenhängende Welt: Talboden unter allen Inseln, Felstreppen hinauf, Weltgrenze im Flug.
//   node tests/tal.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
const h = load(); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); const {api} = h;
// Weltrichtung (ux, uz) in Stickwerte umrechnen (Kamera bleibt ohne Kamerahilfe stehen).
function walk(ux, uz, ticks, stop) { const c = api.cam().yaw, d = Math.hypot(ux, uz); ux /= d; uz /= d; api.stick(ux * Math.cos(c) - uz * Math.sin(c), ux * Math.sin(c) + uz * Math.cos(c)); for (let i = 0; i < ticks; i++) { h.tick(1); if (stop && stop(h.snap().state)) break; } api.stick(0, 0); }
for (let lv = 0; lv < 7; lv++) {
  api.level(lv, false); h.tick(2);
  const V = api.valley();
  assert(V.stairs.length >= (lv === 0 ? 6 : 5), `Welt ${lv + 1}: Treppen zu Hauptland, Gebieten${lv === 0 ? ' und Heimathain' : ''} (${V.stairs.length})`);
  // Überall zwischen den Inseln liegt Boden.
  for (let a = 0; a < 24; a++) for (const r of [30, 60, 100, 140]) assert(api.floorAt(Math.cos(a / 24 * 6.283) * r, Math.sin(a / 24 * 6.283) * r) >= V.y, `Welt ${lv + 1}: Boden bei ${a}/${r}`);
  // Jede Treppe zu Fuß vom Tal bis auf die Insel.
  for (const st of V.stairs) {
    const b = st.steps[0]; api.teleport(b.x + Math.cos(st.ang) * 3, V.y, b.z + Math.sin(st.ang) * 3, 0); h.tick(5);
    assert.equal(h.snap().state.y, V.y, 'unten im Tal');
    walk(-Math.cos(st.ang), -Math.sin(st.ang), 400, s => s.onGround && s.y === st.top && Math.hypot(s.x - b.x, s.z - b.z) > 14);
    const s = h.snap().state; assert(s.onGround && s.y === st.top, `Welt ${lv + 1}: Treppe hinauf (y ${s.y.toFixed(2)})`);
  }
}
// Von der Brücke fallen: Landung im Tal, kein Rücksetzen.
api.level(0, false); h.tick(2);
api.teleport(0, 0, -40, 0); h.tick(5); walk(1, 0, 200, s => s.onGround && s.y < -1); h.tick(60);
let s = h.snap().state; assert(s.onGround && s.y === api.valley().y && Math.hypot(s.x, s.z + 40) < 12, `im Tal gelandet (${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${s.z.toFixed(1)})`);
// Weltgrenze: auch im Flug geht es nicht über die Berge hinaus.
api.teleport(140, 10, 0, 0); api.flight(); walk(1, 0, 300); s = h.snap().state;
assert(Math.hypot(s.x, s.z) <= api.valley().worldR + .01, 'Weltgrenze hält');
console.log('PASS tal: Talboden in allen 7 Welten, Felstreppen zu Hauptland, Gebieten und Heimathain zu Fuß, Sturz von der Brücke landet im Tal, Weltgrenze im Flug.');
