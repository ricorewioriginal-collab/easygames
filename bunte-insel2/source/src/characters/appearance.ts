/* Aussehen der Spielfigur: Datenmodell, Optionen, Prüfung. Reine Daten – auch in Tests nutzbar. */

export interface Appearance {
  age: 0 | 1 | 2;            // Kind, Jugendlich, Erwachsen
  height: number;            // 0..4
  build: number;             // 0..2 (schmal, normal, kräftig)
  skin: number;
  face: number;              // Gesichtsform 0..2
  eyes: number;              // Augenfarbe
  brows: number;             // 0..2
  mouth: number;             // 0..3
  cheeks: boolean;
  freckles: boolean;
  hair: string;
  hairColor: number;
  beard: string;
  top: string;
  topColor: number;
  pattern: string;
  bottom: string;
  bottomColor: number;
  shoes: string;
  shoeColor: number;
  hat: string;
  hatColor: number;
  acc: string;
  accColor: number;
  glasses: string;
}

export interface OptionDef { id: string; name: string; icon: string; unlock?: string }

export const SKIN = [0xffe0c4, 0xf6cfa8, 0xe9b98e, 0xd59b6c, 0xb87b4f, 0x8f5a36, 0x6b4226, 0x4f2f1b, 0xffd2b0, 0xa8d8ff, 0xb9f2b0, 0xf7b6e8, 0xff9a4d, 0xd9dde6];
export const SKIN_NAMES = ['Hell', 'Pfirsich', 'Honig', 'Karamell', 'Zimt', 'Kakao', 'Espresso', 'Dunkel', 'Rosig', 'Feen-Blau', 'Elfen-Grün', 'Zuckerwatte', 'Fuchs-Orange', 'Silber'];
export const HAIR_COLORS = [0xf5d36b, 0xe8b04a, 0xb06a2b, 0x6b3a1e, 0x2e1c12, 0x111111, 0xc0392b, 0xff7f2a, 0xe6e6e6, 0x9aa0a8, 0xff5fb0, 0x8a5bff, 0x3fa9ff, 0x2fd17b, 0xfff07a, 0x40e0d0];
export const EYE_COLORS = [0x5a3b1c, 0x2f6fb5, 0x2f8f4f, 0x7a7a7a, 0x8a5a2b, 0x3b2a1a, 0x8a4fff, 0x00b3b3];
export const CLOTH_COLORS = [0xe8453c, 0xff8a1f, 0xffd23f, 0x4cd07d, 0x2fb9a8, 0x3f8cff, 0x5b4bd6, 0xb36bff, 0xff6fb5, 0xffffff, 0x9aa0a8, 0x2d2f3a, 0x8a5a33, 0xc9a26b, 0x1f4e8c, 0x7fd8ff];

