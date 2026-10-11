import * as THREE from 'three';
import type { PlayerSetup } from '@shared/core/types';
import type { Layout } from '@shared/levels/types';
import type { Screen } from '../render/engine';
import type { QualitySettings } from '../render/quality';
import { ParticlePool } from '../render/particles';
import { createCharacter, type CharacterRig, type HatId } from '../render/characters';
import { glow, toon } from '../render/materials';
import { WorldScene } from '../render/worlds';
import { playerColor, playerColorHex, PLAYER_SYMBOLS } from '../app/theme';

export interface StageOptions {
  quality: QualitySettings;
  shake: boolean;
  calm: boolean;
  hat: string | null;
  trail: string | null;
  dice: string;
  /** Welcher Spieler (ID) bekommt die Kosmetik (lokaler Hauptspieler) */
  cosmeticFor: string | null;
}

interface Tween {
  t: number;
  dur: number;
  fn: (k: number) => void;
  done: () => void;
}

const DICE_SKINS: Record<string, { body: number; pip: string; edge: number }> = {
  klassisch: { body: 0xfff6e0, pip: '#2a1a5a', edge: 0xd8ccb0 },
  kristall: { body: 0x9ee8ff, pip: '#103a6a', edge: 0x5ac8f0 },
  holz: { body: 0xc89a5a, pip: '#3a2410', edge: 0x8a6030 },
  neon: { body: 0x1a1030, pip: '#35f0ff', edge: 0xff3e9d },
};
/** Augenzahl je Würfelseite (+x,−x,+y,−y,+z,−z): gegenüberliegende Seiten ergeben 7 */
const FACE_VALUES = [3, 4, 1, 6, 2, 5];
const PIPS: Record<number, Array<[number, number]>> = {
  1: [[0, 0]],
  2: [
    [-1, -1],
    [1, 1],
  ],
  3: [
    [-1, -1],
    [0, 0],
    [1, 1],
  ],
  4: [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],
  5: [
    [-1, -1],
    [1, -1],
    [0, 0],
    [-1, 1],
    [1, 1],
  ],
  6: [
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [1, 1],
  ],
};
const faceUp = (v: number): THREE.Quaternion => {
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  if (v === 6) e.set(Math.PI, 0, 0);
  else if (v === 3) e.set(0, 0, Math.PI / 2);
  else if (v === 4) e.set(0, 0, -Math.PI / 2);
  else if (v === 2) e.set(-Math.PI / 2, 0, 0);
  else if (v === 5) e.set(Math.PI / 2, 0, 0);
  return q.setFromEuler(e);
};

const V = (): THREE.Vector3 => new THREE.Vector3();

