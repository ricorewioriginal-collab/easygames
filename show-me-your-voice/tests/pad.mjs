// SHOW ME YOUR VOICE – Controller-Test (Playwright, simuliertes Gamepad über ../gamepad.js) und Konsolen/TV-Ansicht (1920×1080).
//   node show-me-your-voice/tests/pad.mjs [Basis-URL]
// Prüft: Titel mit Ⓐ, Menü mit Steuerkreuz, Ⓑ zurück, Start = Pause auf der Bühne, Spuren über X/A/Y/B.
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const c = await b.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' });
await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|laut\.fm|itunes|lrclib/, r => r.fulfill({ status: 503, body: '' }));
await c.addInitScript(() => {
  const pad = { id: 'Test Pad (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })) };
  window.__pad = pad;
  navigator.getGamepads = () => [pad, null, null, null];
  window.__btn = (i, on) => { pad.buttons[i] = { pressed: on, touched: on, value: on ? 1 : 0 }; pad.timestamp++; };
});
const p = await c.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/i.test(m.text())) errs.push(m.text()); });
await p.goto(base); await p.waitForSelector('#sTitle.on');
await p.evaluate(() => window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })));
const tap = async (i, hold = 120) => { await p.evaluate(i => window.__btn(i, true), i); await p.waitForTimeout(hold); await p.evaluate(i => window.__btn(i, false), i); await p.waitForTimeout(250); };
const A = 0, B = 1, X = 2, Y = 3, START = 9, UP = 12, DOWN = 13;
await p.waitForTimeout(400);
await tap(A); await p.waitForSelector('#sMenu.on', { timeout: 4000 }).catch(() => {});
ok(await p.isVisible('#sMenu.on'), 'Ⓐ startet die Show vom Titel');
const f0 = await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim().slice(0, 30));
await tap(DOWN); await tap(DOWN);
const f1 = await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim().slice(0, 30));
ok(f1 && f1 !== f0, `Steuerkreuz bewegt den Fokus (${f0} → ${f1})`);
await tap(UP); await tap(UP); await tap(UP); await tap(UP);
await p.evaluate(() => document.querySelector('[data-m="new"]').focus());
await tap(A); await p.waitForSelector('#sAva.on, #sAvatar.on, #avaOk', { timeout: 4000 }).catch(() => {});
ok(await p.isVisible('#avaOk'), 'Ⓐ öffnet „Neue Karriere“');
await tap(B); await p.waitForTimeout(300);
ok(await p.isVisible('#sMenu.on'), 'Ⓑ geht zurück ins Menü');
// Training starten und auf der Bühne mit dem Controller spielen
await p.evaluate(() => document.querySelector('[data-m="new"]').click()); await p.click('#avaOk'); await p.waitForSelector('#sBack.on');
await p.evaluate(() => { window.SMYV.D.ROUNDS.forEach(r => { r.len = 12; }); });
await p.click('[data-b="train"]'); await p.waitForSelector('#sTrain.on'); await p.click('[data-t="rhythm"]');
await p.waitForSelector('#sStage.on', { timeout: 15000 });
await p.waitForFunction(() => { const s = window.SMYVApp.stageObj(); return s && s.notes && s.notes.length; }, null, { timeout: 15000 });
// Spuren über das Gamepad: X/A/Y/B müssen beim Auftritt ankommen
await p.evaluate(() => { const s = window.SMYVApp.stageObj(); window.__lanes = []; const o = s.press.bind(s); s.press = l => { window.__lanes.push(l); return o(l); }; });
for (const k of [X, A, Y, B]) await tap(k, 150);
const lanes = await p.evaluate(() => window.__lanes.join(''));
ok(lanes === '0123', 'Controller-Tasten X/A/Y/B spielen die Spuren 1–4 (' + lanes + ')');
await tap(START, 150); await p.waitForTimeout(400);
ok(await p.evaluate(() => window.SMYVApp.stageObj() && window.SMYVApp.stageObj().paused), 'Start pausiert den Auftritt');
await tap(START, 150); await p.waitForTimeout(400);
ok(await p.evaluate(() => !window.SMYVApp.stageObj().paused), 'Start setzt fort');
// TV: nichts ragt über den Rand
const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
ok(!over, 'TV-Ansicht 1920×1080 ohne waagrechtes Scrollen');
ok(!errs.length, 'Keine JS-Fehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
