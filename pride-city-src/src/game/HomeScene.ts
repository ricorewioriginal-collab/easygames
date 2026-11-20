/* Deine Wohnung (begehbar, aus Gay Life! übernommen, Babylon.js): KayKit-Möbel, benutzbar – Bett, Dusche, Herd,
   Kühlschrank, Sofa mit TV, Kleiderschrank, Tür. Pride-Wandbild, Lichterkette, Fenster mit Tag-/Nachthimmel. */
import type { GameScene } from '../engine/Engine';
import { Vector3, Matrix, HemisphericLight, DirectionalLight, PointLight, ShadowGenerator, TransformNode, Color3, type FreeCamera, type Scene, type PBRMaterial, type Mesh, type AbstractMesh, col } from '../engine/bjs';
import { instance, preload } from '../engine/Assets';
import { planeZ, ground, box, cyl, sphere, torus, pbr, glow, canvasTex } from '../engine/geo';
import { Actor, playerLook } from './Actor';
import type { Game } from './Game';
import { hints, toast } from '../ui/ui';
import { advance, DAY_SEC } from './life';
import { music, sfx } from '../engine/Audio';
import { PALETTES } from './palettes';

export const HOME_FILES = ['home/bed_double_A', 'home/couch_pillows', 'home/table_low', 'home/rug_rectangle_stripes_A', 'home/lamp_standing', 'home/shelf_A_big', 'home/cabinet_medium_decorated',
  'home/cactus_medium_A', 'home/cactus_small_A', 'home/pictureframe_large_A', 'home/book_set', 'home/armchair_pillows', 'home/lamp_table', 'home/cabinet_small',
  'kitchen/kitchencounter_straight_A', 'kitchen/kitchencounter_sink', 'kitchen/stove_single', 'kitchen/fridge_A', 'kitchen/pot_A'].map((n) => n + '.gltf');

interface Spot { id: string; label: string; x: number; z: number; r: number }
interface Box { x: number; z: number; hx: number; hz: number }

const W = 12, D = 9; // Innenmaße
const K = 1.6;       // KayKit-Möbel sind 1 Einheit ≈ 0,6 m → hochskalieren passend zur Figur

/** Raumlicht wie in einer Wohnung: Himmel, Sonne mit weichen Schatten, warmes Licht (gemeinsam für Wohnung und Innenräume) */
export function roomLights(sc: Scene, o: { hemi: number; sun: number; lamp: number; lampCol: number | string; lampPos: [number, number, number] }) {
  const h = new HemisphericLight('hemi', new Vector3(0, 1, 0), sc); h.intensity = o.hemi; h.diffuse = col(0xfff0e0); h.groundColor = col(0x403050);
  const sun = new DirectionalLight('sun', new Vector3(.4, -.9, -.6).normalize(), sc); sun.position.set(-4, 9, 6); sun.intensity = o.sun; sun.diffuse = col(0xfff2dd);
  sun.autoUpdateExtends = false; sun.orthoLeft = -9; sun.orthoRight = 9; sun.orthoTop = 9; sun.orthoBottom = -9; sun.shadowMinZ = .5; sun.shadowMaxZ = 30;
  const sg = new ShadowGenerator(1024, sun); sg.usePercentageCloserFiltering = true; sg.bias = .001; sg.normalBias = .02;
  const lamp = new PointLight('lamp', new Vector3(...o.lampPos), sc); lamp.intensity = o.lamp; lamp.diffuse = col(o.lampCol); lamp.range = 18;
  return { sg, sun };
}
/** Schattenwerfer einsammeln (alles mit _pcCast) */
export function collectCasters(sc: Scene, sg: ShadowGenerator) {
  const list = sg.getShadowMap()!.renderList!, have = new Set(list);
  for (const m of sc.meshes) if ((m as AbstractMesh & { _pcCast?: boolean })._pcCast && !have.has(m)) list.push(m);
}
const cast = (m: AbstractMesh) => { (m as AbstractMesh & { _pcCast?: boolean })._pcCast = true; m.receiveShadows = true; return m; };

