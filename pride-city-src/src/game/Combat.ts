/* Spaß-Kämpfe und Polizei wie im Open-World-Krimi, aber ohne Blut: Leute mit Klaps, Poolnudel oder Glitzer-Dildo (18+)
   umhauen, Gleitgel auf den Boden werfen und zusehen, wie alle ausrutschen. Wer erwischt wird, bekommt Sterne,
   die Streife rennt hinterher – mit genug Abstand und Zeit hängst du sie ab, sonst gibt es Bußgeld auf der Wache.
   Ein Bedienkonzept: Angriff (F / LT / 👊), Waffe wechseln (G / L3 / Waffen-Knopf im HUD). */
import { Vector3, Mesh, TransformNode, type Scene, type PBRMaterial } from '../engine/bjs';
import { cyl, sphere, ring, pbr } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { Actor, RUN_MPS } from './Actor';
import { Wanted, WEAPONS, arsenal, LAWS, type Weapon, type Law } from './crime';
import type { StreetNpc } from './Street';
import type { CityScene } from './CityScene';
import type { Game } from './Game';

interface Body { a: Actor; down: number; up: number; kind: string; name: string }
interface Puddle { m: Mesh; x: number; z: number; t: number; hit: Set<Actor> }
interface Cop { a: Actor; home: [number, number]; extra: boolean; n?: StreetNpc }

const SEE = 32, CATCH = 1.15, COP_SPEED = 5.4;
const OUCH = ['Aua! Spinnst du?', 'Hey! Das gibt Ärger!', 'Ich ruf die Polizei!', 'Uff – mein Rücken!', 'Was für ein Abend …', 'Na warte!'];
const SLIP = ['Huch – glitschig!', 'Uiii!', 'Wer hat hier Gleitgel verschüttet?!', 'Meine Frisur!'];

export class Combat {
  readonly wanted = new Wanted();
  weapon: Weapon = 'hand';
  private bodies = new Map<Actor, Body>();
  private puddles: Puddle[] = [];
  private cops: Cop[] = [];
  private extra: Cop[] = [];
  private held: TransformNode;
  private holdParts: Record<'noodle' | 'dildo' | 'lube', TransformNode>;
  private swing = 0;
  private cool = 0;
  private puddleM: PBRMaterial;
  private seenIndecent = 0;
  private arrestT = 0;

  constructor(private g: Game, private city: CityScene, private scene: Scene) {
    const sc = scene;
    this.held = new TransformNode('held', sc);
    const mk = (name: string) => { const n = new TransformNode(name, sc); n.parent = this.held; n.setEnabled(false); return n; };
    // Poolnudel: lange Schaumstoff-Nudel in Regenbogenfarben
    const noodle = mk('noodle');
    ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((c, i) => { const p = cyl(sc, .05, .05, .16, 10); p.material = pbr(sc, parseInt(c.slice(1), 16), .6); p.position.y = .08 + i * .16; p.parent = noodle; });
    // Glitzer-Dildo: stilisiert (abgerundeter Stab in Pink mit Glitzer), keine anatomischen Details
    const dildo = mk('dildo');
    const dm = pbr(sc, 0xff4fd8, .25, .1, { emissive: 0xff4fd8, ei: .35 });
    const shaft = cyl(sc, .038, .045, .26, 14); shaft.material = dm; shaft.position.y = .15; shaft.parent = dildo;
    const tip = sphere(sc, .042, 12); tip.material = dm; tip.position.y = .28; tip.parent = dildo;
    const base = cyl(sc, .06, .06, .03, 14); base.material = pbr(sc, 0xffd23b, .3, .6); base.position.y = .015; base.parent = dildo;
    // Gleitgel-Flasche
    const lube = mk('lube');
    const bottle = cyl(sc, .04, .045, .16, 12); bottle.material = pbr(sc, 0x5ce1ff, .1, 0, { alpha: .8 }); bottle.position.y = .08; bottle.parent = lube;
    const cap = cyl(sc, .02, .02, .04, 10); cap.material = pbr(sc, 0xffffff, .3); cap.position.y = .18; cap.parent = lube;
    this.holdParts = { noodle, dildo, lube };
    this.held.getChildMeshes().forEach((m) => { m.isPickable = false; });
    this.puddleM = pbr(sc, 0x7fe8ff, .02, 0, { alpha: .55, emissive: 0x2a8fd0, ei: .25 });
  }

  /** Streife aus der Straße übernehmen (nach dem Aufbau) */
  init() {
    for (const n of this.city.street.people) if (n.kind === 'police') this.cops.push({ a: n.a, home: [n.path[0][0], n.path[0][1]], extra: false, n });
  }

