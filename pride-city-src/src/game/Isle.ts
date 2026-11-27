/* Eine Welt als echte Insel in Rainbow City (nahtlos, ohne Szenenwechsel): derselbe Ortskern, dieselben Leute, Aufgaben
   und Aufträge wie in WorldScene, aber gebaut in die Stadtszene und über eine Brücke vom Kai aus erreichbar. Gelaufen,
   gefahren und geflogen wird mit der Figur und den Fahrzeugen der Stadt; hier liegen nur Aufbau und Geschichte.
   Alles rechnet in Inselkoordinaten (Tor im Süden = +z); die Insel ist gedreht, ihr Süden zeigt zur Stadt. */
import { stranger } from './flirt';
import { Vector3, Mesh, Node3, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { instance } from '../engine/Assets';
import { PLACE_THEMES, HOUSE_THEMES, houseTheme, type Theme } from './interiors';
import { Actor } from './Actor';
import type { Game } from './Game';
import type { World } from './World';
import { extraWalk, landWalk, CAR_FILE } from './World';
import { toast } from '../ui/ui';
import { isleVia } from './faden';
import type { Marker } from '../ui/Hud';
import { change } from './life';
import { sfx } from '../engine/Audio';
import { worldStage, townFree, neighbour, SLOTS, SHOP_SLOTS, SIDE_GATE, QUAY_X, ISLES, type Kit, type WorldDef, type WorldNpc } from './worlds';

interface Folk { a: Actor; d: WorldNpc; host: boolean }
const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];
const S = 5;
type Pt = [number, number];
const COURSE: Array<[number, number, number]> = [[0, 5, 20], [18, 7, 18], [20, 8, 5], [18, 7, -8], [0, 10, -10], [-18, 7, -8], [-20, 8, 5], [0, 15, 5]];
const WALKERS: Array<[string, string]> = [['Male_Adult_01', 'regenbogen'], ['Female_Adult_02', 'lesbisch'], ['Male_Adult_08', 'bear'], ['Female_Adult_04', 'trans'], ['Sports_Male_01', 'crop'], ['Female_Adult_08', 'pan']];
const SIDEWALK: Pt[] = [[24.4, 24.4], [24.4, -14.4], [-24.4, -14.4], [-24.4, 24.4]];
const LANE = 2.6;
const LANES: Pt[][] = [
  [[20 + LANE, 20 + LANE], [20 + LANE, -10 - LANE], [-20 - LANE, -10 - LANE], [-20 - LANE, 20 + LANE]],
  [[20 - LANE, -10 + LANE], [20 - LANE, 20 - LANE], [-20 + LANE, 20 - LANE], [-20 + LANE, -10 + LANE]],
];
const turn = (now: number, to: number, k: number) => { const d = Math.atan2(Math.sin(to - now), Math.cos(to - now)); return now + d * Math.min(1, k); };
const nice = (t: string) => t.toLowerCase().replace(/(^|[\s\-&])\p{L}/gu, (c) => c.toUpperCase());

/** feine Körnung für Boden und Pflaster (kachelbar), pave = mit Fugen */
function speck(sc: Scene, pave: boolean) {
  const t = canvasTex(sc, 128, 128, (g2) => {
    g2.fillStyle = '#fff'; g2.fillRect(0, 0, 128, 128);
    let n = 99; const r = () => (n = (n * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) { const v = r(); g2.fillStyle = v < .5 ? `rgba(0,0,0,${.03 + r() * .09})` : `rgba(255,255,255,${.1 + r() * .2})`; const q = 1 + r() * (pave ? 2 : 5); g2.fillRect(r() * 128, r() * 128, q, q); }
    if (pave) { g2.strokeStyle = 'rgba(0,0,0,.28)'; g2.lineWidth = 2; for (let i = 0; i <= 2; i++) { g2.beginPath(); g2.moveTo(0, i * 64); g2.lineTo(128, i * 64); g2.stroke(); } for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const x = i * 64 + j * 32; g2.beginPath(); g2.moveTo(x, j * 64); g2.lineTo(x, j * 64 + 64); g2.stroke(); } }
  });
  t.wrapU = t.wrapV = 1;
  return t;
}

/** Lage der Figur für die Insel: Ort, im Fahrzeug, Flughöhe */
/** Nachbarinsel, an der die Brücke ansetzt */
export interface IsleLink { x: number; z: number; r: number; icon: string; name: string; color: string }
export interface IsleRef { x: number; z: number; driving: boolean; alt: number; busy: boolean; gig: boolean }

