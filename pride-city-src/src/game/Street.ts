/* Belebte Straßen: Passant*innen auf den Gehwegen, Polizeistreife, Feuerwehr mit Löschzug, Sexarbeiter*innen vor dem
   Haus Rosa (nur nachts und nur mit 18+) und geparkte Autos, in die man einsteigen kann. Alles leichtgewichtig:
   Figuren weit weg werden weder animiert noch gezeichnet. */
import * as THREE from 'three';
import { Actor, type Anim, type Look } from './Actor';
import { instance } from '../engine/Assets';
import { WORKERS } from './social';
import type { World } from './World';

export type StreetKind = 'walker' | 'police' | 'fire' | 'worker';
export interface StreetNpc { a: Actor; kind: StreetKind; name: string; color: string; path: Array<[number, number]>; wp: number; wait: number; id?: string; anim?: Anim; talking?: boolean }
export interface Parked { o: THREE.Object3D; name: string; yaw: number; v: number }

const LINES: Record<Exclude<StreetKind, 'worker'>, string[]> = {
  walker: ['Schönen Tag noch!', 'Hast du schon alle Pride-Sticker gefunden?', 'Der Späti hat die besten Brezeln der Stadt.', 'Ich bin auf dem Weg ins Prisma!', 'Kennst du schon den Club Leuchtturm am Hafen?', 'Rainbow City ist einfach die beste Stadt.', 'Die Strandbar am Hafen macht die besten Cocktails.', 'Heute ist so ein schöner Tag zum Rumlaufen.'],
  police: ['Alles ruhig heute. Wenn dich jemand belästigt, sprich uns an – wir haben eine Ansprechperson für queere Menschen.', 'Bitte nicht bei Rot über die Straße. Auch nicht mit Glitzer.', 'Wir begleiten die Pride-Parade. Wird wieder schön!', 'Hassgewalt bitte immer anzeigen. Wir nehmen das ernst.'],
  fire: ['Rauchmelder schon getestet? Einmal im Monat kurz drücken!', 'Bei der Pride fahren wir mit Regenbogen-Fontäne mit.', 'Notruf 112 – auch wenn es nur nach Rauch riecht.', 'Kalender-Shooting? Erst nach Dienstschluss. 😄'],
};
const BODIES = ['Man2', 'Woman2', 'Man', 'Woman', 'Human', 'Hero'];
const COLORS = ['rainbow', 'trans', 'bi', 'pan', 'gay', 'progress', 'lesbian', 'nonbinary', 'street', 'street', 'bear', 'ace'];
const NAMES = ['Passant', 'Passantin', 'Spaziergänger*in', 'Nachbar', 'Nachbarin', 'Tourist*in'];
const block = (a: number, b: number, rev = false): Array<[number, number]> => {
  const p: Array<[number, number]> = [[a + 5.4, b + 5.4], [a + 24.6, b + 5.4], [a + 24.6, b + 24.6], [a + 5.4, b + 24.6]];
  return rev ? p.reverse() : p;
};

export class Street {
  readonly people: StreetNpc[] = [];
  readonly parked: Parked[] = [];
  private flash: THREE.MeshBasicMaterial[][] = [];
  private t = 0;
  constructor(private root: THREE.Object3D, private world: World) {}

