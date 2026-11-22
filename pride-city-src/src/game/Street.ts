/* Belebte Straßen: Passant*innen auf den Gehwegen, Polizeistreife, Feuerwehr mit Löschzug, Sanitäterin, Türsteher,
   Köchin und Kurier, Sexarbeiter*innen vor dem Haus Rosa (nur nachts und nur mit 18+) und geparkte Autos zum Einsteigen.
   Alle Menschen sind Rocketbox-Figuren. Leichtgewichtig: Figuren weit weg werden weder animiert noch gezeichnet. */
import { Vector3, Color3, Node3, TransformNode, type Mesh } from '../engine/bjs';
import { box, cyl, pbr, glow } from '../engine/geo';
import { Actor, WALK_MPS, RUN_MPS, type Anim, type Look } from './Actor';
import { WORKERS, CURB } from './social';
import { buildFlitzer } from './flitzer';
import { buildAircraft, BASE } from './luft';
import { buildRingMobil } from './toys';
import { buildRide } from './rides';
import { CURB_SPOTS } from './uptown';
import { escortSign } from './spuren';
import { SZENE, STREET_SZENE, szeneRb, szeneOutfit, szeneLine } from './szene';
import { carDef, CAR_DEFS, type CarDef } from './vehicles';
import type { World, Car } from './World';
import { sfx } from '../engine/Audio';
import type { PBRMaterial, Scene } from '../engine/bjs';

export type StreetKind = 'walker' | 'police' | 'fire' | 'worker' | 'curb' | 'medic' | 'security' | 'chef' | 'courier' | 'szene';
export interface StreetNpc { a: Actor; kind: StreetKind; name: string; color: string; path: Array<[number, number]>; wp: number; wait: number; id?: string; anim?: Anim; talking?: boolean; down?: boolean; chase?: boolean; away?: boolean; /** läuft Hand in Hand neben dieser Person */ mate?: StreetNpc; /** feste Blickrichtung */ yaw?: number }
export interface Parked { o: Node3; name: string; yaw: number; v: number; def: CarDef; /** dein eigener Wagen aus der Garage */ own?: boolean; /** geliehen aus dem Verkehr: fährt später seine Runde weiter */ route?: Car }

