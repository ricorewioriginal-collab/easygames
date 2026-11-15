#!/usr/bin/env node
/* ZEITSPRUNG – sammelt alle Sätze, die Vito in den sechs Ausgaben sagt, für die vorproduzierte Edge-TTS-Stimme.
 * Spielt jede Ausgabe automatisch viele Runden durch (Playwright, lokal gestartetes http.server) und schreibt
 * zeitsprung/vo/lines.json: Sätze und Satzteile, genauso zerlegt wie zeitsprung/voice.js sie beim Abspielen sucht.
 * Aufruf: python3 -m http.server 8765 (im Repo-Ordner) & node tools/zeitsprung-voice/collect.cjs [Runden je Ausgabe]
 * Danach erzeugt der Workflow .github/workflows/zeitsprung-voice.yml (gen-edge.py) die MP3-Dateien. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const ROUNDS = +process.argv[2] || 1500;
const BASE = process.env.ZS_BASE || 'http://127.0.0.1:8765/';
const EDITIONS = ['wissen', 'movie', 'radio', 'castingshow', 'kinderserien', 'eurovision'];
// identisch zu zeitsprung/voice.js
const norm = t => String(t || '').replace(/[„“”"«»]/g, '').replace(/\s+/g, ' ').trim();
const sentences = t => norm(t).split(/(?<=[.!?…])\s+(?=[A-ZÄÖÜ0-9„"(])/).map(s => s.trim()).filter(Boolean);
const clauses = s => s.split(/(?<=[,:;])\s+/).map(c => c.trim()).filter(Boolean);

(async () => {
  const b = await chromium.launch();
  const all = new Set();
  for (const ed of EDITIONS) {
    const p = await b.newPage();
    await p.route(/deezer|youtube|wikimedia|gstatic|firebase|googleapis|spotify|peerjs/, r => r.abort());
    await p.addInitScript(() => {
      window.__said = [];
      const s = window.speechSynthesis;
      const speak = u => { if (u && u.text && u.text.trim()) window.__said.push(u.text); };
      try { Object.defineProperty(s, 'speak', { configurable: true, value: speak }); Object.defineProperty(s, 'cancel', { configurable: true, value: () => {} }); } catch (e) {}
      try { Object.defineProperty(s, 'getVoices', { configurable: true, value: () => [] }); } catch (e) {}
      localStorage.clear();
    });
    await p.goto(`${BASE}zeitsprung-${ed}/`);
    await p.waitForFunction(() => document.getElementById('category')?.options.length > 0, null, { timeout: 30000 });
    const n = await p.evaluate(async rounds => {
      const $ = id => document.getElementById(id);
      const vis = e => e && !e.disabled && e.offsetParent !== null;
      const wait = () => new Promise(r => setTimeout(r, 0));
      let done = 0, games = 0;
      async function start() {
        while ($('players').querySelectorAll('input').length < 4) $('addPlayer').click();
        $('players').querySelectorAll('input').forEach((inp, i) => { inp.value = `Spieler ${i + 1}`; inp.dispatchEvent(new Event('input')); });
        $('musicMode').selectedIndex = games % $('musicMode').options.length;
        $('category').selectedIndex = 0; games++;
        $('start').click(); await wait();
      }
      await start();
      while (done < rounds) {
        const opts = [...$('quizOptions').querySelectorAll('button')].filter(vis);
        const slots = [...$('timeline').querySelectorAll('.slot')].filter(vis);
        const pick = opts.length ? opts[Math.floor(Math.random() * opts.length)] : slots[Math.floor(Math.random() * slots.length)];
        if (pick) pick.click(); else if (vis($('next'))) { /* schon gelöst */ } else break;
        done++;
        if (done % 100 === 0) await wait();
        if (vis($('next'))) {
          const restart = /↻/.test($('next').textContent);
          $('next').click();
          if (restart) await start();
        }
      }
      // Fortsetzen-Ansage und Medien-Hinweise einmal auslösen
      return done;
    }, ROUNDS);
    // Vito spricht über eine Promise-Kette (und anmacha-cloud.js wartet nach cancel kurz): warten, bis alles angekommen ist
    let last = -1; for (let k = 0; k < 120; k++) { const len = await p.evaluate(() => window.__said.length); if (len === last) break; last = len; await p.waitForTimeout(1500); }
    const said = await p.evaluate(() => window.__said);
    // Antworten („A: Paris.“) nur als Teile: Buchstabe und Antwort einzeln, sonst gäbe es jede Kombination viermal
    for (const t of said) for (const s of sentences(t)) { if (!/^[A-D]: /.test(s)) all.add(s); for (const c of clauses(s)) all.add(c); }
    console.log(ed, 'Runden', n, 'Ansagen', said.length, 'gesamt', all.size);
    await p.close();
  }
  await b.close();
  // Feste Studio-Ansagen aus zeitsprung/app.js (Hauptmenü, Gesamtmodus)
  const app = fs.readFileSync(path.join(ROOT, 'zeitsprung', 'app.js'), 'utf8');
  for (const m of app.matchAll(/voice\.say\('([^']+)'/g)) for (const s of sentences(m[1])) all.add(s);
  for (let y = 1900; y <= 2030; y++) all.add(`${y}.`);
  for (let i = 1; i <= 4; i++) all.add(`Spieler ${i},`);
  const lines = [...all].filter(s => s.length > 1 && s.length < 400).sort();
  const out = path.join(ROOT, 'zeitsprung', 'vo', 'lines.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ voice: 'en-US-BrianMultilingualNeural', lines }, null, 0));
  console.log('Zeilen', lines.length, 'Zeichen', lines.reduce((a, s) => a + s.length, 0));
})();
