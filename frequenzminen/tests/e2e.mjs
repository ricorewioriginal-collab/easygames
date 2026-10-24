// Frequenz-Minen – Browser-Test (Playwright). Aufruf: node frequenzminen/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8765/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { if (!c) { console.error('FEHLER:', m); process.exitCode = 1; } else console.log('ok', m); };
async function page(vp, touch) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|laut\.fm/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'frequenzminen/', { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/' + n + '.jpg', type: 'jpeg', quality: 82 }); };
const st = p => p.evaluate(() => FREQUENZMINEN.state());

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar', { timeout: 5000 }); await p.waitForTimeout(250); await shot(p, '1-laden');
await p.waitForSelector('#sLoad', { state: 'hidden', timeout: 10000 }); await p.waitForTimeout(600);
ok(await p.isVisible('#bPlay'), 'Menü sichtbar'); await shot(p, '2-menue');
await p.click('[data-d="mittel"]'); await p.click('#bPlay'); await p.waitForTimeout(500);
let s = await st(p); ok(s.mode === 'solo' && s.w * s.h === 144, 'Spiel Mittel gestartet');
await p.mouse.click(640, 400); await p.waitForTimeout(900);
s = await st(p); ok(s.opened > 0 && !s.done, 'Erster Klick sicher, ' + s.opened + ' Platten offen');
// Peiler per Rechtsklick auf eine verdeckte Platte am Rand des offenen Bereichs (über Tastatur-Rahmen geprüft)
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); s = await st(p); ok(s.cur >= 0, 'Tastatur-Rahmen aktiv');
const idx = await p.evaluate(() => { const b = FREQUENZMINEN.board(); for (let i = 0; i < b.w * b.h; i++) if (b.mine[i] && FM.nb(b, i).some(j => b.st[j] === 1)) return i; return -1; });
await p.evaluate(i => FREQUENZMINEN.act(i, 'flag'), idx); s = await st(p); ok(s.flags === 1, 'Peiler gesetzt');
await p.click('#bHint'); await p.waitForTimeout(700); ok((await p.evaluate(() => FREQUENZMINEN.board().hintsUsed)) === 1, 'Peilung genutzt');
await p.mouse.move(700, 420); await p.waitForTimeout(400); await shot(p, '3-spiel');
// Verlieren
await p.evaluate(() => { const b = FREQUENZMINEN.board(); for (let i = 0; i < b.w * b.h; i++) if (b.mine[i] && b.st[i] === 0) { FREQUENZMINEN.act(i, 'open'); return; } });
await p.waitForTimeout(700); await shot(p, '4-explosion');
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 4000 }); await p.waitForTimeout(500); await shot(p, '5-gameover');
ok((await p.textContent('#eTitle')).includes('Störsender'), 'Game-over-Bildschirm (verloren)');
await p.click('#eView'); ok(!(await p.isVisible('#ovEnd')), 'Feld ansehen blendet aus'); await p.mouse.click(640, 400); ok(await p.isVisible('#ovEnd'), 'Klick holt Auswertung zurück');
// Gewinnen (Leicht)
await p.click('#eMenu'); await p.waitForTimeout(300); await p.click('[data-d="leicht"]'); await p.click('#bPlay'); await p.waitForTimeout(400);
await p.mouse.click(640, 420); await p.waitForTimeout(300);
await p.evaluate(() => { const b = FREQUENZMINEN.board(); for (let i = 0; i < b.w * b.h; i++) if (!b.mine[i] && b.st[i] !== 1 && !b.done) FREQUENZMINEN.act(i, 'open'); });
await p.waitForTimeout(1000); await shot(p, '6-sieg');
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 4000 }); await p.waitForTimeout(500); await shot(p, '7-gewonnen');
ok((await p.textContent('#eTitle')).includes('frei'), 'Game-over-Bildschirm (gewonnen)');
ok(+(await p.evaluate(() => localStorage.getItem('frequenzminen-highscore'))) > 0, 'Highscore gespeichert');
// Tagesrätsel
await p.click('#eMenu'); await p.click('#bDaily'); await p.waitForTimeout(1200); s = await st(p); ok(s.mode === 'daily' && s.opened > 0, 'Tagesrätsel startet mit sicherer Mitte');
// Esc = Pause
await p.keyboard.press('Escape'); ok(await p.isVisible('#ovPause'), 'Pause mit Esc'); await p.keyboard.press('Escape'); ok(!(await p.isVisible('#ovPause')), 'weiter mit Esc');

// Handy (Hochformat, Touch)
const m = await page({ width: 390, height: 844 }, true);
await m.waitForSelector('#sLoad', { state: 'hidden', timeout: 10000 }); await m.waitForTimeout(500); await shot(m, '8-handy-menue');
await m.click('[data-d="schwer"]'); await m.click('#bPlay'); await m.waitForTimeout(400);
s = await st(m); ok(s.w === 12 && s.h === 18, 'Schwer im Hochformat 12×18');
await m.touchscreen.tap(195, 430); await m.waitForTimeout(900); s = await st(m); ok(s.opened > 0, 'Antippen deckt auf');
await m.click('#bFlag'); ok((await m.getAttribute('#bFlag', 'aria-pressed')) === 'true', 'Peiler-Modus umschaltbar'); await m.click('#bFlag');
await m.waitForTimeout(500); await shot(m, '9-handy-spiel');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
await b.close();
