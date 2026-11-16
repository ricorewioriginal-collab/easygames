/* Deine Wohnung (begehbar, aus Gay Life! übernommen): KayKit-Möbel, benutzbar – Bett, Dusche, Herd, Kühlschrank, Sofa mit TV,
   Kleiderschrank, Tür. Pride-Wandbild, Lichterkette, Fenster mit Tag-/Nachthimmel. */
import * as THREE from 'three';
import type { GameScene } from '../engine/Engine';
import { instance, preload } from '../engine/Assets';
import { Actor } from './Actor';
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

export class HomeScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  bloom = .45;
  private player!: Actor;
  private boxes: Box[] = [];
  readonly spots: Spot[] = [
    { id: 'bed', label: '😴 Schlafen', x: -3.6, z: -2.2, r: 2 },
    { id: 'shower', label: '🚿 Duschen', x: 4.6, z: -2.8, r: 1.6 },
    { id: 'stove', label: '🍳 Kochen', x: 1.2, z: -3.1, r: 1.5 },
    { id: 'fridge', label: '🧊 Kühlschrank', x: 2.8, z: -3.1, r: 1.4 },
    { id: 'tv', label: '📺 Fernsehen', x: -.2, z: 1.6, r: 1.6 },
    { id: 'wardrobe', label: '👗 Kleiderschrank', x: -5, z: 1.2, r: 1.6 },
    { id: 'door', label: '🚪 Rausgehen', x: 0, z: 4, r: 1.4 },
  ];
  private window!: THREE.MeshBasicMaterial;
  private steam: THREE.Mesh | null = null;
  private tvScreen!: THREE.MeshBasicMaterial;
  private stoveGlow!: THREE.MeshBasicMaterial;
  activity: '' | 'shower' | 'stove' | 'tv' = '';

  static load() { return preload(HOME_FILES); }

  private hudT = 0;
  constructor(private g: Game) {}

  async build() {
    const r = this.root;
    r.background = new THREE.Color(0x140c26);
    r.add(new THREE.HemisphereLight(0xfff0e0, 0x403050, 1.6));
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.6); sun.position.set(-4, 9, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); r.add(sun);
    const warm = new THREE.PointLight(0xffb070, 14, 14); warm.position.set(-3, 3.2, 1); r.add(warm);
    // Raum: Holzboden, zwei Wände (Kamera schaut von vorne rein)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0xc7925e, roughness: .7 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; r.add(floor);
    const wallM = new THREE.MeshStandardMaterial({ color: 0xf3e6ff, roughness: .9 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, 4, .2), wallM); back.position.set(0, 2, -D / 2); back.receiveShadow = true; r.add(back);
    const left = new THREE.Mesh(new THREE.BoxGeometry(.2, 4, D), wallM); left.position.set(-W / 2, 2, 0); left.receiveShadow = true; r.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(.2, 4, D), wallM); right.position.set(W / 2, 2, 0); right.receiveShadow = true; r.add(right);
    // Pride-Wandbild über dem Sofa
    PALETTES[0].colors.forEach((c, i) => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(.42, 2.4), new THREE.MeshStandardMaterial({ color: c, roughness: .8 }));
      s.position.set(-W / 2 + .12, 2.1, -.6 + i * .44); s.rotation.y = Math.PI / 2; r.add(s);
    });
    // Fenster mit Himmel
    this.window = new THREE.MeshBasicMaterial({ color: 0x9fd2ff });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), this.window); win.position.set(-1, 2.4, -D / 2 + .12); r.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, .1), new THREE.MeshStandardMaterial({ color: 0xffffff })); frame.position.set(-1, 2.4, -D / 2 + .08); r.add(frame);
    // Lichterkette
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), 24);
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    for (let i = 0; i < 24; i++) { const u = i / 23; m4.setPosition(-W / 2 + .4 + u * (W - .8), 3.7 - Math.sin(u * Math.PI * 4) * .12, -D / 2 + .25); bulbs.setMatrixAt(i, m4); bulbs.setColorAt(i, col.set(PALETTES[0].colors[i % 6]).multiplyScalar(2)); }
    r.add(bulbs);

    const put = async (n: string, x: number, z: number, rot = 0, s = K, box?: [number, number]) => {
      const o = await instance(n + '.gltf'); o.position.set(x, 0, z); o.rotation.y = rot; o.scale.setScalar(s); r.add(o);
      if (box) this.boxes.push({ x, z, hx: box[0], hz: box[1] });
      return o;
    };
    await Promise.all([
      put('home/bed_double_A', -3.8, -2.9, 0, K, [1.6, 1.6]),
      put('home/cabinet_small', -5.4, -3.7, 0, K),
      put('home/lamp_table', -5.4, -3.7, 0, K * .9).then((o) => (o.position.y = .95)),
      put('home/rug_rectangle_stripes_A', -.6, 2, Math.PI / 2, K * 1.2),
      put('home/couch_pillows', -.4, 3.4, Math.PI, K, [1.6, .6]),
      put('home/table_low', -.4, 2.1, 0, K, [.8, .5]),
      put('home/lamp_standing', -5.3, .2, 0, K),
      put('home/armchair_pillows', -3.6, 1.9, Math.PI / 2, K, [.6, .6]),
      put('home/shelf_A_big', -5.6, 1.2, Math.PI / 2, K, [.4, 1]),
      put('home/book_set', -5.6, 1.2, Math.PI / 2, K * .8).then((o) => (o.position.y = 1.5)),
      put('home/cactus_medium_A', 5.3, 3.6, 0, K),
      put('home/cactus_small_A', -1, -4.1, 0, K * .8).then((o) => (o.position.y = 1.55)),
      put('home/pictureframe_large_A', 2.6, -4.35, 0, K).then((o) => (o.position.y = 1.9)),
      put('kitchen/kitchencounter_sink', -.3, -3.9, 0, K, [.6, .5]),
      put('kitchen/stove_single', 1.2, -3.9, 0, K, [.6, .5]),
      put('kitchen/kitchencounter_straight_A', 2.1, -3.9, 0, K, [.4, .5]),
      put('kitchen/fridge_A', 2.9, -3.9, 0, K, [.5, .5]),
      put('kitchen/pot_A', 1.2, -3.9, 0, K * .8).then((o) => (o.position.y = 1.45)),
    ]);
    // Herdplatte glüht beim Kochen
    this.stoveGlow = new THREE.MeshBasicMaterial({ color: 0x220800, toneMapped: false });
    const plate = new THREE.Mesh(new THREE.CircleGeometry(.25, 16), this.stoveGlow); plate.rotation.x = -Math.PI / 2; plate.position.set(1.2, 1.43, -3.75); r.add(plate);
    // Fernseher gegenüber dem Sofa
    this.tvScreen = new THREE.MeshBasicMaterial({ color: 0x111122, toneMapped: false });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(2, 1.15, .12), new THREE.MeshStandardMaterial({ color: 0x18181f })); tv.position.set(-.4, 1.4, .55); r.add(tv);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.02), this.tvScreen); scr.position.set(-.4, 1.4, .62); r.add(scr);
    const tvStand = new THREE.Mesh(new THREE.BoxGeometry(2.2, .6, .5), new THREE.MeshStandardMaterial({ color: 0x5b3b8c })); tvStand.position.set(-.4, .3, .55); r.add(tvStand);
    this.boxes.push({ x: -.4, z: .55, hx: 1.1, hz: .3 });
    // Dusche mit Glaswand in der Ecke
    const tray = new THREE.Mesh(new THREE.BoxGeometry(2, .12, 1.8), new THREE.MeshStandardMaterial({ color: 0xffffff })); tray.position.set(4.9, .06, -3.5); r.add(tray);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.06, 2.4, 1.8), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .3, roughness: .05 })); glass.position.set(3.9, 1.2, -3.5); r.add(glass);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .05, 16), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: .8, roughness: .2 })); head.position.set(5.4, 2.6, -3.9); r.add(head);
    // Tür
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .05), new THREE.MeshBasicMaterial({ color: 0xff4fa3, toneMapped: false })); door.rotation.x = -Math.PI / 2; door.position.set(0, .02, D / 2 - .1); r.add(door);

    const s = this.g.save.data;
    this.player = await Actor.create({ body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    r.add(this.player.root);
  }

  /** Neue Figur, wenn im Editor der Körper gewechselt wurde */
  async syncPlayer() {
    const s = this.g.save.data;
    if (this.player.look.body === s.body) return;
    this.root.remove(this.player.root);
    this.player = await Actor.create({ body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    this.root.add(this.player.root);
  }

  enter() {
    this.player.root.position.set(0, 0, 3);
    this.player.root.rotation.y = Math.PI;
    const s = this.g.save.data;
    this.player.setLook({ palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    this.g.hud.show(true); this.g.touch.show(true);
    this.g.city.refreshHud();
    hints([['move', 'Laufen'], ['a', 'Benutzen'], ['x', 'Handy'], ['y', 'Menü']]);
    music('city');
  }

  setSky(night: number) { this.window.color.setRGB(.62 - night * .55, .82 - night * .7, 1 - night * .6); }

  /** Kurze Animation für eine Tätigkeit (Dampf, Herd, TV) */
  play(kind: HomeScene['activity'], ms = 1600) {
    this.activity = kind;
    if (kind === 'shower' && !this.steam) {
      this.steam = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .35, depthWrite: false }));
      this.steam.position.set(4.9, 1.6, -3.5); this.steam.scale.set(.9, 1.4, .8); this.root.add(this.steam);
    }
    sfx('open');
    setTimeout(() => { this.activity = ''; if (this.steam) { this.root.remove(this.steam); this.steam = null; } }, ms);
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position;
    this.player.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
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
        this.player.play('walk', .18, .9);
      } else if (this.player.anim === 'walk') this.player.play('idle');
      let best: Spot | null = null, bd = 9;
      for (const s of this.spots) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < s.r && d < bd) { bd = d; best = s; } }
      g.hud.prompt(best ? best.label : null);
      g.touch.label(best ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && best) { inp.consume('confirm'); this.player.play('interact'); g.homeAction(best.id); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
    } else g.hud.prompt(null);
    // Kamera: von vorne schräg in den Raum, folgt leicht
    const k = Math.max(1, 1.25 / this.camera.aspect); // Hochformat: weiter weg, damit der Raum passt
    this.camera.position.set(p.x * .45 / k, 7.6 * (1 + (k - 1) * .6), 9.4 * k + p.z * .2);
    this.camera.lookAt(p.x * .6, .8, p.z * .5 - .6);
    if (this.steam) { this.steam.scale.y = 1.4 + Math.sin(t * 4) * .15; (this.steam.material as THREE.MeshBasicMaterial).opacity = .3 + Math.sin(t * 3) * .08; }
    this.stoveGlow.color.setHex(this.activity === 'stove' ? 0xff5a1a : 0x220800);
    this.tvScreen.color.setHSL(this.activity === 'tv' ? (t * .3) % 1 : .66, this.activity === 'tv' ? .8 : .3, this.activity === 'tv' ? .55 : .08);
  }
}
