import * as THREE from 'three';
import type { CarInput, SimEvent, SimState, TeamId } from '@shared/sim/types';
import { Rng } from '@shared/rng';
import type { App } from '../app/app';
import { TEAM_NAMES, teamColorHex } from '../app/theme';
import { LocalInput, defaultBindings } from '../input/controller';
import { createActors, type ActorLook, type ActorsView, type CarBody, type CarDecal } from '../render/actors';
import { createArena, type ArenaTheme, type ArenaView } from '../render/arena';
import type { Screen } from '../render/engine';
import { t } from '../i18n';
import { btn, clear, h, slider, toast, toggle } from '../ui/dom';
import { ChaseCamera } from './camera';
import { Hud } from './hud';
import { buildLocalPlan, type PlanOptions } from './plan';
import { LocalMatch, type MatchSession } from './session';

interface PlayerStats {
  goals: number;
  assists: number;
  demos: number;
}

/** Das laufende Spiel: verbindet Sitzung, 3D-Szene, Kameras, Eingabe, Ton und Oberfläche; Splitscreen bei zwei lokalen Spielern. */
export class MatchScreen implements Screen {
  readonly el = h('div', { class: 'game' });
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(80, 16 / 9, 0.1, 900);
  private readonly cams: THREE.PerspectiveCamera[];
  private readonly chase: ChaseCamera[];
  private readonly ballCam: boolean[];
  private readonly arena: ArenaView;
  private readonly actors: ActorsView;
  private readonly hud: Hud;
  private readonly input: LocalInput;
  private readonly overlay = h('div', { class: 'overlay' });
  private stats: PlayerStats[];
  private paused = false;
  private ended = false;
  private disposed = false;
  private lastPhase = '';
  private pendingEvents: SimEvent[] = [];
  private goalPos = new THREE.Vector3();
  private startedAt = Date.now();
  private offs: Array<() => void> = [];
  private connEl: HTMLElement | null = null;
  private readonly tmpState: SimState | null = null;
  private lastBallTouch = 0;

  constructor(
    private readonly app: App,
    private readonly session: MatchSession,
  ) {
    const s = app.store.data.settings;
    const n = session.localCars.length;
    this.cams = Array.from({ length: n }, () => new THREE.PerspectiveCamera(s.fov, 16 / 9, 0.1, 900));
    this.chase = this.cams.map(
      () =>
        new ChaseCamera({ fov: s.fov, distance: s.camDistance, shake: s.cameraShake && !s.reducedMotion }),
    );
    this.ballCam = this.cams.map(() => s.ballCam);
    this.arena = createArena(session.arena as ArenaTheme, app.engine.quality);
    this.arena.applyTo(this.scene);
    this.scene.add(this.arena.group);
    this.actors = createActors(app.engine.quality, session.players.length);
    this.actors.setLooks(
      session.players.map(
        (p): ActorLook => ({
          body: p.look.body as CarBody,
          decal: p.look.decal as CarDecal,
          ...(p.look.accent ? { accent: parseInt(p.look.accent.slice(1), 16) } : {}),
        }),
      ),
    );
    this.scene.add(this.actors.group);
    this.stats = session.players.map(() => ({ goals: 0, assists: 0, demos: 0 }));
    this.hud = new Hud(n, () => this.openPause());
    this.hud.layout(n > 1);
    this.input = new LocalInput(this.el, defaultBindings(n as 1 | 2, app.touch), {
      touchLayout: s.touchControls,
    });
    this.el.classList.toggle('is-touch', app.touch);
    this.el.append(this.hud.el, this.overlay);
    if (new URLSearchParams(location.search).has('debug')) this.setupDebug();
    void this.tmpState;
  }

  /** ?debug=1: kleine Anzeige mit Bildrate und Eingabewerten (zur Fehlersuche auf dem Gerät) */
  private debugEl: HTMLElement | null = null;
  private dbgFrames = 0;
  private dbgT = 0;
  private dbgFps = 0;
  private setupDebug(): void {
    this.debugEl = h('div', {
      style:
        'position:absolute;left:8px;bottom:8px;z-index:50;font:12px/1.3 monospace;background:rgba(0,0,0,.7);color:#b6ff3b;padding:4px 8px;pointer-events:none;white-space:pre',
    });
    this.el.append(this.debugEl);
  }
  private updateDebug(dt: number): void {
    if (!this.debugEl) return;
    this.dbgFrames++;
    this.dbgT += dt;
    if (this.dbgT >= 0.5) {
      this.dbgFps = Math.round(this.dbgFrames / this.dbgT);
      this.dbgFrames = 0;
      this.dbgT = 0;
    }
    const i = this.input.read(0);
    this.debugEl.textContent = `fps ${this.dbgFps}  tick ${this.state.tick}  phase ${this.state.phase}\ngas ${i.throttle.toFixed(2)}  lenken ${i.steer.toFixed(2)}  sprung ${i.jump ? 1 : 0}  boost ${i.boost ? 1 : 0}\ngamepads ${LocalInput.gamepadsConnected()}  zeiger ${this.input.pointerCount}`;
  }

