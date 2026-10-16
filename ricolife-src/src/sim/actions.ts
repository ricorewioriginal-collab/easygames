// Ausführung der Aktionswarteschlange: Hinlaufen (A*), Platz einnehmen, Animation, Wirkung, Abschluss.
import { clamp, wrapAngle } from '../core/util';
import { LEVEL_H, type ObjInst, cellKey, rotLocal, dimsOf } from '../world/world';
import { getDef } from '../world/defs';
import { findPath, type PathPoint } from '../world/nav';
import { lotEntrance, ROADS_H, ROADS_V } from '../world/map';
import { NEED_IDS } from '../data/types';
import type { Game } from './game';
import { idef, type Ctx, type IDef, type QCtx, type RouteTarget } from './interact';
import type { Action, Sim } from './types';

export const WALK = 1.45; // Kacheln je Spielminute
const CAR = 9;

export function ctxOf(g: Game, s: Sim, a: Action): Ctx {
  return {
    g,
    s,
    a,
    o: a.obj ? g.world.objs.get(a.obj) : undefined,
    t: a.target ? g.sims.get(a.target) : undefined,
    p: a.target ? g.pets.get(a.target) : undefined,
  };
}

export function labelOf(d: IDef, c: QCtx): string {
  return typeof d.label === 'function' ? d.label(c) : d.label;
}

/** Kann die Interaktion ausgeführt werden? */
export function availability(g: Game, d: IDef, c: QCtx): true | string | false {
  if (d.ages && !d.ages.includes(c.s.age)) return false;
  if (d.on === 'obj' && c.o) {
    const od = getDef(c.o.def);
    if (d.func && !d.func.some((f) => od.func?.includes(f as never))) return false;
    if (c.o.st?.broken && d.id !== 'repair' && d.id !== 'kick') return 'Kaputt – zuerst reparieren';
    if (d.power) {
      const lot = c.o.lot;
      const hh = [...g.hhs.values()].find((h) => h.lot === lot);
      if (hh?.powerOff) return 'Kein Strom – Rechnungen bezahlen';
    }
  }
  return d.avail ? d.avail(c) : true;
}

// ---------- Ziele ----------
function slotTarget(g: Game, s: Sim, o: ObjInst, kinds: string[] | null): RouteTarget | string {
  const def = getDef(o.def);
  const slots = def.slots ?? [];
  let best: { t: RouteTarget; d: number } | null = null;
  let reserved = false;
  for (let i = 0; i < slots.length; i++) {
    const sl = slots[i]!;
    if (kinds && !kinds.includes(sl.kind)) continue;
    if (g.isReserved(o, i, s.id)) {
      reserved = true;
      continue;
    }
    if (!g.world.slotFree(o, i)) continue;
    const w = g.world.slotWorld(o, i)!;
    let gx = w.x,
      gz = w.z;
    if (sl.kind === 'sit' || sl.kind === 'sleep') {
      // Zugang vor dem Objekt
      const [cx, cz] = g.world.centerOf(o);
      const [fx, fz] = rotLocal(0, def.d / 2 + 0.5, o.r);
      if (sl.kind === 'sleep') {
        // Bett: seitlich oder vorn einsteigen
        const [sx, sz] = rotLocal(def.w / 2 + 0.5, 0, o.r);
        const opts = [
          [cx + fx, cz + fz],
          [cx + sx, cz + sz],
          [cx - sx, cz - sz],
        ];
        const ok = opts.find(([x, y]) => g.world.cellWalkable(o.l, Math.floor(x!), Math.floor(y!)));
        if (!ok) continue;
        gx = ok[0]!;
        gz = ok[1]!;
      } else {
        const len = Math.hypot(fx, fz) || 1;
        gx = w.x + (fx / len) * 0.9;
        gz = w.z + (fz / len) * 0.9;
        if (!g.world.cellWalkable(o.l, Math.floor(gx), Math.floor(gz))) {
          gx = cx + fx;
          gz = cz + fz;
          if (!g.world.cellWalkable(o.l, Math.floor(gx), Math.floor(gz))) continue;
        }
      }
    }
    const d = Math.hypot(gx - s.x, gz - s.z) + (o.l !== s.l ? 6 : 0);
    if (!best || d < best.d) best = { t: { x: gx, z: gz, l: o.l, yaw: w.yaw, y: w.y, obj: o, slot: i }, d };
  }
  if (best) return best.t;
  return reserved ? 'Gerade besetzt' : 'Kein freier Platz';
}

