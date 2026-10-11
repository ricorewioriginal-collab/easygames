/* Erzeugt docs/minigames.md aus der Minispiel-Registry: npx tsx tools/gen-minigames-doc.mjs */
import { writeFileSync } from 'node:fs';
import { MINIGAMES } from '../shared/src/minigames/registry.ts';
const cat = {
  reaction: 'Reaktion',
  race: 'Rennen',
  platform: 'Geschicklichkeit',
  collect: 'Sammeln',
  memory: 'Gedächtnis',
  rhythm: 'Rhythmus',
  survival: 'Überleben',
  physics: 'Physik',
  aim: 'Zielen',
  puzzle: 'Rätsel',
};
let md =
  '# Minispiele\n\nDiese Datei wird erzeugt (`npx tsx tools/gen-minigames-doc.mjs`). Alle Spiele sind deterministische 60-Hz-Simulationen: Der Server rechnet jedes Ergebnis aus dem Eingabeprotokoll nach.\n\n| # | Spiel | Kategorie | Dauer | Steuerung (Tastatur/Maus) | Steuerung (Touch) | Worum geht es |\n| --- | --- | --- | --- | --- | --- | --- |\n';
MINIGAMES.forEach((g, i) => {
  md += `| ${i + 1} | **${g.name}** | ${cat[g.category] ?? g.category} | ${g.duration} s | ${g.controls.desktop} | ${g.controls.touch} | ${g.tagline} |\n`;
});
md += `\n${MINIGAMES.length} Minispiele.\n`;
writeFileSync(new URL('../docs/minigames.md', import.meta.url), md);
console.log(MINIGAMES.length + ' Spiele');
