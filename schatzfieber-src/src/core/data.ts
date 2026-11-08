/** Gegenstände, Laden, Museum, Strandhaus, Hauptgeschichte und die vier Rätselorte */
import type { DungeonDef, ItemDef } from './types';

export const ITEMS: ItemDef[] = [
  // Werkzeuge
  { id: 'shovel', name: 'Schaufel', icon: '⛏️', kind: 'tool', desc: 'Tante Heddas alte Schaufel. An glitzernden Stellen graben.' },
  { id: 'lamp', name: 'Laterne', icon: '🏮', kind: 'tool', desc: 'Leuchtet in dunklen Höhlen.', price: 60 },
  { id: 'machete', name: 'Machete', icon: '🔪', kind: 'tool', desc: 'Schneidet Lianen und dichtes Gestrüpp.', price: 120 },
  { id: 'goggles', name: 'Taucherbrille', icon: '🤿', kind: 'tool', desc: 'An sprudelnden Stellen im Meer tauchen.' },
  { id: 'rope', name: 'Kletterseil', icon: '🪢', kind: 'tool', desc: 'Für Lianenwände und den Weg zum Vulkantempel.', price: 150 },
  // Hauptgeschichte
  { id: 'house_key', name: 'Hausschlüssel', icon: '🗝️', kind: 'quest', desc: 'Schlüssel zu Tante Heddas Strandhaus.' },
  { id: 'journal', name: 'Heddas Tagebuch', icon: '📔', kind: 'quest', desc: 'Notizen über die Kapitänin Ysolde und ihr Amulett.' },
  { id: 'lighthouse_key', name: 'Leuchtturmschlüssel', icon: '🔑', kind: 'quest', desc: 'Öffnet den Keller unter dem Leuchtturm.' },
  { id: 'amulet_sun', name: 'Amulett: Sonne', icon: '☀️', kind: 'quest', desc: 'Erstes Stück von Ysoldes Herz-Amulett.' },
  { id: 'amulet_moon', name: 'Amulett: Mond', icon: '🌙', kind: 'quest', desc: 'Zweites Stück von Ysoldes Herz-Amulett.' },
  { id: 'amulet_star', name: 'Amulett: Stern', icon: '⭐', kind: 'quest', desc: 'Drittes Stück von Ysoldes Herz-Amulett.' },
  { id: 'amulet_heart', name: 'Herz der Insel', icon: '💖', kind: 'quest', desc: 'Das vollständige Amulett der Kapitänin.' },
  // Geschenke (Laden)
  { id: 'rose', name: 'Rote Rose', icon: '🌹', kind: 'gift', desc: 'Klassisch romantisch.', price: 12, value: 4 },
  { id: 'lily', name: 'Orchidee', icon: '🌸', kind: 'gift', desc: 'Eine seltene Inselorchidee.', price: 16, value: 5 },
  { id: 'wine', name: 'Rotwein', icon: '🍷', kind: 'gift', desc: 'Ein guter Tropfen vom Festland.', price: 30, value: 10 },
  { id: 'chocolate', name: 'Pralinen', icon: '🍫', kind: 'gift', desc: 'Handgemachte Kokos-Pralinen.', price: 18, value: 6 },
  { id: 'book', name: 'Gedichtband', icon: '📖', kind: 'gift', desc: 'Liebesgedichte aus drei Jahrhunderten.', price: 22, value: 7 },
  { id: 'perfume', name: 'Parfüm', icon: '🧴', kind: 'gift', desc: 'Duft nach Vanille und Meer.', price: 45, value: 15 },
  { id: 'coffee', name: 'Kaffeebohnen', icon: '☕', kind: 'gift', desc: 'Frisch geröstet.', price: 15, value: 5 },
  { id: 'tea', name: 'Kräutertee', icon: '🍵', kind: 'gift', desc: 'Zitronengras und Hibiskus.', price: 14, value: 4 },
  { id: 'surfwax', name: 'Surfwachs', icon: '🏄', kind: 'gift', desc: 'Kokosduft, beste Haftung.', price: 10, value: 3 },
  { id: 'paints', name: 'Farbkasten', icon: '🎨', kind: 'gift', desc: 'Leuchtende Aquarellfarben.', price: 28, value: 9 },
  { id: 'star_map', name: 'Sternkarte', icon: '🗺️', kind: 'gift', desc: 'Der Himmel über der Karibik.', price: 35, value: 12 },
  { id: 'necklace', name: 'Muschelkette', icon: '📿', kind: 'gift', desc: 'Handgefädelt, schimmernd.', price: 40, value: 14 },
  { id: 'strings', name: 'Gitarrensaiten', icon: '🎸', kind: 'gift', desc: 'Ein Satz Bronzesaiten.', price: 20, value: 6 },
  { id: 'sunglasses', name: 'Sonnenbrille', icon: '🕶️', kind: 'gift', desc: 'Verspiegelt, sehr cool.', price: 25, value: 8 },
  { id: 'oil', name: 'Lampenöl', icon: '🛢️', kind: 'gift', desc: 'Für alte Öllampen und Leuchtfeuer.', price: 25, value: 8 },
  { id: 'bait', name: 'Angelköder', icon: '🪱', kind: 'gift', desc: 'Fische lieben ihn. Menschen eher nicht.', price: 8, value: 2 },
  // Fundstücke
  { id: 'shell', name: 'Muschel', icon: '🐚', kind: 'find', desc: 'Am Strand gefunden.', value: 3 },
  { id: 'coconut', name: 'Kokosnuss', icon: '🥥', kind: 'find', desc: 'Frisch von der Palme.', value: 4 },
  { id: 'pearl', name: 'Perle', icon: '⚪', kind: 'find', desc: 'Eine schimmernde Meeresperle.', value: 60 },
  // Artefakte (Museum)
  { id: 'pottery', name: 'Tonscherbe', icon: '🏺', kind: 'artifact', desc: 'Bemalte Scherbe der Ureinwohner.', value: 14 },
  { id: 'cannonball', name: 'Kanonenkugel', icon: '⚫', kind: 'artifact', desc: 'Rostig und schwer.', value: 16 },
  { id: 'coin_silver', name: 'Silbermünze', icon: '🪙', kind: 'artifact', desc: 'Spanische Silbermünze, 1702.', value: 22 },
  { id: 'coin_gold', name: 'Golddublone', icon: '🟡', kind: 'artifact', desc: 'Gold aus Ysoldes Zeit.', value: 45 },
  { id: 'bottle', name: 'Flaschenpost', icon: '🍾', kind: 'artifact', desc: 'Ein vergilbter Brief steckt darin.', value: 40 },
  { id: 'dagger', name: 'Piratendolch', icon: '🗡️', kind: 'artifact', desc: 'Mit eingraviertem Herz.', value: 65 },
  { id: 'compass', name: 'Messingkompass', icon: '🧭', kind: 'artifact', desc: 'Zeigt nicht nach Norden, sondern … zum Vulkan?', value: 70 },
  { id: 'spyglass', name: 'Fernrohr', icon: '🔭', kind: 'artifact', desc: 'Ysoldes Initialen am Messingring.', value: 90 },
  { id: 'bracelet', name: 'Goldarmreif', icon: '💛', kind: 'artifact', desc: 'Fein ziseliert.', value: 95 },
  { id: 'idol', name: 'Jade-Idol', icon: '🗿', kind: 'artifact', desc: 'Kleine Figur aus grüner Jade.', value: 110 },
  { id: 'mask', name: 'Ritualmaske', icon: '🎭', kind: 'artifact', desc: 'Holz, Muscheln und Federn.', value: 120 },
  { id: 'skull', name: 'Kristallschädel', icon: '💎', kind: 'artifact', desc: 'Funkelt im Licht. Unheimlich schön.', value: 160 },
];
export const item = (id: string) => ITEMS.find((i) => i.id === id)!;
export const ARTIFACTS = ITEMS.filter((i) => i.kind === 'artifact').map((i) => i.id);

