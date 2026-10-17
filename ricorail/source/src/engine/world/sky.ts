// Himmel (Verlauf, Sonne/Mond, Sterne), Licht, Nebel je Tageszeit und Wetter; Niederschlag um die Kamera.
import * as THREE from 'three';
import type { WorldEnv } from './index';
import { smooth01 } from './noise';

const SKY_VS = `varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = vec4(p.xy, p.w * 0.99999, p.w); }`;
const SKY_FS = `uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uGnd; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uMoonDir; uniform vec3 uMoonCol;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = h > 0.0 ? mix(uHor, uZen, pow(h, 0.45)) : mix(uHor, uGnd, min(1.0, -h * 5.0));
  float sd = dot(d, uSunDir);
  col += uSunCol * (smoothstep(0.99935, 0.9996, sd) * 6.0 + pow(max(sd, 0.0), 48.0) * 0.4);
  col += uMoonCol * smoothstep(0.99955, 0.9997, dot(d, uMoonDir));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const STAR_VS = `attribute float aB; uniform float uOp; varying float vB;
void main(){ vB = aB * uOp; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = vec4(p.xy, p.w * 0.99998, p.w); gl_PointSize = 1.0 + aB * 1.6; }`;
const STAR_FS = `varying float vB; void main(){ gl_FragColor = vec4(vec3(vB), 1.0); }`;

const CLOUD: Record<WorldEnv['weather'], number> = { clear: 0, cloudy: 0.65, rain: 0.85, storm: 0.95, snow: 0.8, fog: 0.9 };
const lin = (hex: number) => new THREE.Color(hex);
const K = {
  dayZ: lin(0x2f6cc8), dayH: lin(0xa9cbe8), nightZ: lin(0x02040c), nightH: lin(0x0b1426), duskZ: lin(0x3a3f78), duskH: lin(0xff8a3c),
  grey: lin(0x9aa0a8), sunW: lin(0xfff4e0), sunO: lin(0xffa050), moon: lin(0x8fa6d8), gnd: lin(0x4a4a44), hemiG: lin(0x5a5040),
};

export class Sky {
  readonly sun = new THREE.DirectionalLight(0xffffff, 2);
  readonly ambient = new THREE.HemisphereLight(0xbfd8ff, 0x5a5040, 1);
  readonly fog = new THREE.Fog(0xa9cbe8, 500, 2500);
  readonly bg = new THREE.Color();
  /** 0 = Tag, 1 = Nacht */
  night = 0;
  /** Helligkeit 0..1 für Niederschlag */
  light = 1;
  private dome: THREE.Mesh; private stars: THREE.Points;
  private u: Record<string, THREE.IUniform>;
  private starU = { uOp: { value: 0 } };
  private flash = 0; private prevL = false; private time = 0;
  private sd = new THREE.Vector3(); private md = new THREE.Vector3();
  private zen = new THREE.Color(); private hor = new THREE.Color(); private tc = new THREE.Color();

  constructor(private scene: THREE.Scene) {
    this.u = {
      uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uGnd: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color() }, uMoonDir: { value: new THREE.Vector3(0, -1, 0) }, uMoonCol: { value: new THREE.Color() },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(100, 24, 12), mat);
    this.dome.name = 'sky'; this.dome.frustumCulled = false; this.dome.renderOrder = -1000;
    // Sterne
    const n = 900, pos = new Float32Array(n * 3), br = new Float32Array(n);
    let s = 12345;
    const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      const y = 0.05 + r() * 0.95, a = r() * Math.PI * 2, k = Math.sqrt(1 - y * y);
      pos[i * 3] = Math.cos(a) * k * 90; pos[i * 3 + 1] = y * 90; pos[i * 3 + 2] = Math.sin(a) * k * 90; br[i] = 0.3 + r() * r() * 0.7;
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sg.setAttribute('aB', new THREE.BufferAttribute(br, 1));
    this.stars = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: this.starU, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.stars.name = 'stars'; this.stars.frustumCulled = false; this.stars.renderOrder = -999;
    this.sun.name = 'sun'; this.ambient.name = 'ambient';
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera; sc.left = -120; sc.right = 120; sc.top = 120; sc.bottom = -120; sc.near = 1; sc.far = 1200;
    this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.04;
    scene.add(this.dome, this.stars, this.sun, this.sun.target, this.ambient);
    scene.fog = this.fog; scene.background = this.bg;
  }

  update(cam: THREE.Vector3, env: WorldEnv, dt: number, viewDist: number, shadows: boolean) {
    this.time += dt;
    const season = env.season, off = season === 'summer' ? 0.18 : season === 'winter' ? -0.18 : 0;
    const a = ((env.timeOfDay % 86400) / 86400 - 0.5) * Math.PI * 2;
    const sinE = Math.max(-1, Math.min(1, 0.78 * Math.cos(a) + off)), cosE = Math.sqrt(1 - sinE * sinE);
    let hx = -Math.sin(a), hz = 0.5 * Math.cos(a); const hl = Math.hypot(hx, hz) || 1; hx /= hl; hz /= hl;
    this.sd.set(hx * cosE, sinE, hz * cosE); this.md.copy(this.sd).negate();
    const day = smooth01((sinE + 0.08) / 0.35), dusk = Math.exp(-((sinE / 0.13) ** 2));
    const cloud = CLOUD[env.weather] ?? 0;
    // Blitz: steigende Flanke startet kurzen Lichtblitz
    if (env.lightning && !this.prevL) this.flash = 1;
    this.prevL = !!env.lightning;
    this.flash = Math.max(0, this.flash - dt * 3.5);
    const fl = this.flash > 0 ? this.flash * (0.6 + 0.4 * Math.sin(this.time * 60)) : 0;
    // Himmelsfarben
    const zen = this.zen.copy(K.nightZ).lerp(K.dayZ, day).lerp(K.duskZ, dusk * 0.45 * (1 - cloud));
    const hor = this.hor.copy(K.nightH).lerp(K.dayH, day).lerp(K.duskH, dusk * 0.75 * (1 - cloud));
    const gb = 0.06 + 0.94 * day;
    this.tc.copy(K.grey).multiplyScalar(gb * (env.weather === 'storm' ? 0.55 : 0.85)); zen.lerp(this.tc, cloud);
    this.tc.copy(K.grey).multiplyScalar(gb * (env.weather === 'storm' ? 0.65 : 1)); hor.lerp(this.tc, cloud);
    if (fl > 0) { zen.addScalar(fl * 0.6); hor.addScalar(fl * 0.6); }
    (this.u.uZen.value as THREE.Color).copy(zen); (this.u.uHor.value as THREE.Color).copy(hor);
    (this.u.uGnd.value as THREE.Color).copy(K.gnd).multiplyScalar(0.1 + 0.6 * day).lerp(hor, 0.5);
    (this.u.uSunDir.value as THREE.Vector3).copy(this.sd); (this.u.uMoonDir.value as THREE.Vector3).copy(this.md);
    (this.u.uSunCol.value as THREE.Color).copy(K.sunO).lerp(K.sunW, smooth01(sinE / 0.3)).multiplyScalar(sinE > -0.05 ? 1 - cloud * 0.95 : 0);
    (this.u.uMoonCol.value as THREE.Color).copy(K.moon).multiplyScalar((1 - day) * (1 - cloud) * 1.5);
    this.starU.uOp.value = (1 - smooth01((sinE + 0.15) / 0.15)) * (1 - cloud);
    this.stars.visible = this.starU.uOp.value > 0.01;
    // Licht
    const useSun = sinE > -0.03;
    const dir = useSun ? this.sd : this.md;
    const I = useSun ? 2.8 * smooth01((sinE + 0.03) / 0.25) * (1 - cloud * 0.8) : 0.28 * smooth01((-sinE - 0.03) / 0.15) * (1 - cloud * 0.8);
    this.sun.intensity = I;
    if (useSun) this.sun.color.copy(K.sunO).lerp(K.sunW, smooth01(sinE / 0.3)); else this.sun.color.copy(K.moon);
    const snap = 0.5, tx = Math.round(cam.x / snap) * snap, ty = Math.round(cam.y / snap) * snap, tz = Math.round(cam.z / snap) * snap;
    this.sun.target.position.set(tx, ty, tz);
    this.sun.position.set(tx + dir.x * 500, ty + Math.max(0.05, dir.y) * 500, tz + dir.z * 500);
    this.sun.castShadow = shadows && I > 0.05;
    this.ambient.intensity = 0.18 + 1.05 * day * (1 - 0.25 * cloud) + fl * 3;
    this.ambient.color.copy(hor).lerp(zen, 0.5).multiplyScalar(1).addScalar(0.05);
    this.ambient.groundColor.copy(K.hemiG).multiplyScalar(0.2 + 0.8 * day);
    this.night = 1 - day;
    this.light = 0.15 + 0.85 * day;
    // Nebel
    const w = env.weather;
    const far = w === 'fog' ? 230 : viewDist * (w === 'clear' ? 1.0 : w === 'cloudy' ? 0.9 : w === 'rain' ? 0.55 : w === 'storm' ? 0.45 : 0.45);
    this.fog.near = w === 'fog' ? 8 : far * 0.3; this.fog.far = far;
    this.fog.color.copy(hor);
    this.bg.copy(hor);
    this.dome.position.copy(cam); this.stars.position.copy(cam);
  }

  dispose() {
    this.dome.removeFromParent(); this.stars.removeFromParent();
    this.dome.geometry.dispose(); (this.dome.material as THREE.Material).dispose();
    this.stars.geometry.dispose(); (this.stars.material as THREE.Material).dispose();
    this.sun.removeFromParent(); this.sun.target.removeFromParent(); this.ambient.removeFromParent();
    this.sun.dispose(); this.ambient.dispose();
    if (this.scene.fog === this.fog) this.scene.fog = null;
    if (this.scene.background === this.bg) this.scene.background = null;
  }
}

/** Regen (Striche) und Schnee (Punkte) in einer Box um die Kamera */
export class Precip {
  private rain: THREE.LineSegments; private snow: THREE.Points;
  private rp: Float32Array; private sp: Float32Array;
  private last = new THREE.Vector3(); private hasLast = false; private t = 0;
  constructor(scene: THREE.Scene, private n: number) {
    this.rp = new Float32Array(n * 3); this.sp = new Float32Array(n * 3);
    let s = 777; const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < n * 3; i += 3) { this.rp[i] = (r() - 0.5) * 70; this.rp[i + 1] = r() * 40 - 15; this.rp[i + 2] = (r() - 0.5) * 70; this.sp[i] = (r() - 0.5) * 70; this.sp[i + 1] = r() * 40 - 15; this.sp[i + 2] = (r() - 0.5) * 70; }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab4c4, transparent: true, opacity: 0.45, depthWrite: false }));
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(this.sp, 3));
    this.snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.11, transparent: true, opacity: 0.9, depthWrite: false }));
    for (const o of [this.rain, this.snow]) { o.frustumCulled = false; o.visible = false; scene.add(o); }
    this.rain.name = 'rain'; this.snow.name = 'snow';
  }
  update(cam: THREE.Vector3, env: WorldEnv, dt: number, hide: boolean, light: number) {
    this.t += dt;
    let ddx = 0, ddy = 0, ddz = 0;
    if (this.hasLast) { ddx = cam.x - this.last.x; ddy = cam.y - this.last.y; ddz = cam.z - this.last.z; if (Math.abs(ddx) + Math.abs(ddz) > 200) { ddx = ddy = ddz = 0; } }
    this.last.copy(cam); this.hasLast = true;
    const w = env.weather, isRain = (w === 'rain' || w === 'storm') && !hide, isSnow = w === 'snow' && !hide;
    this.rain.visible = isRain; this.snow.visible = isSnow;
    if (isRain) {
      const cnt = Math.floor(this.n * (w === 'storm' ? 1 : 0.6)), vx = w === 'storm' ? -5 : -1.5, vy = w === 'storm' ? -16 : -13, vz = w === 'storm' ? 2 : 0.8;
      const p = this.rp, out = (this.rain.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < cnt; i++) {
        const k = i * 3;
        p[k] = wrap(p[k] + vx * dt - ddx, 35); p[k + 1] = wrapY(p[k + 1] + vy * dt - ddy); p[k + 2] = wrap(p[k + 2] + vz * dt - ddz, 35);
        const o = i * 6; out[o] = p[k]; out[o + 1] = p[k + 1]; out[o + 2] = p[k + 2];
        out[o + 3] = p[k] - vx * 0.045; out[o + 4] = p[k + 1] - vy * 0.045; out[o + 5] = p[k + 2] - vz * 0.045;
      }
      this.rain.geometry.setDrawRange(0, cnt * 2); this.rain.geometry.getAttribute('position').needsUpdate = true;
      (this.rain.material as THREE.LineBasicMaterial).color.setScalar(0.25 + 0.5 * light);
      this.rain.position.copy(cam);
    }
    if (isSnow) {
      const p = this.sp, cnt = this.n;
      for (let i = 0; i < cnt; i++) {
        const k = i * 3, wob = Math.sin(this.t * 1.3 + i) * 0.5;
        p[k] = wrap(p[k] + (0.6 + wob) * dt - ddx, 35); p[k + 1] = wrapY(p[k + 1] - 1.4 * dt - ddy); p[k + 2] = wrap(p[k + 2] + (0.3 + wob * 0.5) * dt - ddz, 35);
      }
      this.snow.geometry.getAttribute('position').needsUpdate = true;
      (this.snow.material as THREE.PointsMaterial).color.setScalar(0.3 + 0.7 * light);
      this.snow.position.copy(cam);
    }
  }
  dispose() {
    for (const o of [this.rain, this.snow]) { o.removeFromParent(); o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
  }
}
const wrap = (v: number, h: number) => (v > h ? v - 2 * h : v < -h ? v + 2 * h : v);
const wrapY = (v: number) => (v < -15 ? v + 40 : v > 25 ? v - 40 : v);
