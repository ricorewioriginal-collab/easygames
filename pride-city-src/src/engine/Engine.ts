/* Engine (Babylon.js): Renderer, Spielschleife, Szenenwechsel und automatische Grafikstufe.
   Jede Spielszene hat eine eigene Babylon-Szene mit Kamera und update(dt). Auflösung, Schatten, Leuchten und
   den filmischen Farblook (ACES, Kontrast, Sättigung, Vignette) regelt die Engine für alle Szenen gleich. */
import { Engine as BEngine, Scene, FreeCamera, DefaultRenderingPipeline, ImageProcessingConfiguration, ColorCurves, Vector3, Matrix, Color4, Material } from './bjs';
import { Input } from './Input';

export interface GameScene {
  scene: Scene;
  camera: FreeCamera;
  /** Leuchten (Neon) stärker/schwächer, 0 = aus */
  bloom?: number;
  /** wird beim Verlassen weggeräumt (Editor, Tanz) */
  transient?: boolean;
  enter?(): void;
  exit?(): void;
  update(dt: number, t: number): void;
}

/** 0 niedrig, 1 mittel, 2 hoch */
export type Quality = 0 | 1 | 2;

export class Engine {
  readonly bjs: BEngine;
  readonly input: Input;
  scene: GameScene | null = null;
  quality: Quality = 1;
  /** -1 = automatisch, sonst feste Stufe */
  qualitySetting = -1;
  private pipes = new Map<Scene, DefaultRenderingPipeline>();
  private last = 0;
  private frames = 0;
  private slow = 0;
  private fast = 0;
  private sampleT = 0;
  private hooks = new Set<(dt: number) => void>();
  /** Szenen melden sich hier, damit Schatten der Grafikstufe folgen */
  private qualityHooks = new Set<(q: Quality) => void>();
  fps = 60;
  paused = false;
  readonly mobile: boolean;
  /** Dynamische Auflösung: 1 = volle Stufe, kleiner = weniger Bildpunkte (hält das Spiel am Handy flüssig) */
  private res = 1;
  private resT = 0; private resFrames = 0;

  constructor(readonly canvas: HTMLCanvasElement) {
    const mobile = matchMedia('(pointer: coarse)').matches;
    this.bjs = new BEngine(canvas, true, { powerPreference: 'high-performance', stencil: true, preserveDrawingBuffer: false, antialias: !mobile, audioEngine: false } as never, false);
    this.bjs.disableManifestCheck = true;
    this.input = new Input(canvas);
    this.mobile = mobile;
    this.quality = mobile ? 0 : 2; // Handys starten sparsam und schalten hoch, wenn Luft ist
    addEventListener('resize', () => this.resize());
    screen.orientation?.addEventListener?.('change', () => setTimeout(() => this.resize(), 120));
  }

  /** Neue Szene mit den gemeinsamen Grundeinstellungen */
  newScene(clear = 0x120a26) {
    const s = new Scene(this.bjs);
    s.useRightHandedSystem = true;
    s.clearColor = Color4.FromHexString('#' + clear.toString(16).padStart(6, '0') + 'ff').toLinearSpace();
    s.ambientColor.set(0, 0, 0);
    s.skipPointerMovePicking = true;
    s.autoClear = true;
    // genug Lichter pro Material (Sonne, Himmel, Laternen, Neon)
    s.onNewMaterialAddedObservable.add((m: Material) => { (m as Material & { maxSimultaneousLights?: number }).maxSimultaneousLights = 8; });
    const ip = s.imageProcessingConfiguration;
    ip.toneMappingEnabled = true; ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    ip.exposure = 1.05; ip.contrast = 1.08;
    return s;
  }
  newCamera(s: Scene, fovDeg: number, near = .1, far = 400) {
    const c = new FreeCamera('cam', new Vector3(0, 2, 6), s);
    c.fov = fovDeg * Math.PI / 180; (c as FreeCamera & { _pcFov?: number })._pcFov = c.fov; c.minZ = near; c.maxZ = far; c.inputs.clear();
    return c;
  }

