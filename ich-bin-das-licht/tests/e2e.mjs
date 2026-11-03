// Ich bin das Licht – Durchlauf im Browser: Geschichte komplett, Garderobe, Bühne (Beat), Buch lesen.
// Server im Hauptordner starten (python3 -m http.server 8765), dann: node ich-bin-das-licht/tests/e2e.mjs
import { chromium } from 'playwright';
const base = process.env.EG_URL || 'http://localhost:8765/ich-bin-das-licht/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 800, height: 450 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/youtube|google|firebase|ERR_|Failed to load/i.test(m.text())) errs.push(m.text()); });
await p.addInitScript(() => localStorage.setItem('ibdl-save', JSON.stringify({ opt: { quality: 'spar', sfx: false } })));
await p.goto(base); await p.waitForSelector('#sTitle.on', { timeout: 240000 });
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
// Geschichte: immer die erste Antwort / Enter, Garderobe fertig, Bühne ohne Video und sofort beenden
await p.click('[data-go=story]');
for (let guard = 0; guard < 400; guard++) {
  const scr = await p.evaluate(() => document.querySelector('.scr.on').id);
  if (scr === 'sEnd') break;
  if (scr === 'sStory') {
    const ph = await p.evaluate(() => IBDLApp.story.phase);
    if (ph === 'explore') { await p.keyboard.down('KeyW'); await p.waitForTimeout(400); await p.keyboard.up('KeyW'); await p.evaluate(() => IBDLApp.reachGoal()); await p.waitForTimeout(600); }
    else if (ph === 'busy') await p.waitForTimeout(300);
    else { const ch = await p.$('#choices .chip'); if (ch) await ch.click(); else await p.click('#talk'); }
  }
  else if (scr === 'sStudio') { await p.click('[aria-label="Perücke weiter"]'); await p.click('#bStudioDone'); }
  else if (scr === 'sSong') await p.click('#bBeat');
  else if (scr === 'sShow') { await p.waitForTimeout(1500); await p.evaluate(() => { const A = IBDLApp; const r = A.run; if (r) { for (const n of r.show.notes.slice(0, 20)) IBDL.press(r.show, n.lane, n.t); A.finishShow(); } }); }
  else if (scr === 'sResult') await p.click('#bResNext');
  await p.waitForTimeout(250);
}
const end = await p.evaluate(() => [document.querySelector('.scr.on').id, document.getElementById('endTitle').textContent, document.getElementById('endLight').textContent]);
console.log('Ende:', end.join(' | '));
if (end[0] !== 'sEnd') errs.push('Geschichte nicht beendet');
// Buch lesen
await p.click('#bEndMenu'); await p.waitForSelector('#sMenu.on'); await p.click('[data-go=read]');
await p.waitForFunction(() => document.querySelectorAll('#page p').length > 20, null, { timeout: 15000 });
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
const rd = await p.evaluate(() => document.getElementById('rLbl').textContent);
console.log('Lesen:', rd); if (!/Kapitel 2/.test(rd)) errs.push('Kapitelwechsel im Buch fehlgeschlagen');
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'OK');
await b.close(); process.exit(errs.length ? 1 : 0);