  private get state(): SimState {
    return this.session.state;
  }

  start(): void {
    const { app } = this;
    (window as unknown as { __tk?: unknown }).__tk = { session: this.session, input: this.input };
    app.engine.setScreen(this);
    app.engine.start();
    app.audio.music(this.session.training ? 'menu' : 'match');
    this.offs.push(
      this.session.onNotice((text, kind) => toast(text, kind === 'error' ? 'error' : 'info')),
      this.session.onClosed(() => {
        if (this.ended) return;
        toast(t('p2p.hostGone'), 'error', 5000);
        void this.app.toMenu();
      }),
    );
    for (const c of this.chase) c.snap();
    this.hud.show(this.session.training ? t('hud.training') : t('hud.getReady'), '', null);
  }

  // ------------------------------------------------------------------ Schleife
  update(dt: number): void {
    if (this.disposed) return;
    dt = Math.min(dt, 0.1);
    const n = this.session.localCars.length;
    // Einmal-Ereignisse der Eingabe
    for (let p = 0; p < n; p++) {
      const c = this.input.consume(p as 0 | 1);
      if (c.ballCam) this.ballCam[p] = !this.ballCam[p];
      if (c.reset && this.session.training) this.session.reset();
      if (c.pause && p === 0) {
        if (this.paused) this.closePause();
        else this.openPause();
      }
    }
    const frozen = this.paused && !this.session.shared;
    let events: SimEvent[] = [];
    if (!frozen && !this.ended) {
      const inputs = Array.from({ length: n }, (_, p) => this.input.read(p as 0 | 1));
      if (this.app.store.data.settings.touchAssist) this.assistTouch(inputs);
      events = this.session.advance(dt, inputs);
    }
    const st = this.state;
    this.handleEvents(events);
    this.actors.update(dt, st, events);
    this.arena.update(dt, st);
    this.updateHud(st);
    this.updateCameras(dt, st);
    this.updateAudio(st);
    this.updateDebug(dt);
    if (st.phase === 'ended' && !this.ended) this.finish(st);
  }

  /**
   * Einfache Touch-Steuerung: Der Stick gibt die gewünschte Richtung auf dem Bildschirm vor (oben = dorthin, wohin die
   * Kamera blickt – mit Ball-Kamera also zum Ball). Am Boden lenkt das Auto selbst dorthin und gibt Gas; in der Luft
   * bleibt die normale Luftsteuerung.
   */
  private assistTouch(inputs: CarInput[]): void {
    const stick = this.input.touchStick();
    const inp = inputs[0];
    const car = this.state.cars[this.session.localCars[0] as number];
    const chase = this.chase[0];
    if (!stick || !inp || !car || !chase) return;
    const mag = Math.min(1, Math.hypot(stick.x, stick.y));
    if (mag < 0.18 || car.wheelsOnSurface < 3 || car.demolished > 0) return;
    const q = new THREE.Quaternion(car.quat[0], car.quat[1], car.quat[2], car.quat[3]);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    if (Math.hypot(fwd.x, fwd.z) < 0.4) return; // an steilen Wänden: klassisch
    const yaw = chase.heading;
    // Bildschirm → Welt: vorn = Blickrichtung der Kamera, rechts = (−cos, sin)
    const dx = Math.sin(yaw) * stick.y - Math.cos(yaw) * stick.x;
    const dz = Math.cos(yaw) * stick.y + Math.sin(yaw) * stick.x;
    let diff = Math.atan2(dx, dz) - Math.atan2(fwd.x, fwd.z);
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const speed = Math.hypot(car.vel[0], car.vel[2]);
    inp.steer = Math.max(-1, Math.min(1, -diff * 2.4));
    inp.throttle = mag * (Math.abs(diff) > 2.2 && speed < 4 ? 0.6 : 1);
    inp.handbrake = inp.handbrake || (Math.abs(diff) > 1.7 && speed > 9);
  }

