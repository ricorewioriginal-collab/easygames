/* Unterwäsche und Badesachen: verschiedene Schnitte, Farben und Muster. Gemalt wird auf den nackten Sport-Körper
   (outfit.ts garment), deshalb sitzt jeder Schnitt an der richtigen Körperstelle. NPCs bekommen ihre Wäsche fest aus der
   Figuren-ID, die Spielfigur wählt im Kleiderschrank (flags.wash). */
export type Cut = 'slip' | 'boxer' | 'jock' | 'string' | 'hipster' | 'trunks' | 'tanga' | 'jeans';
export type Pat = 'uni' | 'streifen' | 'punkte' | 'spitze' | 'bund';
export interface Wash { id: string; name: string; g: 'm' | 'f'; cut: Cut; bra?: boolean; col: number; acc: number; pat: Pat; swim?: boolean; /** BH in eigener Farbe (zur Hose) */ braCol?: number }

const W = (id: string, name: string, g: 'm' | 'f', cut: Cut, col: number, acc: number, pat: Pat, extra: Partial<Wash> = {}): Wash => ({ id, name, g, cut, col, acc, pat, bra: g === 'f', ...extra });
export const WASH: Wash[] = [
  // Männer
  W('m_slip_weiss', 'Slip weiß', 'm', 'slip', 0xf2f2f0, 0x9aa3ad, 'bund'),
  W('m_slip_schwarz', 'Slip schwarz', 'm', 'slip', 0x17171b, 0xd8d8d8, 'bund'),
  W('m_slip_streifen', 'Slip gestreift', 'm', 'slip', 0x1f3a8a, 0xf3f3f3, 'streifen'),
  W('m_boxer_grau', 'Boxershorts grau', 'm', 'boxer', 0x6b7076, 0x1b1b1f, 'bund'),
  W('m_boxer_rot', 'Boxershorts rot', 'm', 'boxer', 0xb3192d, 0x15151a, 'bund'),
  W('m_boxer_punkte', 'Boxershorts gepunktet', 'm', 'boxer', 0x274472, 0xf4f4f4, 'punkte'),
  W('m_jock_schwarz', 'Jockstrap schwarz', 'm', 'jock', 0x141417, 0xff2a6d, 'bund'),
  W('m_jock_weiss', 'Jockstrap weiß', 'm', 'jock', 0xf0f0ee, 0x1e5bd6, 'bund'),
  W('m_jock_neon', 'Jockstrap neon', 'm', 'jock', 0x39ff88, 0x141417, 'bund'),
  W('m_string', 'String', 'm', 'string', 0x8a1fd1, 0x8a1fd1, 'uni'),
  W('m_badehose', 'Badeshorts', 'm', 'trunks', 0x1fa6c9, 0xffd23f, 'streifen', { swim: true }),
  W('m_speedo', 'Badeslip', 'm', 'slip', 0xe8401c, 0x141417, 'bund', { swim: true }),
  // Frauen (mit BH bzw. Bikini-Oberteil)
  W('f_hipster_schwarz', 'Hipster schwarz', 'f', 'hipster', 0x141417, 0x141417, 'spitze'),
  W('f_hipster_rosa', 'Hipster rosa', 'f', 'hipster', 0xf4a6c0, 0xffffff, 'uni'),
  W('f_slip_weiss', 'Slip weiß', 'f', 'slip', 0xf3f1ec, 0xe7d9cf, 'spitze'),
  W('f_string_rot', 'String rot', 'f', 'string', 0xb5122e, 0xb5122e, 'spitze'),
  W('f_tanga_beige', 'Tanga hautfarben', 'f', 'tanga', 0xd9b39a, 0xc79c84, 'uni'),
  W('f_tanga_punkte', 'Tanga gepunktet', 'f', 'tanga', 0x1b2b5a, 0xfafafa, 'punkte'),
  W('f_sport', 'Sport-Set', 'f', 'hipster', 0x5d6470, 0x111111, 'bund'),
  W('f_bikini', 'Bikini', 'f', 'hipster', 0x2a8fff, 0xffffff, 'streifen', { swim: true }),
  W('f_bikini_string', 'String-Bikini', 'f', 'tanga', 0xff4fa3, 0xffd23f, 'uni', { swim: true }),
];

const hash = (id: string) => { let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/** Wäsche für eine Figur: gewählt (id) oder fest aus der Figur; swim = Badesachen */
export function washFor(g: 'm' | 'f', swim: boolean, seed: string, pick?: string): Wash {
  const list = WASH.filter((w) => w.g === g && !!w.swim === swim);
  const chosen = pick && list.find((w) => w.id === pick);
  if (chosen) return chosen;
  const base = list[hash(seed + (swim ? 's' : 'u')) % list.length];
  // NPCs: eigene Farbe, damit nicht alle gleich aussehen
  if (pick) return base;
  const h = hash(seed + 'farbe'), hue = (h % 360) / 360, sat = .35 + ((h >>> 9) % 50) / 100, lig = .18 + ((h >>> 15) % 60) / 100;
  return { ...base, col: hsl(hue, sat, lig), acc: (h >>> 20) % 3 === 0 ? 0xf2f2f2 : base.acc };
}
/** Auswahl im Kleiderschrank (ohne Badesachen) */
export const washChoices = (g: 'm' | 'f', swim = false) => WASH.filter((w) => w.g === g && !!w.swim === swim);
function hsl(h: number, s: number, l: number) {
  const f = (n: number) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return (f(0) << 16) | (f(8) << 8) | f(4);
}
