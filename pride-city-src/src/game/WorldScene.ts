/* Eine Welt jenseits der Stadt (worlds.ts): Insel mit Himmel und Meer und einem Ortskern aus demselben Bausatz wie
   Rainbow City (Ringstraße, Häuserzeilen mit betretbaren Läden, Autos, Passanten). Dazu Gastgeber*in, Leute, vier
   Aufgaben, ein Lieferauftrag auf Zeit und der Flitzer, ein Fluggerät zum Fahren und Fliegen. Bewegung, Kamera und
   Bedienung wie in der Stadt und den Häusern. */
import type { GameScene } from '../engine/Engine';
import { Vector3, HemisphericLight, DirectionalLight, Mesh, Node3, type FreeCamera, type Scene, type PBRMaterial, col } from '../engine/bjs';
import { ground, box, cyl, sphere, torus, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { instance } from '../engine/Assets';
import { Townhouses, facadeTint } from './townhouse';
import { PLACE_THEMES, HOUSE_THEMES, houseTheme, type Theme } from './interiors';
import { Actor, playerLook, streetLook } from './Actor';
import type { Game } from './Game';
import { hints, toast } from '../ui/ui';
import { advance, change, DAY_SEC } from './life';
import { music, sfx } from '../engine/Audio';
import { RoomCam } from './room';
import { buildFlitzer } from './flitzer';
import { worldStage, townFree, neighbour, SLOTS, SHOP_SLOTS, SIDE_GATE, type Kit, type WorldDef, type WorldNpc } from './worlds';
import { CAR_FILE } from './World';

interface Folk { a: Actor; d: WorldNpc; host: boolean }
const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];
const S = 5;   // Maßstab des Stadt-Bausatzes (wie World.ts)
type Pt = [number, number];
/** Flugstrecke: einmal über die Ringstraße, zuletzt hoch über den Platz [x, y, z] */
const COURSE: Array<[number, number, number]> = [[0, 5, 20], [18, 7, 18], [20, 8, 5], [18, 7, -8], [0, 10, -10], [-18, 7, -8], [-20, 8, 5], [0, 15, 5]];
/** Passant*innen auf dem Gehweg der Ringstraße: [Figur, Szene-Look] */
const WALKERS: Array<[string, string]> = [['Male_Adult_01', 'regenbogen'], ['Female_Adult_02', 'lesbisch'], ['Male_Adult_08', 'bear'], ['Female_Adult_04', 'trans'], ['Sports_Male_01', 'crop'], ['Female_Adult_08', 'pan']];
const SIDEWALK: Pt[] = [[24.4, 24.4], [24.4, -14.4], [-24.4, -14.4], [-24.4, 24.4]];
const LANE = 2.6;
const LANES: Pt[][] = [
  [[20 + LANE, 20 + LANE], [20 + LANE, -10 - LANE], [-20 - LANE, -10 - LANE], [-20 - LANE, 20 + LANE]],
  [[20 - LANE, -10 + LANE], [20 - LANE, 20 - LANE], [-20 + LANE, 20 - LANE], [-20 + LANE, -10 + LANE]],
];
const turn = (now: number, to: number, k: number) => { const d = Math.atan2(Math.sin(to - now), Math.cos(to - now)); return now + d * Math.min(1, k); };
const nice = (t: string) => t.toLowerCase().replace(/(^|[\s\-&])\p{L}/gu, (c) => c.toUpperCase());

