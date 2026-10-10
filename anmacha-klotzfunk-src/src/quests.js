// Story-Modus: feste Aufträge der Funkzentrale. k = Art, a = passende Block-Ids, n = Ziel, r = Belohnung (Block-Id -> Anzahl)
import { B } from './world.js';

const NEON = [B.NEON_R, B.NEON_B, B.NEON_G, B.NEON_P];

export const QUESTS = [
  { t: 'Holz sammeln', d: 'Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.', k: 'break', a: [B.WOOD], n: 5, r: { [B.PLANKS]: 4 } },
  { t: 'Bretter herstellen', d: 'Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.', k: 'craft', a: [B.PLANKS], n: 8, r: { [B.DIRT]: 10 } },
  { t: 'Fundament legen', d: 'Setze 12 Bretter als Fundament für die Sendehütte.', k: 'place', a: [B.PLANKS], n: 12, r: { [B.STONE]: 4 } },
  { t: 'Steinbruch', d: 'Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.', k: 'have', a: [B.STONE], n: 12, r: { [B.SAND]: 4 } },
  { t: 'Strand und Glas', d: 'Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).', k: 'craft', a: [B.GLASS], n: 4, r: { [B.WOOD]: 2, [B.GLASS]: 2 } },
  { t: 'Leuchtfeuer', d: 'Stelle 2 Leuchtblöcke her (Glas und Holz).', k: 'craft', a: [B.LAMP], n: 2, r: { [B.LEAVES]: 4, [B.PLANKS]: 2 } },
  { t: 'Licht an', d: 'Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.', k: 'place', a: [B.LAMP], n: 2, r: { [B.LAMP]: 2 } },
  { t: 'Hoch hinaus', d: 'Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.', k: 'height', n: 14, r: { [B.PLANKS]: 6, [B.LEAVES]: 4 } },
  { t: 'Der Funkmast', d: 'Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.', k: 'place', a: [B.RADIO], n: 1, r: { [B.PLANKS]: 4, [B.LEAVES]: 4 } },
  { t: 'Federn für die Landung', d: 'Stelle 2 Federblöcke her (Blätter und Bretter).', k: 'craft', a: [B.FEDER], n: 2, r: { [B.STONE]: 4 } },
  { t: 'Sprungtraining', d: 'Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.', k: 'bounce', n: 3, r: { [B.LAMP]: 1 } },
  { t: 'Seilhaken', d: 'Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.', k: 'hook', n: 2, r: { [B.LEAVES]: 4 } },
  { t: 'Gleitflug', d: 'Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.', k: 'glide', n: 5, r: { [B.LAMP]: 4, [B.SAND]: 4 } },
  { t: 'Neon-Show', d: 'Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.', k: 'place', a: NEON, n: 4, r: { [B.GLASS]: 2, [B.LAMP]: 1 } },
  { t: 'Regenbogen-Finale', d: 'Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.', k: 'place', a: [B.RAINBOW], n: 1, r: { [B.RAINBOW]: 2 } }
];

// aktueller Fortschritt [bisher, Ziel]
export function questProgress(game, q) {
  const s = game.story;
  if (q.k === 'have') { let c = 0; for (const t of q.a) c += game.inv[t] || 0; return [c, q.n]; }
  if (q.k === 'height') return [Math.max(0, Math.floor(s.max)), q.n];
  return [Math.floor(s.p), q.n];
}
