// Gemeinsamer WebGL-Renderer (eine Instanz für Lobby-Vorschau und Spiel).
import * as THREE from 'three';
import { settings } from '../core/settings';
import { AutoQuality, PROFILES, guessProfile, type QualityProfile } from './quality';

export class Renderer3D {
  readonly gl: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  profile: QualityProfile;
  readonly auto: AutoQuality;
  onQuality: ((p: QualityProfile) => void) | null = null;
  private lastW = 0;
  private lastH = 0;

  constructor(container: HTMLElement) {
    const probe = document.createElement('canvas');
    const ctx = probe.getContext('webgl2');
    if (!ctx) throw new Error('WebGL 2 wird von diesem Browser oder Gerät nicht unterstützt.');
    const guess = guessProfile(ctx);
    ctx.getExtension('WEBGL_lose_context')?.loseContext();
    const q = settings.data.quality;
    const start = q === 'auto' ? guess : q;
    this.profile = PROFILES[start];
    this.gl = new THREE.WebGLRenderer({ antialias: this.profile.antialias, powerPreference: 'high-performance', stencil: false });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.05;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvas = this.gl.domElement;
    this.canvas.setAttribute('aria-label', 'RIFTZONE Spielfeld');
    container.appendChild(this.canvas);
    this.auto = new AutoQuality(start);
    this.auto.enabled = q === 'auto';
    this.auto.onChange = (n) => {
      this.profile = PROFILES[n];
      this.resize(true);
      this.onQuality?.(this.profile);
    };
    settings.onChange((s) => {
      const want = s.quality === 'auto' ? this.auto.current : s.quality;
      this.auto.enabled = s.quality === 'auto';
      if (want !== this.profile.name) {
        this.profile = PROFILES[want];
        this.auto.current = want;
        this.onQuality?.(this.profile);
      }
      this.resize(true);
    });
    this.resize(true);
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL-Kontext verloren');
    });
  }

  /** Effektive Pixelrate: Profil × Einstellung, begrenzt auf die Geräte-Pixeldichte */
  pixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, this.profile.pixelRatio) * settings.data.renderScale;
  }

  resize(force = false): void {
    const w = window.innerWidth,
      h = window.innerHeight;
    if (!force && w === this.lastW && h === this.lastH) return;
    this.lastW = w;
    this.lastH = h;
    this.gl.setPixelRatio(Math.max(0.4, this.pixelRatio()));
    this.gl.setSize(w, h, false);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.gl.shadowMap.enabled = this.profile.shadows && settings.data.shadows;
  }

  get aspect(): number {
    return window.innerWidth / Math.max(1, window.innerHeight);
  }
}
