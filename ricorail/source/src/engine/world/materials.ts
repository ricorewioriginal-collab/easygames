// Gemeinsame Materialien (über alle Chunks geteilt) und Canvas-Texturen (nur mit DOM, sonst einfarbig).
import * as THREE from 'three';

export const hasDom = () => typeof document !== 'undefined' && typeof document.createElement === 'function';

function canvas(w: number, h: number): HTMLCanvasElement | null {
  if (!hasDom()) return null;
  try { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d') ? c : null; } catch { return null; }
}

/** Schotterbett mit Schwellen: u quer (0..1 = 3 m), v längs (1 = 0,6 m) */
function bedTexture(): THREE.Texture | null {
  const c = canvas(64, 32); if (!c) return null;
  const g = c.getContext('2d')!;
  // Schotter (hell, Vertexfarbe färbt)
  g.fillStyle = '#d8d4cc'; g.fillRect(0, 0, 64, 32);
  for (let i = 0; i < 260; i++) { const v = 150 + Math.floor(Math.random() * 90); g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(Math.random() * 64, Math.random() * 32, 2, 2); }
  // Schwelle (Beton) über 2,6 m Breite, 0,26 m tief
  g.fillStyle = '#8f8a82'; g.fillRect(3, 9, 58, 14);
  g.fillStyle = '#a19c94'; g.fillRect(3, 9, 58, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
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
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = glow;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow;\nuniform float uGlow;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow * uGlow;\ndiffuseColor.rgb *= 1.0 - 0.75 * vGlow;');
    };
    this.stat.customProgramCacheKey = () => 'world-static-glow';
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
