// Ein laufendes Match auf dem Client: Darstellung, Eingabe (fester 30-Hz-Takt), Effekte, Klang, HUD, Overlays.
import * as THREE from 'three';
import { BUILD_COST, BUS_HEIGHT, DT, MAP_SIZE, PLAYER_HEIGHT, TICK_RATE, WATER_LEVEL } from '../../../shared/src/constants';
import { computePlacement } from '../../../shared/src/building';
import { GRENADE_ID, WEAPONS, consumable, itemName, weapon } from '../../../shared/src/items';
import { Sfx, type MatchEvent } from '../../../shared/src/match';
import { clamp, lerp } from '../../../shared/src/math';
import { bodyHeight } from '../../../shared/src/movement';
import { Kind } from '../../../shared/src/pieces';
import { PF, type Frame, type NetPlayer } from '../../../shared/src/protocol';
import { getTerrain } from '../../../shared/src/terrain';
import { Act, Btn, Mode, Phase, packAct, type PlacementResult, type PlayerInput } from '../../../shared/src/types';
import { EMOTES, OUTFITS, VICTORY_POSES } from '../../../shared/src/cosmetics';
import { audio, type SoundName } from '../audio/audio';
import { h, isTouchDevice } from '../core/dom';
import { profile } from '../core/profile';
import { keyLabel, rarityColor, settings } from '../core/settings';
import { GamepadInput } from '../input/gamepad';
import { Input } from '../input/input';
import { TouchControls } from '../input/touch';
import { LocalTransport } from '../net/local';
import type { Transport } from '../net/transport';
import { ThirdPersonCamera } from '../render/camera';
import { CharacterRig, CrowdLod, type CharState } from '../render/characters';
import { Flashes, ItemViews, Particles, StormWall, Tracers, makeAirship, makeBuggy, makeGrenade, makeRocket } from '../render/fx';
import type { QualityProfile } from '../render/quality';
import type { Renderer3D } from '../render/renderer';
import { Sky } from '../render/sky';
import { StructureView } from '../render/structures';
import { ColorMap, TerrainView } from '../render/terrain';
import { DecorView } from '../render/decor';
import { Vegetation } from '../render/vegetation';
import { Hud, type MateInfo } from '../ui/hud';
import { renderMapImage } from '../ui/mapimage';
import { EmoteWheel, InventoryView, MapView, pauseMenu, toast } from '../ui/overlays';
import { Session } from './session';

export interface GameOptions {
  renderer: Renderer3D;
  transport: Transport;
  online: boolean;
  modeLabel: string;
  ui: HTMLElement;
  colors: ColorMap;
  onEnd: (results: PlacementResult[], selfId: number, winnerTeam: number, session: Session) => void;
  onExit: (reason?: string) => void;
  openSettings: (onClose: () => void) => void;
}

interface RemoteView {
  rig: CharacterRig | null;
  lastX: number;
  lastZ: number;
  speed: number;
  stepT: number;
  lastSeen: number;
}

const SFX_MAP: Partial<Record<number, SoundName>> = {
  [Sfx.Jump]: 'jump',
  [Sfx.Land]: 'land',
  [Sfx.Glide]: 'glide',
  [Sfx.Pad]: 'pad',
  [Sfx.Splash]: 'splash',
  [Sfx.Reload]: 'reload',
  [Sfx.Heal]: 'heal',
  [Sfx.Shield]: 'shield',
  [Sfx.Build]: 'build',
  [Sfx.Door]: 'door',
  [Sfx.Chest]: 'chest',
  [Sfx.Pickup]: 'pickup',
  [Sfx.Enter]: 'enter',
  [Sfx.Crash]: 'crash',
  [Sfx.Slide]: 'slide',
  [Sfx.Climb]: 'climb',
  [Sfx.BusJump]: 'busJump',
  [Sfx.Empty]: 'empty',
};

const CAUSE_TEXT = ['', 'im Sturm', 'durch einen Sturz', 'durch eine Explosion', 'durch ein Fahrzeug', 'verblutet', 'hat das Match verlassen', 'mit der Spitzhacke'];

export class Game {
  readonly session: Session;
  private readonly R: Renderer3D;
  private readonly scene = new THREE.Scene();
  private readonly camera: ThirdPersonCamera;
  private readonly input = new Input();
  private readonly pad: GamepadInput;
  private readonly touch: TouchControls;
  private hud: Hud | null = null;
  private mapView: MapView | null = null;
  private readonly inv = new InventoryView();
  private readonly wheel = new EmoteWheel();
  private terrainView: TerrainView | null = null;
  private structures: StructureView | null = null;
  private vegetation: Vegetation | null = null;
  private decor: DecorView | null = null;
  private readonly items = new ItemViews();
  private sky: Sky;
  private readonly storm = new StormWall();
  private readonly airship = makeAirship();
  private readonly particles = new Particles();
  private readonly tracers = new Tracers();
  private readonly flashes = new Flashes();
  private readonly crowd = new CrowdLod();
  private readonly remotes = new Map<number, RemoteView>();
  private selfRig: CharacterRig | null = null;
  private readonly vehicles = new Map<number, THREE.Group>();
  private readonly projectiles = new Map<number, THREE.Object3D>();
  private readonly ghost: THREE.Mesh;
  private running = true;
  private acc = 0;
  private alpha = 0;
  private lastT = 0;
  private raf = 0;
  private fps = 60;
  private overlay: HTMLElement | null = null;
  private paused = false;
  private uiRoot: HTMLElement;
  private readonly opts: GameOptions;
  private pendingActs: number[] = [];
  private localFireCd = 0;
  private recoil = 0;
  private stepT = 0;
  private marker: { x: number; z: number } | null = null;
  private ended = false;
  private endTimer = -1;
  private eliminated = false;
  private spectList: number[] = [];
  private lastZoneShrink = false;
  private hourStart = 16;
  private matchTime = 0;
  private readonly tmpV = new THREE.Vector3();
  private readonly isTouch: boolean;
  private quality: QualityProfile;
  private worldReady = false;
  private lastSelfMode: Mode = Mode.Bus;
  private announcedJump = false;

