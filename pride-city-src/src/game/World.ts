/* Rainbow City – Innenstadt aus KayKit-City-Bausteinen (Babylon.js), ergänzt um Pride-Deko: Regenbogen-Zebrastreifen,
   wehende Flaggen, Wimpelketten, Neon-Schilder, Palmen, fahrende Autos und ein Tag-/Nacht-Himmel. Häuser und Straßen
   sind Instanzen (ein Zeichenaufruf je Bauteil), Materialien werden geteilt. */
import { WORLDS, ISLES, cityGate, cityIsle } from './worlds';
import {
  Node3, Vector3, Color3, HemisphericLight, DirectionalLight, PointLight, ShadowGenerator, ShaderMaterial, Effect, Mesh, VertexData, VertexBuffer,
  Matrix, Quaternion, Scene, PBRMaterial, Texture, TransformNode, type AbstractMesh, col, smoothstep, v3, setQuiet, HDRCubeTexture, RawTexture, type InstancedMesh,
} from '../engine/bjs';
import { instance, preload } from '../engine/Assets';
import { planeZ, ground, box, cyl, sphere, ring, torus, pbr, glow, canvasTex } from '../engine/geo';
import { PALETTES } from './palettes';
import { buildUptown, EAST, BRIDGE, UPTOWN_PLACES, doorStep } from './uptown';
import { NODES, LANE, lane, nearestEdge } from './traffic';
import { pixels, remember, breathe } from './texpix';

export const TILE = 10;
const S = TILE / 2; // KayKit-Kacheln sind 2 Einheiten breit
const N = 6;        // Kacheln von der Mitte bis zum Rand
export const HALF = N * TILE + TILE / 2;

const C = (n: string) => 'city/' + n + '.gltf';
const BUILD = ['building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H'];
/** Fahrzeug-Arten (Namen aus der Zeit der KayKit-/Kenney-Autos, im Spiel überall so benutzt) → Datei in assets/cars (scripts/cars.mjs, CC BY 4.0) */
export const CAR_FILE: Record<string, string> = {
  car_hatchback: 'compact', car_sedan: 'sedan', car_stationwagon: 'stationwagon', car_taxi: 'taxi', car_police: 'police',
  'k:van': 'minivan', 'k:delivery_van': 'delivery', 'k:truck': 'pickup', 'k:suv': 'offroad', 'k:hatchback_sports': 'hatchback',
  'k:sedan_sports': 'coupe', 'k:suv_luxury': 'suv', 'k:race_car': 'sport', 'k:interceptor': 'interceptor',
};
/** Verkehrsauto mit naher und ferner Fassung (World.car) */
type CarLod = TransformNode & { _pcLod?: [TransformNode, TransformNode, boolean] };
/** Gemischter Verkehr: Alltagsautos, dazu ab und zu Van, Pick-up und Geländewagen */
const MIX = ['car_hatchback', 'car_sedan', 'k:van', 'car_stationwagon', 'k:truck', 'car_sedan', 'k:suv', 'car_hatchback', 'k:delivery_van', 'k:suv_luxury', 'k:sedan_sports'];
export const CITY_FILES = [...BUILD, 'base', 'road_straight', 'road_junction', 'road_tsplit', 'road_corner', 'streetlight', 'bench', 'bush', 'firehydrant', 'trash_A', 'dumpster', 'watertower', 'box_A'].map(C);

export interface Poi { id: string; name: string; icon: string; x: number; z: number; r: number; sign?: string; color?: string }
/** Begehbar: Innenstadt, Kai, Strand und Steg (nicht ins Wasser) */
/** zusätzliche begehbare Flächen (Inseln und Brücken, Isle.ts) */
export const extraWalk: Array<(x: number, z: number) => boolean> = [];
/** Land ohne Brücken (Inselflächen), fürs Boot: unter Brücken hindurch darf es fahren */
export const landWalk: Array<(x: number, z: number) => boolean> = [];
export function walkable(x: number, z: number) {
  for (const f of extraWalk) if (f(x, z)) return true;
  return cityWalk(x, z);
}
/** Festes Land fürs Glitzer-Boot: Stadt, Kai, Strand und Inseln, aber keine Inselbrücken */
export function isLand(x: number, z: number) {
  for (const f of landWalk) if (f(x, z)) return true;
  return cityWalk(x, z);
}
function cityWalk(x: number, z: number) {
  const lim = HALF - 1;
  if (x > lim) { // Regenbogenbrücke und Hochstadt
    if (x < BRIDGE.x1 - .5) return Math.abs(z) < BRIDGE.hz;
    return x <= EAST && Math.abs(z) <= lim;
  }
  if (Math.abs(z) > lim) return false;
  if (x >= -lim) return true;
  if (z > -34 && z < 44 && x >= -91) return true;
  if (z > 18 && z < 42 && x >= -96) return true;
  return z > -3.3 && z < -.7 && x >= -110;
}
export interface Rect { x: number; z: number; hx: number; hz: number }
/** Schlanke Requisiten (Laternen, Masten, Bänke, Bäume): runde Kollision und Ausblenden, wenn sie der Kamera im Weg stehen */
export interface Prop { x: number; z: number; r: number; o: TransformNode[]; solid: boolean }
export interface Car {
  o: Node3; path: Vector3[]; seg: number; u: number; v: number; kind?: string; /** vorübergehend aus dem Verkehr (Parade) */ off?: boolean;
  /** Straßennetz: von Kreuzung a nach b, aktuelles Tempo, Abbiegebogen, Spurabstand zur Mitte */
  a?: number; b?: number; cur?: number; lat?: number; jam?: number; wait?: number;
  turn?: { p0: Vector3; p1: Vector3; p2: Vector3; u: number; len: number; to: number };
  /** angestoßen: Versatz und Schwung, kurz stehen bleiben */
  knock?: { x: number; z: number; r: number; vx: number; vz: number; vr: number }; bump?: { t: number };
}

const isRoad = (i: number) => i % 3 === 0;
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

/* Himmel: Verlauf, Sonne mit Hof, Sterne bei Nacht */
Effect.ShadersStore.pcSkyVertexShader = `precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; varying vec3 vp;
  void main(){ vp = normalize(position); gl_Position = worldViewProjection * vec4(position, 1.0); }`;
Effect.ShadersStore.pcSkyFragmentShader = `precision highp float; uniform vec3 top; uniform vec3 bot; uniform float stars; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vp;
  float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
  void main(){ float y = max(vp.y, 0.0); vec3 c = mix(bot, top, pow(y, .55));
    vec3 q = floor(vp*220.0); float s = step(.997, h(q)) * stars * smoothstep(.05,.4,y);
    float sd = max(dot(normalize(vp), sunDir), 0.0);
    c += sunCol * (pow(sd, 900.0) * 6.0 + pow(sd, 12.0) * .35);
    c = mix(c, bot * 1.08, exp(-y * 7.0) * .45);
    gl_FragColor = vec4(c + s, 1.0); }`;

export class World {
  readonly root: Node3;
  readonly colliders: Rect[] = [];
  readonly props: Prop[] = [];
  readonly pois: Poi[] = [];
  /** Türen aller übrigen Häuser (jedes ist betretbar, Innenraum aus interiors.ts) */
  readonly houses: Array<{ i: number; x: number; z: number; yaw: number }> = [];
  readonly sun: DirectionalLight;
  readonly hemi: HemisphericLight;
  shadows!: ShadowGenerator;
  private sky!: Mesh;
  private skyMat!: ShaderMaterial;
  private lamps: PBRMaterial;
  readonly neon: Array<{ m: PBRMaterial; base: Color3 }> = [];
  /** Fassaden mit Fenstern, die nachts leuchten (Hochstadt) */
  readonly nightMats: PBRMaterial[] = [];
  /** zusätzliche Bewegungen je Bild (Hochbahn, Dampf, Warnlichter) */
  readonly extras: Array<(dt: number, t: number) => void> = [];
  readonly cars: Car[] = [];
  readonly lampLights: PointLight[] = [];
  /** Echte Laternenlichter, die nachts an die nächsten Laternen beim Spieler springen */
  private poolLights: PointLight[] = [];
  private poolT = 0;
  /** Leuchtkörper aller Laternen (nachts wandern ein paar echte Lichter mit dem Spieler mit) */
  readonly lampSpots: Vector3[] = [];
  night = 0;
  /** Spuren im Park, nur mit 18+ */ readonly traces: Node3;

  static load(scene: Scene) { return preload(scene, CITY_FILES); }

  constructor(readonly scene: Scene) {
    this.root = new Node3('world', scene);
    this.traces = new Node3('traces', scene); this.traces.parent = this.root;
    this.lamps = glow(scene, 0xfff2c0, 1);
    this.hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    this.sun = new DirectionalLight('sun', new Vector3(-.5, -.8, -.4), scene);
  }

  async build() {
    const sc = this.scene;
    this.buildSky();
    const sun = this.sun;
    sun.autoUpdateExtends = false; sun.shadowOrthoScale = 0;
    sun.orthoLeft = -38; sun.orthoRight = 38; sun.orthoTop = 38; sun.orthoBottom = -38; sun.shadowMinZ = 1; sun.shadowMaxZ = 160;
    this.shadows = new ShadowGenerator(2048, sun);
    this.shadows.usePercentageCloserFiltering = true; this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadows.bias = .0006; this.shadows.normalBias = .02;
    this.nearShadows();

    // Boden
    const g = ground(sc, 600, 600); g.position.y = -.02; g.material = pbr(sc, 0x6fae5a, 1); g.receiveShadows = true; g.parent = this.root;

    this.definePois();
    const special = new Map<string, Poi>();
    for (const p of this.pois) special.set(this.blockOf(p.x, p.z), p);

    const tasks: Promise<unknown>[] = [];
    for (let ix = -N; ix <= N; ix++) for (let iz = -N; iz <= N; iz++) {
      const x = ix * TILE, z = iz * TILE;
      if (isRoad(ix) || isRoad(iz)) { tasks.push(this.road(ix, iz, x, z)); continue; }
      tasks.push(this.place(C('base'), x, 0, z, 0, S, true, false));
      const key = this.blockOf(x, z);
      const poi = special.get(key);
      if (poi && (poi.id === 'plaza' || poi.id === 'park')) continue;
      // Gebäude zeigen zur nächsten Straße
      const fx = ((ix % 3) + 3) % 3 === 1 ? -1 : 1, fz = ((iz % 3) + 3) % 3 === 1 ? -1 : 1;
      const faceX = rnd() < .5;
      let rot = faceX ? (fx < 0 ? -Math.PI / 2 : Math.PI / 2) : (fz < 0 ? Math.PI : 0);
      // Läden mit Tür zur Hauptstraße (x = 0)
      const door = this.pois.find((q) => q.sign && Math.round(q.x / TILE) === ix && Math.round(q.z / TILE) === iz);
      if (door) rot = door.x > 0 ? -Math.PI / 2 : Math.PI / 2;
      let kind = BUILD[Math.floor(rnd() * BUILD.length)];
      if (door) kind = door.id === 'club' ? 'building_H' : door.id === 'center' ? 'building_G' : door.id === 'home' ? 'building_E' : door.id === 'cafe' ? 'building_B' : door.id === 'boutique' ? 'building_F' : door.id === 'gym' ? 'building_D' : door.id === 'studio' ? 'building_A' : door.id === 'checkpoint' ? 'building_E' : door.id === 'onelove' ? 'building_H' : door.id === 'police' ? 'building_A' : door.id === 'fire' ? 'building_G' : 'building_C';
      const house = door ? null : { i: this.houses.length, x: x + Math.sin(rot) * (TILE * .4 + .5), z: z + Math.cos(rot) * (TILE * .4 + .5), yaw: rot };
      if (house) this.houses.push(house);
      tasks.push(this.place(C(kind), x, .1, z, rot).then((o) => {
        const r = this.footprint(o, x, z);
        this.blocks.push({ r, o });
        // Haustür direkt vor die echte Fassade legen (keine Klingel mitten auf dem Gehweg)
        if (house) { const sx = Math.round(Math.sin(rot)), sz = Math.round(Math.cos(rot)), d = sx ? r.hx + (r.x - x) * sx : r.hz + (r.z - z) * sz; house.x = x + Math.sin(rot) * (d + .7); house.z = z + Math.cos(rot) * (d + .7); }
      }));
    }
    await Promise.all(tasks);
    this.plaza(); this.park(); this.decorate(); this.signs(); this.paintHouses(); this.neonCity(); await this.harbour();
    await buildUptown(this);
    await this.spawnCars();
    this.buildEnv();
    this.setTime(.3);
  }

