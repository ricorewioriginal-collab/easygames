/* Outfits für Rocketbox-Figuren: Die Figuren tragen ihre Kleidung als Textur. Für „Oberkörperfrei“, „Unterwäsche“,
   „Badehose/Bikini“ und „Harness“ malen wir die Kleidung je nach Knochen (Rumpf, Arme, Beine, Becken) auf der Textur
   in Hautfarbe bzw. Wäschefarbe um. Das klappt für jede Figur, egal wie ihre Textur angeordnet ist.
   Keine anatomischen Details: Unterwäsche und Bikini bleiben immer an. */
import { RawTexture, Texture, type Mesh, type PBRMaterial, type Scene, type AbstractMesh } from '../engine/bjs';
import type { Outfit } from './Actor';

type Part = 'chest' | 'belly' | 'arm' | 'hip' | 'leg' | 'foot' | 'other';
const partOf = (bone: string): Part => {
  const b = bone.replace(/^Bip0\d ?/, '');
  if (/Spine2|Clavicle|Neck/.test(b)) return 'chest';
  if (/Spine/.test(b)) return 'belly';
  if (/UpperArm|Forearm/.test(b)) return 'arm';
  if (/Pelvis/.test(b) || b === '') return 'hip';
  if (/Thigh|Calf/.test(b)) return 'leg';
  if (/Foot|Toe/.test(b)) return 'foot';
  return 'other';
};
/** Farbe je Körperteil: 'skin' = Hautfarbe, Zahl = Wäschefarbe, null = Kleidung bleibt */
function paint(o: Outfit, top: boolean): Partial<Record<Part, 'skin' | number>> | null {
  const bra = top ? { chest: 0x1a1a24 as number } : {};
  switch (o) {
    case 'shirtless': return { chest: 'skin', belly: 'skin', arm: 'skin', ...(top ? { chest: 0x1a1a24 } : {}) };
    case 'harness': return { chest: 'skin', belly: 'skin', arm: 'skin', ...bra };
    case 'underwear': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: top ? 0xff4fa3 : 0x1a1a24, leg: 'skin', foot: 'skin', ...(top ? { chest: 0xff4fa3 } : {}) };
    case 'swim': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: 0x2a8fff, leg: 'skin', foot: 'skin', ...(top ? { chest: 0x2a8fff } : {}) };
    default: return null;
  }
}

const cache = new Map<string, Promise<Texture | null>>();

/** Outfit auf die Figur anwenden (async; ändert nur das Material dieser Figur) */
export async function applyOutfit(scene: Scene, root: AbstractMesh | { getChildMeshes(): AbstractMesh[] }, id: string, o: Outfit | undefined, top: boolean) {
  const meshes = root.getChildMeshes().filter((m) => (m as Mesh).skeleton && m.material) as Mesh[];
  for (const m of meshes) {
    const mm = m.material as PBRMaterial & { _orig?: PBRMaterial };
    const orig = mm._orig || mm;
    // nur das Körper-Material (Kopf und Haare bleiben)
    if (!/_body$/.test(orig.name)) continue;
    const p = o ? paint(o, top) : null;
    if (!p) { if (mm._orig) { m.material = orig; mm.dispose(); } continue; }
    const key = id + '|' + o + '|' + top;
    let job = cache.get(key);
    if (!job) { job = build(scene, m, orig, p); cache.set(key, job); }
    const tex = await job; if (!tex) continue;
    const nm = orig.clone(orig.name + '_' + o) as PBRMaterial & { _orig?: PBRMaterial };
    nm._orig = orig; nm.albedoTexture = tex;
    if (mm._orig) mm.dispose();
    m.material = nm;
  }
}

