// Erzeugt die PWA-Icons prozedural (kein Bildmaterial von außen nötig).
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hsl = (h, s, l) => {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
};

// Gleichseitiges Prisma (Dreieck) mit Lichtstrahl, auf dunklem Grund.
function icon(scale) {
  return (u, v) => {
    const x = (u - 0.5) / scale;
    const y = (v - 0.5) / scale;
    let col = [0.03, 0.01, 0.07];
    const r = Math.hypot(x, y);
    const glow = Math.exp(-r * 4) * 0.35;
    col = col.map((c, i) => c + glow * [0.6, 0.2, 1][i]);
    const top = -0.3;
    const bottom = 0.22;
    const inside = y > top && y < bottom && Math.abs(x) < ((y - top) / (bottom - top)) * 0.3;
    const edge =
      y > top - 0.02 &&
      y < bottom + 0.02 &&
      Math.abs(Math.abs(x) - ((y - top) / (bottom - top)) * 0.3) < 0.02;
    if (inside) {
      const h = (0.8 + (x + 0.3) * 0.9) % 1;
      const c = hsl(h, 1, 0.55);
      col = c.map((v2) => v2 * 0.75 + 0.1);
    }
    if (edge || (Math.abs(y - bottom) < 0.02 && Math.abs(x) < 0.32)) col = [1, 1, 1];
    // Regenbogenstrahl nach rechts unten.
    if (x > 0.12 && y > -0.05 && y < 0.35) {
      const band = (y + 0.05) / 0.4 - (x - 0.12) * 0.5;
      if (band > 0 && band < 0.5 && x < 0.5) col = hsl(band * 1.6, 1, 0.6);
    }
    return [...col.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255)), 255];
  };
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, icon(1)));
writeFileSync('public/icons/icon-512.png', png(512, icon(1)));
writeFileSync('public/icons/maskable-512.png', png(512, icon(0.72)));
writeFileSync('public/icons/apple-touch-icon.png', png(180, icon(0.85)));
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#ff3df2"/><stop offset=".5" stop-color="#8a3dff"/><stop offset="1" stop-color="#3df2ff"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#07020f"/><path d="M32 10 54 50H10Z" fill="url(#g)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>\n`,
);
process.stdout.write('Icons erzeugt.\n');
