/* Tuning in 3D: Felgen, Unterboden-Neon, Hydraulik, Soundanlage und Extras an jedem Auto (KayKit und Kenney), dazu die
   Show „Aufgemotzt!“ vor der Garage Schraubenschlüssel: Rostlaube ansehen, Teile nach Kundenwunsch wählen, Plane drüber,
   Enthüllung mit Reaktion, Übergabefahrt quer durch die Stadt. Daten und Wertung in tuning.ts.
   Leistung: wenige einfache Meshes je Auto, Materialien geteilt, im Bild-Takt nur Positionen/Drehungen und Materialtausch. */
import { Vector3, TransformNode, Mesh, type Node3, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast, type Item } from '../ui/ui';
import { PARTS, SLOTS, STOCK, part, spent, clientFor, finishShow, episode, type Pimp, type Slot, type Client } from './tuning';
import { carDef, GARAGE } from './vehicles';
import type { Parked, StreetNpc } from './Street';
import type { CityScene } from './CityScene';
import type { Game } from './Game';

/* ---------- geteilte Materialien je Szene ---------- */
interface Mats { chrome: PBRMaterial; gold: PBRMaterial; rainbow: PBRMaterial; sport: PBRMaterial; neon: Record<string, PBRMaterial>; cycle: PBRMaterial[]; rust: PBRMaterial; tarp: PBRMaterial; pearl: PBRMaterial; mirror: PBRMaterial; pink: PBRMaterial; flag: PBRMaterial; sub: PBRMaterial }
const MATS = new WeakMap<Scene, Mats>();
const RB = ['#ff2a55', '#ff8c1a', '#ffe14a', '#3ee69a', '#38b6ff', '#a45cff'];
function mats(sc: Scene): Mats {
  let m = MATS.get(sc); if (m) return m;
  // weicher Lichtfleck für das Neon unter dem Auto (Mitte hell, Rand durchsichtig)
  const spot = canvasTex(sc, 128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.55, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }, true);
  const neon = (c: string) => glow(sc, c, 1.7, { tex: spot, add: true, alpha: .9 });
  const wheel = canvasTex(sc, 128, 128, (g) => { RB.forEach((c, i) => { g.beginPath(); g.moveTo(64, 64); g.arc(64, 64, 64, i / 6 * Math.PI * 2, (i + 1) / 6 * Math.PI * 2); g.fillStyle = c; g.fill(); }); g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 14, 0, Math.PI * 2); g.fill(); });
  const flagT = canvasTex(sc, 64, 48, (g) => RB.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 8, 64, 8); }));
  m = {
    chrome: pbr(sc, 0xe8eef6, .15, .7, { emissive: 0x9aa8bb, ei: .45 }), gold: pbr(sc, 0xffc93b, .25, .7, { emissive: 0xffa800, ei: .55 }), sport: pbr(sc, 0x22252b, .35, .8, { emissive: 0xff2a55, ei: .15 }),
    rainbow: glow(sc, '#ffffff', 1, { tex: wheel }),
    neon: { pink: neon('#ff3fb0'), tuerkis: neon('#2ef0ff') }, cycle: RB.map(neon),
    rust: pbr(sc, 0x7a4524, 1), tarp: pbr(sc, 0xd43c8c, .9, 0, { emissive: 0x3a0a22, ei: .4 }), pearl: pbr(sc, 0xfff4fb, .25, .2, { emissive: 0xffb6e6, ei: .35 }),
    mirror: pbr(sc, 0xdfe6ef, .05, 1, { emissive: 0x8fb8ff, ei: .25 }), pink: pbr(sc, 0xff5fc1, .5), flag: glow(sc, '#ffffff', 1, { tex: flagT, double: true }), sub: pbr(sc, 0x18181c, .6),
  };
  MATS.set(sc, m); return m;
}

