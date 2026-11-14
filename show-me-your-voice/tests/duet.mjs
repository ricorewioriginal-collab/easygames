// SHOW ME YOUR VOICE – Duett mit zwei SingStar-Mikros (Playwright). Start: Server im Repo-Ordner, dann
//   node show-me-your-voice/tests/duet.mjs [Basis-URL] [Screenshot-Ordner]
// Nachgebildeter SingStar-Empfänger: links (blau) 220 Hz = A3, rechts (rot) 330 Hz = E4. Beide Stimmen müssen getrennt gewertet werden.
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(stereo) {
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js|stream\.laut\.fm|api\.laut\.fm|itunes|lrclib|raw\.githubusercontent/, r => r.fulfill({ status: 503, body: '' }));
  await c.addInitScript(stereo => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ac = window.__fakeAc || (window.__fakeAc = new AudioContext());
      const l = ac.createOscillator(), r = ac.createOscillator(), m = ac.createChannelMerger(2), d = ac.createMediaStreamDestination(), gl = ac.createGain(), gr = ac.createGain();
      l.frequency.value = 220; r.frequency.value = 330; gl.gain.value = gr.gain.value = 0.3; d.channelCount = 2;
      l.connect(gl).connect(m, 0, 0); r.connect(gr).connect(m, 0, 1); m.connect(d); l.start(); r.start();
      const tr = d.stream.getAudioTracks()[0], gs = tr.getSettings.bind(tr); tr.getSettings = () => Object.assign(gs(), { channelCount: stereo ? 2 : 1 });
      return d.stream;
    };
  }, stereo);
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
  await p.click('[data-m="new"]'); await p.waitForSelector('#sAvatar.on'); await p.fill('#avaName', 'Rico'); await p.click('#avaOk'); await p.waitForSelector('#sBack.on');
  await p.evaluate(() => { const s = window.SMYVApp.state(); s.save.settings.mic = true; window.SMYVApp.go('sMenu'); });
  await p.click('[data-m="sing"]'); await p.waitForSelector('#sSing.on');
  await p.click('#singBox [data-ss="acap"]'); await p.click('#singBox [data-sl="30"]');
  await p.click('#singDuet'); await p.fill('#singDuoName', 'Lena');
  return p;
}
const p = await page(true);
ok(/blaue.*rote/.test(await p.textContent('#singBox .duoSet')) && (await p.inputValue('#singDuoName')) === 'Lena', 'Duett-Knopf zeigt blau/rot mit Namen');
if (out) await p.screenshot({ path: out + '/duett-auswahl.jpg', type: 'jpeg', quality: 80 });
await p.click('#singGo'); await p.waitForSelector('#singPts2'); await p.waitForTimeout(4500);
const live = await p.evaluate(() => ({ a: document.querySelector('#singPts').textContent, b: document.querySelector('#singPts2').textContent, h: document.querySelector('#singBox h2').textContent }));
ok(/Rico & Lena/.test(live.h) && live.a !== '0' && live.b !== '0', 'Beide Mikros zählen live: ' + live.a + ' / ' + live.b);
if (out) await p.screenshot({ path: out + '/duett-live.jpg', type: 'jpeg', quality: 80 });
await p.click('#singStop'); await p.waitForSelector('#ovBox .duo');
const res = await p.textContent('#ovBox');
ok(/Duett-Ergebnis/.test(res) && /Rico/.test(res) && /Lena/.test(res), 'Duett-Ergebnis mit beiden Sängern');
if (out) await p.screenshot({ path: out + '/duett-ergebnis.jpg', type: 'jpeg', quality: 80 });
await p.click('#ovBox [data-act="ok"]'); await p.waitForSelector('#singGo');
// Mono-Mikro (Handy): Hinweis und solo weiter
const q = await page(false);
await q.click('#singGo'); await q.waitForSelector('#singStop'); await q.waitForTimeout(400);
ok(!(await q.$('#singPts2')) && /Kein Stereo-Mikro/.test(await q.textContent('body')), 'Ohne Stereo-Mikro: Hinweis, solo weiter');
ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
await b.close();
