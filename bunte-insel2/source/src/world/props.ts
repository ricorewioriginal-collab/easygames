/* Wiederverwendbare Bauteile für alle Welten: Häuser (begehbar, Dach blendet aus), Laternen, Zäune, Brunnen, Bänke,
   Statuen, Schilder, Tore, Stände, Brücken, Türme. Alles landet im statischen Welt-Mesh + Physik. */
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { labelSprite, signMesh } from '../engine/textures.ts';
import type { WorldCtx } from './registry.ts';

export interface Frame { x: number; z: number; rot: number; at(lx: number, lz: number): { x: number; z: number }; ry(r: number): number }
export function frame(x: number, z: number, rot: number): Frame {
  const c = Math.cos(rot), s = Math.sin(rot);
  return { x, z, rot, at: (lx, lz) => ({ x: x + lx * c + lz * s, z: z - lx * s + lz * c }), ry: r => r + rot };
}

const shade = (c: number, f: number): number => {
  const r = Math.min(255, Math.round(((c >> 16) & 255) * f)), g = Math.min(255, Math.round(((c >> 8) & 255) * f)), b = Math.min(255, Math.round((c & 255) * f));
  return (r << 16) | (g << 8) | b;
};

export interface HouseOpts {
  x: number; z: number; rot?: number; w: number; d: number; h?: number;
  wall: number; roof: number; trim?: number;
  enter?: boolean;              // begehbar (Türöffnung)
  roofType?: 'gable' | 'flat' | 'dome' | 'cone' | 'none';
  floor?: number;
  name?: string;                // Schild über der Tür
  icon?: string;
  y?: number;
  windows?: boolean;
  door?: number;                // Türfarbe
  storeys?: number;
}
export interface House { f: Frame; y: number; w: number; d: number; h: number; inside(x: number, z: number): boolean; door: { x: number; z: number } }

