/* Animierte Figur: echte Menschen aus Microsoft Rocketbox (MIT) mit geteilten Animationen (Laufen, Rennen, Tanzen,
   Jubeln, Winken, Sitzen, Reden …), weiche Überblendung zwischen Animationen. Läuft in jeder Babylon-Szene. */
import { applyOutfit, skinOf } from './outfit';
import { applyStyle } from './queer';
import { bareBody, bareId, BARE_OUTFITS, type Bare } from './koerper';
import { AnimationGroup, Node3, Vector3, type Scene, type TransformNode, type AbstractMesh, type Mesh } from '../engine/bjs';
import { container, skinned } from '../engine/Assets';
import { avatarFor, type Avatar } from './avatars';
import { playerDrag } from './dragLook';
import { lodFor, LOD_DIST, HIDE_DIST, type Lod } from './lod';

export const CHAR_HEIGHT = 1.75;
const GEAR = /_(helmet|equipment|machinegun|shotgun|pistol|mask|flashlight)$/;
/** Schrittweite der Animationen: so schnell (m/s) läuft die Figur bei Tempo 1 */
export const WALK_MPS = 1.02, RUN_MPS = 3.6;

/** Outfits aus dem alten Spiel: bleiben im Spielstand (Rocketbox-Figuren tragen ihre eigene Kleidung) */
export type Outfit = 'clothed' | 'shirtless' | 'underwear' | 'swim' | 'harness';
export const OUTFITS: Array<{ id: Outfit; name: string; adult?: boolean }> = [
  { id: 'clothed', name: 'Angezogen' }, { id: 'shirtless', name: 'Oberkörperfrei' }, { id: 'underwear', name: 'Unterwäsche' },
  { id: 'swim', name: 'Badehose / Bikini' }, { id: 'harness', name: 'Harness', adult: true },
];
/** rb = feste Rocketbox-Figur (sonst passend zu body/palette/skin gewählt) */
export interface Look { body: string; palette: string; skin: number; hair?: number; rb?: string; cape?: boolean; hat?: boolean; mug?: boolean; outfit?: Outfit; top?: boolean; /** Szene-Look aus queer.ts (Flaggen-Shirt, Leder, Glitzer, gefärbte Haare) */ style?: string; /** 18+ */ hot?: boolean }

/** Spielbare Romanfigur aus „Ich bin das Licht“: Leon Sommer als Mann oder als Lady Luma in Drag */
export const ROLE_LOOKS: Record<string, Look> = {
  leon: { body: 'Man', rb: 'Male_Adult_03', palette: 'rainbow', skin: 2, hair: 0, outfit: 'clothed' },
  luma: { body: 'Woman2', rb: 'Female_Party_02', palette: 'neon', skin: 2, hair: 1, cape: true, outfit: 'clothed', top: true },
};
/** Aussehen der Spielfigur aus dem Spielstand */
export function playerLook(s: { body: string; palette: string; skin: number; pronouns: string; flags: Record<string, unknown>; settings: { adult: boolean } }): Look {
  const role = ROLE_LOOKS[String(s.flags.playAs || '')];
  if (role) return { ...role };
  let outfit = (s.flags.outfit as Outfit) || 'clothed';
  if (!OUTFITS.some((o) => o.id === outfit) || (OUTFITS.find((o) => o.id === outfit)!.adult && !s.settings.adult)) outfit = 'clothed';
  const hair = typeof s.flags.hair === 'number' && (s.flags.hair as number) >= 0 ? s.flags.hair as number : undefined;
  // alte Spielstände (Körper „Hero“): nur mit „sie“ eine Frau, sonst ein Mann – nie ungefragt das andere Geschlecht
  const av = avatarFor({ body: s.body, palette: s.palette, skin: s.skin, hair, top: s.pronouns === 'she' });
  return { body: av.id, rb: av.id, palette: s.palette, skin: s.skin, hair, outfit, top: s.pronouns !== 'he', hot: s.settings.adult, style: playerDrag(s.flags) };
}

/** Auf der Straße: Unterwäsche nur zuhause, draußen ist die Figur angezogen */
export function streetLook(l: Look): Look { return l.outfit === 'underwear' ? { ...l, outfit: 'clothed' } : l; }

