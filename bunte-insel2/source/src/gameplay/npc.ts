/* Bewohner: Persönlichkeit, Tagesablauf (tagsüber unterwegs, nachts zu Hause), Laufen ohne Festhängen,
   Hinwenden zum Spieler, Namensschild in der Nähe, Freundschaft. Werden mit ihrer Welt geladen. */
import type { Game, GameSystem } from '../game.ts';
import { Avatar, type Emote } from '../characters/avatar.ts';
import { type Appearance, DEFAULT_APPEARANCE, sanitizeAppearance } from '../characters/appearance.ts';
import { makeCreature, type Creature, type CreatureOpts } from '../characters/creatures.ts';
import { labelSprite } from '../engine/textures.ts';
import { damp, dampAngle, yawTo } from '../core/math.ts';
import { makeRng, strSeed } from '../core/rng.ts';
import type { DialogTree } from './quests.ts';
import type { Cond } from './script.ts';
import type { LoadedWorld } from '../world/registry.ts';

export interface NpcDef {
  id: string;
  name: string;
  world: string;
  x: number; z: number; yaw?: number;
  icon: string;                       // Porträt-Symbol
  role: string;                       // kurze Beschreibung („Bürgermeisterin“)
  look?: Partial<Appearance>;
  creature?: { kind: string } & CreatureOpts;
  wander?: number;                    // Radius in m (0 = steht)
  night?: { x: number; z: number } | 'stay' | 'sleep';
  greet: string[];                    // Begrüßungen (zufällig)
  chat: string[];                     // Plauder-Sätze
  likes?: string[];                   // Lieblingsgeschenke
  shop?: string;
  topics?: { label: string; to: string; if?: Cond }[];
  dialog?: DialogTree;
  emotes?: Emote[];
  /** Nur sichtbar, wenn erfüllt (z. B. erst nach einem Story-Ereignis). */
  when?: Cond;
  scale?: number;
  sound?: string;
}

export interface NpcRuntime {
  def: NpcDef;
  root: THREE.Group;
  avatar: Avatar | null;
  creature: Creature | null;
  pos: THREE.Vector3;
  yaw: number;
  target: { x: number; z: number } | null;
  wait: number;
  stuck: number;
  lastPos: { x: number; z: number };
  label: THREE.Sprite | null;
  talking: boolean;
  speed: number;
  home: { x: number; z: number };
  asleep: boolean;
  visible: boolean;
}

export class NpcSystem implements GameSystem {
  id = 'npc';
  readonly defs = new Map<string, NpcDef>();
  readonly live = new Map<string, NpcRuntime>();
  private rng = makeRng(77);
  talkingTo: string | null = null;
  constructor(private g: Game) { }
  register(list: NpcDef[]): void { for (const d of list) this.defs.set(d.id, d); }
  byWorld(world: string): NpcDef[] { return [...this.defs.values()].filter(d => d.world === world); }
  private visibleNow(d: NpcDef): boolean { return !d.when || (this.g.panels.__check ? true : true) && this.cond(d.when); }
  cond: (c: Cond | undefined) => boolean = () => true;

