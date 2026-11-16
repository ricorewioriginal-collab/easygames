// Test der Controller-Einspielung in Spielfenstern (Host.PadScript(game: true)): gamepad.js läuft im Modus „plain“.
// Die Knopf-Belegung des Spiels (data-pad) und die Belegung der App wirken, der künstliche Rahmen bleibt aus
// (Leuchtrahmen, Belegungs-Übersicht, Knopf-Symbole, Zeiger, Fenster-Übernahme).
//   NODE_PATH=$(npm root -g) node windows/tests/game-pad.cjs [Spiele-Ordner mit gamepad.js] [Spielordner] [Screenshot-Ordner]
// Vergleich: dieselbe Seite wie im Browser (ohne „plain“) muss Einblendungen zeigen, sonst prüft der Test nichts.
const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const GAME = process.argv[3] || 'radio-bingo';
const SHOTS = process.argv[4] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };

const PAD = fs.readFileSync(path.join(ROOT, 'gamepad.js'), 'utf8');
const host = fs.readFileSync(path.join(__dirname, '..', 'Host.cs'), 'utf8');
const PLAIN = /window\.EASYGAMES_PAD='plain';/.test(host);   // so spielt die App es in Spielfenster ein

// Billig-Pad ohne Standard-Zuordnung; eigene Belegung der App: A und B getauscht (Knopf 0 ← 1, 1 ← 0)
const ID = 'USB Gamepad (Vendor: 0079 Product: 0011)';
const FAKE = `window.fake = { id: '${ID}', index: 0, connected: true, mapping: '', timestamp: 1, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, writable: true, value: () => [window.fake] });
  window.press = (i, on) => { window.fake.buttons[i] = { pressed: on, value: on ? 1 : 0 }; window.fake.timestamp++; };
  window.keys = []; addEventListener('keydown', e => { if (!e.isTrusted) window.keys.push(e.code); }, true);
  addEventListener('load', () => setTimeout(() => { const e = new Event('gamepadconnected'); Object.defineProperty(e, 'gamepad', { value: window.fake }); dispatchEvent(e); }, 300));   // wie ein echter Browser`;
const MAPS = { [ID]: { b: [{ b: 1 }, { b: 0 }] } };
const APP = plain => FAKE + '\nwindow.EASYGAMES_PADMAPS=' + JSON.stringify(MAPS) + ';' + (plain ? "window.EASYGAMES_PAD='plain';" : '') + 'window.EASYGAMES_PAD_NORMAL_ONLY=1;\n' + PAD;

(async () => {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    const f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
    const t = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)];
    if (t) r.setHeader('Content-Type', t);
    r.end(fs.readFileSync(f));
  }).listen(0);
  const url = 'http://127.0.0.1:' + srv.address().port + '/' + GAME + '/index.html';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });   // WebGL für 3D-Spiele (z. B. NEXORB)
  async function run(plain) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(APP(plain));
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(() => !!window.EasyGamesPad, null, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(2500);
    if (await p.evaluate(() => !!(document.querySelector('script[data-pad*="menu="]'))).catch(() => false)) await p.waitForTimeout(3500);   // Menü-Spiele (3D-Menü) brauchen länger
    // Steuerkreuz runter (zweimal), dann der echte Knopf B – laut App-Belegung ist das A
    // Spiele, die beim ersten Knopf eine neue Seite öffnen (z. B. Zotik): dort weitermachen
    const ev = async (fn, arg) => { for (let t = 0; ; t++) { try { return await p.evaluate(fn, arg); } catch (e) { if (t > 2 || !/context was destroyed|navigat/i.test(e.message)) throw e; await p.waitForLoadState('domcontentloaded'); await p.waitForTimeout(2500); } } };
    let fD = null;   // Auswahl direkt nach dem Steuerkreuz (vor A)
    const presses = async () => { for (const i of [13, 13, 1]) { if (i === 1 && fD === null) fD = await ev(() => { const a = document.activeElement; return a ? (a.textContent || '').trim().slice(0, 40) : ''; }); await ev(i => window.press(i, true), i); await p.waitForTimeout(250); await ev(i => window.press(i, false), i); await p.waitForTimeout(250); } await p.waitForTimeout(800); };
    const f0 = await ev(() => { const a = document.activeElement; return a ? (a.textContent || '').trim().slice(0, 40) : ''; });
    await presses();
    if (!(await ev(() => document.documentElement.classList.contains('eg-pad')))) await presses();   // Seite hat sich zwischendurch neu geladen
    const r = await ev(() => {
      const overlay = [...document.querySelectorAll('div[aria-hidden="true"]')].filter(d => d.style.zIndex === '2147483647' && getComputedStyle(d).display !== 'none').length;
      const P = window.EasyGamesPad;
      const fa = document.activeElement;
      return { focus: fa ? (fa.textContent || '').trim().slice(0, 40) : '', menu: !!document.querySelector('script[data-pad*="menu="]'),   // Spiel gibt seine Menüs an gamepad.js (aus dem Spiel gelesen, nicht aus gamepad.js)
        overlay, keys: window.keys.slice(), aKey: P && P.map ? P.map.a : '', info: !!(P && P.options && P.options.info), plain: !!(P && P.options && P.options.plain),
        padClass: document.documentElement.classList.contains('eg-pad'), glyph: P && P.glyph ? P.glyph('a') : '' };
    });
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'windows-game-pad-' + GAME + (plain ? '-app' : '-browser') + '.png') });
    await p.close();
    return { ...r, f0, fD, errs };
  }
  ok(PLAIN, 'Host.cs spielt in Spielfenster window.EASYGAMES_PAD=\'plain\' ein');
  const browser = await run(false), app = await run(true);
  console.log('info Vergleich im Browser (ohne „plain“): ' + browser.overlay + ' Einblendung(en) von gamepad.js' + (browser.overlay ? '' : ' – dieses Spiel zeigt dort keine'));
  if (app.menu) ok(app.f0 !== app.fD && app.fD === browser.fD, `App: Spiel überlässt seine Menüs gamepad.js (menu=) – Steuerkreuz wählt dort wie im Browser (${app.f0} → ${app.fD})`);   // z. B. NEXORB
  else ok(app.plain && app.overlay === 0, `App: kein Rahmen und keine Einblendungen (${app.overlay})`);
  const want = (app.aKey || '').split('/')[0];
  ok(app.info || (want && app.keys.includes(want)), `App: Knopf-Belegung des Spiels wirkt – App-Belegung B→A löst die Spieltaste ${want || '(Spiel liest Controller selbst)'} aus (${app.keys.join(',') || '–'})`);
  ok(app.info || app.keys.some(k => /Arrow|Key[WS]/.test(k)), 'App: Steuerkreuz kommt im Spiel an');
  ok((app.padClass || app.padClass === browser.padClass) && !!app.glyph, 'App: Controller-Modus (html.eg-pad) wie im Browser und Knopf-Symbole für Hinweise des Spiels');
  ok(app.errs.length === 0, 'App: keine Skriptfehler' + (app.errs.length ? ' – ' + app.errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? fails + ' Fehler' : 'alles ok');
  process.exit(fails ? 1 : 0);
})();
