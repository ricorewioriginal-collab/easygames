/* Strandbad-Sprung in 3D (ersetzt das 2D-Spiel aus Gay Life!): fünf Sprünge vom Turm ins Becken.
   A stoppt die Kraft, A stoppt den Winkel, in der Luft A halten = Salto. Nah am Zielring landen, Saltos zählen,
   aber rechtzeitig aufhören: Wer nicht gerade eintaucht, macht einen Bauchklatscher. */
import { Vector3, HemisphericLight, DirectionalLight, Node3, Mesh, Scene, col, type PBRMaterial } from '../../engine/bjs';
import { box, cyl, ring, ground, pbr, glow, canvasTex } from '../../engine/geo';
import { Actor, playerLook } from '../Actor';
import { Arcade, rng } from './arcade';

const TOWER = 5;          // Höhe des Bretts
const JUMPS = 5;
type Phase = 'power' | 'angle' | 'air' | 'splash';

export class PoolDive extends Arcade {
  private me!: Actor;
  private pivot = new Node3('pivot', this.scene);
  private phase: Phase = 'power';
  private power = 0; private angle = 0; private osc = 0;
  private pos = new Vector3(0, TOWER, 0); private vel = new Vector3();
  private rot = 0; private flips = 0;
  private jump = 0; private targetZ = -7;
  private target!: Mesh; private arrow!: Node3;
  private water!: PBRMaterial;
  private wT!: ReturnType<typeof canvasTex>;
  private waitT = 0; private rnd = rng(3);

