/* Sammelbuch (aus Bunte Insel übernommen und erweitert): Fische, Käfer & Falter, Fundstücke. */
export interface Collectible { id: string; icon: string; name: string; where: string; rare: number; night?: boolean; worlds?: string[]; size?: [number, number] }
export const FISH: Collectible[] = [
  { id: 'goldfisch', icon: '🐠', name: 'Goldfisch', where: 'Ententeich', rare: 1, worlds: ['hub'], size: [8, 20] },
  { id: 'barsch', icon: '🐟', name: 'Barsch', where: 'Ententeich, Seen', rare: 1, size: [15, 40] },
  { id: 'hering', icon: '🐟', name: 'Hering', where: 'Meer', rare: 1, size: [15, 30] },
  { id: 'kugelfisch', icon: '🐡', name: 'Kugelfisch', where: 'Meer', rare: 2, size: [10, 25] },
  { id: 'clownfisch', icon: '🐠', name: 'Clownfisch', where: 'Schwammi-Bucht', rare: 2, worlds: ['schwamm'], size: [6, 12] },
  { id: 'krake', icon: '🐙', name: 'Kleiner Krake', where: 'Meer', rare: 3, size: [20, 60] },
  { id: 'mondfisch', icon: '🌙', name: 'Mondfisch', where: 'Meer, nachts', rare: 3, night: true, size: [40, 120] },
  { id: 'leuchtfisch', icon: '✨', name: 'Leuchtfisch', where: 'Atlantis, Lunaris', rare: 3, worlds: ['atlantis', 'lunaris'], size: [10, 30] },
  { id: 'stiefel', icon: '👢', name: 'Alter Stiefel', where: 'überall 😄', rare: 1, size: [30, 30] },
  { id: 'regenbogenforelle', icon: '🌈', name: 'Regenbogenforelle', where: 'Regenbogenwelt', rare: 2, worlds: ['regenbogen'], size: [25, 55] },
  { id: 'eisfisch', icon: '🧊', name: 'Eisfisch', where: 'Märchenland (Frostgipfel)', rare: 2, worlds: ['maerchen'], size: [15, 35] },
  { id: 'datenfisch', icon: '💠', name: 'Datenfisch', where: 'Prisma-Insel', rare: 3, worlds: ['prisma'], size: [8, 16] }
];
export const BUGS: Collectible[] = [
  { id: 'marienkaefer', icon: '🐞', name: 'Marienkäfer', where: 'Wiesen', rare: 1 },
  { id: 'schmetterling', icon: '🦋', name: 'Zitronenfalter', where: 'Blumenwiesen', rare: 1 },
  { id: 'biene', icon: '🐝', name: 'Hummel', where: 'Bauernhof, Gärten', rare: 1 },
  { id: 'grille', icon: '🦗', name: 'Grille', where: 'Wiesen, abends', rare: 1, night: true },
  { id: 'gluehwuermchen', icon: '✨', name: 'Glühwürmchen', where: 'überall, nachts', rare: 2, night: true },
  { id: 'hirschkaefer', icon: '🪲', name: 'Hirschkäfer', where: 'Wälder', rare: 2 },
  { id: 'libelle', icon: '🪰', name: 'Libelle', where: 'am Wasser', rare: 2 },
  { id: 'kristallfalter', icon: '💎', name: 'Kristallfalter', where: 'Drachenhöhen', rare: 3, worlds: ['drachen'] },
  { id: 'mondmotte', icon: '🌙', name: 'Mondmotte', where: 'Lunaris, nachts', rare: 3, night: true, worlds: ['lunaris'] },
  { id: 'feenkaefer', icon: '🧚', name: 'Feenkäfer', where: 'Märchenland', rare: 3, worlds: ['maerchen'] }
];
export const FINDS: Collectible[] = [
  { id: 'muschel', icon: '🐚', name: 'Muschel', where: 'Strände', rare: 1 },
  { id: 'muenze', icon: '🪙', name: 'Alte Münze', where: 'Strände', rare: 1 },
  { id: 'flaschenpost', icon: '🍾', name: 'Flaschenpost', where: 'Strände', rare: 2 },
  { id: 'dinoknochen', icon: '🦴', name: 'Dino-Knochen', where: 'Hüpfland, Strände', rare: 2 },
  { id: 'seestern', icon: '⭐', name: 'Seestern', where: 'Schwammi-Bucht, Strände', rare: 1 },
  { id: 'goldschluessel', icon: '🔑', name: 'Goldener Schlüssel', where: 'überall (selten)', rare: 3 },
  { id: 'kristallkugel', icon: '🔮', name: 'Kristallkugel', where: 'Rätsel-Insel', rare: 3, worlds: ['raetsel'] },
  { id: 'perle', icon: '⚪', name: 'Perle', where: 'Atlantis, Märchenland', rare: 2 }
];
