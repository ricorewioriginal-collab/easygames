// Tiere (Entity-System) ohne Grafik: Verhalten, Physik, Aktivitätsstufen, Speicherung je Chunk.
// Aktivitätsstufen: nah (< 24 Blöcke) jedes Bild, mittel (bis Aktivradius) 4× je Sekunde,
// außerhalb des Aktivradius im Chunk-Speicher (keine Rechenzeit), Chunk nicht geladen = eingefroren.
import { B, SOLID } from './blocks.js';
import { CS, H, SEA } from './consts.js';
import { hash } from './noise.js';
import { I } from './items.js';

// drops: [Id, min, max]
export const MOB_TYPES = [
  { key: 'huhn', name: 'Huhn', hp: 3, half: 0.25, h: 0.8, speed: 1.5, drops: [[I.MEAT_RAW, 1, 1]] },
  { key: 'schaf', name: 'Schaf', hp: 5, half: 0.42, h: 1.2, speed: 1.2, drops: [[I.MEAT_RAW, 1, 2], [B.WOOL, 1, 2]] },
  { key: 'kuh', name: 'Kuh', hp: 6, half: 0.45, h: 1.4, speed: 1.1, drops: [[I.MEAT_RAW, 2, 3]] },
  // Gegner: nachts an der Oberfläche, jederzeit in tiefen Höhlen; werden nicht gespeichert
  { key: 'rauschling', name: 'Rauschling', hp: 8, half: 0.3, h: 1.7, speed: 2.4, hostile: true, dmg: 2, drops: [[B.CRYSTAL, 0, 1]] }
];
export const HOSTILE_MAX = 4;     // gleichzeitig höchstens
const SIGHT = 18;                  // Sichtweite der Gegner (Blöcke)

// freie Sichtlinie zwischen zwei Punkten (Schritte von 0,4 Blöcken, feste Blöcke verdecken)
export function lineOfSight(w, x0, y0, z0, x1, y1, z1) {
  const d = Math.hypot(x1 - x0, y1 - y0, z1 - z0), n = Math.ceil(d / 0.4);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (w.isSolid(Math.floor(x0 + (x1 - x0) * t), Math.floor(y0 + (y1 - y0) * t), Math.floor(z0 + (z1 - z0) * t))) return false;
  }
  return true;
}
export const ACTIVE_R = 3;   // Aktivradius in Chunks
export const MAX_MOBS = 40;  // Obergrenze gleichzeitig aktiver Tiere
const NEAR = 24;
const GROUND = new Set([B.GRASS, B.FLOWERS, B.SNOW, B.MYCEL]);
const keyOf = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

export class Mob {
  constructor(type, x, y, z, hp) {
    const T = MOB_TYPES[type];
    this.type = type; this.T = T; this.x = x; this.y = y; this.z = z; this.hp = hp ?? T.hp;
    this.vx = 0; this.vy = 0; this.vz = 0; this.yaw = 0; this.onGround = false;
    this.walk = 0; this.timer = 0; this.flee = 0; this.hurtT = 0; this.acc = 0; this.moving = false;
    this.hostile = !!T.hostile; this.sees = false; this.seeT = 0; this.atkT = 0; this.attack = false;
  }

