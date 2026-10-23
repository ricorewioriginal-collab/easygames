/* Funkgalgen – Spiellogik ohne DOM (Browser und Node).
 * Eine Runde: ein Wort, 8 Lautsprecher-Kisten (Leben). Richtiger Buchstabe deckt alle Stellen auf, falscher kostet eine Kiste.
 * Wörter: Kategorien aus words.js (alle im Wortfunk-Wörterbuch) oder „Wörterbuch“ = bekannte Wörter aus ../wortfunk/data/bekannt.dawg. */
(function (root) {
  'use strict';
  const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ', LIVES = 8;
  const norm = s => String(s || '').toUpperCase().replace(/ß/g, 'SS').replace(/[^A-ZÄÖÜ]/g, '');
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Runde ---------- */
  function newRound(word, o) {
    o = o || {}; word = norm(word);
    return { word, shown: [], wrong: [], lives: o.lives || LIVES, max: o.lives || LIVES, done: false, won: false, jokers: 0, solvedBy: null, cat: o.cat || '' };
  }
  const left = r => [...new Set(r.word)].filter(c => !r.shown.includes(c));
  const pattern = r => Array.from(r.word).map(c => r.shown.includes(c) || r.done ? c : null);
  // Buchstabe raten: res = 'hit' | 'miss' | 'dup' | 'bad' | 'over'
  function guess(r, ch) {
    ch = norm(ch).slice(0, 1); if (r.done) return { res: 'over' }; if (!ch || !AL.includes(ch)) return { res: 'bad' };
    if (r.shown.includes(ch) || r.wrong.includes(ch)) return { res: 'dup', ch };
    if (r.word.includes(ch)) { r.shown.push(ch); const n = Array.from(r.word).filter(c => c === ch).length; if (!left(r).length) { r.done = true; r.won = true; } return { res: 'hit', ch, n, won: r.won }; }
    r.wrong.push(ch); r.lives--; if (r.lives <= 0) { r.lives = 0; r.done = true; } return { res: 'miss', ch, lost: r.done };
  }
  // ganzes Wort raten: richtig = gewonnen, falsch = 2 Kisten
  function solve(r, w) {
    w = norm(w); if (r.done) return { res: 'over' }; if (w.length < 2) return { res: 'bad' };
    if (w === r.word) { const hidden = left(r).length; r.shown = [...new Set(r.word)]; r.done = true; r.won = true; return { res: 'solved', hidden }; }
    r.lives = Math.max(0, r.lives - 2); if (!r.lives) r.done = true; return { res: 'wrongword', lost: r.done };
  }
  // Joker: einen noch verdeckten Buchstaben aufdecken (der seltenste zuerst nicht – zufällig)
  function joker(r, rnd) { const l = left(r); if (r.done || l.length <= 1) return null; const ch = l[((rnd || Math.random)() * l.length) | 0]; r.jokers++; r.shown.push(ch); return ch; }
  // Punkte für ein gelöstes Wort
  function points(r, streak) {
    if (!r.won) return 0;
    const base = 10 + new Set(r.word).size * 5 + r.lives * 10 - r.jokers * 25;
    return Math.max(5, Math.round(Math.max(0, base) * (1 + Math.min(1, (streak || 0) * .1))));
  }

  /* ---------- Wörter wählen ---------- */
  const DIFF = { leicht: [3, 7], mittel: [6, 10], schwer: [9, 20] };
  function pool(W, cat, diff) {
    const all = cat && cat !== 'alle' && W[cat] ? W[cat] : Object.values(W).flat();
    const [a, b] = DIFF[diff] || [3, 20], f = all.filter(w => w.length >= a && w.length <= b);
    return f.length >= 8 ? f : all;
  }
  function pick(list, rnd, recent) { const fresh = list.filter(w => !(recent || []).includes(w)); const L = fresh.length ? fresh : list; return L[((rnd || Math.random)() * L.length) | 0]; }
  function catOf(W, word) { for (const k in W) if (W[k].includes(word)) return k; return ''; }
  // Tageswort: für alle gleich (Datum als Startwert)
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function daily(W, key) {
    const all = Object.values(W).flat().filter(w => w.length >= 5).sort(); let h = 2166136261;
    for (const c of 'funkgalgen' + key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return all[mulberry(h)() * all.length | 0];
  }
  // alle Wörter eines DAWG (Wortfunk-Format) aufzählen
  function dawgWords(E, minLen, maxLen) {
    const out = [], st = [[E[0], '']];
    while (st.length) { const [node, pre] = st.pop(); if (!node || pre.length >= maxLen) continue; for (let i = node; ; i++) { const v = E[i], w = pre + AL[(v & 31) - 1]; if (v & 32 && w.length >= minLen) out.push(w); st.push([v >>> 7, w]); if (v & 64) break; } }
    return out;
  }
  // „Wörterbuch“-Modus: bekannte Wörter, aber nichts Derbes oder Gruseliges
  const BLOCK = ['SCHEISS', 'FICK', 'ARSCH', 'GEIL', 'NUTTE', 'HURE', 'WICHS', 'PENIS', 'VAGINA', 'TITTE', 'BUMS', 'KACK', 'PISS', 'MÖSE', 'SCHWUCHT', 'NAZI', 'HITLER', 'MORD', 'TÖTE', 'TÖTUNG', 'LEICHE', 'BLUT', 'WAFFE', 'BOMBE', 'DROGE', 'KOKAIN', 'HEROIN', 'SEX', 'NACKT', 'SCHLAMPE', 'SPAST', 'IDIOT', 'VERDAMM', 'HÖLLE', 'TOD', 'TOTE', 'STERB', 'STIRB', 'VERGEWALT', 'MISSBR', 'KILL', 'SCHIESS', 'SCHUSS', 'GEWEHR', 'PISTOLE', 'FOLTER', 'BORDELL', 'PORNO', 'ERHÄNG', 'GALGEN', 'SÄUFER', 'BESOFFEN', 'KOTZ', 'MIST', 'TROTTEL', 'DEPP', 'BLÖD', 'DUMM', 'HASS', 'KRIEG', 'LEICHEN', 'GRAB', 'SARG', 'TERROR', 'GEISEL', 'ENTFÜHR', 'RAUB', 'DIEB', 'KNAST', 'GEFÄNGNIS', 'SCHLAG', 'PRÜGEL'];
  const clean = w => !BLOCK.some(b => w.includes(b));
  function dictPool(E, diff) { const [a, b] = DIFF[diff] || [5, 13]; return dawgWords(E, Math.max(5, a), Math.min(14, b)).filter(clean); }
  // Eingabe eines Mitspielers (Duell/Online) prüfen
  function checkWord(w, dict) {
    w = norm(w); if (w.length < 3) return { ok: false, err: 'Mindestens 3 Buchstaben.' }; if (w.length > 20) return { ok: false, err: 'Höchstens 20 Buchstaben.' };
    if (dict && !(dict.hasWord ? dict.hasWord(w) : dict.has(w))) return { ok: false, err: 'Das Wort kenne ich nicht – bitte ein anderes.' };
    if (!clean(w)) return { ok: false, err: 'Bitte ein freundliches Wort.' };
    return { ok: true, w };
  }

  // Wörterbuch im Wortfunk-Format (DAWG als Uint32-Kanten): Wort vorhanden?
  function Dict(buf) {
    const E = buf instanceof Uint32Array ? buf : new Uint32Array(buf), root0 = E[0];
    function hasWord(w) { w = norm(w); let node = root0, e = -1; for (const ch of w) { const code = AL.indexOf(ch) + 1; if (!node || !code) return false; e = -1; for (let i = node; ; i++) { const v = E[i]; if ((v & 31) === code) { e = i; break; } if (v & 64) break; } if (e < 0) return false; node = E[e] >>> 7; } return e >= 0 && (E[e] & 32) !== 0; }
    return { E, hasWord };
  }
  const FG = { AL, LIVES, Dict, DIFF, norm, mulberry, newRound, left, pattern, guess, solve, joker, points, pool, pick, catOf, dayKey, daily, dawgWords, clean, dictPool, checkWord };
  if (typeof module !== 'undefined' && module.exports) module.exports = FG;
  root.FG = FG;
})(typeof self !== 'undefined' ? self : this);
