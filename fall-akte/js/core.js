/* FALL·AKTE – Kern: erzeugt aus Welt + Startzahl einen eindeutig lösbaren Fall (Verdächtige mit Merkmalen, Spuren, Fundorte,
 * Labor-Aufgaben), wertet Verhör-Antworten und Spuren aus (wer passt noch?) und berechnet Punkte und Sterne. Ohne DOM, testbar mit node. */
(function (root) {
  'use strict';
  const D = root.FA_DATA || (typeof require !== 'undefined' ? require('./data.js') : null);
  const { WORLDS, ATTR, CLUES, ALIBI } = D;

  function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  function shuffle(r, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function shuffleInPlace(r, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const initialOf = name => { const w = name.replace(/\./g, '').split(' '); return w[w.length - 1][0].toUpperCase(); };
  const SECRET = { hand: v => v === 'links' ? 'SCHREIBT MIT LINKS' : 'SCHREIBT MIT RECHTS', smoke: v => v === 'ja' ? 'RAUCHT WIE EIN SCHLOT' : 'HASST ZIGARETTEN',
    glasses: v => v === 'ja' ? 'TRAEGT EINE BRILLE' : 'BRAUCHT KEINE BRILLE', hair: v => 'HAT ' + ({ schwarz: 'SCHWARZE', blond: 'BLONDE', rot: 'ROTE', grau: 'GRAUE', braun: 'BRAUNE' }[v]) + ' HAARE' };
  const OBS = ['hair', 'glasses'];            // sieht man auf dem Foto
  const ASK = ['shoe', 'hand', 'smoke', 'print'];   // erfährt man im Verhör

  /* ---------- Fall erzeugen ---------- */
  // o: { world (Index oder id), seed, n (Anzahl Verdächtige 3–5) }
  function makeCase(o) {
    const wi = typeof o.world === 'number' ? o.world : WORLDS.findIndex(w => w.id === o.world), W = WORLDS[wi], r = rng(o.seed), n = Math.max(3, Math.min(5, o.n || 4));
    for (let tries = 0; tries < 40; tries++) {
      const cast = shuffle(r, W.cast).slice(0, n);
      const sus = cast.map((c, i) => {
        const f = c[2] === 'f';
        return { i, name: c[0], role: c[1], sex: c[2], initial: initialOf(c[0]),
          hair: pick(r, ATTR.hair.vals), glasses: r() < .4 ? 'ja' : 'nein', shoe: f ? 37 + Math.floor(r() * 5) : 40 + Math.floor(r() * 6),
          hand: r() < .25 ? 'links' : 'rechts', smoke: r() < .4 ? 'ja' : 'nein', print: pick(r, ATTR.print.vals),
          alibi: pick(r, ALIBI), look: Math.floor(r() * 1e6) };
      });
      const culprit = Math.floor(r() * n), C = sus[culprit];
      // mögliche Spuren: Merkmal des Täters (schließt alle mit anderem Wert aus) oder ein Alibi-Brief für einen Unschuldigen
      const cand = [];
      for (const a of ['hair', 'glasses', 'shoe', 'hand', 'smoke', 'print']) {
        const elim = sus.filter(s => s[a] !== C[a]).map(s => s.i); if (elim.length) cand.push({ attr: a, val: C[a], elim });
      }
      sus.forEach(s => { if (s.i !== culprit) cand.push({ attr: 'alibi', val: s.i, elim: [s.i] }); });
      // Auswahl: so lange Spuren nehmen, bis nur der Täter bleibt – keine Spur darf allein alles klären
      const need = new Set(sus.filter(s => s.i !== culprit).map(s => s.i)), chosen = [];
      let pool = shuffle(r, cand).filter(c => c.elim.length <= Math.ceil((n - 1) / 2));
      while (need.size && pool.length) {
        pool.sort((x, y) => gain(y) - gain(x) || 0);
        const best = pool.filter(c => gain(c) > 0 && gain(c) === gain(pool[0]));
        const c = best.length ? best[Math.floor(r() * best.length)] : null; if (!c) break;
        chosen.push(c); c.elim.forEach(e => need.delete(e)); pool = pool.filter(p => p !== c && p.attr !== c.attr);   // je Merkmal eine Spur, höchstens ein Alibi-Brief
      }
      if (need.size || chosen.length < 2) continue;
      // weitere, bestätigende Spuren (mehr zu entdecken; je Merkmal höchstens eine)
      while (chosen.length < n && pool.length) { const c = pool.splice(Math.floor(r() * pool.length), 1)[0]; if (c.attr === 'alibi' && chosen.some(x => x.attr === 'alibi')) continue; chosen.push(c); pool = pool.filter(p => p.attr !== c.attr); }
      shuffleInPlace(r, chosen);
      function gain(c) { let g = 0; for (const e of c.elim) if (need.has(e)) g++; return Math.min(g, 2) * 10 - (c.attr === 'alibi' ? 3 : 0) + (OBS.includes(c.attr) ? -2 : 0) + (CLUES[c.attr].lab ? 2 : 0); }
      // Fundorte: verschiedene Gegenstände, die erste Spur am Tatort (Schauplatz 0)
      const spots = []; W.locs.forEach((L, li) => L.objs.forEach((ob, oi) => spots.push([li, oi])));
      const sh = shuffle(r, spots), used = new Set(); const clues = [];
      chosen.forEach((c, k) => {
        const free = s => !used.has(s.join()), sp = sh.find(s => free(s) && s[0] === k % 3) || sh.find(free);
        used.add(sp.join());
        const cl = { id: 'c' + k, attr: c.attr, val: c.val, elim: c.elim, loc: sp[0], obj: sp[1], lab: CLUES[c.attr].lab };
        if (cl.lab === 'letter') { cl.rot = [1, 2, 3, 0].map(() => 1 + Math.floor(r() * 3)); cl.order = shuffle(r, [0, 1, 2, 3]); if (cl.order.every((v, i) => v === i)) cl.order = [1, 0, 3, 2]; }
        if (cl.lab === 'print') cl.decoys = shuffle(r, ATTR.print.vals.filter(v => v !== c.val));
        if (cl.lab === 'shoe') cl.start = c.val + (r() < .5 ? -3 : 3);
        clues.push(cl);
      });
      // eine einfache Spur wird zur verschlüsselten Nachricht (Code-Rad)
      const cc = clues.find(c => !c.lab && SECRET[c.attr]);
      if (cc) { cc.lab = 'cipher'; cc.msg = SECRET[cc.attr](cc.val); cc.shift = 3 + Math.floor(r() * 20); }
      const time = (20 + Math.floor(r() * 3)) + ':' + String(Math.floor(r() * 4) * 15).padStart(2, '0');
      const motive = pick(r, W.motives);
      return { world: wi, seed: o.seed, n, sus, culprit, clues, time, motive, questions: n * 2 + 2 };
    }
    throw new Error('Kein Fall erzeugbar');
  }

  /* ---------- Auswerten ---------- */
  // st: { found: Set(Spur-ID), known: { 'i:attr': Wert } } → je Verdächtigem: 'out' (passt nicht), 'ok' (passt zu allem Bekannten) oder 'open'
  function known(C, st, i, a) {
    const s = C.sus[i];
    if (a === 'hair' || a === 'glasses' || a === 'initial') return s[a];        // sichtbar bzw. aus dem Namen
    const k = st.known[i + ':' + a]; return k === undefined ? undefined : k;
  }
  function verdict(C, st) {
    return C.sus.map(s => {
      let open = false, why = null;
      for (const cl of C.clues) {
        if (!st.found.has(cl.id) || (cl.lab && !st.solved.has(cl.id))) continue;
        if (cl.attr === 'alibi') { if (cl.val === s.i) { why = cl.id; break; } continue; }
        const v = known(C, st, s.i, cl.attr);
        if (v === undefined) open = true; else if (v !== cl.val) { why = cl.id; break; }
      }
      return why ? { s: 'out', why } : open ? { s: 'open' } : { s: 'ok' };
    });
  }
  function ask(C, st, i, a) {
    if (st.left <= 0 || st.known[i + ':' + a] !== undefined) return null;
    st.left--; st.asked++; st.known[i + ':' + a] = C.sus[i][a]; return C.sus[i][a];
  }
  function newState(C) { return { found: new Set(), solved: new Set(), known: {}, left: C.questions, asked: 0, hints: 0, wrong: 0, looks: 0, done: false, ok: false }; }
  // Punkte: 1000 Grundwert, Bonus für übrige Fragen und wenige Klicks, Abzug für Tipps und Fehlanklagen
  function score(C, st) {
    if (!st.ok) return 0;
    const s = 1000 + st.left * 40 + Math.max(0, 20 - st.looks) * 10 - st.hints * 150 - st.wrong * 300 + (C.n - 3) * 150;
    return Math.max(100, Math.round(s));
  }
  const stars = st => !st.ok ? 0 : st.wrong === 0 && st.hints <= 1 ? 3 : st.wrong <= 1 ? 2 : 1;
  function accuse(C, st, i) { if (st.done) return null; if (i === C.culprit) { st.ok = st.done = true; return true; } st.wrong++; if (st.wrong >= 3) st.done = true; return false; }
  // Tipp: zuerst eine ungefundene Spur, sonst eine sinnvolle Frage
  function hint(C, st) {
    st.hints++;
    const cl = C.clues.find(c => !st.found.has(c.id)); if (cl) return { k: 'clue', clue: cl };
    const v = verdict(C, st);
    for (const c of C.clues) { if (c.attr === 'alibi' || OBS.includes(c.attr) || c.attr === 'initial') continue;
      for (const s of C.sus) if (v[s.i].s !== 'out' && st.known[s.i + ':' + c.attr] === undefined) return { k: 'ask', i: s.i, attr: c.attr }; }
    const cand = v.map((x, i) => x.s !== 'out' ? i : -1).filter(i => i >= 0); return { k: 'accuse', n: cand.length };
  }
  // Fälle der Kampagne: je Welt 3 (3, 4, 5 Verdächtige); Tagesfall und Zufallsfall
  const caseSeed = (w, k) => hash('fa-' + WORLDS[w].id + '-' + k);
  const campaign = (w, k) => makeCase({ world: w, seed: caseSeed(w, k), n: 3 + k });
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function daily(d) { const k = dayKey(d), h = hash('fa-day-' + k); return Object.assign(makeCase({ world: h % WORLDS.length, seed: h, n: 4 }), { day: k }); }
  function caesar(s, k) { return s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k + 26) % 26 + 65)); }

  const FA = { rng, hash, makeCase, verdict, ask, newState, score, stars, accuse, hint, campaign, daily, dayKey, caesar, OBS, ASK, initialOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = FA;
  root.FA = FA;
})(typeof window !== 'undefined' ? window : globalThis);
