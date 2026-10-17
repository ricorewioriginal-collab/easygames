// Umgebung: Himmelskuppel, Sonne/Mond, Tageslicht-Farben, Nebel, Jahreszeiten-Uniforms, Wetterpartikel (ein Points-Objekt) und Blitze.
// setEnvironment() setzt nur Zielwerte; update() blendet weich über und schreibt sie in Lichter/Materialien (keine Allokationen pro Frame).
import * as THREE from 'three';
import type { Season, WeatherId } from '../data/types';
import { objectMaterial } from './object-mesh';

export type Quality = 'low' | 'mid' | 'high';

/** gemeinsam genutzte Shader-Uniforms (von world-view an Materialien gehängt) */
export interface EnvUniforms {
  uTime: { value: number };
  uSnow: { value: number };
  uWet: { value: number };
  uGrassTint: { value: THREE.Color };
  uNight: { value: number };
  uWind: { value: number };
}

const SUN_TABLE: Record<Season, { rise: number; set: number; elev: number }> = {
  spring: { rise: 6.0, set: 20.0, elev: 52 },
  summer: { rise: 5.25, set: 21.5, elev: 62 },
  autumn: { rise: 7.0, set: 19.0, elev: 40 },
  winter: { rise: 8.0, set: 16.75, elev: 26 },
};
const CLOUD: Record<WeatherId, number> = { sunny: 0, windy: 0.2, cloudy: 0.55, rain: 0.78, storm: 0.92, snow: 0.7 };

type Stop = [number, THREE.Color];
const st = (e: number, hex: string): Stop => [e, new THREE.Color(hex)];
const SKY_TOP: Stop[] = [st(-18, '#060b1c'), st(-6, '#18244a'), st(0, '#43588f'), st(8, '#6a9cd4'), st(25, '#4e94dc')];
const SKY_HOR: Stop[] = [st(-18, '#0e1730'), st(-6, '#2a3562'), st(0, '#ee9468'), st(6, '#f6c695'), st(20, '#c4e1f3')];
const SUN_COL: Stop[] = [st(-2, '#ff6a30'), st(6, '#ffb070'), st(20, '#fff0d8'), st(60, '#fffaf0')];
const HEMI_SKY: Stop[] = [st(-14, '#3d5088'), st(-2, '#6a6a9a'), st(10, '#b4cfe8'), st(30, '#d4e6f5')];
const GREY_TOP = new THREE.Color('#7d8894');
const GREY_HOR = new THREE.Color('#aab3bb');

function sample(stops: Stop[], e: number, out: THREE.Color): THREE.Color {
  if (e <= stops[0]![0]) return out.copy(stops[0]![1]);
  for (let i = 1; i < stops.length; i++) {
    const [e1, c1] = stops[i]!;
    if (e <= e1) {
      const [e0, c0] = stops[i - 1]!;
      return out.copy(c0).lerp(c1, (e - e0) / (e1 - e0));
    }
  }
  return out.copy(stops[stops.length - 1]![1]);
}
const smooth = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const PARTICLE_MAX = 2600;

export class Environment {
  readonly uniforms: EnvUniforms = {
    uTime: { value: 0 },
    uSnow: { value: 0 },
    uWet: { value: 0 },
    uGrassTint: { value: new THREE.Color(1, 1, 1) },
    uNight: { value: 0 },
    uWind: { value: 0.3 },
  };
  readonly hemi = new THREE.HemisphereLight(0xcfe4f5, 0x5a6b45, 1.3);
  readonly sun = new THREE.DirectionalLight(0xfff0d8, 2.3);
  readonly sky: THREE.Mesh;
  readonly particles: THREE.Points;
  readonly fog = new THREE.Fog(0xc4e1f3, 70, 320);
  /** Material der Straßenlaternen-Köpfe (Farbe = Leuchtkraft) */
  readonly lampMat = new THREE.MeshBasicMaterial({ color: 0xd8d2c4 });
  /** Leuchtstärke der Straßenlaternen 0..1 (für Punktlichter) */
  lampOn = 0;
  /** Nachtfaktor 0..1 */
  night = 0;
  season: Season = 'spring';
  dayOfSeason = 0;
  weather: WeatherId = 'sunny';

