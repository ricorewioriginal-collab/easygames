/* Himmel, Licht, Nebel, Tageszeiten, Sterne, Wolken und Wetter. Alles hell und freundlich – auch die Nacht ist blau, nie schwarz. */
import { clamp, lerp, smoothstep, TAU } from '../core/math.ts';
import { makeRng } from '../core/rng.ts';
import { GeoBuilder } from './geo.ts';
import type { QualityProfile } from './renderer.ts';

const C = (h: number) => new THREE.Color(h);
/* Farbstützpunkte über den Tag: [t, Zenit, Horizont, Sonnenlicht, Himmelslicht, Bodenlicht, Sonnenstärke] */
const KEYS: [number, THREE.Color, THREE.Color, THREE.Color, THREE.Color, THREE.Color, number][] = [
  [0.00, C(0x0d1a40), C(0x24386e), C(0x6f86d6), C(0x2a3c78), C(0x1d2a40), 0.25],
  [0.20, C(0x1f2d66), C(0x5c5aa0), C(0x8f8fd8), C(0x3c4a8a), C(0x2a3448), 0.3],
  [0.26, C(0x4a74c9), C(0xffa36b), C(0xffb27a), C(0x8fb3ff), C(0x6b5a4a), 0.8],
  [0.34, C(0x3f8fe6), C(0xbfe6ff), C(0xfff1d6), C(0xbfe0ff), C(0x8a7a5a), 1.35],
  [0.50, C(0x2f86ea), C(0xc8ecff), C(0xffffff), C(0xc8e8ff), C(0x8f8060), 1.55],
  [0.66, C(0x3a88e0), C(0xd4ecff), C(0xfff2dc), C(0xbfe0ff), C(0x8a7a5a), 1.35],
  [0.74, C(0x4f63c0), C(0xff8f6b), C(0xffa070), C(0xa7a0ff), C(0x6b4a4a), 0.85],
  [0.80, C(0x23306f), C(0x6a4f9a), C(0x9a8ae0), C(0x4a4a90), C(0x2a2a48), 0.35],
  [1.00, C(0x0d1a40), C(0x24386e), C(0x6f86d6), C(0x2a3c78), C(0x1d2a40), 0.25]
];

export class Environment {
  readonly sun = new THREE.DirectionalLight(0xffffff, 1.4);
  readonly hemi = new THREE.HemisphereLight(0xc8e8ff, 0x8f8060, 0.75);
  readonly dome: THREE.Mesh;
  private skyMat: THREE.ShaderMaterial;
  private stars: THREE.Points;
  private clouds: THREE.Group;
  private rain: THREE.Points | null = null;
  private rainPos: Float32Array | null = null;
  readonly fog: THREE.Fog;
  /** Tageszeit 0..1 (0,5 = Mittag) */
  t = 0.32;
  dayLength = 1200; // Sekunden für einen ganzen Tag
  rainAmount = 0;
  private rainTarget = 0;
  private weatherTimer = 240;
  underground = false;
  private zenith = new THREE.Color();
  readonly horizon = new THREE.Color();

