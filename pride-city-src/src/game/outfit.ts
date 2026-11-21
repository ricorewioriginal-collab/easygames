/* Outfits für Rocketbox-Figuren: Die Figuren tragen ihre Kleidung als Textur. Für „Oberkörperfrei“, „Unterwäsche“,
   „Badehose/Bikini“ und „Harness“ malen wir die Kleidung je nach Knochen (Rumpf, Arme, Beine, Becken) auf der Textur
   in Hautfarbe bzw. Wäschefarbe um. Das klappt für jede Figur, egal wie ihre Textur angeordnet ist.
   Keine anatomischen Details: Unterwäsche und Bikini bleiben immer an. */
import { RawTexture, Texture, type Mesh, type PBRMaterial, type Scene, type AbstractMesh } from '../engine/bjs';
import { pixels, remember, quietClone, breathe, sharedMat, dropMat } from './texpix';
import { fullIndices } from './lod';
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
  switch (o) {
    // Hose bleibt Jeans (der nackte Körper darunter hat sonst Sportshorts)
    case 'shirtless': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: JEANS, leg: JEANS };
    case 'harness': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: 0x15151a, leg: 0x15151a };
    case 'underwear': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: top ? 0xff4fa3 : 0x1a1a24, leg: 'skin', foot: 'skin' };
    case 'swim': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: 0x2a8fff, leg: 'skin', foot: 'skin' };
    default: return null;
  }
}
/** BH/Bikini-Oberteil bei Frauen (wird nach Körperhöhe gemalt, nicht nach Knochen: deckt so sicher die Brust) */
const braOf = (o: Outfit, top: boolean) => (!top ? null : o === 'underwear' ? 0xff4fa3 : o === 'swim' ? 0x2a8fff : o === 'shirtless' || o === 'harness' ? 0x1a1a24 : null);

/** Zwischenspeicher je Szene: Beim Verlassen einer Szene (Editor, Wohnung, Innenraum) löscht Babylon ihre Texturen.
    Ein szenenübergreifender Speicher reichte dann gelöschte Texturen weiter, und die Körper wurden unsichtbar. */
const caches = new WeakMap<Scene, Map<string, Promise<Texture | null>>>();
export function sceneCache(scene: Scene, store: WeakMap<Scene, Map<string, Promise<Texture | null>>>) {
  let c = store.get(scene);
  if (!c) { const map = new Map<string, Promise<Texture | null>>(); c = map; store.set(scene, map); scene.onDisposeObservable.addOnce(() => map.clear()); }
  return c;
}
/** Gemalte Textur noch brauchbar? (nicht gelöscht, Grafikspeicher noch da) */
export const alive = (t: Texture | null): t is Texture => !!t && !!t.getInternalTexture();

/** Outfit auf die Figur anwenden (async; ändert nur das Material dieser Figur) */
export async function applyOutfit(scene: Scene, root: AbstractMesh | { getChildMeshes(): AbstractMesh[] }, id: string, o: Outfit | undefined, top: boolean, skinFrom?: Mesh) {
  const meshes = root.getChildMeshes().filter((m) => (m as Mesh).skeleton && m.material) as Mesh[];
  for (const m of meshes) {
    const mm = m.material as PBRMaterial & { _orig?: PBRMaterial };
    const orig = mm._orig || mm;
    // nur das Körper-Material (Kopf und Haare bleiben)
    if (!/_body$/.test(orig.name)) continue;
    const p = o ? paint(o, top) : null, bra = o ? braOf(o, top) : null;
    if (!p) { if (mm._orig) { m.material = orig; dropMat(mm); } continue; }
    const key = id + '|' + o + '|' + top;
    const cache = sceneCache(scene, caches);
    let job = cache.get(key);
    const make = async () => build(scene, m, orig, p, skinFrom ? await skinOf(skinFrom) : null, bra).catch(() => null);
    if (!job) { job = make(); cache.set(key, job); }
    let tex = await job;
    if (tex && !alive(tex)) { job = make(); cache.set(key, job); tex = await job; }
    if (!alive(tex) || m.isDisposed()) continue;
    const nm = sharedMat(scene, 'o|' + key + '|' + orig.uniqueId + '|' + tex.uniqueId, () => quietClone(scene, orig, orig.name + '_' + o, (c) => { c.albedoTexture = tex; })) as PBRMaterial & { _orig?: PBRMaterial };
    nm._orig = orig;
    if (mm._orig && mm !== nm) dropMat(mm);
    m.material = nm;
    // Sicherheitsnetz: Wird das neue Material nicht fertig (Grafiktreiber, verlorene Textur), lieber angezogen als unsichtbar
    setTimeout(() => { if (m.material === nm && !m.isDisposed() && !nm.isReady(m)) { m.material = orig; dropMat(nm); } }, 6000);
  }
}

