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
import type { Screen } from '../render/engine';
import { ParticlePool } from '../render/particles';
import { disposeTree } from '../render/materials';
import type { QualitySettings } from '../render/quality';
import { getViewFactory } from './viewRegistry';
import type { MiniGameView } from './viewTypes';

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
    this.view = getViewFactory(game.id)(
      {
        scene: this.scene,
        camera: this.camera,
        root: this.root,
        quality: deps.quality,
        sfx: deps.sfx,
        burst: (p, c, n) => this.particles.burst(p, c, n ?? 14),
      },
      this.state,
    );
    this.view.update(this.state, 0);
  }

  start(): void {
    this.running = true;
  }

  update(dt: number): void {
    if (this.running && !this.finished) {
      this.acc += dt;
      let guard = 0;
      while (this.acc >= TICK_DT && !this.finished && guard++ < 10) {
        this.acc -= TICK_DT;
        this.stepOnce();
      }
    }
    this.particles.update(dt);
    this.view.update(this.state, dt);
  }

  private stepOnce(): void {
    const raw = this.deps.input
      ? this.deps.input.read()
      : this.game.bot(this.state, this.deps.botSkill ?? 0.6, this.botRng);
    const input = this.rec.push(this.tick, quantize(raw));
    this.lastInput = input;
    this.game.step(this.state, input);
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
    this.particles.dispose();
    disposeTree(this.root);
    this.scene.clear();
  }
}
