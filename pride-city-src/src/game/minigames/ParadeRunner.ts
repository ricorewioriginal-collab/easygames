/* Parade-Runner in 3D (ersetzt das 2D-Spiel aus Gay Life!): Du rennst neben dem Festwagen die Paradestraße entlang.
   ◀ ▶ wechselt die Spur, A springt. Glitzer und Regenbogenflaggen sammeln, Spaßbremsen (Absperrungen) überspringen,
   Grummelwolken ausweichen. Drei Herzen, 60 Sekunden, das Tempo steigt. */
import { Vector3, HemisphericLight, DirectionalLight, Mesh, type InstancedMesh, Scene, col } from '../../engine/bjs';
import { box, cyl, sphere, torus, ground, pbr, glow, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

const LANE = 1.7;
const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];
type Kind = 'glitter' | 'flag' | 'bar' | 'cloud';
interface Thing { m: InstancedMesh; kind: Kind; lane: number; z: number; done: boolean }

export class ParadeRunner extends Arcade {
  private me!: Actor;
  private lane = 0; private x = 0; private y = 0; private vy = 0;
  private speed = 9; private dist = 0;
  private hearts = 3; private inv = 0;
  private things: Thing[] = [];
  private src!: Record<Kind, Mesh>;
  private deco: Array<{ m: Mesh | InstancedMesh; z: number }> = [];
  private stripes: Mesh[] = [];
  private float!: Mesh;
  private nextZ = -20; private rnd = rng(5);
  protected override left = 60;

