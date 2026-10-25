/* Beat-Studio – Kern ohne Browser (auch in Node testbar): Song-Modell, Tonarten, Song-Assistent (Genres), Ereignisliste
 * für Wiedergabe/Export, MIDI-Datei, WAV-Kodierung und die Radio-Jury.
 * Ein Song = Spuren (Drums, Bass, Akkorde, Melodie, Gesang) + 5 Abschnitts-Patterns (Intro, Strophe, Refrain, Bridge, Outro, je 4 Takte)
 * + Arrangement (Reihenfolge der Abschnitte). Noten liegen als Tonleiter-Stufen vor – alles bleibt automatisch in der Tonart. */
(function (root) {
  'use strict';
  const STEPS = 16, BARS = 4, PSTEPS = STEPS * BARS;   // 16tel je Takt, 4 Takte je Abschnitt
  const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  const SCALES = { dur: [0, 2, 4, 5, 7, 9, 11], moll: [0, 2, 3, 5, 7, 8, 10] };
  const SECS = { intro: { n: 'Intro', c: '#3a86ff' }, verse: { n: 'Strophe', c: '#22c55e' }, pre: { n: 'Pre-Chorus', c: '#14b8a6' }, chorus: { n: 'Refrain', c: '#ff4d8d' }, bridge: { n: 'Bridge', c: '#a855f7' }, outro: { n: 'Outro', c: '#f59e0b' } };
  const DRUMS = [['kick', 'Kick'], ['snare', 'Snare'], ['clap', 'Clap'], ['hat', 'Hi-Hat'], ['open', 'Open-Hat'], ['tom', 'Tom'], ['perc', 'Rimshot'], ['crash', 'Crash']];
  const DRUM_MIDI = { kick: 36, snare: 38, clap: 39, hat: 42, open: 46, tom: 45, perc: 37, crash: 49 };
  const TRACKS = ['drums', 'bass', 'chords', 'lead', 'vox'];
  const PRESETS = { bass: [['sub', 'Sub-Bass'], ['saw', 'Synth-Bass'], ['pluck', 'Pluck-Bass'], ['e', 'E-Bass']], chords: [['piano', 'Piano'], ['pad', 'Flächen-Pad'], ['organ', 'Orgel'], ['guitar', 'Gitarre'], ['stab', 'House-Stabs']],
    lead: [['synth', 'Synth-Lead'], ['flute', 'Flöte'], ['bell', 'Glocken'], ['brass', 'Bläser'], ['whistle', 'Pfeifen']], kit: [['pop', 'Pop'], ['808', '808 (Hip-Hop)'], ['house', 'House'], ['rock', 'Rock'], ['lofi', 'Lo-Fi']] };
  const CHORD_STYLES = [['hold', 'Liegend'], ['beat', 'Auf jeden Schlag'], ['offbeat', 'Offbeat'], ['arp', 'Arpeggio'], ['strum', 'Anschlag (8tel)']];

  // ---------- Zufall (mit Startwert, für „Neu würfeln“ und Tests) ----------
  function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- Tonart ----------
  // Stufe (0 = Grundton, 7 = Oktave …) → Halbtöne über dem Grundton
  function semi(scale, deg) { const s = SCALES[scale] || SCALES.dur, o = Math.floor(deg / 7), i = ((deg % 7) + 7) % 7; return s[i] + 12 * o; }
  function midi(song, deg, base) { return base + song.key + semi(song.scale, deg); }
  function chordName(song, deg) {
    const r = semi(song.scale, deg), t = semi(song.scale, deg + 2) - r, f = semi(song.scale, deg + 4) - r, n = NOTE[(song.key + r) % 12];
    return n + (t === 3 && f === 6 ? '°' : t === 3 ? 'm' : '');
  }
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  // ---------- Genres für den Song-Assistenten ----------
  // Drum-Rhythmen als 16tel-Zeichenketten (x = Schlag, o = leiser Schlag); je Abschnitt eigene Dichte
  const G = {
    pop: { n: 'Pop', icon: '💖', bpm: [100, 122], kit: 'pop', bass: 'saw', chords: 'piano', lead: 'synth', chordStyle: 'beat', swing: 0,
      drums: { kick: 'x.....x.x.......', snare: '....x.......x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..............x.' },
      bassRh: 'x.....x.x...x...', prog: { dur: [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4]], moll: [[0, 5, 2, 6], [0, 3, 6, 2], [5, 6, 0, 0]] }, leadRh: ['x.x.x...x.x.x...', 'x...x.x.x.......', 'x.xx..x.x.x.x...'] },
    hiphop: { n: 'Hip-Hop', icon: '🧢', bpm: [84, 96], kit: '808', bass: 'sub', chords: 'pad', lead: 'bell', chordStyle: 'hold', swing: 0.14,
      drums: { kick: 'x.....x...x.....', snare: '....x.......x...', clap: '............x...', hat: 'x.xxx.x.x.xxx.x.', perc: '.......x.......x' },
      bassRh: 'x.....x...x.....', prog: { dur: [[5, 3, 0, 4], [0, 3, 5, 4]], moll: [[0, 5, 3, 4], [0, 6, 5, 4], [0, 0, 5, 6]] }, leadRh: ['x..x..x...x.....', 'x.x...x.x..x....'] },
    house: { n: 'House', icon: '🪩', bpm: [120, 126], kit: 'house', bass: 'pluck', chords: 'stab', lead: 'synth', chordStyle: 'offbeat', swing: 0.04,
      drums: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '..x...x...x...x.', perc: '...x.......x....' },
      bassRh: '..x...x...x...x.', prog: { dur: [[5, 3, 0, 4], [0, 5, 3, 4]], moll: [[0, 5, 6, 3], [0, 6, 5, 6]] }, leadRh: ['x.x...x...x.x...', 'x..x..x.x.......'] },
    schlager: { n: 'Schlager', icon: '🎉', bpm: [124, 134], kit: 'pop', bass: 'e', chords: 'organ', lead: 'flute', chordStyle: 'offbeat', swing: 0,
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', clap: '....x.......x...' },
      bassRh: 'x.x.x.x.x.x.x.x.', prog: { dur: [[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 5, 3]], moll: [[0, 3, 4, 0], [0, 5, 6, 4]] }, leadRh: ['x.x.x.x.x...x...', 'x...x.x.x.x.....'] },
    rock: { n: 'Rock', icon: '🎸', bpm: [128, 150], kit: 'rock', bass: 'e', chords: 'guitar', lead: 'brass', chordStyle: 'strum', swing: 0,
      drums: { kick: 'x.x.....x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', crash: '' },
      bassRh: 'x.x.x.x.x.x.x.x.', prog: { dur: [[0, 3, 4, 3], [0, 4, 5, 3], [5, 3, 0, 4]], moll: [[0, 6, 5, 6], [0, 3, 6, 5]] }, leadRh: ['x...x...x.x.x...', 'x.x.x...x.......'] },
    lofi: { n: 'Lo-Fi', icon: '☕', bpm: [70, 84], kit: 'lofi', bass: 'sub', chords: 'piano', lead: 'bell', chordStyle: 'hold', swing: 0.18,
      drums: { kick: 'x......x..x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.xx', perc: '..........x.....' },
      bassRh: 'x......x..x.....', prog: { dur: [[3, 2, 1, 4], [3, 4, 2, 5], [1, 4, 0, 5]], moll: [[0, 3, 6, 2], [5, 3, 0, 4]] }, leadRh: ['x..x...x..x.....', '..x.x...x.......'] }
  };
  const ARR = { kurz: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'outro'], normal: ['intro', 'verse', 'pre', 'chorus', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'outro'],
    lang: ['intro', 'verse', 'pre', 'chorus', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'chorus', 'outro'] };

  const emptyDrums = () => { const d = {}; DRUMS.forEach(([k]) => { d[k] = new Array(PSTEPS).fill(0); }); return d; };
  function emptyPattern() { return { drums: emptyDrums(), bass: [], chords: [0, 0, 0, 0], lead: [] }; }
  function newSong(o) {
    o = o || {}; const s = { v: 1, id: o.id || ('s' + Date.now().toString(36) + Math.floor(Math.random() * 1e4)), name: o.name || 'Mein Song', artist: o.artist || '', genre: o.genre || 'pop',
      bpm: o.bpm || 110, key: o.key || 0, scale: o.scale || 'dur', swing: o.swing || 0, created: Date.now(), updated: Date.now(),
      mix: { drums: { vol: .9, pan: 0, mute: 0, solo: 0, preset: 'pop' }, bass: { vol: .8, pan: 0, mute: 0, solo: 0, preset: 'saw' }, chords: { vol: .6, pan: -.15, mute: 0, solo: 0, preset: 'piano', style: 'beat' },
        lead: { vol: .7, pan: .15, mute: 0, solo: 0, preset: 'synth' }, vox: { vol: 1, pan: 0, mute: 0, solo: 0, fx: 'hall' }, master: { vol: .85, reverb: .25 } },
      pat: {}, arr: [], vox: {}, edits: 0 };   // vox: { blockIndex: clipId } – Aufnahmen liegen im Browser (IndexedDB)
    Object.keys(SECS).forEach(k => { s.pat[k] = emptyPattern(); });
    return s;
  }

  // ---------- Song-Assistent: kompletter Song aus Genre, Tonart, Tempo ----------
  function strToSteps(str, bars, mod) { const a = new Array(PSTEPS).fill(0); if (!str) return a; for (let b = 0; b < bars; b++) for (let i = 0; i < 16; i++) { const c = str[i]; if (c === 'x' || c === 'o') a[b * 16 + i] = c === 'x' ? 1 : .6; } return mod ? mod(a) : a; }
  function genDrums(g, sec, r) {
    const d = emptyDrums(), D = g.drums;
    const use = (k, s, f) => { d[k] = strToSteps(s, BARS, f); };
    const fill = a => { for (let i = 60; i < 64; i++) a[i] = r() < .7 ? 1 : 0; return a; };   // Tom-Fill am Ende
    if (sec === 'intro' || sec === 'outro') { use('hat', D.hat); use('kick', sec === 'outro' ? D.kick : 'x.......x.......'); if (sec === 'outro') d.kick.fill(0, 32); }
    else if (sec === 'verse') { use('kick', D.kick); use('snare', D.snare || D.clap); use('hat', D.hat); if (D.perc) use('perc', D.perc); }
    else if (sec === 'pre') { use('kick', D.kick); use('snare', D.snare || D.clap); use('hat', D.hat); for (let i = 48; i < 64; i += 2) d.snare[i] = i >= 56 ? 1 : .6; }
    else if (sec === 'chorus') { use('kick', D.kick); use('snare', D.snare || D.clap); use('clap', D.clap || D.snare); use('hat', D.hat); use('open', D.open || '..............x.'); if (D.perc) use('perc', D.perc); d.crash[0] = 1; d.tom = fill(d.tom); }
    else if (sec === 'bridge') { use('kick', 'x.......x.......'); use('hat', D.hat); use('snare', '............x...'); }
    if (sec === 'verse' && r() < .5) d.tom = fill(d.tom);
    return d;
  }
  function genBass(g, prog, sec, r) {
    if (sec === 'intro') return [];
    const out = [], rh = g.bassRh;
    for (let b = 0; b < BARS; b++) { const root = prog[b];
      for (let i = 0; i < 16; i++) { if (rh[i] !== 'x') continue; let n = root; if (g.bass === 'e' && i % 4 === 2 && r() < .35) n = root + 4; if (g.bassRh === 'x.x.x.x.x.x.x.x.' && i % 4 === 2) n = root + 7;   // Quinte/Oktave
        let l = 1; for (let j = i + 1; j < 16 && rh[j] !== 'x'; j++) l++; if (sec === 'bridge' && i > 0) continue; out.push({ s: b * 16 + i, n: n, l: Math.min(l, sec === 'bridge' ? 16 : l) }); } }
    if (sec === 'outro') return out.filter(x => x.s < 32);
    return out;
  }
  function genLead(g, prog, sec, r) {
    if (sec === 'intro' || sec === 'outro') return sec === 'intro' && r() < .5 ? motif(g, prog, r, 7, true).filter(x => x.s >= 32) : [];
    const base = sec === 'chorus' ? 7 : sec === 'pre' ? 5 : sec === 'bridge' ? 4 : 2;   // Refrain höher
    return motif(g, prog, r, base, sec === 'bridge');
  }
  // Melodie: 2-Takt-Motiv (Akkordtöne auf schweren Zeiten), Takt 3–4 wiederholt mit Variation am Ende
  function motif(g, prog, r, base, sparse) {
    const rh = pick(r, g.leadRh), out = []; let last = base;
    for (let half = 0; half < 2; half++) {
      for (let b = 0; b < 2; b++) {
        const bar = half * 2 + b, chord = prog[bar], tones = [chord, chord + 2, chord + 4].map(x => { let t = x; while (t < base - 3) t += 7; while (t > base + 5) t -= 7; return t; });
        for (let i = 0; i < 16; i++) {
          if (rh[i] !== 'x' || (sparse && r() < .45)) continue;
          let n;
          if (half === 1 && b === 0 && out.length) { const src = out.find(x => x.s === b * 16 + i); if (src) n = src.n; }   // Wiederholung
          if (n == null) n = i % 4 === 0 ? pick(r, tones) : clamp(last + pick(r, [-2, -1, -1, 1, 1, 2]), base - 4, base + 6);
          if (half === 1 && b === 1 && i >= 8) n = tones[0];   // Auflösung auf den Grundton des Akkords
          let l = 1; for (let j = i + 1; j < 16 && rh[j] !== 'x'; j++) l++;
          out.push({ s: bar * 16 + i, n, l: Math.min(l, 4) }); last = n;
        }
      }
    }
    return out;
  }
  function generate(o) {
    const g = G[o.genre] || G.pop, r = rng(o.seed || Date.now()), scale = o.scale || (o.genre === 'lofi' || o.genre === 'hiphop' ? 'moll' : 'dur');
    const s = newSong({ name: o.name, artist: o.artist, genre: o.genre || 'pop', key: o.key != null ? o.key : Math.floor(r() * 12), scale, swing: g.swing,
      bpm: o.bpm || Math.round(g.bpm[0] + r() * (g.bpm[1] - g.bpm[0])) });
    s.mix.drums.preset = g.kit; s.mix.bass.preset = g.bass; s.mix.chords.preset = g.chords; s.mix.chords.style = g.chordStyle; s.mix.lead.preset = g.lead;
    const progs = g.prog[scale] || g.prog.dur, pv = pick(r, progs), pc = pick(r, progs), pb = progs.length > 1 ? progs.find(x => x !== pc) || pv : [3, 4, 5, 4];
    const P = { intro: pv, verse: pv, pre: [3, 4, 3, 4], chorus: pc, bridge: pb, outro: pc };
    Object.keys(SECS).forEach(sec => { const p = s.pat[sec]; p.chords = P[sec].slice(); p.drums = genDrums(g, sec, r); p.bass = genBass(g, p.chords, sec, r); p.lead = genLead(g, p.chords, sec, r); });
    s.arr = (ARR[o.len || 'normal'] || ARR.normal).map(sec => ({ sec, rep: sec === 'verse' || sec === 'chorus' ? 2 : 1 }));
    const want = { kurz: 80, normal: 140, lang: 170 }[o.len || 'normal'] || 140;   // schnelle Genres: Refrain/Bridge doppeln, bis die Länge passt
    for (const k of ['bridge', 'pre', 'intro']) if (songSec(s) < want) s.arr.forEach(b => { if (b.sec === k && songSec(s) < want) b.rep = 2; });
    while (songSec(s) < want && s.arr.length < 14) s.arr.splice(s.arr.length - 1, 0, { sec: 'chorus', rep: 2 });
    return s;
  }
  // Einzelne Spur eines Abschnitts neu würfeln
  function reroll(song, sec, track, seed) {
    const g = G[song.genre] || G.pop, r = rng(seed || Date.now()), p = song.pat[sec];
    if (track === 'drums') p.drums = genDrums(g, sec, r); else if (track === 'bass') p.bass = genBass(g, p.chords, sec === 'intro' ? 'verse' : sec, r);
    else if (track === 'lead') p.lead = genLead(g, p.chords, sec === 'intro' || sec === 'outro' ? 'verse' : sec, r);
    else if (track === 'chords') { const pr = pick(r, g.prog[song.scale] || g.prog.dur); p.chords = pr.slice(); }
  }

  // ---------- Zeiten & Ereignisse (für Wiedergabe, Export und MIDI) ----------
  const barSec = s => 240 / s.bpm, patSec = s => barSec(s) * BARS, blockSec = (s, b) => patSec(s) * ((b && b.rep) || 1);   // Block = Abschnitt, 1× oder 2× gespielt (4 oder 8 Takte)
  const songSec = s => s.arr.reduce((a, b) => a + blockSec(s, b), 0);
  const blockStart = (s, i) => { let t = 0; for (let k = 0; k < i; k++) t += blockSec(s, s.arr[k]); return t; };
  function stepTime(s, step) { const sd = 60 / s.bpm / 4; return step * sd + (step % 2 ? s.swing * sd : 0); }
  // Ereignisse eines Abschnitts (Zeit relativ zum Abschnitt): { t, d, tr, kind, m(idi), v(el), drum }
  function patEvents(s, sec, opt) {
    const p = s.pat[sec], ev = [], sd = 60 / s.bpm / 4, mix = s.mix;
    DRUMS.forEach(([k]) => p.drums[k].forEach((v, i) => { if (v) ev.push({ t: stepTime(s, i), d: k === 'crash' ? 1.6 : k === 'open' ? .35 : .15, tr: 'drums', drum: k, m: DRUM_MIDI[k], v }); }));
    p.bass.forEach(n => ev.push({ t: stepTime(s, n.s), d: n.l * sd * .95, tr: 'bass', m: midi(s, n.n, 36), v: .9 }));
    p.lead.forEach(n => ev.push({ t: stepTime(s, n.s), d: n.l * sd * .95, tr: 'lead', m: midi(s, n.n, 60), v: .85 }));
    const style = mix.chords.style || 'hold';
    p.chords.forEach((c, b) => {
      const notes = [c, c + 2, c + 4].map(x => midi(s, x, 48 + (semi(s.scale, c) > 7 ? -12 : 0))), t0 = b * 16;
      const hit = (st, len, v, ns) => (ns || notes).forEach(m => ev.push({ t: stepTime(s, t0 + st), d: len * sd * .92, tr: 'chords', m, v }));
      if (style === 'hold') hit(0, 16, .7);
      else if (style === 'beat') for (let i = 0; i < 16; i += 4) hit(i, 3, i ? .6 : .75);
      else if (style === 'offbeat') for (let i = 2; i < 16; i += 4) hit(i, 1.6, .7);
      else if (style === 'strum') for (let i = 0; i < 16; i += 2) hit(i, 1.8, i % 4 ? .5 : .7);
      else if (style === 'arp') for (let i = 0; i < 16; i += 2) hit(i, 2, .6, [notes[[0, 1, 2, 1][(i / 2) % 4]] + (i % 8 >= 6 ? 12 : 0)]);
    });
    if (opt && opt.only) return ev.filter(e => e.tr === opt.only);
    return ev;
  }
  // ganzer Song (oder Ausschnitt ab Block from): absolute Zeiten
  function events(s, opt) {
    const out = [], ps = patSec(s), from = (opt && opt.from) || 0, to = opt && opt.to != null ? opt.to : s.arr.length; let t0 = 0;
    for (let i = from; i < to; i++) { const b = s.arr[i]; if (!b || !s.pat[b.sec]) continue; for (let r = 0; r < (b.rep || 1); r++) patEvents(s, b.sec, opt).forEach(e => { e.t += t0 + r * ps; e.block = i; out.push(e); }); t0 += blockSec(s, b); }
    return out.sort((a, b) => a.t - b.t);
  }
  // hörbare Spuren nach Mute/Solo
  function audible(s, tr) { const m = s.mix, solo = TRACKS.some(k => m[k].solo); return !m[tr].mute && (!solo || m[tr].solo); }

  // ---------- Export: MIDI (Format 1, eine Spur je Instrument) ----------
  function midiFile(s) {
    const tpq = 480, vlq = n => { const b = [n & 127]; while ((n >>= 7)) b.unshift((n & 127) | 128); return b; }, str = t => Array.from(unescape(encodeURIComponent(t))).map(c => c.charCodeAt(0));
    const sd = tpq / 4, tracks = [];
    const tempo = Math.round(60000000 / s.bpm);
    tracks.push([0, 0xFF, 0x03, ...vlq(str(s.name).length), ...str(s.name), 0, 0xFF, 0x51, 3, (tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255, 0, 0xFF, 0x58, 4, 4, 2, 24, 8, 0, 0xFF, 0x2F, 0]);
    const PROG = { bass: 33, chords: { piano: 0, pad: 89, organ: 16, guitar: 25, stab: 81 }, lead: { synth: 80, flute: 73, bell: 10, brass: 61, whistle: 78 } };
    [['drums', 9], ['bass', 0], ['chords', 1], ['lead', 2]].forEach(([tr, ch]) => {
      const ev = [], bs = s.bpm / 60 * tpq;   // Sekunden → Ticks
      events(s, { only: tr }).forEach(e => { const on = Math.round(e.t * bs), off = Math.round((e.t + Math.max(.05, e.d)) * bs), v = clamp(Math.round(e.v * 110), 1, 127); ev.push([on, 0x90 | ch, e.m, v], [off, 0x80 | ch, e.m, 0]); });
      ev.sort((a, b) => a[0] - b[0] || (a[1] & 0xF0) - (b[1] & 0xF0));
      const prog = tr === 'bass' ? PROG.bass : tr === 'drums' ? 0 : (PROG[tr][s.mix[tr].preset] || 0);
      const bytes = [0, 0xFF, 0x03, ...vlq(str(tr).length), ...str(tr)]; if (tr !== 'drums') bytes.push(0, 0xC0 | ch, prog);
      let last = 0; ev.forEach(e => { bytes.push(...vlq(e[0] - last), e[1], e[2], e[3]); last = e[0]; }); bytes.push(0, 0xFF, 0x2F, 0); tracks.push(bytes); void sd;
    });
    const out = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, tracks.length, (tpq >> 8) & 255, tpq & 255];
    tracks.forEach(t => { out.push(0x4D, 0x54, 0x72, 0x6B, (t.length >>> 24) & 255, (t.length >>> 16) & 255, (t.length >>> 8) & 255, t.length & 255); for (const b of t) out.push(b); });
    return new Uint8Array(out);
  }
  // ---------- Export: WAV (16 Bit PCM, Stereo) ----------
  function wav(chans, sr) {
    const n = chans[0].length, nc = chans.length, buf = new ArrayBuffer(44 + n * nc * 2), v = new DataView(buf); let o = 0;
    const w = s => { for (let i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i)); }, u32 = x => { v.setUint32(o, x, true); o += 4; }, u16 = x => { v.setUint16(o, x, true); o += 2; };
    w('RIFF'); u32(36 + n * nc * 2); w('WAVE'); w('fmt '); u32(16); u16(1); u16(nc); u32(sr); u32(sr * nc * 2); u16(nc * 2); u16(16); w('data'); u32(n * nc * 2);
    for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) { const x = clamp(chans[c][i], -1, 1); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); o += 2; }
    return new Uint8Array(buf);
  }

  // ---------- Radio-Jury ----------
  const JURY = [{ id: 'rico', name: 'Rico', role: 'Programmchef', img: '🎙️' }, { id: 'mia', name: 'DJ Mia', role: 'Club-DJane', img: '🎧' }, { id: 'kalle', name: 'Kalle', role: 'Musikredakteur', img: '📻' }];
  function rate(s, info) {
    info = info || {};
    const dur = songSec(s), secs = s.arr.map(b => b.sec), uniq = new Set(secs), chorusN = secs.filter(x => x === 'chorus').length;
    const used = [...uniq].map(k => s.pat[k]), leadN = used.reduce((n, p) => n + p.lead.length, 0), drumN = used.reduce((n, p) => n + Object.values(p.drums).reduce((a, x) => a + x.filter(Boolean).length, 0), 0);
    const leadRange = (() => { const ns = used.flatMap(p => p.lead.map(x => x.n)); return ns.length ? Math.max(...ns) - Math.min(...ns) : 0; })();
    const sig = k => JSON.stringify(s.pat[k]), variety = new Set([...uniq].map(sig)).size / Math.max(1, uniq.size);
    const voxN = Object.keys(s.vox || {}).filter(k => s.vox[k] && +k < s.arr.length).length;
    const C = {
      laenge: dur >= 120 && dur <= 260 ? 100 : dur >= 75 && dur <= 330 ? 70 : dur >= 40 ? 40 : 15,
      aufbau: clamp((uniq.has('verse') ? 30 : 0) + (uniq.has('chorus') ? 30 : 0) + (chorusN >= 2 ? 20 : 0) + (uniq.has('intro') || uniq.has('outro') ? 10 : 0) + (uniq.has('bridge') || uniq.has('pre') ? 10 : 0), 0, 100),
      melodie: clamp((leadN >= 12 ? 50 : leadN * 4) + (leadRange >= 4 && leadRange <= 12 ? 35 : leadRange > 0 ? 15 : 0) + (s.pat.chorus && s.pat.chorus.lead.length >= 6 ? 15 : 0), 0, 100),
      groove: clamp(drumN >= 40 ? 70 + Math.min(30, (drumN - 40) / 6) : drumN * 1.6, 0, 100),
      abwechslung: Math.round(clamp(variety * 100, 0, 100)),
      mix: clamp(100 - (info.peak > 1 ? 40 : 0) - TRACKS.filter(k => s.mix[k].mute).length * 8 - (Math.abs(s.mix.master.vol - .85) > .4 ? 15 : 0), 0, 100),
      gesang: voxN ? clamp(50 + voxN * 15, 0, 100) : 30,
      eigen: clamp(Math.round((s.edits || 0) * 2.5), 0, 100)   // eigene Handschrift: wie viel du am Assistenten-Song verändert hast
    };
    const W = { laenge: .1, aufbau: .15, melodie: .15, groove: .1, abwechslung: .1, mix: .08, gesang: .14, eigen: .18 };
    const score = Math.round(Object.keys(W).reduce((a, k) => a + C[k] * W[k], 0));
    const stars = score >= 88 ? 5 : score >= 76 ? 4 : score >= 62 ? 3 : score >= 45 ? 2 : 1;
    const chart = score >= 92 ? 1 : score >= 85 ? Math.round(2 + (92 - score) / 2) : score >= 70 ? Math.round(6 + (85 - score)) : score >= 50 ? Math.round(22 + (70 - score) * 1.5) : null;
    const says = [];
    const low = Object.keys(C).sort((a, b) => C[a] - C[b])[0], high = Object.keys(C).sort((a, b) => C[b] - C[a])[0];
    const TIP = { laenge: 'Der Song ist zu ' + (dur < 120 ? 'kurz – ein, zwei Abschnitte mehr im Arrangement' : 'lang – kürz das Arrangement etwas') + '.', aufbau: 'Mir fehlt ein klarer Aufbau: Strophe, Refrain und den Refrain mindestens zweimal!', melodie: 'Die Melodie ist noch dünn – gib dem Refrain eine Hook, die man mitsingen kann.',
      groove: 'Da fehlt Druck im Beat – mehr Kick und Hi-Hats!', abwechslung: 'Alle Teile klingen gleich – mach Strophe und Refrain unterschiedlicher.', mix: 'Im Mix ist was faul – zu laut oder zu viele Spuren stumm.', gesang: 'Nimm noch Gesang auf – erst eine Stimme macht den Song zum Hit!', eigen: 'Klingt noch sehr nach Baukasten – mach ihn zu deinem: eigene Beats, Melodie, Akkorde!' };
    const LOB = { laenge: 'Perfekte Radio-Länge!', aufbau: 'Der Aufbau sitzt wie bei einem echten Hit.', melodie: 'Die Melodie geht sofort ins Ohr!', groove: 'Der Beat schiebt richtig!', abwechslung: 'Schön abwechslungsreich.', mix: 'Sauber abgemischt.', gesang: 'Mit Gesang – das ist ein richtiger Song!', eigen: 'Man hört deine eigene Handschrift!' };
    says.push({ j: JURY[0], t: score >= 76 ? 'Den spielen wir! ' + LOB[high] : score >= 55 ? 'Solide Nummer. ' + LOB[high] : 'Noch nicht radiotauglich. ' + TIP[low] });
    says.push({ j: JURY[1], t: C.groove >= 70 ? 'Auf der Tanzfläche geht das ab – ' + Math.round(s.bpm) + ' BPM sind genau richtig.' : TIP.groove });
    says.push({ j: JURY[2], t: low !== 'groove' ? TIP[low] : C.melodie >= 70 ? LOB.melodie : TIP.melodie });
    return { score, stars, chart, crit: C, says, dur };
  }
  const CRIT_N = { laenge: 'Länge', aufbau: 'Aufbau', melodie: 'Melodie', groove: 'Groove', abwechslung: 'Abwechslung', mix: 'Mix', gesang: 'Gesang', eigen: 'Eigene Handschrift' };

  // ---------- Prüfen & Reparieren (Laden aus Speicher/Datei) ----------
  function repair(x) {
    if (!x || typeof x !== 'object' || !x.pat) return null; const s = newSong({ id: String(x.id || ''), name: String(x.name || 'Song').slice(0, 60), artist: String(x.artist || '').slice(0, 40), genre: G[x.genre] ? x.genre : 'pop',
      bpm: clamp(+x.bpm || 110, 50, 200), key: clamp(Math.round(+x.key) || 0, 0, 11), scale: x.scale === 'moll' ? 'moll' : 'dur', swing: clamp(+x.swing || 0, 0, .4) });
    s.created = +x.created || Date.now(); s.updated = +x.updated || Date.now();
    Object.keys(SECS).forEach(k => { const p = x.pat[k]; if (!p) return; const q = s.pat[k];
      DRUMS.forEach(([d]) => { if (p.drums && Array.isArray(p.drums[d])) q.drums[d] = Array.from({ length: PSTEPS }, (_, i) => clamp(+p.drums[d][i] || 0, 0, 1)); });
      ['bass', 'lead'].forEach(t => { if (Array.isArray(p[t])) q[t] = p[t].filter(n => n && isFinite(n.s) && isFinite(n.n)).map(n => ({ s: clamp(Math.round(n.s), 0, PSTEPS - 1), n: clamp(Math.round(n.n), -7, 21), l: clamp(Math.round(n.l) || 1, 1, 16) })).slice(0, 256); });
      if (Array.isArray(p.chords)) q.chords = [0, 1, 2, 3].map(i => clamp(Math.round(+p.chords[i]) || 0, 0, 6)); });
    if (Array.isArray(x.arr)) s.arr = x.arr.filter(b => b && SECS[b.sec]).slice(0, 40).map(b => ({ sec: b.sec, rep: b.rep === 2 ? 2 : 1 }));
    s.edits = clamp(Math.round(+x.edits) || 0, 0, 1e6);
    if (x.mix) TRACKS.concat('master').forEach(k => { if (x.mix[k]) Object.keys(s.mix[k]).forEach(f => { const v = x.mix[k][f]; if (typeof v === typeof s.mix[k][f]) s.mix[k][f] = typeof v === 'number' ? clamp(v, -1, 1.5) : String(v).slice(0, 20); }); });
    if (x.vox && typeof x.vox === 'object') Object.keys(x.vox).forEach(k => { if (/^\d+$/.test(k) && typeof x.vox[k] === 'string') s.vox[k] = x.vox[k].slice(0, 80); });
    return s;
  }

  const API = { STEPS, BARS, PSTEPS, NOTE, SCALES, SECS, DRUMS, DRUM_MIDI, TRACKS, PRESETS, CHORD_STYLES, G, ARR, ROMAN, JURY, CRIT_N, rng, semi, midi, chordName, newSong, emptyPattern, generate, reroll,
    barSec, patSec, blockSec, blockStart, songSec, stepTime, patEvents, events, audible, midiFile, wav, rate, repair, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BSCore = API;
})(typeof window !== 'undefined' ? window : globalThis);
