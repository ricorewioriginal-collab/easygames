/* Belebte Straßen: Passant*innen auf den Gehwegen, Polizeistreife, Feuerwehr mit Löschzug, Sanitäterin, Türsteher,
   Köchin und Kurier, Sexarbeiter*innen vor dem Haus Rosa (nur nachts und nur mit 18+) und geparkte Autos zum Einsteigen.
   Alle Menschen sind Rocketbox-Figuren. Leichtgewichtig: Figuren weit weg werden weder animiert noch gezeichnet. */
import { Vector3, Color3, Node3, TransformNode, type Mesh } from '../engine/bjs';
import { box, cyl, pbr, glow } from '../engine/geo';
import { Actor, WALK_MPS, RUN_MPS, type Anim, type Look } from './Actor';
import { WORKERS, CURB } from './social';
import { CURB_SPOTS } from './uptown';
import { carDef, type CarDef } from './vehicles';
import type { World } from './World';
import { sfx } from '../engine/Audio';
import type { PBRMaterial, Scene } from '../engine/bjs';

export type StreetKind = 'walker' | 'police' | 'fire' | 'worker' | 'curb' | 'medic' | 'security' | 'chef' | 'courier';
export interface StreetNpc { a: Actor; kind: StreetKind; name: string; color: string; path: Array<[number, number]>; wp: number; wait: number; id?: string; anim?: Anim; talking?: boolean; down?: boolean; chase?: boolean; away?: boolean }
export interface Parked { o: Node3; name: string; yaw: number; v: number; def: CarDef; /** dein eigener Wagen aus der Garage */ own?: boolean }

const LINES: Record<Exclude<StreetKind, 'worker' | 'curb'>, string[]> = {
  walker: ['Schönen Tag noch!', 'Hast du schon alle Pride-Sticker gefunden?', 'Der Späti hat die besten Brezeln der Stadt.', 'Ich bin auf dem Weg ins Prisma!', 'Kennst du schon den Club Leuchtturm am Hafen?', 'Rainbow City ist einfach die beste Stadt.', 'Die Strandbar am Hafen macht die besten Cocktails.', 'Heute ist so ein schöner Tag zum Rumlaufen.'],
  police: ['Alles ruhig heute. Wenn dich jemand belästigt, sprich uns an – wir haben eine Ansprechperson für queere Menschen.', 'Bitte nicht bei Rot über die Straße. Auch nicht mit Glitzer.', 'Wir begleiten die Pride-Parade. Wird wieder schön!', 'Hassgewalt bitte immer anzeigen. Wir nehmen das ernst.'],
  fire: ['Rauchmelder schon getestet? Einmal im Monat kurz drücken!', 'Bei der Pride fahren wir mit Regenbogen-Fontäne mit.', 'Notruf 112 – auch wenn es nur nach Rauch riecht.', 'Kalender-Shooting? Erst nach Dienstschluss. 😄'],
  medic: ['Genug Wasser getrunken? Beim Tanzen vergisst man das schnell.', 'Im Checkpoint gibt es anonyme Tests, ganz ohne Termin.', 'Pass auf dich auf heute Nacht – und auf deine Leute.', 'Sonnencreme! Auch auf der Parade.'],
  security: ['Heute Abend ist Glitzer-Dresscode. Du siehst schon gut aus.', 'Respekt rein, Stress raus – so läuft das hier.', 'Wenn dir drinnen jemand dumm kommt, sag Bescheid. Wir kümmern uns.', 'Die Schlange geht schnell, versprochen.'],
  chef: ['Heute gibt es Regenbogen-Bowls. Probier mal!', 'Mo hat mich mit dem Kuchen erwischt. Psst.', 'Kochen ist Liebe, die man essen kann.', 'Frische Brezeln? Der Späti hat welche. Ich mache lieber Torte.'],
  courier: ['Sorry, eilig! Drei Pakete bis zum Hafen.', 'Wenn das Handy klingelt: Aufträge gibt es überall in der Stadt.', 'Mit dem Auto geht es schneller – aber ich liebe mein Rad.', 'Kennst du die Abkürzung über den Platz?'],
};
const WALKERS = ['Male_Adult_02', 'Female_Adult_03', 'Male_Adult_06', 'Female_Adult_07', 'Male_Adult_09', 'Female_Adult_01', 'Male_Adult_10', 'Female_Adult_05', 'Male_Adult_04', 'Female_Adult_09', 'Business_Male_01', 'Female_Adult_10'];
const NAMES = ['Passant', 'Passantin', 'Spaziergänger', 'Spaziergängerin', 'Nachbar', 'Nachbarin', 'Tourist', 'Touristin', 'Nachbar', 'Studentin', 'Geschäftsmann', 'Nachbarin'];
const block = (a: number, b: number, rev = false): Array<[number, number]> => {
  const p: Array<[number, number]> = [[a + 5.4, b + 5.4], [a + 24.6, b + 5.4], [a + 24.6, b + 24.6], [a + 5.4, b + 24.6]];
  return rev ? p.reverse() : p;
};
const L = (rb: string): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0 });

