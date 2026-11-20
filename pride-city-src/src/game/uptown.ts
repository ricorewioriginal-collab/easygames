/* Hochstadt – das neue Großstadtviertel östlich der Innenstadt, über die Regenbogenbrücke erreichbar.
   Eigene Stadt im Ostküsten-Stil: Hochhäuser mit Glas- und Steinfassaden, Brownstones mit Treppen und Feuertreppen,
   Mietskasernen mit Läden, eine Hochbahn auf Stahlstützen, der Neonplatz mit Leuchtreklamen, ein Rotlichtstreifen,
   ein Parkplatz unter der Hochbahn, Dampf aus den Gullis und am Horizont eine Skyline in alle Richtungen.
   Alles wird aus wenigen zusammengefassten Meshes gebaut (ein Zeichenaufruf je Material), Fassaden sind Canvas-Texturen
   mit Fenstern, die nachts zufällig leuchten. Keine fremden Grafiken nötig. */
import { Vector3, Color3, Matrix, Quaternion, Mesh, VertexData, PBRMaterial, TransformNode, PointLight, type AbstractMesh, type Scene, col } from '../engine/bjs';
import { ground, box, sphere, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { PALETTES } from './palettes';
import type { World } from './World';

/** Ostgrenze der Hochstadt (begehbar bis hier) */
export const EAST = 214;
/** Brücke: von der Innenstadt (x 65) bis zur Hochstadt (x 89) */
export const BRIDGE = { x0: 64, x1: 90, hz: 4.6 };
/** Ruhige Ecken für ein Treffen im Auto */
export const QUIET: Array<{ x: number; z: number; name: string }> = [
  { x: 165, z: -46, name: 'Parkplatz unter der Hochbahn' },
  { x: -82, z: -31, name: 'Hinter den Containern am Hafen' },
  { x: 108.5, z: 15, name: 'Basketballplatz im Hochstadtpark' },
];
/** Straßenstrich an der Laternenmeile (Gehweg südlich der Häuser, z = −24,4) */
export const CURB_SPOTS: Array<[number, number]> = [[99, -24.4], [103.5, -24.4], [108, -24.4], [112.5, -24.4]];

let seed = 21;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)];

/* ---------- Geometrie-Sammler: viele Quader → ein Mesh ---------- */
const CUBE: Array<[number[], number[][]]> = [
  [[1, 0, 0], [[.5, -.5, .5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]]],
  [[-1, 0, 0], [[-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]]],
  [[0, 0, 1], [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]]],
  [[0, 0, -1], [[.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]]],
  [[0, 1, 0], [[-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]]],
  [[0, -1, 0], [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]]],
];
class Batch {
  p: number[] = []; n: number[] = []; u: number[] = []; u2: number[] = []; i: number[] = [];
  /** uw/vh: Meter je Textur (Breite/Höhe), z. B. 8 Fensterachsen à 3 m */
  constructor(readonly uw = 24, readonly vh = 27.2) {}
  /** Quader mit Mitte und Größe; rot = Drehung um die Achse (x/y/z), roof = Deckel in einen anderen Sammler */
  box(cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, o: { roof?: Batch | null; off?: [number, number]; rot?: [number, number, number]; bottom?: boolean } = {}) {
    const q = o.rot ? Quaternion.FromEulerAngles(o.rot[0], o.rot[1], o.rot[2]) : Quaternion.Identity();
    const m = Matrix.Compose(new Vector3(sx, sy, sz), q, new Vector3(cx, cy, cz));
    const rm = Matrix.Compose(Vector3.One(), q, Vector3.Zero());
    for (const [nn, cs] of CUBE) {
      if (nn[1] < 0 && !o.bottom) continue;
      const nv = Vector3.TransformNormal(new Vector3(nn[0], nn[1], nn[2]), rm);
      const tgt = nn[1] > 0 && o.roof !== undefined ? o.roof : this;
      if (!tgt) continue;
      const ps = cs.map((c) => Vector3.TransformCoordinates(new Vector3(c[0], c[1], c[2]), m));
      const ax = Math.abs(nv.x), ay = Math.abs(nv.y), az = Math.abs(nv.z);
      const uv = (v: Vector3): [number, number] => ax >= ay && ax >= az ? [v.z * Math.sign(nv.x), v.y] : az >= ay ? [-v.x * Math.sign(nv.z), v.y] : [v.x, v.z];
      const raw = ps.map(uv), u0 = Math.min(...raw.map((r) => r[0])), v0 = ay > ax && ay > az ? Math.min(...raw.map((r) => r[1])) : 0;
      const b = tgt.p.length / 3, off = o.off || [0, 0];
      ps.forEach((v, k) => {
        tgt.p.push(v.x, v.y, v.z); tgt.n.push(nv.x, nv.y, nv.z);
        tgt.u.push((raw[k][0] - u0) / tgt.uw + off[0], (raw[k][1] - v0) / tgt.vh + off[1]);
        tgt.u2.push(raw[k][0] * 1.2, raw[k][1] * 1.2);
      });
      tgt.i.push(b, b + 2, b + 1, b, b + 3, b + 2);
    }
  }
  mesh(sc: Scene, name: string, mat: PBRMaterial) {
    if (!this.i.length) return null;
    const m = new Mesh(name, sc), vd = new VertexData();
    vd.positions = this.p; vd.normals = this.n; vd.uvs = this.u; vd.uvs2 = this.u2; vd.indices = this.i; vd.applyToMesh(m);
    m.material = mat;
    return m;
  }
}

