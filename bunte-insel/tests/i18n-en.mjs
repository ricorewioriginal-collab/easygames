/* Englisch-Modus: Menü, HUD, Dialoge, Vorlesen (englische Stimme + englischer Text), Canvas-Schilder, zusammengesetzte Texte.
   Gibt übrig gebliebene deutsche Texte aus (keine harte Grenze, außer im Hauptmenü).
   Aufruf: node bunte-insel/tests/i18n-en.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
await ctx.addInitScript(() => {
  try { localStorage.setItem('bunteInsel_language', 'en'); } catch (e) { }
  window.__said = []; window.__canvas = [];
  const fake = { speaking: false, pending: false, paused: false, cancel() { }, resume() { }, getVoices: () => [], speak(u) { window.__said.push({ t: u.text, l: u.lang }); } };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
});
const p = await ctx.newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load/.test(m.text())) errs.push(m.text()); });
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const scan = () => p.evaluate(() => {
  const L = window.BunteInselI18n, out = new Set(), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest('[data-bi-i18n-skip],script,style,textarea')) continue; if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; const t = n.nodeValue.trim(); if (t.length > 2 && L.looksGerman(t)) out.add(t.slice(0, 90)); }
  return [...out];
});
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.waitForTimeout(500);
let left = await scan(); console.log('Menü – deutsch geblieben:', left);
ok(left.length === 0, 'Hauptmenü komplett englisch');
const r = await p.evaluate(() => { const t = BunteInselI18n.t; return {
  a: t('Bauer Heinz: „Danke!“ '), b: t('🏆 Kapitel „Tiere“ komplett! +10 ⭐'), c: t('Fang 15 Quallen im Quallenfeld'), d: t('3 von 5 🌾'), e: t('Pferd') }; });
console.log(r);
ok(/Farmer Heinz/.test(r.a) && /Chapter/.test(r.b) && /Catch 15 jellyfish/.test(r.c) && /3 of 5/.test(r.d) && r.e === 'Horse', 'zusammengesetzte Texte werden übersetzt');
await p.click('#bStart'); await p.waitForTimeout(1500);
left = await scan(); console.log('HUD – deutsch geblieben:', left);
ok(left.length === 0, 'HUD englisch');
const sp = await p.evaluate(async () => { const b = window.__bi; __said.length = 0; BI.audio && BI.audio.speak ? BI.audio.speak('Willkommen auf der Bunten Insel') : (window.A || {}).speak && A.speak('Willkommen auf der Bunten Insel'); await new Promise(r => setTimeout(r, 300)); return __said.slice(); });
console.log('Vorlesen:', sp);
ok(sp.length && sp[0].l === 'en-US' && /Colorful Island/.test(sp[0].t), 'Vorlesen: englische Stimme mit englischem Text');
const cv = await p.evaluate(() => { const c = document.createElement('canvas').getContext('2d'); c.font = '20px sans-serif'; return [c.measureText('Willkommen in der Fellretter-Bucht! Bei uns passen alle auf alle auf. 🏛️').width, c.measureText('Welcome to Furry Rescue Bay! Here everyone looks out for everyone. 🏛️').width]; });
ok(Math.abs(cv[0] - cv[1]) < 1, 'Canvas-Texte (Schilder/Mini-Spiele) werden übersetzt gemalt');
ok(!errs.length, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
