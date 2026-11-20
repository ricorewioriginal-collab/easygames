/* Stadtleben: kleine Zufallsereignisse am Straßenrand (Straßenmusik, Flashmob, Fundsache, Heiratsantrag …) und
   jeden Samstag von 12 bis 18 Uhr die CSD-Parade auf der Hauptstraße mit Festwagen, Tanzgruppen und Konfetti.
   Sparsam: Ereignisse leihen sich Passant*innen, die gerade weit weg sind. Die Parade entsteht erst, wenn sie beginnt. */
import { Vector3, Mesh, VertexData, Node3, type Scene } from '../engine/bjs';
import { box, cyl, sphere, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast, type Line } from '../ui/ui';
import { Actor, WALK_MPS, type Anim, type Look } from './Actor';
import { walkable } from './World';
import { change, hour } from './life';
import type { SaveData } from '../engine/Save';
import type { Game } from './Game';
import type { CityScene } from './CityScene';
import type { StreetNpc } from './Street';

/* ---------- Zufallsereignisse ---------- */
interface Out { text: string; money?: number; rep?: number; need?: Parameters<typeof change>[1]; min?: number }
export interface LifeEvent {
  id: string; icon: string; title: string; prompt: string; who: string; color: string;
  /** Haltung der geliehenen Passant*innen */ cast: Anim[]; when?: 'day' | 'night'; /** nicht bei Regen */ dry?: boolean; /** Gegenstand statt Person */ prop?: boolean;
  hello: string; choices: Array<{ label: string; out: Out }>;
}
export const LIFE_EVENTS: LifeEvent[] = [
  { id: 'musik', icon: '🎸', title: 'Straßenmusik', prompt: '🎸 Der Straßenmusikerin zuhören', who: 'Straßenmusikerin Lou', color: '#ffb347', cast: ['pose'], when: 'day', dry: true,
    hello: 'Dieses Lied ist für alle, die heute zum ersten Mal Hand in Hand durch die Stadt gehen.',
    choices: [{ label: '2 € in den Gitarrenkoffer', out: { text: 'Danke dir! Der nächste Song ist dein Wunschlied.', money: -2, need: { fun: 12, social: 4 } } },
      { label: 'Laut mitsingen', out: { text: 'Zweite Stimme, sauber! Du solltest öfter vorbeikommen.', need: { fun: 8, social: 10 }, min: 10 } },
      { label: 'Weitergehen', out: { text: 'Schönen Tag dir!' } }] },
  { id: 'flashmob', icon: '💃', title: 'Flashmob', prompt: '💃 Beim Flashmob mitmachen', who: 'Tanzgruppe Glitzersturm', color: '#ff6ad5', cast: ['dance1', 'dance2', 'dance3'], dry: true,
    hello: 'Fünf, sechs, sieben, acht! Komm rein, die Schritte lernst du in zehn Sekunden!',
    choices: [{ label: 'Mittanzen', out: { text: 'Die halbe Straße filmt. Du bist jetzt offiziell Teil vom Glitzersturm.', rep: 1, need: { fun: 16, social: 8, energy: -5 }, min: 10 } },
      { label: 'Anfeuern', out: { text: 'Applaus ist auch eine Kunstform. Danke!', need: { fun: 8, social: 5 } } }] },
  { id: 'fund', icon: '👛', title: 'Fundsache', prompt: '👛 Geldbeutel aufheben', who: 'Du', color: '#9ad8ff', cast: [], prop: true,
    hello: 'Ein Geldbeutel auf dem Gehweg. Drin sind 40 €, ein Büchereiausweis und ein Foto von zwei Frauen mit Hund.',
    choices: [{ label: 'Bei der Polizeiwache abgeben', out: { text: 'Am Abend ruft die Besitzerin an: „Sie haben meinen Tag gerettet!“ Sie überweist dir Finderlohn.', money: 15, rep: 2 } },
      { label: 'Geld nehmen, Rest liegen lassen', out: { text: 'Das Foto guckt dich noch lange an. Schön fühlt sich das nicht an.', money: 40, rep: -2, need: { fun: -6 } } }] },
  { id: 'tourist', icon: '🗺️', title: 'Verlaufen', prompt: '🗺️ Dem Touristen helfen', who: 'Tourist Mats', color: '#5ce1ff', cast: ['phone'], when: 'day',
    hello: 'Entschuldigung! Ich suche das Regenbogenhaus. Mein Handy sagt, ich stehe im Hafenbecken.',
    choices: [{ label: 'An der Hauptstraße, gleich neben der Feuerwache', out: { text: 'Feuerwache, merke ich mir. Tausend Dank, hier, ein Kaffee geht auf mich!', money: 5, rep: 1, need: { social: 8 } } },
      { label: 'Am Hafen beim Leuchtturm', out: { text: 'Zwanzig Minuten später schreibt er: „Das war der Club. War aber auch schön.“ 😄', need: { fun: 4 } } },
      { label: 'Ich bringe dich ein Stück hin', out: { text: 'Unterwegs erzählt Mats von seinem ersten CSD in Malmö. Ihr tauscht Nummern.', rep: 1, need: { social: 16, fun: 6 }, min: 15 } }] },
  { id: 'antrag', icon: '💍', title: 'Heiratsantrag', prompt: '💍 Zusehen', who: 'Emre', color: '#ff9ad5', cast: ['pose', 'laugh'], dry: true,
    hello: 'Jonas … seit fünf Jahren machst du jede Stadt zu meinem Zuhause. Willst du mich heiraten?',
    choices: [{ label: 'Jubeln und klatschen', out: { text: '„JA!“ Die beiden fallen sich in die Arme, und irgendwer hat schon Sekt in der Hand.', need: { fun: 14, social: 12 } } },
      { label: 'Ein Foto für die beiden machen', out: { text: 'Das Bild wird ihr Hochzeitsfoto, sagen sie. Du bist eingeladen.', rep: 1, need: { fun: 10, social: 14 } } }] },
  { id: 'flyer', icon: '📣', title: 'Infostand', prompt: '📣 Am Infostand stehen bleiben', who: 'Aktivistin Noor', color: '#3ee69a', cast: ['talk', 'idle'], when: 'day', dry: true,
    hello: 'Wir sammeln für die Jugendgruppe im Regenbogenhaus. Hast du fünf Minuten oder fünf Euro?',
    choices: [{ label: 'Eine halbe Stunde Flyer verteilen', out: { text: 'Sechzig Flyer, vier gute Gespräche. Genau so wächst eine Stadt zusammen.', rep: 2, need: { social: 12, energy: -4 }, min: 30 } },
      { label: '5 € spenden', out: { text: 'Davon gibt es Pizza für die ganze Gruppe am Freitag. Danke!', money: -5, rep: 1, need: { fun: 4 } } },
      { label: 'Heute nicht', out: { text: 'Kein Problem. Nimm wenigstens einen Sticker mit!' } }] },
  { id: 'foto', icon: '📸', title: 'Streetstyle', prompt: '📸 Mit der Fotografin reden', who: 'Fotografin Ayla', color: '#c9a2ff', cast: ['phone'], when: 'day', dry: true,
    hello: 'Stopp, bleib so! Ich mache eine Serie über die Gesichter von Rainbow City. Darf ich?',
    choices: [{ label: 'Posieren', out: { text: 'Klick, klick, klick. „Das wird das Titelbild.“ Du bekommst ein Honorar und einen Abzug.', money: 15, rep: 1, need: { fun: 10 } } },
      { label: 'Lieber nicht', out: { text: 'Absolut okay. Dein Gesicht, deine Regeln.' } }] },
  { id: 'schluessel', icon: '🔑', title: 'Ausgesperrt', prompt: '🔑 Fragen, ob alles okay ist', who: 'Nachbar Herbert', color: '#ffd23b', cast: ['idle'], when: 'night',
    hello: 'Ach du liebe Zeit. Schlüssel drinnen, ich draußen, und mein Mann hat Nachtschicht.',
    choices: [{ label: 'Zusammen warten und quatschen', out: { text: 'Herbert erzählt von der ersten Demo 1979. Um zwei kommt sein Mann und bringt euch beiden Tee.', rep: 1, need: { social: 18, energy: -6 }, min: 45 } },
      { label: 'Schlüsseldienst rufen (20 €)', out: { text: 'Zehn Minuten später ist die Tür auf. Herbert steckt dir trotzdem Kekse zu.', money: -20, rep: 2, need: { hunger: 8 } } }] },
];
/** Passt das Ereignis zu Tageszeit und Wetter? */
export const eventFits = (e: LifeEvent, night: boolean, rain: boolean) => !(e.dry && rain) && !(e.when === 'day' && night) && !(e.when === 'night' && !night);
/** Stelle auf dem Gehweg: Gehwege laufen 5,4 m neben jeder Straßenmitte (Straßen alle 30 m) */
export function kerbSpot(x: number, z: number): { x: number; z: number } | null {
  const rx = Math.round(x / 30) * 30, sx = rx + (x >= rx ? 5.4 : -5.4);
  let rz = Math.round(z / 30) * 30; if (Math.abs(z - rz) < 7) z = rz + (z >= rz ? 9 : -9); rz = Math.round(z / 30) * 30;
  return walkable(sx, z) && Math.abs(z - rz) >= 7 ? { x: sx, z } : null;
}
export function applyOut(s: SaveData, o: Out) {
  if (o.money) s.money = Math.max(0, s.money + o.money);
  if (o.rep) s.rep = Math.max(0, s.rep + o.rep);
  if (o.need) change(s, o.need);
}

