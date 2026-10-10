/* Tests für Muscheln, Laden und Belohnungen (node tests/bonus-tests.js) */
import { Save } from '../js/storage.js';
import { Shop, levelReward, bonusReward, BONUS_CAP, SKIP_PRICE, HATS, SKIN_COLORS, TRAILS, CRATES, CATALOG } from '../js/bonus/shop.js';
import { ACHIEVEMENTS, checkAchievements } from '../js/bonus/achievements.js';
import { dayStr, dailyIndex, dailyStatus, completeDaily, dailyReward } from '../js/bonus/daily.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
ok(Save.coins === 0 && Save.look.color === '#ff6fb0' && Save.look.hat === '', 'Start: 0 Muscheln, Standard-Look');
ok(levelReward(null, 3) === 14 && levelReward(null, 1) === 8, 'Erstes Lösen: 5 + 3 pro Stern');
ok(levelReward({ stars: 1, plays: 1 }, 3) === 6 && levelReward({ stars: 3, plays: 2 }, 3) === 0, 'Wiederholen zahlt nur neue Sterne');
ok(levelReward({ skipped: true, stars: 0, plays: 0 }, 2) === 9, 'Übersprungenes Level später lösen: 3 + Sterne');
ok(bonusReward(0, 2) === 0 && bonusReward(9, 2) === 4 && bonusReward(999, 2) === BONUS_CAP && bonusReward(-5, 2) === 0, 'Bonus-Belohnung gedeckelt, nie negativ');
ok(Shop.buy('hat', 'crown').reason === 'zu wenig Muscheln' && !Shop.owned('hat', 'crown'), 'Ohne Muscheln nichts kaufbar');
Save.addCoins(100); ok(Save.coins === 100, '100 Muscheln gutgeschrieben');
ok(Shop.buy('hat', 'crown').ok && Save.coins === 40 && Shop.owned('hat', 'crown'), 'Krone gekauft (−60)');
ok(Shop.buy('hat', 'crown').reason === 'schon gekauft' && Save.coins === 40, 'Doppelkauf wird abgelehnt, nichts abgebucht');
ok(Shop.equip('hat', 'crown') && Save.look.hat === 'crown' && Shop.equipped('hat', 'crown'), 'Hut anlegen');
ok(!Shop.equip('hat', 'top') && Save.look.hat === 'crown', 'Nicht gekaufter Hut lässt sich nicht anlegen');
ok(Shop.equip('hat', '') && Save.look.hat === '', 'Hut ablegen ist gratis');
ok(Shop.buy('color', 'c-sky').ok && Shop.equip('color', 'c-sky') && Save.look.color === '#5ab8ff', 'Farbe kaufen + anlegen');
ok(Shop.equip('color', 'c-pink') && Save.look.color === '#ff6fb0', 'Standardfarbe immer verfügbar');
ok(!Shop.buy('hat', 'gibtsnicht').ok, 'Unbekannter Artikel');
ok(SKIN_COLORS.every(c => /^#[0-9a-f]{6}$/i.test(c.value) || c.value === 'rainbow') && Object.values(CATALOG).every(c => new Set(c.list.map(h => h.id)).size === c.list.length && c.list[0].price === 0), 'Katalog konsistent');
const before = Save.coins; ok(Shop.skip(7).ok && Save.coins === before - SKIP_PRICE && Save.level(7).skipped && Save.level(7).stars === 0, 'Level überspringen kostet Muscheln und schaltet frei');
ok(Shop.skip(7).reason === 'schon gelöst', 'Gelöstes/übersprungenes Level nicht erneut überspringbar');
Save.addCoins(-1e6); ok(Save.coins === 0 && Shop.skip(9).reason === 'zu wenig Muscheln' && !Save.level(9), 'Zu wenig Muscheln: kein Überspringen, keine negativen Muscheln');
ok(Save.bonusPlayed('perlen', 12).best === 12 && Save.bonusPlayed('perlen', 5).best === 12 && Save.bonus('perlen').plays === 2, 'Rekord bleibt, Spielzähler steigt');
ok(Save.bonus('unbekannt').best === 0, 'Unbekanntes Bonusspiel → Nullwerte');

// --- Laden: Spur + Kisten-Look
Save.addCoins(200);
ok(Shop.buy('trail', 'stars').ok && Shop.equip('trail', 'stars') && Save.look.trail === 'stars' && Shop.equipped('trail', 'stars'), 'Spur kaufen + anlegen');
ok(Shop.buy('crate', 'gold').ok && Shop.equip('crate', 'gold') && Save.look.crate === 'gold', 'Kisten-Look kaufen + anlegen');
ok(Shop.equip('trail', '') && Save.look.trail === '', 'Spur ablegen');
ok(Shop.buy('color', 'c-rainbow').ok && Shop.equip('color', 'c-rainbow') && Save.look.color === 'rainbow' && Shop.equipped('color', 'c-rainbow'), 'Regenbogen-Farbe');
ok(Save.stat('buys') >= 3, 'Käufe werden gezählt');
// --- Tageslevel
ok(dailyIndex('2026-10-10', 55) >= 0 && dailyIndex('2026-10-10', 55) < 55 && dailyIndex('2026-10-10', 55) === dailyIndex('2026-10-10', 55), 'Tageslevel ist stabil und im Bereich');
{ let diff = 0; for (let d = 1; d < 29; d++) { const a = dailyIndex('2026-10-' + String(d).padStart(2, '0'), 55), b = dailyIndex('2026-10-' + String(d + 1).padStart(2, '0'), 55); if (a !== b) diff++; } ok(diff === 28, 'Aufeinanderfolgende Tage haben nie dasselbe Level'); }
ok(dailyIndex('2026-10-10', 1) === 0, 'Tageslevel mit nur einem Level');
{ const day = dayStr(); const c0 = Save.coins, r1 = completeDaily(day); ok(r1 && r1.streak === 1 && Save.coins === c0 + dailyReward(1), 'Tageslevel: erste Belohnung + Serie 1'); ok(completeDaily(day) === null, 'Tageslevel nur einmal pro Tag'); ok(dailyStatus(day).done && dailyStatus(day).streak === 1, 'Status: erledigt, Serie 1');
  const d = new Date(); d.setDate(d.getDate() + 1); const next = dayStr(d); ok(!dailyStatus(next).done && dailyStatus(next).streak === 1, 'Am Folgetag: Serie läuft noch'); const r2 = completeDaily(next); ok(r2 && r2.streak === 2, 'Folgetag erhöht die Serie');
  const d3 = new Date(); d3.setDate(d3.getDate() + 5); ok(dailyStatus(dayStr(d3)).streak === 0, 'Nach Pause ist die Serie 0'); const r3 = completeDaily(dayStr(d3)); ok(r3 && r3.streak === 1, 'Nach Pause beginnt die Serie neu'); }
// --- Erfolge
{ const LV = Array.from({ length: 3 }, (_, i) => ({ index: i, world: 0 })); Save.reset(); ok(checkAchievements(LV).length === 0, 'Neue Spielstände haben keine Erfolge');
  Save.complete(0, 5, 2, 3, 12); const g = checkAchievements(LV); ok(g.some(a => a.id === 'first') && Save.coins === 5, 'Erster Erfolg + Muscheln'); ok(checkAchievements(LV).length === 0, 'Erfolge werden nur einmal vergeben');
  Save.complete(1, 5, 2, 1, 5); Save.complete(2, 5, 2, 1, 5); ok(checkAchievements(LV).some(a => a.id === 'all') && checkAchievements(LV).length === 0, 'Alle Level gelöst → „Meister" (+ Welt 1)'); ok(Save.achieved('w0'), 'Welt-Erfolg');
  Save.addStat('editorSaves', 1); Save.addStat('community', 1); Save.maxStat('bestStreak', 7); const g2 = checkAchievements(LV).map(a => a.id); ok(['builder', 'community', 'streak3', 'streak7'].every(i => g2.includes(i)), 'Editor-/Community-/Serien-Erfolge');
  ok(new Set(ACHIEVEMENTS.map(a => a.id)).size === ACHIEVEMENTS.length, 'Erfolgs-IDs eindeutig'); }
// --- Bestzeit
{ Save.reset(); Save.complete(5, 10, 3, 3, 30); const r = Save.complete(5, 12, 3, 2, 20); ok(r.newTime && Save.level(5).time === 20 && Save.level(5).moves === 10, 'Bestzeit und Bestzüge werden getrennt gespeichert'); ok(!Save.complete(5, 10, 3, 3, 25).newTime && Save.level(5).time === 20, 'Langsamere Zeit überschreibt nichts'); }
console.log(fails ? `\n${fails} Fehler` : '\nAlle Bonus-Tests bestanden'); process.exit(fails ? 1 : 0);
