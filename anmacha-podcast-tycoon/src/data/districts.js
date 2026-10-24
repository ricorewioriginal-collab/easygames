/* Stadtplan: 8 Bezirke im 3×3-Raster um den Funkplatz (Mitte). Koordinaten in Metern, x = Osten, z = Süden.
   Jeder Bezirk: Mitte (cx, cz), Schnellreise-Punkt (spawn mit Blickrichtung ry), Orte (spots, relativ zur Mitte),
   begehbare Gebäude (Baupläne im selben Rasterformat wie das eigene Studio) und Requisiten (props).
   Bauplan: x/z = linke obere Ecke relativ zur Bezirksmitte, w/d = Größe, doors/windows = [Seite, Feldindex],
   inner = Innenwände [x1, z1, x2, z2, Art] in Bauplan-Feldern, objs = [Objekt-ID, x, z, Drehung 0..3]. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};
  D.world = { half: 112, avenues: [-40, 40], lotStudio: 'studio', lotCampus: 'campus' };

  D.districts = [
    { id: 'altstudio', name: 'Altes AnMaCha-Studio', icon: '🏠', cx: -75, cz: -75, color: '#ffb02e', open: true,
      desc: 'Eure Startbasis: das kleine, marode Studio mit Garten zum Ausbauen.',
      spawn: { x: 0, z: 14, ry: Math.PI }, spots: { hof: [0, 11], garten: [12, 4], eingang: [-3, 8] },
      lot: { id: 'studio', x: -10, z: -10, w: 20, d: 14 },
      buildings: [],
      props: [['tree', -18, -12], ['tree', 16, -12], ['tree', 18, 8], ['tree', -18, 9], ['bench', 6, 12, 0], ['lamp', -6, 13], ['lamp', 8, 13], ['sign', 0, 10.5, 'ALTES ANMACHA-STUDIO'], ['mailbox', -4, 11]] },
    { id: 'medien', name: 'Medienstraße', icon: '📰', cx: 0, cz: -75, color: '#ff7ad9', open: true,
      desc: 'Agenturen, Café, Plattenladen, Druckstudio und Fan-Treff – hier findet ihr Personal und Aufträge.',
      spawn: { x: 0, z: 14, ry: Math.PI }, spots: { cafe: [-28, -3], agentur: [-12, -3], plattenladen: [3, -3], druck: [17, -3], fantreff: [31, -3], strasse: [0, 8] },
      buildings: [
        { id: 'cafe', name: 'Café Tonspur', x: -34, z: -10, w: 12, d: 10, floor: 'holz', wall: '#e8d8c0', roof: '#7a3a2a', doors: [['s', 6]], windows: [['s', 2], ['s', 9], ['w', 4]],
          objs: [['mo_tresen', 2, 1, 0], ['mo_kaffee', 5, 0, 0], ['mo_kuehl', 7, 0, 0], ['mo_tisch', 2, 5, 0], ['mo_stuhl', 2, 4, 2], ['mo_stuhl', 3, 6, 0], ['mo_tisch', 8, 5, 0], ['mo_hocker', 8, 4, 0], ['mo_hocker', 9, 6, 0], ['pf_monstera', 0, 8, 0], ['pf_palme', 11, 8, 0], ['li_steh', 11, 0, 0]] },
        { id: 'agentur', name: 'Agentur Mikrofonia', x: -18, z: -10, w: 12, d: 10, floor: 'teppich', wall: '#d8e0e8', roof: '#2a4a6a', doors: [['s', 6]], windows: [['s', 2], ['s', 9]],
          inner: [[0, 5, 4, 5, 'wall'], [4, 5, 5, 5, 'door']],
          objs: [['mo_schreib', 1, 1, 0], ['mo_buero', 1, 2, 2], ['bs_monitor', 1, 1, 0], ['mo_schreib', 8, 1, 0], ['mo_buero', 8, 2, 2], ['bs_laptop', 9, 1, 0], ['mo_regal', 11, 0, 0], ['mo_regal', 0, 0, 0], ['mo_sofa', 8, 7, 0], ['pf_bonsai', 5, 1, 0], ['ad_bild', 6, 0, 0]] },
        { id: 'plattenladen', name: 'Plattenladen Rillenwerk', x: -2, z: -10, w: 10, d: 10, floor: 'parkett', wall: '#2b2f3a', roof: '#1d1f26', doors: [['s', 5]], windows: [['s', 2], ['s', 8]],
          objs: [['ad_regal', 0, 0, 0], ['ad_regal', 1, 0, 0], ['ad_regal', 2, 0, 0], ['ad_regal', 7, 0, 0], ['ad_regal', 8, 0, 0], ['rq_gitarre', 9, 3, 3], ['rq_synth', 3, 4, 0], ['mo_tresen', 6, 6, 0], ['li_neon', 4, 0, 0], ['mo_hocker', 1, 7, 0]] },
        { id: 'druck', name: 'Druckstudio Pixelpresse', x: 12, z: -10, w: 10, d: 10, floor: 'beton', wall: '#e8e8e8', roof: '#4a4f5d', doors: [['s', 5]], windows: [['s', 2], ['s', 8]],
          objs: [['mo_schreib', 1, 1, 0], ['bs_monitor', 1, 1, 0], ['mo_buero', 1, 2, 2], ['mo_schreib', 6, 1, 0], ['bs_monitor', 7, 1, 0], ['mo_buero', 7, 2, 2], ['rq_kisten', 0, 7, 0], ['rq_kisten', 9, 7, 0], ['hp_offen', 2, 1, 0], ['pf_kaktus', 9, 0, 0]] },
        { id: 'fantreff', name: 'Fan-Treff', x: 26, z: -10, w: 10, d: 10, floor: 'teppich', wall: '#ffd8a8', roof: '#c0392b', doors: [['s', 5]], windows: [['s', 2], ['s', 8]],
          objs: [['bs_wand', 4, 0, 0], ['mo_sofa', 1, 3, 0], ['mo_sofa', 6, 3, 0], ['ad_kissen', 1, 6, 0], ['ad_kissen', 8, 6, 0], ['rq_merch', 9, 1, 0], ['li_led', 4, 2, 0], ['bs_social', 0, 0, 0]] }
      ],
      props: [['road', 0, 6, 76, 6], ['lamp', -24, 4], ['lamp', 0, 4], ['lamp', 24, 4], ['tree', -38, 10], ['tree', 38, 10], ['bench', -10, 9, 0], ['bench', 12, 9, 0], ['kiosk', -38, -4], ['poster', 20, 8, 'Medienstraße']] },
    { id: 'tecpark', name: 'TEC-Park', icon: '🔌', cx: 75, cz: -75, color: '#6ef0ff', open: true,
      desc: 'Technikladen, Reparaturwerkstatt und Rechenzentrum mit Schaltungs- und Netzwerkrätseln.',
      spawn: { x: -6, z: 14, ry: Math.PI }, spots: { laden: [-23, -6], werkstatt: [-4, -6], rechenzentrum: [16, -8], hof: [0, 8] },
      buildings: [
        { id: 'laden', name: 'Pixelbergs Kabelparadies', x: -30, z: -14, w: 14, d: 10, floor: 'fliesen', wall: '#d8f4f8', roof: '#2a6a8a', doors: [['s', 7]], windows: [['s', 3], ['s', 11]],
          objs: [['mo_tresen', 6, 5, 0], ['mo_regal', 0, 0, 0], ['mo_regal', 1, 0, 0], ['mo_regal', 12, 0, 0], ['mo_regal', 13, 0, 0], ['if_4', 3, 1, 0], ['mx_podcast', 4, 1, 0], ['mic_kond', 6, 1, 0], ['mic_dyn', 7, 1, 0], ['bs_monitor', 9, 1, 0], ['cam_hd', 11, 3, 0], ['li_softbox', 10, 3, 0]] },
        { id: 'werkstatt', name: 'Reparaturwerkstatt Lötkolben', x: -10, z: -14, w: 12, d: 10, floor: 'beton', wall: '#c8c0b0', roof: '#5a4a3a', doors: [['s', 6]], windows: [['s', 2], ['e', 4]],
          objs: [['mo_werkbank', 1, 1, 0], ['mo_werkbank', 7, 1, 0], ['if_patch', 4, 0, 0], ['rq_kisten', 0, 7, 0], ['rq_kisten', 1, 8, 0], ['rq_kisten', 10, 8, 0], ['mo_hocker', 2, 2, 0], ['mo_hocker', 8, 2, 0], ['bs_retro', 11, 0, 0]] },
        { id: 'rechenzentrum', name: 'Rechenzentrum Datenwolke', x: 8, z: -16, w: 16, d: 12, floor: 'beton', wall: '#8a8f99', roof: '#3a3f4d', doors: [['s', 8]],
          inner: [[0, 7, 7, 7, 'wall'], [7, 7, 9, 7, 'door'], [9, 7, 16, 7, 'wall']],
          objs: [['bs_server', 2, 1, 0], ['bs_server', 3, 1, 0], ['bs_server', 4, 1, 0], ['bs_server', 6, 1, 0], ['bs_server', 9, 1, 0], ['bs_server', 11, 1, 0], ['bs_server', 12, 1, 0], ['bs_server', 13, 1, 0], ['bs_server', 2, 4, 0], ['bs_server', 4, 4, 0], ['bs_server', 11, 4, 0], ['bs_server', 13, 4, 0], ['mo_schreib', 2, 9, 0], ['bs_monitor', 2, 9, 0], ['mo_buero', 2, 10, 2], ['pf_kaktus', 14, 10, 0]] }
      ],
      props: [['road', 0, 6, 76, 6], ['antenna', 30, -10], ['car', 22, 9, 0], ['car', -24, 10, 1], ['lamp', -18, 4], ['lamp', 6, 4], ['lamp', 28, 4], ['tree', 36, 12], ['container', 32, 0]] },
    { id: 'tvstudio', name: 'TV- und Quizstudio', icon: '📺', cx: 75, cz: 0, color: '#c58bff', open: false, unlockText: 'Öffnet in Kapitel 3 „Fernsehfieber“.',
      desc: 'Bühnen, Lichtanlagen, Publikum und die große Quizshow.',
      spawn: { x: -6, z: 16, ry: Math.PI }, spots: { foyer: [-7, 3], buehne: [-7, -7], platz: [-6, 12] },
      buildings: [
        { id: 'halle', name: 'Studiohalle 1', x: -20, z: -14, w: 26, d: 20, floor: 'beton', wall: '#3a2f5a', roof: '#241c3a', doors: [['s', 13]], windows: [['s', 4], ['s', 22]],
          inner: [[0, 14, 11, 14, 'wall'], [11, 14, 15, 14, 'door'], [15, 14, 26, 14, 'wall']],
          objs: [['rq_buehne', 11, 2, 0], ['rq_buzzer', 8, 3, 0], ['rq_buzzer', 10, 3, 0], ['rq_buzzer', 14, 3, 0], ['rq_buzzer', 16, 3, 0], ['li_spot', 6, 1, 0], ['li_spot', 19, 1, 0], ['bs_wand', 12, 0, 0], ['cam_hd', 9, 8, 2], ['cam_hd', 16, 8, 2], ['cam_kran', 21, 6, 0],
            ['mo_stuhl', 6, 11, 2], ['mo_stuhl', 7, 11, 2], ['mo_stuhl', 8, 11, 2], ['mo_stuhl', 9, 11, 2], ['mo_stuhl', 16, 11, 2], ['mo_stuhl', 17, 11, 2], ['mo_stuhl', 18, 11, 2], ['mo_stuhl', 19, 11, 2],
            ['mo_tresen', 3, 16, 0], ['mo_sofa', 19, 17, 0], ['pf_palme', 0, 19, 0], ['pf_palme', 25, 19, 0], ['ab_vorhang', 3, 0, 0], ['ab_vorhang', 22, 0, 0]] }
      ],
      props: [['road', -6, 9, 4, 18], ['lamp', -16, 10], ['lamp', 4, 10], ['billboard', 14, 6, 'QUIZ HEUTE'], ['tree', 16, 14], ['tree', -24, 14]] },
    { id: 'bahnhof', name: 'Bahnhofsviertel', icon: '🚉', cx: 75, cz: 75, color: '#ff4d6d', open: false, unlockText: 'Öffnet in Kapitel 4 „On the Road“.',
      desc: 'Bahnhofshalle, Bahnsteig und Fahrpläne voller Geschichten (Funkbahn, Regio-Anmacher).',
      spawn: { x: -14, z: -26, ry: 0 }, spots: { halle: [-14, -15], bahnsteig: [-5, -2], kiosk: [12, -15], vorplatz: [-14, -26] },
      buildings: [
        { id: 'halle', name: 'Bahnhofshalle', x: -24, z: -22, w: 20, d: 10, floor: 'fliesen', wall: '#e8d0b0', roof: '#7a3a2a', doors: [['n', 10], ['s', 10]], windows: [['n', 3], ['n', 17], ['s', 3], ['s', 17]],
          objs: [['mo_tresen', 2, 1, 0], ['bs_retro', 9, 0, 0], ['bs_retro', 11, 0, 0], ['mo_hocker', 15, 4, 0], ['mo_hocker', 16, 4, 0], ['mo_hocker', 17, 4, 0], ['pf_palme', 0, 9, 0], ['pf_palme', 19, 9, 0], ['mo_kaffee', 19, 0, 0]] },
        { id: 'kiosk', name: 'Bahnhofskiosk', x: 8, z: -20, w: 8, d: 6, floor: 'holz', wall: '#ffd36b', roof: '#c0392b', doors: [['n', 4]], windows: [['e', 2]],
          objs: [['mo_tresen', 3, 3, 0], ['mo_regal', 0, 5, 2], ['mo_kuehl', 7, 5, 2]] }
      ],
      props: [['platform', 0, -2, 70, 6], ['tracks', 0, 4, 80], ['tracks', 0, 9, 80], ['train', 6, 4], ['lamp', -20, -2], ['lamp', 0, -2], ['lamp', 20, -2], ['clock', -14, -28], ['bench', -10, -1, 0], ['bench', 10, -1, 0], ['sign', -14, -27, 'FUNKBAHN · HAUPTBAHNHOF']] },
    { id: 'camping', name: 'Campingplatz & Roadtrip-Garage', icon: '🏕️', cx: 0, cz: 75, color: '#4be08a', open: false, unlockText: 'Öffnet in Kapitel 4 „On the Road“.',
      desc: 'Camper, Zelte, Lagerfeuer und die Garage für Roadtrips.',
      spawn: { x: 0, z: -28, ry: 0 }, spots: { rezeption: [-25, -12], platz: [0, 2], garage: [20, -12], feuer: [-6, 10], strecke: [24, 14] },
      buildings: [
        { id: 'rezeption', name: 'Rezeption „Zum Hering“', x: -30, z: -18, w: 10, d: 8, floor: 'holz', wall: '#a8845a', roof: '#3e6b3a', doors: [['s', 5]], windows: [['s', 2], ['e', 3]],
          objs: [['mo_tresen', 3, 2, 0], ['mo_regal', 0, 0, 0], ['ad_teppich', 4, 5, 0], ['pf_monstera', 9, 0, 0], ['li_steh', 0, 7, 0]] },
        { id: 'garage', name: 'Roadtrip-Garage', x: 14, z: -18, w: 12, d: 10, floor: 'beton', wall: '#8a8f99', roof: '#4a4f5d', doors: [['s', 6], ['s', 7]], windows: [['w', 4]],
          objs: [['mo_werkbank', 0, 0, 0], ['rq_kisten', 10, 0, 0], ['rq_kisten', 11, 1, 0], ['if_recorder', 3, 0, 0], ['cam_action', 4, 0, 0], ['li_led', 6, 9, 0]] }
      ],
      props: [['road', 0, -30, 6, 20], ['camper', -12, 0, 0.3], ['camper', 10, 4, -0.4], ['tent', -24, 6, '#ffb02e'], ['tent', -18, 14, '#6ef0ff'], ['tent', 4, 16, '#ff7ad9'], ['campfire', -6, 10], ['tree', -36, -8], ['tree', -34, 18], ['tree', 32, -4], ['tree', 36, 20], ['tree', 12, 22], ['track', 26, 14, 12], ['bench', -8, 13, 0]] },
    { id: 'festival', name: 'Festivalgelände', icon: '🎪', cx: -75, cz: 75, color: '#ffd36b', open: false, unlockText: 'Öffnet mit der Festivalanfrage in Kapitel 3.',
      desc: 'Große Bühne, Fanmeile und Partyspiele – nur mit eigens komponierter Musik.',
      spawn: { x: 0, z: 26, ry: Math.PI }, spots: { buero: [-26, -16], buehne: [0, -8], eingang: [0, 18], fanmeile: [18, 4] },
      buildings: [
        { id: 'buero', name: 'Festivalbüro', x: -31, z: -21, w: 9, d: 7, floor: 'beton', wall: '#ffd36b', roof: '#2b2f3a', doors: [['s', 4]], windows: [['e', 3]],
          objs: [['mo_schreib', 1, 1, 0], ['bs_laptop', 1, 1, 0], ['mo_buero', 1, 2, 2], ['rq_kisten', 7, 0, 0], ['mo_kuehl', 8, 5, 0]] }
      ],
      props: [['stage', 0, -16], ['fence', 0, 22, 60], ['gate', 0, 21], ['foodtruck', 20, -2, 0], ['foodtruck', 24, 8, 1], ['tent', -20, 6, '#c58bff'], ['tent', -16, 12, '#4be08a'], ['lamp', -10, 14], ['lamp', 10, 14], ['flag', -14, -4], ['flag', 14, -4], ['speaker', -10, -14], ['speaker', 10, -14]] },
    { id: 'campus', name: 'Mediencampus', icon: '🏢', cx: -75, cz: 0, color: '#4bb8ff', open: false, unlockText: 'Wird in Kapitel 6 freigeschaltet.',
      desc: 'Das Endgame-Areal: Platz für viele Redaktionen, Video- und Podcastkomplex, Dachstudio und Auszeichnungen.',
      spawn: { x: 0, z: 16, ry: Math.PI }, spots: { tor: [0, 13], hof: [6, 8], funkfuchs: [22, -4] },
      lot: { id: 'campus', x: -20, z: -14, w: 28, d: 20 },
      buildings: [
        { id: 'funkfuchs', name: 'Funkfuchs-Studio (Rivalen)', x: 12, z: -12, w: 12, d: 10, floor: 'parkett', wall: '#2a6a8a', roof: '#1d3a4a', doors: [['s', 6]], windows: [['s', 2], ['s', 9]],
          objs: [['mo_tisch', 4, 3, 0], ['mic_arm', 4, 3, 0], ['mic_arm', 5, 3, 0], ['mo_buero', 4, 4, 2], ['mo_buero', 5, 4, 2], ['mx_digital', 4, 6, 2], ['ab_paneel', 1, 0, 0], ['ab_paneel', 3, 0, 0], ['ab_paneel', 8, 0, 0], ['li_neon', 6, 0, 0], ['rq_pokal', 11, 2, 3]] }
      ],
      props: [['fence', -6, 9, 32], ['gate', 0, 10], ['tree', -26, 12], ['tree', 26, 12], ['flag', -8, 12], ['flag', 8, 12], ['lamp', -4, 14], ['lamp', 4, 14]] }
  ];
  D.plaza = { id: 'plaza', name: 'Funkplatz', spots: { brunnen: [0, 7], bank: [-8, 8], turm: [10, -10] },
    props: [['fountain', 0, 0], ['radiotower', 10, -10], ['bench', -8, 8, 0], ['bench', 8, 8, 0], ['tree', -14, -14], ['tree', 14, 14], ['tree', -14, 14], ['lamp', -6, -6], ['lamp', 6, 6]] };

  // Startaufbau des eigenen Studios (Raster des Grundstücks 20×14): ein Aufnahmeraum, ein kleines Radiostudio (AnMaCha24) + Flur mit Kaffeeecke
  D.startLayout = {
    floors: [{ x0: 2, z0: 2, x1: 14, z1: 12, type: 'holz' }],
    rect: { x0: 2, z0: 2, x1: 14, z1: 12 }, doors: [['s', 9]], windows: [['s', 2], ['n', 9]], // Türen/Fenster relativ zur Rechteck-Ecke
    inner: [[8, 2, 8, 6, 'wall'], [8, 6, 8, 7, 'door'], [8, 7, 8, 12, 'wall'],
      [12, 6, 14, 6, 'wall'], [12, 10, 14, 10, 'wall'], [12, 6, 12, 8, 'wall'], [12, 8, 12, 9, 'door'], [12, 9, 12, 10, 'wall']],
    objs: [['mo_tisch', 4, 6, 0], ['mo_stuhl', 4, 5, 2], ['mo_stuhl', 5, 7, 0], ['mic_alt', 4, 6, 0], ['mic_alt', 5, 6, 0], ['mo_kaffee', 13, 2, 0], ['mo_stuhl', 11, 4, 0], ['pf_kaktus', 2, 11, 0],
      ['rd_pult', 12, 6, 0], ['mic_alt', 12, 6, 0], ['rq_onair', 13, 6, 0], ['mo_stuhl', 12, 7, 0]],
    rooms: [{ x: 3, z: 3, fn: 'aufnahme' }, { x: 13, z: 8, fn: 'radio' }]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
