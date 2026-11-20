/* Stadt-Szene (Babylon.js): Rainbow City zum Herumlaufen (Spielmodus) und als Kulisse fürs Titelmenü (Kameraflug,
   tanzende Leute). Alle Menschen sind Rocketbox-Figuren. */
import type { GameScene } from '../engine/Engine';
import { Vector3, TransformNode, type Mesh, type FreeCamera, type Scene, clamp, dist, col } from '../engine/bjs';
import { planeZ, cyl, ring, glow, canvasTex } from '../engine/geo';
import { Actor, streetLook, playerLook, WALK_MPS, RUN_MPS, type Look } from './Actor';
import { World, walkable } from './World';
import { NPCS, CHAPTERS, goal, talk, poi as storyPoi, marks, hidden, storyTick, chapterLabel, type NpcDef, type StoryCtx } from './story';
import type { Game } from './Game';
import { radio, STATIONS, stationOf } from '../engine/Radio';
import { RACES, MEDALS, raceGig, finishRace, bestTime, nextParcel, stats, myCar, tuneLevel, GARAGE, type Race } from './vehicles';
import { sfx, music } from '../engine/Audio';
import { toast, hints } from '../ui/ui';
import { rollEvent, testDue, post } from './social';
import { advance, minutesUntil, change, track, mood, moodIcon, NEEDS, clock as lifeClock, hour as lifeHour, DAY_SEC } from './life';
import type { Marker } from '../ui/Hud';
import { type Gig, pickCall, fmtTime } from './gigs';
import { collect, nextFare } from './empire';
import { Street, type Parked } from './Street';
import { PLACE_THEMES, houseTheme } from './interiors';
import { Combat } from './Combat';
import { arrive } from './family';
import { Kerb } from './kerb';

interface Npc { def: NpcDef; a: Actor; wp: number; wait: number; talking: boolean }

export const STICKERS: Array<[number, number]> = [[-15, 24], [45, 52], [-50, -50], [52, -30], [-45, 45], [18, -52], [-28, -32], [28, 28]];
const L = (rb: string): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0 });