  /** Jedes Bild aufgerufen (für UI, die unabhängig von der Szene läuft) */
  onFrame(fn: (dt: number) => void) { this.hooks.add(fn); return () => this.hooks.delete(fn); }
  onQuality(fn: (q: Quality) => void) { this.qualityHooks.add(fn); fn(this.quality); return () => this.qualityHooks.delete(fn); }

  setQuality(q: number) {
    this.qualitySetting = q;
    if (q >= 0) this.applyQuality(q as Quality);
  }
  private applyQuality(q: Quality) {
    this.quality = q;
    this.qualityHooks.forEach((f) => f(q));
    this.pipes.forEach((p) => this.tunePipe(p));
    this.resize();
    document.documentElement.dataset.quality = String(q);
  }

  get aspect() { return innerWidth / Math.max(1, innerHeight); }

  setScene(s: GameScene) {
    const prev = this.scene;
    prev?.exit?.();
    this.scene = s;
    s.enter?.();
    this.ensurePipe(s);
    this.resize();
    if (prev && prev !== s && prev.transient) { this.pipes.get(prev.scene)?.dispose(); this.pipes.delete(prev.scene); prev.scene.dispose(); }
  }
  /** Szene sofort wegräumen (z. B. alter Innenraum) */
  disposeScene(s: GameScene) { if (s === this.scene) return; this.pipes.get(s.scene)?.dispose(); this.pipes.delete(s.scene); s.scene.dispose(); }

  resize() {
    const dpr = devicePixelRatio || 1, q = this.quality;
    // Handys haben sehr dichte Bildschirme: dort nie unter 1,1 Bildpunkte je CSS-Pixel, sonst wird das Bild matschig
    const cap = this.mobile ? (q === 0 ? 1.5 : 2) : q === 2 ? 2 : q === 1 ? 1.5 : 1;
    let scale = Math.min(dpr, cap) * this.res;
    if (this.mobile) scale = Math.max(Math.min(dpr, 1.1), scale);
    this.bjs.setHardwareScalingLevel(1 / scale);
    this.bjs.resize();
    // Hochkant: Blickwinkel weiten, damit man die Stadt sieht und nicht nur einen schmalen Streifen Straße
    const c = this.scene?.camera as (FreeCamera & { _pcFov?: number }) | undefined;
    if (c && c._pcFov) { const a = this.aspect; c.fov = a >= 1.2 ? c._pcFov : Math.min(1.42, 2 * Math.atan(Math.tan(c._pcFov / 2) * 1.2 / a)); }
  }

  /* Filmischer Look: ACES, Kontrast, mehr Sättigung, kühle Schatten / warme Lichter, Vignette, Bloom auf hoher Stufe */
  private ensurePipe(s: GameScene) {
    if (this.pipes.has(s.scene)) return;
    const p = new DefaultRenderingPipeline('pc', true, s.scene, [s.camera]);
    p.imageProcessingEnabled = true;
    const ip = p.imageProcessing;
    ip.toneMappingEnabled = true; ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    ip.exposure = 1.05; ip.contrast = 1.1;
    ip.vignetteEnabled = true; ip.vignetteWeight = 1.6; ip.vignetteStretch = .4; ip.vignetteCameraFov = .8;
    const cc = new ColorCurves();
    cc.globalSaturation = 34; cc.shadowsHue = 220; cc.shadowsDensity = 12; cc.shadowsSaturation = 30; cc.highlightsHue = 35; cc.highlightsDensity = 10; cc.highlightsSaturation = 25;
    ip.colorCurvesEnabled = true; ip.colorCurves = cc;
    const sip = s.scene.imageProcessingConfiguration;
    sip.contrast = 1.1; sip.colorCurvesEnabled = true; sip.colorCurves = cc;
    p.bloomThreshold = .82; p.bloomKernel = 48; p.bloomScale = .5;
    this.pipes.set(s.scene, p);
    this.tunePipe(p);
  }
  private tunePipe(p: DefaultRenderingPipeline) {
    const q = this.quality;
    p.samples = q === 2 ? 4 : 1;
    p.fxaaEnabled = q === 1;
    p.bloomEnabled = q === 2;
    // niedrige Stufe: kein Nachbearbeitungs-Durchgang (spart am Handy einen ganzen Bildschirm voll Arbeit), der Farblook läuft dann im Material mit
    p.imageProcessingEnabled = q > 0;
  }

