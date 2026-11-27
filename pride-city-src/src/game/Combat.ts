/* Spaß-Kämpfe und Polizei wie im Open-World-Krimi, aber ohne Blut: Leute mit Klaps, Poolnudel oder Glitzer-Dildo (18+)
   umhauen, Gleitgel auf den Boden werfen und zusehen, wie alle ausrutschen. Wer erwischt wird, bekommt Sterne,
   die Streife rennt hinterher – mit genug Abstand und Zeit hängst du sie ab, sonst gibt es Bußgeld auf der Wache.
   Ein Bedienkonzept: Angriff (F / LT / 👊), Waffe wechseln (G / L3 / Waffen-Knopf im HUD). */
import { punch } from './fit';
import { Vector3, Quaternion, Matrix, Mesh, TransformNode, type Scene, type PBRMaterial } from '../engine/bjs';
import { cyl, sphere, ring, pbr } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import { Actor, RUN_MPS } from './Actor';
import { Wanted, WEAPONS, arsenal, landHit, LAWS, type Weapon, type Law } from './crime';
import type { StreetNpc } from './Street';
import { dildoNow, dildoSizes, dildoStats } from './toys';
import type { CityScene } from './CityScene';
import type { Game } from './Game';
import { Flucht } from './flucht';
import { crewHas } from './crew';

interface Body { a: Actor; down: number; up: number; kind: string; name: string; vx: number; vz: number }
interface Spark { m: Mesh; vx: number; vy: number; vz: number; t: number }
interface Puddle { m: Mesh; x: number; z: number; t: number; hit: Set<Actor> }
interface Cop { a: Actor; home: [number, number]; extra: boolean; n?: StreetNpc }

const SEE = 32, CATCH = 1.15, COP_SPEED = 5.4;
const OUCH = ['Aua! Spinnst du?', 'Hey! Das gibt Ärger!', 'Ich ruf die Polizei!', 'Uff – mein Rücken!', 'Was für ein Abend …', 'Na warte!'];
const AU = ['Au!', 'Hey!', 'Lass das!', 'Geht’s noch?!', 'Uff!', 'Finger weg!'];
const UP = new Vector3(0, 1, 0), TQ = new Quaternion(), TM = new Matrix();
const SLIP = ['Huch – glitschig!', 'Uiii!', 'Wer hat hier Gleitgel verschüttet?!', 'Meine Frisur!'];

export class Combat {
  readonly wanted = new Wanted();
  /** Streifenwagen, Verstecke, Umlackieren */
  readonly flucht: Flucht;
  weapon: Weapon = 'hand';
  private bodies = new Map<Actor, Body>();
  private puddles: Puddle[] = [];
  private cops: Cop[] = [];
  private extra: Cop[] = [];
  private held: TransformNode;
  private holdParts: Record<'noodle' | 'dildo' | 'lube', TransformNode>;
  /** Treffer bzw. Wurf, sobald der Arm vorn ist */
  private impact: (() => void) | null = null;
  private cool = 0;
  private puddleM: PBRMaterial;
  private seenIndecent = 0;
  /** Schlag läuft: 1 → 0 */
  private strike = 0;
  private wob = 0;
  private now = 0;
  private chain = new Map<Actor, { n: number; t: number }>();
  private stagger = new Map<Actor, { t: number; vx: number; vz: number }>();
  private sparks: Spark[] = [];
  private bottle: { m: TransformNode; t: number; from: Vector3; to: Vector3 } | null = null;
  private hintAdult = false;
  private arrestT = 0;

  constructor(private g: Game, private city: CityScene, private scene: Scene) {
    const sc = scene;
    this.flucht = new Flucht(g, city, scene);
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
    // Glitzer-Funken beim Treffer (kleiner Vorrat, wird wiederverwendet)
    const cols = [0xff4fd8, 0xffd23b, 0x5ce1ff, 0xffffff];
    for (let i = 0; i < 14; i++) { const m = sphere(sc, .035, 6); m.material = pbr(sc, cols[i % 4], .3, 0, { emissive: cols[i % 4], ei: 1.4 }); m.isPickable = false; m.setEnabled(false); this.sparks.push({ m, vx: 0, vy: 0, vz: 0, t: 0 }); }
    // Arm und Waffe nach der Animation führen: so holt die Figur wirklich aus und schlägt zu
    sc.onAfterAnimationsObservable.add(() => this.pose());
  }

