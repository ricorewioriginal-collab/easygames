// KayKit-Deko (Kay Lousberg, CC0): Möbel, Stadt- und Kerker-Requisiten als Bauelemente.
// Modelle liegen aufbereitet in public/kaykit (tools/make-deco.py): eine Binärdatei, ein Textur-Atlas, keine Bibliothek nötig.
// Je Chunk und Modell ein InstancedMesh (wenige Zeichenaufrufe), Licht wie die Blöcke (Sonne, Himmelslicht der Zelle, Eigenleuchten).
import * as THREE from 'three';
import { DECO, DECO_DEF } from './blocks.js';
import { FX_GLSL, SHADOW_LAYER } from './fx.js';

const VERT = `
uniform vec3 uAmb; uniform vec3 uSunCol; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vDist; varying vec3 vWp; varying vec3 vN; varying float vBl;
void main(){
  vBl = instanceColor.b;
  vec3 n = normalize(mat3(instanceMatrix) * normal);
  float sky = instanceColor.r, em = instanceColor.g;
  vN = n;
  vAmb = uAmb * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) * (0.5 + 0.5 * sky);
  vSun = uSunCol * max(dot(n, uSunDir), 0.0) * sky;
  vEm = em;
  vUv = uv;
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vDist; varying vec3 vWp; varying vec3 vN; varying float vBl;
${FX_GLSL}
void main(){
  float sh = dot(vSun, vSun) > 0.0 ? shadowAt(vWp, vN) : 1.0;
  vec3 c = texture2D(uMap, vUv).rgb * max(vAmb + vSun * sh + blockGlow(vBl), vec3(vEm));
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 1.1); c = c * 1.15 / (1.0 + 0.15 * c);
  gl_FragColor = vec4(toLinear(applyFog(c, vWp, vDist, uFog, uFogRange, uSunDir)), 1.0);
  #include <colorspace_fragment>
}`;

// Modelle aus deco.bin lesen (Position/UV 16 Bit, Normale 8 Bit, Indizes 16 Bit)
export function parseDeco(man, buf) {
  return man.map(m => {
    let o = m.off;
    const q = new Uint16Array(buf, o, m.nv * 3); o += m.nv * 6;
    const nn = new Int8Array(buf, o, m.nv * 3); o += m.nv * 3; if (o % 2) o++;
    const uq = new Uint16Array(buf, o, m.nv * 2); o += m.nv * 4;
    const idx = new Uint16Array(buf, o, m.ni);
    const pos = new Float32Array(m.nv * 3), nor = new Float32Array(m.nv * 3), uv = new Float32Array(m.nv * 2);
    for (let i = 0; i < m.nv * 3; i++) { const k = i % 3; pos[i] = m.lo[k] + (q[i] / 65535) * (m.hi[k] - m.lo[k]); nor[i] = nn[i] / 127; }
    for (let i = 0; i < m.nv * 2; i++) uv[i] = uq[i] / 65535;
    return { name: m.name, pos, nor, uv, idx: new Uint16Array(idx), lo: m.lo, hi: m.hi };
  });
}

// Platz eines Deko-Stücks in der Zelle: Drehung r (Vorderseite 0 = +z, 1 = +x, 2 = −z, 3 = −x) und Verschiebung zur Wand
export function decoMatrix(m4, wx, y, wz, r, wall, depth, yoff) {
  const a = r * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
  // Wandstücke rücken mit der Rückseite an die Wand (gegen die Blickrichtung)
  const sh = wall ? 0.5 - depth / 2 - 0.02 : 0, fx = Math.sin(a), fz = Math.cos(a);
  const tx = wx + 0.5 - fx * sh, tz = wz + 0.5 - fz * sh;
  // M = T(t) · R(a) · T(−0.5, 0, −0.5)
  m4.set(c, 0, s, tx - 0.5 * c - 0.5 * s, 0, 1, 0, y + yoff, -s, 0, c, tz + 0.5 * s - 0.5 * c, 0, 0, 0, 1);
  return m4;
}

