// Zotik konsolenfähig: Controller-Hinweise statt Tastaturtasten, A als Kontextbefehl (Sprechen statt Angriff), Start/B für das Pausemenü,
// Optionen „🎮 Controller“ und „⌨️ Tastatur“ (frei belegbar, gespeichert), Touch ohne Tasten-Hinweise.
const { chromium, ARGS, open, skip, shot } = require('./lib.cjs');
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) bad++; };
const near = p => p.evaluate(() => { const Z = __zotik, m = Z.NPC.find(n => n.id === 'mira'); Z.pl.x = m.x + 1.6; Z.pl.z = m.z + .4; Z.step(1 / 30, 3); const e = document.getElementById('prompt'); return (e.hidden ? '[versteckt, Dialog ' + !document.getElementById('dlg').hidden + '] ' : '') + e.innerHTML; });
const start = async p => { await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; }); await p.waitForTimeout(800); await skip(p); await p.waitForTimeout(600); await skip(p); };
(async () => { const b = await chromium.launch({ args: ARGS });
  // ---- Controller ----
  { const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } }), w = ms => p.waitForTimeout(ms);
    const tap = async (i, wt = 350) => { await p.evaluate(i => __press(i, true), i); await w(120); await p.evaluate(i => __press(i, false), i); await w(wt); };
    await start(p); await p.evaluate(() => { window.__padOn = true; window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })); }); await w(500);
    await tap(13); await w(300);   // ein Knopfdruck schaltet den Controller-Modus ein
    await near(p); await w(300); let pr = await p.evaluate(() => document.getElementById('prompt').innerHTML);
    ok(/class="kh">A</.test(pr) && !/>E</.test(pr), 'Controller: Hinweis zeigt den A-Knopf statt „E“ (' + pr.replace(/<[^>]+>/g, '').slice(0, 40) + ')');
    await p.evaluate(() => EasyGamesPadNormal.style('ps')); for (let i = 0; i < 20 && await p.evaluate(() => !document.getElementById('dlg').hidden); i++) await tap(0, 200); pr = await near(p);
    await shot(p, 'konsole-hinweis'); ok(/class="kh">✕</.test(pr), 'PlayStation-Symbole im Hinweis (✕) · ' + pr.replace(/<[^>]+>/g, '|'));
    await tap(0, 600); ok(await p.evaluate(() => !document.getElementById('dlg').hidden), 'A spricht Mira an (Kontextbefehl wie bei Kingdom Hearts)');
    for (let i = 0; i < 30 && await p.evaluate(() => !document.getElementById('dlg').hidden); i++) await tap(0, 200);
    await tap(9, 600); ok(await p.evaluate(() => !document.getElementById('menu').hidden), 'Start öffnet das Pausemenü');
    await p.evaluate(() => __zotik.renderMenu('help')); await w(300);
    ok(await p.evaluate(() => !!document.querySelector('#padSty') && !!document.querySelector('#padConf') && !!document.querySelector('#padMap') && !!document.querySelector('#padLeg')), 'Optionen: 🎮 Controller (Symbole, Bestätigen, Knöpfe belegen, Belegung zeigen)');
    await p.evaluate(() => document.getElementById('padSty').click()); await w(250); ok(await p.evaluate(() => EasyGamesPadNormal.style() !== 'auto' && /▸/.test(document.getElementById('padSty').textContent)), 'Symbole umschalten per Knopf (' + await p.evaluate(() => EasyGamesPadNormal.style()) + ')');
    await shot(p, 'konsole-optionen');
    await p.evaluate(() => EasyGamesPadNormal.style('xbox')); await w(200);   // (Switch-Stil tauscht A und B – für den Rest Xbox)
    await tap(1, 600); ok(await p.evaluate(() => document.getElementById('menu').hidden), 'B schließt das Pausemenü');
    ok(await p.evaluate(() => EasyGamesPad.legend().length >= 12 && EasyGamesPad.legend().every(l => l[1])), 'jede Belegung beschriftet (' + await p.evaluate(() => EasyGamesPad.legend().length) + ')');
    await p.evaluate(() => EasyGamesPadNormal.style('auto'));
    console.log(p.errs.length ? 'FEHL Seitenfehler: ' + [...new Set(p.errs)].join(' | ') : 'ok   Controller ohne Seitenfehler'); if (p.errs.length) bad++; await p.context().close(); }
  // ---- Tastatur: frei belegen ----
  { const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } }), w = ms => p.waitForTimeout(ms);
    await start(p); await near(p); await w(300); let pr = await p.evaluate(() => document.getElementById('prompt').innerHTML);
    ok(/class="kh">E</.test(pr), 'Tastatur: Hinweis zeigt „E“');
    await p.keyboard.press('Escape'); await w(400); await p.evaluate(() => __zotik.renderMenu('help')); await w(300);
    ok(await p.evaluate(() => document.querySelectorAll('.kbd').length >= 18), 'Optionen: ⌨️ Tastatur mit allen Spieltasten');
    await p.evaluate(() => document.querySelector('.kbd[data-k="use"]').click()); await w(150); await p.keyboard.press('KeyH'); await w(300);
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('zotik_keys') || '{}').use === 'KeyH' && document.querySelector('.kbd[data-k="use"]').textContent === 'H'), 'Aktion auf H gelegt und gespeichert');
    await p.keyboard.press('Escape'); await w(400); ok(await p.evaluate(() => document.getElementById('menu').hidden), 'Esc schließt das Menü');
    await skip(p); pr = await near(p); ok(/class="kh">H</.test(pr), 'Hinweis folgt der neuen Taste (H) · ' + pr.replace(/<[^>]+>/g, '|') + ' · ' + await p.evaluate(() => [__zotik.INP.hint('use'), __zotik.INP.code('use'), __zotik.INP.mode(), localStorage.getItem('zotik_keys')].join(',')));
    await p.keyboard.press('KeyH'); await w(500); ok(await p.evaluate(() => !document.getElementById('dlg').hidden), 'H spricht Mira an');
    for (let i = 0; i < 30 && await p.evaluate(() => !document.getElementById('dlg').hidden); i++) { await p.keyboard.press('Enter'); await w(150); }
    await p.evaluate(() => { const Z = __zotik; Z.pl.x = 0; Z.pl.z = 14; Z.step(1 / 30, 3); }); await w(200);
    const y0 = await p.evaluate(() => __zotik.pl.y); await p.keyboard.down('Space'); await w(160); await p.keyboard.up('Space'); const y1 = await p.evaluate(() => __zotik.pl.y);
    ok(y1 > y0 + .1, 'andere Tasten wirken weiter (Leertaste springt)');
    console.log(p.errs.length ? 'FEHL Seitenfehler: ' + [...new Set(p.errs)].join(' | ') : 'ok   Tastatur ohne Seitenfehler'); if (p.errs.length) bad++; await p.context().close(); }
  // ---- Touch (Handy) ----
  { const p = await open(b, { ctx: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } }), w = ms => p.waitForTimeout(ms);
    await start(p); await near(p); await w(400);
    const st = await p.evaluate(() => ({ pr: document.getElementById('prompt').hidden, use: document.getElementById('bUseL').textContent, kbd: document.querySelectorAll('.kbd').length }));
    ok(st.pr && st.use && st.use !== 'Aktion', 'Touch: kein Tasten-Hinweis, der Aktion-Knopf zeigt „' + st.use + '“');
    await p.evaluate(() => __zotik.toggleMenu(true)); await w(300); await p.evaluate(() => __zotik.renderMenu('help')); await w(300);
    ok(await p.evaluate(() => document.querySelectorAll('.kbd').length === 0), 'Touch: ⌨️ Tastatur ausgeblendet');
    console.log(p.errs.length ? 'FEHL Seitenfehler: ' + [...new Set(p.errs)].join(' | ') : 'ok   Touch ohne Seitenfehler'); if (p.errs.length) bad++; }
  console.log(bad ? bad + ' Fehler' : 'alles ok'); await b.close(); process.exit(bad ? 1 : 0); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 500)); process.exit(1); });
