// Eigener Grundriss je Welt: Gebiete, Brücken, Tore, See und Rankenwand passen in jeder Welt zusammen, und keine zwei Welten gleichen sich.
//   node tests/grundriss.cjs
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
const h = load(); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish();
const {api} = h, seen = new Set(), d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
for (let lv = 0; lv < 7; lv++) {
  api.level(lv, false); h.tick(2);
  const rs = api.regions(), R = lv === 3 ? 23 : 27, W = `Welt ${lv + 1}`;
  const keepOut = [{x: 0, z: 0, r: R}, {x: 37, z: 2, r: 7}, {x: -36, z: -5, r: 6}, ...api.sky.map(s => ({x: s.x, z: s.z, r: s.r})), ...(api.hub() ? [api.hub()] : [])];
  for (const r of rs) {
    for (const o of keepOut) assert(d(r, o) > r.r + o.r + 3, `${W}: Gebiet ${r.id} hält Abstand zu (${o.x}, ${o.z})`);
    for (const o of rs) if (o !== r) assert(d(r, o) > r.r + o.r + 10, `${W}: Gebiete ${r.id}/${o.id} getrennt`);
    assert(Math.hypot(r.x, r.z) + r.r < 122, `${W}: Gebiet ${r.id} liegt vor dem Bergrand`);
    assert(Math.abs(r.at) < R - 2 && Math.abs((r.axis === 'x' ? r.z : r.x) - r.at) < r.r - 2, `${W}: Brücke ${r.id} trifft Hauptland und Gebiet`);
    assert(Math.abs(r.bridge.b - r.bridge.a) > 8, `${W}: Brücke ${r.id} lang genug`);
    // Brücke kreuzt keine Außeninsel
    for (const o of keepOut.slice(1, 3)) assert(Math.abs((r.axis === 'x' ? o.z : o.x) - r.at) > o.r + 2 || (r.axis === 'x' ? o.x : o.z) * Math.sign(r.bridge.b) < Math.abs(r.bridge.a) - o.r, `${W}: Brücke ${r.id} frei`);
  }
  const [n, , , s] = rs;
  for (const g of api.gates()) {
    if (g.id === 'next') assert(d(g, n) < n.r - 3, `${W}: Weltentor im Nordgebiet`);
    if (g.id === 'prev' || g.id === 'home') assert(d(g, s) < s.r - 3, `${W}: Tor ${g.id} im Südgebiet`);
    if (g.arrive && g.to !== 0) { api.level(g.to, false); h.tick(1); assert(api.floorAt(g.arrive.x, g.arrive.z) > -.2, `${W}: Ankunft von ${g.id} auf festem Boden`); api.level(lv, false); h.tick(1); }
  }
  const L = api.water(), C = api.climbWall();
  assert(Math.hypot(L.x, L.z) + L.r < 125 && Math.hypot(C.x, C.z) < 125, `${W}: See und Rankenwand im Tal`);
  for (const r of rs.filter((_, i) => i !== 1)) assert(d(L, r) > L.r + r.r + 2, `${W}: See frei von Gebiet ${r.id}`);
  for (const k of api.terrain().klamm) for (const r of rs) {
    const vx = k.bx - k.ax, vz = k.bz - k.az, t = Math.max(0, Math.min(1, ((r.x - k.ax) * vx + (r.z - k.az) * vz) / (vx * vx + vz * vz)));
    assert(Math.hypot(r.x - k.ax - vx * t, r.z - k.az - vz * t) > r.r + k.w, `${W}: Schlucht meidet Gebiet ${r.id}`);
  }
  const key = rs.map(r => [r.x, r.z, r.r].join()).join('|'); assert(!seen.has(key), `${W}: eigener Grundriss`); seen.add(key);
}
// Durchs Weltentor: Ankunft vor dem Rücktor der nächsten Welt (Grundriss der Zielwelt).
{
  api.level(1, false); h.tick(2); api.setCore(1); api.level(1, false); h.tick(2);
  const g = api.gates().find(g => g.id === 'next'); api.teleport(g.x, 0, g.z, 0); h.tick(5); h.tick(120);
  const s = h.snap(), p = api.gates().find(g => g.id === 'prev');
  assert.equal(s.save.level, 2, 'Welt 3 erreicht');
  assert(p && Math.hypot(s.state.x - p.x, s.state.z - p.z) < 7, `Ankunft am Rücktor (${s.state.x.toFixed(1)} ${s.state.z.toFixed(1)})`);
}
console.log('PASS grundriss: 7 Welten mit eigenem Grundriss, Tore und Wege passen');
