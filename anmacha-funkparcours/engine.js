/* Titanparcours – Physik und Parcours als reine Logik (ohne DOM, ohne Zufall): läuft im Spiel UND im Test (Bot).
   Koordinaten: x nach rechts, y nach oben (Meter). Wasser bei y = 0. Spielerposition = Mitte der Füße.
   Eingabe pro Schritt: { l, r, j, d } = links, rechts, Sprung, Ducken (d: im Lauf rutschen, im Stand ducken/kriechen). */
export const G = 26, RUN = 5.6, ACC = 40, AIR_ACC = 22, FRICTION = 34, JUMP_V = 8.6, COYOTE = 0.09, BUFFER = 0.12, PW = 0.5, PH = 1.7, HANG_SPEED = 3.2, WALLRUN_MIN = 5.0, WALLRUN_T = 0.62;
/** Ducken: Körperhöhe, Kriechtempo, ab welchem Tempo man rutscht und wie stark die Rutsche bremst */
export const PH_DUCK = 1.0, CRAWL = 2.4, SLIDE_MIN = 3.2, SLIDE_DECEL = 4.5;
/** Pendelbalken: Balken (Halbbreite in x, Halbhöhe in y) */
export const LOG_HW = 0.45, LOG_HH = 0.26;
/** Lachsleiter: zu früh gedrückt (Sprossenwechsel noch nicht fertig) = eine Sprosse abrutschen */
export const LADDER_HOP = 0.36, LADDER_EARLY = 0.2;
export const DT = 1 / 60;