  protected howto() { return '◀ ▶ Spur wechseln, A springt über Absperrungen. Glitzer und Flaggen sammeln, Grummelwolken ausweichen!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 30; sc.fogEnd = 75; sc.fogColor = col(0xffc6e6);
    const h = new HemisphericLight('h', new Vector3(0, 1, .2), sc); h.intensity = 1; h.diffuse = col(0xfff4ea); h.groundColor = col(0x7a5a8a);
    const sun = new DirectionalLight('sun', new Vector3(-.4, -1, -.3), sc); sun.intensity = 2.4; sun.diffuse = col(0xffe6c8);
    // Himmel als Verlauf hinter allem
    const sky = box(sc, 400, 120, 1); sky.position.set(0, 30, -90); sky.applyFog = false;
    sky.material = glow(sc, 0xffffff, 1, { tex: canvasTex(sc, 8, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#6ec8ff'); gr.addColorStop(.6, '#ffc0e4'); gr.addColorStop(1, '#ffe2a8'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); }) });
    // Straße mit Regenbogen-Spurlinien (wandern mit = Tempo sichtbar)
    const road = ground(sc, 9, 120); road.material = pbr(sc, 0x3a3346, .85); road.position.z = -50;
    for (const sx of [-1, 1]) { const walk = ground(sc, 6, 120); walk.material = pbr(sc, 0xd9c8e8, .8); walk.position.set(sx * 7.5, .08, -50); }
    for (let i = 0; i < 24; i++) {
      const s = box(sc, .16, .02, 2); s.material = glow(sc, RAINBOW[i % 6], 1.2); s.position.set((i % 2 ? 1 : -1) * LANE / 2, .02, -i * 5); this.stripes.push(s);
    }
    // Deko am Rand: Fahnenmasten mit Regenbogenflaggen und bunte Zuschauer-Säulen (Instanzen)
    const pole = cyl(sc, .06, .06, 4, 8); pole.material = pbr(sc, 0xeeeeee, .3, .7);
    const flagT = canvasTex(sc, 6, 60, (g) => RAINBOW.forEach((c, i) => { g.fillStyle = '#' + c.toString(16).padStart(6, '0'); g.fillRect(0, i * 10, 6, 10); }));
    const flag = box(sc, .04, 1, 1.5); flag.material = pbr(sc, 0xffffff, .7, 0, { emissive: 0xffffff, ei: .2 }); (flag.material as ReturnType<typeof pbr>).albedoTexture = flagT;
    const fan = box(sc, .7, 1.7, .5);
    const fanM = RAINBOW.map((c) => pbr(sc, c, .6));
    for (let i = 0; i < 16; i++) for (const sx of [-1, 1]) {
      const z = -i * 7.5;
      const p = pole.createInstance('pole'); p.position.set(sx * 5, 2, z); this.deco.push({ m: p, z });
      const f = flag.createInstance('flag'); f.position.set(sx * 5 - sx * .75, 3.3, z); this.deco.push({ m: f, z });
      const fm = fan.clone('fan'); fm.material = fanM[(i + (sx > 0 ? 3 : 0)) % 6]; fm.position.set(sx * (7 + this.rnd() * 3), .85, z - 3); this.deco.push({ m: fm, z: z - 3 });
      const head = sphere(sc, .3, 8); head.material = pbr(sc, 0xf2c7a5, .6); head.parent = fm; head.position.y = 1.05;
    }
    pole.setEnabled(false); flag.setEnabled(false); fan.setEnabled(false);
    // Festwagen vorneweg: bunte Stufen, Discokugel
    this.float = box(sc, 4.4, 1.4, 7); this.float.material = pbr(sc, 0xff4fa3, .5); this.float.position.set(-LANE * 2.6, .9, -16);
    RAINBOW.forEach((c, i) => { const st = box(sc, 4.2 - i * .5, .3, 6.6 - i * .6); st.material = pbr(sc, c, .5, 0, { emissive: c, ei: .25 }); st.parent = this.float; st.position.y = .85 + i * .3; });
    const ball = sphere(sc, .7, 14); ball.material = pbr(sc, 0xffffff, .2, .4, { emissive: 0xffd6f4, ei: .6 }); ball.parent = this.float; ball.position.y = 3.7;
    // Vorlagen der Dinge auf der Straße
    const mk = (m: Mesh) => { m.isPickable = false; m.position.y = -99; return m; };
    const gl = mk(torus(sc, .32, .1, 18)); gl.material = glow(sc, 0xffd23b, 1.8);
    const fl = mk(box(sc, .08, .7, 1)); fl.material = pbr(sc, 0xffffff, .6, 0, { emissive: 0xffffff, ei: .4 }); (fl.material as ReturnType<typeof pbr>).albedoTexture = flagT;
    const bar = mk(box(sc, 1.5, .7, .25)); bar.material = pbr(sc, 0xff3b3b, .5, 0, { emissive: 0xaa0000, ei: .3 });
    const cloud = mk(sphere(sc, 1, 10)); cloud.scaling.set(.9, 1.1, .8); cloud.material = pbr(sc, 0x55506a, .9, 0, { emissive: 0x302850, ei: .3 });
    this.src = { glitter: gl, flag: fl, bar, cloud };
    // Spielfigur
    this.me = await Actor.create(sc, playerLook(this.g.save.data));
    this.me.root.rotation.y = Math.PI; this.me.play('run', 0, 1.1);
    this.camPos.set(0, 3.4, 6.4); this.camAt.set(0, 1.3, -6);
  }

  private spawn(z: number) {
    const r = this.rnd(), lane = Math.floor(this.rnd() * 3) - 1;
    const add = (kind: Kind, l: number, zz: number) => { const m = this.src[kind].createInstance(kind); m.position.set(l * LANE, kind === 'cloud' ? 1.2 : kind === 'bar' ? .35 : 1, zz); if (kind === 'cloud') m.scaling.set(.9, 1.1, .8); if (kind === 'glitter') m.rotation.x = Math.PI / 2; this.things.push({ m, kind, lane: l, z: zz, done: false }); };
    if (r < .3) add('bar', lane, z);
    else if (r < .45) { add('cloud', lane, z); if (this.rnd() < .4) add('cloud', lane === 1 ? -1 : lane + 1, z); }
    // Glitzerreihe auf einer anderen Spur, ab und zu eine Flagge
    const gl = lane === 0 ? (this.rnd() < .5 ? -1 : 1) : 0;
    for (let k = 0; k < 4; k++) add('glitter', gl, z - 1.4 - k * 1.3);
    if (this.rnd() < .25) add('flag', gl, z - 7.5);
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended) {
      if (inp.pressed('left')) { this.lane = Math.max(-1, this.lane - 1); this.sfx('whoosh'); }
      if (inp.pressed('right')) { this.lane = Math.min(1, this.lane + 1); this.sfx('whoosh'); }
      if (inp.pressed('confirm') && this.y <= 0) { this.vy = 8.4; this.sfx('boing'); this.fx.burst('spark', this.me.root.position, 0xffffff, 0xffd23b, 12, 2, .16); }
      this.speed = Math.min(19, 9 + (60 - this.left) * .17);
    }
    const v = this.ended ? 0 : this.speed;
    this.dist += v * dt;
    this.x += (this.lane * LANE - this.x) * Math.min(1, dt * 14);
    this.vy -= 24 * dt; this.y = Math.max(0, this.y + this.vy * dt); if (this.y === 0) this.vy = 0;
    this.me.root.position.set(this.x, this.y, 0);
    this.me.root.rotation.z = (this.x - this.lane * LANE) * .15;
    this.inv = Math.max(0, this.inv - dt);
    this.me.root.setEnabled(this.inv <= 0 || Math.floor(t * 14) % 2 === 0);
    this.me.update(dt);
    // Welt läuft auf die Kamera zu
    const mv = v * dt;
    for (const s of this.stripes) { s.position.z += mv; if (s.position.z > 6) s.position.z -= 120; }
    for (const d of this.deco) { d.m.position.z += mv; if (d.m.position.z > 10) d.m.position.z -= 120; }
    this.float.position.z = -16 + Math.sin(t * .4) * 1.5; this.float.rotation.y = Math.sin(t * 2) * .02;
    if (Math.floor(t * 6) % 6 === 0) this.fx.burst('confetti', this.float.position.add(new Vector3(0, 4, 0)), RAINBOW[Math.floor(t) % 6], 0xffffff, 6, 3, .2, 1.2);
    this.nextZ += mv;
    while (this.nextZ > -60) { this.spawn(this.nextZ - 10); this.nextZ -= 9 + this.rnd() * 6 + this.speed * .2; }
    for (const th of this.things) {
      if (th.done) continue;
      th.z += mv; th.m.position.z = th.z;
      if (th.kind === 'glitter') th.m.rotation.y = t * 4 + th.z;
      if (th.kind === 'cloud') th.m.position.y = 1.2 + Math.sin(t * 3 + th.z) * .15;
      if (th.z > 8) { th.done = true; th.m.dispose(); continue; }
      if (this.ended || Math.abs(th.z) > .6 || Math.abs(th.lane * LANE - this.x) > .9) continue;
      const at = th.m.position.clone();
      if (th.kind === 'glitter') { th.done = true; th.m.dispose(); this.add(5, at); this.sfx('coin'); this.fx.burst('spark', at, 0xffd23b, 0xffffff, 10, 2.2, .16); }
      else if (th.kind === 'flag') { th.done = true; th.m.dispose(); this.add(30, at, '#ff8ad8'); this.sfx('cheer'); this.flash('#ff8ad8', .2); this.fx.burst('confetti', at, 0xff3b6b, 0x3a7bff, 40, 4, .2); this.judge('Pride!', '#ff8ad8'); }
      else if (this.inv <= 0 && !(th.kind === 'bar' && this.y > .6)) {
        th.done = true; th.m.dispose(); this.hearts--; this.inv = 1.2;
        this.shake(.6); this.flash('#ff3b3b', .3); this.sfx('slap'); this.me.play('hit'); setTimeout(() => this.me.play('run', .2, 1.1), 700);
        this.fx.burst('goo', at, 0x8a8aa0, 0x3a3a4a, 25, 3, .3);
        this.judge(th.kind === 'bar' ? 'Spaßbremse!' : 'Grummelwolke!', '#ff8a6b');
        if (this.hearts <= 0) this.end(false);
      }
    }
    if (this.things.length > 80) this.things = this.things.filter((x) => !x.done);
    if (!this.ended) { this.points = Math.max(this.points, 0); this.points += Math.floor(this.dist / 10) - Math.floor((this.dist - mv) / 10); }
    this.combo(`${'❤️'.repeat(Math.max(0, this.hearts))}${'🤍'.repeat(Math.max(0, 3 - this.hearts))} · ${Math.floor(this.dist)} m`);
    this.camPos.set(this.x * .5, 3.4 + this.y * .3, 6.4); this.camAt.set(this.x * .6, 1.3, -6);
  }
}
