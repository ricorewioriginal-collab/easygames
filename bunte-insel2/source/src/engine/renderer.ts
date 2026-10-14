/* Renderer, Qualitätsprofile und automatische Auflösungsanpassung. */
import { clamp } from '../core/math.ts';

export type QualityName = 'low' | 'medium' | 'high';
export interface QualityProfile {
  name: QualityName;
  maxDpr: number;
  minDpr: number;
  shadows: boolean;
  shadowSize: number;
  shadowSoft: boolean;
  far: number;
  fogNear: number;
  foliage: number;      // Dichte der Gras-/Blumen-Instanzen 0..1
  npcRange: number;     // Sichtweite für Bewohner
  terrainStep: number;  // Rastergröße des Geländes in m
  particles: number;    // Partikel-Faktor
  water: 'simple' | 'waves';
}

export const PROFILES: Record<QualityName, QualityProfile> = {
  low: { name: 'low', maxDpr: 1, minDpr: 0.6, shadows: false, shadowSize: 0, shadowSoft: false, far: 300, fogNear: 90, foliage: 0.3, npcRange: 45, terrainStep: 4, particles: 0.4, water: 'simple' },
  medium: { name: 'medium', maxDpr: 1.5, minDpr: 0.75, shadows: true, shadowSize: 1024, shadowSoft: false, far: 460, fogNear: 140, foliage: 0.65, npcRange: 70, terrainStep: 3, particles: 0.75, water: 'waves' },
  high: { name: 'high', maxDpr: 2, minDpr: 1, shadows: true, shadowSize: 2048, shadowSoft: true, far: 640, fogNear: 190, foliage: 1, npcRange: 95, terrainStep: 2, particles: 1, water: 'waves' }
};

export const isMobile = (): boolean => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

export function autoQuality(): QualityName {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (isMobile()) return mem >= 6 && cores >= 8 ? 'medium' : 'low';
  if (cores <= 2 || mem <= 2) return 'low';
  return cores >= 8 ? 'high' : 'medium';
}

export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  profile: QualityProfile;
  private dpr: number;
  private fpsAcc = 0;
  private fpsFrames = 0;
  fps = 60;
  adaptive: boolean;

  constructor(canvas: HTMLCanvasElement, quality: QualityName, adaptive: boolean) {
    this.profile = PROFILES[quality];
    this.adaptive = adaptive;
    const gl = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'low', powerPreference: 'high-performance', alpha: false });
    // Farben werden so dargestellt, wie sie gewählt sind (kräftig wie im Original), ohne Filmkurve.
    gl.outputEncoding = THREE.LinearEncoding;
    gl.toneMapping = THREE.NoToneMapping;
    this.gl = gl;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxDpr);
    this.applyShadows();
    this.resize();
  }
  setQuality(q: QualityName, adaptive: boolean): void {
    this.profile = PROFILES[q];
    this.adaptive = adaptive;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxDpr);
    this.applyShadows();
    this.resize();
  }
  private applyShadows(): void {
    this.gl.shadowMap.enabled = this.profile.shadows;
    this.gl.shadowMap.type = this.profile.shadowSoft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.gl.shadowMap.needsUpdate = true;
  }
  resize(): void {
    const w = window.innerWidth, h = window.innerHeight;
    this.gl.setPixelRatio(this.dpr);
    this.gl.setSize(w, h, true);
  }
  get size(): { w: number; h: number } { return { w: window.innerWidth, h: window.innerHeight }; }
  /** Misst Bildrate; senkt/erhöht die Auflösung behutsam (nur im Automatik-Modus). */
  track(dt: number): void {
    this.fpsAcc += dt; this.fpsFrames++;
    if (this.fpsAcc < 1.5) return;
    this.fps = this.fpsFrames / this.fpsAcc;
    this.fpsAcc = 0; this.fpsFrames = 0;
    if (!this.adaptive || document.hidden) return;
    const max = Math.min(window.devicePixelRatio || 1, this.profile.maxDpr);
    let nd = this.dpr;
    if (this.fps < 30) nd = this.dpr * 0.85;
    else if (this.fps > 55 && this.dpr < max) nd = this.dpr * 1.08;
    nd = clamp(nd, this.profile.minDpr, max);
    if (Math.abs(nd - this.dpr) > 0.02) { this.dpr = nd; this.resize(); }
  }
  get pixelRatio(): number { return this.dpr; }
}
