/* Fahndung und Flucht (zu Combat.ts): ab zwei Sternen jagen Streifenwagen mit Blaulicht hinter dir her, über das Straßennetz
   und auf den letzten Metern direkt. Zu Fuß kannst du dich in Verstecken (🫥 auf dem Radar) bei Freund*innen der Szene unterstellen:
   Dort sieht dich die Streife nur aus der Nähe und du hängst sie schneller ab. Im Auto fährst du bei Rosi in die Garage und lässt
   umlackieren, dann ist die Fahndung weg, wenn dich dabei niemand sieht. Kein Rammen, kein Blut: Wer gestellt wird, geht auf die Wache.
   Ein Bedienkonzept: fahren, laufen, stehen bleiben. Kein eigener Knopf. */
import { Vector3, type Scene, type Node3, type Mesh } from '../engine/bjs';
import { box, glow } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { GARAGE, PAINTS } from './vehicles';
import { crewHas } from './crew';
import type { CityScene } from './CityScene';
import type { Game } from './Game';

/** Verstecke zu Fuß: Hauseingänge und Ecken, in denen die Szene dich deckt */
export const HIDES: Array<{ x: number; z: number; name: string; who: string }> = [
  { x: -4.6, z: -40, name: 'Hauseingang von Haus Rosa', who: 'Madame Rosa zieht dich in den Flur: „Hier war niemand, Schätzchen.“' },
  { x: 33.5, z: 22.5, name: 'Garderobe der One Love Bar', who: 'Lady Luma wirft dir eine Federboa über: „Du bist jetzt Teil der Deko.“' },
  { x: 49, z: 49, name: 'Gebüsch im Regenbogenpark', who: 'Ein Pärchen auf der Decke rückt zur Seite: „Pssst, setz dich.“' },
  { x: -36.5, z: -6.5, name: 'Hinterhof am Checkpoint', who: 'Kim winkt dich in den Hof: „Atmen. Die fahren gleich vorbei.“' },
  { x: -6.5, z: 44, name: 'Lager hinter dem Späti', who: 'Tariq stellt dir eine Kiste hin: „Setz dich. Willst du was trinken?“' },
  { x: -82, z: 33, name: 'Unter dem Steg der Strandbar', who: 'Bruno reicht dir ein Handtuch: „Strandgast. Ganz normal.“' },
  { x: 107, z: -29, name: 'Hinter den Leuchtschildern der Laternenmeile', who: 'Roxy stellt sich vor dich: „Der Herr hier ist mein Stammgast, Officer.“' },
];
const HIDE_R = 3.2, HIDE_SEE = 7, SHOP_R = 7;
/** Rosis Garage: Einfahrt zum Umlackieren */
const SHOP = { x: GARAGE.spawn[0], z: GARAGE.spawn[1] };
/** Straßennetz wie Brawl.ts */
const GX = [-60, -30, 0, 30, 60, 90, 120, 150, 180, 210], GZ = [-60, -30, 0, 30, 60];

interface Unit { o: Node3; lamps: [Mesh, Mesh]; v: number; tgt: [number, number] | null; on: boolean }

export class Flucht {
  private units: Unit[] = [];
  private making = false;
  private hidAt = -1;
  private flashT = 0;
  private shopHint = 0;
  /** gerade in einem Versteck */
  hidden = false;

  constructor(private g: Game, private city: CityScene, private sc: Scene) {}

  private get s() { return this.g.save.data; }

  /** Versteck in der Nähe (zu Fuß) */
  hideAt(p: Vector3) { if (this.city.driving) return -1; return HIDES.findIndex((h) => Math.hypot(h.x - p.x, h.z - p.z) < HIDE_R); }
  /** Sichtweite der Streife: im Versteck nur aus der Nähe */
  see(base: number) { return this.hidden ? HIDE_SEE : base; }
  /** schneller abhängen: Versteck und Polizeifunk der Crew */
  fast() { return (this.hidden ? 2.5 : 1) * (crewHas(this.s, 'funk') ? 1.35 : 1); }

  /** Blips für das Radar (nur mit Fahndung) */
  blips(stars: number, p: Vector3) {
    if (!stars) return [];
    return [
      ...HIDES.filter((h) => Math.hypot(h.x - p.x, h.z - p.z) < 70).map((h) => ({ x: h.x, z: h.z, icon: '🫥' })),
      ...(Math.hypot(SHOP.x - p.x, SHOP.z - p.z) < 90 ? [{ x: SHOP.x, z: SHOP.z, icon: '🎨' }] : []),
      ...this.units.filter((u) => u.on).map((u) => ({ x: u.o.position.x, z: u.o.position.z, color: Math.floor(this.flashT * 4) % 2 ? '#2a5bff' : '#ff2a2a' })),
    ];
  }

