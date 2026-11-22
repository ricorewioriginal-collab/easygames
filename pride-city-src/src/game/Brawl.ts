/* Schlägereien und Verfolgungsjagden für die Missionen (Akt IV „Die graue Flut“): Leute vom Ordnungsbund stellen sich dir
   in den Weg, schubsen und pöbeln, du wehrst dich mit denselben Schlägen wie sonst (F / LT / 👊). Kein Blut, niemand stirbt:
   Wer umgehauen wird, rappelt sich auf und rennt weg. Verfolgt wird ein Wagen über das Straßennetz oder jemand zu Fuß
   über die Insel – die Station der Mission wandert mit, Lichtsäule und Radar zeigen immer auf das Ziel.
   Ein Bedienkonzept für Handy, PC, TV und Controller: hinlaufen, zuschlagen, hinterherfahren. */
import { type Scene, type TransformNode } from '../engine/bjs';
import type { Node3 } from '../engine/bjs';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { Actor, RUN_MPS } from './Actor';
import type { GigStep } from './gigs';
import type { CityScene } from './CityScene';
import type { Hud } from '../ui/Hud';

/** Jemand vom Ordnungsbund in einer Schlägerei */
interface Foe { a: Actor; name: string; out: boolean; cd: number; flee: number; yell: number }
/** Ziel einer Verfolgung */
interface Runner { o: Node3 | Actor; path: Array<[number, number]>; i: number; st: GigStep; car: boolean; trap: boolean; done: () => void; lost: () => void }

/** Straßennetz: Innenstadt x −60…60, Hochstadt x 90…210, verbunden über die Regenbogenbrücke (z 0) */
const GX = [-60, -30, 0, 30, 60, 90, 120, 150, 180, 210], GZ = [-60, -30, 0, 30, 60];
const FOE_LOOKS = ['Security_Male_01', 'Male_Adult_02', 'Male_Adult_07', 'Male_Adult_09', 'Male_Adult_03', 'Male_Adult_10'];
const TAUNT = ['Verschwinde hier!', 'Euch will hier keiner!', 'Geh doch zurück in deinen Glitzerclub!', 'Hier gilt Ordnung!', 'Nimm die Fahne runter!', 'Das ist unsere Straße!'];
const BACK = ['Nicht mit uns.', 'Wir bleiben.', 'Ihr seid weniger als ihr denkt.', 'Liebe ist keine Unordnung.'];
/** Mut: so oft darfst du geschubst werden, bevor dich deine Leute aus der Schlägerei ziehen */
const BRAVE = 8;

export class Brawl {
  private foes: Foe[] = [];
  private fightDone: ((won: boolean) => void) | null = null;
  private push = { x: 0, z: 0, t: 0 };
  private run: Runner | null = null;
  brave = 0;
  /** Station, an der die Schlägerei läuft (gegen Doppelstart) */
  at: GigStep | null = null;

  constructor(private city: CityScene, private sc: Scene, private hud: Hud) {}

  get fighting() { return !!this.fightDone; }
  get chasing() { return !!this.run || this.starting; }
  private starting = false;
  /** Ziele für Combat.attack */
  targets() { return this.foes.filter((f) => !f.out && f.a.root.isEnabled()); }
  isFoe(a: Actor) { return this.foes.some((f) => f.a === a); }
  /** Anzeige im Auftragsfeld während der Schlägerei */
  label() {
    const n = this.foes.length, down = this.foes.filter((f) => f.out).length;
    return `👊 Schlägerei: ${down}/${n} am Boden · Mut ${'❤'.repeat(Math.max(0, this.brave))}${'·'.repeat(Math.max(0, BRAVE - this.brave))}`;
  }

  /** Schlägerei an (x, z) mit diesen Leuten; done(true), wenn alle am Boden waren */
  async fight(st: GigStep, names: string[], done: (won: boolean) => void) {
    this.clear();
    this.at = st; this.brave = BRAVE; this.fightDone = done;
    const p = this.city.player.root.position;
    const list = await Promise.all(names.map(async (name, i) => {
      const rb = FOE_LOOKS[(i + name.length) % FOE_LOOKS.length];
      const a = await Actor.create(this.sc, { body: rb, rb, palette: 'rainbow', skin: 0 });
      const w = i / names.length * Math.PI * 2 + .4, d = 5 + (i % 2) * 1.5;
      a.root.position.set(st.x + Math.sin(w) * d, .1, st.z + Math.cos(w) * d); this.city.world.collide(a.root.position, .4);
      a.root.rotation.y = Math.atan2(p.x - a.root.position.x, p.z - a.root.position.z);
      a.play('talk');
      return { a, name, out: false, cd: 1.8 + i * 1.1, flee: 0, yell: 1 + i * 1.4 } as Foe;
    }));
    if (this.fightDone !== done) { list.forEach((f) => f.a.root.dispose()); return; }
    this.foes = list;
    sfx('hit');
    this.hud.banner('👊 Stell dich ihnen!', `${names.length} vom Ordnungsbund · Schlagen: F / LT / 👊 · Wer am Boden war, rennt weg`, 'bad', 3200);
  }

