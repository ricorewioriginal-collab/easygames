/* Browser-Test (Playwright): Show mit 2 Läufern am selben Gerät (Planer-Bot steuert über window.__fpInput), Wertung, Training mit Geist, Touch-Pad.
   Aufruf:  BASE=http://localhost:8080/anmacha-funkparcours [THREE=/pfad/three.min.js] node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-funkparcours'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const mk = async (o) => { const ctx = await browser.newContext(Object.assign({}, o, { keepBoot: undefined })), p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__fp, null, { timeout: 30000 }); if (!o.keepBoot) await pressStart(p); return p; };
const pressStart = async p => { await p.waitForSelector('#boot.ready', { timeout: 30000 }); await p.keyboard.press('Enter'); await p.waitForSelector('#menu:not([hidden]) .cm-it.on', { timeout: 5000 }); };
const SHOT = process.env.SHOT || '/tmp';
const bot = p => p.evaluate(async () => { const { plan } = await import('./bot.js'); let c = {}, until = 0, hold = 0, lastT = 0; window.__fpBot = true; window.__fpInput = sim => { if (window.__fpStupid) return { r: 1 }; if (sim.t < lastT) until = 0; lastT = sim.t; if (sim.t >= until) { c = plan(sim); until = sim.t + 0.05; hold = sim.t + (c.hold || 0.1); } return { l: c.l, r: c.r, j: c.j && sim.t < hold, g: c.g }; }; });
const phase = (p, ph, ms = 60000) => p.waitForFunction(x => window.__fp.G && window.__fp.G.phase === x, ph, { timeout: ms, polling: 100 });

{ // ---- Ladebildschirm + Konsolen-Menü (Tastatur)
  const p = await mk({ viewport: { width: 1000, height: 600 }, keepBoot: true });
  log(await p.isVisible('#boot'), 'Ladebildschirm erscheint zuerst'); await p.waitForSelector('#boot.ready', { timeout: 30000 });
  log((await p.textContent('#bootPct')).trim() === '100 %' && await p.isVisible('#bootStart'), 'Ladebalken bei 100 %, „Drücke eine beliebige Taste"'); await p.screenshot({ path: `${SHOT}/fp-boot.png` });
  await p.keyboard.press('Enter'); await p.waitForSelector('#menu:not([hidden]) .cm-it.on'); await p.waitForTimeout(600);
  log(await p.evaluate(() => document.getElementById('boot').classList.contains('out')) && /Show starten/.test(await p.textContent('#cmPanel')), 'Taste startet: Menü mit Fokus auf „Show starten"'); await p.screenshot({ path: `${SHOT}/fp-menu.png` });
  await p.keyboard.press('ArrowDown'); log(await p.evaluate(() => document.querySelector('.cm-it.on').id === 'bTrain') && /Training/.test(await p.textContent('#cmPanel h3')), 'Pfeil runter: Fokus auf Training, Info-Feld wechselt');
  await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); log(await p.evaluate(() => document.querySelector('.cm-it.on').id === 'bHome'), 'Liste läuft oben herum (Fokus auf „Alle Spiele")');
  await p.keyboard.press('ArrowUp'); const s0 = await p.textContent('#bSound'); await p.keyboard.press('Enter'); log(await p.textContent('#bSound') !== s0, 'Enter auf „Ton" schaltet um (' + s0.trim() + ' → ' + (await p.textContent('#bSound')).trim() + ')'); await p.keyboard.press('Enter');
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForSelector('#setup:not([hidden])'); log((await p.textContent('#setTitle')) === 'Neue Show', 'Enter auf „Show starten" öffnet die Einrichtung');
  await p.keyboard.press('Escape'); await p.waitForSelector('#menu:not([hidden])'); log(await p.evaluate(() => document.querySelector('.cm-it.on').id === 'bPlay'), 'Esc führt zurück ins Menü, Fokus bleibt');
  await p.close();
}
{ // ---- Show, 2 Läufer
  const p = await mk({ viewport: { width: 1000, height: 600 } }); await bot(p); await p.evaluate(() => { window.__fpFast = 3; });
  await p.click('#bPlay'); await p.click('#sgPl [data-v="2"]'); await p.fill('#names input[data-i="0"]', 'Anna'); await p.fill('#names input[data-i="1"]', 'Ben'); await p.click('#bStart');
  let shots = 0;
  for (let ci = 0; ci < 3; ci++) {
    for (let pi = 0; pi < 2; pi++) {
      await p.waitForSelector('#bReady', { timeout: 30000 }); if (ci === 0 && pi === 1) { log((await p.textContent('#cardBox')).includes('Anna'), 'Bereit-Karte zeigt die bisherigen Zeiten'); }
      await p.evaluate(([c, i]) => { window.__fpStupid = c === 0 && i === 1; }, [ci, pi]); await p.keyboard.press('Space');
      await phase(p, 'run'); if (ci === 1 && pi === 0) { await p.waitForTimeout(2500); await p.screenshot({ path: `${SHOT}/fp-run${shots++}.png` }); }
      await phase(p, 'done', 90000);
    }
    await p.waitForSelector('#bNext', { timeout: 30000 });
    const t = await p.textContent('#cardBox'); log(/Wertung/.test(t) && t.includes('Anna') && t.includes('Ben'), `Parcours ${ci + 1}: Wertung zeigt beide Läufer`);
    if (ci === 0) { const pts = await p.evaluate(() => window.__fp.G.players.map(x => x.pts)); log(pts[0] === 2 && pts[1] === 1, 'Platzierungspunkte: Finisher 2, Absturz 1 (' + pts + ')'); await p.screenshot({ path: `${SHOT}/fp-board.png` }); }
    await p.click('#bNext');
  }
  await p.waitForSelector('#bAgain', { timeout: 10000 }); const end = await p.textContent('#cardBox'); log(end.includes('Anna') && end.includes('gewinnt'), 'Endstand nennt den Sieger'); log(await p.isVisible('#cardBox .prize img'), 'Radioportal-Logo am Ende'); await p.screenshot({ path: `${SHOT}/fp-end.png` });
  const b = await p.evaluate(() => JSON.parse(localStorage.getItem('fpBest3') || '{}')); log(!!b[0] && !!b[1] && !!b[2] && b[0].g.length > 20, 'Bestzeiten + Geist gespeichert');
  await p.click('#bToMenu'); await p.waitForSelector('#menu:not([hidden])'); log(true, 'Zurück im Menü');
  await p.close();
}
{ // ---- Figuren: realistische Läufer, Auswahl mit Figuren aus anderen easygames
  const p = await mk({ viewport: { width: 1280, height: 720 } });
  await p.waitForFunction(() => window.__fp.arena.runner.fig, null, { timeout: 30000 }).catch(() => {}); log(await p.evaluate(() => !!(window.__fp.arena.runner.fig && window.__fp.arena.runner.fig.mixer)), 'Läufer ist eine animierte easygames-Figur');
  await p.click('#bTrain'); await p.click('.chb'); await p.waitForSelector('#pick:not([hidden]) .pk');
  const g = await p.evaluate(() => ({ n: document.querySelectorAll('#pick .pk').length, h: [...document.querySelectorAll('#pickList h3')].map(h => h.textContent) }));
  log(g.n >= 60 && g.h.includes('Funkparcours') && g.h.includes('Sendemast-Sumo'), 'Figurenwahl zeigt eigene Läufer und Figuren anderer Spiele (' + g.n + ')');
  await p.click('.pk[data-k="rico"]'); await p.waitForFunction(() => { const r = window.__fp.arena.runner; return r.ci === 'rico' && r.fig; }, null, { timeout: 20000 }).catch(() => {});
  log(await p.evaluate(() => window.__fp.arena.runner.ci === 'rico' && !!window.__fp.arena.runner.fig) && /2048 Deluxe/.test(await p.textContent('#pickWho')), 'Mensch aus anderem Spiel (Rico) wird als realistische Figur gezeigt');
  await p.click('.pk[data-k="hopsi-hopsi"]'); await p.waitForFunction(() => { const r = window.__fp.arena.runner; return r.ci === 'hopsi-hopsi' && r.toon; }, null, { timeout: 20000 }).catch(() => {});
  log(await p.evaluate(() => !!window.__fp.arena.runner.toon), 'Wesen aus anderem Spiel (Hopsi) erscheint im Look seines Spiels'); await p.screenshot({ path: `${SHOT}/fp-figurwahl.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); log(await p.isHidden('#pick') && /Hopsi/.test(await p.textContent('.chb')), 'Fertig/Esc schließt die Auswahl, Knopf zeigt die Figur');
  await p.click('#bStart'); await p.waitForSelector('#bReady'); await p.click('#bReady'); await phase(p, 'run'); await p.keyboard.down('ArrowRight'); await p.waitForTimeout(600); await p.keyboard.up('ArrowRight');
  log(await p.evaluate(() => window.__fp.arena.runner.st === 'run' || window.__fp.arena.runner.st === 'air' || window.__fp.arena.runner.st === 'idle'), 'Lauf mit Toon-Figur ohne Fehler');
  await p.evaluate(() => { localStorage.removeItem('fpChars'); }); await p.close();
}
{ // ---- Training mit Geist, Handy-Format + Touch-Pad
  const p = await mk({ viewport: { width: 420, height: 820 }, hasTouch: true, isMobile: true }); await p.evaluate(() => { window.__fpFast = 3; });
  { await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/fp-menu-mobile.png` }); const m = await p.evaluate(() => { const r = document.getElementById('bHome').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, iw: innerWidth, vis: r.bottom > 0 && r.right <= innerWidth + 1 }; }); log(m.sw <= m.iw && m.vis, 'Handy-Menü: alle Einträge erreichbar, kein horizontales Scrollen'); }
  await p.click('#bTrain'); await p.click('#sgCourse [data-v="0"]'); await p.click('#bStart'); await p.waitForSelector('#bReady'); log(await p.isVisible('#bReady'), 'Training: Bereit-Karte'); await p.click('#bReady'); await phase(p, 'run');
  await p.setViewportSize({ width: 844, height: 390 }); await p.waitForTimeout(300); await p.screenshot({ path: `${SHOT}/fp-mobile-quer.png` });
  { const q = await p.evaluate(() => { const r = id => document.querySelector(id).getBoundingClientRect(), s = r('#stick'), a = [r('#aMenu'), r('#aSnd'), r('#pad .act.main')], tb = r('.top'), all = [s, ...a]; const over = (u, v) => u.left < v.right && v.left < u.right && u.top < v.bottom && v.top < u.bottom; return { inside: all.every(b => b.left >= 0 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1 && b.top >= tb.bottom - 1), sep: !a.some(b => over(b, s)) && !over(a[0], a[2]) && !over(a[1], a[2]) && !over(a[0], a[1]) }; }); log(q.inside && q.sep, 'Handy quer: Stick und Aktionsknöpfe sichtbar und ohne Überlappung'); }
  { await p.click('#aSnd'); const a = await p.textContent('#aSnd .ai'); await p.click('#aSnd'); const b = await p.textContent('#aSnd .ai'); log(a === '🔇' && b === '🔊', 'Ton-Knopf am Touch-Pad schaltet um'); }
  await p.setViewportSize({ width: 420, height: 820 }); await p.waitForTimeout(300); await p.screenshot({ path: `${SHOT}/fp-mobile.png` });
  { const jb = p.locator('#pad .act.main'), y0 = await p.evaluate(() => window.__fp.G.sim.y); await jb.dispatchEvent('pointerdown', { pointerId: 8, bubbles: true }); const up = await p.waitForFunction(y => window.__fp.G.sim.y > y + 0.4, y0, { timeout: 2000, polling: 30 }).then(() => true, () => false); await jb.dispatchEvent('pointerup', { pointerId: 8, bubbles: true }); log(up, 'Touch-Knopf „Springen" lässt den Läufer springen'); await p.waitForFunction(() => window.__fp.G.sim.onGround, null, { timeout: 3000 }).catch(() => {}); }
  const x0 = await p.evaluate(() => window.__fp.G.sim.x); const st = p.locator('#stick'), sb = await st.boundingBox(), cx = sb.x + sb.width / 2, cy = sb.y + sb.height / 2;
  await st.dispatchEvent('pointerdown', { pointerId: 7, bubbles: true, clientX: cx, clientY: cy }); await st.dispatchEvent('pointermove', { pointerId: 7, bubbles: true, clientX: cx + sb.width * 0.4, clientY: cy }); await p.waitForTimeout(500);
  const x1 = await p.evaluate(() => window.__fp.G.sim.x); await st.dispatchEvent('pointerup', { pointerId: 7, bubbles: true }); log(x1 > x0 + 1, 'Touch-Stick nach rechts bewegt den Läufer (' + x0.toFixed(1) + ' → ' + x1.toFixed(1) + ')');
  await p.waitForTimeout(300); log(await p.evaluate(() => /translate\(0px, 0px\)/.test(document.querySelector('#stick b').style.transform)), 'Stick springt beim Loslassen in die Mitte zurück');
  await phase(p, 'done', 90000); await p.waitForSelector('#bAgain', { timeout: 10000 }); log(/Baden|Zeit|Nochmal/.test(await p.textContent('#cardBox')), 'Training: Ergebnis-Karte');
  const lay = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am Handy');
  await bot(p); await p.click('#bAgain'); await p.waitForSelector('#bReady'); await p.click('#bReady'); await phase(p, 'run'); await phase(p, 'done', 90000); await p.waitForSelector('#bAgain'); const t = await p.textContent('#cardBox'); log(/Bestzeit/.test(t), 'Bot-Lauf: Bestzeit wird gemeldet'); await p.click('#bAgain'); await p.waitForSelector('#bReady'); log(await p.evaluate(() => !!window.__fp.G.ghost), 'Geist der Bestzeit ist aktiv'); await p.click('#bReady'); await phase(p, 'run'); await p.waitForTimeout(1500); await p.screenshot({ path: `${SHOT}/fp-ghost.png` });
  await p.close();
}
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
