// Prozedurale Führerstände (Innenansicht) – 11 eigenständige Pultanordnungen.
// Achsen wie vehicles.ts: +x = Blickrichtung (Frontscheibe), +y oben, RECHTS = +z, LINKS = −z.
// Ursprung = Vorderkante des Führerstandsfahrzeugs (x = +len/2 im Fahrzeugsystem) auf Schienenoberkante;
// die Maße der Innenräume sind auf die Außenmodelle in vehicles.ts abgestimmt.
// Bei der Dampflok liegt der Führerstand hinter dem Kessel (x ≈ −10,4 … −13,5).
import * as THREE from 'three';
import type { CabLayout } from '../../trains/stock';

export type CabControlId = 'throttle' | 'brake' | 'dyn' | 'combined' | 'reverser' | 'cutoff' | 'emergency' | 'horn' | 'sand' | 'panto' | 'mainSwitch' | 'engine' | 'lights' | 'cabLight' | 'wipers' | 'doorsL' | 'doorsR' | 'doorsClose' | 'parking' | 'sifa' | 'pzbAck' | 'injector' | 'firing' | 'battery';
export interface CabControl { id: CabControlId; obj: THREE.Object3D; kind: 'lever' | 'button' | 'toggle' | 'rotary'; label: string }
export interface CabState {
  kmh: number; vmax: number; limit: number; target: number | null; targetDist: number | null;
  throttle: number; brake: number; dyn: number; reverser: -1 | 0 | 1; cutoff: number;
  pipe: number; cyl: number; mainRes: number;
  power: number; panto: number; mainSwitch: boolean; engineRpm: number;
  doorL: number; doorR: number; releaseL: boolean; releaseR: boolean; lights: 0 | 1 | 2; cabLight: boolean; wipers: boolean; parking: boolean; sand: boolean; emergency: boolean;
  boiler: number; glass: number; fire: number; fuel: number;
  aspect: string;
  pzb: { warn: boolean; monitor: boolean; brake: boolean }; sifaWarn: boolean; forced: boolean;
  clock: string; nextStop: string; nextStopDist: number | null; gradient: number; slip: boolean;
  time: number; night: boolean;
}
export interface CabModel {
  group: THREE.Group;
  eye: THREE.Vector3;
  controls: CabControl[];
  update(s: CabState, dt: number): void;
  dispose(): void;
}
type Q = 'low' | 'medium' | 'high';
type V2 = [number, number];
type Fn<T> = (s: CabState) => T;

// ------------------------------------------------------------------ geteilte Ressourcen
const MATS = new Map<string, THREE.Material>();
const TEXS = new Map<string, THREE.Texture | null>();
const GEOS = new Map<string, THREE.BufferGeometry>();

function makeCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  try { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d') ? c : null; } catch { return null; }
}
function sharedTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.Texture | null {
  if (TEXS.has(key)) return TEXS.get(key) ?? null;
  const c = makeCanvas(w, h);
  let t: THREE.CanvasTexture | null = null;
  if (c) { draw(c.getContext('2d')!); t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; }
  TEXS.set(key, t);
  return t;
}
interface MO { color?: number; map?: THREE.Texture | null; rough?: number; metal?: number; emissive?: number; ei?: number; emap?: boolean; transparent?: boolean; opacity?: number; side?: THREE.Side; basic?: boolean; depthWrite?: boolean }
function makeMat(q: Q, o: MO): THREE.Material {
  const base = { color: o.color ?? 0xffffff, map: o.map ?? null, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, depthWrite: o.depthWrite ?? true };
  if (o.basic) return new THREE.MeshBasicMaterial(base);
  const em = { emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 1, emissiveMap: o.emap ? o.map ?? null : null };
  return q === 'low' ? new THREE.MeshLambertMaterial({ ...base, ...em }) : new THREE.MeshStandardMaterial({ ...base, ...em, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0.1 });
}
function mat(q: Q, key: string, o: MO): THREE.Material {
  const k = q[0] + '|' + key;
  let m = MATS.get(k);
  if (!m) { m = makeMat(q, o); MATS.set(k, m); }
  return m;
}
function geo(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = GEOS.get(key);
  if (!g) { g = make(); GEOS.set(key, g); }
  return g;
}
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1));
const cylG = (n: number) => geo('cyl' + n, () => new THREE.CylinderGeometry(0.5, 0.5, 1, n));
const sphG = (n: number) => geo('sph' + n, () => new THREE.SphereGeometry(0.5, n, Math.max(4, n >> 1)));
/** Fläche in lokaler xz-Ebene, Normale +y; Texturoben → +x, Texturrechts → +z */
const faceG = () => geo('face', () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).rotateY(-Math.PI / 2));
const circG = (n: number) => geo('circ' + n, () => new THREE.CircleGeometry(0.5, n).rotateX(-Math.PI / 2).rotateY(-Math.PI / 2));
const torG = (n: number) => geo('tor' + n, () => new THREE.TorusGeometry(0.5, 0.06, 6, n).rotateX(Math.PI / 2));
const css = (c: number) => '#' + (c & 0xffffff).toString(16).padStart(6, '0');
function shade(c: number, f: number): number {
  return (Math.min(255, ((c >> 16) & 255) * f) << 16) | (Math.min(255, ((c >> 8) & 255) * f) << 8) | Math.min(255, (c & 255) * f);
}

function labelTex(text: string): THREE.Texture | null {
  return sharedTex('lbl|' + text, 256, 48, (g) => {
    g.fillStyle = '#16181b'; g.fillRect(0, 0, 256, 48);
    g.fillStyle = '#f0f0ea'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 30; g.font = `bold ${fs}px sans-serif`;
    while (g.measureText(text).width > 244 && fs > 12) { fs -= 2; g.font = `bold ${fs}px sans-serif`; }
    g.fillText(text, 128, 25);
  });
}

interface Dial { min: number; max: number; major: number; minor: number; unit: string; title: string; red?: number; numDiv?: number }
function dialTex(d: Dial, face: string): THREE.Texture | null {
  const key = `dial|${d.min}|${d.max}|${d.major}|${d.minor}|${d.unit}|${d.title}|${d.red ?? ''}|${face}`;
  return sharedTex(key, 256, 256, (g) => {
    const c = 128;
    g.fillStyle = '#0e0f10'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = face; g.beginPath(); g.arc(c, c, 124, 0, Math.PI * 2); g.fill();
    const ang = (v: number) => (-135 + 270 * (v - d.min) / (d.max - d.min)) * Math.PI / 180;
    g.strokeStyle = '#f2f2ee'; g.fillStyle = '#f2f2ee'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (d.red !== undefined) {
      g.strokeStyle = '#d0242a'; g.lineWidth = 8; g.beginPath();
      g.arc(c, c, 104, ang(d.red) - Math.PI / 2, ang(d.max) - Math.PI / 2); g.stroke(); g.strokeStyle = '#f2f2ee';
    }
    for (let v = d.min; v <= d.max + 1e-6; v += d.minor) {
      const a = ang(v), maj = Math.abs((v - d.min) / d.major - Math.round((v - d.min) / d.major)) < 1e-6;
      const r0 = maj ? 92 : 100;
      g.lineWidth = maj ? 4 : 2;
      g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * 112, c - Math.cos(a) * 112); g.stroke();
      if (maj) {
        g.font = 'bold 22px sans-serif';
        const n = d.numDiv ? v / d.numDiv : v;
        g.fillText(String(Math.round(n * 10) / 10), c + Math.sin(a) * 74, c - Math.cos(a) * 74);
      }
    }
    g.font = 'bold 20px sans-serif'; g.fillText(d.unit, c, c + 50);
    g.font = '16px sans-serif'; g.fillStyle = '#c9c9c0'; g.fillText(d.title, c, c + 76);
  });
}