  /** Streife aus der Straße übernehmen (nach dem Aufbau) */
  init() {
    for (const n of this.city.street.people) if (n.kind === 'police') this.cops.push({ a: n.a, home: [n.path[0][0], n.path[0][1]], extra: false, n });
  }

  private get save() { return this.g.save.data; }
  list() { return arsenal(this.save.settings.adult); }

  /** Nächste Waffe */
  cycle() {
    const l = this.list(); let i = l.indexOf(this.weapon); if (i < 0) i = 0;
    // Dildo-Größen aus der Hinterzimmer-Ecke: erst alle eigenen Größen durchschalten, dann weiter
    const ds = dildoSizes(this.save), di = ds.indexOf(dildoNow(this.save));
    if (this.weapon === 'dildo' && di < ds.length - 1) this.save.flags.dildo = ds[di + 1].id;
    else { this.weapon = l[(i + 1) % l.length]; if (this.weapon === 'dildo') this.save.flags.dildo = ds[0].id; }
    sfx('move');
    const w = WEAPONS[this.weapon];
    toast(`${w.icon} ${this.wname()}${this.weapon === 'lube' ? ` · ${this.save.inv.lube || 0} Flaschen` : ''}`);
    if (!this.save.settings.adult && !this.hintAdult && this.weapon === 'hand') { this.hintAdult = true; toast('🍆 Den Glitzer-Dildo gibt es mit „Inhalte ab 18“ (Menü → Einstellungen).'); }
    this.showWeapon();
  }
  /** Waffen-Anzeige im HUD (Antippen wechselt) */
  showWeapon() {
    if (!this.list().includes(this.weapon)) this.weapon = 'hand';
    const w = WEAPONS[this.weapon];
    this.holdParts.dildo.scaling.setAll(dildoNow(this.save).scale || 1);
    this.g.hud.weapon(`${w.icon} ${this.wname()}${this.weapon === 'lube' ? ' ×' + (this.save.inv.lube || 0) : ''}`);
  }

