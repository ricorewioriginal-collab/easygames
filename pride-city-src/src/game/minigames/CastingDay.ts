/* Casting-Tag in 3D (ersetzt das 2D-Spiel aus Gay Life!): Regisseur Rüdiger ruft Szenen aus, du spielst blitzschnell
   die passende Reaktion. ◀ ▶ wählt die Reaktion, A spielt sie. Zehn Takes, je schneller, desto mehr Punkte.
   Die Zeit pro Take wird kürzer. Mit „Inhalte ab 18“ kommen ein paar frechere Szenen dazu. */
import { Vector3, HemisphericLight, SpotLight, TransformNode, Scene, col } from '../../engine/bjs';
import { box, cyl, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook, type Anim } from '../Actor';
import { Arcade, rng } from './arcade';

type Cue = { c: string; a: Anim };
const REACT: Partial<Record<Anim, string>> = { cheer: '🙌 Jubeln', dance1: '💃 Tanzen', wave: '👋 Winken', laugh: '😂 Lachen', clap: '👏 Klatschen', phone: '📱 Telefonieren', drink: '🥂 Anstoßen', talk: '💬 Erzählen', sit: '🛋️ Hinsetzen' };
export const CUES: Cue[] = [
  { c: 'Du hast im Lotto gewonnen!', a: 'cheer' }, { c: 'Dein Lieblingslied läuft im Club!', a: 'dance1' },
  { c: 'Deine Freundin steht auf der anderen Straßenseite.', a: 'wave' }, { c: 'Der Witz des Jahrhunderts!', a: 'laugh' },
  { c: 'Die Drag-Queen beendet ihre Show.', a: 'clap' }, { c: 'Mama ruft an. Schon wieder.', a: 'phone' },
  { c: 'Ein Toast auf das Hochzeitspaar!', a: 'drink' }, { c: 'Erklär dem Barkeeper deinen Lieblingscocktail.', a: 'talk' },
  { c: 'Endlich Feierabend auf dem Sofa.', a: 'sit' }, { c: 'Die Parade biegt um die Ecke!', a: 'cheer' },
  { c: 'Der Brunch ist eröffnet, die Mimosas sind kalt.', a: 'drink' }, { c: 'Dein Date erzählt einen Flachwitz.', a: 'laugh' },
];
const CUES18: Cue[] = [
  { c: 'Der heiße Nachbar zieht sich am Fenster um.', a: 'wave' }, { c: 'Dein Grindr-Date ist doch nicht der von den Fotos.', a: 'laugh' },
  { c: 'Der Stripper hat sein Finale hinter sich.', a: 'clap' }, { c: 'Er ruft tatsächlich am nächsten Morgen an!', a: 'phone' },
];
const TAKES = 10;

export class CastingDay extends Arcade {
  private me!: Actor; private dir!: Actor;
  private cues: Cue[] = []; private take = -1; private opts: Anim[] = []; private pick = 0;
  private limit = 4.2; private timer = 0; private wait = 1.2; private flap!: TransformNode;
  private rnd = rng(31); private lights: SpotLight[] = [];

