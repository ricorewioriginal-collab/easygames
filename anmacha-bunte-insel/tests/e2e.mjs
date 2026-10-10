/* Browser-Test der Bunten Insel: alle Missionen, Zug, Löschen, Sterne, Ein-/Aussteigen, Stabilität.
   Voraussetzung: laufender Webserver im Repo-Hauptordner und Playwright (npm i -D playwright).
   Aufruf: BASE=http://localhost:8080 node anmacha-bunte-insel/tests/e2e.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
const errs = []; let fails = 0;
page.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack||'').split('\n').slice(0,4).join('\n')));
page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.type()+': ' + m.text()); });
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort());
await page.goto(BASE + '/anmacha-bunte-insel/index.html');
await page.waitForFunction(() => window.__bi, null, { timeout: 30000 });
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await page.click('#bStart'); await page.waitForTimeout(400);
const ev = f => page.evaluate(f);
// Missionen je Typ: Schritte der Reihe nach "anfahren"
for (const ty of ['car','bike','police','ambulance','bus','ice','tractor']) {
  const res = await page.evaluate(async ty => {
    const b = window.__bi; if (b.P.veh) b.leave(); const v = b.vehicles.find(v => v.type === ty && !v.ai); b.P.x = v.x + 2; b.P.z = v.z; b.enter(v);
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const kind = b.mission.kind, n = b.mission.steps.length, s0 = b.save.stars; let done = 0;
    for (let i = 0; i < n + 1; i++) {
      const m = b.mission; if (!m) break; const s = m.steps[m.i]; v.x = s.x; v.z = s.z; v.v = 0; await sleep(200); done++;
    }
    await sleep(300);
    return { kind, n, gained: b.save.stars - s0, active: !!b.mission };
  }, ty);
  ok(res.gained >= res.n + 5 && !res.active, `${ty}: Mission ${res.kind} (${res.n} Schritte) fertig, +${res.gained} Sterne`);
}
// Feuerwehr: Löschen
const fire = await page.evaluate(async () => {
  const b = window.__bi; if (b.P.veh) b.leave(); const v = b.vehicles.find(v => v.type === 'fire'); b.P.x = v.x + 2; b.P.z = v.z; b.enter(v);
  const s = b.mission.steps[0]; v.x = s.fx !== undefined ? s.fx - 8 : s.x - 8; v.z = s.z; v.v = 0; const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(300); const before = s.prog; const s0 = b.save.stars; b.inp.horn = true;
  for (let i = 0; i < 200 && b.mission && b.mission.steps[0] === s; i++) await sleep(100);
  b.inp.horn = false; return { before, mission: !!(b.mission && b.mission.steps[0] === s), gained: b.save.stars - s0 };
});
ok(!fire.mission && fire.before === 0, 'Feuerwehr: Feuer mit Wasser gelöscht, Mission fertig');
// Zug: Runde + Halt
const tr = await page.evaluate(async () => {
  const b = window.__bi; if (b.P.veh) b.leave(); const c = b.train.cars[0]; b.P.x = c.x + 3; b.P.z = c.z + 2; b.enter(b.trainVeh);
  const sleep = ms => new Promise(r => setTimeout(r, ms)); const L = b.W.track.L; const s0 = b.save.stars;
  b.train.dist += L; await sleep(300); const m1 = b.mission && b.mission.steps[b.mission.i].type;
  b.train.s = b.W.STATION_S - 3; b.train.v = 0; b.keys.d = true; await sleep(500); b.keys.d = false; await sleep(300);
  return { m1, done: !b.mission, gained: b.save.stars - s0 };
});
ok(tr.m1 === 'stop' && tr.done && tr.gained >= 7, `Zug: Runde -> ${tr.m1}, Halt am Bahnhof, +${tr.gained} Sterne`);
// Sterne einsammeln zu Fuß
const st = await page.evaluate(async () => {
  const b = window.__bi; if (b.P.veh) b.leave(); const s = b.stars.find(s => s.on); b.P.x = s.x; b.P.z = s.z; const s0 = b.save.stars; await new Promise(r => setTimeout(r, 300));
  return { gained: b.save.stars - s0, off: !s.on };
});
ok(st.gained === 1 && st.off, 'Stern zu Fuß eingesammelt');
// Aussteigen/Einsteigen-Zyklus: Spieler nie in Hindernis, nie NaN
const cyc = await page.evaluate(async () => {
  const b = window.__bi; const sleep = ms => new Promise(r => setTimeout(r, ms)); let bad = 0;
  for (const v of b.vehicles.filter(v => !v.ai)) { b.P.x = v.x + 3; b.P.z = v.z; if (b.P.veh) b.leave(); await sleep(60); const nv = b.nearVehicle(); if (!nv) { bad++; continue; } b.enter(nv); await sleep(60); b.leave(); await sleep(40); if (!isFinite(b.P.x + b.P.z) || !b.W.free(b.P.x, b.P.z, .4)) bad++; }
  return { bad, n: b.vehicles.filter(v => !v.ai).length };
});
ok(cyc.bad === 0, `Ein-/Aussteigen bei ${cyc.n} Fahrzeugen ohne Fehler (${cyc.bad} Fehler)`);
// Stabilität: wilde Eingaben + Zeitraffer
const wild = await page.evaluate(async () => {
  const b = window.__bi; const sleep = ms => new Promise(r => setTimeout(r, ms));
  const v = b.vehicles.find(v => v.type === 'bike'); b.P.x = v.x + 2; b.P.z = v.z; if (b.P.veh) b.leave(); b.enter(v);
  for (let i = 0; i < 60; i++) { b.keys.u = Math.random() < .8; b.keys.d = Math.random() < .1; b.keys.l = Math.random() < .4; b.keys.r = Math.random() < .4; b.inp.turbo = Math.random() < .3; await sleep(80); }
  b.keys.u = b.keys.d = b.keys.l = b.keys.r = false; b.inp.turbo = false;
  const bad = [...b.vehicles, ...b.npcs.map(n => n), ...b.animals].filter(o => !isFinite(o.x + o.z)).length;
  return { bad, r: Math.hypot(v.x, v.z), inside: b.W.K.LIMIT };
});
ok(wild.bad === 0 && wild.r <= wild.inside + .5, `Wilde Fahrt: keine NaN, Radius ${wild.r.toFixed(0)} <= ${wild.inside}`);
// Speichern
await page.evaluate(() => window.__bi.save.stars += 0); await page.waitForTimeout(1800);
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bunteInsel.save')).stars);
ok(stored > 20, 'Sterne im Speicher: ' + stored);
// Pause / Nacht / Ton
await page.keyboard.press('Escape'); ok(await ev(() => window.__bi.state === 'pause'), 'Pause an'); await page.keyboard.press('Escape'); ok(await ev(() => window.__bi.state === 'play'), 'Pause aus');
console.log('mission? ', await ev(() => window.__bi.mission && window.__bi.mission.kind));
console.log('errs', errs); console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
await browser.close(); process.exit(fails || errs.length ? 1 : 0);
