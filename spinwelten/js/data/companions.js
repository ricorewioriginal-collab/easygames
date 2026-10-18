/* Spinwelten 3D – 12 Begleiter. Wirkung je Stufe (1–10) als Zahl; game/companions.js wendet sie an.
 * Ein Begleiter ist AKTIV (volle Wirkung), ein zweiter kann als HELFER mitlaufen (halbe Wirkung).
 * unlock: Bedingung über einen Spielzähler (stats) – alles im Spiel erreichbar, nichts kaufbar. */
(function (SW) {
  'use strict';
  SW.COMPANIONS = [
    { id: 'kivi',  shape: 'kivi',   col: '#3fd8e8', col2: '#f2d08a', effect: 'relics',  per: 0.06, unlock: null,
      name: { de: 'Kivi', en: 'Kivi' }, skill: { de: 'Findet Bonusrelikte bei jedem Spin', en: 'Finds bonus relics on every spin' } },
    { id: 'glim',  shape: 'crystal', col: '#7fe8ff', col2: '#4b7bff', effect: 'crystal', per: 0.05, unlock: { stat: 'islands', n: 1 },
      name: { de: 'Glim', en: 'Glim' }, skill: { de: 'Verstärkt Kristall- und Sonnenfunde', en: 'Boosts crystal and sun finds' } },
    { id: 'mira',  shape: 'fox',    col: '#ff9d5c', col2: '#fff1d6', effect: 'raid',    per: 0.04, unlock: { stat: 'raids', n: 3 },
      name: { de: 'Mira', en: 'Mira' }, skill: { de: 'Mehr Beute bei Schatzexpeditionen, zeigt ab Stufe 3 eine Fundstelle', en: 'More expedition loot, reveals a spot from level 3' } },
    { id: 'runo',  shape: 'golem',  col: '#8fa6b8', col2: '#7dffcf', effect: 'guard',   per: 0.03, unlock: { stat: 'blocks', n: 2 },
      name: { de: 'Runo', en: 'Runo' }, skill: { de: 'Ein Schutzorb mehr Platz und Chance, Stürme abzuwehren', en: 'One more shield slot and a chance to deflect storms' } },
    { id: 'blixi', shape: 'spark',  col: '#c58bff', col2: '#ffe066', effect: 'storm',   per: 0.06, unlock: { stat: 'attacks', n: 4 },
      name: { de: 'Blixi', en: 'Blixi' }, skill: { de: 'Mehr Münzen bei Sturmangriffen', en: 'More coins from storm attacks' } },
    { id: 'mokka', shape: 'robot',  col: '#c08a5a', col2: '#3fd8e8', effect: 'discount', per: 0.02, unlock: { stat: 'builds', n: 25 },
      name: { de: 'Mokka', en: 'Mokka' }, skill: { de: 'Werkstatt-Rabatt auf alle Ausbauten', en: 'Workshop discount on all upgrades' } },
    { id: 'nori',  shape: 'owl',    col: '#6b7bd8', col2: '#f2d08a', effect: 'cards',   per: 0.05, unlock: { stat: 'cards', n: 20 },
      name: { de: 'Nori', en: 'Nori' }, skill: { de: 'Chance auf eine Zusatzkarte in Truhen', en: 'Chance for an extra card in chests' } },
    { id: 'ferdi', shape: 'beaver', col: '#a8703f', col2: '#ffc94a', effect: 'buildbonus', per: 0.05, unlock: { stat: 'islands', n: 5 },
      name: { de: 'Ferdi', en: 'Ferdi' }, skill: { de: 'Bonusmünzen, wenn ein Bauwerk fertig wird', en: 'Bonus coins when a building is finished' } },
    { id: 'zuna',  shape: 'jelly',  col: '#b6a8ff', col2: '#ffffff', effect: 'regen',   per: 0.05, unlock: { stat: 'spins', n: 400 },
      name: { de: 'Zuna', en: 'Zuna' }, skill: { de: 'Spin-Energie lädt schneller nach', en: 'Spin energy refills faster' } },
    { id: 'plumi', shape: 'bird',   col: '#ff7a6b', col2: '#ffd98a', effect: 'chestfind', per: 0.008, unlock: { stat: 'chests', n: 8 },
      name: { de: 'Plumi', en: 'Plumi' }, skill: { de: 'Entdeckt beim Drehen seltene Truhen', en: 'Discovers rare chests while spinning' } },
    { id: 'orbit', shape: 'planet', col: '#2ec4a6', col2: '#ff8ae0', effect: 'event',   per: 0.08, unlock: { stat: 'event_points', n: 400 },
      name: { de: 'Orbit', en: 'Orbit' }, skill: { de: 'Mehr Eventpunkte', en: 'More event points' } },
    { id: 'soli',  shape: 'sunflower', col: '#ffc94a', col2: '#2ec4a6', effect: 'island', per: 0.12, unlock: { stat: 'islands', n: 10 },
      name: { de: 'Soli', en: 'Soli' }, skill: { de: 'Größere Belohnung beim Inselabschluss', en: 'Bigger island completion reward' } }
  ];
  SW.COMP_MAX_LVL = 10;
})(globalThis.SW = globalThis.SW || {});
