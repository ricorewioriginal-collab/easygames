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
import { spouse, kid, spouseLook, kidLook } from './family';

export const HOME_FILES = ['home/bed_double_A', 'home/couch_pillows', 'home/table_low', 'home/rug_rectangle_stripes_A', 'home/lamp_standing', 'home/shelf_A_big', 'home/cabinet_medium_decorated',
  'home/cactus_medium_A', 'home/cactus_small_A', 'home/pictureframe_large_A', 'home/book_set', 'home/armchair_pillows', 'home/lamp_table', 'home/cabinet_small',
  'kitchen/kitchencounter_straight_A', 'kitchen/kitchencounter_sink', 'kitchen/stove_single', 'kitchen/fridge_A', 'kitchen/pot_A'].map((n) => n + '.gltf');

interface Spot { id: string; label: string; x: number; z: number; r: number }
interface Box { x: number; z: number; hx: number; hz: number }

const W = 9, D = 7, H = 3; // Innenmaße in Metern (Figur ≈ 1,8 m)
const K = .9;              // KayKit-Möbel: 1 Einheit ≈ 1 m → Arbeitsplatte 0,9 m, Sofa 1,1 m, Kühlschrank 2,2 m

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
    { id: 'bed', label: '😴 Schlafen', x: -3, z: -.9, r: 1.7 },
    { id: 'shower', label: '🚿 Duschen', x: -3.6, z: 2.5, r: 1.4 },
    { id: 'stove', label: '🍳 Kochen', x: 1.9, z: -1.2, r: 1.2 },
    { id: 'fridge', label: '🧊 Kühlschrank', x: 3.6, z: -1.2, r: 1.2 },
    { id: 'tv', label: '📺 Fernsehen', x: .9, z: 1.75, r: 1.7 },
    { id: 'wardrobe', label: '👗 Kleiderschrank', x: 3.5, z: 2.5, r: 1.4 },
    { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .7, z: .3, r: 1.2 },
  ];
  private window!: PBRMaterial;
  private steam: Mesh | null = null;
  private tvScreen!: PBRMaterial;
  private stoveGlow!: PBRMaterial;
  private sg!: ShadowGenerator;
  activity: '' | 'shower' | 'stove' | 'tv' = '';
  /** Familie zu Hause: Partner*in am Sofa, Kind auf dem Teppich */
  private fam: { spouse?: Actor; kid?: Actor; key: string; spots: Spot[] } = { key: '', spots: [] };

  static load(sc: Scene) { return preload(sc, HOME_FILES); }

  private hudT = 0;
  private exitPos = new Vector3(W / 2 - .2, 2.6, .3);
  constructor(private g: Game) {
    this.scene = g.engine.newScene(0x140c26);
    this.camera = g.engine.newCamera(this.scene, 50, .1, 100);
  }

  async build() {
    const sc = this.scene;
    this.sg = roomLights(sc, { hemi: 1.1, sun: 1.6, lamp: 9, lampCol: 0xffb070, lampPos: [-.5, 2.6, .6] }).sg;
    // Raum: Holzboden, drei Wände (Kamera schaut von vorne rein)
    const floor = ground(sc, W, D); floor.material = pbr(sc, 0xc7925e, .7); floor.receiveShadows = true;
    const wallM = pbr(sc, 0xf3e6ff, .9);
    const wall = (w: number, d: number, x: number, z: number) => { const m = box(sc, w, H, d); m.material = wallM; m.position.set(x, H / 2, z); m.receiveShadows = true; };
    wall(W, .2, 0, -D / 2); wall(.2, D, -W / 2, 0); wall(.2, D, W / 2, 0);
    // Pride-Wandbild über dem Sofa
    PALETTES[0].colors.forEach((c, i) => { const s = planeZ(sc, .32, 1.5); s.material = pbr(sc, c, .8); s.position.set(-W / 2 + .12, 1.75, -.4 + i * .34); s.rotation.y = Math.PI / 2; });
    // Fenster mit Himmel
    this.window = glow(sc, 0x9fd2ff, 1);
    const win = planeZ(sc, 1.8, 1.1); win.material = this.window; win.position.set(-3.1, 1.95, -D / 2 + .12);
    const frame = box(sc, 1.96, 1.26, .1); frame.material = pbr(sc, 0xffffff, .5); frame.position.set(-3.1, 1.95, -D / 2 + .08);
    // Lichterkette (eine Kugel, viele Kopien mit eigener Farbe)
    const bulb = sphere(sc, .06, 6); bulb.material = glow(sc, 0xffffff, 1);
    const ms = new Float32Array(24 * 16), cs = new Float32Array(24 * 4);
    for (let i = 0; i < 24; i++) { const u = i / 23; Matrix.Translation(-W / 2 + .4 + u * (W - .8), H - .2 - Math.sin(u * Math.PI * 4) * .1, -D / 2 + .25).copyToArray(ms, i * 16); const c = col(PALETTES[0].colors[i % 6], 2); cs.set([c.r, c.g, c.b, 1], i * 4); }
    bulb.thinInstanceSetBuffer('matrix', ms, 16, true); bulb.thinInstanceSetBuffer('color', cs, 4, true);

    // Möbel: Mittelpunkt (x/z) der echten Umrisse, wahlweise an eine Wand geschoben; Kollision aus den echten Maßen (etwas kleiner)
    type Snap = { back?: boolean; left?: boolean; right?: boolean; y?: number; rot?: number; s?: number; col?: boolean };
    const put = async (n: string, x: number, z: number, o: Snap = {}) => {
      const m = await instance(sc, n + '.gltf'); m.rotation.y = o.rot || 0; m.scaling.setAll(o.s ?? K); m.position.set(0, o.y || 0, 0);
      let b = m.getHierarchyBoundingVectors(true);
      let dx = x - (b.min.x + b.max.x) / 2, dz = z - (b.min.z + b.max.z) / 2;
      if (o.back) dz = -D / 2 + .12 - b.min.z;
      if (o.left) dx = -W / 2 + .12 - b.min.x;
      if (o.right) dx = W / 2 - .12 - b.max.x;
      m.position.x += dx; m.position.z += dz;
      b = m.getHierarchyBoundingVectors(true);
      if (o.col !== false) this.boxes.push({ x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, hx: Math.max(.15, (b.max.x - b.min.x) / 2 - .08), hz: Math.max(.15, (b.max.z - b.min.z) / 2 - .08) });
      return m;
    };
    await Promise.all([
      put('home/bed_double_A', -3.1, 0, { back: true, left: true, s: K * .85 }),
      put('home/cabinet_small', -1.45, 0, { back: true, s: K * .6 }),
      put('home/lamp_table', -1.45, -3.1, { y: .54, s: K * .55, col: false }),
      put('home/pictureframe_large_A', -1.45, -3.42, { y: 1.45, s: K * .7, col: false }),
      put('kitchen/kitchencounter_sink', .1, 0, { back: true }),
      put('kitchen/stove_single', 1.9, 0, { back: true }),
      put('kitchen/fridge_A', 3.6, 0, { back: true, right: true }),
      put('home/cactus_small_A', -.5, -3.2, { y: .9, s: K * .6, col: false }),
      put('home/lamp_standing', -4.1, -.6, { s: K * .8 }),
      put('home/rug_rectangle_stripes_A', .9, 1.5, { rot: Math.PI / 2, s: K * 1.1, col: false }),
      put('home/couch_pillows', .9, 2.85, { rot: Math.PI }),
      put('home/table_low', .9, 1.05, { s: K * .65 }),
      put('home/armchair_pillows', -1.3, 1.3, { rot: Math.PI / 2, s: K * .9 }),
      put('home/cactus_medium_A', -1.1, 3.05, { s: K * .8 }),
      put('home/shelf_A_big', 0, 2.5, { right: true, rot: Math.PI / 2 }),
    ]);
    const shelfBooks = await instance(sc, 'home/book_set.gltf'); shelfBooks.scaling.setAll(K * .8); shelfBooks.rotation.y = Math.PI / 2; shelfBooks.position.set(W / 2 - .3, .62, 2.5);
    // Herdplatte glüht beim Kochen
    this.stoveGlow = glow(sc, 0x220800, 1);
    const plate = cyl(sc, .25, .25, .01, 16); plate.material = this.stoveGlow; plate.position.set(1.9, .93, -2.6);
    // Fernseher gegenüber dem Sofa
    this.tvScreen = glow(sc, 0x111122, 1);
    const tv = box(sc, 1.5, .88, .08); tv.material = pbr(sc, 0x18181f, .4); tv.position.set(.9, 1.0, -.25); cast(tv);
    const scr = planeZ(sc, 1.4, .78); scr.material = this.tvScreen; scr.position.set(.9, 1.0, -.2);
    const tvStand = box(sc, 1.7, .55, .45); tvStand.material = pbr(sc, 0x5b3b8c, .6); tvStand.position.set(.9, .275, -.25); cast(tvStand);
    this.boxes.push({ x: .9, z: -.25, hx: .85, hz: .23 });
    // Dusche mit Glaswand in der Ecke
    const tray = box(sc, 1.3, .1, 1.3); tray.material = pbr(sc, 0xffffff, .3); tray.position.set(-3.8, .05, 2.8);
    const glass = box(sc, .05, 2.1, 1.3); glass.material = pbr(sc, 0xbfe8ff, .05, 0, { alpha: .3 }); glass.position.set(-3.13, 1.05, 2.8);
    this.boxes.push({ x: -3.13, z: 3.05, hx: .05, hz: .4 });
    const head = cyl(sc, .18, .18, .05, 16); head.material = pbr(sc, 0xcccccc, .2, .8); head.position.set(-4.25, 2.2, 3.1);
    // Wohnungstür an der rechten Wand mit Leuchtschild „AUSGANG“ und Fußmatte
    const dx = W / 2 - .12, dz = .3, wood = pbr(sc, 0x7a3fb0, .6);
    const door = box(sc, .06, 2.5, 1.3); door.material = wood; door.position.set(dx, 1.25, dz);
    const trim = pbr(sc, 0xffffff, .5);
    for (const z of [dz - .72, dz + .72]) { const post = box(sc, .1, 2.65, .12); post.material = trim; post.position.set(dx - .02, 1.32, z); }
    const lintel = box(sc, .1, .12, 1.56); lintel.material = trim; lintel.position.set(dx - .02, 2.62, dz);
    const knob = sphere(sc, .06, 10); knob.material = pbr(sc, 0xffd23b, .3, .8); knob.position.set(dx - .08, 1.1, dz - .45);
    const st = canvasTex(sc, 256, 64, (g2) => { g2.fillStyle = '#0d3b1e'; g2.fillRect(0, 0, 256, 64); g2.font = '900 40px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillStyle = '#5dff9b'; g2.fillText('🚪 AUSGANG', 128, 34); });
    const sign = planeZ(sc, 1.2, .3); sign.material = glow(sc, 0xffffff, 1.2, { tex: st }); sign.position.set(dx - .08, 2.7, dz); sign.rotation.y = -Math.PI / 2;
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
    add(box(sc, 1.7, .14, 1.3), M(0xff6ad5), -3.1, .72, -2.2, .35, .1);
    add(box(sc, .9, .18, .7), M(0x7b5cff), -3.7, .78, -1.7, -.6, -.2);
    // Kleidung auf dem Boden
    add(box(sc, .7, .04, .55), M(0x1aa7ff), -2.1, .03, -.7, .7);
    add(box(sc, .4, .04, .9), M(0x2b2b38), -1.5, .03, -.2, -.4);
    add(box(sc, .4, .04, .28), M(0xff2f7a), -2.8, .03, -.5, 1.2);
    add(box(sc, .14, .05, .32), M(0xffffff), -1.1, .03, -1.2, .3);
    // Gleitgel (leer, umgekippt) und Verpackungen auf dem Nachttisch und Boden
    add(cyl(sc, .07, .07, .26, 12), M(0x5ce1ff, .75), -1.25, .6, -2.85, 0, Math.PI / 2);
    for (const [x, z, r] of [[-1.6, -2.95, .4], [-2.4, -.9, 1.1], [-1.8, -1.0, 2.3]]) add(box(sc, .16, .01, .16), pbr(sc, 0xd8d8e8, .25, .9), x, z < -2 ? .56 : .015, z, r);
    // gebrauchte Kondome: kleine, stilisierte Ringe
    for (const [x, z] of [[-2.6, -.8], [-1.7, -.6]]) add(torus(sc, .07, .025, 14), M(0xf3e6c8, .8), x, .03, z);
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
    void this.syncFamily();
    this.player.root.position.set(W / 2 - 1, 0, .3);
    this.player.root.rotation.y = -Math.PI / 2;
    const s = this.g.save.data;
    this.player.setLook(playerLook(s));
    this.g.hud.show(true); this.g.touch.show(true);
    this.g.city.refreshHud();
    this.g.hud.markers([]);
    hints([['move', 'Laufen'], ['a', 'Benutzen'], ['x', 'Handy'], ['y', 'Menü']]);
    music('city');
  }

  /** Partner*in und Kind nach Hochzeit bzw. Adoption in die Wohnung holen */
  async syncFamily() {
    const s = this.g.save.data, sl = spouseLook(s), kl = kidLook(s), key = (sl ? sl.body + sl.palette : '') + '|' + (kl?.body || '');
    if (key === this.fam.key) { this.famSpots(); return; }
    this.fam.key = key;
    this.fam.spouse?.dispose(); this.fam.kid?.dispose(); this.fam.spouse = this.fam.kid = undefined;
    const [a, b] = await Promise.all([sl ? Actor.create(this.scene, sl) : null, kl ? Actor.create(this.scene, kl) : null]);
    if (a) { a.root.position.set(2.5, 0, 1.3); a.root.rotation.y = -Math.PI / 2 - .5; a.play('idle', 0); this.fam.spouse = a; }
    if (b) { b.root.position.set(-.5, 0, -.5); b.root.rotation.y = Math.PI * .15; b.play('dance2', 0, .9); this.fam.kid = b; }
    this.famSpots();
    collectCasters(this.scene, this.sg);
  }
  private famSpots() {
    const s = this.g.save.data, sp = spouse(s), k = kid(s), out: Spot[] = [];
    if (sp && this.fam.spouse) out.push({ id: 'spouse', label: `💞 ${sp.name}`, x: 2.5, z: 1.3, r: 1.2 });
    // nach einer wilden Nacht (18+) übernachtet das Kind bei den Großeltern
    const away = this.mess.isEnabled();
    this.fam.kid?.root.setEnabled(!away);
    if (k && this.fam.kid && !away) out.push({ id: 'kid', label: `🧸 ${k.name}`, x: -.5, z: -.5, r: 1.1 });
    this.fam.spots = out;
  }
  /** Kurze Animation mit Partner*in oder Kind */
  familyPlay(who: 'spouse' | 'kid', anim: 'dance1' | 'laugh' | 'clap' | 'cheer' | 'talk') {
    const a = who === 'spouse' ? this.fam.spouse : this.fam.kid; if (!a) return;
    a.root.rotation.y = Math.atan2(this.player.root.position.x - a.root.position.x, this.player.root.position.z - a.root.position.z);
    a.play(anim); this.player.play(anim === 'talk' ? 'talk' : anim === 'dance1' ? 'dance1' : 'laugh');
    setTimeout(() => { a.play(who === 'kid' ? 'dance2' : 'idle'); if (this.player.anim !== 'walk') this.player.play('idle'); }, 3500);
  }
  setSky(night: number) { this.window.albedoColor = new Color3(.62 - night * .55, .82 - night * .7, 1 - night * .6).toLinearSpace(); }

  /** Kurze Animation für eine Tätigkeit (Dampf, Herd, TV) */
  play(kind: HomeScene['activity'], ms = 1600) {
    this.activity = kind;
    if (kind === 'shower' && !this.steam) {
      this.steam = sphere(this.scene, 1, 12); this.steam.material = glow(this.scene, 0xffffff, 1, { alpha: .35 });
      this.steam.position.set(-3.8, 1.3, 2.8); this.steam.scaling.set(.9, 1.4, .8);
    }
    sfx('open');
    setTimeout(() => { this.activity = ''; if (this.steam) { this.steam.dispose(false, true); this.steam = null; } }, ms);
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position;
    this.player.update(dt);
    this.fam.spouse?.update(dt); this.fam.kid?.update(dt);
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
        for (const a of [this.fam.spouse, this.fam.kid]) if (a) { const dx = p.x - a.root.position.x, dz = p.z - a.root.position.z, d = Math.hypot(dx, dz); if (d < .6 && d > 0) { p.x += dx / d * (.6 - d); p.z += dz / d * (.6 - d); } }
        for (const b of this.boxes) {
          const dx = p.x - b.x, dz = p.z - b.z, px = b.hx + .35 - Math.abs(dx), pz = b.hz + .35 - Math.abs(dz);
          if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
        }
        this.player.root.rotation.y = Math.atan2(mx, -my);
        this.player.play('walk', .18, Math.max(1, 3.6 * Math.min(1, mag) / 1.02 * .55));
      } else if (this.player.anim === 'walk') this.player.play('idle');
      let best: Spot | null = null, bd = 9;
      for (const s of [...this.spots, ...this.fam.spots]) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < s.r && d < bd) { bd = d; best = s; } }
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
    this.camera.position.set(p.x * .4 / k, 5.6 * (1 + (k - 1) * .6), 7.2 * k + p.z * .25);
    this.camera.setTarget(new Vector3(p.x * .55, .7, p.z * .45 - .5));
    if (this.steam) { this.steam.scaling.y = 1.4 + Math.sin(t * 4) * .15; (this.steam.material as PBRMaterial).alpha = .3 + Math.sin(t * 3) * .08; }
    this.stoveGlow.albedoColor = col(this.activity === 'stove' ? 0xff5a1a : 0x220800, this.activity === 'stove' ? 2 : 1);
    this.tvScreen.albedoColor = this.activity === 'tv' ? Color3.FromHSV(((t * .3) % 1) * 360, .8, 1).toLinearSpace().scale(1.4) : col(0x111122);
  }
}