export class HomeScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .45;
  private player!: Actor;
  private boxes: Box[] = [];
  readonly spots: Spot[] = [
    { id: 'bed', label: '😴 Schlafen', x: -3.6, z: -2.2, r: 2.6 },
    { id: 'shower', label: '🚿 Duschen', x: 4.8, z: -2.8, r: 1.8 },
    { id: 'stove', label: '🍳 Kochen', x: 1.2, z: -3.1, r: 2.2 },
    { id: 'fridge', label: '🧊 Kühlschrank', x: 2.9, z: -3.1, r: 2.2 },
    { id: 'tv', label: '📺 Fernsehen', x: -.2, z: 1.6, r: 2.4 },
    { id: 'wardrobe', label: '👗 Kleiderschrank', x: -5, z: 1.2, r: 2.9 },
    { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .8, z: 1.4, r: 1.5 },
  ];
  private window!: PBRMaterial;
  private steam: Mesh | null = null;
  private tvScreen!: PBRMaterial;
  private stoveGlow!: PBRMaterial;
  private sg!: ShadowGenerator;
  activity: '' | 'shower' | 'stove' | 'tv' = '';

  static load(sc: Scene) { return preload(sc, HOME_FILES); }

  private hudT = 0;
  private exitPos = new Vector3(W / 2 - .2, 3.4, 1.4);
  constructor(private g: Game) {
    this.scene = g.engine.newScene(0x140c26);
    this.camera = g.engine.newCamera(this.scene, 50, .1, 100);
  }

  async build() {
    const sc = this.scene;
    this.sg = roomLights(sc, { hemi: 1.1, sun: 1.6, lamp: 14, lampCol: 0xffb070, lampPos: [-3, 3.2, 1] }).sg;
    // Raum: Holzboden, drei Wände (Kamera schaut von vorne rein)
    const floor = ground(sc, W, D); floor.material = pbr(sc, 0xc7925e, .7); floor.receiveShadows = true;
    const wallM = pbr(sc, 0xf3e6ff, .9);
    const wall = (w: number, d: number, x: number, z: number) => { const m = box(sc, w, 4, d); m.material = wallM; m.position.set(x, 2, z); m.receiveShadows = true; };
    wall(W, .2, 0, -D / 2); wall(.2, D, -W / 2, 0); wall(.2, D, W / 2, 0);
    // Pride-Wandbild über dem Sofa
    PALETTES[0].colors.forEach((c, i) => { const s = planeZ(sc, .42, 2.4); s.material = pbr(sc, c, .8); s.position.set(-W / 2 + .12, 2.1, -.6 + i * .44); s.rotation.y = Math.PI / 2; });
    // Fenster mit Himmel
    this.window = glow(sc, 0x9fd2ff, 1);
    const win = planeZ(sc, 2.6, 1.6); win.material = this.window; win.position.set(-1, 2.4, -D / 2 + .12);
    const frame = box(sc, 2.8, 1.8, .1); frame.material = pbr(sc, 0xffffff, .5); frame.position.set(-1, 2.4, -D / 2 + .08);
    // Lichterkette (eine Kugel, viele Kopien mit eigener Farbe)
    const bulb = sphere(sc, .06, 6); bulb.material = glow(sc, 0xffffff, 1);
    const ms = new Float32Array(24 * 16), cs = new Float32Array(24 * 4);
    for (let i = 0; i < 24; i++) { const u = i / 23; Matrix.Translation(-W / 2 + .4 + u * (W - .8), 3.7 - Math.sin(u * Math.PI * 4) * .12, -D / 2 + .25).copyToArray(ms, i * 16); const c = col(PALETTES[0].colors[i % 6], 2); cs.set([c.r, c.g, c.b, 1], i * 4); }
    bulb.thinInstanceSetBuffer('matrix', ms, 16, true); bulb.thinInstanceSetBuffer('color', cs, 4, true);

    // Kollision: Box aus den echten Maßen des Möbelstücks (etwas kleiner, damit man nah herankommt)
    const put = async (n: string, x: number, z: number, rot = 0, s = K, bx?: [number, number], y = 0) => {
      const o = await instance(sc, n + '.gltf'); o.position.set(x, y, z); o.rotation.y = rot; o.scaling.setAll(s);
      if (bx) {
        const b = o.getHierarchyBoundingVectors(true), cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
        this.boxes.push({ x: cx, z: cz, hx: Math.max(.2, (b.max.x - b.min.x) / 2 - .08), hz: Math.max(.2, (b.max.z - b.min.z) / 2 - .08) });
      }
      return o;
    };
    await Promise.all([
      put('home/bed_double_A', -3.8, -2.9, 0, K, [1.6, 1.6]),
      put('home/cabinet_small', -5.4, -3.7, 0, K, [0, 0]),
      put('home/lamp_table', -5.4, -3.7, 0, K * .9, undefined, .95),
      put('home/rug_rectangle_stripes_A', -.6, 2, Math.PI / 2, K * 1.2),
      put('home/couch_pillows', -.4, 3.4, Math.PI, K, [1.6, .6]),
      put('home/table_low', -.4, 2.1, 0, K, [.8, .5]),
      put('home/lamp_standing', -5.3, .2, 0, K, [0, 0]),
      put('home/armchair_pillows', -3.6, 1.9, Math.PI / 2, K, [.6, .6]),
      put('home/shelf_A_big', -5.6, 1.2, Math.PI / 2, K, [.4, 1]),
      put('home/book_set', -5.6, 1.2, Math.PI / 2, K * .8, undefined, 1.5),
      put('home/cactus_medium_A', 5.3, 3.6, 0, K, [0, 0]),
      put('home/cactus_small_A', -1, -4.1, 0, K * .8, undefined, 1.55),
      put('home/pictureframe_large_A', 2.6, -4.35, 0, K, undefined, 1.9),
      put('kitchen/kitchencounter_sink', -.3, -3.9, 0, K, [.6, .5]),
      put('kitchen/stove_single', 1.2, -3.9, 0, K, [.6, .5]),
      put('kitchen/kitchencounter_straight_A', 2.1, -3.9, 0, K, [.4, .5]),
      put('kitchen/fridge_A', 2.9, -3.9, 0, K, [.5, .5]),
      put('kitchen/pot_A', 1.2, -3.9, 0, K * .8, undefined, 1.45),
    ]);
    // Herdplatte glüht beim Kochen
    this.stoveGlow = glow(sc, 0x220800, 1);
    const plate = cyl(sc, .25, .25, .01, 16); plate.material = this.stoveGlow; plate.position.set(1.2, 1.43, -3.75);
    // Fernseher gegenüber dem Sofa
    this.tvScreen = glow(sc, 0x111122, 1);
    const tv = box(sc, 2, 1.15, .12); tv.material = pbr(sc, 0x18181f, .4); tv.position.set(-.4, 1.4, .55); cast(tv);
    const scr = planeZ(sc, 1.86, 1.02); scr.material = this.tvScreen; scr.position.set(-.4, 1.4, .62);
    const tvStand = box(sc, 2.2, .6, .5); tvStand.material = pbr(sc, 0x5b3b8c, .6); tvStand.position.set(-.4, .3, .55); cast(tvStand);
    this.boxes.push({ x: -.4, z: .55, hx: 1.1, hz: .3 });
    // Dusche mit Glaswand in der Ecke
    const tray = box(sc, 2, .12, 1.8); tray.material = pbr(sc, 0xffffff, .3); tray.position.set(4.9, .06, -3.5);
    const glass = box(sc, .06, 2.4, 1.8); glass.material = pbr(sc, 0xbfe8ff, .05, 0, { alpha: .3 }); glass.position.set(3.9, 1.2, -3.5);
    const head = cyl(sc, .18, .18, .05, 16); head.material = pbr(sc, 0xcccccc, .2, .8); head.position.set(5.4, 2.6, -3.9);
    // Wohnungstür an der rechten Wand mit Leuchtschild „AUSGANG“ und Fußmatte
    const dx = W / 2 - .12, dz = 1.4, wood = pbr(sc, 0x7a3fb0, .6);
    const door = box(sc, .06, 2.5, 1.3); door.material = wood; door.position.set(dx, 1.25, dz);
    const trim = pbr(sc, 0xffffff, .5);
    for (const z of [dz - .72, dz + .72]) { const post = box(sc, .1, 2.65, .12); post.material = trim; post.position.set(dx - .02, 1.32, z); }
    const lintel = box(sc, .1, .12, 1.56); lintel.material = trim; lintel.position.set(dx - .02, 2.62, dz);
    const knob = sphere(sc, .06, 10); knob.material = pbr(sc, 0xffd23b, .3, .8); knob.position.set(dx - .08, 1.1, dz - .45);
    const st = canvasTex(sc, 256, 64, (g2) => { g2.fillStyle = '#0d3b1e'; g2.fillRect(0, 0, 256, 64); g2.font = '900 40px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillStyle = '#5dff9b'; g2.fillText('🚪 AUSGANG', 128, 34); });
    const sign = planeZ(sc, 1.2, .3); sign.material = glow(sc, 0xffffff, 1.2, { tex: st }); sign.position.set(dx - .08, 3, dz); sign.rotation.y = -Math.PI / 2;
    const mat = ground(sc, 1, 1.3); mat.material = pbr(sc, 0xff4fa3, 1); mat.position.set(dx - .6, .015, dz); mat.receiveShadows = true;

    this.buildMess();
    const s = this.g.save.data;
    this.player = await Actor.create(sc, playerLook(s));
    collectCasters(sc, this.sg);
  }

  /** Spuren einer wilden Nacht (nur 18+): zerwühlte Decke, Kleidung, Gleitgel, Kondomverpackungen – klein und stilisiert */
  private mess!: TransformNode;
  private buildMess() {
    const sc = this.scene, m = (this.mess = new TransformNode('mess', sc)), M = (c: number, o = 1) => pbr(sc, c, .8, 0, { alpha: o });
    const add = (o: Mesh, mt: PBRMaterial, x: number, y: number, z: number, ry = 0, rx = 0) => { o.material = mt; o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.parent = m; cast(o); return o; };
    // zerwühlte Decke über dem Bett
    add(box(sc, 2.2, .18, 1.6), M(0xff6ad5), -3.6, 1.05, -2.3, .35, .12);
    add(box(sc, 1.2, .22, .9), M(0x7b5cff), -4.4, 1.12, -1.7, -.6, -.2);
    // Kleidung auf dem Boden
    add(box(sc, .9, .05, .7), M(0x1aa7ff), -2.2, .03, -1.2, .7);
    add(box(sc, .5, .05, 1.1), M(0x2b2b38), -1.6, .03, -.4, -.4);
    add(box(sc, .5, .05, .35), M(0xff2f7a), -2.8, .03, -.6, 1.2);
    add(box(sc, .18, .06, .4), M(0xffffff), -1.1, .03, -1.6, .3);
    // Gleitgel (leer, umgekippt) und Verpackungen auf dem Nachttisch und Boden
    add(cyl(sc, .09, .09, .34, 12), M(0x5ce1ff, .75), -5.1, 1.12, -3.4, 0, Math.PI / 2);
    for (const [x, z, r] of [[-5.5, -3.2, .4], [-2.5, -1.9, 1.1], [-2.1, -2.2, 2.3]]) add(box(sc, .2, .01, .2), pbr(sc, 0xd8d8e8, .25, .9), x, x < -5 ? 1.0 : .015, z, r);
    // gebrauchte Kondome: kleine, stilisierte Ringe
    for (const [x, z] of [[-2.7, -1.6], [-1.9, -2.5]]) add(torus(sc, .07, .025, 14), M(0xf3e6c8, .8), x, .03, z);
    m.setEnabled(false);
  }
  /** Zeigt die Spuren am Morgen danach */
  showMess() { const s = this.g.save.data; this.mess.setEnabled(s.settings.adult && s.flags.wild === s.day); }

  /** Neue Figur, wenn im Editor die Figur gewechselt wurde */
  async syncPlayer() {
    const s = this.g.save.data, look = playerLook(s);
    if (this.player.look.body === look.body) return;
    this.player.dispose();
    this.player = await Actor.create(this.scene, look);
    collectCasters(this.scene, this.sg);
  }

  enter() {
    this.showMess();
    this.player.root.position.set(W / 2 - 1.2, 0, 1.4);
    this.player.root.rotation.y = -Math.PI / 2;
    const s = this.g.save.data;
    this.player.setLook(playerLook(s));
    this.g.hud.show(true); this.g.touch.show(true);
    this.g.city.refreshHud();
    this.g.hud.markers([]);
    hints([['move', 'Laufen'], ['a', 'Benutzen'], ['x', 'Handy'], ['y', 'Menü']]);
    music('city');
  }

  setSky(night: number) { this.window.albedoColor = new Color3(.62 - night * .55, .82 - night * .7, 1 - night * .6).toLinearSpace(); }

  /** Kurze Animation für eine Tätigkeit (Dampf, Herd, TV) */
  play(kind: HomeScene['activity'], ms = 1600) {
    this.activity = kind;
    if (kind === 'shower' && !this.steam) {
      this.steam = sphere(this.scene, 1, 12); this.steam.material = glow(this.scene, 0xffffff, 1, { alpha: .35 });
      this.steam.position.set(4.9, 1.6, -3.5); this.steam.scaling.set(.9, 1.4, .8);
    }
    sfx('open');
    setTimeout(() => { this.activity = ''; if (this.steam) { this.steam.dispose(false, true); this.steam = null; } }, ms);
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position;
    this.player.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
    const proj = (q: { x: number; y: number; z: number }) => g.engine.project(q);
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); this.setSky(g.city.world.night); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
      if (mag > .08) {
        p.x += mx * 3.6 * dt; p.z -= my * 3.6 * dt;
        p.x = Math.max(-W / 2 + .5, Math.min(W / 2 - .5, p.x)); p.z = Math.max(-D / 2 + .5, Math.min(D / 2 - .3, p.z));
        for (const b of this.boxes) {
          const dx = p.x - b.x, dz = p.z - b.z, px = b.hx + .35 - Math.abs(dx), pz = b.hz + .35 - Math.abs(dz);
          if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
        }
        this.player.root.rotation.y = Math.atan2(mx, -my);
        this.player.play('walk', .18, Math.max(1, 3.6 * Math.min(1, mag) / 1.02 * .55));
      } else if (this.player.anim === 'walk') this.player.play('idle');
      let best: Spot | null = null, bd = 9;
      for (const s of this.spots) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < s.r && d < bd) { bd = d; best = s; } }
      g.hud.prompt(best ? best.label : null);
      g.touch.label(best ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && best) { inp.consume('confirm'); this.player.play('interact'); g.homeAction(best.id); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      g.hud.markers(best?.id === 'door' ? [] : [{ id: 'exit', icon: '🚪', label: 'Ausgang', pos: this.exitPos }], proj);
    } else { g.hud.prompt(null); g.hud.markers([]); }
    // Kamera: von vorne schräg in den Raum, folgt leicht
    const k = Math.max(1, 1.25 / g.engine.aspect); // Hochformat: weiter weg, damit der Raum passt
    this.camera.position.set(p.x * .45 / k, 7.6 * (1 + (k - 1) * .6), 9.4 * k + p.z * .2);
    this.camera.setTarget(new Vector3(p.x * .6, .8, p.z * .5 - .6));
    if (this.steam) { this.steam.scaling.y = 1.4 + Math.sin(t * 4) * .15; (this.steam.material as PBRMaterial).alpha = .3 + Math.sin(t * 3) * .08; }
    this.stoveGlow.albedoColor = col(this.activity === 'stove' ? 0xff5a1a : 0x220800, this.activity === 'stove' ? 2 : 1);
    this.tvScreen.albedoColor = this.activity === 'tv' ? Color3.FromHSV(((t * .3) % 1) * 360, .8, 1).toLinearSpace().scale(1.4) : col(0x111122);
  }
}
