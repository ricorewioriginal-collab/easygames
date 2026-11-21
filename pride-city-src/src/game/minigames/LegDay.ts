/* Beinetag in 3D (ersetzt das 2D-Spiel aus Gay Life!): Mehmet scheucht dich durchs Training.
   Ein Leuchtpunkt pendelt über die Kraftleiste, A im grünen Bereich stemmt die Hantel. Jede Wiederholung legt Gewicht
   nach, der Bereich wird schmaler und der Punkt schneller. Drei Fehlversuche, dann ist Schluss. */
import { Vector3, HemisphericLight, PointLight, SpotLight, Node3, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

export const COACH = ['Noch eine! Du schaffst das!', 'Atmen nicht vergessen!', 'Das war ein Fitnessstudio-Gesicht!', 'Mein Meal-Prep ist stolz auf dich.', 'Spannung halten! Spannung!', 'Gleich gibt es einen Proteinshake.'];
const W = 2.3;           // Breite der Kraftleiste

export class LegDay extends Arcade {
  private me!: Actor; private coach!: Actor;
  private bar = new Node3('bar', this.scene);
  private plates: Mesh[] = [];
  private zone!: Mesh; private dot!: Mesh; private dotM!: PBRMaterial;
  private pos = 0; private dir = 1; private spd = .55; private zw = .3; private zs = .35;
  private reps = 0; private lives = 3; private lift = 0; private wob = 0; private lock = 0;
  private rnd = rng(11);

  protected howto() { return 'Drück A, wenn der Leuchtpunkt im grünen Bereich ist. Jede Wiederholung macht es schwerer. Drei Fehlversuche!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 34; sc.fogColor = col(0x101820);
    const h = new HemisphericLight('h', new Vector3(0, 1, .3), sc); h.intensity = .7; h.diffuse = col(0xe8f4ff); h.groundColor = col(0x203040);
    const spot = new SpotLight('sp', new Vector3(0, 7, 3), new Vector3(0, -1, -.35), 1, 2, sc); spot.intensity = 90; spot.range = 20; spot.diffuse = col(0xfff2dd);
    const neon = new PointLight('n', new Vector3(-4, 3, -3), sc); neon.intensity = 25; neon.range = 12; neon.diffuse = col(0x3ee69a);
    // Studio: Gummiboden, Spiegelwand, Neon-Schriftzug, Geräte als Kulisse
    const floor = ground(sc, 30, 20); floor.material = pbr(sc, 0x1c2228, .95); floor.position.z = -4;
    const mat = ground(sc, 4, 3); mat.material = pbr(sc, 0x2a6a4a, .9); mat.position.set(0, .01, -.2);
    const wall = planeZ(sc, 30, 10); wall.material = pbr(sc, 0x26303a, .3, .6); wall.position.set(0, 5, -6);
    const sign = planeZ(sc, 5.2, 1.2);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 128, (g) => { g.font = '900 60px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#3ee69a'; g.shadowBlur = 16; g.fillStyle = '#eafff4'; g.fillText('MUSKELKATER', 256, 64); }, true) });
    sign.position.set(0, 5.4, -5.9);
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
      const rack = box(sc, .3, 2.2, .3); rack.material = pbr(sc, 0x3a4048, .4, .7); rack.position.set(sx * (4 + i * 1.6), 1.1, -4);
      const db = cyl(sc, .25, .25, .9, 12); db.rotation.z = Math.PI / 2; db.material = pbr(sc, [0xff3b6b, 0xffd23b, 0x3a7bff][i], .4, .3); db.position.set(sx * (4 + i * 1.6), .3, -3.4);
    }
    // Hantel: Stange mit Scheiben, schwebt über der Schulter der Figur
    const rod = cyl(sc, .03, .03, 2.2, 10); rod.rotation.z = Math.PI / 2; rod.material = pbr(sc, 0xd8dce4, .2, .95); rod.parent = this.bar;
    this.addPlate(); this.bar.position.set(0, 1.5, .05);
    // Kraftleiste vor der Figur (in der Welt, damit sie in jedem Format mitwandert)
    const track = box(sc, W, .16, .1); track.material = pbr(sc, 0x10141a, .5, 0, { emissive: 0x202830, ei: 1 }); track.position.set(0, .5, .9);
    this.zone = box(sc, 1, .2, .12); this.zone.material = glow(sc, 0x3ee69a, 1.4); this.zone.position.set(0, .5, .92);
    this.dot = box(sc, .12, .36, .14); this.dotM = glow(sc, 0xffffff, 2) as PBRMaterial; this.dot.material = this.dotM; this.dot.position.set(0, .5, .95);
    const [me, coach] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), Actor.create(sc, { body: 'Male_Adult_04', rb: 'Male_Adult_04', palette: 'rainbow', skin: 0 } as never)]);
    this.me = me; this.coach = coach;
    this.coach.root.position.set(1.9, 0, -.6); this.coach.root.rotation.y = -.7; this.coach.play('clap', 0);
    this.layoutZone();
    this.camPos.set(0, 1.9, 5.2); this.camAt.set(0, 1.2, 0);
  }
  private addPlate() {
    const n = this.plates.length / 2, c = [0xff3b6b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff][n % 6];
    for (const sx of [-1, 1]) {
      const p = cyl(this.scene, .32 - Math.min(.12, n * .015), .32 - Math.min(.12, n * .015), .07, 18); p.rotation.z = Math.PI / 2;
      p.material = pbr(this.scene, c, .35, .3, { emissive: c, ei: .25 }); p.parent = this.bar; p.position.x = sx * (.75 + n * .085);
      this.plates.push(p);
    }
  }
  private layoutZone() { this.zone.scaling.x = this.zw * W; this.zone.position.x = (this.zs + this.zw / 2 - .5) * W; }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended) {
      this.pos += this.dir * this.spd * dt; if (this.pos >= 1) { this.pos = 1; this.dir = -1; } if (this.pos <= 0) { this.pos = 0; this.dir = 1; }
      this.lock = Math.max(0, this.lock - dt);
      if (inp.pressed('confirm') && this.lock <= 0) this.press();
    }
    this.dot.position.x = (this.pos - .5) * W;
    const inZone = this.pos >= this.zs && this.pos <= this.zs + this.zw;
    this.dotM.albedoColor.set(inZone ? .4 : 2, inZone ? 2 : 2, inZone ? .6 : 2);
    // Hantel hoch und wieder runter, Wackeln bei Fehlern
    this.lift = Math.max(0, this.lift - dt * 1.4); this.wob = Math.max(0, this.wob - dt * 1.5);
    const up = Math.sin(Math.min(1, this.lift) * Math.PI);
    this.bar.position.y = 1.5 + up * .85; this.bar.rotation.z = Math.sin(t * 22) * this.wob * .25;
    this.me.update(dt); this.coach.update(dt);
    this.combo(`${'❤️'.repeat(this.lives)}${'🤍'.repeat(3 - this.lives)} · ${this.reps} Wiederholungen`);
    this.camPos.set(Math.sin(t * .25) * .4, 1.9, this.g.engine.aspect < 1 ? 6.6 : 5.2);
  }

  private press() {
    const mid = this.zs + this.zw / 2, d = Math.abs(this.pos - mid), at = this.bar.position.clone();
    this.lock = .35;
    if (d <= this.zw / 2) {
      this.reps++; const perfect = d < this.zw * .15;
      this.add(perfect ? 40 : 20, at, perfect ? '#ffd23b' : '#9effc4');
      this.lift = 1; this.me.play('jump'); this.sfx('ok'); if (perfect) { this.sfx('coin'); this.flash('#3ee69a', .2); }
      this.fx.burst('spark', at, 0x3ee69a, 0xffffff, perfect ? 40 : 18, 3, .2);
      this.fx.burst('goo', at.add(new Vector3(0, -.2, .2)), 0xbfe8ff, 0xffffff, 6, 1.5, .1); // Schweißperlen
      this.judge(perfect ? 'PERFEKT!' : COACH[Math.floor(this.rnd() * COACH.length)], perfect ? '#ffd84a' : '#fff');
      this.coach.play(this.reps % 3 ? 'clap' : 'cheer');
      if (this.reps % 2 === 0 && this.plates.length < 16) { this.addPlate(); this.shake(.25); }
      this.zw = Math.max(.08, this.zw - .016); this.spd = Math.min(1.8, this.spd + .07); this.zs = .04 + this.rnd() * (.92 - this.zw); this.layoutZone();
    } else {
      this.lives--; this.wob = 1; this.shake(.5); this.sfx('miss'); this.me.play('hit'); this.coach.play('laugh');
      this.judge('Daneben! Die Hantel wackelt.', '#ff8a6b');
      if (this.lives <= 0) this.end(false);
    }
  }
}
