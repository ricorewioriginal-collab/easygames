/* Karaoke in 3D (ersetzt das 2D-Spiel aus Gay Life!): Bühne mit Mikro, Scheinwerfern und Publikum.
   ◀ ▶ wählt das Lied (Texte aus Gay Life!, selbst erfunden), A startet. Die Silben fliegen als Leuchtschrift auf die
   Linie zu, A im Takt singt sie. Perfekt, Gut, Daneben – das Publikum geht mit. */
import { Vector3, HemisphericLight, SpotLight, TransformNode, Mesh, Scene, col } from '../../engine/bjs';
import { box, cyl, sphere, ground, ring, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade } from './arcade';
import { music } from '../../engine/Audio';

export const KARA = [
  { n: 'Regenbogen-Rendezvous', bpm: 96, lines: ['Re|gen|bo|gen|ü|ber|mir', 'Glit|zer|reg|net|auf|den|Platz', 'Heu|te|bin|ich|ei|ne|Di|va', 'und|der|Mond|singt|laut|mit|mir'] },
  { n: 'Sonntags-Brunch-Hymne', bpm: 108, lines: ['Sekt|zum|Früh|stück|ist|ein|Muss', 'A|vo|ca|do|auf|dem|Brot', 'Mo|ni|ca|die|Pflan|ze|blüht', 'Brunch|ist|Lie|be|Brunch|ist|Gott'] },
  { n: 'Tanz die Nacht', bpm: 120, lines: ['Dis|ko|ku|gel|dreht|sich|schnell', 'Wir|sind|laut|und|wir|sind|bunt', 'Kein|Mensch|schläft|vor|vier|Uhr|früh', 'Tanz|mit|mir|bis|der|Tag|an|bricht'] },
];
const COLORS = [0xff3b8d, 0x3bd1ff, 0xffd23b, 0x5dff7a];
const SPEED = 3.2, HIT_X = -2.2;
interface Syl { w: string; t: number; m: Mesh; hit: number }

export class Karaoke extends Arcade {
  private me!: Actor; private crowd: Actor[] = [];
  private song = 0; private phase: 'pick' | 'sing' = 'pick';
  private syl: Syl[] = []; private start = 0; private beat = .5; private beatN = -1; private endT = 0;
  private combo2 = 0; private beams: TransformNode[] = []; private line!: Mesh;
  private now = 0;

