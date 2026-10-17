// Spielansicht: 3D-Welt, Züge, Führerstand, Kameras, Eingabe, HUD, Ton, Pause, Wiederholung, Ergebnis.
import * as THREE from 'three';
import type { Session, Result } from '../modes/session';
import type { Settings } from '../save/store';
import type { AudioEngine, AudioState } from '../audio/audio';
import { WorldView, type WorldQuality } from '../engine/world';
import { TrainsView, poseOf, type TrainPose } from '../engine/trains3d';
import { CameraRig, CAM_NAMES, type CamMode } from '../engine/cameras';
import { Input, type Action } from '../input/input';
import { Hud } from '../ui/hud';
import { Map2D } from '../ui/map2d';
import { h, btn, toast, dialog, hhmm } from '../ui/dom';
import { lookahead } from '../operations/lookahead';
import type { Train } from '../trains/train';
import { buildCab, type CabModel, type CabState } from '../engine/models/cab';
import type { Quality } from '../engine/models/vehicles';
import { helpContent } from '../ui/help';
import { StopSign } from '../engine/stopsign';

export interface GameCtx {
  settings: Settings;
  audio: AudioEngine;
  /** Spielende (Ergebnis oder Abbruch) */
  exit(res: Result | null, again?: boolean): void;
  /** Einstellungen öffnen (Pause) */
  openSettings(onClose: () => void): void;
}

export interface GameOpts {
  title: string;
  mode: 'drive' | 'box' | 'world';
  allowFreeCam: boolean;
}

const _off = new THREE.Matrix4();
const CAMS: CamMode[] = ['cab', 'chase', 'front', 'rear', 'passenger', 'trackside', 'free'];

export function qualityOf(s: Settings): { world: WorldQuality; model: Quality; pixel: number } {
  let q = s.quality;
  if (q === 'auto') {
    const mobile = matchMedia('(pointer: coarse)').matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    // Automatisch lieber flüssig als detailreich: Handys niedrig, Rechner mittel
    q = mobile ? (mem >= 8 ? 'mid' : 'low') : 'mid';
  }
  if (q === 'low') return { world: { level: 'low', viewDist: 1400, shadows: false }, model: 'low', pixel: 1 };
  if (q === 'mid') return { world: { level: 'mid', viewDist: 2400, shadows: false }, model: 'medium', pixel: 1.25 };
  return { world: { level: 'high', viewDist: 3800, shadows: true }, model: 'high', pixel: 1.75 };
}

export class Game {
  readonly s: Session;
  private ctx: GameCtx;
  private o: GameOpts;
  private canvas: HTMLCanvasElement;
  private root: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private view: WorldView;
  private trains: TrainsView;
  private stopSign: StopSign;
  private rig: CameraRig;
  private input = new Input();
  private hud: Hud;
  private map: Map2D | null = null;
  private mapHost: HTMLElement | null = null;
  private cab: CabModel | null = null;
  private cabFor = '';
  private eye = new THREE.Vector3(5, 3, -0.6);
  private eyeBase = new THREE.Vector3(5, 3, -0.6);
  private raf = 0;
  private last = 0;
  private paused = false;
  private pauseEl: HTMLElement | null = null;
  private lever = 0;
  private manBrake = 0;
  private replay: { poses: TrainPose[][]; i: number; t: number } | null = null;
  private history: TrainPose[][] = [];
  private histT = 0;
  private warp = 1;
  private fpsAcc = 0; private frames = 0; fps = 60;
  private qual: ReturnType<typeof qualityOf>;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  private hornOn = false;
  private disposed = false;
  private resultShown = false;
  private lastStopIdx = -1;
  private hudVisible = true;
  private frameMin = 0;

