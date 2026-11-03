// Leuchtfeuer – 3D-Grundlage: Renderer, Licht und Wetter, Texturen, Meer, Figuren (../figuren/), Herumlaufen, Kamera.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PEOPLE, WINTER } from './core.js';
import { narrow, clothe } from './clothes.js';

export const T = THREE;
const PI = Math.PI;
export const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export const E = {
  R: null, scene: null, cam: null, clock: new THREE.Clock(), quality: 'hoch', aniso: 4, t: 0,
  root: null,          // Gruppe des aktuellen Schauplatzes
  set: null,           // Daten des Schauplatzes
  figs: {},            // id → Figur
  hooks: new Set(),    // pro Bild aufgerufen (dt, t)
  camTarget: { pos: new THREE.Vector3(0, 2, 6), look: new THREE.Vector3(0, 1.2, 0), lerp: 3 },
  camLookCur: new THREE.Vector3(0, 1.2, 0)
};

// ------------------------------------------------------------ Zufall für Texturen
export function rnd(seed) { let x = (seed * 7919) % 2147483647 || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

// ------------------------------------------------------------ Texturen aus Canvas (scharf, ohne Dateien)
const TEX = {};
export function cTex(w, h, draw, rep, color = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = E.aniso; if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function speck(g, w, h, n, r, col, a0, a1, s0 = 1, s1 = 3) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${col},${a0 + r() * (a1 - a0)})`; const s = s0 + r() * (s1 - s0); g.fillRect(r() * w, r() * h, s, s); } }
const DRAW = {
  brick: (g, w, h, r) => {
    g.fillStyle = '#5b4a44'; g.fillRect(0, 0, w, h); const bh = 32, bw = 96;
    for (let y = 0, row = 0; y < h; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < w; x += bw) {
      const v = 0.85 + r() * 0.3; g.fillStyle = `rgb(${150 * v | 0},${62 * v | 0},${48 * v | 0})`; g.fillRect(x + 3, y + 3, bw - 5, bh - 5);
      speck(g, bw, bh, 0, r, '0,0,0', 0, 0); for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '30,10,5' : '255,210,180'},${r() * 0.12})`; g.fillRect(x + r() * bw, y + r() * bh, 3 + r() * 6, 2 + r() * 3); }
    }
  },
  asphalt: (g, w, h, r) => { g.fillStyle = '#4a4c52'; g.fillRect(0, 0, w, h); speck(g, w, h, 9000, r, '20,20,24', 0.05, 0.35, 1, 3); speck(g, w, h, 3000, r, '200,200,205', 0.04, 0.18, 1, 2); },
  cobble: (g, w, h, r) => { g.fillStyle = '#3a3a3e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 40) for (let x = (y / 40 % 2) * 22; x < w; x += 46) { const v = 95 + r() * 50; g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.beginPath(); g.roundRect(x + 3, y + 3, 40, 34, 9); g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 8, y + 6, 26, 5); } },
  sand: (g, w, h, r) => { g.fillStyle = '#d8c39c'; g.fillRect(0, 0, w, h); speck(g, w, h, 16000, r, '120,96,60', 0.05, 0.25, 1, 2); speck(g, w, h, 6000, r, '255,248,230', 0.1, 0.35, 1, 2); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(140,110,70,.08)'; g.lineWidth = 3; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 14, w * .7, y - 14, w, y); g.stroke(); } },
  grass: (g, w, h, r) => { g.fillStyle = '#5e7a3e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 14000; i++) { const v = r(); g.strokeStyle = `rgba(${60 + v * 70 | 0},${90 + v * 80 | 0},${30 + v * 30 | 0},.55)`; g.lineWidth = 1; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 4, y - 4 - r() * 6); g.stroke(); } },
  dune: (g, w, h, r) => { DRAW.sand(g, w, h, r); for (let i = 0; i < 2500; i++) { g.strokeStyle = `rgba(${110 + r() * 60 | 0},${120 + r() * 50 | 0},${60 + r() * 30 | 0},.5)`; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 8, y - 8 - r() * 10); g.stroke(); } },
  snow: (g, w, h, r) => { g.fillStyle = '#e9eef5'; g.fillRect(0, 0, w, h); speck(g, w, h, 9000, r, '170,185,210', 0.05, 0.22, 1, 3); speck(g, w, h, 4000, r, '255,255,255', 0.3, 0.8, 1, 2); },
  planks: (g, w, h, r) => { const n = 8; for (let i = 0; i < n; i++) { const y = i * h / n, b = 100 + r() * 35; g.fillStyle = `rgb(${b + 52},${b + 12},${b * 0.62 | 0})`; g.fillRect(0, y, w, h / n); for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(70,40,20,${0.04 + r() * 0.1})`; g.lineWidth = 0.6 + r() * 1.4; g.beginPath(); const yy = y + r() * h / n; g.moveTo(0, yy); g.bezierCurveTo(w * .3, yy + (r() - .5) * 6, w * .6, yy + (r() - .5) * 6, w, yy); g.stroke(); } g.fillStyle = 'rgba(40,22,10,.5)'; g.fillRect(0, y, w, 2); g.fillRect(r() * w, y, 2, h / n); } },
  gym: (g, w, h, r) => { DRAW.planks(g, w, h, r); g.fillStyle = 'rgba(255,190,110,.18)'; g.fillRect(0, 0, w, h); },
  tiles: (g, w, h, r) => { g.fillStyle = '#c8c4bc'; g.fillRect(0, 0, w, h); const s = 64; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const v = 225 + r() * 20; g.fillStyle = `rgb(${v},${v - 3},${v - 10})`; g.fillRect(x + 2, y + 2, s - 4, s - 4); } },
  checker: (g, w, h, r) => { const s = 64; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const d = ((x + y) / s) % 2; const v = d ? 60 + r() * 8 : 205 + r() * 10; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(x, y, s, s); } },
  plaster: (g, w, h, r) => { g.fillStyle = '#e6dfd2'; g.fillRect(0, 0, w, h); speck(g, w, h, 6000, r, '120,110,95', 0.02, 0.08, 1, 4); },
  concrete: (g, w, h, r) => { g.fillStyle = '#9a9894'; g.fillRect(0, 0, w, h); speck(g, w, h, 12000, r, '60,60,60', 0.03, 0.15, 1, 3); speck(g, w, h, 4000, r, '220,220,215', 0.03, 0.12, 1, 3); g.strokeStyle = 'rgba(60,60,60,.25)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); },
  steel: (g, w, h, r) => { g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${r() < .5 ? '255,255,255' : '80,80,90'},${r() * 0.12})`; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.lineTo(w, y + (r() - .5) * 2); g.stroke(); } },
  wood: (g, w, h, r) => { g.fillStyle = '#8a5a34'; g.fillRect(0, 0, w, h); for (let k = 0; k < 140; k++) { g.strokeStyle = `rgba(50,25,10,${0.05 + r() * 0.12})`; g.lineWidth = 0.6 + r() * 2; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + (r() - .5) * 10, w * .6, y + (r() - .5) * 10, w, y); g.stroke(); } },
  carpet: (g, w, h, r) => { g.fillStyle = '#4b5068'; g.fillRect(0, 0, w, h); speck(g, w, h, 20000, r, '20,22,40', 0.05, 0.2, 1, 2); speck(g, w, h, 8000, r, '140,150,190', 0.04, 0.12, 1, 2); },
  wallBlue: (g, w, h, r) => { g.fillStyle = '#6f8fa8'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, r, '30,40,60', 0.02, 0.06, 1, 4); },
  wallWarm: (g, w, h, r) => { g.fillStyle = '#d9b892'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, r, '120,80,40', 0.02, 0.06, 1, 4); },
  wallGreen: (g, w, h, r) => { g.fillStyle = '#8fae9a'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, r, '30,60,40', 0.02, 0.06, 1, 4); },
  shingle: (g, w, h, r) => { g.fillStyle = '#5a2e2a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 20) for (let x = (y / 20 % 2) * 16; x < w; x += 32) { const v = 70 + r() * 40; g.fillStyle = `rgb(${v + 40},${v * 0.5 | 0},${v * 0.45 | 0})`; g.beginPath(); g.roundRect(x + 1, y, 30, 22, [0, 0, 8, 8]); g.fill(); } }
};
export function tex(name, rep = [1, 1], size = 512) {
  const k = name + rep.join('x'); if (TEX[k]) return TEX[k];
  const base = TEX[name + '_c'] || (TEX[name + '_c'] = cTex(size, size, (g, w, h) => DRAW[name](g, w, h, rnd(name.length * 31 + 7)), [1, 1]));
  const t = base.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.needsUpdate = true; return (TEX[k] = t);
}
const MATS = {};
export function mat(name, o = {}) {
  const k = name + JSON.stringify(o); if (MATS[k]) return MATS[k];
  const { rep, bump, bumpScale, physical, ...p } = o;
  if (p.roughness == null) p.roughness = 0.8; if (p.metalness == null) p.metalness = 0;
  if (DRAW[name]) { p.map = tex(name, rep || [1, 1]); if (bump !== false) { p.bumpMap = p.map; p.bumpScale = bumpScale || 0.6; } }
  else p.color = new THREE.Color(name);
  return (MATS[k] = physical ? new THREE.MeshPhysicalMaterial(p) : new THREE.MeshStandardMaterial(p));
}
export const col = (c, o = {}) => mat(c, o);