  /** Streifenwagen (einmal gebaut, dann wiederverwendet) */
  private async make() {
    if (this.making) return; this.making = true;
    for (let i = 0; i < 3; i++) {
      const o = await this.city.world.car('car_police');
      const bb = o.getHierarchyBoundingVectors(true), h = bb.max.y - bb.min.y;
      const lamps = [0x2a5bff, 0xff2a2a].map((c, k) => { const b = box(this.sc, .45, .25, .25); b.material = glow(this.sc, c, 2.2); b.position.set((k ? 1 : -1) * .3, h + .1, -.1); b.parent = o; b.isPickable = false; return b; }) as [Mesh, Mesh];
      o.setEnabled(false);
      this.units.push({ o, lamps, v: 0, tgt: null, on: false });
    }
  }

  /** nächste Kreuzung */
  private node(x: number, z: number): [number, number] {
    let b = 1e9, out: [number, number] = [0, 0];
    for (const gx of GX) for (const gz of GZ) { const d = Math.hypot(gx - x, gz - z); if (d < b) { b = d; out = [gx, gz]; } }
    return out;
  }
  /** Nachbar-Kreuzung, die dem Ziel am nächsten ist (Fluss nur über die Brücke bei z 0) */
  private step(from: [number, number], to: Vector3): [number, number] {
    const [x, z] = from, side = (v: number) => v > 75;
    if (side(x) !== side(to.x) && z !== 0) return [x, 0];
    let best = from, bd = Math.hypot(x - to.x, z - to.z);
    for (const [dx, dz] of [[30, 0], [-30, 0], [0, 30], [0, -30]]) {
      const nx = x + dx, nz = z + dz;
      if (nx < -60 || nx > 210 || nz < -60 || nz > 60) continue;
      if (side(nx) !== side(x) && z !== 0) continue;
      const d = Math.hypot(nx - to.x, nz - to.z);
      if (d < bd - .1) { bd = d; best = [nx, nz]; }
    }
    return best;
  }

  /** alle Streifenwagen weg (abgehängt, festgenommen) */
  clear() { for (const u of this.units) { u.on = false; u.o.setEnabled(false); u.tgt = null; } this.hidAt = -1; this.hidden = false; }

  /** Pro Bild. Liefert seen (ein Wagen sieht dich) und catch (Wagen hat dich gestellt) */
  update(dt: number, stars: number, p: Vector3): { seen: boolean; caught: boolean } {
    this.flashT += dt;
    // Versteck
    const hi = stars ? this.hideAt(p) : -1;
    if (hi !== this.hidAt) {
      this.hidAt = hi; this.hidden = hi >= 0;
      if (this.hidden) { sfx('open'); this.g.hud.banner(`🫥 ${HIDES[hi].name}`, HIDES[hi].who, 'info', 3200); }
    }
    // Umlackieren bei Rosi
    if (stars && this.city.driving && Math.hypot(p.x - SHOP.x, p.z - SHOP.z) < SHOP_R && this.city.carSpeed < 3) {
      if ((this.shopHint -= dt) <= 0) { this.shopHint = 6; this.paintShop(); }
    }
    if (!stars) { if (this.units.some((u) => u.on)) this.clear(); return { seen: false, caught: false }; }
    const want = stars >= 2 ? Math.min(3, stars - 1) : 0;
    if (want && !this.units.length) void this.make();
    const slow = crewHas(this.s, 'fahrer') ? .9 : 1, vmax = (11 + stars * 1.8) * slow;
    let seen = false, caught = false, on = 0;
    for (const u of this.units) {
      if (!u.on && on < want) {
        // weit weg an einer Kreuzung auftauchen
        const ang = Math.random() * Math.PI * 2, n = this.node(p.x + Math.sin(ang) * 55, p.z + Math.cos(ang) * 55);
        u.o.position.set(n[0], .1, n[1]); u.o.setEnabled(true); u.on = true; u.v = 6; u.tgt = null;
        if (on === 0) sfx('siren');
      }
      if (!u.on) continue;
      if (on >= want) { u.on = false; u.o.setEnabled(false); continue; }
      on++;
      const q = u.o.position, d = Math.hypot(p.x - q.x, p.z - q.z);
      if (d < this.see(34)) seen = true;
      // Blaulicht
      const f = Math.floor(this.flashT * 5 + on) % 2 === 0; u.lamps[0].setEnabled(f); u.lamps[1].setEnabled(!f);
      // Ziel: nah dran direkt, sonst Kreuzung für Kreuzung; im Versteck stehen bleiben und suchen
      let tx: number, tz: number;
      if (this.hidden && d > HIDE_SEE) { u.v = Math.max(0, u.v - dt * 10); continue; }
      if (d < 28) { tx = p.x; tz = p.z; u.tgt = null; }
      else {
        if (!u.tgt || Math.hypot(u.tgt[0] - q.x, u.tgt[1] - q.z) < 2) u.tgt = this.step(this.node(q.x, q.z), p);
        [tx, tz] = u.tgt;
      }
      const dx = tx - q.x, dz = tz - q.z, td = Math.hypot(dx, dz) || 1;
      const stopAt = this.city.driving ? 3.2 : 4.5;
      const goal = d < stopAt + 2 ? Math.max(0, (d - stopAt) * 3) : vmax;
      u.v += Math.max(-dt * 16, Math.min(dt * 7, goal - u.v));
      const k = Math.min(td, u.v * dt);
      q.x += dx / td * k; q.z += dz / td * k;
      this.city.world.collide(q, 1.1);
      const yaw = Math.atan2(dx, dz); u.o.rotation.y += Math.atan2(Math.sin(yaw - u.o.rotation.y), Math.cos(yaw - u.o.rotation.y)) * Math.min(1, dt * 6);
      // gestellt: Wagen dicht dran und du stehst (oder läufst)
      if (d < stopAt + 1.2 && (!this.city.driving || this.city.carSpeed < 1.5)) caught = true;
    }
    return { seen, caught };
  }

