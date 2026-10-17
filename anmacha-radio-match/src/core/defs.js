/* Royal Radio Match 3D – feste Spieldaten: Steine, Spezialteile, Hindernisse, Booster, Welten, Funkhaus. Ohne DOM, auch in Node nutzbar. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});

  // Normale Steine (Index = Farbcode im Spielzustand)
  var PIECES = [
    { id: 'mic', name: 'Mikrofon', plural: 'Mikrofone', hex: '#ffc531', glyph: '●' },
    { id: 'headphones', name: 'Kopfhörer', plural: 'Kopfhörer', hex: '#22d6c8', glyph: '▲' },
    { id: 'vinyl', name: 'Schallplatte', plural: 'Schallplatten', hex: '#a45cff', glyph: '■' },
    { id: 'tower', name: 'Sendeturm', plural: 'Sendetürme', hex: '#3f86ff', glyph: '◆' },
    { id: 'equalizer', name: 'Equalizer', plural: 'Equalizer', hex: '#41d65a', glyph: '✚' },
    { id: 'radio', name: 'Radio', plural: 'Radios', hex: '#ff4a4a', glyph: '★' },
    { id: 'fader', name: 'Fader', plural: 'Fader', hex: '#ff9326', glyph: '✱' }
  ];

  // Spezialteile
  var SPECIALS = {
    rh: { name: 'Wellenrakete', desc: 'Vierer in einer Reihe: räumt die ganze Reihe.' },
    rv: { name: 'Wellenrakete', desc: 'Vierer in einer Spalte: räumt die ganze Spalte.' },
    bomb: { name: 'Bassbombe', desc: 'L- oder T-Form: Frequenzimpuls auf die Fläche rundherum.' },
    orb: { name: 'Frequenzkugel', desc: 'Fünf in einer Reihe: tausche sie mit einem Stein, alle Steine dieser Sorte verschwinden.' },
    drone: { name: 'Funkdrohne', desc: '2×2-Quadrat: fliegt zu einem wichtigen Ziel und trifft es.' },
    remix: { name: 'Remix-Orb', desc: 'Sechs in einer Reihe oder großes Kreuz (7+ Steine): räumt eine breite Reihe und Spalte.' }
  };

  // Hindernisse. layer: block = belegt die Zelle, cover = liegt auf einem Stein, under = liegt unter dem Stein, cell = Rastereigenschaft
  var BLOCKERS = {
    crate: { name: 'Transportkiste', plural: 'Kisten', layer: 'block', maxHp: 3, desc: 'Wird durch Matches daneben oder Spezialteile abgebaut (1–3 Lagen).' },
    moss: { name: 'Frequenzmoos', plural: 'Moos', layer: 'block', maxHp: 1, desc: 'Wächst auf einen Nachbarstein, wenn du in einem Zug kein Moos entfernst.' },
    noise: { name: 'Rauschfeld', plural: 'Rauschfelder', layer: 'under', maxHp: 2, desc: 'Liegt unter Steinen. Löse Steine auf dem Feld auf, um es zu entstören.' },
    cable: { name: 'Kabelsalat', plural: 'Kabel', layer: 'cover', maxHp: 2, desc: 'Hält einen Stein fest. Der Stein kann mitmatchen, dabei reißt eine Kabellage.' },
    barrier: { name: 'Sendesperre', plural: 'Sendesperren', layer: 'block', maxHp: 1, desc: 'Unzerstörbar. Verschwindet, sobald alle Schalter bzw. Generatoren aktiv sind.' },
    dusty: { name: 'Verstaubte Platte', plural: 'Platten', layer: 'block', maxHp: 3, desc: 'Braucht 2–3 Treffer, dann ist die Platte freigelegt.' },
    amp: { name: 'Röhrenverstärker', plural: 'Verstärker', layer: 'block', maxHp: 3, desc: 'Lädt sich mit Treffern auf und zündet bei voller Ladung eine Bassexplosion.' },
    glass: { name: 'Glasvitrine', plural: 'Vitrinen', layer: 'block', maxHp: 2, desc: 'Bricht nach 1–2 Treffern und gibt ein Plattenpaket frei.' },
    ice: { name: 'Frequenzeis', plural: 'Eisblöcke', layer: 'cover', maxHp: 3, desc: 'Friert einen Stein ein. Nur Matches daneben oder Spezialteile tauen ihn auf.' },
    hole: { name: 'Funkloch', plural: 'Funklöcher', layer: 'cell', maxHp: 0, desc: 'Kein Feld. Steine fallen darüber hinweg.' },
    antenna: { name: 'Empfangsantenne', plural: 'Antennen', layer: 'block', maxHp: 3, desc: 'Nach genügend Treffern repariert, sendet dann einen Strahl durch ihre Reihe.' },
    portal: { name: 'Signal-Portal', plural: 'Portale', layer: 'cell', maxHp: 0, desc: 'Was unten in den Eingang fällt, kommt oben am Ausgang heraus.' },
    jammer: { name: 'Störsender', plural: 'Störsender', layer: 'block', maxHp: 6, desc: 'Erzeugt alle paar Züge ein Rauschfeld, bis er zerstört ist.' },
    generator: { name: 'Generator', plural: 'Generatoren', layer: 'block', maxHp: 1, desc: 'Sammelt Energie aus Matches seiner Farbe daneben. Voll geladen ist er aktiv.' },
    shield: { name: 'Schutzschild', plural: 'Schilde', layer: 'block', maxHp: 2, desc: 'Nur Matches der Schildfarbe daneben oder Spezialteile brechen es.' },
    rolling: { name: 'Rollende Platte', plural: 'Rollende Platten', layer: 'block', maxHp: 2, desc: 'Rollt nach jedem Zug ein Feld weiter und kehrt an Hindernissen um.' },
    switch: { name: 'Ketten-Schalter', plural: 'Schalter', layer: 'block', maxHp: 1, desc: 'Nur in der Reihenfolge 1, 2, 3 … auslösbar. Alle zusammen öffnen die Sendesperren.' },
    cassette: { name: 'Zielkassette', plural: 'Kassetten', layer: 'item', maxHp: 0, desc: 'Kommt aus dem Kassettenspender. Bring sie ganz nach unten zum Ausgang.' },
    parcel: { name: 'Plattenpaket', plural: 'Plattenpakete', layer: 'item', maxHp: 0, desc: 'Bring das Paket ganz nach unten zum Ausgang.' }
  };

  // Booster (Inventar). pre = vor dem Level, cell = braucht Zielfeld
  var BOOSTERS = [
    { id: 'preRocket', name: 'Start-Rakete', icon: '🚀', pre: true, unlock: 4, price: 300, desc: 'Eine Wellenrakete liegt zu Beginn auf dem Brett.' },
    { id: 'preBomb', name: 'Start-Bassbombe', icon: '💣', pre: true, unlock: 8, price: 400, desc: 'Eine Bassbombe liegt zu Beginn auf dem Brett.' },
    { id: 'preOrb', name: 'Start-Frequenzkugel', icon: '🔮', pre: true, unlock: 14, price: 600, desc: 'Eine Frequenzkugel liegt zu Beginn auf dem Brett.' },
    { id: 'preSuper', name: 'Super-Start', icon: '🌟', pre: true, unlock: 24, price: 800, desc: 'Rakete und Bassbombe zusammen zu Beginn.' },
    { id: 'hammer', name: 'Mikrofon-Hammer', icon: '🎤', cell: true, unlock: 3, price: 250, desc: 'Trifft ein Feld: entfernt einen Stein oder eine Hindernislage.' },
    { id: 'laser', name: 'Signal-Laser', icon: '↔️', cell: true, unlock: 6, price: 350, desc: 'Trifft eine komplette Reihe.' },
    { id: 'blitz', name: 'Tower-Blitz', icon: '↕️', cell: true, unlock: 10, price: 350, desc: 'Trifft eine komplette Spalte.' },
    { id: 'shuffle', name: 'Remix-Shuffle', icon: '🔀', cell: false, unlock: 12, price: 200, desc: 'Mischt alle beweglichen normalen Steine neu.' },
    { id: 'bass', name: 'Basswelle', icon: '🔊', cell: true, unlock: 16, price: 450, desc: 'Trifft eine 3×3-Fläche.' },
    { id: 'scan', name: 'Sendersuchlauf', icon: '📡', cell: false, unlock: 20, price: 450, desc: 'Ein Scanner trifft drei wichtige Ziele.' },
    { id: 'boost', name: 'Verstärker', icon: '⚡', cell: false, unlock: 28, price: 300, desc: 'Dein nächster Tausch löst zusätzlich eine Bassexplosion aus.' },
    { id: 'rescue', name: 'Frequenz-Retter', icon: '🛟', cell: false, unlock: 34, price: 300, desc: 'Färbt bis zu 5 Steine in die Farbe deines Sammelziels (sonst: eine Rakete).' }
  ];

  // Zehn Radio-Welten à 20 Level. bg/floor/accent: Farben der 3D-Bühne
  var WORLDS = [
    { id: 'studio', name: 'Das erste Sendestudio', sky: 0x1b2a4a, floor: 0x3a2a22, accent: 0xffc531, board: 0x24344f,
      story: ['RAY: „Huch! Die Störwelle hat unser Studio verrauscht. Zeit für deinen ersten Sendebeitrag!“', 'MIRA MIX: „Studio 1 sendet wieder! Hörst du das? Das war unser erster Jingle seit Wochen!“'] },
    { id: 'vinyl-lounge', name: 'Vinyl Lounge', sky: 0x2a1640, floor: 0x3b2316, accent: 0xa45cff, board: 0x2c2147,
      story: ['RAY: „In der Lounge stauben die Platten ein. Vorsichtig – manche stecken in Vitrinen!“', 'MIRA MIX: „Das Plattenarchiv dreht sich wieder. Ich lege gleich was Schönes auf.“'] },
    { id: 'garden', name: 'Frequenzgarten', sky: 0x123a2c, floor: 0x24402a, accent: 0x41d65a, board: 0x1d3a35,
      story: ['RAY: „Frequenzmoos überall! Wenn du nicht aufpasst, wuchert es weiter.“', 'MIRA MIX: „Der Garten klingt wie ein Synthesizer im Frühling. Herrlich!“'] },
    { id: 'workshop', name: 'Die Mischpult-Werkstatt', sky: 0x2e2418, floor: 0x3a3127, accent: 0xff9326, board: 0x33302c,
      story: ['RAY: „Kabelsalat und kaputte Verstärker – hier braucht es geschickte Hände.“', 'MIRA MIX: „Alle Fader laufen geschmeidig. Das Mischpult ist wieder einsatzbereit!“'] },
    { id: 'antenna', name: 'Antennenhöhe', sky: 0x16304f, floor: 0x2b3d52, accent: 0x3f86ff, board: 0x203a58,
      story: ['RAY: „Hier oben pfeift der Wind durch die Funklöcher. Die Portale helfen beim Fallen!“', 'MIRA MIX: „Die Sendeantenne strahlt bis zum Horizont. Gänsehaut!“'] },
    { id: 'neon', name: 'Elektronische Nacht', sky: 0x0d0a26, floor: 0x1a1236, accent: 0xff3fae, board: 0x1b1638,
      story: ['RAY: „Neon, Rauschen und Schutzschilde – die Nachtschicht beginnt!“', 'MIRA MIX: „Das Nachtstudio leuchtet. Perfekt für die Late-Night-Show.“'] },
    { id: 'festival', name: 'Senderwelt Festival', sky: 0x3a1430, floor: 0x3a2a1c, accent: 0xff4a4a, board: 0x352035,
      story: ['RAY: „Bühne frei! Aber die Technik hängt an Ketten-Schaltern.“', 'MIRA MIX: „Die Open-Air-Bühne bebt. Das Publikum tanzt!“'] },
    { id: 'tunnel', name: 'Der Tiefbass-Tunnel', sky: 0x0b2030, floor: 0x14303e, accent: 0x22d6c8, board: 0x153041,
      story: ['RAY: „Brrr, Frequenzeis! Und die rollenden Platten machen es nicht leichter.“', 'MIRA MIX: „Der Tiefbass wummert wieder durchs Fundament. Satter Sound!“'] },
    { id: 'clouds', name: 'Die Wolkenfrequenz', sky: 0x4f7fb8, floor: 0x9fb8d8, accent: 0xffffff, board: 0x35557d,
      story: ['RAY: „Über den Wolken fallen die Signale durch Portale – und Kassetten wollen nach unten!“', 'MIRA MIX: „Das Wolkenstudio funkt. Die VIP-Lounge ist bereit für Gäste.“'] },
    { id: 'tower', name: 'Royal Radio Tower', sky: 0x1a1030, floor: 0x2c1f3c, accent: 0xffd36b, board: 0x2b2046,
      story: ['RAY: „Der Störsender sitzt ganz oben im Tower. Gemeinsam schalten wir ihn ab!“', 'MIRA MIX: „Der Royal Radio Tower sendet in voller Pracht! Du bist die Stimme des Senders.“'] }
  ];

  // Funkhaus-Abschnitte (je einer pro Welt), Preis in Sternen
  var TOWER = [
    { id: 'mixer', name: 'Mischpult', cost: 20 },
    { id: 'booth', name: 'Mikrofonkabine', cost: 40 },
    { id: 'lobby', name: 'Empfangshalle', cost: 40 },
    { id: 'archive', name: 'Vinyl-Archiv', cost: 50 },
    { id: 'stage', name: 'Liveshow-Bühne', cost: 50 },
    { id: 'mast', name: 'Sendeantenne', cost: 55 },
    { id: 'podcast', name: 'Podcastraum', cost: 55 },
    { id: 'openair', name: 'Open-Air-Bühne', cost: 60 },
    { id: 'night', name: 'Nachtstudio', cost: 60 },
    { id: 'vip', name: 'VIP-Lounge', cost: 70 }
  ];

  RRM.PIECES = PIECES; RRM.SPECIALS = SPECIALS; RRM.BLOCKERS = BLOCKERS; RRM.BOOSTERS = BOOSTERS; RRM.WORLDS = WORLDS; RRM.TOWER = TOWER;
  RRM.MAX_LEVEL = 200;
  if (typeof module !== 'undefined' && module.exports) module.exports = RRM;
})(typeof window !== 'undefined' ? window : globalThis);
