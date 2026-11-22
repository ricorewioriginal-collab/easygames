/* Outfit-Check in 3D (ersetzt das 2D-Spiel aus Gay Life!): fünf Anlässe, eine strenge Jury am Laufsteg.
   ◀ ▶ wechselt den Look (echte Outfits und Szene-Looks aus outfit.ts/queer.ts direkt an deiner Figur), A läuft los.
   Die Jury hält Wertungstafeln hoch. Mit „Inhalte ab 18“ kommen Harness und die Lederparty dazu. */
import { Vector3, HemisphericLight, SpotLight, Mesh, Scene, col, type Texture } from '../../engine/bjs';
import { box, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook, type Look, type Outfit } from '../Actor';
import { Arcade, rng } from './arcade';

type LookOpt = { id: string; n: string; outfit: Outfit; style?: string; adult?: boolean };
const LOOKS: LookOpt[] = [
  { id: 'alltag', n: '👕 Jeans und Shirt', outfit: 'clothed' }, { id: 'regenbogen', n: '🌈 Regenbogen-Shirt', outfit: 'clothed', style: 'regenbogen' },
  { id: 'gold', n: '✨ Gold-Pailletten', outfit: 'clothed', style: 'gold' }, { id: 'leder', n: '🖤 Ganz in Leder', outfit: 'clothed', style: 'lederjacke' },
  { id: 'glitzer', n: '💖 Glitzer in Pink', outfit: 'clothed', style: 'glitzer' }, { id: 'swim', n: '🩱 Badehose / Bikini', outfit: 'swim' },
  { id: 'shirtless', n: '💪 Oberkörperfrei', outfit: 'shirtless' }, { id: 'harness', n: '⛓️ Harness', outfit: 'harness', adult: true },
];
type Occ = { n: string; s: Record<string, number>; adult?: boolean };
export const OCCASIONS: Occ[] = [
  { n: '🏖️ Strandtag an der Playa Arcoíris', s: { swim: 3, shirtless: 2, regenbogen: 1 } },
  { n: '🏳️‍🌈 CSD-Parade', s: { regenbogen: 3, glitzer: 2, harness: 2, shirtless: 1, gold: 1 } },
  { n: '🎭 Gala im Opernhaus', s: { gold: 3, leder: 1, alltag: 1 } },
  { n: '🥞 Sonntagsbrunch bei Oma', s: { alltag: 3, regenbogen: 2 } },
  { n: '🏋️ Beinetag im Fitnessstudio', s: { shirtless: 3, alltag: 1 } },
  { n: '👑 Drag-Show in der One Love Bar', s: { glitzer: 3, gold: 2, regenbogen: 1 } },
  { n: '👪 Erstes Treffen mit den Schwiegereltern', s: { alltag: 3, gold: 1 } },
  { n: '⛓️ Lederparty im Keller', s: { leder: 3, harness: 3, shirtless: 1 }, adult: true },
];
const RUNWAY = 6;

export class OutfitCheck extends Arcade {
  private me!: Actor; private jury: Actor[] = []; private boards: Mesh[] = []; private texs: Texture[] = [];
  private occ: Occ[] = []; private round = -1; private looks: LookOpt[] = []; private pick = 0;
  private phase: 'pick' | 'walk' | 'score' = 'pick'; private pt = 0; private dressT = 0;
  private rnd = rng(53);

