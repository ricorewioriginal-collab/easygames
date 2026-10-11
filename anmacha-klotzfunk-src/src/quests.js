// Story-Modus. Zwei Kampagnen:
// - QUESTS: die 15 Aufträge der Funkzentrale (Version 1.0, Generator 1, ohne Überlebensregeln) – alte Story-Welten spielen sie weiter.
// - RAUSCHEN: „Das große Rauschen“ in 6 Kapiteln (Generator 3, Überlebensregeln) – alle neuen Story-Welten.
// k = Art, a = passende Ids, n = Ziel, r = Belohnung (Id -> Anzahl), c = Kapitel
import { B } from './world.js';
import { I } from './items.js';

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

const T_DROHNE = 5, T_HOEHLE = 4; // Gegner-Typen aus mobs.js
const BUILD = [B.PLANKS, B.STONE, B.COBBLE, B.DIRT, B.WOOD, B.SPRUCE, B.BRICK, B.SANDSTONE, B.GLASS, B.MARBLE];

export const CHAPTERS = [
  null,
  { t: 'Das erste Signal', d: 'Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal.' },
  { t: 'Der vergessene Sender', d: 'Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg.' },
  { t: 'Stimmen aus der Tiefe', d: 'Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“' },
  { t: 'Die zerbrochene Verbindung', d: 'Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf.' },
  { t: 'Das Herz des Rauschens', d: 'Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas.' },
  { t: 'Die letzte Frequenz', d: 'Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“' }
];

export const RAUSCHEN = [
  { c: 1, t: 'Holz sammeln', d: 'Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.', k: 'break', a: [B.WOOD, B.SPRUCE], n: 6, r: { [B.PLANKS]: 4 } },
  { c: 1, t: 'Werkbank', d: 'Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.', k: 'craft', a: [B.WORKBENCH], n: 1, r: { [I.STICK]: 4 } },
  { c: 1, t: 'Erstes Werkzeug', d: 'Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.', k: 'craft', a: [I.WOOD_PICK], n: 1, r: { [I.APPLE]: 3 } },
  { c: 1, t: 'Unterschlupf', d: 'Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.', k: 'place', a: BUILD, n: 20, r: { [B.LAMP]: 2 } },
  { c: 1, t: 'Licht für die Nacht', d: 'Setze einen Leuchtblock in deinen Unterschlupf.', k: 'place', a: [B.LAMP], n: 1, r: { [I.BREAD]: 2 } },
  { c: 1, t: 'Das erste Signal', d: 'Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.', k: 'place', a: [B.RADIO], n: 1, r: { [I.MEAT_COOKED]: 2 } },
  { c: 2, t: 'Das Dorf', d: 'Folge dem Wegpunkt 📍 bis ins Dorf.', k: 'visit', n: 1, r: { [I.BREAD]: 2 } },
  { c: 2, t: 'Erste Kontakte', d: 'Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.', k: 'talk', n: 1, r: { [I.SEEDS]: 4 } },
  { c: 2, t: 'Erntezeit', d: 'Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.', k: 'have', a: [I.WHEAT], n: 6, r: { [I.BREAD]: 1 } },
  { c: 2, t: 'Tauschhandel', d: 'Tausche etwas mit einem Dorfbewohner.', k: 'trade', n: 1, r: { [I.COPPER_INGOT]: 1 } },
  { c: 3, t: 'Steinwerkzeug', d: 'Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.', k: 'craft', a: [I.STONE_PICK], n: 1, r: { [B.LAMP]: 4 } },
  { c: 3, t: 'Abstieg', d: 'Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.', k: 'depth', y: 18, n: 1, r: { [I.MEAT_COOKED]: 2 } },
  { c: 3, t: 'Kupfer schmelzen', d: 'Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.', k: 'craft', a: [I.COPPER_INGOT], n: 3, r: { [B.COAL]: 4 } },
  { c: 3, t: 'Funkkristalle', d: 'Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.', k: 'have', a: [B.CRYSTAL], n: 3, r: { [I.IRON_INGOT]: 2 } },
  { c: 4, t: 'Der Funksender', d: 'Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.', k: 'place', a: [B.SENDER], n: 1, r: { [B.WIRE]: 8 } },
  { c: 4, t: 'Strom drauf', d: 'Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.', k: 'place', a: [B.SWITCH], n: 1, r: { [I.COPPER_INGOT]: 2 } },
  { c: 4, t: 'Relais', d: 'Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.', k: 'place', a: [B.RELAY], n: 1, r: { [B.CRYSTAL]: 1, [I.COPPER_INGOT]: 1 } },
  { c: 4, t: 'Die Verbindung', d: 'Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).', k: 'reach', n: 40, r: { [I.IRON_INGOT]: 3 } },
  { c: 5, t: 'Gerüstet', d: 'Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).', k: 'craft', a: [I.COPPER_HELMET, I.COPPER_CHEST, I.IRON_HELMET, I.IRON_CHEST], n: 1, r: { [I.BREAD]: 3 } },
  { c: 5, t: 'Störsender', d: 'Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.', k: 'kill', a: [T_DROHNE], n: 1, r: { [B.CRYSTAL]: 1 } },
  { c: 5, t: 'Wesen der Tiefe', d: 'In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.', k: 'kill', a: [T_HOEHLE], n: 2, r: { [I.IRON_INGOT]: 2 } },
  { c: 5, t: 'Maschinen', d: 'Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.', k: 'powered', n: 3, r: { [B.RAINBOW]: 1 } },
  { c: 6, t: 'Der Funkturm', d: 'Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.', k: 'height', n: 20, r: { [B.RELAY]: 1 } },
  { c: 6, t: 'Großes Netz', d: 'Lass 3 Empfänger gleichzeitig leuchten.', k: 'net', n: 3, r: { [B.RAINBOW]: 1 } },
  { c: 6, t: 'Die letzte Frequenz', d: 'Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.', k: 'place', a: [B.RAINBOW], n: 1, r: { [B.RAINBOW]: 2 } }
];

// Kampagne eines Story-Spielstands (ohne c = alte Aufträge)
export const campaignOf = story => (story && story.c === 'rauschen' ? RAUSCHEN : QUESTS);

// aktueller Fortschritt [bisher, Ziel]
export function questProgress(game, q) {
  const s = game.story, sig = game.sigStats || { receivers: 0, machines: 0, reach: 0 };
  if (q.k === 'have') { let c = 0; for (const t of q.a) c += game.inv[t] || 0; return [c, q.n]; }
  if (q.k === 'height') return [Math.max(0, Math.floor(s.max)), q.n];
  if (q.k === 'net') return [sig.receivers, q.n];
  if (q.k === 'powered') return [sig.machines, q.n];
  if (q.k === 'reach') return [Math.floor(sig.reach), q.n];
  return [Math.floor(s.p), q.n];
}