  private updateCameras(dt: number, st: SimState): void {
    const ball = st.ball;
    this.cams.forEach((cam, i) => {
      const chase = this.chase[i] as ChaseCamera;
      const car = st.cars[this.session.localCars[i] as number];
      if (!car) return;
      if (st.phase === 'goal' || st.phase === 'ended')
        chase.orbit(dt, this.goalPos.set(ball.pos[0], Math.max(ball.pos[1], 1.5), ball.pos[2]), 20, 7, 0.3);
      else
        chase.update(
          dt,
          car,
          ball,
          this.ballCam[i] as boolean,
          Math.hypot(car.vel[0], car.vel[1], car.vel[2]),
        );
      chase.apply(cam);
    });
    this.camera.position.copy((this.cams[0] as THREE.PerspectiveCamera).position);
    this.camera.quaternion.copy((this.cams[0] as THREE.PerspectiveCamera).quaternion);
  }

  private updateHud(st: SimState): void {
    this.hud.setScore(st.score[0], st.score[1]);
    this.hud.setClock(st.clock, st.overtime, this.session.training);
    if (st.phase === 'countdown') this.hud.setCountdown(Math.max(1, Math.ceil(st.phaseTimer)));
    else this.hud.setCountdown(null);
    this.session.localCars.forEach((c, i) => {
      const car = st.cars[c];
      if (car)
        this.hud.gauges[i]?.set(
          car.boost,
          Math.hypot(car.vel[0], car.vel[1], car.vel[2]) * 3.6,
          car.boosting,
        );
    });
    if (st.phase !== this.lastPhase) {
      if (st.phase === 'playing' && this.lastPhase === 'countdown') this.hud.hideBanner();
      this.lastPhase = st.phase;
    }
  }

  private updateAudio(st: SimState): void {
    const { audio } = this.app;
    const cam = this.cams[0] as THREE.PerspectiveCamera;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const map = new Map<
      number,
      { speed01: number; boosting: boolean; onGround: boolean; gain: number; pan: number }
    >();
    for (const c of st.cars) {
      if (c.demolished > 0) continue;
      const d = Math.hypot(c.pos[0] - cam.position.x, c.pos[1] - cam.position.y, c.pos[2] - cam.position.z);
      const rel = new THREE.Vector3(c.pos[0] - cam.position.x, 0, c.pos[2] - cam.position.z).normalize();
      map.set(c.id, {
        speed01: Math.min(1, Math.hypot(c.vel[0], c.vel[1], c.vel[2]) / 23),
        boosting: c.boosting,
        onGround: c.wheelsOnSurface >= 3,
        gain: Math.max(0, 1 - d / 60),
        pan: Math.max(-1, Math.min(1, rel.dot(right))),
      });
    }
    audio.updateCars(map);
    const ballNearGoal = Math.abs(st.ball.pos[2]) > 30 ? 0.8 : 0.35;
    audio.crowd(this.session.training ? 0.2 : ballNearGoal);
  }

  // ------------------------------------------------------------------ Ereignisse
  private nameOf(car: number): string {
    return this.session.players[car]?.name ?? '?';
  }
  private teamOf(car: number): TeamId {
    return (this.session.players[car]?.team ?? 0) as TeamId;
  }
  private get myTeam(): TeamId {
    return this.teamOf(this.session.localCars[0] ?? 0);
  }