  private get save() { return this.g.save.data; }
  list() { return arsenal(this.save.settings.adult, this.save.inv.toy || 0); }

  /** Nächste Waffe */
  cycle() {
    const l = this.list(); let i = l.indexOf(this.weapon); if (i < 0) i = 0;
    this.weapon = l[(i + 1) % l.length];
    sfx('move');
    const w = WEAPONS[this.weapon];
    toast(`${w.icon} ${w.name}${this.weapon === 'lube' ? ` · ${this.save.inv.lube || 0} Flaschen` : ''}`);
    this.showWeapon();
  }
  /** Waffen-Anzeige im HUD (Antippen wechselt) */
  showWeapon() {
    if (!this.list().includes(this.weapon)) this.weapon = 'hand';
    const w = WEAPONS[this.weapon];
    this.g.hud.weapon(`${w.icon} ${w.name}${this.weapon === 'lube' ? ' ×' + (this.save.inv.lube || 0) : ''}`);
  }

  /** Angriff bzw. Wurf */
  attack() {
    if (this.cool > 0 || this.city.driving) return;
    const s = this.save, w = WEAPONS[this.weapon], me = this.city.player, p = me.root.position, yaw = me.root.rotation.y;
    if (!this.list().includes(this.weapon)) this.weapon = 'hand';
    this.cool = .55; this.swing = 1;
    me.play('wave', .08, 2.2);
    if (w.throw) {
      if ((s.inv.lube || 0) <= 0) { toast('Kein Gleitgel mehr – im Späti Lecker gibt es Nachschub (4 €).'); sfx('miss'); return; }
      s.inv.lube--; this.showWeapon();
      const x = p.x + Math.sin(yaw) * 2.4, z = p.z + Math.cos(yaw) * 2.4;
      setTimeout(() => this.puddle(x, z), 280);
      return;
    }
    sfx('move');
    // Ziel: nächste Person vor dir
    let best: { a: Actor; kind: string; name: string; cop: boolean; id?: string } | null = null, bd = w.reach;
    const consider = (a: Actor, kind: string, name: string, cop = false, id?: string) => {
      if (!a.root.isEnabled() || this.bodies.get(a)?.down) return;
      const dx = a.root.position.x - p.x, dz = a.root.position.z - p.z, d = Math.hypot(dx, dz);
      if (d > bd) return;
      let ang = Math.atan2(dx, dz) - yaw; ang = Math.atan2(Math.sin(ang), Math.cos(ang));
      if (Math.abs(ang) > 1.1) return;
      bd = d; best = { a, kind, name, cop, id };
    };
    for (const n of this.city.street.people) if (n.a.root.visible) consider(n.a, n.kind, n.name, n.kind === 'police');
    for (const c of this.extra) if (c.a.root.isEnabled()) consider(c.a, 'police', 'Polizei', true);
    for (const n of this.city.storyActors()) consider(n.a, 'story', n.name, false, n.id);
    if (!best) return;
    const t = best as { a: Actor; kind: string; name: string; cop: boolean; id?: string };
    setTimeout(() => {
      sfx('hit'); setTimeout(() => sfx('applause'), 120);
      if (t.kind === 'story') { t.a.play('laugh'); toast(`${t.name}: „Hey! Lass das!“`); this.city.annoy(t.id!); this.crime('assault', p); return; }
      this.knock(t.a, t.kind, t.name, OUCH[Math.floor(Math.random() * OUCH.length)], yaw);
      this.crime(t.cop ? 'police' : 'assault', p);
    }, 160);
  }

  /** Gleitgel-Pfütze auf den Boden */
  private puddle(x: number, z: number) {
    const m = ring(this.scene, 0, 1, 28); m.material = this.puddleM; m.position.set(x, .035, z); m.scaling.setAll(.2); m.isPickable = false;
    this.puddles.push({ m, x, z, t: 30, hit: new Set() });
    sfx('pour'); toast('💧 Gleitgel verteilt – Vorsicht, rutschig!');
    if (this.puddles.length > 6) this.puddles.shift()!.m.dispose();
  }

  /** Umfallen (ausgerutscht oder umgehauen), steht nach ein paar Sekunden wieder auf */
  private knock(a: Actor, kind: string, name: string, line: string, dir: number) {
    this.bodies.set(a, { a, down: 3.2, up: 0, kind, name });
    a.root.rotation.y = dir + Math.PI; // fällt nach hinten, weg von dir
    const n = this.city.street.people.find((q) => q.a === a); if (n) n.down = true;
    toast(`${name}: „${line}“`);
  }