  /** Umziehen am Kofferraum: neues Outfit, die Streife sucht jemand anderen. Nur ohne Streife in Sichtweite,
      bis 2 Sterne ist die Fahndung weg, darüber fallen 2 Sterne. Jeder Wagen nur einmal, kurze Pause dazwischen. */
  private trunkT = -999;
  private trunkCars = new WeakSet<object>();
  trunk(car: object) {
    const s = this.s, w = this.city.combat.wanted, p = this.city.player.root.position, now = performance.now() / 1000;
    if (this.city.combat.copNear(p, 18) || this.units.some((u) => u.on && Math.hypot(u.o.position.x - p.x, u.o.position.z - p.z) < 26)) { sfx('miss'); toast('🧳 Nicht vor den Augen der Streife! Erst um die Ecke, dann umziehen.'); return; }
    if (this.trunkCars.has(car)) { sfx('miss'); toast('🧳 In diesem Kofferraum ist nichts mehr, das passt. Such dir einen anderen Wagen.'); return; }
    if (now - this.trunkT < 45) { sfx('miss'); toast('🧳 Gerade erst umgezogen. Noch mal so schnell fällt auf.'); return; }
    this.trunkT = now; this.trunkCars.add(car);
    const cur = String(s.flags.outfit || 'clothed'), pool = ['clothed', 'shirtless', 'swim', ...(s.settings.adult ? ['harness'] : [])].filter((o) => o !== cur);
    const next = pool[Math.floor(Math.random() * pool.length)], names: Record<string, string> = { clothed: 'Jeans und Hoodie', shirtless: 'oberkörperfrei mit Sonnenbrille', swim: 'Badesachen und Handtuch', harness: 'Harness und Lederjacke' };
    sfx('door');
    this.g.fade(async () => {
      s.flags.outfit = next; await this.city.rebuildPlayer();
      const before = w.stars;
      if (before <= 2) { w.clear(); this.clear(); this.city.combat.home(); } else { w.stars = before - 2; w.unseen = 0; }
      sfx('sheets'); setTimeout(() => sfx(w.stars ? 'move' : 'win'), 400); this.g.save.write(); this.city.refreshHud();
      this.g.hud.banner('🧳 Am Kofferraum umgezogen', w.stars ? `Jetzt in ${names[next]}. Die Streife sucht jemand anderen: noch ${'★'.repeat(w.stars)}.` : `Jetzt in ${names[next]}. Die Polizei sucht jemand ganz anderen. Fahndung weg!`, 'good', 3800);
    });
  }

  /** Rosi lackiert um: Fahndung weg, wenn keine Streife zusieht */
  private paintShop() {
    const s = this.s, w = this.city.combat.wanted, p = this.city.player.root.position;
    if (this.city.combat.copNear(p, 16) || this.units.some((u) => u.on && Math.hypot(u.o.position.x - p.x, u.o.position.z - p.z) < 22)) { sfx('miss'); toast('🎨 Rosi: „Nicht mit der Streife im Nacken! Häng sie erst kurz ab.“'); return; }
    const cost = Math.round((60 + w.stars * 40) * (crewHas(s, 'schrauber') ? .5 : 1));
    if (s.money < cost) { sfx('miss'); toast(`🎨 Umlackieren kostet ${cost} €, dir fehlen ${cost - s.money} €.`); return; }
    this.g.dialog.say([{ who: 'Meisterin Rosi', color: '#ffb347', text: `Rein mit dir, Tor zu. Neuer Lack, neue Kennzeichen, ${cost} €${crewHas(s, 'schrauber') ? ' (Tom-Rabatt)' : ''}. Die Streife sucht dann einen ganz anderen Wagen.`, choices: [
      { label: `🎨 Umlackieren (${cost} €)`, fn: () => this.g.fade(() => {
        s.money -= cost; this.g.pass(20);
        const d = this.city.ride;
        if (d?.own) { const cur = s.flags.carHue === undefined ? -1 : Number(s.flags.carHue), opts = PAINTS.filter((q) => q[2] >= 0 && q[2] !== cur), np = opts[Math.floor(Math.random() * opts.length)]; s.flags.carHue = np[2]; void this.city.world.paintCar(d.o, np[2]); }
        w.clear(); this.clear(); this.city.combat.home();
        sfx('win'); this.g.save.write(); this.city.refreshHud();
        this.g.hud.banner('🎨 Frisch umlackiert', 'Neue Farbe, neue Kennzeichen. Die Fahndung ist weg.', 'good', 3600);
      }) },
      { label: 'Lieber nicht', fn: () => {} }] }]);
  }
}
