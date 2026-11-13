// Weite Welten: vier Gebiete je Welt über Brücken, Edelsteine mit Farbwerten, Kristalldrachen, Eierdieb, Weltentore.
//   node tests/welten.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
function fresh(opts) { const h = load(opts); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }
// Mit dem linken Stick zu einem Punkt laufen (Kamera zeigt nach Norden, Stick = Weltrichtung).
let now = 1000; // Bildzeit läuft über alle Läufe weiter (sonst rechnet animate mit negativer Zeit)
function rig(h) {
  const pad = {connected: true, axes: [0, 0, 0, 0], buttons: []}; h.context.navigator = {getGamepads: () => [pad]};
  let minY = 9;
  const frame = () => { if (h.snap().mode === 'dialog') h.api.finishDialog(); now += 1000 / 60; h.api.frame(now); minY = Math.min(minY, h.snap().state.y); };
  const walk = (x, z, max = 900) => { for (let i = 0; i < max; i++) { const s = h.snap().state, dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz); if (d < 1.2) break; pad.axes = [dx / d, dz / d, 0, 0]; frame(); } pad.axes = [0, 0, 0, 0]; for (let i = 0; i < 20; i++) frame(); const s = h.snap().state; return Math.hypot(x - s.x, z - s.z); };
  return {pad, frame, walk, minY: () => minY};
}
// Alle Welten: vier Gebiete, zu Fuß über die Brücken erreichbar, ohne Absturz; Edelsteine auf festem Boden.
{
  const h = fresh(), {api} = h;
  for (let lv = 0; lv < 7; lv++) {
    api.level(lv, false); h.tick(2);
    const rs = api.regions(); assert.equal(rs.length, 4, `Welt ${lv + 1}: vier Gebiete`);
    for (const j of api.jewels()) assert(api.floorAt(j.x, j.z, j.y) > j.y - 1.25 && api.floorAt(j.x, j.z, j.y) <= j.y, `Welt ${lv + 1}: Edelstein ${j.id} (${j.kind}) über festem Boden`);
    assert(api.jewelTotal() >= 200, `Welt ${lv + 1}: Schatz ${api.jewelTotal()}`);
    assert.equal(api.statues().length, 4, 'vier Kristalldrachen'); assert(h.snap().layout.trees.filter(t => t.prop && /^tower/.test(t.prop)).length >= 4, `Welt ${lv + 1}: Burgtürme in den Gebieten`); assert(api.thief(), 'ein Eierdieb');
    for (const r of rs) {
      const w = rig(h), s0 = r.axis === 'x' ? {x: r.bridge.a - Math.sign(r.bridge.b) * 4, z: r.at} : {x: r.at, z: r.bridge.a - Math.sign(r.bridge.b) * 4};
      api.teleport(s0.x, 0, s0.z, 0); h.tick(3);
      const end = r.axis === 'x' ? {x: r.bridge.b, z: r.at} : {x: r.at, z: r.bridge.b};
      { const left = w.walk(end.x, end.z), s = h.snap(); assert(left < 1.5, `Welt ${lv + 1}: Brücke ${r.id} begehbar (Rest ${left.toFixed(1)} m, Modus ${s.mode}, Dialog ${s.dialog?.id}, Pos ${s.state.x.toFixed(1)} ${s.state.z.toFixed(1)} ${s.state.y.toFixed(1)}, hp ${s.state.hp})`); }
      assert(w.walk(r.entry.x, r.entry.z) < 1.5 && w.walk(r.x, r.z) < 2, `Welt ${lv + 1}: Gebiet ${r.id} erreicht`);
      assert(w.minY() > -.6, `Welt ${lv + 1}: kein Absturz auf dem Weg ins Gebiet ${r.id} (y ${w.minY().toFixed(2)})`);
    }
  }
}
// Edelsteine sammeln: Wert zählt, wird gespeichert und bleibt nach dem Laden.
{
  const h = fresh(), {api} = h, r = api.regions()[0], w = rig(h);
  api.teleport(r.at, 0, r.bridge.a + 2, 0); h.tick(2); const v0 = api.jewelValue();
  w.walk(r.at, r.bridge.b);
  const v1 = api.jewelValue(); assert(v1 >= v0 + 5, `rote Edelsteine auf der Brücke (${v0} → ${v1})`);
  const t = r.tower, gold = api.jewels().find(j => j.kind === 'gold' && Math.hypot(j.x - t.x - 2.5, j.z - t.z + 2.5) < .1);
  api.teleport(gold.x, gold.y - 1, gold.z, 0); h.tick(2); assert(api.jewels().find(j => j.id === gold.id).got, 'Gold-Edelstein oben auf dem Turm');
  assert(api.jewelValue() >= v1 + 10, 'Gold zählt 10');
  const stored = {...h.stored}, h2 = load({storage: stored}); h2.els.continue.onclick(); h2.finish(); h2.tick(2);
  assert.equal(h2.api.jewelValue(), api.jewelValue(), 'Edelsteine bleiben nach dem Laden');
}
// Schatzkorb im Gebiet enthält einen Edelstein, der beim Zerbrechen erscheint.
{
  const h = fresh(), {api} = h, hidden = api.jewels().find(j => j.hidden && api.crates().some(k => !k.steel && Math.hypot(k.x - j.x, k.z - j.z) < .1)), c = api.crates().find(k => Math.hypot(k.x - hidden.x, k.z - hidden.z) < .1);
  assert(c, 'Korb zum versteckten Edelstein');
  api.teleport(c.x, 0, c.z + 2, 0); h.tick(30); api.strike(); h.tick(3);
  assert(api.jewels().find(j => j.id === hidden.id).got, 'Edelstein aus dem Korb eingesammelt');
}
// Kristalldrache: Berühren befreit ihn, Dialog, Rastpunkt, gespeichert.
{
  const h = fresh(), {api} = h, d = api.statues()[2];
  api.teleport(d.x + 2.2, 0, d.z, 0); h.tick(2);
  assert(h.snap().dialog?.id?.startsWith('drache_0_2'), 'Dialog des befreiten Drachen');
  api.finishDialog(); const s = h.snap();
  assert(api.statues()[2].freed && s.save.dragons[0].includes(2), 'Drache befreit und gespeichert');
  assert(Math.hypot(s.save.checkpoint.x - d.x, s.save.checkpoint.z - d.z) < 3.5, 'Rastpunkt beim Drachen');
  api.level(0, false); h.tick(2); assert(api.statues()[2].freed, 'bleibt befreit');
}
// Eierdieb: zu Fuß nicht einzuholen, mit dem Ansturm schon.
{
  const h = fresh(), {api} = h, w = rig(h), o = api.regions()[1];
  api.teleport(o.entry.x, 0, o.entry.z, 0); h.tick(2);
  let t = api.thief(); for (let i = 0; i < 240; i++) { const s = h.snap().state, dx = t.x - s.x, dz = t.z - s.z, d = Math.hypot(dx, dz); w.pad.axes = [dx / d, dz / d, 0, 0]; w.frame(); t = api.thief(); }
  assert(!t.caught, 'zu Fuß entkommt der Dieb');
  let caught = false;
  for (let round = 0; round < 8 && !caught; round++) {
    h.key('ShiftLeft');
    for (let i = 0; i < 200 && !caught; i++) { const s = h.snap().state; t = api.thief(); const dx = t.x - s.x, dz = t.z - s.z, d = Math.hypot(dx, dz) || 1; w.pad.axes = [dx / d, dz / d, 0, 0]; w.frame(); caught = api.thief().caught; if (!(h.snap().state.charge > 0) && i > 20) break; }
    h.up('ShiftLeft'); for (let i = 0; i < 40; i++) w.frame();
  }
  assert(caught, 'Ansturm holt den Dieb ein');
  assert.equal(h.snap().save.eggs[0].length, 1, 'Drachenei gespeichert');
  api.level(0, false); h.tick(2); assert.equal(api.thief(), null, 'eingefangener Dieb kommt nicht wieder');
}
// Weltentore: hineinlaufen reist ohne Menü; das Tor zur nächsten Welt wartet auf den Leuchtkern.
{
  const h = fresh(), {api} = h;
  const next = api.gates().find(g => g.id === 'next'); assert(next && !api.gates().some(g => g.id === 'prev'), 'Welt 1: nur Tor nach vorn');
  api.teleport(next.x, 0, next.z + 1, 0); h.tick(5); assert.equal(h.snap().save.level, 0, 'ohne Leuchtkern bleibt das Tor zu');
  api.level(1, false); h.tick(2); const prev = api.gates().find(g => g.id === 'prev');
  api.teleport(prev.x, 0, prev.z - 1, 0); h.tick(5);
  const s = h.snap(); assert.equal(s.save.level, 0, 'Tor zurück führt in Welt 1');
  const back = api.gates().find(g => g.id === 'next');
  assert(Math.hypot(s.state.x - back.x, s.state.z - back.z) < 7 && api.floorAt(s.state.x, s.state.z, 1) > -.5, 'Ankunft vor dem passenden Tor auf festem Boden');
  h.tick(30); assert.equal(h.snap().save.level, 0, 'Ankunft löst das Tor nicht erneut aus');
}
// Heimathain: Heimatwelt in Welt 1 mit einem Levelportal je Welt, zu Fuß erreichbar; Heimtor in jeder anderen Welt führt zurück.
{
  const h = fresh(), {api} = h, w = rig(h), hub = api.hub();
  assert(hub, 'Welt 1 hat den Heimathain'); assert(h.snap().layout.trees.some(t => t.prop === 'castle_blue'), 'Burg im Heimathain');
  const portals = api.gates().filter(g => g.id.startsWith('hub')); assert.equal(portals.length, 6, 'sechs Levelportale');
  for (const p of portals) { assert(api.floorAt(p.x, p.z, 1) > -.5 && api.floorAt(p.arrive.x, p.arrive.z, 1) > -.5, `Portal ${p.to} auf festem Boden`); assert(Math.hypot(p.x - hub.x, p.z - hub.z) < hub.r - 4, 'Portal im Heimathain'); }
  api.teleport(hub.bridge.a - 4, 0, hub.at, 0); h.tick(3);
  assert(w.walk(hub.bridge.b, hub.at) < 1.5 && w.walk(hub.entry.x, hub.entry.z) < 1.5, 'Brücke zum Heimathain begehbar');
  assert(w.walk(hub.x - 7, hub.z) < 1.5, 'Platz im Heimathain erreicht'); assert(w.minY() > -.6, 'kein Absturz auf dem Weg');
  assert(h.snap().save.level === 0, 'noch in Welt 1');
  const p2 = portals.find(p => p.to === 2); api.teleport(p2.x, 0, p2.z, 0); h.tick(3); assert.equal(h.snap().save.level, 0, 'Portal ohne Leuchtkern bleibt zu');
  api.setCore(0); api.setCore(1); api.level(0, false); h.tick(2);
  const p1 = api.gates().find(g => g.id === 'hub2'); api.teleport(p1.x, 0, p1.z, 0); h.tick(3);
  let s = h.snap(); assert.equal(s.save.level, 2, 'Levelportal reist in Welt 3');
  const home = api.gates().find(g => g.id === 'home'); assert(home, 'Heimtor in Welt 3');
  assert(Math.hypot(s.state.x - home.x, s.state.z - home.z) < 7 && api.floorAt(s.state.x, s.state.z, 1) > -.5, 'Ankunft vor dem Heimtor auf festem Boden');
  h.tick(30); assert.equal(h.snap().save.level, 2, 'Ankunft löst das Heimtor nicht aus');
  for (let lv = 1; lv < 7; lv++) { api.level(lv, false); h.tick(2); const g = api.gates().find(g => g.id === 'home'); assert(g && api.floorAt(g.x, g.z, 1) > -.5, `Welt ${lv + 1}: Heimtor auf festem Boden`); for (const t of h.snap().layout.trees.filter(t => !t.pillar)) assert(Math.hypot(t.x - g.x, t.z - g.z) > 4, `Welt ${lv + 1}: kein Baum im Heimtor`); }
  api.level(2, false); h.tick(2); const hg = api.gates().find(g => g.id === 'home'); api.teleport(hg.x, 0, hg.z, 0); h.tick(3);
  s = h.snap(); assert.equal(s.save.level, 0, 'Heimtor führt in den Heimathain');
  const back = api.gates().find(g => g.id === 'hub2'); assert(Math.hypot(s.state.x - back.x, s.state.z - back.z) < 6 && api.floorAt(s.state.x, s.state.z, 1) > -.5, 'Ankunft vor dem Portal der Welt');
  h.tick(30); assert.equal(h.snap().save.level, 0, 'Ankunft löst das Portal nicht aus');
}
// Wächter im Westgebiet: sechs Treffer, gibt einen lila Edelstein frei, bleibt danach fort.
{
  const h = fresh(), {api} = h; let g = h.snap().enemies.find(e => e.guard);
  assert(g && g.hp === 6, 'Wächter mit 6 Trefferpunkten');
  for (let i = 0; i < 40 && h.snap().enemies.find(e => e.guard).state !== 'dead'; i++) { g = h.snap().enemies.find(e => e.guard); api.teleport(g.x, 0, g.z + 3.2, 0); h.tick(30); api.strike(); h.tick(2); if (h.snap().mode === 'dialog') api.finishDialog(); }
  assert.equal(h.snap().enemies.find(e => e.guard).state, 'dead', 'Wächter besiegt');
  const lila = api.jewels().filter(j => j.kind === 'lila' && !j.hidden && !j.got).sort((a, b) => Math.hypot(a.x - g.x, a.z - g.z) - Math.hypot(b.x - g.x, b.z - g.z))[0];
  api.teleport(lila.x, 0, lila.z, 0); h.tick(3); assert(api.jewels().find(j => j.id === lila.id).got, 'lila Edelstein des Wächters');
  api.level(0, false); h.tick(2); assert(!h.snap().enemies.some(e => e.guard), 'besiegter Wächter kommt nicht wieder');
}
// Gegner der Gebiete bleiben auf ihrem Gebiet.
{
  const h = fresh(), {api} = h, rs = api.regions(); h.tick(600);
  for (const e of h.snap().enemies) { const d = Math.min(Math.hypot(e.x, e.z), ...rs.map(r => Math.hypot(e.x - r.x, e.z - r.z))); assert(api.floorAt(e.x, e.z, 1) > -.5, `Gegner ${e.kind} auf festem Boden (${e.x.toFixed(1)}, ${e.z.toFixed(1)})`); }
}
console.log('PASS welten: 7 Welten mit je 4 Gebieten zu Fuß über Brücken erreichbar, Edelsteine (Werte, Turm, Korb, Speichern), Kristalldrachen, Eierdieb (nur per Ansturm), Weltentore ohne Menü, Heimathain mit 6 Levelportalen und Heimtor in jeder Welt, Wächter mit lila Edelstein, Gegner bleiben im Gebiet.');
