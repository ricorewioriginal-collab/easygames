/* AnMaCha UNDERCOVER 3D – sechs Karten. Räume und Gänge sind Rechtecke [x, y, Breite, Höhe] in Zellen (1 Zelle = 1 Einheit),
   Punkte sind Zellmitten [x.5, y.5]. Türen entstehen automatisch dort, wo ein Gang einen Raum berührt (core/grid.js).
   stations: Aufgabenstationen (t = Aufgaben-ID aus core/tasks.js); vents: Geheimgänge (nur Verräter); repairs: Reparaturpunkte;
   exits/cage: Verstecken & Jagen; features: Besonderheiten (lift = Aufzug für alle, cams = Kamerapult, dark = Dunkelphasen,
   gate = zeitgesteuertes Tor, zone = Bewegungstempo-Zone). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const S = (t, x, y) => ({ t, at: [x, y] });

  const MAPS = [
    {
      id: 'funkhaus', n: 'Funkhaus Zentral', en: 'Broadcast House', size: [60, 42], outdoor: false,
      desc: 'Das Stammhaus: Studios, Redaktion, Leitstand und ein Dach mit Antennen. Aufzug ins Dach, Kamerapult im Leitstand.',
      theme: { floor: '#2a3558', floor2: '#34406a', wall: '#1a2344', wallTop: '#ff9a2e', accent: '#29d3ff', sky: '#070d1f', fog: '#0a1430', amb: 0.55 },
      rooms: [
        { k: 'studioA', n: 'Studio A', r: [4, 3, 12, 9], deco: 'studio' },
        { k: 'dach', n: 'Dach', r: [24, 2, 12, 8], deco: 'roof' },
        { k: 'studioB', n: 'Moderationsraum', r: [44, 3, 12, 9], deco: 'studio' },
        { k: 'redaktion', n: 'Redaktion', r: [4, 17, 12, 9], deco: 'office' },
        { k: 'foyer', n: 'Foyer', r: [24, 16, 12, 10], deco: 'lobby' },
        { k: 'leitstand', n: 'Leitstand', r: [44, 17, 12, 9], deco: 'control' },
        { k: 'pause', n: 'Pausenraum', r: [4, 31, 12, 8], deco: 'lounge' },
        { k: 'archiv', n: 'Archiv', r: [24, 32, 12, 7], deco: 'archive' },
        { k: 'technik', n: 'Technik', r: [44, 31, 12, 8], deco: 'tech' }
      ],
      halls: [[16, 6, 8, 2], [36, 6, 8, 2], [9, 12, 2, 5], [49, 12, 2, 5], [16, 20, 8, 2], [36, 20, 8, 2], [9, 26, 2, 5], [49, 26, 2, 5], [16, 34, 8, 2], [36, 34, 8, 2], [29, 26, 2, 6]],
      vents: [[14.5, 10.5, 14.5, 37.5], [45.5, 10.5, 45.5, 37.5], [4.5, 25.5, 24.5, 38.5], [55.5, 25.5, 35.5, 38.5], [35.5, 2.5, 55.5, 3.5]],
      features: [{ type: 'lift', n: 'Aufzug Foyer ↔ Dach', a: [27.5, 18.5], b: [27.5, 4.5] }, { type: 'cams', n: 'Kamerapult', at: [46.5, 18.5] }],
      stations: [S('pegel', 5.5, 3.5), S('kabel', 11.5, 3.5), S('mikro', 5.5, 9.5), S('antenne', 26.5, 2.5), S('wellen', 33.5, 8.5), S('frequenz', 30.5, 8.5),
        S('platte', 47.5, 3.5), S('kanaele', 53.5, 8.5), S('playlist_sort', 5.5, 18.5), S('playlist_clean', 12.5, 24.5), S('paket', 34.5, 24.5), S('schalter', 25.5, 24.5),
        S('code', 53.5, 18.5), S('signal', 47.5, 24.5), S('akkus', 5.5, 33.5), S('licht_memory', 12.5, 37.5), S('filter', 26.5, 33.5), S('fokus', 33.5, 33.5),
        S('strom', 47.5, 32.5), S('sicherung', 54.5, 32.5), S('kuehlung', 50.5, 37.5), S('buehne', 33.5, 17.5)],
      button: [30.5, 21.5], spawn: [30.5, 20.5],
      repairs: { lights: [55.5, 35.5], comms: [49.5, 18.5], crit: [[4.5, 6.5], [55.5, 6.5]], mixer: [10.5, 9.5], tower: [[25.5, 6.5], [44.5, 37.5]] },
      exits: [[10.5, 38.5], [50.5, 3.5]], cage: [30.5, 35.5]
    },
    {
      id: 'radiocity', n: 'RadioCity bei Nacht', en: 'RadioCity at Night', size: [64, 44], outdoor: true,
      desc: 'Neon-Platz mitten in der Stadt, Serverräume, Sendeturm und Hinterhöfe mit vielen Rundwegen. Der Stromring flackert regelmäßig.',
      theme: { floor: '#1d2240', floor2: '#2a2350', wall: '#121634', wallTop: '#ff4fb0', accent: '#29d3ff', sky: '#05061a', fog: '#0b0b26', amb: 0.45 },
      rooms: [
        { k: 'turm', n: 'Sendeturm', r: [26, 2, 12, 8], deco: 'tower' },
        { k: 'server', n: 'Serverraum', r: [4, 4, 12, 10], deco: 'server' },
        { k: 'club', n: 'Nachtclub-Studio', r: [48, 4, 12, 10], deco: 'club' },
        { k: 'platz', n: 'Neon-Platz', r: [22, 14, 20, 16], deco: 'plaza' },
        { k: 'lobby', n: 'Hochhaus-Lobby', r: [4, 30, 12, 10], deco: 'lobby' },
        { k: 'zentrale', n: 'Funkzentrale', r: [48, 30, 12, 10], deco: 'control' },
        { k: 'imbiss', n: 'Imbiss', r: [26, 36, 12, 6], deco: 'food' }
      ],
      halls: [[31, 10, 2, 4], [31, 30, 2, 6], [16, 9, 8, 2], [22, 11, 2, 3], [40, 9, 8, 2], [40, 11, 2, 3], [16, 33, 8, 2], [22, 30, 2, 3], [40, 33, 8, 2], [40, 30, 2, 3],
        [8, 14, 2, 16], [54, 14, 2, 16], [16, 5, 10, 2], [38, 5, 10, 2], [16, 38, 10, 2], [38, 38, 10, 2]],
      vents: [[5.5, 5.5, 36.5, 40.5], [58.5, 5.5, 5.5, 38.5], [27.5, 2.5, 58.5, 38.5]],
      features: [{ type: 'dark', n: 'Stromring-Flackern', period: 50, dur: 9 }, { type: 'cams', n: 'Stadtkameras', at: [49.5, 31.5] }],
      stations: [S('antenne', 27.5, 3.5), S('fokus', 36.5, 8.5), S('signal', 5.5, 12.5), S('code', 14.5, 4.5), S('kuehlung', 10.5, 4.5), S('platte', 49.5, 4.5),
        S('licht_memory', 58.5, 12.5), S('buehne', 53.5, 4.5), S('paket', 5.5, 31.5), S('schalter', 14.5, 38.5), S('frequenz', 58.5, 31.5), S('kanaele', 49.5, 38.5),
        S('akkus', 27.5, 40.5), S('playlist_clean', 36.5, 36.5), S('strom', 23.5, 15.5), S('wellen', 40.5, 28.5), S('bruecke', 40.5, 15.5), S('mikro', 23.5, 28.5)],
      button: [31.5, 21.5], spawn: [31.5, 22.5],
      repairs: { lights: [10.5, 13.5], comms: [53.5, 38.5], crit: [[26.5, 8.5], [37.5, 40.5]], mixer: [53.5, 12.5], tower: [[30.5, 2.5], [59.5, 35.5]] },
      exits: [[8.5, 22.5], [55.5, 22.5]], cage: [31.5, 38.5]
    },
    {
      id: 'express', n: 'Frequenz-Express', en: 'Frequency Express', size: [70, 24], outdoor: false,
      desc: 'Ein fahrender Funkzug: Abteile hintereinander, Dachdeck mit Fahrtwind und ein Fahrwerksgang darunter. Die Kupplungstür öffnet nur zeitweise.',
      theme: { floor: '#3a2f2a', floor2: '#4a3a30', wall: '#20283f', wallTop: '#ffb24a', accent: '#5ee6ff', sky: '#0d1a2e', fog: '#13213a', amb: 0.6 },
      rooms: [
        { k: 'lok', n: 'Lok-Führerstand', r: [2, 8, 9, 8], deco: 'cab' },
        { k: 'technik', n: 'Technikwagen', r: [13, 8, 10, 8], deco: 'tech' },
        { k: 'studio', n: 'Studiowagen', r: [25, 8, 10, 8], deco: 'studio' },
        { k: 'speise', n: 'Speisewagen', r: [37, 8, 10, 8], deco: 'food' },
        { k: 'schlaf', n: 'Schlafwagen', r: [49, 8, 9, 8], deco: 'lounge' },
        { k: 'maschine', n: 'Maschinenraum', r: [60, 8, 8, 8], deco: 'engine' },
        { k: 'dach', n: 'Dachdeck', r: [4, 2, 62, 3], deco: 'roof' },
        { k: 'fahrwerk', n: 'Fahrwerksgang', r: [4, 19, 62, 2], deco: 'engine' }
      ],
      halls: [[11, 11, 2, 2], [23, 11, 2, 2], [35, 11, 2, 2], [47, 11, 2, 2], [58, 11, 2, 2], [16, 5, 2, 3], [40, 5, 2, 3], [62, 5, 2, 3],
        [6, 16, 2, 3], [29, 16, 2, 3], [52, 16, 2, 3]],
      vents: [[3.5, 9.5, 56.5, 14.5], [21.5, 14.5, 66.5, 9.5], [26.5, 9.5, 45.5, 14.5]],
      features: [{ type: 'gate', n: 'Kupplungstür', r: [35, 11, 2, 2], period: 24, open: 14 }, { type: 'zone', n: 'Fahrtwind auf dem Dach', r: [4, 2, 62, 3], mul: 0.65 }],
      stations: [S('frequenz', 3.5, 14.5), S('schalter', 9.5, 9.5), S('strom', 14.5, 9.5), S('sicherung', 21.5, 9.5), S('bruecke', 17.5, 14.5), S('pegel', 26.5, 14.5),
        S('mikro', 33.5, 9.5), S('kanaele', 33.5, 14.5), S('paket', 38.5, 9.5), S('akkus', 45.5, 9.5), S('licht_memory', 50.5, 9.5), S('playlist_sort', 56.5, 9.5),
        S('kuehlung', 61.5, 14.5), S('code', 66.5, 14.5), S('antenne', 10.5, 2.5), S('wellen', 35.5, 2.5), S('fokus', 58.5, 3.5), S('signal', 20.5, 19.5), S('filter', 45.5, 20.5), S('platte', 38.5, 14.5)],
      button: [42.5, 12.5], spawn: [41.5, 11.5],
      repairs: { lights: [18.5, 8.5], comms: [5.5, 8.5], crit: [[2.5, 12.5], [67.5, 12.5]], mixer: [29.5, 8.5], tower: [[30.5, 3.5], [64.5, 19.5]] },
      exits: [[4.5, 20.5], [65.5, 2.5]], cage: [53.5, 12.5]
    },
    {
      id: 'festival', n: 'Festivalgelände', en: 'Festival Grounds', size: [64, 46], outdoor: true,
      desc: 'Zwei Bühnen, Backstage, Stromzentrale und Hinterwege rund um die Festwiese. Ein Bühnenlift-Tunnel verbindet beide Bühnen, in der Menge geht es nur langsam voran.',
      theme: { floor: '#2b4a2f', floor2: '#3b5a35', wall: '#1d2a22', wallTop: '#ff9a2e', accent: '#ffe066', sky: '#10122e', fog: '#161a3a', amb: 0.6 },
      rooms: [
        { k: 'haupt', n: 'Hauptbühne', r: [20, 2, 22, 9], deco: 'stage' },
        { k: 'backstage', n: 'Backstage', r: [46, 2, 14, 9], deco: 'lounge' },
        { k: 'wiese', n: 'Festwiese', r: [16, 15, 32, 14], deco: 'field' },
        { k: 'strom', n: 'Stromzentrale', r: [2, 15, 10, 10], deco: 'tech' },
        { k: 'verkauf', n: 'Verkaufsstände', r: [52, 15, 10, 12], deco: 'food' },
        { k: 'zweite', n: 'Zweite Bühne', r: [20, 33, 22, 9], deco: 'stage' },
        { k: 'camping', n: 'Campingplatz', r: [2, 32, 12, 12], deco: 'camp' },
        { k: 'zelt', n: 'Technikzelt', r: [50, 33, 12, 10], deco: 'control' }
      ],
      halls: [[30, 11, 4, 4], [42, 5, 4, 2], [30, 29, 4, 4], [12, 20, 4, 2], [48, 20, 4, 2], [6, 25, 2, 7], [6, 6, 2, 9], [8, 6, 12, 2], [56, 11, 2, 4], [56, 27, 2, 6], [14, 37, 6, 2], [42, 37, 8, 2]],
      vents: [[2.5, 15.5, 61.5, 42.5], [59.5, 2.5, 2.5, 43.5], [61.5, 26.5, 41.5, 2.5]],
      features: [{ type: 'lift', n: 'Bühnenlift-Tunnel', a: [24.5, 3.5], b: [24.5, 38.5] }, { type: 'zone', n: 'Menschenmenge', r: [22, 15, 20, 6], mul: 0.7 }],
      stations: [S('buehne', 27.5, 2.5), S('pegel', 36.5, 9.5), S('mikro', 47.5, 3.5), S('playlist_sort', 58.5, 9.5), S('playlist_clean', 52.5, 9.5), S('strom', 3.5, 17.5),
        S('sicherung', 10.5, 23.5), S('akkus', 3.5, 23.5), S('licht_memory', 17.5, 27.5), S('paket', 46.5, 16.5), S('wellen', 17.5, 16.5), S('code', 60.5, 16.5),
        S('kuehlung', 53.5, 25.5), S('kanaele', 21.5, 40.5), S('platte', 40.5, 34.5), S('antenne', 3.5, 33.5), S('fokus', 12.5, 42.5), S('filter', 51.5, 34.5),
        S('signal', 60.5, 41.5), S('frequenz', 55.5, 42.5), S('kabel', 40.5, 2.5)],
      button: [32.5, 24.5], spawn: [32.5, 23.5],
      repairs: { lights: [10.5, 15.5], comms: [50.5, 42.5], crit: [[20.5, 9.5], [41.5, 41.5]], mixer: [30.5, 40.5], tower: [[2.5, 38.5], [59.5, 5.5]] },
      exits: [[7.5, 43.5], [61.5, 20.5]], cage: [52.5, 6.5]
    },
    {
      id: 'insel', n: 'Inselstation', en: 'Island Station', size: [64, 44], outdoor: true,
      desc: 'Tropischer Radiosender mit Strand, Generatorhaus, Leuchtturm und Höhle. Auf der Funkbrücke bremst der Wind, im Höhlengang steigt regelmäßig die Flut.',
      theme: { floor: '#c9a86a', floor2: '#7ab36b', wall: '#3b2f25', wallTop: '#ff9a2e', accent: '#29d3ff', sky: '#0d3a5a', fog: '#164866', amb: 0.75 },
      rooms: [
        { k: 'strand', n: 'Strand', r: [4, 34, 56, 8], deco: 'beach' },
        { k: 'huette', n: 'Funkhütte', r: [24, 4, 14, 10], deco: 'studio' },
        { k: 'generator', n: 'Generatorhaus', r: [4, 4, 12, 10], deco: 'tech' },
        { k: 'leuchtturm', n: 'Leuchtturm', r: [48, 4, 12, 10], deco: 'tower' },
        { k: 'bar', n: 'Palmenbar', r: [4, 20, 12, 9], deco: 'food' },
        { k: 'hoehle', n: 'Höhle', r: [26, 20, 12, 8], deco: 'cave' },
        { k: 'steg', n: 'Bootssteg', r: [48, 22, 12, 8], deco: 'dock' }
      ],
      halls: [[38, 8, 10, 2], [16, 7, 8, 2], [9, 14, 2, 6], [9, 29, 2, 5], [30, 14, 2, 6], [30, 28, 2, 6], [53, 14, 2, 8], [53, 30, 2, 4], [16, 23, 10, 2], [38, 24, 10, 2]],
      vents: [[4.5, 13.5, 59.5, 29.5], [59.5, 4.5, 4.5, 41.5], [24.5, 4.5, 15.5, 28.5]],
      features: [{ type: 'zone', n: 'Windzone Funkbrücke', r: [38, 8, 10, 2], mul: 0.6 }, { type: 'gate', n: 'Flut im Höhlengang', r: [30, 30, 2, 2], period: 30, open: 18 }],
      stations: [S('pegel', 25.5, 12.5), S('mikro', 36.5, 4.5), S('playlist_sort', 36.5, 12.5), S('strom', 5.5, 4.5), S('akkus', 14.5, 12.5), S('kuehlung', 14.5, 4.5),
        S('antenne', 49.5, 4.5), S('fokus', 58.5, 12.5), S('frequenz', 53.5, 8.5), S('platte', 5.5, 21.5), S('licht_memory', 14.5, 27.5), S('signal', 27.5, 21.5),
        S('bruecke', 36.5, 26.5), S('paket', 58.5, 23.5), S('wellen', 49.5, 28.5), S('buehne', 20.5, 40.5), S('filter', 44.5, 40.5), S('code', 5.5, 35.5), S('notfunk', 37.5, 35.5)],
      button: [31.5, 37.5], spawn: [31.5, 38.5],
      repairs: { lights: [9.5, 4.5], comms: [54.5, 4.5], crit: [[59.5, 8.5], [4.5, 24.5]], mixer: [30.5, 4.5], tower: [[49.5, 12.5], [26.5, 27.5]] },
      exits: [[58.5, 38.5], [4.5, 8.5]], cage: [33.5, 23.5]
    },
    {
      id: 'orbital', n: 'Orbital-Sendestation', en: 'Orbital Relay', size: [60, 60], outdoor: false,
      desc: 'Ringförmige Funkstation im All mit Speichen zur Zentralkuppel. In der Kuppel ist es fast schwerelos (schneller), auf der Nachtseite wird es regelmäßig dunkel.',
      theme: { floor: '#2b3346', floor2: '#36405a', wall: '#161c2e', wallTop: '#29d3ff', accent: '#b07cff', sky: '#020309', fog: '#050817', amb: 0.5 },
      rooms: [
        { k: 'kuppel', n: 'Zentralkuppel', r: [24, 24, 12, 12], deco: 'hub' },
        { k: 'andock', n: 'Andockbucht', r: [24, 4, 12, 8], deco: 'dock' },
        { k: 'segel', n: 'Sonnensegel-Kontrolle', r: [44, 8, 10, 10], deco: 'control' },
        { k: 'arm', n: 'Antennenarm', r: [48, 25, 8, 10], deco: 'tower' },
        { k: 'labor', n: 'Labor', r: [44, 42, 10, 10], deco: 'lab' },
        { k: 'quartier', n: 'Quartiere', r: [24, 48, 12, 8], deco: 'lounge' },
        { k: 'hydro', n: 'Hydrokultur', r: [6, 42, 10, 10], deco: 'garden' },
        { k: 'reaktor', n: 'Reaktor', r: [4, 25, 8, 10], deco: 'engine' },
        { k: 'funkdeck', n: 'Funkdeck', r: [6, 8, 10, 10], deco: 'studio' }
      ],
      halls: [[36, 9, 8, 2], [50, 18, 2, 7], [50, 35, 2, 7], [36, 49, 8, 2], [16, 49, 8, 2], [8, 35, 2, 7], [8, 18, 2, 7], [16, 9, 8, 2],
        [29, 12, 2, 12], [36, 29, 12, 2], [29, 36, 2, 12], [12, 29, 12, 2]],
      vents: [[6.5, 8.5, 53.5, 51.5], [53.5, 8.5, 6.5, 51.5], [4.5, 34.5, 55.5, 25.5]],
      features: [{ type: 'zone', n: 'Schwerelos-Kuppel', r: [24, 24, 12, 12], mul: 1.35 }, { type: 'dark', n: 'Orbit-Nachtseite', period: 60, dur: 10 }],
      stations: [S('paket', 25.5, 4.5), S('code', 34.5, 11.5), S('fokus', 45.5, 9.5), S('akkus', 52.5, 16.5), S('antenne', 54.5, 26.5), S('wellen', 49.5, 33.5),
        S('filter', 45.5, 43.5), S('signal', 52.5, 50.5), S('schalter', 45.5, 50.5), S('licht_memory', 25.5, 54.5), S('playlist_clean', 34.5, 49.5), S('kuehlung', 7.5, 43.5),
        S('bruecke', 14.5, 50.5), S('strom', 5.5, 26.5), S('sicherung', 10.5, 33.5), S('frequenz', 7.5, 9.5), S('kanaele', 14.5, 16.5), S('mikro', 14.5, 9.5),
        S('buehne', 25.5, 25.5), S('pegel', 34.5, 34.5), S('platte', 34.5, 25.5), S('playlist_sort', 25.5, 34.5), S('kabel', 34.5, 54.5)],
      button: [30.5, 30.5], spawn: [30.5, 29.5],
      repairs: { lights: [4.5, 29.5], comms: [10.5, 8.5], crit: [[35.5, 4.5], [24.5, 55.5]], mixer: [6.5, 16.5], tower: [[55.5, 34.5], [15.5, 42.5]] },
      exits: [[29.5, 4.5], [29.5, 55.5]], cage: [48.5, 46.5]
    }
  ];

  /** Verstecke (Verstecken & Jagen): je Raum zwei Ecken, die nicht auf Stationen/Gängen liegen. */
  function hideSpots(map) {
    const used = new Set();
    const mark = p => used.add(Math.floor(p[0]) + ',' + Math.floor(p[1]));
    map.stations.forEach(s => mark(s.at)); (map.vents || []).forEach(v => { mark([v[0], v[1]]); mark([v[2], v[3]]); });
    Object.values(map.repairs).forEach(r => Array.isArray(r[0]) ? r.forEach(mark) : mark(r)); (map.exits || []).forEach(mark); mark(map.button);
    (map.features || []).forEach(f => { if (f.a) { mark(f.a); mark(f.b); } if (f.at) mark(f.at); });
    const out = [];
    map.rooms.forEach(rm => {
      const [x, y, w, h] = rm.r;
      const cand = [[x + w - 1.5, y + h - 1.5], [x + 1.5, y + h - 1.5], [x + w - 1.5, y + 1.5], [x + 1.5, y + 1.5]];
      let n = 0;
      for (const p of cand) { const k = Math.floor(p[0]) + ',' + Math.floor(p[1]); if (!used.has(k) && n < 2) { used.add(k); out.push({ at: p, room: rm.k }); n++; } }
    });
    return out;
  }
  MAPS.forEach(m => { m.hides = hideSpots(m); });
  AMU.MAPS = MAPS;
  // Ortsangaben für Sätze („Ich war im Foyer.“ / „Ich komme aus dem Foyer.“)
  const ROOM_IN = {"Studio A": "in Studio A", "Dach": "auf dem Dach", "Moderationsraum": "im Moderationsraum", "Redaktion": "in der Redaktion", "Foyer": "im Foyer", "Leitstand": "im Leitstand", "Pausenraum": "im Pausenraum", "Archiv": "im Archiv", "Technik": "in der Technik", "Sendeturm": "am Sendeturm", "Serverraum": "im Serverraum", "Nachtclub-Studio": "im Nachtclub-Studio", "Neon-Platz": "auf dem Neon-Platz", "Hochhaus-Lobby": "in der Hochhaus-Lobby", "Funkzentrale": "in der Funkzentrale", "Imbiss": "im Imbiss", "Lok-Führerstand": "im Lok-Führerstand", "Technikwagen": "im Technikwagen", "Studiowagen": "im Studiowagen", "Speisewagen": "im Speisewagen", "Schlafwagen": "im Schlafwagen", "Maschinenraum": "im Maschinenraum", "Dachdeck": "auf dem Dachdeck", "Fahrwerksgang": "im Fahrwerksgang", "Kupplungstür": "an der Kupplungstür", "Fahrtwind auf dem Dach": "im Fahrtwind auf dem Dach", "Hauptbühne": "auf der Hauptbühne", "Backstage": "im Backstage", "Festwiese": "auf der Festwiese", "Stromzentrale": "in der Stromzentrale", "Verkaufsstände": "bei den Verkaufsständen", "Zweite Bühne": "auf der zweiten Bühne", "Campingplatz": "auf dem Campingplatz", "Technikzelt": "im Technikzelt", "Menschenmenge": "in der Menschenmenge", "Strand": "am Strand", "Funkhütte": "in der Funkhütte", "Generatorhaus": "im Generatorhaus", "Leuchtturm": "im Leuchtturm", "Palmenbar": "an der Palmenbar", "Höhle": "in der Höhle", "Bootssteg": "am Bootssteg", "Windzone Funkbrücke": "in der Windzone Funkbrücke", "Flut im Höhlengang": "im Höhlengang", "Zentralkuppel": "in der Zentralkuppel", "Andockbucht": "in der Andockbucht", "Sonnensegel-Kontrolle": "in der Sonnensegel-Kontrolle", "Antennenarm": "am Antennenarm", "Labor": "im Labor", "Quartiere": "in den Quartieren", "Hydrokultur": "in der Hydrokultur", "Reaktor": "am Reaktor", "Funkdeck": "auf dem Funkdeck", "Schwerelos-Kuppel": "in der Schwerelos-Kuppel", "Gang": "im Gang"};
  const AUS = [['im ', 'aus dem '], ['in der ', 'aus der '], ['in den ', 'aus den '], ['auf dem ', 'vom '], ['auf der ', 'von der '], ['am ', 'vom '], ['an der ', 'von der '], ['bei den ', 'von den '], ['in ', 'aus ']];
  AMU.roomIn = n => ROOM_IN[n] || ('in ' + n);
  AMU.roomFrom = n => { const i = AMU.roomIn(n), a = AUS.find(x => i.indexOf(x[0]) === 0); return a ? a[1] + i.slice(a[0].length) : 'aus ' + n; };
  AMU.mapById = id => MAPS.find(m => m.id === id) || MAPS[0];
  if (typeof module !== 'undefined' && module.exports) module.exports = MAPS;
})(typeof window !== 'undefined' ? window : globalThis);
