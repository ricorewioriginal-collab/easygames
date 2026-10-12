/** Anwendungssteuerung: verbindet Zustände, Audio, Eingabe, Logik und Darstellung. */
import { AudioEngine } from './audio/engine';
import { STEPS_PER_BAR, STEPS_PER_BEAT } from './audio/music';
import { StateMachine } from './core/fsm';
import { damp } from './core/math';
import type { SaveStore } from './core/storage';
import { DIFFICULTIES, type Difficulty } from './game/difficulty';
import { LEVELS, levelById, type LevelDef } from './game/levels';
import { MODES, buildTrack, nextLevel, speedFactor, type ModeId } from './game/modes';
import { gradeFor, starsFor } from './game/scoring';
import { GameSession, type SessionEvent } from './game/session';
import type { Track } from './game/track';
import { TUTORIAL_ENERGY_BAR, hintForBar } from './game/tutorial';
import { newlyUnlocked } from './game/unlocks';
import type { TimedAction } from './input/actions';
import { InputManager } from './input/input';
import { WorldRenderer } from './render/world';
import { Hud } from './ui/hud';
import { Menus, type MenuHost } from './ui/menus';

interface Run {
  mode: ModeId;
  level: LevelDef;
  difficulty: Difficulty;
  track: Track;
  session: GameSession;
  resumeAt: number | null;
  ending: boolean;
  autoplay: boolean;
}

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
}

export class App implements MenuHost {
  readonly audio = new AudioEngine();
  readonly fsm = new StateMachine();
  private readonly renderer: WorldRenderer;
  private readonly input: InputManager;
  private readonly hud: Hud;
  private readonly menus: Menus;
  private run: Run | null = null;
  private lanePos = 1;
  private idleTime = 0;
  private last = performance.now();
  private previewed: LevelDef;
  private installEvent: InstallPrompt | null = null;
  private touchSeen: boolean;
  autoplayDefault = false;

