/* Farbwelten der Szene: Jede Palette färbt Kleidung und Accessoires der Figuren. Es gibt mehr als Gay. */

export interface Palette { id: string; name: string; colors: string[] }

export const PALETTES: Palette[] = [
  { id: 'rainbow', name: 'Regenbogen', colors: ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'] },
  { id: 'progress', name: 'Progress', colors: ['#5bcefa', '#f5a9b8', '#ffffff', '#613915', '#000000', '#e40303', '#ffed00', '#004dff'] },
  { id: 'trans', name: 'Trans', colors: ['#5bcefa', '#f5a9b8', '#ffffff'] },
  { id: 'bi', name: 'Bi', colors: ['#d60270', '#9b4f96', '#0038a8'] },
  { id: 'lesbian', name: 'Lesbisch', colors: ['#d52d00', '#ff9a56', '#ffffff', '#d362a4', '#a30262'] },
  { id: 'pan', name: 'Pan', colors: ['#ff218c', '#ffd800', '#21b1ff'] },
  { id: 'nonbinary', name: 'Nichtbinär', colors: ['#fcf434', '#ffffff', '#9c59d1', '#2c2c2c'] },
  { id: 'ace', name: 'Ace', colors: ['#000000', '#a3a3a3', '#ffffff', '#800080'] },
  { id: 'aro', name: 'Aro', colors: ['#3da542', '#a7d379', '#ffffff', '#a9a9a9', '#000000'] },
  { id: 'gay', name: 'Gay (MLM)', colors: ['#078d70', '#26ceaa', '#98e8c1', '#ffffff', '#7bade2', '#5049cc', '#3d1a78'] },
  { id: 'bear', name: 'Bear', colors: ['#623804', '#d56300', '#fedd63', '#fee6b8', '#555555'] },
  { id: 'leather', name: 'Leder', colors: ['#111111', '#18186b', '#ffffff', '#c0102a'] },
  { id: 'neon', name: 'Neon-Nacht', colors: ['#ff2fd2', '#00f0ff', '#8a2bff', '#ffe600'] },
];

/** Hauttöne (Multiplikator auf die Haut-Farbfelder der Figuren) */
export const SKINS = ['#ffd9c2', '#f1b88f', '#d08b5b', '#a8653b', '#6e3f22', '#4a2914'];

/** Figuren (Quaternius, CC0): realistische Low-Poly-Menschen. Rollen ordnen jedem Material einen Kleidungsteil zu,
    Bänder sind Höhen relativ zur Körpergröße in der Ruhepose (Slip ab brief, BH-Band bra). */
export interface BodyDef {
  id: string; name: string; desc: string; height: number; up: 0 | 1 | 2; side: 0 | 1 | 2;
  roles: Record<string, number>; brief: number; bra: [number, number]; torso: number; hair: string;
  /** Brustwarze (seitlich, Höhe) und Bauchnabel-Höhe */ nip: [number, number]; navel: number;
  /** Hände verkleinern (Knochen, Faktor) und Haltungskorrektur je Knochen (Euler-Winkel, nach der Animation) */
  hands?: [string[], number]; fix?: Array<[string, number, number, number]>;
}
/* Rollen: 0 bleibt, 1 Haut, 2 Oberteil, 3 Jacke, 4 Hose, 5 Schuhe, 6 Socken, 7 Haare, 8 Accessoire, 9 Farbfeld-Textur, 10 bemalt */
export const BODIES: BodyDef[] = [
  { id: 'Man2', hands: [['Palm.L', 'Palm.R'], .78], nip: [.055, .735], navel: .6, name: 'Robin', desc: 'Lässig, Langarmshirt', height: 1.84, up: 2, side: 0, brief: .45, bra: [.7, .775], torso: .14, hair: '#6b4a22',
    roles: { Shirt2: 3, Shirt: 2, Skin: 1, Pants: 4, Shoes: 5, Socks: 6, Hair2: 7, Hair: 7 } },
  { id: 'Man', hands: [['Palm.L', 'Palm.R'], .78], nip: [.055, .735], navel: .6, name: 'Kai', desc: 'Sportlich, Shorts', height: 1.86, up: 2, side: 0, brief: .45, bra: [.7, .775], torso: .14, hair: '#241912',
    roles: { Shirt: 2, Skin: 1, Pants: 4, Socks: 6, Hair: 7 } },
  { id: 'Woman', hands: [['Palm.L', 'Palm.R'], .8], nip: [.05, .74], navel: .6, name: 'Sasha', desc: 'Jacke, Streetstyle', height: 1.74, up: 2, side: 0, brief: .45, bra: [.7, .79], torso: .14, hair: '#5a1838',
    roles: { Shirt: 2, LightJacket: 3, Jacket: 3, Skin: 1, Pants: 4, Shoes: 5, HairBase: 7, Hair: 7 } },
  { id: 'Woman2', hands: [['LeftHand', 'RightHand'], .85], nip: [.05, .74], navel: .6, name: 'Mia', desc: 'Sommerlich, Jeans', height: 1.72, up: 2, side: 1, brief: .45, bra: [.7, .79], torso: .12, hair: '#d8c070',
    roles: { Material: 9 } },
  { id: 'Human', hands: [['LeftHand', 'RightHand'], .8], fix: [['LeftArm', 0, .3, 0], ['RightArm', 0, -.3, 0]], nip: [.05, .735], navel: .6, name: 'Alex', desc: 'Schlicht, frei gestaltbar', height: 1.82, up: 1, side: 2, brief: .44, bra: [.7, .79], torso: .105, hair: '#2e2018',
    roles: { Texture: 10 } },
  { id: 'Hero', hands: [['Fist.L', 'Fist.R'], .85], nip: [.07, .575], navel: .46, name: 'Jo', desc: 'Comic-Look, verspielt', height: 1.6, up: 2, side: 0, brief: .35, bra: [.53, .63], torso: .2, hair: '#8a6430',
    roles: { Hair: 7, Skin: 1, UnderShirt: 2, Shirt: 3, Pants: 4, Boots: 5, Detail: 8, 'Material.006': 8 } },
];
/** alte KayKit-Figuren (Spielstände bis Durchgang 3a) */
export const LEGACY_BODY: Record<string, string> = { Rogue: 'Man2', Rogue_Hooded: 'Woman', Barbarian: 'Man', Knight: 'Human', Mage: 'Woman2' };
export function body(id: string): BodyDef { return BODIES.find((b) => b.id === (LEGACY_BODY[id] || id)) || BODIES[0]; }
/** Haarfarben (Index in Look.hair; ohne Angabe die Farbe des Modells) */
export const HAIRS = ['#16100c', '#3b2618', '#6b4a22', '#b08548', '#e2cf96', '#a8432e', '#8c8c8c', '#ff4fb0', '#4fc3ff', '#9b5cff', '#3ee69a'];

export const PRONOUNS = [
  { id: 'he', label: 'er/ihn' },
  { id: 'she', label: 'sie/ihr' },
  { id: 'they', label: 'they/them' },
  { id: 'none', label: 'keine/Name' },
];

export function palette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}
