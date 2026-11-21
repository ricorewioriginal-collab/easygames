// Replays: Der Lauf wird als Pose-Folge (alle Knoten von Skater und Brett) aufgezeichnet und frei abgespielt –
// mit Zeitleiste, Zeitlupe/Zeitraffer und drei Kameras.
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math';
import * as A from './audio.js';

const HZ = 24, MAX_S = 150;

export class Recorder {
  constructor(game) {
    const H = game.skater.holder;
    this.game = game;
    this.nodes = [H, ...H.getDescendants(false).filter(n => n.position && (n.rotationQuaternion || n.rotation))];
    this.stride = this.nodes.length * 7 + 7;
    this.cap = HZ * MAX_S; this.buf = new Float32Array(this.cap * this.stride); this.times = new Float64Array(this.cap);
    this.head = 0; this.count = 0; this.t = 0; this.acc = 1; this.events = [];
  }
  add(dt) {
    this.t += dt; this.acc += dt;
    if (this.acc < 1 / HZ) return;
    this.acc = Math.min(this.acc - 1 / HZ, 1 / HZ);
    const idx = (this.head + this.count) % this.cap;
    if (this.count < this.cap) this.count++; else this.head = (this.head + 1) % this.cap;
    const b = this.buf; let o = idx * this.stride;
    for (const n of this.nodes) {
      const p = n.position; b[o] = p.x; b[o + 1] = p.y; b[o + 2] = p.z;
      const q = n.rotationQuaternion;
      if (q) { b[o + 3] = q.x; b[o + 4] = q.y; b[o + 5] = q.z; b[o + 6] = q.w; } else { const r = n.rotation; b[o + 3] = r.x; b[o + 4] = r.y; b[o + 5] = r.z; b[o + 6] = NaN; }
      o += 7;
    }
    const g = this.game, c = g.cam.position, tg = g.cam.getTarget();
    b[o] = c.x; b[o + 1] = c.y; b[o + 2] = c.z; b[o + 3] = tg.x; b[o + 4] = tg.y; b[o + 5] = tg.z; b[o + 6] = g.run ? g.run.score : 0;
    this.times[idx] = this.t;
  }
  event(txt, cls) { this.events.push({ t: this.t, txt, cls }); if (this.events.length > 600) this.events.shift(); }
  get length() { return this.count > 1 ? this.times[(this.head + this.count - 1) % this.cap] - this.times[this.head] : 0; }
}

