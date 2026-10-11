// Fahrzeuge ohne Grafik (testbar): Boot auf dem Wasser, Lore auf Schienen.
// Ein Fahrzeug fährt nur mit Fahrer selbst, ohne Fahrer treibt es aus bzw. rollt aus.
// Spielstand: veh = [[art, x, y, z, Richtung], …] (Fahrer wird nicht gespeichert).
import { B } from './blocks.js';
import { I } from './items.js';

export const MAX_VEH = 64;
export const KINDS = {
  boot: { item: I.BOAT, half: 0.6, h: 0.55, seat: 0.25, max: 7, name: 'Boot' },
  lore: { item: I.MINECART, half: 0.45, h: 0.75, seat: 0.3, max: 10, name: 'Lore' }
};
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // +x, +z, −x, −z
const yawOf = (dx, dz) => Math.atan2(-dx, -dz);       // Blickrichtung wie beim Spieler (−Z = 0)
const GAP = 1e-3;

export class Vehicle {
  constructor(kind, x, y, z, yaw = 0) {
    this.kind = kind; this.K = KINDS[kind];
    this.x = x; this.y = y; this.z = z; this.yaw = yaw;
    this.speed = 0; this.vy = 0; this.rider = false; this.t = 0; // t: Animation (Paddel, Räder)
    this.rail = null; // Lore auf Schiene: { x, y, z, d, p } d = Richtungs-Index, p = Weg ab Zellmitte (0..1)
  }
}

export class Vehicles {
  constructor(world, saved) {
    this.world = world; this.list = [];
    this.onAdd = () => {}; this.onRemove = () => {};
    if (Array.isArray(saved)) for (const e of saved) {
      if (!Array.isArray(e) || !KINDS[e[0]] || !e.slice(1, 5).every(Number.isFinite) || this.list.length >= MAX_VEH) continue;
      this.list.push(new Vehicle(e[0], e[1], e[2], e[3], e[4]));
    }
  }
  // Ansicht nachträglich anmelden (geladene Fahrzeuge)
  attach() { for (const v of this.list) this.onAdd(v); }