function nearTarget(g: Game, x: number, z: number, l: number, footprint?: [number, number][]): RouteTarget {
  const any: { x: number; z: number; l: number }[] = [];
  const cells = footprint ?? [[Math.floor(x), Math.floor(z)]];
  const own = new Set(cells.map(([a, b]) => cellKey(l, a, b)));
  for (const [cx, cz] of cells)
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ] as const) {
      const nx = cx + dx,
        nz = cz + dz;
      if (own.has(cellKey(l, nx, nz))) continue;
      if (!g.world.cellWalkable(l, nx, nz)) continue;
      if (g.world.wallBetween(l, cx, cz, nx, nz)) continue;
      any.push({ x: nx + 0.5, z: nz + 0.5, l });
    }
  return { x, z, l, any, yaw: undefined };
}

export function resolveRoute(g: Game, s: Sim, d: IDef, c: Ctx): RouteTarget | string | null {
  if (d.route) {
    const r = d.route(c);
    if (r !== undefined) return r;
  }
  if (d.on === 'obj' && c.o) {
    const kind = d.slot ?? 'any';
    if (kind === 'near' || kind === 'none' || !getDef(c.o.def).slots?.length) {
      if (getDef(c.o.def).mount === 'surface' || getDef(c.o.def).mount === 'wall' || getDef(c.o.def).mount === 'opening') {
        const [cx, cz] = g.world.centerOf(c.o);
        const base = g.world.occ.get(cellKey(c.o.l, Math.floor(cx), Math.floor(cz)));
        const bo = base ? g.world.objs.get(base) : undefined;
        if (bo) {
          // auf einer Theke: Platz der Theke nutzen, sonst daneben
          const st = slotTarget(g, s, bo, ['use', 'stand']);
          if (typeof st !== 'string') return { ...st, obj: undefined, slot: undefined, yaw: Math.atan2(cx - st.x, cz - st.z) };
          return nearTarget(g, cx, cz, c.o.l, g.world.cellsOf(bo));
        }
        if (getDef(c.o.def).mount === 'wall') {
          const [fx, fz] = rotLocal(0, 0.6, c.o.r);
          return { x: cx + fx, z: cz + fz, l: c.o.l, yaw: Math.atan2(-fx, -fz) };
        }
        return nearTarget(g, cx, cz, c.o.l);
      }
      return nearTarget(g, ...g.world.centerOf(c.o), c.o.l, g.world.cellsOf(c.o));
    }
    return slotTarget(g, s, c.o, kind === 'any' ? null : [kind]);
  }
  if (d.on === 'sim' && c.t) return nearTarget(g, c.t.x, c.t.z, c.t.l);
  if (d.on === 'pet' && c.p) return nearTarget(g, c.p.x, c.p.z, c.p.l);
  if (d.on === 'ground' && c.a.data) return { x: Number(c.a.data.x), z: Number(c.a.data.z), l: Number(c.a.data.l ?? 0) };
  return { x: s.x, z: s.z, l: s.l };
}

// ---------- Bewegung ----------
export function setPath(s: Sim, path: PathPoint[] | null): void {
  s.rt.path = path;
  s.rt.pathI = path && path.length > 1 ? 1 : 0;
  s.rt.stuck = 0;
}

