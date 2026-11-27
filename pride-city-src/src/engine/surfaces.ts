/* Echte Oberflächen statt Spielzeug-Farbflächen: Asphalt, Gehwegplatten und Rasen aus Foto-Texturen (Poly Haven und ambientCG, CC0).
   Die Straßenkacheln (KayKit) bleiben als Geometrie, ein Material-Plugin legt die Fotos in Weltkoordinaten darüber:
   Fahrbahn (Höhe < 7,15 cm) bekommt Asphalt, Markierungen (7,3 cm) behalten ihre Farbe mit Asphalt-Körnung,
   Gehweg und Bordstein (ab 8,5 cm) bekommen Betonplatten. Zwei Abtastungen in verschiedenen Maßstäben verdecken die Kachelung. */
import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
import type { MaterialDefines } from '@babylonjs/core/Materials/materialDefines';
import type { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { Texture, type Scene, type PBRMaterial } from './bjs';

const BASE = './assets/world/';
const cache = new WeakMap<Scene, Map<string, Texture>>();
/** Foto-Textur einmal je Szene laden (gekachelt, mit Mipmaps) */
export function worldTex(scene: Scene, file: string) {
  let m = cache.get(scene); if (!m) cache.set(scene, (m = new Map()));
  let t = m.get(file);
  if (!t) {
    t = new Texture(BASE + file, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
    t.wrapU = t.wrapV = Texture.WRAP_ADDRESSMODE; t.anisotropicFilteringLevel = 4;
    m.set(file, t);
  }
  return t;
}

class RoadSurface extends MaterialPluginBase {
  private tex: Texture[];
  constructor(m: PBRMaterial, scene: Scene) {
    super(m, 'PcRoad', 210, { PC_ROAD: false });
    this.tex = ['asphalt_col.jpg', 'asphalt_nor.jpg', 'paving_col.jpg', 'paving_nor.jpg'].map((f) => worldTex(scene, f));
    this._enable(true);
  }
  override prepareDefines(d: MaterialDefines) { d.PC_ROAD = true; }
  override getClassName() { return 'PcRoadSurface'; }
  override getSamplers(s: string[]) { s.push('pcAsC', 'pcAsN', 'pcPvC', 'pcPvN'); }
  override getUniforms() { return { ubo: [{ name: 'pcRoad', size: 4, type: 'vec4' }], fragment: '#ifdef PC_ROAD\nuniform vec4 pcRoad;\n#endif' }; }
  override isReadyForSubMesh() { return this.tex.every((t) => t.isReady()); }
  override bindForSubMesh(u: UniformBuffer) {
    // x: Asphalt-Maßstab (1/m), y: Platten-Maßstab, z: Helligkeit Asphalt, w: Stärke der Normalen
    u.updateFloat4('pcRoad', 1 / 3.2, 1 / 2.4, .9, .8);
    u.setTexture('pcAsC', this.tex[0]); u.setTexture('pcAsN', this.tex[1]); u.setTexture('pcPvC', this.tex[2]); u.setTexture('pcPvN', this.tex[3]);
  }
  override getCustomCode(type: string) {
    if (type !== 'fragment') return null;
    return {
      CUSTOM_FRAGMENT_DEFINITIONS: `#ifdef PC_ROAD
uniform sampler2D pcAsC; uniform sampler2D pcAsN; uniform sampler2D pcPvC; uniform sampler2D pcPvN;
vec3 pcTwo(sampler2D t, vec2 uv){ return mix(texture2D(t, uv).rgb, texture2D(t, uv * .31 + vec2(.37, .61)).rgb, .3); }
#endif`,
      CUSTOM_FRAGMENT_UPDATE_ALPHA: `#ifdef PC_ROAD
{ float pcY = vPositionW.y; bool pcFlat = normalW.y > .6;
  vec2 pcUv = pcFlat ? vPositionW.xz : vec2(vPositionW.x + vPositionW.z, vPositionW.y);
  bool pcAsph = pcY < .0715 && pcFlat, pcMark = pcY < .085 && pcFlat && !pcAsph;
  vec2 uv = pcUv * (pcAsph || pcMark ? pcRoad.x : pcRoad.y);
  vec3 c = pcAsph || pcMark ? pcTwo(pcAsC, uv) : pcTwo(pcPvC, uv);
  c = toLinearSpace(c);
  if (pcAsph) surfaceAlbedo = c * pcRoad.z;
  else if (pcMark) surfaceAlbedo *= clamp(dot(c, vec3(.33)) * 4.5, .55, 1.15);
  else surfaceAlbedo = c * clamp(surfaceAlbedo * 1.9, .55, 1.6);
  if (pcFlat) {
    vec3 n = (pcAsph || pcMark ? texture2D(pcAsN, uv).rgb : texture2D(pcPvN, uv).rgb) * 2. - 1.;
    normalW = normalize(vec3(n.x * pcRoad.w, max(n.z, .2), n.y * pcRoad.w));
  }
}
#endif`,
    };
  }
}

const done = new WeakSet<PBRMaterial>();
/** Straßen- und Gehwegkacheln mit Foto-Asphalt und Betonplatten belegen (einmal je Material) */
export function roadSurface(m: PBRMaterial, scene: Scene) {
  if (done.has(m)) return; done.add(m);
  new RoadSurface(m, scene);
}

export type Photo = 'grass' | 'paving' | 'sand';
/** Foto-Boden (Rasen, Pflaster, Sand) auf eine Fläche w × l Meter legen, kachelt alle `tile` Meter */
export function photoSurface(m: PBRMaterial, scene: Scene, kind: Photo, w: number, l = w, tile = kind === 'paving' ? 2.4 : 3.5) {
  const c = worldTex(scene, kind + '_col.jpg').clone(), n = worldTex(scene, kind + '_nor.jpg').clone();
  for (const t of [c, n]) { t.uScale = w / tile; t.vScale = l / tile; }
  m.albedoTexture = c; m.bumpTexture = n; n.level = .7;
  m.albedoColor.set(1, 1, 1); m.roughness = kind === 'paving' ? .8 : .95; m.metallic = 0;
  m.invertNormalMapY = true;
  return m;
}
export const grassSurface = (m: PBRMaterial, scene: Scene, size: number) => photoSurface(m, scene, 'grass', size);

/** Wasser: zwei gegeneinander laufende Wellen-Normalenkarten (Grund und Klarlack), spiegelt die Stadt-HDRIs.
    Liefert die Bewegung je Bild (nur Textur-Versatz, keine Material-Setter). */
export function waterSurface(m: PBRMaterial, scene: Scene, w: number, l = w) {
  const a = worldTex(scene, 'water_nor.jpg').clone(), b = worldTex(scene, 'water_nor.jpg').clone();
  a.uScale = w / 14; a.vScale = l / 14; b.uScale = w / 5.5; b.vScale = l / 5.5; a.level = .55; b.level = .35;
  m.bumpTexture = a; m.roughness = .14; m.metallic = 0;
  m.clearCoat.isEnabled = true; m.clearCoat.intensity = .8; m.clearCoat.roughness = .03; m.clearCoat.bumpTexture = b;
  return (t: number) => { a.uOffset = t * .006; a.vOffset = t * .004; b.uOffset = -t * .011; b.vOffset = t * .007; };
}
