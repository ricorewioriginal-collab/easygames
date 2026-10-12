/* Handbuch/Lösungsbuch, Geheimcodes, Fehler melden, Story-Automatik für neue Welten. Aufruf: node bunte-insel/tests/buch.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const sl = ms => new Promise(r => setTimeout(r, ms));
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 });
/* Hauptmenü hat Buch + Fehler melden */
ok(await p.evaluate(() => !!document.getElementById('bBuchM') && !!document.getElementById('bBugM')), 'Hauptmenü: Handbuch und Fehler melden');
await p.click('#bStart'); await p.waitForTimeout(600);
/* 1. Buch im Spiel */
await p.evaluate(() => document.getElementById('bBuch').click()); await sl(300);
const b1 = await p.evaluate(() => { const r = document.getElementById('buch'); return { open: !!r, secs: r && r.querySelectorAll('.ct h3').length, toc: r && r.querySelectorAll('.toc button').length, scroll: r && r.querySelector('.ct').scrollHeight > r.querySelector('.ct').clientHeight, text: r && r.textContent, busy: __bi.buch.open }; });
ok(b1.open && b1.secs >= 12 && b1.toc === b1.secs && b1.scroll, 'Handbuch öffnet: ' + b1.secs + ' Kapitel, Inhaltsverzeichnis, scrollbar');
ok(/Tastatur/.test(b1.text) && /Story-Modus/.test(b1.text) && /Fernseher/.test(b1.text), 'Handbuch erklärt Steuerung, Story-Modus, Fernseher');
const names = await p.evaluate(() => BI.STORY_ISLES.map(d => d.name)); ok(names.every(n => b1.text.includes(n)), 'Handbuch „Die Welten“ nennt alle ' + names.length + ' Welten automatisch');
await p.evaluate(() => document.querySelector('#buch [data-t=loesung]').click()); await sl(200);
const b2 = await p.evaluate(() => { const t = document.getElementById('buch').textContent, n = __bi.buch.sections('loesung').find(s => s.id === 'sticker').blocks.find(b => b[0] === 'tbl')[1].length; return { t, n, all: document.querySelectorAll('#buch table tr').length }; });
ok(/Rätsel-Insel/.test(b2.t) && /Schlüsselreich/.test(b2.t) && /Block/.test(b2.t) && /Geheimcodes/.test(b2.t), 'Lösungsbuch: Rätsel-Insel (Block), Schlüsselreich, Geheimcodes');
const nst = await p.evaluate(() => __bi.kb && BI.BUCH && document.querySelectorAll('#buch').length); ok(b2.n >= 100, 'Lösungsbuch listet alle Sticker (' + b2.n + ') mit Aufgabe');
await p.fill('#buch input', 'Enterhaken'); await sl(200); ok(await p.evaluate(() => { const h = [...document.querySelectorAll('#buch .ct h3')].map(e => e.textContent); return h.length >= 1 && h.length < 8; }), 'Suche filtert Kapitel');
await p.keyboard.press('Escape'); await sl(200); ok(await p.evaluate(() => !document.getElementById('buch') && !__bi.buch.open), 'Esc schließt das Buch');
const md = await p.evaluate(() => ({ h: __bi.buch.toMarkdown('handbuch').length, l: __bi.buch.toMarkdown('loesung').length })); ok(md.h > 8000 && md.l > 8000, 'Markdown-Export für docs/ (' + md.h + ' / ' + md.l + ' Zeichen)');
/* docs/ aktuell? */
{ const fs = await import('fs'); const D = new URL('../docs/', import.meta.url).pathname; const cur = await p.evaluate(() => ({ h: __bi.buch.toMarkdown('handbuch'), l: __bi.buch.toMarkdown('loesung'), c: BI.CHEATS.length }));
  ok(fs.readFileSync(D + 'HANDBUCH.md', 'utf8') === cur.h && fs.readFileSync(D + 'LOESUNGSBUCH.md', 'utf8') === cur.l, 'docs/HANDBUCH.md und docs/LOESUNGSBUCH.md sind aktuell (sonst: node bunte-insel/tools/gen-docs.mjs)'); ok(fs.readFileSync(D + 'CHEATS.md', 'utf8').split('\n').filter(x => x.startsWith('| `')).length === cur.c, 'docs/CHEATS.md enthält alle Codes'); }
