/* FUNKBLASEN – 10 Welten, 150 Kampagnenlevel, Tagesaufgabe, Endlos und Freies Spiel.
 * Jedes Level hat einen festen Datensatz (Formation, Reihen, Farben, Färbung, Ziel, Besonderheiten) und einen festen Seed,
 * daraus entsteht immer exakt dasselbe Feld. Level 1, 15, 16, 30, 75, 149 und 150 sind von Hand gezeichnet.
 * Benötigt engine.js (FBEngine). */
(function (root, factory) {
  const L = factory(typeof module === 'object' && module.exports ? require('./engine.js') : root.FBEngine);
  if (typeof module === 'object' && module.exports) module.exports = L; else root.FBLevels = L;
})(typeof self !== 'undefined' ? self : this, function (E) {
  'use strict';
  const VERSION = '1.0.0';
  const COLOR_NAMES = ['Rot', 'Gelb', 'Grün', 'Blau', 'Lila', 'Türkis'];
  const COLOR_HEX = ['#ff3b52', '#ffd21f', '#2fd46a', '#2f7bff', '#b45cff', '#1fe0e0'];

  const WORLDS = [
    { id: 1, name: 'Funkis Garten', short: 'Garten', sky: ['#6cc8ff', '#d9f8c4'], accent: '#5bd66a', decor: 'garden', order: [2, 1, 3, 0, 4, 5],
      music: { bpm: 96, root: 60, mode: 'major', lead: 'triangle' }, mech: ['Grundregeln', 'Bandenschüsse', 'Sternenblasen'],
      funki: 'Willkommen in meinem Garten! Ziel gut, schieß los: drei gleiche Blasen platzen.' },
    { id: 2, name: 'Neon-Funkstadt', short: 'Neonstadt', sky: ['#12062e', '#5a1a8a'], accent: '#ff3df2', decor: 'neon', order: [3, 4, 5, 0, 1, 2],
      music: { bpm: 118, root: 57, mode: 'minor', lead: 'square' }, mech: ['Bombenblase', 'Regenbogenblase', 'Steinblasen'],
      funki: 'Neonlichter! Hier gibt es Bomben- und Regenbogenblasen für knifflige Stellen.' },
    { id: 3, name: 'Wolkenstudio', short: 'Wolken', sky: ['#86c2ff', '#ffe6f4'], accent: '#7ab8ff', decor: 'clouds', order: [1, 3, 4, 2, 0, 5],
      music: { bpm: 92, root: 62, mode: 'lydian', lead: 'sine' }, mech: ['Wind (markiert)', 'Blitzblase', 'Sternenblasen'],
      funki: 'Achtung, im Wolkenstudio weht manchmal Wind. Die Ziellinie zeigt dir, wohin er pustet.' },
    { id: 4, name: 'Kristallhöhlen', short: 'Kristalle', sky: ['#0b1634', '#2c5a7a'], accent: '#6ef0ff', decor: 'crystal', order: [5, 4, 1, 0, 2, 3],
      music: { bpm: 84, root: 55, mode: 'dorian', lead: 'triangle' }, mech: ['Kristalle retten', 'Steinblasen', 'Bomben'],
      funki: 'In den Kristallhöhlen sind Kristalle eingeschlossen. Lass sie fallen, dann sind sie gerettet!' },
    { id: 5, name: 'Unterwasser-Frequenz', short: 'Unterwasser', sky: ['#022c4e', '#06a0a8'], accent: '#3df2d0', decor: 'sea', order: [5, 3, 2, 4, 0, 1],
      music: { bpm: 88, root: 58, mode: 'mixolydian', lead: 'sine' }, mech: ['Bombenblasen im Feld', 'Kettenblasen', 'Wirbel-Formationen'],
      funki: 'Blubb! Kettenblasen hängen zusammen: Platzt eine, platzt die ganze Kette.' },
    { id: 6, name: 'Zauberwald', short: 'Zauberwald', sky: ['#0d2619', '#3d6b3a'], accent: '#c6ff6a', decor: 'forest', order: [2, 4, 1, 3, 5, 0],
      music: { bpm: 100, root: 57, mode: 'dorian', lead: 'triangle' }, mech: ['Eisblasen', 'Schalter', 'Kristalle'],
      funki: 'Eisblasen musst du erst auftauen: Triff sie oder lass daneben etwas platzen.' },
    { id: 7, name: 'Sternensender', short: 'Sterne', sky: ['#03041a', '#1b1f55'], accent: '#9db7ff', decor: 'space', order: [3, 5, 4, 1, 0, 2],
      music: { bpm: 110, root: 56, mode: 'minor', lead: 'square' }, mech: ['Blitzblasen im Feld', 'Punkteziele', 'Sternmuster'],
      funki: 'Willkommen auf der Raumstation! Blitzblasen räumen eine ganze Reihe ab.' },
    { id: 8, name: 'Regenbogen-Tempel', short: 'Regenbogen', sky: ['#ffd0ef', '#cfeaff'], accent: '#ff9a3d', decor: 'temple', order: [0, 1, 2, 3, 4, 5],
      music: { bpm: 104, root: 60, mode: 'major', lead: 'triangle' }, mech: ['Farbwandler', 'Regenbogenblasen', 'Bunte Mischungen'],
      funki: 'Farbwandler wechseln nach jedem Schuss ihre Farbe. Pass den richtigen Moment ab!' },
    { id: 9, name: 'Gewitterkanal', short: 'Gewitter', sky: ['#10131f', '#3a4466'], accent: '#ffe14a', decor: 'storm', order: [1, 3, 0, 5, 4, 2],
      music: { bpm: 126, root: 52, mode: 'minor', lead: 'square' }, mech: ['Sinkende Decke', 'Blitze', 'Bandenschüsse durch Kanäle'],
      funki: 'Im Gewitterkanal sinkt die Decke. Der Zähler oben verrät dir, wann.' },
    { id: 10, name: 'Großer Radioturm', short: 'Radioturm', sky: ['#1a0f2e', '#ff7a3d'], accent: '#ffd23a', decor: 'tower', order: [0, 1, 2, 3, 4, 5],
      music: { bpm: 112, root: 59, mode: 'major', lead: 'square' }, mech: ['Alles zusammen', 'Finale', 'Turm-Rätsel'],
      funki: 'Das Finale! Im Radioturm kommt alles zusammen, was du gelernt hast.' }
  ];

  // Formationen (Reihen bei shift 0: gerade Reihen 11 Zellen, ungerade 10; x = Mitte in Kugelbreiten 0…10)
  const FORM = {
    wall: () => true,
    vee: (r, x, n) => Math.abs(x - 5) <= 5.6 - r * (4.6 / n),
    diamond: (r, x, n) => r === 0 ? Math.abs(x - 5) < 2.2 : Math.abs(x - 5) / 5.6 + Math.abs(r - (n - 1) / 2) / (n / 2) <= 1.08,
    pillars: (r, x) => r < 2 || Math.floor((x + 0.5) / 2) % 2 === 0,
    arch: (r, x, n) => r < 2 || Math.abs(x - 5) >= 2.6 || r === n - 1,
    funnel: (r, x) => r < 1 || Math.abs(x - 5) >= r * 0.75,
    zigzag: (r, x) => r === 0 || Math.abs(((x + r * 1.5) % 6) - 3) < 2.1,
    waves: (r, x, n) => r < n - 1.6 + 1.6 * Math.sin(x * 0.9),
    cross: (r, x, n) => r < 1 || Math.abs(x - 5) < 1.6 || Math.abs(r - Math.floor(n / 2)) < 1.1,
    islands: (r, x, n) => r < 1 || [1.5, 5, 8.5].some(cx => Math.hypot((x - cx) / 1.6, (r - n * 0.55) / (n * 0.5)) < 1),
    curtain: (r, x, n) => r < n - ((Math.round(x * 2) * 3) % 4),
    stairs: (r, x, n) => r < Math.min(n, 1 + Math.floor((x + 0.5) / 1.6)) || r < 1,
    skyline: (r, x, n) => r < 1 || r < n - [0, 3, 1, 4, 2, 0, 3, 1, 4, 2, 1][Math.round(x)] ,
    clouds: (r, x, n) => r < 2 || [2, 8].some(cx => Math.hypot((x - cx) / 2.6, (r - 2) / (n - 2)) < 1) || (Math.abs(x - 5) < 1.4 && r < n - 2),
    cave: (r, x, n) => r < 2 || [0.5, 3.5, 6.5, 9.5].some(cx => Math.abs(x - cx) < 1.5 - (r / n) * 1.1),
    rings: () => true,
    reef: (r, x, n) => r < 1 || Math.abs(Math.sin(x * 0.75 + r * 0.5)) > 0.25 && r < n - (Math.round(x) % 3 === 0 ? 1 : 0),
    whirl: (r, x, n) => { const dx = x - 5, dy = (r - n / 2) * 1.2, d = Math.hypot(dx, dy); return r < 1 || d > 1.3; },
    forest: (r, x, n) => r < 2 || [1.5, 5, 8.5].some(cx => Math.abs(x - cx) < (r - 1) * 0.55 + 0.6 && r < n),
    starshape: (r, x, n) => { const dx = x - 5, dy = (r - n / 2) * 1.15, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy); return r < 1 || d < 3 + 2.2 * Math.abs(Math.cos(a * 2.5)); },
    station: (r, x, n) => { const d = Math.hypot(x - 5, (r - n / 2) * 1.25); return r < 1 || (d > 1.6 && d < 5.4) || Math.abs(x - 5) < 0.8; },
    temple: (r, x, n) => r < 2 || [0, 3.3, 6.7, 10].some(cx => Math.abs(x - cx) < 1.1) || r === n - 1,
    storm: (r, x, n) => r < n - Math.abs(((Math.round(x * 2) * 7) % 5) - 2),
    canal: (r, x, n) => r < 2 || Math.abs(x - 5) > 1.9 || r < 3,
    tower: (r, x) => r < 2 || Math.abs(x - 5) < 1.6 || (r % 3 === 0 && Math.abs(x - 5) < 4.5)
  };

  // Datensatz je Level: Formation, Reihen, Farben, Färbung, Ziel, Besonderheiten
  //  Besonderheiten: stone/crystal/star/bomb/bolt/chain/shift/switch:n, ice:Anteil, wind:Stärke, ceil:Schüsse, shots:n, sp:Art@Schuss|…
  const T = [
    // Welt 1 – Funkis Garten
    'HAND', 'wall 3 2 rows clear', 'vee 4 3 cluster clear', 'arch 4 3 cluster clear', 'pillars 5 3 cols clear',
    'wall 4 3 cluster score:900', 'diamond 6 3 cluster clear', 'funnel 5 3 rows clear', 'waves 5 3 cluster clear star:2', 'islands 6 3 cluster clear',
    'zigzag 5 3 diag clear', 'cross 6 3 cluster clear star:3', 'curtain 6 3 cols clear', 'stairs 6 3 cluster score:1600', 'HAND',
    // Welt 2 – Neon-Funkstadt
    'HAND', 'wall 5 4 cluster clear sp:bomb@5', 'tower 6 4 cluster clear stone:3', 'vee 5 4 rows clear sp:rainbow@4', 'arch 6 4 cluster clear stone:4 sp:bomb@8',
    'rings 6 4 rings clear', 'skyline 7 4 cols clear stone:4', 'diamond 7 4 cluster clear sp:rainbow@6|bomb@12', 'zigzag 6 4 cluster score:2200', 'pillars 6 4 cluster clear stone:5',
    'wall 5 4 pairs clear sp:rainbow@3|rainbow@9', 'funnel 7 4 cluster clear stone:3 sp:bomb@6', 'skyline 7 4 cluster score:2600', 'islands 7 4 diag clear stone:4', 'HAND',
    // Welt 3 – Wolkenstudio
    'wall 5 4 cluster clear wind:4', 'clouds 6 4 cluster clear star:3', 'vee 6 4 cluster clear wind:-5', 'waves 6 4 cluster clear sp:bolt@5', 'clouds 7 4 cluster clear star:4',
    'arch 6 4 rows clear wind:5', 'islands 7 4 cluster clear sp:bolt@6|bomb@12', 'diamond 7 4 cluster clear wind:-6 star:2', 'stairs 7 4 diag score:3000', 'clouds 7 4 cluster clear sp:bolt@4|bolt@10',
    'funnel 7 4 cluster clear wind:6', 'zigzag 7 4 cluster clear star:5', 'pillars 7 4 cols clear wind:-6 sp:rainbow@6', 'rings 7 4 rings score:3300', 'clouds 8 4 cluster clear wind:5 star:3 sp:bolt@8',
    // Welt 4 – Kristallhöhlen
    'wall 5 4 cluster rescue crystal:2', 'vee 6 4 cluster rescue crystal:3', 'cave 7 4 cluster clear stone:4', 'diamond 7 4 cluster rescue crystal:4', 'arch 7 5 cluster rescue crystal:3 stone:3',
    'cave 7 5 cluster rescue crystal:4 sp:bomb@6', 'rings 7 5 rings rescue crystal:3', 'pillars 7 5 cluster rescue crystal:5 stone:3', 'islands 7 5 cluster score:3600', 'cave 8 5 cluster rescue crystal:5 sp:bolt@7',
    'funnel 7 5 diag rescue crystal:4 stone:4', 'zigzag 8 5 cluster rescue crystal:6', 'stairs 8 5 cluster clear stone:6 sp:bomb@5', 'diamond 8 5 cluster rescue crystal:6 stone:3', 'cave 8 5 cluster rescue crystal:8 stone:4 sp:bomb@10',
    // Welt 5 – Unterwasser-Frequenz
    'wall 6 5 cluster clear bomb:1', 'reef 7 5 cluster clear chain:4', 'whirl 7 5 rings clear bomb:2', 'waves 7 5 cluster clear chain:5', 'reef 7 5 cluster clear bomb:2 star:3',
    'vee 7 5 cluster score:4000 chain:6', 'whirl 8 5 rings clear chain:5 bomb:1', 'islands 8 5 cluster clear bomb:3', 'reef 8 5 diag clear chain:6', 'arch 8 5 cluster clear bomb:2 chain:4',
    'whirl 8 5 cluster rescue crystal:4 chain:5', 'zigzag 8 5 cluster clear bomb:3 star:3', 'reef 8 5 cluster clear chain:7 sp:rainbow@6', 'diamond 8 5 cluster score:4400 bomb:2', 'HAND',
    // Welt 6 – Zauberwald
    'wall 6 5 cluster clear ice:.15', 'forest 7 5 cluster clear ice:.2', 'vee 7 5 cluster clear ice:.3 switch:1', 'forest 7 5 cluster clear ice:.25', 'arch 7 5 cluster clear ice:.4 switch:1',
    'rings 7 5 rings clear ice:.2 star:3', 'forest 8 5 cluster clear ice:.3 switch:2', 'islands 8 5 cluster clear ice:.25 bomb:1 shots:6', 'diamond 8 5 cluster rescue crystal:3 ice:.35 switch:1', 'forest 8 5 diag clear ice:.3 sp:bomb@8',
    'pillars 8 5 cluster clear ice:.45 switch:2', 'waves 8 5 cluster score:4800 ice:.3', 'forest 8 5 cluster clear ice:.35 chain:5', 'funnel 8 5 cluster clear ice:.5 switch:2', 'forest 8 5 cluster rescue crystal:4 ice:.4 switch:1',
    // Welt 7 – Sternensender
    'starshape 7 5 cluster clear bolt:2', 'rings 8 5 rings clear bolt:2', 'station 8 5 cluster clear bolt:3 star:3', 'wall 7 5 pairs clear bolt:2', 'starshape 8 5 cluster score:5200',
    'station 8 5 diag clear bolt:3 bomb:1', 'zigzag 8 5 cluster clear bolt:3 ice:.15', 'starshape 8 5 cluster rescue crystal:4 bolt:2', 'diamond 8 6 cluster clear bolt:3', 'station 8 6 cluster score:5600',
    'waves 8 6 cluster clear bolt:3 chain:4', 'starshape 8 6 rings clear bolt:3 star:4', 'islands 8 6 cluster clear bolt:4', 'station 8 6 cluster clear bolt:3 ice:.2 switch:1', 'starshape 9 6 cluster score:6000 bolt:4',
    // Welt 8 – Regenbogen-Tempel
    'temple 7 5 cluster clear shift:3 sp:rainbow@3', 'wall 7 5 rows clear shift:4', 'temple 8 5 cluster clear shift:5 sp:rainbow@5', 'rings 8 5 rings clear shift:4', 'vee 8 6 cluster clear shift:4 sp:rainbow@4|rainbow@10',
    'temple 8 6 diag clear shift:5', 'arch 8 6 cluster score:6000 shift:6', 'diamond 8 6 cluster rescue crystal:3 shift:5', 'temple 8 6 cluster clear shift:6 ice:.15', 'zigzag 8 6 cluster clear shift:5 bomb:1 sp:rainbow@6',
    'temple 8 6 rows clear shift:6 star:3', 'pillars 8 6 cluster clear shift:7 sp:rainbow@5|rainbow@12', 'waves 8 6 cluster clear shift:6 bolt:2', 'islands 8 6 cluster clear shift:6 chain:4', 'temple 9 6 cluster clear shift:8 sp:rainbow@4|rainbow@9|rainbow@14',
    // Welt 9 – Gewitterkanal
    'wall 5 5 cluster clear ceil:9', 'storm 6 5 cluster clear ceil:9 sp:bolt@6', 'canal 6 5 cluster clear stone:4 ceil:10', 'vee 6 5 cluster clear ceil:8 bolt:2', 'storm 6 6 cluster clear ceil:9',
    'canal 6 6 diag clear ceil:9 stone:5', 'arch 6 6 cluster clear ceil:8 sp:bolt@5|bomb@11', 'storm 7 6 cluster clear ceil:9 bolt:3', 'rings 6 6 rings score:5200 ceil:8', 'canal 7 6 cluster clear ceil:9 stone:6 sp:rainbow@6',
    'storm 7 6 cluster rescue crystal:4 ceil:8', 'islands 7 6 cluster clear ceil:8 bolt:3 ice:.15', 'canal 7 6 cluster clear ceil:9 stone:5 bomb:1', 'storm 7 6 cluster clear ceil:7 sp:bolt@4|bolt@9', 'storm 7 6 cluster clear ceil:8 bolt:3 stone:4',
    // Welt 10 – Großer Radioturm
    'tower 7 6 cluster clear ice:.15 bomb:1', 'tower 7 6 cluster clear chain:5 bolt:2', 'diamond 8 6 cluster rescue crystal:4 shift:4', 'tower 8 6 cluster clear ceil:10 stone:3', 'station 8 6 cluster clear ice:.25 switch:1 star:3',
    'tower 8 6 rings score:6500 bolt:3', 'cave 8 6 cluster rescue crystal:5 bomb:2', 'temple 8 6 cluster clear shift:5 chain:4', 'tower 8 6 cluster clear wind:5 bolt:2', 'reef 8 6 cluster clear chain:6 ice:.2 switch:1',
    'storm 7 6 cluster rescue crystal:4 ceil:9', 'tower 8 6 diag clear bomb:2 shift:4 bolt:2', 'starshape 8 6 cluster clear ice:.3 switch:2 chain:4', 'HAND', 'HAND'
  ];

  // Handgezeichnete Level (a–f Farbe, A–F Eis, 1–6 Blitz, p–u Kette, # Stein, % Kristall, * Stern, @ Bombe, ! Schalter, ~ Farbwandler, . leer)
  const HAND = {
    1: { rows: ['bbbcccccbbb', 'bbccccccbb', '...ccccc...'], shots: 16, goal: 'clear', s2: 0.3, s3: 0.5,
      tip: 'Zielen und schießen: Triff die gelben Blasen mit Gelb und die grünen mit Grün.' },
    15: { rows: ['cccdddddccc', 'cbbcddcbbc', 'cbdbcdcbdbc', 'cbbc**cbbc', 'dcccdddcccd', 'd.cc..cc.d', '..b.....b..'], shots: 30, goal: 'clear',
      tip: 'Garten-Finale: Löse die Blüten von unten, dann fallen ganze Beete herunter.' },
    16: { rows: ['ddeeffaadde', 'deeffaadde', 'ddeeffaadde', 'aa##ff##dd', 'aaa.....ddd'], shots: 26, goal: 'clear', sp: 'bomb@3',
      tip: 'Steinblasen platzen nicht, fallen aber mit herunter. Die Bombe sprengt alles in ihrer Nähe.' },
    30: { rows: ['eeeefffaaaa', 'ee#ff#aa#d', 'deeffaaddee', 'de#fa#ad#e', 'ddeeffaadde', 'd.e.f.a.d.', '.d.e.f.a.d.'], shots: 38, goal: 'clear', sp: 'rainbow@5|bomb@10|rainbow@15',
      tip: 'Neonstadt-Finale: Die Hochhäuser hängen an Steinen. Sprenge die tragenden Farben!' },
    75: { rows: ['ffddcceeaaf', 'fdd@cc@eaf', 'ffddcceeaaf', 'usrtpusrtp', 'ffdd@cceeaa', 'fdcea.fdce', 'f.d.c.e.a.f'], shots: 34, goal: 'clear',
      tip: 'Großes Wasserrätsel: Eine lange Kettenreihe hält alles zusammen. Triff eine Kettenblase passender Farbe!' },
    149: { rows: ['aabbccddeef', 'aAbBcCdDeE', 'aab1cc!dd2e', '%abbccdd%e', 'ffaabbccdde', 'f#a%b#c%d#'], shots: 40, goal: 'rescue', sp: 'rainbow@4|bomb@9|bolt@14',
      tip: 'Fast oben! Taue das Eis mit dem Schalter auf und rette alle vier Kristalle.' },
    150: { rows: ['aabbcc~ddee', 'fabbc%cdde', 'ffa#bc#ddee', 'fa3bcc4dde', 'aaFbb@ccDee', 'a%bbtttdd%', 'aab.ccc.dee', '.b..cc..d.'], shots: 46, goal: 'rescue', sp: 'rainbow@6|bomb@12|bolt@18|rainbow@24',
      tip: 'Das große Finale im Radioturm: Rette die drei Turm-Kristalle. Alles, was du gelernt hast, hilft dir hier.' }
  };
  const TIPS = {
    2: 'Gleiche Farben nebeneinander sammeln: Ab drei platzen sie.', 3: 'Was nicht mehr an der Decke hängt, fällt herunter und bringt doppelte Punkte.',
    4: 'Bandenschuss: Ziele an die Seitenwand, die Kugel prallt ab. Die gestrichelte Linie zeigt den Weg.', 5: 'Löse die Säulen oben ab, dann fällt der Rest.',
    6: 'Punkteziel: Sammle die angezeigten Punkte. Combos und fallende Gruppen zählen mehr.', 9: 'Sternenblasen bringen Bonuspunkte, wenn sie fallen.',
    17: 'Eine Bombenblase kommt! Sie sprengt alles im Umkreis von zwei Feldern.', 18: 'Steinblasen kannst du nur abräumen, indem du ihre Halterung entfernst.',
    19: 'Die Regenbogenblase passt sich der größten angrenzenden Farbgruppe an.', 31: 'Wind-Level! Die Kugel wird seitlich verweht. Die Ziellinie zeigt den echten Weg.',
    34: 'Die Blitzblase räumt die ganze Reihe ab, in der sie landet.', 46: 'Kristalle retten: Lass die Kristallblasen fallen oder sprenge sie frei.',
    61: 'Bombenblasen im Feld explodieren, wenn direkt daneben etwas platzt.', 62: 'Kettenblasen (mit Ring) gehören zusammen: Platzt eine, platzen alle.',
    76: 'Eisblasen tauen auf, wenn du sie triffst oder daneben etwas platzt. Erst dann zählen sie für Dreier.', 78: 'Der Schalter taut auf einen Schlag alles Eis auf. Triff ihn!',
    91: 'Blitzblasen im Feld räumen beim Platzen ihre ganze Reihe ab.', 106: 'Farbwandler (mit Pfeilring) wechseln nach jedem Schuss die Farbe.',
    121: 'Die Decke sinkt alle paar Schüsse eine Reihe tiefer. Der Zähler oben zeigt, wann.', 123: 'Durch den Kanal kommst du am besten mit Bandenschüssen.',
    136: 'Der Radioturm! Hier kommen alle Blasenarten zusammen.'
  };

  const CH = { '#': { k: 's', c: -1 }, '%': { k: 'k', c: -1 }, '*': { k: 'x', c: -1 }, '@': { k: 'b', c: -1 }, '!': { k: 'q', c: -1 } };
  function parseRows(rows, colors) {
    return rows.map((s, r) => Array.from(s).map((ch, c) => {
      if (ch === '.') return null;
      if (CH[ch]) return Object.assign({}, CH[ch]);
      let i = 'abcdef'.indexOf(ch); if (i >= 0) return { k: 'n', c: i };
      i = 'ABCDEF'.indexOf(ch); if (i >= 0) return { k: 'i', c: i };
      i = '123456'.indexOf(ch); if (i >= 0) return { k: 'l', c: i };
      i = 'pqrstu'.indexOf(ch); if (i >= 0) return { k: 'h', c: i };
      if (ch === '~') return { k: 'w', c: colors[c % colors.length] };
      throw new Error('Unbekanntes Zeichen ' + ch + ' in Reihe ' + r);
    }));
  }
  function parseSp(s) { return s ? s.split('|').map(x => { const [k, at] = x.split('@'); return { k, at: +at }; }) : []; }
  function parseSpec(str) {
    const p = str.split(' '), o = { form: p[0], rows: +p[1], n: +p[2], paint: p[3], goal: p[4], ex: {} };
    for (const t of p.slice(5)) { const [k, v] = t.split(':'); o.ex[k] = k === 'sp' ? v : +v; }
    return o;
  }

  // Hilfsfunktionen für den Aufbau
  function tmpRng(seed) { return { rng: seed >>> 0 || 1 }; }
  const R = (g) => E.rnd(g, 'rng');
  function rowLen0(r) { return (r & 1) ? 10 : 11; }
  function xOf(r, c) { return c + ((r & 1) ? 0.5 : 0); }
  const proto = { shift: 0 };
  function nb(r, c) { return E.neighbors(Object.assign({ grid: null }, proto), r, c); }
  function prune(grid) {   // nur Zellen behalten, die mit der Decke verbunden sind
    const seen = new Set(), st = [];
    grid[0].forEach((v, c) => { if (v) { seen.add(c); st.push([0, c]); } });
    while (st.length) { const [a, b] = st.pop(); for (const [x, y] of nb(a, b)) if (x < grid.length && grid[x][y] && !seen.has(x * 32 + y)) { seen.add(x * 32 + y); st.push([x, y]); } }
    grid.forEach((row, r) => row.forEach((v, c) => { if (v && !seen.has(r * 32 + c)) row[c] = null; }));
  }
  function cellsOf(grid, pred) { const o = []; grid.forEach((row, r) => row.forEach((v, c) => { if (v && (!pred || pred(v, r, c))) o.push([r, c]); })); return o; }
  function shuffle(g, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R(g) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function paint(grid, mode, colors, g, rows) {
    const n = colors.length, cells = cellsOf(grid);
    const set = (r, c, i) => { grid[r][c] = { k: 'n', c: colors[((i % n) + n) % n] }; };
    if (mode === 'rows') cells.forEach(([r, c]) => set(r, c, Math.floor(r / 2) + (R(g) < 0.1 ? 1 : 0)));
    else if (mode === 'cols') cells.forEach(([r, c]) => set(r, c, Math.floor((xOf(r, c) + 0.5) / 2)));
    else if (mode === 'diag') cells.forEach(([r, c]) => set(r, c, Math.floor((xOf(r, c) + r * 0.9) / 2)));
    else if (mode === 'rings') cells.forEach(([r, c]) => set(r, c, Math.floor(Math.hypot(xOf(r, c) - 5, (r - rows / 2) * 1.6) / 1.5)));
    else {   // cluster / pairs: zufällige zusammenhängende Gruppen
      const [lo, hi] = mode === 'pairs' ? [2, 3] : mode === 'big' ? [3, 6] : [2, 4], free = new Set(cells.map(([r, c]) => r * 32 + c)), order = shuffle(g, cells.slice());
      for (const [r, c] of order) {
        if (!free.has(r * 32 + c)) continue;
        // Farbe wählen, die an keine fertige Nachbargruppe grenzt (sonst verschmelzen Gruppen zu riesigen Flächen)
        const near = new Set(); for (const [x, y] of nb(r, c)) { const v = grid[x] && grid[x][y]; if (v && v.k) near.add(colors.indexOf(v.c)); }
        let ci = Math.floor(R(g) * n);
        for (let t = 0; t < n && near.has(ci); t++) ci = (ci + 1) % n;
        const size = lo + Math.floor(R(g) * (hi - lo + 1)), grp = [[r, c]]; free.delete(r * 32 + c);
        for (let i = 0; i < grp.length && grp.length < size; i++) {
          for (const [x, y] of shuffle(g, nb(grp[i][0], grp[i][1]))) {
            if (grp.length >= size) break;
            if (free.has(x * 32 + y)) { free.delete(x * 32 + y); grp.push([x, y]); }
          }
        }
        grp.forEach(([x, y]) => set(x, y, ci));
      }
    }
  }
  function place(grid, g, n, pred, make) {
    const cand = shuffle(g, cellsOf(grid, pred)); let k = 0;
    for (const [r, c] of cand) { if (k >= n) break; grid[r][c] = make(grid[r][c], r, c); k++; }
    return k;
  }
  function decorate(grid, ex, g, rows, colors) {
    const plain = (v) => v.k === 'n';
    const lowRows = (v, r) => plain(v) && r >= Math.max(1, Math.floor(rows * 0.4));
    const midRows = (v, r) => plain(v) && r >= 1 && r <= Math.max(2, Math.ceil(rows * 0.6));
    if (ex.chain) {   // eine zusammenhängende Kette
      const starts = shuffle(g, cellsOf(grid, (v, r) => plain(v) && r >= 1));
      if (starts.length) {
        const path = [starts[0]], used = new Set([starts[0][0] * 32 + starts[0][1]]);
        while (path.length < ex.chain) {
          const [a, b] = path[path.length - 1], nx = shuffle(g, nb(a, b)).find(([x, y]) => x >= 1 && x < grid.length && grid[x][y] && plain(grid[x][y]) && !used.has(x * 32 + y));
          if (!nx) break; used.add(nx[0] * 32 + nx[1]); path.push(nx);
        }
        path.forEach(([x, y]) => { grid[x][y] = { k: 'h', c: grid[x][y].c }; });
      }
    }
    if (ex.stone) place(grid, g, ex.stone, (v, r) => plain(v) && r >= 1, () => ({ k: 's', c: -1 }));
    if (ex.crystal) place(grid, g, ex.crystal, midRows, () => ({ k: 'k', c: -1 }));
    if (ex.star) place(grid, g, ex.star, lowRows, () => ({ k: 'x', c: -1 }));
    if (ex.bomb) place(grid, g, ex.bomb, (v, r) => plain(v) && r >= 1, () => ({ k: 'b', c: -1 }));
    if (ex.switch) place(grid, g, ex.switch, lowRows, () => ({ k: 'q', c: -1 }));
    if (ex.bolt) place(grid, g, ex.bolt, (v, r) => plain(v) && r >= 1, v => ({ k: 'l', c: v.c }));
    if (ex.shift) place(grid, g, ex.shift, plain, v => ({ k: 'w', c: v.c }));
    if (ex.ice) { const n = Math.round(cellsOf(grid, plain).length * ex.ice); place(grid, g, n, plain, v => ({ k: 'i', c: v.c })); }
  }
  const SHOT_K = { 2: 0.24, 3: 0.3, 4: 0.36, 5: 0.42, 6: 0.48 };
  const WORLD_F = [1.05, 1, 0.95, 0.82, 0.9, 0.95, 0.88, 0.9, 0.88, 0.86];   // Schusslimit je Welt etwas knapper
  function shotsFor(grid, n, ex, goal, world) {
    const colored = cellsOf(grid, v => v.c >= 0).length;
    let s = Math.ceil(colored * (SHOT_K[n] || 0.45) * WORLD_F[(world.id || 1) - 1]) + 4;
    if (ex.ice) s += Math.ceil(ex.ice * 8);
    if (ex.ceil) s += 2;
    if (goal === 'rescue') s -= 2;
    return Math.max(12, s + (ex.shots || 0));
  }

  function build(spec, seed, world, extra) {
    const colors = world.order.slice(0, spec.n), g = tmpRng(seed), f = FORM[spec.form];
    if (!f) throw new Error('Formation fehlt: ' + spec.form);
    const grid = [];
    for (let r = 0; r < spec.rows; r++) { const row = []; for (let c = 0; c < rowLen0(r); c++) row.push(f(r, xOf(r, c), spec.rows) ? 1 : null); grid.push(row); }
    prune(grid);
    paint(grid, spec.paint, colors, g, spec.rows);
    decorate(grid, spec.ex, g, spec.rows, colors);
    prune(grid);
    const [gt, gn] = spec.goal.split(':');
    const def = Object.assign({ colors, rows: grid, seed: (seed ^ 0x9e3779b9) >>> 0, goal: { type: gt, n: gn ? +gn : 0 },
      shots: shotsFor(grid, spec.n, spec.ex, gt, world), specials: parseSp(spec.ex.sp), wind: spec.ex.wind || 0, ceilEvery: spec.ex.ceil || 0 }, extra || {});
    if (gt === 'rescue') def.goal.n = cellsOf(grid, v => v.k === 'k').length;
    return def;
  }

  const cache = new Map();
  function level(n) {
    if (!(n >= 1 && n <= 150)) return null;
    if (cache.has(n)) return JSON.parse(JSON.stringify(cache.get(n)));
    const w = WORLDS[Math.floor((n - 1) / 15)], seed = E.hashStr('funkblasen-level-' + n);
    let def;
    if (T[n - 1] === 'HAND') {
      const h = HAND[n], colors = [];
      const rows = parseRows(h.rows, w.order);
      rows.forEach(row => row.forEach(v => { if (v && v.c >= 0 && colors.indexOf(v.c) < 0) colors.push(v.c); }));
      colors.sort((a, b) => w.order.indexOf(a) - w.order.indexOf(b));
      def = { colors, rows, seed, shots: h.shots, goal: { type: h.goal, n: 0 }, specials: parseSp(h.sp), wind: 0, ceilEvery: 0, s2: h.s2, s3: h.s3, hand: true };
      if (h.goal === 'rescue') def.goal.n = cellsOf(rows, v => v.k === 'k').length;
    } else {
      def = build(parseSpec(T[n - 1]), seed, w);
      def.spec = T[n - 1];
    }
    def.id = n; def.mode = 'level'; def.world = w.id; def.index = (n - 1) % 15 + 1;
    def.tip = (HAND[n] && HAND[n].tip) || TIPS[n] || null;
    if (def.s2 == null) delete def.s2; if (def.s3 == null) delete def.s3;
    cache.set(n, def);
    return JSON.parse(JSON.stringify(def));
  }

  // Tagesaufgabe: gleicher UTC-Tag + gleiche Spielversion = gleiches Level
  const DAILY_FORMS = ['wall', 'vee', 'diamond', 'arch', 'zigzag', 'waves', 'islands', 'clouds', 'cave', 'reef', 'forest', 'starshape', 'station', 'temple', 'storm', 'tower'];
  function utcDate(d) { d = d || new Date(); return d.toISOString().slice(0, 10); }
  function daily(dateStr) {
    dateStr = dateStr || utcDate();
    const seed = E.hashStr('funkblasen-daily-' + dateStr + '-' + VERSION), g = tmpRng(seed);
    const w = WORLDS[Math.floor(R(g) * WORLDS.length)], form = DAILY_FORMS[Math.floor(R(g) * DAILY_FORMS.length)];
    const n = 4 + Math.floor(R(g) * 2), rows = 6 + Math.floor(R(g) * 3), goalPick = R(g);
    const ex = {}, extras = [['star', 3], ['bomb', 1], ['bolt', 2], ['chain', 4], ['shift', 3], ['stone', 3]];
    for (let i = 0; i < 2; i++) { const e = extras[Math.floor(R(g) * extras.length)]; ex[e[0]] = e[1]; }
    let goal = 'clear';
    if (goalPick < 0.3) { goal = 'rescue'; ex.crystal = 3 + Math.floor(R(g) * 3); } else if (goalPick < 0.5) goal = 'score:' + (2500 + Math.floor(R(g) * 6) * 250);
    ex.sp = 'rainbow@' + (5 + Math.floor(R(g) * 6));
    const spec = { form, rows, n, paint: R(g) < 0.75 ? 'cluster' : 'diag', goal, ex };
    const def = build(spec, seed, w, { mode: 'daily', date: dateStr, world: w.id });
    def.id = 'daily-' + dateStr; def.spec = [form, rows, n, spec.paint, goal].join(' ');
    return def;
  }
  function endless(seed) { return { mode: 'endless', id: 'endless', seed: (seed >>> 0) || 1, colors: [0, 1, 2, 3], world: 1 + (seed % 10), startRows: 6, shots: null }; }
  function free(seed) {
    const g = tmpRng(seed), w = WORLDS[Math.floor(R(g) * WORLDS.length)];
    const forms = ['wall', 'vee', 'arch', 'waves', 'islands', 'clouds', 'diamond', 'pillars'];
    const def = build({ form: forms[Math.floor(R(g) * forms.length)], rows: 5 + Math.floor(R(g) * 2), n: 3 + Math.floor(R(g) * 2), paint: 'cluster', goal: 'clear', ex: { star: 2 } }, seed, w, { mode: 'free', world: w.id });
    def.shots = null; def.id = 'free';
    return def;
  }

  // Kosmetik (nur Optik, keine Vorteile)
  const CANNONS = WORLDS.map(w => ({ id: 'k' + w.id, name: 'Sender-Kanone ' + w.short, world: w.id, color: w.accent }));
  CANNONS.unshift({ id: 'std', name: 'Funki-Standard', world: 0, color: '#ff8a3d' });
  const FINISHES = [
    { id: 'glas', name: 'Glas', cost: 0, rough: 0.12, metal: 0.05, env: 1.0 },
    { id: 'perle', name: 'Perlmutt', cost: 120, rough: 0.32, metal: 0.18, env: 1.25 },
    { id: 'bonbon', name: 'Bonbon', cost: 160, rough: 0.05, metal: 0.0, env: 0.7 },
    { id: 'metall', name: 'Chrom', cost: 240, rough: 0.2, metal: 0.65, env: 1.5 },
    { id: 'matt', name: 'Samt', cost: 200, rough: 0.7, metal: 0.0, env: 0.4 },
    { id: 'galaxie', name: 'Galaxie', cost: 320, rough: 0.1, metal: 0.3, env: 1.8 }
  ];
  const HEADPHONES = [
    { id: 'orange', name: 'Funk-Orange', cost: 0, color: '#ff8a3d' }, { id: 'pink', name: 'Neon-Pink', cost: 90, color: '#ff3df2' },
    { id: 'gold', name: 'Gold', cost: 220, color: '#ffd23a' }, { id: 'eis', name: 'Eisblau', cost: 140, color: '#7fe9ff' }, { id: 'gruen', name: 'Garten-Grün', cost: 110, color: '#5bd66a' }
  ];

  return { VERSION, WORLDS, COLOR_NAMES, COLOR_HEX, TABLE: T, HAND, FORM, level, daily, endless, free, utcDate, parseRows, CANNONS, FINISHES, HEADPHONES, COUNT: 150 };
});