export class WorldScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .5;
  /** Fassaden und Schaufenster der Häuser, leuchten nachts wie in der Stadt */
  private nightM: PBRMaterial[] = [];
  private player!: Actor;
  private folk: Folk[] = [];
  private solids: Array<{ x: number; z: number; r: number }> = [];
  private cam = new RoomCam(2000, 2000, 400, 6.5);
  private items: Array<{ m: Mesh; x: number; y: number; z: number; got: boolean }> = [];
  private rings: Array<{ m: Mesh; x: number; y: number; z: number }> = [];
  private ringOn!: PBRMaterial; private ringOff!: PBRMaterial;
  private ringAt = 0;
  private ride!: Node3;
  private riding = false;
  private alt = 0;
  private shadow!: Mesh;
  private hudT = 0;
  private gate = new Vector3();
  private pad = new Vector3();
  private rects: Array<{ x: number; z: number; hx: number; hz: number }> = [];
  private doors: Array<{ x: number; z: number; yaw: number; label: string; theme: Theme; place: string }> = [];
  private cars: Array<{ o: Node3; path: Pt[]; seg: number; u: number; v: number }> = [];
  private parked: Node3[] = [];
  private walkers: Array<{ a: Actor; path: Pt[]; seg: number; u: number; halt: boolean }> = [];
  /** laufender Lieferauftrag: noch offene Türen, Restzeit, Anzahl */
  private job: { left: number[]; t: number; n: number } | null = null;
  private jobPad = new Vector3(5, 0, 13.6);
  /** Rückkehr aus einem Haus: Platz vor der Tür */
  back: { x: number; z: number; yaw: number } | null = null;
  /** Ankunft aus einer anderen Welt: Namen einblenden */
  hello = false;
  /** Tore am Ortsrand zu den Nachbarwelten */
  private exits: Array<{ x: number; z: number; to: string; icon: string; name: string; arrive: 'west' | 'east' }> = [];
  /** gerade in einem Tor oder schon auf dem Weg hinaus (löst nur einmal aus) */
  private leaving = true;

  constructor(private g: Game, readonly def: WorldDef) {
    this.scene = g.engine.newScene(0x8fd3ff);
    this.camera = g.engine.newCamera(this.scene, 60, .1, 500);
  }
  private get flags() { return this.g.save.data.flags; }
  private get stage() { return worldStage(this.flags, this.def.id); }
  private setStage(n: number) { this.flags['w_' + this.def.id] = n; this.g.save.write(); this.showQuest(); }

  async build() {
    const sc = this.scene, d = this.def, R = d.r;
    const h = new HemisphericLight('hemi', new Vector3(0, 1, 0), sc); h.intensity = .85 * (d.dim ?? 1); h.diffuse = col(d.light); h.groundColor = col(0x8a7a9a);
    const sun = new DirectionalLight('sun', new Vector3(.4, -.8, -.45).normalize(), sc); sun.intensity = 1.1 * (d.dim ?? 1); sun.diffuse = col(0xfff4e0);
    // Himmel (Verlauf), Meer, Insel
    const sky = sphere(sc, 240, 16); sky.material = glow(sc, 0xffffff, 1, { double: true, tex: canvasTex(sc, 8, 256, (g2) => { const gr = g2.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, d.sky[0]); gr.addColorStop(.36, d.sky[0]); gr.addColorStop(.5, d.sky[1]); gr.addColorStop(.64, d.sky[0]); gr.addColorStop(1, d.sky[0]); g2.fillStyle = gr; g2.fillRect(0, 0, 8, 256); }) }); sky.isPickable = false;
    const sea = ground(sc, 520, 520); sea.material = pbr(sc, d.water, .15, .1); sea.position.y = -.7;
    const isle = cyl(sc, R, R + 3, 1.4, 48); isle.position.y = -.7;
    { const m = pbr(sc, d.ground, .95), t = this.speck(false); t.uScale = t.vScale = R / 3; m.albedoTexture = t; isle.material = m; }
    const shore = cyl(sc, R + 3, R + 7, .5, 48); shore.material = pbr(sc, 0xfff1c9, 1); shore.position.y = -.85;

    // Baukasten: gleiche Materialien werden geteilt und am Ende je Material zu einem Mesh verschmolzen (wenige Zeichenaufrufe)
    const mats = new Map<string, PBRMaterial>(), parts = new Map<PBRMaterial, Mesh[]>();
    const add = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.isPickable = false; let l = parts.get(mt); if (!l) parts.set(mt, (l = [])); l.push(m); return m; };
    let seed = [...d.id].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7) % 2147483647;
    const kit: Kit = {
      sc,
      M: (c, r = .8, mt = 0) => { const key = `m${c}/${r}/${mt}`; let m = mats.get(key); if (!m) mats.set(key, (m = pbr(sc, c, r, mt))); return m; },
      G: (c, k = 1, a) => { const key = `g${c}/${k}/${a}`; let m = mats.get(key); if (!m) mats.set(key, (m = glow(sc, c, k, a === undefined ? {} : { alpha: a }))); return m; },
      box: (w, hh, dd, m, x, y, z, ry = 0) => { const o = add(box(sc, w, hh, dd), m, x, y, z); o.rotation.y = ry; return o; },
      cyl: (rt, rb, hh, m, x, y, z, seg = 12) => add(cyl(sc, rt, rb, hh, seg), m, x, y, z),
      ball: (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = add(sphere(sc, r, 10), m, x, y, z); o.scaling.set(sx, sy, sz); return o; },
      arc: (r, tube, m, x, y, z, ry = 0) => { const o = add(torus(sc, r, tube, 28), m, x, y, z); o.rotation.set(Math.PI / 2, ry, 0); return o; },
      sign: (text, color, x, y, z, ry, w) => {
        const tex = canvasTex(sc, 512, 96, (g2) => { g2.font = '900 64px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.shadowColor = color; g2.shadowBlur = 18; g2.fillStyle = color; g2.fillText(text, 256, 50, 500); }, true);
        const m = planeZ(sc, w, w * 96 / 512); m.material = glow(sc, 0xffffff, 1.6, { tex }); m.position.set(x, y, z); m.rotation.y = ry; m.isPickable = false;
      },
      solid: (x, z, r) => { this.solids.push({ x, z, r }); },
      rnd: () => (seed = (seed * 16807) % 2147483647) / 2147483647,
      free: (x, z, pad = 1) => Math.hypot(x, z) < R - 2 && townFree(x, z, pad) && this.solids.every((q) => Math.hypot(q.x - x, q.z - z) > q.r + pad),
    };
    await this.buildTown(kit);
    d.build(kit);
    // Weltentor (zurück und weiter) und Startplatz des Flitzers am Südufer
    this.gate.set(0, 0, R - 6); this.pad.set(5, 0, R - 11);
    RAINBOW.forEach((c, i) => kit.arc(3.2 - i * .2, .12, kit.G(c, 1.1), 0, 0, R - 6));
    kit.cyl(3.6, 3.8, .16, kit.M(0xffffff, .5), 0, .08, R - 6, 24);
    kit.sign('RAINBOW CITY', '#ffffff', 0, 4.1, R - 6, Math.PI, 5.4);
    // Tore zu den Nachbarwelten (Ring): im Westen zur vorigen, im Osten zur nächsten
    for (const sx of [-1, 1] as const) {
      const nb = neighbour(d.id, sx, !!this.g.save.data.settings.adult); if (!nb || nb.id === d.id) continue;
      const x = sx * SIDE_GATE.x, z = SIDE_GATE.z, c = parseInt(nb.host.color.slice(1), 16);
      for (let i = 0; i < 3; i++) kit.arc(2.5 - i * .22, .12, kit.G(i === 1 ? 0xffffff : c, 1.1), x, 0, z, Math.PI / 2);
      kit.cyl(2.9, 3.1, .14, kit.M(0xffffff, .5), x, .07, z, 20);
      kit.sign(`${nb.icon} ${nb.name.toUpperCase()}`, nb.host.color, x - sx * .15, 3.3, z, -sx * Math.PI / 2, 5.2);
      this.exits.push({ x, z, to: nb.id, icon: nb.icon, name: nb.name, arrive: sx < 0 ? 'east' : 'west' });
    }
    kit.cyl(1.6, 1.7, .12, kit.G(0xff4fa3, .9), this.pad.x, .06, this.pad.z, 20);
    for (const [mt, list] of parts) {
      if (list.length < 2) continue;
      for (const m of list) m.computeWorldMatrix(true);
      try { const merged = Mesh.MergeMeshes(list, true, true); if (merged) { merged.material = mt; merged.isPickable = false; merged.freezeWorldMatrix(); } } catch { /* einzeln lassen */ }
    }

    // Stellen mit Wirkung: Bodenring wie in den Häusern
    { const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 }); for (const sp of d.spots || []) { const o = torus(sc, .5, .06, 24); o.material = ringM; o.position.set(sp.x, .05, sp.z); o.isPickable = false; } }
    // Sammelstücke: zwei am Boden, jedes dritte in der Luft (dafür der Flitzer)
    const im = glow(sc, d.item.color, 1.4), free = (x: number, z: number) => kit.free(x, z, 1.2);
    for (let i = 0; i < d.item.n; i++) {
      let x = 0, z = 0;
      for (let t = 0; t < 30; t++) { const a = (i / d.item.n) * Math.PI * 2 + kit.rnd() * .6, dist = 9 + kit.rnd() * (R - 16); x = Math.sin(a) * dist; z = Math.cos(a) * dist; if (free(x, z)) break; }
      const m = cyl(sc, 0, .42, .55, 4); m.material = im; const b = cyl(sc, .42, 0, .55, 4); b.material = im; b.position.y = -.55; b.parent = m; m.isPickable = false;
      const y = i % 3 === 2 ? 6.5 + (i % 2) * 2.5 : 1.3; m.position.set(x, y, z);
      this.items.push({ m, x, y, z, got: false });
    }
    // Ringe für den Flug: einmal um die Insel, wechselnde Höhe
    this.ringOn = glow(sc, 0xffffff, 1.5); this.ringOff = glow(sc, 0xffffff, .9, { alpha: .28 });
    COURSE.forEach(([x, y, z], i) => {
      const n = COURSE[Math.min(i + 1, COURSE.length - 1)], b = COURSE[Math.max(i - 1, 0)];
      const m = torus(sc, 2.6, .2, 28); m.rotation.set(Math.PI / 2, Math.atan2(n[0] - b[0], n[2] - b[2]), 0); m.position.set(x, y, z); m.material = this.ringOff; m.isPickable = false;
      this.rings.push({ m, x, y, z });
    });
    // Auftragsbrett auf dem Platz
    { const o = torus(sc, .7, .07, 24); o.material = glow(sc, 0x5ce1ff, 1.3, { alpha: .7 }); o.position.set(this.jobPad.x, .14, this.jobPad.z); o.isPickable = false; }
    // Flitzer: mit 18+ ein riesiger Glitzer-Dildo, sonst eine Regenbogen-Rakete
    this.ride = new Node3('ride', sc); this.buildRide();
    this.shadow = cyl(sc, .9, .9, .02, 20); this.shadow.material = glow(sc, 0x000000, 1, { alpha: .28 }); this.shadow.isPickable = false;

    // Leute
    const all: Array<[WorldNpc, boolean]> = [[d.host, true], ...d.folk.map((f) => [f, false] as [WorldNpc, boolean])];
    const nWalk = this.g.engine.mobile ? 4 : WALKERS.length;
    const [actors, strollers] = await Promise.all([
      Promise.all(all.map(([n]) => Actor.create(sc, { body: n.rb, rb: n.rb, palette: 'rainbow', skin: 0 }))),
      Promise.all(WALKERS.slice(0, nWalk).map(([rb, style]) => Actor.create(sc, { body: rb, rb, palette: 'rainbow', skin: 0, style }))),
    ]);
    strollers.forEach((a, i) => {
      const path = i % 2 ? [...SIDEWALK].reverse() : SIDEWALK;
      a.play('walk', 0, .72); this.walkers.push({ a, path, seg: i % 4, u: .15 + i * .13, halt: false });
    });
    actors.forEach((a, i) => {
      const [n, host] = all[i];
      a.root.position.set(n.x, 0, n.z); a.root.rotation.y = n.yaw ?? Math.atan2(-n.x, -n.z);
      a.play(n.anim || 'idle', 0, .95); this.folk.push({ a, d: n, host }); this.solids.push({ x: n.x, z: n.z, r: .45 });
    });
    this.player = await Actor.create(sc, streetLook(playerLook(this.g.save.data)));
    this.showQuest();
  }

  /** feine Körnung für Boden und Pflaster (kachelbar), pave = mit Fugen */
  private speck(pave: boolean) {
    const t = canvasTex(this.scene, 128, 128, (g2) => {
      g2.fillStyle = '#fff'; g2.fillRect(0, 0, 128, 128);
      let n = 99; const r = () => (n = (n * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 900; i++) { const v = r(); g2.fillStyle = v < .5 ? `rgba(0,0,0,${.03 + r() * .09})` : `rgba(255,255,255,${.1 + r() * .2})`; const q = 1 + r() * (pave ? 2 : 5); g2.fillRect(r() * 128, r() * 128, q, q); }
      if (pave) { g2.strokeStyle = 'rgba(0,0,0,.28)'; g2.lineWidth = 2; for (let i = 0; i <= 2; i++) { g2.beginPath(); g2.moveTo(0, i * 64); g2.lineTo(128, i * 64); g2.stroke(); } for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const x = i * 64 + j * 32; g2.beginPath(); g2.moveTo(x, j * 64); g2.lineTo(x, j * 64 + 64); g2.stroke(); } }
    });
    t.wrapU = t.wrapV = 1;
    return t;
  }

  /** Ortskern aus dem Bausatz der Stadt: Ringstraße, Häuser mit Türen und Leuchtschrift, Laternen, Platz, Autos */
  private async buildTown(kit: Kit) {
    const sc = this.scene, d = this.def, W = this.g.city.world;
    const put = async (name: string, x: number, y: number, z: number, rot: number, flat = false) => {
      const o = await instance(sc, 'city/' + name + '.gltf', { shadows: false });
      W.tune(name, o); o.position.set(x, y, z); o.rotation.y = rot; o.scaling.set(S, flat ? 1 : S, S);
      o.getChildMeshes().forEach((m) => { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; });
      return o;
    };
    const jobs: Promise<unknown>[] = [];
    // Ringstraße mit Zebrastreifen am Weg vom Tor
    for (const x of [-10, 0, 10]) jobs.push(put(x ? 'road_straight' : 'road_straight_crossing', x, 0, 20, Math.PI / 2, true), put('road_straight', x, 0, -10, Math.PI / 2, true));
    for (const z of [0, 10]) for (const x of [-20, 20]) jobs.push(put('road_straight', x, 0, z, 0, true));
    jobs.push(put('road_corner', 20, 0, 20, Math.PI, true), put('road_corner', 20, 0, -10, -Math.PI / 2, true), put('road_corner', -20, 0, 20, Math.PI / 2, true), put('road_corner', -20, 0, -10, 0, true));
    // Laternen
    const bulb = kit.G(0xffe2a8, 1.6);
    for (const [x, z, alongZ] of [[-10, 20, 0], [10, 20, 0], [-10, -10, 0], [10, -10, 0], [20, 0, 1], [20, 10, 1], [-20, 0, 1], [-20, 10, 1]]) {
      const lx = alongZ ? x + 4.4 : x, lz = alongZ ? z : z + 4.4;
      jobs.push(put('streetlight', lx, .1, lz, alongZ ? Math.PI : -Math.PI / 2));
      kit.ball(.2, bulb, lx - (alongZ ? 1.05 : 0), 4.55, lz - (alongZ ? 0 : 1.05)); kit.solid(lx, lz, .3);
    }
    // Bänke, Hydranten, Mülleimer und Büsche an den Gehwegen
    for (const [n, x, z, r] of [['bench', -14, 10, Math.PI / 2], ['bench', 14, 0, -Math.PI / 2], ['firehydrant', 24.3, 5, 0], ['firehydrant', -24.3, -5, 0], ['trash_A', 24.4, 15, 0], ['trash_A', -24.4, 5, 0], ['trash_A', 6, 24.4, 0], ['bush', -24.4, 15, 0], ['bush', 24.4, -5, 0], ['bush', -6, 24.5, 0], ['dumpster', -25.6, -25.6, 0], ['dumpster', 25.6, 35.4, 0], ['bush', -2.7, 27.6, 0], ['bush', 2.7, 27.6, 0], ['bench', -2.9, 33, Math.PI / 2], ['bench', 2.9, 33, -Math.PI / 2]] as Array<[string, number, number, number]>) {
      jobs.push(put(n, x, .1, z, r)); kit.solid(x, z, n === 'bench' || n === 'dumpster' ? .9 : .4);
    }
    // Häuser: Pflaster darunter, Fassade in der Farbe der Welt
    const town = new Townhouses(W, { collide: false, night: this.nightM });
    SLOTS.forEach(([x, z, rot], i) => {
      jobs.push(put('base', x, 0, z, 0, true));
      town.add(x, z, rot, { floors: 2 + ((i * 7 + d.id.length) % 3), tint: facadeTint(d.town.tint[i % d.town.tint.length]) });
      this.rects.push({ x, z, hx: 4.3, hz: 4.3 });
    });
    // Autos auf der Ringstraße (zwei Richtungen), dazu geparkte
    const car = async (kind: string) => {
      const inner = await instance(sc, 'cars/' + (CAR_FILE[kind] || 'sedan') + (this.g.engine.mobile ? '_lo' : '') + '.glb', { shadows: false });
      const o = new Node3(kind, sc); inner.parent = o; inner.position.y = -.027; o.position.y = .1;
      return o;
    };
    ['car_taxi', 'car_sedan', 'car_hatchback', 'car_stationwagon'].slice(0, this.g.engine.mobile ? 3 : 4).forEach((kind, i) => jobs.push(car(kind).then((o) => { this.cars.push({ o, path: LANES[i % 2], seg: i % 4, u: .2 + i * .15, v: 6 + (i % 3) }); })));
    (d.town.parked || []).forEach(([x, z, yaw], i) => jobs.push(car(['car_sedan', 'car_hatchback', 'car_stationwagon'][i % 3]).then((o) => { o.position.set(x, .1, z); o.rotation.y = yaw; this.parked[i] = o; this.solids.push({ x, z, r: 1.7 }); })));
    await Promise.all(jobs);
    town.build(sc);
    // Türen: Läden der Welt mit Leuchtschrift, die übrigen Häuser wie in der Stadt
    const adult = !!this.g.save.data.settings.adult, dark = kit.M(0x0a0618, .6);
    SLOTS.forEach(([x, z, rot], i) => {
      const fx = Math.round(Math.sin(rot)), fz = Math.round(Math.cos(rot)), si = SHOP_SLOTS.indexOf(i), shop = si >= 0 ? d.town.shops[si] : undefined;
      let theme = houseTheme(i + d.id.length * 3, adult), place = '';
      if (shop) {
        const th = PLACE_THEMES[shop[2]] || HOUSE_THEMES.find((t) => t.id === shop[2]);
        if (th) { theme = { ...th, title: nice(shop[0]) }; place = PLACE_THEMES[shop[2]] ? shop[2] : ''; }
        kit.box(5.6, 1.25, .1, dark, x + fx * 4.5, 5.6, z + fz * 4.5, rot); kit.sign(shop[0], shop[1], x + fx * 4.58, 5.6, z + fz * 4.58, rot, 5.2);
        for (const sy of [-.68, .68]) kit.box(5.7, .07, .12, kit.G(parseInt(shop[1].slice(1), 16), 1.3), x + fx * 4.54, 5.6 + sy, z + fz * 4.54, rot);
      }
      this.doors.push({ x: x + fx * 5, z: z + fz * 5, yaw: rot, label: `🚪 ${theme.icon} ${theme.title}`, theme, place });
    });
    // Platz in der Mitte: Pflaster in der Farbe der Welt
    { const m = pbr(sc, d.town.plaza, .85), t = this.speck(true); t.uScale = 15; t.vScale = 10; m.albedoTexture = t; const pl = box(sc, 30, .1, 20); pl.material = m; pl.position.set(0, .03, 5); pl.isPickable = false; pl.freezeWorldMatrix(); }
    // gepflasterter Weg vom Weltentor zum Zebrastreifen, Büsche am Rand
    { const m = pbr(sc, d.town.plaza, .85), t = this.speck(true); t.uScale = 2; t.vScale = 9; m.albedoTexture = t; const pl = box(sc, 3.4, .06, 18); pl.material = m; pl.position.set(0, .03, 34); pl.isPickable = false; pl.freezeWorldMatrix(); }
  }

  private adultRide = false;
  private buildRide() {
    this.adultRide = !!this.g.save.data.settings.adult;
    buildFlitzer(this.scene, this.ride, this.adultRide);
    this.ride.position.copyFrom(this.pad); this.ride.position.y = .75; this.ride.rotation.y = Math.PI;
  }

  /** Neue Figur, wenn im Kleiderschrank die Figur gewechselt wurde */
  async syncPlayer() {
    const look = streetLook(playerLook(this.g.save.data));
    if (this.player.look.body === look.body) return;
    const old = this.player;
    this.player = await Actor.create(this.scene, look);
    this.player.root.position.copyFrom(old.root.position); this.player.root.rotation.y = old.root.rotation.y;
    old.dispose();
  }

  enter() {
    const R = this.def.r, s = this.g.save.data;
    if (!!s.settings.adult !== this.adultRide) this.buildRide();
    this.riding = false; this.g.touch.fly(false); this.alt = 0; this.ride.position.y = .75; this.leaving = true;
    const b = this.back; this.back = null;
    if (b) { this.player.root.position.set(b.x, 0, b.z); this.player.root.rotation.y = b.yaw; this.cam.reset(b.yaw + Math.PI, .3); }
    else { this.player.root.position.set(0, 0, R - 14); this.player.root.rotation.y = Math.PI; this.cam.reset(0, .3); this.quit(); }
    this.player.setLook(streetLook(playerLook(s))); this.player.play('idle');
    this.cam.dist = 6.5;
    this.g.hud.show(true); this.g.touch.show(true); this.g.hud.markers([]);
    this.setHints(); this.light();
    music(this.def.music);
    if (!b || this.hello) this.g.hud.banner(`${this.def.icon} ${this.def.name}`, this.def.sub, 'info', 3600);
    this.hello = false;
    this.showQuest();
  }
  /** Welt verlassen: laufenden Auftrag beenden */
  quit() { if (this.job) { this.job = null; this.g.hud.gig(null); } }
  /** Spiegelungen wie in der Stadt (Lack, Fenster) */
  private light() {
    const c = this.g.city.scene, n = this.g.city.world.night; this.scene.environmentTexture = c.environmentTexture; this.scene.environmentIntensity = c.environmentIntensity * .5 * (this.def.dim ?? 1);
    for (const m of this.nightM) m.emissiveColor.set(.04 + n * 1.1, .04 + n * 1.05, .04 + n);
  }
  /** Anzeige oben: Werte aus der Stadt, Ziel aus dieser Welt */
  private hud() {
    const g = this.g, d = this.def, st = this.stage, n = this.folk.length - 1;
    g.city.refreshHud();
    const told = this.toldCount();
    g.hud.goal(`${d.icon} ${d.name}`, st === 0 ? `Sprich mit ${d.host.name}` : st === 1 ? `${d.item.icon} ${d.item.n - this.left()}/${d.item.n} ${d.item.name} sammeln` : st === 2 ? `🌈 Ring ${this.ringAt + 1}/${this.rings.length} über der Ringstraße` : st === 3 ? (told < n ? `📣 Allen Bescheid sagen (${told}/${n})` : `Zurück zu ${d.host.name}`) : 'Geschafft: Läden, Aufträge und Leute',
      st === 2 ? 'Flitzer rufen, ▲ Steigen, ▼ Sinken' : st >= 4 ? `${d.job.icon} ${d.job.name} am Auftragsbrett auf dem Platz` : '');
  }
  private toldCount() { let v = Number(this.flags['w_' + this.def.id + '_v']) || 0, c = 0; for (; v; v >>= 1) c += v & 1; return Math.min(c, this.folk.length - 1); }
  private setHints() { hints(this.riding ? [['move', 'Lenken'], ['rise', 'Steigen'], ['sink', 'Sinken'], ['a', 'Aktion'], ['wpn', 'Absteigen'], ['cam', 'Kamera'], ['y', 'Menü']] : [['move', 'Laufen'], ['a', 'Aktion'], ['wpn', 'Flitzer rufen'], ['cam', 'Kamera'], ['y', 'Menü']]); }

  /** Sammelstücke und Ringe passend zum Stand zeigen */
  private showQuest() {
    const st = this.stage, got = Number(this.flags['w_' + this.def.id + '_n']) || 0;
    this.items.forEach((it, i) => { it.got = st !== 1 || !!(got & (1 << i)); it.m.setEnabled(!it.got); });
    this.rings.forEach((r, i) => { r.m.setEnabled(st === 2); r.m.material = i === this.ringAt ? this.ringOn : this.ringOff; });
    if (st >= 4) for (const f of this.folk) if (!f.host && f.d.anim !== 'sit') f.a.play(['dance1', 'dance2', 'dance3'][this.folk.indexOf(f) % 3] as 'dance1');
    if (this.folk.length) this.hud();
  }
  private left() { return this.items.filter((i) => !i.got).length; }

  private mount(on: boolean) {
    const p = this.player.root.position;
    if (on === this.riding) return;
    this.riding = on; this.g.touch.fly(on); sfx('open');
    if (on) { this.ride.position.set(p.x, .75, p.z); this.ride.rotation.y = this.player.root.rotation.y; this.alt = .75; this.player.play('sit'); this.cam.dist = 10; toast(`🚀 ${this.adultRide ? 'Glitzer-Dildo „Big Bertha“' : 'Regenbogen-Rakete'}: ▲ Steigen, ▼ Sinken (RB/LB, R/Q).`); }
    else { p.y = 0; this.alt = 0; this.ride.position.y = .75; this.player.play('idle'); this.cam.dist = 6.5; }
    this.setHints();
  }

  private talk(f: Folk) {
    const g = this.g, s = g.save.data, d = this.def, say = (lines: string[], done?: () => void) => g.dialog.say(lines.map((text) => ({ who: f.d.name, color: f.d.color, text })), done);
    f.a.root.rotation.y = Math.atan2(this.player.root.position.x - f.a.root.position.x, this.player.root.position.z - f.a.root.position.z);
    const st = this.stage, n = this.folk.length - 1, vk = 'w_' + d.id + '_v';
    if (!f.host) {
      const ls = f.d.lines || ['Hallo!'], bit = 1 << (this.folk.indexOf(f) - 1), news = st === 3 && !((Number(s.flags[vk]) || 0) & bit);
      say(news ? [ls[s.day % ls.length], 'Oh, das sind gute Neuigkeiten. Ich bin dabei!'] : [ls[s.day % ls.length]], () => {
        if (!news) return;
        s.flags[vk] = (Number(s.flags[vk]) || 0) | bit; sfx('ok'); g.save.write();
        const c = this.toldCount();
        if (c >= n) g.hud.banner('📣 Alle wissen Bescheid!', `Zurück zu ${d.host.name}`, 'good', 4000); else toast(`📣 ${c}/${n} wissen Bescheid`);
        this.hud();
      });
      const k = 'visit_' + f.d.name; if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 8, fun: 4 }); this.hud(); }
      return;
    }
    if (st === 0) say([...d.host.intro, d.host.ask1], () => { this.setStage(1); toast(`${d.item.icon} Aufgabe: ${d.item.n} ${d.item.name} sammeln`); });
    else if (st === 1) say([d.host.ask1, `Es fehlen noch ${this.left()}.`]);
    else if (st === 2) say([d.host.ask2]);
    else if (st === 3 && this.toldCount() < n) say([d.host.ask3, `Es fehlen noch ${n - this.toldCount()}.`]);
    else if (st === 3) say(d.host.finale, () => { s.money += d.pay[2]; change(s, { fun: 30, social: 20 }); sfx('win'); this.setStage(4); g.hud.banner(`${d.icon} ${d.name} geschafft!`, `+${d.pay[2]} € · Die Insel feiert dich.`, 'good', 5000); });
    else say([d.host.after[s.day % d.host.after.length]]);
  }

  /** Lieferauftrag auf Zeit: fünf Türen im Ort, zu Fuß oder mit dem Flitzer */
  private startJob() {
    const d = this.def, ids = this.doors.map((_, i) => i), left: number[] = [];
    for (let i = 0; i < 5; i++) left.push(ids.splice(Math.floor(Math.random() * ids.length), 1)[0]);
    this.job = { left, t: 95, n: left.length }; sfx('open');
    this.g.hud.banner(`${d.job.icon} ${d.job.name}`, d.job.text, 'info', 4200);
  }

  /** Autos auf der Ringstraße (halten vor der Figur und voreinander), Passant*innen auf dem Gehweg */
  private traffic(dt: number, t: number) {
    const p = this.player.root.position, low = !this.riding || this.alt < 3;
    for (const c of this.cars) {
      const n = c.path.length, a = c.path[c.seg], b = c.path[(c.seg + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ax = (b[0] - a[0]) / len, az = (b[1] - a[1]) / len, q = c.o.position;
      const ahead = (x: number, z: number, reach: number, wide: number) => { const dx = x - q.x, dz = z - q.z, along = dx * ax + dz * az; return along > 0 && along < reach && Math.abs(dx * az - dz * ax) < wide; };
      let v = c.v;
      if (low && ahead(p.x, p.z, 8, 2.2)) v = 0;
      for (const o of this.cars) if (o !== c && ahead(o.o.position.x, o.o.position.z, 7.5, 1.8)) v = 0;
      c.u += v * dt / len; if (c.u >= 1) { c.u = 0; c.seg = (c.seg + 1) % n; }
      const a2 = c.path[c.seg], b2 = c.path[(c.seg + 1) % n];
      q.x = a2[0] + (b2[0] - a2[0]) * c.u; q.z = a2[1] + (b2[1] - a2[1]) * c.u;
      c.o.rotation.y = turn(c.o.rotation.y, Math.atan2(b2[0] - a2[0], b2[1] - a2[1]), dt * 5);
    }
    // 18+: das vorderste geparkte Auto schaukelt leise (mehr sieht man nicht)
    if (this.def.adult && this.parked[0]) this.parked[0].rotation.z = Math.sin(t * 7) * .012;
    for (const w of this.walkers) {
      const r = w.a.root, a = w.path[w.seg], b = w.path[(w.seg + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const halt = !this.riding && Math.hypot(p.x - r.position.x, p.z - r.position.z) < 1.3;
      if (halt !== w.halt) { w.halt = halt; w.a.play(halt ? 'idle' : 'walk', .25, .72); }
      if (!halt) {
        w.u += 1.35 * dt / len; if (w.u >= 1) { w.u = 0; w.seg = (w.seg + 1) % 4; }
        const a2 = w.path[w.seg], b2 = w.path[(w.seg + 1) % 4];
        r.position.set(a2[0] + (b2[0] - a2[0]) * w.u, 0, a2[1] + (b2[1] - a2[1]) * w.u);
        r.rotation.y = turn(r.rotation.y, Math.atan2(b2[0] - a2[0], b2[1] - a2[1]), dt * 6);
      }
      w.a.update(dt);
    }
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position, d = this.def, R = d.r;
    this.player.update(dt);
    for (const f of this.folk) f.a.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.traffic(dt, t);
    this.hudT -= dt;
    for (const it of this.items) if (!it.got) { it.m.rotation.y = t * 1.6; it.m.position.y = it.y + Math.sin(t * 2 + it.x) * .18; }
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); this.light(); this.hud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my), sprint = inp.held('sprint');
      const speed = this.riding ? 13 : sprint ? 6.6 : 3.8;
      if (mag > .08) {
        const [dx, dz] = this.cam.dir(mx, my), sp = speed * dt * Math.min(1, mag) / mag;
        p.x += dx * sp; p.z += dz * sp;
        let dr = Math.atan2(dx, dz) - this.player.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); this.player.root.rotation.y += dr * Math.min(1, dt * (this.riding ? 5 : 14));
        if (!this.riding) this.player.play(sprint ? 'run' : 'walk', .18, sprint ? 1.2 : 1.9);
      } else if (!this.riding && (this.player.anim === 'walk' || this.player.anim === 'run')) this.player.play('idle');
      // Rand: zu Fuß bleibt man auf der Insel, im Flug geht es ein Stück aufs Meer hinaus
      const lim = this.riding ? R + 22 : R - 1.2, dist = Math.hypot(p.x, p.z);
      if (dist > lim) { p.x *= lim / dist; p.z *= lim / dist; }
      // Übergänge: durch das Südtor zurück in die Hauptstadt, durch die Seitentore in die Nachbarwelt;
      // mit dem Flitzer genügt es, in die Richtung aufs Meer hinauszufliegen
      {
        let go: (() => void) | null = null;
        const far = this.riding && dist > R + 19;
        if ((!this.riding || this.alt < 3) && Math.hypot(this.gate.x - p.x, this.gate.z - p.z) < 1.5) go = () => g.leaveWorld();
        for (const e of this.exits) if (((!this.riding || this.alt < 3) && Math.hypot(e.x - p.x, e.z - p.z) < 1.5) || (far && Math.abs(p.x) > Math.abs(p.z) && p.x * e.x > 0)) go = () => g.enterWorld(e.to, e.arrive);
        if (far && p.z > Math.abs(p.x)) go = () => g.leaveWorld();
        if (go && !this.leaving) go();
        this.leaving = !!go;
      }
      if (this.riding) {
        this.alt = Math.max(.75, Math.min(18, this.alt + ((inp.held('rise') ? 7 : 0) - (inp.held('sink') ? 7 : 0)) * dt));
        if (Math.hypot(p.x, p.z) > R - 1) this.alt = Math.max(this.alt, 1.6);   // über dem Wasser nicht eintauchen
      }
      // Häuser: zu Fuß und im Tiefflug kein Durchkommen, darüber hinweg geht es ab 16 m
      if (!this.riding || this.alt < 16) for (const r of this.rects) { const m = this.riding ? .9 : .35, ddx = p.x - r.x, ddz = p.z - r.z, ox = r.hx + m - Math.abs(ddx), oz = r.hz + m - Math.abs(ddz); if (ox > 0 && oz > 0) { if (ox < oz) p.x += (ddx < 0 ? -1 : 1) * ox; else p.z += (ddz < 0 ? -1 : 1) * oz; } }
      if (!this.riding || this.alt < 3) for (const q of this.solids) { const ddx = p.x - q.x, ddz = p.z - q.z, m = q.r + (this.riding ? .9 : .35), dd = Math.hypot(ddx, ddz); if (dd < m && dd > 0) { p.x = q.x + ddx / dd * m; p.z = q.z + ddz / dd * m; } }
      // Sammeln und Ringe
      const st = this.stage, py = this.riding ? this.alt : 1;
      if (st === 1) for (const [i, it] of this.items.entries()) {
        if (it.got || Math.hypot(it.x - p.x, it.z - p.z) > 1.7 || Math.abs(it.y - py) > 2.2) continue;
        it.got = true; it.m.setEnabled(false); sfx('coin');
        this.flags['w_' + d.id + '_n'] = (Number(this.flags['w_' + d.id + '_n']) || 0) | (1 << i);
        const left = this.left();
        if (left) toast(`${d.item.icon} ${d.item.n - left}/${d.item.n} ${d.item.name}`);
        else { sv.money += d.pay[0]; sfx('win'); this.ringAt = 0; this.setStage(2); g.hud.banner(`${d.item.icon} Alle ${d.item.name} gefunden!`, `+${d.pay[0]} € · Nächste Aufgabe: durch die Ringe fliegen`, 'good', 4500); }
        this.hud();
      }
      if (st === 2) { const r = this.rings[this.ringAt]; if (r && Math.hypot(r.x - p.x, r.z - p.z) < 2.6 && Math.abs(r.y - py) < 2.4) {
        this.ringAt++; sfx('ok');
        if (this.ringAt >= this.rings.length) { sv.money += d.pay[1]; sfx('win'); this.setStage(3); g.hud.banner('🌈 Alle Ringe geschafft!', `+${d.pay[1]} € · Sag allen Bescheid`, 'good', 4500); }
        else { toast(`🌈 Ring ${this.ringAt}/${this.rings.length}`); this.showQuest(); }
      } }
      // Was ist in Reichweite?
      let label: string | null = null, act: (() => void) | null = null, bd = 9;
      if (!this.riding || this.alt < 1.5) {
        for (const f of this.folk) { const dd = Math.hypot(f.a.root.position.x - p.x, f.a.root.position.z - p.z); if (dd < 2.4 && dd < bd) { bd = dd; label = (f.host ? '⭐ ' : '💬 ') + f.d.name; act = () => this.talk(f); } }
        if (!label && !this.riding) for (const sp of d.spots || []) { if (Math.hypot(sp.x - p.x, sp.z - p.z) < (sp.r || 2)) { label = sp.label; act = () => g.interiorAct(sp); break; } }
        if (!label && !this.riding) for (const dr of this.doors) if (Math.hypot(dr.x - p.x, dr.z - p.z) < 1.7) { label = dr.label; act = () => g.enterInterior(dr.theme, { x: dr.x + Math.sin(dr.yaw) * .5, z: dr.z + Math.cos(dr.yaw) * .5, yaw: dr.yaw }, dr.place, true); break; }
        if (!label && !this.job && Math.hypot(this.jobPad.x - p.x, this.jobPad.z - p.z) < 1.8) { label = `${d.job.icon} Auftrag: ${d.job.name}`; act = () => this.startJob(); }
        if (!label && Math.hypot(this.gate.x - p.x, this.gate.z - p.z) < 3.4) { label = '🌈 Durchlaufen: Rainbow City · A: Reiseziel wählen'; act = () => g.worldMenu(); }
        if (!label && !this.riding && Math.hypot(this.ride.position.x - p.x, this.ride.position.z - p.z) < 2.6) { label = `🚀 Aufsteigen: ${this.adultRide ? 'Glitzer-Dildo' : 'Regenbogen-Rakete'}`; act = () => this.mount(true); }
      }
      g.hud.prompt(label); g.touch.label(label ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && act) { inp.consume('confirm'); act(); }
      else if (inp.pressed('weapon')) { inp.consume('weapon'); this.mount(!this.riding); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.worldMenu(); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      // Lieferauftrag: nächste Tür, Uhr läuft
      if (this.job) {
        const j = this.job, dr = this.doors[j.left[0]];
        j.t -= dt;
        if (Math.hypot(dr.x - p.x, dr.z - p.z) < 2.4 && (!this.riding || this.alt < 2.5)) {
          j.left.shift(); sfx('coin');
          if (!j.left.length) { const pay = 80 + Math.round(j.t) * 2; sv.money += pay; change(sv, { fun: 10 }); sfx('win'); g.hud.banner(`${d.job.icon} ${d.job.name} geschafft!`, `+${pay} € · ${Math.round(j.t)} s übrig`, 'good', 4500); this.quit(); this.hud(); g.save.write(); }
        } else if (j.t <= 0) { sfx('miss'); g.hud.banner(`${d.job.icon} Zu spät`, 'Der Auftrag ist geplatzt. Versuch es noch einmal am Auftragsbrett.', 'bad', 4000); this.quit(); }
        if (this.job) g.hud.gig(`${d.job.icon} ${d.job.name}: ${j.n - j.left.length}/${j.n} · ${Math.ceil(j.t)} s`, j.t < 15);
      }
      // Wegweiser
      const mk: Array<{ id: string; icon: string; label?: string; pos: Vector3 }> = [];
      const hostPos = this.folk[0]?.a.root.position, nTell = this.folk.length - 1, tellNow = st === 3 && this.toldCount() < nTell;
      if (this.job) { const dr = this.doors[this.job.left[0]]; mk.push({ id: 'job', icon: d.job.icon, label: 'Lieferung', pos: new Vector3(dr.x, 2.4, dr.z) }); }
      if (tellNow) { const v = Number(this.flags['w_' + d.id + '_v']) || 0; let best: Folk | null = null, b = 1e9; this.folk.forEach((f, i) => { if (!i || v & (1 << (i - 1))) return; const dd = Math.hypot(f.a.root.position.x - p.x, f.a.root.position.z - p.z); if (dd < b) { b = dd; best = f; } }); const f = best as Folk | null; if (f) mk.push({ id: 'tell', icon: '📣', label: f.d.name, pos: new Vector3(f.a.root.position.x, 2.2, f.a.root.position.z) }); }
      if ((st === 0 || (st === 3 && !tellNow)) && hostPos) mk.push({ id: 'host', icon: '⭐', label: d.host.name, pos: new Vector3(hostPos.x, 2.2, hostPos.z) });
      if (st === 1) { let best: typeof this.items[0] | null = null, b = 1e9; for (const it of this.items) { const dd = Math.hypot(it.x - p.x, it.z - p.z); if (!it.got && dd < b) { b = dd; best = it; } } if (best) mk.push({ id: 'item', icon: d.item.icon, label: best.y > 3 ? 'in der Luft' : undefined, pos: new Vector3(best.x, best.y + .6, best.z) }); }
      if (st === 2 && this.rings[this.ringAt]) { const r = this.rings[this.ringAt]; mk.push({ id: 'ring', icon: '🌈', label: `Ring ${this.ringAt + 1}`, pos: new Vector3(r.x, r.y, r.z) }); }
      if (Math.hypot(this.gate.x - p.x, this.gate.z - p.z) > 12) mk.push({ id: 'gate', icon: '🏙️', label: 'Rainbow City', pos: new Vector3(this.gate.x, 3, this.gate.z) });
      for (const e of this.exits) { const dd = Math.hypot(e.x - p.x, e.z - p.z); if (dd > 5 && dd < 34) mk.push({ id: 'x' + e.to, icon: e.icon, label: e.name, pos: new Vector3(e.x, 3, e.z) }); }
      g.hud.markers(mk, (q) => g.engine.project(q));
    } else { g.hud.prompt(null); g.hud.markers([]); }
    // Flitzer und Figur
    if (this.riding) {
      const bob = Math.sin(t * 3) * .08;
      this.ride.position.set(p.x, this.alt + bob, p.z); this.ride.rotation.y = this.player.root.rotation.y;
      p.y = this.alt + bob - .35;
    } else p.y = 0;
    const fl = this.ride.getChildMeshes().find((m) => m.name === 'flame'); if (fl) { fl.setEnabled(this.riding); fl.scaling.y = .8 + Math.sin(t * 30) * .25; }
    this.shadow.position.set(p.x, .03, p.z); this.shadow.setEnabled(Math.hypot(p.x, p.z) < R);
    const st2 = g.save.data.settings;
    this.cam.update(dt, this.camera, p, this.player.root.rotation.y, { look: inp.look, move: inp.move, speed: st2.camSpeed, invertY: st2.invertY, busy, portrait: g.engine.aspect < 1, lift: this.riding ? this.alt - .35 : 0 });
    // Kamera nicht in Häusern: an die Figur heranrücken
    const cp = this.camera.position;
    for (let i = 0; i < 8 && cp.y < 16 && this.rects.some((r) => Math.abs(cp.x - r.x) < r.hx + .3 && Math.abs(cp.z - r.z) < r.hz + .3); i++) { cp.x += (p.x - cp.x) * .25; cp.z += (p.z - cp.z) * .25; cp.y += (p.y + 1.6 - cp.y) * .25; }
  }
}