export class DecoLayer {
  constructor(group, uni, base = 'kaykit/') {
    this.group = group; this.uni = uni; this.base = base;
    this.geos = null; this.meta = null; this.mat = null; this.state = 0; // 0 = nicht geladen, 1 = lädt, 2 = bereit, 3 = fehlgeschlagen
    this.chunks = new Map(); this.waiting = new Map(); this.m4 = new THREE.Matrix4(); this.col = new THREE.Color();
  }
  load() {
    if (this.state) return;
    this.state = 1;
    const tex = new Promise(res => new THREE.TextureLoader().load(this.base + 'deco.png', res, undefined, () => res(null)));
    Promise.all([fetch(this.base + 'deco.json').then(r => r.json()), fetch(this.base + 'deco.bin').then(r => r.arrayBuffer()), tex]).then(([man, buf, t]) => {
      const models = parseDeco(man, buf);
      if (t) { t.flipY = false; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; } // Farbraum wie der Block-Atlas (roh)
      this.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { uAmb: this.uni.uAmb, uSunCol: this.uni.uSunCol, uSunDir: this.uni.uSunDir, uFog: this.uni.uFog, uFogRange: this.uni.uFogRange, uShadowMap: this.uni.uShadowMap, uShadowMat: this.uni.uShadowMat, uShadowOn: this.uni.uShadowOn, uShadowTexel: this.uni.uShadowTexel, uFogSun: this.uni.uFogSun, uMap: { value: t } } });
      this.meta = models;
      this.geos = models.map(m => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(m.pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(m.nor, 3));
        g.setAttribute('uv', new THREE.BufferAttribute(m.uv, 2)); g.setIndex(new THREE.BufferAttribute(m.idx, 1));
        return g;
      });
      this.state = 2;
      for (const [c, list] of this.waiting) this.setChunk(c, list);
      this.waiting.clear();
      if (this.onReady) this.onReady();
    }).catch(() => { this.state = 3; this.waiting.clear(); });
  }
  // list: [x, y, z, Block-Id, Drehung, Himmelslicht, y-Versatz, Blocklicht] je Stück (aus dem Mesher)
  setChunk(c, list) {
    this.drop(c);
    if (!list || !list.length) return;
    if (this.state !== 2) { if (this.state !== 3) { this.waiting.set(c, list); this.load(); } return; }
    const by = new Map();
    for (let i = 0; i < list.length; i += 8) { const k = DECO[list[i + 3]]; if (k == null) continue; if (!by.has(k)) by.set(k, []); by.get(k).push(i); }
    const meshes = [];
    for (const [k, items] of by) {
      const d = DECO_DEF[k], m = this.meta[k], im = new THREE.InstancedMesh(this.geos[k], this.mat, items.length);
      items.forEach((i, n) => {
        decoMatrix(this.m4, c.cx * 16 + list[i], list[i + 1], c.cz * 16 + list[i + 2], list[i + 4], d.wall, m.hi[2] - m.lo[2], list[i + 6]);
        im.setMatrixAt(n, this.m4);
        im.setColorAt(n, this.col.setRGB(list[i + 5], d.emit ? 1 : 0, list[i + 7] || 0));
      });
      im.frustumCulled = false; // Chunk-weise klein; Kugel-Prüfung lohnt nicht
      im.layers.enable(SHADOW_LAYER); // wirft Sonnenschatten
      this.group.add(im); meshes.push(im);
    }
    this.chunks.set(c, meshes);
  }
  drop(c) {
    this.waiting.delete(c);
    const ms = this.chunks.get(c); if (!ms) return;
    for (const m of ms) { this.group.remove(m); m.dispose(); }
    this.chunks.delete(c);
  }
  clear() { for (const c of [...this.chunks.keys()]) this.drop(c); this.waiting.clear(); }
}