export class Isle {
  readonly root: Node3;
  /** Figur ist auf der Insel (Anzeige oben, Wegweiser) */
  active = false;
  private ex: Pt = [0, 1];
  private ez: Pt = [1, 0];
  private R: number;
  /** Brückenlänge vom Inselrand bis zum Kai bzw. ein Stück auf die Nachbarinsel; gap = offenes Wasser */
  readonly L: number;
  private gap: number;
  private folk: Folk[] = [];
  private peopleAsked = false;
  private solids: Array<{ x: number; z: number; r: number }> = [];
  private items: Array<{ m: Mesh; x: number; y: number; z: number; got: boolean }> = [];
  private rings: Array<{ m: Mesh; x: number; y: number; z: number }> = [];
  private ringOn!: PBRMaterial; private ringOff!: PBRMaterial;
  private ringAt = 0;
  private doors: Array<{ x: number; z: number; yaw: number; label: string; theme: Theme; place: string }> = [];
  private cars: Array<{ o: Node3; path: Pt[]; seg: number; u: number; v: number }> = [];
  private parked: Node3[] = [];
  private walkers: Array<{ a: Actor; path: Pt[]; seg: number; u: number; halt: boolean }> = [];
  private job: { left: number[]; t: number; n: number } | null = null;
  private jobPad: Pt = [5, 13.6];
  private exits: Array<{ x: number; z: number; to: string; icon: string; name: string; arrive: 'west' | 'east' }> = [];
  private leaving = true;
  private shown = true;
  private lp: Pt = [0, 999];
  private act: (() => void) | null = null;
  /** Startplatz des Flitzers (Welt) */
  pad: Pt = [0, 0];