const JEANS = 0x2b3a55;
const boneNames = (m: Mesh) => { const names: string[] = []; m.skeleton?.bones.forEach((b) => { names[b.getIndex()] = b.name; }); return names; };
/** Hautfarbe einer Figur: Mittelwert der Texel an den Händen (die sind bei allen Figuren nackt) */
export async function skinOf(m: Mesh): Promise<number[] | null> {
  const mat = (m.material as PBRMaterial & { _orig?: PBRMaterial }); const src = ((mat._orig || mat).albedoTexture) as Texture | null; if (!src) return null;
  const { width: w, height: h } = src.getSize(), px = await pixels(src); if (!px) return null;
  const uv = m.getVerticesData('uv'), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights'); if (!uv || !mi || !mw) return null;
  const names = boneNames(m); let r = 0, g = 0, b = 0, n = 0;
  for (let v = 0; v < uv.length / 2; v++) {
    let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; }
    if (!/Hand|Finger/.test(names[best] || '')) continue;
    const x = Math.min(w - 1, Math.max(0, Math.round(uv[v * 2] * w))), y = Math.min(h - 1, Math.max(0, Math.round(uv[v * 2 + 1] * h))), o = (y * w + x) * 4;
    r += px[o]; g += px[o + 1]; b += px[o + 2]; n++;
  }
  return n ? [r / n, g / n, b / n] : null;
}