export class CityScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = 0;
  world!: World;
  player!: Actor;
  mode: 'title' | 'play' = 'title';
  private npcs: Npc[] = [];
  private crowd: Actor[] = [];
  private cam = { yaw: Math.PI, pitch: .38, dist: 7.5, tYaw: Math.PI };
  private camPos = new Vector3();
  private stickerMeshes: Mesh[] = [];
  private near: { kind: 'npc' | 'poi' | 'street' | 'car' | 'house'; id: string; label: string } | null = null;
  street!: Street;
  combat!: Combat;
  kerb!: Kerb;
  /** Auto, in dem die Spielfigur gerade sitzt */
  private drive: Parked | null = null;
  private stepT = 0;
  private warnT = 30;
  private evT = 90;
  private hudT = 0;
  private titleT = 0;

  constructor(private g: Game) {
    this.scene = g.engine.newScene(0x8fb8e8);
    this.camera = g.engine.newCamera(this.scene, 55, .1, 400);
  }

  async build() {
    const sc = this.scene;
    this.world = new World(sc);
    await this.world.build();
    const s = this.g.save.data;
    this.player = await Actor.create(sc, streetLook(playerLook(s)));
    await Promise.all(NPCS.map(async (d) => {
      const a = await Actor.create(sc, d.look);
      a.root.position.set(d.x, .1, d.z); a.root.rotation.y = d.yaw ?? 0;
      if (d.anim) a.play(d.anim, 0);
      this.npcs.push({ def: d, a, wp: 0, wait: Math.random() * 3, talking: false });
      if (d.anim === 'sit') a.root.position.y = -.05;
    }));
    // Tanzende Menge auf dem Platz (Titelbild und Abendstimmung)
    const crowd = ['Female_Party_01', 'Male_Adult_07', 'Female_Adult_04', 'Male_Adult_02', 'Female_Party_02', 'Male_Adult_09'];
    await Promise.all(crowd.map(async (rb, i) => {
      const a = await Actor.create(sc, L(rb));
      const ang = (i / 6) * Math.PI * 2;
      a.root.position.set(-15 + Math.cos(ang) * 4.6, .1, 15 + Math.sin(ang) * 4.6);
      a.root.rotation.y = -ang - Math.PI / 2;
      a.play((['dance1', 'cheer', 'dance2', 'dance3', 'dance1', 'clap'] as const)[i], 0, .9 + i * .05);
      this.crowd.push(a);
    }));
    // Nachtleben: Schlangen vor Club Prisma und One Love Bar (nur nachts sichtbar, wie die Tanzenden am Platz)
    const queue: Array<[number, number, number]> = [[3.6, -6.4, -Math.PI / 2], [3.4, -4.9, -Math.PI / 2], [3.7, -3.4, -Math.PI / 2], [33.6, 23.2, -Math.PI / 2], [33.4, 24.7, -Math.PI / 2]];
    const qa = ['Female_Adult_08', 'Male_Adult_03', 'Female_Adult_02', 'Male_Adult_05', 'Male_Adult_01'];
    await Promise.all(queue.map(async ([x, z, yaw], i) => {
      const a = await Actor.create(sc, L(qa[i]));
      a.root.position.set(x, .1, z); a.root.rotation.y = yaw + (i % 2 ? .4 : -.3);
      a.play((['phone', 'talk', 'dance2', 'drink', 'laugh'] as const)[i], 0, .9);
      this.crowd.push(a);
    }));
    this.street = new Street(sc, this.world);
    await this.street.build();
    this.combat = new Combat(this.g, this, sc); this.combat.init();
    this.kerb = new Kerb(this.g, this);
    this.g.hud.onWeapon = () => { if (this.mode === 'play') this.combat.cycle(); };
    this.g.hud.setRadarMap((c, px) => {
      c.fillStyle = '#123a52'; c.fillRect(0, 0, 1024, 1024);                     // Wasser
      c.fillStyle = '#34343c'; c.fillRect(px(-66), px(66), 370 * 2, 120 * 2); c.fillRect(px(-66), px(-186), 370 * 2, 120 * 2); c.fillRect(px(214), px(-66), 90 * 2, 132 * 2); // äußere Stadt
      c.fillStyle = '#1f6f9a'; c.fillRect(px(64), px(-300), 26 * 2, 600 * 2);       // Fluss
      c.fillStyle = '#3c4f45'; c.fillRect(px(85), px(-65), 130 * 2, 130 * 2);        // Hochstadt
      c.fillStyle = '#c9ccd6'; c.fillRect(px(60), px(-4.5), 32 * 2, 9 * 2);           // Regenbogenbrücke
      for (let i = -60; i <= 60; i += 30) c.fillRect(px(85), px(i - 3.6), 128 * 2, 7.2 * 2);
      for (let i = 90; i <= 210; i += 30) c.fillRect(px(i - 3.6), px(-64), 7.2 * 2, 128 * 2);
      c.fillStyle = '#3c4f45'; c.fillRect(px(-65), px(-65), 130 * 2, 130 * 2);   // Innenstadt
      c.fillStyle = '#9b8f7a'; c.fillRect(px(-92), px(-35), 27 * 2, 80 * 2);      // Kai
      c.fillStyle = '#d8c48a'; c.fillRect(px(-97), px(17), 6 * 2, 26 * 2);        // Strand
      c.fillStyle = '#7a5a3a'; c.fillRect(px(-111), px(-3.4), 20 * 2, 2.8 * 2);   // Steg
      c.fillStyle = '#4c7a4a'; c.fillRect(px(35), px(35), 20 * 2, 20 * 2);        // Park
      c.fillStyle = '#c9ccd6';
      for (let i = -60; i <= 60; i += 30) { c.fillRect(px(-64), px(i - 3.6), 128 * 2, 7.2 * 2); c.fillRect(px(i - 3.6), px(-64), 7.2 * 2, 128 * 2); }
      c.fillRect(px(-80), px(-1.8), 20 * 2, 3.6 * 2);                             // Kaistraße
    });
    // Verkehr hält vor geparkten und vom Spieler gefahrenen Autos
    this.g.hud.onRadio = () => { if (this.drive) this.radio(this.g.hud.wheelOpen ? 1 : 0); };
    this.g.hud.onStation = (i) => { if (this.drive) this.radio(0, i); };
    radio.subscribe((r, what) => { if (!this.drive) return; if (what === 'error') toast(`📻 ${r.err}`); this.showRadio(what !== 'song' ? this.g.hud.wheelOpen : true); });
    this.world.extraBlock = (x, z) => this.street.parked.some((c) => Math.hypot(c.o.position.x - x, c.o.position.z - z) < 2.6);
    this.buildStickers();
    this.world.castShadows();
    // Schatten folgen der Grafikstufe (niedrig = aus)
    this.g.engine.onQuality((q) => { this.world.sun.shadowEnabled = q > 0; this.world.shadows.mapSize = q === 2 ? 2048 : 1024; this.world.setLow(q === 0); });
  }

  /* ---------- Sticker zum Sammeln ---------- */
  private buildStickers() {
    const sc = this.scene;
    const t = canvasTex(sc, 128, 128, (x) => {
      const grd = x.createConicGradient(0, 64, 64);
      ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787', '#e40303'].forEach((col, i) => grd.addColorStop(i / 6, col));
      x.fillStyle = grd; x.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 60, a = (i / 10) * Math.PI * 2 - Math.PI / 2; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
      x.closePath(); x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
    }, true);
    const m = glow(sc, 0xffffff, 1.3, { tex: t, double: true });
    STICKERS.forEach(([sx, sz], i) => {
      const mesh = planeZ(sc, 1.2, 1.2, true); mesh.material = m; mesh.position.set(sx, 1.4, sz); mesh.metadata = { i }; mesh.isPickable = false;
      this.stickerMeshes.push(mesh);
    });
    this.refreshStickers();
  }
  refreshStickers() { this.stickerMeshes.forEach((m) => m.setEnabled(!this.g.save.data.goals.includes('sticker' + m.metadata.i))); }

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
    void this.placeOwnCar();
    this.combat.showWeapon();
    hints([['move', 'Laufen'], ['a', 'Aktion'], ['atk', 'Angriff'], ['wpn', 'Waffe'], ['cam', 'Kamera'], ['y', 'Menü']]);
    music('city');
    this.snapCam();
    this.refreshHud();
  }
  /* Ersetzt die Spielfigur nach dem Editor (andere Figur = anderes Modell) */
  async rebuildPlayer() {
    const s = this.g.save.data;
    const look = streetLook(playerLook(s));
    if (this.player.look.body === look.body) { this.player.setLook(look); return; }
    const old = this.player;
    this.player = await Actor.create(this.scene, look);
    this.player.root.position.copyFrom(old.root.position); this.player.root.rotation.y = old.root.rotation.y;
    this.player.root.visible = old.root.visible;
    old.dispose();
    this.world.castShadows();
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
      roman: (id, game, done) => g.roman(id, game, done),
      mission: (gg) => this.startGig(gg),
    };
  }

  refreshHud() {
    if (this.mode !== 'play' && this.g.where === 'city') return;
    const s = this.g.save.data, gl = goal(s);
    const paid = collect(s);
    if (paid) { sfx('coin'); this.g.hud.banner('💼 Einnahmen deines Imperiums', `+${paid} € aus deinen Geschäften`, 'good', 3600); this.g.save.write(); }
    const nk = arrive(s);
    if (nk) { sfx('win'); this.g.hud.banner('👶 Willkommen zu Hause!', `${nk.name} ist bei euch eingezogen. Schau in deiner Wohnung vorbei.`, 'good', 5000); this.g.save.write(); void this.g.home?.syncFamily(); }
    this.world.traces.visible = s.settings.adult;
    if (this.g.where === 'city' && this.mode === 'play') this.combat?.showWeapon(); else { this.g.hud.weapon(null); this.g.hud.wanted(0); }
    if (this.g.where === 'inside' && this.g.inside) this.g.hud.goal(this.g.inside.theme.icon + ' Drinnen', this.g.inside.theme.title, `Ziel: ${gl.title}`);
    else if (this.g.where === 'home') this.g.hud.goal('Zuhause', 'Deine Wohnung', s.chapter === 1 && s.step === 2 ? 'Schau dich um.' : `Ziel: ${gl.title}`);
    else this.g.hud.goal(chapterLabel(s), gl.title, gl.sub);
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    this.g.hud.stats([`${days[(s.day - 1) % 7]} ${this.clock()}`, `💶 ${s.money} €`, `${moodIcon(mood(s))} ${Math.round(mood(s))}`]);
    this.g.hud.needs(s.needs);
  }

  private markers(): Marker[] {
    const s = this.g.save.data, gl = goal(s), out: Marker[] = [];
    const at = (p: Vector3, y: number) => new Vector3(p.x, y, p.z);
    if (gl.npc) { const n = this.npcs.find((x) => x.def.id === gl.npc); if (n) out.push({ id: 'g', icon: '⭐', label: n.def.name, pos: at(n.a.root.position, 2.6) }); }
    if (gl.poi) { const p = this.world.pois.find((x) => x.id === gl.poi); if (p) out.push({ id: 'g', icon: '⭐', label: p.name, pos: new Vector3(p.x, 4, p.z) }); }
    if (this.gig) { const st = this.gig.g.steps[this.gig.i]; out.push({ id: 'gig', icon: st.icon, label: st.label, pos: new Vector3(st.x, 3, st.z) }); }
    if (this.drive && !this.gig) { const p = this.drive.o.position; for (const r of RACES) if (Math.hypot(r.start[0] - p.x, r.start[1] - p.z) < 90) out.push({ id: 'race' + r.id, icon: '🏁', label: r.name, pos: new Vector3(r.start[0], 3, r.start[1]) }); }
    if (this.kerb?.spot) out.push({ id: 'kerb', icon: '🌙', label: this.kerb.spot.name, pos: new Vector3(this.kerb.spot.x, 3, this.kerb.spot.z) });
    for (const [id, icon] of marks(s)) { const n = this.npcs.find((x) => x.def.id === id); if (n?.a.root.visible) out.push({ id: 'p' + id, icon, pos: at(n.a.root.position, 2.5) }); }
    return out;
  }

  /* ---------- Interaktion ---------- */
  private findNear() {
    const p = this.player.root.position;
    let best: typeof this.near = null, bd = 1e9;
    if (this.drive) {
      const curb = this.kerb.nearCurb();
      this.near = { kind: 'car', id: 'exit', label: this.kerb.rider ? `🚗 Aussteigen · ${this.kerb.rider.name} fährt mit` : curb ? `🚗 Aussteigen · 📯 Hupen: ${curb.name} steigt vielleicht ein` : '🚗 Aussteigen' };
      this.g.hud.prompt(this.near.label); this.g.touch.label('Raus');
      return;
    }
    // Direkt vor einer Tür hat die Tür Vorrang (sonst schnappt sich eine vorbeilaufende Figur den Knopf)
    const want0 = goal(this.g.save.data).poi;
    for (const q of this.world.pois) {
      if (!q.sign && q.id !== want0) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < 1.4 && d < bd) { bd = d; best = { kind: 'poi', id: q.id, label: q.icon + ' ' + q.name }; }
    }
    for (const h of this.world.houses) {
      const d = Math.hypot(h.x - p.x, h.z - p.z);
      if (d < 1.2 && d < bd) { bd = d; const t = houseTheme(h.i, this.g.save.data.settings.adult); best = { kind: 'house', id: String(h.i), label: '🚪 ' + t.icon + ' ' + t.title }; }
    }
    if (!best) for (const n of this.npcs) {
      if (!n.a.root.visible) continue;
      const d = Vector3.Distance(n.a.root.position, p);
      if (d < 2.6 && d < bd) { bd = d; best = { kind: 'npc', id: n.def.id, label: 'Sprechen mit ' + n.def.name }; }
    }
    const icon: Record<string, string> = { worker: '🏮 ', police: '🚓 ', fire: '🚒 ', medic: '🚑 ', security: '🛡️ ', chef: '👩‍🍳 ', courier: '📦 ' };
    if (!best) { const st = this.street.near(p); if (st) best = { kind: 'street', id: String(this.street.people.indexOf(st)), label: (icon[st.kind] || '💬 ') + st.name }; }
    if (!best) { const car = this.street.nearCar(p); if (car) best = { kind: 'car', id: String(this.street.parked.indexOf(car)), label: `${car.def.icon} Einsteigen: ${car.name}${car.own ? ' (dein Wagen)' : ''}` }; }
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

  private face(a: Actor, to: Vector3) { a.root.rotation.y = Math.atan2(to.x - a.root.position.x, to.z - a.root.position.z); }

  interact() {
    if (!this.near || this.g.dialog.open) return;
    const c = this.ctx();
    if (this.near.kind === 'npc') {
      const n = this.npcs.find((x) => x.def.id === this.near!.id)!;
      n.talking = true;
      if (n.def.anim !== 'sit') { n.a.play('talk'); this.face(n.a, this.player.root.position); }
      this.face(this.player, n.a.root.position);
      this.player.play('idle');
      const end = () => { n.talking = false; if (n.def.anim !== 'sit') n.a.play(n.def.anim || 'idle'); };
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
      n.talking = true; n.a.play('talk');
      this.face(n.a, this.player.root.position); this.face(this.player, n.a.root.position);
      this.player.play('idle');
      const end = () => { n.talking = false; n.a.play(n.anim || 'idle'); };
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
      const o = this.drive.o, sx = Math.cos(o.rotation.y), sz = -Math.sin(o.rotation.y);
      for (const k of [2.2, -2.2, 3.4, -3.4]) { const x = o.position.x + sx * k, z = o.position.z + sz * k; if (walkable(x, z) && !this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .4 && Math.abs(z - c.z) < c.hz + .4)) { p.set(x, .1, z); break; } }
      if (this.drive.own) { const sv = this.g.save.data; sv.flags.ownX = Math.round(o.position.x * 10) / 10; sv.flags.ownZ = Math.round(o.position.z * 10) / 10; sv.flags.ownYaw = Math.round(o.rotation.y * 100) / 100; }
      this.drive.v = 0; this.drive = null; this.parcel = -1;
      this.radioOff(); music('city');
      this.player.root.visible = true; this.player.play('idle');
      hints([['move', 'Laufen'], ['a', 'Aktion'], ['atk', 'Angriff'], ['wpn', 'Waffe'], ['cam', 'Kamera'], ['y', 'Menü']]);
      sfx('open');
      return;
    }
    this.drive = this.street.parked[+id];
    if (!this.drive.own) this.combat.enterCar(); sfx('door'); setTimeout(() => sfx('engine'), 250);
    this.player.root.visible = false;
    this.cam.dist = Math.max(this.cam.dist, 9);
    this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
    hints([['move', 'Lenken & Gas'], ['a', 'Aussteigen'], ['atk', 'Hupen'], ['cam', 'Kamera'], ['y', 'Menü']]);
    this.g.hud.radioBtn(true); this.radio(0);
    toast(`${this.drive.def.icon} ${this.drive.def.name}${this.drive.own ? ' (dein Wagen)' : ''} · Q/R oder LB/RB wechselt den Sender.`);
    sfx('open');
  }
  private moveCar(dt: number) {
    const c = this.drive!, o = c.o, inp = this.g.engine.input;
    if (inp.pressed('tabR')) this.radio(1); else if (inp.pressed('tabL')) this.radio(-1);
    const thr = Math.abs(inp.move.y) > .08 ? inp.move.y : 0, steer = Math.abs(inp.move.x) > .08 ? inp.move.x : 0;
    const st = stats(c.def, c.own ? tuneLevel(this.g.save.data) : 0), max = inp.held('sprint') ? st.turbo : st.max;
    if (thr > 0) c.v = Math.min(max, c.v + thr * (c.v < 0 ? 22 : st.acc) * dt);
    else if (c.v > max) c.v = Math.max(max, c.v - 14 * dt);
    else if (thr < 0) c.v = Math.max(-6, c.v + thr * (c.v > 0 ? 22 : 6) * dt);
    else c.v *= Math.max(0, 1 - dt * 1.2);
    if (Math.abs(c.v) < .05) c.v = 0;
    o.rotation.y -= steer * dt * st.steer * clamp(c.v / 5, -1, 1);
    const before = o.position.clone();
    o.position.x += Math.sin(o.rotation.y) * c.v * dt; o.position.z += Math.cos(o.rotation.y) * c.v * dt;
    const want = o.position.clone();
    this.world.collide(o.position, 1.2);
    for (const t of this.world.cars) if (Vector3.Distance(t.o.position, o.position) < 3.2) { o.position.copyFrom(before); c.v *= -.25; }
    if (Vector3.Distance(o.position, want) > .02 && Math.abs(c.v) > 4) { c.v *= .4; sfx('miss'); }
    o.position.y = .1;
    this.player.root.position.copyFrom(o.position);
    if (Math.abs(c.v) > 1) this.cam.tYaw += (o.rotation.y + Math.PI - this.cam.tYaw) * Math.min(1, dt * 2.5);
    const s = this.g.save.data; s.pos.x = o.position.x; s.pos.z = o.position.z; s.pos.yaw = o.rotation.y;
  }

  /* ---------- Kamera ---------- */
  /** kurzes Kamerawackeln (Treffer) */
  shake = 0;
  private snapCam() { this.updateCam(1, true); }
  private tgt = new Vector3();
  private updateCam(dt: number, snap = false) {
    const inp = this.g.engine.input, st = this.g.save.data.settings;
    const k = .005 * st.camSpeed;
    this.cam.tYaw -= inp.look.x * k;
    this.cam.pitch = clamp(this.cam.pitch + inp.look.y * k * (st.invertY ? -1 : 1), .08, 1.1);
    this.cam.dist = clamp(this.cam.dist + inp.zoom * .8, 3.5, 14);
    if (!this.drive && inp.held('tabL')) this.cam.tYaw += dt * 2.2;
    if (!this.drive && inp.held('tabR')) this.cam.tYaw -= dt * 2.2;
    if (inp.pressed('camReset')) this.cam.tYaw = this.player.root.rotation.y + Math.PI;
    this.cam.yaw += (this.cam.tYaw - this.cam.yaw) * Math.min(1, dt * 12);
    const p = this.player.root.position;
    const tgt = this.tgt.set(p.x, p.y + 1.5, p.z);
    const want = new Vector3(
      tgt.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist,
      tgt.y + Math.sin(this.cam.pitch) * this.cam.dist,
      tgt.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist);
    // Kamera-Kollision: nicht in Häusern oder Autos stecken, sondern davor heranrücken
    const dir = want.subtract(tgt), cars = this.world.cars;
    let f = 1;
    for (let i = 1; i <= 14 && f === 1; i++) {
      const u = i / 14, x = tgt.x + dir.x * u, y = tgt.y + dir.y * u, z = tgt.z + dir.z * u;
      if (y < 7 && this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .35 && Math.abs(z - c.z) < c.hz + .35)) f = Math.max(.18, (i - 1) / 14);
      else if (y < 2.2 && cars.some((c) => Math.hypot(x - c.o.position.x, z - c.o.position.z) < 1.7)) f = Math.max(.18, (i - 1) / 14);
    }
    if (f < 1) want.copyFrom(tgt).addInPlace(dir.scale(f));
    Vector3.LerpToRef(this.camPos, want, snap ? 1 : Math.min(1, dt * (f < 1 ? 20 : 8)), this.camPos);
    this.camera.position.copyFrom(this.camPos);
    if (this.shake > 0) { this.shake = Math.max(0, this.shake - dt); const k = this.shake * .5; this.camera.position.x += (Math.random() - .5) * k; this.camera.position.y += (Math.random() - .5) * k; }
    this.camera.setTarget(tgt);
    this.clearView(tgt);
  }

  private radarT = 0;
  enter() { this.g.hud.radarOn(true); if (this.drive) { this.g.hud.radioBtn(true); this.radio(0); } }
  exit() { this.g.hud.radarOn(false); if (this.drive) this.radioOff(); }
  /** Missionsmarker wie im Open-World-Krimi: leuchtende Lichtsäule über dem Ziel */
  private beam: TransformNode | null = null;
  private beamMat: ReturnType<typeof glow> | null = null;
  private goalBeam(p: Vector3 | undefined, t: number, color = 0xff3fb0) {
    if (!this.beam) {
      const sc = this.scene, m = (this.beamMat = glow(sc, 0xff3fb0, 1, { alpha: .35, add: true, double: true }));
      this.beam = new TransformNode('beam', sc);
      const c = cyl(sc, .9, .9, 14, 20, false); c.position.y = 7; c.material = m; c.parent = this.beam; c.isPickable = false;
      const r = ring(sc, 1.1, 1.45, 32); r.position.y = .15; r.material = m; r.parent = this.beam;
    }
    this.beam.setEnabled(!!p && this.mode === 'play');
    if (!p) return;
    this.beam.position.set(p.x, 0, p.z);
    const bm = this.beamMat!;
    bm.alpha = .22 + Math.sin(t * 3) * .08;
    bm.albedoColor = color === 0xffd23b ? glowCol.gig : glowCol.story;
  }

  /* ---------- Aufträge per Anruf ---------- */
  gig: { g: Gig; i: number; t: number } | null = null;
  /** Regenbogen-Taxi: Zahl der Fahrten in Folge (-1 = aus) */
  taxi = -1;
  get driving() { return !!this.drive; }
  /** Tempo des gefahrenen Autos (0 zu Fuß) */
  get carSpeed() { return Math.abs(this.drive?.v || 0); }
  /** gefahrenes Auto (oder null) */
  get carNode() { return this.drive?.o || null; }
  /** Auto anhalten (z. B. beim Schaukeln an der ruhigen Ecke) */
  holdCar() { if (this.drive) this.drive.v = 0; }
  /** Aussteigen erzwingen (z. B. bei der Festnahme) */
  leaveCar() { if (this.drive) this.toggleCar('exit'); }
  /** Sichtbare Story-Figuren (für Schläge mit Spaßwaffen) */
  storyActors() { return this.npcs.filter((n) => n.a.root.visible && !n.talking).map((n) => ({ a: n.a, name: n.def.name, id: n.def.id })); }
  /** Story-Figur ist sauer auf dich (Freundschaft sinkt) */
  annoy(id: string) { const s = this.g.save.data, r = (s.rel[id] ||= { f: 0, last: 0 }); r.f = Math.max(0, r.f - 8); }
  /** Taxi-Schicht beginnen (nur im Auto) */
  startTaxi() { this.taxi = 0; this.startGig(nextFare(0, Math.random())); }
  private callT = 150;
  /** Paketdienst-Schicht (nur im Auto): Serie wie beim Taxi, mit Ladefläche mehr Lohn */
  parcel = -1;
  startParcel() { if (!this.drive) return; this.parcel = 0; const f = nextParcel(0, Math.random(), !!this.drive.def.cargo); toast(`📦 ${f.call}`); this.startGig(f); }
  /* ---------- Straßenrennen: im Auto an der Startflagge anhalten ---------- */
  private raceAsk = 0;
  private raceCheck(dt: number) {
    this.raceAsk -= dt;
    if (!this.drive || this.raceAsk > 0 || Math.abs(this.drive.v) > 2.5) return;
    const p = this.drive.o.position, r = RACES.find((q) => Math.hypot(q.start[0] - p.x, q.start[1] - p.z) < 5);
    if (!r) return;
    this.raceAsk = 12; this.drive.v = 0;
    const s = this.g.save.data, best = bestTime(s, r.id);
    this.g.dialog.say([{ who: '🏁 Rennleitung', color: '#ffd23b', text: `${r.name}: ${r.text} Gold bis ${r.medal[0]} s, Silber bis ${r.medal[1]} s, Bronze bis ${r.medal[2]} s.${best ? ` Deine Bestzeit: ${best.toFixed(1)} s.` : ''}`, choices: [
      { label: `Start! (bis ${r.prize[0]} €)`, fn: () => this.startRace(r) }, { label: 'Heute nicht', fn: () => {} }] }]);
  }
  startRace(r: Race) {
    const s = this.g.save.data;
    this.taxi = -1; this.parcel = -1; sfx('horn');
    this.startGig(raceGig(r, (sec) => {
      const res = finishRace(s, r, sec); this.raceAsk = 8;
      sfx(res.medal >= 0 ? 'win' : 'miss');
      this.g.hud.banner(res.medal >= 0 ? MEDALS[res.medal] : 'Im Ziel', `${r.name} in ${sec.toFixed(1)} s${res.record ? ' · neue Bestzeit' : ''}${res.pay ? ` · +${res.pay} €` : ''}`, res.medal >= 0 ? 'good' : 'info', 4600);
      this.g.save.write(); this.refreshHud();
    }, () => { this.raceAsk = 8; sfx('miss'); this.g.hud.banner('Zeit abgelaufen', `${r.name}: Bronze gibt es bis ${r.medal[2]} s. Gleich noch mal?`, 'bad', 3600); }));
  }
  /** Eigener Wagen: an die gemerkte Stelle stellen (oder vor die Garage) */
  async placeOwnCar(atGarage = false) {
    const s = this.g.save.data, def = myCar(s); if (!def) return;
    if (this.drive?.own) this.leaveCar();
    const [gx, gz, gy] = GARAGE.spawn, has = !atGarage && s.flags.ownX !== undefined;
    await this.street.spawnOwn(def, has ? Number(s.flags.ownX) : gx, has ? Number(s.flags.ownZ) : gz, has ? Number(s.flags.ownYaw) || 0 : gy, s.flags.carHue === undefined ? -1 : Number(s.flags.carHue));
    if (atGarage) { delete s.flags.ownX; delete s.flags.ownZ; delete s.flags.ownYaw; }
  }
  /** Auftrag annehmen (aus Anruf oder Handy-App) */
  startGig(g: Gig) {
    this.gig = { g, i: 0, t: g.time };
    this.g.hud.banner(g.title, `Auftrag von ${g.who}${g.car ? ' · Tipp: Mit dem Auto geht es schneller' : ''}`, 'info', 2600);
    sfx('open');
  }
  private gigTick(dt: number) {
    const s = this.g.save.data;
    if (!this.gig) {
      this.g.hud.gig(null);
      if (s.flags.sagaRun) delete s.flags.sagaRun; // Mission lief beim letzten Speichern noch
      this.raceCheck(dt);
      // ab und zu klingelt das Handy (erst nach der Einführung)
      if (s.step >= 2 || s.chapter > 1) this.callT -= dt;
      if (this.callT <= 0) { this.callT = 210 + Math.random() * 120; this.ring(); }
      return;
    }
    const q = this.gig, st = q.g.steps[q.i], p = this.player.root.position;
    q.t -= dt;
    this.g.hud.gig(`⏱ ${fmtTime(q.t)} · ${q.g.title} ${q.i + 1}/${q.g.steps.length}: ${st.label}`, q.t < 15);
    if (Math.hypot(p.x - st.x, p.z - st.z) < (this.drive ? 4.5 : 3)) {
      q.i++; sfx('coin');
      if (q.i < q.g.steps.length) { toast(`✓ ${st.label}`); return; }
      this.gig = null; this.g.hud.gig(null);
      if (q.g.quiet) { q.g.after?.(q.t); return; }
      s.money += q.g.pay; s.rep += q.g.rep; s.flags['gig_' + q.g.id] = s.day; s.flags.gigs = (Number(s.flags.gigs) || 0) + 1;
      sfx('win'); this.g.hud.banner('Auftrag erledigt!', `+${q.g.pay} € · +${q.g.rep} Ruf · ${q.g.done}`, 'good', 4200);
      this.player.play('cheer'); setTimeout(() => this.player.anim === 'cheer' && this.player.play('idle'), 1800);
      this.g.save.write(); this.refreshHud();
      if (q.g.after) { const f = q.g.after, left = q.t; setTimeout(() => f(left), 1800); }
      if (q.g.id === 'parcel' && this.parcel >= 0) {
        this.parcel++; s.flags.parcelBest = Math.max(Number(s.flags.parcelBest) || 0, this.parcel);
        setTimeout(() => { if (this.parcel >= 0 && this.drive && !this.gig) { const f = nextParcel(this.parcel, Math.random(), !!this.drive.def.cargo); toast(`📦 ${f.call}`); this.startGig(f); } else this.parcel = -1; }, 2600);
      }
      // Taxi-Schicht: nächster Fahrgast meldet sich, solange du im Auto sitzt
      if (q.g.id === 'taxi' && this.taxi >= 0) {
        this.taxi++; s.flags.taxiBest = Math.max(Number(s.flags.taxiBest) || 0, this.taxi);
        setTimeout(() => { if (this.taxi >= 0 && this.drive && !this.gig) { const f = nextFare(this.taxi, Math.random()); toast(`🚕 ${f.who}: ${f.call}`); this.startGig(f); } else this.taxi = -1; }, 2600);
      }
      return;
    }
    if (q.t <= 0 && q.g.quiet) { q.g.failed?.(); this.gig = null; this.g.hud.gig(null); return; }
    if (q.t <= 0) { if (q.g.id === 'taxi') this.taxi = -1; if (q.g.id === 'parcel') this.parcel = -1; q.g.failed?.(); this.gig = null; this.g.hud.gig(null); sfx('miss'); this.g.hud.banner('Auftrag gescheitert', 'Zu spät. Vielleicht klappt es beim nächsten Anruf.', 'bad'); }
  }
  /** Anruf: annehmen oder ablehnen */
  private ring() {
    const g = pickCall(this.g.save.data, Math.random());
    if (!g) return;
    sfx('phone'); setTimeout(() => sfx('phone'), 500);
    if (!this.drive) this.player.play('phone');
    const back = () => { if (this.player.anim === 'phone') this.player.play('idle'); };
    this.g.dialog.say([{ who: `📞 ${g.who}`, color: g.color, text: g.call, choices: [
      { label: `Annehmen (${g.pay} €, ${fmtTime(g.time)} Min.)`, fn: () => { back(); this.startGig(g); } },
      { label: 'Gerade nicht', fn: () => { back(); toast(`${g.who}: Okay, ich frag jemand anderen.`); } }] }]);
  }

  /* ---------- Autoradio: 13 echte Sender (laut.fm) und vier Stadt-Sender, Senderrad wie im Open-World-Krimi ---------- */
  private radio(dir = 0, to?: number) {
    const s = this.g.save.data, n = STATIONS.length, was = radio.state.st;
    let i = STATIONS.indexOf(stationOf(s.flags.radio));
    i = to ?? ((i + dir) % n + n) % n;
    const st = STATIONS[i]; s.flags.radio = st.id;
    if (st !== was || !(radio.state.on || radio.state.loading) && st.id !== 'off') radio.tune(st);
    this.showRadio();
  }
  private showRadio(wheel = true) {
    const r = radio.state, st = r.st;
    const song = r.title ? (r.artist ? `${r.title} · ${r.artist}` : r.title) : '';
    const sub = r.err || (st.slug ? (r.loading ? 'Sender wird eingestellt …' : song || 'Live') : st.sub);
    if (wheel) this.g.hud.radioWheel(STATIONS, STATIONS.indexOf(st), st.name, sub, !!st.slug && !r.err);
    this.g.hud.nowPlaying(st.id === 'off' ? null : `${st.icon} ${st.name}`, st.slug ? (r.err || song || (r.loading ? '…' : 'Live')) : st.sub);
  }
  private radioOff() { radio.stop(); this.g.hud.nowPlaying(null); this.g.hud.radioWheel(null); this.g.hud.radioBtn(false); }

  /** Laternen, Masten, Bänke und Bäume zwischen Kamera und Figur ausblenden, statt durch sie hindurchzuschauen */
  private hidden = new Set<TransformNode>();
  private clearView(tgt: Vector3) {
    const c = this.camPos, sx = tgt.x - c.x, sz = tgt.z - c.z, len2 = sx * sx + sz * sz || 1;
    const now = new Set<TransformNode>();
    for (const q of this.world.props) {
      const dx = q.x - c.x, dz = q.z - c.z;
      if (dx * dx + dz * dz > 400) continue;
      const u = (dx * sx + dz * sz) / len2;
      if (u > .92) continue;
      const cu = Math.max(0, u), ex = c.x + sx * cu - q.x, ez = c.z + sz * cu - q.z;
      if (ex * ex + ez * ez < (q.r + .55) ** 2) q.o.forEach((o) => now.add(o));
    }
    this.hidden.forEach((o) => { if (!now.has(o)) o.setEnabled(true); });
    now.forEach((o) => o.setEnabled(false));
    this.hidden = now;
  }

  /* ---------- Bild für Bild ---------- */
  private plazaRef = new Vector3(-15, 0, 15);
  update(dt: number, t: number) {
    const g = this.g, s = g.save.data;
    this.bloom = .35 + this.world.night * .5;
    // Figuren nur in der Nähe animieren (Leistung)
    const ref = this.mode === 'play' ? this.player.root.position : this.plazaRef;
    for (const n of this.npcs) {
      const near = Vector3.DistanceSquared(n.a.root.position, ref) < 70 * 70;
      if (near) n.a.update(dt);
      if (!n.talking && n.def.walk) this.walkNpc(n, dt);
      n.a.root.visible = (!n.def.night || this.world.night > .4) && !hidden(s, n.def.id);
    }
    for (const a of this.crowd) if (a.root.visible) a.update(dt);
    this.street.update(dt, this.world.night, s.settings.adult, ref);
    this.stickerMeshes.forEach((m) => { m.rotation.y = t * 2; m.position.y = 1.4 + Math.sin(t * 3 + m.metadata.i) * .15; });

    if (this.mode === 'title') {
      this.titleT += dt;
      const a = this.titleT * .07;
      this.camera.position.set(-15 + Math.sin(a) * 11, 3.6 + Math.sin(a * .7) * .8, 15 + Math.cos(a) * 11);
      this.camera.setTarget(new Vector3(-15 - Math.sin(a) * 2, 1.6, 15 - Math.cos(a) * 2));
      this.world.follow(this.plazaRef);
      this.world.update(dt, t);
      return;
    }

    // Spielzeit läuft nur ohne Dialog und Menü
    const busy = g.dialog.open || g.menuOpen;
    radio.duck(busy);
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
    if (!busy) { if (this.drive) this.moveCar(dt); else this.movePlayer(dt); this.kerb.update(dt, t); }
    this.updateCam(dt);
    this.world.follow(this.player.root.position);
    this.world.update(dt, t, this.player.root.position);

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = .5; if (!busy) storyTick(this.ctx()); this.refreshHud(); if (mood(s) >= 75 && !busy) g.done(track(s, 'mood')); }
    const mk = busy ? [] : this.markers();
    g.hud.markers(mk, (q) => g.engine.project(q));
    if ((this.radarT -= dt) <= 0) {
      this.radarT = 1 / 20;
      const pp = this.player.root.position;
      g.hud.radar(pp.x, pp.z, this.cam.yaw, [
        ...this.world.pois.filter((q) => Math.hypot(q.x - pp.x, q.z - pp.z) < 60).map((q) => ({ x: q.x, z: q.z, icon: q.icon })),
        ...mk.map((m) => ({ x: m.pos.x, z: m.pos.z, color: m.id === 'g' ? '#ff3fb0' : m.id === 'gig' ? '#ffd23b' : m.id === 'kerb' ? '#ff6ad5' : '#ffffff', goal: m.id === 'g' || m.id === 'gig' || m.id === 'kerb' })),
      ]);
    }
    // Lichtsäule: laufender Auftrag hat Vorrang (gelb), sonst das Story-Ziel (pink)
    const gm = mk.find((m) => m.id === 'gig' || m.id === 'kerb');
    this.goalBeam((gm || mk.find((m) => m.id === 'g'))?.pos as Vector3 | undefined, t, gm ? 0xffd23b : 0xff3fb0);
    if (!busy) this.gigTick(dt);
    if (!busy) this.combat.update(dt, t);
    if (!busy) {
      this.findNear();
      const inp = g.engine.input;
      if (inp.pressed('confirm')) { inp.consume('confirm'); this.interact(); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('attack')) { inp.consume('attack'); if (this.drive) this.kerb.honk(); else this.combat.attack(); }
      else if (inp.pressed('weapon')) { inp.consume('weapon'); this.combat.cycle(); }
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
      // Figuren schieben sich sanft auseinander, statt ineinander zu laufen
      const bump = (q: Vector3, m: number) => { const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz); if (d < m && d > 0) { p.x += dx / d * (m - d); p.z += dz / d * (m - d); } };
      for (const n of this.npcs) bump(n.a.root.position, .75);
      for (const n of this.street.people) if (n.a.root.visible) bump(n.a.root.position, .75);
      if (this.world.night > .5) for (const a of this.crowd) bump(a.root.position, .75);
      for (const c of this.street.parked) { const dx = p.x - c.o.position.x, dz = p.z - c.o.position.z, d = Math.hypot(dx, dz); if (d < 1.9 && d > 0) { p.x += dx / d * (1.9 - d); p.z += dz / d * (1.9 - d); } }
      const want = Math.atan2(dx, dz);
      let d = want - this.player.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.player.root.rotation.y += d * Math.min(1, dt * 14);
      // langsam = gehen, sonst joggen, mit Turbo rennen (Schrittweite passend zur Geschwindigkeit)
      const v = sp * Math.min(1, mag), jog = v > 2.2;
      this.player.play(jog ? 'run' : 'walk', .18, jog ? Math.min(1.75, v / RUN_MPS) : Math.max(.6, v / WALK_MPS));
      this.stepT -= dt * (run ? 1.6 : jog ? 1.25 : 1);
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
    p.x += (dx / d) * 1.4 * dt; p.z += (dz / d) * 1.4 * dt;
    n.a.root.rotation.y = Math.atan2(dx, dz);
    n.a.play('walk', .25, 1.4 / WALK_MPS);
  }

  private checkStickers() {
    const p = this.player.root.position, s = this.g.save.data;
    for (const m of this.stickerMeshes) {
      if (!m.isEnabled()) continue;
      if (dist(m.position, p) < 1.4) {
        m.setEnabled(false); s.goals.push('sticker' + m.metadata.i); s.glitter += 10;
        const n = s.goals.filter((x) => x.startsWith('sticker')).length;
        sfx('win'); toast(`🌈 Pride-Sticker ${n}/${STICKERS.length} gefunden! +10 Glitzer`);
        if (n === STICKERS.length) { s.rep += 10; toast('Alle Sticker gesammelt! +10 Ruf'); }
        this.player.play('cheer'); setTimeout(() => this.player.anim === 'cheer' && this.player.play('idle'), 1500);
        this.g.save.write();
      }
    }
  }
}

const glowCol = { gig: col(0xffd23b), story: col(0xff3fb0) };
