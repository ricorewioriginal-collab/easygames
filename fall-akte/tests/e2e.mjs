// FALL·AKTE – Browser-Test (Playwright). node fall-akte/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch();
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'fall-akte/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/fa-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const G = FAApp.G, s = G.st; return { cur: FAApp.cur, mode: G.mode, view: G.view, loc: G.loc, found: s ? s.found.size : 0, solved: s ? s.solved.size : 0, left: s && s.left, wrong: s && s.wrong, done: s && s.done, ok: s && s.ok, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await wait(p, 150); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await wait(p, 300); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 300); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'worlds', '„Fälle lösen“ hat den Fokus');
await p.keyboard.press('ArrowDown'); ok(['daily', 'random', 'file'].includes(await p.evaluate(() => document.activeElement.dataset.go)), 'Pfeiltasten bewegen den Fokus');
await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter'); await wait(p, 300);
ok((await st(p)).cur === 'sWorlds' && (await p.locator('.world').count()) === 6, '6 Welten');
ok(await p.locator('.world.locked').count() === 5, 'Nur die erste Welt ist offen'); await shot(p, '04-welten');
// Fall 1 der Villa
await p.click('[data-w="0"][data-k="1"]'); await wait(p, 300);
let s = await st(p); ok(s.cur === 'sCase' && s.ov.includes('ovBrief'), 'Fall startet mit Fallbeschreibung'); await shot(p, '05-brief');
await p.click('#briefGo'); await wait(p, 200); await shot(p, '06-tatort');
const C = await p.evaluate(() => { const C = FAApp.G.C; return { clues: C.clues.map(c => ({ id: c.id, loc: c.loc, obj: c.obj, lab: c.lab, attr: c.attr, val: c.val, shift: c.shift })), culprit: C.culprit, n: C.n }; });
// leeren Gegenstand untersuchen
const empty = await p.evaluate(() => { const C = FAApp.G.C, L = FA_DATA.WORLDS[C.world].locs[0]; for (let i = 0; i < L.objs.length; i++) if (!C.clues.some(c => c.loc === 0 && c.obj === i)) return i; return -1; });
await p.click(`.hs[data-o="${empty}"]`); await wait(p, 600); ok((await p.textContent('#toast')).includes('🔍'), 'Leerer Gegenstand: Hinweis „nichts“');
// alle Spuren finden, Labor lösen
for (const c of C.clues) {
  await p.evaluate(l => { FAApp.G.loc = l; FAApp.render(); }, c.loc); await wait(p, 100);
  await p.click(`.hs[data-o="${c.obj}"]`); await p.waitForSelector('#ovFind:not([hidden])', { timeout: 3000 });
  if (!c.lab) { await p.click('#fOk'); continue; }
  await p.click('#fLab'); await p.waitForSelector('#ovLab:not([hidden])');
  if (c.lab === 'shoe') { await wait(p, 400); await shot(p, '07-labor-fuss'); const v0 = await p.evaluate(() => +document.querySelector('.dial b').textContent.replace(/\D/g, '')); const dir = v0 < c.val ? '#lPlus' : '#lMinus'; await p.click('#lOk'); ok((await p.textContent('#toast')).includes('Schablone'), 'Fußspur: falsch gemessen wird erkannt'); for (let k = 0; k < Math.abs(c.val - v0); k++) await p.click(dir); await p.click('#lOk'); }
  if (c.lab === 'print') { await wait(p, 400); await shot(p, '08-labor-finger'); await p.click(`[data-p="${c.val}"]`); }
  if (c.lab === 'cipher') { await wait(p, 400); await shot(p, '09-labor-code'); for (let k = 0; k < c.shift; k++) await p.click('#lPlus'); ok((await p.textContent('.code.plain')).length > 5, 'Code-Rad entschlüsselt'); await p.click('#lOk'); }
  if (c.lab === 'letter') {
    await wait(p, 400); await shot(p, '10-labor-brief');
    for (let guard = 0; guard < 40 && !(await p.isHidden('#ovLab')); guard++) {
      const S2 = await p.evaluate(() => ({ order: [...document.querySelectorAll('.puzzle [data-q] svg')].map(sv => { const v = sv.getAttribute('viewBox').split(' ').map(Number); return (v[1] / 150) * 2 + v[0] / 150; }), rot: [...document.querySelectorAll('.puzzle [data-q] span')].map(sp => /rotate\(0deg\)/.test(sp.style.transform)), sel: [...document.querySelectorAll('.puzzle [data-q]')].findIndex(x => x.classList.contains('sel')) }));
      const wp = S2.order.findIndex((v, i) => v !== i);
      if (wp >= 0) { if (S2.sel >= 0 && S2.sel !== wp) await p.click(`.puzzle [data-q="${S2.sel}"]`); if (S2.sel !== wp) await p.click(`.puzzle [data-q="${wp}"]`); await p.click(`.puzzle [data-q="${S2.order.indexOf(wp)}"]`); continue; }
      const rp = S2.rot.findIndex(r => !r); if (rp < 0) break;
      if (S2.sel !== rp) { if (S2.sel >= 0) await p.click(`.puzzle [data-q="${S2.sel}"]`); await p.click(`.puzzle [data-q="${rp}"]`); }
      await p.click('#lRot');
    }
    await p.waitForSelector('#ovLab', { state: 'hidden', timeout: 4000 }).catch(() => { });
  }
  await p.waitForSelector('#ovLab', { state: 'hidden', timeout: 4000 }).catch(() => { });
}
s = await st(p); ok(s.found === C.clues.length && s.solved === C.clues.filter(c => c.lab).length, 'Alle Spuren gefunden und im Labor gelöst (' + s.found + ')');
// Verhör
await p.keyboard.press('Digit2'); await wait(p, 200); ok((await st(p)).view === 'sus' && (await p.locator('.sus').count()) === C.n, 'Verdächtigen-Karten'); await shot(p, '11-verdaechtige');
await p.click('.sus[data-s="0"]'); await wait(p, 200); await shot(p, '12-verhoer');
const q0 = (await st(p)).left; const asked = await p.evaluate(() => { const b = document.querySelector('#susBody [data-a]:not([disabled])'); b.click(); return b.dataset.a; }); await wait(p, 200);
const q1 = (await st(p)).left, em = await p.textContent(`#susBody [data-a="${asked}"] em`); ok(q1 === q0 - 1 && em.trim() !== '?', 'Frage beantwortet, Budget sinkt (' + q0 + '→' + q1 + ', ' + em + ')');
await p.click('#susX');
// Hinweise abarbeiten, bis nur einer übrig ist
for (let k = 0; k < 30; k++) { const h = await p.evaluate(() => { const C = FAApp.G.C, st = FAApp.G.st; st.left = Math.max(st.left, 1); const h = FA.hint(C, st); st.hints--; if (h.k === 'ask') FA.ask(C, st, h.i, h.attr); return h.k; }); if (h !== 'ask') break; }
await p.keyboard.press('Digit3'); await wait(p, 200); ok((await p.textContent('#notes')).includes('Nur noch eine Person passt'), 'Notizbuch: nur noch eine Person passt'); await shot(p, '13-notizen');
// falsche Anklage, dann richtige
const wrong = (C.culprit + 1) % C.n;
await p.click('#bAccuse'); await wait(p, 200); await p.click(`#accPick [data-s="${wrong}"]`); await shot(p, '14-anklage'); await p.click('#accGo'); await wait(p, 300);
s = await st(p); ok(s.wrong === 1 && !s.done, 'Falsche Anklage kostet einen Versuch');
await p.click('#bAccuse'); await wait(p, 200); await p.click(`#accPick [data-s="${C.culprit}"]`); await p.click('#accGo');
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 4000 }); await wait(p, 300); await shot(p, '15-geloest');
s = await st(p); ok(s.ok && (await p.textContent('#endBody')).includes('GELÖST') && (await p.textContent('#endBody')).includes('Beweisführung'), 'Fall gelöst mit Beweisführung');
ok(await p.evaluate(() => +localStorage.getItem('fall-akte-highscore')) > 0, 'Highscore gespeichert');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('fall-akte-cases'))['0-1'].s > 0), 'Fall in der Akte gespeichert');
await p.click('#eNext'); await wait(p, 300); s = await st(p); ok(s.cur === 'sCase' && await p.evaluate(() => FAApp.G.k) === 0, 'Nächster Fall startet');
// Speichern & weiter ermitteln
await p.click('#briefGo'); await p.evaluate(() => { const c = FAApp.G.C.clues[0]; FAApp.G.loc = c.loc; FAApp.render(); });
await p.click(`.hs[data-o="${await p.evaluate(() => FAApp.G.C.clues[0].obj)}"]`); await p.waitForSelector('#ovFind:not([hidden])'); await p.keyboard.press('Escape');
await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await p.click('#pQuit'); await wait(p, 300);
ok(await p.isVisible('#tCont'), 'Menü zeigt „Weiter ermitteln“'); await p.click('#tCont'); await wait(p, 300);
s = await st(p); ok(s.cur === 'sCase' && s.found === 1, 'Fall mit Fundstück wiederhergestellt');
// Akte, Tagesfall
await p.evaluate(() => FAApp.toMenu()); await p.click('[data-go="file"]'); await wait(p, 200); ok((await p.textContent('#rankTxt')).includes('Rang'), 'Akte mit Rang'); await shot(p, '16-akte'); await p.click('#fileX');
await p.click('[data-go="daily"]'); await wait(p, 300); s = await st(p); ok(s.mode === 'daily' && s.cur === 'sCase', 'Tagesfall startet');
await b.close();