export function speedOf(g: Game, s: Sim): number {
  let v = WALK;
  if (s.age === 'toddler') v = 0.75;
  else if (s.age === 'senior') v = 1.15;
  else if (s.age === 'child') v = 1.3;
  if (s.needs.bladder < 15 || s.queue[0]?.data?.hurry) v *= 1.6;
  if (s.needs.energy < 10) v *= 0.8;
  if (g.settings.reduceMotion) v *= 1;
  return v;
}

/** bewegt die Figur entlang ihres Weges; true = angekommen */
export function moveAlong(g: Game, s: Sim, dt: number): boolean {
  const p = s.rt.path;
  if (!p || s.rt.pathI >= p.length) return true;
  let remain = speedOf(g, s) * dt;
  while (remain > 0 && s.rt.pathI < p.length) {
    const tgt = p[s.rt.pathI]!;
    if (tgt.stair || tgt.l !== s.l) {
      // Treppe: gleichmäßig hinauf/hinab (Höhenversatz rt.y)
      const prev = p[s.rt.pathI - 1]!;
      const seg = Math.hypot(tgt.x - prev.x, tgt.z - prev.z) + 3;
      const dx = tgt.x - s.x,
        dz = tgt.z - s.z;
      const left = Math.hypot(dx, dz);
      const prog = clamp(1 - left / Math.max(0.01, Math.hypot(tgt.x - prev.x, tgt.z - prev.z)), 0, 1);
      const step = (remain / seg) * Math.hypot(tgt.x - prev.x, tgt.z - prev.z);
      if (left <= step || left < 0.02) {
        s.x = tgt.x;
        s.z = tgt.z;
        s.l = tgt.l;
        s.rt.y = 0;
        s.rt.pathI++;
        remain = 0;
      } else {
        s.x += (dx / left) * step;
        s.z += (dz / left) * step;
        s.rt.y = (tgt.l - prev.l) * LEVEL_H * clamp(prog + step / Math.max(0.01, Math.hypot(tgt.x - prev.x, tgt.z - prev.z)), 0, 1);
        s.rot = turnTo(s.rot, Math.atan2(dx, dz), dt);
        remain = 0;
      }
      continue;
    }
    const dx = tgt.x - s.x,
      dz = tgt.z - s.z;
    const d = Math.hypot(dx, dz);
    if (d <= remain) {
      s.x = tgt.x;
      s.z = tgt.z;
      remain -= d;
      s.rt.pathI++;
    } else {
      s.x += (dx / d) * remain;
      s.z += (dz / d) * remain;
      s.rot = turnTo(s.rot, Math.atan2(dx, dz), dt);
      remain = 0;
    }
  }
  return s.rt.pathI >= p.length;
}

export function turnTo(cur: number, target: number, dt: number): number {
  const d = wrapAngle(target - cur);
  const max = 10 * dt;
  return cur + clamp(d, -max, max);
}

