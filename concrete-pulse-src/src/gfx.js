// Grafik: Engine, Szene, HDR-Umgebung, Sonne mit Schatten, Post-Processing, prozedurale Texturen.
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CascadedShadowGenerator } from '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import { SSAO2RenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline';
import '@babylonjs/core/Rendering/prePassRendererSceneComponent';
import '@babylonjs/core/Rendering/geometryBufferRendererSceneComponent';
import '@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { BackgroundMaterial } from '@babylonjs/core/Materials/Background/backgroundMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';
import '@babylonjs/core/Helpers/sceneHelpers';

export const QUALITY = {
  low: { scale: 1.6, shadows: 1024, cascades: 2, ssao: false, bloom: false, msaa: 1, fxaa: true },
  mid: { scale: 1.15, shadows: 2048, cascades: 3, ssao: false, bloom: true, msaa: 1, fxaa: true },
  high: { scale: 1, shadows: 2048, cascades: 4, ssao: true, bloom: true, msaa: 4, fxaa: false }
};

export function createEngine(canvas) {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: false, powerPreference: 'high-performance', adaptToDeviceRatio: false }, false);
  return engine;
}

export function autoQuality() {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth < 1100);
  return mobile ? 'low' : 'mid';
}

export const lin = c => Color3.FromHexString(c).toLinearSpace();

