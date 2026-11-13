// Spieleportale (Bunte Insel, Zotik) in jeder Welt und analoge Controller-Steuerung.
//   node tests/portale.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
function fresh(opts) { const h = load(opts); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }

// In jeder Welt: zwei Portale auf festem Boden, frei von Splittern, Figuren, Rastpunkten und Bäumen; Reisen erst beim zweiten Druck.
{
  const h = fresh(), {api} = h;
  for (let lv = 0; lv < 7; lv++) {
    api.level(lv, false); h.tick(2);
    const ps = api.portals(), s = h.snap();
    assert.equal(ps.map(p => p.id).join(), 'bunte,zotik', `Welt ${lv + 1}: beide Portale`);
    for (const p of ps) {
      for (const dx of [-2.5, 0, 2.5]) for (const dz of [-3, 0, 3]) assert(api.floorAt(p.x + dx, p.z + dz, 1) > -.2, `Welt ${lv + 1}: Boden am Portal ${p.id} (${dx},${dz})`);
      for (const g of s.layout.gems) assert(Math.hypot(g.x - p.x, g.z - p.z) > 3.2, `Welt ${lv + 1}: Splitter ${g.id} nicht im Portal ${p.id}`);
      for (const n of s.npcs) assert(Math.hypot(n.x - p.x, n.z - p.z) > 3.5, `Welt ${lv + 1}: Figur ${n.id} nicht im Portal ${p.id}`);
      for (const t of s.layout.trees.filter(t => !t.pillar)) assert(Math.hypot(t.x - p.x, t.z - p.z) > t.crown + 2.4, `Welt ${lv + 1}: kein Baum im Portal ${p.id}`);
      for (const c of s.layout.checkpoints || []) assert(Math.hypot(c.x - p.x, c.z - p.z) > 3, `Welt ${lv + 1}: Rastpunkt nicht im Portal ${p.id}`);
    }
  }
  api.level(0, false); h.tick(2);
  const p = api.portals()[0];
  api.teleport(p.x, 0, p.z + 2, 0); h.tick(3);
  assert.equal(h.snap().near, 'bunte', 'Portal wird erkannt');
  h.press('KeyR'); h.tick(2);
  assert.equal(api.navigated(), null, 'erster Druck reist noch nicht');
  h.press('KeyR'); h.tick(2);
  assert.equal(api.navigated(), '../bunte-insel/?from=aeru', 'zweiter Druck reist zur Bunten Insel');
  const z = api.portals()[1]; api.teleport(z.x, 0, z.z + 2, 0); h.tick(3); h.press('KeyR'); h.tick(2); h.press('KeyR'); h.tick(2);
  assert.equal(api.navigated(), '../zotik/?from=aeru', 'Zotik-Portal');
  // Spielstand wurde vor der Reise gespeichert
  assert(JSON.parse(h.stored['aeru-save-v1']).level === 0, 'Spielstand gespeichert');
}
// Portalsäulen sind fest: Aeru läuft nicht durch sie hindurch.
{
  const h = fresh(), {api} = h, pil = h.snap().layout.trees.filter(t => t.pillar);
  assert.equal(pil.length, 4, 'vier Portalsäulen');
  const c = pil[0]; api.teleport(c.x, 0, c.z + 2.5, 0); h.tick(3);
  h.key('KeyW'); let min = 9; for (let i = 0; i < 90; i++) { h.tick(1); const s = h.snap().state; min = Math.min(min, Math.hypot(s.x - c.x, s.z - c.z)); } h.up('KeyW');
  assert(min >= c.crown * .55 + .3, `Säule hält Aeru auf (Abstand ${min.toFixed(2)})`);
}
// Controller: linker Stick analog (halb gedrückt = langsamer), rechter Stick dreht die Kamera, Ruhelage bewegt nichts.
{
  const run = (axes, frames = 60) => {
    const h = fresh(), {api} = h; let pad = {connected: true, axes: [0, 0, 0, 0], buttons: []};
    h.context.navigator = {getGamepads: () => [pad]};
    api.teleport(0, 0, 10, 0); h.tick(5); const a = h.snap().state, yaw0 = api.cam().yaw;
    pad.axes = axes; for (let i = 0; i < frames; i++) { api.frame((i + 1) * 1000 / 60); }
    const b = h.snap().state; return {d: Math.hypot(b.x - a.x, b.z - a.z), dz: b.z - a.z, yaw: api.cam().yaw - yaw0};
  };
  const full = run([0, -1, 0, 0]), half = run([0, -.55, 0, 0]), rest = run([.08, -.1, .1, 0]), cam = run([0, 0, 1, 0]);
  assert(full.dz < -3, `voller Stick läuft vorwärts (${full.dz.toFixed(2)})`);
  assert(half.d > .5 && half.d < full.d * .8, `halber Stick ist langsamer (${half.d.toFixed(2)} < ${full.d.toFixed(2)})`);
  assert(rest.d < .05 && Math.abs(rest.yaw) < 1e-6, 'Totzone: Stick-Drift bewegt nichts');
  assert(cam.yaw < -.5 && cam.d < .05, `rechter Stick dreht die Kamera (${cam.yaw.toFixed(2)})`);
}
console.log('PASS portale: zwei Spieleportale in allen 7 Welten auf festem Boden, Reisen nach Nachfrage, Spielstand gespeichert, feste Säulen, analoger Controller-Stick mit Totzone, Kamera am rechten Stick.');