  constructor(o: GameOptions) {
    this.opts = o;
    this.R = o.renderer;
    this.quality = this.R.profile;
    this.uiRoot = h('div', { style: 'position:fixed;inset:0' });
    o.ui.appendChild(this.uiRoot);
    this.camera = new ThirdPersonCamera(this.R.aspect);
    this.camera.baseFov = settings.data.fov;
    this.camera.reducedMotion = settings.data.reducedMotion;
    this.sky = new Sky(this.scene);
    this.pad = new GamepadInput(this.input);
    this.touch = new TouchControls(this.input);
    this.isTouch = isTouchDevice();
    document.body.classList.toggle('is-touch', this.isTouch);
    this.scene.add(this.items.group, this.storm.mesh, this.airship, this.particles.points, this.tracers.lines, this.flashes.group, this.crowd.mesh);
    this.ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x3ff2ff, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ghost.visible = false;
    this.scene.add(this.ghost);
    this.session = new Session(o.transport, o.online);
    this.session.handlers = {
      onStart: () => this.onWorldReady(),
      onEvents: (evs, f) => this.onEvents(evs, f),
      onResults: (r, w) => this.onResults(r, w),
      onWorldChanged: (ids) => this.structures?.apply(ids),
      onItems: () => this.items.sync(this.session.items, (r) => rarityColor(r, settings.data.colorblind)),
      onClose: (reason) => this.fail(reason),
    };
    this.input.attach(this.R.canvas);
    this.input.onPointerLockChange = (locked) => {
      if (!locked && !this.anyOverlay() && !this.ended && !this.isTouch && this.input.lastDevice === 'kb') this.togglePause(true);
    };
    this.uiRoot.append(this.inv.root, this.wheel.root);
    this.touch.show(false);
    this.wireOverlays();
    this.R.onQuality = (p) => this.applyQuality(p);
    audio.onViz = (k, x, z) => this.soundViz(k, x, z);
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private wireOverlays(): void {
    this.inv.onClose = () => this.closeOverlays();
    this.inv.onSwap = (a, b) => this.pendingActs.push(packAct(Act.Swap, a, b));
    this.inv.onDrop = (s) => this.pendingActs.push(packAct(Act.Drop, s));
    this.inv.onDropAmmo = (a) => this.pendingActs.push(packAct(Act.DropAmmo, a));
    this.inv.onSelect = (s) => {
      this.pendingActs.push(packAct(Act.Slot, s));
      this.closeOverlays();
    };
    this.wheel.onPick = (id) => {
      this.pendingActs.push(packAct(Act.Emote, id));
      this.closeOverlays();
    };
  }

  /** Welt wurde synchronisiert: Darstellung aufbauen */
  private onWorldReady(): void {
    if (this.worldReady) return;
    const s = this.session;
    const w = s.world!;
    this.terrainView = new TerrainView(getTerrain(), this.opts.colors);
    this.scene.add(this.terrainView.group);
    this.structures = new StructureView(w);
    this.scene.add(this.structures.group);
    this.vegetation = new Vegetation(getTerrain(), w);
    this.scene.add(this.vegetation.group);
    this.decor = new DecorView(s.content!.decor);
    this.scene.add(this.decor.group);
    const mapImg = renderMapImage(this.opts.colors, getTerrain(), w, 1024);
    this.hud = new Hud(mapImg);
    this.hud.onSlotTap = (n) => this.pendingActs.push(packAct(Act.Slot, n));
    this.hud.onSpectate = (d) => this.cycleSpectate(d);
    this.mapView = new MapView(mapImg);
    this.mapView.onClose = () => this.closeOverlays();
    this.mapView.onMarker = (x, z) => {
      this.marker = this.marker && Math.hypot(this.marker.x - x, this.marker.z - z) < 25 ? null : { x, z };
      audio.play('click');
    };
    this.uiRoot.prepend(this.hud.root);
    this.uiRoot.append(this.mapView.root, this.touch.root);
    this.touch.extraTap = (x, y) => {
      const el = document.elementsFromPoint(x, y).find((e) => e.classList.contains('slot'));
      if (el) {
        (el as HTMLElement).click();
        return true;
      }
      return false;
    };
    this.touch.show(this.isTouch);
    const cfg = s.config!;
    this.hourStart = cfg.timeOfDay;
    this.sky.hour = cfg.timeOfDay;
    this.sky.setWeather(cfg.weather);
    this.items.sync(s.items, (r) => rarityColor(r, settings.data.colorblind));
    this.applyQuality(this.R.profile);
    const bus = s.bus;
    this.camera.yaw = Math.atan2(-(bus.x1 - bus.x0), -(bus.z1 - bus.z0));
    this.terrainView.warm(new THREE.Vector3(bus.x0, 100, bus.z0));
    this.worldReady = true;
    audio.setMusic('game');
    this.hud.big('Riftzone', `${this.opts.modeLabel} · ${s.config!.maxPlayers} Spieler`, 3.5);
    if (!this.isTouch) this.input.requestLock();
  }

  private applyQuality(p: QualityProfile): void {
    this.quality = p;
    const vd = Math.min(p.viewDistance, settings.data.viewDistance * (p.viewDistance / 650));
    this.sky.viewDistance = Math.max(250, vd);
    this.sky.setShadows(p.shadows && settings.data.shadows, p.shadowSize);
    if (this.terrainView) {
      this.terrainView.viewDistance = Math.max(300, vd + 60);
      this.terrainView.lodBias = p.terrainLodBias;
    }
    if (this.structures) {
      this.structures.viewDistance = Math.max(250, vd);
      this.structures.shadows = p.shadows && settings.data.shadows;
    }
    if (this.vegetation) {
      this.vegetation.density = settings.data.grass ? p.grassDensity : 0;
      this.vegetation.reset();
    }
    this.particles.density = p.particles;
    this.camera.cam.far = vd + 600;
    this.camera.cam.updateProjectionMatrix();
  }

  // ---------------- Hauptschleife ----------------

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    let dt = (now - this.lastT) / 1000;
    const cap = settings.data.fpsCap;
    if (cap > 0 && dt < 1 / cap - 0.002) return;
    this.lastT = now;
    dt = Math.min(0.1, Math.max(0.0001, dt));
    this.fps = this.fps * 0.95 + (1 / dt) * 0.05;
    this.R.auto.sample(dt);
    this.R.resize();
    this.camera.cam.aspect = this.R.aspect;
    this.camera.cam.updateProjectionMatrix();
    const s = this.session;
    s.advance(dt);
    this.input.poll();
    const self = s.self;
    this.pad.poll(dt, !!self?.build, this.anyOverlay());
    this.handleShots();
    // Blick
    const [lx, ly] = this.input.takeLook();
    if (!this.anyOverlay()) this.camera.addLook(lx, ly);
    // Fester Takt für Eingaben/Vorhersage
    if (this.worldReady && !this.paused) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= DT && n < 5) {
        this.fixedTick();
        this.acc -= DT;
        n++;
      }
      if (n === 5) this.acc = 0;
      this.alpha = this.acc / DT;
    }
    this.render(dt);
  };

  private handleShots(): void {
    const shots = this.input.shots.splice(0);
    const s = this.session.self;
    for (const sh of shots) {
      if (sh.k === 'ui') {
        if (sh.a === 'pause') {
          if (this.anyOverlay()) this.closeOverlays();
          else this.togglePause(!this.paused);
        } else if (sh.a === 'map') this.toggleOverlay('map');
        else if (sh.a === 'inventory') this.toggleOverlay('inv');
        else if (sh.a === 'emote') this.toggleOverlay('emote');
        else if (sh.a === 'marker') this.placeMarker();
        continue;
      }
      if (this.anyOverlay() || this.paused || !s) continue;
      switch (sh.k) {
        case 'slot':
          this.pendingActs.push(packAct(Act.Slot, sh.n));
          break;
        case 'slotNext': {
          let n = s.sel;
          for (let k = 0; k < 6; k++) {
            n = (n + sh.d + 6) % 6;
            if (n === 0 || s.slots[n]!.id >= 0) break;
          }
          this.pendingActs.push(packAct(Act.Slot, n));
          break;
        }
        case 'build':
          if (!this.session.config?.build) {
            toast('In diesem Modus wird nicht gebaut');
            break;
          }
          this.pendingActs.push(packAct(Act.BuildToggle));
          break;
        case 'piece':
          if (this.session.config?.build) this.pendingActs.push(packAct(Act.BuildPiece, sh.n));
          break;
        case 'reload':
          this.pendingActs.push(packAct(Act.Reload));
          break;
        case 'interact':
          this.pendingActs.push(packAct(Act.InteractPress));
          break;
        case 'buildMat':
          this.pendingActs.push(packAct(Act.BuildMat, (s.buildMat + 1) % 3));
          break;
        case 'drop':
          if (s.sel > 0) this.pendingActs.push(packAct(Act.Drop, s.sel));
          break;
        case 'emote':
          this.pendingActs.push(packAct(Act.Emote, sh.n));
          break;
      }
    }
  }

  private fixedTick(): void {
    const st = this.input.state;
    const s = this.session;
    const self = s.self;
    let buttons = 0;
    const block = this.anyOverlay() || this.paused;
    const latch = this.input.takeLatches();
    if (!block) {
      if (st.jump || latch.jump) buttons |= Btn.Jump;
      if (st.crouch || latch.crouch) buttons |= Btn.Crouch;
      if (st.sprint) buttons |= Btn.Sprint;
      if (st.fire) buttons |= Btn.Fire;
      if (st.aim) buttons |= Btn.Aim;
      if (st.interact) buttons |= Btn.Interact;
      if (st.dive) buttons |= Btn.Dive;
    }
    // Touch: automatisches Feuern, wenn das Fadenkreuz auf einem Gegner liegt
    if (!block && this.isTouch && settings.data.touchAutoFire && self && self.sel > 0 && !self.build && this.enemyUnderCrosshair()) buttons |= Btn.Fire;
    const mode = self?.body.mode;
    const vehicleDriver = mode === Mode.Vehicle && self?.seat === 0;
    const input: PlayerInput = {
      seq: 0,
      mx: block ? 0 : st.mx,
      mz: block ? 0 : st.mz,
      yaw: this.camera.yaw,
      pitch: this.camera.pitch,
      buttons,
      actions: this.pendingActs.splice(0),
      viewTick: 0,
    };
    if (vehicleDriver) {
      // Fahrzeug: Lenkung relativ zum Fahrzeug, nicht zur Kamera
      input.mx = block ? 0 : st.mx;
      input.mz = block ? 0 : st.mz;
    }
    s.tickInput(input);
    this.predictFire(buttons);
    // Rutschen beendet → Touch-Ducken lösen
    if (this.isTouch && mode === Mode.Slide && s.pred.mode !== Mode.Slide) this.touch.releaseCrouch();
  }

  /** Sofortiges Feedback beim Schießen (Klang, Mündungsfeuer, Rückstoß) – Treffer entscheidet der Server. */
  private predictFire(buttons: number): void {
    const s = this.session.self;
    this.localFireCd = Math.max(0, this.localFireCd - DT);
    if (!s || !(buttons & Btn.Fire) || s.build || s.reloadT > 0 || this.localFireCd > 0) return;
    const m = this.session.pred.mode;
    if (m === Mode.Freefall || m === Mode.Glide || m === Mode.Swim || m === Mode.Downed || m === Mode.Bus || m === Mode.Dead || m === Mode.Climb) return;
    if (m === Mode.Vehicle && s.seat === 0) return;
    const sl = s.slots[s.sel]!;
    if (s.sel === 0) {
      this.localFireCd = 0.5;
      this.selfRig?.kick();
      audio.play('swing', null, 0.7);
      return;
    }
    const w = weapon(sl.id);
    if (!w) return;
    if (sl.id === GRENADE_ID) {
      this.localFireCd = 1;
      this.selfRig?.kick();
      audio.play('throw');
      return;
    }
    if (consumable(sl.id)) return;
    if (sl.qty <= 0) return;
    this.localFireCd = 1 / w.rate;
    this.selfRig?.kick();
    audio.play(w.model === 'launcher' ? 'rocket' : (w.model as SoundName), null, 0.9);
    const mz = this.selfRig?.muzzle;
    if (mz) this.flashes.flash(mz.x, mz.y, mz.z, 0.18, 0xffd27a, 0.05);
    this.recoil += w.recoil * 0.004 * (s.body.crouch ? 0.6 : 1);
    if (w.model === 'sniper' || w.model === 'shotgun') this.camera.shake = Math.max(this.camera.shake, 0.4);
  }

  private enemyUnderCrosshair(): boolean {
    const s = this.session;
    const f = s.latest;
    if (!f || !s.world) return false;
    const c = this.camera;
    const o = c.pivot,
      d = c.forward;
    for (const p of f.players) {
      if (p.flags & PF.Team || p.mode === Mode.Dead) continue;
      const r = s.remote(p.id);
      if (!r) continue;
      const tx = r.x - o.x,
        ty = r.y + 1.1 - o.y,
        tz = r.z - o.z;
      const along = tx * d.x + ty * d.y + tz * d.z;
      if (along < 0 || along > 120) continue;
      const px = tx - d.x * along,
        py = ty - d.y * along,
        pz = tz - d.z * along;
      if (px * px + py * py * 0.4 + pz * pz < 0.55 * 0.55) return s.world.lineOfSight(o.x, o.y, o.z, r.x, r.y + 1.1, r.z);
    }
    return false;
  }

  // ---------------- Darstellung ----------------

  private render(dt: number): void {
    const s = this.session;
    const self = s.self;
    this.matchTime += dt;
    // Tageszeit läuft langsam weiter (etwa 1 Stunde pro 2 Minuten)
    this.sky.hour = this.hourStart + this.matchTime / 120;
    const frame = s.latest;
    if (!this.worldReady || !frame) {
      this.R.gl.render(this.scene, this.camera.cam);
      return;
    }
    // Rückstoß abbauen
    if (this.recoil > 0) {
      const r = Math.min(this.recoil, dt * 0.6 + this.recoil * dt * 8);
      this.camera.pitch = clamp(this.camera.pitch + r * 0.6, -1.45, 1.45);
      this.recoil -= r;
    }
    const mode = self?.body.mode ?? Mode.Bus;
    const alive = !!self && self.alive && mode !== Mode.Dead;
    // Kamera-Ziel: eigene Figur oder Zuschauerziel
    let cx: number, cy: number, cz: number, ch: number;
    let camMode: Mode = mode;
    let aiming = false;
    let inVehicle = mode === Mode.Vehicle;
    if (alive) {
      if (s.predVehicle) {
        const v = s.vehicleRender(this.alpha)!;
        const c = Math.cos(v.yaw),
          sn = Math.sin(v.yaw);
        cx = v.x + -0.5 * c + -0.2 * sn;
        cz = v.z - -0.5 * sn + -0.2 * c;
        cy = v.y + 0.75;
      } else {
        const p = s.selfRender(this.alpha);
        cx = p.x;
        cy = p.y;
        cz = p.z;
      }
      ch = s.predicting ? bodyHeight(s.pred) : bodyHeight(self!.body);
      if (mode === Mode.Bus) {
        const [bx, by, bz] = this.busPos(frame);
        cx = bx;
        cy = by;
        cz = bz;
      }
      aiming = this.input.state.aim && !!self && self.sel > 0 && !self.build && !!weapon(self.slots[self.sel]!.id);
      const w = self ? weapon(self.slots[self.sel]!.id) : undefined;
      this.camera.setZoom(w ? w.zoom : 1);
      this.input.aimingZoom = w ? w.zoom : 1;
    } else {
      const t = s.remote(frame.viewId);
      if (t) {
        cx = t.x;
        cy = t.y;
        cz = t.z;
        ch = t.h;
        camMode = t.mode === Mode.Dead ? Mode.Dead : t.mode;
        inVehicle = t.mode === Mode.Vehicle;
      } else {
        const p = self?.body;
        cx = p?.x ?? 768;
        cy = p?.y ?? 50;
        cz = p?.z ?? 768;
        ch = PLAYER_HEIGHT;
        camMode = Mode.Dead;
      }
    }
    this.camera.update(dt, cx, cy, cz, ch, camMode, aiming, s.world, inVehicle);
    const camPos = this.camera.cam.position;
    // Welt
    this.terrainView!.update(camPos, dt);
    this.structures!.update(camPos);
    this.structures!.night = this.sky.night;
    this.vegetation!.update(dt, camPos);
    this.decor!.update(dt, this.sky.night, camPos);
    this.items.update(dt, camPos);
    this.sky.update(dt, camPos);
    // Sturm
    const z = frame.zone;
    this.storm.mesh.visible = frame.phase !== Phase.Bus;
    this.storm.update(dt, z.cx, z.cz, z.r);
    // Luftschiff
    this.airship.visible = frame.phase === Phase.Bus;
    if (this.airship.visible) {
      const [bx, by, bz] = this.busPos(frame);
      this.airship.position.set(bx, by + 8, bz);
      this.airship.rotation.y = Math.atan2(-(s.bus.x1 - s.bus.x0), -(s.bus.z1 - s.bus.z0));
      const prop = this.airship.getObjectByName('prop');
      if (prop) prop.rotation.z += dt * 20;
    }
    this.updateCharacters(dt, frame, cx, cy, cz);
    this.updateVehicles(frame);
    this.updateProjectiles(frame);
    this.updateGhost();
    this.particles.update(dt);
    this.particles.setScale(window.innerHeight * 0.9);
    this.tracers.update(dt);
    this.flashes.update(dt);
    // Klang
    const f = this.camera.forward;
    audio.setListener(camPos.x, camPos.y, camPos.z, f.x, f.y, f.z);
    this.updateLoops(frame, mode);
    // HUD
    this.updateHud(dt, frame, cx, cz);
    this.inv.render(self);
    if (this.mapView?.open) {
      this.mapView.draw({
        x: cx,
        z: cz,
        yaw: this.camera.yaw,
        zone: frame.zone,
        phase: frame.phase,
        bus: s.bus,
        marker: this.marker,
        mates: this.matePositions(frame).map((m) => ({ ...m, name: s.name(m.id) })),
      });
    }
    this.R.gl.render(this.scene, this.camera.cam);
    // Ende
    if (this.endTimer > 0) {
      this.endTimer -= dt;
      if (this.endTimer <= 0) this.finish();
    }
  }

  private busPos(f: Frame): [number, number, number] {
    const b = this.session.bus;
    const t = clamp((f.busT + (this.session.serverTick() - f.tick) / TICK_RATE) / b.duration, 0, 1);
    return [b.x0 + (b.x1 - b.x0) * t, BUS_HEIGHT, b.z0 + (b.z1 - b.z0) * t];
  }

  private updateCharacters(dt: number, frame: Frame, cx: number, cy: number, cz: number): void {
    const s = this.session;
    const self = s.self;
    const seen = new Set<number>();
    this.crowd.begin();
    // Andere Spieler nach Entfernung sortiert; die nächsten bekommen volle Figuren
    const list: { p: NetPlayer; d: number }[] = [];
    for (const np of frame.players) {
      const p = s.remote(np.id);
      if (!p) continue;
      if (p.mode === Mode.Bus) continue;
      const d = Math.hypot(p.x - cx, p.z - cz);
      list.push({ p, d });
    }
    list.sort((a, b) => a.d - b.d);
    const maxRigs = this.quality.maxRigs;
    let rigs = 0;
    for (const { p, d } of list) {
      seen.add(p.id);
      let v = this.remotes.get(p.id);
      if (!v) {
        v = { rig: null, lastX: p.x, lastZ: p.z, speed: 0, stepT: 0, lastSeen: 0 };
        this.remotes.set(p.id, v);
      }
      const sp = Math.hypot(p.x - v.lastX, p.z - v.lastZ) / Math.max(dt, 0.001);
      v.speed = lerp(v.speed, Math.min(sp, 30), 0.25);
      v.lastX = p.x;
      v.lastZ = p.z;
      if (p.mode === Mode.Dead) {
        if (v.rig) v.rig.root.visible = false;
        continue;
      }
      const full = rigs < maxRigs && d < 140;
      if (full) {
        rigs++;
        if (!v.rig) {
          const ros = s.roster.get(p.id);
          v.rig = new CharacterRig(ros?.cos ?? { outfit: 0, hat: 0, back: 0, glider: 0, pickaxe: 0, skin: 2, wrap: 0, victory: 0 });
          this.scene.add(v.rig.root);
        }
        v.rig.root.visible = true;
        v.rig.update(this.netToChar(p, v.speed), dt);
        // Schritte
        if ((p.mode === Mode.Ground || p.mode === Mode.Downed) && v.speed > 2 && d < 45) {
          v.stepT -= dt * (v.speed / 3.2);
          if (v.stepT <= 0) {
            v.stepT = 1;
            audio.play('step', [p.x, p.y, p.z], p.flags & PF.Crouch ? 0.3 : 0.8);
          }
        }
      } else {
        if (v.rig) v.rig.root.visible = false;
        const ros = s.roster.get(p.id);
        const col = OUTFITS[ros?.cos.outfit ?? 0]?.colors[0] ?? 0x8888ff;
        if (d < this.quality.viewDistance) this.crowd.add(p.x, p.y, p.z, p.h, col, p.mode === Mode.Freefall || p.mode === Mode.Swim);
      }
    }
    for (const [id, v] of this.remotes) {
      if (!seen.has(id)) {
        v.rig?.dispose();
        this.remotes.delete(id);
      }
    }
    this.crowd.end();
    // Eigene Figur
    if (self && self.alive && self.body.mode !== Mode.Dead && self.body.mode !== Mode.Bus) {
      if (!this.selfRig) {
        this.selfRig = new CharacterRig(s.roster.get(s.selfId)?.cos ?? profile.data.cos);
        this.scene.add(this.selfRig.root);
      }
      this.selfRig.root.visible = true;
      const body = s.predicting ? s.pred : self.body;
      let px = cx,
        py = cy,
        pz = cz;
      if (s.predVehicle) {
        const v = s.vehicleRender(this.alpha)!;
        const c = Math.cos(v.yaw),
          sn = Math.sin(v.yaw);
        px = v.x + -0.5 * c + -0.2 * sn;
        pz = v.z - -0.5 * sn + -0.2 * c;
        py = v.y + 0.75 - 0.75;
      }
      const hv = Math.hypot(body.vx, body.vz);
      const sel = self.slots[self.sel];
      const yaw = this.facingYaw(body.mode, hv, body.vx, body.vz);
      const st: CharState = {
        x: px,
        y: s.predVehicle ? py : py,
        z: pz,
        yaw,
        pitch: this.camera.pitch,
        mode: body.mode,
        crouch: body.crouch,
        speed: hv,
        aiming: this.input.state.aim,
        firing: this.input.state.fire,
        building: self.build,
        reloading: self.reloadT > 0,
        using: self.useT > 0,
        reviving: self.reviveT > 0,
        emote: -1,
        weapon: self.build ? -2 : sel ? sel.id : -1,
        rarity: sel ? sel.rarity : 0,
        vy: body.vy,
      };
      // Emote der eigenen Figur wird lokal aus dem Emote-Ereignis gemerkt
      st.emote = this.selfEmote;
      if (hv > 0.5 || this.input.state.fire || this.input.state.jump) this.selfEmote = -1;
      // Figur durchsichtig, wenn die Kamera sehr nah ist (Zielen in engen Räumen)
      this.selfRig.update(st, dt);
      // Schritte
      if ((body.mode === Mode.Ground || body.mode === Mode.Downed) && hv > 2) {
        this.stepT -= dt * (hv / 3.2);
        if (this.stepT <= 0) {
          this.stepT = 1;
          audio.play('step', null, body.crouch ? 0.25 : 0.55);
        }
      }
    } else if (this.selfRig) {
      this.selfRig.root.visible = false;
    }
  }

  private selfEmote = -1;

  private facingYaw(mode: Mode, hv: number, vx: number, vz: number): number {
    // Beim Laufen ohne Waffe/Ziel in Laufrichtung schauen, sonst zur Kamera
    const self = this.session.self;
    const armed = !!self && (self.sel > 0 || self.build);
    if ((mode === Mode.Freefall || mode === Mode.Glide || mode === Mode.Swim || mode === Mode.Slide || (!armed && !this.input.state.aim)) && hv > 1.5) {
      return Math.atan2(-vx, -vz);
    }
    return this.camera.yaw;
  }

  private netToChar(p: NetPlayer, speed: number): CharState {
    const moving = speed > 1.5;
    const mode = p.mode;
    let yaw = p.yaw;
    if ((mode === Mode.Freefall || mode === Mode.Glide || mode === Mode.Swim) && moving) yaw = p.yaw;
    return {
      x: p.x,
      y: p.y,
      z: p.z,
      yaw,
      pitch: p.pitch,
      mode,
      crouch: (p.flags & PF.Crouch) !== 0,
      speed,
      aiming: (p.flags & PF.Aim) !== 0,
      firing: (p.flags & PF.Fire) !== 0,
      building: (p.flags & PF.Build) !== 0,
      reloading: (p.flags & PF.Reload) !== 0,
      using: (p.flags & PF.Use) !== 0,
      reviving: (p.flags & PF.Revive) !== 0,
      emote: p.emote,
      weapon: p.weapon === -2 ? -2 : p.weapon,
      rarity: p.rarity,
      vy: 0,
    };
  }

  private updateVehicles(frame: Frame): void {
    const s = this.session;
    const seen = new Set<number>();
    for (const nv of frame.vehicles) {
      seen.add(nv.id);
      let g = this.vehicles.get(nv.id);
      if (!g) {
        g = makeBuggy();
        this.scene.add(g);
        this.vehicles.set(nv.id, g);
      }
      const own = s.predVehicle && s.predVehicle.id === nv.id;
      const v = own ? s.vehicleRender(this.alpha)! : s.vehicle(nv.id);
      if (!v) continue;
      g.position.set(v.x, v.y, v.z);
      g.rotation.set(0, v.yaw, 0);
      // Neigung aus dem Gelände
      const t = getTerrain();
      const fx = -Math.sin(v.yaw),
        fz = -Math.cos(v.yaw);
      const hf = t.height(v.x + fx * 1.4, v.z + fz * 1.4),
        hb = t.height(v.x - fx * 1.4, v.z - fz * 1.4);
      const rx = Math.cos(v.yaw),
        rz = -Math.sin(v.yaw);
      const hr = t.height(v.x + rx, v.z + rz),
        hl = t.height(v.x - rx, v.z - rz);
      if (v.y - t.height(v.x, v.z) < 0.4) {
        g.rotation.x = Math.atan2(hf - hb, 2.8);
        g.rotation.z = -Math.atan2(hr - hl, 2) * 0.8;
      }
      g.children.forEach((c) => {
        if (c.name === 'wheel') c.rotation.x += v.speed * 0.03;
      });
    }
    for (const [id, g] of this.vehicles) {
      if (!seen.has(id)) {
        g.removeFromParent();
        this.vehicles.delete(id);
      }
    }
  }

  private updateProjectiles(frame: Frame): void {
    const seen = new Set<number>();
    for (const p of frame.projectiles) {
      seen.add(p.id);
      let o = this.projectiles.get(p.id);
      if (!o) {
        o = p.weapon === GRENADE_ID ? makeGrenade() : makeRocket();
        this.scene.add(o);
        this.projectiles.set(p.id, o);
        o.position.set(p.x, p.y, p.z);
      }
      const prev = o.position.clone();
      o.position.lerp(new THREE.Vector3(p.x, p.y, p.z), 0.5);
      if (p.weapon !== GRENADE_ID) {
        o.lookAt(prev);
        this.particles.emit(o.position.x, o.position.y, o.position.z, 1, 0xffa040, 1, 0.4, 0.35, -1);
      } else o.rotation.x += 0.3;
    }
    for (const [id, o] of this.projectiles) {
      if (!seen.has(id)) {
        o.removeFromParent();
        this.projectiles.delete(id);
      }
    }
  }

  private updateGhost(): void {
    const s = this.session.self;
    const show = !!s && s.build && s.alive && this.session.predicting;
    this.ghost.visible = show;
    if (!show || !s) return;
    const b = this.session.pred;
    const pl = computePlacement(s.buildPiece, b.x, b.y, b.z, this.camera.yaw, this.camera.pitch);
    const enough = s.mats[s.buildMat]! >= BUILD_COST || s.mats.some((m) => m >= BUILD_COST);
    (this.ghost.material as THREE.MeshBasicMaterial).color.setHex(enough ? 0x3ff2ff : 0xff4a6a);
    if (pl.kind === Kind.BRamp) {
      const even = (pl.dir & 1) === 0;
      this.ghost.scale.set(even ? 4 : 4, 0.25, 4);
      this.ghost.position.set(pl.x, pl.y, pl.z);
      const ang = [0, -Math.PI / 2, Math.PI, Math.PI / 2][pl.dir]!;
      this.ghost.rotation.set(0, ang, Math.atan2(4, 4));
      this.ghost.scale.set(Math.hypot(4, 4), 0.2, 4);
    } else {
      this.ghost.rotation.set(0, 0, 0);
      this.ghost.position.set(pl.x, pl.y, pl.z);
      this.ghost.scale.set(pl.hx * 2, pl.hy * 2, pl.hz * 2);
    }
  }

  private updateLoops(frame: Frame, mode: Mode): void {
    const self = this.session.self;
    const falling = mode === Mode.Freefall || mode === Mode.Glide;
    const sp = self ? Math.abs(self.body.vy) : 0;
    audio.loop('wind', falling ? clamp(sp / 50, 0.15, 0.6) : 0, sp / 50);
    audio.loop('airship', frame.phase === Phase.Bus ? 0.25 : 0);
    const out = self ? Math.hypot(self.body.x - frame.zone.cx, self.body.z - frame.zone.cz) > frame.zone.r : false;
    const near = self ? Math.abs(Math.hypot(self.body.x - frame.zone.cx, self.body.z - frame.zone.cz) - frame.zone.r) : 999;
    audio.loop('storm', frame.phase === Phase.Play ? (out ? 0.5 : clamp(1 - near / 60, 0, 0.35)) : 0);
    audio.loop('engine', mode === Mode.Vehicle && self?.seat === 0 ? 0.25 : 0, this.session.predVehicle ? Math.abs(this.session.predVehicle.speed) / 25 : 0);
    audio.loop('rain', this.sky.weather === 1 ? 0.18 : 0);
  }

  private matePositions(frame: Frame): { x: number; z: number; id: number }[] {
    const out: { x: number; z: number; id: number }[] = [];
    for (const p of frame.players) if (p.flags & PF.Team && p.mode !== Mode.Dead) out.push({ x: p.x, z: p.z, id: p.id });
    return out;
  }

  private updateHud(dt: number, frame: Frame, cx: number, cz: number): void {
    const hud = this.hud;
    if (!hud) return;
    const s = this.session;
    const self = s.self;
    const mates: MateInfo[] = [];
    if ((s.config?.teamSize ?? 1) > 1) {
      for (const r of s.roster.values()) {
        if (r.team !== s.team || r.id === s.selfId) continue;
        const p = frame.players.find((q) => q.id === r.id);
        mates.push({ id: r.id, name: r.name, hp: p ? p.hp : 0, shield: p ? p.shield : 0, downed: p?.mode === Mode.Downed, dead: !p || p.mode === Mode.Dead });
      }
    }
    const interact = self ? this.interactText(self.interact, self.interactId) : null;
    const mode = self?.body.mode ?? Mode.Bus;
    const w = self ? weapon(self.slots[self.sel]!.id) : undefined;
    const moving = self ? Math.hypot(self.body.vx, self.body.vz) > 1 : false;
    let spread = w && !self?.build ? (this.input.state.aim ? w.spreadAim : w.spreadHip) + (moving ? w.spreadMove : 0) : 0.01;
    if (mode === Mode.Air) spread += 0.03;
    const [bjx, , bjz] = this.busPos(frame);
    const canJump = frame.phase === Phase.Bus && frame.busT > 3 && bjx > 60 && bjz > 60 && bjx < MAP_SIZE - 60 && bjz < MAP_SIZE - 60;
    if (canJump && !this.announcedJump && mode === Mode.Bus) {
      this.announcedJump = true;
      hud.big('Abspringen möglich', this.isTouch ? 'Tippe auf „Abspringen“' : `${keyLabel(settings.data.keys.jump)} drücken`, 3);
    }
    hud.update(
      {
        self,
        x: cx,
        z: cz,
        yaw: this.camera.yaw,
        zone: frame.zone,
        alive: frame.alive,
        phase: frame.phase,
        busCanJump: canJump,
        interact,
        spectating: self && !self.alive ? s.name(frame.viewId) : null,
        mates,
        fps: this.fps,
        ping: s.ping,
        online: this.opts.online,
        matchTime: this.matchTime,
        touch: this.isTouch,
        bleed: mode === Mode.Downed,
        spread,
        showCross: !!self && self.alive && mode !== Mode.Bus && mode !== Mode.Freefall && mode !== Mode.Glide && !(mode === Mode.Vehicle && self.seat === 0),
        bus: s.bus,
        marker: this.marker,
        matesPos: this.matePositions(frame),
      },
      dt,
    );
    // Namensschilder Teamkameraden + Markierung
    const tags: { x: number; y: number; text: string; cls: string }[] = [];
    for (const p of frame.players) {
      if (!(p.flags & PF.Team) || p.mode === Mode.Dead) continue;
      const r = s.remote(p.id);
      if (!r) continue;
      const sc = this.project(r.x, r.y + r.h + 0.5, r.z);
      if (!sc) continue;
      const d = Math.round(Math.hypot(r.x - cx, r.z - cz));
      tags.push({ x: sc[0], y: sc[1], text: `${s.name(p.id)}${d > 12 ? ` · ${d} m` : ''}${p.mode === Mode.Downed ? ' ✚' : ''}`, cls: `tagname ${p.mode === Mode.Downed ? 'downed' : ''}` });
    }
    if (this.marker) {
      const y = getTerrain().height(this.marker.x, this.marker.z) + 3;
      const sc = this.project(this.marker.x, y, this.marker.z);
      if (sc) tags.push({ x: sc[0], y: sc[1], text: `▼ ${Math.round(Math.hypot(this.marker.x - cx, this.marker.z - cz))} m`, cls: 'marker' });
    }
    hud.tags(tags);
    // Touch-Kontext
    if (this.isTouch && self) {
      this.touch.setContext({
        interact: interact ? interact.replace(/^.*?: /, '') : null,
        building: self.build,
        buildEnabled: !!s.config?.build,
        falling: mode === Mode.Freefall || mode === Mode.Glide,
        vehicle: mode === Mode.Vehicle,
        downed: mode === Mode.Downed,
        weapon: !!w && self.sel > 0,
        dead: !self.alive,
        bus: mode === Mode.Bus && canJump,
      });
    }
    // Ausgeschieden → Zuschauerliste pflegen
    if (self && !self.alive) this.spectList = frame.players.filter((p) => p.mode !== Mode.Dead).map((p) => p.id);
    if (self && self.body.mode !== this.lastSelfMode) {
      if (self.body.mode === Mode.Downed) hud.big('Niedergeschlagen', 'Kriech zu deinem Team!', 3);
      this.lastSelfMode = self.body.mode;
    }
  }

  private interactText(code: number, id: number): string | null {
    const k = this.isTouch ? '' : '';
    switch (code) {
      case 1: {
        const it = this.session.items.get(id);
        return it ? `${k}Aufheben: ${itemName(it.item)}` : 'Aufheben';
      }
      case 2: {
        const p = this.session.world?.pieces[id];
        return p?.state ? 'Tür schließen' : 'Tür öffnen';
      }
      case 3:
        return 'Riftkiste öffnen';
      case 4:
        return 'Munitionskiste öffnen';
      case 5:
        return 'Einsteigen: Rift-Buggy';
      case 6:
        return 'Aussteigen';
      case 7:
        return `Wiederbeleben (halten): ${this.session.name(id)}`;
      default:
        return null;
    }
  }

  private project(x: number, y: number, z: number): [number, number] | null {
    const v = this.tmpV.set(x, y, z).project(this.camera.cam);
    if (v.z > 1 || v.z < -1) return null;
    return [(v.x * 0.5 + 0.5) * window.innerWidth, (-v.y * 0.5 + 0.5) * window.innerHeight];
  }

  // ---------------- Ereignisse ----------------

  private onEvents(evs: MatchEvent[], frame: Frame): void {
    if (!this.worldReady) return;
    const s = this.session;
    const me = s.selfId;
    for (const e of evs) {
      switch (e.t) {
        case 'shot': {
          const own = e.pid === me;
          const w = WEAPONS[e.w];
          const rig = own ? this.selfRig : this.remotes.get(e.pid)?.rig;
          const mz = rig?.root.visible ? rig.muzzle : new THREE.Vector3(e.ox, e.oy, e.oz);
          if (e.w !== 100 && w && !w.projectile) this.tracers.add(mz.x, mz.y, mz.z, e.ex, e.ey, e.ez, e.hit >= 2 ? 0xffb0a0 : 0xfff2b0);
          if (!own) {
            if (e.w === 100) audio.play('swing', [e.ox, e.oy, e.oz], 0.7);
            else if (w) {
              audio.play(w.model === 'launcher' ? 'rocket' : (w.model as SoundName), [e.ox, e.oy, e.oz]);
              this.flashes.flash(mz.x, mz.y, mz.z, 0.18, 0xffd27a, 0.05);
            }
            rig?.kick();
          }
          if (e.hit === 1) {
            this.particles.emit(e.ex, e.ey, e.ez, e.w === 100 ? 6 : 4, 0xe8d8b0, 3, 0.4, 0.12, 6);
            if (e.w === 100) audio.play('pickaxe', [e.ex, e.ey, e.ez]);
          } else if (e.hit >= 2) this.particles.emit(e.ex, e.ey, e.ez, 6, e.hit === 3 ? 0xffe14a : 0xff5a6a, 3, 0.35, 0.12, 4);
          break;
        }
        case 'dmg': {
          this.hud?.hitMarker(e.head);
          audio.play(e.head ? 'headshot' : 'hit', null, 0.8);
          const sc = this.project(e.x, e.y, e.z);
          if (sc) this.hud?.damageNumber(sc[0] + (Math.random() - 0.5) * 30, sc[1], e.amt, e.head, e.shield);
          break;
        }
        case 'hurt': {
          const self = s.self?.body;
          if (self) {
            const a = Math.atan2(e.fx - self.x, -(e.fz - self.z)) + this.camera.yaw;
            this.hud?.hurtFrom(a);
          }
          audio.play('hurt', null, 0.5);
          this.camera.shake = Math.max(this.camera.shake, 0.25);
          this.input.vibrate(30);
          break;
        }
        case 'pieceKill': {
          const p = s.world?.pieces[e.id];
          const color = p ? ([0xc8955a, 0xa9a9b3, 0x7d8fa3][p.mat] ?? 0xaaaaaa) : 0xaaaaaa;
          this.particles.emit(e.x, e.y, e.z, 14, color, 5, 0.9, 0.3, 12, 2);
          audio.play(p && p.mat === 2 ? 'harvestMetal' : p && p.mat === 1 ? 'harvestStone' : 'harvestWood', [e.x, e.y, e.z], 0.8);
          break;
        }
        case 'boom': {
          this.flashes.flash(e.x, e.y, e.z, e.r * 0.7, 0xffa040, 0.45, 2.5);
          this.particles.emit(e.x, e.y, e.z, 40, 0xff8a3a, 9, 0.9, 0.5, 6, 3);
          this.particles.emit(e.x, e.y, e.z, 20, 0x553344, 4, 1.6, 0.9, -1, 2);
          audio.play('explosion', [e.x, e.y, e.z]);
          const c = this.camera.cam.position;
          const d = Math.hypot(c.x - e.x, c.y - e.y, c.z - e.z);
          this.camera.shake = Math.max(this.camera.shake, clamp(1.2 - d / 40, 0, 1));
          break;
        }
        case 'sfx': {
          const name = SFX_MAP[e.k];
          if (!name) break;
          const own = e.pid === me;
          audio.play(name, own ? null : [e.x, e.y + 1, e.z], own ? 0.7 : 1);
          if (e.k === Sfx.Build) this.particles.emit(e.x, e.y + 1, e.z, 4, 0x3ff2ff, 2, 0.3, 0.2, 0);
          if (e.k === Sfx.Splash) this.particles.emit(e.x, WATER_LEVEL, e.z, 16, 0xbfe9ff, 4, 0.8, 0.25, 9, 3);
          break;
        }
        case 'feed':
          this.onFeed(e);
          break;
        case 'elim':
          if (e.pid === me) this.onEliminated(e.place, e.killer);
          break;
        case 'revived':
          this.hud?.feed(`${s.name(e.by)} hat ${s.name(e.pid)} wiederbelebt`, e.pid === me || e.by === me);
          if (e.pid === me) this.hud?.big('Wiederbelebt!', '', 2);
          break;
        case 'zone': {
          const z = frame.zone;
          if (z.shrinking && !this.lastZoneShrink) {
            this.hud?.big('Der Sturm zieht zu!', 'Begib dich in die sichere Zone', 3);
            audio.play('zoneWarn');
          } else if (!z.shrinking && z.phase === 0) {
            this.hud?.big('Sturm erkannt', 'Die erste sichere Zone ist auf der Karte markiert', 3.5);
            audio.play('zoneWarn');
          }
          this.lastZoneShrink = z.shrinking;
          break;
        }
        case 'phase':
          if (e.phase === Phase.Play && s.self?.body.mode === Mode.Bus) this.hud?.big('Abwurf!', '', 2);
          break;
        case 'emote':
          if (e.pid === me) this.selfEmote = e.id;
          break;
        case 'end': {
          const win = e.winnerTeam === s.team;
          this.hud?.big(win ? 'SIEG IN DER RIFTZONE!' : 'Match beendet', win ? 'Du hast als Letzte·r überlebt' : `Gewonnen hat ${this.teamName(e.winnerTeam)}`, 6);
          audio.play(win ? 'victory' : 'defeat');
          if (win) {
            // Siegerpose aus dem Spind
            const anim = VICTORY_POSES[profile.data.cos.victory]?.anim ?? 'cheer';
            this.selfEmote = EMOTES.find((x) => x.anim === anim)?.id ?? 9;
          }
          break;
        }
        default:
          break;
      }
    }
  }

  private teamName(team: number): string {
    const names = [...this.session.roster.values()].filter((r) => r.team === team).map((r) => r.name);
    return names.length ? names.join(' & ') : 'niemand';
  }

  private onFeed(e: Extract<MatchEvent, { t: 'feed' }>): void {
    const s = this.session;
    const me = s.selfId;
    const victim = s.name(e.victim);
    const killer = e.killer >= 0 ? s.name(e.killer) : '';
    const wn = e.w === 100 ? 'Spitzhacke' : e.w === 101 ? 'Rift-Buggy' : WEAPONS[e.w]?.short ?? '';
    let text: string;
    if (e.knock) text = killer ? `${killer} hat ${victim} niedergeschlagen (${wn})` : `${victim} wurde niedergeschlagen`;
    else if (e.killer >= 0 && e.killer !== e.victim) text = `${killer} hat ${victim} ausgeschaltet${wn ? ` (${wn}${e.head ? ', Kopftreffer' : ''})` : ''}`;
    else text = `${victim} ist ausgeschieden ${CAUSE_TEXT[e.cause] ?? ''}`.trim();
    const mine = e.killer === me || e.victim === me;
    this.hud?.feed(text, mine);
    if (e.killer === me && e.victim !== me) {
      this.hud?.big(e.knock ? `${victim} niedergeschlagen` : `${victim} ausgeschaltet`, '', 2);
      audio.play(e.knock ? 'knock' : 'elim');
    }
  }

  private onEliminated(place: number, killer: number): void {
    if (this.eliminated) return;
    this.eliminated = true;
    const s = this.session;
    const by = killer >= 0 && killer !== s.selfId ? `Ausgeschaltet von ${s.name(killer)}` : 'Ausgeschieden';
    this.hud?.big(`#${place}`, by, 5);
    audio.play('defeat');
    this.touch.reset();
    // Ergebnis kommt erst am Matchende – wir zeigen nach kurzer Zeit den Ergebnisbildschirm
    this.endTimer = 4.5;
  }

  private onResults(_r: PlacementResult[], _winner: number): void {
    if (!this.ended && this.endTimer < 0) this.endTimer = 5.5;
  }

  /** Ergebnisbildschirm zeigen (Match läuft ggf. weiter, Zuschauen bleibt möglich). */
  private finish(): void {
    if (this.ended) return;
    this.ended = true;
    const s = this.session;
    let results = s.results;
    if (!results) {
      // Ausgeschieden vor Matchende: eigenes Teilergebnis bauen
      const self = s.self;
      results = [
        {
          id: s.selfId,
          name: s.name(s.selfId),
          team: s.team,
          bot: false,
          place: self?.place || 1,
          kills: self?.kills ?? 0,
          damage: self?.damage ?? 0,
          assists: 0,
          revives: 0,
          survived: Math.round(this.matchTime),
          built: 0,
          harvested: 0,
          headshots: 0,
          chests: 0,
          distance: 0,
          won: false,
        },
      ];
    }
    this.opts.onEnd(results, s.selfId, s.winnerTeam, s);
  }

  private fail(reason: string): void {
    if (this.ended) return;
    toast(reason, 4000);
    this.opts.onExit(reason);
  }

  // ---------------- Overlays ----------------

  private anyOverlay(): boolean {
    return !!this.mapView?.open || this.inv.open || this.wheel.open || this.paused;
  }

  private toggleOverlay(which: 'map' | 'inv' | 'emote'): void {
    const isOpen = which === 'map' ? !!this.mapView?.open : which === 'inv' ? this.inv.open : this.wheel.open;
    this.closeOverlays();
    if (isOpen) return;
    if (which === 'map') this.mapView?.show(true);
    else if (which === 'inv') this.inv.show(true);
    else this.wheel.show(true, profile.data.emotes);
    if (document.pointerLockElement) document.exitPointerLock();
    this.touch.reset();
  }

  private closeOverlays(): void {
    this.mapView?.show(false);
    this.inv.show(false);
    this.wheel.show(false, []);
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.paused) this.togglePause(false);
    if (!this.isTouch && this.running) this.input.requestLock();
  }

  private togglePause(on: boolean): void {
    if (on === this.paused) return;
    this.paused = on;
    if (this.opts.transport instanceof LocalTransport) this.opts.transport.pause(on);
    if (on) {
      this.touch.reset();
      if (document.pointerLockElement) document.exitPointerLock();
      this.overlay = pauseMenu({
        online: this.opts.online,
        canSpectateLeave: !!this.session.self && !this.session.self.alive,
        onResume: () => this.closeOverlays(),
        onSettings: () => {
          this.overlay?.remove();
          this.overlay = null;
          this.opts.openSettings(() => {
            this.paused = false;
            this.togglePause(true);
          });
        },
        onLeave: () => {
          this.overlay?.remove();
          this.overlay = null;
          this.leave();
        },
      });
      this.uiRoot.appendChild(this.overlay);
    } else {
      this.overlay?.remove();
      this.overlay = null;
      this.camera.baseFov = settings.data.fov;
      this.camera.reducedMotion = settings.data.reducedMotion;
      this.applyQuality(this.R.profile);
      if (!this.isTouch) this.input.requestLock();
    }
  }

  private placeMarker(): void {
    const c = this.camera;
    const w = this.session.world;
    if (!w) return;
    const hit = w.raycast(c.pivot.x, c.pivot.y, c.pivot.z, c.forward.x, c.forward.y, c.forward.z, 600);
    const x = c.pivot.x + c.forward.x * hit.t,
      z = c.pivot.z + c.forward.z * hit.t;
    this.marker = { x: clamp(x, 0, MAP_SIZE), z: clamp(z, 0, MAP_SIZE) };
    audio.play('click');
  }

  private cycleSpectate(d: number): void {
    const list = this.spectList;
    if (!list.length) return;
    const cur = this.session.latest?.viewId ?? 0;
    const i = list.indexOf(cur);
    const n = list[(i + d + list.length) % list.length]!;
    this.session.spectate(n);
  }

  private soundViz(kind: string, x: number, z: number): void {
    const self = this.session.self?.body;
    if (!self || !this.hud) return;
    const d = Math.hypot(x - self.x, z - self.z);
    if (d < 3 || d > 80) return;
    const a = Math.atan2(x - self.x, -(z - self.z)) + this.camera.yaw;
    this.hud.hurtFrom(a, true);
    void kind;
  }

  /** Match verlassen (zur Lobby) */
  leave(): void {
    if (!this.ended) {
      this.ended = true;
      this.session.leave();
    }
    this.opts.onExit();
  }

  /** Aufräumen */
  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
    this.touch.show(false);
    audio.stopLoops();
    audio.onViz = null;
    this.uiRoot.remove();
    this.terrainView?.dispose();
    this.structures?.dispose();
    for (const v of this.remotes.values()) v.rig?.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry && !(m as THREE.InstancedMesh).isInstancedMesh) {
        /* Geometrien teilweise geteilt – nicht freigeben */
      }
    });
    this.R.onQuality = null;
    if (!this.session.closed) this.session.leave();
  }

}

