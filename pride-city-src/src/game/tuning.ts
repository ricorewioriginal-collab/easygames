/* Tuning-Werkstatt und TV-Show „Aufgemotzt!“ bei Meisterin Rosi (Garage Schraubenschlüssel, Hochstadt):
   Kundschaft bringt eine Rostlaube (Kenney-Modelle, damit der Lack wechseln kann), du baust nach ihrem Wunsch Lack, Felgen, Neon, Hydraulik, Soundanlage und ein
   verrücktes Extra ein, dann Enthüllung mit Reaktion, Honorar und Übergabefahrt. Dieselben Teile gibt es für den
   eigenen Wagen (sichtbar in der Stadt: Neon leuchtet, Hydraulik hüpft beim Hupen, Discokugel dreht sich).
   Nur Daten und Wertung, das 3D steckt in pimp.ts. */
import type { SaveData } from '../engine/Save';

export type Slot = 'paint' | 'rim' | 'neon' | 'hyd' | 'sound' | 'extra';
export type Tag = 'glam' | 'pride' | 'party' | 'sport' | 'cool' | 'edel';
export interface Part { id: string; name: string; icon: string; cost: number; tag?: Tag; /** Lack: Farbton wie PAINTS in vehicles.ts (-1 Original) */ hue?: number }

export const SLOTS: Array<{ id: Slot; title: string; ask: string }> = [
  { id: 'paint', title: 'Lack', ask: 'Welche Farbe kriegt die Karre?' },
  { id: 'rim', title: 'Felgen', ask: 'Was kommt auf die Räder?' },
  { id: 'neon', title: 'Unterboden-Neon', ask: 'Wie soll er nachts leuchten?' },
  { id: 'hyd', title: 'Fahrwerk', ask: 'Hydraulik rein? (Hüpft beim Hupen)' },
  { id: 'sound', title: 'Soundanlage', ask: 'Wie viel Bass verträgt die Nachbarschaft?' },
  { id: 'extra', title: 'Verrücktes Extra', ask: 'Und jetzt das Extra, über das die ganze Stadt redet:' },
];