  async build() {
    const mk = async (look: Look, kind: StreetKind, name: string, color: string, path: Array<[number, number]>, id?: string, anim?: Anim) => {
      const a = await Actor.create(look);
      a.root.position.set(path[0][0], .1, path[0][1]);
      if (anim) a.play(anim, 0);
      this.root.add(a.root);
      this.people.push({ a, kind, name, color, path, wp: 1 % path.length, wait: Math.random() * 4, id, anim });
    };
    const blocks: Array<[number, number]> = [[0, 0], [-30, -30], [0, -30], [30, -30], [30, 0], [-60, 0], [0, 30], [-30, 30], [-60, -30], [30, 30], [-60, 30], [0, -60]];
    const jobs: Promise<void>[] = [];
    blocks.forEach(([a, b], i) => jobs.push(mk({ body: BODIES[i % 6], palette: COLORS[i], skin: (i * 5) % 6, hair: (i * 3) % 11, top: i % 2 === 1 }, 'walker', NAMES[i % NAMES.length], '#8fa3c8', block(a, b, i % 2 === 0))));
    // Streife auf der Hauptstraße, Feuerwehr vor der Wache
    jobs.push(mk({ body: 'Man2', palette: 'police', skin: 2, hair: 0 }, 'police', 'Polizist Okafor', '#5b86d6', [[4.6, -16], [4.6, 26], [-4.6, 26], [-4.6, -16]]));
    jobs.push(mk({ body: 'Woman2', palette: 'police', skin: 0, hair: 1, top: true }, 'police', 'Polizistin Brandt', '#5b86d6', [[4.6, -16], [4.6, 26], [-4.6, 26], [-4.6, -16]].reverse() as Array<[number, number]>));
    jobs.push(mk({ body: 'Man', palette: 'fire', skin: 4, hair: 5 }, 'fire', 'Feuerwehrmann Ali', '#e0b52a', [[-4.4, -18], [-4.4, -23]]));
    jobs.push(mk({ body: 'Woman', palette: 'fire', skin: 1, hair: 4, top: true }, 'fire', 'Feuerwehrfrau Jo', '#e0b52a', [[-4.4, -21.5]], undefined, 'idle'));
    // Vor dem Haus Rosa (18+): selbstbestimmte Sexarbeiter*innen, freundlich und mit eigenen Regeln
    const wl: Record<string, Look> = {
      jasper: { body: 'Man', palette: 'gay', skin: 2, hair: 3, outfit: 'shirtless', hot: true },
      viktor: { body: 'Man2', palette: 'leather', skin: 1, hair: 0, outfit: 'harness', hot: true },
      dani: { body: 'Hero', palette: 'nonbinary', skin: 3, hair: 9, top: true, hot: true },
      sina: { body: 'Woman2', palette: 'neon', skin: 4, hair: 7, top: true, hot: true },
    };
    WORKERS.forEach((w, i) => jobs.push(mk(wl[w.id], 'worker', w.name, w.color, [[-4.4, -36 - i * 2.2]], w.id, i % 2 ? 'pose' : 'idle')));
    await Promise.all(jobs);
    this.people.filter((p) => p.path.length === 1).forEach((p) => (p.a.root.rotation.y = -Math.PI / 2));
    await this.cars();
  }