/* ---------- Maße eines Autos in seinem eigenen Raum ---------- */
interface Fit { w: number; l: number; h: number; y0: number; /** Außenkante der Karosserie (ohne Spiegel) */ side: number; wheels: Array<{ x: number; y: number; z: number; r: number; /** Außenkante des Reifens */ ox: number }> }
function measure(o: TransformNode): Fit {
  const pos = o.position.clone(), rot = o.rotation.clone();
  o.position.setAll(0); o.rotation.setAll(0); o.computeWorldMatrix(true);
  const meshes = o.getChildMeshes(false); meshes.forEach((m) => m.computeWorldMatrix(true));
  const { min, max } = o.getHierarchyBoundingVectors(true);
  const base = o.parent ? (o.parent as TransformNode).getAbsolutePosition?.() || Vector3.Zero() : Vector3.Zero();
  const wheels: Fit['wheels'] = [];
  for (const m of meshes) {
    if (!/wheel/i.test(m.name) && !/wheel/i.test(m.parent?.name || '')) continue;
    if (/wheel-back$/i.test(m.name) || /wheel-back$/i.test(m.parent?.name || '')) continue;   // Ersatzrad am Heck (Kenney-SUV)
    const b = m.getBoundingInfo().boundingBox, c = b.centerWorld, r = (b.maximumWorld.y - b.minimumWorld.y) / 2;
    if (r < .05) continue;
    if (!wheels.some((q) => Math.abs(q.x - c.x + base.x) < .1 && Math.abs(q.z - c.z + base.z) < .1)) wheels.push({ x: c.x - base.x, y: c.y - base.y, z: c.z - base.z, r, ox: (c.x - base.x >= 0 ? b.maximumWorld.x : b.minimumWorld.x) - base.x });
  }
  o.position.copyFrom(pos); o.rotation.copyFrom(rot); o.computeWorldMatrix(true);
  const f: Fit = { w: max.x - min.x, l: max.z - min.z, h: max.y - base.y, y0: min.y - base.y, side: (max.x - min.x) / 2, wheels };
  if (wheels.length < 4) {
    // ohne benannte Räder: aus den Maßen schätzen
    const r = Math.min(.36, Math.max(.2, f.h * .2)); wheels.length = 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheels.push({ x: sx * (f.w / 2 - .12), y: r, z: sz * f.l * .32, r, ox: sx * (f.w / 2 - .04) });
  }
  f.side = Math.min(f.side, Math.max(...wheels.map((q) => Math.abs(q.ox))) + .02);
  return f;
}