export const PARTS: Record<Slot, Part[]> = {
  paint: [
    { id: 'orig', name: 'Alter Lack, nur poliert', icon: '⚪', cost: 0, hue: -1 },
    { id: 'pink', name: 'Bonbon-Pink', icon: '🩷', cost: 90, tag: 'glam', hue: 322 },
    { id: 'lila', name: 'Pride-Lila', icon: '🟣', cost: 90, tag: 'pride', hue: 275 },
    { id: 'gold', name: 'Goldrausch', icon: '🟡', cost: 110, tag: 'edel', hue: 48 },
    { id: 'rot', name: 'Rennrot', icon: '🔴', cost: 90, tag: 'sport', hue: 0 },
    { id: 'tuerkis', name: 'Lagunen-Türkis', icon: '🩵', cost: 90, tag: 'cool', hue: 178 },
  ],
  rim: [
    { id: 'serie', name: 'Serienfelgen', icon: '⚫', cost: 0 },
    { id: 'chrom', name: 'Chromfelgen „Spiegelei“', icon: '🪞', cost: 140, tag: 'edel' },
    { id: 'gold', name: 'Goldfelgen „Diva“', icon: '👑', cost: 200, tag: 'glam' },
    { id: 'bunt', name: 'Regenbogenfelgen', icon: '🌈', cost: 170, tag: 'pride' },
    { id: 'sport', name: 'Rennfelgen „Boxenluder“', icon: '🏁', cost: 160, tag: 'sport' },
  ],
  neon: [
    { id: 'aus', name: 'Kein Neon', icon: '➖', cost: 0 },
    { id: 'pink', name: 'Neon Pink', icon: '💗', cost: 150, tag: 'glam' },
    { id: 'tuerkis', name: 'Neon Türkis', icon: '💎', cost: 150, tag: 'cool' },
    { id: 'regenbogen', name: 'Regenbogen-Lauflicht', icon: '🌈', cost: 240, tag: 'pride' },
  ],
  hyd: [
    { id: 'serie', name: 'Serienfahrwerk', icon: '➖', cost: 0 },
    { id: 'huepf', name: 'Hydraulik „Hüpfburg“', icon: '🦘', cost: 260, tag: 'party' },
    { id: 'twerk', name: 'Tanz-Hydraulik „Twerk“', icon: '🍑', cost: 380, tag: 'party' },
    { id: 'tief', name: 'Tiefergelegt „Bodenkuss“', icon: '⬇️', cost: 180, tag: 'sport' },
  ],
  sound: [
    { id: 'radio', name: 'Altes Radio', icon: '📻', cost: 0 },
    { id: 'bass', name: 'Subwoofer „Bassbär“', icon: '🐻', cost: 190, tag: 'party' },
    { id: 'disco', name: 'Kofferraum-Disco mit Lichtorgel', icon: '🪩', cost: 320, tag: 'party' },
    { id: 'hifi', name: 'Konzert-Anlage „Oper“', icon: '🎻', cost: 260, tag: 'edel' },
  ],
  extra: [
    { id: 'nix', name: 'Kein Extra', icon: '➖', cost: 0 },
    { id: 'kugel', name: 'Discokugel aufs Dach', icon: '🪩', cost: 120, tag: 'party' },
    { id: 'fluegel', name: 'Heckflügel „Federboa“', icon: '🪽', cost: 160, tag: 'sport' },
    { id: 'horn', name: 'Einhorn-Horn auf der Haube', icon: '🦄', cost: 110, tag: 'pride' },
    { id: 'krone', name: 'Drag-Krone aufs Dach', icon: '👑', cost: 150, tag: 'glam' },
    { id: 'flagge', name: 'Pride-Flagge am Heck', icon: '🏳️‍🌈', cost: 80, tag: 'pride' },
  ],
};
export type Pimp = Record<Slot, string>;
export const STOCK: Pimp = { paint: 'orig', rim: 'serie', neon: 'aus', hyd: 'serie', sound: 'radio', extra: 'nix' };
export const part = (slot: Slot, id: string) => PARTS[slot].find((p) => p.id === id) || PARTS[slot][0];
export const isStock = (p: Pimp) => (Object.keys(STOCK) as Slot[]).every((k) => p[k] === STOCK[k]);

/* ---------- eigener Wagen: gespeichert als „paint,rim,neon,hyd,sound,extra“ in flags.pimp ---------- */
const ORDER: Slot[] = ['paint', 'rim', 'neon', 'hyd', 'sound', 'extra'];
export function readPimp(s: SaveData): Pimp {
  const raw = String(s.flags.pimp || '').split(','), p = { ...STOCK };
  ORDER.forEach((k, i) => { if (raw[i] && PARTS[k].some((q) => q.id === raw[i])) p[k] = raw[i]; });
  return p;
}
export function writePimp(s: SaveData, p: Pimp) { s.flags.pimp = ORDER.map((k) => p[k]).join(','); }
/** Teil für den eigenen Wagen kaufen (Lack zählt als Lack in der Garage) */
export function buyPart(s: SaveData, slot: Slot, id: string): string | null {
  const p = readPimp(s), q = part(slot, id);
  if (p[slot] === q.id) return 'Ist schon eingebaut.';
  if (s.money < q.cost) return `Dafür fehlen dir ${q.cost - s.money} €.`;
  s.money -= q.cost; p[slot] = q.id; writePimp(s, p);
  if (slot === 'paint') { if (q.hue === undefined || q.hue < 0) delete s.flags.carHue; else s.flags.carHue = q.hue; }
  return null;
}

