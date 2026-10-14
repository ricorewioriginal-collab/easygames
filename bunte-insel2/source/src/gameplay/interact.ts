/* Interaktionspunkte: alles, womit man per Aktion-Knopf etwas tun kann (Tür, Truhe, Hebel, Laden, Tafel …).
   Die Welt meldet sie an, das Spiel zeigt immer nur die passendste Aktion in der Nähe. */
export interface Interactable {
  id: string;
  tag: string;
  x: number; y: number; z: number;
  r: number;
  icon: string;
  label: string | (() => string);
  /** Nur anzeigen, wenn erfüllt. */
  when?: () => boolean;
  act: () => void;
  priority?: number;
  /** Auch aus Fahrzeugen nutzbar. */
  vehicleOk?: boolean;
  /** Zweite Aktion (Taste F / X). */
  alt?: { icon: string; label: string; act: () => void; when?: () => boolean };
  /** Wird vom Wasserstrahl der Feuerwehr getroffen. */
  onWater?: () => void;
}

export class InteractSystem {
  private list: Interactable[] = [];
  add(i: Interactable): Interactable { this.list.push(i); return i; }
  remove(id: string): void { this.list = this.list.filter(i => i.id !== id); }
  removeTag(tag: string): void { this.list = this.list.filter(i => i.tag !== tag); }
  get(id: string): Interactable | undefined { return this.list.find(i => i.id === id); }
  get all(): readonly Interactable[] { return this.list; }
  /** Beste Aktion: nah, vor der Figur, höhere Priorität zuerst. */
  best(x: number, y: number, z: number, yaw: number, inVehicle: boolean): Interactable | null {
    let best: Interactable | null = null, bs = -Infinity;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    for (const i of this.list) {
      if (inVehicle && !i.vehicleOk) continue;
      const dx = i.x - x, dz = i.z - z, d = Math.hypot(dx, dz);
      if (d > i.r || Math.abs(i.y - y) > 3.2) continue;
      if (i.when && !i.when()) continue;
      const facing = d > 0.01 ? (dx * fx + dz * fz) / d : 1;
      const score = (i.priority ?? 0) * 10 - d / i.r * 4 + facing * 1.5;
      if (score > bs) { bs = score; best = i; }
    }
    return best;
  }
  labelOf(i: Interactable): string { return typeof i.label === 'function' ? i.label() : i.label; }
}
