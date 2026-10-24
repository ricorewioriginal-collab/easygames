/* Funkparcours – Physik und Parcours als reine Logik (ohne DOM, ohne Zufall): läuft im Spiel UND im Test (Bot).
   Koordinaten: x nach rechts, y nach oben (Meter). Wasser bei y = 0. Spielerposition = Mitte der Füße. */
export const G = 26, RUN = 5.6, ACC = 40, AIR_ACC = 22, FRICTION = 34, JUMP_V = 8.6, COYOTE = 0.09, BUFFER = 0.12, PW = 0.5, PH = 1.7, HANG_SPEED = 3.2, WALLRUN_MIN = 5.0, WALLRUN_T = 0.62;
export const DT = 1 / 60;

// ---------------------------------------------------------------- Parcours bauen
class Builder {
  constructor(name) { this.name = name; this.o = []; this.x = 0; this.y = 1; this.secs = []; }
  sec(n) { this.secs.push({ n, x: this.x }); return this; }
  plat(x, w, y) { this.o.push({ k: 'plat', x, y, w }); return this; }
  start(w = 6) { this.plat(0, w, this.y); this.x = w; return this; }
  rest(w, dy = 0, g = 0) { this.y += dy; this.plat(this.x + g, w, this.y); this.x += g + w; return this; }
  stones(list) { this.sec('Stufensprung'); for (const s of list) { this.y += s.dy || 0; this.plat(this.x + s.g, s.w, this.y); this.x += s.g + s.w; } return this; }
  mover({ g, w = 2.6, ax = 3, ay = 0, period = 4.2, phase = 0, dy = 0 }) { this.sec(ay ? 'Fahrstuhl' : 'Schiebebrücke'); this.y += dy; const bx = this.x + g + ax; this.o.push({ k: 'move', x: bx, y: this.y, w, ax, ay, period, phase }); this.x = bx + ax + w; return this; }
  sinkers(count, g, w, delay = 0.55, dy = 0) { this.sec('Bruchplatten'); for (let i = 0; i < count; i++) { this.y += i === 0 ? dy : 0; this.o.push({ k: 'sink', x: this.x + g, y: this.y, w, delay }); this.x += g + w; } return this; }
  swings(span, n, { len = 3.6, amp = 0.95, period = 2.6, spread = 0 } = {}) { this.sec('Sandsäcke'); const x0 = this.x; this.plat(x0, span, this.y); for (let i = 0; i < n; i++) this.o.push({ k: 'swing', px: x0 + (span / (n + 1)) * (i + 1), py: this.y + 5.2, len, amp, period, phase: i * (spread || 1.3), r: 0.42, h: 1.1 }); this.x += span; return this; }
  /** Drehwalzen: liegende, rotierende Walzen – die Oberfläche schiebt den Läufer zurück (v < 0) */
  rolls(n, { g = 1.3, r = 0.8, v = -1.4 } = {}) { this.sec('Drehwalzen'); for (let i = 0; i < n; i++) { const cx = this.x + g + r; this.o.push({ k: 'roll', x: cx - r * 0.92, w: r * 1.84, y: this.y, r, v: v * (i % 2 ? 1.15 : 1) }); this.x = cx + r; } return this; }
  /** Seilschwung über eine Lücke: Seil schwingt von selbst, in der Luft greift der Läufer automatisch, Sprung = loslassen */
  rope(gap, { len = 3.9, top = 6.0, amp = 0.6, period = 2.6, phase = 0 } = {}) { this.sec('Seilschwung'); this.o.push({ k: 'rope', px: this.x + gap / 2, py: this.y + top, len, amp, period, phase }); this.x += gap; return this; }
  /** Trampolin: federt nach dem Sprung hoch an Hangelstangen, die man sonst nicht erreicht */
  trampBars(len, { g = 2.0, tw = 2.4, w = 3, dy = 0 } = {}) { this.sec('Trampolin'); const tx = this.x + g, ty = this.y - 0.3; this.o.push({ k: 'tramp', x: tx, y: ty, w: tw, bounce: 12.5 }); const x1 = tx + tw * 0.55, x2 = x1 + len; this.o.push({ k: 'bars', x1, x2, y: ty + 4.1 }); this.x = x2 + 1.0; this.y += dy; this.plat(this.x, w, this.y); this.x += w; return this; }
  bars(gap, h = 2.3, w = 3, dy = 0) { this.sec('Hangelstangen'); const x1 = this.x + 1.0, x2 = this.x + gap - 1.0, y = this.y + h; this.o.push({ k: 'bars', x1, x2, y }); this.x += gap; this.y += dy; this.plat(this.x, w, this.y); this.x += w; return this; }
  wall(g = 1.5, h = 4.2) { /* Durchgängiger Anlauf ab der letzten Plattform bis direkt zur Wand. */ this.sec('Steilwand'); const wx = this.x + g + 2.6; this.plat(this.x - 0.15, g + 2.75, this.y); this.o.push({ k: 'wall', x: wx, y: this.y, h, w: 0.6 }); this.o.push({ k: 'plat', x: wx, y: this.y + h, w: 3.6 }); this.o.push({ k: 'finish', x: wx + 1.6, y: this.y + h }); this.end = wx + 3.6; this.wallX = wx; return this; }
  build() { return { name: this.name, o: this.o, secs: this.secs, finish: this.o.find(o => o.k === 'finish'), length: this.end, wallX: this.wallX }; }
}
export const COURSES = [
  // Vorrunde wie im TV: 8 Hindernisse, am Ende die Steilwand (4,25 m)
  new Builder('Vorrunde').start(6).stones([{ g: 2.0, w: 2.0 }, { g: 2.2, w: 1.8, dy: 0.3 }, { g: 2.2, w: 1.8, dy: 0.3 }, { g: 2.4, w: 1.8, dy: -0.3 }, { g: 2.2, w: 2.2, dy: -0.3 }]).rest(3, 0, 2.0)
    .rolls(3, { g: 1.3, r: 0.8, v: -1.4 }).rest(3, 0, 1.6).swings(11, 2, { period: 3.0 }).sinkers(4, 2.0, 2.0, 0.7).rest(3, 0, 2.0)
    .rope(5.0).rest(3.2, 0, 0).mover({ g: 2.4, w: 2.8, ax: 2.2, period: 4.4 }).rest(2.6, 0, 2.0).bars(8.5, 2.3, 3, 0).wall(1.5, 4.25).build(),
  new Builder('Halbfinale').start(5).stones([{ g: 2.6, w: 1.8 }, { g: 2.8, w: 1.6, dy: 0.4 }, { g: 2.8, w: 1.6, dy: -0.4 }, { g: 3.0, w: 1.8 }, { g: 2.8, w: 1.6, dy: 0.3 }, { g: 3.0, w: 1.8 }]).rest(2.6, 0, 2.0)
    .rolls(4, { g: 1.4, r: 0.75, v: -1.7 }).rest(2.6, 0, 1.6).mover({ g: 2.2, w: 2.2, ax: 0, ay: 0.9, period: 3.6, dy: 0.2 }).rest(3, 0, 2.0).swings(14, 3, { period: 2.8 })
    .rope(5.2, { amp: 0.62, period: 2.5 }).rest(2.8, 0, 0).sinkers(5, 2.2, 1.7, 0.55).rest(2.6, 0, 2.0).trampBars(7.5).mover({ g: 2.6, w: 2.2, ax: 3.0, period: 4.0 }).rest(2.4, 0, 2.0).wall(1.4, 4.5).build(),
  new Builder('Finale').start(5).stones([{ g: 2.8, w: 1.5 }, { g: 2.6, w: 1.4, dy: 0.5 }, { g: 3.2, w: 1.4, dy: -0.5 }, { g: 3.0, w: 1.4 }, { g: 2.6, w: 1.4, dy: 0.4 }, { g: 3.0, w: 1.4 }, { g: 3.0, w: 1.5, dy: -0.3 }]).rest(2.4, 0, 2.0)
    .rolls(5, { g: 1.5, r: 0.7, v: -2.0 }).rest(2.4, 0, 1.6).mover({ g: 2.4, w: 2.0, ax: 3.4, period: 3.4 }).sinkers(6, 2.4, 1.5, 0.45).rest(2.6, 0, 2.2).swings(16, 3, { period: 2.6, amp: 1.0, spread: 1.6 })
    .rope(5.4, { amp: 0.64, period: 2.4 }).rest(2.4, 0, 0).mover({ g: 2.4, w: 2.0, ax: 0, ay: 1.2, period: 3.0, dy: 0.3 }).rest(2.4, 0, 2.2).trampBars(10.5).sinkers(4, 2.4, 1.5, 0.45).rest(2.4, 0, 2.2)
    .bars(12.5, 2.5, 2.6, 0.4).wall(1.2, 5.0).build()
];