/* ---------- Ausbau an einem Auto ---------- */
export class PimpRig {
  /** Karosserie (alle Teile des Autos hängen daran, damit die Hydraulik alles anhebt) */
  readonly body: TransformNode;
  private parts: Mesh[] = [];
  private rust: Mesh[] = [];
  private neon: Mesh | null = null;
  private ball: Mesh | null = null;
  private orgel: Mesh | null = null;
  private hopT = 0;
  private hopN = 0;
  private cyc = 0;
  readonly fit: Fit;
  constructor(private sc: Scene, readonly o: TransformNode, public pimp: Pimp, wreck = false) {
    this.fit = measure(o);
    this.body = new TransformNode('pimpBody', sc); this.body.parent = o;
    for (const ch of o.getChildren()) if (ch !== this.body && ch instanceof TransformNode) ch.parent = this.body;
    this.build();
    if (wreck) this.addRust();
  }
  private add(m: Mesh, mat: PBRMaterial) { m.material = mat; m.parent = this.body; m.isPickable = false; this.parts.push(m); return m; }
  private build() {
    const M = mats(this.sc), f = this.fit, p = this.pimp;
    // Felgen: Zierscheiben außen auf jedem Rad
    const rim = p.rim === 'chrom' ? M.chrome : p.rim === 'gold' ? M.gold : p.rim === 'bunt' ? M.rainbow : p.rim === 'sport' ? M.sport : null;
    if (rim) for (const w of f.wheels) {
      const side = Math.sign(w.x) || 1, d = this.add(cyl(this.sc, w.r * .78, w.r * .78, .05, 18), rim);
      d.rotation.z = Math.PI / 2; d.position.set(w.ox + side * .02, w.y, w.z);
      if (p.rim !== 'bunt') { const hub = this.add(cyl(this.sc, w.r * .25, w.r * .25, .07, 10), M.chrome); hub.rotation.z = Math.PI / 2; hub.position.copyFrom(d.position); hub.position.x += side * .02; }
    }
    // Unterboden-Neon: Lichtfleck auf dem Asphalt
    if (p.neon !== 'aus') {
      const n = (this.neon = this.add(planeZ(this.sc, f.side * 2 + 1.6, f.l + 1.2, true), p.neon === 'regenbogen' ? M.cycle[0] : M.neon[p.neon]));
      n.rotation.x = Math.PI / 2; n.position.y = .035;
    }
    // Soundanlage: Bass-Kiste im Kofferraum, die Disco-Variante blinkt durchs Heckfenster
    if (p.sound !== 'radio') {
      const sb = this.add(cyl(this.sc, .2, .2, .12, 16), M.sub); sb.rotation.x = Math.PI / 2; sb.position.set(0, f.h * .62, -f.l / 2 + .45);
      const cone = this.add(cyl(this.sc, .13, .13, .02, 16), p.sound === 'hifi' ? M.gold : M.chrome); cone.rotation.x = Math.PI / 2; cone.position.set(0, f.h * .62, -f.l / 2 + .38);
      if (p.sound === 'disco') { this.orgel = this.add(sphere(this.sc, .09, 8), M.cycle[0]); this.orgel.position.set(0, f.h * .8, -f.l / 2 + .5); }
    }
    // Extras
    const roof = f.h;
    if (p.extra === 'kugel') { const b = (this.ball = this.add(sphere(this.sc, .26, 14), M.mirror)); b.position.set(0, roof + .3, -.1); const st = this.add(cyl(this.sc, .02, .02, .12, 6), M.chrome); st.position.set(0, roof + .05, -.1); }
    if (p.extra === 'fluegel') {
      const wg = this.add(box(this.sc, f.side * 1.72, .05, .34), p.paint === 'gold' ? M.gold : M.pink); wg.position.set(0, roof * .86 + .22, -f.l / 2 + .25);
      for (const sx of [-1, 1]) { const post = this.add(box(this.sc, .05, .24, .06), M.chrome); post.position.set(sx * f.side * .6, roof * .86 + .1, -f.l / 2 + .28); }
      for (const sx of [-1, 1]) { const boa = this.add(sphere(this.sc, .09, 8), M.pink); boa.scaling.set(1, .7, 2); boa.position.set(sx * f.side * .86, roof * .86 + .22, -f.l / 2 + .25); }
    }
    if (p.extra === 'horn') { const h = this.add(cyl(this.sc, 0, .08, .55, 10), M.pearl); h.rotation.x = Math.PI / 2 - .55; h.position.set(0, f.h * .62 + .12, f.l / 2 - .45); }
    if (p.extra === 'krone') {
      const c = this.add(cyl(this.sc, .26, .2, .14, 14, false), M.gold); c.position.set(0, roof + .09, -.1);
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, j = this.add(sphere(this.sc, .045, 6), i % 2 ? M.pink : M.mirror); j.position.set(Math.sin(a) * .25, roof + .2, -.1 + Math.cos(a) * .25); }
    }
    if (p.extra === 'flagge') {
      const pole = this.add(cyl(this.sc, .015, .015, .9, 6), M.chrome); pole.position.set(f.side * .64, f.h * .55 + .45, -f.l / 2 + .2);
      const fl = this.add(planeZ(this.sc, .5, .36, true), M.flag); fl.rotation.y = Math.PI / 2; fl.position.set(f.side * .64, f.h * .55 + .72, -f.l / 2 - .05);
    }
    this.body.position.y = p.hyd === 'tief' ? -.07 : 0;
  }
  /** Rostlaube: braune Flecken und eine schiefe Stoßstange */
  private addRust() {
    const M = mats(this.sc), f = this.fit;
    const spots: Array<[number, number, number, number, number]> = [[1, .35, .25, .5, .32], [-1, .32, -.3, .42, .28], [1, .55, -.55, .3, .22], [-1, .5, .5, .34, .2]];
    for (const [sx, y, z, w, h] of spots) { const r = box(this.sc, .03, h * f.h, w * f.l * .5); r.position.set(sx * (f.side - .01), y * f.h, z * f.l); r.material = M.rust; r.parent = this.body; r.isPickable = false; this.rust.push(r); }
    const bump = box(this.sc, f.side * 1.5, .12, .08); bump.position.set(0, f.h * .2, f.l / 2 + .02); bump.rotation.z = .18; bump.material = M.rust; bump.parent = this.body; bump.isPickable = false; this.rust.push(bump);
  }
  unwreck() { for (const r of this.rust) r.dispose(); this.rust = []; }
  /** Umbau tauschen (Show-Vorschau, Werkstatt) */
  set(p: Pimp) { for (const m of this.parts) m.dispose(); this.parts = []; this.neon = this.ball = this.orgel = null; this.pimp = { ...p }; this.build(); }
  /** Hupe: Hydraulik hüpft (Twerk: vorne/hinten im Wechsel) */
  hop() { if (this.pimp.hyd === 'huepf' || this.pimp.hyd === 'twerk') { this.hopT = .55; this.hopN++; sfx('boing'); } }
  get hydraulic() { return this.pimp.hyd === 'huepf' || this.pimp.hyd === 'twerk'; }
  update(dt: number, t: number, v = 0) {
    const p = this.pimp;
    if (this.neon && p.neon === 'regenbogen') { this.cyc += dt; if (this.cyc > .22) { this.cyc = 0; const M = mats(this.sc), i = (M.cycle.indexOf(this.neon.material as PBRMaterial) + 1) % M.cycle.length; this.neon.material = M.cycle[i]; } }
    if (this.orgel && Math.floor(t * 6) !== Math.floor((t - dt) * 6)) { const M = mats(this.sc); this.orgel.material = M.cycle[Math.floor(t * 6) % M.cycle.length]; }
    if (this.ball) this.ball.rotation.y += dt * 1.8;
    // Hydraulik: Sprung mit Nachfedern
    const base = p.hyd === 'tief' ? -.07 : 0;
    if (this.hopT > 0) {
      this.hopT = Math.max(0, this.hopT - dt); const k = Math.sin((1 - this.hopT / .55) * Math.PI);
      if (p.hyd === 'twerk') { this.body.rotation.x = (this.hopN % 2 ? 1 : -1) * k * .22; this.body.position.y = base + k * .25; }
      else { this.body.position.y = base + k * .7; this.body.rotation.x = -k * .08; }
    } else { this.body.position.y += (base - this.body.position.y) * Math.min(1, dt * 10); this.body.rotation.x *= Math.max(0, 1 - dt * 10); }
    // Bass: die Karosserie pumpt im Takt (leicht, auch im Stand)
    if (p.sound === 'bass' || p.sound === 'disco') { const k = Math.max(0, Math.sin(t * 13)) ** 4 * (Math.abs(v) < 4 ? .025 : .012); this.body.scaling.set(1 + k * .4, 1 + k, 1 + k * .4); }
  }
  dispose() { for (const m of this.parts) m.dispose(); for (const r of this.rust) r.dispose(); this.parts = []; this.rust = []; }
}
/** Ausbau eines Autos (für Fahren und Hupen in CityScene) */
export const rigOf = new WeakMap<TransformNode, PimpRig>();
export function dress(sc: Scene, o: TransformNode, p: Pimp, wreck = false) {
  const old = rigOf.get(o); if (old) { old.set(p); return old; }
  const r = new PimpRig(sc, o, p, wreck); rigOf.set(o, r); return r;
}

