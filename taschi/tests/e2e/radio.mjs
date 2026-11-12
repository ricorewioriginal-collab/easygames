// Browsertest: Abenteurer-Radio – Menü öffnen, Sender wählen (Klick und
// Tastatur), Spielmusik verstummt, Titelzeile oben aktualisiert sich live,
// Lautstärke und Dialog-Absenkung, Ausschalten bringt die Musik zurück.
// laut.fm wird im Test nachgebildet (kein Netz nötig).
// Run: node tests/e2e/radio.mjs [screenshot-dir] [phone]
import assert from 'node:assert/strict';
import { startSeeded, G } from './helpers.mjs';

const dir = process.argv[2] || null, phone = process.argv[3] === 'phone';
// 1 s Stille als WAV
const wav = (() => { const n = 8000, b = Buffer.alloc(44 + n); b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40); b.fill(128, 44); return b; })();
let song = 1;
const t = await startSeeded(phone ? { width: 390, height: 844, touch: true } : { width: 1280, height: 720 }, () => {});
const { page, errors, close } = t;
await page.route('https://stream.laut.fm/**', r => r.fulfill({ status: 200, contentType: 'audio/wav', body: wav }));
await page.route('https://api.laut.fm/**', r => { const end = new Date(Date.now() + 3000); const p = (x) => String(x).padStart(2, '0'); const iso = end.getUTCFullYear() + '-' + p(end.getUTCMonth() + 1) + '-' + p(end.getUTCDate()) + ' ' + p(end.getUTCHours()) + ':' + p(end.getUTCMinutes()) + ':' + p(end.getUTCSeconds()) + ' +0000';
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ title: 'Lichter über dem Moostal ' + song, artist: { name: 'Die Taschis' }, ends_at: iso }) }); });
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
const P = phone ? 'phone-' : '';
try {
  await G(page, () => { const g = window.__taschi; g.renderer.adaptive = false; g.world.encounterCooldown = 999; });
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')));
  await page.evaluate(() => [...document.querySelectorAll('button.btn')].find(b => /Abenteurer-Radio/.test(b.textContent)).click());
  await page.waitForSelector('[data-radio="ricorewi"]');
  await page.evaluate(() => document.querySelector('[data-radio="ricorewi"]').click());
  await page.waitForFunction(() => window.__taschi.radio.live && /Moostal 1/.test(window.__taschi.radio.song), null, { timeout: 30000 });
  assert.equal(await G(page, () => window.__taschi.audio.radioActive), true, 'Musik nicht ersetzt');
  await frames(10);
  await shot(P + 'radio-menu');
  // Tastatur: Fokus auf „Lautstärke +“ und Enter
  const v0 = await G(page, () => window.__taschi.settings.get('radioVolume'));
  await page.evaluate(() => { const ui = window.__taschi.ui; ui.top.nav.focus(document.querySelector('[data-radio="vol+"]')); });
  await page.keyboard.press('Enter');
  await frames(5);
  assert.ok(await G(page, () => window.__taschi.settings.get('radioVolume')) > v0, 'Lautstärke unverändert');
  await page.evaluate(() => window.__taschi.ui.clear());
  await frames(30);
  const full = await G(page, () => window.__taschi.radio.el.volume);
  assert.ok(full > 0 && full <= 0.55, 'Pegel ' + full);
  assert.ok(await G(page, () => document.getElementById('radioTicker').classList.contains('show')), 'Titelzeile fehlt');
  await shot(P + 'radio-ticker');
  // Live-Aktualisierung zum Songende
  song = 2;
  await page.waitForFunction(() => /Moostal 2/.test(document.querySelector('#radioTicker .rt-song').textContent), null, { timeout: 30000 });
  // Dialog: leiser
  await page.evaluate(() => { window.__taschi.ui.say([{ who: 'Professor Ulme', text: 'Hörst du das Radio? Ich drehe es kurz leiser.' }]); });
  await frames(60);
  const ducked = await G(page, () => window.__taschi.radio.el.volume);
  assert.ok(ducked < full * 0.6, 'nicht abgesenkt ' + ducked + ' / ' + full);
  await shot(P + 'radio-dialog');
  await page.evaluate(() => window.__taschi.ui.clear());
  // Aus: Musik zurück, Titelzeile weg
  await page.evaluate(() => window.__taschi.radio.stop());
  await frames(20);
  assert.equal(await G(page, () => window.__taschi.audio.radioActive), false);
  assert.ok(await G(page, () => !document.getElementById('radioTicker').classList.contains('show')));
  assert.deepEqual(errors, [], 'Fehler: ' + errors.join('\n'));
  console.log('✓ Radio ok');
} finally { await close(); }
