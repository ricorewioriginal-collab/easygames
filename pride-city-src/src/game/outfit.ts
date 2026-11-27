/* Outfits für Rocketbox-Figuren: Die Figuren tragen ihre Kleidung als Textur. Für „Oberkörperfrei“, „Unterwäsche“,
   „Badehose/Bikini“ und „Harness“ malen wir die Kleidung je nach Knochen (Rumpf, Arme, Beine, Becken) auf der Textur
   in Hautfarbe bzw. Wäschefarbe um. Das klappt für jede Figur, egal wie ihre Textur angeordnet ist.
   Unterwäsche und Bikini bleiben an. Einzige Ausnahme „Nackt“ (nur mit „Inhalte ab 18“, nur in Liebes- und Gruppenszenen):
   nackter Po und nackte Brust wie in Kinofilmen ab 18, Becken als glatte Haut ohne Genitalien. */
import { RawTexture, Texture, Mesh, VertexData, type PBRMaterial, type Scene, type AbstractMesh } from '../engine/bjs';
import { pixels, remember, quietClone, breathe, sharedMat, dropMat } from './texpix';
import { fullIndices } from './lod';
import type { Outfit } from './Actor';
import { washFor, type Wash } from './waesche';

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
    // nur 18+ und nur in Szenen: nackter Po und nackte Brust, ohne Genitalien (glatte Haut, siehe undress)
    case 'nude': return { chest: 'skin', belly: 'skin', arm: 'skin', hip: 'skin', leg: 'skin', foot: 'skin' };
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
export async function applyOutfit(scene: Scene, root: AbstractMesh | { getChildMeshes(): AbstractMesh[] }, id: string, o: Outfit | undefined, top: boolean, skinFrom?: Mesh, wash?: string) {
  // Unterwäsche und Badesachen auf dem nackten Sport-Körper: eigener Schnitt, Farbe und Muster (waesche.ts)
  const cloth = skinFrom && (o === 'underwear' || o === 'swim') ? washFor(top ? 'f' : 'm', o === 'swim', id.split('@')[0], wash) : null;
  const meshes = root.getChildMeshes().filter((m) => (m as Mesh).skeleton && m.material && !(m as Akt)._pcAktPart) as Mesh[];
  for (const m of meshes) {
    if (o !== 'nude') { (m as Akt)._pcAkt?.dispose(); (m as Akt)._pcAkt = undefined; }
    const mm = m.material as PBRMaterial & { _orig?: PBRMaterial };
    const orig = mm._orig || mm;
    // nur das Körper-Material (Kopf und Haare bleiben)
    if (!/_body$/.test(orig.name)) continue;
    const p = o ? paint(o, top) : null, bra = o ? braOf(o, top) : null;
    // Bikini-Schale der Sportlerin: nackt und mit eigener Wäsche flach in den Körper legen (echte Brustform darunter)
    flatShell(m, !!skinFrom && top && (o === 'nude' || !!cloth), orig.albedoTexture as Texture | null);
    if (!p) { if (mm._orig) { m.material = orig; dropMat(mm); } continue; }
    const key = id + '|' + o + '|' + top + (cloth ? '|' + cloth.id + cloth.col : '');
    const cache = sceneCache(scene, caches);
    let job = cache.get(key);
    const make = async () => build(scene, m, orig, p, skinFrom ? await skinOf(skinFrom) : null, bra, top, akt(id), cloth).catch((e) => { console.warn('outfit', e); return null; });
    if (!job) { job = make(); cache.set(key, job); }
    let tex = await job;
    if (tex && !alive(tex)) { job = make(); cache.set(key, job); tex = await job; }
    if (!alive(tex) || m.isDisposed()) continue;
    const nm = sharedMat(scene, 'o|' + key + '|' + orig.uniqueId + '|' + tex.uniqueId, () => quietClone(scene, orig, orig.name + '_' + o, (c) => { c.albedoTexture = tex; })) as PBRMaterial & { _orig?: PBRMaterial };
    nm._orig = orig;
    if (mm._orig && mm !== nm) dropMat(mm);
    m.material = nm;
    flatShell(m, !!skinFrom && top && (o === 'nude' || !!cloth), orig.albedoTexture as Texture | null);
    // Akt-Ansicht (nur 'nude' auf dem Sport-Körper eines Mannes): Penis und Hoden als schlichte, hängende Form
    if (o === 'nude' && skinFrom && !top && !(m as Akt)._pcAkt) { try { (m as Akt)._pcAkt = maleParts(scene, m, nm, akt(id)) || undefined; } catch (e) { console.warn('akt', e); } }
    else if ((m as Akt)._pcAkt) (m as Akt)._pcAkt!.material = nm;
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

async function build(scene: Scene, m: Mesh, mat: PBRMaterial, p: Partial<Record<Part, 'skin' | number>>, skinRef: number[] | null = null, bra: number | null = null, top = false, look: AktLook = akt(''), cloth: Wash | null = null): Promise<Texture | null> {
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
  // Sport-Körper (koerper.ts): Die Textur zeigt schon echte Haut (Muskeln, Brustwarzen, Nabel, Poren). Sie wird nicht
  // übermalt, sondern nur auf die Hautfarbe des eigenen Kopfes umgefärbt. Die echte Sport-Unterhose bleibt.
  const hands = !!skinRef, own = sn ? [sr / sn, sg / sn, sb / sn] : skin;
  const tint = hands ? own.map((v, i) => Math.max(.35, Math.min(2.4, skin[i] / Math.max(1, v)))) : null;
  // Sport-Körper: Nur Haut wird umgefärbt. Stoff bleibt Pixel für Pixel, wie er ist: die echte Sport-Unterhose bzw. das
  // geblümte Bikini-Set der Sportlerin (Oberteil sitzt als eigene Schale über der Brust). Vorher wurden Höschen und BH als
  // ganze Dreiecke bzw. nach Körperhöhe darübergemalt und das echte Oberteil mit umgefärbt: Zacken und dunkle Flecken.
  const fab = hands ? fabric(own) : null;
  let n = 0;
  for (const [a, b, c, part] of tri) {
    if ((++n & 63) === 0) await breathe();
    const want = hands && (part === 'other' || part === 'foot' || part === 'hip') ? 'skin' : p[part]; if (!want) continue;
    const col = want === 'skin' ? skin : [(want >> 16) & 255, (want >> 8) & 255, want & 255];
    fill(data, orig, w, h, [uv[a * 2] * w, uv[a * 2 + 1] * h], [uv[b * 2] * w, uv[b * 2 + 1] * h], [uv[c * 2] * w, uv[c * 2 + 1] * h], col, want === 'skin', want === 'skin' ? tint : null, fab);
  }
  if (hands && fab && (p.hip === 'skin' || cloth)) {
    const u = await undress(m, data, orig, w, h, uv, tri, fab, skin, top, own);
    if (u) shells.set(src, u);
    if (cloth) garment(m, data, w, h, uv, tri, cloth, u?.tips || []); else pubic(m, data, w, h, uv, tri, skin, top, look);
  }
  if (p.chest === 'skin' && !hands) details(m, data, w, h, uv, tri, skin, bra, true);
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
/** Stoff statt Haut? Haut hat etwa den Farbton der eigenen Hände (Schatten, Falten und Brustwarzen auch) und etwas
    Sättigung. Sehr dunkle, graue/weiße oder andersfarbige Stellen (Bündchen, Schrift, Blumenmuster) sind Stoff. */
const hueOf = (r: number, g: number, b: number) => { const hi = Math.max(r, g, b), d = Math.max(1e-6, hi - Math.min(r, g, b)); return (hi === r ? ((g - b) / d + 6) % 6 : hi === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; };
function fabric(own: number[]) {
  const h0 = hueOf(own[0], own[1], own[2]);
  return (r: number, g: number, b: number) => {
    if (r + g + b < 75) return true;
    const hi = Math.max(r, g, b); if ((hi - Math.min(r, g, b)) / hi < .12) return true;
    return Math.abs(((hueOf(r, g, b) - h0 + 540) % 360) - 180) > 28;
  };
}
function fill(d: Uint8Array, src: Uint8Array, w: number, h: number, A: number[], B: number[], C: number[], col: number[], shade: boolean, tint: number[] | null = null, fab: ((r: number, g: number, b: number) => boolean) | null = null) {
  const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]) - 2)), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0]) + 2));
  const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]) - 2)), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1]) + 2));
  const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) return;
  const e = 1.5;
  const edge = (P: number[], Q: number[], x: number, y: number) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1; return ((x - P[0]) * dy - (y - P[1]) * dx) / l * Math.sign(area); };
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const cx = x + .5, cy = y + .5;
    if (edge(A, B, cx, cy) > e || edge(B, C, cx, cy) > e || edge(C, A, cx, cy) > e) continue;
    const o = (y * w + x) * 4;
    if (fab && fab(src[o], src[o + 1], src[o + 2])) continue;
    if (tint) { d[o] = Math.min(255, src[o] * tint[0]); d[o + 1] = Math.min(255, src[o + 1] * tint[1]); d[o + 2] = Math.min(255, src[o + 2] * tint[2]); continue; }
    const lum = shade ? .85 + .25 * ((src[o] + src[o + 1] + src[o + 2]) / 765) : 1;
    d[o] = Math.min(255, col[0] * lum); d[o + 1] = Math.min(255, col[1] * lum); d[o + 2] = Math.min(255, col[2] * lum);
  }
}

