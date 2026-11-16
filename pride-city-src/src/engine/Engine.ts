/* Engine: Renderer, Spielschleife, Szenenwechsel und automatische Grafikstufe.
   Eine Szene liefert eine three-Szene, eine Kamera und update(dt). Der Rest (Auflösung, Schatten, Leuchten) regelt die Engine. */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Input } from './Input';

export interface GameScene {
  root: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Leuchten (Neon) stärker/schwächer, 0 = aus */
  bloom?: number;
  enter?(): void;
  exit?(): void;
  update(dt: number, t: number): void;
}

/** 0 niedrig, 1 mittel, 2 hoch */
export type Quality = 0 | 1 | 2;

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly input: Input;
  scene: GameScene | null = null;
  quality: Quality = 1;
  /** -1 = automatisch, sonst feste Stufe */
  qualitySetting = -1;
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private last = 0;
  private frames = 0;
  private slow = 0;
  private fast = 0;
  private sampleT = 0;
  private hooks = new Set<(dt: number) => void>();
  fps = 60;
  paused = false;

  constructor(readonly canvas: HTMLCanvasElement) {
    const mobile = matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.input = new Input(canvas);
    this.quality = mobile ? 1 : 2;
    addEventListener('resize', () => this.resize());
    screen.orientation?.addEventListener?.('change', () => setTimeout(() => this.resize(), 120));
  }

  /** Jedes Bild aufgerufen (für UI, die unabhängig von der Szene läuft) */
  onFrame(fn: (dt: number) => void) { this.hooks.add(fn); return () => this.hooks.delete(fn); }

  setQuality(q: number) {
    this.qualitySetting = q;
    if (q >= 0) this.applyQuality(q as Quality);
  }
  private applyQuality(q: Quality) {
    this.quality = q;
    this.renderer.shadowMap.enabled = q > 0;
    this.renderer.shadowMap.needsUpdate = true;
    this.resize();
    document.documentElement.dataset.quality = String(q);
  }

  setScene(s: GameScene) {
    this.scene?.exit?.();
    this.scene = s;
    this.composer = null;
    s.enter?.();
    this.resize();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    const cap = this.quality === 2 ? 2 : this.quality === 1 ? 1.5 : 1;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, cap));
    this.renderer.setSize(w, h, false);
    if (this.scene) { this.scene.camera.aspect = w / h; this.scene.camera.updateProjectionMatrix(); }
    this.composer?.setSize(w, h);
    this.composer?.setPixelRatio(this.renderer.getPixelRatio());
  }

  private ensureComposer(s: GameScene) {
    if (this.composer) return;
    const c = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(s.root, s.camera);
    c.addPass(this.renderPass);
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), .55, .5, .82);
    c.addPass(this.bloomPass);
    c.addPass(new OutputPass());
    c.setPixelRatio(this.renderer.getPixelRatio());
    c.setSize(innerWidth, innerHeight);
    this.composer = c;
  }

  start() {
    this.applyQuality(this.quality);
    const loop = (t: number) => {
      requestAnimationFrame(loop);
      const dt = Math.min(.05, (t - (this.last || t)) / 1000);
      this.last = t;
      this.input.update(t);
      this.hooks.forEach((f) => f(dt));
      const s = this.scene;
      if (s && !this.paused) {
        s.update(dt, t / 1000);
        const bloom = s.bloom ?? 0;
        if (this.quality === 2 && bloom > 0) {
          this.ensureComposer(s);
          this.renderPass!.scene = s.root; this.renderPass!.camera = s.camera;
          this.bloomPass!.strength = bloom;
          this.composer!.render(dt);
        } else this.renderer.render(s.root, s.camera);
      }
      this.input.endFrame();
      this.measure(dt);
    };
    requestAnimationFrame(loop);
  }

  /* Automatische Grafikstufe: über 2 s gemessen, bei Ruckeln eine Stufe runter, bei viel Luft wieder hoch. */
  private measure(dt: number) {
    this.frames++; this.sampleT += dt;
    if (this.sampleT < 2) return;
    this.fps = this.frames / this.sampleT;
    this.frames = 0; this.sampleT = 0;
    if (this.qualitySetting >= 0 || document.hidden) return;
    if (this.fps < 40) { this.slow++; this.fast = 0; } else if (this.fps > 58) { this.fast++; this.slow = 0; } else { this.slow = 0; this.fast = 0; }
    if (this.slow >= 2 && this.quality > 0) { this.applyQuality((this.quality - 1) as Quality); this.slow = 0; }
    if (this.fast >= 8 && this.quality < 2 && !matchMedia('(pointer: coarse)').matches) { this.applyQuality((this.quality + 1) as Quality); this.fast = 0; }
  }
}