  protected howto() { return 'A stoppt die Kraft, A stoppt den Winkel. In der Luft A halten für Saltos – aber gerade eintauchen! Fünf Sprünge.'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 40; sc.fogEnd = 110; sc.fogColor = col(0xbfe8ff);
    const h = new HemisphericLight('h', new Vector3(0, 1, 0), sc); h.intensity = 1.05; h.diffuse = col(0xfff8ee); h.groundColor = col(0x5aa0c0);
    const sun = new DirectionalLight('sun', new Vector3(-.5, -1, -.4), sc); sun.intensity = 1.5; sun.diffuse = col(0xfff0d0);
    const sky = box(sc, 400, 140, 1); sky.position.set(0, 30, -80); sky.applyFog = false;
    sky.material = glow(sc, 0xffffff, 1, { tex: canvasTex(sc, 8, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3aa6ff'); gr.addColorStop(.7, '#bfe8ff'); gr.addColorStop(1, '#fff1c8'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); }) });
    // Becken: Fliesenrand, Wasser mit Wellen-Textur, Liegewiese, Sonnenschirme
    const tile = canvasTex(sc, 128, 128, (g) => { g.fillStyle = '#cfe6f2'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#7fb8d6'; g.lineWidth = 3; for (let i = 0; i <= 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } });
    tile.uScale = 12; tile.vScale = 12; tile.wrapU = 1; tile.wrapV = 1;
    const deck = ground(sc, 60, 60); const dm = pbr(sc, 0xffffff, .6); dm.albedoTexture = tile; deck.material = dm; deck.position.set(0, 0, -8);
    const pool = box(sc, 9, .1, 16); pool.material = pbr(sc, 0x1aa6d8, .4); pool.position.set(0, -1.6, -9);
    const wT = canvasTex(sc, 256, 256, (g) => { g.fillStyle = '#29b7ef'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { g.beginPath(); const x = Math.random() * 256, y = Math.random() * 256; g.arc(x, y, 10 + Math.random() * 20, Math.random() * 3, Math.random() * 3 + 2); g.stroke(); } });
    wT.uScale = 3; wT.vScale = 5; wT.wrapU = 1; wT.wrapV = 1; this.wT = wT;
    const water = ground(sc, 9, 16); this.water = pbr(sc, 0xffffff, .05, 0, { alpha: .88, emissive: 0x0a6aa0, ei: .5 }); this.water.albedoTexture = wT; water.material = this.water; water.position.set(0, .05, -9);
    const grass = ground(sc, 120, 80); grass.material = pbr(sc, 0x6ccf6a, .9); grass.position.set(0, -.02, -20);
    for (let i = 0; i < 6; i++) {
      const sx = -1 - (i % 2) * .35, z = -2 - i * 3.2;
      const p = cyl(sc, .05, .05, 2.6, 6); p.material = pbr(sc, 0xffffff, .4); p.position.set(sx * 8, 1.3, z);
      const u = cyl(sc, 0, 1.4, .6, 12); u.material = pbr(sc, [0xff3b6b, 0xffd23b, 0x3a7bff][i % 3], .6); u.position.set(sx * 8, 2.7, z);
    }
    // Sprungturm mit Brett
    const legs = box(sc, 1.2, TOWER, 1.2); legs.material = pbr(sc, 0xf0f0f0, .4, .3); legs.position.set(0, TOWER / 2, 2.2);
    const board = box(sc, .9, .14, 3.2); board.material = pbr(sc, 0x3a7bff, .5); board.position.set(0, TOWER - .07, .6);
    for (let i = 0; i < 6; i++) { const r = box(sc, 1.24, .12, 1.24); r.material = glow(sc, [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff][i], 1.1); r.position.set(0, .5 + i * .8, 2.2); }
    // Zielring auf dem Wasser und Richtungspfeil am Brett
    this.target = ring(sc, .55, .9, 36); this.target.material = glow(sc, 0xffd23b, 1.8); this.target.position.y = .1;
    this.arrow = new Node3('arrow', sc);
    const shaft = box(sc, .08, .08, 1.4); shaft.material = glow(sc, 0xff5fd0, 1.6); shaft.position.z = -.7; shaft.parent = this.arrow;
    // Figur hängt an einem Drehpunkt in Hüfthöhe (für Saltos)
    this.me = await Actor.create(sc, playerLook(this.g.save.data));
    this.me.root.parent = this.pivot; this.me.root.position.y = -.9; this.me.root.rotation.y = Math.PI;
    this.reset();
  }

  private reset() {
    this.phase = 'power'; this.osc = 0; this.rot = 0; this.flips = 0;
    this.pos.set(0, TOWER + .9, -.6); this.pivot.rotation.x = 0;
    this.targetZ = -(4 + this.rnd() * 8); this.target.position.z = this.targetZ;
    this.arrow.setEnabled(false); this.me.play('idle');
    this.judge(`Sprung ${this.jump + 1}/${JUMPS}`, '#fff');
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.wT.uOffset += dt * .02;
    this.target.scaling.setAll(1 + Math.sin(t * 4) * .06);
    if (this.phase === 'power' || this.phase === 'angle') {
      this.osc += dt;
      if (this.phase === 'power') { this.power = .5 - Math.cos(this.osc * 3.2) * .5; this.meter(this.power, this.power > .8 ? '#ffd23b' : '#ff5fd0'); this.combo('Kraft: A drücken'); }
      else { this.angle = .35 + (.5 - Math.cos(this.osc * 2.6) * .5) * .75; this.arrow.setEnabled(true); this.arrow.position.set(0, TOWER + .3, -1); this.arrow.rotation.x = this.angle; this.combo('Winkel: A drücken'); }
      if (!this.ended && inp.pressed('confirm')) {
        if (this.phase === 'power') { this.phase = 'angle'; this.osc = 0; this.sfx('ok'); }
        else {
          this.phase = 'air'; this.arrow.setEnabled(false); this.sfx('boing'); this.sfx('whoosh');
          const v = 4.5 + this.power * 6; this.vel.set(0, Math.sin(this.angle) * v, -Math.cos(this.angle) * v);
          this.me.play('cheer'); this.fx.burst('spark', this.pos, 0xffffff, 0x9fe0ff, 16, 2, .18);
        }
      }
    } else if (this.phase === 'air') {
      this.vel.y -= 12 * dt; this.pos.addInPlace(this.vel.scale(dt));
      if (inp.held('confirm')) { this.rot += dt * 9; const f = Math.floor(this.rot / (Math.PI * 2)); if (f > this.flips) { this.flips = f; this.sfx('whoosh'); this.pop('Salto!', this.pos, '#9fe0ff'); } }
      else { const rest = this.rot % (Math.PI * 2); if (rest > .2 && rest < Math.PI * 2 - .2 && rest < Math.PI) this.rot += dt * 3; }
      // Kopfüber eintauchen = Drehung so, dass der Kopf nach unten zeigt, sobald es abwärts geht
      const dive = this.vel.y < 0 ? Math.min(1, -this.vel.y / 8) * (Math.PI * .85) : 0;
      this.pivot.rotation.x = -(this.rot + dive);
      if (this.pos.y <= .2) this.splash();
    } else if (this.phase === 'splash') {
      this.pos.y = Math.max(-1.4, this.pos.y - dt * 3);
      this.waitT -= dt; if (this.waitT <= 0) { this.jump++; if (this.jump >= JUMPS) { this.end(false); this.phase = 'power'; } else this.reset(); }
    }
    this.pivot.position.copyFrom(this.pos);
    this.me.update(dt);
    // Kamera: seitlich, folgt dem Sprung
    const fz = Math.min(0, Math.max(-13, this.pos.z)) * .7;
    this.camPos.set(8.5, 3.8 + Math.max(0, this.pos.y - 3) * .35, fz - .8); this.camAt.set(0, Math.max(1.4, this.pos.y * .75), fz - 2.2);
  }

  private splash() {
    this.phase = 'splash'; this.waitT = 1.6;
    const rest = ((this.rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const clean = rest < .7 || rest > Math.PI * 2 - .7;
    const d = Math.abs(this.pos.z - this.targetZ), inPool = this.pos.z > -16.8 && this.pos.z < -1;
    const at = new Vector3(0, .3, this.pos.z);
    if (!inPool) { this.judge('Daneben – Rasen!', '#ff8a6b'); this.sfx('slap'); this.shake(.6); this.fx.burst('goo', at, 0x6ccf6a, 0x3a8a3a, 30, 4, .3); this.me.play('hit'); return; }
    const near = Math.max(0, Math.round(100 - d * 28)), flipP = this.flips * 40, style = clean ? 50 : 0;
    this.add(near + flipP + style, at.add(new Vector3(0, 1.5, 0)));
    this.fx.burst('goo', at, 0xffffff, 0x9fe0ff, clean ? 40 : 90, clean ? 5 : 8, clean ? .25 : .4, 1.6);
    this.sfx('splash');
    if (clean) { this.judge(near > 70 ? 'PERFEKT!' : 'Sauber eingetaucht!', '#9fe0ff'); if (near > 70) { this.flash('#ffffff', .25); this.sfx('cheer'); this.fx.burst('confetti', at.add(new Vector3(0, 2, 0)), 0xffd23b, 0xff5fd0, 50, 5, .2); } }
    else { this.judge('Bauchklatscher!', '#ff8ad8'); this.shake(.7); this.sfx('slap'); }
    this.combo(`${near} Ziel${flipP ? ` + ${flipP} Saltos` : ''}${style ? ' + 50 Stil' : ''}`);
  }
}
