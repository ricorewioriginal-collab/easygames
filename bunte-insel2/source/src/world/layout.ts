/* Lage aller Welten (Inselmittelpunkte, Radien) und die Brücken dazwischen – eine zusammenhängende Karte.
   Himmelsrichtungen wie im Original: Norden = −z. */
export interface IsleSpot { id: string; x: number; z: number; r: number }
export const ISLES: Record<string, IsleSpot> = {
  hub: { id: 'hub', x: 0, z: 0, r: 150 },
  stadt: { id: 'stadt', x: 0, z: -330, r: 65 },
  schwamm: { id: 'schwamm', x: 60, z: -560, r: 56 },
  dampfer: { id: 'dampfer', x: -215, z: -305, r: 50 },
  maerchen: { id: 'maerchen', x: -335, z: -55, r: 76 },
  regenbogen: { id: 'regenbogen', x: -300, z: 135, r: 48 },
  schluessel: { id: 'schluessel', x: -565, z: -80, r: 72 },
  wunsch: { id: 'wunsch', x: -735, z: 20, r: 46 },
  huepf: { id: 'huepf', x: -525, z: 195, r: 70 },
  fussball: { id: 'fussball', x: -160, z: 262, r: 46 },
  raetsel: { id: 'raetsel', x: -305, z: 425, r: 66 },
  fellretter: { id: 'fellretter', x: -20, z: 302, r: 52 },
  drachen: { id: 'drachen', x: 140, z: 302, r: 54 },
  lunaris: { id: 'lunaris', x: 62, z: 478, r: 66 },
  funkwelle: { id: 'funkwelle', x: 292, z: 192, r: 56 },
  park: { id: 'park', x: 332, z: 0, r: 62 },
  taschi: { id: 'taschi', x: 565, z: 125, r: 72 },
  bauland: { id: 'bauland', x: 272, z: -232, r: 72 },
  prisma: { id: 'prisma', x: 525, z: -405, r: 108 },
  atlantis: { id: 'atlantis', x: 1500, z: 0, r: 92 }
};

export interface BridgeDef { from: string; to: string; w?: number; color?: number; rail?: number; style?: 'holz' | 'stein' | 'licht' | 'seil' }
export const BRIDGES: BridgeDef[] = [
  { from: 'hub', to: 'stadt', style: 'stein' },
  { from: 'stadt', to: 'schwamm', style: 'holz' },
  { from: 'stadt', to: 'dampfer', style: 'holz' },
  { from: 'hub', to: 'maerchen', style: 'stein' },
  { from: 'hub', to: 'regenbogen', style: 'licht' },
  { from: 'maerchen', to: 'schluessel', style: 'licht' },
  { from: 'schluessel', to: 'wunsch', style: 'seil' },
  { from: 'regenbogen', to: 'huepf', style: 'holz' },
  { from: 'hub', to: 'fussball', style: 'stein' },
  { from: 'fussball', to: 'raetsel', style: 'stein' },
  { from: 'hub', to: 'fellretter', style: 'holz' },
  { from: 'hub', to: 'drachen', style: 'stein' },
  { from: 'fellretter', to: 'lunaris', style: 'licht' },
  { from: 'hub', to: 'funkwelle', style: 'holz' },
  { from: 'hub', to: 'park', style: 'holz' },
  { from: 'park', to: 'taschi', style: 'holz' },
  { from: 'hub', to: 'bauland', style: 'stein' },
  { from: 'bauland', to: 'prisma', style: 'licht' }
];

/** Endpunkte einer Brücke an den Ufern (Ufer liegt etwa bei Radius − 4). */
export function bridgeEnds(b: BridgeDef): { ax: number; az: number; bx: number; bz: number } {
  const A = ISLES[b.from], B = ISLES[b.to];
  const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  return { ax: A.x + ux * (A.r - 6), az: A.z + uz * (A.r - 6), bx: B.x - ux * (B.r - 6), bz: B.z - uz * (B.r - 6) };
}
