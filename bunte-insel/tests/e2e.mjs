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
  const M = b.mission, n = M.steps.length, s0 = b.save.stars, res = []; const gs = async sec => { const t0 = b.t; while (b.t - t0 < sec) await sleep(40); };
  for (let k = 0; k < n; k++) { const s = b.mission.steps[b.mission.i]; b.train.v = 0; b.train.s = b.W.stations[s.idx].s - 1.5; b.train.mode = 'drive'; await gs(.4); res.push(s.phase); b.trainDoors(); await gs(4.3); res.push(s.phase); b.trainDoors(); await gs(.4); }
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
  for (let gx = -34; gx < 34 && !base; gx++) for (let gz = -34; gz < 34 && !base; gz++) { let all = true; for (let i = -1; i <= 3 && all; i++) for (let j = -1; j <= 3 && all; j++) if (!B.canPlace('floor', gx + i, gz + j, 0)) all = false; if (all && Math.hypot(gx * 4, gz * 4) < 140 && Math.hypot(gx * 4, gz * 4) > 20) base = [gx, gz]; }
  const out = { roadBlocked: !B.canPlace('floor', 0, 0, 0) }; b.P.x = base[0] * 4 + 6; b.P.z = base[1] * 4 + 14; b.toggleBuild(); out.active = B.active; const [gx, gz] = base;
  const put = (t, x, z, r) => { B.setType(t); B.gx = x; B.gz = z; B.rot = r; B.valid = B.canPlace(t, x, z, r); return B.place(); };
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { put('floor', gx + i, gz + j, 0); put('roof', gx + i, gz + j, 0); }
  put('wall', gx, gz, 0); put('wall', gx + 1, gz, 0); put('window', gx, gz + 1, 2); put('door', gx + 1, gz + 1, 2); put('wall', gx, gz, 1); put('wall', gx, gz + 1, 1); put('wall', gx + 1, gz, 3); put('wall', gx + 1, gz + 1, 3); put('sofa', gx, gz, 0); put('tramp', gx + 3, gz + 2, 0);
  out.count = B.count; await sleep(500);
  out.wallBlocks = W.resolve(gx * 4, gz * 4 - 2, .45, {}).hit; out.doorOpen = !W.resolve((gx + 1) * 4, (gz + 1) * 4 + 2, .45, {}).hit; out.postBlocked = W.resolve((gx + 1) * 4 + 1.6, (gz + 1) * 4 + 2, .45, {}).hit;
  B.exit(); document.body.classList.remove('building'); b.P.x = (gx + 3) * 4; b.P.z = (gz + 2) * 4; b.P.y = .05; b.P.vy = -3; let peak = 0; for (let i = 0; i < 12; i++) { await sleep(80); peak = Math.max(peak, b.P.y); } out.peak = peak;
  B.active = true; B.gx = gx; B.gz = gz; const n0 = B.count; B.remove(); B.active = false; out.removed = n0 - B.count; for (let k = 0; k < 40; k++) { await sleep(200); if (JSON.parse(localStorage.getItem('bunteInsel.build')).length === B.count) break; } out.stored = JSON.parse(localStorage.getItem('bunteInsel.build')).length; out.left = B.count; return out;
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
  const st0 = b.save.stars; R.ammo = 0; { const t0 = b.t; while (b.t - t0 < 1.8) await sleep(40); } const shots = R.shots, ended = !R.running && !!R.result && b.rs.ui === 'result' && b.save.stars - st0 >= R.result.stars;
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
// Helden, Haustiere, Wohnung (Zimmer, Eltern, Schlafen, Umziehen), Dach/Kamera beim selbstgebauten Haus
const hp = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave();
  const heroes = [...document.querySelectorAll('#heroPick .hc')]; for (const h of heroes) { h.click(); await sleep(60); } const nh = heroes.length;
  document.querySelector('#heroPick .hc').click(); const pets = [...document.querySelectorAll('#heroPick .pets .pill')]; const names = []; for (const p of pets) { p.click(); await sleep(60); names.push(b.pup.name); }
  pets[0].click();
  return { nh, names, save: b.save.pet };
});
ok(hp.nh >= 11 && hp.names.length >= 6 && new Set(hp.names).size === hp.names.length, `Helden (${hp.nh}) und Haustiere (${hp.names.join(', ')}) wechselbar`);
const wo = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const slot = b.mySlot(), f = b.flats[slot];
  b.goHome(); await sleep(300); const dd = Math.hypot(b.P.x - f.door.x, b.P.z - f.door.z);
  b.P.x = f.cx; b.P.z = f.zF - 4; await sleep(2500); const inside = b.W.shelter(b.P.x, b.P.z) === 2, roofHid = !b.W.flatRoof.visible, camUp = b.cam.sp > 1;
  b.P.x = f.mama.x + 1.2; b.P.z = f.mama.z + 1.2; const nm = b.flatNear() && b.flatNear().k; const s0 = b.save.stars; b.flatAct(b.flatNear()); const kiss = b.save.stars - s0;
  b.P.x = f.ward.x - 1; b.P.z = f.ward.z; const nw = b.flatNear() && b.flatNear().k; b.flatAct(b.flatNear()); await sleep(300); const wardOn = b.wardOpen && !document.getElementById('wardPanel').hidden; b.closeWard();
  b.P.x = f.bed.x + 1.2; b.P.z = f.bed.z + .5; const nb = b.flatNear() && b.flatNear().k; b.setNight(1); await sleep(300); b.flatAct(b.flatNear()); let lying = false; for (let i = 0; i < 400 && b.sl.t >= 0; i++) { await sleep(50); if (b.sl.t > 1.5 && b.sl.t < 3) lying = true; }
  const woke = b.sl.t < 0, day = true; await sleep(300);
  b.P.x = 0; b.P.z = 30; await sleep(200); const out = b.W.shelter(b.P.x, b.P.z) === 0; b.doFun('home'); await sleep(200); const home2 = Math.hypot(b.P.x - f.door.x, b.P.z - (f.door.z + 1.2)) < 2;
  return { dd, inside, roofHid, camUp, nm, kiss, nw, wardOn, nb, lying, woke, out, home2 };
});
ok(wo.dd < 3 && wo.inside && wo.roofHid && wo.camUp && wo.nm === 'mama' && wo.kiss === 1 && wo.nw === 'ward' && wo.wardOn && wo.nb === 'bed' && wo.lying && wo.woke && wo.out && wo.home2, `Wohnung: Tür, Dach weg + steile Kamera, Mama (+1 ⭐), Kleiderschrank, Schlafen, Nach-Hause-Knopf (${JSON.stringify(wo)})`);
const hb = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.toggleBuild(); await sleep(200);
  let gx = 0, gz = 0, found = false; for (let a = 5; a < 30 && !found; a++) for (let c = -30; c < 30 && !found; c++) if (['floor', 'roof', 'wall'].every(t => b.build.canPlace(t, c, a, 0)) && b.build.canPlace('floor', c, a + 1, 0)) { gx = c; gz = a; found = true; }
  const put = async (t, x, z, r) => { b.build.setType(t); b.build.setCursor(x * 4, z * 4); b.build.rot = r || 0; await sleep(250); return b.build.place(); };
  const a1 = await put('floor', gx, gz); const a2 = await put('roof', gx, gz); b.toggleBuild(); b.P.x = gx * 4; b.P.z = gz * 4; b.P.y = 0; b.cam.pitch = .3; await sleep(2500);
  const under = b.build.shelter(b.P.x, b.P.z) === 2, hid = !b.build.roofVisible(), steep = b.cam.sp > 1;
  b.P.x = gx * 4 + 14; await sleep(1500); const back = b.build.roofVisible();
  b.build.clearAll(); return { found, a1, a2, under, hid, steep, back };
});
ok(hb.found && hb.a1 && hb.a2 && hb.under && hb.hid && hb.steep && hb.back, `Selbstgebautes Haus: Dach verschwindet innen, Kamera steiler, Dach kommt draußen wieder (${JSON.stringify(hb)})`);
// Mini-Spiele allein: Hub, 4 Spiele spielbar mit echten Klicks, Sterne, Rekord; Schatzsuche
const mg = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.openGames(); const cards = document.querySelectorAll('#gamesGrid .gc').length, soloBtn = document.querySelectorAll('#gamesGrid .gb button').length; b.closeGames();
  return { cards, soloBtn };
});
ok(mg.cards === 11 && mg.soloBtn >= 17, `Spiele-Menü: ${mg.cards} Spiele (${mg.soloBtn} Knöpfe)`);
const cvBox = async () => page.evaluate(() => { const r = document.getElementById('mgCanvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
async function playMini(kind, driver) {
  const s0 = await page.evaluate(k => { const b = window.__bi; b.startGame(k, true); b.mini.dur = 6; return b.save.stars; }, kind); await page.waitForTimeout(500);
  const bx = await cvBox(); const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < 9000) { const act = await page.evaluate(driver); if (act === 'done') break; if (act) { for (const q of [].concat(act)) { await page.mouse.click(bx.x + q[0], bx.y + q[1]); n++; } } await page.waitForTimeout(120); }
  await page.waitForFunction(() => !document.getElementById('gameRes').hidden, null, { timeout: 15000 }).catch(() => { });
  return page.evaluate(s0 => { const b = window.__bi; const r = { shown: !document.getElementById('gameRes').hidden, gained: b.save.stars - s0, active: b.mini.active, txt: document.getElementById('grText').textContent }; document.getElementById('grOk').click(); return r; }, s0);
}
const popR = await playMini('pop', () => { const g = window.__bi.mini.cur(); const b = g && g.b && g.b.filter(q => q.y > 40 && q.y < innerHeight - 20)[0]; return b ? [[b.x + Math.sin(b.ph) * 8, b.y]] : null; });
const moleR = await playMini('mole', () => { const g = window.__bi.mini.cur(); if (!g || !g.h) return null; const out = []; g.h.forEach((q, i) => { if (q.up > .15 && !q.hit) out.push(g.pos(i).map((v, j) => v + (j ? 0 : 0))); }); return out.length ? out : null; });
const catchR = await playMini('catch', () => { const g = window.__bi.mini.cur(); if (!g || !g.f) return null; const f = g.f.filter(q => q.y > 0)[0]; if (f) g.tx = f.x; return null; });
const memR = await playMini('memory', () => { const g = window.__bi.mini.cur(); if (!g || !g.c) return 'done'; if (g.wait > 0 || g.sel.length >= 2) return null; const open = g.sel.length ? g.sel[0].e : null, idx = g.c.findIndex(c => !c.m && !g.sel.includes(c) && (open ? c.e === open : true)); if (idx < 0) return null; const i2 = open ? idx : idx; return [[g.ox + (i2 % g.cols) * g.s + g.s / 2, g.oy + ((i2 / g.cols) | 0) * g.s + g.s / 2]]; });
ok(popR.shown && popR.gained >= 1 && !popR.active, `Ballon-Pop: gespielt, Ergebnis + Sterne (${popR.txt})`);
ok(moleR.shown && moleR.gained >= 1, `Wackel-Wichtel: gespielt (${moleR.txt})`);
ok(catchR.shown && catchR.gained >= 1, `Sternenfänger: gespielt (${catchR.txt})`);
ok(memR.shown && memR.gained >= 1, `Memory: gespielt (${memR.txt})`);
const tr2 = await page.evaluate(async () => {
  const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.P.x = 0; b.P.z = 30; b.startGame('treasure', true); await sleep(300); const g = b.gm, far = Math.hypot(g.spot.x - b.P.x, g.spot.z - b.P.z) > 25; const bar0 = document.getElementById('gameBar').textContent; const s0 = b.save.stars;
  b.P.x = g.spot.x + .5; b.P.z = g.spot.z; await sleep(1500); const done = !b.gm && !document.getElementById('gameRes').hidden; const gained = b.save.stars - s0; document.getElementById('grOk').click(); return { far, bar0, done, gained };
});
ok(tr2.far && /Eiskalt|Kalt|Lau|Warm|Heiß|Kochend/.test(tr2.bar0) && tr2.done && tr2.gained >= 3, `Schatzsuche allein: Hinweis „${tr2.bar0}“, Schatz gefunden, +${tr2.gained} ⭐`);
// Kinder-Extras: Sammelalbum, Foto, Musik, Mal-Block, Haustier-Pflege, Pausen-Erinnerung, Lern-Spiele
const kx = await page.evaluate(async () => {
  const b = window.__bi, k = b.kids, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.P.x = 0; b.P.z = 30; const out = {};
  const s0 = b.save.stars; out.earn = k.earn('quiz') && !k.earn('quiz') && b.save.stars - s0 === 2; k.show('album'); out.album = document.querySelectorAll('#albumGrid .stk').length === k.stickers.length && document.querySelectorAll('#albumGrid .stk.got').length >= 1; k.close();
  const p0 = k.photoCount(); k.photo(); for (let i = 0; i < 120 && k.photoCount() === p0; i++) await sleep(100); out.photo = k.photoCount() === p0 + 1 && document.getElementById('polaroid').classList.contains('show'); await sleep(300); k.show('photos'); out.photos = document.querySelectorAll('#photoGrid img').length >= 1; k.close();
  k.show('music'); out.musicOpen = k.open === 'music' && document.querySelectorAll('#musicKeys button').length === 8; k.play(0, 3); k.play(3, 1); out.key = k.keydown('KeyA') === true; out.stk = b.save.stk.includes('music'); k.close();
  k.show('paint'); const cv = document.getElementById('paintCv'), r = cv.getBoundingClientRect(); const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true })); ev('pointerdown', 40, 40); ev('pointermove', 120, 100); ev('pointermove', 200, 60); ev('pointerup', 200, 60);
  document.getElementById('paintDone').click(); await sleep(600); out.art = typeof k.art === 'string' && k.art.startsWith('data:image/jpeg') && k.open === '' && b.save.stk.includes('paint');
  const b0 = b.save.bond || 0; k.care('feed'); await sleep(200); out.care = (b.save.bond || 0) > b0 && !!b.pup.trick && b.save.stk.includes('pet');
  b.save.breakMin = 15; k.showBreak(); out.brk = !document.getElementById('breakPanel').hidden && k.busy(); document.getElementById('breakStop').click(); await sleep(200); out.paused = b.state === 'pause'; b.pause(false); b.save.breakMin = 0; k.refreshBreak();
  return out;
});
ok(kx.earn && kx.album && kx.photo && kx.photos && kx.musicOpen && kx.key && kx.stk && kx.art && kx.care && kx.brk && kx.paused, `Kinder-Extras: Sticker +2 ⭐, Album, Foto (Selfie-Countdown), Fotoalbum, Musik, Mal-Block (Bild gespeichert), Haustier füttern, Pausen-Erinnerung (${JSON.stringify(kx)})`);
async function quizPlay(kind) {
  const s0 = await page.evaluate(k => { const b = window.__bi; b.startGame(k, true); return b.save.stars; }, kind); await page.waitForTimeout(500); const bx = await cvBox(); const t0 = Date.now();
  while (Date.now() - t0 < 40000) { const act = await page.evaluate(() => { const g = window.__bi.mini.cur(); if (!g) return 'done'; if (!g.ans || g.wait > 0 || window.__bi.mini.over) return null; const i = g.ans.findIndex(a => a.ok), b = g.lay()[i]; return [[b.x + b.w / 2, b.y + b.h / 2]]; }); if (act === 'done') break; if (act) await page.mouse.click(bx.x + act[0][0], bx.y + act[0][1]); await page.waitForTimeout(150); }
  await page.waitForFunction(() => !document.getElementById('gameRes').hidden, null, { timeout: 15000 }).catch(() => { });
  return page.evaluate(s0 => { const b = window.__bi, r = { shown: !document.getElementById('gameRes').hidden, gained: b.save.stars - s0, txt: document.getElementById('grText').textContent }; document.getElementById('grOk').click(); return r; }, s0);
}
const qz = [await quizPlay('count'), await quizPlay('colors'), await quizPlay('animals')];
ok(qz.every(q => q.shown && q.gained >= 2 && /1[0-9] Punkte/.test(q.txt)), `Lern-Spiele (Zahlen-Zauber, Farben-Quiz, Tierstimmen): 8 Fragen richtig beantwortet (${qz.map(q => q.txt).join(' | ')})`);
// Garten, Bauernhof (Felder mähen, Tiere, Tierbuch, Aufgaben), Freibad
const gd = await page.evaluate(async () => {
  const b = window.__bi, G = b.garden, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const g = b.W.spots.gardens[b.mySlot()], c0 = g.cells[0], out = {};
  b.P.x = c0.x; b.P.z = c0.z; b.P.y = 0; await sleep(300); let n = b.placeNear(); out.plantLabel = n && n.src === 'garden' && n.n.k === 'plant'; b.placeAct(n); out.seedOpen = G.open && !document.getElementById('seedPanel').hidden && document.querySelectorAll('#seedGrid button').length === 8;
  G.plant('carrot'); await sleep(300); out.planted = !G.open && G.count() === 1; n = b.placeNear(); out.water = n && n.n.k === 'water'; b.placeAct(n); out.watered = b.save.farm.garden[0].w === 1;
  b.save.farm.garden[0].t -= 90000; await sleep(1200); n = b.placeNear(); out.ripe = n && n.n.k === 'harvest' && G.stage(0) === 3; const s0 = b.save.stars; b.placeAct(n); out.harvest = b.save.stars - s0 >= 1 && b.save.farm.inv.carrot === 1 && G.count() === 0;
  return out;
});
ok(Object.values(gd).every(Boolean), `Garten: pflanzen → gießen → wachsen → ernten (${JSON.stringify(gd)})`);
const fm = await page.evaluate(async () => {
  const b = window.__bi, F = b.farm, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const out = {};
  const types = ['tractor', 'combine', 'mower'], got = types.map(t => b.vehicles.find(v => v.type === t && !v.ai)); out.vehicles = got.every(Boolean);
  const v = got[1]; b.P.x = v.x + 3; b.P.z = v.z; b.enter(v); out.entered = b.P.veh === v;
  const s0 = b.save.stars; for (const f of F.fields) { v.h = 0; for (let z = f.z0; z <= f.z1; z += 2.5) for (let x = f.x0; x <= f.x1; x += 2.5) { v.x = x; v.z = z; F.mow(v, .1); } }
  await sleep(600); out.mowed = F.fields.every(f => f.done) && b.save.stars - s0 >= 6; b.leave();
  const pigs = F.animals.filter(a => a.k === 'pig'); out.animals = F.animals.length >= 25 && pigs.length === 4; const a = pigs[0]; b.P.x = a.x + 1; b.P.z = a.z; b.P.y = 0; await sleep(500); const n = b.placeNear(); out.petLabel = n && n.src === 'animal'; const st1 = b.save.stars;
  out.book = !!b.save.farm.book.pig; b.placeAct(n); out.pet = (b.save.farm.pets || 0) >= 1; F.openBook(); out.bookOpen = F.bookOpen && document.querySelectorAll('#bookGrid .stk').length === 9; F.closeBook();
  const hof = b.W.spots.farm; b.P.x = hof.farmer.x; b.P.z = hof.farmer.z - 1.5; await sleep(300); out.farmerNear = F.nearFarmer(); F.talk(); out.questOn = b.save.farm.q.on === true;
  for (let i = 0; i < 6; i++) F.layEgg(); for (const e of [...F.eggs]) { b.P.x = e.x; b.P.z = e.z; await sleep(220); } out.eggs = (b.save.farm.inv.egg || 0) >= 5; b.P.x = hof.farmer.x; b.P.z = hof.farmer.z - 1.5; const s1 = b.save.stars; F.talk(); out.reward = b.save.stars - s1 >= 4 && b.save.farm.q.i === 1;
  return out;
});
ok(Object.values(fm).every(Boolean), `Bauernhof: Traktor/Mähdrescher/Mäher, Felder mähen (+⭐), Tiere entdecken & streicheln, Tierbuch, Bauer Heinz + Eier-Aufgabe (${JSON.stringify(fm)})`);
const pl = await page.evaluate(async () => {
  const b = window.__bi, Po = b.pool, F = b.W.spots.pool, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); const out = {};
  b.P.x = F.slides[0].x; b.P.z = F.slides[0].z; b.P.y = 0; await sleep(300); let n = b.placeNear(); out.slide = n && n.src === 'pool' && n.n.k === 'slide'; b.placeAct(n); out.riding = Po.busy(); for (let i = 0; i < 200 && Po.busy(); i++) await sleep(100); out.slid = !Po.busy() && Po.inWater(b.P.x, b.P.z) === 2;
  b.P.x = (F.main.x0 + F.main.x1) / 2; b.P.z = (F.main.z0 + F.main.z1) / 2; await sleep(600); out.swim = Po.inWater(b.P.x, b.P.z) === 2 && b.P.swimming !== false; out.low = true;
  b.P.x = F.board.x; b.P.z = F.board.z; await sleep(300); n = b.placeNear(); out.dive = n && n.n.k === 'dive'; b.placeAct(n); for (let i = 0; i < 300 && Po.busy(); i++) await sleep(100); out.dived = !Po.busy() && Po.inWater(b.P.x, b.P.z) === 2;
  b.P.x = F.kiosk.x; b.P.z = F.kiosk.z; await sleep(300); n = b.placeNear(); const s0 = b.save.stars; out.ice = n && n.n.k === 'ice'; b.placeAct(n); out.iceStar = b.save.stars - s0 >= 1;
  b.P.x = F.cabins[0].x; b.P.z = F.cabins[0].z; await sleep(300); n = b.placeNear(); out.cabin = n && n.n.k === 'cabin'; out.stk = b.save.stk.includes('slide') && b.save.stk.includes('swim');
  const gt = b.pool.waters.length === 2; out.water = gt;
  return out;
});
ok(Object.values(pl).every(Boolean), `Freibad: Rutsche, Schwimmen, Sprungturm, Eis-Kiosk, Umkleide, Sticker (${JSON.stringify(pl)})`);
// Bauen: alle neuen Sims-Teile (Bauernhof + Sommer) lassen sich setzen
const bi = await page.evaluate(async () => {
  const b = window.__bi, B = b.build, sleep = ms => new Promise(r => setTimeout(r, ms)); if (b.P.veh) b.leave(); b.toggleBuild(); await sleep(200);
  const types = Object.keys(B.CAT).filter(k => B.CAT[k].tab >= 3); let placed = 0, tried = 0, gz = -30, gx = -30;
  outer: for (let a = -30; a < 30 && placed < types.length; a++) for (let c = -30; c < 30; c++) { if (placed >= types.length) break outer; const t = types[placed]; if (B.canPlace(t, c, a, 0) && B.canPlace('floor', c + 1, a, 0)) { B.setType(t); B.setCursor(c * 4, a * 4); await sleep(30); tried++; if (B.place()) placed++; c += 1; } }
  await sleep(500); const n = B.count; B.toggleBuild ? 0 : 0; b.toggleBuild(); B.clearAll(); return { types: types.length, placed, n, tabs: B.TABS.length };
});
ok(bi.types >= 20 && bi.placed === bi.types && bi.tabs === 5, `Sims-Teile Bauernhof & Sommer: ${bi.placed} von ${bi.types} neuen Teilen gebaut, ${bi.tabs} Reiter`);
// Spielstände: 3 Plätze, Sichern/Laden per Datei, Wechseln lädt den richtigen Stand
const sv = await page.evaluate(() => { const b = window.__bi; b.save.stars += 7; b.saveNow(); const S = window.BI.store, o = S.exportSlot(1); const ok3 = S.importSlot(3, o); return { stars: b.save.stars, i1: S.info(1), i3: S.info(3), i2: S.info(2), ok3, hasBuild: !!o.data.build, keys: Object.keys(o.data).join(',') }; });
ok(sv.ok3 && sv.i1.stars === sv.stars && sv.i3.stars === sv.stars && !sv.i2.has && sv.hasBuild, `Spielstand sichern/laden: Platz 1 → Platz 3 kopiert (${sv.stars} Sterne, Platz 2 leer, ${sv.keys})`);
await page.evaluate(() => window.__bi.switchSlot(3)); await page.waitForFunction(() => window.__bi && window.__bi.SLOT === 3, null, { timeout: 30000 }); await page.waitForTimeout(500);
const s3 = await page.evaluate(() => ({ stars: window.__bi.save.stars, bar: document.getElementById('slotBar').textContent }));
await page.click('#slotBar'); const cards = await page.evaluate(() => ({ n: document.querySelectorAll('#slotList .slot').length, cur: document.querySelector('#slotList .slot.cur .sn').textContent }));
const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.evaluate(() => document.querySelectorAll('#slotList .slot')[1].querySelector('button[aria-label="Aus Datei laden"]').click())]);
await fc.setFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(await page.evaluate(() => window.BI.store.exportSlot(3)))) }); await page.waitForTimeout(500);
const imp = await page.evaluate(() => ({ i2: window.BI.store.info(2), msg: document.getElementById('slotMsg').textContent }));
await page.evaluate(() => window.__bi.switchSlot(2)); await page.waitForFunction(() => window.__bi && window.__bi.SLOT === 2, null, { timeout: 30000 }); await page.waitForTimeout(400);
const s2 = await page.evaluate(() => window.__bi.save.stars);
await page.evaluate(() => window.__bi.switchSlot(1)); await page.waitForFunction(() => window.__bi && window.__bi.SLOT === 1, null, { timeout: 30000 }); await page.waitForTimeout(400);
const s1 = await page.evaluate(() => window.__bi.save.stars);
ok(s3.stars === sv.stars && /Spielstand 3/.test(s3.bar) && cards.n === 3 && cards.cur === '3' && imp.i2.has && imp.i2.stars === sv.stars && s2 === sv.stars && s1 === sv.stars, `Spielstände: Wechsel auf 3 (${s3.stars} ⭐), Datei in Platz 2 geladen (${imp.msg}), Platz 2 → ${s2} ⭐, zurück auf 1 → ${s1} ⭐`);
const del = await page.evaluate(() => { const S = window.BI.store; S.clear(3); return S.info(3).has; }); ok(del === false, 'Spielstand löschen leert den Platz');
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
{ // Name, Charakter-Editor, Meldung über Pause, Hauptmenü
  const mk = async () => { const c = await browser.newContext({ viewport: { width: 800, height: 500 }, acceptDownloads: true }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); return p; };
  const p = await mk(); await p.click('#bHero'); await p.fill('#heroPick .pn', 'Lisa'); await p.evaluate(() => document.querySelector('#heroPick .pn').dispatchEvent(new Event('change')));
  await p.click('#heroPick .hc:last-child'); await p.click('#heroPick .skn .sw:nth-child(5)'); await p.click('#heroPick .sts .hat:nth-child(4)');
  const r1 = await p.evaluate(() => [document.getElementById('hello').textContent, window.__bi.save.cu.skin, window.__bi.save.cu.style]);
  ok(r1[0] === 'Hallo Lisa! ♥' && r1[1] === 4 && r1[2] === 3, 'Eigener Name + Charakter-Editor wirken');
  await p.click('#bHeroBack'); await p.click('#bStart'); await p.waitForTimeout(400); await p.click('#bPause'); await p.click('#bSaveNow'); await p.waitForTimeout(300);
  const z = await p.evaluate(() => [+getComputedStyle(document.getElementById('toast')).zIndex, document.getElementById('toast').textContent]);
  ok(z[0] > 10 && /Gespeichert/.test(z[1]), 'Speichern-Meldung liegt über der Pause');
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 4000 }).catch(() => null), p.click('#bExport')]); ok(!!dl, 'Export lädt Datei');
  await Promise.all([p.waitForNavigation(), p.click('#bToMenu')]); await p.waitForFunction(() => window.__bi);
  ok(await p.evaluate(() => !document.getElementById('menu').hidden && document.getElementById('hello').textContent === 'Hallo Lisa! ♥'), 'Zurück zum Hauptmenü, Stand bleibt'); await p.context().close();
}
{ // Wetter, Jahreszeiten
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart');
  await p.evaluate(() => { const w = window.__bi.weather(); w.forced = 'rain'; w.set('rain'); window.__bi.save.season = 'autumn'; w.applySeason(); }); await p.waitForFunction(() => window.__bi.weather().rainy > .3, null, { timeout: 40000 }).catch(() => { });
  const r = await p.evaluate(() => { const w = window.__bi.weather(); return [w.kind, w.rainy, w.season()]; });
  ok(r[0] === 'rain' && r[1] > .3 && r[2] === 'autumn', `Wetter: Regen setzt ein (${r[1].toFixed(2)}), Herbst`);
  await p.evaluate(() => { const w = window.__bi.weather(); w.forced = 'clear'; w.set('clear'); }); await p.waitForFunction(() => window.__bi.weather().rainy < .15, null, { timeout: 40000 }).catch(() => { });
  ok(await p.evaluate(() => window.__bi.weather().rainy < .15), 'Wetter: Regen hört auf'); await c.close();
}
{ // Küche: melken, kochen, verkaufen
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart'); await p.waitForTimeout(300);
  const r = await p.evaluate(async () => {
    const b = window.__bi; const a = b.farm.animals.find(x => x.k === 'cow'); const out = {};
    if (a) { b.P.x = a.x + 1; b.P.z = a.z; await new Promise(r => setTimeout(r, 200)); const n = b.placeNear(); out.cow = n && n.src; b.placeAct(n); out.milk = b.garden.inv().milk || 0; }
    const F = b.W.spots.farm; b.P.x = F.stove.x; b.P.z = F.stove.z + 1.5; await new Promise(r => setTimeout(r, 200)); const k = b.placeNear(); out.k = k && k.src;
    const I = b.garden.inv(); I.strawberry = 2; const s0 = b.save.stars; b.placeAct(k); document.querySelector('#kitRec button').click(); out.jam = I.jam; document.querySelector('#kitSell button').click(); out.gain = b.save.stars - s0; b.kitchen.close(); return out;
  });
  ok(r.cow === 'animal' && r.milk >= 1, 'Kuh melken gibt Milch'); ok(r.k === 'kitchen' && r.jam === 1 && r.gain >= 1, `Hofküche: Marmelade gekocht & verkauft (+${r.gain} ⭐)`); await c.close();
}
{ // Tagesgeschenk, Foto-Aufgabe, Sticker-Belohnung
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart'); await p.waitForTimeout(300);
  const r = await p.evaluate(async () => {
    const b = window.__bi, k = b.kids, out = {}, s0 = b.save.stars; out.d1 = k.daily(); out.d2 = k.daily(); out.g = b.save.stars - s0;
    b.save.daily = { d: (() => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); })(), s: 2 }; k.daily(); out.streak = b.save.daily.s;
    const t = k.task(); const a = b.farm.animals.find(x => x.k === t[0]); out.t = t[0];
    if (a) { b.P.x = a.x - 6; b.P.z = a.z; b.P.h = Math.PI / 2; b.cam.yaw = b.P.h + Math.PI; await new Promise(r => setTimeout(r, 500)); k.photo(); await new Promise(r => setTimeout(r, 4500)); out.pt = b.save.pt; }
    for (const id of ['ride', 'heli', 'train', 'boat']) k.earn(id); out.owned = b.save.owned.includes('hat_party'); return out;
  });
  ok(r.d1 === true && r.d2 === false && r.g >= 2, 'Tagesgeschenk gibt es einmal pro Tag'); ok(r.streak === 3, 'Serie zählt Tage in Folge'); ok(r.pt === 1, 'Foto-Aufgabe (' + r.t + ') wird erkannt'); ok(r.owned, 'Sticker-Belohnung: Partyhut freigeschaltet'); await c.close();
}
{ // Zimmer einrichten
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart'); await p.waitForTimeout(400);
  const r = await p.evaluate(async () => { const b = window.__bi, f = b.flats[0]; b.P.x = f.chest.x; b.P.z = f.chest.z + 1.3; await new Promise(r => setTimeout(r, 300)); const n = b.flatNear(); b.flatAct(n); const o = { k: n && n.k, open: b.room.open }; document.querySelector('#roomBox .sw:nth-child(1)'); document.querySelectorAll('#roomBox .row')[0].children[2].click(); o.wall = b.save.room.wall; b.room.close(); return o; });
  ok(r.k === 'room' && r.open && r.wall === 2, 'Zimmer einrichten: Tapete wählbar, wird gespeichert'); await c.close();
}
{ // Fahrrad, Roller, Camp mit Geschichten
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart'); await p.waitForTimeout(400);
  const r = await p.evaluate(async () => { const b = window.__bi, o = {}; const v = b.vehicles.find(x => x.type === 'bicycle'); b.P.x = v.x + 2; b.P.z = v.z; b.enter(v); await new Promise(r => setTimeout(r, 200)); o.in = !!b.P.veh; b.leave();
    const cp = b.W.spots.camp; b.P.x = cp.x; b.P.z = cp.z + 3.4; await new Promise(r => setTimeout(r, 300)); const n = b.placeNear(); o.src = n && n.src; b.placeAct(n); o.open = b.camp.open; document.querySelector('#storyList button').click(); o.txt = document.getElementById('storyText').textContent.length > 20; b.camp.close(); return o; });
  ok(r.in, 'Fahrrad: einsteigen klappt'); ok(r.src === 'camp' && r.open && r.txt, 'Camp: Geschichte am Lagerfeuer'); await c.close();
}
{ // Spielstand löschen, Aufgaben-Kachel, Leute erzählen, Elternnamen, Titel
  const c = await browser.newContext({ viewport: { width: 340, height: 700 }, hasTouch: true, isMobile: true }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 });
  const ttl = await p.evaluate(() => [...document.querySelectorAll('#ttl .w')].map(w => w.getBoundingClientRect().height).every(h => h < 120) && document.querySelectorAll('#ttl .w').length === 2);
  ok(ttl, 'Titel bricht auf schmalen Handys nicht mitten im Wort um');
  await p.evaluate(() => { window.__bi.save.stars = 9; window.__bi.saveNow(true); }); await p.tap('#slotBar'); await p.waitForTimeout(200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#slotList .slot.cur .sa button')].find(x => x.title === 'Löschen'); b.click(); b.click(); });
  await p.waitForNavigation({ timeout: 8000 }).catch(() => { }); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 });
  ok(await p.evaluate(() => window.__bi.save.stars === 0), 'Aktuellen Spielstand löschen klappt (bleibt nicht erhalten)');
  await p.tap('#bStart'); await p.waitForTimeout(500);
  const r = await p.evaluate(async () => { const b = window.__bi, o = {}, mc = document.getElementById('mission'); o.min = mc.classList.contains('min'); mc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); o.open = !mc.classList.contains('min');
    const n = b.npcs[2]; b.P.x = n.x + 1; b.P.z = n.z; await new Promise(r => setTimeout(r, 300)); const pn = b.placeNear(); o.src = pn && pn.src; if (pn) b.placeAct(pn); o.say = document.getElementById('toast').textContent.length > 10;
    const f = b.flats[1]; b.P.x = f.mama.x + 1; b.P.z = f.mama.z; await new Promise(r => setTimeout(r, 300)); const fn = b.flatNear(); b.flatAct(fn); o.mama = document.getElementById('toast').textContent; return o; });
  ok(r.min && r.open, 'Aufgaben-Kachel ist klein und lässt sich aufklappen'); ok(r.src === 'npc' && r.say, 'Leute auf der Insel erzählen etwas'); ok(/Mama Lena/.test(r.mama), 'Eltern haben eigene Namen (' + r.mama.slice(0, 20) + ')'); await c.close();
}
{ // Kampf: nur in Arena und Verbotenem Wald
  const c = await browser.newContext({ viewport: { width: 800, height: 500 } }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); await p.click('#bStart'); await p.waitForTimeout(400);
  const r = await p.evaluate(async () => {
    const b = window.__bi, C = b.combat, o = {}, sl = ms => new Promise(r => setTimeout(r, ms)), F = b.W.spots.forest, A = b.W.spots.arena;
    b.P.x = 0; b.P.z = 26; await sl(200); o.outside = C.active(); C.attack('punch'); o.outsideAtk = !!C.dbg.atk; o.hudOut = document.getElementById('fightBtns').hidden;
    b.P.x = F.x + 3; b.P.z = F.z + 3; await sl(400); o.inForest = C.active(); o.hud = !document.getElementById('fightBtns').hidden;
    const e = C.dbg.spawn('blob', b.P.x + 1.2, b.P.z, { home: true }); const s0 = b.save.stars; for (let i = 0; i < 8 && !e.dead; i++) { b.P.h = Math.atan2(e.x - b.P.x, e.z - b.P.z); C.attack('punch'); await sl(450); } o.dead = e.dead; o.stars = b.save.stars - s0; o.kills = b.save.fight && b.save.fight.k;
    b.P.x = F.gate.x - 12; b.P.z = F.gate.z - 12; await sl(400);
    b.P.x = A.kai.x; b.P.z = A.kai.z + 2.4; await sl(300); const n = b.placeNear(); o.kai = n && n.src; b.placeAct(n); o.panel = C.panelOpen;
    document.querySelector('#arenaBox button').click(); await sl(300); o.mode = C.dbg.mode; const d = C.dbg.duel; o.fighter = d && d.def.n;
    const until = async (f, ms = 30000) => { const t0 = performance.now(); while (!f() && performance.now() - t0 < ms) await sl(100); return f(); };
    await until(() => d.cd <= 0 && !d.endT); C.dbg.damage(d.f, 999, 1, 0); await until(() => C.dbg.duel && C.dbg.duel.round === 2 && C.dbg.duel.cd <= 0 && !C.dbg.duel.endT); C.dbg.damage(C.dbg.duel.f, 999, 1, 0); await until(() => C.dbg.mode === null); o.after = C.dbg.mode; o.duelWins = b.save.fight.d;
    C.dbg.startWave(); await sl(300); o.wave = C.dbg.mode; o.waveEnemies = C.dbg.enemies.length; for (const e2 of [...C.dbg.enemies]) C.dbg.damage(e2, 999, 1, 0); o.wave2 = await until(() => C.dbg.enemies.some(x => !x.dead)); C.exit();
    return o; });
  ok(!r.outside && !r.outsideAtk && r.hudOut, 'Außerhalb von Arena und Wald kann nicht gekämpft werden'); ok(r.inForest && r.hud, 'Verbotener Wald: Kampf-Anzeige und Knöpfe da'); ok(r.dead && r.stars >= 1 && r.kills >= 1, `Waldmonster besiegt (+${r.stars} ⭐)`);
  ok(r.kai === 'arena' && r.panel && r.mode === 'duel', 'Arena: Kampfmeister Kai öffnet das Menü, Duell startet (' + r.fighter + ')'); ok(r.after === null && r.duelWins >= 1, 'Duell: nach 2 gewonnenen Runden Sieg + Belohnung'); ok(r.wave === 'wave' && r.waveEnemies >= 2 && r.wave2, 'Monster-Welle startet und die nächste Welle kommt'); await c.close();
}
await browser.close();
process.exit(fails || errs.length ? 1 : 0);
