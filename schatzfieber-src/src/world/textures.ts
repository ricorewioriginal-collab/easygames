/** Prozedurale Texturen (Canvas) – kachelbar, ohne externe Bilddateien */
import * as THREE from 'three';
import { rng } from './noise';

type Ctx = CanvasRenderingContext2D;
function canvas(w: number, h = w): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

/** Kachelbares Rauschen 0…1 mit Periode p (Zellen) */
function pnoise(x: number, y: number, p: number, seed: number): number {
  const h = (i: number, j: number) => {
    i = ((i % p) + p) % p;
    j = ((j % p) + p) % p;
    let v = (i * 374761393 + j * 668265263 + seed * 1442695041) | 0;
    v = Math.imul(v ^ (v >>> 13), 1274126177);
    return ((v ^ (v >>> 16)) >>> 0) / 4294967295;
  };
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi,
    u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = h(xi, yi),
    b = h(xi + 1, yi),
    c = h(xi, yi + 1),
    d = h(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function tfbm(x: number, y: number, size: number, base: number, oct: number, seed: number) {
  let s = 0,
    amp = 0.5,
    n = 0,
    p = base;
  for (let i = 0; i < oct; i++) {
    s += pnoise((x / size) * p, (y / size) * p, p, seed + i) * amp;
    n += amp;
    amp *= 0.5;
    p *= 2;
  }
  return s / n;
}

function tex(c: HTMLCanvasElement, repeat = true, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** Bodentextur aus Grundfarbe + Rauschen + Details */
function groundTex(size: number, seed: number, base: [number, number, number], vary: number, detail: (x: Ctx, r: () => number) => void) {
  const [c, x] = canvas(size);
  const img = x.createImageData(size, size),
    d = img.data;
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const n = tfbm(i, j, size, 4, 5, seed) - 0.5,
        f = tfbm(i, j, size, 32, 2, seed + 9) - 0.5;
      const k = (j * size + i) * 4,
        m = 1 + n * vary + f * vary * 0.6;
      d[k] = base[0] * m;
      d[k + 1] = base[1] * m;
      d[k + 2] = base[2] * m;
      d[k + 3] = 255;
    }
  x.putImageData(img, 0, 0);
  detail(x, rng(seed));
  return c;
}

const cache = new Map<string, THREE.Texture>();
function once(key: string, make: () => THREE.Texture) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
}

export const T = {
  sand: () =>
    once('sand', () =>
      tex(groundTex(256, 1, [222, 202, 158], 0.22, (x, r) => {
        for (let i = 0; i < 900; i++) {
          x.fillStyle = r() < 0.5 ? 'rgba(255,250,235,.5)' : 'rgba(150,120,80,.35)';
          x.fillRect(r() * 256, r() * 256, 1, 1);
        }
      })),
    ),
  grass: () =>
    once('grass', () =>
      tex(groundTex(256, 2, [92, 140, 58], 0.4, (x, r) => {
        for (let i = 0; i < 2600; i++) {
          const g = 90 + r() * 90;
          x.strokeStyle = `rgba(${g * 0.55},${g},${g * 0.35},.55)`;
          const px = r() * 256,
            py = r() * 256;
          x.beginPath();
          x.moveTo(px, py);
          x.lineTo(px + (r() - 0.5) * 3, py - 3 - r() * 4);
          x.stroke();
        }
      })),
    ),
  rock: () =>
    once('rock', () =>
      tex(groundTex(256, 3, [128, 118, 108], 0.55, (x, r) => {
        x.strokeStyle = 'rgba(40,34,30,.35)';
        for (let i = 0; i < 40; i++) {
          x.beginPath();
          let px = r() * 256,
            py = r() * 256;
          x.moveTo(px, py);
          for (let k = 0; k < 5; k++) x.lineTo((px += (r() - 0.5) * 30), (py += (r() - 0.5) * 30));
          x.stroke();
        }
      })),
    ),
  dirt: () =>
    once('dirt', () =>
      tex(groundTex(256, 4, [150, 118, 82], 0.35, (x, r) => {
        for (let i = 0; i < 500; i++) {
          x.fillStyle = `rgba(${90 + r() * 80},${70 + r() * 60},${50 + r() * 40},.6)`;
          const s = 1 + r() * 3;
          x.beginPath();
          x.ellipse(r() * 256, r() * 256, s, s * 0.7, r() * 3, 0, 7);
          x.fill();
        }
      })),
    ),
  /** Steinmauer aus Quadern (Höhlen, Ruinen, Tempel) */
  stone: (tint = '#8a8072', seed = 5) =>
    once('stone' + tint + seed, () => {
      const [c, x] = canvas(256);
      x.fillStyle = '#2a2420';
      x.fillRect(0, 0, 256, 256);
      const r = rng(seed),
        col = new THREE.Color(tint);
      for (let row = 0; row < 6; row++) {
        const h = 256 / 6,
          off = row % 2 ? 32 : 0;
        for (let i = -1; i < 5; i++) {
          const w = 64,
            l = 0.75 + r() * 0.4;
          x.fillStyle = `rgb(${col.r * 255 * l},${col.g * 255 * l},${col.b * 255 * l})`;
          x.fillRect(i * w + off + 2, row * h + 2, w - 4, h - 4);
        }
      }
      const img = x.getImageData(0, 0, 256, 256),
        d = img.data;
      for (let j = 0; j < 256; j++)
        for (let i = 0; i < 256; i++) {
          const k = (j * 256 + i) * 4,
            n = 0.75 + tfbm(i, j, 256, 8, 4, seed) * 0.5;
          d[k] *= n;
          d[k + 1] *= n;
          d[k + 2] *= n;
        }
      x.putImageData(img, 0, 0);
      return tex(c);
    }),
  /** Holzbretter */
  wood: (tint = '#8a5a34') =>
    once('wood' + tint, () => {
      const [c, x] = canvas(256);
      const col = new THREE.Color(tint),
        r = rng(7);
      for (let i = 0; i < 8; i++) {
        const l = 0.8 + r() * 0.35;
        x.fillStyle = `rgb(${col.r * 255 * l},${col.g * 255 * l},${col.b * 255 * l})`;
        x.fillRect(0, i * 32, 256, 31);
        x.strokeStyle = 'rgba(30,18,8,.25)';
        for (let k = 0; k < 6; k++) {
          x.beginPath();
          const y = i * 32 + 4 + r() * 24;
          x.moveTo(0, y);
          x.bezierCurveTo(80, y + (r() - 0.5) * 6, 170, y + (r() - 0.5) * 6, 256, y);
          x.stroke();
        }
        x.fillStyle = 'rgba(20,10,4,.55)';
        x.fillRect(0, i * 32 + 31, 256, 1);
      }
      return tex(c);
    }),
  /** Dachziegel */
  roof: (tint = '#b0503a') =>
    once('roof' + tint, () => {
      const [c, x] = canvas(128);
      const col = new THREE.Color(tint),
        r = rng(11);
      for (let row = 0; row < 8; row++)
        for (let i = 0; i < 8; i++) {
          const l = 0.75 + r() * 0.35,
            off = row % 2 ? 8 : 0;
          x.fillStyle = `rgb(${col.r * 255 * l},${col.g * 255 * l},${col.b * 255 * l})`;
          x.beginPath();
          x.roundRect(i * 16 + off - 8, row * 16, 15, 15, [0, 0, 7, 7]);
          x.fill();
          x.fillStyle = 'rgba(0,0,0,.25)';
          x.fillRect(i * 16 + off - 8, row * 16 + 13, 15, 2);
        }
      return tex(c);
    }),
  /** Hausfassade (ein Fensterfeld, horizontal kachelbar): Putz, Fenster mit Läden */
  facade: (wall: string, shutter: string, seed: number) =>
    once('fac' + wall + shutter + seed, () => {
      const [c, x] = canvas(128, 128);
      const col = new THREE.Color(wall);
      const img = x.createImageData(128, 128),
        d = img.data;
      for (let j = 0; j < 128; j++)
        for (let i = 0; i < 128; i++) {
          const n = 0.9 + tfbm(i, j, 128, 4, 4, seed) * 0.2 - (j > 118 ? 0.18 : 0);
          const k = (j * 128 + i) * 4;
          d[k] = col.r * 255 * n;
          d[k + 1] = col.g * 255 * n;
          d[k + 2] = col.b * 255 * n;
          d[k + 3] = 255;
        }
      x.putImageData(img, 0, 0);
      // Fenster
      x.fillStyle = '#f2ece0';
      x.fillRect(40, 26, 48, 62);
      const g = x.createLinearGradient(0, 30, 0, 84);
      g.addColorStop(0, '#2c3e50');
      g.addColorStop(1, '#5a7a8a');
      x.fillStyle = g;
      x.fillRect(44, 30, 40, 54);
      x.fillStyle = '#f2ece0';
      x.fillRect(62, 30, 4, 54);
      x.fillRect(44, 54, 40, 3);
      // Läden
      x.fillStyle = shutter;
      x.fillRect(22, 26, 17, 62);
      x.fillRect(89, 26, 17, 62);
      x.fillStyle = 'rgba(0,0,0,.25)';
      for (let i = 0; i < 9; i++) {
        x.fillRect(23, 30 + i * 6.6, 15, 1.5);
        x.fillRect(90, 30 + i * 6.6, 15, 1.5);
      }
      x.fillStyle = 'rgba(255,255,255,.7)';
      x.fillRect(36, 88, 56, 4);
      return tex(c);
    }),
  door: (color: string) =>
    once('door' + color, () => {
      const [c, x] = canvas(64, 128);
      x.fillStyle = '#f2ece0';
      x.fillRect(0, 0, 64, 128);
      x.fillStyle = color;
      x.fillRect(5, 6, 54, 122);
      x.strokeStyle = 'rgba(0,0,0,.3)';
      x.lineWidth = 2;
      x.strokeRect(11, 14, 18, 46);
      x.strokeRect(35, 14, 18, 46);
      x.strokeRect(11, 70, 18, 50);
      x.strokeRect(35, 70, 18, 50);
      x.fillStyle = '#d4af37';
      x.beginPath();
      x.arc(50, 68, 3, 0, 7);
      x.fill();
      return tex(c, false);
    }),
  /** Schild mit Text */
  sign: (text: string, bg: string, fg: string) =>
    once('sign' + text, () => {
      const [c, x] = canvas(512, 96);
      x.fillStyle = bg;
      x.fillRect(0, 0, 512, 96);
      x.strokeStyle = fg;
      x.lineWidth = 5;
      x.strokeRect(8, 8, 496, 80);
      x.fillStyle = fg;
      x.font = 'bold 50px Georgia, serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(text, 256, 50, 470);
      return tex(c, false);
    }),
  /** Palmwedel (Alpha) */
  frond: () =>
    once('frond', () => {
      const [c, x] = canvas(128, 512);
      x.clearRect(0, 0, 128, 512);
      // Mittelrippe
      x.strokeStyle = '#6a7a32';
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(64, 0);
      x.lineTo(64, 512);
      x.stroke();
      // schmale Fiederblättchen mit Lücken
      for (let i = 6; i < 505; i += 7) {
        const t = i / 512,
          len = 58 * Math.sin(Math.min(1, t * 1.15) * Math.PI) + 4;
        for (const side of [-1, 1]) {
          const g = x.createLinearGradient(64, i, 64 + side * len, i + 22);
          const l = 34 + ((i * 13) % 14);
          g.addColorStop(0, `hsl(88,48%,${l - 6}%)`);
          g.addColorStop(1, `hsl(80,52%,${l + 8}%)`);
          x.fillStyle = g;
          x.beginPath();
          x.moveTo(64, i);
          x.quadraticCurveTo(64 + side * len * 0.55, i + 3, 64 + side * len, i + 20);
          x.quadraticCurveTo(64 + side * len * 0.5, i + 8, 64, i + 4.5);
          x.closePath();
          x.fill();
        }
      }
      const t = tex(c, false);
      t.anisotropy = 8;
      return t;
    }),
  /** Blätterbüschel (Alpha) für Dschungelbäume und Büsche */
  leaves: (hue = 110) =>
    once('leaves' + hue, () => {
      const [c, x] = canvas(128);
      const r = rng(hue);
      for (let i = 0; i < 160; i++) {
        const l = 22 + r() * 26;
        x.fillStyle = `hsl(${hue + (r() - 0.5) * 24},${45 + r() * 25}%,${l}%)`;
        x.save();
        x.translate(8 + r() * 112, 8 + r() * 112);
        x.rotate(r() * 7);
        x.beginPath();
        x.ellipse(0, 0, 9 + r() * 5, 4 + r() * 2, 0, 0, 7);
        x.fill();
        x.restore();
      }
      return tex(c);
    }),
  /** Grasbüschel (Alpha) */
  tuft: () =>
    once('tuft', () => {
      const [c, x] = canvas(64);
      const r = rng(21);
      for (let i = 0; i < 26; i++) {
        const bx = 8 + r() * 48,
          g = 100 + r() * 80;
        x.strokeStyle = `rgb(${g * 0.5},${g},${g * 0.3})`;
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(bx, 64);
        x.quadraticCurveTo(bx + (r() - 0.5) * 10, 34, bx + (r() - 0.5) * 22, 6 + r() * 20);
        x.stroke();
      }
      if (r() < 2) {
        x.fillStyle = '#ffd84a';
        x.beginPath();
        x.arc(40, 20, 3, 0, 7);
        x.fill();
      }
      return tex(c, false);
    }),
  /** Rinde für Palmenstämme (Ringe) */
  bark: () =>
    once('bark', () => {
      const [c, x] = canvas(64, 128);
      for (let j = 0; j < 128; j++) {
        const ring = (j % 16) / 16,
          l = 0.55 + 0.35 * Math.sin(ring * Math.PI) + (Math.random() - 0.5) * 0.08;
        x.fillStyle = `rgb(${130 * l},${100 * l},${70 * l})`;
        x.fillRect(0, j, 64, 1);
      }
      return tex(c);
    }),
  /** Normalenkarte für Wasser (kachelbar) */
  waterNormal: () =>
    once('wn', () => {
      const s = 256,
        [c, x] = canvas(s);
      const img = x.createImageData(s, s),
        d = img.data;
      const hgt = (i: number, j: number) => tfbm(i, j, s, 6, 5, 77);
      for (let j = 0; j < s; j++)
        for (let i = 0; i < s; i++) {
          const dx = (hgt(i + 1, j) - hgt(i - 1, j)) * 6,
            dy = (hgt(i, j + 1) - hgt(i, j - 1)) * 6;
          const l = Math.hypot(dx, dy, 1),
            k = (j * s + i) * 4;
          d[k] = (-dx / l) * 127 + 128;
          d[k + 1] = (-dy / l) * 127 + 128;
          d[k + 2] = (1 / l) * 127 + 128;
          d[k + 3] = 255;
        }
      x.putImageData(img, 0, 0);
      return tex(c, true, false);
    }),
  /** Weiches Leuchten (Sprites, Funkeln) */
  glow: () =>
    once('glow', () => {
      const [c, x] = canvas(64);
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,240,200,.6)');
      g.addColorStop(1, 'rgba(255,220,150,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      return tex(c, false);
    }),
  /** Inschrift-Glyphen */
  glyph: () =>
    once('glyph', () => {
      const [c, x] = canvas(128);
      x.fillStyle = '#6a6458';
      x.fillRect(0, 0, 128, 128);
      x.strokeStyle = '#d8c690';
      x.lineWidth = 3;
      const r = rng(31);
      for (let row = 0; row < 4; row++)
        for (let i = 0; i < 4; i++) {
          const cx = 18 + i * 30,
            cy = 18 + row * 30;
          x.beginPath();
          for (let k = 0; k < 3; k++) {
            x.moveTo(cx + (r() - 0.5) * 18, cy + (r() - 0.5) * 18);
            x.lineTo(cx + (r() - 0.5) * 18, cy + (r() - 0.5) * 18);
          }
          x.stroke();
        }
      return tex(c, false);
    }),
};
