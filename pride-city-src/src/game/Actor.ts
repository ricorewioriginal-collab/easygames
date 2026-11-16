/* Animierte Figur auf Basis der Quaternius-Menschen (CC0): Kleidung in Pride-Farben, Hautton und Haarfarbe wählbar,
   Outfits per Shader, weiche Übergänge zwischen Animationen. */
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { skinned } from '../engine/Assets';
import { palette, SKINS, HAIRS, body, type BodyDef } from './palettes';

export const CHAR_HEIGHT = 1.85;

/** Outfits (Durchgang 3a): Niveau Bade- und Unterwäschemode, keine anatomischen Details. top = BH/Bikini-Oberteil */
export type Outfit = 'clothed' | 'shirtless' | 'underwear' | 'swim' | 'harness';
export const OUTFITS: Array<{ id: Outfit; name: string; adult?: boolean }> = [
  { id: 'clothed', name: 'Angezogen' }, { id: 'shirtless', name: 'Oberkörperfrei' }, { id: 'underwear', name: 'Unterwäsche' },
  { id: 'swim', name: 'Badehose / Bikini' }, { id: 'harness', name: 'Harness', adult: true },
];
export interface Look { body: string; palette: string; skin: number; hair?: number; cape?: boolean; hat?: boolean; mug?: boolean; outfit?: Outfit; top?: boolean; /** 18+: knappere Wäsche, glänzende Haut */ hot?: boolean }

/** Aussehen der Spielfigur aus dem Spielstand (Harness nur mit 18+) */
export function playerLook(s: { body: string; palette: string; skin: number; pronouns: string; flags: Record<string, unknown>; settings: { adult: boolean } }): Look {
  let outfit = (s.flags.outfit as Outfit) || 'clothed';
  if (!OUTFITS.some((o) => o.id === outfit) || (OUTFITS.find((o) => o.id === outfit)!.adult && !s.settings.adult)) outfit = 'clothed';
  const hair = typeof s.flags.hair === 'number' && (s.flags.hair as number) >= 0 ? s.flags.hair as number : undefined;
  return { body: body(s.body).id, palette: s.palette, skin: s.skin, hair, outfit, top: s.pronouns !== 'he', hot: s.settings.adult };
}

/* Shader: jede Materialrolle bekommt ihre Farbe; Outfits ersetzen Kleidung durch Haut, Slip, BH oder Harness.
   vYN = Höhe in der Ruhepose (0 Fuß, 1 Scheitel), vSN = seitlicher Abstand zur Körpermitte, beides relativ zur Körpergröße. */
