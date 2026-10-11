// Erzeugt BLOCKS.md und CRAFTING.md direkt aus Blockregister und Rezeptliste (Doku = echter Stand).
// Aufruf: npm run docs
import { writeFileSync } from 'node:fs';
import { BLOCKS, CATS, NAMES } from '../src/blocks.js';
import { RECIPES, MAX_STACK } from '../src/crafting.js';

const catName = id => (CATS.find(c => c.id === id) || { name: '–' }).name;
const yes = v => (v ? 'ja' : '–');
let b = `# Blöcke\n\n_Automatisch erzeugt aus \`src/blocks.js\` (\`npm run docs\`). Nicht von Hand ändern._\n\n` +
  `Jeder Block hat eine feste Id. Ids stehen in Spielständen und werden nie umnummeriert; neue Blöcke bekommen neue Ids hinten.\n\n` +
  `| Id | Name | Kategorie | fest | verdeckt | durchsichtig | leuchtet | Härte | Werkzeug |\n|---:|---|---|:-:|:-:|:-:|:-:|---:|---|\n`;
for (const x of BLOCKS) {
  if (!x || x.id === 0) continue;
  b += `| ${x.id} | ${x.name} | ${catName(x.cat)} | ${yes(x.solid)} | ${yes(x.opaque)} | ${yes(x.trans)} | ${x.emit === 2 ? 'Farbwechsel' : yes(x.emit)} | ${x.hard} | ${x.tool || '–'} |\n`;
}
b += `\n**Spalten:** fest = man kann nicht hindurchlaufen · verdeckt = Nachbarflächen werden nicht gezeichnet · Härte = geplante Grundabbauzeit in Sekunden (wird mit den Werkzeugen aktiv, siehe PROGRESS.md).\n`;
writeFileSync(new URL('../BLOCKS.md', import.meta.url), b);

let c = `# Herstellen\n\n_Automatisch erzeugt aus \`src/crafting.js\` (\`npm run docs\`). Nicht von Hand ändern._\n\n` +
  `Im Überlebens- und Story-Modus öffnest du das Inventar (E oder 🎒). Unter „Herstellen“ stehen alle Rezepte; Suche und Kategorien filtern die Liste. ` +
  `Fehlende Zutaten sind rot markiert, rechts steht, wie oft du das Rezept gerade herstellen kannst. Umschalt-Klick stellt bis zu 5× her. ` +
  `Je Blocktyp passen höchstens ${MAX_STACK} Stück in den Vorrat; ist er voll, wird nichts verbraucht.\n\n| Ergebnis | Zutaten | Kategorie |\n|---|---|---|\n`;
for (const r of RECIPES) c += `| ${r.give[1]}× ${NAMES[r.give[0]]} | ${r.need.map(([t, n]) => `${n}× ${NAMES[t]}`).join(' + ')} | ${catName(r.cat)} |\n`;
writeFileSync(new URL('../CRAFTING.md', import.meta.url), c);
console.log(`BLOCKS.md (${BLOCKS.filter(Boolean).length - 1} Blöcke) und CRAFTING.md (${RECIPES.length} Rezepte) geschrieben`);
