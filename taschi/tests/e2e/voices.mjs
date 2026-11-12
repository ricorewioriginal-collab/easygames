// Browsertest: eigene Stimmen je Figur. Plappern erzeugt Silben je Figur mit
// unterschiedlicher Tonlage; Sprache wählt pro Figur Stimme/Tonhöhe.
// Run: node tests/e2e/voices.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, () => {});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
try {
  // Plappern: Silben zählen und Grundfrequenz je Sprecher mitschreiben
  const hz = await G(page, async () => {
    const g = window.__taschi; g.audio.unlock(); g.settings.set('voice', 'babble');
    const seen = {}, orig = g.ui.voice.tick.bind(g.ui.voice);
    g.ui.voice.tick = (ch, who, mood) => { const r = orig(ch, who, mood); if (r) seen[who] = g.ui.voice.profile(who).hz; return r; };
    const p = g.ui.say([{ who: 'Professor Ulme', text: 'Hallo, willkommen im Labor!' }, { who: 'Pia', text: 'Oh, ein Taschi! Wie süß!' }, { who: 'Kommandantin Varga', text: 'Aus dem Weg, Kind.', mood: 'angry' }]);
    for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 1600)); if (i < 2) g.ui.top.onInput({ pressed: (a) => a === 'confirm', nav: () => null }); }
    return seen;
  });
  assert.equal(Object.keys(hz).length, 3, 'alle drei Figuren plappern');
  assert.equal(new Set(Object.values(hz).map(v => Math.round(v))).size, 3, 'drei verschiedene Tonlagen');
  await shot('voice-dialog');
  await G(page, () => window.__taschi.ui.top.onInput({ pressed: (a) => a === 'confirm', nav: () => null }));
  // Sprache: Profil je Figur (Web Speech API wird abgefangen)
  const utts = await G(page, () => {
    const g = window.__taschi, out = [];
    g.settings.set('voice', true);
    let last = null; const pv = g.ui.voice.pickVoice.bind(g.ui.voice); g.ui.voice.pickVoice = (p) => (last = pv(p));
    g.ui.voice.synth = { speak: (u) => out.push({ pitch: u.pitch, rate: u.rate, voice: last?.name || null }), cancel() {}, getVoices: () => [] };
    g.ui.voice.voices = { all: [{ name: 'Anna', lang: 'de-DE' }, { name: 'Markus', lang: 'de-DE' }], f: [{ name: 'Anna', lang: 'de-DE' }], m: [{ name: 'Markus', lang: 'de-DE' }] };
    for (const w of ['Professor Ulme', 'Rivale Rian', 'Wirtin Ilse', 'Kommandantin Varga']) g.ui.voice.speak('Hallo!', w);
    if (!out.length) return [{ dbg: [g.ui.voice.mode, g.ui.voice.speaking, typeof SpeechSynthesisUtterance] }];
    return out;
  });
  assert.equal(utts.length, 4, JSON.stringify(utts));
  assert.deepEqual(utts.map(u => u.voice), ['Markus', 'Markus', 'Anna', 'Anna'], 'Stimme passt zum Geschlecht');
  assert.equal(new Set(utts.map(u => u.pitch.toFixed(2) + u.rate.toFixed(2))).size, 4, 'jede Figur eigene Tonhöhe/Tempo');
  // Optionen: Stimmen-Auswahl und Stimmprobe
  await G(page, async () => { const m = await import(new URL('src/ui/menus.js', location.href).href); m.openPauseMenu(window.__taschi, 'options'); });
  await page.getByText('▶ Anhören').scrollIntoViewIfNeeded();
  await page.getByText('▶ Anhören').click();
  await shot('voice-options');
  await G(page, () => { const g = window.__taschi; while (g.ui.top) g.ui.top.onBack ? g.ui.top.onBack() : g.ui.pop(g.ui.top); }); await page.waitForTimeout(300);
  // Kampf: das wilde Taschi ruft beim Erscheinen mit seinem eigenen Ruf
  await G(page, () => { const g = window.__taschi; window.__cries = []; const o = g.audio.sfx.bind(g.audio); g.audio.sfx = (n, opts = {}) => { if (n === 'cry') window.__cries.push(opts.id); return o(n, opts); }; import('./src/logic/monster.js').then(M => g.battle({ kind: 'wild', foeTeam: [M.makeMonster('glutzahn', 8, g.rng)] })); });
  await page.waitForFunction(() => window.__cries.length >= 2, null, { timeout: 30000 });
  await page.waitForTimeout(400);
  await shot('voice-battle-cry');
  const cries = await G(page, () => window.__cries);
  assert.equal(cries[0], 'glutzahn', 'wildes Taschi ruft zuerst');
  assert.deepEqual(errors, [], errors.join('\n'));
  console.log('  ✓ Stimmen: Plappern und Sprache je Figur verschieden');
} finally { await close(); }
