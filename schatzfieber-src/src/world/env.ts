/** Himmel (physikalisch), Sonne/Mond, Sterne, Licht, Nebel und Meer mit Wellen, Spiegelung und Uferschaum */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { T } from './textures';
import { WORLD_HALF, LAGOON } from './island';
import { smooth } from './noise';

const WATER_VS = /* glsl */ `
uniform float uTime, uLevel, uWave;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float w = sin(wp.x * 0.11 + uTime * 1.1) * 0.22 + sin(wp.z * 0.07 - uTime * 0.8) * 0.28 + sin((wp.x + wp.z) * 0.21 + uTime * 1.7) * 0.08;
  wp.y = uLevel + w * uWave;
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const WATER_FS = /* glsl */ `
uniform float uTime, uLevel, uHalf, uNight, uLight;
uniform vec3 uSunDir, uSunColor, uSky, uHorizon, uDeep, uShallow;
uniform sampler2D tNormal, tHeight;
varying vec3 vWorld;
#include <common>
#include <fog_pars_fragment>
void main() {
  vec2 uv = vWorld.xz;
  vec3 n1 = texture2D(tNormal, uv * 0.045 + uTime * vec2(0.011, 0.006)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(tNormal, uv * 0.13 - uTime * vec2(0.008, 0.013)).xyz * 2.0 - 1.0;
  vec3 n = normalize(vec3(n1.x + n2.x, 2.4, n1.y + n2.y));
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
  vec3 R = reflect(-V, n);
  vec3 sky = mix(uHorizon, uSky, clamp(R.y * 1.6, 0.0, 1.0));
  float h = texture2D(tHeight, (vWorld.xz + uHalf) / (2.0 * uHalf)).r * 40.0 - 14.0;
  float depth = uLevel - h;
  vec3 water = mix(uShallow, uDeep, smoothstep(0.2, 9.0, depth)) * uLight;
  vec3 col = mix(water, sky, clamp(fres, 0.0, 1.0) * 0.8);
  float spec = pow(max(dot(R, uSunDir), 0.0), 260.0) * 4.0 + pow(max(dot(R, uSunDir), 0.0), 18.0) * 0.12;
  col += uSunColor * spec;
  float fn = texture2D(tNormal, uv * 0.35 + uTime * 0.02).x;
  float foam = smoothstep(1.0, 0.0, depth) * smoothstep(0.35, 0.8, 0.5 + 0.5 * sin(depth * 8.0 - uTime * 2.2 + fn * 5.0));
  foam += smoothstep(0.25, 0.0, depth) * 0.6;
  col = mix(col, vec3(0.92) * max(uLight, 0.25), clamp(foam, 0.0, 1.0) * 0.75);
  float alpha = mix(0.3, 0.97, smoothstep(0.0, 4.0, depth));
  alpha = max(alpha, clamp(foam, 0.0, 1.0));
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export class Environment {
  readonly sky = new Sky();
  readonly sun = new THREE.DirectionalLight(0xffffff, 3);
  readonly hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6a5a3a, 0.7);
  readonly sunDir = new THREE.Vector3();
  readonly water: THREE.Mesh;
  readonly lagoon: THREE.Mesh;
  private wMat: THREE.ShaderMaterial;
  private lMat: THREE.ShaderMaterial;
  private stars: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private moon: THREE.Sprite;
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private envScene = new THREE.Scene();
  private lastEnvH = -99;
  /** 0 Tag … 1 Nacht */
  night = 0;
  daylight = 1;

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer, heightTex: THREE.Texture, private quality: number) {
    this.sky.scale.setScalar(4500);
    const u = this.sky.material.uniforms;
    u.turbidity.value = 4;
    u.rayleigh.value = 1.6;
    u.mieCoefficient.value = 0.004;
    u.mieDirectionalG.value = 0.82;
    scene.add(this.sky);
    this.sun.castShadow = quality > 0;
    const sz = quality > 1 ? 2048 : 1024;
    this.sun.shadow.mapSize.set(sz, sz);
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -45;
    sc.right = sc.top = 45;
    sc.near = 1;
    sc.far = 260;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    scene.add(this.sun, this.sun.target, this.hemi);
    scene.fog = new THREE.FogExp2(0xbfd8ff, 0.0026);

    const uni = () => ({
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uWave: { value: 1 },
      uHalf: { value: WORLD_HALF },
      uNight: { value: 0 },
      uLight: { value: 1 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(1, 0.95, 0.85) },
      uSky: { value: new THREE.Color(0x4a8ad8) },
      uHorizon: { value: new THREE.Color(0xbfd8ff) },
      uDeep: { value: new THREE.Color(0x0a3a5a) },
      uShallow: { value: new THREE.Color(0x2ac4c0) },
      tNormal: { value: T.waterNormal() },
      tHeight: { value: heightTex },
      ...THREE.UniformsLib.fog,
    });
    this.wMat = new THREE.ShaderMaterial({ uniforms: uni(), vertexShader: WATER_VS, fragmentShader: WATER_FS, transparent: true, fog: true, depthWrite: false });
    const seg = [60, 110, 160][quality] ?? 110;
    const wg = new THREE.PlaneGeometry(1800, 1800, seg, seg);
    wg.rotateX(-Math.PI / 2);
    this.water = new THREE.Mesh(wg, this.wMat);
    this.water.renderOrder = 2;
    this.water.frustumCulled = false;
    scene.add(this.water);
    this.lMat = this.wMat.clone();
    this.lMat.uniforms = uni();
    this.lMat.uniforms.uLevel.value = LAGOON.y;
    this.lMat.uniforms.uWave.value = 0.08;
    this.lMat.uniforms.uDeep.value.set(0x0d5a4a);
    this.lMat.uniforms.uShallow.value.set(0x3ad8b0);
    const lg = new THREE.CircleGeometry(LAGOON.r + 3, 48);
    lg.rotateX(-Math.PI / 2);
    lg.translate(LAGOON.x, 0, LAGOON.z);
    this.lagoon = new THREE.Mesh(lg, this.lMat);
    this.lagoon.renderOrder = 2;
    scene.add(this.lagoon);

    // Sterne und Mond
    const n = 1600,
      sp = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2,
        ph = Math.acos(Math.random() * 0.95);
      sp.set([Math.sin(ph) * Math.cos(th) * 1800, Math.cos(ph) * 1800, Math.sin(ph) * Math.sin(th) * 1800], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.stars.renderOrder = -1;
    scene.add(this.stars);
    this.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow(), color: 0xdde8ff, transparent: true, depthWrite: false, fog: false }));
    this.moon.scale.setScalar(160);
    scene.add(this.moon);
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envScene.add(new Sky());
  }

  /** Tageszeit in Stunden (0–26), Mittelpunkt der Schattenkamera (Spielfigur) */
  update(hours: number, t: number, focus: THREE.Vector3, storm = 0) {
    const h = hours % 24;
    const dayT = (h - 6) / 13.2; // 6:00 Aufgang … 19:12 Untergang
    const elev = Math.sin(dayT * Math.PI) * 1.15;
    const az = -dayT * Math.PI; // Osten (+x) → Westen
    this.sunDir.set(Math.cos(az) * Math.cos(Math.asin(Math.max(-1, Math.min(1, elev * 0.8)))), elev * 0.8, -0.35).normalize();
    const day = smooth(-0.08, 0.22, this.sunDir.y);
    this.daylight = day;
    this.night = 1 - smooth(-0.18, 0.05, this.sunDir.y);
    const u = this.sky.material.uniforms;
    u.sunPosition.value.copy(this.sunDir);
    u.turbidity.value = 4 + storm * 8;
    u.rayleigh.value = 1.6 + (1 - day) * 1.2;
    const low = smooth(0.45, 0.02, this.sunDir.y);
    // Sonne bzw. Mond als Hauptlicht
    const moonDir = new THREE.Vector3(-this.sunDir.x, Math.max(0.35, -this.sunDir.y), 0.3).normalize();
    const L = day > 0.02 ? this.sunDir : moonDir;
    this.sun.position.copy(focus).addScaledVector(L, 120);
    this.sun.target.position.copy(focus);
    this.sun.color.setRGB(1, 0.96 - low * 0.32, 0.88 - low * 0.55).lerp(new THREE.Color(0.55, 0.65, 1), 1 - day);
    this.sun.intensity = (day * 3.2 + (1 - day) * 0.35) * (1 - storm * 0.6);
    this.hemi.intensity = 0.25 + day * 0.65;
    this.hemi.color.setRGB(0.55 + day * 0.2, 0.68 + day * 0.15, 1).multiplyScalar(0.6 + day * 0.4);
    this.hemi.groundColor.setRGB(0.42, 0.36, 0.26).multiplyScalar(0.3 + day * 0.7);
    // Nebel und Horizont
    const fog = this.scene.fog as THREE.FogExp2;
    const hz = new THREE.Color(0.75, 0.85, 0.98).lerp(new THREE.Color(1, 0.62, 0.42), low * day).lerp(new THREE.Color(0.05, 0.08, 0.16), this.night);
    hz.lerp(new THREE.Color(0.5, 0.52, 0.56), storm);
    fog.color.copy(hz);
    fog.density = 0.0022 + storm * 0.004;
    const zen = new THREE.Color(0.25, 0.5, 0.88).lerp(new THREE.Color(0.02, 0.04, 0.1), this.night).lerp(new THREE.Color(0.35, 0.38, 0.42), storm);
    this.stars.material.opacity = this.night * (1 - storm);
    this.stars.position.copy(focus);
    this.moon.position.copy(focus).addScaledVector(moonDir, 1500);
    this.moon.material.opacity = this.night * 0.95;
    for (const m of [this.wMat, this.lMat]) {
      const w = m.uniforms;
      w.uTime.value = t;
      w.uSunDir.value.copy(L);
      w.uSunColor.value.copy(this.sun.color).multiplyScalar(day * (1 - storm) + (1 - day) * 0.25);
      w.uHorizon.value.copy(hz);
      w.uSky.value.copy(zen);
      w.uNight.value = this.night;
      w.uLight.value = 0.22 + day * 0.78;
    }
    this.water.position.x = Math.round(focus.x / 20) * 20;
    this.water.position.z = Math.round(focus.z / 20) * 20;
    this.renderer.toneMappingExposure = 0.62 + this.night * 0.35;
    // Umgebungslicht für Spiegelungen (stündlich bei hoher Qualität, sonst einmal)
    const hb = Math.floor(hours * 2) / 2;
    if (!this.envRT || (this.quality > 1 && hb !== this.lastEnvH)) {
      this.lastEnvH = hb;
      const es = this.envScene.children[0] as Sky;
      es.scale.setScalar(1000);
      const eu = es.material.uniforms;
      eu.sunPosition.value.copy(this.envRT ? this.sunDir : new THREE.Vector3(0.3, 0.6, -0.3));
      eu.turbidity.value = 4;
      eu.rayleigh.value = 1.6;
      eu.mieCoefficient.value = 0.004;
      this.envRT?.dispose();
      this.envRT = this.pmrem.fromScene(this.envScene, 0, 1, 2000);
      this.scene.environment = this.envRT.texture;
    }
    this.scene.environmentIntensity = 0.15 + day * 0.55;
  }
  setVisible(on: boolean) {
    this.water.visible = this.lagoon.visible = this.sky.visible = this.stars.visible = this.moon.visible = on;
  }
}
