/* Pride City – Browser-Test (Playwright, Chromium mit SwiftShader).
   Aufruf: im Repo `python3 -m http.server 8080`, dann `node pride-city-src/tests/e2e.mjs` (BASE=… für andere Adresse).
   Spielt Kapitel 1 komplett durch (Gespräche werden direkt weitergeschaltet, weil SwiftShader langsam zeichnet). */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;

const BASE = (process.env.BASE || 'http://localhost:8080') + '/pride-city/';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
let ok = 0, bad = 0;
const check = (c, msg) => { if (c) { ok++; console.log('  ✓', msg); } else { bad++; console.log('  ✗', msg); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(browser, opts = {}, pre) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts });
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_|net::|Failed to load resource/.test(m.text())) p.errors.push(m.text()); });
  if (pre) await p.addInitScript(pre);
  await p.goto(BASE, { waitUntil: 'load' });
  await p.waitForSelector('.mi', { timeout: 90000 });
  return p;
}
const ev = (p, fn, arg) => p.evaluate(fn, arg);
async function dlg(p) {
  // Auf langsamen Software-Grafiken kann der Dialog etwas später aufgehen
  for (let i = 0; i < 25 && !(await ev(p, () => window.__pc.dialog.open)); i++) await sleep(120);
  for (let i = 0; i < 40; i++) {
    const open = await ev(p, () => {
      const d = window.__pc.dialog; if (!d.open) return false;
      d.shown = d.full.length;
      if (d.menu) { d.menu.el.style.display = ''; d.menu.activate(); } else d.advance();
      return true;
    });
    if (!open) return;
    await sleep(120);
  }
}
async function goTo(p, x, z) { await ev(p, ([x, z]) => { const c = window.__pc.city; c.player.root.position.set(x, .1, z); }, [x, z]); await sleep(900); }
async function goNpc(p, id) {
  await ev(p, (id) => { const c = window.__pc.city, n = c.npcs.find((q) => q.def.id === id); const q = n.a.root.position; c.player.root.position.set(q.x - 1.2, .1, q.z); n.wait = 30; }, id);
  await sleep(900);
}
async function act(p) { await p.keyboard.press('Enter'); await sleep(700); }
const S = (p) => ev(p, () => window.__pc.save.data);

