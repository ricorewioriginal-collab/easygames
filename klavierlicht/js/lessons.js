/* Klavierlicht – Lernpfad: kleine Lektionen von der ersten Taste bis zu beiden Händen (eigene Übungen, Melodien gemeinfrei).
 * Schreibweise wie songs.js, zusätzlich Akkorde mit „+“: „C4+E4+G4*2“. rh = rechte Hand, lh = linke Hand.
 * chart(lesson) liefert ein Chart wie die Lieder; die linke Hand steht im Feld „lh“ (wird im Lernmodus als eigene Stimme gespielt). */
(function (root) {
  'use strict';
  const LESSONS = [
    { id: 'c', t: 'Das mittlere C', d: 'Finde das C in der Mitte der Tastatur (C4) – direkt links neben den zwei schwarzen Tasten. Spiele es mit dem Daumen der rechten Hand.', bpm: 66, rh: 'C4*2 C4*2 C4 C4 C4*2 C4 C4 C4 C4 C4*4' },
    { id: 'cde', t: 'C – D – E', d: 'Daumen auf C, Zeigefinger auf D, Mittelfinger auf E. Die Tasten rücken immer eine weiße Taste weiter.', bpm: 72, rh: 'C4 D4 E4*2 E4 D4 C4*2 C4 D4 E4 D4 C4*4' },
    { id: 'fuenf', t: 'Fünf Finger: C bis G', d: 'Jeder Finger der rechten Hand hat seine Taste: Daumen C, dann D, E, F und der kleine Finger auf G.', bpm: 76, rh: 'C4 D4 E4 F4 G4*2 G4*2 F4 E4 D4 C4*2 E4 G4 E4 C4*4' },
    { id: 'entchen', t: 'Erstes Lied: Alle meine Entchen', d: 'Mit den fünf Fingern und einem Schritt zum A spielst du dein erstes ganzes Lied.', bpm: 92, rh: 'C4 D4 E4 F4 G4*2 G4*2 A4 A4 A4 A4 G4*4 A4 A4 A4 A4 G4*4 F4 F4 F4 F4 E4*2 E4*2 D4 D4 D4 D4 C4*4' },
    { id: 'links', t: 'Die linke Hand', d: 'Jetzt spielt die linke Hand tiefe Töne: C und G eine Oktave unter der Mitte. Das ist der Bass zu vielen Liedern.', bpm: 72, lh: 'C3*2 G2*2 C3*2 G2*2 F2*2 G2*2 C3*4' },
    { id: 'schwarz', t: 'Die schwarzen Tasten', d: 'Schwarze Tasten heißen nach ihrem Nachbarn mit „#“ (Kreuz): F#, G#, A#. Nur schwarze Tasten klingen zusammen immer schön.', bpm: 80, rh: 'F#4 G#4 A#4*2 A#4 G#4 F#4*2 C#5*2 A#4*2 F#4*4 D#4 F#4 G#4 A#4 F#4*4' },
    { id: 'akkorde', t: 'Erste Akkorde', d: 'Drei Tasten gleichzeitig: C-Dur (C E G), F-Dur (C F A) und G-Dur (H D G). Drücke alle markierten Tasten zusammen.', bpm: 60, rh: 'C4+E4+G4*2 C4+E4+G4*2 C4+F4+A4*2 C4+F4+A4*2 B3+D4+G4*2 B3+D4+G4*2 C4+E4+G4*4' },
    { id: 'beide', t: 'Beide Hände', d: 'Rechts die Melodie von „Ode an die Freude“, links ein langer Basston dazu. Erst mit „Warten“ üben!', bpm: 80, rh: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4*1.5 D4/2 D4*2', lh: 'C3*4 G2*4 C3*4 G2*4' },
    { id: 'ode', t: 'Ode an die Freude (ganz)', d: 'Das ganze Thema von Beethoven mit beiden Händen.', bpm: 96, rh: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4*1.5 D4/2 D4*2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4*1.5 C4/2 C4*2', lh: 'C3*4 G2*4 C3*4 G2*4 C3*4 G2*4 C3*4 G2*2 C3*2' },
    { id: 'elise', t: 'Für Elise – der Anfang', d: 'Beethovens berühmter Anfang: schnell zwischen E und D# wechseln, dann der Weg hinunter zum A.', bpm: 66, rh: 'E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4*1.5 C4/2 E4/2 A4/2 B4*1.5 E4/2 G#4/2 B4/2 C5*1.5 E4/2 E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4*2', lh: 'A2*1.5 - A2*1.5 E2*1.5 - E2*1.5 A2*1.5 - A2*1.5' }
  ];
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
  function midi(n) { const m = /^([A-H])(#|b)?(-?\d)$/.exec(n); return m ? (+m[3] + 1) * 12 + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : null; }
  function len(tok) { const m = /(?:\*([\d.]+)|\/([\d.]+))$/.exec(tok); return m ? (m[1] ? +m[1] : 1 / +m[2]) : 1; }
  function parse(s) { const out = []; let t = 0; (s || '').trim().split(/\s+/).filter(Boolean).forEach(tok => { const d = Math.round(len(tok) * 4), n = tok.replace(/[*/][\d.]+$/, ''); if (n !== '-') n.split('+').forEach(x => { const p = midi(x); if (p != null) out.push([t, p, d]); }); t += d; }); return out; }
  function chart(L) {
    const step = 60 / L.bpm / 4;
    return { v: 1, id: 'lektion-' + L.id, title: L.t, artist: 'Lernpfad', cat: 'lernen', bpm: L.bpm, step: step * 1000, off: 0, mel: parse(L.rh), lh: parse(L.lh), acc: [], chords: [], bass: [], lesson: L.id, lic: 'Übung: easygames · Melodien gemeinfrei', src: 'Lernpfad Klavierlicht' };
  }
  const API = { LESSONS, chart, parse };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLLessons = API;
})(typeof window !== 'undefined' ? window : globalThis);