// ---------- Autofahrt ----------
function nearestRoadZ(z: number): number {
  let best = ROADS_H[0]!,
    bd = 1e9;
  for (const r of ROADS_H) {
    const d = Math.abs((r[0] + r[1]) / 2 - z);
    if (d < bd) {
      bd = d;
      best = r;
    }
  }
  return (best[0] + best[1]) / 2;
}
export function carRoute(ax: number, az: number, bx: number, bz: number): [number, number][] {
  const za = nearestRoadZ(az),
    zb = nearestRoadZ(bz);
  const pts: [number, number][] = [
    [ax, az],
    [ax, za],
  ];
  if (za !== zb) {
    let vx = (ROADS_V[0]![0] + ROADS_V[0]![1]) / 2,
      best = 1e9;
    for (const v of ROADS_V) {
      const x = (v[0] + v[1]) / 2;
      const d = Math.abs(x - ax) + Math.abs(x - bx);
      if (d < best) {
        best = d;
        vx = x;
      }
    }
    pts.push([vx, za], [vx, zb]);
  }
  pts.push([bx, zb], [bx, bz]);
  return pts;
}
const polyLen = (pts: [number, number][]): number => {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  return l;
};
export function startTrip(g: Game, s: Sim, toLot: string, tx: number, tz: number): void {
  const from = g.lotOf(s) || s.loc;
  const [ax, az] = from && !from.startsWith('apt-') ? lotEntrance(from) : [s.x, s.z];
  const [bx, bz] = lotEntrance(toLot);
  const pts = carRoute(ax, az, bx, bz);
  s.trip = { pts, t: 0, len: polyLen(pts), to: toLot, tx, tz };
  s.away = { kind: 'travel', until: g.clock.min + polyLen(pts) / CAR + 2, lot: toLot };
  s.rt.path = null;
}
export function tripPos(s: Sim): [number, number, number] | null {
  const tr = s.trip;
  if (!tr) return null;
  let d = tr.t;
  for (let i = 1; i < tr.pts.length; i++) {
    const a = tr.pts[i - 1]!,
      b = tr.pts[i]!;
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= l || i === tr.pts.length - 1) {
      const t = l > 0 ? clamp(d / l, 0, 1) : 1;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[0] - a[0], b[1] - a[1])];
    }
    d -= l;
  }
  return null;
}
function tickTrip(g: Game, s: Sim, dt: number): void {
  const tr = s.trip!;
  tr.t += CAR * dt;
  if (tr.t >= tr.len) {
    const [ex, ez] = lotEntrance(tr.to);
    s.x = ex;
    s.z = ez;
    s.l = 0;
    s.loc = tr.to;
    s.trip = undefined;
    s.away = null;
    const q = s.queue[0];
    if (q && q.phase === 'route') q.phase = 'queued';
    g.bus.emit('visit', { sim: s.id, lot: tr.to });
  }
}

// ---------- Hauptschleife je Figur ----------
export function tickSim(g: Game, s: Sim, dt: number): void {
  if (s.trip) {
    tickTrip(g, s, dt);
    return;
  }
  if (s.away) return;
  const a = s.queue[0];
  if (!a) {
    s.rt.idle += dt;
    if (s.rt.anim !== 'idle' && s.rt.anim !== 'sit' && s.rt.anim !== 'sleep' && s.rt.anim !== 'baby' && s.rt.anim !== 'sitfloor') s.rt.anim = 'idle';
    if (s.rt.path) {
      moveAlong(g, s, dt);
      s.rt.anim = s.rt.path && s.rt.pathI < s.rt.path.length ? 'walk' : 'idle';
      if (s.rt.pathI >= (s.rt.path?.length ?? 0)) s.rt.path = null;
    }
    return;
  }
  s.rt.idle = 0;
  const d = idef(a.def);
  if (!d) {
    s.queue.shift();
    return;
  }
  const c = ctxOf(g, s, a);
  if (a.data?.cancelled && a.phase !== 'done') a.phase = 'done';
  switch (a.phase) {
    case 'queued':
      begin(g, s, a, d, c);
      break;
    case 'route':
      route(g, s, a, d, c, dt);
      break;
    case 'perform':
      perform(g, s, a, d, c, dt);
      break;
    case 'done':
      finish(g, s, a, d, c);
      break;
  }
}

function fail(g: Game, s: Sim, a: Action, why: string): void {
  if (a.user && g.isControllable(s)) g.notify(`${s.first}: ${why}`, '🚫', s.id, 'warn');
  g.bubble(s, '❓', 6);
  a.phase = 'done';
  a.data = { ...(a.data ?? {}), failed: 1 };
}