  collides(w, x, y, z) {
    const h = this.T.half;
    const x0 = Math.floor(x - h), x1 = Math.floor(x + h - 1e-7), z0 = Math.floor(z - h), z1 = Math.floor(z + h - 1e-7);
    const y0 = Math.floor(y), y1 = Math.floor(y + this.T.h - 1e-7);
    for (let by = y0; by <= y1; by++) for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) if (w.isSolid(bx, by, bz)) return true;
    return false;
  }

  move(w, axis, d) {
    if (!d) return false;
    const old = this[axis];
    this[axis] += d;
    if (!this.collides(w, this.x, this.y, this.z)) return false;
    this[axis] = old;
    if (axis === 'y') { if (d < 0) this.onGround = true; this.vy = 0; }
    return true;
  }

  // rnd: Zufallsfunktion (für Tests austauschbar); px/pz: Spieler (für Flucht)
  update(w, dt, rnd, px, pz, py = this.y) {
    if (!w.isLoaded(Math.floor(this.x), Math.floor(this.z))) return; // Bereich nicht geladen: einfrieren
    const T = this.T;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.timer -= dt;
    if (this.hostile) { // Gegner: Spieler sehen, verfolgen, angreifen
      this.atkT -= dt; this.seeT -= dt;
      const d = Math.hypot(px - this.x, pz - this.z);
      if (this.seeT <= 0) { this.seeT = 0.5; this.sees = d < SIGHT && lineOfSight(w, this.x, this.y + 1.5, this.z, px, py + 1.6, pz); }
      if (this.sees && d > 0.8) { this.walk = 1; this.yaw = Math.atan2(-(px - this.x), -(pz - this.z)); this.timer = 0.5; }
      if (this.sees && d < 1.5 && Math.abs(py - this.y) < 1.8 && this.atkT <= 0) { this.atkT = 1; this.attack = true; }
    }
    if (this.hostile && this.sees) { /* Verfolgung hat Vorrang */ } else if (this.flee > 0) {
      this.flee -= dt; this.walk = 1;
      this.yaw = Math.atan2(-(this.x - px), -(this.z - pz)); // vom Spieler weg
    } else if (this.timer <= 0) { // neue Absicht: laufen oder stehen
      if (rnd() < 0.55) { this.walk = 1; this.yaw = rnd() * Math.PI * 2; this.timer = 1 + rnd() * 3; }
      else { this.walk = 0; this.timer = 2 + rnd() * 4; }
    }
    const fx = Math.floor(this.x), fz = Math.floor(this.z);
    const inWater = w.getBlock(fx, Math.floor(this.y + 0.3), fz) === B.WATER;
    let sp = this.walk ? T.speed * (this.flee > 0 ? 2.2 : 1) : 0;
    let dx = -Math.sin(this.yaw), dz = -Math.cos(this.yaw);
    // nicht über Kanten (> 3 Blöcke) oder ins tiefe Wasser laufen
    if (sp && this.onGround && !this.sees) {
      const ax = Math.floor(this.x + dx * (T.half + 0.6)), az = Math.floor(this.z + dz * (T.half + 0.6));
      let drop = 0;
      for (let y = Math.floor(this.y) - 1; drop < 4 && y > 0 && !SOLID[w.getBlock(ax, y, az)]; y--) { drop++; if (w.getBlock(ax, y, az) === B.WATER && !this.flee) { drop = 9; break; } }
      if (drop > 3) { this.yaw += Math.PI * (0.5 + rnd()); this.timer = 0.5 + rnd(); dx = -dx; dz = -dz; sp *= 0.3; }
    }
    if (this.hostile && this.sees && Math.hypot(px - this.x, pz - this.z) < 0.9) sp = 0; // nicht in den Spieler laufen
    this.vx = dx * sp; this.vz = dz * sp;
    if (inWater) { this.vy = Math.min(2, this.vy + 20 * dt); }
    else this.vy = Math.max(-40, this.vy - 28 * dt);
    const bx = this.move(w, 'x', this.vx * dt), bz = this.move(w, 'z', this.vz * dt);
    this.onGround = false;
    this.move(w, 'y', this.vy * dt);
    // Hindernis: einen Block hochspringen, sonst umdrehen
    if ((bx || bz) && sp) {
      if (this.onGround && !this.collides(w, this.x, this.y + 1.05, this.z)) this.vy = 7.2;
      else if (this.onGround) { this.yaw += Math.PI * (0.5 + rnd()); this.timer = 0.5; }
    }
    if (this.y < -10) this.y = H; // Sicherheitsnetz
    this.moving = sp > 0 && (Math.abs(this.vx) + Math.abs(this.vz)) > 0.1;
  }

  // Treffer: Rückgabe true = erlegt
  hit(dmg, px, pz) {
    this.hp -= dmg; this.hurtT = 0.35; if (!this.hostile) this.flee = 3.5;
    const d = Math.hypot(this.x - px, this.z - pz) || 1;
    this.x += (this.x - px) / d * 0.15; this.z += (this.z - pz) / d * 0.15; this.vy = 4.5;
    return this.hp <= 0;
  }

  record() { return [this.type, +this.x.toFixed(2), +this.y.toFixed(2), +this.z.toFixed(2), this.hp]; }
}

// Strahl gegen Quader (Slab-Test): Abstand oder Infinity
export function rayBox(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
  let t0 = 0, t1 = Infinity;
  const o = [ox, oy, oz], d = [dx, dy, dz], lo = [x0, y0, z0], hi = [x1, y1, z1];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (o[i] < lo[i] || o[i] > hi[i]) return Infinity; continue; }
    let a = (lo[i] - o[i]) / d[i], b = (hi[i] - o[i]) / d[i];
    if (a > b) { const t = a; a = b; b = t; }
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 > t1) return Infinity;
  }
  return t0;
}

export class Mobs {
  // store: { chunkKey: [[type, x, y, z, hp], …] } aus dem Spielstand. Leere Liste = Chunk hatte Tiere, alle weg.
  constructor(world, seed, store, enabled = true) {
    this.world = world; this.seed = seed | 0; this.enabled = enabled;
    this.store = new Map();
    if (store && typeof store === 'object') for (const k of Object.keys(store)) {
      const v = store[k], key = Number(k);
      if (!Array.isArray(v) || !Number.isFinite(key)) continue;
      this.store.set(key, v.filter(r => Array.isArray(r) && MOB_TYPES[r[0]] && !MOB_TYPES[r[0]].hostile && r.slice(1, 5).every(Number.isFinite)));
    }
    this.list = []; this.active = new Set(); this.lastPC = null; this.rnd = Math.random;
    this.onAdd = () => {}; this.onRemove = () => {}; this.onAttack = () => {}; this.onPoof = () => {};
    this.day = true; this.spawnT = 3;
  }