  constructor(
    readonly store: SaveStore,
    private readonly els: {
      canvas: HTMLCanvasElement;
      ui: HTMLElement;
      hudHost: HTMLElement;
      surface: HTMLElement;
    },
  ) {
    this.renderer = new WorldRenderer(els.canvas);
    this.input = new InputManager(els.surface, (x, y) => this.renderer.laneAtScreen(x, y));
    this.hud = new Hud(
      (a, at) => this.input.emit(a, at, 'pad'),
      () => this.pause(),
    );
    els.hudHost.append(this.hud.root);
    this.menus = new Menus(els.ui, this);
    this.touchSeen = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    this.previewed = levelById(store.data.lastLevel) ?? LEVELS[0];

    this.input.on((a) => this.onAction(a));
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && !this.touchSeen) {
        this.touchSeen = true;
        this.applySettings();
      }
    });
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 150));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (this.fsm.state === 'playing' || this.fsm.state === 'countdown'))
        this.pause();
    });
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installEvent = e as InstallPrompt;
      if (this.fsm.state === 'menu') this.menus.refresh();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.els.ui.querySelector('[data-testid="title"]')) {
        e.preventDefault();
        this.unlockAudio();
        this.menus.showMain();
      }
    });
    this.renderer.onQualityDrop = () => undefined;
    this.applySettings();
    this.applyCosmetics();
    this.renderer.setLevel(this.previewed);
    this.resize();
    this.menus.showTitle();
    requestAnimationFrame(this.frame);
  }

  // ------------------------------------------------------------- MenuHost

  isTouch(): boolean {
    return this.touchSeen;
  }

  unlockAudio(): void {
    this.audio.unlock();
    this.audio.setVolumes(
      this.store.settings.master,
      this.store.settings.music,
      this.store.settings.sfx,
    );
  }

  installAvailable(): boolean {
    return this.installEvent !== null;
  }

  install(): void {
    const ev = this.installEvent;
    if (!ev) return;
    this.installEvent = null;
    void ev.prompt().finally(() => this.menus.refresh());
  }

  applySettings(): void {
    const s = this.store.settings;
    this.audio.setVolumes(s.master, s.music, s.sfx);
    this.audio.latencyOffsetMs = s.latencyMs;
    if (this.renderer) {
      this.renderer.setQuality(s.quality);
      this.renderer.shakeEnabled = s.shake;
      this.renderer.reducedMotion = s.reducedMotion;
    }
    const pads = s.touchPads === 'on' || (s.touchPads === 'auto' && this.touchSeen);
    this.hud.setPadsVisible(pads);
    document.documentElement.classList.toggle('reduced-motion', s.reducedMotion);
  }

  applyCosmetics(): void {
    this.renderer.setCosmetics(this.store.data.equipped);
  }

  previewLevel(level: LevelDef): void {
    this.previewed = level;
    if (!this.run) this.renderer.setLevel(level);
  }

  startRun(mode: ModeId, level: LevelDef, difficulty: Difficulty): void {
    this.unlockAudio();
    this.audio.stop();
    const track = buildTrack(mode, level, difficulty, (Math.random() * 2 ** 32) >>> 0);
    blurFocus();
    const rules = MODES[mode];
    const session = new GameSession(track, rules, DIFFICULTIES[difficulty]);
    session.on((e) => this.onSessionEvent(e));
    this.run = {
      mode,
      level,
      difficulty,
      track,
      session,
      resumeAt: null,
      ending: false,
      autoplay: this.autoplayDefault,
    };
    this.lanePos = 1;
    this.audio.sfxRoot = track.rootMidi + 12;
    this.renderer.setLevel(level);
    this.menus.hide();
    this.hud.reset();
    this.hud.show(true);
    if (this.fsm.state !== 'menu' && this.fsm.state !== 'results') this.fsm.go('menu');
    this.fsm.go('countdown');
    this.input.enabled = true;
    this.audio.play(track, 0, 0.15);
  }

  restart(): void {
    const r = this.run;
    if (!r) return;
    this.startRun(r.mode, r.level, r.difficulty);
  }

  pause(): void {
    const r = this.run;
    if (!r || r.ending) return;
    if (this.fsm.state !== 'playing' && this.fsm.state !== 'countdown') return;
    r.resumeAt = null;
    this.fsm.go('paused');
    this.audio.pause();
    this.input.enabled = false;
    this.menus.showPause(r.level, r.mode, r.session.progress());
  }

  resume(): void {
    const r = this.run;
    if (!r || this.fsm.state !== 'paused') return;
    this.menus.hide();
    this.fsm.go('countdown');
    r.resumeAt = performance.now() + 1200;
    // Während des Countdowns darf man sich schon in Position bringen (ohne Treffer).
    this.input.enabled = true;
    blurFocus();
  }

  quitToMenu(): void {
    this.audio.stop();
    this.audio.resume();
    this.run = null;
    this.input.enabled = false;
    this.hud.show(false);
    if (this.fsm.state !== 'menu') this.fsm.go('menu');
    this.renderer.setLevel(this.previewed);
    this.menus.showMain();
  }

  // --------------------------------------------------------------- Eingabe

  private onAction({ action, at }: TimedAction): void {
    if (action.type === 'pause') {
      const st = this.fsm.state;
      if (st === 'playing' || st === 'countdown') {
        if (this.run?.resumeAt === null) this.pause();
      } else if (st === 'paused') {
        if (!this.menus.back()) this.resume();
      } else if (st === 'menu') {
        this.menus.back();
      }
      return;
    }
    const r = this.run;
    if (!r || !this.input.enabled || r.ending) return;
    const s = r.session;
    if (r.resumeAt !== null) {
      if (action.type === 'lane') s.lane = action.lane;
      else if (action.type === 'shift') s.lane = Math.min(2, Math.max(0, s.lane + action.dir));
      return;
    }
    const t = this.audio.songTimeAt(at);
    switch (action.type) {
      case 'lane':
        s.pressLane(action.lane, t);
        this.renderer.flashLane(action.lane);
        break;
      case 'shift':
        s.shift(action.dir, t);
        this.renderer.flashLane(s.lane);
        break;
      case 'hit':
        s.hit(t);
        this.renderer.flashLane(s.lane);
        break;
      case 'overdrive':
        s.activateOverdrive();
        break;
    }
  }

  private onSessionEvent(e: SessionEvent): void {
    const r = this.run;
    if (!r) return;
    switch (e.type) {
      case 'judge':
        this.hud.showJudgement(e.judgement, r.session.score.combo);
        if (e.judgement === 'miss') {
          this.audio.sfx('miss');
          this.renderer.burst(e.lane, 'miss');
        } else {
          this.audio.sfx(e.judgement, [0, 2, 4, 7][e.lane % 4]);
          this.renderer.burst(e.lane, e.judgement);
        }
        break;
      case 'orb':
        this.audio.sfx('orb');
        this.renderer.burst(e.lane, 'orb');
        break;
      case 'wall':
        if (e.damaged) {
          this.audio.sfx('wall');
          this.renderer.burst(r.session.lane, 'wall');
          this.hud.flashMessage('AUTSCH!');
          if (this.store.settings.haptics && 'vibrate' in navigator) navigator.vibrate?.(60);
        }
        break;
      case 'overdrive':
        if (e.active) {
          this.audio.sfx('overdrive');
          this.hud.flashMessage('OVERDRIVE ×2');
          this.renderer.addShake(0.3);
        }
        break;
      case 'milestone':
        this.audio.sfx('milestone');
        break;
      case 'complete':
        this.finishRun(true);
        break;
      case 'fail':
        this.audio.sfx('wall');
        this.finishRun(false);
        break;
    }
  }

  private finishRun(cleared: boolean): void {
    const r = this.run;
    if (!r || r.ending) return;
    r.ending = true;
    this.input.enabled = false;
    const s = r.session;
    const sc = s.score;
    const accuracy = sc.accuracy();
    const failed = !cleared;
    const endless = r.mode === 'endless';
    const seconds = Math.max(0, s.time);
    if (endless) sc.addBonus(Math.floor(seconds) * 10);
    const before = this.store.progress();
    const { newBestScore, newBestTime } = this.store.recordRun({
      mode: r.mode,
      levelId: r.level.id,
      difficulty: r.difficulty,
      score: sc.score,
      accuracy,
      stars: endless ? 0 : starsFor(accuracy, failed),
      maxCombo: sc.maxCombo,
      cleared,
      seconds,
      notesHit: sc.counts.perfect + sc.counts.great + sc.counts.good,
      perfects: sc.counts.perfect,
      orbs: sc.orbs,
    });
    const unlocked = newlyUnlocked(before, this.store.progress());
    const next = MODES[r.mode].needsLevel && cleared ? (nextLevel(r.level) ?? null) : null;
    setTimeout(
      () => {
        if (this.run !== r) return;
        this.audio.stop();
        this.hud.show(false);
        this.fsm.go('results');
        this.menus.showResults({
          mode: r.mode,
          level: r.level,
          difficulty: r.difficulty,
          cleared,
          score: sc.score,
          grade: gradeFor(accuracy, failed && !endless),
          stars: endless ? 0 : starsFor(accuracy, failed),
          accuracy,
          counts: { ...sc.counts },
          maxCombo: sc.maxCombo,
          orbs: sc.orbs,
          orbsTotal: sc.orbsTotal,
          wallHits: sc.wallHits,
          seconds,
          newBestScore,
          newBestTime,
          unlocked,
          next,
        });
        if (unlocked.length) this.applyCosmetics();
      },
      cleared ? 600 : 1100,
    );
  }

  // ----------------------------------------------------------------- Loop

  private resize(): void {
    this.renderer.resize(window.innerWidth, window.innerHeight);
  }

  private pulseAt(track: Track, t: number): number {
    const step = Math.floor(track.stepAt(t));
    const notes = track.notesInRange(Math.max(0, step - 8), step + 1);
    let lastKick = -1;
    for (const n of notes) if (n.inst === 'kick' && n.step <= step) lastKick = n.step;
    if (lastKick < 0) return 0;
    return Math.exp(-(t - track.timeOfStep(lastKick)) * 7);
  }

  private readonly frame = (now: number): void => {
    requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (document.hidden) return;
    const r = this.run;
    if (r) {
      const s = r.session;
      if (this.fsm.state === 'countdown' && r.resumeAt !== null) {
        const left = (r.resumeAt - now) / 1000;
        this.hud.setCountdown(left > 0 ? String(Math.ceil(left / 0.4)) : '');
        if (left <= 0) {
          r.resumeAt = null;
          this.audio.resume();
          this.fsm.go('playing');
          this.input.enabled = true;
        }
      }
      const t = this.audio.songTime();
      const active =
        (this.fsm.state === 'playing' || this.fsm.state === 'countdown') &&
        r.resumeAt === null &&
        !r.ending;
      if (active) {
        const introEnd = r.track.timeOfStep(STEPS_PER_BAR);
        if (this.fsm.state === 'countdown') {
          const beat = Math.floor(t / r.track.timeOfStep(STEPS_PER_BEAT));
          this.hud.setCountdown(
            t < 0 ? '3' : ['3', '2', '1', 'LOS!'][Math.min(3, Math.max(0, beat))],
          );
          if (t >= introEnd) {
            this.fsm.go('playing');
            this.hud.setCountdown('');
          }
        }
        if (r.autoplay) this.autoplay(r, t);
        s.update(t);
        if (r.mode === 'tutorial') {
          const bar = Math.floor(r.track.stepAt(t) / STEPS_PER_BAR);
          this.hud.setHint(hintForBar(bar, this.touchSeen));
          if (
            bar >= TUTORIAL_ENERGY_BAR &&
            bar < TUTORIAL_ENERGY_BAR + 1 &&
            s.energy < 1 &&
            !s.overdriveActive
          )
            s.energy = 1;
        }
      }
      this.lanePos = damp(this.lanePos, s.lane, 20, dt);
      const limit = s.rules.timeLimit;
      this.hud.update({
        score: s.score.score,
        combo: s.score.combo,
        multiplier: s.multiplier,
        health: s.health,
        energy: s.energy,
        overdrive: s.overdriveRemaining(),
        progress: limit ? Math.min(1, Math.max(0, t) / limit) : s.progress(),
        // Sprint zeigt die Restzeit.
        elapsed: limit ? Math.max(0, limit - t) : Math.max(0, t),
        endless: r.track.endless,
        lane: s.lane,
        showHealth: r.session.rules.canFail,
      });
      this.renderer.render({
        time: t,
        dt: this.audio.isPaused ? 0 : dt,
        session: s,
        track: r.track,
        speed: DIFFICULTIES[r.difficulty].speed * speedFactor(r.mode, t),
        lanePos: this.lanePos,
        pulse: this.pulseAt(r.track, t),
        overdrive: s.overdriveActive,
        hidden: !!r.session.rules.hidden,
      });
    } else {
      this.idleTime += dt;
      const beat = (this.idleTime * 100) / 60;
      this.lanePos = 1 + Math.sin(this.idleTime * 0.7) * 0.6;
      this.renderer.render({
        time: this.idleTime,
        dt,
        session: null,
        track: null,
        speed: 9,
        lanePos: this.lanePos,
        pulse: Math.exp(-(beat % 1) * 5) * 0.6,
        overdrive: false,
        hidden: false,
      });
    }
  };

  /** Fehlerfreier Spielbot (für Tests und Demonstration der Synchronität). */
  private autoplay(r: Run, t: number): void {
    const s = r.session;
    const n = s.nextNote();
    if (n && t >= n.time - 0.004) s.pressLane(n.lane, n.time);
    const safe = s.safeLaneAt(t + 0.05, n && n.time - t < 0.3 ? n.lane : s.lane);
    if (safe !== s.lane) s.lane = safe;
  }

  // ------------------------------------------------------------ Testhooks

  testApi() {
    return {
      state: () => ({
        app: this.fsm.state,
        mode: this.run?.mode ?? null,
        level: this.run?.level.id ?? null,
        songTime: this.run ? this.audio.songTime() : 0,
        contextTime: this.audio.contextTime(),
        audio: this.audio.available,
        score: this.run?.session.score.score ?? 0,
        combo: this.run?.session.score.combo ?? 0,
        counts: this.run ? { ...this.run.session.score.counts } : null,
        lane: this.run?.session.lane ?? -1,
        health: this.run?.session.health ?? 0,
        energy: this.run?.session.energy ?? 0,
        duration: this.run?.track.duration ?? 0,
        events: this.run?.track.events.length ?? 0,
        nextNote: this.run?.session.nextNote() ?? null,
        quality: this.renderer.quality,
      }),
      setAutoplay: (on: boolean) => {
        this.autoplayDefault = on;
        if (this.run) this.run.autoplay = on;
      },
      seekNearEnd: (secondsLeft = 3) => {
        const r = this.run;
        const end = r?.session.rules.timeLimit ?? (r && !r.track.endless ? r.track.duration : 0);
        if (!r || !end) return false;
        const target = Math.max(0, end - secondsLeft);
        r.session.skipTo(target);
        this.audio.play(r.track, target, 0.05);
        if (this.fsm.state === 'countdown') this.fsm.go('playing');
        this.hud.setCountdown('');
        return true;
      },
    };
  }
}

function blurFocus(): void {
  const el = document.activeElement;
  if (el instanceof HTMLElement) el.blur();
}
