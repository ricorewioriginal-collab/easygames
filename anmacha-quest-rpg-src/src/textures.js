// Prozedurale Texturen (beim Start per Code erzeugt, keine Downloads): Boden-Detail + Normalen, Partikel, Effekte.
import * as THREE from 'three';

function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// kachelbares Wertrauschen (Periode p)
function vnoise(x, y, p, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const m = (a) => ((a % p) + p) % p;
  const a = hash(m(xi), m(yi), s), b = hash(m(xi + 1), m(yi), s), c = hash(m(xi), m(yi + 1), s), d = hash(m(xi + 1), m(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, p, s, oct = 5) {
  let t = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { t += vnoise(x * f, y * f, p * f, s + i) * amp; n += amp; amp *= 0.5; f *= 2; }
  return t / n;
}

// Höhenfeld -> Detail-Farbe (Graustufen um 1) und Normalen-Textur
function bake(size, heightFn, albedoFn) {
  const H = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) H[y * size + x] = heightFn(x / size, y / size);
  const alb = new Uint8Array(size * size * 4), nrm = new Uint8Array(size * size * 4);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, h = at(x, y);
    const a = albedoFn(h, x / size, y / size);
    alb[i] = alb[i + 1] = alb[i + 2] = Math.max(0, Math.min(255, a * 255)); alb[i + 3] = 255;
    const dx = (at(x + 1, y) - at(x - 1, y)) * size * 0.012, dy = (at(x, y + 1) - at(x, y - 1)) * size * 0.012;
    const l = Math.hypot(dx, dy, 1);
    nrm[i] = (-dx / l * 0.5 + 0.5) * 255; nrm[i + 1] = (dy / l * 0.5 + 0.5) * 255; nrm[i + 2] = (1 / l * 0.5 + 0.5) * 255; nrm[i + 3] = 255;
  }
  const mk = (d, srgb) => {
    const t = new THREE.DataTexture(d, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return { map: mk(alb, true), normal: mk(nrm, false) };
}

const cache = {};
// kind: grass | tile | crack | snow
export function groundTex(kind) {
  if (cache[kind]) return cache[kind];
  const S = 256;
  let t;
  if (kind === 'tile') {
    // 2x2 Steinplatten mit Fugen
    t = bake(S, (u, v) => {
      const gx = (u * 2) % 1, gy = (v * 2) % 1;
      const e = Math.min(gx, 1 - gx, gy, 1 - gy);
      const groove = Math.min(1, e / 0.04);
      return groove * 0.6 + fbm(u * 8, v * 8, 8, 3) * 0.4;
    }, (h, u, v) => 0.62 + h * 0.38 + (hash(Math.floor(u * 2), Math.floor(v * 2), 9) - 0.5) * 0.12);
  } else if (kind === 'crack') {
    t = bake(S, (u, v) => {
      const n = fbm(u * 6, v * 6, 6, 5);
      const c = Math.abs(fbm(u * 4, v * 4, 4, 11) - 0.5);
      return n * 0.6 + Math.min(1, c * 9) * 0.4;
    }, (h) => 0.55 + h * 0.45);
  } else if (kind === 'snow') {
    t = bake(S, (u, v) => fbm(u * 6, v * 6, 6, 21) * 0.8 + fbm(u * 24, v * 24, 24, 4) * 0.2, (h) => 0.9 + h * 0.1);
  } else {
    // Gras/Erde: feine Halme + Flecken
    t = bake(S, (u, v) => fbm(u * 10, v * 10, 10, 7) * 0.55 + fbm(u * 40, v * 40, 40, 13) * 0.45,
      (h, u, v) => 0.7 + h * 0.3 + (fbm(u * 3, v * 3, 3, 2) - 0.5) * 0.18);
  }
  cache[kind] = t;
  return t;
}

// Weicher runder Punkt (Partikel, Glanz)
export function dotTex() {
  if (cache.dot) return cache.dot;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.dot = t;
  return t;
}
// Sichel für Schwerthiebe
export function slashTex() {
  if (cache.slash) return cache.slash;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.6, 'rgba(255,255,255,0.9)');
  gr.addColorStop(1, 'rgba(255,255,255,1)');
  g.strokeStyle = gr;
  g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    g.lineWidth = 10 - i * 3;
    g.globalAlpha = 1 - i * 0.25;
    g.beginPath();
    g.ellipse(128, 128, 118 - i * 4, 100 - i * 10, 0, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.slash = t;
  return t;
}
// Kontaktschatten unter Figuren
export function blobTex() {
  if (cache.blob) return cache.blob;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)');
  gr.addColorStop(0.6, 'rgba(0,0,0,0.25)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  cache.blob = new THREE.CanvasTexture(c);
  return cache.blob;
}
