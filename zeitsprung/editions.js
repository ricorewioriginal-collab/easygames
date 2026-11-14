// ZEITSPRUNG – die Ausgaben. Jede Ausgabe bleibt ein eigenes, unverändertes Spiel in ihrem Ordner
// (Spiellogik, Fragen, Medien, Spielstand, Handy-Kopplung). Das Studio lädt sie mit ?zs=1 und gibt ihr das neue Design.
export const EDITIONS = [
  { id: 'wissen', title: 'WISSEN', name: 'ZEITSPRUNG WISSEN', icon: '🌍', path: '../zeitsprung-wissen/', figure: 'mage', prop: 'globe',
    colors: ['#5ee7ff', '#ffcf6e', '#3d7bff'], tag: 'Weltgeschichte, Politik, Erdkunde & Wissenschaft',
    desc: 'Lege die Weltgeschichte auf deinen Zeitstrahl: von den ersten Olympischen Spielen bis heute, mit historischen Clips, Songs zu Ereignissen, Wissens- und Bildrunden.',
    stats: ['236 Ereignisse', '377 Fragen', '16 Clips + 25 Songs'], save: 'zw-save-v1' },
  { id: 'movie', title: 'MOVIE', name: 'ZEITSPRUNG MOVIE', icon: '🎬', path: '../zeitsprung-movie/', figure: 'rogue_hooded', prop: 'reel',
    colors: ['#c58bff', '#ffd27a', '#ff4f7b'], tag: 'Filme, Serien, Trailer & Filmmusik',
    desc: 'Trailer schauen, Filmmusik und Serienintros hören, Bildrätsel lösen: Kinogeschichte von Disney bis Marvel auf dem Zeitstrahl.',
    stats: ['318 Filmfragen', '38 Hörfragen', '42 Bildrätsel'], save: 'zm-save-v1' },
  { id: 'radio', title: 'RADIO', name: 'ZEITSPRUNG RADIO', icon: '💿', path: '../zeitsprung-radio/', figure: 'rogue', prop: 'vinyl',
    colors: ['#ff4c93', '#ffcb61', '#8a5cff'], tag: 'Hits, Charts & Musikgeschichte',
    desc: 'Die Hitster-Show: Songs hören, Erscheinungsjahr erraten oder in den Zeitstrahl legen, dazu Fragen zu Künstlern, Charts und Songtiteln.',
    stats: ['300 Songs', '790 Quizfragen', 'Deezer · Spotify'], save: 'zr-save-v2' },
  { id: 'castingshow', title: 'CASTINGSHOW', name: 'ZEITSPRUNG CASTINGSHOW', icon: '🎤', path: '../zeitsprung-castingshow/', figure: 'barbarian', prop: 'star',
    colors: ['#ff5fae', '#ffd37c', '#a64dff'], tag: 'DSDS, Supertalent, Idol, The Voice & mehr',
    desc: 'Staffelsiege, Siegersongs, Jury und Kultmomente: Castingshow-Geschichte von Popstars bis heute.',
    stats: ['265 Show-Momente', '1247 Fragen', '44 Siegersongs'], save: 'zc-save-v1' },
  { id: 'kinderserien', title: 'KINDERSERIEN', name: 'ZEITSPRUNG KINDERSERIEN', icon: '📺', path: '../zeitsprung-kinderserien/', figure: 'skeleton_minion', prop: 'clouds',
    colors: ['#68e8ff', '#ffd678', '#b45cff'], tag: 'Serien von 1990 bis 2026',
    desc: 'Serienstarts, Titelsongs und Figuren aus über drei Jahrzehnten Kinderfernsehen, mit Intros und Bildrätseln.',
    stats: ['66 Serienmomente', '97 Fragen', '33 Intros'], save: 'zk-save-v1' },
  { id: 'eurovision', title: 'EUROVISION', name: 'ZEITSPRUNG EUROVISION', icon: '💖', path: '../zeitsprung-eurovision/', figure: 'knight', prop: 'heart',
    colors: ['#ff91bf', '#7aa8ff', '#ffe27a'], tag: 'Alle ESC-Jahre 1956–2026', extra: { label: '📚 ESC-Fanarchiv', href: '../zeitsprung-eurovision/archiv.html' },
    desc: 'Jede Austragung des Eurovision Song Contest auf dem Zeitstrahl: Gastgeber, Länder, Siegersongs, Hörfragen und Symbolrätsel.',
    stats: ['70 Wettbewerbe', '300+ Fragen', '73 Siegersongs'], save: 'ze-save-v1' }
];
export const MARATHON = { id: 'gesamt', title: 'GESAMTMODUS', name: 'DIE GROSSE ZEITSPRUNG-NACHT', icon: '✨', figure: 'knight', prop: 'logo',
  colors: ['#ffd36e', '#5ee7ff', '#ff5fa8'], tag: 'Alle Ausgaben in einer Show',
  desc: 'Der Gesamtmodus: Die Show springt Akt für Akt durch alle Ausgaben. Jeder Akt ist eine echte Runde der jeweiligen Ausgabe, die Punkte wandern in die Gesamtwertung. Wer am Ende vorne liegt, gewinnt die Zeitsprung-Nacht.',
  stats: ['6 Ausgaben', 'Gesamtwertung', 'Finale mit Siegerehrung'] };
export const ALL = [MARATHON, ...EDITIONS];
export const byId = id => ALL.find(e => e.id === id) || null;

// Spielfiguren (KayKit, CC0): je Ausgabe eine passende Figur mit Requisite, frei wählbar
export const FIGURES = [
  { id: 'mage', name: 'Die Gelehrte', prop: 'book', edition: 'wissen' },
  { id: 'rogue_hooded', name: 'Der Regisseur', prop: 'clapper', edition: 'movie' },
  { id: 'rogue', name: 'Die DJane', prop: 'headphones', edition: 'radio' },
  { id: 'barbarian', name: 'Der Rockstar', prop: 'mic', edition: 'castingshow' },
  { id: 'skeleton_minion', name: 'Klappergeist', prop: 'balloon', edition: 'kinderserien' },
  { id: 'knight', name: 'Die Ritterin des ESC', prop: 'flag', edition: 'eurovision' },
  { id: 'skeleton_mage', name: 'Zauber-Skelett', prop: 'star', edition: '' },
  { id: 'skeleton_rogue', name: 'Schatten-Skelett', prop: 'popcorn', edition: '' },
  { id: 'skeleton_warrior', name: 'Krieger-Skelett', prop: 'trophy', edition: '' }
];
export const PLAYER_COLORS = ['#ff6aab', '#5ee7ff', '#ffce5c', '#a98bff'];
