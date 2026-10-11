import * as THREE from 'three';
import { QUALITY_PRESETS, QualitySettings } from './quality';

/** Ein „Bildschirm“ im 3D-Raum (Brett, Minispiel, Finale …): hat Szene, Kamera und eine Update-Funktion. */
export interface Screen {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update(dt: number): void;
  /** Wird nach Größenänderungen aufgerufen (Kamera-Seitenverhältnis setzt der Engine selbst) */
  onResize?(width: number, height: number): void;
}

/**
 * Besitzt den WebGL-Renderer und die Render-Schleife. Behandelt Größenänderungen, Tab-Wechsel,
 * Kontextverlust und senkt die Qualität automatisch ab, wenn das Gerät zu langsam ist.
 */
export class Engine {
  readonly canvas: HTMLCanvasElement;
  renderer!: THREE.WebGLRenderer;
  quality: QualitySettings;
  screen: Screen | null = null;
  onContextLost: (() => void) | null = null;
  onQualityAdapted: ((q: QualitySettings) => void) | null = null;
  autoQuality = true;
  private raf = 0;
  private last = 0;
  private running = false;
  private ro: ResizeObserver;
  private fpsAcc = 0;
  private fpsFrames = 0;
  private slowSeconds = 0;
  private w = 1;
  private h = 1;

  constructor(private readonly container: HTMLElement, quality: QualitySettings = QUALITY_PRESETS.medium) {
    this.quality = { ...quality };
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pv-canvas';
    this.canvas.style.touchAction = 'none';
    container.appendChild(this.canvas);
    this.createRenderer();
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.onContextLost?.();
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      this.createRenderer();
      this.resize();
    });
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  private createRenderer(): void {
    this.renderer?.dispose();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.quality.antialias, powerPreference: 'high-performance', alpha: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.applyQuality();
  }

  private applyQuality(): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.pixelRatio));
    this.renderer.shadowMap.enabled = this.quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setSize(this.w, this.h, false);
  }

  setQuality(q: QualitySettings): void {
    const aaChanged = q.antialias !== this.quality.antialias;
    this.quality = { ...q };
    if (aaChanged) this.createRenderer();
    else this.applyQuality();
    this.screen?.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((x) => (x.needsUpdate = true));
    });
  }

  setScreen(s: Screen | null): void {
    this.screen = s;
    if (s) {
      s.camera.aspect = this.w / this.h;
      s.camera.updateProjectionMatrix();
      s.onResize?.(this.w, this.h);
    }
  }

  resize(): void {
    const r = this.container.getBoundingClientRect();
    this.w = Math.max(2, Math.floor(r.width));
    this.h = Math.max(2, Math.floor(r.height));
    this.renderer.setSize(this.w, this.h, false);
    if (this.screen) {
      this.screen.camera.aspect = this.w / this.h;
      this.screen.camera.updateProjectionMatrix();
      this.screen.onResize?.(this.w, this.h);
    }
  }

  get aspect(): number {
    return this.w / this.h;
  }

  private onVisibility = (): void => {
    this.last = performance.now(); // nach Tab-Wechsel keinen riesigen dt-Sprung
  };

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      if (document.hidden) {
        this.last = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
      this.last = now;
      this.adapt(dt, now);
      if (!this.screen) return;
      this.screen.update(dt);
      this.renderer.render(this.screen.scene, this.screen.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Misst die Bildrate; bei dauerhaft < 24 FPS wird die Qualität stufenweise gesenkt. */
  private adapt(dt: number, _now: number): void {
    if (!this.autoQuality) return;
    this.fpsAcc += dt;
    this.fpsFrames++;
    if (this.fpsAcc < 1) return;
    const fps = this.fpsFrames / this.fpsAcc;
    this.fpsAcc = 0;
    this.fpsFrames = 0;
    this.slowSeconds = fps < 24 ? this.slowSeconds + 1 : Math.max(0, this.slowSeconds - 1);
    if (this.slowSeconds >= 3) {
      this.slowSeconds = 0;
      const q = { ...this.quality };
      if (q.pixelRatio > 1) q.pixelRatio = Math.max(1, q.pixelRatio - 0.5);
      else if (q.shadows) q.shadows = false;
      else if (q.particles > 0.3) q.particles = 0.3;
      else return;
      this.setQuality(q);
      this.onQualityAdapted?.(q);
    }
  }

  dispose(): void {
    this.stop();
    this.ro.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.renderer.dispose();
    this.canvas.remove();
  }
}