  /** link: Nachbarinsel, an die diese Insel per Brücke angehängt ist (sonst Brücke zum Kai der Stadt) */
  constructor(private g: Game, private sc: Scene, private W: World, readonly def: WorldDef, readonly ox: number, readonly oz: number, readonly link?: IsleLink) {
    this.R = def.r;
    const dx = link ? link.x - ox : 1, dz = link ? link.z - oz : 0;
    this.gap = link ? Math.hypot(dx, dz) - def.r - link.r : QUAY_X - (ox + def.r);
    this.L = link ? this.gap + 4 : this.gap;
    // Insel so drehen, dass ihr Süden (Brückentor, +z) zur Stadt bzw. zur Nachbarinsel zeigt (Vielfache von 90°)
    this.root = new Node3('isle_' + def.id, sc); this.root.position.set(ox, .06, oz);
    const o = new Vector3(ox, .06, oz), axes = () => {
      this.root.computeWorldMatrix(true); const m = this.root.getWorldMatrix();
      const a = Vector3.TransformCoordinates(new Vector3(1, 0, 0), m).subtract(o), b = Vector3.TransformCoordinates(new Vector3(0, 0, 1), m).subtract(o);
      this.ex = [Math.round(a.x), Math.round(a.z)]; this.ez = [Math.round(b.x), Math.round(b.z)];
    };
    this.root.rotation.y = Math.round(Math.atan2(dx, dz) / (Math.PI / 2)) * (Math.PI / 2); axes();
    if (this.ez[0] * dx + this.ez[1] * dz < 0) { this.root.rotation.y += Math.PI; axes(); }
  }
  /** Insel → Stadt */
  w(lx: number, lz: number): Pt { return [this.ox + lx * this.ex[0] + lz * this.ez[0], this.oz + lx * this.ex[1] + lz * this.ez[1]]; }
  /** Stadt → Insel */
  l(x: number, z: number): Pt { const dx = x - this.ox, dz = z - this.oz; return [dx * this.ex[0] + dz * this.ex[1], dx * this.ez[0] + dz * this.ez[1]]; }
  yawW(a: number) { const s = Math.sin(a), c = Math.cos(a); return Math.atan2(s * this.ex[0] + c * this.ez[0], s * this.ex[1] + c * this.ez[1]); }
  /** Brücke in Stadtkoordinaten (Inselrand, anderes Ende) für die Karten */
  bridge(): [Pt, Pt] { return [this.w(0, this.R), this.w(0, this.R + this.L)]; }
  /** Grundriss der Ringstraße in Stadtkoordinaten (Karten) */
  ring(): [number, number, number, number] { const a = this.w(-20, -10), b = this.w(20, 20); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])]; }
  /** 18+-Insel ohne 18+: unsichtbar, nicht begehbar */
  get locked() { return !!this.def.adult && !this.g.save.data.settings.adult; }
  private get flags() { return this.g.save.data.flags; }
  private get stage() { return worldStage(this.flags, this.def.id); }
  private setStage(n: number) { this.flags['w_' + this.def.id] = n; this.g.save.write(); this.showQuest(); }
  /** Ankunft: am Brückentor oder an einem der Seitentore (Platz und Blick in Stadtkoordinaten) */
  arrival(arrive: 'city' | 'west' | 'east') {
    const [lx, lz, a] = arrive === 'city' ? [0, this.R - 10, Math.PI] : [(arrive === 'west' ? -1 : 1) * (SIDE_GATE.x - 3.2), SIDE_GATE.z + .2, arrive === 'west' ? Math.PI / 2 : -Math.PI / 2];
    const [x, z] = this.w(lx, lz); return { x, z, yaw: this.yawW(a) };
  }

  async build() {
    const sc = this.sc, d = this.def, R = this.R, L = this.L, root = this.root;
    const own: Mesh[] = [];
    const isle = cyl(sc, R, R + 3, 1.4, 48); isle.position.y = -.7; own.push(isle);
    { const m = pbr(sc, d.ground, .95), t = speck(sc, false); t.uScale = t.vScale = R / 3; m.albedoTexture = t; isle.material = m; }
    const shore = cyl(sc, R + 3, R + 7, .5, 48); shore.material = pbr(sc, 0xfff1c9, 1); shore.position.y = -.28; own.push(shore);

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
        const m = planeZ(sc, w, w * 96 / 512); m.material = glow(sc, 0xffffff, 1.6, { tex }); m.position.set(x, y, z); m.rotation.y = ry; m.isPickable = false; own.push(m);
      },
      solid: (x, z, r) => { this.solids.push({ x, z, r }); },
      rnd: () => (seed = (seed * 16807) % 2147483647) / 2147483647,
      free: (x, z, pad = 1) => Math.hypot(x, z) < R - 2 && !(Math.abs(x) < 6 + pad && z > 24) && townFree(x, z, pad) && this.solids.every((q) => Math.hypot(q.x - x, q.z - z) > q.r + pad),
    };
    const rects = await this.buildTown(kit, own);
    d.build(kit);
    // Brücke zum Kai: Fahrbahn, Regenbogen-Geländer, Laternenkugeln; am Inselufer das Tor mit dem Namen
    const deck = kit.M(0x8d8799, .9), post = kit.M(0xffffff, .5), G = this.gap, lk = this.link;
    kit.box(10.6, .3, L + 6, deck, 0, -.17, R + L / 2 - 1);
    for (const s of [-1, 1]) {
      RAINBOW.forEach((c, i) => kit.box(.12, .1, G + 3, kit.G(c, 1.1), s * 5.1, .35 + i * .13, R + G / 2 - .5));
      for (let z = R - 1; z <= R + G; z += 5) { kit.box(.22, 1.5, .22, post, s * 5.1, .7, z); kit.ball(.2, kit.G(0xffe2a8, 1.6), s * 5.1, 1.6, z); }
    }
    RAINBOW.forEach((c, i) => kit.arc(4.2 - i * .22, .13, kit.G(c, 1.1), 0, 0, R - 6));
    kit.sign(`${d.icon} ${d.name.toUpperCase()}`, d.host.color, 0, 5.2, R - 5.9, 0, 6.4);
    kit.sign(lk ? `${lk.icon} ${lk.name.toUpperCase()}` : 'RAINBOW CITY', lk ? lk.color : '#ffffff', 0, 5.2, R - 6.1, Math.PI, 5.4);
    // auf der Nachbarinsel: Bogen mit Wegweiser zu dieser Insel
    if (lk) { RAINBOW.forEach((c, i) => kit.arc(4.2 - i * .22, .13, kit.G(c, 1.1), 0, 0, R + G + 2)); kit.sign(`${d.icon} ${d.name.toUpperCase()}`, d.host.color, 0, 5.2, R + G + 2.1, 0, 6.4); }
    // Seitentore zu den Nachbarwelten (noch als Tor, bis auch sie Inseln sind)
    for (const sx of [-1, 1] as const) {
      const nb = neighbour(d.id, sx, true); if (!nb || nb.id === d.id || ISLES[nb.id]) continue;   // Inseln erreicht man über ihre Brücken
      const x = sx * SIDE_GATE.x, z = SIDE_GATE.z, c = parseInt(nb.host.color.slice(1), 16);
      for (let i = 0; i < 3; i++) kit.arc(2.5 - i * .22, .12, kit.G(i === 1 ? 0xffffff : c, 1.1), x, 0, z, Math.PI / 2);
      kit.cyl(2.9, 3.1, .14, kit.M(0xffffff, .5), x, .07, z, 20);
      kit.sign(`${nb.icon} ${nb.name.toUpperCase()}`, nb.host.color, x - sx * .15, 3.3, z, -sx * Math.PI / 2, 5.2);
      this.exits.push({ x, z, to: nb.id, icon: nb.icon, name: nb.name, arrive: sx < 0 ? 'east' : 'west' });
    }
    const padL: Pt = [8.5, R - 12]; this.pad = this.w(padL[0], padL[1]);
    kit.cyl(1.6, 1.7, .12, kit.G(0xff4fa3, .9), padL[0], .06, padL[1], 20);
    for (const [mt, list] of parts) {
      for (const m of list) m.computeWorldMatrix(true);
      let merged: Mesh | null = null;
      if (list.length > 1) try { merged = Mesh.MergeMeshes(list, true, true); } catch { /* einzeln lassen */ }
      if (merged) { merged.material = mt; own.push(merged); } else own.push(...list);
    }
    // Stellen mit Wirkung
    { const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 }); for (const sp of d.spots || []) { const o = torus(sc, .5, .06, 24); o.material = ringM; o.position.set(sp.x, .05, sp.z); own.push(o); } }
    // Auftragsbrett
    { const o = torus(sc, .7, .07, 24); o.material = glow(sc, 0x5ce1ff, 1.3, { alpha: .7 }); o.position.set(this.jobPad[0], .14, this.jobPad[1]); own.push(o); }
    for (const m of own) { m.parent = root; m.isPickable = false; m.computeWorldMatrix(true); m.freezeWorldMatrix(); }
    // Sammelstücke und Flugringe (bewegen sich, bleiben einzeln)
    const im = glow(sc, d.item.color, 1.4), free = (x: number, z: number) => kit.free(x, z, 1.2);
    for (let i = 0; i < d.item.n; i++) {
      let x = 0, z = 0;
      for (let t = 0; t < 30; t++) { const a = (i / d.item.n) * Math.PI * 2 + kit.rnd() * .6, dist = 9 + kit.rnd() * (R - 16); x = Math.sin(a) * dist; z = Math.cos(a) * dist; if (free(x, z)) break; }
      const m = cyl(sc, 0, .42, .55, 4); m.material = im; const b = cyl(sc, .42, 0, .55, 4); b.material = im; b.position.y = -.55; b.parent = m; m.isPickable = false; b.isPickable = false;
      const y = i % 3 === 2 ? 6.5 + (i % 2) * 2.5 : 1.3; m.position.set(x, y, z); m.parent = root;
      this.items.push({ m, x, y, z, got: false });
    }
    this.ringOn = glow(sc, 0xffffff, 1.5); this.ringOff = glow(sc, 0xffffff, .9, { alpha: .28 });
    COURSE.forEach(([x, y, z], i) => {
      const n = COURSE[Math.min(i + 1, COURSE.length - 1)], b = COURSE[Math.max(i - 1, 0)];
      const m = torus(sc, 2.6, .2, 28); m.rotation.set(Math.PI / 2, Math.atan2(n[0] - b[0], n[2] - b[2]), 0); m.position.set(x, y, z); m.material = this.ringOff; m.isPickable = false; m.parent = root;
      this.rings.push({ m, x, y, z });
    });
    // Kollision und begehbare Fläche in der Stadt anmelden
    const swap = Math.abs(this.ez[0]) > .5;
    for (const r of rects) { const [x, z] = this.w(r.x, r.z); this.W.colliders.push({ x, z, hx: swap ? r.hz : r.hx, hz: swap ? r.hx : r.hz }); }
    for (const q of this.solids) { const [x, z] = this.w(q.x, q.z); this.W.prop(x, z, q.r, []); }
    extraWalk.push((x, z) => { if (this.locked) return false; const [lx, lz] = this.l(x, z); return Math.hypot(lx, lz) < R - 1.2 || (Math.abs(lx) < 4.6 && lz > 0 && lz < R + L + 1); });
    landWalk.push((x, z) => { const [lx, lz] = this.l(x, z); return Math.hypot(lx, lz) < R + 1; });
    this.showQuest();
  }

  /** Ortskern aus dem Bausatz der Stadt (wie WorldScene.buildTown), liefert die Grundflächen der Häuser */
  private async buildTown(kit: Kit, own: Mesh[]) {
    const sc = this.sc, d = this.def, W = this.W, root = this.root, rects: Array<{ x: number; z: number; hx: number; hz: number }> = [];
    const put = async (name: string, x: number, y: number, z: number, rot: number, flat = false) => {
      const o = await instance(sc, 'city/' + name + '.gltf', { shadows: false });
      W.tune(name, o); o.parent = root; o.position.set(x, y, z); o.rotation.y = rot; o.scaling.set(S, flat ? 1 : S, S);
      o.getChildMeshes().forEach((m) => { m.computeWorldMatrix(true); m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; m.isPickable = false; });
      return o;
    };
    const jobs: Promise<unknown>[] = [];
    for (const x of [-10, 0, 10]) jobs.push(put(x ? 'road_straight' : 'road_straight_crossing', x, 0, 20, Math.PI / 2, true), put('road_straight', x, 0, -10, Math.PI / 2, true));
    for (const z of [0, 10]) for (const x of [-20, 20]) jobs.push(put('road_straight', x, 0, z, 0, true));
    jobs.push(put('road_corner', 20, 0, 20, Math.PI, true), put('road_corner', 20, 0, -10, -Math.PI / 2, true), put('road_corner', -20, 0, 20, Math.PI / 2, true), put('road_corner', -20, 0, -10, 0, true));
    // Zufahrt von der Brücke bis zum Ring
    for (const z of [30, 40, 50, 60]) jobs.push(put('road_straight', 0, 0, z, 0, true));
    const bulb = kit.G(0xffe2a8, 1.6);
    for (const [x, z, alongZ] of [[-10, 20, 0], [10, 20, 0], [-10, -10, 0], [10, -10, 0], [20, 0, 1], [20, 10, 1], [-20, 0, 1], [-20, 10, 1]]) {
      const lx = alongZ ? x + 4.4 : x, lz = alongZ ? z : z + 4.4;
      jobs.push(put('streetlight', lx, .1, lz, alongZ ? Math.PI : -Math.PI / 2));
      kit.ball(.2, bulb, lx - (alongZ ? 1.05 : 0), 4.55, lz - (alongZ ? 0 : 1.05)); kit.solid(lx, lz, .3);
    }
    for (const [n, x, z, r] of [['bench', -14, 10, Math.PI / 2], ['bench', 14, 0, -Math.PI / 2], ['firehydrant', 24.3, 5, 0], ['firehydrant', -24.3, -5, 0], ['trash_A', 24.4, 15, 0], ['trash_A', -24.4, 5, 0], ['trash_A', 8, 24.6, 0], ['bush', -24.4, 15, 0], ['bush', 24.4, -5, 0], ['bush', -8, 24.6, 0], ['dumpster', -25.6, -25.6, 0], ['dumpster', 25.6, 35.4, 0], ['bush', -6.4, 30, 0], ['bush', 6.4, 30, 0], ['bench', -6.4, 36, Math.PI / 2], ['bench', 6.4, 36, -Math.PI / 2]] as Array<[string, number, number, number]>) {
      jobs.push(put(n, x, .1, z, r)); kit.solid(x, z, n === 'bench' || n === 'dumpster' ? .9 : .4);
    }
    const houses: Array<{ o: Awaited<ReturnType<typeof instance>>; i: number }> = [];
    SLOTS.forEach(([x, z, rot], i) => {
      jobs.push(put('base', x, 0, z, 0, true));
      jobs.push(put('building_' + 'ABCDEFGH'[(i * 5 + d.id.length) % 8], x, .1, z, rot).then((o) => { houses.push({ o, i }); }));
      rects.push({ x, z, hx: 4.2, hz: 4.2 });
    });
    const car = async (kind: string) => {
      const inner = await instance(sc, 'cars/' + (CAR_FILE[kind] || 'sedan') + (this.g.engine.mobile ? '_lo' : '') + '.glb', { shadows: false });
      const o = new Node3(kind, sc); inner.parent = o; inner.position.y = -.027; o.parent = root; o.position.y = .1;
      return o;
    };
    ['car_taxi', 'car_sedan', 'car_hatchback'].slice(0, this.g.engine.mobile ? 2 : 3).forEach((kind, i) => jobs.push(car(kind).then((o) => { this.cars.push({ o, path: LANES[i % 2], seg: i % 4, u: .2 + i * .15, v: 6 + (i % 3) }); })));
    (d.town.parked || []).forEach(([x, z, yaw], i) => jobs.push(car(['car_sedan', 'car_hatchback', 'car_stationwagon'][i % 3]).then((o) => { o.position.set(x, .1, z); o.rotation.y = yaw; this.parked[i] = o; this.solids.push({ x, z, r: 1.7 }); })));
    await Promise.all(jobs);
    // Fassadenfarbe je Haus (Farbe je Instanz, wie World.paintHouses)
    const C4 = sc.clearColor.constructor as new (r: number, g: number, b: number, a: number) => never;
    for (const { o, i } of houses) for (const m of o.getChildMeshes()) {
      const sm = (m as unknown as { sourceMesh?: Mesh }).sourceMesh; if (!sm) continue;
      if (!sm.instancedBuffers?.color) { sm.registerInstancedBuffer('color', 4); sm.instancedBuffers.color = new C4(1, 1, 1, 1); for (const im of sm.instances) if (!im.instancedBuffers.color) im.instancedBuffers.color = new C4(1, 1, 1, 1); }
      const t = d.town.tint[i % d.town.tint.length]; (m as unknown as { instancedBuffers: Record<string, unknown> }).instancedBuffers.color = new C4(t[0], t[1], t[2], 1);
    }
    const dark = kit.M(0x0a0618, .6);
    SLOTS.forEach(([x, z, rot], i) => {
      const fx = Math.round(Math.sin(rot)), fz = Math.round(Math.cos(rot)), si = SHOP_SLOTS.indexOf(i), shop = si >= 0 ? d.town.shops[si] : undefined;
      let theme = houseTheme(i + d.id.length * 3, false), place = '';
      if (shop) {
        const th = PLACE_THEMES[shop[2]] || HOUSE_THEMES.find((t) => t.id === shop[2]);
        if (th) { theme = { ...th, title: nice(shop[0]) }; place = PLACE_THEMES[shop[2]] ? shop[2] : ''; }
        kit.box(5.6, 1.25, .1, dark, x + fx * 4.12, 5.6, z + fz * 4.12, rot); kit.sign(shop[0], shop[1], x + fx * 4.2, 5.6, z + fz * 4.2, rot, 5.2);
        for (const sy of [-.68, .68]) kit.box(5.7, .07, .12, kit.G(parseInt(shop[1].slice(1), 16), 1.3), x + fx * 4.16, 5.6 + sy, z + fz * 4.16, rot);
      }
      this.doors.push({ x: x + fx * 5, z: z + fz * 5, yaw: rot, label: `🚪 ${theme.icon} ${theme.title}`, theme, place });
    });
    { const m = pbr(sc, d.town.plaza, .85), t = speck(sc, true); t.uScale = 15; t.vScale = 10; m.albedoTexture = t; const pl = box(sc, 30, .1, 20); pl.material = m; pl.position.set(0, .03, 5); own.push(pl); }
    return rects;
  }

  /** Leute erst laden, wenn man sich der Insel nähert (kurzer Start, wenig Speicher am Handy) */
  private async people() {
    const sc = this.sc, d = this.def;
    const all: Array<[WorldNpc, boolean]> = [[d.host, true], ...d.folk.map((f) => [f, false] as [WorldNpc, boolean])];
    const nWalk = this.g.engine.mobile ? 3 : WALKERS.length;
    const [actors, strollers] = await Promise.all([
      Promise.all(all.map(([n]) => Actor.create(sc, { body: n.rb, rb: n.rb, palette: 'rainbow', skin: 0 }))),
      Promise.all(WALKERS.slice(0, nWalk).map(([rb, style]) => Actor.create(sc, { body: rb, rb, palette: 'rainbow', skin: 0, style }))),
    ]);
    strollers.forEach((a, i) => {
      const path = i % 2 ? [...SIDEWALK].reverse() : SIDEWALK;
      a.root.parent = this.root; a.play('walk', 0, .72); this.walkers.push({ a, path, seg: i % 4, u: .15 + i * .13, halt: false });
    });
    actors.forEach((a, i) => {
      const [n, host] = all[i];
      a.root.parent = this.root; a.root.position.set(n.x, 0, n.z); a.root.rotation.y = n.yaw ?? Math.atan2(-n.x, -n.z);
      a.play(n.anim || 'idle', 0, .95); this.folk.push({ a, d: n, host });
      const [x, z] = this.w(n.x, n.z); this.W.prop(x, z, .45, []);
    });
    this.W.castShadows();
    this.showQuest();
  }

  private toldCount() { let v = Number(this.flags['w_' + this.def.id + '_v']) || 0, c = 0; for (; v; v >>= 1) c += v & 1; return Math.min(c, Math.max(0, this.folk.length - 1)); }
  private left() { return this.items.filter((i) => !i.got).length; }
  private showQuest() {
    const st = this.stage, got = Number(this.flags['w_' + this.def.id + '_n']) || 0;
    this.items.forEach((it, i) => { it.got = st !== 1 || !!(got & (1 << i)); it.m.setEnabled(!it.got); });
    this.rings.forEach((r, i) => { r.m.setEnabled(st === 2); r.m.material = i === this.ringAt ? this.ringOn : this.ringOff; });
    if (st >= 4) for (const f of this.folk) if (!f.host && f.d.anim !== 'sit') f.a.play(['dance1', 'dance2', 'dance3'][this.folk.indexOf(f) % 3] as 'dance1');
  }
  /** Ziel für die Anzeige oben, solange man auf der Insel ist */
  goal(): [string, string, string] {
    const d = this.def, st = this.stage, n = Math.max(0, this.folk.length - 1), told = this.toldCount();
    return [`${d.icon} ${d.name}`, st === 0 ? `Sprich mit ${d.host.name}` : st === 1 ? `${d.item.icon} ${d.item.n - this.left()}/${d.item.n} ${d.item.name} sammeln` : st === 2 ? `🌈 Ring ${this.ringAt + 1}/${this.rings.length} über der Ringstraße` : st === 3 ? (told < n ? `📣 Allen Bescheid sagen (${told}/${n})` : `Zurück zu ${d.host.name}`) : 'Geschafft: Läden, Aufträge und Leute',
      st === 2 ? 'Mit dem Flitzer: Turbo halten = steigen' : st >= 4 ? `${d.job.icon} ${d.job.name} am Auftragsbrett auf dem Platz` : ''];
  }

  private talk(f: Folk) {
    const g = this.g, s = g.save.data, d = this.def, say = (lines: string[], done?: () => void) => g.dialog.say(lines.map((text) => ({ who: f.d.name, color: f.d.color, text })), done);
    f.a.root.rotation.y = Math.atan2(this.lp[0] - f.a.root.position.x, this.lp[1] - f.a.root.position.z);
    const st = this.stage, n = this.folk.length - 1, vk = 'w_' + d.id + '_v', hud = () => g.city.refreshHud();
    if (!f.host) {
      const ls = f.d.lines || ['Hallo!'], bit = 1 << (this.folk.indexOf(f) - 1), news = st === 3 && !((Number(s.flags[vk]) || 0) & bit);
      say(news ? [ls[s.day % ls.length], 'Oh, das sind gute Neuigkeiten. Ich bin dabei!'] : [ls[s.day % ls.length]], () => {
        if (!news) return;
        s.flags[vk] = (Number(s.flags[vk]) || 0) | bit; sfx('ok'); g.save.write();
        const c = this.toldCount();
        if (c >= n) g.hud.banner('📣 Alle wissen Bescheid!', `Zurück zu ${d.host.name}`, 'good', 4000); else toast(`📣 ${c}/${n} wissen Bescheid`);
        hud();
      });
      const k = 'visit_' + f.d.name; if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 8, fun: 4 }); hud(); }
      return;
    }
    if (st === 0) say([...(isleVia(s, d.id) ? [isleVia(s, d.id)!] : []), ...d.host.intro, d.host.ask1], () => { this.setStage(1); hud(); toast(`${d.item.icon} Aufgabe: ${d.item.n} ${d.item.name} sammeln`); });
    else if (st === 1) say([d.host.ask1, `Es fehlen noch ${this.left()}.`]);
    else if (st === 2) say([d.host.ask2, 'Der Flitzer steht am Brückentor bereit.']);
    else if (st === 3 && this.toldCount() < n) say([d.host.ask3, `Es fehlen noch ${n - this.toldCount()}.`]);
    else if (st === 3) say(d.host.finale, () => { s.money += d.pay[2]; change(s, { fun: 30, social: 20 }); sfx('win'); this.setStage(4); hud(); g.hud.banner(`${d.icon} ${d.name} geschafft!`, `+${d.pay[2]} € · Die Insel feiert dich.`, 'good', 5000); });
    else say([d.host.after[s.day % d.host.after.length]]);
  }

  private startJob() {
    const d = this.def, ids = this.doors.map((_, i) => i), left: number[] = [];
    for (let i = 0; i < 5; i++) left.push(ids.splice(Math.floor(Math.random() * ids.length), 1)[0]);
    this.job = { left, t: 95, n: left.length }; sfx('open');
    this.g.hud.banner(`${d.job.icon} ${d.job.name}`, d.job.text, 'info', 4200);
  }
  private quit() { if (this.job) { this.job = null; this.g.hud.gig(null); } }

  private traffic(dt: number, t: number, low: boolean, onFoot: boolean) {
    const [px, pz] = this.lp;
    for (const c of this.cars) {
      const n = c.path.length, a = c.path[c.seg], b = c.path[(c.seg + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ax = (b[0] - a[0]) / len, az = (b[1] - a[1]) / len, q = c.o.position;
      const ahead = (x: number, z: number, reach: number, wide: number) => { const dx = x - q.x, dz = z - q.z, along = dx * ax + dz * az; return along > 0 && along < reach && Math.abs(dx * az - dz * ax) < wide; };
      let v = c.v;
      if (low && ahead(px, pz, 9, 2.4)) v = 0;
      for (const o of this.cars) if (o !== c && ahead(o.o.position.x, o.o.position.z, 7.5, 1.8)) v = 0;
      c.u += v * dt / len; if (c.u >= 1) { c.u = 0; c.seg = (c.seg + 1) % n; }
      const a2 = c.path[c.seg], b2 = c.path[(c.seg + 1) % n];
      q.x = a2[0] + (b2[0] - a2[0]) * c.u; q.z = a2[1] + (b2[1] - a2[1]) * c.u;
      c.o.rotation.y = turn(c.o.rotation.y, Math.atan2(b2[0] - a2[0], b2[1] - a2[1]), dt * 5);
    }
    if (this.def.adult && this.parked[0]) this.parked[0].rotation.z = Math.sin(t * 7) * .012;
    for (const w of this.walkers) {
      const r = w.a.root, a = w.path[w.seg], b = w.path[(w.seg + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const halt = onFoot && Math.hypot(px - r.position.x, pz - r.position.z) < 1.3;
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

  /** je Bild aus der Stadt: Verkehr, Leute, Sammeln, Ringe, Auftrag, Übergänge */
  update(dt: number, t: number, ref: IsleRef) {
    const g = this.g, d = this.def, R = this.R, lp = this.lp = this.l(ref.x, ref.z), dist = Math.hypot(lp[0], lp[1]);
    const show = dist < (g.engine.mobile ? 200 : 260) && !this.locked;
    if (show !== this.shown) { this.shown = show; this.root.setEnabled(show); }
    this.act = null; this.label = null;
    if (!show) { this.active = false; return; }
    if (!this.peopleAsked && dist < R + 70) { this.peopleAsked = true; void this.people(); }
    const near = dist < R + 60;
    if (near) { this.traffic(dt, t, !ref.driving || ref.alt < 3, !ref.driving); for (const f of this.folk) f.a.update(dt); }
    for (const it of this.items) if (!it.got) { it.m.rotation.y = t * 1.6; it.m.position.y = it.y + Math.sin(t * 2 + it.x) * .18; }
    const was = this.active; this.active = dist < R + 1;
    if (this.active && !was && !ref.busy) { g.hud.banner(`${d.icon} ${d.name}`, d.sub, 'info', 3600); g.city.refreshHud(); }
    if (!this.active && was) { this.quit(); g.city.refreshHud(); }
    if (!this.active || ref.busy) return;
    const sv = g.save.data, [px, pz] = lp, low = !ref.driving || ref.alt < 3, st = this.stage, py = ref.driving && ref.alt > 1 ? ref.alt : 1;
    // Seitentore zu den Nachbarwelten
    { let go: (() => void) | null = null; for (const e of this.exits) if (low && Math.hypot(e.x - px, e.z - pz) < 1.5) go = () => g.enterWorld(e.to, e.arrive); if (go && !this.leaving) go(); this.leaving = !!go; }
    if (st === 1) for (const [i, it] of this.items.entries()) {
      if (it.got || Math.hypot(it.x - px, it.z - pz) > 1.9 || Math.abs(it.y - py) > 2.4) continue;
      it.got = true; it.m.setEnabled(false); sfx('coin');
      this.flags['w_' + d.id + '_n'] = (Number(this.flags['w_' + d.id + '_n']) || 0) | (1 << i);
      const left = this.left();
      if (left) toast(`${d.item.icon} ${d.item.n - left}/${d.item.n} ${d.item.name}`);
      else { sv.money += d.pay[0]; sfx('win'); this.ringAt = 0; this.setStage(2); g.hud.banner(`${d.item.icon} Alle ${d.item.name} gefunden!`, `+${d.pay[0]} € · Nächste Aufgabe: mit dem Flitzer durch die Ringe`, 'good', 4500); }
      g.city.refreshHud();
    }
    if (st === 2) { const r = this.rings[this.ringAt]; if (r && Math.hypot(r.x - px, r.z - pz) < 2.8 && Math.abs(r.y - py) < 2.6) {
      this.ringAt++; sfx('ok');
      if (this.ringAt >= this.rings.length) { sv.money += d.pay[1]; sfx('win'); this.setStage(3); g.hud.banner('🌈 Alle Ringe geschafft!', `+${d.pay[1]} € · Sag allen Bescheid`, 'good', 4500); }
      else { toast(`🌈 Ring ${this.ringAt}/${this.rings.length}`); this.showQuest(); }
      g.city.refreshHud();
    } }
    // Was ist in Reichweite? (nur zu Fuß; die Stadt zeigt es an und löst es aus)
    if (!ref.driving) {
      let bd = 9;
      for (const f of this.folk) { const dd = Math.hypot(f.a.root.position.x - px, f.a.root.position.z - pz); if (dd < 2.4 && dd < bd) { bd = dd; this.label = (f.host ? '⭐ ' : '💬 ') + f.d.name; this.act = () => this.talk(f); } }
      if (!this.label) for (const w of this.walkers) {
        if (Math.hypot(w.a.root.position.x - px, w.a.root.position.z - pz) > 1.7) continue;
        const st = stranger('isle:' + d.id + ':' + this.walkers.indexOf(w), w.a.avatar.id);
        this.label = '💬 ' + st.name;
        this.act = () => { w.halt = true; w.a.play('talk'); w.a.root.rotation.y = Math.atan2(px - w.a.root.position.x, pz - w.a.root.position.z); g.strangerTalk(st, { actor: w.a, look: { ...w.a.look, outfit: 'clothed' } }, () => { w.halt = false; w.a.play('walk', .2, .72); }); };
        break;
      }
      if (!this.label) for (const sp of d.spots || []) { if (Math.hypot(sp.x - px, sp.z - pz) < (sp.r || 2)) { this.label = sp.label; this.act = () => g.interiorAct(sp); break; } }
      if (!this.label) for (const dr of this.doors) if (Math.hypot(dr.x - px, dr.z - pz) < 1.7) {
        this.label = dr.label;
        this.act = () => { const [x, z] = this.w(dr.x + Math.sin(dr.yaw) * .5, dr.z + Math.cos(dr.yaw) * .5); g.enterInterior(dr.theme, { x, z, yaw: this.yawW(dr.yaw) }, dr.place); };
        break;
      }
      if (!this.label && !this.job && !ref.gig && Math.hypot(this.jobPad[0] - px, this.jobPad[1] - pz) < 1.8) { this.label = `${d.job.icon} Auftrag: ${d.job.name}`; this.act = () => this.startJob(); }
    }
    if (this.job) {
      const j = this.job, dr = this.doors[j.left[0]];
      j.t -= dt;
      if (Math.hypot(dr.x - px, dr.z - pz) < 2.6 && low) {
        j.left.shift(); sfx('coin');
        if (!j.left.length) { const pay = 80 + Math.round(j.t) * 2; sv.money += pay; change(sv, { fun: 10 }); sfx('win'); g.hud.banner(`${d.job.icon} ${d.job.name} geschafft!`, `+${pay} € · ${Math.round(j.t)} s übrig`, 'good', 4500); this.quit(); g.city.refreshHud(); g.save.write(); }
      } else if (j.t <= 0) { sfx('miss'); g.hud.banner(`${d.job.icon} Zu spät`, 'Der Auftrag ist geplatzt. Versuch es noch einmal am Auftragsbrett.', 'bad', 4000); this.quit(); }
      if (this.job) g.hud.gig(`${d.job.icon} ${d.job.name}: ${j.n - j.left.length}/${j.n} · ${Math.ceil(j.t)} s`, j.t < 15);
    }
  }
  /** Einblendung für die Aktionstaste (zu Fuß) */
  label: string | null = null;
  use() { this.act?.(); }

  /** Wegweiser in Stadtkoordinaten */
  markers(): Marker[] {
    if (!this.active) return [];
    const d = this.def, st = this.stage, [px, pz] = this.lp, mk: Marker[] = [];
    const at = (id: string, icon: string, label: string | undefined, lx: number, y: number, lz: number) => { const [x, z] = this.w(lx, lz); mk.push({ id, icon, label, pos: new Vector3(x, y, z) }); };
    const host = this.folk[0], nTell = this.folk.length - 1, tellNow = st === 3 && this.toldCount() < nTell;
    if (this.job) { const dr = this.doors[this.job.left[0]]; at('gig', d.job.icon, 'Lieferung', dr.x, 2.4, dr.z); }
    if (tellNow) { const v = Number(this.flags['w_' + d.id + '_v']) || 0; let best: Folk | null = null, b = 1e9; this.folk.forEach((f, i) => { if (!i || v & (1 << (i - 1))) return; const dd = Math.hypot(f.a.root.position.x - px, f.a.root.position.z - pz); if (dd < b) { b = dd; best = f; } }); const f = best as Folk | null; if (f) at('g', '📣', f.d.name, f.a.root.position.x, 2.2, f.a.root.position.z); }
    if ((st === 0 || (st === 3 && !tellNow)) && host) at('g', '⭐', d.host.name, host.d.x, 2.2, host.d.z);
    if (st === 1) { let best: typeof this.items[0] | null = null, b = 1e9; for (const it of this.items) { const dd = Math.hypot(it.x - px, it.z - pz); if (!it.got && dd < b) { b = dd; best = it; } } if (best) at('g', d.item.icon, best.y > 3 ? 'in der Luft' : undefined, best.x, best.y + .6, best.z); }
    if (st === 2 && this.rings[this.ringAt]) { const r = this.rings[this.ringAt]; at('g', '🌈', `Ring ${this.ringAt + 1}`, r.x, r.y, r.z); }
    for (const e of this.exits) { const dd = Math.hypot(e.x - px, e.z - pz); if (dd > 5 && dd < 34) at('x' + e.to, e.icon, e.name, e.x, 3, e.z); }
    return mk;
  }
}
