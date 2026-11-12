// Items. Every item has a working, testable effect in logic/items.js.
// category: ball | heal | status | battle | evo | growth | held | key
export const ITEMS = {
  taschiball:   { name: 'Taschi-Kapsel', category: 'ball', price: 40, rate: 1, color: 0xe9523f, desc: 'Standardkapsel zum Fangen wilder Taschis.' },
  heilball:     { name: 'Heilkapsel', category: 'ball', price: 60, rate: 1, color: 0xf48fb8, healOnCatch: true, desc: 'Gefangene Taschis sind sofort vollständig geheilt.' },
  superball:    { name: 'Superkapsel', category: 'ball', price: 120, rate: 1.5, color: 0x3a7fd0, desc: 'Fängt besser als ein Taschi-Kapsel.', unlock: 1 },
  netzball:     { name: 'Netzkapsel', category: 'ball', price: 150, rate: 1, color: 0x2fb7a8, bonusTypes: ['wasser', 'pflanze'], bonus: 3, desc: 'Dreifache Fangchance bei Wasser- und Pflanzen-Taschis.', unlock: 2 },
  flinkball:    { name: 'Flinkkapsel', category: 'ball', price: 180, rate: 1, color: 0xffc83a, firstTurn: 4, desc: 'In der ersten Kampfrunde vierfache Fangchance, danach schwach.', unlock: 2 },
  daemmerball:  { name: 'Dämmerkapsel', category: 'ball', price: 160, rate: 1, color: 0x3d4a3a, dark: 3, desc: 'Dreifache Fangchance nachts und in Höhlen.', unlock: 3 },
  freundball:   { name: 'Freundkapsel', category: 'ball', price: 150, rate: 1, color: 0x7ccf5a, friendship: 160, desc: 'Gefangene Taschis vertrauen dir sofort. Freundschaft beschleunigt das Lernen.', unlock: 4 },
  levelball:    { name: 'Levelkapsel', category: 'ball', price: 200, rate: 1, color: 0xf07a2a, levelBased: true, desc: 'Je höher dein Taschi im Vergleich zum Gegner, desto besser (bis vierfach).', unlock: 5 },
  timerball:    { name: 'Timerkapsel', category: 'ball', price: 200, rate: 1, color: 0xf2f2f2, timer: true, desc: 'Wird mit jeder Kampfrunde besser (bis vierfach).', unlock: 6 },
  sternball:    { name: 'Sternkapsel', category: 'ball', price: 300, rate: 2.2, color: 0x3a3048, desc: 'Hochwertige Kapsel für erfahrene Trainer.', unlock: 7 },
  meisterball:  { name: 'Meisterkapsel', category: 'ball', price: 0, rate: 255, color: 0x8a4ad0, master: true, noSell: true, desc: 'Fängt jedes wilde Taschi ohne Fehlschlag. Ein einmaliges Geschenk.' },
  trank:        { name: 'Trank', category: 'heal', price: 30, heal: 35, desc: 'Stellt 35 KP wieder her.' },
  supertrank:   { name: 'Supertrank', category: 'heal', price: 90, heal: 90, desc: 'Stellt 90 KP wieder her.', unlock: 5 },
  vitaltrank:   { name: 'Vitaltrank', category: 'heal', price: 220, heal: 9999, desc: 'Stellt alle KP wieder her.', unlock: 10 },
  belebungskraut: { name: 'Belebungskraut', category: 'heal', price: 280, revive: 0.5, desc: 'Belebt ein erschöpftes Taschi mit halben KP.', unlock: 3 },
  levelbonbon:  { name: 'EP-Bonbon', category: 'growth', price: 0, sell: 300, desc: 'Ein Taschi steigt sofort um ein Level auf.' },
  heilkraut:    { name: 'Heilkraut', category: 'status', price: 60, cure: 'all', desc: 'Heilt jede Statusveränderung.' },
  apfelsaft:    { name: 'Apfelsaft', category: 'heal', price: 0, heal: 20, sellOnly: true, desc: 'Süßer Saft, stellt 20 KP wieder her.' },
  aetherperle:  { name: 'Ätherperle', category: 'heal', price: 180, pp: 10, desc: 'Füllt bei allen Attacken eines Taschis 10 AP auf.', unlock: 6 },
  angriffsplus: { name: 'Kraftpulver', category: 'battle', price: 100, stat: 'atk', stages: 1, desc: 'Erhöht im Kampf den Angriff.', unlock: 2 },
  schutzplus:   { name: 'Schutzpulver', category: 'battle', price: 100, stat: 'def', stages: 1, desc: 'Erhöht im Kampf die Verteidigung.', unlock: 2 },
  kristallsplitter: { name: 'Kristallsplitter', category: 'evo', price: 0, desc: 'Lässt bestimmte Kristall-Taschis sich entwickeln.' },
  eiskristall:  { name: 'Eiskristall', category: 'evo', price: 0, desc: 'Lässt bestimmte Polar-Taschis sich entwickeln.' },
  sternsplitter:{ name: 'Sternsplitter', category: 'evo', price: 0, sell: 400, desc: 'Funkelt geheimnisvoll. Händler zahlen gut dafür.' },
  // getragene Gegenstände: ein Taschi trägt einen davon und er wirkt im Kampf von selbst (Beeren werden dabei verbraucht)
  heilbeere:    { name: 'Heilbeere', category: 'held', price: 80, held: { healAt: 0.5, heal: 0.25, once: true }, desc: 'Getragen: Fällt das Taschi auf die Hälfte seiner KP, isst es die Beere und erhält ein Viertel zurück.', unlock: 1 },
  klarbeere:    { name: 'Klarbeere', category: 'held', price: 90, held: { cure: true, once: true }, desc: 'Getragen: Heilt sofort Verbrennung, Gift, Schlaf, Paralyse oder Frost – einmalig.', unlock: 2 },
  lernband:     { name: 'Lernband', category: 'held', price: 450, held: { xp: 1.5 }, desc: 'Getragen: Das Taschi erhält 50 % mehr EP.', unlock: 3 },
  kraftband:    { name: 'Kraftband', category: 'held', price: 500, held: { power: 1.1 }, desc: 'Getragen: Angriffs-Attacken richten 10 % mehr Schaden an.', unlock: 4 },
  fokusband:    { name: 'Fokusband', category: 'held', price: 600, held: { endure: true, once: true }, desc: 'Getragen: Bei vollen KP übersteht das Taschi einen sonst entscheidenden Treffer mit 1 KP – einmalig.', unlock: 6 },
  // key items
  pfadkarte:    { name: 'Pfadkarte', category: 'key', desc: 'Zeigt alle Regionen und deinen Fortschritt.' },
  gildenschluessel: { name: 'Gildenschlüssel', category: 'key', desc: 'Öffnet das Tor der Forschungsstation im Glutland.' },
  brixcode:     { name: 'Brix’ Zugangskarte', category: 'key', desc: 'Ein Schlüsselchip, mit dem sich die Sperre am Sternengipfel lösen lässt.' },
  mondlaterne:  { name: 'Mondlaterne', category: 'key', desc: 'Leuchtet versteckte Wege im Nebelmoor aus.' },
  kletterhaken: { name: 'Kletterhaken', category: 'key', desc: 'Ermöglicht das Erklimmen markierter Felswände.' },
  angel:        { name: 'Angel', category: 'key', desc: 'Am Ufer auswerfen: Wasser-Taschis beißen an. Drück im richtigen Moment, wenn es zieht!' }
};

export const ITEM_ORDER = Object.keys(ITEMS);
export const HELD_IDS = ITEM_ORDER.filter(id => ITEMS[id].category === 'held');
export const BALL_IDS = ITEM_ORDER.filter(id => ITEMS[id].category === 'ball');
export const CATEGORY_NAMES = { ball: 'Kapseln', heal: 'Heilung', status: 'Status', battle: 'Kampf', evo: 'Entwicklung', growth: 'Wachstum', held: 'Zum Tragen', key: 'Basis-Items' };

export function sellPrice(id) {
  const it = ITEMS[id];
  if (!it || it.category === 'key' || it.noSell) return 0;
  if (it.sell) return it.sell;
  return Math.floor((it.price || 20) / 2);
}

export function shopStock(badges) {
  return ITEM_ORDER.filter(id => {
    const it = ITEMS[id];
    return it.price > 0 && !it.sellOnly && it.category !== 'key' && it.category !== 'evo' && (it.unlock || 0) <= badges;
  });
}
