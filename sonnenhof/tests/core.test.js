// Sonnenhof – Kern-Test (Node): Felder, Wachstum mit Wasser, Abwesenheit, Tiere, Werkstätten, Markt, Aufträge, Level, Tage, Speichern
const C = require('../js/core.js'); let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) fail++; };
let now = 1.7e12; const g = C.newGame({ now, seed: 9 }); const M = C.MIN;
ok(g.orders.length === 3 && g.orders.every(o => Object.keys(o.items).every(k => C.GOODS[k] && (!C.GOODS[k].crop || C.CROPS[k].lv <= 1))), '3 Startaufträge, nur mit Level-1-Waren');
ok(C.plant(g, 2, 2, 'zwiebel').err && C.till(g, 9, 9).err && C.till(g, 0, 0).err, 'Säen ohne Hacken und Hacken außerhalb geht nicht');
ok(C.till(g, 2, 2).ok && C.plant(g, 2, 2, 'zwiebel').ok && g.seeds.zwiebel === 5, 'Hacken + Säen nimmt Saat aus dem Rucksack');
ok(C.plant(g, 3, 2, 'tomate').err && C.till(g, 3, 2).ok && C.plant(g, 3, 2, 'tomate').err, 'Tomate vor Level 3 gesperrt');
// ohne Wasser kein Wachstum
const t = C.tile(g, 2, 2); t.wet = false; now += 5 * M; C.tick(g, now, true); ok(t.p === 0, 'ohne Wasser wächst nichts');
// mit Wasser genau bis zum Ende der Stufe, dann Pause
C.water(g, 2, 2); now += 10 * M; C.tick(g, now, false); ok(C.stageOf(t) === 1 && !t.wet, 'eine Stufe wächst, dann wieder durstig (auch während Abwesenheit)');
C.water(g, 2, 2); now += 10 * M; C.tick(g, now, false); C.water(g, 2, 2); now += 10 * M; C.tick(g, now, false); ok(C.stageOf(t) === 3, 'nach dreimal Gießen reif');
const xp0 = g.xp + g.lv * 1000; const h = C.harvest(g, 2, 2, now); ok(h.ok && g.inv.zwiebel === 1 && g.xp + g.lv * 1000 > xp0 && C.tile(g, 2, 2).soil && !C.tile(g, 2, 2).crop, 'Ernte ins Lager, XP, Beet bleibt umgegraben');
// Dünger: doppelte Ernte, schneller
C.plant(g, 2, 2, 'zwiebel'); C.water(g, 2, 2); ok(C.fertilize(g, 2, 2).ok && g.fert === 2, 'Dünger');
for (let i = 0; i < 4; i++) { C.water(g, 2, 2); now += 40000; C.tick(g, now, false); } ok(C.stageOf(C.tile(g, 2, 2)) === 3, 'gedüngt in < 2,7 min reif (1,5 min Grundzeit)'); ok(C.harvest(g, 2, 2, now).n === 2, 'doppelte Ernte');
// Mehrfach-Ernte
g.lv = 3; C.till(g, 4, 2); C.plant(g, 4, 2, 'erdbeere'); const e = C.tile(g, 4, 2); e.p = C.growMs(C.CROPS.erdbeere); C.harvest(g, 4, 2, now); ok(C.tile(g, 4, 2).crop === 'erdbeere' && C.stageOf(C.tile(g, 4, 2)) === 2, 'Erdbeere trägt erneut');
// Tage, Wetter, Jahreszeit (nur beim Spielen)
const d0 = g.day; now += 60000; C.tick(g, now, true); ok(g.day === d0, 'lange Abwesenheit zählt nicht als Spieltag');
let days = 0; for (let i = 0; i < 4 * 60 * 10 + 10; i++) { now += 100; const ev = C.tick(g, now, true); days += ev.filter(x => x.k === 'day').length; } ok(days === 1 && g.day === d0 + 1, 'ein Hoftag = 4 Minuten Spielzeit');
const seasons = new Set(); const wx = {}; const g2 = C.newGame({ now, seed: 4 }); for (let i = 0; i < 28; i++) { const s = C.endDay(g2, now); seasons.add(s.nextSeason); wx[g2.weather] = (wx[g2.weather] || 0) + 1; } ok(seasons.size === 4 && C.season(g2) === 0 && g2.day === 29, '4 Jahreszeiten à 7 Tage, dann wieder Frühling');
ok(Object.keys(wx).every(k => C.WEATHER[k]) && Object.keys(wx).length >= 3, 'Wetter wechselt: ' + JSON.stringify(wx));
const g3 = C.newGame({ now, seed: 1 }); C.till(g3, 2, 2); g3.weather = 'regen'; g3.next = 'regen'; C.endDay(g3, now); ok(C.tile(g3, 2, 2).wet, 'Regen gießt alle Beete');
// Tiere
g.lv = 4; g.coins = 1000; ok(C.buyAnimal(g, 'huhn').ok && C.buyAnimal(g, 'huhn').cost === 75, 'Hühner kaufen, jedes weitere teurer'); ok(C.buyAnimal(g, 'schaf').err, 'Schaf gesperrt');
g.inv.weizen = 1; let r = C.tendAnimals(g, 'huhn'); ok(r.fed === 1 && r.hungry === 1 && g.inv.weizen === 0, 'Füttern verbraucht Weizen, ohne Futter bleibt ein Huhn hungrig');
now += 4 * M + 1000; C.tick(g, now, false); r = C.tendAnimals(g, 'huhn'); ok(r.got === 1 && g.inv.ei === 1, 'gefüttertes Huhn legt nach 4 min ein Ei');
ok(C.buyAnimal(g, 'biene').ok && (now += 8 * M + 1000, C.tick(g, now, false), C.tendAnimals(g, 'biene').got === 1), 'Bienen brauchen kein Futter');
// Werkstatt
ok(C.buyShop(g, 'muehle').ok && C.craft(g, 'muehle', 0, now).err, 'Mühle gebaut, ohne Weizen kein Mehl');
g.inv.weizen = 6; ok(C.craft(g, 'muehle', 0, now).ok && C.craft(g, 'muehle', 0, now).ok && C.craft(g, 'muehle', 0, now).err && g.inv.weizen === 0, 'zwei Plätze, Zutaten verbraucht');
now += 2 * M + 10; C.tick(g, now, false); ok(C.collectShop(g, 'muehle').got === 2 && g.inv.mehl === 2, 'Mehl fertig und abgeholt');
// Markt und Aufträge
const c0 = g.coins; ok(C.sell(g, 'mehl', 1).coins === 28 && g.coins === c0 + 28, 'Verkaufen');
ok(C.priceOf(g, 'weizen') !== C.GOODS.weizen.sell || C.CROPS.weizen.s.includes(C.season(g)), 'Preis außerhalb der Saison höher');
const o = g.orders[0]; Object.keys(o.items).forEach(k => { g.inv[k] = (g.inv[k] || 0) + o.items[k]; }); const c1 = g.coins, n0 = g.orders.length; r = C.deliver(g, o.id, now); ok(r.ok && g.coins === c1 + o.coins && g.orders.length === n0 - 1 && g.stats.orders === 1, 'Auftrag liefern');
now += 46000; C.tick(g, now, false); ok(g.orders.length === n0, 'neuer Auftrag kommt nach');
ok(C.expand(g).ok && C.canUse(g, 9, 2) && !C.canUse(g, 2, 7), 'Acker erweitern');
// Level
const g4 = C.newGame({ now }); C.addXp(g4, 600); ok(g4.lv >= 5 && g4.lvUp >= 4 && C.unlocks(4).some(x => /Kuh/.test(x)), 'Level-Aufstieg mit Freischaltungen');
// Erfolge
ok(g.ach.includes('tier1') && g.ach.includes('werk1'), 'Erfolge: ' + g.ach.join(', '));
// Speichern / Reparieren
const back = C.repair(JSON.parse(JSON.stringify(g)), now); ok(back && JSON.stringify(back.tiles) === JSON.stringify(Object.fromEntries(Object.entries(g.tiles).map(([k, v]) => [k, v]))) || (back && Object.keys(back.tiles).length === Object.keys(g.tiles).length), 'Speicherstand lädt');
ok(back.coins === g.coins && back.lv === g.lv && back.animals.huhn.list.length === 2 && back.shops.muehle && C.worth(back) === C.worth(g), 'Werte, Tiere, Werkstatt, Hofwert gleich');
ok(C.repair({ v: 1, coins: -5, lv: 'x', tiles: { '0,0': { crop: 'zwiebel' }, '2,2': { crop: 'gift' } }, inv: { gold: 9 } }, now).coins === 0, 'kaputter Speicherstand wird repariert');
ok(C.repair(null, now) === null && C.repair({ v: 2 }, now) === null, 'fremde Daten werden ignoriert');
console.log(fail ? fail + ' Fehler' : 'Alle Kern-Tests bestanden'); process.exit(fail ? 1 : 0);
