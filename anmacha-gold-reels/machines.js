'use strict';
/* AnMaCha Casino – alle Spielautomaten als Daten. pay: { Anzahl: Faktor × Einheit } (Einheit = Einsatz / unit),
   Scatter zahlt × Gesamteinsatz. scale wird von tests/logic-tests.js --calibrate ermittelt (Ziel-Auszahlungsquote ca. 95 %).
   Symbol-Zeichnungen: art (sonst id) → symbols.js. */
(function (G) {
  const LET = (w, hi) => [
    { id: 'A', w: w[0], pay: hi ? { 3: 15, 4: 40, 5: 150 } : { 3: 10, 4: 30, 5: 100 } },
    { id: 'K', w: w[1], pay: hi ? { 3: 15, 4: 40, 5: 150 } : { 3: 10, 4: 30, 5: 100 } },
    { id: 'Q', w: w[2], pay: { 3: 5, 4: 25, 5: 100 } },
    { id: 'J', w: w[3], pay: { 3: 5, 4: 25, 5: 100 } },
    { id: 'T', art: '10', w: w[4], pay: { 3: 5, 4: 25, 5: 100 } }
  ];

  const MACHINES = [
    { id: 'gold-reels', title: 'AnMaCha Gold Reels', scale: 1.01022, tag: 'Sender-Logos · 20 Linien · Freispiele', reels: 5, rows: 3, lines: 'l20', cover: ['logo:04', 'seven', 'logo:09'],
      theme: { a: '#ffb11f', b: '#ff2d95', c: '#8b5cf6', bg: '#170a2e', tile: ['#241a46', '#120c26'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 137, 4: 685, 5: 3425 } },
        { id: 'diamond', w: 4, pay: { 3: 103, 4: 411, 5: 1713 } },
        { id: 'crown', w: 5, pay: { 3: 68, 4: 274, 5: 1096 } },
        { id: 'bell', w: 7, pay: { 3: 41, 4: 137, 5: 616 } },
        { id: 'logo1', art: 'logo:04', w: 9, pay: { 3: 27, 4: 82, 5: 342 } },
        { id: 'logo2', art: 'logo:09', w: 10, pay: { 3: 21, 4: 68, 5: 274 } },
        { id: 'logo3', art: 'logo:01', w: 11, pay: { 3: 16, 4: 55, 5: 206 } },
        { id: 'logo4', art: 'logo:06', w: 12, pay: { 3: 11, 4: 34, 5: 123 } },
        { id: 'logo5', art: 'logo:12', w: 12, pay: { 3: 8, 4: 27, 5: 103 } },
        { id: 'wild', w: [0, 3, 3, 3, 0], name: 'Wild' },
        { id: 'scatter', art: 'bonus', w: 2, name: 'Bonus' }
      ],
      wild: 'wild', scatter: { id: 'scatter', pay: { 3: 2, 4: 10, 5: 50 }, free: { 3: 10, 4: 10, 5: 10 }, retrigger: 5 }, freeMult: 2,
      info: 'Wild ersetzt alle Symbole außer Bonus. 3 oder mehr Bonus-Symbole lösen 10 Freispiele mit doppeltem Gewinn aus (erneut auslösbar: +5).' },

    { id: 'fruit-blaze', title: 'Fruit Blaze', scale: 0.96925, tag: 'Klassik · 5 Linien · Früchte', reels: 5, rows: 3, lines: 'l5',
      theme: { a: '#ff5a1f', b: '#ffd23f', c: '#ff1f4b', bg: '#2a0606', tile: ['#3a0d0d', '#1a0404'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 100, 4: 1000, 5: 5000 } },
        { id: 'melon', w: 5, pay: { 3: 50, 4: 125, 5: 500 } },
        { id: 'grapes', w: 5, pay: { 3: 50, 4: 125, 5: 500 } },
        { id: 'plum', w: 7, pay: { 3: 20, 4: 50, 5: 200 } },
        { id: 'orange', w: 7, pay: { 3: 20, 4: 50, 5: 200 } },
        { id: 'lemon', w: 7, pay: { 3: 20, 4: 50, 5: 200 } },
        { id: 'cherry', w: 7, pay: { 2: 5, 3: 20, 4: 50, 5: 200 } },
        { id: 'star', w: 2, name: 'Stern' }
      ],
      scatter: { id: 'star', pay: { 3: 2, 4: 10, 5: 50 } },
      info: 'Klassischer Früchte-Slot ohne Wild: Kirschen zahlen schon ab 2. Sterne zahlen überall auf den Walzen.' },

    { id: 'diamond-7', title: 'Triple Diamond 7', scale: 0.40527, tag: '3 Walzen · Diamant-Multiplikator', reels: 3, rows: 3, lines: 'l5x3',
      theme: { a: '#3be0ff', b: '#a855f7', c: '#ff2d55', bg: '#08122e', tile: ['#14214a', '#0a1028'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 100 } },
        { id: 'bar3', w: 5, pay: { 3: 40 } },
        { id: 'bar2', w: 6, pay: { 3: 25 } },
        { id: 'bar1', w: 8, pay: { 3: 10 } },
        { id: 'cherry', w: 8, pay: { 2: 3, 3: 10 } },
        { id: 'wild', art: 'diamondWild', w: 2, pay: { 3: 1000 }, name: 'Diamant-Wild' },
        { id: 'blank', w: 6 }
      ],
      wild: 'wild', wildMult: 2, wildMultEach: true,
      info: 'Der Diamant ist Wild und verdoppelt jeden Liniengewinn, an dem er beteiligt ist (zwei Diamanten = ×4). 3 Diamanten zahlen den Höchstgewinn.' },

    { id: 'book-of-funk', title: 'Book of Funk', scale: 0.88693, tag: '10 Linien · Buch-Freispiele', reels: 5, rows: 3, lines: 'l10',
      theme: { a: '#ffcc33', b: '#c2410c', c: '#7c3aed', bg: '#1c1006', tile: ['#2e1d0c', '#140a03'] },
      symbols: [
        { id: 'mic', w: 2, pay: { 2: 10, 3: 100, 4: 1000, 5: 5000 } },
        { id: 'headphones', w: 3, pay: { 2: 5, 3: 40, 4: 400, 5: 2000 } },
        { id: 'vinyl', w: 4, pay: { 3: 30, 4: 100, 5: 750 } },
        { id: 'radio', w: 4, pay: { 3: 30, 4: 100, 5: 750 } },
        ...LET([7, 7, 8, 8, 8], true),
        { id: 'book', w: 1.5, name: 'Buch (Wild + Scatter)' }
      ],
      wild: 'book', book: true, scatter: { id: 'book', pay: { 3: 2, 4: 20, 5: 200 }, free: { 3: 10, 4: 10, 5: 10 }, retrigger: 10 },
      info: 'Das Buch ist Wild und Scatter zugleich. 3 Bücher lösen 10 Freispiele aus: Ein zufälliges Sondersymbol dehnt sich dann über ganze Walzen aus und zahlt auf allen Linien.' },

    { id: 'golden-dragon', title: 'Golden Dragon', scale: 2.05589, tag: '243 Wege · Freispiele ×3', reels: 5, rows: 3, lines: 'ways', unit: 50,
      theme: { a: '#ffd24a', b: '#e11d48', c: '#16a34a', bg: '#2a0508', tile: ['#3d0b10', '#1c0306'] },
      symbols: [
        { id: 'dragon', art: 'emoji:🐉', w: 3, pay: { 3: 50, 4: 150, 5: 500 } },
        { id: 'tiger', art: 'emoji:🐯', w: 4, pay: { 3: 30, 4: 100, 5: 300 } },
        { id: 'koi', art: 'emoji:🐟', w: 5, pay: { 3: 20, 4: 60, 5: 200 } },
        { id: 'lantern', art: 'emoji:🏮', w: 6, pay: { 3: 15, 4: 40, 5: 150 } },
        { id: 'envelope', art: 'emoji:🧧', w: 6, pay: { 3: 10, 4: 30, 5: 100 } },
        ...LET([9, 9, 10, 10, 10]),
        { id: 'wild', w: [0, 3, 3, 3, 0], name: 'Wild' },
        { id: 'gong', art: 'gong', w: 2, name: 'Gong (Scatter)' }
      ],
      wild: 'wild', scatter: { id: 'gong', pay: { 3: 2, 4: 10, 5: 50 }, free: { 3: 8, 4: 12, 5: 20 }, retrigger: 8 }, freeMult: 3,
      info: '243 Gewinnwege: gleiche Symbole auf benachbarten Walzen ab links zahlen, egal in welcher Reihe. 3 oder mehr Gongs bringen 8 bis 20 Freispiele mit dreifachem Gewinn.' },

    { id: 'gold-mine', title: 'Gold Mine Hold & Win', scale: 1.82489, tag: '25 Linien · Hold & Win · Jackpots', reels: 5, rows: 3, lines: 'l25',
      theme: { a: '#fbbf24', b: '#b45309', c: '#38bdf8', bg: '#140d05', tile: ['#2a1c0c', '#120a03'] },
      symbols: [
        { id: 'gemBlue', art: 'gem:#3be0ff', w: 3, pay: { 3: 50, 4: 200, 5: 1000 } },
        { id: 'gemRed', art: 'gem:#ff3355', w: 4, pay: { 3: 40, 4: 150, 5: 500 } },
        { id: 'gemGreen', art: 'gem:#34d399', w: 5, pay: { 3: 30, 4: 100, 5: 300 } },
        { id: 'pick', art: 'emoji:⛏️', w: 6, pay: { 3: 20, 4: 60, 5: 200 } },
        ...LET([8, 8, 9, 9, 9]).slice(0, 4),
        { id: 'wild', art: 'tnt', w: [0, 3, 3, 3, 0], name: 'Dynamit-Wild' },
        { id: 'coin', w: 6, name: 'Goldmünze' }
      ],
      wild: 'wild',
      holdwin: { coin: 'coin', trigger: 6, p: 0.075, respins: 3,
        values: [[40, 0.5], [30, 1], [16, 2], [8, 3], [4, 5], [1.6, 10], [0.6, 'MINI'], [0.2, 'MINOR'], [0.04, 'MAJOR']],
        jackpots: { MINI: 20, MINOR: 50, MAJOR: 200, GRAND: 1000 } },
      info: '6 oder mehr Goldmünzen starten Hold & Win: Die Münzen bleiben liegen, du hast 3 Respins, jede neue Münze setzt sie auf 3 zurück. Am Ende zählen alle Münzwerte; ein volles Feld bringt den GRAND-Jackpot.' },

    { id: 'neon-40', title: 'Neon 40 Hot', scale: 1.49768, tag: '4 Reihen · 40 Linien · Klassik', reels: 5, rows: 4, lines: 'l40', minBet: 40,
      theme: { a: '#ff2bd6', b: '#22d3ee', c: '#a3e635', bg: '#0b0420', tile: ['#1b0d3a', '#0a041a'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 100, 4: 400, 5: 2000 } },
        { id: 'bell', w: 5, pay: { 3: 40, 4: 100, 5: 500 } },
        { id: 'melon', w: 7, pay: { 3: 20, 4: 60, 5: 250 } },
        { id: 'grapes', w: 7, pay: { 3: 20, 4: 60, 5: 250 } },
        { id: 'plum', w: 9, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'orange', w: 9, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'lemon', w: 10, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'cherry', w: 10, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'star', w: 3, name: 'Stern' }
      ],
      scatter: { id: 'star', pay: { 3: 2, 4: 10, 5: 50 } },
      info: '4 Reihen und 40 feste Linien im Neon-Look. Sterne zahlen überall auf den Walzen.' },

    { id: 'lucky-clover', title: 'Lucky Clover', scale: 1.26117, tag: '25 Linien · Wild ×2 · Freispiele', reels: 5, rows: 3, lines: 'l25',
      theme: { a: '#4ade80', b: '#facc15', c: '#16a34a', bg: '#04180c', tile: ['#0c2e18', '#041409'] },
      symbols: [
        { id: 'clover', w: 3, pay: { 3: 50, 4: 200, 5: 1000 } },
        { id: 'horseshoe', w: 4, pay: { 3: 40, 4: 120, 5: 400 } },
        { id: 'hat', art: 'emoji:🎩', w: 5, pay: { 3: 30, 4: 80, 5: 250 } },
        { id: 'beer', art: 'emoji:🍺', w: 6, pay: { 3: 20, 4: 60, 5: 150 } },
        ...LET([8, 8, 9, 9, 9]),
        { id: 'wild', art: 'rainbowWild', w: [0, 3, 3, 3, 0], name: 'Regenbogen-Wild ×2' },
        { id: 'pot', art: 'emoji:💰', w: 2, name: 'Goldtopf (Scatter)' }
      ],
      wild: 'wild', wildMult: 2, scatter: { id: 'pot', pay: { 3: 2, 4: 10, 5: 50 }, free: { 3: 10, 4: 15, 5: 20 }, retrigger: 10 },
      info: 'Gewinne mit Regenbogen-Wild zählen doppelt. 3 oder mehr Goldtöpfe bringen 10 bis 20 Freispiele.' },

    { id: 'red-hot-7', title: 'Red Hot Respin', scale: 0.47722, tag: '3 Walzen · Wild-Respin', reels: 3, rows: 3, lines: 'l5x3',
      theme: { a: '#ff3b30', b: '#ff9f0a', c: '#c2410c', bg: '#1f0303', tile: ['#360808', '#180202'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 150 } },
        { id: 'bell', w: 5, pay: { 3: 50 } },
        { id: 'bar3', w: 6, pay: { 3: 30 } },
        { id: 'cherry', w: 8, pay: { 3: 15 } },
        { id: 'lemon', w: 9, pay: { 3: 10 } },
        { id: 'wild', art: 'fireWild', w: [0, 1, 0], name: 'Feuer-Wild' }
      ],
      wild: 'wild', respin: { reel: 1 },
      info: 'Landet das Feuer-Wild auf der mittleren Walze, füllt es die ganze Walze und du bekommst einen Gratis-Respin, bei dem sie stehen bleibt.' },

    { id: 'joker-star', title: 'Joker Star', scale: 0.8082, tag: '10 Linien · Joker · Freispiele ×2', reels: 5, rows: 3, lines: 'l10',
      theme: { a: '#c084fc', b: '#f43f5e', c: '#fde047', bg: '#14061f', tile: ['#26103a', '#10051a'] },
      symbols: [
        { id: 'seven', w: 3, pay: { 3: 100, 4: 500, 5: 2500 } },
        { id: 'bell', w: 4, pay: { 3: 50, 4: 200, 5: 750 } },
        { id: 'melon', w: 6, pay: { 3: 30, 4: 80, 5: 300 } },
        { id: 'grapes', w: 6, pay: { 3: 30, 4: 80, 5: 300 } },
        { id: 'plum', w: 8, pay: { 3: 15, 4: 40, 5: 150 } },
        { id: 'orange', w: 8, pay: { 3: 15, 4: 40, 5: 150 } },
        { id: 'lemon', w: 9, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'cherry', w: 9, pay: { 3: 10, 4: 30, 5: 100 } },
        { id: 'wild', art: 'jokerWild', w: [0, 3, 3, 3, 0], name: 'Joker (Wild)' },
        { id: 'star', w: 2, name: 'Stern (Scatter)' }
      ],
      wild: 'wild', scatter: { id: 'star', pay: { 3: 2, 4: 10, 5: 50 }, free: { 3: 10, 4: 10, 5: 10 }, retrigger: 5 }, freeMult: 2,
      info: 'Der Joker ersetzt alle Früchte. 3 oder mehr Sterne lösen 10 Freispiele mit doppeltem Gewinn aus.' }
  ];

  const api = { MACHINES };
  G.CasinoMachines = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
