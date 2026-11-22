/* Ärger auf der Straße: spontane Open-World-Ereignisse mit Action, die einfach passieren, während du unterwegs bist.
   Taschendiebe, geklaute Autos, Fluchtwagen nach einem Einbruch, Kneipenschlägereien, eine Rocker-Bande, die ein Viertel
   „übernehmen“ will, und Straßenrennen-Herausforderungen. Gebaut auf dem Auftragssystem (gigs.ts) mit Verfolgung und
   Schlägerei aus Brawl.ts: kein Blut, niemand stirbt, wer am Boden war, rappelt sich auf und haut ab.
   Ein roter 🚨-Punkt erscheint auf Radar und Straße; wer hinläuft oder hinfährt, steigt ein. Wer es ignoriert, verpasst es.
   Sparsam: höchstens ein Ereignis zur Zeit, Opfer sind geliehene Passant*innen, Gegner entstehen erst beim Start. */
import { Vector3, type Node3 } from '../engine/bjs';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { kerbSpot } from './citylife';
import type { Anim } from './Actor';
import type { Game } from './Game';
import type { CityScene } from './CityScene';
import type { StreetNpc } from './Street';
import type { Gig, GigStep } from './gigs';

type Mode = 'foot' | 'car';
export interface TroubleDef {
  id: string; icon: string; title: string; /** Ruf, wenn es losgeht */ shout: string; who: string; color: string;
  mode: Mode; when?: 'day' | 'night'; cast: Anim[];
  pay: number; rep: number; time: number; done: string;
  /** Auftrag bauen: Spot (x, z) und die Route ab dort */
  steps: (x: number, z: number, route: Array<[number, number]>) => GigStep[];
}
const S = (x: number, z: number, label: string, icon: string): GigStep => ({ x, z, label, icon });
/** eigene Gegner-Gruppen (statt Ordnungsbund) */
const GANG = {
  dieb: { who: 'Taschendieb', taunt: ['Lass mich los, Mann!', 'Ist doch nur ein Rucksack!', 'Ich hab nix gemacht!'] },
  klau: { who: 'Autodiebe', taunt: ['Das war schon so, als ich ihn gefunden hab!', 'Hau ab, Held!', 'Ey, der Wagen gehört mir jetzt!'] },
  bruch: { who: 'aus dem Fluchtwagen', taunt: ['Keinen Schritt näher!', 'Wir teilen, okay? Halbe-halbe!', 'Die Bullen kriegen uns nie!'] },
  kneipe: { who: 'Betrunkene aus der Kneipe', taunt: ['Was guckst du so?!', 'Noch ’ne Runde? Ich hau dir eine!', 'Hicks … ich mach dich fertig!', 'Der hat mein Bier umgekippt!'] },
  bande: { who: 'von der Betonbande', taunt: ['Das ist jetzt unser Viertel!', 'Zahl oder verschwinde!', 'Hier gibt’s keinen Regenbogen mehr!', 'Die Betonbande regelt das hier!'] },
};
export const TROUBLE: TroubleDef[] = [
  { id: 'dieb', icon: '👜', title: 'Taschendieb!', shout: '„Haltet ihn! Er hat meine Tasche!“', who: 'Frau Aydın', color: '#ff7a3d', mode: 'foot', cast: ['talk'],
    pay: 30, rep: 2, time: 110, done: 'Frau Aydın drückt ihre Tasche an sich: „Da ist das Foto von meiner Frau drin. Danke!“',
    steps: (x, z, r) => [{ ...S(x, z, 'Den Taschendieb einholen', '🏃'), chase: { path: [[x, z], ...r.slice(0, 6)] } },
      { ...S(0, 0, 'Dem Dieb die Tasche abnehmen', '👊'), fight: ['Dieb Kalle'], gang: GANG.dieb }, S(x, z, 'Frau Aydın die Tasche zurückbringen', '👜')] },
  { id: 'ladendieb', icon: '🚓', title: 'Polizei braucht Hilfe', shout: 'Kommissarin Yıldız: „Der Typ in der grauen Jacke! Stopp ihn!“', who: 'Kommissarin Yıldız', color: '#5c8dff', mode: 'foot', when: 'day', cast: ['talk'],
    pay: 40, rep: 2, time: 120, done: 'Yıldız lässt die Handschellen klicken: „Saubere Arbeit. Willst du nicht zur Polizei?“',
    steps: (x, z, r) => [{ ...S(x, z, 'Den Flüchtigen einholen', '🏃'), chase: { path: [[x, z], ...r.slice(0, 7)] } },
      { ...S(0, 0, 'Ihn festhalten', '👊'), fight: ['Ladendieb Sven'], gang: GANG.dieb }, S(x, z, 'Zurück zu Kommissarin Yıldız', '🚓')] },
  { id: 'kneipe', icon: '🍺', title: 'Kneipenschlägerei', shout: 'Wirtin Gabi: „Die drei hauen mir die Bude kaputt! Hilf mir!“', who: 'Wirtin Gabi', color: '#ffb347', mode: 'foot', when: 'night', cast: ['talk'],
    pay: 25, rep: 2, time: 90, done: 'Gabi stellt dir ein Wasser hin: „Hausverbot für die drei. Und für dich: Freigetränke.“',
    steps: (x, z) => [{ ...S(x, z, 'Die Schlägerei auflösen', '👊'), fight: ['Holger', 'Benno', 'Kai'], gang: GANG.kneipe }] },
  { id: 'bande', icon: '⛓️', title: 'Die Betonbande', shout: '„Ab heute zahlt jeder Laden hier an uns!“ Die Betonbande bedroht den Kiosk von Hüseyin.', who: 'Kioskbesitzer Hüseyin', color: '#ff4b3b', mode: 'foot', when: 'night', cast: ['idle'],
    pay: 45, rep: 3, time: 90, done: 'Hüseyin schließt den Kiosk wieder auf: „Ohne dich hätte ich bezahlt. Nimm, was du willst.“',
    steps: (x, z) => [{ ...S(x, z, 'Die Betonbande vertreiben', '⛓️'), fight: ['Bandenchef Dragan', 'Lutz', 'Marvin', 'Ronny'], gang: GANG.bande }] },
  { id: 'klau', icon: '🚗', title: 'Autoklau!', shout: '„Mein Auto! Die fahren mit meinem Auto weg!“', who: 'Herr Lindqvist', color: '#ffd23b', mode: 'car', cast: ['talk'],
    pay: 70, rep: 2, time: 150, done: 'Herr Lindqvist bekommt seinen Wagen zurück, ohne einen Kratzer. „Ich lade dich zum Essen ein!“',
    steps: (x, z, r) => [{ ...S(x, z, 'Den geklauten Wagen verfolgen', '🚨'), chase: { car: 'car_sedan', path: r } },
      { ...S(0, 0, 'Die Autodiebe stellen', '👊'), fight: ['Autodieb Ronny', 'Kumpel Dennis'], gang: GANG.klau }] },
  { id: 'bruch', icon: '🚨', title: 'Fluchtwagen', shout: 'Polizeifunk: „Einbruch im Juweliergeschäft, Täter flüchten im Kleinwagen!“', who: 'Kommissarin Yıldız', color: '#5c8dff', mode: 'car', cast: ['phone'],
    pay: 90, rep: 3, time: 160, done: 'Yıldız funkt: „Beute sichergestellt, Täter in Gewahrsam. Rainbow City schuldet dir was.“',
    steps: (x, z, r) => [{ ...S(x, z, 'Den Fluchtwagen jagen', '🚨'), chase: { car: 'car_hatchback', path: r } },
      { ...S(0, 0, 'Die Einbrecher festhalten', '👊'), fight: ['Einbrecher Mirko', 'Einbrecherin Jessy'], gang: GANG.bruch }] },
];
/** Straßenrennen-Herausforderung: ein Gegner wartet an der Kreuzung */
const RIVALS = [
  { name: 'Jacky „Turbo“ Vogel', car: 'k:sedan_sports', line: 'Na, schickes Teil. Bis zur Zielflagge, 80 € Einsatz? Oder hast du Angst um deinen Lack?' },
  { name: 'Mika Funkenflug', car: 'k:hatchback_sports', line: 'Ich fahr hier jede Nacht. Bisher hat mich keiner geschlagen. Probier’s doch!' },
  { name: 'Die Neon-Nora', car: 'k:race_car', line: 'Die Kurven gehören mir, Schätzchen. Rennen bis zum Ziel? Wer verliert, zahlt die Pommes.' },
];
const RACE_PAY = 80;

