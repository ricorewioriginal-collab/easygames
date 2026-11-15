// Zotik: Controller – Kommandomenü mit Steuerkreuz, LT-Schicht (alle Befehle), Select = Karte, Symbole je Controller, Menüs nur mit Controller
//   python3 -m http.server 8799 &   NODE_PATH=$(npm root -g) node tools/test-zotik/controller.cjs
const L = require('./lib.cjs');
(async () => { const b = await L.chromium.launch({ args: L.ARGS }); let ok = 0, bad = 0; const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FEHLER', n, x === undefined ? '' : x); } };
  const p = await L.open(b, { ctx: { viewport: { width: 960, height: 540 } } }); const w = ms => p.waitForTimeout(ms);
  await p.evaluate(() => { window.__padOn = true; window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })); });
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.potions = 4; S.mp = 100; S.lens = 1; }); await L.intro(p);
  const press = async (i, ms = 120) => { await p.evaluate(i => __press(i, true), i); await w(ms); await p.evaluate(i => __press(i, false), i); await w(160); };
  const hold = (i, on) => p.evaluate(([i, on]) => __press(i, on), [i, on]);
  const S = () => p.evaluate(() => { const Z = __zotik, s = Z.S(); return { mode: Z.mode, dlg: !document.getElementById("dlg").hidden, mp: s.mp, hp: s.hp, pot: s.potions, nav: Z.X.deck.nav, sub: Z.X.deck.sub, sel: Z.X.deck.sel, menu: !document.getElementById('menu').hidden, tab: Z.mState.tab, fo: !!(Z.FOTO && Z.FOTO().on) }; });
  for (let i = 0; i < 40 && (await S()).dlg; i++) await press(0, 80);
  await p.evaluate(() => { __zotik.S().hp = 40; });
  // 1 Steuerkreuz wählt Befehl, A führt ihn aus
  let s0 = await S(); await press(13); await press(13); let s = await S(); t('Steuerkreuz wählt Befehl', s.nav && s.sel === 2, JSON.stringify(s)); await press(0); s = await S(); t('A öffnet Untermenü', s.sub === 'magic', s.sub);
  await press(0); await w(400); s = await S(); t('A wirkt Magie', s.mp < s0.mp - 5, s0.mp + '→' + s.mp); t('Auswahl springt zurück', !s.nav && s.sel === 0 && !s.sub, JSON.stringify(s));
  await w(1500);
  // 2 B im Untermenü: Steuerkreuz links geht zurück
  await press(13); await press(13); await press(0); await press(14); s = await S(); t('Steuerkreuz links = zurück', !s.sub, s.sub); await press(14); s = await S(); t('nochmal links verlässt Markierung', !s.nav, JSON.stringify(s));
  // 3 LT-Schicht
  await w(4500); await p.evaluate(() => { __zotik.S().mp = 30; }); s0 = await S(); await hold(6, true); await w(200); await press(0); await hold(6, false); await w(300); s = await S(); t('LT+A = Funkenwirbel', s.mp < s0.mp - 5, s0.mp + '→' + s.mp);
  await p.evaluate(() => { __zotik.S().hp = 30; }); s0 = await S(); await hold(6, true); await w(200); await press(2); await hold(6, false); await w(300); s = await S(); t('LT+X = Heiltrank', s.pot === s0.pot - 1, s0.pot + '→' + s.pot);
  await w(2500); await p.evaluate(() => { __zotik.S().hp = 30; }); s0 = await S(); await press(6, 100); await w(300); s = await S(); t('LT kurz = Heiltrank', s.pot === s0.pot - 1, s0.pot + '→' + s.pot);
  await hold(6, true); await w(200); await press(11); await hold(6, false); await w(900); s = await S(); t('LT+R3 = Fotomodus', s.fo, JSON.stringify(s)); if (s.fo) { await press(1); await w(500); s = await S(); t('B schließt Fotomodus', !s.fo); }
  // Block wird beim LT-Halten nicht ausgelöst
  await hold(6, true); await w(200); await press(4); await hold(6, false); await w(200);
  // 4 Select = Karte, Start schließt
  await press(8); await w(400); s = await S(); t('Select öffnet Menü', s.menu, JSON.stringify(s)); await press(9); await w(400); s = await S(); t('Start schließt Menü', !s.menu);
  // 5 Symbole
  const h = await p.evaluate(() => ({ sk1: __zotik.INP.hint('sk1'), naut: __zotik.INP.hint('naut'), atk: __zotik.INP.hint('atk'), photo: __zotik.INP.hint('photo'), call: __zotik.INP.hint('call') })); t('Hinweis LT+A', /\+/.test(h.sk1), JSON.stringify(h));
  await p.evaluate(() => { EasyGamesPadNormal.style('ps'); }); const hp = await p.evaluate(() => ({ sk1: __zotik.INP.hint('sk1'), atk: __zotik.INP.hint('atk') })); t('PlayStation-Symbole', /L2\+✕/.test(hp.sk1) && hp.atk === '✕', JSON.stringify(hp));
   await p.evaluate(() => { EasyGamesPadNormal.style('switch'); EasyGamesPadNormal.confirm('right'); }); const hs = await p.evaluate(() => ({ sk1: __zotik.INP.hint('sk1'), atk: __zotik.INP.hint('atk') })); t('Switch-Symbole', /ZL\+/.test(hs.sk1), JSON.stringify(hs));
  t('keine Fehler', !p.errs.length, p.errs.join(' | ')); console.log(ok + '/' + (ok + bad) + ' bestanden'); await b.close(); process.exit(bad ? 1 : 0); })();
