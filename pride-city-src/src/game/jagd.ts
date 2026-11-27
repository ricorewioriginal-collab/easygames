/* Polizei im Einsatz: Ab und zu jagt eine Streife zu Fuß eine verdächtige Person durch die Straßen – ganz ohne dich.
   Du kannst zuschauen oder helfen: ein Klaps bringt die Person ins Stolpern (keine Fahndung, Polizei bedankt sich).
   Sonst holt die Streife sie ein, oder sie entkommt. Kein Blut, niemand wird verletzt. Höchstens ein Einsatz zur Zeit. */
import { Vector3 } from '../engine/bjs';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { walkable } from './World';
import type { StreetNpc } from './Street';
import type { CityScene } from './CityScene';
import type { SaveData } from '../engine/Save';

const WHY = ['hat im Späti Zigaretten mitgehen lassen', 'hat ein Fahrrad geklaut', 'hat Regenbogenflaggen heruntergerissen', 'hat eine Handtasche geschnappt', 'hat Hass-Sticker geklebt', 'ist ohne zu zahlen aus dem Taxi gesprungen'];
const COP = ['Stehen bleiben! Polizei!', 'Halt! Sofort stehen bleiben!', 'Bleib stehen, wir kriegen dich eh!'];
const RUN = ['Ihr kriegt mich nie!', 'Lasst mich in Ruhe!', 'Ich war das nicht!'];

export class Jagd {
  /** verdächtige Person und Streife, solange ein Einsatz läuft */
  suspect: StreetNpc | null = null;
  cop: StreetNpc | null = null;
  private t = 0;
  private next = 70;
  private phase: 'run' | 'caught' = 'run';
  private why = '';
  private dir = 0;
  private helped = false;
  constructor(private city: CityScene) {}

  isSuspect(a: unknown) { return !!this.suspect && this.suspect.a === a; }

  update(dt: number, free: boolean, s: SaveData) {
    if (!this.suspect) {
      if (!free) return;
      if ((this.next -= dt) > 0) return;
      this.next = 100 + Math.random() * 80;
      this.start();
      return;
    }
    const sp = this.suspect, cop = this.cop!, a = sp.a.root.position, c = cop.a.root.position;
    // du wirst selbst gesucht: die Streife lässt ab und kümmert sich um dich
    if (this.city.combat.wanted.stars > 0) { this.end(true, s); return; }
    this.t += dt;
    if (this.phase === 'caught') {
      if (this.t > 6) this.end(false, s);
      return;
    }
    // du hast geholfen: die Person liegt oder taumelt (Klaps), die Streife übernimmt
    const held = this.city.combat.holds(sp.a) || sp.down;
    if (held) this.helped = true;
    // Streife rennt hinterher
    const dx = a.x - c.x, dz = a.z - c.z, d = Math.hypot(dx, dz) || 1;
    if (d > 1.3) {
      const v = (this.helped ? 6 : 5.1) * dt, nx = c.x + dx / d * v, nz = c.z + dz / d * v;
      if (walkable(nx, nz)) { c.x = nx; c.z = nz; } else { c.x += dx / d * v * .5; c.z += dz / d * v * .5; }
      cop.a.root.rotation.y = Math.atan2(dx, dz); if (cop.a.anim !== 'run') cop.a.play('run', .12, 1.5);
    }
    if (d <= 1.3 || (this.helped && d < 2.2)) { this.catch(); return; }
    if (!held) {
      // weg von der Streife, an Hindernissen und Wasser vorbei abbiegen
      const want = Math.atan2(dx, dz);
      let yaw = this.dir + Math.atan2(Math.sin(want - this.dir), Math.cos(want - this.dir)) * Math.min(1, dt * 2), moved = false;
      const v = 4.5 * dt;
      for (const off of [0, .6, -.6, 1.2, -1.2, 2]) {
        const y = yaw + off, nx = a.x + Math.sin(y) * v, nz = a.z + Math.cos(y) * v;
        if (walkable(nx, nz) && !this.city.world.colliders.some((q) => Math.abs(nx - q.x) < q.hx + .3 && Math.abs(nz - q.z) < q.hz + .3)) { a.x = nx; a.z = nz; yaw = y; moved = true; break; }
      }
      this.dir = yaw; sp.a.root.rotation.y = yaw;
      if (sp.a.anim !== 'run') sp.a.play('run', .12, 1.55);
      if (!moved && this.t > 3) this.dir += Math.PI * .7;
    }
    if (this.t > 30 || (!held && d > 40)) this.escape(s);
  }

