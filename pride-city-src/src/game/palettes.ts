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

export const BODIES = [
  { id: 'Rogue', name: 'Robin', desc: 'Lässig, sportlich' },
  { id: 'Rogue_Hooded', name: 'Sasha', desc: 'Hoodie, Streetstyle' },
  { id: 'Barbarian', name: 'Bruno', desc: 'Bär, kräftig, Bart' },
  { id: 'Knight', name: 'Kai', desc: 'Athletisch, stolz' },
  { id: 'Mage', name: 'Mika', desc: 'Kreativ, Mantel' },
];

export const PRONOUNS = [
  { id: 'he', label: 'er/ihn' },
  { id: 'she', label: 'sie/ihr' },
  { id: 'they', label: 'they/them' },
  { id: 'none', label: 'keine/Name' },
];

export function palette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}