interface Cur { def: TroubleDef | null; x: number; z: number; t: number; cast: StreetNpc[]; gig: Gig | null; rival?: Rival }
interface Rival { o: Node3 | null; name: string; car: string; line: string; path: Array<[number, number]>; i: number; on: boolean; won: boolean }

export class Trouble {
  cur: Cur | null = null;
  private wait = 55;
  private last = '';
  constructor(private g: Game, private city: CityScene) {}

  /** dt in Sekunden; free = kein Auftrag, keine Fahndung, kein Dialog */
  update(dt: number, o: { free: boolean; night: boolean; ref: Vector3 }) {
    const c = this.cur;
    if (c) {
      if (c.gig) { if (this.city.gig?.g !== c.gig) this.end(); else if (c.rival?.on) this.rivalTick(dt, c.rival); return; }
      c.t -= dt;
      const d = Math.hypot(c.x - o.ref.x, c.z - o.ref.z), car = !!this.city.car;
      if (c.t <= 0 || d > 120) { this.end(); return; }
      if (!o.free) return;
      if (c.rival) { if (car && d < 12 && Math.abs(this.city.car!.v) < 4) this.ask(c); return; }
      if (c.def && d < (car ? 14 : 9)) this.start(c);
      return;
    }
    if (!o.free || (this.wait -= dt) > 0) return;
    this.wait = 15;
    this.spawn(o.night, o.ref);
  }