  /** Schatten fallen nur im Kasten ±38 m um die Figur: nur Meshes in der Nähe in die Schattenkarte zeichnen
      (vorher jedes Bild alle ~1.300 angemeldeten Meshes der ganzen Stadt samt Inseln, auch weit entfernte Figuren).
      Muss nach jedem Neuanlegen der Schattenkarte (andere Kartengröße) wieder gesetzt werden. */
  setShadowSize(px: number) {
    if (this.shadows.mapSize !== px) this.shadows.mapSize = px;
    this.nearShadows();
  }
  private nearShadows() {
    { const sm = this.shadows.getShadowMap()!; let near: AbstractMesh[] = [], at = -99, n0 = -1;
      sm.getCustomRenderList = (_pass, list, len) => {
        const f = this.scene.getFrameId();
        if (f - at >= 6 || len !== n0) {
          at = f; n0 = len; near = [];
          // Kastenecke 38·√2 m, dazu die Schattenlänge (Höhe × Sonnenstand, bei tiefer Sonne länger)
          const c = this.sun.position, R = 38 * 1.42, k = Math.hypot(this._sunDir.x, this._sunDir.z) / Math.max(.2, this._sunDir.y);
          for (let i = 0; i < len; i++) {
            const m = list![i] as AbstractMesh; if (!m || m.isDisposed() || !m.isEnabled()) continue;
            const bi = m.getBoundingInfo(), b = bi.boundingSphere, dx = b.centerWorld.x - (c.x - this._sunDir.x * 60), dz = b.centerWorld.z - (c.z - this._sunDir.z * 60);
            const r = R + b.radiusWorld + Math.min(45, Math.max(2, bi.boundingBox.maximumWorld.y * k));
            if (dx * dx + dz * dz < r * r) near.push(m);
          }
        }
        return near;
      }; }
  }

  /** alle Meshes mit Schattenwurf beim Schattengenerator anmelden (nach dem Aufbau und nach neuen Figuren) */
  castShadows() {
    const list = this.shadows.getShadowMap()!.renderList!;
    const have = new Set(list);
    for (const m of this.scene.meshes) if ((m as AbstractMesh & { _pcCast?: boolean })._pcCast && !have.has(m)) list.push(m);
  }

  private blockOf(x: number, z: number) { return Math.floor(Math.round(x / TILE) / 3) + ',' + Math.floor(Math.round(z / TILE) / 3); }

  private definePois() {
    const P = (id: string, name: string, icon: string, x: number, z: number, sign?: string, color?: string, r = 3.2) => this.pois.push({ id, name, icon, x, z, r, sign, color });
    P('plaza', 'Pride Plaza', '🏳️‍🌈', -15, 15, undefined, undefined, 7);
    P('cafe', 'Café Kaffeeklatsch', '☕', 5.6, 10, 'KAFFEEKLATSCH', '#ffb347');
    P('home', 'Deine Wohnung', '🏠', 5.6, 40, 'HOME', '#7bffb0');
    P('center', 'Regenbogenhaus', '🌈', -5.6, -10, 'REGENBOGENHAUS', '#ff6ad5');
    P('club', 'Club Prisma', '🪩', 5.6, -10, 'PRISMA', '#b56bff');
    P('spaeti', 'Späti Lecker', '🛒', -5.6, 40, 'SPÄTI', '#5ce1ff');
    P('boutique', 'Boutique Fabelhaft', '👗', 35.6, 10, 'FABELHAFT', '#ff9ad5');
    P('gym', 'Muckibude Muskelkater', '🏋️', 35.6, -20, 'MUCKIBUDE', '#ffd23b');
    P('studio', 'Studio Klappe Auf', '📸', -35.6, 20, 'STUDIO', '#5ce1ff');
    P('checkpoint', 'Checkpoint Regenbogen', '🩺', -35.6, -10, 'CHECKPOINT', '#3ee69a');
    P('kopfkino', 'Videothek Kopfkino', '📼', 5.6, -40, 'KOPFKINO', '#ff3b6b');
    P('rosa', 'Haus Rosa', '🏮', -5.6, -40, 'HAUS ROSA', '#ff6ad5');
    P('onelove', 'One Love Bar', '💗', 35.6, 20, 'ONE LOVE', '#ff3fb0');
    P('police', 'Polizeiwache Mitte', '🚓', 5.6, -20, 'POLIZEI', '#5b86d6');
    P('fire', 'Feuerwache Regenbogen', '🚒', -5.6, -20, 'FEUERWACHE', '#ff4b3b');
    P('park', 'Regenbogenpark', '🌳', 45, 45, undefined, undefined, 8);
    // Hafenviertel westlich der Innenstadt (per Tram oder zu Fuß über die Kaistraße)
    P('bar', 'Club Leuchtturm', '🗼', -72.6, -12);
    P('beach', 'Strandbar Sandbank', '🏖️', -80.4, 30);
    P('sauna', 'Sauna Heißer Stein', '🧖', -77, 40.4);
    P('flug', 'Flugschule Möwenflug', '🛩️', -70, -26, undefined, undefined, 2.4);
    P('tramhafen', 'Tram Hafen', '🚋', -70, 8, undefined, undefined, 3.6);
    P('welten', 'Weltentor', '🌀', -78, 13, undefined, undefined, 3.4);
    P('tram', 'Tram Rainbow City', '🚋', 0, 52, undefined, undefined, 4);
    // Hochstadt östlich der Regenbogenbrücke
    P('samenbank', 'Samenbank Zukunft', '🧪', 96, -11, 'SAMENBANK', '#7fd4ff');
    P('tramhoch', 'Hochbahn Hochstadt', '🚇', 157, 22, undefined, undefined, 3.6);
    P('laterne', 'Laternenmeile', '🏮', 105, -27, undefined, undefined, 2);
    P('garage', 'Garage Schraubenschlüssel', '🔧', 170.5, -47.4, undefined, undefined, 2.6);
    for (const u of UPTOWN_PLACES) { const d = doorStep(u); P(u.id, u.name, u.icon, d.x, d.z, undefined, undefined, 2.2); }
  }

