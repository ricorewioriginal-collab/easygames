/* Welten: Definition, Bau-Kontext und Streaming (Laden in der Nähe, Freigeben in der Ferne). */
import type { GameApi } from '../core/api.ts';
import { makeRng, strSeed, type Rng } from '../core/rng.ts';
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import type { QualityProfile } from '../engine/renderer.ts';
import type { InteractSystem, Interactable } from '../gameplay/interact.ts';
import { logError } from '../core/log.ts';
import type { Physics, Solid } from './physics.ts';
import { buildGroundCover, Scatter, type TreeKind } from './scatter.ts';
import { type IslandShape, insideDepth, islandColor, maxExtent, type TerrainField } from './terrain.ts';
import { buildFoam, buildTerrainMesh } from './terrainMesh.ts';

export interface Poi { x: number; z: number; name: string; icon: string; y?: number }
export interface Zone { id: string; name: string; x: number; z: number; r: number; theme?: string; combat?: boolean; icon?: string }
export interface WorldDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  shape: IslandShape;
  theme: string;
  chapter: number;               // Story-Kapitel, in dem die Welt zur Geschichte gehört
  spawn: { x: number; z: number; yaw: number };
  pois: Record<string, Poi>;
  zones?: Zone[];
  /** Weltbau – wird beim Laden aufgerufen. */
  build(ctx: WorldCtx): void;
  /** Ferne Silhouette (immer sichtbar). */
  proxy?(b: GeoBuilder, h: (x: number, z: number) => number): void;
  /** Unterirdisch: kein Meer/Himmel. */
  underground?: boolean;
  groundCover?: { grass: number; flowers: number[] };
  vehicles?: import('../gameplay/vehicles.ts').VSpawn[];
}

export interface WorldCtx {
  def: WorldDef;
  api: GameApi;
  rng: Rng;
  b: GeoBuilder;          // statisch, Vertexfarben, schattiert
  glow: GeoBuilder;       // leuchtend (ungeschattet)
  scatter: Scatter;
  root: THREE.Group;
  h(x: number, z: number): number;
  box(x: number, z: number, w: number, d: number, y0: number, y1: number, rot?: number, extra?: Partial<Solid>): Solid;
  circle(x: number, z: number, r: number, y0: number, y1: number, extra?: Partial<Solid>): Solid;
  ramp(x: number, z: number, w: number, d: number, yA: number, yB: number, rot?: number): Solid;
  interact(i: Omit<Interactable, 'tag'>): Interactable;
  add(o: THREE.Object3D): void;
  onUpdate(fn: (dt: number, t: number) => void): void;
  tree(kind: TreeKind, x: number, z: number, s?: number, collide?: boolean): void;
  /** Dach, das ausgeblendet wird, wenn man drinnen ist. */
  addRoof(r: Omit<HouseRoof, 'fade'>): void;
  profile: QualityProfile;
}

export interface LoadedWorld { def: WorldDef; root: THREE.Group; updaters: ((dt: number, t: number) => void)[]; houses: HouseRoof[] }
export interface HouseRoof { x: number; z: number; w: number; d: number; rot: number; y: number; roof: THREE.Object3D; fade: number }

export class WorldManager {
  readonly defs: WorldDef[] = [];
  readonly loaded = new Map<string, LoadedWorld>();
  private proxies = new Map<string, THREE.Object3D>();
  readonly houses: HouseRoof[] = [];
  onLoad: ((w: LoadedWorld) => void) | null = null;
  onUnload: ((id: string) => void) | null = null;
  pending: string | null = null;

  constructor(private scene: THREE.Scene, public field: TerrainField, private physics: Physics, private interact: InteractSystem, private api: () => GameApi, public profile: QualityProfile) { }

