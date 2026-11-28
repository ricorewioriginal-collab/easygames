/* Stadt-Szene (Babylon.js): Rainbow City zum Herumlaufen (Spielmodus) und als Kulisse fürs Titelmenü (Kameraflug,
   tanzende Leute). Alle Menschen sind Rocketbox-Figuren. */
import { SZENE } from './szene';
import { cullAhead } from '../engine/Cull';
import type { GameScene } from '../engine/Engine';
import { Vector3, TransformNode, type Mesh, type FreeCamera, type Scene, clamp, dist, col } from '../engine/bjs';
import { planeZ, cyl, ring, glow, canvasTex, torus } from '../engine/geo';
import { Actor, streetLook, playerLook, WALK_MPS, RUN_MPS, type Look } from './Actor';
import { World, walkable, isLand } from './World';
import type { CarDef } from './vehicles';
import { history } from './faden';
import { stranger } from './flirt';
import { nachtBought, nachtParty } from './nacht';
import { pcEvents } from './hooks';
import { NPCS, CHAPTERS, goal, talk, poi as storyPoi, marks, hidden, storyTick, chapterLabel, type NpcDef, type StoryCtx } from './story';
import type { Game } from './Game';
import { radio, STATIONS, stationOf } from '../engine/Radio';
import { radioMenu } from './radioui';
import { RACES, MEDALS, raceGig, finishRace, bestTime, nextParcel, stats, myCar, tuneLevel, GARAGE, type Race } from './vehicles';
import { sfx, music, buzz, engineHum, vol } from '../engine/Audio';
import { route, onGrid } from './traffic';
import { memOf, remember, saveMem, outfitLine, FIG_STORIES, figKey, nextPart, heardPart, finish } from './leben';
import { toast, hints, type Line } from '../ui/ui';
import { sprintSpeed, tiredAt, gainAus, ausdauer, buffOf } from './fit';
import { TANK, tankOf, burn } from './tank';
import { TANKE } from './uptown';
import { Jagd } from './jagd';
import { BusRide } from './busfahrt';
import { rollEvent, testDue, post } from './social';
import { advance, minutesUntil, change, track, mood, moodIcon, NEEDS, clock as lifeClock, hour as lifeHour, DAY_SEC } from './life';
import type { Marker } from '../ui/Hud';
import { type Gig, pickCall, fmtTime } from './gigs';
import { Brawl } from './Brawl';
import { collect, collectNotes, nextFare } from './empire';
import { Street, type Parked, type StreetNpc } from './Street';
import { WORLDS, ISLES, ISLE_BOUNDS, worldDef, cityGate, cityIsle } from './worlds';
import { Isle } from './Isle';
import { buildFlitzer } from './flitzer';
import { buildRingMobil, buildSilhouettes } from './toys';
import { PLACE_THEMES, houseTheme } from './interiors';
import { Weather, SKY, useSeason, isXmas, season } from './weather';
import { Fireworks, XmasTree } from './feuerwerk';
import { LiveCity } from './live';
import { buildPad } from './luft';
import { Trouble } from './trouble';
import { CityLife } from './citylife';
import { Friends } from './Friends';
import { Companion } from './Companion';
import { together, bondTick } from './bond';
import type { Profile } from './social';
import { Combat } from './Combat';
import { payKasse } from './crew';
import { arrive } from './family';
import { Kerb } from './kerb';
import { TuneShow, rigOf, dress } from './pimp';
import { readPimp, isStock } from './tuning';
import { PhotoMode } from './fotomodus';
import { Stunts, goViral, canGoViral, type Stunt } from './viral';
import { bulletin } from './news';
import { isParade } from './gram';

interface Npc { def: NpcDef; a: Actor; wp: number; wait: number; talking: boolean }

export const STICKERS: Array<[number, number]> = [[-15, 24], [45, 52], [-50, -50], [52, -30], [-45, 45], [18, -52], [-28, -32], [28, 28]];
const L = (rb: string): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0 });