// Handy hochkant
const b2 = await chromium.launch();
const m = await (await b2.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' })).newPage();
m.on('pageerror', e => errs.push(e.message));
await m.goto(base + 'fall-akte/?case=0-0', { waitUntil: 'commit' }); await m.waitForSelector('#ovBrief:not([hidden])', { timeout: 15000 }); await wait(m, 300);
if (out) await m.screenshot({ path: out + '/fa-20-handy-brief.jpg', type: 'jpeg', quality: 80 });
await m.tap('#briefGo'); await wait(m, 300); if (out) await m.screenshot({ path: out + '/fa-21-handy-tatort.jpg', type: 'jpeg', quality: 80 });
const box = await m.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { w: r.width, h: r.height }; }); ok(box.w > 300 && box.h > 150, 'Handy: Tatort-Bild sichtbar (' + Math.round(box.w) + '×' + Math.round(box.h) + ')');
await m.tap('.tabs [data-v="sus"]'); await wait(m, 300); if (out) await m.screenshot({ path: out + '/fa-22-handy-verdaechtige.jpg', type: 'jpeg', quality: 80 });
await m.tap('.sus[data-s="1"]'); await wait(m, 300); if (out) await m.screenshot({ path: out + '/fa-23-handy-verhoer.jpg', type: 'jpeg', quality: 80 });
ok(await m.isVisible('#ovSus'), 'Handy: Verhör öffnet');
await b2.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
