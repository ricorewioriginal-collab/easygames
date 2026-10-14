/* Welt-Baukasten: Inselform, Fundstücke, Truhen, Reihenfolge-Rätsel, Schalter, Spielautomaten, Fahrzeug-Stellplätze.
   Alle Zustände landen im Spielstand (collected/flags) – nichts geht beim Neuladen verloren. */
import type { WorldCtx } from './registry.ts';
import type { IslandShape, Hill, Flat, PathSeg, PaintCircle } from './terrain.ts';
import { ISLES } from './layout.ts';
import { floatLabel } from './props.ts';
import { itemIcon, itemName } from '../data/items.ts';

export function isle(id: string, o: { height?: number; beach?: number; bumps?: number; hills?: Hill[]; flats?: Flat[]; paths?: PathSeg[]; paints?: PaintCircle[]; grass: number; grass2: number; sand?: number; rock?: number; lobes?: { x: number; z: number; r: number }[]; colorFn?: IslandShape['colorFn']; noSea?: boolean }): IslandShape {
  const I = ISLES[id];
  return { id, x: I.x, z: I.z, r: I.r, height: o.height ?? 1.2, beach: o.beach ?? 9, bumps: o.bumps ?? 1, hills: o.hills ?? [], flats: o.flats ?? [], paths: o.paths ?? [], paints: o.paints ?? [], grass: o.grass, grass2: o.grass2, sand: o.sand ?? 0xf2dca0, rock: o.rock ?? 0x9aa3ad, lobes: o.lobes, colorFn: o.colorFn, noSea: o.noSea };
}
/** Lokale Koordinaten relativ zur Inselmitte. */
export const at = (id: string, dx: number, dz: number) => ({ x: ISLES[id].x + dx, z: ISLES[id].z + dz });
/** Weg von der Inselmitte zur Brücke Richtung (tx,tz). */
export function pathTo(id: string, tx: number, tz: number, w: number, color: number): PathSeg {
  const I = ISLES[id], dx = tx - I.x, dz = tz - I.z, L = Math.hypot(dx, dz);
  return { ax: I.x, az: I.z, bx: I.x + dx / L * (I.r - 2), bz: I.z + dz / L * (I.r - 2), w, color };
}

/** Einsammelbarer Gegenstand (einmalig). */
export function pickup(ctx: WorldCtx, id: string, x: number, z: number, item: string, opts: { y?: number; label?: string; when?: () => unknown; n?: number; glow?: number } = {}): void {
  const api = ctx.api;
  const key = 'pick:' + id;
  if (api.isCollected(key)) return;
  const y = opts.y ?? ctx.h(x, z);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(itemIcon(item)), transparent: true, depthWrite: false }));
  (spr.material as THREE.Material).userData.disposeWithWorld = true;
  spr.scale.setScalar(0.9); spr.position.set(x, y + 0.9, z);
  ctx.add(spr);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.7, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: opts.glow ?? 0xffe14a, transparent: true, opacity: 0.6, depthWrite: false }));
  (ring.material as THREE.Material).userData.disposeWithWorld = true;
  ring.position.set(x, y + 0.06, z); ctx.add(ring);
  ctx.onUpdate((_dt, t) => { if (!spr.visible) return; spr.position.y = y + 0.9 + Math.sin(t * 2.5 + x) * 0.15; spr.visible = !opts.when || !!opts.when(); ring.visible = spr.visible; });
  ctx.interact({ id: key, x, y, z, r: 2.2, icon: itemIcon(item), label: opts.label ?? 'Aufheben: ' + itemName(item), priority: 2, meta: { item }, when: () => !api.isCollected(key) && (!opts.when || !!opts.when()),
    act: () => { if (!api.collectOnce(key)) return; spr.visible = false; ring.visible = false; api.give(item, opts.n ?? 1); api.burst(x, y + 1, z, [0xffe14a, 0xffffff], 14); api.events.emit('interact', { id: key, kind: 'pickup' }); } });
}
const texCache = new Map<string, THREE.CanvasTexture>();
export function emojiTex(e: string): THREE.CanvasTexture {
  let t = texCache.get(e);
  if (!t) { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const c = cv.getContext('2d')!; c.font = '76px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 48, 54); t = new THREE.CanvasTexture(cv); texCache.set(e, t); }
  return t;
}

/** Schatztruhe: einmal öffnen, Belohnung. */
export function chest(ctx: WorldCtx, id: string, x: number, z: number, rot: number, loot: { stars?: number; item?: [string, number] }, when?: () => boolean): void {
  const api = ctx.api, key = 'chest:' + id, y = ctx.h(x, z);
  const base = new THREE.Group(); base.position.set(x, y, z); base.rotation.y = rot;
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.75), new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 }));
  body.position.y = 0.3; body.castShadow = true;
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.6, -0.37);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.25, 0.78), new THREE.MeshStandardMaterial({ color: 0xffc83d, roughness: 0.4, metalness: 0.3 }));
  lid.position.set(0, 0.12, 0.37); lidPivot.add(lid);
  for (const m of [body, lid]) (m.material as THREE.Material).userData.disposeWithWorld = true;
  base.add(body, lidPivot); ctx.add(base);
  ctx.box(x, z, 1.1, 0.75, y, y + 0.85, rot);
  let open = api.isCollected(key) ? 1 : 0;
  lidPivot.rotation.x = -open * 1.9;
  ctx.onUpdate(dt => { const want = api.isCollected(key) ? 1 : 0; open += (want - open) * Math.min(1, dt * 5); lidPivot.rotation.x = -open * 1.9; });
  ctx.interact({ id: key, meta: loot.item ? { item: loot.item[0] } : undefined, x, y, z, r: 2.3, icon: '🧰', label: () => when && !when() ? 'Verschlossene Truhe' : 'Truhe öffnen', priority: 2, when: () => !api.isCollected(key),
    act: () => {
      if (when && !when()) { api.toast('Die Truhe ist fest verschlossen. Vielleicht gibt es irgendwo einen Hinweis …', '🔒'); return; }
      if (!api.collectOnce(key)) return;
      api.sfx('open'); api.burst(x, y + 1, z, [0xffd23f, 0xffffff, 0xff6fb5], 30);
      if (loot.stars) api.addStars(loot.stars, 'aus der Truhe');
      if (loot.item) api.give(loot.item[0], loot.item[1]);
      api.events.emit('interact', { id: key, kind: 'chest' });
    } });
}