  /** Weltpunkt → Bildschirm (Pixel), behind = hinter der Kamera */
  project(p: { x: number; y: number; z: number }) {
    const s = this.scene; if (!s) return { x: 0, y: 0, behind: true };
    const m = s.camera.getTransformationMatrix();
    const v = Vector3.TransformCoordinates(new Vector3(p.x, p.y, p.z), m);
    const w = p.x * m.m[3] + p.y * m.m[7] + p.z * m.m[11] + m.m[15];
    return { x: (v.x * .5 + .5) * innerWidth, y: (-v.y * .5 + .5) * innerHeight, behind: w < 0 };
  }
  static readonly I = Matrix.Identity();

  start() {
    this.applyQuality(this.quality);
    const loop = (t: number) => {
      requestAnimationFrame(loop);
      const dt = Math.min(.085, (t - (this.last || t)) / 1000); // bis 12 Bilder/s läuft das Spiel in Echtzeit statt in Zeitlupe
      this.last = t;
      this.input.update(t);
      this.hooks.forEach((f) => f(dt));
      const s = this.scene;
      if (s && !this.paused) {
        s.update(dt, t / 1000);
        const p = this.pipes.get(s.scene);
        if (p && this.quality === 2) p.bloomWeight = Math.max(0, s.bloom ?? 0) * .55;
        if (s.scene.activeCamera !== s.camera) s.scene.activeCamera = s.camera;
        this.bjs.beginFrame(); s.scene.render(); this.bjs.endFrame();
      }
      this.input.endFrame();
      this.measure(dt);
    };
    requestAnimationFrame(loop);
  }

  /* Automatische Grafikstufe: über 2 s gemessen, bei Ruckeln eine Stufe runter, bei viel Luft wieder hoch. */
  private measure(dt: number) {
    this.frames++; this.sampleT += dt;
    // Auflösung jede halbe Sekunde nachregeln: unter 48 Bildern/s weniger Bildpunkte, über 57 wieder mehr
    this.resFrames++; this.resT += dt;
    if (this.resT >= .5) {
      const f = this.resFrames / this.resT; this.resFrames = 0; this.resT = 0;
      const min = this.mobile ? .72 : .7, was = this.res;
      if (!this.paused && !document.hidden) {
        if (f < 48) this.res = Math.max(min, this.res * (f < 30 ? .85 : .93)); else if (f > 57) this.res = Math.min(1, this.res * 1.04);
        if (Math.abs(this.res - was) > .01) this.resize();
      }
    }
    if (this.sampleT < 2) return;
    this.fps = this.frames / this.sampleT;
    this.frames = 0; this.sampleT = 0;
    if (this.qualitySetting >= 0 || document.hidden) return;
    if (this.fps < 40) { this.slow++; this.fast = 0; } else if (this.fps > 58) { this.fast++; this.slow = 0; } else { this.slow = 0; this.fast = 0; }
    if (this.slow >= 2 && this.res <= (this.mobile ? .73 : .71) && this.quality > 0) { this.applyQuality((this.quality - 1) as Quality); this.slow = 0; }
    if (this.fast >= 8 && this.res >= 1 && this.quality < (this.mobile ? 1 : 2)) { this.applyQuality((this.quality + 1) as Quality); this.fast = 0; }
  }
}
