// Erzeugt docs/CONTENT_CATALOG.md aus den echten Katalogen: npm run docs:catalog
import { writeFileSync } from 'node:fs';
import { BUILDINGS, CATEGORY_LABEL } from '../src/catalogs/buildings';
import { CROPS, ITEMS, ORDERS, RECIPES } from '../src/catalogs/items';
import { ACHIEVEMENTS, NPCS, QUESTS, TASK_TEMPLATES } from '../src/catalogs/quests';

const min = (s: number) => (s >= 3600 ? `${+(s / 3600).toFixed(1)} Std` : s >= 60 ? `${Math.round(s / 60)} Min` : `${s} s`);
const L: string[] = ['# Inhaltskatalog', '', '_Automatisch erzeugt aus `src/catalogs/` (`npm run docs:catalog`). Alle Namen und Texte sind eigene Erfindungen._', ''];
const cats = [...new Set(BUILDINGS.map((b) => b.cat))];
L.push('## Übersicht', '', '| Bereich | Anzahl |', '|---|---|');
for (const c of cats) L.push(`| ${CATEGORY_LABEL[c]} | ${BUILDINGS.filter((b) => b.cat === c).length} |`);
L.push(`| Feldfrüchte | ${CROPS.length} |`, `| Waren und Materialien | ${ITEMS.length} |`, `| Rezepte | ${RECIPES.length} |`, `| Lieferaufträge | ${ORDERS.length} |`,
  `| Aufgaben (Haupt + Neben) | ${QUESTS.length} |`, `| Aufgaben-Figuren | ${Object.keys(NPCS).length} |`, `| Tages-/Wochenziel-Vorlagen | ${TASK_TEMPLATES.length} |`, `| Erfolge | ${ACHIEVEMENTS.length} |`, '');
for (const c of cats) {
  L.push(`## ${CATEGORY_LABEL[c]}`, '', '| Name | Größe | Level | Kosten | Bauzeit | Details |', '|---|---|---|---|---|---|');
  for (const b of BUILDINGS.filter((x) => x.cat === c)) {
    const d: string[] = [];
    if (b.pop) d.push(`${b.pop} Einwohner, ${b.rent} Münzen/${min(b.rentTime ?? 0)}`);
    if (b.accepts) d.push(`verkauft ${b.accepts}`);
    if (b.popCap) d.push(`+${b.popCap} Einwohnergrenze`);
    if (b.storage) d.push(`+${b.storage} Lager`);
    if (b.appeal) d.push(`Ausstrahlung ${b.appeal} (Radius ${b.radius})`);
    if (b.materials) d.push(`Material: ${Object.entries(b.materials).map(([k, v]) => `${v}× ${k}`).join(', ')}`);
    if (b.recipes) d.push(`Rezepte: ${b.recipes.join(', ')}`);
    if (b.station) d.push(`Station: ${b.station}`);
    L.push(`| ${b.name} | ${b.w}×${b.h} | ${b.level} | ${b.cost} | ${min(b.buildTime)} | ${d.join('; ')} |`);
  }
  L.push('');
}
L.push('## Feldfrüchte', '', '| Name | Level | Saat | Wachstum | Ertrag |', '|---|---|---|---|---|');
for (const c of CROPS) L.push(`| ${c.icon} ${c.name} | ${c.level} | ${c.seed} | ${min(c.time)} | ${c.yield} |`);
L.push('', '## Waren und Materialien', '', ITEMS.map((i) => `${i.icon} ${i.name}`).join(' · '), '');
L.push('## Rezepte', '', '| Rezept | Zutaten | Ergebnis | Dauer |', '|---|---|---|---|');
for (const r of RECIPES) L.push(`| ${r.id} | ${Object.entries(r.inputs).map(([k, v]) => `${v}× ${k}`).join(', ')} | ${r.amount}× ${r.output} | ${min(r.time)} |`);
L.push('', '## Figuren', '', ...Object.values(NPCS).map((n) => `- ${n.face} **${n.name}**, ${n.role}`), '');
L.push('## Aufgaben', '', '| ID | Titel | Figur | Level |', '|---|---|---|---|');
for (const q of QUESTS) L.push(`| ${q.id} | ${q.title} | ${NPCS[q.giver]?.name ?? q.giver} | ${q.level ?? 1} |`);
writeFileSync('docs/CONTENT_CATALOG.md', L.join('\n') + '\n');
console.log('docs/CONTENT_CATALOG.md geschrieben');