  async place(path: string, x: number, y: number, z: number, rot: number, s = S, flat = false, cast = true) {
    const o = await instance(this.scene, path, { shadows: cast });
    this.tune(path, o);
    o.position.set(x, y, z); o.rotation.y = rot; o.scaling.set(s, flat ? 1 : s, s);
    o.parent = this.root;
    o.getChildMeshes().forEach((m) => { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; });
    return o;
  }
  /** Kollision eines Hauses aus seinem echten Grundriss: nur Teile, die bis zum Boden reichen (Markisen und Schilder oben zählen nicht) */
  private foot = new Map<string, number[] | null>();
  private footprint(o: TransformNode, x: number, z: number) {
    const b = this.bounds(o, .5, 2.2, this.foot);
    const r: Rect = b ? { x: (b[0] + b[1]) / 2, z: (b[2] + b[3]) / 2, hx: Math.max(1, (b[1] - b[0]) / 2 - .1), hz: Math.max(1, (b[3] - b[2]) / 2 - .1) } : { x, z, hx: TILE * .4, hz: TILE * .4 };
    this.colliders.push(r); return r;
  }
  /** Ausdehnung eines Hauses in einer Höhenschicht (Weltkoordinaten: x0, x1, z0, z1) */
  private bounds(o: TransformNode, lo: number, hi: number, cache: Map<string, number[] | null>) {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const m of o.getChildMeshes()) {
      // Grundriss aus den Wänden im Erdgeschoss (0,5–2,2 m), ohne Gehweg-Platte, Markisen und Schilder
      let f = cache.get(m.name);
      if (f === undefined) {
        const pos = m.getVerticesData('position'); f = null;
        if (pos) { const sy = m.absoluteScaling.y || 1, oy = m.absolutePosition.y; let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
          for (let i = 0; i < pos.length; i += 3) { const y = pos[i + 1] * sy + oy; if (y < lo || y > hi) continue; a = Math.min(a, pos[i]); b = Math.max(b, pos[i]); c = Math.min(c, pos[i + 2]); d = Math.max(d, pos[i + 2]); }
          if (isFinite(a)) f = [a, b, c, d]; }
        cache.set(m.name, f);
      }
      if (!f) continue;
      const wm = m.getWorldMatrix();
      for (const [lx, lz] of [[f[0], f[2]], [f[1], f[2]], [f[0], f[3]], [f[1], f[3]]]) {
        const q = Vector3.TransformCoordinates(new Vector3(lx, 0, lz), wm);
        x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z);
      }
    }
    return isFinite(x0) ? [x0, x1, z0, z1] : null;
  }
  /** feste Teile: Weltmatrix einfrieren (spart Rechenzeit) */
  still(m: AbstractMesh, cast = true, receive = true) {
    m.parent = this.root; m.isPickable = false; m.receiveShadows = receive; (m as AbstractMesh & { _pcCast?: boolean })._pcCast = cast;
    m.computeWorldMatrix(true); m.freezeWorldMatrix();
    return m;
  }
  /* ---------- Materialien: realistischer statt Spielzeug-Glanz ---------- */
  private tuned = new Set<unknown>();
  private winMats: PBRMaterial[] = [];
  private roadMats: PBRMaterial[] = [];
  private winTex: Texture | null = null;
  /** Fenster-Maske im KayKit-Atlas: nachts leuchten die Scheiben warm */
  private windowMask() {
    if (this.winTex) return this.winTex;
    return (this.winTex = canvasTex(this.scene, 8, 4, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 8, 4); g.fillStyle = '#fff'; g.fillRect(2, 1, 1, 1); }, false, true));
  }
  tune(path: string, o: TransformNode) {
    for (const mesh of o.getChildMeshes()) {
      const m = (mesh as Mesh).material as PBRMaterial | null;
      if (!m || !(m instanceof PBRMaterial) || this.tuned.has(m)) continue;
      this.tuned.add(m);
      if (/building/.test(path)) {
        m.roughness = 1; m.metallic = 1; m.emissiveTexture = this.windowMask(); m.emissiveColor = new Color3(0, 0, 0); this.winTex!.coordinatesIndex = m.albedoTexture?.coordinatesIndex ?? 0; this.winMats.push(m);
        this.surface(m, 'building');
        // Putz- und Backstein-Struktur über eine zweite UV (Würfel-Projektion in Metern)
        m.detailMap.texture = this.detailTex(); m.detailMap.isEnabled = true; m.detailMap.diffuseBlendLevel = .55; m.detailMap.bumpLevel = .9; m.detailMap.roughnessBlendLevel = .4;
        m.detailMap.texture.coordinatesIndex = 1;
        for (const ms of o.getChildMeshes()) if ((ms as Mesh).material === m || (ms as InstancedMesh).sourceMesh?.material === m) this.boxUv(ms);
      }
      else if (/road|base/.test(path)) { m.roughness = .72; m.metallic = 0; this.roadMats.push(m); }
      else if (/car_/.test(path)) {
        // Autolack mit Klarlack, getönte Scheiben, Gummi und Chrom (je Farbfeld im Atlas)
        m.roughness = 1; m.metallic = 1; this.surface(m, 'car');
        m.clearCoat.isEnabled = true; m.clearCoat.intensity = .7; m.clearCoat.roughness = .06;
      }
      else if (/streetlight|trafficlight|firehydrant/.test(path)) { m.roughness = .35; m.metallic = .5; }
      else { m.roughness = .7; m.metallic = 0; }
    }
  }

  /* ---------- Spiegelungen: echte Stadt-HDRIs (Poly Haven, CC0) für Lack, Glas und nasse Straße ---------- */
  private envs: Record<'day' | 'dusk' | 'night', HDRCubeTexture> | null = null;
  private envNow = '';
  private buildEnv() {
    const sc = this.scene, mk = (f: string) => new HDRCubeTexture('./assets/env/' + f + '.hdr', sc, 128, false, true, false, false);
    this.envs = { day: mk('city'), dusk: mk('sunset'), night: mk('night') };
  }
  private pickEnv(day: number, dusk: number) {
    if (!this.envs) return;
    const k = dusk > .45 ? 'dusk' : day > .5 ? 'day' : 'night';
    if (k !== this.envNow) { this.envNow = k; this.scene.environmentTexture = this.envs[k]; }
    this.scene.environmentIntensity = .25 + .35 * day;
  }
  /** Rauheit (G) und Metall (B) je Farbfeld des KayKit-Atlas (8 × 4 Felder) */
  private surfTex: Record<string, Texture> = {};
  private surface(m: PBRMaterial, kind: 'car' | 'building') {
    let t = this.surfTex[kind];
    if (!t) {
      // [Spalte, Zeile, Rauheit, Metall]
      const car: Array<[number, number, number, number]> = [[0, 0, .05, .85], [1, 1, .05, .85], [2, 1, .06, .8], [0, 1, .05, .8], [4, 0, .85, 0], [3, 0, .3, .9], [2, 0, .22, .95], [1, 0, .3, .2]];
      const bld: Array<[number, number, number, number]> = [[2, 1, .04, .75], [0, 1, .05, .7], [1, 1, .06, .6], [0, 0, .12, .6], [3, 0, .35, .7], [2, 0, .45, .6]];
      const base = kind === 'car' ? [.2, .1] : [.88, 0];
      const list = kind === 'car' ? car : bld;
      const data = new Uint8Array(8 * 4 * 4);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) {
        const hit = list.find((c) => c[0] === x && c[1] === y), o = (y * 8 + x) * 4;
        data[o] = 255; data[o + 1] = Math.round((hit ? hit[2] : base[0]) * 255); data[o + 2] = Math.round((hit ? hit[3] : base[1]) * 255); data[o + 3] = 255;
      }
      t = this.surfTex[kind] = RawTexture.CreateRGBATexture(data, 8, 4, this.scene, false, true, Texture.NEAREST_SAMPLINGMODE);
    }
    t.coordinatesIndex = m.albedoTexture?.coordinatesIndex ?? 0;
    m.metallicTexture = t; m.useRoughnessFromMetallicTextureGreen = true; m.useMetallnessFromMetallicTextureBlue = true; m.useRoughnessFromMetallicTextureAlpha = false;
  }
  /** Detail-Textur (R = Helligkeit, G = Normal Y, B = Rauheit, A = Normal X): Putz mit feinen Fugen */
  private detail: Texture | null = null;
  detailTex() {
    if (this.detail) return this.detail;
    const N2 = 256, d = new Uint8Array(N2 * N2 * 4), h = new Float32Array(N2 * N2);
    let seed = 7; const rn = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const noise = new Float32Array(64 * 64).map(() => rn());
    const smooth = (x: number, y: number) => { const xi = Math.floor(x) & 63, yi = Math.floor(y) & 63, fx = x - Math.floor(x), fy = y - Math.floor(y), a = noise[yi * 64 + xi], b = noise[yi * 64 + ((xi + 1) & 63)], c = noise[((yi + 1) & 63) * 64 + xi], e = noise[((yi + 1) & 63) * 64 + ((xi + 1) & 63)]; return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + e * fx) * fy; };
    for (let y = 0; y < N2; y++) for (let x = 0; x < N2; x++) {
      // Steinreihen (Fugen alle 32 px, versetzt) + Putz-Rauschen
      const row = Math.floor(y / 32), bx = (x + (row % 2) * 32) % 64, joint = (y % 32 < 2 || bx < 2) ? 1 : 0;
      h[y * N2 + x] = .5 + (smooth(x / 8, y / 8) - .5) * .5 + (smooth(x / 2.5, y / 2.5) - .5) * .25 - joint * .45;
    }
    for (let y = 0; y < N2; y++) for (let x = 0; x < N2; x++) {
      const i = y * N2 + x, hx = h[y * N2 + ((x + 1) % N2)] - h[y * N2 + ((x + N2 - 1) % N2)], hy = h[((y + 1) % N2) * N2 + x] - h[((y + N2 - 1) % N2) * N2 + x];
      d[i * 4] = Math.max(0, Math.min(255, 128 + (h[i] - .5) * 150));
      d[i * 4 + 1] = Math.max(0, Math.min(255, 128 - hy * 180));
      d[i * 4 + 2] = Math.max(0, Math.min(255, 128 + (.5 - h[i]) * 120));
      d[i * 4 + 3] = Math.max(0, Math.min(255, 128 - hx * 180));
    }
    const t = (this.detail = RawTexture.CreateRGBATexture(d, N2, N2, this.scene, true, false, Texture.TRILINEAR_SAMPLINGMODE));
    t.wrapU = t.wrapV = Texture.WRAP_ADDRESSMODE;
    return t;
  }
  /** Zweite UV aus der Lage im Modell (Würfel-Projektion), einmal je Geometrie */
  private uvDone = new Set<unknown>();
  private boxUv(ms: AbstractMesh) {
    const src = ((ms as InstancedMesh).sourceMesh || ms) as Mesh;
    const geo = src.geometry; if (!geo || this.uvDone.has(geo)) return; this.uvDone.add(geo);
    const pos = src.getVerticesData(VertexBuffer.PositionKind), nor = src.getVerticesData(VertexBuffer.NormalKind); if (!pos || !nor) return;
    const uv = new Float32Array(pos.length / 3 * 2), k = 1.2; // gut 80 cm je Kachel: Steinreihen um 10 cm
    for (let i = 0; i < pos.length / 3; i++) {
      const ax = Math.abs(nor[i * 3]), ay = Math.abs(nor[i * 3 + 1]), az = Math.abs(nor[i * 3 + 2]);
      const [u, v] = ax > ay && ax > az ? [pos[i * 3 + 2], pos[i * 3 + 1]] : az > ay ? [pos[i * 3], pos[i * 3 + 1]] : [pos[i * 3], pos[i * 3 + 2]];
      uv[i * 2] = u * k; uv[i * 2 + 1] = v * k;
    }
    src.setVerticesData(VertexBuffer.UV2Kind, uv, false);
  }

  /** Requisite merken (r = Kollisionsradius, solid = Figur stößt dagegen) */
  /** Bäume und Palmen stehen fest: Weltmatrix einfrieren (spart je Bild die Prüfung, ob sie sich bewegt haben) */
  private freeze(g: TransformNode) { g.computeWorldMatrix(true); g.getChildMeshes().forEach((m) => { m.computeWorldMatrix(true); m.freezeWorldMatrix(); }); }
  prop(x: number, z: number, r: number, o: TransformNode[], solid = true) { this.props.push({ x, z, r, o, solid }); }

  /** Straßenkachel; lo/hi = westlicher und östlicher Rand des Viertels (an der Brücke z = 0 geht es weiter) */
  async road(ix: number, iz: number, x: number, z: number, lo = -N, hi = N) {
    const rx = isRoad(ix), rz = isRoad(iz);
    if (rx && rz) {
      const bridge = iz === 0 && (ix === N || ix === 9);
      const edgeX = (ix === lo || ix === hi) && !bridge, edgeZ = Math.abs(iz) === N;
      if (edgeX && edgeZ) return this.place(C('road_corner'), x, 0, z, ix === hi ? (iz > 0 ? Math.PI : -Math.PI / 2) : (iz > 0 ? Math.PI / 2 : 0), S, true, false);
      if (edgeX) return this.place(C('road_tsplit'), x, 0, z, ix === hi ? Math.PI / 2 : -Math.PI / 2, S, true, false);
      if (edgeZ) return this.place(C('road_tsplit'), x, 0, z, iz > 0 ? 0 : Math.PI, S, true, false);
      return this.place(C('road_junction'), x, 0, z, 0, S, true, false);
    }
    await this.place(C('road_straight'), x, 0, z, rx ? 0 : Math.PI / 2, S, true, false);
    // Laternen am Rand, jede zweite Kachel
    if ((ix + iz) % 2 === 0) {
      const side = rx ? [x + TILE * .44, z] : [x, z + TILE * .44];
      const lamp = await this.place(C('streetlight'), side[0], .1, side[1], rx ? Math.PI : -Math.PI / 2);
      const bulb = this.bulb();
      bulb.position.set(side[0] + (rx ? -1.05 : 0), 4.55, side[1] + (rx ? 0 : -1.05));
      this.still(bulb, false, false);
      const bn = new TransformNode('lampbulb', this.scene); bulb.parent = bn; bn.parent = this.root;
      this.prop(side[0], side[1], .3, [lamp, bn]);
      this.lampSpots.push(bulb.position.clone());
      this.lampPosts.push([side[0], side[1], rx]);
    }
  }
  /** Laternenmasten: x, z, Straße läuft in z-Richtung */
  private lampPosts: Array<[number, number, boolean]> = [];
  private bulbSrc: Mesh | null = null;
  private bulb() {
    if (!this.bulbSrc) { this.bulbSrc = sphere(this.scene, .35, 8); this.bulbSrc.material = this.lamps; this.bulbSrc.setEnabled(false); }
    const b = this.bulbSrc.createInstance('bulb'); return b;
  }

  /* ---------- Himmel ---------- */
  private buildSky() {
    const sc = this.scene;
    this.skyMat = new ShaderMaterial('sky', sc, { vertex: 'pcSky', fragment: 'pcSky' }, { attributes: ['position'], uniforms: ['worldViewProjection', 'top', 'bot', 'stars', 'sunDir', 'sunCol'] });
    this.skyMat.backFaceCulling = false; this.skyMat.disableDepthWrite = true;
    this.sky = sphere(sc, 280, 24); this.sky.material = this.skyMat; this.sky.infiniteDistance = false; this.sky.isPickable = false;
    this.sky.applyFog = false; this.sky.renderingGroupId = 0; this.sky.alwaysSelectAsActiveMesh = true;
    this.sky.parent = this.root;
    sc.fogMode = Scene.FOGMODE_EXP2; sc.fogDensity = .0058;
  }

  /** t: Tagesanteil 0..1, 0 = 6:00 Uhr */
  setTime(t: number) {
    const hour = (6 + t * 24) % 24;
    const ang = ((hour - 6) / 12) * Math.PI; // 6 Uhr Aufgang, 18 Uhr Untergang
    const up = Math.sin(ang);
    const day = smoothstep(up, -.15, .25);
    this.night = 1 - day;
    const dusk = Math.max(0, 1 - Math.abs(up) * 2.6) * (up > -.35 ? 1 : 0); // längere Abendröte in Pink und Violett
    const top = Color3.Lerp(Color3.Lerp(col(0x1a1450), col(0x3d7fe0), day), col(0x5b3a9a), dusk * .6);
    const bot = Color3.Lerp(Color3.Lerp(col(0x4a2a78), col(0xcfe6ff), day), col(0xff6f9a), dusk * .85);
    // Wetter: Wolken machen den Himmel grau und das Licht flacher, Nebel und Regen verdichten den Dunst
    const wx = this.wx;
    if (wx.gloom > .01) { const grey = col(0x77808f).scale(.25 + .75 * day); Color3.LerpToRef(top, grey.scale(.8), wx.gloom * .8, top); Color3.LerpToRef(bot, grey, wx.gloom * .8, bot); }
    // Schnee: heller, kühler Dunst am Horizont
    if (wx.snow > .01) Color3.LerpToRef(bot, col(0xdfe8f5).scale(.3 + .7 * day), wx.snow * .55, bot);
    const sm = this.skyMat;
    sm.setColor3('top', top); sm.setColor3('bot', bot); sm.setFloat('stars', this.night * (1 - wx.gloom));
    sm.setVector3('sunDir', new Vector3(Math.cos(ang) * .8, up, .45).normalize());
    sm.setColor3('sunCol', new Color3(1, .82, .6).scale(smoothstep(up, -.08, .1) * (1 - wx.gloom)));
    this.scene.fogColor = bot;
    // tagsüber Dunst, abends und nachts klarer, damit die Skyline mit ihren Fenstern zu sehen ist
    this.scene.fogDensity = .0022 + .0012 * day * (1 - dusk) + wx.fog;
    this.pickEnv(day, dusk);
    this.scene.clearColor.set(bot.r, bot.g, bot.b, 1);
    // Fenster nachts warm, Straßen nachts feucht glänzend
    this.winMats.forEach((m) => m.emissiveColor.set(1 * this.night * .9, .72 * this.night * .9, .4 * this.night * .9));
    this.nightMats.forEach((m) => m.emissiveColor.set(.04 + this.night * 1.1, .04 + this.night * 1.05, .04 + this.night));
    { const r = (.72 - .38 * this.night) * (1 - wx.wet * .62); this.roadMats.forEach((m) => setQuiet(m, 'roughness', r)); }
    this.poolLights.forEach((l) => (l.intensity = this.night * 14));
    this.sun.intensity = (.55 + 1.9 * day) * (1 - wx.gloom * .6);
    this.sun.diffuse = Color3.Lerp(Color3.Lerp(col(0x8fa0ff), Color3.White(), day), col(0xffa060), dusk);
    this.hemi.intensity = (.55 + .45 * day) * (1 - wx.gloom * .18) + wx.flash * 2.4;
    this.hemi.diffuse = Color3.Lerp(col(0x7a6cff), col(0xbfd8ff), day);
    this.hemi.groundColor = Color3.Lerp(Color3.Lerp(col(0x2a2040), col(0x4a3a5a), day), col(0xb8c4d8), wx.snow * .5);
    this._sunDir.set(Math.cos(ang) * .8, Math.max(.25, Math.abs(up)), .45).normalize();
    this.sun.direction = this._sunDir.scale(-1);
    // Farben direkt im Material ändern: eine neue Farbe zuweisen markiert jedes Mal alle Meshes der Szene als „schmutzig“ (kostete jedes Bild viel Zeit)
    this.lamps.albedoColor.set(1, .95, .75).scaleInPlace(.6 + this.night * 3.2);
    this.neon.forEach((n) => { n.base.scaleToRef(1 + this.night * 2.4, n.m.albedoColor); });
    this.pools.forEach((m) => { m.alpha = this.night * .38; });
    // Lichter, die nichts beitragen, ganz abschalten: jedes aktive Licht kostet in jedem Bildpunkt Rechenzeit
    const lit = this.night > .03 && !this.low;
    this.lampLights.forEach((l) => { l.intensity = this.night * 40; if (l.isEnabled() !== lit) l.setEnabled(lit); });
    this.poolLights.forEach((l) => { if (l.isEnabled() !== lit) l.setEnabled(lit); });
  }
  private _sunDir = new Vector3(.5, .8, .4);
  /** Wetter (weather.ts): Bewölkung, nasse Straßen, zusätzlicher Dunst, Blitz */
  readonly wx = { gloom: 0, wet: 0, fog: 0, flash: 0, /** Schneefall 0–1 */ snow: 0, /** Lichtblitz vom Feuerwerk */ boom: 0 };
  /** niedrige Grafikstufe (Handy): keine Punktlichter, kein Klarlack, keine Feinstruktur */
  low = false;
  setLow(on: boolean) {
    if (on === this.low) return; this.low = on;
    for (const m of this.scene.materials) {
      if (!(m instanceof PBRMaterial)) continue;
      const k = m as PBRMaterial & { _pcFx?: [boolean, boolean] };
      if (!k._pcFx) k._pcFx = [m.detailMap.isEnabled, m.clearCoat.isEnabled];
      // Fassadenstruktur (Ziegel, Putz) bleibt auch auf der sparsamen Stufe: ohne sie sind die Häuser nur farbige Klötze
      m.detailMap.isEnabled = k._pcFx[0]; m.clearCoat.isEnabled = !on && k._pcFx[1];
    }
    const lit = this.night > .03 && !on;
    for (const l of [...this.lampLights, ...this.poolLights]) l.setEnabled(lit);
  }

  /** Schatten folgen dem Spieler */
  follow(p: Vector3) {
    this.sun.position.set(p.x + this._sunDir.x * 60, p.y + this._sunDir.y * 60, p.z + this._sunDir.z * 60);
    this.sky.position.set(p.x, 0, p.z);
  }

  /* ---------- Pride Plaza und Park ---------- */
  private plaza() {
    const sc = this.scene, cx = -15, cz = 15;
    // Regenbogen-Ring auf dem Boden
    PALETTES[0].colors.forEach((c, i) => {
      const m = ring(sc, 3.2 + i * .7, 3.9 + i * .7, 48); m.material = pbr(sc, c, .8); m.position.set(cx, .13 + i * .001, cz); this.still(m, false);
    });
    // Brunnen in der Mitte
    const stone = pbr(sc, 0xe9e2f5, .6);
    const f1 = cyl(sc, 2.6, 2.9, .8, 24); f1.material = stone; f1.position.set(cx, .5, cz); this.still(f1);
    const water = cyl(sc, 2.3, 2.3, .1, 24); water.material = pbr(sc, 0x4fc3ff, .1, .2, { emissive: 0x0a3050 }); water.position.set(cx, .88, cz); this.still(water, false);
    const f2 = cyl(sc, .35, .5, 2.4, 12); f2.material = stone; f2.position.set(cx, 1.6, cz); this.still(f2);
    this.colliders.push({ x: cx, z: cz, hx: 2.8, hz: 2.8 });
    // Flaggenmasten rund um den Platz – jede Pride-Flagge einmal
    const flags = PALETTES.filter((p) => p.id !== 'neon');
    flags.forEach((p, i) => {
      const a = (i / flags.length) * Math.PI * 2;
      this.flag(cx + Math.cos(a) * 8.6, cz + Math.sin(a) * 8.6, p.colors, 6.5, -a);
    });
    // Bänke
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const bx = cx + Math.cos(a) * 6, bz = cz + Math.sin(a) * 6;
      this.place(C('bench'), bx, .1, bz, -a + Math.PI / 2).then((o) => this.prop(bx, bz, .95, [o]));
    }
    for (const [x, z] of [[-24, 6], [-6, 6], [-24, 24], [-6, 24]]) this.palm(x, z, 1.1);
    // Bühne für Events
    const stage = box(sc, 7, .6, 3.4); stage.material = pbr(sc, 0x6b4a32, .55); stage.position.set(cx, .4, cz - 7.6); this.still(stage);
    // LED-Kante in Regenbogenfarben und Traversen mit Scheinwerfern
    PALETTES[0].colors.forEach((c, i) => {
      const led = glow(sc, c, 1); this.neon.push({ m: led, base: col(c, .7) });
      const e = box(sc, 7 / 6, .1, .04); e.material = led; e.position.set(cx - 3.5 + (i + .5) * 7 / 6, .62, cz - 5.88); this.still(e, false, false);
    });
    const truss = pbr(sc, 0x2b2b30, .35, .8);
    for (const sx of [-3.3, 3.3]) { const t = box(sc, .18, 4.2, .18); t.material = truss; t.position.set(cx + sx, 2.8, cz - 9.1); this.still(t); }
    const beam = box(sc, 6.8, .18, .18); beam.material = truss; beam.position.set(cx, 4.9, cz - 9.1); this.still(beam);
    const spot = glow(sc, 0xfff1d0, 1); this.neon.push({ m: spot, base: new Color3(.8, .75, .6) });
    for (let i = 0; i < 4; i++) { const sp = cyl(sc, .16, .22, .35, 10); sp.material = spot; sp.position.set(cx - 2.4 + i * 1.6, 4.65, cz - 9.1); sp.rotation.x = .5; this.still(sp, false, false); }
    this.colliders.push({ x: cx, z: cz - 7.6, hx: 3.5, hz: 1.7 });
  }

  private park() {
    const sc = this.scene, cx = 45, cz = 45;
    for (let i = 0; i < 16; i++) this.tree(cx + (rnd() - .5) * 18, cz + (rnd() - .5) * 18, .9 + rnd() * .6);
    for (let i = 0; i < 10; i++) this.place(C('bush'), cx + (rnd() - .5) * 18, .1, cz + (rnd() - .5) * 18, rnd() * 6, S * 1.4);
    this.place(C('watertower'), cx + 6, .1, cz - 6, 0);
    // Spuren wilder Nächte (nur mit 18+ sichtbar): stilisierte Verpackungen und Kondomringe hinter den Büschen
    const wrap = pbr(sc, 0xc0c6d4, .35, .6), rg = pbr(sc, 0xf2d2e0, .5);
    for (let i = 0; i < 9; i++) {
      const x = cx - 7 + rnd() * 10, z = cz - 2 + rnd() * 9;
      const w = box(sc, .16, .01, .16); w.material = wrap; w.position.set(x, .03, z); w.rotation.y = rnd() * 6; w.parent = this.traces;
      if (i % 3 === 0) { const r = torus(sc, .05, .014, 14); r.material = rg; r.position.set(x + .3, .03, z + .2); r.parent = this.traces; }
    }
    this.traces.visible = false;
    this.colliders.push({ x: cx + 6, z: cz - 6, hx: 1.4, hz: 1.4 });
  }

  private treeSrc: { trunk: Mesh; tops: Mesh[] } | null = null;
  tree(x: number, z: number, s: number) {
    const sc = this.scene;
    if (!this.treeSrc) {
      const trunk = cyl(sc, .18, .26, 1.6, 6); trunk.material = pbr(sc, 0x7a4a2a, .9); trunk.convertToFlatShadedMesh();
      const tops = [0x4caf50, 0x66bb6a, 0x9ccc65, 0xff8fb1].map((c) => { const t = sphere(sc, 1.3, 2); t.material = pbr(sc, c, .9); t.convertToFlatShadedMesh(); return t; });
      [trunk, ...tops].forEach((m) => { m.setEnabled(false); m.receiveShadows = true; m.parent = this.root; });
      this.treeSrc = { trunk, tops };
    }
    const g = new TransformNode('tree', sc);
    const add = (src: Mesh, px: number, py: number, pz: number, k = 1) => { const m = src.createInstance('t'); m.position.set(px, py, pz); m.scaling.setAll(k); m.parent = g; (m as AbstractMesh & { _pcCast?: boolean })._pcCast = true; return m; };
    const top = this.treeSrc.tops[Math.floor(rnd() * 4)];
    add(this.treeSrc.trunk, 0, .8, 0); add(top, 0, 2.3, 0); add(top, .5, 3.1, .2, .7);
    g.position.set(x, 0, z); g.scaling.setAll(s * 1.6); g.rotation.y = rnd() * 6; g.parent = this.root;
    this.freeze(g);
    this.colliders.push({ x, z, hx: .5, hz: .5 });
    this.prop(x, z, .5, [g], false);
  }

  /* ---------- Palmen (Strand-Boulevard-Gefühl am Kai, am Strand und am Platz) ---------- */
  private palmSrc: { trunk: Mesh; frond: Mesh } | null = null;
  palm(x: number, z: number, s = 1) {
    const sc = this.scene;
    if (!this.palmSrc) {
      const trunk = cyl(sc, .16, .26, 6, 7, false);
      const tp = trunk.getVerticesData(VertexBuffer.PositionKind)!;
      for (let i = 0; i < tp.length; i += 3) { const y = tp[i + 1] + 3; tp[i + 1] = y; tp[i] += (y / 6) ** 2 * .9; }
      trunk.setVerticesData(VertexBuffer.PositionKind, tp); trunk.createNormals(false);
      trunk.material = pbr(sc, 0x8a6a48, .95, 0, { double: true });
      // Palmwedel: gebogene, spitz zulaufende Fläche
      const pos: number[] = [], idx: number[] = [], uv: number[] = [];
      const cols = 3, rows = 7;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const d = (r / (rows - 1)) * 3.4, xx = (c / (cols - 1) - .5) * 1.25 * (1 - d / 3.8);
        pos.push(xx, -d * d * .12 + d * .25 - Math.abs(xx) * .35, d); uv.push(c / (cols - 1), r / (rows - 1));
        if (r < rows - 1 && c < cols - 1) { const k = r * cols + c; idx.push(k, k + cols, k + 1, k + 1, k + cols, k + cols + 1); }
      }
      const frond = new Mesh('frond', sc), vd = new VertexData(), nor: number[] = [];
      VertexData.ComputeNormals(pos, idx, nor);
      vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.uvs = uv; vd.applyToMesh(frond);
      frond.material = pbr(sc, 0x2f8a45, .8, 0, { double: true });
      [trunk, frond].forEach((m) => { m.setEnabled(false); m.receiveShadows = true; m.parent = this.root; });
      this.palmSrc = { trunk, frond };
    }
    const g = new TransformNode('palm', sc);
    const t = this.palmSrc.trunk.createInstance('pt'); t.parent = g; (t as AbstractMesh & { _pcCast?: boolean })._pcCast = true;
    for (let i = 0; i < 9; i++) {
      const f = this.palmSrc.frond.createInstance('pf'); f.parent = g; (f as AbstractMesh & { _pcCast?: boolean })._pcCast = true;
      f.position.set(.9, 5.9, 0); f.rotation.y = (i / 9) * Math.PI * 2 + rnd() * .3;
    }
    g.position.set(x, .05, z); g.rotation.y = rnd() * 6; g.scaling.setAll(s); g.parent = this.root;
    this.freeze(g);
    this.prop(x, z, .35 * s, [g]);
  }

  /* ---------- Flaggen, Zebrastreifen, Wimpel ---------- */
  private flagSrc: Mesh | null = null;
  private flagBase: Float32Array | null = null;
  private poleSrc: Mesh | null = null;
  flag(x: number, z: number, colors: string[], h: number, rot: number) {
    const sc = this.scene;
    if (!this.flagSrc) {
      const f = planeZ(sc, 2.4, 1.5, true);
      // feiner unterteilt, damit die Flagge weht: 12 × 4 Felder, Mast an x = 0
      const pos: number[] = [], idx: number[] = [], uv: number[] = [];
      for (let r = 0; r <= 4; r++) for (let c = 0; c <= 12; c++) {
        pos.push((c / 12) * 2.4, (r / 4 - .5) * 1.5, 0); uv.push(c / 12, r / 4);
        if (r < 4 && c < 12) { const k = r * 13 + c; idx.push(k, k + 1, k + 13, k + 1, k + 14, k + 13); }
      }
      const vd = new VertexData(), nor: number[] = []; VertexData.ComputeNormals(pos, idx, nor);
      vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.uvs = uv; vd.applyToMesh(f, true);
      f.setEnabled(false); f.parent = this.root; this.flagSrc = f; this.flagBase = new Float32Array(pos);
      const p = cyl(sc, .06, .06, 1, 6); p.material = pbr(sc, 0xdddddd, .3, .6); p.setEnabled(false); p.parent = this.root; this.poleSrc = p;
    }
    const mat = pbr(sc, 0xffffff, .8, 0, { double: true });
    mat.albedoTexture = canvasTex(sc, 64, 64, (g) => colors.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, (i * 64) / colors.length, 64, Math.ceil(64 / colors.length) + 1); }));
    const pole = this.poleSrc!.createInstance('pole'); pole.scaling.y = h; pole.position.set(x, h / 2, z); this.still(pole);
    const f = this.flagSrc.clone('flag'); f.setEnabled(true); f.material = mat; f.position.set(x, h - .8, z); f.rotation.y = rot;
    f.parent = this.root; f.receiveShadows = true; (f as AbstractMesh & { _pcCast?: boolean })._pcCast = true; f.alwaysSelectAsActiveMesh = false;
    const node = new TransformNode('flagset', sc); pole.parent = node; f.parent = node; node.parent = this.root;
    this.prop(x, z, .22, [node]);
  }
  /** alle Flaggen teilen sich eine Geometrie: einmal pro Bild wehen lassen */
  private waveFlags(t: number) {
    const f = this.flagSrc, b = this.flagBase; if (!f || !b) return;
    const p = f.getVerticesData(VertexBuffer.PositionKind) as Float32Array;
    for (let i = 0; i < b.length; i += 3) { const x = b[i], y = b[i + 1], w = x / 2.4; p[i + 2] = Math.sin(x * 2.6 - t * 4 + y) * .22 * w; p[i + 1] = y - w * w * .15; }
    // direkt in den Puffer schreiben: updateVerticesData markiert sonst jedes Bild alle Flaggen-Materialien neu (Shader-Suche je Bild)
    const vb = f.geometry?.getVertexBuffer(VertexBuffer.PositionKind);
    if (vb?.isUpdatable()) vb.update(p); else f.updateVerticesData(VertexBuffer.PositionKind, p, false, false);
  }

  private decorate() {
    const sc = this.scene;
    // Regenbogen-Zebrastreifen: sechs Balken in Fahrtrichtung, quer über die Fahrbahn verteilt
    const cols = PALETTES[0].colors.map((c) => { const m = pbr(sc, c, .55); m.zOffset = -2; return m; });
    const stripes = cols.map((m) => { const s = ground(sc, .72, 2.6); s.material = m; s.setEnabled(false); s.receiveShadows = true; s.parent = this.root; return s; });
    const crossing = (x: number, z: number, alongX: boolean) => {
      stripes.forEach((src, i) => {
        const s = src.createInstance('zebra'); const off = (i - 2.5) * 1.18;
        if (alongX) { s.rotation.y = Math.PI / 2; s.position.set(x, .112, z + off); } else s.position.set(x + off, .112, z);
        this.still(s, false);
      });
    };
    // an jeder Kreuzung der Innenstadt, in alle vier Richtungen
    for (const cx of [-30, 0, 30]) for (const cz of [-30, 0, 30]) { crossing(cx, cz + 7, false); crossing(cx, cz - 7, false); crossing(cx + 7, cz, true); crossing(cx - 7, cz, true); }
    // Wimpelketten über den Straßen rund um den Platz (eine Form, viele Kopien mit eigener Farbe)
    const tri = new Mesh('wimpel', sc), vd = new VertexData();
    vd.positions = [-.35, 0, 0, .35, 0, 0, 0, -.7, 0]; vd.indices = [0, 1, 2]; vd.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1]; vd.applyToMesh(tri);
    tri.material = pbr(sc, 0xffffff, .8, 0, { double: true }); tri.parent = this.root;
    const lines: Array<[number, number, number, number]> = [[-28, 5, -28, 25], [-2, 5, -2, 25], [-25, 2, -5, 2], [-25, 28, -5, 28], [2, -25, 2, 25], [-25, -2, 25, -2]];
    // dazu quer über jede Straße der Innenstadt, alle acht Meter, jede Kette in einer anderen Pride-Flagge
    for (const c of [-30, 0, 30]) for (let u = -54; u <= 54; u += 8) {
      if ([-60, -30, 0, 30, 60].some((k2) => Math.abs(u - k2) < 7.5)) continue;
      lines.push([c - 5.8, u, c + 5.8, u], [u, c - 5.8, u, c + 5.8]);
    }
    const per = (l: number[]) => (Math.hypot(l[2] - l[0], l[3] - l[1]) > 15 ? 22 : 10);
    const count = lines.reduce((n, l) => n + per(l), 0), mats = new Float32Array(count * 16), colors = new Float32Array(count * 4), bm = new Float32Array(count * 16);
    const flags = PALETTES.filter((q) => !['ace', 'aro', 'leather', 'bear'].includes(q.id));
    let k = 0;
    lines.forEach(([x1, z1, x2, z2], li) => {
      const yaw = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2, n = per([x1, z1, x2, z2]), long = n > 10, pal = long ? PALETTES[0].colors : flags[li % flags.length].colors;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), sag = Math.sin(u * Math.PI) * (long ? 1.4 : .7), y = (long ? 8.6 : 8.1) - sag, x = x1 + (x2 - x1) * u, z = z1 + (z2 - z1) * u;
        Matrix.Compose(Vector3.One(), Quaternion.RotationAxis(Vector3.Up(), yaw), new Vector3(x, y, z)).copyToArray(mats, k * 16);
        Matrix.Translation(x, y + .08, z).copyToArray(bm, k * 16);
        const c = col(pal[i % pal.length]); colors.set([c.r, c.g, c.b, 1], k * 4); k++;
      }
    });
    tri.thinInstanceSetBuffer('matrix', mats, 16, true); tri.thinInstanceSetBuffer('color', colors, 4, true);
    tri.alwaysSelectAsActiveMesh = true;
    // Lichterkette auf denselben Schnüren: leuchtet in den Flaggenfarben, nachts das halbe Stadtbild
    const bulb = sphere(sc, .075, 4); const bmat = pbr(sc, 0xffffff, .5); bmat.unlit = true; bulb.material = bmat; bulb.parent = this.root; bulb.isPickable = false;
    bulb.thinInstanceSetBuffer('matrix', bm, 16, true); bulb.thinInstanceSetBuffer('color', colors, 4, true); bulb.alwaysSelectAsActiveMesh = true;
    // Pride-Banner an jeder Laterne, darüber drei Luftballons
    const banners = flags.map((q) => {
      const t = canvasTex(sc, 32, 96, (g) => { q.colors.forEach((cc, i) => { g.fillStyle = cc; g.fillRect(0, Math.floor(i * 96 / q.colors.length), 32, Math.ceil(96 / q.colors.length)); }); });
      const m = pbr(sc, 0xffffff, .7, 0, { double: true }); m.albedoTexture = t;
      const b = planeZ(sc, .62, 1.7, true); b.material = m; b.setEnabled(false); b.parent = this.root; return b;
    });
    const balloon = sphere(sc, .26, 6); balloon.scaling.y = 1.2; const balMat = pbr(sc, 0xffffff, .22); balloon.material = balMat; balloon.parent = this.root; balloon.isPickable = false;
    const bal: number[] = [], balC: number[] = [];
    const addBalloon = (x: number, y: number, z: number, hexc: string) => { const mtx = Matrix.Compose(new Vector3(1, 1.2, 1), Quaternion.Identity(), new Vector3(x, y, z)); bal.push(...mtx.asArray()); const c = col(hexc); balC.push(c.r, c.g, c.b, 1); };
    this.lampPosts.forEach(([x, z, rx], i) => {
      if (Math.abs(x) > 62 || Math.abs(z) > 62) return;
      const b = banners[i % banners.length].createInstance('banner');
      b.position.set(x + (rx ? .42 : 0), 3.1, z + (rx ? 0 : .42)); b.rotation.y = rx ? 0 : Math.PI / 2; this.still(b, false, false);
      const rb = PALETTES[0].colors;
      for (let j = 0; j < 3; j++) addBalloon(x + (rx ? .3 : (j - 1) * .3), 4.9 + (j === 1 ? .35 : 0), z + (rx ? (j - 1) * .3 : .3), rb[(i * 2 + j * 2) % 6]);
    });
    // Ballonbögen in Regenbogenfarben über den Einfahrten zur Innenstadt
    const pole = cyl(sc, .09, .09, 3.2, 8); pole.material = pbr(sc, 0xf2f2f6, .4, .3); pole.setEnabled(false); pole.parent = this.root;
    const arch = (x: number, z: number, alongZ: boolean) => {
      const R = 6.9, n = 34;
      for (let i = 0; i < n; i++) { const a = (i / (n - 1)) * Math.PI, o = Math.cos(a) * R, y = 3.2 + Math.sin(a) * R * .62; addBalloon(alongZ ? x + o : x, y, alongZ ? z : z + o, PALETTES[0].colors[Math.floor(i / n * 6)]); if (i % 2) addBalloon(alongZ ? x + o * .97 : x + .35, y + .38, alongZ ? z + .35 : z + o * .97, PALETTES[0].colors[Math.floor(i / n * 6)]); }
      for (const sgn of [-1, 1]) { const q = pole.createInstance('archpole'); q.position.set(alongZ ? x + sgn * R : x, 1.7, alongZ ? z : z + sgn * R); this.still(q, false, false); }
    };
    arch(0, 44, true); arch(0, -44, true); arch(-44, 0, false); arch(44, 0, false); arch(0, 13.5, true); arch(-16.5, 30, false);
    balloon.thinInstanceSetBuffer('matrix', new Float32Array(bal), 16, true); balloon.thinInstanceSetBuffer('color', new Float32Array(balC), 4, true); balloon.alwaysSelectAsActiveMesh = true;
    // Flaggen an Hausecken entlang der Hauptstraße
    for (let z = -50; z <= 50; z += 20) if (Math.abs(z) > 8) this.flag(5.2, z + 5, PALETTES[(Math.abs(z) / 10) % PALETTES.length | 0].colors, 5, Math.PI / 2);
    // Ein paar Bäume an den Straßen
    for (let i = -5; i <= 5; i += 2) { this.tree(-34, i * 10 + 5, .8); this.tree(34, i * 10 - 5, .8); }
    // Echte Lichter nur nahe beim Spieler (spart Leistung)
    for (let i = 0; i < 4; i++) { const l = new PointLight('pool', new Vector3(0, -50, 0), sc); l.diffuse = col(0xffc98a); l.specular = col(0xffc98a, .5); l.range = 15; l.intensity = 0; this.poolLights.push(l); }
    for (const [x, z] of [[-15, 15], [5, -10]]) { const l = new PointLight('neonlight', new Vector3(x, 5, z), sc); l.diffuse = col(0xff7ad9); l.range = 26; l.intensity = 0; this.lampLights.push(l); }
  }

  /* Neon-Schilder über den Türen (leuchten nachts, Bloom auf hoher Stufe) */
  private blocks: Array<{ r: Rect; o: TransformNode }> = [];
  private pools: PBRMaterial[] = [];
  /** Jedes Haus der Innenstadt in einer eigenen kräftigen Farbe (Farbe je Instanz, die Bauteile bleiben geteilt) */
  private paintHouses() {
    const T = [[1.6, .7, 1.25], [.55, 2, 2.2], [1.6, 1.7, .5], [1.05, .8, 2.1], [.6, 2.1, 1.1], [1.8, 1.25, .5], [1.75, .55, 1.05], [.6, 1.3, 2.4]];
    const C4 = this.scene.clearColor.constructor as new (r: number, g: number, b: number, a: number) => unknown;
    const srcs = new Set<Mesh>(), mine = new Map<AbstractMesh, number[]>();
    this.blocks.forEach(({ o }, i) => { for (const m of o.getChildMeshes()) { const sm = (m as InstancedMesh).sourceMesh; if (sm) { srcs.add(sm); mine.set(m, T[(i * 3 + (i >> 2)) % T.length]); } } });
    for (const sm of srcs) {
      sm.registerInstancedBuffer('color', 4); sm.instancedBuffers.color = new C4(1, 1, 1, 1);
      // dieselben Bauteile stehen auch in der Hochstadt: dort bleibt die Farbe, wie sie war
      for (const im of sm.instances) { const t = mine.get(im) || [1, 1, 1]; im.instancedBuffers.color = new C4(t[0], t[1], t[2], 1); }
    }
  }
  /** Neon: Leuchtbänder um jedes Haus, Leuchtschriften an den Fassaden, nachts farbige Lichtflecken auf dem Gehweg */
  private neonCity() {
    const sc = this.scene, NEON = ['#ff3fb0', '#5ce1ff', '#ffd23b', '#b56bff', '#3ee69a', '#ff7a3b', '#ff4b6b', '#6f8cff'];
    const mt: number[] = [], cl: number[] = [];
    const tube = (x: number, y: number, z: number, sx: number, sy: number, sz: number, hexc: string, yaw = 0) => {
      mt.push(...Matrix.Compose(new Vector3(sx, sy, sz), Quaternion.FromEulerAngles(0, yaw, 0), new Vector3(x, y, z)).asArray()); const k = col(hexc); cl.push(k.r, k.g, k.b, 1);
    };
    const WORDS = ['LOVE', 'PRIDE', 'QUEER', 'YAS!', 'SLAY', 'LOVE IS LOVE', 'FABULOUS', 'KISS ME', 'DIVA', 'GLITZER', 'OUT & PROUD', 'TANZ!', 'KÜSSCHEN', 'DRAMA', 'HEISS', 'BUNT', 'FREI', 'STOLZ'];
    const pool = NEON.map((c) => { const m = glow(sc, c, 1, { add: true, alpha: 0 }); this.pools.push(m); const g = ground(sc, 5, 3); g.material = m; g.setEnabled(false); g.parent = this.root; return g; });
    let n = 0;
    for (const h of this.houses) {
      if (Math.abs(h.x) > 62 || Math.abs(h.z) > 62) continue;
      const ci = (n * 3) % 8, sx = Math.sin(h.yaw), sz = Math.cos(h.yaw);
      this.neonSign(WORDS[n % WORDS.length], NEON[ci], h.x - sx * .56, 6.3, h.z - sz * .56, h.yaw, undefined, 5.2);
      const g = pool[ci].createInstance('pool'); g.position.set(h.x + sx * 1.1, .13, h.z + sz * 1.1); g.rotation.y = h.yaw; this.still(g, false, false);
      // Neonrahmen um den Schriftzug an der Fassade (statt Bändern am Gehweg, die wie Geländer wirkten)
      { const fx = h.x - sx * .5, fz = h.z - sz * .5, c2 = NEON[(ci + 3) % 8], T = .08, w = 5.9, cx = Math.cos(h.yaw), cz = -Math.sin(h.yaw);
        tube(fx, 7.15, fz, w, T, T, c2, h.yaw); tube(fx, 5.45, fz, w, T, T, c2, h.yaw);
        for (const e of [-1, 1]) tube(fx + cx * e * w / 2, 6.3, fz + cz * e * w / 2, T, 1.7, T, c2, h.yaw); }
      n++;
    }
    const t = box(sc, 1, 1, 1), tm = glow(sc, 0xffffff, 1); t.material = tm; t.parent = this.root; t.isPickable = false;
    t.thinInstanceSetBuffer('matrix', new Float32Array(mt), 16, true); t.thinInstanceSetBuffer('color', new Float32Array(cl), 4, true); t.alwaysSelectAsActiveMesh = true;
    this.neon.push({ m: tm, base: new Color3(1, 1, 1) });
  }
  private signs() {
    for (const p of this.pois) {
      if (!p.sign) continue;
      const dir = Math.sign(p.x) || 1; // Tür zeigt zur Hauptstraße x = 0
      this.neonSign(p.sign, p.color!, p.x + dir * .3, 5.4, p.z, dir > 0 ? -Math.PI / 2 : Math.PI / 2, p.x + dir * .25);
    }
  }
  /** Leuchtschild mit Türrahmen (door = x-Position der Tür, sonst ohne Tür) */
  neonSign(text: string, color: string, x: number, y: number, z: number, rot: number, door?: number, maxW = 8) {
    const sc = this.scene;
    const t = canvasTex(sc, 512, 128, (g) => {
      g.fillStyle = 'rgba(10,6,24,.85)'; g.fillRect(0, 0, 512, 128);
      g.font = '900 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = color; g.fillText(text, 256, 68, 490);
      g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = .7; g.fillText(text, 256, 68, 490);
    }, true);
    const m = glow(sc, 0xffffff, 1, { tex: t });
    this.neon.push({ m, base: new Color3(1, 1, 1) });
    const w = Math.min(maxW, 2 + text.length * .5);
    const s = planeZ(sc, w, w / 4); s.material = m;
    s.position.set(x, y, z); s.rotation.y = rot; this.still(s, false, false);
    if (door === undefined) return;
    const d = planeZ(sc, 2.2, 3.2); d.material = glow(sc, color, 1.4, { alpha: .55 });
    d.position.set(door, 1.7, z); d.rotation.y = rot; this.still(d, false, false);
  }

  /* ---------- Hafenviertel: Kai, Strand, Steg mit Leuchtturm, Lagerhalle (dein Club) ---------- */
  private async harbour() {
    const sc = this.scene;
    const M = (c: number | string, r = .8, m = 0, extra: Parameters<typeof pbr>[4] = {}) => pbr(sc, c, r, m, extra);
    const plane = (w: number, l: number, mt: PBRMaterial, x: number, y: number, z: number) => { const o = ground(sc, w, l); o.material = mt; o.position.set(x, y, z); return this.still(o, false); };
    const bx = (w: number, h: number, l: number, mt: PBRMaterial, x: number, y: number, z: number, cl = false) => { const o = box(sc, w, h, l); o.material = mt; o.position.set(x, y, z); this.still(o); if (cl) this.colliders.push({ x, z, hx: w / 2, hz: l / 2 }); return o; };
    plane(27, 80, M(0x948c80, .9), -78.5, .06, 5);                      // Kai-Pflaster
    plane(400, 600, M(0x2f8fd0, .12, .25, { emissive: 0x08243a }), -292, .02, 0); // Wasser
    plane(10, 26, M(0xf0d9a0, 1), -92, .07, 30);                    // Sandstrand
    bx(.5, .5, 15.5, M(0x8c8579), -91.4, .25, -27.25); bx(.5, .5, 53.5, M(0x8c8579), -91.4, .25, 18.25);   // Kaimauer, offen an der Brücke nach Glitzeria (z −14)
    // Weltentor am Kai: Regenbogenbogen mit leuchtendem Wirbel (Reise in andere Welten, worlds.ts)
    [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff].forEach((c, i) => { const m = glow(sc, c, 1); this.neon.push({ m, base: m.albedoColor.clone() }); const a = torus(sc, 3.3 - i * .22, .13, 28); a.material = m; a.rotation.set(Math.PI / 2, Math.PI / 2, 0); a.position.set(-80, 0, 13); this.still(a, false); });
    { const m = glow(sc, 0xd9b8ff, 1, { alpha: .45 }); const d = cyl(sc, 2.1, 2.1, .05, 28); d.material = m; d.rotation.z = Math.PI / 2; d.position.set(-80, 1.6, 13); this.still(d, false); this.neonSign('WELTENTOR', '#ffffff', -79.9, 4.3, 13, Math.PI / 2, undefined, 5); }
    // Welten-Meile an der Kaimauer: je Welt ein eigenes Tor (durchlaufen oder durchfahren) und draußen vor der Küste
    // ihre Insel mit Leuchtsäule (mit dem Flitzer hinfliegen)
    for (const w of WORLDS) {
      if (ISLES[w.id]) continue;   // liegt als echte Insel vor dem Kai
      const g = cityGate(w.id), isle = cityIsle(w.id), c = w.host.color, m = glow(sc, c, 1.1); this.neon.push({ m, base: m.albedoColor.clone() });
      for (let i = 0; i < 3; i++) { const a = torus(sc, 1.95 - i * .2, .11, 24); a.material = i === 1 ? glow(sc, 0xffffff, 1) : m; a.rotation.set(Math.PI / 2, Math.PI / 2, 0); a.position.set(g.x, 0, g.z); this.still(a, false); }
      { const d = cyl(sc, 1.5, 1.5, .05, 24); d.material = glow(sc, c, .9, { alpha: .4 }); d.rotation.z = Math.PI / 2; d.position.set(g.x, .9, g.z); this.still(d, false); }
      this.neonSign(`${w.icon} ${w.name.toUpperCase()}`, c, g.x + .1, 2.75, g.z, Math.PI / 2, undefined, 3.9);
      const land = cyl(sc, 9, 10.5, 1.2, 20); land.material = M(w.ground, .95); land.position.set(isle.x, 0, isle.z); this.still(land, false);
      const beam = cyl(sc, 1.1, 1.1, 46, 12, false); beam.material = glow(sc, c, 1, { alpha: .35 }); beam.position.set(isle.x, 23, isle.z); this.still(beam, false, false);
      const hut = box(sc, 4, 3.5, 4); hut.material = M(w.town.plaza, .8); hut.position.set(isle.x, 2.3, isle.z); this.still(hut, false);
    }
    // Steg mit Leuchtturm
    const wood = M(0x8a5a35, .9);
    bx(20, .3, 3, wood, -101, .2, -2);
    for (let i = 0; i < 6; i++) for (const z of [-3.3, -.7]) bx(.3, 1.2, .3, wood, -93 - i * 3.4, -.3, z);
    const rc = [0xf4f4f4, 0xd8261e];
    for (let i = 0; i < 5; i++) { const c = cyl(sc, 1.25 - i * .08, 1.33 - i * .08, 2, 18); c.material = M(rc[i % 2], .6); c.position.set(-112, 1 + i * 2, -2); this.still(c); }
    const lamp = glow(sc, 0xfff2a0, 1); this.neon.push({ m: lamp, base: new Color3(1.2, 1.1, .6) });
    const top = cyl(sc, .75, .75, 1.2, 12); top.material = lamp; top.position.set(-112, 10.6, -2); this.still(top, false);
    const cap = cyl(sc, 0, 1.1, 1, 12); cap.material = M(0xd8261e, .5); cap.position.set(-112, 11.7, -2); this.still(cap);
    // Lagerhalle = Club Leuchtturm
    bx(14, 7, 12, M(0x5b4a6e, .85), -80, 3.5, -12, true);
    const roof = cyl(sc, 6.3, 6.3, 14.2, 3); roof.material = M(0x2c2338, .7);
    roof.rotation.set(0, Math.PI / 2, Math.PI / 2); roof.scaling.set(1, 1, .45); roof.position.set(-80, 7.9, -12); this.still(roof);
    this.neonSign('LEUCHTTURM', '#ffd23b', -72.85, 5.2, -12, Math.PI / 2, -72.9);
    PALETTES[0].colors.forEach((c, i) => { const o = box(sc, .06, .5, 11); o.material = glow(sc, c, 1); o.position.set(-72.95, .5 + i * .5, -12); this.still(o, false, false); });
    // Strandbar
    bx(5, 3, 4, M(0xe7c79a), -84, 1.5, 30, true);
    bx(.05, 1.1, 3.4, M(0x1d1630, .6), -81.47, 2, 30);               // Ausschank-Fenster
    bx(.8, 1.05, 4.2, M(0x8a5a35, .9), -81.1, .55, 30);              // Theke
    for (const z of [28.6, 30, 31.4]) bx(.45, .7, .45, M(0xff4fa3, .6), -80.2, .35, z); // Hocker
    PALETTES[0].colors.forEach((c, i) => bx(6, .12, .75, M(c, .7), -84, 3.1 + i * .02, 27.8 + i * .75));
    this.neonSign('SANDBANK', '#ff9ad5', -81.45, 3.6, 30, Math.PI / 2, undefined, 4.2);
    for (let i = 0; i < 4; i++) {
      const u = cyl(sc, 0, 1.4, .6, 10); u.material = M([0xff4fa3, 0x5ce1ff, 0xffd23b, 0x7bffb0][i], .7); u.position.set(-90 - (i % 2) * 3, 2.3, 22 + i * 4.5); this.still(u);
      const st = bx(.08, 2.2, .08, M(0xffffff), u.position.x, 1.1, u.position.z);
      const node = new TransformNode('umbrella', sc); node.parent = this.root; u.parent = node; st.parent = node;
      this.prop(u.position.x, u.position.z, .25, [node]);
    }
    // Sauna Heißer Stein: Holzhaus mit Schornstein und Dampf, Tür zum Kai (Osten)
    bx(5.2, 3.2, 4.4, M(0x9a6236, .85), -80.6, 1.6, 40.4, true);
    for (let i = 0; i < 6; i++) bx(5.25, .05, 4.45, M(0x6e4223, .9), -80.6, .3 + i * .52, 40.4);     // Bohlen-Fugen
    for (const sd of [-1, 1]) { const r = box(sc, 5.8, .16, 2.75); r.material = M(0x3a2618, .8); r.rotation.x = sd * .52; r.position.set(-80.6, 3.82, 40.4 + sd * 1.17); this.still(r); }   // Satteldach
    bx(.06, 2.1, 1.1, M(0x2a1a10, .7), -77.97, 1.05, 40.4);                                        // Tür
    bx(.06, .7, 1.4, glow(sc, 0xffb070, .9), -77.97, 2.2, 38.7);                                  // warmes Fenster
    { const ch = cyl(sc, .25, .3, 1.6, 10); ch.material = M(0x5a5a5a, .7); ch.position.set(-81.8, 4.6, 39.4); this.still(ch);
      const st = sphere(sc, .55, 10); st.material = glow(sc, 0xffffff, .8, { alpha: .28 }); st.position.set(-81.8, 5.8, 39.4); st.scaling.set(1, 1.4, 1); this.still(st, false, false); }
    this.neonSign('SAUNA', '#ff9a3b', -77.92, 3.0, 40.4, Math.PI / 2, undefined, 2.6);
    bx(.12, 1, 1.6, M(0x8a5a35, .9), -77.2, .5, 42.4);                                              // Handtuch-Bank
    PALETTES[0].colors.slice(0, 4).forEach((c, i) => bx(.5, .06, .36, M(c, .9), -77.2, 1.03 + i * .06, 41.8 + i * .4));
    // Container in Pride-Farben
    PALETTES[0].colors.forEach((c, i) => bx(6, 2.6, 2.4, M(c, .6), -82, 1.3 + Math.floor(i / 3) * 2.6, -27 + (i % 3) * 2.5));
    this.colliders.push({ x: -82, z: -24.5, hx: 3, hz: 3.7 });
    // Tram-Haltestelle, Laternen, Flaggen und Bänke am Kai
    bx(4, .12, 1.6, M(0xff4fa3, .5), -70, 3, 8);
    for (const x of [-71.8, -68.2]) { const p = bx(.12, 3, .12, M(0x9aa0aa), x, 1.5, 8); const node = new TransformNode('tp', sc); node.parent = this.root; p.parent = node; this.prop(x, 8, .2, [node]); }
    const tasks: Promise<unknown>[] = [];
    for (let z = -30; z <= 40; z += 14) if (z !== -16) tasks.push(this.place(C('streetlight'), -89.5, .1, z, Math.PI / 2).then((o) => this.prop(-89.5, z, .3, [o])));
    for (const z of [-27, 24, 38]) tasks.push(this.place(C('bench'), -88.5, .1, z, -Math.PI / 2).then((o) => this.prop(-88.5, z, .95, [o])));
    await Promise.all(tasks);
    [PALETTES[0], PALETTES[2], PALETTES[3], PALETTES[5]].forEach((p, i) => this.flag(-90.5, -6 + i * 7.5, p.colors, 6, Math.PI / 2));
    for (const z of [-30, -21, 20, 34]) this.tree(-66.5, z, 1);
    for (const z of [-23, 28, 33]) this.palm(-88.6, z, 1 + rnd() * .25);
    for (const [x, z] of [[-94, 21], [-95, 27], [-93.5, 35], [-95.2, 40]]) this.palm(x, z, .9 + rnd() * .3);
  }

  /* ---------- Verkehr ---------- */
  /** Verkehr wie in einer echten Großstadt: Autos fahren das Straßennetz (traffic.ts), biegen an Kreuzungen ab und
      werden rund um dich verteilt (wer weit weg ist, taucht außer Sicht in deiner Nähe wieder auf). */
  private async spawnCars() {
    const n = matchMedia('(pointer: coarse)').matches ? 22 : 32;
    // Hochstadt: viel gelbes Taxi, wie es sich für eine Großstadt gehört
    const UP = ['car_taxi', 'car_sedan', 'car_taxi', 'car_hatchback', 'car_taxi', 'car_stationwagon'];
    for (let i = 0; i < n; i++) {
      const kind = i === 0 ? 'car_police' : i % 2 ? UP[i % UP.length] : MIX[(i >> 1) % MIX.length];
      const o = await this.car(kind, true);
      const c: Car = { o, path: [new Vector3(), new Vector3()], seg: 0, u: 0, v: 8 + rnd() * 4, kind };
      this.placeCar(c, 0, 0, 0, 160);
      this.cars.push(c);
    }
  }
  /** Auto auf ein zufälliges Straßenstück setzen, mindestens rMin und höchstens rMax vom Punkt entfernt (bevorzugt hinter der Kamera) */
  placeCar(c: Car, x: number, z: number, rMin: number, rMax: number, back?: { x: number; z: number }) {
    for (let k = 0; k < 24; k++) {
      const a = Math.floor(rnd() * NODES.length), nb = NODES[a].nb, b = nb[Math.floor(rnd() * nb.length)];
      if (this.roadClosed?.(a, b)) continue;
      const [x0, z0, x1, z1] = lane(a, b), u = .1 + rnd() * .8, px = x0 + (x1 - x0) * u, pz = z0 + (z1 - z0) * u, d = Math.hypot(px - x, pz - z);
      if (d < rMin || d > rMax) continue;
      if (back && k < 16 && (px - x) * back.x + (pz - z) * back.z > d * .35) continue;   // nicht vor deinen Augen auftauchen
      if (this.cars.some((o) => o !== c && Math.abs(o.o.position.x - px) + Math.abs(o.o.position.z - pz) < 12)) continue;
      this.setLane(c, a, b, u); c.cur = c.v * .7; c.turn = undefined; c.lat = LANE; c.bump = undefined;
      return true;
    }
    return false;
  }
  private setLane(c: Car, a: number, b: number, u = 0) {
    const [x0, z0, x1, z1] = lane(a, b);
    c.a = a; c.b = b; c.u = u; c.path[0].set(x0, .1, z0); c.path[1].set(x1, .1, z1);
  }
  /** Straßenstück gesperrt (z. B. Hauptstraße während der Parade) */
  roadClosed?: (a: number, b: number) => boolean;
  /** Abbiegen: nächste Straße an der Kreuzung wählen (kein Wenden, außer in der Sackgasse) und den Bogen dorthin anlegen */
  private nextLane(c: Car) {
    const a = c.a!, b = c.b!, nb = NODES[b].nb.filter((x) => x !== a && !this.roadClosed?.(b, x));
    const pick = nb.length ? nb[Math.floor(rnd() * nb.length)] : a;
    const [, , ex, ez] = lane(a, b), [sx, sz] = lane(b, pick);
    const B = NODES[b];
    // Bogen über die Kreuzung: Kontrollpunkt dort, wo sich alte und neue Spur kreuzen
    const d0x = Math.sign(B.x - NODES[a].x), d0z = Math.sign(B.z - NODES[a].z);
    const cx = d0x ? sx : ex, cz = d0x ? ez : sz;
    const straight = (d0x && sz === ez) || (d0z && sx === ex);
    const p0 = new Vector3(ex, .1, ez), p2 = new Vector3(sx, .1, sz), p1 = straight || pick === a ? p0.add(p2).scale(.5) : new Vector3(cx, .1, cz);
    if (pick === a) p1.set(B.x + d0x * 2, .1, B.z + d0z * 2);
    c.turn = { p0, p1, p2, u: 0, len: Math.max(4, Vector3.Distance(p0, p1) + Vector3.Distance(p1, p2)), to: pick };
  }
  /** Wo soll das Auto gerade sein (Spur oder Abbiegebogen), und in welche Richtung zeigt es? */
  private carPose(c: Car, out: Vector3) {
    if (c.turn) {
      const t = c.turn, u = t.u, k = 1 - u;
      out.set(k * k * t.p0.x + 2 * k * u * t.p1.x + u * u * t.p2.x, .1, k * k * t.p0.z + 2 * k * u * t.p1.z + u * u * t.p2.z);
      const dx = 2 * k * (t.p1.x - t.p0.x) + 2 * u * (t.p2.x - t.p1.x), dz = 2 * k * (t.p1.z - t.p0.z) + 2 * u * (t.p2.z - t.p1.z);
      return Math.atan2(dx, dz);
    }
    const a = c.path[0], b = c.path[1], len = Vector3.Distance(a, b) || 1, ax = (b.x - a.x) / len, az = (b.z - a.z) / len;
    const sh = LANE - (c.lat ?? LANE);   // zur Mitte ausweichen (an geparkten Autos vorbei)
    out.set(a.x + (b.x - a.x) * c.u + az * sh, .1, a.z + (b.z - a.z) * c.u - ax * sh);
    return Math.atan2(ax, az);
  }
  /** Auto als bewegliche Kopie (Wurzel mit visible). Verkehr (traffic) nutzt Instanzen (ein Zeichenaufruf je Modell)
      und am Handy die vereinfachte Fassung; eigene Wagen sind Kopien mit Lack, den paintCar umfärben kann. */
  async car(kind: string, traffic = false) {
    const file = CAR_FILE[kind] || 'sedan', lo = traffic && (this.low || matchMedia('(pointer: coarse)').matches);
    const inner = await instance(this.scene, 'cars/' + file + (lo ? '_lo' : '') + '.glb', { clone: !traffic, shadows: !lo });
    // Verkehr: in der Ferne eine grobe Fassung (traffic() schaltet um), Streifenwagen nutzen dafür ihre Handy-Fassung
    let far: TransformNode | null = null;
    if (traffic) { far = await instance(this.scene, 'cars/' + file + (/^(police|interceptor)$/.test(file) ? '_lo' : '_far') + '.glb', { shadows: false }); far.setEnabled(false); }
    if (!traffic) for (const ms of inner.getChildMeshes()) {
      const m = ms.material as PBRMaterial | null; if (!(m instanceof PBRMaterial)) continue;
      const wheel = /wheel/i.test(ms.name), key = file + '|' + m.name + (wheel ? '|r' : ''); let c = this.carMat.get(key);
      if (!c) {
        // Karosserie bekommt Klarlack und heißt „…_lack“ (paintCar), alles andere bleibt, wie es ist
        if (/body/i.test(m.name) && !wheel) { c = m.clone(m.name + '_lack'); c.clearCoat.isEnabled = !this.low; c.clearCoat.intensity = .55; c.clearCoat.roughness = .08; (c as PBRMaterial & { _pcFx?: [boolean, boolean] })._pcFx = [false, true]; }
        else c = m;
        this.carMat.set(key, c);
      }
      ms.material = c;
    }
    const o = new Node3(kind, this.scene); inner.parent = o; inner.position.y = -.027; o.parent = this.root;
    if (far) { far.parent = o; far.position.y = -.027; (o as CarLod)._pcLod = [inner, far, false]; }
    if (kind === 'car_taxi') this.taxiSign(o);
    return o;
  }
  private carMat = new Map<string, PBRMaterial>();
  private signMat?: PBRMaterial;
  /** Taxischild auf dem Dach (leuchtet) */
  private taxiSign(o: TransformNode) {
    const m = (this.signMat ||= glow(this.scene, 0xffe066, 1.2));
    const b = box(this.scene, .62, .2, .26); b.material = m; b.parent = o; b.position.set(0, 1.5, -.15); b.isPickable = false;
  }
  /** Eigenen Wagen umlackieren: Die Lackfarbe (häufigster kräftiger Farbton der Karosserie) wird auf den Wunsch-Farbton gedreht. hue < 0 = Original. */
  async paintCar(o: TransformNode, hue: number) {
    for (const ms of o.getChildMeshes()) {
      const m = ms.material as (PBRMaterial & { _pcOrig?: Texture }) | null;
      if (!(m instanceof PBRMaterial) || !/_lack$/.test(m.name)) continue;
      const src = (m._pcOrig ||= m.albedoTexture as Texture); if (!src) continue;
      // Lack wird zwischen gleichen Modellen geteilt: vor dem Umfärben eine eigene Kopie für dieses Auto
      if (!(m as PBRMaterial & { _pcOwn?: boolean })._pcOwn) { const own = m.clone(m.name) as PBRMaterial & { _pcOrig?: Texture; _pcOwn?: boolean; _pcFx?: unknown }; own._pcOrig = src; own._pcOwn = true; own._pcFx = (m as PBRMaterial & { _pcFx?: unknown })._pcFx; ms.material = own; await this.paintOne(ms, own, src, hue); continue; }
      await this.paintOne(ms, m, src, hue);
    }
  }
  private async paintOne(ms: AbstractMesh, m: PBRMaterial, src: Texture, hue: number) {
    if (hue < 0) { m.albedoTexture = src; return; }
    const px = await pixels(src); if (!px) return;
    const { width: w, height: h } = src.getSize();
    // Lackfarbe aus den UVs der Karosserie bestimmen: kräftigster häufiger Farbton, sonst (schwarz, grau, weiß) die häufigste Helligkeit
    const uv = ms.getVerticesData(VertexBuffer.UVKind) || [], hist = new Float32Array(36), vh = new Float32Array(20);
    const hsv = (r: number, g: number, b: number) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let hh = 0; if (d) hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(hh * 60 + 360) % 360, mx ? d / mx : 0, mx / 255]; };
    for (let i = 0; i < uv.length; i += 2) {
      const u = uv[i] * src.uScale + src.uOffset, v = uv[i + 1] * src.vScale + src.vOffset;
      const x = Math.min(w - 1, Math.max(0, Math.floor((u - Math.floor(u)) * w))), y = Math.min(h - 1, Math.max(0, Math.floor((v - Math.floor(v)) * h))), k = (y * w + x) * 4;
      const [hh, ss, vv] = hsv(px[k], px[k + 1], px[k + 2]); if (ss > .35 && vv > .25) hist[Math.floor(hh / 10) % 36]++; else if (ss < .25 || vv < .2) vh[Math.min(19, Math.floor(vv * 20))]++;
    }
    let top = 0; for (let i = 1; i < 36; i++) if (hist[i] > hist[top]) top = i;
    let vt = 0; for (let i = 1; i < 20; i++) if (vh[i] > vh[vt]) vt = i;
    const grey = hist[top] < vh[vt] * .5, h0 = top * 10 + 5, v0 = (vt + .5) / 20, out = new Uint8Array(px.length);
    for (let k = 0; k < px.length; k += 4) {
      const [hh, ss, vv] = hsv(px[k], px[k + 1], px[k + 2]); let d = Math.abs(hh - h0); if (d > 180) d = 360 - d;
      let c: Color3 | null = null;
      if (!grey && ss > .3 && d < 28) c = Color3.FromHSV((hue + hh - h0 + 360) % 360, ss, vv);
      else if (grey && (ss < .25 || vv < .2) && Math.abs(vv - v0) < .12) c = Color3.FromHSV(hue, .75, Math.min(1, .55 + (vv - v0) * 1.5));
      if (c) { out[k] = c.r * 255; out[k + 1] = c.g * 255; out[k + 2] = c.b * 255; } else { out[k] = px[k]; out[k + 1] = px[k + 1]; out[k + 2] = px[k + 2]; }
      out[k + 3] = px[k + 3];
      if ((k & 0x3ffff) === 0) await breathe();
    }
    const t = RawTexture.CreateRGBATexture(out, w, h, this.scene, true, src.invertY, Texture.TRILINEAR_SAMPLINGMODE);
    remember(t, out);
    t.uScale = src.uScale; t.vScale = src.vScale; t.uOffset = src.uOffset; t.vOffset = src.vOffset; t.wrapU = src.wrapU; t.wrapV = src.wrapV; t.coordinatesIndex = src.coordinatesIndex; t.gammaSpace = src.gammaSpace;
    m.albedoTexture = t;
  }

  /** Weitere Hindernisse für den Verkehr (geparkte/gefahrene Autos des Spielers) */
  extraBlock?: (x: number, z: number) => boolean;
  /** Spieler-Position, damit Autos bremsen */
  update(dt: number, t: number, player?: Vector3) {
    this.waveFlags(t);
    for (const f of this.extras) f(dt, t);
    if (player && this.night > .05 && (this.poolT -= dt) <= 0) {
      this.poolT = .6;
      const near = this.lampSpots.map((q) => [Vector3.DistanceSquared(q, player), q] as const).sort((a, b) => a[0] - b[0]);
      this.poolLights.forEach((l, i) => { const q = near[i]?.[1]; if (q) l.position.set(q.x, q.y - .5, q.z); });
    }
    this.traffic(dt, player);
  }

  private tmp = new Vector3();
  /** Bezugspunkt und Blickrichtung für das Verteilen (setzt CityScene), Hupen an dich */
  view?: { x: number; z: number; fx: number; fz: number };
  onHonk?: (c: Car) => void;
  /** Hindernisse auf der Fahrbahn, an denen der Verkehr vorbeilenkt (geparkte Autos) */
  statics?: () => Array<{ x: number; z: number }>;
  private respawnI = 0;
  private traffic(dt: number, player?: Vector3) {
    const cars = this.cars, low = this.low, far = low ? 95 : 125, statics = this.statics?.() || [];
    // ein Auto je Bild prüfen: zu weit weg → außer Sicht in deiner Nähe wieder einsetzen
    if (player && cars.length) {
      const c = cars[this.respawnI++ % cars.length];
      if (!c.off && Math.hypot(c.o.position.x - player.x, c.o.position.z - player.z) > far) {
        const v = this.view; this.placeCar(c, player.x, player.z, 42, far * .8, v ? { x: v.fx, z: v.fz } : undefined);
      }
    }
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i];
      if (c.off) { c.o.position.set(0, -40, -500); continue; }
      if (c.a === undefined) { const e = nearestEdge(c.path[0].x, c.path[0].z); this.setLane(c, e.a, e.b, 0); c.cur = 0; c.lat = LANE; }
      const p = c.o.position, yaw = c.turn ? c.o.rotation.y : Math.atan2(c.path[1].x - c.path[0].x, c.path[1].z - c.path[0].z);
      // Nah volle, fern grobe Fassung (mit etwas Spiel, damit es nicht flackert)
      const lod = (c.o as CarLod)._pcLod;
      if (lod && player) { const d = Math.abs(p.x - player.x) + Math.abs(p.z - player.z), lim = low ? 34 : 50, f = lod[2] ? d > lim - 6 : d > lim; if (f !== lod[2]) { lod[2] = f; lod[0].setEnabled(!f); lod[1].setEnabled(f); } }
      const fx = Math.sin(yaw), fz = Math.cos(yaw), cur = c.cur ?? 0;
      const ahead = (qx: number, qz: number, reach: number, wide: number) => {
        const dx = qx - p.x, dz = qz - p.z, along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
        return along > 0 && along < reach && side < wide;
      };
      let want = c.turn ? Math.min(c.v, 6) : c.v;
      const reach = 6.5 + cur * .55;
      // an Kreuzungen langsamer werden
      if (!c.turn) { const left = (1 - c.u) * Vector3.Distance(c.path[0], c.path[1]); if (left < 10) want = Math.min(want, 6 + left * .5); }
      let block = false, byPlayer = false;
      if (player && ahead(player.x, player.z, reach + 2.5, 2.3)) { block = true; byPlayer = true; }
      if ((c.jam ?? 0) < 4) for (let j = 0; j < cars.length && !block; j++) {
        const o = cars[j]; if (o === c || o.off) continue;
        if (ahead(o.o.position.x, o.o.position.z, reach, 1.7)) block = true;
        // Vorfahrt: wer schon in der Kreuzung abbiegt, fährt zuerst
        else if (!c.turn && o.turn && c.u > .8 && Math.abs(o.o.position.x - NODES[c.b!].x) < 9 && Math.abs(o.o.position.z - NODES[c.b!].z) < 9) block = true;
      }
      // an geparkten Autos auf der Spur vorbeilenken
      let dodge = false;
      if (!c.turn) for (const q of statics) if (ahead(q.x, q.z, 14, 2.4)) { dodge = true; break; }
      c.lat = (c.lat ?? LANE) + ((dodge ? .7 : LANE) - (c.lat ?? LANE)) * Math.min(1, dt * 2.2);
      if (this.extraBlock && !dodge && this.extraBlock(p.x + fx * 3.5, p.z + fz * 3.5)) block = true;
      if (block) want = 0;
      // nach einem Stoß: kurz stehen bleiben und schimpfen
      if (c.bump) { c.bump.t -= dt; want = 0; if (c.bump.t <= 0) c.bump = undefined; }
      // Stau-Auflösung: wer lange steht, schiebt sich langsam weiter (nie für immer verkeilt)
      c.jam = want === 0 && !byPlayer && !c.bump ? (c.jam ?? 0) + dt : Math.max(0, (c.jam ?? 0) - dt * 2);
      if ((c.jam ?? 0) > 6) c.jam = 0;
      // hupen, wenn du im Weg stehst
      if (byPlayer) { c.wait = (c.wait ?? 0) + dt; if (c.wait > 2.2) { c.wait = -4; this.onHonk?.(c); } } else c.wait = 0;
      const nv = cur + Math.max(-14 * dt, Math.min(4.5 * dt, want - cur));
      c.cur = Math.max(0, nv);
      const step = c.cur * dt;
      if (c.turn) {
        c.turn.u += step / c.turn.len;
        if (c.turn.u >= 1) { const t = c.turn; this.setLane(c, c.b!, t.to, 0); c.turn = undefined; }
      } else {
        const len = Vector3.Distance(c.path[0], c.path[1]) || 1;
        c.u += step / len;
        if (c.u >= 1) { c.u = 1; this.nextLane(c); }
      }
      const ry = this.carPose(c, this.tmp);
      // Stoß von deinem Auto: weggeschoben und gedreht, rollt dann auf die Spur zurück
      const k = c.knock;
      if (k) {
        k.x += k.vx * dt; k.z += k.vz * dt; k.r += k.vr * dt;
        const damp = Math.max(0, 1 - dt * 3); k.vx *= damp; k.vz *= damp; k.vr *= damp;
        if (Math.hypot(k.vx, k.vz) < .4) { const back = Math.min(1, dt * 1.4); k.x -= k.x * back; k.z -= k.z * back; k.r -= k.r * back; }
        if (Math.abs(k.x) + Math.abs(k.z) + Math.abs(k.r) < .05 && Math.hypot(k.vx, k.vz) < .1) c.knock = undefined;
        this.tmp.x += k.x; this.tmp.z += k.z;
      }
      p.copyFrom(this.tmp);
      let dy = ry + (k ? k.r : 0) - c.o.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      c.o.rotation.y += dy * Math.min(1, dt * 10);
      // Karosserie neigt sich beim Bremsen leicht nach vorn
      c.o.rotation.x += ((nv < cur - .05 ? .035 : 0) - c.o.rotation.x) * Math.min(1, dt * 6);
    }
  }
  /** Auto aus dem Verkehr von dir angestoßen: Wucht (m/s) in Richtung dx/dz */
  knock(c: Car, dx: number, dz: number, force: number) {
    const k = (c.knock ||= { x: 0, z: 0, r: 0, vx: 0, vz: 0, vr: 0 });
    k.vx += dx * force; k.vz += dz * force; k.vr += (rnd() - .5) * force * .25;
    c.bump = { t: 2.5 }; c.cur = 0;
  }

  /** Kreis gegen Rechtecke, verschiebt p aus Hindernissen heraus */
  private last = new Vector3();
  collide(p: Vector3, r: number) {
    for (const q of this.props) {
      if (!q.solid) continue;
      const dx = p.x - q.x, dz = p.z - q.z, m = q.r + r;
      if (dx * dx + dz * dz < m * m) { const d = Math.hypot(dx, dz) || .001; p.x = q.x + dx / d * m; p.z = q.z + dz / d * m; }
    }
    for (const c of this.colliders) {
      const dx = p.x - c.x, dz = p.z - c.z;
      const px = c.hx + r - Math.abs(dx), pz = c.hz + r - Math.abs(dz);
      if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
    }
    if (!walkable(p.x, p.z)) {
      if (walkable(p.x, this.last.z)) p.z = this.last.z;
      else if (walkable(this.last.x, p.z)) p.x = this.last.x;
      else if (walkable(this.last.x, this.last.z)) p.set(this.last.x, p.y, this.last.z);
      else { const lim = HALF - 1; p.x = Math.max(-lim, Math.min(EAST, p.x)); p.z = Math.max(-lim, Math.min(lim, p.z)); }
    }
    this.last.copyFrom(p);
  }
}
export { v3 };
