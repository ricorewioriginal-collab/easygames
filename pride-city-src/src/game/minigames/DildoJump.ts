/* Dildo Jump (18+) bzw. Raketen-Hüpfer: Die Figur hüpft von selbst von Plattform zu Plattform einen Neon-Turm hinauf.
   Lenken mit links/rechts (am Rand geht es auf der anderen Seite weiter), Herzen füllen den Turbo, A zündet ihn.
   Plattformen: normal, wandernd, Wattebausch (zerfällt), Gleitgel-Pad bzw. Trampolin (Riesensprung). Gewitterwolken bremsen. */
import { Vector3, HemisphericLight, PointLight, Node3, Mesh, type InstancedMesh, Scene, col } from '../../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { buildFlitzer } from '../flitzer';
import { Arcade, rng } from './arcade';

const W = 4.6;          // halbe Breite des Spielfelds
const G = -24;          // Schwerkraft
const JUMP = 13.2;      // Sprung von einer Plattform
const BOOST = 23;       // Gleitgel-Pad / Turbo
const RAINBOW = [0xff3b6b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a9bff, 0xb56bff];

type Kind = 'n' | 'move' | 'puff' | 'pad';
interface Plat { m: InstancedMesh; kind: Kind; x: number; y: number; vx: number; gone: boolean; w: number }
interface Item { m: InstancedMesh; kind: 'heart' | 'star' | 'cloud'; x: number; y: number; got: boolean }

export class DildoJump extends Arcade {
  private me = new Node3('me', this.scene);
  private body = new Node3('body', this.scene);
  private y = 0; private x = 0; private vy = JUMP; private vx = 0;
  private top = 0; private camY = 3;
  private plats: Plat[] = []; private items: Item[] = [];
  private src!: Record<Kind | 'heart' | 'star' | 'cloud', Mesh>;
  private genY = 0; private rnd = rng(42);
  private turbo = 0; private boostT = 0; private squash = 0; private spin = 0;
  private pickups = 0;
  private light!: PointLight;
  private sky: Mesh[] = [];

