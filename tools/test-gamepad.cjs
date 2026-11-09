// Test für gamepad.js: Standard-Layout für alle Controller-Arten, eigene Belegung, Touch-Nachahmung, Nur-Normalisierung.
//   NODE_PATH=$(npm root -g) node tools/test-gamepad.cjs
// Ein nachgebauter Controller (navigator.getGamepads) wird vor gamepad.js in die Seite gelegt; geprüft wird, was das Spiel sieht.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PAGE = `<!doctype html><html><body style="margin:0">
<div id="tap" style="position:fixed;left:0;top:0;width:100vw;height:100vh"></div>
<script>
window.log = [];
addEventListener('keydown', e => log.push('key:' + e.code));
const t = document.getElementById('tap');
t.addEventListener('touchstart', e => { log.push('touchstart'); if (window.eat) e.preventDefault(); }, { passive: false });
t.addEventListener('touchend', e => log.push('touchend'));
t.addEventListener('mousedown', () => log.push('mousedown'));
t.addEventListener('click', () => log.push('click'));
</script>
<script src="/gamepad.js"></script></body></html>`;

// Spiel mit eigener Belegung, Beschriftungen und Bildschirm-Knöpfen (wie Zotik)
const CFG = `<!doctype html><html><body style="margin:0;height:100vh">
<button id="atk" style="position:fixed;right:20px;bottom:20px;width:60px;height:60px">⚔️</button>
<button id="jump" style="position:fixed;right:100px;bottom:20px;width:60px;height:60px">⤴</button>
<script>
window.log = []; addEventListener('keydown', e => { log.push('key:' + e.code); if (e.code === 'KeyJ') e.preventDefault(); });
addEventListener('easygames:pad', e => log.push('pad:' + e.detail.on));
const j = document.getElementById('jump'); j.addEventListener('pointerdown', () => log.push('jumpdown')); j.addEventListener('click', () => log.push('jumpclick'));
</script>
<script src="/gamepad.js" data-pad="a=KeyJ/Enter:Angriff@#atk x=:Springen@#jump right=Enter:Ausführen ls=wasd:Bewegen"></script></body></html>`;

// Nachgebauter Controller: window.fake = { id, mapping, buttons: [Zahl], axes: [Zahl] }
const FAKE = `(() => {
  window.fake = null;
  const mk = () => { const f = window.fake; if (!f) return [null];
    return [{ id: f.id, index: 0, connected: true, timestamp: performance.now(), mapping: f.mapping,
      buttons: f.buttons.map(v => ({ pressed: v > 0.5, touched: v > 0, value: v })), axes: f.axes.slice() }]; };
  Object.defineProperty(Navigator.prototype, 'getGamepads', { value: mk, configurable: true });
  window.plug = (f) => { window.fake = f; const e = new Event('gamepadconnected'); Object.defineProperty(e, 'gamepad', { value: mk()[0] }); dispatchEvent(e); };
})();`;

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };

(async () => {
  const srv = http.createServer((q, r) => {
    if (q.url.startsWith('/gamepad.js')) { r.setHeader('Content-Type', 'text/javascript; charset=utf-8'); return r.end(fs.readFileSync(path.join(ROOT, 'gamepad.js'))); }
    if (q.url.startsWith('/info')) { r.setHeader('Content-Type', 'text/html; charset=utf-8'); return r.end('<!doctype html><body><script>window.log=[];addEventListener("keydown",e=>log.push("key:"+e.code))</script><script src="/gamepad.js" data-pad="info" data-pad-labels="a=Springen; dpad=Auswählen; ls=Laufen"></script></body>'); }
    if (q.url.startsWith('/cfg')) { r.setHeader('Content-Type', 'text/html; charset=utf-8'); return r.end(CFG); }
    r.setHeader('Content-Type', 'text/html'); r.end(q.url.startsWith('/only') ? '<script>window.EASYGAMES_PAD_NORMAL_ONLY=1</script><script src="/gamepad.js"></script>' : PAGE);
  }).listen(0);
  const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch();
  const page = async (init = '') => { const p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); await p.addInitScript(FAKE + init); await p.goto(url); return p; };
  const frames = (p, n = 6) => p.evaluate(n => new Promise(r => { let i = 0; const f = () => ++i >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const set = (p, f) => p.evaluate(f => { Object.assign(window.fake, f); }, f);

  // 1) Billig-Pad ohne Standard-Zuordnung, Steuerkreuz als Hat-Achse (Ruhe 1.29): „runter“ wird zu Knopf 13 und Pfeil runter
  let p = await page();
  await p.evaluate(() => plug({ id: 'Generic USB Joystick (Vendor: 0079 Product: 0006)', mapping: '', buttons: Array(12).fill(0), axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2857 / 7 * 2.8] }));
  await frames(p);
  const restHat = await p.evaluate(() => navigator.getGamepads()[0].buttons[13].pressed);
  ok(!restHat, 'Hat in Ruhe: kein Steuerkreuz gedrückt');
  await p.evaluate(() => { window.fake.axes[9] = 0.142857; });
  await frames(p);
  const s1 = await p.evaluate(() => ({ m: navigator.getGamepads()[0].mapping, d: navigator.getGamepads()[0].buttons[13].pressed, log: log.slice() }));
  ok(s1.m === 'standard' && s1.d, 'Hat runter → Standard-Knopf 13 (mapping „standard“)');
  ok(s1.log.includes('key:ArrowDown'), 'Spiel bekommt Pfeil runter');
  await p.close();

  // 2) Linux-Layout: Trigger als Achsen (Ruhe -1), rechter Stick auf 3/4, Steuerkreuz auf Achsen 6/7
  p = await page();
  await p.evaluate(() => plug({ id: 'Xbox 360 Controller (Linux)', mapping: '', buttons: Array(11).fill(0), axes: [0, 0, -1, 0, 0, -1, 0, 0] }));
  await frames(p);
  await p.evaluate(() => { window.fake.axes[5] = 1; window.fake.axes[3] = 0.9; window.fake.axes[6] = -1; });
  const s2 = await p.evaluate(() => { const g = navigator.getGamepads()[0]; return { rt: g.buttons[7].value, lt: g.buttons[6].value, rx: g.axes[2], left: g.buttons[14].pressed }; });
  ok(s2.rt === 1 && s2.lt === 0, 'Trigger-Achse → RT gedrückt, LT in Ruhe');
  ok(Math.abs(s2.rx - 0.9) < 1e-6, 'rechter Stick von Achse 3');
  ok(s2.left, 'Steuerkreuz links von Achse 6');
  await p.close();

  // 3) Stick-Drift: Ruhelage 0.2 zählt als Mitte (kein Mauszeiger)
  p = await page();
  await p.evaluate(() => plug({ id: 'Drift Pad', mapping: '', buttons: Array(16).fill(0), axes: [0.2, -0.15, 0.25, 0.2] }));
  await frames(p, 30);
  const s3 = await p.evaluate(() => ({ ax: navigator.getGamepads()[0].axes.map(v => Math.round(v * 100) / 100), cursor: [...document.querySelectorAll('div[aria-hidden]')].some(d => d.style.display === 'block') }));
  ok(s3.ax.every(v => v === 0) && !s3.cursor, 'Drift ausgeglichen, kein Zeiger');
  await p.close();

  // 4) Eigene Belegung (Windows-App: EASYGAMES_PADMAPS): A und B getauscht
  p = await page(`window.EASYGAMES_PADMAPS = { 'Switch Pad': { b: [{ b: 1 }, { b: 0 }] } };`);
  await p.evaluate(() => plug({ id: 'Switch Pad', mapping: 'standard', buttons: Array(17).fill(0), axes: [0, 0, 0, 0] }));
  await frames(p);
  await set(p, { buttons: [0, 1].concat(Array(15).fill(0)) });
  await frames(p);
  const s4 = await p.evaluate(() => ({ a: navigator.getGamepads()[0].buttons[0].pressed, log: log.slice() }));
  ok(s4.a && s4.log.includes('key:Enter'), 'eigene Belegung: Taste 1 wirkt als A (Enter)');
  await p.close();

  // 5) Touch-Spiel: rechter Stick + A tippt mit touchstart/touchend; preventDefault unterdrückt Maus und Klick
  for (const eat of [false, true]) {
    p = await page();
    await p.evaluate(e => { window.eat = e; plug({ id: 'Std', mapping: 'standard', buttons: Array(17).fill(0), axes: [0, 0, 0, 0] }); }, eat);
    await frames(p);
    await set(p, { axes: [0, 0, 0.6, 0] }); await frames(p, 4); await set(p, { axes: [0, 0, 0, 0] }); await frames(p);
    await set(p, { buttons: [1].concat(Array(16).fill(0)) }); await frames(p);
    await set(p, { buttons: Array(17).fill(0) }); await frames(p);
    const l = await p.evaluate(() => log.filter(x => !x.startsWith('key')));
    if (!eat) ok(l.join() === 'touchstart,mousedown,touchend,click', 'Touch + Maus + Klick wie am Handy: ' + l.join());
    else ok(l.join() === 'touchstart,touchend', 'touchstart mit preventDefault: keine Maus, kein Klick: ' + l.join());
    await p.close();
  }

  // 6) Nur Normalisierung (so spielen die Apps die Datei in jede Seite ein): keine Tasten-Nachahmung
  const q = await (await b.newContext()).newPage();
  await q.goto(url + 'only');
  const s6 = await q.evaluate(() => ({ n: !!window.EasyGamesPadNormal, pad: !!window.EasyGamesPad, flag: !!window.EASYGAMES_PAD_NORMAL_ONLY }));
  ok(s6.n && !s6.pad && !s6.flag, 'Nur-Normalisierung: EasyGamesPadNormal ja, EasyGamesPad nein, Schalter wieder weg');

  // 7) Einheitliche Belegung: Controller-Modus, Belegung mit Texten, Symbol auf dem Bildschirm-Knopf, Knopf ohne Taste drückt ihn, Steuerkreuz einzeln
  p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); await p.addInitScript(FAKE); await p.goto(url + 'cfg');
  await p.evaluate(() => plug({ id: 'Std', mapping: 'standard', buttons: Array(17).fill(0), axes: [0, 0, 0, 0] })); await frames(p);
  const btn = async i => { const a = Array(17).fill(0); a[i] = 1; await set(p, { buttons: a }); await frames(p); await set(p, { buttons: Array(17).fill(0) }); await frames(p); };
  await btn(0);
  const s7 = await p.evaluate(() => ({ cls: document.documentElement.classList.contains('eg-pad'), log: log.slice(), leg: [...document.querySelectorAll('div[aria-hidden]')].map(d => d.style.display === 'block' ? d.textContent : '').join('|'), api: EasyGamesPad.legend().map(x => x[0] + '=' + x[1]).join(',') }));
  ok(s7.cls && s7.log.includes('pad:true'), 'Controller-Modus: html.eg-pad und Ereignis easygames:pad');
  ok(s7.log.includes('key:KeyJ') && !s7.log.includes('key:Enter'), 'A = KeyJ (verarbeitet, daher kein Enter)');
  ok(/Angriff/.test(s7.leg) && /Springen/.test(s7.leg) && /Bewegen/.test(s7.leg), 'Belegung mit Texten eingeblendet');
  ok(s7.api === 'L-Stick=Bewegen,→=Ausführen,A=Angriff,X=Springen', 'EasyGamesPad.legend(): ' + s7.api);
  await frames(p, 30);
  ok(await p.evaluate(() => [...document.querySelectorAll('div[aria-hidden]')].some(d => d.style.display === 'block' && d.textContent === 'A')), 'Symbol A auf dem Bildschirm-Knopf');
  await btn(2);
  ok(await p.evaluate(() => log.includes('jumpdown') && log.includes('jumpclick')), 'X ohne Taste drückt den Bildschirm-Knopf');
  await btn(15);
  ok(await p.evaluate(() => log.includes('key:Enter')), 'Steuerkreuz rechts = Enter (einzeln belegt)');
  await p.mouse.click(10, 10); await frames(p);
  ok(await p.evaluate(() => !document.documentElement.classList.contains('eg-pad') && log.includes('pad:false')), 'Maus/Touch beendet den Controller-Modus');
  await p.close();

  // 9) Fenster „Controller-Belegung“ (Select + Start): A für dieses Spiel auf den Knopf B legen, Spiel ist währenddessen gesperrt
  p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); await p.addInitScript(FAKE); await p.goto(url + 'cfg');
  await p.evaluate(() => plug({ id: 'Std', mapping: 'standard', buttons: Array(17).fill(0), axes: [0, 0, 0, 0] })); await frames(p);
  const press = async (...ix) => { const a = Array(17).fill(0); ix.forEach(i => { a[i] = 1; }); await set(p, { buttons: a }); await frames(p); await set(p, { buttons: Array(17).fill(0) }); await frames(p); };
  await press(8, 9);
  const m1 = await p.evaluate(() => ({ open: [...document.querySelectorAll('div[aria-hidden]')].some(d => d.style.display === 'block' && /CONTROLLER-BELEGUNG/.test(d.textContent)) }));
  await set(p, { buttons: [1].concat(Array(16).fill(0)) }); await frames(p, 2);
  const held = await p.evaluate(() => navigator.getGamepads()[0].buttons[0].pressed); await set(p, { buttons: Array(17).fill(0) }); await frames(p);
  ok(m1.open && !held, 'Select + Start öffnet die Belegung, das Spiel bekommt solange keine Knöpfe');
  await press(1);   // A (eben gehalten) hat „Angriff“ gewählt – jetzt den neuen Knopf B drücken
  await press(1);                    // B schließt
  await p.evaluate(() => { log.length = 0; }); await press(1);
  const m2 = await p.evaluate(() => ({ log: log.slice(), map: localStorage.getItem('easygames-remap:/'), leg: EasyGamesPad.legend().map(x => x[0] + '=' + x[1]).join(','), gp: navigator.getGamepads()[0].buttons[0].pressed }));
  ok(m2.log.includes('key:KeyJ') && /"0":1/.test(m2.map || ''), 'umbelegt: Knopf B löst jetzt „Angriff“ aus, je Spiel gespeichert ' + (m2.map || ''));
  ok(/B=Angriff/.test(m2.leg), 'Belegung zeigt das neue Symbol: ' + m2.leg);
  await p.close();

  // 8) Spiel mit eigener Controller-Steuerung (data-pad="info"): keine Tasten, aber Belegung und Controller-Modus
  p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage(); await p.addInitScript(FAKE); await p.goto(url + 'info');
  await p.evaluate(() => plug({ id: 'Std', mapping: 'standard', buttons: Array(17).fill(0), axes: [0, 0, 0, 0] })); await frames(p);
  await set(p, { buttons: [1].concat(Array(16).fill(0)) }); await frames(p); await set(p, { buttons: Array(17).fill(0) }); await frames(p);
  await set(p, { buttons: Array(12).fill(0).concat([0, 1, 0, 0, 0]) }); await frames(p);
  const s8 = await p.evaluate(() => ({ keys: log.length, cls: document.documentElement.classList.contains('eg-pad'), leg: EasyGamesPad.legend().map(x => x[0] + '=' + x[1]).join(',') }));
  ok(s8.keys === 0 && s8.cls, 'info-Modus: keine Tasten-Nachahmung, Controller-Modus an');
  ok(s8.leg === 'L-Stick=Laufen,✚=Auswählen,A=Springen', 'info-Modus: Belegung aus data-pad-labels: ' + s8.leg);
  await p.close();

  await b.close(); srv.close();
  console.log(fails ? fails + ' Fehler' : 'alles ok');
  process.exit(fails ? 1 : 0);
})();
