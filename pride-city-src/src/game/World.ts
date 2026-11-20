/* Rainbow City – Innenstadt aus KayKit-City-Bausteinen (Babylon.js), ergänzt um Pride-Deko: Regenbogen-Zebrastreifen,
   wehende Flaggen, Wimpelketten, Neon-Schilder, Palmen, fahrende Autos und ein Tag-/Nacht-Himmel. Häuser und Straßen
   sind Instanzen (ein Zeichenaufruf je Bauteil), Materialien werden geteilt. */
import {
  Node3, Vector3, Color3, HemisphericLight, DirectionalLight, PointLight, ShadowGenerator, ShaderMaterial, Effect, Mesh, VertexData, VertexBuffer,
  Matrix, Quaternion, Scene, PBRMaterial, Texture, TransformNode, type AbstractMesh, col, smoothstep, v3,
} from '../engine/bjs';
import { instance, preload } from '../engine/Assets';
import { planeZ, ground, box, cyl, sphere, ring, torus, pbr, glow, canvasTex } from '../engine/geo';
import { PALETTES } from './palettes';

export const TILE = 10;
const S = TILE / 2; // KayKit-Kacheln sind 2 Einheiten breit
const N = 6;        // Kacheln von der Mitte bis zum Rand
export const HALF = N * TILE + TILE / 2;

const C = (n: string) => 'city/' + n + '.gltf';
const BUILD = ['building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H'];
const CARS = ['car_hatchback', 'car_sedan', 'car_stationwagon', 'car_taxi', 'car_police'];
export const CITY_FILES = [...BUILD, ...CARS, 'base', 'road_straight', 'road_junction', 'road_tsplit', 'road_corner', 'streetlight', 'bench', 'bush', 'firehydrant', 'trash_A', 'dumpster', 'watertower', 'box_A'].map(C);