const OUTFIT_ID: Record<Outfit, number> = { clothed: 0, shirtless: 1, underwear: 2, swim: 3, harness: 4 };
const FRAG = `
if (uRole > -.5) {
  float r = uRole, y = vYN, sx = abs(vSN), o = uOutfit;
  vec3 base = diffuseColor.rgb;
  if (r > 8.5 && r < 9.5) { // Farbfeld-Textur: nächste Grundfarbe bestimmt die Rolle
    vec3 c = pow(max(base, vec3(0.)), vec3(1. / 2.2));
    float best = 9.; r = 0.;
    vec3 P[6]; P[0] = vec3(.906, .741, .569); P[1] = vec3(.906, .396, .361); P[2] = vec3(.82, .76, .44); P[3] = vec3(.38, .53, .827); P[4] = vec3(.16); P[5] = vec3(.94, .278, .184);
    float R[6]; R[0] = 1.; R[1] = 2.; R[2] = 7.; R[3] = 4.; R[4] = 0.; R[5] = 5.;
    for (int i = 0; i < 6; i++) { float d = distance(c, P[i]); if (d < best) { best = d; r = R[i]; } }
    if (r > 4.5 && r < 5.5 && y > .1) r = 2.;
    if (r > 1.5 && r < 2.5 && y < .08) r = 5.;
  } else if (r > 9.5) { // bemalte Figur (ohne Kleidung modelliert)
    if (y < .035) r = 5.; else if (y < .52) r = 4.;
    else if (y < .815) r = sx < uTorso + .07 ? 2. : 1.;
    else if (y > .945) r = 7.; else r = 1.;
  }
  bool under = o > 1.5 && o < 3.5;
  bool bra = uTop > .5 && y > uBra.x && y < uBra.y && sx < uTorso + .02;
  vec3 col = base;
  if (r < .5) col = y < .06 ? (under ? uSkin : uShoe) : base;
  else if (r < 1.5) col = uSkin;
  else if (r < 3.5) { if (o < .5) col = r < 2.5 ? uC0 : uC2; else col = bra ? uCloth : uSkin; }
  else if (r < 4.5) col = under ? (y < uBrief || (uHot > .5 && y < uBrief + .07 && sx > .022 + (y - uBrief) * 1.5) ? uSkin : uCloth) : uC1;
  else if (r < 5.5) col = under ? uSkin : uShoe;
  else if (r < 6.5) col = under ? uSkin : vec3(.82);
  else if (r < 7.5) col = uHair;
  else { if (under) discard; col = uC3; }
  if (o > 3.5 && r > .5 && r < 3.5 && y > uBra.x - .09 && y < uBra.y + .06 && sx < uTorso + .02) {
    float d = abs(sx - (uBra.y + .06 - y) * .55);
    if (d < .012 || abs(y - (uBra.x - .045)) < .011) col = vec3(.05);
  }
  bool bare = col == uSkin && r > .5 && r < 3.5;
  if (bare && vNF > .35) { // Brustwarzen (nur ohne Oberteil-Flag) und Bauchnabel, stilisiert
    float n = length(vec2(sx - uNip.x, y - uNip.y));
    if (uTop < .5 && n < .0105) col = uSkin * (n < .004 ? vec3(.5, .36, .34) : vec3(.72, .55, .52));
    if (length(vec2(vSN, (y - uNavel) * .8)) < .0055) col = uSkin * .42;
  }
  pcSkin = col == uSkin || bare ? 1. : 0.;
  diffuseColor.rgb = col;
}`;
/* Form unter der Kleidung (nur angedeutet, keine Details): Brust bei Figuren mit Oberteil, mit 18+ eine dezente Beule im Slip */
const SHAPE = `
float sxv = abs(vSN), fv = max(vNF, 0.);
if (uTop > .5 && ((uRole > .5 && uRole < 3.5) || uRole > 8.5)) {
  float d = length(vec2(sxv - uNip.x, (vYN - uNip.y) * 1.1));
  transformed += uFront * smoothstep(.065, .0, d) * fv * .02 * uH;
}
if (uTop < .5 && uHot > .5 && uOutfit > 1.5 && uOutfit < 3.5 && ((uRole > 3.5 && uRole < 4.5) || uRole > 8.5)) {
  float k = smoothstep(.04, .0, sxv) * smoothstep(uBrief - .01, uBrief + .03, vYN) * smoothstep(uBrief + .09, uBrief + .045, vYN);
  transformed += uFront * k * fv * .014 * uH;
}`;
function outfitShader(mat: THREE.MeshStandardMaterial, role: number, b: BodyDef, lo: number, h: number, front: THREE.Vector3) {
  const ax = (i: number) => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
  const c = () => ({ value: new THREE.Color() });
  const u = {
    uOutfit: { value: 0 }, uRole: { value: role }, uTop: { value: 0 }, uSkin: c(), uCloth: c(), uC0: c(), uC1: c(), uC2: c(), uC3: c(), uShoe: c(), uHair: c(),
    uUp: { value: ax(b.up) }, uSide: { value: ax(b.side) }, uLo: { value: lo }, uH: { value: h }, uBrief: { value: b.brief }, uBra: { value: new THREE.Vector2(...b.bra) }, uTorso: { value: b.torso },
    uNip: { value: new THREE.Vector2(...b.nip) }, uNavel: { value: b.navel }, uHot: { value: 0 }, uFront: { value: front },
  };
  mat.userData.outfit = u;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec3 uUp, uSide, uFront;\nuniform float uLo, uH, uOutfit, uTop, uRole, uBrief, uHot;\nuniform vec2 uNip;\nvarying float vYN, vSN, vNF;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvYN = (dot(position, uUp) - uLo) / uH; vSN = dot(position, uSide) / uH; vNF = dot(normalize(normal), uFront);' + SHAPE);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vYN, vSN, vNF;\nuniform float uOutfit, uRole, uTop, uBrief, uTorso, uNavel, uHot;\nuniform vec2 uBra, uNip;\nuniform vec3 uSkin, uCloth, uC0, uC1, uC2, uC3, uShoe, uHair;')
      .replace('#include <map_fragment>', '#include <map_fragment>\nfloat pcSkin = 0.;\n' + FRAG)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .36, pcSkin * uHot);');
  };
  mat.customProgramCacheKey = () => 'people';
}

