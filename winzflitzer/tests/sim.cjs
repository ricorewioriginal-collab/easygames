// Fährt jede Strecke mit 4 Computer-Fahrern ohne Grafik ab und prüft: alle kommen ins Ziel, wenige Abstürze, keiner hängt fest.
// Aufruf: node winzflitzer/tests/sim.cjs [id,id…]
const path = require('path');
global.window = global; global.THREE = require(path.join(__dirname, '../../vendor/three-r128.min.js'));
for (const f of ['util', 'data', 'track', 'physics']) require(path.join(__dirname, '../js/' + f + '.js'));
const WF = global.WF, only = process.argv[2] ? process.argv[2].split(',') : null;
let bad = 0;
for (const def of WF.TRACKS) {
  if (only && !only.includes(def.id)) continue;
  const T = new WF.Track(def), sim = new WF.Sim(T, { laps: 3 }), stats = {};
  WF.DRIVERS.slice(0, 4).forEach((d, k) => { const c = sim.add(new WF.Car(sim, { id: d.id, name: d.name, skill: d.skill, style: d.style, driver: d })); c.place(T.gridSlot(k)); stats[d.id] = { fall: 0, lost: 0, resp: 0, hit: 0 }; });
  sim.started = true;
  let t = 0;
  while (t < 300 && sim.finishOrder.length < 4) {
    sim.step(1 / 60); t += 1 / 60;
    if (sim.t > 2 && Math.floor(sim.t * 60) % 20 === 0) sim.cars.forEach(c => { if (c.V.gun && Math.random() < 0.05) sim.fire(c); });
    sim.events.forEach(e => { if (e.a && stats[e.a.id]) { if (e.t === 'fall') stats[e.a.id].fall++; if (e.t === 'lost') stats[e.a.id].lost++; if (e.t === 'respawn') stats[e.a.id].resp++; if (e.t === 'hit') stats[e.a.id].hit++; } });
    sim.events.length = 0;
  }
  const fin = sim.finishOrder.length, times = sim.cars.map(c => c.done ? c.time.toFixed(1) : 'DNF');
  const fails = Object.values(stats).reduce((a, s) => a + s.fall + s.lost, 0), resp = Object.values(stats).reduce((a, s) => a + s.resp, 0);
  const ok = fin === 4 && resp <= 8;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${def.id} ${def.name.padEnd(22)} Ziel ${fin}/4  Zeiten ${times.join(' ')}  Abstürze/Abseits ${fails}  Neustarts ${resp}` + (ok ? '' : '  ' + JSON.stringify(stats)));
}
console.log(bad ? `\n${bad} Strecken mit Problemen` : '\nAlle Strecken fahrbar');
process.exit(bad ? 1 : 0);