/** Reihenfolge-Rätsel: Platten/Säulen in der richtigen Folge berühren. Hinweis kommt von Tafel/Figur. */
export function sequencePuzzle(ctx: WorldCtx, id: string, pads: { x: number; z: number; color: number; icon: string; name: string }[], order: number[], onSolve: () => void, opts: { clue?: string; clueAt?: { x: number; z: number }; style?: 'pillar' | 'pad' | 'torch' } = {}): void {
  const api = ctx.api, flag = 'puzzle_' + id;
  let step = 0;
  const lights: THREE.Mesh[] = [];
  pads.forEach((p, i) => {
    const y = ctx.h(p.x, p.z);
    if (opts.style === 'pad') { ctx.b.cyl(p.x, y, p.z, 1.3, 1.4, 0.25, 0x5a5f7d, 14); }
    else { ctx.b.cyl(p.x, y, p.z, 0.45, 0.6, opts.style === 'torch' ? 1.6 : 2.2, 0x6a6f8a, 10); ctx.circle(p.x, p.z, 0.6, y, y + 2.2); }
    const top = opts.style === 'pad' ? 0.4 : opts.style === 'torch' ? 1.9 : 2.5;
    const m = new THREE.Mesh(new THREE.SphereGeometry(opts.style === 'pad' ? 0.5 : 0.38, 14, 10), new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.35 }));
    (m.material as THREE.Material).userData.disposeWithWorld = true;
    m.position.set(p.x, y + top, p.z); ctx.add(m); lights.push(m);
    ctx.interact({ id: id + ':' + i, x: p.x, y, z: p.z, r: 2.4, icon: p.icon, meta: i === order[0] ? { flag } : undefined, label: () => api.flag(flag) ? p.name + ' (gelöst ✅)' : 'Berühren: ' + p.name, priority: 2,
      act: () => {
        if (api.flag(flag)) { api.burst(p.x, y + top, p.z, [p.color], 10); return; }
        api.sfx('note' + Math.min(7, i * 2), 0.7);
        if (order[step] === i) {
          step++; (m.material as THREE.MeshBasicMaterial).opacity = 1;
          api.burst(p.x, y + top, p.z, [p.color, 0xffffff], 12);
          if (step >= order.length) { api.setFlag(flag); api.sfx('success'); onSolve(); api.events.emit('interact', { id: 'puzzle:' + id, kind: 'puzzle' }); }
        } else {
          step = 0; for (const l of lights) (l.material as THREE.MeshBasicMaterial).opacity = 0.35;
          api.toast('Hm, die Lichter erlöschen. Die Reihenfolge stimmt noch nicht – schau dir den Hinweis an.', '🔄', 2800);
          api.sfx('fail', 0.5);
        }
      } });
  });
  ctx.onUpdate((_dt, t) => { if (api.flag(flag)) lights.forEach((l, i) => { (l.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(t * 3 + i) * 0.25; }); });
  if (opts.clue && opts.clueAt) {
    const c = opts.clueAt, y = ctx.h(c.x, c.z);
    ctx.b.box(c.x, y, c.z, 0.2, 1.2, 0.2, 0x8a5a33); ctx.b.box(c.x, y + 1.2, c.z, 1.6, 1.0, 0.15, 0xfff1d6);
    ctx.box(c.x, c.z, 1.6, 0.3, y, y + 2.2);
    ctx.interact({ id: id + ':hinweis', x: c.x, y, z: c.z, r: 2.4, icon: '📜', label: 'Hinweis-Tafel lesen', priority: 1, act: () => { api.openPanel('note', opts.clue); api.events.emit('interact', { id: id + ':hinweis', kind: 'clue' }); } });
  }
}