  register(d: WorldDef): void {
    this.defs.push(d);
    this.field.add(d.shape);
  }
  byId(id: string): WorldDef | undefined { return this.defs.find(d => d.id === id); }
  /** Welt an einer Position (Insel-Inneres oder knapp davor). */
  worldAt(x: number, z: number, margin = 10): WorldDef | null {
    let best: WorldDef | null = null, bf = -margin;
    for (const d of this.defs) {
      if (d.underground && !(Math.abs(x - d.shape.x) < d.shape.r + 30 && Math.abs(z - d.shape.z) < d.shape.r + 30)) continue;
      const f = insideDepth(d.shape, x, z);
      if (f > bf) { bf = f; best = d; }
    }
    return best;
  }
  zoneAt(x: number, z: number): Zone | null {
    const w = this.worldAt(x, z);
    if (!w?.zones) return null;
    let best: Zone | null = null, bd = Infinity;
    for (const zn of w.zones) { const d = Math.hypot(x - zn.x, z - zn.z); if (d < zn.r && d < bd) { bd = d; best = zn; } }
    return best;
  }
  buildProxies(): void {
    for (const d of this.defs) {
      if (d.underground) continue;
      const b = new GeoBuilder();
      // Grobes Gelände der Insel als Scheibe + Landmarke
      const s = d.shape;
      b.cyl(s.x, -2, s.z, s.r + 1, s.r + 3, 2 + s.height, s.grass, 24);
      for (const l of s.lobes ?? []) b.cyl(l.x, -2, l.z, l.r + 1, l.r + 3, 2 + s.height, s.grass, 20);
      for (const hl of s.hills) if (hl.h > 4) b.cone(hl.x, s.height, hl.z, hl.r * 0.8, hl.h, s.rock, 10);
      try { d.proxy?.(b, this.field.height); } catch (e) { logError('Proxy ' + d.id, e); }
      const m = b.mesh(mats().vc, false);
      m.receiveShadow = false;
      m.name = 'proxy:' + d.id;
      this.proxies.set(d.id, m);
      this.scene.add(m);
    }
  }
  /** Lädt eine Welt sofort (synchron). */
  load(id: string): LoadedWorld | null {
    const ex = this.loaded.get(id);
    if (ex) return ex;
    const def = this.byId(id);
    if (!def) return null;
    const t0 = performance.now();
    const root = new THREE.Group(); root.name = 'world:' + id;
    const updaters: ((dt: number, t: number) => void)[] = [];
    const b = new GeoBuilder(), glow = new GeoBuilder(), scatter = new Scatter();
    const tag = id;
    const P = this.physics;
    const lw: LoadedWorld = { def, root, updaters, houses: [] };
    const ctx: WorldCtx = {
      def, api: this.api(), rng: makeRng(strSeed(id)), b, glow, scatter, root, profile: this.profile,
      h: this.field.height,
      box: (x, z, w, d, y0, y1, rot = 0, extra) => P.box(tag, x, z, w, d, y0, y1, rot, extra),
      circle: (x, z, r, y0, y1, extra) => P.circle(tag, x, z, r, y0, y1, extra),
      ramp: (x, z, w, d, yA, yB, rot = 0) => P.ramp(tag, x, z, w, d, yA, yB, rot),
      interact: i => this.interact.add({ ...i, tag }),
      add: o => root.add(o),
      onUpdate: fn => updaters.push(fn),
      addRoof: r => { const hr: HouseRoof = { ...r, fade: 1 }; lw.houses.push(hr); this.houses.push(hr); root.add(r.roof); },
      tree: (kind, x, z, s = 1, collide = true) => {
        const y = this.field.height(x, z);
        scatter.add(kind, x, y, z, s, (x * 13.37 + z * 7.1) % 6.28, 0.9 + ((x * 3.3 + z) % 1 + 1) % 1 * 0.2);
        if (collide && kind !== 'busch') P.circle(tag, x, z, 0.35 * s, y - 1, y + 3 * s, { noWalk: true });
      }
    };
    try {
      root.add(buildTerrainMesh(def.shape, this.field.height, this.profile.terrainStep));
      if (!def.underground && !def.shape.noSea) root.add(buildFoam(def.shape));
      def.build(ctx);
      if (!b.empty) root.add(b.mesh(mats().vc, this.profile.shadows));
      if (!glow.empty) { const g = glow.mesh(mats().vcGlow, false); g.receiveShadow = false; root.add(g); }
      for (const o of scatter.build(this.profile.shadows)) root.add(o);
      this.groundCover(def, root);
    } catch (e) {
      logError('Weltbau ' + id, e);
    }
    this.scene.add(root);
    this.loaded.set(id, lw);
    const px = this.proxies.get(id); if (px) px.visible = false;
    if (performance.now() - t0 > 60) console.info('[BI2] Welt ' + id + ' gebaut in ' + Math.round(performance.now() - t0) + ' ms');
    this.onLoad?.(lw);
    return lw;
  }
  private groundCover(def: WorldDef, root: THREE.Group): void {
    const gc = def.groundCover ?? { grass: 1, flowers: [0xff6fb5, 0xfff07a, 0xffffff, 0x8fd3ff] };
    const dens = this.profile.foliage * gc.grass;
    if (dens <= 0.01) return;
    const s = def.shape, E = maxExtent(s), rng = makeRng(strSeed(def.id + 'gras'));
    const n = Math.round(E * E * 0.05 * dens);
    const grass: { x: number; y: number; z: number }[] = [], fl: { x: number; y: number; z: number; c: number }[] = [];
    for (let i = 0; i < n && grass.length < 9000; i++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * E, x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
      if (insideDepth(s, x, z) < s.beach + 1) continue;
      const y = this.field.height(x, z);
      const c = islandColor(s, x, z, y, 0);
      if (c !== s.grass && c !== s.grass2) continue;
      const g = this.physics.ground(x, z, y + 0.1);
      if (g.solid) continue;
      if (rng() < 0.12 && gc.flowers.length) fl.push({ x, y, z, c: gc.flowers[Math.floor(rng() * gc.flowers.length)] });
      else grass.push({ x, y, z });
    }
    for (const o of buildGroundCover(grass, fl)) root.add(o);
  }
  unload(id: string): void {
    const w = this.loaded.get(id);
    if (!w) return;
    this.scene.remove(w.root);
    w.root.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.geometry) {
        m.geometry.dispose();
        const mat = m.material as THREE.Material;
        if (mat && (mat as THREE.Material & { userData: Record<string, any> }).userData?.disposeWithWorld) mat.dispose();
      }
    });
    this.physics.removeTag(id);
    this.interact.removeTag(id);
    for (let i = this.houses.length - 1; i >= 0; i--) if (w.houses.includes(this.houses[i])) this.houses.splice(i, 1);
    this.loaded.delete(id);
    const px = this.proxies.get(id); if (px) px.visible = true;
    this.onUnload?.(id);
  }
  /** Streaming: lädt höchstens eine Welt pro Aufruf, damit es nicht ruckelt. */
  stream(x: number, z: number, force = false): void {
    let toLoad: WorldDef | null = null, bestD = Infinity;
    for (const d of this.defs) {
      const s = d.shape, ext = maxExtent(s);
      const dist = Math.max(0, Math.hypot(x - s.x, z - s.z) - ext);
      const near = d.underground ? dist < 40 : dist < 180;
      const far = d.underground ? dist > 120 : dist > 300;
      if (near && !this.loaded.has(d.id) && dist < bestD) { bestD = dist; toLoad = d; }
      if (far && this.loaded.has(d.id)) this.unload(d.id);
    }
    if (toLoad) {
      this.load(toLoad.id);
      if (force) this.stream(x, z, true);
    }
  }
  update(dt: number, t: number): void {
    for (const w of this.loaded.values()) for (const fn of w.updaters) { try { fn(dt, t); } catch (e) { logError('Welt-Update ' + w.def.id, e); } }
  }
}
