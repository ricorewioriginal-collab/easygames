// Werwolf-Nacht – Browser-Test Solo (Playwright). node werwolf-nacht/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'werwolf-nacht/', out = process.argv[3] || '';
const b = await chromium.launch();
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/ww-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const st = p => p.evaluate(() => { const A = WWApp.A, g = A.G; return { cur: WWApp.cur, ph: A.phase, day: g && g.day, over: g && g.over, pend: A.pend ? { q: A.pend.spec.q, t: A.pend.targets, o: (A.pend.spec.opts || []).map(o => o.v) } : null, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
async function autoplay(p, pickVote, shots) {
  const seen = new Set();
  for (let i = 0; i < 600; i++) {
    const s = await st(p); if (s.ov.includes('ovEnd')) return s;
    if (s.pend) {
      if (shots && !seen.has(s.ph)) { seen.add(s.ph); await p.waitForTimeout(250); await shot(p, shots + '-' + s.ph); }
      let v; if (s.pend.o.includes(3)) v = 3; else if (s.pend.t && s.pend.t.length) v = pickVote ? pickVote(s) : s.pend.t[0]; else v = s.pend.o[0];
      await p.evaluate(v => WWApp.answer(v), v);
    }
    await p.waitForTimeout(80);
  }
  return st(p);
}
const p = await (await b.newContext({ viewport: { width: 1280, height: 760 }, serviceWorkers: 'block' })).newPage();
p.on('pageerror', e => errs.push(e.message));
await p.goto(base, { waitUntil: 'commit' }); await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(300); await shot(p, '01-titel');
await p.keyboard.press('Enter'); await p.waitForTimeout(300); ok((await st(p)).cur === 'sMenu', 'Titel → Menü'); await shot(p, '02-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'solo', '„Solo spielen“ hat den Fokus');
ok((await p.textContent('.tile.online')).includes('🌐') && (await p.textContent('.tile.online')).includes('Online'), '🌐 Online im Menü');
await p.click('[data-go="roles"]'); await p.waitForTimeout(200); ok((await p.locator('#rolesList > div').count()) === 6, '6 Rollen erklärt'); await p.click('#rolesX');
await p.click('[data-go="solo"]'); await p.fill('#soName', 'Mia'); await p.click('[data-n="8"]'); await p.click('[data-r="seer"]'); await shot(p, '03-solo');
await p.evaluate(() => { WWApp.A.speed = .06; }); await p.click('#soGo'); await p.waitForTimeout(300);
let s = await st(p); ok(s.cur === 'sGame' && s.ov.includes('ovRole') && (await p.textContent('#roleBody')).includes('Seherin'), 'Geheime Rolle: Seherin'); await shot(p, '04-rolle');
await p.click('#roleX');
// Seherin: Nacht-Aufgabe per Klick auf eine Figur
await p.waitForFunction(() => WWApp.A.pend && /Seele/.test(WWApp.A.pend.spec.q), null, { timeout: 20000 });
await shot(p, '05-nacht-seherin');
const tgt = await p.evaluate(() => WWApp.A.pend.targets[0]); await p.click(`.pl[data-id="${tgt}"]`, { force: true }); await p.click('#ask .btn.pri');
await p.waitForTimeout(200); ok(await p.evaluate(t => WWApp.A.seenMe[t] !== undefined, tgt), 'Seherin sieht ein Ergebnis');
// Tag: jemanden verdächtigen
await p.waitForFunction(() => WWApp.A.pend && WWApp.A.phase === 'day', null, { timeout: 30000 });
await shot(p, '06-tag'); await p.click('#ask [data-v="1"]'); await p.waitForFunction(() => WWApp.A.pend && WWApp.A.pend.targets);
const acc = await p.evaluate(() => WWApp.A.pend.targets[0]); await p.click(`.pl[data-id="${acc}"]`, { force: true }); await p.click('#ask .btn.pri');
await p.waitForTimeout(500); ok((await p.textContent('#feed')).includes('Du:'), 'Verdächtigung erscheint im Dorf-Gespräch');
s = await autoplay(p, null, '07');
ok(s.ov.includes('ovEnd') && !!s.over, 'Solo-Spiel endet: ' + s.over + ' nach ' + s.day + ' Tagen');
await p.waitForTimeout(300); await shot(p, '08-ende');
ok((await p.locator('.reveal > div').count()) === 8, 'Alle Rollen werden aufgedeckt');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('werwolf-nacht-stats')).games) === 1, 'Statistik gespeichert');
await p.click('#eMenu'); await p.waitForTimeout(200); ok((await st(p)).cur === 'sMenu', 'Zurück ins Menü');
await p.click('[data-go="rec"]'); await p.waitForTimeout(150); await shot(p, '09-rekorde'); await p.click('#recX');
// Als Werwolf
await p.click('[data-go="solo"]'); await p.click('[data-n="6"]'); await p.click('[data-r="wolf"]'); await p.evaluate(() => { WWApp.A.speed = .06; }); await p.click('#soGo'); await p.click('#roleX');
await p.waitForFunction(() => WWApp.A.pend && /fresst/.test(WWApp.A.pend.spec.q), null, { timeout: 20000 }); ok(true, 'Werwolf wählt nachts ein Opfer'); await shot(p, '10-werwolf');
s = await autoplay(p); ok(!!s.over, 'Werwolf-Spiel endet: ' + s.over);
await b.close();
// Handy hochkant
const b2 = await chromium.launch(); const m = await (await b2.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' })).newPage();
m.on('pageerror', e => errs.push(e.message));
await m.goto(base + '?mode=solo', { waitUntil: 'commit' }); await m.waitForSelector('#ovRole:not([hidden])', { timeout: 15000 }); await m.evaluate(() => { WWApp.A.speed = .06; });
if (out) await m.screenshot({ path: out + '/ww-20-handy-rolle.jpg', type: 'jpeg', quality: 80 }); await m.tap('#roleX');
await m.waitForFunction(() => WWApp.A.phase === 'day' && WWApp.A.pend, null, { timeout: 40000 }).catch(() => { });
await m.waitForTimeout(300); if (out) await m.screenshot({ path: out + '/ww-21-handy-tag.jpg', type: 'jpeg', quality: 80 });
const inView = await m.evaluate(() => [...document.querySelectorAll('.pl')].every(e => { const r = e.getBoundingClientRect(); return r.left > -30 && r.right < innerWidth + 30 && r.top > 0; }));
ok(inView, 'Handy: alle Figuren im Bild');
await b2.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