function begin(g: Game, s: Sim, a: Action, d: IDef, c: Ctx): void {
  const av = availability(g, d, c);
  if (av !== true) return fail(g, s, a, av === false ? 'Das geht gerade nicht' : av);
  // Sitzende/Liegende stehen erst auf
  standUp(g, s);
  const t = resolveRoute(g, s, d, c);
  if (t === null) {
    a.phase = 'perform';
    startPerform(g, s, a, d, c);
    return;
  }
  if (typeof t === 'string') return fail(g, s, a, t);
  if (t.obj && t.slot !== undefined) {
    if (!g.reserve(t.obj, t.slot, s.id)) return fail(g, s, a, 'Gerade besetzt');
    a.slot = t.slot;
    if (!a.obj) a.obj = t.obj.id;
  }
  a.data = { ...(a.data ?? {}), tx: t.x, tz: t.z, tl: t.l, ty: t.y ?? 0, tyaw: t.yaw ?? NaN };
  // weit weg und anderes Lot → Auto
  const tgtLot = g.world.lotAt(t.x, t.z)?.id;
  const here = g.lotOf(s);
  if (tgtLot && tgtLot !== here && Math.hypot(t.x - s.x, t.z - s.z) > 38 && s.l === 0) {
    startTrip(g, s, tgtLot, t.x, t.z);
    a.phase = 'route';
    return;
  }
  const goals = t.any?.length ? t.any : [{ x: t.x, z: t.z, l: t.l }];
  const path = findPath(g.world, s.x, s.z, s.l, goals, { allowLot: g.homeLotOf(s) ?? s.visit?.lot });
  if (!path) {
    g.release(s.id);
    return fail(g, s, a, 'Kommt dort nicht hin');
  }
  if (t.any?.length) {
    const last = path[path.length - 1]!;
    a.data.tx = last.x;
    a.data.tz = last.z;
    if (c.t || c.p || c.o) {
      const fx = c.t?.x ?? c.p?.x ?? (c.o ? g.world.centerOf(c.o)[0] : last.x);
      const fz = c.t?.z ?? c.p?.z ?? (c.o ? g.world.centerOf(c.o)[1] : last.z);
      a.data.tyaw = Math.atan2(fx - last.x, fz - last.z);
    }
  }
  setPath(s, path);
  a.phase = 'route';
}

function route(g: Game, s: Sim, a: Action, d: IDef, c: Ctx, dt: number): void {
  const arrived = moveAlong(g, s, dt);
  s.rt.anim = 'walk';
  if (!arrived) {
    // Hängenbleiben erkennen
    const moved = Math.hypot(s.x - s.rt.lastX, s.z - s.rt.lastZ);
    s.rt.lastX = s.x;
    s.rt.lastZ = s.z;
    if (moved < 0.001 * dt) {
      s.rt.stuck += dt;
      if (s.rt.stuck > 3) {
        a.fails = (a.fails ?? 0) + 1;
        if (a.fails > 2) return fail(g, s, a, 'Steckt fest – Weg blockiert');
        a.phase = 'queued';
      }
    }
    // soziales Ziel bewegt sich: Weg nachführen
    if (c.t && a.waitT === undefined && s.rt.path && s.rt.pathI >= s.rt.path.length - 1) {
      const last = s.rt.path[s.rt.path.length - 1]!;
      if (Math.hypot(c.t.x - last.x, c.t.z - last.z) > 2.5) a.phase = 'queued';
    }
    return;
  }
  s.rt.path = null;
  // Sozial: Ziel muss in der Nähe sein
  if (c.t && Math.hypot(c.t.x - s.x, c.t.z - s.z) > 2.6) {
    a.fails = (a.fails ?? 0) + 1;
    if (a.fails > 4) return fail(g, s, a, `${c.t.first} ist weggegangen`);
    a.phase = 'queued';
    return;
  }
  const data = a.data ?? {};
  if (Number.isFinite(Number(data.tyaw))) s.rot = Number(data.tyaw);
  // in den Platz setzen
  if (a.obj && a.slot !== undefined && c.o) {
    const w = g.world.slotWorld(c.o, a.slot);
    if (w && (w.kind === 'sit' || w.kind === 'sleep' || w.kind === 'stand' || w.kind === 'use')) {
      s.x = w.x;
      s.z = w.z;
      s.rot = w.yaw;
      s.rt.y = w.y;
    }
  }
  a.phase = 'perform';
  startPerform(g, s, a, d, c);
}

