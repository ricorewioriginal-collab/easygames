/* Kleine Bau-Helfer für Babylon: Formen mit denselben Maßen und Ausrichtungen wie früher (Flächen schauen nach +z,
   Böden nach oben), Materialien (PBR, leuchtend) und Leuchtschrift aus einer Canvas-Textur. */
import { CreateBox, CreatePlane, CreateGround, CreateCylinder, CreateSphere, CreateTorus, Mesh, VertexData, PBRMaterial, DynamicTexture, Texture, Color3, col, type Scene } from './bjs';

let n = 0;
const id = (k: string) => k + (n++);

/** Fläche in der xy-Ebene, sichtbar von +z (wie three PlaneGeometry) */
export function planeZ(s: Scene, w: number, h: number, double = false) {
  return CreatePlane(id('pl'), { width: w, height: h, sideOrientation: double ? Mesh.DOUBLESIDE : Mesh.BACKSIDE }, s);
}
/** Bodenfläche (xz, schaut nach oben) */
export function ground(s: Scene, w: number, d: number) { return CreateGround(id('gr'), { width: w, height: d }, s); }
export function box(s: Scene, w: number, h: number, d: number) { return CreateBox(id('bx'), { width: w, height: h, depth: d }, s); }
/** Zylinder wie three (Radius oben/unten), cap = false: offen */
export function cyl(s: Scene, rt: number, rb: number, h: number, seg = 16, cap = true) {
  return CreateCylinder(id('cy'), { diameterTop: rt * 2, diameterBottom: rb * 2, height: h, tessellation: seg, cap: cap ? Mesh.CAP_ALL : Mesh.NO_CAP, sideOrientation: cap ? Mesh.DEFAULTSIDE : Mesh.DOUBLESIDE }, s);
}
export function sphere(s: Scene, r: number, seg = 12) { return CreateSphere(id('sp'), { diameter: r * 2, segments: seg }, s); }
export function torus(s: Scene, r: number, tube: number, seg = 32) { return CreateTorus(id('to'), { diameter: r * 2, thickness: tube * 2, tessellation: seg }, s); }
/** flacher Ring auf dem Boden (xz), schaut nach oben */
export function ring(s: Scene, inner: number, outer: number, seg = 32) {
  const pos: number[] = [], idx: number[] = [], nor: number[] = [], uv: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    pos.push(c * inner, 0, sn * inner, c * outer, 0, sn * outer); nor.push(0, 1, 0, 0, 1, 0); uv.push(i / seg, 0, i / seg, 1);
    if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const m = new Mesh(id('ri'), s), vd = new VertexData();
  vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.uvs = uv; vd.applyToMesh(m);
  return m;
}

/** Physikalisches Material (Farbe als sRGB-Hex), r = Rauheit, m = Metall */
export function pbr(s: Scene, c: number | string, r = .8, m = 0, o: { emissive?: number | string; ei?: number; alpha?: number; double?: boolean } = {}) {
  const x = new PBRMaterial(id('m'), s);
  x.albedoColor = col(c); x.roughness = r; x.metallic = m;
  if (o.emissive !== undefined) x.emissiveColor = col(o.emissive, o.ei ?? 1);
  if (o.alpha !== undefined && o.alpha < 1) { x.alpha = o.alpha; x.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND; }
  if (o.double) { x.backFaceCulling = false; x.twoSidedLighting = true; }
  return x;
}
/** Selbstleuchtend, unbeeinflusst vom Licht (Neon, Lampen, LED); k > 1 leuchtet (Bloom) */
export function glow(s: Scene, c: number | string | Color3, k = 1, o: { alpha?: number; add?: boolean; double?: boolean; tex?: Texture } = {}) {
  const x = new PBRMaterial(id('g'), s);
  x.unlit = true; x.albedoColor = (c instanceof Color3 ? c.clone() : col(c)).scale(k);
  if (o.tex) { x.albedoTexture = o.tex; o.tex.hasAlpha = o.alpha !== undefined || !!o.tex.hasAlpha; x.useAlphaFromAlbedoTexture = o.tex.hasAlpha; }
  if (o.alpha !== undefined) { x.alpha = o.alpha; x.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND; }
  if (o.tex?.hasAlpha && o.alpha === undefined) x.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  if (o.add) { x.alphaMode = 1; /* ALPHA_ADD */ x.disableDepthWrite = true; x.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND; x.alpha = o.alpha ?? 1; }
  if (o.double) x.backFaceCulling = false;
  return x;
}
/** Canvas → Textur (für Leuchtschrift, Flaggen, Sticker) */
export function canvasTex(s: Scene, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, alpha = false, nearest = false) {
  const t = new DynamicTexture(id('ct'), { width: w, height: h }, s, true, nearest ? Texture.NEAREST_SAMPLINGMODE : Texture.TRILINEAR_SAMPLINGMODE);
  const g = t.getContext() as unknown as CanvasRenderingContext2D;
  draw(g); t.update(true); t.hasAlpha = alpha;
  return t;
}
