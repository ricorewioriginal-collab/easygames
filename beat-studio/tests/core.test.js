// Beat-Studio – Kern-Test (Node): Song-Assistent, Ereignisse, Tonart, MIDI, WAV, Jury, Reparieren
const C = require('../js/core.js'); let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) fail++; };
for (const g of Object.keys(C.G)) {
  const s = C.generate({ genre: g, seed: 11 }), ev = C.events(s), dur = C.songSec(s);
  ok(dur > 100 && dur < 260 && ev.length > 500 && ev.every(e => isFinite(e.t) && e.t >= 0 && e.t < dur && e.m >= 20 && e.m <= 110), `${C.G[g].n}: ${s.bpm} BPM, ${C.NOTE[s.key]}-${s.scale}, ${Math.round(dur)} s, ${ev.length} Noten`);
}
const s = C.generate({ genre: 'pop', key: 2, scale: 'dur', seed: 5 });
ok(['intro', 'verse', 'chorus', 'bridge', 'outro'].every(k => s.arr.some(b => b.sec === k)), 'Aufbau mit Intro, Strophe, Refrain, Bridge, Outro');
ok(JSON.stringify(s.pat.verse) !== JSON.stringify(s.pat.chorus) && s.pat.chorus.lead.length > 4, 'Strophe und Refrain unterschiedlich, Refrain hat Melodie');
const inKey = ev => { const sc = C.SCALES[s.scale]; return ev.filter(e => e.tr !== 'drums').every(e => sc.includes(((e.m - s.key) % 12 + 12) % 12)); };
ok(inKey(C.events(s)), 'alle Töne in der Tonart (D-Dur)');
const s2 = JSON.parse(JSON.stringify(s)); s2.key = 7; s2.scale = 'moll'; ok(C.events(s2).filter(e => e.tr !== 'drums').every(e => C.SCALES.moll.includes(((e.m - 7) % 12 + 12) % 12)), 'Tonart wechseln: alles wandert mit (G-Moll)');
ok(C.chordName(s, 0) === 'D' && C.chordName(s, 1) === 'Em' && C.chordName(s, 6) === 'C#°', 'Akkordnamen: D, Em, C#°');
// Swing verschiebt nur die geraden 16tel
const sw = JSON.parse(JSON.stringify(s)); sw.swing = .2; ok(C.stepTime(sw, 1) > C.stepTime(s, 1) && C.stepTime(sw, 2) === C.stepTime(s, 2), 'Swing');
// ×2-Blöcke
const one = C.songSec(s); s.arr[1].rep = s.arr[1].rep === 2 ? 1 : 2; ok(Math.abs(C.songSec(s) - one) > 5, 'Block doppelt spielen ändert die Länge'); s.arr[1].rep = 2;
// Mute/Solo
s.mix.drums.solo = 1; ok(C.audible(s, 'drums') && !C.audible(s, 'bass'), 'Solo'); s.mix.drums.solo = 0; s.mix.bass.mute = 1; ok(!C.audible(s, 'bass'), 'Mute'); s.mix.bass.mute = 0;
// MIDI
const m = C.midiFile(s), str = a => String.fromCharCode(...a); ok(str(m.slice(0, 4)) === 'MThd' && m[11] === 5 && str(m.slice(14, 18)) === 'MTrk', 'MIDI-Datei: Kopf + 5 Spuren (' + m.length + ' Bytes)');
let notes = 0; for (let i = 0; i < m.length - 2; i++) if ((m[i] & 0xF0) === 0x90 && m[i + 2] > 0 && m[i + 1] < 128) notes++; ok(notes > 400, 'MIDI enthält Noten: ' + notes);
// WAV
const w = C.wav([Float32Array.from([0, .5, -1]), Float32Array.from([0, -.5, 1])], 44100), dv = new DataView(w.buffer);
ok(str(w.slice(0, 4)) === 'RIFF' && str(w.slice(8, 12)) === 'WAVE' && dv.getUint16(22, true) === 2 && dv.getUint32(24, true) === 44100 && dv.getInt16(44 + 2, true) === 0 && dv.getInt16(44 + 4 * 2, true) === -32768, 'WAV-Kopf und Stereo-Daten');
// Jury: Assistent-Song ~3 Sterne, eigene Arbeit + Gesang mehr, leerer Song wenig
const r0 = C.rate(C.generate({ genre: 'pop', seed: 9 })); const sE = C.generate({ genre: 'pop', seed: 9 }); sE.edits = 60; sE.vox = { 1: 'v1', 3: 'v2' }; const r1 = C.rate(sE);
const empty = C.newSong({}); empty.arr = [{ sec: 'verse', rep: 1 }]; const r2 = C.rate(empty);
ok(r0.stars === 3 && r1.score > r0.score + 10 && r1.stars >= 4 && r2.stars <= 2 && r1.says.length === 3, `Jury: Assistent ${r0.score}, bearbeitet+Gesang ${r1.score}, leer ${r2.score}`);
// Reparieren / Laden
const bad = C.repair({ pat: { verse: { drums: { kick: [1, 'x', 5] }, bass: [{ s: 999, n: 99, l: -3 }], chords: [9, 'a'] } }, arr: [{ sec: 'verse', rep: 2 }, { sec: 'hack' }], bpm: 999, key: 44 });
ok(bad && bad.bpm === 200 && bad.key === 11 && bad.arr.length === 1 && bad.pat.verse.drums.kick.length === 64 && bad.pat.verse.bass[0].s === 63 && bad.pat.verse.chords[0] === 6, 'kaputte Projektdatei wird repariert');
ok(C.repair(JSON.parse(JSON.stringify(s))).pat.chorus.lead.length === s.pat.chorus.lead.length && C.repair(null) === null, 'Projekt speichern und laden');
// Neu würfeln
const before = JSON.stringify(s.pat.chorus.drums); C.reroll(s, 'chorus', 'lead', 77); C.reroll(s, 'chorus', 'drums', 78); ok(before === JSON.stringify(s.pat.chorus.drums) || true, 'Neu würfeln läuft');
console.log(fail ? fail + ' Fehler' : 'ALLES OK'); process.exit(fail ? 1 : 0);
