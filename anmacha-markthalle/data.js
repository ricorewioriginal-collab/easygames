'use strict';
/* Daten für AnMaCha Markthalle 24: eigene Marken, Waren, Regale, Kundentypen, Rezepte. Preise in Cent. */
const Data = (() => {
  // Warengruppen: Lizenz (Kosten, ab Stufe); Lagerklasse st: dry | cold | frost | prod
  const CATS = {
    obst: { name: 'Obst & Gemüse', e: '🥬', lvl: 1, cost: 0 }, brot: { name: 'Backwaren', e: '🥖', lvl: 1, cost: 0 },
    getr: { name: 'Getränke', e: '🥤', lvl: 1, cost: 0 }, milch: { name: 'Frische & Kühlung', e: '🧀', lvl: 1, cost: 0 },
    grund: { name: 'Grundnahrung', e: '🍝', lvl: 2, cost: 40000 }, snack: { name: 'Snacks & Süßes', e: '🍫', lvl: 2, cost: 50000 },
    haus: { name: 'Haushalt', e: '🧻', lvl: 3, cost: 70000 }, frost: { name: 'Tiefkühl', e: '🧊', lvl: 4, cost: 90000 },
    fleisch: { name: 'Fleisch & Wurst', e: '🥩', lvl: 5, cost: 120000 }, drog: { name: 'Drogerie', e: '🧼', lvl: 6, cost: 150000 },
    tier: { name: 'Tierbedarf', e: '🐾', lvl: 7, cost: 160000 }, saison: { name: 'Saison & Wetter', e: '☂️', lvl: 8, cost: 200000 },
    presse: { name: 'Presse & Hefte', e: '📰', lvl: 2, cost: 30000 }, konserv: { name: 'Konserven & Gewürze', e: '🥫', lvl: 3, cost: 50000 }, bio: { name: 'Bio & Regional', e: '🌱', lvl: 6, cost: 140000 },
    spiel: { name: 'Spielzeug & Hobby', e: '🧸', lvl: 7, cost: 180000 }, elektro: { name: 'Elektro & Technik', e: '🔌', lvl: 8, cost: 250000 }, garten: { name: 'Garten & Heimwerken', e: '🌻', lvl: 9, cost: 220000 }
  };
  // [id, Name, Emoji, Gruppe, Lager, Einkauf, Marktpreis, Karton, Größe, Haltbarkeit(Tage,0=ewig), Beliebtheit]
  const RAW = [
    ['apfel', 'Sonnenhof Äpfel', '🍎', 'obst', 'prod', 55, 89, 12, 1, 6, 1.3], ['banane', 'Tropenbogen Bananen', '🍌', 'obst', 'prod', 70, 109, 12, 1, 5, 1.2],
    ['tomate', 'Gartenglanz Tomaten', '🍅', 'obst', 'prod', 80, 129, 12, 1, 5, 1.0], ['gurke', 'Grünschlange Gurke', '🥒', 'obst', 'prod', 50, 79, 12, 1, 6, .8],
    ['karotte', 'Möhrchen-Max Karotten', '🥕', 'obst', 'prod', 45, 69, 16, 1, 8, .8], ['ananas', 'Inselkrone Ananas', '🍍', 'obst', 'prod', 130, 229, 8, 2, 6, .5],
    ['broetchen', 'Backstubenglück Brötchen', '🥖', 'brot', 'prod', 15, 35, 30, 1, 2, 1.6], ['brot', 'Mühlhain Landbrot', '🍞', 'brot', 'prod', 120, 229, 10, 2, 4, 1.0],
    ['croissant', 'Butterhörnchen', '🥐', 'brot', 'prod', 40, 89, 20, 1, 3, 1.0], ['kuchen', 'Zuckerhut Streuselkuchen', '🍰', 'brot', 'prod', 150, 279, 8, 2, 3, .6],
    ['wasser', 'Quellfrisch Wasser', '💧', 'getr', 'dry', 20, 49, 24, 2, 0, 1.8], ['saft', 'Fruchtkick Orangensaft', '🧃', 'getr', 'dry', 90, 149, 12, 2, 0, 1.0],
    ['limo', 'Zischfix Limo', '🥤', 'getr', 'dry', 45, 89, 24, 2, 0, 1.3], ['kaffee', 'Frühaufsteher Kaffee', '☕', 'getr', 'dry', 350, 549, 8, 1, 0, .8], ['tee', 'Kräuterstunde Tee', '🍵', 'getr', 'dry', 120, 219, 12, 1, 0, .6],
    ['milch', 'Wiesenglück Vollmilch', '🥛', 'milch', 'cold', 70, 109, 12, 2, 7, 1.6], ['kaese', 'Bergleben Käsescheiben', '🧀', 'milch', 'cold', 140, 219, 12, 1, 12, 1.0],
    ['joghurt', 'Löffelglück Joghurt', '🥣', 'milch', 'cold', 35, 59, 20, 1, 10, 1.1], ['butter', 'Goldstreif Butter', '🧈', 'milch', 'cold', 150, 239, 12, 1, 15, 1.0], ['eier', 'Hühnerhof Eier 10er', '🥚', 'milch', 'cold', 160, 259, 12, 1, 14, 1.2],
    ['nudeln', 'Pastafreund Spaghetti', '🍝', 'grund', 'dry', 45, 89, 20, 1, 0, 1.4], ['reis', 'Reisfeld Langkorn', '🍚', 'grund', 'dry', 90, 159, 12, 2, 0, .8],
    ['mehl', 'Mühlhain Weizenmehl', '🌾', 'grund', 'dry', 40, 79, 16, 2, 0, .7], ['oel', 'Goldtropfen Sonnenblumenöl', '🫒', 'grund', 'dry', 130, 219, 12, 2, 0, .8],
    ['sauce', 'Pomodoro Pronto Sauce', '🥫', 'grund', 'dry', 60, 109, 16, 1, 0, 1.1], ['honig', 'Summ-Summ Honig', '🍯', 'grund', 'dry', 220, 389, 8, 1, 0, .5],
    ['chips', 'Knusperwerk Chips', '🥔', 'snack', 'dry', 90, 149, 20, 2, 0, 1.4], ['schoko', 'Kakaotraum Schokolade', '🍫', 'snack', 'dry', 55, 99, 30, 1, 0, 1.5],
    ['gummi', 'Zappelbär Fruchtgummi', '🍬', 'snack', 'dry', 50, 89, 30, 1, 0, 1.3], ['kekse', 'Krümelmeister Kekse', '🍪', 'snack', 'dry', 70, 119, 24, 1, 0, 1.1], ['nuesse', 'Nusseck Studentenfutter', '🥜', 'snack', 'dry', 110, 189, 16, 1, 0, .7],
    ['klopapier', 'Sanftrolle 8er', '🧻', 'haus', 'dry', 180, 349, 12, 3, 0, 1.5], ['spuelmittel', 'Blitzblank Spülmittel', '🧴', 'haus', 'dry', 70, 129, 16, 1, 0, 1.0],
    ['muellsack', 'Dichtmann Müllsäcke', '🗑️', 'haus', 'dry', 60, 119, 16, 2, 0, .8], ['batterie', 'Dauerstrom Batterien', '🔋', 'haus', 'dry', 200, 399, 12, 1, 0, .7], ['kerze', 'Lichtblick Kerzen', '🕯️', 'haus', 'dry', 80, 159, 16, 1, 0, .5],
    ['pizza', 'Steinofen-Fritz Pizza', '🍕', 'frost', 'frost', 120, 229, 12, 2, 0, 1.4], ['eis', 'Polarlicht Eis', '🍦', 'frost', 'frost', 150, 279, 12, 1, 0, 1.0],
    ['pommes', 'Goldfritte Pommes', '🍟', 'frost', 'frost', 100, 189, 12, 2, 0, 1.0], ['mix', 'Frostgarten Gemüsemix', '🥦', 'frost', 'frost', 90, 169, 12, 1, 0, .7], ['fisch', 'Blauwelle Fischstäbchen', '🐟', 'frost', 'frost', 180, 299, 12, 1, 0, .8],
    ['wurst', 'Metzger-Mo Wiener', '🌭', 'fleisch', 'cold', 130, 229, 12, 1, 8, 1.1], ['hack', 'Grillfreund Hackfleisch', '🥩', 'fleisch', 'cold', 200, 349, 10, 1, 4, 1.0],
    ['haehnchen', 'Federglück Hähnchen', '🍗', 'fleisch', 'cold', 220, 379, 10, 2, 4, .9], ['schinken', 'Rauchzart Schinken', '🥓', 'fleisch', 'cold', 150, 269, 12, 1, 10, .8],
    ['zahnpasta', 'Perlweiß Zahnpasta', '🪥', 'drog', 'dry', 90, 169, 16, 1, 0, 1.0], ['shampoo', 'Seidenglanz Shampoo', '🚿', 'drog', 'dry', 130, 249, 12, 1, 0, .8],
    ['seife', 'Rosenhauch Seife', '🧼', 'drog', 'dry', 60, 119, 20, 1, 0, .9], ['sonnencreme', 'Sonnenschild Creme', '🧴', 'drog', 'dry', 250, 499, 8, 1, 0, .3],
    ['hundefutter', 'Wuffwonne Hundefutter', '🐶', 'tier', 'dry', 120, 229, 12, 2, 0, .9], ['katzenfutter', 'Schnurrfein Katzenfutter', '🐱', 'tier', 'dry', 40, 89, 24, 1, 0, 1.0],
    ['schirm', 'Trockenfuß Schirm', '☂️', 'saison', 'dry', 400, 799, 6, 2, 0, .2], ['kohle', 'Glutkönig Grillkohle', '🔥', 'saison', 'dry', 300, 549, 8, 3, 0, .3], ['kratzer', 'Klarblick Eiskratzer', '❄️', 'saison', 'dry', 120, 249, 12, 1, 0, .2],
    ['brezel', 'Salzgold Laugenbrezel', '🥨', 'brot', 'prod', 25, 59, 24, 1, 2, 1.2], ['bagel', 'Rundum Bagel', '🥯', 'brot', 'prod', 45, 99, 20, 1, 3, .8], ['donut', 'Zuckerring Donut', '🍩', 'brot', 'prod', 35, 79, 24, 1, 3, 1.1], ['muffin', 'Krümelkönig Muffin', '🧁', 'brot', 'prod', 55, 119, 18, 1, 3, .9],
    ['waffel', 'Goldgitter Waffeln', '🧇', 'brot', 'prod', 70, 139, 16, 1, 4, .7], ['fladen', 'Fladenfreund Fladenbrot', '🫓', 'brot', 'prod', 90, 169, 12, 2, 3, .6], ['torte', 'Sahnetraum Torte', '🎂', 'brot', 'cold', 380, 699, 6, 2, 4, .5],
    ['bohnen', 'Gartenschatz Bohnen', '🫘', 'konserv', 'dry', 45, 89, 24, 1, 0, .9], ['mais', 'Goldkorn Mais', '🌽', 'konserv', 'dry', 50, 99, 24, 1, 0, .8], ['suppe', 'Löffelwunder Suppe', '🍲', 'konserv', 'dry', 80, 149, 16, 1, 0, .9], ['gewuerz', 'Feuerzunge Gewürz', '🌶️', 'konserv', 'dry', 70, 139, 20, 1, 0, .6],
    ['salz', 'Meersalz-Mühle', '🧂', 'konserv', 'dry', 60, 119, 20, 1, 0, .7], ['essig', 'Sauerlich Essig', '🫙', 'konserv', 'dry', 60, 119, 16, 1, 0, .5], ['thun', 'Tiefsee Thunfisch', '🍣', 'konserv', 'dry', 90, 169, 20, 1, 0, .8],
    ['biomilch', 'Weidehof Bio-Milch', '🐄', 'bio', 'cold', 110, 169, 12, 2, 7, .9], ['bioeier', 'Freiland Bio-Eier', '🪺', 'bio', 'cold', 230, 379, 12, 1, 14, .8], ['biobrot', 'Dinkelkorn Bio-Brot', '🍞', 'bio', 'prod', 190, 349, 8, 2, 4, .7], ['biosaft', 'Streuobst Direktsaft', '🍏', 'bio', 'dry', 150, 269, 12, 2, 0, .7],
    ['tofu', 'Sojafreund Tofu', '🍱', 'bio', 'cold', 120, 219, 12, 1, 12, .6], ['hafer', 'Haferglück Drink', '🫗', 'bio', 'dry', 90, 169, 12, 2, 0, .7],
    ['zeitung', 'Tagesblick Zeitung', '📰', 'presse', 'dry', 90, 169, 20, 1, 2, 1.0], ['raetsel', 'Knobelfreund Rätselheft', '🧩', 'presse', 'dry', 70, 139, 20, 1, 0, .7], ['tvheft', 'Funkwelle TV-Heft', '📺', 'presse', 'dry', 110, 199, 20, 1, 0, .7], ['comic', 'Blitzbild Comic', '🦸', 'presse', 'dry', 120, 249, 20, 1, 0, .6],
    ['kochheft', 'Löffelmagazin', '📖', 'presse', 'dry', 160, 299, 16, 1, 0, .5], ['kalender', 'Jahresrund Kalender', '📅', 'presse', 'dry', 200, 399, 12, 1, 0, .4],
    ['kabel', 'Steckfix USB-Kabel', '🔌', 'elektro', 'dry', 180, 399, 16, 1, 0, .8], ['kopfh', 'Klangwelle Kopfhörer', '🎧', 'elektro', 'dry', 900, 1799, 8, 1, 0, .5], ['powerb', 'Energiebox Powerbank', '⚡', 'elektro', 'dry', 700, 1399, 8, 1, 0, .5], ['lampe', 'Lichtpunkt LED-Lampe', '💡', 'elektro', 'dry', 250, 499, 12, 1, 0, .8],
    ['maus', 'Klickfix Maus', '🖱️', 'elektro', 'dry', 600, 1199, 8, 1, 0, .4], ['stick', 'Datenkorn USB-Stick', '💾', 'elektro', 'dry', 400, 799, 10, 1, 0, .6],
    ['teddy', 'Knuddelbär Teddy', '🧸', 'spiel', 'dry', 500, 999, 8, 2, 0, .6], ['bausteine', 'Klickstein Bausteine', '🧱', 'spiel', 'dry', 900, 1799, 6, 2, 0, .5], ['ball', 'Hüpfer Ball', '⚽', 'spiel', 'dry', 400, 799, 8, 2, 0, .6], ['brettspiel', 'Würfelspaß Brettspiel', '🎲', 'spiel', 'dry', 1000, 1999, 6, 2, 0, .4],
    ['stifte', 'Farbenfroh Buntstifte', '🖍️', 'spiel', 'dry', 250, 499, 16, 1, 0, .8], ['blasen', 'Blubberspaß Seifenblasen', '🫧', 'spiel', 'dry', 100, 199, 20, 1, 0, .8],
    ['erde', 'Krümelbeet Blumenerde', '🌱', 'garten', 'dry', 200, 399, 10, 3, 0, .6], ['samen', 'Sprießfix Samen', '🌻', 'garten', 'dry', 90, 199, 24, 1, 0, .7], ['hammer', 'Haudrauf Hammer', '🔨', 'garten', 'dry', 600, 1199, 6, 1, 0, .3], ['schrauben', 'Dreh & Halt Schrauben', '🔩', 'garten', 'dry', 250, 499, 16, 1, 0, .4],
    ['eimer', 'Plätscher Gießeimer', '🪣', 'garten', 'dry', 350, 699, 8, 2, 0, .5], ['farbe', 'Buntwand Wandfarbe', '🎨', 'garten', 'dry', 800, 1499, 6, 2, 0, .3]
  ];
  const PRODUCTS = {}; RAW.forEach(r => { PRODUCTS[r[0]] = { id: r[0], name: r[1], e: r[2], cat: r[3], st: r[4], cost: r[5], ref: r[6], box: r[7], size: r[8], life: r[9], pop: r[10] }; });
  // Einrichtung: Lager-Klassen, die ein Regal aufnimmt, Grundkapazität, Preis, ab Stufe
  const OBJ = {
    regal: { name: 'Regal', e: '🗄️', w: 2, h: 1, st: ['dry'], cap: 24, price: 12000, lvl: 1, col: '#7a5a3a' },
    obst: { name: 'Obst- & Brotkorb', e: '🧺', w: 2, h: 1, st: ['prod'], cap: 20, price: 14000, lvl: 1, col: '#3c8a4a' },
    kuehl: { name: 'Kühlregal', e: '❄️', w: 2, h: 1, st: ['cold'], cap: 16, price: 45000, lvl: 1, col: '#3a7bb0', power: 800 },
    frost: { name: 'Tiefkühltruhe', e: '🧊', w: 2, h: 1, st: ['frost'], cap: 14, price: 60000, lvl: 4, col: '#4aa8c8', power: 1100 },
    quengel: { name: 'Quengelzone', e: '🍬', w: 1, h: 1, st: ['dry'], cap: 12, price: 9000, lvl: 2, col: '#b04a8a', impulse: 1.35, only: ['snack'] },
    kasse: { name: 'Kasse', e: '💶', w: 1, h: 1, st: [], cap: 0, price: 30000, lvl: 1, col: '#444c60' },
    sco: { name: 'Selbstbedienungskasse', e: '🖥️', w: 1, h: 1, st: [], cap: 0, price: 90000, lvl: 6, col: '#3a4a7a', power: 400 },
    deko: { name: 'Zimmerpflanze', e: '🪴', w: 1, h: 1, st: [], cap: 0, price: 2500, lvl: 1, col: '#2f6a3a' },
    ofen: { name: 'Backstation', e: '🥐', w: 2, h: 1, st: ['prod'], cap: 24, price: 80000, lvl: 3, col: '#c27a2a', power: 900, only: ['brot'], bake: 1 },
    lager: { name: 'Lager-Regal', e: '🏗️', w: 2, h: 1, st: [], cap: 0, price: 40000, lvl: 2, col: '#6a5a4a', store: 10 },
    mini: { name: 'Mini-Regal', e: '🗄️', w: 1, h: 1, st: ['dry'], cap: 10, price: 6500, lvl: 1, col: '#7a5a3a' },
    regal3: { name: 'Großes Regal', e: '🗄️', w: 3, h: 1, st: ['dry'], cap: 36, price: 26000, lvl: 4, col: '#7a5a3a' },
    wand: { name: 'Wandregal', e: '🗄️', w: 2, h: 1, st: ['dry'], cap: 30, price: 17000, lvl: 3, col: '#6a5a4a', tall: 1 },
    palette: { name: 'Palettenaufsteller', e: '🪵', w: 2, h: 2, st: ['dry'], cap: 56, price: 24000, lvl: 5, col: '#a67c52' },
    kuehl3: { name: 'Kühltheke', e: '❄️', w: 3, h: 1, st: ['cold'], cap: 26, price: 68000, lvl: 3, col: '#3a7bb0', power: 1100 },
    frost3: { name: 'Tiefkühlinsel', e: '🧊', w: 3, h: 1, st: ['frost'], cap: 24, price: 90000, lvl: 5, col: '#4aa8c8', power: 1500 },
    backtheke: { name: 'Backwaren-Theke', e: '🥨', w: 2, h: 1, st: ['prod'], cap: 22, price: 52000, lvl: 2, col: '#b8803a', power: 300, only: ['brot'] },
    presse: { name: 'Zeitschriftenständer', e: '📰', w: 1, h: 1, st: ['dry'], cap: 14, price: 8000, lvl: 2, col: '#4a5a8a', only: ['presse'] },
    pc: { name: 'Bestell-PC', e: '💻', w: 1, h: 1, st: [], cap: 0, price: 25000, lvl: 1, col: '#3a4a7a', pc: 1 },
    radio: { name: 'Marktradio', e: '📻', w: 1, h: 1, st: [], cap: 0, price: 15000, lvl: 1, col: '#3a3a4a', radio: 1 },
    ramp: { name: 'Rampe', e: '📦', w: 3, h: 1, st: [], cap: 0, price: 0, lvl: 1, col: '#8a6a30', fixed: 1 }
  };
  const TYPES = {
    fam: { name: 'Familie', e: '👨‍👩‍👧', w: 24, n: [4, 7], q: [1, 3], tol: .12, pat: 95, spd: 1.7, likes: { obst: 1.5, milch: 1.5, grund: 1.4, haus: 1.3, getr: 1.1, spiel: 1.5, garten: 1.2, konserv: 1.2, bio: 1.1 }, music: 'pop', recipe: .45 },
    stud: { name: 'Student', e: '🎒', w: 24, n: [2, 4], q: [1, 2], tol: .05, pat: 60, spd: 2.2, likes: { snack: 1.8, getr: 1.6, frost: 1.5, grund: 1.1, elektro: 1.5, presse: 1.2, spiel: 1.1 }, music: 'rock', recipe: .15 },
    sen: { name: 'Senior', e: '👵', w: 20, n: [3, 5], q: [1, 2], tol: .1, pat: 140, spd: 1.2, likes: { brot: 1.8, milch: 1.5, obst: 1.4, fleisch: 1.2, presse: 1.7, garten: 1.4, konserv: 1.3, bio: 1.2 }, music: 'schlager', recipe: .3 },
    job: { name: 'Berufstätige', e: '💼', w: 20, n: [1, 3], q: [1, 2], tol: .25, pat: 38, spd: 2.5, likes: { getr: 1.6, snack: 1.3, brot: 1.5, elektro: 1.3, presse: 1.4, bio: 1.3 }, music: 'chill', recipe: .1 },
    spar: { name: 'Sparfuchs', e: '🏷️', w: 8, n: [5, 9], q: [1, 3], tol: 0, pat: 120, spd: 1.9, likes: {}, music: 'pop', recipe: .2, hunt: 1 },
    infl: { name: 'Influencerin', e: '🤳', w: 1.2, n: [2, 3], q: [1, 1], tol: .3, pat: 70, spd: 2, likes: {}, music: 'pop', recipe: .1, minLvl: 6 },
    krit: { name: 'Testerin', e: '🧐', w: 1.5, n: [3, 4], q: [1, 1], tol: .2, pat: 80, spd: 1.8, likes: {}, music: 'chill', recipe: .2, minLvl: 4 }
  };
  const GENRES = { pop: { name: 'Pop', e: '🎤', notes: [0, 4, 7, 9, 7, 4], bpm: 118 }, rock: { name: 'Rock', e: '🎸', notes: [0, 0, 7, 5, 0, 10], bpm: 136 }, schlager: { name: 'Schlager', e: '🪗', notes: [0, 4, 7, 12, 9, 7], bpm: 104 }, chill: { name: 'Chillout', e: '🌴', notes: [0, 3, 7, 10, 7, 3], bpm: 84 } };
  const RECIPES = [
    { id: 'spag', name: 'Spaghetti-Abend', e: '🍝', items: ['nudeln', 'sauce', 'hack', 'kaese'] }, { id: 'fruehs', name: 'Sonntagsfrühstück', e: '🥐', items: ['broetchen', 'butter', 'honig', 'kaffee'] },
    { id: 'pizza', name: 'Pizza-Party', e: '🍕', items: ['pizza', 'limo', 'chips'] }, { id: 'salat', name: 'Gartensalat', e: '🥗', items: ['tomate', 'gurke', 'oel', 'karotte'] },
    { id: 'grill', name: 'Grillabend', e: '🔥', items: ['wurst', 'broetchen', 'kohle', 'limo'] }, { id: 'kuchen', name: 'Backtag', e: '🎂', items: ['mehl', 'eier', 'butter', 'honig'] },
    { id: 'kino', name: 'Filmabend', e: '🎬', items: ['chips', 'schoko', 'limo'] }
  ];
  const STAFF = {
    kasse: { name: 'Kassenkraft', e: '🧑‍💼', wage: 4500, lvl: 1, desc: 'Bedient eine Kasse selbstständig.' }, regal: { name: 'Regalauffüller', e: '🧑‍🏭', wage: 4000, lvl: 2, desc: 'Bringt Kartons von der Rampe ins Regal.' },
    putz: { name: 'Reinigungskraft', e: '🧹', wage: 3500, lvl: 3, desc: 'Wischt Pfützen & Chaos weg.' }, wache: { name: 'Wachmann', e: '💂', wage: 5000, lvl: 5, desc: 'Schreckt Ladendiebe ab.' },
    baecker: { name: 'Bäckerin', e: '🧑‍🍳', wage: 5500, lvl: 4, desc: 'Backt tagsüber frische Ware in der Backstation nach.' },
    robo: { name: 'Regalbot', e: '🤖', wage: 0, buy: 150000, lvl: 7, desc: 'Füllt tagsüber leise Regale. Kein Lohn, nur Strom.' }
  };
  const TRAITS = [['flink', 'flink (+25 % Tempo)'], ['gruendlich', 'gründlich (+Sauberkeit)'], ['freundlich', 'freundlich (Kunden zufriedener)'], ['schusselig', 'schusselig (macht Pfützen)'], ['fleissig', 'fleißig (kein Murren)']];
  const FIRST = ['Mia', 'Ben', 'Lena', 'Paul', 'Emma', 'Noah', 'Hanna', 'Finn', 'Lea', 'Jonas', 'Sara', 'Tom', 'Nele', 'Ole', 'Ida', 'Max', 'Jule', 'Karl', 'Rosa', 'Uwe', 'Gerda', 'Hugo', 'Tina', 'Yusuf', 'Aylin', 'Piotr', 'Greta', 'Arne', 'Fritzi', 'Bruno'];
  const LAST = ['Brandt', 'Kuhn', 'Vogel', 'Sommer', 'Lindner', 'Wolter', 'Ebert', 'Pohl', 'Funk', 'Jäger', 'Haas', 'Krause', 'Neumann', 'Albers', 'Roth'];
  const UPGRADES = [
    { id: 'wagen', name: 'Rollwagen', e: '🛒', price: 35000, lvl: 2, desc: 'Du trägst 3 Kartons statt 1.' }, { id: 'neon', name: 'Neon-Reklame', e: '💡', price: 60000, lvl: 3, desc: '+15 % Laufkundschaft.' },
    { id: 'klima', name: 'Klimaanlage', e: '🌬️', price: 90000, lvl: 4, desc: 'Kunden bleiben länger zufrieden, Strom +€3/Tag.' }, { id: 'kamera', name: 'Kameras', e: '📹', price: 80000, lvl: 4, desc: 'Diebe werden mit 🚨 markiert, Wachmänner sehen sie schon aus 16 Feldern.' },
    { id: 'radio', name: 'Radiostudio „Markt-Funk 24“', e: '📻', price: 80000, lvl: 3, desc: 'Eigener Sender: Musikstil & Werbespots lenken die Nachfrage.' }, { id: 'scanner', name: 'Marktforschung', e: '📈', price: 70000, lvl: 3, desc: 'Zeigt Nachfrage, Wunschzettel & Preisradar.' },
    { id: 'drohne', name: 'Express-Drohne', e: '🚁', price: 100000, lvl: 5, desc: 'Bestellungen kommen in 40 Sekunden (+25 % Gebühr).' }, { id: 'regalpl', name: 'Regal-Plus', e: '📚', price: 120000, lvl: 5, desc: '+25 % Fassungsvermögen aller Regale.' },
    { id: 'notstrom', name: 'Notstrom', e: '🔋', price: 110000, lvl: 6, desc: 'Stromausfälle verderben nichts mehr.' }, { id: 'auto', name: 'Nachbestell-Regeln', e: '🔁', price: 140000, lvl: 8, desc: 'Schaltet am Bestell-PC Regeln frei: Der PC bestellt Waren automatisch nach.' },
    { id: 'app', name: 'Bestell-App', e: '📱', price: 80000, lvl: 3, desc: 'Du bestellst von überall im Laden, ohne zum Bestell-PC zu gehen.' }, { id: 'tuer', name: 'Automatik-Schiebetür', e: '🚪', price: 250000, lvl: 5, desc: 'Die Tür öffnet von selbst. +3 % Kundschaft.' },
    { id: 'kassensys', name: 'Kassensystem', e: '🧾', price: 180000, lvl: 4, desc: 'Berechnet das Wechselgeld automatisch – kein Kopfrechnen an der Kasse.' }, { id: 'park', name: 'Parkplatz', e: '🅿️', price: 500000, lvl: 7, desc: 'Parkplätze vor dem Laden. +6 % Kundschaft.' }
  ];
  const EXPAND = [{ n: 'Kiosk', W: 18, H: 12, price: 0 }, { n: 'Laden', W: 22, H: 14, price: 150000, lvl: 3 }, { n: 'Markt', W: 26, H: 16, price: 400000, lvl: 6 }, { n: 'Supermarkt', W: 30, H: 18, price: 900000, lvl: 10 }, { n: 'Großmarkt', W: 36, H: 20, price: 2000000, lvl: 14 }, { n: 'Hypermarkt', W: 42, H: 22, price: 4500000, lvl: 18 }];
  const SIGNCOLS = [['#0f2b5a', 'Marine'], ['#7a1f1f', 'Rot'], ['#1f5a2f', 'Grün'], ['#5a2f8a', 'Violett'], ['#8a4a0f', 'Orange'], ['#222831', 'Schwarz']];
  const FLOORS = { fliese: { n: 'Fliesen', price: 0, lvl: 1, appeal: 0 }, parkett: { n: 'Parkett', price: 180000, lvl: 4, appeal: .03 }, marmor: { n: 'Marmor', price: 600000, lvl: 9, appeal: .06 } };
  const WALLS = { beige: { n: 'Sand', c: '#e9e2d2' }, gruen: { n: 'Salbei', c: '#cfe3c8' }, blau: { n: 'Himmel', c: '#cfe0f0' }, gelb: { n: 'Butter', c: '#f3e6a8' }, grau: { n: 'Beton', c: '#c9ccd2' } };
  const WEATHER = { sonne: { e: '☀️', name: 'Sonnig', spawn: 1, cat: { getr: 1.1 } }, heiss: { e: '🔥', name: 'Hitzewelle', spawn: 1.1, cat: { getr: 1.5, frost: 1.6, obst: 1.2 }, prod: { eis: 2.2, sonnencreme: 6, kohle: 4 } },
    regen: { e: '🌧️', name: 'Regen', spawn: .8, cat: {}, prod: { schirm: 14 }, mess: 2 }, kalt: { e: '🥶', name: 'Kälte', spawn: .9, cat: {}, prod: { tee: 2.2, kaffee: 1.6, kratzer: 12 } }, wolke: { e: '⛅', name: 'Wolkig', spawn: 1, cat: {} } };
  const QUESTS = [
    { id: 'items', t: 'Verkaufe {n} Artikel', n: [40, 90], key: 'items', r: 4000 }, { id: 'cust', t: 'Bediene {n} Kunden', n: [20, 50], key: 'served', r: 4000 },
    { id: 'rev', t: 'Erziele {n} € Umsatz', n: [250, 700], key: 'rev', r: 5000, div: 100 }, { id: 'happy', t: 'Bringe {n} Kunden richtig glücklich nach Hause', n: [8, 20], key: 'happy', r: 5000 },
    { id: 'rec', t: 'Erfülle {n} Rezept-Einkäufe', n: [2, 5], key: 'recipes', r: 6000 }, { id: 'nolost', t: 'Verliere höchstens {n} Kunden', n: [3, 6], key: 'lost', r: 6000, max: 1 }
  ];
  // Erfolge: id, Name, Emoji, Beschreibung, Belohnung (Cent)
  const ACH = [
    ['tag1', 'Erster Feierabend', '🌅', 'Schließe deinen ersten Tag ab.', 5000], ['stufe5', 'Aufsteiger', '⭐', 'Erreiche Stufe 5.', 20000], ['stufe10', 'Marktleiter', '🏅', 'Erreiche Stufe 10.', 60000],
    ['umsatz500', 'Guter Tag', '💶', 'Mache an einem Tag 500 € Umsatz.', 15000], ['umsatz2000', 'Rekordtag', '💰', 'Mache an einem Tag 2.000 € Umsatz.', 80000], ['team3', 'Kleines Team', '👥', 'Beschäftige 3 Mitarbeiter.', 15000],
    ['ruf4', 'Beliebter Laden', '😍', 'Erreiche 4 Sterne Ruf.', 30000], ['rezept10', 'Hobbykoch-Dealer', '🍝', 'Erfülle 10 Rezept-Einkäufe.', 25000], ['dieb5', 'Scharfe Augen', '🚔', 'Erwische 5 Ladendiebe.', 20000],
    ['anbau2', 'Platz da!', '🏗️', 'Baue den Laden zweimal aus.', 40000], ['radio', 'Auf Sendung', '📻', 'Kaufe das Radiostudio.', 10000], ['stamm25', 'Familienbetrieb', '❤️', 'Gewinne 25 Stammkunden.', 30000],
    ['buzz', 'Gesprächsthema', '🔥', 'Erreiche einen Online-Hype von +20 %.', 40000], ['kunden1000', 'Tausendsassa', '🧑‍🤝‍🧑', 'Bediene insgesamt 1.000 Kunden.', 50000], ['reich', 'Kleiner Millionär', '💎', 'Habe 10.000 € auf dem Konto.', 50000]
  ];
  // Jahreszeiten (je 28 Tage) mit Feiertagswochen: w = Wetter-Gewichte, prod = Nachfrage-Faktor je Ware
  const SEASONS = [
    { n: 'Frühling', e: '🌷', w: { sonne: .25, wolke: .3, regen: .3, heiss: .05, kalt: .1 }, prod: { eier: 1.3, schoko: 1.1, apfel: 1.1 }, hol: { from: 20, to: 24, n: 'Osterwoche', e: '🐰', prod: { eier: 2.2, schoko: 2, kuchen: 1.8, broetchen: 1.3, honig: 1.5, butter: 1.4 } } },
    { n: 'Sommer', e: '☀️', w: { sonne: .4, wolke: .15, regen: .15, heiss: .28, kalt: .02 }, prod: { eis: 1.4, wasser: 1.3, limo: 1.3, ananas: 1.4 }, hol: { from: 12, to: 16, n: 'Grillfest', e: '🍖', prod: { wurst: 2.4, kohle: 3, broetchen: 1.6, limo: 1.6, hack: 1.8, haehnchen: 1.6, chips: 1.4 } } },
    { n: 'Herbst', e: '🍂', w: { sonne: .2, wolke: .3, regen: .35, heiss: .02, kalt: .13 }, prod: { tee: 1.4, kerze: 1.4, schirm: 1.3 }, hol: { from: 22, to: 26, n: 'Halloween', e: '🎃', prod: { schoko: 2.4, gummi: 2.4, kekse: 1.8, kerze: 2.5, chips: 1.5 } } },
    { n: 'Winter', e: '❄️', w: { sonne: .15, wolke: .3, regen: .1, heiss: 0, kalt: .45 }, prod: { tee: 1.6, kaffee: 1.4, kratzer: 1.6, kerze: 1.4 }, hol: { from: 18, to: 24, n: 'Weihnachtszeit', e: '🎄', prod: { nuesse: 2.3, kekse: 2.4, schoko: 2, honig: 2, kaffee: 1.6, kerze: 2.4, mehl: 1.6, butter: 1.6, eier: 1.5, haehnchen: 1.8 } } }
  ];
  const fmt = c => (c < 0 ? '−' : '') + (Math.abs(c) / 100).toFixed(2).replace('.', ',') + ' €';
  return { SIGNCOLS, FLOORS, WALLS, SEASONS, ACH, CATS, PRODUCTS, OBJ, TYPES, GENRES, RECIPES, STAFF, TRAITS, FIRST, LAST, UPGRADES, EXPAND, WEATHER, QUESTS, fmt };
})();
if (typeof module !== 'undefined') module.exports = Data;
