/* Taschi-Land: Insel, Brücke, Freunde, Starter, Fangen, Kämpfe (Typen, Level, Entwicklung), Arena-Orden, Team Funke, Ballon-Fahrzeug, Geschichte, Cheat, Handbuch.
   Aufruf: THREE=... node bunte-insel/tests/taschi.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 480 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, t = b.taschi, T = BI.TASCHI, P = b.P, W = b.W, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), D = t.dbg; t.fast = true; b.save.stars = 500;
  /* 1. Insel, Brücke, Türen, Freunde, Leute */
  out.isle = W.isles.includes(T) && !!W.spots.taschi; let hit = 0; for (let d = 175; d < 355; d += 3) { const q = W.resolve(T.bridge.mx - T.ux * 0 + (d - 265) * T.ux, T.bridge.mz + (d - 265) * T.uz, .4, {}); if (q.hit) hit++; } out.bridge = hit === 0;
  out.doors = BI.DOORS.filter(d => d.isle === 'taschi').length === 3; out.friends = D.friends.length === 9; out.npcs = ['prof', 'nurse', 'shop', 'kai', 'fiete', 'perla', 'volt', 'bluete', 'aurelia', 'jette', 'jim', 'mauzi', 'statue'].every(id => D.npcs.some(n => n.id === id));
  out.species = Object.keys(BI.TSPECIES).length; out.meshes = Object.keys(BI.TSPECIES).every(id => { const g = BI.taschiMesh(id); return g && g.children.length === 1; }); out.pics = Object.keys(BI.TSPECIES).every(id => (BI.taschiPic(id) || '').startsWith('data:image'));
  out.heroes = ['kai_t', 'ulme', 'hanna', 'fiete', 'perla', 'volt', 'aurelia', 'jette', 'jim'].every(id => { const h = BI.HEROES.find(q => q.id === id); try { return !!h && !!BI.makeChar(h.o); } catch (e) { return false; } });
  /* 2. Typen */
  out.types = t.eff('feuer', 'pflanze') === 2 && t.eff('wasser', 'feuer') === 2 && t.eff('normal', 'geist') === 0 && t.eff('elektro', 'wasser') === 2 && t.eff('feuer', 'wasser') === .5 && t.eff('normal', 'normal') === 1;
  const A1 = t.mk('glutzahn', 20), A2 = t.mk('samenling', 20); let dm1 = 0, dm2 = 0; for (let i = 0; i < 40; i++) { dm1 += t.damage(A1, A2, BI.TMOVES.feuerwirbel).d; dm2 += t.damage(A2, A1, BI.TMOVES.blaetter).d; } out.dmg = dm1 > dm2 * 2.2 && t.damage(A1, t.mk('geisterchen', 20), BI.TMOVES.tackler).d === 0;
  /* 3. Starter über das Fenster */
  P.veh = null; const c = T.at(-31, 17); P.x = c.x; P.z = c.z; P.y = 0; await sl(300); const nr = t.near(); out.nearProf = !!nr && nr.id === 'prof';
  D.profPanel(); const pan = document.getElementById('tpan'); out.panel = !pan.hidden && t.busy(); [...pan.querySelectorAll('button.tb')].find(x => /Los/.test(x.textContent)).click(); await sl(100);
  const sb = [...pan.querySelectorAll('button.tb')].filter(x => /Dieses/.test(x.textContent)); out.starters = sb.length === 3; sb[0].click(); await sl(100); out.starter = D.S().team.length === 1 && D.S().team[0].id === 'glutzahn' && pan.hidden && !t.busy();
  /* 4. Kampf (schnell): Wildes Taschi, Level-Aufstieg, Ende */
  const me = D.S().team[0]; me.lv = 10; me.hp = t.hpMax(me.id, 10); me.mv = t.movesAt(me.id, 10); me.xp = 0;
  t.wild('quappi', 4); out.ui = !document.getElementById('tbat').hidden && document.querySelectorAll('#tbat .acts button').length === 4; let n = 0; while (t.battle() && n++ < 40) { const B = t.battle(); if (B.busy) { await sl(5); continue; } t.play({ k: 'move', i: 0 }); } out.fightEnd = !t.battle() && t.S().n.wins === 1; out.xp = me.xp > 0 || me.lv > 10;
  /* 5. Fangen: erzwungen */
  t.forceCatch = true; t.wild('flatterling', 5); t.play({ k: 'ball', id: 'ball' }); t.forceCatch = false; out.caught = !t.battle() && D.S().team.length === 2 && D.S().dex.flatterling === 2 && !!D.S().orden.fang && !!b.save.flags.ta_fang && b.save.stk.includes('taschi_fang');
  /* 6. Entwicklung per Level + per Stein */
  const g = D.S().team[0]; g.lv = 15; g.xp = 9999; g.hp = t.hpMax(g.id, 15); t.wild('zwackel', 3); n = 0; while (t.battle() && n++ < 40) { const B = t.battle(); if (B.busy) { await sl(5); continue; } t.play({ k: 'move', i: 0 }); } out.evoLv = g.id === 'glutdrach' && g.lv >= 16;
  const fe = t.mk('fellino', 10); D.S().team.push(fe); D.S().items.stein_w = 1; D.teamPanel(); const sbtn = [...document.querySelectorAll('#tpan button.tb')].find(x => x.textContent.includes('💎')); sbtn && sbtn.click(); out.evoStone = fe.id === 'wellino'; t.closePanel();
  /* 7. Arena: Fiete (stark gemacht), Orden, Meisterin gesperrt */
  const hero = D.S().team[0]; hero.lv = 40; hero.hp = t.hpMax(hero.id, 40); hero.mv = ['flammenstoss', 'sturz', 'feuerwirbel', 'glut']; const st0 = b.save.stars;
  const lead = D.npcs.find(x => x.id === 'fiete'), ca = T.arenaPos(0, 8); P.x = ca.x; P.z = ca.z; t.interact({ k: 'npc', id: 'aurelia' }); out.aureliaLocked = !t.battle();
  t.interact({ k: 'npc', id: 'fiete' }); out.trainer = !!t.battle() && t.battle().kind === 'trainer' && t.battle().foes.length === 2; n = 0; while (t.battle() && n++ < 60) { const B = t.battle(); if (B.busy) { await sl(5); continue; } t.play({ k: 'move', i: 0 }); } out.fels = !!D.S().orden.fels && b.save.stars > st0;
  /* Fangball bei Trainer nicht erlaubt */
  t.interact({ k: 'npc', id: 'perla' }); const si = D.S().items.ball; t.play({ k: 'ball', id: 'ball' }); out.noBall = D.S().items.ball === si; n = 0; while (t.battle() && n++ < 60) { const B = t.battle(); if (B.busy) { await sl(5); continue; } t.play({ k: 'move', i: 0 }); }
  /* 8. Team Funke: drei Kämpfe in Folge → Ballon-Orden */
  for (let k = 0; k < 3; k++) { hero.hp = t.hpMax(hero.id, 40); t.interact({ k: 'npc', id: 'jette' }); n = 0; while (t.battle() && n++ < 60) { const B = t.battle(); if (B.busy) { await sl(5); continue; } t.play({ k: 'move', i: 0 }); } }
  out.funke = !!D.S().done.jette && !!D.S().done.jim && !!D.S().orden.team;
  /* 9. Niederlage: Team müde → Heilhaus */
  const keep = D.S().team.slice(); D.S().team.length = 0; const weak = t.mk('zwackel', 2); weak.hp = 1; D.S().team.push(weak); P.x = c.x; P.z = c.z; t.startBattle({ foes: [t.mk('brockos', 40)] }); n = 0; while (t.battle() && n++ < 20) { const B = t.battle(); if (B.busy) { await sl(5); continue; } const me2 = D.S().team[B.mi]; if (!me2 || me2.hp <= 0) break; t.play({ k: 'move', i: 0 }); } out.lose = !t.battle() && t.last === 'lose' && weak.hp === t.hpMax(weak.id, 2); D.S().team.length = 0; for (const m of keep) D.S().team.push(m);
  /* 10. Gras-Begegnung beim Laufen */
  const zn = T.zones[0], zc = T.at(zn.a, zn.b); P.x = zc.x - 6; P.z = zc.z; hero.hp = t.hpMax(hero.id, 40); let steps = 0; while (!t.battle() && steps++ < 400) { P.x += .5; if (P.x > zc.x + 6) P.x = zc.x - 6; await sl(20); } out.grass = !!t.battle() && t.battle().kind === 'wild'; if (t.battle()) { t.forceRun = true; t.play({ k: 'run' }); t.forceRun = false; await sl(50); } out.run = !t.battle();
  /* 11. Heißluftballon fahren */
  const bv = b.vehicles.find(v => v.type === 'funkenballon'); out.balloon = !!bv && Math.hypot(bv.x - W.spots.funkenballon.x, bv.z - W.spots.funkenballon.z) < 6; if (bv) { P.x = bv.x + 3; P.z = bv.z; b.enter(bv); b.inp.y = 1; await sl(700); b.inp.y = 0; out.fly = [bv.x, bv.z, bv.y].every(Number.isFinite); b.leave && b.leave(); P.veh = null; }
  /* 12. Alle Orden → Meister + Geschichte */
  P.x = T.entry.x; P.z = T.entry.z; D.S().orden = {}; t.cheatAll(); out.all = t.nOrden === undefined ? D.nOrden() === 8 : true; await sl(100);
  const I = b.istory, d = I.dbg.ST.find(x => x.key === 'TASCHI'); out.story = !!d && d.acts.length === 4; let w = 0; while (w++ < 80 && (b.save.inselstory || {}).TASCHI !== 4) { P.x = T.entry.x; P.z = T.entry.z; await sl(300); } out.sd = [(b.save.inselstory || {}).TASCHI, b.save.stk.includes('geschichte_taschi'), b.save.stk.includes('taschi_meister')]; out.storyDone = (b.save.inselstory || {}).TASCHI === 4 && b.save.stk.includes('geschichte_taschi') && b.save.stk.includes('taschi_meister');
  /* 13. Cheat + Log + Handbuch */
  b.save.taschi = null; const cr = b.cheats.redeem('TASCHIMEISTER'); out.cheat = cr.ok && D.nOrden() === 8; out.log = t.log().rows.length === 9;
  const md = b.buch.toMarkdown('handbuch'), ml = b.buch.toMarkdown('loesung'); out.buch = /Taschi-Land/.test(md) && /Taschi-Land/.test(ml);
  return out;
});
console.log(JSON.stringify(r));
ok(r.isle && r.bridge, 'Insel im Osten eingetragen, Brücke ohne Hindernis begehbar'); ok(r.doors, 'Labor, Heilhaus und Fangladen haben Türen'); ok(r.friends && r.npcs, '9 Freunde (Blitzi, Fellino …) und alle Leute (Professor, Leiter, Team Funke, Statue) da');
ok(r.meshes && r.pics && r.species >= 28, 'Alle ' + r.species + ' Taschis haben 3D-Modell und Vorschaubild'); ok(r.heroes, 'Neue Spielfiguren (Kai, Ulme, Aurelia, Team Funke …) bauen');
ok(r.types && r.dmg, 'Typen-Tabelle und Schaden (Feuer > Pflanze, Normal wirkt nicht auf Geist)'); ok(r.nearProf && r.panel && r.starters && r.starter, 'Professor Ulme: Fenster, 3 Starter, Auswahl');
ok(r.ui && r.fightEnd && r.xp, 'Wildes Taschi: Kampf-Oberfläche (4 Knöpfe), Kampf endet, Erfahrung'); ok(r.caught, 'Fangen: Taschiball, Team, Taschidex, Fang-Orden, Sticker');
ok(r.evoLv && r.evoStone, 'Entwicklung per Level (Glutzahn → Glutdrach) und per Stein (Fellino → Wellino)'); ok(r.aureliaLocked && r.trainer && r.fels, 'Arena: Aurelia gesperrt, Fels-Fiete 2 Taschis, Orden + Sterne');
ok(r.noBall, 'Gegen Trainer keine Fangbälle'); ok(r.funke, 'Team Funke: 3 Kämpfe in Folge → Ballon-Orden'); ok(r.lose, 'Niederlage: Team wird im Heilhaus geheilt'); ok(r.grass && r.run, 'Im hohen Gras erscheint ein wildes Taschi; Flucht klappt');
ok(r.balloon && r.fly, 'Funken-Ballon steht im Lager und fliegt'); ok(r.story && r.storyDone, 'Inselgeschichte (4 Akte) fertig mit allen 8 Orden, Sticker Taschi-Held + Taschi-Meister'); ok(r.cheat && r.log, 'Geheimcode TASCHIMEISTER; Aufgabenliste 9 Zeilen'); ok(r.buch, 'Handbuch & Lösungsbuch kennen Taschi-Land');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
