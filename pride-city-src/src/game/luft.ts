/* Flugschule Möwenflug am Kai: Wasserflugzeug „Möwe“ und Helikopter „Libelle“, dazu Captain Sunny Okafor.
   Schnupperflug (Flugschein) durch Ringe über dem Hafen, Rundflüge mit Fahrgästen über Skyline und Inselkette,
   Lieferflüge zu den Inseln (über dem Ziel unter 6 m sinken). Steuerung wie der Flitzer (CityScene.moveCar):
   Stick/WASD lenkt und gibt Gas, ▲/▼ (RB/LB, R/Q) steigt und sinkt, A landet. Das Flugzeug bleibt in der Luft
   immer in Bewegung, der Helikopter kann schweben. Modelle aus Grundformen, drehende Teile heißen „spin“. */
import { Node3, type Mesh, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow } from '../engine/geo';
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { Gig, GigStep } from './gigs';
import type { NpcDef, StoryCtx } from './story';
import { ISLES, WORLDS, isleXZ } from './worlds';
import { hour } from './life';

export type AirKind = 'plane' | 'heli';
const RAINBOW = [0xe40303, 0xff8c00, 0xffed00, 0x008026, 0x004dff, 0x750787];

/** Flugschule am Südende vom Kai (hinter der Fischbude): Hubschrauber-Landeplatz; das Wasserflugzeug steht am Kai beim Steg */
export const BASE = { x: -70, z: -26, heli: [-74, -30.8, -Math.PI / 2] as [number, number, number], plane: [-86, 4, -Math.PI / 2] as [number, number, number] };

/** Fluggerät bauen; der Boden liegt bei y = −0,75 (Wurzel steht wie beim Flitzer auf 0,75) */
export function buildAircraft(sc: Scene, root: Node3, kind: AirKind) {
  root.getChildMeshes().forEach((m) => m.dispose());
  root.metadata = { air: kind };
  const P = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number, par: Node3 = root) => { m.material = mt; m.position.set(x, y, z); m.parent = par; m.isPickable = false; return m; };
  const metal = pbr(sc, 0xc8ccd4, .35, .8), dark = pbr(sc, 0x22242c, .6, .3), glass = pbr(sc, 0x9fd8ff, .05, .2, { alpha: .55 });
  if (kind === 'heli') {
    // Libelle: pinke Kabine mit Glaskuppel, Heckausleger, Kufen, Haupt- und Heckrotor
    const body = pbr(sc, 0xff4fa3, .3, .35, { emissive: 0xff2f8a, ei: .12 });
    const cab = P(sphere(sc, 1.05, 16), body, 0, .55, .1); cab.scaling.set(1, .95, 1.45);
    const dome = P(sphere(sc, .9, 16), glass, 0, .75, .75); dome.scaling.set(1, .9, .9);
    const boom = P(cyl(sc, .14, .32, 3.4, 10), body, 0, .7, -2.3); boom.rotation.x = Math.PI / 2;
    P(box(sc, .08, .8, .55), body, 0, 1.05, -3.9);
    RAINBOW.forEach((c, i) => P(box(sc, .02, .09, 1.2), pbr(sc, c, .5), (i % 2 ? 1 : -1) * 1.03, .6 - (i >> 1) * .1 + .12, 0));
    for (const sx of [-1, 1]) {
      P(box(sc, .07, .07, 2.6), metal, sx * .8, -.7, .1);
      for (const z of [-.6, .7]) { const st = P(cyl(sc, .035, .035, .55, 6), metal, sx * .72, -.45, z); st.rotation.z = sx * .25; }
    }
    P(cyl(sc, .08, .1, .5, 8), dark, 0, 1.6, 0);
    const rot = new Node3('spin', sc); rot.parent = root; rot.position.set(0, 1.85, 0); rot.metadata = { r: .1, axis: 'y' };
    for (const a of [0, Math.PI / 2]) { const b = P(box(sc, 6.4, .04, .22), dark, 0, 0, 0, rot); b.rotation.y = a; }
    const tail = new Node3('spin', sc); tail.parent = root; tail.position.set(.12, 1.05, -3.95); tail.metadata = { r: .1, axis: 'x' };
    for (const a of [0, Math.PI / 2]) { const b = P(box(sc, .03, 1, .1), dark, 0, 0, 0, tail); b.rotation.x = a; }
    P(sphere(sc, .07, 6), glow(sc, 0xff3030, 1.6), 0, 1.5, -3.95);
  } else {
    // Möwe: weißer Schulterdecker mit Regenbogen-Streifen, zwei Schwimmer, Propeller vorn
    const white = pbr(sc, 0xf7f8fb, .3, .25), yellow = pbr(sc, 0xffd23b, .35, .3);
    const fus = P(cyl(sc, .55, .32, 4.6, 14), white, 0, .45, 0); fus.rotation.x = Math.PI / 2;
    const nose = P(sphere(sc, .56, 14), white, 0, .45, 2.3); nose.scaling.set(1, 1, .7);
    P(cyl(sc, .12, .32, 1.6, 10), white, 0, .55, -2.9).rotation.x = Math.PI / 2;
    P(box(sc, .9, .45, 1.2), glass, 0, 1.0, 1.1);
    P(box(sc, 9.6, .12, 1.25), white, 0, 1.3, .9);
    for (const sx of [-1, 1]) { P(box(sc, .5, .13, 1.27), yellow, sx * 4.6, 1.3, .9); const st = P(cyl(sc, .03, .03, 1.3, 6), metal, sx * 1.4, .8, .9); st.rotation.z = sx * .7; }
    P(box(sc, 3.2, .08, .8), white, 0, .65, -3.4);
    P(box(sc, .08, 1.1, .9), white, 0, 1.15, -3.45);
    RAINBOW.forEach((c, i) => P(box(sc, 1.13, .07, 3.6), pbr(sc, c, .5), 0, .62 - i * .07, -.2));
    for (const sx of [-1, 1]) {
      const fl = P(cyl(sc, .22, .22, 4.2, 10), white, sx * 1.15, -.55, .3); fl.rotation.x = Math.PI / 2;
      P(sphere(sc, .22, 8), white, sx * 1.15, -.55, 2.4).scaling.set(1, 1, 1.6);
      for (const z of [-.4, 1.3]) { const st = P(cyl(sc, .035, .035, .85, 6), metal, sx * .8, -.15, z); st.rotation.z = sx * .7; }
    }
    const prop = new Node3('spin', sc); prop.parent = root; prop.position.set(0, .45, 2.75); prop.metadata = { r: .1, axis: 'z' };
    P(sphere(sc, .16, 8), yellow, 0, 0, 0, prop);
    for (const a of [0, Math.PI / 2]) { const b = P(box(sc, .12, 1.9, .05), dark, 0, 0, 0, prop); b.rotation.z = a; }
    for (const sx of [-1, 1]) P(sphere(sc, .08, 6), glow(sc, sx < 0 ? 0xff3030 : 0x30ff60, 1.6), sx * 4.85, 1.3, .9);
  }
}