export interface Poi { id: string; name: string; icon: string; x: number; z: number; r: number; sign?: string; color?: string }
/** Begehbar: Innenstadt, Kai, Strand und Steg (nicht ins Wasser) */
export function walkable(x: number, z: number) {
  const lim = HALF - 1;
  if (Math.abs(z) > lim || x > lim) return false;
  if (x >= -lim) return true;
  if (z > -34 && z < 44 && x >= -91) return true;
  if (z > 18 && z < 42 && x >= -96) return true;
  return z > -3.3 && z < -.7 && x >= -110;
}
export interface Rect { x: number; z: number; hx: number; hz: number }
/** Schlanke Requisiten (Laternen, Masten, Bänke, Bäume): runde Kollision und Ausblenden, wenn sie der Kamera im Weg stehen */
export interface Prop { x: number; z: number; r: number; o: TransformNode[]; solid: boolean }
export interface Car { o: Node3; path: Vector3[]; seg: number; u: number; v: number; kind?: string }

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
  private neon: Array<{ m: PBRMaterial; base: Color3 }> = [];
  readonly cars: Car[] = [];
  private lampLights: PointLight[] = [];
  /** Echte Laternenlichter, die nachts an die nächsten Laternen beim Spieler springen */
  private poolLights: PointLight[] = [];
  private poolT = 0;
  /** Leuchtkörper aller Laternen (nachts wandern ein paar echte Lichter mit dem Spieler mit) */
  readonly lampSpots: Vector3[] = [];
  night = 0;
  /** Spuren im Park, nur mit 18+ */ readonly traces: Node3;

  static load(scene: Scene) { return preload(scene, CITY_FILES); }

  constructor(private scene: Scene) {
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
      tasks.push(this.place(C(kind), x, .1, z, rot));
      if (!door) this.houses.push({ i: this.houses.length, x: x + Math.sin(rot) * (TILE * .4 + .5), z: z + Math.cos(rot) * (TILE * .4 + .5), yaw: rot });
      this.colliders.push({ x, z, hx: TILE * .4, hz: TILE * .4 });
    }
    await Promise.all(tasks);
    this.plaza(); this.park(); this.decorate(); this.signs(); await this.harbour();
    await this.spawnCars();
    this.setTime(.3);
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
    P('tramhafen', 'Tram Hafen', '🚋', -70, 8, undefined, undefined, 3.6);
    P('tram', 'Tram Rainbow City', '🚋', 0, 52, undefined, undefined, 4);
  }

  private async place(path: string, x: number, y: number, z: number, rot: number, s = S, flat = false, cast = true) {
    const o = await instance(this.scene, path, { shadows: cast });
    this.tune(path, o);
    o.position.set(x, y, z); o.rotation.y = rot; o.scaling.set(s, flat ? 1 : s, s);
    o.parent = this.root;
    o.getChildMeshes().forEach((m) => { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; });
    return o;
  }
  /** feste Teile: Weltmatrix einfrieren (spart Rechenzeit) */
  private still(m: AbstractMesh, cast = true, receive = true) {
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
      if (/building/.test(path)) { m.roughness = .78; m.metallic = 0; m.emissiveTexture = this.windowMask(); m.emissiveColor = new Color3(0, 0, 0); this.winTex!.coordinatesIndex = m.albedoTexture?.coordinatesIndex ?? 0; this.winMats.push(m); }
      else if (/road|base/.test(path)) { m.roughness = .72; m.metallic = 0; this.roadMats.push(m); }
      else if (/car_/.test(path)) { m.roughness = .22; m.metallic = .35; }
      else if (/streetlight|trafficlight|firehydrant/.test(path)) { m.roughness = .35; m.metallic = .5; }
      else { m.roughness = .7; m.metallic = 0; }
    }
  }

  /** Requisite merken (r = Kollisionsradius, solid = Figur stößt dagegen) */
  prop(x: number, z: number, r: number, o: TransformNode[], solid = true) { this.props.push({ x, z, r, o, solid }); }

  private async road(ix: number, iz: number, x: number, z: number) {
    const rx = isRoad(ix), rz = isRoad(iz);
    if (rx && rz) {
      const edgeX = Math.abs(ix) === N, edgeZ = Math.abs(iz) === N;
      if (edgeX && edgeZ) return this.place(C('road_corner'), x, 0, z, ix > 0 ? (iz > 0 ? Math.PI : -Math.PI / 2) : (iz > 0 ? Math.PI / 2 : 0), S, true, false);
      if (edgeX) return this.place(C('road_tsplit'), x, 0, z, ix > 0 ? Math.PI / 2 : -Math.PI / 2, S, true, false);
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
    }
  }
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
    const sm = this.skyMat;
    sm.setColor3('top', top); sm.setColor3('bot', bot); sm.setFloat('stars', this.night);
    sm.setVector3('sunDir', new Vector3(Math.cos(ang) * .8, up, .45).normalize());
    sm.setColor3('sunCol', new Color3(1, .82, .6).scale(smoothstep(up, -.08, .1)));
    this.scene.fogColor = bot;
    this.scene.clearColor.set(bot.r, bot.g, bot.b, 1);
    // Fenster nachts warm, Straßen nachts feucht glänzend
    this.winMats.forEach((m) => m.emissiveColor.set(1 * this.night * .9, .72 * this.night * .9, .4 * this.night * .9));
    this.roadMats.forEach((m) => { m.roughness = .72 - .38 * this.night; });
    this.poolLights.forEach((l) => (l.intensity = this.night * 14));
    this.sun.intensity = .55 + 1.9 * day;
    this.sun.diffuse = Color3.Lerp(Color3.Lerp(col(0x8fa0ff), Color3.White(), day), col(0xffa060), dusk);
    this.hemi.intensity = .55 + .45 * day;
    this.hemi.diffuse = Color3.Lerp(col(0x7a6cff), col(0xbfd8ff), day);
    this.hemi.groundColor = Color3.Lerp(col(0x2a2040), col(0x4a3a5a), day);
    this._sunDir.set(Math.cos(ang) * .8, Math.max(.25, Math.abs(up)), .45).normalize();
    this.sun.direction = this._sunDir.scale(-1);
    this.lamps.albedoColor = new Color3(1, .95, .75).scale(.6 + this.night * 3.2);
    this.neon.forEach((n) => { n.m.albedoColor = n.base.scale(1 + this.night * 2.4); });
    this.lampLights.forEach((l) => (l.intensity = this.night * 40));
  }
  private _sunDir = new Vector3(.5, .8, .4);

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
  private tree(x: number, z: number, s: number) {
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
    f.updateVerticesData(VertexBuffer.PositionKind, p, false, false);
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
    crossing(0, 7, false); crossing(0, -7, false); crossing(7, 0, true); crossing(-7, 0, true);
    crossing(30, -7, false); crossing(-30, 7, false);
    // Wimpelketten über den Straßen rund um den Platz (eine Form, viele Kopien mit eigener Farbe)
    const tri = new Mesh('wimpel', sc), vd = new VertexData();
    vd.positions = [-.35, 0, 0, .35, 0, 0, 0, -.7, 0]; vd.indices = [0, 1, 2]; vd.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1]; vd.applyToMesh(tri);
    tri.material = pbr(sc, 0xffffff, .8, 0, { double: true }); tri.parent = this.root;
    const lines: Array<[number, number, number, number]> = [[-28, 5, -28, 25], [-2, 5, -2, 25], [-25, 2, -5, 2], [-25, 28, -5, 28], [2, -25, 2, 25], [-25, -2, 25, -2]];
    const count = lines.length * 22, mats = new Float32Array(count * 16), colors = new Float32Array(count * 4);
    let k = 0;
    for (const [x1, z1, x2, z2] of lines) {
      const yaw = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
      for (let i = 0; i < 22; i++) {
        const u = i / 21, sag = Math.sin(u * Math.PI) * 1.4;
        Matrix.Compose(Vector3.One(), Quaternion.RotationAxis(Vector3.Up(), yaw), new Vector3(x1 + (x2 - x1) * u, 7.2 - sag, z1 + (z2 - z1) * u)).copyToArray(mats, k * 16);
        const c = col(PALETTES[0].colors[i % 6]); colors.set([c.r, c.g, c.b, 1], k * 4); k++;
      }
    }
    tri.thinInstanceSetBuffer('matrix', mats, 16, true); tri.thinInstanceSetBuffer('color', colors, 4, true);
    tri.alwaysSelectAsActiveMesh = true;
    // Flaggen an Hausecken entlang der Hauptstraße
    for (let z = -50; z <= 50; z += 20) if (Math.abs(z) > 8) this.flag(5.2, z + 5, PALETTES[(Math.abs(z) / 10) % PALETTES.length | 0].colors, 5, Math.PI / 2);
    // Ein paar Bäume an den Straßen
    for (let i = -5; i <= 5; i += 2) { this.tree(-34, i * 10 + 5, .8); this.tree(34, i * 10 - 5, .8); }
    // Echte Lichter nur nahe beim Spieler (spart Leistung)
    for (let i = 0; i < 4; i++) { const l = new PointLight('pool', new Vector3(0, -50, 0), sc); l.diffuse = col(0xffc98a); l.specular = col(0xffc98a, .5); l.range = 15; l.intensity = 0; this.poolLights.push(l); }
    for (const [x, z] of [[-15, 15], [5, -10]]) { const l = new PointLight('neonlight', new Vector3(x, 5, z), sc); l.diffuse = col(0xff7ad9); l.range = 26; l.intensity = 0; this.lampLights.push(l); }
  }

  /* Neon-Schilder über den Türen (leuchten nachts, Bloom auf hoher Stufe) */
  private signs() {
    for (const p of this.pois) {
      if (!p.sign) continue;
      const dir = Math.sign(p.x) || 1; // Tür zeigt zur Hauptstraße x = 0
      this.neonSign(p.sign, p.color!, p.x + dir * .3, 5.4, p.z, dir > 0 ? -Math.PI / 2 : Math.PI / 2, p.x + dir * .25);
    }
  }
  /** Leuchtschild mit Türrahmen (door = x-Position der Tür, sonst ohne Tür) */
  private neonSign(text: string, color: string, x: number, y: number, z: number, rot: number, door?: number, maxW = 8) {
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
    bx(.5, .5, 80, M(0x8c8579), -91.4, .25, 5);                     // Kaimauer
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
    // Container in Pride-Farben
    PALETTES[0].colors.forEach((c, i) => bx(6, 2.6, 2.4, M(c, .6), -82, 1.3 + Math.floor(i / 3) * 2.6, -27 + (i % 3) * 2.5));
    this.colliders.push({ x: -82, z: -24.5, hx: 3, hz: 3.7 });
    // Tram-Haltestelle, Laternen, Flaggen und Bänke am Kai
    bx(4, .12, 1.6, M(0xff4fa3, .5), -70, 3, 8);
    for (const x of [-71.8, -68.2]) { const p = bx(.12, 3, .12, M(0x9aa0aa), x, 1.5, 8); const node = new TransformNode('tp', sc); node.parent = this.root; p.parent = node; this.prop(x, 8, .2, [node]); }
    const tasks: Promise<unknown>[] = [];
    for (let z = -30; z <= 40; z += 14) tasks.push(this.place(C('streetlight'), -89.5, .1, z, Math.PI / 2).then((o) => this.prop(-89.5, z, .3, [o])));
    for (const z of [2, 16, 38]) tasks.push(this.place(C('bench'), -88.5, .1, z, -Math.PI / 2).then((o) => this.prop(-88.5, z, .95, [o])));
    await Promise.all(tasks);
    [PALETTES[0], PALETTES[2], PALETTES[3], PALETTES[5]].forEach((p, i) => this.flag(-90.5, -6 + i * 7.5, p.colors, 6, Math.PI / 2));
    for (const z of [-30, -21, 20, 34]) this.tree(-66.5, z, 1);
    for (const z of [-23, -9, 5, 19, 33]) this.palm(-88.6, z, 1 + rnd() * .25);
    for (const [x, z] of [[-94, 21], [-95, 27], [-93.5, 35], [-95.2, 40]]) this.palm(x, z, .9 + rnd() * .3);
  }

  /* ---------- Verkehr ---------- */
  private async spawnCars() {
    const loops: number[][][] = [
      [[-3, -57], [-3, 57]], [[3, 57], [3, -57]],
      [[-57, 3], [57, 3]], [[57, -3], [-57, -3]],
      [[27, -57], [27, 57]], [[-33, 57], [-33, -57]],
    ];
    for (let i = 0; i < loops.length; i++) {
      const o = await this.car(CARS[i % CARS.length]);
      const path = loops[i].map(([x, z]) => new Vector3(x, .1, z));
      this.cars.push({ o, path, seg: 0, u: rnd(), v: 7 + rnd() * 4, kind: CARS[i % CARS.length] });
    }
  }
  /** Auto als bewegliche Kopie (Wurzel mit visible) */
  async car(kind: string) {
    const inner = await instance(this.scene, C(kind));
    this.tune('car_', inner);
    const o = new Node3(kind, this.scene); inner.parent = o; inner.scaling.setAll(S); o.parent = this.root;
    return o;
  }

  /** Weitere Hindernisse für den Verkehr (geparkte/gefahrene Autos des Spielers) */
  extraBlock?: (x: number, z: number) => boolean;
  /** Spieler-Position, damit Autos bremsen */
  update(dt: number, t: number, player?: Vector3) {
    this.waveFlags(t);
    if (player && this.night > .05 && (this.poolT -= dt) <= 0) {
      this.poolT = .6;
      const near = this.lampSpots.map((q) => [Vector3.DistanceSquared(q, player), q] as const).sort((a, b) => a[0] - b[0]);
      this.poolLights.forEach((l, i) => { const q = near[i]?.[1]; if (q) l.position.set(q.x, q.y - .5, q.z); });
    }
    for (const c of this.cars) {
      const a = c.path[0], b = c.path[1];
      const len = Vector3.Distance(a, b);
      let speed = c.v;
      const p = c.o.position, ax = (b.x - a.x) / len, az = (b.z - a.z) / len;
      const blocked = (qx: number, qz: number, reach: number, wide: number) => {
        const dx = qx - p.x, dz = qz - p.z, along = dx * ax + dz * az, side = Math.abs(dx * az - dz * ax);
        return along > 0 && along < reach && side < wide;
      };
      if (player && blocked(player.x, player.z, 9, 2.2)) speed = 0;
      // anderen Autos nicht hinten auffahren und an Kreuzungen Vorfahrt lassen (feste Reihenfolge, damit sich nichts verklemmt)
      const me = this.cars.indexOf(c);
      for (let j = 0; j < this.cars.length && speed > 0; j++) {
        const o = this.cars[j]; if (o === c) continue;
        if (blocked(o.o.position.x, o.o.position.z, 7, 1.6) || (j < me && blocked(o.o.position.x, o.o.position.z, 6, 3.6))) speed = 0;
      }
      if (this.extraBlock && this.extraBlock(p.x + ax * 3.5, p.z + az * 3.5)) speed = 0;
      c.u += (speed * dt) / len;
      if (c.u > 1) c.u = 0;
      Vector3.LerpToRef(a, b, c.u, p);
      c.o.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    }
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
      else { const lim = HALF - 1; p.x = Math.max(-lim, Math.min(lim, p.x)); p.z = Math.max(-lim, Math.min(lim, p.z)); }
    }
    this.last.copyFrom(p);
  }
}
export { v3 };
