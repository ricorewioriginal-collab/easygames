/* Laternenmeile: nachts (18+) im Auto langsam vorbeifahren und hupen. Jemand kommt ans Fenster, ihr sprecht Preis und
   Regeln ab, die Person steigt ein, ihr fahrt zu einer ruhigen Ecke – das Auto schaukelt, das Bild blendet ab.
   Angedeutet wie im Open-World-Krimi, nie gezeigt. Sieht dich dabei eine Streife, gibt es einen Stern (§ 4). */
import { Vector3 } from '../engine/bjs';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { CURB } from './social';
import { QUIET } from './uptown';
import { WALK_MPS } from './Actor';
import type { Game } from './Game';
import type { CityScene } from './CityScene';
import type { StreetNpc } from './Street';

export class Kerb {
  /** kommt gerade ans Auto */
  private walk: StreetNpc | null = null;
  /** sitzt im Auto */
  rider: StreetNpc | null = null;
  /** Ziel: ruhige Ecke */
  spot: { x: number; z: number; name: string } | null = null;
  private kind: 'room' | 'talk' = 'room';
  private paid = 0;
  private rock = 0;
  private home = new Vector3();
  constructor(private g: Game, private city: CityScene) {}

  /** jemand in Hupweite? (für den Hinweis im Auto) */
  nearCurb() {
    const car = this.city.carNode; if (!car || this.rider || this.walk || !this.g.save.data.settings.adult) return null;
    return this.city.street.people.find((n) => n.kind === 'curb' && n.a.root.visible && Vector3.Distance(n.a.root.position, car.position) < 12) || null;
  }

  /** Hupe (Angriffstaste im Auto) */
  honk() {
    sfx('horn');
    const n = this.nearCurb(); if (!n) return;
    if (this.city.carSpeed > 4) { toast('Langsamer! Bei dem Tempo steigt niemand ein.'); return; }
    this.walk = n; n.talking = true; this.home.copyFrom(n.a.root.position);
    toast(`🏮 ${n.name} kommt rüber …`);
  }

  /** Aussteigen oder Spielende: Mitfahrende steigen aus, Geld zurück, wenn noch nichts passiert ist */
  cancel(why?: string) {
    const n = this.rider || this.walk; if (!n) return;
    if (this.rider && this.paid) { this.g.save.data.money += this.paid; this.g.city.refreshHud(); }
    if (why) toast(why);
    this.back(n);
  }
  private back(n: StreetNpc) {
    n.away = false; n.talking = false; n.a.root.position.copyFrom(this.home); n.a.root.rotation.y = Math.PI; n.a.play(n.anim || 'idle');
    this.rider = null; this.walk = null; this.spot = null; this.paid = 0; this.rock = 0;
  }

  update(dt: number, t: number) {
    const car = this.city.carNode;
    if ((this.rider || this.walk) && !car) { this.cancel(this.rider ? `${this.rider.name}: „Na gut, dann eben nicht. Hier, dein Geld.“` : undefined); return; }
    if (!car) return;
    // auf dem Weg ans Fahrerfenster
    if (this.walk) {
      const n = this.walk, p = n.a.root.position, sx = Math.cos(car.rotation.y), sz = -Math.sin(car.rotation.y);
      // an die Seite des Autos, die näher am Gehweg liegt
      const k = (p.x - car.position.x) * sx + (p.z - car.position.z) * sz >= 0 ? 1.7 : -1.7, side = new Vector3(car.position.x + sx * k, .1, car.position.z + sz * k);
      const dx = side.x - p.x, dz = side.z - p.z, d = Math.hypot(dx, dz);
      if (d > 26 || this.city.carSpeed > 6) { this.back(n); return; }
      if (d > .5) { const v = Math.min(d / dt, 2.2); p.x += dx / d * v * dt; p.z += dz / d * v * dt; n.a.root.rotation.y = Math.atan2(dx, dz); n.a.play('walk', .25, 2.2 / WALK_MPS); return; }
      n.a.play('talk'); n.a.root.rotation.y = Math.atan2(car.position.x - p.x, car.position.z - p.z);
      this.walk = null; this.offer(n);
      return;
    }
    if (!this.rider || !this.spot) return;
    // Schaukeln an der ruhigen Ecke, danach Abblende
    if (this.rock > 0) {
      this.rock -= dt; this.city.holdCar();
      car.rotation.z = Math.sin(t * 15) * .035; car.position.y = .1 + Math.abs(Math.sin(t * 7.5)) * .05;
      if (this.rock <= 0) { car.rotation.z = 0; car.position.y = .1; this.finish(); }
      return;
    }
    if (Math.hypot(car.position.x - this.spot.x, car.position.z - this.spot.z) < 6 && this.city.carSpeed < 1.5) {
      if (this.kind === 'talk') { this.finish(); return; }
      this.rock = 2.8; sfx('sheets'); setTimeout(() => sfx('giggle'), 900);
    }
  }

