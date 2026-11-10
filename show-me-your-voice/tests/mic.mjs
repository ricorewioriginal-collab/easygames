// SHOW ME YOUR VOICE – Mikrofon-Auswahl und SingStar-Kanäle (Playwright). Start: Server im Repo-Ordner, dann
//   node show-me-your-voice/tests/mic.mjs [Basis-URL] [Screenshot-Ordner]
// Ein nachgebildetes Stereo-Mikrofon (wie der SingStar-Empfänger): links 220 Hz (A3, blaues Mikro), rechts 440 Hz (A4, rotes Mikro).
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const c = await b.newContext({ viewport: { width: 1100, height: 760 }, serviceWorkers: 'block' });
await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|egstat\.js|stream\.laut\.fm/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
await c.addInitScript(() => {
  window.__gum = [];
  const devs = [{ deviceId: 'usb-1', kind: 'audioinput', label: 'USB Audio Mikrofon', groupId: 'a' }, { deviceId: 'ss-1', kind: 'audioinput', label: 'USBMIC Serial# 012345 (SingStar)', groupId: 'b' }];
  navigator.mediaDevices.enumerateDevices = async () => devs;
  navigator.mediaDevices.getUserMedia = async (cons) => {
    window.__gum.push(JSON.parse(JSON.stringify(cons)));
    const ac = window.__fakeAc || (window.__fakeAc = new AudioContext());
    const l = ac.createOscillator(), r = ac.createOscillator(), m = ac.createChannelMerger(2), d = ac.createMediaStreamDestination(), gl = ac.createGain(), gr = ac.createGain();
    l.frequency.value = 220; r.frequency.value = 440; gl.gain.value = gr.gain.value = 0.3; d.channelCount = 2;
    l.connect(gl).connect(m, 0, 0); r.connect(gr).connect(m, 0, 1); m.connect(d); l.start(); r.start();
    const tr = d.stream.getAudioTracks()[0], gs = tr.getSettings.bind(tr);
    tr.getSettings = () => Object.assign(gs(), { channelCount: 2 }); Object.defineProperty(tr, 'label', { value: cons.audio.deviceId ? 'USBMIC Serial# 012345 (SingStar)' : 'USB Audio Mikrofon' });
    return d.stream;
  };
});
const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
await p.goto(base); await p.waitForTimeout(1500);
const pitch = async (prefs) => p.evaluate(async (prefs) => {
  const A = window.SMYVAudio; A.init(); A.micStop(); A.micSetPrefs(prefs); await A.micStart(true, true);
  await new Promise(r => setTimeout(r, 600)); let v = null; for (let i = 0; i < 10 && v == null; i++) { v = A.micPitch(); await new Promise(r => setTimeout(r, 60)); }
  const inf = A.micInfo(); A.micStop(); return { v, inf, cons: window.__gum[window.__gum.length - 1] };
}, prefs);
const L = await pitch({ device: 'ss-1', ch: 'left' }), R = await pitch({ device: 'ss-1', ch: 'right' }), M = await pitch({ device: '', ch: 'mix' });
ok(L.v != null && Math.abs(L.v - 57) < 0.6, 'Kanal links (blaues SingStar-Mikro) hört nur A3: ' + (L.v && L.v.toFixed(2)));
ok(R.v != null && Math.abs(R.v - 69) < 0.6, 'Kanal rechts (rotes Mikro) hört nur A4: ' + (R.v && R.v.toFixed(2)));
ok(L.cons.audio.deviceId && L.cons.audio.deviceId.exact === 'ss-1' && L.cons.audio.channelCount === 2 && L.cons.audio.echoCancellation === false, 'gewähltes Gerät, Stereo, ohne Bearbeitung angefordert');
ok(L.inf.ch === 'left' && R.inf.ch === 'right' && M.inf.ch === 'mix' && M.cons.audio.channelCount === 1 && !M.cons.audio.deviceId, 'Standard: Gerät des Systems, mono');
// Einstellungen: Liste der Mikrofone, SingStar erkannt → Kanal links, Test zeigt Ton
await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
await p.click('[data-m="set"]'); await p.waitForSelector('#sSettings.on');
await p.click('#setBox [data-s="mic"][data-v="true"]'); await p.click('[data-act="ok"]'); await p.waitForTimeout(600);   // Mikrofon-Modus einschalten (Freigabe)
const hasSel = await p.$('#setBox [data-sel="micDev"]');
if (!hasSel) { ok(false, 'Mikrofon-Auswahl in den Einstellungen (Mikrofon-Modus an)'); }
else {
  await p.waitForFunction(() => document.querySelectorAll('#setBox [data-sel="micDev"] option').length >= 3);
  ok(await p.evaluate(() => [...document.querySelectorAll('#setBox [data-sel="micDev"] option')].map(o => o.textContent).join('|')) === 'Standard des Geräts|USB Audio Mikrofon|🎤 USBMIC Serial# 012345 (SingStar)', 'Liste der Mikrofone, SingStar markiert');
  await p.selectOption('#setBox [data-sel="micDev"]', 'ss-1'); await p.waitForTimeout(300);
  ok(await p.getAttribute('#setBox [data-s="micCh"][data-v="left"]', 'aria-pressed') === 'true', 'SingStar gewählt → Kanal „Links (blau)“ automatisch');
  await p.click('#bMicTest'); await p.waitForTimeout(1200);
  const t = await p.textContent('#micTestV');
  ok(/links/.test(t) && /Ton A3/.test(t), 'Mikrofon-Test zeigt Gerät, Kanal und Ton: ' + t);
  if (out) await p.screenshot({ path: out + '/smyv-mikrofon.png' });
  await p.click('#bMicTest');
}
ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
await b.close();
