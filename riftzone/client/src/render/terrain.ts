// Geländedarstellung: 128-m-Abschnitte mit vier Detailstufen (LOD), Rändern gegen Lücken, Biom-Farben und Wasser.
import * as THREE from 'three';
import { HEIGHT_RES, MAP_SIZE, WATER_LEVEL } from '../../../shared/src/constants';
import { fbm } from '../../../shared/src/math';
import { Biome, type Terrain } from '../../../shared/src/terrain';

export const CHUNK = 128;
const NCH = MAP_SIZE / CHUNK;
const LODS = [2, 4, 8, 16];
const CMAP_RES = 4;

const BIOME_COLORS: Record<number, [number, number, number]> = {
  [Biome.Meadow]: [0.43, 0.74, 0.29],
  [Biome.Forest]: [0.27, 0.55, 0.24],
  [Biome.Beach]: [0.94, 0.85, 0.62],
  [Biome.Rock]: [0.55, 0.56, 0.6],
  [Biome.Snow]: [0.93, 0.96, 1.0],
  [Biome.Desert]: [0.87, 0.64, 0.4],
  [Biome.Crater]: [0.33, 0.25, 0.5],
  [Biome.Road]: [0.38, 0.37, 0.42],
  [Biome.Seabed]: [0.25, 0.47, 0.5],
  [Biome.Farm]: [0.64, 0.78, 0.33],
  [Biome.Town]: [0.62, 0.6, 0.58],
};

/** Farbkarte der Insel (auch für Minikarte). */
export class ColorMap {
  readonly n: number;
  readonly rgb: Uint8Array;
  constructor(t: Terrain) {
    this.n = MAP_SIZE / CMAP_RES + 1;
    this.rgb = new Uint8Array(this.n * this.n * 3);
    const nrm = { x: 0, y: 1, z: 0 };
    for (let j = 0; j < this.n; j++) {
      for (let i = 0; i < this.n; i++) {
        const x = i * CMAP_RES,
          z = j * CMAP_RES;
        const h = t.height(x, z);
        t.normal(x, z, nrm);
        const slope = Math.sqrt(Math.max(0, 1 - nrm.y * nrm.y));
        const b = t.biome(x, z, h, slope);
        const c = BIOME_COLORS[b]!;
        let v = 1 + fbm(x / 23, z / 23, 11, 2) * 0.09 + fbm(x / 6, z / 6, 12, 1) * 0.04;
        let r = c[0],
          g = c[1],
          bl = c[2];
        if (b === Biome.Farm) {
          // Ackerstreifen
          const s = Math.sin((x + z * 0.3) / 3.2) > 0.2 ? 0.88 : 1.05;
          v *= s;
          if (Math.sin(x / 40 + z / 55) > 0.4) {
            r = 0.86;
            g = 0.74;
            bl = 0.3;
          }
        }
        if (b === Biome.Town) {
          // Pflasterplatten und Fugen
          const gx = ((x % 8) + 8) % 8,
            gz = ((z % 8) + 8) % 8;
          if (gx < 0.6 || gz < 0.6) v *= 0.82;
          else v *= ((Math.floor(x / 8) + Math.floor(z / 8)) & 1) === 0 ? 1.04 : 0.96;
        }
        if (b === Biome.Road) v *= Math.abs((x + z) % 12) < 1 ? 1.25 : 1;
        if (b === Biome.Meadow || b === Biome.Forest) {
          // dunklere Hänge, hellere Gipfel
          v *= 1 - slope * 0.35 + Math.min(0.12, h / 400);
        }
        if (b === Biome.Seabed) {
          const d = Math.min(1, (WATER_LEVEL - h) / 12);
          r *= 1 - d * 0.5;
          g *= 1 - d * 0.35;
          bl *= 1 - d * 0.2;
        }
        const o = (j * this.n + i) * 3;
        this.rgb[o] = Math.min(255, r * v * 255);
        this.rgb[o + 1] = Math.min(255, g * v * 255);
        this.rgb[o + 2] = Math.min(255, bl * v * 255);
      }
    }
  }
  sample(x: number, z: number, out: [number, number, number]): void {
    const fx = Math.max(0, Math.min(this.n - 1.001, x / CMAP_RES)),
      fz = Math.max(0, Math.min(this.n - 1.001, z / CMAP_RES));
    const i = Math.floor(fx),
      j = Math.floor(fz),
      u = fx - i,
      v = fz - j;
    for (let c = 0; c < 3; c++) {
      const a = this.rgb[(j * this.n + i) * 3 + c]!,
        b = this.rgb[(j * this.n + i + 1) * 3 + c]!,
        d = this.rgb[((j + 1) * this.n + i) * 3 + c]!,
        e = this.rgb[((j + 1) * this.n + i + 1) * 3 + c]!;
      out[c] = ((a * (1 - u) + b * u) * (1 - v) + (d * (1 - u) + e * u) * v) / 255;
    }
  }
}