  private skyU = {
    uTop: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uGround: { value: new THREE.Color('#6f8a5a') },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color() },
    uSunVis: { value: 1 },
    uStars: { value: 0 },
  };
  private partU = {
    uTime: { value: 0 },
    uCam: { value: new THREE.Vector3() },
    uBox: { value: new THREE.Vector3(50, 26, 50) },
    uKind: { value: 0 },
    uSpeed: { value: 14 },
    uColor: { value: new THREE.Color('#cfe0ee') },
    uSize: { value: 30 },
    uOpacity: { value: 0.6 },
  };
  // Zielwerte und aktuelle Werte (weiche Übergänge)
  private tgt = { top: new THREE.Color(), hor: new THREE.Color(), sunCol: new THREE.Color(), sunI: 0, hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), hemiI: 1, fogNear: 70, fogFar: 320, snow: 0, wet: 0, night: 0, lamp: 0, wind: 0.3, tint: new THREE.Color(1, 1, 1) };
  private cur = { top: new THREE.Color(), hor: new THREE.Color(), sunCol: new THREE.Color(), sunI: 0, hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), hemiI: 1, fogNear: 70, fogFar: 320, snow: 0, wet: 0, night: 0, lamp: 0, wind: 0.3, tint: new THREE.Color(1, 1, 1) };
  private first = true;
  private sunDir = new THREE.Vector3(0.4, 0.8, 0.3);
  private flash = 0;
  private flashT = 6;
  private particleKind = -1;
  private _c = new THREE.Color();
  private _c2 = new THREE.Color();
  private readonly focus = new THREE.Vector3();
  private readonly _dir = new THREE.Vector3();
  private shadowSpan = 22;

  constructor(private readonly scene: THREE.Scene) {
    scene.fog = this.fog;
    scene.background = this.fog.color;
    this.sun.position.set(30, 60, 20);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.04;
    scene.add(this.hemi, this.sun, this.sun.target);

    // Himmelskuppel (folgt der Kamera)
    const skyMat = new THREE.ShaderMaterial({
      uniforms: this.skyU,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uGround; uniform vec3 uSunDir; uniform vec3 uSunCol;
        uniform float uSunVis; uniform float uStars;
        varying vec3 vDir;
        float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = h > 0.0 ? mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHor, uGround, clamp(-h * 6.0, 0.0, 1.0));
          float s = max(dot(d, normalize(uSunDir)), 0.0);
          c += uSunCol * (pow(s, 900.0) * 4.0 + pow(s, 12.0) * 0.22) * uSunVis;
          if (uStars > 0.01 && h > 0.05) {
            vec3 q = floor(d * 160.0);
            float st = step(0.9965, h3(q));
            c += vec3(st * uStars * 0.9 * smoothstep(0.05, 0.3, h));
          }
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -10;
    this.sky.name = 'sky';
    scene.add(this.sky);

    // Wetterpartikel: Positionen werden im Vertex-Shader aus Zeit und Kamera berechnet (keine CPU-Arbeit pro Frame)
    const seeds = new Float32Array(PARTICLE_MAX * 3);
    for (let i = 0; i < PARTICLE_MAX; i++) {
      seeds[i * 3] = Math.random();
      seeds[i * 3 + 1] = Math.random();
      seeds[i * 3 + 2] = Math.random();
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(seeds, 3));
    pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    const pm = new THREE.ShaderMaterial({
      uniforms: this.partU,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uKind; uniform float uSpeed; uniform float uSize;
        varying float vA;
        void main() {
          vec3 s = position;
          float drift = uKind > 0.5 ? sin(uTime * 0.7 + s.x * 40.0) * 1.2 : 0.0;
          vec3 v = vec3(drift + (uKind > 0.5 ? 0.6 : 1.5), -uSpeed * (0.8 + 0.4 * s.z), drift * 0.5 + 0.3);
          vec3 p = s * uBox + v * uTime;
          vec3 base = uCam - uBox * 0.5;
          p.xz = mod(p.xz - base.xz, uBox.xz) + base.xz;
          p.y = mod(p.y, uBox.y) - 0.5;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float dist = -mv.z;
          gl_PointSize = clamp(uSize * (0.6 + 0.6 * s.y) / max(dist, 1.0), 1.0, 48.0);
          vA = smoothstep(uBox.x * 0.55, uBox.x * 0.3, length(p.xz - uCam.xz)) * smoothstep(0.0, 1.5, p.y);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uKind; uniform float uOpacity;
        varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a;
          if (uKind > 0.5) a = smoothstep(0.5, 0.15, length(c));
          else a = smoothstep(0.09, 0.0, abs(c.x + c.y * 0.12)) * smoothstep(0.5, 0.2, abs(c.y));
          if (a < 0.02) discard;
          gl_FragColor = vec4(uColor, a * uOpacity * vA);
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      fog: false,
    });
    this.particles = new THREE.Points(pg, pm);
    this.particles.frustumCulled = false;
    this.particles.visible = false;
    this.particles.renderOrder = 5;
    this.particles.name = 'weather';
    scene.add(this.particles);
  }

  setQuality(q: Quality, shadows: boolean, mapSize: number): void {
    this.sun.castShadow = shadows;
    if (shadows && this.sun.shadow.mapSize.x !== mapSize) {
      this.sun.shadow.mapSize.set(mapSize, mapSize);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.shadowSpan = q === 'high' ? 28 : 22;
    const cam = this.sun.shadow.camera;
    cam.left = cam.bottom = -this.shadowSpan;
    cam.right = cam.top = this.shadowSpan;
    cam.near = 1;
    cam.far = 220;
    cam.updateProjectionMatrix();
    const n = q === 'low' ? 500 : q === 'mid' ? 1300 : PARTICLE_MAX;
    this.particles.geometry.setDrawRange(0, n);
  }

  /** Zielwerte für Tageszeit, Jahreszeit und Wetter */
  set(minOfDay: number, season: Season, weather: WeatherId, dayOfSeason: number): void {
    this.season = season;
    this.weather = weather;
    this.dayOfSeason = dayOfSeason;
    const T = SUN_TABLE[season] ?? SUN_TABLE.spring;
    const h = (((minOfDay % 1440) + 1440) % 1440) / 60;
    const dayLen = T.set - T.rise;
    let elev: number, az: number;
    if (h >= T.rise && h <= T.set) {
      const f = (h - T.rise) / dayLen;
      elev = T.elev * Math.sin(Math.PI * f);
      az = Math.PI * f;
      this.sunDir.set(Math.cos(az), 0, 0.55 * Math.sin(az) + 0.25);
    } else {
      const nightLen = 24 - dayLen;
      const f = (((h - T.set) % 24) + 24) % 24 / nightLen;
      elev = -40 * Math.sin(Math.PI * f);
      // Mond: wandert ebenfalls von Ost nach West
      az = Math.PI * f;
      this.sunDir.set(Math.cos(az), 0, 0.5 * Math.sin(az) + 0.3);
    }
    const hl = Math.hypot(this.sunDir.x, this.sunDir.z) || 1;
    const sunE = Math.max(elev, -10);
    const moonE = Math.max(14, 38 * Math.min(1, -elev / 20));
    const useE = elev > -1 ? Math.max(sunE, 4) : moonE;
    const ce = Math.cos((useE * Math.PI) / 180), se = Math.sin((useE * Math.PI) / 180);
    this.sunDir.set((this.sunDir.x / hl) * ce, se, (this.sunDir.z / hl) * ce);

    const cloud = CLOUD[weather] ?? 0;
    const t = this.tgt;
    sample(SKY_TOP, elev, t.top);
    sample(SKY_HOR, elev, t.hor);
    const dayAmt = smooth(-8, 6, elev);
    // Bewölkung: Richtung Grau, nachts dunkel
    this._c.copy(GREY_TOP).multiplyScalar(0.12 + 0.88 * dayAmt);
    t.top.lerp(this._c, cloud * 0.85);
    this._c.copy(GREY_HOR).multiplyScalar(0.12 + 0.88 * dayAmt);
    t.hor.lerp(this._c, cloud * 0.8);
    if (weather === 'snow') t.hor.lerp(this._c2.set('#dfe6ec').multiplyScalar(0.15 + 0.85 * dayAmt), 0.3);

    const sunAmt = smooth(-1.5, 7, elev);
    const moonAmt = smooth(-1, -8, elev);
    sample(SUN_COL, elev, t.sunCol);
    if (elev <= -1) t.sunCol.set('#8fa6d8');
    t.sunI = sunAmt * 2.4 * (1 - 0.72 * cloud) + moonAmt * 0.5 * (1 - 0.6 * cloud);
    sample(HEMI_SKY, elev, t.hemiSky);
    t.hemiSky.lerp(this._c.copy(GREY_HOR).multiplyScalar(0.25 + 0.75 * dayAmt), cloud * 0.5);
    const winterSnow = season === 'winter' ? (weather === 'snow' ? 1 : 0.55 + 0.45 * Math.min(1, dayOfSeason / 3)) : 0;
    t.hemiGround.set('#5c6d48').lerp(this._c.set('#c9d2dc'), winterSnow * 0.8).multiplyScalar(0.35 + 0.65 * dayAmt);
    t.hemiI = 0.85 + 0.65 * dayAmt + cloud * 0.35 * dayAmt;
    const fogK = weather === 'storm' ? 0.42 : weather === 'rain' ? 0.55 : weather === 'snow' ? 0.5 : weather === 'cloudy' ? 0.85 : 1;
    t.fogNear = 70 * fogK;
    t.fogFar = 330 * fogK;
    t.snow = winterSnow;
    t.wet = weather === 'rain' || weather === 'storm' ? 1 : 0;
    t.night = 1 - smooth(-7, 3, elev);
    t.lamp = Math.max(smooth(0.25, 0.55, t.night), weather === 'storm' || weather === 'rain' ? 0.5 * dayAmt * cloud : 0);
    t.wind = weather === 'storm' ? 2.2 : weather === 'windy' ? 1.6 : weather === 'rain' ? 0.9 : 0.35;
    // Grastönung je Jahreszeit
    const p = Math.min(1, dayOfSeason / 6);
    if (season === 'spring') t.tint.setRGB(0.98, 1.06, 0.88);
    else if (season === 'summer') t.tint.setRGB(1.06, 1.0, 0.78);
    else if (season === 'autumn') t.tint.setRGB(1.08 + 0.1 * p, 0.96 - 0.06 * p, 0.7);
    else t.tint.setRGB(0.92, 0.94, 0.9);

    this.skyU.uSunVis.value = sunAmt * (1 - cloud);
    this.skyU.uStars.value = smooth(-4, -12, elev) * (1 - cloud);

    // Partikel
    const kind = weather === 'snow' ? 1 : weather === 'rain' || weather === 'storm' ? 0 : -1;
    if (kind !== this.particleKind) {
      this.particleKind = kind;
      this.particles.visible = kind >= 0;
      this.partU.uKind.value = Math.max(0, kind);
      this.partU.uSpeed.value = kind === 1 ? 1.6 : weather === 'storm' ? 22 : 16;
      this.partU.uSize.value = kind === 1 ? 70 : 240;
      this.partU.uOpacity.value = kind === 1 ? 0.95 : 0.55;
      this.partU.uColor.value.set(kind === 1 ? '#ffffff' : '#c9dbea');
    }
    if (this.first) {
      this.first = false;
      this.copyAll();
    }
  }

  private copyAll(): void {
    const c = this.cur, t = this.tgt;
    c.top.copy(t.top); c.hor.copy(t.hor); c.sunCol.copy(t.sunCol); c.hemiSky.copy(t.hemiSky); c.hemiGround.copy(t.hemiGround); c.tint.copy(t.tint);
    c.sunI = t.sunI; c.hemiI = t.hemiI; c.fogNear = t.fogNear; c.fogFar = t.fogFar; c.snow = t.snow; c.wet = t.wet; c.night = t.night; c.lamp = t.lamp; c.wind = t.wind;
  }

  /** Fokus für die Schattenkamera */
  setFocus(x: number, z: number): void {
    this.focus.set(x, 0, z);
  }

  update(dt: number, camera: THREE.Camera): void {
    const u = this.uniforms;
    u.uTime.value += dt;
    this.partU.uTime.value = u.uTime.value % 1000;
    const k = 1 - Math.exp(-dt * 2.5);
    const c = this.cur, t = this.tgt;
    c.top.lerp(t.top, k); c.hor.lerp(t.hor, k); c.sunCol.lerp(t.sunCol, k); c.hemiSky.lerp(t.hemiSky, k); c.hemiGround.lerp(t.hemiGround, k); c.tint.lerp(t.tint, k);
    c.sunI += (t.sunI - c.sunI) * k; c.hemiI += (t.hemiI - c.hemiI) * k; c.fogNear += (t.fogNear - c.fogNear) * k; c.fogFar += (t.fogFar - c.fogFar) * k;
    const ks = 1 - Math.exp(-dt * 0.5); // Schnee/Nässe langsamer
    c.snow += (t.snow - c.snow) * ks; c.wet += (t.wet - c.wet) * ks;
    c.night += (t.night - c.night) * k; c.lamp += (t.lamp - c.lamp) * k; c.wind += (t.wind - c.wind) * k;

    // Blitze bei Gewitter
    if (this.weather === 'storm') {
      this.flashT -= dt;
      if (this.flashT <= 0) {
        this.flash = 1;
        this.flashT = 3 + Math.random() * 9;
      }
    }
    this.flash = Math.max(0, this.flash - dt * 4.5);
    const fl = this.flash > 0 ? this.flash * (0.6 + 0.4 * Math.sin(this.flash * 40)) : 0;

    this.skyU.uTop.value.copy(c.top).lerp(this._c.setRGB(0.85, 0.88, 1), fl * 0.6);
    this.skyU.uHor.value.copy(c.hor).lerp(this._c.setRGB(0.9, 0.92, 1), fl * 0.5);
    this.skyU.uSunCol.value.copy(c.sunCol);
    this.skyU.uSunDir.value.copy(this.sunDir);
    this.skyU.uGround.value.copy(c.hor).multiplyScalar(0.8);
    this.fog.color.copy(c.hor).lerp(this._c.setRGB(0.85, 0.88, 1), fl * 0.4);
    this.fog.near = c.fogNear;
    this.fog.far = c.fogFar;
    this.hemi.color.copy(c.hemiSky);
    this.hemi.groundColor.copy(c.hemiGround);
    this.hemi.intensity = c.hemiI + fl * 2.5;
    this.sun.color.copy(c.sunCol);
    this.sun.intensity = c.sunI;
    // Sonne folgt dem Fokus (Schattenbereich), auf Texelraster eingerastet gegen Flimmern
    const snap = (this.shadowSpan * 2) / this.sun.shadow.mapSize.x;
    const fx = Math.round(this.focus.x / snap) * snap, fz = Math.round(this.focus.z / snap) * snap;
    this.sun.target.position.set(fx, 0, fz);
    this.sun.position.set(fx + this.sunDir.x * 100, this.sunDir.y * 100, fz + this.sunDir.z * 100);

    u.uSnow.value = c.snow;
    u.uWet.value = c.wet;
    u.uGrassTint.value.copy(c.tint);
    u.uNight.value = c.night;
    u.uWind.value = c.wind;
    this.night = c.night;
    this.lampOn = c.lamp;

    // Materialien: Glas leuchtet nachts warm, Lampen an/aus
    const glass = objectMaterial('glass') as THREE.MeshLambertMaterial;
    glass.emissive.setRGB(1.0, 0.72, 0.38).multiplyScalar(0.55 * c.night);
    const em = objectMaterial('emissive') as THREE.MeshBasicMaterial;
    const g = 0.9 + 0.1 * c.night;
    em.color.setRGB(g, g, g);
    this.lampMat.color.setRGB(0.62, 0.6, 0.56).lerp(this._c.setRGB(1, 0.86, 0.55), c.lamp);

    // Himmel und Partikel folgen der Kamera
    camera.getWorldPosition(this.sky.position);
    const far = (camera as THREE.PerspectiveCamera).far ?? 1000;
    this.sky.scale.setScalar(Math.min(far * 0.9, 900));
    // Partikelbox zwischen Kamera und Blickziel, bis knapp über Kamerahöhe
    camera.getWorldDirection(this._dir);
    const ahead = Math.min(28, Math.max(8, this.sky.position.y * 0.8));
    this.partU.uCam.value.set(this.sky.position.x + this._dir.x * ahead, 0, this.sky.position.z + this._dir.z * ahead);
    this.partU.uBox.value.y = Math.max(18, Math.min(60, this.sky.position.y + 4));
  }

  dispose(): void {
    this.scene.remove(this.hemi, this.sun, this.sun.target, this.sky, this.particles);
    this.sky.geometry.dispose();
    (this.sky.material as THREE.Material).dispose();
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.lampMat.dispose();
    this.sun.shadow.map?.dispose();
    if (this.scene.fog === this.fog) this.scene.fog = null;
    if (this.scene.background === this.fog.color) this.scene.background = null;
  }
}
