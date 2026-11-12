import * as THREE from 'three';
import { Rng } from '@shared/rng';
import {
  InputFrame,
  InputLog,
  MiniGame,
  MiniGameInitOptions,
  NEUTRAL_INPUT,
  TICK_DT,
} from '@shared/minigames/types';
import { InputRecorder, quantize } from '@shared/minigames/input';
import type { BotRunner } from '@shared/minigames/simulate';
import { createCharacter, type CharacterRig } from '../render/characters';
import type { Screen } from '../render/engine';
import { ParticlePool } from '../render/particles';
import { disposeTree } from '../render/materials';
import type { QualitySettings } from '../render/quality';
import { getViewFactory } from './viewRegistry';
import type { Avatar, MiniGameView } from './viewTypes';

/** Mitspieler im Minispiel; runner = KI, die Takt für Takt mitläuft (null = Mensch an einem anderen Gerät) */
export type Rival = Avatar & { runner: BotRunner | null; id?: string };

export interface StageResult {
  score: number;
  log: InputLog;
  ticks: number;
}

export interface StageDeps {
  quality: QualitySettings;
  sfx: (name: string) => void;
  /** Liefert die Eingabe des Menschen; null = KI spielt */
  input: { read(): InputFrame } | null;
  botSkill?: number;
  botSeed?: number;
  /** Eigene Figur; Standard: Pip in Rot */
  me?: Avatar;
  /** Mitspieler, die live mitlaufen */
  rivals?: Rival[];
}

/**
 * Führt EIN Minispiel für EINEN Spieler aus: feste Simulationsschritte (60/s), Eingabe aufzeichnen,
 * Ansicht zeichnen. Nach Spielende wird `onFinish` mit Ergebnis und Eingabeprotokoll aufgerufen.
 */
export class MiniStage implements Screen {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 300);
  readonly state: any;
  tick = 0;
  running = false;
  finished = false;
  onFinish: ((r: StageResult) => void) | null = null;
  private view: MiniGameView;
  private root = new THREE.Group();
  private particles: ParticlePool;
  private acc = 0;
  private rec = new InputRecorder();
  private botRng: Rng;
  private limit: number;
  lastInput: InputFrame = { ...NEUTRAL_INPUT };
  readonly rivals: Rival[];
  private rigs: CharacterRig[] = [];

  constructor(
    readonly game: MiniGame,
    readonly seed: number,
    opts: MiniGameInitOptions,
    private readonly deps: StageDeps,
  ) {
    this.scene.background = new THREE.Color(0x14102e);
    this.scene.add(this.root);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x4a3a7a, 1.1);
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(6, 12, 8);
    this.scene.add(hemi, sun);
    this.particles = new ParticlePool(this.scene, 160, deps.quality.particles);
    this.botRng = new Rng(deps.botSeed ?? 1);
    this.state = game.init(seed, opts);
    this.limit = Math.ceil(game.duration * 60) + 2;
    this.rivals = deps.rivals ?? [];
    this.view = getViewFactory(game.id)(
      {
        scene: this.scene,
        camera: this.camera,
        root: this.root,
        quality: deps.quality,
        sfx: deps.sfx,
        burst: (p, c, n) => this.particles.burst(p, c, n ?? 14),
        me: deps.me ?? { character: 'pip', color: 0xff4d6d, name: 'Du' },
        rivals: this.rivals.map(({ character, color, name }) => ({ character, color, name })),
        character: (id, scale) => {
          const rig = createCharacter(id, { scale: scale ?? 1, toon: true });
          this.rigs.push(rig);
          return rig;
        },
      },
      this.state,
    );
    this.view.update(this.state, 0);
  }

  private lastNow = 0;

  start(): void {
    this.running = true;
    this.lastNow = 0;
  }

  update(dt: number): void {
    // Echte Zeit nehmen: Der Renderer kappt dt bei 50 ms, sonst liefe das Spiel auf langsamen Geräten in Zeitlupe
    const now = performance.now();
    const real = this.lastNow ? Math.min(0.25, Math.max(dt, (now - this.lastNow) / 1000)) : dt;
    this.lastNow = now;
    if (this.running && !this.finished) {
      this.acc += real;
      let guard = 0;
      while (this.acc >= TICK_DT && !this.finished && guard++ < 16) {
        this.acc -= TICK_DT;
        this.stepOnce();
      }
    }
    this.particles.update(dt);
    this.view.update(this.state, dt);
    if (this.view.ghosts && this.rivals.length)
      this.view.ghosts(
        this.rivals.map((r) => (r.runner ? r.runner.state : null)),
        dt,
      );
  }

  private stepOnce(): void {
    const raw = this.deps.input
      ? this.deps.input.read()
      : this.game.bot(this.state, this.deps.botSkill ?? 0.6, this.botRng);
    const input = this.rec.push(this.tick, quantize(raw));
    this.lastInput = input;
    this.game.step(this.state, input);
    // Mitspieler-KI im Gleichschritt (gleiche Rechnung wie im Spielkern → gleiches Ergebnis)
    for (const r of this.rivals) r.runner?.step();
    this.tick++;
    if (this.game.done(this.state) || this.tick >= this.limit) {
      this.finished = true;
      this.running = false;
      const s = this.game.score(this.state);
      this.onFinish?.({ score: Number.isFinite(s) && s > 0 ? s : 0, log: this.rec.log, ticks: this.tick });
    }
  }

  dispose(): void {
    this.view.dispose();
    this.rigs.forEach((r) => r.dispose());
    this.particles.dispose();
    disposeTree(this.root);
    this.scene.clear();
  }
}