  /** Name der Waffe; beim Dildo mit Größe */
  private wname() { if (this.weapon !== 'dildo') return WEAPONS[this.weapon].name; const d = dildoNow(this.save); return `${d.name.replace('Glitzer-Dildo ', 'Dildo ')} · ${d.size}`; }
  /** Angriff bzw. Wurf: ausholen, zum Ziel drehen, zuschlagen. Erst mehrere Treffer hauen jemanden um. */
  attack() {
    if (this.cool > 0 || this.city.driving) return;
    const s = this.save, me = this.city.player, p = me.root.position;
    if (!this.list().includes(this.weapon)) this.weapon = 'hand';
    const w = this.weapon === 'dildo' ? { ...WEAPONS.dildo, ...dildoStats(dildoNow(s)) } : WEAPONS[this.weapon];
    this.cool = .6; this.strike = 1;
    const pw = punch(s);
    if (w.throw) {
      if ((s.inv.lube || 0) <= 0) { this.strike = 0; toast('Kein Gleitgel mehr – im Späti Lecker gibt es Nachschub (4 €).'); sfx('miss'); return; }
      s.inv.lube--; this.showWeapon();
      const yaw = me.root.rotation.y, to = new Vector3(p.x + Math.sin(yaw) * 4.2, .05, p.z + Math.cos(yaw) * 4.2);
      this.impact = () => { sfx('whoosh'); this.bottle = { m: this.holdParts.lube.clone('flask', null)!, t: 0, from: this.held.position.clone(), to }; this.bottle.m.setEnabled(true); };
      return;
    }
    // Ziel: nächste Person vor dir (etwas weiter als die Reichweite – dann machst du einen Schritt darauf zu)
    let best: { a: Actor; kind: string; name: string; cop: boolean; id?: string } | null = null, bd = w.reach * 1.8;
    const yaw0 = me.root.rotation.y;
    const consider = (a: Actor, kind: string, name: string, cop = false, id?: string) => {
      if (!a.root.isEnabled() || this.bodies.get(a)?.down) return;
      const dx = a.root.position.x - p.x, dz = a.root.position.z - p.z, d = Math.hypot(dx, dz);
      if (d > bd) return;
      let ang = Math.atan2(dx, dz) - yaw0; ang = Math.atan2(Math.sin(ang), Math.cos(ang));
      if (Math.abs(ang) > 1.1) return;
      bd = d; best = { a, kind, name, cop, id };
    };
    for (const n of this.city.street.people) if (n.a.root.visible) consider(n.a, n.kind, n.name, n.kind === 'police');
    for (const c of this.extra) if (c.a.root.isEnabled()) consider(c.a, 'police', 'Polizei', true);
    for (const n of this.city.storyActors()) consider(n.a, 'story', n.name, false, n.id);
    for (const f of this.city.brawl.targets()) consider(f.a, 'foe', f.name);
    this.impact = null;
    setTimeout(() => sfx('whoosh'), 150);
    if (!best) return;
    const t = best as { a: Actor; kind: string; name: string; cop: boolean; id?: string };
    // zum Ziel drehen und, wenn nötig, einen Ausfallschritt machen
    const tp = t.a.root.position, dx = tp.x - p.x, dz = tp.z - p.z, d = Math.hypot(dx, dz) || 1, yaw = Math.atan2(dx, dz);
    me.root.rotation.y = yaw;
    if (d > w.reach * .85) { const step = d - w.reach * .8; p.x += dx / d * step; p.z += dz / d * step; this.city.world.collide(p, .4); }
    this.impact = () => {
      if (!t.a.root.isEnabled() || this.bodies.get(t.a)?.down) return;
      sfx(this.weapon === 'hand' ? 'slap' : this.weapon === 'noodle' ? 'boing' : 'squeak');
      this.wob = 1; this.city.shake = this.weapon === 'hand' ? .12 : .2;
      this.burst(tp.x - dx / d * .25, 1.25, tp.z - dz / d * .25);
      // Schlägerei (Brawl.ts): Notwehr gegen den Ordnungsbund, keine Fahndung
      if (t.kind === 'foe') {
        let h = this.chain.get(t.a); if (!h) this.chain.set(t.a, (h = { n: 0, t: -9 }));
        if (landHit(h, this.now, Math.max(1, Math.min(2, w.hits) - pw.hits))) { sfx('hit'); this.knock(t.a, 'foe', t.name, 'Uff!', yaw, dx / d * w.push * 4 * pw.push, dz / d * w.push * 4 * pw.push); this.city.brawl.knocked(t.a); }
        else { this.push(t.a, dx / d, dz / d, w.push * 1.4); toast(`${t.name}: „${AU[Math.floor(Math.random() * AU.length)]}“`); }
        return;
      }
      if (t.kind === 'story') { t.a.play('laugh'); toast(`${t.name}: „Hey! Lass das!“`); this.city.annoy(t.id!); this.push(t.a, dx / d, dz / d, w.push * .5); this.crime('assault', p); return; }
      let h = this.chain.get(t.a); if (!h) this.chain.set(t.a, (h = { n: 0, t: -9 }));
      const first = h.n === 0 || this.now - h.t > 4;
      if (landHit(h, this.now, Math.max(1, w.hits - pw.hits))) { sfx('hit'); setTimeout(() => sfx('applause'), 200); this.knock(t.a, t.kind, t.name, OUCH[Math.floor(Math.random() * OUCH.length)], yaw, dx / d * w.push * 4 * pw.push, dz / d * w.push * 4 * pw.push); }
      else { this.push(t.a, dx / d, dz / d, w.push); toast(`${t.name}: „${AU[Math.floor(Math.random() * AU.length)]}“`); }
      if (first) this.crime(t.cop ? 'police' : 'assault', p);
    };
  }