  private async cars() {
    // Blaulicht auf dem Streifenwagen
    const police = this.world.cars.find((c) => c.o.userData.kind === 'car_police');
    const lamp = (c: number) => { const m = new THREE.MeshBasicMaterial({ color: c, toneMapped: false }); m.userData.c = new THREE.Color(c).multiplyScalar(2); return m; };
    const blue = () => lamp(0x2a5bff), red = () => lamp(0xff2a2a);
    if (police) {
      const box = new THREE.Box3().setFromObject(police.o), h = (box.max.y - box.min.y) / police.o.scale.y;
      const m = [blue(), red()], g = new THREE.BoxGeometry(.09, .05, .05);
      [-1, 1].forEach((sx, i) => { const b = new THREE.Mesh(g, m[i]); b.position.set(sx * .06, h + .02, -.02); police.o.add(b); });
      this.flash.push(m);
    }
    // Löschzug (aus Grundformen, im KayKit-Stil): fährt eine eigene Runde
    const truck = new THREE.Group();
    const M = (c: number, r = .6) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
    const B = (w: number, h: number, l: number, m: THREE.Material, x: number, y: number, z: number) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); o.castShadow = true; truck.add(o); return o; };
    const redM = M(0xd8261e, .45), white = M(0xf4f4f4), grey = M(0x9aa0aa, .4), black = M(0x1b1b22, .9), glass = M(0x7fc8ff, .1);
    B(2.4, 1.9, 4.6, redM, 0, 1.45, -.9);
    B(2.4, 1.7, 1.9, redM, 0, 1.35, 2.4);
    B(2.25, .8, .05, glass, 0, 1.75, 3.36);
    B(2.42, .18, 6.4, white, 0, 1.05, 0);
    B(.12, .12, 5, grey, -.5, 2.55, -.6); B(.12, .12, 5, grey, .5, 2.55, -.6);
    for (let i = 0; i < 9; i++) B(1, .06, .08, grey, 0, 2.55, -2.9 + i * .58);
    const wg = new THREE.CylinderGeometry(.5, .5, .35, 14).rotateZ(Math.PI / 2);
    for (const [x, z] of [[-1.15, 2.2], [1.15, 2.2], [-1.15, -1.4], [1.15, -1.4], [-1.15, -2.5], [1.15, -2.5]]) { const w = new THREE.Mesh(wg, black); w.position.set(x, .5, z); truck.add(w); }
    const fm = [blue(), blue()];
    [-1, 1].forEach((sx, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(.45, .2, .3), fm[i]); b.position.set(sx * .5, 2.3, 2.6); truck.add(b); });
    this.flash.push(fm);
    this.root.add(truck);
    this.world.cars.push({ o: truck, path: [new THREE.Vector3(57, .1, -33), new THREE.Vector3(-57, .1, -33)], seg: 0, u: .3, v: 6 });
    // Geparkte Autos zum Einsteigen
    const spots: Array<[string, string, number, number, number]> = [
      ['car_hatchback', 'Kleinwagen', 8.6, 47, Math.PI], ['car_sedan', 'Limousine', -8.6, 26, 0],
      ['car_taxi', 'Taxi', -24, 8.6, Math.PI / 2], ['car_stationwagon', 'Kombi', -66, 14, 0],
    ];
    for (const [file, name, x, z, yaw] of spots) {
      const o = await instance('city/' + file + '.gltf');
      o.scale.setScalar(5); o.position.set(x, .1, z); o.rotation.y = yaw; this.root.add(o);
      this.parked.push({ o, name, yaw, v: 0 });
    }
  }

  /** dt, Nacht (0–1), 18+ an, Bezugspunkt (Spieler) */
  update(dt: number, night: number, adult: boolean, ref: THREE.Vector3) {
    this.t += dt;
    const on = Math.floor(this.t * 4) % 2;
    for (const [a, b] of this.flash) { a.color.copy(a.userData.c).multiplyScalar(on ? 1 : .12); b.color.copy(b.userData.c).multiplyScalar(on ? .12 : 1); }
    this.people.forEach((n, i) => {
      const show = n.kind === 'worker' ? adult && night > .4 : n.kind === 'walker' ? (night < .5 || i % 2 === 0) : true;
      const d2 = n.a.root.position.distanceToSquared(ref);
      n.a.root.visible = show && d2 < 90 * 90;
      if (!n.a.root.visible) return;
      if (d2 < 60 * 60) n.a.update(dt);
      if (n.talking) return;
      if (n.path.length < 2) return;
      if (n.wait > 0) { n.wait -= dt; if (n.a.anim !== 'idle') n.a.play('idle'); return; }
      const [tx, tz] = n.path[n.wp], p = n.a.root.position, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      if (d < .3) { n.wp = (n.wp + 1) % n.path.length; if (Math.random() < .35) n.wait = 1 + Math.random() * 3; return; }
      const sp = n.kind === 'police' ? 1.3 : 1.5;
      p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt;
      n.a.root.rotation.y = Math.atan2(dx, dz);
      n.a.play('walk', .25, .7);
    });
  }

  /** Nächste sichtbare Person in Reichweite */
  near(p: THREE.Vector3, r = 2.2) {
    let best: StreetNpc | null = null, bd = r;
    for (const n of this.people) { if (!n.a.root.visible) continue; const d = n.a.root.position.distanceTo(p); if (d < bd) { bd = d; best = n; } }
    return best;
  }
  line(n: StreetNpc, day: number) { const pool = LINES[n.kind as Exclude<StreetKind, 'worker'>] || LINES.walker; return pool[(day + n.name.length + Math.floor(this.t / 20)) % pool.length]; }
  nearCar(p: THREE.Vector3, r = 3.2) { return this.parked.find((c) => c.o.position.distanceTo(p) < r) || null; }
}
