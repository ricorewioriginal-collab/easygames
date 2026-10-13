// Procedurally painted textures (no external image files). Cached by key and
// shared between maps; the resource tracker never disposes cached textures.
import { THREE } from './three.js';
import { createRng } from '../core/rng.js';

const cache = new Map();
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function finish(c, { repeat = 1, srgb = true, nearest = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  void srgb;
  t.anisotropy = 4;
  if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  return t;
}
export function cached(key, make) { if (!cache.has(key)) { const t = make(); t.userData = t.userData || {}; t.userData.shared = true; cache.set(key, t); } return cache.get(key); }

const hex = (c) => '#' + new THREE.Color(c).getHexString();

// Grayscale detail noise used to break up flat vertex colours.
export function detailTexture() {
  return cached('detail', () => {
    const c = canvas(256, 256), x = c.getContext('2d'), rng = createRng('detail');
    x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = 150 + Math.floor(rng.next() * 105);
      x.fillStyle = `rgba(${v},${v},${v},${0.25 + rng.next() * 0.35})`;
      const px = rng.next() * 256, py = rng.next() * 256, s = 1 + rng.next() * 3;
      x.fillRect(px, py, s, s * (0.4 + rng.next()));
    }
    for (let i = 0; i < 400; i++) {
      x.strokeStyle = `rgba(90,90,90,${0.08 + rng.next() * 0.1})`;
      x.lineWidth = 1;
      const px = rng.next() * 256, py = rng.next() * 256;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rng.next() - 0.5) * 4, py - 3 - rng.next() * 5); x.stroke();
    }
    return finish(c, { srgb: false });
  });
}

// Toon gradient (3 steps) for characters and creatures.
export function toonGradient() {
  return cached('toon', () => {
    const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
    const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  });
}

export function cobbleTexture(base = 0xb9b1a3) {
  return cached('cobble' + base, () => {
    const c = canvas(256, 256), x = c.getContext('2d'), rng = createRng('cobble');
    const col = new THREE.Color(base);
    x.fillStyle = hex(col.clone().multiplyScalar(0.62)); x.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) for (let i = 0; i < 8; i++) {
      const w = 32, h = 32, ox = (row % 2) * 16;
      const px = i * w + ox + 2 + rng.next() * 2, py = row * h + 2 + rng.next() * 2;
      const f = 0.85 + rng.next() * 0.25;
      x.fillStyle = hex(col.clone().multiplyScalar(f));
      x.beginPath(); x.roundRect ? x.roundRect(px, py, w - 5, h - 5, 7) : x.rect(px, py, w - 5, h - 5); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(px + 3, py + 3, w - 14, 4);
    }
    return finish(c);
  });
}

export function plankTexture(base = 0x9a6a44) {
  return cached('plank' + base, () => {
    const c = canvas(128, 128), x = c.getContext('2d'), rng = createRng('plank');
    const col = new THREE.Color(base);
    for (let i = 0; i < 8; i++) {
      x.fillStyle = hex(col.clone().multiplyScalar(0.85 + rng.next() * 0.25));
      x.fillRect(0, i * 16, 128, 15);
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, i * 16 + 15, 128, 1);
      for (let k = 0; k < 6; k++) { x.fillStyle = 'rgba(60,30,10,0.15)'; x.fillRect(rng.next() * 128, i * 16 + 3 + rng.next() * 9, 10 + rng.next() * 30, 1); }
    }
    return finish(c);
  });
}

export function roofTileTexture(base) {
  return cached('roof' + base, () => {
    const c = canvas(128, 128), x = c.getContext('2d');
    const col = new THREE.Color(base);
    x.fillStyle = hex(col.clone().multiplyScalar(0.7)); x.fillRect(0, 0, 128, 128);
    for (let row = 0; row < 8; row++) for (let i = 0; i < 9; i++) {
      const px = i * 16 - (row % 2) * 8, py = row * 16;
      const g = x.createLinearGradient(0, py, 0, py + 16);
      g.addColorStop(0, hex(col.clone().multiplyScalar(1.12)));
      g.addColorStop(1, hex(col.clone().multiplyScalar(0.82)));
      x.fillStyle = g;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + 15, py); x.lineTo(px + 15, py + 12); x.quadraticCurveTo(px + 7.5, py + 17, px, py + 12); x.fill();
    }
    return finish(c);
  });
}