// ------------------------------------------------------------ Baukasten
export function box(w, h, d, m, x = 0, y = 0, z = 0, parent, shadow = true) {
  const g = new THREE.BoxGeometry(w, h, d); fixUV(g, w, h, d); const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; if (parent) parent.add(o); return o;
}
// UVs in Metern, damit Texturen nicht verzerrt sind
function fixUV(g, w, h, d) {
  const uv = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const sx = ax > 0.5 ? d : w, sy = ay > 0.5 ? d : h;
    uv.setXY(i, uv.getX(i) * sx / 2, uv.getY(i) * sy / 2);
  }
}
export function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent, seg = 24) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; if (parent) parent.add(o); return o; }
export function plane(w, h, m, parent) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.receiveShadow = true; if (parent) parent.add(o); return o; }
export function ground(w, d, m, parent, y = 0) { const g = new THREE.PlaneGeometry(w, d); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 4, uv.getY(i) * d / 4); const o = new THREE.Mesh(g, m); o.rotation.x = -PI / 2; o.position.y = y; o.receiveShadow = true; if (parent) parent.add(o); return o; }
// Schild / Plakat mit Text
export function sign(text, w, h, o = {}) {
  const cw = 1024, ch = Math.round(1024 * h / w);
  const t = cTex(cw, ch, (g, W, H) => {
    g.fillStyle = o.bg || '#f4efe4'; g.fillRect(0, 0, W, H);
    if (o.draw) o.draw(g, W, H);
    if (text) { g.fillStyle = o.fg || '#1c2433'; g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = String(text).split('\n'); const fs = o.fs || Math.min(H / (lines.length + 0.6), W / 9); g.font = `${o.weight || 700} ${fs}px Fredoka, system-ui, sans-serif`; lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1)); }
  });
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, emissive: o.glow ? new THREE.Color('#ffffff') : new THREE.Color(0), emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow || 0 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.receiveShadow = true; return p;
}
export function lamp(color, intensity, dist, x, y, z, parent, shadow) {
  const l = new THREE.PointLight(color, intensity, dist, 1.6); l.position.set(x, y, z);
  if (shadow && E.quality === 'hoch') { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -0.002; l.shadow.radius = 3; }
  if (parent) parent.add(l); return l;
}
export function bulb(color, r, x, y, z, parent, k = 3) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k })); o.position.set(x, y, z); if (parent) parent.add(o); return o; }

