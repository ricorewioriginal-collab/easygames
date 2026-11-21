/* Weitere Fahrzeuge aus Grundformen: Einhorn-Roller (du stehst sichtbar drauf), Pride-Bus (großer CSD-Shuttle)
   und Glitzer-Boot (fährt nur auf dem Wasser, zwischen Kai und Inseln). Steuerung wie die Autos (CityScene.moveCar).
   Drehende Teile heißen „spin“ und tragen ihren Radius in metadata.r. Alles eingefroren, wo es nicht dreht. */
import { Node3, type Mesh, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow, planeZ, canvasTex } from '../engine/geo';

export type RideKind = 'scooter' | 'bus' | 'boat';
const RAINBOW = [0xe40303, 0xff8c00, 0xffed00, 0x008026, 0x004dff, 0x750787];

export function buildRide(sc: Scene, root: Node3, kind: RideKind) {
  root.getChildMeshes().forEach((m) => m.dispose());
  const P = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number, par: Node3 = root) => { m.material = mt; m.position.set(x, y, z); m.parent = par; m.isPickable = false; return m; };
  const wheel = (x: number, y: number, z: number, r: number, w: number, mt: PBRMaterial) => {
    const n = new Node3('spin', sc); n.parent = root; n.position.set(x, y, z); n.metadata = { r };
    const t = P(cyl(sc, r, r, w, 14), mt, 0, 0, 0, n); t.rotation.z = Math.PI / 2;
    P(box(sc, w + .02, r * 1.2, r * .3), pbr(sc, 0xdddddd, .3, .8), 0, 0, 0, n);   // Speiche, damit man das Drehen sieht
    return n;
  };
  const tyre = pbr(sc, 0x18181c, .85);
  if (kind === 'scooter') {
    // Trittbrett, zwei kleine Räder, Lenkstange mit Einhornkopf vorn
    const white = pbr(sc, 0xfdf6ff, .35, .1), gold = pbr(sc, 0xffd23b, .25, .8, { emissive: 0xffb000, ei: .2 });
    P(box(sc, .42, .08, 1.3), pbr(sc, 0xff8ad8, .3, .2), 0, .22, 0);
    RAINBOW.forEach((c, i) => P(box(sc, .43, .02, .1), pbr(sc, c, .5), 0, .27, -.45 + i * .18));
    wheel(0, .16, .62, .16, .1, tyre); wheel(0, .16, -.6, .16, .1, tyre);
    const pole = P(cyl(sc, .035, .035, 1.05, 8), gold, 0, .78, .62); pole.rotation.x = -.18;
    P(cyl(sc, .025, .025, .62, 8), gold, 0, 1.28, .72).rotation.z = Math.PI / 2;
    const head = P(sphere(sc, .17, 12), white, 0, 1.36, .84); head.scaling.set(.9, 1, 1.2);
    const snout = P(sphere(sc, .1, 10), white, 0, 1.3, 1.0); snout.scaling.set(1, .85, 1.1);
    const horn = P(cyl(sc, 0, .045, .32, 10), gold, 0, 1.6, .9); horn.rotation.x = .35;
    for (const sx of [-1, 1]) { P(sphere(sc, .025, 6), pbr(sc, 0x111111, .3), sx * .1, 1.4, .97); const ear = P(cyl(sc, 0, .04, .1, 6), white, sx * .08, 1.53, .78); ear.rotation.z = -sx * .3; }
    RAINBOW.forEach((c, i) => P(box(sc, .04, .09, .07), pbr(sc, c, .5), 0, 1.5 - i * .06, .7 - i * .025));
    P(sphere(sc, .07, 8), glow(sc, 0xfff6d0, 1.4), 0, .5, .74);
  } else if (kind === 'bus') {
    // CSD-Shuttle: langer Bus, Regenbogen-Bänder, dunkle Fensterreihe, Zielanzeige, Fähnchen auf dem Dach
    const body = pbr(sc, 0xf7f7fb, .35, .2), glass = pbr(sc, 0x10142a, .1, .4, { emissive: 0x1a2a55, ei: .25 });
    P(box(sc, 2.5, 2.4, 9), body, 0, 1.55, 0);
    P(box(sc, 2.52, .85, 7.6), glass, 0, 2.05, -.5);
    P(box(sc, 2.3, .9, .05), glass, 0, 2.0, 4.51);
    RAINBOW.forEach((c, i) => P(box(sc, 2.54, .1, 8.6), pbr(sc, c, .5), 0, 1.38 - i * .1, 0));
    const sign = canvasTex(sc, 256, 32, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 256, 32); g.fillStyle = '#ffb000'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText('CSD-SHUTTLE 69', 128, 24); });
    const sm = glow(sc, 0xffffff, 1.2, { tex: sign });
    P(planeZ(sc, 1.9, .26), sm, 0, 2.6, 4.53).rotation.y = Math.PI;
    for (const z of [3.1, -3.1]) for (const sx of [-1, 1]) wheel(sx * 1.15, .48, z, .48, .32, tyre);
    for (const sx of [-1, 1]) P(sphere(sc, .13, 8), glow(sc, 0xfff6d0, 1.4), sx * .9, .9, 4.52);
    for (const sx of [-1, 1]) P(sphere(sc, .12, 8), glow(sc, 0xff2a2a, 1.2), sx * .95, .9, -4.52);
    for (let i = 0; i < 6; i++) { P(cyl(sc, .02, .02, .7, 6), pbr(sc, 0xcccccc, .3, .8), 0, 3.1, -3.5 + i * 1.4); const f = P(box(sc, .02, .32, .5), pbr(sc, RAINBOW[i], .5, 0, { double: true }), 0, 3.3, -3.25 + i * 1.4); f.isPickable = false; }
  } else {
    // Glitzer-Boot: pinker Rumpf mit spitzem Bug, Glitzer, Windschutzscheibe, Sitzbank, Regenbogenflagge am Heck
    const hull = pbr(sc, 0xff4fa3, .2, .3, { emissive: 0xff2f8a, ei: .15 }), deck = pbr(sc, 0xf2e6d6, .7), glit = glow(sc, 0xfff0fa, 1.3);
    P(box(sc, 1.9, .7, 3.6), hull, 0, .1, -.4);
    const bow = P(cyl(sc, .95, .95, .7, 3), hull, 0, .1, 1.4); bow.scaling.set(1, 1, 1.2); bow.rotation.y = Math.PI / 6;
    P(box(sc, 1.7, .05, 3.4), deck, 0, .46, -.4);
    for (let i = 0; i < 16; i++) P(sphere(sc, .045, 6), glit, (i % 2 ? .96 : -.96), .22 + (i % 3) * .1, -2 + (i >> 1) * .5);
    const ws = P(box(sc, 1.5, .45, .04), pbr(sc, 0xbfe9ff, .05, 0, { alpha: .45 }), 0, .75, .7); ws.rotation.x = -.35;
    P(box(sc, 1.2, .25, .5), pbr(sc, 0xffffff, .6), 0, .6, -.9);
    P(cyl(sc, .02, .02, 1.1, 6), pbr(sc, 0xcccccc, .3, .8), 0, 1.0, -2.1);
    RAINBOW.forEach((c, i) => P(box(sc, .02, .07, .55), pbr(sc, c, .5, 0, { double: true }), 0, 1.5 - i * .07, -2.38));
    const prop = new Node3('spin', sc); prop.parent = root; prop.position.set(0, -.15, -2.3); prop.metadata = { r: .1, axis: 'z' };
    for (const a of [0, Math.PI / 2]) { const b = P(box(sc, .05, .5, .08), pbr(sc, 0xcccccc, .3, .8), 0, 0, 0, prop); b.rotation.z = a; }
    const ring = P(torus(sc, .32, .06, 16), pbr(sc, 0xffffff, .5), 0, .45, 1.6); ring.rotation.x = Math.PI / 2; ring.scaling.set(1, 1, .9);
    P(sphere(sc, .08, 8), glow(sc, 0xfff6d0, 1.4), 0, .7, 1.9);
  }
}
