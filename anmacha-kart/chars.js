/* Fahrer-Figuren: Menschen, Tiere und Fantasiewesen (reine Daten; die 3D-Modelle baut view.js). */
const CHARS = [
  { id: 'mia', kk: 'ad_ro', ac: 'goggles', name: 'Mia', emoji: '👩', kind: 'Mensch', acc: '#ff2d95', skin: '#f0c090', body: '#f4f6fb' },
  { id: 'fuchs', kk: 'ad_ra', ac: 'fox', name: 'Rufus', emoji: '🦊', kind: 'Tier', acc: '#ff7a1a', skin: '#ff8a2a', body: '#fff0e0' },
  { id: 'baer', kk: 'ad_ba', ac: 'bear', name: 'Brumm', emoji: '🐻', kind: 'Tier', acc: '#c4453a', skin: '#8a5a2a', body: '#e8d8b8' },
  { id: 'katze', kk: 'ad_rh', ac: 'cat', name: 'Luna', emoji: '🐱', kind: 'Tier', acc: '#8b5cf6', skin: '#9aa3b8', body: '#e8ecf8' },
  { id: 'frosch', kk: 'ad_kn', ac: 'frog', tintAll: true, name: 'Quak', emoji: '🐸', kind: 'Tier', acc: '#00c46a', skin: '#4cc84a', body: '#d8f8c8' },
  { id: 'drache', kk: 'ad_kn', ac: 'dragon', tintAll: true, name: 'Funke', emoji: '🐲', kind: 'Fantasie', acc: '#e8412a', skin: '#3da84a', body: '#ffd890' },
  { id: 'einhorn', kk: 'ad_ma', ac: 'unicorn', name: 'Stella', emoji: '🦄', kind: 'Fantasie', acc: '#ff6ac8', skin: '#fdfdff', body: '#e8f0ff' },
  { id: 'pinguin', kk: 'ad_ro', ac: 'penguin', name: 'Pico', emoji: '🐧', kind: 'Tier', acc: '#00a8e8', skin: '#252a3a', body: '#252a3a' },
  { id: 'roboter', kk: 'sk_r', ac: 'robot', tintAll: true, name: 'Bolt', emoji: '🤖', kind: 'Fantasie', acc: '#00e5ff', skin: '#9aa8c8', body: '#6a7898' },
  { id: 'alien', kk: 'sk_n', ac: 'alien', tintAll: true, name: 'Zorp', emoji: '👽', kind: 'Fantasie', acc: '#7cff6a', skin: '#9a5cff', body: '#5a3aa8' },
  { id: 'panda', kk: 'ad_ba', ac: 'panda', name: 'Bao', emoji: '🐼', kind: 'Tier', acc: '#ffd24a', skin: '#fafafa', body: '#2a2a32' },
  { id: 'hase', kk: 'ad_ra', ac: 'bunny', name: 'Hoppel', emoji: '🐰', kind: 'Tier', acc: '#ffa0c8', skin: '#fff0f6', body: '#ffd0e4' },
  { id:'lichtfunke', kk:'ad_ma', ac:'halo', model:'einhorn', name:'Lumina', emoji:'✨', kind:'Herzportal', cup:'Portal-Cup', acc:'#ec8dff', skin:'#fff0fd', body:'#97dafa' },
  { id:'kristall', kk:'sk_m', ac:'crystals', tintAll:true, model:'roboter', name:'Kryon', emoji:'💎', kind:'Kristallsturm', cup:'Portal-Cup', acc:'#69d7ff', skin:'#8caadf', body:'#d2f5ff' },
  { id:'knospe', kk:'ad_ra', ac:'sprout', model:'frosch', name:'Mozi', emoji:'🌿', kind:'Monsterfreunde', cup:'Fantasy-Cup', acc:'#8bdd59', skin:'#6dbc65', body:'#f6d78d' },
  { id:'ruinen', kk:'ad_kn', ac:'stone', tintAll:true, model:'baer', name:'Granit', emoji:'🗿', kind:'Ahnenruinen', cup:'Portal-Cup', acc:'#d4ad6d', skin:'#a4957e', body:'#d8c7a7' },
  { id:'flammenflug', kk:'ad_ro', ac:'flames', model:'drache', name:'Flämmchen', emoji:'🔥', kind:'Drachenflug', cup:'Fantasy-Cup', acc:'#ffae48', skin:'#c76a40', body:'#ffde91' },
  { id:'splitter', kk:'sk_n', ac:'shards', tintAll:true, model:'alien', name:'Ziri', emoji:'🌠', kind:'Splitterwelten', cup:'RicoReWi-Cup', acc:'#ffa64c', skin:'#d581e8', body:'#5c4d9b' },
  { id:'insel', kk:'ad_rh', ac:'flower', model:'hase', name:'Kiki', emoji:'🌈', kind:'Farbeninsel', cup:'RicoReWi-Cup', acc:'#ff93ce', skin:'#fff1d8', body:'#8ee4d1' },
  // Weltentour: KayKit-Figuren (CC0, models/kk) als Fahrer – in Sitzhaltung gebacken; dazu Zotik als Original-Held
  { id:'rovan', kk:'ad_kn', name:'Rovan', emoji:'🛡️', kind:'ZOTIK-Gefährte', cup:'Märchen-Cup', acc:'#3a7aff', skin:'#f0c090', body:'#c8d0e0' },
  { id:'lyra', kk:'ad_ma', name:'Lyra', emoji:'🌠', kind:'ZOTIK-Gefährtin', cup:'Märchen-Cup', acc:'#9a5cff', skin:'#f0c090', body:'#5a3aa8' },
  { id:'nia', kk:'ad_ra', name:'Nia', emoji:'🏹', kind:'ZOTIK-Gefährtin', cup:'Märchen-Cup', acc:'#2fbf5a', skin:'#f0c090', body:'#3a6a3a' },
  { id:'brakk', kk:'ad_ba', name:'Brakk', emoji:'🪓', kind:'Abenteurer', cup:'Insel-Cup', acc:'#ff7a1a', skin:'#f0c090', body:'#8a5a2a' },
  { id:'kira', kk:'ad_ro', name:'Kira', emoji:'🗡️', kind:'Abenteurerin', cup:'Stadt-Cup', acc:'#ff2d95', skin:'#f0c090', body:'#4a3a5a' },
  { id:'raven', kk:'ad_rh', name:'Raven', emoji:'🦅', kind:'Kapuzen-Abenteurer', cup:'Stadt-Cup', acc:'#6a7a8a', skin:'#f0c090', body:'#3a4a3a' },
  { id:'klapper', kk:'sk_w', name:'Klapper', emoji:'💀', kind:'Geistergruft', cup:'Spuk-Cup', acc:'#bfe8ff', skin:'#e8e8e0', body:'#5a5a6a' },
  { id:'moira', kk:'sk_m', name:'Moira', emoji:'🔮', kind:'Geistergruft', cup:'Spuk-Cup', acc:'#b07aff', skin:'#e8e8e0', body:'#3a2a5a' },
  { id:'zotik', fox:true, name:'Zotik', emoji:'🦊', kind:'ZOTIK-Held', cup:'Märchen-Cup', acc:'#7a4aff', skin:'#f08a3a', body:'#2a2a5a' },
  // Oma-Bande (aus „Oma-Rennen“): KayKit-Figuren mit Dauerwelle/Dutt, Brille und Handtasche am Kart; says = Spruch im Rennen
  { id:'erna', walker:'#c0c6cc', kk:'ad_ma~o', ac:'oma', hair:'#e8e6e0', glasses:true, bun:1, name:'Oma Erna', emoji:'👵', kind:'Allround-Oma', cup:'Kaffee-Cup', acc:'#c03a5a', skin:'#f2c8a8', body:'#f2d7a8', says:'Ich fahr seit 1958 unfallfrei!' },
  { id:'gertrud', walker:'#ff4a6a', kk:'ad_ra~o', ac:'oma', hair:'#b9a7d8', bun:2, name:'Oma Gertrud', emoji:'👵', kind:'Rentnerrakete', cup:'Kaffee-Cup', acc:'#3a5ac0', skin:'#f2c8a8', body:'#d8e2ff', says:'Platz da, ich hab Termin beim Friseur!' },
  { id:'hilde', walker:'#4a4f58', kk:'ad_ba~o', ac:'oma', hair:'#f2f2ee', glasses:true, bun:0, name:'Oma Hilde', emoji:'👵', kind:'Schwergewichts-Oma', cup:'Kaffee-Cup', acc:'#2f7a4a', skin:'#f2c8a8', body:'#9cc28a', says:'Ich hab noch nie Platz gemacht!' },
  { id:'lotti', walker:'#7cff6a', kk:'ad_ra~o', ac:'oma', hair:'#ff9ec8', bun:1, name:'Oma Lotti', emoji:'👵', kind:'Drift-Queen', cup:'Kuchen-Cup', acc:'#ff7a2a', skin:'#f2c8a8', body:'#ffe08a', says:'Huiii, Kurve!' },
  { id:'kalle', walker:'#e8b030', kk:'ad_kn~o', ac:'oma', hair:'#d0d0d0', glasses:true, bun:-1, name:'Opa Kalle', emoji:'👴', kind:'Startblitz-Opa', cup:'Kuchen-Cup', acc:'#8a6a3a', skin:'#f2c8a8', body:'#5a4a3a', says:'Früher war mehr Lametta!' },
  { id:'frieda', walker:'#00c4d8', kk:'ad_kn~o', ac:'oma', hair:'#9a8a7a', glasses:true, bun:2, name:'Oma Frieda', emoji:'👵', kind:'Querfeldein-Oma', cup:'Kuchen-Cup', acc:'#7a2a8a', skin:'#f2c8a8', body:'#e8c0f0', says:'Abkürzung durchs Blumenbeet!' },
  { id:'trude', walker:'#d8c070', kk:'ad_ma~o', ac:'oma', hair:'#ffffff', glasses:true, bun:1, name:'Uroma Trude', emoji:'👵', kind:'103 Jahre schnell', cup:'Großer Rentenpokal', acc:'#2a2a4a', skin:'#f2c8a8', body:'#8a8aaa', says:'Ihr Jungspunde!' },
  { id:'rosi', walker:'#ff9ad0', kk:'ad_ma~o', ac:'oma', hair:'#e8a060', bun:0, name:'Oma Rosi', emoji:'👵', kind:'Disco-Oma', cup:'Großer Rentenpokal', acc:'#ff4a8a', skin:'#f2c8a8', body:'#ffffff', says:'Tanzen und Rasen, das hält jung!' }
];

