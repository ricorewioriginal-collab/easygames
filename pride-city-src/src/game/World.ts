/* Rainbow City – Innenstadt aus KayKit-City-Bausteinen, ergänzt um Pride-Deko: Regenbogen-Zebrastreifen, wehende Flaggen,
   Wimpelketten, Neon-Schilder, Bäume, fahrende Autos und ein Tag-/Nacht-Himmel. Alles mit geteilten Geometrien/Materialien. */
import * as THREE from 'three';
import { instance, preload } from '../engine/Assets';
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
export interface Rect { x: number; z: number; hx: number; hz: number }

const isRoad = (i: number) => i % 3 === 0;
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

export class World {
  readonly root = new THREE.Group();
  readonly colliders: Rect[] = [];
  readonly pois: Poi[] = [];
  readonly sun = new THREE.DirectionalLight(0xffffff, 2.2);
  readonly hemi = new THREE.HemisphereLight(0xbfd8ff, 0x4a3a5a, 1.1);
  private sky!: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private flagMat: THREE.MeshStandardMaterial[] = [];
  private flagTime = { value: 0 };
  private lamps: THREE.MeshBasicMaterial;
  private neon: THREE.MeshBasicMaterial[] = [];
  private cars: Array<{ o: THREE.Object3D; path: THREE.Vector3[]; seg: number; u: number; v: number }> = [];
  private lampLights: THREE.PointLight[] = [];
  night = 0;

  static load() { return preload(CITY_FILES); }

  constructor(private scene: THREE.Scene) {
    this.lamps = new THREE.MeshBasicMaterial({ color: 0xfff2c0 });
    scene.add(this.root);
  }

  async build() {
    this.buildSky();
    this.root.add(this.hemi);
    const sun = this.sun;
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -38; sc.right = 38; sc.top = 38; sc.bottom = -38; sc.near = 1; sc.far = 160;
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .04;
    this.root.add(sun, sun.target);

    // Boden
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x6fae5a, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; ground.receiveShadow = true; this.root.add(ground);

    this.definePois();
    const special = new Map<string, Poi>();
    for (const p of this.pois) special.set(this.blockOf(p.x, p.z), p);

    const tasks: Promise<void>[] = [];
    for (let ix = -N; ix <= N; ix++) for (let iz = -N; iz <= N; iz++) {
      const x = ix * TILE, z = iz * TILE;
      if (isRoad(ix) || isRoad(iz)) { tasks.push(this.road(ix, iz, x, z)); continue; }
      tasks.push(this.place(C('base'), x, 0, z, 0, S, true));
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
      if (door) kind = door.id === 'club' ? 'building_H' : door.id === 'center' ? 'building_G' : door.id === 'home' ? 'building_E' : door.id === 'cafe' ? 'building_B' : 'building_C';
      tasks.push(this.place(C(kind), x, .1, z, rot));
      this.colliders.push({ x, z, hx: TILE * .4, hz: TILE * .4 });
    }
    await Promise.all(tasks);
    this.plaza(); this.park(); this.decorate(); this.signs();
    await this.spawnCars();
    this.setTime(.3);
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
    P('park', 'Regenbogenpark', '🌳', 45, 45, undefined, undefined, 8);
    P('tram', 'Tram Rainbow City', '🚋', 0, 52, undefined, undefined, 4);
  }

  private async place(path: string, x: number, y: number, z: number, rot: number, s = S, flat = false) {
    const o = await instance(path);
    o.position.set(x, y, z); o.rotation.y = rot; o.scale.set(s, flat ? 1 : s, s);
    o.matrixAutoUpdate = false; o.updateMatrix(); o.traverse((c) => { c.matrixAutoUpdate = false; c.updateMatrix(); });
    this.root.add(o);
  }

