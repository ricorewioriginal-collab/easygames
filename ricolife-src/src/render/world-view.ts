// Welt-Renderer von RicoLife 3D (Three.js). Stadtbild, Grundstücke (Wände, Böden, Dächer, Objekte), Umgebung und Picking.
//
// Konventionen (verbindlich für Kamera/Eingabe/Figuren):
// - Welt: x nach Osten, z nach Süden, y nach oben, 1 Kachel = 1 m. Kachel (x, z) belegt [x, x+1] × [z, z+1], Mitte = (x+0.5, z+0.5).
// - Etage l liegt auf y = l·LEVEL_H (3 m). Erdgeschoss-Bodenbelag hat Oberkante FLOOR_Y (0.03 m); Figuren im EG also auf y = FLOOR_Y.
// - Objekte: Position = world.centerOf(o), Drehung rotation.y = r·π/2 (passt zu rotLocal). Lokale Vorderseite = +z.
//   Wandobjekte werden um die halbe Wandstärke (0.06 m) nach vorn versetzt; Flächenobjekte stehen auf surfaceTop() des Trägers.
// - Öffnungen (Tür/Fenster): Mitte = world.centerOf(o) auf der Kante; Drehung = (dir === 1 ? 90° : 0°) + (r ≥ 2 ? 180° : 0°).
//   dir 0, r 0 → Vorderseite (+z lokal) zeigt nach Süden; dir 1, r 0 → nach Osten.
// - cameraYaw (setView): Kamera steht bei focus + (sin(yaw), ·, cos(yaw))·Abstand. yaw = 0 → Kamera im Süden, blickt nach Norden.
// - Fokus-Grundstücke: Lots, deren Rechteck (um 4 m erweitert) den Fokus enthält. Nur dort wirken Etagenfilter, Schnittansicht
//   und Dach-Ausblendung; alle anderen Lots werden vollständig mit Dach gezeigt.
//   Dach des Fokus-Lots sichtbar nur bei mode 'up' und level ≥ oberste genutzte Etage des Lots.
// - Kamera: far ≥ 400 empfohlen (Himmelskuppel skaliert auf 0.9·far). Farben sind für NoToneMapping + sRGB-Ausgabe abgestimmt.
// - Der Renderer setzt renderer.shadowMap.enabled/type selbst (setQuality).
//
// Zusätzliche öffentliche Hilfen:
// - WorldView.stats(): { lots, tris } für Debug-Overlays.
// - WorldView.focusedLots: Set der aktuell fokussierten Lot-IDs.
// - Paletten für Wände/Böden: src/render/palette.ts (WALL_STYLES, FLOOR_STYLES), Wall.a/b und floors-Werte sind Indizes darin.
// - Konstanten FLOOR_Y, WALL_T aus lot-builder.ts.
import * as THREE from 'three';
import { LOTS, type LotDef } from '../data/lots';
import type { Season, WeatherId } from '../data/types';
import { buildTerrain } from '../world/map';
import { LEVELS, LEVEL_H, MAP_H, MAP_W, Ter, type World } from '../world/world';
import { Environment, type Quality } from './environment';
import { FLOOR_Y, FULL_VARIANT, buildLot, makeLotOut, objFlags, type LotOut, type LotVariant, type PickBox } from './lot-builder';
import { objectGeometry, objectMaterial } from './object-mesh';
import { TEX_EXTRA, TEX_ROWS, TEX_H, TEX_W, WATER_Y, buildStatic, buildTerrainTexture, leafColor } from './static-world';
import { WATER_X } from '../world/map';

export { FLOOR_Y } from './lot-builder';
export type ViewMode = 'up' | 'cut' | 'down';

interface LotView {
  lot: LotDef;
  pub: boolean;
  version: number;
  sig: number;
  variantKey: string;
  wantKey: string;
  variant: LotVariant;
  shell: THREE.Mesh;
  indoor: THREE.Mesh;
  glass: THREE.Mesh;
  emis: THREE.Mesh;
  shellMarks: number[];
  indoorMarks: number[];
  glassMarks: number[];
  emisMarks: number[];
  picks: PickBox[];
  lights: Float32Array;
  topLevel: number;
  focused: boolean;
  visLevel: number;
  roofShown: boolean;
  indoorVisible: boolean;
  lastBuild: number;
  built: boolean;
  cx: number;
  cz: number;
  radius: number;
  tris: number;
}

