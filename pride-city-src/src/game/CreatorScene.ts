/* Charakter-Editor im Fotostudio (Babylon.js): echte Rocketbox-Figur wählen, Name und Pronomen.
   Vorschau dreht sich auf einer Bühne mit Regenbogen-Ring. */
import type { GameScene } from '../engine/Engine';
import { Vector3, TransformNode, HemisphericLight, SpotLight, PointLight, ShadowGenerator, Scene, type FreeCamera, type Mesh, col } from '../engine/bjs';
import { ground, cyl, torus, pbr, glow, canvasTex } from '../engine/geo';
import { Actor, playerLook } from './Actor';
import { EDITOR_AVATARS } from './avatars';
import { PRONOUNS } from './palettes';
import type { Game } from './Game';
import { Menu, el, hints, $ } from '../ui/ui';
import { music, sfx } from '../engine/Audio';

export class CreatorScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .18;
  transient = true;
  private actor: Actor | null = null;
  private actors = new Map<string, Actor>();
  private menu!: Menu;
  private screen!: HTMLElement;
  private spin = 0;
  private ring!: Mesh;
  private busy = false;
  private sg!: ShadowGenerator;

  constructor(private g: Game, private done: () => void, private cancel: () => void) {
    const sc = (this.scene = g.engine.newScene(0x120a26));
    this.camera = g.engine.newCamera(sc, 38, .1, 100);
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 12; sc.fogEnd = 30; sc.fogColor = col(0x120a26);
    const h = new HemisphericLight('h', new Vector3(0, 1, 0), sc); h.intensity = 1.1; h.diffuse = col(0xe6dcff); h.groundColor = col(0x40305a);
    const key = new SpotLight('key', new Vector3(3, 7, 6), new Vector3(-3, -7, -6).normalize(), .9, 2, sc); key.intensity = 140; key.range = 30;
    this.sg = new ShadowGenerator(1024, key); this.sg.usePercentageCloserFiltering = true;
    const rim = new PointLight('rim', new Vector3(-3, 3, -3), sc); rim.diffuse = col(0xff4fa3); rim.intensity = 30; rim.range = 14;
    const rim2 = new PointLight('rim2', new Vector3(3, 2, -3), sc); rim2.diffuse = col(0x4fb8ff); rim2.intensity = 25; rim2.range = 14;
    const floor = ground(sc, 60, 60); floor.material = pbr(sc, 0x1c1236, .4, .2); floor.receiveShadows = true;
    const podium = cyl(sc, 1.5, 1.6, .3, 48); podium.material = pbr(sc, 0x2c1f4f, .3, .4); podium.position.y = .15; podium.receiveShadows = true;
    // Regenbogen-Ring hinter der Figur
    const t = canvasTex(sc, 256, 4, (x) => { const grd = x.createLinearGradient(0, 0, 256, 0); ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787', '#e40303'].forEach((c, i) => grd.addColorStop(i / 6, c)); x.fillStyle = grd; x.fillRect(0, 0, 256, 4); });
    this.ring = torus(sc, 2.3, .07, 96); this.ring.material = glow(sc, 0xffffff, 1.4, { tex: t });
    const tilt = new TransformNode('ringTilt', sc); tilt.rotation.x = Math.PI / 2; tilt.position.set(0, 1.4, -1.4); this.ring.parent = tilt;
    this.camera.position.set(0, 1.6, 6.2);
  }

  enter() {
    const s = this.g.save.data;
    this.screen = el(`<div class="screen"><div class="col"><div class="panel"><h3>Wer bist du?</h3><p>Alles lässt sich später im Kleiderschrank ändern.</p>
      <label style="display:block;margin:8px 0 10px"><small style="color:var(--mu)">Name</small><input type="text" id="cName" maxlength="16" value=""></label><div id="cMenu"></div></div></div></div>`);
    $('#ui').appendChild(this.screen);
    const inp = $<HTMLInputElement>('#cName', this.screen);
    inp.value = s.name;
    inp.addEventListener('input', () => { s.name = inp.value.replace(/[<>]/g, '').slice(0, 16); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { inp.blur(); e.preventDefault(); } });
    const cyc = <T,>(arr: T[], cur: number, d: number) => (cur + d + arr.length) % arr.length;
    const ai = () => Math.max(0, EDITOR_AVATARS.findIndex((a) => a.id === playerLook({ ...s, flags: { ...s.flags, playAs: '' } }).rb));
    const ni = () => Math.max(0, PRONOUNS.findIndex((p) => p.id === s.pronouns));
    const pick = (d: number) => { const a = EDITOR_AVATARS[cyc(EDITOR_AVATARS, ai(), d)]; this.setBody(a.id); };
    this.menu = new Menu([
      { icon: '🧍', label: 'Figur', value: () => { const a = EDITOR_AVATARS[ai()]; return `${a.name} · ${a.desc}`; }, left: () => pick(-1), right: () => pick(1) },
      { icon: '💬', label: 'Pronomen', value: () => PRONOUNS[ni()].label, left: () => { s.pronouns = PRONOUNS[cyc(PRONOUNS, ni(), -1)].id; this.apply(); }, right: () => { s.pronouns = PRONOUNS[cyc(PRONOUNS, ni(), 1)].id; this.apply(); } },
      { icon: '✨', label: 'Los geht’s!', sub: 'Ab nach Rainbow City', big: true, fn: () => { if (!s.name.trim()) s.name = 'Alex'; this.done(); } },
    ]);
    this.menu.onBack = () => this.cancel();
    $('#cMenu', this.screen).appendChild(this.menu.el);
    hints([['dpad', 'Wählen'], ['lr', 'Ändern'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
    music('title');
    this.setBody(EDITOR_AVATARS[ai()].id);
  }
  exit() { this.screen?.remove(); }

  private async setBody(id: string) {
    const s = this.g.save.data; s.body = id;
    this.menu?.render();
    if (this.busy) return; this.busy = true;
    let a = this.actors.get(id);
    if (!a) {
      a = await Actor.create(this.scene, { ...playerLook(s), body: id, rb: id }); a.root.position.y = .3; this.actors.set(id, a);
      a.model.getChildMeshes().forEach((m) => this.sg.addShadowCaster(m, false));
    }
    this.busy = false;
    this.actors.forEach((x) => (x.root.visible = x === a));
    this.actor = a;
    this.apply(); a.play('wave');
    if (s.body !== id) this.setBody(s.body);
  }
  private apply() {
    const s = this.g.save.data;
    this.actor?.setLook(playerLook(s));
    this.menu?.render(); sfx('move');
  }

  update(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.menu.handle(inp);
    this.spin += dt * .5 + inp.look.x * .01;
    if (this.actor) { this.actor.root.rotation.y = this.spin; this.actor.update(dt); }
    this.ring.rotation.y = t * .3;
    // Hochformat: Figur oben, Menü unten – Kamera etwas höher und weiter weg
    const portrait = innerHeight > innerWidth;
    this.camera.position.set(portrait ? 0 : -1.2, portrait ? .4 : 1.5, portrait ? 8.6 : 6.2);
    this.camera.setTarget(new Vector3(portrait ? 0 : -1.2, portrait ? 0.1 : 1.2, 0));
  }
}