  /** liegt oder taumelt gerade (dann führt Combat die Figur) */
  holds(a: Actor) { return this.bodies.has(a) || this.stagger.has(a); }
  /** Taumeln: ein Stück zurück, kurz nach hinten kippen, dann wieder fangen */
  private push(a: Actor, nx: number, nz: number, force: number) {
    this.stagger.set(a, { t: .38, vx: nx * force / .38, vz: nz * force / .38 });
    const n = this.city.street.people.find((q) => q.a === a); if (n) n.down = true;
  }
  /** Glitzer-Funken an der Trefferstelle */
  private burst(x: number, y: number, z: number) {
    for (const q of this.sparks) { const a = Math.random() * Math.PI * 2, v = 1.2 + Math.random() * 2.2; q.m.position.set(x, y, z); q.vx = Math.cos(a) * v; q.vz = Math.sin(a) * v; q.vy = 1.5 + Math.random() * 2.5; q.t = .45 + Math.random() * .25; q.m.setEnabled(true); }
  }

  /* ---------- Arm und Waffe: nach der Lauf-Animation überschreiben (ausholen → zuschlagen → zurück) ---------- */
  private arm: { up: TransformNode; fore: TransformNode; hand: TransformNode } | null = null;
  private armFor: Actor | null = null;
  private armNodes() {
    const me = this.city.player;
    if (this.armFor !== me) {
      this.armFor = me; const ns = me.model.getChildTransformNodes(false), f = (re: RegExp) => ns.find((n) => re.test(n.name));
      const up = f(/ R UpperArm$/), fore = f(/ R Forearm$/), hand = f(/ R Hand$/);
      this.arm = up && fore && hand ? { up, fore, hand } : null;
    }
    return this.arm;
  }
  /** Knochen so drehen, dass er (Richtung zum Kind) in die Weltrichtung dir zeigt; w = Gewicht gegenüber der Animation */
  private aim(n: TransformNode, child: TransformNode, dir: Vector3, w: number) {
    const par = n.parent as TransformNode | null; if (!par || !n.rotationQuaternion) return;
    par.computeWorldMatrix(true); n.computeWorldMatrix(true); child.computeWorldMatrix(true);
    const d0 = child.getAbsolutePosition().subtract(n.getAbsolutePosition()).normalize();
    const q = Quaternion.FromUnitVectorsToRef(d0, dir, TQ), local = n.getWorldMatrix().multiply(Matrix.FromQuaternionToRef(q, TM)).multiply(Matrix.Invert(par.getWorldMatrix()));
    const rot = new Quaternion(); if (!local.decompose(undefined, rot)) return;
    Quaternion.SlerpToRef(n.rotationQuaternion, rot, w, n.rotationQuaternion);
    n.computeWorldMatrix(true);
  }
  private pose() {
    const city = this.city, me = city.player; if (!me || city.mode !== 'play') return;
    const show = !city.driving && this.weapon !== 'hand';
    for (const [k, n] of Object.entries(this.holdParts)) n.setEnabled(show && k === this.weapon && !(k === 'lube' && this.bottle));
    const arm = city.driving ? null : this.armNodes(); if (!arm) return;
    const yaw = me.root.rotation.y, f = new Vector3(Math.sin(yaw), 0, Math.cos(yaw)), r = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const mix = (a: number, b: number, c: number) => new Vector3(f.x * a + r.x * c, b, f.z * a + r.z * c).normalize();
    let dir: Vector3 | null = null;
    if (this.strike > 0) {
      const k = 1 - this.strike, slap = this.weapon === 'hand', lob = this.weapon === 'lube';
      const A = slap ? mix(-.15, .3, .95) : lob ? mix(-.5, .2, .4) : mix(-.4, .9, .3), B = slap ? mix(.8, .1, -.55) : lob ? mix(.8, .55, 0) : mix(.85, -.4, -.12);
      let wgt = 1;
      if (k < .36) { dir = A; wgt = Math.min(1, k / .2); }
      else if (k < .56) dir = Vector3.SlerpToRef(A, B, (k - .36) / .2, new Vector3());
      else { dir = B; wgt = 1 - (k - .56) / .44; }
      this.aim(arm.up, arm.fore, dir, wgt); this.aim(arm.fore, arm.hand, dir, wgt);
    }
    if (!show) return;
    arm.hand.computeWorldMatrix(true);
    this.held.position.copyFrom(arm.hand.getAbsolutePosition());
    // Waffe verlängert den Unterarm; in Ruhe zeigt sie schräg nach oben vorn. Nach dem Treffer wackelt sie nach.
    const rest = mix(.5, .85, .05), axis = dir ? Vector3.LerpToRef(rest, dir, Math.min(1, this.strike * 3), new Vector3()).normalize() : rest;
    if (this.wob > 0) { const s = Math.sin(this.wob * 28) * this.wob * (this.weapon === 'dildo' ? .5 : .28); axis.addInPlace(r.scale(s)).normalize(); }
    this.held.rotationQuaternion = Quaternion.FromUnitVectorsToRef(UP, axis, this.held.rotationQuaternion || new Quaternion());
  }

