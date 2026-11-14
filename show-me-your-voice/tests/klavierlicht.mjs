// SHOW ME YOUR VOICE – Klavierlicht-Songs statt Radio/Rhythmus: Songauswahl (Kategorien, Suche, Liste), echte Noten im Takt,
// Treffer per Taste und per Mikrofon (richtiger Ton), Quelle im Titel und Ergebnis, Winterglanz-Gala, Handy-Ansicht, kein Radio mehr.
//   node show-me-your-voice/tests/klavierlicht.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = (p, n) => (out ? p.screenshot({ path: out + '/' + n + '.jpg', type: 'jpeg', quality: 82 }) : null);

async function page(opts, mic) {
  const c = await b.newContext(Object.assign({ serviceWorkers: 'block' }, opts));
  const net = [];
  await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js|laut\.fm|itunes|lrclib|raw\.githubusercontent/, r => { net.push(r.request().url()); r.fulfill({ status: 503, body: '' }); });
  if (mic) await c.addInitScript(() => {   // Mikrofon, das genau die nächste Melodienote singt
    navigator.mediaDevices.getUserMedia = async () => {
      const ac = window.__fakeAc || (window.__fakeAc = new AudioContext()), o = ac.createOscillator(), g = ac.createGain(), d = ac.createMediaStreamDestination();
      o.type = 'sine'; o.frequency.value = 220; g.gain.value = 0; o.connect(g).connect(d); o.start(); window.__osc = o; window.__g = g;
      setInterval(() => { const s = window.SMYVApp && window.SMYVApp.stageObj(); if (!s || !s.notes || !s.part || s.part.type !== 'rhythm') { g.gain.value = 0; return; }
        const t = s.now, n = s.notes.find(x => !x.st && x.t > t - 0.2 && x.t < t + 0.1); if (n) { o.frequency.value = 440 * Math.pow(2, (n.p + (window.__wrong ? 6 : 0) - 69) / 12); g.gain.value = 0.4; } else g.gain.value = 0; }, 15);
      return d.stream;
    };
  });
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
  return { c, p, errs, net };
}
async function toPrep(p) {
  await p.click('[data-m="new"]'); await p.waitForSelector('#sAvatar.on'); await p.fill('#avaName', 'Rico'); await p.click('#avaOk'); await p.waitForSelector('#sBack.on');
  await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on');
  await p.click('#prepBox [data-g="how"][data-v="game"]');
  await p.waitForFunction(() => document.querySelectorAll('#klList [data-kl]').length > 100);
}
async function toStage(p) {
  await p.click('#bGo'); await p.waitForSelector('#sTalk.on');
  for (let i = 0; i < 6; i++) { if (await p.isVisible('#bStageGo')) break; await p.click('#talkQ [data-a="0"]'); }
  await p.click('#bStageGo'); await p.waitForSelector('#sStage.on', { timeout: 15000 });
  await p.waitForFunction(() => { const s = window.SMYVApp.stageObj(); return s && s.notes && s.notes.length; }, null, { timeout: 15000 });
}
const autoTap = p => p.evaluate(() => { window.__tap = setInterval(() => { const s = window.SMYVApp.stageObj(); if (!s || !s.notes || !s.part || s.part.type !== 'rhythm') return; const t = s.clock() - s.offset; s.notes.forEach(n => { if (!n.st && Math.abs(n.t - t) < 0.03) s.press(n.lane); }); }, 8); });
const waitRes = p => p.waitForSelector('#sResult.on, #resBox:visible', { timeout: 120000 }).catch(() => null);

