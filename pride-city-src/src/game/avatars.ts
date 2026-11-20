/* Menschen von Pride City: Microsoft-Rocketbox-Figuren (MIT, https://github.com/microsoft/Microsoft-Rocketbox).
   Jede Figur hat ein echtes Skelett mit 80 Knochen; die Animationen (Laufen, Tanzen, Jubeln …) teilen sich alle Figuren.
   Alte Spielstände und Figuren mit den früheren Körpern (Man, Woman …) bekommen automatisch eine passende Rocketbox-Figur. */

export interface Avatar { id: string; g: 'm' | 'f'; name: string; desc: string; job?: string; editor?: boolean }

const A = (id: string, g: 'm' | 'f', name: string, desc: string, job?: string, editor = !job): Avatar => ({ id, g, name, desc, job, editor });

export const AVATARS: Avatar[] = [
  A('Male_Adult_01', 'm', 'Robin', 'Hemd, Jeans'), A('Male_Adult_02', 'm', 'Kai', 'Pulli, lässig'), A('Male_Adult_03', 'm', 'Noah', 'Shirt, Chinos'),
  A('Male_Adult_04', 'm', 'Tarek', 'Jacke, sportlich'), A('Male_Adult_05', 'm', 'Malik', 'Hemd, Bart'), A('Male_Adult_06', 'm', 'Jonas', 'Strick, gemütlich'),
  A('Male_Adult_07', 'm', 'Luca', 'Shirt, Streetstyle'), A('Male_Adult_08', 'm', 'Bruno', 'Kariert, kräftig'), A('Male_Adult_09', 'm', 'Sam', 'Polo, frisch'),
  A('Male_Adult_10', 'm', 'Ben', 'Hoodie, entspannt'),
  A('Female_Adult_01', 'f', 'Mia', 'Bluse, Jeans'), A('Female_Adult_02', 'f', 'Sasha', 'Jacke, Streetstyle'), A('Female_Adult_03', 'f', 'Ella', 'Pulli, lässig'),
  A('Female_Adult_04', 'f', 'Lena', 'Kleid, sommerlich'), A('Female_Adult_05', 'f', 'Samira', 'Blazer, schick'), A('Female_Adult_06', 'f', 'Hilde', 'Strick, gemütlich'),
  A('Female_Adult_07', 'f', 'Pia', 'Shirt, sportlich'), A('Female_Adult_08', 'f', 'Lotte', 'Bluse, Rock'), A('Female_Adult_09', 'f', 'Kim', 'Top, Jeans'),
  A('Female_Adult_10', 'f', 'Anke', 'Mantel, elegant'),
  A('Female_Party_01', 'f', 'Nova', 'Party-Outfit'), A('Female_Party_02', 'f', 'Velvet', 'Ausgeh-Look'),
  A('Sports_Male_01', 'm', 'Rex', 'Sportlich, Shorts', undefined, true), A('Sports_Female_01', 'f', 'Jo', 'Sportlich, Leggings', undefined, true),
  A('Business_Male_01', 'm', 'Jörg', 'Anzug', 'business', true),
  A('Police_Male_01', 'm', 'Polizist', 'Uniform', 'police'), A('Police_Female_01', 'f', 'Polizistin', 'Uniform', 'police'),
  A('Fire_Male_01', 'm', 'Feuerwehrmann', 'Einsatzkleidung', 'fire'), A('Fire_Female_01', 'f', 'Feuerwehrfrau', 'Einsatzkleidung', 'fire'),
  A('Medical_Female_01', 'f', 'Sanitäterin', 'Kittel', 'medical'), A('Security_Male_01', 'm', 'Security', 'Türsteher', 'security'),
  A('Chef_Female_01', 'f', 'Köchin', 'Kochjacke', 'chef'), A('Delivery_Male_01', 'm', 'Kurier', 'Lieferdienst', 'delivery'),
];
export const EDITOR_AVATARS = AVATARS.filter((a) => a.editor);
export const avatar = (id: string) => AVATARS.find((a) => a.id === id);

const MALE = AVATARS.filter((a) => a.g === 'm' && !a.job && a.id.startsWith('Male')), FEMALE = AVATARS.filter((a) => a.g === 'f' && !a.job && a.id.startsWith('Female_Adult'));
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

/** Rocketbox-Figur zu einem Aussehen: feste Wahl (rb oder body = Figur), sonst passend zu Körper, Farbe, Haut und Haar */
export function avatarFor(l: { rb?: string; body: string; palette: string; skin: number; hair?: number; top?: boolean }): Avatar {
  const direct = avatar(l.rb || '') || avatar(l.body);
  if (direct) return direct;
  const female = /Woman/.test(l.body) || (l.body === 'Hero' && !!l.top);
  if (l.palette === 'police') return avatar(female ? 'Police_Female_01' : 'Police_Male_01')!;
  if (l.palette === 'fire') return avatar(female ? 'Fire_Female_01' : 'Fire_Male_01')!;
  const pool = female ? FEMALE : MALE;
  return pool[hash(l.body + l.palette + l.skin + ':' + (l.hair ?? '')) % pool.length];
}