  /** force = Ereignis-ID oder 'rennen' (für Tests) */
  spawn(night: boolean, ref: Vector3, force?: string) {
    const car = this.city.car, mode: Mode = car ? 'car' : 'foot';
    if (car?.def.fly || car?.def.ride === 'boat') return;
    // im Auto: manchmal fordert dich jemand zum Rennen heraus
    const race = force ? force === 'rennen' : mode === 'car' && this.last !== 'rennen' && Math.random() < .35;
    const list = TROUBLE.filter((d) => force ? d.id === force : d.id !== this.last && (d.mode === mode || (mode === 'car' && d.mode === 'foot' && Math.random() < .3)) && !(d.when === 'day' && night) && !(d.when === 'night' && !night));
    const def = race ? null : list[Math.floor(Math.random() * list.length)];
    if (!race && !def) return;
    for (let k = 0; k < 8; k++) {
      const a = Math.random() * Math.PI * 2, dd = (mode === 'car' ? 45 : 18) + Math.random() * 14;
      const q = kerbSpot(ref.x + Math.cos(a) * dd, ref.z + Math.sin(a) * dd); if (!q) continue;
      if (this.city.world.colliders.some((c) => Math.abs(q.x - c.x) < c.hx + 1 && Math.abs(q.z - c.z) < c.hz + 1)) continue;
      if (this.city.life.parade.on && Math.abs(q.x) < 9) continue;
      if (race) { void this.spawnRival(q.x, q.z); return; }
      const cast = this.borrow(def!, q.x, q.z); if (!cast) return;
      this.cur = { def, x: q.x, z: q.z, t: 70, cast, gig: null };
      this.last = def!.id; sfx('siren'); toast(`🚨 ${def!.title} ${def!.shout}`, 4200);
      return;
    }
  }
  /** Passant*innen weit weg als Opfer an den Spot holen */
  private borrow(def: TroubleDef, x: number, z: number) {
    const ref = this.city.player.root.position;
    const free = this.city.street.people.filter((n) => n.kind === 'walker' && !n.talking && !n.away && !n.down && Math.hypot(n.a.root.position.x - ref.x, n.a.root.position.z - ref.z) > 40);
    if (free.length < def.cast.length) return null;
    const cast = free.slice(0, def.cast.length), rx = Math.round(x / 30) * 30, face = Math.atan2(rx - x, 0);
    cast.forEach((n, k) => { n.talking = true; n.a.root.position.set(x, .1, z + k * 1.1); n.a.root.rotation.y = face; n.a.play(def.cast[k], 0); });
    return cast;
  }
  private async spawnRival(x: number, z: number) {
    const r = RIVALS[Math.floor(Math.random() * RIVALS.length)];
    // Rival steht an der nächsten Kreuzung, die Rennstrecke führt von dort über das Straßennetz
    const path = this.city.brawl.route(x, z, 7);
    const o = await this.city.world.car(r.car);
    if (this.cur || this.city.gig) { o.dispose(); return; }
    const [sx, sz] = path[0], [nx, nz] = path[1] || path[0];
    o.position.set(sx + 2.2, .1, sz); o.rotation.y = Math.atan2(nx - sx, nz - sz);
    this.cur = { def: null, x: sx, z: sz, t: 70, cast: [], gig: null, rival: { o, name: r.name, car: r.car, line: r.line, path, i: 1, on: false, won: false } };
    this.last = 'rennen'; sfx('horn'); toast(`🏁 ${r.name} lässt an der Kreuzung den Motor aufheulen. Fahr hin!`, 4200);
  }
  private ask(c: Cur) {
    const r = c.rival!; c.t = 70; this.city.car!.v = 0;
    this.g.dialog.say([{ who: '🏁 ' + r.name, color: '#ff3fb0', text: r.line, choices: [
      { label: `Rennen! (+${RACE_PAY} € bei Sieg)`, fn: () => this.race(c) }, { label: 'Nein danke', fn: () => { this.end(); } }] }]);
  }
  private race(c: Cur) {
    const r = c.rival!;
    const steps = r.path.slice(1).map(([x, z], i, a) => S(x, z, i === a.length - 1 ? 'Zielflagge' : `Kontrollpunkt ${i + 1}/${a.length}`, i === a.length - 1 ? '🏁' : '🚩'));
    const gig: Gig = { id: 'rennen', who: r.name, color: '#ff3fb0', title: '🏁 Straßenrennen', call: '', steps, time: 30 + steps.length * 9, pay: 0, rep: 0, done: '', quiet: true,
      after: () => {
        r.on = false; const s = this.g.save.data; s.money += RACE_PAY; s.rep += 2; s.flags.rivalWins = (Number(s.flags.rivalWins) || 0) + 1; this.count();
        sfx('win'); this.g.hud.banner(`🏆 Du hast ${r.name} geschlagen!`, `+${RACE_PAY} € · +2 Ruf`, 'good', 4200);
        setTimeout(() => toast(`${r.name}: „Glück gehabt. Nächstes Mal krieg ich dich!“`), 1600);
      },
      failed: () => { r.on = false; sfx('miss'); this.g.hud.banner(r.won ? `${r.name} war schneller` : 'Zeit abgelaufen', r.won ? 'Gleich noch mal? Die Herausforderung kommt wieder.' : 'Das Rennen ist vorbei.', 'bad', 3600); } };
    c.gig = gig; r.on = true; r.i = 1;
    this.city.startGig(gig); sfx('horn');
  }
  /** Gegner fährt die Strecke ab; Gummiband nach Abstand, damit es spannend bleibt, aber mit Turbo zu gewinnen */
  private rivalTick(dt: number, r: Rival) {
    const o = r.o, q = this.city.gig; if (!o || !q) return;
    const t = r.path[r.i];
    if (!t) { r.on = false; r.won = true; q.t = 0; return; }
    const lead = r.i - 1 - q.i, v = Math.max(10, Math.min(17.5, 14.5 - lead * 1.6));
    const p = o.position, dx = t[0] - p.x, dz = t[1] - p.z, d = Math.hypot(dx, dz);
    if (d < .6) { r.i++; return; }
    const k = Math.min(1, v * dt / d); p.x += dx * k; p.z += dz * k;
    const yaw = Math.atan2(dx, dz); o.rotation.y += Math.atan2(Math.sin(yaw - o.rotation.y), Math.cos(yaw - o.rotation.y)) * Math.min(1, dt * 7);
  }

