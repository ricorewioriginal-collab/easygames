/* Dunkelkammer in 3D (ersetzt das 2D-Spiel aus Gay Life!): stockfinstere Party, nur deine Taschenlampe leuchtet.
   ◀ ▶ schwenkt den Lichtkegel, verlorene Sachen funkeln im Licht, A greift zu. Steht jemand im Lichtkegel vor dir,
   rempelst du ihn an. Fünf Sachen pro Runde, danach tanzen alle schneller. 60 Sekunden.
   Mit „Inhalte ab 18“ liegen frechere Fundstücke herum, die Regeln bleiben gleich. */
import { Vector3, HemisphericLight, SpotLight, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, torus, ground, ring, pbr, glow } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

type Item = { n: string; m: Mesh; mat: PBRMaterial; a: number; r: number; got: boolean };
type Dancer = { a: Actor; r: number; ang: number; v: number };
const CONE = .32;

export class DarkRoom extends Arcade {
  private me!: Actor; private lamp!: SpotLight; private beam!: Mesh;
  private aim = 0; private items: Item[] = []; private folk: Dancer[] = []; private round = 0; private cool = 0;
  private rnd = rng(41);
  protected override left = 60;

  protected howto() { return '◀ ▶ schwenkt die Taschenlampe. Funkelt etwas im Licht, A greift zu. Niemanden anrempeln!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 6; sc.fogEnd = 16; sc.fogColor = col(0x05030a);
    const h = new HemisphericLight('h', new Vector3(0, 1, 0), sc); h.intensity = .2; h.diffuse = col(0x6a5aa0); h.groundColor = col(0x100818);
    this.lamp = new SpotLight('lamp', new Vector3(0, 1.3, 0), new Vector3(0, -.15, 1), CONE * 2.2, 6, sc); this.lamp.intensity = 60; this.lamp.range = 9; this.lamp.diffuse = col(0xfff2c8);
    // Raum: dunkler Boden, schwache UV-Ringe, Wände rundherum
    const floor = ground(sc, 16, 16); floor.material = pbr(sc, 0x222026, .7);
    for (const [r, c] of [[2, 0x7c4dff], [4, 0xff3fb0], [6, 0x3a9bff]] as const) { const rg = ring(sc, r - .03, r + .03, 64); rg.material = glow(sc, c, .35); rg.position.y = .01; }
    const wall = cyl(sc, 7.2, 7.2, 4, 40, false); wall.material = pbr(sc, 0x1a1420, .9, 0, { double: true }); wall.position.y = 2;
    this.beam = cyl(sc, .05, 1.6, 6, 16, false); this.beam.material = glow(sc, 0xfff2c8, .5, { alpha: .07, add: true, double: true }); this.beam.rotation.x = Math.PI / 2;
    const [me, ...folk] = await Promise.all([Actor.create(sc, playerLook(this.g.save.data)), ...['Male_Party_01', 'Female_Party_03', 'Male_Adult_08', 'Male_Party_04'].map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 } as never))]);
    this.me = me; me.play('walk', 0);
    folk.forEach((a, i) => { this.folk.push({ a, r: 1.8 + i * 1.1, ang: i * 1.7, v: (i % 2 ? -1 : 1) * (.25 + i * .05) }); a.play('dance2', 0); });
    this.spawn();
    this.camPos.set(0, 9, 7); this.camAt.set(0, 0, .5);
  }

  /** neue Fundstücke rund um dich verstecken */
  private spawn() {
    this.items.forEach((it) => it.m.dispose()); this.items = [];
    const sc = this.scene;
    const kinds: Array<[string, () => Mesh, number]> = this.adult
      ? [['Handy', () => box(sc, .18, .02, .34), 0x3a9bff], ['Schlüssel', () => torus(sc, .1, .03, 14), 0xffd23b], ['Unterhose', () => box(sc, .34, .06, .24), 0xff3b6b], ['Gleitgel', () => cyl(sc, .06, .06, .3, 10), 0x9fe0ff], ['Lederkappe', () => cyl(sc, .16, .18, .12, 14), 0x2a2a2a]]
      : [['Handy', () => box(sc, .18, .02, .34), 0x3a9bff], ['Schlüssel', () => torus(sc, .1, .03, 14), 0xffd23b], ['Sonnenbrille', () => box(sc, .32, .06, .1), 0xff3b6b], ['Glitzer-Socke', () => box(sc, .12, .08, .32), 0xb56bff], ['Fächer', () => cyl(sc, .22, .22, .02, 3), 0x3ee69a]];
    kinds.forEach(([n, f, c], i) => {
      const m = f(), mat = pbr(sc, c, .3, .5, { emissive: c, ei: 0 }); m.material = mat;
      const a = (i / kinds.length) * Math.PI * 2 + this.rnd() * .9, r = 2.4 + this.rnd() * 3.6;
      m.position.set(Math.sin(a) * r, .12, Math.cos(a) * r); m.rotation.y = this.rnd() * 6;
      if (n === 'Gleitgel') m.rotation.z = Math.PI / 2;
      this.items.push({ n, m, mat, a, r, got: false });
    });
  }

  private diff(a: number) { let d = a - this.aim; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended) {
      const turn = inp.move.x || (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0);
      this.aim += turn * 2.4 * dt;
    }
    // Lampe und Lichtkegel folgen dem Blick
    const dir = new Vector3(Math.sin(this.aim), -.18, Math.cos(this.aim));
    this.lamp.direction.copyFrom(dir);
    this.beam.position.set(Math.sin(this.aim) * 3.1, 1, Math.cos(this.aim) * 3.1); this.beam.rotation.y = this.aim;
    this.me.root.rotation.y = this.aim + Math.PI; this.me.update(dt);
    // Tänzer kreisen durch den Raum
    const speed = 1 + this.round * .35;
    for (const d of this.folk) {
      d.ang += d.v * speed * dt; d.a.root.position.set(Math.sin(d.ang) * d.r, 0, Math.cos(d.ang) * d.r);
      d.a.root.rotation.y = d.ang + (d.v > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.PI; d.a.update(dt);
    }
    // Fundstücke funkeln, wenn das Licht sie trifft
    for (const it of this.items) {
      if (it.got) { it.m.position.addInPlace(it.m.position.scale(-dt * 6)); it.m.position.y += dt * 2; it.m.scaling.scaleInPlace(1 - dt * 3); continue; }
      const lit = Math.abs(this.diff(it.a)) < CONE;
      it.mat.emissiveIntensity = lit ? .6 + Math.sin(t * 12) * .4 : 0;
      it.m.rotation.y += dt * (lit ? 3 : 0);
      if (lit && Math.floor(t * 6) % 4 === 0) this.fx.burst('spark', it.m.position.add(new Vector3(0, .2, 0)), 0xffffff, 0xfff2c8, 1, .6, .12);
    }
    this.cool = Math.max(0, this.cool - dt);
    const found = this.items.filter((i) => i.got).length;
    this.combo(`🔦 ${found}/5 gefunden · Runde ${this.round + 1}`);
    const cd = this.g.engine.aspect < 1 ? 6.4 : 5.2;
    this.camPos.set(-Math.sin(this.aim) * cd, this.g.engine.aspect < 1 ? 9 : 6, -Math.cos(this.aim) * cd); this.camAt.set(Math.sin(this.aim) * 2.5, 0, Math.cos(this.aim) * 2.5);
    if (this.ended || this.cool > 0 || !inp.pressed('confirm')) return;
    this.grab();
  }

  private grab() {
    this.cool = .35;
    const it = this.items.filter((i) => !i.got && Math.abs(this.diff(i.a)) < CONE).sort((a, b) => a.r - b.r)[0];
    const bump = this.folk.find((d) => Math.abs(this.diff(d.ang)) < CONE * .8 && (!it || d.r < it.r));
    if (bump) {
      this.add(-30, bump.a.root.position.add(new Vector3(0, 2, 0)));
      this.judge(['Hoppla, Verzeihung!', 'Angerempelt!', 'Das war nicht dein Handy …'][Math.floor(this.rnd() * 3)], '#ff8a6b');
      this.sfx('slap'); this.shake(.3); bump.a.play('laugh'); this.cool = .8; return;
    }
    if (!it) { this.sfx('miss'); this.judge('Nur Dunkelheit …', '#9b8cff'); return; }
    it.got = true; this.me.play('cheer');
    const pts = 80 + Math.round(this.left);
    this.add(pts, it.m.position.add(new Vector3(0, .6, 0))); this.sfx('coin');
    this.fx.burst('spark', it.m.position.add(new Vector3(0, .3, 0)), 0xffd23b, 0xffffff, 30, 3, .16);
    this.judge(`${it.n} gefunden!`, '#9effc4');
    if (this.items.every((i) => i.got)) {
      this.round++; this.add(150); this.flash('#fff2c8', .3); this.sfx('cheer');
      this.fx.burst('confetti', new Vector3(0, 2.5, 0), 0x7c4dff, 0xff3fb0, 50, 4, .2);
      this.judge('Alles gefunden! Nächste Runde', '#ffd84a');
      setTimeout(() => { if (!this.ended) this.spawn(); }, 900);
    }
  }
}
