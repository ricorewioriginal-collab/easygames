#!/usr/bin/env node
// Test für easygames.js: Vollbild-Einbindung (Seite/Overlay, Spiel/Katalog), Schließen per ✕, Esc, Zurück-Taste, postMessage; iframe-Rechte.
//   NODE_PATH=$(npm root -g) node tools/test-embed.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const PAGES = {
  '/__overlay.html': '<!doctype html><meta charset=utf-8><body style="margin:20px"><p>Text</p><button id="t" data-easygames="wobbel" data-mode="overlay">Spielen</button><a id="all" href="#" data-easygames="all" data-mode="overlay"></a><div id="box" data-easygames="wobbel"></div><script src="/easygames.js"></script>',
  '/__apps.html': '<!doctype html><meta charset=utf-8><body style="margin:20px"><div id="lib" data-easygames="all" data-layout="apps"></div><div id="tl" data-easygames="wobbel" data-layout="tile" data-mode="overlay"></div><div id="ov" data-easygames="all" data-layout="apps" data-mode="overlay"></div><script src="/easygames.js"></script>',
  '/__page.html': '<!doctype html><meta charset=utf-8><body style="margin:0"><div id="pg" data-easygames="all" data-mode="page"></div><script src="/easygames.js"></script>',
  '/__pagegame.html': '<!doctype html><meta charset=utf-8><body style="margin:0"><div id="pg" data-easygames="wobbel" data-mode="page"></div><script src="/easygames.js"></script>',
};
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (PAGES[u]) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(PAGES[u]); }
  let f = path.join(root, u); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let fails = 0; const t = (n, ok, extra) => { console.log((ok ? 'OK    ' : 'FEHLER') + ' ' + n + (ok ? '' : ' ' + (extra || ''))); if (!ok) fails++; };
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const dlg = () => p.locator('[role=dialog]');
  await p.goto(base + '/__overlay.html'); await p.waitForFunction(() => document.querySelector('#box iframe'));
  const allow = await p.getAttribute('#box iframe', 'allow'); t('iframe erlaubt Gamepad und Vollbild', /gamepad/.test(allow) && /fullscreen/.test(allow), allow);
  // Overlay per Knopf (Einzelspiel)
  await p.click('#t'); await dlg().waitFor();
  let r = await p.evaluate(() => { const f = document.querySelector('[role=dialog] iframe').getBoundingClientRect(), d = document.querySelector('[role=dialog]').getBoundingClientRect(); return { f: [f.x, f.y, f.width, f.height], d: [d.x, d.y, d.width, d.height], src: document.querySelector('[role=dialog] iframe').src, ov: document.documentElement.style.overflow }; });
  t('Overlay füllt das Fenster', r.d.join() === '0,0,1000,700' && r.f.join() === '0,0,1000,700', JSON.stringify(r));
  t('Overlay zeigt das gewählte Spiel', /\/wobbel\/\?/.test(r.src), r.src); t('Seite scrollt nicht mehr', r.ov === 'hidden');
  await p.click('[role=dialog] button'); t('✕ schließt', (await dlg().count()) === 0);
  t('Scrollsperre aufgehoben', (await p.evaluate(() => document.documentElement.style.overflow)) !== 'hidden');
  // Katalog-Overlay, Esc (ohne Browser-Vollbild)
  await p.evaluate(() => EasyGames.open('all', { fullscreen: false })); await dlg().waitFor();
  t('Katalog-Overlay lädt die Übersicht', /index\.html\?embed=1/.test(await p.getAttribute('[role=dialog] iframe', 'src')));
  await p.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await p.keyboard.press('Escape'); t('Esc schließt (Fokus nicht im Spiel)', (await dlg().count()) === 0);
  // Zurück-Taste
  await p.evaluate(() => EasyGames.open('wobbel', { fullscreen: false })); await dlg().waitFor();
  t('Verlaufseintrag gesetzt', await p.evaluate(() => !!(history.state && history.state.egOverlay)));
  await p.evaluate(() => history.back()); await p.waitForTimeout(300); t('Zurück schließt', (await dlg().count()) === 0);
  // Schließen aus dem Spiel (postMessage) und ohne ✕
  await p.evaluate(() => EasyGames.open('wobbel', { fullscreen: false, close: false })); await dlg().waitFor();
  t('ohne ✕-Knopf bei close:false', (await p.locator('[role=dialog] button').count()) === 0);
  await p.frameLocator('[role=dialog] iframe').locator('body').waitFor({ state: 'attached' });
  await p.evaluate(() => { const w = document.querySelector('[role=dialog] iframe').contentWindow; w.postMessage; });
  await p.evaluate(() => { window.postMessage({ type: 'easygames:close' }, '*'); }); await p.waitForTimeout(200);
  t('Nachricht von fremder Quelle schließt nicht', (await dlg().count()) === 1);
  await (await (await p.locator('[role=dialog] iframe').elementHandle()).contentFrame()).evaluate(() => parent.postMessage({ type: 'easygames:close' }, '*')); await p.waitForTimeout(300);
  t('easygames:close aus dem Spiel schließt', (await dlg().count()) === 0);
  // Überlay per Link mit Katalog
  await p.click('#all'); await dlg().waitFor(); t('Link-Element öffnet den Katalog', /index\.html\?embed=1/.test(await p.getAttribute('[role=dialog] iframe', 'src'))); await p.click('[role=dialog] button');
  await p.evaluate(() => { EasyGames.open('wobbel', { fullscreen: false }); EasyGames.open('all', { fullscreen: false }); }); await p.waitForTimeout(400);
  t('zweites Overlay ersetzt das erste und bleibt offen', (await dlg().count()) === 1 && /index\.html\?embed=1/.test(await p.getAttribute('[role=dialog] iframe', 'src'))); await p.evaluate(() => EasyGames.close()); t('EasyGames.close() schließt', (await dlg().count()) === 0);
  // Seite im Vollbild
  for (const [url, rx] of [['/__page.html', /index\.html\?embed=1/], ['/__pagegame.html', /\/wobbel\//]]) {
    const q = await ctx.newPage(); await q.goto(base + url); await q.waitForSelector('#pg iframe');
    const g = await q.evaluate(() => { const f = document.querySelector('#pg iframe').getBoundingClientRect(); return { f: [f.x, f.y, f.width, f.height], src: document.querySelector('#pg iframe').src, sc: document.documentElement.scrollHeight }; });
    t('Seitenmodus ' + url + ' füllt das Fenster', g.f.join() === '0,0,1000,700' && rx.test(g.src), JSON.stringify(g)); await q.close();
  }
  // Replace: genau ein Verlaufseintrag; Fokus zurück; Zurück-Taste (TV)
  await p.goto(base + '/__overlay.html'); await p.waitForFunction(() => document.querySelector('#t'));
  await p.focus('#t'); await p.evaluate(() => EasyGames.open('wobbel', { fullscreen: false })); await dlg().waitFor();
  await p.evaluate(() => EasyGames.open('zotik', { fullscreen: false })); await p.waitForTimeout(100);
    await p.evaluate(() => { document.activeElement.blur(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'GoBack', keyCode: 10009, bubbles: true })); }); await p.waitForTimeout(250);
  t('Zurück-Taste (GoBack) schließt', (await dlg().count()) === 0);
  t('nach Ersetzen bleibt kein toter Verlaufseintrag', await p.evaluate(() => !(history.state && history.state.egOverlay)));
  t('Fokus kehrt zum Auslöser zurück', await p.evaluate(() => document.activeElement && document.activeElement.id === 't'));
  // Barrierefreiheit: Seite dahinter gesperrt, Fokus im Spiel, Tab bleibt im Overlay, alles wird wieder freigegeben
  await p.goto(base + '/__overlay.html'); await p.waitForFunction(() => document.querySelector('#t'));
  await p.focus('#t'); await p.evaluate(() => EasyGames.open('wobbel', { fullscreen: false })); await dlg().waitFor(); await p.waitForTimeout(150);
  const a11y = await p.evaluate(() => ({ role: document.querySelector('[role=dialog]').getAttribute('aria-modal'), label: !!document.querySelector('[role=dialog]').getAttribute('aria-label'), hid: document.querySelector('#t').getAttribute('aria-hidden'), inert: document.querySelector('#t').inert, foc: document.activeElement && document.activeElement.tagName }));
  t('Overlay: aria-modal und Beschriftung', a11y.role === 'true' && a11y.label, JSON.stringify(a11y));
  t('Overlay: Seite dahinter gesperrt (aria-hidden + inert)', a11y.hid === 'true' && a11y.inert === true, JSON.stringify(a11y));
  t('Overlay: Fokus liegt im Spiel', a11y.foc === 'IFRAME', JSON.stringify(a11y));
  await p.evaluate(() => document.querySelector('[role=dialog] button').focus()); await p.keyboard.press('Tab');
  t('Tab aus dem ✕-Knopf geht ins Spiel statt in die Seite', await p.evaluate(() => document.activeElement && document.activeElement.tagName === 'IFRAME'));
  await p.evaluate(() => EasyGames.close()); await p.waitForTimeout(150);
  t('Nach dem Schließen ist die Seite wieder frei', await p.evaluate(() => !document.querySelector('#t').hasAttribute('aria-hidden') && document.querySelector('#t').inert === false));
  // App-Kachel-Ansicht
  await p.goto(base + '/__apps.html'); await p.waitForFunction(() => document.querySelector('#lib iframe') && document.querySelector('#tl button'));
  t('EasyGames.portal bettet das Portal ein (portal=1, volle Breite)', await p.evaluate(() => { const d = document.createElement('div'); document.body.appendChild(d); EasyGames.portal(d, { height: '500px' }); const f = d.querySelector('iframe'); return !!f && /embed=1&portal=1/.test(f.src) && f.style.maxWidth === 'none' && f.style.height === '500px'; }));
  t('Katalog layout=apps lädt view=apps', /embed=1&view=apps/.test(await p.getAttribute('#lib iframe', 'src')));
  t('Katalog-Overlay mit layout=apps', await p.evaluate(() => { EasyGames.open('all', { layout: 'apps', fullscreen: false }); return /view=apps/.test(document.querySelector('[role=dialog] iframe').src); }));
  await p.keyboard.press('Escape'); await p.evaluate(() => EasyGames.close());
  const fr = p.frames().find(f => /view=apps/.test(f.url())); await fr.waitForSelector('.tile');
  const m = await fr.evaluate(() => { const i = document.querySelector('.icon').getBoundingClientRect(), s = getComputedStyle(document.querySelector('.tile small')).display; return { w: Math.round(i.width), h: Math.round(i.height), s, n: document.querySelectorAll('.tile').length }; });
  t('App-Ansicht: quadratische Symbole ohne Beschreibung', m.w === m.h && m.w <= 84 && m.s === 'none' && m.n > 5, JSON.stringify(m));
  t('Einzelspiel-Kachel zeigt Namen', /\S/.test(await p.textContent('#tl button')));
  await p.click('#tl button'); await dlg().waitFor(); t('Kachel öffnet Spiel im Vollbild', /\/wobbel\//.test(await p.getAttribute('[role=dialog] iframe', 'src')));
  await p.evaluate(() => EasyGames.close());
  // Startseite: App-Kacheln als Standard, Umschalter merkt sich die Wahl, Einbettung bleibt bei Karten, Infokarten stehen unter der Spieleliste
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('eg-test-clean')) { localStorage.removeItem('easygames.view'); sessionStorage.setItem('eg-test-clean', '1'); } } catch (e) {} });
  await p.goto(base + '/index.html'); await p.waitForSelector('#grid .tile');
  t('Startseite: Portal-Kacheln (Karten) sind Standard', await p.evaluate(() => !document.body.classList.contains('view-apps')));
  await p.click('#viewBtn'); t('Umschalter wechselt zu App-Kacheln', await p.evaluate(() => document.body.classList.contains('view-apps')));
  await p.reload(); await p.waitForSelector('#grid .tile'); t('Gewählte Ansicht bleibt nach dem Neuladen', await p.evaluate(() => document.body.classList.contains('view-apps')));
  await p.goto(base + '/index.html?embed=1'); await p.waitForSelector('#grid .tile'); t('Einbettung (?embed=1) bleibt bei Karten', await p.evaluate(() => !document.body.classList.contains('view-apps')));
  await p.goto(base + '/index.html?view=apps'); await p.waitForSelector('#grid .tile'); t('?view=apps erzwingt App-Kacheln', await p.evaluate(() => document.body.classList.contains('view-apps')));
  t('Infokarten (Android, EmulationStation, Einbinden) stehen unter der Spieleliste', await p.evaluate(() => document.getElementById('more').getBoundingClientRect().top + scrollY > document.getElementById('grid').getBoundingClientRect().top + scrollY));
  await p.evaluate(() => localStorage.removeItem('easygames.view'));
  t('keine Skriptfehler', errs.length === 0, errs.join('|'));
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
