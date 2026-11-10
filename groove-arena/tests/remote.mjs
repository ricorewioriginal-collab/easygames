// Groove Arena – Wii-Remote / Joy-Con über WebHID (remote.js) mit nachgebildeten Controllern. Start: Server im Repo-Ordner, dann
//   node groove-arena/tests/remote.mjs [Screenshot-Ordner] [Basis-URL]
// Prüft die Umrechnung der Bewegungsberichte, das Einschalten der Sensoren (Wii 0x12/0x31, Joy-Con 0x40/0x03),
// den Verbinden-Ablauf in der Vorbereitung und dass die Bewegung in die Wertung (GASense.Motion) läuft.
import { chromium } from 'playwright';
import { stub } from './stubs.mjs';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }); await stub(ctx);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
await ctx.addInitScript(() => {
  // Nachgebildetes WebHID: eine Wii-Remote (DolphinBar Modus 4 meldet sich genauso) und ein Joy-Con (R)
  function dev(productId, productName) {
    const ls = [], d = { vendorId: 0x057e, productId, productName, opened: false, sent: [],
      async open() { this.opened = true; }, async sendReport(id, data) { this.sent.push([id, Array.from(data).slice(0, 11)]); },
      addEventListener(t, f) { if (t === 'inputreport') ls.push(f); },
      emit(reportId, bytes) { const dv = new DataView(new Uint8Array(bytes).buffer); ls.forEach(f => f({ reportId, data: dv, device: d })); } };
    return d;
  }
  const wii = dev(0x0306, 'Nintendo RVL-CNT-01'), joy = dev(0x2007, 'Joy-Con (R)');
  window.__hid = { wii, joy, pick: [wii] };
  Object.defineProperty(navigator, 'hid', { value: { requestDevice: async () => window.__hid.pick, getDevices: async () => [], addEventListener() {} } });
  // Schütteln: Wii-Remote abwechselnd 1 g und 2,5 g auf Z
  let k = 0; setInterval(() => { if (!wii.opened) return; k++; wii.emit(0x31, [0, 0, 0x80, 0x80, k % 2 ? 0x80 + 0x19 : 0x80 + 0x3e]); }, 30);
});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(BASE + 'groove-arena/index.html?lowfx'); await p.waitForSelector('#sTitle.on', { timeout: 20000 });
// Umrechnung
const conv = await p.evaluate(() => {
  const R = window.GARemote, dv = a => new DataView(new Uint8Array(a).buffer);
  const j = g => { const a = new Uint8Array(48); const v = new DataView(a.buffer); for (let k = 0; k < 3; k++) v.setInt16(12 + k * 12 + 4, Math.round(g / 0.000244), true); return v; };
  return { still: R._wii(dv([0, 0, 0x80, 0x80, 0x80 + 0x19])), shake: R._wii(dv([0, 0, 0x80, 0x80, 0x80 + 0x32])), jStill: R._joy(j(1)), jShake: R._joy(j(2)) };
});
ok(conv.still < 0.01 && Math.abs(conv.shake - 9.81) < 0.01, 'Wii-Remote: Ruhe = 0, 2 g = 9,81 m/s² (' + conv.still.toFixed(2) + ' / ' + conv.shake.toFixed(2) + ')');
ok(conv.jStill < 0.05 && Math.abs(conv.jShake - 9.81) < 0.05, 'Joy-Con: Ruhe = 0, 2 g = 9,81 m/s² (' + conv.jStill.toFixed(2) + ' / ' + conv.jShake.toFixed(2) + ')');
// Vorbereitung → Eingabe „Wii-Remote / Joy-Con“ → verbinden
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
await p.click('[data-go="songs"]'); await p.waitForSelector('#grid .card', { timeout: 10000 });
await p.click('#grid .card >> nth=0'); await p.waitForSelector('#sPrep.on');
ok(await p.locator('#pInput .sg[data-v="remote"]').count() === 1, 'Eingabe „🎮 Wii-Remote / Joy-Con“ angeboten (WebHID vorhanden)');
await p.click('#pInput .sg[data-v="remote"]'); await p.waitForSelector('#pRemoteTip:not([hidden])');
await p.click('#remConnect'); await p.waitForTimeout(1600);
const st = await p.evaluate(() => ({ sent: window.__hid.wii.sent, list: document.getElementById('remList').textContent, buf: GASense.Motion.buf.length, alive: GASense.Motion.alive(), max: Math.max(...GASense.Motion.buf.slice(-20).map(x => x.m)) }));
ok(JSON.stringify(st.sent) === JSON.stringify([[0x11, [0x10]], [0x12, [0x04, 0x31]]]), 'Wii-Remote: LED 1 und Bewegungsdaten eingeschaltet ' + JSON.stringify(st.sent));
ok(/Wii-Remote – Bewegung kommt an · zählt/.test(st.list), 'Liste: ' + st.list);
ok(st.buf > 10 && st.alive && st.max > 10 && st.max < 16, 'Bewegung landet im Verlauf der Wertung (max ' + (st.max || 0).toFixed(1) + ' m/s²)');
if (OUT) await p.screenshot({ path: OUT + '/ga-remote.png' });
// Joy-Con dazu: Bewegungssensor + volle Rate per Unterbefehl, zählt nicht doppelt
await p.evaluate(async () => { window.__hid.pick = [window.__hid.joy]; await GARemote.connect(); });
const js = await p.evaluate(() => ({ sent: window.__hid.joy.sent.map(x => [x[0], x[1][9], x[1][10]]), list: GARemote.list().map(r => r.name + (r.active ? '*' : '')).join(',') }));
ok(JSON.stringify(js.sent) === JSON.stringify([[1, 0x40, 1], [1, 0x03, 0x30], [1, 0x30, 1]]), 'Joy-Con: Sensor an, Bericht 0x30, LED ' + JSON.stringify(js.sent));
ok(js.list === 'Wii-Remote*,Joy-Con (R)', 'zwei Controller, der erste zählt: ' + js.list);
ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
await b.close(); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
