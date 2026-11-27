/* Menschen von Pride City: realistische Figuren von Sketchfab (CC BY, Namensnennung in public/CREDITS.md), mit dem
   Rocketbox-Skelett „Bip01 …“ ausgestattet (scripts/people.mjs). So teilen sich alle Figuren die vorhandenen Animationen
   (Laufen, Tanzen, Jubeln …), Muskeln, Outfits und Umarmungen. Berufe mit Uniform (Polizei, Feuerwehr, Sanitäter, Küche,
   Kurier), Kinder und die Sport-Körper unter Oberkörperfrei/Badesachen bleiben Microsoft-Rocketbox-Figuren (MIT).
   Alte Spielstände und Figuren mit früheren IDs (Male_Adult_03, Female_Party_02 …) bekommen über LEGACY die neue Figur. */

/** file = Modell unter assets/rb/ (sonst wie id) */
export interface Avatar { id: string; g: 'm' | 'f'; name: string; desc: string; job?: string; editor?: boolean; file: string }

const A = (id: string, g: 'm' | 'f', name: string, desc: string, job?: string, editor = false): Avatar => ({ id, g, name, desc, job, editor, file: id });

export const AVATARS: Avatar[] = [
  // Hauptfigur: Rico vom Cover (Trainingsjacke, Kette, Ohrring mit Kreuz, Septum) oder eine der Frauen
  A('pc_rico', 'm', 'Rico', 'Trainingsjacke, Kette, Septum', undefined, true),
  A('pc_c02', 'f', 'Mia', 'Bluse, Blumenrock', undefined, true), A('pc_c05', 'f', 'Samira', 'Kostüm, grau', undefined, true),
  A('pc_c07', 'f', 'Ella', 'Bluse, dunkler Rock', undefined, true), A('pc_c09', 'f', 'Lena', 'Shirt, oranger Rock', undefined, true),
  A('pc_c13', 'f', 'Kim', 'Strickjacke, Rock', undefined, true), A('pc_c14', 'f', 'Sasha', 'Bluse, weiße Hose', undefined, true),
  // Menschen der Stadt
  A('pc_c01', 'm', 'Jonas', 'Anzug, grau'), A('pc_c03', 'm', 'Kai', 'Jacke, Shirt'), A('pc_c04', 'm', 'Noah', 'Anzug, Krawatte'),
  A('pc_c06', 'm', 'Luca', 'Pulli, rot'), A('pc_c08', 'm', 'Sam', 'Sakko, kariert'), A('pc_c10', 'm', 'Ben', 'Hemd, grün'),
  A('pc_c11', 'm', 'Malik', 'Hemd, blau'),
  // Rico in Alltagskleidung (ohne Jacke, Kette, Piercings) und Tarek: nicht in der Menge, damit niemand doppelt herumläuft
  A('pc_c12', 'm', 'Rico (Hemd)', 'Hemdjacke, Bart', 'story'), A('pc_yakuza', 'm', 'Tarek', 'Anzug, Tattoos', 'story'),
  A('pc_gangster', 'm', 'Gangster', 'Tanktop, Maske', 'gang'), A('pc_streetg', 'm', 'Straßengangster', 'Tattoos, Maske', 'gang'),
  // Rocketbox: Sport-Körper, Uniformen, Kinder
  // Sport-Figuren auf der Straße: neue Figuren (die Rocketbox-Sportkörper bleiben nur unter Oberkörperfrei/Badesachen, koerper.ts)
  { ...A('Sports_Male_01', 'm', 'Rex', 'Sportlich', 'sport'), file: 'pc_c03' }, { ...A('Sports_Female_01', 'f', 'Jo', 'Sportlich', 'sport'), file: 'pc_c14' },
  { ...A('Business_Male_01', 'm', 'Jörg', 'Anzug', 'business'), file: 'pc_c01' },
  A('Police_Male_01', 'm', 'Polizist', 'Uniform', 'police'), A('Police_Female_01', 'f', 'Polizistin', 'Uniform', 'police'),
  A('Fire_Male_01', 'm', 'Feuerwehrmann', 'Einsatzkleidung', 'fire'), A('Fire_Female_01', 'f', 'Feuerwehrfrau', 'Einsatzkleidung', 'fire'),
  A('Medical_Female_01', 'f', 'Sanitäterin', 'Kittel', 'medical'), { ...A('Security_Male_01', 'm', 'Security', 'Türsteher', 'security'), file: 'pc_c04' },
  A('Chef_Female_01', 'f', 'Köchin', 'Kochjacke', 'chef'), A('Delivery_Male_01', 'm', 'Kurier', 'Lieferdienst', 'delivery'),
  A('Male_Child_01', 'm', 'Kind', 'Shirt, Jeans', 'kid'), A('Female_Child_01', 'f', 'Kind', 'Kleid, bunt', 'kid'),
];
/** frühere Rocketbox-Figuren → neue Figur (Story-Figuren, Spielstände, Online-Mitspieler) */
const MEN = ['pc_c01', 'pc_c03', 'pc_c04', 'pc_c06', 'pc_c08', 'pc_c10', 'pc_c11', 'pc_c04', 'pc_c06', 'pc_c03'];
const WOMEN = ['pc_c02', 'pc_c05', 'pc_c07', 'pc_c09', 'pc_c13', 'pc_c14'];
export const LEGACY: Record<string, string> = {};
for (let i = 1; i <= 10; i++) {
  LEGACY['Male_Adult_' + String(i).padStart(2, '0')] = MEN[i - 1];
  LEGACY['Female_Adult_' + String(i).padStart(2, '0')] = WOMEN[(i - 1) % WOMEN.length];
}
LEGACY.Female_Party_01 = 'pc_c09'; LEGACY.Female_Party_02 = 'pc_c05';
export const EDITOR_AVATARS = AVATARS.filter((a) => a.editor);
export const avatar = (id: string) => AVATARS.find((a) => a.id === id) || AVATARS.find((a) => a.id === LEGACY[id]);

const MALE = AVATARS.filter((a) => a.g === 'm' && !a.job && a.id.startsWith('pc_') && a.id !== 'pc_rico'), FEMALE = AVATARS.filter((a) => a.g === 'f' && !a.job && a.id.startsWith('pc_'));
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

/** Figur zu einem Aussehen: feste Wahl (rb oder body = Figur), sonst passend zu Körper, Farbe, Haut und Haar */
export function avatarFor(l: { rb?: string; body: string; palette: string; skin: number; hair?: number; top?: boolean }): Avatar {
  const direct = avatar(l.rb || '') || avatar(l.body);
  if (direct) return direct;
  const female = /Woman/.test(l.body) || (l.body === 'Hero' && !!l.top);
  if (l.palette === 'police') return avatar(female ? 'Police_Female_01' : 'Police_Male_01')!;
  if (l.palette === 'fire') return avatar(female ? 'Fire_Female_01' : 'Fire_Male_01')!;
  const pool = female ? FEMALE : MALE;
  return pool[hash(l.body + l.palette + l.skin + ':' + (l.hair ?? '')) % pool.length];
}