/** Brustwarzen und Bauchnabel auf nackter Haut, an der echten Körperstelle (Ruhepose, Höhe relativ zur Körpergröße).
    Vorne ist, wohin die Zehen zeigen. Gemalt wird nur auf Rumpf-Dreiecken, die vorne liegen. */
function details(m: Mesh, d: Uint8Array, w: number, h: number, uv: ArrayLike<number>, tri: Array<[number, number, number, Part]>, skin: number[], bra: number | null, marks = true) {
  const chest = bra === null && marks, braC = bra === null ? null : [(bra >> 16) & 255, (bra >> 8) & 255, bra & 255];
  const inBra = (t: number, s: number) => (t > .665 && t < .79) || (t >= .79 && t < .835 && Math.abs(Math.abs(s) - .062) < .011);
  const fr = frame(m); if (!fr) return;
  const { T, S, F } = fr;
  let fMax = -1e9, fMin = 1e9;
  for (const [a, , , part] of tri) if (part === 'chest' || part === 'belly') { fMax = Math.max(fMax, F(a)); fMin = Math.min(fMin, F(a)); }
  const front = fMin + (fMax - fMin) * .5;
  // Höhe, Seite, Radius (relativ zur Körpergröße), Farbe, Kern
  const areola = [skin[0] * .74, skin[1] * .56, skin[2] * .55], nip = [skin[0] * .56, skin[1] * .4, skin[2] * .4], navel = [skin[0] * .4, skin[1] * .32, skin[2] * .3];
  const spots: Array<[number, number, number, number[], number[] | null, number]> = [];
  if (chest) for (const sd of [-1, 1]) spots.push([.722, sd * .056, .0085, areola, nip, 1]);
  if (marks) spots.push([.6, 0, .0045, navel, null, 1.7]);
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

/** Körper-Koordinaten je Vertex: T = Höhe, S = Seite (beide relativ zur Körpergröße), F = nach vorne (Richtung Zehen) */
function frame(m: Mesh) {
  const pos = m.getVerticesData('position'), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights'); if (!pos || !mi || !mw) return null;
  const names = boneNames(m), nv = pos.length / 3;
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); }
  const ext = [0, 1, 2].map((k) => hi[k] - lo[k]), ax = [0, 1, 2].sort((a, b) => ext[b] - ext[a]), up = ax[0], side = ax[1], dep = ax[2];
  // der Körper-Mesh endet am Halsansatz (Kopf ist ein eigenes Teil): Körpergröße ≈ Mesh-Höhe / 0,82
  const H = ext[up] / .82; if (H <= 0) return null;
  // Füße stehen unten, vorne ist die Richtung der Zehen
  let footY = 0, footN = 0, toe = 0, toeN = 0, heel = 0, heelN = 0, cs = 0, cn = 0;
  for (let v = 0; v < nv; v++) {
    let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; }
    const b = names[best] || '';
    if (/Toe/.test(b)) { toe += pos[v * 3 + dep]; toeN++; footY += pos[v * 3 + up]; footN++; }
    else if (/Foot/.test(b)) { heel += pos[v * 3 + dep]; heelN++; footY += pos[v * 3 + up]; footN++; }
    if (/Spine/.test(b)) { cs += pos[v * 3 + side]; cn++; }
  }
  if (!toeN || !heelN || !cn) return null;
  const down = footY / footN < (lo[up] + hi[up]) / 2, base = down ? lo[up] : hi[up], dirY = down ? 1 : -1;
  const fwd = Math.sign(toe / toeN - heel / heelN) || 1, mid = cs / cn;
  const T = (v: number) => (pos[v * 3 + up] - base) * dirY / H, S = (v: number) => (pos[v * 3 + side] - mid) / H, F = (v: number) => pos[v * 3 + dep] * fwd;
  return { T, S, F, H, pos, up, side, dep, base, dirY, mid, fwd };
}