/* ---------- Kundschaft der Show ---------- */
export interface Client {
  id: string; name: string; color: string; car: string; /** wie die Rostlaube heißt */ wreck: string;
  story: string; wish: string; likes: Tag[]; hates: Tag[]; budget: number;
  /** wohin der fertige Wagen gebracht wird */ to: [number, number, string];
  wow: string; ok: string; meh: string;
}
export const CLIENTS: Client[] = [
  { id: 'jacky', name: 'Jacky Juwel', color: '#ff6ad5', car: 'flitzer', wreck: 'Kleinwagen mit Beule und Klebeband-Spiegel', budget: 700, likes: ['glam', 'party'], hates: ['sport'],
    story: 'Ich bin die neueste Queen im Kaleidoskop. Aber ich komme mit dem Bus zur Show, mit Perücke im Rucksack. Das ist kein Auftritt, das ist ein Unfall!',
    wish: 'Ich will, dass die Leute schon klatschen, bevor ich ausgestiegen bin. Glamour, Baby!', to: [135, 30, 'Kaleidoskop am Neonplatz'],
    wow: 'Ich … ich hab Wimpern verloren. Vor Weinen. DAS ist mein Auto? Rosi, ich heirate dich!', ok: 'Oh, der ist hübsch! Da kann ich mit arbeiten, Schätzchen.', meh: 'Hm. Er fährt. Und er ist … sehr du. Nicht so sehr ich.' },
  { id: 'guenther', name: 'Günther (78)', color: '#ffd23b', car: 'suv', wreck: 'Geländewagen von 1994, Rost an allen Türen', budget: 650, likes: ['pride', 'edel'], hates: ['party'],
    story: 'Walter und ich sind seit 51 Jahren zusammen. Früher mussten wir uns verstecken. Dieses Jahr fahren wir zum ersten Mal beim CSD mit.',
    wish: 'Er soll stolz aussehen. So wie wir. Aber bitte nichts, was wackelt – Walters Hüfte.', to: [-4, -10, 'Regenbogenhaus'],
    wow: 'Walter wird weinen. Ich weine ja schon. 1972 hätte uns so ein Auto niemand gegönnt.', ok: 'Schön ist der geworden. Danke, mein Kind.', meh: 'Das ist … laut. Walter und ich sind eher leise Leute.' },
  { id: 'mirasanne', name: 'Mira & Sanne', color: '#3ee69a', car: 'bulli', wreck: 'Bulli mit Rostloch im Heck', budget: 800, likes: ['party', 'cool'], hates: ['edel'],
    story: 'Wir fahren jeden Sommer auf Festivals. Letztes Jahr ist uns der Auspuff auf der Autobahn abgefallen. Mitten im Konvoi.',
    wish: 'Wir wollen DIE Party auf dem Campingplatz sein. Bass, Licht, alles!', to: [-80, 30, 'Strandbar Sandbank'],
    wow: 'Sanne, guck dir das an! Wir ziehen nie wieder aus diesem Auto aus!', ok: 'Cool! Damit fallen wir auf jeden Fall auf.', meh: 'Sehr … schick. Wir sind eher Zelt und Matsch als Oper.' },
  { id: 'kai', name: 'Kai', color: '#5ce1ff', car: 'sport', wreck: 'Sportcoupé ohne Stoßstange, Baujahr Steinzeit', budget: 600, likes: ['sport', 'cool'], hates: ['glam'],
    story: 'Ich hab jahrelang für meine Transition gespart. Jetzt ist das geschafft, und ich will endlich was nur für mich. Ich fahre Pizza aus.',
    wish: 'Schnell soll er aussehen. Und ein bisschen gefährlich. Ich bin nicht mehr der kleine Unsichtbare.', to: [34, -20, 'Muckibude'],
    wow: 'Alter. ALTER. Ich bin der schnellste Pizzabote der Stadt. Danke, ehrlich.', ok: 'Nice. Damit komm ich klar.', meh: 'Hm, ganz schön … glitzerig. Na ja, geschenkt ist geschenkt.' },
  { id: 'bodo', name: 'Bodo vom Bärenclub', color: '#c98a4b', car: 'pickup', wreck: 'Pick-up mit zerbeultem Dach', budget: 900, likes: ['party', 'sport'], hates: ['glam'],
    story: 'Der Bärenclub braucht einen Shuttle für die Leder-Nacht. Die Jungs sitzen sonst im Taxi wie Sardinen.',
    wish: 'Bass muss rein, und er soll hüpfen. Die Jungs wollen Spaß, keine Krönchen.', to: [-71, -12, 'Club Leuchtturm'],
    wow: 'BRUMM! Rosi, das ist der geilste Shuttle der Stadt. Die Jungs werden ausflippen.', ok: 'Passt. Damit kommen wir an.', meh: 'Krone? Auf meinem Auto? Meine Jungs lachen mich aus.' },
  { id: 'noa', name: 'Noa', color: '#c9a2ff', car: 'lux', wreck: 'schwarzer Erbonkel-SUV, Dach voller Vogelkacke', budget: 750, likes: ['pride', 'glam'], hates: ['sport'],
    story: 'Ich mache Videos über queere Geschichte. Meine Follower sagen, mein Auto sieht aus wie ein Beerdigungswagen.',
    wish: 'Mein Auto soll aussehen wie mein Kanal: bunt, laut, voller Stolz.', to: [34, 10, 'Boutique Fabelhaft'],
    wow: 'Das ist SO gut. Ich filme ab sofort jedes Video in diesem Auto. Kommentare: „WAS?!“', ok: 'Schön! Das gibt ein gutes Video.', meh: 'Hm. Für den Kanal brauche ich mehr Farbe.' },
];
/** Nächste Folge: reihum nach Anzahl gespielter Folgen */
export const episode = (s: SaveData) => Number(s.flags.showEp) || 0;
export const clientFor = (s: SaveData) => CLIENTS[episode(s) % CLIENTS.length];