/** Spielautomat / Wettbewerbs-Ort für ein Minispiel. */
export function arcade(ctx: WorldCtx, id: string, x: number, z: number, rot: number, game: string, label: string, icon: string, color = 0x8a5bff): void {
  const y = ctx.h(x, z), b = ctx.b;
  b.rbox(x, y, z, 1.3, 2.2, 1.0, color, { ry: rot });
  b.box(x + Math.sin(rot) * 0.51, y + 1.3, z + Math.cos(rot) * 0.51, 1.0, 0.7, 0.04, 0x1a1a3a, { ry: rot });
  ctx.glow.box(x + Math.sin(rot) * 0.53, y + 1.34, z + Math.cos(rot) * 0.53, 0.86, 0.56, 0.02, 0x7fd8ff, { ry: rot });
  ctx.glow.sph(x, y + 2.35, z, 0.18, 0xffd23f);
  ctx.box(x, z, 1.3, 1.0, y, y + 2.2, rot);
  floatLabel(ctx, x, y + 3.0, z, label, icon, 0.55);
  ctx.interact({ id: 'arcade:' + id, x: x + Math.sin(rot) * 1.4, y, z: z + Math.cos(rot) * 1.4, r: 2.6, icon, label: 'Spielen: ' + label, priority: 1, meta: { game }, act: () => ctx.api.startMinigame(game) });
}

/** Hebel/Schalter mit Zustand (Flag). */
export function lever(ctx: WorldCtx, id: string, x: number, z: number, label: string, onUse: () => void, when?: () => boolean): void {
  const api = ctx.api, y = ctx.h(x, z), flag = 'lever_' + id;
  ctx.b.box(x, y, z, 0.6, 0.8, 0.4, 0x6a6f8a);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xe8453c }));
  (arm.material as THREE.Material).userData.disposeWithWorld = true;
  arm.position.set(x, y + 1.1, z); ctx.add(arm);
  ctx.onUpdate(() => { arm.rotation.z = api.flag(flag) ? -0.7 : 0.7; });
  ctx.interact({ id: 'lever:' + id, x, y, z, r: 2, icon: '🕹️', meta: { flag }, label: () => api.flag(flag) ? label + ' ✅' : label, priority: 2, act: () => { if (api.flag(flag)) return; if (when && !when()) { api.toast('Es tut sich nichts … noch nicht.', '🤔'); return; } api.setFlag(flag); api.sfx('bump'); onUse(); api.events.emit('interact', { id: 'lever:' + id, kind: 'lever' }); } });
}

/** Einfaches Interaktions-Objekt, das ein Ereignis meldet (für Quest-Ziele). */
export function spot(ctx: WorldCtx, id: string, x: number, z: number, icon: string, label: string | (() => string), act?: () => void, opts: { r?: number; y?: number; when?: () => boolean; priority?: number; meta?: import('../gameplay/interact.ts').Interactable['meta'] } = {}): void {
  const y = opts.y ?? ctx.h(x, z);
  ctx.interact({ id, x, y, z, r: opts.r ?? 2.6, icon, label, priority: opts.priority ?? 1, when: opts.when, meta: opts.meta, act: () => { act?.(); ctx.api.events.emit('interact', { id, kind: 'spot' }); } });
}

/** Ankunftspunkt auf einer Insel an der Seite der Brücke von `fromId`, Blick zur Inselmitte. */
export function spawnFrom(id: string, fromId: string, inset = 14): { x: number; z: number; yaw: number } {
  const I = ISLES[id], F = ISLES[fromId];
  const dx = F.x - I.x, dz = F.z - I.z, L = Math.hypot(dx, dz) || 1;
  const x = I.x + dx / L * (I.r - inset), z = I.z + dz / L * (I.r - inset);
  return { x, z, yaw: Math.atan2(I.x - x, I.z - z) };
}

/** Kurzschreibweise für Bewohner. */
import type { NpcDef } from '../gameplay/npc.ts';
export function npc(world: string, id: string, name: string, icon: string, role: string, x: number, z: number, greet: string[], chat: string[], extra: Partial<NpcDef> = {}): NpcDef {
  return { id, name, world, x, z, icon, role, greet, chat, wander: 5, ...extra };
}