/* ---------- Fassaden-Texturen (8 × 8 Fensterfelder je 64 px) ---------- */
type Kind = 'glass' | 'stone' | 'brick' | 'dark';
function facade(sc: Scene, kind: Kind) {
  const N = 512, c = 64;
  const noise = (g: CanvasRenderingContext2D, base: string, k: number) => {
    g.fillStyle = base; g.fillRect(0, 0, N, N);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,255,255'},${rnd() * k})`; g.fillRect(rnd() * N, rnd() * N, 2, 2); }
  };
  const lit: boolean[] = []; const warm: boolean[] = [];
  for (let i = 0; i < 64; i++) { lit.push(rnd() < (kind === 'glass' ? .42 : .36)); warm.push(rnd() < .72); }
  // ganze Büro-Etagen hell (Glas) wie in echten Hochhäusern
  if (kind === 'glass') for (const f of [1, 4, 6]) for (let x = 0; x < 8; x++) lit[f * 8 + x] = true;
  const win = (kind: Kind): [number, number, number, number] => kind === 'glass' ? [2, 2, 60, 50] : kind === 'stone' ? [16, 12, 32, 38] : [20, 10, 24, 42];
  const albedo = canvasTex(sc, N, N, (g) => {
    if (kind === 'glass') g.fillStyle = '#1b2733', g.fillRect(0, 0, N, N);
    else noise(g, kind === 'stone' ? '#c4b79c' : kind === 'brick' ? '#7a4331' : '#5a2c25', kind === 'stone' ? .06 : .12);
    if (kind === 'brick' || kind === 'dark') { g.fillStyle = 'rgba(30,18,14,.35)'; for (let y = 0; y < N; y += 6) g.fillRect(0, y, N, 1); for (let y = 0; y < N; y += 6) for (let x = (y / 6) % 2 * 8; x < N; x += 16) g.fillRect(x, y, 1, 6); }
    for (let fy = 0; fy < 8; fy++) for (let fx = 0; fx < 8; fx++) {
      const x = fx * c, y = fy * c, [wx, wy, ww, wh] = win(kind);
      if (kind === 'glass') {
        const gr = g.createLinearGradient(x, y, x + c, y + c); gr.addColorStop(0, '#3a5a78'); gr.addColorStop(1, '#16202b');
        g.fillStyle = gr; g.fillRect(x + wx, y + wy, ww, wh);
        g.fillStyle = '#8b98a6'; g.fillRect(x + 31, y + wy, 2, wh); g.fillStyle = '#2f3843'; g.fillRect(x, y + 52, c, 12);
        continue;
      }
      if (kind === 'stone') { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 6, y, 4, c); g.fillRect(x + 54, y, 4, c); }
      g.fillStyle = kind === 'stone' ? '#8f846f' : '#d9d0c0'; g.fillRect(x + wx - 3, y + wy - 4, ww + 6, wh + 8);          // Rahmen / Sturz
      if (kind === 'dark') { g.fillStyle = '#2b3a2e'; g.fillRect(x + wx - 2, y + wy - 2, ww + 4, wh + 4); }
      const gr = g.createLinearGradient(x, y + wy, x, y + wy + wh); gr.addColorStop(0, '#2f3d4d'); gr.addColorStop(1, '#151b24');
      g.fillStyle = gr; g.fillRect(x + wx, y + wy, ww, wh);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + wx, y + wy + wh / 2 - 1, ww, 2);                                // Sprosse
      g.fillStyle = kind === 'stone' ? '#ddd3bd' : '#cfc3ad'; g.fillRect(x + wx - 4, y + wy + wh + 2, ww + 8, 4);         // Fensterbank
    }
  });
  const emissive = canvasTex(sc, N, N, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
    for (let fy = 0; fy < 8; fy++) for (let fx = 0; fx < 8; fx++) {
      const k = fy * 8 + fx; if (!lit[k]) continue;
      const [wx, wy, ww, wh] = win(kind), x = fx * c, y = fy * c;
      const gr = g.createLinearGradient(x, y + wy, x, y + wy + wh);
      gr.addColorStop(0, warm[k] ? '#ffd79a' : '#d6ecff'); gr.addColorStop(1, warm[k] ? '#c87a3a' : '#7aa6d6');
      g.fillStyle = gr; g.fillRect(x + wx, y + wy, ww, wh);
      if (rnd() < .4) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x + wx + rnd() * ww * .6, y + wy + wh * .3, ww * .3, wh * .7); } // Vorhang / Mensch
    }
  });
  // Canvas-Texturen klemmen sonst am Rand: Fassaden müssen sich über die ganze Höhe wiederholen
  for (const t of [albedo, emissive]) t.wrapU = t.wrapV = 1; // WRAP_ADDRESSMODE
  return { albedo, emissive };
}

/* ---------- Werbetafeln und Leuchtschilder (eigene Marken) ---------- */
const ADS: Array<[string, string, string, string]> = [
  ['REGENBOGEN COLA', 'Prickelt in allen Farben', '#ff3fb0', '#2a0a3a'], ['PRIDE FM 88,8', 'Das Radio der Hochstadt', '#5ce1ff', '#0a1f3a'],
  ['GLITZER JEANS', 'Sitzt. Glänzt. Passt.', '#ffd23b', '#3a1a0a'], ['NACHTFALTER', 'Club · Bar · Kabarett', '#b56bff', '#140a2a'],
  ['LIEBE IST LIEBE', 'Hochstadt sagt Ja', '#ff6a3d', '#3a0a1a'], ['HOCHSTADT LIVE', 'Heute: Drag-Gala', '#7bffb0', '#0a2a1a'],
  ['FLAMINGO TAXI', 'Ruf an: 6969', '#ff9ad5', '#2a0a20'], ['SKYLINE BURGER', 'Doppelt. Dreifach. Queer.', '#ffb347', '#2a1408'],
];

