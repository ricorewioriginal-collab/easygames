/* Prisma-Archipel: Weltregistrierung, drei Fahrzeuge und drei persistierte Lichtfolgen. Aufruf: node bunte-insel/tests/prisma.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort()); await page.route('**/cloud/**', r => r.abort());
await page.goto(BASE + '/bunte-insel/index.html');
await page.waitForFunction(() => window.__bi && window.__bi.prisma, null, { timeout: 60000 });
const result = await page.evaluate(() => {
  const g = window.__bi, island = BI.PRISMA;
  for (const q of island.zones) for (const i of q.order) g.prisma.act({ zone: q.id, i });
  return {
    zones: island.zones.length,
    registered: BI.STORY_ISLES.some(q => q.key === 'PRISMA'),
    cars: ['kiRoadster', 'runeCoupe', 'dataBuggy'].every(k => !!BI.VEH[k]),
    spawned: ['kiRoadster', 'runeCoupe', 'dataBuggy'].every(k => g.W.vehicleSpawns.some(v => v.type === k)),
    mapHighlights: g.W.spots.prismaZones.length,
    puzzles: island.zones.every(q => g.prisma.state().done[q.id] === true)
  };
});
/* Ausbau: Sternkugeln + Lichtdrache, Ki-Welle, Runen-Duell, Kartenautomat, Partner-Ei mit drei Stufen, Flugwolke */
await page.click('#bStart'); await page.waitForTimeout(800);
const ext = await page.evaluate(async () => {
  const g = window.__bi, I = BI.PRISMA, K = g.prisma, D = K.dbg, P = g.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, go = (a, b) => { const q = I.at(a, b); P.veh = null; P.x = q.x; P.z = q.z; P.y = 0; };
  const has = id => g.save.stk.includes(id);
  /* 7 Sternkugeln einsammeln (hineinlaufen), dann am Altar den Lichtdrachen rufen */
  for (const o of D.orbs) { P.x = o.x; P.z = o.z; P.y = 0; await sl(120); }
  out.orbs = K.state().orbs.every(Boolean); go(I.KI.altar[0] - 3.4, I.KI.altar[1]); await sl(100); const n1 = K.near(); out.summonLabel = !!n1 && n1.k === 'summon';
  const st0 = g.save.stars; K.act(n1); for (let i = 0; i < 80 && !has('prisma_drache'); i++) await sl(150);
  out.drache = has('prisma_drache') && g.save.stars >= st0 + 20 && K.state().orbs.every(q => !q) && K.state().wish === 1;
  /* Ki-Welle: auf dem Ring stehen, dreimal feuern */
  const r = I.at(I.KI.ring[0], I.KI.ring[1]); P.x = r.x; P.z = r.z; P.y = .6; await sl(150); const n2 = K.near(); out.welleLabel = !!n2 && n2.k === 'welle';
  for (let i = 0; i < 3; i++) { P.y = .6; K.act({ k: 'welle' }); for (let j = 0; j < 20 && D.targets.filter(t => t.alive).length > 2 - i; j++) await sl(80); await sl(700); }
  out.welle = has('prisma_welle');
  /* Kartenautomat */
  go(I.RUNE.booster[0] - 2, I.RUNE.booster[1]); await sl(100); out.packLabel = (K.near() || {}).k === 'pack'; for (let i = 0; i < 60 && K.state().cards.length < 12; i++) D.pack(); out.karten = K.state().cards.length === 12 && has('prisma_karten');
  /* Runen-Duell: Podest → Mini-Spiel startet, Sieg gibt Sticker */
  const pd = g.W.spots.prismaPodium; P.x = pd.x; P.z = pd.z; P.y = 0; await sl(100); const n3 = K.near(); out.duelLabel = !!n3 && n3.k === 'duel'; K.act(n3); await sl(400);
  out.duelStart = g.mini.active && g.mini.kind === 'duell_prisma'; const gm = g.mini.cur(); gm.dbg().tapAt(0); await sl(200); gm.dbg().win(); for (let i = 0; i < 40 && g.mini.active; i++) await sl(150);
  out.duel = !g.mini.active && has('prisma_duell');
  /* Partner-Ei → Bitti, 4 Würfel → Byton, 10 Würfel → Gigaflux */
  go(I.DATA.nest[0] - 2.6, I.DATA.nest[1]); await sl(100); const n4 = K.near(); out.eggLabel = !!n4 && n4.k === 'egg'; K.act(n4); await sl(200); out.hatch = K.state().pet.stage === 1 && D.pet.g.visible;
  for (const b of D.bits) { if (K.state().pet.stage >= 3) break; P.x = b.x; P.z = b.z; P.y = 0; await sl(140); }
  for (let i = 0; i < 20 && D.pet.evo > 0; i++) await sl(120);
  out.partner = K.state().pet.stage === 3 && has('prisma_partner') && D.pet.stage === 3;
  /* Figuren sprechen, Flugwolke steht bereit, Logbuch zählt alles */
  go(-9, -48); await sl(100); const n5 = K.near(); out.talk = !!n5 && n5.k === 'talk' && /Wolkenbart/.test(n5.label);
  out.wolke = !!BI.VEH.wolke && g.vehicles.some(v => v.type === 'wolke');
  out.log = K.log().count === '8 von 8';
  return out;
});
for (const [k, v] of Object.entries(ext)) { console.log((v === true ? 'OK   ' : 'FAIL ') + k + ': ' + v); if (v !== true) result['ext_' + k] = v; }
await browser.close();
const failed = Object.entries(result).filter(([k, v]) => v !== true && !(k === 'zones' && v === 3) && !(k === 'mapHighlights' && v === 3));
for (const [k, v] of Object.entries(result)) console.log((failed.some(x => x[0] === k) ? 'FAIL ' : 'OK   ') + k + ': ' + v);
if (errors.length) { console.error('JS errors:', errors.slice(0, 5)); process.exit(1); }
if (failed.length) process.exit(1);
console.log('Prisma-Archipel funktioniert ✅');
