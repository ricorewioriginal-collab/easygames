/* Feuerwerk über Rainbow City: an Silvester um Mitternacht über der Skyline, samstags nach der CSD-Parade über dem Hafen
   und als Finale der Live-Events (live.ts). Sparsam gebaut: ein fester Vorrat von Raketen. Jede Explosion ist ein einziges
   Mesh aus Funken-Streifen, das nur skaliert, sinkt und ausblendet (keine Partikelsysteme, keine Geometrie im Bild-Takt).
   Weihnachtsbaum und Lichterketten auf der Pride Plaza in der Adventszeit (Dezember oder Festtage in den Optionen). */
import { Mesh, Node3, VertexData, type Scene, type Vector3, type PBRMaterial } from '../engine/bjs';
import { sphere, cyl, glow, pbr } from '../engine/geo';
import { sfx } from '../engine/Audio';
import type { World } from './World';

const COLORS = [0xff3b6b, 0xffd23b, 0x3ee69a, 0x3a9bff, 0xb56bff, 0xff8a3b, 0xffffff, 0xff4fd8];

interface Shell { burst: Mesh; rocket: Mesh; mat: PBRMaterial; x: number; z: number; y: number; top: number; t: number; up: number; on: boolean }

/** Funkenkugel mit Einheitsradius: n Streifen von 0,7 bis 1 entlang zufälliger Richtungen (je zwei gekreuzte Plättchen) */
function burstMesh(sc: Scene, n: number, seed: number) {
  const pos: number[] = [], idx: number[] = [];
  let s0 = seed; const rnd = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - u * u), dx = r * Math.cos(a), dy = u, dz = r * Math.sin(a), w = .018;
    const ax = [dy, -dx, 0], bx = [0, dz, -dy];   // zwei Querrichtungen (nicht normiert, reicht für dünne Streifen)
    for (const q of [ax, bx]) {
      const b = pos.length / 3, l0 = .62, l1 = 1;
      pos.push(dx * l0 - q[0] * w, dy * l0 - q[1] * w, dz * l0 - q[2] * w, dx * l0 + q[0] * w, dy * l0 + q[1] * w, dz * l0 + q[2] * w,
        dx * l1 + q[0] * w * 2, dy * l1 + q[1] * w * 2, dz * l1 + q[2] * w * 2, dx * l1 - q[0] * w * 2, dy * l1 - q[1] * w * 2, dz * l1 - q[2] * w * 2);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
  const vd = new VertexData(); vd.positions = pos; vd.indices = idx;
  const m = new Mesh('feuerwerk', sc); vd.applyToMesh(m);
  return m;
}

export class Fireworks {
  private shells: Shell[] = [];
  /** laufende Show: Ort, Restzeit, Abstand bis zur nächsten Rakete */
  private shows: Array<{ x: number; z: number; left: number; next: number; spread: number; big: boolean }> = [];
  constructor(private scene: Scene, private world: World) {}