  protected howto() { return '◀ ▶ Lied wählen, A startet. Dann A drücken, wenn eine Silbe die Linie erreicht.'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 40; sc.fogColor = col(0x0c0618);
    const h = new HemisphericLight('h', new Vector3(0, 1, .4), sc); h.intensity = .55; h.diffuse = col(0xc8b0ff); h.groundColor = col(0x2a1840);
    const sp = new SpotLight('sp', new Vector3(0, 8, 4), new Vector3(0, -1, -.5), .7, 2, sc); sp.intensity = 120; sp.range = 22; sp.diffuse = col(0xffe8f8);
    // Bühne mit Leuchtkante, Vorhang, Mikrofonständer
    const stage = cyl(sc, 3.4, 3.6, .5, 40); stage.material = pbr(sc, 0x1a1030, .4, .2); stage.position.set(0, .25, -1);
    const edge = ring(sc, 3.45, 3.62, 64); edge.material = glow(sc, 0xff3fb0, 1.8); edge.position.set(0, .51, -1);
    const curtain = planeZ(sc, 16, 9); curtain.material = pbr(sc, 0x7a0f3a, .8, 0, { emissive: 0x3a0018, ei: .6 }); curtain.position.set(0, 4.5, -5);
    const mic = new TransformNode('mic', sc); mic.position.set(.55, .5, -.2);
    const st = cyl(sc, .02, .02, 1.45, 8); st.material = pbr(sc, 0x222222, .3, .9); st.position.y = .72; st.parent = mic;
    const head = sphere(sc, .07, 10); head.material = pbr(sc, 0x888888, .3, .9); head.position.y = 1.48; head.parent = mic;
    const floor = ground(sc, 40, 30); floor.material = pbr(sc, 0x120a20, .7); floor.position.z = 4;
    COLORS.forEach((c, i) => {
      const node = new TransformNode('beam', sc); node.position.set(-6 + i * 4, 9, -3);
      const b = cyl(sc, 0, 1.6, 10, 20, false); b.position.y = -5; b.rotation.x = Math.PI; b.parent = node; b.material = glow(sc, c, 1, { alpha: .1, add: true, double: true });
      this.beams.push(node);
    });
    // Leuchtband, auf dem die Silben kommen, mit Trefferlinie
    const band = box(sc, 12, .9, .05); band.material = glow(sc, 0x1a0c34, 1, { alpha: .7 }); band.position.set(2.5, 3.6, 1.2);
    this.line = box(sc, .08, 1.1, .08); this.line.material = glow(sc, 0xffffff, 2.2); this.line.position.set(HIT_X, 3.6, 1.25);
    const crowdIds = ['Female_Party_01', 'Male_Adult_07', 'Female_Adult_09', 'Male_Adult_02', 'Female_Party_02'];
    const [me, ...folk] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), ...crowdIds.map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 } as never))]);
    this.me = me; me.root.position.set(0, .5, -.6); me.play('idle', 0);
    folk.forEach((a, i) => { a.root.position.set(-4 + i * 2, 0, 3.2 + (i % 2) * .8); a.root.rotation.y = Math.PI; a.play('idle', 0); this.crowd.push(a); });
    this.camPos.set(0, 2.6, 8.2); this.camAt.set(0, 2.2, 0);
    this.showPick();
  }

  private showPick() { const k = KARA[this.song]; this.judge(`◀ ${k.n} ▶`, '#ff8ad8'); this.combo(`${k.bpm} BPM · A startet`); }

  private begin() {
    const sc = this.scene, k = KARA[this.song];
    this.phase = 'sing'; this.beat = 60 / k.bpm; music(null);
    let t = 3 * this.beat, n = 0;
    k.lines.forEach((ln) => { ln.split('|').forEach((w) => {
      const tex = canvasTex(sc, 256, 96, (g) => { g.font = '900 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#' + COLORS[n % 4].toString(16).padStart(6, '0'); g.shadowBlur = 14; g.fillStyle = '#fff'; g.fillText(w, 128, 50); }, true);
      const m = planeZ(sc, 1.6, .6); m.material = glow(sc, 0xffffff, 1.4, { tex }); m.position.set(20, 3.6, 1.3);
      this.syl.push({ w, t, m, hit: 0 }); t += this.beat; n++;
    }); t += this.beat * 2; });
    this.endT = t + 1; this.start = performance.now() / 1000 + .4;
    this.judge('', '#fff'); this.combo('Bühne frei!');
    this.me.play('dance1'); this.crowd.forEach((a, i) => a.play(i % 2 ? 'clap' : 'dance2'));
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * .9 + i) * .45; });
    this.me.update(dt); this.crowd.forEach((a) => a.update(dt));
    if (this.phase === 'pick') {
      if (this.ended) return;
      if (inp.pressed('left')) { this.song = (this.song + KARA.length - 1) % KARA.length; this.sfx('move'); this.showPick(); }
      if (inp.pressed('right')) { this.song = (this.song + 1) % KARA.length; this.sfx('move'); this.showPick(); }
      if (inp.pressed('confirm')) { this.sfx('ok'); this.begin(); }
      return;
    }
    this.now = performance.now() / 1000 - this.start;
    // Takt: leiser Beat und Licht-Puls
    const bn = Math.floor(this.now / this.beat);
    if (bn !== this.beatN && this.now > 0 && this.now < this.endT) { this.beatN = bn; this.sfx(bn % 2 ? 'step' : 'hit'); this.line.scaling.y = 1.3; }
    this.line.scaling.y += (1 - this.line.scaling.y) * Math.min(1, dt * 8);
    for (const s of this.syl) {
      if (s.hit) continue;
      s.m.position.x = HIT_X + (s.t - this.now) * SPEED;
      s.m.setEnabled(s.m.position.x < 9);
      if (this.now - s.t > this.beat * .45) { s.hit = -1; s.m.setEnabled(false); this.combo2 = 0; this.combo(''); }
    }
    if (!this.ended && inp.pressed('confirm')) this.sing();
    if (!this.ended && this.now > this.endT) this.end(false);
  }

  private sing() {
    let best: Syl | null = null, bd = 9;
    for (const s of this.syl) { if (s.hit) continue; const d = Math.abs(s.t - this.now); if (d < bd) { bd = d; best = s; } }
    const at = new Vector3(HIT_X, 3.6, 1.4);
    if (!best || bd > this.beat * .4) { this.combo2 = 0; this.pop('schief', at.add(new Vector3(0, -.9, 0)), '#ff6b6b'); this.sfx('miss'); return; }
    best.hit = 1; best.m.setEnabled(false);
    const perfect = bd < this.beat * .12;
    this.combo2++;
    this.add((perfect ? 30 : 15) + Math.min(20, this.combo2 * 2), at, perfect ? '#ffd23b' : '#9effc4');
    this.fx.burst('spark', at, COLORS[this.combo2 % 4], 0xffffff, perfect ? 30 : 12, 3, .2);
    this.pop(perfect ? `${best.w} ✨` : best.w, at.add(new Vector3(0, -.9, 0)), perfect ? '#ffd84a' : '#fff');
    this.sfx(perfect ? 'coin' : 'move');
    if (this.combo2 % 8 === 0) { this.sfx('cheer'); this.flash('#ff3fb0', .2); this.fx.burst('confetti', new Vector3(0, 4, 2), 0xff3b8d, 0x3bd1ff, 50, 4, .2); this.crowd.forEach((a) => a.play('cheer')); this.shake(.2); }
    this.combo(this.combo2 >= 4 ? `${this.combo2}er Combo!` : '');
  }
}