/** Kosten eines Umbaus */
export const spent = (p: Pimp) => (Object.keys(p) as Slot[]).reduce((n, k) => n + part(k, p[k]).cost, 0);
/** Wie gut trifft der Umbau den Wunsch? Treffer +2, Abneigung −3, sonst +1 für jedes eingebaute Teil */
export function rate(c: Client, p: Pimp) {
  let pts = 0, hits = 0, miss = 0;
  for (const k of Object.keys(p) as Slot[]) {
    const q = part(k, p[k]); if (!q.cost) continue;
    if (q.tag && c.hates.includes(q.tag)) { pts -= 3; miss++; } else if (q.tag && c.likes.includes(q.tag)) { pts += 2; hits++; } else pts += 1;
  }
  // Günther verträgt keine Hüpf-Hydraulik (Walters Hüfte)
  if (c.id === 'guenther' && (p.hyd === 'huepf' || p.hyd === 'twerk')) { pts -= 3; miss++; }
  const level: 'wow' | 'ok' | 'meh' = pts >= 8 && !miss ? 'wow' : pts >= 4 ? 'ok' : 'meh';
  return { pts, hits, miss, level };
}
/** Honorar und Ruf nach der Enthüllung */
export function showPay(c: Client, p: Pimp) {
  const r = rate(c, p), left = Math.max(0, c.budget - spent(p));
  const pay = Math.max(60, 140 + r.pts * 30 + Math.round(left * .1));
  return { ...r, pay, rep: r.level === 'wow' ? 4 : r.level === 'ok' ? 2 : 1, stars: r.level === 'wow' ? 5 : r.level === 'ok' ? 3 : 1 };
}
export function finishShow(s: SaveData, c: Client, p: Pimp) {
  const r = showPay(c, p);
  s.money += r.pay; s.rep += r.rep; s.flags.showEp = episode(s) + 1;
  if (r.level === 'wow') s.flags.showWow = (Number(s.flags.showWow) || 0) + 1;
  return r;
}