  private offer(n: StreetNpc) {
    const s = this.g.save.data, w = CURB.find((c) => c.id === n.id)!;
    const W = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: w.name, color: w.color, text, choices });
    const talk = Math.round(w.price / 3);
    const go = (kind: 'room' | 'talk', price: number) => () => setTimeout(() => {
      if (s.money < price) { this.g.dialog.say([W('Das reicht leider nicht, Schatz. Komm wieder, wenn es passt. 😘')], () => this.back(n)); return; }
      s.money -= price; this.paid = price; this.kind = kind;
      if (kind === 'room') s.inv.condom = (s.inv.condom || 0) + 1; // bringt eins mit
      const car = this.city.carNode!;
      this.spot = QUIET.map((q) => [Math.hypot(q.x - car.position.x, q.z - car.position.z), q] as const).sort((a, b) => a[0] - b[0])[0][1];
      this.rider = n; this.walk = null; n.away = true; sfx('door'); this.g.city.refreshHud();
      this.g.hud.banner(kind === 'room' ? '🌙 Ruhige Ecke suchen' : '🚗 Eine Runde drehen', `Fahr zu: ${this.spot.name}`, 'info', 3200);
    }, 50);
    this.g.dialog.say([W(['Na, Lust auf Gesellschaft? 😏', 'Hey du. Schickes Auto. Wohin soll’s gehen?', 'Hupen kann jeder. Aber du hast Stil.'][s.day % 3]), W(w.rules),
      W(`${w.offer}: ${w.price} €. Oder wir drehen nur eine Runde und reden: ${talk} €.`, [
        { label: `Steig ein (${w.price} €)`, fn: go('room', w.price) },
        { label: `Nur eine Runde reden (${talk} €)`, fn: go('talk', talk) },
        { label: 'Doch nicht, schönen Abend!', fn: () => setTimeout(() => this.g.dialog.say([W('Kein Ding. Fahr vorsichtig! 💋')], () => this.back(n)), 50) },
      ])]);
  }

  private finish() {
    const n = this.rider!, w = CURB.find((c) => c.id === n.id)!, s = this.g.save.data, car = this.city.carNode!;
    const kind = this.kind; this.paid = 0;
    if (kind === 'room' && this.city.combat.copNear(car.position, 26)) this.city.combat.crime('indecent', car.position);
    const tags = kind === 'room' ? ['Absprache ✔︎', 'Zustimmung ✔︎', 'Kondom ✔︎', s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean) : ['Zuhören ✔︎', 'Lachen ✔︎', 'Stadtlichter ✔︎'];
    const bye = kind === 'room' ? ['Danke dir. Du weißt, wo du mich findest. 💋', 'Das war schön. Fahr vorsichtig nach Hause!', 'Bis zum nächsten Mal, Süße*r. Und trink Wasser!'] : ['Danke fürs Zuhören. Das brauchte ich heute.', 'Du bist süß. Bring mich zurück, ja?'];
    this.g.fadeNight(kind === 'room' ? `🚗 Im Auto mit ${w.name} …` : `🚗 Unterwegs mit ${w.name}`, tags, kind === 'room' ? 30 : 25, kind, () => {
      this.g.dialog.say([{ who: w.name, color: w.color, text: bye[s.day % bye.length] }]);
      this.back(n);
      s.flags.kerb = (Number(s.flags.kerb) || 0) + 1;
      this.g.save.write();
    });
  }
}
