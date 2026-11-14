/* SHOW ME YOUR VOICE – Klavierlicht-Songs: gemeinfreie Lieder mit echten Noten (Kopie in ./klavierlicht/, unabhängig vom Spiel Klavierlicht).
 * SMYVKL.list() → Promise<[{ id, title, artist, cat, diff, dur, lic, src, builtin }]>, SMYVKL.chart(song) → Promise<Chart>,
 * SMYVKL.prepare(chart, { melody, vol }) → { P, bpm, beat0, kl: { notes, mel }, time } – Uhr + Klavier-Begleitung für die Bühne.
 * Die Noten laufen im Takt der Musik: Melodie = Noten zum Treffen/Ansingen, Begleitung (Bass + Akkorde oder Originalsatz) spielt das Klavier. */
(function (root) {
  'use strict';
  const C = root.KLCore, S = root.KLSongs, K = root.KLPiano;
  const BASE = new URL('klavierlicht/archiv/', document.currentScript && document.currentScript.src ? new URL('..', document.currentScript.src) : location.href).href;
  const CATS = { kinder: ['🧸', 'Kinderlieder'], weihnacht: ['🎄', 'Weihnachten'], volk: ['🌍', 'Volkslieder'], klassik: ['🎻', 'Klassik'], choral: ['⛪', 'Choräle'] };
  const INTRO = 2;   // Sekunden Vorzähler, bevor die erste Note kommt
  let cache = null, busy = null;
  const builtin = () => (S ? S.list : []).map(s => { const c = C.fromNotation(s); return { id: s.id, title: s.title, artist: s.artist, cat: s.cat, diff: C.difficulty(c), dur: Math.round(C.duration(c)), lic: s.lic, src: 'Klaviersatz: easygames', builtin: true }; });
  function list() {
    if (cache) return Promise.resolve(cache);
    if (busy) return busy;
    busy = fetch(BASE + 'index.json').then(r => (r.ok ? r.json() : { songs: [] })).catch(() => ({ songs: [] }))
      .then(j => { const out = builtin(); (Array.isArray(j.songs) ? j.songs : []).forEach(s => { if (s && s.id && !out.some(x => x.id === s.id)) out.push({ id: s.id, title: s.title, artist: s.artist, cat: s.cat, diff: s.diff, dur: s.dur, lic: s.lic, src: s.src }); });
        out.sort((a, b) => a.title.localeCompare(b.title, 'de')); busy = null; return (cache = out); });
    return busy;
  }
  const cached = () => cache || builtin();
  async function chart(s) {
    const b = S && S.list.find(x => x.id === s.id);
    if (b) return C.fromNotation(b);
    const r = await fetch(BASE + encodeURIComponent(s.id) + '.json'); if (!r.ok) throw new Error('Lied nicht gefunden');
    const c = await r.json(); if (!C.check(c)) throw new Error('Lied beschädigt'); return c;
  }
  // Stil für die Jury (Lieblingsstile): aus Tempo und Kategorie
  function styleOf(s, bpm) { bpm = bpm || 100; return s.cat === 'choral' || bpm < 92 ? 'ballade' : bpm >= 150 ? 'rock' : s.cat === 'volk' && bpm < 120 ? 'soul' : 'pop'; }
  const catTxt = c => (CATS[c] ? CATS[c][0] + ' ' + CATS[c][1] : '🎹 Klavierlicht');
  const stars = d => '★'.repeat(Math.max(1, Math.min(4, d || 1))) + '☆'.repeat(4 - Math.max(1, Math.min(4, d || 1)));
  function find(q) {
    const n = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const w = n(q).split(/\s+/).filter(Boolean); if (!w.length) return [];
    return cached().filter(s => { const h = n(s.title + ' ' + s.artist + ' ' + catTxt(s.cat)); return w.every(x => h.includes(x)); });
  }

  // Abspielen: Klavier-Begleitung (und auf Wunsch die Melodie), läuft in Schleife, bis die Bühne fertig ist
  function prepare(c, o) {
    o = o || {}; K.init(); K.setTimbre('klavier'); K.setVolume(0.8 * (o.vol == null ? 0.7 : o.vol));
    const st = c.step / 1000, bpm = c.bpm || 100, beat = 60 / bpm, len = C.duration(c), D = Math.ceil((len + beat * 2) / beat) * beat;   // Liedlänge auf ganze Schläge + 2 Schläge Luft
    const ev = C.accompaniment(c).map(e => e.slice());
    const offS = (c.off || 0) / 1000, melEv = c.mel.map(([s, p, d]) => [offS + s * st, p, Math.max(st, d * st), 0.4]);
    if (o.melody) melEv.forEach(e => ev.push(e));
    ev.sort((a, b) => a[0] - b[0]);
    const REPS = 6, one = C.playable(c, o.level || 'normal', 4), notes = [], mel = [];
    for (let k = 0; k < REPS; k++) {
      one.forEach(n => notes.push({ t: INTRO + k * D + n.t, p: n.p, d: n.d, lane: n.lane }));
      melEv.forEach(e => mel.push([INTRO + k * D + e[0], e[1], e[2]]));
    }
    let playing = false, t0 = 0, at = 0, timer = 0, cur = { k: 0, i: 0, click: 0 };
    const ctxT = () => (K.ctx ? K.ctx.currentTime : 0);
    const time = () => (playing ? ctxT() - t0 : at);
    function seekCursor(t) { const s = t - INTRO, k = Math.max(0, Math.floor(s / D)), r = s - k * D; cur.k = k; cur.i = 0; while (cur.i < ev.length && ev[cur.i][0] < r) cur.i++; cur.click = Math.max(0, Math.ceil(t / beat - 1e-6)); }
    function pump() {
      if (!playing) return; const now = time(), until = now + 0.3;
      while (cur.click * beat < INTRO && cur.click * beat < until) { K.drum(cur.click % 4 ? 'click' : 'accent', t0 + cur.click * beat, 0.5); cur.click++; }   // Vorzähler
      for (let guard = 0; guard < 400; guard++) {
        if (cur.k >= REPS) return;
        if (cur.i >= ev.length) { cur.k++; cur.i = 0; continue; }
        const e = ev[cur.i], t = INTRO + cur.k * D + e[0]; if (t > until) return;
        if (t >= now - 0.05) K.note(e[1], t0 + t, e[2], e[3]);
        cur.i++;
      }
    }
    const P = {
      play() { if (playing) return; K.init(); t0 = ctxT() - at; playing = true; seekCursor(at); pump(); timer = setInterval(pump, 60); },
      pause() { if (!playing) return; at = time(); playing = false; clearInterval(timer); timer = 0; K.stopAll(); },
      destroy() { this.pause(); at = 0; },
      playing: () => playing && !!K.ctx && K.ctx.state === 'running',
      time, duration: () => INTRO + REPS * D
    };
    return { P, bpm, beat0: INTRO, time, kl: { notes, mel }, len, loop: D };
  }
  root.SMYVKL = { list, cached, chart, prepare, styleOf, CATS, catTxt, stars, find, INTRO };
})(window);
