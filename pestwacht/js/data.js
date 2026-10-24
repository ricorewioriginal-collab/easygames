/* Pestwacht – Die letzte Zuflucht · Spieldaten (Balancing und Inhalte an einem Ort, keine verstreuten Zahlen).
 * Zeit: Spielsekunden. Produktion: pro Spielminute. Alle Inhalte sind eigene Erfindungen. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};

  PW.TITLE = 'Pestwacht';
  PW.SUBTITLE = 'Die letzte Zuflucht';
  PW.SCHEMA = 3;               // Version des Spielstands (Migrationen in save.js)
  PW.TICK = 0.5;               // feste Simulationsschrittweite in Spielsekunden
  PW.DAY = 240;                // Länge eines Spieltags (Tag/Nacht)

  // ---------- Ressourcen ----------
  PW.RES = ['wood', 'stone', 'iron', 'food', 'water', 'herb', 'med', 'cloth', 'coin', 'know'];
  PW.RES_INFO = {
    wood: { name: 'Holz', icon: '🪵' }, stone: { name: 'Stein', icon: '🪨' }, iron: { name: 'Eisen', icon: '⛓️' },
    food: { name: 'Nahrung', icon: '🍞' }, water: { name: 'Wasser', icon: '💧' }, herb: { name: 'Heilkräuter', icon: '🌿' },
    med: { name: 'Arznei', icon: '🧪' }, cloth: { name: 'Stoff', icon: '🧵' }, coin: { name: 'Münzen', icon: '🪙' }, know: { name: 'Wissen', icon: '📜' }
  };
  PW.UNCAPPED = { coin: 1, know: 1 };   // Münzen und Wissen ohne Lagergrenze

  PW.BAL = {
    eatFood: 0.5, drinkWater: 0.5,          // je Bewohner und Minute
    baseStore: 800, hqStore: 450,           // Lager: Grundwert + je Ratshaus-Stufe
    taxPerPop: 0.18,                        // Münzen je Bewohner und Minute (mal Zufriedenheit)
    costGrowth: 1.55, timeGrowth: 0.65, prodGrowth: 0.45, workGrowth: 0.3,
    roadBonus: 0.1,                         // +10 % Produktion für Gebäude an einem Weg
    demolishRefund: 0.5, repairShare: 0.3, moveDowntime: 10,
    builders: 2,                            // gleichzeitige Bauaufträge (+1 durch Baumeisterei)
    // Seuche (Raten je Minute, deterministisch mit Bruchteil-Übertrag)
    infectBase: 0.010, spreadBeta: 0.22, riskShare: 0.25, untreatedDeath: 0.035, untreatedRecover: 0.06,
    cureBase: 0.22, medPerPatient: 0.25, immuneTime: 360, quarantineCut: 0.85,
    // Zufriedenheit und Zuwanderung
    fleeBelow: 25, fleeRate: 0.02, arriveAbove: 55, arriveRate: 0.5,
    troopUpkeepFood: 0.1, troopUpkeepCoin: 0.03,
    woundedHeal: 0.05,                      // Anteil Verwundeter je Minute, der ohne Betten genest
    marchCost: 18,                          // Sekunden je Kostenpunkt auf der Weltkarte
    offlineCapDefault: 3600                 // höchstens 1 Stunde Abwesenheit wird verrechnet (nur Produktion)
  };

  // ---------- Gebäude ----------
  // w,h Rasterzellen; max Höchststufe; cost/time Stufe 1; prod/use je Minute (Stufe 1); workers Stufe 1
  const B = [
    { id: 'hq', name: 'Ratshaus', cat: 'zentrum', icon: '🏛️', w: 3, h: 3, max: 10, unique: 1, cost: { wood: 200, stone: 150 }, time: 40, workers: 0, house: 8, hp: 1500,
      desc: 'Herz der Zuflucht. Seine Stufe begrenzt die Stufe aller anderen Gebäude, erhöht Lager und Steuern.' },
    { id: 'haus', name: 'Wohnhaus', cat: 'versorgung', icon: '🏠', w: 2, h: 2, max: 8, cost: { wood: 60, stone: 20 }, time: 15, workers: 0, house: 6, hp: 300,
      desc: 'Wohnraum für 6 Bewohner je Stufe. Ohne Wohnraum kommen keine Überlebenden und die Zufriedenheit sinkt.' },
    { id: 'brunnen', name: 'Brunnen', cat: 'versorgung', icon: '⛲', w: 1, h: 1, max: 6, cost: { stone: 40, wood: 10 }, time: 12, workers: 1, prod: { water: 16 }, hyg: 0.05, hp: 200,
      desc: 'Liefert sauberes Wasser und verbessert die Hygiene.' },
    { id: 'farm', name: 'Bauernhof', cat: 'versorgung', icon: '🌾', w: 3, h: 3, max: 8, cost: { wood: 80, stone: 20 }, time: 20, workers: 3, prod: { food: 15, cloth: 1.2 }, use: { water: 2 }, hp: 350,
      desc: 'Erzeugt Nahrung und etwas Flachs für Stoff. Braucht Wasser.' },
    { id: 'kraeuter', name: 'Kräutergarten', cat: 'medizin', icon: '🌿', w: 2, h: 2, max: 8, cost: { wood: 50, stone: 10 }, time: 15, workers: 2, prod: { herb: 7 }, use: { water: 1 }, hp: 200,
      desc: 'Baut Heilkräuter an – Grundstoff aller Arzneien.' },
    { id: 'apotheke', name: 'Alchemielabor', cat: 'medizin', icon: '⚗️', w: 2, h: 2, max: 8, cost: { wood: 80, stone: 60, iron: 10 }, time: 25, workers: 2, prod: { med: 2.5 }, use: { herb: 5 }, req: { hq: 2 }, hp: 260,
      desc: 'Verarbeitet Heilkräuter zu Arznei für die Behandlung.' },
    { id: 'heilstube', name: 'Heilstube', cat: 'medizin', icon: '🩹', w: 2, h: 2, max: 8, cost: { wood: 70, stone: 30, herb: 10 }, time: 18, workers: 1, beds: 3, cure: 1, hp: 260,
      desc: 'Betten für Kranke. Behandlung verbraucht Arznei und braucht Personal.' },
    { id: 'lazarett', name: 'Pestlazarett', cat: 'medizin', icon: '🏥', w: 3, h: 2, max: 8, cost: { wood: 160, stone: 140, cloth: 20 }, time: 40, workers: 3, beds: 7, cure: 1.6, req: { hq: 3, tech: 'h5' }, hp: 500,
      desc: 'Großes Lazarett mit besserer Heilung. Pflegt auch verwundete Soldaten.' },
    { id: 'quarantaene', name: 'Quarantänestation', cat: 'medizin', icon: '🚧', w: 2, h: 2, max: 8, cost: { wood: 90, stone: 50 }, time: 20, workers: 1, quar: 4, hp: 300,
      desc: 'Isoliert Infizierte. Isolierte stecken niemanden an, warten aber auf ein Bett.' },
    { id: 'saege', name: 'Sägewerk', cat: 'produktion', icon: '🪚', w: 2, h: 2, max: 8, cost: { wood: 40, stone: 20 }, time: 15, workers: 2, prod: { wood: 13 }, hp: 250,
      desc: 'Holz für fast alle Bauten.' },
    { id: 'steinbruch', name: 'Steinbruch', cat: 'produktion', icon: '⛏️', w: 2, h: 2, max: 8, cost: { wood: 60 }, time: 15, workers: 3, prod: { stone: 9 }, hp: 300,
      desc: 'Bricht Stein für Mauern und große Gebäude.' },
    { id: 'mine', name: 'Erzmine', cat: 'produktion', icon: '⚒️', w: 2, h: 2, max: 8, cost: { wood: 90, stone: 60 }, time: 25, workers: 3, prod: { iron: 5 }, req: { hq: 2 }, hp: 300,
      desc: 'Fördert Eisen für Waffen, Werkzeug und Türme.' },
    { id: 'lager', name: 'Lagerhaus', cat: 'produktion', icon: '📦', w: 2, h: 2, max: 8, cost: { wood: 80, stone: 40 }, time: 18, workers: 0, store: 1400, hp: 350,
      desc: 'Erhöht die Lagergrenze aller Waren.' },
    { id: 'markt', name: 'Marktplatz', cat: 'verwaltung', icon: '🏪', w: 3, h: 2, max: 8, unique: 1, cost: { wood: 120, stone: 80 }, time: 30, workers: 2, prod: { coin: 5 }, sat: 6, req: { hq: 2 }, hp: 400,
      desc: 'Münzen, Zufriedenheit und Tausch von Waren gegen Münzen.' },
    { id: 'akademie', name: 'Forschungsakademie', cat: 'verwaltung', icon: '🎓', w: 3, h: 3, max: 8, unique: 1, cost: { wood: 150, stone: 120, coin: 50 }, time: 35, workers: 2, prod: { know: 5 }, req: { hq: 2 }, hp: 500,
      desc: 'Erzeugt Wissen. Ihre Stufe schaltet höhere Forschungsstufen frei.' },
    { id: 'schmiede', name: 'Schmiede', cat: 'militaer', icon: '🔨', w: 2, h: 2, max: 8, unique: 1, cost: { wood: 100, stone: 80, iron: 20 }, time: 25, workers: 2, req: { hq: 2 }, hp: 350,
      desc: 'Fertigt Ausrüstung für Helden. Höhere Stufen verbessern Waffen der Truppen (+3 % Angriff je Stufe).' },
    { id: 'kaserne', name: 'Kaserne', cat: 'militaer', icon: '🛡️', w: 3, h: 2, max: 8, unique: 1, cost: { wood: 120, stone: 100 }, time: 30, workers: 0, troopCap: 40, hp: 600,
      desc: 'Bildet Fußtruppen aus und erhöht die Truppengrenze.' },
    { id: 'schiessplatz', name: 'Schießplatz', cat: 'militaer', icon: '🎯', w: 2, h: 3, max: 8, unique: 1, cost: { wood: 140, stone: 60 }, time: 28, workers: 0, troopCap: 20, req: { hq: 2 }, hp: 400,
      desc: 'Bildet Armbrustschützen und Belagerungsgerät aus.' },
    { id: 'stall', name: 'Stall', cat: 'militaer', icon: '🐎', w: 3, h: 2, max: 8, unique: 1, cost: { wood: 150, stone: 60, food: 80 }, time: 30, workers: 1, troopCap: 15, use: { food: 3 }, req: { hq: 3, tech: 'w5' }, hp: 400,
      desc: 'Reiterei für schnelle Märsche. Pferde brauchen Futter.' },
    { id: 'heldengilde', name: 'Heldengilde', cat: 'militaer', icon: '⚔️', w: 3, h: 2, max: 8, unique: 1, cost: { wood: 160, stone: 120, coin: 80 }, time: 35, req: { hq: 3 }, hp: 500,
      desc: 'Wirbt Helden an und bildet sie aus (Heldenplätze und Übungs-Erfahrung).' },
    { id: 'turm_pfeil', name: 'Wachturm', cat: 'verteidigung', icon: '🗼', w: 1, h: 1, max: 10, cost: { wood: 70, stone: 40 }, time: 18, hp: 400,
      tower: { range: 13, dmg: 13, rate: 0.8, speed: 34, kind: 'pfeil' }, desc: 'Schneller Armbrustturm gegen einzelne Ziele.' },
    { id: 'turm_balliste', name: 'Ballistenturm', cat: 'verteidigung', icon: '🏹', w: 1, h: 1, max: 10, cost: { wood: 120, stone: 80, iron: 30 }, time: 30, req: { hq: 3 }, hp: 500,
      tower: { range: 17, dmg: 55, rate: 2.4, speed: 40, kind: 'bolzen', pierce: 1 }, desc: 'Schwere Bolzen durchschlagen jede Panzerung.' },
    { id: 'turm_feuer', name: 'Feuerbecken', cat: 'verteidigung', icon: '🔥', w: 1, h: 1, max: 10, cost: { wood: 90, stone: 90, iron: 20 }, time: 26, req: { tech: 'w7' }, hp: 450,
      tower: { range: 9, dmg: 10, rate: 1.6, speed: 18, kind: 'feuer', splash: 3, burn: 6 }, desc: 'Wirft brennendes Pech: Flächenschaden und Brand.' },
    { id: 'turm_rauch', name: 'Räucherturm', cat: 'verteidigung', icon: '💨', w: 1, h: 1, max: 10, cost: { wood: 80, stone: 50, herb: 30 }, time: 22, req: { tech: 'h2' }, hp: 380,
      tower: { range: 10, dmg: 5, rate: 1, kind: 'rauch', aura: 1, slow: 0.4 }, desc: 'Kräuterrauch verlangsamt alle Feinde und schadet Seuchenwesen.' },
    { id: 'mauer', name: 'Stadtmauer & Tor', cat: 'verteidigung', icon: '🧱', w: 0, h: 0, max: 10, unique: 1, cost: { stone: 150, wood: 60 }, time: 30, gate: 700, hp: 700, ring: 1,
      desc: 'Umschließt die Zuflucht. Feinde müssen das Tor brechen. Höhere Stufen: mehr Torstärke.' },
    { id: 'kundschafter', name: 'Kundschafterposten', cat: 'verwaltung', icon: '🔭', w: 2, h: 2, max: 6, unique: 1, cost: { wood: 90, stone: 30 }, time: 20, scout: 1, hp: 250,
      desc: 'Größere Sicht auf der Weltkarte, frühere Wellenwarnung, schnellere Kundschafter.' },
    { id: 'diplomatie', name: 'Diplomatiehalle', cat: 'verwaltung', icon: '🕊️', w: 3, h: 2, max: 6, unique: 1, cost: { wood: 140, stone: 100, cloth: 20, coin: 60 }, time: 30, req: { hq: 3 }, hp: 400,
      desc: 'Erlaubt Bündnisse und Verteidigungspakte und verbessert Beziehungen.' },
    { id: 'handel', name: 'Handelsstation', cat: 'verwaltung', icon: '🐪', w: 2, h: 2, max: 6, unique: 1, cost: { wood: 110, stone: 50, coin: 40 }, time: 25, req: { hq: 2 }, hp: 300,
      desc: 'Karawanen zu Computerfraktionen. Je Stufe eine Karawane mehr und bessere Preise.' },
    { id: 'kommando', name: 'Kommandoposten', cat: 'militaer', icon: '🚩', w: 2, h: 2, max: 6, unique: 1, cost: { wood: 100, stone: 70 }, time: 22, hp: 350,
      desc: 'Mehr gleichzeitige Expeditionen auf der Weltkarte (1 + Stufe).' },
    { id: 'gedenk', name: 'Gedenkstätte', cat: 'versorgung', icon: '🕯️', w: 2, h: 2, max: 5, unique: 1, cost: { stone: 80, wood: 30 }, time: 20, sat: 5, grief: 0.25, hp: 300,
      desc: 'Ein Ort des Gedenkens: mildert Trauer nach Verlusten (weniger Flucht) und hebt die Zufriedenheit.' },
    { id: 'weg', name: 'Pflasterweg', cat: 'deko', icon: '🟫', w: 1, h: 1, max: 1, cost: { stone: 5 }, time: 1, road: 1, hp: 50,
      desc: 'Gebäude, die einen Weg berühren, arbeiten 10 % besser.' },
    { id: 'laterne', name: 'Laterne', cat: 'deko', icon: '🏮', w: 1, h: 1, max: 1, cost: { wood: 10, iron: 2 }, time: 3, sat: 0.6, light: 1, hp: 50,
      desc: 'Warmes Licht in der Nacht (+Zufriedenheit, Sicherheit).' },
    { id: 'garten', name: 'Ziergarten', cat: 'deko', icon: '🌳', w: 1, h: 1, max: 1, cost: { wood: 15, herb: 2 }, time: 4, sat: 0.8, hp: 50,
      desc: 'Bäume und Blumen heben die Stimmung.' },
    { id: 'statue', name: 'Wächterstatue', cat: 'deko', icon: '🗿', w: 1, h: 1, max: 1, cost: { stone: 60 }, time: 8, sat: 1.5, req: { hq: 3 }, hp: 80,
      desc: 'Steinerne Wächterin – ein Denkmal für die Pestwacht.' }
  ];
  PW.BUILDINGS = B;
  PW.BLD = {}; B.forEach(b => { PW.BLD[b.id] = b; });
  PW.BLD_CATS = [
    { id: 'zentrum', name: 'Zentrum', icon: '🏛️' }, { id: 'versorgung', name: 'Versorgung', icon: '🏠' }, { id: 'medizin', name: 'Medizin', icon: '🌿' },
    { id: 'produktion', name: 'Produktion', icon: '⛏️' }, { id: 'militaer', name: 'Militär', icon: '🛡️' }, { id: 'verteidigung', name: 'Verteidigung', icon: '🗼' },
    { id: 'verwaltung', name: 'Verwaltung', icon: '🎓' }, { id: 'deko', name: 'Wege & Deko', icon: '🌳' }
  ];

  const r5 = v => Math.max(1, Math.round(v / 5) * 5);
  PW.costOf = function (id, lv) {
    const b = PW.BLD[id], o = {}, m = Math.pow(PW.BAL.costGrowth, lv - 1);
    Object.keys(b.cost).forEach(k => { o[k] = b.cost[k] < 10 ? Math.ceil(b.cost[k] * m) : r5(b.cost[k] * m); });
    return o;
  };
  PW.timeOf = (id, lv) => Math.round(PW.BLD[id].time * (1 + PW.BAL.timeGrowth * (lv - 1) * Math.sqrt(lv)));
  PW.prodMult = lv => 1 + PW.BAL.prodGrowth * (lv - 1);
  PW.workersOf = (id, lv) => { const w = PW.BLD[id].workers || 0; return w ? Math.ceil(w * (1 + PW.BAL.workGrowth * (lv - 1))) : 0; };

  // ---------- Forschung (3 Bäume) ----------
  const TECH = [
    // Heilkunst
    { id: 'h1', tree: 'heil', tier: 1, name: 'Kräuterkunde', cost: { know: 40 }, time: 40, mods: { 'prod.herb': 0.2, cure: 0.05 }, desc: '+20 % Heilkräuter, +5 % Heilung.' },
    { id: 'h2', tree: 'heil', tier: 1, name: 'Seife & Hygiene', cost: { know: 60, herb: 20 }, time: 50, req: ['h1'], mods: { hyg: 0.1, spread: -0.15 }, desc: '+10 Hygiene, −15 % Ansteckung. Schaltet den Räucherturm frei.' },
    { id: 'h3', tree: 'heil', tier: 2, name: 'Quarantäneordnung', cost: { know: 110, coin: 40 }, time: 70, req: ['h2'], mods: { quar: 0.5, spread: -0.1 }, desc: '+50 % Quarantäneplätze, −10 % Ansteckung.' },
    { id: 'h4', tree: 'heil', tier: 2, name: 'Destillierkunst', cost: { know: 120, herb: 40 }, time: 70, req: ['h1'], mods: { 'prod.med': 0.25 }, desc: '+25 % Arznei.' },
    { id: 'h5', tree: 'heil', tier: 3, name: 'Lazarettwesen', cost: { know: 200, cloth: 30 }, time: 90, req: ['h3'], mods: { beds: 0.3 }, desc: '+30 % Betten. Schaltet das Pestlazarett frei.' },
    { id: 'h6', tree: 'heil', tier: 3, name: 'Feldscherschule', cost: { know: 220, med: 30 }, time: 90, req: ['h4'], mods: { wounded: 0.2 }, desc: 'Feldscher ausbilden; +20 % Verwundete überleben.' },
    { id: 'h7', tree: 'heil', tier: 4, name: 'Pestjägerorden', cost: { know: 350, med: 50, iron: 40 }, time: 120, req: ['h5', 'h6'], mods: {}, desc: 'Schaltet Pestjäger frei (doppelter Schaden gegen Seuchenwesen).' },
    { id: 'h8', tree: 'heil', tier: 4, name: 'Das Heilmittel', cost: { know: 700, med: 120, herb: 150 }, time: 200, req: ['h7'], mods: { cure: 0.4, spread: -0.4 }, desc: 'Durchbruch gegen die Graupest: +40 % Heilung, −40 % Ansteckung.' },
    // Wirtschaft
    { id: 'e1', tree: 'wirt', tier: 1, name: 'Fruchtfolge', cost: { know: 40 }, time: 40, mods: { 'prod.food': 0.2 }, desc: '+20 % Nahrung.' },
    { id: 'e2', tree: 'wirt', tier: 1, name: 'Bessere Werkzeuge', cost: { know: 50, iron: 10 }, time: 45, mods: { 'prod.wood': 0.15, 'prod.stone': 0.15 }, desc: '+15 % Holz und Stein.' },
    { id: 'e3', tree: 'wirt', tier: 2, name: 'Lagerverwaltung', cost: { know: 100, wood: 80 }, time: 60, req: ['e1'], mods: { store: 0.3 }, desc: '+30 % Lagergrenze.' },
    { id: 'e4', tree: 'wirt', tier: 2, name: 'Tiefer Bergbau', cost: { know: 110, wood: 60 }, time: 60, req: ['e2'], mods: { 'prod.iron': 0.25 }, desc: '+25 % Eisen.' },
    { id: 'e5', tree: 'wirt', tier: 3, name: 'Münzrecht', cost: { know: 180, coin: 60 }, time: 80, req: ['e3'], mods: { 'prod.coin': 0.25 }, desc: '+25 % Münzen.' },
    { id: 'e6', tree: 'wirt', tier: 3, name: 'Handelsrecht', cost: { know: 200, coin: 80 }, time: 80, req: ['e5'], mods: { trade: 0.15, 'caravan.speed': 0.25 }, desc: '+15 % Handelspreise, schnellere Karawanen.' },
    { id: 'e7', tree: 'wirt', tier: 2, name: 'Baumeisterei', cost: { know: 120, stone: 60 }, time: 60, req: ['e2'], mods: { 'build.speed': 0.25, builders: 1 }, desc: '+25 % Baugeschwindigkeit und ein weiterer Bautrupp.' },
    { id: 'e8', tree: 'wirt', tier: 4, name: 'Kanzlei', cost: { know: 320, coin: 120 }, time: 110, req: ['e6', 'e7'], mods: { 'research.speed': 0.2, sat: 5 }, desc: '+20 % Forschungstempo, +5 Zufriedenheit.' },
    // Krieg & Verteidigung
    { id: 'w1', tree: 'krieg', tier: 1, name: 'Drill', cost: { know: 50, food: 40 }, time: 40, mods: { 'troop.atk': 0.1 }, desc: '+10 % Angriff aller Truppen.' },
    { id: 'w2', tree: 'krieg', tier: 1, name: 'Gefiederte Bolzen', cost: { know: 50, wood: 50 }, time: 40, mods: { 'tower.dmg': 0.2 }, desc: '+20 % Turmschaden.' },
    { id: 'w3', tree: 'krieg', tier: 2, name: 'Kettenhemden', cost: { know: 110, iron: 40 }, time: 60, req: ['w1'], mods: { 'troop.def': 0.15 }, desc: '+15 % Verteidigung aller Truppen.' },
    { id: 'w4', tree: 'krieg', tier: 2, name: 'Mauerbau', cost: { know: 110, stone: 100 }, time: 60, req: ['w2'], mods: { 'gate.hp': 0.3 }, desc: '+30 % Torstärke.' },
    { id: 'w5', tree: 'krieg', tier: 2, name: 'Reiterei', cost: { know: 130, food: 80 }, time: 60, req: ['w1'], mods: {}, desc: 'Schaltet den Stall und Reiter frei.' },
    { id: 'w6', tree: 'krieg', tier: 3, name: 'Belagerungskunst', cost: { know: 200, wood: 120, iron: 40 }, time: 80, req: ['w3'], mods: { 'siege.dmg': 0.25 }, desc: 'Schaltet den Rammbock frei, +25 % Belagerungsschaden.' },
    { id: 'w7', tree: 'krieg', tier: 3, name: 'Griechisches Feuer', cost: { know: 220, herb: 40, iron: 30 }, time: 90, req: ['w4'], mods: { 'tower.range': 0.1 }, desc: 'Schaltet das Feuerbecken frei, +10 % Turmreichweite.' },
    { id: 'w8', tree: 'krieg', tier: 4, name: 'Feldlogistik', cost: { know: 320, food: 150 }, time: 110, req: ['w5', 'w6'], mods: { 'march.speed': 0.2, upkeep: -0.15 }, desc: '+20 % Marschtempo, −15 % Unterhalt.' }
  ];
  PW.TECHS = TECH; PW.TECH = {}; TECH.forEach(t => { PW.TECH[t.id] = t; });
  PW.TREES = [{ id: 'heil', name: 'Heilkunst', icon: '🌿' }, { id: 'wirt', name: 'Wirtschaft & Verwaltung', icon: '⚖️' }, { id: 'krieg', name: 'Krieg & Verteidigung', icon: '⚔️' }];

  // ---------- Truppen ----------
  // vs: Schadensfaktor gegen Klassen; plague: Faktor gegen Seuchenwesen
  PW.UNITS = {
    spear: { name: 'Spießträger', icon: '🔱', cls: 'melee', hp: 60, atk: 8, def: 6, range: 1.2, spd: 3, cost: { food: 20, wood: 10, iron: 4, coin: 4 }, time: 5,
      vs: { cav: 1.6 }, req: { bld: 'kaserne' }, desc: 'Solide Fußtruppe, stark gegen Reiter.' },
    bow: { name: 'Armbrustschützen', icon: '🏹', cls: 'ranged', hp: 40, atk: 10, def: 3, range: 7, spd: 3, cost: { food: 15, wood: 25, iron: 5, cloth: 2 }, time: 6,
      vs: { melee: 1.3, siege: 1.3 }, req: { bld: 'schiessplatz' }, desc: 'Fernkampf, stark gegen Fußtruppen.' },
    rider: { name: 'Reiter', icon: '🐎', cls: 'cav', hp: 85, atk: 12, def: 5, range: 1.2, spd: 6, cost: { food: 30, iron: 10, cloth: 6, coin: 10 }, time: 8,
      vs: { ranged: 1.6, support: 1.4 }, req: { bld: 'stall', tech: 'w5' }, desc: 'Schnell, stark gegen Schützen. Beschleunigt Märsche.' },
    medic: { name: 'Feldscher', icon: '⚕️', cls: 'support', hp: 35, atk: 2, def: 3, range: 5, spd: 3, heal: 3.5, cost: { food: 10, herb: 10, med: 4, cloth: 4 }, time: 7,
      vs: {}, req: { bld: 'heilstube', lv: 2, tech: 'h6' }, desc: 'Heilt Verbündete im Kampf, mehr Verwundete überleben.' },
    ram: { name: 'Rammbock', icon: '🪵', cls: 'siege', hp: 160, atk: 4, def: 8, range: 1.5, spd: 1.6, wall: 32, cost: { wood: 60, iron: 18, coin: 8 }, time: 12,
      vs: {}, req: { bld: 'schiessplatz', lv: 3, tech: 'w6' }, desc: 'Bricht Mauern und Tore, schwach gegen Truppen.' },
    hunter: { name: 'Pestjäger', icon: '🗡️', cls: 'special', hp: 70, atk: 11, def: 6, range: 1.4, spd: 3.5, cost: { food: 15, med: 6, iron: 8, coin: 14 }, time: 9,
      vs: {}, plague: 2.2, req: { bld: 'kaserne', lv: 4, tech: 'h7' }, desc: 'Spezialisten mit Räucherklingen: doppelter Schaden gegen Seuchenwesen.' }
  };
  PW.UNIT_IDS = Object.keys(PW.UNITS);

  // ---------- Helden ----------
  PW.RARITY = { 1: { name: 'Gewöhnlich', col: '#b9b2a2', m: 1 }, 2: { name: 'Selten', col: '#6fb3ff', m: 1.12 }, 3: { name: 'Episch', col: '#c88bff', m: 1.25 }, 4: { name: 'Legendär', col: '#ffc24a', m: 1.4 } };
  PW.CLASSES = { schild: 'Schildwächter', fern: 'Fernkämpfer', heiler: 'Heiler', alchemist: 'Alchemist', kundschafter: 'Kundschafter', taktiker: 'Taktiker', belagerer: 'Belagerungsspezialist' };
  PW.HEROES = [
    { id: 'hildrun', name: 'Hildrun von Aschental', cls: 'heiler', rar: 3, col: '#e8d9a8', hp: 420, atk: 14, def: 10,
      story: 'Die Äbtissin von Aschental führte die Überlebenden ihres Klosters in die Zuflucht. Sie glaubt an Seife, Kräuter und Geduld.',
      passive: { name: 'Klostermedizin', mods: { cure: 0.15 }, desc: '+15 % Heilung in der Stadt.' },
      skill: { id: 'segen', name: 'Segen der Linde', cd: 18, desc: 'Heilt alle Verbündeten um 25 % ihrer Lebenspunkte.' }, pro: 'Heilung', con: 'Wenig Schaden', start: 1 },
    { id: 'veit', name: 'Veit Eisenhand', cls: 'schild', rar: 2, col: '#9aa7b8', hp: 760, atk: 18, def: 22,
      story: 'Ehemaliger Torwächter der Stadt Kaltbrunn. Seit sein Tor fiel, schwört er, kein zweites zu verlieren.',
      passive: { name: 'Eiserne Reihen', mods: { 'troop.def': 0.1 }, desc: '+10 % Verteidigung der Truppen.' },
      skill: { id: 'schildwall', name: 'Schildwall', cd: 20, desc: 'Verbündete erleiden 6 s lang 50 % weniger Schaden.' }, pro: 'Sehr zäh', con: 'Langsam', start: 1 },
    { id: 'mira', name: 'Mira Falkenaug', cls: 'fern', rar: 3, col: '#7fb36a', hp: 380, atk: 34, def: 8,
      story: 'Wilderin aus dem Grauwald, die mit drei Pfeilen eine Rattenplage aus einer Mühle vertrieb.',
      passive: { name: 'Adlerblick', mods: { 'ranged.atk': 0.15 }, desc: '+15 % Angriff der Fernkämpfer.' },
      skill: { id: 'pfeilhagel', name: 'Pfeilhagel', cd: 16, desc: 'Großer Flächenschaden auf die dichteste Feindgruppe.' }, pro: 'Fernschaden', con: 'Zerbrechlich', unlock: 'kampagne' },
    { id: 'anselm', name: 'Bruder Anselm', cls: 'alchemist', rar: 2, col: '#c9a35a', hp: 400, atk: 22, def: 9,
      story: 'Ein Mönch mit versengten Augenbrauen. Seine Kalkmischungen töten Seuchenbrut – und gelegentlich seine Werkbank.',
      passive: { name: 'Destillat', mods: { 'prod.med': 0.2 }, desc: '+20 % Arznei.' },
      skill: { id: 'kalkbombe', name: 'Kalkbombe', cd: 15, desc: 'Flächenschaden, dreifach gegen Seuchenwesen.' }, pro: 'Gegen Seuche', con: 'Kurze Reichweite', unlock: 'kampagne' },
    { id: 'jorin', name: 'Jorin Nebelpfad', cls: 'kundschafter', rar: 2, col: '#8ab3c9', hp: 360, atk: 20, def: 8,
      story: 'Kennt jeden Pfad durch Moor und Nebel. Spricht wenig und sieht alles.',
      passive: { name: 'Pfadfinder', mods: { 'march.speed': 0.2, scout: 1 }, desc: '+20 % Marschtempo, +1 Sicht.' },
      skill: { id: 'hinterhalt', name: 'Hinterhalt', cd: 22, desc: 'Betäubt die nächste Feindgruppe 3 s lang.' }, pro: 'Schnell, Sicht', con: 'Schwach im Nahkampf', unlock: 'kampagne' },
    { id: 'ysolde', name: 'Gräfin Ysolde Rabenstein', cls: 'taktiker', rar: 4, col: '#b36ab3', hp: 520, atk: 26, def: 14,
      story: 'Verlor ihre Grafschaft an die Graupest und gewann dafür einen kühlen Kopf. Sie plant drei Züge voraus.',
      passive: { name: 'Feldherrin', mods: { 'troop.atk': 0.1 }, desc: '+10 % Angriff aller Truppen.' },
      skill: { id: 'flanke', name: 'Flankenbefehl', cd: 20, desc: 'Reiter und Nahkämpfer verursachen 8 s lang doppelten Schaden.' }, pro: 'Stärkt alle', con: 'Teuer zu verbessern', unlock: 'kampagne' },
    { id: 'brand', name: 'Meister Brand', cls: 'belagerer', rar: 3, col: '#c96a3a', hp: 600, atk: 24, def: 16,
      story: 'Baute früher Mühlräder, heute Rammböcke. Kein Tor ist ihm zu dick.',
      passive: { name: 'Zimmermannsauge', mods: { 'siege.dmg': 0.3 }, desc: '+30 % Schaden gegen Mauern.' },
      skill: { id: 'rammstoss', name: 'Rammstoß', cd: 20, desc: 'Schwerer Treffer gegen Tor oder Mauer (sonst gegen das stärkste Ziel).' }, pro: 'Belagerung', con: 'Langsam', unlock: 'kampagne' },
    { id: 'ottokar', name: 'Ottokar der Graue', cls: 'schild', rar: 4, col: '#8a8a8a', hp: 900, atk: 20, def: 26,
      story: 'Der älteste Wächter der Pestwacht. Er hat drei Seuchenzüge überlebt und kennt den Schwarmfürsten aus alten Liedern.',
      passive: { name: 'Bollwerk', mods: { 'gate.hp': 0.2 }, desc: '+20 % Torstärke.' },
      skill: { id: 'bollwerk', name: 'Letztes Bollwerk', cd: 25, desc: 'Zieht 6 s lang alle Angriffe auf sich und erleidet nur ein Drittel Schaden.' }, pro: 'Verteidigung', con: 'Kaum Angriff', unlock: 'kampagne' },
    { id: 'lene', name: 'Lene Wacholder', cls: 'heiler', rar: 2, col: '#6ab38a', hp: 380, atk: 12, def: 9,
      story: 'Kräuterfrau vom Wacholderhang. Ihre Tees schmecken furchtbar und wirken wunderbar.',
      passive: { name: 'Grüner Daumen', mods: { 'prod.herb': 0.2 }, desc: '+20 % Heilkräuter.' },
      skill: { id: 'dunst', name: 'Kräuterdunst', cd: 14, desc: 'Verbündete regenerieren 6 s lang Lebenspunkte.' }, pro: 'Wirtschaft', con: 'Kampfschwach', unlock: 'gilde', guild: 1, price: { coin: 200, know: 60 } },
    { id: 'sera', name: 'Sera Dornfeld', cls: 'fern', rar: 2, col: '#b38a6a', hp: 400, atk: 30, def: 9,
      story: 'Armbrustmeisterin der Stadtwache von Dornfeld. Trifft, was sich bewegt – und was sich versteckt.',
      passive: { name: 'Durchschlag', mods: { 'tower.dmg': 0.1 }, desc: '+10 % Turmschaden.' },
      skill: { id: 'durchschlag', name: 'Panzerbrecher', cd: 14, desc: 'Ein Bolzen ignoriert Panzerung und trifft hart.' }, pro: 'Gegen Panzer', con: 'Einzelziel', unlock: 'gilde', guild: 2, price: { coin: 320, know: 100 } },
    { id: 'kasimir', name: 'Kasimir Quecksilber', cls: 'alchemist', rar: 3, col: '#6a8ab3', hp: 380, atk: 26, def: 8,
      story: 'Ein reisender Gelehrter mit Dutzenden Phiolen im Mantel. Er sucht die Quelle der Graupest – aus Neugier.',
      passive: { name: 'Gelehrsamkeit', mods: { 'prod.know': 0.15 }, desc: '+15 % Wissen.' },
      skill: { id: 'feuerphiole', name: 'Feuerphiole', cd: 16, desc: 'Setzt eine Feindgruppe in Brand (Schaden über Zeit).' }, pro: 'Forschung', con: 'Zerbrechlich', unlock: 'gilde', guild: 3, price: { coin: 450, know: 180 } },
    { id: 'edda', name: 'Edda Sturmhaupt', cls: 'taktiker', rar: 3, col: '#c94a4a', hp: 560, atk: 30, def: 13,
      story: 'Führte die letzte Reiterschwadron der Mark. Wo sie reitet, wankt die feindliche Linie.',
      passive: { name: 'Sturmreiterin', mods: { 'cav.atk': 0.15 }, desc: '+15 % Angriff der Reiter.' },
      skill: { id: 'sturm', name: 'Sturmangriff', cd: 18, desc: 'Starker Ansturm auf die Fernkämpfer des Gegners.' }, pro: 'Reiterei', con: 'Braucht Reiter', unlock: 'gilde', guild: 4, price: { coin: 600, know: 240 } }
  ];
  PW.HERO = {}; PW.HEROES.forEach(h => { PW.HERO[h.id] = h; });
  PW.TALENTS = { kraft: { name: 'Kraft', desc: '+6 % Angriff je Punkt', max: 5 }, zaeh: { name: 'Zähigkeit', desc: '+8 % Lebenspunkte je Punkt', max: 5 }, fuehrung: { name: 'Führung', desc: '+3 % Angriff der begleitenden Truppen je Punkt', max: 5 } };
  PW.HERO_MAXLV = 30;
  PW.xpFor = lv => Math.round(80 * Math.pow(lv, 1.5));
  PW.ITEMS = [
    { id: 'klinge1', slot: 'waffe', name: 'Geschärfte Klinge', atk: 6, cost: { iron: 30, wood: 10 }, smith: 1 },
    { id: 'klinge2', slot: 'waffe', name: 'Damastklinge', atk: 14, cost: { iron: 80, coin: 60 }, smith: 3 },
    { id: 'klinge3', slot: 'waffe', name: 'Wachtklinge', atk: 26, cost: { iron: 160, coin: 160, know: 40 }, smith: 5 },
    { id: 'ruest1', slot: 'ruestung', name: 'Lederwams', def: 4, hp: 60, cost: { cloth: 20, iron: 10 }, smith: 1 },
    { id: 'ruest2', slot: 'ruestung', name: 'Kettenrüstung', def: 9, hp: 140, cost: { iron: 90, cloth: 30 }, smith: 3 },
    { id: 'ruest3', slot: 'ruestung', name: 'Plattenharnisch', def: 16, hp: 260, cost: { iron: 180, cloth: 50, coin: 120 }, smith: 5 },
    { id: 'tal1', slot: 'talisman', name: 'Salbeiamulett', hp: 50, atk: 2, cost: { herb: 30, cloth: 10 }, smith: 1 },
    { id: 'tal2', slot: 'talisman', name: 'Bernsteinanhänger', hp: 120, atk: 6, cost: { herb: 60, coin: 80 }, smith: 3 },
    { id: 'tal3', slot: 'talisman', name: 'Siegel der Wacht', hp: 220, atk: 12, cost: { med: 60, coin: 200, know: 60 }, smith: 5 }
  ];
  PW.ITEM = {}; PW.ITEMS.forEach(i => { PW.ITEM[i.id] = i; });

  // ---------- Feinde (Wellen) ----------
  PW.ENEMIES = {
    ratte: { name: 'Pestratten', hp: 18, spd: 3.4, armor: 0, dmg: 2, plague: 1, size: 0.35, reward: 1, col: '#5a4a3a' },
    gaenger: { name: 'Fauler Wanderer', hp: 75, spd: 1.5, armor: 2, dmg: 6, plague: 1, size: 0.7, reward: 3, col: '#6a7a5a' },
    bandit: { name: 'Plünderer', hp: 60, spd: 2.1, armor: 4, dmg: 8, plague: 0, size: 0.7, reward: 4, col: '#7a4a3a' },
    bestie: { name: 'Seuchenbestie', hp: 280, spd: 1.15, armor: 9, dmg: 22, plague: 1, size: 1.3, reward: 12, col: '#4a5a3a' },
    kraehe: { name: 'Aaskrähen', hp: 26, spd: 3.8, armor: 0, dmg: 5, plague: 1, fly: 1, size: 0.45, reward: 2, col: '#2a2a33' }
  };
  PW.BOSSES = {
    schwarmfuerst: { name: 'Der Schwarmfürst', hp: 2600, spd: 0.9, armor: 6, dmg: 40, plague: 1, size: 2.6, reward: 200, col: '#3a2f28', spawn: { type: 'ratte', every: 5, n: 4 },
      desc: 'Ein riesiger, verfilzter Rattenkönig auf einer Sänfte aus Unrat. Ruft unablässig neue Schwärme.' },
    faeulnismutter: { name: 'Die Fäulnismutter', hp: 2000, spd: 1.0, armor: 4, dmg: 30, plague: 1, size: 2.2, reward: 160, col: '#4f6a3a', healAura: 14,
      desc: 'Eine aufgedunsene Moorgestalt, deren Atem andere Seuchenwesen heilt.' },
    hauptmann: { name: 'Der Eiserne Hauptmann', hp: 2400, spd: 1.1, armor: 14, dmg: 80, plague: 0, size: 2.0, reward: 180, col: '#555a66', arrowResist: 0.5,
      desc: 'Anführer der Plündererbanden in voller Platte. Pfeile prallen an ihm ab.' }
  };
  PW.BOSS_ORDER = ['faeulnismutter', 'hauptmann', 'schwarmfuerst'];
  PW.WAVES = { first: 420, every: 420, warn: 60, bossEvery: 5, lanes: 3 };

  // ---------- Weltkarte ----------
  PW.BIOMES = {
    ebene: { name: 'Karge Ebene', col: '#a39a6a', cost: 1, plague: 0.05, prod: { food: 2 } },
    wald: { name: 'Wald', col: '#3f6a3a', cost: 1.6, plague: 0.08, prod: { wood: 3, herb: 1 } },
    sumpf: { name: 'Verseuchter Sumpf', col: '#4f5a3f', cost: 2.2, plague: 0.3, prod: { herb: 3 } },
    gebirge: { name: 'Gebirge', col: '#7d7a78', cost: 3, plague: 0.02, prod: { stone: 3, iron: 1.5 } },
    ruinen: { name: 'Verfallene Stadt', col: '#7a6a5f', cost: 1.3, plague: 0.18, prod: { stone: 2, coin: 1 } }
  };
  PW.SITES = {
    res_wood: { name: 'Holzfällerlager', icon: '🪵', prod: { wood: 8 }, gar: 6 },
    res_stone: { name: 'Steinbruch', icon: '🪨', prod: { stone: 6 }, gar: 6 },
    res_iron: { name: 'Erzader', icon: '⛓️', prod: { iron: 4 }, gar: 10 },
    res_herb: { name: 'Kräuterhain', icon: '🌿', prod: { herb: 5 }, gar: 6 },
    res_food: { name: 'Gehöft', icon: '🌾', prod: { food: 8 }, gar: 5 },
    ruin: { name: 'Ruine', icon: '🏚️', gar: 12, loot: 1 },
    village: { name: 'Verlassene Siedlung', icon: '🛖', gar: 0, patients: 1 },
    lair: { name: 'Seuchennest', icon: '☣️', gar: 25, monsters: 1, plagueSrc: 1 },
    trade: { name: 'Handelsplatz', icon: '⚖️', gar: 0, trade: 1 },
    boss: { name: 'Hort einer Seuchenbestie', icon: '💀', gar: 60, monsters: 1, worldBoss: 1 },
    key: { name: 'Schlüsselort', icon: '✴️', gar: 0 },
    capital: { name: 'Hauptstadt', icon: '🏰' }
  };
  PW.MAP_SIZES = { klein: { w: 16, h: 12 }, mittel: { w: 22, h: 16 }, gross: { w: 28, h: 20 } };

  // ---------- Computerfraktionen ----------
  // w: Zielgewichte (Utility-KI): expand, econ, mil, def, research, trade, dipl, aggr, honor, risk
  PW.ARCHETYPES = {
    expansionist: { name: 'Expansionist', w: { expand: 1.6, econ: 1, mil: 1.1, def: 0.7, research: 0.6, trade: 0.6, dipl: 0.6, aggr: 1.1, honor: 0.6, risk: 1.1 } },
    haendler: { name: 'Händler', w: { expand: 0.8, econ: 1.5, mil: 0.7, def: 0.9, research: 0.9, trade: 1.8, dipl: 1.2, aggr: 0.4, honor: 1.1, risk: 0.6 } },
    verteidiger: { name: 'Verteidiger', w: { expand: 0.6, econ: 1.1, mil: 1, def: 1.8, research: 0.9, trade: 0.8, dipl: 1.1, aggr: 0.3, honor: 1.5, risk: 0.4 } },
    forscher: { name: 'Forscher', w: { expand: 0.7, econ: 1.1, mil: 0.7, def: 1, research: 1.9, trade: 1, dipl: 1.1, aggr: 0.3, honor: 1.2, risk: 0.5 } },
    opportunist: { name: 'Opportunist', w: { expand: 1.1, econ: 1, mil: 1.1, def: 0.8, research: 0.8, trade: 0.9, dipl: 0.9, aggr: 1, honor: 0.3, risk: 1.2, opp: 1 } },
    eroberer: { name: 'Eroberer', w: { expand: 1.2, econ: 0.9, mil: 1.8, def: 0.8, research: 0.6, trade: 0.4, dipl: 0.4, aggr: 1.7, honor: 0.7, risk: 1.4 } },
    diplomat: { name: 'Diplomat', w: { expand: 0.7, econ: 1.1, mil: 0.8, def: 1, research: 1, trade: 1.2, dipl: 2, aggr: 0.3, honor: 1.6, risk: 0.5 } },
    ueberleben: { name: 'Überlebenskünstler', w: { expand: 0.6, econ: 1.3, mil: 1, def: 1.3, research: 0.8, trade: 0.9, dipl: 0.9, aggr: 0.5, honor: 1, risk: 0.3 } }
  };
  PW.FACTIONS = [
    { id: 'morvain', name: 'Haus Morvain', arch: 'eroberer', col: '#b8393a', emblem: '⚔️', leader: 'Graf Albrecht Morvain', style: 'festung', hero: { name: 'Ritter Gunther Schwarzhelm', atk: 30, def: 18, hp: 700 } },
    { id: 'salz', name: 'Bund der Salzhändler', arch: 'haendler', col: '#d6a637', emblem: '⚖️', leader: 'Meisterin Talea Grau', style: 'kontor', hero: { name: 'Söldnerführer Ruprecht', atk: 24, def: 14, hp: 560 } },
    { id: 'lichtwall', name: 'Orden vom Lichten Wall', arch: 'verteidiger', col: '#5a7fc9', emblem: '🛡️', leader: 'Komtur Bertram Hellweg', style: 'festung', hero: { name: 'Schwester Agnes Weißdorn', atk: 20, def: 26, hp: 820 } },
    { id: 'ilse', name: 'Kollegium von Sankt Ilse', arch: 'forscher', col: '#4fb38a', emblem: '📖', leader: 'Magistra Odila Fenn', style: 'kloster', hero: { name: 'Gelehrter Matthis Kalk', atk: 22, def: 12, hp: 480 } },
    { id: 'raben', name: 'Die Rabengilde', arch: 'opportunist', col: '#7a52a0', emblem: '🐦‍⬛', leader: 'Der Graue Fürsprecher', style: 'kontor', hero: { name: 'Klinge Nachtschatt', atk: 32, def: 10, hp: 500 } },
    { id: 'hohenweid', name: 'Freie Mark Hohenweid', arch: 'expansionist', col: '#d0763a', emblem: '🗻', leader: 'Vögtin Hedda Steinfurt', style: 'dorf', hero: { name: 'Hauptfrau Runa Eschen', atk: 26, def: 16, hp: 620 } },
    { id: 'bruecken', name: 'Rat der Brücken', arch: 'diplomat', col: '#3ab0c9', emblem: '🌉', leader: 'Sprecher Lukan Weidner', style: 'kontor', hero: { name: 'Gesandter Fabian Roth', atk: 18, def: 16, hp: 520 } },
    { id: 'moor', name: 'Die Moorläufer', arch: 'ueberleben', col: '#7d9a3a', emblem: '🌾', leader: 'Wirz der Alte', style: 'dorf', hero: { name: 'Fährtenleserin Ilka', atk: 24, def: 12, hp: 500 } }
  ];
  PW.FAC = {}; PW.FACTIONS.forEach(f => { PW.FAC[f.id] = f; });
  PW.DIFFICULTY = {
    entspannt: { name: 'Entspannt', noise: 0.55, think: 40, aggrPlayer: 0.5, wave: 0.7, insight: 0.6 },
    normal: { name: 'Normal', noise: 0.3, think: 30, aggrPlayer: 0.8, wave: 1, insight: 0.8 },
    anspruchsvoll: { name: 'Anspruchsvoll', noise: 0.15, think: 22, aggrPlayer: 1, wave: 1.25, insight: 0.92 },
    experte: { name: 'Strategisch/Experte', noise: 0.05, think: 16, aggrPlayer: 1.15, wave: 1.5, insight: 1 }
  };
  // Bot-Gebäude (vereinfachte, aber konsistente Wirtschaft: gleiche Kosten wie beim Spieler)
  PW.BOT_BLD = {
    farm: { prod: { food: 15, cloth: 1.2 } }, saege: { prod: { wood: 13 } }, steinbruch: { prod: { stone: 9 } }, mine: { prod: { iron: 5 } },
    kraeuter: { prod: { herb: 7 } }, apotheke: { prod: { med: 2.5 }, use: { herb: 5 } }, brunnen: { prod: { water: 16 } }, markt: { prod: { coin: 5 } },
    akademie: { prod: { know: 5 } }, kaserne: {}, mauer: {}, heilstube: {}, haus: {}
  };

  // ---------- Ereignisse ----------
  PW.EVENTS = [
    { id: 'epidemie', name: 'Neue Epidemie', icon: '☣️', w: 1, dur: 180, desc: 'Ein neuer Ausbruch: Ansteckung in der Zuflucht 3 Minuten lang verdoppelt.' },
    { id: 'fluechtlinge', name: 'Flüchtlingswelle', icon: '🧳', w: 1.2, desc: 'Überlebende stehen vor dem Tor. Aufnehmen bringt Bewohner (einige davon krank).', choice: 1 },
    { id: 'lieferung', name: 'Verspätete Lieferung', icon: '📦', w: 0.8, desc: 'Ein Händlerkonvoi trifft verspätet ein: Waren gegen Münzen.', choice: 1 },
    { id: 'ader', name: 'Reiche Erzader', icon: '⛏️', w: 0.7, dur: 300, desc: 'Bergleute stoßen auf eine reiche Ader: +60 % Eisen für 5 Minuten.' },
    { id: 'winter', name: 'Harter Winter', icon: '❄️', w: 0.8, dur: 240, desc: 'Bittere Kälte: Bewohner essen 4 Minuten lang 40 % mehr.' },
    { id: 'haendler', name: 'Wandernder Händler', icon: '🐪', w: 1, desc: 'Ein Händler bietet seltene Arznei an.', choice: 1 },
    { id: 'ueberfall', name: 'Banditenüberfall', icon: '🗡️', w: 0.8, desc: 'Plünderer nähern sich der Zuflucht! Eine kleine Welle greift in 45 s an.' },
    { id: 'durchbruch', name: 'Heilmittel-Durchbruch', icon: '💡', w: 0.7, desc: 'Eine Heilerin entdeckt eine neue Rezeptur: +80 Wissen und +20 Arznei.' }
  ];
  PW.EVENT = {}; PW.EVENTS.forEach(e => { PW.EVENT[e.id] = e; });
  PW.SEASONS = [   // lokaler Kalender, abschaltbar
    { id: 'erntedank', name: 'Erntedank', from: '09-20', to: '10-31', mods: { 'prod.food': 0.15 }, desc: '+15 % Nahrung' },
    { id: 'lichterfest', name: 'Lichterfest', from: '12-01', to: '12-31', mods: { sat: 6 }, desc: '+6 Zufriedenheit' },
    { id: 'fruehling', name: 'Frühlingserwachen', from: '03-15', to: '04-30', mods: { 'prod.herb': 0.2 }, desc: '+20 % Heilkräuter' },
    { id: 'sommer', name: 'Mittsommer', from: '06-15', to: '07-15', mods: { 'prod.coin': 0.1 }, desc: '+10 % Münzen' }
  ];

  // ---------- Tägliche / wöchentliche Aufgaben (aus dem Datum, ohne Server) ----------
  PW.QUESTS = [
    { id: 'heilen', name: 'Heile {n} Patienten', stat: 'cured', n: [6, 12, 20], reward: { med: 20, coin: 60 } },
    { id: 'holz', name: 'Sammle {n} Holz', stat: 'prod.wood', n: [300, 600, 1000], reward: { coin: 50, stone: 80 } },
    { id: 'nahrung', name: 'Erzeuge {n} Nahrung', stat: 'prod.food', n: [300, 600, 1000], reward: { coin: 50, herb: 40 } },
    { id: 'bauen', name: 'Schließe {n} Bauaufträge ab', stat: 'built', n: [3, 5, 8], reward: { wood: 120, stone: 120 } },
    { id: 'welle', name: 'Wehre {n} Welle(n) ab', stat: 'waves', n: [1, 2, 3], reward: { iron: 60, coin: 80 } },
    { id: 'rekrut', name: 'Bilde {n} Soldaten aus', stat: 'recruited', n: [10, 20, 40], reward: { food: 150, coin: 60 } },
    { id: 'expedition', name: 'Schließe {n} Expedition(en) ab', stat: 'expeditions', n: [1, 2, 4], reward: { know: 60, coin: 60 } },
    { id: 'forschung', name: 'Erforsche {n} Technik(en)', stat: 'researched', n: [1, 2, 3], reward: { know: 80 } },
    { id: 'handel', name: 'Liefere {n} Karawane(n) aus', stat: 'trades', n: [1, 2, 3], reward: { coin: 120 } }
  ];

  // ---------- Erfolge ----------
  PW.ACH = [
    { id: 'erstbau', icon: '🔨', title: 'Erster Stein', desc: 'Schließe deinen ersten Bau ab.', stat: 'built', n: 1 },
    { id: 'bau50', icon: '🏗️', title: 'Baumeister', desc: 'Schließe 50 Bauaufträge ab.', stat: 'built', n: 50 },
    { id: 'heil1', icon: '🩹', title: 'Erste Heilung', desc: 'Heile deinen ersten Patienten.', stat: 'cured', n: 1 },
    { id: 'heil100', icon: '🌿', title: 'Pestheilerin', desc: 'Heile 100 Patienten.', stat: 'cured', n: 100 },
    { id: 'heil500', icon: '⚕️', title: 'Schutzpatronin', desc: 'Heile 500 Patienten.', stat: 'cured', n: 500 },
    { id: 'welle1', icon: '🛡️', title: 'Das Tor hält', desc: 'Wehre deine erste Welle ab.', stat: 'waves', n: 1 },
    { id: 'welle20', icon: '🏰', title: 'Unbezwingbar', desc: 'Wehre 20 Wellen ab.', stat: 'waves', n: 20 },
    { id: 'boss1', icon: '💀', title: 'Bestienbezwinger', desc: 'Besiege einen Boss.', stat: 'bosses', n: 1 },
    { id: 'schwarm', icon: '👑', title: 'Fall des Schwarmfürsten', desc: 'Besiege den Schwarmfürsten.', stat: 'swarmlord', n: 1 },
    { id: 'sieg1', icon: '⚔️', title: 'Erste Schlacht', desc: 'Gewinne eine Schlacht auf der Weltkarte.', stat: 'battlesWon', n: 1 },
    { id: 'sieg25', icon: '🎖️', title: 'Feldherr', desc: 'Gewinne 25 Schlachten.', stat: 'battlesWon', n: 25 },
    { id: 'gebiet10', icon: '🗺️', title: 'Landesherr', desc: 'Besitze 10 Regionen gleichzeitig.', stat: 'maxTiles', n: 10 },
    { id: 'buendnis', icon: '🤝', title: 'Verbündet', desc: 'Schließe ein Bündnis mit einer Computerfraktion.', stat: 'alliances', n: 1 },
    { id: 'frieden', icon: '🕊️', title: 'Friedensstifter', desc: 'Schließe Frieden nach einem Krieg.', stat: 'peaces', n: 1 },
    { id: 'handel10', icon: '🐪', title: 'Karawanenmeister', desc: 'Liefere 10 Karawanen aus.', stat: 'trades', n: 10 },
    { id: 'helden6', icon: '⭐', title: 'Heldenrunde', desc: 'Versammle 6 Helden.', stat: 'heroes', n: 6 },
    { id: 'helden12', icon: '🌟', title: 'Alle Zwölf', desc: 'Versammle alle 12 Helden.', stat: 'heroes', n: 12 },
    { id: 'forsch12', icon: '📜', title: 'Gelehrte Zuflucht', desc: 'Erforsche 12 Techniken.', stat: 'researched', n: 12 },
    { id: 'heilmittel', icon: '💡', title: 'Das Heilmittel', desc: 'Erforsche „Das Heilmittel“.', stat: 'cure', n: 1 },
    { id: 'pop100', icon: '👪', title: 'Lebendige Zuflucht', desc: 'Erreiche 100 Bewohner.', stat: 'maxPop', n: 100 },
    { id: 'kapitel5', icon: '📖', title: 'Die letzte Zuflucht', desc: 'Schließe die Kampagne ab.', stat: 'campaign', n: 1 },
    { id: 'eroberung', icon: '🏰', title: 'Festungsbrecher', desc: 'Erobere eine feindliche Hauptstadt.', stat: 'capitals', n: 1 }
  ];

  PW.CREDITS = [
    'Spielidee, Gestaltung, Programmierung: RicoReWi × AnMaCha mit Claude',
    'Grafik: vollständig im Browser erzeugt (Three.js r128, MIT-Lizenz)',
    'Klänge und Musik: im Browser per WebAudio erzeugt',
    'Alle Figuren, Fraktionen, Orte und Texte sind eigene Erfindungen.',
    'Inspiriert vom Genre der Pest-Überlebensstrategie – kein Bezug zu bestehenden Spielen.'
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
