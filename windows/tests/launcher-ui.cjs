// Prüft die Bibliotheks-Oberfläche der easygames-Windows-App im Browser (ohne Windows): WebView2-Brücke wird nachgebildet,
// Spiele und Vorschaubilder kommen aus dem easygames-Stand (wie Store.cs). Aufruf: NODE_PATH=$(npm root -g) node windows/tests/launcher-ui.cjs [Screenshot-Ordner]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const UI = path.join(ROOT, 'windows', 'launcher');
const GAMES = ROOT;
const OUT = process.argv[2] || '';
const list = require('./catalog.cjs').games();
const now = Date.now();
const iso = h => new Date(now - h * 36e5).toISOString();

const games = list.map(g => ({
  id: g.id, title: g.title, short: g.short, desc: g.desc, meta: g.meta, cover: g.cover, genre: g.genre, url: g.url,
  kind: g.kind, modes: g.modes, installed: false, update: false, new: false, size: g.size, play: 0, last: null, needs: [], running: false,
}));
const by = id => games.find(g => g.id === id);
[['zotik', 7.5, 3], ['schatzfieber', 2.2, 1], ['ricopoly', 14, 30], ['anmacha-flipper', 0.6, 52], ['anmacha-quiz', 1.1, 75], ['riftzone', 0, 0], ['anmacha-funkparcours', 0.3, 120]].forEach(([id, h, ago]) => {
  const g = by(id); if (!g) return; g.installed = true; if (h) { g.play = Math.round(h * 3600); g.last = iso(ago); }
});
by('anmacha-flipper').update = true;
by('anmacha-funkparcours').needs = ['easyclash'];
['schatzfieber', 'radio-bingo', 'leuchtfeuer'].forEach(id => by(id) && (by(id).new = true));

const base = { type: 'state', version: '1.0.0', online: true, refreshing: false, baseReady: true, busy: 'anmacha-kart', done: 690000, total: 1470000, queue: ['anmacha-memory'],
  error: null, toast: null, auto: true, fullscreen: false, disk: 38400000, appUpdate: null, appUpdatePct: -1 };

