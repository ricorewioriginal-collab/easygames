// Erzeugt docs/levels.md aus den Leveldaten.  Aufruf:  npx tsx tools/gen-levels-doc.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUTS, WORLD_IDS, layoutSignature } from '../shared/src/levels/index.ts';

const WORLD_NAMES = {
  prismara: 'PRISMARA',
  'nova-nexus': 'NOVA NEXUS',
  wurzelwild: 'WURZELWILD',
  'paradox-city': 'PARADOX CITY',
  'infinity-carnival': 'INFINITY CARNIVAL',
};
const WORLD_BLURB = {
  prismara: 'Schwebende Kristallinseln, Lichtbrücken und Regenbogenwege; viele Portale.',
  'nova-nexus': 'Kosmische Plattformen und Planetensysteme (rotierende Inseln), Raumportale, Strahlenwege, Chaos-Felder; die Schwerkraft-Wechsel sind reine Darstellung.',
  wurzelwild: 'Naturwelt mit Rankenbrücken, wachsenden Wegen (Faltung), Dornentoren (gates) und vielen Läden und Item-Feldern.',
  'paradox-city': 'Unmögliche Architektur: Treppen, Raumfaltungen mit vielen faltbaren Kanten (2–3 Phasen), Schleifenwege und drehende Plattformen.',
  'infinity-carnival': 'Kosmische Vergnügungswelt mit Schienen und dynamischen Pfaden, alle Mechaniken gemischt; 07–10 sind die Finale-Bretter.',
};
const TEMPLATES = {
  ring: 'Rundkurs mit Umgehungen im Inneren',
  'twin-loops': 'zwei Rundkurse, durch zwei Brücken verbunden',
  'star-hub': 'Nabe (Start) mit Schleifen-Blütenblättern',
  spiral: 'Spirale nach innen, hohe Rückbrücke nach außen',
  ladder: 'Hin- und Rückspur mit Sprossen',
  'tower-spiral': 'Wendeltreppe hinauf, Abstiegsschraube außen',
  'cross-bridges': 'Ring mit Überführungen quer über die Mitte (Kreuzungen auf verschiedenen Höhen)',
  ribbon: 'zweispuriges Band mit Spurwechseln, optional Möbius-verdreht',
  archipelago: 'Inselrunden, durch Brücken im Kreis verbunden, optional Zentralinsel',
  comb: 'Hin- und Rückreihe mit Π-förmigen Zinken-Umwegen',
  zigzag: 'Serpentine durch Reihen, Randpfad zurück, Querverbindungen',
  lattice: 'Stadtraster mit Einbahnstraßen und Randring',
  orbits: 'konzentrische Bahnen mit wechselnder Laufrichtung',
  braid: 'Kette aus Rauten (Routenwahl), Rückweg im Bogen',
  'chain-loops': 'Rundkurse, die sich in Kreuzungsfeldern berühren (Kette oder Kleeblatt)',
  'trefoil-knot': 'Kleeblattknoten, Stränge kreuzen sich auf verschiedenen Höhen',
  terraces: 'quadratische Terrassen (Stufenpyramide) mit Treppen',
};

