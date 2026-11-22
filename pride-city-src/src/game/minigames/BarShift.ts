/* Barkeeper-Schicht in 3D (ersetzt das HTML-Barspiel im Club Leuchtturm, gleiche Karte und Belohnung):
   Hinter der Theke dreht sich ein Zutaten-Karussell. ◀ ▶ dreht, A gibt die Zutat ins Glas, „Servieren“ schiebt den Drink
   zum Gast, „Leeren“ kippt ihn weg. Die Cocktails sind Teil dieses Spiels (kein eigenes Cocktail-Spiel). 75 Sekunden. */
import { Vector3, HemisphericLight, PointLight, TransformNode, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, sphere, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Actor } from '../Actor';
import { Arcade, rng } from './arcade';

/** Zutaten und Karte (wie bisher im Barspiel) */
export const BAR_ING: Array<[string, string, number]> = [['🍊', 'Orange', 0xff8a1e], ['🍋', 'Zitrone', 0xfff04a], ['🍓', 'Erdbeere', 0xff2d55], ['🫐', 'Blaubeere', 0x4a5bff], ['🧉', 'Mate', 0x9acd32], ['🍺', 'Bier', 0xf2b130], ['🧊', 'Eis', 0xd8f4ff], ['🫧', 'Soda', 0xbfe6ff], ['✨', 'Glitzer', 0xff7af0]];
export const BAR_MENU: Array<[string, string]> = [['Pride-Spritz', '🍊🫧🍓'], ['Glitzer-Mate', '🧉🧊✨'], ['Leuchtturm-Tonic', '🍋🧊🫧'], ['Bärenbier', '🍺'], ['Nova Nights', '🫐🍋✨'], ['Hildes Mocktail', '🍓🍋🫧']];
const GUESTS = ['Mo', 'Bruno', 'Lena', 'Tariq', 'Sam', 'Kim', 'Hilde', 'Nova', 'Jules', 'ein Gast in Leder', 'zwei Drag Queens', 'eine Touristin'];
const FOLK = ['Male_Adult_07', 'Female_Party_02', 'Male_Party_01'];
const split = (r: string) => [...r.matchAll(/\p{Extended_Pictographic}|✨/gu)].map((m) => m[0]);
const STATIONS = [...BAR_ING.map(([e, n, c]) => ({ e, n, c })), { e: '🛎️', n: 'Servieren', c: 0xffd23b }, { e: '🗑️', n: 'Leeren', c: 0x888888 }];

export class BarShift extends Arcade {
  private wheel!: TransformNode; private rot = 0; private sel = 0;
  private glass!: TransformNode; private layers: Mesh[] = []; private layerM: PBRMaterial[] = []; private inGlass: string[] = [];
  private folk: Actor[] = []; private cur = -1; private order = 0; private guest = ''; private wait = 0; private served = 0; private tips = 0;
  private slide = 0; private rnd = rng(61);
  protected override left = 75;