let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FEHL ') + what); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: OUT ? 2 : 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://ricorewioriginal-collab.github.io/**', r => r.abort());
  await page.route('https://appassets.local/**', r => {
    const u = new URL(r.request().url());
    let p = decodeURIComponent(u.pathname).replace(/^\/+/, '');
    const file = p === '' ? path.join(UI, 'index.html') : p.startsWith('_launcher/') ? path.join(UI, p.slice(10)) : path.join(GAMES, p);
    if (!file.startsWith(UI) && !file.startsWith(GAMES) || !fs.existsSync(file)) return r.fulfill({ status: 404, body: '' });
    const type = { '.html': 'text/html', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream';
    r.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
  });
  await page.addInitScript(() => {
    window.__sent = [];
    window.chrome = { webview: { postMessage: o => window.__sent.push(o), addEventListener: (t, f) => { window.__recv = f; } } };
  });
  await page.goto('https://appassets.local/');
  const push = st => page.evaluate(s => window.__recv({ data: s }), st);
  const sent = () => page.evaluate(() => window.__sent.splice(0));
  check((await sent()).some(m => m.cmd === 'ready'), 'Oberfläche meldet sich bei der App (ready)');
  await page.evaluate(() => localStorage.clear());

  await push(Object.assign({}, base, { games }));
  await page.click('.grid [data-id="schatzfieber"]');
  await page.waitForTimeout(400);
  check(await page.locator('.grid .card').count() === games.length, `Alle ${games.length} Spiele in der Bibliothek`);
  check(await page.locator('.nav [data-view="updates"] em').innerText() === '1', 'Updates-Zähler in der Seitenleiste');
  check(await page.locator('.nav [data-view="new"] em').innerText() === '3', 'Neu-Zähler in der Seitenleiste');
  check(await page.locator('.recent .rc').count() === 4, 'Zuletzt gespielt (4)');
  check((await page.locator('.det h2').innerText()).startsWith('Schatzfieber'), 'Detail zeigt das gewählte Spiel');
  check(await page.locator('.det [data-act="play"]').count() === 1, 'Installiertes Spiel: Spielen-Knopf');
  check(await page.locator('#dlbar').isVisible() && (await page.locator('#dlbar').innerText()).includes('47 %'), 'Downloadleiste mit Fortschritt');
  if (OUT) await page.screenshot({ path: path.join(OUT, 'launcher-1-bibliothek.png') });

  await page.click('.det [data-act="play"]');
  check((await sent()).some(m => m.cmd === 'play' && m.id === 'schatzfieber'), 'Spielen schickt play an die App');

  // nicht installiertes Spiel
  await page.click('.grid [data-id="radio-bingo"]');
  await page.click('.det [data-act="install"]');
  check((await sent()).some(m => m.cmd === 'install' && m.id === 'radio-bingo'), 'Installieren schickt install an die App');
  await push(Object.assign({}, base, { busy: 'radio-bingo', queue: ['anmacha-kart', 'anmacha-memory'], done: 310000, total: 690000 }));
  await page.waitForTimeout(300);
  check((await page.locator('.det .acts').innerText()).includes('45 %'), 'Fortschritt im Detail');
  await push(Object.assign({}, base, { busy: 'radio-bingo', queue: ['anmacha-kart', 'anmacha-memory'], done: 520000, total: 690000 }));
  await page.waitForTimeout(300);
  check((await page.locator('.grid [data-id="radio-bingo"] .s').innerText()).includes('75 %'), 'Fortschritt aktualisiert die Karte ohne Neuaufbau');
  if (OUT) await page.screenshot({ path: path.join(OUT, 'launcher-2-download.png') });

  // Installiert-Ansicht mit Update
  await page.click('.nav [data-view="installed"]');
  await page.click('.grid [data-id="anmacha-flipper"]');
  await page.waitForTimeout(300);
  check(await page.locator('.grid .card').count() === 7, 'Installiert zeigt nur installierte Spiele');
  check(await page.locator('.det [data-act="install"]').innerText().then(t => t.includes('Update')), 'Update-Knopf bei offenem Update');
  if (OUT) await page.screenshot({ path: path.join(OUT, 'launcher-3-installiert.png') });

  // Deinstallieren mit Bestätigung
  await page.click('.det [data-act="uninstall"]');
  check(!(await sent()).some(m => m.cmd === 'uninstall'), 'Deinstallieren fragt erst nach');
  await page.click('.det [data-act="uninstall"]');
  check((await sent()).some(m => m.cmd === 'uninstall' && m.id === 'anmacha-flipper'), 'Zweiter Klick deinstalliert');

  // Suche, Tastatur
  await page.click('.nav [data-view="all"]');
  await page.fill('#q', 'schatz');
  await page.waitForTimeout(200);
  const hits = await page.locator('.grid .card').count();
  check(hits >= 1 && hits < 10 && await page.locator('.grid [data-id="schatzfieber"]').count() === 1, `Suche filtert (${hits} Treffer)`);
  await page.fill('#q', '');
  await page.locator('.grid [data-id="zotik"]').click();
  await page.keyboard.press('ArrowRight');
  check((await page.evaluate(() => document.querySelector('.grid .card.sel').dataset.id)) !== 'zotik', 'Pfeiltaste wählt nächstes Spiel');
  await page.keyboard.press('Enter');
  check((await sent()).some(m => m.cmd === 'install' || m.cmd === 'play'), 'Enter startet bzw. installiert');

  // Kategorie
  await page.click('.nav [data-view="cat:abenteuer"]');
  check(await page.locator('.grid [data-id="schatzfieber"]').count() === 1, 'Kategorie Abenteuer enthält Schatzfieber');

  // offline + App-Update + neues Spiel
  await page.click('.nav [data-view="all"]');
  await push(Object.assign({}, base, { busy: null, queue: [], online: false, appUpdate: '1.1.0', toast: 'Neues Spiel: Schatzfieber', games }));
  await page.waitForTimeout(300);
  check((await page.locator('#banners').innerText()).includes('Offline'), 'Offline-Hinweis');
  check((await page.locator('#banners').innerText()).includes('Ein neues Update ist verfügbar'), 'Hinweis auf neue App-Version');
  check(await page.locator('#toast.on').isVisible(), 'Meldung über neues Spiel');
  if (OUT) await page.screenshot({ path: path.join(OUT, 'launcher-4-hinweise.png') });
  await page.click('[data-act="appUpdate"]');
  check((await sent()).some(m => m.cmd === 'appUpdate'), 'App-Update startbar');

  // kleines Fenster: kein seitliches Scrollen
  await page.setViewportSize({ width: 940, height: 600 });
  await page.waitForTimeout(200);
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mindestgröße 940×600 ohne seitliches Scrollen');

  // erster Start: noch keine Liste
  const p2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await p2.route('https://ricorewioriginal-collab.github.io/**', r => r.abort());
  await p2.route('https://appassets.local/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(UI, 'index.html')) }));
  await p2.addInitScript(() => { window.chrome = { webview: { postMessage() {}, addEventListener: (t, f) => { window.__recv = f; } } }; });
  await p2.goto('https://appassets.local/');
  await p2.evaluate(() => window.__recv({ data: { type: 'state', online: false, games: [], queue: [] } }));
  check((await p2.locator('.empty').innerText()).includes('Keine Verbindung'), 'Erster Start ohne Internet: klarer Hinweis');

  check(errors.length === 0, 'Keine Skriptfehler' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(fails ? `\n${fails} Fehler` : '\nalles ok');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
