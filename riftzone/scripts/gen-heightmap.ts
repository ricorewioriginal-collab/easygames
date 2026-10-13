// Berechnet die Höhenkarte der Insel einmal vor (spart dem Browser ~2 s) → client/public/heightmap.bin
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Terrain, encodeHeights } from '../shared/src/terrain';

const out = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../client/public/heightmap.bin');
const t0 = Date.now();
const t = new Terrain();
const u16 = encodeHeights(t.h);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(u16.buffer));
console.log(`Höhenkarte ${t.n}×${t.n} geschrieben: ${out} (${(u16.byteLength / 1024).toFixed(0)} KB, ${Date.now() - t0} ms)`);