/* ---------- Werkstatt für den eigenen Wagen ---------- */
export function workshopItems(cur: Pimp, slot: Slot, money: number, pick: (id: string) => void): Item[] {
  return PARTS[slot].map((q) => ({ icon: q.icon, label: cur[slot] === q.id ? `${q.name} ✓` : q.name, sub: cur[slot] === q.id ? 'eingebaut' : q.cost ? `${q.cost} €${money < q.cost ? ' · zu teuer' : ''}` : 'kostenlos', disabled: cur[slot] === q.id, fn: () => pick(q.id) }));
}

/* ---------- Show „Aufgemotzt!“ ---------- */
const HOST = { who: 'Meisterin Rosi', color: '#ffd23b' };
export class TuneShow {
  active = false;
  private car: Node3 | null = null;
  private rig: PimpRig | null = null;
  private tarp: Mesh | null = null;
  private guest: StreetNpc | null = null;
  private hidden: Parked[] = [];
  private a = 0;
  private camDist = 7.5;
  private lift = -1;
  private pimp: Pimp = { ...STOCK };
  private c!: Client;
  constructor(private g: Game, private city: CityScene) {}
  /** Bühne vor der Garage (Ausfahrt) */
  private get at() { return new Vector3(GARAGE.spawn[0], .1, GARAGE.spawn[1] + 4.5); }

