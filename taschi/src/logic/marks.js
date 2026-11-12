// Abenteuer-Markierungen einer Region für Minimap, Gebietskarte und
// Lichtsäulen in der Welt (rein, ohne Three.js).
import { REGIONS } from '../data/regions.js';
import * as P from './progress.js';

export const MARK_STYLE = {
  puzzle: { color: '#36d6c8', glyph: '◆', name: 'Rätsel' },
  guild: { color: '#a45ee0', glyph: '!', name: 'Schattengilde' },
  ambush: { color: '#a45ee0', glyph: '!', name: 'Gilden-Hinterhalt' },
  clue: { color: '#ffd35a', glyph: '✦', name: 'Gesuchter Fund' },
  questNew: { color: '#ffd35a', glyph: '!', name: 'Neue Aufgabe' },
  questReady: { color: '#5fe08a', glyph: '?', name: 'Aufgabe abgeben' },
  solved: { color: '#8a94a6', glyph: '✓', name: 'Gelöst' }
};

export function regionMarks(s, L, r) {
  if (!L || r >= 16) return [];
  const out = [], region = REGIONS[r];
  if (L.puzzle) {
    const solved = !!s.puzzles['region:' + r];
    out.push({ kind: solved ? 'solved' : 'puzzle', x: L.puzzle.x, z: L.puzzle.z, label: region.puzzle.name, beacon: !solved && s.flags.firstQuest });
  }
  if (L.guild && region.guild !== undefined && P.guildActive(s, region.guild) && P.guildNext(s, region.guild) !== 'done') out.push({ kind: 'guild', x: L.guild.x, z: L.guild.z, label: 'Lager der Schattengilde', beacon: true });
  if (L.ambush && P.ambushPending(s, r) && s.flags.firstQuest) out.push({ kind: 'ambush', x: L.ambush.x, z: L.ambush.z, label: 'Gilden-Hinterhalt', beacon: true });
  for (const it of L.items) {
    if (!it.quest || s.found[it.id] || s.flags[it.flag]) continue;
    const q = s.quests[it.quest];
    if (q && !q.done) out.push({ kind: 'clue', x: it.x, z: it.z, label: it.label });
  }
  return out;
}
