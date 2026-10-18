/* Royal Radio Match 3D – Browser-Ende-zu-Ende-Test (Playwright, Chromium mit Software-WebGL).
 * Aufruf aus dem Repo-Stamm:  node anmacha-radio-match/tests/e2e.cjs [--shots <ordner>]
 * Prüft je Viewport (360×800, 412×915, Desktop 1366×768): Start ohne Fehler, Migration v1 -> v2, Menü, Karte, Vorschau,
 * Level spielen (Wischen) bis Sieg, Ergebnis + Freischaltung, Booster wie bei Royal Match (wählen, Feld antippen), Pause per Zurück-Taste,
 * Funkhaus, Shop, Optionen, Hilfe, Duell gegen KI, Bonuslevel-Liste. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const ROOT = path.resolve(__dirname, '..', '..');
const shotDir = process.argv.indexOf('--shots') > 0 ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((q, r) => {
  let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

let fails = 0, passes = 0;
function ok(c, msg) { if (c) { passes++; console.log('  PASS ' + msg); } else { fails++; console.log('  FAIL ' + msg); } }

async function run(browser, vp, name) {
  console.log('\n[' + name + '] ' + vp.width + '×' + vp.height);
  const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 600 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|net::|Failed to load resource/i.test(m.text())) errs.push(m.text()); });
  const shot = async n => { if (shotDir) await p.screenshot({ path: path.join(shotDir, name + '-' + n + '.png') }); };
  // alten v1-Spielstand vorbelegen (Migration)
  await p.addInitScript(() => { if (!localStorage.getItem('rrm-test-seeded')) { localStorage.setItem('anmacha-radio-match-v1', JSON.stringify({ unlocked: 7, stars: { 1: 3, 2: 2, 3: 1, 4: 3, 5: 2, 6: 1 }, mute: false })); localStorage.setItem('rrm-test-seeded', '1'); } });
  await p.goto('http://localhost:' + server.address().port + '/anmacha-radio-match/');
  await p.waitForSelector('#tStart');
  await shot('1-title');
  await p.click('#tStart');
  await p.waitForSelector('#menu');
  const st = await p.evaluate(() => RRMApp.state());
  ok(st && st.unlocked === 7 && st.stars[1] === 3 && st.from === 1, 'Migration: v1-Fortschritt (Level 7, Sterne) übernommen');
  ok(!!(await p.evaluate(() => localStorage.getItem('anmacha-radio-match-v1'))), 'Migration: alter Schlüssel bleibt als Sicherung');
  ok(!(await p.evaluate(() => localStorage.getItem('royal-radio-match-v2'))), 'Start schreibt nichts, bevor sich etwas ändert (Cloud-Abgleich bleibt unberührt)');
  ok((await p.textContent('#menu .btn.big')).includes('Level 7'), 'Menü zeigt aktuelles Level');
  await shot('2-menu');

  // Karte + Vorschau
  await p.click('[data-a=map]');
  await p.waitForSelector('#map .node.cur');
  ok((await p.$$('#map .node')).length === 200, 'Karte zeigt 200 Level');
  await shot('3-map');
  await p.click('#map .node[data-n="1"]');
  await p.waitForSelector('.modal [data-a=go]');
  await shot('4-preview');
  await p.click('.modal [data-a=go]');
  // Szene/Tutorial überspringen
  for (let k = 0; k < 8; k++) {
    const top = await p.evaluate(() => { const l = RRMApp.layers(); return l[l.length - 1]; });
    if (top === 'game') break;
    await p.click('.modal [data-a=skip]').catch(() => {});
    await p.waitForTimeout(300);
  }
  ok(await p.evaluate(() => !!RRMApp.game()), 'Level 1 gestartet');
  await shot('5-game');

  // Spielen per Wischen bis zum Ende
  for (let mv = 0; mv < 40; mv++) {
    const m = await p.evaluate(() => { const g = RRMApp.game(); if (!g || g.eng.status !== 'play') return null; const x = g.eng.bestMove(); const b = RRMApp.board; return x && [b.screen(x[0], 0.35), b.screen(x[1], 0.35)]; });
    if (!m) break;
    await p.mouse.move(m[0].x, m[0].y); await p.mouse.down();
    await p.mouse.move(m[1].x, m[1].y, { steps: 4 }); await p.mouse.up();
    for (let w = 0; w < 60; w++) { await p.waitForTimeout(120); if (!(await p.evaluate(() => { const g = RRMApp.game(); return g && (g.lock || RRMApp.board.busy()); }))) break; }
    if (mv === 0) await shot('6-move');
  }
  await p.waitForSelector('.result', { timeout: 8000 }).catch(() => {});
  const res = await p.evaluate(() => { const r = document.querySelector('.result'); return r ? (r.classList.contains('win') ? 'win' : 'lose') : 'none'; });
  ok(res === 'win' || res === 'lose', 'Ergebnisfenster erscheint (' + res + ')');
  await p.waitForTimeout(1300);
  await shot('7-result');
  if (res === 'win') {
    const s2 = await p.evaluate(() => JSON.parse(localStorage.getItem('royal-radio-match-v2')));
    ok(s2.coins > 500, 'Münzen für den Sieg gutgeschrieben');
  }
  // Zurück zur Karte
  await p.click('.result [data-a=map]');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !RRMApp.game()), 'Level verlassen');

  // Level 7 (Booster freigeschaltet): Hammer wählen, Feld antippen = sofort einsetzen, Zurück-Taste = Pause
  await p.evaluate(() => RRMApp.startLevel(7));
  for (let k = 0; k < 8; k++) { const top = await p.evaluate(() => { const l = RRMApp.layers(); return l[l.length - 1]; }); if (top === 'game') break; await p.click('.modal [data-a=skip]').catch(() => {}); await p.waitForTimeout(300); }
  const inv0 = await p.evaluate(() => RRMApp.state().inv.hammer);
  await p.click('.boost[data-id=hammer]');
  ok(!!(await p.$('#banner')) && !!(await p.$('.boost[data-id=hammer].on')), 'Zell-Booster: ausgewählt, Hinweis „Feld antippen“');
  await p.click('.boost[data-id=hammer]');
  ok(!(await p.$('#banner')), 'Zell-Booster: erneutes Antippen bricht ab');
  await p.click('.boost[data-id=hammer]');
  const c = await p.evaluate(() => { const g = RRMApp.game(); for (let i = 0; i < g.eng.cells.length; i++) { const x = g.eng.cells[i]; if (x && x.p && !x.b && !x.c && !x.p.item) return RRMApp.board.screen(i, 0.35); } });
  await p.mouse.click(c.x, c.y);
  await p.waitForTimeout(1200);
  ok((await p.evaluate(() => RRMApp.state().inv.hammer)) === inv0 - 1, 'Hammer eingesetzt und abgezogen');
  await p.goBack();
  await p.waitForTimeout(400);
  ok((await p.evaluate(() => RRMApp.layers().slice(-1)[0])) === 'pause', 'Zurück-Taste öffnet die Pause');
  await shot('8-pause');
  await p.click('.modal [data-a=go]');
  await p.waitForTimeout(400);
  ok((await p.evaluate(() => RRMApp.layers().slice(-1)[0])) === 'game', 'Pause schließt, Spiel läuft weiter');
  await p.click('#bPause'); await p.waitForTimeout(200);
  await p.click('.modal [data-a=quit]'); await p.waitForTimeout(200);
  await p.click('.modal [data-a=yes]'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => !RRMApp.game()), 'Level über Pause verlassen');

  // Zurück ins Menü
  for (let k = 0; k < 4 && !(await p.$('#menu:not([style*="none"])')); k++) { await p.goBack(); await p.waitForTimeout(400); }
  ok(!!(await p.$('#menu')), 'Hauptmenü wieder erreichbar');

  // Funkhaus
  await p.click('[data-a=tower]'); await p.waitForSelector('#towerui'); await p.waitForTimeout(500);
  await shot('9-tower');
  const canBuild = await p.$('#tpanel [data-a=build]:not([disabled])');
  if (canBuild) { await canBuild.click(); await p.waitForTimeout(400); ok((await p.evaluate(() => RRMApp.state().tower.length)) === 1, 'Funkhaus: Etage gebaut'); }
  await p.click('#towerui [data-a=back]'); await p.waitForTimeout(400);
  // Shop, Tagesbonus, Optionen, Hilfe, Bonus
  for (const [a, sel] of [['shop', '.shop'], ['daily', '.days'], ['settings', '.tg'], ['help', '.sheet h3'], ['bonus', '.blist']]) {
    await p.click('#menu [data-a=' + a + ']'); await p.waitForSelector('.modal ' + sel);
    ok(true, 'Fenster „' + a + '“ öffnet');
    if (a === 'settings') await shot('10-settings');
    await p.goBack(); await p.waitForTimeout(350);
  }
  ok((await p.$$('.modal')).length === 0, 'Zurück-Taste schließt Fenster');

  // Duell gegen KI: ein Zug + KI-Zug
  await p.click('#menu [data-a=duel]'); await p.waitForSelector('.modal [data-a=ai1]');
  await p.click('.modal [data-a=ai1]'); await p.waitForTimeout(900);
  const m = await p.evaluate(() => { const g = RRMApp.game(), x = g.eng.bestMove(), b = RRMApp.board; return [b.screen(x[0], 0.35), b.screen(x[1], 0.35)]; });
  await p.mouse.move(m[0].x, m[0].y); await p.mouse.down(); await p.mouse.move(m[1].x, m[1].y, { steps: 4 }); await p.mouse.up();
  let d;
  for (let w = 0; w < 60; w++) {   // KI denkt nach und animiert – bis zu 12 s warten
    await p.waitForTimeout(200);
    d = await p.evaluate(() => { const g = RRMApp.game(); return { moves: g.eng.moves, turn: g.duel.turn, s: g.duel.score, busy: g.lock || RRMApp.board.busy() }; });
    if (d.moves <= 18 && d.turn === 0 && !d.busy) break;
  }
  ok(d.moves === 18 && d.turn === 0 && d.s[0] > 0 && d.s[1] > 0, 'Duell: Spielerzug und KI-Zug gezählt ' + JSON.stringify(d));
  await shot('11-duel');

  ok(errs.length === 0, 'keine JavaScript-Fehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

server.listen(0, async () => {
  const browser = await pw.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    await run(browser, { width: 360, height: 800 }, 'phone360');
    await run(browser, { width: 412, height: 915 }, 'phone412');
    await run(browser, { width: 1366, height: 768 }, 'desktop');
  } catch (e) { fails++; console.log('ABBRUCH', e && e.stack || e); }
  await browser.close(); server.close();
  console.log('\n' + passes + ' bestanden, ' + fails + ' fehlgeschlagen');
  process.exit(fails ? 1 : 0);
});