  constructor(canvas: HTMLCanvasElement, root: HTMLElement, s: Session, ctx: GameCtx, o: GameOpts) {
    this.canvas = canvas; this.root = root; this.s = s; this.ctx = ctx; this.o = o;
    this.qual = qualityOf(ctx.settings);
    this.s.autoDoors = ctx.settings.controls === 'simple';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.qual.world.level !== 'low', powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.qual.pixel));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = this.qual.world.shadows;
    this.rig = new CameraRig(innerWidth / innerHeight);
    this.view = new WorldView(this.renderer, this.scene, s.world.net, this.qual.world);
    this.trains = new TrainsView(this.scene, s.world.net, this.qual.model);
    this.stopSign = new StopSign(this.scene);
    this.hud = new Hud(root, this, s, ctx.settings, o.mode);
    if (o.mode === 'box') { this.openMap(true); }
    if (o.mode === 'world' || !s.player) this.rig.set(s.player ? 'chase' : 'free');
    this.input.on(this.onAction);
    this.bindPointer();
    addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.vis);
    this.resize();
    // Startkamera bei freier Welt: über erster Station
    if (!s.player) { const st = s.world.net.def.stations.find((x) => x.platforms.length); if (st) { const p = s.world.net.track(st.platforms[0].track).point(st.platforms[0].s0); this.rig.cam.position.set(p.x + 60, p.y + 40, p.z + 60); this.rig.cam.lookAt(p.x, p.y, p.z); this.rig.set('chase'); this.rig.set('free'); } }
  }

  start() { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }

  /** Anteil geladener Umgebung (für Ladebildschirm) */
  warmup(steps: number) {
    const t = this.s.player;
    for (let i = 0; i < steps; i++) { this.updateCamera(0.016, t); this.view.update(this.rig.cam, this.env(), 0.016); }
    return this.view.progress();
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose(); this.hud.dispose(); this.map?.dispose(); this.mapHost?.remove(); this.pauseEl?.remove();
    removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.vis);
    this.unbindPointer();
    this.cab?.dispose(); this.stopSign.dispose(); this.trains.dispose(); this.view.dispose();
    this.renderer.dispose();
    this.ctx.audio.update(0.1, silentAudio());
  }

  private resize = () => {
    const w = innerWidth, hh = innerHeight;
    this.renderer.setSize(w, hh, false);
    this.rig.cam.aspect = w / hh; this.rig.applyFov();
  };
  private vis = () => { if (document.hidden && !this.paused) this.setPaused(true); };

  // ------------------------------------------------------------ Hauptschleife
  private loop = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const cap = this.ctx.settings.fpsCap;
    if (cap && now - this.frameMin < 1000 / cap - 2) return;
    this.frameMin = now;
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    this.fpsAcc += dt; this.frames++;
    if (this.fpsAcc > 1) { this.fps = Math.round(this.frames / this.fpsAcc); this.fpsAcc = 0; this.frames = 0; }
    this.input.pollGamepad();
    const s = this.s, w = s.world;
    if (!this.paused && !this.replay) {
      this.drive(dt);
      w.speedMul = this.warp;
      s.update(dt);
      this.record(dt);
      if (s.finished && !this.resultShown) this.showResult(s.finished);
    }
    if (this.replay) this.stepReplay(dt);
    const t = s.player;
    this.updateCamera(dt, t);
    const cabOn = this.rig.mode === 'cab' && !!t;
    if (this.replay) this.trains.syncPoses(this.replay.poses[this.replay.i] ?? [], t?.id ?? null);
    else this.trains.sync(w, this.rig.cam.position, this.qual.world.viewDist, t?.id ?? null, cabOn && !!t?.consist[0]?.type.cab);
    this.syncCab(cabOn, t, dt);
    const plan = t ? w.plans.get(t.id) : undefined;
    this.stopSign.update(w.net, t && plan?.svc && plan.state === 'run' ? w.stopTarget(t, plan) : null);
    this.view.update(this.rig.cam, this.env(), dt);
    this.renderer.render(this.scene, this.rig.cam);
    this.hud.update(dt);
    if (this.map) this.map.draw();
    this.audio(dt, t);
  };

  private env() {
    const w = this.s.world;
    return {
      timeOfDay: ((w.time % 86400) + 86400) % 86400,
      weather: w.weather.kind, season: w.weather.season,
      signalAspect: (id: string) => w.il.signalState.get(id)?.aspect ?? 'stop',
      crossingClosed: (id: string) => w.crossings.get(id)?.closed ?? 0,
      lightning: w.weather.kind === 'storm' && Math.random() < 0.002,
    };
  }

  private updateCamera(dt: number, t: Train | null) {
    const lead = t && this.trains.leadGroup ? this.trains.leadMatrix : null;
    if (this.input.axis.active && (this.input.axis.lookX || this.input.axis.lookY)) this.rig.look(this.input.axis.lookX * 12, this.input.axis.lookY * 9);
    this.rig.update(dt, this.s.world.net, t, lead, this.eye, (i) => (t ? this.trains.vehicleGroup(t.id, i) : null), (x, z) => this.view.heightAt(x, z));
  }

  /** Führerstand im führenden Fahrzeug */
  private syncCab(on: boolean, t: Train | null, dt: number) {
    const lead = t?.consist[0];
    const layout = lead?.type.cab;
    const key = on && t && layout ? `${t.id}|${lead!.uid}|${layout}` : '';
    if (key !== this.cabFor) {
      this.cab?.group.removeFromParent(); this.cab?.dispose(); this.cab = null; this.cabFor = key;
      if (key && layout) {
        this.cab = buildCab(layout, this.qual.model);
        // Führerstand sitzt an der Vorderkante des Fahrzeugs (x = len/2); eye ist im Führerstandssystem
        const half = lead!.type.len / 2;
        this.eyeBase.copy(this.cab.eye).add(new THREE.Vector3(half, 0, 0));
      }
    }
    // Hochformat: Blick etwas weiter vorn und höher, damit das Pult nicht die halbe Sicht verdeckt
    if (this.cab) { this.eye.copy(this.eyeBase); if (innerHeight > innerWidth) { this.eye.x += 0.55; this.eye.y += 0.22; } }
    // Führerstand nicht an die (im Führerstand ausgeblendete) Fahrzeuggruppe hängen, sondern deren Matrix übernehmen
    if (this.cab && t && this.trains.leadGroup) {
      const cg = this.cab.group;
      if (cg.parent !== this.scene) { this.scene.add(cg); cg.matrixAutoUpdate = false; }
      cg.matrix.copy(this.trains.leadMatrix).multiply(_off.makeTranslation(t.consist[0].type.len / 2, 0, 0));
      cg.matrixWorldNeedsUpdate = true;
    }
    if (this.cab && t) this.cab.update(cabState(t, this.s), dt);
  }

  // ------------------------------------------------------------ Fahren
  private drive(dt: number) {
    const t = this.s.player; if (!t || t.ai) return;
    const c = t.ctl, held = this.input.held;
    const expert = this.s.world.assist === 'expert';
    const rate = 0.6 * dt;
    if (held.has('throttleUp')) this.lever = Math.min(1, this.lever + rate);
    if (held.has('throttleDown')) this.lever = Math.max(expert && this.ctx.settings.controls !== 'simple' ? 0 : -1, this.lever - rate);
    if (held.has('brakeUp')) this.manBrake = Math.min(1, this.manBrake + rate);
    if (held.has('brakeDown')) this.manBrake = Math.max(0, this.manBrake - rate);
    if (this.input.axis.active && Math.abs(this.input.axis.lever) > 0.02) this.lever = this.input.axis.lever;
    // Schnappen auf 0 nahe Mitte
    if (!held.has('throttleUp') && !held.has('throttleDown') && Math.abs(this.lever) < 0.04) this.lever = 0;
    const hold = this.ctx.settings.controls === 'simple' ? this.simpleAssist(t, dt) : false;
    const L = hold ? Math.min(0, this.lever) : this.lever;
    let thr = Math.max(0, L);
    if (t.traction === 'diesel' && t.consist[0].type.body !== 'dmu') thr = Math.round(thr * 8) / 8; // Fahrstufen
    c.throttle = thr;
    c.brake = Math.max(this.manBrake, L < 0 ? -L : 0);
    c.dyn = L < 0 ? -L : 0;
    c.horn = this.hornOn;
    c.sand = held.has('sand');
    if (held.has('cutoffUp')) c.cutoff = Math.min(0.8, c.cutoff + dt * 0.3);
    if (held.has('cutoffDown')) c.cutoff = Math.max(-0.8, c.cutoff - dt * 0.3);
    if (t.traction === 'steam' && this.s.world.assist === 'easy') c.cutoff = c.reverser * Math.max(0.25, 0.75 - Math.abs(t.kmh) / 150);
    // Haltestellenansage
    const plan = this.s.world.plans.get(t.id);
    if (plan?.svc && plan.state === 'run' && plan.stopIdx !== this.lastStopIdx) {
      this.lastStopIdx = plan.stopIdx;
      const st = plan.svc.stops[plan.stopIdx];
      const name = st ? this.s.world.stations.get(st.st)?.name : null;
      if (name && this.ctx.settings.announcements && plan.stopIdx > 0) setTimeout(() => this.ctx.audio.announce(`Nächster Halt: ${name}`), 4000);
    }
  }

  /** Einfache Bedienung: Richtung, Bremse lösen, Stromabnehmer/Motor und Türen übernimmt das Spiel */
  private stillT = 0;
  private doorStop = '';
  private holdMsg = -1;
  /** gibt true zurück, solange der Zug noch nicht abfahren darf (Halt bis zur Abfahrtszeit) */
  private simpleAssist(t: Train, dt: number): boolean {
    const c = t.ctl, still = Math.abs(t.v) < 0.1;
    const plan = this.s.world.plans.get(t.id);
    const hold = still && plan?.state === 'dwell';
    // nach einer Schnellbremsung im Stillstand automatisch lösen
    if (still && c.emergency && this.stillT > 3) { c.emergency = false; toast('Schnellbremsung gelöst – weiterfahren'); }
    if (hold && this.lever > 0.02 && this.holdMsg !== plan!.stopIdx) {
      this.holdMsg = plan!.stopIdx;
      toast(`Noch nicht abfahren – Abfahrt ${hhmm(plan!.dwellUntil)}. Der Zug fährt los, sobald es so weit ist.`, 'warn', 5000);
    }
    this.manBrake = 0;
    if (t.traction === 'electric') { c.panto = true; c.mainSwitch = true; }
    if (t.traction === 'diesel') c.engine = true;
    c.parking = false;
    // Wachsam/Sifa quittiert das Spiel selbst
    if (this.s.world.pzb.need > 0) this.s.world.pzbAck();
    if (t.sifaWarn) t.sifaAck();
    if (this.lever > 0.02 && still && c.reverser === 0) c.reverser = 1;
    this.stillT = still ? this.stillT + dt : 0;
    const where = `${t.head.t}:${Math.round(t.head.s / 50)}`;
    if (this.lever > 0.02 && !hold) {
      // Losfahren: Türen zu
      if (c.openL || c.openR || c.releaseL || c.releaseR) { c.openL = c.openR = c.releaseL = c.releaseR = false; this.ctx.audio.play('door_beep'); toast('Türen schließen – gleich geht es los'); }
    } else if (t.hasDoors && this.stillT > 1.2 && this.doorStop !== where) {
      const side = this.platformSide(t);
      if (side) { this.doorStop = where; c.releaseL = c.openL = side === 'L'; c.releaseR = c.openR = side === 'R'; this.ctx.audio.play('door_open'); toast(`Türen ${side === 'L' ? 'links' : 'rechts'} offen${plan?.state === 'dwell' ? ` – Abfahrt ${hhmm(plan.dwellUntil)}` : ' – zum Weiterfahren Hebel nach oben'}`); }
    }
    if (!still) this.doorStop = this.doorStop && this.stillT === 0 && Math.abs(t.v) > 3 ? '' : this.doorStop;
    return hold;
  }

  setLever(v: number) { this.lever = Math.max(this.s.world.assist === 'expert' && this.ctx.settings.controls !== 'simple' ? 0 : -1, Math.min(1, v)); }
  getLever() { return this.lever; }
  setBrake(v: number) { this.manBrake = Math.max(0, Math.min(1, v)); }
  getBrake() { return this.manBrake; }
  get warpFactor() { return this.warp; }
  get camMode() { return this.rig.mode; }
  get isPaused() { return this.paused; }

  onAction = (a: Action, down: boolean) => {
    const s = this.s, t = s.player, w = s.world, au = this.ctx.audio;
    if (a === 'horn') { this.hornOn = down; if (t) au.play(down ? (t.traction === 'steam' ? 'whistle_start' : 'horn_start') : (t.traction === 'steam' ? 'whistle_stop' : 'horn_stop')); return; }
    if (!down) return;
    const say = (m: string, sev: 'info' | 'warn' | 'error' = 'info') => { if (m) toast(m, sev); };
    switch (a) {
      case 'pause': this.setPaused(!this.paused); return;
      case 'help': this.showHelp(); return;
      case 'map': this.openMap(!this.map); return;
      case 'hud': this.hudVisible = !this.hudVisible; this.hud.setVisible(this.hudVisible); return;
      case 'screenshot': this.screenshot(); return;
      case 'replay': this.toggleReplay(); return;
      case 'timewarp': { const opts = this.o.mode === 'drive' ? [1, 2, 4] : [1, 2, 4, 8, 16]; this.warp = opts[(opts.indexOf(this.warp) + 1) % opts.length]; say(`Zeitraffer ×${this.warp}`); return; }
      case 'camera': { const list = CAMS.filter((m) => m !== 'free' || this.o.allowFreeCam); this.setCam(list[(list.indexOf(this.rig.mode) + 1) % list.length]); return; }
      case 'cam1': case 'cam2': case 'cam3': case 'cam4': case 'cam5': case 'cam6': case 'cam7': { const m = CAMS[Number(a.slice(3)) - 1]; if (m !== 'free' || this.o.allowFreeCam) this.setCam(m); else say('Freie Kamera nur im Fotomodus/Editor und in der freien Welt.', 'warn'); return; }
    }
    if (this.paused || !t || t.ai) return;
    const c = t.ctl;
    switch (a) {
      case 'emergency':
        if (!c.emergency) { c.emergency = true; this.lever = -1; au.play('emergency'); say('Schnellbremsung!', 'warn'); }
        else if (Math.abs(t.v) < 0.1) { c.emergency = false; if (t.forcedBrake && !t.forcedBrake.includes('SPAD')) t.forcedBrake = null; au.play('brake_release'); say('Schnellbremsung gelöst'); }
        else say('Schnellbremsung lässt sich erst im Stillstand lösen.', 'warn');
        break;
      case 'reverser': case 'reverserBack': {
        if (Math.abs(t.v) > 0.3) { say('Richtungswender nur im Stillstand.', 'warn'); break; }
        c.reverser = (a === 'reverser' ? Math.min(1, c.reverser + 1) : Math.max(-1, c.reverser - 1)) as -1 | 0 | 1;
        if (t.traction === 'steam') c.cutoff = c.reverser * 0.6;
        say(`Richtungswender: ${c.reverser === 1 ? 'vorwärts' : c.reverser === -1 ? 'rückwärts' : 'neutral'}`); au.play('ui_click');
        break;
      }
      case 'doors': {
        if (!t.hasDoors) { say('Dieser Zug hat keine Fahrgasttüren.'); break; }
        if (Math.abs(t.v) > 0.1) { say('Türen erst im Stillstand freigeben.', 'warn'); break; }
        const side = this.platformSide(t);
        if (!side) { say('Kein Bahnsteig neben dem Zug – Türen bleiben zu.', 'warn'); break; }
        c.releaseL = side === 'L'; c.releaseR = side === 'R'; c.openL = side === 'L'; c.openR = side === 'R';
        au.play('door_open'); say(`Türen ${side === 'L' ? 'links' : 'rechts'} freigegeben`);
        break;
      }
      case 'doorsClose': c.openL = c.openR = false; c.releaseL = c.releaseR = false; au.play('door_beep'); say('Türen schließen'); break;
      case 'panto': c.panto = !c.panto; au.play('panto_up'); say(c.panto ? 'Stromabnehmer heben' : 'Stromabnehmer senken'); break;
      case 'mainSwitch':
        if (t.traction === 'diesel') { c.engine = !c.engine; au.play(c.engine ? 'engine_start' : 'engine_stop'); say(c.engine ? 'Motor starten' : 'Motor aus'); }
        else { c.mainSwitch = !c.mainSwitch; au.play('main_switch'); say(c.mainSwitch ? 'Hauptschalter ein' : 'Hauptschalter aus'); }
        break;
      case 'lights': c.lights = ((c.lights + 1) % 3) as 0 | 1 | 2; say(['Licht aus', 'Spitzenlicht', 'Fernlicht'][c.lights]); break;
      case 'pzb': if (t.sifaWarn) t.sifaAck(); w.pzbAck(); au.play('ui_click'); break;
      case 'zs1': say(s.requestZs1()); break;
      case 'isolate': say(s.isolateDoor()); break;
      case 'couple': say(s.toggleCouple()); break;
      case 'uncouple': this.askUncouple(); break;
      case 'load': say(s.cargo('load')); au.play('load'); break;
      case 'unload': say(s.cargo('unload')); au.play('load'); break;
      case 'cabChange':
        if (Math.abs(t.v) > 0.1) { say('Führerstandswechsel nur im Stillstand.', 'warn'); break; }
        if (!t.consist[t.consist.length - 1].type.cab) { say('Am anderen Zugende gibt es keinen Führerstand – Rückwärtsfahrt mit Richtungswender (⇧R).', 'warn'); break; }
        t.flip(w.net); w.refreshOccupancy(); { const pl = w.plans.get(t.id); if (pl) { pl.path = []; if (pl.svc || pl.dest) w.planNext(t); } }
        say('Führerstand gewechselt.');
        break;
      case 'injector': c.injector = !c.injector; au.play('injector'); break;
      case 'firing': c.firing = c.firing > 0.6 ? 0.3 : 0.9; say(c.firing > 0.6 ? 'Kräftig feuern' : 'Feuer klein halten'); break;
      case 'wipers': c.wipers = !c.wipers; break;
      case 'cabLight': c.cabLight = !c.cabLight; break;
      case 'parking': c.parking = !c.parking; say(c.parking ? 'Feststellbremse angelegt' : 'Feststellbremse gelöst'); break;
      case 'shunt': { const pl = w.plans.get(t.id); if (pl) { pl.shunt = !pl.shunt; say(pl.shunt ? 'Rangierfahrt: höchstens 25 km/h, Rangiersignale gelten' : 'Zugfahrt'); } break; }
    }
  };

  private platformSide(t: Train): 'L' | 'R' | null {
    const w = this.s.world;
    for (const sp of w.spans.get(t.id) ?? []) for (const x of w.platformsOn.get(sp.t) ?? []) {
      if (sp.s1 > x.p.s0 && sp.s0 < x.p.s1) {
        const st = t.trail.find((q) => q.t === sp.t); const d = st?.d ?? 1;
        return d > 0 ? x.p.side : x.p.side === 'L' ? 'R' : 'L';
      }
    }
    return null;
  }

  private async askUncouple() {
    const t = this.s.player; if (!t) return;
    if (t.consist.length < 2) { toast('Nichts zum Entkuppeln.'); return; }
    const opts = t.consist.slice(0, -1).map((v, i) => `Hinter ${i + 1}: ${v.type.name.split('–')[0].trim()}`).slice(0, 6);
    const i = await dialog('Entkuppeln', 'Hinter welchem Fahrzeug trennen? (von vorn gezählt)', [...opts, 'Abbrechen']);
    if (i < opts.length) { toast(this.s.uncouple(i)); this.ctx.audio.play('uncouple'); }
  }

  setCam(m: CamMode) { this.rig.set(m); toast(`Kamera: ${CAM_NAMES[m]}`); }

  // ------------------------------------------------------------ Zeiger (Umsehen, Zoom)
  private bindPointer() {
    this.canvas.addEventListener('pointerdown', this.pd);
    this.canvas.addEventListener('pointermove', this.pm);
    this.canvas.addEventListener('pointerup', this.pu);
    this.canvas.addEventListener('pointercancel', this.pu);
    this.canvas.addEventListener('wheel', this.wh, { passive: false });
    this.canvas.addEventListener('dblclick', this.dbl);
    addEventListener('keydown', this.freeKeys); addEventListener('keyup', this.freeKeys);
  }
  private unbindPointer() {
    this.canvas.removeEventListener('pointerdown', this.pd); this.canvas.removeEventListener('pointermove', this.pm);
    this.canvas.removeEventListener('pointerup', this.pu); this.canvas.removeEventListener('pointercancel', this.pu);
    this.canvas.removeEventListener('wheel', this.wh); this.canvas.removeEventListener('dblclick', this.dbl);
    removeEventListener('keydown', this.freeKeys); removeEventListener('keyup', this.freeKeys);
  }
  private pd = (e: PointerEvent) => {
    this.canvas.setPointerCapture?.(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = Math.hypot(a.x - b.x, a.y - b.y); }
    if (this.pointers.size === 1 && this.rig.mode === 'cab' && this.cab) this.cabClick(e);
  };
  private pm = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId); if (!p) return;
    if (this.pointers.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch) this.rig.zoom(this.pinch / d); this.pinch = d; return;
    }
    const inv = this.ctx.settings.invertLook ? -1 : 1;
    this.rig.look(e.clientX - p.x, (e.clientY - p.y) * inv);
    p.x = e.clientX; p.y = e.clientY;
  };
  private pu = (e: PointerEvent) => { this.pointers.delete(e.pointerId); };
  private wh = (e: WheelEvent) => { e.preventDefault(); this.rig.zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1); };
  private dbl = () => this.rig.resetLook();
  private freeKeys = (e: KeyboardEvent) => {
    if (this.rig.mode !== 'free') return;
    const d = e.type === 'keydown' ? 1 : 0;
    const m = this.rig.move;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') m.f = d; if (e.code === 'KeyS' || e.code === 'ArrowDown') m.f = -d;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') m.r = d; if (e.code === 'KeyA' || e.code === 'ArrowLeft') m.r = -d;
    if (e.code === 'KeyE') m.u = d; if (e.code === 'KeyQ') m.u = -d; if (e.code === 'ShiftLeft') m.u = d ? 2 : 0;
  };

  /** Klick auf ein Bedienelement im Führerstand */
  private cabClick(e: PointerEvent) {
    if (!this.cab) return;
    const r = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, this.rig.cam);
    const hits = ray.intersectObjects(this.cab.controls.map((c) => c.obj), true);
    if (!hits.length || hits[0].distance > 3) return;
    let o: THREE.Object3D | null = hits[0].object;
    while (o && !o.userData.ctl) o = o.parent;
    const id = o?.userData.ctl as string | undefined;
    if (!id) return;
    const map: Record<string, Action> = { horn: 'horn', doorsL: 'doors', doorsR: 'doors', doorsClose: 'doorsClose', panto: 'panto', mainSwitch: 'mainSwitch', engine: 'mainSwitch', lights: 'lights', sand: 'sand', pzbAck: 'pzb', sifa: 'pzb', wipers: 'wipers', reverser: 'reverser', emergency: 'emergency', cabLight: 'cabLight', injector: 'injector', parking: 'parking', firing: 'firing' };
    if (id === 'throttle' || id === 'combined') { this.setLever(this.lever >= 0.95 ? (id === 'combined' ? -0.5 : 0) : this.lever < 0 ? 0 : this.lever + 0.25); toast(`Fahrhebel ${Math.round(this.lever * 100)} %`); return; }
    if (id === 'brake' || id === 'dyn') { this.manBrake = this.manBrake >= 0.95 ? 0 : this.manBrake + 0.25; toast(`Bremse ${Math.round(this.manBrake * 100)} %`); return; }
    if (id === 'cutoff') { const t = this.s.player; if (t) { t.ctl.cutoff = t.ctl.cutoff >= 0.7 ? -0.6 : Math.round((t.ctl.cutoff + 0.2) * 10) / 10; toast(`Steuerung ${Math.round(t.ctl.cutoff * 100)} %`); } return; }
    const a = map[id];
    if (a) { this.onAction(a, true); if (a === 'horn' || a === 'sand') setTimeout(() => this.onAction(a, false), 600); }
  }

  // ------------------------------------------------------------ Karte / Stellwerk
  openMap(on: boolean) {
    if (!on) { this.map?.dispose(); this.mapHost?.remove(); this.map = null; this.mapHost = null; return; }
    if (this.map) return;
    const full = this.o.mode === 'box';
    const cv = h('canvas', { 'aria-label': 'Gleisplan' });
    this.mapHost = h('div', { class: 'box2d', style: full ? '' : 'inset:auto 0 0 0;top:15vh;opacity:.97' }, cv,
      h('div', { style: 'position:absolute;right:10px;top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end' },
        full ? btn('3D-Ansicht', () => { this.mapHost!.style.display = this.mapHost!.style.display === 'none' ? '' : 'none'; }, 'btn small') : null,
        btn('Einpassen', () => this.map?.fit(), 'btn small'),
        !full ? btn('Schließen', () => this.openMap(false), 'btn small') : null),
      h('div', { class: 'small muted', style: 'position:absolute;left:10px;bottom:10px;max-width:70vw' }, full ? 'Fahrstraße: Startsignal antippen, dann Zielsignal. Eingestellte Fahrstraße am Startsignal antippen = zurücknehmen. Weiche antippen = umstellen.' : 'Weiche antippen = umstellen (nur wenn frei). Signale stellt der Fahrdienstleiter.'));
    this.root.appendChild(this.mapHost);
    this.map = new Map2D(cv, this.s.world, { interactive: true, manual: full ? this.s.world.manual : new Set(['__none__']), onMessage: (m, sev) => toast(m, sev), follow: full ? undefined : undefined });
    requestAnimationFrame(() => { if (full) this.map?.fitSignals(this.s.world.manual); else { const t = this.s.player; if (t) { const p = this.s.world.net.pos(t.head); this.map?.fit({ x0: p.x - 1500, x1: p.x + 1500, z0: p.z - 1000, z1: p.z + 1000 }); } } });
  }

  // ------------------------------------------------------------ Pause, Hilfe, Ergebnis
  setPaused(p: boolean) {
    if (this.resultShown) return;
    this.paused = p;
    this.pauseEl?.remove(); this.pauseEl = null;
    if (p) {
      this.ctx.audio.suspend();
      this.pauseEl = h('div', { class: 'overlay' }, h('div', { class: 'panel' },
        h('h2', null, 'Pause'), h('p', { class: 'muted' }, this.o.title),
        h('div', { class: 'menu' },
          btn('▶ Weiterfahren', () => this.setPaused(false), 'btn primary'),
          btn('❓ Hilfe & Tasten', () => this.showHelp()),
          btn('⚙ Einstellungen', () => this.ctx.openSettings(() => { this.qual = qualityOf(this.ctx.settings); })),
          btn('↻ Neu starten', () => { this.dispose(); this.ctx.exit(null, true); }),
          btn('✕ Fahrt beenden', () => { this.dispose(); this.ctx.exit(null); })),
        h('p', { class: 'notice' }, 'Simulation, kein offizielles Produkt der Deutschen Bahn. Alle Sicherungssysteme sind vereinfachte Spielmodelle.')));
      this.root.appendChild(this.pauseEl);
    } else { this.ctx.audio.resume(); this.last = performance.now(); }
  }

  showHelp() { void dialog('Hilfe', helpContent(this.s.player?.consist[0]?.type.cab ?? null, this.o.mode), ['Schließen']); }

  private showResult(r: Result) {
    this.resultShown = true;
    this.ctx.audio.play(r.ok ? 'ui_ok' : 'ui_err');
    const el = h('div', { class: 'overlay' }, h('div', { class: 'panel' },
      h('h2', null, r.ok ? 'Geschafft!' : 'Nicht bestanden'),
      r.reason ? h('p', { class: 'muted' }, r.reason) : null,
      h('div', { class: 'stars', 'aria-label': `${r.stars} von 3 Sternen` }, '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars)),
      h('table', { class: 't' }, r.items.map((i) => h('tr', null, h('td', null, i.label), h('td', null, i.value), h('td', { style: 'text-align:right' }, i.pts ? (i.pts > 0 ? '+' : '') + i.pts : '')))),
      h('p', null, h('b', null, `Punkte: ${r.score}`), r.xp ? `  ·  +${r.xp} Erfahrung` : ''),
      h('div', { class: 'row end' },
        btn('Weiter beobachten', () => { el.remove(); }, 'btn'),
        btn('Nochmal', () => { this.dispose(); this.ctx.exit(r, true); }),
        btn('Zum Menü', () => { this.dispose(); this.ctx.exit(r); }, 'btn primary'))));
    this.root.appendChild(el);
  }

  // ------------------------------------------------------------ Wiederholung & Foto
  private record(dt: number) {
    this.histT += dt;
    if (this.histT < 0.5) return;
    this.histT = 0;
    const cam = this.rig.cam.position;
    const poses: TrainPose[] = [];
    for (const t of this.s.world.trains.values()) { const p = this.s.world.net.pos(t.head); if (t.id === this.s.player?.id || Math.hypot(p.x - cam.x, p.z - cam.z) < 3000) poses.push(poseOf(t)); }
    this.history.push(poses);
    if (this.history.length > 600) this.history.shift();
  }
  private toggleReplay() {
    if (this.replay) { this.replay = null; toast('Wiederholung beendet'); this.hud.setReplay(false); return; }
    if (this.history.length < 4) { toast('Noch nichts aufgezeichnet.'); return; }
    this.replay = { poses: this.history.slice(), i: Math.max(0, this.history.length - 120), t: 0 };
    if (this.rig.mode === 'cab') this.rig.set('chase');
    this.hud.setReplay(true);
    toast('Wiederholung der letzten Minute (F8 beendet)');
  }
  private stepReplay(dt: number) {
    const r = this.replay!; r.t += dt;
    if (r.t >= 0.5) { r.t = 0; r.i++; if (r.i >= r.poses.length) { r.i = Math.max(0, r.poses.length - 120); } }
  }
  private screenshot() {
    this.renderer.render(this.scene, this.rig.cam);
    this.canvas.toBlob((b) => {
      if (!b) { toast('Bildschirmfoto nicht möglich', 'warn'); return; }
      const a = h('a', { href: URL.createObjectURL(b), download: `ricorail-${Date.now()}.png` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('Bildschirmfoto gespeichert');
    }, 'image/png');
  }

  // ------------------------------------------------------------ Ton
  private audio(dt: number, t: Train | null) {
    const au = this.ctx.audio; if (!au.ready) return;
    const w = this.s.world;
    const cam = this.rig.cam.position;
    const near = t ?? null;
    const st: AudioState = silentAudio();
    if (near && !this.replay) {
      const pw = Math.abs(near.tracF * near.v) / Math.max(1, near.consist.reduce((a, v) => a + (v.type.power ?? 0), 0) * 1000);
      Object.assign(st, {
        traction: near.traction, speed: Math.abs(near.v), throttle: near.ctl.throttle, power: Math.min(1, pw), dyn: near.ctl.dyn, brake: near.brake.cyl,
        engineRpm: near.engineRpm, compressor: near.brake.mainRes < 8.5, slip: near.slip, slide: near.slide, sand: near.ctl.sand,
        wheelAngle: near.odo / 0.46, cutoff: near.ctl.cutoff, rail: w.rail, curve: Math.min(1, 300 / Math.max(150, w.net.track(near.head.t).radius(near.head.s))),
        jointRate: Math.abs(near.v) / 25, tunnel: this.view.inTunnel(cam.x, cam.y, cam.z), inCab: this.rig.mode === 'cab',
        pantoArc: near.traction === 'electric' && near.pantoUp > 0.9 && Math.abs(near.v) > 25 && Math.random() < 0.02,
        doorsMoving: (near.doorL > 0.02 && near.doorL < 0.98) || (near.doorR > 0.02 && near.doorR < 0.98),
      });
      // entfernter Zug: leiser
      const hp = w.net.pos(near.head);
      if (this.rig.mode !== 'cab' && this.rig.mode !== 'passenger') { const d = Math.hypot(hp.x - cam.x, hp.z - cam.z); const f = Math.max(0, 1 - d / 600); st.speed *= f > 0 ? 1 : 0; st.power *= f; st.throttle *= f; }
    }
    st.rain = w.weather.kind === 'rain' ? 0.6 : w.weather.kind === 'storm' ? 1 : 0;
    st.wind = Math.min(1, w.weather.wind / 20 + (w.weather.kind === 'storm' ? 0.5 : 0));
    st.thunder = w.weather.kind === 'storm' && Math.random() < 0.002;
    let bell = 0;
    for (const cr of w.net.def.crossings) { const c = w.crossings.get(cr.id); if (!c || c.closed <= 0 || c.closed >= 1) continue; const p = w.net.track(cr.track).point(cr.s); const d = Math.hypot(p.x - cam.x, p.z - cam.z); bell = Math.max(bell, Math.max(0, 1 - d / 400)); }
    st.crossingBell = bell;
    const plan = t ? w.plans.get(t.id) : undefined;
    st.ambience = plan?.state === 'dwell' ? 0.6 : 0;
    const hour = (w.time / 3600) % 24;
    st.birds = w.weather.kind === 'clear' && hour > 5 && hour < 20 && w.weather.season !== 'winter' ? 0.4 : 0;
    au.update(dt, st);
  }
}

export function silentAudio(): AudioState {
  return { traction: 'none', speed: 0, throttle: 0, power: 0, dyn: 0, brake: 0, engineRpm: 0, compressor: false, slip: false, slide: false, sand: false, wheelAngle: 0, cutoff: 0, rail: 'dry', curve: 0, jointRate: 0, tunnel: false, inCab: false, rain: 0, wind: 0, thunder: false, crossingBell: 0, ambience: 0, birds: 0, pantoArc: false, doorsMoving: false };
}

/** Zustand für die Führerstandsanzeigen */
function cabState(t: Train, s: Session): CabState {
  const w = s.world;
  const la = lookahead(w.net, w.il, t.head, 2000, { pass: t.meta.zs1 as string | undefined });
  const sig = la.targets.find((x) => x.kind === 'signal');
  const tgt = la.targets.reduce<{ v: number; d: number } | null>((a, x) => (x.v < t.kmh / 3.6 && (!a || x.d < a.d) ? { v: x.v, d: x.d } : a), null);
  const plan = w.plans.get(t.id);
  const stop = plan?.svc?.stops[plan.stopIdx];
  const pw = t.consist.reduce((a, v) => a + (v.type.power ?? 0), 0);
  const tod = ((w.time % 86400) + 86400) % 86400;
  return {
    kmh: Math.abs(t.kmh), vmax: t.vmax, limit: w.limitUnder(t), target: tgt ? tgt.v * 3.6 : null, targetDist: tgt ? tgt.d : null,
    throttle: t.ctl.throttle, brake: t.ctl.brake, dyn: t.ctl.dyn, reverser: t.ctl.reverser, cutoff: t.ctl.cutoff,
    pipe: t.brake.pipe, cyl: t.brake.cyl, mainRes: t.brake.mainRes,
    power: pw > 0 ? Math.max(-1, Math.min(1, (t.tracF * t.v) / (pw * 1000))) : 0, panto: t.pantoUp, mainSwitch: t.ctl.mainSwitch, engineRpm: t.engineRpm,
    doorL: t.doorL, doorR: t.doorR, releaseL: t.ctl.releaseL, releaseR: t.ctl.releaseR, lights: t.ctl.lights, cabLight: t.ctl.cabLight, wipers: t.ctl.wipers,
    parking: t.ctl.parking, sand: t.ctl.sand, emergency: t.ctl.emergency,
    boiler: t.boiler, glass: t.glass, fire: t.fire, fuel: Math.max(0, Math.min(1, t.traction === 'steam' ? t.coal : t.fuel)),
    aspect: sig?.sig?.aspect ?? 'none',
    pzb: { warn: w.pzb.need > 0, monitor: w.pzb.monitor > 0, brake: t.forcedBrake === '!PZB' }, sifaWarn: t.sifaWarn, forced: !!t.forcedBrake,
    clock: hhmm(w.time), nextStop: stop ? w.stations.get(stop.st)?.name ?? '' : '', nextStopDist: null,
    gradient: w.net.gradeAt(t.head) * 1000, slip: t.slip, time: w.time, night: tod < 6.5 * 3600 || tod > 20 * 3600,
  };
}