/* Weiche Schattierung: die Modelle sind facettiert (Low-Poly). Gleiche Punkte werden zusammengelegt und die Normalen
   neu gemittelt, damit Haut und Kleidung rund wirken. Einmal pro Geometrie, danach aus dem Zwischenspeicher. */
const smoothCache = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
function smooth(g: THREE.BufferGeometry, keepUv: boolean, tol: number) {
  let s = smoothCache.get(g);
  if (!s) {
    const c = g.clone();
    c.deleteAttribute('normal');
    if (!keepUv) c.deleteAttribute('uv');
    s = mergeVertices(c, tol);
    s.computeVertexNormals();
    smoothCache.set(g, s);
  }
  return s;
}

export type Anim = 'idle' | 'walk' | 'run' | 'cheer' | 'interact' | 'sit' | 'wave' | 'dance1' | 'dance2' | 'dance3' | 'jump' | 'hit' | 'pose';
/** Clip-Namen (ohne Armatur- und Man_/Female_-Präfix), der erste vorhandene gewinnt */
const CLIP: Record<Anim, string[]> = {
  idle: ['Idle'], walk: ['Walk', 'Walking'], run: ['Run', 'Running'], cheer: ['Clapping', 'Jump2', 'Jump'], interact: ['PickUp', 'Working', 'Clapping'],
  sit: ['SitIdle', 'Sitting'], wave: ['Clapping', 'PickUp', 'Working'], dance1: ['Clapping', 'Idle'], dance2: ['Idle'], dance3: ['Jump2', 'Jump', 'Idle'],
  jump: ['Jump'], hit: ['RecieveHit', 'Death'], pose: ['Clapping', 'Idle'],
};
const ONCE: Anim[] = ['interact', 'wave', 'jump', 'hit'];
const DANCE: Anim[] = ['dance1', 'dance2', 'dance3'];
const clipKey = (n: string) => n.split('|').pop()!.replace(/^(Man|Female)_/, '');

export class Actor {
  readonly root = new THREE.Group();
  model!: THREE.Object3D;
  private mixer!: THREE.AnimationMixer;
  private actions = new Map<Anim, THREE.AnimationAction>();
  private cur: Anim | null = null;
  private mats: THREE.MeshStandardMaterial[] = [];
  private clips: THREE.AnimationClip[] = [];
  private def!: BodyDef;
  private baseY = 0;
  private t = 0;
  look: Look;

  private constructor(look: Look) { this.look = { ...look }; }