async function build(scene: Scene, m: Mesh, mat: PBRMaterial, p: Partial<Record<Part, 'skin' | number>>): Promise<Texture | null> {
  const src = mat.albedoTexture as Texture | null; if (!src) return null;
  const { width: w, height: h } = src.getSize();
  const px = await src.readPixels(); if (!px) return null;
  const data = new Uint8Array(px.buffer.slice(0));
  const uv = m.getVerticesData('uv'), idx = m.getIndices(), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights');
  const sk = m.skeleton; if (!uv || !idx || !mi || !mw || !sk) return null;
  // Knochen-Index in den Vertex-Daten = bone.getIndex() (nicht unbedingt die Reihenfolge in skeleton.bones)
  const names: string[] = []; sk.bones.forEach((b) => { names[b.getIndex()] = b.name; });
  const vBone = (v: number) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; } return names[best] || ''; };
  const vPart = (v: number): Part => partOf(vBone(v));
  const hipW = (v: number) => { let w2 = 0; for (let k = 0; k < 4; k++) if (partOf(names[mi[v * 4 + k]] || '') === 'hip') w2 += mw[v * 4 + k]; return w2; };
  const orig = new Uint8Array(data);
  // Hautfarbe: Mittelwert der Texel an Händen (die sind bei allen Figuren nackt)
  let sr = 0, sg = 0, sb = 0, sn = 0;
  const tri: Array<[number, number, number, Part]> = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    const pa = vPart(a), pb = vPart(b), pc = vPart(c);
    let part: Part = pa === pb || pa === pc ? pa : pb === pc ? pb : pa;
    // Slip/Bikinihose etwas großzügiger: alles, was spürbar am Becken hängt
    if (p.hip && (part === 'leg' || part === 'belly') && (hipW(a) + hipW(b) + hipW(c)) / 3 > .22) part = 'hip';
    tri.push([a, b, c, part]);
    if (part === 'other') {
      const bn = vBone(a);
      if (/Hand|Finger/.test(bn)) { const x = Math.min(w - 1, Math.max(0, Math.round(uv[a * 2] * w))), y = Math.min(h - 1, Math.max(0, Math.round(uv[a * 2 + 1] * h))); const o = (y * w + x) * 4; sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; sn++; }
    }
  }
  const skin = sn ? [sr / sn, sg / sn, sb / sn] : [200, 160, 130];
  for (const [a, b, c, part] of tri) {
    const want = p[part]; if (!want) continue;
    const col = want === 'skin' ? skin : [(want >> 16) & 255, (want >> 8) & 255, want & 255];
    fill(data, orig, w, h, [uv[a * 2] * w, uv[a * 2 + 1] * h], [uv[b * 2] * w, uv[b * 2 + 1] * h], [uv[c * 2] * w, uv[c * 2 + 1] * h], col, want === 'skin');
  }
  const t = RawTexture.CreateRGBATexture(data, w, h, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  t.wrapU = src.wrapU; t.wrapV = src.wrapV;
  (t as Texture & { _invertY?: boolean })._invertY = (src as Texture & { _invertY?: boolean })._invertY;
  t.uScale = src.uScale; t.vScale = src.vScale; t.uOffset = src.uOffset; t.vOffset = src.vOffset;
  t.coordinatesIndex = src.coordinatesIndex;
  return t;
}

/** Dreieck in der Textur füllen (mit 1,5 px Rand gegen Nähte); Haut behält etwas Schattierung der Kleidung */
function fill(d: Uint8Array, src: Uint8Array, w: number, h: number, A: number[], B: number[], C: number[], col: number[], shade: boolean) {
  const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]) - 2)), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0]) + 2));
  const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]) - 2)), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1]) + 2));
  const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) return;
  const e = 1.5;
  const edge = (P: number[], Q: number[], x: number, y: number) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1; return ((x - P[0]) * dy - (y - P[1]) * dx) / l * Math.sign(area); };
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const cx = x + .5, cy = y + .5;
    if (edge(A, B, cx, cy) > e || edge(B, C, cx, cy) > e || edge(C, A, cx, cy) > e) continue;
    const o = (y * w + x) * 4;
    const lum = shade ? .85 + .25 * ((src[o] + src[o + 1] + src[o + 2]) / 765) : 1;
    d[o] = Math.min(255, col[0] * lum); d[o + 1] = Math.min(255, col[1] * lum); d[o + 2] = Math.min(255, col[2] * lum);
  }
}
