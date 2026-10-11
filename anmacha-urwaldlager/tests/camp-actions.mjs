/* Camp-Aktionen prüfen: Ast, Holzstapel, Eimer/Lagune/Fass, Gespräch, Buschtrommel, Prüfung, Kochen, Lagerfeuer, Nacht, Pause. Aufruf: node tests/camp-actions.mjs [d|m] */
import { chromium } from 'playwright';
const dev = process.argv[2] || 'd', SHOT = process.env.SHOT || '/tmp', BASE = process.env.BASE || 'http://localhost:8080/anmacha-urwaldlager';
const vp = dev === 'm' ? { viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true } : { viewport: { width: 1000, height: 600 } };
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext(vp)).newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack||'').split('\n').slice(1,3).join(' | '))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(`${BASE}/index.html?q=low`); await p.waitForTimeout(2500);
await p.evaluate(() => __ul.newGame({ seed: 99 }));
for (let i = 0; i < 3; i++) { await p.evaluate(() => __ul.clickModal()); await p.waitForTimeout(300); }
const ev = f => p.evaluate(f);
const act = async () => { if (dev === 'm') { await p.evaluate(() => { const I = __ul.I; I.edge.act = true; }); } else await p.keyboard.press('KeyE'); await p.waitForTimeout(700); };
const near = async (x, z, tag) => { await ev(`__ul.tp(${x}, ${z})`); await p.waitForTimeout(500); const lbl = await ev(() => { const n = __ul.W.nearest(); return n ? n.lbl : null; }); console.log(tag, 'prompt:', lbl); return lbl; };
// Ast
const br = await ev(() => { const b = __ul.W.branches.find(b => b.have); return { x: b.x, z: b.z }; });
await near(br.x + .8, br.z, 'branch'); await act(); await p.waitForTimeout(1200); console.log('carry', await ev(() => __ul.W.player.carry));
await p.screenshot({ path: `${SHOT}/${dev}-carry.png` });
const SP = await ev(() => __ul.W.SP);
await near(SP.wood.x + 1.2, SP.wood.z, 'woodpile'); await act(); console.log('wood', await ev(() => __ul.S.G.camp.wood), 'carry', await ev(() => __ul.W.player.carry));
await near(SP.barrel.x + 1.2, SP.barrel.z, 'barrel'); await act(); console.log('carry', await ev(() => __ul.W.player.carry));
await near(SP.well.x - 1, SP.well.z, 'well'); await act(); await p.waitForTimeout(1500); console.log('carry', await ev(() => __ul.W.player.carry));
await near(SP.barrel.x + 1.2, SP.barrel.z, 'barrel2'); await act(); await p.waitForTimeout(900); console.log('water', await ev(() => __ul.S.G.camp.water));
// Gespräch
const n = await ev(() => { const n = __ul.C.npcs.find(n => !n.away); n.act = null; n.think = 99; n.x = 6; n.z = 6; return { x: n.x, z: n.z, id: n.id }; });
await near(n.x + 1, n.z, 'npc'); await act(); await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/${dev}-talk.png` });
if (dev === 'm') { await p.evaluate(() => document.querySelector('#dlg [data-d]').click()); } else await p.keyboard.press('Digit1'); await p.waitForTimeout(500);
console.log('dlg after pick', await ev(() => document.querySelector('#dlg .dtext') && document.querySelector('#dlg .dtext').textContent));
await p.evaluate(() => { const bs = [...document.querySelectorAll('#dlg [data-d]')]; bs[bs.length - 1].click(); }); await p.waitForTimeout(300); console.log('state', await ev(() => __ul.W.player.state));
// Buschtrommel-Übersicht
await p.evaluate(() => __ul.UI.drumPanel('camp')); await p.waitForTimeout(500); await p.screenshot({ path: `${SHOT}/${dev}-drum-camp.png` });
await p.evaluate(() => document.querySelector('#modal [data-tab="publikum"]').click()); await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/${dev}-drum-pub.png` });
await p.evaluate(() => document.querySelector('#modal [data-tab="heute"]').click()); await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/${dev}-drum-heute.png` });
await p.evaluate(() => __ul.clickModal(4));
// Prüfung absolvieren und auf 17 Uhr springen, kochen
await ev(() => { __ul.S.G.clock = 9.5 * 60; __ul.S.enterTrial(); }); await p.waitForTimeout(1200); await ev(() => __ul.T.forceEnd(4)); await p.waitForTimeout(2500); await ev(() => __ul.clickModal());
await ev(() => { __ul.S.G.clock = 17 * 60; __ul.S.G.camp.water = 6; __ul.S.G.camp.fuel = .8; __ul.C.npcs.forEach(n => { n.act = { type: 'idle', phase: 'do', t: 0, dur: 999, pose: 'idle' }; }); __ul.C.claims.cook = 0; });
await near(1.6, 1.6, 'fire'); await act(); await p.waitForTimeout(3000); await p.screenshot({ path: `${SHOT}/${dev}-cook.png` });
for (let i = 0; i < 20; i++) { if (dev === 'm') await p.mouse.move(500 + Math.cos(i) * 60, 200 + Math.sin(i) * 60); else await p.keyboard.press(i % 2 ? 'KeyA' : 'KeyD'); await p.waitForTimeout(400); }
await p.waitForTimeout(9000); console.log('meal', JSON.stringify(await ev(() => __ul.S.G.camp.meal)), 'state', await ev(() => __ul.W.player.state));
// Lagerfeuer
await ev(() => { __ul.S.G.clock = 19.6 * 60; __ul.C.npcs.slice(0,3).forEach((n,i) => { const s = __ul.W.seats[i]; s.used = n.id; n.x = s.x; n.z = s.z; n.act = { type: 'sit', phase: 'do', t: 0, dur: 99, seat: s, fire: true, pose: 'sit' }; }); }); await p.waitForTimeout(1000);
const seat = await ev(() => { const s = __ul.W.seats.find(s => !s.used); return { x: s.x, z: s.z }; });
await near(seat.x, seat.z, 'seat'); await act(); await p.waitForTimeout(800); await p.screenshot({ path: `${SHOT}/${dev}-campfire.png` });
console.log('modal', await ev(() => document.querySelector('#modal h2') && document.querySelector('#modal h2').textContent));
await ev(() => __ul.clickModal(0)); await p.waitForTimeout(300); await ev(() => __ul.clickModal(0));
// Nacht
await ev(() => { __ul.S.G.clock = 22.6 * 60; }); await p.waitForTimeout(3000); await p.screenshot({ path: `${SHOT}/${dev}-night.png` });
// Pause
if (dev !== 'm') { await p.keyboard.press('Escape'); await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/${dev}-pause.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
console.log('final', JSON.stringify(await ev(() => __ul.state())));
console.log(errs.length ? 'ERRORS\n' + [...new Set(errs)].join('\n') : 'NO ERRORS'); await b.close();