/** Landeplatz: großes H im Kreis, Windsack, Schild – einmal gebaut, eingefroren */
export function buildPad(sc: Scene, parent: Node3) {
  const r = new Node3('flugschule', sc); r.parent = parent;
  const pad = pbr(sc, 0x3a3d46, .8), line = glow(sc, 0xfff1a8, 1.2), out: Mesh[] = [];
  const add = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.parent = r; m.isPickable = false; out.push(m); return m; };
  const [hx, hz] = BASE.heli;
  add(cyl(sc, 3.6, 3.6, .06, 28), pad, hx, .08, hz);
  const ring = add(torus(sc, 3.2, .09, 28), line, hx, .12, hz); ring.scaling.y = .2;
  add(box(sc, .35, .02, 2.6), line, hx - .75, .13, hz); add(box(sc, .35, .02, 2.6), line, hx + .75, .13, hz); add(box(sc, 1.5, .02, .35), line, hx, .13, hz);
  add(cyl(sc, .05, .05, 4, 6), pbr(sc, 0xcccccc, .4, .8), -79.5, 2, -32.6);
  const sock = add(cyl(sc, .32, .14, 1.3, 10), pbr(sc, 0xff7a1a, .6), -79.5, 3.7, -33.25); sock.rotation.x = Math.PI / 2 + .25;
  for (const m of out) { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; }
  return r;
}

/* ---------- Captain Sunny und die Flüge ---------- */
export const LUFT_NPCS: NpcDef[] = [
  { id: 'sunny', name: 'Captain Sunny Okafor', pron: 'sie/ihr', color: '#ffb347', look: { body: 'Woman', rb: 'Female_Adult_07', palette: 'rainbow', skin: 3, hair: 0 }, x: BASE.x, z: BASE.z, yaw: Math.PI / 2 },
];
const SUN = (text: Line['text'], choices?: Line['choices']): Line => ({ who: 'Captain Sunny Okafor', pron: 'sie/ihr', color: '#ffb347', text, choices });