const count = (l, k) => l.nodes.filter((n) => n.kind === k).length;
const out = [];
out.push('# Brett-Layouts');
out.push('');
out.push('> Diese Datei wird von `tools/gen-levels-doc.mjs` erzeugt (`npx tsx tools/gen-levels-doc.mjs`). Nicht von Hand ändern.');
out.push('');
out.push(`Das Spiel enthält **${LAYOUTS.length} Brett-Layouts** (5 Welten × 10). Sie entstehen beim Import deterministisch aus Bauplänen (\`shared/src/levels/builders/\`) und Seeds, jedes Layout besteht \`validateLayout\` und hat eine eigene \`layoutSignature\`.`);
out.push('');
out.push('Vorschau als SVG-Draufsicht: `npx tsx tools/layout-preview.mjs <layout-id> [out.svg]`.');
out.push('');
out.push('## Übersicht');
out.push('');
out.push('Spalten: **Felder** = Anzahl Felder; **Schw.** = Schwierigkeit 1–3; **Runden** = empfohlene Rundenzahl; **P / L / M / C / F** = Portal-Paare / Läden / Mautbrücken (Dornentore) / Chaos-Felder / faltbare Wege (Faltungsphasen).');
out.push('');
out.push('| Welt | ID | Name | Bauplan | Felder | Schw. | Runden | P | L | M | C | F | Besonderheiten |');
out.push('| --- | --- | --- | --- | ---: | :---: | ---: | ---: | ---: | ---: | ---: | --- | --- |');
for (const l of LAYOUTS) {
  const folds = l.edges.filter((e) => e.folds).length;
  const f = l.foldPhases > 1 ? `${folds} (${l.foldPhases} Ph.)` : '–';
  out.push(
    `| ${WORLD_NAMES[l.world]} | \`${l.id}\` | ${l.name} | \`${l.template}\` | ${l.nodes.length} | ${l.difficulty} | ${l.recommendedRounds} | ${count(l, 'portal') / 2} | ${count(l, 'shop')} | ${count(l, 'gate')} | ${count(l, 'chaos')} | ${f} | ${l.features.join(', ')} |`,
  );
}
out.push('');
out.push('## Welten');
for (const w of WORLD_IDS) {
  out.push('');
  out.push(`### ${WORLD_NAMES[w]}`);
  out.push('');
  out.push(WORLD_BLURB[w]);
  out.push('');
  for (const l of LAYOUTS.filter((x) => x.world === w)) {
    out.push(`- **${l.index}. ${l.name}** (\`${l.id}\`, ${l.template}, ${l.nodes.length} Felder, Schwierigkeit ${l.difficulty}): ${l.blurb}`);
  }
}
out.push('');
out.push('## Baupläne (Topologie-Bauer)');
out.push('');
out.push('| Bauplan | Beschreibung | Einsatz |');
out.push('| --- | --- | --- |');
for (const [t, desc] of Object.entries(TEMPLATES)) {
  const used = LAYOUTS.filter((l) => l.template === t).map((l) => l.id);
  out.push(`| \`${t}\` | ${desc} | ${used.length}× (${used.join(', ')}) |`);
}
out.push('');
const unknown = [...new Set(LAYOUTS.map((l) => l.template))].filter((t) => !(t in TEMPLATES));
if (unknown.length) out.push(`> Hinweis: Bauplan ohne Beschreibung: ${unknown.join(', ')}`, '');
out.push('## Aufbau und Regeln');
out.push('');
out.push('- Jeder Bauer (`builders/*.ts`) liefert nur Felderpositionen, Kanten und Inseln. Danach ergänzt `compose.ts` (`makeLayout`) in dieser Reihenfolge: dauerhafte **Abkürzungen** (`extras.ts`), **faltbare Wege** (4D-Faltung, `folds`), Inseln/Spin, dann die **Feldarten** (`kinds.ts`).');
out.push('- Abkürzungen und Faltungen werden mit dem `Rng` (feste Seeds) gewählt: gerichtet nach vorn über mindestens einige Schritte, ohne Kreuzung in der Draufsicht (außer mit Höhenunterschied ≥ 2,6) und ohne fremde Felder zu streifen.');
out.push('- Feldverteilung: Start auf dem Hauptweg; Läden mindestens 3 Schritte vom Start und 4 Schritte voneinander (über dauerhafte Wege gemessen); Portal-Paare weit voneinander entfernt (Weg und Luftlinie); Mautbrücken bevorzugt auf Engstellen und Brücken; Glimmer ≥ 36 %, Dornen ≤ 25 %; Dornen/Items/Ereignisse nicht benachbart.');
out.push('- Altar-Orte (5–8 je Layout) werden per Farthest-Point-Sampling über Glimmer/Ereignis/Item/Chaos-Felder gestreut, nie am Start, an Portalen oder Mautbrücken.');
out.push('- Der Kern (Kanten ohne `folds`) macht jedes Layout stark zusammenhängend; faltbare Kanten sind nur Abkürzungen oder verschobene Brücken (gleiches Startfeld, andere Phase).');
out.push('');
const dir = dirname(fileURLToPath(import.meta.url));
const target = resolve(dir, '../docs/levels.md');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out.join('\n'));
console.log('geschrieben:', target, `(${LAYOUTS.length} Layouts, ${new Set(LAYOUTS.map(layoutSignature)).size} verschiedene Signaturen)`);