/** „Nackt“ auf dem Sport-Körper: Stoff (Sport-Unterhose, Bikinihose) wird von der umliegenden Haut her zugemalt, so bleiben
    Schattierung und Hautton stimmig. Das Bikini-Oberteil der Sportlerin ist eine eigene Schale über der Brust: sie wird zu
    Haut mit Brustwarzen an der vordersten Stelle jeder Seite. Keine Genitalien, das Becken bleibt glatte Haut. */
export async function undress(m: Mesh, d: Uint8Array, src: Uint8Array, w: number, h: number, uv: ArrayLike<number>, tri: Array<[number, number, number, Part]>, fab: (r: number, g: number, b: number) => boolean, skin: number[], breasts: boolean, own: number[] = skin): Promise<{ shell: number[]; tips: Array<[number, number, number]> } | null> {
  // strenger als beim Umfärben: auch dunkle Stellen (Unterhose mit JPEG-Rauschen) sind Stoff
  const dark = (own[0] + own[1] + own[2]) * .5, bad = (r: number, g: number, b: number) => r + g + b < dark || fab(r, g, b);
  const inTri = new Uint8Array(w * h), hole = new Uint8Array(w * h);
  const shell: Array<[number, number, number]> = [];
  const raster = (a: number, b: number, c: number, fn: (o: number, u: number, v: number, q: number) => void) => {
    const A = [uv[a * 2] * w, uv[a * 2 + 1] * h], B = [uv[b * 2] * w, uv[b * 2 + 1] * h], C = [uv[c * 2] * w, uv[c * 2 + 1] * h];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) return;
    const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]) - 1)), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0]) + 1));
    const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]) - 1)), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1]) + 1));
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, py = y + .5;
      const u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area, q = 1 - u - v;
      if (u < -.03 || v < -.03 || q < -.03) continue;
      fn(y * w + x, u, v, q);
    }
  };
  let n = 0;
  const isShell = new Uint8Array(tri.length);
  // Oberteil-Schale: Brust/Bauch, mindestens zwei Ecken auf Stoff
  // Schale = Dreiecke ganz auf Stoff, nur auf Brusthöhe (der Bund der Bikinihose zählt nicht mit)
  const inIsle = (v: number) => { const x = Math.min(w - 1, Math.max(0, Math.floor(uv[v * 2] * w))), y = Math.min(h - 1, Math.max(0, Math.floor(uv[v * 2 + 1] * h))), o = (y * w + x) * 4; return fab(src[o], src[o + 1], src[o + 2]); };
  const fr0 = breasts ? frame(m) : null, tip: Array<[number, number, number]> = [];
  if (fr0) tri.forEach(([a, b, c, part], k) => { if ((part === 'chest' || part === 'belly') && Math.min(fr0.T(a), fr0.T(b), fr0.T(c)) > .62 && inIsle(a) && inIsle(b) && inIsle(c)) { shell.push([a, b, c]); isShell[k] = 1; } });
  if (fr0) for (const sd of [-1, 1]) {
    let best = -1, bf = -1e9;
    for (const t of shell) for (const v of t) if (fr0.S(v) * sd > .015 && fr0.F(v) > bf) { bf = fr0.F(v); best = v; }
    if (best >= 0) tip.push([fr0.T(best), fr0.S(best), fr0.F(best)]);
  }
  for (let k = 0; k < tri.length; k++) {
    if ((++n & 127) === 0) await breathe();
    const [a, b, c, part] = tri[k];
    if (part === 'other' || isShell[k]) continue;
    // Brust unter der Schale: Ränder und Linien des Oberteils ganz neu aus der Haut ringsum malen
    let cup = false;
    if (fr0 && tip.length && (part === 'chest' || part === 'belly')) { const ta = fr0.T(a), sa = fr0.S(a), fa = fr0.F(a); cup = tip.some(([tt, ss, ff]) => Math.hypot(ta - tt, sa - ss) < .055 && fa > ff - .07 * fr0.H); }
    raster(a, b, c, (i) => { inTri[i] = 1; const o = i * 4; if (cup || bad(src[o], src[o + 1], src[o + 2])) hole[i] = 1; });
  }
  // Stoffränder (Mischfarben aus dem JPEG) mitnehmen: Loch um 3 Pixel wachsen lassen
  const nb = (i: number, fn: (j: number) => void) => { const x = i % w, y = (i - x) / w; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if ((dx || dy) && xx >= 0 && yy >= 0 && xx < w && yy < h) fn(yy * w + xx); } };
  for (let g = 0; g < 3; g++) {
    const grow: number[] = [];
    for (let i = 0; i < hole.length; i++) if (hole[i] === 1) nb(i, (j) => { if (inTri[j] && !hole[j]) grow.push(j); });
    for (const j of grow) hole[j] = 1;
  }
  // Löcher von außen nach innen mit dem Mittel der fertigen Nachbarn füllen
  let todo: number[] = []; for (let i = 0; i < hole.length; i++) if (hole[i]) todo.push(i);
  const filled = todo.slice();
  for (let pass = 0; pass < 160 && todo.length; pass++) {
    if ((pass & 7) === 0) await breathe();
    const done: Array<[number, number, number, number]> = [], rest: number[] = [];
    for (const i of todo) {
      const x = i % w, y = (i - x) / w; let r = 0, g = 0, b = 0, k = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if ((!dx && !dy) || xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx; if (!inTri[j] || hole[j]) continue;
        r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; k++;
      }
      if (k) done.push([i, r / k, g / k, b / k]); else rest.push(i);
    }
    for (const [i, r, g, b] of done) { d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; hole[i] = 0; }
    todo = rest;
    if (!done.length) break;
  }
  for (const i of todo) { d[i * 4] = skin[0] * .92; d[i * 4 + 1] = skin[1] * .92; d[i * 4 + 2] = skin[2] * .92; }
  // weichzeichnen, damit keine Schlieren vom Zuwachsen bleiben
  for (let pass = 0; pass < 3; pass++) {
    await breathe();
    const out = new Float32Array(filled.length * 3);
    filled.forEach((i, n2) => { let r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], k = 1; nb(i, (j) => { if (inTri[j]) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; k++; } }); out[n2 * 3] = r / k; out[n2 * 3 + 1] = g / k; out[n2 * 3 + 2] = b / k; });
    filled.forEach((i, n2) => { d[i * 4] = out[n2 * 3]; d[i * 4 + 1] = out[n2 * 3 + 1]; d[i * 4 + 2] = out[n2 * 3 + 2]; });
  }
  if (!shell.length) return { shell: [], tips: [] };
  // Schale: Haut mit leichter Schattierung, Brustwarze an der vordersten Stelle jeder Seite
  const fr = frame(m); if (!fr) return null;
  const { T, S, F, H } = fr;
  const areola = [skin[0] * .74, skin[1] * .56, skin[2] * .55], nip = [skin[0] * .58, skin[1] * .42, skin[2] * .42], r0 = .0085;
  for (const [a, b, c] of shell) {
    if ((++n & 127) === 0) await breathe();
    raster(a, b, c, (i, u, v, q) => {
      const t = u * T(a) + v * T(b) + q * T(c), s2 = u * S(a) + v * S(b) + q * S(c), f = (u * F(a) + v * F(b) + q * F(c)) / H;
      let col = skin, mix = 0, near = 9;
      for (const [tt, ss, ff] of tip) near = Math.min(near, Math.hypot(t - tt, s2 - ss) / r0 + Math.max(0, (ff / H - f) * 40));
      if (near < 1.2) { col = near < .38 ? nip : areola; mix = near > .8 ? (1.2 - near) / .4 : 1; }
      const shade = .86 + .14 * Math.max(0, Math.min(1, (f - (tip[0]?.[2] ?? 0) / H) * 25 + 1)), o = i * 4;
      for (let ch = 0; ch < 3; ch++) { const base = Math.min(255, skin[ch] * shade); d[o + ch] = base * (1 - mix) + Math.min(255, col[ch] * shade) * mix; }
    });
  }
  // Brustwarzen auch auf die echte Brust darunter (die Schale wird in flatShell in den Körper gelegt)
  const inShell = new Set<number>(); for (const t of shell) for (const v of t) inShell.add(v);
  for (const [a, b, c, part] of tri) {
    if ((part !== 'chest' && part !== 'belly') || (inShell.has(a) && inShell.has(b) && inShell.has(c))) continue;
    const ta = T(a), sa = S(a);
    if (!tip.some(([tt, ss]) => Math.abs(ta - tt) < .05 && Math.abs(sa - ss) < .05)) continue;
    const fa = (F(a) + F(b) + F(c)) / 3; if (!tip.some(([, , ff]) => fa > ff - .06 * H)) continue;
    raster(a, b, c, (i, u, v, q) => {
      const t = u * T(a) + v * T(b) + q * T(c), s2 = u * S(a) + v * S(b) + q * S(c);
      let near = 9; for (const [tt, ss] of tip) near = Math.min(near, Math.hypot(t - tt, s2 - ss) / r0);
      if (near >= 1.2) return;
      const col = near < .38 ? nip : areola, mix = near > .8 ? (1.2 - near) / .4 : 1, o = i * 4;
      for (let ch = 0; ch < 3; ch++) d[o + ch] = d[o + ch] * (1 - mix) + Math.min(255, col[ch] * (.88 + .24 * (d[o + ch] / 255))) * mix;
    });
  }
  return { shell: [...inShell], tips: tip };
}

