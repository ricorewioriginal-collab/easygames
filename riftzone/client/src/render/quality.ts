// Grafikprofile und automatische Anpassung an die Bildrate.
import { isMobileUA } from '../core/dom';
import type { QualityName } from '../core/settings';

export interface QualityProfile {
  name: Exclude<QualityName, 'auto'>;
  pixelRatio: number;
  shadows: boolean;
  shadowSize: number;
  viewDistance: number;
  grassDensity: number;
  maxRigs: number;
  terrainLodBias: number;
  particles: number;
  antialias: boolean;
}

export const PROFILES: Record<Exclude<QualityName, 'auto'>, QualityProfile> = {
  low: { name: 'low', pixelRatio: 0.7, shadows: false, shadowSize: 512, viewDistance: 340, grassDensity: 0, maxRigs: 8, terrainLodBias: 0.6, particles: 0.4, antialias: false },
  medium: { name: 'medium', pixelRatio: 1, shadows: false, shadowSize: 1024, viewDistance: 480, grassDensity: 0.45, maxRigs: 14, terrainLodBias: 0.8, particles: 0.7, antialias: false },
  high: { name: 'high', pixelRatio: 1.5, shadows: true, shadowSize: 2048, viewDistance: 650, grassDensity: 0.8, maxRigs: 22, terrainLodBias: 1, particles: 1, antialias: true },
  ultra: { name: 'ultra', pixelRatio: 2, shadows: true, shadowSize: 4096, viewDistance: 850, grassDensity: 1, maxRigs: 32, terrainLodBias: 1.3, particles: 1, antialias: true },
};

const ORDER: Exclude<QualityName, 'auto'>[] = ['low', 'medium', 'high', 'ultra'];

/** Startprofil schätzen (Gerät, Kerne, Speicher, GPU-Name). */
export function guessProfile(gl: WebGL2RenderingContext | null): Exclude<QualityName, 'auto'> {
  const mobile = isMobileUA();
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  let gpu = '';
  try {
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase();
  } catch {
    /* egal */
  }
  const weakGpu = /swiftshader|llvmpipe|software|mali-4|mali-t|adreno \(tm\) [3-5]\d\d|powervr|intel\(r\) hd graphics [2-5]/.test(gpu);
  if (weakGpu) return 'low';
  if (mobile) return mem >= 6 && cores >= 8 ? 'medium' : 'low';
  if (/rtx|radeon rx|apple m[2-9]|geforce gtx 1[06-9]|arc/.test(gpu) && cores >= 8) return 'high';
  return cores >= 8 && mem >= 8 ? 'high' : 'medium';
}

/** Senkt/hebt die Qualität, wenn die Bildrate dauerhaft nicht passt. */
export class AutoQuality {
  current: Exclude<QualityName, 'auto'>;
  private acc = 0;
  private frames = 0;
  private lowFor = 0;
  private highFor = 0;
  private raised = false;
  onChange: ((q: Exclude<QualityName, 'auto'>) => void) | null = null;
  enabled = true;
  target = 55;

  constructor(start: Exclude<QualityName, 'auto'>) {
    this.current = start;
  }

  sample(dt: number): void {
    if (!this.enabled) return;
    this.acc += dt;
    this.frames++;
    if (this.acc < 1) return;
    const fps = this.frames / this.acc;
    this.acc = 0;
    this.frames = 0;
    if (fps < this.target - 18) {
      this.lowFor++;
      this.highFor = 0;
    } else if (fps > this.target + 3) {
      this.highFor++;
      this.lowFor = 0;
    } else {
      this.lowFor = 0;
      this.highFor = 0;
    }
    const i = ORDER.indexOf(this.current);
    if (this.lowFor >= 4 && i > 0) {
      this.current = ORDER[i - 1]!;
      this.lowFor = 0;
      this.onChange?.(this.current);
    } else if (this.highFor >= 12 && i < 2 && !this.raised) {
      this.current = ORDER[i + 1]!;
      this.highFor = 0;
      this.raised = true;
      this.onChange?.(this.current);
    }
  }
}
