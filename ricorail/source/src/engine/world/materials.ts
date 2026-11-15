// Gemeinsame Materialien (über alle Chunks geteilt) und Canvas-Texturen (nur mit DOM, sonst einfarbig).
import * as THREE from 'three';

export const hasDom = () => typeof document !== 'undefined' && typeof document.createElement === 'function';

function canvas(w: number, h: number): HTMLCanvasElement | null {
  if (!hasDom()) return null;
  try { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d') ? c : null; } catch { return null; }
}

/** Schotterbett mit Schwellen: u quer (0..1 = 3 m), v längs (1 = 0,6 m). Eigene prozedurale Textur (keine Fremd-Assets). */
function bedTexture(): THREE.Texture | null {
  const W = 128, H = 64;
  const c = canvas(W, H); if (!c) return null;
  const g = c.getContext('2d')!;
  // Schotter: viele kleine, schattierte Steine (hell, die Vertexfarbe färbt)
  g.fillStyle = '#9d988f'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 0.8 + Math.random() * 1.8, v = 140 + Math.floor(Math.random() * 100);
    g.fillStyle = `rgb(${v},${v - 3},${v - 9})`;
    g.beginPath(); g.ellipse(x, y, r * 1.2, r, Math.random() * 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - r * 0.5, y - r * 0.6, r * 0.7, r * 0.4);
  }
  // Schwelle (Beton) über 2,6 m Breite, 0,26 m tief, mit Kanten, Schatten und Befestigungen
  const sx = 6, sw = W - 12, sy = 19, sh = 28;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(sx, sy + sh, sw, 3);
  g.fillStyle = '#8c877e'; g.fillRect(sx, sy, sw, sh);
  for (let i = 0; i < 160; i++) { const v = 120 + Math.floor(Math.random() * 40); g.fillStyle = `rgba(${v},${v - 2},${v - 6},.5)`; g.fillRect(sx + Math.random() * sw, sy + Math.random() * sh, 1, 1); }
  g.fillStyle = '#a7a299'; g.fillRect(sx, sy, sw, 4);
  g.fillStyle = '#6f6a62'; g.fillRect(sx, sy + sh - 3, sw, 3);
  // Rippenplatten/Klemmen unter den Schienen (Spurweite ≈ 1,435 m von 3 m)
  for (const u of [0.26, 0.74]) { const x = u * W; g.fillStyle = '#3b3632'; g.fillRect(x - 6, sy + 6, 12, sh - 12); g.fillStyle = '#55504a'; g.fillRect(x - 6, sy + 6, 12, 2); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Schild mit Stationsnamen */
export function signTexture(name: string, maxSize: number): THREE.Texture | null {
  const w = Math.min(512, maxSize), h = w / 4;
  const c = canvas(w, h); if (!c) return null;
  const g = c.getContext('2d')!;
  g.fillStyle = '#123e8c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ffffff'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  g.fillStyle = '#ffffff';
  let fs = h * 0.5; g.font = `bold ${fs}px sans-serif`;
  while (g.measureText(name).width > w * 0.88 && fs > 8) { fs -= 2; g.font = `bold ${fs}px sans-serif`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, w / 2, h * 0.53);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Prozedurale Bodenkörnung (Wertrauschen, mehrere Oktaven) – ersetzt einfarbige Flächen ohne Texturspeicher */
const DETAIL_GLSL = `
float egH(vec2 p){ p = mod(p, 512.0); return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float egN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(egH(i), egH(i + vec2(1.0, 0.0)), f.x), mix(egH(i + vec2(0.0, 1.0)), egH(i + vec2(1.0)), f.x), f.y); }
vec3 groundDetail(vec3 wp, float up, float dist){
  float fl = smoothstep(0.55, 0.9, up);
  vec2 p = wp.xz;
  float macro = egN(p * 0.011) * 0.6 + egN(p * 0.043) * 0.4;
  float mid = egN(p * 0.27);
  float near = 1.0 - smoothstep(40.0, 480.0, dist);
  float fine = egN(p * 1.7) * 0.55 + egN(p * 5.3) * 0.45;
  float k = mix(1.0, 0.74 + 0.5 * macro, fl) * mix(1.0, 0.84 + 0.32 * mid, fl) * mix(1.0, 0.72 + 0.56 * fine, fl * near);
  float m = (macro - 0.5) * fl;
  return k * vec3(1.0 + 0.16 * m, 1.0 + 0.04 * m, 1.0 - 0.2 * m);
}
`;

export class Materials {
  readonly stat = new THREE.MeshLambertMaterial({ vertexColors: true });
  /** Leuchtstärke der glow-Punkte im statischen Material (Tag schwach, Nacht hell) */
  readonly glowU = { value: 0.3 };
  readonly bed: THREE.MeshLambertMaterial;
  readonly water = new THREE.MeshPhongMaterial({ color: 0x2e5f7a, specular: 0x6f8fa0, shininess: 60 });
  readonly lamp = new THREE.MeshBasicMaterial({ color: 0xffffff });
  readonly sleeper = new THREE.MeshLambertMaterial({ color: 0x8f8a82 });
  readonly barrier = new THREE.MeshLambertMaterial({ vertexColors: true });
  readonly xOn = new THREE.MeshBasicMaterial({ color: 0xff2010 });
  readonly xOff = new THREE.MeshBasicMaterial({ color: 0x301010 });
  readonly signPlain = new THREE.MeshBasicMaterial({ color: 0x1d4f9c });
  readonly bedTex: THREE.Texture | null;
  // gemeinsame Geometrien
  readonly lampGeo = new THREE.CircleGeometry(0.13, 8);
  readonly sleeperGeo = new THREE.BoxGeometry(2.6, 0.16, 0.26);
  readonly armGeo: THREE.BufferGeometry;
  readonly xLightGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);

  constructor() {
    this.bedTex = bedTexture();
    this.bed = new THREE.MeshLambertMaterial({ vertexColors: true, map: this.bedTex });
    // Fenster/Lampen/Neon im selben Mesh wie die übrige Geometrie: Attribut glow (0/1) → Eigenleuchten
    this.stat.onBeforeCompile = (sh) => {
      sh.uniforms.uGlow = this.glowU;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float glow;\nvarying float vGlow;')
        .replace('#include <common>\nattribute float glow;', '#include <common>\nattribute float glow;\nvarying vec3 vWPos;\nvarying float vUp;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = glow;\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvUp = normalize(mat3(modelMatrix) * objectNormal).y;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow;\nuniform float uGlow;\nvarying vec3 vWPos;\nvarying float vUp;\n' + DETAIL_GLSL)
        // Bodendetail: Gras-/Erd-/Kieskörnung auf flachen Flächen, Großflächen-Variation, nah stark, fern ausgeblendet
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= groundDetail(vWPos, vUp, length(vWPos - cameraPosition)) * (1.0 - vGlow) + vGlow;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow * uGlow;\ndiffuseColor.rgb *= 1.0 - 0.75 * vGlow;');
    };
    this.stat.customProgramCacheKey = () => 'world-static-glow-detail';
    this.stat.name = 'world-static'; this.bed.name = 'world-bed'; this.lamp.name = 'signal-lamp'; this.barrier.name = 'barrier';
    // Schranke: rot-weiß gestreift, Drehpunkt bei x = 0
    const b = new THREE.BoxGeometry(6.5, 0.12, 0.1, 10, 1, 1); b.translate(3.25, 0, 0);
    const g = b.toNonIndexed(); b.dispose();
    const pos = g.getAttribute('position'), col = new Float32Array(pos.count * 3);
    const red = new THREE.Color(0xd01818), white = new THREE.Color(0xf4f4f4);
    for (let i = 0; i < pos.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      const c = Math.floor(cx / 0.65) % 2 ? red : white;
      for (let k = i; k < i + 3; k++) { col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.armGeo = g;
  }
  all(): THREE.Material[] { return [this.stat, this.bed, this.water, this.lamp, this.sleeper, this.barrier, this.xOn, this.xOff, this.signPlain]; }
  dispose() {
    for (const m of this.all()) m.dispose();
    this.bedTex?.dispose();
    this.lampGeo.dispose(); this.sleeperGeo.dispose(); this.armGeo.dispose(); this.xLightGeo.dispose();
  }
}