// ---------------------------------------------------------------- Prozedurale Texturen
function noiseCanvas(size, seed, draw) {
  const t = document.createElement('canvas'); t.width = t.height = size;
  const g = t.getContext('2d'); let s = seed >>> 0 || 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  draw(g, rnd, size); return t;
}
export function texConcrete(scene, base = '#9a9a96', seed = 7, scale = 6) {
  const cv = noiseCanvas(512, seed, (g, r, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) { const v = (r() * 60 - 30) | 0; g.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},${0.05 + r() * 0.08})`; const s = 1 + r() * 3; g.fillRect(r() * S, r() * S, s, s); }
    for (let i = 0; i < 70; i++) { const d = r() < 0.7; g.fillStyle = d ? `rgba(0,0,0,${0.03 + r() * 0.07})` : `rgba(255,255,255,${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * S, r() * S, 8 + r() * 70, 6 + r() * 40, r() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(0,0,0,${0.12 + r() * 0.12})`; g.lineWidth = 1 + r() * 1.5; g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 10; k++) { x += r() * 26 - 13; y += r() * 26 - 13; g.lineTo(x, y); } g.stroke(); }
    // Schleifspuren von Rollen
    for (let i = 0; i < 18; i++) { g.strokeStyle = `rgba(20,20,20,${0.05 + r() * 0.06})`; g.lineWidth = 2; g.beginPath(); const x = r() * S, y = r() * S, a = r() * 6.3, l = 40 + r() * 140; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 20, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(1, 1, S - 2, S - 2);   // Fugen
    g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += r() * 30 - 15; y += r() * 30 - 15; g.lineTo(x, y); } g.stroke(); }
  });
  const t = new DynamicTexture('conc' + seed, cv, scene, true); t.update(); t.uScale = t.vScale = scale; t.anisotropicFilteringLevel = 8; return t;
}
export function texWood(scene, seed = 3) {
  const cv = noiseCanvas(512, seed, (g, r, S) => {
    g.fillStyle = '#b98953'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 64) { g.fillStyle = `rgba(${90 + r() * 50},${60 + r() * 30},30,.25)`; g.fillRect(0, y, S, 64); g.fillStyle = 'rgba(40,20,5,.5)'; g.fillRect(0, y, S, 2); }
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(70,40,15,${0.05 + r() * 0.1})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const y = r() * S; g.moveTo(0, y); for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x / 50 + i) * 3); g.stroke(); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(30,30,30,.5)'; g.beginPath(); g.arc((r() * 8 | 0) * 64 + 8, (r() * 8 | 0) * 64 + 10, 2, 0, 7); g.fill(); }
  });
  const t = new DynamicTexture('wood' + seed, cv, scene, true); t.update(); t.uScale = t.vScale = 2; t.anisotropicFilteringLevel = 8; return t;
}
export function texStripes(scene, c1, c2) {
  const cv = noiseCanvas(128, 1, (g, r, S) => { g.fillStyle = c1; g.fillRect(0, 0, S, S); g.fillStyle = c2; for (let i = -S; i < S * 2; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 0); g.lineTo(i + 16 - S, S); g.lineTo(i - S, S); g.fill(); } });
  const t = new DynamicTexture('stripe' + c1, cv, scene, true); t.update(); return t;
}
export function texGraffiti(scene, seed, palette) {
  const cv = noiseCanvas(512, seed, (g, r, S) => {
    g.fillStyle = palette[0]; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 14; i++) { g.fillStyle = palette[1 + (r() * (palette.length - 1) | 0)]; g.globalAlpha = 0.85; g.beginPath(); const x = r() * S, y = r() * S; g.ellipse(x, y, 30 + r() * 120, 15 + r() * 60, r() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1; g.lineWidth = 9; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { g.strokeStyle = palette[1 + (r() * (palette.length - 1) | 0)]; g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += r() * 120 - 60; y += r() * 80 - 40; g.quadraticCurveTo(x + 30, y - 30, x, y); } g.stroke(); }
    const words = ['PULSE', 'FLOW', 'BETON', 'LINE', 'KICK', 'ROLL', 'NOX', 'DRIFT'];
    g.font = '900 86px system-ui, sans-serif'; g.textAlign = 'center';
    for (let i = 0; i < 2; i++) { const w = words[r() * words.length | 0]; g.save(); g.translate(S * (0.3 + r() * 0.4), S * (0.3 + i * 0.4)); g.rotate(r() * 0.4 - 0.2); g.lineWidth = 14; g.strokeStyle = '#111'; g.strokeText(w, 0, 0); g.fillStyle = palette[1 + (r() * (palette.length - 1) | 0)]; g.fillText(w, 0, 0); g.restore(); }
  });
  const t = new DynamicTexture('graf' + seed, cv, scene, true); t.update(); return t;
}

// ---------------------------------------------------------------- Szene
export function createScene(engine, park, quality) {
  const Q = QUALITY[quality] || QUALITY.mid;
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  scene.clearColor = Color4.FromHexString(park.fog + 'ff');
  scene.ambientColor = new Color3(0.1, 0.1, 0.1);
  scene.skipPointerMovePicking = true;
  scene.autoClear = true;
  engine.setHardwareScalingLevel(Q.scale / Math.min(2, window.devicePixelRatio || 1));

  // Umgebung aus HDR (CC0, Poly Haven)
  const env = new HDRCubeTexture('hdr/' + park.hdr + '.hdr', scene, 128, false, true, false, true);
  env.rotationY = park.envRot || 0;
  scene.environmentTexture = env;
  scene.environmentIntensity = park.envI ?? 1;
  const sky = MeshBuilder.CreateBox('sky', { size: 900, sideOrientation: 1 }, scene);
  const skyM = new BackgroundMaterial('skyM', scene);
  const skyTex = new HDRCubeTexture('hdr/' + park.hdr + '.hdr', scene, 512, false, false, false, false);
  skyTex.coordinatesMode = Texture.SKYBOX_MODE; skyTex.rotationY = park.envRot || 0;
  skyM.reflectionTexture = skyTex; skyM.backFaceCulling = false; skyM.primaryColor = lin(park.skyTint || '#ffffff');
  sky.material = skyM; sky.infiniteDistance = true; sky.isPickable = false; sky.applyFog = false;

  scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = park.fogD ?? 0.006; scene.fogColor = lin(park.fog);

  const sunDir = new Vector3(...park.sun).normalize();
  const sun = new DirectionalLight('sun', sunDir, scene);
  sun.intensity = park.sunI ?? 3; sun.diffuse = lin(park.sunC || '#fff4e0'); sun.position = sunDir.scale(-80);
  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemi.intensity = park.hemiI ?? 0.25; hemi.diffuse = lin(park.hemiC || '#9fb8ff'); hemi.groundColor = lin('#3a3530');

  let shadow;
  if (Q.cascades > 1) {
    shadow = new CascadedShadowGenerator(Q.shadows, sun);
    shadow.numCascades = Q.cascades; shadow.lambda = 0.85; shadow.shadowMaxZ = 120; shadow.stabilizeCascades = true;
    shadow.autoCalcDepthBounds = false; shadow.cascadeBlendPercentage = 0.08;
    shadow.usePercentageCloserFiltering = true; shadow.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    shadow.bias = 0.004; shadow.normalBias = 0.02; shadow.darkness = 0.05;
  }

  // Post-Processing
  const ip = scene.imageProcessingConfiguration;
  ip.toneMappingEnabled = true; ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  ip.exposure = park.exposure ?? 0.95; ip.contrast = 1.32;
  ip.vignetteEnabled = true; ip.vignetteWeight = 1.6; ip.vignetteColor = new Color4(0, 0, 0, 0); ip.vignetteStretch = 0.4;
  return { scene, sun, hemi, shadow, env, Q, sky };
}

export function addPipeline(scene, camera, Q, park) {
  const pipe = new DefaultRenderingPipeline('pipe', true, scene, [camera]);
  pipe.samples = Q.msaa;
  pipe.fxaaEnabled = Q.fxaa;
  pipe.bloomEnabled = Q.bloom; pipe.bloomThreshold = park.bloomT ?? 0.85; pipe.bloomWeight = park.bloomW ?? 0.35; pipe.bloomKernel = 48; pipe.bloomScale = 0.5;
  pipe.imageProcessingEnabled = true;
  pipe.chromaticAberrationEnabled = Q.bloom; pipe.chromaticAberration.aberrationAmount = 12; pipe.chromaticAberration.radialIntensity = 0.6;
  pipe.sharpenEnabled = Q.msaa > 1; if (pipe.sharpenEnabled) pipe.sharpen.edgeAmount = 0.15;
  pipe.grainEnabled = true; pipe.grain.intensity = 6; pipe.grain.animated = true;
  let ssao = null;
  if (Q.ssao) {
    try {
      ssao = new SSAO2RenderingPipeline('ssao', scene, { ssaoRatio: 0.5, blurRatio: 0.5 }, [camera], true);
      ssao.radius = 1.2; ssao.totalStrength = 1.1; ssao.samples = 12; ssao.maxZ = 80; ssao.expensiveBlur = false;
    } catch (e) { ssao = null; }
  }
  return { pipe, ssao };
}

export function pbr(scene, name, o = {}) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = o.color ? lin(o.color) : Color3.White();
  if (o.tex) m.albedoTexture = o.tex;
  m.metallic = o.metal ?? 0; m.roughness = o.rough ?? 0.8;
  if (o.emissive) { m.emissiveColor = lin(o.emissive); m.emissiveIntensity = o.emI ?? 1; }
  if (o.clear) { m.clearCoat.isEnabled = true; m.clearCoat.intensity = o.clear; }
  if (o.alpha != null) { m.alpha = o.alpha; }
  m.maxSimultaneousLights = 6;
  return m;
}
export { PointLight };
