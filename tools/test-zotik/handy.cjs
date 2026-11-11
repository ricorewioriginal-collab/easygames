// Zotik am Handy (Touch) + Spielstand speichern/laden + alter Spielstand
const { chromium, ARGS, open, state, shot } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); let n = 0, okc = 0; const ok = (name, pass, info) => { n++; if (pass) okc++; console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  const p = await open(b, { ctx: { viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true } }); const w = ms => p.waitForTimeout(ms);
  const tap = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2, q.width]; }, sel); if (!r || !r[2]) return false; await p.touchscreen.tap(r[0], r[1]); await w(300); return true; };
  await p.touchscreen.tap(400, 200); await p.waitForFunction(() => !document.getElementById('tmenu').hidden, null, { timeout: 60000 }); await w(300);
  await tap('#bNew'); ok('Neues Spiel', (await state(p)).slots); await tap('#slL .slot'); ok('Speicherplatz', (await state(p)).creator); await tap('#crGo'); ok('Start', (await state(p)).mode === 'play');
  await w(4300); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await tap('#dlg'); await w(1500); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await tap('#dlg'); ok('Dialoge antippen', !(await state(p)).dlg);
  ok('Touch-Oberfläche, keine Fernbedienung', await p.evaluate(() => document.body.classList.contains('touch') && !document.body.classList.contains('remote')));
  const p0 = await p.evaluate(() => [__zotik.pl.x, __zotik.pl.z]); const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 300 }] }); await w(100); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 150, y: 230 }] }); await w(1200); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await w(200);
  const p1 = await p.evaluate(() => [__zotik.pl.x, __zotik.pl.z]); ok('Stick: laufen', Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 1, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]).toFixed(1));
  await tap('#bAtk'); ok('Angriff-Knopf', await p.evaluate(() => __zotik.pl.sheath > 0));
  await w(700); const mp0 = await p.evaluate(() => __zotik.S().mp); await p.evaluate(() => { const b = [...document.querySelectorAll('#deck button')].find(x => /Magie/.test(x.textContent)); window.__r = b.getBoundingClientRect(); }); const r = await p.evaluate(() => [__r.left + __r.width / 2, __r.top + __r.height / 2]); await p.touchscreen.tap(r[0], r[1]); await w(300);
  const r2 = await p.evaluate(() => { const b = [...document.querySelectorAll('#deck button')].find(x => /Funkenwirbel/.test(x.textContent)); if (!b) return null; const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }); if (r2) { await p.touchscreen.tap(r2[0], r2[1]); await w(300); }
  ok('Kommandomenü antippen: Magie', await p.evaluate(m => __zotik.S().mp < m - 5, mp0));
  await p.evaluate(() => { const Z = __zotik, m = Z.NPC.find(n => n.id === 'mira'); Z.pl.x = m.x + 1.6; Z.pl.z = m.z + .4; }); await w(600); await tap('#bUse'); ok('Aktion: sprechen', (await state(p)).dlg); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await tap('#dlg');
  await tap('#menuBtn'); ok('Menü', (await state(p)).menu); await p.evaluate(() => { [...document.querySelectorAll('#tabs button')].find(b => /Steuerung/.test(b.textContent)).click(); }); await w(200); await shot(p, 'handy-hilfe'); await tap('#saveBtn'); await tap('#mResume'); ok('Menü zu', !(await state(p)).menu);
  // Speichern → neu laden → identischer Stand
  const s0 = await p.evaluate(() => { const S = __zotik.S(); S.shards = 77; S.cnt = { brk: 3 }; __zotik.toggleMenu(true); document.getElementById('saveBtn').click(); __zotik.toggleMenu(false); return JSON.stringify([S.stage, S.shards, S.lvl]); });
  await p.evaluate(() => { const j = JSON.parse(localStorage.getItem('zotik2_save_slot1')); delete j.cnt.rad; delete j.home; delete j.items; localStorage.setItem('zotik2_save_slot1', JSON.stringify(j)); });   // alter Stand ohne neuere Felder
  await p.reload({ waitUntil: 'commit' }); await p.waitForFunction(() => window.__zotik, null, { timeout: 120000 }); await p.evaluate(() => { __zotik.noRender = true; }); await p.touchscreen.tap(400, 200); await p.waitForFunction(() => !document.getElementById('tmenu').hidden, null, { timeout: 60000 }); await w(300);
  await tap('#bLoad'); await tap('#slL .slot'); await w(800); const s1 = await p.evaluate(() => { const S = __zotik.S(); return JSON.stringify([S.stage, S.shards, S.lvl]) + ' cnt=' + JSON.stringify(S.cnt) + ' home=' + !!S.home + ' items=' + JSON.stringify(S.items); });
  ok('Laden: gleicher Stand, fehlende Felder ergänzt', s1.startsWith(s0) && /"rad":0/.test(s1) && /home=true/.test(s1) && /ether/.test(s1), s1);
  // Tod → Wiedererwachen
  await p.evaluate(() => { __zotik.hurtP(99999, 0, 0); }); await w(2500); ok('Nach K.O. wieder im Dorf', await p.evaluate(() => !__zotik.pl.dead && __zotik.S().hp > 0));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${okc}/${n} bestanden`); await b.close(); })().catch(e => { console.error('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
