// Sonnenhof – Browser-Test (Playwright): Menü → neuer Hof → Feld antippen (hacken, säen, gießen), ernten, Tastatur,
// Wischen mit der Hacke, Markt, Auftrag liefern, Tier kaufen und füttern, Werkstatt, Tagesbilanz, Speichern/Neuladen, Handy-Touch.
// Start: Server im Repo-Ordner, dann node sonnenhof/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = (process.argv[3] || 'http://localhost:8766/') + 'sonnenhof/';
const b = await chromium.launch(), errs = [];
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
async function page(opt) { const ctx = await b.newContext(Object.assign({ serviceWorkers: 'block' }, opt)); await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); }); return p; }
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/sh-' + n + '.jpg', quality: 80 }); };
const G = (p, f) => p.evaluate(f);
const tileXY = (p, x, y) => p.evaluate(([x, y]) => { const s = SHRender.toScreen(x + .5, y + .5), r = document.getElementById('cv').getBoundingClientRect(); return { x: s.x + r.left, y: s.y + r.top }; }, [x, y]);
async function tap(p, x, y) { const q = await tileXY(p, x, y); await p.mouse.click(q.x, q.y); await p.waitForTimeout(60); }
const tile = (p, x, y) => p.evaluate(([x, y]) => SHCore.tile(SHApp.game, x, y), [x, y]);