  // einmalige, feste Erstbesiedlung eines Chunks (gleicher Startwert = gleiche Tiere)
  spawnRecords(cx, cz) {
    const s = this.seed + 9001;
    if (hash(cx, cz, s) > 0.2) return null;
    const c = this.world.getChunk(cx, cz);
    if (!c) return null;
    const type = Math.floor(hash(cx, cz, s + 1) * MOB_TYPES.length), n = 2 + Math.floor(hash(cx, cz, s + 2) * 3), out = [];
    for (let i = 0; i < n * 3 && out.length < n; i++) {
      const x = Math.floor(hash(cx * 31 + i, cz, s + 3) * CS), z = Math.floor(hash(cx, cz * 31 + i, s + 4) * CS);
      const idx = x + z * CS;
      let y = Math.min(H - 3, c.maxY + 1);
      while (y > 0 && c.data[idx + y * 256] === B.AIR) y--;
      const top = c.data[idx + y * 256];
      if (!GROUND.has(top) || y < SEA || c.data[idx + (y + 1) * 256] !== B.AIR || c.data[idx + (y + 2) * 256] !== B.AIR) continue;
      out.push([type, cx * CS + x + 0.5, y + 1, cz * CS + z + 0.5, MOB_TYPES[type].hp]);
    }
    return out.length ? out : null;
  }

  activate(key, cx, cz) {
    this.active.add(key);
    let recs = this.store.get(key);
    if (recs) this.store.delete(key);
    else recs = this.spawnRecords(cx, cz);
    if (!recs) return;
    if (!recs.length) { this.store.set(key, recs); return; } // Chunk bleibt als „besiedelt“ markiert
    for (const r of recs) {
      if (this.list.length >= MAX_MOBS) { this.stash(r); continue; }
      const m = new Mob(r[0], r[1], r[2], r[3], r[4]);
      m.yaw = hash(Math.floor(r[1]), Math.floor(r[3]), 5) * 6.28;
      this.list.push(m); this.onAdd(m);
    }
  }

  stash(rec) {
    const key = keyOf(Math.floor(rec[1] / CS), Math.floor(rec[3] / CS));
    let a = this.store.get(key);
    if (!a) this.store.set(key, a = []);
    a.push(rec);
  }

  remove(m, keep) {
    const i = this.list.indexOf(m);
    if (i < 0) return;
    this.list.splice(i, 1); this.onRemove(m);
    if (this.hostile(m)) return; // Gegner werden nicht gespeichert
    if (keep) this.stash(m.record());
    else { // Chunk bleibt markiert, damit dort nicht neu besiedelt wird
      const key = keyOf(Math.floor(m.x / CS), Math.floor(m.z / CS));
      if (!this.store.has(key) && !this.active.has(key)) this.store.set(key, []);
    }
  }

  hostile(m) { return m.hostile; }
  hostileCount() { let n = 0; for (const m of this.list) if (m.hostile) n++; return n; }

  // Gegner erscheinen 14–26 Blöcke entfernt: nachts auf freiem Himmel, in tiefen Höhlen (unter Meereshöhe − 4) jederzeit.
  // Rückgabe: neuer Gegner oder null
  spawnHostile(px, py, pz, night, rnd = this.rnd) {
    if (this.hostileCount() >= HOSTILE_MAX || this.list.length >= MAX_MOBS) return null;
    for (let tries = 0; tries < 6; tries++) {
      const a = rnd() * Math.PI * 2, r = 14 + rnd() * 12;
      const x = Math.floor(px + Math.cos(a) * r), z = Math.floor(pz + Math.sin(a) * r);
      const c = this.world.getChunk(x >> 4, z >> 4);
      if (!c) continue;
      const hm = this.world.heightmap(c)[(x & 15) + (z & 15) * CS];
      for (let y = Math.min(H - 3, Math.floor(py) + 8); y > Math.max(1, Math.floor(py) - 10); y--) {
        if (!SOLID[this.world.getBlock(x, y - 1, z)] || this.world.getBlock(x, y - 1, z) === B.WATER) continue;
        if (this.world.getBlock(x, y, z) !== B.AIR || this.world.getBlock(x, y + 1, z) !== B.AIR) continue;
        const open = y >= hm, deep = !open && y < SEA - 4;
        if ((open && night) || deep) {
          const m = new Mob(3, x + 0.5, y, z + 0.5);
          m.yaw = rnd() * 6.28; this.list.push(m); this.onAdd(m);
          return m;
        }
        break; // nur die oberste freie Stelle dieser Säule
      }
    }
    return null;
  }