/** Laden: Werkzeuge erscheinen, sobald sie gebraucht werden */
export const SHOP = ['lamp', 'machete', 'rope', 'oil', 'rose', 'lily', 'wine', 'chocolate', 'book', 'perfume', 'coffee', 'tea', 'surfwax', 'paints', 'star_map', 'necklace', 'strings', 'sunglasses', 'bait'];

/** Beute: Graben, Tauchen (Gewichte) */
export const DIG_LOOT: [string, number][] = [
  ['pottery', 22], ['cannonball', 16], ['coin_silver', 18], ['coin_gold', 9], ['bottle', 7], ['dagger', 6], ['compass', 4], ['bracelet', 3], ['shell', 15],
];
export const DIVE_LOOT: [string, number][] = [
  ['pearl', 30], ['coin_gold', 16], ['bracelet', 10], ['bottle', 12], ['compass', 7], ['coin_silver', 15], ['skull', 2], ['spyglass', 3],
];

/** Museum: Belohnungen für Spenden */
export const MUSEUM_REWARDS: { n: number; money: number; text: string }[] = [
  { n: 3, money: 120, text: 'Die erste Vitrine ist gefüllt! Das Museum zahlt dir einen Finderlohn.' },
  { n: 6, money: 250, text: 'Halbzeit! Die Ausstellung „Ysoldes Erbe“ eröffnet – und du bekommst einen Anteil der Eintrittsgelder.' },
  { n: 9, money: 400, text: 'Besucher kommen sogar vom Festland. Großer Finderlohn!' },
  { n: 12, money: 800, text: 'Die Sammlung ist vollständig – du bist die Legende von Isla Corazón!' },
];

