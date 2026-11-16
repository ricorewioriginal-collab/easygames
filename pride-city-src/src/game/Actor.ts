/* Animierte Figur auf KayKit-Basis: Waffen weg, Kleidung in Pride-Farben, Hautton wählbar, weiche Übergänge zwischen Animationen. */
import * as THREE from 'three';
import { skinned } from '../engine/Assets';
import { palette, SKINS } from './palettes';

export const CHAR_HEIGHT = 1.85;
/** Teile, die bleiben. Waffen, Schilde, Helme bleiben unsichtbar; Hut, Umhang und Krug nach Wunsch. */
const KEEP = /(_ArmLeft|_ArmRight|_Body|_Head|_Head_Hooded|_LegLeft|_LegRight)$/;
const EXTRA: Record<string, RegExp> = { cape: /_Cape$/, hat: /(Mage_Hat|Barbarian_Hat)$/, mug: /^Mug$/ };

/** Outfits (Durchgang 3a): Niveau Bade- und Unterwäschemode, keine anatomischen Details. top = BH/Bikini-Oberteil */
export type Outfit = 'clothed' | 'shirtless' | 'underwear' | 'swim' | 'harness';
export const OUTFITS: Array<{ id: Outfit; name: string; adult?: boolean }> = [
  { id: 'clothed', name: 'Angezogen' }, { id: 'shirtless', name: 'Oberkörperfrei' }, { id: 'underwear', name: 'Unterwäsche' },
  { id: 'swim', name: 'Badehose / Bikini' }, { id: 'harness', name: 'Harness', adult: true },
];
export interface Look { body: string; palette: string; skin: number; cape?: boolean; hat?: boolean; mug?: boolean; outfit?: Outfit; top?: boolean }

/** Aussehen der Spielfigur aus dem Spielstand (Harness nur mit 18+) */
export function playerLook(s: { body: string; palette: string; skin: number; pronouns: string; flags: Record<string, unknown>; settings: { adult: boolean } }): Look {
  let outfit = (s.flags.outfit as Outfit) || 'clothed';
  if (!OUTFITS.some((o) => o.id === outfit) || (OUTFITS.find((o) => o.id === outfit)!.adult && !s.settings.adult)) outfit = 'clothed';
  return { body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat, outfit, top: s.pronouns !== 'he' };
}