export type Anim = 'idle' | 'walk' | 'run' | 'cheer' | 'interact' | 'sit' | 'wave' | 'dance1' | 'dance2' | 'dance3' | 'jump' | 'hit' | 'pose' | 'talk' | 'clap' | 'phone' | 'drink' | 'laugh';
/** Spiel-Animation → Rocketbox-Animation (Datei rb/anim/<m|f>_<name>.glb) */
const CLIP: Record<Anim, string> = {
  idle: 'idle', walk: 'walk', run: 'run', cheer: 'cheer', interact: 'clap', sit: 'sit', wave: 'wave', dance1: 'dance1', dance2: 'dance2', dance3: 'dance3',
  jump: 'cheer', hit: 'laugh', pose: 'talk', talk: 'talk', clap: 'clap', phone: 'phone', drink: 'drink', laugh: 'laugh',
};
export const CLIPS = ['idle', 'walk', 'run', 'cheer', 'clap', 'sit', 'wave', 'dance1', 'dance2', 'dance3', 'talk', 'phone', 'drink', 'laugh'];
const ONCE: Anim[] = ['interact', 'wave', 'jump', 'hit', 'clap', 'laugh'];
const DANCE: Anim[] = ['dance1', 'dance2', 'dance3'];

/** Animationen einer Szene einmal laden (je Geschlecht), dann von allen Figuren geteilt */
const libs = new WeakMap<Scene, Map<string, Promise<AnimationGroup | null>>>();
function clip(scene: Scene, g: 'm' | 'f', name: string) {
  let m = libs.get(scene); if (!m) libs.set(scene, (m = new Map()));
  const k = g + '_' + name;
  let p = m.get(k);
  if (!p) { p = container(scene, 'rb/anim/' + k + '.glb').then((c) => c.animationGroups[0] || null).catch(() => null); m.set(k, p); }
  return p;
}
/** Vorladen (Ladebildschirm): alle Animationen beider Geschlechter und die genannten Figuren */
export function preloadPeople(scene: Scene, avatars: string[] = []) {
  return Promise.all([...(['m', 'f'] as const).flatMap((g) => CLIPS.map((c) => clip(scene, g, c))), ...avatars.map((a) => container(scene, 'rb/' + a + '.glb'))]);
}

/** alle Figuren je Szene (weit entfernte oder unsichtbare Figuren werden nicht animiert) */
const crowds = new WeakMap<Scene, Set<Actor>>();

let styleQueue: Promise<unknown> = Promise.resolve();
/** Aufbau-Warteschlange: höchstens etwa 10 ms Figuren-Aufbau je Bild, dann aufs nächste Bild warten */
let turnQ: Promise<unknown> = Promise.resolve(), sliceT = 0;
function turn<T>(fn: () => Promise<T>): Promise<T> {
  const run = turnQ.then(async () => {
    if (performance.now() - sliceT > 10) await new Promise<void>((r) => requestAnimationFrame(() => { sliceT = performance.now(); r(); }));
    return fn();
  });
  turnQ = run.catch(() => undefined);
  return run;
}

export class Actor {
  readonly root: Node3;
  model!: TransformNode;
  avatar!: Avatar;
  private groups = new Map<Anim, AnimationGroup>();
  private cur: Anim | null = null;
  private curG: AnimationGroup | null = null;
  private fadeG: AnimationGroup | null = null;
  private fadeT = 0; private fadeD = .2;
  private t = 0;
  private tick = 0;
  private sleeping = false;
  look: Look;
  /** Knochen der Figur (Name „Bip01 …“), z. B. für Umarmungen und Küsse in Filmszenen */
  bones = new Map<string, TransformNode>();

  private constructor(readonly scene: Scene, look: Look) { this.look = { ...look }; this.root = new Node3('actor', scene); }

