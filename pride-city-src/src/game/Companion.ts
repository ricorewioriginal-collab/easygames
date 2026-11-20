/* Begleitung: Ein Rainbow-Match geht mit dir durch die Stadt. Die Figur folgt deiner Spur (läuft also nie durch Wände),
   steigt mit ins Auto und verabschiedet sich nach ein paar Stunden. Gemeinsame Zeit bringt Nähe (bond.ts). */
import { Vector3, type Scene } from '../engine/bjs';
import { Actor, WALK_MPS, RUN_MPS, type Look } from './Actor';
import type { Profile } from './social';

export const lookOf = (p: Profile): Look => ({ body: p.body, palette: p.palette, skin: p.skin, outfit: 'clothed', top: p.pron !== 'er' });

export class Companion {
  who: Profile | null = null;
  /** Spielminuten, die ihr noch zusammen unterwegs seid */
  left = 0;
  private a: Actor | null = null;
  private made = '';
  private trail: Vector3[] = [];
  private tick = 0;
  constructor(private scene: Scene) {}

  get pos() { return this.a && this.who ? this.a.root.position : null; }

  /** Treffen: Figur erscheint neben dem Spieler */
  async meet(p: Profile, at: Vector3, minutes = 180) {
    if (this.made !== p.id) { if (this.a) this.a.root.visible = false; this.a = await Actor.create(this.scene, lookOf(p)); this.made = p.id; }
    this.who = p; this.left = minutes; this.trail = [];
    this.a!.root.position.set(at.x + .9, .1, at.z + .4); this.a!.root.visible = true; this.a!.play('wave', 0);
  }
  bye() { if (this.a) this.a.root.visible = false; this.who = null; this.left = 0; this.trail = []; }

  /** dtMin = vergangene Spielminuten; liefert true, wenn eine weitere gemeinsame Viertelstunde voll ist */
  update(dt: number, dtMin: number, player: Vector3, yaw: number, inCar: boolean): boolean {
    const a = this.a; if (!a || !this.who) return false;
    this.left -= dtMin;
    const p = a.root.position;
    if (inCar) { a.root.visible = false; p.set(player.x, .1, player.z); this.trail = []; }
    else {
      if (!a.root.visible) { a.root.visible = true; p.set(player.x + Math.cos(yaw) * 1.1, .1, player.z - Math.sin(yaw) * 1.1); }
      // Spur des Spielers alle 0,4 m merken, die Begleitung läuft sie mit 1,5 m Abstand nach
      const last = this.trail[this.trail.length - 1];
      if (!last || Vector3.Distance(last, player) > .4) { this.trail.push(player.clone()); if (this.trail.length > 60) this.trail.shift(); }
      const gap = Math.hypot(player.x - p.x, player.z - p.z);
      if (gap > 28) { p.set(player.x - Math.sin(yaw) * 1.4, .1, player.z - Math.cos(yaw) * 1.4); this.trail = []; }
      while (this.trail.length > 1 && Math.hypot(this.trail[0].x - p.x, this.trail[0].z - p.z) < .35) this.trail.shift();
      const tgt = this.trail[0];
      if (tgt && gap > 1.6) {
        const dx = tgt.x - p.x, dz = tgt.z - p.z, d = Math.hypot(dx, dz) || .001, v = Math.min(6, Math.max(1.2, (gap - 1.4) * 2.4));
        p.x += dx / d * Math.min(d, v * dt); p.z += dz / d * Math.min(d, v * dt);
        a.root.rotation.y = Math.atan2(dx, dz);
        if (v > 3.2) a.play('run', .2, v / RUN_MPS); else a.play('walk', .2, v / WALK_MPS);
      } else if (a.anim === 'walk' || a.anim === 'run') { a.play('idle'); a.root.rotation.y = Math.atan2(player.x - p.x, player.z - p.z); }
      a.update(dt);
    }
    this.tick += dtMin;
    if (this.tick >= 15) { this.tick -= 15; return true; }
    return false;
  }
}