  /** Combat meldet: diese Person liegt am Boden */
  knocked(a: Actor) {
    const f = this.foes.find((q) => q.a === a); if (!f || f.out) return;
    f.out = true; f.flee = 4.2;
    toast(`✊ ${f.name} liegt am Boden. „${BACK[Math.floor(Math.random() * BACK.length)]}“`);
    if (this.foes.every((q) => q.out)) {
      const d = this.fightDone; this.fightDone = null; this.at = null;
      sfx('win'); this.hud.banner('✊ Ihr habt euch gewehrt', 'Der Ordnungsbund zieht ab.', 'good', 2600);
      setTimeout(() => d?.(true), 1400);
    }
  }

  /** Verfolgung: Wagen (Straßennetz der Stadt) oder zu Fuß (eigener Weg, z. B. über eine Insel) */
  async chase(st: GigStep, opt: { car?: string; path?: Array<[number, number]>; trap?: boolean }, done: () => void, lost: () => void) {
    this.stopRun(); this.starting = true;
    const car = !!opt.car || !opt.path;
    const path = opt.path ? opt.path.slice() : this.route(st.x, st.z, 14);
    let o: Node3 | Actor;
    if (car) o = await this.city.world.car(opt.car || 'car_sedan');
    else { const a = await Actor.create(this.sc, { body: 'Male_Adult_02', rb: 'Male_Adult_02', palette: 'rainbow', skin: 0 }); a.play('run'); o = a; }
    const node = o instanceof Actor ? o.root : o;
    node.position.set(path[0][0], .1, path[0][1]);
    this.starting = false;
    if (!this.city.gig) { node.dispose(); return; }
    this.run = { o, path, i: 1, st, car, trap: !!opt.trap, done, lost };
    st.x = path[0][0]; st.z = path[0][1];
    sfx(car ? 'horn' : 'whoosh');
  }
  /** zufällige Route über die Kreuzungen, beginnt an der nächsten Kreuzung, nie direkt zurück */
  private route(x: number, z: number, n: number): Array<[number, number]> {
    let ix = 0, iz = 0, b = 1e9;
    GX.forEach((gx, i) => GZ.forEach((gz, j) => { const d = Math.hypot(gx - x, gz - z); if (d < b) { b = d; ix = i; iz = j; } }));
    const out: Array<[number, number]> = [[GX[ix], GZ[iz]]];
    let last = -1;
    for (let k = 0; k < n; k++) {
      const opts: Array<[number, number, number]> = [];
      const add = (i: number, j: number, dir: number) => { if (i < 0 || j < 0 || i >= GX.length || j >= GZ.length) return; if ((dir ^ 1) === last) return; if ((GX[i] === 60 && GX[ix] === 90) || (GX[i] === 90 && GX[ix] === 60)) { if (GZ[j] !== 0) return; } opts.push([i, j, dir]); };
      add(ix + 1, iz, 0); add(ix - 1, iz, 1); add(ix, iz + 1, 2); add(ix, iz - 1, 3);
      if (!opts.length) break;
      const [i, j, dir] = opts[Math.floor(Math.random() * opts.length)];
      ix = i; iz = j; last = dir; out.push([GX[ix], GZ[iz]]);
    }
    return out;
  }

  /** eingeholt: Wagen bleibt stehen (verschwindet später), wer zu Fuß war, ergibt sich */
  private caught(r: Runner) {
    this.run = null; sfx('coin');
    if (r.o instanceof Actor) { r.o.play('idle'); this.left.push(r.o.root); } else this.left.push(r.o);
    r.done();
  }
  /** stehen gebliebene Wagen und Leute nach der Verfolgung (beim nächsten Aufräumen weg) */
  private left: TransformNode[] = [];
  private leftT = 0;
  private stopRun() {
    if (!this.run) return;
    const r = this.run; this.run = null;
    if (r.o instanceof Actor) r.o.root.dispose(); else r.o.dispose();
  }
  /** alles wegräumen (Mission abgebrochen, Szene verlassen) */
  clear() {
    this.stopRun(); this.starting = false;
    for (const o of this.left) o.dispose(); this.left = [];
    for (const f of this.foes) f.a.root.dispose();
    this.foes = []; this.fightDone = null; this.at = null;
  }