  /** Laden läuft parallel, das Aufbauen (Skelett, Meshes, 14 Animationen kopieren) aber der Reihe nach und verteilt
      auf mehrere Bilder: vorher entstanden beim Annähern an eine Insel bis zu zehn Figuren im selben Bild (Hänger). */
  static async create(scene: Scene, look: Look): Promise<Actor> {
    await Promise.all([container(scene, 'rb/' + avatarFor(look).id + '.glb'), preloadPeople(scene)]);
    return turn(() => Actor.build(scene, look));
  }
  private static async build(scene: Scene, look: Look): Promise<Actor> {
    const a = new Actor(scene, look);
    const av = (a.avatar = avatarFor(look));
    a.look.body = av.id;
    const [{ root, groups }] = await Promise.all([skinned(scene, 'rb/' + av.id + '.glb'), preloadPeople(scene)]);
    groups.forEach((g) => g.dispose());
    a.model = root; root.parent = a.root;
    root.getChildMeshes().forEach((m: AbstractMesh) => { m.receiveShadows = true; (m as AbstractMesh & { _pcCast?: boolean })._pcCast = true; });
    const nodes = new Map<string, TransformNode>();
    root.getChildTransformNodes(false).forEach((n) => nodes.set(n.name.replace(/^Bip0\d/, 'Bip01'), n)); // Kinder heißen „Bip02 …“
    a.bones = nodes;
    // Animationen auf das eigene Skelett übertragen (gleiche Knochennamen „Bip01 …“)
    const made = new Map<string, AnimationGroup>();
    for (const an of Object.keys(CLIP) as Anim[]) {
      const key = CLIP[an];
      let g = made.get(key);
      if (!g) {
        const src = await clip(scene, av.g, key); if (!src) continue;
        g = new AnimationGroup(key, scene);
        for (const ta of src.targetedAnimations) {
          const n = nodes.get((ta.target as TransformNode).name); if (!n) continue;
          // Kinder: Hüfthöhe der Erwachsenen-Animation nicht übernehmen (sonst schweben sie)
          if (av.job === 'kid' && ta.animation.targetProperty === 'position') continue;
          g.addTargetedAnimation(ta.animation, n);
        }
        g.normalize(src.from, src.to);
        made.set(key, g);
      }
      a.groups.set(an, g);
    }
    let set = crowds.get(scene);
    if (!set) {
      const s = (set = new Set());
      crowds.set(scene, s);
      scene.onBeforeAnimationsObservable.add(() => {
        const f = scene.getFrameId(), cam = scene.activeCamera;
        s.forEach((x) => { const far = cam ? x.detail(cam.globalPosition) : false; x.sleep(far || f - x.tick > 2 || !x.root.isEnabled() || x.offscreen()); });
      });
    }
    set.add(a);
    a.root.onDisposeObservable.add(() => { set!.delete(a); made.forEach((g) => g.dispose()); });
    a.tick = scene.getFrameId();
    // Detailstufen: einmal je Modell vereinfacht, danach wählt jede Figur nach Abstand (lod.ts)
    root.getChildMeshes().forEach((m) => { if ((m as Mesh).skeleton) a.addLod(m as Mesh); });
    a.play('idle', 0);
    await a.dress();
    return a;
  }

  /** Aussehen ändern; ein anderes Outfit wird auf die Textur gemalt */
  setLook(look: Partial<Look>) {
    const before = this.dressed;
    Object.assign(this.look, look); this.look.body = this.avatar.id;
    if (this.outfitKey() !== before) void this.dress();
  }
  private dressed = 'clothed/';
  private bare: Bare | null = null;
  /** Körper-Meshes der eigenen Figur (ohne den angelegten Sport-Körper) */
  private ownBody() { return this.model.getChildMeshes().filter((m) => (m as Mesh).skeleton && !(this.bare && m.isDescendantOf(this.bare.root)) && /_body/.test(((m.material as { _orig?: { name: string } })?._orig || m.material)?.name || '')) as Mesh[]; }
  /** Einsatz-Ausrüstung der Berufsfiguren (Polizei, Feuerwehr, Security): eigene Meshes mit eigenem Material */
  private gear() { return this.model.getChildMeshes().filter((m) => !(this.bare && m.isDescendantOf(this.bare.root)) && GEAR.test(((m.material as { _orig?: { name: string } } | null)?._orig || m.material)?.name || '')); }
  private styled = false;
  /** Harness ohne eigenen Look: Gurte werden als Look auf die nackte Haut gemalt */
  private styleNow() { return this.look.style || (this.look.outfit === 'harness' ? 'gurt' : undefined); }
  private outfitKey() { return (this.look.outfit || 'clothed') + '/' + (this.styleNow() || ''); }
  /** Outfit (oberkörperfrei, Unterwäsche, Badesachen, Harness) auf die Textur malen */
  async dress() {
    const k = this.outfitKey(); if (k === this.dressed || this.avatar.job === 'kid') return;
    this.dressed = k;
    try {
      // ohne Kleidung: eng anliegender echter Körper statt umgemalter Kleidung (koerper.ts)
      const bare = !!this.look.outfit && BARE_OUTFITS.has(this.look.outfit);
      if (bare && !this.bare) {
        this.bare = await bareBody(this.scene, this.model, this.bones, this.avatar.g);
        this.bare?.meshes.forEach((m) => this.addLod(m as Mesh));
        const own0 = this.ownBody()[0], sk = own0 && await skinOf(own0), sp = this.bare?.meshes[0] && await skinOf(this.bare.meshes[0]);
        if (sk && sp) this.bare?.tint(sk.map((v, i) => v / Math.max(1, sp[i])));
      }
      if (this.dressed !== k || this.root.isDisposed()) return;
      const own = this.ownBody();
      const useBare = bare && !!this.bare;
      own.forEach((m) => m.setEnabled(!useBare));
      // Ausrüstung (Helm, Weste, Holster, Waffen, Atemmaske) liegt ohne Kleidung nicht mehr am Körper
      this.gear().forEach((m) => m.setEnabled(!useBare));
      if (this.bare) this.bare.root.setEnabled(useBare);
      if (useBare) await applyOutfit(this.scene, this.bare!.root, this.avatar.id + '@' + bareId(this.avatar.g), this.look.outfit, this.avatar.g === 'f', own[0]);
      else await applyOutfit(this.scene, this.model, this.avatar.id, this.look.outfit, this.avatar.g === 'f');
      // Szene-Look der Reihe nach im Hintergrund malen: das Laden wartet nie darauf
      const style = this.styleNow();
      if (style || this.styled) {
        this.styled = true;
        const base = (this.look.outfit || 'clothed') + (this.avatar.g === 'f' ? 'f' : 'm');
        styleQueue = styleQueue.then(async () => {
          if (this.root.isDisposed() || this.dressed !== k) return;
          const parts = { getChildMeshes: () => this.model.getChildMeshes().filter((m) => m.isEnabled()) };
          await applyStyle(this.scene, parts, this.avatar.id, style, base);
          await new Promise((r) => setTimeout(r, 40));
        }).catch((e) => console.warn('style', e));
      }
    } catch (e) { console.warn('outfit', e); }
  }

