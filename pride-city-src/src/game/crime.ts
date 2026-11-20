/* Gesetze von Rainbow City und Fahndungssterne wie im Open-World-Krimi – nur mit Glitzer statt Gewalt.
   Wer Leute haut, Gleitgel-Fallen legt oder Autos klaut, bekommt Sterne. Die Polizei verfolgt dich,
   bei Festnahme gibt es ein Bußgeld und eine Nacht Papierkram auf der Wache. Abhängen klappt, wenn dich lange niemand sieht. */

export type Law = 'assault' | 'police' | 'slip' | 'indecent' | 'theft';
export const LAWS: Record<Law, { name: string; stars: number; fine: number }> = {
  assault: { name: '§ 1 Hauen verboten – auch mit Glitzer', stars: 1, fine: 40 },
  police: { name: '§ 2 Keine Hand (und kein Toy) an die Polizei', stars: 2, fine: 80 },
  slip: { name: '§ 3 Gleitgel gehört nicht auf den Gehweg', stars: 1, fine: 30 },
  indecent: { name: '§ 4 Erregung öffentlichen Ärgernisses', stars: 1, fine: 25 },
  theft: { name: '§ 5 Fremde Autos bleiben fremde Autos', stars: 1, fine: 50 },
};
export const MAX_STARS = 5;

export class Wanted {
  stars = 0;
  /** Sekunden, die dich keine Streife gesehen hat */
  unseen = 0;
  /** Summe der Bußgelder seit dem letzten Abhängen */
  fines = 0;
  /** zuletzt gemeldetes Vergehen */
  last: Law | null = null;

  /** Vergehen melden: liefert true, wenn neue Sterne dazukamen */
  add(law: Law) {
    const before = this.stars;
    this.stars = Math.min(MAX_STARS, this.stars + LAWS[law].stars);
    this.fines += LAWS[law].fine; this.last = law; this.unseen = 0;
    return this.stars > before;
  }
  /** Zeit bis zum Abhängen: mehr Sterne = länger untertauchen */
  get escapeTime() { return 8 + this.stars * 5; }
  /** Pro Bild: gesehen = eine Streife ist in Sichtweite. Liefert 'lost', wenn du sie abgehängt hast. */
  tick(dt: number, seen: boolean): 'lost' | null {
    if (!this.stars) return null;
    if (seen) { this.unseen = 0; return null; }
    this.unseen += dt;
    if (this.unseen >= this.escapeTime) { this.clear(); return 'lost'; }
    return null;
  }
  /** Festnahme: Bußgeld (höchstens das, was du hast) */
  arrest(money: number) { const fine = Math.min(money, this.fines + this.stars * 25); this.clear(); return fine; }
  clear() { this.stars = 0; this.unseen = 0; this.fines = 0; this.last = null; }
}

/** Spaßwaffen: Klaps, Poolnudel (immer) und Glitzer-Dildo (nur 18+ und mit Toy), Gleitgel zum Werfen */
export type Weapon = 'hand' | 'noodle' | 'dildo' | 'lube';
export const WEAPONS: Record<Weapon, { name: string; icon: string; reach: number; throw?: boolean }> = {
  hand: { name: 'Klaps', icon: '✋', reach: 1.3 },
  noodle: { name: 'Regenbogen-Poolnudel', icon: '🌈', reach: 1.9 },
  dildo: { name: 'Glitzer-Dildo', icon: '🍆', reach: 1.6 },
  lube: { name: 'Gleitgel-Flasche', icon: '💧', reach: 0, throw: true },
};
/** Welche Waffen du gerade hast */
export function arsenal(adult: boolean, toys: number): Weapon[] {
  return ['hand', 'noodle', ...(adult && toys > 0 ? ['dildo' as const] : []), 'lube'];
}
