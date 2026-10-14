/* Spiel-Kern: Szene, Schleife, Welt-Streaming, Spieler, Kamera, Spielstand, Schnittstelle für alle Systeme. */
import type { GameApi, Vec3 } from './core/api.ts';
import { EventBus } from './core/events.ts';
import { logError } from './core/log.ts';
import { clamp } from './core/math.ts';
import { Avatar } from './characters/avatar.ts';
import { DEFAULT_APPEARANCE } from './characters/appearance.ts';
import { globalUniforms } from './engine/materials.ts';
import { autoQuality, isMobile, Renderer, type QualityName, PROFILES } from './engine/renderer.ts';
import { Environment } from './engine/sky.ts';
import { Water } from './engine/water.ts';
import { Particles } from './engine/particles.ts';
import { CameraRig } from './gameplay/camera.ts';
import { InteractSystem, type Interactable } from './gameplay/interact.ts';
import { Player } from './gameplay/player.ts';
import { Input } from './input/input.ts';
import { levelFromXp, type SaveData, type SaveStore, type Settings } from './persistence/save.ts';
import { buildBridges } from './world/bridges.ts';
import { Physics } from './world/physics.ts';
import { WorldManager, type LoadedWorld, type WorldDef, type Zone } from './world/registry.ts';
import { TerrainField } from './world/terrain.ts';
import { ITEMS, itemIcon, itemName } from './data/items.ts';

export interface GameSystem {
  id: string;
  update?(dt: number, t: number): void;
  onStart?(): void;
  onWorldLoad?(w: LoadedWorld): void;
  onWorldUnload?(id: string): void;
  onEnterWorld?(w: WorldDef): void;
  onZone?(z: Zone | null): void;
  /** Vor dem Speichern Zustand in den Spielstand schreiben. */
  persist?(): void;
}

export type Phase = 'boot' | 'title' | 'editor' | 'play';

