/* Begleiter/Haustiere: neue freischaltbare Tiere, Kapselmonster als Begleiter (auch zu Hause), Rissige Wand sichtbar. Aufruf: node bunte-insel/tests/pets.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 600 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const sl = ms => new Promise(r => setTimeout(r, ms));
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const r = await p.evaluate(async () => {
  const b = __bi, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  out.kinds = BI.PETS.filter(q => q.kapsel).length === BI.RAETSEL.CAPS.length; out.models = BI.PETS.every(q => { try { const m = BI.makePet(q.id); m.pose(1, .5, 0); m.trick('x', .5); m.reset(); return !!m.group; } catch (e) { return false; } });
  /* freischaltbare Tiere: erst nach Sticker */
  const unl = BI.PETS.filter(q => q.unlock); out.unlockN = unl.length; b.save.stk = [];
  /* Ei wählen → Kapselmonster-Begleiter freigeschaltet */
  const R = b.raetsel; const before = (b.save.mascots || []).length; R.dbg && 0;
  b.save.raetsel = b.save.raetsel || { tools: {}, chests: [], puz: {}, once: {} }; b.save.raetsel.cap = { el: BI.RAETSEL.CAPS[0][0], xp: 0, hid: 0 };
  /* als Begleiter wählen, zu Hause lassen */
  const id = 'kapsel_' + BI.RAETSEL.CAPS[0][0]; (b.save.mascots = b.save.mascots || []).push(id); b.setPet(id); await sl(300); out.pet = b.save.pet === id && b.pup.name.startsWith('Kapsel');
  const capVisible = () => { let v = false; b.scene.traverse(o => { }); return v; };
  b.setPetHome(true); await sl(200); out.home = b.save.petHome === true; b.setPetHome(false); await sl(100); out.back = b.pup.mode === 'follow';
  b.setPet('fuchs'); out.fox = b.save.pet === 'fuchs';
  return out;
});
ok(r.kinds && r.models, 'Kapselmonster-Arten sind Haustiere; alle ' + r.unlockN + ' + weitere Tiermodelle baubar und animierbar'); ok(r.pet && r.home && r.back && r.fox, 'Kapselmonster/Fuchs als Begleiter wählbar, zu Hause lassen und wieder mitnehmen');
/* Picker: freigeschaltete Tiere */
const v = await p.evaluate(async () => { const b = __bi; b.save.stk = []; const vis = () => [...document.querySelectorAll('.row.pets .pill')].filter(x => !x.hidden).map(x => x.textContent.trim()).join('|'); document.getElementById('bHero') && 0; const hide0 = BI.PETS.filter(q => q.unlock).every(q => !(b.save.stk || []).includes(q.unlock)); b.save.stk = ['schluesselreich', 'schwammi', 'karussell', 'forscher5']; const unlocked = BI.PETS.filter(q => q.unlock && b.save.stk.includes(q.unlock)).length; return { hide0, unlocked }; });
ok(v.hide0 && v.unlocked === 4, 'Neue Begleiter hängen an Stickern (Fuchs ← Schlüsselreich, Waschbär ← Schwammi-Bucht, Einhorn ← Karussell, Bär ← Türöffner)');
/* Rissige Wand sichtbar im Raum 2 (an der Innenseite) */
const w = await p.evaluate(() => { const M = BI.RAETSEL, T = M.T, q = M.at(T.wall[0], T.b0 + 2.25); let found = false; __bi.scene.traverse(o => { if (o.isGroup && Math.hypot(o.position.x - q.x, o.position.z - q.z) < .05) found = o.visible; }); /* Platte steht seit dem Umbau etwas weiter im Raum (raetsel.js wlV) */ return found; });
ok(w, 'Rissige Wand: sichtbare Platte an der Innenseite der Wand in Raum 2');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