// ---------------------------------------------------------------- Bewegte Hindernisse (reine Funktionen der Zeit)
export const movePos = (o, t) => { const a = (2 * Math.PI * t) / o.period + (o.phase || 0); return { x: o.x + o.ax * Math.sin(a), y: o.y + o.ay * Math.sin(a) }; };
export const swingBall = (o, t) => { const a = o.amp * Math.sin((2 * Math.PI * t) / o.period + o.phase); return { x: o.px + o.len * Math.sin(a), y: o.py - o.len * Math.cos(a), a }; };
/** Seilwinkel a und Winkelgeschwindigkeit da zur Zeit t */
export const ropeAt = (o, t) => { const w = (2 * Math.PI) / o.period, u = w * t + o.phase; return { a: o.amp * Math.sin(u), da: o.amp * w * Math.cos(u) }; };

// ---------------------------------------------------------------- Simulation
export class Sim {
  constructor(course) {
    this.c = course; this.t = 0; this.x = 2; this.y = course.o[0].y; this.vx = 0; this.vy = 0; this.ground = null; this.onGround = true; this.coyote = COYOTE; this.buf = 0; this.prevJ = false; this.prevG = false;
    this.hang = null; this.rope = null; this.boost = false; this.wallTries = 0; this.wallHit = false; this.stun = 0; this.wall = null; this.dead = null; this.finished = false; this.face = 1; this.hits = 0; this.dist = 0; this.sinks = course.o.map(o => (o.k === 'sink' ? { touch: -1, y: 0, vy: 0, gone: false } : null)); this.solids = [];
    this.collect();
  }
  clone() { const s = Object.create(Sim.prototype); Object.assign(s, this); s.sinks = this.sinks.map(k => (k ? { touch: k.touch, y: k.y, vy: k.vy, gone: k.gone } : null)); s.hang = this.hang ? { bar: this.hang.bar } : null; s.rope = this.rope ? Object.assign({}, this.rope) : null; s.wall = this.wall ? Object.assign({}, this.wall) : null; s.solids = []; s.collect(); s.ground = this.ground ? s.solids.find(q => q.i === this.ground.i) || null : null; return s; }
  /** aktuelle feste Flächen (Boden-Plattformen, Wand) mit Geschwindigkeit für das Mitfahren */
  collect() {
    const out = [], t = this.t, prev = this.solids;
    this.c.o.forEach((o, i) => {
      if (o.k === 'plat') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 0.5, vx: 0, vy: 0 });
      else if (o.k === 'move') { const p = movePos(o, t), q = movePos(o, t - DT); out.push({ i, x0: p.x, x1: p.x + o.w, top: p.y, bot: p.y - 0.5, vx: (p.x - q.x) / DT, vy: (p.y - q.y) / DT }); }
      else if (o.k === 'sink') { const k = this.sinks[i]; if (!k.gone) out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y + k.y, bot: o.y + k.y - 0.5, vx: 0, vy: k.vy }); }
      else if (o.k === 'roll') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 2 * o.r + 0.2, vx: o.v, vy: 0 });
      else if (o.k === 'tramp') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 0.5, vx: 0, vy: 0 });
      else if (o.k === 'wall') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y + o.h, bot: -5, vx: 0, vy: 0, wall: true });
    });
    this.solids = out;
  }
  nearBar() { for (let i = 0; i < this.c.o.length; i++) { const o = this.c.o[i]; if (o.k === 'bars' && this.x >= o.x1 - 0.3 && this.x <= o.x2 + 0.3) { const head = this.y + PH; if (head >= o.y - 0.55 && head <= o.y + 0.35) return { i, o }; } } return null; }
  /** Seil in Griffweite der Hände? → { i, d } (d = Abstand der Hände vom Aufhängepunkt) */
  nearRope() {
    const hx = this.x, hy = this.y + PH;
    for (let i = 0; i < this.c.o.length; i++) { const o = this.c.o[i]; if (o.k !== 'rope') continue; const { a } = ropeAt(o, this.t), dx = Math.sin(a), dy = -Math.cos(a), px = hx - o.px, py = hy - o.py, d = px * dx + py * dy; if (d < 1.4 || d > o.len + 0.15) continue; if (Math.abs(px * dy - py * dx) < 0.45) return { i, d: Math.min(d, o.len - 0.05) }; }
    return null;
  }
  swingHit(o) {
    const b = swingBall(o, this.t), sx = Math.sin(b.a), sy = -Math.cos(b.a), offs = o.h ? [-o.h * 0.36, 0, o.h * 0.36] : [0];
    for (const f of offs) { const px = b.x + sx * f, py = b.y + sy * f, cx = Math.max(this.x - PW / 2, Math.min(this.x + PW / 2, px)), cy = Math.max(this.y, Math.min(this.y + PH, py)); if (Math.hypot(px - cx, py - cy) < o.r) return true; }
    return false;
  }
  step(inp, dt = DT) {
    if (this.dead || this.finished) return; this.t += dt; const L = inp.l ? 1 : 0, R = inp.r ? 1 : 0, J = !!inp.j, Gr = !!inp.g;
    // Absinkende Plattformen
    this.sinks.forEach((k, i) => { if (!k || k.gone) return; if (k.touch >= 0 && this.t - k.touch >= this.c.o[i].delay) { k.vy -= 20 * dt; k.y += k.vy * dt; if (k.y < -4) k.gone = true; } });
    this.collect();
    if (this.stun > 0) this.stun -= dt;
    // Wandlauf (Skript)
    if (this.wall) { const w = this.wall; w.p += dt / (WALLRUN_T * (w.h || 4.2) / 4.2); const e = Math.min(1, w.p), ease = 1 - Math.pow(1 - e, 2); this.x = w.x0 + (w.x1 - w.x0) * ease; this.y = w.y0 + (w.y1 - w.y0) * ease; if (w.p >= 1) { this.wall = null; this.onGround = true; this.vx = 0; this.vy = 0; this.coyote = COYOTE; this.collect(); } this.check(); return; }
    // Am Seil: Hände folgen dem Seil, Sprung = loslassen (mit dem Schwung des Seils)
    if (this.rope) {
      const o = this.c.o[this.rope.i], { a, da } = ropeAt(o, this.t), d = this.rope.d; this.rope.a = a; this.rope.da = da; this.face = 1;
      this.vx = d * da * Math.cos(a); this.vy = d * da * Math.sin(a); this.x = o.px + d * Math.sin(a); this.y = o.py - d * Math.cos(a) - PH;
      if (J && !this.prevJ) { this.rope = null; this.grabCool = 0.4; this.vx += 1.2; this.vy += 3.6; this.boost = true; this.prevJ = J; this.prevG = Gr; }
      else { this.prevJ = J; this.prevG = Gr; this.dist = Math.max(this.dist, this.x); this.check(); return; }
    }
    // Hängen an den Stangen
    if (this.hang) {
      const o = this.c.o[this.hang.bar]; this.vy = 0; this.vx = (R - L) * HANG_SPEED * (this.stun > 0 ? 0 : 1); this.x += this.vx * dt; if (R - L) this.face = R - L; this.y = o.y - PH;
      // Am Ende der Stangen automatisch abschwingen; Sprung = Absprung nach vorn
      if (this.x > o.x2 + 0.1) { this.hang = null; this.grabCool = 0.35; this.vy = 6; this.vx = 5; this.face = 1; } else if (this.x < o.x1 - 0.35) { this.hang = null; this.grabCool = 0.35; } else if (J && !this.prevJ) { this.hang = null; this.grabCool = 0.35; this.vy = 7.2; this.vx = this.face * 5.5; } else { this.prevJ = J; this.prevG = Gr; this.dist = Math.max(this.dist, this.x); this.check(); return; }
      this.prevJ = J; this.prevG = Gr;
    }
    const ctl = this.stun > 0 ? 0 : 1; const dir = (R - L) * ctl, accel = this.onGround ? ACC : AIR_ACC;
    if (dir) { const target = dir * RUN; const dv = accel * dt; this.vx = Math.abs(target - this.vx) <= dv ? target : this.vx + Math.sign(target - this.vx) * dv; this.face = dir; } else if (this.onGround) { const f = FRICTION * dt; this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f; }
    if (this.onGround && this.ground) this.coyote = COYOTE; else this.coyote -= dt;
    if (J && !this.prevJ && ctl) this.buf = BUFFER; else this.buf -= dt; this.prevJ = J;
    if (this.buf > 0 && this.coyote > 0) {
      // Wandlauf an der letzten Wand starten?
      const wo = this.c.o.find(o => o.k === 'wall');
      if (wo && this.onGround && Math.abs(this.vx) >= WALLRUN_MIN && this.x >= wo.x - 2.6 && this.x <= wo.x - 0.15) { this.wall = { p: 0, h: wo.h, x0: this.x, y0: this.y, x1: wo.x + 0.9, y1: wo.y + wo.h }; this.buf = 0; this.coyote = 0; this.onGround = false; this.ground = null; return; }
      this.vy = JUMP_V; this.onGround = false; this.ground = null; this.coyote = 0; this.buf = 0;
    }
    if (this.boost && this.vy <= 0) this.boost = false; if (!J && this.vy > 3.5 && !this.boost) this.vy -= 55 * dt;   // kurzer Tipp = kleiner Sprung
    // Greifen: in der Luft an den Stangen automatisch
    this.grabCool = (this.grabCool || 0) - dt; if (!this.onGround && ctl && this.grabCool <= 0) { const b = this.nearBar(); if (b) { this.hang = { bar: b.i }; this.vx = 0; this.vy = 0; this.y = b.o.y - PH; this.prevG = Gr; return; } const rp = this.nearRope(); if (rp) { this.rope = rp; this.boost = false; this.prevG = Gr; return; } } this.prevG = Gr;
    this.vy -= G * dt; const vIn = this.vy;   // Fallgeschwindigkeit vor dem Aufsetzen (für das Trampolin)
    let carryX = 0, carryY = 0; if (this.onGround && this.ground) { carryX = this.ground.vx * dt; carryY = this.ground.vy * dt; }
    // x-Bewegung
    this.x += this.vx * dt + carryX; if (this.onGround && this.ground) { /* Plattform setzt y */ }
    for (const s of this.solids) { if (this.y < s.top && this.y + PH > s.bot + 0.02 && this.x + PW / 2 > s.x0 && this.x - PW / 2 < s.x1) {
      if (!s.wall && this.y >= s.top - 0.45 && this.vy <= 3 && !(this.ground && this.ground.i === s.i)) { this.y = s.top; if (this.vy < 0) this.vy = 0; continue; }   // Kantenhilfe: knapp verfehlte Kante wird noch erwischt
      if (this.y >= s.top - 0.2) continue; const penL = this.x + PW / 2 - s.x0, penR = s.x1 - (this.x - PW / 2); if (penL < penR) { if (s.wall && !this.onGround && !this.wallHit && this.vx > 0) { this.wallHit = true; this.wallTries++; } this.x = s.x0 - PW / 2; if (this.vx > 0) this.vx = 0; } else { this.x = s.x1 + PW / 2; if (this.vx < 0) this.vx = 0; } } }
    // y-Bewegung
    const y0 = this.y; this.y += this.vy * dt + carryY; this.onGround = false; this.ground = null;
    for (const s of this.solids) {
      if (!(this.x + PW / 2 > s.x0 + 0.02 && this.x - PW / 2 < s.x1 - 0.02)) continue;
      const topPrev = s.top - s.vy * dt;
      if (this.vy <= 0.01 && y0 >= topPrev - 0.03 && this.y <= s.top + 0.001) { this.y = s.top; this.vy = 0; this.onGround = true; this.ground = s; }
      else if (this.vy > 0 && y0 + PH <= s.bot + 0.05 && this.y + PH > s.bot) { this.y = s.bot - PH; this.vy = 0; }
    }
    if (this.onGround && this.ground) {
      const o = this.c.o[this.ground.i]; if (o.k === 'sink') { const k = this.sinks[this.ground.i]; if (k.touch < 0) k.touch = this.t; }
      if (o.k === 'tramp' && vIn < -1.5) { this.vy = o.bounce; this.onGround = false; this.ground = null; this.boost = true; this.bounces = (this.bounces || 0) + 1; }
      else { this.boost = false; if (this.wallHit) { this.wallHit = false; if (this.wallTries >= 3) { this.dead = 'wall'; return; } } }
    }
    // Pendel (Sandsack = drei Kreise entlang des Seils)
    if (!this.stun || this.stun <= 0) for (const o of this.c.o) if (o.k === 'swing' && this.swingHit(o)) { const b = swingBall(o, this.t); { this.stun = 0.55; this.hits++; this.boost = false; this.vx = (this.x < b.x ? -1 : 1) * 4.5; this.vy = 5; this.onGround = false; this.ground = null; this.hang = null; break; } }
    this.dist = Math.max(this.dist, this.x); this.check();
  }
  check() {
    if (this.y < -0.45) { this.dead = 'water'; return; } if (this.x < -1.5) { this.dead = 'water'; return; }
    const f = this.c.finish; if (f && this.x >= f.x && this.y >= f.y - 0.1 && !this.wall) this.finished = true;
  }
}
export const fmtTime = t => { const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${s.toFixed(2).padStart(5, '0')}`; };
/** Platzierung nach einem Lauf: Zieleinlauf nach Zeit, sonst nach Strecke. results: [{finished,time,dist}] → Rangliste (Indexe) */
export function rank(results) { return results.map((r, i) => i).sort((a, b) => { const A = results[a], B = results[b]; if (A.finished !== B.finished) return A.finished ? -1 : 1; if (A.finished) return A.time - B.time || a - b; return B.dist - A.dist || a - b; }); }
export const pointsFor = (pos, n) => n - pos;
/** Gesamtwertung: players [{pts, secs}] → Indexe, beste zuerst (Punkte, bei Gleichstand die kleinere Gesamtzeit) */
export const standings = pl => pl.map((p, i) => i).sort((a, b) => pl[b].pts - pl[a].pts || pl[a].secs - pl[b].secs || a - b);
