// Moderne Optik (Etappe 11): weiche Sonnenschatten, Dunst mit Sonnenschein, 3D-Wolken aus Blöcken, Leuchten (Bloom) und Farbabstimmung.
// Alles abschaltbar über die Grafikstufe (settings.js): Eco/Mobil sparen Schatten, Wolken und Nachbearbeitung.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { fbm } from './noise.js';

export const SHADOW_LAYER = 1;

// Gemeinsame Shader-Bausteine für Blöcke und Deko
export const FX_GLSL = `
uniform sampler2D uShadowMap; uniform mat4 uShadowMat; uniform float uShadowOn; uniform float uShadowTexel; uniform vec3 uFogSun;
// weicher Schatten: 12 gedrehte Stichproben (Poisson) um den Punkt, Rand des Schattenbereichs blendet aus
const vec2 PD[12] = vec2[12](vec2(-0.326,-0.406), vec2(-0.840,-0.074), vec2(-0.696,0.457), vec2(-0.203,0.621), vec2(0.962,-0.195), vec2(0.473,-0.480),
  vec2(0.519,0.767), vec2(0.185,-0.893), vec2(0.507,0.064), vec2(0.896,0.412), vec2(-0.322,-0.933), vec2(-0.792,-0.598));
float shadowAt(vec3 wp, vec3 n) {
  if (uShadowOn < 0.5) return 1.0;
  vec3 p = (uShadowMat * vec4(wp + n * 0.08, 1.0)).xyz * 0.5 + 0.5;
  float edge = min(min(p.x, 1.0 - p.x), min(p.y, 1.0 - p.y));
  if (edge <= 0.0 || p.z >= 1.0) return 1.0;
  float a = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832, cs = cos(a), sn = sin(a);
  float s = 0.0, r = uShadowTexel * 1.8;
  for (int i = 0; i < 12; i++) {
    vec2 o = vec2(PD[i].x * cs - PD[i].y * sn, PD[i].x * sn + PD[i].y * cs) * r;
    s += step(p.z - 0.0012, texture2D(uShadowMap, p.xy + o).r);
  }
  return mix(1.0, s / 12.0, smoothstep(0.0, 0.06, edge));
}
// Dunst: Entfernung + leichter Grundschleier, in Richtung Sonne warm aufgehellt
vec3 applyFog(vec3 c, vec3 wp, float dist, vec3 fog, vec2 range, vec3 sunDir) {
  vec3 v = normalize(wp - cameraPosition);
  vec3 fc = fog + uFogSun * pow(max(dot(v, sunDir), 0.0), 6.0);
  float f = max(smoothstep(range.x, range.y, dist), (1.0 - exp(-dist * 0.006)) * 0.3);
  return mix(c, fc, f);
}
// warmes Licht von Lampen und Fackeln (Blocklicht 0..1 aus dem Mesher)
vec3 blockGlow(float b) { return vec3(1.0, 0.72, 0.44) * pow(b, 2.0) * 1.05; }
// Shader rechnen in Anzeige-Farben; für Nachbearbeitung und Bloom linear ausgeben (am Bildschirm wieder genau gleich)
vec3 toLinear(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
`;
export const fxUniforms = () => ({
  uShadowMap: { value: null }, uShadowMat: { value: new THREE.Matrix4() }, uShadowOn: { value: 0 }, uShadowTexel: { value: 1 / 2048 },
  uFogSun: { value: new THREE.Vector3() }
});