const CAMS = ['Verfolger', 'TV', 'Drohne'];
export class Player {
  constructor(game, rec) {
    this.game = game; this.rec = rec; this.nodes = rec.nodes; this.stride = rec.stride;
    // Ringpuffer in lineare Reihenfolge bringen
    const n = rec.count; this.n = n; this.buf = new Float32Array(n * this.stride); this.times = new Float64Array(n);
    for (let i = 0; i < n; i++) { const j = (rec.head + i) % rec.cap; this.buf.set(rec.buf.subarray(j * this.stride, (j + 1) * this.stride), i * this.stride); this.times[i] = rec.times[j]; }
    this.t0 = this.times[0]; this.t1 = this.times[n - 1]; this.t = this.t0;
    this.events = rec.events.filter(e => e.t >= this.t0 && e.t <= this.t1);
    this.playing = true; this.speed = 1; this.cam = 0; this.tv = null; this.orbit = 0;
    this.q1 = new Quaternion(); this.q2 = new Quaternion(); this.ev = 0;
    // Zustand für die Rückkehr merken
    const sk = game.skater; this.saved = this.nodes.map(nd => ({ p: nd.position.clone(), q: nd.rotationQuaternion ? nd.rotationQuaternion.clone() : null, r: nd.rotationQuaternion ? null : nd.rotation.clone() }));
    this.savedCam = { p: game.cam.position.clone(), t: game.cam.getTarget().clone(), fov: game.cam.fov };
    A.setRoll(0, false); A.setGrind(false);
  }
  get duration() { return this.t1 - this.t0; }
  get pos() { return this.t - this.t0; }
  seek(s) { this.t = Math.max(this.t0, Math.min(this.t1, this.t0 + s)); this.tv = null; this.ev = this.events.findIndex(e => e.t >= this.t); if (this.ev < 0) this.ev = this.events.length; }
  toggle() { if (!this.playing && this.t >= this.t1 - 1e-3) this.seek(0); this.playing = !this.playing; }
  nextSpeed() { const S = [1, 0.5, 0.25, 2]; this.speed = S[(S.indexOf(this.speed) + 1) % S.length]; }
  nextCam() { this.cam = (this.cam + 1) % CAMS.length; this.tv = null; }
  get camName() { return CAMS[this.cam]; }
  frame(dt) {
    const g = this.game, inp = g.input;
    if (inp.pressed('ollie')) this.toggle();
    if (inp.pressed('spinL')) this.seek(this.pos - 5);
    if (inp.pressed('spinR')) this.seek(this.pos + 5);
    if (inp.pressed('flip')) this.nextSpeed();
    if (inp.pressed('grind')) this.nextCam();
    if (inp.pressed('grab') || inp.pressed('pause')) { g.closeReplay(); return; }
    if (Math.abs(inp.x) > 0.3) this.seek(this.pos + inp.x * dt * 4);
    if (this.playing) { this.t += dt * this.speed; if (this.t >= this.t1) { this.t = this.t1; this.playing = false; } }
    this.apply();
    g.ui.replayTick(this);
  }
  apply() {
    const T = this.times, n = this.n; let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= this.t) lo = m; else hi = m; }
    const a = Math.max(0, Math.min(1, (this.t - T[lo]) / ((T[hi] - T[lo]) || 1)));
    const B = this.buf, s = this.stride; let o1 = lo * s, o2 = hi * s;
    const L = (i) => B[o1 + i] + (B[o2 + i] - B[o1 + i]) * a;
    for (const nd of this.nodes) {
      nd.position.set(L(0), L(1), L(2));
      if (Number.isNaN(B[o1 + 6])) nd.rotation.set(L(3), L(4), L(5));
      else if (nd.rotationQuaternion) { this.q1.set(B[o1 + 3], B[o1 + 4], B[o1 + 5], B[o1 + 6]); this.q2.set(B[o2 + 3], B[o2 + 4], B[o2 + 5], B[o2 + 6]); Quaternion.SlerpToRef(this.q1, this.q2, a, nd.rotationQuaternion); }
      o1 += 7; o2 += 7;
    }
    this.score = L(6);
    const g = this.game, cam = g.cam, H = this.nodes[0].position, L2 = g.level;
    // Ereignisse (Tricks) im Takt der Wiedergabe zeigen
    while (this.ev < this.events.length && this.events[this.ev].t <= this.t) { if (this.t - this.events[this.ev].t < 0.6) g.ui.replayTrick(this.events[this.ev]); this.ev++; }
    if (this.cam === 0) { cam.position.set(L(0), L(1), L(2)); cam.setTarget(new Vector3(L(3), L(4), L(5))); cam.fov = 1.05; return; }
    const target = new Vector3(H.x, H.y + 0.9, H.z);
    if (this.cam === 1) {
      // TV-Kamera: steht fest am Rand der Strecke und wird neu gesetzt, wenn der Skater zu weit weg ist
      const f2 = Math.min(n - 1, lo + 8) * s, f1 = Math.max(0, f2 - 8 * s), vx = B[f2] - B[f1], vz = B[f2 + 2] - B[f1 + 2];
      if (!this.tv || Vector3.Distance(this.tv, target) > 15) {
        const l = Math.hypot(vx, vz) || 1, ax = vx / l, az = vz / l;
        const x = H.x + ax * 9 + az * 4.5, z = H.z + az * 9 - ax * 4.5;
        this.tv = new Vector3(x, Math.max(L2.height(x, z) + 1.4, H.y + 1.2), z);
      }
      cam.position.copyFrom(this.tv); cam.setTarget(target); cam.fov = 0.8; return;
    }
    this.orbit += 0.012 * this.speed;
    const x = H.x + Math.sin(this.orbit) * 6, z = H.z + Math.cos(this.orbit) * 6;
    cam.position.set(x, Math.max(L2.height(x, z) + 0.8, H.y + 3.2), z); cam.setTarget(target); cam.fov = 1.0;
  }
  restore() {
    this.nodes.forEach((nd, i) => { const s = this.saved[i]; nd.position.copyFrom(s.p); if (s.q) nd.rotationQuaternion.copyFrom(s.q); else nd.rotation.copyFrom(s.r); });
    const c = this.game.cam; c.position.copyFrom(this.savedCam.p); c.setTarget(this.savedCam.t); c.fov = this.savedCam.fov;
  }
}
