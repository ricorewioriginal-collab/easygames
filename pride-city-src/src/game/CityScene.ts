/* Stadt-Szene: Rainbow City zum Herumlaufen (Spielmodus) und als Kulisse fürs Titelmenü (Kameraflug, tanzende Leute). */
import * as THREE from 'three';
import type { GameScene } from '../engine/Engine';
import { Actor, streetLook, playerLook } from './Actor';
import { World, walkable } from './World';
import { NPCS, CHAPTERS, goal, talk, poi as storyPoi, marks, hidden, storyTick, chapterLabel, type NpcDef, type StoryCtx } from './story';
import type { Game } from './Game';
import { sfx, music } from '../engine/Audio';
import { toast, hints } from '../ui/ui';
import { rollEvent, testDue, post } from './social';
import { advance, minutesUntil, change, track, mood, moodIcon, NEEDS, clock as lifeClock, hour as lifeHour, DAY_SEC } from './life';
import type { Marker } from '../ui/Hud';
import { Street, type Parked } from './Street';
import { PLACE_THEMES, houseTheme } from './interiors';

interface Npc { def: NpcDef; a: Actor; wp: number; wait: number; talking: boolean }

export const STICKERS: Array<[number, number]> = [[-15, 24], [45, 52], [-50, -50], [52, -30], [-45, 45], [18, -52], [-28, -32], [28, 28]];