const PUB_LOT: LotDef = { id: '__pub', name: 'Öffentlich', district: 'hafen', kind: 'community', venue: 'park', x: 0, z: 0, w: 0, d: 0, front: 0, template: 'empty', land: 0, desc: '' };
const EMPTY_GEO = new THREE.BufferGeometry();

export class WorldView {
  readonly scene = new THREE.Scene();
  readonly focusedLots = new Set<string>();
  private readonly env: Environment;
  private quality: Quality;
  private shadows: boolean;
  private lots = new Map<string, LotView>();
  private lotOrder: LotView[] = [];
  private scratch: LotOut = makeLotOut();
  private staticGroup = new THREE.Group();
  private foliage: { mesh: THREE.Mesh; meta: Float32Array }[] = [];
  private boats: THREE.Mesh | null = null;
  private lampPos: Float32Array = new Float32Array(0);
  private terrainTex: THREE.DataTexture | null = null;
  private ownMats: THREE.Material[] = [];
  private terrainMat: THREE.MeshLambertMaterial;
  private waterMat: THREE.MeshPhongMaterial;
  private foliageMat: THREE.MeshLambertMaterial;
  private windowMat: THREE.MeshBasicMaterial;
  private highlightMat = new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, blending: THREE.AdditiveBlending });
  private highlightMesh: THREE.Mesh;
  private highlightId: string | null = null;
  private pickIndex = new Map<string, { lv: LotView; p: PickBox }>();
  private proxies = new Map<string, THREE.Object3D>();
  private grid: THREE.LineSegments | null = null;
  private gridKey = '';
  private pointLights: THREE.PointLight[] = [];
  private mode: ViewMode = 'up';
  private level = 0;
  private focus = { x: 80, z: 50 };
  private time = 0;
  private sigTimer = 0;
  private lightTimer = 0;
  private firstSync = true;
  private sigMap = new Map<string, number>();
  private leafKey = '';
  private staticTris = 0;
  private readonly _tc = new THREE.Color();
  private readonly _v = new THREE.Vector3();
  private readonly _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private disposed = false;

  constructor(
    private readonly world: World,
    private readonly renderer: THREE.WebGLRenderer,
    opts: { quality: Quality; shadows: boolean },
  ) {
    this.quality = opts.quality;
    this.shadows = opts.shadows;
    this.scene.name = 'RicoLife-Welt';
    this.env = new Environment(this.scene);
    const U = this.env.uniforms;

    this.terrainMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.terrainMat.onBeforeCompile = (sh) => {
      sh.uniforms.uSnow = U.uSnow;
      sh.uniforms.uWet = U.uWet;
      sh.uniforms.uGrassTint = U.uGrassTint;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uSnow; uniform float uWet; uniform vec3 uGrassTint;')
        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP
            vec4 tx = texture2D( map, vMapUv );
            float m = tx.a;
            vec3 tc = tx.rgb;
            float gr = smoothstep(0.86, 0.95, m);
            tc *= mix(vec3(1.0), uGrassTint, gr);
            tc *= 1.0 - 0.3 * uWet * (1.0 - 0.6 * gr);
            vec2 cell = floor(vMapUv * vec2(${TEX_W / 2}.0, ${TEX_ROWS / 2}.0));
            float nz = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
            float sn = clamp(uSnow * (m * 1.15 - 0.05) * (0.82 + 0.18 * nz), 0.0, 1.0);
            tc = mix(tc, vec3(0.9, 0.93, 0.97), sn);
            diffuseColor.rgb *= tc;
          #endif`,
        );
    };
    this.terrainMat.customProgramCacheKey = () => 'rl-terrain';

    this.waterMat = new THREE.MeshPhongMaterial({ color: 0x3d8db0, specular: 0x9fc8e0, shininess: 90 });
    this.waterMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = U.uTime;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime; varying vec3 vWPos;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vec4 wp0 = modelMatrix * vec4(transformed, 1.0);
           transformed.y += sin(wp0.x * 0.32 + uTime * 1.2) * 0.05 + sin(wp0.z * 0.45 + uTime * 0.8) * 0.04;
           vWPos = wp0.xyz;`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uTime; varying vec3 vWPos;')
        .replace(
          '#include <normal_fragment_begin>',
          `#include <normal_fragment_begin>
           vec3 wn = vec3(sin(vWPos.x * 1.7 + uTime * 1.6) * 0.09 + sin(vWPos.z * 2.9 - uTime * 1.1) * 0.05, 0.0,
                          cos(vWPos.z * 1.5 + uTime * 1.3) * 0.09 + sin(vWPos.x * 3.1 + uTime * 0.9) * 0.05);
           normal = normalize(normal + (viewMatrix * vec4(wn, 0.0)).xyz);`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
           float wv = sin(vWPos.x * 0.6 + uTime * 0.7) * sin(vWPos.z * 0.5 - uTime * 0.5);
           diffuseColor.rgb *= 0.92 + 0.1 * wv;
           float shore = smoothstep(${WATER_X + 3}.0, ${WATER_X}.0, vWPos.x);
           diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.78, 0.82), shore * 0.35);`,
        );
    };
    this.waterMat.customProgramCacheKey = () => 'rl-water';

    this.foliageMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.foliageMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = U.uTime;
      sh.uniforms.uWind = U.uWind;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uWind;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float sw = max(transformed.y - 1.0, 0.0) * 0.035 * uWind;
           transformed.x += sin(uTime * 1.7 + transformed.x * 0.4 + transformed.z * 0.3) * sw;
           transformed.z += cos(uTime * 1.3 + transformed.z * 0.4) * sw * 0.6;`,
        );
    };
    this.foliageMat.customProgramCacheKey = () => 'rl-foliage';

    this.windowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.windowMat.onBeforeCompile = (sh) => {
      sh.uniforms.uNight = U.uNight;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uNight;')
        .replace(
          '#include <color_fragment>',
          `#if defined( USE_COLOR )
             float lit = step(0.5, vColor.r);
             vec3 dayC = vec3(0.2, 0.3, 0.42) * (0.75 + 0.5 * vColor.g);
             vec3 nightC = mix(vec3(0.03, 0.04, 0.07), vec3(1.0, 0.66, 0.32) * (0.7 + 0.4 * vColor.g), lit);
             diffuseColor.rgb = mix(dayC, nightC, smoothstep(0.15, 0.7, uNight));
           #endif`,
        );
    };
    this.windowMat.customProgramCacheKey = () => 'rl-windows';
    this.ownMats.push(this.terrainMat, this.waterMat, this.foliageMat, this.windowMat, this.highlightMat);

    this.highlightMesh = new THREE.Mesh(EMPTY_GEO, this.highlightMat);
    this.highlightMesh.visible = false;
    this.highlightMesh.renderOrder = 4;
    this.highlightMesh.name = 'highlight';
    this.scene.add(this.highlightMesh, this.staticGroup);

    this.setQuality(opts.quality, opts.shadows);
    this.env.set(12 * 60, 'spring', 'sunny', 0);
  }

  // ======================= Statische Stadt =======================
  buildStatic(): void {
    this.clearStatic();
    const w = this.world;
    // Gelände noch nicht gebaut? (alles Gras) → nachholen
    let hasRoad = false;
    for (let i = 0; i < w.terrain.length && !hasRoad; i += 7) if (w.terrain[i] === Ter.Road) hasRoad = true;
    if (!hasRoad) buildTerrain(w);

    const g = this.staticGroup;
    // Gelände: eine Fläche mit Textur
    this.terrainTex = buildTerrainTexture(w);
    this.terrainTex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    this.terrainMat.map = this.terrainTex;
    this.terrainMat.needsUpdate = true;
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 0, MAP_H, WATER_X, 0, MAP_H, WATER_X, 0, 0]), 3));
    tg.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    const vm = TEX_H / TEX_ROWS;
    tg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 0, vm, 1, vm, 1, 0]), 2));
    tg.setIndex([0, 1, 2, 0, 2, 3]);
    tg.computeBoundingSphere();
    const terrain = new THREE.Mesh(tg, this.terrainMat);
    terrain.receiveShadow = true;
    terrain.name = 'terrain';
    terrain.renderOrder = -2;
    g.add(terrain);

    // Umland (gleiches Material wie das Gelände, UV zeigt auf eine reine Wiesenkachel → Jahreszeit/Schnee wirken mit)
    {
      const u = 0.5, v = (TEX_H + TEX_EXTRA / 2) / TEX_ROWS;
      const E = -0.02;
      const q = [
        [-500, MAP_H, WATER_X, 600], [-500, -500, WATER_X, 0], [-500, 0, 0, MAP_H],
      ];
      const pos: number[] = [], uv: number[] = [], nrm: number[] = [];
      for (const [ax, az, bx, bz] of q) {
        pos.push(ax!, E, az!, ax!, E, bz!, bx!, E, bz!, ax!, E, az!, bx!, E, bz!, bx!, E, az!);
        for (let i = 0; i < 6; i++) { uv.push(u, v); nrm.push(0, 1, 0); }
      }
      const og = new THREE.BufferGeometry();
      og.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      og.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrm), 3));
      og.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
      og.computeBoundingSphere();
      const out = new THREE.Mesh(og, this.terrainMat);
      out.receiveShadow = true;
      out.name = 'outskirts';
      out.renderOrder = -2;
      g.add(out);
    }
    // Wasser
    const wg = new THREE.PlaneGeometry(460, 1100, 46, 110);
    wg.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(wg, this.waterMat);
    water.position.set(WATER_X + 230, WATER_Y, 50);
    water.receiveShadow = true;
    water.name = 'water';
    g.add(water);

    const st = buildStatic(w);
    this.staticTris = st.tris + 2;
    const solidMat = objectMaterial('solid');
    const ground = new THREE.Mesh(st.ground, solidMat);
    ground.receiveShadow = true;
    ground.name = 'ground';
    g.add(ground);
    st.solid.forEach((geo, i) => {
      if (!geo.getAttribute('position').count) return geo.dispose();
      const m = new THREE.Mesh(geo, solidMat);
      m.castShadow = m.receiveShadow = true;
      m.name = `static-${i}`;
      g.add(m);
    });
    st.foliage.forEach((geo, i) => {
      if (!geo.getAttribute('position').count) return geo.dispose();
      const m = new THREE.Mesh(geo, this.foliageMat);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = `foliage-${i}`;
      g.add(m);
      this.foliage.push({ mesh: m, meta: st.foliageMeta[i]! });
    });
    const lamps = new THREE.Mesh(st.lamps, this.env.lampMat);
    lamps.name = 'lamps';
    g.add(lamps);
    const win = new THREE.Mesh(st.windows, this.windowMat);
    win.name = 'apt-windows';
    g.add(win);
    this.boats = new THREE.Mesh(st.boats, solidMat);
    this.boats.castShadow = true;
    this.boats.name = 'boats';
    g.add(this.boats);
    this.lampPos = st.lampPos;
    this.leafKey = '';
    this.recolorFoliage();
  }

  private clearStatic(): void {
    for (const c of [...this.staticGroup.children]) {
      this.staticGroup.remove(c);
      (c as THREE.Mesh).geometry?.dispose();
    }
    this.foliage = [];
    this.boats = null;
    this.terrainTex?.dispose();
    this.terrainTex = null;
  }

  private recolorFoliage(): void {
    const env = this.env;
    const season = env.season;
    const p = Math.min(1, env.dayOfSeason / 6);
    const snow = season === 'winter' ? (env.weather === 'snow' ? 1 : 0.7) : 0;
    const key = `${season}|${Math.round(p * 6)}|${snow}`;
    if (key === this.leafKey) return;
    this.leafKey = key;
    const c = this._tc;
    for (const f of this.foliage) {
      const attr = f.mesh.geometry.getAttribute('color') as THREE.BufferAttribute;
      const arr = attr.array as Uint8Array;
      const m = f.meta;
      for (let i = 0; i < m.length; i += 3) {
        leafColor(Math.round(m[i]! * 10), m[i + 1]!, m[i + 2]!, season, p, snow, c);
        arr[i] = Math.min(255, c.r * 255);
        arr[i + 1] = Math.min(255, c.g * 255);
        arr[i + 2] = Math.min(255, c.b * 255);
      }
      attr.needsUpdate = true;
    }
  }

  // ======================= Grundstücke =======================
  private makeLotView(lot: LotDef, pub: boolean): LotView {
    const mk = (mat: THREE.Material, name: string, shadow: boolean): THREE.Mesh => {
      const m = new THREE.Mesh(EMPTY_GEO, mat);
      m.name = `${lot.id}-${name}`;
      m.castShadow = shadow;
      m.receiveShadow = shadow;
      m.visible = false;
      this.scene.add(m);
      return m;
    };
    const lv: LotView = {
      lot, pub, version: -1, sig: -1, variantKey: '', wantKey: 'full', variant: FULL_VARIANT,
      shell: mk(objectMaterial('solid'), 'shell', true),
      indoor: mk(objectMaterial('solid'), 'indoor', true),
      glass: mk(objectMaterial('glass'), 'glass', false),
      emis: mk(objectMaterial('emissive'), 'emis', false),
      shellMarks: [0, 0, 0], indoorMarks: [0, 0], glassMarks: [0, 0], emisMarks: [0, 0], picks: [], lights: new Float32Array(0),
      topLevel: 0, focused: false, visLevel: LEVELS - 1, roofShown: true, indoorVisible: true, lastBuild: -1, built: false,
      cx: lot.x + lot.w / 2, cz: lot.z + lot.d / 2, radius: Math.hypot(lot.w, lot.d) / 2, tris: 0,
    };
    lv.glass.renderOrder = 2;
    if (pub) {
      lv.cx = MAP_W / 2;
      lv.cz = MAP_H / 2;
      lv.radius = 1e4;
    }
    this.lots.set(lot.id, lv);
    this.lotOrder.push(lv);
    return lv;
  }

  private ensureLotViews(): void {
    if (this.lotOrder.length) return;
    for (const lot of LOTS) this.makeLotView(lot, false);
    this.makeLotView(PUB_LOT, true);
  }

  /** Zustands-/Positionssignatur je Lot (fängt auch Änderungen ohne world.touch ab) */
  private computeSigs(): void {
    const m = this.sigMap;
    for (const k of m.keys()) m.set(k, 0);
    for (const o of this.world.objs.values()) {
      const key = this.lots.has(o.lot) && o.lot !== PUB_LOT.id ? o.lot : PUB_LOT.id;
      const s = o.st;
      const h =
        ((o.x * 73856093) ^ (o.z * 19349663) ^ (o.l * 83492791) ^ (o.r * 7919) ^ ((o.ca ?? 0) * 104729) ^ ((o.cb ?? 0) * 1299709) ^ ((o.dir ?? 0) * 31) ^ (o.def.length * 4099) ^
          (s?.on ? 1 << 20 : 0) ^ (s?.on === false ? 1 << 21 : 0) ^ (s?.broken ? 1 << 22 : 0)) >>> 0;
      m.set(key, ((m.get(key) ?? 0) + h + 1) % 2147483647);
    }
  }

  /** Lots neu aufbauen, deren world.lotVersion (oder Objektzustand) sich geändert hat. Jeden Frame aufrufbar. */
  syncLots(): void {
    if (this.disposed) return;
    this.ensureLotViews();
    const now = performance.now();
    const checkSig = this.firstSync || now - this.sigTimer > 500;
    if (checkSig) {
      this.sigTimer = now;
      this.computeSigs();
    }
    let budget = this.firstSync ? Infinity : 3;
    for (const lv of this.lotOrder) {
      const ver = lv.pub ? 0 : this.world.lotVersion.get(lv.lot.id) ?? 0;
      const sig = checkSig ? this.sigMap.get(lv.lot.id) ?? 0 : lv.sig;
      const dataDirty = ver !== lv.version || sig !== lv.sig || !lv.built;
      const variantDirty = lv.wantKey !== lv.variantKey && now - lv.lastBuild > 110;
      if ((dataDirty || variantDirty) && budget > 0) {
        budget--;
        lv.version = ver;
        lv.sig = sig;
        this.rebuildLot(lv, now);
      }
    }
    this.firstSync = false;
  }

  private rebuildLot(lv: LotView, now: number): void {
    const objs = lv.pub ? [...this.world.objs.values()].filter((o) => !this.lots.has(o.lot) || o.lot === PUB_LOT.id) : this.world.objsOnLot(lv.lot.id);
    const out = this.scratch;
    buildLot(this.world, lv.lot, objs, lv.variant, out);
    lv.variantKey = lv.wantKey;
    lv.lastBuild = now;
    lv.built = true;
    const swap = (mesh: THREE.Mesh, b: { toGeometry(): THREE.BufferGeometry; v: number }): void => {
      if (mesh.geometry !== EMPTY_GEO) mesh.geometry.dispose();
      mesh.geometry = b.v ? b.toGeometry() : EMPTY_GEO;
    };
    swap(lv.shell, out.shell);
    swap(lv.indoor, out.indoor);
    swap(lv.glass, out.glass);
    swap(lv.emis, out.emis);
    lv.shellMarks = out.shellMarks.slice();
    lv.indoorMarks = out.indoorMarks.slice();
    lv.glassMarks = out.glassMarks.slice();
    lv.emisMarks = out.emisMarks.slice();
    lv.topLevel = out.topLevel;
    lv.tris = (out.shell.v + out.indoor.v + out.glass.v + out.emis.v) / 3;
    lv.lights = new Float32Array(out.lights);
    // Pick-Index aktualisieren
    for (const p of lv.picks) if (this.pickIndex.get(p.id)?.lv === lv) this.pickIndex.delete(p.id);
    lv.picks = out.picks.slice();
    for (const p of lv.picks) this.pickIndex.set(p.id, { lv, p });
    this.applyVis(lv);
    // Hervorhebung/Proxys nachführen
    if (this.highlightId) this.highlightObject(this.highlightId);
    for (const [id, node] of this.proxies) {
      const e = this.pickIndex.get(id);
      if (!e) {
        if (!this.world.objs.has(id)) {
          node.removeFromParent();
          this.proxies.delete(id);
        }
        continue;
      }
      node.position.set(e.p.px, e.p.py, e.p.pz);
      node.rotation.set(0, e.p.yaw, 0);
    }
  }

  /** Sichtbarkeit (drawRange) eines Lots nach Ansicht */
  private applyVis(lv: LotView): void {
    const focused = lv.focused && !lv.pub;
    const visLevel = focused ? Math.min(this.level, LEVELS - 1) : LEVELS - 1;
    const roof = focused ? this.mode === 'up' && this.level >= lv.topLevel : true;
    lv.visLevel = visLevel;
    lv.roofShown = roof;
    const set = (m: THREE.Mesh, count: number): void => {
      m.geometry.setDrawRange(0, count);
      m.visible = count > 0 && m.geometry !== EMPTY_GEO;
    };
    set(lv.shell, roof ? lv.shellMarks[LEVELS]! : lv.shellMarks[visLevel]!);
    set(lv.indoor, lv.indoorMarks[visLevel]!);
    set(lv.glass, lv.glassMarks[visLevel]!);
    set(lv.emis, lv.emisMarks[visLevel]!);
    lv.indoor.visible = lv.indoor.visible && lv.indoorVisible;
    lv.indoor.castShadow = focused || !roof; // unter dem Dach wirft das Inventar keinen sichtbaren Schatten
  }

  // ======================= Ansicht =======================
  setView(mode: ViewMode, level: number, focus: { x: number; z: number }, cameraYaw: number): void {
    this.mode = mode;
    this.level = Math.max(0, Math.min(LEVELS - 1, Math.round(level)));
    this.focus.x = focus.x;
    this.focus.z = focus.z;
    this.env.setFocus(focus.x, focus.z);
    this.ensureLotViews();
    const sector = ((Math.round(cameraYaw / (Math.PI / 4)) % 8) + 8) % 8;
    const sa = (sector * Math.PI) / 4;
    this.focusedLots.clear();
    for (const lv of this.lotOrder) {
      const l = lv.lot;
      const f = !lv.pub && focus.x >= l.x - 4 && focus.x <= l.x + l.w + 4 && focus.z >= l.z - 4 && focus.z <= l.z + l.d + 4;
      lv.focused = f;
      if (f) this.focusedLots.add(l.id);
      let key = 'full';
      if (f && mode === 'down') key = `low|${this.level}`;
      else if (f && mode === 'cut') key = `cut|${this.level}|${sector}`;
      if (key !== lv.wantKey) {
        lv.wantKey = key;
        lv.variant = key === 'full' ? FULL_VARIANT : { mode: mode === 'down' ? 'low' : 'cut', level: this.level, cx: Math.sin(sa), cz: Math.cos(sa) };
      }
      this.applyVis(lv);
    }
  }

  setEnvironment(minOfDay: number, season: Season, weather: WeatherId, dayOfSeason: number): void {
    this.env.set(minOfDay, season, weather, dayOfSeason);
    this.recolorFoliage();
  }

  update(dt: number, camera: THREE.Camera): void {
    if (this.disposed) return;
    const d = Math.min(Math.max(dt, 0), 0.25);
    this.time += d;
    this.env.update(d, camera);
    if (this.boats) this.boats.position.y = Math.sin(this.time * 1.1) * 0.05;
    // Innenräume nur zeigen, wenn nah genug oder Dach ausgeblendet
    camera.getWorldPosition(this._v);
    for (const lv of this.lotOrder) {
      if (lv.pub) continue;
      const dist = Math.hypot(this._v.x - lv.cx, this._v.z - lv.cz, this._v.y * 0.6);
      const vis = lv.focused || !lv.roofShown || dist < 30 + lv.radius;
      if (vis !== lv.indoorVisible) {
        lv.indoorVisible = vis;
        this.applyVis(lv);
      }
    }
    // ausstehende Ansichts-Neuaufbauten (gedrosselt)
    const now = performance.now();
    for (const lv of this.lotOrder) if (lv.built && lv.wantKey !== lv.variantKey && now - lv.lastBuild > 110) this.rebuildLot(lv, now);
    if (this.highlightMesh.visible) this.highlightMat.opacity = 0.28 + 0.14 * Math.sin(this.time * 5);
    this.updatePointLights(d);
  }

  /** echte Punktlichter an den Leuchten nahe dem Fokus (nur Qualität 'high', nachts) */
  private best = new Float32Array(12);
  private bestD = new Float32Array(4);
  private updatePointLights(dt: number): void {
    if (!this.pointLights.length) return;
    this.lightTimer -= dt;
    const on = this.env.lampOn;
    if (this.lightTimer <= 0) {
      this.lightTimer = 0.5;
      this.bestD.fill(1e9);
      const fx = this.focus.x, fz = this.focus.z;
      const consider = (arr: Float32Array): void => {
        for (let i = 0; i < arr.length; i += 3) {
          const dx = arr[i]! - fx, dz = arr[i + 2]! - fz;
          const dd = dx * dx + dz * dz;
          if (dd > 900) continue;
          let j = 3;
          if (dd >= this.bestD[j]!) continue;
          while (j > 0 && this.bestD[j - 1]! > dd) {
            this.bestD[j] = this.bestD[j - 1]!;
            this.best[j * 3] = this.best[(j - 1) * 3]!;
            this.best[j * 3 + 1] = this.best[(j - 1) * 3 + 1]!;
            this.best[j * 3 + 2] = this.best[(j - 1) * 3 + 2]!;
            j--;
          }
          this.bestD[j] = dd;
          this.best[j * 3] = arr[i]!;
          this.best[j * 3 + 1] = arr[i + 1]!;
          this.best[j * 3 + 2] = arr[i + 2]!;
        }
      };
      consider(this.lampPos);
      for (const lv of this.lotOrder) if (lv.lights.length && (lv.pub || Math.abs(lv.cx - fx) < 30 + lv.radius)) consider(lv.lights);
    }
    for (let i = 0; i < this.pointLights.length; i++) {
      const pl = this.pointLights[i]!;
      const has = this.bestD[i]! < 1e8;
      pl.position.set(this.best[i * 3]!, this.best[i * 3 + 1]!, this.best[i * 3 + 2]!);
      pl.intensity = has ? on * 7 : 0;
    }
  }

  // ======================= Picking =======================
  pickGround(ray: THREE.Ray, level: number): { x: number; z: number } | null {
    this._plane.constant = -level * LEVEL_H;
    const hit = ray.intersectPlane(this._plane, this._v);
    return hit ? { x: hit.x, z: hit.z } : null;
  }

  pickObject(raycaster: THREE.Raycaster): string | null {
    const r = raycaster.ray;
    const ox = r.origin.x, oy = r.origin.y, oz = r.origin.z;
    const ix = 1 / (r.direction.x || 1e-9), iy = 1 / (r.direction.y || 1e-9), iz = 1 / (r.direction.z || 1e-9);
    let best = Infinity, bestId: string | null = null;
    for (const lv of this.lotOrder) {
      for (const p of lv.picks) {
        if (p.l > lv.visLevel) continue;
        if (p.indoor && (lv.roofShown || !lv.indoorVisible)) continue;
        let t0 = (p.x0 - ox) * ix, t1 = (p.x1 - ox) * ix;
        let tmin = Math.min(t0, t1), tmax = Math.max(t0, t1);
        t0 = (p.y0 - oy) * iy; t1 = (p.y1 - oy) * iy;
        tmin = Math.max(tmin, Math.min(t0, t1)); tmax = Math.min(tmax, Math.max(t0, t1));
        t0 = (p.z0 - oz) * iz; t1 = (p.z1 - oz) * iz;
        tmin = Math.max(tmin, Math.min(t0, t1)); tmax = Math.min(tmax, Math.max(t0, t1));
        if (tmax >= Math.max(tmin, 0) && tmin < best && tmin <= raycaster.far) {
          best = Math.max(tmin, 0);
          bestId = p.id;
        }
      }
    }
    return bestId;
  }

  objectNode(id: string): THREE.Object3D | undefined {
    let n = this.proxies.get(id);
    if (n) return n;
    const e = this.pickIndex.get(id);
    if (!e) return undefined;
    n = new THREE.Object3D();
    n.name = `obj-${id}`;
    n.position.set(e.p.px, e.p.py, e.p.pz);
    n.rotation.y = e.p.yaw;
    this.scene.add(n);
    this.proxies.set(id, n);
    return n;
  }

  highlightObject(id: string | null): void {
    this.highlightId = id;
    const e = id ? this.pickIndex.get(id) : undefined;
    const o = id ? this.world.objs.get(id) : undefined;
    if (!e || !o) {
      this.highlightMesh.visible = false;
      return;
    }
    this.highlightMesh.geometry = objectGeometry(o.def, o.ca ?? 0, o.cb ?? 0, objFlags(o));
    this.highlightMesh.position.set(e.p.px, e.p.py, e.p.pz);
    this.highlightMesh.rotation.set(0, e.p.yaw, 0);
    this.highlightMesh.scale.setScalar(1.015);
    this.highlightMesh.visible = true;
  }

  setGrid(visible: boolean, lotId?: string, level = 0): void {
    const lot = lotId ? LOTS.find((l) => l.id === lotId) : undefined;
    if (!visible || !lot) {
      if (this.grid) this.grid.visible = false;
      return;
    }
    const key = `${lot.id}|${level}`;
    if (this.grid && key === this.gridKey) {
      this.grid.visible = true;
      return;
    }
    this.gridKey = key;
    if (this.grid) {
      this.grid.removeFromParent();
      this.grid.geometry.dispose();
    } else {
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38, depthWrite: false });
      this.ownMats.push(mat);
      this.grid = new THREE.LineSegments(EMPTY_GEO, mat);
      this.grid.renderOrder = 3;
      this.grid.name = 'build-grid';
    }
    const y = level * LEVEL_H + (level === 0 ? FLOOR_Y + 0.012 : 0.012);
    const pts: number[] = [];
    for (let x = lot.x; x <= lot.x + lot.w; x++) pts.push(x, y, lot.z, x, y, lot.z + lot.d);
    for (let z = lot.z; z <= lot.z + lot.d; z++) pts.push(lot.x, y, z, lot.x + lot.w, y, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    this.grid.geometry = g;
    this.grid.visible = true;
    this.scene.add(this.grid);
  }

  setQuality(q: Quality, shadows: boolean): void {
    const prevShadow = this.renderer.shadowMap.enabled;
    const useShadow = shadows && q !== 'low';
    this.quality = q;
    this.shadows = shadows;
    this.renderer.shadowMap.enabled = useShadow;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.env.setQuality(q, useShadow, q === 'high' ? 2048 : 1024);
    const wantLights = q === 'high' ? 4 : 0;
    if (wantLights !== this.pointLights.length) {
      for (const pl of this.pointLights) {
        this.scene.remove(pl);
        pl.dispose();
      }
      this.pointLights = [];
      for (let i = 0; i < wantLights; i++) {
        const pl = new THREE.PointLight(0xffcf8a, 0, 10, 2);
        pl.name = `lamp-light-${i}`;
        this.scene.add(pl);
        this.pointLights.push(pl);
      }
    }
    if (prevShadow !== useShadow || wantLights !== this.pointLights.length) {
      this.scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (Array.isArray(m)) m.forEach((x) => (x.needsUpdate = true));
        else if (m) m.needsUpdate = true;
      });
    }
  }

  /** Debug: Anzahl gebauter Lots und Dreiecke (statisch + Lots) */
  stats(): { lots: number; tris: number; quality: Quality; shadows: boolean } {
    let t = this.staticTris;
    for (const lv of this.lotOrder) t += lv.tris;
    return { lots: this.lotOrder.filter((l) => l.built).length, tris: Math.round(t), quality: this.quality, shadows: this.shadows };
  }

  dispose(): void {
    this.disposed = true;
    this.clearStatic();
    for (const lv of this.lotOrder)
      for (const m of [lv.shell, lv.indoor, lv.glass, lv.emis]) {
        if (m.geometry !== EMPTY_GEO) m.geometry.dispose();
        m.removeFromParent();
      }
    this.lots.clear();
    this.lotOrder = [];
    this.pickIndex.clear();
    for (const n of this.proxies.values()) n.removeFromParent();
    this.proxies.clear();
    if (this.grid) {
      this.grid.geometry.dispose();
      this.grid.removeFromParent();
    }
    for (const pl of this.pointLights) pl.dispose();
    this.pointLights = [];
    this.highlightMesh.removeFromParent();
    for (const m of this.ownMats) m.dispose();
    this.env.dispose();
    this.scene.clear();
  }
}
