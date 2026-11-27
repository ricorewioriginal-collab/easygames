/* Bäume und Palmen mit echten Foto-Texturen statt Kugeln und grüner Flächen:
   Rinde (ambientCG Bark003/Bark014), Palmwedel aus Foto-Fiederblättchen (ambientCG Foliage005) und Laubkronen aus
   Foto-Blättern (ambientCG LeafSet024), beides als Alpha-Karten (tools: scratch foliage.py). Die Krone ist ein Bündel
   Karten mit nach außen zeigenden Normalen, damit sie wie ein Volumen beleuchtet wird. Alles bleibt instanziert. */
import { Mesh, VertexData, PBRMaterial, Color3, type Scene, CreateCylinder } from '../engine/bjs';
import { worldTex } from '../engine/surfaces';

function bark(sc: Scene, kind: 'palm' | 'tree', v: number) {
  const m = new PBRMaterial(kind + 'Bark', sc);
  const c = worldTex(sc, kind + '_bark_col.jpg').clone(), n = worldTex(sc, kind + '_bark_nor.jpg').clone();
  for (const t of [c, n]) { t.uScale = 1; t.vScale = v; }
  m.albedoTexture = c; m.bumpTexture = n; m.invertNormalMapY = true; m.roughness = .95; m.metallic = 0;
  return m;
}
function leafMat(sc: Scene, file: string, name: string, tint = new Color3(1, 1, 1)) {
  const m = new PBRMaterial(name, sc);
  const t = worldTex(sc, file); t.hasAlpha = true;
  m.albedoTexture = t; m.useAlphaFromAlbedoTexture = true; m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHATEST; m.alphaCutOff = .45;
  m.backFaceCulling = false; m.twoSidedLighting = true; m.roughness = .8; m.metallic = 0; m.albedoColor = tint;
  return m;
}

/** Palmen-Stamm (gebogen, 6 m) und ein Wedel; Wedel starten an der Krone (0,9 | 5,9 | 0) */
export function palmParts(sc: Scene) {
  const trunk = CreateCylinder('palmTrunk', { diameterTop: .32, diameterBottom: .56, height: 6, tessellation: 10, subdivisions: 8 }, sc);
  const tp = trunk.getVerticesData('position')!;
  for (let i = 0; i < tp.length; i += 3) { const y = tp[i + 1] + 3; tp[i + 1] = y; tp[i] += (y / 6) ** 2 * .9; }
  trunk.setVerticesData('position', tp); trunk.createNormals(false);
  trunk.material = bark(sc, 'palm', 4);
  // Wedel: Mittelrippe hoch, Seiten hängen, Spitze biegt nach unten
  const pos: number[] = [], idx: number[] = [], uv: number[] = [];
  const cols = 3, rows = 9, L = 3.8;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const t = r / (rows - 1), d = t * L, xx = (c / (cols - 1) - .5) * 1.7 * (1 - t * .35);
    pos.push(xx, -d * d * .11 + d * .32 - Math.abs(xx) * .42, d); uv.push(c / (cols - 1), t);
    if (r < rows - 1 && c < cols - 1) { const k = r * cols + c; idx.push(k, k + cols, k + 1, k + 1, k + cols, k + cols + 1); }
  }
  const frond = new Mesh('frond', sc), vd = new VertexData(), nor: number[] = [];
  VertexData.ComputeNormals(pos, idx, nor);
  vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.uvs = uv; vd.applyToMesh(frond);
  frond.material = leafMat(sc, 'palm_frond.png', 'palmLeaf');
  return { trunk, frond };
}

/** Laubbaum: Stamm mit zwei Ästen (1,6 m) und Kronen in vier Tönen (die letzte blüht rosa) */
export function treeParts(sc: Scene) {
  const trunk = CreateCylinder('treeTrunk', { diameterTop: .26, diameterBottom: .44, height: 2.2, tessellation: 8, subdivisions: 2 }, sc);
  const tp = trunk.getVerticesData('position')!;
  for (let i = 0; i < tp.length; i += 3) tp[i + 1] -= .3;   // Mitte wie bisher bei 0,8 (Unterkante im Boden)
  trunk.setVerticesData('position', tp);
  trunk.material = bark(sc, 'tree', 1.5);
  // Krone: 22 Karten um die Mitte, Normalen zeigen nach außen
  const pos: number[] = [], idx: number[] = [], uv: number[] = [], nor: number[] = [];
  let s = 3; const rn = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let q = 0; q < 22; q++) {
    const a = rn() * Math.PI * 2, e = (rn() - .35) * 1.2, rr = .25 + rn() * .55, cx = Math.cos(a) * rr, cz = Math.sin(a) * rr, cy = (rn() - .4) * .9;
    const yaw = rn() * Math.PI, tilt = (rn() - .5) * 1.1, hs = .62 + rn() * .3;
    const ux = Math.cos(yaw), uz = Math.sin(yaw), vy = Math.cos(tilt), vx = -Math.sin(tilt) * uz, vz = Math.sin(tilt) * ux;
    const b = pos.length / 3;
    for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const px = cx + ux * i * hs + vx * j * hs, py = cy + vy * j * hs + e * .1, pz = cz + uz * i * hs + vz * j * hs;
      pos.push(px, py, pz); uv.push((i + 1) / 2, (j + 1) / 2);
      const l = Math.hypot(px, py + .3, pz) || 1; nor.push(px / l, (py + .3) / l, pz / l);
    }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const crown = new Mesh('crown', sc), vd = new VertexData();
  vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.uvs = uv; vd.applyToMesh(crown);
  const tints = [new Color3(.85, 1, .75), new Color3(.72, .95, .68), new Color3(1, 1.02, .7), new Color3(1.7, .72, 1.05)];
  const tops = tints.map((t, i) => { const m = i ? crown.clone('crown' + i) : crown; m.material = leafMat(sc, 'leaves.png', 'leaf' + i, t); return m; });
  return { trunk, tops };
}
