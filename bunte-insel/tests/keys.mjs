/* Tastenbelegung am Computer + Menü-Einträge (Fernseher-Link / Handy-Controller). Aufruf: node bunte-insel/tests/keys.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 600 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.waitForTimeout(400);
ok(await p.evaluate(() => /Fernseher öffnen/.test(document.getElementById('bTv').textContent) && /Handy-Controller öffnen/.test(document.getElementById('bCtl').textContent)), 'Hauptmenü: „Spiel am Fernseher öffnen“ und „Handy-Controller öffnen“');
await p.evaluate(() => localStorage.setItem('bi-tv-last', 'WXYZ'));
const nav = p.waitForURL(/controller\.html\?c=WXYZ/, { timeout: 8000 }).then(() => true, () => false); await p.click('#bCtl'); ok(await nav, '„Handy-Controller öffnen“ ruft controller.html auf (mit gemerktem Code)');
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
/* Belegung: Aktion von E auf G legen */
const door = () => p.evaluate(() => { const d = BI.DOORS[0], P = __bi.P; __bi.innen.inside && __bi.innen.leave(); P.veh = null; P.x = d.x; P.z = d.z; P.y = __bi.W.groundY(d.x, d.z); });
await p.evaluate(() => { __bi.kb.assign('act', 'KeyG'); }); await door(); await p.waitForTimeout(300);
await p.keyboard.press('KeyE'); await p.waitForTimeout(400); const viaE = await p.evaluate(() => !!__bi.innen.inside);
await p.keyboard.press('KeyG'); await p.waitForTimeout(500); const viaG = await p.evaluate(() => !!__bi.innen.inside);
ok(!viaE && viaG, 'Aktion auf G gelegt: G betritt das Haus, E nicht mehr');
/* Tausch: Springen auf G → Aktion bekommt Space */
await p.evaluate(() => { __bi.kb.assign('jump', 'KeyG'); }); const m = await p.evaluate(() => ({ act: __bi.kb.bound.act, jump: __bi.kb.bound.jump })); ok(m.jump === 'KeyG' && m.act === 'Space', 'Belegt man eine bereits benutzte Taste, tauschen die Aktionen (' + m.act + ' / ' + m.jump + ')');
/* Fenster: Taste ändern per Klick */
await p.evaluate(() => { __bi.kb.reset(); __bi.kb.open(); }); await p.waitForTimeout(200);
await p.evaluate(() => { const b = [...document.querySelectorAll('div[style*="99997"] button')].find(x => x.getAttribute('aria-label') && x.getAttribute('aria-label').startsWith('✋')); b.click(); }); await p.keyboard.press('KeyT'); await p.waitForTimeout(200);
ok(await p.evaluate(() => __bi.kb.bound.act === 'KeyT' && localStorage.getItem('bi-keys').includes('KeyT')), 'Fenster: Taste anklicken, neue Taste drücken → gespeichert');
await p.evaluate(() => { __bi.kb.reset(); document.querySelector('div[style*="99997"]').remove(); __bi.kb.listening = null; });
ok(await p.evaluate(() => __bi.kb.isDefault() && localStorage.getItem('bi-keys') === '{}'), 'Zurücksetzen: Standardbelegung'); ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join('|'));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