// ---------------------------------------------------------------- Parcours bauen
class Builder {
  constructor(name) { this.name = name; this.o = []; this.x = 0; this.y = 1; this.secs = []; }
  sec(n) { this.secs.push({ n, x: this.x }); return this; }
  plat(x, w, y, k) { const o = { k: 'plat', x, y, w }; if (k) o.look = k; this.o.push(o); return this; }
  start(w = 6) { this.plat(0, w, this.y); this.x = w; return this; }
  rest(w, dy = 0, g = 0) { this.y += dy; this.plat(this.x + g, w, this.y); this.x += g + w; return this; }
  /** Stufensprung: schräge Einzelstufen über dem Wasser */
  stones(list) { this.sec('Stufensprung'); list.forEach((s, i) => { this.y += s.dy || 0; this.plat(this.x + s.g, s.w, this.y, i % 2 ? 'stepR' : 'stepL'); this.x += s.g + s.w; }); return this; }
  mover({ g, w = 2.6, ax = 3, ay = 0, period = 4.2, phase = 0, dy = 0 }) { this.sec(ay ? 'Fahrstuhl' : 'Schiebebrücke'); this.y += dy; const bx = this.x + g + ax; this.o.push({ k: 'move', x: bx, y: this.y, w, ax, ay, period, phase }); this.x = bx + ax + w; return this; }
  sinkers(count, g, w, delay = 0.55, dy = 0) { this.sec('Bruchplatten'); for (let i = 0; i < count; i++) { this.y += i === 0 ? dy : 0; this.o.push({ k: 'sink', x: this.x + g, y: this.y, w, delay }); this.x += g + w; } return this; }
  swings(span, n, { len = 3.6, amp = 0.95, period = 2.6, spread = 0 } = {}) { this.sec('Sandsäcke'); const x0 = this.x; this.plat(x0, span, this.y); for (let i = 0; i < n; i++) this.o.push({ k: 'swing', px: x0 + (span / (n + 1)) * (i + 1), py: this.y + 5.2, len, amp, period, phase: i * (spread || 1.3), r: 0.42, h: 1.1 }); this.x += span; return this; }
  /** Drehwalzen: liegende, rotierende Walzen dicht an dicht (Spalt g schmaler als der Läufer) – die Oberfläche schiebt zurück (v < 0).
      Man kommt immer laufend rüber; Springen ist schneller, aber riskant. g0 = Lücke vor der ersten Walze */
  rolls(n, { g0 = 1.3, g = 0.35, r = 0.8, v = -1.4 } = {}) { this.sec('Drehwalzen'); for (let i = 0; i < n; i++) { const w = r * 1.84, x0 = this.x + (i ? g : g0); this.o.push({ k: 'roll', x: x0, w, y: this.y, r, v: v * (i % 2 ? 1.15 : 1) }); this.x = x0 + w; } return this; }
  /** Seilschwung über eine Lücke: Seil schwingt von selbst, in der Luft greift der Läufer automatisch, Sprung = loslassen */
  rope(gap, { len = 3.9, top = 6.0, amp = 0.6, period = 2.6, phase = 0 } = {}) { this.sec('Seilschwung'); this.o.push({ k: 'rope', px: this.x + gap / 2, py: this.y + top, len, amp, period, phase }); this.x += gap; return this; }
  /** Ringschwung: kurze Ringe hängen hintereinander und schwingen gegenläufig; greifen geht automatisch, Sprung = loslassen und zum nächsten Ring */
  rings(n, { step = 2.5, len = 1.5, top = 4.45, amp = 0.5, period = 2.2, g0 = 1.7, g1 = 1.9, w = 3 } = {}) {
    this.sec('Ringschwung'); const x0 = this.x + g0;
    for (let i = 0; i < n; i++) this.o.push({ k: 'rope', ring: true, px: x0 + i * step, py: this.y + top, len, amp, period, phase: i * Math.PI });
    this.x = x0 + (n - 1) * step + g1; this.plat(this.x, w, this.y); this.x += w; return this;
  }
  /** Trampolin: federt nach dem Sprung hoch an Hangelstangen, die man sonst nicht erreicht */
  trampBars(len, { g = 2.0, tw = 2.4, w = 3, dy = 0 } = {}) { this.sec('Trampolin'); const tx = this.x + g, ty = this.y - 0.3; this.o.push({ k: 'tramp', x: tx, y: ty, w: tw, bounce: 12.5 }); const x1 = tx + tw * 0.55, x2 = x1 + len; this.o.push({ k: 'bars', x1, x2, y: ty + 4.1 }); this.x = x2 + 1.0; this.y += dy; this.plat(this.x, w, this.y); this.x += w; return this; }
  bars(gap, h = 2.3, w = 3, dy = 0) { this.sec('Hangelstangen'); const x1 = this.x + 1.0, x2 = this.x + gap - 1.0, y = this.y + h; this.o.push({ k: 'bars', x1, x2, y }); this.x += gap; this.y += dy; this.plat(this.x, w, this.y); this.x += w; return this; }
  /** Klippenhänger: schmale Griffleisten mit Lücken – am Ende einer Leiste mit Sprung zur nächsten hechten */
  ledges(segs, { h = 2.4, w = 3, g0 = 1.0, land = 0.9 } = {}) {
    this.sec('Klippenhänger'); const y = this.y + h; let x = this.x + g0;
    segs.forEach(([len, gap], i) => { if (i) x += gap; this.o.push({ k: 'bars', ledge: true, x1: x, x2: x + len, y }); x += len; });
    this.x = x + land; this.plat(this.x, w, this.y); this.x += w; return this;
  }
  /** Pendelbalken: gepolsterte Balken schwingen quer über die Bahn – ducken, rutschen oder den richtigen Moment abpassen */
  logs(span, n, { len = 3.2, amp = 1.0, period = 2.8, low = 1.36 } = {}) {
    this.sec('Pendelbalken'); const x0 = this.x; this.plat(x0, span, this.y);
    for (let i = 0; i < n; i++) this.o.push({ k: 'log', px: x0 + (span / (n + 1)) * (i + 1), py: this.y + low + len, len, amp, period, phase: i * 2.1 + 0.6 });
    this.x += span; return this;
  }
  /** Rutschtunnel: niedrige Tore auf einer langen Bahn – nur geduckt bzw. rutschend kommt man durch */
  tunnel(span, gates, { gap = 1.15, gw = 1.3 } = {}) {
    this.sec('Rutschtunnel'); const x0 = this.x; this.plat(x0, span, this.y);
    for (let i = 0; i < gates; i++) { const cx = x0 + (span / (gates + 1)) * (i + 1); this.o.push({ k: 'gate', x: cx - gw / 2, w: gw, y: this.y, gap, h: 3.6 }); }
    this.x += span; return this;
  }
  /** Lachsleiter: an einer Stange hängend mit Sprung Sprosse für Sprosse nach oben – im Takt drücken, zu früh = abrutschen */
  ladder(n, { gap = 0.55, g = 1.5, w = 3.2, base = 2.8, drop = 0.3 } = {}) {
    this.sec('Lachsleiter'); const yb = this.y, lx = this.x + g, y0 = this.y + base; this.o.push({ k: 'ladder', x: lx, y0, n, gap });
    const top = y0 + (n - 1) * gap; this.y = top - 0.9; this.plat(lx + 0.75, w, this.y); this.x = lx + 0.75 + w; this.y = yb + drop; return this;   // danach geht es wieder hinunter
  }
  wall(g = 1.5, h = 4.2) { /* Durchgängiger Anlauf ab der letzten Plattform bis direkt zur Wand. */ this.sec('Steilwand'); const wx = this.x + g + 2.6; this.plat(this.x - 0.15, g + 2.75, this.y); this.o.push({ k: 'wall', x: wx, y: this.y, h, w: 0.6 }); this.o.push({ k: 'plat', x: wx, y: this.y + h, w: 3.6 }); this.o.push({ k: 'finish', x: wx + 1.6, y: this.y + h }); this.end = wx + 3.6; this.wallX = wx; return this; }
  build() { return { name: this.name, o: this.o, secs: this.secs, finish: this.o.find(o => o.k === 'finish'), length: this.end, wallX: this.wallX }; }
}
export const COURSES = [
  // Vorrunde wie im TV: 8 Hindernisse, am Ende die Steilwand (4,25 m)
  new Builder('Vorrunde').start(6).stones([{ g: 2.0, w: 2.0 }, { g: 2.2, w: 1.8, dy: 0.3 }, { g: 2.2, w: 1.8, dy: 0.3 }, { g: 2.4, w: 1.8, dy: -0.3 }, { g: 2.2, w: 2.2, dy: -0.3 }]).rest(3, 0, 2.0)
    .rolls(3, { g0: 1.3, r: 0.8, v: -1.6 }).rest(3, 0, 1.6).logs(10, 2, { period: 3.0 }).sinkers(4, 2.0, 2.0, 0.7).rest(3, 0, 2.0)
    .rope(5.0).rest(3.2, 0, 0).tunnel(9, 2).rest(1.5, 0, 0).ledges([[2.6, 0], [2.4, 1.0]]).wall(1.5, 4.25).build(),
  new Builder('Halbfinale').start(5).stones([{ g: 2.6, w: 1.8 }, { g: 2.8, w: 1.6, dy: 0.4 }, { g: 2.8, w: 1.6, dy: -0.4 }, { g: 3.0, w: 1.8 }, { g: 2.8, w: 1.6, dy: 0.3 }, { g: 3.0, w: 1.8 }]).rest(2.6, 0, 2.0)
    .rolls(4, { g0: 1.4, r: 0.75, v: -2.2 }).rest(2.6, 0, 1.6).swings(14, 3, { period: 2.8 }).mover({ g: 2.2, w: 2.2, ax: 0, ay: 0.9, period: 3.6, dy: 0.2 }).rest(3, 0, 2.0)
    .rings(3).logs(12, 3, { period: 2.6 }).sinkers(5, 2.2, 1.7, 0.55).rest(2.6, 0, 2.0).ladder(5).rest(2.4, 0, 2.2).trampBars(7.5)
    .mover({ g: 2.6, w: 2.2, ax: 3.0, period: 4.0 }).rest(2.4, 0, 2.0).wall(1.4, 4.5).build(),
  new Builder('Finale').start(5).stones([{ g: 2.8, w: 1.5 }, { g: 2.6, w: 1.4, dy: 0.5 }, { g: 3.2, w: 1.4, dy: -0.5 }, { g: 3.0, w: 1.4 }, { g: 2.6, w: 1.4, dy: 0.4 }, { g: 3.0, w: 1.4 }, { g: 3.0, w: 1.5, dy: -0.3 }]).rest(2.4, 0, 2.0)
    .rolls(5, { g0: 1.5, r: 0.7, v: -2.8 }).rest(2.4, 0, 1.6).tunnel(10, 3).mover({ g: 2.4, w: 2.0, ax: 3.4, period: 3.4 }).sinkers(6, 2.4, 1.5, 0.45).rest(2.6, 0, 2.2)
    .swings(16, 3, { period: 2.6, amp: 1.0, spread: 1.6 }).rope(5.4, { amp: 0.64, period: 2.4 }).rest(2.4, 0, 0).ledges([[2.2, 0], [1.8, 1.1], [1.8, 1.2]], { h: 2.5 })
    .rings(4, { period: 2.0 }).logs(13, 3, { period: 2.4, amp: 1.05 }).ladder(6).rest(2.4, 0, 2.2)
    .mover({ g: 2.4, w: 2.0, ax: 0, ay: 1.2, period: 3.0, dy: 0.3 }).rest(2.4, 0, 2.2).trampBars(10.5).sinkers(4, 2.4, 1.5, 0.45).rest(2.4, 0, 2.2)
    .bars(12.5, 2.5, 2.6, 0.4).wall(1.2, 5.0).build()
];