export class CityScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, 1, .1, 400);
  bloom = 0;
  world!: World;
  player!: Actor;
  mode: 'title' | 'play' = 'title';
  private npcs: Npc[] = [];
  private crowd: Actor[] = [];
  private cam = { yaw: Math.PI, pitch: .38, dist: 7.5, tYaw: Math.PI };
  private camPos = new THREE.Vector3();
  private stickerMeshes: THREE.Mesh[] = [];
  private near: { kind: 'npc' | 'poi' | 'street' | 'car' | 'house'; id: string; label: string } | null = null;
  street!: Street;
  /** Auto, in dem die Spielfigur gerade sitzt */
  private drive: Parked | null = null;
  private stepT = 0;
  private warnT = 30;
  private evT = 90;
  private hudT = 0;
  private titleT = 0;

  constructor(private g: Game) {}

  async build() {
    this.world = new World(this.root);
    await this.world.build();
    const s = this.g.save.data;
    this.player = await Actor.create(streetLook(playerLook(s)));
    this.root.add(this.player.root);
    await Promise.all(NPCS.map(async (d) => {
      const a = await Actor.create(d.look);
      a.root.position.set(d.x, .1, d.z); a.root.rotation.y = d.yaw ?? 0;
      if (d.anim) a.play(d.anim, 0);
      this.root.add(a.root);
      this.npcs.push({ def: d, a, wp: 0, wait: Math.random() * 3, talking: false });
      if (d.anim === 'sit') a.root.position.y = -.25;
    }));
    // Tanzende Menge auf dem Platz (Titelbild und Abendstimmung)
    const looks = ['rainbow', 'trans', 'bi', 'pan', 'gay', 'progress'];
    const bodies = ['Man2', 'Woman2', 'Man', 'Woman', 'Human', 'Hero'];
    for (let i = 0; i < 6; i++) {
      const a = await Actor.create({ body: bodies[i], palette: looks[i], skin: i % 6 });
      const ang = (i / 6) * Math.PI * 2;
      a.root.position.set(-15 + Math.cos(ang) * 4.6, .1, 15 + Math.sin(ang) * 4.6);
      a.root.rotation.y = -ang - Math.PI / 2;
      a.play(i % 2 ? 'cheer' : 'dance1', 0, .9 + i * .05);
      this.root.add(a.root); this.crowd.push(a);
    }
    this.street = new Street(this.root, this.world);
    await this.street.build();
    this.buildStickers();
  }

  /* ---------- Sticker zum Sammeln ---------- */
  private buildStickers() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const grd = x.createConicGradient(0, 64, 64);
    ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787', '#e40303'].forEach((col, i) => grd.addColorStop(i / 6, col));
    x.fillStyle = grd; x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 60, a = (i / 10) * Math.PI * 2 - Math.PI / 2; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    x.closePath(); x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, toneMapped: false });
    const geo = new THREE.PlaneGeometry(1.2, 1.2);
    STICKERS.forEach(([sx, sz], i) => {
      const mesh = new THREE.Mesh(geo, m); mesh.position.set(sx, 1.4, sz); mesh.userData.i = i;
      this.root.add(mesh); this.stickerMeshes.push(mesh);
    });
    this.refreshStickers();
  }
  refreshStickers() { this.stickerMeshes.forEach((m) => (m.visible = !this.g.save.data.goals.includes('sticker' + m.userData.i))); }

  /* ---------- Modus ---------- */
  setTitle() {
    this.mode = 'title';
    this.player.root.visible = false;
    this.crowd.forEach((a) => (a.root.visible = true));
    this.titleT = 0;
    this.world.setTime(.55);
    this.g.hud.show(false); this.g.touch.show(false);
    music('title');
  }
  setPlay() {
    const s = this.g.save.data;
    this.mode = 'play';
    this.drive = null;
    this.player.root.visible = true;
    this.player.setLook(streetLook(playerLook(s)));
    this.player.root.position.set(s.pos.x, .1, s.pos.z);
    this.player.root.rotation.y = s.pos.yaw;
    this.cam.yaw = this.cam.tYaw = s.pos.yaw + Math.PI;
    this.crowd.forEach((a) => (a.root.visible = this.world.night > .5));
    this.refreshStickers();
    this.g.hud.show(true); this.g.touch.show(true);
    hints([['move', 'Laufen'], ['a', 'Aktion'], ['cam', 'Kamera'], ['y', 'Menü']]);
    music('city');
    this.snapCam();
    this.refreshHud();
  }
  /* Ersetzt die Spielfigur nach dem Editor (andere Körperform = anderes Modell) */
  async rebuildPlayer() {
    const s = this.g.save.data;
    const look = streetLook(playerLook(s));
    if (this.player.look.body === look.body) { this.player.setLook(look); return; }
    const old = this.player.root;
    this.root.remove(old);
    this.player = await Actor.create(look);
    this.player.root.position.copy(old.position); this.player.root.rotation.y = old.rotation.y;
    this.root.add(this.player.root);
  }

  hour() { return lifeHour(this.g.save.data); }
  clock() { return lifeClock(this.g.save.data); }

  /* ---------- Geschichte ---------- */
  ctx(): StoryCtx {
    const g = this.g, s = g.save.data;
    return {
      s,
      say: (lines, done) => g.dialog.say(lines, () => { done?.(); this.refreshHud(); g.save.write(); }),
      toast: (t) => toast(t),
      reward: (m, r, why) => { s.money += m; s.rep += r; if (m || r) { toast(`${why}: ${m ? '+' + m + ' € ' : ''}${r ? '+' + r + ' Ruf' : ''}`); sfx('coin'); } this.refreshHud(); },
      step: (n) => { s.step = n; g.save.write(); this.refreshHud(); },
      skipToHour: (h) => { g.fade(() => { g.pass(minutesUntil(s, h)); toast(`Es ist jetzt ${this.clock()} Uhr.`); }); },
      hour: () => this.hour(),
      dance: () => g.goDance(true),
      chapterDone: (sum) => {
        const done = CHAPTERS[s.chapter - 1], next = CHAPTERS[s.chapter];
        s.chapter++; s.step = 0; g.save.write(); this.refreshHud();
        if (!done) return;
        g.chapterCard(`Kapitel ${done.n} abgeschlossen`, done.title, sum).then(() => { if (next) g.chapterCard(`Kapitel ${next.n}`, next.title, next.text); });
      },
      enterHome: (after) => g.enterHome(after),
      barShift: (done) => g.barShift(done),
      credits: () => g.ending(),
      card: (k, t, x) => g.chapterCard(k, t, x),
      roman: (id) => g.roman(id),
    };
  }

  refreshHud() {
    if (this.mode !== 'play' && this.g.where === 'city') return;
    const s = this.g.save.data, gl = goal(s);
    this.world.traces.visible = s.settings.adult;
    if (this.g.where === 'inside' && this.g.inside) this.g.hud.goal(this.g.inside.theme.icon + ' Drinnen', this.g.inside.theme.title, `Ziel: ${gl.title}`);
    else if (this.g.where === 'home') this.g.hud.goal('Zuhause', 'Deine Wohnung', s.chapter === 1 && s.step === 2 ? 'Schau dich um.' : `Ziel: ${gl.title}`);
    else this.g.hud.goal(chapterLabel(s), gl.title, gl.sub);
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    this.g.hud.stats([`${days[(s.day - 1) % 7]} ${this.clock()}`, `💶 ${s.money} €`, `${moodIcon(mood(s))} ${Math.round(mood(s))}`]);
    this.g.hud.needs(s.needs);
  }

  private markers(): Marker[] {
    const s = this.g.save.data, gl = goal(s), out: Marker[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    if (gl.npc) { const n = this.npcs.find((x) => x.def.id === gl.npc); if (n) out.push({ id: 'g', icon: '⭐', label: n.def.name, pos: n.a.root.position.clone().setY(2.6) }); }
    if (gl.poi) { const p = this.world.pois.find((x) => x.id === gl.poi); if (p) out.push({ id: 'g', icon: '⭐', label: p.name, pos: v(p.x, 4, p.z) }); }
    for (const [id, icon] of marks(s)) { const n = this.npcs.find((x) => x.def.id === id); if (n?.a.root.visible) out.push({ id: 'p' + id, icon, pos: n.a.root.position.clone().setY(2.5) }); }
    return out;
  }

  /* ---------- Interaktion ---------- */
  private findNear() {
    const p = this.player.root.position;
    let best: typeof this.near = null, bd = 1e9;
    if (this.drive) {
      this.near = { kind: 'car', id: 'exit', label: '🚗 Aussteigen' };
      this.g.hud.prompt(this.near.label); this.g.touch.label('Raus');
      return;
    }
    for (const n of this.npcs) {
      if (!n.a.root.visible) continue;
      const d = n.a.root.position.distanceTo(p);
      if (d < 2.6 && d < bd) { bd = d; best = { kind: 'npc', id: n.def.id, label: 'Sprechen mit ' + n.def.name }; }
    }
    if (!best) { const st = this.street.near(p); if (st) best = { kind: 'street', id: String(this.street.people.indexOf(st)), label: (st.kind === 'worker' ? '🏮 ' : st.kind === 'police' ? '🚓 ' : st.kind === 'fire' ? '🚒 ' : '💬 ') + st.name }; }
    if (!best) { const car = this.street.nearCar(p); if (car) best = { kind: 'car', id: String(this.street.parked.indexOf(car)), label: '🚗 Einsteigen: ' + car.name }; }
    const want = goal(this.g.save.data).poi;
    if (!best) for (const q of this.world.pois) {
      if ((q.id === 'plaza' || q.id === 'park') && want !== q.id) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < q.r && d < bd) { bd = d; best = { kind: 'poi', id: q.id, label: q.icon + ' ' + q.name }; }
    }
    if (!best) for (const h of this.world.houses) {
      const d = Math.hypot(h.x - p.x, h.z - p.z);
      if (d < 2 && d < bd) { bd = d; const t = houseTheme(h.i, this.g.save.data.settings.adult); best = { kind: 'house', id: String(h.i), label: '🚪 ' + t.icon + ' ' + t.title }; }
    }
    this.near = best;
    this.g.hud.prompt(best ? best.label : null);
    this.g.touch.label(best ? (best.kind === 'npc' || best.kind === 'street' ? 'Reden' : best.kind === 'car' ? 'Fahren' : 'Rein') : 'Aktion');
  }

  interact() {
    if (!this.near || this.g.dialog.open) return;
    const c = this.ctx();
    if (this.near.kind === 'npc') {
      const n = this.npcs.find((x) => x.def.id === this.near!.id)!;
      n.talking = true;
      if (n.def.anim !== 'sit') { n.a.play('idle'); n.a.root.rotation.y = Math.atan2(this.player.root.position.x - n.a.root.position.x, this.player.root.position.z - n.a.root.position.z); }
      this.player.root.rotation.y = Math.atan2(n.a.root.position.x - this.player.root.position.x, n.a.root.position.z - this.player.root.position.z);
      this.player.play('idle');
      const end = () => { n.talking = false; };
      const prevSay = c.say; c.say = (l, d) => prevSay(l, () => { end(); d?.(); });
      talk(c, n.def.id);
      if (!this.g.dialog.open) end();
      const s = this.g.save.data, r = (s.rel[n.def.id] ||= { f: 0, last: 0 });
      if (r.last !== s.day) { r.last = s.day; r.f = Math.min(100, r.f + 6); change(s, { social: 10, fun: 2 }); this.g.done(track(s, 'talk')); }
      return;
    }
    if (this.near.kind === 'car') { this.toggleCar(this.near.id); return; }
    if (this.near.kind === 'street') {
      const n = this.street.people[+this.near.id], s = this.g.save.data;
      n.talking = true; n.a.play('idle');
      n.a.root.rotation.y = Math.atan2(this.player.root.position.x - n.a.root.position.x, this.player.root.position.z - n.a.root.position.z);
      this.player.root.rotation.y = Math.atan2(n.a.root.position.x - this.player.root.position.x, n.a.root.position.z - this.player.root.position.z);
      this.player.play('idle');
      const end = () => { n.talking = false; };
      if (n.kind === 'worker') { this.g.booking(n.id!); setTimeout(end, 4000); return; }
      this.g.dialog.say([{ who: n.name, color: n.color, text: this.street.line(n, s.day) }], end);
      change(s, { social: 3 });
      return;
    }
    if (storyPoi(c, this.near.id)) return;
    if (this.near.kind === 'house') {
      const h = this.world.houses[+this.near.id];
      this.g.enterInterior(houseTheme(h.i, this.g.save.data.settings.adult), { x: h.x + Math.sin(h.yaw) * .8, z: h.z + Math.cos(h.yaw) * .8, yaw: h.yaw });
      return;
    }
    if (this.near.id === 'home') { this.g.enterHome(); return; }
    const th = PLACE_THEMES[this.near.id], q = this.world.pois.find((x) => x.id === this.near!.id);
    if (th && q && (!th.adult || this.g.save.data.settings.adult)) {
      const pp = this.player.root.position, yaw = Math.atan2(pp.x - q.x, pp.z - q.z);
      this.g.enterInterior(th, { x: pp.x, z: pp.z, yaw }, q.id);
      return;
    }
    sfx('door'); this.g.placeMenu(this.near.id);
  }

  /** Gespräch mit einer Story-Figur starten (z. B. aus einem Ortsmenü) */
  talkTo(id: string) { const c = this.ctx(); talk(c, id); }

  /* ---------- Autofahren: einsteigen, Stick/WASD lenkt, Turbo gibt Gas, A steigt aus ---------- */
  private toggleCar(id: string) {
    const p = this.player.root.position;
    if (this.drive) {
      const o = this.drive.o, side = new THREE.Vector3(Math.cos(o.rotation.y), 0, -Math.sin(o.rotation.y));
      for (const k of [2.2, -2.2, 3.4, -3.4]) { const x = o.position.x + side.x * k, z = o.position.z + side.z * k; if (walkable(x, z) && !this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .4 && Math.abs(z - c.z) < c.hz + .4)) { p.set(x, .1, z); break; } }
      this.drive.v = 0; this.drive = null;
      this.player.root.visible = true; this.player.play('idle');
      hints([['move', 'Laufen'], ['a', 'Aktion'], ['cam', 'Kamera'], ['y', 'Menü']]);
      sfx('open');
      return;
    }
    this.drive = this.street.parked[+id]; sfx('door'); setTimeout(() => sfx('engine'), 250);
    this.player.root.visible = false;
    this.cam.dist = Math.max(this.cam.dist, 9);
    this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
    hints([['move', 'Lenken & Gas'], ['a', 'Aussteigen'], ['cam', 'Kamera'], ['y', 'Menü']]);
    toast('🚗 Gute Fahrt! Vorsicht vor Fußgänger*innen.');
    sfx('open');
  }
  private moveCar(dt: number) {
    const c = this.drive!, o = c.o, inp = this.g.engine.input;
    const thr = Math.abs(inp.move.y) > .08 ? inp.move.y : 0, steer = Math.abs(inp.move.x) > .08 ? inp.move.x : 0;
    const max = inp.held('sprint') ? 24 : 15;
    if (thr > 0) c.v = Math.min(max, c.v + thr * (c.v < 0 ? 22 : 9) * dt);
    else if (thr < 0) c.v = Math.max(-6, c.v + thr * (c.v > 0 ? 22 : 6) * dt);
    else c.v *= Math.max(0, 1 - dt * 1.2);
    if (Math.abs(c.v) < .05) c.v = 0;
    o.rotation.y -= steer * dt * 2 * THREE.MathUtils.clamp(c.v / 5, -1, 1);
    const before = o.position.clone();
    o.position.x += Math.sin(o.rotation.y) * c.v * dt; o.position.z += Math.cos(o.rotation.y) * c.v * dt;
    const want = o.position.clone();
    this.world.collide(o.position, 1.2);
    for (const t of this.world.cars) if (t.o.position.distanceTo(o.position) < 3.2) { o.position.copy(before); c.v *= -.25; }
    if (o.position.distanceTo(want) > .02 && Math.abs(c.v) > 4) { c.v *= .4; sfx('miss'); }
    o.position.y = .1;
    o.updateMatrix(); o.traverse((x) => x.matrixAutoUpdate || x.updateMatrix());
    this.player.root.position.copy(o.position);
    if (Math.abs(c.v) > 1) this.cam.tYaw += (o.rotation.y + Math.PI * (c.v > 0 ? 1 : 1) - this.cam.tYaw) * Math.min(1, dt * 2.5);
    const s = this.g.save.data; s.pos.x = o.position.x; s.pos.z = o.position.z; s.pos.yaw = o.rotation.y;
  }

  /* ---------- Kamera ---------- */
  private snapCam() { this.updateCam(1, true); }
  private updateCam(dt: number, snap = false) {
    const inp = this.g.engine.input, st = this.g.save.data.settings;
    const k = .005 * st.camSpeed;
    this.cam.tYaw -= inp.look.x * k;
    this.cam.pitch = THREE.MathUtils.clamp(this.cam.pitch + inp.look.y * k * (st.invertY ? -1 : 1), .08, 1.1);
    this.cam.dist = THREE.MathUtils.clamp(this.cam.dist + inp.zoom * .8, 3.5, 14);
    if (inp.held('tabL')) this.cam.tYaw += dt * 2.2;
    if (inp.held('tabR')) this.cam.tYaw -= dt * 2.2;
    if (inp.pressed('camReset')) this.cam.tYaw = this.player.root.rotation.y + Math.PI;
    this.cam.yaw += (this.cam.tYaw - this.cam.yaw) * Math.min(1, dt * 12);
    const p = this.player.root.position;
    const tgt = new THREE.Vector3(p.x, p.y + 1.5, p.z);
    const want = new THREE.Vector3(
      tgt.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist,
      tgt.y + Math.sin(this.cam.pitch) * this.cam.dist,
      tgt.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist);
    // Kamera-Kollision: nicht in Häusern oder Autos stecken, sondern davor heranrücken
    const dir = want.clone().sub(tgt), cars = this.world.cars;
    let f = 1;
    for (let i = 1; i <= 14 && f === 1; i++) {
      const u = i / 14, x = tgt.x + dir.x * u, y = tgt.y + dir.y * u, z = tgt.z + dir.z * u;
      if (y < 7 && this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .35 && Math.abs(z - c.z) < c.hz + .35)) f = Math.max(.18, (i - 1) / 14);
      else if (y < 2.2 && cars.some((c) => Math.hypot(x - c.o.position.x, z - c.o.position.z) < 1.7)) f = Math.max(.18, (i - 1) / 14);
    }
    if (f < 1) want.copy(tgt).addScaledVector(dir, f);
    if (snap || f < 1) this.camPos.lerp(want, snap ? 1 : Math.min(1, dt * 20)); else this.camPos.lerp(want, Math.min(1, dt * 8));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(tgt);
  }

  /* ---------- Bild für Bild ---------- */
  update(dt: number, t: number) {
    const g = this.g, s = g.save.data;
    this.bloom = .35 + this.world.night * .5;
    // Figuren nur in der Nähe animieren (Leistung)
    const ref = this.mode === 'play' ? this.player.root.position : new THREE.Vector3(-15, 0, 15);
    for (const n of this.npcs) {
      const near = n.a.root.position.distanceToSquared(ref) < 70 * 70;
      if (near) n.a.update(dt);
      if (!n.talking && n.def.walk) this.walkNpc(n, dt);
      n.a.root.visible = (!n.def.night || this.world.night > .4) && !hidden(s, n.def.id);
    }
    for (const a of this.crowd) if (a.root.visible) a.update(dt);
    this.street.update(dt, this.world.night, s.settings.adult, this.mode === 'play' ? this.player.root.position : ref);
    this.stickerMeshes.forEach((m) => { m.rotation.y = t * 2; m.position.y = 1.4 + Math.sin(t * 3 + m.userData.i) * .15; });

    if (this.mode === 'title') {
      this.titleT += dt;
      const a = this.titleT * .07;
      this.camera.position.set(-15 + Math.sin(a) * 11, 3.6 + Math.sin(a * .7) * .8, 15 + Math.cos(a) * 11);
      this.camera.lookAt(-15 - Math.sin(a) * 2, 1.6, 15 - Math.cos(a) * 2);
      this.world.follow(new THREE.Vector3(-15, 0, 15));
      this.world.update(dt, t);
      return;
    }

    // Spielzeit läuft nur ohne Dialog und Menü
    const busy = g.dialog.open || g.menuOpen;
    if (!busy) {
      s.playMs += dt * 1000;
      if (advance(s, dt / DAY_SEC * 1440)) toast(`Tag ${s.day} beginnt.`);
      this.world.setTime(s.time);
      this.warnT -= dt; this.evT -= dt;
      if (this.evT <= 0) {
        this.evT = 120;
        const e = rollEvent(s, Math.random());
        if (e) { toast((e.kind === 'rumor' ? '🗣️ ' : '✨ ') + e.text); if (e.money) s.money += e.money; if (e.kind === 'friend') change(s, { social: 12 }); if (e.kind === 'rumor') post(s, 'Flurfunk', e.text); }
      }
      if (this.warnT <= 0) {
        this.warnT = 45;
        const low = NEEDS.find((n) => s.needs[n.k] < 18);
        if (low) toast(`${low.icon} ${low.name} ist niedrig: ${low.tip}`);
        if (testDue(s) && s.flags.remind !== s.day) { s.flags.remind = s.day; toast('🩺 Erinnerung: Dein HIV/STI-Test ist fällig. Der Checkpoint hat offen.'); }
      }
      this.crowd.forEach((a) => (a.root.visible = this.world.night > .5));
    }
    this.player.update(dt);
    if (!busy) { if (this.drive) this.moveCar(dt); else this.movePlayer(dt); }
    this.updateCam(dt);
    this.world.follow(this.player.root.position);
    this.world.update(dt, t, this.player.root.position);

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = .5; if (!busy) storyTick(this.ctx()); this.refreshHud(); if (mood(s) >= 75 && !busy) g.done(track(s, 'mood')); }
    g.hud.markers(busy ? [] : this.markers(), this.camera);
    if (!busy) {
      this.findNear();
      const inp = g.engine.input;
      if (inp.pressed('confirm')) { inp.consume('confirm'); this.interact(); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      this.checkStickers();
    } else g.hud.prompt(null);
  }

  private movePlayer(dt: number) {
    const inp = this.g.engine.input, p = this.player.root.position;
    const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
    if (mag > .08) {
      const yaw = this.cam.yaw;
      // Bewegung relativ zur Kamera
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
      const dx = fx * my + rx * mx, dz = fz * my + rz * mx;
      const run = inp.held('sprint') && this.g.save.data.needs.energy >= 10;
      const sp = (run ? 7.8 : 4.4) * Math.min(1, mag);
      p.x += (dx / mag) * sp * dt * Math.min(1, mag); p.z += (dz / mag) * sp * dt * Math.min(1, mag);
      this.world.collide(p, .45);
      for (const c of this.street.parked) { const dx = p.x - c.o.position.x, dz = p.z - c.o.position.z, d = Math.hypot(dx, dz); if (d < 1.9 && d > 0) { p.x += dx / d * (1.9 - d); p.z += dz / d * (1.9 - d); } }
      const want = Math.atan2(dx, dz);
      let d = want - this.player.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.player.root.rotation.y += d * Math.min(1, dt * 14);
      this.player.play(run ? 'run' : 'walk', .18, run ? 1 : .6 + mag * .55);
      this.stepT -= dt * (run ? 1.6 : 1);
      if (this.stepT <= 0) { this.stepT = .38; sfx('step'); }
      const s = this.g.save.data; s.pos.x = p.x; s.pos.z = p.z; s.pos.yaw = this.player.root.rotation.y;
    } else if (this.player.anim === 'walk' || this.player.anim === 'run') this.player.play('idle');
  }

  private walkNpc(n: Npc, dt: number) {
    const w = n.def.walk!;
    if (n.wait > 0) { n.wait -= dt; if (n.a.anim !== 'idle') n.a.play('idle'); return; }
    const [tx, tz] = w[n.wp], p = n.a.root.position;
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d < .3) { n.wp = (n.wp + 1) % w.length; n.wait = 1.5 + Math.random() * 3; return; }
    p.x += (dx / d) * 1.6 * dt; p.z += (dz / d) * 1.6 * dt;
    n.a.root.rotation.y = Math.atan2(dx, dz);
    n.a.play('walk', .25, .7);
  }

  private checkStickers() {
    const p = this.player.root.position, s = this.g.save.data;
    for (const m of this.stickerMeshes) {
      if (!m.visible) continue;
      if (Math.hypot(m.position.x - p.x, m.position.z - p.z) < 1.4) {
        m.visible = false; s.goals.push('sticker' + m.userData.i); s.glitter += 10;
        const n = s.goals.filter((x) => x.startsWith('sticker')).length;
        sfx('win'); toast(`🌈 Pride-Sticker ${n}/${STICKERS.length} gefunden! +10 Glitzer`);
        if (n === STICKERS.length) { s.rep += 10; toast('Alle Sticker gesammelt! +10 Ruf'); }
        this.player.play('cheer'); setTimeout(() => this.player.play('idle'), 1200);
        this.g.save.write();
      }
    }
  }

}
