// SHOW ME YOUR VOICE – Mikro klappt in der Android-App nicht (NotReadableError): Hilfe nennt die App, „Ohne Mikrofon weiter“ startet die Bühne mit Tasten/Touch.
//   node show-me-your-voice/tests/nomic.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const c = await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, serviceWorkers: 'block',
  userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A546B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0 Mobile Safari/537.36' });
await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js|stream\.laut\.fm|api\.laut\.fm|itunes|lrclib|raw\.githubusercontent/, r => r.fulfill({ status: 503, body: '' }));
await c.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { const e = new Error('Could not start audio source'); e.name = 'NotReadableError'; throw e; }; });
const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
await p.goto(base); await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
await p.click('[data-m="new"]'); await p.waitForSelector('#sAvatar.on'); await p.fill('#avaName', 'Rico'); await p.click('#avaOk'); await p.waitForSelector('#sBack.on');
await p.evaluate(() => { window.SMYVApp.state().prep.how = 'sing'; });
await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on');
await p.click('#bGo'); await p.waitForSelector('#sTalk.on');
for (let i = 0; i < 6; i++) { if (await p.isVisible('#bStageGo')) break; await p.click('#talkQ [data-a="0"]'); }
await p.click('#bStageGo');
for (let k = 0; k < 60 && !(await p.isVisible('#sSing.on')); k++) { if (await p.isVisible('#ovBox [data-act="now"]')) await p.click('#ovBox [data-act="now"]'); await p.waitForTimeout(250); }
ok(await p.isVisible('#sSing.on'), 'Vorsingen offen');
await p.click('#singGo');
await p.waitForSelector('#ovBox [data-act="ok"]'); await p.click('#ovBox [data-act="ok"]');
await p.waitForSelector('#ovBox [data-act="retry"]'); await p.waitForTimeout(300);
const t = await p.textContent('#ovBox'); ok(/easygames-App konnte das Mikrofon nicht starten/.test(t), 'App-Hinweis statt „andere App“');
if (out) await p.screenshot({ path: out + '/app-mikro-hilfe.jpg', type: 'jpeg', quality: 80 });
await p.click('#ovBox [data-act="no"]');
await p.waitForSelector('#sStage.on', { timeout: 15000 }).catch(() => {});
ok(await p.isVisible('#sStage.on'), 'Ohne Mikrofon → Bühne mit Tasten/Touch startet');
await p.waitForTimeout(2500); if (out) await p.screenshot({ path: out + '/app-ohne-mikro-buehne.jpg', type: 'jpeg', quality: 80 });
ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
await b.close();