const browser = await chromium.launch({ args: ARGS });
let cur = null;
try {
  console.log('Titel und Neues Spiel');
  const p = await page(browser); cur = p;
  check(await p.locator('.logo .l2').innerText() === 'CITY', 'Titel-Logo sichtbar');
  check(await p.locator('.mi').count() >= 5, 'Konsolen-Menü mit Einträgen');
  await p.keyboard.press('ArrowDown'); await sleep(300);
  check(await p.locator('.mi.sel b').innerText() === 'Story', 'Steuerkreuz/Pfeile wählen im Menü');
  await p.keyboard.press('ArrowUp'); await sleep(200); await p.keyboard.press('Enter');
  await p.waitForSelector('#cName', { timeout: 30000 });
  check(true, 'Charakter-Editor öffnet');
  await p.fill('#cName', 'Testi');
  await ev(p, () => document.activeElement.blur());
  await p.keyboard.press('ArrowDown'); await sleep(500); await p.keyboard.press('ArrowRight'); await sleep(1500);
  check((await S(p)).palette === 'progress', 'Farbwelt mit ←/→ geändert');
  for (let i = 0; i < 12 && !(await p.locator('.mi.sel b').innerText()).startsWith('Los'); i++) { await p.keyboard.press('ArrowUp'); await sleep(500); }
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => window.__pc.city.mode === 'play', null, { timeout: 60000 });
  await sleep(4500);
  check((await S(p)).name === 'Testi', 'Name übernommen');
  await dlg(p);
  check((await S(p)).step === 1, 'Einführung gelaufen, Ziel: Mo');
  check((await p.locator('#hud .goal').innerText()).includes('Mo'), 'HUD zeigt Ziel');

  console.log('Laufen und Kamera');
  const a = await ev(p, () => window.__pc.city.player.root.position.z);
  await p.keyboard.down('KeyW'); await sleep(2500); await p.keyboard.up('KeyW');
  const b = await ev(p, () => window.__pc.city.player.root.position.z);
  check(b < a - .5, `W läuft vorwärts (${a.toFixed(1)} → ${b.toFixed(1)})`);
  await goTo(p, 3, 20);
  await p.keyboard.down('KeyD'); await sleep(2500); await p.keyboard.up('KeyD');
  check(await ev(p, () => window.__pc.city.player.root.position.x) < 6.6, 'Kollision: Häuser halten die Figur auf');

  console.log('Kapitel 1');
  await goNpc(p, 'mo'); await act(p); await dlg(p);
  let s = await S(p);
  check(s.step === 2 && !!s.flags.feel, 'Mo: Entscheidung gespeichert, Ziel Wohnung');
  await goTo(p, 4.6, 40); await act(p);
  await p.waitForFunction(() => window.__pc.where === 'home' && window.__pc.dialog.open, null, { timeout: 30000 });
  await dlg(p);
  check((await S(p)).step === 3, 'Wohnung bezogen (begehbar)');
  await ev(p, () => window.__pc.leaveHome());
  await p.waitForFunction(() => window.__pc.engine.scene === window.__pc.city, null, { timeout: 20000 }); await sleep(800);
  await goNpc(p, 'jules'); await act(p); await dlg(p);
  s = await S(p);
  check(s.step === 4 && s.flags.style === 'loud', 'Jules: Weg gewählt, Unterschriften sammeln');
  for (const id of ['lena', 'hilde', 'kim']) { await goNpc(p, id); await act(p); await dlg(p); }
  s = await S(p);
  check(s.step === 5, 'Drei Unterschriften gesammelt');
  await goNpc(p, 'jules'); await act(p); await dlg(p);
  check((await S(p)).step === 6, 'Liste abgegeben, Ziel Club Prisma');
  const h0 = await ev(p, () => window.__pc.city.hour());
  await goNpc(p, 'nova'); await act(p); await dlg(p); await sleep(1500);
  const h1 = await ev(p, () => window.__pc.city.hour());
  check(h1 >= 21 || h1 < 6, `Vor der Tür bis 21 Uhr gewartet (${h0.toFixed(1)} → ${h1.toFixed(1)})`);
  await goNpc(p, 'nova'); await act(p); await dlg(p);
  await p.waitForSelector('#mg .score', { timeout: 60000 });
  check(true, 'Tanz-Battle startet');
  await sleep(6000);
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp');
  const money = (await S(p)).money;
  await ev(p, () => { const sc = window.__pc.engine.scene; sc.score = 99999; sc.end(false); });
  await p.waitForFunction(() => window.__pc.engine.scene === window.__pc.city && window.__pc.dialog.open, null, { timeout: 30000 });
  await dlg(p);
  s = await S(p);
  check(s.chapter === 2 && s.money === money + 120, 'Battle gewonnen, Kapitel 1 abgeschlossen (+120 €)');
  check(s.best.dance === 99999, 'Tanz-Rekord gespeichert');

  console.log('Alltag: Schicht, Handy, Wohnung');
  await ev(p, () => { const s = window.__pc.save.data; s.time = (12 - 6) / 24; s.needs.energy = 90; });
  await goTo(p, 34, 10); await act(p);
  check((await p.locator('.screen .panel h3').innerText()) === 'Boutique Fabelhaft', 'Boutique öffnet mit Job');
  const m0 = (await S(p)).money;
  await p.keyboard.press('Enter'); await sleep(600);
  for (let i = 0; i < 3; i++) { await ev(p, () => { const d = window.__pc.dialog; d.shown = d.full.length; if (d.menu) { d.menu.el.style.display = ''; d.menu.activate(); } else d.advance(); }); await sleep(250); }
  await dlg(p); await sleep(1500);
  s = await S(p);
  check(s.money > m0 && s.jobs.shop?.shifts === 1, `Schicht gearbeitet (+${s.money - m0} €)`);
  await p.keyboard.press('KeyP'); await sleep(600);
  check(await p.locator('.phoneBox').count() === 1, 'Handy öffnet mit P');
  await p.keyboard.press('Escape'); await sleep(500);
  check(await p.locator('.screen').count() === 0, 'Handy schließt');
  await goTo(p, 4.6, 40); await act(p); await sleep(1500);
  if (!(await ev(p, () => window.__pc.where === 'home'))) { await ev(p, () => window.__pc.closeMenu()); await goTo(p, 4.6, 40); await act(p); }
  await p.waitForFunction(() => window.__pc.where === 'home', null, { timeout: 30000 }); await sleep(1500);
  await ev(p, () => { window.__pc.save.data.needs.hygiene = 10; window.__pc.homeAction('shower'); }); await sleep(1500);
  check((await S(p)).needs.hygiene > 90, 'Duschen in der Wohnung');
  await ev(p, () => window.__pc.leaveHome());
  await p.waitForFunction(() => window.__pc.engine.scene === window.__pc.city, null, { timeout: 20000 }); await sleep(800);

  console.log('Sammeln, Orte, Pause');
  await goTo(p, -15, 24); await sleep(800);
  check((await S(p)).goals.includes('sticker0'), 'Pride-Sticker eingesammelt');
  await goTo(p, 4.6, 10); await act(p);
  check(await p.locator('.screen .panel h3').innerText() === 'Café Kaffeeklatsch', 'Café-Menü öffnet');
  const cm = (await S(p)).money;
  await p.keyboard.press('Enter'); await sleep(600);
  const cs = await S(p);
  check(cs.money === cm - 3, `Cappuccino gekauft (${cm} → ${cs.money})`);
  await p.keyboard.press('Escape'); await sleep(600);
  check((await p.locator('.screen .logo .l1').innerText()).toLowerCase() === 'pause', 'Esc öffnet Pausenmenü');
  await p.keyboard.press('Escape'); await sleep(400);
  check(await p.locator('.screen').count() === 0, 'Esc schließt Pausenmenü');
  console.log('Nachtleben 18+');
  await goTo(p, 4.6, -40); await act(p);
  check(await p.locator('.screen .panel h3').innerText() === 'Videothek Kopfkino', 'Videothek öffnet');
  check(!(await p.locator('.screen').innerText()).includes('Kabinen'), 'ohne 18+ keine Kabinen');
  await p.keyboard.press('Escape'); await sleep(500);
  await ev(p, () => { const g = window.__pc; g.save.data.settings.adult = true; g.save.data.inv.condom = 2; g.closeMenu(); g.placeMenu('kopfkino'); });
  await sleep(500);
  check((await p.locator('.screen').innerText()).includes('Kabinen'), 'mit 18+ Kabinen und Filme');
  await ev(p, () => { window.__pc.closeMenu(); window.__pc.placeMenu('rosa'); }); await sleep(400);
  check((await p.locator('.screen').innerText()).includes('Eintreten'), 'Haus Rosa mit 18+');
  await ev(p, () => { const g = window.__pc; g.closeMenu(); g.save.data.settings.adult = false; g.touch.show(true); });
  await sleep(400);
  console.log('Hafen, eigener Club, Autofahren');
  await ev(p, () => window.__pc.travel(-72.6, -12)); await sleep(1800);
  check(await ev(p, () => window.__pc.city.player.root.position.x < -66), 'Tram fährt ins Hafenviertel');
  await ev(p, () => window.__pc.placeMenu('bar')); await sleep(300);
  check((await p.locator('.screen').innerText()).includes('Lagerhalle'), 'Lagerhalle wartet auf Eröffnung');
  await ev(p, () => { const g = window.__pc; g.closeMenu(); g.barShift(); }); await sleep(300);
  check(await p.locator('#barBox').isVisible(), 'Barkeeper-Minispiel läuft');
  await ev(p, () => { window.__pc.closeMenu(); window.__pc.touch.show(true); }); await sleep(1200);
  const car0 = await ev(p, () => { const c = window.__pc.city; c.toggleCar('3'); return c.street.parked[3].o.position.z; });
  await p.keyboard.down('KeyW'); await sleep(2500);
  const [car1, v] = await ev(p, () => { const c = window.__pc.city.street.parked[3]; return [c.o.position.z, c.v]; });
  await p.keyboard.up('KeyW');
  check(car1 - car0 > .3 && v > 1, `Auto fährt (${car0.toFixed(1)} → ${car1.toFixed(1)}, ${v.toFixed(1)} m/s)`);
  await ev(p, () => window.__pc.city.toggleCar('exit')); await sleep(300);
  check(await ev(p, () => window.__pc.city.player.root.visible), 'Aussteigen klappt');
  check(await ev(p, () => window.__pc.city.street.people.length >= 20), 'Straßen sind belebt (Passanten, Polizei, Feuerwehr)');
  await ev(p, () => window.__pc.save.write());
  check(p.errors.length === 0, 'keine Fehler in der Konsole' + (p.errors.length ? ': ' + p.errors.slice(0, 3).join(' | ') : ''));

  console.log('Neu laden');
  await p.reload({ waitUntil: 'load' });
  await p.waitForSelector('.mi', { timeout: 90000 });
  check((await p.locator('.mi b').first().innerText()) === 'Fortsetzen', 'Spielstand bleibt erhalten (Fortsetzen)');
  await p.context().close();

  console.log('Handy hochkant mit Touch');
  const m = await page(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  check(await ev(m, () => document.documentElement.dataset.input) === 'touch', 'Touch-Modus erkannt');
  await ev(m, () => { const g = window.__pc; g.save.data.started = true; g.closeMenu(); g.engine.setScene(g.city); g.city.setPlay(); });
  await sleep(1500);
  check(await m.locator('#touch.on .stick').isVisible(), 'Stick sichtbar');
  check(await m.locator('#touch .bA').isVisible(), 'Aktionstaste sichtbar');
  const box = await m.locator('#touch .stick').boundingBox();
  check(box && box.x >= 0 && box.y + box.height <= 844, 'Stick liegt im Bild');
  const z0 = await ev(m, () => window.__pc.city.player.root.position.z);
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await m.dispatchEvent('#touch .stick', 'pointerdown', { pointerId: 7, clientX: cx, clientY: cy, isPrimary: true, pointerType: 'touch' });
  await m.dispatchEvent('#touch .stick', 'pointermove', { pointerId: 7, clientX: cx, clientY: cy - 60, isPrimary: true, pointerType: 'touch' });
  await sleep(1500);
  await m.dispatchEvent('#touch .stick', 'pointerup', { pointerId: 7, clientX: cx, clientY: cy - 60, isPrimary: true, pointerType: 'touch' });
  const z1 = await ev(m, () => window.__pc.city.player.root.position.z);
  check(Math.abs(z1 - z0) > .5, 'Stick bewegt die Figur');
  await m.context().close();

  console.log('Gay-Life!-Spielstand übernehmen');
  const o = await page(browser, {}, () => { if (!localStorage.getItem('prideCity.save')) localStorage.setItem('anmachaGayLife', JSON.stringify({ v: 2, name: 'Rico', glitzer: 50, life: { money: 420 } })); });
  await o.keyboard.press('Enter'); await sleep(500);
  check((await o.locator('.panel h3').innerText()).includes('Gay Life!'), 'Alter Spielstand erkannt');
  await o.keyboard.press('Enter'); await sleep(1500);
  const os = await S(o);
  check(os.name === 'Rico' && os.money === 420 && os.glitter === 50 && os.imported, 'Name, Geld und Glitzer übernommen');
  await o.context().close();
} catch (e) {
  bad++; console.log('  ✗ Abbruch:', e.message);
  if (process.env.SHOT && cur) { await cur.screenshot({ path: process.env.SHOT }).catch(() => {}); console.log(await cur.evaluate(() => JSON.stringify({ where: window.__pc.where, menu: window.__pc.menuOpen, dlg: window.__pc.dialog.open, prompt: document.querySelector('#hud .prompt')?.innerText, pos: window.__pc.city.player.root.position })).catch(() => '')); }
} finally {
  await browser.close();
  console.log(`\n${ok} bestanden, ${bad} fehlgeschlagen`);
  process.exit(bad ? 1 : 0);
}
