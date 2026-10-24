/* Stadt Land Plus – Spielkern ohne Grafik: Kategorien, Wissensdatenbank (Länder, Städte, Flüsse, Wortlisten),
 * schlaue Prüfung (Groß/klein, Umlaute, Akzente, Artikel, weibliche Formen, Mehrzahl, Tippfehler, zusammengesetzte Wörter),
 * Infos zu Treffern, Punkte (20 allein / 10 einzigartig / 5 doppelt), Buchstaben und Computer-Mitspieler. */
const SLF = (() => {
  'use strict';
  const W = typeof window !== 'undefined' ? window : global;
  const DB = () => W.SLF_DB || (W.SLF_DB = {});
  const CATS = {
    stadt: { n: 'Stadt', icon: '🏙️', files: ['staedte', 'laender'] },
    land: { n: 'Land', icon: '🌍', files: ['laender'] },
    fluss: { n: 'Fluss', icon: '🌊', files: ['fluesse', 'laender'] },
    tier: { n: 'Tier', icon: '🐾', files: ['w-tier'], comp: true },
    beruf: { n: 'Beruf', icon: '💼', files: ['w-beruf'], comp: true, fem: true },
    vorname: { n: 'Vorname', icon: '🧑', files: ['w-vorname'] },
    pflanze: { n: 'Pflanze', icon: '🌿', files: ['w-pflanze'], comp: true },
    essen: { n: 'Essen & Trinken', icon: '🍝', files: ['w-essen'], comp: true },
    sport: { n: 'Sportart', icon: '⚽', files: ['w-mehr'], comp: true },
    instrument: { n: 'Musikinstrument', icon: '🎸', files: ['w-mehr'], comp: true },
    gegenstand: { n: 'Gegenstand', icon: '🧸', files: ['w-mehr'], comp: true },
    farbe: { n: 'Farbe', icon: '🎨', files: ['w-mehr'], comp: true },
    marke: { n: 'Marke', icon: '🏷️', files: ['w-mehr'] },
    auto: { n: 'Automarke', icon: '🚗', files: ['w-mehr'] },
    berg: { n: 'Berg & Gebirge', icon: '⛰️', files: ['w-mehr'] },
    koerper: { n: 'Körperteil', icon: '🫀', files: ['w-mehr'], comp: true },
    eigene: { n: 'Eigene Kategorie', icon: '✏️', files: [] }
  };
  /* ---------- Normalisieren ---------- */
  function norm(s) {
    s = String(s || '').trim().toLowerCase().replace(/^(der|die|das|ein|eine)\s+/, '').replace(/^st\.?\s*(?=[a-zäöü])/, 'sankt ').replace(/^san(kt)?-/, 'sankt ');
    s = s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
    return s.replace(/[^a-z0-9]/g, '');
  }
  // Anfangsbuchstabe so, wie ihn Menschen lesen (Ä zählt als A)
  const firstLetter = s => { const t = String(s || '').trim().replace(/^(der|die|das|ein|eine)\s+/i, ''); const c = t.charAt(0).toUpperCase(); return ({ 'Ä': 'A', 'Ö': 'O', 'Ü': 'U', 'É': 'E', 'È': 'E', 'Á': 'A', 'À': 'A', 'Ó': 'O', 'Ú': 'U', 'Í': 'I', 'Ç': 'C', 'Č': 'C', 'Š': 'S', 'Ž': 'Z', 'Ł': 'L', 'Ś': 'S', 'Ż': 'Z', 'Ø': 'O', 'Å': 'A', 'Æ': 'A', 'Œ': 'O' })[c] || c; };
  /* ---------- Datenbank aufbauen ---------- */
  const IDX = {};
  const add = (ix, name, info) => { const k = norm(name); if (k.length < 2) return; (ix.map[k] = ix.map[k] || []).push(info); };
  function country(cc) { const L = DB().laender || []; return L.find(c => c.c === cc); }
  const LAND_EXTRA = { Holland: ['NL'], England: ['GB', 'Teil des Vereinigten Königreichs'], Schottland: ['GB', 'Teil des Vereinigten Königreichs'], Wales: ['GB', 'Teil des Vereinigten Königreichs'], Nordirland: ['GB', 'Teil des Vereinigten Königreichs'], Großbritannien: ['GB'], 'Vereinigtes Königreich': ['GB'], UK: ['GB'], USA: ['US'], Amerika: ['US'], 'Vereinigte Staaten': ['US'], 'Vereinigte Staaten von Amerika': ['US'], 'Tschechische Republik': ['CZ'], Weißrussland: ['BY'], Burma: ['MM'], Birma: ['MM'], 'Côte d’Ivoire': ['CI'], "Côte d'Ivoire": ['CI'], Elfenbeinküste: ['CI'], Swasiland: ['SZ'], Mazedonien: ['MK'], Bosnien: ['BA'], Herzegowina: ['BA'], Vatikan: ['VA'], Kapverde: ['CV'], 'Ost-Timor': ['TL'], Osttimor: ['TL'], Türkei: ['TR'], Türkiye: ['TR'], Kongo: ['CG'], 'Demokratische Republik Kongo': ['CD'], Korea: ['KR'], Südkorea: ['KR'], Nordkorea: ['KP'], Russland: ['RU'], Moldawien: ['MD'], Kirgisien: ['KG'], Persien: ['IR', 'historischer Name des Iran'], Ceylon: ['LK', 'historischer Name von Sri Lanka'], Siam: ['TH', 'historischer Name Thailands'], Abessinien: ['ET', 'historischer Name Äthiopiens'], Zaire: ['CD', 'historischer Name der DR Kongo'], Rhodesien: ['ZW', 'historischer Name Simbabwes'], Formosa: ['TW', 'historischer Name Taiwans'], 'Sowjetunion': [null, 'historischer Staat (1922–1991)'], UdSSR: [null, 'historischer Staat (1922–1991)'], Jugoslawien: [null, 'historischer Staat (1918–2003)'], DDR: [null, 'historischer Staat (1949–1990)'], Tschechoslowakei: [null, 'historischer Staat (1918–1992)'], Preußen: [null, 'historischer Staat'] };
  function build(cat) {
    if (IDX[cat]) return IDX[cat]; const D = DB(), ix = { map: {}, keys: null }; const C = CATS[cat] || {};
    if (cat === 'land') {
      (D.laender || []).forEach(c => { const info = { t: 'land', c: c.c }; add(ix, c.n, info); add(ix, c.o, info); });
      for (const k in LAND_EXTRA) { const [cc, note] = LAND_EXTRA[k]; add(ix, k, { t: 'land', c: cc, note, hist: cc === null || /historisch/.test(note || '') }); }
      const BL = (D.staedte && D.staedte.laender) || []; BL.forEach(b => add(ix, b, { t: 'bundesland', n: b }));
    } else if (cat === 'stadt') {
      const S = D.staedte; if (S) for (const cc in S.orte) for (const e of S.orte[cc]) { const info = { t: 'stadt', cc, n: e[0], pop: e[1], lat: e[2], lon: e[3], bl: cc === 'DE' ? S.laender[e[4]] : null }; add(ix, e[0], info); if (cc !== 'DE' && e[4]) add(ix, e[4], info);
        const short = e[0].replace(/\s*\(.*\)$/, '').replace(/\s+(am|an der|an den|im|in der|ob der|vor der|bei)\s.+$/i, ''); if (short !== e[0] && short.length > 2) add(ix, short, info); }
      (D.laender || []).forEach(c => c.cap.forEach(cap => { if (!ix.map[norm(cap)]) add(ix, cap, { t: 'stadt', cc: c.c, n: cap, cap: true, lat: null, lon: null }); }));
    } else if (cat === 'fluss') {
      String(D.fluesse || '').split('\n').forEach(l => { const [names, len, ccs, mouth] = l.split('|'); if (!names) return; const ns = names.split('/'); const info = { t: 'fluss', n: ns[0], alt: ns.slice(1), len: +len || 0, ccs: (ccs || '').split(',').filter(Boolean), mouth }; ns.forEach(n => add(ix, n, info)); });
    } else if (D[cat]) String(D[cat]).split('|').forEach(w => { w = w.trim(); if (w) add(ix, w, { t: 'wort', n: w, cat }); });
    ix.keys = Object.keys(ix.map); ix.byFirst = {}; ix.keys.forEach(k => { const f = k.slice(0, 1); (ix.byFirst[f] = ix.byFirst[f] || []).push(k); });
    if (C.comp) ix.suffix = ix.keys.filter(k => k.length >= 3).sort((a, b) => b.length - a.length);
    return IDX[cat] = ix;
  }
  const ready = cat => cat === 'eigene' || (CATS[cat] && CATS[cat].files.every(f => { const D = DB(); return f === 'staedte' ? !!D.staedte : f === 'laender' ? !!D.laender : f === 'fluesse' ? !!D.fluesse : f === 'w-mehr' ? !!D.sport : !!D[f.slice(2)]; }));
  /* ---------- Prüfen ---------- */
  // Tippfehler-Abstand: Einfügen, Löschen, Ersetzen und Vertauschen zweier Nachbarn (Hambrug → Hamburg) zählen je 1
  function lev(a, b, max) { if (Math.abs(a.length - b.length) > max) return max + 1; let pp = null, prev = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const cur = [i]; let best = i; for (let j = 1; j <= b.length; j++) { let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (pp && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1); cur[j] = v; if (v < best) best = v; } if (best > max) return max + 1; pp = prev; prev = cur; } return prev[b.length]; }
  const best = arr => arr.slice().sort((a, b) => (b.pop || 0) - (a.pop || 0) || (a.hist ? 1 : 0) - (b.hist ? 1 : 0))[0];
  function check(cat, raw, letter, opt) {
    opt = Object.assign({ typos: true }, opt || {}); const text = String(raw || '').trim(), k = norm(text);
    const r = { text, key: k, cat };
    if (!k) return Object.assign(r, { ok: false, how: 'leer' });
    if (letter && firstLetter(text) !== letter) return Object.assign(r, { ok: false, how: 'buchstabe', note: 'Fängt nicht mit ' + letter + ' an' });
    if (cat === 'eigene' || cat.startsWith('eigen')) return Object.assign(r, { ok: null, how: 'frei', note: 'Eigene Kategorie – entscheidet die Runde' });
    const ix = build(cat), hit = ix.map[k];
    const done = (e, how, note) => { const ok = e.t === 'bundesland' || e.hist ? null : true; return Object.assign(r, { ok, how, key: norm(e.n || (country(e.c) || {}).n || text), info: e, note: e.t === 'bundesland' ? 'Bundesland – kein eigener Staat' : e.note || note }); };
    if (hit) return done(best(hit), 'db');
    // weibliche Formen und Mehrzahl
    const stems = []; if (CATS[cat] && CATS[cat].fem) { if (/innen$/.test(k)) stems.push(k.slice(0, -5)); if (/in$/.test(k)) stems.push(k.slice(0, -2), k.slice(0, -3) + 'e', k.slice(0, -2) + 'er'); if (/frau$/.test(k)) stems.push(k.slice(0, -4) + 'mann'); }
    if (cat !== 'stadt' && cat !== 'land' && cat !== 'vorname') for (const suf of ['en', 'n', 'e', 's', 'er', 'nen']) if (k.endsWith(suf) && k.length > suf.length + 2) stems.push(k.slice(0, -suf.length));
    for (const s of stems) if (ix.map[s]) return done(best(ix.map[s]), 'form', 'Andere Form von ' + best(ix.map[s]).n);
    // Tippfehler
    if (opt.typos && k.length >= 4) { const max = k.length >= 9 ? 2 : 1, cand = ix.byFirst[k[0]] || []; let bk = null, bd = max + 1; for (const c of cand) { if (Math.abs(c.length - k.length) > max) continue; const d = lev(k, c, max); if (d < bd) { bd = d; bk = c; if (d === 1 && max === 1) break; } } if (bk) { const e = best(ix.map[bk]); return Object.assign(done(e, 'tippfehler'), { note: 'Tippfehler? Gemeint: ' + (e.n || (country(e.c) || {}).n) }); } }
    // zusammengesetzte Wörter (Zwergmaus, Apfelbaum, Kinderarzt …)
    if (ix.suffix && k.length >= 6) for (const s of ix.suffix) if (k.length - s.length >= 3 && k.endsWith(s)) { const e = best(ix.map[s]); return Object.assign(r, { ok: null, how: 'zusammengesetzt', info: e, note: 'Wahrscheinlich richtig – eine Art ' + e.n }); }
    return Object.assign(r, { ok: null, how: 'unbekannt', note: 'Nicht in der Datenbank' });
  }
  /* ---------- Punkte ---------- */
  // answers: [{ player, cat, res (check-Ergebnis), valid (true/false nach Prüfung/Abstimmung) }] einer Kategorie
  function score(answers) {
    const valid = answers.filter(a => a.valid), groups = {};
    valid.forEach(a => { groups[a.res.key] = (groups[a.res.key] || 0) + 1; });
    answers.forEach(a => { a.pts = !a.valid ? 0 : valid.length === 1 ? 20 : groups[a.res.key] > 1 ? 5 : 10; });
    return answers;
  }
  /* ---------- Buchstaben ---------- */
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  function pickLetter(used, excluded, rnd) { const pool = ABC.filter(l => !used.includes(l) && !excluded.includes(l)); const p = pool.length ? pool : ABC.filter(l => !excluded.includes(l)); return p[Math.floor((rnd || Math.random)() * p.length)]; }
  /* ---------- Computer-Mitspieler ---------- */
  function candidates(cat, letter) {
    const D = DB(), L = letter.toLowerCase(), out = [];
    if (cat === 'stadt') { const S = D.staedte; if (S) { for (const cc in S.orte) for (const e of S.orte[cc]) if (firstLetter(e[0]) === letter && !/[()]/.test(e[0])) out.push({ n: e[0], w: e[1] * (cc === 'DE' || cc === 'AT' || cc === 'CH' ? 3 : 1) }); } }
    else if (cat === 'land') (D.laender || []).forEach(c => { if (firstLetter(c.n) === letter) out.push({ n: c.n, w: c.ind ? 10 : 1 }); });
    else if (cat === 'fluss') String(D.fluesse || '').split('\n').forEach(l => { const [names, len] = l.split('|'); const n = (names || '').split('/')[0]; if (n && firstLetter(n) === letter) out.push({ n, w: Math.max(1, +len / 100) }); });
    else if (D[cat]) String(D[cat]).split('|').forEach(w => { if (w && firstLetter(w) === letter) out.push({ n: w, w: 1 }); });
    void L; return out;
  }
  function botAnswer(cat, letter, skill, rnd) {
    rnd = rnd || Math.random; if (cat === 'eigene' || rnd() > [.55, .78, .93][skill]) return '';
    const c = candidates(cat, letter); if (!c.length) return '';
    c.sort((a, b) => b.w - a.w); const top = c.slice(0, [25, 120, 600][skill]);
    // stärkere Spieler wählen eher seltene Wörter (mehr Punkte)
    const i = skill === 2 ? Math.floor(rnd() * top.length) : Math.floor(Math.pow(rnd(), skill === 0 ? 2.2 : 1.4) * top.length);
    return top[i].n;
  }
  return { CATS, norm, firstLetter, check, score, pickLetter, botAnswer, candidates, build, ready, country, ABC, lev };
})();
if (typeof module !== 'undefined') module.exports = SLF;