export class CityLife {
  ev: { def: LifeEvent; x: number; z: number; cast: StreetNpc[]; t: number } | null = null;
  private wait = 40;
  private prop: Mesh | null = null;
  private last = '';
  readonly parade: Parade;
  constructor(private g: Game, private city: CityScene, scene: Scene) { this.parade = new Parade(g, city, scene); }

  update(dt: number, t: number, ref: Vector3, o: { busy: boolean; night: boolean; rain: boolean; onFoot: boolean }) {
    this.parade.update(dt, t, ref, o.onFoot && !o.busy);
    const e = this.ev;
    if (e) {
      e.t -= dt;
      if (e.t <= 0 || Math.hypot(e.x - ref.x, e.z - ref.z) > 75) this.clear();
      return;
    }
    if (o.busy) return;
    if ((this.wait -= dt) > 0) return;
    this.wait = 20;   // kein Platz gefunden: bald wieder versuchen
    const list = LIFE_EVENTS.filter((x) => x.id !== this.last && eventFits(x, o.night, o.rain));
    const def = list[Math.floor(Math.random() * list.length)]; if (!def) return;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, d = 15 + Math.random() * 11, q = kerbSpot(ref.x + Math.cos(a) * d, ref.z + Math.sin(a) * d);
      if (!q || Math.abs(q.x) < 7 && this.parade.on) continue;
      if (this.city.world.colliders.some((c) => Math.abs(q.x - c.x) < c.hx + 1 && Math.abs(q.z - c.z) < c.hz + 1)) continue;
      if (this.city.world.props.some((c) => Math.hypot(q.x - c.x, q.z - c.z) < c.r + 2.2)) continue;   // nicht in Bäumen, Bänken, Laternen
      const free = this.city.street.people.filter((n) => n.kind === 'walker' && !n.talking && !n.away && !n.down && Math.hypot(n.a.root.position.x - ref.x, n.a.root.position.z - ref.z) > 40);
      if (free.length < def.cast.length) return;
      const cast = free.slice(0, def.cast.length), rx = Math.round(q.x / 30) * 30, face = Math.atan2(rx - q.x, 0);
      cast.forEach((n, k) => { n.talking = true; n.a.root.position.set(q.x, .1, q.z + (k - (cast.length - 1) / 2) * 1.1); n.a.root.rotation.y = def.id === 'antrag' ? (k ? Math.PI : 0) : face; n.a.play(def.cast[k], 0); });
      if (def.prop) {
        if (!this.prop) { this.prop = box(this.city.scene, .24, .06, .16); this.prop.material = pbr(this.city.scene, 0x7a3a22, .6); this.prop.isPickable = false; }
        this.prop.setEnabled(true); this.prop.position.set(q.x, .16, q.z); this.prop.rotation.y = a;
      }
      this.ev = { def, x: q.x, z: q.z, cast, t: 80 }; this.last = def.id; this.wait = 70 + Math.random() * 60;
      return;
    }
  }
  private clear() {
    const e = this.ev; if (!e) return;
    for (const n of e.cast) { n.talking = false; const [x, z] = n.path[n.wp]; n.a.root.position.set(x, .1, z); n.a.play(n.anim || 'idle', 0); }
    this.prop?.setEnabled(false); this.ev = null;
  }
  /** Beschriftung, wenn der Spieler danebensteht */
  near(p: Vector3) {
    const f = this.parade.near(p); if (f) return f;
    const e = this.ev; return e && e.t > 6 && Math.hypot(e.x - p.x, e.z - p.z) < 2.8 ? e.def.prompt : null;
  }
  marker() { const e = this.ev; return e && e.t > 6 ? { id: 'life', icon: e.def.icon, label: e.def.title, pos: new Vector3(e.x, 2.7, e.z) } : null; }
  interact(p: Vector3) {
    if (this.parade.near(p)) { this.parade.join(); return; }
    const e = this.ev; if (!e) return;
    const s = this.g.save.data, d = e.def; let out: Out | null = null;
    e.t = 600;
    const L = (text: Line['text'], choices?: Line['choices']): Line => ({ who: d.who, color: d.color, text, choices });
    this.g.dialog.say([L(d.hello, d.choices.map((c) => ({ label: c.label, fn: () => { out = c.out; } }))), L(() => out?.text || '')], () => {
      const o = out; e.t = 5;
      if (!o) return;
      if (o.money && o.money < 0 && s.money < -o.money) { toast('Dafür reicht dein Geld gerade nicht.'); sfx('miss'); return; }
      applyOut(s, o);
      if (o.min) this.g.pass(o.min);
      const bits = [o.money ? `${o.money > 0 ? '+' : ''}${o.money} €` : '', o.rep ? `${o.rep > 0 ? '+' : ''}${o.rep} Ruf` : ''].filter(Boolean);
      if (bits.length) toast(`${d.icon} ${d.title}: ${bits.join(' · ')}`);
      sfx(o.rep && o.rep < 0 ? 'miss' : 'win');
      for (const n of e.cast) n.a.play(d.id === 'flashmob' ? 'cheer' : 'wave');
      s.flags.lifeEvents = (Number(s.flags.lifeEvents) || 0) + 1;
      this.g.save.write(); this.city.refreshHud();
    });
  }
}