/** Schalen-Vertices je Quelltextur (alle Sportlerinnen teilen sie) */
const shells = new WeakMap<object, { shell: number[]; tips: Array<[number, number, number]> }>();
/** Bikini-Schale flach unter die Haut legen (on) oder zurückholen (off). Nur dieses Mesh: Geometrie wird eigen. */
function flatShell(m: Mesh & { _pcShell?: Float32Array }, on: boolean, src: Texture | null) {
  if (!on) { if (m._pcShell) { m.setVerticesData('position', m._pcShell, false); m._pcShell = undefined; } return; }
  const sh = src && shells.get(src), sv = sh?.shell; if (!sh || !sv || !sv.length || m._pcShell) return;
  const pos = m.getVerticesData('position'), nor = m.getVerticesData('normal'); if (!pos || !nor) return;
  const inS = new Set(sv), out = Float32Array.from(pos), nv = pos.length / 3;
  for (const v of sv) {
    let best = -1, bd = 1e9;
    for (let j = 0; j < nv; j++) { if (inS.has(j)) continue; const dx = pos[j * 3] - pos[v * 3], dy = pos[j * 3 + 1] - pos[v * 3 + 1], dz = pos[j * 3 + 2] - pos[v * 3 + 2], dd = dx * dx + dy * dy + dz * dz; if (dd < bd) { bd = dd; best = j; } }
    if (best < 0) continue;
    for (let k = 0; k < 3; k++) out[v * 3 + k] = pos[best * 3 + k] - nor[best * 3 + k] * .012;
  }
  // Brust darunter glätten: die Körperform hat die Kanten des Bikini-Oberteils eingebaut (sah aus wie Kleidung)
  const fr = frame(m), idx = fullIndices(m);
  if (fr && idx && sh.tips.length) {
    const key = (v: number) => Math.round(pos[v * 3] * 2000) + ',' + Math.round(pos[v * 3 + 1] * 2000) + ',' + Math.round(pos[v * 3 + 2] * 2000);
    const rep = new Map<string, number>(), of = new Int32Array(nv);
    for (let v = 0; v < nv; v++) { const k = key(v); if (!rep.has(k)) rep.set(k, v); of[v] = rep.get(k)!; }
    const nb = new Map<number, Set<number>>();
    for (let i = 0; i < idx.length; i += 3) for (let e = 0; e < 3; e++) { const a = of[idx[i + e]], b = of[idx[i + (e + 1) % 3]]; if (a === b) continue; (nb.get(a) || nb.set(a, new Set()).get(a)!).add(b); (nb.get(b) || nb.set(b, new Set()).get(b)!).add(a); }
    const sel: Array<[number, number]> = [];   // [rep, Gewicht]
    for (const r of new Set(of)) {
      if (inS.has(r)) continue;
      let wgt = 0; for (const [tt, ss, ff] of sh.tips) { const dd = Math.hypot(fr.T(r) - tt, fr.S(r) - ss); if (dd < .075 && fr.F(r) > ff - .08 * fr.H) wgt = Math.max(wgt, Math.min(1, (.075 - dd) / .03)); }
      if (wgt > 0) sel.push([r, wgt]);
    }
    for (let it = 0; it < 6; it++) {
      const upd: Array<[number, number, number, number]> = [];
      for (const [r, wgt] of sel) { const ns = nb.get(r); if (!ns || !ns.size) continue; let x = 0, y = 0, z = 0; for (const q of ns) { x += out[q * 3]; y += out[q * 3 + 1]; z += out[q * 3 + 2]; } const k = .5 * wgt; upd.push([r, out[r * 3] + (x / ns.size - out[r * 3]) * k, out[r * 3 + 1] + (y / ns.size - out[r * 3 + 1]) * k, out[r * 3 + 2] + (z / ns.size - out[r * 3 + 2]) * k]); }
      for (const [r, x, y, z] of upd) { out[r * 3] = x; out[r * 3 + 1] = y; out[r * 3 + 2] = z; }
    }
    for (let v = 0; v < nv; v++) if (of[v] !== v && !inS.has(v)) for (let k = 0; k < 3; k++) out[v * 3 + k] = out[of[v] * 3 + k];
  }
  m.makeGeometryUnique();
  m._pcShell = Float32Array.from(pos);
  m.setVerticesData('position', out, false);
}

