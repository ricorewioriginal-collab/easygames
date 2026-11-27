/* Linie 69 in 3D: Du steigst in einen eigenen Pride-Bus, der dich über die Straßen (GPS-Route, rechte Spur) zum Ziel
   fährt. Die Kamera schaut von schräg hinten zu, unterwegs erzählt dir jemand etwas (bus.ts). Der Verkehr lässt den
   Bus durch. Spätestens nach 45 Sekunden (oder wenn das Ziel außerhalb des Straßennetzes liegt, ab dem Rand) blendet
   die Fahrt zum Ziel über. Ein Bus für alle Fahrten, wird beim ersten Mal gebaut. */
import { Node3, Vector3 } from '../engine/bjs';
import { sfx, engineHum } from '../engine/Audio';
import { toast } from '../ui/ui';
import { buildRide } from './rides';
import { route, LANE } from './traffic';
import { busTalk, busAfter } from './bus';
import type { CityScene } from './CityScene';
import type { Game } from './Game';

const SPEED = 10;
const MAX_T = 45;

export class BusRide {
  on = false;
  private o: Node3 | null = null;
  private path: Vector3[] = [];
  private i = 0;
  private v = 0;
  private t = 0;
  private talked = false;
  private finish: (() => void) | null = null;
  private ending = false;
  constructor(private g: Game, private city: CityScene) {}

  /** Blockiert der Bus diese Stelle? (Verkehr hält an) */
  blocks(x: number, z: number) { const o = this.o; return this.on && !!o && Math.hypot(o.position.x - x, o.position.z - z) < 4.5; }

  start(tx: number, tz: number, arrive: () => void) {
    const c = this.city, sc = c.scene, p = c.player.root.position;
    if (!this.o) { this.o = new Node3('bus69', sc); buildRide(sc, this.o, 'bus'); this.o.parent = c.world.root; }
    // Weg über die Straßen, auf die rechte Spur versetzt
    const pts = route(p.x, p.z, tx, tz).slice(1, -1), n = pts.length;
    this.path = pts.map(([x, z], k) => {
      const [ax, az] = pts[Math.max(0, k - 1)], [bx, bz] = pts[Math.min(n - 1, k + 1)], l = Math.hypot(bx - ax, bz - az) || 1, dx = (bx - ax) / l, dz = (bz - az) / l;
      return new Vector3(x - dz * LANE, .1, z + dx * LANE);
    }).filter((q, k, a) => k === 0 || Vector3.Distance(q, a[k - 1]) > 1);
    if (this.path.length < 2) { arrive(); return; }
    const o = this.o, a = this.path[0], b = this.path[1];
    o.setEnabled(true); o.position.copyFrom(a); o.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    this.on = true; this.i = 1; this.v = 0; this.t = 0; this.talked = false; this.ending = false; this.finish = arrive;
    c.player.root.visible = false;
    sfx('door'); setTimeout(() => sfx('engine'), 300);
    toast('🚌 Linie 69 „Regenbogen-Ring“ · nächster Halt: dein Ziel');
    c.cine = (dt) => this.update(dt);
  }

  private update(dt: number) {
    const c = this.city, o = this.o!, cam = c.camera;
    this.t += dt;
    // unterwegs: jemand setzt sich neben dich und erzählt (Dialog pausiert die Fahrt nicht)
    if (!this.talked && this.t > 1.8) {
      this.talked = true; const seed = Math.random(), s = this.g.save.data;
      this.g.dialog.say(busTalk(seed, (nice) => {
        s.needs.social = Math.min(100, s.needs.social + (nice ? 12 : 0)); s.needs.fun = Math.min(100, s.needs.fun + (nice ? 6 : 0)); s.needs.energy = Math.min(100, s.needs.energy + (nice ? 0 : 4));
        setTimeout(() => this.g.dialog.say([busAfter(seed, nice)]), 60);
      }));
    }
    const tgt = this.path[this.i];
    if (tgt) {
      const dx = tgt.x - o.position.x, dz = tgt.z - o.position.z, d = Math.hypot(dx, dz);
      const last = this.i === this.path.length - 1, want = last ? Math.min(SPEED, 2 + d * .8) : SPEED;
      this.v += Math.max(-8 * dt, Math.min(3 * dt, want - this.v));
      const step = Math.min(d, this.v * dt);
      if (d > .01) { o.position.x += dx / d * step; o.position.z += dz / d * step; }
      if (d < 1.2) this.i++;
      let dy = Math.atan2(dx, dz) - o.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      if (d > .5) o.rotation.y += dy * Math.min(1, dt * 3.2);
      for (const n of o.getChildTransformNodes(true)) if (n.name === 'spin') { const md = n.metadata as { r: number }; n.rotation.x += this.v * dt / md.r; }
      engineHum(Math.min(1, this.v / SPEED * .8 + .1));
    }
    c.player.root.position.set(o.position.x, .1, o.position.z);
    // Kamera schräg hinter dem Bus
    const yaw = o.rotation.y, back = 13, side = 3.5;
    const want = new Vector3(o.position.x - Math.sin(yaw) * back + Math.cos(yaw) * side, 6.2, o.position.z - Math.cos(yaw) * back - Math.sin(yaw) * side);
    cam.position = Vector3.Lerp(cam.position, want, Math.min(1, dt * 3));
    cam.setTarget(new Vector3(o.position.x + Math.sin(yaw) * 4, 1.6, o.position.z + Math.cos(yaw) * 4));
    if (!this.ending && ((this.i >= this.path.length && !this.g.dialog.open) || this.t > MAX_T)) this.end();
  }

  private end() {
    this.ending = true;
    this.g.fade(() => {
      const c = this.city;
      this.on = false; this.o?.setEnabled(false); c.cine = null; engineHum(null);
      c.player.root.visible = true; c.player.play('idle');
      if (this.g.dialog.open) this.g.dialog.close();
      const f = this.finish; this.finish = null; f?.();
      sfx('door'); toast('🚌 Endstation für dich, du steigst aus.');
    });
  }
}