  protected howto() { return this.adult ? 'Big Bertha hüpft von allein. ◀ ▶ lenken, Herzen sammeln, A = Turbo. Gleitgel-Pads schießen dich hoch!' : '◀ ▶ lenken, die Rakete hüpft von allein. Herzen sammeln, A = Turbo. Trampoline schießen dich hoch!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 16; sc.fogEnd = 60; sc.fogColor = col(0x170a2e);
    const h = new HemisphericLight('h', new Vector3(.2, 1, .4), sc); h.intensity = .95; h.diffuse = col(0xffe0f4); h.groundColor = col(0x3a2060);
    this.light = new PointLight('pl', new Vector3(0, 2, 3), sc); this.light.intensity = 30; this.light.range = 14; this.light.diffuse = col(0xff7ad8);
    // Himmel: Verlauf mit Sternen, dahinter eine Neon-Skyline (wandert langsamer mit = Tiefe)
    const skyT = canvasTex(sc, 256, 512, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#05021a'); gr.addColorStop(.55, '#2b0f5a'); gr.addColorStop(1, '#ff4fa3');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .9})`; g.fillRect(Math.random() * 256, Math.random() * 400, 1.5, 1.5); }
    });
    const sky = planeZ(sc, 120, 90); sky.material = glow(sc, 0xffffff, .9, { tex: skyT }); sky.position.z = -40; sky.applyFog = false; this.sky.push(sky);
    const winT = canvasTex(sc, 64, 128, (g) => {
      g.fillStyle = '#0c0620'; g.fillRect(0, 0, 64, 128);
      for (let y = 6; y < 128; y += 10) for (let x = 5; x < 64; x += 11) if (Math.random() > .35) { g.fillStyle = ['#ff6bd6', '#ffd23b', '#6be3ff', '#fff'][Math.floor(Math.random() * 4)]; g.fillRect(x, y, 6, 5); }
    });
    for (let i = 0; i < 16; i++) {
      const hgt = 14 + Math.random() * 26, b = box(sc, 4 + Math.random() * 3, hgt, 3);
      b.material = glow(sc, 0xffffff, .85, { tex: winT }); b.position.set(-30 + i * 4 + Math.random(), hgt / 2 - 12, -22 - Math.random() * 6);
      this.sky.push(b);
    }
    // Spielfigur: mit 18+ Big Bertha (Glitzer-Dildo), sonst die Regenbogen-Rakete – senkrecht, Spitze nach oben
    buildFlitzer(sc, this.body, this.adult);
    this.body.rotation.x = -Math.PI / 2; this.body.scaling.setAll(.42); this.body.position.y = .9;
    this.body.parent = this.me;
    // Vorlagen (Instanzen sparen am Handy Zeichenaufrufe)
    const mk = (m: Mesh) => { m.isPickable = false; m.setEnabled(true); m.position.y = -999; return m; };
    const n = mk(cyl(sc, 1, 1, .28, 24)); n.material = pbr(sc, 0xff4fa3, .35, .1, { emissive: 0xff2f8a, ei: .5 });
    const mv = mk(cyl(sc, 1, 1, .28, 24)); mv.material = pbr(sc, 0x3bd1ff, .35, .1, { emissive: 0x1aa0ff, ei: .6 });
    const pu = mk(sphere(sc, 1, 10)); pu.scaling.set(1, .32, .7); pu.material = pbr(sc, 0xffffff, .9, 0, { emissive: 0xffe6f6, ei: .25 });
    const pd = mk(cyl(sc, 1, 1, .34, 24)); pd.material = pbr(sc, 0xffd23b, .2, .6, { emissive: 0xffb000, ei: .9 });
    const heart = mk(sphere(sc, .32, 10)); heart.material = glow(sc, 0xff3b6b, 1.8);
    const star = mk(torus(sc, .26, .09, 16)); star.material = glow(sc, 0xffe14a, 2);
    const cloud = mk(sphere(sc, 1, 10)); cloud.scaling.set(1.3, .7, .8); cloud.material = pbr(sc, 0x3a3550, .9, 0, { emissive: 0x6050ff, ei: .2 });
    this.src = { n, move: mv, puff: pu, pad: pd, heart, star, cloud };
    // Startplattform und erste Abschnitte
    this.addPlat('n', 0, 0, 1.6);
    this.genY = 0;
    this.generate(28);
    this.camPos.set(0, 4, 15); this.camAt.set(0, 3.4, 0);
  }

  private addPlat(kind: Kind, x: number, y: number, w = 1) {
    const m = this.src[kind].createInstance('p'); m.position.set(x, y, 0);
    if (kind !== 'puff') m.scaling.set(w * 1.15, 1, .9); else m.scaling.set(w * 1.15, .32, .7);
    this.plats.push({ m, kind, x, y, vx: kind === 'move' ? (this.rnd() > .5 ? 1.6 : -1.6) * (1 + this.top / 300) : 0, gone: false, w: w * 1.15 });
  }
  private addItem(kind: Item['kind'], x: number, y: number) {
    const m = this.src[kind].createInstance('i'); m.position.set(x, y, 0);
    if (kind === 'star') m.rotation.x = Math.PI / 2;
    if (kind === 'cloud') m.scaling.set(1.3, .7, .8);
    this.items.push({ m, kind, x, y, got: false });
  }
  /** neue Abschnitte bis zur Höhe y: Abstände wachsen mit der Höhe, Spezialplattformen werden häufiger */
  private generate(to: number) {
    while (this.genY < to) {
      const hard = Math.min(1, this.genY / 260);
      this.genY += 1.5 + this.rnd() * (1.2 + hard * 1.3);
      const x = (this.rnd() * 2 - 1) * (W - 1);
      const r = this.rnd();
      const kind: Kind = r < .07 ? 'pad' : r < .07 + .14 + hard * .16 ? 'move' : r < .3 + hard * .22 ? 'puff' : 'n';
      this.addPlat(kind, x, this.genY, 1 - hard * .25);
      // Wattebausch braucht eine sichere Nachbarplattform
      if (kind === 'puff') this.addPlat('n', Math.max(-W + 1, Math.min(W - 1, -x * .7)), this.genY + .6, 1 - hard * .3);
      if (this.rnd() < .28) this.addItem(this.rnd() < .45 ? 'heart' : 'star', (this.rnd() * 2 - 1) * (W - .6), this.genY + 1 + this.rnd());
      if (this.genY > 40 && this.rnd() < .06 + hard * .08) this.addItem('cloud', (this.rnd() * 2 - 1) * (W - 1.2), this.genY + 1.2);
    }
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended) {
      // Lenken (mit etwas Trägheit), am Rand auf die andere Seite
      this.vx += ((inp.move.x * 8.5) - this.vx) * Math.min(1, dt * 9);
      this.x += this.vx * dt;
      if (this.x > W + .4) this.x = -W - .4; else if (this.x < -W - .4) this.x = W + .4;
      // Turbo
      if (inp.pressed('confirm') && this.turbo >= 1) {
        this.turbo = 0; this.vy = BOOST * 1.15; this.boostT = 1.1;
        this.flash('#ff7ad8', .45); this.shake(.5); this.slowmo(.25, .5); this.sfx('whoosh'); this.sfx('boing');
        this.judge(this.adult ? 'VOLLE LADUNG!' : 'TURBO!', '#ff8ad8');
        this.fx.burst('spark', this.me.position.add(new Vector3(0, .2, 0)), 0xff7ad8, 0xfff0a0, 80, 7, .3, -.6);
      }
      const prevY = this.y;
      this.vy += G * dt; this.y += this.vy * dt;
      // Landen nur im Fallen von oben
      if (this.vy < 0) for (const p of this.plats) {
        if (p.gone) continue;
        if (prevY >= p.y + .1 && this.y <= p.y + .16 && Math.abs(this.x - p.x) < p.w + .25) {
          this.y = p.y + .16; this.land(p); break;
        }
      }
      // Sammeln und Wolken
      for (const it of this.items) {
        if (it.got) continue;
        const d = Math.hypot(this.x - it.x, this.y + .9 - it.y);
        if (it.kind === 'cloud' ? d < 1.3 : d < .9) {
          it.got = true; it.m.setEnabled(false);
          const at = new Vector3(it.x, it.y, 0);
          if (it.kind === 'heart') { this.turbo = Math.min(1, this.turbo + .34); this.add(15, at, '#ff6bb0'); this.sfx('kiss'); this.fx.burst('spark', at, 0xff3b6b, 0xffc0dd, 26, 3, .22); if (this.turbo >= 1) this.judge('Turbo bereit – A!', '#ff8ad8'); }
          else if (it.kind === 'star') { this.add(10, at); this.sfx('coin'); this.fx.burst('spark', at, 0xffe14a, 0xffffff, 22, 3, .2); }
          else { this.vy = Math.min(this.vy, 2); this.shake(.6); this.sfx('thunder'); this.flash('#8a7aff', .35); this.judge('Spaßbremse!', '#a79bff'); this.fx.burst('goo', at, 0x6a64a0, 0x2a2440, 30, 4, .35); }
          this.pickups++;
        }
      }
      // Höhe = Punkte
      if (this.y > this.top) { const gain = Math.floor(this.y) - Math.floor(this.top); this.top = this.y; if (gain > 0) this.points += gain * 10; }
      // Absturz: unter den unteren Bildrand
      if (this.y < this.camY - 9.5) { this.sfx('miss'); this.shake(.4); this.judge(this.adult ? 'Schlapp gemacht!' : 'Abgestürzt!', '#ff8ad8'); this.end(false); }
      this.generate(this.top + 30);
      // weit unten Liegendes wegräumen
      if (this.plats.length > 60) this.plats = this.plats.filter((p) => { if (p.y < this.camY - 14) { p.m.dispose(); return false; } return true; });
      if (this.items.length > 40) this.items = this.items.filter((it) => { if (it.y < this.camY - 14 || it.got) { it.m.dispose(); return false; } return true; });
    }
    // Wandernde Plattformen
    for (const p of this.plats) if (p.kind === 'move' && !p.gone) { p.x += p.vx * dt; if (Math.abs(p.x) > W - p.w * .7) { p.vx = -p.vx; p.x = Math.sign(p.x) * (W - p.w * .7); } p.m.position.x = p.x; }
    // Wattebausch zerfällt (schrumpft), Herzen/Sterne drehen sich
    for (const p of this.plats) if (p.gone && p.kind === 'puff' && p.m.isEnabled()) { p.m.scaling.scaleInPlace(Math.max(0, 1 - dt * 6)); p.m.position.y -= dt * 3; if (p.m.scaling.x < .05) p.m.setEnabled(false); }
    for (const it of this.items) if (!it.got) { if (it.kind === 'star') it.m.rotation.z = t * 3 + it.x; else it.m.rotation.y = t * 2 + it.x; it.m.position.y = it.y + Math.sin(t * 3 + it.x) * .12; if (it.kind === 'cloud') it.m.position.x = it.x + Math.sin(t * .8 + it.y) * 1.2, it.x = it.m.position.x; }
    // Figur: Quetschen beim Aufprall, Drehung beim Turbo, Neigung beim Lenken
    this.squash = Math.max(0, this.squash - dt * 4);
    this.spin = this.boostT > 0 ? this.spin + dt * 14 : this.spin * (1 - Math.min(1, dt * 6));
    this.boostT = Math.max(0, this.boostT - dt);
    const sq = Math.sin(this.squash * Math.PI) * .35;
    this.me.position.set(this.x, this.y, 0);
    this.me.scaling.set(1 + sq * .6, 1 - sq, 1 + sq * .6);
    this.me.rotation.set(0, this.spin, -this.vx * .05);
    const fl = this.body.getChildMeshes().find((m) => m.name === 'flame');
    if (fl) { fl.setEnabled(this.boostT > 0 || this.vy > JUMP * .6); fl.scaling.y = .8 + Math.sin(t * 40) * .3; }
    if (this.boostT > 0 && Math.floor(t * 30) % 2 === 0) this.fx.burst('spark', this.me.position, RAINBOW[Math.floor(t * 12) % 6], 0xffffff, 6, 2, .2, -1);
    this.light.position.set(this.x, this.y + 1.5, 2.5);
    // Kamera folgt nach oben (nie zurück), Himmel wandert langsamer mit
    this.camY = Math.max(this.camY, this.y + 1.6);
    const cy = this.camPos.y + (this.camY - this.camPos.y) * Math.min(1, dt * 5);
    const cz = this.g.engine.aspect > 1.2 ? 10.5 : 15; this.camPos.set(0, cy, cz); this.camAt.set(0, cy - .6, 0);
    this.sky.forEach((m, i) => { m.position.y = i === 0 ? cy : (m.metadata ??= { y: m.position.y }).y + cy * .6; });
    this.meter(this.turbo, this.turbo >= 1 ? '#ffd23b' : '#ff5fd0');
    this.combo(`${Math.floor(this.top)} m${this.turbo >= 1 ? ' · Turbo bereit (A)' : ''}`);
  }

  private land(p: Plat) {
    const at = new Vector3(this.x, p.y + .1, 0);
    this.squash = 1;
    if (p.kind === 'pad') {
      this.vy = BOOST; this.boostT = .7; this.shake(.45); this.flash('#ffd23b', .3); this.sfx('boing'); this.sfx('whoosh');
      this.judge(this.adult ? 'Gleitgel-Boost!' : 'Trampolin!', '#ffd84a');
      this.fx.burst(this.adult ? 'goo' : 'spark', at, 0xffffff, this.adult ? 0xe8f4ff : 0xffd23b, 50, 6, .28, 1.2);
      this.add(25, at);
    } else {
      this.vy = JUMP; this.sfx('boing');
      this.fx.burst('spark', at, RAINBOW[Math.floor(this.rnd() * 6)], 0xffffff, 14, 2.4, .16, .8);
      if (p.kind === 'puff') { p.gone = true; this.sfx('whoosh'); this.fx.burst('confetti', at, 0xffffff, 0xffd6ef, 30, 3, .2); }
    }
  }
}