  protected howto() { return 'Rüdiger ruft eine Szene. ◀ ▶ wählt die passende Reaktion, A spielt sie. Je schneller, desto mehr Punkte!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 36; sc.fogColor = col(0x140f0a);
    const h = new HemisphericLight('h', new Vector3(0, 1, .4), sc); h.intensity = .5; h.diffuse = col(0xfff0dc); h.groundColor = col(0x2a2018);
    for (const sx of [-1, 1]) {
      const s = new SpotLight('s', new Vector3(sx * 3.5, 6, 3), new Vector3(-sx * .5, -1, -.6), .8, 2, sc); s.intensity = 70; s.range = 18; s.diffuse = col(sx < 0 ? 0xffe2c0 : 0xd8e8ff); this.lights.push(s);
      const st = cyl(sc, .04, .04, 3, 8); st.material = pbr(sc, 0x222222, .4, .8); st.position.set(sx * 3.5, 1.5, 2.6);
      const lamp = cyl(sc, .25, .35, .5, 12); lamp.material = pbr(sc, 0x1a1a1a, .4, .6); lamp.rotation.x = -.9; lamp.position.set(sx * 3.5, 3.1, 2.6);
    }
    // Filmset: Studioboden, Kulisse (Wohnzimmer mit Fenster), Kamera auf Stativ, Regiestuhl, Schriftzug
    const floor = ground(sc, 30, 20); floor.material = pbr(sc, 0x2a2420, .85); floor.position.z = 2;
    const set = planeZ(sc, 9, 4.5); set.material = pbr(sc, 0xe8c9a8, .9); set.position.set(0, 2.25, -2.4);
    const win = planeZ(sc, 2, 1.6); win.material = glow(sc, 0x8fd0ff, 1.1); win.position.set(-2.4, 2.6, -2.38);
    const sofa = box(sc, 2.2, .5, .8); sofa.material = pbr(sc, 0xb3264f, .9); sofa.position.set(1.8, .25, -1.8);
    const back = box(sc, 2.2, .6, .2); back.material = sofa.material; back.position.set(1.8, .75, -2.1);
    const sign = planeZ(sc, 4.4, .9);
    sign.material = glow(sc, 0xffffff, 1.5, { tex: canvasTex(sc, 512, 104, (g) => { g.font = '900 54px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffc400'; g.shadowBlur = 14; g.fillStyle = '#fff6d8'; g.fillText('KLAPPE AUF', 256, 54); }, true) });
    sign.position.set(0, 4.1, -2.35);
    const cam = new TransformNode('cam', sc); cam.position.set(-2.6, 0, 2.2); cam.rotation.y = 2.6;
    for (let i = 0; i < 3; i++) { const leg = cyl(sc, .025, .025, 1.5, 6); leg.material = pbr(sc, 0x111111, .4, .8); leg.parent = cam; leg.position.set(Math.cos(i * 2.1) * .25, .7, Math.sin(i * 2.1) * .25); leg.rotation.set(Math.sin(i * 2.1) * .3, 0, -Math.cos(i * 2.1) * .3); }
    const body = box(sc, .35, .4, .6); body.material = pbr(sc, 0x202020, .3, .7); body.parent = cam; body.position.y = 1.55;
    const lens = cyl(sc, .12, .12, .3, 14); lens.material = pbr(sc, 0x0a0a0a, .1, .9); lens.rotation.x = Math.PI / 2; lens.parent = cam; lens.position.set(0, 1.55, .42);
    const rec = cyl(sc, .03, .03, .02, 8); rec.material = glow(sc, 0xff2020, 2); rec.rotation.x = Math.PI / 2; rec.parent = cam; rec.position.set(.12, 1.72, .31);
    // Filmklappe vor der Kamera: schwarz-weiß gestreift, schlägt bei jedem Take zu
    const clap = new TransformNode('clap', sc); clap.position.set(-1.3, 2.2, 1.2); clap.rotation.y = .3;
    const stripes = canvasTex(sc, 128, 32, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#111' : '#f4f4f4'; g.beginPath(); g.moveTo(i * 16, 32); g.lineTo(i * 16 + 10, 0); g.lineTo(i * 16 + 26, 0); g.lineTo(i * 16 + 16, 32); g.fill(); } });
    const slate = box(sc, .7, .5, .04); slate.material = pbr(sc, 0x151515, .6); slate.parent = clap;
    this.flap = new TransformNode('flap', sc); this.flap.parent = clap; this.flap.position.set(-.35, .29, 0);
    const top = box(sc, .7, .08, .045); const tm = pbr(sc, 0xffffff, .6); tm.albedoTexture = stripes; top.material = tm; top.parent = this.flap; top.position.x = .35;
    // Darsteller: du im Licht, Rüdiger mit Megafon am Rand
    const [me, dir] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), Actor.create(sc, { body: 'Male_Adult_06', rb: 'Male_Adult_06', palette: 'rainbow', skin: 0 } as never)]);
    this.me = me; me.root.position.set(0, 0, -.6);
    this.dir = dir; dir.root.position.set(1.8, 0, 1.5); dir.root.rotation.y = -2.5; dir.play('talk', 0);
    const mega = cyl(sc, .05, .14, .3, 12); mega.material = pbr(sc, 0xffc400, .5); mega.rotation.z = Math.PI / 2; mega.position.set(1.6, 1.45, 1.3);
    this.cues = [...CUES, ...(this.adult ? CUES18 : [])].sort(() => this.rnd() - .5).slice(0, TAKES);
    this.camPos.set(0, 2, 6.4); this.camAt.set(0, 1.3, 0);
  }

  private next() {
    this.take++;
    if (this.take >= TAKES) { this.judge('Das ist im Kasten!', '#ffd84a'); this.end(false); return; }
    const cue = this.cues[this.take], all = Object.keys(REACT) as Anim[];
    const others = all.filter((a) => a !== cue.a).sort(() => this.rnd() - .5).slice(0, 2);
    this.opts = [cue.a, ...others].sort(() => this.rnd() - .5); this.pick = 1;
    this.limit = Math.max(2.2, 4.2 - this.take * .22); this.timer = this.limit;
    this.flap.rotation.z = 0; this.sfx('camera'); this.dir.play('talk');
    this.me.play('idle');
    this.combo(`🎬 Take ${this.take + 1}: ${cue.c}`); this.showPick();
  }
  private showPick() { this.judge(`◀ ${REACT[this.opts[this.pick]]} ▶`, '#fff'); }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.me.update(dt); this.dir.update(dt);
    this.lights.forEach((l, i) => { l.intensity = 65 + Math.sin(t * 3 + i * 2) * 5; });
    this.flap.rotation.z += ((this.timer > 0 ? .6 : 0) - this.flap.rotation.z) * Math.min(1, dt * 18);
    this.camPos.set(Math.sin(t * .3) * .3, 2, this.g.engine.aspect < 1 ? 8.6 : 6.4);
    if (this.ended) return;
    if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) this.next(); return; }
    if (inp.pressed('left')) { this.pick = (this.pick + 2) % 3; this.sfx('move'); this.showPick(); }
    if (inp.pressed('right')) { this.pick = (this.pick + 1) % 3; this.sfx('move'); this.showPick(); }
    this.timer -= dt; this.meter(Math.max(0, this.timer / this.limit), this.timer < 1 ? '#ff5f5f' : '#ffd23b');
    const at = new Vector3(0, 2.3, -.4);
    if (inp.pressed('confirm')) {
      const a = this.opts[this.pick], ok = a === this.cues[this.take].a;
      const rem = this.timer; this.me.play(a); this.timer = 0; this.wait = 1.6;
      if (ok) {
        const bonus = Math.round(50 * Math.max(0, rem) / this.limit);
        this.add(50 + bonus, at, bonus > 30 ? '#ffd23b' : '#9effc4');
        this.judge(bonus > 30 ? 'Oscar-reif!' : 'Gekauft!', '#9effc4'); this.sfx(bonus > 30 ? 'applause' : 'ok');
        this.flash('#fff6d8', .35); this.fx.burst('spark', at, 0xffc400, 0xffffff, bonus > 30 ? 40 : 20, 3, .18);
        this.dir.play(bonus > 30 ? 'cheer' : 'clap');
      } else {
        this.judge('Cut! Was war das denn?', '#ff8a6b'); this.sfx('miss'); this.shake(.25); this.dir.play('laugh');
      }
      return;
    }
    if (this.timer <= 0) { this.wait = 1.4; this.judge('Zu langsam! Cut!', '#ff8a6b'); this.sfx('miss'); this.dir.play('laugh'); this.meter(0); }
  }
}