/** Strandhaus-Ausbau */
export const RENOVATIONS = [
  { id: 1, name: 'Dach & Fenster', cost: 200, desc: 'Kein Regen mehr im Bett. Neue Fensterläden in Türkis.' },
  { id: 2, name: 'Terrasse & Möbel', cost: 350, desc: 'Holzterrasse mit Lounge-Sofa und Esstisch für zwei.' },
  { id: 3, name: 'Hängematte & Lichterketten', cost: 300, desc: 'Abends leuchtet das ganze Haus.' },
  { id: 4, name: 'Pool & Außendusche', cost: 600, desc: 'Ein kleiner Pool mit Blick aufs Meer.' },
];

/** Symbole der Zahlenschlösser */
export const SYMBOLS = ['☀️', '🌙', '⭐', '🌊', '🐚', '⚓', '🕊️', '💀'];

/** Die vier Rätselorte. Zeichen: # Wand, . Boden, S Ein-/Ausgang, C Kiste, a–c Druckplatte, A–C Tor (öffnet bei allen Platten der Gruppe),
 *  1–4 Hebel, L Hebeltor, K Symbolschloss, H Inschrift, t kleine Truhe, T Amulett-Truhe, V Lianen (Machete), ~ Lava, Q Altar, O Altartor, Z Schatz */