export async function buildUptown(w: World) {
  const sc = w.scene, still = (m: AbstractMesh, cast = true, rec = true) => w.still(m, cast, rec);
  const B = {
    glass: new Batch(24, 28.8), stone: new Batch(24, 28.8), brick: new Batch(20, 27.2), dark: new Batch(20, 27.2),
    roof: new Batch(8, 8), metal: new Batch(4, 4), trim: new Batch(4, 4), door: new Batch(4, 4), lights: new Batch(4, 4),
    shop: new Batch(12, 3), far: { glass: new Batch(24, 28.8), stone: new Batch(24, 28.8), brick: new Batch(20, 27.2), dark: new Batch(20, 27.2), roof: new Batch(8, 8) },
  };
  const off = (): [number, number] => [Math.floor(rnd() * 8) / 8, Math.floor(rnd() * 8) / 8];

  /* ----- Straßen: KayKit-Kacheln wie in der Innenstadt (x 90 … 210) ----- */
  const tasks: Promise<unknown>[] = [];
  const L0 = 9, L1 = 21;
  const isRoad = (i: number) => i % 3 === 0;
  for (let ix = L0; ix <= L1; ix++) for (let iz = -6; iz <= 6; iz++) {
    const x = ix * 10, z = iz * 10;
    if (isRoad(ix) || isRoad(iz)) tasks.push(w.road(ix, iz, x, z, L0, L1));
    else tasks.push(w.place('city/base.gltf', x, 0, z, 0, 5, true, false));
  }
  await Promise.all(tasks);

  /* ----- Häuser je Block (4 × 4 Blöcke à 20 × 20 m) ----- */
  type BlockKind = 'tower' | 'brown' | 'dark' | 'lot' | 'park' | 'neon' | 'red';
  const PLAN: BlockKind[][] = [ // [Zeile von Süd nach Nord][Spalte von West nach Ost]
    ['brown', 'brown', 'lot', 'brown'],
    ['red', 'tower', 'tower', 'tower'],
    ['park', 'tower', 'tower', 'dark'],
    ['brown', 'neon', 'brown', 'dark'],
  ];
  const TOWERS: Record<string, [number, Kind]> = { '1,1': [62, 'stone'], '2,1': [88, 'glass'], '3,1': [54, 'glass'], '1,2': [112, 'stone'], '2,2': [138, 'glass'] };
  const blinkers: Mesh[] = [];
  const red = glow(sc, 0xff2a2a, 2.2);
  const Lh = 3.4;

  /** Feuertreppe vor einer Fassade (n = Richtung nach außen, ±z), mittig bei x, Etagen 1 … top */
  const fireEscape = (x: number, zf: number, n: number, floors: number) => {
    for (let f = 1; f < floors; f++) {
      const y = f * Lh + .05, zc = zf + n * .55;
      B.metal.box(x, y, zc, 3.4, .07, 1.1);
      B.metal.box(x, y + 1, zf + n * 1.08, 3.4, .05, .05);                // Geländer
      B.metal.box(x, y + .5, zf + n * 1.08, 3.4, .03, .03);
      for (const sx of [-1.68, 1.68]) { B.metal.box(x + sx, y + 1, zc, .05, .05, 1.1); B.metal.box(x + sx, y + .5, zf + n * 1.08, .05, 1, .05); }
      for (let k = -1.2; k <= 1.2; k += .6) B.metal.box(x + k, y + .5, zf + n * 1.08, .025, 1, .025);
      if (f < floors - 1) B.metal.box(x + .1, y + Lh / 2, zc, 4.5, .06, .55, { rot: [0, 0, Math.atan2(Lh, 3.1)] }); // Treppe zur nächsten Etage
    }
    // Hängeleiter bis über den Gehweg
    B.metal.box(x + 1.3, Lh - 1.2, zf + n * .9, .04, 2.4, .04); B.metal.box(x + 1.7, Lh - 1.2, zf + n * .9, .04, 2.4, .04);
    for (let k = 0; k < 6; k++) B.metal.box(x + 1.5, Lh - 2.3 + k * .4, zf + n * .9, .4, .03, .03);
  };
  const waterTower = (x: number, y: number, z: number) => tasks.push(w.place('city/watertower.gltf', x, y, z, rnd() * 6, 3.6).then((o) => { o.getChildMeshes().forEach((m) => ((m as AbstractMesh & { _pcCast?: boolean })._pcCast = true)); }));
  const acUnits = (x: number, y: number, z: number, wx: number, wz: number) => { for (let i = 0; i < 3; i++) B.metal.box(x + (rnd() - .5) * wx, y + .5, z + (rnd() - .5) * wz, 1.2 + rnd(), 1, 1 + rnd()); };

  /** Reihe von Häusern entlang x, Fassade bei zf, schaut in Richtung n (±1) */
  const row = (cx: number, zf: number, n: number, kind: Kind, count: number, floorsMin: number, floorsMax: number, o: { stoop?: boolean; fire?: boolean; shops?: boolean; tower?: boolean; red?: boolean } = {}) => {
    const W = 16.8 / count, D = 8;
    for (let k = 0; k < count; k++) {
      const hx = cx - 8.4 + W * (k + .5), floors = floorsMin + Math.floor(rnd() * (floorsMax - floorsMin + 1)), H = floors * Lh + .6;
      const zc = zf - n * D / 2;
      B[kind].box(hx, H / 2, zc, W - .02, H, D, { roof: B.roof, off: off() });
      B.trim.box(hx, H + .15, zc, W + .02, .5, D + .3);                                 // Gesims
      B.trim.box(hx, H - .5, zf + n * .12, W, .25, .3);
      if (o.stoop) {
        for (let s = 0; s < 4; s++) { const h = (s + 1) * .28; B.trim.box(hx + W * .22, h / 2, zf + n * (1.35 - s * .3), 1.7, h, .32); }
        B.trim.box(hx + W * .22, .56, zf + n * .25, 1.9, 1.12, .5);
        B.door.box(hx + W * .22, 2.17, zf + n * .03, 1.2, 2.1, .1);
        w.houses.push({ i: w.houses.length, x: hx + W * .22, z: zf + n * 1.65, yaw: n > 0 ? 0 : Math.PI });
      } else if (o.shops) {
        B.shop.box(hx, 1.6, zf + n * .04, W - 1.2, 2.6, .1, { off: [Math.floor(rnd() * 4) / 4, 0] });
        const aw = pbr(sc, pick([0xc0102a, 0x1d6b3a, 0x2a4fae, 0xe0a020, 0x6a2a8a]), .8);
        const a = box(sc, W - .8, .08, 1.5); a.material = aw; a.position.set(hx, 3.2, zf + n * .7); a.rotation.x = -.32 * n; still(a, true, true);
        B.door.box(hx + W / 2 - .9, 1.2, zf + n * .03, 1.1, 2.3, .1);
      }
      if (o.fire && (k % 2 === 0 || o.shops)) fireEscape(hx - W * .12, zf, n, floors);
      if (floors >= 4 && rnd() < .55) waterTower(hx + (rnd() - .5) * 2, H + .4, zc + (rnd() - .5) * 3);
      else acUnits(hx, H + .4, zc, W * .5, D * .5);
    }
    w.colliders.push({ x: cx, z: zf - n * D / 2, hx: 8.4, hz: D / 2 });
  };

  const tower = (cx: number, cz: number, H: number, kind: Kind) => {
    const o = off(), s = 16.6;
    B[kind].box(cx, 6, cz, s, 12, s, { roof: B.roof, off: o });                       // Sockel
    B.trim.box(cx, 12.2, cz, s + .4, .5, s + .4);
    const h1 = H * .72, h2 = H * .9;
    B[kind].box(cx, 12 + (h1 - 12) / 2, cz, s - 2, h1 - 12, s - 2, { roof: B.roof, off: o });
    B[kind].box(cx, h1 + (h2 - h1) / 2, cz, s - 5, h2 - h1, s - 5, { roof: B.roof, off: o });
    B.trim.box(cx, h1 + .2, cz, s - 1.6, .5, s - 1.6);
    B[kind === 'glass' ? 'metal' : 'trim'].box(cx, h2 + (H - h2) / 2, cz, s - 8, H - h2, s - 8, { roof: B.roof });
    // Leuchtband an der Krone (nachts in Regenbogenfarben)
    const c = PALETTES[0].colors[Math.floor(rnd() * 6)];
    const band = glow(sc, c, 1); w.neon.push({ m: band, base: col(c, .9) });
    const bb = box(sc, s - 4.8, .35, s - 4.8); bb.material = band; bb.position.set(cx, h2 - .3, cz); still(bb, false, false);
    acUnits(cx, h1, cz, s - 4, s - 4);
    if (H > 100) {
      B.metal.box(cx, H + 9, cz, .5, 18, .5); B.metal.box(cx, H + 1, cz, 2.4, 2, 2.4);
      const l = sphere(sc, .45, 8); l.material = red; l.position.set(cx, H + 18.2, cz); still(l, false, false); blinkers.push(l);
    } else { const l = sphere(sc, .35, 8); l.material = red; l.position.set(cx + 2, H + .5, cz + 2); still(l, false, false); blinkers.push(l); }
    // Eingang mit Vordach und Licht
    w.colliders.push({ x: cx, z: cz, hx: s / 2, hz: s / 2 });
  };

  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const cx = 105 + 30 * c, cz = -45 + 30 * r, kind = PLAN[r][c];
    if (kind === 'tower') { const [H, k] = TOWERS[c + ',' + r]; tower(cx, cz, H, k); continue; }
    if (kind === 'brown') { row(cx, cz - 8.4, -1, 'brick', 3, 3, 4, { stoop: true, fire: true }); row(cx, cz + 8.4, 1, 'brick', 3, 3, 4, { stoop: true, fire: true }); continue; }
    if (kind === 'dark') { row(cx, cz - 8.4, -1, 'dark', 2, 5, 6, { shops: true, fire: true }); row(cx, cz + 8.4, 1, 'dark', 2, 5, 6, { shops: true, fire: true }); continue; }
    if (kind === 'red') { row(cx, cz - 8.4, -1, 'dark', 3, 3, 4, { shops: true, fire: true, red: true }); row(cx, cz + 8.4, 1, 'brick', 2, 4, 5, { shops: true, fire: true }); continue; }
    if (kind === 'neon') { row(cx, cz - 8.4, -1, 'stone', 2, 2, 3, { shops: true }); row(cx, cz + 8.4, 1, 'stone', 2, 2, 3, { shops: true }); continue; }
    if (kind === 'lot') { parkingLot(cx, cz); continue; }
    if (kind === 'park') { pocketPark(cx, cz); continue; }
  }

  /* ----- Parkplatz unter der Hochbahn ----- */
  function parkingLot(cx: number, cz: number) {
    const a = ground(sc, 18.4, 18.4); a.material = pbr(sc, 0x2b2b30, .55); a.position.set(cx, .115, cz); still(a, false);
    const line = pbr(sc, 0xe8e2c8, .7);
    for (let i = -3; i <= 3; i++) { const l = ground(sc, .12, 4.6); l.material = line; l.position.set(cx + i * 2.6, .12, cz - 6); still(l, false); const l2 = l.clone('pl'); l2.position.z = cz + 6.5; still(l2, false); }
    // Maschendrahtzaun an drei Seiten (Einfahrt im Norden)
    const fence = pbr(sc, 0x8c939c, .5, .7, { alpha: .55 });
    for (const [x, z, sx, sz] of [[cx, cz - 9.3, 18.4, .05], [cx - 9.2, cz, .05, 18.4], [cx + 9.2, cz, .05, 18.4]] as const) {
      const f = box(sc, sx, 2.2, sz); f.material = fence; f.position.set(x, 1.2, z); still(f, false);
      w.colliders.push({ x, z, hx: Math.max(.15, sx / 2), hz: Math.max(.15, sz / 2) });
    }
    tasks.push(w.place('city/dumpster.gltf', cx - 7.6, .1, cz - 7.8, 0), w.place('city/dumpster.gltf', cx - 5, .1, cz - 7.9, .1));
    tasks.push(w.car('car_sedan').then((o) => { o.position.set(cx - 5.2, .1, cz - 6); o.rotation.y = Math.PI; }), w.car('car_hatchback').then((o) => { o.position.set(cx + 5.2, .1, cz + 6.5); }));
    // Garage Schraubenschlüssel: Werkstatt mit Rolltor, Reifenstapel und Leuchtschild (Fahrzeuge kaufen, lackieren, tunen)
    const gx = cx + 5.5, gz = cz - 6.4;
    const wall = pbr(sc, 0x3d4756, .7, .2), roof = pbr(sc, 0x20252e, .6, .4), door = pbr(sc, 0xc9ced6, .35, .8), stripe = pbr(sc, 0xffd23b, .5);
    const body = box(sc, 7, 3.6, 5); body.material = wall; body.position.set(gx, 1.9, gz); still(body);
    const top = box(sc, 7.4, .25, 5.4); top.material = roof; top.position.set(gx, 3.82, gz); still(top);
    const gate = box(sc, 3.4, 2.7, .08); gate.material = door; gate.position.set(gx - 1.3, 1.45, gz + 2.52); still(gate, false);
    for (let i = 0; i < 6; i++) { const r = box(sc, 3.4, .04, .1); r.material = roof; r.position.set(gx - 1.3, .4 + i * .45, gz + 2.55); still(r, false); }
    const st = box(sc, 7.02, .3, .06); st.material = stripe; st.position.set(gx, 3.3, gz + 2.52); still(st, false);
    const side = box(sc, 1.1, 2.1, .08); side.material = pbr(sc, 0x7a2a2a, .6); side.position.set(gx + 2.3, 1.15, gz + 2.52); still(side, false);
    const tyre = pbr(sc, 0x15151a, .95);
    for (let i = 0; i < 4; i++) { const t = box(sc, .75, .22, .75); t.material = tyre; t.position.set(gx + 3.1, .22 + i * .23, gz + 3.2); t.rotation.y = i * .5; still(t); }
    w.neonSign('GARAGE', '#ffd23b', gx, 4.6, gz + 2.6, 0, undefined, 5);
    w.colliders.push({ x: gx, z: gz, hx: 3.5, hz: 2.5 }, { x: gx + 3.1, z: gz + 3.2, hx: .45, hz: .45 });
  }
  /* ----- Kleiner Park mit Basketballplatz ----- */
  function pocketPark(cx: number, cz: number) {
    const g = ground(sc, 18.4, 18.4); g.material = pbr(sc, 0x557a45, 1); g.position.set(cx, .112, cz); still(g, false);
    const court = ground(sc, 9, 13); court.material = pbr(sc, 0xc0653a, .8); court.position.set(cx + 3.5, .118, cz); still(court, false);
    const line = pbr(sc, 0xf4f0e8, .7);
    for (const [x, z, sx, sz] of [[cx + 3.5, cz, 9, .1], [cx - 1, cz, .1, 13], [cx + 8, cz, .1, 13], [cx + 3.5, cz - 6.5, 9, .1], [cx + 3.5, cz + 6.5, 9, .1]] as const) { const l = ground(sc, sx, sz); l.material = line; l.position.set(x, .122, z); still(l, false); }
    for (const z of [cz - 6, cz + 6]) { B.metal.box(cx + 3.5, 1.6, z + Math.sign(z - cz) * .6, .12, 3.2, .12); B.trim.box(cx + 3.5, 3.1, z + Math.sign(z - cz) * .4, 1.6, 1, .06); B.metal.box(cx + 3.5, 2.8, z, .5, .04, .5); }
    for (const [x, z] of [[cx - 6, cz - 6], [cx - 6, cz + 6], [cx - 5, cz], [cx - 8, cz + 1.5]]) w.tree(x, z, .9);
    for (const z of [cz - 3, cz + 3]) tasks.push(w.place('city/bench.gltf', cx - 2, .1, z, Math.PI / 2).then((o) => w.prop(cx - 2, z, .95, [o])));
    w.colliders.push({ x: cx + 3.5, z: cz - 6.6, hx: .3, hz: .3 }, { x: cx + 3.5, z: cz + 6.6, hx: .3, hz: .3 });
  }

  /* ----- Neonplatz: große Werbetafeln auf den Dächern ----- */
  const billboard = (ad: typeof ADS[number], x: number, y: number, z: number, rot: number, wd = 11, ht = 5) => {
    const t = canvasTex(sc, 512, 256, (g) => {
      const gr = g.createLinearGradient(0, 0, 512, 256); gr.addColorStop(0, ad[3]); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
      g.strokeStyle = ad[2]; g.lineWidth = 10; g.strokeRect(8, 8, 496, 240);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = ad[2]; g.shadowBlur = 24;
      g.fillStyle = ad[2]; g.font = '900 70px system-ui, sans-serif'; g.fillText(ad[0], 256, 105, 470);
      g.shadowBlur = 0; g.fillStyle = '#fff'; g.font = '600 34px system-ui, sans-serif'; g.fillText(ad[1], 256, 185, 460);
    });
    const m = glow(sc, 0xffffff, .9, { tex: t }); w.neon.push({ m, base: new Color3(.9, .9, .9) });
    const p = planeZ(sc, wd, ht); p.material = m; p.position.set(x, y, z); p.rotation.y = rot; still(p, false, false);
    B.metal.box(x - Math.sin(rot) * .12, y, z - Math.cos(rot) * .12, Math.abs(Math.cos(rot)) * wd + .2, ht + .2, Math.abs(Math.sin(rot)) * wd + .2);
    for (const s of [-1, 1]) B.metal.box(x + Math.cos(rot) * s * wd * .35, y - ht / 2 - 1, z - Math.sin(rot) * s * wd * .35, .2, 2, .2);
  };
  { const cx = 135, cz = 45;
    billboard(ADS[0], cx - 4, 12.5, cz - 7, Math.PI); billboard(ADS[1], cx + 4.5, 15.5, cz - 6, Math.PI, 8, 4);
    billboard(ADS[2], cx - 4, 12.5, cz + 7, 0); billboard(ADS[5], cx + 8.5, 13, cz, Math.PI / 2, 10, 5);
    billboard(ADS[4], cx - 8.6, 13, cz, -Math.PI / 2, 10, 5);
    // großer Bildschirm an der Ecke
    billboard(ADS[3], 124.2, 9, -9, -Math.PI / 2, 9, 5); billboard(ADS[6], 175.8, 16, 22, Math.PI / 2, 9, 5);
    billboard(ADS[7], 145.8, 14, -36, -Math.PI / 2, 8, 4); billboard(ADS[2], 205.8, 18, -15, Math.PI / 2, 10, 5);
  }
  // Leuchtschilder über den Läden (eigene Namen)
  const SHOPS: Array<[string, string, number, number, number]> = [
    ['PIZZA NONNA', '#ffb347', 194, -36.6, Math.PI], ['WASCHSALON', '#5ce1ff', 200, -36.6, Math.PI], ['DELI 24', '#7bffb0', 190, 36.6, 0], ['BAGEL BOX', '#ffd23b', 198, 53.4, Math.PI],
    ['BAR KOMET', '#ff6ad5', 128, 36.6, Math.PI], ['KINO ASTRA', '#ff3b6b', 141, 36.6, Math.PI], ['CHINA PALAST', '#ff4b3b', 128, 53.4, 0], ['DINER 66', '#5ce1ff', 140, 53.4, 0],
  ];
  for (const [t, c, x, z, r] of SHOPS) w.neonSign(t, c, x, 3.9, z + (r === 0 ? .9 : -.9), r, undefined, 4.6);
  // Rotlicht-Meile: rote Schaufenster und Schilder (die Damen und Herren stehen nur nachts mit 18+ draußen)
  for (const [t, x] of [['NACHTFALTER', 99], ['LUSTGARTEN', 105], ['ROTLICHT', 111]] as const) w.neonSign(t, '#ff2a55', x, 4.1, -24.5, Math.PI, undefined, 5);
  { const rl = new PointLight('rotlicht', new Vector3(105, 3, -27), sc); rl.diffuse = col(0xff2a55); rl.range = 22; rl.intensity = 0; w.lampLights.push(rl); }

  /* ----- Hochbahn auf Stahlstützen über der Avenue x = 150 ----- */
  const ELx = 150, ELy = 7.6;
  for (let z = -55; z <= 55; z += 10) {
    for (const s of [-4.6, 4.6]) { B.metal.box(ELx + s, ELy / 2, z, .5, ELy, .5); w.prop(ELx + s, z, .4, [], true); }
    B.metal.box(ELx, ELy + .1, z, 9.8, .6, .6);
    for (const s of [-4.6, 4.6]) B.metal.box(ELx + s * .7, ELy - .7, z, .12, 1.6, .12, { rot: [0, 0, s > 0 ? .6 : -.6] });
  }
  B.metal.box(ELx - 4, ELy + .9, 0, .35, 1.2, 128); B.metal.box(ELx + 4, ELy + .9, 0, .35, 1.2, 128);
  B.metal.box(ELx, ELy + .45, 0, 8.4, .25, 128);
  for (const s of [-2.6, -1.2, 1.2, 2.6]) B.metal.box(ELx + s, ELy + .65, 0, .1, .15, 128);
  for (let z = -63; z <= 63; z += 1.2) B.trim.box(ELx, ELy + .58, z, 7.6, .08, .25);
  // Bahnhof Hochstadt mit Bahnsteigen und Dach
  B.trim.box(ELx - 5.6, ELy + .8, 22, 2.6, .25, 20); B.trim.box(ELx + 5.6, ELy + .8, 22, 2.6, .25, 20);
  for (const s of [-1, 1]) { for (let z = 13; z <= 31; z += 6) B.metal.box(ELx + s * 6.4, ELy + 2.3, z, .15, 3, .15); B.roof.box(ELx + s * 5.8, ELy + 3.9, 22, 3.6, .2, 20); }
  w.neonSign('HOCHBAHN', '#ffd23b', ELx + 6.95, ELy + 3, 22, Math.PI / 2, undefined, 5);
  w.neonSign('HOCHBAHN', '#ffd23b', 155.95, 3.4, 22, Math.PI / 2, undefined, 4);
  // Zug: drei Wagen, fährt hin und her und hält am Bahnhof
  const train = new TransformNode('train', sc); train.parent = w.root;
  const silver = pbr(sc, 0xb9c0c8, .25, .9), tw = glow(sc, 0xfff0c8, .9);
  w.neon.push({ m: tw, base: new Color3(.8, .75, .6) });
  for (let k = 0; k < 3; k++) {
    const b = box(sc, 2.9, 3, 12); b.material = silver; b.position.set(0, 1.6, k * 12.6 - 12.6); b.parent = train; (b as AbstractMesh & { _pcCast?: boolean })._pcCast = true;
    for (const s of [-1, 1]) { const wv = box(sc, .04, .9, 10.6); wv.material = tw; wv.position.set(s * 1.47, 2.1, k * 12.6 - 12.6); wv.parent = train; }
    const st = box(sc, 2.92, .2, 12.02); st.material = pbr(sc, 0x7a2a8a, .5); st.position.set(0, 1.1, k * 12.6 - 12.6); st.parent = train;
  }
  train.position.set(ELx + 2, ELy + .7, 0);
  const tr = { z: -40, v: 9, dir: 1, wait: 0 };

  /* ----- Regenbogenbrücke über den Fluss ----- */
  const steel = new Batch(4, 4);
  { const x0 = BRIDGE.x0, x1 = BRIDGE.x1, mx = (x0 + x1) / 2, len = x1 - x0;
    const asphalt = box(sc, len, .5, 9.2); asphalt.material = pbr(sc, 0x34343a, .62); asphalt.position.set(mx, -.17, 0); still(asphalt, false);
    for (const s of [-1, 1]) { const sw = box(sc, len, .5, 1.4); sw.material = pbr(sc, 0x9a958c, .85); sw.position.set(mx, -.14, s * 5.3); still(sw, false); }
    const yl = ground(sc, len, .18); yl.material = pbr(sc, 0xe6b422, .6); yl.position.set(mx, .09, 0); still(yl, false);
    B.metal.box(mx, -1.6, 0, len, 2.4, 10.6);
    for (const s of [-1, 1]) { steel.box(mx, .65, s * 6, len, .08, .08); steel.box(mx, .3, s * 6, len, .05, .05); for (let x = x0; x <= x1; x += 1.3) steel.box(x, .4, s * 6, .05, 1, .05); }
    // Pylone
    for (const px of [70, 84]) {
      for (const s of [-1, 1]) steel.box(px, 11, s * 6.6, 1.3, 26, 1.3);
      steel.box(px, 12, 0, 1, 1.2, 14.4); steel.box(px, 23.6, 0, 1.2, 1.4, 14.4);
      const l = sphere(sc, .35, 8); l.material = red; l.position.set(px, 24.6, 0); still(l, false, false); blinkers.push(l);
    }
    // Tragseile (Kettenlinie aus Segmenten) und Hänger, nachts mit Lichterkette
    const cy = (x: number) => x < 70 ? 1.2 + (x - x0) / (70 - x0) * 22.6 : x > 84 ? 23.8 - (x - 84) / (x1 - 84) * 22.6 : 9 + Math.pow((x - 77) / 7, 2) * 14.8;
    const lightMat = glow(sc, 0xfff2c0, 1.6); w.neon.push({ m: lightMat, base: new Color3(1, .95, .75) });
    for (const s of [-1, 1]) {
      for (let x = x0; x < x1; x += .5) {
        const xa = x, xb = Math.min(x1, x + .5), ya = cy(xa), yb = cy(xb), L = Math.hypot(xb - xa, yb - ya);
        steel.box((xa + xb) / 2, (ya + yb) / 2, s * 6.6, L + .02, .16, .16, { rot: [0, 0, Math.atan2(yb - ya, xb - xa)] });
      }
      for (let x = x0 + 1.4; x < x1 - .5; x += 1.4) { if (Math.abs(x - 70) < .8 || Math.abs(x - 84) < .8) continue; const y = cy(x); steel.box(x, (y + .6) / 2, s * 6.6, .05, y - .6, .05); }
      for (let x = x0 + .5; x < x1; x += 1.6) B.lights.box(x, cy(x) + .14, s * 6.6, .22, .22, .22);
    }
    // Regenbogen-LED an der Brückenkante
    PALETTES[0].colors.forEach((c, i) => { const m = glow(sc, c, 1); w.neon.push({ m, base: col(c, .8) }); for (const s of [-1, 1]) { const e = box(sc, len / 6, .12, .05); e.material = m; e.position.set(x0 + (i + .5) * len / 6, -.25, s * 5.33); still(e, false, false); } });
    // Fluss mit Kaimauern
    const water = ground(sc, 26, 600); water.material = pbr(sc, 0x1f6f9a, .1, .3, { emissive: 0x06202e }); water.position.set(mx, .035, 0); still(water, false, true);
    for (const x of [x0 + .3, x1 - .3]) for (const s of [-1, 1]) { const q = box(sc, .6, .8, 300 - 5.5); q.material = pbr(sc, 0x8a8478, .9); q.position.set(x, -.2, s * (5.5 + (300 - 5.5) / 2)); still(q, false); }
    w.neonSign('REGENBOGENBRÜCKE', '#ff6ad5', 70, 18, 0, -Math.PI / 2, undefined, 9);
  }

  /* ----- Dampf aus den Gullis ----- */
  const puffs: Array<{ m: Mesh; x: number; z: number; t: number }> = [];
  { const t = canvasTex(sc, 64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }, true);
    const m = glow(sc, 0xdfe6ee, .8, { tex: t, alpha: .32 }); m.disableDepthWrite = true;
    const src = ground(sc, 1, 1); src.rotation.x = -Math.PI / 2; src.bakeCurrentTransformIntoVertices(); src.material = m; src.billboardMode = Mesh.BILLBOARDMODE_ALL; src.isPickable = false; src.parent = w.root; src.setEnabled(false);
    const vents: Array<[number, number]> = [[120, 4], [150, -32], [180, 28], [93, 31], [135, -2.5], [207, -30], [165, 32], [124, -57]];
    const lid = pbr(sc, 0x2a2a2e, .5, .8);
    for (const [x, z] of vents) {
      const c = box(sc, .9, .02, .9); c.material = lid; c.position.set(x, .11, z); still(c, false);
      for (let i = 0; i < 6; i++) { const p = src.clone('steam'); p.setEnabled(true); p.parent = w.root; puffs.push({ m: p, x, z, t: i / 6 }); }
    }
  }

  /* ----- Skyline am Horizont (nicht begehbar) ----- */
  const far = (x: number, z: number) => {
    const k = pick<Kind>(['glass', 'stone', 'brick', 'dark', 'glass', 'stone']);
    const s = 11 + rnd() * 7, H = k === 'brick' || k === 'dark' ? 14 + rnd() * 20 : 26 + Math.pow(rnd(), 1.6) * 130, o = off();
    B.far[k].box(x, H / 2, z, s, H, s, { roof: B.far.roof, off: o });
    if (H > 60 && rnd() < .6) B.far[k].box(x, H + H * .08, z, s * .6, H * .16, s * .6, { roof: B.far.roof, off: o });
  };
  for (let x = -60; x <= 300; x += 20) for (let z = 85; z <= 165; z += 20) { if (x > 52 && x < 100) continue; if (rnd() < .85) far(x + (rnd() - .5) * 5, z); if (rnd() < .85) far(x + (rnd() - .5) * 5, -z); }
  for (let x = 232; x <= 300; x += 20) for (let z = -65; z <= 65; z += 20) if (rnd() < .9) far(x, z + (rnd() - .5) * 4);
  // Boden der äußeren Stadt (Asphalt statt Wiese)
  const pave = pbr(sc, 0x4a4a52, .9);
  for (const s of [-1, 1]) { const g = ground(sc, 366, 110); g.material = pave; g.position.set(117, .01, s * 121); still(g, false); }
  { const g = ground(sc, 86, 132); g.material = pave; g.position.set(257, .01, 0); still(g, false); }

  /* ----- Meshes und Materialien ----- */
  const mats: Record<Kind, PBRMaterial> = {} as Record<Kind, PBRMaterial>;
  for (const k of ['glass', 'stone', 'brick', 'dark'] as Kind[]) {
    const tx = facade(sc, k), m = new PBRMaterial('up_' + k, sc);
    m.albedoTexture = tx.albedo; m.emissiveTexture = tx.emissive; m.emissiveColor = new Color3(0, 0, 0);
    m.roughness = k === 'glass' ? .12 : k === 'stone' ? .82 : .9; m.metallic = k === 'glass' ? .75 : 0;
    if (k !== 'glass') { const d = w.detailTex(); m.detailMap.texture = d; m.detailMap.isEnabled = true; m.detailMap.diffuseBlendLevel = .35; m.detailMap.bumpLevel = .8; m.detailMap.roughnessBlendLevel = .3; }
    w.nightMats.push(m); mats[k] = m;
  }
  const roofM = pbr(sc, 0x3b3a3f, .95), metalM = pbr(sc, 0x1d1e23, .5, .75), trimM = pbr(sc, 0xb6aa90, .85), doorM = pbr(sc, 0x3a2216, .7), steelM = pbr(sc, 0x6a7686, .45, .8);
  const lightsM = glow(sc, 0xfff2c0, 1.4); w.neon.push({ m: lightsM, base: new Color3(1, .95, .75) });
  const shopT = canvasTex(sc, 512, 128, (g) => {
    const cols = ['#ffe2b0', '#fff1d8', '#d8f2ff', '#ffd6ea'], items = ['#e04a3a', '#3a8ae0', '#f0c030', '#40b060', '#b050c0', '#f08040'];
    for (let i = 0; i < 4; i++) {
      const x = i * 128, gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, cols[i]); gr.addColorStop(1, '#a87850');
      g.fillStyle = '#16120f'; g.fillRect(x, 0, 128, 128); g.fillStyle = gr; g.fillRect(x + 5, 8, 118, 112);
      // Regale mit bunten Waren
      for (let r = 0; r < 3; r++) { g.fillStyle = '#5a3a22'; g.fillRect(x + 8, 30 + r * 26, 112, 3); for (let k = 0; k < 14; k++) { g.fillStyle = items[(k + r + i) % 6]; g.fillRect(x + 10 + k * 8, 18 + r * 26, 6, 12); } }
      // Theke und Gäste als Schatten
      g.fillStyle = 'rgba(60,35,20,.9)'; g.fillRect(x + 8, 100, 112, 20);
      g.fillStyle = 'rgba(25,18,14,.75)'; for (const px of [30 + i * 7, 84 - i * 5]) { g.beginPath(); g.arc(x + px, 74, 8, 0, 7); g.fill(); g.fillRect(x + px - 10, 82, 20, 38); }
      g.fillStyle = '#16120f'; g.fillRect(x + 62, 8, 4, 112); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 10, 10, 30, 4);
    }
  });
  shopT.wrapU = shopT.wrapV = 1;
  const shopM = glow(sc, 0xffffff, .8, { tex: shopT }); w.neon.push({ m: shopM, base: new Color3(.75, .72, .68) });
  const add = (b: Batch, name: string, m: PBRMaterial, cast = true) => { const ms = b.mesh(sc, name, m); if (ms) still(ms, cast, true); return ms; };
  (['glass', 'stone', 'brick', 'dark'] as Kind[]).forEach((k) => { add(B[k], 'up_' + k, mats[k]); add(B.far[k], 'far_' + k, mats[k], false); });
  add(B.roof, 'up_roof', roofM); add(B.far.roof, 'far_roof', roofM, false); add(B.metal, 'up_metal', metalM); add(B.trim, 'up_trim', trimM);
  add(B.door, 'up_door', doorM); add(steel, 'up_steel', steelM); add(B.lights, 'up_lights', lightsM, false); add(B.shop, 'up_shop', shopM, false);
  await Promise.all(tasks);

  /* ----- Bewegung: Zug, Dampf, Flugwarnlichter ----- */
  w.extras.push((dt, t) => {
    if (tr.wait > 0) tr.wait -= dt;
    else {
      const before = tr.z; tr.z += tr.v * tr.dir * dt;
      if ((before - 22) * (tr.z - 22) < 0) { tr.z = 22; tr.wait = 6; }
      if (tr.z > 48 || tr.z < -48) { tr.dir *= -1; tr.z = Math.max(-48, Math.min(48, tr.z)); }
    }
    train.position.z = tr.z; train.position.x = ELx + (tr.dir > 0 ? 2 : -2);
    for (const p of puffs) {
      p.t = (p.t + dt * .28) % 1;
      const k = p.t; p.m.position.set(p.x + Math.sin(k * 5 + p.x) * .4, .3 + k * 4.2, p.z + Math.cos(k * 4 + p.z) * .3);
      p.m.scaling.setAll(.8 + k * 3.2); p.m.visibility = Math.sin(k * Math.PI);
    }
    const on = Math.sin(t * 3) > .6;
    for (const b of blinkers) b.isVisible = on;
  });
}

