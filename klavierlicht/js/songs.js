/* Klavierlicht – Lieder, die direkt im Spiel stecken (gemeinfreie Melodien, selbst gesetzt).
 * Schreibweise: Note mit Oktave (C4 = mittleres C, # für Kreuz), Länge in Schlägen: „E4“ = 1, „E4*2“ = 2, „E4/2“ = ½, „E4*1.5“; „-“ = Pause.
 * Akkorde in Schlägen genauso („C*4 G*4“, „Am*3“). Bass und Begleitung erzeugt das Spiel aus den Akkorden.
 * Weitere Lieder liegen im Online-Archiv (archiv/, Quelle tools/archiv-quelle.js) und werden erst beim Spielen geladen. */
(function (root) {
  'use strict';
  const S = [
    { id: 'entchen', lic: 'Volkslied (19. Jh.) – gemeinfrei', title: 'Alle meine Entchen', artist: 'Kinderlied', cat: 'kinder', bpm: 112,
      mel: 'C4 D4 E4 F4 G4*2 G4*2 A4 A4 A4 A4 G4*4 A4 A4 A4 A4 G4*4 F4 F4 F4 F4 E4*2 E4*2 D4 D4 D4 D4 C4*4',
      chords: 'C*4 C*4 F*4 C*4 F*4 C*4 F*4 C*4 G*4 C*4' },
    { id: 'haenschen', lic: 'Volksweise (19. Jh.), Text Franz Wiedemann (1821–1882) – gemeinfrei', title: 'Hänschen klein', artist: 'Kinderlied', cat: 'kinder', bpm: 116,
      mel: 'G4 E4 E4*2 F4 D4 D4*2 C4 D4 E4 F4 G4 G4 G4*2 G4 E4 E4*2 F4 D4 D4*2 C4 E4 G4 G4 C4*4 D4 D4 D4 D4 D4 E4 F4*2 E4 E4 E4 E4 E4 F4 G4*2 G4 E4 E4*2 F4 D4 D4*2 C4 E4 G4 G4 C4*4',
      chords: 'C*4 G*4 C*4 C*4 C*4 G*4 C*4 C*4 G*4 G*4 C*4 C*4 C*4 G*4 C*4 C*4' },
    { id: 'jakob', lic: 'Volksweise „Frère Jacques“ (18. Jh.) – gemeinfrei', title: 'Bruder Jakob', artist: 'Kinderlied (Kanon)', cat: 'kinder', bpm: 112,
      mel: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4*2 E4 F4 G4*2 G4/2 A4/2 G4/2 F4/2 E4 C4 G4/2 A4/2 G4/2 F4/2 E4 C4 C4 G3 C4*2 C4 G3 C4*2',
      chords: 'C*4 C*4 C*4 C*4 C*4 C*4 C*2 G*2 C*2 G*2' },
    { id: 'weihnachtsmann', lic: 'Melodie „Ah! vous dirai-je, maman“ (Frankreich, 18. Jh.), Text Hoffmann von Fallersleben (1798–1874) – gemeinfrei', title: 'Morgen kommt der Weihnachtsmann', artist: 'Weihnachtslied', cat: 'weihnacht', bpm: 104,
      mel: 'C4 C4 G4 G4 A4 A4 G4*2 F4 F4 E4 E4 D4 D4 C4*2 G4 G4 F4 F4 E4 E4 D4*2 G4 G4 F4 F4 E4 E4 D4*2 C4 C4 G4 G4 A4 A4 G4*2 F4 F4 E4 E4 D4 D4 C4*2',
      chords: 'C*4 F*2 C*2 F*2 C*2 G*2 C*2 C*2 F*2 C*2 G*2 C*2 F*2 C*2 G*2 C*4 F*2 C*2 F*2 C*2 G*2 C*2' },
    { id: 'stillenacht', lic: 'Franz Xaver Gruber (1787–1863), Text Joseph Mohr (1792–1848) – gemeinfrei', title: 'Stille Nacht', artist: 'Franz Xaver Gruber (1818)', cat: 'weihnacht', bpm: 132,
      mel: 'G4*1.5 A4/2 G4 E4*3 G4*1.5 A4/2 G4 E4*3 D5*2 D5 B4*3 C5*2 C5 G4*3 A4*2 A4 C5*1.5 B4/2 A4 G4*1.5 A4/2 G4 E4*3 A4*2 A4 C5*1.5 B4/2 A4 G4*1.5 A4/2 G4 E4*3 D5*2 D5 F5*1.5 D5/2 B4 C5*3 E5*3 C5*1.5 G4/2 E4 G4*1.5 F4/2 D4 C4*6',
      chords: 'C*3 C*3 C*3 C*3 G*3 G*3 C*3 C*3 F*3 F*3 C*3 C*3 F*3 F*3 C*3 C*3 G*3 G*3 C*3 C*3 C*3 G*3 C*6' },
    { id: 'jinglebells', lic: 'James Lord Pierpont (1822–1893) – gemeinfrei', title: 'Jingle Bells', artist: 'James Lord Pierpont (1857)', cat: 'weihnacht', bpm: 132,
      mel: 'E4 E4 E4*2 E4 E4 E4*2 E4 G4 C4*1.5 D4/2 E4*4 F4 F4 F4*1.5 F4/2 F4 E4 E4 E4/2 E4/2 E4 D4 D4 E4 D4*2 G4*2 E4 E4 E4*2 E4 E4 E4*2 E4 G4 C4*1.5 D4/2 E4*4 F4 F4 F4 F4 F4 E4 E4 E4/2 E4/2 G4 G4 F4 D4 C4*4',
      chords: 'C*4 C*4 C*4 C*4 F*4 C*4 G*4 G*4 C*4 C*4 C*4 C*4 F*4 C*4 G*4 C*4' },
    { id: 'ode', lic: 'Ludwig van Beethoven (1770–1827) – gemeinfrei', title: 'Ode an die Freude', artist: 'Ludwig van Beethoven', cat: 'klassik', bpm: 108,
      mel: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4*1.5 D4/2 D4*2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4*1.5 C4/2 C4*2 D4 D4 E4 C4 D4 E4/2 F4/2 E4 C4 D4 E4/2 F4/2 E4 D4 C4 D4 G3*2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4*1.5 C4/2 C4*2',
      chords: 'C*4 G*4 C*4 G*4 C*4 G*4 C*4 G*2 C*2 G*4 C*4 G*4 C*2 G*2 C*4 G*4 C*4 G*2 C*2' },
    { id: 'elise', lic: 'Ludwig van Beethoven (1770–1827) – gemeinfrei', title: 'Für Elise', artist: 'Ludwig van Beethoven', cat: 'klassik', bpm: 150,
      mel: 'E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4 -/2 C4/2 E4/2 A4/2 B4 -/2 E4/2 G#4/2 B4/2 C5 -/2 E4/2 E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4 -/2 C4/2 E4/2 A4/2 B4 -/2 E4/2 C5/2 B4/2 A4 - E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4 -/2 C4/2 E4/2 A4/2 B4 -/2 E4/2 G#4/2 B4/2 C5 -/2 E4/2 E5/2 D#5/2 E5/2 D#5/2 E5/2 B4/2 D5/2 C5/2 A4 -/2 C4/2 E4/2 A4/2 B4 -/2 E4/2 C5/2 B4/2 A4*3',
      chords: '-*1 -*3 Am*3 E*3 Am*3 -*3 Am*3 E*3 Am*3 -*3 Am*3 E*3 Am*3 -*3 Am*3 E*3 Am*3' },
    { id: 'greensleeves', lic: 'Englische Volksweise (16. Jh.) – gemeinfrei', title: 'Greensleeves', artist: 'Englisches Volkslied', cat: 'klassik', bpm: 150,
      mel: 'A4 C5*2 D5 E5*1.5 F5/2 E5 D5*2 B4 G4*1.5 A4/2 B4 C5*2 A4 A4*1.5 G#4/2 A4 B4*2 G#4 E4*2 A4 C5*2 D5 E5*1.5 F5/2 E5 D5*2 B4 G4*1.5 A4/2 B4 C5*1.5 B4/2 A4 G#4*1.5 F#4/2 G#4 A4*3 A4*3',
      chords: '-*1 Am*3 C*3 G*3 Em*3 Am*3 Am*3 E*3 E*3 Am*3 C*3 G*3 Em*3 Am*3 E*3 Am*3 Am*3' },
    { id: 'saints', lic: 'Spiritual (traditionell) – gemeinfrei', title: 'When the Saints Go Marching In', artist: 'Spiritual', cat: 'volk', bpm: 132,
      mel: 'C4 E4 F4 G4*4 - C4 E4 F4 G4*4 - C4 E4 F4 G4*2 E4*2 C4*2 E4*2 D4*4 - E4 E4 D4 C4*3 C4 E4*2 G4 G4 F4*4 -*2 E4 F4 G4*2 E4*2 C4*2 D4*2 C4*4',
      chords: '-*3 C*4 C*4 C*4 C*4 C*4 C*4 G*4 G*4 C*4 C*4 F*4 F*4 C*4 G*4 C*4' }
  ];
  const CATS = { alle: '🎹 Alle', kinder: '🧸 Kinderlieder', weihnacht: '🎄 Weihnachten', volk: '🌍 Volkslieder', klassik: '🎻 Klassik', choral: '⛪ Choräle' };
  root.KLSongs = { list: S, CATS };
})(typeof window !== 'undefined' ? window : globalThis);