/* Shader-Ergänzung: färbt je nach Outfit Haut und Wäsche anhand der Ruhepose-Höhe (KayKit: Beine 0–0,53, Körper 0,38–1,3) */
const OUTFIT_ID: Record<Outfit, number> = { clothed: 0, shirtless: 1, underwear: 2, swim: 3, harness: 4 };
function outfitShader(mat: THREE.MeshStandardMaterial, part: number) {
  const u = { uOutfit: { value: 0 }, uPart: { value: part }, uTop: { value: 0 }, uSkin: { value: new THREE.Color() }, uCloth: { value: new THREE.Color() } };
  mat.userData.outfit = u;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;\nuniform float uOutfit, uPart, uTop;\nuniform vec3 uSkin, uCloth;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      if (uOutfit > .5 && uPart > .5) {
        float lum = dot(diffuseColor.rgb, vec3(.299, .587, .114));
        vec3 skin = uSkin * (.85 + .3 * lum), cloth = uCloth * (.6 + .4 * lum);
        float y = vOP.y;
        bool brief = (uPart == 1. && y < .64) || (uPart == 3. && y > .4);
        bool bra = uTop > .5 && uPart == 1. && y > .93 && y < 1.1;
        if (uOutfit < 1.5 || uOutfit > 3.5) { // oberkörperfrei / Harness: Hose bleibt
          bool upper = uPart == 2. || (uPart == 1. && y > .64);
          if (upper) diffuseColor.rgb = bra ? cloth : skin;
          if (uOutfit > 3.5 && uPart == 1. && y > .64) { float d = abs(abs(vOP.x) - (1.22 - y) * .55); if (d < .035 || abs(y - .86) < .03) diffuseColor.rgb = vec3(.06); }
        } else { diffuseColor.rgb = (brief || bra) ? cloth : skin; }
      }`);
  };
  mat.customProgramCacheKey = () => 'outfit';
}

const texCache = new Map<string, THREE.Texture>();

function hsl(r: number, g: number, b: number) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return { h, s, l };
}

/* Färbt das Farbfeld-Atlas (KayKit: 1024², Felder je 128×256) neu. Haut bekommt den Hautton, Augen/Dunkles bleibt,
   alles andere wird pro Feld einer Palettenfarbe zugeordnet – der Verlauf (Helligkeit) bleibt erhalten. */
function recolor(src: THREE.Texture, look: Look): THREE.Texture {
  const key = look.body + '|' + look.palette + '|' + look.skin;
  const hit = texCache.get(key);
  if (hit) return hit;
  const img = src.image as CanvasImageSource & { width: number; height: number };
  const W = 256, H = 256;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(img, 0, 0, W, H);
  const id = c.getImageData(0, 0, W, H), d = id.data;
  const cols = palette(look.palette).colors.map((h) => new THREE.Color(h));
  const skin = new THREE.Color(SKINS[look.skin] || SKINS[1]);
  const base = { r: 241 / 255, g: 189 / 255, b: 160 / 255 };
  const cw = W / 8, ch = H / 4;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const { h, s, l } = hsl(r, g, b);
    if (l < .1) continue;
    if (h >= 12 && h <= 40 && s > .3 && s < .85 && l > .55 && l < .9) {
      d[i] = Math.min(255, r / base.r * skin.r * 255); d[i + 1] = Math.min(255, g / base.g * skin.g * 255); d[i + 2] = Math.min(255, b / base.b * skin.b * 255);
      continue;
    }
    const cell = Math.floor(x / cw) + 8 * Math.floor(y / ch);
    const p = cols[(cell * 5 + 3) % cols.length];
    const lum = .25 + l * 1.05;
    d[i] = Math.min(255, p.r * lum * 255); d[i + 1] = Math.min(255, p.g * lum * 255); d[i + 2] = Math.min(255, p.b * lum * 255);
  }
  c.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.flipY = src.flipY; t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  texCache.set(key, t);
  return t;
}

export type Anim = 'idle' | 'walk' | 'run' | 'cheer' | 'interact' | 'sit' | 'wave' | 'dance1' | 'dance2' | 'dance3' | 'jump' | 'hit';
const CLIP: Record<Anim, string> = {
  idle: 'Idle', walk: 'Walking_A', run: 'Running_A', cheer: 'Cheer', interact: 'Interact', sit: 'Sit_Chair_Idle',
  wave: 'Use_Item', dance1: 'Spellcasting', dance2: 'Cheer', dance3: '2H_Melee_Attack_Spinning', jump: 'Jump_Full_Short', hit: 'Hit_A',
};
const ONCE: Anim[] = ['interact', 'wave', 'jump', 'hit'];

export class Actor {
  readonly root = new THREE.Group();
  model!: THREE.Object3D;
  private mixer!: THREE.AnimationMixer;
  private actions = new Map<Anim, THREE.AnimationAction>();
  private cur: Anim | null = null;
  private mats: THREE.MeshStandardMaterial[] = [];
  private srcMap: THREE.Texture | null = null;
  private clips: THREE.AnimationClip[] = [];
  look: Look;

  private constructor(look: Look) { this.look = { ...look }; }

  static async create(look: Look): Promise<Actor> {
    const a = new Actor(look);
    const { scene, clips } = await skinned('chars/' + look.body + '.glb');
    a.model = scene;
    // Größe vereinheitlichen (nur sichtbare Körperteile messen)
    a.applyParts();
    const box = new THREE.Box3();
    scene.updateMatrixWorld(true);
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.visible && KEEP.test(o.name)) box.expandByObject(o); });
    const h = box.max.y - box.min.y || 2.4;
    scene.scale.setScalar(CHAR_HEIGHT / h);
    scene.traverse((o) => {
      const m = o as THREE.SkinnedMesh;
      if (!m.isMesh) return;
      m.castShadow = true; m.frustumCulled = false;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      if (!a.srcMap && mat.map) a.srcMap = mat.map;
      mat.roughness = .7; mat.metalness = 0;
      const part = /_Body$/.test(m.name) ? 1 : /_Arm(Left|Right)$/.test(m.name) ? 2 : /_Leg(Left|Right)$/.test(m.name) ? 3 : 0;
      outfitShader(mat, part);
      m.material = mat; a.mats.push(mat);
    });
    a.root.add(scene);
    a.mixer = new THREE.AnimationMixer(scene);
    a.clips = clips;
    for (const [k, n] of Object.entries(CLIP) as [Anim, string][]) {
      const c = clips.find((x) => x.name === n);
      if (!c) continue;
      const act = a.mixer.clipAction(c);
      if (ONCE.includes(k)) { act.setLoop(THREE.LoopOnce, 1); act.clampWhenFinished = true; }
      a.actions.set(k, act);
    }
    a.setLook(look);
    a.play('idle', 0);
    return a;
  }

  private applyParts() {
    this.model.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      let v = KEEP.test(o.name);
      for (const [k, re] of Object.entries(EXTRA)) if (re.test(o.name)) v = !!(this.look as unknown as Record<string, boolean>)[k];
      o.visible = v;
    });
  }

  setLook(look: Partial<Look>) {
    Object.assign(this.look, look);
    this.applyParts();
    if (this.srcMap) {
      const t = recolor(this.srcMap, this.look);
      this.mats.forEach((m) => { m.map = t; m.needsUpdate = true; });
    }
    const o = OUTFIT_ID[this.look.outfit || 'clothed'], cols = palette(this.look.palette).colors;
    const cloth = new THREE.Color(cols[this.look.outfit === 'swim' ? 2 % cols.length : 0]), skin = new THREE.Color(SKINS[this.look.skin] || SKINS[1]).convertSRGBToLinear().multiplyScalar(.9);
    for (const m of this.mats) { const u = m.userData.outfit; if (!u) continue; u.uOutfit.value = o; u.uTop.value = this.look.top ? 1 : 0; u.uSkin.value.copy(skin); u.uCloth.value.copy(cloth); }
  }

  play(a: Anim, fade = .22, speed = 1) {
    if (this.cur === a && !ONCE.includes(a)) return;
    const next = this.actions.get(a) || this.actions.get('idle');
    if (!next) return;
    const prev = this.cur ? this.actions.get(this.cur) : null;
    next.reset(); next.timeScale = speed; next.enabled = true; next.setEffectiveWeight(1);
    if (prev && prev !== next) next.crossFadeFrom(prev, fade, true);
    next.play();
    this.cur = a;
    if (ONCE.includes(a)) {
      const back = () => { this.mixer.removeEventListener('finished', back); if (this.cur === a) this.play('idle'); };
      this.mixer.addEventListener('finished', back);
    }
  }
  get anim() { return this.cur; }
  /** Standbild aus einem beliebigen KayKit-Clip (für Fotos), t in Sekunden */
  pose(clip: string, t = .5) {
    const c = this.clips.find((x) => x.name === clip); if (!c) return;
    this.mixer.stopAllAction(); this.cur = null;
    const a = this.mixer.clipAction(c); a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.play();
    this.mixer.setTime(Math.min(t, c.duration - .01));
  }

  update(dt: number) { this.mixer.update(dt); }

  /** Kopf-Position (für Sprechblasen und Kamera) */
  head(out = new THREE.Vector3()) { return this.root.getWorldPosition(out).add(new THREE.Vector3(0, CHAR_HEIGHT * .95, 0)); }
}