  /** Vergehen: gemeldet, wenn eine Streife es sieht – sonst ruft manchmal jemand die Polizei */
  private crime(law: Law, at: Vector3) {
    const seen = this.copNear(at, SEE) || this.wanted.stars > 0;
    if (!seen) { if (Math.random() < .45) toast('📞 Jemand hat die Polizei gerufen!'); else return; }
    const more = this.wanted.add(law);
    if (more) { sfx('siren'); this.g.hud.banner(`${'★'.repeat(this.wanted.stars)} Fahndung`, LAWS[law].name, 'bad', 2600); }
  }

  private copNear(p: Vector3, r: number) {
    for (const c of [...this.cops, ...this.extra]) { if (!c.a.root.isEnabled() || this.bodies.get(c.a)?.down) continue; if (Vector3.Distance(c.a.root.position, p) < r) return true; }
    return false;
  }

  /** Autodiebstahl prüfen (beim Einsteigen) */
  enterCar() { const p = this.city.player.root.position; if (this.copNear(p, 18)) this.crime('theft', p); }

  /** Zusätzliche Streifen ab drei Sternen (kommen von außerhalb des Bildes) */
  private async reinforce() {
    if (this.extra.length) return;
    const ids = ['Police_Female_01', 'Police_Male_01'];
    for (const id of ids) {
      const a = await Actor.create(this.scene, { body: id, rb: id, palette: 'police', skin: 0 });
      this.extra.push({ a, home: [0, 0], extra: true }); a.root.setEnabled(false);
    }
  }