/** Das 3D-Spielbrett mit Figuren, Würfel, Altar und dynamischer Kamera. Alle Animationen geben Promises zurück, damit der Ablauf sie nacheinander abspielen kann. */
export class BoardStage implements Screen {
  readonly camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.5, 1200);
  readonly world: WorldScene;
  get scene(): THREE.Scene {
    return this.world.scene;
  }
  readonly rigs = new Map<string, CharacterRig>();
  private at = new Map<string, number>();
  private tweens: Tween[] = [];
  private particles: ParticlePool;
  private t = 0;
  private altar = new THREE.Group();
  private ring = new THREE.Group();
  private tags = new Map<string, THREE.Sprite>();
  private die: THREE.Group;
  private dieMeshes: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();
  // Kamera
  private camPos = V();
  private camLook = V();
  private mode:
    | { kind: 'overview' }
    | { kind: 'follow'; id: string }
    | { kind: 'focus'; p: THREE.Vector3; dist: number } = { kind: 'overview' };
  yawOffset = 0;
  zoom = 1;
  private baseYaw = 0.5;
  private shakeT = 0;
  private shakeA = 0;
  /** Welche Figuren sind sichtbar markiert (aktiver Spieler) */
  private active: string | null = null;

  constructor(
    readonly layout: Layout,
    readonly players: PlayerSetup[],
    private readonly opts: StageOptions,
  ) {
    this.world = new WorldScene(layout, opts.quality);
    this.particles = new ParticlePool(this.scene, 220, opts.quality.particles);
    this.buildAltar();
    this.ring.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 8, 28), glow(0xffffff)));
    (this.ring.children[0] as THREE.Mesh).rotation.x = Math.PI / 2;
    this.scene.add(this.ring);
    this.die = this.buildDie();
    this.die.visible = false;
    this.scene.add(this.die);
    players.forEach((p, i) => {
      const rig = createCharacter(p.character);
      if (opts.cosmeticFor === p.id) {
        if (opts.hat) rig.setHat(opts.hat as HatId);
        if (opts.trail) rig.setTrail(parseInt(opts.trail.replace('#', ''), 16));
      }
      this.rigs.set(p.id, rig);
      this.scene.add(rig.root);
      this.at.set(p.id, layout.start);
      const tag = this.makeTag(p.name, i);
      this.tags.set(p.id, tag);
      this.scene.add(tag);
    });
    this.arrangeAll();
    this.camPos.copy(this.overviewPos());
    this.camLook.copy(this.world.board.center);
    this.camera.position.copy(this.camPos);
  }

  // ------------------------------------------------------------------ Aufbau
  private makeTag(name: string, i: number): THREE.Sprite {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const g = c.getContext('2d');
    if (g) {
      g.fillStyle = 'rgba(12,10,36,0.82)';
      g.beginPath();
      g.roundRect(4, 6, 248, 52, 26);
      g.fill();
      g.lineWidth = 4;
      g.strokeStyle = playerColor(i);
      g.stroke();
      g.fillStyle = playerColor(i);
      g.font = '800 30px system-ui, sans-serif';
      g.textBaseline = 'middle';
      g.fillText(PLAYER_SYMBOLS[i % 4] ?? '', 22, 33);
      g.fillStyle = '#fff';
      g.fillText(name.slice(0, 11), 62, 34);
    }
    const tex = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }),
    );
    s.scale.set(2.8, 0.7, 1);
    s.renderOrder = 20;
    return s;
  }

  private buildAltar(): void {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.85),
      toon(0xffd23f, { emissive: 0xffa400, emissiveIntensity: 0.6 }),
    );
    crystal.position.y = 2.1;
    crystal.scale.y = 1.4;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 0.7, 6), toon(0xd9b36a));
    base.position.y = 0.7;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 6, 30), glow(0xffe27a));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 1.3;
    this.altar.add(crystal, base, halo);
    this.altar.userData = { crystal, halo };
    this.scene.add(this.altar);
  }

  private buildDie(): THREE.Group {
    const skin = DICE_SKINS[this.opts.dice] ?? DICE_SKINS['klassisch']!;
    const g = new THREE.Group();
    const mats = FACE_VALUES.map((v) => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d');
      if (x) {
        x.fillStyle = '#' + skin.body.toString(16).padStart(6, '0');
        x.fillRect(0, 0, 128, 128);
        x.strokeStyle = '#' + skin.edge.toString(16).padStart(6, '0');
        x.lineWidth = 10;
        x.strokeRect(5, 5, 118, 118);
        x.fillStyle = skin.pip;
        for (const [px, py] of PIPS[v] ?? []) {
          x.beginPath();
          x.arc(64 + px * 30, 64 + py * 30, 11, 0, 7);
          x.fill();
        }
      }
      return new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(c) });
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), mats);
    m.castShadow = true;
    g.add(m);
    this.dieMeshes.push(m);
    const m2 = m.clone();
    g.add(m2);
    this.dieMeshes.push(m2);
    return g;
  }

  // ------------------------------------------------------------------ Hilfen
  private nodeVec(node: number, out = V()): THREE.Vector3 {
    return this.world.board.nodePos(node, out);
  }
  private tween(dur: number, fn: (k: number) => void): Promise<void> {
    const d = this.opts.calm ? dur * 0.6 : dur;
    return new Promise((resolve) => this.tweens.push({ t: 0, dur: Math.max(0.001, d), fn, done: resolve }));
  }
  wait(sec: number): Promise<void> {
    return this.tween(sec, () => undefined);
  }
  positionOf(id: string): number {
    return this.at.get(id) ?? this.layout.start;
  }

  /** Verteilt mehrere Figuren auf einem Feld im Kreis */
  private restPos(id: string, out = V()): THREE.Vector3 {
    const node = this.positionOf(id);
    const here = this.players.filter((p) => this.positionOf(p.id) === node);
    const n = here.length;
    const idx = here.findIndex((p) => p.id === id);
    this.nodeVec(node, out);
    if (n > 1) {
      const a = (idx / n) * Math.PI * 2 + 0.6;
      out.x += Math.cos(a) * 0.62;
      out.z += Math.sin(a) * 0.62;
    }
    return out;
  }
  arrangeAll(): void {
    for (const p of this.players) this.rigs.get(p.id)?.root.position.copy(this.restPos(p.id));
  }
  place(id: string, node: number): void {
    this.at.set(id, node);
    this.arrangeAll();
  }
  setAltar(node: number): void {
    this.nodeVec(node, this.altar.position);
    this.altar.position.y -= 0.35;
  }
  setFold(phase: number, instant = false): void {
    this.world.board.setPhase(phase, instant);
  }
  highlight(ids: number[]): void {
    this.world.board.highlight(ids);
  }
  setActive(id: string | null): void {
    this.active = id;
  }

  // ------------------------------------------------------------------ Kamera
  private overviewPos(): THREE.Vector3 {
    const b = this.world.board;
    const dist = b.radius * 1.55 * this.zoom;
    const yaw = this.baseYaw + this.yawOffset;
    const pitch = 0.9;
    return new THREE.Vector3(
      b.center.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      b.center.y + Math.sin(pitch) * dist,
      b.center.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    );
  }
  viewOverview(): void {
    this.mode = { kind: 'overview' };
  }
  viewFollow(id: string): void {
    this.mode = { kind: 'follow', id };
  }
  viewFocus(node: number, dist = 13): void {
    this.mode = { kind: 'focus', p: this.nodeVec(node), dist };
  }
  /** Kamerawackeln (nur wenn in den Optionen erlaubt) */
  shake(a = 0.35, sec = 0.4): void {
    if (!this.opts.shake || this.opts.calm) return;
    this.shakeA = a;
    this.shakeT = sec;
  }
  orbit(dx: number): void {
    this.yawOffset += dx;
  }
  zoomBy(f: number): void {
    this.zoom = Math.min(1.8, Math.max(0.55, this.zoom * f));
  }

  private updateCamera(dt: number): void {
    const b = this.world.board;
    const want = V();
    const look = V();
    const yaw = this.baseYaw + this.yawOffset;
    if (this.mode.kind === 'overview') {
      want.copy(this.overviewPos());
      look.copy(b.center);
      if (!this.opts.calm) want.x += Math.sin(this.t * 0.1) * 1.5;
    } else {
      const p =
        this.mode.kind === 'follow' ? (this.rigs.get(this.mode.id)?.root.position ?? b.center) : this.mode.p;
      const dist = (this.mode.kind === 'focus' ? this.mode.dist : 16) * this.zoom;
      look.copy(p).y += 1;
      const pitch = 0.62;
      want.set(
        look.x + Math.sin(yaw) * Math.cos(pitch) * dist,
        look.y + Math.sin(pitch) * dist,
        look.z + Math.cos(yaw) * Math.cos(pitch) * dist,
      );
    }
    const k = 1 - Math.exp(-dt * 3.2);
    this.camPos.lerp(want, k);
    this.camLook.lerp(look, k * 1.3 > 1 ? 1 : k * 1.3);
    this.camera.position.copy(this.camPos);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeA * Math.max(0, this.shakeT);
      this.camera.position.x += (Math.random() - 0.5) * a;
      this.camera.position.y += (Math.random() - 0.5) * a;
    }
    this.camera.lookAt(this.camLook);
  }

  // ------------------------------------------------------------------ Animationen
  async hop(id: string, toNode: number): Promise<void> {
    const rig = this.rigs.get(id);
    if (!rig) return;
    const from = rig.root.position.clone();
    this.at.set(id, toNode);
    const to = this.restPos(id);
    const dir = Math.atan2(to.x - from.x, to.z - from.z);
    if (Math.hypot(to.x - from.x, to.z - from.z) > 0.01) rig.faceTowards(dir);
    rig.play('walk');
    const dist = from.distanceTo(to);
    await this.tween(Math.min(0.75, 0.22 + dist * 0.045), (k) => {
      rig.root.position.lerpVectors(from, to, k);
      rig.root.position.y += Math.sin(k * Math.PI) * (0.5 + Math.min(1.2, dist * 0.1));
    });
    rig.root.position.copy(to);
    rig.play('idle');
    this.particles.burst(to, 0xffffff, 3);
  }

  async teleport(id: string, toNode: number): Promise<void> {
    const rig = this.rigs.get(id);
    if (!rig) return;
    rig.play('teleportOut');
    this.particles.burst(rig.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x9a7bff, 24);
    await this.wait(0.7);
    this.at.set(id, toNode);
    this.arrangeAll();
    this.viewFocus(toNode);
    rig.play('teleportIn');
    this.particles.burst(rig.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x35f0ff, 24);
    await this.wait(0.7);
    rig.play('idle');
  }

  async swap(a: string, b: string): Promise<void> {
    const ra = this.rigs.get(a);
    const rb = this.rigs.get(b);
    if (!ra || !rb) return;
    const na = this.positionOf(a);
    const nb = this.positionOf(b);
    ra.play('shock');
    rb.play('shock');
    await this.wait(0.4);
    this.at.set(a, nb);
    this.at.set(b, na);
    this.arrangeAll();
    this.particles.burst(ra.root.position.clone().setY(ra.root.position.y + 1), 0xff7be0, 18);
    this.particles.burst(rb.root.position.clone().setY(rb.root.position.y + 1), 0xff7be0, 18);
    await this.wait(0.4);
    ra.play('idle');
    rb.play('idle');
  }

  react(
    id: string,
    anim: 'celebrate' | 'lose' | 'cheer' | 'shock' | 'dance' | 'win' | 'point' | 'roll' | 'jump',
  ): void {
    this.rigs.get(id)?.play(anim);
  }
  burstAt(id: string, color: number, n = 14): void {
    const r = this.rigs.get(id);
    if (r) this.particles.burst(r.root.position.clone().setY(r.root.position.y + 1.4), color, n);
  }
  burstNode(node: number, color: number, n = 18): void {
    this.particles.burst(this.nodeVec(node).setY(this.nodeVec(node).y + 1), color, n);
  }

  /** Würfel erscheint über der Figur, wirbelt und landet auf den gewürfelten Augen */
  async rollDice(id: string, dice: number[]): Promise<void> {
    const rig = this.rigs.get(id);
    if (!rig) return;
    rig.play('roll');
    const base = rig.root.position.clone().add(new THREE.Vector3(0, 3.4, 0));
    this.die.visible = true;
    this.dieMeshes.forEach((m, i) => (m.visible = i < dice.length));
    const spreadX = dice.length > 1 ? 0.95 : 0;
    const starts = dice.map(() =>
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      ),
    );
    const spin = dice.map(() =>
      new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    );
    const targets = dice.map((v) =>
      faceUp(Math.min(6, Math.max(1, v))).premultiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 1.2),
      ),
    );
    const camRight = new THREE.Vector3()
      .subVectors(this.camera.position, base)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize();
    await this.tween(1.15, (k) => {
      dice.forEach((_, i) => {
        const m = this.dieMeshes[i];
        if (!m) return;
        const off = (i - (dice.length - 1) / 2) * spreadX * 2;
        m.position.copy(camRight).multiplyScalar(off).add(base);
        m.position.y += Math.abs(Math.sin(k * Math.PI * 2.5)) * (1 - k) * 1.8 + (1 - k) * 0.6;
        const spinQ = new THREE.Quaternion().setFromAxisAngle(spin[i] as THREE.Vector3, (1 - k) * 14);
        m.quaternion
          .copy(starts[i] as THREE.Quaternion)
          .slerp(targets[i] as THREE.Quaternion, Math.min(1, k * 1.6))
          .premultiply(spinQ);
        if (k > 0.85) m.quaternion.copy(targets[i] as THREE.Quaternion);
      });
    });
    this.particles.burst(base.clone().setY(base.y - 0.4), 0xffffff, 10);
    await this.wait(0.45);
  }
  hideDice(): void {
    this.die.visible = false;
  }

  // ------------------------------------------------------------------ Abfragen
  /** Weltposition → Bildschirm (Pixel relativ zum Canvas) */
  project(p: THREE.Vector3, w: number, h: number): { x: number; y: number; visible: boolean } {
    const v = p.clone().project(this.camera);
    return {
      x: ((v.x + 1) / 2) * w,
      y: ((1 - v.y) / 2) * h,
      visible: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2,
    };
  }
  tokenHead(id: string): THREE.Vector3 {
    const r = this.rigs.get(id);
    return r ? r.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)) : new THREE.Vector3();
  }
  /** Welches Feld liegt unter dem Zeiger (NDC −1…1)? Nur Felder aus `only` zählen (oder alle). */
  pickNode(ndcX: number, ndcY: number, only?: number[]): number | null {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    let best: number | null = null;
    let bestD = Infinity;
    const ray = this.raycaster.ray;
    const v = V();
    for (const n of this.layout.nodes) {
      if (only && !only.includes(n.id)) continue;
      v.set(n.pos[0], n.pos[1] + 0.8, n.pos[2]);
      const d = ray.distanceToPoint(v);
      const along = v.distanceTo(ray.origin);
      // Toleranz wächst mit der Entfernung (Finger sind groß)
      if (d < 1.4 + along * 0.025 && d < bestD) {
        bestD = d;
        best = n.id;
      }
    }
    return best;
  }

  // ------------------------------------------------------------------ Schleife
  update(dt: number): void {
    this.t += dt;
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i] as Tween;
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k * k * (3 - 2 * k));
      if (k >= 1) {
        this.tweens.splice(i, 1);
        tw.done();
      }
    }
    this.world.update(dt, this.camera.position);
    this.particles.update(dt);
    for (const [id, rig] of this.rigs) {
      rig.update(dt);
      const tag = this.tags.get(id);
      if (tag) {
        tag.position.copy(rig.root.position);
        tag.position.y += 2.55;
        const d = tag.position.distanceTo(this.camera.position);
        const s = Math.min(2.4, Math.max(0.8, d * 0.085));
        tag.scale.set(2.8 * s * 0.55, 0.7 * s * 0.55, 1);
      }
    }
    // Aktiv-Ring unter der Figur
    const a = this.active ? this.rigs.get(this.active) : null;
    this.ring.visible = !!a;
    if (a && this.active) {
      this.ring.position.copy(a.root.position).setY(a.root.position.y + 0.12);
      this.ring.rotation.y += dt * 2;
      const idx = this.players.findIndex((p) => p.id === this.active);
      ((this.ring.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(
        playerColorHex(idx),
      );
      const pulse = 1 + Math.sin(this.t * 5) * 0.08;
      this.ring.scale.setScalar(pulse);
    }
    const crystal = this.altar.userData.crystal as THREE.Object3D;
    crystal.rotation.y += dt * 1.4;
    crystal.position.y = 2.1 + Math.sin(this.t * 2) * 0.15;
    (this.altar.userData.halo as THREE.Object3D).rotation.z += dt;
    this.updateCamera(dt);
  }

  dispose(): void {
    for (const r of this.rigs.values()) r.dispose();
    this.particles.dispose();
    this.world.dispose();
    this.die.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.material)
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => {
          (x as THREE.MeshToonMaterial).map?.dispose();
          x.dispose();
        });
    });
    for (const s of this.tags.values()) {
      s.material.map?.dispose();
      s.material.dispose();
    }
    this.tweens = [];
  }
}
