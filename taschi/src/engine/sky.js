// Sky dome, sun/moon, clouds, stars, day-night lighting and weather particles.
import { THREE } from './three.js';
import { particleTexture } from './textures.js';
import { globalUniforms } from './materials.js';
import { setNightGlow } from './buildings.js';

const NIGHT_TOP = new THREE.Color(0x0d1636), NIGHT_BOTTOM = new THREE.Color(0x2a3566), DUSK = new THREE.Color(0xf29a6a);
// reused every frame instead of allocating new objects (less garbage collection)
const C_TOP = new THREE.Color(), C_BOTTOM = new THREE.Color(), C_GREY_TOP = new THREE.Color(0x8a96a6), C_GREY_BOTTOM = new THREE.Color(0xb6bec8), C_HEMI_NIGHT = new THREE.Color(0x8090c8), C_CLOUD_NIGHT = new THREE.Color(0x4a5580);
const SUN_DIR = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(), AY = new THREE.Vector3(), SNAP = new THREE.Vector3();

export class Sky {
  constructor(scene, quality) {
    this.scene = scene; this.quality = quality;
    this.uniforms = { top: { value: new THREE.Color(0x7fc4ec) }, bottom: { value: new THREE.Color(0xe7f6ff) }, sunDir: { value: new THREE.Vector3(0.3, 0.8, 0.2) }, sunColor: { value: new THREE.Color(0xfff2c0) }, night: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; }',
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float night; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y * 1.4 + 0.15, 0.0, 1.0); vec3 c = mix(bottom, top, pow(h, 0.8));
          float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
          c += sunColor * (pow(s, 600.0) * 1.6 + pow(s, 12.0) * 0.18) * (1.0 - night * 0.6);
          gl_FragColor = vec4(c, 1.0); }`
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 16), mat);
    this.dome.renderOrder = -10; this.dome.frustumCulled = false;
    scene.add(this.dome);
    // stars
    const starGeo = new THREE.BufferGeometry(), n = 700, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, y = Math.abs(u) * 0.95 + 0.05, r = Math.sqrt(1 - y * y); pos[i * 3] = Math.cos(a) * r * 380; pos[i * 3 + 1] = y * 380; pos[i * 3 + 2] = Math.sin(a) * r * 380; }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.stars.frustumCulled = false; scene.add(this.stars);
    // clouds: soft billboards
    this.clouds = new THREE.Group(); scene.add(this.clouds);
    const cmat = new THREE.SpriteMaterial({ map: particleTexture('soft'), color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, fog: false });
    for (let i = 0; i < 14; i++) {
      const g = new THREE.Group();
      for (let k = 0; k < 5; k++) { const s = new THREE.Sprite(cmat); s.scale.set(60 + Math.random() * 40, 30 + Math.random() * 15, 1); s.position.set((k - 2) * 28 + Math.random() * 10, Math.random() * 8, Math.random() * 10); g.add(s); }
      const a = Math.random() * Math.PI * 2, d = 200 + Math.random() * 120;
      g.position.set(Math.cos(a) * d, 90 + Math.random() * 50, Math.sin(a) * d);
      this.clouds.add(g);
    }
    this.cloudMat = cmat;
    // lights
    this.hemi = new THREE.HemisphereLight(0xe9f6ff, 0x6a7a55, 0.85);
    this.sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
    this.sun.castShadow = quality.shadows > 0;
    if (this.sun.castShadow) {
      this.sun.shadow.mapSize.set(quality.shadows, quality.shadows);
      const c = this.sun.shadow.camera; c.left = -38; c.right = 38; c.top = 38; c.bottom = -38; c.near = 1; c.far = 160;
      this.sun.shadow.bias = -0.0008; this.sun.shadow.normalBias = 0.04;
    }
    scene.add(this.hemi, this.sun, this.sun.target);
    this.weather = null;
    this.palette = null;
    this.lightning = 0;
  }
  setPalette(pal, fixedNight = false) {
    this.palette = pal; this.fixedNight = fixedNight;
  }
  // minutes 0..1439
  update(dt, minutes, focus, camera) {
    const pal = this.palette;
    if (!pal) return;
    const hour = minutes / 60;
    // daylight curve: 0 at night, 1 at noon
    let day = Math.max(0, Math.min(1, Math.sin((hour - 6) / 12 * Math.PI) * 1.4 + 0.15));
    if (hour < 5.5 || hour > 20.5) day = 0;
    if (this.fixedNight) day = Math.min(day, 0.25);
    const night = 1 - day;
    const dusk = Math.max(0, 1 - Math.abs(hour - 19) / 1.4) + Math.max(0, 1 - Math.abs(hour - 6.5) / 1.2);
    const top = C_TOP.set(pal.sky[0]).lerp(NIGHT_TOP, night * 0.92);
    const bottom = C_BOTTOM.set(pal.sky[1]).lerp(NIGHT_BOTTOM, night * 0.85).lerp(DUSK, Math.min(0.55, dusk * 0.5) * (1 - night * 0.5));
    if (this.weather && ['rain', 'storm', 'fog', 'snow'].includes(this.weather.kind)) { top.lerp(C_GREY_TOP, 0.45); bottom.lerp(C_GREY_BOTTOM, 0.45); }
    this.uniforms.top.value.copy(top); this.uniforms.bottom.value.copy(bottom);
    this.uniforms.night.value = night;
    const ang = (hour - 6) / 12 * Math.PI;
    const sunDir = SUN_DIR.set(Math.cos(ang) * 0.6, Math.max(0.12, Math.sin(ang)), 0.45).normalize();
    if (night > 0.7) sunDir.set(-0.4, 0.7, 0.3).normalize(); // moonlight
    this.uniforms.sunDir.value.copy(sunDir);
    // snap the shadow camera to whole shadow-map texels (in light space), so
    // shadow edges do not crawl and flicker while the player walks
    let f = focus;
    if (this.sun.castShadow) {
      const sc = this.sun.shadow.camera, texel = (sc.right - sc.left) / this.sun.shadow.mapSize.x;
      AX.crossVectors(UP, sunDir).normalize(); AY.crossVectors(sunDir, AX);
      const a = Math.round(focus.dot(AX) / texel) * texel, b = Math.round(focus.dot(AY) / texel) * texel, c = focus.dot(sunDir);
      f = SNAP.copy(AX).multiplyScalar(a).addScaledVector(AY, b).addScaledVector(sunDir, c);
    }
    this.sun.position.copy(f).addScaledVector(sunDir, 70);
    this.sun.target.position.copy(f);
    this.sun.color.set(night > 0.7 ? 0x9fb4ff : 0xfff0d0).lerp(DUSK, Math.min(0.6, dusk * 0.5));
    this.sun.intensity = (night > 0.7 ? 0.22 : 0.22 + day * 0.58) * (this.weather?.dim ?? 1);
    this.hemi.intensity = (0.3 + day * 0.42) * (this.weather?.dim ?? 1);
    this.hemi.color.set(0xe9f6ff).lerp(C_HEMI_NIGHT, night * 0.7);
    this.hemi.groundColor.set(pal.grass).multiplyScalar(0.55 + day * 0.25);
    if (this.lightning > 0) { this.lightning -= dt; this.hemi.intensity += 1.5 * Math.max(0, this.lightning); }
    this.stars.material.opacity = Math.max(0, night - 0.35) * 1.2;
    this.cloudMat.color.set(0xffffff).lerp(C_CLOUD_NIGHT, night * 0.8);
    this.dome.position.copy(camera.position); this.stars.position.copy(camera.position);
    this.clouds.position.set(camera.position.x, 0, camera.position.z);
    this.clouds.rotation.y += dt * 0.004;
    if (this.scene.fog) {
      const fogCol = new THREE.Color(pal.fog).lerp(NIGHT_BOTTOM, night * 0.8);
      if (this.weather?.fog) fogCol.lerp(new THREE.Color(0xc8d0d4), 0.5);
      this.scene.fog.color.copy(fogCol);
    }
    setNightGlow(Math.max(0, night - 0.25) * 1.3);
    this.night = night;
    if (this.weather) this.updateWeather(dt, focus);
    return night;
  }
  setWeather(kind) {
    if (this.weather?.points) { this.scene.remove(this.weather.points); this.weather.points.geometry.dispose(); this.weather.points.material.dispose(); }
    this.weather = null;
    if (!kind || kind === 'clear' || kind === 'clouds') { globalUniforms.uWind.value = kind === 'clouds' ? 1.2 : 1; return; }
    const cfg = {
      rain: { n: 1400, color: 0xaecbe8, size: 0.5, speed: 26, tex: 'drop', dim: 0.75, spread: 40 },
      storm: { n: 1800, color: 0xb6c6dc, size: 0.55, speed: 34, tex: 'drop', dim: 0.6, spread: 40, lightning: true },
      snow: { n: 1300, color: 0xffffff, size: 0.35, speed: 2.4, tex: 'soft', dim: 0.85, spread: 36, drift: 1.2 },
      petals: { n: 260, color: 0xf8b4cc, size: 0.32, speed: 1.4, tex: 'petal', spread: 30, drift: 2 },
      leaves: { n: 220, color: 0xb6d46a, size: 0.32, speed: 1.6, tex: 'petal', spread: 30, drift: 2.2 },
      embers: { n: 300, color: 0xffa040, size: 0.22, speed: -1.8, tex: 'soft', spread: 30, drift: 1, additive: true },
      stars: { n: 240, color: 0xfff6c0, size: 0.25, speed: 0.3, tex: 'star', spread: 28, drift: 0.4, additive: true },
      sparkle: { n: 200, color: 0xbff4ff, size: 0.22, speed: 0.4, tex: 'star', spread: 26, drift: 0.3, additive: true },
      fog: { n: 0, fog: true, dim: 0.85 },
      wind: { n: 120, color: 0xe8eef0, size: 0.18, speed: 0.6, tex: 'soft', spread: 30, drift: 6 }
    }[kind];
    if (!cfg) return;
    globalUniforms.uWind.value = kind === 'wind' || kind === 'storm' ? 2.2 : 1;
    const n = Math.round(cfg.n * this.quality.particles);
    this.weather = { kind, ...cfg, t: 0 };
    if (!n) return;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * cfg.spread * 2; pos[i * 3 + 1] = Math.random() * 22; pos[i * 3 + 2] = (Math.random() - 0.5) * cfg.spread * 2; seed[i] = Math.random(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.userData.seed = seed;
    const m = new THREE.PointsMaterial({ color: cfg.color, size: cfg.size, map: particleTexture(cfg.tex), transparent: true, opacity: 0.85, depthWrite: false, blending: cfg.additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false;
    this.scene.add(pts);
    this.weather.points = pts;
  }
  updateWeather(dt, focus) {
    const w = this.weather;
    w.t += dt;
    if (w.lightning && Math.random() < dt * 0.08) { this.lightning = 0.25; this.onThunder && this.onThunder(); }
    if (!w.points) return;
    const pos = w.points.geometry.attributes.position, seed = w.points.geometry.userData.seed;
    const sp = w.spread;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      y -= w.speed * dt * (0.7 + seed[i] * 0.6);
      if (w.drift) { x += Math.sin(w.t * 0.8 + seed[i] * 20) * w.drift * dt; z += Math.cos(w.t * 0.6 + seed[i] * 13) * w.drift * dt * 0.6; }
      if (y < 0) y += 22; if (y > 22) y -= 22;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    // recentre around the player
    w.points.position.set(focus.x - ((focus.x % (sp * 2)) + sp * 2) % (sp * 2) * 0, 0, 0);
    w.points.position.set(Math.round(focus.x / 4) * 4, focus.y - 4, Math.round(focus.z / 4) * 4);
  }
  dispose() {
    this.setWeather(null);
    for (const o of [this.dome, this.stars, this.clouds, this.hemi, this.sun, this.sun.target]) this.scene.remove(o);
    this.dome.geometry.dispose(); this.dome.material.dispose(); this.stars.geometry.dispose(); this.stars.material.dispose();
  }
}