  private start(c: Cur) {
    const def = c.def!, route = this.city.brawl.route(c.x, c.z, 16), p = this.city.player.root.position;
    // Fluchtwagen hat einen kleinen Vorsprung: Kreuzungen direkt neben dir überspringen
    if (def.mode === 'car') while (route.length > 9 && Math.hypot(route[0][0] - p.x, route[0][1] - p.z) < 28) route.shift();
    const gig: Gig = { id: 'trouble_' + def.id, who: def.who, color: def.color, title: `${def.icon} ${def.title}`, call: '', steps: def.steps(c.x, c.z, route),
      time: def.time, pay: def.pay, rep: def.rep, done: def.done, car: def.mode === 'car', after: () => this.count() };
    c.gig = gig;
    for (const n of c.cast) n.a.play('wave');
    this.city.startGig(gig);
    this.city.shake = .2; sfx('siren');
  }
  /** Zähler fürs Imperium/Statistik */
  private count() { const s = this.g.save.data; s.flags.trouble = (Number(s.flags.trouble) || 0) + 1; }

  /** Ereignis aufräumen: Opfer gehen weiter, Rivalenwagen verschwindet, nächstes kommt später */
  end() {
    const c = this.cur; if (!c) return;
    for (const n of c.cast) { n.talking = false; const [x, z] = n.path[n.wp]; n.a.root.position.set(x, .1, z); n.a.play(n.anim || 'idle', 0); }
    c.rival?.o?.dispose();
    this.cur = null; this.wait = 60 + Math.random() * 50;
  }
  /** Marker über dem Spot (bis es losgeht) */
  marker() {
    const c = this.cur; if (!c || c.gig) return null;
    return { id: 'trouble', icon: c.rival ? '🏁' : c.def!.icon, label: c.rival ? `Rennen: ${c.rival.name}` : c.def!.title, pos: new Vector3(c.x, 3, c.z) };
  }
}
