/* Canvas-Texturen: Schilder, Namensschilder, Symbole. */
const FONT = "'Fredoka', 'Trebuchet MS', system-ui, sans-serif";

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

export interface LabelOpts { bg?: string; fg?: string; border?: string; size?: number; width?: number; sub?: string; icon?: string }
/** Schild-Textur mit Text (ggf. Symbol und Untertitel). */
export function labelTexture(text: string, o: LabelOpts = {}): { tex: THREE.CanvasTexture; aspect: number } {
  const size = o.size ?? 64, pad = 22;
  const cv = document.createElement('canvas');
  const c = cv.getContext('2d')!;
  c.font = 'bold ' + size + 'px ' + FONT;
  const main = (o.icon ? o.icon + ' ' : '') + text;
  let w = c.measureText(main).width;
  if (o.sub) { c.font = 'bold ' + Math.round(size * 0.5) + 'px ' + FONT; w = Math.max(w, c.measureText(o.sub).width); }
  const W = Math.min(1024, Math.ceil(w + pad * 2)), H = Math.ceil(size * (o.sub ? 1.9 : 1.35) + pad);
  cv.width = W; cv.height = H;
  if (o.bg !== 'none') {
    c.fillStyle = o.bg ?? 'rgba(40,30,80,0.86)';
    roundRect(c, 4, 4, W - 8, H - 8, Math.min(28, H / 3)); c.fill();
    c.lineWidth = 6; c.strokeStyle = o.border ?? '#ffd23f'; c.stroke();
  }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = o.fg ?? '#ffffff';
  c.font = 'bold ' + size + 'px ' + FONT;
  if (o.bg === 'none') { c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.strokeText(main, W / 2, o.sub ? H * 0.36 : H / 2); }
  c.fillText(main, W / 2, o.sub ? H * 0.36 : H / 2, W - pad);
  if (o.sub) { c.font = 'bold ' + Math.round(size * 0.5) + 'px ' + FONT; c.fillStyle = '#dfe6ff'; c.fillText(o.sub, W / 2, H * 0.74, W - pad); }
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return { tex, aspect: W / H };
}

/** Schwebendes Schild (immer zur Kamera gedreht). height = Höhe in m. */
export function labelSprite(text: string, height: number, o: LabelOpts = {}): THREE.Sprite {
  const { tex, aspect } = labelTexture(text, o);
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  m.userData.disposeWithWorld = true;
  const s = new THREE.Sprite(m);
  s.scale.set(height * aspect, height, 1);
  s.renderOrder = 5;
  return s;
}

/** Flaches Schild (Mesh) für Holztafeln, Ladenschilder. */
export function signMesh(text: string, height: number, o: LabelOpts = {}): THREE.Mesh {
  const { tex, aspect } = labelTexture(text, { bg: '#fff6dc', fg: '#5a3a1a', border: '#8a5a33', ...o });
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  m.userData.disposeWithWorld = true;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), m);
  return mesh;
}

/** Weicher runder Punkt (Partikel, Glanz). */
let dotTex: THREE.CanvasTexture | null = null;
export function softDot(): THREE.CanvasTexture {
  if (dotTex) return dotTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(cv);
  return dotTex;
}
/** Stern-Symbol als Textur. */
let starTex: THREE.CanvasTexture | null = null;
export function starTexture(): THREE.CanvasTexture {
  if (starTex) return starTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d')!;
  c.translate(32, 32); c.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 28, a = (i / 10) * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.closePath(); c.fillStyle = '#fff'; c.fill();
  starTex = new THREE.CanvasTexture(cv);
  return starTex;
}
