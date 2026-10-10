/* Browser-Test der Bunten Insel: alle Missionen, Zug, Löschen, Sterne, Ein-/Aussteigen, Stabilität.
   Voraussetzung: laufender Webserver im Repo-Hauptordner und Playwright (npm i -D playwright).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/e2e.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
const errs = []; let fails = 0;
page.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack||'').split('\n').slice(0,4).join('\n')));
page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.type()+': ' + m.text()); });
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort());
await page.goto(BASE + '/bunte-insel/index.html');
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
// Hubschrauber: starten, Ringe, Landen, Aussteigen nur am Boden
const hel = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const v = b.vehicles.find(v => v.type === 'heli'); b.P.x = v.x + 3; b.P.z = v.z; b.enter(v);
  const n = b.mission.steps.length, s0 = b.save.stars; b.inp.up = true; await sleep(2500); b.inp.up = false; const y1 = v.y; b.leave(); const stayed = !!b.P.veh;
  for (let i = 0; i < n; i++) { const m = b.mission; if (!m) break; const s = m.steps[m.i]; v.x = s.x; v.z = s.z; v.y = s.air ? s.y : .5; v.v = 0; v.vy = 0; await sleep(250); }
  await sleep(300); const g = b.save.stars - s0; v.y = 0; v.vy = 0; v.v = 0; b.leave(); return { y1, stayed, g, n, out: !b.P.veh };
});
ok(hel.y1 > 4 && hel.stayed && hel.g >= hel.n + 5 && hel.out, `Hubschrauber: Höhe ${hel.y1.toFixed(1)}, in der Luft kein Aussteigen, ${hel.n} Schritte, +${hel.g} Sterne`);
// Zug-Simulation: 3 Halte mit Türen öffnen/schließen, Fahrgäste, Bonus
const tr = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const c = b.train.cars[0]; b.P.x = c.x + 3; b.P.z = c.z + 2; b.enter(b.trainVeh);
  const M = b.mission, n = M.steps.length, s0 = b.save.stars, res = [];
  for (let k = 0; k < n; k++) { const s = b.mission.steps[b.mission.i]; b.train.v = 0; b.train.s = b.W.stations[s.idx].s - 1.5; b.train.mode = 'drive'; await sleep(400); res.push(s.phase); b.trainDoors(); await sleep(4300); res.push(s.phase); b.trainDoors(); await sleep(400); }
  const out = { kind: M.kind, n, res, gained: b.save.stars - s0, pax: b.pax, done: !b.mission }; b.train.v = 0; b.leave(); return out;
});
ok(tr.kind === 'train' && tr.res.filter(x => x === 'arrived').length === tr.n && tr.res.filter(x => x === 'open').length === tr.n && tr.done, `Zug-Simulation: ${tr.n} Halte (${tr.res.join(',')}), +${tr.gained} Sterne, ${tr.pax} Fahrgäste`);
// Spaß: Kaugummi trifft Dorfbewohner, Tanzparty, Ball, Ballons, Feuerwerk
const fn = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.P.x = 5; b.P.z = 30; b.P.h = Math.PI; b.cam.yaw = 0;
  const n = b.npcs[0]; n.x = 5; n.z = 24; n.tx = n.x; n.tz = n.z; n.wait = 99; const s0 = b.save.stars; b.fun.gum(); await sleep(900); const gained = b.save.stars - s0, gum = !!n.gumMesh;
  b.npcs.forEach((q, i) => { q.x = 5 + Math.sin(i) * 8; q.z = 30 + Math.cos(i) * 8; q.tx = q.x; q.tz = q.z; q.wait = 0; });
  b.doFun('dance'); await sleep(5000); const close = b.npcs.filter(q => Math.hypot(q.x - b.P.x, q.z - b.P.z) < 5).length; const s1 = b.save.stars; await sleep(6000); const party = b.save.stars - s1; b.doFun('dance');
  b.doFun('ball'); b.doFun('balloons'); b.doFun('fireworks'); await sleep(2500); return { gained, gum, close, party, stopped: !b.fun.dancing };
});
ok(fn.gained === 1 && fn.gum && fn.close >= 4 && fn.party >= 3 && fn.stopped, `Spaß: Kaugummi klebt (+${fn.gained}), ${fn.close} Tänzer im Kreis, Party-Bonus +${fn.party}`);
// Bauen: Haus bauen, Wand/Tür/Trampolin, Löschen, Speichern, Neustart
const bd = await page.evaluate(async () => {
  const b = window.__bi, B = b.build, W = b.W, sleep = ms => new Promise(r => setTimeout(r, ms)); let base = null;
  for (let gx = -30; gx < 30 && !base; gx++) for (let gz = 5; gz < 30 && !base; gz++) { let all = true; for (let i = -1; i <= 3 && all; i++) for (let j = -1; j <= 3 && all; j++) if (!B.canPlace('floor', gx + i, gz + j, 0)) all = false; if (all && Math.hypot(gx * 4, gz * 4) < 100) base = [gx, gz]; }
  const out = { roadBlocked: !B.canPlace('floor', 0, 0, 0) }; b.P.x = base[0] * 4 + 6; b.P.z = base[1] * 4 + 14; b.toggleBuild(); out.active = B.active; const [gx, gz] = base;
  const put = (t, x, z, r) => { B.setType(t); B.gx = x; B.gz = z; B.rot = r; B.valid = B.canPlace(t, x, z, r); return B.place(); };
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { put('floor', gx + i, gz + j, 0); put('roof', gx + i, gz + j, 0); }
  put('wall', gx, gz, 0); put('wall', gx + 1, gz, 0); put('window', gx, gz + 1, 2); put('door', gx + 1, gz + 1, 2); put('wall', gx, gz, 1); put('wall', gx, gz + 1, 1); put('wall', gx + 1, gz, 3); put('wall', gx + 1, gz + 1, 3); put('sofa', gx, gz, 0); put('tramp', gx + 3, gz + 2, 0);
  out.count = B.count; await sleep(500);
  out.wallBlocks = W.resolve(gx * 4, gz * 4 - 2, .45, {}).hit; out.doorOpen = !W.resolve((gx + 1) * 4, (gz + 1) * 4 + 2, .45, {}).hit; out.postBlocked = W.resolve((gx + 1) * 4 + 1.6, (gz + 1) * 4 + 2, .45, {}).hit;
  B.exit(); document.body.classList.remove('building'); b.P.x = (gx + 3) * 4; b.P.z = (gz + 2) * 4; b.P.y = .05; b.P.vy = -3; let peak = 0; for (let i = 0; i < 12; i++) { await sleep(80); peak = Math.max(peak, b.P.y); } out.peak = peak;
  B.active = true; B.gx = gx; B.gz = gz; const n0 = B.count; B.remove(); B.active = false; out.removed = n0 - B.count; await sleep(1200); out.stored = JSON.parse(localStorage.getItem('bunteInsel.build')).length; out.left = B.count; return out;
});
ok(bd.roadBlocked && bd.active && bd.count >= 18 && bd.wallBlocks && bd.doorOpen && bd.postBlocked && bd.peak > 1.5 && bd.removed >= 3 && bd.stored === bd.left, `Bauen: ${bd.count} Teile, Wand blockiert, Türlücke offen, Trampolin-Sprung ${bd.peak.toFixed(1)} m, ${bd.removed} entfernt, ${bd.stored} gespeichert`);
await page.reload(); await page.waitForFunction(() => window.__bi); const again = await page.evaluate(() => window.__bi.build.count);
ok(again === bd.left, `Nach Neustart noch ${again} Bauteile da`); await page.click('#bStart'); await page.waitForTimeout(300);
// Baum hauen (wackelt, 8 Treffer = Baum gibt auf), Blitz spürt Sterne auf, Seifenblasen (XXL trägt hoch), Pappnase fangen
const fx2 = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const out = {}; document.getElementById('toast').style.display = 'none';
  const T = b.W.trees[0]; b.P.x = T.x + 1.6; b.P.z = T.z; b.P.h = 0; await sleep(300); out.treeNear = !!b.fun.nearTree(); const s0 = b.save.stars; b.doPunch(); await sleep(250); out.wobbles = T.dirty;
  for (let i = 0; i < 9; i++) { for (let k = 0; k < 60 && b.P.punchT > 0; k++) await sleep(50); await sleep(150); b.doPunch(); } for (let k = 0; k < 60 && b.P.punchT > 0; k++) await sleep(50); await sleep(700); out.treeStars = b.save.stars - s0; out.treeDone = T.cd > 0;
  b.P.x = 0; b.P.z = 40; b.pup.x = 0; b.pup.z = 42; const s1 = b.save.stars; b.doFun('search'); out.pupSearch = b.pup.mode === 'search'; for (let i = 0; i < 80 && b.pup.mode === 'search'; i++) await sleep(250); out.pupStar = b.save.stars - s1;
  b.P.x = 5; b.P.z = 30; b.P.h = Math.PI; b.doFun('bubbles'); await sleep(900); b.doFun('xxl'); await sleep(2800); out.rideY = b.P.y; b.doFun('xxl'); await sleep(2500); out.landed = b.P.y < .3;
  const s2 = b.save.stars; b.doFun('balloons'); await sleep(2000); out.pap = b.save.stars - s2; return out;
});
ok(fx2.treeNear && fx2.wobbles && fx2.treeDone && fx2.treeStars >= 3, `Baum hauen: wackelt, besiegt, +${fx2.treeStars} Sterne`);
ok(fx2.pupSearch && fx2.pupStar >= 1, `Blitz spürt einen Stern auf (+${fx2.pupStar})`);
ok(fx2.rideY > 3 && fx2.landed, `Riesen-Seifenblase trägt hoch (${fx2.rideY.toFixed(1)} m) und landet sanft`);
ok(fx2.pap >= 1, `Pappnase gefangen (+${fx2.pap})`);
// Spielzeugladen: Verkäuferin, Einkaufen mit Sternen, Anziehen
const sh = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.save.stars = 20; b.P.x = -27; b.P.z = 28.5; b.P.h = 0; await sleep(500);
  const out = { inShop: b.inShop(), counter: b.nearCounter() }; b.openShop(); out.open = b.shopOpen; const s0 = b.save.stars;
  const it = id => b.SHOP.find(x => x.id === id); b.buyItem(it('hat_crown')); b.buyItem(it('glasses')); b.buyItem(it('teddy')); out.spent = s0 - b.save.stars; out.equip = JSON.stringify(b.save.equip); b.closeShop(); return out;
});
ok(sh.inShop && sh.counter && sh.open && sh.spent === 7 && /crown/.test(sh.equip) && /"glasses":true/.test(sh.equip) && /"teddy":true/.test(sh.equip), `Spielzeugladen: Theke, gekauft für ${sh.spent} Sterne (${sh.equip})`);
// Jannis' RC-Auto: von Anfang an da, wird per Fernsteuerung gelenkt, Jannis bleibt stehen
const rc = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const v = b.vehicles.find(q => q.type === 'rc'); b.spawnRC(); await sleep(300);
  const out = { has: !!v, near: b.nearVehicle() === v, scale: v.root.scale.x }; const px = b.P.x, pz = b.P.z, vx = v.x, vz = v.z; b.enter(v); out.charVisible = b.P.veh === v && true;
  b.keys.u = true; out.rcSpeed = 0; for (let i = 0; i < 15; i++) { await sleep(100); out.rcSpeed = Math.max(out.rcSpeed, v.v); } b.keys.u = false; out.rcMoved = Math.hypot(v.x - vx, v.z - vz); out.jannisStayed = Math.hypot(b.P.x - px, b.P.z - pz) < .5; b.leave(); out.left = !b.P.veh; return out;
});
ok(rc.has && rc.near && rc.scale < .5 && rc.rcSpeed > 4 && rc.rcMoved > 3 && rc.jannisStayed && rc.left, `RC-Auto per Fernsteuerung: fährt ${rc.rcMoved.toFixed(1)} m, Jannis bleibt stehen, Steuerung wieder zurück`);
// Schnellmenü: max. 6 passende Aktionen, Baum in der Nähe -> Hauen vorn, Klick führt aus und schließt
const qm = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const T = b.W.trees[1]; b.P.x = T.x + 1.6; b.P.z = T.z; await sleep(300);
  b.renderQuick(); const bar = document.getElementById('funBar'); bar.hidden = false; const first = bar.querySelector('.fb').dataset.k, n = bar.querySelectorAll('.fb:not(.more)').length, more = !!bar.querySelector('.more');
  bar.querySelector('.more').click(); const all = bar.querySelectorAll('.fb:not(.more)').length; bar.querySelector('.more').click(); const u0 = (b.save.use || {})[first] || 0;
  bar.querySelector('.fb').click(); await sleep(200); return { first, n, more, all, closed: bar.hidden, used: (b.save.use[first] || 0) - u0 };
});
ok(qm.first === 'punch' && qm.n === 6 && qm.more && qm.all > 6 && qm.closed && qm.used === 1, `Schnellmenü: ${qm.n} Aktionen (Baum nah -> ${qm.first} zuerst), „Mehr“ zeigt ${qm.all}, schließt nach Auswahl`);
// Boot am Steg: einsteigen, aufs Meer, Segeltörn-Mission, nur am Steg aussteigen
const bt = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const v = b.boat; b.P.x = 0; b.P.z = 205.5; b.P.y = .65; await sleep(300);
  const out = { near: b.nearVehicle() === v }; b.enter(v); out.mission = b.mission && b.mission.kind; v.h = Math.PI * .5; b.keys.u = true; await sleep(2500); b.keys.u = false; out.speed = v.v; out.rad = Math.hypot(v.x, v.z); out.farLeave = (b.leave(), !!b.P.veh);
  const s0 = b.save.stars; const n = b.mission.steps.length; for (let i = 0; i < n; i++) { const m = b.mission; if (!m) break; const st = m.steps[m.i]; v.x = st.x; v.z = st.z; v.v = 0; await sleep(250); } await sleep(400); out.gained = b.save.stars - s0;
  v.x = b.W.dock.x; v.z = b.W.dock.z + 2; v.v = 0; await sleep(200); b.leave(); out.back = !b.P.veh && Math.abs(b.P.z - 205.5) < 1 && b.P.y > .5; out.insideShore = Math.hypot(v.x, v.z) >= 205; return out;
});
ok(bt.near && bt.mission === 'sail' && bt.speed > 3 && bt.rad >= 205 && bt.farLeave && bt.gained >= 9 && bt.back, `Boot: Segeltörn (+${bt.gained} Sterne), Meer r=${bt.rad.toFixed(0)}, Aussteigen nur am Steg, Spieler zurück auf dem Steg`);
// Piratenschiff: Rampe hinauf, Deck, Schatztruhe (+3), Kanonen
const sp = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const S = b.SHIP, out = {};
  b.P.x = 150; b.P.z = S.cz + 2; b.P.y = 0; b.P.h = Math.PI / 2; b.cam.yaw = -Math.PI / 2; b.keys.d = false; b.inp.sx = 0; await sleep(200);
  b.P.x = S.ramp.x0 + .5; b.P.y = 0; for (let i = 0; i < 40 && !b.onDeck(); i++) { b.P.x += .3; await sleep(80); } await sleep(300); out.onDeck = b.onDeck(); out.y = b.P.y;
  b.P.x = S.chest.x + 1.5; b.P.z = S.chest.z; await sleep(300); out.chestNear = b.nearChest(); const s0 = b.save.stars; b.openChest(); out.chest = b.save.stars - s0; const s1 = b.save.stars; b.openChest(); out.chestCd = b.save.stars === s1;
  b.doFun('cannon'); await sleep(1500); const hull = b.W.resolve(S.cx - 5, S.cz, .45, {}); out.hullSolid = hull.hit || true; b.P.x = S.cx - 6; b.P.z = S.cz; b.P.y = 0; out.pushed = b.W.resolve(S.cx - 3.5, S.cz, .45, {}, undefined).hit; return out;
});
ok(sp.onDeck && sp.y > 2 && sp.chestNear && sp.chest === 3 && sp.chestCd && sp.pushed, `Piratenschiff: Rampe hoch (Deck y=${sp.y.toFixed(1)}), Schatztruhe +${sp.chest}, danach leer, Rumpf fest, Kanonen ohne Fehler`);
// Blitz: 5 Tricks (Trick-Meister +2), Apport (+1)
const dg = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.P.x = 0; b.P.z = 40; b.pup.x = 0; b.pup.z = 42; b.pup.mode = 'follow'; const s0 = b.save.stars; const names = [];
  for (let i = 0; i < 5; i++) { b.doFun('trick'); names.push(b.pup.trick && b.pup.trick.name); for (let k = 0; k < 80 && b.pup.trick; k++) await sleep(100); }
  const tricks = b.save.stars - s0; const s1 = b.save.stars; b.doFun('fetch'); const fetching = b.pup.mode === 'fetch'; for (let k = 0; k < 300 && b.pup.mode === 'fetch'; k++) await sleep(100);
  return { names: names.join(','), tricks, fetching, fetch: b.save.stars - s1, done: b.pup.mode === 'follow' };
});
ok(dg.names === 'sit,paw,roll,beg,flip' && dg.tricks === 2 && dg.fetching && dg.fetch === 1 && dg.done, `Blitz: Tricks (${dg.names}) +${dg.tricks}, Apport +${dg.fetch}`);
// Laden: neue Hüte/Zubehör/Spielzeug (3 Reiter), Drachen, RC-Hubschrauber fliegt per Fernsteuerung
const nw = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.save.stars = 60; b.P.x = -27; b.P.z = 28.5; b.P.h = 0; await sleep(400); b.openShop();
  const tabs = document.getElementById('shopTabs').children.length, ids = ['hat_pirate', 'hat_wizard', 'hat_chef', 'hat_party', 'hat_cowboy', 'hat_helmet', 'patch', 'cape', 'wings', 'kite', 'rcheli']; const items = ids.map(id => b.SHOP.find(x => x.id === id));
  for (const it of items) b.buyItem(it); const eq = b.save.equip; b.closeShop(); const out = { tabs, owned: items.every(it => b.save.owned.includes(it.id)), hat: eq.hat, patch: eq.patch, cape: eq.cape, wings: eq.wings, kite: eq.kite };
  const h = b.vehicles.find(q => q.type === 'rcheli'); out.heli = !!h; b.P.x = h.x + 1; b.P.z = h.z; b.enter(h); b.inp.up = true; await sleep(2000); b.inp.up = false; out.altitude = h.y; b.leave(); h.y = 0; return out;
});
ok(nw.tabs === 3 && nw.owned && nw.hat === 'helmet' && nw.patch && nw.cape && nw.wings && nw.kite && nw.heli && nw.altitude > 1.5, `Laden neu: 11 Waren gekauft, Drachen, RC-Hubschrauber steigt ${nw.altitude.toFixed(1)} m`);
// Sterne einsammeln zu Fuß
const st = await page.evaluate(async () => {
  const b = window.__bi; if (b.P.veh) b.leave(); const out = { gained: 0, off: false };
  for (const s of b.stars.filter(q => q.on).slice(0, 8)) { b.P.x = s.x; b.P.z = s.z; b.P.y = 0; const s0 = b.save.stars; await new Promise(r => setTimeout(r, 500)); if (!s.on) { out.gained = b.save.stars - s0; out.off = true; break; } }
  return out;
});
ok(st.gained >= 1 && st.off, 'Stern zu Fuß eingesammelt');
// Aussteigen/Einsteigen-Zyklus: Spieler nie in Hindernis, nie NaN
const cyc = await page.evaluate(async () => {
  const b = window.__bi; const sleep = ms => new Promise(r => setTimeout(r, ms)); let bad = 0;
  for (const v of b.vehicles.filter(v => !v.ai)) { b.P.x = v.x + (v.type === 'boat' ? -3 : 3); b.P.z = v.z; if (b.P.veh) b.leave(); await sleep(60); const nv = b.nearVehicle(); if (!nv) { bad++; continue; } b.enter(nv); await sleep(60); b.leave(); await sleep(40); if (!isFinite(b.P.x + b.P.z) || !b.W.free(b.P.x, b.P.z, .4)) bad++; }
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
const cur = await page.evaluate(() => window.__bi.save.stars); ok(stored === cur, 'Sterne im Speicher: ' + stored + ' (aktuell ' + cur + ')');
// Pause / Nacht / Ton
await page.keyboard.press('Escape'); ok(await ev(() => window.__bi.state === 'pause'), 'Pause an'); await page.keyboard.press('Escape'); ok(await ev(() => window.__bi.state === 'play'), 'Pause aus');
console.log('mission? ', await ev(() => window.__bi.mission && window.__bi.mission.kind));
// Schießbude: Spielzeug-Blaster, nur Attrappen, Herr Hannes, Bahn bleibt sicher
const rg = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const R = b.range, G = b.RG;
  b.P.x = G.x; b.P.z = G.z + 1.5; await sleep(300); const near = b.nearRange(); b.openRange(); const pick = b.rs.ui === 'pick';
  const x0 = b.P.x; b.beginRange('foam'); await sleep(300); const play = b.rs.ui === 'play' && R.running && document.body.classList.contains('ranging');
  // Zielscheibe mittig anvisieren
  const board = R.targets.find(q => q.kind === 'board' && q.pts === 5), n = R.ndcOf(board); b.rs.ax = n.x; b.rs.ay = n.y; const s0 = R.score; const fired = b.rangeShoot(); await sleep(3000);
  const hit = R.score > s0 && R.hits === 1;
  // extreme Schüsse landen immer in der Bahn (kein Ziel -> kein Treffer, kein Fehler)
  const lane = []; for (const [ax, ay] of [[.95, .95], [-.95, -.95], [.95, -.95], [-.95, .95]]) { R.cd = 0; R.fire(ax, ay); }
  await sleep(2500); const okLane = R.shots === 5;
  // Fadenkreuz-Schuss auf Dose, Ente (Zufallsziele) – nichts bricht
  for (const k of ['duck', 'can', 'ghost', 'balloon']) { const g = R.targets.find(q => q.kind === k); const m = R.ndcOf(g); R.cd = 0; R.fire(m.x, m.y); await sleep(1500); }
  // Munition leer -> Runde endet von selbst, Sterne gutgeschrieben
  const st0 = b.save.stars; R.ammo = 0; await sleep(1800); const shots = R.shots, ended = !R.running && !!R.result && b.rs.ui === 'result' && b.save.stars - st0 === R.result.stars;
  const ignored = !R.fire(0, 0);
  b.exitRange(); const left = b.rs.ui === '' && !document.body.classList.contains('ranging');
  // Wasserpistole & Bogen starten, vorzeitiges Verlassen räumt auf
  b.P.x = G.x; b.P.z = G.z; b.beginRange('water'); await sleep(200); R.cd = 0; R.fire(0, 0); b.exitRange(); b.beginRange('bow'); await sleep(200); b.exitRange();
  return { near, pick, play, fired, hit, okLane, ended, ignored, left, nan: !isFinite(b.P.x + b.P.z + b.cam.x), shots };
});
ok(rg.near && rg.pick && rg.play && rg.fired && rg.hit && rg.okLane && rg.ended && rg.ignored && rg.left && rg.nan === false, `Schießbude: Panel, Zielscheibe getroffen, Extremschüsse in der Bahn, Runde endet, Sterne, verlassen (${JSON.stringify(rg)})`);
// Blitz wartet, wenn Jannis fährt, und kommt beim Aussteigen wieder
const pw = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const v = b.vehicles.find(v => v.type === 'car' && !v.ai); b.P.x = v.x + 2; b.P.z = v.z; b.pup.x = b.P.x + 2; b.pup.z = b.P.z; b.pup.mode = 'follow'; b.enter(v);
  const px = b.pup.x, pz = b.pup.z; v.x += 12; await sleep(1500); const stayed = Math.hypot(b.pup.x - px, b.pup.z - pz) < 1.5; b.leave(); await sleep(4000); return { stayed, back: Math.hypot(b.pup.x - b.P.x, b.pup.z - b.P.z) < 6 };
});
ok(pw.stayed && pw.back, `Blitz wartet im Fahrzeug-Betrieb und kommt beim Aussteigen zurück (${JSON.stringify(pw)})`);
// Vorlesen: Schalter, Sprechtext ohne Emojis, kein Fehler
const vo = await page.evaluate(async () => { const b = window.__bi; const said = []; const ss = window.speechSynthesis; const orig = ss && ss.speak; if (ss) ss.speak = u => said.push(u.text); const bv = document.getElementById('bVoice'); bv.click(); const off = b.save.voice === false; bv.click(); const on = b.save.voice === true; const n0 = 0; said.length = 0; b.say('🚗 Fahre zur Tankstelle ⭐', 100); const t1 = said.slice(); if (ss) ss.speak = orig; return { has: !!ss, on, off, t1, n0 }; });
ok(!vo.has || (vo.on && vo.off && vo.t1.length <= 1 && (!vo.t1[0] || !/[🚗⭐]/u.test(vo.t1[0]))), `Vorlesen: Schalter funktioniert, Text ohne Emojis (${JSON.stringify(vo.t1)})`);
// Rennen, mehr Menschen (Familien/Kinder), mehr Fahrzeuge
const ru = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.P.x = 0; b.P.z = 30; b.cam.yaw = 0; b.keys.u = true; await sleep(1500); const walk = b.P.speed; b.inp.turbo = true; await sleep(1500); const run = b.P.speed; b.inp.turbo = false; b.keys.u = false;
  const kids = b.npcs.filter(n => n.kid).length, fam = b.npcs.filter(n => n.lead).length, pk = b.vehicles.filter(v => !v.ai).length;
  const f = b.npcs.find(n => n.lead && n.kid); const L = f.lead; b.P.x = L.x + 4; b.P.z = L.z + 4; L.tx = L.x + 18; L.tz = L.z; L.wait = 0; await sleep(5000); const together = Math.hypot(f.x - L.x, f.z - L.z) < 7;
  return { walk, run, n: b.npcs.length, kids, fam, pk, together };
});
ok(ru.run > ru.walk * 1.3 && ru.n >= 40 && ru.kids >= 12 && ru.fam >= 8 && ru.pk >= 30 && ru.together, `Rennen ${ru.run.toFixed(1)} > Gehen ${ru.walk.toFixed(1)} m/s, ${ru.n} Menschen (${ru.kids} Kinder, ${ru.fam} in Familien), ${ru.pk} Fahrzeuge, Familie bleibt zusammen`);
console.log('errs', errs); console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
// Handy: fester Joystick sichtbar, Tastatur-Hinweise weg; Desktop: umgekehrt
{
  const mk = async o => { const c = await browser.newContext(o), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi); return p; };
  const m = await mk({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); await m.tap('#bStart'); await m.waitForTimeout(500);
  const vis = await m.evaluate(() => { const d = e => getComputedStyle(e).display; return { joy: d(document.getElementById('joy')), kb: [...document.querySelectorAll('.kb')].every(e => d(e) === 'none'), tc: [...document.querySelectorAll('.tc')].every(e => d(e) !== 'none') }; });
  const g = await m.evaluate(() => { const r = document.getElementById('joy').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const pe = (type, x, y) => m.evaluate(([type, x, y]) => document.getElementById('zone').dispatchEvent(new PointerEvent(type, { pointerId: 5, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })), [type, x, y]);
  const z0 = await m.evaluate(() => window.__bi.P.z); await pe('pointerdown', g[0], g[1]); await pe('pointermove', g[0], g[1] - 60); await m.waitForTimeout(1200); const z1 = await m.evaluate(() => window.__bi.P.z); await pe('pointerup', g[0], g[1] - 60);
  ok(vis.joy === 'block' && vis.kb && vis.tc && z1 < z0 - 2, `Handy: fester Joystick läuft (${z0.toFixed(1)} -> ${z1.toFixed(1)}), Tastatur-Hinweise ausgeblendet`);
  await m.context().close();
  const d = await mk({ viewport: { width: 1000, height: 600 } }); const dv = await d.evaluate(() => ({ joy: getComputedStyle(document.getElementById('joy')).display, keys: getComputedStyle(document.getElementById('keys')).display }));
  ok(dv.joy === 'none' && dv.keys !== 'none', 'Desktop: kein Joystick, Tastatur-Hinweis sichtbar'); await d.context().close();
}
await browser.close(); process.exit(fails || errs.length ? 1 : 0);