  protected howto() { return '◀ ▶ dreht das Zutaten-Karussell, A gibt die Zutat ins Glas. Fertig? Auf „Servieren“ drehen und A!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 10; sc.fogEnd = 30; sc.fogColor = col(0x0c1420);
    const h = new HemisphericLight('h', new Vector3(0, 1, .5), sc); h.intensity = .65; h.diffuse = col(0xfff0e0); h.groundColor = col(0x1a2030);
    const warm = new PointLight('w', new Vector3(0, 3.2, 1.2), sc); warm.intensity = 30; warm.range = 9; warm.diffuse = col(0xffc890);
    const neonL = new PointLight('n', new Vector3(0, 3, -2.6), sc); neonL.intensity = 18; neonL.range = 8; neonL.diffuse = col(0x3bd1ff);
    // Club Leuchtturm: Theke, Rückwand mit Flaschenregal (Instanzen), Neon-Schriftzug
    const floor = ground(sc, 20, 14); floor.material = pbr(sc, 0x1a1410, .8); floor.position.z = 1;
    const wall = planeZ(sc, 14, 6); wall.material = pbr(sc, 0x18222e, .7); wall.position.set(0, 3, -3);
    const counter = box(sc, 6, 1.05, .9); counter.material = pbr(sc, 0x5a3420, .5, .1); counter.position.set(0, .52, .9);
    const top = box(sc, 6.2, .08, 1.1); top.material = pbr(sc, 0x1a1a1e, .15, .6); top.position.set(0, 1.08, .9);
    const edge = box(sc, 6.2, .04, .04); edge.material = glow(sc, 0xffd23b, 1.5); edge.position.set(0, 1.04, 1.46);
    for (const y of [1.4, 2.1, 2.8]) { const sh = box(sc, 5, .05, .35); sh.material = pbr(sc, 0x3a2a1c, .6); sh.position.set(0, y, -2.75); }
    const bottle = cyl(sc, .07, .09, .38, 10); bottle.position.y = -99;
    const bm = [0x2a8a4a, 0x8a2a2a, 0xd8a030, 0x3a5aa8, 0xe8e8f0].map((c) => pbr(sc, c, .15, .2, { emissive: c, ei: .2, alpha: .85 }));
    const srcs = bm.map((m) => { const b = bottle.clone('b'); b.material = m; return b; });
    for (const y of [1.4, 2.1, 2.8]) for (let i = 0; i < 12; i++) { const b = srcs[(i + Math.round(y * 3)) % 5].createInstance('bt'); b.position.set(-2.3 + i * .42, y + .22, -2.72); }
    const sign = planeZ(sc, 4, .8);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 100, (g) => { g.font = '900 52px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#3bd1ff'; g.shadowBlur = 16; g.fillStyle = '#e8fbff'; g.fillText('LEUCHTTURM BAR', 256, 52); }, true) });
    sign.position.set(0, 3.7, -2.95);
    // Zutaten-Karussell auf der Theke: jede Station mit Schale, Zutat und Schild
    this.wheel = new TransformNode('wheel', sc); this.wheel.position.set(-.7, 1.12, .9);
    const hi = cyl(sc, .2, .2, .01, 24); hi.material = glow(sc, 0xffd23b, 1.6, { alpha: .6 }); hi.position.set(-.7, 1.18, .9 + .82);
    const plate = cyl(sc, 1.05, 1.05, .05, 40); plate.material = pbr(sc, 0x2a2a30, .3, .7); plate.parent = this.wheel;
    STATIONS.forEach((st, i) => {
      const a = i / STATIONS.length * Math.PI * 2, node = new TransformNode('st', sc); node.parent = this.wheel;
      node.position.set(Math.sin(a) * .82, 0, Math.cos(a) * .82); node.rotation.y = a;
      const m = i < 9 ? (st.n === 'Bier' || st.n === 'Mate' ? cyl(sc, .06, .08, .3, 10) : st.n === 'Eis' ? box(sc, .14, .14, .14) : sphere(sc, .09, 10)) : cyl(sc, .1, .12, .08, 14);
      m.material = pbr(sc, st.c, .3, .2, { emissive: st.c, ei: .25 }); m.parent = node; m.position.y = .14;
      const lab = planeZ(sc, .36, .36, true); lab.parent = node; lab.position.set(0, .48, 0);
      lab.material = glow(sc, 0xffffff, 1.2, { tex: canvasTex(sc, 96, 96, (g) => { g.font = '64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(st.e, 48, 54); }, true) });
    });
    // Glas: durchsichtiger Zylinder, darin bis zu vier farbige Schichten
    this.glass = new TransformNode('glass', sc); this.glass.position.set(1.1, 1.12, 1);
    const gl = cyl(sc, .17, .13, .5, 20, false); gl.material = pbr(sc, 0xddeeff, .05, .1, { alpha: .25, double: true }); gl.parent = this.glass; gl.position.y = .25;
    for (let i = 0; i < 4; i++) { const l = cyl(sc, .135 + i * .008, .13 + i * .008, .11, 18); const m = pbr(sc, 0xffffff, .3, 0, { emissive: 0xffffff, ei: .3, alpha: .9 }); l.material = m; l.parent = this.glass; l.position.y = .06 + i * .115; l.setEnabled(false); this.layers.push(l); this.layerM.push(m); }
    this.folk = await Promise.all(FOLK.map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 } as never)));
    this.folk.forEach((a) => { a.root.position.set(6, 0, 1.9); a.root.rotation.y = Math.PI; });
    this.newGuest();
    this.camPos.set(0, 2.3, 4.6); this.camAt.set(0, 1.3, .5);
  }

  private newGuest() {
    if (this.cur >= 0) { const old = this.folk[this.cur]; old.play('walk'); old.root.metadata = { leave: true }; }
    this.cur = (this.cur + 1) % this.folk.length;
    const a = this.folk[this.cur]; a.root.metadata = { leave: false }; a.root.position.set(5, 0, 1.9); a.play('walk');
    this.order = Math.floor(this.rnd() * BAR_MENU.length); this.guest = GUESTS[Math.floor(this.rnd() * GUESTS.length)];
    this.wait = 0; this.empty(); this.showOrder();
  }
  private showOrder() { const [n, r] = BAR_MENU[this.order]; this.combo(`${this.guest} möchte: ${n} = ${r}`); }
  private empty() { this.inGlass = []; this.layers.forEach((l) => l.setEnabled(false)); }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    // Gäste kommen an die Theke bzw. gehen
    this.folk.forEach((a, i) => {
      const leave = a.root.metadata?.leave, tx = i === this.cur && !leave ? .4 : leave ? -6 : 6;
      const dx = tx - a.root.position.x;
      if (Math.abs(dx) > .05) { a.root.position.x += Math.sign(dx) * Math.min(Math.abs(dx), dt * 2.6); a.root.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2; }
      else if (i === this.cur && a.root.rotation.y !== Math.PI + .5) { a.root.rotation.y = Math.PI + .5; a.play('idle'); }
      a.update(dt);
    });
    this.wheel.rotation.y += (this.rot - this.wheel.rotation.y) * Math.min(1, dt * 10);
    this.slide = Math.max(0, this.slide - dt);
    this.glass.position.x = this.slide > 0 ? 1.1 + Math.sin((1 - this.slide / .6) * Math.PI) * .6 : 1.1;
    this.camPos.set(Math.sin(t * .25) * .2, this.g.engine.aspect < 1 ? 2.8 : 2.3, this.g.engine.aspect < 1 ? 7 : 4.6);
    if (this.ended) return;
    this.wait += dt;
    const step = Math.PI * 2 / STATIONS.length;
    if (inp.pressed('left')) { this.sel = (this.sel + STATIONS.length - 1) % STATIONS.length; this.rot += step; this.sfx('move'); this.judge(`${STATIONS[this.sel].e} ${STATIONS[this.sel].n}`, '#fff'); }
    if (inp.pressed('right')) { this.sel = (this.sel + 1) % STATIONS.length; this.rot -= step; this.sfx('move'); this.judge(`${STATIONS[this.sel].e} ${STATIONS[this.sel].n}`, '#fff'); }
    if (!inp.pressed('confirm')) return;
    const st = STATIONS[this.sel], at = this.glass.position.add(new Vector3(0, .7, 0));
    if (st.n === 'Leeren') { this.empty(); this.sfx('splash'); this.fx.burst('goo', at, 0x9fe0ff, 0xffffff, 14, 1.5, .1); return; }
    if (st.n === 'Servieren') { this.serve(); return; }
    if (this.inGlass.length >= 4) { this.sfx('miss'); this.judge('Das Glas ist voll!', '#ff8a6b'); return; }
    const l = this.inGlass.length; this.inGlass.push(st.e);
    this.layerM[l].albedoColor.set(((st.c >> 16) & 255) / 255, ((st.c >> 8) & 255) / 255, (st.c & 255) / 255); this.layerM[l].emissiveColor.copyFrom(this.layerM[l].albedoColor);
    this.layers[l].setEnabled(true); this.sfx('pour');
    this.fx.burst(st.e === '✨' ? 'spark' : 'goo', at, st.c, 0xffffff, st.e === '✨' ? 24 : 10, 1.4, .1);
  }

  private serve() {
    const a = this.folk[this.cur], at = a.root.position.add(new Vector3(0, 2.1, 0));
    const want = split(BAR_MENU[this.order][1]).sort().join(''), got = this.inGlass.slice().sort().join('');
    this.slide = .6; this.sfx('glass');
    if (want === got) {
      this.served++; const tip = 3 + Math.floor(this.rnd() * 4) + (this.g.save.data.flags.barDeko ? 2 : 0); this.tips += tip;
      const fast = Math.max(0, Math.round(40 - this.wait * 5));
      this.add(100 + fast, at, fast > 20 ? '#ffd23b' : '#9effc4'); this.sfx('coin');
      this.judge(`„Perfekt!“ +${tip} €`, '#9effc4'); a.play(this.served % 2 ? 'drink' : 'cheer');
      this.fx.burst('spark', this.glass.position.add(new Vector3(0, .6, 0)), 0xffd23b, 0xffffff, 26, 2.5, .14);
      if (this.served % 5 === 0) { this.flash('#3bd1ff', .25); this.sfx('cheer'); this.fx.burst('confetti', new Vector3(0, 2.6, 1), 0x3bd1ff, 0xffd23b, 40, 3.5, .18); }
    } else { this.judge('„Das hab ich nicht bestellt …“', '#ff8a6b'); this.sfx('miss'); this.shake(.2); a.play('laugh'); }
    this.extra = { served: this.served, tips: this.tips };
    setTimeout(() => { if (!this.ended) this.newGuest(); }, 650);
  }
}