export const DUNGEONS: DungeonDef[] = [
  {
    id: 'cave', name: 'Höhle der Gezeiten', poi: 'cave', needs: 'lamp', theme: 'cave', amulet: 'amulet_sun',
    grid: [
      '#############',
      '#####T#######',
      '#####.#######',
      '#####K#######',
      '###H...t#####',
      '###.....#####',
      '#####A#######',
      '#.....C..a..#',
      '#.H.........#',
      '#.....S.....#',
      '#############',
    ],
    hints: {
      '2,8': '„Wer weiter will, schiebe den Stein dorthin, wo die Flut ihn tragen würde – auf die Muschelplatte im Osten.“',
      '3,4': '„Ysolde liebte drei Dinge: den ersten Strahl des Morgens, den Schatz des Strandes und das Lied des Meeres.“',
    },
    code: [0, 4, 3],
    loot: ['dagger'],
  },
  {
    id: 'ruins', name: 'Dschungelruine', poi: 'ruins', needs: 'machete', theme: 'ruin', amulet: 'amulet_moon',
    grid: [
      '###############',
      '######.T.######',
      '######...######',
      '#######L#######',
      '#1...........2#',
      '#......H......#',
      '#3...........4#',
      '#######B#######',
      '#.............#',
      '#..C...b..C...#',
      '#......#t#....#',
      '#..b..V.V.....#',
      '#######.#######',
      '#######S#######',
      '###############',
    ],
    hints: {
      '7,5': '„Der Jaguar weckt den Affen. Der Affe ruft den Adler. Der Adler jagt die Schlange.“ – Darunter vier Tiere: Schlange (Nordwest), Adler (Nordost), Jaguar (Südwest), Affe (Südost).',
    },
    leverOrder: [3, 4, 2, 1],
    leverNames: ['Schlange', 'Adler', 'Jaguar', 'Affe'],
    loot: ['idol'],
  },
  {
    id: 'cellar', name: 'Leuchtturm-Gewölbe', poi: 'lighthouse', needs: 'lighthouse_key', theme: 'cellar', amulet: 'amulet_star',
    grid: [
      '#############',
      '#####.T.#####',
      '#####...#####',
      '######K######',
      '######.######',
      '######A######',
      '#...........#',
      '#..C.....C..#',
      '#.a.......a.#',
      '#....#H#....#',
      '#...........#',
      '######S######',
      '#############',
    ],
    hints: {
      '6,9': '„Erst das Meer, das uns trägt. Dann der Halt, der uns bleibt. Dann der Vogel, der heimkehrt. Zuletzt das Licht der Nacht.“',
    },
    code: [3, 5, 6, 2],
    loot: [],
  },
  {
    id: 'temple', name: 'Vulkantempel', poi: 'temple', needs: 'rope', theme: 'temple', amulet: 'amulet_heart',
    grid: [
      '#################',
      '#######.Z.#######',
      '#######...#######',
      '########O########',
      '######~...~######',
      '######~.Q.~######',
      '######~...~######',
      '########L########',
      '#~.............~#',
      '#~.1....H....2.~#',
      '#~.............~#',
      '#~.3.........4.~#',
      '########C########',
      '#...............#',
      '#..C.......C....#',
      '#...c.....c.....#',
      '#......#t#......#',
      '#...H...........#',
      '#.....C.c.......#',
      '########S########',
      '#################',
    ],
    hints: {
      '4,17': '„Drei Steine, drei Siegel. Nur wer alle trägt, darf weiter.“',
      '8,9': '„Die Sonne steigt aus dem Meer im Osten, erreicht den Gipfel im Nordosten, sinkt im Nordwesten – und die Nacht kehrt im Südwesten heim.“ – Hebel: Nordwest, Nordost, Südwest, Südost.',
    },
    leverOrder: [4, 2, 1, 3],
    leverNames: ['Nordwest', 'Nordost', 'Südwest', 'Südost'],
    loot: ['mask'],
  },
];
export const dungeon = (id: string) => DUNGEONS.find((d) => d.id === id)!;

/** Hauptgeschichte: Tagebuch-Einträge in Reihenfolge */
export const MAIN_QUESTS: { id: string; title: string; text: string; done: string }[] = [
  { id: 'q_arrive', title: 'Ankunft auf Isla Corazón', text: 'Sprich am Hafen mit Hafenmeister Jonas – er hat den Schlüssel zu Tante Heddas Strandhaus.', done: 'house_key' },
  { id: 'q_house', title: 'Tante Heddas Erbe', text: 'Geh zu deinem Strandhaus im Südwesten und sieh dich drinnen um.', done: 'journal' },
  { id: 'q_lea', title: 'Die Legende der Kapitänin', text: 'Zeig Heddas Tagebuch Lea im Inselmuseum am Marktplatz.', done: 'leaMap' },
  { id: 'q_cave', title: 'Die Höhle der Gezeiten', text: 'Kauf eine Laterne im Kramladen und erkunde die Höhle an der Ostküste.', done: 'amulet_sun' },
  { id: 'q_ruins', title: 'Die Dschungelruine', text: 'Mit einer Machete aus dem Kramladen kommst du durch die Lianen der Ruine im Westen.', done: 'amulet_moon' },
  { id: 'q_light', title: 'Das Leuchtturm-Gewölbe', text: 'Leuchtturmwärterin Mira hat den Schlüssel zum Keller. Vielleicht hilfst du ihr zuerst?', done: 'amulet_star' },
  { id: 'q_temple', title: 'Das Herz der Insel', text: 'Mit Kletterseil und drei Amulett-Stücken steigst du zum Vulkantempel auf.', done: 'treasure' },
];
