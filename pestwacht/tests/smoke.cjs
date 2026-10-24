/* Browser-Smoke-Test für Pestwacht (Playwright + Chromium):
 *   python3 -m http.server 8765   (im Repo-Hauptordner)
 *   node pestwacht/tests/smoke.cjs [http://localhost:8765/pestwacht/]
 * Startet eine Kampagne und ein freies Spiel, öffnet alle Fenster und klickt deren Knöpfe durch.
 * Fehlschlag (Exit-Code 1) bei Seitenfehlern, Konsolenfehlern oder „Interner Fehler“-Hinweisen. */
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://localhost:8765/pestwacht/';
const SKIP = new Set(['exit', 'totitle', 'simport', 'sexport', 'sdel', 'keyreset', 'optreset', 'rebind', 'cont', 'newcamp', 'newfree', 'freego', 'cfok', 'mdemolish', 'demolish', 'declare', 'retreat']);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(URL);
  await p.waitForSelector('#titleNav button', { timeout: 20000 });
  let clicks = 0;
  const click = async (sel, wait) => {
    const el = p.locator(sel).first();
    if (!(await el.waitFor({ state: 'visible', timeout: wait || 3000 }).then(() => true, () => false))) { if (process.env.DEBUG) console.log('nicht sichtbar:', sel); return false; }
    await el.click({ timeout: 3000 }).catch(e => console.log('Klick fehlgeschlagen:', sel, e.message.split('\n')[0]));
    clicks++; await p.waitForTimeout(120); return true;
  };
  const closeAll = async () => { for (let i = 0; i < 6; i++) { const n = await p.$$eval('#modals .modal', l => l.length); if (!n) break; await p.keyboard.press('Escape'); await p.waitForTimeout(150); if (await p.$$eval('#modals .modal', l => l.length) === n) await click('#modals .modal:last-child header [data-act=close]', 500); } };
  // Kampagne starten
  await click('[data-act=newcamp]');
  await p.waitForTimeout(800);
  await click('[data-act=cfok]', 800);
  await p.waitForSelector('#nav button', { timeout: 10000 });
  await p.waitForTimeout(1500);
  // Alle Fenster der Navigation öffnen und ihre Knöpfe (einmal je Aktion/Daten) anklicken
  const per = {};
  const navs = await p.$$eval('#nav [data-act=nav]', l => l.map(e => e.dataset.id));
  for (const id of navs) {
    await closeAll();
    await click('#nav [data-id="' + id + '"]');
    await p.waitForTimeout(250);
    const seen = new Set();
    for (let round = 0; round < 40; round++) {
      const btns = await p.$$eval('#modals .modal:last-child [data-act]:not([disabled]), #side [data-act]:not([disabled])', l => l.map((e, i) => ({ i, k: e.dataset.act + '|' + JSON.stringify(e.dataset), act: e.dataset.act })));
      const nx = btns.find(x => !seen.has(x.k) && !SKIP.has(x.act) && x.act !== 'close' && x.act !== 'nav');
      if (!nx) break;
      per[id] = (per[id] || 0) + 1;
      seen.add(nx.k);
      const els = await p.$$('#modals .modal:last-child [data-act]:not([disabled]), #side [data-act]:not([disabled])');
      if (els[nx.i]) { await els[nx.i].click({ timeout: 2000 }).catch(() => {}); clicks++; await p.waitForTimeout(80); }
      if (!(await p.$('#modals .modal'))) { if (id !== 'karte' && id !== 'bauen') await click('#nav [data-id="' + id + '"]'); }
    }
  }
  await closeAll();
  // Bauen: erstes Gebäude platzieren
  await click('#nav [data-id=bauen]'); await p.waitForTimeout(200);
  const nB = await p.evaluate(() => PW.UI.S.city.b.length);
  const cat = await p.evaluate(() => { const S = PW.UI.S; PW.RES.forEach(k => { S.res[k] += 500; }); PW.Game.refresh(S); const d = PW.BUILDINGS.find(d => d.w && d.id !== 'hq' && d.id !== 'mauer' && !PW.City.canBuild(S, d.id)); return d ? d.cat : null; });
  if (cat) await click('#modals [data-act=btab][data-t="' + cat + '"]');
  await click('#modals [data-act=bpick]:not([disabled])'); await p.waitForTimeout(300);
  await click('[data-act=pok]:not([disabled])'); await p.waitForTimeout(300);
  if (process.env.DEBUG) await p.screenshot({ path: '/tmp/claude-0/-home-claude/88ef0396-0838-5cce-8993-5ba1859d67fb/scratchpad/s3.png' });
  if (await p.evaluate(() => PW.UI.S.city.b.length) <= nB) errs.push('Bauen: kein neues Gebäude platziert');
  // Spiel laufen lassen (schnell) und Kamera bewegen
  await closeAll();
  await p.keyboard.down('KeyW'); await p.waitForTimeout(300); await p.keyboard.up('KeyW');
  await p.mouse.move(640, 400); await p.mouse.wheel(0, -300); await p.mouse.click(640, 420); await p.mouse.click(700, 380);
  await p.evaluate(() => { const S = PW.UI.S; S.speed = 3; for (let i = 0; i < 2400; i++) PW.Game.tick(S, 0.5); });
  await p.waitForTimeout(1500);
  // Expeditionsfenster für jede Auftragsart öffnen (mit Truppen, damit die Zielprüfung läuft)
  const expRes = await p.evaluate(() => {
    const S = PW.UI.S, out = []; S.troops.spear = (S.troops.spear || 0) + 5; S.troops.rider = (S.troops.rider || 0) + 2;
    const tile = PW.World.within(S.world, S.world.caps[0], 2).find(i => i !== S.world.caps[0]);
    Object.keys(PW.March.MISSIONS).forEach(m => { try { PW.UI.P.expedition(tile, m); PW.UI.exp.units = { spear: 2 }; PW.UI.redraw && PW.UI.redraw(); out.push(m); } catch (e) { out.push(m + ': ' + e.message); } });
    PW.UI.closeAll ? PW.UI.closeAll() : null; return out;
  });
  console.log('Expeditionsfenster:', expRes.join(', '));
  if (expRes.some(x => x.indexOf(':') >= 0)) errs.push('Expeditionsfenster: ' + expRes.join(', '));
  await closeAll();
  // Beobachtete Schlacht: Expedition gegen den nächsten Ort mit Besatzung schicken
  const sent = await p.evaluate(() => {
    const S = PW.UI.S, W = PW.World; S.troops.spear = (S.troops.spear || 0) + 60; S.troops.bow = (S.troops.bow || 0) + 40; S.cfg.watchBattles = true;
    let best = -1, bd = 1e9; S.world.sites.forEach(s => { if (!s.cleared && PW.SITES[s.type].gar && s.tile != null) { const d = W.dist(S.world, s.tile, S.world.caps[0]); if (d > 0 && d < bd) { bd = d; best = s.tile; } } });
    if (best < 0) return 'kein Ziel';
    const r = PW.March.send(S, { target: best, mission: 'occupy', units: { spear: 60, bow: 40 }, heroes: [], formation: 'ausgewogen' });
    if (!r.ok) return r.why;
    for (let i = 0; i < 4000 && !PW.UI.battle && S.marches.indexOf(r.a) >= 0; i++) PW.Game.tick(S, 0.5);
    return PW.UI.battle ? 'ok' : 'keine Schlacht (' + (S.marches.indexOf(r.a) >= 0 ? r.a.state : 'beendet') + ')';
  });
  console.log('Schlacht:', sent);
  if (sent === 'ok') {
    await p.waitForTimeout(1500);
    await click('#side [data-act=bspd][data-s="4"]', 1500);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: process.env.SHOT ? process.env.SHOT.replace(/\.png$/, '-schlacht.png') : '/tmp/pestwacht-schlacht.png' });
    await click('#side [data-act=bskip]');
    await p.waitForTimeout(800);
    const after = await p.evaluate(() => ({ battle: !!PW.UI.battle && !PW.UI.battle.done, modals: [...document.querySelectorAll('#modals .modal')].map(e => e.dataset.id), mode: PW.UI.mode }));
    console.log('Nach der Schlacht:', JSON.stringify(after));
    await closeAll();
  }
  // Welle in Echtzeit ablaufen lassen
  await p.evaluate(() => { const S = PW.UI.S; PW.Waves.start(S, {}); S.speed = 3; });
  await p.waitForTimeout(4000);
  await p.evaluate(() => { const S = PW.UI.S; for (let i = 0; i < 1500 && S.waves.active; i++) PW.Game.tick(S, 0.5); });
  await p.waitForTimeout(800); await closeAll();
  // Speichern, Hauptmenü, Fortsetzen
  await p.evaluate(() => PW.UI.save(true));
  await click('#nav [data-id=menu]'); await click('[data-act=totitle]'); await p.waitForTimeout(400);
  await click('[data-act=cont]'); await p.waitForTimeout(1200);
  await closeAll();
  const st = async l => console.log(l, JSON.stringify(await p.evaluate(() => ({ m: [...document.querySelectorAll('#modals .modal')].map(e => e.dataset.id), title: !document.querySelector('#scrTitle').hidden, mode: PW.UI.S && PW.UI.S.mode }))));
  await st('nach Fortsetzen'); await p.screenshot({ path: '/tmp/claude-0/-home-claude/88ef0396-0838-5cce-8993-5ba1859d67fb/scratchpad/s2.png' });
  // Freies Spiel
  await click('#nav [data-id=menu]'); await click('[data-act=totitle]'); await p.waitForTimeout(300);
  await st('Titel?'); await click('[data-act=newfree]'); await p.waitForTimeout(300); await click('[data-act=freego]'); await p.waitForTimeout(300); await click('[data-act=cfok]'); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => ({ mode: PW.UI.S && PW.UI.S.mode, internal: [...document.querySelectorAll('.toast')].map(t => t.textContent).filter(t => /Interner Fehler|⚠️ [A-Z][a-z]+Error|undefined/.test(t)), stats: PW.R.stats && PW.R.stats() }));
  await p.screenshot({ path: process.env.SHOT || '/tmp/pestwacht-smoke.png' });
  await b.close();
  console.log('Knöpfe je Fenster:', JSON.stringify(per)); console.log('Klicks:', clicks, '· Modus am Ende:', info.mode, '· Render:', JSON.stringify(info.stats));
  if (info.internal.length) errs.push(...info.internal.map(t => 'toast: ' + t));
  if (errs.length) { console.log('FEHLER:\n' + [...new Set(errs)].slice(0, 30).join('\n')); process.exit(1); }
  console.log('OK – keine Fehler');
})().catch(e => { console.error(e); process.exit(1); });
