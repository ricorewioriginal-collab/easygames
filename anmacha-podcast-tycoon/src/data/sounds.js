/* Algorithmisch erzeugte Klänge für Q04 Geräuscheraten (und frei nutzbar für die Oberfläche).
   PT.DATA.sounds = [{ id, name, cat, parts: [{ wave, f, f2, t, d, v, filter, lfo }] }] – Rezeptformat siehe minigames/README.md. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  PT.DATA = PT.DATA || {};
  const P = (wave, f, t, d, v, more) => Object.assign({ wave, f, t, d, v }, more || {});
  const rep = (times, fn) => times.map(fn); // mehrere gleichartige Teile zu Startzeiten
  // Applaus: viele kurze Klatscher zu festen, unregelmäßigen Zeiten
  const CLAPS = [0, 0.07, 0.11, 0.19, 0.26, 0.3, 0.37, 0.45, 0.5, 0.58, 0.63, 0.71, 0.77, 0.84, 0.9, 0.97, 1.05, 1.1, 1.18, 1.24, 1.31, 1.4, 1.46, 1.55];

  PT.DATA.sounds = [
    { id: 'snd01', name: 'Türklingel', cat: 'Haushalt', parts: [P('sine', 660, 0, 0.7, 0.4), P('sine', 524, 0.45, 1.0, 0.4)] },
    { id: 'snd02', name: 'Telefon-Klingeln', cat: 'Haushalt', parts: [P('triangle', 900, 0, 0.45, 0.25, { lfo: { f: 22, depth: 90 } }), P('triangle', 900, 0.7, 0.45, 0.25, { lfo: { f: 22, depth: 90 } })] },
    { id: 'snd03', name: 'Wecker', cat: 'Haushalt', parts: rep([0, 0.14, 0.28, 0.42, 0.75, 0.89, 1.03, 1.17], t => P('square', 1800, t, 0.08, 0.15, { filter: { type: 'lowpass', f: 3500, q: 1 } })) },
    { id: 'snd04', name: 'Regen', cat: 'Natur', parts: [P('noise', 0, 0, 2.2, 0.3, { filter: { type: 'highpass', f: 2500, q: 0.7 } })].concat(rep([0.2, 0.55, 0.8, 1.3, 1.7], t => P('sine', 1500, t, 0.05, 0.2, { f2: 900 }))) },
    { id: 'snd05', name: 'Wind', cat: 'Natur', parts: [P('noise', 0, 0, 2.3, 0.35, { filter: { type: 'bandpass', f: 420, q: 4 } }), P('noise', 0, 0.6, 1.5, 0.25, { filter: { type: 'bandpass', f: 800, q: 6 } })] },
    { id: 'snd06', name: 'Donner', cat: 'Natur', parts: [P('noise', 0, 0, 0.35, 0.45, { filter: { type: 'lowpass', f: 900, q: 1 } }), P('noise', 0, 0.1, 2.2, 0.5, { filter: { type: 'lowpass', f: 180, q: 1 } })] },
    { id: 'snd07', name: 'Autohupe', cat: 'Verkehr', parts: [P('square', 400, 0, 0.8, 0.18, { filter: { type: 'lowpass', f: 1600, q: 1 } }), P('square', 500, 0, 0.8, 0.18, { filter: { type: 'lowpass', f: 1600, q: 1 } })] },
    { id: 'snd08', name: 'Dampfpfeife eines Zuges', cat: 'Verkehr', parts: [P('triangle', 587, 0, 1.5, 0.15), P('triangle', 740, 0, 1.5, 0.15), P('triangle', 880, 0, 1.5, 0.12), P('noise', 0, 0, 1.5, 0.12, { filter: { type: 'bandpass', f: 2200, q: 1 } })] },
    { id: 'snd09', name: 'Bahnübergang-Bimmeln', cat: 'Verkehr', parts: rep([0, 0.45, 0.9, 1.35, 1.8], t => P('triangle', 1250, t, 0.35, 0.3)) },
    { id: 'snd10', name: 'Laserstrahl', cat: 'Technik', parts: [P('sawtooth', 1800, 0, 0.3, 0.22, { f2: 200 }), P('sawtooth', 1800, 0.4, 0.3, 0.22, { f2: 200 })] },
    { id: 'snd11', name: 'Herzschlag', cat: 'Körper', parts: rep([0, 0.22, 0.9, 1.12, 1.8, 2.02], (t, i) => P('sine', i % 2 ? 50 : 65, t, 0.16, 0.5, { f2: 35 })) },
    { id: 'snd12', name: 'Ufo', cat: 'Technik', parts: [P('sine', 600, 0, 2.0, 0.25, { lfo: { f: 7, depth: 220 } })] },
    { id: 'snd13', name: 'Sirene', cat: 'Verkehr', parts: [P('triangle', 650, 0, 0.8, 0.22, { f2: 1150 }), P('triangle', 1150, 0.8, 0.8, 0.22, { f2: 650 })] },
    { id: 'snd14', name: 'Wassertropfen', cat: 'Natur', parts: rep([0, 0.6, 1.1], t => P('sine', 500, t, 0.09, 0.45, { f2: 1700 })) },
    { id: 'snd15', name: 'Registrierkasse', cat: 'Haushalt', parts: [P('noise', 0, 0, 0.12, 0.3, { filter: { type: 'highpass', f: 3000, q: 1 } }), P('sine', 2000, 0.1, 0.7, 0.3), P('sine', 2500, 0.16, 0.7, 0.25)] },
    { id: 'snd16', name: 'Gong', cat: 'Musik', parts: [P('sine', 110, 0, 2.5, 0.45, { lfo: { f: 3, depth: 2 } }), P('sine', 233, 0, 2.0, 0.2), P('sine', 371, 0, 1.4, 0.12)] },
    { id: 'snd17', name: 'Kuckucksuhr', cat: 'Haushalt', parts: rep([0, 0.3, 0.9, 1.2], (t, i) => P('sine', i % 2 ? 587 : 740, t, 0.24, 0.35)) },
    { id: 'snd18', name: 'Modem beim Verbinden', cat: 'Technik', parts: [P('square', 1200, 0, 0.3, 0.12), P('square', 2400, 0.3, 0.3, 0.1), P('noise', 0, 0.6, 0.8, 0.2, { filter: { type: 'bandpass', f: 1800, q: 2 } }), P('sawtooth', 980, 1.0, 0.6, 0.08, { lfo: { f: 40, depth: 600 } })] },
    { id: 'snd19', name: 'Startton eines Rechners', cat: 'Technik', parts: [P('sine', 262, 0, 1.6, 0.14), P('sine', 330, 0.04, 1.6, 0.12), P('sine', 392, 0.08, 1.6, 0.12), P('sine', 523, 0.12, 1.6, 0.1)] },
    { id: 'snd20', name: 'Applaus', cat: 'Menschen', parts: CLAPS.map((t, i) => P('noise', 0, t, 0.05, 0.3, { filter: { type: 'bandpass', f: 1200 + (i * 370) % 1400, q: 1.5 } })) },
    { id: 'snd21', name: 'Mücke', cat: 'Natur', parts: [P('sawtooth', 620, 0, 2.0, 0.08, { lfo: { f: 5, depth: 40 }, filter: { type: 'bandpass', f: 1200, q: 2 } })] },
    { id: 'snd22', name: 'Kirchenglocke', cat: 'Musik', parts: [P('sine', 392, 0, 1.4, 0.3), P('sine', 940, 0, 0.9, 0.12), P('sine', 392, 1.1, 1.4, 0.3), P('sine', 940, 1.1, 0.9, 0.12)] },
    { id: 'snd23', name: 'Spieluhr', cat: 'Musik', parts: [1047, 1319, 1568, 1319, 1175, 1047].map((f, i) => P('triangle', f, i * 0.28, 0.45, 0.2)) },
    { id: 'snd24', name: 'Fahrradklingel', cat: 'Verkehr', parts: [P('sine', 2100, 0, 0.35, 0.25, { lfo: { f: 30, depth: 60 } }), P('sine', 2100, 0.2, 0.5, 0.25, { lfo: { f: 30, depth: 60 } })] },
    { id: 'snd25', name: 'Pfeifkessel', cat: 'Haushalt', parts: [P('sine', 1700, 0, 2.0, 0.14, { f2: 2100 }), P('noise', 0, 0, 2.0, 0.08, { filter: { type: 'bandpass', f: 2000, q: 3 } })] },
    { id: 'snd26', name: 'Fanfare', cat: 'Musik', parts: [523, 659, 784, 1047].map((f, i) => P('sawtooth', f, i * 0.16, i === 3 ? 0.8 : 0.16, 0.13, { filter: { type: 'lowpass', f: 2500, q: 1 } })) },
    { id: 'snd27', name: 'Uhrenticken', cat: 'Haushalt', parts: rep([0, 0.5, 1.0, 1.5, 2.0], (t, i) => P('noise', 0, t, 0.03, 0.4, { filter: { type: 'bandpass', f: i % 2 ? 2600 : 3400, q: 4 } })) }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = PT.DATA.sounds;
})(typeof window !== 'undefined' ? window : globalThis);