  add(kind, x, y, z, yaw = 0) {
    if (!KINDS[kind] || this.list.length >= MAX_VEH) return null;
    const v = new Vehicle(kind, x, y, z, yaw);
    if (kind === 'lore' && !this.snapRail(v, yaw)) return null;
    this.list.push(v); this.onAdd(v);
    return v;
  }
  remove(v) {
    const i = this.list.indexOf(v);
    if (i < 0) return;
    this.list.splice(i, 1); this.onRemove(v);
  }
  clear() { for (const v of this.list.slice()) this.remove(v); }
  serialize() { return this.list.map(v => [v.kind, +v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2), +v.yaw.toFixed(2)]); }

  // Strahl gegen die Fahrzeug-Quader; Rückgabe { veh, t } oder null
  raycast(ox, oy, oz, dx, dy, dz, reach) {
    let best = null;
    for (const v of this.list) {
      const h = v.K.half, lo = [v.x - h, v.y, v.z - h], hi = [v.x + h, v.y + v.K.h, v.z + h], o = [ox, oy, oz], d = [dx, dy, dz];
      let t0 = 0, t1 = reach;
      for (let a = 0; a < 3 && t0 <= t1; a++) {
        if (Math.abs(d[a]) < 1e-9) { if (o[a] < lo[a] || o[a] > hi[a]) t0 = Infinity; continue; }
        let u = (lo[a] - o[a]) / d[a], w = (hi[a] - o[a]) / d[a];
        if (u > w) [u, w] = [w, u];
        t0 = Math.max(t0, u); t1 = Math.min(t1, w);
      }
      if (t0 <= t1 && (!best || t0 < best.t)) best = { veh: v, t: t0 };
    }
    return best;
  }

  // inp (nur für das gefahrene Fahrzeug): { f, r, look: [x, z] Blickrichtung }
  update(dt, ridden, inp) {
    for (const v of this.list) {
      const w = this.world;
      if (w.isLoaded && !w.isLoaded(Math.floor(v.x), Math.floor(v.z))) continue; // ungeladen: einfrieren
      const n = Math.max(1, Math.ceil(dt * 60 - 1e-9)), h = dt / n, i = v === ridden ? inp : null;
      for (let k = 0; k < n; k++) v.kind === 'boot' ? this.stepBoat(v, h, i) : this.stepCart(v, h, i);
      v.t += dt * Math.abs(v.speed);
    }
  }

  // ---------- Boot ----------
  // Wasseroberfläche unter dem Boot (oberstes Wasser + 1 − 0,12), sonst null
  waterTop(x, y, z) {
    const w = this.world, bx = Math.floor(x), bz = Math.floor(z);
    let by = Math.floor(y + 0.3);
    if (w.getBlock(bx, by, bz) !== B.WATER) { by--; if (w.getBlock(bx, by, bz) !== B.WATER) return null; }
    for (let k = 0; k < 4 && w.getBlock(bx, by + 1, bz) === B.WATER; k++) by++;
    return by + 1 - 0.12;
  }
  boxHits(v, x, y, z) {
    const w = this.world, h = v.K.half;
    for (let by = Math.floor(y); by <= Math.floor(y + v.K.h - 1e-7); by++)
      for (let bz = Math.floor(z - h); bz <= Math.floor(z + h - 1e-7); bz++)
        for (let bx = Math.floor(x - h); bx <= Math.floor(x + h - 1e-7); bx++) if (w.isSolid(bx, by, bz)) return true;
    return false;
  }
  stepBoat(v, dt, inp) {
    const top = this.waterTop(v.x, v.y, v.z), floating = top !== null;
    if (inp) { // Lenken mit links/rechts, Schub mit vor/zurück
      v.yaw -= inp.r * 1.9 * dt * (floating ? 1 : 0.3);
      v.speed += inp.f * (floating ? 5 : 1.2) * dt;
    }
    const max = floating ? v.K.max : 1.2;
    v.speed = Math.max(-max * 0.5, Math.min(max, v.speed));
    v.speed -= v.speed * Math.min(1, (floating ? 0.6 : 4) * dt); // Wasser- bzw. Bodenreibung
    if (Math.abs(v.speed) < 0.01) v.speed = 0;
    // senkrecht: schwimmen (Feder zur Oberfläche) oder fallen
    if (floating) { v.vy += ((top - 0.3) - v.y) * 30 * dt; v.vy -= v.vy * Math.min(1, 6 * dt); }
    else v.vy = Math.max(-30, v.vy - 25 * dt);
    const dx = -Math.sin(v.yaw) * v.speed * dt, dz = -Math.cos(v.yaw) * v.speed * dt;
    if (this.boxHits(v, v.x + dx, v.y, v.z)) v.speed *= 0.2; else v.x += dx;
    if (this.boxHits(v, v.x, v.y, v.z + dz)) v.speed *= 0.2; else v.z += dz;
    const ny = v.y + v.vy * dt;
    if (this.boxHits(v, v.x, ny, v.z)) { if (v.vy < 0) v.y = Math.floor(ny) + 1 + GAP; v.vy = 0; }
    else v.y = ny;
  }

  // ---------- Lore ----------
  isRail(x, y, z) { return this.world.getBlock(x, y, z) === B.RAIL; }
  // nächste Schienenzelle von (x, y, z) in Richtung d: gleiche Höhe, eine Stufe hoch oder runter
  nextRail(x, y, z, d) {
    const [dx, dz] = DIRS[d];
    for (const dy of [0, 1, -1]) if (this.isRail(x + dx, y + dy, z + dz)) return [x + dx, y + dy, z + dz];
    return null;
  }
  // Lore auf die Schiene unter sich setzen; Richtung möglichst nach yaw
  snapRail(v, yaw) {
    const x = Math.floor(v.x), z = Math.floor(v.z);
    let y = Math.floor(v.y + 0.5);
    if (!this.isRail(x, y, z)) { y--; if (!this.isRail(x, y, z)) return false; }
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const order = [0, 1, 2, 3].sort((a, b) => (DIRS[b][0] * fx + DIRS[b][1] * fz) - (DIRS[a][0] * fx + DIRS[a][1] * fz));
    const d = order.find(k => this.nextRail(x, y, z, k)) ?? order[0];
    v.rail = { x, y, z, d, p: 0 }; v.speed = 0; v.vy = 0;
    this.placeOnRail(v);
    return true;
  }
  placeOnRail(v) {
    const r = v.rail, [dx, dz] = DIRS[r.d], nx = this.nextRail(r.x, r.y, r.z, r.d);
    const ny = nx ? nx[1] : r.y;
    v.x = r.x + 0.5 + dx * r.p; v.z = r.z + 0.5 + dz * r.p; v.y = r.y + 0.0625 + (ny - r.y) * r.p;
    v.yaw = yawOf(dx, dz);
  }
  stepCart(v, dt, inp) {
    const r = v.rail;
    if (!r || !this.isRail(r.x, r.y, r.z)) { // entgleist: fällt und bleibt liegen, bis wieder eine Schiene darunter liegt
      v.rail = null; v.speed = 0;
      v.vy = Math.max(-30, v.vy - 25 * dt);
      const ny = v.y + v.vy * dt;
      if (this.boxHits(v, v.x, ny, v.z)) { if (v.vy < 0) v.y = Math.floor(ny) + 1 + GAP; v.vy = 0; } else v.y = ny;
      if (v.vy === 0) this.snapRail(v, v.yaw);
      return;
    }
    if (inp) { // vor = in Blickrichtung anschieben (fast stehend auch rückwärts), zurück = bremsen
      const look = inp.look || DIRS[r.d];
      if (inp.f > 0.2 && v.speed < 0.3 && look[0] * DIRS[r.d][0] + look[1] * DIRS[r.d][1] < -0.2) {
        const nx = this.nextRail(r.x, r.y, r.z, r.d);
        r.d = (r.d + 2) % 4;
        if (nx && r.p > 0) { r.x = nx[0]; r.y = nx[1]; r.z = nx[2]; r.p = 1 - r.p; }
      }
      v.speed += (inp.f > 0 ? inp.f * 4 : inp.f * 8) * dt;
    }
    const nx = this.nextRail(r.x, r.y, r.z, r.d);
    if (nx) v.speed -= (nx[1] - r.y) * 7 * dt; // bergauf bremst, bergab schiebt
    v.speed -= v.speed * Math.min(1, 0.25 * dt);
    v.speed = Math.max(0, Math.min(v.K.max, v.speed));
    if (v.speed < 0.02) v.speed = 0;
    let move = v.speed * dt;
    for (let guard = 0; move > 0 && guard < 4; guard++) {
      const next = this.nextRail(r.x, r.y, r.z, r.d);
      if (!next) { // Ende der Schiene: an der Zellmitte anhalten
        r.p = 0; v.speed = 0; break;
      }
      const left = 1 - r.p;
      if (move < left) { r.p += move; move = 0; break; }
      move -= left; r.x = next[0]; r.y = next[1]; r.z = next[2]; r.p = 0;
      // Abzweig: geradeaus, sonst links/rechts (Kurve an der Zellmitte)
      if (!this.nextRail(r.x, r.y, r.z, r.d)) {
        const turn = [1, 3].map(k => (r.d + k) % 4).find(k => this.nextRail(r.x, r.y, r.z, k));
        if (turn !== undefined) { r.d = turn; v.speed *= 0.85; }
      }
    }
    this.placeOnRail(v);
  }

  // Aussteigen: freie Stelle neben oder über dem Fahrzeug für einen Spieler (Breite 0,6, Höhe 1,8)
  exitSpot(v, collides) {
    const tries = [[0, v.K.h + 0.05, 0], [1.2, 0.1, 0], [-1.2, 0.1, 0], [0, 0.1, 1.2], [0, 0.1, -1.2], [1.2, 1.1, 0], [-1.2, 1.1, 0], [0, 1.1, 1.2], [0, 1.1, -1.2]];
    for (const [dx, dy, dz] of tries) if (!collides(v.x + dx, v.y + dy, v.z + dz)) return [v.x + dx, v.y + dy, v.z + dz];
    return [v.x, v.y + v.K.h + 0.05, v.z];
  }
}