// ---------- Sonnenschatten ----------
export class Shadows {
  constructor(uni) {
    this.uni = uni; this.size = 0; this.rt = null; this.radius = 40; this.frame = 0; this.every = 1;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 320);
    this.cam.layers.set(SHADOW_LAYER);
    this.matAtlas = null; this.matPlain = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
    this.tmp = new THREE.Vector3(); this.saved = [];
  }
  setAtlas(tex) { this.matAtlas = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, colorWrite: false, side: THREE.DoubleSide }); }
  // size 0 = aus
  configure(size, radius, every) {
    this.radius = radius; this.every = every;
    if (size === this.size) { this.uni.uShadowOn.value = size ? 1 : 0; return; }
    if (this.rt) { this.rt.dispose(); this.rt = null; }
    this.size = size;
    if (size) {
      this.rt = new THREE.WebGLRenderTarget(size, size, { depthBuffer: true });
      this.rt.depthTexture = new THREE.DepthTexture(size, size, THREE.UnsignedIntType);
      this.rt.depthTexture.minFilter = this.rt.depthTexture.magFilter = THREE.NearestFilter;
      this.uni.uShadowMap.value = this.rt.depthTexture;
    }
    this.uni.uShadowOn.value = size ? 1 : 0;
    this.frame = 0;
  }
  // center: Spielerposition, sun: Richtung zur Sonne (normiert), group: Chunk- und Deko-Meshes
  update(renderer, scene, group, center, sun, force) {
    if (!this.size) return;
    if (sun.y < 0.04) { this.uni.uShadowOn.value = 0; return; } // Sonne/Mond zu tief: kein harter Schattenwurf
    this.uni.uShadowOn.value = 1;
    if (!force && (this.frame++ % this.every)) return;
    const cam = this.cam, R = this.radius, texel = (2 * R) / this.size;
    cam.left = -R; cam.right = R; cam.top = R; cam.bottom = -R; cam.updateProjectionMatrix();
    cam.position.copy(sun).multiplyScalar(160); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    // Mittelpunkt im Lichtraum auf ganze Texel runden: Schattenkanten flimmern beim Laufen nicht
    const p = this.tmp.copy(center).applyMatrix4(cam.matrixWorldInverse);
    p.x = Math.round(p.x / texel) * texel; p.y = Math.round(p.y / texel) * texel;
    p.applyMatrix4(cam.matrixWorld);
    cam.position.copy(p).addScaledVector(sun, 160); cam.updateMatrixWorld();
    this.uni.uShadowMat.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    this.uni.uShadowTexel.value = 1 / this.size;
    const sv = this.saved; sv.length = 0;
    for (const o of group.children) {
      if (!o.layers.test(cam.layers)) continue;
      sv.push(o, o.material);
      o.material = o.userData.atlas && this.matAtlas ? this.matAtlas : this.matPlain;
    }
    const bg = scene.background; scene.background = null;
    renderer.setRenderTarget(this.rt); renderer.clear(true, true, false);
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    scene.background = bg;
    for (let i = 0; i < sv.length; i += 2) sv[i].material = sv[i + 1];
    sv.length = 0;
  }
  dispose() { this.configure(0, this.radius, 1); }
}

