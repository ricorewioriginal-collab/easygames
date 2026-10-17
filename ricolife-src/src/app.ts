// App-Kern: verbindet Simulation, 3D-Darstellung, Eingabe, Oberfläche, Spielstände und Mehrspieler.
import * as THREE from 'three';
import { Audio } from './audio/audio';
import { BuildMode } from './build/build-mode';
import type { BuildHost } from './build/host';
import { lotById } from './data/lots';
import { CameraRig } from './input/camera';
import { Controls, moveFocus } from './input/controls';
import { isCode, MpGuest, MpHost, normCode, type GuestCard } from './net/mp';
import { SimsView } from './render/sims-view';
import { WorldView, type ViewMode } from './render/world-view';
import type { Quality } from './render/environment';
import { Game } from './sim/game';
import { runItem, type MenuItem, type Target } from './sim/menu';
import { exportJson, importJson, loadFromSlot, saveToSlot, SLOTS, slotInfo } from './sim/save';
import { createGame, type NewGameOpts } from './sim/setup';
import type { Settings, Sim } from './sim/types';
import { season } from './sim/world-sys';
import type { AppApi, Mode } from './ui/api';
import { openCas } from './ui/cas';
import { pumpDialogs } from './ui/dialogs';
import { btn, clear, closeTopModal, confirmDlg, h, modal, modalOpen, toast } from './ui/dom';
import { Hud } from './ui/hud';
import { Loading, MainMenu } from './ui/menu';
import { closePie, openPie, pieOpen } from './ui/pie';
import { openMap, openPhone } from './ui/phone';
import { defaultSettings, keyFor, KEY_ACTIONS, loadProfile, openHelp, openSettings, saveProfile, type Profile } from './ui/settings';
import { openSimInfo } from './ui/siminfo';

const AUTOSAVE_MS = 5 * 60 * 1000;
const PHASES = ['Stadt wird aufgebaut', 'Figuren erwachen', 'Häuser werden eingerichtet', 'Grafik wird vorbereitet', 'Los geht’s'];
const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

export class App implements AppApi {
  private game: Game | null = null;
  mode: Mode = 'live';
  level = 0;
  wallMode: ViewMode = 'cut';
  private profile: Profile = loadProfile();
  private settings: Settings = defaultSettings(this.profile);
  private canvas = document.getElementById('scene') as HTMLCanvasElement;
  private ui = document.getElementById('ui')!;
  private renderer!: THREE.WebGLRenderer;
  private rig = new CameraRig(window.innerWidth / Math.max(1, window.innerHeight));
  private controls!: Controls;
  private audio = new Audio();
  private wv: WorldView | null = null;
  private sv: SimsView;
  private hud: Hud | null = null;
  private build: BuildMode | null = null;
  private menu: MainMenu;
  private host: MpHost | null = null;
  private guest: MpGuest | null = null;
  private chatBox: HTMLElement | null = null;
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private last = performance.now();
  private hudAcc = 0;
  private hoverAcc = 0;
  private hoverXY: [number, number] | null = null;
  private hoverId: string | null = null;
  private lastSave = Date.now();
  private loading = false;
  private quality: Quality = 'mid';
  private fpsEl: HTMLElement | null = null;
  private fpsAcc = { t: 0, n: 0 };
  private unsub: (() => void)[] = [];

  constructor() {
    this.sv = new SimsView(this.ui);
    this.menu = new MainMenu({
      newGame: (o) => this.newGame(o),
      load: (slot, backup) => this.loadSlot(slot, backup),
      importFile: (text, slot) => this.importFile(text, slot),
      exportSlot: (slot) => this.exportSlot(slot),
      openCas: (done, opts) => {
        this.menu.hide();
        openCas(done, opts, () => this.menu.show());
      },
      openSettings: () => this.openSettings(),
      openHelp: () => openHelp(),
      openMultiplayer: () => this.openMultiplayer(),
      lastSlot: () => this.profile.lastSlot ?? null,
    });
  }

  // ---------- AppApi ----------
  get g(): Game {
    if (!this.game) throw new Error('Kein Spiel geladen');
    return this.game;
  }
  get isGuest(): boolean {
    return !!this.guest;
  }
  get isHost(): boolean {
    return !!this.host;
  }