  /** Gleitgel-Pfütze auf den Boden */
  private puddle(x: number, z: number) {
    const m = ring(this.scene, 0, 1, 28); m.material = this.puddleM; m.position.set(x, .035, z); m.scaling.setAll(.2); m.isPickable = false;
    this.puddles.push({ m, x, z, t: 30, hit: new Set() });
    sfx('pour'); toast('💧 Gleitgel verteilt – Vorsicht, rutschig!');
    if (this.puddles.length > 6) this.puddles.shift()!.m.dispose();
  }

  /** Zu Boden gehen ohne Fahndung (Rangelei bei einer Anfeindung, Nothilfe) */
  floor(a: Actor, name: string, line: string, from: Vector3) { this.knock(a, 'walker', name, line, Math.atan2(a.root.position.x - from.x, a.root.position.z - from.z)); }
  /** Umfallen (ausgerutscht oder umgehauen), steht nach ein paar Sekunden wieder auf */
  private knock(a: Actor, kind: string, name: string, line: string, dir: number, vx = 0, vz = 0) {
    this.stagger.delete(a);
    this.bodies.set(a, { a, down: 3.2, up: 0, kind, name, vx, vz });
    a.root.rotation.y = dir + Math.PI; // fällt nach hinten, weg von dir
    const n = this.city.street.people.find((q) => q.a === a); if (n) n.down = true;
    toast(`${name}: „${line}“`);
  }

