// Drachenkunst: Ansturm, Schatzkörbe, Lichtfalter und Begleiter Funkel.
//   node tests/spyro.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
function fresh(opts) { const h = load(opts); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }
const speed = s => Math.hypot(s.vx, s.vz);

// Schatzkörbe: in jeder Welt mindestens drei, auf ebenem Boden, frei von Portalen, Splittern und Bäumen.
{
  const h = fresh(), {api} = h;
  for (let lv = 0; lv < 7; lv++) {
    api.level(lv, false); h.tick(2);
    const cs = api.crates(), s = h.snap();
    assert(cs.length >= 3, `Welt ${lv + 1}: ${cs.length} Schatzkörbe`);
    for (const c of cs) {
      assert(!c.broken, 'Korb steht');
      for (const [a, b] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) assert.equal(api.floorAt(c.x + a * 1.4, c.z + b * 1.4, c.y + .3), c.y, `Welt ${lv + 1}: Korb auf ebenem Boden`);
      for (const p of api.portals()) assert(Math.hypot(p.x - c.x, p.z - c.z) >= 5, 'Korb nicht im Portal');
      for (const g of s.layout.gems) assert(Math.hypot(g.x - c.x, g.z - c.z) >= 2, 'Korb nicht auf einem Splitter');
      for (const t of s.layout.trees.filter(t => !t.crate)) assert(Math.hypot(t.x - c.x, t.z - c.z) >= t.crown + 1.4, 'Korb nicht in einem Baum oder Felsen');
    }
  }
}
// Korb ist fest, Windstoß zerbricht ihn, Lichtfalter steigt auf und heilt ein Herz.
{
  const h = fresh(), {api} = h, c = api.crates()[0];
  api.teleport(c.x, c.y, c.z + 2.6, 0); h.tick(2);
  h.key('KeyW'); let min = 9; for (let i = 0; i < 90; i++) { h.tick(1); const s = h.snap().state; min = Math.min(min, Math.hypot(s.x - c.x, s.z - c.z)); } h.up('KeyW');
  assert(min >= 1.1 * .55 + .3, `Korb hält Aeru auf (Abstand ${min.toFixed(2)})`);
  api.teleport(c.x, c.y, c.z + 2, 0); h.tick(30);
  api.hurt(); const hp = h.snap().state.hp;
  api.strike(); assert(api.crates()[0].broken, 'Windstoß zerbricht den Korb');
  h.tick(3);
  assert.equal(h.snap().state.hp, hp + 1, 'Lichtfalter heilt ein Herz (Funkel holt ihn heran)');
  assert.equal(api.falter().length, 0, 'Falter gefangen');
  // Zerbrochener Korb hält nicht mehr auf; neu betreten der Welt stellt ihn wieder auf.
  assert(!h.snap().layout.trees.some(t => t.crate && t.crown > 0 && Math.hypot(t.x - c.x, t.z - c.z) < .1), 'Kollision weg');
  api.level(0, false); h.tick(1); assert(!api.crates()[0].broken, 'Korb steht nach dem Weltwechsel wieder');
}
// Rammstoß zerbricht einen Korb.
{
  const h = fresh(), {api} = h, c = api.crates()[1];
  api.teleport(c.x, c.y, c.z + 3.4, 0); h.tick(2); h.key('KeyW'); h.key('ShiftLeft'); h.tick(1); h.up('ShiftLeft'); h.tick(14); h.up('KeyW');
  assert(api.crates()[1].broken, 'Rammstoß zerbricht den Korb');
}
// Ansturm: Rammknopf halten → lenkbar weiterstürmen, Loslassen beendet ihn, an der Kante bleibt Aeru stehen.
{
  const h = fresh(), {api} = h;
  api.teleport(0, 0, 8, 0); h.tick(2);
  h.key('ShiftLeft'); h.tick(30);
  let s = h.snap().state; assert(s.charge > 0 && Math.abs(speed(s) - 12.5) < .6, `Ansturm läuft (Tempo ${speed(s).toFixed(1)})`);
  const id = api.rammId(); h.tick(20); assert(api.rammId() > id, 'Ansturm rammt fortlaufend');
  h.up('ShiftLeft'); h.tick(12); s = h.snap().state;
  assert(s.charge <= 0 && speed(s) < 8, 'Loslassen beendet den Ansturm');
  // Kurzer Druck: nur Rammstoß, kein Ansturm.
  api.teleport(0, 0, 8, 0); h.tick(60); h.key('ShiftLeft'); h.tick(2); h.up('ShiftLeft'); h.tick(20); assert(!(h.snap().state.charge > 0), 'kurzer Druck ohne Ansturm');
  // Zur Kante: Aeru stürzt nicht hinunter.
  api.teleport(0, 0, 19, Math.PI); h.tick(60); h.key('ShiftLeft'); h.tick(200); s = h.snap().state; h.up('ShiftLeft');
  assert(s.y > -.5 && api.floorAt(s.x, s.z, 1) > -1, `Ansturm hält an der Kante (y ${s.y.toFixed(2)})`);
  // Lenken
  api.teleport(0, 0, 8, 0); h.tick(60); h.key('ShiftLeft'); h.tick(20); h.key('KeyD'); h.tick(20); s = h.snap().state; h.up('KeyD'); h.up('ShiftLeft');
  assert(s.vx > 3, `Ansturm lässt sich lenken (vx ${s.vx.toFixed(1)})`);
  // Touch: RAMM gedrückt halten startet den Ansturm genauso, Loslassen beendet ihn.
  api.teleport(0, 0, 8, 0); h.tick(60); h.els.dodge.fire('pointerdown'); h.tick(30); s = h.snap().state;
  assert(s.charge > 0, 'Touch-RAMM halten: Ansturm'); h.els.dodge.fire('pointerup'); h.tick(5); assert(!(h.snap().state.charge > 0), 'Touch loslassen beendet ihn');
  // In der Luft gibt es keinen Ansturm.
  api.teleport(0, 0, 8, 0); h.tick(60); h.key('ShiftLeft'); h.tick(20); h.press('Space', 3); s = h.snap().state; h.up('ShiftLeft');
  assert(!(s.charge > 0), 'Sprung beendet den Ansturm');
}
// Besiegte Gegner lassen einen Lichtfalter frei.
{
  const h = fresh(), {api} = h;
  let spawned = false;
  for (let i = 0; i < 30 && !spawned; i++) {
    const t = h.snap().enemies.find(x => x.kind === 'kaefer' && x.state !== 'dead'); if (!t) break;
    api.teleport(t.x, 0, t.z + 2.2, 0); h.tick(30); const u = h.snap().enemies.find(x => x.kind === 'kaefer' && x.state !== 'dead' && Math.hypot(x.x - t.x, x.z - t.z) < 5);
    if (!u) continue; api.teleport(u.x, 0, u.z + 2, 0); const before = api.falter().length; api.strike(); spawned = api.falter().length > before || h.snap().enemies.some(x => x.state === 'dead') && api.falter().length > 0;
  }
  assert(spawned, 'Lichtfalter aus besiegtem Gegner');
}
// Funkel: folgt Aeru, Farbe zeigt Lebensenergie, holt Splitter in 2,4 m heran (nicht weiter).
{
  const h = fresh(), {api} = h;
  for (let i = 0; i < 90; i++) api.frame(1000 + i * 16); let f = api.funkel(), s = h.snap().state;
  assert(Math.hypot(f.x - s.x, f.z - s.z) < 2 && f.y > s.y + 1.5, 'Funkel schwebt bei Aeru');
  assert.equal(f.color, 0xffe27a, 'gesund: gold');
  api.hurt(); h.tick(90); api.hurt(); h.tick(2); assert.equal(api.funkel().color, 0x8fdcff, 'angeschlagen: blau');
  const g = h.snap().layout.gems.find(x => x.id === 3), got = () => h.snap().save.collected[0].includes(3);
  api.teleport(g.x + 3.1, 0, g.z, 0); h.tick(2); assert(!got(), 'Splitter in 3 m bleibt liegen');
  api.teleport(g.x + 2.1, 0, g.z, 0); h.tick(2); assert(got(), 'Funkel holt Splitter in 2 m');
}
console.log('PASS spyro: Schatzkörbe in allen 7 Welten auf ebenem Boden, fest, zerbrechen per Wind und Rammstoß, Lichtfalter heilen, Ansturm (halten, lenken, loslassen, Kante, Sprung), Falter aus Gegnern, Funkel mit Lebensfarbe und Splitter-Magnet.');