export function wallTexture(base, kind = 'plaster') {
  return cached('wall' + kind + base, () => {
    const c = canvas(128, 128), x = c.getContext('2d'), rng = createRng('wall' + kind);
    const col = new THREE.Color(base);
    x.fillStyle = hex(col); x.fillRect(0, 0, 128, 128);
    if (kind === 'brick' || kind === 'stone') {
      const bh = kind === 'brick' ? 10 : 20, bw = kind === 'brick' ? 24 : 34;
      for (let row = 0; row < 128 / bh; row++) for (let i = -1; i < 128 / bw + 1; i++) {
        const px = i * bw + (row % 2) * bw / 2, py = row * bh;
        x.fillStyle = hex(col.clone().multiplyScalar(0.86 + rng.next() * 0.22));
        x.fillRect(px + 1, py + 1, bw - 2, bh - 2);
      }
    } else {
      for (let i = 0; i < 500; i++) { const v = rng.next(); x.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; x.fillRect(rng.next() * 128, rng.next() * 128, 2 + rng.next() * 5, 2 + rng.next() * 5); }
    }
    return finish(c);
  });
}

// Floor tiles for interiors
export function floorTexture(a, b, size = 8) {
  return cached('floor' + a + b + size, () => {
    const c = canvas(128, 128), x = c.getContext('2d');
    const s = 128 / size;
    for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) { x.fillStyle = hex((i + j) % 2 ? a : b); x.fillRect(i * s, j * s, s, s); }
    x.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i <= size; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, 128); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(128, i * s); x.stroke(); }
    return finish(c);
  });
}

// Text/emblem sign texture (not cached: content specific).
export function signTexture(text, { bg = '#2f4c66', fg = '#fff8e2', icon = '', w = 512, h = 128, font = 54 } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = bg; x.beginPath(); x.roundRect ? x.roundRect(4, 4, w - 8, h - 8, 22) : x.rect(4, 4, w - 8, h - 8); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.65)'; x.lineWidth = 6; x.stroke();
  x.fillStyle = fg; x.font = `700 ${font}px Fredoka, system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText((icon ? icon + ' ' : '') + text, w / 2, h / 2 + 3, w - 30);
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

export function emblemTexture(symbol, color = '#ffffff', bg = 'rgba(0,0,0,0)') {
  return cached('emblem' + symbol + color + bg, () => {
    const c = canvas(128, 128), x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, 128, 128);
    x.fillStyle = color; x.font = '700 92px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(symbol, 64, 70);
    const t = finish(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
  });
}

// Soft round particle sprite
export function particleTexture(kind = 'soft') {
  return cached('particle' + kind, () => {
    const c = canvas(64, 64), x = c.getContext('2d');
    if (kind === 'star') {
      x.fillStyle = '#fff'; x.translate(32, 32);
      x.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 10 : 30, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      x.fill();
    } else if (kind === 'petal') {
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(32, 32, 26, 14, 0.6, 0, Math.PI * 2); x.fill();
    } else if (kind === 'drop') {
      const g = x.createLinearGradient(32, 0, 32, 64); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)');
      x.fillStyle = g; x.fillRect(29, 0, 6, 64);
    } else {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    }
    const t = new THREE.CanvasTexture(c); return t;
  });
}

// Mural / clue painting for puzzles: draws shapes onto a plaque.
export function clueTexture(draw, key) {
  const make = () => {
    const c = canvas(128, 128), x = c.getContext('2d');
    x.fillStyle = '#e9dcc0'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#6b5236'; x.lineWidth = 8; x.strokeRect(4, 4, 120, 120);
    draw(x);
    const t = finish(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
  };
  return key ? cached('clue' + key, make) : make();
}

export function disposeCache() { for (const t of cache.values()) t.dispose(); cache.clear(); }