/** Unterwäsche/Badesachen auf die nackte Haut malen: Schnitt nach Körperstelle (Höhe über dem Schritt, Seite, vorne/hinten) */
function garment(m: Mesh, d: Uint8Array, w: number, h: number, uv: ArrayLike<number>, tri: Array<[number, number, number, Part]>, c: Wash, tips: Array<[number, number, number]>) {
  const fr = frame(m); if (!fr) return; const cr = crotch(fr); if (!cr) return;
  const { T, S, H, up, dep, dirY, fwd } = fr, { tc } = cr, nor = m.getVerticesData('normal'); if (!nor) return;
  const Fn = (v: number) => nor[v * 3 + dep] * fwd, Un = (v: number) => nor[v * 3 + up] * dirY;
  const col = [(c.col >> 16) & 255, (c.col >> 8) & 255, c.col & 255], acc = [(c.acc >> 16) & 255, (c.acc >> 8) & 255, c.acc & 255];
  const tipT = tips.length ? tips.reduce((a, t) => a + t[0], 0) / tips.length : 0;
  // Maske: 0 = Haut, 1 = Stoff, 2 = Bund/Kante (Akzentfarbe)
  const lowSlip = (a: number, front: boolean) => Math.min(front ? .055 : .045, (front ? -.005 : -.028) + (front ? 1.1 : .7) * Math.max(0, a - .02));
  const lowHip = (a: number, front: boolean) => Math.min(front ? .035 : .022, (front ? -.004 : -.03) + (front ? .8 : .5) * Math.max(0, a - .02));
  const cut = (t: number, a: number, front: boolean, n: number): number => {
    switch (c.cut) {
      case 'slip': return t > lowSlip(a, front) && t < .085 ? (t > .072 ? 2 : 1) : 0;
      case 'boxer': return t > -.11 && t < .09 ? (t > .075 || t < -.1 ? 2 : 1) : 0;
      case 'trunks': return t > -.065 && t < .085 ? (t > .074 ? 2 : 1) : 0;
      case 'hipster': return t > lowHip(a, front) && t < .06 ? (t > .052 ? 2 : 1) : 0;
      case 'jock': {
        if (t > .068 && t < .092) return 2;                                                // breiter Bund
        if (front && t > -.012 && t <= .068 && a < Math.min(.045, .018 + .3 * (t + .012))) return 1;   // Beutel vorne
        if (!front && t > -.035 && t <= .068 && Math.abs(a - (.032 + .32 * (t + .01))) < .007) return 2; // Bänder unter dem Po
        if (t > -.035 && t < -.005 && a > .02 && a < .05 && n < .3 && Math.abs(a - .035) < .008) return 2;
        return 0;
      }
      case 'string': case 'tanga': {
        const wide = c.cut === 'tanga' ? 1.6 : 1;
        if (t > .052 && t < .062) return 2;                                                // dünner Bund
        if (front && t > -.006 && t <= .052 && a < (.006 + .42 * (t + .006)) * wide) return 1;
        if (!front && t > -.035 && t <= .052 && a < (c.cut === 'tanga' ? .004 + .25 * Math.max(0, t) : .0045)) return 1;
        return 0;
      }
    }
    return 0;
  };
  const bra = (t: number, s2: number, a: number, front: boolean): number => {
    if (!c.bra || !tips.length) return 0;
    const cupR = c.swim ? .04 : .046;
    if (front) for (const [tt, ss] of tips) { const dd = Math.hypot((t - tt) * .9, s2 - ss); if (dd < cupR && t > tt - .042) return dd > cupR - .005 ? 2 : 1; }
    if (t > tipT - .05 && t < tipT - .036) return 2;                                      // Unterbrustband rundum
    if (t > tipT - .01 && t < tipT + .11 && Math.abs(a - .05) < .005) return 2;          // Träger
    return 0;
  };
  const shadeOf = (o: number) => .7 + .45 * ((d[o] + d[o + 1] + d[o + 2]) / 600);
  for (const [a0, b0, c0, part] of tri) {
    if (part === 'arm' || part === 'other' || part === 'foot') continue;
    const ts = [T(a0) - tc, T(b0) - tc, T(c0) - tc];
    const chest = part === 'chest' || (part === 'belly' && c.bra);
    if (!chest && (Math.min(...ts) > .1 || Math.max(...ts) < -.13)) continue;
    const A = [uv[a0 * 2] * w, uv[a0 * 2 + 1] * h], B = [uv[b0 * 2] * w, uv[b0 * 2 + 1] * h], C = [uv[c0 * 2] * w, uv[c0 * 2 + 1] * h];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) continue;
    const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]) - 1)), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0]) + 1));
    const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]) - 1)), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1]) + 1));
    const ss = [S(a0), S(b0), S(c0)], fs = [Fn(a0), Fn(b0), Fn(c0)], us = [Un(a0), Un(b0), Un(c0)];
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, py = y + .5;
      const u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area, q = 1 - u - v;
      if (u < -.03 || v < -.03 || q < -.03) continue;
      const t = u * ts[0] + v * ts[1] + q * ts[2], s2 = u * ss[0] + v * ss[1] + q * ss[2], a = Math.abs(s2), front = u * fs[0] + v * fs[1] + q * fs[2] > 0, n = u * us[0] + v * us[1] + q * us[2];
      let k = part === 'leg' || part === 'hip' || part === 'belly' ? cut(t, a, front, n) : 0;
      if (!k && c.bra && (part === 'chest' || part === 'belly')) k = bra(t + tc, s2, a, front);
      if (!k) continue;
      let cc = k === 2 ? acc : col, alpha = 1;
      if (k === 1) {
        if (c.pat === 'streifen' && Math.floor((t + 1) / .012) % 2) cc = acc;
        else if (c.pat === 'punkte' && ((x % 12) - 6) ** 2 + ((y % 12) - 6) ** 2 < 7) cc = acc;
        else if (c.pat === 'spitze') { const n2 = Math.sin(x * .9) * Math.sin(y * .9) + Math.sin((x + y) * .45); alpha = n2 > .9 ? .45 : .95; }
      }
      const o = (y * w + x) * 4, sh = shadeOf(o);
      for (let ch = 0; ch < 3; ch++) d[o + ch] = d[o + ch] * (1 - alpha) + Math.min(255, cc[ch] * sh) * alpha;
    }
  }
  void H;
}

