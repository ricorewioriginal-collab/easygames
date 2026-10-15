/* Mitfahrten bleiben in der 3D-Welt. Aussteigen, Menüwechsel und Speichern geben den Spieler sicher am Einstieg zurück. */
import type { Game, GameSystem } from '../game.ts';
import { btn, h, uiRoot, anyModal } from '../ui/dom.ts';
export interface Ride { name: string; duration: number; seat(): { x: number; y: number; z: number; yaw: number } }
export class Rides implements GameSystem {
  id = 'rides';
  private active: { ride: Ride; left: number; back: { x: number; z: number; yaw: number }; ui: HTMLElement } | null = null;
  constructor(private g: Game) { g.panels.ride = arg => this.start(arg as Ride); }
  private start(ride: Ride): void {
    const g = this.g;
    if (this.active || g.busy || g.vehicleCheck()) return;
    const back = { x: g.player.pos.x, z: g.player.pos.z, yaw: g.player.yaw };
    const ui = h('div', { class: 'ride-controls' }, h('b', null, ride.name), btn('⏏ Aussteigen', () => this.stop(), 'green'));
    uiRoot().append(ui); g.busy++; g.sfx('whoosh');
    this.active = { ride, left: ride.duration, back, ui };
  }
  stop(): void {
    const a = this.active; if (!a) return;
    this.active = null; a.ui.remove(); this.g.busy = Math.max(0, this.g.busy - 1);
    this.g.player.teleport(a.back.x, a.back.z, a.back.yaw); this.g.rig.snapBehind(a.back.yaw);
  }
  onStart(): void { this.stop(); }
  onStop(): void { this.stop(); }
  onWorldUnload(id: string): void { if (id === 'park') this.stop(); }
  persist(): void {
    if (!this.active) return;
    const b = this.active.back;
    this.g.save.pos = { world: 'park', ...b, y: this.g.field.height(b.x, b.z) };
  }
  update(dt: number): void {
    const a = this.active; if (!a || anyModal()) return;
    if (this.g.input.consume('jump') || this.g.input.pressed('pause') || this.g.input.pressed('map')) { this.stop(); return; }
    a.left -= dt;
    if (a.left <= 0) { this.stop(); return; }
    const p = a.ride.seat(), g = this.g;
    g.player.pos.set(p.x, p.y, p.z); g.player.vy = 0; g.player.yaw = p.yaw;
    g.avatar.root.position.copy(g.player.pos); g.avatar.root.rotation.y = p.yaw;
  }
}