/** Ring in der Luft: x, z, Höhe, Name */
type Pt = [number, number, number, string];
const R = (x: number, z: number, y: number, label: string): GigStep => ({ x, z, y, r: 9, air: true, label, icon: '⭕' });
const home = (): GigStep => ({ x: BASE.heli[0], z: BASE.heli[1], r: 9, low: true, air: true, label: 'Zurück zur Flugschule und landen (unter 6 m)', icon: '🛬' });
const isleAt = (id: string, y: number, label: string): Pt => { const i = ISLES[id]; return [i.x, i.z, y, label]; };

export interface Tour { id: string; name: string; who: string; text: string; pay: number; rep: number; time: number; pts: () => Pt[]; from?: number; to?: number; adultExtra?: Pt }
export const TOURS: Tour[] = [
  { id: 'skyline', name: 'Skyline-Runde', who: 'Ingrid und Paul aus Bergen', pay: 140, rep: 2, time: 170,
    text: 'Einmal über alles, was man von unten nicht sieht: Leuchtturm, Plaza, Regenbogenbrücke und die Türme der Hochstadt.',
    pts: () => [[-72, -12, 22, 'Über den Club Leuchtturm'], [-15, 15, 24, 'Über die Pride Plaza'], [45, 45, 20, 'Über den Regenbogenpark'], [77, 0, 22, 'Unter den Wolken über der Regenbogenbrücke'], [180, -10, 50, 'Hoch über den Glasturm'], [135, 30, 34, 'Über den Neonplatz']] },
  { id: 'inseln', name: 'Inselhüpfer', who: 'Reisegruppe „Queer Seniors on Tour“', pay: 260, rep: 3, time: 230,
    text: 'Alle Inseln der Kette von oben: Glitzeria, Playa Arcoíris, der Rummel, Lindenhof, Rostwerk und Kap Zuflucht.',
    pts: () => [isleAt('einhorn', 26, 'Über Glitzeria'), isleAt('canaria', 22, 'Über Playa Arcoíris'), isleAt('rummel', 30, 'Über das Riesenrad vom Rummel'), isleAt('lindenhof', 22, 'Über Lindenhof'), isleAt('rostwerk', 26, 'Über Rostwerk'), isleAt('zuflucht', 22, 'Über den Leuchtturm von Kap Zuflucht')],
    adultExtra: isleAt('cruising', 20, 'Über das Lustwäldchen (diskret!)') },
  { id: 'abendrot', name: 'Abendrot zu zweit', who: 'Emre und Jonas', pay: 200, rep: 3, time: 170, from: 17, to: 21,
    text: 'Ein frisch verlobtes Paar will den Sonnenuntergang von oben sehen. Langsam, tief und romantisch.',
    pts: () => [isleAt('canaria', 16, 'Tief über den Strand von Playa'), isleAt('zuflucht', 18, 'Zum Kap Zuflucht'), [-120, 60, 14, 'Tief übers Wasser'], [-15, 15, 26, 'Über die Plaza, wo der Antrag war']] },
];
export const tourOpen = (s: SaveData, t: Tour) => t.from === undefined || (hour(s) >= t.from && hour(s) < (t.to ?? 24));

export function tourGig(s: SaveData, t: Tour): Gig {
  const pts = t.pts(); if (t.adultExtra && s.settings.adult) pts.splice(4, 0, t.adultExtra);
  return { id: 'flug_' + t.id, who: t.who, color: '#ffb347', title: `🛩️ Rundflug: ${t.name}`, call: t.text, time: t.time, pay: t.pay, rep: t.rep,
    steps: [...pts.map(([x, z, y, l]) => R(x, z, y, l)), home()], done: `${t.who}: „Das vergessen wir nie! Hier ist noch Trinkgeld.“`,
    after: () => { s.flags.luftTours = (Number(s.flags.luftTours) || 0) + 1; s.money += 25; } };
}

/** Schnupperflug mit Sunny: fünf Ringe um den Hafen, dann landen. Danach gibt es den Flugschein */
export function schnupperGig(s: SaveData): Gig {
  const p: Pt[] = [[-100, -20, 10, 'Ring 1: tief über dem Wasser'], [-118, 10, 16, 'Ring 2: etwas höher'], [-100, 40, 22, 'Ring 3: steigen'], [-78, 60, 14, 'Ring 4: sinken'], [-60, 0, 26, 'Ring 5: über die Stadt']];
  return { id: 'flugschein', who: 'Captain Sunny Okafor', color: '#ffb347', title: '🛩️ Schnupperflug', call: '', time: 200, pay: 50, rep: 2,
    steps: [...p.map(([x, z, y, l]) => R(x, z, y, l)), home()], done: 'Sunny: „Butterweich gelandet. Willkommen im Club der Wolkenkratzer!“',
    after: () => { s.flags.luftSchein = s.day; } };
}