// ------------------------------------------------------------ Himmel, Licht, Nebel, Niederschlag
let sky = null, sun = null, hemi = null, nightSky = null, stars = null, envRT = null, pmrem = null;
const WEATHER = { group: null, kind: null, pts: null, vel: null };
export const PRESETS = {
  day: { elev: 38, azi: 160, turb: 2.2, ray: 1.2, sunC: '#fff3e0', sunI: 2.6, hemiS: '#cfe3ff', hemiG: '#6b6250', hemiI: 0.9, fog: '#bcd2e6', fogD: 0.006, exp: 0.95, env: 0.6 },
  golden: { elev: 9, azi: 230, turb: 4, ray: 2.5, sunC: '#ffb36b', sunI: 2.4, hemiS: '#ffd3a8', hemiG: '#5a4a3a', hemiI: 0.7, fog: '#e8b88a', fogD: 0.008, exp: 0.9, env: 0.5 },
  dusk: { elev: 1.5, azi: 250, turb: 6, ray: 3, sunC: '#ff8a5a', sunI: 1.6, hemiS: '#9a7ab8', hemiG: '#3a2a30', hemiI: 0.6, fog: '#a07890', fogD: 0.006, exp: 0.95, env: 0.35 },
  grey: { elev: 25, azi: 200, turb: 10, ray: 0.6, sunC: '#d8dde4', sunI: 1.1, hemiS: '#b8c2cc', hemiG: '#555a5e', hemiI: 1.25, fog: '#9aa4ae', fogD: 0.014, exp: 0.95, env: 0.6 },
  fog: { night: true, sunC: '#8a96a8', sunI: 0.25, hemiS: '#6a7686', hemiG: '#2a2e34', hemiI: 0.8, fog: '#3b4552', fogD: 0.06, exp: 1.0, env: 0.25, top: '#2a3240', bot: '#4a5664' },
  night: { night: true, stars: true, sunC: '#9fb6ff', sunI: 0.45, hemiS: '#30406a', hemiG: '#121420', hemiI: 0.55, fog: '#101a2c', fogD: 0.012, exp: 1.05, env: 0.2, top: '#050a1a', bot: '#1b2a4a' },
  storm: { night: true, sunC: '#7a8aa8', sunI: 0.35, hemiS: '#3a4660', hemiG: '#14161c', hemiI: 0.7, fog: '#1a2230', fogD: 0.03, exp: 1.05, env: 0.25, top: '#0b0f18', bot: '#283244' },
  snow: { elev: 14, azi: 200, turb: 8, ray: 0.8, sunC: '#e6eeff', sunI: 1.2, hemiS: '#dfe8f5', hemiG: '#8a929e', hemiI: 1.15, fog: '#c9d4e2', fogD: 0.012, exp: 0.95, env: 0.6 },
  winterNight: { night: true, stars: true, sunC: '#b0c4ff', sunI: 0.5, hemiS: '#4a5a8a', hemiG: '#6a7088', hemiI: 0.7, fog: '#1c2440', fogD: 0.012, exp: 1.05, env: 0.25, top: '#060b1e', bot: '#2a3a66' },
  indoor: { indoor: true, hemiS: '#fff4e6', hemiG: '#6a5a4a', hemiI: 0.65, exp: 1.0, env: 0.9, fog: null },
  indoorNight: { indoor: true, hemiS: '#9aa8d0', hemiG: '#3a3440', hemiI: 0.3, exp: 1.05, env: 0.45, fog: null }
};
let curPreset = null;
export function setSky(name, o = {}) {
  const P = Object.assign({}, PRESETS[name] || PRESETS.day, o); curPreset = P;
  E.scene.environmentIntensity = P.env;
  hemi.color.set(P.hemiS); hemi.groundColor.set(P.hemiG); hemi.intensity = P.hemiI;
  E.R.toneMappingExposure = P.exp;
  sun.visible = !P.indoor; sky.visible = !P.indoor && !P.night; nightSky.visible = !P.indoor && !!P.night; stars.visible = !!P.stars && !P.indoor;
  if (!P.indoor) {
    sun.color.set(P.sunC); sun.intensity = P.sunI;
    const el = (P.night ? 35 : P.elev) * PI / 180, az = (P.azi || 200) * PI / 180, v = new THREE.Vector3().setFromSphericalCoords(1, PI / 2 - el, az);
    sun.position.copy(v).multiplyScalar(60); sun.target.position.set(0, 0, 0);
    if (!P.night) { const u = sky.material.uniforms; u.sunPosition.value.copy(v); u.turbidity.value = P.turb; u.rayleigh.value = P.ray; u.mieCoefficient.value = 0.005; u.mieDirectionalG.value = 0.8; }
    else { nightSky.material.uniforms.top.value.set(P.top); nightSky.material.uniforms.bot.value.set(P.bot); }
  }
  if (P.fog) { E.scene.fog = new THREE.FogExp2(P.fog, P.fogD); E.scene.background = P.night ? null : null; }
  else E.scene.fog = null;
  E.scene.background = P.indoor ? new THREE.Color(o.bg || '#20242e') : null;
}
export const preset = () => curPreset;
export function weather(kind) {
  if (WEATHER.kind === kind) return; WEATHER.kind = kind;
  if (WEATHER.pts) { WEATHER.group.remove(WEATHER.pts); WEATHER.pts.geometry.dispose(); WEATHER.pts = null; }
  if (!kind) return;
  const n = E.quality === 'spar' ? 1400 : 3200, p = new Float32Array(n * 3), v = new Float32Array(n);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 40; p[i * 3 + 1] = Math.random() * 20; p[i * 3 + 2] = (Math.random() - 0.5) * 40; v[i] = 0.6 + Math.random() * 0.6; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const snow = kind === 'snow';
  const sprite = cTex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; if (snow) c.fillRect(0, 0, w, h); else { c.fillStyle = gr; c.fillRect(w * 0.45, 0, w * 0.1, h); } });
  const m = new THREE.PointsMaterial({ size: snow ? 0.12 : 0.18, map: sprite, transparent: true, depthWrite: false, opacity: snow ? 0.95 : 0.55, color: snow ? '#ffffff' : '#c8d6ec' });
  WEATHER.pts = new THREE.Points(g, m); WEATHER.pts.frustumCulled = false; WEATHER.vel = v; WEATHER.group.add(WEATHER.pts);
}
function weatherTick(dt) {
  if (!WEATHER.pts) return; const p = WEATHER.pts.geometry.attributes.position, a = p.array, snow = WEATHER.kind === 'snow', storm = WEATHER.kind === 'storm';
  const fall = snow ? 1.2 : storm ? 22 : 15, side = storm ? 6 : snow ? 0.4 : 1;
  for (let i = 0; i < WEATHER.vel.length; i++) {
    a[i * 3 + 1] -= fall * WEATHER.vel[i] * dt; a[i * 3] += side * dt * (snow ? Math.sin(E.t + i) : 1);
    if (a[i * 3 + 1] < 0) { a[i * 3 + 1] += 20; a[i * 3] = (Math.random() - 0.5) * 40; a[i * 3 + 2] = (Math.random() - 0.5) * 40; }
  }
  p.needsUpdate = true; WEATHER.group.position.set(E.cam.position.x, E.cam.position.y - 8, E.cam.position.z);
}