type Akt = Mesh & { _pcAkt?: Mesh; _pcAktPart?: boolean };
/** Körpermerkmale je Figur, fest aus der Figuren-ID: jede*r sieht anders aus, aber immer gleich.
    Maße im natürlichen Bereich Erwachsener (schlaff): Penis 7–11 cm lang, 2,6–3,4 cm dick, Hoden verschieden groß und
    leicht ungleich hoch; Schamhaar von gestutzt bis voll, Farbe von Blond bis Schwarz; Schamlippen verschieden lang. */
interface AktLook { len: number; rad: number; tipR: number; hang: number; sack: number; tilt: number; hair: number; shape: number; col: number[]; lip: number; fore: number }
function akt(id: string): AktLook {
  let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10007) / 10007; };
  const cols = [[58, 42, 32], [34, 26, 22], [20, 17, 16], [92, 66, 44], [120, 88, 60], [70, 40, 28]];
  return { len: .07 + .04 * r(), rad: .013 + .004 * r(), tipR: 1.02 + .08 * r(), hang: .2 + .5 * r(), sack: .85 + .35 * r(), tilt: (r() - .5) * .5, hair: r() < .15 ? 0 : .35 + .65 * r(), shape: r(), col: cols[Math.floor(r() * cols.length)], lip: .015 + .015 * r(), fore: r() };
}
/** Schritt der Figur in Körper-Koordinaten: tiefster Punkt der Mittellinie (zwischen den Beinen) und Vorderseite darüber */
function crotch(fr: NonNullable<ReturnType<typeof frame>>) {
  const { T, S, F, pos } = fr, nv = pos.length / 3;
  let tc = 9; for (let v = 0; v < nv; v++) { const t = T(v); if (t > .3 && t < .6 && Math.abs(S(v)) < .006) tc = Math.min(tc, t); }
  if (tc > 1) return null;
  let fb = -1e9; for (let v = 0; v < nv; v++) { const t = T(v); if (Math.abs(S(v)) < .02 && t > tc + .015 && t < tc + .045) fb = Math.max(fb, F(v)); }
  return fb > -1e8 ? { tc, fb } : null;
}
/** Schamhaar (Mann breiter, Frau als Dreieck) und bei Frauen eine angedeutete Schamlippen-Linie, nur vorne am Becken */
function pubic(m: Mesh, d: Uint8Array, w: number, h: number, uv: ArrayLike<number>, tri: Array<[number, number, number, Part]>, skin: number[], female: boolean, look: AktLook) {
  const fr = frame(m); if (!fr) return; const c = crotch(fr); if (!c) return;
  const { T, S, F, H } = fr, { tc, fb } = c, hair = look.col, lip = [skin[0] * .62, skin[1] * .46, skin[2] * .44], lipLen = look.lip / H;
  for (const [a, b, cc, part] of tri) {
    if (part !== 'hip' && part !== 'belly' && part !== 'leg') continue;
    const ts = [T(a), T(b), T(cc)], ss = [S(a), S(b), S(cc)];
    if (Math.max(...ts) < tc - .01 || Math.min(...ts) > tc + .075 || Math.min(...ss.map(Math.abs)) > .06) continue;
    if ((F(a) + F(b) + F(cc)) / 3 < fb - .05 * H) continue;   // nur vorne
    const A = [uv[a * 2] * w, uv[a * 2 + 1] * h], B = [uv[b * 2] * w, uv[b * 2 + 1] * h], C = [uv[cc * 2] * w, uv[cc * 2 + 1] * h];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) continue;
    const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
    const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, py = y + .5;
      const u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area, q = 1 - u - v;
      if (u < -.02 || v < -.02 || q < -.02) continue;
      const t = u * ts[0] + v * ts[1] + q * ts[2] - tc, s2 = Math.abs(u * ss[0] + v * ss[1] + q * ss[2]), o = (y * w + x) * 4;
      // Haarfeld: Frau umgedrehtes Dreieck, Mann breiter mit weichem Rand nach oben
      const wide = .7 + .6 * look.shape, half = (female ? Math.max(0, .006 + .5 * t) : .02 + .45 * Math.max(0, t)) * wide, top = (female ? .055 : .07) * (.7 + .5 * look.hair);
      if (look.hair > 0 && t > lipLen * .4 && t < top && s2 < half) {
        const edge = Math.min(1, (half - s2) / .008, (top - t) / .012), n = ((x * 73856093) ^ (y * 19349663)) >>> 0, grain = .55 + .45 * ((n % 97) / 97);
        const k = Math.max(0, edge) * grain * (.45 + .45 * look.hair);
        for (let ch = 0; ch < 3; ch++) d[o + ch] = d[o + ch] * (1 - k) + hair[ch] * k;
      }
      if (female && t > -.006 && t <= lipLen && s2 < .0045 * (1 - Math.max(0, t) / lipLen * .5)) {
        // äußere Schamlippen als weiche Schattierung, Spalt in der Mitte dunkler
        const k = s2 < .0011 ? .8 : .35 * (1 - s2 / .0045);
        for (let ch = 0; ch < 3; ch++) d[o + ch] = d[o + ch] * (1 - k) + lip[ch] * k;
      }
    }
  }
}
/** Penis und Hoden, schlaff hängend (keine Erektion): eigene kleine Form am Becken-Knochen, mit der Haut des Körpers */
function maleParts(scene: Scene, m: Mesh, mat: PBRMaterial, look: AktLook): Mesh | null {
  const fr = frame(m), sk = m.skeleton, uv0 = m.getVerticesData('uv'); if (!fr || !sk || !uv0) return null;
  const c = crotch(fr); if (!c) return null;
  const pelvis = sk.bones.find((b) => /Pelvis$/.test(b.name)); if (!pelvis) return null;
  const { H, up, side, dep, base, dirY, mid, fwd, T, S, F, pos } = fr, { tc, fb } = c;
  // Körper-Koordinaten (t, s, f relativ zur Größe) → Mesh-Raum
  const toLocal = (t: number, s2: number, f: number) => { const o = [0, 0, 0]; o[up] = base + t * H * dirY; o[side] = mid + s2 * H; o[dep] = f * H * fwd; return o; };
  // Hautfarbe: UV des Körper-Vertex vorne über dem Schritt (dort ist nach dem Ausziehen Haut)
  let best = 0, bd = 1e9; for (let v = 0; v < pos.length / 3; v++) { const dd = Math.abs(T(v) - (tc + .09)) + Math.abs(S(v)) * 2 - F(v) / H * .2; if (dd < bd) { bd = dd; best = v; } }
  const su = uv0[best * 2], sv = uv0[best * 2 + 1];
  const P: number[] = [], N: number[] = [], I: number[] = [];
  const f0 = fb / H;
  // Rohr entlang einer Kurve: Ansatz am Schambein, hängt nach unten und leicht nach vorne
  // echte Maße (Meter) → relativ zur Körpergröße
  const ring = 14, segs = 10, len = look.len / H, r0 = look.rad / H, r1 = r0 * .94;
  const path = (k: number) => { const a = k / segs; return [tc + .028 - len * a * .97, look.tilt * .01 * a * a, f0 - .004 + (.008 + .01 * look.hang) * a + .006 * a * a]; };
  const C: number[] = [], glans = [.9, .72, .72], sackC = [.9, .8, .78];
  const add = (t: number, s2: number, f: number, nt: number, ns: number, nf: number) => { const l = toLocal(t, s2, f); P.push(l[0], l[1], l[2]); const n = [0, 0, 0]; n[up] = nt * dirY; n[side] = ns; n[dep] = nf * fwd; N.push(n[0], n[1], n[2]); return P.length / 3 - 1; };
  for (let k = 0; k <= segs; k++) {
    const [t, s0k, f] = path(k), a = k / segs;
    // Eichel: letzte 22 %, etwas breiter mit Kranz; mit Vorhaut bleibt sie halb bedeckt
    const gl = a > .78 ? Math.sin((a - .78) / .22 * Math.PI) * (look.tipR - 1) : 0, r = (r0 + (r1 - r0) * a) * (1 + gl) * (k === segs ? .9 : 1);
    const tone = a > (look.fore > .5 ? .9 : .76) ? glans : [1, 1, 1];
    for (let i = 0; i < ring; i++) { const an = i / ring * Math.PI * 2, cs = Math.cos(an), sn = Math.sin(an); add(t, s0k + cs * r * 1.04, f + sn * r * .96, 0, cs, sn); C.push(tone[0], tone[1], tone[2], 1); }
  }
  for (let k = 0; k < segs; k++) for (let i = 0; i < ring; i++) { const a = k * ring + i, b = k * ring + (i + 1) % ring, c2 = a + ring, d2 = b + ring; I.push(a, c2, b, b, c2, d2); }
  // runde Spitze
  const [te, se, fe] = path(segs), tip = add(te - r1 * .85, se, fe + .002, -1, 0, .3), last = segs * ring; C.push(glans[0] * .92, glans[1] * .9, glans[2] * .9, 1);
  for (let i = 0; i < ring; i++) I.push(last + i, tip, last + (i + 1) % ring);
  // Hoden: abgeflachte Kugel hinter dem Ansatz
  const sz = look.sack / H, ctr = [tc + .004 - .01 * look.hang, 0, f0 - .016], rad = [.03 * sz, .034 * sz, .024 * sz], lat = 10, lon = 14, s0 = P.length / 3;
  for (let i = 0; i <= lat; i++) for (let j = 0; j < lon; j++) {
    const th = i / lat * Math.PI, ph = j / lon * Math.PI * 2, nt = Math.cos(th), ns = Math.sin(th) * Math.cos(ph), nf = Math.sin(th) * Math.sin(ph);
    // zwei Hoden: Mittelnaht etwas eingezogen, eine Seite hängt tiefer
    const lob = 1 - .12 * Math.exp(-((ns * 6) ** 2)), low = ns < 0 ? .006 * look.hang : 0;
    add(ctr[0] + nt * rad[0] * (nt < 0 ? 1.1 : .9) - low * Math.max(0, -nt), ctr[1] + ns * rad[1] * lob, ctr[2] + nf * rad[2] * lob, nt, ns, nf); C.push(sackC[0], sackC[1], sackC[2], 1);
  }
  for (let i = 0; i < lat; i++) for (let j = 0; j < lon; j++) { const a = s0 + i * lon + j, b = s0 + i * lon + (j + 1) % lon, c2 = a + lon, d2 = b + lon; I.push(a, b, c2, b, d2, c2); }
  const nv = P.length / 3, vd = new VertexData();
  vd.positions = P; vd.normals = N; vd.indices = I; vd.colors = C; vd.uvs = new Array(nv * 2).fill(0).map((_, i) => (i & 1 ? sv : su));
  vd.matricesIndices = new Array(nv * 4).fill(0).map((_, i) => (i % 4 === 0 ? pelvis.getIndex() : 0));
  vd.matricesWeights = new Array(nv * 4).fill(0).map((_, i) => (i % 4 === 0 ? 1 : 0));
  // Wicklung je nach Spiegelung des Mesh-Raums richtig herum (Babylon: links­händig, Körper rechtshändig importiert)
  const out = new Mesh('akt', scene) as Akt;
  vd.applyToMesh(out);
  out._pcAktPart = true; out.parent = m.parent; out.position.copyFrom(m.position); out.scaling.copyFrom(m.scaling);
  if (m.rotationQuaternion) out.rotationQuaternion = m.rotationQuaternion.clone(); else out.rotation.copyFrom(m.rotation);
  out.skeleton = sk; out.numBoneInfluencers = 1; out.material = mat; out.isPickable = false; out.receiveShadows = true;
  out.sideOrientation = m.sideOrientation;
  m.onDisposeObservable.addOnce(() => out.dispose());
  return out;
}

