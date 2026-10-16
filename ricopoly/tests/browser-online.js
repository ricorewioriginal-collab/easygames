// Online-Partie über Firebase (Emulator) mit zwei Browsern: Raum anlegen, Beitritt per Link, Start, Spielzüge,
// gleicher Spielstand bei beiden, öffentliche Raumliste und weltweite Rangliste.
// Vorher: Firebase-Emulator (Auth 9099, Firestore 8080, Regeln aus cloud/firestore.rules) und
//         python3 -m http.server 8765 im Repo-Stamm.  Aufruf: node ricopoly/tests/browser-online.js [Ausgabeordner]
const { chromium } = require('playwright');
const SP = process.argv[2] || '.';
const EMU = { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  async function player(name, char) {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 700 }, locale: 'de-DE' });
    await ctx.addInitScript(([emu, name, char]) => {
      window.RICOPOLY_FIRE_EMU = emu;
      if (location.protocol === 'http:' && !localStorage.getItem('ricopoly.v1.profile')) localStorage.setItem('ricopoly.v1.profile', JSON.stringify({ id: 'id' + name, name, avatar: '😎', char, look: {}, settings: { lang: 'de', speed: 3, think: false, tips: false } }));
    }, [EMU, name, char]);
    await ctx.route(/peerjs\.com/, r => r.abort());   // PeerJS-Vermittler ist hier nicht erreichbar: nur Firebase prüfen
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(name + ' PAGEERR ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/peerjs|ERR_FAILED|net::|404/.test(m.text())) errs.push(name + ' CONSOLE ' + m.text()); });
    return p;
  }
  const H = await player('Hanna', 'king'), G = await player('Gero', 'elf');
  await H.goto('http://localhost:8765/ricopoly/'); await H.waitForTimeout(1500);
  await H.click('#btnOnline'); await H.waitForTimeout(300);
  await H.click('#panelBody .btn:has-text("Öffentlichen Raum")');
  await H.waitForSelector('.codebox b', { timeout: 15000 });
  const code = (await H.textContent('.codebox b')).trim();
  await H.waitForFunction(() => RicoPolyDebug.net() && RicoPolyDebug.net().fire, null, { timeout: 15000 });
  console.log('Raum', code, 'über Firebase angelegt');

  // Öffentliche Raumliste beim Gast (Eintrag wird gedrosselt nach max. 3 s geschrieben)
  await G.goto('http://localhost:8765/ricopoly/'); await G.waitForTimeout(4000);
  await G.click('#btnOnline');
  await G.waitForSelector(`#panelBody .btn:has-text("Hanna")`, { timeout: 15000 });
  console.log('Raum in der öffentlichen Liste:', (await G.textContent('#panelBody .btn:has-text("Hanna")')).trim());
  await G.click(`#panelBody .btn:has-text("Hanna")`);
  await G.waitForSelector('#panelBody .btn:has-text("Ich bin bereit")', { timeout: 40000 });
  console.log('Gast verbunden:', JSON.stringify(await G.evaluate(() => RicoPolyDebug.net())));
  await G.click('#panelBody .btn:has-text("Ich bin bereit")');
  await H.waitForSelector('#panelBody .btn:has-text("Partie starten"):not([disabled])', { timeout: 15000 });
  await H.screenshot({ path: SP + '/o-lobby.png' });
  await H.click('#panelBody .btn:has-text("Partie starten")');
  await Promise.all([H, G].map(p => p.waitForFunction(() => !!RicoPolyDebug.state(), null, { timeout: 15000 })));
  console.log('Partie gestartet');

  // Abwechselnd spielen, bis 40 Aktionen gemacht sind
  const seat = { H: 0, G: await G.evaluate(() => RicoPolyDebug.net().seat) };
  let acts = 0; const t0 = Date.now();
  async function step() {
    for (const [k, p] of [['H', H], ['G', G]]) {
      if (await p.locator('#card:not([hidden]) .btn').count()) await p.locator('#card .btn').first().click().catch(() => {});
      if (await p.locator('#modal:not([hidden])').count()) { const pb = p.locator('#modalBody .btn.primary'); if (await pb.count()) await pb.first().click().catch(() => {}); else await p.keyboard.press('Escape'); continue; }
      const st = await p.evaluate(() => { const s = RicoPolyDebug.state(); return s && { busy: RicoPolyDebug.busy(), actor: RicoRules.actor(s), phase: s.phase }; });
      if (!st || st.busy || st.actor !== seat[k]) continue;
      const btn = p.locator('#dock .btn.primary:not([disabled])');
      if (await btn.count()) { await btn.first().click().catch(() => {}); acts++; }
      else if (st.phase === 'auction') { await p.locator('#dock .btn.ghost').first().click().catch(() => {}); acts++; }
    }
    await H.waitForTimeout(200);
  }
  while (acts < 40 && Date.now() - t0 < 240000) await step();
  // Verbindungsabbruch: Gast lädt neu und kehrt über den Einladungslink auf seinen Platz zurück
  await G.goto('about:blank'); await H.waitForTimeout(2000);
  await G.goto('http://localhost:8765/ricopoly/#room=' + code);
  await G.waitForFunction(() => !!RicoPolyDebug.state(), null, { timeout: 60000 });
  console.log('Gast nach Neuladen zurück:', JSON.stringify(await G.evaluate(() => RicoPolyDebug.net())));
  const goal = acts + 10;
  while (acts < goal && Date.now() - t0 < 300000) await step();
  await H.waitForTimeout(3000);
  const sum = p => p.evaluate(() => { const s = RicoPolyDebug.state(); return JSON.stringify({ seq: s.seq, round: s.round, cur: s.cur, money: s.players.map(x => x.money), own: s.own.map(o => o ? o.o : null) }); });
  const hs = await sum(H), gs = await sum(G);
  console.log('Aktionen', acts, 'Gastgeber', hs);
  console.log(hs === gs ? 'Spielstand bei beiden gleich' : 'ABWEICHUNG Gast ' + gs);
  await G.screenshot({ path: SP + '/o-guest.png' });

  // Rangliste: Eintrag schreiben und anzeigen
  await H.evaluate(() => RicoFire.submit('Hanna', 'king', true));
  await G.evaluate(() => RicoFire.flush());
  const top = await G.evaluate(() => RicoFire.top(10));
  console.log('Rangliste', JSON.stringify(top.map(r => [r.name, r.wins, r.games])));
  console.log(errs.length ? errs.slice(0, 20).join('\n') : 'keine Fehler in der Konsole');
  await b.close();
  process.exit(hs === gs && acts >= 50 && !errs.length ? 0 : 1);
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
