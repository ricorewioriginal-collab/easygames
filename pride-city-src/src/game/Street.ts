/* Belebte Straßen: Passant*innen auf den Gehwegen, Polizeistreife, Feuerwehr mit Löschzug, Sanitäterin, Türsteher,
   Köchin und Kurier, Sexarbeiter*innen vor dem Haus Rosa (nur nachts und nur mit 18+) und geparkte Autos zum Einsteigen.
   Alle Menschen sind Rocketbox-Figuren. Leichtgewichtig: Figuren weit weg werden weder animiert noch gezeichnet. */
import { Vector3, Color3, Node3, TransformNode } from '../engine/bjs';
import { box, glow } from '../engine/geo';
import { Actor, WALK_MPS, RUN_MPS, type Anim, type Look } from './Actor';
import { WORKERS, CURB } from './social';
import { buildFlitzer } from './flitzer';
import { buildAircraft, BASE } from './luft';
import { buildRingMobil } from './toys';
import { buildRide } from './rides';
import { instance } from '../engine/Assets';
import { CURB_SPOTS } from './uptown';
import { escortSign } from './spuren';
import { SZENE, STREET_SZENE, szeneRb, szeneOutfit, szeneLine } from './szene';
import { carDef, CAR_DEFS, type CarDef } from './vehicles';
import type { World, Car } from './World';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { phaseAt } from './leben';
import { Pet3D } from './pet3d';
import { walkable } from './World';
import type { PBRMaterial, Scene } from '../engine/bjs';

