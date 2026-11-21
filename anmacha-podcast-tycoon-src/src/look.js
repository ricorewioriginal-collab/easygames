/* Babylon-Optik für alle Szenen: weiche Schatten, Leuchten (Neon, ON AIR, Bildschirme), Bloom, Kantenglättung, Filmlook.
   Grafikstufe (W.quality): 0 schnell, 1 mittel = Handy (keine Nachbearbeitung: scharfe Kanten über die Kantenglättung des Bildschirms, dafür höhere Auflösung),
   2 hoch (Nachbearbeitung mit MSAA, Schärfen, Leuchten, weichere Schatten). */
import { ShadowGenerator, DefaultRenderingPipeline, GlowLayer, ColorCurves, Frustum } from './babylon.js';

export class Look {
  constructor(R, scene, cam) {
    this.R = R; this.scene = scene; this.cam = cam;
    this.exposureK = 1 / 0.6;           // ACES wie bisher (Belichtung / 0,6)
    this.lightK = 2.2; this.hemiK = 2.2;  // gleiche Helligkeit wie bisher (gemessen)
    this.q = -1; this.pipe = null; this.glow = null; this.sgs = new Set();
    this.glowK = 1;                     // Szenen können das Leuchten verstärken (Party, Nacht)
    const ip = scene.imageProcessingConfiguration;
    ip.contrast = 1.06;
    const cc = new ColorCurves(); cc.globalSaturation = 12; cc.highlightsHue = 35; cc.highlightsDensity = 8; cc.highlightsSaturation = 20; cc.shadowsHue = 225; cc.shadowsDensity = 10; cc.shadowsSaturation = 25;
    ip.colorCurvesEnabled = true; ip.colorCurves = cc;
    ip.vignetteEnabled = true; ip.vignetteWeight = 1.4; ip.vignetteStretch = 0.35; ip.vignetteCameraFov = 0.9;
  }
  quality() { const w = typeof window !== 'undefined' && window.AMC && window.AMC.World; return w && w.quality != null ? w.quality : 2; }
  apply(q) {
    this.q = q;
    const s = this.scene, gl2 = s.getEngine().webGLVersion > 1;
    if (q >= 2 && !this.pipe) {
      const p = this.pipe = new DefaultRenderingPipeline('look', false, s, [this.cam]);
      p.imageProcessingEnabled = false;   // Farblook rechnen die Materialien selbst (Himmel bleibt unverändert)
      p.bloomThreshold = 0.93; p.bloomWeight = 0.16; p.bloomKernel = 40; p.bloomScale = 0.5;   // nur echte Lichtspitzen, Tageslicht bleibt klar
      p.sharpenEnabled = true; p.sharpen.edgeAmount = 0.18;
    }
    if (this.pipe) {
      const p = this.pipe;
      p.samples = q > 1 && gl2 ? 4 : 1;
      p.fxaaEnabled = q === 1 || !gl2;
      p.bloomEnabled = false;            // Bloom überstrahlt die helle Tagesstadt – Leuchten übernimmt der GlowLayer gezielt
      if (q < 2) { p.dispose(); this.pipe = null; }
    }
    if (q >= 2 && !this.glow) {
      this.glow = new GlowLayer('neon', s, { mainTextureRatio: q > 1 ? 0.5 : 0.35, blurKernelSize: q > 1 ? 48 : 32 });
      this.glow.intensity = 0.55;
      // Nur starke Leuchtfarben (Neon, ON AIR, Bildschirme) leuchten nach – leicht getönte Fassaden nicht
      this.glow.customEmissiveColorSelector = (mesh, sub, mat, out) => {
        const e = mat && mat.emissiveColor; const k = e ? Math.max(e.r, e.g, e.b) : 0;
        if (e && (k > 0.85 || (mat.emissiveTexture && k > 0.6))) out.set(e.r, e.g, e.b, 1); else out.set(0, 0, 0, 1);
      };
    } else if (q < 2 && this.glow) { this.glow.dispose(); this.glow = null; }
    this.sgs.forEach(sg => { if (!sg.getShadowMap()) this.sgs.delete(sg); else this.tuneShadow(sg); });
  }
  makeShadow(light, size) {
    const sg = new ShadowGenerator(size, light);
    sg.usePercentageCloserFiltering = true;
    sg.bias = 0.0006; sg.normalBias = 0.025;
    light.shadowOrthoScale = 0;
    this.sgs.add(sg);
    this.tuneShadow(sg);
    // Nur Schattenwerfer im Schattenbereich der Sonne zeichnen (Babylon zeichnet sonst ALLE Werfer der Stadt in die Schattenkarte)
    const planes = Frustum.GetPlanes(sg.getTransformMatrix()), out = [];
    sg.getShadowMap().getCustomRenderList = (layer, list, n) => {
      if (!list) return null;
      Frustum.GetPlanesToRef(sg.getTransformMatrix(), planes); out.length = 0;
      for (let i = 0; i < n; i++) { const m = list[i]; if (m.isEnabled() && m.isVisible && m.isInFrustum(planes)) out.push(m); }
      this.shadowCasters = out.length;
      return out;
    };
    return sg;
  }
  tuneShadow(sg) {
    sg.filteringQuality = this.q > 1 ? ShadowGenerator.QUALITY_HIGH : ShadowGenerator.QUALITY_LOW;
    sg.darkness = 0;
  }
  fitShadow(sg, light, c) {
    if (light.orthoLeft !== c.left) light.orthoLeft = c.left;
    if (light.orthoRight !== c.right) light.orthoRight = c.right;
    if (light.orthoTop !== c.top) light.orthoTop = c.top;
    if (light.orthoBottom !== c.bottom) light.orthoBottom = c.bottom;
    if (light.shadowMinZ !== c.near) light.shadowMinZ = c.near;
    if (light.shadowMaxZ !== c.far) light.shadowMaxZ = c.far;
  }
  resize() {}
  beforeRender() {
    const q = this.quality(); if (q !== this.q) this.apply(q);
    if (this.glow) this.glow.intensity = 0.55 * this.glowK;
  }
}