const LINES: Record<Exclude<StreetKind, 'worker' | 'curb' | 'szene'>, string[]> = {
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
const L = (rb: string, style?: string): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0, style });
/** Szene-Looks der Passant*innen: fast alle zeigen Farbe */
const WALK_STYLE = ['regenbogen', 'lesbisch', 'bear', 'trans', 'lederjacke', 'crop', 'bi', 'glitzer', 'pan', 'enby', '', 'pink'];
/** Paare, die Hand in Hand durch die Stadt gehen: [Figur, Look, Figur, Look, Block] */
const COUPLES: Array<[string, string, string, string, number, number]> = [
  ['Male_Adult_01', 'regenbogen', 'Male_Adult_08', 'bear', 0, 0], ['Female_Adult_02', 'lesbisch', 'Female_Adult_07', 'pink', -30, 0], ['Male_Adult_05', 'leder', 'Male_Adult_03', 'lederjacke', 0, -30],
  ['Female_Adult_04', 'trans', 'Male_Adult_07', 'pan', -30, -30], ['Female_Party_01', 'drag', 'Female_Party_02', 'gold', 30, 0], ['Sports_Male_01', 'crop', 'Male_Adult_10', 'progress', -60, 0],
  ['Female_Adult_09', 'bi', 'Sports_Female_01', 'enby', 120, 0], ['Male_Adult_04', 'glitzer', 'Male_Adult_02', 'regenbogen', 150, -30],
];
/** Szene-Leute, die an festen Plätzen stehen, tanzen, lachen: [Figur, Look, x, z, Blick, Bewegung] */
const SCENE: Array<[string, string, number, number, number, Anim]> = [
  ['Female_Party_02', 'drag', -11.5, 9.5, 2.3, 'pose'], ['Female_Party_01', 'gold', -10.2, 8.3, -1.2, 'talk'], ['Male_Adult_09', 'glitzer', -12.4, 8.1, .6, 'cheer'],
  ['Male_Adult_08', 'leder', 5.7, -11.6, -.4, 'talk'], ['Male_Adult_06', 'bear', 5.9, -10.3, -2.6, 'talk'],
  ['Male_Adult_03', 'crop', 5.5, 17.5, -1.6, 'dance1'], ['Male_Adult_07', 'regenbogen', 6, 18.9, -2.4, 'dance2'],
  ['Female_Adult_03', 'lesbisch', -5.6, 14, 1.6, 'talk'], ['Female_Adult_08', 'trans', -5.9, 15.2, 2.3, 'drink'],
  ['Female_Adult_06', 'pan', -5.6, -11, 1.6, 'phone'], ['Male_Adult_02', 'progress', 24.4, 5.6, 0, 'cheer'], ['Female_Adult_10', 'enby', -24.5, -5.6, 3.1, 'dance2'],
  ['Male_Adult_04', 'lederjacke', 128.6, 37.4, -1.6, 'talk'], ['Female_Party_02', 'glitzer', 128.9, 40.6, -2, 'dance3'], ['Male_Adult_10', 'pink', 127.4, 10.5, 1.2, 'talk'],
];

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
      const n: StreetNpc = { a, kind, name, color, path, wp: 1 % path.length, wait: Math.random() * 4, id, anim };
      this.people.push(n); return n;
    };
    const blocks: Array<[number, number]> = [[0, 0], [-30, -30], [0, -30], [30, -30], [30, 0], [-60, 0], [0, 30], [-30, 30], [-60, -30], [30, 30], [-60, 30], [0, -60]];
    const jobs: Promise<unknown>[] = [];
    blocks.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[i], WALK_STYLE[i]), 'walker', NAMES[i], '#8fa3c8', block(a, b, i % 2 === 0))));
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
    up.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[(i + 5) % WALKERS.length], WALK_STYLE[(i + 3) % WALK_STYLE.length]), 'walker', NAMES[(i + 5) % NAMES.length], '#8fa3c8', block(a, b, i % 2 === 1))));
    // Paare Hand in Hand (die zweite Person läuft neben der ersten her) und Szene-Leute an festen Plätzen
    COUPLES.forEach(([ra, sa, rb, sb, bx, bz], i) => jobs.push((async () => {
      const path = block(bx, bz, i % 2 === 1).map(([x, z]) => [x + (x > bx + 15 ? .5 : -.5), z + (z > bz + 15 ? .5 : -.5)] as [number, number]);
      const start = (i * 2 + 1) % 4; const p2 = [...path.slice(start), ...path.slice(0, start)];
      const lead = await mk(L(ra, sa), 'walker', i % 2 ? 'Verliebte' : 'Verliebter', '#ff8ac8', p2);
      (await mk(L(rb, sb), 'walker', i % 3 ? 'Verliebter' : 'Verliebte', '#ff8ac8', [p2[0]])).mate = lead;
    })()));
    // nie in einer Hauswand stehen: notfalls Schritt für Schritt zur Straße hin rücken
    const blocked = (x: number, z: number) => this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .5 && Math.abs(z - c.z) < c.hz + .5);
    const clear = (x: number, z: number): [number, number] => {
      const rx = Math.round(x / 30) * 30, rz = Math.round(z / 30) * 30, alongX = Math.abs(x - rx) < Math.abs(z - rz);
      for (let i = 0; i < 12 && blocked(x, z); i++) { if (alongX) x += Math.sign(rx - x) * .3; else z += Math.sign(rz - z) * .3; }
      return [x, z];
    };
    SCENE.map(([rb, st, x0, z0, yaw, anim]) => [rb, st, ...clear(x0, z0), yaw, anim] as const).forEach(([rb, st, x, z, yaw, anim]) => jobs.push(mk(L(rb, st), 'walker', 'Szene-Mensch', '#ffb347', [[x, z]], undefined, anim).then((n) => { n.yaw = yaw; })));
    // Szene-Figuren vor Clubs und Bars (Pup, Leder, Kinky, Bear, Twink, Drag, Trans-Diva …), kinky Arten nur nachts mit 18+
    STREET_SZENE.forEach(([id, x0, z0, yaw], i) => {
      const ty = SZENE[id], rb = szeneRb(ty, 'street' + i), [x, z] = clear(x0, z0);
      jobs.push(mk({ ...L(rb, ty.style), outfit: szeneOutfit(ty, !!ty.adult), gear: ty.gear, hot: !!ty.adult }, 'szene', ty.name, ty.color, [[x, z]], id, ty.anim[i % ty.anim.length]).then((n) => { n.yaw = yaw; }));
    });
    await Promise.all(jobs);
    // Sexarbeiter*innen klar erkennbar: Leuchtschild mit Name und Angebot, roter Kreis (sichtbar nur mit 18+ und nachts, wie die Figur)
    for (const n of this.people) {
      if (n.kind === 'worker') { const w = WORKERS.find((x) => x.id === n.id); if (w) escortSign(this.world.scene, n.a.root, `🏮 ESCORT ${w.name.toUpperCase()}`, `${w.age} · ${w.price} €/Std · Haus Rosa`, '#ff3b6b'); }
      if (n.kind === 'curb') { const w = CURB.find((x) => x.id === n.id); if (w) escortSign(this.world.scene, n.a.root, `💋 ${w.name.toUpperCase()}`, `Laternenmeile · ${w.price} € · hupen`, '#ff2a55'); }
    }
    this.people.filter((p) => p.path.length === 1).forEach((p) => (p.a.root.rotation.y = p.yaw !== undefined ? p.yaw : p.kind === 'curb' ? Math.PI : p.path[0][0] > 0 ? -Math.PI / 2 : Math.PI / 2));
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
      ['rakete', -75, 19, 0], ['heli', ...BASE.heli], ['flieger', ...BASE.plane],
      ['ringmobil', -22, 32.7, -Math.PI / 2], ['ringmobil', -66, 30, 0],
      ['roller', -6, 32.7, -Math.PI / 2], ['roller', -66, 37, 0], ['pridebus', -15, -27.3, Math.PI / 2], ['boot', -98.4, 30, -Math.PI / 2],
      ['sport', 157.2, -51, Math.PI], ['bulli', 162.4, -51, Math.PI], ['pickup', 159.8, -38.5, 0], ['lux', 130, 62.7, -Math.PI / 2], ['liefer', 196, -62.7, Math.PI / 2],
    ];
    for (const [id, x, z, yaw] of spots) {
      const def = carDef(id);
      let o: Node3;
      // der Flitzer zum Fliegen steht neben dem Weltentor (Form je nach 18+ setzt CityScene)
      if (def.air) { o = new Node3(def.id, this.scene); buildAircraft(this.scene, o, def.air); o.parent = this.world.root; o.position.set(x, .75, z); o.rotation.y = yaw; this.parked.push({ o, name: def.name, yaw, v: 0, def }); continue; }
      if (def.fly) { this.addFlyer(x, z, yaw); continue; }
      // Penisring- bzw. Donut-Mobil (Form je nach 18+ setzt CityScene)
      if (def.ride) { o = new Node3(def.id, this.scene); buildRide(this.scene, o, def.ride); o.parent = this.world.root; o.position.set(x, def.ride === 'boat' ? .05 : .1, z); o.rotation.y = yaw; this.parked.push({ o, name: def.name, yaw, v: 0, def }); continue; }
      if (def.toy) { o = new Node3('ringmobil', this.scene); buildRingMobil(this.scene, o, false); o.parent = this.world.root; o.position.set(x, .1, z); o.rotation.y = yaw; this.parked.push({ o, name: 'Donut-Mobil', yaw, v: 0, def }); continue; }
      o = await this.world.car(def.file);
      o.position.set(x, .1, z); o.rotation.y = yaw;
      this.parked.push({ o, name: def.name, yaw, v: 0, def });
    }
  }
  /** ein Flitzer zum Fliegen (Form je nach 18+ setzt CityScene); steht am Weltentor und auf den Inseln */
  addFlyer(x: number, z: number, yaw: number) {
    const def = carDef('rakete'), o = new Node3('rakete', this.scene); buildFlitzer(this.scene, o, false); o.parent = this.world.root;
    o.position.set(x, .75, z); o.rotation.y = yaw;
    this.parked.push({ o, name: def.name, yaw, v: 0, def });
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
    for (const [a, b] of this.flash) { a.c.scaleToRef(on ? 1 : .12, a.m.albedoColor); b.c.scaleToRef(on ? .12 : 1, b.m.albedoColor); } // direkt ändern, ohne Neu-Markieren aller Meshes
    const far = this.world.low ? 50 : 90, anim = this.world.low ? 28 : 60;
    this.people.forEach((n, i) => {
      const show = n.away ? false : n.kind === 'worker' || n.kind === 'curb' ? adult && night > .4 : n.kind === 'walker' ? (night < .5 || i % 2 === 0 || !!n.mate || n.yaw !== undefined) : n.kind === 'security' ? night > .3 : n.kind === 'szene' ? !SZENE[n.id!]?.adult || (adult && night > .3) : true;
      const d2 = Vector3.DistanceSquared(n.a.root.position, ref);
      n.a.root.visible = !n.away && (n.chase || n.talking || (show && d2 < far * far));
      if (!n.a.root.visible) return;
      if (d2 < anim * anim || n.chase) n.a.update(dt);
      if (n.talking || n.down || n.chase) return;
      // Hand in Hand: neben der Partnerperson herlaufen, gleiche Richtung, gleicher Schritt
      const m = n.mate;
      if (m) {
        if (m.talking || m.down || m.chase || m.away) { if (n.a.anim !== 'idle') n.a.play('idle'); return; }
        const yaw = m.a.root.rotation.y, q = m.a.root.position, p = n.a.root.position, tx = q.x + Math.cos(yaw) * .62, tz = q.z - Math.sin(yaw) * .62;
        if (Math.hypot(tx - p.x, tz - p.z) > 6) p.set(tx, .1, tz); else { p.x += (tx - p.x) * Math.min(1, dt * 6); p.z += (tz - p.z) * Math.min(1, dt * 6); }
        n.a.root.rotation.y = yaw;
        if (m.a.anim === 'walk') n.a.play('walk', .25, 1.4 / WALK_MPS); else if (n.a.anim !== 'idle') n.a.play('idle');
        return;
      }
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
  line(n: StreetNpc, day: number) { if (n.kind === 'szene' && SZENE[n.id!]) return szeneLine(SZENE[n.id!], false, day + Math.floor(this.t / 20)); const pool = LINES[n.kind as Exclude<StreetKind, 'worker' | 'curb' | 'szene'>] || LINES.walker; return pool[(day + n.name.length + Math.floor(this.t / 20)) % pool.length]; }
  nearCar(p: Vector3, r = 3.2) { return this.parked.find((c) => Vector3.Distance(c.o.position, p) < r) || null; }
  /** Auto im Verkehr in Reichweite (hält an, wenn du davorstehst): lässt sich ausleihen. Streife und Löschzug bleiben im Dienst. */
  nearTraffic(p: Vector3, r = 5.5) { return this.world.cars.find((c) => !c.off && c.kind !== 'truck' && c.kind !== 'car_police' && Vector3.Distance(c.o.position, p) < r) || null; }
  trafficDef(c: Car) { return CAR_DEFS.find((d) => d.file === c.kind) || carDef('hatch'); }
  /** Auto aus dem Verkehr nehmen und fahrbar machen */
  borrow(c: Car): Parked {
    const i = this.world.cars.indexOf(c); if (i >= 0) this.world.cars.splice(i, 1);
    const def = this.trafficDef(c), car: Parked = { o: c.o, name: def.name, yaw: c.o.rotation.y, v: 0, def, route: c };
    this.parked.push(car); return car;
  }
  /** Geliehene Autos, die weit weg stehen gelassen wurden, fahren wieder ihre Runde */
  giveBack(p: Vector3, driving: Parked | null) {
    for (let i = this.parked.length - 1; i >= 0; i--) {
      const c = this.parked[i];
      if (!c.route || c === driving || Vector3.Distance(c.o.position, p) < 75) continue;
      this.parked.splice(i, 1); c.route.u = Math.random(); this.world.cars.push(c.route);
    }
  }
}
export { TransformNode };