// ------------------------------------------------------------------ Displays
type Theme = 'std' | 'neon' | 'tram' | 'warm';
const THEME: Record<Theme, { bg: string; bgN: string; fg: string; dim: string; bar: string; acc: string; frame: string; font: string }> = {
  std: { bg: '#0d1620', bgN: '#060a0f', fg: '#eef3f7', dim: '#8ea0b1', bar: '#d8e2ea', acc: '#3aa0ff', frame: '#22303d', font: 'sans-serif' },
  neon: { bg: '#05040c', bgN: '#020107', fg: '#c9fbff', dim: '#6a7fa8', bar: '#19f0ff', acc: '#ff2d95', frame: '#1b1440', font: 'sans-serif' },
  tram: { bg: '#141414', bgN: '#080808', fg: '#ffe9a8', dim: '#a39466', bar: '#ffd23f', acc: '#ffd23f', frame: '#2c2c2c', font: 'sans-serif' },
  warm: { bg: '#1a1712', bgN: '#0c0a08', fg: '#f6efe0', dim: '#a89c84', bar: '#e8d9b5', acc: '#e8a33d', frame: '#332c22', font: 'sans-serif' },
};
const aspectCol = (a: string) => /halt(?! erwarten)/i.test(a) && !/erwarten/i.test(a) ? '#ff3b30' : /^fahrt$/i.test(a.trim()) ? '#35d06a' : '#ffcc00';
function niceMax(v: number) { return v > 200 ? Math.ceil((v * 1.07) / 50) * 50 : Math.ceil((v * 1.1) / 20) * 20; }
const blinkOn = (s: CabState) => Math.floor(s.time * 2.5) % 2 === 0;
function fmtDist(d: number | null): string {
  if (d === null || !isFinite(d)) return '–';
  return d >= 1000 ? (d / 1000).toFixed(1).replace('.', ',') + ' km' : Math.round(d / 10) * 10 + ' m';
}
function chip(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, txt: string, on: boolean, col: string, k: number) {
  g.fillStyle = on ? col : '#1d232a'; g.fillRect(x, y, w, h);
  g.fillStyle = on ? '#0b0b0b' : '#56616c'; g.font = `bold ${13 * k}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt, x + w / 2, y + h / 2 + 1);
}
function drawDrive(g: CanvasRenderingContext2D, W: number, H: number, s: CabState, th: Theme) {
  const T = THEME[th], k = W / 512;
  g.fillStyle = s.night ? T.bgN : T.bg; g.fillRect(0, 0, W, H);
  if (th === 'neon') { g.shadowColor = T.bar; g.shadowBlur = 8 * k; }
  g.textBaseline = 'middle';
  // Kopfzeile: Signalbegriff + Uhr
  g.font = `bold ${20 * k}px ${T.font}`; g.textAlign = 'left'; g.fillStyle = aspectCol(aspectDe(s.aspect));
  g.fillText(aspectDe(s.aspect), 46 * k, 18 * k);
  g.textAlign = 'right'; g.fillStyle = T.fg; g.fillText(s.clock, 500 * k, 18 * k);
  // Geschwindigkeit
  g.font = `bold ${78 * k}px ${T.font}`; g.textAlign = 'right';
  g.fillStyle = s.kmh > s.limit + 3 ? '#ff5a4e' : T.fg;
  g.fillText(String(Math.round(Math.abs(s.kmh))), 270 * k, 80 * k);
  g.font = `${18 * k}px ${T.font}`; g.textAlign = 'left'; g.fillStyle = T.dim; g.fillText('km/h', 276 * k, 98 * k);
  // zulässige Geschwindigkeit als Kreisschild (generisch)
  g.fillStyle = '#f4f4f0'; g.beginPath(); g.arc(380 * k, 74 * k, 30 * k, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d0242a'; g.lineWidth = 7 * k; g.beginPath(); g.arc(380 * k, 74 * k, 27 * k, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#111'; g.font = `bold ${(s.limit >= 100 ? 21 : 26) * k}px ${T.font}`; g.textAlign = 'center'; g.fillText(String(Math.round(s.limit)), 380 * k, 75 * k);
  if (s.target !== null) {
    g.fillStyle = '#ffcc00'; g.font = `bold ${17 * k}px ${T.font}`;
    g.fillText(`Ziel ${Math.round(s.target)}`, 380 * k, 122 * k);
  }
  // Geschwindigkeitsbalken
  const vm = niceMax(Math.max(40, s.vmax)), bx = 46 * k, bw = 400 * k, by = 140 * k, bh = 22 * k;
  const X = (v: number) => bx + bw * Math.min(1, Math.max(0, v / vm));
  g.fillStyle = T.frame; g.fillRect(bx, by, bw, bh);
  g.fillStyle = s.kmh > s.limit + 3 ? '#ff5a4e' : T.bar; g.fillRect(bx, by, X(Math.abs(s.kmh)) - bx, bh);
  g.fillStyle = 'rgba(208,36,42,0.35)'; g.fillRect(X(s.limit), by, bx + bw - X(s.limit), bh);
  g.fillStyle = '#ff3b30'; g.beginPath(); g.moveTo(X(s.limit), by - 2 * k); g.lineTo(X(s.limit) - 8 * k, by - 14 * k); g.lineTo(X(s.limit) + 8 * k, by - 14 * k); g.fill();
  if (s.target !== null) { g.fillStyle = '#ffcc00'; g.beginPath(); g.moveTo(X(s.target), by + bh + 2 * k); g.lineTo(X(s.target) - 8 * k, by + bh + 14 * k); g.lineTo(X(s.target) + 8 * k, by + bh + 14 * k); g.fill(); }
  g.fillStyle = T.dim; g.font = `${12 * k}px ${T.font}`; g.textAlign = 'center';
  const step = vm > 200 ? 50 : vm > 100 ? 20 : 10;
  for (let v = 0; v <= vm; v += step) { g.fillRect(X(v) - 0.5, by + bh, 1.5 * k, 5 * k); if (v % (step * 2) === 0) g.fillText(String(v), X(v), by + bh + 22 * k); }
  // Zielentfernung (links)
  const tx = 12 * k, ty = 36 * k, tw = 20 * k, thh = 150 * k;
  g.fillStyle = T.frame; g.fillRect(tx, ty, tw, thh);
  if (s.targetDist !== null && s.target !== null) {
    const f = Math.min(1, Math.log10(1 + Math.max(0, s.targetDist)) / Math.log10(4001));
    g.fillStyle = '#ffcc00'; g.fillRect(tx, ty + thh * (1 - f), tw, thh * f);
  }
  g.fillStyle = T.dim; g.font = `${11 * k}px ${T.font}`; g.textAlign = 'center'; g.fillText(s.targetDist !== null && s.target !== null ? fmtDist(s.targetDist) : '', tx + tw / 2 + 8 * k, ty + thh + 12 * k);
  // Zug-/Bremskraft (rechts)
  const px = 480 * k, py = 36 * k, pw = 20 * k, ph = 150 * k, mid = py + ph / 2;
  g.fillStyle = T.frame; g.fillRect(px, py, pw, ph);
  const p = Math.max(-1, Math.min(1, s.power));
  g.fillStyle = p >= 0 ? '#35d06a' : '#ffcc00';
  if (p >= 0) g.fillRect(px, mid - (ph / 2) * p, pw, (ph / 2) * p); else g.fillRect(px, mid, pw, (ph / 2) * -p);
  g.fillStyle = T.fg; g.fillRect(px - 3 * k, mid - 1, pw + 6 * k, 2);
  g.font = `${11 * k}px ${T.font}`; g.textAlign = 'center'; g.fillStyle = T.dim; g.fillText(`${Math.round(p * 100)} %`, px + pw / 2 - 6 * k, py + ph + 12 * k);
  // Fußzeile: nächster Halt + Statusfelder
  g.shadowBlur = 0;
  g.textAlign = 'left'; g.fillStyle = T.fg; g.font = `bold ${16 * k}px ${T.font}`;
  g.fillText(s.nextStop ? `Nächster Halt: ${s.nextStop}` : 'Kein Halt geplant', 46 * k, 212 * k);
  g.fillStyle = T.dim; g.font = `${15 * k}px ${T.font}`; g.textAlign = 'right';
  g.fillText(s.nextStop ? fmtDist(s.nextStopDist) : '', 470 * k, 212 * k);
  const cw = 54 * k, ch = 20 * k, cy = 230 * k;
  let cx = 46 * k;
  const bl = blinkOn(s);
  const items: [string, boolean, string][] = [
    ['PZB', s.pzb.monitor, '#3a7bff'], ['1000Hz', s.pzb.warn && bl, '#ffcc00'], ['500Hz', s.pzb.brake, '#ff3b30'],
    ['Zw.-Br.', s.forced, '#ff3b30'], ['Sifa', s.sifaWarn, '#ffcc00'], ['Türen', s.releaseL || s.releaseR, '#35d06a'], ['Schleud.', s.slip, '#ff8a1f'],
  ];
  for (const [t, on, c] of items) { chip(g, cx, cy, cw, ch, t, on, c, k); cx += cw + 4 * k; }
}
function drawInfo(g: CanvasRenderingContext2D, W: number, H: number, s: CabState, th: Theme, diesel: boolean) {
  const T = THEME[th], k = W / 512;
  g.fillStyle = s.night ? T.bgN : T.bg; g.fillRect(0, 0, W, H);
  g.textBaseline = 'middle';
  g.fillStyle = T.acc; g.fillRect(0, 0, W, 30 * k);
  g.fillStyle = '#0b0b0b'; g.font = `bold ${17 * k}px ${T.font}`; g.textAlign = 'left'; g.fillText('Zugdaten', 12 * k, 15 * k);
  g.textAlign = 'right'; g.fillText(s.clock, 500 * k, 15 * k);
  const row = (i: number, a: string, b: string) => {
    const y = (52 + i * 26) * k;
    g.textAlign = 'left'; g.fillStyle = T.dim; g.font = `${15 * k}px ${T.font}`; g.fillText(a, 12 * k, y);
    g.textAlign = 'right'; g.fillStyle = T.fg; g.font = `bold ${16 * k}px ${T.font}`; g.fillText(b, 270 * k, y);
  };
  row(0, 'Nächster Halt', s.nextStop || '–');
  row(1, 'Entfernung', fmtDist(s.nextStopDist));
  row(2, 'Neigung', `${s.gradient > 0 ? '+' : ''}${Math.round(s.gradient)} ‰`);
  row(3, 'Signal', aspectDe(s.aspect));
  if (diesel) { row(4, 'Motor', `${Math.round(s.engineRpm)} U/min`); row(5, 'Kraftstoff', `${Math.round(s.fuel * 100)} %`); }
  else { row(4, 'Stromabnehmer', s.panto > 0.95 ? 'gehoben' : s.panto > 0.05 ? 'bewegt' : 'gesenkt'); row(5, 'Hauptschalter', s.mainSwitch ? 'ein' : 'aus'); }
  row(6, 'Türen', s.releaseL || s.releaseR ? `frei ${s.releaseL ? 'L' : ''}${s.releaseR ? 'R' : ''}` : 'gesperrt');
  const bar = (i: number, lab: string, v: number, max: number, col: string) => {
    const x = (300 + i * 70) * k, y0 = 48 * k, h = 150 * k, w = 26 * k;
    g.fillStyle = T.frame; g.fillRect(x, y0, w, h);
    const f = Math.max(0, Math.min(1, v / max));
    g.fillStyle = col; g.fillRect(x, y0 + h * (1 - f), w, h * f);
    g.fillStyle = T.fg; g.font = `bold ${14 * k}px ${T.font}`; g.textAlign = 'center';
    g.fillText(lab, x + w / 2, y0 + h + 16 * k);
    g.fillStyle = T.dim; g.font = `${13 * k}px ${T.font}`; g.fillText(v.toFixed(1).replace('.', ','), x + w / 2, y0 + h + 34 * k);
  };
  bar(0, 'HL', s.pipe, 10, '#3aa0ff'); bar(1, 'HB', s.mainRes, 10, '#35d06a'); bar(2, 'C', s.cyl * 3.8, 6, '#ff5a4e');
}

// ------------------------------------------------------------------ Geometrie der Führerräume (abgestimmt auf vehicles.ts)
interface LG { floor: number; eye: [number, number, number]; hw: number; roof: number; back: number; gb: V2; gt: V2; win: [number, number, number, number]; wall: number; trim: number; desk: number; panel: number; floorC: number }
const LGS: Record<CabLayout, LG> = {
  hst: { floor: 1.95, eye: [-4.75, 3.15, 0], hw: 1.3, roof: 3.78, back: -6.5, gb: [-2.15, 2.55], gt: [-4.25, 3.58], win: [-6.1, -4.65, 2.6, 3.45], wall: 0xdadde0, trim: 0x9aa0a6, desk: 0xc9cdd2, panel: 0x262a30, floorC: 0x3a3e44 },
  dosto: { floor: 2.0, eye: [-1.95, 3.25, 0], hw: 1.26, roof: 4.05, back: -3.9, gb: [-0.42, 2.62], gt: [-1.35, 3.95], win: [-3.4, -2.25, 2.75, 3.6], wall: 0xd8d6cf, trim: 0x8c8a82, desk: 0x4a4f57, panel: 0x22262b, floorC: 0x403d38 },
  sbahn: { floor: 1.95, eye: [-1.95, 3.1, 0], hw: 1.3, roof: 3.8, back: -3.8, gb: [-0.38, 2.35], gt: [-1.45, 3.72], win: [-3.3, -2.15, 2.6, 3.45], wall: 0xe2e2df, trim: 0xc8102e, desk: 0x5b5f66, panel: 0x2a2d32, floorC: 0x35383c },
  dmu: { floor: 1.85, eye: [-2.05, 3.05, 0], hw: 1.3, roof: 3.8, back: -3.6, gb: [-0.42, 2.35], gt: [-1.5, 3.78], win: [-3.2, -2.25, 2.45, 3.2], wall: 0xd9d4c4, trim: 0x2b8a3e, desk: 0x56604f, panel: 0x262b24, floorC: 0x3b3a33 },
  eloco: { floor: 1.8, eye: [-2.35, 3.05, 0.42], hw: 1.36, roof: 3.85, back: -4.0, gb: [-0.62, 2.5], gt: [-1.95, 3.85], win: [-3.0, -2.4, 2.6, 3.4], wall: 0xb9c2b6, trim: 0x6f786c, desk: 0x5d6b62, panel: 0x2e3632, floorC: 0x343a36 },
  dloco: { floor: 1.95, eye: [-2.95, 3.28, 0.42], hw: 1.3, roof: 4.12, back: -5.15, gb: [-2.05, 2.95], gt: [-2.1, 3.95], win: [-4.6, -3.05, 2.95, 3.85], wall: 0xa8b0a4, trim: 0x55604f, desk: 0x485448, panel: 0x262c26, floorC: 0x2f332e },
  steam: { floor: 1.95, eye: [-11.35, 3.2, 0.9], hw: 1.32, roof: 4.1, back: -13.5, gb: [-10.45, 3.15], gt: [-10.45, 3.85], win: [-12.6, -11.8, 2.85, 3.7], wall: 0x2a211a, trim: 0x4a3626, desk: 0x1a1a1a, panel: 0x111111, floorC: 0x3b2a1b },
  shunter: { floor: 1.5, eye: [-4.6, 3.05, 0.15], hw: 1.28, roof: 3.85, back: -6.2, gb: [-3.68, 2.7], gt: [-3.7, 3.7], win: [-5.75, -4.05, 2.65, 3.6], wall: 0xc8c2b4, trim: 0xe06b00, desk: 0x5b5246, panel: 0x2b2722, floorC: 0x33302a },
  neon: { floor: 1.85, eye: [-2.85, 3.05, 0], hw: 1.26, roof: 3.82, back: -4.6, gb: [-0.55, 2.45], gt: [-2.4, 3.8], win: [-4.2, -3.1, 2.3, 3.3], wall: 0x15172a, trim: 0x19f0ff, desk: 0x0c0d18, panel: 0x05060c, floorC: 0x0b0c16 },
  rack: { floor: 1.75, eye: [-1.75, 2.95, 0], hw: 1.3, roof: 3.8, back: -3.2, gb: [-0.35, 2.1], gt: [-0.92, 3.75], win: [-2.8, -1.95, 2.0, 3.4], wall: 0xe6e1d0, trim: 0x1d3557, desk: 0x1d3557, panel: 0x16202e, floorC: 0x3a3a36 },
  tram: { floor: 0.95, eye: [-1.8, 2.4, 0], hw: 1.06, roof: 3.15, back: -2.9, gb: [-0.22, 1.25], gt: [-1.1, 2.98], win: [-2.6, -1.95, 1.25, 2.8], wall: 0xdedbd2, trim: 0x2a2a2a, desk: 0x2f3134, panel: 0x1d1f21, floorC: 0x2b2b2b },
};

const LBL: Partial<Record<CabControlId, string>> = {
  throttle: 'Fahrschalter', brake: 'Führerbremsventil', dyn: 'E-Bremse', combined: 'Fahr-/Bremshebel', reverser: 'Richtungswender', cutoff: 'Steuerung',
  emergency: 'Notbremse', horn: 'Makrofon', sand: 'Sanden', panto: 'Stromabnehmer', mainSwitch: 'Hauptschalter', engine: 'Motor Start/Stopp',
  lights: 'Spitzenlicht', cabLight: 'Führerraumlicht', wipers: 'Scheibenwischer', doorsL: 'Türen links', doorsR: 'Türen rechts', doorsClose: 'Türen schließen',
  parking: 'Federspeicher', sifa: 'Sifa', pzbAck: 'PZB Wachsam', injector: 'Injektor', firing: 'Feuertür', battery: 'Batterie',
};

const Y = 0xffc400, R = 0xff2a1f, G = 0x2bd95c, B = 0x2f7bff, O = 0xff8a1f, W = 0xf2f2e6;

interface Scr { tex: THREE.CanvasTexture | null; g: CanvasRenderingContext2D | null; W: number; H: number; draw: (g: CanvasRenderingContext2D, W: number, H: number, s: CabState) => void; sig: Fn<string>; last: string }

/** Werkzeugkasten zum Aufbau eines Führerstands */
class Kit {
  g = new THREE.Group();
  controls: CabControl[] = [];
  ups: ((s: CabState) => void)[] = [];
  screens: Scr[] = [];
  owned: { dispose(): void }[] = [];
  stat = new Map<THREE.Material, THREE.BufferGeometry[]>();
  seg: number; segS: number;
  wipers: { o: THREE.Object3D; park: number; dir: number }[] = [];
  wPhase = 0;
  lamp!: THREE.Mesh; light: THREE.PointLight | null = null;
  constructor(readonly q: Q, readonly L: LG, readonly layout: CabLayout) {
    this.seg = q === 'low' ? 8 : q === 'medium' ? 12 : 18;
    this.segS = q === 'low' ? 6 : q === 'medium' ? 8 : 12;
  }
  M(c: number, rough = 0.6, metal = 0.1) { return mat(this.q, `c|${c}|${rough}|${metal}`, { color: c, rough, metal }); }
  lit(c: number, on: boolean) {
    return on ? mat(this.q, `on|${c}`, { color: c, emissive: c, ei: 2.2, rough: 0.3 }) : mat(this.q, `off|${c}`, { color: shade(c, 0.28), rough: 0.35, metal: 0.1 });
  }
  get dark() { return this.M(0x1b1d20, 0.6, 0.2); }
  get chrome() { return this.M(0xb9bec4, 0.25, 0.85); }
  /** statische Geometrie in Führerraum-Koordinaten (wird verschmolzen) */
  add(m: THREE.Material, g: THREE.BufferGeometry) { let a = this.stat.get(m); if (!a) this.stat.set(m, (a = [])); a.push(g.index ? g.toNonIndexed() : g); if (g.index) g.dispose(); }
  box(m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    this.add(m, new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  }
  beam(m: THREE.Material, a: V2, b: V2, z: number, t = 0.08, d = 0.08) {
    const g = new THREE.BoxGeometry(Math.hypot(b[0] - a[0], b[1] - a[1]), t, d);
    g.rotateZ(Math.atan2(b[1] - a[1], b[0] - a[0])); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z);
    this.add(m, g);
  }
  flush() {
    for (const [m, arr] of this.stat) {
      let g: THREE.BufferGeometry;
      if (arr.length === 1) g = arr[0];
      else {
        g = new THREE.BufferGeometry();
        for (const name of ['position', 'normal', 'uv'] as const) {
          let n = 0; for (const a of arr) n += a.getAttribute(name).array.length;
          const out = new Float32Array(n); let o = 0;
          const isz = arr[0].getAttribute(name).itemSize;
          for (const a of arr) { out.set(a.getAttribute(name).array as Float32Array, o); o += a.getAttribute(name).array.length; }
          g.setAttribute(name, new THREE.BufferAttribute(out, isz));
        }
        for (const a of arr) a.dispose();
      }
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, m); mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      this.g.add(mesh); this.owned.push(g);
    }
    this.stat.clear();
  }
  mesh(parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1): THREE.Mesh {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); parent.add(o); return o;
  }
  /** Pultfläche: lokale x = vom Tf weg (hangaufwärts), y = Flächennormale, z = rechts */
  pan(parent: THREE.Object3D, x: number, y: number, z: number, tilt: number, yaw = 0): THREE.Group {
    const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.set(0, yaw, tilt, 'YXZ'); parent.add(o); return o;
  }
  /** Pultblock (Seitenprofil extrudiert) – liefert die Pultfläche als Panel */
  desk(xr: number, yr: number, xf: number, yf: number, z0: number, z1: number, c: number, y0 = this.L.floor): THREE.Group {
    const sh = new THREE.Shape();
    sh.moveTo(xr, y0); sh.lineTo(xf, y0); sh.lineTo(xf, yf); sh.lineTo(xr, yr); sh.lineTo(xr - 0.035, yr - 0.03); sh.lineTo(xr - 0.035, y0 + 0.12); sh.lineTo(xr, y0 + 0.12); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, z0);
    this.add(this.M(c, 0.7, 0.15), g);
    return this.pan(this.g, xr, yr + 0.002, (z0 + z1) / 2, Math.atan2(yf - yr, xf - xr));
  }
  tag(o: THREE.Object3D, id: CabControlId, kind: CabControl['kind'], label?: string) {
    o.traverse((c) => { c.userData.ctl = id; });
    o.userData.ctl = id;
    this.controls.push({ id, obj: o, kind, label: label ?? LBL[id] ?? id });
  }
  label(p: THREE.Object3D, text: string, u: number, v: number, w = 0.1) {
    const t = labelTex(text);
    const m = mat(this.q, 'lbl|' + text, { color: t ? 0xffffff : 0x16181b, map: t, basic: true });
    this.mesh(p, faceG(), m, u, 0.004, v, w * 48 / 256 * 1.0, 1, w);
  }
  // ---------- Bedienelemente
  button(p: THREE.Object3D, id: CabControlId | null, u: number, v: number, c: number, litFn?: Fn<boolean>, label?: string | null, r = 0.022): THREE.Group {
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    this.mesh(o, cylG(this.segS), this.dark, 0, 0.006, 0, r * 2 + 0.016, 0.012, r * 2 + 0.016);
    const cap = this.mesh(o, cylG(this.segS), this.lit(c, false), 0, 0.016, 0, r * 2, 0.02, r * 2);
    if (litFn) { const on = this.lit(c, true), off = this.lit(c, false); this.ups.push((s) => { cap.material = litFn(s) ? on : off; }); }
    if (id) this.tag(o, id, 'button', label ?? undefined);
    const lt = label === null ? null : label ?? (id ? LBL[id] : null);
    if (lt) this.label(p, lt, u - r - 0.022, v, Math.max(0.07, r * 4.2));
    return o;
  }
  lampI(p: THREE.Object3D, u: number, v: number, c: number, fn: Fn<boolean>, label?: string) {
    const on = this.lit(c, true), off = this.lit(c, false);
    this.mesh(p, cylG(this.segS), this.dark, u, 0.004, v, 0.036, 0.008, 0.036);
    const m = this.mesh(p, cylG(this.segS), off, u, 0.01, v, 0.026, 0.01, 0.026);
    this.ups.push((s) => { m.material = fn(s) ? on : off; });
    if (label) this.label(p, label, u - 0.032, v, 0.07);
  }
  lampRow(p: THREE.Object3D, u: number, v0: number, dv: number, list: [string, number, Fn<boolean>][]) {
    list.forEach(([t, c, f], i) => this.lampI(p, u, v0 + i * dv, c, f, t));
  }
  mushroom(p: THREE.Object3D, u: number, v: number, r = 0.035) {
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    this.mesh(o, cylG(this.seg), this.M(0xf2c200, 0.5), 0, 0.012, 0, r * 2 + 0.03, 0.024, r * 2 + 0.03);
    const cap = this.mesh(o, sphG(this.seg), this.M(0xd0242a, 0.4), 0, 0.04, 0, r * 2, r * 1.1, r * 2);
    this.ups.push((s) => { cap.position.y = s.emergency ? 0.026 : 0.042; });
    this.tag(o, 'emergency', 'button');
    this.label(p, 'Notbremse', u - r - 0.03, v, 0.09);
    return o;
  }
  toggle(p: THREE.Object3D, id: CabControlId, u: number, v: number, fn: Fn<boolean>, label?: string) {
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    this.mesh(o, boxG(), this.dark, 0, 0.008, 0, 0.04, 0.016, 0.03);
    const piv = new THREE.Group(); piv.position.y = 0.016; o.add(piv);
    this.mesh(piv, cylG(6), this.chrome, 0, 0.024, 0, 0.01, 0.048, 0.01);
    this.mesh(piv, sphG(8), this.chrome, 0, 0.05, 0, 0.016, 0.016, 0.016);
    this.ups.push((s) => { piv.rotation.z = fn(s) ? -0.5 : 0.5; });
    this.tag(o, id, 'toggle', label);
    this.label(p, label ?? LBL[id] ?? id, u - 0.045, v, 0.09);
    return o;
  }
  rotary(p: THREE.Object3D, id: CabControlId, u: number, v: number, fn: Fn<number>, r = 0.025, c = 0x2a2d31, label?: string) {
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    this.mesh(o, cylG(this.seg), this.M(0x3a3d42, 0.5, 0.3), 0, 0.005, 0, r * 2.6, 0.01, r * 2.6);
    const k = new THREE.Group(); k.position.y = 0.01; o.add(k);
    this.mesh(k, cylG(this.seg), this.M(c, 0.45, 0.2), 0, 0.016, 0, r * 2, 0.032, r * 2);
    this.mesh(k, boxG(), this.M(0xf0f0ea, 0.5), r * 0.55, 0.034, 0, r * 0.9, 0.006, 0.008);
    this.ups.push((s) => { k.rotation.y = -fn(s); });
    this.tag(o, id, 'rotary', label);
    this.label(p, label ?? LBL[id] ?? id, u - r * 1.4 - 0.022, v, 0.1);
    return o;
  }
  /** Hebel: Arm entlang Flächennormale, Drehung um lokale z (vor/zurück) – oder 'swing' in der Fläche (Drehung um y) */
  lever(p: THREE.Object3D, id: CabControlId, u: number, v: number, fn: Fn<number>, o2: { len?: number; style?: 'ball' | 'T' | 'stick' | 'swing' | 'notch' | 'red'; c?: number; label?: string; quad?: number } = {}) {
    const len = o2.len ?? 0.16, st = o2.style ?? 'ball', c = o2.c ?? 0x1b1b1b;
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    const piv = new THREE.Group(); o.add(piv);
    if (st === 'swing') {
      this.mesh(o, cylG(this.seg), this.M(0x55595f, 0.4, 0.6), 0, 0.03, 0, 0.09, 0.06, 0.09);
      piv.position.y = 0.065;
      this.mesh(piv, boxG(), this.M(0x6e7278, 0.35, 0.7), -len / 2, 0, 0, len, 0.022, 0.03);
      this.mesh(piv, cylG(this.segS), this.M(c, 0.5), -len, 0.035, 0, 0.034, 0.08, 0.034);
      this.ups.push((s) => { piv.rotation.y = fn(s); });
    } else {
      this.mesh(o, boxG(), this.M(0x2a2c30, 0.6, 0.3), 0, 0.008, 0, o2.quad ?? 0.16, 0.016, 0.05);
      if (st === 'notch' && o2.quad) {
        const n = 10;
        for (let i = 0; i <= n; i++) this.mesh(o, boxG(), this.M(0xd8d8d0, 0.5), -o2.quad / 2 + (o2.quad * i) / n, 0.017, 0.03, 0.003, 0.003, 0.012);
      }
      this.mesh(piv, cylG(this.segS), this.M(0x6e7278, 0.35, 0.7), 0, len / 2, 0, 0.022, len, 0.022);
      if (st === 'ball' || st === 'notch' || st === 'red') this.mesh(piv, sphG(this.seg), this.M(st === 'red' ? 0xc8202a : c, 0.35), 0, len, 0, 0.055, 0.055, 0.055);
      else if (st === 'T') this.mesh(piv, boxG(), this.M(c, 0.45), 0, len, 0, 0.035, 0.035, 0.17);
      else this.mesh(piv, cylG(this.seg), this.M(c, 0.6), 0, len + 0.05, 0, 0.045, 0.12, 0.045);
      this.ups.push((s) => { piv.rotation.z = fn(s); });
    }
    this.tag(o, id, 'lever', o2.label);
    this.label(p, o2.label ?? LBL[id] ?? id, u - 0.1, v, 0.12);
    return o;
  }
  handwheel(p: THREE.Object3D, id: CabControlId, u: number, v: number, r: number, fn: Fn<number>, c = 0x1b1b1b, label?: string) {
    const o = new THREE.Group(); o.position.set(u, 0, v); p.add(o);
    this.mesh(o, cylG(this.seg), this.M(0x55595f, 0.4, 0.6), 0, 0.03, 0, 0.06, 0.06, 0.06);
    const w = new THREE.Group(); w.position.y = 0.06; o.add(w);
    this.mesh(w, torG(this.q === 'low' ? 12 : 24), this.M(c, 0.4, 0.3), 0, 0, 0, r * 2, r * 2, r * 2);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const sp = this.mesh(w, boxG(), this.M(0x6e7278, 0.35, 0.7), Math.cos(a) * r / 2, 0, Math.sin(a) * r / 2, r, 0.012, 0.012); sp.rotation.y = -a; }
    this.mesh(w, cylG(this.segS), this.M(c, 0.4), r, 0.04, 0, 0.022, 0.08, 0.022);
    this.ups.push((s) => { w.rotation.y = -fn(s); });
    this.tag(o, id, 'rotary', label);
    this.label(p, label ?? LBL[id] ?? id, u - r - 0.03, v, 0.12);
    return o;
  }
  gauge(p: THREE.Object3D, u: number, v: number, r: number, d: Dial, needles: [Fn<number>, number][], tilt = 0, face = '#101214') {
    const o = new THREE.Group(); o.position.set(u, 0.002, v); o.rotation.z = tilt; p.add(o);
    this.mesh(o, cylG(this.seg + 6), this.M(0x2a2c30, 0.4, 0.6), 0, 0.008, 0, r * 2 + 0.02, 0.016, r * 2 + 0.02);
    const t = dialTex(d, face);
    const fm = mat(this.q, `dial|${d.title}|${d.unit}|${d.max}|${d.min}|${face}`, { color: t ? 0xffffff : 0x101214, map: t, emissive: 0xffffff, ei: t ? 0.35 : 0, emap: true, rough: 0.5 });
    this.mesh(o, circG(this.seg + 10), fm, 0, 0.0175, 0, r * 2, 1, r * 2);
    for (const [fn, col] of needles) {
      const n = new THREE.Group(); n.position.y = 0.02; o.add(n);
      this.mesh(n, boxG(), this.M(col, 0.4), r * 0.38, 0.002 + needles.indexOf(needles.find((x) => x[1] === col)!) * 0.002, 0, r * 0.95, 0.002, Math.max(0.004, r * 0.06));
      this.mesh(n, cylG(8), this.M(0x222222, 0.4, 0.6), 0, 0.004, 0, r * 0.16, 0.006, r * 0.16);
      this.ups.push((s) => {
        const val = Math.max(d.min, Math.min(d.max, fn(s)));
        n.rotation.y = -((-135 + 270 * (val - d.min) / (d.max - d.min)) * Math.PI / 180);
      });
    }
    return o;
  }
  screen(p: THREE.Object3D, u: number, v: number, w: number, h: number, tilt: number, draw: Scr['draw'], sig: Fn<string>) {
    const o = new THREE.Group(); o.position.set(u, 0.002, v); o.rotation.z = tilt; p.add(o);
    this.mesh(o, boxG(), this.M(0x121418, 0.5, 0.3), 0, -0.01, 0, h + 0.03, 0.03, w + 0.03);
    const Wp = this.q === 'low' ? 256 : 512, Hp = Wp / 2;
    const c = makeCanvas(Wp, Hp);
    let tex: THREE.CanvasTexture | null = null;
    if (c) { tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; this.owned.push(tex); }
    const m = new THREE.MeshBasicMaterial({ color: tex ? 0xffffff : 0x0d1620, map: tex });
    this.owned.push(m);
    this.mesh(o, faceG(), m, 0, 0.006, 0, h, 1, w);
    this.screens.push({ tex, g: c ? c.getContext('2d') : null, W: Wp, H: Hp, draw, sig, last: '' });
    return o;
  }
  /** Bildschirm, stehend auf der Pultfläche; neigung = Winkel gegen die Senkrechte */
  screenStand(x: number, y: number, z: number, w: number, h: number, lean: number, draw: Scr['draw'], sig: Fn<string>, yaw = 0) {
    const p = this.pan(this.g, x, y, z, Math.PI / 2 - lean, yaw);
    return this.screen(p, h / 2, 0, w, h, 0, draw, sig);
  }
  seat(x: number, z: number, c: number) {
    const f = this.L.floor, m = this.M(c, 0.85, 0), d = this.dark;
    this.box(d, x - 0.06, x + 0.06, f, f + 0.42, z - 0.06, z + 0.06);
    this.box(m, x - 0.25, x + 0.25, f + 0.42, f + 0.52, z - 0.25, z + 0.25);
    this.box(m, x - 0.36, x - 0.26, f + 0.5, f + 1.15, z - 0.24, z + 0.24);
    this.box(d, x - 0.15, x + 0.15, f + 0.53, f + 0.58, z - 0.32, z - 0.27);
    this.box(d, x - 0.15, x + 0.15, f + 0.53, f + 0.58, z + 0.27, z + 0.32);
  }
  pedal(id: CabControlId, x: number, z: number, fn: Fn<boolean> | null, c = 0x2a2c30, label?: string) {
    const o = new THREE.Group(); o.position.set(x, this.L.floor, z); this.g.add(o);
    const piv = new THREE.Group(); piv.position.set(-0.08, 0.02, 0); o.add(piv);
    this.mesh(piv, boxG(), this.M(c, 0.6, 0.3), 0.1, 0.04, 0, 0.24, 0.025, 0.12);
    this.mesh(o, boxG(), this.dark, -0.08, 0.02, 0, 0.05, 0.04, 0.14);
    const rest = 0.35;
    this.ups.push(fn ? (s) => { piv.rotation.z = fn(s) ? 0.12 : rest; } : () => { piv.rotation.z = rest; });
    this.tag(o, id, 'button', label);
    return o;
  }
  // ---------- Hülle (Boden, Wände, Decke, Frontscheibe, Wischer, Sitz, Licht)
  shell(opts: { centerPost?: boolean; wipers?: number[]; seat?: number; steam?: boolean } = {}) {
    const L = this.L, f = L.floor, hw = L.hw;
    const wall = mat(this.q, `wall|${L.wall}`, { color: L.wall, rough: 0.8, side: THREE.DoubleSide });
    const trim = this.M(L.trim, 0.5, 0.2);
    const glass = mat(this.q, 'glass', { color: 0x9fc6d8, transparent: true, opacity: 0.12, rough: 0.05, metal: 0.4, side: THREE.DoubleSide, depthWrite: false });
    const gb = L.gb, gt = L.gt, xFront = Math.max(gb[0], gt[0]);
    this.box(this.M(L.floorC, 0.9), L.back, xFront, f - 0.05, f, -hw, hw);
    this.box(this.M(L.wall, 0.8), L.back, Math.min(gt[0], xFront) + 0.02, L.roof, L.roof + 0.04, -hw, hw);
    this.box(this.M(shade(L.wall, 0.8), 0.8), L.back - 0.04, L.back, f, L.roof, -hw, hw);
    this.box(this.M(shade(L.wall, 0.6), 0.7), L.back + 0.001, L.back + 0.02, f, f + 1.95, -hw + 0.25, -hw + 0.95);
    this.box(this.chrome, L.back + 0.02, L.back + 0.05, f + 1.0, f + 1.03, -hw + 0.82, -hw + 0.92);
    // Seitenwände mit Fensterausschnitt
    const sh = new THREE.Shape();
    if (opts.steam) { sh.moveTo(L.back, f); sh.lineTo(gb[0], f); sh.lineTo(gb[0], L.roof); sh.lineTo(L.back, L.roof); }
    else { sh.moveTo(L.back, f); sh.lineTo(gb[0], f); sh.lineTo(gb[0], gb[1]); sh.lineTo(gt[0], gt[1]); sh.lineTo(gt[0], L.roof); sh.lineTo(L.back, L.roof); }
    sh.closePath();
    const [wx0, wx1, wy0, wy1] = L.win;
    const hole = new THREE.Path(); hole.moveTo(wx0, wy0); hole.lineTo(wx1, wy0); hole.lineTo(wx1, wy1); hole.lineTo(wx0, wy1); hole.closePath();
    sh.holes.push(hole);
    for (const s of [1, -1]) {
      const g = new THREE.ShapeGeometry(sh, 1); g.translate(0, 0, s * hw); this.add(wall, g);
      const gg = new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0); gg.translate((wx0 + wx1) / 2, (wy0 + wy1) / 2, s * (hw + 0.02)); this.add(glass, gg);
      this.box(trim, wx0, wx1, wy0 - 0.04, wy0, s * (hw - 0.06), s * hw);
      this.box(trim, L.back, xFront, f + 0.9, f + 0.95, s * (hw - 0.03), s * hw);
    }
    if (opts.steam) return;
    // Frontscheibe + Rahmen
    const gz = hw - 0.04;
    const qg = new THREE.BufferGeometry();
    qg.setAttribute('position', new THREE.Float32BufferAttribute([gb[0], gb[1], -gz, gb[0], gb[1], gz, gt[0], gt[1], gz, gb[0], gb[1], -gz, gt[0], gt[1], gz, gt[0], gt[1], -gz], 3));
    const nx = gt[1] - gb[1], ny = -(gt[0] - gb[0]), nl = Math.hypot(nx, ny) || 1;
    qg.setAttribute('normal', new THREE.Float32BufferAttribute(Array(6).fill(0).flatMap(() => [-nx / nl, ny / nl, 0]), 3));
    qg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    this.add(glass, qg);
    const frame = this.M(shade(L.trim, 0.6), 0.5, 0.2);
    for (const s of [1, -1]) this.beam(frame, gb, gt, s * (hw - 0.05), 0.09, 0.1);
    this.box(frame, gb[0] - 0.08, gb[0] + 0.02, gb[1] - 0.06, gb[1], -hw, hw);
    if (gt[1] < L.roof) this.box(this.M(L.wall, 0.8), gt[0] - 0.12, gt[0] + 0.04, gt[1], L.roof, -hw, hw);
    this.box(this.M(shade(L.wall, 0.75), 0.8), gb[0], gb[0] + 0.05, f, gb[1], -hw, hw);
    // Sonnenblende
    this.box(this.M(0x2c2f33, 0.6), gt[0] - 0.32, gt[0] - 0.05, gt[1] - 0.04, gt[1] - 0.02, -hw + 0.1, -0.05);
    // Wischer
    const dx = gt[0] - gb[0], dy = gt[1] - gb[1], gl = Math.hypot(dx, dy);
    const ux = dx / gl, uy = dy / gl;
    for (const zw of opts.wipers ?? [-0.45, 0.45]) {
      const o = new THREE.Group();
      o.position.set(gb[0] - 0.035 * uy + 0.03 * ux, gb[1] + 0.035 * ux + 0.03 * uy, zw);
      o.rotation.z = Math.atan2(-ux, uy);
      this.g.add(o);
      const sw = new THREE.Group(); o.add(sw);
      const len = Math.min(0.75, gl * 0.8);
      this.mesh(sw, boxG(), this.dark, 0, len / 2, 0, 0.012, len, 0.014);
      this.mesh(sw, boxG(), this.M(0x0f0f0f, 0.9), 0.004, len * 0.62, 0, 0.012, len * 0.72, 0.022);
      this.mesh(o, cylG(8), this.dark, 0, 0, 0, 0.04, 0.03, 0.04).rotation.z = Math.PI / 2;
      const dir = zw >= 0 ? 1 : -1;
      this.wipers.push({ o: sw, park: dir * 1.45, dir });
      sw.rotation.x = dir * 1.45;
    }
    if (opts.seat !== undefined) this.seat(L.eye[0] - 0.2, L.eye[2], opts.seat);
  }
  ceiling(c = 0xfff4dc) {
    const L = this.L;
    const off = mat(this.q, 'ceil|off', { color: 0xdedbd2, rough: 0.4 }), on = mat(this.q, 'ceil|on', { color: 0xffffff, emissive: c, ei: 1.6, rough: 0.4 });
    const x = (L.back + L.eye[0]) / 2 + 0.3;
    this.lamp = this.mesh(this.g, cylG(this.seg), off, x, L.roof - 0.02, 0, 0.36, 0.035, 0.36);
    if (this.q !== 'low') { this.light = new THREE.PointLight(c, 0, 4.5, 2); this.light.position.set(x, L.roof - 0.15, 0); this.g.add(this.light); }
    this.ups.push((s) => { this.lamp.material = s.cabLight ? on : off; if (this.light) this.light.intensity = s.cabLight ? 2.2 : 0; });
  }
}

// ------------------------------------------------------------------ Gemeinsame Bausteine
const SPEED = (vmax: number, title = 'Geschwindigkeit'): Dial => {
  const max = vmax > 200 ? Math.ceil(vmax * 1.07 / 50) * 50 : Math.ceil(vmax * 1.1 / 20) * 20;
  const major = max > 200 ? 50 : max > 100 ? 20 : 10;
  return { min: 0, max, major, minor: major / 2, unit: 'km/h', title };
};
const BRAKE: Dial = { min: 0, max: 10, major: 2, minor: 0.5, unit: 'bar', title: 'HL · HB' };
const CYL: Dial = { min: 0, max: 6, major: 1, minor: 0.25, unit: 'bar', title: 'Bremszylinder' };
const pzbLamps = (k: Kit, p: THREE.Object3D, u: number, v0: number, dv: number) => k.lampRow(p, u, v0, dv, [
  ['PZB', B, (s) => s.pzb.monitor], ['1000 Hz', Y, (s) => s.pzb.warn && blinkOn(s)], ['500 Hz', R, (s) => s.pzb.brake],
  ['Zw.-Bremsung', R, (s) => s.forced], ['Sifa', Y, (s) => s.sifaWarn],
]);
const stdLamps = (k: Kit, p: THREE.Object3D, u: number, v0: number, dv: number, elec: boolean) => k.lampRow(p, u, v0, dv, [
  ['Türen frei', G, (s) => s.releaseL || s.releaseR], [elec ? 'HS ein' : 'Motor', G, (s) => (elec ? s.mainSwitch : s.engineRpm > 50)], ['Schleudern', O, (s) => s.slip], ['Bremse', W, (s) => s.cyl > 0.05],
]);
const ASP_DE: Record<string, string> = { stop: 'Halt', go: 'Fahrt', slow: 'Langsam', caution: 'Halt erw.', none: '–' };
const aspectDe = (a: string) => ASP_DE[a] ?? (a || '–');
const sigDrive: Fn<string> = (s) => `${Math.round(s.kmh)}|${Math.round(s.limit)}|${s.target}|${s.targetDist === null ? '' : Math.round(s.targetDist / 10)}|${Math.round(s.power * 25)}|${s.aspect}|${s.clock}|${s.nextStop}|${s.nextStopDist === null ? '' : Math.round(s.nextStopDist / 10)}|${+s.pzb.warn}${+s.pzb.monitor}${+s.pzb.brake}${+s.forced}${+s.sifaWarn}${+s.releaseL}${+s.releaseR}${+s.slip}${+s.night}${s.pzb.warn ? +blinkOn(s) : 0}|${Math.round(s.vmax)}`;
const sigInfo: Fn<string> = (s) => `${s.clock}|${s.nextStop}|${s.nextStopDist === null ? '' : Math.round(s.nextStopDist / 10)}|${Math.round(s.gradient)}|${s.aspect}|${Math.round(s.engineRpm / 10)}|${Math.round(s.fuel * 100)}|${Math.round(s.panto * 20)}|${+s.mainSwitch}|${+s.releaseL}${+s.releaseR}|${s.pipe.toFixed(1)}|${s.mainRes.toFixed(1)}|${s.cyl.toFixed(2)}|${+s.night}`;
const drive = (th: Theme) => (g: CanvasRenderingContext2D, W: number, H: number, s: CabState) => drawDrive(g, W, H, s, th);
const info = (th: Theme, diesel: boolean) => (g: CanvasRenderingContext2D, W: number, H: number, s: CabState) => drawInfo(g, W, H, s, th, diesel);
const comb: Fn<number> = (s) => (s.throttle > 0.001 ? s.throttle : -Math.max(s.brake, s.dyn));
const fbv: Fn<number> = (s) => -(-0.25 + 1.5 * Math.min(1, s.emergency ? 1 : s.brake));

/** Tasterfeld in Rasterform; Einträge: [id, Farbe, Leuchtfunktion?, Beschriftung?] */
type BtnDef = [CabControlId, number, Fn<boolean>?, string?];
function grid(k: Kit, p: THREE.Object3D, u0: number, v0: number, du: number, dv: number, cols: number, list: BtnDef[]) {
  list.forEach(([id, c, fn, lb], i) => k.button(p, id, u0 + Math.floor(i / cols) * du, v0 + (i % cols) * dv, c, fn, lb));
}

// ------------------------------------------------------------------ Pultanordnungen
function buildHst(k: Kit, vmax: number) {
  const L = k.L, [ex, , ez] = L.eye;
  k.shell({ seat: 0x30353c });
  // breites, flaches Flügelpult
  const p = k.desk(ex + 0.42, 2.48, -2.3, 2.52, -1.1, 1.1, L.desk);
  k.mesh(p, boxG(), k.M(L.panel, 0.7), 0.42, 0.003, 0, 0.7, 0.006, 1.9);
  // Monitorhaube mit zwei großen Bildschirmen
  k.box(k.M(L.panel, 0.6), -3.98, -3.35, 2.5, 2.6, -0.82, 0.82);
  k.screenStand(-3.97, 2.555, -0.235, 0.43, 0.26, 0.6, drive('std'), sigDrive);
  k.screenStand(-3.97, 2.555, 0.235, 0.43, 0.26, 0.6, info('std', false), sigInfo);
  pzbLamps(k, p, 0.62, -0.75, 0.075);
  stdLamps(k, p, 0.62, 0.48, 0.075, true);
  // linker Flügel
  k.rotary(p, 'reverser', 0.18, -0.42, (s) => s.reverser * 0.8, 0.03, 0x15171a);
  grid(k, p, 0.12, -0.95, 0.13, 0.12, 3, [['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch], ['parking', Y, (s) => s.parking]]);
  k.rotary(p, 'lights', 0.38, -0.95, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.38, -0.82, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.38, -0.69, (s) => s.cabLight);
  // rechter Flügel
  grid(k, p, 0.12, 0.42, 0.13, 0.12, 4, [['doorsL', G, (s) => s.releaseL], ['doorsClose', Y], ['doorsR', G, (s) => s.releaseR], ['sand', W, (s) => s.sand],
    ['horn', W], ['pzbAck', B, (s) => s.pzb.warn], ['sifa', Y, (s) => s.sifaWarn]]);
  k.mushroom(p, 0.4, 0.92);
  // Armlehnen-Konsolen: rechts Seitenstick, links Führerbremsventil
  const cr = k.desk(ex - 0.15, 2.6, ex + 0.35, 2.62, ez + 0.42, ez + 0.66, L.desk);
  k.lever(cr, 'combined', 0.25, 0, (s) => -0.45 * comb(s), { style: 'stick', len: 0.1, label: 'Seitenstick' });
  const cl = k.desk(ex - 0.15, 2.6, ex + 0.35, 2.62, ez - 0.66, ez - 0.42, L.desk);
  k.lever(cl, 'brake', 0.26, 0, fbv, { style: 'swing', len: 0.13 });
  k.pedal('sifa', ex + 0.55, ez - 0.22, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
  void vmax;
}

function buildDosto(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye;
  k.shell({ seat: 0x3b4a5c });
  // flacher Pultteil + ansteigende Instrumententafel
  const p = k.desk(ex + 0.4, 2.62, -1.12, 2.63, -0.95, 0.95, L.desk);
  const ip = k.desk(-1.12, 2.62, -0.55, 2.71, -0.95, 0.95, L.panel);
  k.screen(ip, 0.3, -0.05, 0.4, 0.24, 0.35, drive('std'), sigDrive);
  k.screen(ip, 0.28, 0.5, 0.26, 0.17, 0.35, info('warm', false), sigInfo);
  pzbLamps(k, ip, 0.08, -0.85, 0.07);
  // Kombihebel links
  k.lever(p, 'combined', 0.22, -0.52, (s) => -0.55 * comb(s), { style: 'ball', len: 0.17, c: 0x111111, quad: 0.22 });
  k.lever(p, 'brake', 0.25, 0.62, fbv, { style: 'swing', len: 0.12 });
  k.rotary(p, 'reverser', 0.12, 0.28, (s) => s.reverser * 0.8, 0.028, 0x15171a);
  grid(k, p, 0.06, -0.2, 0.12, 0.11, 4, [['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch], ['sand', W, (s) => s.sand], ['horn', W],
    ['doorsL', G, (s) => s.releaseL], ['doorsClose', Y], ['doorsR', G, (s) => s.releaseR], ['pzbAck', B, (s) => s.pzb.warn]]);
  k.button(p, 'sifa', 0.4, 0.15, Y, (s) => s.sifaWarn);
  k.button(p, 'parking', 0.4, 0.28, Y, (s) => s.parking);
  k.rotary(p, 'lights', 0.4, 0.42, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.4, -0.85, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.28, -0.85, (s) => s.cabLight);
  k.mushroom(p, 0.4, 0.82);
  k.pedal('sifa', ex + 0.55, -0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
  void vmax;
}

function buildSbahn(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye;
  k.shell({ seat: 0x8a1020 });
  // kompaktes Pult, schmal, mit Mittelaufsatz
  const p = k.desk(ex + 0.42, 2.45, -0.55, 2.5, -0.72, 0.72, L.desk);
  k.box(k.M(L.panel, 0.6), -1.3, -0.95, 2.46, 2.56, -0.32, 0.32);
  k.screenStand(-1.31, 2.53, 0, 0.42, 0.25, 0.75, drive('std'), sigDrive);
  // Kombi-T-Hebel links der Mitte
  k.lever(p, 'combined', 0.22, -0.32, (s) => -0.6 * comb(s), { style: 'T', len: 0.15, c: 0x202020, quad: 0.24, label: 'Kombihebel' });
  k.rotary(p, 'reverser', 0.12, 0.2, (s) => s.reverser * 0.8, 0.026, 0x15171a);
  // Türtaster groß an den Außenkanten
  k.button(p, 'doorsL', 0.2, -0.62, G, (s) => s.releaseL, undefined, 0.032);
  k.button(p, 'doorsR', 0.2, 0.62, G, (s) => s.releaseR, undefined, 0.032);
  k.button(p, 'doorsClose', 0.36, 0.62, Y, undefined, undefined, 0.026);
  grid(k, p, 0.08, 0.32, 0.11, 0.11, 2, [['horn', W], ['sand', W, (s) => s.sand], ['pzbAck', B, (s) => s.pzb.warn], ['sifa', Y, (s) => s.sifaWarn], ['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch]]);
  pzbLamps(k, p, 0.55, -0.62, 0.065);
  k.button(p, 'parking', 0.4, -0.15, Y, (s) => s.parking);
  k.rotary(p, 'lights', 0.4, 0.1, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.55, 0.62, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.42, 0.42, (s) => s.cabLight);
  k.mushroom(p, 0.4, -0.45);
  k.pedal('sifa', ex + 0.5, -0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
  void vmax;
}

function buildDmu(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye;
  k.shell({ seat: 0x2f4a33 });
  const p = k.desk(ex + 0.4, 2.38, -0.55, 2.52, -0.9, 0.9, L.desk);
  // Instrumentenkasten mit Analog-Tacho + kleinem Bildschirm
  const pod = k.pan(k.g, -1.15, 2.5, 0, 1.0);
  k.box(k.M(L.panel, 0.6), -1.3, -0.95, 2.4, 2.58, -0.55, 0.55);
  k.gauge(pod, 0.1, -0.2, 0.085, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0xffffff]]);
  k.screen(pod, 0.1, 0.17, 0.24, 0.15, 0, info('std', true), sigInfo);
  k.gauge(pod, 0.1, 0.43, 0.055, BRAKE, [[(s) => s.pipe, 0xffffff], [(s) => s.mainRes, 0xffcc00]]);
  k.gauge(pod, 0.1, -0.45, 0.055, CYL, [[(s) => s.cyl * 3.8, 0xff3b30]]);
  // Fahrschalter rechts, Bremshebel links
  k.lever(p, 'throttle', 0.25, 0.42, (s) => -0.9 * s.throttle + 0.2, { style: 'ball', len: 0.16, c: 0x1b1b1b, quad: 0.2 });
  k.lever(p, 'brake', 0.25, -0.45, (s) => -0.9 * s.brake + 0.2, { style: 'red', len: 0.16, quad: 0.2, label: 'Bremshebel' });
  k.lever(p, 'dyn', 0.12, 0.62, (s) => -0.8 * s.dyn + 0.2, { style: 'ball', len: 0.1, c: 0xd9a400, quad: 0.12, label: 'Retarder' });
  k.rotary(p, 'reverser', 0.12, 0.2, (s) => s.reverser * 0.8, 0.026, 0x15171a);
  grid(k, p, 0.06, -0.2, 0.12, 0.11, 3, [['engine', G, (s) => s.engineRpm > 50], ['horn', W], ['sand', W, (s) => s.sand], ['doorsL', G, (s) => s.releaseL], ['doorsClose', Y], ['doorsR', G, (s) => s.releaseR]]);
  pzbLamps(k, p, 0.55, -0.4, 0.07);
  k.button(p, 'pzbAck', 0.42, 0.25, B, (s) => s.pzb.warn);
  k.button(p, 'sifa', 0.42, 0.38, Y, (s) => s.sifaWarn);
  k.button(p, 'parking', 0.42, 0.52, Y, (s) => s.parking);
  k.rotary(p, 'lights', 0.3, -0.75, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.42, -0.75, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.54, -0.75, (s) => s.cabLight);
  k.toggle(p, 'battery', 0.18, -0.75, () => true);
  k.mushroom(p, 0.4, 0.78);
  k.pedal('sifa', ex + 0.5, -0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
}

function buildEloco(k: Kit, vmax: number) {
  const L = k.L, [ex, , ez] = L.eye;
  k.shell({ seat: 0x404a44 });
  // klassisches Lokpult: flache Schreibfläche + steile Instrumententafel
  const p = k.desk(ex + 0.4, 2.36, -1.38, 2.4, ez - 0.75, ez + 0.75, L.desk);
  const ip = k.desk(-1.38, 2.4, -0.75, 2.52, ez - 0.75, ez + 0.75, L.panel);
  k.gauge(ip, 0.32, 0, 0.09, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0xffffff]], 0.5);
  k.gauge(ip, 0.32, -0.27, 0.062, BRAKE, [[(s) => s.pipe, 0xffffff], [(s) => s.mainRes, 0xff3b30]], 0.5);
  k.gauge(ip, 0.32, -0.5, 0.062, CYL, [[(s) => s.cyl * 3.8, 0xff3b30]], 0.5);
  k.gauge(ip, 0.32, 0.27, 0.062, { min: -100, max: 100, major: 50, minor: 10, unit: '%', title: 'Zug-/Bremskraft' }, [[(s) => s.power * 100, 0xffcc00]], 0.5);
  k.gauge(ip, 0.32, 0.5, 0.062, { min: 0, max: 20, major: 5, minor: 1, unit: 'kV', title: 'Fahrdraht' }, [[(s) => 15 * s.panto, 0xffffff]], 0.5);
  pzbLamps(k, ip, 0.1, -0.6, 0.075);
  stdLamps(k, ip, 0.1, -0.15 + 0.075 * 2, 0.075, true);
  // großes Handrad als Fahrschalter rechts, Führerbremsventil links
  k.handwheel(p, 'throttle', 0.3, 0.5, 0.13, (s) => s.throttle * 4.2, 0x111111, 'Fahrschalter');
  k.lever(p, 'brake', 0.28, -0.52, fbv, { style: 'swing', len: 0.16 });
  k.lever(p, 'dyn', 0.12, -0.3, (s) => -0.9 * s.dyn + 0.25, { style: 'ball', len: 0.12, c: 0xd9a400, quad: 0.14 });
  k.rotary(p, 'reverser', 0.1, 0.18, (s) => s.reverser * 0.9, 0.03, 0x111111);
  grid(k, p, 0.05, -0.62, 0.11, 0.11, 1, [['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch]]);
  grid(k, p, 0.42, -0.2, 0.11, 0.12, 4, [['sand', W, (s) => s.sand], ['horn', W], ['pzbAck', B, (s) => s.pzb.warn], ['sifa', Y, (s) => s.sifaWarn]]);
  k.button(p, 'parking', 0.3, -0.02, Y, (s) => s.parking);
  k.rotary(p, 'lights', 0.55, 0.3, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.55, 0.45, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.55, 0.58, (s) => s.cabLight);
  k.mushroom(p, 0.55, 0.7);
  k.pedal('sifa', ex + 0.55, ez - 0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
}

function buildDloco(k: Kit, vmax: number) {
  const L = k.L, [ex, , ez] = L.eye;
  k.shell({ seat: 0x3a3a30 });
  // kurzes Pult unter der senkrechten Frontscheibe + steile Messgerätetafel
  const p = k.desk(ex + 0.4, 2.5, -2.32, 2.52, ez - 0.7, ez + 0.8, L.desk);
  const ip = k.desk(-2.32, 2.52, -2.12, 2.9, ez - 0.7, ez + 0.8, L.panel);
  const tv = 0.6;
  k.gauge(ip, 0.2, -0.05, 0.075, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0xffffff]], tv);
  k.gauge(ip, 0.2, 0.17, 0.06, { min: 0, max: 20, major: 5, minor: 1, unit: 'U/min ×100', title: 'Motordrehzahl', red: 18 }, [[(s) => s.engineRpm / 100, 0xffffff]], tv);
  k.gauge(ip, 0.2, 0.36, 0.06, { min: -100, max: 100, major: 50, minor: 10, unit: '%', title: 'Zug-/Bremskraft' }, [[(s) => s.power * 100, 0xffcc00]], tv);
  k.gauge(ip, 0.2, 0.55, 0.05, { min: 0, max: 100, major: 25, minor: 5, unit: '%', title: 'Kraftstoff', red: 0 }, [[(s) => s.fuel * 100, 0xffcc00]], tv);
  k.gauge(ip, 0.2, -0.27, 0.06, BRAKE, [[(s) => s.pipe, 0xffffff], [(s) => s.mainRes, 0xff3b30]], tv);
  k.gauge(ip, 0.2, -0.48, 0.05, CYL, [[(s) => s.cyl * 3.8, 0xff3b30]], tv);
  pzbLamps(k, ip, 0.04, -0.6, 0.07);
  // Stufenschalter (Raste) rechts, großer Bremshebel links
  k.lever(p, 'throttle', 0.18, 0.5, (s) => 0.35 - Math.round(s.throttle * 8) / 8 * 0.95, { style: 'notch', len: 0.2, c: 0x111111, quad: 0.3, label: 'Fahrstufen' });
  k.lever(p, 'brake', 0.2, -0.4, fbv, { style: 'swing', len: 0.24, c: 0x8a1010 });
  k.lever(p, 'dyn', 0.14, 0.72, (s) => -0.8 * s.dyn + 0.25, { style: 'ball', len: 0.12, c: 0xd9a400, quad: 0.14 });
  k.rotary(p, 'reverser', 0.16, 0.18, (s) => s.reverser * 0.9, 0.03, 0x111111);
  grid(k, p, 0.08, -0.65, 0.11, 0.12, 1, [['engine', G, (s) => s.engineRpm > 50], ['battery', W, () => true]]);
  grid(k, p, 0.1, -0.15, 0.1, 0.11, 3, [['sand', W, (s) => s.sand], ['horn', W], ['pzbAck', B, (s) => s.pzb.warn]]);
  k.button(p, 'sifa', 0.1, 0.0, Y, (s) => s.sifaWarn);
  k.button(p, 'parking', 0.2, 0.0, Y, (s) => s.parking);
  // Seitenkonsole rechts an der Wand
  const sc = k.pan(k.g, ex + 0.1, 2.55, L.hw - 0.3, 0.35, -Math.PI / 2);
  k.box(k.M(L.desk, 0.7), ex - 0.3, ex + 0.5, L.floor, 2.55, L.hw - 0.32, L.hw);
  k.rotary(sc, 'lights', 0.12, -0.2, (s) => s.lights * 0.7);
  k.toggle(sc, 'wipers', 0.12, 0.0, (s) => s.wipers);
  k.toggle(sc, 'cabLight', 0.12, 0.2, (s) => s.cabLight);
  k.mushroom(p, 0.32, 0.6);
  k.pedal('sifa', ex + 0.55, ez - 0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
}

function buildSteam(k: Kit, vmax: number) {
  const L = k.L, f = L.floor, xF = L.gb[0], q = k.q;
  k.shell({ steam: true, seat: undefined });
  const wallM = mat(q, `wall|${L.wall}`, { color: L.wall, rough: 0.8, side: THREE.DoubleSide });
  const glass = mat(q, 'glass', { color: 0x9fc6d8, transparent: true, opacity: 0.12, rough: 0.05, metal: 0.4, side: THREE.DoubleSide, depthWrite: false });
  // Stirnwand mit zwei Fenstern seitlich des Kessels (in der yz-Ebene)
  const sh = new THREE.Shape(); sh.moveTo(-L.hw, f); sh.lineTo(L.hw, f); sh.lineTo(L.hw, L.roof); sh.lineTo(-L.hw, L.roof); sh.closePath();
  for (const s of [1, -1]) {
    const h = new THREE.Path(), z0 = s * 0.62, z1 = s * 1.22;
    h.moveTo(Math.min(z0, z1), 3.15); h.lineTo(Math.max(z0, z1), 3.15); h.lineTo(Math.max(z0, z1), 3.85); h.lineTo(Math.min(z0, z1), 3.85); h.closePath();
    sh.holes.push(h);
    const gg = new THREE.PlaneGeometry(0.6, 0.7); gg.rotateY(Math.PI / 2); gg.translate(xF + 0.02, 3.5, s * 0.92); k.add(glass, gg);
  }
  const fw = new THREE.ShapeGeometry(sh, 1); fw.rotateY(-Math.PI / 2); fw.translate(xF, 0, 0); k.add(wallM, fw);
  // Stehkessel-Rückwand
  const bh = k.M(0x161616, 0.45, 0.5), brass = k.M(0xb08d3c, 0.3, 0.85), cu = k.M(0xa4612c, 0.35, 0.8);
  const cg = new THREE.CylinderGeometry(0.86, 0.86, 0.3, k.seg + 6, 1, false, Math.PI * 0.5, Math.PI); cg.rotateZ(Math.PI / 2); cg.translate(xF - 0.15, 2.85, 0);
  k.add(bh, cg);
  k.box(bh, xF - 0.3, xF, f, 2.85, -0.86, 0.86);
  // Feuertür mit Glut
  const glow = new THREE.MeshStandardMaterial({ color: 0x110500, emissive: 0xff6a10, emissiveIntensity: 1 });
  if (q === 'low') (glow as THREE.MeshStandardMaterial).roughness = 1;
  k.owned.push(glow);
  const gm = k.mesh(k.g, boxG(), glow, xF - 0.31, 2.3, 0, 0.01, 0.3, 0.42);
  const door = new THREE.Group(); door.position.set(xF - 0.32, 2.3, -0.24); k.g.add(door);
  k.mesh(door, boxG(), k.M(0x2a2a2a, 0.5, 0.6), -0.015, 0, 0.24, 0.03, 0.34, 0.48);
  k.mesh(door, boxG(), brass, -0.05, 0, 0.42, 0.04, 0.04, 0.12);
  k.ups.push((s) => { glow.emissiveIntensity = 0.25 + 2.6 * Math.max(0, Math.min(1, s.fire)); });
  k.tag(door, 'firing', 'toggle', 'Feuertür');
  void gm;
  // Wasserstandsgläser
  const water = k.M(0x5aa0d0, 0.1, 0.1), tube = mat(q, 'tube', { color: 0xe8f4ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
  for (const z of [-0.42, 0.42]) {
    k.box(brass, xF - 0.36, xF - 0.3, 2.82, 2.86, z - 0.04, z + 0.04); k.box(brass, xF - 0.36, xF - 0.3, 3.36, 3.4, z - 0.04, z + 0.04);
    k.mesh(k.g, cylG(8), tube, xF - 0.33, 3.11, z, 0.03, 0.5, 0.03);
    const wcol = k.mesh(k.g, cylG(8), water, xF - 0.33, 2.86, z, 0.022, 1, 0.022);
    k.ups.push((s) => { const h = 0.02 + 0.48 * Math.max(0, Math.min(1, s.glass)); wcol.scale.y = h; wcol.position.y = 2.86 + h / 2; });
  }
  // Kesseldruckmesser + Bremsdruck + Tacho (auf Stirnwand / Rückwand, Blick zum Tf)
  const face = (x: number, y: number, z: number, lean = 0.15) => k.pan(k.g, x, y, z, Math.PI / 2 - lean);
  const bar: Fn<number> = (s) => (s.boiler <= 1.2 ? s.boiler * 16 : s.boiler);
  k.gauge(face(xF - 0.32, 3.45, 0), 0, 0, 0.1, { min: 0, max: 20, major: 4, minor: 1, unit: 'bar', title: 'Kesseldruck', red: 16 }, [[bar, 0x111111]], 0, '#efe7d2');
  k.gauge(face(xF - 0.02, 2.95, 1.05), 0, 0, 0.08, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0x111111]], 0, '#efe7d2');
  k.gauge(face(xF - 0.02, 2.95, 0.72), 0, 0, 0.065, BRAKE, [[(s) => s.pipe, 0x111111], [(s) => s.cyl * 3.8, 0xc8202a]], 0, '#efe7d2');
  // Regler (großer Hebel quer über der Rückwand)
  const reg = new THREE.Group(); reg.position.set(xF - 0.42, 3.52, 0.12); k.g.add(reg);
  k.mesh(reg, cylG(k.segS), brass, 0, 0, 0, 0.06, 0.1, 0.06).rotation.x = Math.PI / 2;
  k.mesh(reg, boxG(), k.M(0x6e7278, 0.3, 0.8), 0, 0, 0.27, 0.035, 0.035, 0.52);
  k.mesh(reg, cylG(k.segS), k.M(0x222222, 0.6), 0, -0.07, 0.52, 0.04, 0.16, 0.04);
  k.ups.push((s) => { reg.rotation.x = -0.9 * Math.max(0, Math.min(1, s.throttle)); });
  k.tag(reg, 'throttle', 'lever', 'Regler');
  // Steuerung: Handrad auf Säule (Achse x) + Füllungsanzeige
  k.box(k.dark, xF - 0.5, xF - 0.38, f, 2.7, 1.0, 1.12);
  const wh = new THREE.Group(); wh.position.set(xF - 0.6, 2.78, 1.06); k.g.add(wh);
  const ring = k.mesh(wh, torG(q === 'low' ? 12 : 24), k.M(0x8a1010, 0.4, 0.3), 0, 0, 0, 0.34, 0.34, 0.34); ring.rotation.z = Math.PI / 2;
  for (let i = 0; i < 3; i++) { const sp = k.mesh(wh, boxG(), k.M(0x6e7278, 0.35, 0.7), 0, 0, 0, 0.012, 0.17, 0.012); sp.rotation.x = (i / 3) * Math.PI * 2; sp.position.set(0, Math.cos(sp.rotation.x) * 0.085, -Math.sin(sp.rotation.x) * 0.085); sp.rotation.x *= -1; }
  k.mesh(wh, cylG(k.segS), k.M(0x222222, 0.5), -0.05, 0.17, 0, 0.03, 0.1, 0.03).rotation.z = Math.PI / 2;
  k.ups.push((s) => { wh.rotation.x = s.cutoff * 7; });
  k.tag(wh, 'cutoff', 'rotary', 'Steuerung');
  k.box(k.M(0xefe7d2, 0.6), xF - 0.5, xF - 0.49, 2.9, 3.2, 0.95, 1.12);
  const ptr = k.mesh(k.g, boxG(), k.M(0xc8202a, 0.5), xF - 0.505, 3.05, 1.035, 0.01, 0.012, 0.15);
  k.ups.push((s) => { ptr.position.y = 3.05 + 0.13 * Math.max(-1, Math.min(1, s.cutoff)); });
  // Führerbremsventil und Sandhebel rechts
  const bp = k.pan(k.g, xF - 0.62, 2.62, 0.72, 0.15);
  k.box(k.dark, xF - 0.7, xF - 0.55, f, 2.6, 0.64, 0.8);
  k.lever(bp, 'brake', 0, 0, fbv, { style: 'swing', len: 0.16, c: 0x222222 });
  k.lever(bp, 'emergency', 0.05, 0.12, (s) => (s.emergency ? -0.8 : 0.2), { style: 'red', len: 0.1, quad: 0.08, label: 'Notbremse' });
  const sp2 = k.pan(k.g, xF - 0.6, 2.3, 1.22, 0, -Math.PI / 2);
  k.lever(sp2, 'sand', 0, 0, (s) => (s.sand ? 0.5 : -0.1), { style: 'ball', len: 0.22, c: 0x222222, quad: 0.08 });
  // Pfeifenzug
  const wh2 = new THREE.Group(); wh2.position.set(xF - 0.5, 3.75, 0.55); k.g.add(wh2);
  k.mesh(wh2, cylG(6), k.M(0xd8d0b8, 0.9), 0, -0.15, 0, 0.012, 0.3, 0.012);
  k.mesh(wh2, sphG(8), brass, 0, -0.32, 0, 0.05, 0.05, 0.05);
  k.tag(wh2, 'horn', 'lever', 'Pfeife');
  // Injektor (Heizerseite) + Hilfsbläser
  const ij = k.pan(k.g, xF - 0.36, 2.9, -0.72, Math.PI / 2 - 0.05);
  k.handwheel(ij, 'injector', 0, 0, 0.06, (s) => s.glass * 6, 0x8a1010, 'Injektor');
  k.mesh(k.g, cylG(8), cu, xF - 0.33, 2.6, -0.72, 0.05, 0.6, 0.05);
  // PZB-Nachrüstkasten + Licht an der rechten Wand
  const pz = k.pan(k.g, -11.6, 2.95, L.hw - 0.04, Math.PI / 2 - 0.05, -Math.PI / 2);
  k.box(k.M(0x3a3f45, 0.6), -11.95, -11.25, 2.75, 3.3, L.hw - 0.05, L.hw);
  k.lampRow(pz, 0.17, -0.2, 0.1, [['PZB', B, (s) => s.pzb.monitor], ['1000 Hz', Y, (s) => s.pzb.warn && blinkOn(s)], ['500 Hz', R, (s) => s.pzb.brake], ['Zw.-Br.', R, (s) => s.forced], ['Schleud.', O, (s) => s.slip]]);
  k.button(pz, 'pzbAck', 0.0, -0.2, B, (s) => s.pzb.warn);
  k.rotary(pz, 'lights', 0.0, 0.0, (s) => s.lights * 0.7);
  k.toggle(pz, 'cabLight', 0.0, 0.18, (s) => s.cabLight);
  // Handbremse (Tenderseite) + Kohleöffnung
  const hb = k.pan(k.g, L.back + 0.05, 2.6, -0.8, Math.PI / 2, Math.PI);
  k.handwheel(hb, 'parking', 0, 0, 0.12, (s) => (s.parking ? 5 : 0), 0x222222, 'Handbremse');
  k.box(k.M(0x0c0c0c, 0.9), L.back - 0.02, L.back + 0.005, f, f + 1.0, -0.3, 0.3);
  // Sitzbrett des Lokführers
  k.box(k.M(0x5a3a22, 0.8), L.eye[0] - 0.3, L.eye[0] + 0.1, f + 0.75, f + 0.8, 0.75, 1.25);
}

function buildShunter(k: Kit, vmax: number) {
  const L = k.L, [ex, , ez] = L.eye;
  k.shell({ seat: 0x504a40 });
  // seitliche Konsole an der rechten Wand (Tf sitzt quer daneben)
  const zc = 0.85;
  k.box(k.M(L.desk, 0.7), ex - 0.62, ex + 0.62, L.floor, 2.4, zc - 0.08, L.hw);
  const sc = k.pan(k.g, ex, 2.405, zc - 0.08, 0.32, -Math.PI / 2);
  k.mesh(sc, boxG(), k.M(L.panel, 0.7), 0.24, -0.01, 0, 0.5, 0.02, 1.24);
  k.lever(sc, 'throttle', 0.12, -0.25, (s) => 0.5 - Math.round(s.throttle * 20) / 20 * 1.0, { style: 'notch', len: 0.16, c: 0x111111, quad: 0.3, label: 'Fahrstufen (20)' });
  k.lever(sc, 'brake', 0.14, -0.5, fbv, { style: 'swing', len: 0.13 });
  k.lever(sc, 'dyn', 0.12, 0.0, (s) => -0.8 * s.dyn + 0.25, { style: 'ball', len: 0.11, c: 0x8a1010, quad: 0.12, label: 'Zusatzbremse' });
  k.rotary(sc, 'reverser', 0.12, 0.2, (s) => s.reverser * 0.9, 0.028, 0x111111);
  k.gauge(sc, 0.38, -0.35, 0.07, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0xffffff]], 0.6);
  k.gauge(sc, 0.38, -0.14, 0.055, BRAKE, [[(s) => s.pipe, 0xffffff], [(s) => s.mainRes, 0xff3b30]], 0.6);
  k.gauge(sc, 0.38, 0.06, 0.05, CYL, [[(s) => s.cyl * 3.8, 0xff3b30]], 0.6);
  k.gauge(sc, 0.38, 0.25, 0.05, { min: 0, max: 20, major: 5, minor: 1, unit: 'U/min ×100', title: 'Motor', red: 18 }, [[(s) => s.engineRpm / 100, 0xffffff]], 0.6);
  k.gauge(sc, 0.38, 0.44, 0.045, { min: 0, max: 100, major: 25, minor: 5, unit: '%', title: 'Kraftstoff', red: 0 }, [[(s) => s.fuel * 100, 0xffcc00]], 0.6);
  grid(k, sc, 0.24, 0.36, 0.0, 0.1, 3, [['engine', G, (s) => s.engineRpm > 50], ['horn', W], ['sand', W, (s) => s.sand]]);
  k.lampRow(sc, 0.03, 0.36, 0.08, [['PZB', B, (s) => s.pzb.monitor], ['1000 Hz', Y, (s) => s.pzb.warn && blinkOn(s)], ['500 Hz', R, (s) => s.pzb.brake]]);
  k.button(sc, 'pzbAck', 0.24, -0.08, B, (s) => s.pzb.warn);
  k.button(sc, 'sifa', 0.24, 0.07, Y, (s) => s.sifaWarn);
  k.lampI(sc, 0.03, 0.08, Y, (s) => s.sifaWarn, 'Sifa');
  k.button(sc, 'parking', 0.24, 0.2, Y, (s) => s.parking);
  k.toggle(sc, 'battery', 0.03, -0.55, () => true);
  k.rotary(sc, 'lights', 0.03, -0.3, (s) => s.lights * 0.7);
  k.toggle(sc, 'wipers', 0.03, -0.12, (s) => s.wipers);
  k.toggle(sc, 'cabLight', 0.45, 0.58, (s) => s.cabLight);
  k.mushroom(sc, 0.45, -0.58);
  k.pedal('sifa', ex + 0.5, ez - 0.15, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
}

function buildNeon(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye, q = k.q;
  k.shell({ seat: 0x1a1d2e });
  const cy = 0x19f0ff, pk = 0xff2d95;
  // schwebende Glaskonsole auf Mittelfuß
  k.box(k.M(0x0c0d18, 0.4, 0.6), ex + 0.55, ex + 0.75, L.floor, 2.44, -0.12, 0.12);
  const p = k.pan(k.g, ex + 0.42, 2.46, 0, 0.08);
  const slab = mat(q, 'neonslab', { color: 0x0a0f1e, transparent: true, opacity: 0.82, rough: 0.05, metal: 0.6 });
  k.mesh(p, boxG(), slab, 0.55, -0.02, 0, 1.1, 0.035, 1.9);
  const edge = mat(q, 'neonedge', { color: cy, emissive: cy, ei: 2.5 });
  k.mesh(p, boxG(), edge, -0.002, -0.02, 0, 0.012, 0.012, 1.9);
  k.mesh(p, boxG(), mat(q, 'neonedge2', { color: pk, emissive: pk, ei: 2.5 }), 1.1, -0.02, 0, 0.012, 0.012, 1.9);
  // breites Display
  k.screenStand(ex + 0.78, 2.5, 0, 0.82, 0.22, 0.65, drive('neon'), sigDrive);
  // Touch-Felder: flache leuchtende Kacheln
  const tile = (id: CabControlId, u: number, v: number, c: number, fn?: Fn<boolean>, lb?: string) => {
    const o = new THREE.Group(); o.position.set(u, 0.0, v); p.add(o);
    const on = mat(q, `ntile|on|${c}`, { color: c, emissive: c, ei: 2.2 }), off = mat(q, `ntile|off|${c}`, { color: shade(c, 0.25), emissive: c, ei: 0.25 });
    const m = k.mesh(o, faceG(), off, 0, 0.002, 0, 0.06, 1, 0.075);
    k.ups.push(fn ? (s) => { m.material = fn(s) ? on : off; } : () => { /* */ });
    k.tag(o, id, 'button', lb);
    k.label(p, lb ?? LBL[id] ?? id, u - 0.048, v, 0.09);
  };
  const tiles: [CabControlId, number, Fn<boolean>?][] = [['panto', cy, (s) => s.panto > 0.5], ['mainSwitch', cy, (s) => s.mainSwitch], ['lights', cy, (s) => s.lights > 0], ['cabLight', cy, (s) => s.cabLight], ['wipers', cy, (s) => s.wipers], ['parking', pk, (s) => s.parking],
    ['doorsL', 0x35d06a, (s) => s.releaseL], ['doorsClose', pk], ['doorsR', 0x35d06a, (s) => s.releaseR], ['horn', cy], ['sand', cy, (s) => s.sand], ['pzbAck', 0x3a7bff, (s) => s.pzb.warn]];
  tiles.forEach(([id, c, fn], i) => tile(id, 0.2 + Math.floor(i / 6) * 0.13, (i % 6 < 3 ? -0.85 : 0.47) + (i % 3) * 0.13, c, fn));
  // Schiebe-Regler (Kombihebel) als leuchtende Bahn mit Gleiter
  k.mesh(p, boxG(), edge, 0.32, 0.002, -0.3, 0.42, 0.004, 0.012);
  const sl = new THREE.Group(); p.add(sl);
  k.mesh(sl, boxG(), mat(q, 'neonknob', { color: 0xffffff, emissive: cy, ei: 1.4 }), 0, 0.02, 0, 0.05, 0.04, 0.09);
  k.ups.push((s) => { sl.position.set(0.32 + 0.19 * comb(s), 0, -0.3); });
  k.tag(sl, 'combined', 'lever', 'Fahr-/Bremsregler');
  k.label(p, 'Fahren ▲ / Bremsen ▼', 0.32, -0.42, 0.12);
  // Richtungswahl als Leuchtring
  const rr = new THREE.Group(); rr.position.set(0.32, 0, 0.25); p.add(rr);
  k.mesh(rr, torG(q === 'low' ? 12 : 24), edge, 0, 0.01, 0, 0.1, 0.1, 0.1);
  const rk = k.mesh(rr, boxG(), mat(q, 'neonknob', { color: 0xffffff, emissive: cy, ei: 1.4 }), 0.03, 0.012, 0, 0.04, 0.01, 0.01);
  k.ups.push((s) => { rk.position.set(0.035 * Math.cos(s.reverser * 0.9), 0.012, 0.035 * Math.sin(s.reverser * 0.9)); rk.rotation.y = -s.reverser * 0.9; });
  k.tag(rr, 'reverser', 'rotary');
  k.label(p, 'Richtung', 0.25, 0.25, 0.08);
  // Status-Leuchtpunkte
  k.lampRow(p, 0.06, -0.2, 0.08, [['PZB', 0x3a7bff, (s) => s.pzb.monitor], ['1000 Hz', Y, (s) => s.pzb.warn && blinkOn(s)], ['500 Hz', R, (s) => s.pzb.brake], ['Sifa', Y, (s) => s.sifaWarn], ['Türen', G, (s) => s.releaseL || s.releaseR]]);
  tile('sifa', 0.45, 0.0, 0xffc400, (s) => s.sifaWarn);
  k.mushroom(p, 0.45, 0.88, 0.03);
  k.pedal('sifa', ex + 0.55, -0.2, (s) => !s.sifaWarn, 0x1a1d2e, 'Sifa-Pedal');
}

function buildRack(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye;
  k.shell({ seat: 0x1d3557 });
  // steil geneigtes Pult
  const p = k.desk(ex + 0.38, 2.15, -0.72, 2.62, -0.85, 0.85, L.desk);
  k.gauge(p, 0.55, -0.12, 0.08, SPEED(vmax), [[(s) => Math.abs(s.kmh), 0xffffff]]);
  // Neigungsmesser (Pendelzeiger)
  k.gauge(p, 0.55, 0.15, 0.07, { min: -150, max: 150, major: 50, minor: 10, unit: '‰', title: 'Neigung', red: 120 }, [[(s) => s.gradient, 0xffcc00]]);
  k.gauge(p, 0.55, -0.38, 0.055, BRAKE, [[(s) => s.pipe, 0xffffff], [(s) => s.mainRes, 0xff3b30]]);
  k.screen(p, 0.55, 0.45, 0.24, 0.15, 0, info('std', false), sigInfo);
  pzbLamps(k, p, 0.35, -0.75, 0.07);
  k.lever(p, 'throttle', 0.18, 0.35, (s) => -0.9 * s.throttle + 0.2, { style: 'ball', len: 0.15, c: 0x111111, quad: 0.2 });
  k.lever(p, 'brake', 0.18, -0.4, fbv, { style: 'swing', len: 0.13 });
  // separater Zahnrad-Bremshebel (rot) rechts außen
  k.lever(p, 'dyn', 0.2, 0.68, (s) => -1.0 * s.dyn + 0.25, { style: 'red', len: 0.2, quad: 0.22, label: 'Zahnradbremse' });
  k.rotary(p, 'reverser', 0.1, 0.12, (s) => s.reverser * 0.8, 0.026, 0x111111);
  grid(k, p, 0.05, -0.75, 0.0, 0.11, 6, [['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch], ['doorsL', G, (s) => s.releaseL], ['doorsClose', Y], ['doorsR', G, (s) => s.releaseR], ['horn', W]]);
  grid(k, p, 0.32, -0.1, 0.0, 0.11, 3, [['sand', W, (s) => s.sand], ['pzbAck', B, (s) => s.pzb.warn], ['sifa', Y, (s) => s.sifaWarn]]);
  k.button(p, 'parking', 0.32, 0.25, Y, (s) => s.parking);
  k.rotary(p, 'lights', 0.75, -0.7, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.75, -0.55, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.75, -0.42, (s) => s.cabLight);
  k.mushroom(p, 0.75, 0.7);
  k.pedal('sifa', ex + 0.5, -0.2, (s) => !s.sifaWarn, 0x2a2c30, 'Sifa-Pedal');
}

function buildTram(k: Kit, vmax: number) {
  const L = k.L, [ex] = L.eye, f = L.floor;
  k.shell({ seat: 0x2a2a2a, wipers: [0] });
  // kleines Mittelpult mit Display
  const p = k.desk(ex + 0.4, f + 0.82, -0.5, f + 0.92, -0.45, 0.45, L.desk);
  k.screenStand(-0.95, f + 0.9, 0, 0.32, 0.19, 0.55, drive('tram'), sigDrive);
  // Sollwertgeber links auf Armlehnen-Konsole
  const cl = k.desk(ex - 0.15, f + 0.82, ex + 0.38, f + 0.86, -0.75, -0.48, L.desk);
  k.lever(cl, 'combined', 0.26, 0, (s) => -0.5 * comb(s), { style: 'stick', len: 0.1, c: 0x111111, quad: 0.16, label: 'Sollwertgeber' });
  k.rotary(cl, 'reverser', 0.08, 0.0, (s) => s.reverser * 0.8, 0.022, 0x111111);
  // rechte Konsole: Türen, Licht, Stromabnehmer
  const cr = k.desk(ex - 0.15, f + 0.82, ex + 0.38, f + 0.86, 0.48, 0.8, L.desk);
  grid(k, cr, 0.06, -0.08, 0.1, 0.11, 2, [['doorsL', G, (s) => s.releaseL], ['doorsR', G, (s) => s.releaseR], ['doorsClose', Y], ['panto', B, (s) => s.panto > 0.5], ['mainSwitch', G, (s) => s.mainSwitch], ['parking', Y, (s) => s.parking]]);
  grid(k, p, 0.08, -0.32, 0.0, 0.1, 4, [['sand', W, (s) => s.sand], ['pzbAck', B, (s) => s.pzb.warn]]);
  k.rotary(p, 'lights', 0.08, -0.05, (s) => s.lights * 0.7);
  k.toggle(p, 'wipers', 0.08, 0.12, (s) => s.wipers);
  k.toggle(p, 'cabLight', 0.08, 0.28, (s) => s.cabLight);
  k.lampRow(p, 0.3, -0.35, 0.08, [['Türen', G, (s) => s.releaseL || s.releaseR], ['Sifa', Y, (s) => s.sifaWarn], ['Schleud.', O, (s) => s.slip], ['Bremse', W, (s) => s.cyl > 0.05]]);
  k.mushroom(p, 0.32, 0.32, 0.03);
  // Fußpedale: Totmann (Sifa), Sand, Klingel
  k.pedal('sifa', ex + 0.55, -0.18, (s) => !s.sifaWarn, 0x3a3d40, 'Totmannpedal');
  k.pedal('sand', ex + 0.58, 0.02, (s) => s.sand, 0x5a4a20, 'Sanden');
  k.pedal('horn', ex + 0.55, 0.22, null, 0x8a8a8a, 'Klingel');
}

const BUILD: Record<CabLayout, (k: Kit, vmax: number) => void> = {
  hst: buildHst, dosto: buildDosto, sbahn: buildSbahn, dmu: buildDmu, eloco: buildEloco, dloco: buildDloco,
  steam: buildSteam, shunter: buildShunter, neon: buildNeon, rack: buildRack, tram: buildTram,
};
const VMAX: Record<CabLayout, number> = { hst: 300, dosto: 160, sbahn: 140, dmu: 120, eloco: 200, dloco: 120, steam: 120, shunter: 60, neon: 160, rack: 80, tram: 80 };

export function buildCab(layout: CabLayout, q: 'low' | 'medium' | 'high'): CabModel {
  const L = LGS[layout];
  const k = new Kit(q, L, layout);
  k.g.name = 'cab-' + layout;
  BUILD[layout](k, VMAX[layout]);
  k.ceiling(layout === 'neon' ? 0xbff8ff : 0xfff4dc);
  if (!k.controls.some((c) => c.id === 'wipers') && layout !== 'steam') {
    // Wischer per Klick auf den Wischerarm (Fallback, falls Pult keinen Schalter hat)
    for (const w of k.wipers) k.tag(w.o, 'wipers', 'toggle');
  }
  k.flush();
  const eye = new THREE.Vector3(L.eye[0], L.eye[1], L.eye[2]);
  let acc = 1;
  function update(s: CabState, dt: number) {
    for (let i = 0; i < k.ups.length; i++) k.ups[i](s);
    // Wischer
    if (k.wipers.length) {
      if (s.wipers) k.wPhase += dt * 2.4;
      else if (k.wPhase % (Math.PI * 2) !== 0) {
        const r = k.wPhase % (Math.PI * 2);
        k.wPhase = r + Math.min(Math.PI * 2 - r, dt * 2.4);
        if (k.wPhase >= Math.PI * 2 - 1e-4) k.wPhase = 0;
      }
      const sw = 0.5 - 0.5 * Math.cos(k.wPhase);
      for (const w of k.wipers) w.o.rotation.x = w.park - w.dir * 1.25 * sw;
    }
    // Bildschirme höchstens ~10 Hz
    acc += dt;
    if (acc >= 0.1) {
      acc = 0;
      for (const sc of k.screens) {
        if (!sc.g || !sc.tex) continue;
        const sig = sc.sig(s);
        if (sig === sc.last) continue;
        sc.last = sig;
        sc.draw(sc.g, sc.W, sc.H, s);
        sc.tex.needsUpdate = true;
      }
    }
  }
  function dispose() {
    k.g.removeFromParent();
    for (const o of k.owned) o.dispose();
    k.owned.length = 0;
    k.light?.dispose();
    k.g.clear();
  }
  return { group: k.g, eye, controls: k.controls, update, dispose };
}

/** Gibt die modulweit geteilten Cab-Ressourcen frei (z. B. beim Qualitätswechsel). */
export function clearCabCache(): void {
  for (const g of GEOS.values()) g.dispose();
  for (const m of MATS.values()) m.dispose();
  for (const t of TEXS.values()) t?.dispose();
  GEOS.clear(); MATS.clear(); TEXS.clear();
}
