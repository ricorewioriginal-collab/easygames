// Beat-Studio · Recording-Suite – Kern-Test (Node): Comping, Tonhöhe, Treffsicherheit, Autotune, Gate, Latenz, Lautheit/Limiter, MIDI, Quantisieren, Bereinigen
const R = require('../js/rec-core.js'); let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) fail++; };
const sr = 48000, sine = (f, sec, a) => Float32Array.from({ length: Math.round(sr * sec) }, (_, i) => (a || .5) * Math.sin(2 * Math.PI * f * i / sr));
// Comping: oberster Take klingt, darunterliegender füllt die Lücken
const seg = R.compSegments([{ id: 'a', start: 0, len: 10, trimA: 0, enabled: 1, order: 0 }, { id: 'b', start: 4, len: 2, trimA: 1, enabled: 1, order: 1 }, { id: 'c', start: 1, len: 1, trimA: 0, enabled: 0, order: 5 }]);
ok(JSON.stringify(seg.map(s => [s.id, s.a, s.b, s.off])) === JSON.stringify([['a', 0, 4, 0], ['b', 4, 6, 1], ['a', 6, 10, 6]]), 'Comping: a | b oben | a (ausgeschalteter Take c stumm)');
ok(R.loopPasses(10, 4).length === 3 && R.loopPasses(10, 4)[2].b === 10, 'Schleifen-Durchläufe');
// Tonhöhe
const f = R.yin(sine(220, .05).subarray(0, 2048), sr); ok(Math.abs(f - 220) < 2, 'YIN erkennt 220 Hz (' + f.toFixed(1) + ')');
const pt = R.pitchTrack(sine(440, 1), sr); ok(pt.f0.length > 40 && pt.f0.filter(x => Math.abs(x - 440) < 5).length > pt.f0.length * .9, 'Tonhöhenverlauf 440 Hz');
ok(R.yin(new Float32Array(2048), sr) === 0, 'Stille = keine Tonhöhe');
const pcs = R.scalePcs(0, 'dur'); ok(R.pitchScore(pt.f0, pcs).score === 100, 'A in C-Dur: 100 % getroffen');
const off = R.pitchTrack(sine(440 * Math.pow(2, .5 / 12), 1), sr); ok(R.pitchScore(off.f0, pcs).score < 20, 'Viertelton daneben: schlechte Treffsicherheit');
// Autotune: 30 Cent zu tief → danach nah an A4
const flat = sine(440 * Math.pow(2, -.3 / 12), 1.2), tuned = R.autotune(flat, sr, pcs, 1), t2 = R.pitchTrack(tuned.subarray(sr * .3 | 0), sr);
const mid = Array.from(t2.f0).filter(x => x > 0), avg = mid.reduce((a, b) => a + b, 0) / mid.length;
ok(tuned.length === flat.length && Math.abs(1200 * Math.log2(avg / 440)) < 8, 'Autotune zieht −30 Cent auf A4 (' + (1200 * Math.log2(avg / 440)).toFixed(1) + ' Cent)');
ok(R.autotune(flat, sr, pcs, 0) !== flat && R.autotune(flat, sr, pcs, 0)[100] === flat[100], 'Autotune aus = unverändert');
// Gate: leises Rauschen wird leiser, Ton bleibt
const g = new Float32Array(sr); for (let i = 0; i < sr; i++) g[i] = i < sr / 2 ? (Math.random() - .5) * .002 : .5 * Math.sin(i / 10); const go = R.gate(g, sr, .6);
ok(Math.abs(go[sr / 4]) < .0002 && Math.abs(go[sr * .8 | 0]) > .9 * Math.abs(g[sr * .8 | 0]), 'Gate: Rauschen weg, Gesang bleibt');
// Latenz
const rec = new Float32Array(sr * 2); [.5, 1, 1.5].forEach(c => { const i = Math.round((c + .087) * sr); for (let k = 0; k < 40; k++) rec[i + k] = .8 * Math.sin(k); });
ok(Math.abs(R.detectLatency(rec, sr, [.5, 1, 1.5]) - 87) <= 1, 'Latenz gemessen: 87 ms');
// Lautheit + Limiter
const loud = [sine(1000, 3, .9), sine(1000, 3, .9)], L0 = R.lufs(loud, sr); ok(L0 > -5 && L0 < 2, 'LUFS eines lauten Sinus (' + L0.toFixed(1) + ')');
const m = R.master(loud, sr, { target: -14, lim: 1 }); ok(Math.abs(m.after + 14) < .6 && Math.max(...loud[0].slice(0, 5000).map(Math.abs)) <= Math.pow(10, -1 / 20) + 1e-6, 'Mastering auf −14 LUFS, Spitzen unter −1 dBFS (' + m.after.toFixed(1) + ')');
const pk = [sine(200, 1, .3)]; pk[0][24000] = 1.6; const red = R.limit(pk, sr, -1); ok(red < -4.5 && red > -6 && Math.max(...pk[0].map(Math.abs)) <= .892, 'Limiter fängt Spitze ab (' + red + ' dB)');
// MIDI
const notes = [[0, 60, 1, .8], [1, 64, .5, .7], [1.5, 67, 2, .9]], back = R.midiRead(R.midiWrite(notes, 96, 'Test'));
ok(back.bpm === 96 && back.notes.length === 3 && back.notes.every((n, i) => Math.abs(n[0] - notes[i][0]) < .01 && n[1] === notes[i][1] && Math.abs(n[2] - notes[i][2]) < .01), 'MIDI schreiben und lesen');
let bad = false; try { R.midiRead(new Uint8Array([1, 2, 3])); } catch (e) { bad = true; } ok(bad, 'Keine MIDI-Datei wird erkannt');
const q = R.quantize([[0.07, 60, .2, 1], [1.13, 62, .3, 1]], 4, 1); ok(q[0][0] === 0 && q[1][0] === 1.25 && q[0][2] === .25, 'Quantisieren auf 16tel');
ok(R.quantize([[0.1, 60, .2, 1]], 4, .5)[0][0] === .05, 'Quantisieren mit halber Stärke');
// Songtext
ok(R.parseLyrics('  Zeile 1\n\nZeile 2 \n').length === 2 && R.lineAt([0, 4, null, 9], 5) === 1 && R.lineAt([2], 1) === -1, 'Songtext-Zeilen und Teleprompter');
ok(Math.abs(R.delayTime(120, '1/8d') - .375) < 1e-9, 'Echo im Takt (punktierte Achtel)');
// Bereinigen
const c = R.clean({ tracks: [{ kind: 'audio', vol: 9, takes: [{ id: 'v1', start: -3, len: 4 }, { id: '../x', start: 0, len: 1 }], fx: { eqL: 99, comp: 'x' } }, { kind: 'inst', preset: 'böse', notes: [[0, 200, 1], ['a', 1, 1]] }, null], target: 5, lyrT: [1, 'x'] });
ok(c.tracks.length === 2 && c.tracks[0].vol === 1.5 && c.tracks[0].takes.length === 1 && c.tracks[0].takes[0].start === 0 && c.tracks[0].fx.eqL === 12 && c.tracks[0].fx.comp === 0, 'Bereinigen: Spur, Takes, Effekte');
ok(c.tracks[1].preset === 'lead:synth' && c.tracks[1].notes.length === 1 && c.tracks[1].notes[0][1] === 108 && c.target === -14 && c.lyrT[1] === null, 'Bereinigen: Instrument, Noten, Ziel, Songtext-Zeiten');
ok(R.takeIds(c).join() === 'v1' && R.projectEnd(c) === 4, 'Take-Liste und Projektende');
console.log(fail ? fail + ' Fehler' : 'Alles grün'); process.exit(fail ? 1 : 0);