export class Street {
  readonly people: StreetNpc[] = [];
  readonly parked: Parked[] = [];
  private flash: Array<[{ m: PBRMaterial; c: Color3 }, { m: PBRMaterial; c: Color3 }]> = [];
  private t = 0;
  constructor(private scene: Scene, private world: World) {}

  async build() {
    const mk = async (look: Look, kind: StreetKind, name: string, color: string, path: Array<[number, number]>, id?: string, anim?: Anim) => {
      const a = await Actor.create(this.scene, look);
      a.root.position.set(path[0][0], .1, path[0][1]);
      if (anim) a.play(anim, 0);
      this.people.push({ a, kind, name, color, path, wp: 1 % path.length, wait: Math.random() * 4, id, anim });
    };
    const blocks: Array<[number, number]> = [[0, 0], [-30, -30], [0, -30], [30, -30], [30, 0], [-60, 0], [0, 30], [-30, 30], [-60, -30], [30, 30], [-60, 30], [0, -60]];
    const jobs: Promise<void>[] = [];
    blocks.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[i]), 'walker', NAMES[i], '#8fa3c8', block(a, b, i % 2 === 0))));
    // Streife auf der Hauptstraße, Feuerwehr vor der Wache
    jobs.push(mk(L('Police_Male_01'), 'police', 'Polizist Okafor', '#5b86d6', [[4.6, -16], [4.6, 26], [-4.6, 26], [-4.6, -16]]));
    jobs.push(mk(L('Police_Female_01'), 'police', 'Polizistin Brandt', '#5b86d6', [[4.6, -16], [4.6, 26], [-4.6, 26], [-4.6, -16]].reverse() as Array<[number, number]>));
    jobs.push(mk(L('Fire_Male_01'), 'fire', 'Feuerwehrmann Ali', '#e0b52a', [[-4.4, -18], [-4.4, -23]]));
    jobs.push(mk(L('Fire_Female_01'), 'fire', 'Feuerwehrfrau Jo', '#e0b52a', [[-4.4, -21.5]], undefined, 'idle'));
    // Stadtleben: Sanitäterin am Checkpoint, Türsteher am Prisma, Köchin vor dem Café, Kurier auf großer Runde
    jobs.push(mk(L('Medical_Female_01'), 'medic', 'Sanitäterin Yasemin', '#3ee69a', [[-33.4, -12.5]], undefined, 'idle'));
    jobs.push(mk(L('Security_Male_01'), 'security', 'Türsteher Kofi', '#b56bff', [[4.2, -8.2]], undefined, 'idle'));
    jobs.push(mk(L('Chef_Female_01'), 'chef', 'Köchin Ines', '#ffb347', [[4.3, 12.3]], undefined, 'talk'));
    jobs.push(mk(L('Delivery_Male_01'), 'courier', 'Kurier Mika', '#ffd23b', [[-4.6, 34], [-4.6, -26], [-26, -26], [-26, 4.6], [-60, 4.6], [-60, -4.6], [-4.6, -4.6]]));
    // Vor dem Haus Rosa (18+): selbstbestimmte Sexarbeiter*innen, freundlich und mit eigenen Regeln
    const wl: Record<string, Look> = {
      jasper: { ...L('Male_Adult_07'), outfit: 'shirtless', hot: true },
      viktor: { ...L('Male_Adult_05'), outfit: 'harness', hot: true },
      dani: { ...L('Sports_Female_01'), top: true, hot: true },
      sina: { ...L('Female_Party_01'), top: true, hot: true },
    };
    WORKERS.forEach((w, i) => jobs.push(mk(wl[w.id], 'worker', w.name, w.color, [[-4.4, -36 - i * 2.2]], w.id, i % 2 ? 'pose' : 'idle')));
    // Laternenmeile in der Hochstadt (18+, nachts): steigen ein, wenn du im Auto hupst
    const cl: Record<string, Look> = {
      nico: { ...L('Male_Adult_02'), outfit: 'shirtless', hot: true }, roxy: { ...L('Female_Party_02'), outfit: 'underwear', top: true, hot: true },
      teo: { ...L('Male_Adult_09'), outfit: 'underwear', hot: true }, jules: { ...L('Female_Adult_09'), outfit: 'harness', top: true, hot: true },
    };
    CURB.forEach((w, i) => jobs.push(mk(cl[w.id], 'curb', w.name, w.color, [CURB_SPOTS[i]], w.id, i % 2 ? 'pose' : 'idle')));
    // Passant*innen in der Hochstadt
    const up: Array<[number, number]> = [[90, -30], [120, 0], [150, 30], [180, -30], [90, 30], [180, 0]];
    up.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[(i + 5) % WALKERS.length]), 'walker', NAMES[(i + 5) % NAMES.length], '#8fa3c8', block(a, b, i % 2 === 1))));
    await Promise.all(jobs);
    this.people.filter((p) => p.path.length === 1).forEach((p) => (p.a.root.rotation.y = p.kind === 'curb' ? Math.PI : p.path[0][0] > 0 ? -Math.PI / 2 : Math.PI / 2));
    await this.cars();
  }

  private async cars() {
    const sc = this.scene;
    // Blaulicht auf dem Streifenwagen
    const police = this.world.cars.find((c) => c.kind === 'car_police');
    const lamp = (c: number) => { const m = glow(sc, c, 1); return { m, c: m.albedoColor.scale(2) }; };
    const blue = () => lamp(0x2a5bff), red = () => lamp(0xff2a2a);
    if (police) {
      const bb = police.o.getHierarchyBoundingVectors(true), h = bb.max.y - bb.min.y;
      const m = [blue(), red()] as const;
      [-1, 1].forEach((sx, i) => { const b = box(sc, .45, .25, .25); b.material = m[i].m; b.position.set(sx * .3, h + .1, -.1); b.parent = police.o; });
      this.flash.push([m[0], m[1]]);
    }
    // Löschzug (aus Grundformen, im KayKit-Stil): fährt eine eigene Runde
    const truck = new Node3('truck', sc);
    const M = (c: number, r = .6, m = 0) => pbr(sc, c, r, m);
    const B = (w: number, h: number, l: number, mt: PBRMaterial, x: number, y: number, z: number) => { const o = box(sc, w, h, l); o.material = mt; o.position.set(x, y, z); o.parent = truck; o.receiveShadows = true; (o as Mesh & { _pcCast?: boolean })._pcCast = true; return o; };
    const redM = M(0xd8261e, .45, .2), white = M(0xf4f4f4), grey = M(0x9aa0aa, .4, .6), black = M(0x1b1b22, .9), glass = M(0x7fc8ff, .1, .3);
    B(2.4, 1.9, 4.6, redM, 0, 1.45, -.9);
    B(2.4, 1.7, 1.9, redM, 0, 1.35, 2.4);
    B(2.25, .8, .05, glass, 0, 1.75, 3.36);
    B(2.42, .18, 6.4, white, 0, 1.05, 0);
    B(.12, .12, 5, grey, -.5, 2.55, -.6); B(.12, .12, 5, grey, .5, 2.55, -.6);
    for (let i = 0; i < 9; i++) B(1, .06, .08, grey, 0, 2.55, -2.9 + i * .58);
    for (const [x, z] of [[-1.15, 2.2], [1.15, 2.2], [-1.15, -1.4], [1.15, -1.4], [-1.15, -2.5], [1.15, -2.5]]) { const w = cyl(sc, .5, .5, .35, 14); w.rotation.z = Math.PI / 2; w.material = black; w.position.set(x, .5, z); w.parent = truck; }
    const fm = [blue(), blue()] as const;
    [-1, 1].forEach((sx, i) => { const b = box(sc, .45, .2, .3); b.material = fm[i].m; b.position.set(sx * .5, 2.3, 2.6); b.parent = truck; });
    this.flash.push([fm[0], fm[1]]);
    truck.parent = this.world.root;
    this.world.cars.push({ o: truck, path: [new Vector3(57, .1, -33), new Vector3(-57, .1, -33)], seg: 0, u: .3, v: 6, kind: 'truck' });
    // Geparkte Autos zum Einsteigen (am Fahrbahnrand der ruhigen Querstraße z = 30 und am Kai)
    // dazu in der Hochstadt: Sportwagen, Geländewagen, Bulli und Pick-up (Kenney Car Kit) auf dem Parkplatz und am Neonplatz
    const spots: Array<[string, number, number, number]> = [
      ['hatch', 11, 32.7, -Math.PI / 2], ['sedan', -11, 27.3, Math.PI / 2], ['taxi', -20, 27.3, Math.PI / 2], ['kombi', -66, 14, 0],
      ['flitzer', 24, 32.7, -Math.PI / 2], ['suv', -66, 22, 0],
      ['sport', 157.2, -51, Math.PI], ['bulli', 162.4, -51, Math.PI], ['pickup', 159.8, -38.5, 0], ['lux', 130, 62.7, -Math.PI / 2], ['liefer', 196, -62.7, Math.PI / 2],
    ];
    for (const [id, x, z, yaw] of spots) {
      const def = carDef(id), o = await this.world.car(def.file);
      o.position.set(x, .1, z); o.rotation.y = yaw;
      this.parked.push({ o, name: def.name, yaw, v: 0, def });
    }
  }
  /** Eigenen Wagen hinstellen (ersetzt den bisherigen) */
  async spawnOwn(def: CarDef, x: number, z: number, yaw: number, hue: number) {
    const old = this.parked.findIndex((c) => c.own);
    const o = await this.world.car(def.file);
    o.position.set(x, .1, z); o.rotation.y = yaw;
    if (hue >= 0) await this.world.paintCar(o, hue);
    const car: Parked = { o, name: def.name, yaw, v: 0, def, own: true };
    if (old >= 0) { this.parked[old].o.dispose(); this.parked[old] = car; } else this.parked.push(car);
    return car;
  }

  /** dt, Nacht (0–1), 18+ an, Bezugspunkt (Spieler) */
  private sirenT = 20;
  update(dt: number, night: number, adult: boolean, ref: Vector3) {
    // Löschzug mit Martinshorn, wenn er in der Nähe vorbeifährt
    this.sirenT -= dt;
    if (this.sirenT < 0) { this.sirenT = 30 + Math.random() * 30; const tr = this.world.cars.at(-1)?.o; if (tr && Vector3.Distance(tr.position, ref) < 40) sfx('siren'); }
    this.t += dt;
    const on = Math.floor(this.t * 4) % 2;
    for (const [a, b] of this.flash) { a.m.albedoColor = a.c.scale(on ? 1 : .12); b.m.albedoColor = b.c.scale(on ? .12 : 1); }
    const far = this.world.low ? 62 : 90, anim = this.world.low ? 36 : 60;
    this.people.forEach((n, i) => {
      const show = n.away ? false : n.kind === 'worker' || n.kind === 'curb' ? adult && night > .4 : n.kind === 'walker' ? (night < .5 || i % 2 === 0) : n.kind === 'security' ? night > .3 : true;
      const d2 = Vector3.DistanceSquared(n.a.root.position, ref);
      n.a.root.visible = !n.away && (n.chase || n.talking || (show && d2 < far * far));
      if (!n.a.root.visible) return;
      if (d2 < anim * anim || n.chase) n.a.update(dt);
      if (n.talking || n.down || n.chase) return;
      if (n.path.length < 2) return;
      if (n.wait > 0) { n.wait -= dt; if (n.a.anim !== 'idle') n.a.play('idle'); return; }
      const [tx, tz] = n.path[n.wp], p = n.a.root.position, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      if (d < .3) { n.wp = (n.wp + 1) % n.path.length; if (Math.random() < .35 && n.kind !== 'courier') n.wait = 1 + Math.random() * 3; return; }
      const run = n.kind === 'courier';
      const sp = run ? 3.4 : n.kind === 'police' ? 1.3 : 1.4;
      p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt;
      n.a.root.rotation.y = Math.atan2(dx, dz);
      n.a.play(run ? 'run' : 'walk', .25, sp / (run ? RUN_MPS : WALK_MPS));
    });
  }

  /** Nächste sichtbare Person in Reichweite */
  near(p: Vector3, r = 2.2) {
    let best: StreetNpc | null = null, bd = r;
    for (const n of this.people) { if (!n.a.root.visible) continue; const d = Vector3.Distance(n.a.root.position, p); if (d < bd) { bd = d; best = n; } }
    return best;
  }
  line(n: StreetNpc, day: number) { const pool = LINES[n.kind as Exclude<StreetKind, 'worker' | 'curb'>] || LINES.walker; return pool[(day + n.name.length + Math.floor(this.t / 20)) % pool.length]; }
  nearCar(p: Vector3, r = 3.2) { return this.parked.find((c) => Vector3.Distance(c.o.position, p) < r) || null; }
}
export { TransformNode };