async function build(scene: Scene, m: Mesh, mat: PBRMaterial, p: Partial<Record<Part, 'skin' | number>>, skinRef: number[] | null = null, bra: number | null = null): Promise<Texture | null> {
  const src = mat.albedoTexture as Texture | null; if (!src) return null;
  const { width: w, height: h } = src.getSize();
  const px = await pixels(src); if (!px) return null;
  const data = new Uint8Array(px);
  const uv = m.getVerticesData('uv'), idx = fullIndices(m), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights');
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
    if ((i & 1023) === 0) await breathe();
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    const pa = vPart(a), pb = vPart(b), pc = vPart(c);
    let part: Part = pa === pb || pa === pc ? pa : pb === pc ? pb : pa;
    // Slip/Bikinihose etwas großzügiger: alles, was spürbar am Becken hängt
    if (p.hip && (part === 'leg' || part === 'belly') && (hipW(a) + hipW(b) + hipW(c)) / 3 > (skinRef ? .4 : .22)) part = 'hip';
    tri.push([a, b, c, part]);
    if (part === 'other') {
      const bn = vBone(a);
      if (/Hand|Finger/.test(bn)) { const x = Math.min(w - 1, Math.max(0, Math.round(uv[a * 2] * w))), y = Math.min(h - 1, Math.max(0, Math.round(uv[a * 2 + 1] * h))); const o = (y * w + x) * 4; sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; sn++; }
    }
  }
  const skin = skinRef || (sn ? [sr / sn, sg / sn, sb / sn] : [200, 160, 130]);
  const hands = !!skinRef;   // fremder Körper (koerper.ts): Hände in der Hautfarbe des eigenen Kopfes
  let n = 0;
  for (const [a, b, c, part] of tri) {
    if ((++n & 63) === 0) await breathe();
    // fremder Körper: Hände und Halsansatz (hängen an Kopf/Händen) in der eigenen Hautfarbe
    const want = part === 'other' && hands && /Hand|Finger|Head|Neck/.test(vBone(a)) ? 'skin' : p[part]; if (!want) continue;
    const col = want === 'skin' ? skin : [(want >> 16) & 255, (want >> 8) & 255, want & 255];
    fill(data, orig, w, h, [uv[a * 2] * w, uv[a * 2 + 1] * h], [uv[b * 2] * w, uv[b * 2 + 1] * h], [uv[c * 2] * w, uv[c * 2 + 1] * h], col, want === 'skin');
  }
  if (p.chest === 'skin') details(m, data, w, h, uv, tri, skin, bra);
  for (let o = 3; o < data.length; o += 4) data[o] = 255;   // deckend: Körper nie durchsichtig
  const t = RawTexture.CreateRGBATexture(data, w, h, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  t.hasAlpha = false;
  remember(t, data);
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

/** Brustwarzen und Bauchnabel auf nackter Haut, an der echten Körperstelle (Ruhepose, Höhe relativ zur Körpergröße).
    Vorne ist, wohin die Zehen zeigen. Gemalt wird nur auf Rumpf-Dreiecken, die vorne liegen. */
function details(m: Mesh, d: Uint8Array, w: number, h: number, uv: ArrayLike<number>, tri: Array<[number, number, number, Part]>, skin: number[], bra: number | null) {
  const chest = bra === null, braC = bra === null ? null : [(bra >> 16) & 255, (bra >> 8) & 255, bra & 255];
  const inBra = (t: number, s: number) => (t > .665 && t < .79) || (t >= .79 && t < .835 && Math.abs(Math.abs(s) - .062) < .011);
  const pos = m.getVerticesData('position'), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights'); if (!pos || !mi || !mw) return;
  const names = boneNames(m), nv = pos.length / 3;
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); }
  const ext = [0, 1, 2].map((k) => hi[k] - lo[k]), ax = [0, 1, 2].sort((a, b) => ext[b] - ext[a]), up = ax[0], side = ax[1], dep = ax[2];
  // der Körper-Mesh endet am Halsansatz (Kopf ist ein eigenes Teil): Körpergröße ≈ Mesh-Höhe / 0,82
  const H = ext[up] / .82; if (H <= 0) return;
  // Füße stehen unten, vorne ist die Richtung der Zehen
  let footY = 0, footN = 0, toe = 0, toeN = 0, heel = 0, heelN = 0, cs = 0, cn = 0;
  for (let v = 0; v < nv; v++) {
    let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; }
    const b = names[best] || '';
    if (/Toe/.test(b)) { toe += pos[v * 3 + dep]; toeN++; footY += pos[v * 3 + up]; footN++; }
    else if (/Foot/.test(b)) { heel += pos[v * 3 + dep]; heelN++; footY += pos[v * 3 + up]; footN++; }
    if (/Spine/.test(b)) { cs += pos[v * 3 + side]; cn++; }
  }
  if (!toeN || !heelN || !cn) return;
  const down = footY / footN < (lo[up] + hi[up]) / 2, base = down ? lo[up] : hi[up], dirY = down ? 1 : -1;
  const fwd = Math.sign(toe / toeN - heel / heelN) || 1, mid = cs / cn;
  const T = (v: number) => (pos[v * 3 + up] - base) * dirY / H, S = (v: number) => (pos[v * 3 + side] - mid) / H, F = (v: number) => pos[v * 3 + dep] * fwd;
  let fMax = -1e9, fMin = 1e9;
  for (const [a, , , part] of tri) if (part === 'chest' || part === 'belly') { fMax = Math.max(fMax, F(a)); fMin = Math.min(fMin, F(a)); }
  const front = fMin + (fMax - fMin) * .5;
  // Höhe, Seite, Radius (relativ zur Körpergröße), Farbe, Kern
  const areola = [skin[0] * .74, skin[1] * .56, skin[2] * .55], nip = [skin[0] * .56, skin[1] * .4, skin[2] * .4], navel = [skin[0] * .4, skin[1] * .32, skin[2] * .3];
  const spots: Array<[number, number, number, number[], number[] | null, number]> = [];
  if (chest) for (const sd of [-1, 1]) spots.push([.722, sd * .056, .0085, areola, nip, 1]);
  spots.push([.6, 0, .0045, navel, null, 1.7]);
  for (const [a, b, c, part] of tri) {
    if (part !== 'chest' && part !== 'belly') continue;
    const ta = T(a), tb = T(b), tc = T(c), sa = S(a), sb = S(b), sc = S(c);
    const braTri = !!braC && Math.max(ta, tb, tc) > .67 && Math.min(ta, tb, tc) < .84, isFront = (F(a) + F(b) + F(c)) / 3 >= front;
    if (!braTri && !isFront) continue;
    if (!braTri && !spots.some(([t, s2, r, , , e]) => Math.min(ta, tb, tc) < t + r * 2 * e && Math.max(ta, tb, tc) > t - r * 2 * e && Math.min(sa, sb, sc) < s2 + r * 2 && Math.max(sa, sb, sc) > s2 - r * 2)) continue;
    const A = [uv[a * 2] * w, uv[a * 2 + 1] * h], B = [uv[b * 2] * w, uv[b * 2 + 1] * h], C = [uv[c * 2] * w, uv[c * 2 + 1] * h];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) continue;
    const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
    const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, py = y + .5;
      const u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area, q = 1 - u - v;
      if (u < -.02 || v < -.02 || q < -.02) continue;
      const t = u * ta + v * tb + q * tc, s2 = u * sa + v * sb + q * sc, o = (y * w + x) * 4;
      if (braC && inBra(t, s2)) { const l = .8 + .3 * ((d[o] + d[o + 1] + d[o + 2]) / 765); for (let ch = 0; ch < 3; ch++) d[o + ch] = Math.min(255, braC[ch] * l); continue; }
      if (!isFront) continue;
      for (const [st, ss, r, col, core, e] of spots) {
        const dd = Math.hypot((t - st) / e, s2 - ss) / r; if (dd > 1.2) continue;
        const k = core && dd < .38 ? core : col, f = dd > .8 ? (1.2 - dd) / .4 : 1;   // weicher Rand
        for (let ch = 0; ch < 3; ch++) d[o + ch] = d[o + ch] * (1 - f) + Math.min(255, k[ch] * (.88 + .24 * (d[o + ch] / 255))) * f;
      }
    }
  }
}
