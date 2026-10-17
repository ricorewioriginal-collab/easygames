// Statische 3D-Welt eines Gleisnetzes: Chunks (500 m) werden um die Kamera gestreamt; Himmel, Licht, Wetter, Signale, Schranken.
import * as THREE from 'three';
import type { Network } from '../../railway/network';
import { chunkSteps, gridSample, type Chunk, type QP } from './chunk';
import { CH, WorldCtx, ckey } from './ctx';
import { F_TUN, type Near } from './field';
import { Precip, Sky } from './sky';

export interface WorldQuality { level: 'low' | 'mid' | 'high'; viewDist: number; shadows: boolean }
export interface WorldEnv {
  timeOfDay: number;
  weather: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  signalAspect: (signalId: string) => 'stop' | 'go' | 'slow' | 'caution';
  crossingClosed: (crossingId: string) => number;
  lightning?: boolean;
}

const LEVELS: Record<WorldQuality['level'], Omit<QP, 'level' | 'cell' | 'shadows' | 'maxTex'> & { precip: number }> = {
  low: { n: 24, nFar: 24, lodDist: 0, trees: 14, houses: 3, people: 0.012, sleepers3d: false, wires: false, precip: 1200 },
  mid: { n: 32, nFar: 16, lodDist: 1000, trees: 40, houses: 7, people: 0.035, sleepers3d: false, wires: true, precip: 2500 },
  high: { n: 48, nFar: 24, lodDist: 1500, trees: 80, houses: 12, people: 0.07, sleepers3d: true, wires: true, precip: 5000 },
};
/** Zeitbudget für Chunkaufbau je Frame (ms) */
const BUDGET = 4;
const SLEEPER_DIST = 800;

const col = (hex: number) => new THREE.Color(hex);
const L_RED = col(0xff2a14), L_YEL = col(0xffb01a), L_GRN = col(0x2aff6a), L_WHT = col(0xfff6e0), L_OFF = col(0x141414);
const ASPECT: Record<string, number> = { stop: 0, go: 1, slow: 2, caution: 3 };