// ---------------------------------------------------------------- Bewegte Hindernisse (reine Funktionen der Zeit)
export const movePos = (o, t) => { const a = (2 * Math.PI * t) / o.period + (o.phase || 0); return { x: o.x + o.ax * Math.sin(a), y: o.y + o.ay * Math.sin(a) }; };
export const swingBall = (o, t) => { const a = o.amp * Math.sin((2 * Math.PI * t) / o.period + o.phase); return { x: o.px + o.len * Math.sin(a), y: o.py - o.len * Math.cos(a), a }; };
/** Seilwinkel a und Winkelgeschwindigkeit da zur Zeit t */
export const ropeAt = (o, t) => { const w = (2 * Math.PI) / o.period, u = w * t + o.phase; return { a: o.amp * Math.sin(u), da: o.amp * w * Math.cos(u) }; };
/** Lachsleiter: Höhe der Sprosse k */
export const rungY = (o, k) => o.y0 + k * o.gap;

// ---------------------------------------------------------------- Simulation
export class Sim {
  constructor(course) {
    this.c = course; this.t = 0; this.x = 2; this.y = course.o[0].y; this.px = this.x; this.py = this.y; this.vx = 0; this.vy = 0; this.ground = null; this.onGround = true; this.coyote = COYOTE; this.buf = 0; this.prevJ = false; this.prevG = false;
    this.hang = null; this.rope = null; this.ladder = null; this.duck = false; this.slide = false; this.boost = false; this.wallTries = 0; this.wallHit = false; this.stun = 0; this.wall = null; this.dead = null; this.finished = false; this.face = 1; this.hits = 0; this.dist = 0; this.grabCool = 0;
    this.sinks = course.o.map(o => (o.k === 'sink' ? { touch: -1, y: 0, vy: 0, gone: false } : null)); this.solids = [];
    this.collect();
  }
  clone() {
    const s = Object.create(Sim.prototype); Object.assign(s, this); s.sinks = this.sinks.map(k => (k ? { touch: k.touch, y: k.y, vy: k.vy, gone: k.gone } : null));
    s.hang = this.hang ? { bar: this.hang.bar } : null; s.rope = this.rope ? Object.assign({}, this.rope) : null; s.wall = this.wall ? Object.assign({}, this.wall) : null; s.ladder = this.ladder ? Object.assign({}, this.ladder) : null;
    s.solids = []; s.collect(); s.ground = this.ground ? s.solids.find(q => q.i === this.ground.i) || null : null; return s;
  }
  /** aktuelle Körperhöhe (geduckt kleiner) */
  get h() { return this.duck ? PH_DUCK : PH; }
  /** aktuelle feste Flächen (Boden-Plattformen, Wand, Tore) mit Geschwindigkeit für das Mitfahren */
  collect() {
    const out = [], t = this.t;
    this.c.o.forEach((o, i) => {
      if (o.k === 'plat') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 0.5, vx: 0, vy: 0 });
      else if (o.k === 'move') { const p = movePos(o, t), q = movePos(o, t - DT); out.push({ i, x0: p.x, x1: p.x + o.w, top: p.y, bot: p.y - 0.5, vx: (p.x - q.x) / DT, vy: (p.y - q.y) / DT }); }
      else if (o.k === 'sink') { const k = this.sinks[i]; if (!k.gone) out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y + k.y, bot: o.y + k.y - 0.5, vx: 0, vy: k.vy }); }
      else if (o.k === 'roll') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 2 * o.r + 0.2, vx: o.v, vy: 0 });
      else if (o.k === 'tramp') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y, bot: o.y - 0.5, vx: 0, vy: 0 });
      else if (o.k === 'wall') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y + o.h, bot: -5, vx: 0, vy: 0, wall: true });
      else if (o.k === 'gate') out.push({ i, x0: o.x, x1: o.x + o.w, top: o.y + o.h, bot: o.y + o.gap, vx: 0, vy: 0, gate: true });
    });
    this.solids = out;
  }
  /** Platz zum Aufrichten? (kein Tor/keine Decke zwischen geduckter und voller Höhe) */
  roomToStand() { for (const s of this.solids) if (s.bot > this.y + 0.05 && s.bot < this.y + PH && s.top > this.y && this.x + PW / 2 > s.x0 + 0.02 && this.x - PW / 2 < s.x1 - 0.02) return false; return true; }
  nearBar() {
    for (let i = 0; i < this.c.o.length; i++) {
      const o = this.c.o[i]; if (o.k !== 'bars') continue; const m = o.ledge ? 0.1 : 0.3;
      if (this.x >= o.x1 - m && this.x <= o.x2 + m) { const head = this.y + PH; if (head >= o.y - 0.55 && head <= o.y + 0.35) return { i, o }; }
    }
    return null;
  }
  /** Seil/Ring in Griffweite der Hände? → { i, d } (d = Abstand der Hände vom Aufhängepunkt) */
  nearRope() {
    const hx = this.x, hy = this.y + PH;
    for (let i = 0; i < this.c.o.length; i++) {
      const o = this.c.o[i]; if (o.k !== 'rope') continue; const { a } = ropeAt(o, this.t), dx = Math.sin(a), dy = -Math.cos(a), px = hx - o.px, py = hy - o.py, d = px * dx + py * dy;
      if (d < (o.ring ? o.len - 0.4 : 1.4) || d > o.len + (o.ring ? 0.25 : 0.15)) continue;
      if (Math.abs(px * dy - py * dx) < (o.ring ? 0.5 : 0.45)) return { i, d: o.ring ? o.len : Math.min(d, o.len - 0.05) };
    }
    return null;
  }
  /** Lachsleiter in Griffweite? (unterste Sprosse über dem Kopf) */
  nearLadder() {
    for (let i = 0; i < this.c.o.length; i++) { const o = this.c.o[i]; if (o.k !== 'ladder') continue; const head = this.y + PH; if (Math.abs(this.x - o.x) < 0.8 && head >= o.y0 - 0.6 && head <= o.y0 + 0.45) return i; }
    return -1;
  }
  /** Rechteck des Spielers trifft Kreis (Sandsack = drei Kreise entlang des Seils) */
  swingHit(o) {
    const b = swingBall(o, this.t), sx = Math.sin(b.a), sy = -Math.cos(b.a), offs = o.h ? [-o.h * 0.36, 0, o.h * 0.36] : [0], h = this.h;
    for (const f of offs) { const px = b.x + sx * f, py = b.y + sy * f, cx = Math.max(this.x - PW / 2, Math.min(this.x + PW / 2, px)), cy = Math.max(this.y, Math.min(this.y + h, py)); if (Math.hypot(px - cx, py - cy) < o.r) return true; }
    return false;
  }
  /** Pendelbalken: Balken am Pendel bleibt waagerecht; Treffer = Rechtecke überlappen */
  logHit(o) { const b = swingBall(o, this.t); return Math.abs(b.x - this.x) < LOG_HW + PW / 2 && b.y + LOG_HH > this.y && b.y - LOG_HH < this.y + this.h; }
  knock(dir, vx, vy, stun) { this.stun = stun; this.hits++; this.boost = false; this.vx = dir * vx; this.vy = vy; this.onGround = false; this.ground = null; this.hang = null; this.rope = null; this.ladder = null; this.grabCool = 0.3; }
  step(inp, dt = DT) {
    if (this.dead || this.finished) return; this.px = this.x; this.py = this.y; this.t += dt; const L = inp.l ? 1 : 0, R = inp.r ? 1 : 0, J = !!inp.j, D = !!(inp.d || inp.g);
    // Absinkende Plattformen
    this.sinks.forEach((k, i) => { if (!k || k.gone) return; if (k.touch >= 0 && this.t - k.touch >= this.c.o[i].delay) { k.vy -= 20 * dt; k.y += k.vy * dt; if (k.y < -4) k.gone = true; } });
    this.collect();
    if (this.stun > 0) this.stun -= dt;
    // Wandlauf (Skript)
    if (this.wall) { const w = this.wall; w.p += dt / (WALLRUN_T * (w.h || 4.2) / 4.2); const e = Math.min(1, w.p), ease = 1 - Math.pow(1 - e, 2); this.x = w.x0 + (w.x1 - w.x0) * ease; this.y = w.y0 + (w.y1 - w.y0) * ease; if (w.p >= 1) { this.wall = null; this.onGround = true; this.vx = 0; this.vy = 0; this.coyote = COYOTE; this.collect(); } this.check(); return; }
    // Am Seil/Ring: Hände folgen dem Seil, Sprung = loslassen (mit dem Schwung des Seils)
    if (this.rope) {
      const o = this.c.o[this.rope.i], { a, da } = ropeAt(o, this.t), d = this.rope.d; this.rope.a = a; this.rope.da = da; this.face = 1; this.duck = false;
      this.vx = d * da * Math.cos(a); this.vy = d * da * Math.sin(a); this.x = o.px + d * Math.sin(a); this.y = o.py - d * Math.cos(a) - PH;
      if (J && !this.prevJ) { this.rope = null; this.grabCool = o.ring ? 0.3 : 0.4; this.vx += 1.2; this.vy += 3.6; this.boost = true; this.prevJ = J; }
      else { this.prevJ = J; this.dist = Math.max(this.dist, this.x); this.hazards(); this.check(); return; }
    }
    // Lachsleiter: Sprung im Takt = eine Sprosse höher; zu früh = abrutschen; oben = Absprung auf die Plattform
    if (this.ladder) {
      const o = this.c.o[this.ladder.i], L2 = this.ladder; L2.cool -= dt; this.duck = false; this.vx = 0; this.vy = 0; this.face = 1;
      if (J && !this.prevJ) {
        if (L2.cool > LADDER_HOP - LADDER_EARLY) { L2.k--; L2.cool = LADDER_HOP; L2.slips = (L2.slips || 0) + 1; }
        else { L2.k++; L2.cool = LADDER_HOP; }
      }
      this.prevJ = J;
      if (L2.k < 0) { this.ladder = null; this.grabCool = 0.5; this.vy = -1; }
      else if (L2.k >= o.n - 1) { this.ladder = null; this.grabCool = 0.5; this.x = o.x; this.y = rungY(o, o.n - 1) - PH; this.vx = 4.0; this.vy = 7.0; this.boost = true; }
      else { this.x = o.x; this.y = rungY(o, L2.k) - PH; this.dist = Math.max(this.dist, this.x); this.hazards(); this.check(); return; }
    }
    // Hängen an Stangen bzw. Griffleiste
    if (this.hang) {
      const o = this.c.o[this.hang.bar]; this.duck = false; this.vy = 0; this.vx = (R - L) * HANG_SPEED * (o.ledge ? 0.8 : 1) * (this.stun > 0 ? 0 : 1); this.x += this.vx * dt; if (R - L) this.face = R - L; this.y = o.y - PH;
      if (o.ledge) {
        // Griffleiste: an den Enden festhalten; Sprung = Hechtsprung nach vorn zur nächsten Leiste (oder auf die Plattform)
        this.x = Math.max(o.x1 + 0.05, Math.min(o.x2 - 0.05, this.x));
        if (J && !this.prevJ) { this.hang = null; this.grabCool = 0.16; this.vy = 4.2; this.vx = 4.6 * (this.face < 0 ? -1 : 1); this.boost = true; }
        else { this.prevJ = J; this.dist = Math.max(this.dist, this.x); this.hazards(); this.check(); return; }
      }
      // Am Ende der Stangen automatisch abschwingen; Sprung = Absprung nach vorn
      else if (this.x > o.x2 + 0.1) { this.hang = null; this.grabCool = 0.35; this.vy = 6; this.vx = 5; this.face = 1; } else if (this.x < o.x1 - 0.35) { this.hang = null; this.grabCool = 0.35; } else if (J && !this.prevJ) { this.hang = null; this.grabCool = 0.35; this.vy = 7.2; this.vx = this.face * 5.5; } else { this.prevJ = J; this.dist = Math.max(this.dist, this.x); this.hazards(); this.check(); return; }
      this.prevJ = J;
    }
    const ctl = this.stun > 0 ? 0 : 1, dir = (R - L) * ctl;
    // Ducken/Rutschen: nur am Boden; aufstehen nur, wenn darüber Platz ist
    if (this.onGround && D && ctl) { if (!this.duck) { this.duck = true; this.slide = Math.abs(this.vx) > SLIDE_MIN; } }
    else if (this.duck && (!this.onGround || !D || !ctl) && this.roomToStand()) { this.duck = false; this.slide = false; }
    if (this.duck && this.slide) { const f = SLIDE_DECEL * dt; this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f; if (Math.abs(this.vx) < CRAWL) this.slide = false; }
    else {
      const top = this.duck ? CRAWL : RUN, accel = this.onGround ? ACC : AIR_ACC;
      if (dir) { const target = dir * top, dv = accel * dt; this.vx = Math.abs(target - this.vx) <= dv ? target : this.vx + Math.sign(target - this.vx) * dv; this.face = dir; }
      else if (this.onGround) { const f = FRICTION * dt; this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f; }
    }
    if (this.onGround && this.ground) this.coyote = COYOTE; else this.coyote -= dt;
    if (J && !this.prevJ && ctl) this.buf = BUFFER; else this.buf -= dt; this.prevJ = J;
    if (this.buf > 0 && this.coyote > 0 && (!this.duck || this.roomToStand())) {
      // Wandlauf an der letzten Wand starten?
      const wo = this.c.o.find(o => o.k === 'wall');
      if (wo && this.onGround && Math.abs(this.vx) >= WALLRUN_MIN && this.x >= wo.x - 2.6 && this.x <= wo.x - 0.15) { this.wall = { p: 0, h: wo.h, x0: this.x, y0: this.y, x1: wo.x + 0.9, y1: wo.y + wo.h }; this.buf = 0; this.coyote = 0; this.onGround = false; this.ground = null; this.duck = false; this.slide = false; return; }
      this.vy = JUMP_V; this.onGround = false; this.ground = null; this.coyote = 0; this.buf = 0; this.duck = false; this.slide = false;
    }
    if (this.boost && this.vy <= 0) this.boost = false; if (!J && this.vy > 3.5 && !this.boost) this.vy -= 55 * dt;   // kurzer Tipp = kleiner Sprung
    // Greifen: in der Luft an Stangen, Leisten, Seil, Ringen und Lachsleiter automatisch
    this.grabCool -= dt;
    if (!this.onGround && ctl && this.grabCool <= 0) {
      const b = this.nearBar(); if (b) { this.hang = { bar: b.i }; this.vx = 0; this.vy = 0; this.y = b.o.y - PH; this.duck = false; this.hazards(); return; }
      const rp = this.nearRope(); if (rp) { this.rope = rp; this.boost = false; this.duck = false; return; }
      const li = this.nearLadder(); if (li >= 0) { this.ladder = { i: li, k: 0, cool: 0.15 }; this.vx = 0; this.vy = 0; this.duck = false; this.x = this.c.o[li].x; this.y = rungY(this.c.o[li], 0) - PH; return; }
    }
    this.vy -= G * dt; const vIn = this.vy;   // Fallgeschwindigkeit vor dem Aufsetzen (für das Trampolin)
    let carryX = 0, carryY = 0; if (this.onGround && this.ground) { carryX = this.ground.vx * dt; carryY = this.ground.vy * dt; }
    this.moveX(this.vx * dt + carryX);
    this.moveY(this.vy * dt + carryY, dt);
    if (this.onGround && this.ground) {
      const o = this.c.o[this.ground.i]; if (o.k === 'sink') { const k = this.sinks[this.ground.i]; if (k.touch < 0) k.touch = this.t; }
      if (o.k === 'tramp' && vIn < -1.5) { this.vy = o.bounce; this.onGround = false; this.ground = null; this.boost = true; this.bounces = (this.bounces || 0) + 1; }
      else { this.boost = false; if (this.wallHit) { this.wallHit = false; if (this.wallTries >= 3) { this.dead = 'wall'; return; } } }
    }
    this.hazards();
    this.dist = Math.max(this.dist, this.x); this.check();
  }
  /** waagerecht bewegen und seitlich an festen Flächen anhalten */
  moveX(dx) {
    this.x += dx; const h = this.h;
    for (const s of this.solids) {
      if (!(this.y < s.top && this.y + h > s.bot + 0.02 && this.x + PW / 2 > s.x0 && this.x - PW / 2 < s.x1)) continue;
      // Kantenhilfe: knapp verfehlte Kante wird noch erwischt (nicht an Wand und Toren)
      if (!s.wall && !s.gate && this.y >= s.top - 0.45 && this.vy <= 3 && !(this.ground && this.ground.i === s.i)) { this.y = s.top; if (this.vy < 0) this.vy = 0; continue; }
      if (!s.gate && this.y >= s.top - 0.2) { if (!(this.ground && this.ground.i === s.i)) { this.y = s.top; if (this.vy < 0) this.vy = 0; } continue; }   // fast oben: auf die Kante stellen statt darin zu stecken
      const penL = this.x + PW / 2 - s.x0, penR = s.x1 - (this.x - PW / 2);
      if (penL < penR) { if (s.wall && !this.onGround && !this.wallHit && this.vx > 0) { this.wallHit = true; this.wallTries++; } this.x = s.x0 - PW / 2; if (this.vx > 0) this.vx = 0; }
      else { this.x = s.x1 + PW / 2; if (this.vx < 0) this.vx = 0; }
      if (s.gate) this.slide = false;
    }
  }
  /** senkrecht bewegen: landen (auch auf mitfahrenden Flächen) und Kopfstoß */
  moveY(dy, dt) {
    const y0 = this.y, h = this.h; this.y += dy; this.onGround = false; this.ground = null;
    for (const s of this.solids) {
      if (!(this.x + PW / 2 > s.x0 + 0.02 && this.x - PW / 2 < s.x1 - 0.02)) continue;
      const topPrev = s.top - s.vy * dt;
      if (this.vy <= 0.01 && y0 >= topPrev - 0.03 && this.y <= s.top + 0.001) { this.y = s.top; this.vy = 0; this.onGround = true; this.ground = s; }
      else if (this.vy > 0 && y0 + h <= s.bot + 0.05 && this.y + h > s.bot) { this.y = s.bot - h; this.vy = 0; }
    }
  }
  /** Pendel: Sandsäcke und Pendelbalken werfen den Läufer zurück */
  hazards() {
    if (this.stun > 0) return;
    for (const o of this.c.o) {
      if (o.k === 'swing' && this.swingHit(o)) { const b = swingBall(o, this.t); this.knock(this.x < b.x ? -1 : 1, 4.5, 5, 0.55); return; }
      if (o.k === 'log' && this.logHit(o)) { const b = swingBall(o, this.t), w = (2 * Math.PI) / o.period, da = o.amp * w * Math.cos((2 * Math.PI * this.t) / o.period + o.phase), push = Math.abs(da) > 0.3 ? Math.sign(da) : this.x < b.x ? -1 : 1; this.knock(push, 4.2 + Math.abs(da) * 1.2, 4.5, 0.6); return; }
    }
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
