// Items. Every item has a working, testable effect in logic/items.js.
// category: ball | heal | status | battle | evo | key
export const ITEMS = {
  taschiball:   { name: 'Taschiball', category: 'ball', price: 40, rate: 1, desc: 'Standardball zum Fangen wilder Taschis.' },
  superball:    { name: 'Superball', category: 'ball', price: 120, rate: 1.5, desc: 'Fängt besser als ein Taschiball.', unlock: 4 },
  sternball:    { name: 'Sternball', category: 'ball', price: 300, rate: 2.2, desc: 'Hochwertiger Ball für erfahrene Trainer.', unlock: 9 },
  trank:        { name: 'Trank', category: 'heal', price: 30, heal: 35, desc: 'Stellt 35 KP wieder her.' },
  supertrank:   { name: 'Supertrank', category: 'heal', price: 90, heal: 90, desc: 'Stellt 90 KP wieder her.', unlock: 5 },
  vitaltrank:   { name: 'Vitaltrank', category: 'heal', price: 220, heal: 9999, desc: 'Stellt alle KP wieder her.', unlock: 10 },
  belebungskraut: { name: 'Belebungskraut', category: 'heal', price: 280, revive: 0.5, desc: 'Belebt ein erschöpftes Taschi mit halben KP.', unlock: 3 },
  heilkraut:    { name: 'Heilkraut', category: 'status', price: 60, cure: 'all', desc: 'Heilt jede Statusveränderung.' },
  apfelsaft:    { name: 'Apfelsaft', category: 'heal', price: 0, heal: 20, sellOnly: true, desc: 'Süßer Saft, stellt 20 KP wieder her.' },
  aetherperle:  { name: 'Ätherperle', category: 'heal', price: 180, pp: 10, desc: 'Füllt bei allen Attacken eines Taschis 10 AP auf.', unlock: 6 },
  angriffsplus: { name: 'Kraftpulver', category: 'battle', price: 100, stat: 'atk', stages: 1, desc: 'Erhöht im Kampf den Angriff.', unlock: 2 },
  schutzplus:   { name: 'Schutzpulver', category: 'battle', price: 100, stat: 'def', stages: 1, desc: 'Erhöht im Kampf die Verteidigung.', unlock: 2 },
  kristallsplitter: { name: 'Kristallsplitter', category: 'evo', price: 0, desc: 'Lässt bestimmte Kristall-Taschis sich entwickeln.' },
  eiskristall:  { name: 'Eiskristall', category: 'evo', price: 0, desc: 'Lässt bestimmte Polar-Taschis sich entwickeln.' },
  sternsplitter:{ name: 'Sternsplitter', category: 'evo', price: 0, sell: 400, desc: 'Funkelt geheimnisvoll. Händler zahlen gut dafür.' },
  // key items
  pfadkarte:    { name: 'Pfadkarte', category: 'key', desc: 'Zeigt alle Regionen und deinen Fortschritt.' },
  gildenschluessel: { name: 'Gildenschlüssel', category: 'key', desc: 'Öffnet das Tor der Forschungsstation im Glutland.' },
  brixcode:     { name: 'Brix’ Zugangskarte', category: 'key', desc: 'Ein Schlüsselchip, mit dem sich die Sperre am Sternengipfel lösen lässt.' },
  mondlaterne:  { name: 'Mondlaterne', category: 'key', desc: 'Leuchtet versteckte Wege im Nebelmoor aus.' },
  kletterhaken: { name: 'Kletterhaken', category: 'key', desc: 'Ermöglicht das Erklimmen markierter Felswände.' }
};

export const ITEM_ORDER = Object.keys(ITEMS);
export const CATEGORY_NAMES = { ball: 'Bälle', heal: 'Heilung', status: 'Status', battle: 'Kampf', evo: 'Entwicklung', key: 'Basis-Items' };

export function sellPrice(id) {
  const it = ITEMS[id];
  if (!it || it.category === 'key') return 0;
  if (it.sell) return it.sell;
  return Math.floor((it.price || 20) / 2);
}

export function shopStock(badges) {
  return ITEM_ORDER.filter(id => {
    const it = ITEMS[id];
    return it.price > 0 && !it.sellOnly && it.category !== 'key' && it.category !== 'evo' && (it.unlock || 0) <= badges;
  });
}