  protected howto() { return '◀ ▶ wechselt deinen Look, A läuft los. Passt das Outfit zum Anlass, zückt die Jury die Zehn!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 40; sc.fogColor = col(0x120818);
    const h = new HemisphericLight('h', new Vector3(0, 1, .5), sc); h.intensity = .6; h.diffuse = col(0xffe8f4); h.groundColor = col(0x2a1430);
    const sp = new SpotLight('sp', new Vector3(0, 7, 4), new Vector3(0, -1, -.4), .9, 2, sc); sp.intensity = 110; sp.range = 22; sp.diffuse = col(0xfff4f8);
    // Laufsteg mit Leuchtkanten, Kulisse mit Schriftzug, Jurytisch
    const floor = ground(sc, 30, 24); floor.material = pbr(sc, 0x1a1020, .8);
    const run = box(sc, 1.8, .3, RUNWAY + 1); run.material = pbr(sc, 0xf2f0f4, .25, .1); run.position.set(0, .15, RUNWAY / 2 - 2);
    for (const sx of [-1, 1]) { const e = box(sc, .05, .05, RUNWAY + 1); e.material = glow(sc, 0xff3fb0, 1.8); e.position.set(sx * .92, .31, RUNWAY / 2 - 2); }
    const back = planeZ(sc, 12, 6); back.material = pbr(sc, 0x2a1238, .6, 0, { emissive: 0x2a0c40, ei: .6 }); back.position.set(0, 3, -3);
    const sign = planeZ(sc, 4.6, .9);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 100, (g) => { g.font = '900 54px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff3fb0'; g.shadowBlur = 16; g.fillStyle = '#fff'; g.fillText('OUTFIT-CHECK', 256, 52); }, true) });
    sign.position.set(0, 4.2, -2.95);
    const desk = box(sc, 4.2, .8, .7); desk.material = pbr(sc, 0x101014, .3, .6); desk.position.set(-3.4, .4, 2.4); desk.rotation.y = Math.PI / 2;
    const ids = ['Female_Adult_09', 'Male_Adult_05', 'Female_Party_01'];
    const [me, ...jury] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), ...ids.map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 } as never))]);
    this.me = me; me.root.position.set(0, .3, -2); me.play('idle', 0);
    jury.forEach((a, i) => {
      a.root.position.set(-4.1, 0, 1.2 + i * 1.2); a.root.rotation.y = Math.PI / 2; a.play('idle', 0); this.jury.push(a);
      const b = planeZ(sc, .55, .4, true); b.position.set(-3.4, 1.15, 1.2 + i * 1.2); b.rotation.y = -Math.PI / 2; b.setEnabled(false); this.boards.push(b);
    });
    this.looks = LOOKS.filter((l) => this.adult || !l.adult);
    this.occ = OCCASIONS.filter((o) => this.adult || !o.adult).sort(() => this.rnd() - .5).slice(0, 5);
    this.camPos.set(3.6, 2.4, 6.4); this.camAt.set(-.8, 1.2, 0);
    this.next();
  }

  private next() {
    this.round++;
    if (this.round >= this.occ.length) { this.judge('Die Jury verneigt sich!', '#ffd84a'); this.end(false); return; }
    this.phase = 'pick'; this.pick = 0; this.dressT = .01;
    this.me.root.position.set(0, .3, -2); this.me.root.rotation.y = 0; this.me.play('idle');
    this.boards.forEach((b) => b.setEnabled(false));
    this.combo(`Anlass ${this.round + 1}/5: ${this.occ[this.round].n}`); this.showPick();
  }
  private showPick() { this.judge(`◀ ${this.looks[this.pick].n} ▶`, '#fff'); }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.me.update(dt); this.jury.forEach((a) => a.update(dt));
    const tall = this.g.engine.aspect < 1;
    this.camPos.set((tall ? 1.6 : 3.6) + Math.sin(t * .3) * .3, tall ? 3.2 : 2.4, tall ? 11 : 6.4); this.camAt.set(tall ? -1.4 : -.8, 1.2, tall ? 1 : 0);
    if (this.ended) return;
    if (this.phase === 'pick') {
      if (inp.pressed('left')) { this.pick = (this.pick + this.looks.length - 1) % this.looks.length; this.sfx('move'); this.showPick(); this.dressT = .25; }
      if (inp.pressed('right')) { this.pick = (this.pick + 1) % this.looks.length; this.sfx('move'); this.showPick(); this.dressT = .25; }
      // umziehen erst, wenn die Auswahl kurz steht (das Umfärben der Textur kostet am Handy etwas)
      if (this.dressT > 0) { this.dressT -= dt; if (this.dressT <= 0) { const l = this.looks[this.pick]; this.me.setLook({ outfit: l.outfit, style: l.style } as Partial<Look>); this.fx.burst('spark', new Vector3(0, 1.4, -2), 0xff3fb0, 0xffffff, 16, 2, .14); } }
      this.me.root.rotation.y = Math.sin(t * 1.2) * .5;
      if (inp.pressed('confirm')) {
        if (this.dressT > 0) { const l = this.looks[this.pick]; this.me.setLook({ outfit: l.outfit, style: l.style } as Partial<Look>); this.dressT = 0; }
        this.phase = 'walk'; this.pt = 0; this.me.root.rotation.y = 0; this.me.play('walk'); this.sfx('whoosh'); this.judge('', '#fff');
      }
      return;
    }
    this.pt += dt;
    if (this.phase === 'walk') {
      this.me.root.position.z = -2 + Math.min(1, this.pt / 2.2) * (RUNWAY - 2.4);
      if (this.pt >= 2.2) { this.phase = 'score'; this.pt = 0; this.me.play('pose'); this.me.root.rotation.y = -Math.PI / 2 + .4; this.score(); }
      return;
    }
    if (this.pt > 3.2) this.next();
  }

  private score() {
    const l = this.looks[this.pick], base = this.occ[this.round].s[l.id] || 0;
    const sc = this.scene; this.texs.forEach((x) => x.dispose()); this.texs = [];
    let sum = 0;
    this.jury.forEach((a, i) => {
      const v = Math.max(1, Math.min(10, base * 3 + 1 + Math.floor(this.rnd() * 2) + (base === 3 && this.rnd() < .5 ? 1 : 0)));
      sum += v;
      const tex = canvasTex(sc, 128, 96, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 96); g.fillStyle = v >= 8 ? '#e0218a' : v >= 5 ? '#222' : '#888'; g.font = '900 70px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(v), 64, 52); });
      this.texs.push(tex);
      const b = this.boards[i]; b.material?.dispose(); b.material = glow(sc, 0xffffff, 1.1, { tex }); b.setEnabled(true);
      a.play(v >= 8 ? 'clap' : v >= 5 ? 'talk' : 'laugh');
    });
    const at = this.me.root.position.add(new Vector3(0, 2.2, 0));
    this.add(sum * 10, at, sum >= 24 ? '#ffd23b' : '#9effc4');
    if (sum >= 24) { this.judge(['Ikone!', 'Fashion-Moment!', 'Zehn von zehn!'][this.round % 3], '#ffd84a'); this.sfx('applause'); this.flash('#ff3fb0', .25); this.fx.burst('confetti', at, 0xff3fb0, 0xffd23b, 50, 4, .2); this.me.play('cheer'); }
    else if (sum >= 15) { this.judge('Kann man so machen.', '#9effc4'); this.sfx('ok'); }
    else { this.judge(['Mutig. Sehr mutig.', 'Die Jury ringt um Fassung.', 'Hat dich jemand so rausgelassen?'][this.round % 3], '#ff8a6b'); this.sfx('miss'); this.shake(.2); }
  }
}
