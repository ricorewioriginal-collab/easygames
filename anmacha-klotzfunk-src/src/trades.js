// Handel mit Dorfbewohnern: Tauschangebote je Beruf, gleiches Format wie Rezepte (give, need), ohne Station.
import { B } from './blocks.js';
import { I } from './items.js';

export const TRADES = {
  bauer: [
    { give: [I.APPLE, 4], need: [[I.WHEAT, 4]] },
    { give: [I.SEEDS, 6], need: [[I.BREAD, 1]] },
    { give: [I.BREAD, 2], need: [[B.WOOD, 3]] },
    { give: [I.COPPER_INGOT, 1], need: [[I.WHEAT, 10]] }
  ],
  schmied: [
    { give: [I.IRON_INGOT, 1], need: [[B.COAL, 6]] },
    { give: [I.STONE_PICK, 1], need: [[I.WHEAT, 4]] },
    { give: [I.COPPER_HELMET, 1], need: [[I.COPPER_INGOT, 3], [I.BREAD, 2]] },
    { give: [I.IRON_PICK, 1], need: [[B.CRYSTAL, 2], [I.WHEAT, 8]] }
  ],
  funker: [
    { give: [B.RADIO, 1], need: [[I.COPPER_INGOT, 2]] },
    { give: [B.LAMP, 4], need: [[I.WHEAT, 6]] },
    { give: [B.SWITCH, 2], need: [[I.BREAD, 1]] },
    { give: [B.CRYSTAL, 1], need: [[I.IRON_INGOT, 3]] }
  ],
  hirte: [
    { give: [B.WOOL, 4], need: [[I.WHEAT, 4]] },
    { give: [I.MEAT_COOKED, 3], need: [[I.WHEAT, 5]] },
    { give: [I.MEAT_RAW, 4], need: [[I.APPLE, 3]] }
  ]
};
export const GREET = {
  bauer: 'Die Felder geben gut her. Weizen tausche ich gern!',
  schmied: 'Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.',
  funker: 'Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.',
  hirte: 'Meine Schafe geben Wolle. Für Weizen bekommst du welche.'
};