/* 2. Cheats */
const c = await p.evaluate(async () => {
  const b = __bi, C = b.cheats, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  out.bad = !C.redeem('Quatsch123').ok; out.norm = C.dbg.norm('Unendliche-Sterne ä') === 'UNENDLICHESTERNEAE';
  const s0 = b.save.stars; C.redeem('sternenregen'); out.regen = b.save.stars === s0 + 500;
  C.redeem('unendlich sterne'); await sl(300); out.inf = b.save.stars === 999999; b.save.stars = 5; await sl(300); out.inf2 = b.save.stars === 999999; C.redeem('UNENDLICHSTERNE'); out.infOff = !C.inf();
  C.redeem('Fliegen'); P.veh = null; P.x = 0; P.z = 60; P.y = 0; await sl(300); const y0 = P.y; for (let i = 0; i < 4; i++) { b.P.jbuf = .14; await sl(180); } out.fly = P.y > y0 + 2; C.redeem('fliegen'); out.flyOff = !C.fly();
  C.redeem('RAKETENSCHUH'); out.speed = C.speedMul() === 2; C.redeem('RAKETENSCHUH'); C.redeem('RIESE'); await sl(900); out.giant = Math.abs(b.G_char ? 0 : 0) === 0 && C.size() === 2; C.redeem('ZWERG'); out.swap = C.size() === .5 && !C.dbg.S().on.RIESE; C.redeem('ALLESAUS'); out.off = C.active().length === 0;
  C.redeem('UNSTERBLICH'); const hp0 = b.combat ? 0 : 0; out.god = C.god(); C.redeem('UNSTERBLICH');
  b.smode.setMode('story'); await sl(300); const locked0 = b.smode.dbg.list.filter(I => I.lock.on).length; C.redeem('ALLESFREI'); await sl(1000);
  out.all = { stk: b.save.stk.length >= 100, locked0, locked1: b.smode.dbg.list.filter(I => I.lock.on).length, story: b.save.story.c >= 9, open: b.save.cheat.open };
  return out;
});
ok(c.bad && c.norm, 'Unbekannter Code wird abgelehnt, Eingabe wird normalisiert (Umlaute, Leerzeichen)'); ok(c.regen, 'STERNENREGEN: +500 Sterne'); ok(c.inf && c.inf2 && c.infOff, 'UNENDLICHSTERNE: Vorrat immer voll, nochmal = aus');
ok(c.fly && c.flyOff, 'FLIEGEN: Flugmodus (Special) steigt, nochmal = aus'); ok(c.speed && c.giant && c.swap && c.off, 'RAKETENSCHUH / RIESE / ZWERG / ALLESAUS'); ok(c.god, 'UNSTERBLICH aktivierbar');
ok(c.all.stk && c.all.locked0 === 15 && c.all.locked1 === 0 && c.all.story && c.all.open, 'ALLESFREI: alle Sticker, Inselreise fertig, alle 15 Welten offen (' + c.all.locked0 + ' → ' + c.all.locked1 + ')');
/* Eingabefenster + Combat-Unsterblich */
await p.evaluate(() => document.getElementById('bCode').click()); await sl(300); const hasInput = await p.evaluate(() => !!document.querySelector('input[aria-label=Code]')); await p.fill('input[aria-label=Code]', 'zwerg'); await p.keyboard.press('Enter'); await sl(300);
ok(hasInput && await p.evaluate(() => __bi.cheats.size() === .5 && /Aktiv/.test(document.body.textContent)), 'Code-Fenster: Eingabe + Enter löst ein, zeigt aktive Specials'); await p.evaluate(() => { __bi.cheats.closePanel(); __bi.cheats.redeem('ALLESAUS'); });
const g = await p.evaluate(() => { const C = __bi.cheats; C.redeem('UNSTERBLICH'); const co = __bi.combat; co.dbg.hurt && co.dbg.hurt(5); const hp = co.dbg.hp; C.redeem('UNSTERBLICH'); return { hp }; }); ok(g.hp > 0, 'UNSTERBLICH: Treffer ohne Wirkung (hp ' + g.hp + ')');
/* 3. Fehler melden */
await p.evaluate(() => { window.dispatchEvent(new ErrorEvent('error', { message: 'Testfehler-XYZ', filename: 'main.js', lineno: 7 })); }); await sl(200);
await p.evaluate(() => document.getElementById('bBug').click()); await sl(300); await p.fill('#bgText', 'Beim Test hängt etwas'); 
const bug = await p.evaluate(() => ({ mail: __bi.bugs.mailto('Fehler', 'Beim Test hängt etwas'), info: document.getElementById('bgInfo').textContent, rep: __bi.bugs.report('Idee', 'x') }));
ok(bug.mail.startsWith('mailto:ricorewioriginal@gmail.com?subject=') && decodeURIComponent(bug.mail).includes('Beim Test hängt etwas'), 'Fehler melden: Mail an ricorewioriginal@gmail.com mit Text'); ok(/Version:/.test(bug.info) && /Modus:/.test(bug.info) && /Testfehler-XYZ/.test(bug.info) && /Browser:/.test(bug.rep), 'Bericht enthält Version, Modus, Gerät und den letzten Fehler');
await p.click('#bgX'); await sl(200); ok(await p.evaluate(() => !__bi.bugs.open), 'Fenster schließt');
/* 4. Story-Automatik für neue Welten */
const a = await p.evaluate(() => { BI.NEUINSEL = { x: 700, z: 120, R: 40, bridge: { mx: 0 }, entry: { x: 0, z: 0 }, name: 'Neue Insel' }; const sm = BI.createStoryMode({ stickerIds: () => __bi.buch && BI.STORY_ISLES.length ? Array.from({ length: 200 }, (_, i) => 'x' + i).concat(['ride']) : [], scene: new THREE.Scene(), W: { lock: [] }, A: {}, fx: {}, P: __bi.P, save: { mode: 'story', stk: [] }, say() { }, persist() { }, info: () => null }); const L = sm.islands(); const N = L.find(I => I.key === 'NEUINSEL'); return { n: L.length, N: !!N && N.auto && N.req.length === 3 && N.name === 'Neue Insel', keep: L.filter(I => !I.auto).length }; });
ok(a.n === 16 && a.N, 'Story erkennt eine NEUE Welt automatisch (gesperrt, 3 Aufgaben, Name) – 15 + 1'); await p.evaluate(() => { BI.STORY_ISLES = BI.STORY_ISLES.filter(d => d.key !== 'NEUINSEL'); delete BI.NEUINSEL; });
{ const e2 = errs.filter(e => !/Testfehler/.test(e)); ok(e2.length === 0, 'keine JS-Fehler ' + e2.slice(0, 3).join(' | ')); }
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