/** Haus mit vier Wänden; vorne (lokal +z) eine Tür. Begehbare Häuser sind innen hohl und haben einen Boden. */
export function house(ctx: WorldCtx, o: HouseOpts): House {
  const rot = o.rot ?? 0, f = frame(o.x, o.z, rot), b = ctx.b;
  const y = o.y ?? ctx.h(o.x, o.z) + 0.05;
  const H = o.h ?? 3.4 * (o.storeys ?? 1), T = 0.3, w = o.w, d = o.d, trim = o.trim ?? shade(o.wall, 0.82);
  const dw = 1.7, dh = 2.5;
  const wallBox = (lx: number, lz: number, ww: number, dd: number, y0: number, hh: number, col: number) => {
    const p = f.at(lx, lz);
    b.box(p.x, y + y0, p.z, ww, hh, dd, col, { ry: rot });
    ctx.box(p.x, p.z, ww, dd, y + y0, y + y0 + hh, rot);
  };
  // Sockel
  { const p = f.at(0, 0); b.box(p.x, y - 0.6, p.z, w + 0.3, 0.65, d + 0.3, shade(o.wall, 0.6), { ry: rot }); }
  if (o.enter) {
    const fp = f.at(0, 0);
    b.box(fp.x, y, fp.z, w - T, 0.06, d - T, o.floor ?? 0xd9b88a, { ry: rot });
    ctx.box(fp.x, fp.z, w, d, y - 1, y + 0.06, rot);
    // Wände
    wallBox(0, -d / 2 + T / 2, w, T, 0, H, o.wall);                 // hinten
    wallBox(-w / 2 + T / 2, 0, T, d, 0, H, o.wall);                 // links
    wallBox(w / 2 - T / 2, 0, T, d, 0, H, o.wall);                  // rechts
    const side = (w - dw) / 2;
    wallBox(-dw / 2 - side / 2, d / 2 - T / 2, side, T, 0, H, o.wall);
    wallBox(dw / 2 + side / 2, d / 2 - T / 2, side, T, 0, H, o.wall);
    { const p = f.at(0, d / 2 - T / 2); b.box(p.x, y + dh, p.z, dw, H - dh, T, o.wall, { ry: rot }); }
    // Türrahmen
    for (const sx of [-1, 1]) { const p = f.at(sx * (dw / 2 + 0.08), d / 2 + 0.02); b.box(p.x, y, p.z, 0.16, dh + 0.1, 0.12, trim, { ry: rot }); }
    { const p = f.at(0, d / 2 + 0.02); b.box(p.x, y + dh, p.z, dw + 0.32, 0.16, 0.14, trim, { ry: rot }); }
    // offene Tür (an die Wand geklappt)
    { const p = f.at(dw / 2 + 0.05, d / 2 - 0.55); b.box(p.x, y, p.z, 0.08, dh - 0.05, 1.0, o.door ?? 0x8a5a33, { ry: rot }); }
  } else {
    const fp = f.at(0, 0);
    b.box(fp.x, y, fp.z, w, H, d, o.wall, { ry: rot });
    ctx.box(fp.x, fp.z, w, d, y - 1, y + H, rot);
    const p = f.at(0, d / 2 + 0.03);
    b.box(p.x, y, p.z, dw * 0.8, dh * 0.92, 0.08, o.door ?? 0x8a5a33, { ry: rot });
    const k = f.at(dw * 0.25, d / 2 + 0.1); b.sph(k.x, y + dh * 0.45, k.z, 0.06, 0xffd23f);
  }
  // Fenster
  if (o.windows !== false) {
    const storeys = o.storeys ?? 1;
    for (let st = 0; st < storeys; st++) {
      const wy = y + 1.2 + st * 3.4;
      const nW = Math.max(1, Math.floor(w / 3.4));
      for (let i = 0; i < nW; i++) {
        const lx = -w / 2 + (i + 0.5) * (w / nW);
        if (st === 0 && Math.abs(lx) < dw * 0.9) continue;
        for (const lz of [d / 2 + 0.04, -d / 2 - 0.04]) {
          const p = f.at(lx, lz);
          b.box(p.x, wy - 0.08, p.z, 1.15, 1.25, 0.1, trim, { ry: rot });
          b.box(p.x, wy, p.z, 0.95, 1.05, 0.14, 0xa8dcff, { ry: rot });
          b.box(p.x, wy + 0.45, p.z, 0.08, 1.05, 0.16, trim, { ry: rot, rz: Math.PI / 2 });
          if (lz > 0 && st === 0) { const q = f.at(lx, lz + 0.18); b.box(q.x, wy - 0.22, q.z, 1.1, 0.22, 0.3, 0x8a5a33, { ry: rot }); b.sph(q.x - 0.25, wy + 0.02, q.z, 0.13, 0xff6fb5); b.sph(q.x + 0.2, wy + 0.02, q.z, 0.12, 0xfff07a); }
        }
      }
      const nD = Math.max(1, Math.floor(d / 4));
      for (let i = 0; i < nD; i++) {
        const lz = -d / 2 + (i + 0.5) * (d / nD);
        for (const lx of [w / 2 + 0.04, -w / 2 - 0.04]) {
          const p = f.at(lx, lz);
          b.box(p.x, wy - 0.08, p.z, 0.1, 1.25, 1.15, trim, { ry: rot });
          b.box(p.x, wy, p.z, 0.14, 1.05, 0.95, 0xa8dcff, { ry: rot });
        }
      }
    }
  }
  // Dach (separat, blendet aus)
  const rt = o.roofType ?? 'gable';
  if (rt !== 'none') {
    const rb = new GeoBuilder(), c = f.at(0, 0);
    if (rt === 'gable') {
      rb.roof(c.x, y + H, c.z, w + 0.9, Math.min(3.2, w * 0.45), d + 0.8, o.roof, { ry: rot });
      rb.box(c.x, y + H - 0.12, c.z, w + 0.5, 0.18, d + 0.5, shade(o.roof, 0.75), { ry: rot });
    } else if (rt === 'flat') {
      rb.box(c.x, y + H, c.z, w + 0.4, 0.35, d + 0.4, o.roof, { ry: rot });
      rb.box(c.x, y + H + 0.35, c.z, w + 0.4, 0.3, 0.3, shade(o.roof, 0.8), { ry: rot });
    } else if (rt === 'dome') {
      rb.ball(c.x, y + H, c.z, Math.min(w, d) * 0.55, o.roof, { sy: 0.7 });
      rb.cyl(c.x, y + H - 0.1, c.z, Math.min(w, d) * 0.56, Math.min(w, d) * 0.56, 0.3, shade(o.roof, 0.8), 16);
    } else if (rt === 'cone') {
      rb.cone(c.x, y + H, c.z, Math.max(w, d) * 0.72, Math.max(w, d) * 0.7, o.roof, 12);
    }
    if (o.name) {
      const p = f.at(0, d / 2 + 0.25);
      const s = signMesh(o.name, 0.75, { icon: o.icon });
      s.position.set(p.x, y + dh + 0.6, p.z); s.rotation.y = rot;
      ctx.add(s);
    }
    const roofMesh = rb.mesh(mats().vc, ctx.profile.shadows);
    if (o.enter) ctx.addRoof({ x: o.x, z: o.z, w, d, rot, y, roof: roofMesh });
    else ctx.add(roofMesh);
  } else if (o.name) {
    const p = f.at(0, d / 2 + 0.25);
    const s = signMesh(o.name, 0.75, { icon: o.icon });
    s.position.set(p.x, y + dh + 0.6, p.z); s.rotation.y = rot;
    ctx.add(s);
  }
  const inside = (x: number, z: number) => {
    const dx = x - o.x, dz = z - o.z, cc = Math.cos(-rot), ss = Math.sin(-rot);
    const lx = dx * cc + dz * ss, lz = -dx * ss + dz * cc;
    return Math.abs(lx) < w / 2 && Math.abs(lz) < d / 2;
  };
  return { f, y, w, d, h: H, inside, door: f.at(0, d / 2 + 1.2) };
}

