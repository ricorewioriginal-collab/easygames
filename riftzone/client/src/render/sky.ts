// Himmel, Sonne/Mond, Tageszeit, Nebel und Wetter (Regen).
import * as THREE from 'three';
import { clamp, lerp } from '../../../shared/src/math';

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w; // immer ganz hinten
}`;

const skyFrag = /* glsl */ `
uniform vec3 top;
uniform vec3 horizon;
uniform vec3 bottom;
uniform vec3 sunDir;
uniform vec3 sunColor;
uniform float stars;
uniform float time;
varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(horizon, bottom, clamp(-h * 3.0, 0.0, 1.0));
  float s = max(0.0, dot(d, normalize(sunDir)));
  col += sunColor * (pow(s, 900.0) * 6.0 + pow(s, 12.0) * 0.35);
  // Riftschimmer: Bänder am Himmel
  float band = sin(d.x * 6.0 + time * 0.05) * sin(d.z * 5.0 - time * 0.04);
  col += vec3(0.45, 0.2, 0.8) * smoothstep(0.85, 1.0, band) * smoothstep(0.25, 0.7, h) * 0.07;
  if (stars > 0.0 && h > 0.0) {
    vec3 q = floor(d * 220.0);
    float st = step(0.9975, hash(q));
    col += vec3(st) * stars * smoothstep(0.0, 0.3, h);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

interface SkyKey {
  t: number;
  top: number;
  horizon: number;
  sun: number;
  sunI: number;
  amb: number;
  ground: number;
}

// Farbverlauf über den Tag (Stunden)
const KEYS: SkyKey[] = [
  { t: 0, top: 0x060a1c, horizon: 0x1a2148, sun: 0x8fa6ff, sunI: 0.35, amb: 0.35, ground: 0x10142a },
  { t: 5.5, top: 0x1b2457, horizon: 0xff9a6b, sun: 0xffb27a, sunI: 0.6, amb: 0.45, ground: 0x2a2440 },
  { t: 8, top: 0x3f86ff, horizon: 0xb5e2ff, sun: 0xfff1d6, sunI: 1.25, amb: 0.75, ground: 0x4c6a3c },
  { t: 13, top: 0x2d7bff, horizon: 0xbfe9ff, sun: 0xffffff, sunI: 1.45, amb: 0.85, ground: 0x506e40 },
  { t: 17.5, top: 0x3a6fe8, horizon: 0xffd2a0, sun: 0xffe0b0, sunI: 1.2, amb: 0.7, ground: 0x4a5a38 },
  { t: 19.5, top: 0x2a2a6a, horizon: 0xff7a5a, sun: 0xff8a5a, sunI: 0.75, amb: 0.5, ground: 0x2a2440 },
  { t: 21.5, top: 0x0a1030, horizon: 0x2b2a60, sun: 0x8fa6ff, sunI: 0.4, amb: 0.38, ground: 0x10142a },
  { t: 24, top: 0x060a1c, horizon: 0x1a2148, sun: 0x8fa6ff, sunI: 0.35, amb: 0.35, ground: 0x10142a },
];

const cA = new THREE.Color(),
  cB = new THREE.Color();
function mixHex(a: number, b: number, t: number, out: THREE.Color): THREE.Color {
  cA.setHex(a);
  cB.setHex(b);
  return out.copy(cA).lerp(cB, t);
}

export class Sky {
  readonly group = new THREE.Group();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly fog: THREE.Fog;
  private readonly mat: THREE.ShaderMaterial;
  private readonly dome: THREE.Mesh;
  hour = 16;
  weather = 0;
  private rain: THREE.LineSegments | null = null;
  private rainPos: Float32Array | null = null;
  shadowSize = 2048;
  private readonly topC = new THREE.Color();
  private readonly horC = new THREE.Color();
  private time = 0;
  /** 0 = Tag, 1 = Nacht (für Leuchteffekte) */
  night = 0;
  viewDistance = 600;

  constructor(scene: THREE.Scene) {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        top: { value: new THREE.Color() },
        horizon: { value: new THREE.Color() },
        bottom: { value: new THREE.Color(0x0c3248) },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        sunColor: { value: new THREE.Color() },
        stars: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), this.mat);
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -10;
    this.group.add(this.dome);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.4);
    this.sun.shadow.camera.left = -70;
    this.sun.shadow.camera.right = 70;
    this.sun.shadow.camera.top = 70;
    this.sun.shadow.camera.bottom = -70;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 420;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.04;
    this.group.add(this.sun);
    this.group.add(this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xbfdfff, 0x4c6a3c, 0.8);
    this.group.add(this.hemi);
    this.fog = new THREE.Fog(0xbfe9ff, 120, 650);
    scene.fog = this.fog;
    scene.add(this.group);
  }

  setShadows(on: boolean, size: number): void {
    this.sun.castShadow = on;
    if (size !== this.shadowSize) {
      this.shadowSize = size;
      this.sun.shadow.map?.dispose();
      (this.sun.shadow as { map: THREE.WebGLRenderTarget | null }).map = null;
    }
    this.sun.shadow.mapSize.set(size, size);
  }

  setWeather(w: number): void {
    this.weather = w;
    if (w === 1 && !this.rain) {
      const n = 1800;
      this.rainPos = new Float32Array(n * 6);
      for (let i = 0; i < n; i++) {
        const x = (Math.random() - 0.5) * 80,
          y = Math.random() * 40,
          z = (Math.random() - 0.5) * 80;
        this.rainPos.set([x, y, z, x + 0.05, y - 0.9, z], i * 6);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
      this.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xa8c8e8, transparent: true, opacity: 0.45 }));
      this.rain.frustumCulled = false;
      this.group.add(this.rain);
    }
  }

  update(dt: number, cam: THREE.Vector3): void {
    this.time += dt;
    const h = ((this.hour % 24) + 24) % 24;
    let i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1]!.t <= h) i++;
    const a = KEYS[i]!,
      b = KEYS[i + 1]!;
    const t = clamp((h - a.t) / (b.t - a.t), 0, 1);
    mixHex(a.top, b.top, t, this.topC);
    mixHex(a.horizon, b.horizon, t, this.horC);
    const sunI = lerp(a.sunI, b.sunI, t);
    const amb = lerp(a.amb, b.amb, t);
    const u = this.mat.uniforms;
    // Regen/Nebel: grauer
    const grey = this.weather === 1 ? 0.45 : this.weather === 2 ? 0.3 : 0;
    if (grey) {
      const gr = new THREE.Color(0x8a96a8);
      this.topC.lerp(gr, grey);
      this.horC.lerp(gr, grey);
    }
    (u.top!.value as THREE.Color).copy(this.topC);
    (u.horizon!.value as THREE.Color).copy(this.horC);
    u.time!.value = this.time;
    // Sonnenstand: Aufgang 6 Uhr im Osten, Untergang 20 Uhr im Westen
    const day = (h - 6) / 14;
    const isDay = day >= 0 && day <= 1;
    const ang = isDay ? day * Math.PI : ((h < 6 ? h + 24 : h) - 20) / 10 * Math.PI;
    const sx = Math.cos(ang),
      sy = Math.max(0.08, Math.sin(ang)),
      sz = 0.35;
    (u.sunDir!.value as THREE.Vector3).set(sx, Math.sin(ang), sz).normalize();
    mixHex(a.sun, b.sun, t, u.sunColor!.value as THREE.Color);
    this.night = isDay ? clamp(1 - Math.sin(ang) * 4, 0, 1) * 0.6 : 1;
    u.stars!.value = this.night * (this.weather ? 0.2 : 1);
    this.sun.color.copy(u.sunColor!.value as THREE.Color);
    this.sun.intensity = sunI * (1 - grey * 0.5);
    this.sun.position.set(cam.x + sx * 200, cam.y + sy * 200, cam.z + sz * 200);
    this.sun.target.position.set(cam.x, cam.y, cam.z);
    // Schattenkamera auf Texel einrasten (kein Flimmern)
    const texel = 140 / this.shadowSize;
    this.sun.target.position.x = Math.round(this.sun.target.position.x / texel) * texel;
    this.sun.target.position.z = Math.round(this.sun.target.position.z / texel) * texel;
    this.sun.position.x = this.sun.target.position.x + sx * 200;
    this.sun.position.z = this.sun.target.position.z + sz * 200;
    this.sun.target.updateMatrixWorld();
    this.hemi.intensity = amb;
    this.hemi.color.copy(this.topC).lerp(new THREE.Color(0xffffff), 0.5);
    mixHex(a.ground, b.ground, t, this.hemi.groundColor);
    this.fog.color.copy(this.horC);
    const fogMul = this.weather === 2 ? 0.35 : this.weather === 1 ? 0.7 : 1;
    this.fog.far = this.viewDistance * fogMul;
    this.fog.near = Math.min(this.fog.far * 0.3, 120 * fogMul);
    this.dome.position.copy(cam);
    if (this.rain && this.rainPos) {
      this.rain.visible = this.weather === 1;
      this.rain.position.set(cam.x, cam.y - 10, cam.z);
      const p = this.rainPos;
      const fall = dt * 32;
      for (let k = 0; k < p.length; k += 6) {
        p[k + 1]! -= fall;
        p[k + 4]! -= fall;
        if (p[k + 1]! < 0) {
          p[k + 1]! += 40;
          p[k + 4]! += 40;
        }
      }
      (this.rain.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }
}
