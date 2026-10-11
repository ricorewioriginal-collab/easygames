// Erzeugt BLOCKS.md und CRAFTING.md direkt aus Blockregister und Rezeptliste (Doku = echter Stand).
// Aufruf: npm run docs
import { writeFileSync } from 'node:fs';
import { BLOCKS, CATS } from '../src/blocks.js';
import { RECIPES, MAX_STACK, STATION_NAMES } from '../src/crafting.js';
import { ITEMS, ITEM_LIST, nameOf } from '../src/items.js';

const catName = id => (id === 'items' ? 'Werkzeuge & Essen' : (CATS.find(c => c.id === id) || { name: '–' }).name);
const yes = v => (v ? 'ja' : '–');
let b = `# Blöcke\n\n_Automatisch erzeugt aus \`src/blocks.js\` (\`npm run docs\`). Nicht von Hand ändern._\n\n` +
  `Jeder Block hat eine feste Id. Ids stehen in Spielständen und werden nie umnummeriert; neue Blöcke bekommen neue Ids hinten.\n\n` +
  `| Id | Name | Kategorie | fest | verdeckt | durchsichtig | leuchtet | Härte | Werkzeug |\n|---:|---|---|:-:|:-:|:-:|:-:|---:|---|\n`;
for (const x of BLOCKS) {
  if (!x || x.id === 0) continue;
  b += `| ${x.id} | ${x.name} | ${catName(x.cat)} | ${yes(x.solid)} | ${yes(x.opaque)} | ${yes(x.trans)} | ${x.emit === 2 ? 'Farbwechsel' : yes(x.emit)} | ${x.hard} | ${x.tool || '–'}${x.tier ? ` (Stufe ${x.tier}+)` : ''} |\n`;
}
b += `\n**Spalten:** fest = man kann nicht hindurchlaufen · verdeckt = Nachbarflächen werden nicht gezeichnet · Härte × 0,9 = Abbauzeit mit der Hand in Sekunden (nur Überleben); das passende Werkzeug teilt sie durch sein Tempo · Stufe n+ = braucht mindestens eine Spitzhacke dieser Stufe (1 Holz, 2 Stein, 3 Kupfer, 4 Eisen), sonst lässt sich der Block nicht abbauen.\n\n## Gegenstände\n\n| Id | Name | Werkzeug | Tempo | hält | Nahrung |\n|---:|---|---|---:|---:|---:|\n${ITEM_LIST.map(id => { const it = ITEMS[id], t = it.tool; return `| ${id} | ${it.name} | ${t ? t.kind + ' Stufe ' + t.tier : '–'} | ${t ? t.speed + '×' : '–'} | ${t ? t.dur + ' Blöcke' : '–'} | ${it.food ? '+' + it.food : '–'} |`; }).join('\n')}\n`;
writeFileSync(new URL('../BLOCKS.md', import.meta.url), b);

let c = `# Herstellen\n\n_Automatisch erzeugt aus \`src/crafting.js\` (\`npm run docs\`). Nicht von Hand ändern._\n\n` +
  `Im Überlebens- und Story-Modus öffnest du das Inventar (E oder 🎒). Unter „Herstellen“ stehen alle Rezepte; Suche und Kategorien filtern die Liste. ` +
  `Fehlende Zutaten sind rot markiert, rechts steht, wie oft du das Rezept gerade herstellen kannst. Umschalt-Klick stellt bis zu 5× her. ` +
  `Je Sorte passen höchstens ${MAX_STACK} Stück in den Vorrat; ist er voll, wird nichts verbraucht. ` +
  `Rezepte mit Station gehen nur, wenn eine Werkbank oder ein Schmelzofen höchstens 4 Blöcke entfernt steht.\n\n| Ergebnis | Zutaten | Station | Kategorie |\n|---|---|---|---|\n`;
for (const r of RECIPES) c += `| ${r.give[1]}× ${nameOf(r.give[0])} | ${r.need.map(([t, n]) => `${n}× ${nameOf(t)}`).join(' + ')} | ${r.st ? STATION_NAMES[r.st] : '–'} | ${catName(r.cat)} |\n`;
writeFileSync(new URL('../CRAFTING.md', import.meta.url), c);
console.log(`BLOCKS.md (${BLOCKS.filter(Boolean).length - 1} Blöcke) und CRAFTING.md (${RECIPES.length} Rezepte) geschrieben`);