  constructor(private scene: THREE.Scene, private profile: QualityProfile) {
    this.fog = new THREE.Fog(0xc8ecff, profile.fogNear, profile.far * 0.95);
    scene.fog = this.fog;
    scene.add(this.hemi);
    this.sun.castShadow = profile.shadows;
    this.configureShadow(profile);
    scene.add(this.sun, this.sun.target);

    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xffffff) }, night: { value: 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w * 0.99999; }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunCol; uniform float night; varying vec3 vDir;
        void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0);
          vec3 c = mix(horizon, top, pow(smoothstep(-0.05, 0.75, h), 0.7));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          c += sunCol * (pow(s, 900.0) * 3.0 + pow(s, 12.0) * 0.25) * (1.0 - night * 0.7);
          c = mix(c, horizon * 0.9, smoothstep(0.0, -0.2, d.y));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), this.skyMat);
    this.dome.scale.setScalar(900);
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -10;
    scene.add(this.dome);

    // Sterne
    const rng = makeRng(42), sp: number[] = [];
    for (let i = 0; i < 700; i++) { const a = rng() * TAU, y = rng() * 0.95 + 0.05, r = Math.sqrt(1 - y * y); sp.push(Math.cos(a) * r * 850, y * 850, Math.sin(a) * r * 850); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.stars.frustumCulled = false;
    scene.add(this.stars);

    // Wolken: weiche Kugelhaufen, eine Geometrie
    this.clouds = new THREE.Group();
    const cb = new GeoBuilder();
    for (let i = 0; i < 26; i++) {
      const a = rng() * TAU, r = 280 + rng() * 420, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 120 + rng() * 60, n = 4 + Math.floor(rng() * 4);
      for (let k = 0; k < n; k++) cb.sph(x + (k - n / 2) * 9 + rng() * 4, y + rng() * 5, z + rng() * 8, 7 + rng() * 6, 0xffffff, { sy: 0.6 });
    }
    const cm = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.92, fog: false });
    cm.emissive = new THREE.Color(0x8899aa);
    const cmesh = cb.mesh(cm, false); cmesh.receiveShadow = false;
    this.clouds.add(cmesh);
    scene.add(this.clouds);
  }
  configureShadow(p: QualityProfile): void {
    this.profile = p;
    this.sun.castShadow = p.shadows;
    if (!p.shadows) return;
    const s = this.sun.shadow, cam = s.camera;
    s.mapSize.set(p.shadowSize, p.shadowSize);
    const ext = p.name === 'high' ? 46 : 36;
    cam.left = -ext; cam.right = ext; cam.top = ext; cam.bottom = -ext; cam.near = 1; cam.far = 260;
    cam.updateProjectionMatrix();
    s.bias = -0.0006; s.normalBias = 0.04;
    if (s.map) { s.map.dispose?.(); s.map = null; }
    this.fog.near = p.fogNear; this.fog.far = p.far * 0.95;
  }
  get isNight(): boolean { return this.t < 0.23 || this.t > 0.78; }
  get hour(): number { return (this.t * 24) % 24; }
  setRain(on: boolean): void { this.rainTarget = on ? 1 : 0; }

  update(dt: number, focus: THREE.Vector3, camPos: THREE.Vector3, timeFlows: boolean): void {
    if (timeFlows) this.t = (this.t + dt / this.dayLength) % 1;
    // Farben interpolieren
    let i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1][0] <= this.t) i++;
    const a = KEYS[i], b = KEYS[i + 1], k = smoothstep(0, 1, (this.t - a[0]) / (b[0] - a[0]));
    this.zenith.copy(a[1]).lerp(b[1], k);
    this.horizon.copy(a[2]).lerp(b[2], k);
    const rainDim = 1 - this.rainAmount * 0.35;
    const grey = new THREE.Color(0x9aa6b4);
    this.zenith.lerp(grey, this.rainAmount * 0.5); this.horizon.lerp(grey, this.rainAmount * 0.55);
    if (this.underground) { this.zenith.setHex(0x0b3550); this.horizon.setHex(0x1f6f8a); }
    this.sun.color.copy(a[3]).lerp(b[3], k);
    this.sun.intensity = lerp(a[6], b[6], k) * rainDim * (this.underground ? 0.6 : 1);
    this.hemi.color.copy(a[4]).lerp(b[4], k);
    this.hemi.groundColor.copy(a[5]).lerp(b[5], k);
    this.hemi.intensity = (this.underground ? 1.0 : 0.72) * (0.85 + 0.15 * rainDim);
    this.fog.color.copy(this.horizon);
    // Sonnen-/Mondrichtung: tagsüber Sonne, nachts weiches Mondlicht aus der Gegenrichtung
    const ang = (this.t - 0.25) * TAU;
    const sy = Math.sin(ang), sx = Math.cos(ang);
    const night = this.isNight;
    const dir = night ? new THREE.Vector3(-sx * 0.6, Math.max(0.35, -sy), 0.4) : new THREE.Vector3(sx, Math.max(0.12, sy), 0.35);
    dir.normalize();
    this.sun.position.copy(focus).addScaledVector(dir, 120);
    this.sun.target.position.copy(focus);
    this.sun.target.updateMatrixWorld();
    const nightK = clamp(1 - (Math.max(sy, -0.2) + 0.2) / 0.35, 0, 1);
    const u = this.skyMat.uniforms;
    (u.top.value as THREE.Color).copy(this.zenith);
    (u.horizon.value as THREE.Color).copy(this.horizon);
    (u.sunDir.value as THREE.Vector3).set(sx, sy, 0.35);
    (u.sunCol.value as THREE.Color).copy(this.sun.color);
    u.night.value = nightK;
    this.dome.position.copy(camPos);
    this.stars.position.copy(camPos);
    (this.stars.material as THREE.PointsMaterial).opacity = nightK * (1 - this.rainAmount) * (this.underground ? 0 : 1);
    this.clouds.position.set(camPos.x, 0, camPos.z);
    this.clouds.rotation.y += dt * 0.004;
    this.clouds.visible = !this.underground;
    this.dome.visible = true;
    // Wetter: gelegentlicher Regen
    this.weatherTimer -= dt;
    if (this.weatherTimer < 0 && !this.underground) {
      this.weatherTimer = 150 + Math.random() * 260;
      this.rainTarget = this.rainTarget > 0 ? 0 : Math.random() < 0.35 ? 1 : 0;
    }
    if (this.underground) this.rainTarget = 0;
    this.rainAmount += (this.rainTarget - this.rainAmount) * Math.min(1, dt * 0.25);
    this.updateRain(dt, camPos);
  }
  private updateRain(dt: number, cam: THREE.Vector3): void {
    if (this.rainAmount < 0.02) { if (this.rain) this.rain.visible = false; return; }
    if (!this.rain) {
      const n = Math.round(1400 * this.profile.particles);
      this.rainPos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { this.rainPos[i * 3] = (Math.random() - 0.5) * 60; this.rainPos[i * 3 + 1] = Math.random() * 30; this.rainPos[i * 3 + 2] = (Math.random() - 0.5) * 60; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
      this.rain = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfe6ff, size: 0.12, transparent: true, opacity: 0.6, depthWrite: false }));
      this.rain.frustumCulled = false;
      this.scene.add(this.rain);
    }
    this.rain.visible = true;
    (this.rain.material as THREE.PointsMaterial).opacity = 0.6 * this.rainAmount;
    const p = this.rainPos!;
    for (let i = 0; i < p.length; i += 3) {
      p[i + 1] -= dt * 22;
      if (p[i + 1] < 0) { p[i + 1] += 30; p[i] = (Math.random() - 0.5) * 60; p[i + 2] = (Math.random() - 0.5) * 60; }
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
    this.rain.position.set(cam.x, cam.y - 12, cam.z);
  }
}
