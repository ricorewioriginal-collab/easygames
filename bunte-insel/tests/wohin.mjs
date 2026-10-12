/* Browser-Test des 🧭-Menüs „Wohin möchtest du?“ (alle Ziele verlinkt, übersichtlich in Reitern).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/wohin.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const dbg = r => { if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); };
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);

/* ---------- Wohin-Menü ---------- */
{
  await p.click('#bGuide'); await p.waitForTimeout(400);
  const ui = await p.evaluate(() => { const tabs = [...document.querySelectorAll('#guideTabs .gtab')].map(b => b.textContent.trim()); return { tabs, rows: document.querySelectorAll('#guideGrid .grow').length, open: !document.getElementById('guidePanel').hidden }; });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(ui));
  ok(ui.open && ui.tabs.length === 5 && ui.rows > 8, 'Menü öffnet mit 5 Reitern (' + ui.tabs.join(' | ') + ') und Liste (' + ui.rows + ' Ziele im ersten Reiter)');
  /* jeder Reiter hat Einträge, jeder Eintrag zwei Knöpfe; alle Ziele zusammen = DEST + Spielautomaten */
  const all = {};
  for (let i = 0; i < 5; i++) { await p.click('#guideTabs .gtab:nth-child(' + (i + 1) + ')'); all[i] = await p.evaluate(() => [...document.querySelectorAll('#guideGrid .grow')].map(r => ({ n: r.querySelector('span').textContent, b: r.querySelectorAll('.gbtn button').length }))); }
  const flat = Object.values(all).flat(); ok(Object.values(all).every(a => a.length >= 3) && flat.every(r => r.b === 2), 'Jeder Reiter gefüllt, jeder Eintrag hat „Weg zeigen 👣“ und „Hinzaubern ✨“ (' + flat.length + ' Einträge)');
  const names = flat.map(r => r.n); const need = ['Freizeitpark', 'Fußball-Arena', 'Märchenland', 'Funkwelle', 'Zotik', 'Atlantis', 'Fellretter-Bucht', 'Regenbogenwelt', 'Bauland', 'Kino & Autokino', 'Spielplatz', 'Piratenschiff', 'Schatzmeister Piet', 'Fußball-Turnier', 'Wunschbrunnen', 'Schloss Sternenglanz', 'Park-Büro', 'Elfmeter', 'Sternschnuppen', 'Blasen-Pop', 'Noten-Fang'];
  const miss = need.filter(n => !names.some(x => x.includes(n))); ok(miss.length === 0, 'Alle Welten, Orte und Spiele sind verlinkt' + (miss.length ? ' – fehlt: ' + miss.join(', ') : ''));
  await p.click('#guideClose'); await p.waitForTimeout(200);
  /* jedes Ziel ist erreichbar: Zielpunkt endlich und begehbar nahe dran */
  const r = await p.evaluate(() => { const b = window.__bi, W = b.W, bad = []; const ids = new Set(); for (const d of b.DEST) { if (ids.has(d.id)) bad.push('doppelt ' + d.id); ids.add(d.id); let a; try { a = d.at(); } catch (e) { bad.push('Fehler ' + d.id); continue; } if (!a || !isFinite(a.x + a.z)) { bad.push('NaN ' + d.id); continue; } const q = W.resolve(a.x, a.z, .6, {}); if (Math.hypot(q.x - a.x, q.z - a.z) > 14) bad.push('weit ' + d.id + ' ' + Math.round(Math.hypot(q.x - a.x, q.z - a.z))); } return { n: b.DEST.length, bad, cats: b.DEST.every(d => ['inseln', 'haupt', 'spiele', 'orte', 'fahr'].includes(d.cat)) }; });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); ok(r.bad.length === 0 && r.cats, 'Alle ' + r.n + ' Ziele: eindeutig, Zielpunkt gültig und begehbar' + (r.bad.length ? ' – ' + r.bad.join('; ') : ''));
  /* Hinzaubern funktioniert (Beispiele) */
  const z = await p.evaluate(async () => { const b = window.__bi, out = []; const sl = ms => new Promise(r => setTimeout(r, ms)); return out; });
  for (const nm of ['Märchenland', 'Fußball-Turnier', 'Atlantis: die Stadt']) {
    await p.click('#bGuide'); await p.waitForTimeout(250);
    for (let i = 1; i <= 5; i++) { await p.click('#guideTabs .gtab:nth-child(' + i + ')'); const found = await p.evaluate(n => { const row = [...document.querySelectorAll('#guideGrid .grow')].find(r => r.querySelector('span').textContent.includes(n)); if (!row) return false; row.querySelectorAll('.gbtn button')[1].click(); return true; }, nm); if (found) break; }
    await p.waitForTimeout(nm.startsWith('Atlantis') ? 3500 : 600);
    const ok2 = await p.evaluate(n => { const b = window.__bi, d = b.DEST.find(x => x.name.includes(n)), a = d.at(); return Math.hypot(b.P.x - a.x, b.P.z - a.z) < 14 && !document.getElementById('guidePanel').hidden === false; }, nm); ok(ok2, 'Hinzaubern → ' + nm + ': Figur steht am Ziel, Menü schließt sich');
  }
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