/* ---------- CSD-Parade ---------- */
/** Samstag, 12 bis 18 Uhr */
export const paradeOn = (s: SaveData) => (s.day - 1) % 7 === 5 && hour(s) >= 12 && hour(s) < 18;
const Z0 = 58, LEN = 116, SPEED = 1.25;
const RAINBOW = [0xe40303, 0xff8c00, 0xffed00, 0x008026, 0x24408e, 0x732982];
interface Unit { node: Node3; off: number; float: boolean; z: number; riders: Array<{ a: Actor; dx: number; dz: number; y: number; walk: boolean }> }

export class Parade {
  on = false;
  private units: Unit[] = [];
  private built = false;
  private building = false;
  private u = 0;
  private confetti: Mesh[] = [];
  private fall = 0;
  private joinT = 0;
  private cheerT = 0;
  private parked: Array<{ off?: boolean }> = [];
  constructor(private g: Game, private city: CityScene, private scene: Scene) {}

  private async build() {
    this.building = true;
    const sc = this.scene, w = this.city.world, low = w.low, adult = this.g.save.data.settings.adult;
    const L = (rb: string, hot = false): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0, ...(hot && adult ? { outfit: 'shirtless' as const, hot: true } : {}) });
    const stripe = canvasTex(sc, 256, 64, (c) => { RAINBOW.forEach((k, i) => { c.fillStyle = '#' + k.toString(16).padStart(6, '0'); c.fillRect(0, i * 64 / 6, 256, 64 / 6 + 1); }); });
    const stripeM = pbr(sc, 0xffffff, .6); stripeM.albedoTexture = stripe;
    const sign = (text: string, bg: string, fg: string) => glow(sc, 0xffffff, 1, { double: true, tex: canvasTex(sc, 512, 128, (c) => {
      const gr = c.createLinearGradient(0, 0, 512, 0); RAINBOW.forEach((k, i) => gr.addColorStop(i / 5, '#' + k.toString(16).padStart(6, '0'))); c.fillStyle = bg || gr; c.fillRect(0, 0, 512, 128);
      c.fillStyle = fg; c.font = '900 58px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 68, 490);
    }) });
    const unit = (off: number, float: boolean): Unit => { const node = new Node3('parade', sc); node.parent = w.root; node.rotation.y = Math.PI; node.visible = false; const u = { node, off, float, z: 0, riders: [] }; this.units.push(u); return u; };
    const add = (u: Unit, m: Mesh, x: number, y: number, z: number) => { m.parent = u.node; m.position.set(x, y, z); m.isPickable = false; return m; };
    const float = (off: number, body: number, text: string) => {
      const u = unit(off, true), bm = pbr(sc, body, .5, .1), dark = pbr(sc, 0x1a1a22, .8);
      add(u, box(sc, 2.7, .7, 6.2), 0, .75, 0).material = stripeM;
      add(u, box(sc, 2.8, .12, 6.3), 0, 1.16, 0).material = bm;
      add(u, box(sc, 2.5, 1.7, 1.7), 0, 1.25, 3.9).material = bm;
      add(u, box(sc, 2.3, .7, .1), 0, 1.6, 4.76).material = pbr(sc, 0x9ad8ff, .15, .6);
      for (const [x, z] of [[-1.3, 2.2], [1.3, 2.2], [-1.3, -2.2], [1.3, -2.2], [-1.3, 3.9], [1.3, 3.9]]) { const c = add(u, cyl(sc, .42, .42, .3, 14), x, .42, z); c.rotation.z = Math.PI / 2; c.material = dark; }
      for (const s of [-1, 1]) { add(u, box(sc, .7, 1.3, .7), s * .85, 1.87, -2.5).material = dark; const cone = add(u, cyl(sc, .22, .22, .05, 14), s * .85, 2, -2.13); cone.rotation.x = Math.PI / 2; cone.material = glow(sc, 0xff6ad5, 1.2); }
      RAINBOW.forEach((k, i) => { const x = (i % 2 ? 1 : -1) * 1.25, z = -2.6 + Math.floor(i / 2) * 2.3; add(u, box(sc, .03, 1.3, .03), x, 1.85, z).material = dark; add(u, sphere(sc, .3, 10), x, 2.75, z).material = pbr(sc, k, .25, 0, { emissive: k, ei: .25 }); });
      const sm = sign(text, '#16101f', '#ffd23b');
      for (const s of [-1, 1]) { const p = add(u, planeZ(sc, 5, 1.25, true), s * 1.37, .78, -.2); p.rotation.y = s * Math.PI / 2; p.material = sm; }
      return u;
    };
    const walkers = (off: number) => unit(off, false);
    // Spitze: Banner, dann Festwagen, Tanzgruppe, Festwagen
    const lead = walkers(0);
    add(lead, planeZ(sc, 5.2, 1.1, true), 0, 1.55, .6).material = sign('CSD RAINBOW CITY', '', '#ffffff');
    for (const s of [-1, 1]) add(lead, box(sc, .05, 2.1, .05), s * 2.6, 1.05, .6).material = pbr(sc, 0xdddddd, .4, .6);
    const f1 = float(9, 0xff3fb0, 'LIEBE IST LAUT'), grp = walkers(18), f2 = float(26, 0x3bd1ff, 'HAUS VEGA TANZT');
    const plan: Array<[Unit, string, number, number, number, boolean, boolean?]> = [
      [lead, 'Female_Adult_04', -2.6, .6, .1, true], [lead, 'Male_Adult_10', 2.6, .6, .1, true],
      [f1, 'Female_Party_01', -.5, 0, 1.22, false], [f1, 'Male_Adult_07', .6, -1.4, 1.22, false, true],
      [grp, 'Female_Party_02', -1.6, 1, .1, true], [grp, 'Male_Adult_05', 1.6, 1, .1, true, true], [grp, 'Sports_Female_01', -1.6, -1.4, .1, true], [grp, 'Male_Adult_02', 1.6, -1.4, .1, true, true],
      [f2, 'Female_Adult_09', .5, .2, 1.22, false], [f2, 'Male_Adult_04', -.6, -1.5, 1.22, false, true],
    ];
    const use = low ? plan.filter((_, i) => [0, 1, 2, 4, 5, 8].includes(i)) : plan;
    const actors = await Promise.all(use.map((q) => Actor.create(sc, L(q[1], !!q[6]))));
    use.forEach(([u, , dx, dz, y, walk], i) => { const a = actors[i]; a.root.visible = false; u.riders.push({ a, dx, dz, y, walk }); a.play(walk ? (u === lead ? 'walk' : (['dance1', 'cheer', 'dance2', 'wave'] as const)[i % 4]) : (['dance1', 'dance2', 'dance3'] as const)[i % 3], 0, walk && u === lead ? SPEED / WALK_MPS : 1); });
    // Konfetti: drei Farben, je zwei Kopien übereinander, die langsam fallen
    [0xff3fb0, 0xffd23b, 0x3bd1ff].forEach((c, k) => {
      const pos: number[] = [], idx: number[] = []; let seed = 5 + k * 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < (low ? 40 : 90); i++) { const x = (rnd() * 2 - 1) * 7, z = (rnd() * 2 - 1) * 16, y = rnd() * 9, a = rnd() * 6, b = pos.length / 3, d = .07; pos.push(x - d, y, z, x + d, y + Math.sin(a) * d, z + Math.cos(a) * d, x + d, y + d, z, x - d, y + d - Math.sin(a) * d, z - Math.cos(a) * d); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
      const vd = new VertexData(); vd.positions = pos; vd.indices = idx; const m = new Mesh('konfetti', sc); vd.applyToMesh(m);
      m.material = glow(sc, c, 1.3, { double: true }); m.isPickable = false; m.alwaysSelectAsActiveMesh = true; m.setEnabled(false);
      const m2 = m.clone('konfetti2'); m2.setEnabled(false); this.confetti.push(m, m2);
    });
    this.built = true; this.building = false;
  }

  private show(on: boolean) {
    for (const u of this.units) { u.node.visible = on; if (!on) for (const r of u.riders) r.a.root.visible = false; }
    if (!on) this.confetti.forEach((m) => m.setEnabled(false));
    // Autos von der Hauptstraße nehmen, solange die Parade läuft
    const cars = this.city.world.cars as Array<{ off?: boolean; path: Vector3[] }>;
    if (on) { this.parked = cars.filter((c) => c.path.every((p) => Math.abs(p.x) < 6)); this.parked.forEach((c) => (c.off = true)); }
    else { this.parked.forEach((c) => (c.off = false)); this.parked = []; }
  }

  update(dt: number, t: number, ref: Vector3, canJoin: boolean) {
    const s = this.g.save.data, want = paradeOn(s);
    if (want && !this.built) { if (!this.building) void this.build(); return; }
    if (want !== this.on) {
      this.on = want; this.show(want);
      if (want && s.flags.paradeSeen !== s.day) { s.flags.paradeSeen = s.day; sfx('cheer'); this.g.hud.banner('🏳️‍🌈 Die CSD-Parade läuft!', 'Bis 18 Uhr auf der Hauptstraße. Lauf mit oder spring auf einen Wagen.', 'good', 5200); }
    }
    if (!want) return;
    this.u = (this.u + SPEED * dt) % LEN;
    const far = this.city.world.low ? 60 : 85;
    for (const u of this.units) {
      u.z = Z0 - ((this.u - u.off + LEN * 4) % LEN);
      u.node.position.set(0, 0, u.z);
      const vis = Math.abs(u.z - ref.z) < far && Math.abs(ref.x) < far;
      u.node.visible = vis;
      for (const r of u.riders) {
        r.a.root.visible = vis; if (!vis) continue;
        r.a.root.position.set(-r.dx, r.y + (u.float ? Math.abs(Math.sin(t * 6 + r.dx)) * .02 : 0), u.z - r.dz); r.a.root.rotation.y = Math.PI;
        r.a.update(dt);
      }
    }
    const close = Math.abs(ref.x) < 45 && Math.abs(ref.z) < 75;
    this.fall = (this.fall + dt * 1.6) % 9;
    this.confetti.forEach((m, i) => { m.setEnabled(close); if (close) m.position.set(0, (i % 2 ? 9 : 0) - this.fall + .2, Math.max(-44, Math.min(44, ref.z))); });
    // Mitlaufen: Spaß und Kontakte, einmal am Tag Ruf
    const near = canJoin && Math.abs(ref.x) < 9 && this.units.some((u) => Math.abs(u.z - ref.z) < 12);
    if (near && (this.joinT += dt) > 8) {
      this.joinT = 0; change(s, { fun: 3, social: 3 });
      if (s.flags.paradeDay !== s.day) { s.flags.paradeDay = s.day; s.rep += 2; s.flags.parades = (Number(s.flags.parades) || 0) + 1; sfx('win'); this.g.hud.banner('🏳️‍🌈 Du läufst bei der Parade mit!', '+2 Ruf · Spaß und Kontakte steigen, solange du dabei bist', 'good', 4200); this.g.save.write(); }
      this.city.refreshHud();
    }
    if (close && (this.cheerT -= dt) <= 0) { this.cheerT = 9 + Math.random() * 8; if (Math.abs(ref.x) < 20) sfx('cheer'); }
  }
  /** Festwagen in Reichweite? */
  near(p: Vector3) { return this.on && this.units.some((u) => u.float && Math.abs(p.x) < 3.4 && Math.abs(u.z - p.z) < 4.6) ? '🪩 Auf den Festwagen: mittanzen' : null; }
  join() { this.g.goDance(false); }
  /** Spitze der Parade (für Radar und Wegweiser) */
  head() { return this.on && this.units[0] ? new Vector3(0, 3, this.units[0].z) : null; }
}