// ---------- PC: Auswahl, Tasten-Treffer ----------
{
  const { p, errs, net } = await page({ viewport: { width: 1280, height: 800 } });
  await toPrep(p);
  const n = await p.$$eval('#klList [data-kl]', l => l.length); ok(n >= 120, 'Songliste mit allen Klavierlicht-Songs: ' + n);
  ok(!(await p.$('#prepBox [data-tab="radio"]')) && !/Radio|laut\.fm/.test(await p.textContent('#prepBox')), 'kein Radio mehr in der Vorbereitung');
  await p.click('#klCats [data-klc="weihnacht"]');
  const w = await p.$$eval('#klList [data-kl]', l => l.length); ok(w >= 15 && w < 40, 'Kategorie Weihnachten filtert: ' + w);
  await p.fill('#klQ', 'jingle'); const j = await p.$$eval('#klList [data-kl]', l => l.map(x => x.textContent)); ok(j.length === 1 && /Jingle Bells/.test(j[0]), 'Suche findet Jingle Bells');
  await p.click('#klList [data-kl]'); ok(await p.evaluate(() => window.SMYVApp.state().prep.kl.id) === 'jinglebells', 'Song gewählt');
  await shot(p, 'kl-auswahl-pc');
  await toStage(p);
  const st = await p.evaluate(() => { const s = window.SMYVApp.stageObj(); return { kl: s.kl, n: s.notes.length, p: s.notes.every(x => typeof x.p === 'number' && x.lane >= 0 && x.lane < 4), title: document.querySelector('#stTitle').textContent }; });
  ok(st.kl && st.n > 10 && st.p, 'Bühne: echte Melodienoten (' + st.n + ', mit Tonhöhe und Spur)');
  ok(/Jingle Bells/.test(st.title) && /Klavierlicht/.test(st.title), 'Titel nennt Song und Quelle: ' + st.title);
  await p.waitForTimeout(2600);
  ok(await p.evaluate(() => window.KLPiano.ctx && window.KLPiano.ctx.state === 'running'), 'Klavier spielt');
  await autoTap(p); await p.waitForTimeout(3500); await shot(p, 'kl-buehne-pc');
  const hit = await p.evaluate(() => window.SMYVApp.stageObj().cnt); ok(hit.p > 3, 'Tasten treffen die Noten im Takt: ' + JSON.stringify(hit));
  await waitRes(p); await p.waitForTimeout(800);
  const res = await p.evaluate(() => document.body.innerText); ok(/Klavierlicht-Song: „Jingle Bells“/.test(res), 'Quelle im Ergebnis');
  await shot(p, 'kl-ergebnis-pc');
  ok(!net.some(u => /laut\.fm/.test(u)), 'keine Radio-Anfragen');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
}
// ---------- Mikrofon: richtiger Ton zur richtigen Zeit ----------
{
  const { p, errs } = await page({ viewport: { width: 1100, height: 760 } }, true);
  await p.evaluate(() => { const s = window.SMYVApp.state().save; s.settings.mic = true; });
  await toPrep(p); await p.fill('#klQ', 'entchen'); await p.click('#klList [data-kl]');
  await toStage(p); await p.waitForTimeout(9000);
  const r = await p.evaluate(() => { const s = window.SMYVApp.stageObj(); return { mic: s.mic, cnt: s.cnt }; });
  ok(r.mic && r.cnt.p + r.cnt.g + r.cnt.o >= 4, 'Mikro trifft Noten über die Tonhöhe: ' + JSON.stringify(r.cnt));
  await shot(p, 'kl-mikro');
  // falscher Ton (Tritonus daneben) zählt nicht
  await p.evaluate(() => { window.__wrong = true; });
  const before = await p.evaluate(() => { const c = window.SMYVApp.stageObj(); return c ? c.cnt.p + c.cnt.g + c.cnt.o : 0; });
  await p.waitForTimeout(2500);
  const after = await p.evaluate(() => { const c = window.SMYVApp.stageObj(); return c && c.part && c.part.type === 'rhythm' ? c.cnt.p + c.cnt.g + c.cnt.o : null; });
  ok(after == null || after - before <= 1, 'falscher Ton trifft nicht (' + before + ' → ' + after + ')');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
}
// ---------- Handy + Winterglanz-Gala ----------
{
  const { p, errs } = await page({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await toPrep(p); await shot(p, 'kl-auswahl-handy');
  await p.click('#klRnd'); ok(!!(await p.evaluate(() => window.SMYVApp.state().prep.kl)), '🎲 Überrasch mich wählt einen Song');
  await toStage(p); await p.waitForTimeout(3500); await shot(p, 'kl-buehne-handy');
  await p.tap('#pads [data-lane="1"]');
  ok(await p.evaluate(() => window.SMYVApp.stageObj().kl), 'Handy: Klavierlicht-Bühne läuft');
  await p.evaluate(() => { window.SMYVApp.stageObj().abort(); }); await waitRes(p);
  await p.evaluate(() => window.SMYVApp.go('sBonus')); await p.waitForSelector('#sBonus.on'); await p.click('#bGala'); await p.waitForSelector('#sStage.on', { timeout: 15000 });
  await p.waitForTimeout(1500);
  const g = await p.evaluate(() => { const s = window.SMYVApp.stageObj(); return { kl: s.kl, t: document.querySelector('#stTitle').textContent }; });
  ok(g.kl && /Klavierlicht/.test(g.t), 'Gala spielt einen Weihnachts-Song: ' + g.t);
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
}
await b.close();