  // Aktivbereich um den Spieler pflegen (nur bei Chunkwechsel oder wenn neue Chunks geladen sind)
  refresh(px, pz) {
    if (!this.enabled) return;
    const pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS);
    for (let dz = -ACTIVE_R; dz <= ACTIVE_R; dz++) for (let dx = -ACTIVE_R; dx <= ACTIVE_R; dx++) {
      const cx = pcx + dx, cz = pcz + dz, key = keyOf(cx, cz);
      if (this.active.has(key) || !this.world.getChunk(cx, cz)) continue;
      this.activate(key, cx, cz);
    }
    for (const key of this.active) {
      const cx = Math.floor(key / 65536) - 32768, cz = (key % 65536) - 32768;
      if (Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) <= ACTIVE_R + 1) continue;
      this.active.delete(key);
      // gespeicherte Markierung „alle weg“ bleibt erhalten
    }
    // Tiere außerhalb des Aktivbereichs ablegen, Gegner verschwinden (zu weit weg oder Tageslicht an der Oberfläche)
    for (const m of this.list.slice()) {
      const key = keyOf(Math.floor(m.x / CS), Math.floor(m.z / CS));
      if (m.hostile) {
        const far = Math.hypot(m.x - px, m.z - pz) > 40;
        const c = this.world.getChunk(Math.floor(m.x) >> 4, Math.floor(m.z) >> 4);
        const open = c && Math.floor(m.y) >= this.world.heightmap(c)[(Math.floor(m.x) & 15) + (Math.floor(m.z) & 15) * CS];
        if (far || (this.day && open)) { this.onPoof(m); this.remove(m, false); }
      } else if (!this.active.has(key)) this.remove(m, true);
    }
  }

  // env: { py, night, hostiles } – Spielerhöhe, Nacht, Gegner erlaubt
  update(dt, px, pz, env = {}) {
    if (!this.enabled) return;
    const py = env.py ?? 0;
    this.day = !env.night;
    if (env.hostiles) { this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnT = 3; this.spawnHostile(px, py, pz, !!env.night); } }
    else if (this.hostileCount()) for (const m of this.list.slice()) if (m.hostile) this.remove(m, false);
    const pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS);
    if (!this.lastPC || this.lastPC[0] !== pcx || this.lastPC[1] !== pcz || (this.refreshT = (this.refreshT || 0) - dt) <= 0) {
      this.lastPC = [pcx, pcz]; this.refreshT = 1; this.refresh(px, pz);
    }
    for (const m of this.list) {
      const d = Math.hypot(m.x - px, m.z - pz);
      if (d < NEAR || m.flee > 0 || m.hostile) m.update(this.world, dt, this.rnd, px, pz, py);
      else { m.acc += dt; if (m.acc >= 0.25) { m.update(this.world, Math.min(m.acc, 0.25), this.rnd, px, pz, py); m.acc = 0; } }
      if (m.attack) { m.attack = false; this.onAttack(m); }
    }
  }

  // nächstes Tier auf dem Strahl
  raycast(ox, oy, oz, dx, dy, dz, reach) {
    let best = null, bt = reach;
    for (const m of this.list) {
      const h = m.T.half;
      const t = rayBox(ox, oy, oz, dx, dy, dz, m.x - h, m.y, m.z - h, m.x + h, m.y + m.T.h, m.z + h);
      if (t < bt) { bt = t; best = m; }
    }
    return best ? { mob: best, t: bt } : null;
  }

  // Spielstand: aktive Tiere plus Speicher
  serialize() {
    const out = {};
    for (const [k, a] of this.store) out[k] = a.slice();
    for (const key of this.active) if (!out[key]) out[key] = []; // besiedelte aktive Chunks markieren
    for (const m of this.list) {
      if (m.hostile) continue;
      const key = keyOf(Math.floor(m.x / CS), Math.floor(m.z / CS));
      (out[key] || (out[key] = [])).push(m.record());
    }
    // aktive Chunks ohne Erstbesiedlung brauchen keinen Eintrag
    for (const key of this.active) {
      if (out[key].length) continue;
      const cx = Math.floor(key / 65536) - 32768, cz = (key % 65536) - 32768;
      if (hash(cx, cz, this.seed + 9001) > 0.2) delete out[key];
    }
    return out;
  }

  clear() { for (const m of this.list) this.onRemove(m); this.list = []; this.active.clear(); }
}

// Beute eines Tieres (rnd für Tests austauschbar)
export function rollDrops(type, rnd = Math.random) {
  return MOB_TYPES[type].drops.map(([id, a, b]) => [id, a + Math.floor(rnd() * (b - a + 1))]).filter(([, n]) => n > 0);
}