  private start() {
    const st = this.city.street, p = this.city.player.root.position;
    const pick = st.people.filter((n) => n.kind === 'walker' && n.a.root.visible && !n.talking && !n.mate && !st.people.some((o) => o.mate === n) && !n.dog && !n.down && !n.chase && n.yaw === undefined
      && Vector3.Distance(n.a.root.position, p) > 14 && Vector3.Distance(n.a.root.position, p) < 38);
    const sp = pick[Math.floor(Math.random() * pick.length)], cops = st.people.filter((n) => n.kind === 'police' && !n.talking && !n.down);
    if (!sp || !cops.length) return;
    const cop = cops.sort((x, y) => Vector3.Distance(x.a.root.position, sp.a.root.position) - Vector3.Distance(y.a.root.position, sp.a.root.position))[0];
    const q = sp.a.root.position, away = Math.atan2(q.x - p.x, q.z - p.z);
    // Streife kommt von der Seite, die von dir abgewandt ist, wenn sie zu weit weg ist
    if (Vector3.Distance(cop.a.root.position, q) > 25) {
      for (const off of [0, .8, -.8, 1.6, -1.6, Math.PI]) { const x = q.x + Math.sin(away + off) * 9, z = q.z + Math.cos(away + off) * 9; if (walkable(x, z)) { cop.a.root.position.set(x, .1, z); break; } }
    }
    this.suspect = sp; this.cop = cop; this.t = 0; this.phase = 'run'; this.helped = false;
    sp.chase = true; cop.chase = true; sp.a.root.visible = cop.a.root.visible = true;
    this.dir = Math.atan2(q.x - cop.a.root.position.x, q.z - cop.a.root.position.z);
    this.why = WHY[Math.floor(Math.random() * WHY.length)];
    sfx('siren');
    toast(`🚨 ${cop.name}: „${COP[Math.floor(Math.random() * COP.length)]}“`, 2600);
    setTimeout(() => { if (this.suspect === sp && this.phase === 'run') toast(`🏃 ${sp.name}: „${RUN[Math.floor(Math.random() * RUN.length)]}“ (Tipp: ein Klaps hilft der Polizei)`, 2600); }, 2400);
  }

  private catch() {
    const sp = this.suspect!, cop = this.cop!;
    this.phase = 'caught'; this.t = 0;
    sp.a.play('idle'); cop.a.play('talk');
    sp.a.root.rotation.y = Math.atan2(cop.a.root.position.x - sp.a.root.position.x, cop.a.root.position.z - sp.a.root.position.z);
    cop.a.root.rotation.y = sp.a.root.rotation.y + Math.PI;
    sfx('horn');
    toast(`🚓 ${cop.name} hat ${sp.name} gestellt: ${this.why}.`, 3200);
  }

  private escape(s: SaveData) {
    toast(`💨 ${this.suspect!.name} ist der Polizei entwischt.`, 2400);
    this.end(true, s);
  }

  private end(escaped: boolean, s: SaveData) {
    const sp = this.suspect!, cop = this.cop!;
    if (!escaped && this.helped) {
      s.money += 20; s.rep += 2;
      sfx('coin'); this.city.banner('🚓 Danke für die Hilfe!', `${cop.name}: „Gut reagiert, ohne dich wäre er weg gewesen.“ +20 € · +2 Ruf`, 'good', 3800);
      this.city.refreshHud();
    }
    // abgeführt: die Person ist eine Weile von der Straße weg
    sp.chase = false; cop.chase = false; sp.a.play('idle'); cop.a.play('walk');
    if (!escaped) { sp.away = true; setTimeout(() => { sp.away = false; }, 120000); }
    this.suspect = null; this.cop = null;
  }
}