  async start(progress: (p: number, text: string) => void): Promise<void> {
    progress(0.2, 'Grafik wird gestartet …');
    const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 4 && matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !lowEnd, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.quality = this.settings.quality === 'auto' ? (lowEnd ? 'low' : 'mid') : this.settings.quality;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.game && !this.guest) saveToSlot(this.game);
      toast('Die Grafik wurde vom Gerät zurückgesetzt. Dein Spiel ist gespeichert – bitte neu laden.', '⚠️', 'warn', 15000, () => location.reload());
    });
    this.controls = new Controls(this.canvas, this.rig, {
      tap: (x, y, b) => this.onTap(x, y, b),
      longPress: (x, y) => this.onTap(x, y, 2),
      hover: (x, y) => (this.hoverXY = [x, y]),
      dragStart: (x, y) => (this.mode !== 'live' && this.build ? this.build.dragStart(x, y) : false),
      dragMove: (x, y) => this.build?.dragMove(x, y),
      dragEnd: (x, y) => this.build?.dragEnd(x, y),
      key: (a, e) => this.onKey(a, e),
      pad: (b) => this.onPad(b),
      keymap: () => this.keymap(),
      edgeScroll: () => this.settings.edgeScroll,
      deadzone: () => this.settings.padDeadzone,
      uiBlocked: () => modalOpen() || !this.game || this.loading || !!document.getElementById('cas'),
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.autosave();
    });
    window.addEventListener('pagehide', () => this.autosave());
    this.applySettings();
    progress(0.6, 'Menü wird vorbereitet …');
    requestAnimationFrame(this.loop);
    // Schnellstart für Tests: ?e2e&new=household-id
    const q = new URLSearchParams(location.search);
    if (q.has('new')) this.newGame({ household: q.get('new') || undefined, slot: 3, seed: 7 });
    else if (q.has('load')) this.loadSlot(Number(q.get('load')) || 1);
    else this.menu.show();
  }

  private resize(): void {
    const W = window.innerWidth,
      H = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, this.quality === 'low' ? 1.25 : 2) * this.settings.resScale;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(W, H, false);
    this.rig.setAspect(W / Math.max(1, H));
  }

  private keymap(): Record<string, string> {
    const m: Record<string, string> = {};
    for (const k of KEY_ACTIONS) m[keyFor(this.settings, k.id)] = k.id;
    return m;
  }

  /** schwerer Fehler nach dem Start: Spiel sichern und Hinweis zeigen */
  fatal(text: string): void {
    try {
      if (this.game && !this.guest) saveToSlot(this.game);
    } catch {
      /* egal */
    }
    const d = h('div', { id: 'err' }, h('div', null, h('h2', null, 'RicoLife 3D hat ein Problem'), h('p', null, text), h('p', { class: 'muted' }, 'Dein letzter Stand wurde gespeichert.'), btn('Neu laden', () => location.reload(), 'primary')));
    document.body.appendChild(d);
  }

  // ---------- Spielstart ----------
  private async enter(make: () => Game | Promise<Game>, retry: () => void): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.menu.hide();
    this.leaveGame();
    const ld = new Loading(PHASES);
    let timedOut = false;
    const to = setTimeout(() => {
      timedOut = true;
      ld.fail('Das Laden dauert ungewöhnlich lange.', () => {
        ld.done();
        this.loading = false;
        retry();
      }, () => {
        ld.done();
        this.loading = false;
        this.toMenuClean();
      });
    }, 45000);
    try {
      ld.phase(0);
      await frame();
      const g = await make();
      if (timedOut) return;
      ld.phase(1);
      await frame();
      this.game = g;
      if (!this.guest) {
        // Darstellungs- und Steuerungsoptionen kommen aus dem Profil, Spielregeln aus dem Spielstand
        for (const k of ['quality', 'shadows', 'resScale', 'fps', 'volume', 'music', 'bigText', 'reduceMotion', 'highContrast', 'keys', 'padDeadzone', 'edgeScroll', 'maxNpcs'] as const) (g.settings as unknown as Record<string, unknown>)[k] = this.settings[k];
      }
      this.settings = g.settings;
      ld.phase(2);
      await frame();
      const wv = new WorldView(g.world, this.renderer, { quality: this.quality, shadows: this.settings.shadows && this.quality !== 'low' });
      wv.buildStatic();
      wv.scene.add(this.sv.group);
      this.wv = wv;
      ld.phase(3);
      await frame();
      const a = g.active;
      const lot = g.hh?.lot ? lotById(g.hh.lot) : null;
      if (a) this.rig.focus(a.x, a.z, true);
      else if (lot) this.rig.focus(lot.x + lot.w / 2, lot.z + lot.d / 2, true);
      this.level = a?.l ?? 0;
      this.rig.setLevel(this.level);
      this.rig.dist = 24;
      wv.setView(this.wallMode, this.level, { x: this.rig.tx, z: this.rig.tz }, this.rig.yaw);
      wv.setEnvironment(g.clock.minOfDay, season(g), g.weather.now, g.clock.dayOfSeason);
      wv.syncLots();
      this.renderer.compile(wv.scene, this.rig.cam);
      this.hud = new Hud(this);
      this.ui.appendChild(this.hud.el);
      this.build = new BuildMode(this.buildHost());
      this.unsub.push(
        g.bus.on('notify', (n) => {
          if (n.sim && n.sim !== g.activeSim && !g.members().some((m) => m.id === n.sim)) return;
          toast(n.text, n.icon ?? 'ℹ️', n.kind ?? 'info', 4200, n.sim ? () => this.select(n.sim!) : undefined);
          this.sfx(n.kind === 'good' ? 'good' : n.kind === 'bad' ? 'bad' : 'notify');
        }),
        g.bus.on('interaction', (e) => {
          if (e.id === 'shop' && e.sim === g.activeSim) this.openPhone('shop');
        }),
        g.bus.on('skill', (e) => {
          if (g.members().some((m) => m.id === e.sim) || e.sim === g.activeSim) this.sfx('levelup');
        }),
        g.bus.on('money', (e) => {
          if (e.hh === g.activeHh && e.amount > 0) this.sfx('coin');
        }),
      );
      ld.phase(4);
      await frame();
      clearTimeout(to);
      ld.done();
      this.loading = false;
      this.lastSave = Date.now();
      this.setMode('live');
      if (!this.guest && !this.settings.tutorialDone) this.tutorial();
    } catch (err) {
      clearTimeout(to);
      console.error(err);
      if (timedOut) return;
      this.leaveGame();
      ld.fail(`Laden fehlgeschlagen: ${(err as Error).message ?? String(err)}`, () => {
        ld.done();
        this.loading = false;
        retry();
      }, () => {
        ld.done();
        this.loading = false;
        this.toMenuClean();
      });
    }
  }

  newGame(o: NewGameOpts): void {
    void this.enter(() => {
      const g = createGame(o);
      g.settings = { ...g.settings, ...this.settings, keys: { ...this.settings.keys } };
      g.settings.tutorialDone = !!this.profile.tutorial;
      this.profile.lastSlot = g.slot;
      saveProfile(this.profile);
      saveToSlot(g);
      return g;
    }, () => this.newGame(o));
  }
  loadSlot(slot: number, backup = false): void {
    void this.enter(() => {
      const g = loadFromSlot(slot, backup);
      g.slot = slot;
      this.profile.lastSlot = slot;
      saveProfile(this.profile);
      return g;
    }, () => this.loadSlot(slot, backup));
  }
  private importFile(text: string, slot: number): void {
    try {
      const g = importJson(text, slot);
      toast(`Spielstand „${g.saveName}“ auf Platz ${slot} importiert.`, '📥', 'good');
      this.loadSlot(slot);
    } catch (e) {
      toast(`Import fehlgeschlagen: ${(e as Error).message}`, '⚠️', 'bad', 7000);
      this.menu.show();
    }
  }
  private exportSlot(slot: number): void {
    try {
      const g = loadFromSlot(slot);
      const blob = new Blob([exportJson(g)], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `ricolife-platz${slot}-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 2000);
    } catch (e) {
      toast(`Export fehlgeschlagen: ${(e as Error).message}`, '⚠️', 'bad');
    }
  }

  /** aktuelles Spiel abbauen (ohne Menü) */
  private leaveGame(): void {
    closePie();
    while (closeTopModal()) {
      /* alle schließen */
    }
    this.build?.close();
    this.build = null;
    for (const u of this.unsub) u();
    this.unsub = [];
    this.hud?.el.remove();
    this.hud = null;
    this.chatBox?.remove();
    this.chatBox = null;
    if (this.wv) {
      this.wv.scene.remove(this.sv.group);
      this.wv.dispose();
      this.wv = null;
    }
    this.sv.dispose();
    this.sv = new SimsView(this.ui);
    this.game = null;
    this.mode = 'live';
  }
  private toMenuClean(): void {
    this.host?.stop();
    this.host = null;
    this.guest?.leave(true);
    this.guest = null;
    this.leaveGame();
    this.menu.show();
  }
  toMainMenu(): void {
    if (this.guest) return confirmDlg('Besuch beenden?', 'Du verlässt das Spiel des Gastgebers.', 'Verlassen', () => this.toMenuClean());
    this.saveNow();
    this.toMenuClean();
  }

  // ---------- Speichern ----------
  saveNow(manual = false): void {
    const g = this.game;
    if (!g || this.guest) return;
    const r = saveToSlot(g);
    this.lastSave = Date.now();
    if (manual) toast(r.ok ? `Gespeichert (Platz ${g.slot}).` : `Speichern fehlgeschlagen: ${r.error ?? ''}`, r.ok ? '💾' : '⚠️', r.ok ? 'good' : 'bad');
    else if (!r.ok) toast(`Automatisches Speichern fehlgeschlagen: ${r.error ?? ''}`, '⚠️', 'warn');
  }
  private autosave(): void {
    if (this.game && !this.guest && !this.loading) this.saveNow();
  }

  // ---------- Hauptschleife ----------
  private loop = (now: number): void => {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (document.hidden) return;
    const g = this.game;
    this.controls.update(dt);
    this.rig.update(dt);
    this.audio.update();
    if (!g || !this.wv) {
      return;
    }
    try {
      if (this.guest) g.step(dt * [0, 1, 3, 10][this.guest.speed]!);
      else g.tick(dt);
      this.host?.update(dt, g.clock.speed);
    } catch (e) {
      console.error('[sim]', e);
    }
    g.focus.x = this.rig.focusX;
    g.focus.z = this.rig.focusZ;
    const wv = this.wv;
    wv.setView(this.mode === 'live' ? this.wallMode : this.wallMode === 'up' ? 'cut' : this.wallMode, this.level, { x: this.rig.focusX, z: this.rig.focusZ }, this.rig.smoothYaw);
    wv.setEnvironment(g.clock.minOfDay, season(g), g.weather.now, g.clock.dayOfSeason);
    wv.syncLots();
    wv.update(dt, this.rig.cam);
    this.sv.setLevel(this.level, this.wallMode !== 'up' || this.mode !== 'live');
    this.sv.update(g, dt, this.rig.cam, { x: this.rig.focusX, z: this.rig.focusZ }, g.activeSim, this.mode === 'live' ? this.hoverSim() : null);
    this.build?.update(dt);
    this.hoverAcc += dt;
    if (this.hoverAcc > 0.12 && this.hoverXY && this.mode === 'live') {
      this.hoverAcc = 0;
      this.doHover(this.hoverXY[0], this.hoverXY[1]);
    } else if (this.mode !== 'live' && this.hoverXY) {
      this.build?.hover(this.hoverXY[0], this.hoverXY[1]);
      this.hoverXY = null;
    }
    this.renderer.render(wv.scene, this.rig.cam);
    this.hudAcc += dt;
    if (this.hudAcc > 0.25) {
      this.hudAcc = 0;
      this.hud?.update();
      if (!this.loading) pumpDialogs(this);
      this.audio.setMood(this.mode !== 'live' ? 'build' : g.clock.hour >= 21 || g.clock.hour < 6 ? 'night' : 'day');
      if (!this.guest && Date.now() - this.lastSave > AUTOSAVE_MS && !modalOpen()) this.saveNow();
    }
    if (this.settings.fps) this.fps(dt);
  };

  private fps(dt: number): void {
    if (!this.fpsEl) {
      this.fpsEl = h('div', { class: 'fps' });
      document.body.appendChild(this.fpsEl);
    }
    this.fpsAcc.t += dt;
    this.fpsAcc.n++;
    if (this.fpsAcc.t >= 1) {
      const info = this.renderer.info.render;
      this.fpsEl.textContent = `${Math.round(this.fpsAcc.n / this.fpsAcc.t)} FPS · ${info.calls} Aufrufe · ${Math.round(info.triangles / 1000)}k Dreiecke`;
      this.fpsAcc = { t: 0, n: 0 };
    }
  }

  // ---------- Auswahl/Picking ----------
  private setRay(x: number, y: number): void {
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.rig.cam);
  }
  private hoverSimId: string | null = null;
  private hoverSim(): string | null {
    return this.hoverSimId;
  }
  private doHover(x: number, y: number): void {
    if (!this.wv || pieOpen() || modalOpen()) return;
    this.setRay(x, y);
    const hit = this.sv.pick(this.ray);
    this.hoverSimId = hit?.sim ?? null;
    const obj = hit ? null : this.wv.pickObject(this.ray);
    if (obj !== this.hoverId) {
      this.hoverId = obj;
      this.wv.highlightObject(obj);
    }
  }
  private groundAt(x: number, y: number): { x: number; z: number } | null {
    if (!this.wv) return null;
    this.setRay(x, y);
    return this.wv.pickGround(this.ray.ray, this.level);
  }

  private onTap(x: number, y: number, _button: number): void {
    const g = this.game;
    if (!g || !this.wv || this.loading) return;
    this.audio.play('click');
    if (this.mode !== 'live') {
      this.build?.tap(x, y, _button);
      return;
    }
    if (closePie()) return;
    const me = g.active;
    if (!me) return;
    this.setRay(x, y);
    const hit = this.sv.pick(this.ray);
    if (hit?.sim) {
      const s = g.sims.get(hit.sim);
      if (!s) return;
      if (s.id === me.id) return openPie(this, { kind: 'self' }, x, y);
      if (!this.guest && g.isControllable(s)) return this.select(s.id);
      return openPie(this, { kind: 'sim', t: s }, x, y);
    }
    if (hit?.pet) {
      const p = g.pets.get(hit.pet);
      if (p) return openPie(this, { kind: 'pet', p }, x, y);
    }
    const oid = this.wv.pickObject(this.ray);
    const o = oid ? g.world.objs.get(oid) : undefined;
    if (o) return openPie(this, { kind: 'obj', o }, x, y);
    const gp = this.wv.pickGround(this.ray.ray, this.level);
    if (gp) openPie(this, { kind: 'ground', x: gp.x, z: gp.z, l: this.level }, x, y);
  }

  select(simId: string): void {
    const g = this.game;
    if (!g || this.guest) return;
    const s = g.sims.get(simId);
    if (!s || !g.isControllable(s)) return;
    g.activeSim = s.id;
    this.sfx('click');
    if (!s.away) {
      this.focusOn(s.x, s.z);
      if (s.l !== this.level) this.setLevel(s.l);
    }
  }
  focusOn(x: number, z: number, snap = false): void {
    this.rig.focus(x, z, snap);
  }
  private nextSim(dir = 1): void {
    const g = this.game;
    if (!g || this.guest) return;
    const ms = g.members().filter((m) => g.isControllable(m));
    if (!ms.length) return;
    const i = ms.findIndex((m) => m.id === g.activeSim);
    this.select(ms[(i + dir + ms.length) % ms.length]!.id);
  }

  command(simId: string, tg: Target, it: MenuItem): void {
    const g = this.game;
    if (!g) return;
    if (!it.def) {
      // „Ich“-Knopf in der Figurenkarte: Menü für die eigene Figur
      const p = this.sv.screenPos(g, simId, this.rig.cam) ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      openPie(this, { kind: 'self' }, p.x, p.y);
      return;
    }
    if (this.guest) {
      this.guest.command(it.def, tg.kind === 'obj' ? tg.o.id : undefined, tg.kind === 'sim' ? tg.t.id : tg.kind === 'pet' ? tg.p.id : undefined, it.data);
      return;
    }
    const s = g.sims.get(simId);
    if (!s) return;
    if (!runItem(g, s, tg, it) && it.avail !== true) toast(it.avail, '⚠️', 'warn');
  }
  cancel(simId: string, uid: number): void {
    const g = this.game;
    if (!g) return;
    if (this.guest) return this.guest.cancel(uid);
    const s = g.sims.get(simId);
    if (s) g.cancelAction(s, uid);
  }

  // ---------- Modi & Ansicht ----------
  setMode(m: Mode): void {
    const g = this.game;
    if (!g) return;
    if (m !== 'live') {
      if (this.guest) return toast('Als Gast kannst du nicht bauen.', '🔒', 'warn');
      if (!g.hh?.lot) return toast('Dein Haushalt hat kein Grundstück. Such dir über das Handy ein Zuhause.', '🏠', 'warn');
    }
    closePie();
    const prev = this.mode;
    this.mode = m;
    if (m === 'live') {
      if (prev !== 'live') this.build?.close();
      this.wv?.setGrid(false);
    } else this.build?.open(m === 'buy' ? 'buy' : 'build');
    this.hud?.setCompact(m !== 'live');
    document.body.dataset.mode = m;
    this.wv?.highlightObject(null);
    this.hoverId = null;
  }
  setSpeed(i: number): void {
    const g = this.game;
    if (!g) return;
    if (this.guest) return toast('Das Tempo bestimmt der Gastgeber.', '⏱️');
    g.clock.speed = Math.max(0, Math.min(3, i));
    this.hud?.update();
  }
  setLevel(l: number): void {
    this.level = l ? 1 : 0;
    this.rig.setLevel(this.level);
    this.hud?.update();
  }
  setWallMode(m: ViewMode): void {
    this.wallMode = m;
    toast(m === 'up' ? 'Wände: hoch' : m === 'cut' ? 'Wände: Schnittansicht' : 'Wände: unten', '🧱', 'info', 1400);
  }
  sfx(name: string): void {
    this.audio.play(name);
  }

  private buildHost(): BuildHost {
    const self = this;
    return {
      get g() {
        return self.g;
      },
      get scene() {
        return self.wv!.scene;
      },
      uiRoot: this.ui,
      groundAt: (x, y) => this.groundAt(x, y),
      pickObject: (x, y) => {
        if (!this.wv) return null;
        this.setRay(x, y);
        return this.wv.pickObject(this.ray);
      },
      level: () => this.level,
      setLevel: (l) => this.setLevel(l),
      lot: () => (this.game?.hh?.lot ? lotById(this.game.hh.lot) ?? null : null),
      focusLot: () => {
        const L = this.game?.hh?.lot ? lotById(this.game.hh.lot) : null;
        if (L) this.rig.focus(L.x + L.w / 2, L.z + L.d / 2);
      },
      highlight: (id) => this.wv?.highlightObject(id),
      grid: (on) => this.wv?.setGrid(on, this.game?.hh?.lot ?? undefined, this.level),
      sfx: (n) => this.sfx(n),
      toast: (t, i, k) => toast(t, i, k),
      closed: () => {
        if (this.mode !== 'live') {
          this.mode = 'live';
          this.hud?.setCompact(false);
          document.body.dataset.mode = 'live';
          this.wv?.setGrid(false);
        }
      },
    };
  }

  // ---------- Tastatur & Controller ----------
  private onKey(a: string, e: KeyboardEvent): void {
    if (document.getElementById('cas')) return;
    if (a === 'escape') {
      if (closePie()) return;
      if (closeTopModal()) return;
      if (this.mode !== 'live' && this.build?.key('escape')) return;
      if (this.mode !== 'live') return this.setMode('live');
      if (this.game) this.openPauseMenu();
      return;
    }
    const g = this.game;
    if (!g || modalOpen()) return;
    if (this.mode !== 'live' && this.build?.key(a)) return e.preventDefault();
    switch (a) {
      case 'pause':
        this.setSpeed(g.clock.speed === 0 ? 1 : 0);
        break;
      case 'speed1':
        this.setSpeed(1);
        break;
      case 'speed2':
        this.setSpeed(2);
        break;
      case 'speed3':
        this.setSpeed(3);
        break;
      case 'buy':
        this.setMode(this.mode === 'buy' ? 'live' : 'buy');
        break;
      case 'build':
        this.setMode(this.mode === 'build' ? 'live' : 'build');
        break;
      case 'live':
        this.setMode('live');
        break;
      case 'phone':
        this.openPhone();
        break;
      case 'map':
        this.openMap();
        break;
      case 'nextSim':
        this.nextSim(e.shiftKey ? -1 : 1);
        break;
      case 'level':
        this.setLevel(this.level ? 0 : 1);
        break;
      case 'levelDown':
        this.setLevel(0);
        break;
      case 'walls':
        this.setWallMode(this.wallMode === 'up' ? 'cut' : this.wallMode === 'cut' ? 'down' : 'up');
        break;
    }
  }
  private onPad(b: string): void {
    if (document.getElementById('cas') || modalOpen() || pieOpen() || !this.game) {
      if (b === 'dup' || b === 'dleft') moveFocus(-1);
      else if (b === 'ddown' || b === 'dright') moveFocus(1);
      else if (b === 'a') (document.activeElement as HTMLElement | null)?.click();
      else if (b === 'b') {
        if (!closePie()) closeTopModal();
      } else if (b === 'start' && !this.game) moveFocus(1);
      return;
    }
    if (this.mode !== 'live' && this.build?.pad(b)) return;
    const cx = window.innerWidth / 2,
      cy = window.innerHeight / 2;
    switch (b) {
      case 'a':
        this.onTap(cx, cy, 0);
        break;
      case 'b':
        if (this.mode !== 'live') this.setMode('live');
        break;
      case 'x':
        this.openPhone();
        break;
      case 'y': {
        const g = this.g;
        if (g.activeSim) this.command(g.activeSim, { kind: 'self' }, { def: '', label: '', icon: '', group: '', avail: true });
        break;
      }
      case 'lb':
        this.nextSim(-1);
        break;
      case 'rb':
        this.nextSim(1);
        break;
      case 'start':
        this.openPauseMenu();
        break;
      case 'back':
        this.openMap();
        break;
      case 'dup':
        this.setLevel(1);
        break;
      case 'ddown':
        this.setLevel(0);
        break;
      case 'dleft':
        this.setSpeed(Math.max(0, this.g.clock.speed - 1));
        break;
      case 'dright':
        this.setSpeed(Math.min(3, this.g.clock.speed + 1));
        break;
    }
  }

  // ---------- Menüs ----------
  openPauseMenu(): void {
    const g = this.game;
    if (!g) return;
    const prev = g.clock.speed;
    if (!this.host && !this.guest) g.clock.speed = 0;
    const m = modal({
      title: 'Pause',
      icon: '⏸',
      onClose: () => {
        if (!this.host && !this.guest && this.game === g && g.clock.speed === 0) g.clock.speed = prev || 1;
      },
      body: h(
        'div',
        { class: 'col' },
        btn('▶ Weiterspielen', () => m.close(), 'primary', { id: 'pResume' }),
        this.guest ? null : btn('💾 Speichern', () => this.saveNow(true), '', { id: 'pSave' }),
        this.guest ? null : btn('📂 Speichern auf Platz …', () => this.saveAs(), '', { id: 'pSaveAs' }),
        btn('🌐 Mehrspieler', () => this.openMultiplayer(), '', { id: 'pMulti' }),
        btn('⚙️ Einstellungen', () => this.openSettings(), '', { id: 'pSettings' }),
        btn('❓ Hilfe', () => openHelp(), '', { id: 'pHelp' }),
        btn('🏠 Hauptmenü', () => {
          m.close();
          this.toMainMenu();
        }, 'warm', { id: 'pMenu' }),
      ),
    });
  }
  private saveAs(): void {
    const g = this.game;
    if (!g) return;
    const m = modal({
      title: 'Speichern auf Platz',
      icon: '💾',
      body: h('div', { class: 'col' }, SLOTS.map((sl) => {
        const i = slotInfo(sl);
        return btn(`Platz ${sl}: ${i.empty ? 'leer' : i.name ?? 'beschädigt'}`, () => {
          const go = (): void => {
            g.slot = sl;
            this.profile.lastSlot = sl;
            saveProfile(this.profile);
            this.saveNow(true);
            m.close();
          };
          if (!i.empty && sl !== g.slot) confirmDlg('Überschreiben?', `Platz ${sl} wirklich überschreiben?`, 'Überschreiben', go);
          else go();
        }, sl === g.slot ? 'primary' : '');
      })),
    });
  }
  openPhone(app?: string): void {
    if (!this.game) return;
    if (this.guest && app && app !== 'contacts') return;
    openPhone(this, app);
  }
  openMap(): void {
    if (this.game) openMap(this);
  }
  openSimInfo(simId: string, tab?: string): void {
    if (this.game && simId) openSimInfo(this, simId, tab);
  }
  openHelp(): void {
    openHelp();
  }
  openSettings(): void {
    const s = this.game?.settings ?? this.settings;
    openSettings(s, (ns, key) => {
      this.settings = ns;
      if (this.game) this.game.settings = ns;
      // Darstellung/Steuerung bleibt geräteweit im Profil
      this.profile.settings = { ...this.profile.settings, [key]: ns[key] };
      saveProfile(this.profile);
      this.applySettings(key);
    }, !!this.game);
  }
  private applySettings(key?: keyof Settings): void {
    const s = this.settings;
    this.audio.setVolumes(s.volume, s.music);
    document.body.classList.toggle('bigtext', s.bigText);
    document.body.classList.toggle('contrast', s.highContrast);
    document.body.classList.toggle('reduce', s.reduceMotion);
    this.rig.reduceMotion = s.reduceMotion;
    if (!s.fps && this.fpsEl) {
      this.fpsEl.remove();
      this.fpsEl = null;
    }
    if (!key || key === 'quality' || key === 'shadows' || key === 'resScale') {
      const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 4 && matchMedia('(pointer: coarse)').matches;
      this.quality = s.quality === 'auto' ? (lowEnd ? 'low' : 'mid') : s.quality;
      if (this.renderer) this.resize();
      const sh = s.shadows && this.quality !== 'low';
      this.wv?.setQuality(this.quality, sh);
      this.sv.setShadows(sh);
    }
  }

  private tutorial(): void {
    const steps: [string, string][] = [
      ['Tippe auf Gegenstände, Personen oder den Boden, um Aktionen zu wählen.', '👆'],
      ['Ziehe mit einem Finger zum Verschieben, mit zwei zum Drehen und Zoomen (Maus: rechte Taste dreht, Rad zoomt).', '🧭'],
      ['Oben links wechselst du die Figur, unten siehst du Bedürfnisse und die Warteschlange.', '🧑'],
      ['Rechts geht es zum Kauf- und Baumodus, zum Handy und zur Stadtkarte.', '🛋️'],
    ];
    steps.forEach(([t, i], n) => setTimeout(() => this.game && toast(t, i, 'info', 6500), 800 + n * 7000));
    this.settings.tutorialDone = true;
    this.profile.tutorial = true;
    saveProfile(this.profile);
  }

  // ---------- Mehrspieler ----------
  openMultiplayer(): void {
    const body = h('div', { class: 'col' });
    const m = modal({ title: 'Mehrspieler', icon: '🌐', body, wide: true });
    const render = (): void => {
      clear(body);
      body.appendChild(h('p', { class: 'muted' }, 'Spielt gemeinsam auf einem Grundstück: Ein Gerät ist Gastgeber, bis zu drei Freunde besuchen es mit eigener Figur. Verbunden wird über den Google-Cloud-Dienst von easygames (Firebase), gespielt direkt von Gerät zu Gerät. Nur der Gastgeber baut, speichert und bestimmt das Tempo.'));
      if (this.host) {
        body.append(
          h('div', { class: 'card col' }, h('b', null, 'Du bist Gastgeber'), h('div', { class: 'code', id: 'mpCode' }, this.host.code), h('small', { class: 'muted' }, 'Gib diesen Code deinen Freunden. Sie wählen „Beitreten“.'), h('small', null, `Gäste: ${this.host.guestNames.join(', ') || 'noch niemand'}`)),
          btn('Mehrspieler beenden', () => {
            this.host?.stop();
            this.host = null;
            this.chatBox?.remove();
            this.chatBox = null;
            render();
          }, 'danger'),
        );
        return;
      }
      if (this.guest) {
        body.append(h('div', { class: 'card' }, `Du besuchst ${this.guest.hostName || 'den Gastgeber'}.`), btn('Besuch beenden', () => {
          m.close();
          this.toMenuClean();
        }, 'danger'));
        return;
      }
      const g = this.game;
      body.append(
        h('div', { class: 'card col' },
          h('b', null, '🏠 Gastgeber sein'),
          h('small', { class: 'muted' }, g ? 'Lade Freunde in dein aktuelles Spiel ein.' : 'Starte oder lade zuerst ein Spiel, dann kannst du Gäste einladen.'),
          btn('Spiel öffnen', () => this.startHost(render), g && g.hh?.lot ? 'primary' : '', { id: 'mpHost', disabled: !(g && g.hh?.lot) }),
        ),
        h('div', { class: 'card col' },
          h('b', null, '🚪 Beitreten'),
          h('label', { class: 'field' }, h('span', null, 'Code'), h('input', { id: 'mpJoinCode', maxlength: 5, autocomplete: 'off', placeholder: 'ABCDE', style: 'text-transform:uppercase;letter-spacing:4px' })),
          h('div', { class: 'row' }, h('small', { class: 'grow', id: 'mpChar' }, this.charLabel()), btn('Figur gestalten', () => this.editGuestChar(() => render()), 'small')),
          btn('Beitreten', () => {
            const code = normCode((document.getElementById('mpJoinCode') as HTMLInputElement).value);
            if (!isCode(code)) return toast('Bitte einen 5-stelligen Code eingeben.', '⚠️', 'warn');
            if (this.game) {
              confirmDlg('Spiel verlassen?', 'Dein Spiel wird gespeichert und du besuchst das Spiel deines Freundes.', 'Beitreten', () => {
                m.close();
                this.join(code);
              });
            } else {
              m.close();
              this.join(code);
            }
          }, 'primary', { id: 'mpJoin' }),
        ),
      );
    };
    render();
  }
  private charLabel(): string {
    const c = this.profile.mpChar as GuestCard | undefined;
    return c?.first ? `Deine Figur: ${c.first} ${c.last}` : 'Noch keine eigene Figur – es wird eine zufällige erstellt.';
  }
  private editGuestChar(done: () => void): void {
    const c = this.profile.mpChar as GuestCard | undefined;
    openCas((custom) => {
      const mbr = custom.members[0];
      if (!mbr) return;
      this.profile.mpChar = { first: mbr.first, last: mbr.last, pronoun: mbr.pronoun, age: mbr.age, traits: mbr.traits, look: mbr.look, skills: c?.skills } satisfies GuestCard;
      saveProfile(this.profile);
      done();
    }, { single: true, title: 'Deine Figur für Besuche', initial: c?.first ? [{ first: c.first, last: c.last, pronoun: c.pronoun, age: c.age, traits: c.traits, aspiration: 'friends', look: c.look }] : undefined });
  }
  private async startHost(render: () => void): Promise<void> {
    const g = this.game;
    if (!g || this.host) return;
    toast('Spiel wird geöffnet …', '🌐', 'info', 2500);
    const host = new MpHost(g, {
      status: (t) => toast(t, '🌐', 'warn'),
      chat: (name, text, own) => this.chatLine(name, text, own),
      ended: () => undefined,
      guests: (names) => {
        this.hud?.update();
        if (!names.length) toast('Alle Gäste sind gegangen.', '👋');
      },
    }, g.active?.first ?? 'Gastgeber');
    this.host = host;
    try {
      await host.listen();
      this.showChat();
      render();
    } catch (e) {
      this.host = null;
      host.stop();
      toast(`Mehrspieler nicht möglich: ${(e as Error).message}. Prüfe die Internetverbindung.`, '⚠️', 'bad', 7000);
      render();
    }
  }
  private join(code: string): void {
    if (this.game) this.saveNow();
    let card = this.profile.mpChar as GuestCard | undefined;
    if (!card?.first) card = undefined;
    const guest = new MpGuest({
      status: (t) => toast(t, '🌐'),
      chat: (name, text, own) => this.chatLine(name, text, own),
      ended: (reason) => {
        if (this.guest !== guest) return;
        this.guest = null;
        toast(reason, '🌐', 'warn', 6000);
        this.leaveGame();
        this.menu.show();
      },
      me: (s) => this.keepGuestProgress(s),
      notify: (t, i, k) => toast(t, i, k as 'info'),
    });
    this.host?.stop();
    this.host = null;
    this.guest = guest;
    const fallback: GuestCard = card ?? { first: 'Gast', last: 'Besuch', pronoun: 'they', age: 'youngadult', traits: [], look: undefined as never };
    void this.enter(async () => {
      try {
        return await guest.join(code, fallback.first, fallback);
      } catch (e) {
        this.guest = null;
        throw e;
      }
    }, () => this.join(code)).then(() => {
      if (this.guest === guest && this.game) {
        this.showChat();
        this.focusOn(this.game.active?.x ?? 80, this.game.active?.z ?? 50, true);
      }
    });
  }
  private keepGuestProgress(s: Sim): void {
    const c = this.profile.mpChar as GuestCard | undefined;
    if (!c?.first) return;
    c.skills = { ...s.skills };
    saveProfile(this.profile);
  }
  private showChat(): void {
    if (this.chatBox) return;
    const log = h('div', { class: 'chatlog', 'aria-live': 'polite' });
    const inp = h('input', { maxlength: 140, placeholder: 'Nachricht …', 'aria-label': 'Chatnachricht', enterkeyhint: 'send' });
    const send = (): void => {
      const t = inp.value.trim();
      if (!t) return;
      if (this.guest) this.guest.chat(t);
      else this.host?.chat(t);
      inp.value = '';
    };
    inp.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') send();
    });
    this.chatBox = h('div', { class: 'chat', id: 'chat' }, log, h('div', { class: 'row' }, inp, btn('➤', send, 'small', { 'aria-label': 'Senden' })));
    this.ui.appendChild(this.chatBox);
  }
  private chatLine(name: string, text: string, own: boolean): void {
    this.showChat();
    const log = this.chatBox!.querySelector('.chatlog')!;
    log.appendChild(h('div', { class: own ? 'own' : '' }, h('b', null, name + ': '), text));
    while (log.children.length > 30) log.firstChild!.remove();
    log.scrollTop = log.scrollHeight;
    if (!own) this.sfx('chat');
  }
}
