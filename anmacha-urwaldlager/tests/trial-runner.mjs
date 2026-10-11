/* Einzelne Prüfung im Browser starten (Playwright, Software-WebGL).
   Aufruf (Server auf Repo-Wurzel, Port 8080):  node tests/trial-runner.mjs <id> [bot 1|0] [d|m] [level 0-2] [short 0|1]
   Screenshots landen in $SHOT (Standard /tmp). Mit bot=1 spielt der eingebaute Testpilot der Prüfung. */
import { chromium } from 'playwright';
const [id = 'bruecke', botA = '1', dev = 'd', lv = '1', short = '0'] = process.argv.slice(2), bot = botA !== '0', SHOT = process.env.SHOT || '/tmp', BASE = process.env.BASE || 'http://localhost:8080/anmacha-urwaldlager';
const vp = dev === 'm' ? { viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true } : { viewport: { width: 1100, height: 650 } };
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext(vp)).newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(`${BASE}/index.html?trial=${id}${bot ? '&bot=1' : ''}&lv=${lv}${short === '1' ? '&short=1&max=3' : ''}`);
await p.waitForTimeout(1500); await p.screenshot({ path: `${SHOT}/${id}-intro.png` });
if (!bot) await p.click('[data-t="go"]');
await p.waitForTimeout(6000); await p.screenshot({ path: `${SHOT}/${id}-play.png` });
console.log('STATE', JSON.stringify(await p.evaluate(() => window.__ul.T.state())));
const t0 = Date.now(); let res = null; while (Date.now() - t0 < 180000) { res = await p.evaluate(() => window.__ul.last); if (res) break; await p.waitForTimeout(1000); }
console.log('RESULT', JSON.stringify(res)); console.log('PERF', await p.evaluate(() => JSON.stringify({ fps: +window.__ul.E.fps.toFixed(1), ...window.__ul.E.stats })));
await p.screenshot({ path: `${SHOT}/${id}-end.png` }); console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'NO ERRORS'); await b.close(); process.exit(errs.length || !res ? 1 : 0);
