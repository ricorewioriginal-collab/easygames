// Vorgerendertes Kartenbild der Insel (für Minikarte und große Karte).
import { MAP_SIZE } from '../../../shared/src/constants';
import { POIS, ROADS } from '../../../shared/src/mapdef';
import type { ColorMap } from '../render/terrain';
import type { Terrain } from '../../../shared/src/terrain';
import type { World } from '../../../shared/src/world';
import { Kind } from '../../../shared/src/pieces';

export function renderMapImage(colors: ColorMap, terrain: Terrain, world: World | null, size = 1024): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  const tmp: [number, number, number] = [0, 0, 0];
  const nrm = { x: 0, y: 1, z: 0 };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const wx = (x / size) * MAP_SIZE,
        wz = (y / size) * MAP_SIZE;
      colors.sample(wx, wz, tmp);
      terrain.normal(wx, wz, nrm);
      // Schummerung (Licht von Nordwest)
      const shade = 0.82 + (-nrm.x * 0.5 - nrm.z * 0.5) * 0.9 + nrm.y * 0.2;
      const o = (y * size + x) * 4;
      const h = terrain.height(wx, wz);
      const water = h < 3;
      img.data[o] = Math.min(255, tmp[0] * 255 * (water ? 1 : shade));
      img.data[o + 1] = Math.min(255, tmp[1] * 255 * (water ? 1 : shade));
      img.data[o + 2] = Math.min(255, tmp[2] * 255 * (water ? 1 : shade));
      if (water) {
        const d = Math.min(1, (3 - h) / 10);
        img.data[o] = 30 + (1 - d) * 40;
        img.data[o + 1] = 120 + (1 - d) * 60;
        img.data[o + 2] = 170 + (1 - d) * 40;
      }
      img.data[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const k = size / MAP_SIZE;
  // Straßen
  g.strokeStyle = 'rgba(70,66,80,0.75)';
  g.lineWidth = Math.max(1.5, 5 * k);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const r of ROADS) {
    g.beginPath();
    r.forEach(([x, z], i) => (i ? g.lineTo(x * k, z * k) : g.moveTo(x * k, z * k)));
    g.stroke();
  }
  // Gebäude als Grundrisse
  if (world) {
    g.fillStyle = 'rgba(60,55,70,0.8)';
    for (const p of world.pieces) {
      if (!p.alive || p.kind !== Kind.Block || p.destructible) continue;
      if (p.hx < 2 || p.hz < 2) continue;
      g.fillRect((p.x - p.hx) * k, (p.z - p.hz) * k, Math.max(1, p.hx * 2 * k), Math.max(1, p.hz * 2 * k));
    }
  }
  // Raster A–H / 1–8
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    g.beginPath();
    g.moveTo((i * size) / 8, 0);
    g.lineTo((i * size) / 8, size);
    g.moveTo(0, (i * size) / 8);
    g.lineTo(size, (i * size) / 8);
    g.stroke();
  }
  return c;
}

/** Ortsnamen auf eine Karte schreiben. */
export function drawPoiLabels(g: CanvasRenderingContext2D, scale: number, ox = 0, oy = 0, font = 13): void {
  g.font = `800 ${font}px system-ui, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const p of POIS) {
    const x = ox + p.x * scale,
      y = oy + p.z * scale;
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(0,0,0,0.65)';
    g.strokeText(p.name.toUpperCase(), x, y);
    g.fillStyle = '#fff';
    g.fillText(p.name.toUpperCase(), x, y);
  }
}