  update(dt: number) {
    const me = this.city.player, p = me.root.position, combat = this.city.combat;
    // geschubst werden: kurz zurückrutschen
    if (this.push.t > 0) { this.push.t -= dt; p.x += this.push.x * dt; p.z += this.push.z * dt; this.city.world.collide(p, .4); }
    for (const f of this.foes) {
      const r = f.a.root; if (!r.isEnabled()) continue;
      if (combat.holds(f.a)) continue;   // liegt oder taumelt gerade (Combat führt)
      const dx = p.x - r.position.x, dz = p.z - r.position.z, d = Math.hypot(dx, dz) || 1;
      if (f.out) {
        // aufgerappelt: wegrennen und verschwinden
        f.flee -= dt; if (f.a.anim !== 'run') f.a.play('run');
        r.rotation.y = Math.atan2(-dx, -dz); r.position.x -= dx / d * RUN_MPS * dt; r.position.z -= dz / d * RUN_MPS * dt; this.city.world.collide(r.position, .4);
        if (f.flee <= 0 || d > 30) r.setEnabled(false);
        continue;
      }
      if (!this.fightDone) continue;
      r.rotation.y = Math.atan2(dx, dz);
      f.cd -= dt; f.yell -= dt;
      if (f.yell <= 0) { f.yell = 5 + Math.random() * 4; if (d < 12) toast(`${f.name}: „${TAUNT[Math.floor(Math.random() * TAUNT.length)]}“`); }
      if (d > 1.15) {
        if (f.a.anim !== 'run' && d > 2.2) f.a.play('run'); else if (d <= 2.2 && f.a.anim !== 'walk') f.a.play('walk');
        const v = d > 2.2 ? RUN_MPS * .78 : 1.2;
        r.position.x += dx / d * v * dt; r.position.z += dz / d * v * dt; this.city.world.collide(r.position, .4);
      } else if (f.cd <= 0 && !this.city.driving) {
        // Schubser: du taumelst zurück, verlierst Mut
        f.cd = 2.6 + Math.random() * 1.6; f.a.play('talk');
        this.push = { x: dx / d * 4, z: dz / d * 4, t: .28 }; this.city.shake = .25; sfx('slap');
        me.play('laugh');
        this.brave--;
        if (this.brave <= 0) {
          const done = this.fightDone; this.fightDone = null; this.at = null;
          sfx('miss'); this.hud.banner('Du gehst zu Boden', 'Deine Leute ziehen dich raus. Atme durch und versuch es noch einmal.', 'bad', 3200);
          for (const q of this.foes) { q.out = true; q.flee = 3; }
          setTimeout(() => done?.(false), 1200);
        }
      } else if (f.a.anim !== 'idle' && f.a.anim !== 'talk') f.a.play('idle');
    }
    if (!this.fightDone && this.foes.length && this.foes.every((f) => !f.a.root.isEnabled())) { for (const f of this.foes) f.a.root.dispose(); this.foes = []; }
    if (this.left.length && !this.city.gig && (this.leftT += dt) > 25) { for (const o of this.left) o.dispose(); this.left = []; this.leftT = 0; }
    // Verfolgung: Ziel fährt bzw. rennt die Route ab; nah dran wird es schneller, weit weg langsamer (immer einholbar, nie geschenkt)
    const r = this.run; if (!r) return;
    const node = r.o instanceof Actor ? r.o.root : r.o, q = node.position;
    const dist = Math.hypot(p.x - q.x, p.z - q.z);
    const v = r.car ? Math.min(14.5, Math.max(6, 6 + (60 - dist) * .16)) : Math.min(3.3, Math.max(2.2, 2.2 + (30 - dist) * .05));
    const t = r.path[r.i];
    if (!t) { if (r.trap) { this.caught(r); return; } this.stopRun(); r.lost(); return; }
    const tx = t[0] - q.x, tz = t[1] - q.z, td = Math.hypot(tx, tz);
    if (td < .5) { r.i++; }
    else {
      const k = Math.min(1, v * dt / td);
      q.x += tx * k; q.z += tz * k;
      const yaw = Math.atan2(tx, tz); node.rotation.y += Math.atan2(Math.sin(yaw - node.rotation.y), Math.cos(yaw - node.rotation.y)) * Math.min(1, dt * 8);
    }
    r.st.x = q.x; r.st.z = q.z;
    if (dist > (r.car ? 170 : 70)) { this.stopRun(); r.lost(); return; }
    if (dist < (r.car ? 5 : 2)) this.caught(r);
  }
}