// ------------------------------------------------------------ Meer (Wellen im Vertex-Shader, scrollende Normalen)
let seaNormal = null;
function seaNormalTex() {
  if (seaNormal) return seaNormal;
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N), h = new Float32Array(N * N);
  const r = rnd(5); const waves = Array.from({ length: 14 }, () => [1 + Math.floor(r() * 6), 1 + Math.floor(r() * 6), r() * 6.28, 0.3 + r()]);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = 0; for (const [a, b, p, s] of waves) v += Math.sin((x * a + y * b) / N * PI * 2 + p) * s; h[y * N + x] = v; }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + (x + 1) % N] - h[y * N + (x - 1 + N) % N], dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
    const nx = -dx * 0.6, ny = -dy * 0.6, nz = 1, l = Math.hypot(nx, ny, nz), i = (y * N + x) * 4;
    img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); seaNormal = new THREE.CanvasTexture(c); seaNormal.wrapS = seaNormal.wrapT = THREE.RepeatWrapping; seaNormal.repeat.set(24, 24); return seaNormal;
}
export function makeSea(w, d, o = {}) {
  const seg = E.quality === 'spar' ? 80 : 160;
  const g = new THREE.PlaneGeometry(w, d, seg, Math.round(seg * d / w)); g.rotateX(-PI / 2);
  const m = new THREE.MeshPhysicalMaterial({ color: o.color || '#1d4a63', roughness: 0.12, metalness: 0, normalMap: seaNormalTex(), normalScale: new THREE.Vector2(0.45, 0.45), clearcoat: 0.6, clearcoatRoughness: 0.15, transparent: !!o.opacity, opacity: o.opacity || 1 });
  const u = { uT: { value: 0 }, uAmp: { value: o.amp == null ? 0.35 : o.amp } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'uniform float uT, uAmp;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
      float wv = sin(wp.x * 0.18 + uT * 0.9) * 0.6 + sin(wp.z * 0.23 - uT * 1.1) * 0.5 + sin((wp.x + wp.z) * 0.41 + uT * 1.7) * 0.25;
      transformed.y += wv * uAmp;`);
  };
  m.customProgramCacheKey = () => 'lf-sea';
  const sea = new THREE.Mesh(g, m); sea.receiveShadow = true; sea.userData.u = u;
  E.hooks.add(sea.userData.tick = (dt, t) => { u.uT.value = t; m.normalMap.offset.set(t * 0.012, t * 0.008); });
  sea.userData.dispose = () => E.hooks.delete(sea.userData.tick);
  return sea;
}
export function seaHeight(sea, x, z) { const t = sea.userData.u.uT.value, a = sea.userData.u.uAmp.value; return (Math.sin(x * 0.18 + t * 0.9) * 0.6 + Math.sin(z * 0.23 - t * 1.1) * 0.5 + Math.sin((x + z) * 0.41 + t * 1.7) * 0.25) * a; }

// ------------------------------------------------------------ Leuchtturm (rot-weiß wie auf dem Buchcover)
export function lighthouse(h = 16) {
  const g = new THREE.Group(), bands = 6, rB = 1.7, rT = 1.15;
  const red = mat('#c7262c', { roughness: 0.55 }), white = mat('#f4f1ea', { roughness: 0.55 });
  for (let i = 0; i < bands; i++) { const y0 = i * h / bands, r0 = rB + (rT - rB) * i / bands, r1 = rB + (rT - rB) * (i + 1) / bands; cyl(r1, r0, h / bands, i % 2 ? white : red, 0, y0 + h / bands / 2, 0, g, 32); }
  const dark = mat('#20242c', { roughness: 0.4, metalness: 0.6 });
  cyl(rT + 0.5, rT + 0.5, 0.25, dark, 0, h + 0.12, 0, g, 32);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(rT + 0.45, 0.04, 6, 40), dark); rail.rotation.x = PI / 2; rail.position.y = h + 1; g.add(rail);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(rT * 0.82, rT * 0.82, 1.6, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: '#fff3c4', emissive: '#ffd36a', emissiveIntensity: 0.6, transparent: true, opacity: 0.55, roughness: 0.05, side: THREE.DoubleSide }));
  glass.position.y = h + 1.05; g.add(glass); g.userData.glass = glass;
  cyl(0.1, rT * 0.95, 1.0, red, 0, h + 2.35, 0, g, 24); bulb('#ffe9a8', 0.38, 0, h + 1.05, 0, g, 6);
  for (let i = 0; i < 3; i++) { const win = box(0.35, 0.6, 0.1, mat('#1a2030', { roughness: 0.2, metalness: 0.4 }), 0, 3 + i * 4, 0, g); win.position.set(Math.sin(i) * (rB - 0.1 - i * 0.15), 3 + i * 4, Math.cos(i) * (rB - 0.1 - i * 0.15)); win.lookAt(0, win.position.y, 0); }
  const door = box(0.9, 1.8, 0.2, mat('#2c3a4a'), 0, 0.9, rB - 0.02, g);
  g.userData.top = h + 1.05; return g;
}
// Lichtkegel (additiv), zeigt in −Z der Gruppe
export function beamCone(len = 40, r = 6, opacity = 0.18) {
  const g = new THREE.ConeGeometry(r, len, 32, 1, true); g.translate(0, -len / 2, 0); g.rotateX(-PI / 2);
  const tex = cTex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.75, 'rgba(255,240,200,.6)'); gr.addColorStop(1, 'rgba(255,250,230,1)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const m = new THREE.MeshBasicMaterial({ color: '#ffe7a6', map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  return new THREE.Mesh(g, m);
}

// ------------------------------------------------------------ Figuren
let kit = null; const LOOKS = {};
export async function figure(id, o = {}) {
  const key = id + (o.winter ? '_w' : '');
  if (E.figs[key]) return E.figs[key];
  const base = PEOPLE[id]; if (!base) throw new Error('Figur fehlt: ' + id);
  const look = Object.assign({}, base.look, o.winter && WINTER[id] ? WINTER[id] : {});
  if (o.winter && !WINTER[id]) look.topStyle = 'long';
  if (o.winter && !look.coat) look.coat = { finn: '#2b3a55', pia: '#5a2a4a', joerg: '#3a3f46', anke: '#6a4a3a' }[id] || look.coat;
  const w = look.body === 'w';
  const f = await kit.make(Object.assign({ bulk: w ? 0.8 : 0.84 }, look)); f.id = id; f.key = key;
  f.root.scale.x *= 0.94; f.root.scale.z *= 0.96; narrow(f, w ? 0.9 : 0.8); clothe(f);
  f.root.traverse(m => { if (m.isMesh) { m.castShadow = true; } });
  E.figs[key] = f; return f;
}
export const preload = ids => Promise.all(ids.map(i => figure(i).catch(e => console.warn(e))));
// Ruhige Haltung: Im Stehen hängen die Arme locker (die Grundanimation steht sonst eher wie im Kraftraum)
const RL = new THREE.Vector3(), RR = new THREE.Vector3();
export function figTick(dt) {
  for (const k in E.figs) {
    const f = E.figs[k]; if (!f.root.parent) continue; f.update(dt);
    const relax = f.curName === 'idle' || f.curName === 'walk' ? 1 : 0; f.relaxW = (f.relaxW || 0) + (relax - (f.relaxW || 0)) * Math.min(1, dt * 6);
    if (f.relaxW > 0.02 && f.root.visible) {
      const ry = f.root.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry), sw = f.curName === 'walk' ? Math.sin(f.mixer.time * 6.2) * 0.22 : 0;
      RL.set(rx * 0.16 + fx * (0.06 + sw), -1, rz * 0.16 + fz * (0.06 + sw)).normalize(); RR.set(-rx * 0.16 + fx * (0.06 - sw), -1, -rz * 0.16 + fz * (0.06 - sw)).normalize();
      f.aimArm('l', RL, 0.75 * f.relaxW); f.aimArm('r', RR, 0.75 * f.relaxW);
    }
  }
}

// ------------------------------------------------------------ Start
export async function init(canvas, opt = {}) {
  E.quality = opt.quality || 'auto'; if (E.quality === 'auto') E.quality = coarse && (navigator.hardwareConcurrency || 4) <= 6 ? 'spar' : 'hoch';
  const R = E.R = new THREE.WebGLRenderer({ canvas, antialias: E.quality === 'hoch', powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, E.quality === 'spar' ? 1.4 : 2));
  R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  R.shadowMap.enabled = E.quality === 'hoch'; R.shadowMap.type = THREE.PCFSoftShadowMap;
  E.aniso = Math.min(8, R.capabilities.getMaxAnisotropy());
  const S = E.scene = new THREE.Scene();
  E.cam = new THREE.PerspectiveCamera(55, 1, 0.1, 900); S.add(E.cam);
  pmrem = new THREE.PMREMGenerator(R); envRT = pmrem.fromScene(new RoomEnvironment(), 0.04); S.environment = envRT.texture;
  sky = new Sky(); sky.scale.setScalar(800); S.add(sky);
  nightSky = new THREE.Mesh(new THREE.SphereGeometry(780, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#050a1a') }, bot: { value: new THREE.Color('#1b2a4a') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top, bot; varying vec3 vP; void main(){ float h = clamp(vP.y * 1.6 + 0.15, 0.0, 1.0); gl_FragColor = vec4(mix(bot, top, h), 1.0); }' }));
  S.add(nightSky);
  { const n = 1600, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3().setFromSphericalCoords(700, Math.acos(Math.random() * 0.95), Math.random() * PI * 2); p.set([v.x, v.y, v.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: '#dfe8ff', fog: false, transparent: true, opacity: 0.85 })); S.add(stars); }
  hemi = new THREE.HemisphereLight('#cfe3ff', '#6b6250', 0.9); S.add(hemi);
  sun = new THREE.DirectionalLight('#fff3e0', 2.5); S.add(sun, sun.target);
  if (R.shadowMap.enabled) { sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); const c = sun.shadow.camera; c.left = c.bottom = -28; c.right = c.top = 28; c.near = 1; c.far = 160; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; }
  WEATHER.group = new THREE.Group(); S.add(WEATHER.group);
  kit = window.EasyFiguren.create({ THREE, GLTFLoader, base: '../figuren/', srgb: true });
  await kit.load();
  addEventListener('resize', resize); resize(); setSky('day');
}
export function resize() { const w = innerWidth, h = innerHeight; E.R.setSize(w, h, false); E.cam.aspect = w / h; E.cam.fov = w / h < 0.8 ? 68 : 55; E.cam.updateProjectionMatrix(); }
// Schatten der Sonne folgt dem Geschehen
export function sunFollow(x, z) { if (!sun) return; const d = sun.position.clone().sub(sun.target.position); sun.target.position.set(x, 0, z); sun.position.copy(sun.target.position).add(d); }

// ------------------------------------------------------------ Kamera
export function camTo(pos, look, lerp = 3) { E.camTarget.pos.copy(pos); E.camTarget.look.copy(look); E.camTarget.lerp = lerp; }
export function camSnap(pos, look) { E.camTarget.pos.copy(pos); E.camTarget.look.copy(look); E.cam.position.copy(pos); E.camLookCur.copy(look); E.cam.lookAt(look); }
function camTick(dt) {
  const k = 1 - Math.exp(-E.camTarget.lerp * dt);
  E.cam.position.lerp(E.camTarget.pos, k); E.camLookCur.lerp(E.camTarget.look, k); E.cam.lookAt(E.camLookCur);
}
let shake = 0; export const camShake = v => { shake = Math.max(shake, v); };

// ------------------------------------------------------------ Herumlaufen
export const X = { on: false, player: null, mx: 0, mz: 0, run: false, yaw: 0, yawV: 0, near: null, hot: [], dist: 4.4, height: 2.1, followers: [] };
export function explore(o) {
  const f = o.player; X.on = true; X.player = f; X.hot = o.hot || []; X.near = null; X.mx = X.mz = 0;
  X.yaw = o.yaw != null ? o.yaw : f.root.rotation.y + PI; X.followers = o.followers || [];
  X.dist = E.set.indoor ? 3.4 : 4.6; X.height = E.set.indoor ? 1.9 : 2.3;
}
export function exploreOff() { X.on = false; X.near = null; if (X.player) X.player.play('idle'); X.followers.forEach(f => f.play('idle')); }
export function move(x, z, run) { X.mx = x; X.mz = z; X.run = run; }
export function turnCam(d) { X.yawV = d; }
export function turnBy(a) { X.yaw += a; }
function collide(p, r = 0.3) {
  const S = E.set; const b = S.bounds;
  if (b) { p.x = Math.max(b[0] + r, Math.min(b[1] - r, p.x)); p.z = Math.max(b[2] + r, Math.min(b[3] - r, p.z)); }
  for (const s of S.solid || []) {
    if (s.r != null) { const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz), m = s.r + r; if (d < m && d > 1e-4) { p.x = s.x + dx / d * m; p.z = s.z + dz / d * m; } }
    else { const x0 = s.x0 - r, x1 = s.x1 + r, z0 = s.z0 - r, z1 = s.z1 + r; if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) { const o = [p.x - x0, x1 - p.x, p.z - z0, z1 - p.z], m = Math.min(...o); if (m === o[0]) p.x = x0; else if (m === o[1]) p.x = x1; else if (m === o[2]) p.z = z0; else p.z = z1; } }
  }
}
function exploreTick(dt) {
  if (!X.on || !X.player) return;
  const f = X.player, p = f.root.position;
  X.yaw += X.yawV * dt * 2.2;
  const len = Math.min(1, Math.hypot(X.mx, X.mz));
  if (len > 0.08) {
    const fx = -Math.sin(X.yaw), fz = -Math.cos(X.yaw), rx = Math.cos(X.yaw), rz = -Math.sin(X.yaw);
    const dx = rx * X.mx + fx * -X.mz, dz = rz * X.mx + fz * -X.mz, dl = Math.hypot(dx, dz) || 1;
    const sp = (X.run ? 4.6 : 2.4) * len * (E.set.speed || 1);
    p.x += dx / dl * sp * dt; p.z += dz / dl * sp * dt; collide(p);
    const want = Math.atan2(dx, dz); let d = want - f.root.rotation.y; while (d > PI) d -= PI * 2; while (d < -PI) d += PI * 2; f.root.rotation.y += d * Math.min(1, dt * 10);
    f.play(X.run && len > 0.7 ? 'jog' : 'walk', { speed: X.run ? 1 : 0.6 + len * 0.6 });
    // Kamera folgt sanft hinter die Laufrichtung
    let dy = f.root.rotation.y + PI - X.yaw; while (dy > PI) dy -= PI * 2; while (dy < -PI) dy += PI * 2; if (Math.abs(X.yawV) < 0.01) X.yaw += dy * Math.min(1, dt * 0.8) * (X.mz < 0 ? 1 : 0.2);
  } else f.play('idle');
  // Begleiter laufen hinterher
  X.followers.forEach((g, i) => {
    const q = g.root.position, side = i % 2 ? -1 : 1, tx = p.x + Math.sin(f.root.rotation.y + PI + side * 0.8) * (1.2 + i * 0.6), tz = p.z + Math.cos(f.root.rotation.y + PI + side * 0.8) * (1.2 + i * 0.6);
    const dx = tx - q.x, dz = tz - q.z, d = Math.hypot(dx, dz);
    if (d > 0.35) { const sp = Math.min(d * 2.2, 4.4); q.x += dx / d * sp * dt; q.z += dz / d * sp * dt; collide(q); g.root.rotation.y = Math.atan2(dx, dz); g.play(sp > 3 ? 'jog' : 'walk', { speed: Math.max(0.6, sp / 2.4) }); }
    else { g.play('idle'); }
  });
  // nächster Punkt
  let best = null, bd = 1e9; for (const h of X.hot) { const d = Math.hypot(h.x - p.x, h.z - p.z); if (d < (h.r || 1.6) && d < bd) { bd = d; best = h; } }
  X.near = best;
  // Kamera
  const cb = E.set.camBox, cx = p.x + Math.sin(X.yaw) * X.dist, cz = p.z + Math.cos(X.yaw) * X.dist;
  const cp = new THREE.Vector3(cx, p.y + X.height, cz);
  if (cb) { cp.x = Math.max(cb[0], Math.min(cb[1], cp.x)); cp.z = Math.max(cb[2], Math.min(cb[3], cp.z)); cp.y = Math.min(cb[4] || 99, cp.y); }
  camTo(cp, new THREE.Vector3(p.x, p.y + 1.35, p.z), 6);
  sunFollow(p.x, p.z);
}

// ------------------------------------------------------------ Markierung über Zielen
let marker = null;
export function markAt(h) {
  if (!marker) {
    marker = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 8, 40), new THREE.MeshBasicMaterial({ color: '#ffd56a', transparent: true, opacity: 0.85, fog: false })); ring.rotation.x = PI / 2; marker.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.4, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd56a', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); beam.position.y = 1.2; marker.add(beam);
    E.hooks.add((dt, t) => { if (marker.visible) { marker.children[0].scale.setScalar(1 + Math.sin(t * 3) * 0.08); marker.children[1].material.opacity = 0.1 + Math.sin(t * 2) * 0.04; } });
  }
  if (!h) { marker.visible = false; return; }
  marker.visible = true; marker.position.set(h.x, h.y || 0.02, h.z); E.scene.add(marker);
}

// ------------------------------------------------------------ Schleife
export function frame() {
  let dt = Math.min(0.05, E.clock.getDelta()); E.t += dt;
  exploreTick(dt); figTick(dt);
  for (const h of E.hooks) h(dt, E.t);
  if (E.set && E.set.tick) E.set.tick(dt, E.t);
  camTick(dt);
  if (shake > 0) { shake = Math.max(0, shake - dt * 1.5); E.cam.position.x += (Math.random() - 0.5) * shake * 0.2; E.cam.position.y += (Math.random() - 0.5) * shake * 0.2; }
  weatherTick(dt);
  E.R.render(E.scene, E.cam);
}
