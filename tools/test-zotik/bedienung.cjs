// Zotik: Bedienung je Gerät – Tastatur ohne Maus, TV-Fernbedienung (Pfeile + OK + Zurück), Controller
const { chromium, ARGS, open, state, shot } = require('./lib.cjs');
const only = process.argv[2] || '';
(async () => { const b = await chromium.launch({ args: ARGS }); const res = [];
  const ok = (kind, name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${kind} · ${name}${info ? ' · ' + info : ''}`); };
  for (const kind of ['tastatur', 'fernbedienung', 'controller']) { if (only && only !== kind) continue;
    const p = await open(b, { q: kind === 'fernbedienung' ? '&tv=1' : '', ctx: { viewport: { width: 960, height: 540 } } }); const w = ms => p.waitForTimeout(ms);
    const BTN = { Enter: 0, Escape: 1, ArrowUp: 12, ArrowDown: 13, Backspace: 14, Start: 9 };
    if (kind === 'controller') { await p.evaluate(() => { window.__padOn = true; window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })); }); await w(400); }
    const key = async (k, wt = 180) => { if (kind !== 'controller') await p.keyboard.press(k === 'Start' ? 'Escape' : k); else { const i = BTN[k]; if (i === undefined) { await p.evaluate(k => { const a = __pad.axes; if (k === 'ArrowLeft') a[0] = -1; if (k === 'ArrowRight') a[0] = 1; }, k); await w(160); await p.evaluate(() => { __pad.axes[0] = 0; }); } else { await p.evaluate(i => __press(i, true), i); await w(110); await p.evaluate(i => __press(i, false), i); } } await w(wt); };
    // Titel → Neues Spiel → Speicherplatz → Figur → Spiel
    await key('Enter', 300); await p.waitForFunction(() => !document.getElementById('tmenu').hidden, null, { timeout: 60000 }); await w(300);
    await key('Enter', 500); let s = await state(p); ok(kind, 'Neues Spiel öffnet die Speicherplätze', s.slots);
    for (let i = 0; i < 4 && !(s = await state(p)).creator; i++) await key(i % 2 ? 'Enter' : 'ArrowDown', 400);
    if (!s.creator) { await key('Enter', 400); s = await state(p); }
    ok(kind, 'Speicherplatz wählbar', s.creator, 'Fokus ' + s.focus);
    for (let i = 0; i < 4 && (s = await state(p)).mode !== 'play'; i++) await key(i ? 'Enter' : 'ArrowDown', 500);
    ok(kind, 'Abenteuer beginnen', s.mode === 'play', 'Fokus ' + s.focus);
    if (s.mode !== 'play') { await p.evaluate(() => { document.getElementById('creator').hidden = true; document.getElementById('slots').hidden = true; __zotik.startDbg(); }); }
    await w(4200); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await key('Enter', 160);
    await w(1500); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await key('Enter', 160);
    ok(kind, 'Dialoge weiterschalten', !(await state(p)).dlg);
    // Laufen
    const pos0 = await p.evaluate(() => [__zotik.pl.x, __zotik.pl.z]);
    if (kind === 'tastatur') { await p.keyboard.down('KeyW'); await w(1200); await p.keyboard.up('KeyW'); } else if (kind === 'fernbedienung') { await p.keyboard.down('ArrowUp'); await w(1200); await p.keyboard.up('ArrowUp'); } else { await p.evaluate(() => { __pad.axes[1] = -1; }); await w(1200); await p.evaluate(() => { __pad.axes[1] = 0; }); }
    const pos1 = await p.evaluate(() => [__zotik.pl.x, __zotik.pl.z]); ok(kind, 'Laufen', Math.hypot(pos1[0] - pos0[0], pos1[1] - pos0[1]) > .5, 'Weg ' + Math.hypot(pos1[0] - pos0[0], pos1[1] - pos0[1]).toFixed(1));
    // Angriff
    await p.evaluate(() => { window.__atk = 0; const Z = __zotik; const o = Z.startAttack; }); const a0 = await p.evaluate(() => __zotik.pl.atk); await key(kind === 'tastatur' ? 'KeyJ' : 'Enter', 60); const a1 = await p.evaluate(() => __zotik.pl.atk + '/' + __zotik.pl.sheath.toFixed(1)); ok(kind, 'Angriff', !/^-1\/0\.0/.test(a1), a1);
    // Kommandomenü: Magie → Funkenwirbel
    await w(700); const mp0 = await p.evaluate(() => __zotik.S().mp);
    if (kind === 'fernbedienung') { await key('Backspace'); await key('ArrowDown'); await key('ArrowDown'); await key('Enter'); await key('Enter'); } else if (kind === 'tastatur') { await key('ArrowDown'); await key('ArrowDown'); await key('Enter'); await key('Enter'); } else { await key('ArrowDown'); await key('ArrowDown'); await key('Enter'); await key('Enter'); }
    const mp1 = await p.evaluate(() => __zotik.S().mp); ok(kind, 'Kommandomenü: Magie einsetzen', mp1 < mp0 - 5, `MP ${mp0.toFixed(0)} → ${mp1.toFixed(0)}`);
    // Sprechen mit Mira
    await p.evaluate(() => { const Z = __zotik, m = Z.NPC.find(n => n.id === 'mira'); Z.pl.x = m.x + 1.6; Z.pl.z = m.z + .4; }); await w(700);
    if (kind !== 'controller') await key(kind === 'tastatur' ? 'KeyE' : 'Enter', 400); s = await state(p);
    if (kind === 'controller') { await p.evaluate(() => __press(3, true)); await w(120); await p.evaluate(() => __press(3, false)); await w(400); s = await state(p); }
    ok(kind, 'Ansprechen', s.dlg); for (let i = 0; i < 30 && (await state(p)).dlg; i++) await key('Enter', 160);
    // Menü öffnen, Reiter wechseln, schließen
    if (kind === 'fernbedienung') { await key('Backspace'); await key('ArrowUp'); await key('Enter', 500); } else await key('Start', 500);
    s = await state(p); ok(kind, 'Menü öffnen', s.menu);
    const tabs = new Set(); for (let i = 0; i < 8; i++) { await key('ArrowDown', 220); tabs.add((await state(p)).tab); } ok(kind, 'Menü-Reiter wechseln', tabs.size >= 6, [...tabs].length + ' Reiter');
    if (kind === 'tastatur') await shot(p, 'nav-menu');
    await key(kind === 'fernbedienung' ? 'Backspace' : 'Escape', 500); s = await state(p); ok(kind, 'Menü schließen', !s.menu);
    // Rätselfenster bedienen
    await p.evaluate(() => { __zotik.S().stage = 5; __zotik.openPuzzle('LUN_MOONGATE'); }); await w(400);
    for (const [n, k] of [[1, 'ArrowUp'], [2, 'Enter'], [1, 'ArrowRight'], [1, 'ArrowRight'], [3, 'Enter']]) for (let i = 0; i < n; i++) await key(k, 150);
    await w(1400); ok(kind, 'Rätsel lösen', await p.evaluate(() => !!__zotik.S().pz.LUN_MOONGATE), 'offen: ' + (await state(p)).puz);
    if ((await state(p)).puz) await key('Escape', 300);
    ok(kind, 'keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); await p.context().close(); }
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