export const HAIR: OptionDef[] = [
  { id: 'pilz', name: 'Pilzkopf', icon: '🍄' }, { id: 'kurz', name: 'Kurz', icon: '✂️' }, { id: 'strubbel', name: 'Strubbel', icon: '🌪️' },
  { id: 'zopf', name: 'Pferdeschwanz', icon: '🎀' }, { id: 'zoepfe', name: 'Zwei Zöpfe', icon: '👧' }, { id: 'lang', name: 'Lang', icon: '💇' },
  { id: 'locken', name: 'Locken', icon: '🌀' }, { id: 'dutt', name: 'Dutt', icon: '🍙' }, { id: 'afro', name: 'Afro', icon: '☁️' },
  { id: 'irokese', name: 'Irokese', icon: '🦔' }, { id: 'bob', name: 'Bob', icon: '🔔' }, { id: 'glatze', name: 'Glatze', icon: '🥚' },
  { id: 'seite', name: 'Seitenscheitel', icon: '〰️' }, { id: 'stachel', name: 'Stachelfrisur', icon: '⭐', unlock: 'ki_meister' }
];
export const BEARD: OptionDef[] = [
  { id: 'none', name: 'Kein Bart', icon: '🚫' }, { id: 'stoppel', name: 'Stoppeln', icon: '🌾' }, { id: 'schnurr', name: 'Schnurrbart', icon: '🥸' },
  { id: 'kinn', name: 'Kinnbart', icon: '🐐' }, { id: 'voll', name: 'Vollbart', icon: '🧔' }
];
export const TOPS: OptionDef[] = [
  { id: 'tshirt', name: 'T-Shirt', icon: '👕' }, { id: 'hoodie', name: 'Kapuzenpulli', icon: '🧥' }, { id: 'kleid', name: 'Kleid', icon: '👗' },
  { id: 'latz', name: 'Latzhose', icon: '👖' }, { id: 'jacke', name: 'Abenteuerjacke', icon: '🧭' }, { id: 'robe', name: 'Zauberrobe', icon: '🧙', unlock: 'maerchen_held' },
  { id: 'ruestung', name: 'Waldrüstung', icon: '🛡️', unlock: 'wald_held' }, { id: 'uniform', name: 'Fellretter-Uniform', icon: '🐾', unlock: 'fellretter' }
];
export const PATTERNS: OptionDef[] = [
  { id: 'none', name: 'Ohne', icon: '⬜' }, { id: 'streifen', name: 'Streifen', icon: '🦓' }, { id: 'stern', name: 'Stern', icon: '⭐' },
  { id: 'herz', name: 'Herz', icon: '❤️' }, { id: 'blitz', name: 'Blitz', icon: '⚡' }, { id: 'regenbogen', name: 'Regenbogen', icon: '🌈' }
];
export const BOTTOMS: OptionDef[] = [
  { id: 'hose', name: 'Hose', icon: '👖' }, { id: 'shorts', name: 'Shorts', icon: '🩳' }, { id: 'rock', name: 'Rock', icon: '🩰' }
];
export const SHOES: OptionDef[] = [
  { id: 'sneaker', name: 'Turnschuhe', icon: '👟' }, { id: 'stiefel', name: 'Stiefel', icon: '🥾' }, { id: 'sandale', name: 'Sandalen', icon: '🩴' }
];
export const HATS: OptionDef[] = [
  { id: 'none', name: 'Ohne', icon: '🚫' }, { id: 'cap', name: 'Cap', icon: '🧢' }, { id: 'muetze', name: 'Bommelmütze', icon: '🧶' },
  { id: 'krone', name: 'Krone', icon: '👑', unlock: 'insel_fest' }, { id: 'zauberhut', name: 'Zauberhut', icon: '🎩', unlock: 'maerchen_held' },
  { id: 'piratenhut', name: 'Piratenhut', icon: '🏴‍☠️' }, { id: 'hasenohren', name: 'Hasenohren', icon: '🐰' }, { id: 'katzenohren', name: 'Katzenohren', icon: '🐱' },
  { id: 'helm', name: 'Fahrradhelm', icon: '⛑️' }, { id: 'cowboy', name: 'Cowboyhut', icon: '🤠' }, { id: 'stirnband', name: 'Ki-Stirnband', icon: '🎽', unlock: 'ki_meister' },
  { id: 'drachenhelm', name: 'Drachenhelm', icon: '🐲', unlock: 'drachen_freund' }, { id: 'blume', name: 'Blumenkranz', icon: '🌼' }
];
export const ACCS: OptionDef[] = [
  { id: 'none', name: 'Ohne', icon: '🚫' }, { id: 'rucksack', name: 'Rucksack', icon: '🎒' }, { id: 'umhang', name: 'Umhang', icon: '🦸' },
  { id: 'schal', name: 'Schal', icon: '🧣' }, { id: 'fluegel', name: 'Feenflügel', icon: '🧚', unlock: 'feenstaub' },
  { id: 'drachenfluegel', name: 'Drachenflügel', icon: '🐉', unlock: 'gleiten' }, { id: 'fuchs', name: 'Fuchsschwanz', icon: '🦊', unlock: 'lunaris' }
];
export const GLASSES: OptionDef[] = [
  { id: 'none', name: 'Ohne', icon: '🚫' }, { id: 'rund', name: 'Rund', icon: '👓' }, { id: 'sonne', name: 'Sonnenbrille', icon: '🕶️' },
  { id: 'herz', name: 'Herzbrille', icon: '😍' }, { id: 'stern', name: 'Sternbrille', icon: '🤩', unlock: 'insel_fest' }
];

export const DEFAULT_APPEARANCE: Appearance = {
  age: 0, height: 2, build: 1, skin: 1, face: 0, eyes: 1, brows: 1, mouth: 0, cheeks: true, freckles: false,
  hair: 'pilz', hairColor: 0, beard: 'none',
  top: 'tshirt', topColor: 0, pattern: 'blitz', bottom: 'hose', bottomColor: 12, shoes: 'sneaker', shoeColor: 9,
  hat: 'none', hatColor: 5, acc: 'none', accColor: 3, glasses: 'none'
};

