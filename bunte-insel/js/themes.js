'use strict';
/* Bunte Insel – Bereichs-Musik: jede Welt und jeder Bereich hat eine eigene, selbst komponierte Melodie.
   Alles wird im Browser erzeugt (WebAudio, siehe audio.js), keine Dateien, keine fremden Lieder.
   Aufbau eines Themas: bpm, spb (Schritte pro Takt: 16 = 4/4, 12 = 3/4, 8 = 2/4), swing, chords (ein Akkord pro Takt, Schleife),
   lead.notes (ein Wort pro Schritt, „.“ = Pause), bass/arp (Muster pro Takt: x = Grundton, 5 = Quinte, o = Oktave, 1–4 = Akkordton, * = ganzer Akkord),
   drums (k = Bass, s = Snare/Klatschen, h = Hi-Hat; je ein x pro Schritt), Lautstärken sind bewusst leise. */
BI.THEMES = {
  /* Hauptinsel: sonnige Wiese, Ukulele-Zupfen */
  insel: { name: 'Sonnige Wiese', bpm: 92, chords: ['C', 'Am', 'F', 'G'], pad: { type: 'sine', vol: .045 }, arp: { pat: '1.3.2.3.1.3.2.3.', type: 'triangle', vol: .035, len: 1.6 }, bass: { pat: 'x.......5.......', type: 'sine', vol: .07, len: 3 },
    drums: { k: 'x.......x.......', kv: .06, h: 'x...x...x...x...', hv: .012 }, lead: { type: 'triangle', vol: .06, len: 2.4, bell: true, notes: 'E5 . . . G5 . E5 . D5 . C5 . . . . .  C5 . . . E5 . A4 . . . C5 . E5 . . .  A4 . . . C5 . F5 . E5 . C5 . A4 . . .  B4 . D5 . G5 . . . F5 . D5 . B4 . . .' } },
  /* Stadt: lockerer Jazz-Shuffle mit Vibrafon */
  stadt: { name: 'Stadt-Jazz', bpm: 104, swing: .3, chords: ['Dm7', 'G7', 'Cmaj7', 'Am7'], pad: { type: 'triangle', vol: .04 }, bass: { pat: 'x...5...x...o...', type: 'sine', vol: .08, len: 3.5 },
    drums: { k: 'x.......x.......', kv: .08, s: '....x.......x...', sv: .03, h: 'x.x.x.x.x.x.x.x.', hv: .012 }, lead: { type: 'sine', vol: .07, len: 2, bell: true, notes: 'F5 . . A5 . . G5 . . F5 . . D5 . . .  D5 . . F5 . . B5 . . A5 . . G5 . . .  E5 . . G5 . . B5 . . C6 . . B5 . . .  E5 . . C5 . . A4 . . C5 . . E5 . . .' } },
  /* Freizeitpark: Jahrmarkt-Walzer mit Drehorgel */
  park: { name: 'Jahrmarkt-Walzer', bpm: 132, spb: 12, chords: ['C', 'G7', 'C', 'F', 'C', 'G7', 'C', 'C'], bass: { pat: 'x...........', type: 'triangle', vol: .09, len: 2.5 }, arp: { pat: '....*...*...', type: 'square', vol: .02, len: 1.6 },
    drums: { h: '....x...x...', hv: .015 }, lead: { type: 'triangle', vol: .06, len: 2.2, bell: true, notes: 'E5 . G5 . C6 . G5 . E5 . G5 .  D5 . F5 . B5 . G5 . F5 . D5 .  E5 . G5 . C6 . E6 . C6 . G5 .  F5 . A5 . C6 . A5 . F5 . A5 .  E5 . G5 . C6 . G5 . E5 . G5 .  D5 . F5 . B5 . D6 . B5 . G5 .  E5 . C6 . G5 . E5 . G5 . C5 .  C5 . E5 . G5 . C6 . . . . .' } },
  /* Regenbogen-Plaza: fröhlicher Mitsing-Pop */
  regenbogen: { name: 'Regenbogen-Pop', bpm: 112, chords: ['C', 'G', 'Am', 'F'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.2.3.2.1.2.3.2.', type: 'triangle', vol: .03, len: 1.6 }, bass: { pat: 'x...x...5...x...', type: 'sine', vol: .08, len: 3 },
    drums: { k: 'x...x...x...x...', kv: .08, s: '....x.......x...', sv: .035, h: 'x.x.x.x.x.x.x.x.', hv: .014 }, lead: { type: 'triangle', vol: .065, len: 2.4, bell: true, notes: 'E5 . E5 G5 . . E5 . C5 . . . G4 . . .  D5 . D5 G5 . . B5 . A5 . . . G5 . . .  C5 . C5 E5 . . A5 . G5 . . . E5 . . .  A4 . C5 F5 . . A5 . G5 . F5 . C5 . . .' } },
  /* Regenbogen-Bühne: Disco, Vierviertel-Bass, Hook */
  buehne: { name: 'Pride-Disco', bpm: 122, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'], pad: { type: 'sawtooth', vol: .016 }, bass: { pat: 'x.o.x.o.x.o.x.o.', type: 'sine', vol: .15, len: 1.6 },
    drums: { k: 'x...x...x...x...', kv: .2, s: '....x.......x...', sv: .1, h: '..x...x...x...x.', hv: .035 }, lead: { type: 'sawtooth', vol: .032, len: 1.6, bell: true, notes: 'E5 . A5 . C6 . A5 . E5 . A5 . C6 . E6 .  F5 . A5 . C6 . A5 . F5 . A5 . C6 . F6 .  E5 . G5 . C6 . G5 . E5 . G5 . C6 . E6 .  D5 . G5 . B5 . G5 . D5 . G5 . B5 . D6 .  A5 . . A5 . . C6 . . . E6 . . . . .  A5 . . A5 . . C6 . . . F6 . . . . .  G5 . . G5 . . C6 . . . E6 . . . . .  G5 . . G5 . . B5 . . . D6 . . . . .' } },
  /* Freibad: Strand-Ukulele */
  pool: { name: 'Strandparty', bpm: 90, swing: .25, chords: ['C', 'Am', 'Dm', 'G'], arp: { pat: '.*..*.*..*..*.*.', type: 'triangle', vol: .03, len: 1 }, bass: { pat: 'x.......5.....x.', type: 'sine', vol: .08, len: 3 },
    drums: { k: 'x.......x.......', kv: .06, h: 'x.x.x.x.x.x.x.x.', hv: .012 }, lead: { type: 'sine', vol: .06, len: 2.4, notes: 'G5 . . E5 . . G5 . . . A5 . G5 . . .  E5 . . C5 . . E5 . . . G5 . E5 . . .  F5 . . D5 . . F5 . . . A5 . F5 . . .  D5 . . B4 . . D5 . . . G5 . D5 . . .' } },
  /* Bauernhof: Polka */
  farm: { name: 'Hof-Polka', bpm: 120, spb: 8, chords: ['C', 'G', 'C', 'G'], bass: { pat: 'x...5...', type: 'triangle', vol: .09, len: 2 }, arp: { pat: '..*...*.', type: 'triangle', vol: .03, len: 1.4 },
    lead: { type: 'triangle', vol: .06, len: 1.8, bell: true, notes: 'E5 . G5 . E5 . C5 .  D5 . B4 . D5 . G4 .  E5 G5 C6 . G5 . E5 .  D5 . F5 . D5 . G5 .' } },
  /* Lagerfeuer: leise Gitarre im Dreivierteltakt */
  camp: { name: 'Lagerfeuer', bpm: 66, spb: 12, chords: ['Am', 'F', 'C', 'G'], arp: { pat: '1.2.3.4.3.2.', type: 'triangle', vol: .04, len: 3 }, bass: { pat: 'x...........', type: 'sine', vol: .06, len: 6 },
    lead: { type: 'sine', vol: .05, len: 5, notes: 'E5 . . . . . A5 . . . . .  C6 . . . . . A5 . . . . .  G5 . . . . . E5 . . . . .  D5 . . . . . G5 . . . . .' } },
  /* Kampfarena: treibender Rock */
  arena: { name: 'Arena-Rock', bpm: 134, chords: ['Em', 'C', 'D', 'Em'], bass: { pat: 'x.x.x.x.x.x.x.x.', type: 'sawtooth', vol: .05, len: 1.2 },
    drums: { k: 'x...x...x...x.x.', kv: .12, s: '....x.......x...', sv: .06, h: 'x.x.x.x.x.x.x.x.', hv: .02 }, lead: { type: 'square', vol: .03, len: 1.8, notes: 'E5 . . G5 . . B5 . . . A5 . G5 . . .  E5 . . G5 . . C6 . . . B5 . G5 . . .  F#5 . . A5 . . D6 . . . C#6 . A5 . . .  E5 . G5 . B5 . E6 . . . . . . . . .' } },
  /* Verbotener Wald: dunkel, ein Herzschlag */
  wald: { name: 'Verbotener Wald', bpm: 62, chords: ['Am', 'Fmaj7', 'E7', 'Am'], pad: { type: 'sine', vol: .07 }, bass: { pat: 'x...............', type: 'sine', vol: .08, len: 12 },
    drums: { k: 'x.....x.........', kv: .05 }, lead: { type: 'sine', vol: .04, len: 4, notes: 'A4 . . . . . . . C5 . . . . . . .  A4 . . . . . . . E5 . . . . . . .  G#4 . . . . . . . B4 . . . . . . .  A4 . . . . . . . . . . . . . . .' } },
  /* Fellretter-Bucht: heldenhafter Marsch mit Trompeten */
  fellretter: { name: 'Fellretter-Marsch', bpm: 118, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'], pad: { type: 'sawtooth', vol: .014 }, bass: { pat: 'x...5...x...5...', type: 'triangle', vol: .09, len: 2 },
    drums: { k: 'x.......x.......', kv: .1, s: 'x.x.x.x.x.x.x.xx', sv: .03, h: '..x...x...x...x.', hv: .012 }, lead: { type: 'square', vol: .03, len: 2.2, bell: true, notes: 'G4 . . . C5 . . . E5 . . . G5 . . .  G5 . F5 . D5 . . . B4 . . . D5 . . .  E5 . . . A5 . . . C6 . . . A5 . . .  A5 . G5 . F5 . . . C5 . . . F5 . . .  E5 . . G5 . . C6 . . . B5 . A5 . . .  G5 . . . D5 . . . G5 . . . B5 . . .  A5 . . A5 . . G5 . . . F5 . . . . .  G5 . . . G5 . . . C6 . . . . . . .' } },
  /* Dampfer-Hafen: Ragtime der 1920er (eigene Melodie, Klavier-Stil mit Oompah-Bass) */
  dampfer: { name: 'Dampfer-Ragtime', bpm: 138, swing: .22, chords: ['C', 'C', 'E7', 'E7', 'A7', 'A7', 'D7', 'G7'], bass: { pat: 'x...5...x...5...', type: 'triangle', vol: .1, len: 2 }, arp: { pat: '..*...*...*...*.', type: 'triangle', vol: .03, len: 1.2 },
    drums: { k: 'x.......x.......', kv: .05, h: 'x.x.x.x.x.x.x.x.', hv: .012 }, lead: { type: 'triangle', vol: .075, len: 1.8, bell: true, notes: 'E5 . G5 . E5 . C5 . . G4 . C5 . E5 . .  G5 . . E5 . C5 . . A4 . C5 . E5 . . .  G#4 . B4 . D5 . B4 . G#4 . E4 . B4 . . .  E5 . D5 . B4 . G#4 . . B4 . D5 . E5 . .  A4 . C#5 . E5 . C#5 . A4 . G4 . E4 . . .  C#5 . E5 . G5 . E5 . . C#5 . A4 . C#5 . .  D5 . F#5 . A5 . F#5 . D5 . C5 . A4 . F#4 .  B4 . D5 . G5 . F5 . D5 . B4 . G4 . . .' } },
  /* Drachenhöhen: leichtes Fantasy-Abenteuer (eigene Melodie, Flöte + Marschtrommel) */
  drachen: { name: 'Drachen-Abenteuer', bpm: 112, chords: ['Dm', 'Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'Am'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.2.3.2.1.2.3.2.', type: 'triangle', vol: .03, len: 1.6 }, bass: { pat: 'x...5...x...x...', type: 'sine', vol: .09, len: 2.4 },
    drums: { k: 'x.......x.......', kv: .09, s: '....x.......x...', sv: .04, h: 'x.x.x.x.x.x.x.x.', hv: .013 }, lead: { type: 'triangle', vol: .065, len: 2.2, bell: true, notes: 'A4 . D5 . F5 . A5 . . G5 . F5 . D5 . .  D5 . F5 . Bb4 . D5 . F5 . . D5 . Bb4 . .  E5 . G5 . C6 . G5 . E5 . D5 . C5 . . .  E5 . A5 . C6 . B5 . A5 . . G5 . E5 . .  D5 . . F5 . . A5 . . D6 . A5 . F5 . .  Bb4 . . D5 . . F5 . . Bb5 . F5 . D5 . .  C5 . . E5 . . G5 . . C6 . G5 . E5 . .  A4 . . C5 . . E5 . . A5 . E5 . C5 . .' } },
  schluessel: { name: 'Herzlicht', bpm: 78, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Em', 'G'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.3.5.3.1.3.5.3.', type: 'triangle', vol: .028, len: 1.8 }, bass: { pat: 'x.......x.......', type: 'sine', vol: .07, len: 4 },
    lead: { type: 'sine', vol: .07, len: 3, bell: true, notes: 'E5 . A5 . C6 . B5 . A5 . . . E5 . . .  F5 . A5 . C6 . A5 . F5 . . . . . . .  E5 . G5 . C6 . D6 . C6 . . . G5 . . .  D5 . G5 . B5 . A5 . G5 . . . . . . .' } },
  maerchen: { name: 'Märchen-Zauber', bpm: 96, chords: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.3.5.3.1.3.5.3.', type: 'triangle', vol: .03, len: 1.8 }, bass: { pat: 'x.......x.......', type: 'sine', vol: .07, len: 4 },
    lead: { type: 'sine', vol: .07, len: 3, bell: true, notes: 'E5 . G5 . C6 . G5 . E5 . . . . . . .  F5 . A5 . C6 . A5 . F5 . . . . . . .  D5 . G5 . B5 . G5 . D5 . . . . . . .  E5 . G5 . C6 . E6 . C6 . . . . . . .' } },
  fussball: { name: 'Stadion-Stimmung', bpm: 128, chords: ['C', 'F', 'G', 'C', 'Am', 'F', 'G', 'G'], pad: { type: 'sawtooth', vol: .018 }, arp: { pat: '1.2.3.2.1.2.3.5.', type: 'square', vol: .016, len: 1.2 }, bass: { pat: 'x..x..x.x..x..x.', type: 'triangle', vol: .08, len: 2 },
    drums: { k: 'x...x...x...x...', kv: .1, s: '....x.......x.x.', sv: .05, h: 'x.x.x.x.x.x.x.x.', hv: .014 }, lead: { type: 'triangle', vol: .06, len: 2, notes: 'E5 . E5 . G5 . E5 . C5 . . . . . . .  F5 . F5 . A5 . F5 . D5 . . . . . . .  G5 . G5 . B5 . G5 . D5 . . . G5 . A5 .  G5 . . . E5 . . . C5 . . . . . . .' } },
  bauland: { name: 'Bau-Spaß', bpm: 120, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'], pad: { type: 'sine', vol: .045 }, arp: { pat: '1.3.2.3.1.3.2.3.', type: 'square', vol: .018, len: 1.2 }, bass: { pat: 'x...x...x...x.5.', type: 'triangle', vol: .08, len: 2 },
    drums: { k: 'x...x...x...x...', kv: .09, s: '....x.......x...', sv: .04, h: 'x.x.x.x.x.x.x.x.', hv: .012 }, lead: { type: 'triangle', vol: .06, len: 2, notes: 'C5 . E5 . G5 . E5 . C5 . E5 . G5 . C6 .  B4 . D5 . G5 . D5 . B4 . D5 . G5 . B5 .  A4 . C5 . E5 . C5 . A4 . C5 . E5 . A5 .  A4 . C5 . F5 . C5 . A4 . C5 . F5 . A5 .  E5 . . G5 . . C6 . . G5 . E5 . . . .  D5 . . G5 . . B5 . . G5 . D5 . . . .  C5 . . E5 . . A5 . . E5 . C5 . . . .  F5 . A5 . C6 . A5 . F5 . . . C5 . . .' } },
  atlantis: { name: 'Tiefen-Stadt', bpm: 84, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B7'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.2.3.2.1.2.3.2.', type: 'triangle', vol: .028, len: 1.8 }, bass: { pat: 'x.......x.......', type: 'sine', vol: .08, len: 4 },
    drums: { h: '..x...x...x...x.', hv: .008 }, lead: { type: 'sine', vol: .06, len: 3, bell: true, notes: 'E5 . . G5 . . B5 . . G5 . E5 . . . .  C5 . . E5 . . G5 . . E5 . C5 . . . .  B4 . . D5 . . G5 . . D5 . B4 . . . .  A4 . . D5 . . F#5 . . D5 . A4 . . . .  G5 . B5 . E6 . B5 . G5 . . . E5 . . .  E5 . G5 . C6 . G5 . E5 . . . C5 . . .  A4 . C5 . E5 . A5 . E5 . C5 . A4 . . .  B4 . D#5 . F#5 . B5 . F#5 . D#5 . B4 . . .' } },
  zotik: { name: 'Lunaris', bpm: 96, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'], pad: { type: 'sine', vol: .05 }, arp: { pat: '1.2.3.2.1.2.3.2.', type: 'triangle', vol: .03, len: 1.6 }, bass: { pat: 'x.......x.......', type: 'sine', vol: .08, len: 4 },
    drums: { h: '..x...x...x...x.', hv: .008 }, lead: { type: 'sine', vol: .06, len: 3, bell: true, notes: 'A4 . . C5 . . E5 . . C5 . A4 . . . .  A4 . . C5 . . F5 . . C5 . A4 . . . .  G4 . . C5 . . E5 . . C5 . G4 . . . .  G4 . . B4 . . D5 . . B4 . G4 . . . .  E5 . . A5 . . E5 . . C5 . A4 . . . .  F5 . . A5 . . F5 . . C5 . A4 . . . .  D5 . . F5 . . A5 . . F5 . D5 . . . .  E5 . . G#5 . . B5 . . G#5 . E5 . . . .' } },
  radio: { name: 'Funkwelle', bpm: 108, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'], pad: { type: 'sine', vol: .045 }, arp: { pat: '1.2.3.2.1.2.3.2.', type: 'triangle', vol: .03, len: 1.4 }, bass: { pat: 'x...x...x...x.x.', type: 'sine', vol: .08, len: 3 },
    drums: { k: 'x...x...x...x...', kv: .06, h: '..x...x...x...x.', hv: .01 }, lead: { type: 'sine', vol: .055, len: 2, bell: true, notes: 'E5 . . G5 . . C6 . . G5 . E5 . . . .  D5 . . G5 . . B5 . . G5 . D5 . . . .  C5 . . E5 . . A5 . . E5 . C5 . . . .  A4 . . C5 . . F5 . . C5 . A4 . . . .  E5 . G5 . C6 . G5 . E5 . . . C5 . . .  D5 . G5 . B5 . G5 . D5 . . . B4 . . .  C5 . F5 . A5 . F5 . C5 . . . A4 . . .  D5 . G5 . B5 . D6 . B5 . G5 . D5 . . .' } },
  /* Himmels-Parcours: Chiptune */
  obby: { name: 'Himmels-Sprung', bpm: 142, chords: ['C', 'F', 'G', 'C'], bass: { pat: 'x.x.5.x.x.x.5.x.', type: 'triangle', vol: .08, len: 1.2 },
    drums: { k: 'x...x...x...x...', kv: .07, s: '....x.......x...', sv: .035, h: 'x.x.x.x.x.x.x.x.', hv: .012 }, lead: { type: 'square', vol: .03, len: 1.4, notes: 'C5 E5 G5 E5 C5 E5 G5 E5 C5 E5 G5 C6 . . . .  A4 C5 F5 C5 A4 C5 F5 C5 A4 C5 F5 A5 . . . .  B4 D5 G5 D5 B4 D5 G5 D5 B4 D5 G5 B5 . . . .  C5 E5 G5 E5 C5 E5 G5 E5 G5 . E5 . C5 . . .' } },
  /* Kino: ruhige Filmmusik */
  kino: { name: 'Kino-Foyer', bpm: 72, chords: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'], pad: { type: 'sine', vol: .06 }, arp: { pat: '1...2...3...2...', type: 'sine', vol: .04, len: 4 }, bass: { pat: 'x...............', type: 'sine', vol: .07, len: 8 },
    lead: { type: 'sine', vol: .05, len: 4, bell: true, notes: 'C6 . . . . . A5 . . . G5 . . . . .  B5 . . . . . G5 . . . E5 . . . . .  A5 . . . . . F5 . . . D5 . . . . .  G5 . . . E5 . . . C5 . . . . . . .' } },
  /* Spielzeugladen: Spieluhr */
  spiel: { name: 'Spieluhr', bpm: 100, spb: 12, chords: ['C', 'F', 'G', 'C'], bass: { pat: 'x...........', type: 'sine', vol: .06, len: 5 },
    lead: { type: 'sine', vol: .07, len: 3, bell: true, notes: 'G5 . E5 . C5 . E5 . G5 . C6 .  A5 . F5 . C5 . F5 . A5 . C6 .  B5 . G5 . D5 . G5 . B5 . D6 .  G5 . E5 . C5 . E5 . G5 . . .' } }
};