export type StreetKind = 'walker' | 'police' | 'fire' | 'worker' | 'curb' | 'medic' | 'security' | 'chef' | 'courier' | 'szene';
export interface StreetNpc { a: Actor; kind: StreetKind; name: string; color: string; path: Array<[number, number]>; wp: number; wait: number; id?: string; anim?: Anim; talking?: boolean; down?: boolean; chase?: boolean; away?: boolean; /** läuft Hand in Hand neben dieser Person */ mate?: StreetNpc; /** feste Blickrichtung */ yaw?: number; /** springt gerade vor einem Auto zur Seite */ dodge?: { vx: number; vz: number; t: number };
  /** Tagesablauf (leben.ts): Runde tagsüber und abends, eigener Rhythmus; Flucht vor Ärger, schon die Polizei gerufen */
  home?: Array<[number, number]>; out?: Array<[number, number]>; h?: number; flee?: number; called?: boolean; seen?: number; /** wie lange du schon zu dicht dran bist bzw. hinterherläufst */ close?: number; follow?: number; /** geht mit Hund Gassi */ dog?: Pet3D; dogName?: string }
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
    // abends ziehen die Leute ins Nachtleben: rund um Prisma, Neonplatz und Hochstadt
    const OUT: Array<[number, number]> = [[0, -30], [-30, 0], [0, 0], [120, 30], [150, 0], [0, 30]];
    blocks.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[i], WALK_STYLE[i]), 'walker', NAMES[i], '#8fa3c8', block(a, b, i % 2 === 0)).then((n) => { n.home = n.path; n.out = block(...OUT[i % OUT.length], i % 2 === 1); n.h = i * 7 + 3; })));
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
    up.forEach(([a, b], i) => jobs.push(mk(L(WALKERS[(i + 5) % WALKERS.length], WALK_STYLE[(i + 3) % WALK_STYLE.length]), 'walker', NAMES[(i + 5) % NAMES.length], '#8fa3c8', block(a, b, i % 2 === 1)).then((n) => { n.home = n.path; n.out = block(...([[120, 30], [150, 0], [0, -30]] as Array<[number, number]>)[i % 3], i % 2 === 0); n.h = i * 5 + 1; })));
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
    // ein paar Leute gehen mit ihrem Hund Gassi (streicheln nur nach Fragen, Leckerli aus dem Späti)
    const DOGS: Array<[string, number]> = [['Bello', 0x8a5a2b], ['Krümel', 0xe8d2a6], ['Luna', 0x2a2522], ['Pixel', 0xb9b2a8], ['Toffee', 0xc7823b], ['Gizmo', 0xf2efe9]];
    this.people.filter((n) => n.home && !n.mate).filter((_, i) => i % 3 === 1).slice(0, DOGS.length).forEach((n, i) => {
      const d = new Pet3D(this.scene, 'hund', DOGS[i][1]); d.root.parent = this.world.root; d.place(n.a.root.position.x - .8, n.a.root.position.z, 0);
      n.dog = d; n.dogName = DOGS[i][0];
    });
    await this.cars();
  }
  /** Hund in der Nähe (mit Besitzer*in) */
  nearDog(p: Vector3, r = 2.4) { return this.people.find((n) => n.dog && n.a.root.visible && Vector3.Distance(n.dog.root.position, p) < r) || null; }
  /** Hund freut sich (Streicheln, Leckerli): wedelt ein paar Sekunden wild */
  private happy = new Map<StreetNpc, number>();
  cheer(n: StreetNpc, s = 4) { this.happy.set(n, s); }

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
    // Löschzug (Sketchfab „Firetruck“ von OzerGokmen, CC BY 4.0, scripts/rides.mjs): fährt eine eigene Runde, Blaulicht auf dem Dach
    const truck = new Node3('truck', sc);
    const ft = await instance(sc, 'rides/firetruck.glb', { shadows: !this.world.low });
    ft.parent = truck; ft.scaling.setAll(8 / 9);
    const fm = [blue(), blue()] as const;
    [-1, 1].forEach((sx, i) => { const b = box(sc, .4, .16, .26); b.material = fm[i].m; b.position.set(sx * .55, 3.12, 3.05); b.parent = truck; b.isPickable = false; });
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
  /** dein Auto (Lage, Fahrtrichtung, Tempo): Passant*innen springen zur Seite */
  danger: { x: number; z: number; yaw: number; v: number } | null = null;
  /** Lage der Stadt für den Tagesablauf (setzt CityScene): Stunde, Regen, Ärger, du */
  life: { hour: number; rain: boolean; alarm: { x: number; z: number } | null; player: Vector3; onFoot: boolean } | null = null;
  /** du gehst an jemandem vorbei (Grüßen, Gedächtnis) bzw. jemand musste vor deinem Auto zur Seite springen */
  onPass?: (n: StreetNpc) => void;
  onDodge?: (n: StreetNpc) => void;
  /** du bist jemandem zu nah gekommen bzw. läufst hinterher */
  onCrowd?: (n: StreetNpc, stalk: boolean) => void;
  private yellT = -9;
  update(dt: number, night: number, adult: boolean, ref: Vector3) {
    // Löschzug mit Martinshorn, wenn er in der Nähe vorbeifährt
    this.sirenT -= dt;
    if (this.sirenT < 0) { this.sirenT = 30 + Math.random() * 30; const tr = this.world.cars.at(-1)?.o; if (tr && Vector3.Distance(tr.position, ref) < 40) sfx('siren'); }
    this.t += dt;
    const on = Math.floor(this.t * 4) % 2;
    for (const [a, b] of this.flash) { a.c.scaleToRef(on ? 1 : .12, a.m.albedoColor); b.c.scaleToRef(on ? .12 : 1, b.m.albedoColor); } // direkt ändern, ohne Neu-Markieren aller Meshes
    const far = this.world.low ? 50 : 90, anim = this.world.low ? 28 : 60;
    // Hunde laufen ihren Menschen hinterher (nur in der Nähe animiert)
    for (const n of this.people) {
      const d = n.dog; if (!d) continue;
      const vis = n.a.root.visible; if (d.root.isEnabled() !== vis) d.root.setEnabled(vis);
      if (!vis) { d.place(n.a.root.position.x, n.a.root.position.z, 0); continue; }
      let h = this.happy.get(n) || 0; if (h > 0) { h -= dt; this.happy.set(n, h); }
      if (Vector3.DistanceSquared(d.root.position, ref) < anim * anim) d.update(dt, h > 0 && this.life ? this.life.player : n.a.root.position, h > 0 || n.talking === true, [-999, 999, -999, 999]);
      if (Vector3.Distance(d.root.position, n.a.root.position) > 8) d.place(n.a.root.position.x - .8, n.a.root.position.z, n.a.root.rotation.y);
    }
    this.people.forEach((n, i) => {
      const life = this.life, ph = n.home && life ? phaseAt(life.hour, n.h!) : null;
      const show = n.away ? false : n.kind === 'worker' || n.kind === 'curb' ? adult && night > .4 : ph ? ph !== 'schlaf' : n.kind === 'walker' ? (night < .5 || i % 2 === 0 || !!n.mate || n.yaw !== undefined) : n.kind === 'security' ? night > .3 : n.kind === 'szene' ? !SZENE[n.id!]?.adult || (adult && night > .3) : true;
      const d2 = Vector3.DistanceSquared(n.a.root.position, ref);
      // Tagesablauf: abends auf der Ausgeh-Runde, sonst zu Hause; gewechselt wird außer Sicht
      if (ph && n.out && !n.talking) {
        const want = ph === 'abend' ? n.out : n.home!;
        if (n.path !== want && (d2 > 45 * 45 || !show)) { n.path = want; n.wp = 1; n.a.root.position.set(want[0][0], .1, want[0][1]); }
      }
      n.a.root.visible = !n.away && (n.chase || n.talking || (show && d2 < far * far));
      if (!n.a.root.visible) return;
      if (d2 < anim * anim || n.chase) n.a.update(dt);
      if (n.talking || n.down || n.chase) return;
      // Auto rast heran: zur Seite springen (und schimpfen), danach weiter des Weges
      const dg = this.danger;
      if (dg && !n.dodge && Math.abs(dg.v) > 4.5) {
        const sg = Math.sign(dg.v), fx = Math.sin(dg.yaw) * sg, fz = Math.cos(dg.yaw) * sg, q = n.a.root.position;
        const dx = q.x - dg.x, dz = q.z - dg.z, along = dx * fx + dz * fz, side = dx * fz - dz * fx;
        if (along > -1 && along < 3 + Math.abs(dg.v) * .5 && Math.abs(side) < 2) {
          const k = side >= 0 ? 1 : -1, sp = Math.abs(side) < 1.1 && along < 2 ? 7 : 5.5;
          n.dodge = { vx: fz * k * sp, vz: -fx * k * sp, t: .6 };
          n.a.root.rotation.y = Math.atan2(n.dodge.vx, n.dodge.vz); n.a.play('run', .1, 1.5);
          this.onDodge?.(n);
          if (this.t - this.yellT > 3) { this.yellT = this.t; sfx('squeak'); toast(`🙀 ${n.name}: ${DODGE[Math.floor(Math.random() * DODGE.length)]}`, 1800); }
        }
      }
      // Ärger in der Nähe (Schlägerei, Fahndung): weglaufen, manche rufen danach die Polizei
      const al = life?.alarm, civil = n.kind === 'walker' || n.kind === 'szene' || n.kind === 'chef' || n.kind === 'courier';
      if (al && civil && n.yaw === undefined) {
        const q = n.a.root.position, dx = q.x - al.x, dz = q.z - al.z, d = Math.hypot(dx, dz) || 1;
        if (d < 16 && !n.flee) { n.flee = 2.5 + (n.h ?? i) % 3; n.called = false; }
        if (n.flee && n.flee > 0) {
          n.flee -= dt; const nx = q.x + dx / d * 4.2 * dt, nz = q.z + dz / d * 4.2 * dt; if (walkable(nx, nz) && !this.world.colliders.some((c) => Math.abs(nx - c.x) < c.hx + .3 && Math.abs(nz - c.z) < c.hz + .3)) { q.x = nx; q.z = nz; }
          n.a.root.rotation.y = Math.atan2(dx, dz); n.a.play('run', .12, 1.4);
          if (n.flee <= 0 && !n.called && ((n.h ?? i) + Math.floor(this.t)) % 4 === 0 && this.t - this.yellT > 5) {
            n.called = true; this.yellT = this.t; n.a.root.rotation.y = Math.atan2(-dx, -dz); n.a.play('phone');
            toast(`📱 ${n.name} ruft die Polizei!`, 2200);
          }
          return;
        }
        if (n.called) { if (n.a.anim !== 'phone') n.a.play('phone'); return; }
      } else if (n.flee !== undefined) { n.flee = undefined; n.called = false; }
      // dich bemerken: stehende Leute drehen sich zu dir um, Bekannte grüßen
      if (life?.player && !n.mate) {
        const q = n.a.root.position, pp = life.player, dx = pp.x - q.x, dz = pp.z - q.z, d2p = dx * dx + dz * dz;
        if (d2p < 16 && (n.wait > 0 || n.path.length < 2)) { let dy = Math.atan2(dx, dz) - n.a.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); n.a.root.rotation.y += dy * Math.min(1, dt * 4); }
        if (d2p < 9 && life.onFoot && this.t - (n.seen ?? -99) > 40) { n.seen = this.t; this.onPass?.(n); }
        // zu dicht dran oder hinterherlaufen: die Person merkt es, sagt etwas und geht auf Abstand
        if (life.onFoot && civil && !n.talking) {
          n.close = d2p < 2.6 ? (n.close || 0) + dt : Math.max(0, (n.close || 0) - dt * 2);
          n.follow = d2p < 36 && n.path.length > 1 && n.wait <= 0 ? (n.follow || 0) + dt : Math.max(0, (n.follow || 0) - dt);
          const crowd = (n.close || 0) > 2.5, stalk = (n.follow || 0) > 12;
          if (crowd || stalk) {
            n.close = 0; n.follow = 0; this.onCrowd?.(n, stalk);
            const d = Math.sqrt(d2p) || 1; n.dodge = { vx: -dx / d * 3, vz: -dz / d * 3, t: stalk ? 1.6 : .8 };
            n.a.root.rotation.y = Math.atan2(n.dodge.vx, n.dodge.vz); n.a.play(stalk ? 'run' : 'walk', .15, 1.2);
          }
        }
      }
      if (n.dodge) {
        const d = n.dodge, q = n.a.root.position, nx = q.x + d.vx * dt, nz = q.z + d.vz * dt; d.t -= dt;
        if (walkable(nx, nz) && !this.world.colliders.some((c) => Math.abs(nx - c.x) < c.hx + .3 && Math.abs(nz - c.z) < c.hz + .3)) { q.x = nx; q.z = nz; }
        if (d.t <= 0) { n.dodge = undefined; n.wait = 1.2; n.a.play('idle'); }
        return;
      }
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
      if (n.wait > 0) { n.wait -= dt; if (n.a.anim === 'walk' || n.a.anim === 'run') n.a.play('idle'); return; }
      const [tx, tz] = n.path[n.wp], p = n.a.root.position, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      if (d < .3) {
        n.wp = (n.wp + 1) % n.path.length;
        // Mittagspause: länger stehen, trinken oder aufs Handy schauen; bei Regen keine Pause
        if (ph === 'mittag' && !life?.rain && Math.random() < .7) { n.wait = 6 + Math.random() * 8; n.a.play(Math.random() < .5 ? 'drink' : 'phone'); return; }
        if (Math.random() < .35 && n.kind !== 'courier' && !life?.rain) n.wait = 1 + Math.random() * 3;
        return;
      }
      // bei Regen eilig, morgens zügig zur Arbeit
      const run = n.kind === 'courier' || (!!life?.rain && n.kind !== 'police');
      const sp = run ? (n.kind === 'courier' ? 3.4 : 2.7) : n.kind === 'police' ? 1.3 : ph === 'weg' ? 1.8 : 1.4;
      p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt;
      n.a.root.rotation.y = Math.atan2(dx, dz);
      n.a.play(run ? 'run' : 'walk', .25, sp / (run ? RUN_MPS : WALK_MPS));
    });
  }

  /** Zeug*in: nächste sichtbare Person (keine Uniform), die gerade frei ist */
  witness(p: Vector3, r: number) {
    let best: StreetNpc | null = null, bd = r;
    for (const n of this.people) {
      if (!n.a.root.visible || n.talking || n.down || n.chase || n.mate || !(n.kind === 'walker' || n.kind === 'szene' || n.kind === 'chef' || n.kind === 'courier')) continue;
      const d = Vector3.Distance(n.a.root.position, p); if (d < bd) { bd = d; best = n; }
    }
    return best;
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
const DODGE = ['„Hey! Das ist ein Gehweg!“', '„Huch! Fast meine Frisur ruiniert!“', '„Fahr doch nicht wie eine Furie!“', '„Mein Kaffee! Ach, egal.“', '„Kein Führerschein, aber Glitzer, oder?“'];
