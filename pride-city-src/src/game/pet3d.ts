/* Haustier in 3D: Hund oder Katze aus weichen Formen (glatt schattiert, keine Klötze), läuft dir in der Wohnung nach,
   wedelt mit dem Schwanz und setzt sich, wenn du stehen bleibst. Kostet fast nichts: ein Dutzend kleine Meshes. */
import { TransformNode, Vector3, type Scene, type Mesh } from '../engine/bjs';
import { sphere, cyl, pbr } from '../engine/geo';

export class Pet3D {
  readonly root: TransformNode;
  private tail: TransformNode; private head: TransformNode; private legs: TransformNode[] = [];
  private t = 0; private walk = 0;
  constructor(sc: Scene, readonly kind: 'hund' | 'katze', color: number) {
    const r = (this.root = new TransformNode('pet', sc)), fur = pbr(sc, color, .9), dark = pbr(sc, 0x1a1414, .4), light = pbr(sc, 0xf4ece4, .9);
    const cat = kind === 'katze', S = cat ? .8 : 1;
    const put = (m: Mesh, p: TransformNode, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => { m.parent = p; m.position.set(x, y, z); m.scaling.set(sx, sy, sz); m.isPickable = false; (m as Mesh & { _pcCast?: boolean })._pcCast = true; return m; };
    const body = put(sphere(sc, .2 * S, 16), r, 0, .3 * S, 0, .85, .8, 1.5); body.material = fur;
    put(sphere(sc, .12 * S, 12), r, 0, .27 * S, .06 * S, 1, .7, 1.3).material = light;   // heller Bauch
    this.head = new TransformNode('petHead', sc); this.head.parent = r; this.head.position.set(0, .46 * S, .3 * S);
    put(sphere(sc, .13 * S, 16), this.head, 0, 0, 0, 1, .95, cat ? .95 : 1.05).material = fur;
    put(sphere(sc, cat ? .05 : .075, 12), this.head, 0, -.04 * S, .11 * S, 1, .8, cat ? .8 : 1.4).material = light;   // Schnauze
    put(sphere(sc, .022, 8), this.head, 0, -.01 * S, (cat ? .155 : .2) * S).material = dark;                          // Nase
    for (const x of [-.05, .05]) put(sphere(sc, .022, 8), this.head, x * S, .04 * S, .11 * S).material = dark;        // Augen
    for (const x of [-1, 1]) {
      const ear = cat ? cyl(sc, 0, .05, .09, 8) : sphere(sc, .05, 10);
      put(ear, this.head, x * .07 * S, cat ? .13 * S : .02 * S, cat ? 0 : -.02, cat ? 1 : .55, cat ? 1 : 1.5, cat ? .6 : 1).material = fur;
      if (!cat) { ear.rotation.z = x * .5; ear.position.y = .0; ear.position.x = x * .11 * S; }
    }
    for (const [x, z] of [[-.08, .17], [.08, .17], [-.08, -.17], [.08, -.17]]) {
      const leg = new TransformNode('leg', sc); leg.parent = r; leg.position.set(x * S, .22 * S, z * S);
      put(cyl(sc, .035 * S, .03 * S, .22 * S, 8), leg, 0, -.11 * S, 0).material = fur;
      put(sphere(sc, .036 * S, 8), leg, 0, -.21 * S, .01).material = cat ? fur : light;
      this.legs.push(leg);
    }
    this.tail = new TransformNode('tail', sc); this.tail.parent = r; this.tail.position.set(0, .36 * S, -.27 * S);
    const tl = put(cyl(sc, .015, cat ? .028 : .035, cat ? .3 : .2, 8), this.tail, 0, cat ? .15 : .09, -.02);
    tl.material = fur; tl.rotation.x = cat ? -.25 : -.6;
    r.scaling.setAll(cat ? 1 : 1.15);
  }
  place(x: number, z: number, ry = 0) { this.root.position.set(x, 0, z); this.root.rotation.y = ry; }
  /** Nachlaufen: bleibt etwa 0,9 m hinter dem Ziel; happy = Schwanz wedelt schneller */
  update(dt: number, target: Vector3 | null, happy: boolean, bounds: [number, number, number, number]) {
    this.t += dt;
    const p = this.root.position;
    let moving = false;
    if (target) {
      const dx = target.x - p.x, dz = target.z - p.z, d = Math.hypot(dx, dz);
      if (d > 1.1) {
        const sp = Math.min(3.4, (d - .9) * 2.4) * dt; p.x += dx / d * sp; p.z += dz / d * sp; moving = true;
        let dr = Math.atan2(dx, dz) - this.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); this.root.rotation.y += dr * Math.min(1, dt * 8);
      } else { let dr = Math.atan2(dx, dz) - this.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); this.root.rotation.y += dr * Math.min(1, dt * 3); }
      p.x = Math.max(bounds[0], Math.min(bounds[1], p.x)); p.z = Math.max(bounds[2], Math.min(bounds[3], p.z));
    }
    this.walk += (moving ? 1 : -1) * dt * 5; this.walk = Math.max(0, Math.min(1, this.walk));
    const ph = this.t * 11;
    this.legs.forEach((l, i) => { l.rotation.x = Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * .55 * this.walk; });
    this.root.position.y = Math.abs(Math.sin(ph)) * .02 * this.walk;
    this.tail.rotation.y = Math.sin(this.t * (happy ? (this.kind === 'hund' ? 16 : 3) : 2)) * (happy ? .6 : .2);
    this.head.rotation.x = moving ? .05 : Math.sin(this.t * 1.3) * .08 - .05;
    this.head.rotation.z = moving ? 0 : Math.sin(this.t * .7) * .12;
  }
  dispose() { this.root.dispose(false, true); }
}