  onWorldLoad(w: LoadedWorld): void {
    for (const d of this.byWorld(w.def.id)) if (this.visibleNow(d)) this.spawn(d);
  }
  onWorldUnload(id: string): void {
    for (const [k, n] of this.live) if (n.def.world === id) this.despawn(k);
  }
  /** Prüft Sichtbarkeits-Bedingungen neu (nach Story-Ereignissen). */
  refresh(): void {
    for (const d of this.defs.values()) {
      if (!this.g.worlds.loaded.has(d.world)) continue;
      const vis = this.visibleNow(d);
      if (vis && !this.live.has(d.id)) this.spawn(d);
      if (!vis && this.live.has(d.id)) this.despawn(d.id);
    }
  }
  spawn(d: NpcDef): NpcRuntime {
    const root = new THREE.Group();
    let avatar: Avatar | null = null, creature: Creature | null = null;
    if (d.creature) { creature = makeCreature(d.creature.kind, d.creature); root.add(creature.root); }
    else {
      const seed = makeRng(strSeed(d.id));
      const look: Appearance = sanitizeAppearance({ ...DEFAULT_APPEARANCE, hair: ['kurz', 'zopf', 'locken', 'bob', 'dutt', 'strubbel', 'lang'][Math.floor(seed() * 7)], hairColor: Math.floor(seed() * 10), topColor: Math.floor(seed() * 16), bottomColor: Math.floor(seed() * 16), skin: Math.floor(seed() * 8), pattern: 'none', age: 2, ...d.look });
      avatar = new Avatar(look, true);
      root.add(avatar.root);
    }
    if (d.scale) root.scale.setScalar(d.scale);
    const y = this.g.physics.ground(d.x, d.z, 100).y;
    const pos = new THREE.Vector3(d.x, y, d.z);
    root.position.copy(pos);
    this.g.scene.add(root);
    const n: NpcRuntime = { def: d, root, avatar, creature, pos, yaw: d.yaw ?? 0, target: null, wait: 1 + this.rng() * 3, stuck: 0, lastPos: { x: d.x, z: d.z }, label: null, talking: false, speed: 0, home: { x: d.x, z: d.z }, asleep: false, visible: true };
    this.live.set(d.id, n);
    this.g.interact.add({
      id: 'npc:' + d.id, tag: d.world, x: d.x, y, z: d.z, r: 3.2, icon: '💬', priority: 1,
      label: () => (n.asleep ? 'Leise ansprechen: ' : 'Reden mit ') + d.name,
      act: () => this.g.talk(d.id)
    });
    return n;
  }
  despawn(id: string): void {
    const n = this.live.get(id);
    if (!n) return;
    n.avatar?.dispose(); n.creature?.dispose();
    if (n.label) { n.label.material.map?.dispose(); n.label.material.dispose(); }
    n.root.parent?.remove(n.root);
    this.g.interact.remove('npc:' + id);
    this.live.delete(id);
  }
  /** Zielpunkt suchen: innerhalb des Wanderradius, auf Land, nicht in Gebäuden. */
  private pickTarget(n: NpcRuntime): void {
    const r = n.def.wander ?? 6;
    for (let i = 0; i < 8; i++) {
      const a = this.rng() * Math.PI * 2, d = 2 + this.rng() * r, x = n.home.x + Math.cos(a) * d, z = n.home.z + Math.sin(a) * d;
      const g = this.g.physics.ground(x, z, n.pos.y + 0.5);
      if (g.water > g.y + 0.3) continue;
      if (Math.abs(g.y - n.pos.y) > 1.2) continue;
      n.target = { x, z }; return;
    }
    n.target = null;
  }
  face(id: string, x: number, z: number): void { const n = this.live.get(id); if (n) n.yaw = yawTo(n.pos.x, n.pos.z, x, z); }
  emote(id: string, e: Emote, dur = 1.6): void { const n = this.live.get(id); n?.avatar?.play(e, dur); if (n?.creature) n.creature.mood?.('happy'); }
  update(dt: number): void {
    const p = this.g.player.pos, range = this.g.renderer.profile.npcRange, night = this.g.env.isNight;
    for (const n of this.live.values()) {
      const d = Math.hypot(n.pos.x - p.x, n.pos.z - p.z);
      const vis = d < range;
      if (vis !== n.visible) { n.visible = vis; n.root.visible = vis; }
      if (!vis) continue;
      const nearPlayer = d < 4.5;
      n.talking = this.talkingTo === n.def.id;
      // Nacht: nach Hause und schlafen
      const sleeper = night && n.def.night !== 'stay';
      if (sleeper && !n.asleep) {
        const home = n.def.night && typeof n.def.night === 'object' ? n.def.night : n.home;
        if (Math.hypot(n.pos.x - home.x, n.pos.z - home.z) > 1.5) n.target = { ...home };
        else { n.asleep = true; n.target = null; }
      }
      if (!night && n.asleep) { n.asleep = false; n.avatar?.play('cheer', 1); }
      let moveSpeed = 0;
      if (n.talking || (nearPlayer && !sleeper)) {
        n.target = n.talking ? null : n.target;
        const want = yawTo(n.pos.x, n.pos.z, p.x, p.z);
        n.yaw = dampAngle(n.yaw, want, 6, dt);
        if (!n.talking && n.wait < 1) n.wait = 1.5;
      } else if (n.target) {
        const dx = n.target.x - n.pos.x, dz = n.target.z - n.pos.z, L = Math.hypot(dx, dz);
        if (L < 0.4) { n.target = null; n.wait = 2 + this.rng() * 5; }
        else {
          moveSpeed = sleeper ? 2.6 : 1.5;
          n.yaw = dampAngle(n.yaw, Math.atan2(dx, dz), 5, dt);
          const fx = Math.sin(n.yaw), fz = Math.cos(n.yaw);
          this.g.physics.move(n.pos, fx * moveSpeed * dt, fz * moveSpeed * dt, 0.35, 1.6);
          // festgehangen? → neues Ziel
          const prog = Math.hypot(n.pos.x - n.lastPos.x, n.pos.z - n.lastPos.z);
          if (prog < moveSpeed * dt * 0.3) { n.stuck += dt; if (n.stuck > 0.8) { n.stuck = 0; n.target = null; n.wait = 0.5; if (sleeper) { n.pos.x = n.home.x; n.pos.z = n.home.z; } } }
          else n.stuck = 0;
          n.lastPos = { x: n.pos.x, z: n.pos.z };
        }
      } else if (!n.asleep) {
        n.wait -= dt;
        if (n.wait <= 0 && (n.def.wander ?? 6) > 0) this.pickTarget(n);
        else if (n.wait <= 0) { n.wait = 4 + this.rng() * 6; const e = n.def.emotes; if (e?.length && this.rng() < 0.5) n.avatar?.play(e[Math.floor(this.rng() * e.length)], 2); }
      }
      n.speed = damp(n.speed, moveSpeed, 8, dt);
      const gy = this.g.physics.ground(n.pos.x, n.pos.z, n.pos.y + 0.3);
      n.pos.y = damp(n.pos.y, Math.max(gy.y, gy.water - 1.0 > gy.y ? gy.water - 1.0 : gy.y), 12, dt);
      n.root.position.copy(n.pos);
      n.root.rotation.y = n.yaw;
      if (n.avatar) {
        n.avatar.pose = n.asleep ? 'sleep' : n.speed > 0.2 ? 'walk' : 'idle';
        n.avatar.speed = n.speed;
        if (n.talking && !n.avatar.emoting && Math.random() < dt * 0.8) n.avatar.play('talk', 1.2);
        n.avatar.update(dt);
        n.avatar.setDetail(d < 30);
      }
      if (n.creature) { n.creature.mood?.(n.asleep ? 'sleep' : n.talking || nearPlayer ? 'happy' : 'idle'); n.creature.update(dt, n.speed); }
      // Interaktion folgt der Figur
      const ia = this.g.interact.get('npc:' + n.def.id);
      if (ia) { ia.x = n.pos.x; ia.y = n.pos.y; ia.z = n.pos.z; }
      // Namensschild in der Nähe
      const showLabel = d < 11;
      if (showLabel && !n.label) {
        n.label = labelSprite(n.def.name, 0.42, { icon: n.def.icon, sub: n.def.role, size: 48 });
        n.label.position.y = (n.avatar?.height ?? n.creature?.height ?? 1.6) + 0.55;
        n.root.add(n.label);
      }
      if (n.label) n.label.visible = showLabel && !n.talking;
      if (n.asleep && n.label) n.label.visible = false;
      if (n.asleep && Math.random() < dt * 0.6) this.g.fx.emit(n.pos.x, n.pos.y + 1.8, n.pos.z, 0.2, 0.6, 0, 0xbfd8ff, 0.3, 1.5, -0.2);
    }
  }
}