function startPerform(g: Game, s: Sim, a: Action, d: IDef, c: Ctx): void {
  if (d.start) {
    const r = d.start(c);
    if (typeof r === 'string') return fail(g, s, a, r);
    if (r === false) {
      a.phase = 'done';
      return;
    }
  }
  if (a.phase !== 'perform') return;
  a.dur = typeof d.dur === 'function' ? d.dur(c) : d.dur;
  a.t = 0;
  if (d.prop) s.rt.holding = d.prop;
  if (d.outfit) s.outfit = d.outfit;
}

function perform(g: Game, s: Sim, a: Action, d: IDef, c: Ctx, dt: number): void {
  s.rt.anim = typeof d.anim === 'function' ? d.anim(c) : d.anim;
  const mult = g.settings.needsDecay;
  if (d.rate) for (const n of NEED_IDS) if (d.rate[n]) g.addNeed(s, n, d.rate[n]! * dt * (d.rate[n]! > 0 ? 1 : mult));
  if (d.skill && d.xp) g.addSkill(s, d.skill, d.xp * dt);
  d.tick?.(c, dt);
  if (a.phase !== 'perform') return;
  a.t += dt;
  if (c.t && !c.t.away) s.rot = turnTo(s.rot, Math.atan2(c.t.x - s.x, c.t.z - s.z), dt);
  const full = d.until ? s.needs[d.until] >= 99.5 : false;
  if ((a.dur > 0 && a.t >= a.dur) || full) {
    d.done?.(c);
    g.bus.emit('interaction', { sim: s.id, id: d.goal ?? d.id, obj: c.o?.def, target: c.t?.id });
    a.phase = 'done';
  }
}

function finish(g: Game, s: Sim, a: Action, d: IDef, c: Ctx): void {
  d.end?.(c);
  s.queue = s.queue.filter((x) => x !== a);
  g.release(s.id, a.obj);
  if (s.rt.holding && d.prop) s.rt.holding = null;
  if (d.outfit && d.outfit !== 'everyday' && !s.queue.some((q) => idef(q.def)?.outfit === d.outfit)) s.outfit = 'everyday';
  s.rt.socialWith = null;
  const next = s.queue[0];
  const nextSameSeat = next && next.obj === a.obj && next.slot === a.slot;
  if (!nextSameSeat) standUp(g, s);
  s.rt.anim = 'idle';
}

/** Figur verlässt Sitz/Bett: auf eine freie Nachbarzelle stellen */
export function standUp(g: Game, s: Sim): void {
  if (s.rt.y <= 0.01 && g.world.cellWalkable(s.l, Math.floor(s.x), Math.floor(s.z))) return;
  if (s.rt.anim === 'walk') return;
  s.rt.y = 0;
  const cx = Math.floor(s.x),
    cz = Math.floor(s.z);
  if (g.world.cellWalkable(s.l, cx, cz)) return;
  // vorwärts aus dem Objekt
  const fx = Math.sin(s.rot),
    fz = Math.cos(s.rot);
  const tries: [number, number][] = [
    [Math.floor(s.x + fx * 0.8), Math.floor(s.z + fz * 0.8)],
    [cx + 1, cz],
    [cx - 1, cz],
    [cx, cz + 1],
    [cx, cz - 1],
    [cx + 1, cz + 1],
    [cx - 1, cz - 1],
    [cx + 1, cz - 1],
    [cx - 1, cz + 1],
  ];
  for (const [x, z] of tries)
    if (g.world.cellWalkable(s.l, x, z) && !g.world.wallBetween(s.l, cx, cz, x, z)) {
      s.x = x + 0.5;
      s.z = z + 0.5;
      return;
    }
}

/** Hilfen für Interaktionsdefinitionen */
export function objFront(g: Game, o: ObjInst): [number, number] {
  const def = getDef(o.def);
  const [cx, cz] = g.world.centerOf(o);
  const [fx, fz] = rotLocal(0, def.d / 2 + 0.5, o.r);
  return [cx + fx, cz + fz];
}
export function footprintSize(o: ObjInst): [number, number] {
  return dimsOf(getDef(o.def), o.r);
}