/* Welcher Bereich spielt gerade? Reihenfolge = Vorrang. flags: { cinema: Film läuft (Stille), obby: Parcours läuft } */
BI.zoneAt = function (x, z, flags) {
  const f = flags || {}, d = (cx, cz) => Math.hypot(x - cx, z - cz), R = BI.RAINBOW, K = BI.PARK, C = BI.CITY, CI = BI.CINEMA;
  if (f.cinema) return null;
  if (f.obby) return 'obby';
  if (BI.ATLANTIS && d(BI.ATLANTIS.x, BI.ATLANTIS.z) < 400) return 'atlantis'; if (BI.ZOTIK && d(BI.ZOTIK.x, BI.ZOTIK.z) < BI.ZOTIK.R + 12) return 'zotik'; if (BI.RADIO && d(BI.RADIO.x, BI.RADIO.z) < BI.RADIO.R + 12) return 'radio';
  if (d(R.x - 27, R.z) < 20) return 'buehne';
  if (d(R.x, R.z) < R.R + 8) return 'regenbogen';
  if (d(BI.PUPS.x, BI.PUPS.z) < BI.PUPS.R + 8) return 'fellretter';
  if (d(BI.DAMPF.x, BI.DAMPF.z) < BI.DAMPF.R + 8) return 'dampfer';
  if (d(BI.DRACHEN.x, BI.DRACHEN.z) < BI.DRACHEN.R + 8) return 'drachen';
  if (BI.BAULAND && d(BI.BAULAND.x, BI.BAULAND.z) < BI.BAULAND.R + 8) return 'bauland';
  if (BI.FUSSBALL && d(BI.FUSSBALL.x, BI.FUSSBALL.z) < BI.FUSSBALL.R + 8) return 'fussball';
  if (BI.MAERCHEN && d(BI.MAERCHEN.x, BI.MAERCHEN.z) < BI.MAERCHEN.R + 8) return 'maerchen';
  if (BI.SCHLUESSEL && d(BI.SCHLUESSEL.x, BI.SCHLUESSEL.z) < BI.SCHLUESSEL.R + 8) return 'schluessel';
  if (d(K.x, K.z) < K.R + 8) return 'park';
  if (d(C.x, C.z) < C.R + 8) return 'stadt';
  if (x > 30 && x < 76 && z > 124 && z < 152) return 'pool';
  if (d(-105, 104) < 30) return 'farm';
  if (d(70, 30) < 20) return 'camp';
  if (d(100, -88) < 26) return 'arena';
  if (d(40, -148) < 32) return 'wald';
  if (d(-27, 27) < 12) return 'spiel';
  if (x > CI.x0 && x < CI.x1 && z > CI.z0 && z < CI.z1) return 'kino';
  return 'insel';
};