  /** Figur liegt ganz außerhalb des Bildes (hinter der Kamera, seitlich): dann muss niemand ihre 81 Knochen bewegen */
  private probe: AbstractMesh | null | undefined;
  private offscreen() {
    const pl = this.scene.frustumPlanes; if (!pl || pl.length < 6) return false;
    if (this.probe === undefined || this.probe?.isDisposed()) this.probe = this.model.getChildMeshes().find((q) => (q as AbstractMesh & { skeleton?: unknown }).skeleton) || null;
    const m = this.probe; if (!m) return false;
    const b = m.getBoundingInfo().boundingSphere, c = b.centerWorld, r = b.radiusWorld + 1.5;
    for (const p of pl) if (p.dotCoordinate(c) <= -r) return true;
    return false;
  }

  private lods: Array<[Mesh, Lod]> = [];
  /** Detailstufen für ein Figuren-Mesh anmelden (sobald berechnet, gleich auf die aktuelle Stufe stellen) */
  private addLod(m: Mesh) {
    void lodFor(m).then((l) => {
      if (!l || this.root.isDisposed() || m.isDisposed()) return;
      this.lods.push([m, l]);
      const s = m.subMeshes?.[0], r = l.ranges[Math.min(this.lodLevel, l.ranges.length - 1)]; if (s) { s.indexStart = r[0]; s.indexCount = r[1]; }
    });
  }
  private lodLevel = 0;
  private hidden = false;
  private mask = 0;
  /** Detailstufe nach Abstand zur Kamera; true = so weit weg, dass die Figur gar nicht gezeichnet wird */
  private detail(cam: Vector3) {
    const p = this.root.absolutePosition, dx = p.x - cam.x, dz = p.z - cam.z, d = Math.sqrt(dx * dx + dz * dz);
    // Stufe mit etwas Spielraum wechseln, damit eine Figur an der Grenze nicht hin und her springt
    const cur = this.lodLevel, lv = d > LOD_DIST[1] + (cur >= 2 ? -2 : 2) ? 2 : d > LOD_DIST[0] + (cur >= 1 ? -2 : 2) ? 1 : 0;
    const hide = d > HIDE_DIST + (this.hidden ? -3 : 3);
    if (lv !== cur && this.lods.length) {
      this.lodLevel = lv;
      for (const [m, l] of this.lods) { const s = m.subMeshes?.[0], r = l.ranges[Math.min(lv, l.ranges.length - 1)]; if (s) { s.indexStart = r[0]; s.indexCount = r[1]; } }
    }
    // weit weg: aus der Kamera nehmen (Ebenenmaske statt Sichtbarkeit, die setzt das Spiel selbst); auf der gröbsten
    // Stufe fallen auch die durchsichtigen Haarsträhnen weg (eigener, sortierter Zeichenaufruf für ein paar Pixel)
    const mask = hide ? 2 : lv >= 2 ? 1 : 0;
    if (mask !== this.mask) {
      this.mask = mask;
      this.model.getChildMeshes().forEach((m) => { const strands = /_opacity/.test(m.material?.name || ''); m.layerMask = mask === 2 || (mask === 1 && strands) ? 0 : 0x0FFFFFFF; });
    }
    this.hidden = hide;
    return hide;
  }

