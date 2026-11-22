/* DJ-Pult in 3D (ersetzt den „Regenbogen-Rave“ aus Gay Life!): Du legst auf der Pride-Party auf.
   Zwei Plattenteller: 💗 House links, 💙 Techno rechts. Die Menge ruft, was sie hören will. ◀ ▶ schiebt den Crossfader,
   steht er auf der richtigen Seite, steigt die Stimmung. Läuft der Spannungsbalken voll, A genau beim DROP!
   Kein Noten-Treffen wie beim Tanz-Battle oder Karaoke, sondern Mischen und Timing. 60 Sekunden. */
import { Vector3, HemisphericLight, PointLight, TransformNode, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, sphere, ground, ring, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

const DECK = [{ n: '💗 House', c: 0xff3fb0, css: '#ff6bc8' }, { n: '💙 Techno', c: 0x3a9bff, css: '#6bb8ff' }];

export class DjBooth extends Arcade {
  private me!: Actor; private crowd: Actor[] = [];
  private fader = 0; private knob!: Mesh; private plates: Mesh[] = []; private beams: TransformNode[] = []; private beamM: PBRMaterial[] = [];
  private want = 0; private wantT = 5; private mood = .4; private tension = 0; private dropWin = 0; private acc = 0; private drops = 0;
  private ball!: Mesh; private floorL!: PointLight; private rnd = rng(71);
  protected override left = 60;

  protected howto() { return '◀ ▶ Crossfader zur Seite schieben, die die Menge hören will. Balken voll? A genau beim DROP!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 12; sc.fogEnd = 34; sc.fogColor = col(0x0a0614);
    const h = new HemisphericLight('h', new Vector3(0, 1, .3), sc); h.intensity = .45; h.diffuse = col(0xd8c8ff); h.groundColor = col(0x201030);
    this.floorL = new PointLight('f', new Vector3(0, 4, 3), sc); this.floorL.intensity = 40; this.floorL.range = 14;
    // Club: Tanzfläche mit Leuchtringen, Discokugel, Bühne mit Pult
    const floor = ground(sc, 30, 24); floor.material = pbr(sc, 0x120a1c, .6, .2); floor.position.z = 3;
    [1.5, 3, 4.5].forEach((r, i) => { const rg = ring(sc, r - .04, r + .04, 64); rg.material = glow(sc, [0xff3fb0, 0xffd23b, 0x3a9bff][i], .8); rg.position.set(0, .01, 4); });
    const stage = box(sc, 6, .6, 2.4); stage.material = pbr(sc, 0x1a1028, .5); stage.position.set(0, .3, -.4);
    const back = planeZ(sc, 16, 8); back.material = pbr(sc, 0x10081c, .7, 0, { emissive: 0x1a0830, ei: .6 }); back.position.set(0, 4, -2);
    const sign = planeZ(sc, 5, 1);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 104, (g) => { g.font = '900 52px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff3fb0'; g.shadowBlur = 18; g.fillStyle = '#fff'; g.fillText('PRIDE RAVE', 256, 54); }, true) });
    sign.position.set(0, 4.4, -1.95);
    this.ball = sphere(sc, .45, 16); this.ball.material = pbr(sc, 0xdddddd, .05, 1, { emissive: 0x666688, ei: .5 }); this.ball.position.set(0, 4.6, 2.5);
    // Pult: Tisch, zwei Plattenteller, Mischpult mit Crossfader
    const desk = box(sc, 3, .9, .9); desk.material = pbr(sc, 0x0c0c10, .3, .6); desk.position.set(0, 1.05, .4);
    const front = box(sc, 3, .5, .02); front.material = glow(sc, 0xff3fb0, 1.2, { alpha: .8 }); front.position.set(0, 1.05, .86);
    for (const sx of [-1, 1]) {
      const tt = box(sc, .9, .06, .8); tt.material = pbr(sc, 0x222228, .4, .6); tt.position.set(sx * .95, 1.53, .4);
      const p = cyl(sc, .34, .34, .02, 32); p.material = pbr(sc, 0x111111, .2, .3, { emissive: DECK[sx < 0 ? 0 : 1].c, ei: .15 }); p.position.set(sx * .95, 1.57, .4); this.plates.push(p);
      const lab = cyl(sc, .1, .1, .025, 16); lab.material = glow(sc, DECK[sx < 0 ? 0 : 1].c, 1.2); lab.parent = p;
    }
    const mixer = box(sc, .7, .08, .7); mixer.material = pbr(sc, 0x1a1a20, .4, .6); mixer.position.set(0, 1.54, .4);
    const slot = box(sc, .5, .01, .04); slot.material = pbr(sc, 0x000000, .9); slot.position.set(0, 1.585, .62);
    this.knob = box(sc, .08, .05, .1); this.knob.material = glow(sc, 0xffffff, 1.6); this.knob.position.set(0, 1.6, .62);
    // Laserstrahlen in Deck-Farben
    for (let i = 0; i < 4; i++) {
      const n = new TransformNode('beam', sc); n.position.set(-4.5 + i * 3, 6, -1);
      const m = glow(sc, DECK[i % 2].c, 1, { alpha: .12, add: true, double: true }); this.beamM.push(m);
      const b = cyl(sc, 0, 1.2, 9, 16, false); b.position.y = -4.5; b.rotation.x = Math.PI; b.parent = n; b.material = m; this.beams.push(n);
    }
    const ids = ['Male_Party_01', 'Female_Party_01', 'Male_Adult_07', 'Female_Party_03', 'Male_Party_04', 'Female_Adult_09'];
    const [me, ...folk] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), ...ids.map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 } as never))]);
    this.me = me; me.root.position.set(0, .6, -.3); me.play('dance3', 0);
    folk.forEach((a, i) => { a.root.position.set(-3.2 + (i % 3) * 3.2 + (i > 2 ? 1.4 : 0), 0, 3 + (i > 2 ? 1.6 : 0)); a.root.rotation.y = Math.PI; a.play('idle', 0); this.crowd.push(a); });
    this.newWish();
    this.camPos.set(0, 3.2, 8.6); this.camAt.set(0, 1.6, 0);
  }

  private newWish() {
    this.want = this.rnd() < .5 ? 0 : 1; this.wantT = 5 + this.rnd() * 4;
    this.judge(`Die Menge will: ${DECK[this.want].n}!`, DECK[this.want].css); this.sfx('cheer');
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.me.update(dt); this.crowd.forEach((a) => a.update(dt));
    this.plates.forEach((p, i) => { p.rotation.y += dt * (3 + this.mood * 4) * (i ? -1 : 1); });
    this.ball.rotation.y += dt * .8;
    this.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * (1 + this.mood) + i) * .5; });
    this.camPos.set(Math.sin(t * .3) * .4, 3.2, this.g.engine.aspect < 1 ? 11.5 : 8.6);
    if (this.ended) return;
    // Crossfader: −1 = House, +1 = Techno
    const mv = inp.move.x || (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0);
    this.fader = Math.max(-1, Math.min(1, this.fader + mv * dt * 2.6));
    this.knob.position.x = this.fader * .22;
    const match = this.want === 0 ? (1 - this.fader) / 2 : (1 + this.fader) / 2;   // 0..1, wie gut die Seite passt
    this.mood = Math.max(0, Math.min(1, this.mood + (match - .55) * dt * .8));
    this.wantT -= dt; if (this.wantT <= 0) this.newWish();
    this.acc += dt; while (this.acc >= .1) { this.acc -= .1; this.points += Math.round(this.mood * 3); }
    // Licht und Menge folgen der Stimmung
    const c = DECK[this.fader < 0 ? 0 : 1].c, k = .4 + this.mood * .9;
    this.floorL.diffuse.set(((c >> 16) & 255) / 255 * k, ((c >> 8) & 255) / 255 * k, (c & 255) / 255 * k);
    this.beamM.forEach((m, i) => { m.alpha = .05 + this.mood * .12 * (i % 2 === (this.fader < 0 ? 0 : 1) ? 1.4 : .6); });
    if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) this.crowd.forEach((a, i) => { if ((i + Math.floor(t * 2)) % 3 === 0) a.play(this.mood > .7 ? (i % 2 ? 'dance1' : 'dance2') : this.mood > .35 ? 'dance3' : 'idle'); });
    // Spannung baut sich auf, dann kurzes DROP-Fenster
    if (this.dropWin > 0) {
      this.dropWin -= dt;
      if (inp.pressed('confirm')) { this.drop(true); return; }
      if (this.dropWin <= 0) this.drop(false);
    } else {
      this.tension += dt / 7;
      if (this.tension >= 1) { this.tension = 1; this.dropWin = .7; this.judge('DROP!', '#ffd84a'); this.sfx('whoosh'); }
      else if (inp.pressed('confirm')) { this.mood = Math.max(0, this.mood - .15); this.sfx('squeak'); this.judge('Kratzer auf der Platte!', '#ff8a6b'); this.shake(.15); }
    }
    this.meter(this.dropWin > 0 ? 1 : this.tension, this.dropWin > 0 ? '#ffd23b' : DECK[this.want].css);
    this.combo(`Stimmung ${'🔥'.repeat(1 + Math.round(this.mood * 4))} · ${this.drops} Drops`);
  }

  private drop(hit: boolean) {
    this.tension = 0; this.dropWin = 0;
    const at = new Vector3(0, 3, 3);
    if (hit) {
      this.drops++; const pts = Math.round(80 + this.mood * 120);
      this.add(pts, at, '#ffd23b'); this.mood = Math.min(1, this.mood + .2);
      this.sfx('cheer'); this.flash(DECK[this.want].css, .35); this.shake(.35); this.slowmo(.35, .5);
      this.fx.burst('confetti', at, 0xff3fb0, 0x3a9bff, 70, 5, .2); this.fx.burst('spark', new Vector3(0, 1.7, .4), DECK[this.want].c, 0xffffff, 40, 4, .18);
      this.crowd.forEach((a) => a.play('cheer')); this.me.play('cheer');
      this.judge(this.mood > .8 ? 'Die Halle explodiert!' : 'Perfekter Drop!', '#ffd84a');
    } else { this.mood = Math.max(0, this.mood - .2); this.sfx('miss'); this.judge('Drop verpasst …', '#ff8a6b'); }
  }
}
