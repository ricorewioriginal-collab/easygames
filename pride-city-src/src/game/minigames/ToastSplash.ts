/* Toast-Spritzer (18+) bzw. Toast-Glasur: Der Toaster schleudert Toastscheiben in hohem Bogen durch die Küche.
   Unten fährt die Spritze (◀ ▶), A gedrückt halten spritzt – mit 18+ weiße Farbe, sonst bunten Zuckerguss.
   Jede Scheibe braucht sechs Treffer, dann ist sie „fertig“ und fliegt glitzernd davon. Goldtoast = Zeitlupe und dreifach,
   verbrannter Toast kostet Punkte. Der Druck sinkt beim Spritzen und lädt in Pausen nach. 60 Sekunden. */
import { Vector3, HemisphericLight, DirectionalLight, PointLight, ShadowGenerator, Node3, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, sphere, ground, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { Arcade, rng } from './arcade';

const Z = -3.2;            // Ebene, in der die Toasts fliegen
const GRAV = -9;
const NEED = 6;            // Treffer bis „fertig“
const RAINBOW = [0xff3b6b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a9bff, 0xb56bff];

type Kind = 'n' | 'gold' | 'burnt';
interface Toast { o: Node3; kind: Kind; v: Vector3; spin: Vector3; hits: number; done: boolean; dead: boolean; splats: Mesh[] }
interface Blob { m: Mesh; v: Vector3; on: boolean; c: number }

export class ToastSplash extends Arcade {
  private nozzle = new Node3('nozzle', this.scene);
  private tip!: Mesh;
  private x = 0;
  private toasts: Toast[] = [];
  private blobs: Blob[] = [];
  private mats!: { crust: PBRMaterial; crumb: PBRMaterial; gold: PBRMaterial; burnt: PBRMaterial; goo: PBRMaterial[] };
  private rnd = rng(9);
  private nextT = .6;
  private fireT = 0;
  private press = 1;
  private streak = 0;
  private hue = 0;
  private toaster!: Node3;
  private sg!: ShadowGenerator;
  protected override left = 60;

  protected howto() { return this.adult ? '◀ ▶ zielen, A halten zum Spritzen. Sechs Treffer machen jeden Toast schön weiß. Goldtoast zählt dreifach, verbrannte meiden!' : '◀ ▶ zielen, A halten für Zuckerguss. Sechs Treffer glasieren einen Toast. Goldtoast zählt dreifach, verbrannte meiden!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 40; sc.fogColor = col(0x2a1530);
    const h = new HemisphericLight('h', new Vector3(0, 1, .3), sc); h.intensity = .75; h.diffuse = col(0xfff0e0); h.groundColor = col(0x553040);
    const sun = new DirectionalLight('sun', new Vector3(-.3, -1, -.5), sc); sun.position.set(4, 12, 8); sun.intensity = 2.2; sun.diffuse = col(0xffe3c0);
    this.sg = new ShadowGenerator(this.g.engine.mobile ? 512 : 1024, sun); this.sg.usePercentageCloserFiltering = true;
    const neon = new PointLight('neon', new Vector3(0, 5, -6), sc); neon.intensity = 40; neon.range = 16; neon.diffuse = col(0xff5fd0);
    // Küche: Fliesenwand mit Neon-Schild, Arbeitsplatte, Toaster
    const tiles = canvasTex(sc, 256, 256, (g) => {
      g.fillStyle = '#ffd6e8'; g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#ffc2dc' : '#fff0f6'; g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); }
    });
    tiles.uScale = 4.5; tiles.vScale = 4; tiles.wrapU = 1; tiles.wrapV = 1;
    const wall = planeZ(sc, 34, 30); const wm = pbr(sc, 0xffffff, .5); wm.albedoTexture = tiles; wall.material = wm; wall.position.set(0, 13, -7.5); wall.receiveShadows = true;
    const sign = planeZ(sc, 5.6, 1.3);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 128, (g) => {
      g.clearRect(0, 0, 512, 128); const txt = this.adult ? 'TOAST-SPRITZER' : 'TOAST-GLASUR'; let fs = 64; g.font = `900 ${fs}px system-ui, sans-serif`; while (g.measureText(txt).width > 470 && fs > 20) { fs -= 4; g.font = `900 ${fs}px system-ui, sans-serif`; } g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = '#ff3fb0'; g.shadowBlur = 18; g.fillStyle = '#fff'; g.fillText(txt, 256, 64);
    }, true) });
    sign.position.set(0, 7.6, -7.4);
    const floor = ground(sc, 40, 20); floor.material = pbr(sc, 0x3a2232, .6); floor.position.set(0, -1.6, -2); floor.receiveShadows = true;
    const counter = box(sc, 30, 1, 4); counter.material = pbr(sc, 0xf5f0ff, .25, .05); counter.position.set(0, -1.1, -5.3); counter.receiveShadows = true;
    const front = box(sc, 30, 2.6, .2); front.material = pbr(sc, 0xff4fa3, .4, .1); front.position.set(0, -2.6, -3.2);
    this.toaster = new Node3('toaster', sc);
    const tb = box(sc, 2.4, 1.5, 1.4); tb.material = pbr(sc, 0xd8dce8, .15, .9); tb.parent = this.toaster;
    for (const sx of [-.45, .45]) { const sl = box(sc, .3, .05, 1.1); sl.material = pbr(sc, 0x111111, .8); sl.position.set(sx, .76, 0); sl.parent = this.toaster; }
    const lever = box(sc, .14, .4, .14); lever.material = pbr(sc, 0xff3b6b, .3); lever.position.set(1.25, .2, 0); lever.parent = this.toaster;
    this.toaster.position.set(0, -.1, -5.6);
    tb.getChildMeshes(); this.sg.addShadowCaster(tb);
    // Materialien
    this.mats = {
      crust: pbr(sc, 0xb4682e, .8), crumb: pbr(sc, 0xf6dca6, .9), gold: pbr(sc, 0xffd23b, .2, .7, { emissive: 0xffa800, ei: .6 }), burnt: pbr(sc, 0x2a1a12, .95),
      goo: this.adult ? [pbr(sc, 0xffffff, .08, 0, { emissive: 0xffffff, ei: .35 })] : RAINBOW.map((c) => pbr(sc, c, .15, 0, { emissive: c, ei: .35 })),
    };
    // Spritze: Flasche mit Düse (mit 18+ glitzernd pink, sonst Spritzbeutel in Regenbogenfarben)
    const bottle = cyl(sc, .32, .38, 1.3, 18); bottle.material = pbr(sc, this.adult ? 0xff4fa3 : 0xffffff, .25, .1, { emissive: this.adult ? 0xff2f8a : 0xff9ad5, ei: .25 }); bottle.parent = this.nozzle;
    const cone = cyl(sc, .06, .3, .55, 18); cone.material = pbr(sc, 0xffd23b, .2, .8); cone.position.y = .92; cone.parent = this.nozzle;
    this.tip = sphere(sc, .07, 8); this.tip.material = glow(sc, 0xffffff, 2); this.tip.position.y = 1.2; this.tip.parent = this.nozzle;
    this.nozzle.position.set(0, -.6, Z + .2);
    this.sg.addShadowCaster(bottle);
    // Spritzer-Vorrat
    for (let i = 0; i < 40; i++) { const m = sphere(sc, .13, 8); m.isPickable = false; m.setEnabled(false); this.blobs.push({ m, v: new Vector3(), on: false, c: 0 }); }
    this.camPos.set(0, 3.6, 10.5); this.camAt.set(0, 3.9, Z);
  }

  private makeToast(kind: Kind) {
    const sc = this.scene, o = new Node3('toast', sc);
    const crust = box(sc, 1.25, 1.05, .2); crust.material = kind === 'gold' ? this.mats.gold : kind === 'burnt' ? this.mats.burnt : this.mats.crust; crust.parent = o;
    const dome = cyl(sc, .66, .66, .2, 20); dome.rotation.x = Math.PI / 2; dome.material = crust.material; dome.position.y = .5; dome.parent = o;
    if (kind !== 'burnt') {
      const crumb = box(sc, 1.08, .9, .23); crumb.material = kind === 'gold' ? this.mats.gold : this.mats.crumb; crumb.parent = o;
      const top = cyl(sc, .56, .56, .23, 20); top.rotation.x = Math.PI / 2; top.material = crumb.material; top.position.y = .45; top.parent = o;
    }
    o.getChildMeshes().forEach((m) => { m.isPickable = false; this.sg.addShadowCaster(m); });
    return o;
  }

  private spawn() {
    const r = this.rnd();
    const kind: Kind = r < .1 ? 'gold' : r < .22 ? 'burnt' : 'n';
    const o = this.makeToast(kind);
    // aus dem Toaster nach oben, leicht zur Seite – oder von links/rechts in den Bogen
    const fromToaster = this.rnd() < .5;
    const x0 = fromToaster ? (this.rnd() - .5) * .8 : (this.rnd() < .5 ? -7 : 7);
    o.position.set(x0, fromToaster ? .4 : 1 + this.rnd() * 2, Z);
    const v = fromToaster ? new Vector3((this.rnd() - .5) * 5, 10.5 + this.rnd() * 2.5, 0) : new Vector3(-Math.sign(x0) * (3.5 + this.rnd() * 2.5), 7.5 + this.rnd() * 3, 0);
    if (fromToaster) { this.sfx('squeak'); this.fx.burst('spark', new Vector3(0, .6, -5.6), 0xffb36b, 0xfff0d0, 12, 2, .18); }
    this.toasts.push({ o, kind, v, spin: new Vector3((this.rnd() - .5) * 3, (this.rnd() - .5) * 4, (this.rnd() - .5) * 5), hits: 0, done: false, dead: false, splats: [] });
  }

  private fire() {
    const b = this.blobs.find((x) => !x.on); if (!b) return;
    b.on = true; b.m.setEnabled(true);
    b.c = this.adult ? 0 : (this.hue = (this.hue + 1) % RAINBOW.length);
    b.m.material = this.mats.goo[b.c];
    b.m.position.set(this.x, .65, Z);
    b.v.set((this.rnd() - .5) * 1.2 + this.g.engine.input.move.x * 1.5, 15 + this.rnd() * 2, 0);
    b.m.scaling.setAll(.8 + this.rnd() * .6);
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    // Spritze bewegen
    if (!this.ended) this.x = Math.max(-6, Math.min(6, this.x + inp.move.x * 8 * dt));
    this.nozzle.position.x = this.x;
    this.nozzle.rotation.z = -inp.move.x * .2;
    // Spritzen: A halten, Druck sinkt und lädt nach
    const firing = !this.ended && inp.held('confirm') && this.press > .04;
    if (firing) {
      this.press = Math.max(0, this.press - dt * .42);
      this.fireT -= dt;
      while (this.fireT <= 0) { this.fire(); this.fireT += 1 / 16; }
      if (Math.floor(t * 20) % 3 === 0) this.fx.burst('goo', this.tip.getAbsolutePosition(), this.adult ? 0xffffff : RAINBOW[this.hue], 0xffffff, 3, 2, .12, 1);
      this.nozzle.scaling.set(1.05, .94 + Math.sin(t * 50) * .03, 1.05);
    } else { this.press = Math.min(1, this.press + dt * (inp.held('confirm') ? .12 : .5)); this.fireT = 0; this.nozzle.scaling.setAll(1); }
    this.meter(this.press, this.press < .2 ? '#ff6b6b' : this.adult ? '#ffffff' : '#ff5fd0');
    // neue Toasts, immer schneller
    if (!this.ended) { this.nextT -= dt; if (this.nextT <= 0) { this.spawn(); this.nextT = Math.max(.45, 1.35 - (60 - this.left) * .014) * (.7 + this.rnd() * .6); this.toaster.position.y = -.25; } }
    this.toaster.position.y += (-.1 - this.toaster.position.y) * Math.min(1, dt * 8);
    // Spritzer fliegen
    for (const b of this.blobs) {
      if (!b.on) continue;
      b.v.y += GRAV * 1.4 * dt; b.m.position.addInPlace(b.v.scale(dt));
      b.m.scaling.y = 1 + Math.min(.8, Math.abs(b.v.y) * .05);
      let hit: Toast | null = null;
      for (const x of this.toasts) if (!x.done && !x.dead && Vector3.Distance(x.o.position, b.m.position) < .75) { hit = x; break; }
      if (hit) { this.splat(hit, b); continue; }
      if (b.m.position.y < -1.2 || b.m.position.y > 14) { if (b.m.position.y < 0) this.fx.burst('goo', b.m.position, this.adult ? 0xffffff : RAINBOW[b.c], 0xffffff, 6, 2, .14); b.on = false; b.m.setEnabled(false); }
    }
    // Toasts fliegen und drehen
    for (const x of this.toasts) {
      if (x.dead) continue;
      x.v.y += GRAV * (x.done ? -.4 : 1) * dt;
      x.o.position.addInPlace(x.v.scale(dt));
      x.o.rotation.addInPlace(x.spin.scale(dt));
      if (x.done && Math.floor(t * 20) % 2 === 0) this.fx.burst('spark', x.o.position, x.kind === 'gold' ? 0xffd23b : 0xffffff, 0xff9ad5, 4, 1.5, .18);
      if (x.o.position.y < -2 || x.o.position.y > 16 || Math.abs(x.o.position.x) > 10) {
        if (!x.done && x.kind !== 'burnt' && !this.ended) { this.streak = 0; this.combo(''); }
        x.dead = true; x.o.dispose();
      }
    }
    if (this.toasts.length > 24) this.toasts = this.toasts.filter((x) => !x.dead);
  }

  /** Spritzer trifft: Klecks bleibt auf dem Toast kleben */
  private splat(x: Toast, b: Blob) {
    b.on = false; b.m.setEnabled(false);
    const at = b.m.position.clone();
    if (x.kind === 'burnt') {
      x.dead = true; this.fx.burst('goo', x.o.position, 0x2a1a12, 0x5a3a2a, 30, 4, .3); x.o.dispose();
      this.add(-15, at); this.streak = 0; this.combo(''); this.shake(.4); this.sfx('miss'); this.judge('Igitt, verbrannt!', '#ff8a6b');
      return;
    }
    if (x.splats.length < 9) {
      const s = sphere(this.scene, .22 + this.rnd() * .12, 8); s.isPickable = false;
      s.material = this.mats.goo[b.c]; s.parent = x.o;
      s.position.set((this.rnd() - .5) * .9, (this.rnd() - .5) * .8 + .1, (this.rnd() < .5 ? -1 : 1) * .13);
      s.scaling.set(1.4, 1.1, .35);
      x.splats.push(s);
    }
    x.hits++;
    x.v.y = Math.max(x.v.y, 1.5); x.v.x *= .9; // jeder Treffer stupst nach oben
    this.sfx('splash');
    this.fx.burst('goo', at, this.adult ? 0xffffff : RAINBOW[b.c], 0xffffff, 10, 3, .16);
    const mul = x.kind === 'gold' ? 3 : 1;
    this.add(2 * mul, at, this.adult ? '#ffffff' : '#ffd23b');
    if (x.hits >= NEED && !x.done) {
      x.done = true; this.streak++;
      const bonus = (20 + this.streak * 5) * mul;
      this.add(bonus, x.o.position.add(new Vector3(0, .8, 0)), '#ffd84a');
      x.v.set(x.v.x * .3, 4, 0); x.spin.scaleInPlace(2.5);
      this.fx.burst('confetti', x.o.position, RAINBOW[Math.floor(this.rnd() * 6)], 0xffffff, 50, 5, .2, 1.2);
      this.shake(x.kind === 'gold' ? .6 : .3); this.sfx('cheer'); this.sfx('coin');
      if (x.kind === 'gold') { this.slowmo(.9, .3); this.flash('#ffd23b', .25); this.judge('GOLDTOAST!', '#ffd84a'); }
      else this.judge(this.adult ? ['Schön eingesaut!', 'Voll erwischt!', 'Toast ist fertig!', 'Volltreffer!'][this.streak % 4] : ['Glasiert!', 'Lecker!', 'Toast ist fertig!', 'Volltreffer!'][this.streak % 4], '#fff');
      this.combo(this.streak >= 2 ? `${this.streak}er Serie!` : '');
    }
  }
}
