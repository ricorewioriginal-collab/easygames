/* Animierte Figur auf KayKit-Basis: Waffen weg, Kleidung in Pride-Farben, Hautton wählbar, weiche Übergänge zwischen Animationen. */
import * as THREE from 'three';
import { skinned } from '../engine/Assets';
import { palette, SKINS } from './palettes';

export const CHAR_HEIGHT = 1.85;
/** Teile, die bleiben. Waffen, Schilde, Helme bleiben unsichtbar; Hut, Umhang und Krug nach Wunsch. */
const KEEP = /(_ArmLeft|_ArmRight|_Body|_Head|_Head_Hooded|_LegLeft|_LegRight)$/;
const EXTRA: Record<string, RegExp> = { cape: /_Cape$/, hat: /(Mage_Hat|Barbarian_Hat)$/, mug: /^Mug$/ };

export interface Look { body: string; palette: string; skin: number; cape?: boolean; hat?: boolean; mug?: boolean }

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
      m.material = mat; a.mats.push(mat);
    });
    a.root.add(scene);
    a.mixer = new THREE.AnimationMixer(scene);
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

  update(dt: number) { this.mixer.update(dt); }

  /** Kopf-Position (für Sprechblasen und Kamera) */
  head(out = new THREE.Vector3()) { return this.root.getWorldPosition(out).add(new THREE.Vector3(0, CHAR_HEIGHT * .95, 0)); }
}