/** Vorlagen aus Bunte Insel 1 (Jannis als Held, dazu bekannte Gesichter). */
export const PRESETS: { id: string; name: string; look: Partial<Appearance> }[] = [
  { id: 'jannis', name: 'Jannis', look: { hair: 'pilz', hairColor: 0, top: 'tshirt', topColor: 0, pattern: 'blitz', bottom: 'hose', bottomColor: 12 } },
  { id: 'mia', name: 'Mia', look: { hair: 'zoepfe', hairColor: 3, top: 'kleid', topColor: 8, pattern: 'herz', bottom: 'rock', bottomColor: 8, skin: 2 } },
  { id: 'leo', name: 'Leo', look: { hair: 'locken', hairColor: 4, top: 'hoodie', topColor: 3, pattern: 'none', bottom: 'shorts', bottomColor: 14, skin: 5 } },
  { id: 'luna', name: 'Fee Luna', look: { hair: 'lang', hairColor: 11, top: 'kleid', topColor: 7, pattern: 'stern', bottom: 'rock', bottomColor: 7, acc: 'fluegel' } },
  { id: 'ben', name: 'Ritter Ben', look: { hair: 'kurz', hairColor: 2, top: 'jacke', topColor: 10, bottom: 'hose', bottomColor: 11, shoes: 'stiefel' } },
  { id: 'zoe', name: 'Astronautin Zoe', look: { hair: 'bob', hairColor: 5, top: 'jacke', topColor: 9, pattern: 'stern', bottom: 'hose', bottomColor: 9, skin: 6 } },
  { id: 'piet', name: "Käpt'n Piet", look: { hair: 'kurz', hairColor: 8, beard: 'voll', top: 'jacke', topColor: 14, hat: 'piratenhut', hatColor: 11, age: 2 } },
  { id: 'gerda', name: 'Oma Gerda', look: { hair: 'dutt', hairColor: 8, top: 'kleid', topColor: 4, pattern: 'none', age: 2, glasses: 'rund' } }
];

const inRange = (v: unknown, n: number, d: number): number => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < n ? v : d);
const inList = (v: unknown, list: OptionDef[], d: string): string => (typeof v === 'string' && list.some(o => o.id === v) ? v : d);

/** Ungültige oder fehlende Werte werden durch Standardwerte ersetzt (Spielstände bleiben ladbar). */
export function sanitizeAppearance(a: unknown): Appearance {
  const s = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
  const D = DEFAULT_APPEARANCE;
  return {
    age: inRange(s.age, 3, D.age) as 0 | 1 | 2,
    height: inRange(s.height, 5, D.height),
    build: inRange(s.build, 3, D.build),
    skin: inRange(s.skin, SKIN.length, D.skin),
    face: inRange(s.face, 3, D.face),
    eyes: inRange(s.eyes, EYE_COLORS.length, D.eyes),
    brows: inRange(s.brows, 3, D.brows),
    mouth: inRange(s.mouth, 4, D.mouth),
    cheeks: typeof s.cheeks === 'boolean' ? s.cheeks : D.cheeks,
    freckles: typeof s.freckles === 'boolean' ? s.freckles : D.freckles,
    hair: inList(s.hair, HAIR, D.hair),
    hairColor: inRange(s.hairColor, HAIR_COLORS.length, D.hairColor),
    beard: inList(s.beard, BEARD, D.beard),
    top: inList(s.top, TOPS, D.top),
    topColor: inRange(s.topColor, CLOTH_COLORS.length, D.topColor),
    pattern: inList(s.pattern, PATTERNS, D.pattern),
    bottom: inList(s.bottom, BOTTOMS, D.bottom),
    bottomColor: inRange(s.bottomColor, CLOTH_COLORS.length, D.bottomColor),
    shoes: inList(s.shoes, SHOES, D.shoes),
    shoeColor: inRange(s.shoeColor, CLOTH_COLORS.length, D.shoeColor),
    hat: inList(s.hat, HATS, D.hat),
    hatColor: inRange(s.hatColor, CLOTH_COLORS.length, D.hatColor),
    acc: inList(s.acc, ACCS, D.acc),
    accColor: inRange(s.accColor, CLOTH_COLORS.length, D.accColor),
    glasses: inList(s.glasses, GLASSES, D.glasses)
  };
}

export function randomAppearance(rnd: () => number): Appearance {
  const pick = <T>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];
  const free = (l: OptionDef[]) => l.filter(o => !o.unlock).map(o => o.id);
  return sanitizeAppearance({
    age: Math.floor(rnd() * 3), height: Math.floor(rnd() * 5), build: Math.floor(rnd() * 3), skin: Math.floor(rnd() * 9),
    face: Math.floor(rnd() * 3), eyes: Math.floor(rnd() * 6), brows: Math.floor(rnd() * 3), mouth: Math.floor(rnd() * 4),
    cheeks: rnd() < .6, freckles: rnd() < .3, hair: pick(free(HAIR)), hairColor: Math.floor(rnd() * HAIR_COLORS.length),
    beard: rnd() < .15 ? pick(free(BEARD)) : 'none', top: pick(free(TOPS)), topColor: Math.floor(rnd() * CLOTH_COLORS.length),
    pattern: pick(free(PATTERNS)), bottom: pick(free(BOTTOMS)), bottomColor: Math.floor(rnd() * CLOTH_COLORS.length),
    shoes: pick(free(SHOES)), shoeColor: Math.floor(rnd() * CLOTH_COLORS.length), hat: rnd() < .4 ? pick(free(HATS)) : 'none',
    hatColor: Math.floor(rnd() * CLOTH_COLORS.length), acc: rnd() < .3 ? pick(free(ACCS)) : 'none', accColor: Math.floor(rnd() * CLOTH_COLORS.length),
    glasses: rnd() < .2 ? pick(free(GLASSES)) : 'none'
  });
}