// ---------- Wolken aus Blöcken (wie große, weiche Klötze am Himmel) ----------
const CN = 64, CELL = 12, CH = 4, TILE = CN * CELL;
const CLOUD_VERT = `
varying vec3 vN; varying vec3 vWp;
void main(){ vN = normal; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vWp = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const CLOUD_FRAG = `
uniform vec3 uCol; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform vec3 uFog; uniform vec2 uFade; uniform vec3 uFogSun;
varying vec3 vN; varying vec3 vWp;
vec3 toLin(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main(){
  float shade = vN.y > 0.5 ? 1.0 : vN.y < -0.5 ? 0.74 : 0.87;
  vec3 c = uCol * shade + uSunCol * max(dot(vN, uSunDir), 0.0) * 0.35;
  float d = length(vWp.xz - cameraPosition.xz);
  vec3 v = normalize(vWp - cameraPosition);
  c = mix(c, uFog + uFogSun * pow(max(dot(v, uSunDir), 0.0), 6.0), smoothstep(uFade.x * 0.4, uFade.y, d) * 0.7);
  float a = 0.88 * (1.0 - smoothstep(uFade.x, uFade.y, d));
  if (a < 0.01) discard;
  gl_FragColor = vec4(toLin(c), a);
  #include <colorspace_fragment>
}`;
export function cloudCells(seed = 7) {
  const on = new Uint8Array(CN * CN);
  for (let z = 0; z < CN; z++) for (let x = 0; x < CN; x++) {
    // kachelbar: vier versetzte Abtastungen über die Kachel überblenden
    const S = 9, f = (u, v) => fbm(u / CN * S, v / CN * S, seed, 3), wx = x / CN, wz = z / CN;
    const n = f(x, z) * (1 - wx) * (1 - wz) + f(x - CN, z) * wx * (1 - wz) + f(x, z - CN) * (1 - wx) * wz + f(x - CN, z - CN) * wx * wz;
    on[x + z * CN] = n > 0.53 ? 1 : 0;
  }
  return on;
}
export function cloudGeometry(on) {
  const pos = [], nor = [], idx = [];
  const has = (x, z) => on[((x + CN) % CN) + ((z + CN) % CN) * CN];
  const quad = (pts, n) => { const b = pos.length / 3; for (const p of pts) { pos.push(...p); nor.push(...n); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
  for (let z = 0; z < CN; z++) for (let x = 0; x < CN; x++) {
    if (!has(x, z)) continue;
    const x0 = x * CELL, x1 = x0 + CELL, z0 = z * CELL, z1 = z0 + CELL;
    quad([[x0, CH, z0], [x0, CH, z1], [x1, CH, z1], [x1, CH, z0]], [0, 1, 0]);
    quad([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], [0, -1, 0]);
    if (!has(x + 1, z)) quad([[x1, 0, z0], [x1, CH, z0], [x1, CH, z1], [x1, 0, z1]], [1, 0, 0]);
    if (!has(x - 1, z)) quad([[x0, 0, z1], [x0, CH, z1], [x0, CH, z0], [x0, 0, z0]], [-1, 0, 0]);
    if (!has(x, z + 1)) quad([[x1, 0, z1], [x1, CH, z1], [x0, CH, z1], [x0, 0, z1]], [0, 0, 1]);
    if (!has(x, z - 1)) quad([[x0, 0, z0], [x0, CH, z0], [x1, CH, z0], [x1, 0, z0]], [0, 0, -1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
  return g;
}
export class VoxelClouds {
  constructor(scene, uni) {
    this.u = { uCol: { value: new THREE.Vector3(1, 1, 1) }, uSunCol: uni.uSunCol, uSunDir: uni.uSunDir, uFog: uni.uFog, uFogSun: uni.uFogSun, uFade: { value: new THREE.Vector2(260, 440) } };
    this.mesh = new THREE.InstancedMesh(cloudGeometry(cloudCells()), new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT, fragmentShader: CLOUD_FRAG, uniforms: this.u, transparent: true, depthWrite: true
    }), 9);
    this.mesh.frustumCulled = false; this.mesh.visible = false; this.mesh.renderOrder = -5;
    this.m4 = new THREE.Matrix4();
    scene.add(this.mesh);
  }
  // Wind zieht die Wolken langsam nach Osten; neun Kacheln um den Spieler, nahtlos wiederholt
  update(cam, time, col, on) {
    this.mesh.visible = on;
    if (!on) return;
    const off = (time * 1.4) % TILE, tx = Math.floor((cam.x - off) / TILE), tz = Math.floor(cam.z / TILE);
    let k = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) this.mesh.setMatrixAt(k++, this.m4.makeTranslation(off + (tx + i) * TILE, 112, (tz + j) * TILE));
    this.mesh.instanceMatrix.needsUpdate = true;
    this.u.uCol.value.set(col[0], col[1], col[2]);
  }
}

// ---------- Nachbearbeitung: Leuchten (Bloom), sanfte Farbkurve, Vignette ----------
const GRADE = {
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.22 }, uSat: { value: 1.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
uniform sampler2D tDiffuse; uniform float uVig; uniform float uSat; varying vec2 vUv;
vec3 toSrgb(vec3 c) { c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  c = c / (1.0 + max(0.0, max(c.r, max(c.g, c.b)) - 0.8) * 0.6); // Lichter weich abfangen statt hart abschneiden
  vec3 s = toSrgb(c);
  float l = dot(s, vec3(0.299, 0.587, 0.114));
  s = mix(vec3(l), s, uSat);
  s = mix(s, s * s * (3.0 - 2.0 * s), 0.12); // etwas mehr Tiefe
  vec2 q = vUv - 0.5; s *= 1.0 - uVig * dot(q, q) * 2.2;
  s += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0; // gegen Farbstufen im Himmel
  gl_FragColor = vec4(s, 1.0);
}`
};
export class Post {
  constructor(renderer, scene, camera, msaa) {
    this.renderer = renderer;
    const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: msaa ? 4 : 0 });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.86);
    this.composer.addPass(this.bloom);
    this.grade = new ShaderPass(GRADE);
    this.composer.addPass(this.grade);
  }
  setSize(w, h, pr) { this.composer.setPixelRatio(pr); this.composer.setSize(w, h); }
  render() { this.composer.render(); }
  dispose() { this.composer.dispose(); }
}