  private sleep(on: boolean) {
    if (on === this.sleeping) return;
    this.sleeping = on;
    // ruhend: anhalten statt pausieren, sonst bleiben die rund 70 Spuren je Figur in jedem Bild in Babylons Liste
    // (bei 100 Figuren über 7.000). Die Pose bleibt stehen, beim Aufwachen läuft die aktuelle Animation weiter.
    if (on) { this.fadeG?.stop(); this.fadeG = null; this.curG?.stop(); }
    else if (this.curG && !this.curG.isPlaying && this.cur) { this.curG.start(!ONCE.includes(this.cur), this.curG.speedRatio, this.curG.from, this.curG.to); this.curG.setWeightForAllAnimatables(1); }
  }

  play(a: Anim, fade = .22, speed = 1) {
    if (this.cur === a && !ONCE.includes(a)) { if (this.curG) this.curG.speedRatio = speed; return; }
    const next = this.groups.get(a) || this.groups.get('idle');
    if (!next) return;
    // ruhende Figur: nur merken, gestartet wird beim Aufwachen (ein einmaliger Gruß ist dann vorbei)
    if (this.sleeping) {
      if (ONCE.includes(a)) return;
      if (this.curG !== next) this.curG?.stop();
      next.speedRatio = speed; this.curG = next; this.cur = a;
      if (!DANCE.includes(a)) this.model.position.y = 0;
      return;
    }
    const prev = this.curG, once = ONCE.includes(a), blend = !!prev && prev !== next && fade > 0;
    if (blend) { this.fadeG?.stop(); this.fadeG = prev; this.fadeT = 0; this.fadeD = fade; }
    else if (prev && prev !== next) prev.stop();
    if (next === this.fadeG) { this.fadeG = null; }
    next.stop();
    next.start(!once, speed, next.from, next.to);
    next.setWeightForAllAnimatables(blend ? 0 : 1);
    this.curG = next; this.cur = a; this.sleeping = false;
    if (!DANCE.includes(a)) this.model.position.y = 0;
    if (once) next.onAnimationGroupEndObservable.addOnce(() => { if (this.cur === a && !this.sleeping) this.play('idle'); });
  }
  get anim() { return this.cur; }
  /** Standbild (für Fotos): Animation oder Clip-Name, t in Sekunden */
  pose(name: string, t = .5) {
    const g = this.groups.get(name as Anim) || [...this.groups.values()].find((x) => x.name === name) || this.groups.get('idle');
    if (!g) return;
    this.groups.forEach((x) => x.stop()); this.fadeG = null;
    g.start(false, 1, g.from, g.to); g.setWeightForAllAnimatables(1);
    const fps = g.targetedAnimations[0]?.animation.framePerSecond || 60;
    g.goToFrame(Math.min(g.to, g.from + t * fps)); g.pause();
    this.curG = g; this.cur = null;
  }

  update(dt: number) {
    this.tick = this.scene.getFrameId();
    if (this.fadeG && this.curG) {
      this.fadeT += dt;
      const k = Math.min(1, this.fadeT / this.fadeD);
      this.curG.setWeightForAllAnimatables(k); this.fadeG.setWeightForAllAnimatables(1 - k);
      if (k >= 1) { this.fadeG.stop(); this.fadeG = null; }
    }
    if (this.cur && DANCE.includes(this.cur)) { // Tanzen: leicht federn über der Animation
      this.t += dt;
      const f = this.cur === 'dance3' ? 7 : this.cur === 'dance2' ? 5 : 6;
      this.model.position.y = Math.abs(Math.sin(this.t * f)) * .03;
    }
  }

  /** Kopf-Position (für Sprechblasen und Kamera) */
  head(out = new Vector3()) { out.copyFrom(this.root.position); out.y += CHAR_HEIGHT * .95; return out; }
  /** Figur wegräumen */
  dispose() { this.root.dispose(false, false); }
}