  update(dt: number, t: number) {
    const me = this.city.player, p = me.root.position, inp = this.g.engine.input;
    this.cool -= dt; this.arrestT -= dt;
    // gehaltene Waffe an der rechten Hand
    const hand = this.handNode();
    const show = !this.city.driving && this.weapon !== 'hand' && this.city.mode === 'play';
    for (const [k, n] of Object.entries(this.holdParts)) n.setEnabled(show && k === this.weapon);
    if (show && hand) {
      this.held.position.copyFrom(hand.getAbsolutePosition());
      this.swing = Math.max(0, this.swing - dt * 3.2);
      const sw = Math.sin((1 - this.swing) * Math.PI) * (this.swing > 0 ? 1 : 0);
      this.held.rotation.set(-.4 - sw * 1.6, me.root.rotation.y, 0);
    }
    // Erregung öffentlichen Ärgernisses: Dildo in der Hand vor der Streife
    if (show && this.weapon === 'dildo' && this.copNear(p, 9)) { this.seenIndecent += dt; if (this.seenIndecent > 1.2) { this.seenIndecent = -20; this.crime('indecent', p); } }
    else if (this.seenIndecent > 0) this.seenIndecent = 0; else this.seenIndecent = Math.min(0, this.seenIndecent + dt);

    // Pfützen: alle, die drübergehen, rutschen aus
    for (const q of this.puddles) {
      q.t -= dt; q.m.scaling.setAll(Math.min(1, q.m.scaling.x + dt * 4) * (q.t < 2 ? Math.max(0, q.t / 2) : 1));
      const walkers: Array<{ a: Actor; kind: string; name: string }> = [
        ...this.city.street.people.filter((n) => n.a.root.visible).map((n) => ({ a: n.a, kind: n.kind, name: n.name })),
        ...this.extra.filter((c) => c.a.root.isEnabled()).map((c) => ({ a: c.a, kind: 'police', name: 'Polizei' }))];
      for (const w of walkers) {
        if (q.hit.has(w.a) || this.bodies.get(w.a)?.down) continue;
        if (Math.hypot(w.a.root.position.x - q.x, w.a.root.position.z - q.z) < .95) {
          q.hit.add(w.a); sfx('miss');
          this.knock(w.a, w.kind, w.name, SLIP[Math.floor(Math.random() * SLIP.length)], w.a.root.rotation.y + Math.PI);
          if (w.kind !== 'police' || this.wanted.stars === 0) this.crime('slip', q.m.position);
        }
      }
      // du selbst rutschst beim Rennen auch
      if (!this.city.driving && Math.hypot(p.x - q.x, p.z - q.z) < .8 && inp.held('sprint') && !q.hit.has(me)) { q.hit.add(me); toast('Huch! Selbst ausgerutscht. 😅'); me.play('laugh'); }
    }
    this.puddles = this.puddles.filter((q) => { if (q.t > 0) return true; q.m.dispose(); return false; });

    // Umgefallene liegen, stehen dann wieder auf
    for (const [a, b] of this.bodies) {
      const r = a.root;
      if (b.down > 0) { b.down -= dt; r.rotation.x = Math.max(-Math.PI / 2 + .05, r.rotation.x - dt * 9); r.position.y = .25; if (b.down <= 0) b.up = .6; }
      else if (b.up > 0) { b.up -= dt; r.rotation.x = Math.min(0, r.rotation.x + dt * 3.5); if (b.up <= 0) { r.rotation.x = 0; r.position.y = .1; this.bodies.delete(a); const n = this.city.street.people.find((q) => q.a === a); if (n) n.down = false; a.play(b.kind === 'police' ? 'run' : 'laugh'); } }
    }

    // Polizei: verfolgen, festnehmen oder zurück auf Streife
    const stars = this.wanted.stars;
    if (stars >= 3) this.reinforce();
    for (const c of this.extra) {
      if (stars >= 3 && !c.a.root.isEnabled()) {
        const ang = Math.random() * Math.PI * 2; c.a.root.position.set(p.x + Math.sin(ang) * 28, .1, p.z + Math.cos(ang) * 28); c.a.root.setEnabled(true);
      } else if (stars < 3 && c.a.root.isEnabled()) c.a.root.setEnabled(false);
    }
    let seen = false;
    for (const c of [...this.cops, ...this.extra]) {
      const a = c.a, r = a.root;
      if (!r.isEnabled() || (c.n && !r.visible && !stars)) { if (c.n) c.n.chase = false; continue; }
      if (c.extra) a.update(dt);
      if (this.bodies.get(a)) continue;
      if (!stars) { if (c.n) c.n.chase = false; continue; }
      const dx = p.x - r.position.x, dz = p.z - r.position.z, d = Math.hypot(dx, dz);
      if (d < SEE) seen = true;
      if (d > 60 && !c.extra) { if (c.n) c.n.chase = false; continue; }
      if (c.n) { c.n.chase = true; r.visible = true; }
      if (d > CATCH * .9) {
        const sp = COP_SPEED * (1 + (stars - 1) * .06);
        r.position.x += dx / d * sp * dt; r.position.z += dz / d * sp * dt;
        this.city.world.collide(r.position, .4);
        r.rotation.y = Math.atan2(dx, dz);
        a.play('run', .2, sp / RUN_MPS);
      }
      const slow = !this.city.driving || this.city.carSpeed < 1.2;
      if (d < CATCH + (this.city.driving ? 1.4 : 0) && slow && this.arrestT <= 0) { this.arrest(); return; }
    }
    if (stars) {
      const r = this.wanted.tick(dt, seen);
      if (r === 'lost') { sfx('win'); this.g.hud.banner('Abgehängt! ✨', 'Die Polizei hat deine Spur verloren.', 'good', 3000); this.home(); }
    }
    this.g.hud.wanted(this.wanted.stars, !seen && this.wanted.stars > 0 && Math.floor(t * 3) % 2 === 0);
  }

  /** Streife zurück auf ihre Runde */
  private home() { for (const c of this.cops) { if (c.n) c.n.chase = false; } for (const c of this.extra) c.a.root.setEnabled(false); }

  private arrest() {
    const s = this.save;
    this.arrestT = 5;
    const fine = this.wanted.arrest(s.money);
    this.city.leaveCar();
    sfx('siren');
    this.g.fade(() => {
      s.money -= fine;
      this.g.pass(120);
      this.city.player.root.position.set(4.4, .1, -20); this.city.player.root.rotation.y = -Math.PI / 2;
      for (const c of this.cops) { if (c.n) { c.n.chase = false; c.a.root.position.set(c.home[0], .1, c.home[1]); } }
      for (const c of this.extra) c.a.root.setEnabled(false);
      this.g.save.write(); this.city.refreshHud();
      this.g.hud.banner('🚓 Festgenommen', `${fine} € Bußgeld und zwei Stunden Papierkram auf der Wache.`, 'bad', 4200);
    });
  }

  /** Rechte Hand der Spielfigur (Rocketbox: „Bip01 R Hand“) */
  private hand: TransformNode | null = null;
  private handFor: Actor | null = null;
  private handNode() {
    const me = this.city.player;
    if (this.handFor !== me) { this.handFor = me; this.hand = me.model.getChildTransformNodes(false).find((n) => n.name === 'Bip01 R Hand') || null; }
    return this.hand;
  }
}