  /** Vergehen: sofort gemeldet, wenn eine Streife es sieht (oder schon gefahndet wird). Sonst zählt nur, wer es gesehen hat:
      die nächste Person in der Nähe greift zum Handy – wer sie rechtzeitig beruhigt, kommt davon. Ohne Zeug*innen keine Fahndung. */
  crime(law: Law, at: Vector3) {
    if (this.copNear(at, SEE) || this.wanted.stars > 0) { this.report(law); return; }
    if (this.call) return;
    const w = this.city.street.witness(at, 22);
    if (!w) return;
    this.call = { n: w, t: 4.5, law }; w.wait = 8; w.a.play('phone');
    toast(`👀 ${w.name} hat alles gesehen und greift zum Handy … schnell hin und beruhigen!`, 3000);
  }
  /** laufender Anruf bei der Polizei */
  private call: { n: StreetNpc; t: number; law: Law } | null = null;
  /** Täterbeschreibung, die die Polizei hat: Outfit und Fahrzeug (null = zu Fuß) */
  desc: { outfit: string; car: object | null; carName: string } | null = null;
  private report(law: Law) {
    const first = this.wanted.stars === 0, more = this.wanted.add(law);
    if (first || !this.desc) this.describe();
    if (more) { sfx('siren'); this.g.hud.banner(`${'★'.repeat(this.wanted.stars)} Fahndung`, LAWS[law].name, 'bad', 2600); this.tip(); }
  }
  /** Beschreibung auf den aktuellen Stand bringen (Streife sieht dich gerade) */
  private describe() { const r = this.city.ride; this.desc = { outfit: String(this.save.flags.outfit || 'clothed'), car: r?.o || null, carName: r ? r.name : '' }; }
  /** Wie viel passt nicht mehr zur Beschreibung (0–2): anderes Outfit, anderes Fahrzeug */
  disguise() {
    const d = this.desc; if (!d) return 0;
    const r = this.city.ride;
    return (String(this.save.flags.outfit || 'clothed') !== d.outfit ? 1 : 0) + ((r?.o || null) !== d.car ? 1 : 0);
  }
  /** Text fürs HUD: was die Polizei über dich weiß */
  descText() {
    const d = this.desc; if (!d) return '';
    const o: Record<string, string> = { clothed: 'Alltagskleidung', shirtless: 'oberkörperfrei', swim: 'Badesachen', harness: 'Harness', underwear: 'Unterwäsche' };
    return `Gesucht: Person in ${o[d.outfit] || d.outfit}${d.car ? ' · im ' + d.carName : ' · zu Fuß'}`;
  }

  /** Story: Fahndung setzen (Akt V, falsche Anzeige) */
  force(n: number, law: Law) { this.wanted.force(n, law); sfx('siren'); this.g.hud.banner(`${'★'.repeat(this.wanted.stars)} Fahndung`, LAWS[law].name, 'bad', 3200); this.tip(); }
  /** einmal erklären, wie man entkommt */
  private tip() { const f = this.save.flags; if (f.fluchtTip) return; f.fluchtTip = true; setTimeout(() => toast('🫥 Zu Fuß: in ein Versteck (Radar) · 🎨 Im Auto: bei Rosi in der Hochstadt umlackieren · Oder lange außer Sicht bleiben'), 2800); }