const DROPS: Array<[string, string]> = [['einhorn', 'Stella Sternenstaub auf Glitzeria'], ['canaria', 'Lola an der Playa'], ['lindenhof', 'Frau Ahmadi in Lindenhof'], ['rummel', 'Mika am Rummel'], ['rostwerk', 'Toms Werkstatt auf Rostwerk'], ['zuflucht', 'Ayla auf Kap Zuflucht']];
const FREIGHT = ['Eine Kiste Einhorn-Glitzer', 'Ersatzteile fürs Riesenrad', 'Medikamente für die Zuflucht', 'Zwanzig Kilo Konfetti', 'Frische Ananas', 'Ein neues Mischpult', 'Bücher für die Leseecke', 'Regenbogenfahnen, Größe XXL'];
/** Lieferflug von der Flugschule zu einer Insel (über dem Platz unter 6 m sinken, dann zurück) */
export function cargoGig(s: SaveData, r: number): Gig {
  const list = DROPS.filter(([id]) => ISLES[id]), [id, who] = list[Math.floor(r * list.length) % list.length];
  const host = WORLDS.find((w) => w.id === id)?.host, [x, z] = isleXZ(id, host?.x ?? 0, (host?.z ?? 9) + 4);
  const what = FREIGHT[Math.floor(r * 731) % FREIGHT.length], dist = Math.hypot(x - BASE.x, z - BASE.z);
  return { id: 'luftfracht', who: 'Flugschule Möwenflug', color: '#ffb347', title: '📦 Lieferflug', call: `${what} für ${who}.`, time: Math.round(60 + dist * .5), pay: Math.round(50 + dist * .4), rep: 1,
    steps: [{ x, z, r: 10, low: true, air: true, label: `Abliefern: ${who} (unter 6 m sinken)`, icon: '📦' }, home()], done: `${who}: „Luftpost! Danke dir!“`,
    after: () => { s.flags.luftCargo = (Number(s.flags.luftCargo) || 0) + 1; } };
}

/** Gespräch mit Sunny (true = übernommen) */
export function luftTalk(c: StoryCtx, id: string): boolean {
  if (id !== 'sunny') return false;
  const s = c.s, tours = Number(s.flags.luftTours) || 0;
  if (!s.flags.luftSchein) {
    c.say([
      SUN(`Hey, ${s.name}! Sunny Okafor, Captain der Flugschule Möwenflug. Dreißig Jahre Linienflug, jetzt fliege ich nur noch, was mir Spaß macht.`),
      SUN('Die „Möwe“ ist mein Wasserflugzeug, die „Libelle“ mein Helikopter. Beide fliegen sich wie ein Auto: Gas, lenken, ▲ steigen, ▼ sinken, A landet.'),
      SUN('Bevor du Gäste fliegst: ein Schnupperflug durch fünf Ringe über dem Hafen und eine saubere Landung. Bereit?', [
        { label: '🛩️ Schnupperflug starten', fn: () => { c.toast('🛩️ Steig in die Möwe oder die Libelle neben dem Landeplatz.'); c.mission(schnupperGig(s)); } },
        { label: 'Später', fn: () => {} }]),
    ]);
    return true;
  }
  const choices: Line['choices'] = [
    ...TOURS.map((t) => ({ label: `${t.id === 'abendrot' ? '🌅' : '🛩️'} ${t.name} (${t.pay} €${tourOpen(s, t) ? '' : `, ab ${t.from} Uhr`})`, fn: () => {
      if (!tourOpen(s, t)) { c.say([SUN(`${t.who} wollen erst ab ${t.from} Uhr los, wegen des Lichts.`, [{ label: `Bis ${t.from} Uhr warten`, fn: () => c.skipToHour(t.from!) }, { label: 'Okay', fn: () => {} }])]); return; }
      c.toast(`🛩️ ${t.who} steigen ein. Ab in die Möwe oder die Libelle!`); c.mission(tourGig(s, t));
    } })),
    { label: '📦 Lieferflug zu einer Insel', fn: () => { const g = cargoGig(s, Math.random()); c.toast(`📦 ${g.call}`); c.mission(g); } },
    { label: 'Tschüss, Sunny', fn: () => {} },
  ];
  c.say([SUN(tours ? `Schon ${tours} Rundflüge! Die Gäste schreiben mir Postkarten über dich. Wohin heute?` : 'Flugschein in der Tasche! Rundflüge zahlen gut, Lieferflüge gehen immer. Was darf es sein?', choices)]);
  return true;
}