  private build() {
    const sc = this.scene, n = this.world.low ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const mat = glow(sc, COLORS[i % COLORS.length], 2.2, { alpha: 1, add: true, double: true });
      const burst = burstMesh(sc, this.world.low ? 40 : 64, 17 + i * 131); burst.material = mat;
      const rocket = sphere(sc, .22, 6); rocket.material = glow(sc, 0xfff2c0, 2.4);
      for (const m of [burst, rocket]) { m.isPickable = false; m.applyFog = false; m.alwaysSelectAsActiveMesh = true; m.setEnabled(false); }
      this.shells.push({ burst, rocket, mat, x: 0, z: 0, y: 0, top: 60, t: 0, up: 1.4, on: false });
    }
  }
  /** Show starten: Raketen um (x, z) für sec Sekunden; big = Silvester (dichter, größer) */
  show(x: number, z: number, sec: number, big = false, spread = 30) {
    if (!this.shells.length) this.build();
    this.shows.push({ x, z, left: sec, next: 0, spread, big });
  }
  get active() { return this.shows.length > 0 || this.shells.some((s) => s.on); }
  stop() { this.shows.length = 0; for (const s of this.shells) { s.on = false; s.burst.setEnabled(false); s.rocket.setEnabled(false); } }

  private launch(sh: { x: number; z: number; spread: number; big: boolean }) {
    const s = this.shells.find((q) => !q.on); if (!s) return;
    s.on = true; s.t = 0; s.up = 1.1 + Math.random() * .6;
    s.x = sh.x + (Math.random() * 2 - 1) * sh.spread; s.z = sh.z + (Math.random() * 2 - 1) * sh.spread * .6;
    s.y = 2; s.top = (sh.big ? 34 : 26) + Math.random() * 16;   // über der Skyline, aber noch im Blickfeld der Kamera
    s.rocket.setEnabled(true); s.rocket.position.set(s.x, s.y, s.z); s.burst.setEnabled(false);
    s.burst.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    (s.burst as Mesh & { _r?: number })._r = (sh.big ? 15 : 10) + Math.random() * 6;
  }

  /** ref = Spieler (für Lautstärke), quiet = keine Töne (Menü offen) */
  update(dt: number, ref: Vector3, quiet = false) {
    for (let i = this.shows.length - 1; i >= 0; i--) {
      const sh = this.shows[i];
      sh.left -= dt; sh.next -= dt;
      if (sh.next <= 0) { sh.next = (sh.big ? .35 : .7) + Math.random() * (sh.big ? .5 : .9); this.launch(sh); if (sh.big && Math.random() < .4) this.launch(sh); }
      if (sh.left <= 0) this.shows.splice(i, 1);
    }
    const w = this.world.wx;
    w.boom = Math.max(0, w.boom - dt * 3);
    for (const s of this.shells) {
      if (!s.on) continue;
      s.t += dt;
      if (s.t < s.up) {
        // Rakete steigt mit leichtem Zittern
        const k = s.t / s.up;
        s.rocket.position.set(s.x + Math.sin(s.t * 23) * .15, 2 + (s.top - 2) * (1 - (1 - k) * (1 - k)), s.z);
        continue;
      }
      if (s.rocket.isEnabled()) {
        s.rocket.setEnabled(false); s.burst.setEnabled(true); s.burst.position.set(s.x, s.top, s.z);
        const d = Math.hypot(ref.x - s.x, ref.z - s.z);
        if (!quiet && d < 260) setTimeout(() => sfx('boom'), Math.min(900, d * 3));
        w.boom = Math.max(w.boom, Math.max(0, .5 - d / 500));
      }
      const b = s.t - s.up, life = 2.8, R = (s.burst as Mesh & { _r?: number })._r || 10;
      const r = R * (1 - Math.exp(-b * 3.2));
      s.burst.scaling.setAll(Math.max(.01, r));
      s.burst.position.y = s.top - 1.6 * b * b;
      s.burst.visibility = Math.max(0, 1 - b / life) * (b < .08 ? b / .08 : 1);
      if (b > life) { s.on = false; s.burst.setEnabled(false); }
    }
  }
}

/** Adventszeit auf der Pride Plaza: großer Weihnachtsbaum mit Lichterkugeln und Stern (nur gebaut, wenn er gebraucht wird) */
export class XmasTree {
  private root: Node3 | null = null;
  private lights: Mesh[] = [];
  constructor(private scene: Scene, private x: number, private z: number) {}
  set(on: boolean) {
    if (on && !this.root) this.build();
    if (this.root && this.root.isEnabled() !== on) this.root.setEnabled(on);
  }
  private build() {
    const sc = this.scene, r = this.root = new Node3('weihnachtsbaum', sc);
    r.position.set(this.x, 0, this.z);
    const green = pbr(sc, 0x1f6b3a, .85), trunk = pbr(sc, 0x6b4426, .9);
    const P = (m: Mesh, y: number) => { m.parent = r; m.position.y = y; m.isPickable = false; return m; };
    P(cyl(sc, .35, .45, 1.2, 10), 0.6).material = trunk;
    [[2.6, 2.2, 1.2], [2.1, 1.9, 2.8], [1.6, 1.7, 4.2], [1.05, 1.5, 5.5]].forEach(([w, h, y]) => { P(cyl(sc, 0, w, h * 1.4, 14), y + h * .5).material = green; });
    P(sphere(sc, .38, 8), 7.3).material = glow(sc, 0xffd23b, 2.4);
    const cols = [0xff3b6b, 0xffd23b, 0x3a9bff, 0xb56bff, 0x3ee69a, 0xff8a3b];
    const mats = cols.map((c) => glow(sc, c, 1.8));
    for (let i = 0; i < 30; i++) {
      const y = 1.6 + (i / 30) * 5, rad = 2.5 * (1 - (y - 1.4) / 6.2) + .1, a = i * 2.4;
      const b = P(sphere(sc, .13, 6), y); b.position.x = Math.sin(a) * rad; b.position.z = Math.cos(a) * rad; b.material = mats[i % mats.length];
      this.lights.push(b);
    }
    r.computeWorldMatrix(true);
    r.getChildMeshes().forEach((m) => { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; });
  }
}