const p = await page({ viewport: { width: 1280, height: 800 } });
await p.goto(BASE); await p.waitForSelector('#sTitle.on', { timeout: 6000 }); ok(true, 'Ladebildschirm → Titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.isVisible('.mi[data-go="new"]'), 'Konsolen-Menü mit „Hof gründen“');
await p.click('.mi[data-go="new"]'); await p.fill('#nfName', 'Testhof'); await p.fill('#nfFarmer', 'Rico'); await p.click('[data-act="go"]');
await p.waitForSelector('#sGame.on'); ok(await p.isVisible('#ov:not([hidden])'), 'Willkommens-Fenster'); await p.keyboard.press('Escape');
ok(await p.isVisible('#hint'), 'Tipp-Leiste: ' + await p.textContent('#hint'));
// Hand: hacken → säen → gießen
await tap(p, 2, 2); ok((await tile(p, 2, 2))?.soil === 1, 'Antippen gräbt um');
await tap(p, 2, 2); ok((await tile(p, 2, 2))?.crop === 'zwiebel', 'nochmal antippen sät');
await tap(p, 2, 2); ok((await tile(p, 2, 2))?.wet === true, 'nochmal antippen gießt');
await G(p, () => { const t = SHCore.tile(SHApp.game, 2, 2); t.p = SHCore.growMs(SHCore.CROPS[t.crop]); });
await tap(p, 2, 2); ok(await G(p, () => SHApp.game.inv.zwiebel === 1 && SHApp.game.stats.harvest === 1), 'reife Pflanze ernten');
// Tastatur
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
const cur = await G(p, () => SHRender.getCursor()); ok((await tile(p, cur.x, cur.y))?.soil === 1, 'Pfeiltasten + Enter graben um (' + cur.x + ',' + cur.y + ')');
// Wischen mit der Hacke
await p.keyboard.press('Digit2'); const a = await tileXY(p, 2, 4), z = await tileXY(p, 6, 4); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(z.x, z.y, { steps: 12 }); await p.mouse.up();
ok(await G(p, () => [2, 3, 4, 5, 6].every(x => SHCore.tile(SHApp.game, x, 4))), 'mit der Hacke über 5 Felder gewischt');
await p.keyboard.press('Digit3'); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(z.x, z.y, { steps: 12 }); await p.mouse.up();
ok(await G(p, () => [2, 3, 4, 5, 6].filter(x => SHCore.tile(SHApp.game, x, 4).crop).length === 5), 'Saat über die Reihe gewischt (fehlende Saat automatisch gekauft)');
await p.keyboard.press('Digit1'); await shot(p, 'feld');
// Markt
await p.keyboard.press('KeyM'); ok(await p.isVisible('#ovBox h2:has-text("Markt")'), 'Markt mit M'); const c0 = await G(p, () => SHApp.game.coins);
await p.click('[data-act="sa"][data-k="zwiebel"]'); ok(await G(p, () => SHApp.game.coins) > c0, 'Zwiebel verkauft'); await p.click('[data-act="tab"][data-k="seed"]'); await p.click('[data-act="b1"][data-k="karotte"]'); ok(await G(p, () => SHApp.game.seeds.karotte === 5), 'Saat gekauft'); await p.keyboard.press('Escape');
// Auftrag liefern
await G(p, () => { const g = SHApp.game, o = g.orders[0]; Object.keys(o.items).forEach(k => { g.inv[k] = (g.inv[k] || 0) + o.items[k]; }); });
await p.keyboard.press('KeyO'); await shot(p, 'auftraege'); const n0 = await G(p, () => SHApp.game.coins); await p.click('[data-act="dl"]:not([disabled])'); ok(await G(p, () => SHApp.game.stats.orders === 1) && await G(p, () => SHApp.game.coins) > n0, 'Auftrag geliefert');
if (await p.isVisible('#ov:not([hidden])')) await p.keyboard.press('Escape'); if (await p.isVisible('#ov:not([hidden])')) await p.keyboard.press('Escape');
// Tier kaufen, füttern
await G(p, () => { const g = SHApp.game; g.lv = 4; g.coins = 2000; g.inv.weizen = 3; }); await p.keyboard.press('KeyB'); await p.click('[data-act="an"][data-k="huhn"]'); ok(await G(p, () => SHApp.game.animals.huhn.list.length === 1), 'Huhn im Bau-Menü gekauft');
await p.click('[data-act="sh"][data-k="muehle"]'); ok(await G(p, () => !!SHApp.game.shops.muehle), 'Mühle gebaut'); await p.keyboard.press('Escape'); if (await p.isVisible('#ov:not([hidden])')) await p.keyboard.press('Escape');
await tap(p, 3, 11); ok(await G(p, () => SHApp.game.animals.huhn.list[0].fed === 1 && SHApp.game.inv.weizen === 2), 'Stall antippen füttert das Huhn');
await tap(p, 11, 6); ok(await p.isVisible('#ovBox h2:has-text("Mühle")'), 'Mühle antippen öffnet die Werkstatt'); await G(p, () => { SHApp.game.inv.weizen = 3; }); await p.keyboard.press('Escape'); await tap(p, 11, 6);
await p.click('[data-act="mk"][data-i="0"]'); ok(await G(p, () => SHApp.game.shops.muehle.jobs.length === 1), 'Mehl in Arbeit'); await shot(p, 'muehle'); await p.keyboard.press('Escape');
// Tagesende
await G(p, () => { SHApp.game.dayT = SHCore.DAY_MS - 300; }); await p.waitForTimeout(700); ok(await p.isVisible('#ovBox h2:has-text("Tag")') || await p.isVisible('#ovBox h2:has-text("Level")'), 'Tagesbilanz nach Tagesende'); await shot(p, 'bilanz');
ok(await G(p, () => SHApp.game.day === 2), 'Tag 2'); await p.keyboard.press('Escape');
// Speichern und Neuladen
await G(p, () => SHApp.save()); const before = await G(p, () => JSON.stringify([SHApp.game.coins, SHApp.game.stats, Object.keys(SHApp.game.tiles).length]));
await p.reload(); await p.waitForSelector('#sTitle.on', { timeout: 6000 }); await p.keyboard.press('Enter'); await p.waitForSelector('.mi[data-go="cont"]'); await p.click('.mi[data-go="cont"]'); await p.waitForSelector('#sGame.on');
ok(await G(p, () => JSON.stringify([SHApp.game.coins, SHApp.game.stats, Object.keys(SHApp.game.tiles).length])) === before, 'Hof nach Neuladen unverändert');
ok(await G(p, () => +localStorage.getItem('sonnenhof-highscore') > 0), 'Hofwert als Highscore gespeichert');
// Handy
const m = await page({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
await m.goto(BASE); await m.waitForSelector('#sTitle.on', { timeout: 6000 }); await m.tap('#bPress'); await m.tap('.mi[data-go="new"]'); await m.tap('[data-act="go"]'); await m.waitForSelector('#sGame.on'); await m.tap('[data-act="esc"]');
const q = await tileXY(m, 3, 3); await m.touchscreen.tap(q.x, q.y); await m.waitForTimeout(80); ok((await tile(m, 3, 3))?.soil === 1, 'Handy: Feld antippen gräbt um');
const fits = await m.evaluate(() => { const r = document.getElementById('tools').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }); ok(fits, 'Handy: Werkzeugleiste passt');
await shot(m, 'handy');
console.log(errs.length ? '\n' + errs.join('\n') : '\nAlle Browser-Tests bestanden'); await b.close(); process.exit(errs.length ? 1 : 0);