/** Möbel innen (lokale Koordinaten im Haus). Gibt Weltposition zurück. */
export function furniture(ctx: WorldCtx, hs: House, kind: 'bett' | 'tisch' | 'regal' | 'sofa' | 'theke' | 'herd' | 'schrank' | 'pflanze' | 'teppich' | 'kamin' | 'thron' | 'kiste' | 'tv', lx: number, lz: number, color = 0xe8453c, rotY = 0): { x: number; y: number; z: number } {
  const p = hs.f.at(lx, lz), y = hs.y + 0.06, b = ctx.b, r = hs.f.rot + rotY;
  const solid = (w: number, d: number, h: number) => ctx.box(p.x, p.z, w, d, y, y + h, r);
  switch (kind) {
    case 'bett': b.rbox(p.x, y, p.z, 1.3, 0.45, 2.1, 0xf4e6c8, { ry: r }); b.rbox(p.x, y + 0.45, p.z, 1.25, 0.15, 1.6, color, { ry: r }); { const q = hs.f.at(lx, lz - 0.75); b.rbox(q.x, y + 0.45, q.z, 0.9, 0.2, 0.4, 0xffffff, { ry: r }); } solid(1.3, 2.1, 0.5); break;
    case 'tisch': b.box(p.x, y + 0.7, p.z, 1.4, 0.1, 0.9, 0xb07a45, { ry: r }); for (const [a, c] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) { const q = hs.f.at(lx + a, lz + c); b.box(q.x, y, q.z, 0.08, 0.7, 0.08, 0x8a5a33); } solid(1.4, 0.9, 0.8); break;
    case 'regal': b.box(p.x, y, p.z, 1.6, 2.0, 0.45, 0x8a5a33, { ry: r }); for (let i = 0; i < 4; i++) for (let k = 0; k < 6; k++) { const q = hs.f.at(lx - 0.65 + k * 0.26, lz + 0.05); b.box(q.x, y + 0.1 + i * 0.48, q.z, 0.18, 0.36, 0.3, [0xe8453c, 0x3f8cff, 0x4cd07d, 0xffd23f, 0xb36bff][(i + k) % 5], { ry: r }); } solid(1.6, 0.45, 2); break;
    case 'sofa': b.rbox(p.x, y, p.z, 2.0, 0.45, 0.9, color, { ry: r }); { const q = hs.f.at(lx, lz - 0.35); b.rbox(q.x, y + 0.4, q.z, 2.0, 0.5, 0.25, color, { ry: r }); } solid(2, 0.9, 0.5); break;
    case 'theke': b.box(p.x, y, p.z, 3.0, 1.05, 0.7, 0xb07a45, { ry: r }); b.box(p.x, y + 1.05, p.z, 3.1, 0.08, 0.8, 0xf4e6c8, { ry: r }); solid(3, 0.7, 1.1); break;
    case 'herd': b.box(p.x, y, p.z, 1.0, 0.9, 0.7, 0xdfe6ee, { ry: r }); b.cyl(p.x, y + 0.9, p.z, 0.18, 0.18, 0.04, 0x333333, 10); solid(1, 0.7, 0.9); break;
    case 'schrank': b.box(p.x, y, p.z, 1.2, 2.1, 0.6, color, { ry: r }); b.box(p.x, y + 0.05, p.z, 0.04, 2.0, 0.64, 0x5a3a1a, { ry: r }); solid(1.2, 0.6, 2.1); break;
    case 'pflanze': b.cyl(p.x, y, p.z, 0.25, 0.2, 0.4, 0xc0613a, 8); b.sph(p.x, y + 0.75, p.z, 0.4, 0x4cbf55); ctx.circle(p.x, p.z, 0.3, y, y + 1); break;
    case 'teppich': b.cyl(p.x, y + 0.005, p.z, 1.3, 1.3, 0.02, color, 20); break;
    case 'kamin': b.box(p.x, y, p.z, 1.6, 1.4, 0.6, 0xb7a89a, { ry: r }); b.box(p.x, y + 0.1, p.z, 0.9, 0.8, 0.62, 0x3a2a22, { ry: r }); ctx.glow.sph(p.x, y + 0.35, p.z, 0.25, 0xff8a1f); solid(1.6, 0.6, 1.4); break;
    case 'thron': b.box(p.x, y, p.z, 1.1, 0.6, 1.0, 0xe8453c, { ry: r }); { const q = hs.f.at(lx, lz - 0.45); b.box(q.x, y, q.z, 1.1, 2.2, 0.2, 0xffc83d, { ry: r }); } solid(1.1, 1, 0.6); break;
    case 'kiste': b.rbox(p.x, y, p.z, 0.9, 0.6, 0.6, 0x8a5a33, { ry: r }); b.box(p.x, y + 0.6, p.z, 0.92, 0.08, 0.62, 0xffc83d, { ry: r }); solid(0.9, 0.6, 0.7); break;
    case 'tv': b.box(p.x, y, p.z, 1.4, 0.5, 0.5, 0x5a3a1a, { ry: r }); b.box(p.x, y + 0.5, p.z, 1.3, 0.75, 0.08, 0x222222, { ry: r }); { const q = hs.f.at(lx, lz + 0.05); ctx.glow.box(q.x, y + 0.56, q.z, 1.15, 0.6, 0.02, 0x7fd8ff, { ry: r }); } solid(1.4, 0.5, 1.3); break;
  }
  return { x: p.x, y, z: p.z };
}