export class Game implements GameApi {
  readonly events = new EventBus();
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: Renderer;
  readonly physics = new Physics();
  readonly field = new TerrainField();
  readonly interact = new InteractSystem();
  readonly worlds: WorldManager;
  readonly env: Environment;
  readonly water: Water;
  readonly fx: Particles;
  readonly input: Input;
  readonly rig: CameraRig;
  player!: Player;
  avatar!: Avatar;
  save!: SaveData;
  settings: Settings;
  phase: Phase = 'boot';
  time = 0;
  paused = false;
  /** Blockiert Bewegung (Dialog, Menü, Minispiel). */
  busy = 0;
  private systems: GameSystem[] = [];
  readonly panels: Record<string, (arg?: unknown) => void> = {};
  currentWorld: WorldDef | null = null;
  currentZone: Zone | null = null;
  nearest: Interactable | null = null;
  private last = performance.now();
  private saveTimer = 0;
  private titleT = 0;
  readonly mobile = isMobile();
  private running = false;
  onToast: ((text: string, icon?: string, ms?: number, big?: boolean) => void) | null = null;
  onBark: ((name: string, text: string, icon?: string) => void) | null = null;
  onBanner: ((title: string, sub: string) => void) | null = null;
  onFrame: ((dt: number) => void) | null = null;
  /** Zusätzliche Ansichten (Editor-Vorschau) können das Rendern übernehmen. */
  renderOverride: ((dt: number) => boolean) | null = null;
  vehicleCheck: (() => boolean) = () => false;
  sfxHook: ((name: string, vol?: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, readonly store: SaveStore, settings: Settings) {
    this.settings = settings;
    const q: QualityName = settings.quality === 'auto' ? autoQuality() : settings.quality;
    this.renderer = new Renderer(canvas, q, settings.quality === 'auto');
    const P = this.renderer.profile;
    this.camera = new THREE.PerspectiveCamera(this.mobile ? 62 : 58, window.innerWidth / window.innerHeight, 0.3, P.far);
    this.env = new Environment(this.scene, P);
    this.water = new Water(P);
    this.scene.add(this.water.mesh);
    this.fx = new Particles(this.scene, P.particles);
    this.physics.terrain = this.field.height;
    this.worlds = new WorldManager(this.scene, this.field, this.physics, this.interact, () => this, P);
    this.worlds.onLoad = w => { for (const s of this.systems) try { s.onWorldLoad?.(w); } catch (e) { logError('onWorldLoad ' + s.id, e); } };
    this.worlds.onUnload = id => { for (const s of this.systems) try { s.onWorldUnload?.(id); } catch (e) { logError('onWorldUnload ' + s.id, e); } };
    this.input = new Input(canvas);
    this.input.setKeys(settings.keys);
    this.input.invertY = settings.invertY;
    this.input.sens = settings.camSens;
    this.rig = new CameraRig(this.camera, this.physics);
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.onResize(), 200));
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.phase === 'play') this.persist(); });
    window.addEventListener('pagehide', () => { if (this.phase === 'play') this.persist(); });
  }
  get mode(): 'story' | 'free' { return this.save?.mode ?? 'free'; }
  addSystem<T extends GameSystem>(s: T): T { this.systems.push(s); return s; }
  system<T extends GameSystem>(id: string): T | undefined { return this.systems.find(s => s.id === id) as T | undefined; }

  registerWorlds(defs: WorldDef[]): void {
    for (const d of defs) this.worlds.register(d);
    this.worlds.buildProxies();
    const names: Record<string, { name: string; icon: string }> = {};
    for (const d of defs) names[d.id] = { name: d.name, icon: d.icon };
    buildBridges(this.scene, this.physics, this.field.height, names);
  }

  onResize(): void {
    this.renderer.resize();
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  setQuality(q: Settings['quality']): void {
    this.settings.quality = q;
    const name: QualityName = q === 'auto' ? autoQuality() : q;
    this.renderer.setQuality(name, q === 'auto');
    this.env.configureShadow(PROFILES[name]);
    this.camera.far = PROFILES[name].far; this.camera.updateProjectionMatrix();
    this.worlds.profile = PROFILES[name];
    this.store.saveSettings(this.settings);
  }

  /* ---------- Ablauf ---------- */
  startLoop(): void {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      requestAnimationFrame(tick);
      const now = performance.now();
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (dt > 0.1) dt = 0.1;
      try { this.frame(dt); } catch (e) { logError('Bild', e); }
    };
    requestAnimationFrame(tick);
  }
  /** Titelbildschirm: die Hauptinsel dreht sich im Hintergrund. */
  enterTitle(): void {
    this.phase = 'title';
    this.paused = false;
    if (this.avatar) this.avatar.root.visible = false;
    this.worlds.stream(0, 0, true);
    this.env.t = 0.36;
  }
  /** Spielstand starten. */
  start(save: SaveData): void {
    this.save = save;
    this.time = 0;
    this.env.t = save.clock.t;
    if (!this.avatar) {
      this.avatar = new Avatar(save.look ?? DEFAULT_APPEARANCE, true);
      this.scene.add(this.avatar.root);
      this.player = new Player(this.avatar, this.physics, { has: id => this.hasAbility(id) });
      this.player.onJump = d => this.sfx(d ? 'jump2' : 'jump', 0.5);
      this.player.onLand = fall => { if (fall > 2.5) { this.sfx('land', 0.4); this.fx.puff(this.player.pos.x, this.player.pos.y, this.player.pos.z, 0xe8dcc0, 8); } };
      this.player.onSplash = () => { this.sfx('splash', 0.6); this.fx.splash(this.player.pos.x, this.player.waterLevel, this.player.pos.z); };
    } else this.avatar.setLook(save.look);
    this.avatar.root.visible = true;
    const p = save.pos;
    const target = this.worlds.byId(p.world) ? p : { world: 'hub', x: 0, y: 2, z: 30, yaw: Math.PI };
    this.worlds.stream(target.x, target.z, true);
    this.player.teleport(target.x, target.z, target.yaw);
    this.rig.snapBehind(target.yaw);
    this.phase = 'play';
    this.currentWorld = null; this.currentZone = null;
    for (const s of this.systems) try { s.onStart?.(); } catch (e) { logError('onStart ' + s.id, e); }
    this.store.setMeta({ last: save.slot });
  }
  persist(): boolean {
    if (!this.save || this.phase !== 'play') return false;
    const s = this.save;
    s.pos = { world: this.currentWorld?.id ?? 'hub', x: this.player.pos.x, y: this.player.pos.y, z: this.player.pos.z, yaw: this.player.yaw };
    s.clock.t = this.env.t;
    for (const sys of this.systems) try { sys.persist?.(); } catch (e) { logError('persist ' + sys.id, e); }
    const ok = this.store.save(s);
    if (!ok) this.toast('Speichern nicht möglich – der Browser erlaubt keinen Speicher. Du kannst weiterspielen.', '⚠️', 4000);
    return ok;
  }

  private frame(dt: number): void {
    this.time += dt;
    globalUniforms.uTime.value = this.time;
    this.input.poll();
    if (this.renderOverride && this.renderOverride(dt)) { this.input.endFrame(); return; }
    if (this.phase === 'title' || this.phase === 'boot') {
      this.titleT += dt * 0.05;
      const r = 120, cx = Math.cos(this.titleT) * r, cz = Math.sin(this.titleT) * r;
      this.camera.position.set(cx, 46, cz);
      this.camera.lookAt(0, 4, 0);
      this.env.update(dt, new THREE.Vector3(0, 0, 0), this.camera.position, false);
      this.water.update(this.camera.position, this.env.horizon, this.env.isNight);
      this.worlds.update(dt, this.time);
      this.fx.update(dt);
      this.renderer.gl.render(this.scene, this.camera);
      this.input.endFrame();
      return;
    }
    if (this.phase !== 'play') { this.renderer.gl.render(this.scene, this.camera); this.input.endFrame(); return; }
    const playing = !this.paused;
    if (playing) {
      const free = this.busy === 0 && !this.rig.inCinematic;
      this.save.playTime += dt;
      const inVeh = this.vehicleCheck();
      if (!inVeh) this.player.update(dt, this.input, this.rig.yaw, free);
      for (const s of this.systems) { try { s.update?.(dt, this.time); } catch (e) { logError('update ' + s.id, e); } }
      this.avatar.update(dt);
      // Welt/Zone
      const pp = this.player.pos;
      this.worlds.stream(pp.x, pp.z);
      this.worlds.update(dt, this.time);
      const w = this.worlds.worldAt(pp.x, pp.z, 6);
      if (w && w !== this.currentWorld) this.enterWorld(w);
      const z = this.worlds.zoneAt(pp.x, pp.z);
      if (z?.id !== this.currentZone?.id) {
        this.currentZone = z;
        if (z) this.toast(z.name, z.icon ?? '📍', 1800);
        for (const s of this.systems) try { s.onZone?.(z); } catch (e) { logError('onZone', e); }
      }
      // Interaktionen
      this.nearest = free ? this.interact.best(pp.x, pp.y, pp.z, this.player.yaw, inVeh) : null;
      if (free && this.nearest && this.input.pressed('action')) { const n = this.nearest; try { n.act(); } catch (e) { logError('Aktion ' + n.id, e); } }
      else if (free && this.nearest?.alt && this.input.pressed('action2')) { try { this.nearest.alt.act(); } catch (e) { logError('Aktion2', e); } }
      if (this.input.pressed('camera')) this.rig.cyclePreset();
      // Dächer ausblenden, wenn man drinnen ist
      this.updateRoofs(dt);
      // Kamera
      const moving = this.player.speed > 0.5 || inVeh;
      if (!inVeh) this.rig.update(dt, pp, this.player.yaw, moving && free, this.input.lookX, this.input.lookY, this.input.zoom, this.avatar.height * 0.85);
      // Autosave
      this.saveTimer += dt;
      if (this.saveTimer > 25) { this.saveTimer = 0; this.persist(); }
    } else {
      this.rig.update(0.016, this.player.pos, this.player.yaw, false, this.input.lookX * 0.5, this.input.lookY * 0.5, 0, this.avatar.height * 0.85);
    }
    this.env.update(dt, this.player.pos, this.camera.position, playing && this.busy === 0);
    this.save.clock.t = this.env.t;
    this.water.update(this.camera.position, this.env.horizon, this.env.isNight);
    this.fx.update(dt);
    this.onFrame?.(dt);
    this.renderer.gl.render(this.scene, this.camera);
    this.renderer.track(dt);
    this.input.endFrame();
  }
  private enterWorld(w: WorldDef): void {
    const first = !this.save.visited.includes(w.id);
    this.currentWorld = w;
    if (first) { this.save.visited.push(w.id); this.addXp(25); }
    this.env.underground = !!w.underground;
    this.water.mesh.visible = !w.underground;
    this.onBanner?.(w.icon + ' ' + w.name, first ? 'Neu entdeckt! ' + w.desc : '');
    this.events.emit('enterWorld', { world: w.id });
    for (const s of this.systems) try { s.onEnterWorld?.(w); } catch (e) { logError('onEnterWorld', e); }
  }
  private updateRoofs(dt: number): void {
    const p = this.player.pos;
    for (const r of this.worlds.houses) {
      const dx = p.x - r.x, dz = p.z - r.z;
      if (Math.abs(dx) > 20 || Math.abs(dz) > 20) { if (r.fade !== 1) { r.fade = 1; r.roof.visible = true; } continue; }
      const c = Math.cos(-r.rot), s = Math.sin(-r.rot), lx = dx * c + dz * s, lz = -dx * s + dz * c;
      const inside = Math.abs(lx) < r.w / 2 - 0.1 && Math.abs(lz) < r.d / 2 - 0.1 && p.y < r.y + 3;
      r.fade = clamp(r.fade + (inside ? -dt * 4 : dt * 4), 0, 1);
      r.roof.visible = r.fade > 0.5;
    }
  }

  /* ---------- GameApi ---------- */
  playerPos(): Vec3 { return this.player ? { x: this.player.pos.x, y: this.player.pos.y, z: this.player.pos.z } : { x: 0, y: 0, z: 0 }; }
  toast(text: string, icon?: string, ms?: number): void { this.onToast?.(text, icon, ms); }
  bigToast(text: string, icon?: string): void { this.onToast?.(text, icon, 3200, true); }
  bark(name: string, text: string, icon?: string): void { this.onBark?.(name, text, icon); }
  talk(npcId: string): void { this.panels.talk?.(npcId); }
  give(item: string, n = 1, silent = false): void {
    const inv = this.save.inventory;
    inv[item] = (inv[item] ?? 0) + n;
    if (!silent) this.toast('+' + n + ' ' + itemName(item), itemIcon(item), 1600);
    this.sfx('pickup', 0.5);
    this.events.emit('item', { id: item, count: n, total: inv[item] });
  }
  take(item: string, n = 1): boolean {
    const inv = this.save.inventory;
    if ((inv[item] ?? 0) < n) return false;
    inv[item] -= n;
    if (inv[item] <= 0) delete inv[item];
    this.events.emit('itemUsed', { id: item });
    return true;
  }
  has(item: string, n = 1): boolean { return (this.save.inventory[item] ?? 0) >= n; }
  count(item: string): number { return this.save.inventory[item] ?? 0; }
  addStars(n: number, why?: string): void {
    if (n === 0) return;
    this.save.stars = Math.max(0, this.save.stars + n);
    if (n > 0) { this.toast('+' + n + ' ⭐' + (why ? ' ' + why : ''), undefined, 1600); this.sfx('star', 0.6); }
    this.events.emit('stars', { delta: n, total: this.save.stars });
  }
  spendStars(n: number): boolean {
    if (this.save.stars < n) { this.toast('Dafür brauchst du ' + n + ' ⭐ – du hast ' + this.save.stars + '.', '⭐'); return false; }
    this.save.stars -= n; this.sfx('buy', 0.6);
    this.events.emit('stars', { delta: -n, total: this.save.stars });
    return true;
  }
  addXp(n: number): void {
    const before = levelFromXp(this.save.xp);
    this.save.xp += n;
    const after = levelFromXp(this.save.xp);
    if (after > before) {
      this.save.hp = Math.min(12, 5 + Math.floor((after - 1) / 3));
      this.bigToast('Stufe ' + after + '! Du bist noch stärker geworden.', '🌟');
      this.sfx('levelup', 0.8);
      this.fx.burst(this.player.pos.x, this.player.pos.y + 1, this.player.pos.z, [0xffd23f, 0xff6fb5, 0x7fd8ff], 40);
      this.events.emit('levelUp', { level: after });
    }
  }
  flag(id: string): number { return this.save.flags[id] ?? 0; }
  setFlag(id: string, v = 1): void { this.save.flags[id] = v; this.events.emit('flag', { id }); }
  hasAbility(id: string): boolean { return !!this.save?.abilities.includes(id); }
  unlockAbility(id: string): void {
    if (this.hasAbility(id)) return;
    this.save.abilities.push(id);
    this.events.emit('ability', { id });
    this.panels.ability?.(id);
  }
  unlockCosmetic(id: string): void { if (!this.save.cosmetics.includes(id)) { this.save.cosmetics.push(id); this.toast('Neu im Kleiderschrank!', '👕'); } }
  sfx(name: string, vol?: number): void { this.sfxHook?.(name, vol); }
  burst(x: number, y: number, z: number, colors: number[], n = 24): void { this.fx.burst(x, y, z, colors, n); }
  teleport(x: number, z: number, yaw?: number): void {
    this.worlds.stream(x, z, true);
    this.player.teleport(x, z, yaw);
    if (yaw !== undefined) this.rig.snapBehind(yaw);
  }
  startMinigame(id: string, opts?: Record<string, unknown>): void { this.panels['minigame']?.({ id, ...opts }); }
  collectOnce(id: string): boolean { if (this.save.collected.includes(id)) return false; this.save.collected.push(id); return true; }
  isCollected(id: string): boolean { return this.save.collected.includes(id); }
  achieve(id: string): void { this.panels.achieve?.(id); }
  questStage(id: string): number { return this.save.quests[id]?.stage ?? -1; }
  questDone(id: string): boolean { return !!this.save.quests[id]?.done; }
  startQuest(id: string): void { this.panels.startQuest?.(id); }
  focusCamera(x: number, y: number, z: number, sec: number): void { this.rig.showPoint(x, y, z, sec); }
  setNight(night: boolean): void { this.env.t = night ? 0.86 : 0.3; }
  isNight(): boolean { return this.env.isNight; }
  openShop(id: string): void { this.panels.shop?.(id); }
  openPanel(id: string, arg?: unknown): void {
    const p = this.panels[id];
    if (p) p(arg); else this.toast('Kommt bald: ' + id, '🛠️');
  }
  enterVehicle(id: string): void { this.panels.enterVehicle?.(id); }
  discover(id: string, name: string): void {
    if (this.save.discovered.includes(id)) return;
    this.save.discovered.push(id);
    this.addXp(10);
    this.toast('Entdeckt: ' + name, '🔭', 2200);
    this.events.emit('discover', { id });
  }
  itemDef(id: string) { return ITEMS[id]; }
}
