/* Spinwelten 3D – Runenmaschine: Symbole, Walzengewichte und Gewinnplan (datengetrieben, öffentlich dokumentiert).
 * Zufallsmodell (Ergebnistabelle, wie bei Walzenspielen üblich, aber offen gelegt):
 *   Ein Spin zieht genau EINE Zeile aus OUTCOMES mit Wahrscheinlichkeit w/1000.
 *   - three:<symbol>  -> drei gleiche Symbole
 *   - two:<symbol>    -> zwei gleiche; das dritte Symbol wird gleichverteilt aus den übrigen 9 gezogen, Position gleichverteilt
 *   - mixed           -> drei verschiedene Symbole, gleichverteilt
 * Auswertung: "three" bzw. "two" des Symbols; bei "two" und "mixed" bringt jedes Einzelsymbol zusätzlich seinen "one"-Wert.
 * Münzen sind Vielfache von "Basis" (abhängig von der Insel, siehe economy.js) und werden mit dem Multiplikator malgenommen.
 * Keine versteckte Steuerung: Die Gewichte sind fest, kein "Beinahe-Gewinn"-Nachschieben, keine Anpassung an den Kontostand. */
(function (SW) {
  'use strict';
  // id, Zeichen (nur Fallback), Farben fürs selbst gezeichnete Symbol
  const SYMBOLS = [
    { id: 'sun',     glyph: '☼', name: { de: 'Sonnenrune', en: 'Sun rune' }, col: '#ffc94a', col2: '#ff8a3d' },
    { id: 'star',    glyph: '✦', name: { de: 'Sternkristall', en: 'Star crystal' }, col: '#7fe8ff', col2: '#4b7bff' },
    { id: 'gear',    glyph: '⚙', name: { de: 'Zahnrad', en: 'Gear' }, col: '#e3b46a', col2: '#9a6a2a' },
    { id: 'storm',   glyph: '☄', name: { de: 'Sturmrune', en: 'Storm rune' }, col: '#c58bff', col2: '#5a3df0' },
    { id: 'compass', glyph: '◈', name: { de: 'Kompass', en: 'Compass' }, col: '#ffd98a', col2: '#2ec4a6' },
    { id: 'orb',     glyph: '◉', name: { de: 'Schutzorb', en: 'Shield orb' }, col: '#7dffcf', col2: '#1f9e8a' },
    { id: 'loop',    glyph: '↻', name: { de: 'Energieschleife', en: 'Energy loop' }, col: '#9fd0ff', col2: '#3a6fd8' },
    { id: 'relic',   glyph: '❖', name: { de: 'Relikt', en: 'Relic' }, col: '#ff9e8a', col2: '#d0465e' },
    { id: 'portal',  glyph: '✧', name: { de: 'Portalfunke', en: 'Portal spark' }, col: '#ff8ae0', col2: '#7a3df0' },
    { id: 'wonder',  glyph: '✪', name: { de: 'Wunderrune', en: 'Wonder rune' }, col: '#fff1a8', col2: '#ffb000' }
  ];
  // Gewinnplan. coins = Vielfaches der Basis; weitere Felder = Aktion/Gegenstände
  const PAY = {
    sun:     { three: { coins: 20 },                      two: { coins: 4 },  one: { coins: 1 } },
    star:    { three: { coins: 60, xp: 30 },              two: { coins: 10, xp: 5 }, one: { coins: 2 } },
    gear:    { three: { coins: 8, material: 3 },          two: { material: 1 } },
    storm:   { three: { action: 'attack' },               two: { coins: 2 } },
    compass: { three: { action: 'raid' },                 two: { coins: 3 } },
    orb:     { three: { shield: 1 },                      two: { coins: 1 } },
    loop:    { three: { spins: 10 },                      two: { spins: 2 } },
    relic:   { three: { chest: 'silber' },                two: { relics: 5 } },
    portal:  { three: { event: 30, ticket: 1 },           two: { event: 8 } },
    wonder:  { three: { coins: 500, jackpot: true },      two: { coins: 25 }, one: { coins: 2 } }
  };
  // Ergebnistabelle: Gewichte von 1000 (three = drei gleiche, two = zwei gleiche)
  const W3 = { sun: 60, star: 25, gear: 35, storm: 70, compass: 55, orb: 45, loop: 30, relic: 30, portal: 30, wonder: 4 };
  const W2 = { sun: 120, star: 50, gear: 60, storm: 30, compass: 30, orb: 30, loop: 40, relic: 50, portal: 50, wonder: 12 };
  const OUTCOMES = [];
  for (const k in W3) OUTCOMES.push({ type: 'three', sym: k, w: W3[k] });
  for (const k in W2) OUTCOMES.push({ type: 'two', sym: k, w: W2[k] });
  OUTCOMES.push({ type: 'mixed', sym: null, w: 1000 - Object.values(W3).concat(Object.values(W2)).reduce((a, b) => a + b, 0) });
  // Multiplikatoren: Freischaltung über abgeschlossene Inseln, Einsatz kostet m Spin-Energie
  const MULTS = [
    { m: 1, island: 0 }, { m: 2, island: 1 }, { m: 3, island: 2 }, { m: 5, island: 3 },
    { m: 10, island: 5 }, { m: 25, island: 8 }, { m: 50, island: 12 }
  ];
  SW.REELS = { SYMBOLS, PAY, MULTS, OUTCOMES, count: 3 };
})(globalThis.SW = globalThis.SW || {});
