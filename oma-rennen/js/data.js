/* Oma-Rennen – Daten: Omas (mit Fahrwerten für die Kart-Rennsimulation von Kart Rush), Strecken durch die Stadt, Cups,
 * Gegenstände (Oma-Namen für die Items der Simulation) und Oma-Sprüche. Die Simulation (../anmacha-kart/sim.js) liest KARTS. */
'use strict';
// Werte als Faktoren: mv Tempo, ma Beschleunigung, mt Lenken, mr Gelände, md Drift-Aufladung, mw Gewicht
const OMAS = [
  { id: 'erna', name: 'Oma Erna', hair: '#e8e6e0', dress: '#c03a5a', cardi: '#f2d7a8', glasses: true, bun: 1, bag: '#5a2a1a', walker: '#c0c6cc', mv: 1, ma: 1, mt: 1, mr: .58, md: 1, mw: 1, tag: 'Allround-Oma', says: 'Ich fahr seit 1958 unfallfrei!' },
  { id: 'gertrud', name: 'Oma Gertrud', hair: '#b9a7d8', dress: '#3a5ac0', cardi: '#d8e2ff', glasses: false, bun: 2, bag: '#202020', walker: '#ff4a6a', mv: 1.08, ma: .9, mt: .9, mr: .5, md: 1, mw: .9, tag: 'Rentnerrakete – schnell, aber stur', says: 'Platz da, ich hab Termin beim Friseur!' },
  { id: 'hilde', name: 'Oma Hilde', hair: '#f2f2ee', dress: '#2f7a4a', cardi: '#9cc28a', glasses: true, bun: 0, bag: '#7a4a1a', walker: '#4a4f58', mv: .99, ma: .88, mt: .94, mr: .6, md: 1, mw: 1.45, tag: 'Schwergewicht – rammt alles weg', says: 'Ich hab noch nie Platz gemacht!' },
  { id: 'lotti', name: 'Oma Lotti', hair: '#ff9ec8', dress: '#ff7a2a', cardi: '#ffe08a', glasses: false, bun: 1, bag: '#ff2d95', walker: '#7cff6a', mv: .95, ma: 1.08, mt: 1.16, mr: .62, md: 1.3, mw: .8, tag: 'Drift-Queen mit Turbo-Kurven', says: 'Huiii, Kurve!' },
  { id: 'kalle', name: 'Opa Kalle', hair: '#d0d0d0', dress: '#5a4a3a', cardi: '#8a7a5a', glasses: true, bun: -1, bag: '#3a3a3a', walker: '#e8b030', mv: 1.03, ma: 1.2, mt: .84, mr: .52, md: .9, mw: 1.05, tag: 'Der Startblitz – Opa darf auch', says: 'Früher war mehr Lametta!', unlock: 0 },
  { id: 'frieda', name: 'Oma Frieda', hair: '#9a8a7a', dress: '#7a2a8a', cardi: '#e8c0f0', glasses: true, bun: 2, bag: '#c0a040', walker: '#00c4d8', mv: .97, ma: 1.02, mt: 1.06, mr: .85, md: 1, mw: 1, tag: 'Querfeldein – Rasen ist ihr egal', says: 'Abkürzung durchs Blumenbeet!', unlock: 1 },
  { id: 'trude', name: 'Uroma Trude', hair: '#ffffff', dress: '#1a1a2a', cardi: '#5a5a7a', glasses: true, bun: 1, bag: '#8a0a1a', walker: '#d8c070', mv: 1.1, ma: .95, mt: 1.02, mr: .55, md: 1.15, mw: 1.1, tag: '103 Jahre – und immer noch die Schnellste', says: 'Ihr Jungspunde!', unlock: 2 },
  { id: 'rosi', name: 'Oma Rosi', hair: '#e8a060', dress: '#ff4a8a', cardi: '#ffffff', glasses: false, bun: 0, bag: '#40c070', walker: '#ff9ad0', mv: 1.02, ma: 1.04, mt: 1.04, mr: .6, md: 1.1, mw: .95, tag: 'Disco-Oma mit Glitzer-Rollator', says: 'Tanzen und Rasen, das hält jung!', unlock: 3 }
];
const KARTS = OMAS.map(o => ({ id: o.id, mv: o.mv, ma: o.ma, mt: o.mt, mr: o.mr, md: o.md, mw: o.mw }));
// Strecken (geschlossene Spline-Kurven, gebaut mit Track.build aus Kart Rush). mechanic: Streckenfunktion der Simulation
const TRACKS = [
  { id: 'markt', name: 'Marktplatz-Meile', theme: 'markt', w: 20, mechanic: '', sky: ['#3a8ae8', '#9fd2ff', '#fff4dc'], ground: '#b8a890', road: '#8a7f74', fog: '#dbe8f5', night: false, desc: 'Kopfsteinpflaster, Marktstände und Kirchturm',
    pts: [[0, -200], [150, -210], [250, -150], [260, -40], [180, 30], [220, 140], [150, 240], [20, 220], [-40, 130], [-150, 190], [-260, 130], [-250, 0], [-180, -90], [-200, -180], [-100, -230]] },
  { id: 'kurpark', name: 'Kurpark-Kurven', theme: 'park', w: 20, mechanic: 'safari', sky: ['#2f7ee0', '#a8e0ff', '#fffbe0'], ground: '#5cb84a', road: '#c8b48a', fog: '#d8f0d8', night: false, desc: 'Springbrunnen, Musikpavillon – und frechen Tauben',
    pts: [[0, -230], [170, -220], [280, -120], [230, -10], [300, 90], [250, 220], [110, 250], [30, 170], [-70, 250], [-220, 230], [-300, 110], [-210, 20], [-290, -90], [-200, -200]] },
  { id: 'mall', name: 'Einkaufszentrum', theme: 'mall', w: 20, mechanic: 'portal', sky: ['#5a3a8a', '#d080ff', '#ffe0f8'], ground: '#e8e0f0', road: '#bfb6cc', fog: '#f0e0ff', night: false, desc: 'Rolltreppen-Abkürzungen und Schaufensterbummel',
    pts: [[0, -180], [140, -200], [240, -110], [200, -10], [110, 10], [130, 120], [240, 170], [200, 270], [60, 280], [-60, 200], [-170, 250], [-280, 170], [-250, 40], [-150, -10], [-230, -110], [-140, -200]] },
  { id: 'strand', name: 'Strandpromenade', theme: 'strand', w: 21, mechanic: 'island', sky: ['#ff8a5a', '#ffc08a', '#fff0c0'], ground: '#f0d898', road: '#a89a88', fog: '#ffe0c0', night: false, desc: 'Sonnenuntergang, Strandkörbe und Möwen',
    pts: [[0, -260], [200, -250], [320, -150], [300, -20], [340, 120], [250, 240], [80, 250], [-50, 180], [-180, 250], [-320, 200], [-340, 40], [-260, -80], [-300, -190], [-160, -250]] },
  { id: 'xmas', name: 'Weihnachtsmarkt', theme: 'xmas', w: 20, mechanic: 'ruins', sky: ['#060a24', '#1a2a5a', '#4a3a7a'], ground: '#eef4ff', road: '#7a8094', fog: '#2a3050', night: true, desc: 'Glühwürmchen-Lichter, Schnee und Lebkuchenstände',
    pts: [[0, -200], [120, -210], [210, -140], [160, -40], [230, 40], [250, 160], [150, 250], [20, 230], [-30, 120], [-140, 90], [-240, 170], [-310, 60], [-240, -60], [-260, -170], [-130, -220]] },
  { id: 'grusel', name: 'Geisterstunde im Altenheim', theme: 'grusel', w: 20, mechanic: 'dragon', sky: ['#05030f', '#22104a', '#5a2a7a'], ground: '#2a2440', road: '#4a4458', fog: '#1a1030', night: true, desc: 'Mitternacht, Kürbisse – und Gespenster auf dem Flur',
    pts: [[0, -220], [160, -240], [270, -160], [250, -50], [150, -10], [200, 110], [300, 170], [230, 280], [60, 270], [-40, 180], [-150, 260], [-290, 220], [-320, 80], [-220, -20], [-280, -140], [-170, -230]] }
];
const CUPS = [
  { name: 'Kaffee-Cup', icon: '☕', tracks: [0, 1, 2] },
  { name: 'Kuchen-Cup', icon: '🍰', tracks: [3, 4, 5] },
  { name: 'Großer Rentenpokal', icon: '🏆', tracks: [2, 5, 1, 3] }
];
const LEVELS = [{ n: 'Kaffeefahrt', d: 'Gemütlich – die anderen Omas trödeln', skill: 0 }, { n: 'Seniorenteller', d: 'Ordentlich Tempo', skill: 1 }, { n: 'Rentenrebellion', d: 'Vollgas, keine Gnade!', skill: 2 }];
// Items der Simulation mit Oma-Namen
const ITEMS = {
  boost: { n: 'Rheuma-Rakete', icon: '🚀', d: 'Kurzer Raketenschub am Rollator' },
  banana: { n: 'Gebiss', icon: '🦷', d: 'Hinter dir fallen lassen – wer drüberfährt, schleudert' },
  rock: { n: 'Handtasche', icon: '👜', d: 'Nach vorne schleudern – prallt von Wänden ab' },
  mine: { n: 'Wollknäuel', icon: '🧶', d: 'Hinterlegen – verheddert Verfolger' },
  rocket: { n: 'Pralinen-Lenkrakete', icon: '🍫', d: 'Sucht sich die Oma vor dir' },
  shield: { n: 'Regenschirm', icon: '☂️', d: 'Wehrt einen Treffer ab' },
  flash: { n: 'Hörgeräte-Pfiff', icon: '📢', d: 'Alle vor dir drehen sich vor Schreck' },
  fog: { n: 'Puderwolke', icon: '💨', d: 'Nimmt allen vor dir die Sicht' }
};
const SAYS = {
  hit: ['Unverschämtheit!', 'Na warte, Freundchen!', 'Meine Hüfte!', 'Das sag ich deiner Mutter!', 'Rüpel!', 'Mein Gebiss!'],
  use: ['Da hast du!', 'Nimm das, Jungspund!', 'Huch, wie ungeschickt von mir!', 'Ups!'],
  boost: ['Huiii!', 'Vollgas, Erwin!', 'Jetzt geht die Post ab!'],
  lead: ['Ich bin vorne!', 'Seht ihr mich noch?', 'Wie früher beim Schlussverkauf!'],
  win: ['Das hab ich schon 1962 gekonnt!', 'Und jetzt Kaffee und Kuchen!', 'Gewonnen – und kein bisschen außer Atem!'],
  lose: ['Nächstes Mal nehm ich die Abkürzung.', 'Mein Rollator war nicht aufgepumpt!', 'Pff, Anfängerglück.']
};
const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
const OMA_DATA = { OMAS, KARTS, TRACKS, CUPS, LEVELS, ITEMS, SAYS, POINTS };
if (typeof module !== 'undefined') module.exports = OMA_DATA;
