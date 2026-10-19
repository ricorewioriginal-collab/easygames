// Browser-Test (Playwright + Chromium):
//   python3 -m http.server 8765        (im Repo-Hauptordner)
//   node colorpop-universe/tests/smoke.js [http://127.0.0.1:8765/colorpop-universe/]
// Optional: PLAYWRIGHT=/pfad/zu/playwright, SHOTS=/ordner/für/screenshots
// Prüft auf 6 Bildschirmgrößen: Laden ohne Fehler, kein seitliches Scrollen, Level 1 mit echten Klicks/Taps lösen,
// Speichern über Neuladen, Klassiker bis Spielende, jede Modus-Kachel startet eine Runde, Tastatur, KI-Duell, Offline-Start.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/colorpop-universe/';
const SHOTS = process.env.SHOTS || path.join(os.tmpdir(), 'colorpop-shots');
const CERTS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools', 'level-certs.json'), 'utf8'));
const VIEWPORTS = [[360, 780, 1], [390, 844, 1], [320, 640, 1], [768, 1024, 1], [1366, 768, 0], [1920, 1080, 0]];
const MODES = ['adventure', 'classic', 'zen', 'sprint', 'time', 'moves', 'puzzle', 'chaos', 'gravity', 'daily', 'weekly', 'tower', 'duel', 'local'];
fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0, passes = 0;
function check(cond, msg) { if (cond) { passes++; console.log('PASS ' + msg); } else { fails++; console.log('FAIL ' + msg); } }

async function open(b, vp, touch, opt) {
  const ctx = opt && opt.ctx || await b.newContext({ viewport: { width: vp[0], height: vp[1] }, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: opt && opt.sw ? 'allow' : 'block' });
  const p = await ctx.newPage(); p.errs = [];
  p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  p.on('pageerror', e => p.errs.push('Seitenfehler: ' + e.message));
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) p.errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto(BASE + (opt && opt.q || '')); await menu(p); return p;
}
const menu = p => p.waitForFunction(() => window.ColorPop && ColorPop.screen === 'menu' && !document.getElementById('scrMenu').hidden, null, { timeout: 20000 });
const inGame = p => p.waitForFunction(() => ColorPop.screen === 'game' && ColorPop.sess && ColorPop.rend.cs > 0, null, { timeout: 15000 });
async function closeIntro(p) { if (await p.evaluate(() => ColorPop.modalOpen)) { await p.click('#modalActions button'); await p.waitForTimeout(120); } }
// Feld i des Bretts → Bildschirmpunkt (echte Klicks/Taps)
async function tapCell(p, i, touch) {
  const c = await p.evaluate(i => { const r = ColorPop.rend, b = ColorPop.sess.game.board, rc = r.cv.getBoundingClientRect(); return { x: rc.left + r.pad + (i % b.w + 0.5) * r.cs, y: rc.top + r.pad + (Math.floor(i / b.w) + 0.5) * r.cs }; }, i);
  if (touch) await p.touchscreen.tap(c.x, c.y); else await p.mouse.click(c.x, c.y);
  await p.waitForFunction(() => !ColorPop.lock, null, { timeout: 5000 });
}
const noScrollX = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.screen:not([hidden]) *')].every(e => { const r = e.getBoundingClientRect(); return r.width === 0 || (r.right <= innerWidth + 2 && r.left >= -2) || e.closest('.tabs,.scroll'); }));

async function level1(b, vp) {
  const touch = vp[2], name = vp[0] + 'x' + vp[1], p = await open(b, vp, touch);
  check(await noScrollX(p), name + ': Menü ohne seitliches Überlaufen');
  await p.screenshot({ path: path.join(SHOTS, name + '-menu.png') });
  await p.click('#btnContinue'); await p.waitForSelector('#modal:not([hidden])');
  await p.click('#modalActions .btn.primary'); await inGame(p); await closeIntro(p);
  const fits = await p.evaluate(() => { const r = ColorPop.rend.cv.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.width > 100; });
  check(fits, name + ': Spielbrett passt auf den Bildschirm');
  await p.screenshot({ path: path.join(SHOTS, name + '-level1.png') });
  for (const i of CERTS.levels['1'].path) { await tapCell(p, i, touch); await p.waitForTimeout(80); }
  await p.waitForSelector('#modal:not([hidden])', { timeout: 8000 });
  const res = await p.evaluate(() => ({ title: document.getElementById('modalTitle').textContent, stars: JSON.parse(localStorage.getItem('colorpop-universe-v1.p1')).levels['1'].stars }));
  check(/geschafft/i.test(res.title) && res.stars === 3, name + ': Level 1 per ' + (touch ? 'Touch' : 'Maus') + ' mit 3 Sternen gelöst (' + res.title + ', Sterne ' + res.stars + ')');
  await p.waitForTimeout(700); await p.screenshot({ path: path.join(SHOTS, name + '-result.png') });
  check(!p.errs.length, name + ': keine Konsolenfehler ' + p.errs.join(' | '));
  await p.context().close();
}