  private async road(ix: number, iz: number, x: number, z: number) {
    const rx = isRoad(ix), rz = isRoad(iz);
    if (rx && rz) {
      const edgeX = Math.abs(ix) === N, edgeZ = Math.abs(iz) === N;
      if (edgeX && edgeZ) return this.place(C('road_corner'), x, 0, z, ix > 0 ? (iz > 0 ? Math.PI : -Math.PI / 2) : (iz > 0 ? Math.PI / 2 : 0), S, true);
      if (edgeX) return this.place(C('road_tsplit'), x, 0, z, ix > 0 ? Math.PI / 2 : -Math.PI / 2, S, true);
      if (edgeZ) return this.place(C('road_tsplit'), x, 0, z, iz > 0 ? 0 : Math.PI, S, true);
      return this.place(C('road_junction'), x, 0, z, 0, S, true);
    }
    await this.place(C('road_straight'), x, 0, z, rx ? 0 : Math.PI / 2, S, true);
    // Laternen am Rand, jede zweite Kachel
    if ((ix + iz) % 2 === 0) {
      const side = rx ? [x + TILE * .44, z] : [x, z + TILE * .44];
      await this.place(C('streetlight'), side[0], .1, side[1], rx ? Math.PI : -Math.PI / 2);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 6), this.lamps);
      bulb.position.set(side[0] + (rx ? -1.05 : 0), 4.55, side[1] + (rx ? 0 : -1.05));
      this.root.add(bulb);
    }
  }

  /* ---------- Himmel ---------- */
  private buildSky() {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, stars: { value: 0 } },
      vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 bot; uniform float stars; varying vec3 vp;
        float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        void main(){ float y = max(vp.y, 0.0); vec3 c = mix(bot, top, pow(y, .55));
          vec3 q = floor(vp*220.0); float s = step(.997, h(q)) * stars * smoothstep(.05,.4,y);
          gl_FragColor = vec4(c + s, 1.0); }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(280, 24, 12), m);
    this.root.add(this.sky);
    this.scene.fog = new THREE.Fog(0xcfe3ff, 70, 230);
  }

  /** t: Tagesanteil 0..1, 0 = 6:00 Uhr */
  setTime(t: number) {
    const hour = (6 + t * 24) % 24;
    const ang = ((hour - 6) / 12) * Math.PI; // 6 Uhr Aufgang, 18 Uhr Untergang
    const up = Math.sin(ang);
    const day = THREE.MathUtils.smoothstep(up, -.15, .25);
    this.night = 1 - day;
    const dusk = Math.max(0, 1 - Math.abs(up) * 4) * (up > -.3 ? 1 : 0);
    const top = new THREE.Color(0x1a1450).lerp(new THREE.Color(0x3d7fe0), day).lerp(new THREE.Color(0x5b3a9a), dusk * .6);
    const bot = new THREE.Color(0x4a2a78).lerp(new THREE.Color(0xcfe6ff), day).lerp(new THREE.Color(0xff8a6a), dusk * .8);
    this.sky.material.uniforms.top.value.copy(top);
    this.sky.material.uniforms.bot.value.copy(bot);
    this.sky.material.uniforms.stars.value = this.night;
    (this.scene.fog as THREE.Fog).color.copy(bot);
    this.sun.intensity = .55 + 1.9 * day;
    this.sun.color.setHex(0x8fa0ff).lerp(new THREE.Color(0xffffff), day).lerp(new THREE.Color(0xffa060), dusk);
    this.hemi.intensity = 1.0 + .5 * day;
    this.hemi.color.setHex(0x7a6cff).lerp(new THREE.Color(0xbfd8ff), day);
    this._sunDir.set(Math.cos(ang) * .8, Math.max(.25, Math.abs(up)), .45).normalize();
    this.lamps.color.setRGB(1, .95, .75).multiplyScalar(.6 + this.night * 3.2);
    this.neon.forEach((m) => { m.color.copy((m.userData.base as THREE.Color)).multiplyScalar(1 + this.night * 2.4); });
    this.lampLights.forEach((l) => (l.intensity = this.night * 40));
  }
  private _sunDir = new THREE.Vector3(.5, .8, .4);

  /** Schatten folgen dem Spieler */
  follow(p: THREE.Vector3) {
    this.sun.position.copy(p).addScaledVector(this._sunDir, 60);
    this.sun.target.position.copy(p);
    this.sky.position.copy(p).setY(0);
  }

  /* ---------- Pride Plaza und Park ---------- */
  private plaza() {
    const cx = -15, cz = 15;
    // Regenbogen-Ring auf dem Boden
    const ring = new THREE.Group();
    PALETTES[0].colors.forEach((c, i) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(3.2 + i * .7, 3.9 + i * .7, 48), new THREE.MeshStandardMaterial({ color: c, roughness: .8 }));
      m.rotation.x = -Math.PI / 2; m.position.y = .13 + i * .001; m.receiveShadow = true; ring.add(m);
    });
    ring.position.set(cx, 0, cz); this.root.add(ring);
    // Brunnen in der Mitte
    const stone = new THREE.MeshStandardMaterial({ color: 0xe9e2f5, roughness: .6 });
    const f1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, .8, 24), stone); f1.position.set(cx, .5, cz); f1.castShadow = f1.receiveShadow = true;
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, .1, 24), new THREE.MeshStandardMaterial({ color: 0x4fc3ff, roughness: .1, metalness: .2, emissive: 0x0a3050 }));
    water.position.set(cx, .88, cz);
    const f2 = new THREE.Mesh(new THREE.CylinderGeometry(.35, .5, 2.4, 12), stone); f2.position.set(cx, 1.6, cz); f2.castShadow = true;
    this.root.add(f1, water, f2);
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
      this.place(C('bench'), cx + Math.cos(a) * 6, .1, cz + Math.sin(a) * 6, -a + Math.PI / 2);
    }
    // Bühne für Events
    const stage = new THREE.Mesh(new THREE.BoxGeometry(7, .6, 3.4), new THREE.MeshStandardMaterial({ color: 0x2a1d44, roughness: .5 }));
    stage.position.set(cx, .4, cz - 7.6); stage.castShadow = stage.receiveShadow = true; this.root.add(stage);
    this.colliders.push({ x: cx, z: cz - 7.6, hx: 3.5, hz: 1.7 });
  }

  private park() {
    const cx = 45, cz = 45;
    for (let i = 0; i < 16; i++) this.tree(cx + (rnd() - .5) * 18, cz + (rnd() - .5) * 18, .9 + rnd() * .6);
    for (let i = 0; i < 10; i++) this.place(C('bush'), cx + (rnd() - .5) * 18, .1, cz + (rnd() - .5) * 18, rnd() * 6, S * 1.4);
    this.place(C('watertower'), cx + 6, .1, cz - 6, 0);
    this.colliders.push({ x: cx + 6, z: cz - 6, hx: 1.4, hz: 1.4 });
  }

  private treeGeo = { trunk: new THREE.CylinderGeometry(.18, .26, 1.6, 6), top: new THREE.IcosahedronGeometry(1.3, 0) };
  private treeMat = { trunk: new THREE.MeshStandardMaterial({ color: 0x7a4a2a, flatShading: true }), top: [0x4caf50, 0x66bb6a, 0x9ccc65, 0xff8fb1].map((c) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .9 })) };
  private tree(x: number, z: number, s: number) {
    const g = new THREE.Group();
    const t = new THREE.Mesh(this.treeGeo.trunk, this.treeMat.trunk); t.position.y = .8; t.castShadow = true;
    const top = new THREE.Mesh(this.treeGeo.top, this.treeMat.top[Math.floor(rnd() * 4)]); top.position.y = 2.3; top.castShadow = true;
    const top2 = top.clone(); top2.scale.setScalar(.7); top2.position.set(.5, 3.1, .2);
    g.add(t, top, top2); g.position.set(x, 0, z); g.scale.setScalar(s * 1.6); g.rotation.y = rnd() * 6;
    this.root.add(g);
    this.colliders.push({ x, z, hx: .5, hz: .5 });
  }

  /* ---------- Flaggen, Zebrastreifen, Wimpel ---------- */
  private flagTex(colors: string[]) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d')!;
    colors.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, (i * 64) / colors.length, 64, Math.ceil(64 / colors.length) + 1); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  private flagGeo = new THREE.PlaneGeometry(2.4, 1.5, 12, 4).translate(1.2, 0, 0);
  private poleGeo = new THREE.CylinderGeometry(.06, .06, 1, 6);
  private poleMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: .6, roughness: .3 });
  flag(x: number, z: number, colors: string[], h: number, rot: number) {
    const mat = new THREE.MeshStandardMaterial({ map: this.flagTex(colors), side: THREE.DoubleSide, roughness: .8 });
    const ft = this.flagTime;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.ft = ft;
      sh.vertexShader = 'uniform float ft;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n float w = position.x / 2.4; transformed.z += sin(position.x * 2.6 - ft * 4.0 + position.y) * .22 * w; transformed.y -= w * w * .15;');
    };
    this.flagMat.push(mat);
    const pole = new THREE.Mesh(this.poleGeo, this.poleMat); pole.scale.y = h; pole.position.set(x, h / 2, z); pole.castShadow = true;
    const f = new THREE.Mesh(this.flagGeo, mat); f.position.set(x, h - .8, z); f.rotation.y = rot; f.castShadow = true;
    this.root.add(pole, f);
  }

  private decorate() {
    // Regenbogen-Zebrastreifen an allen vier Seiten der Hauptkreuzung und vor dem Club
    const cols = PALETTES[0].colors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: .7 }));
    const stripe = new THREE.PlaneGeometry(1.1, 7.4);
    const crossing = (x: number, z: number, alongX: boolean) => {
      cols.forEach((m, i) => {
        const s = new THREE.Mesh(stripe, m); s.rotation.x = -Math.PI / 2; s.receiveShadow = true;
        const off = (i - 2.5) * 1.15;
        if (alongX) { s.position.set(x + off, .115, z); }
        else { s.rotation.z = Math.PI / 2; s.position.set(x, .115, z + off); }
        this.root.add(s);
      });
    };
    crossing(0, 7, false); crossing(0, -7, false); crossing(7, 0, true); crossing(-7, 0, true);
    crossing(30, -7, false); crossing(-30, 7, false);
    // Wimpelketten über den Straßen rund um den Platz
    const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.35, 0, 0), new THREE.Vector3(.35, 0, 0), new THREE.Vector3(0, -.7, 0)]);
    tri.computeVertexNormals();
    const triMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .8 });
    const lines: Array<[number, number, number, number]> = [[-28, 5, -28, 25], [-2, 5, -2, 25], [-25, 2, -5, 2], [-25, 28, -5, 28], [2, -25, 2, 25], [-25, -2, 25, -2]];
    const count = lines.length * 22;
    const inst = new THREE.InstancedMesh(tri, triMat, count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    let k = 0;
    for (const [x1, z1, x2, z2] of lines) {
      const yaw = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
      for (let i = 0; i < 22; i++) {
        const u = i / 21, sag = Math.sin(u * Math.PI) * 1.4;
        m4.compose(new THREE.Vector3(x1 + (x2 - x1) * u, 7.2 - sag, z1 + (z2 - z1) * u), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1));
        inst.setMatrixAt(k, m4); inst.setColorAt(k, col.set(PALETTES[0].colors[i % 6])); k++;
      }
    }
    this.root.add(inst);
    // Flaggen an Hausecken entlang der Hauptstraße
    for (let z = -50; z <= 50; z += 20) if (Math.abs(z) > 8) this.flag(5.2, z + 5, PALETTES[(Math.abs(z) / 10) % PALETTES.length | 0].colors, 5, Math.PI / 2);
    // Ein paar Bäume an den Straßen
    for (let i = -5; i <= 5; i += 2) { this.tree(-34, i * 10 + 5, .8); this.tree(34, i * 10 - 5, .8); }
    // Echte Lichter nur am Platz (spart Leistung)
    for (const [x, z] of [[-15, 15], [5, -10]]) { const l = new THREE.PointLight(0xff7ad9, 0, 26, 1.6); l.position.set(x, 5, z); this.root.add(l); this.lampLights.push(l); }
  }

  /* Neon-Schilder über den Türen (leuchten nachts, Bloom auf hoher Stufe) */
  private signs() {
    for (const p of this.pois) {
      if (!p.sign) continue;
      const c = document.createElement('canvas'); c.width = 512; c.height = 128;
      const g = c.getContext('2d')!;
      g.fillStyle = 'rgba(10,6,24,.85)'; g.fillRect(0, 0, 512, 128);
      g.font = '900 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = p.color!; g.shadowBlur = 18; g.fillStyle = p.color!; g.fillText(p.sign, 256, 68);
      g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = .7; g.fillText(p.sign, 256, 68);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true });
      m.userData.base = new THREE.Color(1, 1, 1);
      this.neon.push(m);
      const w = Math.min(8, 2 + p.sign.length * .5);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), m);
      const dir = Math.sign(p.x) || 1; // Tür zeigt zur Hauptstraße x = 0
      s.position.set(p.x + dir * .3, 5.4, p.z); s.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.root.add(s);
      // Leuchtender Türrahmen
      const door = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color!).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: .55 }));
      door.position.set(p.x + dir * .25, 1.7, p.z); door.rotation.y = s.rotation.y; this.root.add(door);
    }
  }

  /* ---------- Verkehr ---------- */
  private async spawnCars() {
    const loops: number[][][] = [
      [[-3, -57], [-3, 57]], [[3, 57], [3, -57]],
      [[-57, 3], [57, 3]], [[57, -3], [-57, -3]],
      [[27, -57], [27, 57]], [[-33, 57], [-33, -57]],
    ];
    for (let i = 0; i < loops.length; i++) {
      const o = await instance(C(CARS[i % CARS.length]));
      o.scale.setScalar(S); this.root.add(o);
      const path = loops[i].map(([x, z]) => new THREE.Vector3(x, .1, z));
      this.cars.push({ o, path, seg: 0, u: rnd(), v: 7 + rnd() * 4 });
    }
  }

  /** Spieler-Position, damit Autos bremsen */
  update(dt: number, t: number, player?: THREE.Vector3) {
    this.flagTime.value = t;
    for (const c of this.cars) {
      const a = c.path[0], b = c.path[1];
      const len = a.distanceTo(b);
      let speed = c.v;
      if (player) {
        const p = new THREE.Vector3().lerpVectors(a, b, c.u);
        const ahead = new THREE.Vector3().subVectors(b, a).normalize();
        const d = new THREE.Vector3().subVectors(player, p);
        const along = d.dot(ahead), side = Math.abs(d.x * ahead.z - d.z * ahead.x);
        if (along > 0 && along < 9 && side < 2.2) speed = 0;
      }
      c.u += (speed * dt) / len;
      if (c.u > 1) c.u = 0;
      c.o.position.lerpVectors(a, b, c.u);
      c.o.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    }
  }

  /** Kreis gegen Rechtecke, verschiebt p aus Hindernissen heraus */
  collide(p: THREE.Vector3, r: number) {
    for (const c of this.colliders) {
      const dx = p.x - c.x, dz = p.z - c.z;
      const px = c.hx + r - Math.abs(dx), pz = c.hz + r - Math.abs(dz);
      if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
    }
    const lim = HALF - 1;
    p.x = Math.max(-lim, Math.min(lim, p.x)); p.z = Math.max(-lim, Math.min(lim, p.z));
  }
}