export function lamp(ctx: WorldCtx, x: number, z: number, color = 0xfff2b0, post = 0x3a4250): void {
  const y = ctx.h(x, z);
  ctx.b.cyl(x, y, z, 0.08, 0.12, 3.2, post, 6);
  ctx.b.cyl(x, y + 3.15, z, 0.22, 0.12, 0.12, post, 6);
  ctx.glow.sph(x, y + 3.45, z, 0.26, color);
  ctx.b.cone(x, y + 3.65, z, 0.3, 0.25, post, 6);
  ctx.circle(x, z, 0.15, y, y + 3.5, { noWalk: true });
}
export function bench(ctx: WorldCtx, x: number, z: number, rot: number, color = 0xb07a45): void {
  const y = ctx.h(x, z), f = frame(x, z, rot);
  ctx.b.box(x, y + 0.42, z, 1.8, 0.08, 0.5, color, { ry: rot });
  const bk = f.at(0, -0.22); ctx.b.box(bk.x, y + 0.5, bk.z, 1.8, 0.5, 0.07, color, { ry: rot });
  for (const s of [-0.75, 0.75]) { const p = f.at(s, 0); ctx.b.box(p.x, y, p.z, 0.08, 0.42, 0.45, 0x3a4250, { ry: rot }); }
  ctx.box(x, z, 1.8, 0.5, y, y + 0.5, rot);
}
export function fence(ctx: WorldCtx, ax: number, az: number, bx: number, bz: number, color = 0xf4e6c8, h = 1): void {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2)), rot = Math.atan2(bx - ax, bz - az);
  for (let i = 0; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ctx.h(x, z); ctx.b.box(x, y, z, 0.14, h, 0.14, color); }
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ctx.h(x, z);
    ctx.b.box(x, y + h * 0.35, z, 0.06, 0.1, L / n, color, { ry: rot }); ctx.b.box(x, y + h * 0.75, z, 0.06, 0.1, L / n, color, { ry: rot });
  }
  const mx = (ax + bx) / 2, mz = (az + bz) / 2, y = ctx.h(mx, mz);
  ctx.box(mx, mz, 0.3, L, y - 1, y + h, rot, { noWalk: true });
}
export function fountain(ctx: WorldCtx, x: number, z: number, r = 4, stone = 0xcfd6e2, water = 0x57c4ff): void {
  const y = ctx.h(x, z);
  ctx.b.cyl(x, y, z, r, r + 0.3, 0.7, stone, 24);
  ctx.b.cyl(x, y + 0.55, z, r - 0.35, r - 0.35, 0.18, water, 24);
  ctx.b.cyl(x, y, z, 0.6, 0.8, 2.4, stone, 12);
  ctx.b.cyl(x, y + 2.3, z, r * 0.45, 0.4, 0.4, stone, 16);
  ctx.b.cyl(x, y + 2.6, z, r * 0.4, r * 0.4, 0.1, water, 16);
  ctx.glow.sph(x, y + 3.0, z, 0.35, 0xbfefff);
  ctx.circle(x, z, r + 0.3, y - 1, y + 0.75);
  ctx.circle(x, z, 0.9, y, y + 3);
  // sprudelndes Wasser
  const drops = new THREE.Group();
  const dm = new THREE.MeshBasicMaterial({ color: 0xd8f6ff, transparent: true, opacity: 0.8 });
  dm.userData.disposeWithWorld = true;
  const dg = new THREE.SphereGeometry(0.09, 6, 4);
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(dg, dm); drops.add(m); }
  drops.position.set(x, y + 3, z);
  ctx.add(drops);
  ctx.onUpdate((_dt, t) => {
    drops.children.forEach((m, i) => {
      const ph = (t * 0.9 + i / 14) % 1, a = (i / 14) * Math.PI * 2;
      m.position.set(Math.cos(a) * ph * r * 0.45, Math.sin(ph * Math.PI) * 1.2 - ph * 2.2, Math.sin(a) * ph * r * 0.45);
    });
  });
}
export function sign(ctx: WorldCtx, x: number, z: number, rot: number, text: string, icon?: string, size = 0.7): void {
  const y = ctx.h(x, z);
  ctx.b.cyl(x, y, z, 0.08, 0.1, 1.8, 0x8a5a33, 6);
  ctx.circle(x, z, 0.15, y, y + 2, { noWalk: true });
  const s = signMesh(text, size, { icon });
  s.position.set(x, y + 1.9, z); s.rotation.y = rot;
  const back = s.clone(); back.rotation.y = rot + Math.PI; back.position.set(x, y + 1.9, z);
  ctx.add(s); ctx.add(back);
}
/** Großes schwebendes Namensschild (Wahrzeichen, Weltname). */
export function floatLabel(ctx: WorldCtx, x: number, y: number, z: number, text: string, icon?: string, h = 1.4, sub?: string): THREE.Sprite {
  const s = labelSprite(text, h, { icon, sub });
  s.position.set(x, y, z);
  ctx.add(s);
  return s;
}
export function arch(ctx: WorldCtx, x: number, z: number, rot: number, w: number, h: number, color: number, top?: number): void {
  const f = frame(x, z, rot), y = ctx.h(x, z);
  for (const s of [-1, 1]) { const p = f.at(s * w / 2, 0); ctx.b.cyl(p.x, y, p.z, 0.45, 0.55, h, color, 10); ctx.circle(p.x, p.z, 0.55, y, y + h); ctx.b.sph(p.x, y + h + 0.2, p.z, 0.55, top ?? color); }
  const c = f.at(0, 0);
  ctx.b.box(c.x, y + h - 0.3, c.z, w + 1, 0.7, 0.8, top ?? color, { ry: rot });
}
export function stall(ctx: WorldCtx, x: number, z: number, rot: number, roof: number, goods: number[]): void {
  const f = frame(x, z, rot), y = ctx.h(x, z), b = ctx.b;
  b.box(x, y, z, 2.6, 1.0, 1.2, 0xb07a45, { ry: rot });
  for (const s of [-1, 1]) for (const t of [-1, 1]) { const p = f.at(s * 1.2, t * 0.5); b.cyl(p.x, y, p.z, 0.06, 0.06, 2.4, 0xf4e6c8, 6); }
  const r = f.at(0, 0);
  for (let i = 0; i < 6; i++) { const p = f.at(-1.25 + i * 0.5, 0); b.box(p.x, y + 2.4, p.z, 0.5, 0.12, 1.6, i % 2 ? 0xffffff : roof, { ry: rot }); }
  goods.forEach((c, i) => { const p = f.at(-0.9 + i * 0.6, 0.15); b.sph(p.x, y + 1.15, p.z, 0.18, c); });
  ctx.box(r.x, r.z, 2.6, 1.2, y, y + 1.05, rot);
}
export function rock(ctx: WorldCtx, x: number, z: number, s: number, color = 0x9aa3ad): void {
  const y = ctx.h(x, z);
  ctx.b.sph(x, y + s * 0.3, z, s, color, { sy: 0.65, detail: 0, ry: x });
  ctx.circle(x, z, s * 0.85, y - 1, y + s * 0.9);
}
/** Begehbarer Turm mit Wendel-Rampe außen (z. B. Leuchtturm, Aussichtsturm). */
export function tower(ctx: WorldCtx, x: number, z: number, r: number, h: number, color: number, top: number, stripes?: number): { topY: number } {
  const y = ctx.h(x, z), b = ctx.b;
  const seg = Math.max(4, Math.round(h / 3));
  for (let i = 0; i < seg; i++) b.cyl(x, y + i * (h / seg), z, r * (1 - (i + 1) / seg * 0.12), r * (1 - i / seg * 0.12), h / seg, stripes && i % 2 ? stripes : color, 16);
  ctx.circle(x, z, r, y - 1, y + h);
  // Galerie oben
  b.cyl(x, y + h, z, r + 1.4, r + 1.4, 0.3, 0xdfe6ee, 20);
  ctx.circle(x, z, r + 1.4, y + h - 0.2, y + h + 0.3);
  b.torus(x, y + h + 1.0, z, r + 1.3, 0.06, 0x3a4250, { rx: Math.PI / 2 });
  // Wendel: kleine Stufen-Plattformen
  const steps = Math.ceil(h / 0.42);
  for (let i = 0; i < steps; i++) {
    const a = i * 0.32, sy = y + (i + 1) * (h / steps), px = x + Math.cos(a) * (r + 0.8), pz = z + Math.sin(a) * (r + 0.8);
    b.box(px, sy - 0.2, pz, 1.5, 0.2, 0.9, 0xb07a45, { ry: -a });
    ctx.box(px, pz, 1.5, 0.9, sy - 0.25, sy, -a);
  }
  b.cyl(x, y + h + 0.3, z, r * 0.7, r * 0.7, 2.2, top, 12);
  ctx.glow.cyl(x, y + h + 0.7, z, r * 0.55, r * 0.55, 1.2, 0xfff6c0, 12);
  b.cone(x, y + h + 2.5, z, r * 0.9, 1.8, top, 12);
  return { topY: y + h + 0.3 };
}
/** Statue einer Figur (vereinfachte, goldene/steinerne Form). */
export function statue(ctx: WorldCtx, x: number, z: number, rot: number, color: number, scale = 2, kind: 'held' | 'hund' | 'drache' | 'fuchs' | 'maus' | 'figur' = 'held'): void {
  const y = ctx.h(x, z), b = ctx.b, f = frame(x, z, rot), s = scale;
  b.cyl(x, y, z, 1.4 * s * 0.6, 1.6 * s * 0.6, 1.2, 0xcfd6e2, 12);
  ctx.circle(x, z, 1.6 * s * 0.6, y - 1, y + 1.2);
  const by = y + 1.2;
  if (kind === 'hund') {
    b.sph(x, by + 0.55 * s, z, 0.5 * s, color, { sx: 0.8, sz: 1.3 }); const hp = f.at(0, 0.55 * s); b.sph(hp.x, by + 1.0 * s, hp.z, 0.35 * s, color);
    for (const sx of [-1, 1]) { const ep = f.at(sx * 0.22 * s, 0.5 * s); b.cone(ep.x, by + 1.2 * s, ep.z, 0.1 * s, 0.3 * s, color, 4); }
    return;
  }
  if (kind === 'drache') {
    b.sph(x, by + 0.8 * s, z, 0.7 * s, color, { sy: 0.9 }); const hp = f.at(0, 0.6 * s); b.sph(hp.x, by + 1.6 * s, hp.z, 0.45 * s, color);
    for (const sx of [-1, 1]) { const wp = f.at(sx * 0.8 * s, -0.1 * s); b.box(wp.x, by + 1.0 * s, wp.z, 0.9 * s, 0.6 * s, 0.05 * s, color, { ry: rot, rz: sx * 0.5 }); }
    return;
  }
  // Menschliche Figur
  for (const sx of [-1, 1]) { const p = f.at(sx * 0.13 * s, 0); b.cyl(p.x, by, p.z, 0.09 * s, 0.1 * s, 0.6 * s, color, 8); }
  b.cyl(x, by + 0.6 * s, z, 0.24 * s, 0.2 * s, 0.6 * s, color, 10);
  b.sph(x, by + 1.45 * s, z, 0.3 * s, color);
  if (kind === 'fuchs') for (const sx of [-1, 1]) { const ep = f.at(sx * 0.18 * s, 0); b.cone(ep.x, by + 1.65 * s, ep.z, 0.08 * s, 0.25 * s, color, 4); }
  if (kind === 'maus') for (const sx of [-1, 1]) { const ep = f.at(sx * 0.3 * s, 0); b.cyl(ep.x, by + 1.6 * s, ep.z, 0.2 * s, 0.2 * s, 0.05 * s, color, 12, { rx: Math.PI / 2, ry: rot }); }
  for (const sx of [-1, 1]) { const ap = f.at(sx * 0.32 * s, 0); b.cyl(ap.x, by + 1.05 * s, ap.z, 0.07 * s, 0.07 * s, 0.55 * s, color, 6, { rz: sx * 2.6, ry: rot }); }
}
/** Brücke zwischen zwei Punkten (immer geladen, eigene Physik). */
export function bridgeGeo(b: GeoBuilder, ax: number, az: number, ay: number, bx: number, bz: number, by: number, w: number, color: number, rail: number): { segs: { x: number; z: number; len: number; rot: number; y0: number; y1: number }[] } {
  const L = Math.hypot(bx - ax, bz - az), rot = Math.atan2(bx - ax, bz - az), n = Math.max(2, Math.ceil(L / 6));
  const segs: { x: number; z: number; len: number; rot: number; y0: number; y1: number }[] = [];
  const yAt = (t: number) => ay + (by - ay) * t + Math.sin(t * Math.PI) * Math.min(4, L * 0.03);
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
    const x = ax + (bx - ax) * tm, z = az + (bz - az) * tm;
    const y0 = yAt(t0), y1 = yAt(t1), ym = (y0 + y1) / 2;
    const len = L / n + 0.05, tilt = Math.atan2(y1 - y0, L / n);
    b.box(x, ym - 0.35, z, w, 0.35, len, color, { ry: rot, rx: -tilt });
    for (const s of [-1, 1]) {
      const px = x + Math.cos(rot) * s * (w / 2 - 0.1), pz = z - Math.sin(rot) * s * (w / 2 - 0.1);
      b.box(px, ym + 0.75, pz, 0.12, 0.12, len, rail, { ry: rot, rx: -tilt });
      b.box(px, ym - 0.1, pz, 0.14, 0.95, 0.14, rail, { ry: rot });
    }
    if (i % 2 === 0) for (const s of [-1, 1]) { const px = x + Math.cos(rot) * s * (w / 2 + 0.3), pz = z - Math.sin(rot) * s * (w / 2 + 0.3); b.cyl(px, -3, pz, 0.35, 0.45, ym - 0.3 + 3, 0x8a6a4a, 8); }
    segs.push({ x, z, len, rot, y0, y1 });
  }
  return { segs };
}