  private handleEvents(events: ReadonlyArray<SimEvent>): void {
    const { audio, engine } = this.app;
    void engine;
    const me = new Set(this.session.localCars);
    for (const e of events) {
      switch (e.t) {
        case 'countdown':
          audio.sfx('countdown');
          break;
        case 'kickoff':
          audio.sfx('go');
          this.hud.hideBanner();
          break;
        case 'touch': {
          if (!me.has(e.car) && Date.now() - this.lastBallTouch < 90) break;
          this.lastBallTouch = Date.now();
          const hard = e.ballSpeed > 22;
          audio.sfx(hard ? 'hitHard' : 'hit', { volume: Math.min(1, 0.3 + e.ballSpeed / 40) });
          if (hard && me.has(e.car)) this.chase.forEach((c) => c.shake(Math.min(0.5, e.ballSpeed / 80)));
          break;
        }
        case 'jump':
          if (me.has(e.car)) audio.sfx(e.kind === 'dodge' ? 'dodge' : 'jump');
          break;
        case 'pad':
          if (me.has(e.car)) audio.sfx(e.big ? 'padBig' : 'pad');
          break;
        case 'wall':
          if (e.speed > 12) audio.sfx('wall', { volume: Math.min(1, e.speed / 40) });
          break;
        case 'demo': {
          audio.sfx('demo');
          const a = this.stats[e.attacker];
          if (a && e.attacker !== e.victim) a.demos++;
          this.hud.note(`${this.nameOf(e.attacker)} ✕ ${this.nameOf(e.victim)}`, this.teamOf(e.attacker));
          if (me.has(e.victim)) this.chase.forEach((c) => c.shake(0.5, 0.5));
          break;
        }
        case 'respawn':
          if (me.has(e.car)) audio.sfx('respawn');
          break;
        case 'goal': {
          this.arena.celebrate(e.team);
          const mine = e.team === this.myTeam;
          audio.sfx(mine ? 'goal' : 'goalConceded');
          audio.crowdCheer(1);
          const sc = this.stats[e.scorer];
          if (sc && e.scorer >= 0) sc.goals++;
          const as = this.stats[e.assist];
          if (as && e.assist >= 0) as.assists++;
          const who = e.scorer >= 0 ? this.nameOf(e.scorer) : t('hud.ownGoal');
          const own = e.scorer >= 0 && this.teamOf(e.scorer) !== e.team;
          this.hud.show(
            t('hud.goal'),
            own
              ? `${t('hud.ownGoal')} · ${who}`
              : `${who}${e.assist >= 0 ? ' · ' + t('hud.assist') + ' ' + this.nameOf(e.assist) : ''} · ${Math.round(e.speed * 3.6)} km/h`,
            e.team,
          );
          this.chase.forEach((c) => c.shake(0.6, 0.8));
          break;
        }
        case 'overtime':
          audio.sfx('overtime');
          audio.music('overtime');
          this.hud.show(t('hud.overtime'), t('hud.goldenGoal'), null);
          break;
        case 'end':
          break;
        default:
          break;
      }
    }
  }

  // ------------------------------------------------------------------ Ende
  private finish(st: SimState): void {
    this.ended = true;
    const winner = st.winner < 0 ? (st.score[0] >= st.score[1] ? 0 : 1) : st.winner;
    const won = winner === this.myTeam;
    const { audio } = this.app;
    audio.music(won ? 'victory' : 'defeat');
    audio.sfx(won ? 'win' : 'lose');
    this.hud.show(
      `${TEAM_NAMES[winner as 0 | 1]} ${t('hud.wins')}`,
      `${st.score[0]} : ${st.score[1]}`,
      winner as 0 | 1,
      true,
    );
    this.recordStats(won);
    const rows = this.session.players.map((p, i) =>
      h(
        'tr',
        { class: 't' + p.team },
        h('td', null, (p.kind === 'bot' ? '🤖 ' : '') + p.name),
        h('td', null, String(this.stats[i]?.goals ?? 0)),
        h('td', null, String(this.stats[i]?.assists ?? 0)),
        h('td', null, String(this.stats[i]?.demos ?? 0)),
      ),
    );
    setTimeout(() => {
      if (this.disposed) return;
      clear(this.overlay);
      this.overlay.appendChild(
        h(
          'div',
          { class: 'cover' },
          h(
            'div',
            { class: 'panel' },
            h(
              'h2',
              { style: `color:var(--${winner === 0 ? 'fire' : 'ice'})` },
              `${TEAM_NAMES[winner as 0 | 1]} ${t('hud.wins')} ${st.score[0]} : ${st.score[1]}`,
            ),
            h(
              'table',
              { class: 'table' },
              h(
                'thead',
                null,
                h(
                  'tr',
                  null,
                  h('th', null, t('end.player')),
                  h('th', null, t('end.goals')),
                  h('th', null, t('end.assists')),
                  h('th', null, t('end.demos')),
                ),
              ),
              h('tbody', null, ...rows),
            ),
            h(
              'div',
              { class: 'chips', style: 'margin-top:12px' },
              this.session.kind === 'local' ? btn(t('end.rematch'), () => void this.rematch(), '') : null,
              btn(t('end.menu'), () => void this.app.toMenu(), 'ghost'),
            ),
          ),
        ),
      );
    }, 3500);
  }