  static async create(look: Look): Promise<Actor> {
    const a = new Actor(look);
    const b = (a.def = body(look.body));
    a.look.body = b.id;
    const { scene, clips } = await skinned('people/' + b.id + '.glb');
    a.model = scene;
    scene.updateMatrixWorld(true);
    // Größe vereinheitlichen und auf den Boden stellen
    const box = new THREE.Box3().setFromObject(scene);
    const k = b.height / (box.max.y - box.min.y || 1);
    scene.scale.multiplyScalar(k);
    a.baseY = scene.position.y = -box.min.y * k;
    // Ruhepose-Höhe in Geometrie-Koordinaten (alle Teile teilen sich den Raum)
    let lo = Infinity, hi = -Infinity;
    scene.traverse((o) => {
      const m = o as THREE.SkinnedMesh;
      if (!m.isSkinnedMesh) return;
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox!;
      lo = Math.min(lo, bb.min.getComponent(b.up)); hi = Math.max(hi, bb.max.getComponent(b.up));
    });
    // Blickrichtung der Figur (Welt +Z) im Koordinatenraum der Geometrie, für Brust und Bauchnabel vorne
    const front = new THREE.Vector3(0, 0, 1);
    scene.traverse((o) => { if ((o as THREE.SkinnedMesh).isSkinnedMesh && front.z === 1 && front.x === 0) front.transformDirection(new THREE.Matrix4().copy(o.matrixWorld).invert()); });
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true; m.frustumCulled = false;
      const src = m.material as THREE.MeshStandardMaterial;
      m.geometry = smooth(m.geometry, !!src.map, (hi - lo) * 2e-4);
      const mat = src.clone();
      mat.roughness = .75; mat.metalness = 0;
      outfitShader(mat, b.roles[src.name] ?? 0, b, lo, hi - lo, front);
      m.material = mat; a.mats.push(mat);
    });
    a.root.add(scene);
    a.mixer = new THREE.AnimationMixer(scene);
    a.clips = clips;
    for (const [an, names] of Object.entries(CLIP) as [Anim, string[]][]) {
      let c: THREE.AnimationClip | undefined;
      for (const n of names) { c = clips.find((x) => clipKey(x.name) === n); if (c) break; }
      if (!c) continue;
      const act = a.mixer.clipAction(c);
      if (ONCE.includes(an)) { act.setLoop(THREE.LoopOnce, 1); act.clampWhenFinished = true; }
      a.actions.set(an, act);
    }
    a.setLook(look);
    a.play('idle', 0);
    return a;
  }

  setLook(look: Partial<Look>) {
    Object.assign(this.look, look);
    this.look.body = this.def.id;
    const cols = palette(this.look.palette).colors, P = (i: number) => new THREE.Color(cols[i % cols.length]).multiplyScalar(.86);
    const dark = new THREE.Color('#1b1a24');
    const skin = new THREE.Color(SKINS[this.look.skin] || SKINS[1]).multiplyScalar(.88);
    const hair = new THREE.Color(this.look.hair != null && HAIRS[this.look.hair] ? HAIRS[this.look.hair] : this.def.hair);
    const cloth = P(this.look.outfit === 'swim' ? 2 : 0);
    const o = OUTFIT_ID[this.look.outfit || 'clothed'];
    for (const m of this.mats) {
      const u = m.userData.outfit; if (!u) continue;
      u.uOutfit.value = o; u.uTop.value = this.look.top ? 1 : 0; u.uHot.value = this.look.hot ? 1 : 0;
      u.uSkin.value.copy(skin); u.uHair.value.copy(hair); u.uCloth.value.copy(cloth);
      u.uC0.value.copy(P(0)); u.uC1.value.copy(P(1)).lerp(dark, .45); u.uC2.value.copy(P(2)).lerp(dark, .2); u.uC3.value.copy(P(3));
      u.uShoe.value.copy(P(cols.length - 1)).lerp(dark, .7);
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
    if (!DANCE.includes(a)) { this.model.position.y = this.baseY; this.model.rotation.y = 0; }
    if (ONCE.includes(a)) {
      const back = () => { this.mixer.removeEventListener('finished', back); if (this.cur === a) this.play('idle'); };
      this.mixer.addEventListener('finished', back);
    }
  }
  get anim() { return this.cur; }
  /** Standbild (für Fotos): Animation (Anim) oder Clip-Name, t in Sekunden */
  pose(clip: string, t = .5) {
    const c = this.actions.get(clip as Anim)?.getClip() || this.clips.find((x) => clipKey(x.name) === clip); if (!c) return;
    this.mixer.stopAllAction(); this.cur = null;
    const a = this.mixer.clipAction(c); a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.play();
    this.mixer.setTime(Math.min(t, c.duration - .01));
  }

  update(dt: number) {
    this.mixer.update(dt);
    if (this.cur && DANCE.includes(this.cur)) { // Tanzen: federn und hüftschwingen über der Animation
      this.t += dt;
      const f = this.cur === 'dance3' ? 7 : this.cur === 'dance2' ? 5 : 6;
      this.model.position.y = this.baseY + Math.abs(Math.sin(this.t * f)) * .07;
      this.model.rotation.y = Math.sin(this.t * f * .5) * (this.cur === 'dance2' ? .6 : .3);
    }
  }

  /** Kopf-Position (für Sprechblasen und Kamera) */
  head(out = new THREE.Vector3()) { return this.root.getWorldPosition(out).add(new THREE.Vector3(0, (this.def?.height ?? CHAR_HEIGHT) * .95, 0)); }
}
