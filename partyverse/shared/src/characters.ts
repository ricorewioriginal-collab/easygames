/** Die acht spielbaren Figuren von PARTYVERSE. Vollständig eigene Wesen – jede mit eigener Silhouette, Palette und Persönlichkeit. */
export type CharacterId = 'pip' | 'brumm' | 'lumi' | 'zapp' | 'mokka' | 'quirl' | 'flora' | 'vex';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  species: string;
  /** Silhouette für das 3D-Modell (siehe client/src/render/characters.ts) */
  silhouette: 'bean' | 'golem' | 'lantern' | 'fox' | 'mole' | 'spiral' | 'bloom' | 'cube';
  tagline: string;
  personality: string;
  colors: { primary: string; secondary: string; accent: string };
  /** Sprüche für Würfeln, Gewinnen, Verlieren (Persönlichkeit) */
  lines: { roll: string; win: string; lose: string; coin: string };
}

export const CHARACTERS: readonly CharacterDef[] = [
  {
    id: 'pip',
    name: 'Pip',
    species: 'Hüpfknäuel',
    silhouette: 'bean',
    tagline: 'Rund, flauschig, nie still.',
    personality: 'Überschwänglich und neugierig',
    colors: { primary: '#ffd23f', secondary: '#ff9f1c', accent: '#ff3e6c' },
    lines: { roll: 'Boing! Mal sehen!', win: 'Juhuuu! Noch eine Runde!', lose: 'Ach, Knäuel-Pech …', coin: 'Glitzer, Glitzer!' },
  },
  {
    id: 'brumm',
    name: 'Brumm',
    species: 'Moosgolem',
    silhouette: 'golem',
    tagline: 'Steinhart, herzensweich.',
    personality: 'Gemütlich, stark, ein bisschen langsam',
    colors: { primary: '#4cc9a7', secondary: '#2b7a78', accent: '#c7f464' },
    lines: { roll: 'Brumm. Würfel rollt.', win: 'Brumm gewinnt. Brumm freut sich.', lose: 'Brumm schmollt kurz.', coin: 'Schwer! Gut!' },
  },
  {
    id: 'lumi',
    name: 'Lumi',
    species: 'Laternenqualle',
    silhouette: 'lantern',
    tagline: 'Leuchtet auch im Paradoxon.',
    personality: 'Träumerisch und klug',
    colors: { primary: '#7bdff2', secondary: '#b2f7ef', accent: '#f7d6e0' },
    lines: { roll: 'Das Licht zeigt den Weg.', win: 'Alles leuchtet!', lose: 'Mein Licht flackert …', coin: 'Funkelt schön.' },
  },
  {
    id: 'zapp',
    name: 'Zapp',
    species: 'Blitzfuchs',
    silhouette: 'fox',
    tagline: 'Schneller als sein eigener Schatten.',
    personality: 'Frech, wettbewerbslustig',
    colors: { primary: '#ff7b00', secondary: '#ffb627', accent: '#38a3ff' },
    lines: { roll: 'Zap! Aus dem Weg!', win: 'Zapp-tastisch!', lose: 'Nur ein Kurzschluss.', coin: 'Meins!' },
  },
  {
    id: 'mokka',
    name: 'Mokka',
    species: 'Tüftelmaulwurf',
    silhouette: 'mole',
    tagline: 'Gräbt Abkürzungen, die es nicht geben dürfte.',
    personality: 'Ruhig, listig, immer mit Schutzbrille',
    colors: { primary: '#a47551', secondary: '#6f4e37', accent: '#ffe066' },
    lines: { roll: 'Rechnen wir kurz nach …', win: 'Plan aufgegangen.', lose: 'Hm. Neuer Plan.', coin: 'Kleinvieh macht Mist.' },
  },
  {
    id: 'quirl',
    name: 'Quirl',
    species: 'Spiralschnecke',
    silhouette: 'spiral',
    tagline: 'Dreht sich, wie es ihr gefällt.',
    personality: 'Geheimnisvoll, mit Zauberhut',
    colors: { primary: '#9d4edd', secondary: '#5a189a', accent: '#ffd6ff' },
    lines: { roll: 'Ein Wirbel für den Zufall!', win: 'Alles nach Zauberplan.', lose: 'Der Zauber hakt.', coin: 'Abrakadabra!' },
  },
  {
    id: 'flora',
    name: 'Flora',
    species: 'Blütenwicht',
    silhouette: 'bloom',
    tagline: 'Wo sie hinläuft, blüht es auf.',
    personality: 'Herzlich, hilfsbereit, mit Dickkopf',
    colors: { primary: '#ff70a6', secondary: '#70d6ff', accent: '#ffd670' },
    lines: { roll: 'Auf in den Frühling!', win: 'Alles blüht!', lose: 'Ein Blättchen fällt …', coin: 'Honigsüß!' },
  },
  {
    id: 'vex',
    name: 'Vex',
    species: 'Würfelgeist',
    silhouette: 'cube',
    tagline: 'Sein Kopf hat sechs Seiten und keine Meinung.',
    personality: 'Trocken, sarkastisch, schwebend',
    colors: { primary: '#adb5bd', secondary: '#495057', accent: '#00f5d4' },
    lines: { roll: 'Natürlich eine Sechs. Oder nicht.', win: 'Statistisch erwartbar.', lose: 'Wie vorhergesagt.', coin: 'Nett.' },
  },
];

export const CHARACTER_IDS: readonly CharacterId[] = CHARACTERS.map((c) => c.id);
export const getCharacter = (id: CharacterId): CharacterDef => {
  const c = CHARACTERS.find((x) => x.id === id);
  if (!c) throw new Error('Unbekannte Figur: ' + id);
  return c;
};
export const isCharacterId = (v: unknown): v is CharacterId => typeof v === 'string' && (CHARACTER_IDS as readonly string[]).includes(v);