/* In welcher Welt (Insel) ist dieser Punkt? 'insel' (Hauptinsel mit Camp, Freibad, Hof …), 'stadt', 'park', 'regenbogen', 'bucht' */
BI.worldAt = function (x, z) {
  const d = (cx, cz) => Math.hypot(x - cx, z - cz), R = BI.RAINBOW, K = BI.PARK, C = BI.CITY, F = BI.PUPS, DM = BI.DAMPF, DR = BI.DRACHEN;
  if (BI.ATLANTIS && d(BI.ATLANTIS.x, BI.ATLANTIS.z) < 400) return 'atlantis'; if (BI.ZOTIK && d(BI.ZOTIK.x, BI.ZOTIK.z) < BI.ZOTIK.R + 12) return 'zotik'; if (BI.RADIO && d(BI.RADIO.x, BI.RADIO.z) < BI.RADIO.R + 12) return 'radio'; if (BI.BAULAND && d(BI.BAULAND.x, BI.BAULAND.z) < BI.BAULAND.R + 12) return 'bauland'; if (BI.FUSSBALL && d(BI.FUSSBALL.x, BI.FUSSBALL.z) < BI.FUSSBALL.R + 12) return 'fussball'; if (BI.SCHLUESSEL && d(BI.SCHLUESSEL.x, BI.SCHLUESSEL.z) < BI.SCHLUESSEL.R + 12) return 'schluessel'; if (BI.MAERCHEN && d(BI.MAERCHEN.x, BI.MAERCHEN.z) < BI.MAERCHEN.R + 12) return 'maerchen'; if (d(DM.x, DM.z) < DM.R + 12) return 'dampf'; if (d(DR.x, DR.z) < DR.R + 12) return 'drachen'; if (d(R.x, R.z) < R.R + 12) return 'regenbogen'; if (d(F.x, F.z) < F.R + 12) return 'bucht'; if (d(K.x, K.z) < K.R + 12) return 'park'; if (d(C.x, C.z) < C.R + 12) return 'stadt'; return 'insel';
};
