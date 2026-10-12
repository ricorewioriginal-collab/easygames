/* Inselgeschichten: Start beim Betreten, Akte über Sticker (rückwirkend), Chip, Abschluss-Sticker, Aufgabenliste. Aufruf: node bunte-insel/tests/inselstory.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 600 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const r = await p.evaluate(async () => {
  const b = __bi, I = b.istory, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), ST = BI.INSELSTORY, until = async (f, ms) => { for (let i = 0; i < (ms || 9000) / 150 && !f(); i++) await sl(150); return f(); }, R0 = () => ST.find(d => d.key === 'RAETSEL');
  out.n = ST.length; const ids = new Set(b.kids.all().map(q => q[0])); out.known = ST.every(d => !!BI[d.key] && ids.has('geschichte_' + d.key.toLowerCase()) && d.acts.every(a => a.goal.every(id => ids.has(id))));
  const M = BI.RAETSEL; b.save.stk = []; P.veh = null; P.x = M.x + M.R * .5; P.z = M.z; P.y = 0; await until(() => I.dbg.stage(R0()) === 0); await sl(900);
  out.started = I.dbg.stage(R0()) === 0; out.goal = I.goal() && /Prüfung/.test(I.goal().title) && /Akt 1\/4/.test(I.goal().title); out.chip = /Prüfung der Uralten/.test(document.getElementById('questChip').textContent);
  b.save.stk = ['turm_s']; await until(() => I.dbg.stage(R0()) === 1); out.act2 = I.dbg.stage(ST.find(d => d.key === 'RAETSEL')) === 1 && /Akt 2/.test(I.goal().title);
  b.save.stk = ['turm_s', 'kapsel', 'schmied', 'hoehle']; await until(() => I.dbg.stage(R0()) === 3); out.retro = I.dbg.stage(ST.find(d => d.key === 'RAETSEL')) === 3;
  b.save.stk.push('titan'); await until(() => I.dbg.stage(R0()) === 4); out.done = I.dbg.stage(ST.find(d => d.key === 'RAETSEL')) === 4 && b.save.stk.includes('geschichte_raetsel');
  const l = I.log(); out.log = l.title.includes('Inselgeschichten') && l.rows.some(r => /Prüfung der Uralten/.test(r.text) && /geschafft/.test(r.text));
  /* rückwirkend still nachholen */
  const S2 = ST.find(d => d.key === 'SCHWAMM'); b.save.stk = ['stammgast', 'qualler', 'karate_s', 'plankton']; const Q = BI.SCHWAMM; P.x = Q.x + 5; P.z = Q.z; await until(() => I.dbg.stage(S2) === 3); out.quiet = I.dbg.stage(S2) === 3;
  out.book = b.buch.sections('loesung').some(s => s.id === 'geschichten' && s.blocks.some(x => x[0] === 'h'));
  return out;
});
ok(r.n >= 6 && r.known, r.n + ' Inselgeschichten; alle Ziele und Abschluss-Sticker existieren'); ok(r.started && r.goal && r.chip, 'Betreten der Rätsel-Insel startet Akt 1, Aufgaben-Chip zeigt „Die Prüfung der Uralten“'); ok(r.act2, 'Sticker geschafft → Akt 2');
ok(r.retro, 'Schon Geschafftes zählt rückwirkend'); ok(r.done, 'Letzter Akt → Geschichte fertig, Abschluss-Sticker'); ok(r.log, 'Aufgabenliste „Inselgeschichten“'); ok(r.quiet, 'Schwammi-Bucht: alles schon geschafft → still abgeschlossen'); ok(r.book, 'Lösungsbuch enthält die Inselgeschichten');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