/* Kart-Typen (Werte als Faktoren): mv Tempo, ma Beschleunigung, mt Lenken, mr Gelände (Tempo neben der Strecke), md Drift-Aufladung, mw Gewicht */
const KARTS = [
  { id: 'allrounder', name: 'Allrounder', emoji: '🏎️', mv: 1, ma: 1, mt: 1, mr: 0.55, md: 1, mw: 1, desc: 'Ausgewogen – gut für den Einstieg' },
  { id: 'flitzer', name: 'Flitzer', emoji: '⚡', mv: 1.07, ma: 0.92, mt: 0.9, mr: 0.5, md: 1, mw: 0.9, desc: 'Höchstes Tempo, träge in Kurven' },
  { id: 'buggy', name: 'Buggy', emoji: '🚙', mv: 0.97, ma: 1.02, mt: 1.08, mr: 0.82, md: 1, mw: 1, desc: 'Fährt auch neben der Strecke fast voll' },
  { id: 'cruiser', name: 'Cruiser', emoji: '🚛', mv: 1, ma: 0.88, mt: 0.94, mr: 0.55, md: 1, mw: 1.4, desc: 'Schwer – rammt Gegner einfach weg' },
  { id: 'dragster', name: 'Dragster', emoji: '🚀', mv: 1.03, ma: 1.22, mt: 0.84, mr: 0.5, md: 0.9, mw: 1, desc: 'Brutale Beschleunigung' },
  { id: 'wolke', name: 'Wolkenflitzer', emoji: '☁️', mv: 0.94, ma: 1.05, mt: 1.16, mr: 0.6, md: 1.3, mw: 0.8, desc: 'Wendig, lädt Drift-Turbos schnell auf' },
  { id: 'monster', name: 'Monster-Truck', emoji: '🛻', mv: 0.97, ma: 0.95, mt: 0.95, mr: 0.9, md: 0.95, mw: 1.35, desc: 'Riesenräder: Gelände egal, schwer und robust' },
  { id: 'retro', name: 'Oldtimer', emoji: '🚗', mv: 1.02, ma: 0.97, mt: 1.05, mr: 0.55, md: 1.12, mw: 1.1, desc: 'Klassiker mit gutem Drift und solidem Tempo' },
  { id: 'gleiter', name: 'Sternengleiter', emoji: '🛸', mv: 1.05, ma: 1.0, mt: 0.96, mr: 0.65, md: 1.15, mw: 0.85, desc: 'Schwebt flink, starke Mini-Turbos, leicht' },
  { id: 'funkbus', name: 'Funk-Bus', emoji: '🚌', mv: 0.98, ma: 0.9, mt: 0.92, mr: 0.6, md: 0.92, mw: 1.5, desc: 'Der Schwerste im Feld – schiebt alle beiseite' },
  { id: 'rollator', name: 'Raketen-Rollator', emoji: '🦼', mv: 1.0, ma: 1.06, mt: 1.06, mr: 0.62, md: 1.08, mw: 0.95, desc: 'Der Oma-Flitzer: Gehwagen mit Raketenantrieb und Einkaufskorb' }
];
if (typeof module !== 'undefined') module.exports = { CHARS, KARTS };