  async start() {
    if (this.active) return;
    const g = this.g, city = this.city, s = g.save.data, c = (this.c = clientFor(s)), at = this.at;
    this.active = true; this.pimp = { ...STOCK }; this.lift = -1; this.a = .6;
    g.closeMenu(); g.touch.show(false); city.leaveCar();
    // Autos auf der Bühne kurz wegräumen
    this.hidden = city.street.parked.filter((p) => Vector3.Distance(p.o.position, at) < 6 && p.o.isEnabled());
    for (const p of this.hidden) p.o.setEnabled(false);
    const o = (this.car = await city.world.car(carDef(c.car).file));
    o.position.copyFrom(at); o.rotation.y = .5;
    this.rig = dress(city.scene, o, this.pimp, true);
    // Kundschaft: eine Passant*in von weit weg leiht sich die Rolle
    const p = city.player.root.position;
    this.guest = city.street.people.find((n) => n.kind === 'walker' && !n.talking && !n.away && !n.down && !n.chase && Vector3.Distance(n.a.root.position, p) > 30) || null;
    if (this.guest) { this.guest.talking = true; this.guest.a.root.position.set(at.x - 2.6, .1, at.z + 1.2); this.guest.a.root.rotation.y = Math.PI / 2 + .4; this.guest.a.root.visible = true; this.guest.a.play('idle', 0); }
    city.player.root.position.set(at.x + 2.6, .1, at.z + 1.4); city.player.root.rotation.y = -Math.PI / 2 - .3; city.player.play('idle');
    city.cine = (dt) => this.cam(dt);
    sfx('open');
    g.hud.banner('🎬 Aufgemotzt!', `Folge ${episode(s) + 1} · mit Meisterin Rosi`, 'info', 3000);
    g.dialog.say([
      { ...HOST, text: 'Willkommen bei „Aufgemotzt!“, der Show, in der aus Schrott Schmuckstücke werden! Heute bei uns:' },
      { who: c.name, color: c.color, text: c.story },
      { ...HOST, text: `Und das ist dein Wagen? Ein ${c.wreck}. Puh. Was wünschst du dir?` },
      { who: c.name, color: c.color, text: c.wish },
      { ...HOST, text: `Du hast ${c.budget} € Budget. Mein Lieblingsteam schraubt los – such die Teile aus, und denk an den Wunsch!` },
    ], () => this.step(0));
  }
  private cam(dt: number) {
    const cam = this.city.camera, at = this.at;
    this.a += dt * (this.lift >= 0 ? .35 : .18);
    if (this.lift >= 0 && this.tarp) {
      // Enthüllung: Plane fliegt hoch, die Kamera rückt näher
      this.lift += dt; this.tarp.position.y += Math.max(0, this.lift - .3) * dt * 9;
      if (this.tarp.position.y > 9) { this.tarp.dispose(); this.tarp = null; }
    }
    this.camDist += ((this.lift >= 0 ? 5.6 : 7.2) - this.camDist) * Math.min(1, dt * 1.5);
    cam.position.set(at.x + Math.sin(this.a) * this.camDist, 2.3 + Math.sin(this.a * .6) * .4, at.z + Math.cos(this.a) * this.camDist);
    cam.setTarget(new Vector3(at.x, .8, at.z));
    this.rig?.update(dt, performance.now() / 1000, 0);
    if (this.rig?.hydraulic && this.lift > 2.2 && Math.floor(this.lift * 1.2) !== Math.floor((this.lift - dt) * 1.2)) this.rig.hop();
  }
  private left() { return this.c.budget - spent(this.pimp); }
  private step(i: number) {
    const g = this.g, c = this.c;
    if (i >= SLOTS.length) { this.cover(); return; }
    const sl = SLOTS[i], cur = this.pimp[sl.id];
    const items: Item[] = PARTS[sl.id].map((q) => {
      const free = this.left() + part(sl.id, cur).cost;
      return { icon: q.icon, label: q.name + (cur === q.id ? ' ✓' : ''), sub: q.cost ? `${q.cost} €${q.cost > free ? ' · über dem Budget' : ''}` : 'kostenlos', disabled: q.cost > free,
        fn: () => { this.pimp[sl.id] = q.id; this.rig?.set(this.pimp); if (sl.id === 'paint' && this.car) void this.city.world.paintCar(this.car, q.hue ?? -1); sfx(q.cost ? 'coin' : 'ok'); this.step(i + 1); } };
    });
    g.openMenu(`<div class="col"><div class="panel"><h3>🎬 ${sl.title} · ${i + 1}/${SLOTS.length}</h3><p>${sl.ask}</p><p><b>${c.name}:</b> „${c.wish}“</p><p>Budget übrig: <b>${this.left()} €</b></p><div class="slot"></div></div></div>`, items,
      () => (i > 0 ? this.step(i - 1) : this.quit()), 'title tune');
  }
  /** Plane drüber, eine Woche später … */
  private cover() {
    const g = this.g, at = this.at;
    g.closeMenu();
    g.fade(() => {
      this.rig?.unwreck();
      const f = this.rig?.fit, t = (this.tarp = box(this.city.scene, (f ? f.side * 2 : 2) + .5, (f ? f.h : 1.6) + .35, (f ? f.l : 4) + .5)); t.material = mats(this.city.scene).tarp; t.position.set(at.x, .1 + ((f ? f.h : 1.6) + .35) / 2, at.z); t.rotation.y = .5; t.isPickable = false;
      g.hud.banner('🛠️ Eine Woche später …', 'Die Plane bleibt drauf, bis alle da sind.', 'info', 2600);
    });
    setTimeout(() => g.dialog.say([{ ...HOST, text: `${this.c.name}, bist du bereit? Drei, zwei, eins … PLANE RUNTER!` }], () => this.reveal()), 1200);
  }
  private reveal() {
    const g = this.g, s = g.save.data, c = this.c;
    this.lift = 0; sfx('whoosh'); setTimeout(() => sfx('applause'), 500);
    const r = finishShow(s, c, this.pimp);
    setTimeout(() => {
      this.guest?.a.play(r.level === 'meh' ? 'idle' : r.level === 'ok' ? 'clap' : 'cheer', 0);
      this.city.player.play(r.level === 'meh' ? 'idle' : 'cheer', 0);
      g.hud.banner(`${'⭐'.repeat(r.stars)} ${r.level === 'wow' ? 'Ausraster vor Freude!' : r.level === 'ok' ? 'Zufrieden' : 'Naja …'}`, `Honorar +${r.pay} € · Ruf +${r.rep}`, r.level === 'meh' ? 'info' : 'good', 4200);
      g.save.write(); this.city.refreshHud();
      g.dialog.say([
        { who: c.name, color: c.color, text: c[r.level] },
        { ...HOST, text: r.level === 'wow' ? 'Genau dafür machen wir das hier. Taschentücher für alle!' : r.level === 'ok' ? 'Na also! Gute Arbeit, Team.' : 'Hm. Beim nächsten Mal hören wir besser zu, was gewünscht ist.' },
        { ...HOST, text: `Willst du den Wagen selbst zu ${c.to[2]} bringen? Gibt Trinkgeld.`, choices: [
          { label: '🚗 Selbst fahren', sub: 'Übergabe quer durch die Stadt', fn: () => setTimeout(() => this.deliver(), 50) },
          { label: '🙋 Rosi liefert', sub: 'Show beenden', fn: () => setTimeout(() => this.quit(), 50) }] },
      ]);
    }, 1900);
  }
  /** Fertigen Wagen ausliefern: er wird ein ganz normales Auto zum Einsteigen, Ziel per Auftrag */
  private deliver() {
    const city = this.city, c = this.c, o = this.car; if (!o) { this.quit(); return; }
    const def = carDef(c.car), car: Parked = { o, name: `${c.name}s ${def.name}`, yaw: o.rotation.y, v: 0, def };
    city.street.parked.push(car);
    this.car = null; this.rig = null;   // gehört jetzt der Stadt
    this.end();
    city.startGig({ id: 'pimp_' + c.id, who: c.name, color: c.color, title: '🎬 Übergabe', call: '', car: true, time: 150, pay: 45, rep: 1,
      steps: [{ x: c.to[0], z: c.to[1], label: `Wagen zu ${c.to[2]} bringen`, icon: '🔑' }],
      done: `${c.name}: „Er ist da! Danke, danke, danke!“`,
      after: () => { if (city.car === car) city.leaveCar(); const i = city.street.parked.indexOf(car); if (i >= 0) city.street.parked.splice(i, 1); setTimeout(() => o.dispose(), 300); } });
    toast('🔑 Steig ein und bring den Wagen hin. Hupen lässt die Hydraulik hüpfen!', 4200);
  }
  private end() {
    const city = this.city;
    if (this.guest) { const n = this.guest; n.talking = false; const [x, z] = n.path[n.wp]; n.a.root.position.set(x, .1, z); n.a.play(n.anim || 'idle', 0); this.guest = null; }
    for (const p of this.hidden) p.o.setEnabled(true); this.hidden = [];
    this.tarp?.dispose(); this.tarp = null;
    city.cine = null; this.active = false; this.g.touch.show(true); this.city.player.play('idle');
  }
  quit() {
    this.g.closeMenu();
    if (this.car) { rigOf.get(this.car)?.dispose(); this.car.dispose(); this.car = null; this.rig = null; }
    this.end();
  }
}