  private recordStats(won: boolean): void {
    const me = this.session.localCars[0];
    if (me === undefined) return;
    const my = this.stats[me] as PlayerStats;
    const secs = Math.round((Date.now() - this.startedAt) / 1000);
    this.app.store.update((d) => {
      const s = d.stats;
      s.matches++;
      if (won) {
        s.wins++;
        s.streak++;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
      } else s.streak = 0;
      s.goals += my.goals;
      s.assists += my.assists;
      s.demos += my.demos;
      s.playSeconds += secs;
      if (this.session.kind !== 'local') s.onlineMatches++;
    });
  }

  private async rematch(): Promise<void> {
    const ls = this.app.store.data.lastSetup;
    const rng = new Rng((Math.random() * 2 ** 32) >>> 0);
    const opts: PlanOptions = {
      mode: this.session.localCars.length > 1 ? 'split' : 'quick',
      teamSize: ls.teamSize,
      difficulty: ls.difficulty,
      minutes: ls.minutes,
      arena: this.session.arena,
      nitro: ls.nitro,
      splitVersus: true,
      name: this.app.store.data.profile.name,
      garage: this.app.store.data.garage,
      seed: rng.int(2 ** 31),
    };
    await this.app.startMatch(new LocalMatch(buildLocalPlan(opts)));
  }

  // ------------------------------------------------------------------ Pause
  private openPause(): void {
    if (this.paused || this.ended) return;
    this.paused = true;
    const s = this.app.store;
    const shared = this.session.shared;
    clear(this.overlay);
    this.overlay.appendChild(
      h(
        'div',
        { class: 'cover' },
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('pause.title')),
          shared ? h('p', null, t('pause.sharedNote')) : null,
          slider(t('opt.master'), s.data.settings.master, 0, 1, 0.05, (v) =>
            s.update((d) => {
              d.settings.master = v;
            }),
          ),
          toggle(t('opt.mute'), s.data.settings.muted, (v) =>
            s.update((d) => {
              d.settings.muted = v;
            }),
          ),
          h(
            'div',
            { class: 'pausebtns' },
            btn(t('pause.resume'), () => this.closePause(), 'big'),
            this.session.training
              ? btn(
                  t('pause.reset'),
                  () => {
                    this.session.reset();
                    this.closePause();
                  },
                  'ghost',
                )
              : null,
            btn(t('pause.help'), () => this.showHelp(), 'ghost'),
            btn(t('pause.leave'), () => void this.app.toMenu(), 'ghost'),
          ),
        ),
      ),
    );
  }
  private closePause(): void {
    if (!this.paused) return;
    this.paused = false;
    clear(this.overlay);
  }
  private showHelp(): void {
    clear(this.overlay);
    this.overlay.appendChild(
      h(
        'div',
        { class: 'cover' },
        h(
          'div',
          { class: 'panel' },
          h('h2', null, t('menu.help')),
          h('p', null, t('help.goalText')),
          h('p', null, t('help.movesText')),
          h(
            'div',
            { style: 'text-align:right' },
            btn(
              t('back'),
              () => {
                this.paused = false;
                this.openPause();
              },
              'ghost back',
            ),
          ),
        ),
      ),
    );
  }

  // ------------------------------------------------------------------ Darstellung (Splitscreen)
  render(renderer: THREE.WebGLRenderer, w: number, hh: number): void {
    const n = this.cams.length;
    if (n === 1) {
      const cam = this.cams[0] as THREE.PerspectiveCamera;
      cam.aspect = w / hh;
      cam.updateProjectionMatrix();
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, w, hh);
      renderer.render(this.scene, cam);
      return;
    }
    renderer.setScissorTest(true);
    this.cams.forEach((cam, i) => {
      const y = i === 0 ? Math.floor(hh / 2) : 0;
      const vh = i === 0 ? hh - Math.floor(hh / 2) : Math.floor(hh / 2);
      cam.aspect = w / Math.max(1, vh);
      cam.updateProjectionMatrix();
      renderer.setViewport(0, y, w, vh);
      renderer.setScissor(0, y, w, vh);
      renderer.render(this.scene, cam);
    });
    renderer.setScissorTest(false);
  }

  dispose(): void {
    this.disposed = true;
    this.offs.forEach((o) => o());
    this.input.dispose();
    this.hud.dispose();
    this.app.engine.setScreen(null);
    this.app.audio.music(null);
    this.app.audio.updateCars(new Map());
    this.actors.dispose();
    this.arena.dispose();
    this.session.dispose();
    void teamColorHex;
    void this.connEl;
    void this.goalPos;
    void this.pendingEvents;
  }
}
