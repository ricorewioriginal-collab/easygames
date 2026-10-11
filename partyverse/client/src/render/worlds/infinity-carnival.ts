import * as THREE from 'three';
import { disposeTree } from '../materials';
import type { DecorFactory } from './common';
import { createBalloons, createConfetti, createFireworks, createFloaters, createGarlands, createNightSky, createSearchlights, type Ring } from './infinity-carnival-fx';
import { createCarousel, createCoaster, createFerris, createPlatforms, createTents, type Part, type PlatformSpot, type TentSpot } from './infinity-carnival-rides';

/**
 * INFINITY CARNIVAL: endloser Jahrmarkt im Abendhimmel.
 * Alles liegt im Ring außerhalb von radius*1.1 um die Brettmitte. Etwa 30 Draw Calls.
 */
export const createDecor: DecorFactory = (ctx) => {
  const { center, radius, rng } = ctx;
  const q = Math.min(1, Math.max(0, ctx.quality.particles));
  const s = Math.min(1.6, Math.max(0.75, radius / 16));
  const group = new THREE.Group();
  const parts: Part[] = [];
  const min = radius * 1.1;
  const rg: Ring = { cx: center.x, cy: center.y, cz: center.z, min, s };
  const groundY = center.y - 5.5 * s;

  // Reihenfolge der Bauwerke im inneren Ring (Breite, Mindestabstand)
  type Kind = 'ferris' | 'carousel' | 'tent';
  const order: { kind: Kind; w: number; d: number }[] = [
    { kind: 'ferris', w: 14 * s, d: min + 5 * s },
    { kind: 'tent', w: 8 * s, d: min + 5 * s },
    { kind: 'carousel', w: 10 * s, d: min + 6 * s },
    { kind: 'tent', w: 8 * s, d: min + 5.5 * s },
    { kind: 'tent', w: 8 * s, d: min + 5 * s },
    { kind: 'carousel', w: 10 * s, d: min + 6 * s },
    { kind: 'tent', w: 8 * s, d: min + 5.5 * s },
  ];
  let sum = 0;
  for (const o of order) sum += o.w / o.d;
  // Zu eng? Ring nach außen schieben
  const k = Math.max(1, sum / (Math.PI * 1.7));
  for (const o of order) o.d *= k;
  sum /= k;
  const gap = Math.max(0.04, (Math.PI * 2 - sum) / order.length);
  let ang = rng.next() * Math.PI * 2;
  const platforms: PlatformSpot[] = [];
  const anchors: THREE.Vector3[] = [];
  const tentsA: TentSpot[] = [];
  const tentsB: TentSpot[] = [];
  let ferrisAngle = 0;
  let carouselN = 0;
  for (const o of order) {
    ang += o.w / o.d / 2;
    const x = center.x + Math.cos(ang) * o.d;
    const z = center.z + Math.sin(ang) * o.d;
    platforms.push({ x, y: groundY, z, r: o.w * 0.62 });
    if (o.kind === 'ferris') {
      ferrisAngle = ang;
      const f = createFerris(s, x, groundY, z, center.x, center.z);
      parts.push(f);
      anchors.push(f.anchor!);
    } else if (o.kind === 'carousel') {
      const c = createCarousel(s, x, groundY, z, carouselN++ % 2 ? -1 : 1, carouselN % 2 ? [0x4ae0ff, 0xfff0d0] : [0xff4a6a, 0xfff0d0]);
      parts.push(c);
      anchors.push(c.anchor!);
    } else {
      const spot: TentSpot = { x, y: groundY, z, scale: 0.95 + rng.next() * 0.25, yaw: Math.atan2(center.x - x, center.z - z) };
      (tentsA.length <= tentsB.length ? tentsA : tentsB).push(spot);
      anchors.push(new THREE.Vector3(x, groundY + 6.9 * s * spot.scale, z));
    }
    ang += o.w / o.d / 2 + gap;
  }
  if (tentsA.length) parts.push(createTents(s, tentsA, 0xff4a6a, 0xfff0d0));
  if (tentsB.length) parts.push(createTents(s, tentsB, 0x4a7aff, 0xffd04a));

  // Achterbahn-Schleife im Hintergrund, gegenüber vom Riesenrad
  {
    const ca = ferrisAngle + Math.PI;
    const cd = min + 26 * s;
    const cx = center.x + Math.cos(ca) * cd;
    const cz = center.z + Math.sin(ca) * cd;
    const cy = center.y - 8 * s;
    parts.push(createCoaster(s, cx, cy, cz, center.x, center.z, q));
    platforms.push({ x: cx, y: cy, z: cz, r: 15 * s });
  }
  parts.push(createPlatforms(platforms, 0xff8fc0, 0x7a3aa0));

  parts.push(createGarlands(rg, anchors, q));
  parts.push(createBalloons(rg, rng, q));
  parts.push(createFloaters(rg, rng, q));
  parts.push(createConfetti(rg, rng, q));
  parts.push(createFireworks(rg, rng, q));
  parts.push(createSearchlights(rg, rng));
  parts.push(createNightSky(rg, rng, q));

  for (const p of parts) group.add(p.group);
  return {
    group,
    update(dt, t) {
      for (const p of parts) p.update(dt, t);
    },
    dispose() {
      for (const p of parts) for (const m of p.instanced ?? []) m.dispose();
      disposeTree(group);
    },
  };
};
