/* Eine Welt jenseits der Stadt (worlds.ts): Insel mit Himmel und Meer, Gastgeber*in, Leuten, drei Aufgaben und dem
   Flitzer, einem Fluggerät zum Fahren und Fliegen. Bewegung, Kamera und Bedienung wie in der Stadt und den Häusern. */
import type { GameScene } from '../engine/Engine';
import { Vector3, HemisphericLight, DirectionalLight, Mesh, Node3, type FreeCamera, type Scene, type PBRMaterial, col } from '../engine/bjs';
import { ground, box, cyl, sphere, torus, planeZ, pbr, glow, canvasTex } from '../engine/geo';
import { Actor, playerLook, streetLook } from './Actor';
import type { Game } from './Game';
import { hints, toast } from '../ui/ui';
import { advance, change, DAY_SEC } from './life';
import { music, sfx } from '../engine/Audio';
import { RoomCam } from './room';
import { worldStage, type Kit, type WorldDef, type WorldNpc } from './worlds';

interface Folk { a: Actor; d: WorldNpc; host: boolean }
const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];

export class WorldScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .5;
  private player!: Actor;
  private folk: Folk[] = [];
  private solids: Array<{ x: number; z: number; r: number }> = [];
  private cam = new RoomCam(2000, 2000, 400, 6.5);
  private items: Array<{ m: Mesh; x: number; y: number; z: number; got: boolean }> = [];
  private rings: Array<{ m: Mesh; x: number; y: number; z: number }> = [];
  private ringOn!: PBRMaterial; private ringOff!: PBRMaterial;
  private ringAt = 0;
  private ride!: Node3;
  private riding = false;
  private alt = 0;
  private shadow!: Mesh;
  private hudT = 0;
  private gate = new Vector3();
  private pad = new Vector3();

  constructor(private g: Game, readonly def: WorldDef) {
    this.scene = g.engine.newScene(0x8fd3ff);
    this.camera = g.engine.newCamera(this.scene, 60, .1, 500);
  }
  private get flags() { return this.g.save.data.flags; }
  private get stage() { return worldStage(this.flags, this.def.id); }
  private setStage(n: number) { this.flags['w_' + this.def.id] = n; this.g.save.write(); this.showQuest(); }

  async build() {
    const sc = this.scene, d = this.def, R = d.r;
    const h = new HemisphericLight('hemi', new Vector3(0, 1, 0), sc); h.intensity = 1.05 * (d.dim ?? 1); h.diffuse = col(d.light); h.groundColor = col(0x8a7a9a);
    const sun = new DirectionalLight('sun', new Vector3(.4, -.8, -.45).normalize(), sc); sun.intensity = 1.1 * (d.dim ?? 1); sun.diffuse = col(0xfff4e0);
    // Himmel (Verlauf), Meer, Insel
    const sky = sphere(sc, 240, 16); sky.material = glow(sc, 0xffffff, 1, { double: true, tex: canvasTex(sc, 8, 256, (g2) => { const gr = g2.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, d.sky[0]); gr.addColorStop(.36, d.sky[0]); gr.addColorStop(.5, d.sky[1]); gr.addColorStop(.64, d.sky[0]); gr.addColorStop(1, d.sky[0]); g2.fillStyle = gr; g2.fillRect(0, 0, 8, 256); }) }); sky.isPickable = false;
    const sea = ground(sc, 520, 520); sea.material = pbr(sc, d.water, .15, .1); sea.position.y = -.7;
    const isle = cyl(sc, R, R + 3, 1.4, 48); isle.material = pbr(sc, d.ground, .95); isle.position.y = -.7;
    const shore = cyl(sc, R + 3, R + 7, .5, 48); shore.material = pbr(sc, 0xfff1c9, 1); shore.position.y = -.85;

    // Baukasten: gleiche Materialien werden geteilt und am Ende je Material zu einem Mesh verschmolzen (wenige Zeichenaufrufe)
    const mats = new Map<string, PBRMaterial>(), parts = new Map<PBRMaterial, Mesh[]>();
    const add = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.isPickable = false; let l = parts.get(mt); if (!l) parts.set(mt, (l = [])); l.push(m); return m; };
    let seed = [...d.id].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7) % 2147483647;
    const kit: Kit = {
      sc,
      M: (c, r = .8, mt = 0) => { const key = `m${c}/${r}/${mt}`; let m = mats.get(key); if (!m) mats.set(key, (m = pbr(sc, c, r, mt))); return m; },
      G: (c, k = 1, a) => { const key = `g${c}/${k}/${a}`; let m = mats.get(key); if (!m) mats.set(key, (m = glow(sc, c, k, a === undefined ? {} : { alpha: a }))); return m; },
      box: (w, hh, dd, m, x, y, z, ry = 0) => { const o = add(box(sc, w, hh, dd), m, x, y, z); o.rotation.y = ry; return o; },
      cyl: (rt, rb, hh, m, x, y, z, seg = 12) => add(cyl(sc, rt, rb, hh, seg), m, x, y, z),
      ball: (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = add(sphere(sc, r, 10), m, x, y, z); o.scaling.set(sx, sy, sz); return o; },
      arc: (r, tube, m, x, y, z, ry = 0) => { const o = add(torus(sc, r, tube, 28), m, x, y, z); o.rotation.set(Math.PI / 2, ry, 0); return o; },
      sign: (text, color, x, y, z, ry, w) => {
        const tex = canvasTex(sc, 512, 96, (g2) => { g2.font = '900 64px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.shadowColor = color; g2.shadowBlur = 18; g2.fillStyle = color; g2.fillText(text, 256, 50, 500); }, true);
        const m = planeZ(sc, w, w * 96 / 512); m.material = glow(sc, 0xffffff, 1.6, { tex }); m.position.set(x, y, z); m.rotation.y = ry; m.isPickable = false;
      },
      solid: (x, z, r) => { this.solids.push({ x, z, r }); },
      rnd: () => (seed = (seed * 16807) % 2147483647) / 2147483647,
    };
    d.build(kit);
    // Weltentor (zurück und weiter) und Startplatz des Flitzers am Südufer
    this.gate.set(0, 0, R - 6); this.pad.set(5, 0, R - 11);
    RAINBOW.forEach((c, i) => kit.arc(3.2 - i * .2, .12, kit.G(c, 1.1), 0, 0, R - 6));
    kit.cyl(3.6, 3.8, .16, kit.M(0xffffff, .5), 0, .08, R - 6, 24);
    kit.sign('WELTENTOR', '#ffffff', 0, 4.1, R - 6, 0, 4.6);
    kit.cyl(1.6, 1.7, .12, kit.G(0xff4fa3, .9), this.pad.x, .06, this.pad.z, 20);
    for (const [mt, list] of parts) {
      if (list.length < 2) continue;
      for (const m of list) m.computeWorldMatrix(true);
      try { const merged = Mesh.MergeMeshes(list, true, true); if (merged) { merged.material = mt; merged.isPickable = false; merged.freezeWorldMatrix(); } } catch { /* einzeln lassen */ }
    }

    // Stellen mit Wirkung: Bodenring wie in den Häusern
    { const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 }); for (const sp of d.spots || []) { const o = torus(sc, .5, .06, 24); o.material = ringM; o.position.set(sp.x, .05, sp.z); o.isPickable = false; } }
    // Sammelstücke: zwei am Boden, jedes dritte in der Luft (dafür der Flitzer)
    const im = glow(sc, d.item.color, 1.4), free = (x: number, z: number) => this.solids.every((q) => Math.hypot(q.x - x, q.z - z) > q.r + 1.2);
    for (let i = 0; i < d.item.n; i++) {
      let x = 0, z = 0;
      for (let t = 0; t < 30; t++) { const a = (i / d.item.n) * Math.PI * 2 + kit.rnd() * .6, dist = 9 + kit.rnd() * (R - 16); x = Math.sin(a) * dist; z = Math.cos(a) * dist; if (free(x, z)) break; }
      const m = cyl(sc, 0, .42, .55, 4); m.material = im; const b = cyl(sc, .42, 0, .55, 4); b.material = im; b.position.y = -.55; b.parent = m; m.isPickable = false;
      const y = i % 3 === 2 ? 6.5 + (i % 2) * 2.5 : 1.3; m.position.set(x, y, z);
      this.items.push({ m, x, y, z, got: false });
    }
    // Ringe für den Flug: einmal um die Insel, wechselnde Höhe
    this.ringOn = glow(sc, 0xffffff, 1.5); this.ringOff = glow(sc, 0xffffff, .9, { alpha: .28 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + .5, dist = R * .55, x = Math.sin(a) * dist, z = Math.cos(a) * dist, y = 5 + (i % 3) * 2.5;
      const m = torus(sc, 2.6, .2, 28); m.rotation.set(Math.PI / 2, a + Math.PI / 2, 0); m.position.set(x, y, z); m.material = this.ringOff; m.isPickable = false;
      this.rings.push({ m, x, y, z });
    }
    // Flitzer: mit 18+ ein riesiger Glitzer-Dildo, sonst eine Regenbogen-Rakete
    this.ride = new Node3('ride', sc); this.buildRide();
    this.shadow = cyl(sc, .9, .9, .02, 20); this.shadow.material = glow(sc, 0x000000, 1, { alpha: .28 }); this.shadow.isPickable = false;

    // Leute
    const all: Array<[WorldNpc, boolean]> = [[d.host, true], ...d.folk.map((f) => [f, false] as [WorldNpc, boolean])];
    const actors = await Promise.all(all.map(([n]) => Actor.create(sc, { body: n.rb, rb: n.rb, palette: 'rainbow', skin: 0 })));
    actors.forEach((a, i) => {
      const [n, host] = all[i];
      a.root.position.set(n.x, 0, n.z); a.root.rotation.y = n.yaw ?? Math.atan2(-n.x, -n.z);
      a.play(n.anim || 'idle', 0, .95); this.folk.push({ a, d: n, host }); this.solids.push({ x: n.x, z: n.z, r: .45 });
    });
    this.player = await Actor.create(sc, streetLook(playerLook(this.g.save.data)));
    this.showQuest();
  }

  private adultRide = false;
  private buildRide() {
    const sc = this.scene, adult = !!this.g.save.data.settings.adult;
    this.adultRide = adult;
    this.ride.getChildMeshes().forEach((m) => m.dispose());
    const P = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.parent = this.ride; m.isPickable = false; return m; };
    if (adult) {
      const skin = pbr(sc, 0xff4fa3, .25, .1, { emissive: 0xff2f8a, ei: .25 }), glit = glow(sc, 0xfff0fa, 1.3);
      const shaft = P(cyl(sc, .42, .46, 3.4, 20), skin, 0, 0, .2); shaft.rotation.x = Math.PI / 2;
      const tip = P(sphere(sc, .52, 14), skin, 0, 0, 2.05); tip.scaling.set(1, 1, 1.25);
      const rim = P(torus(sc, .44, .09, 20), skin, 0, 0, 1.62); rim.rotation.x = Math.PI / 2;
      for (const sx of [-1, 1]) P(sphere(sc, .52, 12), skin, sx * .42, -.12, -1.55);
      for (let i = 0; i < 14; i++) { const a = i * 2.4, z = -1.2 + (i / 14) * 3; P(sphere(sc, .05, 6), glit, Math.sin(a) * .45, Math.cos(a) * .45, z); }
    } else {
      const body = pbr(sc, 0xffffff, .3, .2), tipM = pbr(sc, 0xff4fa3, .3);
      const shaft = P(cyl(sc, .42, .42, 3, 20), body, 0, 0, 0); shaft.rotation.x = Math.PI / 2;
      const tip = P(cyl(sc, 0, .42, 1.1, 20), tipM, 0, 0, 2.05); tip.rotation.x = Math.PI / 2;
      RAINBOW.forEach((c, i) => { const r = P(torus(sc, .43, .05, 20), pbr(sc, c, .4), 0, 0, -1.1 + i * .42); r.rotation.x = Math.PI / 2; });
      for (const a of [0, 2.1, 4.2]) { const f = P(box(sc, .08, .7, .9), tipM, Math.sin(a) * .55, Math.cos(a) * .55, -1.3); f.rotation.z = -a; }
    }
    // Flamme aus Regenbogenfunken am Heck
    const fl = P(cyl(sc, .3, 0, 1.2, 12), glow(sc, 0xffd23b, 1.4, { alpha: .8 }), 0, 0, adult ? -2.5 : -2.1); fl.rotation.x = Math.PI / 2; fl.name = 'flame';
    this.ride.position.copyFrom(this.pad); this.ride.position.y = .75; this.ride.rotation.y = Math.PI;
  }

  /** Neue Figur, wenn im Kleiderschrank die Figur gewechselt wurde */
  async syncPlayer() {
    const look = streetLook(playerLook(this.g.save.data));
    if (this.player.look.body === look.body) return;
    const old = this.player;
    this.player = await Actor.create(this.scene, look);
    this.player.root.position.copyFrom(old.root.position); this.player.root.rotation.y = old.root.rotation.y;
    old.dispose();
  }

  enter() {
    const R = this.def.r, s = this.g.save.data;
    if (!!s.settings.adult !== this.adultRide) this.buildRide();
    this.riding = false; this.alt = 0;
    this.player.root.position.set(0, 0, R - 10); this.player.root.rotation.y = Math.PI;
    this.player.setLook(streetLook(playerLook(s))); this.player.play('idle');
    this.cam.dist = 6.5; this.cam.reset(0, .3);
    this.g.hud.show(true); this.g.touch.show(true); this.g.city.refreshHud(); this.g.hud.markers([]);
    this.setHints();
    music(this.def.music);
    this.g.hud.banner(`${this.def.icon} ${this.def.name}`, this.def.sub, 'info', 3600);
    this.showQuest();
  }
  private setHints() { hints(this.riding ? [['move', 'Lenken'], ['a', 'Aktion'], ['wpn', 'Absteigen'], ['cam', 'Kamera'], ['y', 'Menü']] : [['move', 'Laufen'], ['a', 'Aktion'], ['wpn', 'Flitzer rufen'], ['cam', 'Kamera'], ['y', 'Menü']]); }

  /** Sammelstücke und Ringe passend zum Stand zeigen */
  private showQuest() {
    const st = this.stage, got = Number(this.flags['w_' + this.def.id + '_n']) || 0;
    this.items.forEach((it, i) => { it.got = st !== 1 || !!(got & (1 << i)); it.m.setEnabled(!it.got); });
    this.rings.forEach((r, i) => { r.m.setEnabled(st === 2); r.m.material = i === this.ringAt ? this.ringOn : this.ringOff; });
    if (st >= 4) for (const f of this.folk) if (!f.host && f.d.anim !== 'sit') f.a.play(['dance1', 'dance2', 'dance3'][this.folk.indexOf(f) % 3] as 'dance1');
  }
  private left() { return this.items.filter((i) => !i.got).length; }

  private mount(on: boolean) {
    const p = this.player.root.position;
    if (on === this.riding) return;
    this.riding = on; sfx('open');
    if (on) { this.ride.position.set(p.x, .75, p.z); this.ride.rotation.y = this.player.root.rotation.y; this.alt = .75; this.player.play('sit'); this.cam.dist = 10; toast(`🚀 ${this.adultRide ? 'Glitzer-Dildo „Big Bertha“' : 'Regenbogen-Rakete'}: Turbo halten = steigen, loslassen = sinken.`); }
    else { p.y = 0; this.alt = 0; this.ride.position.y = .75; this.player.play('idle'); this.cam.dist = 6.5; }
    this.setHints();
  }

  private talk(f: Folk) {
    const g = this.g, s = g.save.data, d = this.def, say = (lines: string[], done?: () => void) => g.dialog.say(lines.map((text) => ({ who: f.d.name, color: f.d.color, text })), done);
    f.a.root.rotation.y = Math.atan2(this.player.root.position.x - f.a.root.position.x, this.player.root.position.z - f.a.root.position.z);
    if (!f.host) { const ls = f.d.lines || ['Hallo!']; say([ls[s.day % ls.length]]); const k = 'visit_' + f.d.name; if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 8, fun: 4 }); g.city.refreshHud(); } return; }
    const st = this.stage;
    if (st === 0) say([...d.host.intro, d.host.ask1], () => { this.setStage(1); toast(`${d.item.icon} Aufgabe: ${d.item.n} ${d.item.name} sammeln`); });
    else if (st === 1) say([d.host.ask1, `Es fehlen noch ${this.left()}.`]);
    else if (st === 2) say([d.host.ask2]);
    else if (st === 3) say(d.host.finale, () => { s.money += d.pay[2]; change(s, { fun: 30, social: 20 }); sfx('win'); this.setStage(4); g.hud.banner(`${d.icon} ${d.name} geschafft!`, `+${d.pay[2]} € · Die Insel feiert dich.`, 'good', 5000); g.city.refreshHud(); });
    else say([d.host.after[s.day % d.host.after.length]]);
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position, d = this.def, R = d.r;
    this.player.update(dt);
    for (const f of this.folk) f.a.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
    for (const it of this.items) if (!it.got) { it.m.rotation.y = t * 1.6; it.m.position.y = it.y + Math.sin(t * 2 + it.x) * .18; }
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my), sprint = inp.held('sprint');
      const speed = this.riding ? 13 : sprint ? 6.6 : 3.8;
      if (mag > .08) {
        const [dx, dz] = this.cam.dir(mx, my), sp = speed * dt * Math.min(1, mag) / mag;
        p.x += dx * sp; p.z += dz * sp;
        let dr = Math.atan2(dx, dz) - this.player.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); this.player.root.rotation.y += dr * Math.min(1, dt * (this.riding ? 5 : 14));
        if (!this.riding) this.player.play(sprint ? 'run' : 'walk', .18, sprint ? 1.2 : 1.9);
      } else if (!this.riding && (this.player.anim === 'walk' || this.player.anim === 'run')) this.player.play('idle');
      // Rand: zu Fuß bleibt man auf der Insel, im Flug geht es ein Stück aufs Meer hinaus
      const lim = this.riding ? R + 22 : R - 1.2, dist = Math.hypot(p.x, p.z);
      if (dist > lim) { p.x *= lim / dist; p.z *= lim / dist; }
      if (this.riding) {
        this.alt = Math.max(.75, Math.min(18, this.alt + (sprint ? 6 : -4.5) * dt));
        if (Math.hypot(p.x, p.z) > R - 1) this.alt = Math.max(this.alt, 1.6);   // über dem Wasser nicht eintauchen
      }
      if (!this.riding || this.alt < 3) for (const q of this.solids) { const ddx = p.x - q.x, ddz = p.z - q.z, m = q.r + (this.riding ? .9 : .35), dd = Math.hypot(ddx, ddz); if (dd < m && dd > 0) { p.x = q.x + ddx / dd * m; p.z = q.z + ddz / dd * m; } }
      // Sammeln und Ringe
      const st = this.stage, py = this.riding ? this.alt : 1;
      if (st === 1) for (const [i, it] of this.items.entries()) {
        if (it.got || Math.hypot(it.x - p.x, it.z - p.z) > 1.7 || Math.abs(it.y - py) > 2.2) continue;
        it.got = true; it.m.setEnabled(false); sfx('coin');
        this.flags['w_' + d.id + '_n'] = (Number(this.flags['w_' + d.id + '_n']) || 0) | (1 << i);
        const left = this.left();
        if (left) toast(`${d.item.icon} ${d.item.n - left}/${d.item.n} ${d.item.name}`);
        else { sv.money += d.pay[0]; sfx('win'); this.ringAt = 0; this.setStage(2); g.hud.banner(`${d.item.icon} Alle ${d.item.name} gefunden!`, `+${d.pay[0]} € · Nächste Aufgabe: durch die Ringe fliegen`, 'good', 4500); g.city.refreshHud(); }
      }
      if (st === 2) { const r = this.rings[this.ringAt]; if (r && Math.hypot(r.x - p.x, r.z - p.z) < 2.6 && Math.abs(r.y - py) < 2.4) {
        this.ringAt++; sfx('ok');
        if (this.ringAt >= this.rings.length) { sv.money += d.pay[1]; sfx('win'); this.setStage(3); g.hud.banner('🌈 Alle Ringe geschafft!', `+${d.pay[1]} € · Zurück zu ${d.host.name}`, 'good', 4500); g.city.refreshHud(); }
        else { toast(`🌈 Ring ${this.ringAt}/${this.rings.length}`); this.showQuest(); }
      } }
      // Was ist in Reichweite?
      let label: string | null = null, act: (() => void) | null = null, bd = 9;
      if (!this.riding || this.alt < 1.5) {
        for (const f of this.folk) { const dd = Math.hypot(f.a.root.position.x - p.x, f.a.root.position.z - p.z); if (dd < 2.4 && dd < bd) { bd = dd; label = (f.host ? '⭐ ' : '💬 ') + f.d.name; act = () => this.talk(f); } }
        if (!label && !this.riding) for (const sp of d.spots || []) { if (Math.hypot(sp.x - p.x, sp.z - p.z) < (sp.r || 2)) { label = sp.label; act = () => g.interiorAct(sp); break; } }
        if (!label && Math.hypot(this.gate.x - p.x, this.gate.z - p.z) < 3.4) { label = '🌈 Weltentor: weiterreisen'; act = () => g.worldMenu(); }
        if (!label && !this.riding && Math.hypot(this.ride.position.x - p.x, this.ride.position.z - p.z) < 2.6) { label = `🚀 Aufsteigen: ${this.adultRide ? 'Glitzer-Dildo' : 'Regenbogen-Rakete'}`; act = () => this.mount(true); }
      }
      g.hud.prompt(label); g.touch.label(label ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && act) { inp.consume('confirm'); act(); }
      else if (inp.pressed('weapon')) { inp.consume('weapon'); this.mount(!this.riding); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.worldMenu(); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      // Wegweiser
      const mk: Array<{ id: string; icon: string; label?: string; pos: Vector3 }> = [];
      const hostPos = this.folk[0]?.a.root.position;
      if ((st === 0 || st === 3) && hostPos) mk.push({ id: 'host', icon: '⭐', label: d.host.name, pos: new Vector3(hostPos.x, 2.2, hostPos.z) });
      if (st === 1) { let best: typeof this.items[0] | null = null, b = 1e9; for (const it of this.items) { const dd = Math.hypot(it.x - p.x, it.z - p.z); if (!it.got && dd < b) { b = dd; best = it; } } if (best) mk.push({ id: 'item', icon: d.item.icon, label: best.y > 3 ? 'in der Luft' : undefined, pos: new Vector3(best.x, best.y + .6, best.z) }); }
      if (st === 2 && this.rings[this.ringAt]) { const r = this.rings[this.ringAt]; mk.push({ id: 'ring', icon: '🌈', label: `Ring ${this.ringAt + 1}`, pos: new Vector3(r.x, r.y, r.z) }); }
      if (Math.hypot(this.gate.x - p.x, this.gate.z - p.z) > 12) mk.push({ id: 'gate', icon: '🌀', label: 'Weltentor', pos: new Vector3(this.gate.x, 3, this.gate.z) });
      g.hud.markers(mk, (q) => g.engine.project(q));
    } else { g.hud.prompt(null); g.hud.markers([]); }
    // Flitzer und Figur
    if (this.riding) {
      const bob = Math.sin(t * 3) * .08;
      this.ride.position.set(p.x, this.alt + bob, p.z); this.ride.rotation.y = this.player.root.rotation.y;
      p.y = this.alt + bob - .35;
    } else p.y = 0;
    const fl = this.ride.getChildMeshes().find((m) => m.name === 'flame'); if (fl) { fl.setEnabled(this.riding); fl.scaling.y = .8 + Math.sin(t * 30) * .25; }
    this.shadow.position.set(p.x, .03, p.z); this.shadow.setEnabled(Math.hypot(p.x, p.z) < R);
    const st2 = g.save.data.settings;
    this.cam.update(dt, this.camera, p, this.player.root.rotation.y, { look: inp.look, move: inp.move, speed: st2.camSpeed, invertY: st2.invertY, busy, portrait: g.engine.aspect < 1, lift: this.riding ? this.alt - .35 : 0 });
  }
}
