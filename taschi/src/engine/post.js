// Bildnachbearbeitung für einen weichen, „konsolenhaften“ Look: Szene in ein
// Zwischenbild (mit Kantenglättung), heller Schein um Lichter (Bloom über eine
// kleine Unschärfe-Kette), Farbabstimmung (Sättigung, Kontrast, warme Lichter,
// kühle Schatten) und eine leichte Vignette. Eigene, kleine Umsetzung ohne
// zusätzliche Bibliotheken; auf der Stufe „Leistung“ ausgeschaltet.
import { THREE } from './three.js';

const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const BRIGHT = `uniform sampler2D tSrc; uniform float uThreshold; varying vec2 vUv;
void main() { vec3 c = texture2D(tSrc, vUv).rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); float k = smoothstep(uThreshold, uThreshold + 0.12, l); gl_FragColor = vec4(c * k, 1.0); }`;
const BLUR = `uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb * 0.227027;
  c += (texture2D(tSrc, vUv + uDir * 1.3846153).rgb + texture2D(tSrc, vUv - uDir * 1.3846153).rgb) * 0.3162162;
  c += (texture2D(tSrc, vUv + uDir * 3.2307692).rgb + texture2D(tSrc, vUv - uDir * 3.2307692).rgb) * 0.0702703;
  gl_FragColor = vec4(c, 1.0);
}`;
const FINAL = `uniform sampler2D tScene; uniform sampler2D tBloom1; uniform sampler2D tBloom2;
uniform float uBloom; uniform float uSat; uniform float uContrast; uniform float uVignette; uniform vec3 uLift; uniform vec3 uGain; varying vec2 vUv;
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  c += (texture2D(tBloom1, vUv).rgb * 0.6 + texture2D(tBloom2, vUv).rgb * 0.8) * uBloom;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, uSat);                                  // Sättigung
  c = (c - 0.5) * uContrast + 0.5;                            // Kontrast
  c = c * uGain + uLift * (1.0 - c);                          // warme Lichter, kühle Schatten
  c = c / (1.0 + max(vec3(0.0), c - 0.96) * 1.2);             // sehr helle Stellen weich abfangen statt hart abschneiden
  vec2 d = vUv - 0.5; c *= 1.0 - dot(d, d) * uVignette;       // Vignette
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

export const GRADES = {
  day: { bloom: 0.14, threshold: 0.96, sat: 1.1, contrast: 1.08, vignette: 0.5, lift: [0.0, 0.004, 0.016], gain: [1.0, 0.99, 0.96] },
  battle: { bloom: 0.18, threshold: 0.94, sat: 1.12, contrast: 1.1, vignette: 0.65, lift: [0.0, 0.004, 0.018], gain: [1.01, 0.99, 0.95] },
  indoor: { bloom: 0.08, threshold: 0.98, sat: 1.1, contrast: 1.12, vignette: 0.6, lift: [0.0, 0.0, 0.0], gain: [0.97, 0.94, 0.9] }
};

export class Post {
  constructor(renderer, { lite = false } = {}) {
    this.r = renderer; this.lite = lite;
    const gl2 = renderer.capabilities.isWebGL2;
    const opts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false };
    this.scene = gl2 && THREE.WebGLMultisampleRenderTarget ? new THREE.WebGLMultisampleRenderTarget(1, 1, opts) : new THREE.WebGLRenderTarget(1, 1, opts);
    if (this.scene.samples !== undefined) this.scene.samples = lite ? 0 : 4;
    const small = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false };
    this.rt = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(1, 1, small));
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.fs = new THREE.Scene(); this.fs.add(this.quad);
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    this.mBright = mk(BRIGHT, { tSrc: { value: null }, uThreshold: { value: 0.78 } });
    this.mBlur = mk(BLUR, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.mFinal = mk(FINAL, { tScene: { value: null }, tBloom1: { value: null }, tBloom2: { value: null }, uBloom: { value: 0.3 }, uSat: { value: 1.1 }, uContrast: { value: 1.05 }, uVignette: { value: 0.5 },
      uLift: { value: new THREE.Vector3() }, uGain: { value: new THREE.Vector3(1, 1, 1) } });
    this.grade('day');
    this.w = 0; this.h = 0;
  }
  grade(name) {
    const g = GRADES[name] || GRADES.day, u = this.mFinal.uniforms;
    this.gradeName = name;
    u.uBloom.value = g.bloom; u.uSat.value = g.sat; u.uContrast.value = g.contrast; u.uVignette.value = g.vignette;
    u.uLift.value.set(...g.lift); u.uGain.value.set(...g.gain);
    this.mBright.uniforms.uThreshold.value = g.threshold;
  }
  setSize(w, h) {
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.scene.setSize(w, h);
    this.rt[0].setSize(Math.max(1, w >> 2), Math.max(1, h >> 2)); this.rt[1].setSize(Math.max(1, w >> 2), Math.max(1, h >> 2));
    this.rt[2].setSize(Math.max(1, w >> 3), Math.max(1, h >> 3)); this.rt[3].setSize(Math.max(1, w >> 3), Math.max(1, h >> 3));
  }
  pass(mat, target) { this.quad.material = mat; this.r.setRenderTarget(target); this.r.render(this.fs, this.cam); }
  blur(src, tmp, dst) {
    const u = this.mBlur.uniforms;
    u.tSrc.value = src.texture; u.uDir.value.set(1 / src.width, 0); this.pass(this.mBlur, tmp);
    u.tSrc.value = tmp.texture; u.uDir.value.set(0, 1 / tmp.height); this.pass(this.mBlur, dst);
  }
  render(scene, camera) {
    const r = this.r, size = r.getDrawingBufferSize(new THREE.Vector2());
    this.setSize(size.x, size.y);
    r.setRenderTarget(this.scene); r.clear(); r.render(scene, camera);
    // Bloom: helle Anteile, zweimal verkleinert und weichgezeichnet
    this.mBright.uniforms.tSrc.value = this.scene.texture; this.pass(this.mBright, this.rt[1]);
    this.blur(this.rt[1], this.rt[0], this.rt[1]);
    if (!this.lite) {
      this.mBlur.uniforms.tSrc.value = this.rt[1].texture; this.mBlur.uniforms.uDir.value.set(0, 0); this.pass(this.mBlur, this.rt[3]);
      this.blur(this.rt[3], this.rt[2], this.rt[3]);
    }
    const u = this.mFinal.uniforms;
    u.tScene.value = this.scene.texture; u.tBloom1.value = this.rt[1].texture; u.tBloom2.value = this.lite ? this.rt[1].texture : this.rt[3].texture;
    this.pass(this.mFinal, null);
  }
  dispose() { this.scene.dispose(); for (const t of this.rt) t.dispose(); this.mBright.dispose(); this.mBlur.dispose(); this.mFinal.dispose(); this.quad.geometry.dispose(); }
}