async function main() {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  for (const vp of VIEWPORTS) await level1(b, vp);

  // Speichern über Neuladen + Weiterspielen
  let p = await open(b, [390, 844], 1);
  await p.click('#btnContinue'); await p.click('#modalActions .btn.primary'); await inGame(p); await closeIntro(p);
  for (const i of CERTS.levels['1'].path) await tapCell(p, i, 1);
  await p.waitForSelector('#modal:not([hidden])'); await p.click('#modalActions .btn.primary'); await inGame(p); await closeIntro(p);
  await tapCell(p, CERTS.levels['2'].path[0], 1);
  await p.waitForTimeout(600); await p.reload(); await menu(p);
  const st = await p.evaluate(() => ({ p: JSON.parse(localStorage.getItem('colorpop-universe-v1.p1')), btn: document.getElementById('btnContinue').textContent }));
  check(st.p.levels['1'].stars === 3 && st.p.unlocked === 2 && st.p.resume && /Level 2/.test(st.btn), 'Neuladen: Sterne, Freischaltung und laufende Runde gespeichert („' + st.btn.trim() + '“)');
  await p.click('#btnContinue'); await inGame(p); await closeIntro(p);
  check(await p.evaluate(() => ColorPop.sess.game.movesUsed === 1 && ColorPop.sess.mode === 'adventure'), 'Weiterspielen setzt genau beim gespeicherten Zug fort');

  // Klassiker bis zum Spielende (Maus, Hinweis-Züge)
  await p.evaluate(() => { ColorPop.sess = null; ColorPop.go('menu'); });
  await p.click('.tile[data-arg="classic"]'); await p.click('[data-arg="classic.size=easy"]'); await p.click('#btnStart'); await inGame(p); await closeIntro(p);
  for (let k = 0; k < 80; k++) { const i = await p.evaluate(() => ColorPop.sess.over ? -2 : CPU.bots.hint(ColorPop.sess.game)); if (i < 0) break; await tapCell(p, i, 1); }
  await p.waitForSelector('#modal:not([hidden])', { timeout: 8000 });
  const cl = await p.evaluate(() => ({ t: document.getElementById('modalTitle').textContent, rec: JSON.parse(localStorage.getItem('colorpop-universe-v1.p1')).records.classic.easy }));
  check(/Keine Züge mehr|Brett leer/.test(cl.t) && cl.rec > 0, 'Klassiker endet regelgerecht („' + cl.t + '“, Rekord ' + cl.rec + ')');
  check(!p.errs.length, 'Speichern/Klassiker ohne Konsolenfehler ' + p.errs.join(' | '));
  await p.context().close();

  // Jede Modus-Kachel startet eine spielbare Runde
  p = await open(b, [1366, 768], 0);
  for (const m of MODES) {
    await p.evaluate(() => { if (ColorPop.modalOpen) ColorPop.closeModal(); ColorPop.sess = null; ColorPop.go('menu'); });
    await p.click('.tile[data-arg="' + m + '"]');
    if (m === 'adventure') { await p.click('.wtile[data-arg="1"]'); await p.click('.node[data-arg="1"]'); await p.click('#modalActions .btn.primary'); }
    else if (m === 'puzzle') await p.click('.node[data-act="puzzle"][data-arg="1"]');
    else if (m === 'weekly') await p.click('[data-act="weekly"][data-arg="0"]', { timeout: 15000 });
    else await p.click('#btnStart');
    await inGame(p); await closeIntro(p);
    const i = await p.evaluate(() => CPU.bots.hint(ColorPop.sess.game));
    await tapCell(p, i, 0);
    const ok = await p.evaluate(() => { const S = ColorPop.sess; return S.game.movesUsed >= 1 || S.boardNo > 0 || S.over || S.round > 0; });
    check(ok, 'Modus ' + m + ': Runde startet, Zug per Klick ausgeführt');
    if (m === 'sprint') await p.screenshot({ path: path.join(SHOTS, 'modus-sprint.png') });
    if (m === 'gravity') await p.screenshot({ path: path.join(SHOTS, 'modus-gravitation.png') });
  }
  // Tastatur: Hinweis (H) setzt den Cursor, Enter wählt
  await p.evaluate(() => { ColorPop.closeModal(); ColorPop.sess = null; ColorPop.go('menu'); ColorPop.setup.classic.size = 'normal'; ColorPop.startMode('classic'); });
  await inGame(p); await closeIntro(p);
  await p.keyboard.press('KeyH'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  check(await p.evaluate(() => ColorPop.sess.game.movesUsed === 1), 'Tastatur: Cursor + Enter führt einen Zug aus');
  await p.keyboard.press('Escape'); check(await p.evaluate(() => ColorPop.modalOpen && /Pause/.test(document.getElementById('modalTitle').textContent)), 'Esc öffnet die Pause');
  // KI-Duell: Runde werten → echter Bot spielt dasselbe Brett
  await p.evaluate(() => { ColorPop.closeModal(); ColorPop.sess = null; ColorPop.setup.duel.bot = 'hard'; ColorPop.startMode('duel'); });
  await inGame(p); await closeIntro(p);
  for (let k = 0; k < 3; k++) { const i = await p.evaluate(() => CPU.bots.hint(ColorPop.sess.game)); await tapCell(p, i, 0); }
  await p.keyboard.press('Escape'); await p.click('text=Runde beenden & werten'); await p.waitForSelector('#modal:not([hidden])');
  const du = await p.evaluate(() => ({ body: document.getElementById('modalBody').textContent, bot: ColorPop.sess.result.bot }));
  check(/Bot \(Schwer\)/.test(du.body) && du.bot.moves.length > 3 && du.bot.score > 0, 'KI-Duell: Bot spielt echte Züge (' + du.bot.moves.length + ' Züge, ' + du.bot.score + ' Punkte)');
  // Sammlung, Einstellungen, Hilfe
  for (const s of ['collection', 'settings', 'help']) { await p.evaluate(s => { ColorPop.closeModal(); ColorPop.sess = null; ColorPop.go(s); }, s); await p.waitForTimeout(150); check(await noScrollX(p), 'Bildschirm ' + s + ' ohne seitliches Überlaufen'); }
  await p.evaluate(() => ColorPop.go('collection', 'skins')); await p.screenshot({ path: path.join(SHOTS, 'designs.png') });
  check(!p.errs.length, 'Modi/Tastatur/Duell ohne Konsolenfehler ' + p.errs.join(' | '));
  await p.context().close();

  // Offline: einmal online laden (Service Worker), dann ohne Netz neu laden und spielen
  const octx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  // Der Service Worker registriert sich nur über https oder „localhost“
  const OBASE = BASE.replace('127.0.0.1', 'localhost');
  p = await octx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(OBASE); await menu(p);
  await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.getRegistrations().then(r => r.length && r[0].active), null, { timeout: 15000 });
  await p.reload(); await menu(p);
  await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }); await p.waitForTimeout(800);
  await octx.setOffline(true); await p.reload(); await menu(p);
  await p.evaluate(() => ColorPop.startMode('zen')); await inGame(p); await closeIntro(p);
  const zi = await p.evaluate(() => CPU.bots.hint(ColorPop.sess.game)); await tapCell(p, zi, 0);
  check(await p.evaluate(() => ColorPop.sess.game.movesUsed === 1), 'Offline: Seite lädt aus dem Cache und ist spielbar');
  await octx.close();
  await b.close();
  console.log('\n' + passes + ' bestanden, ' + fails + ' fehlgeschlagen · Screenshots: ' + SHOTS);
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