export class WorldView {
  readonly sun: THREE.DirectionalLight;
  readonly ambient: THREE.HemisphereLight;
  private readonly ctx: WorldCtx;
  private readonly sky: Sky;
  private precip: Precip;
  private quality: WorldQuality;
  private q: QP;
  private readonly root = new THREE.Group();
  private readonly chunks = new Map<number, Chunk>();
  private readonly loaded: Chunk[] = [];
  private want: number[] = [];
  private wantPos = 0; private wantDone = 0;
  private lastCx = NaN; private lastCz = NaN; private lastVd = -1; private dirty = true;
  private readonly cam = new THREE.Vector3();
  private readonly near: Near = { seg: -1, d: 0, y: 0, t: 0 };
  private readonly h4 = new Float64Array(4);
  private blink = 0;
  private disposed = false;
  /** laufender Chunkaufbau (über mehrere Frames) */
  private job: { it: Generator<void, Chunk, void>; key: number; cx: number; cz: number; upgrade: boolean } | null = null;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly scene: THREE.Scene, net: Network, quality: WorldQuality) {
    this.ctx = new WorldCtx(net);
    this.quality = { ...quality };
    this.q = this.makeQ(quality);
    this.ctx.terrain.setCell(this.q.cell);
    this.root.name = 'world';
    scene.add(this.root);
    this.sky = new Sky(scene);
    this.sun = this.sky.sun; this.ambient = this.sky.ambient;
    this.precip = new Precip(scene, LEVELS[quality.level].precip);
    this.applyShadows();
  }

  private makeQ(q: WorldQuality): QP {
    const L = LEVELS[q.level];
    const maxTex = this.renderer?.capabilities?.maxTextureSize ?? 2048;
    return { level: q.level, n: L.n, cell: CH / L.n, nFar: L.nFar, lodDist: L.lodDist, trees: L.trees, houses: L.houses, people: L.people, sleepers3d: L.sleepers3d, wires: L.wires, shadows: q.shadows, maxTex };
  }

  private applyShadows() {
    const sm = this.renderer?.shadowMap;
    if (sm) { sm.enabled = this.quality.shadows; if (this.quality.shadows) sm.type = THREE.PCFShadowMap; }
    for (const m of this.ctx.mats.all()) m.needsUpdate = true;
  }

  setQuality(q: WorldQuality): void {
    const old = this.quality;
    this.quality = { ...q };
    if (q.level !== old.level) {
      this.clearChunks();
      this.q = this.makeQ(q);
      this.ctx.terrain.setCell(this.q.cell);
      this.precip.dispose(); this.precip = new Precip(this.scene, LEVELS[q.level].precip);
    } else this.q.shadows = q.shadows;
    if (q.shadows !== old.shadows) {
      this.applyShadows();
      for (const c of this.loaded) c.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) { const m = o as THREE.Mesh; m.receiveShadow = q.shadows; m.castShadow = q.shadows && m.name === 'static'; } });
    }
    this.dirty = true;
  }

  private clearChunks() {
    for (const c of this.loaded) c.dispose();
    this.loaded.length = 0; this.chunks.clear();
    this.want.length = 0; this.wantPos = 0; this.wantDone = 0; this.dirty = true; this.job = null;
  }

  /** Wunschliste der Chunks (nach Entfernung sortiert) neu aufstellen, ferne Chunks freigeben */
  private plan(cx: number, cz: number) {
    const vd = this.quality.viewDist, x = this.cam.x, z = this.cam.z, r = Math.ceil(vd / CH) + 1;
    const list: { k: number; d: number }[] = [];
    for (let j = cz - r; j <= cz + r; j++) for (let i = cx - r; i <= cx + r; i++) {
      const d = rectDist(x, z, i, j);
      if (d < vd) list.push({ k: ckey(i, j), d });
    }
    list.sort((a, b) => a.d - b.d);
    this.want = list.map((e) => e.k);
    for (let k = this.loaded.length - 1; k >= 0; k--) {
      const c = this.loaded[k];
      if (rectDist(x, z, c.cx, c.cz) > vd * 1.3) { c.dispose(); this.chunks.delete(c.key); this.loaded.splice(k, 1); }
    }
    this.wantPos = 0; this.wantDone = 0;
    for (const k of this.want) if (this.chunks.has(k)) this.wantDone++;
    if (this.job && rectDist(x, z, this.job.cx, this.job.cz) > vd * 1.3) this.job = null;
    this.lastCx = cx; this.lastCz = cz; this.lastVd = vd; this.dirty = false;
  }

  update(camera: THREE.Camera, env: WorldEnv, dt: number): void {
    if (this.disposed) return;
    camera.getWorldPosition(this.cam);
    const cx = Math.floor(this.cam.x / CH), cz = Math.floor(this.cam.z / CH);
    if (this.dirty || cx !== this.lastCx || cz !== this.lastCz || this.quality.viewDist !== this.lastVd) this.plan(cx, cz);
    // Chunks im Zeitbudget schrittweise aufbauen (mindestens ein Schritt je Frame)
    const t0 = performance.now();
    do {
      if (!this.job && !this.nextJob()) break;
      const job = this.job!, r = job.it.next();
      if (!r.done) continue;
      const c = r.value, old = this.chunks.get(job.key);
      if (old) { old.dispose(); const i = this.loaded.indexOf(old); if (i >= 0) this.loaded[i] = c; else this.loaded.push(c); }
      else { this.loaded.push(c); this.wantDone++; }
      this.chunks.set(job.key, c); this.root.add(c.group);
      this.job = null;
    } while (performance.now() - t0 < BUDGET * 0.5); // neuen Schritt nur in der ersten Budgethälfte beginnen
    // Himmel, Licht, Wetter
    const tun = this.inTunnel(this.cam.x, this.cam.y, this.cam.z);
    this.sky.update(this.cam, env, dt, this.quality.viewDist, this.quality.shadows);
    this.precip.update(this.cam, env, dt, tun, this.sky.light);
    const neon = this.ctx.net.def.theme.buildings === 'neon';
    this.ctx.mats.glowU.value = Math.max(neon ? 0.8 : 0.25, 0.25 + 0.85 * this.sky.night);
    // Signale, Schranken, Schwellen
    this.blink += dt;
    const on = Math.floor(this.blink * 1.6) % 2 === 0;
    for (let i = 0; i < this.loaded.length; i++) {
      const c = this.loaded[i];
      if (c.lamps) this.updateLamps(c, env);
      for (let k = 0; k < c.xings.length; k++) {
        const x = c.xings[k];
        let cl = 0;
        for (let m = 0; m < x.ids.length; m++) cl = Math.max(cl, env.crossingClosed(x.ids[m]) || 0);
        cl = Math.min(1, Math.max(0, cl));
        for (let m = 0; m < x.arms.length; m++) x.arms[m].rotation.z = (1 - cl) * Math.PI * 0.5;
        const lit = cl > 0 && on ? this.ctx.mats.xOn : this.ctx.mats.xOff;
        for (let m = 0; m < x.lights.length; m++) x.lights[m].material = lit;
      }
      if (c.sleepers) c.sleepers.visible = rectDist(this.cam.x, this.cam.z, c.cx, c.cz) < SLEEPER_DIST;
    }
  }

  /** nächsten Aufbau wählen: fehlende Chunks (nach Entfernung), sonst grobe Chunks in der Nähe verfeinern */
  private nextJob(): boolean {
    while (this.wantPos < this.want.length) {
      const k = this.want[this.wantPos++];
      if (this.chunks.has(k)) continue;
      const cx = Math.floor(k / 65536) - 32768, cz = (k % 65536) - 32768;
      this.job = { it: chunkSteps(this.ctx, this.q, cx, cz, this.lodN(cx, cz)), key: k, cx, cz, upgrade: false };
      return true;
    }
    if (this.q.nFar === this.q.n) return false;
    for (let i = 0; i < this.loaded.length; i++) {
      const c = this.loaded[i];
      if (c.n === this.q.n || rectDist(this.cam.x, this.cam.z, c.cx, c.cz) >= this.q.lodDist) continue;
      this.job = { it: chunkSteps(this.ctx, this.q, c.cx, c.cz, this.q.n), key: c.key, cx: c.cx, cz: c.cz, upgrade: true };
      return true;
    }
    return false;
  }

  private lodN(cx: number, cz: number) { return rectDist(this.cam.x, this.cam.z, cx, cz) < this.q.lodDist ? this.q.n : this.q.nFar; }

  private updateLamps(c: Chunk, env: WorldEnv) {
    const L = c.lamps!; let changed = false;
    for (let i = 0; i < L.ids.length; i++) {
      const a = ASPECT[env.signalAspect(L.ids[i])] ?? 0;
      if (L.cache[i] === a) continue;
      L.cache[i] = a; changed = true;
      const f = L.first[i], im = L.mesh;
      switch (L.kind[i]) {
        case 0: // Hauptsignal: rot / gelb / grün (oben → unten)
          im.setColorAt(f, a === 0 ? L_RED : L_OFF);
          im.setColorAt(f + 1, a === 2 || a === 3 ? L_YEL : L_OFF);
          im.setColorAt(f + 2, a === 1 || a === 2 ? L_GRN : L_OFF);
          break;
        case 1: // Blocksignal: rot / grün (gelb bei Warnung)
          im.setColorAt(f, a === 0 ? L_RED : L_OFF);
          im.setColorAt(f + 1, a === 0 ? L_OFF : a === 1 ? L_GRN : L_YEL);
          break;
        default: // Rangiersignal: zwei rote bzw. weiße Lichter
          im.setColorAt(f, a === 0 ? L_RED : L_WHT); im.setColorAt(f + 1, a === 0 ? L_RED : L_WHT);
      }
    }
    if (changed && L.mesh.instanceColor) L.mesh.instanceColor.needsUpdate = true;
  }

  heightAt(x: number, z: number): number {
    const cx = Math.floor(x / CH), cz = Math.floor(z / CH), c = this.chunks.get(ckey(cx, cz)), cell = this.q.cell;
    if (c) return gridSample(c.h, c.n, (x - cx * CH) / c.cell, (z - cz * CH) / c.cell);
    const gx = Math.floor(x / cell) * cell, gz = Math.floor(z / cell) * cell, T = this.ctx.terrain, h = this.h4;
    h[0] = T.height(gx, gz, null); h[1] = T.height(gx + cell, gz, null); h[2] = T.height(gx, gz + cell, null); h[3] = T.height(gx + cell, gz + cell, null);
    return gridSample(h, 1, (x - gx) / cell, (z - gz) / cell);
  }

  inTunnel(x: number, y: number, z: number): boolean {
    if (!this.ctx.idx.nearest(x, z, 6, null, this.near, F_TUN)) return false;
    return this.near.d < 4.6 && y > this.near.y - 1.5 && y < this.near.y + 7.2;
  }

  progress(): number { return this.want.length ? this.wantDone / this.want.length : this.dirty ? 0 : 1; }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearChunks();
    this.root.removeFromParent();
    this.sky.dispose(); this.precip.dispose();
    this.ctx.dispose();
  }

  /** Diagnose: geladene Chunks und Dreiecke (ohne Himmel/Niederschlag) */
  stats(): { chunks: number; triangles: number } {
    let t = 0; for (const c of this.loaded) t += c.tris;
    return { chunks: this.loaded.length, triangles: t };
  }
}

function rectDist(x: number, z: number, cx: number, cz: number): number {
  const x0 = cx * CH, z0 = cz * CH;
  const dx = x < x0 ? x0 - x : x > x0 + CH ? x - x0 - CH : 0, dz = z < z0 ? z0 - z : z > z0 + CH ? z - z0 - CH : 0;
  return Math.hypot(dx, dz);
}