function noiseTexture(): THREE.Texture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const img = g.createImageData(s, s);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const v = 200 + fbm(x / 9, y / 9, 3, 3) * 40 + (Math.random() - 0.5) * 22;
      const o = (y * s + x) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = Math.max(0, Math.min(255, v + 30));
      img.data[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

interface ChunkState {
  cx: number;
  cz: number;
  mesh: THREE.Mesh | null;
  lod: number;
  geos: (THREE.BufferGeometry | null)[];
  lastUsed: number;
}

export class TerrainView {
  readonly group = new THREE.Group();
  readonly material: THREE.MeshLambertMaterial;
  readonly water: THREE.Mesh;
  private chunks: ChunkState[] = [];
  private readonly terrain: Terrain;
  readonly colors: ColorMap;
  private frame = 0;
  lodBias = 1;
  viewDistance = 600;
  private readonly waterNormal: THREE.Texture;

  constructor(terrain: Terrain, colors: ColorMap) {
    this.terrain = terrain;
    this.colors = colors;
    this.material = new THREE.MeshLambertMaterial({ vertexColors: true, map: noiseTexture() });
    for (let cz = 0; cz < NCH; cz++) for (let cx = 0; cx < NCH; cx++) this.chunks.push({ cx, cz, mesh: null, lod: -1, geos: [null, null, null, null], lastUsed: 0 });
    // Wasser
    this.waterNormal = waterNormalTexture();
    const wm = new THREE.MeshPhongMaterial({
      color: 0x1aa6c9,
      transparent: true,
      opacity: 0.86,
      shininess: 90,
      specular: 0x9fe7ff,
      normalMap: this.waterNormal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      depthWrite: false,
    });
    const wg = new THREE.PlaneGeometry(MAP_SIZE * 3, MAP_SIZE * 3, 1, 1);
    wg.rotateX(-Math.PI / 2);
    const uv = wg.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 180, uv.getY(i) * 180);
    this.water = new THREE.Mesh(wg, wm);
    this.water.position.set(MAP_SIZE / 2, WATER_LEVEL - 0.05, MAP_SIZE / 2);
    this.water.renderOrder = 2;
    this.group.add(this.water);
    // Meeresboden in der Ferne
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE * 6, MAP_SIZE * 6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x14506a }));
    sb.position.set(MAP_SIZE / 2, -11, MAP_SIZE / 2);
    this.group.add(sb);
  }

  private build(ch: ChunkState, lod: number): THREE.BufferGeometry {
    const res = LODS[lod]!;
    const n = CHUNK / res + 1;
    const T = this.terrain;
    const x0 = ch.cx * CHUNK,
      z0 = ch.cz * CHUNK;
    const skirt = 4 * (n - 1);
    const vcount = n * n + skirt * 2 + 8;
    const pos = new Float32Array(vcount * 3);
    const nor = new Float32Array(vcount * 3);
    const col = new Float32Array(vcount * 3);
    const uv = new Float32Array(vcount * 2);
    const idx: number[] = [];
    const tmp: [number, number, number] = [0, 0, 0];
    const nrm = { x: 0, y: 1, z: 0 };
    let v = 0;
    const put = (x: number, y: number, z: number): number => {
      pos[v * 3] = x;
      pos[v * 3 + 1] = y;
      pos[v * 3 + 2] = z;
      T.normal(x, z, nrm);
      nor[v * 3] = nrm.x;
      nor[v * 3 + 1] = nrm.y;
      nor[v * 3 + 2] = nrm.z;
      this.colors.sample(x, z, tmp);
      col[v * 3] = tmp[0];
      col[v * 3 + 1] = tmp[1];
      col[v * 3 + 2] = tmp[2];
      uv[v * 2] = x / 9;
      uv[v * 2 + 1] = z / 9;
      return v++;
    };
    const hAt = (x: number, z: number): number => {
      // exakte Rasterhöhe, wo möglich
      if (res === HEIGHT_RES) return T.at(Math.round(x / HEIGHT_RES), Math.round(z / HEIGHT_RES));
      return T.height(x, z);
    };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) put(x0 + i * res, hAt(x0 + i * res, z0 + j * res), z0 + j * res);
    for (let j = 0; j < n - 1; j++)
      for (let i = 0; i < n - 1; i++) {
        const a = j * n + i,
          b = a + 1,
          c = a + n,
          d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    // Ränder (Schürzen) gegen Risse zwischen Detailstufen
    const edge = (list: number[]): void => {
      const low: number[] = [];
      for (const k of list) {
        const x = pos[k * 3]!,
          y = pos[k * 3 + 1]!,
          z = pos[k * 3 + 2]!;
        low.push(put(x, y - 3 - res * 0.5, z));
      }
      for (let k = 0; k < list.length - 1; k++) {
        const a = list[k]!,
          b = list[k + 1]!,
          c = low[k]!,
          d = low[k + 1]!;
        idx.push(a, b, c, b, d, c, a, c, b, b, c, d);
      }
    };
    const top: number[] = [],
      bottom: number[] = [],
      left: number[] = [],
      right: number[] = [];
    for (let i = 0; i < n; i++) {
      top.push(i);
      bottom.push((n - 1) * n + i);
      left.push(i * n);
      right.push(i * n + n - 1);
    }
    edge(top);
    edge(bottom);
    edge(left);
    edge(right);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, v * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, v * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(col.subarray(0, v * 3), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, v * 2), 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  /** Detailstufen je nach Abstand zur Kamera wählen; ferne/alte Geometrien freigeben. */
  update(cam: THREE.Vector3, dt: number): void {
    this.frame++;
    (this.waterNormal.offset as THREE.Vector2).x += dt * 0.012;
    (this.waterNormal.offset as THREE.Vector2).y += dt * 0.007;
    let builds = 0;
    const far = this.viewDistance + CHUNK;
    for (const ch of this.chunks) {
      const mx = ch.cx * CHUNK + CHUNK / 2,
        mz = ch.cz * CHUNK + CHUNK / 2;
      const d = Math.max(0, Math.hypot(mx - cam.x, mz - cam.z) - CHUNK * 0.7);
      if (d > far) {
        if (ch.mesh) ch.mesh.visible = false;
        continue;
      }
      const hd = d / this.lodBias;
      const want = hd < 110 ? 0 : hd < 260 ? 1 : hd < 520 ? 2 : 3;
      if (ch.lod !== want || !ch.mesh) {
        let g = ch.geos[want];
        if (!g) {
          if (builds >= 2 && ch.mesh) {
            ch.mesh.visible = true;
            continue; // pro Bild nur wenige Neuberechnungen
          }
          g = this.build(ch, want);
          ch.geos[want] = g;
          builds++;
        }
        if (!ch.mesh) {
          ch.mesh = new THREE.Mesh(g, this.material);
          ch.mesh.receiveShadow = true;
          ch.mesh.matrixAutoUpdate = false;
          ch.mesh.updateMatrix();
          this.group.add(ch.mesh);
        } else ch.mesh.geometry = g;
        ch.lod = want;
      }
      ch.mesh.visible = true;
      ch.lastUsed = this.frame;
      // Ungenutzte feine Stufen freigeben
      for (let l = 0; l < want; l++) {
        if (ch.geos[l] && want - l >= 2) {
          ch.geos[l]!.dispose();
          ch.geos[l] = null;
        }
      }
    }
  }

  /** Alles laden, was nötig ist (beim Start, damit kein Ruckeln entsteht). */
  warm(cam: THREE.Vector3): void {
    for (let i = 0; i < 80; i++) this.update(cam, 0);
  }

  dispose(): void {
    for (const ch of this.chunks) for (const g of ch.geos) g?.dispose();
    this.material.map?.dispose();
    this.material.dispose();
  }
}

function waterNormalTexture(): THREE.Texture {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const img = g.createImageData(s, s);
  const hgt = (x: number, y: number): number => fbm(x / 14, y / 14, 77, 3) + 0.5 * Math.sin((x + y) / 6);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const dx = hgt(x + 1, y) - hgt(x - 1, y);
      const dy = hgt(x, y + 1) - hgt(x, y - 1);
      const o = (y * s + x) * 4;
      img.data[o] = 128 + dx * 90;
      img.data[o + 1] = 128 + dy * 90;
      img.data[o + 2] = 255;
      img.data[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
