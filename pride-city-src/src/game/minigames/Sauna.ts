/* Sauna-Aufguss in 3D (ersetzt das 2D-Spiel aus Gay Life!): Halte die Hitze im grünen Bereich.
   ▶ = Aufguss (Dampf zischt vom Ofen), ◀ = Kaltdusche, der Ofen heizt von selbst nach. Rutscht das Handtuch,
   schnell A drücken! 45 Sekunden, Punkte für jede Sekunde im Wohlfühlbereich. */
import { Vector3, HemisphericLight, PointLight, Node3, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, sphere, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

export const SAUNA_GAG = ['Der Saunameister gießt auf und blickt streng.', 'Ein Gast fächelt sich mit der Speisekarte Luft zu.', 'Jemand schwört, er sitzt nur wegen der Wärme hier.', 'Das Thermometer zwinkert verdächtig.', 'Es duftet nach Eukalyptus und schlechten Entscheidungen.'];

export class Sauna extends Arcade {
  private me!: Actor; private guest!: Actor;
  private heat = 50; private towel = 0; private nextT = 6; private gagT = 8; private acc = 0;
  private glowL!: PointLight; private stones!: PBRMaterial; private needle = new Node3('needle', this.scene);
  private cloth!: Mesh; private rnd = rng(17);
  protected override left = 45;

  protected howto() { return '▶ Aufguss, ◀ Kaltdusche: Hitze im grünen Bereich halten. Rutscht das Handtuch, sofort A!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 6; sc.fogEnd = 22; sc.fogColor = col(0x6a3a20);
    const h = new HemisphericLight('h', new Vector3(0, 1, .2), sc); h.intensity = .6; h.diffuse = col(0xffd2a0); h.groundColor = col(0x4a2810);
    this.glowL = new PointLight('ofen', new Vector3(-2.2, 1.2, -1), sc); this.glowL.intensity = 30; this.glowL.range = 10; this.glowL.diffuse = col(0xff7a30);
    // Holzkabine: Wände aus Latten (Textur), zwei Bankstufen, Ofen mit Steinen, Kübel, Thermometer
    const wood = canvasTex(sc, 256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b97c45' : '#c98b52'; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(60,30,10,.35)'; g.fillRect(0, i * 32 + 30, 256, 2); } });
    wood.uScale = 3; wood.vScale = 2; wood.wrapU = 1; wood.wrapV = 1;
    const wm = pbr(sc, 0xffffff, .8); wm.albedoTexture = wood;
    const back = planeZ(sc, 14, 6); back.material = wm; back.position.set(0, 3, -3.2);
    for (const sx of [-1, 1]) { const side = planeZ(sc, 8, 6); side.material = wm; side.rotation.y = sx * Math.PI / 2; side.position.set(-sx * 5.5, 3, 0); }
    const floor = ground(sc, 14, 10); floor.material = pbr(sc, 0x7a4a2a, .9); floor.position.z = 1;
    const b1 = box(sc, 9, .5, 1.1); b1.material = wm; b1.position.set(.8, .55, -1.6);
    const b2 = box(sc, 9, .5, 1.1); b2.material = wm; b2.position.set(.8, 1.15, -2.6);
    const oven = box(sc, 1.2, 1.2, 1); oven.material = pbr(sc, 0x2a2a2e, .5, .8); oven.position.set(-3.8, .6, -1.8);
    this.stones = pbr(sc, 0x555058, .9, 0, { emissive: 0xff4a10, ei: .4 });
    for (let i = 0; i < 12; i++) { const s = sphere(sc, .16 + this.rnd() * .06, 8); s.material = this.stones; s.position.set(-3.8 + (this.rnd() - .5) * .9, 1.3, -1.8 + (this.rnd() - .5) * .7); }
    const bucket = cyl(sc, .25, .2, .4, 14); bucket.material = pbr(sc, 0x8a5a30, .7); bucket.position.set(-2.8, .2, -1);
    // Thermometer an der Wand: Skala mit grünem Bereich und Zeiger
    const scale = box(sc, .3, 2.2, .05); scale.material = pbr(sc, 0xf2e6d0, .6); scale.position.set(3.9, 3.2, -3.15);
    const green = box(sc, .32, 2.2 * .25, .06); green.material = glow(sc, 0x3ee69a, 1.2); green.position.set(3.9, 3.2 - 1.1 + 2.2 * .575, -3.13);
    const red = box(sc, .32, 2.2 * .18, .06); red.material = glow(sc, 0xff3b3b, 1.2); red.position.set(3.9, 3.2 - 1.1 + 2.2 * .91, -3.13);
    const nd = box(sc, .5, .06, .06); nd.material = glow(sc, 0xffffff, 2); nd.parent = this.needle; this.needle.position.set(3.9, 2.1, -3.1);
    // Du und ein Gast auf der Bank (sitzend), dazu dein Handtuch
    const [me, guest] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), Actor.create(sc, { body: 'Male_Adult_10', rb: 'Male_Adult_10', palette: 'rainbow', skin: 0 } as never)]);
    this.me = me; me.root.position.set(.6, .35, -1.55); me.play('sit', 0);
    this.guest = guest; guest.root.position.set(2.6, .95, -2.55); guest.play('sit', 0);
    this.cloth = box(sc, .62, .32, .5); this.cloth.material = pbr(sc, 0xffffff, .95, 0, { emissive: 0xffffff, ei: .08 }); this.cloth.position.set(.6, .95, -1.35);
    this.camPos.set(0, 2.3, 5.4); this.camAt.set(0, 1.6, -1.6);
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended) {
      if (inp.pressed('right')) { this.heat = Math.min(110, this.heat + 14); this.sfx('shower'); this.fx.burst('spark', new Vector3(-3.8, 1.5, -1.8), 0xffffff, 0xffd2b0, 50, 2.5, .6, 1.4); this.shake(.15); }
      if (inp.pressed('left')) { this.heat = Math.max(-10, this.heat - 17); this.sfx('splash'); this.fx.burst('goo', new Vector3(.6, 3, -1.5), 0x9fe0ff, 0xffffff, 40, 2, .14, -.5); this.flash('#9fe0ff', .2); }
      this.heat += (1 + (this.heat > 60 ? .3 : 0)) * dt * 0.75;
      this.acc += dt;
      while (this.acc >= .1) { this.acc -= .1; if (this.heat >= 45 && this.heat <= 70) this.points += 1; else if (this.heat > 92) this.points = Math.max(0, this.points - 1); }
      this.nextT -= dt; this.gagT -= dt;
      if (this.nextT <= 0 && !this.towel && this.left > 4) { this.towel = 1.6; this.nextT = 7 + this.rnd() * 5; this.judge('Handtuch rutscht – A!', '#ff8ad8'); this.sfx('squeak'); }
      if (this.towel) {
        this.towel -= dt;
        if (inp.pressed('confirm')) { this.towel = 0; this.add(50, this.cloth.position, '#ffd23b'); this.sfx('ok'); this.judge('Gerade noch gerettet!', '#9effc4'); this.combo('Der Saal applaudiert. Dezent.'); this.guest.play('clap'); }
        else if (this.towel <= 0) { this.towel = 0; this.add(-40, this.cloth.position); this.sfx('miss'); this.shake(.3); this.judge('Handtuch weg!', '#ff8a6b'); this.combo(SAUNA_GAG[Math.floor(this.rnd() * SAUNA_GAG.length)]); this.guest.play('laugh'); }
      } else if (this.gagT <= 0) { this.gagT = 9; this.combo(SAUNA_GAG[Math.floor(this.rnd() * SAUNA_GAG.length)]); }
    }
    // Handtuch rutscht sichtbar, Licht und Steine glühen mit der Hitze, Dampf steigt auf
    this.cloth.position.y += ((this.towel ? .55 : .95) - this.cloth.position.y) * Math.min(1, dt * 6);
    this.cloth.rotation.z = this.towel ? Math.sin(t * 20) * .15 : 0;
    const k = Math.max(0, Math.min(1, (this.heat + 10) / 120));
    this.glowL.intensity = 15 + k * 50; this.stones.emissiveColor.set(1 * k * 1.4, .25 * k, .05 * k);
    this.scene.fogColor.set(.12 + k * .25, .06 + k * .04, .03);
    this.needle.position.y = 2.1 + Math.max(0, Math.min(1, this.heat / 100)) * 2.2;
    if (Math.floor(t * 4) % 3 === 0) this.fx.burst('spark', new Vector3((this.rnd() - .5) * 6, .6, -1.5), 0xffffff, 0xffe8d0, 2, .8, .7, 1.5);
    this.meter(this.heat / 100, this.heat > 92 ? '#ff3b3b' : this.heat >= 45 && this.heat <= 70 ? '#3ee69a' : '#ffd23b');
    this.camPos.set(0, this.g.engine.aspect < 1 ? 2.8 : 2.3, this.g.engine.aspect < 1 ? 9.5 : 5.4);
    this.me.update(dt); this.guest.update(dt);
  }
}
