/* ColorPop Universe – 12 Themenwelten (Optik, Musikmotiv, neue Mechanik, Tutorial). Levelaufbau: src/data/levels.js (erzeugt). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  // Steinfarben: farbfehlsichtigkeitsfreundlich abgestuft (Helligkeit + Farbton), jede Farbe hat zusätzlich eine eigene Form und ein Symbol
  CPU.COLORS = ['#ff4f6d', '#ffc93c', '#2f8cff', '#2ed38a', '#a46bff', '#ff8a2a', '#e9edf7'];
  CPU.COLORS_HC = ['#ff2848', '#ffe000', '#0a6cff', '#00c46a', '#9a3dff', '#ff7300', '#ffffff'];
  CPU.COLOR_NAMES = ['Rubinwürfel', 'Sonnensplitter', 'Wasserglas', 'Blattkristall', 'Sternprisma', 'Blitzkern', 'Mondperle'];
  CPU.COLOR_SHORT = ['Rubin', 'Sonne', 'Wasser', 'Blatt', 'Stern', 'Blitz', 'Mond'];

  CPU.WORLDS = [
    { id: 1, key: 'bonbon', name: 'Bonbon-Bucht', tag: 'Einführung', bg: ['#ff8fb8', '#ffb86b', '#7fd8ff'], board: '#3a1838', accent: '#ff5fa2', deco: 'candy',
      music: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 96, wave: 'triangle' }, iceSkin: 'ice', item: 0, celebrate: 'confetti',
      intro: 'Tippe auf zwei oder mehr gleiche Steine, die sich oben, unten, links oder rechts berühren. Die ganze Gruppe knallt weg, alles darüber fällt nach unten und leere Spalten rücken nach links.',
      words: [['Zucker', 'Karamell', 'Kirsch', 'Lakritz', 'Brause'], ['welle', 'strand', 'boje', 'riff', 'hafen']] },
    { id: 2, key: 'kristall', name: 'Kristallgarten', tag: 'Zielmarker & Sammelaufträge', bg: ['#4fd1c5', '#7f5af0', '#c3f0ff'], board: '#122a3a', accent: '#5ff0d8', deco: 'gems',
      music: { root: 62, scale: [0, 2, 3, 7, 9], bpm: 90, wave: 'sine' }, iceSkin: 'ice', item: 3, celebrate: 'shards',
      intro: 'Leuchtende Zielmarker liegen unter manchen Steinen. Entferne den Stein darüber, dann erlischt der Marker. Manche Aufträge verlangen eine bestimmte Anzahl einer Farbe.',
      words: [['Saphir', 'Quarz', 'Opal', 'Jade', 'Topas'], ['beet', 'laube', 'pfad', 'brunnen', 'hain']] },
    { id: 3, key: 'wolken', name: 'Wolkenstadt', tag: 'Inseln & Windpfeile', bg: ['#a5d8ff', '#e7f5ff', '#ffd6e8'], board: '#1f3354', accent: '#74c0fc', deco: 'clouds',
      music: { root: 65, scale: [0, 2, 4, 5, 7, 9], bpm: 84, wave: 'sine' }, iceSkin: 'ice', item: 0, celebrate: 'feathers',
      intro: 'Löcher im Brett sind feste Inseln: Steine landen darauf, und Spalten mit Inseln rücken nie zur Seite. Ein Windpfeil im Zug lenkt die Schwerkraft dieses Zugs in seine Richtung. In Sonderleveln fällt alles dauerhaft in eine andere Richtung – das Brett zeigt es mit Pfeilen am Rand.',
      words: [['Wind', 'Nebel', 'Feder', 'Himmels', 'Wolken'], ['turm', 'brücke', 'gasse', 'markt', 'platz']] },
    { id: 4, key: 'tiefsee', name: 'Tiefsee-Lagune', tag: 'Muscheln & Korallenblöcke', bg: ['#0b7285', '#1864ab', '#63e6be'], board: '#062033', accent: '#3bc9db', deco: 'bubbles',
      music: { root: 57, scale: [0, 3, 5, 7, 10], bpm: 76, wave: 'sine' }, iceSkin: 'ice', item: 1, celebrate: 'bubbles',
      intro: 'Muscheln sind Sammelobjekte: Bring sie ganz nach unten, dann werden sie eingesammelt. Korallenblöcke zerbrechen, wenn direkt daneben eine Gruppe platzt. Felsen bleiben fest stehen und brauchen mehrere Treffer.',
      words: [['Korallen', 'Perlen', 'Seestern', 'Tang', 'Muschel'], ['grotte', 'bank', 'graben', 'lagune', 'garten']] },
    { id: 5, key: 'funkel', name: 'Funkelwald', tag: 'Harz & Kettenblitze', bg: ['#2b8a3e', '#94d82d', '#ffe066'], board: '#112a17', accent: '#a9e34b', deco: 'leaves',
      music: { root: 55, scale: [0, 2, 4, 7, 9], bpm: 88, wave: 'triangle' }, iceSkin: 'resin', item: 0, celebrate: 'fireflies',
      intro: 'Harz hält Steine fest: Sie fallen nicht und lassen sich nicht wählen. Platzt daneben eine Gruppe, löst sich das Harz. Kettenblitze reißen alle direkt verbundenen Kettensteine mit – egal welche Farbe.',
      words: [['Moos', 'Glüh', 'Farn', 'Pilz', 'Tau'], ['lichtung', 'pfad', 'senke', 'quelle', 'krone']] },
    { id: 6, key: 'vulkan', name: 'Vulkan-Vibe', tag: 'Lavagestein & Hitzebomben', bg: ['#c92a2a', '#ff922b', '#3b0a0a'], board: '#2a0c08', accent: '#ff6b2c', deco: 'embers',
      music: { root: 52, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 112, wave: 'sawtooth' }, iceSkin: 'ice', item: 0, celebrate: 'sparks',
      intro: 'Lavagestein steht fest und braucht zwei Treffer von benachbarten Gruppen. Bomben sprengen das 3×3-Feld um sich – Hitzebomben zünden schon, wenn daneben etwas platzt. Viele Level haben ein Zuglimit.',
      words: [['Lava', 'Glut', 'Magma', 'Asche', 'Funken'], ['kegel', 'strom', 'kammer', 'rand', 'schlot']] },
    { id: 7, key: 'neon', name: 'Neon-Metropole', tag: 'Neonsteine & Raketen', bg: ['#f03e3e', '#7048e8', '#15aabf'], board: '#0d0a24', accent: '#ff4fd8', deco: 'neon',
      music: { root: 59, scale: [0, 3, 5, 6, 7, 10], bpm: 120, wave: 'square' }, iceSkin: 'ice', item: 0, celebrate: 'laser',
      intro: 'Neonsteine wechseln nach jedem Zug ihre Farbe (immer zur nächsten in der Reihe). Raketen räumen beim Platzen ihre ganze Reihe oder Spalte. Viele Aufträge verlangen große Gruppen.',
      words: [['Neon', 'Pixel', 'Laser', 'Disko', 'Chrom'], ['allee', 'kreuzung', 'dach', 'tunnel', 'skyline']] },
    { id: 8, key: 'frost', name: 'Frostpalast', tag: 'Eis in Schichten & Anker', bg: ['#d0ebff', '#74c0fc', '#e5dbff'], board: '#13253f', accent: '#a5d8ff', deco: 'snow',
      music: { root: 64, scale: [0, 2, 3, 7, 8], bpm: 72, wave: 'sine' }, iceSkin: 'ice', item: 0, celebrate: 'snowflakes',
      intro: 'Eis hat bis zu drei Schichten. Jede Gruppe direkt daneben bricht eine Schicht. Steinanker sind normale Farbsteine, die nie fallen – plane um sie herum.',
      words: [['Frost', 'Raureif', 'Glitzer', 'Eis', 'Polar'], ['saal', 'treppe', 'thron', 'kuppel', 'erker']] },
    { id: 9, key: 'zahnrad', name: 'Zahnrad-Zirkus', tag: 'Förderbänder', bg: ['#e67700', '#ffd43b', '#5c940d'], board: '#2b1d0a', accent: '#ffc078', deco: 'gears',
      music: { root: 58, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 104, wave: 'square' }, iceSkin: 'ice', item: 0, celebrate: 'cogs',
      intro: 'Förderbänder (gelbe Pfeile am Rand) schieben nach jedem Zug alle beweglichen Steine ihrer Reihe um ein Feld nach rechts – der letzte springt nach links vorn. Danach fällt alles nach.',
      words: [['Zahnrad', 'Kurbel', 'Feder', 'Messing', 'Kolben'], ['manege', 'werk', 'bühne', 'karussell', 'trommel']] },
    { id: 10, key: 'sterne', name: 'Sternenarchipel', tag: 'Portale & Sternfragmente', bg: ['#1c1c5e', '#5f3dc4', '#f783ac'], board: '#0b0b2a', accent: '#b197fc', deco: 'stars',
      music: { root: 61, scale: [0, 2, 4, 6, 7, 9, 11], bpm: 80, wave: 'triangle' }, iceSkin: 'ice', item: 0, celebrate: 'starburst',
      intro: 'Portale liegen paarweise am Boden. Nach jedem Zug tauschen die beiden Steine direkt über einem Portalpaar ihre Plätze – vorhersehbar und immer gleich. Sternfragmente musst du nach unten bringen.',
      words: [['Komet', 'Nova', 'Orbit', 'Sternen', 'Mond'], ['insel', 'riff', 'bucht', 'atoll', 'leuchte']] },
    { id: 11, key: 'traum', name: 'Traumlabor', tag: 'Regenbogen & Kombinationen', bg: ['#e599f7', '#66d9e8', '#ffec99'], board: '#26163a', accent: '#f783ac', deco: 'potions',
      music: { root: 63, scale: [0, 2, 4, 6, 8, 10], bpm: 92, wave: 'triangle' }, iceSkin: 'resin', item: 2, celebrate: 'swirl',
      intro: 'Ein Regenbogenstein färbt beim Platzen alle Steine seiner Zielfarbe in seine eigene Farbe um (der kleine Punkt zeigt die Zielfarbe). Im Labor treffen alle bekannten Mechaniken aufeinander – oft mit zwei Aufträgen gleichzeitig.',
      words: [['Traum', 'Schaum', 'Funkel', 'Zauber', 'Nebel'], ['kolben', 'formel', 'labor', 'trank', 'apparat']] },
    { id: 12, key: 'prisma', name: 'Prisma-Kosmos', tag: 'Prismen & Finale', bg: ['#ff6b6b', '#845ef7', '#22b8cf'], board: '#100820', accent: '#ffffff', deco: 'prism',
      music: { root: 60, scale: [0, 2, 4, 7, 9, 11], bpm: 100, wave: 'sawtooth' }, iceSkin: 'ice', item: 0, celebrate: 'prism',
      intro: 'Prismen sind Farb-Joker: Sie gehören zu jeder Gruppe, die sie berührt, und verbinden so Steine. Man kann sie nicht allein antippen. Das Finale kombiniert alles, was du gelernt hast.',
      words: [['Prisma', 'Spektral', 'Licht', 'Kosmos', 'Aurora'], ['tor', 'kern', 'spirale', 'krone', 'finale']] }
  ];
  CPU.worldOf = function (levelId) { return CPU.WORLDS[Math.min(11, Math.floor((levelId - 1) / 25))]; };

  // Beschreibung jeder Steinart (auswählbar, Zerstörung, Reichweite, Schwerkraft, Auslösung) – auch für die Hilfe
  CPU.PIECE_INFO = [
    { kind: 'normal', name: 'Farbstein', text: 'Sechs bzw. sieben Formen mit eigenem Symbol. Wählbar ab 2 verbundenen gleichen Steinen. Fällt nach unten.' },
    { kind: 'bomb', name: 'Bombenstein', text: 'Farbstein. Platzt er mit seiner Gruppe, sprengt er das 3×3-Feld um sich (Eis/Fels erhalten einen Treffer). Hitzebombe (rot glühend): zündet auch, wenn daneben etwas platzt.' },
    { kind: 'rocket', name: 'Raketenstein', text: 'Farbstein mit Pfeil. Platzt er, räumt er seine ganze Reihe (↔) oder Spalte (↕).' },
    { kind: 'prism', name: 'Prismastein', text: 'Farbloser Joker. Gehört zu jeder angrenzenden Gruppe und verbindet sie. Nicht allein antippbar. Fällt.' },
    { kind: 'rainbow', name: 'Regenbogen', text: 'Farbstein mit Zielpunkt. Platzt er, werden alle Steine der Zielfarbe zu seiner Farbe.' },
    { kind: 'chain', name: 'Kettenblitz', text: 'Farbstein mit Kettenring. Platzt er, platzen alle direkt verbundenen Kettensteine mit (jede Farbe).' },
    { kind: 'anchor', name: 'Steinanker', text: 'Farbstein, der nie fällt. Wählbar wie ein normaler Stein. Spalten mit Anker rücken nicht zur Seite.' },
    { kind: 'neon', name: 'Neonstein', text: 'Farbstein, der nach jedem Zug zur nächsten Farbe wechselt (Rubin → Sonne → Wasser …).' },
    { kind: 'wind', name: 'Windpfeil', text: 'Farbstein mit Pfeil. Platzt er, fällt in diesem Zug alles in Pfeilrichtung.' },
    { kind: 'wood', name: 'Holz-/Korallenblock', text: 'Farblos, fällt. Zerbricht, wenn direkt daneben ein Stein platzt.' },
    { kind: 'rock', name: 'Fels/Lavagestein', text: 'Farblos und fest. Jede benachbarte Gruppe oder Explosion ist ein Treffer; die Zahl zeigt die nötigen Treffer.' },
    { kind: 'item', name: 'Sammelobjekt', text: 'Sternfragment, Muschel, Schlüssel oder Edelstein. Fällt und wird eingesammelt, sobald es ganz unten ankommt.' },
    { kind: 'void', name: 'Insel/Loch', text: 'Kein Spielfeld. Steine landen darauf; Spalten mit Insel rücken nicht zur Seite.' },
    { kind: 'portal', name: 'Portal', text: 'Feste Felder am Boden, immer paarweise. Nach jedem Zug tauschen die Steine direkt darüber ihre Plätze.' },
    { kind: 'ice', name: 'Eis/Harz', text: '1–3 Schichten auf einem Farbstein: hält ihn fest, nicht wählbar. Jede Gruppe daneben bricht eine Schicht.' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
