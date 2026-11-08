/* Klavierlicht-Lieder für andere Musikspiele (z. B. AnMaCha Beat Surfer, PRISMRUSH): Liederliste, Noten und Begleitung.
 * Einbinden (nach ../klavierlicht/js/core.js und ../klavierlicht/js/songs.js):  <script src="../klavierlicht/js/songlib.js"></script>
 * KLSongLib.list() → Promise<[{ id, title, artist, cat, diff, dur, lic, src, builtin }]>  (10 Lieder im Spiel + Online-Archiv;
 *   neue Shop-Lieder nur, wenn sie in Klavierlicht freigeschaltet sind)
 * KLSongLib.chart(song) → Promise<Chart>;  KLSongLib.parts(chart, level, lanes) → { notes:[{t,p,d,lane}], mel:[[t,p,d]], acc:[[t,p,d,v]], bpm, dur }
 * Alle Lieder sind gemeinfrei; jedes trägt seine Rechte-Angabe (lic) – bitte im Spiel anzeigen. */
(function (root) {
  'use strict';
  const C = root.KLCore, S = root.KLSongs;
  const me = document.currentScript && document.currentScript.src ? new URL('..', document.currentScript.src).href : new URL('../klavierlicht/', location.href).href;
  const PUB = (root.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/') + 'klavierlicht/archiv/';
  const BASES = [me + 'archiv/', PUB].filter((v, i, a) => a.indexOf(v) === i);
  const CATS = { kinder: '🧸 Kinderlieder', weihnacht: '🎄 Weihnachten', volk: '🌍 Volkslieder', klassik: '🎻 Klassik', choral: '⛪ Choräle' };
  let base = BASES[0], cache = null;
  const unlocked = () => { try { const m = JSON.parse(localStorage.getItem('klavierlicht-meta')); return (m && m.own && m.own.song) || []; } catch (e) { return []; } };
  async function list() {
    if (cache) return cache;
    const own = unlocked(), out = (S ? S.list : []).map(s => { const c = C.fromNotation(s); return { id: s.id, title: s.title, artist: s.artist, cat: s.cat, diff: C.difficulty(c), dur: Math.round(C.duration(c)), lic: s.lic, src: 'Klaviersatz: easygames', builtin: true, notation: s }; });
    for (const b of BASES) {
      try { const r = await fetch(b + 'index.json'); if (!r.ok) continue; const j = await r.json(); if (!Array.isArray(j.songs)) continue; base = b; j.songs.forEach(s => { if (!s.gems || own.includes(s.id)) out.push(s); }); break; } catch (e) { /* nächste Adresse */ }
    }
    return (cache = out);
  }
  async function chart(s) {
    if (s.builtin) return C.fromNotation(s.notation);
    const r = await fetch(base + encodeURIComponent(s.id) + '.json'); const c = await r.json(); if (!C.check(c)) throw new Error('Lied beschädigt'); return c;
  }
  // Spielbare Noten (Melodie, Spuren nach Tonhöhe) + alles, was zu hören ist: ganze Melodie und Begleitung
  function parts(c, level, lanes) {
    const notes = C.playable(c, level || 'normal', lanes || 4).map(n => ({ t: n.t, p: n.p, d: n.d, lane: n.lane }));
    const st = c.step / 1000, off = (c.off || 0) / 1000;
    const mel = c.mel.map(([s, p, d]) => [off + s * st, p, Math.max(st, d * st)]);
    return { notes, mel, acc: C.accompaniment(c), bpm: c.bpm || 100, dur: C.duration(c) };
  }
  root.KLSongLib = { list, chart, parts, CATS, get base() { return base; } };
})(window);