  copNear(p: Vector3, r: number) {
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
    this.now = t;
    this.strike = Math.max(0, this.strike - dt / .5);
    if (this.impact && this.strike < .56) { const f = this.impact; this.impact = null; f(); }
    this.wob = Math.max(0, this.wob - dt * 2.4);
    const show = !this.city.driving && this.weapon !== 'hand' && this.city.mode === 'play';
    // Taumeln nach einem Treffer
    for (const [a, q] of this.stagger) {
      q.t -= dt; const r = a.root;
      r.position.x += q.vx * dt; r.position.z += q.vz * dt; this.city.world.collide(r.position, .4);
      r.rotation.x = -Math.sin(Math.max(0, q.t) / .38 * Math.PI) * .32;
      if (q.t <= 0) { r.rotation.x = 0; this.stagger.delete(a); const n = this.city.street.people.find((x) => x.a === a); if (n && !this.bodies.get(a)) n.down = false; }
    }
    // Funken fliegen auseinander und fallen
    for (const q of this.sparks) { if (q.t <= 0) continue; q.t -= dt; q.vy -= 9 * dt; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt; q.m.scaling.setAll(Math.max(.1, q.t * 2)); if (q.t <= 0) q.m.setEnabled(false); }
    // geworfene Gleitgel-Flasche: Bogen, dann Pfütze
    if (this.bottle) {
      const b = this.bottle; b.t += dt / .5; const k = Math.min(1, b.t);
      b.m.position.set(b.from.x + (b.to.x - b.from.x) * k, b.from.y + (b.to.y - b.from.y) * k + Math.sin(k * Math.PI) * 1.3, b.from.z + (b.to.z - b.from.z) * k);
      b.m.rotation.x += dt * 14;
      if (k >= 1) { b.m.dispose(); this.bottle = null; sfx('splash'); this.puddle(b.to.x, b.to.z); }
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
      if (b.down > 2.85) { r.position.x += b.vx * dt; r.position.z += b.vz * dt; this.city.world.collide(r.position, .4); }
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
    // Zeug*in am Telefon: hingehen beruhigt, sonst ist die Polizei informiert
    if (this.call) {
      const c = this.call, q = c.n.a.root.position; c.t -= dt;
      c.n.a.root.rotation.y = Math.atan2(p.x - q.x, p.z - q.z); if (c.n.a.anim !== 'phone') c.n.a.play('phone');
      if (!this.city.driving && Vector3.Distance(q, p) < 2.8) { this.call = null; c.n.wait = 1; c.n.a.play('idle'); sfx('ok'); toast(`🤫 ${c.n.name}: „Na gut … ich leg auf. War ja nichts Schlimmes.“`, 2600); }
      else if (c.t <= 0 || c.n.flee) { this.call = null; c.n.a.play('idle'); toast(`📱 ${c.n.name} hat dich bei der Polizei gemeldet!`, 2600); this.report(c.law); }
    }
    const fl = this.flucht.update(dt, stars, p);
    if (fl.caught && this.arrestT <= 0) { this.arrest(); return; }
    // passt nicht mehr zur Beschreibung (umgezogen, anderer Wagen): Streifen erkennen dich erst aus der Nähe
    const dis = stars ? this.disguise() : 0;
    const see = this.flucht.see(SEE) * (1 - dis * .35);
    let seen = fl.seen && dis < 2;
    for (const c of [...this.cops, ...this.extra]) {
      const a = c.a, r = a.root;
      if (!r.isEnabled() || (c.n && !r.visible && !stars)) { if (c.n) c.n.chase = false; continue; }
      if (c.extra) a.update(dt);
      if (this.bodies.get(a)) continue;
      if (!stars) { if (c.n) c.n.chase = false; continue; }
      const dx = p.x - r.position.x, dz = p.z - r.position.z, d = Math.hypot(dx, dz);
      if (d < see) { seen = true; if (dis) this.describe(); }
      if (d > 60 && !c.extra) { if (c.n) c.n.chase = false; continue; }
      // im Versteck: die Streife sucht, statt dir nachzulaufen
      if (this.flucht.hidden && d > see) { if (a.anim !== 'idle') a.play('idle'); continue; }
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
      const r = this.wanted.tick(dt, seen, this.flucht.fast() * (1 + dis));
      if (r === 'lost') { sfx('win'); this.g.hud.banner('Abgehängt! ✨', 'Die Polizei hat deine Spur verloren.', 'good', 3000); this.home(); }
    }
    if (!this.wanted.stars) this.desc = null;
    this.g.hud.wanted(this.wanted.stars, !seen && this.wanted.stars > 0, this.wanted.stars ? this.descText() + (dis ? ' · 🕶️ passt nicht mehr' : '') : '');
    void t;
  }

  /** Streife zurück auf ihre Runde */
  home() { this.flucht.clear(); for (const c of this.cops) { if (c.n) c.n.chase = false; } for (const c of this.extra) c.a.root.setEnabled(false); }

  private arrest() {
    const s = this.save;
    this.arrestT = 5;
    const fine = Math.round(this.wanted.arrest(s.money) * (crewHas(s, 'recht') ? .5 : 1));
    this.flucht.clear();
    this.city.leaveCar();
    sfx('siren');
    this.g.fade(() => {
      s.money -= fine;
      this.g.pass(120);
      this.city.player.root.position.set(4.4, .1, -20); this.city.player.root.rotation.y = -Math.PI / 2;
      for (const c of this.cops) { if (c.n) { c.n.chase = false; c.a.root.position.set(c.home[0], .1, c.home[1]); } }
      for (const c of this.extra) c.a.root.setEnabled(false);
      this.g.save.write(); this.city.refreshHud();
      this.g.hud.banner('🚓 Festgenommen', `${fine} € Bußgeld und zwei Stunden Papierkram auf der Wache.${crewHas(s, 'recht') ? ' Lena hat geredet: halbes Bußgeld.' : ''}`, 'bad', 4200);
    });
  }
}
