import * as THREE from 'three';

/** Gemeinsame Toon-Materialien (Cartoon-Look): wenige Helligkeitsstufen, kräftige Farben. */
let gradient: THREE.DataTexture | null = null;
function gradientMap(): THREE.DataTexture {
  if (!gradient) {
    const data = new Uint8Array([
      70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255,
    ]);
    gradient = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
    gradient.userData.shared = true;
  }
  return gradient;
}

const cache = new Map<string, THREE.Material>();

/** Toon-Material in einer Farbe (zwischengespeichert, wird beim Aufräumen NICHT freigegeben). */
export function toon(
  color: number | string,
  opts: { emissive?: number; emissiveIntensity?: number } = {},
): THREE.MeshToonMaterial {
  const key = `${new THREE.Color(color).getHexString()}|${opts.emissive ?? ''}|${opts.emissiveIntensity ?? ''}`;
  let m = cache.get(key) as THREE.MeshToonMaterial | undefined;
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color,
      gradientMap: gradientMap(),
      ...(opts.emissive !== undefined
        ? { emissive: opts.emissive, emissiveIntensity: opts.emissiveIntensity ?? 1 }
        : {}),
    });
    m.userData.shared = true;
    cache.set(key, m);
  }
  return m;
}

/** Selbstleuchtendes Material (ohne Beleuchtung) */
export function glow(color: number | string, opacity = 1): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  return m;
}

/** Gibt Geometrien, Materialien und Texturen einer Objekt-Hierarchie frei (außer als „shared“ markierte). */
export function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const m of mats) {
      if (m.userData.shared) continue;
      for (const k of Object.keys(m)) {
        const v = (m as unknown as Record<string, unknown>)[k];
        if (v instanceof THREE.Texture && !v.userData.shared) v.dispose();
      }
      m.dispose();
    }
    const sp = o as THREE.Sprite;
    if (sp.isSprite && sp.material.map && !sp.material.map.userData.shared) sp.material.map.dispose();
  });
  root.removeFromParent();
}

/** Text als Sprite (für Beschriftungen, Zahlen, Namensschilder) */
export function textSprite(
  text: string,
  opts: { color?: string; bg?: string; size?: number; width?: number } = {},
): THREE.Sprite {
  const size = opts.size ?? 64;
  const c = document.createElement('canvas');
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.font = `800 ${size}px Inter, "Segoe UI", Arial, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + size * 0.8;
  c.width = w;
  c.height = size * 1.5;
  const g2 = c.getContext('2d') as CanvasRenderingContext2D;
  if (opts.bg) {
    g2.fillStyle = opts.bg;
    g2.beginPath();
    g2.roundRect(0, 0, c.width, c.height, size * 0.4);
    g2.fill();
  }
  g2.font = `800 ${size}px Inter, "Segoe UI", Arial, sans-serif`;
  g2.fillStyle = opts.color ?? '#ffffff';
  g2.textAlign = 'center';
  g2.textBaseline = 'middle';
  g2.fillText(text, c.width / 2, c.height / 2 + size * 0.05);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const h = opts.width ? (opts.width * c.height) / c.width : 1;
  sp.scale.set(opts.width ?? c.width / c.height, h, 1);
  sp.renderOrder = 20;
  return sp;
}