export class CityScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = 0;
  world!: World;
  /** Polizei jagt selbst Verdächtige (jagd.ts) */
  jagd!: Jagd;
  /** Linie 69 in 3D (busfahrt.ts) */
  bus!: BusRide;
  player!: Actor;
  mode: 'title' | 'play' = 'title';
  private npcs: Npc[] = [];
  private crowd: Actor[] = [];
  private cam = { yaw: Math.PI, pitch: .38, dist: 7.5, tYaw: Math.PI };
  private camPos = new Vector3();
  private stickerMeshes: Mesh[] = [];
  private near: { kind: 'npc' | 'poi' | 'street' | 'car' | 'house' | 'life' | 'live' | 'buddy' | 'friend' | 'isle' | 'trunk' | 'dog'; id: string; label: string } | null = null;
  street!: Street;
  combat!: Combat;
  /** Schlägereien und Verfolgungen der Missionen (Akt IV) */
  brawl!: Brawl;
  kerb!: Kerb;
  weather!: Weather;
  /** Feuerwerk (Silvester, Samstagnacht, Live-Events) und Live-Events der Woche */
  fw!: Fireworks;
  live!: LiveCity;
  private xmas!: XmasTree;
  /** leuchtender Ring für Flug-Stationen in der Luft (luft.ts) */
  private airRing: Mesh | null = null;
  life!: CityLife;
  /** Ärger auf der Straße: Taschendiebe, Autoklau, Schlägereien, Rennen (trouble.ts) */
  trouble!: Trouble;
  buddy!: Companion;
  /** Online: Freund*innen in deiner Stadt */
  friends!: Friends;
  /** Auto, in dem die Spielfigur gerade sitzt */
  private drive: Parked | null = null;
  /** Wagen, in dem du gerade sitzt (für Aufträge von außen) */
  get car() { return this.drive; }
  /** Filmkamera (Show „Aufgemotzt!“): ersetzt die Folgekamera, solange gesetzt */
  cine: ((dt: number) => void) | null = null;
  private showRef: TuneShow | null = null;
  /** Fotomodus (fotomodus.ts): Figur bleibt stehen, Kamera frei */
  photo = false;
  private photoRef: PhotoMode | null = null;
  get photos() { return (this.photoRef ||= new PhotoMode(this.g, this)); }
  /** Leute im Bild (für Glitzergram): Figuren der Geschichte, Passant*innen, Partyvolk, bis 25 m vor der Kamera */
  peopleInView() {
    const cam = this.camera.position, list: Vector3[] = [];
    for (const n of this.npcs) if (n.a.root.visible) list.push(n.a.root.position);
    for (const n of this.street.people) if (n.a.root.visible) list.push(n.a.root.position);
    for (const a of this.crowd) if (a.root.visible) list.push(a.root.position);
    let k = 0;
    for (const p of list) {
      if (Vector3.Distance(p, cam) > 25) continue;
      const q = this.g.engine.project({ x: p.x, y: p.y + 1.2, z: p.z });
      if (!q.behind && q.x > 0 && q.x < innerWidth && q.y > 0 && q.y < innerHeight) k++;
    }
    return k;
  }
  get show() { return (this.showRef ||= new TuneShow(this.g, this)); }
  private stepT = 0;
  private warnT = 30;
  private evT = 90;
  private hudT = 0;
  private titleT = 0;

  constructor(private g: Game) {
    // Sterling Nights: Kauf des Prisma schließt die Reihe ab (Anruf von Rocco, sobald das Kaufmenü zu ist)
    pcEvents.on('clubGekauft', (e) => setTimeout(() => nachtBought(this.ctx(), e.id), 2500));
    pcEvents.on('clubNacht', (e) => setTimeout(() => nachtParty(this.ctx(), e), 2500));
    this.scene = g.engine.newScene(0x8fb8e8);
    cullAhead(this.scene); // Babylon prüft sonst jedes Bild alle 4.000+ Meshes, auch die hinter der Kamera
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
      const a = await Actor.create(sc, { ...L(rb), style: ['drag', 'crop', 'trans', 'regenbogen', 'gold', 'leder'][i] });
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
      const a = await Actor.create(sc, { ...L(qa[i]), style: ['lesbisch', 'lederjacke', 'glitzer', 'bear', 'pan'][i] });
      a.root.position.set(x, .1, z); a.root.rotation.y = yaw + (i % 2 ? .4 : -.3);
      a.play((['phone', 'talk', 'dance2', 'drink', 'laugh'] as const)[i], 0, .9);
      this.crowd.push(a);
    }));
    this.street = new Street(sc, this.world);
    await this.street.build();
    // Penis-Silhouetten (18+) bzw. Herzen in Park, Himmel, Neon und Graffiti
    this.sil = buildSilhouettes(sc, this.world.root, this.world.low);
    // Welten als echte Inseln vor dem Kai (nahtlos, Isle.ts), je mit einem Flitzer am Brückentor
    for (const [id, at] of Object.entries(ISLES)) {
      const def = worldDef(id); if (!def) continue;
      const to = at.to ? ISLES[at.to] : undefined, td = at.to ? worldDef(at.to) : undefined;
      const i = new Isle(this.g, sc, this.world, def, at.x, at.z, to && td ? { x: to.x, z: to.z, r: td.r, icon: td.icon, name: td.name, color: td.host.color } : undefined);
      await i.build(); this.isles.push(i); if (!def.adult) this.street.addFlyer(i.pad[0], i.pad[1], i.yawW(Math.PI));
    }
    this.combat = new Combat(this.g, this, sc); this.combat.init();
    this.brawl = new Brawl(this, sc, this.g.hud, () => this.g.save.data);
    this.kerb = new Kerb(this.g, this);
    this.g.hud.onWeapon = () => { if (this.mode === 'play') this.combat.cycle(); };
    this.g.hud.setRadarMap((c, px) => {
      c.fillStyle = '#123a52'; c.fillRect(0, 0, 1536, 1536);                     // Wasser
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
      for (const i of this.isles) {                                             // Inseln der Welten mit Brücke und Ringstraße
        if (i.locked) continue;
        const d = i.def, [a, b] = i.bridge();
        c.strokeStyle = '#c9ccd6'; c.lineCap = 'butt'; c.lineWidth = 20; c.beginPath(); c.moveTo(px(i.ox), px(i.oz)); c.lineTo(px(b[0]), px(b[1])); c.stroke();
        c.fillStyle = '#e8dcae'; c.beginPath(); c.arc(px(i.ox), px(i.oz), (d.r + 5) * 2, 0, 7); c.fill();
        c.fillStyle = '#' + d.ground.toString(16).padStart(6, '0'); c.globalAlpha = .75; c.beginPath(); c.arc(px(i.ox), px(i.oz), d.r * 2, 0, 7); c.fill(); c.globalAlpha = 1;
        c.lineWidth = 14; c.beginPath(); c.moveTo(px(i.ox), px(i.oz)); c.lineTo(px(a[0]), px(a[1])); c.stroke();
        const [rx, rz, rw, rh] = i.ring(); c.strokeRect(px(rx), px(rz), rw * 2, rh * 2);
      }
      c.fillStyle = '#c9ccd6';
      for (let i = -60; i <= 60; i += 30) { c.fillRect(px(-64), px(i - 3.6), 128 * 2, 7.2 * 2); c.fillRect(px(i - 3.6), px(-64), 7.2 * 2, 128 * 2); }
      c.fillRect(px(-80), px(-1.8), 20 * 2, 3.6 * 2);                             // Kaistraße
    });
    // Verkehr hält vor geparkten und vom Spieler gefahrenen Autos
    this.g.hud.onRadio = () => { if (this.drive) radioMenu(this.g, (i) => this.radio(0, i)); };
    radio.subscribe((r, what) => { if (!this.drive) return; if (what === 'error') toast(`📻 ${r.err}`); this.showRadio(); });
    this.weather = new Weather(this.scene, this.world); this.fw = new Fireworks(this.scene, this.world); this.live = new LiveCity(this.g, this, this.scene, this.fw);
    this.xmas = new XmasTree(this.scene, -22, 9); buildPad(this.scene, this.world.root);
    this.life = new CityLife(this.g, this, this.scene); this.trouble = new Trouble(this.g, this); this.jagd = new Jagd(this); this.bus = new BusRide(this.g, this); this.buddy = new Companion(this.scene);
    this.friends = new Friends(this.scene, this.world, () => this.g.save.data.settings.adult);
    this.friends.me = () => ({ n: this.g.save.data.name, l: streetLook(playerLook(this.g.save.data)), s: this.g.where === 'inside' && this.g.inside?.netKey ? this.g.inside.netState() : this.netState() });
    this.friends.onInvite = (who, inv) => this.g.clubInvite(who.name, inv);
    this.friends.onNote = (text, kind) => { toast(text, 3600); sfx(kind === 'join' ? 'win' : kind === 'leave' ? 'back' : 'move'); };
    this.world.extraBlock = (x, z) => this.bus?.blocks(x, z) || this.street.parked.some((c) => Math.hypot(c.o.position.x - x, c.o.position.z - z) < 2.6);
    // Leute auf der Straße: richtiger Name statt „Passant“, Gedächtnis für dich (leben.ts)
    const pkey = (n: StreetNpc) => 'street:' + this.street.people.indexOf(n) + ':' + n.a.avatar.id;
    this.street.people.forEach((n) => { if (/^(Passant|Spaziergänger|Nachbar|Tourist|Studentin|Geschäftsmann)/.test(n.name)) n.name = stranger(pkey(n), n.a.avatar.id).name; });
    this.street.onDodge = (n) => remember(this.g.save.data, pkey(n), 'near');
    this.street.onCrowd = (n, stalk) => {
      const s = this.g.save.data, k = pkey(n), m = memOf(s, k); m.mood = Math.max(-5, m.mood - 1); saveMem(s, k, m);
      const L = stalk ? ['Verfolgst du mich etwa?!', 'Okay, das wird mir jetzt zu gruselig.', 'Läufst du mir nach? Ich ruf gleich meine Freundin an!'] : ['Äh, geht\'s noch? Etwas Abstand bitte!', 'Personal Space, Schätzchen!', 'Du stehst mir auf den Füßen!'];
      toast(`${stalk ? '😨' : '😒'} ${n.name}: „${L[Math.floor(Math.random() * L.length)]}“`, 2200);
    };
    this.street.onPass = (n) => {
      const s = this.g.save.data, m = memOf(s, pkey(n));
      if (m.near > 0 && m.mood < 0) { toast(`😒 ${n.name}: „Ach, du schon wieder. Heute zu Fuß, ja?“`, 2200); return; }
      // Fremde kommentieren manchmal dein Outfit
      if (m.met === 0 && this.passT < this.time - 15) { const line = outfitLine(String(s.flags.outfit || 'clothed'), s.settings.adult, this.weather.rain > .2, Math.floor(this.time * 7) + n.name.length); if (line) { this.passT = this.time; toast(`💬 ${n.name}: „${line}“`, 2400); } return; }
      if (m.met > 0 && this.passT < this.time - 12) { this.passT = this.time; n.a.play('wave'); setTimeout(() => n.a.anim === 'wave' && n.a.play('idle'), 1600); toast(`👋 ${n.name}: „${m.mood >= 3 ? 'Hey ' + s.name + '! 🥰' : 'Hi ' + s.name + '!'}“`, 2000); }
    };
    // Verkehr: lenkt an geparkten Autos vorbei, hupt, wenn du im Weg stehst
    this.world.statics = () => this.street.parked.filter((c) => c !== this.drive).map((c) => c.o.position);
    this.world.onHonk = (c) => { if (Vector3.Distance(c.o.position, this.player.root.position) < 26) { sfx('horn'); if (!this.drive && Math.random() < .5) toast(HONK[Math.floor(Math.random() * HONK.length)], 2000); } };
    this.buildStickers();
    this.world.castShadows();
    // Schatten folgen der Grafikstufe (niedrig = aus)
    this.g.engine.onQuality((q) => { this.world.sun.shadowEnabled = q > 0; this.world.setShadowSize(q === 2 ? 2048 : 1024); this.world.setLow(q === 0); });
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
    this.drive = null; this.g.touch.fly(false); this.g.hud.speedo(null);
    this.player.root.visible = true;
    this.player.setLook(streetLook(playerLook(s)));
    this.friends.relook();
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
        g.chapterCard(`Kapitel ${done.n} abgeschlossen`, done.title, sum).then(() => { if (next) g.chapterCard(`Kapitel ${next.n}`, next.title, next.text).then(() => history(s, 'k' + next.n, (k, x, y) => g.chapterCard(k, x, y).then(() => this.wissenTip(k)))); });
      },
      enterHome: (after) => g.enterHome(after),
      barShift: (done) => g.barShift(done),
      credits: () => g.ending(),
      card: (k, t, x) => g.chapterCard(k, t, x).then(() => this.wissenTip(k)),
      roman: (id, game, done) => g.roman(id, game, done),
      mission: (gg) => this.startGig(gg),
      mini: (id, done) => g.playMini(id, { onDone: (r) => done?.(!!r.won && !r.quit) }),
      gigOn: () => !!this.gig,
      wanted: (n) => { if (n !== undefined) this.combat.force(n, 'verdacht'); return this.combat.wanted.stars; },
      phone: (lines, done) => {
        sfx('phone'); setTimeout(() => sfx('phone'), 500);
        if (!this.drive) this.player.play('phone');
        g.dialog.say(lines, () => { if (this.player.anim === 'phone') this.player.play('idle'); done?.(); this.refreshHud(); g.save.write(); });
      },
    };
  }

  /** Nach der ersten „Damals“-Karte einmal auf die Wissen-App hinweisen */
  private wissenTip(kick: string) {
    const s = this.g.save.data;
    if (!kick.startsWith('Damals') || s.flags.wissenTip) return;
    s.flags.wissenTip = true; toast('🧠 Mehr Geschichte, Flaggen und ein Quiz mit Hilde: Handy → Wissen');
  }

  refreshHud() {
    if (this.mode !== 'play' && this.g.where === 'city') return;
    const s = this.g.save.data, gl = goal(s);
    this.g.stiCheck();
    const paid = collect(s);
    if (paid) { sfx('coin'); this.g.hud.banner('💼 Einnahmen deines Imperiums', `+${paid} € aus deinen Geschäften`, 'good', 3600); collectNotes.slice(0, 3).forEach((n, i) => setTimeout(() => toast(n), 3800 + i * 2600)); this.g.save.write(); }
    const kasse = payKasse(s);
    if (kasse) { sfx('coin'); setTimeout(() => this.g.hud.banner('🪙 Kiezkasse der Lichterkette', `+${kasse} € aus den geschützten Vierteln`, 'good', 3600), paid ? 4200 : 0); this.g.save.write(); }
    for (const [i, n] of bondTick(s).entries()) setTimeout(() => toast(n), 1200 + i * 2600);
    const nk = arrive(s);
    if (nk) { sfx('win'); this.g.hud.banner('👶 Willkommen zu Hause!', `${nk.name} ist bei euch eingezogen. Schau in deiner Wohnung vorbei.`, 'good', 5000); this.g.save.write(); void this.g.home?.syncFamily(); }
    this.world.traces.visible = s.settings.adult;
    if (this.g.where === 'city' && this.mode === 'play') this.combat?.showWeapon(); else { this.g.hud.weapon(null); this.g.hud.wanted(0); }
    if (this.g.where === 'inside' && this.g.inside) this.g.hud.goal(this.g.inside.theme.icon + ' Drinnen', this.g.inside.theme.title, `Ziel: ${gl.title}`);
    else if (this.g.where === 'home') this.g.hud.goal('Zuhause', 'Deine Wohnung', s.chapter === 1 && s.step === 2 ? 'Schau dich um.' : `Ziel: ${gl.title}`);
    else if (this.isles.some((i) => i.active)) this.g.hud.goal(...this.isles.find((i) => i.active)!.goal());
    else this.g.hud.goal(chapterLabel(s), gl.title, gl.sub);
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], bf = buffOf(s);
    this.g.hud.stats([`${days[(s.day - 1) % 7]} ${this.clock()} ${this.world.night > .5 && (this.weather?.sky || 'klar') === 'klar' ? '🌙' : SKY[this.weather?.sky || 'klar'].icon}`, `💶 ${s.money} €`, `${moodIcon(mood(s))} ${Math.round(mood(s))}`, ...(bf ? [`${bf.icon} ${bf.name} ${Math.max(1, Math.round(bf.left * 60))}′`] : [])]);
    this.g.hud.needs(s.needs);
  }

  private markers(): Marker[] {
    const s = this.g.save.data, gl = goal(s), out: Marker[] = [];
    const at = (p: Vector3, y: number) => new Vector3(p.x, y, p.z);
    if (gl.npc) { const n = this.npcs.find((x) => x.def.id === gl.npc); if (n) out.push({ id: 'g', icon: '⭐', label: n.def.name, pos: at(n.a.root.position, 2.6) }); }
    if (gl.poi) { const p = this.world.pois.find((x) => x.id === gl.poi); if (p) out.push({ id: 'g', icon: '⭐', label: p.name, pos: new Vector3(p.x, 4, p.z) }); }
    if (gl.isle) { const i = this.isles.find((x) => x.def.id === gl.isle); if (i && !this.isles.some((x) => x.active)) { const [x, z] = i.w(i.def.host.x, i.def.host.z); out.push({ id: 'g', icon: i.def.icon, label: i.def.name, pos: new Vector3(x, 3, z) }); } }
    if (this.gig) { const st = this.gig.g.steps[this.gig.i]; out.push({ id: 'gig', icon: st.icon, label: st.label, pos: new Vector3(st.x, st.y ?? 3, st.z) }); }
    out.push(...this.live.markers());
    if (this.drive && !this.gig) { const p = this.drive.o.position; for (const r of RACES) if (Math.hypot(r.start[0] - p.x, r.start[1] - p.z) < 90) out.push({ id: 'race' + r.id, icon: '🏁', label: r.name, pos: new Vector3(r.start[0], 3, r.start[1]) }); }
    if (this.kerb?.spot) out.push({ id: 'kerb', icon: '🌙', label: this.kerb.spot.name, pos: new Vector3(this.kerb.spot.x, 3, this.kerb.spot.z) });
    for (const [id, icon] of marks(s)) { const n = this.npcs.find((x) => x.def.id === id); if (n?.a.root.visible) out.push({ id: 'p' + id, icon, pos: at(n.a.root.position, 2.5) }); }
    const lm = this.life?.marker(); if (lm && !this.drive) out.push(lm);
    const tm = this.trouble?.marker(); if (tm) out.push(tm);
    if (this.friends?.net.on) for (const m of this.friends.list) { const q = this.friends.posOf(m.id); if (q) out.push({ id: 'fr' + m.id, icon: m.st.c ? '🚗' : '🌐', label: m.name, pos: new Vector3(q.x, m.st.c ? 2.6 : 2.35, q.z) }); }
    for (const i of this.isles) out.push(...i.markers());
    if (s.pin) { const p = this.world.pois.find((x) => x.id === s.pin); if (p) out.push({ id: 'pin', icon: '📍', label: p.name, pos: new Vector3(p.x, 4, p.z) }); }
    const ph = this.life?.parade.head(); if (ph && Vector3.Distance(ph, this.player.root.position) > 26) out.push({ id: 'parade', icon: '🏳️‍🌈', label: 'CSD-Parade', pos: ph });
    return out;
  }

  /* ---------- Interaktion ---------- */
  private findNear() {
    const p = this.player.root.position;
    let best: typeof this.near = null, bd = 1e9;
    if (this.drive) {
      const curb = this.kerb.nearCurb();
      this.near = { kind: 'car', id: 'exit', label: this.drive.def.air ? `${this.drive.def.icon} Aussteigen` : this.drive.def.fly ? '🚀 Absteigen' : this.drive.def.toy ? '⭕ Absteigen' : rideSeat(this.drive.def) >= 0 ? `${this.drive.def.icon} Absteigen` : this.kerb.rider ? `🚗 Aussteigen · ${this.kerb.rider.name} fährt mit` : curb ? `🚗 Aussteigen · 📯 Hupen: ${curb.name} steigt vielleicht ein` : '🚗 Aussteigen' };
      // im Flug keine Einblendung (verdeckt die Sicht): erst am Boden steht „Absteigen“ da
      const air = !!this.drive.def.fly && this.alt > 1.6;
      this.g.hud.prompt(air ? null : this.near.label); this.g.touch.label(air ? 'Landen' : 'Raus');
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
    { const lf = this.life.near(p); if (lf && !best) best = { kind: 'life', id: 'life', label: lf }; }
    { const lv = best ? null : this.live.near(p); if (lv) best = { kind: 'live', id: 'live', label: lv }; }
    { const fr = this.friends.net.on && !best ? this.friends.nearest(p, 2.2) : null; if (fr) best = { kind: 'friend', id: fr.id, label: '🌐 ' + fr.name }; }
    { const bp = this.buddy.pos; if (bp && !best && Vector3.Distance(bp, p) < 2.1) best = { kind: 'buddy', id: 'buddy', label: '💬 ' + this.buddy.who!.name }; }
    if (!best) for (const i of this.isles) if (i.label) best = { kind: 'isle', id: i.def.id, label: i.label };
    if (!best) for (const n of this.npcs) {
      if (!n.a.root.visible) continue;
      const d = Vector3.Distance(n.a.root.position, p);
      if (d < 2.6 && d < bd) { bd = d; best = { kind: 'npc', id: n.def.id, label: 'Sprechen mit ' + n.def.name }; }
    }
    const icon: Record<string, string> = { worker: '🏮 Escort · ', curb: '💋 Laternenmeile · ', police: '🚓 ', fire: '🚒 ', medic: '🚑 ', security: '🛡️ ', chef: '👩‍🍳 ', courier: '📦 ' };
    if (!best) { const dn = this.street.nearDog(p, 1.8); if (dn) best = { kind: 'dog', id: String(this.street.people.indexOf(dn)), label: `🐶 ${dn.dogName} · ${dn.name} fragen` }; }
    if (!best) { const st = this.street.near(p); if (st) best = { kind: 'street', id: String(this.street.people.indexOf(st)), label: (st.kind === 'szene' ? (SZENE[st.id!]?.icon || '💬') + ' ' : icon[st.kind] || '💬 ') + st.name }; }
    // auf der Flucht: am Kofferraum eines Wagens umziehen und die Polizei austricksen
    if (!best && this.combat.wanted.stars > 0) {
      const pc = this.street.parked.find((c) => !c.def.fly && !c.def.air && !c.def.ride && !c.def.toy && Vector3.Distance(c.o.position, p) < 3.4), tc = pc ? null : this.street.nearTraffic(p, 4.2);
      const o = pc?.o || tc?.o;
      if (o) best = { kind: 'trunk', id: pc ? String(this.street.parked.indexOf(pc)) : 't' + this.world.cars.indexOf(tc!), label: '🧳 Kofferraum: umziehen und Polizei austricksen' };
    }
    if (!best) { const car = this.street.nearCar(p); if (car) best = { kind: 'car', id: String(this.street.parked.indexOf(car)), label: `${car.def.icon} Einsteigen: ${car.name}${car.own ? ' (dein Wagen)' : ''}` }; }
    if (!best) { const tc = this.street.nearTraffic(p); if (tc) best = { kind: 'car', id: 't' + this.world.cars.indexOf(tc), label: `🚗 Ausleihen: ${this.street.trafficDef(tc).name}` }; }
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
    this.g.touch.label(best ? (best.kind === 'npc' || best.kind === 'street' || best.kind === 'buddy' || best.kind === 'friend' ? 'Reden' : best.kind === 'car' ? 'Fahren' : best.kind === 'trunk' ? 'Umziehen' : best.kind === 'dog' ? 'Fragen' : best.kind === 'life' || best.kind === 'live' ? 'Los' : 'Rein') : 'Aktion');
  }

  /** Match kommt vorbei und begleitet dich */
  async meetBuddy(p: Profile) {
    this.g.loading.show(p.name, 'ist gleich da');
    await this.buddy.meet(p, this.drive ? this.drive.o.position : this.player.root.position);
    this.g.loading.hide(); sfx('win');
    this.g.dialog.say([{ who: p.name, color: p.color, text: ['Da bin ich! Wohin gehen wir?', 'Hey du. Ich hab drei Stunden und gute Laune mitgebracht.', 'Na? Zeig mir deine Stadt.'][this.g.save.data.day % 3] }]);
  }
  byeBuddy(text: string) {
    const p = this.buddy.who; if (!p) return;
    this.buddy.bye(); this.g.save.write();
    if (!this.g.dialog.open) this.g.dialog.say([{ who: p.name, color: p.color, text }]); else toast(`👋 ${p.name} verabschiedet sich.`);
  }

  /** eigene Lage für die anderen (Online) */
  netState() {
    const d = this.drive, o = d ? d.o : this.player.root, hue = d?.own && this.g.save.data.flags.carHue !== undefined ? Number(this.g.save.data.flags.carHue) : -1;
    return { x: o.position.x, z: o.position.z, r: o.rotation.y, a: d ? 'idle' : String(this.player.anim), c: d ? d.def.id : '', h: hue };
  }

  /** Hund in der Stadt: erst fragen, dann streicheln oder ein Leckerli geben (Besitzer*in merkt sich, wie du warst) */
  private dogTalk(n: StreetNpc) {
    const s = this.g.save.data, k = 'street:' + this.street.people.indexOf(n) + ':' + n.a.avatar.id, m = memOf(s, k), dog = n.dogName!;
    n.talking = true; n.a.play('talk'); this.face(n.a, this.player.root.position); this.face(this.player, n.dog!.root.position); this.player.play('idle');
    const end = () => { n.talking = false; n.a.play('idle'); };
    const W = (text: string, choices?: Line['choices']): Line => ({ who: `${n.name} · 🐶 ${dog}`, color: '#ffb347', text, choices });
    const yes = m.mood >= 0 && (m.mood > 1 || (Math.floor(this.time) + n.name.length) % 4 !== 0);
    if (!yes) { this.g.dialog.say([{ who: 'Du', color: '#ff4fa3', text: `Hi! Darf ich ${dog} mal streicheln?` }, W(m.mood < 0 ? 'Nach dem, was du dir geleistet hast? Lieber nicht.' : `Sorry, ${dog} ist heute etwas scheu. Ein andermal!`)], end); return; }
    const treats = s.inv.treat || 0;
    let then: (() => void) | null = null;
    const pet = (treat: boolean) => {
      this.player.play('interact'); this.street.cheer(n, treat ? 9 : 4); sfx(treat ? 'win' : 'boing'); remember(s, k, 'talk', n.name);
      if (treat) { s.inv.treat = treats - 1; const mm = memOf(s, k); mm.mood = Math.min(5, mm.mood + 1); saveMem(s, k, mm); change(s, { fun: 8, social: 4 }); }
      else change(s, { fun: 5 });
      this.refreshHud();
      then = () => this.g.dialog.say([W(treat ? `Oh, jetzt hast du einen Fan fürs Leben. ${dog} läuft dir gleich hinterher! 😄` : `${dog} liebt dich jetzt schon. Guck, wie der Schwanz wedelt!`)], end);
    };
    this.g.dialog.say([{ who: 'Du', color: '#ff4fa3', text: `Hi! Darf ich ${dog} mal streicheln?` }, W(m.met > 0 ? `Für dich doch immer, ${s.name}!` : `Klar! ${dog} freut sich über jede Streicheleinheit.`, [
      { label: `🤲 ${dog} streicheln`, fn: () => pet(false) },
      { label: treats ? `🦴 Leckerli geben (du hast ${treats})` : '🦴 Leckerli geben', sub: treats ? 'darf ich?' : 'Hundeleckerli gibt es im Späti', fn: () => { if (treats) pet(true); else then = () => this.g.dialog.say([W('Kein Leckerli dabei? Der Späti hat welche. Nächstes Mal! 🦴')], end); } },
      { label: '👋 Tschüss', fn: () => {} },
    ])], () => { const f = then; then = null; if (f) f(); else end(); });
  }
  /** Banner im HUD (für Ereignisse ohne Zugriff auf das Spiel) */
  banner(title: string, sub: string, kind: 'good' | 'bad' | 'info' = 'good', ms = 3200) { this.g.hud.banner(title, sub, kind, ms); }
  /** Feste Figuren erzählen nach dem Gespräch ihre eigene Nebengeschichte weiter (leben.ts FIG_STORIES, ein Teil am Tag) */
  private figurPart(n: (typeof this.npcs)[number]) {
    const s = this.g.save.data, d = n.def, k = figKey(d.id);
    if (!FIG_STORIES[d.id] || this.g.dialog.open || this.mode !== 'play' || this.cine || this.gig) return;
    const part = nextPart(s, k); if (!part) return;
    remember(s, k, 'talk', d.name); heardPart(s, k); change(s, { social: 4 });
    const N = (text: string, choices?: Line['choices']): Line => ({ who: `${d.name} · ${part.story.icon}`, color: d.color, pron: d.pron, text, choices });
    n.talking = true; if (d.anim !== 'sit') { n.a.play('talk'); this.face(n.a, this.player.root.position); }
    let then: (() => void) | null = null;
    const stop = () => { const f = then; then = null; if (f) { f(); return; } n.talking = false; if (d.anim !== 'sit') n.a.play(d.anim || 'idle'); this.refreshHud(); this.g.save.write(); };
    const intro = part.i === 0 ? 'Sag mal, hast du kurz Zeit? Ich muss dir was erzählen.' : 'Du, es gibt Neuigkeiten. Weißt du noch, was ich dir erzählt hab?';
    if (part.i < 3) { this.g.dialog.say([N(intro), N(part.text), N(part.i === 2 ? 'Morgen erzähl ich dir, wie es weitergeht.' : 'Danke fürs Zuhören. 💜')], stop); return; }
    this.g.dialog.say([N(part.text), { who: 'Du', color: '#ff4fa3', text: 'Ich an deiner Stelle …', choices: part.story.end.map((e) => ({ label: e.label, fn: () => {
      finish(s, k, e); change(s, { social: e.social || 0, fun: e.fun || 0 }); sfx('win');
      post(s, d.name, `${part.story.icon} ${part.story.title}: ${e.reply}`);
      this.g.hud.banner(`${part.story.icon} Geschichte erlebt: ${part.story.title}`, [e.money ? `+${e.money} €` : '', e.rep ? `Ruf +${e.rep}` : '', `${d.name} vergisst dir das nie`].filter(Boolean).join(' · '), 'good', 4200);
      then = () => this.g.dialog.say([N(e.reply)], stop);
    } })) }], stop);
  }
  private face(a: Actor, to: Vector3) { a.root.rotation.y = Math.atan2(to.x - a.root.position.x, to.z - a.root.position.z); }

  interact() {
    if (!this.near || this.g.dialog.open || this.bus?.on) return;
    if (this.near.kind === 'life') { this.life.interact(this.player.root.position); return; }
    if (this.near.kind === 'live') { this.live.interact(this.player.root.position); return; }
    if (this.near.kind === 'isle') { this.isles.find((i) => i.def.id === this.near!.id)?.use(); return; }
    if (this.near.kind === 'buddy') { this.g.buddyMenu(); return; }
    if (this.near.kind === 'friend') { this.g.friendMenu(this.near.id); return; }
    const c = this.ctx();
    if (this.near.kind === 'npc') {
      const n = this.npcs.find((x) => x.def.id === this.near!.id)!;
      n.talking = true;
      if (n.def.anim !== 'sit') { n.a.play('talk'); this.face(n.a, this.player.root.position); }
      this.face(this.player, n.a.root.position);
      this.player.play('idle');
      const end = () => { n.talking = false; if (n.def.anim !== 'sit') n.a.play(n.def.anim || 'idle'); setTimeout(() => this.figurPart(n), 150); };
      const prevSay = c.say; c.say = (l, d) => prevSay(l, () => { end(); d?.(); });
      talk(c, n.def.id);
      if (!this.g.dialog.open) end();
      const s = this.g.save.data, r = (s.rel[n.def.id] ||= { f: 0, last: 0 });
      if (r.last !== s.day) { r.last = s.day; r.f = Math.min(100, r.f + 6); change(s, { social: 10, fun: 2 }); this.g.done(track(s, 'talk')); }
      return;
    }
    if (this.near.kind === 'car') { this.toggleCar(this.near.id); return; }
    if (this.near.kind === 'dog') { this.dogTalk(this.street.people[+this.near.id]); return; }
    if (this.near.kind === 'trunk') { const id = this.near.id, o = id[0] === 't' ? this.world.cars[+id.slice(1)]?.o : this.street.parked[+id]?.o; if (o) { this.player.play('interact'); this.combat.flucht.trunk(o); } return; }
    if (this.near.kind === 'street') {
      const n = this.street.people[+this.near.id], s = this.g.save.data;
      n.talking = true; n.a.play('talk');
      this.face(n.a, this.player.root.position); this.face(this.player, n.a.root.position);
      this.player.play('idle');
      const end = () => { n.talking = false; n.a.play(n.anim || 'idle'); };
      if (n.kind === 'worker') { this.g.booking(n.id!); setTimeout(end, 4000); return; }
      // alle Erwachsenen sind ansprechbar: Plaudern, mit 18+ auch Flirten und mehr (flirtui.ts)
      const rb = n.a.avatar.id, generic = n.kind === 'szene' || /^(Szene-Mensch|Verliebte?r?|Passant|Spaziergänger|Nachbar|Tourist|Studentin|Geschäftsmann)/.test(n.name);
      this.g.strangerTalk(stranger('street:' + this.near.id + ':' + rb, rb, generic ? undefined : n.name), { actor: n.a, look: { ...n.a.look, outfit: 'clothed' }, opening: this.street.line(n, s.day), kid: n.a.avatar.job === 'kid', kind: n.kind, szene: n.kind === 'szene' ? n.id : undefined, life: { wanted: this.combat.wanted.stars, rain: this.weather.rain > .2 } }, end);
      change(s, { social: 3 });
      return;
    }
    if (storyPoi(c, this.near.id)) return;
    if (this.near.kind === 'house') {
      const h = this.world.houses[+this.near.id];
      this.g.enterInterior(houseTheme(h.i, this.g.save.data.settings.adult), { x: h.x + Math.sin(h.yaw) * .8, z: h.z + Math.cos(h.yaw) * .8, yaw: h.yaw });
      return;
    }
    if (this.near.id === 'welten') { this.g.worldMenu(); return; }
    if (this.near.id === 'home') { this.g.enterHome(); return; }
    if (this.near.id === 'penthouse' && !this.g.save.data.flags.penthouse) { sfx('door'); this.g.placeMenu('penthouse'); return; }
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
      if (this.drive.def.fly) {
        if (this.alt > 1.6 && id !== 'force') {
          if (!walkable(o.position.x, o.position.z)) { toast('🌊 Über dem Wasser geht das nicht: erst zurück über Land fliegen.'); sfx('miss'); return; }
          this.landing = true; toast('🛬 Landeanflug …'); return;
        }
        this.landing = false; this.g.touch.fly(false); o.rotation.x = o.rotation.z = 0;
        this.alt = 0; o.position.y = .75; o.getChildMeshes().find((m) => m.name === 'flame')?.setEnabled(false); this.player.root.position.y = .1;
        if (!walkable(o.position.x, o.position.z)) { o.position.set(-75, .75, 19); o.rotation.y = 0; }   // über dem Meer verlassen: zurück an den Kai
      }
      if (this.drive.def.ride === 'boat') {
        // Boot: nur am Ufer aussteigen (Kai, Strand, Inseln)
        let spot: [number, number] | null = null;
        for (const r of [2.4, 3.4, 4.6, 6]) { for (let i = 0; i < 12 && !spot; i++) { const a = i / 12 * Math.PI * 2, x = o.position.x + Math.sin(a) * r, z = o.position.z + Math.cos(a) * r; if (walkable(x, z)) spot = [x, z]; } if (spot) break; }
        if (!spot) { toast('🌊 Hier ist kein Ufer. Fahr näher an Kai, Strand oder eine Insel.'); sfx('miss'); return; }
        p.set(spot[0], .1, spot[1]); o.rotation.x = o.rotation.z = 0;
      } else for (const k of [2.2, -2.2, 3.4, -3.4]) { const x = o.position.x + sx * k, z = o.position.z + sz * k; if (walkable(x, z) && !this.world.colliders.some((c) => Math.abs(x - c.x) < c.hx + .4 && Math.abs(z - c.z) < c.hz + .4)) { p.set(x, .1, z); break; } }
      if (this.drive.own) { const sv = this.g.save.data; sv.flags.ownX = Math.round(o.position.x * 10) / 10; sv.flags.ownZ = Math.round(o.position.z * 10) / 10; sv.flags.ownYaw = Math.round(o.rotation.y * 100) / 100; }
      if (this.drive.def.toy || rideSeat(this.drive.def) >= 0) { if (this.drive.def.ride !== 'boat') this.player.root.position.y = .1; o.rotation.x = o.rotation.z = 0; }
      o.rotation.x = o.rotation.z = 0; engineHum(null);
      this.drive.v = 0; this.drive = null; this.parcel = -1; this.g.hud.speedo(null);
      this.radioOff(); music('city');
      this.player.root.visible = true; this.player.play('idle');
      hints([['move', 'Laufen'], ['a', 'Aktion'], ['atk', 'Angriff'], ['wpn', 'Waffe'], ['cam', 'Kamera'], ['y', 'Menü']]);
      sfx('open');
      return;
    }
    if (id[0] === 't') {
      // Auto aus dem Verkehr: freundlich fragen statt rauszerren
      const tc = this.world.cars[+id.slice(1)]; if (!tc) return;
      this.drive = this.street.borrow(tc);
      const says = ['„Na gut, Schätzchen. Aber bring ihn heil zurück!“', '„Für dich immer. Ich wollte eh zu Fuß zum Café.“', '„Nimm ihn, ich hab heute frei. Tank ist voll!“', '„Okay, aber nur weil du so nett fragst.“'];
      toast(`🙋 ${says[Math.floor(Math.random() * says.length)]}`);
    } else this.drive = this.street.parked[+id];
    this.mv = this.drive.o.rotation.y; this.lastV = 0;
    // Radio in jedem Fahrzeug (Auto, Rakete, Einrad, Roller, Boot)
    this.g.hud.radioBtn(true); this.radio(0);
    if (this.drive.def.air) {
      // Möwe und Libelle: du sitzt in der Kabine (unsichtbar), Rotor bzw. Propeller drehen
      const heli = this.drive.def.air === 'heli';
      this.alt = .75; this.player.play('sit'); this.player.root.visible = false; sfx('engine'); setTimeout(() => sfx(heli ? 'rotor' : 'engine'), 300);
      this.cam.dist = Math.max(this.cam.dist, heli ? 12 : 14); this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
      this.landing = false; this.g.touch.fly(true);
      hints([['move', 'Lenken & Gas'], ['rise', 'Steigen'], ['sink', 'Sinken'], ['turbo', 'Turbo'], ['a', 'Landen'], ['cam', 'Kamera'], ['y', 'Menü']]);
      toast(heli ? '🚁 Libelle: ▲ Steigen, ▼ Sinken, ohne Gas schwebst du auf der Stelle. A landet.' : '🛩️ Möwe: Gas geben, ▲ zieht hoch. In der Luft bleibt sie in Fahrt, A setzt zur Landung an.', 4200);
      return;
    }
    if (this.drive.def.fly) {
      this.syncFlyer(); this.alt = .75; this.player.play('sit'); sfx('open');
      this.cam.dist = Math.max(this.cam.dist, 10); this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
      this.landing = false; this.g.touch.fly(true);
      hints([['move', 'Lenken & Gas'], ['rise', 'Steigen'], ['sink', 'Sinken'], ['turbo', 'Turbo'], ['a', 'Landen'], ['cam', 'Kamera'], ['y', 'Menü']]);
      toast(`🚀 ${this.drive.o.metadata?.adult ? 'Glitzer-Dildo „Big Bertha“' : 'Regenbogen-Rakete'}: lenkt wie ein Auto. ▲ Steigen, ▼ Sinken, A landet. Über die Dächer geht es ab 17 m.`, 4200);
      return;
    }
    if (this.drive.def.toy) {
      // Einrad-Mobil: du sitzt sichtbar im Ring, fährt sich wie ein Auto (ohne Radio, kein Diebstahl)
      this.syncFlyer(); this.player.play('sit'); sfx('boing');
      this.cam.dist = Math.max(this.cam.dist, 8); this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
      hints([['move', 'Lenken & Gas'], ['turbo', 'Turbo'], ['a', 'Aussteigen'], ['cam', 'Kamera'], ['y', 'Menü']]);
      toast(this.drive.o.metadata?.adult ? '⭕ Penisring-Mobil: Ein Rad, viel Glitzer, das Vibro-Ei brummt mit. Lenkt wie ein Auto.' : '🍩 Donut-Mobil: Ein Rad, viel Zuckerguss. Lenkt wie ein Auto.', 4200);
      return;
    }
    if (rideSeat(this.drive.def) >= 0) {
      // E-Roller und Glitzer-Boot: du bist sichtbar drauf, lenkt wie ein Auto
      const boat = this.drive.def.ride === 'boat';
      this.player.play(boat ? 'sit' : 'idle'); sfx(boat ? 'whoosh' : 'boing');
      this.cam.dist = Math.max(this.cam.dist, boat ? 9 : 7); this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
      hints([['move', 'Lenken & Gas'], ['turbo', 'Turbo'], ['a', 'Absteigen'], ['cam', 'Kamera'], ['y', 'Menü']]);
      toast(boat ? '🚤 Glitzer-Boot: fährt nur auf dem Wasser, unter den Brücken durch bis zu den Inseln. Absteigen am Ufer.' : '🛴 E-Roller „Einhorn“: klein, wendig, leise. Lenkt wie ein Auto.', 4200);
      return;
    }
    if (!this.drive.own && !this.drive.def.ride) this.combat.enterCar(); sfx('door'); setTimeout(() => sfx('engine'), 250);
    this.player.root.visible = false;
    this.cam.dist = Math.max(this.cam.dist, 9);
    this.cam.tYaw = this.drive.o.rotation.y + Math.PI;
    hints([['move', 'Lenken & Gas'], ['a', 'Aussteigen'], ['atk', 'Hupen'], ['cam', 'Kamera'], ['y', 'Menü']]);
    toast(`${this.drive.def.icon} ${this.drive.def.name}${this.drive.own ? ' (dein Wagen)' : ''} · 📻 Sender: Radio-Knopf antippen oder Q/R bzw. LB/RB.`);
    sfx('open');
  }
  /** Wege in die Welten: Tor an der Kaimauer (zu Fuß, im Auto, im Tiefflug) oder Insel vor der Küste (Flug) */
  /** Welten, die als Insel in der Stadt liegen */
  readonly isles: Isle[] = [];
  /** Figur an einen Ort der Stadt setzen (Schnellreise, Ankunft auf einer Insel) */
  warp(x: number, z: number, yaw: number) {
    const s = this.g.save.data; s.pos = { x, z, yaw }; s.inside = false;
    this.player.root.position.set(x, .1, z); this.player.root.rotation.y = yaw; this.cam.yaw = this.cam.tYaw = yaw + Math.PI; this.snapCam();
  }
  private gateIn = '';
  private worldGates() {
    const p = this.drive ? this.drive.o.position : this.player.root.position, flying = !!this.drive?.def.fly && this.alt > 3;
    let hit = '';
    for (const w of WORLDS) {
      if (ISLES[w.id]) continue;
      const g = cityGate(w.id), isle = cityIsle(w.id);
      if ((!flying && Math.hypot(p.x - g.x, p.z - g.z) < 1.7) || (flying && Math.hypot(p.x - isle.x, p.z - isle.z) < 13)) hit = w.id;
    }
    if (hit && hit !== this.gateIn) this.g.enterWorld(hit);
    this.gateIn = hit;
  }
  /** Flughöhe auf dem Flitzer */
  private alt = 0;
  /** Silhouetten-Deko: eine Fassung je 18+ sichtbar */
  private sil: { adult: TransformNode; safe: TransformNode } | null = null;
  /** Steiggeschwindigkeit (geglättet) und automatischer Landeanflug */
  private climb = 0;
  private landing = false;
  /** Flitzer am Weltentor: mit 18+ ein Glitzer-Dildo, sonst eine Rakete */
  private syncFlyer() {
    const adult = !!this.g.save.data.settings.adult;
    for (const f of this.street.parked) if (f.def.fly && !f.def.air && f.o.metadata?.adult !== adult) { buildFlitzer(this.scene, f.o, adult); f.o.getChildMeshes().find((m) => m.name === 'flame')?.setEnabled(false); }
    for (const f of this.street.parked) if (f.def.toy && f.o.metadata?.adult !== adult) { buildRingMobil(this.scene, f.o, adult); f.name = adult ? 'Penisring-Mobil' : 'Donut-Mobil'; }
    if (this.sil) { this.sil.adult.setEnabled(adult); this.sil.safe.setEnabled(!adult); }
  }
  /** Leuchtring an der aktuellen Flug-Station (nur, wenn sie in der Luft hängt) */
  private airRingTick(t: number) {
    const st = this.gig?.g.steps[this.gig.i], show = !!st && st.y !== undefined;
    if (show && !this.airRing) { const r = this.airRing = torus(this.scene, 1, .06, 40); r.material = glow(this.scene, 0xffd23b, 2, { alpha: .85 }); r.isPickable = false; r.applyFog = false; }
    if (!this.airRing) return;
    if (this.airRing.isEnabled() !== show) this.airRing.setEnabled(show);
    if (!show) return;
    const r = this.airRing, pv = this.gig!.g.steps[this.gig!.i - 1] || this.drive?.o.position || this.player.root.position;
    r.position.set(st!.x, st!.y!, st!.z); r.scaling.setAll(st!.r || 8);
    r.rotation.x = Math.PI / 2; r.rotation.y = Math.atan2(st!.x - pv.x, st!.z - pv.z) || 0; r.rotation.z = Math.sin(t * 2) * .05;
  }
  /** Fahrtrichtung (für Driften), Quietsch-Takt, letztes Tempo (für die Neigung) */
  private mv = 0;
  private skidT = 0;
  private lastV = 0;
  /** Stunts beim Fahren: Leute filmen, der Clip geht auf Glitzergram viral (viral.ts) */
  private stunts = new Stunts();
  private viralT = 0;
  private viralWait: { kind: Stunt; power: number; by: string; t: number } | null = null;
  /** Stunt-Kamera: kurze Zeitlupe mit Kinobalken und Seitenansicht nach einem großen Crash oder Drift */
  private slowT = 0;
  private stuntCd = 0;
  private stuntCam: { t: number; side: number; el: HTMLElement } | null = null;
  private stuntShot(st: { kind: Stunt; power: number }) {
    if (this.stuntCam || this.stuntCd > 0 || !this.drive || this.idleOn) return;
    if (st.kind === 'tempo' || (st.kind === 'drift' && st.power < .35) || (st.kind === 'crash' && st.power < .2)) return;
    this.stuntCd = 25; this.slowT = 1.6;
    const el = document.createElement('div'); el.className = 'cine stuntcine';
    el.innerHTML = `<i></i><i></i><b>${st.kind === 'crash' ? '💥 CRASH' : '🔥 DRIFT'}</b>`;
    document.body.appendChild(el);
    this.stuntCam = { t: 0, side: Math.random() < .5 ? -1 : 1, el };
  }
  private stuntView(dt: number) {
    const c = this.stuntCam!, o = this.drive?.o; c.t += dt;
    const p = o ? o.position : this.player.root.position, yaw = (o ? o.rotation.y : this.player.root.rotation.y) + c.side * (1.25 - c.t * .5);
    this.camera.position.set(p.x + Math.sin(yaw) * 6.5, p.y + 1.1 + c.t * .4, p.z + Math.cos(yaw) * 6.5);
    this.aim.set(p.x, p.y + .8, p.z); this.camera.setTarget(this.aim);
  }
  private endStunt() { this.stuntCam?.el.remove(); this.stuntCam = null; this.slowT = 0; }
  /** Rainbow News im Autoradio */
  private newsT = 150;
  private newsTick(dt: number, busy: boolean) {
    if (!this.drive || busy || !(radio.state.on || radio.state.loading) || radio.state.st.id === 'off') return;
    if ((this.newsT -= dt) > 0) return;
    this.newsT = 240;
    const s = this.g.save.data, h = this.hour();
    const lines = bulletin(s, { hour: h, sky: this.weather.sky || 'klar', stars: this.combat.wanted.stars, parade: isParade(s, h), name: s.name });
    sfx('phone'); this.g.hud.banner('📻 Rainbow News', lines[1], 'info', 7000);
    const sy = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    if (!sy) return;
    try {
      const u = new SpeechSynthesisUtterance(lines.join(' ')); u.lang = 'de-DE'; u.rate = 1.05;
      const v = sy.getVoices().find((x) => x.lang.startsWith('de')); if (v) u.voice = v;
      u.volume = Math.min(1, vol.sfx + .1);
      radio.duck(true); u.onend = u.onerror = () => radio.duck(false);
      sy.cancel(); sy.speak(u);
    } catch { radio.duck(false); }
  }
  private stunt(st: { kind: Stunt; power: number } | null) {
    if (st) this.stuntShot(st);
    if (!st || this.viralT > 0 || this.viralWait || !canGoViral(this.g.save.data) || this.combat.wanted.stars > 0) return;
    const f = this.street.film(this.player.root.position, 24, 2);
    if (!f.length) return;
    this.viralT = 50; this.viralWait = { ...st, by: f[0].name, t: 5 };
    toast(`📱 ${f[0].name}${f[1] ? ' und ' + f[1].name : ''} ${f[1] ? 'filmen' : 'filmt'} dich!`, 2400);
  }
  private viralTick(dt: number, busy: boolean) {
    this.viralT -= dt;
    const w = this.viralWait; if (!w || busy || (w.t -= dt) > 0) return;
    this.viralWait = null;
    const c = goViral(this.g.save.data, w.kind, w.power, w.by); if (!c) return;
    sfx('win'); this.g.hud.banner(`🔥 Viral: ${c.title}`, `Glitzergram · ${c.views.toLocaleString('de-DE')} Aufrufe · +${c.gain} Follower`, 'good', 4600);
    this.g.save.write();
  }
  private moveCar(dt: number) {
    const c = this.drive!, o = c.o, inp = this.g.engine.input, fly = !!c.def.fly;
    if (inp.pressed('tabR')) this.radio(1); else if (inp.pressed('tabL')) this.radio(-1);
    const thr = Math.abs(inp.move.y) > .08 ? inp.move.y : 0, steer = Math.abs(inp.move.x) > .08 ? inp.move.x : 0;
    const st = stats(c.def, c.own ? tuneLevel(this.g.save.data) : 0), sv = this.g.save.data, tanked = c.own && !fly && !c.def.ride && !c.def.toy;
    // leerer Tank (nur der eigene Wagen): nur noch Schritttempo
    const max = tanked && tankOf(sv) <= 0 ? TANK.crawl : inp.held('sprint') ? st.turbo : st.max;
    // Flitzer: lenkt wie ein Auto (Stick/WASD = Gas, Bremse, Lenken; Turbo = schneller), dazu Steigen/Sinken.
    // Ohne Eingabe hält er die Höhe; über den Dächern (in der Hochstadt höher) fliegt er frei.
    if (fly) {
      const up = inp.held('rise'), down = inp.held('sink');
      if (up || down) this.landing = false;
      const want = this.landing ? -10 : (up ? 10 : 0) - (down ? 10 : 0);
      this.climb += (want - this.climb) * Math.min(1, dt * 5);
      this.alt = clamp(this.alt + this.climb * dt, .75, 55);
      if (this.alt <= .76 && this.climb < 0) this.climb = 0;
    }
    // über dem Wasser bleibt er auf mindestens 8 m und fliegt frei, weit draußen ist Schluss
    const sea = fly && !walkable(o.position.x, o.position.z);
    if (sea && this.alt < 8) this.alt = Math.min(8, this.alt + dt * 9);   // über dem Wasser sanft auf 8 m steigen (Start vom Kai)
    const high = sea || (fly && this.alt > (o.position.x > 86 ? 42 : 17));
    // Driften wie im Open-World-Krimi: in voller Fahrt bremsen und einlenken (oder mit Turbo scharf einlenken) – das Heck bricht aus
    const plain = !fly && !c.def.ride && !c.def.toy && !c.def.air;
    const drift = plain && Math.abs(steer) > .3 && ((thr < -.3 && c.v > 9) || (inp.held('sprint') && c.v > 15 && Math.abs(steer) > .7));
    if (thr > 0) c.v = Math.min(max, c.v + thr * (c.v < 0 ? 22 : st.acc) * dt);
    else if (c.v > max) c.v = Math.max(max, c.v - 14 * dt);
    else if (thr < 0) c.v = Math.max(-6, c.v + thr * (c.v > 0 ? (drift ? 6 : 22) : 6) * dt);
    else c.v *= Math.max(0, 1 - dt * 1.2);
    if (Math.abs(c.v) < .05) c.v = 0;
    // das Wasserflugzeug bleibt in der Luft in Fahrt (kein Schweben), beim Landen gleitet es aus
    if (c.def.air === 'plane' && this.alt > 2.5) c.v = Math.max(c.v, this.landing ? 7 : 10);
    o.rotation.y -= steer * dt * st.steer * clamp(c.v / 5, -1, 1) * (drift ? 1.5 : 1);
    // Fahrtrichtung folgt der Schnauze mit Haftung: normal straff, beim Driften rutscht der Wagen quer
    if (!plain || Math.abs(c.v) < 1) this.mv = o.rotation.y;
    let slip = o.rotation.y - this.mv; slip = Math.atan2(Math.sin(slip), Math.cos(slip));
    slip = clamp(slip, -.95, .95);
    this.mv = o.rotation.y - slip * (1 - Math.min(1, dt * (drift ? 1.4 : 9)));
    this.stunt(this.stunts.update(dt, { slip, v: c.v, max, plain }));
    if (plain && Math.abs(slip) > .2 && Math.abs(c.v) > 6) {
      c.v *= 1 - dt * .55 * Math.abs(Math.sin(slip));
      if ((this.skidT -= dt) <= 0) { this.skidT = .32; sfx('skid'); }
    }
    const before = o.position.clone();
    o.position.x += Math.sin(this.mv) * c.v * dt; o.position.z += Math.cos(this.mv) * c.v * dt;
    const want = o.position.clone();
    const boat = c.def.ride === 'boat';
    if (boat) {
      // Boot: Bug darf nicht an Land (Brücken sind kein Land, darunter geht es durch)
      const k = c.v >= 0 ? 2.2 : -2.2;
      if (isLand(o.position.x, o.position.z) || isLand(o.position.x + Math.sin(o.rotation.y) * k, o.position.z + Math.cos(o.rotation.y) * k)) { o.position.copyFrom(before); if (Math.abs(c.v) > 3) sfx('miss'); c.v *= -.2; }
      o.position.x = clamp(o.position.x, ISLE_BOUNDS.x0, -60); o.position.z = clamp(o.position.z, ISLE_BOUNDS.z0, ISLE_BOUNDS.z1);
    } else if (!high) this.world.collide(o.position, c.def.ride === 'bus' ? 1.5 : 1.2);
    else { o.position.x = clamp(o.position.x, ISLE_BOUNDS.x0, 260); o.position.z = clamp(o.position.z, ISLE_BOUNDS.z0, ISLE_BOUNDS.z1); }
    // Zusammenstoß mit dem Verkehr: der andere Wagen wird mit Wucht weggeschoben, du verlierst Tempo (kein Kleben mehr)
    if (!boat && (!fly || this.alt < 2.5)) for (const t of this.world.cars) {
      if (t.off) continue;
      const dx = t.o.position.x - o.position.x, dz = t.o.position.z - o.position.z, d = Math.hypot(dx, dz);
      if (d >= 3 || d < .01) continue;
      const nx = dx / d, nz = dz / d, hit = Math.abs(c.v) * Math.max(.25, Math.abs(Math.sin(this.mv) * nx + Math.cos(this.mv) * nz));
      o.position.x -= nx * (3 - d) * .5; o.position.z -= nz * (3 - d) * .5;
      if (hit > 2.5 && !t.bump) {
        this.world.knock(t, nx, nz, hit * .8); c.v *= .45;
        this.shake = Math.min(.6, hit / 30); sfx(hit > 9 ? 'crash' : 'hit');
        if (hit > 9) { buzz([40, 30, 60]); if (Math.random() < .6) toast(CRASH[Math.floor(Math.random() * CRASH.length)], 2200); }
        this.stunt(this.stunts.crash(hit));
      } else c.v *= .9;
    }
    if (!high && !boat && Vector3.Distance(o.position, want) > .02 && Math.abs(c.v) > 4) {
      const hard = Math.abs(c.v) > 11;
      if (!fly) { sfx(hard ? 'crash' : 'miss'); this.shake = Math.min(.6, Math.abs(c.v) / 35); if (hard) buzz([50, 30, 50]); }
      c.v *= hard ? .3 : .55;
    }
    // Karosserie: neigt sich in Kurven nach außen und beim Bremsen/Beschleunigen nach vorn bzw. hinten
    if (plain) {
      const acc = (c.v - this.lastV) / Math.max(dt, .001); this.lastV = c.v;
      const roll = clamp(steer * clamp(c.v / 18, -1, 1) * .07 + slip * .05, -.09, .09), pitch = clamp(-acc * .004, -.05, .05);
      o.rotation.z += (roll - o.rotation.z) * Math.min(1, dt * 5); o.rotation.x += (pitch - o.rotation.x) * Math.min(1, dt * 5);
      engineHum(clamp(Math.abs(c.v) / Math.max(10, st.max) * .9 + (thr > 0 ? .15 : 0), 0, 1.1));
    }
    o.position.y = fly ? this.alt + Math.sin(performance.now() / 330) * .08 : boat ? .05 + Math.sin(performance.now() / 420) * .05 : .1;
    this.player.root.position.copyFrom(o.position);
    // Tacho und Tank
    if (tanked) {
      const r = burn(sv, Math.abs(c.v) * dt);
      if (r === 'low') { sfx('miss'); toast('⛽ Tank fast leer! Ab zur Regenbogen-Tanke neben der Garage in der Hochstadt oder Reservekanister aus dem Späti.'); }
      else if (r === 'empty') { sfx('miss'); sv.pin = 'tanke'; toast('⛽ Tank leer! Der Wagen rollt nur noch im Schritttempo. Wegpunkt zur Regenbogen-Tanke ist gesetzt.'); }
      // unter dem Dach der Regenbogen-Tanke: stehen bleiben, dann tankt er von selbst
      if (Math.abs(c.v) < 1.5 && Math.hypot(o.position.x - TANKE[0], o.position.z - TANKE[1]) < 5 && tankOf(sv) < 100) {
        const add = Math.min(100 - (Number(sv.flags.tank) || 0), dt * 14), cost = add * .4;
        if (sv.money >= cost) {
          if (!this.fueling) { this.fueling = true; sfx('pour'); toast('⛽ Tankt … (bleib kurz stehen)'); }
          sv.flags.tank = Math.min(100, (Number(sv.flags.tank) || 0) + add); this.fuelCost += cost;
          if (tankOf(sv) >= 100) { const p = Math.ceil(this.fuelCost); sv.money -= p; this.fuelCost = 0; this.fueling = false; sfx('coin'); toast(`⛽ Vollgetankt! ${p} € bezahlt.`); this.refreshHud(); }
        } else if (!this.fueling) { this.fueling = true; toast('⛽ Nicht genug Geld zum Tanken.'); }
      } else if (this.fueling) { const p = Math.ceil(this.fuelCost); if (p) { sv.money -= p; sfx('coin'); toast(`⛽ ${p} € fürs Tanken bezahlt.`); this.refreshHud(); } this.fuelCost = 0; this.fueling = false; }
    }
    this.g.hud.speedo(`${c.def.icon} ${Math.round(Math.abs(c.v) * 3.6)} km/h${tanked ? ` · ⛽ ${tankOf(sv)} %` : ''}`, tanked && tankOf(sv) < 15);
    rigOf.get(o)?.update(dt, performance.now() / 1000, c.v);
    if (fly) {
      // in die Kurve legen und die Nase beim Steigen heben, wie ein Flugzeug
      const roll = -steer * .32 * clamp(c.v / 8, -1, 1), pitch = -clamp(this.climb / 8, -1, 1) * .22;
      o.rotation.z += (roll - o.rotation.z) * Math.min(1, dt * 6); o.rotation.x += (pitch - o.rotation.x) * Math.min(1, dt * 6);
      if (this.landing && this.alt <= .8) { this.landing = false; this.toggleCar('force'); return; }
    }
    if (c.def.toy) {
      // das Rad rollt mit dem Tempo, das Mobil legt sich in die Kurve, das Vibro-Ei brummt
      const wh = o.getChildTransformNodes(true).find((n) => n.name === 'wheel'); if (wh) wh.rotation.x += c.v * dt / 1.25;
      o.rotation.z += (-steer * .18 * clamp(c.v / 8, -1, 1) - o.rotation.z) * Math.min(1, dt * 6);
      const egg = o.getChildMeshes(true).find((m) => m.name === 'egg'); if (egg) egg.position.x = Math.abs(c.v) > .5 ? Math.sin(performance.now() / 18) * .03 : 0;
      this.player.root.position.y = .55; this.player.root.rotation.y = o.rotation.y;
    }
    if (c.def.ride || c.def.air) {
      // Räder bzw. Schraube drehen (Rotor und Propeller laufen immer), Roller legt sich in die Kurve, Boot schaukelt
      for (const n of o.getChildTransformNodes(true)) if (n.name === 'spin') { const md = n.metadata as { r: number; axis?: string }; if (md.axis === 'z') n.rotation.z += (c.def.air ? 14 : 6 + Math.abs(c.v)) * dt * 3; else if (md.axis === 'y') n.rotation.y += 24 * dt; else if (md.axis === 'x') n.rotation.x += 40 * dt; else n.rotation.x += c.v * dt / md.r; }
      const t = performance.now();
      if (c.def.ride === 'scooter') o.rotation.z += (-steer * .25 * clamp(c.v / 6, -1, 1) - o.rotation.z) * Math.min(1, dt * 6);
      if (boat) { o.rotation.z = Math.sin(t / 610) * .04 - steer * .08 * clamp(c.v / 8, -1, 1); o.rotation.x = -clamp(c.v / 13, -1, 1) * .06 + Math.sin(t / 530) * .02; }
      const seat = rideSeat(c.def); if (seat >= 0) { this.player.root.position.y = o.position.y + seat; this.player.root.rotation.y = o.rotation.y; }
    }
    if (fly) { this.player.root.position.y -= .35; this.player.root.rotation.y = o.rotation.y; const fl = o.getChildMeshes().find((m) => m.name === 'flame'); if (fl) { fl.setEnabled(true); fl.scaling.y = .8 + Math.sin(performance.now() / 33) * .25; } }
    if (boat) return;   // auf dem Wasser nicht speichern: beim Laden stehst du am letzten Ufer
    const s = this.g.save.data; s.pos.x = o.position.x; s.pos.z = o.position.z; s.pos.yaw = o.rotation.y;
  }

  /* ---------- Kamera ---------- */
  /** kurzes Kamerawackeln (Treffer) */
  shake = 0;
  private snapCam() { this.updateCam(1, true); }
  private tgt = new Vector3();
  private aim = new Vector3();
  /** Einrichtung aller Orte (auch für Tests erreichbar) */
  readonly themes = PLACE_THEMES;
  /** Land oder Wasser (fürs Glitzer-Boot; auch für Tests erreichbar) */
  readonly landAt = isLand;
  private tiredTold = false;
  private sprintT = 0;
  private fueling = false;
  private fuelCost = 0;
  /** Sekunden seit dem letzten Wischen an der Kamera */
  private lookIdle = 9;
  /** Fahrkamera: Vorausschau in Fahrtrichtung, Tempo-Abstand und Tempo-Blickwinkel (weich nachgeführt) */
  private ahead = new Vector3();
  private camExtra = 0;
  private camFov = 0;
  /** Leerlauf-Kamera wie im Open-World-Krimi: nach einer Weile ohne Eingabe filmische Einstellungen mit Kinobalken */
  private idleT = 0;
  private idleOn: { el: HTMLElement; dist: number; pitch: number; t: number } | null = null;
  private idleCam(dt: number, calm: boolean) {
    const inp = this.g.engine.input;
    this.idleT = calm && !this.drive && !inp.active() ? this.idleT + dt : 0;
    const want = this.idleT > 25;
    if (want && !this.idleOn) {
      const el = document.createElement('div'); el.className = 'cine idlecine'; el.innerHTML = '<i></i><i></i>';
      document.body.appendChild(el); document.body.classList.add('pc-idle');
      this.idleOn = { el, dist: this.cam.dist, pitch: this.cam.pitch, t: 0 };
    } else if (!want && this.idleOn) {
      this.cam.dist = this.idleOn.dist; this.cam.pitch = this.idleOn.pitch;
      this.idleOn.el.remove(); document.body.classList.remove('pc-idle'); this.idleOn = null;
    }
    const o = this.idleOn; if (!o) return;
    // alle 9 Sekunden eine neue Einstellung: tiefe Fahrt um die Figur, weite Totale über die Stadt, nahes Profil
    o.t += dt; const shot = Math.floor(o.t / 9) % 3, k = Math.min(1, dt * .8);
    const [dist, pitch, spin] = shot === 0 ? [5.5, .1, .16] : shot === 1 ? [13, .55, .07] : [3.8, .2, -.11];
    this.cam.dist += (dist - this.cam.dist) * k; this.cam.pitch += (pitch - this.cam.pitch) * k; this.cam.tYaw += spin * dt;
  }
  private near3: World['colliders'] = [];
  private updateCam(dt: number, snap = false) {
    const inp = this.g.engine.input, st = this.g.save.data.settings, d = this.drive;
    const k = .005 * st.camSpeed, sp = d ? Math.abs(d.v) : 0, fast = clamp(sp / 26, 0, 1);
    this.cam.tYaw -= inp.look.x * k;
    this.cam.pitch = clamp(this.cam.pitch + inp.look.y * k * (st.invertY ? -1 : 1), .08, 1.1);
    this.cam.dist = clamp(this.cam.dist + inp.zoom * .8, 3.5, 14);
    if (!d && inp.held('tabL')) this.cam.tYaw += dt * 2.2;
    if (!d && inp.held('tabR')) this.cam.tYaw -= dt * 2.2;
    const face = d ? d.o.rotation.y : this.player.root.rotation.y;
    if (inp.pressed('camReset')) this.cam.tYaw = face + Math.PI;
    this.lookIdle = inp.look.x || inp.look.y || inp.held('tabL') || inp.held('tabR') ? 0 : this.lookIdle + dt;
    let behind = face + Math.PI - this.cam.tYaw; behind = Math.atan2(Math.sin(behind), Math.cos(behind));
    if (d && !snap) {
      // wie im Open-World-Krimi: Kamera schwenkt nach kurzer Pause hinter den Wagen, je schneller, desto straffer;
      // beim Rückwärtsfahren bleibt sie stehen, damit das Bild nicht herumschleudert
      if (this.lookIdle > .8 && d.v > .8) this.cam.tYaw += behind * Math.min(1, dt * (1.6 + fast * 3.2));
      if (this.lookIdle > 1.5) this.cam.pitch += ((d.def.fly ? .3 : .2) - this.cam.pitch) * Math.min(1, dt * 1.5);
    } else if (!d && !snap && this.lookIdle > 1.2 && Math.hypot(inp.move.x, inp.move.y) > .3 && Math.abs(behind) < 2.3) {
      // Folgekamera zu Fuß: dreht sich sanft hinter die Figur (wer auf die Kamera zuläuft, wird nicht herumgerissen)
      this.cam.tYaw += behind * Math.min(1, dt * 1.5);
    }
    // Winkel nicht endlos aufaddieren lassen (sonst dreht die Kamera nach vielen Runden durch)
    if (Math.abs(this.cam.tYaw) > 20) { const w = Math.round(this.cam.tYaw / (Math.PI * 2)) * Math.PI * 2; this.cam.tYaw -= w; this.cam.yaw -= w; }
    this.cam.yaw += (this.cam.tYaw - this.cam.yaw) * Math.min(1, dt * (d ? 8 : 12));
    const p = this.player.root.position;
    // beim Fahren etwas tiefer und in Fahrtrichtung vorausschauen, mit Tempo weiter weg
    const la = d ? Math.min(sp, 30) * .14 * Math.sign(d.v) : 0;
    const ax = Math.sin(face) * la, az = Math.cos(face) * la;
    if (snap) this.ahead.set(ax, 0, az); else { this.ahead.x += (ax - this.ahead.x) * Math.min(1, dt * 3); this.ahead.z += (az - this.ahead.z) * Math.min(1, dt * 3); }
    this.camExtra += ((d ? fast * 3.2 : 0) - this.camExtra) * (snap ? 1 : Math.min(1, dt * 2));
    const tgt = this.tgt.set(p.x + this.ahead.x, p.y + (d && !d.def.fly ? 1.25 : 1.5), p.z + this.ahead.z);
    const dist = this.cam.dist + this.camExtra;
    const want = new Vector3(
      tgt.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * dist,
      tgt.y + Math.sin(this.cam.pitch) * dist,
      tgt.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * dist);
    // Kamera-Kollision: nicht in Häusern oder Autos stecken, sondern davor heranrücken (nur Hindernisse in Reichweite prüfen)
    const dir = want.subtract(tgt), r = dist + 4, nb = this.near3; nb.length = 0;
    for (const c of this.world.colliders) if (Math.abs(c.x - p.x) < c.hx + r && Math.abs(c.z - p.z) < c.hz + r) nb.push(c);
    let f = 1;
    for (let i = 1; i <= 16 && f === 1 && nb.length; i++) {
      const u = i / 16, x = tgt.x + dir.x * u, y = tgt.y + dir.y * u, z = tgt.z + dir.z * u;
      if (y < 7 && nb.some((c) => Math.abs(x - c.x) < c.hx + .35 && Math.abs(z - c.z) < c.hz + .35)) f = Math.max(.18, (i - 1) / 16);
    }
    if (f < 1) want.copyFrom(tgt).addInPlace(dir.scale(f));
    if (want.y < .4) want.y = .4;   // nie unter den Asphalt
    // im Auto straffer nachführen (sonst hängt das Bild bei Tempo meterweit hinterher), an Wänden sofort heranrücken
    Vector3.LerpToRef(this.camPos, want, snap ? 1 : Math.min(1, dt * (f < 1 ? 14 : d ? 7 + fast * 6 : 5)), this.camPos);
    this.camera.position.copyFrom(this.camPos);
    if (this.shake > 0) { this.shake = Math.max(0, this.shake - dt); const k = this.shake * .5; this.camera.position.x += (Math.random() - .5) * k; this.camera.position.y += (Math.random() - .5) * k; }
    // Tempo-Gefühl: Blickwinkel weitet sich mit der Geschwindigkeit (Turbo am meisten)
    this.camFov += ((d ? fast * .13 : 0) - this.camFov) * (snap ? 1 : Math.min(1, dt * 2.5));
    this.camera.fov = this.g.engine.fovFor(this.camera) * (1 + this.camFov);
    // Hochkant: etwas über die Figur hinweg schauen, damit die Stadt das Bild füllt und nicht der Asphalt
    const up = this.g.engine.aspect < 1 ? 1.2 : 0;
    if (up) { this.aim.copyFrom(tgt); this.aim.y += up; this.camera.setTarget(this.aim); } else this.camera.setTarget(tgt);
    this.clearView(tgt);
  }

  private radarT = 0;
  private passT = -99;
  private time = 0;
  private routeT = 0;
  private gps: { pts: Array<[number, number]>; color: string } | null = null;
  enter() { this.syncFlyer(); this.g.touch.fly(!!this.drive?.def.fly); this.g.hud.radarOn(true); if (this.drive) { this.g.hud.radioBtn(true); this.radio(0); } }
  exit() { this.photoRef?.stop(); this.g.hud.radarOn(false); this.g.touch.fly(false); if (this.drive) this.radioOff(); }
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
  /** gefahrener Wagen (Flucht: Umlackieren) */
  get ride() { return this.drive; }
  get carSpeed() { return Math.abs(this.drive?.v || 0); }
  /** gefahrenes Auto (oder null) */
  get carNode() { return this.drive?.o || null; }
  /** Auto anhalten (z. B. beim Schaukeln an der ruhigen Ecke) */
  holdCar() { if (this.drive) this.drive.v = 0; }
  /** Aussteigen erzwingen (z. B. bei der Festnahme) */
  leaveCar() { if (this.drive) this.toggleCar('force'); }
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
    if (!this.drive || this.drive.def.fly || this.raceAsk > 0 || Math.abs(this.drive.v) > 2.5) return;
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
    const own = await this.street.spawnOwn(def, has ? Number(s.flags.ownX) : gx, has ? Number(s.flags.ownZ) : gz, has ? Number(s.flags.ownYaw) || 0 : gy, s.flags.carHue === undefined ? -1 : Number(s.flags.carHue));
    const pm = readPimp(s); if (!isStock(pm) && !def.fly && !def.toy && !def.ride) dress(this.scene, own.o, pm);
    if (atGarage) { delete s.flags.ownX; delete s.flags.ownZ; delete s.flags.ownYaw; }
  }
  /** Auftrag annehmen (aus Anruf oder Handy-App) */
  startGig(g: Gig) {
    this.gig = { g, i: 0, t: g.time };
    this.g.hud.banner(g.title, `Auftrag von ${g.who}${g.free ? ' · ohne Zeitdruck' : g.car ? ' · Tipp: Mit dem Auto geht es schneller' : ''}`, 'info', 2600);
    sfx('open');
  }
  private nagT = 0;
  private gigTick(dt: number) {
    const s = this.g.save.data;
    if (!this.gig) {
      this.g.hud.gig(null);
      if (s.flags.sagaRun) delete s.flags.sagaRun; // Mission lief beim letzten Speichern noch
      if (s.flags.nachtRun) delete s.flags.nachtRun;
      if (s.flags.flutRun) delete s.flags.flutRun;
      if (s.flags.tarekRun) delete s.flags.tarekRun;
      this.raceCheck(dt);
      // ab und zu klingelt das Handy (erst nach der Einführung)
      if (s.step >= 2 || s.chapter > 1) this.callT -= dt;
      if (this.callT <= 0) { this.callT = 210 + Math.random() * 120; this.ring(); }
      return;
    }
    const q = this.gig, st = q.g.steps[q.i], p = this.player.root.position;
    // Schlägerei läuft: Uhr steht, Anzeige zeigt Mut und wer schon am Boden liegt
    if (this.brawl.fighting) { this.g.hud.gig(this.brawl.label(), this.brawl.brave <= 2); return; }
    if (!q.g.free) q.t -= dt;
    this.g.hud.gig(`${q.g.free ? '🕊️ ohne Zeitdruck' : '⏱ ' + fmtTime(q.t)} · ${q.g.title} ${q.i + 1}/${q.g.steps.length}: ${st.label}`, !q.g.free && q.t < 15);
    // Verfolgung: Ziel losschicken, eingeholt = Station geschafft, entwischt = Mission gescheitert
    if (st.chase) {
      if (!this.brawl.chasing) {
        const opt = st.chase;
        st.chase = undefined;
        this.brawl.chase(st, opt, () => { st.x = p.x; st.z = p.z; const nx = q.g.steps[q.i + 1]; if (nx?.fight && nx.x === 0 && nx.z === 0) { nx.x = p.x; nx.z = p.z; } toast('🚨 Eingeholt!'); }, () => { if (this.gig === q) q.t = 0; });
        (st as GigStepRun).run = true;
      }
      return;
    }
    if ((st as GigStepRun).run && this.brawl.chasing) return;
    if (st.fight && Math.hypot(p.x - st.x, p.z - st.z) < 12) {
      if (this.drive) { if ((this.nagT -= dt) <= 0) { this.nagT = 4; toast('🚗 Steig aus und stell dich ihnen!'); } return; }
      const names = st.fight; st.fight = undefined;
      this.brawl.fight(st, names, (won) => { if (this.gig !== q) return; if (won) { st.x = this.player.root.position.x; st.z = this.player.root.position.z; } else { st.fight = names; q.t = 0; } });
      return;
    }
    // Flug-Stationen: nur mit Fluggerät, Ringe in ihrer Höhe durchfliegen, Abwurf/Landung unter 6 m
    const air = !!this.drive?.def.fly, alt = air ? this.alt : 0, rr = st.r ?? (this.drive ? 4.5 : 3);
    const flat = Math.hypot(p.x - st.x, p.z - st.z);
    if (st.air && flat < rr * 2.5 && (this.nagT -= dt) <= 0) {
      if (!air) { this.nagT = 5; toast('🛩️ Dafür brauchst du die Möwe, die Libelle oder den Flitzer.'); }
      else if (st.low && alt > 6) { this.nagT = 4; toast(`🛬 Tiefer! Unter 6 m sinken (jetzt ${Math.round(alt)} m).`); }
      else if (st.y !== undefined && Math.abs(alt - st.y) > rr) { this.nagT = 4; toast(alt < st.y ? `⬆️ Höher! Der Ring hängt auf ${st.y} m.` : `⬇️ Tiefer! Der Ring hängt auf ${st.y} m.`); }
    }
    const reached = st.air ? air && flat < rr && (st.low ? alt <= 6 : st.y === undefined || Math.abs(alt - st.y) <= rr) : flat < rr;
    if (reached) {
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

  /* ---------- Radio in jedem Fahrzeug: die 13 eigenen Sender (laut.fm) und eine eigene Stream-Adresse; Auswahl als einfache Liste ---------- */
  private radio(dir = 0, to?: number) {
    const s = this.g.save.data, n = STATIONS.length, was = radio.state.st;
    let i = STATIONS.indexOf(stationOf(s.flags.radio));
    i = to ?? ((i + dir) % n + n) % n;
    const st0 = STATIONS[i]; s.flags.radio = st0.id;
    const st = st0.id === 'eigen' ? { ...st0, url: String(s.flags.radioUrl || '') } : st0;
    if (st.id !== was.id || st.url !== was.url || !(radio.state.on || radio.state.loading) && st.id !== 'off') radio.tune(st);
    this.showRadio();
  }
  private showRadio() {
    const r = radio.state, st = r.st, live = !!(st.slug || st.url);
    const song = r.title ? (r.artist ? `${r.title} · ${r.artist}` : r.title) : '';
    this.g.hud.nowPlaying(st.id === 'off' ? null : `${st.icon} ${st.name} ▾`, live ? (r.err || song || (r.loading ? 'Sender wird eingestellt …' : 'Live')) : r.err || st.sub);
  }
  private radioOff() { engineHum(null); radio.stop(); this.g.hud.nowPlaying(null); this.g.hud.radioBtn(false); }

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
    // Zeitlupe der Stunt-Kamera (läuft in echter Zeit ab)
    this.stuntCd -= dt;
    if (this.slowT > 0) { this.slowT -= dt; dt *= .35; if (this.slowT <= 0 || !this.drive) this.endStunt(); }
    this.time = t;
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
    this.street.giveBack(ref, this.drive);
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
    if (busy && this.drive) engineHum(null);
    { const cp = this.camera.position, pp = this.player.root.position, l = Math.hypot(pp.x - cp.x, pp.z - cp.z) || 1; this.world.view = { x: pp.x, z: pp.z, fx: (pp.x - cp.x) / l, fz: (pp.z - cp.z) / l }; }
    // Stadtleben: Tagesablauf, Regen, Ärger (Schlägerei, Fahndung) und du
    { const trouble = this.combat.wanted.stars > 0 || this.brawl.fighting || this.brawl.chasing; this.street.life = { hour: this.hour(), rain: this.weather.rain > .2, alarm: trouble ? this.player.root.position : null, player: this.player.root.position, onFoot: !this.drive }; }
    if (this.drive && !this.drive.def.fly && !this.drive.def.air) this.street.danger = { x: this.drive.o.position.x, z: this.drive.o.position.z, yaw: this.mv, v: this.drive.v }; else this.street.danger = null;
    if (!busy && !this.photo) { if (this.drive) this.moveCar(dt); else if (!this.life.parade.riding && !this.bus.on) this.movePlayer(dt); this.kerb.update(dt, t); }
    this.idleCam(dt, !busy && !this.cine && !this.photo && this.mode === 'play');
    if (this.cine) this.cine(dt); else if (this.stuntCam) this.stuntView(dt); else this.updateCam(dt);
    this.world.follow(this.player.root.position);
    this.world.update(dt, t, this.player.root.position);
    { const pp = this.player.root.position; for (const i of this.isles) i.update(dt, t, { x: pp.x, z: pp.z, driving: !!this.drive, alt: this.drive?.def.fly ? this.alt : 0, busy, gig: !!this.gig }); }
    // Wetter und Stadtleben (Zufallsereignisse, samstags die Parade)
    useSeason(s.flags.season); this.xmas.set(isXmas() || (season() === 'winter' && new Date().getMonth() === 11));
    this.fw.update(dt, this.player.root.position, busy); this.live.update(dt, busy); this.airRingTick(t);
    if (this.weather.update(dt, s.day, s.time, this.player.root.position) && !busy) { change(s, { fun: 8 }); sfx('win'); g.hud.banner('🌈 Ein Regenbogen über Rainbow City', 'Nach dem Regen. Spaß +8', 'good', 4200); }
    this.friends.update(dt, this.netState());
    // Begleitung: läuft mit, bringt Nähe, verabschiedet sich nach ein paar Stunden
    if (this.buddy.who && !busy) {
      const b = this.buddy, who = b.who!;
      if (b.update(dt, dt / DAY_SEC * 1440, this.player.root.position, this.player.root.rotation.y, !!this.drive)) {
        change(s, { social: 3, fun: 1 }); const m = together(s, who.id);
        if (m) { sfx('win'); g.hud.banner('💞 Ihr seid euch näher gekommen', m, 'good', 4600); }
      }
      if (b.left <= 0) this.byeBuddy('Ich muss langsam los. Das war ein richtig schöner Tag mit dir. 💜');
    }
    { const free = !busy && !this.gig && !this.kerb.rider && this.combat.wanted.stars === 0 && !this.life.ev && !this.life.parade.riding && !this.isles.some((i) => i.active);
      this.trouble.update(dt, { free, night: this.world.night > .5, ref: this.player.root.position });
      this.jagd.update(dt, free && !this.trouble.cur && !this.bus.on, s); }
    this.viralTick(dt, busy); this.newsTick(dt, busy);
    this.life.update(dt, t, this.player.root.position, { busy: busy || !!this.gig || !!this.trouble.cur || !!this.kerb.rider || this.combat.wanted.stars > 0, night: this.world.night > .5, rain: this.weather.rain > .2, onFoot: !this.drive });

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = .5; if (!busy && !this.photo) storyTick(this.ctx()); this.refreshHud(); if (mood(s) >= 75 && !busy) g.done(track(s, 'mood')); }
    const mk = busy ? [] : this.markers();
    g.hud.markers(mk, (q) => g.engine.project(q));
    if ((this.radarT -= dt) <= 0) {
      this.radarT = 1 / 20;
      const pp = this.player.root.position;
      // GPS: Weg über die Straßen zum Ziel (laufender Auftrag zuerst), alle halbe Sekunde neu berechnet
      if ((this.routeT -= 1 / 20) <= 0) {
        this.routeT = .5;
        const gp = (mk.find((m) => m.id === 'gig' || m.id === 'kerb' || m.id === 'trouble') || mk.find((m) => m.id === 'pin') || mk.find((m) => m.id === 'g'))?.pos;
        // eigener Wegpunkt erreicht: weg damit
        const pin = mk.find((m) => m.id === 'pin'); if (pin && Math.hypot(pin.pos.x - pp.x, pin.pos.z - pp.z) < 12) { s.pin = ''; sfx('coin'); toast(`📍 Ziel erreicht: ${pin.label}`); }
        const flying = !!this.drive && (!!this.drive.def.air || (!!this.drive.def.fly && this.alt > 3));
        this.gps = gp && !flying && onGrid(pp.x, pp.z) && Math.hypot(gp.x - pp.x, gp.z - pp.z) > 14 ? { pts: route(pp.x, pp.z, gp.x, gp.z), color: ({ g: '#ff3fb0', pin: '#3ec8ff' } as Record<string, string>)[mk.find((m) => m.pos === gp)?.id || ''] || '#ffd23b' } : null;
      }
      if (this.gps) this.gps.pts[0] = [pp.x, pp.z];
      g.hud.radar(pp.x, pp.z, this.cam.yaw, [
        ...this.world.pois.filter((q) => Math.hypot(q.x - pp.x, q.z - pp.z) < 60).map((q) => ({ x: q.x, z: q.z, icon: q.icon })),
        ...this.combat.flucht.blips(this.combat.wanted.stars, pp),
        ...mk.map((m) => ({ x: m.pos.x, z: m.pos.z, color: m.id === 'g' ? '#ff3fb0' : m.id === 'gig' ? '#ffd23b' : m.id === 'kerb' ? '#ff6ad5' : m.id === 'trouble' ? '#ff4b3b' : m.id === 'pin' ? '#3ec8ff' : '#ffffff', goal: m.id === 'g' || m.id === 'gig' || m.id === 'kerb' || m.id === 'trouble' || m.id === 'pin' })),
      ], this.gps);
    }
    // Lichtsäule: laufender Auftrag hat Vorrang (gelb), sonst das Story-Ziel (pink)
    const gm = mk.find((m) => m.id === 'gig' || m.id === 'kerb');
    this.goalBeam((gm || mk.find((m) => m.id === 'g'))?.pos as Vector3 | undefined, t, gm ? 0xffd23b : 0xff3fb0);
    if (!busy) this.gigTick(dt);
    if (!busy) this.combat.update(dt, t);
    if (!this.gig && (this.brawl.fighting || this.brawl.chasing)) this.brawl.clear();
    if (!busy) this.brawl.update(dt);
    if (this.photo) g.hud.prompt(null);
    else if (!busy) {
      this.findNear();
      const inp = g.engine.input;
      if (inp.pressed('confirm')) { inp.consume('confirm'); this.interact(); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('attack')) { inp.consume('attack'); if (this.drive) { rigOf.get(this.drive.o)?.hop(); this.kerb.honk(); } else this.combat.attack(); }
      else if (inp.pressed('weapon')) { inp.consume('weapon'); this.combat.cycle(); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      this.checkStickers(); this.worldGates();
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
      // Turbo geht immer; wer erschöpft ist, rennt nur langsamer (und bekommt einmal den Hinweis)
      const sv = this.g.save.data, run = inp.held('sprint'), tired = sv.needs.energy < tiredAt(sv);
      if (run && tired && !this.tiredTold) { this.tiredTold = true; toast('⚡ Du bist müde und rennst langsamer. Schlaf dich aus oder trink einen Kaffee.'); }
      const sp = (run ? sprintSpeed(sv, tired) : 4.4) * Math.min(1, mag);
      // Wer viel rennt, bekommt mehr Puste: alle 40 Sekunden Sprint ein Punkt Ausdauer
      if (run && mag > .5 && (this.sprintT += dt) > 40) { this.sprintT = 0; const n = gainAus(sv, 1); if (n) toast(`🏃 Ausdauer +1 · ${ausdauer(sv)}/100`); }
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

type GigStepRun = import('./gigs').GigStep & { run?: boolean };
const HONK = ['📯 „Hallo? Das ist eine Straße, kein Laufsteg!“', '📯 „Schätzchen, geh mal zur Seite!“', '📯 Tüüüt! „Ich hab ein Date!“', '📯 „Zebrastreifen ist da drüben, Darling!“'];
const CRASH = ['🚗💥 „Hey! Hast du deinen Führerschein im Lotto gewonnen?“', '🚗💥 „Mein frisch polierter Lack, Schätzchen!“', '🚗💥 „Augen auf, Darling!“', '🚗💥 „Das zahlt deine Versicherung!“', '🚗💥 „Na super. Jetzt komm ich zu spät zum Brunch.“'];
const glowCol = { gig: col(0xffd23b), story: col(0xff3fb0) };

/** Sitzhöhe der sichtbaren Fahrerin auf Roller bzw. Boot (−1: Figur im Wagen versteckt) */
function rideSeat(d: CarDef) { return d.ride === 'scooter' ? .2 : d.ride === 'boat' ? .38 : -1; }
