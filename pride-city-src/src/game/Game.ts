/* Spielablauf: Ladebildschirm → Titel (Stadt als Kulisse) → Editor → Stadt ↔ Minispiele. Menüs im Konsolen-Stil. */
import { fans, fanItems, sellFan, camShow } from './fanshop';
import { Engine } from '../engine/Engine';
import { Save } from '../engine/Save';
import { trackProgress } from '../engine/Assets';
import { unlock, music, vol, applyVolume, sfx, nightSounds } from '../engine/Audio';
import { Loading, Dialog, Menu, el, $, esc, hints, toast, chapterCard, bindInputMode, type Item, type Line } from '../ui/ui';
import { Hud } from '../ui/Hud';
import { Touch } from '../ui/Touch';
import { CityScene, STICKERS } from './CityScene';
import { preloadPeople } from './Actor';
import { CreatorScene } from './CreatorScene';
import { DanceScene } from './minigames/DanceScene';
import { MINIS, miniById, miniForGl, miniName, miniIcon, miniSub, type MiniResult } from './minigames/minis';
import { World } from './World';
import { pianoSongs, pianoParts } from './minigames/showSongs';
import { openGigs, GIGS, fmtTime } from './gigs';
import { BUSINESSES, owns, owned, income } from './empire';
import { clubDeal, clubManage } from './clubui';
import { isClub, QEVENTS } from './club';
import { CLUB_LAYOUT } from './clubdeco';
import type { Invite } from './online';
import { pcEvents } from './hooks';
import { dragAct } from './drag';
import { wagenMenu, wagenOf } from './festwagen';
import { fmMenu } from './pridefm';
import { houseMenu, useHomeItem } from './houseui';
import { roomTheme, roomLevel } from './house';
import { SKY, skyAt, forecast, SEASONS, season, seasonPick, useSeason, isXmas, isSilvester, type Season } from './weather';
import { lineup, KINDS, doneThisWeek, isOpen, daysLeft, crowns, weekKey } from './live';
import { closeness, levelName, addCloseness, chatOpen, chatOf, replyChat, OUTINGS, outingWhy, doOuting, GIFTS, giveGift, model, partners, jealousy, dateFolge, type Model } from './bond';
import { STAFF, UPGRADES, UP_MAX, SPECIAL, daily as bizDaily, staffOf, upOf, popOf, issueOf, eventReady, hire, upgrade, workIn, hostEvent, fixIssue, upCost, staffFee, fixCost, eventCost } from './manage';
import { SLOTS, part, readPimp, buyPart, clientFor, episode, type Slot } from './tuning';
import { workshopItems } from './pimp';
import { SHOP, RACES, PAINTS, PAINT_COST, TUNE_COST, MEDALS, ownsCar, myCar, tuneLevel, buyCar, buyTune, buyPaint, bestTime, medalFor, stats } from './vehicles';
import { ACTS, act, actLabel, chain, islesLeft, HISTORY, HIST_ORDER, ROMAN } from './faden';
import { FLUT, flutDone } from './flut';
import { crewStep, CREW_STEPS, crewOf, crewApp, VIERTEL, schutz, patrol } from './crew';
import { sagaDone, MISSIONS } from './saga';
import { nachtDone, NACHT } from './nacht';
import { timeline, PEOPLE, RIGHTS, flags, todaysQuiz, quizDoneToday, quizReward, type Q } from './wissen';
import { CHAPTERS, goal, danceResult, NPCS, chapterLabel, BAR_COST, lichtPart, lichtLight, lfPart, lfGlow } from './story';
import { TAREK_STEPS, tarekDone, ways } from './tarek';
import { LF_CHAPTERS, lfEnding, lfPct } from './leuchtfeuer';
import { LICHT_CHAPTERS, lichtEnding } from './licht';
import { HomeScene } from './HomeScene';
import { LAWS } from './crime';
import { RING, WEDDING, ADOPT, KID_NAMES, spouse, fiance, kid, canPropose, propose, canWed, wed, canAdopt, applyAdopt, spouseLook } from './family';
import { placeGigs, regular, treffDone, SAUNA_INFO, BEACH_INFO } from './treff';
import { mates, mateInfo, candidates, moveIn, moveOut, MAX_MATES, pet, petHungry, PETS, SHELTER_INFO, adoptPet, petAct, EVENINGS, eveningWhy, doEvening } from './wahl';
import { InteriorScene } from './InteriorScene';
import { WorldScene } from './WorldScene';
import { WORLDS, worldDef, worldStage, cityGate, SIDE_GATE } from './worlds';
import { ALPHA, QUICK, EMOTES, MAX_GUESTS, normCode, netError } from './online';
import { PLACE_THEMES, type Spot, type Theme } from './interiors';
import { NIGHT_S } from './liebe';
import { karrieren, karriere, meinBeruf, annehmen, stand, ANZEIGEN, NPC_BERUF } from './beruf';
import { dreh } from './dreh';
import { strangerTalk, enterDarkroom, leaveDarkroom, darkVend, soloNight, type TalkOpts } from './flirtui';
import { stiTick, testAndTreat, symptoms, inTreatment, STI_INFO, hivUU, exposure } from './sti';
import type { Stranger } from './flirt';
import type { Sfx } from '../engine/Audio';
import { JOBS, jobsAt, blocked, situations, finish, title as jobTitle, wage } from './jobs';
import { photo } from './Photo';
import { gramMenu, empireMenu, gymItems, bodyItems, bodyMenu, muskelLine } from './aufstiegui';
import { giveBuff, trainBoost } from './fit';
import { known, moodWord, heard } from './leben';
import { busTalk, busAfter, BUS_COST, BUS_MIN } from './bus';
import { TANK, tankOf } from './tank';
import { followers, fmtNum } from './gram';
import { myRank } from './mogul';
import { train } from './figur';
import { PROFILES, profileShots, profile, dateRec, dateQuestions, finishDate, canStay, DATE_STAGE, testDue, HEALTH_INFO, GLOSSARY, feed, post, bond, TEST_EVERY, FILMS, WORKERS, isLateNight, canMeet, encounter, SAFE_DATING } from './social';
import { DILDOS, EXTRAS, CONDOMS, ownsToy, buyToy, buyCondoms, condomLabel } from './toys';
import { NEEDS, mood, moodIcon, moodName, change, advance, minutesUntil, track, dailyState, clock, weekday, hour, type Daily } from './life';

type BookId = 'licht' | 'leuchtfeuer';
export const DONATE = 60;
const BOOKS: Record<BookId, { title: string; file: string; cover: string; blurb: string }> = {
  licht: { title: 'Ich bin das Licht', file: 'book/ich-bin-das-licht.json', cover: 'book/cover.jpg', blurb: 'Der Roman von RicoReWi: Leon Sommer, Lady Luma und die One Love Bar. In Pride City erzählt Leon seine Geschichte auch selbst – an der One Love Bar.' },
  leuchtfeuer: { title: 'Leuchtfeuer', file: 'book/leuchtfeuer.json', cover: 'book/leuchtfeuer.jpg', blurb: 'Der Jugendroman von RicoReWi: Finn und Ben, ein Schuljahr in Warnholm und der Leuchtturm Rotenhorn. In Pride City erzählt Finn die Geschichte selbst – am Leuchtturm auf dem Steg.' },
};


/** Kurzinfo Familie fürs Handy */
function famSub(s: Game['save']['data']) {
  const sp = spouse(s), fi = fiance(s), k = kid(s);
  const wg = mates(s).length, pt = pet(s), extra = `${wg ? ` · WG mit ${wg}` : ''}${pt ? ` · ${pt.kind.icon} ${pt.name}` : ''}`;
  return (sp ? `Verheiratet mit ${sp.name}${k ? ' · ' + k.name + ' wohnt bei euch' : s.flags.adopt ? ' · Adoption läuft' : ''}` : fi ? `Verlobt mit ${fi.name}` : 'Heiraten, Adoption, Wahlfamilie, Haustier') + extra;
}

/** Kaufpreis des Penthouse in der Hochstadt */
export const PENTHOUSE = 6000;
export class Game {
  engine: Engine;
  /** Ereignisse für Story und Minispiele (hooks.ts): clubGekauft, clubNacht, clubEinnahmen, hausAusbau … */
  events = pcEvents;
  save = new Save();
  loading = new Loading();
  dialog = new Dialog();
  hud = new Hud();
  touch: Touch;
  city!: CityScene;
  menuOpen = false;
  home: HomeScene | null = null;
  where: 'city' | 'home' | 'inside' | 'world' = 'city';
  /** aktuelle Welt jenseits der Stadt (worlds.ts) */
  world: WorldScene | null = null;
  inside: InteriorScene | null = null;
  insideBack = { x: 0, z: 0, yaw: 0 };
  /** Darkroom: aus welchem Club man kam (zurück durch den Vorhang) */
  darkFrom: { theme: Theme; place: string } | null = null;
  private insideWorld = false;
  /** Online: zu Gast im Club einer Freundin/eines Freundes */
  clubGuest: (Invite & { from: string }) | null = null;
  /** Innenraum ist ein Anbau des Zuhauses: zurück in die Wohnung */
  private insideHome = false;
  private interiors = new Map<string, InteriorScene>();
  private photoIdx = 0;
  private photoFor = '';
  private overlay: HTMLElement | null = null;
  private menu: Menu | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
    this.touch = new Touch(this.engine.input);
    bindInputMode(this.engine.input);
    const st = this.save.data.settings;
    vol.music = st.music; vol.sfx = st.sfx; vol.vib = st.vib !== false;
    this.engine.setQuality(st.quality);
    // Audio braucht eine Nutzeraktion
    const go = () => unlock();
    addEventListener('pointerdown', go); addEventListener('keydown', go);
    this.engine.onFrame((dt) => {
      const inp = this.engine.input;
      if (inp.mode === 'pad') unlock();
      if (this.dialog.open) this.dialog.update(dt, inp);
      else if (this.menu) this.menu.handle(inp);
    });
    this.hud.onPrompt = () => (this.where !== 'city' ? this.engine.input.tap('confirm') : this.city?.interact());
    this.hud.onPhone = () => { if (!this.menuOpen) this.phone(); };
    this.hud.onMenu = () => this.pauseMenu();
    addEventListener('visibilitychange', () => { if (document.hidden) this.save.write(); });
  }

  async run() {
    this.loading.show('Pride City', 'Rainbow City wird gebaut');
    const stop = trackProgress((d, t) => this.loading.progress(Math.min(.95, d / Math.max(1, t)), 'Modelle und Texturen'));
    const s = this.save.data;
    this.city = new CityScene(this);
    await Promise.all([World.load(this.city.scene), preloadPeople(this.city.scene)]);
    this.loading.progress(.96, 'Stadt wird aufgebaut');
    await this.city.build();
    stop();
    this.engine.setScene(this.city);
    this.engine.start();
    this.loading.progress(1, 'Bereit');
    setTimeout(() => this.loading.hide(), 250);
    const q = new URLSearchParams(location.search);
    if (q.has('play') && s.started) { if (s.inside) this.enterHome(); else this.city.setPlay(); return; }
    this.title();
    // Einladungslink: Code steht schon drin
    this.joinCode = normCode(q.get('join') || '');
    if (this.joinCode.length === 4) { if (this.save.hasGame) this.codeMenu(() => this.title(), () => this.play()); else toast(`🌐 Einladung in die Stadt ${this.joinCode}: Starte erst ein neues Spiel, dann unter „Online & Freunde“ beitreten.`, 7000); }
  }

  /* ---------- Overlay-Menüs ---------- */
  openMenu(html: string, items: Item[], onBack: (() => void) | null, cls = 'title') {
    this.closeMenu();
    this.overlay = el(`<div class="screen ${cls}">${html}</div>`);
    this.menu = new Menu(items);
    this.menu.onBack = onBack;
    $('#ui').appendChild(this.overlay);
    ($('.slot', this.overlay) || this.overlay).appendChild(this.menu.el);
    this.menuOpen = true;
  }
  closeMenu() {
    const cm = document.getElementById('cloudMount');
    if (cm && cm.parentElement !== document.body) { cm.classList.add('hidden'); document.body.appendChild(cm); }
    this.overlay?.remove(); this.overlay = null; this.menu = null; this.menuOpen = false; }

  fade(mid: () => void) {
    const f = el('<div style="position:fixed;inset:0;background:#000;opacity:0;transition:opacity .35s;z-index:45"></div>');
    document.body.appendChild(f);
    requestAnimationFrame(() => (f.style.opacity = '1'));
    setTimeout(() => { mid(); f.style.opacity = '0'; setTimeout(() => f.remove(), 400); }, 380);
  }
  chapterCard(k: string, t: string, txt: string) { return chapterCard(k, t, txt); }

  /* ---------- Titelmenü ---------- */
  title() {
    this.engine.setScene(this.city);
    this.city.setTitle();
    const s = this.save;
    const items: Item[] = [];
    if (s.hasGame) items.push({ icon: '▶', label: 'Fortsetzen', sub: `${s.data.name} · ${s.data.flags.mode === 'frei' ? 'Freie Welt' : s.data.chapter > 5 ? actLabel(s.data) : 'Kapitel ' + s.data.chapter} · Tag ${s.data.day}`, big: true, fn: () => this.play() });
    items.push({ icon: '✨', label: 'Neues Spiel', sub: 'Dein Leben in Rainbow City beginnt', big: !s.hasGame, fn: () => this.newGame() });
    items.push({ icon: '📖', label: 'Story', sub: 'Kapitel und roter Faden', fn: () => this.storyMenu(() => this.title()) });
    items.push({ icon: '🪩', label: 'Minispiele', sub: 'Tanz-Battle, Bar, Drag-Show, Dildo Jump, Toast & mehr in 3D', fn: () => this.minigames(() => this.title()) });
    items.push({ icon: '🌐', label: 'Online & Freunde', sub: this.city.friends.net.on ? `Verbunden · Stadt ${this.city.friends.net.code}` : 'Zusammen durch Rainbow City, per Link oder Code', fn: () => this.onlineMenu(() => this.title(), () => this.play()) });
    items.push({ icon: '⚙️', label: 'Optionen', sub: 'Grafik, Ton, Steuerung', fn: () => this.options(() => this.title()) });
    items.push({ icon: '💜', label: 'Mitwirkende', sub: 'Assets und Lizenzen', fn: () => this.credits() });
    this.openMenu(`<div class="col"><div class="logo"><span class="l1">Pride</span><span class="l2">City</span><small>Ein Leben in allen Farben</small></div><div class="slot"></div></div>
      <div class="side panel pass" style="display:none"></div><div class="ver">v${__APP_VERSION__} · ab 16 · alle Figuren frei erfunden</div>`, items, null);
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen']]);
  }

  private newGame() {
    // Story-Modus (Kapitel, Akte und „Gitter und Glitzer“ mit Rico und Tarek) oder freie Welt ohne Geschichte
    const start = () => this.openMenu(`<div class="col"><div class="panel"><h3>Wie willst du spielen?</h3><p>Im Story-Modus lebst du als Rico (oder deine eigene Figur) mit Tarek in einer offenen Beziehung. Tarek sitzt unschuldig in U-Haft, du holst ihn raus, ohne Zeitdruck, neben allen Kapiteln und Akten. In der freien Welt ist alles offen, ohne Geschichte und ohne Story-Anrufe.</p><div class="slot"></div></div></div>`, [
      { icon: '📖', label: 'Story-Modus', sub: 'Rico, Tarek und die ganze Geschichte von Pride City', big: true, fn: () => go('story') },
      { icon: '🌆', label: 'Freie Welt', sub: 'Alles offen, keine Geschichte. Story später jederzeit im Menü → Story', fn: () => go('frei') },
      { icon: '←', label: 'Abbrechen', fn: () => this.title() }], () => this.title());
    const go = (mode: 'story' | 'frei') => {
      this.save.newGame();
      if (this.save.oldFound && importOld) this.save.importOld();
      const d = this.save.data;
      d.flags.mode = mode;
      if (mode === 'story') { d.flags.tarekIntro = true; if (!importOld) { d.name = 'Rico'; d.pronouns = 'he'; d.body = 'pc_rico'; } }
      this.closeMenu();
      this.fade(() => this.creator());
    };
    let importOld = false;
    if (this.save.hasGame) {
      this.openMenu('<div class="col"><div class="panel"><h3>Neues Spiel?</h3><p>Dein bisheriger Spielstand wird überschrieben.</p><div class="slot"></div></div></div>',
        [{ icon: '✨', label: 'Ja, neu anfangen', fn: start }, { icon: '←', label: 'Abbrechen', fn: () => this.title() }], () => this.title());
      return;
    }
    if (this.save.oldFound) {
      this.openMenu('<div class="col"><div class="panel"><h3>Gay Life! gefunden</h3><p>Auf diesem Gerät liegt ein Spielstand aus Gay Life!. Name, Erspartes und Glitzer können mit nach Pride City.</p><div class="slot"></div></div></div>',
        [{ icon: '📦', label: 'Übernehmen', fn: () => { importOld = true; start(); } }, { icon: '✨', label: 'Ganz neu starten', fn: start }], () => this.title());
      return;
    }
    start();
  }

  creator(fromGame = false) {
    this.closeMenu();
    const sc = new CreatorScene(this, async () => {
      this.save.data.started = true; this.save.write();
      this.fade(async () => {
        await this.city.rebuildPlayer();
        // auch in der Wohnung und im Laden steht sofort die neue Figur (sonst blieb dort die alte)
        if (fromGame) { if (this.where === 'home') await this.home?.syncPlayer(); else if (this.where === 'inside') await this.inside?.syncPlayer(); else if (this.where === 'world') await this.world?.syncPlayer(); this.resume(); return; }
        this.loadChapter();
      });
    }, () => this.fade(() => (fromGame ? this.resume() : this.title())));
    this.engine.setScene(sc);
  }

  private loadChapter() {
    const s = this.save.data;
    // Freie Welt: Kapitel überspringen, alles ist offen
    if (s.flags.mode === 'frei' && s.chapter === 1 && s.step === 0) { s.chapter = 6; s.flags.freiStart = s.day; this.save.write(); }
    const ch = CHAPTERS[Math.min(4, s.chapter - 1)];
    this.loading.show(s.chapter > 5 ? 'Rainbow City' : `Kapitel ${ch.n}`, s.chapter > 5 ? chapterLabel(s) : ch.title);
    let p = 0;
    const iv = setInterval(() => { p = Math.min(1, p + .2); this.loading.progress(p, p < 1 ? 'Rainbow City erwacht' : 'Bereit'); if (p >= 1) { clearInterval(iv); go(); } }, 160);
    const go = () => {
      this.engine.setScene(this.city);
      this.city.setPlay();
      this.loading.hide();
      if (s.flags.freiStart === s.day && s.chapter > 5 && !s.flags.freiCard) { s.flags.freiCard = true; void chapterCard('Freie Welt', 'Rainbow City gehört dir', 'Keine Geschichte, keine Anrufe, alles offen: Jobs, Dates, Clubs, Autos, Inseln und Minispiele. Den Story-Modus kannst du jederzeit im Menü unter Story einschalten.'); }
      if (s.chapter === 1 && s.step === 0) {
        chapterCard(`Kapitel ${ch.n}`, ch.title, ch.text).then(() => {
          this.dialog.say([
            { who: 'Du', color: '#444', text: 'Rainbow City. Endlich. Die Tram ist weg, der Koffer ist schwer – und überall wehen Flaggen.' },
            ...(s.flags.tarekIntro ? [{ who: 'Du', color: '#444', text: 'Eigentlich wollten Tarek und ich heute zusammen ankommen. Neue Stadt, offene Beziehung, ein Balkon. Stattdessen hat er gestern Nacht angerufen: aus der Polizeiwache.' },
              { who: 'Du', color: '#444', text: 'Erst mal ankommen. Dann hole ich ihn da raus. Schritt für Schritt.' }] : []),
            { who: 'Du', color: '#444', text: 'Mo wollte vor ihrem Café warten. Das Kaffeeklatsch liegt die Hauptstraße runter, am Platz.' },
          ], () => { s.step = 1; this.save.write(); this.city.refreshHud(); });
        });
      }
    };
  }

  play() {
    this.closeMenu();
    if (this.save.data.inside) { this.enterHome(); return; }
    this.fade(() => { this.engine.setScene(this.city); this.city.setPlay(); });
  }

  /** Zurück dorthin, wo man war (Stadt oder Wohnung) */
  resume() {
    if (this.where === 'home' && this.home) { this.engine.setScene(this.home); return; }
    if (this.where === 'inside' && this.inside) { this.engine.setScene(this.inside); return; }
    if (this.where === 'world' && this.world) { this.engine.setScene(this.world); return; }
    this.engine.setScene(this.city); this.city.setPlay();
  }

  /* ---------- Wohnung ---------- */
  enterHome(after?: () => void) {
    sfx('door');
    const go = async () => {
      if (!this.home) { this.home = new HomeScene(this); await this.home.build(); }
      await this.home.syncPlayer();
      this.where = 'home'; this.save.data.inside = true;
      this.home.setSky(this.city.world.night);
      this.engine.setScene(this.home);
      after?.();
    };
    this.closeMenu();
    this.fade(() => { go(); });
  }
  leaveHome() {
    const s = this.save.data;
    sfx('door');
    void this.home?.morning(null);
    this.fade(() => { this.where = 'city'; s.inside = false; s.pos = { x: 3.6, z: 40, yaw: Math.PI / 2 }; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
  }
  /* ---------- Welten jenseits der Stadt: Weltentor am Hafen oder Schnellreise im Handy ---------- */
  worldMenu() {
    const s = this.save.data, close = () => { this.closeMenu(); this.touch.show(true); };
    const state = (id: string) => { const st = worldStage(s.flags, id); return st >= 4 ? '✅ geschafft' : st > 0 ? `Aufgabe ${Math.min(3, st)} von 3` : 'neu'; };
    this.openMenu(`<div class="panel"><h3>🌀 Weltentor</h3><p>Reise in andere Welten. Hinlaufen kannst du am Hafen, die Schnellreise geht von überall. In jeder Welt warten eine Geschichte, drei Aufgaben und der Flitzer zum Fahren und Fliegen.</p></div>`,
      [...WORLDS.map((w) => ({ icon: w.icon, label: w.name, sub: `${w.sub} · ${w.adult && !s.settings.adult ? 'nur mit 18+' : state(w.id)}`, disabled: (!!w.adult && !s.settings.adult) || this.world?.def.id === w.id && this.where === 'world', fn: () => { close(); this.enterWorld(w.id); } })),
        ...(this.where === 'world' ? [{ icon: '🏙️', label: 'Zurück nach Rainbow City', sub: 'zum Weltentor am Hafen', fn: () => { close(); this.leaveWorld(); } }] : []),
        { icon: '←', label: 'Schließen', fn: close }], close);
  }
  /** in eine Welt reisen; arrive: vom Kai der Hauptstadt oder durch das West- oder Osttor einer Nachbarwelt */
  enterWorld(id: string, arrive: 'city' | 'west' | 'east' = 'city') {
    const def = worldDef(id), s = this.save.data; if (!def) return;
    if (def.adult && !s.settings.adult) { toast('Nur mit 18+ (Einstellungen).'); sfx('miss'); return; }
    // Welt liegt als Insel in der Stadt: kein Szenenwechsel, nur hinstellen
    const isle = this.city.isles.find((i) => i.def.id === id);
    if (isle) {
      const at = isle.arrival(arrive); sfx('tram'); this.closeMenu();
      if (this.where !== 'world' && arrive === 'city' && this.city.driving) this.city.leaveCar();
      this.fade(() => { if (this.where === 'world') { this.world?.quit(); this.where = 'city'; this.engine.setScene(this.city); s.pos = at; this.city.setPlay(); } else this.city.warp(at.x, at.z, at.yaw); this.save.write(); });
      return;
    }
    if (this.city.driving) this.city.leaveCar();
    sfx('tram'); this.closeMenu();
    { const g = cityGate(id); s.pos = { x: g.x + 3.6, z: g.z, yaw: Math.PI / 2 }; } s.inside = false;
    const side = arrive === 'city' ? null : { x: (arrive === 'west' ? -1 : 1) * (SIDE_GATE.x - 3.2), z: SIDE_GATE.z + .2, yaw: arrive === 'west' ? Math.PI / 2 : -Math.PI / 2 };
    this.fade(async () => {
      const old = this.world;
      if (old?.def.id !== id) {
        this.loading.show(def.name, 'Weltentor'); const sc = new WorldScene(this, def); await sc.build(); this.loading.hide();
        sc.back = side; sc.hello = true;
        this.world = sc; this.where = 'world'; this.engine.setScene(sc);
        if (old) this.engine.disposeScene(old);   // nur eine Welt im Speicher (Handy)
      } else { old.back = side; old.hello = true; this.where = 'world'; this.engine.setScene(old); }
      this.save.write();
    });
  }
  leaveWorld() {
    sfx('tram'); this.world?.quit();
    this.fade(() => { this.where = 'city'; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
  }

  /* ---------- Innenräume aller Häuser ---------- */
  /** Haus betreten: Einrichtung aus interiors.ts, zurück vor die Tür (back) */
  enterInterior(theme: Theme, back: { x: number; z: number; yaw: number }, placeId = '', fromWorld = false, toHome = false) {
    const s = this.save.data;
    if (theme.adult && !s.settings.adult) { toast('Nur mit 18+ (Einstellungen).'); sfx('miss'); return; }
    sfx('door'); this.closeMenu();
    this.insideBack = back; this.insideWorld = fromWorld; this.insideHome = toHome;
    if (!fromWorld && !toHome) s.pos = { ...back };
    this.fade(async () => {
      const key = theme.id + '|' + placeId + (fromWorld ? '|' + theme.title : '');
      let sc = this.interiors.get(key);
      if (!sc) { this.loading.show(theme.title, 'Einrichtung'); sc = new InteriorScene(this, theme, placeId); await sc.build(); this.interiors.set(key, sc); this.loading.hide();
        // nur die letzten Räume behalten (Speicher am Handy)
        for (const [k, old] of this.interiors) { if (this.interiors.size <= 3) break; if (old !== sc) { this.engine.disposeScene(old); this.interiors.delete(k); } } }
      this.inside = sc; this.where = 'inside';
      this.engine.setScene(sc);
    });
  }
  leaveInterior() {
    const s = this.save.data;
    sfx('door');
    if (this.inside?.theme.id === 'darkroom' && leaveDarkroom(this)) return;
    if (this.clubGuest && this.inside?.netKey === this.clubGuest.p) this.clubGuest = null;
    if (this.insideHome && this.home) { const h = this.home; this.insideHome = false; this.fade(() => { this.where = 'home'; this.inside = null; h.fromAnnex = true; h.setSky(this.city.world.night); this.engine.setScene(h); this.save.write(); }); return; }
    if (this.insideWorld && this.world) { const w = this.world; this.fade(() => { this.where = 'world'; this.inside = null; w.back = { ...this.insideBack }; this.engine.setScene(w); this.save.write(); }); return; }
    this.fade(() => { this.where = 'city'; this.inside = null; s.pos = { ...this.insideBack }; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
  }
  /** Online-Einladung in einen Club: hingehen oder später */
  clubInvite(from: string, inv: Invite) {
    const theme = PLACE_THEMES[inv.p]; if (!theme || !CLUB_LAYOUT[inv.p]) return;
    const ev = QEVENTS.find((q) => q.id === inv.e), here = this.where === 'inside' && this.inside?.netKey === inv.p;
    sfx('win');
    if (here) { this.clubGuest = { ...inv, from }; this.inside!.refreshClub(); toast(`🎉 ${from} feiert hier${ev ? ': ' + ev.name : ''}!`, 4000); return; }
    if (this.dialog.open || this.menuOpen) { toast(`🎉 ${from} lädt dich in den ${inv.n} ein${ev ? ' (' + ev.name + ')' : ''}. Öffne „Online & Freunde“, um hinzugehen.`, 5000); this.pendingInvite = { ...inv, from }; return; }
    this.dialog.say([{ who: `🌐 ${from}`, color: '#ff6ad5', text: `Komm in meinen Club! Im ${inv.n} ist ${ev ? ev.name : 'Clubnacht'}. Wir feiern zusammen.`, choices: [
      { label: '🪩 Hingehen', fn: () => setTimeout(() => this.joinFriendClub({ ...inv, from }), 50) },
      { label: 'Später', sub: 'im Online-Menü geht es auch noch', fn: () => { this.pendingInvite = { ...inv, from }; } }] }]);
  }
  pendingInvite: (Invite & { from: string }) | null = null;
  /** In den Club einer Freundin/eines Freundes gehen (aus Stadt, Wohnung oder anderem Raum) */
  joinFriendClub(inv: Invite & { from: string }) {
    const s = this.save.data, theme = PLACE_THEMES[inv.p]; if (!theme) return;
    if (this.where === 'world') { toast('Erst zurück nach Rainbow City, dann in den Club.'); return; }
    this.pendingInvite = null; this.clubGuest = inv;
    let back = { ...s.pos };
    if (this.where === 'city') { const r = this.city.player.root; back = { x: r.position.x, z: r.position.z, yaw: r.rotation.y }; }
    if (this.where === 'home') { s.inside = false; back = { x: 3.6, z: 40, yaw: Math.PI / 2 }; }
    if (this.where === 'inside' && this.inside?.netKey === inv.p) { this.inside.refreshClub(); return; }
    this.enterInterior(theme, back, inv.p);
  }
  /** Anbau betreten (Raum aus house.ts, Stufe im Namen, damit ein Ausbau neu eingerichtet wird) */
  enterAnnex(room: string) {
    const lv = roomLevel(this.save.data, room); if (!lv) return;
    this.enterInterior(roomTheme(room, lv), { x: 0, z: 0, yaw: 0 }, `annex_${room}_${lv}`, false, true);
  }
  /** Besondere Stellen im Anbau */
  annexAct(room: string) { if (room === 'wardrobe') this.fade(() => this.creator(true)); }
  /** Stelle im Innenraum benutzen */
  interiorAct(sp: Spot, sc?: InteriorScene) {
    const s = this.save.data, a = sp.act;
    if (a.k === 'menu') { if (sc?.placeId) this.placeMenu(sc.placeId); return; }
    if (a.k === 'club' || a.k === 'deal') { if (sc?.business) clubDeal(this, sc.business, sc); return; }
    if (a.k === 'annex') { this.annexAct(a.room); return; }
    if (a.k === 'body') { bodyMenu(this, a.what); return; }
    if (a.k === 'drag') { dragAct(this, a.what); return; }
    if (a.k === 'wagen') { wagenMenu(this); return; }
    if (a.k === 'darkroom') { if (sc) enterDarkroom(this, sc); return; }
    if (sc?.theme.id === 'darkroom' && sp.id === 'automat') { darkVend(this); return; }
    if (a.k === 'gl') {
      // Gay-Life!-Spots: 3D-Fassung, sonst das bestehende Pride-City-Gegenstück (nichts doppelt), sonst das 2D-Original
      const m = miniForGl(a.id); if (m) { this.playMini(m.id); return; }
      if (a.id === 'dance') { this.goDance(false); return; }
      if (a.id === 'quiz') { this.quiz(todaysQuiz(s), 0, 0); return; }
      if (a.id === 'dates') { this.phone('dating'); return; }
      this.roman('gaylife', a.id); return;
    }
    if (a.k === 'mini') { this.playMini(a.id); return; }
    if (a.k === 'dance') { this.goDance(false); return; }
    if (a.k === 'show') {
      if (!(s.flags.lichtEnd || lichtPart(s) >= 5)) { toast('Lady Luma probt noch. Ihre Show gibt es ab Leons 5. Rückblende.'); sfx('miss'); return; }
      this.showMenu((o) => this.goDance(false, undefined, o)); return;
    }
    if (a.k === 'bar') { this.barShift(); return; }
    if (a.k === 'book') { this.book(-1, a.id); return; }
    if (a.k === 'story') { this.city.talkTo(a.id); return; }
    if (a.k === 'talk') {
      const day = s.day % a.lines.length;
      this.dialog.say([...a.lines.slice(day), ...a.lines.slice(0, day)].map((text) => ({ who: a.who, color: a.color, text })));
      const k = 'visit_' + a.who; if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 8, fun: 2 }); this.city.refreshHud(); }
      return;
    }
    if (a.adult && !s.settings.adult) return;
    if (a.cost && s.money < a.cost) { toast('Nicht genug Geld.'); sfx('miss'); return; }
    if (a.cost) { s.money -= a.cost; sfx('coin'); }
    if (a.sfx) sfx(a.sfx as Sfx);
    this.fade(() => { this.pass(a.min); change(s, a.d); toast(a.msg); this.save.write(); this.city.refreshHud(); });
  }
  /** Mit einer fremden erwachsenen Person reden (Straße, Häuser, Inseln, Darkroom) */
  strangerTalk(st: Stranger, o: TalkOpts, end?: () => void) { strangerTalk(this, st, o, end); }
  /** Einmal am Tag: Symptome von Geschlechtskrankheiten melden, Behandlungen abschließen (18+) */
  stiCheck() {
    const s = this.save.data; if (!s.settings.adult || s.flags.stiDay === s.day || this.dialog.open) return;
    s.flags.stiDay = s.day;
    const r = stiTick(s), sym = symptoms(s);
    if (sym.length) change(s, { fun: -8 * sym.length });
    if (r.news.length) { sfx('miss'); this.hud.banner('🩺 Da stimmt was nicht …', r.news.join(' ') + ' Ab in den Checkpoint Regenbogen: Test und Behandlung sind anonym.', 'bad', 6500); s.pin = 'checkpoint'; }
    else if (r.healed.length) { sfx('win'); this.hud.banner('💚 Wieder gesund', `${r.healed.join(', ')} ausgeheilt. Kontrolltest nicht vergessen!`, 'good', 4500); }
    this.save.write();
  }
  /** Zeit vergeht durch eine Tätigkeit (Wohnung, Job, Tram) */
  pass(min: number, sleeping = false) {
    const s = this.save.data, days = advance(s, min, sleeping);
    this.city.world.setTime(s.time); this.home?.setSky(this.city.world.night);
    if (days) toast(`${weekday(s)}, Tag ${s.day}.`);
    this.city.refreshHud();
  }
  done(list: Daily[]) { for (const d of list) { toast(`✅ Tagesziel: ${d.text} · +${d.glitter} Glitzer${d.money ? ' · +' + d.money + ' €' : ''}`); sfx('win'); } }
  homeAction(id: string) {
    const s = this.save.data, h = this.home!;
    const busy = (kind: HomeScene['activity'], min: number, fx: () => void, msg: string) => { h.play(kind); if (kind === 'shower') sfx('shower'); else if (kind === 'stove') sfx('cook'); setTimeout(() => { this.pass(min); fx(); toast(msg); this.save.write(); this.city.refreshHud(); }, 900); };
    if (id === 'door') { this.leaveHome(); return; }
    if (id === 'annex') { houseMenu(this); return; }
    if (id.startsWith('up_')) { useHomeItem(this, id.slice(3)); return; }
    if (id === 'wardrobe') { this.fade(() => this.creator(true)); return; }
    if (id === 'shower') { busy('shower', 20, () => { change(s, { hygiene: 100, fun: 3 }); this.done(track(s, 'shower')); }, 'Frisch geduscht! 🚿'); return; }
    if (id === 'tv') { busy('tv', 60, () => { change(s, { fun: 25, energy: -2 }); }, 'Eine Folge „Drag Race“. Herrlich. 📺'); return; }
    if (id === 'stove') {
      if (s.food <= 0) { toast('Keine Lebensmittel. Im Späti Lecker gibt es welche.'); sfx('miss'); return; }
      busy('stove', 45, () => { s.food--; change(s, { hunger: 50, fun: 5 }); this.done(track(s, 'eat')); }, `Lecker gekocht! Noch ${s.food - 1 < 0 ? 0 : s.food} Portionen übrig.`); return;
    }
    if (id === 'spouse' || id === 'kid') { this.familyAction(id); return; }
    if (id.startsWith('wg_')) { this.wgAction(id.slice(3)); return; }
    if (id === 'pet') { this.petAction(); return; }
    if (id === 'fridge') { toast(s.food ? `Im Kühlschrank: ${s.food} Portionen zum Kochen.` : 'Der Kühlschrank ist leer.'); return; }
    if (id === 'bed') {
      const back = () => { this.closeMenu(); this.touch.show(true); };
      this.touch.show(false);
      this.openMenu(`<div class="col"><div class="panel"><h3>Bett</h3><p>Es ist ${clock(s)} Uhr. Schlafen speichert das Spiel.</p><div class="slot"></div></div></div>`, [
        { icon: '🌙', label: 'Schlafen bis 7 Uhr', sub: 'Energie voll, neuer Tag', fn: () => { back(); this.fade(() => { this.pass(minutesUntil(s, 7), true); change(s, { energy: 100, ...(s.flags.h_himmelbett ? { fun: 10 } : {}) }); this.save.write(); toast(`Guten Morgen! ${weekday(s)}, Tag ${s.day}.${s.flags.h_himmelbett ? ' Im Himmelbett geträumt. Spaß +10' : ''}`); }); } },
        ...(s.flags.wild === s.day && s.settings.adult ? [{ icon: '🧺', label: 'Aufräumen', sub: 'Was für eine Nacht …', fn: () => { back(); s.flags.wild = 0; this.pass(15); h.showMess(); toast('Bett frisch bezogen, Verpackungen im Müll. 🧺'); } }] : []),
        ...(s.settings.adult ? [{ icon: '🫦', label: 'Zeit für dich', sub: 'allein unter der Decke · Abblende', fn: () => { back(); soloNight(this, false); } },
          { icon: '📹', label: 'Zeit für dich – mit Aufnahme', sub: 'das Video gehört nur dir', fn: () => { back(); soloNight(this, true); } }] : []),
        { icon: '💤', label: 'Nickerchen (2 Stunden)', sub: '+25 Energie', fn: () => { back(); this.fade(() => { this.pass(120, true); this.save.write(); toast('Ausgeruht.'); }); } },
        { icon: '←', label: 'Zurück', fn: back },
      ], back, '');
    }
  }

  /** Gemeinsamer Abend zu Hause mit WG und Familie (wahl.ts) */
  private eveningMenu(back: () => void) {
    const s = this.save.data, h = this.home!, people = mates(s).length + (spouse(s) ? 1 : 0);
    this.openMenu(`<div class="col"><div class="panel"><h3>🎉 Gemeinsamer Abend</h3><p>Einmal am Tag, ab 18 Uhr. Was macht ihr heute?</p><div class="slot"></div></div></div>`, [
      ...EVENINGS.map((e) => { const why = eveningWhy(s, e, hour(s), people); return { icon: e.icon, label: e.name, sub: why || `${Math.round(e.min / 60 * 10) / 10} Std.${e.cost ? ` · ${e.cost} €` : ''}${e.food ? ' · 1 Portion' : ''}${e.facts ? ' · mit Wissen' : ''}`, disabled: !!why, fn: () => {
        this.closeMenu(); h.wgParty(e.id === 'karaoke' || e.id === 'spiele' ? 'dance1' : 'laugh'); sfx('cheer');
        setTimeout(() => { this.pass(e.min); const fact = doEvening(s, e); pcEvents.emit('wgAbend', { id: e.id, with: mates(s) }); this.save.write(); this.city.refreshHud();
          this.dialog.say([{ who: e.icon + ' ' + e.name, color: '#ff9ad5', text: e.text }, ...(fact ? [{ who: '💡 Wusstest du?', color: '#5ce1ff', text: fact }] : [])], () => this.touch.show(true)); }, 1600);
      } }; }),
      { icon: '←', label: 'Zurück', fn: back }], back);
  }
  private wgAction(id: string) {
    const s = this.save.data, m = mateInfo(id); if (!m) return;
    const back = () => { this.closeMenu(); this.touch.show(true); }, h = this.home!;
    const say = (anim: 'laugh' | 'talk' | 'cheer' | 'dance1' | 'clap', fx: Parameters<typeof change>[1], msg: string) => () => { back(); h.wgPlay(id, anim); setTimeout(() => { this.pass(20); change(s, fx); if (s.rel[id]) s.rel[id].f = Math.min(100, s.rel[id].f + 2); this.save.write(); this.city.refreshHud(); toast(msg); }, 1100); };
    const lines = [`Na, Mitbewohni? Wer kocht heute? Ich hab gestern!`, 'Ich hab den Kühlschrank beschriftet. Nur Spaß. Oder?', 'Schön, dass wir hier zusammen wohnen. Echt.', 'Hast du meinen Glitzer-Föhn gesehen?'];
    this.touch.show(false);
    this.openMenu(`<div class="col"><div class="panel"><h3>🏠 ${esc(m.name)}</h3><p>${lines[(s.day + id.length) % lines.length]}</p><div class="slot"></div></div></div>`, [
      { icon: '🎉', label: 'Gemeinsamer Abend', sub: s.flags.wgAbend === s.day ? 'heute schon' : 'Spiele, Kochen, Film, Erzählabend, Karaoke', fn: () => this.eveningMenu(back) },
      { icon: '💬', label: 'Quatschen', sub: '20 Minuten · +10 Kontakte', fn: say('talk', { social: 10, fun: 4 }, `${m.name} erzählt den neuesten Klatsch aus der Stadt.`) },
      { icon: '💃', label: 'Durchs Wohnzimmer tanzen', sub: '20 Minuten · +14 Spaß', fn: say('dance1', { fun: 14, energy: -4 }, 'Küchendisco! 🪩') },
      { icon: '←', label: 'Zurück', fn: back }], back);
  }
  private petAction() {
    const s = this.save.data, pt = pet(s); if (!pt) return;
    const back = () => { this.closeMenu(); this.touch.show(true); };
    const go = (a: Parameters<typeof petAct>[1], msg: string, min: number) => () => { const e = petAct(s, a); if (e) { sfx('miss'); toast(e); return; } back(); sfx(a === 'feed' ? 'pour' : 'giggle'); this.pass(min); this.save.write(); this.city.refreshHud(); toast(msg); };
    this.touch.show(false);
    this.openMenu(`<div class="col"><div class="panel"><h3>${pt.kind.icon} ${esc(pt.name)}</h3><p>${petHungry(s) ? `${esc(pt.name)} guckt dich an, dann den leeren Napf, dann wieder dich.` : `${esc(pt.name)} ${pt.kind.id === 'hund' ? 'wedelt so sehr, dass der ganze Hintern mitwackelt.' : 'schnurrt und tut so, als wäre es dir egal.'}`}</p><div class="slot"></div></div></div>`, [
      { icon: '🍖', label: 'Füttern', sub: petHungry(s) ? '3 € · einmal am Tag' : 'satt', disabled: !petHungry(s), fn: go('feed', `${pt.name} frisst alles in zehn Sekunden.`, 5) },
      { icon: '🤲', label: 'Streicheln', sub: s.flags.pet_pet === s.day ? 'heute schon' : '+10 Spaß · +6 Kontakte', fn: go('pet', `${pt.name} ${pt.kind.id === 'hund' ? 'rollt sich auf den Rücken.' : 'schnurrt wie ein kleiner Motor.'} 💕`, 10) },
      { icon: '🧶', label: 'Spielen', sub: s.flags.pet_play === s.day ? 'heute schon' : '+16 Spaß', fn: go('play', pt.kind.id === 'hund' ? 'Ball, Ball, Ball, Ball! 🎾' : 'Die Wollmaus ist besiegt. 🧶', 20) },
      ...(pt.kind.id === 'hund' ? [{ icon: '🦮', label: 'Gassi gehen', sub: s.flags.pet_walk === s.day ? 'heute schon' : '40 Minuten · +14 Spaß · +12 Kontakte (andere Hundeleute!)', fn: () => { const e = petAct(s, 'walk'); if (e) { sfx('miss'); toast(e); return; } back(); this.fade(() => { this.pass(40); this.save.write(); this.city.refreshHud(); toast(`Eine Runde durch den Regenbogenpark. ${pt.name} hat drei neue Freunde. 🦮`); }); } }] : []),
      { icon: '←', label: 'Zurück', fn: back }], back);
  }
  /** Zu Hause mit Partner*in oder Kind */
  private familyAction(id: 'spouse' | 'kid') {
    const s = this.save.data, h = this.home!, back = () => { this.closeMenu(); this.touch.show(true); };
    const sp = spouse(s), k = kid(s);
    const act = (min: number, fx: Parameters<typeof change>[1], msg: string, who: 'spouse' | 'kid', anim: 'dance1' | 'laugh' | 'clap' | 'cheer' | 'talk') => () => {
      back(); h.familyPlay(who, anim); sfx(who === 'kid' ? 'giggle' : 'kiss');
      setTimeout(() => { this.pass(min); change(s, fx); this.save.write(); this.city.refreshHud(); toast(msg); }, 1200);
    };
    this.touch.show(false);
    if (id === 'spouse' && sp) {
      this.openMenu(`<div class="col"><div class="panel"><h3>💞 ${esc(sp.name)}</h3><p>${['Na, Schatz? Wie war dein Tag in der Stadt?', 'Ich hab dich vermisst. Bleib noch ein bisschen.', 'Erzähl mal – was hast du heute wieder angestellt? 😏'][s.day % 3]}</p><div class="slot"></div></div></div>`, [
        { icon: '🫂', label: 'Kuscheln', sub: '30 Minuten · +25 Kontakte · +10 Spaß', fn: act(30, { social: 25, fun: 10 }, `${sp.name} kuschelt sich an dich. 💞`, 'spouse', 'laugh') },
        { icon: '💃', label: 'Zusammen tanzen', sub: '20 Minuten · +20 Spaß', fn: act(20, { fun: 20, energy: -5 }, 'Wohnzimmer-Disco! 🪩', 'spouse', 'dance1') },
        { icon: '💬', label: 'Über den Tag reden', sub: '15 Minuten · +12 Kontakte', fn: act(15, { social: 12 }, `${sp.name}: „Ich bin stolz auf dich.“`, 'spouse', 'talk') },
        { icon: '🎉', label: 'Gemeinsamer Abend', sub: s.flags.wgAbend === s.day ? 'heute schon' : 'Spiele, Kochen, Film, Erzählabend, Karaoke', fn: () => this.eveningMenu(back) },
        ...(s.settings.adult ? [{ icon: '🕯️', label: 'Romantische Nacht (18+)', sub: (s.inv.condom || 0) < 1 && !s.health.prep ? 'Kondome oder PrEP nötig (Späti, Checkpoint)' : hour(s) >= 20 || hour(s) < 3 ? 'Kerzen, Musik, nur ihr zwei' : 'ab 20 Uhr', disabled: !((hour(s) >= 20 || hour(s) < 3) && ((s.inv.condom || 0) > 0 || s.health.prep)), fn: () => { back(); this.spouseNight(); } }] : []),
        { icon: '←', label: 'Zurück', fn: back }], back);
      return;
    }
    if (id === 'kid' && k) {
      this.openMenu(`<div class="col"><div class="panel"><h3>${k.g === 'f' ? '👧' : '👦'} ${esc(k.name)}</h3><p>${['Spielst du mit mir? Bitte, bitte!', 'Guck mal, ich hab ein Regenbogen-Bild gemalt!', 'Liest du mir was vor? Das mit dem Leuchtturm!'][s.day % 3]}</p><div class="slot"></div></div></div>`, [
        { icon: '🧸', label: 'Spielen', sub: '30 Minuten · +20 Spaß · −8 Energie', fn: act(30, { fun: 20, energy: -8 }, `${k.name} quietscht vor Freude. 🧸`, 'kid', 'dance1') },
        { icon: '📖', label: 'Vorlesen', sub: '20 Minuten · +12 Kontakte · +8 Spaß', fn: act(20, { social: 12, fun: 8 }, `${k.name} schläft fast ein. „Noch ein Kapitel …“`, 'kid', 'clap') },
        { icon: '🎨', label: 'Zusammen malen', sub: '30 Minuten · +15 Spaß · +1 Ruf beim ersten Mal am Tag', fn: () => { if (s.flags.kidArt !== s.day) { s.flags.kidArt = s.day; s.rep++; } act(30, { fun: 15 }, 'Ein Regenbogen mit sieben Farben. Kommt an den Kühlschrank! 🌈', 'kid', 'cheer')(); } },
        { icon: '←', label: 'Zurück', fn: back }], back);
    }
  }

  /* ---------- Familie: Antrag, Hochzeit, Adoption ---------- */
  private proposal(id: string) {
    const s = this.save.data, p = profile(id)!, close = () => { this.closeMenu(); this.touch.show(true); };
    const W = (text: string) => ({ who: p.name, color: p.color, text });
    close();
    const why = propose(s, id);
    if (why) { toast(why); sfx('miss'); return; }
    sfx('heart'); this.save.write();
    this.dialog.say([{ who: s.name, color: '#ff3fb0', text: `${p.name} … ich will jeden Morgen neben dir aufwachen. Willst du mich heiraten? 💍` },
      W('*hält sich die Hand vor den Mund* JA! Ja, ja, tausendmal ja! 🥹🌈'),
      W('Lass uns im Regenbogenhaus feiern. Mit allen. Mit Konfetti. Mit Drag-Show!')], () => {
      sfx('applause'); post(s, p.name, 'Wir sind verlobt!!! 💍🌈'); this.hud.banner('💍 Verlobt!', `${p.name} hat Ja gesagt. Die Hochzeit feiert ihr im Regenbogenhaus.`, 'good', 4200);
      s.pin = 'center'; this.save.write();
    });
  }
  private wedding() {
    const s = this.save.data, p = fiance(s)!;
    const why = wed(s);
    if (why) { toast(why); sfx('miss'); return; }
    this.fade(() => {
      this.pass(180); change(s, { social: 40, fun: 40 }); this.save.write(); this.city.refreshHud();
      sfx('applause');
      this.dialog.say([
        { who: 'Standesbeamtin Mira', color: '#ff9bd2', text: `Liebe Gäste, wir sind heute im Regenbogenhaus, weil Liebe hier immer ein Zuhause hatte. ${s.name} und ${p.name}, wollt ihr einander lieben, ehren und ab und zu den Abwasch machen?` },
        { who: `${s.name} & ${p.name}`, color: '#ffd23b', text: 'Ja, wir wollen! 💍💍' },
        { who: 'Standesbeamtin Mira', color: '#ff9bd2', text: 'Dann erkläre ich euch kraft der Ehe für alle zu Eheleuten. Ihr dürft euch küssen! 💋' },
        { who: 'Lady Luma', color: '#ff3fb0', text: 'Und jetzt alle auf die Tanzfläche, Darlings! Die Torte hat sieben Schichten – eine für jede Farbe und eine extra für Glitzer.' },
      ], () => {
        post(s, p.name, `Verheiratet! Danke an alle, die mit uns gefeiert haben. 💒✨`);
        this.chapterCard('💒 Hochzeit', `${s.name} & ${p.name}`, `Ihr seid verheiratet! ${p.name} zieht bei dir ein und wartet ab jetzt zu Hause. Im Regenbogenhaus könnt ihr eine Adoption beantragen.`);
        this.home?.syncFamily();
      });
    });
  }
  private adoption(back: () => void) {
    const s = this.save.data;
    if (s.flags.kid) { back(); return; }
    const pick = (g: 'm' | 'f') => {
      const names = KID_NAMES[g];
      this.openMenu(`<div class="col"><div class="panel"><h3>👶 Wie soll euer Kind heißen?</h3><p>Das Jugendamt macht einen Hausbesuch, dann kommt euer Kind in ein paar Tagen zu euch.</p><div class="slot"></div></div></div>`,
        [...names.map((n) => ({ icon: g === 'f' ? '👧' : '👦', label: n, fn: () => { const why = applyAdopt(s, g, n); back(); if (why) { toast(why); sfx('miss'); return; } this.save.write(); this.city.refreshHud(); sfx('heart'); this.dialog.say([{ who: 'Jugendamt Rainbow City', color: '#3ee69a', text: `Antrag angenommen! Zwei liebevolle Eltern sind genau das, was ${n} braucht. Wir melden uns in drei Tagen.` }]); } })),
          { icon: '←', label: 'Zurück', fn: back }], back);
    };
    this.openMenu(`<div class="col"><div class="panel"><h3>👶 Adoption</h3><p>Ehe für alle heißt auch Adoption für alle. Erzählt uns, wen ihr in eure Familie aufnehmen möchtet.</p><div class="slot"></div></div></div>`, [
      { icon: '👦', label: 'Einen Jungen', fn: () => pick('m') },
      { icon: '👧', label: 'Ein Mädchen', fn: () => pick('f') },
      { icon: '←', label: 'Zurück', fn: back }], back);
  }

  /* ---------- Jobs ---------- */
  runShift(jobId: string) {
    const s = this.save.data, j = JOBS.find((x) => x.id === jobId)!;
    const why = blocked(s, j);
    this.closeMenu(); this.touch.show(true);
    if (why) { toast(why); sfx('miss'); return; }
    let pts = 0;
    const sc = situations(s, j);
    this.dialog.say(sc.map(([q, opts], i) => ({ who: `${j.place} · ${i + 1}/3`, color: '#7b5cff', text: q,
      choices: opts.map(([label, p]) => ({ label, fn: () => { pts += p; sfx(p === 2 ? 'coin' : p === 1 ? 'move' : 'miss'); } })) })), () => {
      this.fade(() => {
        this.pass(240);
        const r = finish(s, j, pts);
        this.done(track(s, 'work'));
        toast(`Schicht als ${j.name} beendet: +${r.pay} € (${pts}/6 Punkte)`);
        if (r.promoted) { toast(`🎉 Befördert: ${r.promoted}!`); sfx('win'); }
        sfx('coin'); this.save.write(); this.city.refreshHud();
      });
    });
  }

  /* ---------- Handy ---------- */
  phone(app = '') {
    if (this.dialog.open) return;
    if (!app) sfx('phone');
    const s = this.save.data;
    this.touch.show(false);
    const close = () => { this.closeMenu(); this.touch.show(true); };
    const home = () => this.phone();
    const frame = (title: string, body: string) => `<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>${title}</b><span>${moodIcon(mood(s))} ${s.money} €</span></div>${body}<div class="slot"></div></div>`;
    if (!app) {
      const d = dailyState(s), open = d.filter((x) => !x.done).length;
      this.openMenu(frame('Handy', ''), [
        { icon: '❤️', label: 'Status', sub: `Stimmung: ${moodName(mood(s))}`, fn: () => this.phone('status') },
        { icon: '🎯', label: 'Ziele', sub: open ? `${open} Tagesziele offen` : 'Alle Tagesziele erledigt', fn: () => this.phone('goals') },
        { icon: '🗺️', label: 'Karte & Tram', sub: 'Orte, Ziel markieren, hinfahren', fn: () => this.phone('map') },
        { icon: '💼', label: 'Jobbörse', sub: meinBeruf(s) ? `Hauptberuf: ${meinBeruf(s)!.icon} ${meinBeruf(s)!.name}` : `${karrieren(s).length} Berufe · Stellenanzeigen`, fn: () => this.phone('jobs') },
        { icon: '📞', label: 'Aufträge', sub: this.city.gig ? `Läuft: ${this.city.gig.g.title}` : `${openGigs(s).length} Leute brauchen Hilfe · ${Number(s.flags.gigs) || 0} erledigt`, fn: () => this.phone('gigs') },
        { icon: SKY[skyAt(s.day, s.time)].icon, label: 'Wetter und Termine', sub: `${SKY[skyAt(s.day, s.time)].name}${(s.day - 1) % 7 === 5 ? ' · heute CSD-Parade, 12–18 Uhr' : ' · CSD-Parade am Samstag'}`, fn: () => this.phone('wetter') },
        { icon: '🎉', label: 'Live-Events', sub: (() => { const l = lineup(), n = l.filter((e) => !doneThisWeek(s, e.kind)).length; return n ? `Diese Woche: ${l.map((e) => e.icon).join(' ')} · noch ${n} offen` : `👑 Wochenpass voll · neue Termine in ${daysLeft()} ${daysLeft() === 1 ? 'Tag' : 'Tagen'}`; })(), fn: () => this.phone('live') },
        { icon: '🏙️', label: 'Imperium', sub: owned(s).length ? `${owned(s).length} Geschäfte · +${income(s)} € am Tag · Platz ${myRank(s)} im Mogul-Ranking` : 'Läden, Bars, Clubs und Hotels übernehmen', fn: () => this.phone('empire') },
        ...(s.flags.crewCall ? [{ icon: '✊', label: 'Crew', sub: `Die Lichterkette · ${crewOf(s).length} Leute${s.flags.crewWatch ? ` · ${VIERTEL.filter((v) => schutz(s, v.id)).length}/${VIERTEL.length} Viertel` : ''}`, fn: () => this.phone('crew') }] : []),
        { icon: '👨‍👩‍👧', label: 'Familie', sub: famSub(s), fn: () => this.phone('family') },
        { icon: '👥', label: 'Kontakte', sub: `${Object.keys(s.rel).length} Leute kennengelernt`, fn: () => this.phone('contacts') },
        { icon: '🫂', label: 'Bekannte und ihre Geschichten', sub: (() => { const k = known(s); return k.length ? `${k.length} Leute · ${k.filter((x) => x.m.done).length} Geschichten zu Ende gehört` : 'Sprich Leute an, jede Person hat eine Geschichte'; })(), fn: () => this.phone('known') },
        { icon: '💘', label: 'Rainbow Match', sub: `Dating · ${PROFILES.filter((p) => s.dates[p.id]).length} Matches`, fn: () => this.phone('dating') },
        { icon: '📻', label: 'Pride FM 88,8', sub: s.flags.radioShowDay === s.day ? 'Deine Sendung lief heute' : 'Eigene Sendung „Rainbow Talk“ moderieren', fn: () => this.phone('fm') },
        { icon: '📸', label: 'Glitzergram', sub: `${fmtNum(followers(s))} Follower · Fotomodus, Likes, Kooperationen`, fn: () => this.phone('gram') },
        { icon: '📣', label: 'Feed', sub: 'Was in der Szene los ist', fn: () => this.phone('feed') },
        ...(s.settings.adult ? [{ icon: '💋', label: 'Fanshop & Cam', sub: `${fans(s)} Fans · Getragenes verkaufen, live gehen`, fn: () => this.phone('fans') }] : []),
        { icon: '🩺', label: 'Gesundheit', sub: testDue(s) ? '⚠️ Test fällig!' : s.health.prep ? 'PrEP aktiv' : 'Tests, PrEP, U=U', fn: () => this.phone('health') },
        { icon: '📚', label: 'Glossar', sub: 'Begriffe aus der Szene', fn: () => this.phone('glossary') },
        { icon: '🧠', label: 'Wissen', sub: quizDoneToday(s) ? 'Geschichte, Persönlichkeiten, Flaggen, Rechte' : '🎯 Heute neues Quiz mit Hilde · Glitzer zu gewinnen', fn: () => this.phone('wissen') },
        { icon: '📖', label: 'Ich bin das Licht', sub: 'Der Roman von RicoReWi – komplett lesen', fn: () => this.book() },
        { icon: '🗼', label: 'Leuchtfeuer', sub: 'Der Jugendroman von RicoReWi – komplett lesen', fn: () => this.book(-1, 'leuchtfeuer') },
        { icon: '←', label: 'Handy weglegen', fn: close },
      ], close, 'phone');
    } else if (app === 'status') {
      const bars = NEEDS.map((n) => `<div class="nd"><span>${n.icon} ${n.name}</span><i><b style="width:${Math.round(s.needs[n.k])}%;background:${s.needs[n.k] < 25 ? '#ff5d6c' : s.needs[n.k] < 50 ? '#ffc53d' : '#3ee69a'}"></b></i><small>${n.tip}</small></div>`).join('');
      this.openMenu(frame('Status', `<div class="pbody"><p><b>${moodIcon(mood(s))} ${moodName(mood(s))}</b> · ${weekday(s)}, Tag ${s.day} · ${clock(s)} Uhr</p>${bars}<p>💶 ${s.money} € · 🌈 ${s.rep} Ruf · ✨ ${s.glitter} Glitzer · 🥕 ${s.food} Portionen</p><p>${muskelLine(this)}</p></div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'goals') {
      const g = goal(s), d = dailyState(s), st = s.goals.filter((x) => x.startsWith('sticker')).length;
      this.openMenu(frame('Ziele', `<div class="pbody"><p><b>⭐ ${g.title}</b><br>${g.sub || ''}</p><h4>Heute</h4>${d.map((x) => `<p>${x.done ? '✅' : '⬜'} ${x.text} (${x.have}/${x.n}) · +${x.glitter} ✨</p>`).join('')}<h4>Sammeln</h4><p>🌈 Pride-Sticker ${st}/8 · 🪩 Tanz-Rekord ${s.best.dance || 0}</p></div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'fans') {
      // Fanshop & Cam (fanshop.ts, 18+): Getragenes verkaufen, Cam-Show zu Hause
      const again = () => this.phone('fans');
      this.openMenu(frame('💋 Fanshop & Cam', `<div class="pbody"><p><b>${fans(s)} Fans</b> · ${Number(s.flags.fanSold) || 0} Pakete verschickt · ${Number(s.flags.camN) || 0} Streams</p><p><small>Selbstbestimmt und anonym: Du entscheidest, was du verkaufst und zeigst. Pakete gehen diskret raus, bezahlt wird vorab. Mehr Fans = bessere Preise.</small></p></div>`), [
        { icon: '📷', label: 'Cam-Show starten', sub: s.flags.camDay === s.day ? 'heute schon live gewesen' : s.inside ? 'jetzt live vor dem Laptop' : 'nur zu Hause', disabled: s.flags.camDay === s.day, fn: () => { this.closeMenu(); camShow(this); } },
        ...fanItems(s).map((it) => ({ icon: it.icon, label: `${it.name} · ${it.price} €`, sub: it.can ? it.sub : it.why || '', disabled: !it.can, fn: () => { const r = sellFan(s, it.id); if (!r) return; sfx('coin'); toast(`📦 Verkauft: ${r.it.name} für ${r.it.price} € · +${r.add} Fans`); this.save.write(); this.city.refreshHud(); again(); } })),
        { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'jobs') {
      // Jobbörse (beruf.ts): alle Karrieren an einem Ort, Hauptberuf annehmen oder wechseln (+20 % Lohn)
      const mine = meinBeruf(s), ad = ANZEIGEN[s.day % ANZEIGEN.length];
      this.openMenu(frame('Jobbörse', `<div class="pbody"><p>${mine ? `⭐ <b>Hauptberuf: ${mine.icon} ${mine.name}</b> seit Tag ${s.flags.berufSeit || s.day} · +20 % Lohn` : 'Noch kein Hauptberuf. Such dir einen aus – er bringt +20 % Lohn. Nebenbei kannst du alles andere trotzdem machen.'}</p><p><small>📌 Anzeige des Tages: ${ad}</small></p></div>`),
        [...karrieren(s).map((k) => ({ icon: k.icon, label: `${k.name}${mine?.id === k.id ? ' ⭐' : ''}`, sub: `${k.place} · ${stand(s, k)}`, fn: () => this.phone('job_' + k.id) })),
          { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app.startsWith('job_')) {
      const k = karriere(app.slice(4)); if (!k) { home(); return; }
      const back = () => this.phone('jobs'), mine = meinBeruf(s)?.id === k.id;
      const go = k.app ? { icon: '📱', label: 'App öffnen', sub: k.place, fn: () => this.phone(k.app!) } : { icon: '📍', label: 'Hingehen', sub: `${k.place} auf der Karte markieren`, fn: () => { s.pin = k.poi!; toast(`${k.place} auf der Karte markiert.`); close(); } };
      this.openMenu(frame(`${k.icon} ${k.name}`, `<div class="pbody"><p>${k.text}</p><p><small>${stand(s, k)}</small></p></div>`), [
        mine ? { icon: '✋', label: 'Kündigen', sub: 'ohne Hauptberuf weiter', fn: () => { annehmen(s, null); sfx('back'); toast(`Du hast als ${k.name} gekündigt.`); this.save.write(); back(); } }
          : { icon: '⭐', label: 'Als Hauptberuf annehmen', sub: meinBeruf(s) ? `statt ${meinBeruf(s)!.name} · +20 % Lohn` : '+20 % Lohn', fn: () => { annehmen(s, k.id); sfx('win'); pcEvents.emit('beruf', { id: k.id, name: k.name }); post(s, 'Du', `Neuer Job: ${k.name} ${k.icon}`); this.hud.banner(`${k.icon} Neuer Hauptberuf: ${k.name}`, `${k.place} · +20 % Lohn`, 'good', 4000); this.save.write(); back(); } },
        go, { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
    } else if (app === 'known') {
      const list = known(s);
      this.openMenu(frame('🫂 Bekannte', `<div class="pbody"><p>Alle, mit denen du geredet hast, von der Straße und aus der Szene. Jede Person hat eine eigene Geschichte, ein Teil pro Tag.</p></div>`),
        [...list.map((x) => ({ icon: x.story.icon, label: x.name, sub: `${moodWord(x.m.mood)} · ${x.m.met}× getroffen · ${x.m.done ? '✅ ' + x.story.title : `${x.story.title} ${Math.min(4, x.m.ch)}/4`}`,
          fn: () => { const who = { who: `${x.story.icon} ${x.name}`, color: '#ffb347' }; close();
            this.dialog.say([...(heard(x).length ? heard(x).map((t) => ({ ...who, text: t })) : [{ ...who, text: 'Ihr habt euch erst kurz unterhalten. Sprich die Person wieder an, dann erzählt sie mehr.' }]),
              ...(x.m.done ? [{ who: 'Du', color: '#ff4fa3', text: `Dein Rat: ${x.m.done}` }] : [])]); } })),
          { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'contacts') {
      const met = NPCS.filter((n) => s.rel[n.id]);
      this.openMenu(frame('Kontakte', `<div class="pbody">${met.length ? met.map((n) => { const f = Number(s.rel[n.id].f) || 0; return `<p><b style="color:${n.color}">●</b> <b>${n.name}</b> <small>(${n.pron})${NPC_BERUF[n.id] ? ' · ' + NPC_BERUF[n.id].join(' ') : ''}</small><br>${'❤️'.repeat(Math.min(5, Math.ceil(f / 20)))}${'🤍'.repeat(5 - Math.min(5, Math.ceil(f / 20)))} ${bond(f)}</p>`; }).join('') : '<p>Noch niemand. Sprich Leute in der Stadt an!</p>'}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'family') {
      const sp = spouse(s), fi = fiance(s), k = kid(s);
      const w = this.city.combat?.wanted;
      this.openMenu(frame('Familie', `<div class="pbody">${sp ? `<p>💍 Verheiratet mit <b>${esc(sp.name)}</b> (${sp.pron}) seit Tag ${s.flags.wedDay}.</p>` : fi ? `<p>💍 Verlobt mit <b>${esc(fi.name)}</b>. Die Hochzeit feiert ihr im Regenbogenhaus (${WEDDING} €).</p>` : '<p>💘 Noch Single oder frisch verliebt. Wer bei Rainbow Match „Zusammen“ ist, kann mit einem Ring aus der Boutique einen Antrag machen.</p>'}
        ${k ? `<p>${k.g === 'f' ? '👧' : '👦'} <b>${esc(k.name)}</b> wohnt seit Tag ${k.day} bei euch. Spielen und Vorlesen zu Hause macht alle glücklich.</p>` : s.flags.adopt ? `<p>📝 Adoptionsantrag läuft seit Tag ${s.flags.adopt}. Das Jugendamt meldet sich bald.</p>` : sp ? `<p>👶 Ihr könnt im Regenbogenhaus eine Adoption beantragen (${ADOPT} €).</p>` : ''}
        <h4>Gesetze von Rainbow City</h4><p>⭐ Fahndung: ${w?.stars ? '★'.repeat(w.stars) + ' – lauf der Streife davon oder zahl das Bußgeld auf der Wache.' : 'keine. Bleib brav – oder hab Spaß und renn schnell. 😉'}</p></div>`),
        [{ icon: '🏠', label: 'Wahlfamilie & WG', sub: mates(s).length ? `${mates(s).map((id) => mateInfo(id)!.name).join(' und ')} wohnen bei dir` : 'Freund*innen oder dein Match einziehen lassen', fn: () => this.phone('wg') },
          { icon: pet(s)?.kind.icon || '🐾', label: pet(s) ? pet(s)!.name : 'Tierheim Pfötchenglück', sub: pet(s) ? `${pet(s)!.kind.name}${petHungry(s) ? ' · hat Hunger!' : ' · zu Hause'}` : 'Hund oder Katze adoptieren', fn: () => this.phone('pet') },
          { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'wg') {
      const back = () => this.phone('family'), list = mates(s), cand = candidates(s);
      this.openMenu(frame('🏠 Wahlfamilie', `<div class="pbody"><p>Wahlfamilie sind die Menschen, die du dir selbst aussuchst. Bis zu ${MAX_MATES} können bei dir einziehen. Abends ab 18 Uhr sind sie zu Hause, dann könnt ihr gemeinsame Abende verbringen.</p>${list.length ? '' : '<p><small>Gute Freund*innen (ab „befreundet“) und feste Partner*innen können einziehen.</small></p>'}</div>`), [
        ...list.map((id) => { const m = mateInfo(id)!; return { icon: '🏠', label: `${m.name} ausziehen lassen`, sub: `wohnt seit Tag ${s.flags['wg_' + id]} bei dir`, fn: () => { moveOut(s, id); pcEvents.emit('mitbewohner', { id, name: m.name, in: false }); toast(`${m.name} zieht aus. Ihr bleibt Freund*innen. 💛`); this.save.write(); void this.home?.syncWg(); this.phone('wg'); } }; }),
        ...cand.map(({ m, why }) => ({ icon: m.match ? '💞' : '🤝', label: `${m.name} einziehen lassen`, sub: why || (m.match ? 'zusammenziehen' : 'neues WG-Zimmer'), disabled: !!why, fn: () => { const e = moveIn(s, m.id); if (e) { sfx('miss'); toast(e); return; } sfx('win'); pcEvents.emit('mitbewohner', { id: m.id, name: m.name, in: true }); this.hud.banner(`🏠 ${m.name} zieht bei dir ein`, 'Ab 18 Uhr seid ihr zusammen zu Hause. Gemeinsame Abende bringen Freundschaft.', 'good', 4600); this.save.write(); void this.home?.syncWg(); this.phone('wg'); } })),
        { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
    } else if (app === 'pet') {
      const back = () => this.phone('family'), pt = pet(s);
      if (pt) {
        this.openMenu(frame(`${pt.kind.icon} ${esc(pt.name)}`, `<div class="pbody"><p>${pt.kind.text}</p><p>${petHungry(s) ? '🍖 <b>' + esc(pt.name) + ' hat Hunger.</b> Zu Hause füttern (3 €).' : '💚 Satt und zufrieden.'}</p><p><small>Zu Hause läuft ${esc(pt.name)} dir nach. Geh hin und drück Benutzen.</small></p></div>`), [{ icon: '←', label: 'Zurück', fn: back }], back, 'phone');
      } else {
        this.openMenu(frame('🐾 Tierheim Pfötchenglück', `<div class="pbody"><p>Hier warten Hunde und Katzen auf ein Zuhause.</p>${SHELTER_INFO.map((x) => `<p><small>💡 ${x}</small></p>`).join('')}</div>`), [
          ...PETS.flatMap((k) => k.names.slice(0, 3).map((n, i) => ({ icon: k.icon, label: `${n} (${k.name})`, sub: `${k.fee} € Schutzgebühr · ${['verspielt', 'verschmust', 'neugierig'][i]}`, fn: () => { const e = adoptPet(s, k.id, n); if (e) { sfx('miss'); toast(e); return; } s.flags.petColor = i; sfx('win'); pcEvents.emit('haustier', { kind: k.id, name: n }); this.hud.banner(`${k.icon} ${n} zieht bei dir ein!`, 'Füttern, streicheln, spielen' + (k.id === 'hund' ? ', Gassi gehen.' : '.'), 'good', 4600); this.save.write(); void this.home?.syncWg(); this.phone('pet'); } }))),
          { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
      }
    } else if (app === 'feed') {
      this.openMenu(frame('Feed', `<div class="pbody">${feed(s).map((p) => `<p class="post"><b>@${esc(p.who)}</b> <small>Tag ${p.d}</small><br>${esc(p.t)}</p>`).join('')}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'health') {
      const due = testDue(s);
      this.openMenu(frame('Gesundheit', `<div class="pbody"><p>${due ? '⚠️ <b>Dein Test ist fällig.</b> Geh im Checkpoint vorbei.' : '💚 Alles im grünen Bereich.'}</p><p>🧪 Letzter Test: ${s.health.test ? 'Tag ' + s.health.test : 'noch keiner'}<br>💊 PrEP: ${s.health.prep ? `aktiv, Test alle ${TEST_EVERY} Tage` : 'nicht aktiv'}<br>🎈 Kondome: ${s.inv.condom || 0} · 💧 Gleitgel: ${s.inv.lube || 0}</p>${HEALTH_INFO.map(([t, x]) => `<h4>${t}</h4><p>${x}</p>`).join('')}</div>`),
        [{ icon: '📍', label: 'Checkpoint markieren', fn: () => { s.pin = 'checkpoint'; toast('Checkpoint auf der Karte markiert.'); close(); } }, { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'gigs') {
      const run = this.city.gig, open = openGigs(s);
      this.openMenu(frame('Aufträge', `<div class="pbody"><p>Leute aus der Stadt brauchen dich. Nimm an, folg der gelben Lichtsäule und dem Radar und schaff es in der Zeit.</p>${run ? `<p>⏱ Läuft: <b>${run.g.title}</b> für ${run.g.who}</p>` : ''}</div>`), [
        ...(run ? [{ icon: '✖', label: 'Auftrag abbrechen', sub: run.g.title, fn: () => { this.city.gig?.g.failed?.(); this.city.gig = null; this.city.taxi = -1; this.city.parcel = -1; this.hud.gig(null); toast('Auftrag abgebrochen.'); close(); } }] : []),
        { icon: '🚕', label: 'Regenbogen-Taxi', sub: this.city.driving ? `Fahrgäste fahren, Trinkgeld je Serie · Rekord ${Number(s.flags.taxiBest) || 0} Fahrten` : 'Erst in ein Auto steigen', disabled: !!run || !this.city.driving, fn: () => { close(); this.city.startTaxi(); } },
        { icon: '📦', label: 'Paketdienst Eilbote', sub: this.city.driving ? `Pakete ab der Garage in der Hochstadt · mit Ladefläche +25 % · Rekord ${Number(s.flags.parcelBest) || 0}` : 'Erst in ein Auto steigen', disabled: !!run || !this.city.driving, fn: () => { close(); this.city.startParcel(); } },
        { icon: '🏁', label: 'Straßenrennen', sub: `${RACES.filter((r) => bestTime(s, r.id)).length}/${RACES.length} gefahren · im Auto an einer 🏁 anhalten`, fn: () => { close(); this.dialog.say([{ who: '🏁 Rennleitung', color: '#ffd23b', text: RACES.map((r) => { const b = bestTime(s, r.id), m = b ? medalFor(r, b) : -1; return `${r.name}: ${b ? b.toFixed(1) + ' s' + (m >= 0 ? ' ' + MEDALS[m] : '') : 'noch nicht gefahren'}`; }).join(' · ') + '. Die Startflaggen siehst du im Auto als 🏁: Altstadtring an der Querstraße beim Plaza, Brückensprint vor der Regenbogenbrücke, Grand Prix unter der Hochbahn, Stadtmarathon an der Kaistraße.' }]); } },
        ...GIGS.map((g) => ({ icon: g.night ? '🌙' : g.car ? '🚗' : '🚶', label: `${g.title} · ${g.who}`, sub: !open.includes(g) ? 'nur nachts (21–5 Uhr)' : `${g.pay} € · +${g.rep} Ruf · ${fmtTime(g.time)} Min. · ${g.steps.length} Stationen${s.flags['gig_' + g.id] === s.day ? ' · heute erledigt' : ''}`, disabled: !!run || !open.includes(g), fn: () => { close(); this.city.startGig(g); } })),
        { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'crew') {
      const c = crewApp(s), run = this.city.gig;
      this.openMenu(frame('Die Lichterkette', c.html), [
        ...(c.canPatrol ? VIERTEL.map((v) => ({ icon: v.icon, label: `Streife: ${v.name}`, sub: run ? `Läuft gerade: ${run.g.title}` : `Schutz ${'★'.repeat(schutz(s, v.id))}${'☆'.repeat(3 - schutz(s, v.id))} · 60 € · mit der Crew`, disabled: !!run || this.where !== 'city', fn: () => { close(); patrol(this.city.ctx(), v.id); } })) : []),
        { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'empire') {
      empireMenu(this, frame, home);
    } else if (app === 'gram') {
      gramMenu(this, frame, home);
    } else if (app.startsWith('biz_')) {
      // Geschäft führen: Personal, Ausbauten, Veranstaltung, Probleme (Regeln in manage.ts)
      const b = BUSINESSES.find((x) => 'biz_' + x.id === app)!, sp = SPECIAL[b.id], d = bizDaily(s, b), st = staffOf(s, b.id), pop = popOf(s, b.id), iss = issueOf(s, b.id), wait = eventReady(s, b.id);
      const again = () => this.phone(app), back = () => this.phone('empire');
      const act = (why: string | null, ok: string) => { if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(ok); this.save.write(); this.city.refreshHud(); again(); };
      const bar = (v: number, c: string) => `<span style="display:inline-block;width:120px;height:8px;border-radius:4px;background:#ffffff22;vertical-align:middle"><span style="display:block;width:${v}%;height:8px;border-radius:4px;background:${c}"></span></span>`;
      this.openMenu(frame(b.name, `<div class="pbody"><p>${b.icon} <b>${d.net} € Gewinn am Tag</b><br><small>Umsatz ${d.gross} € · Lohn ${d.wage} €</small></p><p>💖 Beliebtheit ${bar(pop, pop >= 60 ? '#3ee69a' : '#ffb347')} ${pop}<br>👥 Personal: <b>${STAFF[st].name}</b><br><small>${STAFF[st].text}</small></p>${iss ? `<p>⚠️ <b>${iss.text}</b><br><small>Bis das geklärt ist, kommt nur der halbe Umsatz.</small></p>` : ''}</div>`), [
        ...(isClub(b.id) ? [{ icon: '📋', label: 'Club: DJ, Preise, Tür, Deko', sub: 'Einstellungen · Clubnacht abends im Club selbst', fn: () => clubManage(this, b, this.where === 'inside' && this.inside?.business?.id === b.id ? this.inside : undefined) }] : []),
        ...(iss ? [{ icon: '🧰', label: iss.fix, sub: `${fixCost(b)} € · Umsatz läuft wieder voll`, fn: () => act(fixIssue(s, b), 'Problem gelöst. Der Laden läuft wieder.') }] : []),
        { icon: '🤝', label: 'Selbst mit anpacken', sub: s.flags[`mg_${b.id}_work`] === s.day ? 'heute schon erledigt' : '2 Stunden · +12 Beliebtheit · −10 Energie', disabled: s.flags[`mg_${b.id}_work`] === s.day, fn: () => { const why = workIn(s, b); if (why) { sfx('miss'); toast(why); return; } this.closeMenu(); this.fade(() => { this.pass(120); change(s, { energy: -10, social: 10, fun: 4 }); toast(`Zwei Stunden im ${b.name}. Die Gäste freuen sich, dich zu sehen. Beliebtheit +12`); this.save.write(); this.city.refreshHud(); this.touch.show(true); }); } },
        { icon: '🎉', label: sp.event, sub: wait ? `wieder in ${wait} ${wait === 1 ? 'Tag' : 'Tagen'}` : `${eventCost(b)} € · Kasse morgen früh · +20 Beliebtheit · +2 Ruf`, disabled: !!wait, fn: () => { const why = hostEvent(s, b); if (!why) this.hud.banner(`🎉 ${sp.event}`, sp.eventText, 'good', 4200); act(why, 'Die Einnahmen kommen morgen früh.'); } },
        { icon: '👥', label: st < STAFF.length - 1 ? `Einstellen: ${STAFF[st + 1].name}` : 'Personal: voll besetzt', sub: st < STAFF.length - 1 ? `${staffFee(b, st + 1) - staffFee(b, st)} € einmalig · Lohn ${Math.round(b.daily * STAFF[st + 1].wage)} €/Tag · Umsatz ×${STAFF[st + 1].mult}` : STAFF[st].text, disabled: st >= STAFF.length - 1, fn: () => act(hire(s, b, st + 1), `${STAFF[Math.min(STAFF.length - 1, st + 1)].name} eingestellt. Willkommen im Team!`) },
        ...(st ? [{ icon: '👋', label: `Zurückstufen: ${STAFF[st - 1].name}`, sub: 'weniger Lohn, weniger Umsatz', fn: () => act(hire(s, b, st - 1), 'Das Team ist kleiner geworden.') }] : []),
        ...UPGRADES.map((u) => { const l = upOf(s, b.id, u.id); return { icon: u.icon, label: `${u.id === 'extra' ? sp.extra : u.name} ${'★'.repeat(l)}${'☆'.repeat(UP_MAX - l)}`, sub: l >= UP_MAX ? 'voll ausgebaut' : `${upCost(b, l)} € · +12 % Umsatz${u.id === 'werbung' ? ' · +8 Beliebtheit' : ''} · ${u.id === 'extra' ? 'das gewisse Etwas' : u.text}`, disabled: l >= UP_MAX, fn: () => act(upgrade(s, b, u.id), `${u.id === 'extra' ? sp.extra : u.name}: Stufe ${l + 1}. Das spricht sich herum!`) }; }),
        { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
    } else if (app === 'fm') {
      fmMenu(this, frame, home);
    } else if (app === 'live') {
      const l = lineup(), win = (k: keyof typeof KINDS) => { const w = KINDS[k]; return `${w.from}–${w.to} Uhr`; };
      const rows = l.map((e) => `<p>${e.icon} <b>${esc(e.name)}</b><br><small>${KINDS[e.kind].icon} ${KINDS[e.kind].name} · jeden Spieltag ${win(e.kind)} · mit ${esc(e.host)}${e.kind === 'boot' ? ' · Start im Glitzer-Boot am Steg der Strandbar' : ''}<br>${doneThisWeek(s, e.kind) ? '✅ diese Woche geschafft' : isOpen(s, e.kind) ? '🔴 läuft gerade! Folge dem Symbol auf dem Radar' : '⏳ noch nicht offen'}${e.kind === 'boot' && s.flags['liveBest_' + e.id] ? ` · Bestzeit ${s.flags['liveBest_' + e.id]} s` : ''}</small></p>`).join('');
      this.openMenu(frame('Live-Events', `<div class="pbody"><p>Jede Woche neue Termine, für alle gleich: eine Party, ein Konzert, ein Bootsrennen. Alle drei geschafft = Wochenpass: +300 € und eine 👑 Event-Krone.</p>${rows}<p><small>📅 Woche ${weekKey() % 100} · neue Termine in ${daysLeft()} ${daysLeft() === 1 ? 'Tag' : 'Tagen'} (montags) · 👑 ${crowns(s)} Kronen · 🎆 Feuerwerk samstags um 22 Uhr über dem Hafen</small></p></div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'wetter') {
      const fc = forecast(s.day, s.time), toSat = (5 - (s.day - 1) % 7 + 7) % 7, se = SEASONS[season()];
      this.openMenu(frame('Wetter und Termine', `<div class="pbody"><p>${se.icon} <b>${se.name}</b>${seasonPick() === 'auto' ? ' (nach Kalender)' : ' (in den Optionen festgelegt)'}<br><small>${se.text}${isXmas() ? ' 🎄 Weihnachtswoche: abends Schnee, Weihnachtsbaum auf der Plaza.' : ''}${isSilvester() ? ' 🎆 Silvester: um Mitternacht Feuerwerk über Skyline und Hafen!' : ''}</small></p>${fc.map((f) => `<p>${SKY[f.sky].icon} <b>${f.label}</b>: ${SKY[f.sky].name}${f.parade ? ' · 🏳️‍🌈 CSD-Parade' : ''}</p>`).join('')}<p>🏳️‍🌈 <b>CSD-Parade</b><br><small>Jeden Samstag von 12 bis 18 Uhr auf der Hauptstraße: Festwagen, Tanzgruppen, Konfetti. ${toSat ? `Die nächste ist in ${toSat} ${toSat === 1 ? 'Tag' : 'Tagen'}.` : 'Heute ist es so weit!'} Lauf mit oder spring auf einen Wagen.</small></p><p><small>Nach Regen am Tag zeigt sich oft ein Regenbogen. Bei Regen glänzen die Straßen, bei Gewitter blitzt es über der Skyline.</small></p></div>`),
        [{ icon: '🎨', label: wagenOf(s) ? 'Deinen Festwagen umbauen' : 'Eigenen Festwagen bauen', sub: 'Flagge, Motto, Deko, Musik · Jury-Preis bei der Parade', fn: () => wagenMenu(this, () => this.phone('wetter')) }, { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'wissen') {
      const tl = timeline(s), seen = tl.filter((r) => r.seen).length;
      this.openMenu(frame('Wissen', `<div class="pbody"><p>Queere Geschichte, Menschen, Flaggen und Rechte. Neue Kapitel der Zeitleiste schaltest du in der Story frei.</p><p>🏳️‍🌈 Zeitleiste ${seen}/${tl.length} · 🎯 Quiz: ${Number(s.flags.quizRight) || 0} richtige Antworten</p></div>`), [
        { icon: '🎯', label: 'Quiz mit Hilde', sub: quizDoneToday(s) ? 'Heute schon gespielt · zum Üben nochmal' : '3 Fragen · bis zu 15 ✨ Glitzer und Ruf', fn: () => this.quiz(todaysQuiz(s), 0, 0) },
        { icon: '🕰️', label: 'Zeitleiste', sub: '1867 bis heute', fn: () => this.phone('w_hist') },
        { icon: '👤', label: 'Persönlichkeiten', sub: `${PEOPLE.length} Menschen, die Geschichte gemacht haben`, fn: () => this.phone('w_people') },
        { icon: '🎌', label: 'Flaggen', sub: 'Was die Farben bedeuten', fn: () => this.phone('w_flags') },
        { icon: '⚖️', label: 'Rechte und Hilfe', sub: 'Was in Deutschland gilt', fn: () => this.phone('w_rights') },
        { icon: '📚', label: 'Glossar', sub: 'Begriffe aus der Szene', fn: () => this.phone('glossary') },
        { icon: '🩺', label: 'Gesundheit', sub: 'PrEP, PEP, U=U, Tests', fn: () => this.phone('health') },
        { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'w_hist' || app === 'w_people' || app === 'w_rights' || app === 'w_flags') {
      const back = () => this.phone('wissen');
      const row = (e: { year?: string; title: string; text: string }) => `<p><small>${esc(e.year || '')}</small><br><b>${esc(e.title)}</b><br>${esc(e.text)}</p>`;
      const body = app === 'w_hist' ? timeline(s).map((r) => (r.seen ? row(r) : `<p><small>${esc(r.year || '')}</small><br><b>🔒 ${esc(r.title)}</b><br><i>Erlebst du in der Story.</i></p>`)).join('')
        : app === 'w_people' ? PEOPLE.map(row).join('')
        : app === 'w_rights' ? RIGHTS.map(row).join('')
        : flags().map((f) => `<p><span style="display:flex;height:14px;border-radius:4px;overflow:hidden;margin-bottom:4px">${f.colors.map((c) => `<i style="flex:1;background:${c}"></i>`).join('')}</span><b>${esc(f.name)}</b><br>${esc(f.info)}</p>`).join('');
      this.openMenu(frame({ w_hist: 'Zeitleiste', w_people: 'Persönlichkeiten', w_rights: 'Rechte und Hilfe', w_flags: 'Flaggen' }[app]!, `<div class="pbody">${body}</div>`), [{ icon: '←', label: 'Zurück', fn: back }], back, 'phone');
    } else if (app === 'glossary') {
      const g = GLOSSARY.filter(([, , a]) => !a || s.settings.adult);
      this.openMenu(frame('Glossar', `<div class="pbody">${g.map(([t, x]) => `<p><b>${t}</b><br>${x}</p>`).join('')}${s.settings.adult ? '' : '<p><small>Weitere Begriffe mit „Inhalte ab 18“ in den Optionen.</small></p>'}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'safedating') {
      this.openMenu(frame('🛡️ Sicher daten', `<div class="pbody">${SAFE_DATING.map(([h, x]) => `<p><b>${h}</b><br>${x}</p>`).join('')}</div>`),
        [{ icon: '←', label: 'Zurück', fn: () => this.phone('dating') }], () => this.phone('dating'), 'phone');
    } else if (app === 'dating') {
      this.dating();
      return;
    } else if (app === 'matches') {
      const ms = PROFILES.filter((p) => s.dates[p.id]);
      this.openMenu(frame('Matches', `<div class="pbody">${ms.length ? '<p>Wähle ein Match: Nachrichten, Dates, Unternehmungen und Geschenke.</p>' : '<p>Noch keine Matches. Wisch los!</p>'}</div>`),
        [...ms.map((p) => { const r = dateRec(s, p.id); return { icon: chatOpen(s, p.id) ? '💬' : '💘', label: `${p.name}, ${p.age}`, sub: `${DATE_STAGE[r.st]} · ${levelName(s, p.id)}${chatOpen(s, p.id) ? ' · neue Nachricht' : ''}${r.plan === s.day ? ' · Date heute: ' + (r.at === 'club' ? 'Club Prisma' : 'Café') : ''}`, fn: () => this.planDate(p.id) }; }),
          { icon: '←', label: 'Zurück', fn: () => this.phone('dating') }], () => this.phone('dating'), 'phone');
    } else if (app === 'map') {
      const pois = this.city.world.pois.filter((p) => !p.id.startsWith('tram'));
      this.openMenu(frame('Karte', `<div class="pbody"><canvas id="pmap" width="300" height="300"></canvas><p>Ort wählen: 📍 Wegpunkt setzen (GPS zeigt den Weg), Tram (2 €, 10 Minuten) oder Bus Linie 69 (1 €, 25 Minuten, mit Gesprächen).</p></div>`),
        [...(s.pin ? [{ icon: '❌', label: 'Wegpunkt entfernen', sub: `📍 ${pois.find((p) => p.id === s.pin)?.name || ''}`, fn: () => { s.pin = ''; this.save.write(); toast('Wegpunkt entfernt.'); this.phone('map'); } }] : []),
          ...pois.map((p) => ({ icon: p.icon, label: p.name, sub: s.pin === p.id ? '📍 Wegpunkt gesetzt · Wegpunkt, Tram oder Bus' : 'Wegpunkt setzen, Tram oder Bus', fn: () => this.mapPlace(p) })),
          { icon: '🌀', label: 'Weltentor: andere Welten', sub: 'Schnellreise nach Glitzeria, Playa Arcoíris, Lindenhof …', fn: () => { close(); this.worldMenu(); } },
          { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
      this.drawMap();
      if (this.menu) this.menu.onMove = () => this.drawMap();
    }
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
  }
  /* ---------- Dating-App „Rainbow Match“: wischen wie bei Tinder ---------- */
  private dating() {
    const s = this.save.data;
    const seen = (id: string) => { const v = s.flags['sw_' + id]; return v === 'y' || v === s.day; };
    const next = PROFILES.find((p) => !seen(p.id));
    if (next?.id !== this.photoFor) { this.photoFor = next?.id || ''; this.photoIdx = 0; }
    const shots = next ? profileShots(next, s.settings.adult) : [];
    // Foto der Figur (wird beim ersten Mal gerendert); Blättern ändert nur Bild, Punkte und Zähler
    const showPhoto = () => {
      const pic = this.overlay?.querySelector('.swipe .pic'); if (!next || !pic) return;
      pic.querySelectorAll('.dots u').forEach((u, i) => u.classList.toggle('on', i === this.photoIdx));
      (pic.querySelector('i') as HTMLElement).textContent = shots[this.photoIdx].label;
      const img = pic.querySelector('img') as HTMLImageElement, want = next.id + this.photoIdx;
      img.classList.remove('on');
      photo(next.id, shots[this.photoIdx]).then((url) => { if (this.photoFor + this.photoIdx === want) { img.src = url; img.classList.add('on'); } });
    };
    const flip = (d: number) => { if (!shots.length) return; this.photoIdx = (this.photoIdx + d + shots.length) % shots.length; showPhoto(); this.menu?.render(); sfx('move'); };
    const head = `<div class="ph"><span>${clock(s)}</span><b>💘 Rainbow Match</b><span>${PROFILES.filter((p) => s.dates[p.id]).length} ❤️</span></div>`;
    const card = next ? `<div class="swipe" style="--c:${next.color}"><div class="pic"><span>${next.name[0]}</span><img alt=""><b class="dots">${shots.map((_, i) => `<u class="${i === this.photoIdx ? 'on' : ''}"></u>`).join('')}</b><i>${shots[this.photoIdx]?.label || ''}</i></div>
      <h3>${next.name}, ${next.age} <small>${next.pron}</small></h3><p>${esc(next.bio)}</p><p class="tags">${next.likes.split(', ').map((x) => `<em>${esc(x)}</em>`).join('')}</p>
      ${next.know ? `<p class="know">💡 ${esc(next.know)}</p>` : ''}${s.settings.adult ? `<p class="adult">🔞 <b>${next.role}</b> · ${esc(next.into)}</p>` : ''}<div class="stamp no">NOPE</div><div class="stamp yes">LIKE</div></div>`
      : '<div class="pbody"><p>Keine neuen Profile in deiner Nähe. Schau morgen wieder rein! 🌈</p></div>';
    const swipe = (yes: boolean) => {
      if (!next) return;
      const c = this.overlay?.querySelector('.swipe') as HTMLElement | null;
      if (c) { c.classList.add(yes ? 'goR' : 'goL'); }
      s.flags['sw_' + next.id] = yes ? 'y' : s.day;
      sfx(yes ? 'ok' : 'back');
      setTimeout(() => {
        // Match, wenn es passt: dein Ruf, deine Stimmung und ein bisschen Glück
        if (yes && (s.rep + mood(s) / 20 + ((s.day + next.age) % 4)) >= 4) { dateRec(s, next.id); post(s, 'Rainbow Match', `Neues Match mit ${next.name}! 💘`); toast(`💘 It's a Match! ${next.name} mag dich auch.`); sfx('win'); this.save.write(); }
        else if (yes) toast(`${next.name} hat (noch) nicht zurückgewischt.`);
        this.dating();
      }, 380);
    };
    this.openMenu(`<div class="phoneBox">${head}${card}<div class="slot"></div></div>`, [
      ...(next ? [{ icon: '💞', label: 'Wischen', value: () => '← Nein · Ja →', left: () => swipe(false), right: () => swipe(true), fn: () => swipe(true) },
        { icon: '📷', label: 'Fotos', value: () => `${this.photoIdx + 1} / ${shots.length}`, left: () => flip(-1), right: () => flip(1), fn: () => flip(1) }] : []),
      { icon: '💬', label: 'Matches & Dates', sub: 'Date planen', fn: () => this.phone('matches') },
      { icon: '🛡️', label: 'Sicher daten', sub: 'Tipps: erstes Treffen, Fake-Profile, Betrug, Hilfe', fn: () => this.phone('safedating') },
      { icon: '←', label: 'Zurück', fn: () => this.phone() },
    ], () => this.phone(), 'phone');
    hints([['lr', 'Wischen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
    showPhoto();
    // Wischen mit Finger oder Maus, Tippen aufs Bild blättert die Fotos
    const c = this.overlay?.querySelector('.swipe') as HTMLElement | null;
    if (c) {
      let x0 = 0, dx = 0, on = false;
      c.addEventListener('pointerdown', (e) => { on = true; x0 = e.clientX; dx = 0; c.setPointerCapture(e.pointerId); c.style.transition = 'none'; });
      c.addEventListener('pointermove', (e) => { if (!on) return; dx = e.clientX - x0; c.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`; c.classList.toggle('lYes', dx > 40); c.classList.toggle('lNo', dx < -40); });
      const up = (e: PointerEvent) => { if (!on) return; on = false; c.style.transition = ''; if (Math.abs(dx) > 90) swipe(dx > 0); else { c.style.transform = ''; c.classList.remove('lYes', 'lNo'); if (Math.abs(dx) < 8 && (e.target as HTMLElement).closest('.pic')) flip(e.clientX > c.getBoundingClientRect().left + c.offsetWidth / 2 ? 1 : -1); } };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    }
  }
  /** Chat mit einem Match: Date planen, Nachricht beantworten, schenken, etwas unternehmen, jetzt treffen */
  planDate(id: string) {
    const s = this.save.data, p = profile(id)!, r = dateRec(s, id), close = () => { this.closeMenu(); this.touch.show(true); };
    const dated = r.last === s.day, again = () => this.planDate(id), buddy = this.city.buddy;
    const set = (at: string, msg: string) => { r.plan = s.day; r.at = at; s.pin = at; this.save.write(); toast(msg); close(); };
    const up = (m: string | null | undefined) => { if (m) { sfx('win'); this.hud.banner('💞 Ihr seid euch näher gekommen', m, 'good', 4600); } };
    const v = closeness(s, id), chat = chatOpen(s, id) ? chatOf(s, id) : null, evening = hour(s) >= 18 || hour(s) < 4;
    const sub = (title: string, items: Item[]) => this.openMenu(`<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>${title}</b><span>${s.money} €</span></div><div class="slot"></div></div>`, [...items, { icon: '←', label: 'Zurück', fn: again }], again, 'phone');
    this.openMenu(`<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>💬 ${p.name}</b><span>${DATE_STAGE[r.st]}</span></div><div class="pbody">
      <p>${levelName(s, id)} · Nähe ${v}/100${model(s) && r.st >= 3 ? ` · ${model(s) === 'mono' ? 'exklusiv' : 'offen'}` : ''}</p>
      <p class="bubble">${chat ? chat.text : dated ? 'Das war schön heute. Bis morgen? 😘' : `Hey! ${r.st ? 'Ich hab an dich gedacht. 🥰' : 'Schön, dass wir gematcht haben. 😊'} Wollen wir uns treffen?`}</p></div><div class="slot"></div></div>`, [
      ...(chat ? chat.replies.map(([label], i) => ({ icon: '✍️', label, fn: () => { const a = replyChat(s, id, i); this.save.write(); this.city.refreshHud(); close(); this.dialog.say([{ who: p.name, color: p.color, text: a.answer }], () => up(a.up)); } })) : []),
      { icon: '☕', label: 'Date im Café Kaffeeklatsch', sub: dated ? 'heute hattet ihr schon ein Date' : 'heute, wann du willst', disabled: dated, fn: () => set('cafe', `Date mit ${p.name} im Café – auf der Karte markiert.`) },
      { icon: '🪩', label: 'Date im Club Prisma', sub: dated ? 'heute hattet ihr schon ein Date' : 'heute Abend', disabled: dated, fn: () => set('club', `Date mit ${p.name} im Club Prisma – auf der Karte markiert.`) },
      { icon: '🗓️', label: 'Etwas unternehmen', sub: s.flags[`bd_${id}_out`] === s.day ? 'heute schon erledigt' : 'Park, Kino, Strand, Skybar …', fn: () => sub(`🗓️ Mit ${p.name}`, OUTINGS.map((o) => { const why = outingWhy(s, id, o, evening, !!myCar(s)); return { icon: o.icon, label: o.name, sub: why || `${o.cost ? o.cost + ' €' : 'kostenlos'} · ${o.min >= 120 ? Math.round(o.min / 60) + ' Stunden' : o.min + ' Minuten'} · Nähe +${o.bond}`, disabled: !!why, fn: () => { close(); this.fade(() => { this.pass(o.min); const m = doOuting(s, id, o); post(s, p.name, `${o.icon} ${o.name} mit dir. Schön war das.`); this.save.write(); this.city.refreshHud(); this.dialog.say([{ who: `${p.name} und du`, color: p.color, text: o.text }], () => up(m)); }); } }; })) },
      { icon: '🎁', label: 'Geschenk machen', sub: s.flags[`bd_${id}_gift`] === s.day ? 'heute schon beschenkt' : `${p.name} mag: ${p.likes}`, fn: () => sub(`🎁 Für ${p.name}`, GIFTS.map((g) => ({ icon: g.icon, label: g.name, sub: `${g.price} €`, fn: () => { const res = giveGift(s, p, g); if (res.why) { sfx('miss'); toast(res.why); return; } sfx('coin'); this.save.write(); this.city.refreshHud(); close(); this.dialog.say([{ who: p.name, color: p.color, text: res.text! }], () => up(res.up)); } }))) },
      ...(r.st >= 1 ? [{ icon: '🚶', label: buddy.who?.id === id ? 'Ihr seid gerade zusammen unterwegs' : 'Jetzt treffen und zusammen losziehen', sub: this.where !== 'city' ? 'geht nur draußen in der Stadt' : buddy.who && buddy.who.id !== id ? `${buddy.who.name} ist gerade bei dir` : `${p.name} kommt zu dir und begleitet dich drei Stunden`, disabled: this.where !== 'city' || !!buddy.who, fn: () => { close(); void this.city.meetBuddy(p); } }] : []),
      ...(r.st >= 3 ? [{ icon: '💞', label: 'Wie wollen wir zusammen sein?', sub: model(s) ? `abgesprochen: ${model(s) === 'mono' ? 'exklusiv' : 'offen'} · neu besprechen` : 'exklusiv oder offen: sprecht es ab', fn: () => { close(); this.modelTalk(id); } }] : []),
      ...(r.st >= 3 && !s.flags.spouse && !s.flags.engaged ? [{ icon: '💍', label: `${p.name} einen Antrag machen`, sub: canPropose(s, id) || 'Ring ist dabei – jetzt oder nie!', disabled: !!canPropose(s, id), fn: () => this.proposal(id) }] : []),
      { icon: '←', label: 'Zurück', fn: () => this.phone('matches') },
    ], () => this.phone('matches'), 'phone');
  }
  /** Liebesnacht mit Ehepartner*in zu Hause (18+, angedeutet, Abblende) */
  private spouseNight() {
    const s = this.save.data, sp = spouse(s), look = spouseLook(s); if (!sp || !look) return;
    if ((s.inv.condom || 0) > 0) s.inv.condom--;
    void this.home!.romance(look, sp.name, () => {
      const b = el(`<div class="night"><p>💜 ${esc(sp.name)} und du …</p><small>Zustimmung: ✔︎ · ${s.health.prep ? 'PrEP: ✔︎' : condomLabel(s) + ': ✔︎'}</small></div>`);
      document.body.appendChild(b); nightSounds(NIGHT_S);
      setTimeout(() => { this.pass(minutesUntil(s, 8), true); change(s, { energy: 100, social: 40, fun: 40, hygiene: -25 }); s.flags.wild = s.day; this.home!.showMess(); b.remove(); pcEvents.emit('liebesnacht', { id: sp.id, name: sp.name });
        this.dialog.say([{ who: sp.name, color: sp.color, text: 'Guten Morgen, Schatz. Ich liebe dich. Und du machst heute Frühstück. ☕💞' }]); this.save.write(); this.city.refreshHud(); }, NIGHT_S * 1000);
    });
  }
  /** Absprache: exklusiv oder offen. Beides ist gut, solange alle Bescheid wissen. */
  private modelTalk(id: string) {
    const s = this.save.data, p = profile(id)!, many = partners(s).length > 1;
    const W = (text: Line['text'], choices?: Line['choices']): Line => ({ who: p.name, color: p.color, text, choices });
    let pick: Model = '';
    this.dialog.say([W('Gut, dass du fragst. Mir ist wichtig, dass wir beide wissen, woran wir sind.'),
      W('Was wünschst du dir?', [
        { label: 'Nur wir zwei. Exklusiv.', fn: () => { pick = 'mono'; } },
        { label: 'Offen: Wir dürfen auch andere treffen und reden darüber.', fn: () => { pick = 'offen'; } }]),
      W(() => pick === 'mono' ? (many ? 'Exklusiv? Dann musst du erst mit den anderen reden, mit denen du zusammen bist. Ich warte, aber nicht ewig. 💛' : 'Das wünsche ich mir auch. Nur wir zwei. 💍') : 'Offen und ehrlich. Hauptsache, wir erzählen uns alles und passen aufeinander auf. 💜')], () => {
      if (pick === 'mono' && many) return;
      s.flags.relModel = pick; const m = addCloseness(s, id, 4);
      toast(pick === 'mono' ? '💞 Abgesprochen: exklusiv' : '💞 Abgesprochen: offen'); sfx('win');
      if (m) this.hud.banner('💞 Ihr seid euch näher gekommen', m, 'good', 4600);
      this.save.write();
    });
  }
  /* ---------- Online: Freund*innen in der Stadt ---------- */
  /** Code aus dem Einladungslink (?join=…) oder der letzten Eingabe */
  joinCode = '';
  private emoteT = 0;
  /** back = zurück ins vorige Menü, go = ins Spiel (vom Titel aus) */
  onlineMenu(back: () => void, go?: () => void) {
    const f = this.city.friends, net = f.net, has = this.save.hasGame, again = () => this.onlineMenu(back, go);
    const need = has ? undefined : 'erst ein Spiel beginnen';
    if (!net.on) {
      this.openMenu(`<div class="col"><div class="panel online"><h3>🌐 Online & Freunde</h3><p>Lade Freund*innen in deine Stadt ein oder besuche ihre. Mitspieler*innen können per Link oder Code von überall beitreten: Handy, PC, TV oder App.</p><p>Jede*r spielt den eigenen Spielstand weiter. Ihr seht euch in der Stadt, fahrt zusammen herum, tanzt und ruft euch etwas zu.</p><div class="slot"></div></div></div>`, [
        { icon: '🏙️', label: 'Meine Stadt öffnen', sub: need || `Code und Link zum Teilen · bis zu ${MAX_GUESTS} Gäste`, disabled: !has, fn: () => {
          this.loading.show('Online', 'Deine Stadt wird geöffnet'); net.host().then(() => { this.loading.hide(); sfx('win'); again(); }).catch((e) => { this.loading.hide(); sfx('miss'); toast(netError(e), 4200); });
        } },
        { icon: '🔑', label: 'Code eingeben', sub: need || 'Eine Freundin oder einen Freund besuchen', disabled: !has, fn: () => this.codeMenu(again, go || back) },
        { icon: '←', label: 'Zurück', fn: back }], back);
      return;
    }
    const host = net.role === 'host', link = net.link(), people = f.list;
    const who = people.length ? people.map((m) => `<li>${m.st.c ? '🚗' : '🌐'} ${esc(m.name)}</li>`).join('') : `<li class="mu">${host ? 'Noch niemand da. Schick den Link oder den Code los.' : 'Verbindung steht.'}</li>`;
    this.openMenu(`<div class="col"><div class="panel online"><h3>🌐 ${host ? 'Deine Stadt ist offen' : 'Zu Besuch in der Stadt ' + net.code}</h3>
      ${host ? `<div class="oRow"><div class="oQr" id="oQr"></div><div><small>Code</small><div class="oCode">${net.code}</div><p class="oUrl">${esc(link)}</p></div></div><p>Mitspieler*innen können per Link, QR-Code oder Code von überall beitreten.</p>` : ''}
      <ul class="oList">${who}</ul><div class="slot"></div></div></div>`, [
      ...(go ? [{ icon: '▶', label: 'In die Stadt', big: true, fn: go }] : []),
      ...(host ? [{ icon: '🔗', label: 'Link kopieren', fn: () => { const ok = () => toast('🔗 Link kopiert.'); try { navigator.clipboard.writeText(link).then(ok, () => toast(link, 6000)); } catch { toast(link, 6000); } } },
        ...(typeof navigator.share === 'function' ? [{ icon: '📤', label: 'Einladung teilen', fn: () => { navigator.share({ title: 'Pride City', text: `Komm in meine Stadt! Code ${net.code}`, url: link }).catch(() => {}); } }] : [])] : []),
      ...(this.pendingInvite ? [{ icon: '🪩', label: `Zu ${this.pendingInvite.from} in den ${this.pendingInvite.n}`, sub: 'Einladung annehmen', big: true, fn: () => { const inv = this.pendingInvite!; this.closeMenu(); this.touch.show(true); this.joinFriendClub(inv); } }] : []),
      ...(people.length ? [{ icon: '💬', label: 'Etwas zurufen', sub: 'Kurze Sprüche für alle', fn: () => this.quickMenu(again) }] : []),
      { icon: '🔄', label: 'Liste aktualisieren', fn: again },
      { icon: '🚪', label: host ? 'Stadt schließen' : 'Besuch beenden', fn: () => { f.leave(); toast(host ? '🌐 Deine Stadt ist wieder privat.' : '🌐 Besuch beendet.'); again(); } },
      { icon: '←', label: 'Zurück', fn: back }], back);
    if (host) loadQr().then((qr) => { const box = document.getElementById('oQr'); if (!box) return; const q = qr(0, 'M'); q.addData(link); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => {});
  }
  /** Code wählen: tippen oder mit ←/→ blättern (ein Bedienkonzept für Tastatur, Touch, Controller und TV) */
  private codeMenu(back: () => void, done: () => void) {
    const f = this.city.friends, ch = Array.from((this.joinCode + 'AAAA').slice(0, 4));
    const code = () => ch.join(''), sync = () => { this.joinCode = code(); const i = document.getElementById('oIn') as HTMLInputElement | null; if (i && normCode(i.value) !== code()) i.value = code(); };
    const step = (i: number, d: number) => { ch[i] = ALPHA[(ALPHA.indexOf(ch[i]) + d + ALPHA.length) % ALPHA.length]; sync(); };
    this.openMenu(`<div class="col"><div class="panel online"><h3>🔑 Code eingeben</h3><p>Vier Zeichen, die dir die Gastgeberin oder der Gastgeber nennt. Mit dem Einladungslink ist der Code schon eingetragen.</p>
      <input type="text" id="oIn" class="oIn" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${code()}" aria-label="Code"><div class="slot"></div></div></div>`, [
      ...ch.map((_, i) => ({ icon: '🔤', label: `${i + 1}. Zeichen`, value: () => ch[i], left: () => step(i, -1), right: () => step(i, 1) })),
      { icon: '🌐', label: 'Beitreten', big: true, fn: () => {
        this.loading.show('Online', `Stadt ${code()} wird gesucht`);
        f.net.join(code()).then(() => { this.loading.hide(); f.hello(); sfx('win'); toast('🌐 Verbunden. Viel Spaß zusammen!'); done(); }).catch((e) => { this.loading.hide(); sfx('miss'); toast(netError(e), 4200); });
      } },
      { icon: '←', label: 'Zurück', fn: back }], back);
    const inp = document.getElementById('oIn') as HTMLInputElement | null;
    if (inp) inp.oninput = () => { const v = normCode(inp.value); inp.value = v; Array.from(v).forEach((c, i) => (ch[i] = c)); this.joinCode = code(); this.menu?.render(); };
  }
  private quickMenu(back: () => void) {
    const f = this.city.friends;
    this.openMenu('<div class="col"><div class="panel online"><h3>💬 Etwas zurufen</h3><div class="slot"></div></div></div>',
      [...QUICK.map((q, i) => ({ label: q, fn: () => { f.quick(i); toast(`Du: ${q}`); back(); } })), { icon: '←', label: 'Zurück', fn: back }], back);
  }
  /** Freund*in in der Stadt ansprechen */
  friendMenu(id: string) {
    const f = this.city.friends, m = f.roster.members.get(id); if (!m) return;
    const s = this.save.data, close = () => { this.closeMenu(); this.touch.show(true); };
    this.touch.show(false);
    this.openMenu(`<div class="place"><h3>🌐 ${esc(m.name)}</h3><p>Zu Besuch in deiner Runde. Gesten sehen alle, die gerade in der Stadt sind.</p><div class="slot"></div></div>`, [
      ...EMOTES.map(([k, icon, label]) => ({ icon, label, fn: () => {
        close(); (this.where === 'inside' && this.inside ? this.inside.player : this.city.player).play(k as Parameters<typeof this.city.player.play>[0]); f.emote(k);
        if (performance.now() - this.emoteT > 60000) { this.emoteT = performance.now(); change(s, { social: 6, fun: 4 }); this.city.refreshHud(); }
      } })),
      { icon: '💬', label: 'Etwas zurufen', fn: () => this.quickMenu(close) },
      { icon: '←', label: 'Zurück', fn: close }], close, '');
  }

  /** Begleitung ansprechen */
  buddyMenu() {
    const s = this.save.data, b = this.city.buddy, p = b.who; if (!p) return;
    const r = dateRec(s, p.id), close = () => { this.closeMenu(); this.touch.show(true); };
    this.touch.show(false);
    this.openMenu(`<div class="place"><h3>${p.name}</h3><p>${levelName(s, p.id)} · noch etwa ${Math.max(1, Math.round(b.left / 60))} Stunden zusammen unterwegs. Gemeinsame Zeit bringt Nähe.</p><div class="slot"></div></div>`, [
      { icon: '📸', label: 'Foto zusammen', sub: s.flags[`bd_${p.id}_foto`] === s.day ? 'heute schon gemacht' : 'für den Feed · Nähe +2', disabled: s.flags[`bd_${p.id}_foto`] === s.day, fn: () => { s.flags[`bd_${p.id}_foto`] = s.day; const m = addCloseness(s, p.id, 2); change(s, { fun: 6, social: 6 }); post(s, 'Du', `Unterwegs mit ${p.name}. 📸💕`); sfx('coin'); close(); toast(`📸 Ihr zwei vor der Skyline. ${p.name} stellt es gleich in den Feed.`); if (m) this.hud.banner('💞 Ihr seid euch näher gekommen', m, 'good', 4600); this.save.write(); this.city.refreshHud(); } },
      { icon: r.st >= 2 ? '💋' : '🤗', label: r.st >= 2 ? 'Kuss' : 'Umarmung', sub: '+Kontakte · +Spaß', fn: () => { change(s, { social: 8, fun: 5 }); sfx('giggle'); close(); toast(r.st >= 2 ? `💋 ${p.name} küsst dich mitten auf dem Gehweg.` : `🤗 ${p.name} drückt dich fest.`); this.city.refreshHud(); } },
      { icon: '💬', label: 'Reden', fn: () => { close(); this.dialog.say([{ who: p.name, color: p.color, text: [`Weißt du, was ich an dieser Stadt mag? Dass ich hier deine Hand halten kann, ohne nachzudenken.`, `${p.bio} Aber das weißt du ja längst.`, 'Lass uns irgendwo reingehen. Du suchst aus, ich zahle den Nachtisch.', 'Ich könnte ewig so mit dir herumlaufen.'][(s.day + Math.floor(s.time * 8)) % 4] }]); } },
      { icon: '👋', label: 'Verabschieden', fn: () => { close(); this.city.byeBuddy('Das war schön. Schreib mir, ja? 💜'); } },
      { icon: '←', label: 'Zurück', fn: close }], close, '');
  }
  /** Das Date selbst: drei Situationen, danach – nur mit Zustimmung beider – vielleicht mehr */
  runDate(id: string) {
    const s = this.save.data, p = profile(id)!, r = dateRec(s, id);
    let pts = 0;
    const W = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: p.name, color: p.color, text, choices });
    this.dialog.say([W(r.st ? 'Da bist du ja! Ich hab mich den ganzen Tag gefreut.' : 'Hi! Du siehst noch besser aus als auf dem Profil. 😊'),
      ...dateQuestions(s, id).map(([q, opts]) => W(q, opts.map(([label, v]) => ({ label, fn: () => { pts += v; sfx(v === 2 ? 'coin' : v ? 'move' : 'miss'); } }))))], () => {
      this.pass(90);
      change(s, { social: 20, fun: 15 });
      const res = finishDate(s, id, pts);
      const near = addCloseness(s, id, pts >= 4 ? 4 : 1), hurt = res.up ? jealousy(s, id) : null;
      if (near) toast(near);
      pcEvents.emit('dateGelaufen', { id, name: p.name, stage: dateRec(s, id).st, up: res.up, pts });
      const fo = dateFolge(s, id, pts, res.up);
      if (fo) setTimeout(() => this.hud.banner(fo.title, fo.text, fo.good ? 'good' : 'bad', 5200), hurt ? 5600 : 400);
      if (hurt) { sfx('miss'); this.hud.banner('💔 Verletzte Absprache', hurt, 'bad', 5200); }
      if (res.up) post(s, p.name, ['Bestes Date seit Langem. 💕', 'Hab Schmetterlinge im Bauch …', 'Ich glaube, ich bin verliebt. 🌈'][Math.min(2, r.st - 1)] || 'Schöner Abend!');
      const after = () => { this.save.write(); this.city.refreshHud(); };
      if (!res.up) { this.dialog.say([W(pts >= 2 ? 'Das war nett. Lass uns das wiederholen – vielleicht.' : 'Hm, ich glaube, es hat heute nicht so gefunkt. Trotzdem danke!')], after); return; }
      toast(`💕 ${p.name}: ${res.stage}`); sfx('win');
      const why = canStay(s, id);
      if (why === 'off' || why === 'early') { this.dialog.say([W(r.st >= 2 ? 'Gute Nacht. *küsst dich zum Abschied*' : 'Das war schön. Schreibst du mir? 😊')], after); return; }
      this.dialog.say([W('Willst du noch mit zu mir … oder ich zu dir? Nur wenn du auch magst.', [
        { label: 'Ja, total gern – wenn du auch willst.', fn: () => {
          if (why === 'condom') { setTimeout(() => this.dialog.say([W('Ich auch … aber nur mit Gummi, und ich hab keins dabei. Nächstes Mal? Im Späti und im Checkpoint gibt es welche. 😉')], after), 50); return; }
          setTimeout(() => this.wildNight(id), 50);
        } },
        { label: 'Heute lieber nicht, lass es langsam angehen.', fn: () => { setTimeout(() => this.dialog.say([W('Klar, total okay! Ich mag dich trotzdem. 💜')], after), 50); } },
      ])]);
    });
  }
  /** Angedeutete Nacht: Zustimmung beider, Kondom, Abblende – am Morgen sieht man die Spuren */
  wildNight(id: string) {
    const s = this.save.data, p = profile(id)!;
    const lube = (s.inv.lube || 0) > 0;
    s.inv.condom--; if (lube) s.inv.lube--;
    const look = { body: p.body, palette: p.palette, skin: p.skin, outfit: 'clothed' as const, top: p.pron !== 'er' };
    // Abblende nach der Filmszene: Zeit vorspulen, Morgen danach mit Kaffee in der Küche
    const night = () => {
      const b = el(`<div class="night"><p>💜 ${p.name} und du …</p><small>Zustimmung: ✔︎ · ${condomLabel(s)}: ✔︎${lube ? ' · Gleitgel: ✔︎' : ''}${s.health.prep ? ' · PrEP: ✔︎' : ''}</small></div>`);
      document.body.appendChild(b); nightSounds(NIGHT_S);
      setTimeout(() => {
        this.pass(minutesUntil(s, 8), true);
        change(s, { energy: 100, social: 40, fun: 40, hygiene: -30 });
        s.flags.wild = s.day; post(s, 'Du', 'Was für eine Nacht. 🔥');
        pcEvents.emit('liebesnacht', { id, name: p.name });
        const h = this.home!;
        h.showMess(); void h.morning(look);
        const morning = [`Guten Morgen, du. Kaffee ist fertig. Ich muss gleich los, aber … das war schön. ☕`, `Ich hab dir einen Kaffee gemacht. Deine zweite Socke liegt übrigens unterm Bett. 😅`, `Bleib noch liegen. Ich hab Frühstück gemacht und dir ein Herz auf den Zettel gemalt. 💌`];
        setTimeout(() => { b.remove(); this.dialog.say([{ who: p.name, color: p.color, text: morning[s.day % 3] }, { who: 'Du', color: '#ff4fa3', text: 'Erst mal duschen. Und aufräumen.' }], () => { void h.morning(null); toast(`${p.name} ist los zur Arbeit. 💜`); }); this.save.write(); }, 900);
      }, NIGHT_S * 1000);
    };
    this.enterHome(() => { void this.home!.romance(look, p.name, night); });
  }

  /* ---------- Nachtleben 18+ (Durchgang 3b): angedeutet, Abblende, Zustimmung und Kondom ---------- */
  /** Abblende mit kurzer Zeile, danach Zeit vorspulen und weiter */
  fadeNight(title: string, tags: string[], minutes: number, kind: Parameters<typeof encounter>[1], after?: () => void, bare = false) {
    const s = this.save.data;
    const b = el(`<div class="night"><p>${esc(title)}</p><small>${tags.map(esc).join(' · ')}</small></div>`);
    document.body.appendChild(b); if (kind !== 'talk') nightSounds();
    setTimeout(() => {
      this.pass(minutes);
      if (bare) s.inv.condom = (s.inv.condom || 0) + 1;   // ohne Kondom: encounter verbraucht keins
      const r = encounter(s, kind);
      if (bare) exposure(s, true);
      this.save.write(); this.city.refreshHud(); b.remove();
      if (r.remindTest && kind !== 'talk') toast('🩺 Denk an deinen nächsten Test im Checkpoint – anonym und kostenlos.');
      after?.();
    }, 2600);
  }
  private adultOnly(name: string) {
    this.dialog.say([{ who: name, color: '#ff6ad5', text: 'Hier kommst du nur rein, wenn „Inhalte ab 18“ in den Optionen eingeschaltet ist.' }]);
  }
  /** Samenbank Zukunft: Gesundheitstest, Kabine, Abblende – danach Geld und manchmal Post von einer Familie */
  private donate() {
    const s = this.save.data, A = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: 'Dr. Amara Wolff', color: '#7fd4ff', text, choices });
    if (!s.health.test || s.day - s.health.test > TEST_EVERY) { this.dialog.say([A('Schön, dass du helfen willst! Bitte mach vorher einen aktuellen Test im Checkpoint Regenbogen. Der ist kostenlos und geht schnell.')]); return; }
    this.dialog.say([A('Dein Test ist aktuell, alles bestens. Kabine 2 ist frei: Becher, Zeitschriften, Kopfhörer und ein Schloss an der Tür.', [
      { label: 'Ich bin bereit', fn: () => setTimeout(() => {
        const b = el(`<div class="night"><p>🧪 Kabine 2 …</p><small>Gesundheitscheck ✔︎ · Einverständnis ✔︎ · Diskretion ✔︎</small></div>`);
        document.body.appendChild(b); sfx('door');
        setTimeout(() => {
          this.pass(45); b.remove();
          s.money += DONATE; s.flags.donate = s.day; s.flags.donations = (Number(s.flags.donations) || 0) + 1;
          change(s, { fun: 10, energy: -6, hygiene: -5 });
          const n = Number(s.flags.donations);
          const lines = [A(`Vielen Dank! Die Aufwandsentschädigung: ${DONATE} €. Komm gern wieder, frühestens morgen.`)];
          if (n === 3) { s.rep += 3; post(s, 'Samenbank Zukunft', 'Gute Nachricht: Mit deiner Spende hat sich ein Kinderwunsch erfüllt. Zwei Mamas sagen Danke! 💙'); lines.push(A('Ach, und eine Nachricht für dich: Eine Familie freut sich über Nachwuchs. Mehr dürfen wir nicht sagen. 💙')); }
          if (n === 6) { s.rep += 3; post(s, 'Samenbank Zukunft', 'Ein Papa-Paar aus der Hochstadt schickt eine Karte mit Babyfüßchen. Danke, dass du hilfst! 👣'); }
          this.save.write(); this.city.refreshHud(); sfx('coin');
          this.dialog.say(lines);
        }, 2600);
      }, 50) },
      { label: 'Heute doch nicht', fn: () => {} },
    ])]);
  }
  /** Videothek: Film leihen (Titel und Cover nur als Text) */
  private rentFilm() {
    const s = this.save.data;
    this.openMenu('<div class="col"><div class="panel"><h3>📼 Videothek Kopfkino</h3><p>Regal „Hinterzimmer“ – nur Titel und Cover-Beschreibungen. 5 € pro Film.</p><div class="slot"></div></div></div>', [
      ...FILMS.map(([t, c]) => ({ icon: '📼', label: t, sub: c, fn: () => {
        if (s.money < 5) { toast('Nicht genug Geld.'); sfx('miss'); return; }
        s.money -= 5; change(s, { fun: 12 }); post(s, 'Du', `Heute Abend: „${t}“. 🍿😏`); sfx('coin'); toast(`„${t}“ ausgeliehen. Viel Spaß! 🍿`);
        this.save.write(); this.city.refreshHud(); this.closeMenu(); this.touch.show(true);
      } })),
      { icon: '←', label: 'Zurück', fn: () => this.placeMenu('kopfkino') },
    ], () => this.placeMenu('kopfkino'), '');
  }
  /** Kabinen: Klopfzeichen als Zustimmung, Kondom Pflicht */
  private cabin() {
    const s = this.save.data, V = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: 'Kabine 3', color: '#ff3b6b', text, choices });
    if (s.money < 3) { toast('Nicht genug Geld.'); sfx('miss'); return; }
    s.money -= 3; this.closeMenu(); this.city.refreshHud();
    this.dialog.say([V('Gedimmtes Licht, leise Musik. In der Wand ein rundes Loch mit Gummirand. Nebenan bewegt sich jemand.', [
      { label: 'Zweimal klopfen – das heißt hier „Lust?“', fn: () => setTimeout(() => {
        if (Math.random() < .3) { this.dialog.say([V('Keine Antwort. Ein Nein ist ein Nein – du lässt es gut sein.')]); return; }
        if (canMeet(s) === 'condom') { this.dialog.say([V('Zwei Klopfer zurück: Ja! … aber du hast kein Kondom dabei.'), V('Am Automaten neben der Kasse gibt es welche für 1 €.')]); return; }
        this.dialog.say([V('Zwei Klopfer zurück: Ja! 😏')], () => this.fadeNight('🚪 Kabine 3 …', ['Klopfzeichen: Ja ✔︎', `${condomLabel(s)} ✔︎`, s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean), 25, 'cabin'));
      }, 50) },
      { label: 'Nur gucken und wieder gehen', fn: () => {} },
    ])]);
  }
  /** Hinterzimmer-Ecke der Boutique (18+): Toys in Größen, Kondome in deiner Größe, diskret ausprobieren */
  private toyShop() {
    const s = this.save.data, again = () => { this.city.refreshHud(); this.toyShop(); };
    const has = (id: string) => s.inv['t_' + id] || 0;
    const tried = s.flags.toyTry === s.day, mine = [...DILDOS, ...EXTRAS].filter((t) => ownsToy(s, t.id));
    this.openMenu(`<div class="col"><div class="panel"><h3>🔞 Hinterzimmer-Ecke</h3><p>Hinter dem Samtvorhang der Boutique: Glitzer-Toys in allen Größen, diskret verpackt. Dildos kannst du auch schwingen (Waffe wechseln schaltet die Größen durch).</p><div class="slot"></div></div></div>`, [
      ...[...DILDOS, ...EXTRAS].map((t) => ({ icon: t.icon, label: `${t.name}${t.size ? ' · ' + t.size : ''}`, sub: `${t.price} € · ${t.text}${has(t.id) ? ` · du hast ${has(t.id)}` : ''}`,
        fn: () => { const e = buyToy(s, t); if (e) { toast(e); sfx('miss'); return; } change(s, { fun: t.fun }); sfx('coin'); toast(`${t.icon} ${t.name}: diskret verpackt. Viel Spaß! 😏`); again(); } })),
      ...CONDOMS.map(([sz, nm]) => ({ icon: '🎈', label: `Kondome ${sz} „${nm}“ (3 Stück)`, sub: `3 € · ${s.flags.condomSize === sz ? 'deine Größe · ' : ''}du hast ${s.inv.condom || 0}`,
        fn: () => { const e = buyCondoms(s, sz); if (e) { toast(e); sfx('miss'); return; } sfx('coin'); toast(`🎈 Größe ${sz} gemerkt. Passt, sitzt, schützt.`); again(); } })),
      ...(mine.length ? [{ icon: '😏', label: 'In der Umkleide ausprobieren', sub: tried ? 'heute schon' : `20 Minuten · Spaß +${Math.min(40, mine.reduce((n, t) => n + t.fun, 0))}`, disabled: tried,
        fn: () => { this.closeMenu(); this.touch.show(true); this.fade(() => { this.pass(20); s.flags.toyTry = s.day; change(s, { fun: Math.min(40, mine.reduce((n, t) => n + t.fun, 0)), energy: -6 }); this.save.write(); this.city.refreshHud(); toast('Vorhang zu, Musik an. Der Rest bleibt in der Umkleide. 😏'); }); } }] : []),
      { icon: '←', label: 'Zurück', fn: () => this.placeMenu('boutique') },
    ], () => this.placeMenu('boutique'), '');
  }
  /** Laufhaus: selbstbestimmte Sexarbeiter*innen, Absprache vorab, Haus stellt Kondome */
  private rosa() {
    this.openMenu('<div class="col"><div class="panel"><h3>🏮 Haus Rosa</h3><p>Hier mieten selbstbestimmte erwachsene Sexarbeiter*innen ihre eigenen Zimmer. An der Tür: Respekt, Kondompflicht, Nein heißt Nein.</p><div class="slot"></div></div></div>', [
      ...WORKERS.map((w) => ({ icon: '🚪', label: `${w.name}, ${w.age} (${w.pron})`, sub: `${w.offer} · ${w.price} € / Stunde`, fn: () => this.booking(w.id) })),
      { icon: 'ℹ️', label: 'Sexarbeit ist Arbeit', sub: 'Rechte, Beratung, Respekt', fn: () => { this.closeMenu(); this.touch.show(true); this.dialog.say([
        { who: 'Haus Rosa', color: '#ff6ad5', text: 'Alle hier sind volljährig, angemeldet und arbeiten auf eigene Rechnung. Sie entscheiden selbst, mit wem und wie.' },
        { who: 'Haus Rosa', color: '#ff6ad5', text: 'Wer Hilfe braucht oder aussteigen will: Das Regenbogenhaus berät anonym und vermittelt an Fachstellen für Sexarbeit.' },
        { who: 'Haus Rosa', color: '#ff6ad5', text: 'Kund*innen-Regeln: vorher fragen, Grenzen respektieren, Kondom immer – und Trinkgeld ist willkommen. 💜' }]); } },
      { icon: '←', label: 'Zurück', fn: () => this.placeMenu('rosa') },
    ], () => this.placeMenu('rosa'), '');
  }
  booking(id: string) {
    const s = this.save.data, w = WORKERS.find((x) => x.id === id)!;
    const W = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: w.name, color: w.color, text, choices });
    this.closeMenu(); this.touch.show(true);
    this.dialog.say([W(`Hi, ich bin ${w.name}. Schön, dass du da bist.`), W(w.rules), W(`Eine Stunde kostet ${w.price} €. Was möchtest du?`, [
      { label: `Einverstanden – eine Stunde (${w.price} €)`, fn: () => setTimeout(() => {
        if (s.money < w.price) { this.dialog.say([W('Das reicht leider nicht. Komm gern wieder, wenn es passt. 😊')]); return; }
        s.money -= w.price; s.inv.condom = (s.inv.condom || 0) + 1; // das Haus stellt Kondome
        this.fadeNight(`🏮 Bei ${w.name} …`, ['Absprache ✔︎', 'Zustimmung ✔︎', 'Kondom vom Haus ✔︎'], 60, 'room', () => this.dialog.say([W(['Danke dir. Pass auf dich auf! 💜', 'Komm gut nach Hause. Und trink Wasser. 😉', 'War schön mit dir. Bis zum nächsten Mal?'][s.day % 3])]));
      }, 50) },
      { label: `Nur reden und Tee trinken (${Math.round(w.price / 2)} €)`, fn: () => setTimeout(() => {
        const c = Math.round(w.price / 2);
        if (s.money < c) { this.dialog.say([W('Das reicht leider nicht. Komm gern wieder.')]); return; }
        s.money -= c; this.fadeNight(`🫖 Tee mit ${w.name}`, ['Zuhören ✔︎', 'Lachen ✔︎'], 45, 'talk', () => this.dialog.say([W('Manchmal ist reden das Schönste. Danke für das Gespräch. 💜')]));
      }, 50) },
      { label: 'Doch nicht, danke', fn: () => setTimeout(() => this.dialog.say([W('Kein Problem. Einen schönen Abend dir!')]), 50) },
    ])]);
  }
  /** Cruising im Park: nur spät nachts, Blickkontakt und Nicken als Zustimmung */
  private cruising() {
    const s = this.save.data, Q = (text: string, choices?: Array<{ label: string; sub?: string; fn: () => void }>) => ({ who: 'Im Gebüsch', color: '#3ee69a', text, choices });
    this.closeMenu(); this.touch.show(true);
    if (Math.random() < .25) { this.dialog.say([Q('Heute ist nichts los. Nur ein Igel raschelt im Laub. 🦔')]); this.pass(20); return; }
    this.dialog.say([Q('Im Schatten der Bäume steht jemand. Ein Blick, ein Lächeln, ein Nicken in Richtung der Büsche.', [
      { label: 'Zurücknicken und mitgehen', fn: () => setTimeout(() => {
        if (canMeet(s) === 'condom') { this.dialog.say([Q('„Hast du ein Gummi?“ – Hast du nicht. „Dann ein andermal.“ Er zwinkert und verschwindet.')]); return; }
        this.fadeNight('🌙 Zwischen den Büschen …', ['Nicken: Ja ✔︎', `${condomLabel(s)} ✔︎`, s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean), 30, 'cruising', () => this.dialog.say([{ who: 'Du', color: '#ff4fa3', text: 'Die Verpackung kommt in den Mülleimer. Wir sind ja nicht die anderen. 😅' }]));
      }, 50) },
      { label: '⚠️ Mitgehen, ohne Gummi – nur wenn er das auch will', sub: s.health.prep ? 'PrEP schützt vor HIV, nicht vor anderen STI' : 'Risiko für HIV und andere STI', fn: () => setTimeout(() => {
        this.dialog.say([Q('Ihr flüstert kurz. „Ohne? Okay, wenn du willst.“ Beide nicken.')], () => this.fadeNight('🌙 Zwischen den Büschen …', ['Absprache: ohne Kondom', s.health.prep ? 'PrEP ✔︎' : 'keine PrEP'], 30, 'cruising', () => this.dialog.say([{ who: 'Du', color: '#ff4fa3', text: 'Ohne war abgesprochen. Trotzdem: in ein paar Tagen in den Checkpoint. Und ohne PrEP gilt: PEP bis 72 Stunden danach.' }]), true));
      }, 50) },
      { label: 'Freundlich den Kopf schütteln und weitergehen', fn: () => setTimeout(() => this.dialog.say([Q('Er nickt verständnisvoll. Kein Ding.')]), 50) },
    ])]);
  }

  private drawMap() {
    const c = document.getElementById('pmap') as HTMLCanvasElement | null; if (!c) return;
    // Ausschnitt x −385…235 (Inselkette bis Hochstadt), z −290…330 (bis Kap Zuflucht)
    const x = c.getContext('2d')!, k = 300 / 620, PX = (v: number) => (v + 385) * k, PZ = (v: number) => (v + 290) * k;
    x.fillStyle = '#2f8fd0'; x.fillRect(0, 0, 300, 300);
    x.fillStyle = '#4a4a52'; x.fillRect(PX(-66), PZ(-165), 400 * k, 99 * k); x.fillRect(PX(-66), PZ(66), 400 * k, 99 * k);
    x.fillStyle = '#2f8fd0'; x.fillRect(PX(64), 0, 26 * k, 300);
    x.fillStyle = '#5a6a7a'; x.fillRect(PX(85), PZ(-65), 130 * k, 130 * k);
    x.fillStyle = '#3a3f55'; x.fillRect(PX(60), PZ(-5), 32 * k, 10 * k);
    for (let i = 9; i <= 21; i += 3) x.fillRect(PX(i * 10 - 5), PZ(-65), 10 * k, 130 * k);
    for (let i = -6; i <= 6; i += 3) x.fillRect(PX(85), PZ(i * 10 - 5), 130 * k, 10 * k);
    x.fillStyle = '#5c9a52'; x.fillRect(PX(-65), PZ(-65), 130 * k, 130 * k);
    x.fillStyle = '#bdb5a8'; x.fillRect(PX(-92), PZ(-35), 27 * k, 80 * k); x.fillStyle = '#f0d9a0'; x.fillRect(PX(-97), PZ(17), 5 * k, 26 * k);
    x.fillStyle = '#8a5a35'; x.fillRect(PX(-111), PZ(-3.5), 20 * k, 3 * k);
    for (const i of this.city.isles) {   // Inseln der Welten mit Brücken
      if (i.locked) continue;
      const [, e] = i.bridge(), d = i.def;
      x.strokeStyle = '#bdb5a8'; x.lineWidth = 10 * k; x.beginPath(); x.moveTo(PX(i.ox), PZ(i.oz)); x.lineTo(PX(e[0]), PZ(e[1])); x.stroke();
      x.fillStyle = '#f0d9a0'; x.beginPath(); x.arc(PX(i.ox), PZ(i.oz), (d.r + 6) * k, 0, 7); x.fill();
      x.fillStyle = '#' + d.ground.toString(16).padStart(6, '0'); x.beginPath(); x.arc(PX(i.ox), PZ(i.oz), d.r * k, 0, 7); x.fill();
      x.font = '20px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(d.icon, PX(i.ox), PZ(i.oz));
    }
    x.fillStyle = '#3a3f55';
    for (let i = -6; i <= 6; i += 3) { x.fillRect(PX(i * 10 - 5), PZ(-65), 10 * k, 130 * k); x.fillRect(PX(-65), PZ(i * 10 - 5), 130 * k, 10 * k); }
    const P = PX;
    const sel = this.menu?.items[this.menu.index]?.label;
    for (const p of this.city.world.pois) {
      x.font = (p.name === sel ? 26 : 18) + 'px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if (p.name === sel) { x.fillStyle = 'rgba(255,79,163,.55)'; x.beginPath(); x.arc(P(p.x), PZ(p.z), 16, 0, 7); x.fill(); }
      x.fillText(p.icon, P(p.x), PZ(p.z));
    }
    const pl = this.city.player.root.position;
    x.fillStyle = '#fff'; x.strokeStyle = '#ff4fa3'; x.lineWidth = 3; x.beginPath(); x.arc(P(pl.x), PZ(pl.z), 6, 0, 7); x.fill(); x.stroke();
  }
  travel(x: number, z: number, bus = false) {
    const s = this.save.data;
    sfx('tram');
    const go = () => { this.where = 'city'; s.inside = false; s.pos = { x: x > 0 ? x - 2.2 : x + 2.2, z, yaw: x > 0 ? Math.PI / 2 : -Math.PI / 2 }; this.pass(bus ? BUS_MIN : 10); this.done(track(s, 'tram')); this.engine.setScene(this.city); this.city.setPlay(); if (!bus) toast('🚋 Angekommen.'); };
    if (!bus) { this.fade(go); return; }
    // in der Stadt: Linie 69 in 3D, sonst (aus der Wohnung, von drinnen) als Gespräch mit Überblendung
    if (this.where === 'city' && this.city.bus) { this.city.bus.start(x, z, () => { s.pos = { x: x > 0 ? x - 2.2 : x + 2.2, z, yaw: x > 0 ? Math.PI / 2 : -Math.PI / 2 }; this.city.player.root.position.set(s.pos.x, .1, z); this.city.player.root.rotation.y = s.pos.yaw; this.pass(15); this.done(track(s, 'tram')); this.save.write(); }); return; }
    // Bus: unterwegs erzählt dir jemand etwas, danach steigst du am Ziel aus
    const seed = Math.random();
    this.dialog.say(busTalk(seed, (nice) => { change(s, nice ? { social: 12, fun: 6 } : { energy: 4 }); setTimeout(() => this.dialog.say([busAfter(seed, nice)], () => { this.fade(go); setTimeout(() => toast('🚌 Endstation für dich, du steigst aus.'), 900); }), 60); }));
  }
  /** Ort auf der Karte: Wegpunkt setzen, Tram oder Bus */
  private mapPlace(p: { id: string; name: string; icon: string; x: number; z: number }) {
    const s = this.save.data, back = () => this.phone('map'), close = () => { this.closeMenu(); this.touch.show(true); };
    const ride = (cost: number, bus: boolean) => () => { if (s.money < cost) { toast(`Nicht genug Geld für ${bus ? 'den Bus' : 'die Tram'}.`); sfx('miss'); return; } s.money -= cost; if (s.pin === p.id) s.pin = ''; close(); this.travel(p.x, p.z, bus); };
    this.openMenu(`<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>${p.icon} ${p.name}</b><span>${s.money} €</span></div><div class="slot"></div></div>`, [
      s.pin === p.id ? { icon: '❌', label: 'Wegpunkt entfernen', fn: () => { s.pin = ''; this.save.write(); toast('Wegpunkt entfernt.'); back(); } }
        : { icon: '📍', label: 'Wegpunkt setzen', sub: 'Das GPS zeigt dir den Weg, auf dem Radar und in der Stadt', fn: () => { s.pin = p.id; this.save.write(); sfx('coin'); toast(`📍 Wegpunkt: ${p.name}. Folge der blauen Linie!`); close(); } },
      { icon: '🚋', label: 'Mit der Tram hin', sub: '2 € · 10 Minuten', fn: ride(2, false) },
      { icon: '🚌', label: 'Mit dem Bus hin (Linie 69)', sub: `${BUS_COST} € · ${BUS_MIN} Minuten · unterwegs erzählt dir jemand was`, fn: ride(BUS_COST, true) },
      { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
  }

  /** Quiz im Handy: Hilde fragt, Antwort wählen, danach Auflösung; Belohnung einmal am Tag */
  private quiz(qs: Q[], i: number, right: number) {
    const s = this.save.data, back = () => this.phone('wissen');
    const frame = (body: string) => `<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>Quiz ${Math.min(i + 1, qs.length)}/${qs.length}</b><span>✨ ${s.glitter}</span></div>${body}<div class="slot"></div></div>`;
    if (i >= qs.length) {
      const r = quizReward(s, right); this.save.write(); this.city.refreshHud();
      sfx(right === qs.length ? 'win' : 'ok');
      this.openMenu(frame(`<div class="pbody"><p><b>Hilde:</b> ${right === qs.length ? 'Alles richtig! Du hättest 1979 mit uns marschieren sollen.' : right ? 'Gut gemacht. Den Rest lernst du bestimmt noch.' : 'Macht nichts, Kindchen. Wissen wächst mit jedem Mal.'}</p><p>${right}/${qs.length} richtig${r.glitter ? ` · +${r.glitter} ✨ Glitzer · +${r.rep} Ruf` : ' · Belohnung gibt es einmal am Tag'}</p></div>`), [{ icon: '←', label: 'Zurück zu Wissen', fn: back }], back, 'phone');
      return;
    }
    const q = qs[i];
    this.openMenu(frame(`<div class="pbody"><p><b>Hilde fragt:</b><br>${esc(q.q)}</p></div>`), [
      ...q.a.map((a, k) => ({ icon: ['A', 'B', 'C'][k], label: a, fn: () => {
        const ok = k === q.ok; sfx(ok ? 'coin' : 'miss');
        this.openMenu(frame(`<div class="pbody"><p>${ok ? '✅ Richtig!' : `❌ Leider nicht. Richtig ist: <b>${esc(q.a[q.ok])}</b>`}</p><p>${esc(q.why)}</p></div>`), [{ icon: '▶', label: i + 1 < qs.length ? 'Nächste Frage' : 'Ergebnis', fn: () => this.quiz(qs, i + 1, right + (ok ? 1 : 0)) }], back, 'phone');
      } })),
      { icon: '←', label: 'Abbrechen', fn: back }], back, 'phone');
  }

  /* ---------- Pausenmenü ---------- */
  pauseMenu() {
    if (this.menuOpen || this.dialog.open) return;
    sfx('open');
    const s = this.save.data, gl = goal(s);
    const stickers = s.goals.filter((x) => x.startsWith('sticker')).length;
    this.touch.show(false);
    const back = () => { this.closeMenu(); this.touch.show(true); hints([['move', 'Laufen'], ['a', 'Aktion'], ['cam', 'Kamera'], ['y', 'Menü']]); };
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Pause</span></div><div class="slot"></div></div>
      <div class="side panel"><h3>${chapterLabel(s)}</h3><p><b style="color:#fff">${gl.title}</b><br>${gl.sub || ''}</p>
      <p>🌈 Pride-Sticker: ${stickers}/${STICKERS.length} · 🪩 Tanz-Rekord: ${s.best.dance || 0}<br>✨ Glitzer: ${s.glitter} · 💶 ${s.money} € · Ruf ${s.rep}</p></div>`, [
      { icon: '▶', label: 'Weiterspielen', fn: back },
      ...(this.where === 'home' ? [{ icon: '🚪', label: 'Wohnung verlassen', sub: 'Zurück auf die Straße', fn: () => { this.closeMenu(); this.leaveHome(); } }] : []),
      ...(this.where === 'inside' ? [{ icon: '🚪', label: 'Haus verlassen', sub: 'Zurück auf die Straße', fn: () => { this.closeMenu(); this.leaveInterior(); } }] : []),
      { icon: '📱', label: 'Handy', sub: 'Status, Ziele, Karte, Jobs, Kontakte', fn: () => this.phone() },
      { icon: '📖', label: 'Story', sub: 'Kapitel und Entscheidungen', fn: () => this.storyMenu(() => { this.closeMenu(); this.pauseMenu(); }) },
      { icon: '👗', label: 'Kleiderschrank', sub: 'Figur, Outfit und Pronomen', fn: () => this.fade(() => this.creator(true)) },
      { icon: '🌐', label: 'Online & Freunde', sub: this.city.friends.net.on ? `Verbunden · ${this.city.friends.list.length} in der Stadt` : 'Freund*innen einladen oder besuchen', fn: () => this.onlineMenu(() => { this.closeMenu(); this.pauseMenu(); }, back) },
      { icon: '⚙️', label: 'Optionen', fn: () => this.options(() => { this.closeMenu(); this.pauseMenu(); }) },
      { icon: '💾', label: 'Speichern', fn: () => { this.save.write(); toast('Gespeichert.'); } },
      { icon: '🏠', label: 'Titelbildschirm', sub: 'Speichert automatisch', fn: () => { this.save.write(); this.closeMenu(); this.where = 'city'; this.fade(() => this.title()); } },
    ], back);
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
  }

  storyMenu(back: () => void) {
    const s = this.save.data;
    const style: Record<string, string> = { loud: 'laut', creative: 'kreativ', diplomatic: 'diplomatisch' };
    const f = s.flags, pick = (v: unknown, m: Record<string, string>, t: string) => (v && m[v as string] ? `${t}: ${m[v as string]}` : '');
    const choices = [
      pick(f.feel, { excited: 'aufgeregt', nervous: 'nervös', ready: 'bereit' }, 'Ankunft'),
      pick(f.style, style, 'Weg fürs Regenbogenhaus'),
      pick(f.family, { music: 'Musik', cake: 'Kuchen', story: 'deine Geschichte' }, 'Mitbringsel für die Wahlfamilie'),
      f.drag ? `Drag-Name: ${f.drag}` : '',
      pick(f.rex, { friend: 'Freundschaft', dj: 'DJ im Leuchtturm', rival: 'Rivalität' }, 'Rex'),
      f.bar ? 'Eigener Club: Leuchtturm am Hafen' : '',
      pick(f.proof, { press: 'Presse', city: 'Bezirksamt', face: 'direkte Konfrontation' }, 'Beweise gegen Glanz'),
      pick(f.role, { speech: 'Rede', float: 'Club-Wagen', dance: 'Vortanzen' }, 'Rolle bei der Pride'),
      f.lfIntro ? `Leuchtfeuer: ${Math.min(lfPart(s), LF_CHAPTERS.length)}/${LF_CHAPTERS.length} Rückblenden · Leuchtkraft ${lfPct(lfGlow(s))} %${f.lfEnd ? ' · Ende „' + lfEnding(lfGlow(s)).title + '“' : ''}` : '',
      f.tarekCall ? `Tarek: ${f.tarekEnd ? 'frei, Fall abgeschlossen' : f.tarekFrei ? 'frei bis zum Prozess' : 'in U-Haft'}${(() => { const w = ways(s); return w.t + w.r ? ` · Ricos Weg ${w.r}× · Tareks Weg ${w.t}×` : ''; })()}${f.tarekOpen === true ? ' · offene Beziehung' : f.tarekOpen === false ? ' · exklusiv' : ''}` : '',
      f.lichtIntro ? `Ich bin das Licht: ${Math.min(lichtPart(s), LICHT_CHAPTERS.length)}/${LICHT_CHAPTERS.length} Rückblenden · Licht ${lichtLight(s)}${f.lichtEnd ? ' · Ende „' + lichtEnding(lichtLight(s)).title + '“' : ''}` : '',
    ].filter(Boolean);
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Story</span><small>Ein Leben in allen Farben</small></div><div class="slot"></div></div>
      <div class="side panel"><h3>Deine Entscheidungen</h3><p>${choices.length ? choices.join('<br>') : 'Noch keine – die Stadt merkt sich alles.'}</p></div>`,
    [...CHAPTERS.map((c) => ({ icon: c.n < s.chapter ? '✅' : c.n === s.chapter ? '⭐' : '🔒', label: `Kapitel ${c.n}: ${c.title}`, sub: c.n <= s.chapter ? c.text : 'Noch nicht freigespielt', disabled: c.n > s.chapter })),
      ...ACTS.slice(1).map((a) => { const now = act(s), done = now > a.n, open = now >= a.n; return { icon: done ? '✅' : open ? '⭐' : '🔒', label: `Akt ${ROMAN[a.n - 1]}: ${a.title}`, sub: !open ? (a.n === 5 ? 'Nach Akt IV' : a.n === 4 ? 'Nach der Pride der Inseln' : 'Nach der Pride in Rainbow City') : a.n === 5 ? `${a.text} · ${Math.min(crewStep(s), CREW_STEPS)}/${CREW_STEPS} · Crew ${crewOf(s).length}${done ? ' · Haller gefasst' : ''}` : a.n === 4 ? `${a.text} · ${flutDone(s)}/${FLUT.length} Missionen${done ? ' · Kral festgenommen' : ''}` : a.n === 2 ? `${a.text} · Hochstadt ${sagaDone(s)}/${MISSIONS.length} · Sterling Nights ${nachtDone(s)}/${NACHT.length}${owns(s, 'prisma') ? ' · Club Prisma gehört dir' : ''}` : `${a.text} · ${chain(s).length - islesLeft(s).length}/${chain(s).length} Inseln${done ? ' · gefeiert' : ''}`, disabled: !open }; }),
      ...(f.mode !== 'story' ? [{ icon: '📖', label: f.mode === 'frei' ? 'Story-Modus einschalten' : 'Story-Modus mit Tarek starten', sub: f.mode === 'frei' ? 'Tarek ruft an, Akte und Anrufe laufen ab hier weiter. Dein Fortschritt bleibt.' : 'Neu: Tarek sitzt unschuldig in U-Haft. Er ruft an, du holst ihn raus, ohne Zeitdruck. Dein Fortschritt bleibt.', fn: () => { f.mode = 'story'; this.save.write(); this.city.refreshHud(); toast('📖 Story-Modus an. Halt dein Handy bereit.'); this.storyMenu(back); } }]
        : TAREK_STEPS.map((st) => { const n = tarekDone(s), done = n > st.n, open = !!f.tarekCall && n >= st.n; return { icon: done ? '✅' : open ? '💞' : '🔒', label: `Gitter und Glitzer ${st.n + 1}: ${st.title}`, sub: open || done ? st.text : st.ch > s.chapter ? (st.ch > 5 ? 'Nach der Pride' : `Ab Kapitel ${st.ch}`) : 'Noch nicht freigespielt', disabled: !open && !done }; })),
      ...(s.chapter > 5 ? [{ icon: '🏁', label: 'Abspann ansehen', fn: () => this.ending(back) }] : []),
      ...HIST_ORDER.filter((k) => s.flags['hist_' + k]).map((k) => ({ icon: '🏳️‍🌈', label: `Damals · ${HISTORY[k].year}: ${HISTORY[k].title}`, sub: HISTORY[k].text })),
      { icon: '←', label: 'Zurück', fn: back }], back);
  }

  options(back: () => void) {
    const st = this.save.data.settings;
    const q = ['Automatisch', 'Niedrig', 'Mittel', 'Hoch'];
    const pct = (v: number) => Math.round(v * 100) + ' %';
    const step = (v: number, d: number) => Math.max(0, Math.min(1, Math.round((v + d) * 10) / 10));
    const set = () => { vol.music = st.music; vol.sfx = st.sfx; vol.vib = st.vib !== false; applyVolume(); this.engine.setQuality(st.quality); this.save.write(); };
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Optionen</span></div><div class="slot"></div></div>
      <div class="side panel" id="cloudSlot"><h3>☁️ Spielstand sichern</h3><p>Dein Fortschritt liegt auf diesem Gerät.</p></div>`, [
      { icon: '🎞️', label: 'Grafik', value: () => q[st.quality + 1], left: () => { st.quality = st.quality <= -1 ? 2 : st.quality - 1; set(); }, right: () => { st.quality = st.quality >= 2 ? -1 : st.quality + 1; set(); } },
      { icon: '🎵', label: 'Musik', value: () => pct(st.music), left: () => { st.music = step(st.music, -.1); set(); }, right: () => { st.music = step(st.music, .1); set(); } },
      { icon: '🔊', label: 'Effekte', value: () => pct(st.sfx), left: () => { st.sfx = step(st.sfx, -.1); set(); }, right: () => { st.sfx = step(st.sfx, .1); set(); } },
      { icon: '📳', label: 'Vibration', sub: 'Handy und Controller', value: () => (st.vib !== false ? 'An' : 'Aus'), left: () => { st.vib = st.vib === false; set(); }, right: () => { st.vib = st.vib === false; set(); } },
      { icon: '🎥', label: 'Kamera-Tempo', value: () => st.camSpeed.toFixed(1) + '×', left: () => { st.camSpeed = Math.max(.4, +(st.camSpeed - .2).toFixed(1)); set(); }, right: () => { st.camSpeed = Math.min(2.4, +(st.camSpeed + .2).toFixed(1)); set(); } },
      { icon: '↕️', label: 'Kamera umkehren', value: () => (st.invertY ? 'An' : 'Aus'), left: () => { st.invertY = !st.invertY; set(); }, right: () => { st.invertY = !st.invertY; set(); } },
      { icon: '🍂', label: 'Jahreszeit', sub: 'Kalender = echte Jahreszeit, Weihnachten und Silvester zu ihrer Zeit', value: () => { const p = seasonPick(); return p === 'auto' ? `Kalender (${SEASONS[season()].name})` : p === 'xmas' ? 'Weihnachten' : p === 'silvester' ? 'Silvester' : SEASONS[p as Season].name; },
        left: () => this.cycleSeason(-1), right: () => this.cycleSeason(1) },
      { icon: '🔞', label: 'Inhalte ab 18', sub: 'Flirts, Vorlieben, angedeutete Nächte – Gesundheitsinfos sind immer an', value: () => (st.adult ? 'An' : 'Aus'), left: () => this.toggleAdult(back), right: () => this.toggleAdult(back), fn: () => this.toggleAdult(back) },
      { icon: '⛶', label: 'Vollbild', sub: 'Ein- oder ausschalten', fn: () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {}); } },
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
    const slot = this.overlay?.querySelector('#cloudSlot'), cm = document.getElementById('cloudMount');
    if (slot && cm) { cm.classList.remove('hidden'); slot.appendChild(cm); }
    hints([['dpad', 'Wählen'], ['lr', 'Ändern'], ['b', 'Zurück']]);
  }

  /** Jahreszeit in den Optionen: Kalender, die vier Jahreszeiten, Weihnachten oder Silvester */
  private cycleSeason(d: number) {
    const o = ['auto', 'fruehling', 'sommer', 'herbst', 'winter', 'xmas', 'silvester'], f = this.save.data.flags;
    const i = Math.max(0, o.indexOf(String(f.season || 'auto')));
    f.season = o[(i + d + o.length) % o.length]; useSeason(f.season); this.save.write();
  }

  /** 18+ einschalten nur mit Bestätigung, ausschalten jederzeit */
  private toggleAdult(back: () => void) {
    const st = this.save.data.settings;
    if (st.adult) { st.adult = false; this.save.write(); toast('Inhalte ab 18 ausgeschaltet.'); this.options(back); return; }
    this.openMenu('<div class="col"><div class="panel"><h3>🔞 Inhalte ab 18</h3><p>Pride City zeigt dann Flirts, Szene-Begriffe und Vorlieben als Text und deutet intime Szenen an (Abblende, keine Nacktheit). Alle Figuren sind erwachsen, Zustimmung ist immer Pflicht, Safer Sex gehört dazu.</p><p>Bist du mindestens 18 Jahre alt?</p><div class="slot"></div></div></div>', [
      { icon: '✅', label: 'Ja, ich bin 18 oder älter', fn: () => { st.adult = true; this.save.write(); toast('Inhalte ab 18 eingeschaltet.'); this.options(back); } },
      { icon: '←', label: 'Nein, zurück', fn: () => this.options(back) },
    ], () => this.options(back));
  }

  minigames(back: () => void) {
    const b = this.save.data.best;
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Minispiele</span><small>In 3D, mit Rekorden</small></div><div class="slot"></div></div>`, [
      { icon: '🪩', label: 'Tanz-Battle', sub: `Club Prisma gegen Rex · Rekord ${b.dance || 0}`, fn: () => this.goDance(false, back) },
      { icon: '🎤', label: 'Lady Lumas Drag-Show', sub: 'Buch-Hymne oder Klaviersongs aus Klavierlicht', fn: () => this.showMenu((o) => this.goDance(false, back, o)) },
      ...MINIS.map((m) => { const ad = !!this.save.data.settings.adult; return { icon: miniIcon(m, ad), label: miniName(m, ad), sub: `${miniSub(m, ad)} · Rekord ${b['mini_' + m.id] || 0}`, disabled: !!m.adultOnly && !ad, fn: () => this.playMini(m.id, { back: () => this.minigames(back), title: true }) }; }),
      { icon: '🕹️', label: 'Gay Life! Originale', sub: 'Alle 14 Minispiele aus Gay Life! in 2D', fn: () => this.roman('gaylife', '', () => this.minigames(back)) },
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
  }

  credits() {
    this.openMenu(`<div class="col"><div class="panel" style="max-height:70dvh;overflow:auto"><h3>Mitwirkende</h3>
      <p><b style="color:#fff">Pride City</b> – Relaunch von Gay Life! für easygames.</p>
      <p>Menschen (CC BY 4.0, creativecommons.org/licenses/by/4.0, von Sketchfab, für Pride City mit Skelett versehen, verkleinert und teils umgefärbt): <b style="color:#fff">„Citizen NPC Pack 1 Character Lowpoly Mobile“</b> von 00amza · <b style="color:#fff">„Gangster Rigged“</b> von PropShop · <b style="color:#fff">„Street Gangster | Realistic 3D Character Model“</b> von PropShop · <b style="color:#fff">„Yakuza“</b> von Abrazafarolas.</p>
      <p>Autos (CC BY 4.0, Sketchfab, geteilt, verkleinert und teils umgefärbt): <b style="color:#fff">„Generic passenger car pack“</b> von Comrade1280 · <b style="color:#fff">„Fairheaven LT '80 Cop Cruiser“</b> und <b style="color:#fff">„Saba V12 '95 Interceptor“</b> von Daniel Zhabotinsky.</p>
      <p>Animationen, Uniformen, Kinder und Sport-Körper: <b style="color:#fff">Microsoft Rocketbox</b> – MIT-Lizenz (© 2020 Microsoft Corporation, github.com/microsoft/Microsoft-Rocketbox). Stadt und Wohnung: <b style="color:#fff">KayKit</b> von Kay Lousberg (City Builder Bits, Furniture Bits, Restaurant Bits) – CC0 1.0. In Pride-Farben umgefärbt.</p>
      <p>Oberflächen (Asphalt, Gehwegplatten, Backstein, Sand, Rasen; CC0 1.0): <b style="color:#fff">Poly Haven</b> (asphalt_02, brick_4, coast_sand_01) und <b style="color:#fff">ambientCG</b> (PavingStones038, Grass001, Hausfassaden Facade018–020), verkleinert; Nachtfenster daraus abgeleitet. Wasserwellen selbst erzeugt.</p>
      <p>3D: Babylon.js (Apache 2.0). Musik und Klänge werden live im Spiel erzeugt.</p>
      <p>Alle Figuren sind frei erfunden. Wer flirtet oder datet, ist erwachsen; Kinder gibt es nur als Familienmitglieder. Zustimmung zählt.</p><div class="slot"></div></div></div>`,
    [{ icon: '←', label: 'Zurück', fn: () => this.title() }], () => this.title());
  }

  /** Aufträge eines Treffpunkts (treff.ts) im Ortsmenü */
  private treffItems(place: 'sauna' | 'beach', close: () => void): Item[] {
    const s = this.save.data;
    if (this.where === 'inside' && this.insideWorld) return [];
    const night = hour(s) >= 21 || hour(s) < 5, run = this.city.gig;
    return [...placeGigs(place).map((g) => ({ icon: s.flags['tg_' + g.id] ? '✅' : g.night ? '🌙' : '📞', label: `Auftrag: ${g.title}`, sub: run ? `läuft schon: ${run.g.title}` : g.night && !night ? 'nur nachts (21–5 Uhr)' : s.flags['gig_' + g.id] === s.day ? 'heute schon erledigt' : `${g.pay} € · +${g.rep} Ruf · ${fmtTime(g.time)} Min.${g.car ? ' · mit Auto leichter' : ''}`,
      disabled: !!run || (g.night && !night) || s.flags['gig_' + g.id] === s.day,
      fn: () => { close(); this.dialog.say([{ who: g.who, color: g.color, text: g.call }], () => this.city.startGig({ ...g, after: () => {
        const reg = treffDone(s, g); pcEvents.emit('treffAuftrag', { place, id: g.id });
        if (reg) setTimeout(() => this.hud.banner(place === 'sauna' ? '🧖 Stammgast im Heißen Stein' : '🏖️ Stammgast in der Sandbank', place === 'sauna' ? 'Massage günstiger, Torsten kennt deinen Namen. Ruf +2' : 'Bruno hat einen Liegestuhl mit deinem Namen. Ruf +2', 'good', 5000), 2500);
        this.save.write(); } })); } })),
      { icon: regular(s, place) ? '⭐' : '☆', label: regular(s, place) ? 'Stammgast' : 'Stammgast werden', sub: `${placeGigs(place).filter((g) => s.flags['tg_' + g.id]).length}/${placeGigs(place).length} Aufträge geschafft`, disabled: true, fn: () => undefined }];
  }
  /** Tuning-Werkstatt für den eigenen Wagen: erst Bereich wählen, dann Teil (sichtbar in der Stadt) */
  workshop(slot?: Slot) {
    const s = this.save.data, cur = readPimp(s), close = () => { this.closeMenu(); this.touch.show(true); };
    this.touch.show(false);
    if (!slot) {
      this.openMenu(`<div class="col"><div class="panel"><h3>🛠️ Tuning-Werkstatt</h3><p>Rosi schraubt alles an deinen Wagen, was die Stadt zum Staunen bringt. Hydraulik hüpft beim Hupen, Neon leuchtet nachts am schönsten.</p><div class="slot"></div></div></div>`,
        SLOTS.map((q) => { const p = part(q.id, cur[q.id]); return { icon: p.icon, label: q.title, sub: p.name, fn: () => this.workshop(q.id) }; }), () => { close(); this.placeMenu('garage'); });
      return;
    }
    const sl = SLOTS.find((q) => q.id === slot)!;
    this.openMenu(`<div class="col"><div class="panel"><h3>🛠️ ${sl.title}</h3><p>${sl.ask} Du hast ${s.money} €.</p><div class="slot"></div></div></div>`,
      workshopItems(cur, slot, s.money, (id) => { const why = buyPart(s, slot, id); if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(`🛠️ Eingebaut: ${part(slot, id).name}`); this.save.write(); this.city.refreshHud(); void this.city.placeOwnCar(true); this.workshop(); }),
      () => this.workshop());
  }
  placeMenu(id: string) {
    const s = this.save.data;
    if (id === 'flug') { this.city.talkTo('sunny'); return; }
    const close = () => { this.closeMenu(); this.touch.show(true); };
    const buy = (cost: number, msg: string, fx: () => void) => () => { if (s.money < cost) { toast('Nicht genug Geld.'); sfx('miss'); return; } s.money -= cost; fx(); toast(msg); sfx('coin'); this.city.refreshHud(); close(); };
    const eat = (fx: Parameters<typeof change>[1], goal?: string) => () => { change(s, fx); if (goal) this.done(track(s, goal)); };
    const P: Record<string, { t: string; d: string; items: Item[] }> = {
      cafe: { t: 'Café Kaffeeklatsch', d: 'Mo macht den besten Hafer-Cappuccino der Stadt.', items: [
        { icon: '☕', label: 'Cappuccino', sub: '3 € · +12 Energie · ☕ 2 Std. hellwach · +1 Ruf beim ersten Mal am Tag', fn: buy(3, 'Lecker! Mo zwinkert dir zu. ☕ Hellwach: 2 Stunden rennen ohne Müdigkeit.', () => { eat({ energy: 12, fun: 2 }, 'coffee')(); giveBuff(s, 'kaffee'); if (s.flags.coffee !== s.day) { s.rep++; s.flags.coffee = s.day; } }) },
        { icon: '🥗', label: 'Power-Bowl', sub: '7 € · +30 Hunger · 🥗 4 Std. mehr Puste beim Rennen', fn: buy(7, 'Quinoa, Avocado, Kichererbsen. 🥗 Power-Bowl: 4 Stunden mehr Puste.', () => { eat({ hunger: 30 }, 'eat')(); giveBuff(s, 'bowl'); }) },
        { icon: '🍰', label: 'Regenbogenkuchen', sub: '5 € · +20 Hunger · +6 Spaß', fn: buy(5, 'Sechs Schichten Glück.', eat({ hunger: 20, fun: 6 }, 'eat')) },
        { icon: '💬', label: 'Mit Gästen plaudern', sub: '30 Minuten · +14 Kontakte', fn: () => { close(); this.fade(() => { this.pass(30); change(s, { social: 14, fun: 4 }); this.save.write(); toast('Nette Leute hier. ☕'); }); } }] },
      spaeti: { t: 'Späti Lecker', d: 'Bruno hat alles, was man nachts braucht.', items: [
        { icon: '🥨', label: 'Brezel', sub: '2 € · +15 Hunger', fn: buy(2, 'Frisch und warm.', eat({ hunger: 15 }, 'eat')) },
        { icon: '🧃', label: 'Mate', sub: '3 € · +15 Energie · ⚡ 90 Min. schneller sprinten', fn: buy(3, 'Energie für die Nacht! ⚡ Mate-Kick: 90 Minuten schneller sprinten.', () => { eat({ energy: 15 })(); giveBuff(s, 'mate'); }) },
        { icon: '🥙', label: 'Falafel-Dürüm', sub: '5 € · +35 Hunger · 🥙 3 Std. satt & stark (kräftigere Schläge)', fn: buy(5, 'Bruno legt extra Soße drauf. 🥙 Satt & stark für 3 Stunden.', () => { eat({ hunger: 35 }, 'eat')(); giveBuff(s, 'doener'); }) },
        { icon: '🎈', label: 'Kondome (3 Stück)', sub: `3 € · du hast ${s.inv.condom || 0}`, fn: buy(3, 'Safer Sex ist sexy. 🎈', () => { s.inv.condom = (s.inv.condom || 0) + 3; }) },
        { icon: '💧', label: 'Gleitgel', sub: `4 € · du hast ${s.inv.lube || 0}`, fn: buy(4, 'Gleitgel eingepackt. 💧', () => { s.inv.lube = (s.inv.lube || 0) + 1; }) },
        { icon: '🦴', label: 'Hundeleckerli (5 Stück)', sub: `2 € · für die Hunde in der Stadt (du hast ${s.inv.treat || 0})`, fn: buy(2, 'Die Hunde der Stadt werden dich lieben. 🐶', () => { s.inv.treat = (s.inv.treat || 0) + 5; }) },
        ...(myCar(s) && !myCar(s)!.fly ? [{ icon: '⛽', label: 'Reservekanister für deinen Wagen', sub: `8 € · +${TANK.can} % · jetzt ${tankOf(s)} %`, disabled: tankOf(s) >= 100, fn: buy(8, `⛽ Kanister eingefüllt. Tank: ${Math.min(100, tankOf(s) + TANK.can)} %`, () => { s.flags.tank = Math.min(100, tankOf(s) + TANK.can); }) }] : []),
        { icon: '🥕', label: 'Lebensmittel', sub: `6 € · 3 Portionen zum Kochen (du hast ${s.food})`, fn: buy(6, 'Ab in den Kühlschrank damit.', () => { s.food += 3; }) }] },
      club: { t: 'Club Prisma', d: 'Neon, Bass und die beste Tanzfläche der Stadt.', items: [
        { icon: '🪩', label: 'Tanz-Battle', sub: `Rekord ${s.best.dance || 0}`, fn: () => this.goDance(false) },
        { icon: '🍹', label: 'Drink an der Bar', sub: '6 € · +10 Spaß · +8 Kontakte', fn: buy(6, 'Prost! 🍹', eat({ fun: 10, social: 8, energy: -3 })) }] },
      center: { t: 'Regenbogenhaus', d: 'Beratung, Jugendgruppe, Kaffee und Kummer – seit dreißig Jahren.', items: [
        { icon: '💜', label: 'Spenden', sub: '10 € · +2 Ruf', fn: buy(10, 'Danke! Jedes bisschen hilft.', () => { s.rep += 2; }) },
        ...(s.flags.engaged && !s.flags.spouse ? [{ icon: '💒', label: `Hochzeit mit ${fiance(s)?.name}`, sub: canWed(s) || `${WEDDING} € · Trauung im Saal, Party mit allen · +5 Ruf`, disabled: !!canWed(s), fn: () => { close(); this.wedding(); } }] : []),
        ...(s.flags.spouse ? [{ icon: '👶', label: s.flags.kid ? `${s.flags.kid} geht es gut` : 'Adoption beantragen', sub: canAdopt(s) || `${ADOPT} € · Beratung, Kurs, Hausbesuch · Kind kommt nach ein paar Tagen`, disabled: !!canAdopt(s), fn: () => this.adoption(close) }] : [])] },
      boutique: { t: 'Boutique Fabelhaft', d: 'Glitzer, Leder, Regenbogen – hier findest du deinen Look.', items: [
        { icon: '👗', label: 'Neuer Look', sub: 'Zum Kleiderschrank', fn: () => this.fade(() => this.creator(true)) },
        ...bodyItems(this, () => this.placeMenu('boutique')),
        ...(this.city.combat?.wanted.stars ? [{ icon: '🕶️', label: 'Undercover-Umstyling', sub: `${60 * this.city.combat.wanted.stars} € · Perücke, Sonnenbrille – die Polizei erkennt dich nicht mehr`, fn: buy(60 * this.city.combat.wanted.stars, 'Neuer Look, neues Glück. Die Fahndung ist weg! 🕶️', () => this.city.combat.wanted.clear()) }] : []),
        { icon: '💍', label: 'Verlobungsring', sub: `${RING} € · Regenbogen-Gold · du hast ${s.inv.ring || 0}`, fn: buy(RING, 'Ein Ring mit Regenbogen-Steinen. Jetzt fehlt nur noch die Frage … 💍', () => { s.inv.ring = (s.inv.ring || 0) + 1; }) },
        ...(s.settings.adult ? [{ icon: '🔞', label: 'Hinterzimmer-Ecke', sub: 'Dildos S bis XXL, Fleshlight, Penisring, Kondome in jeder Größe', fn: () => this.toyShop() }] : []),
        ...(s.settings.adult ? [{ icon: '🍆', label: 'Toy aus der Hinterzimmer-Ecke', sub: `25 € · diskret verpackt · du hast ${s.inv.toy || 0}`, fn: buy(25, 'Diskret verpackt. Viel Spaß! 😏', () => { s.inv.toy = (s.inv.toy || 0) + 1; change(s, { fun: 10 }); }) }] : [])] },
      gym: { t: 'Muckibude Muskelkater', d: 'Bären, Twinks und alle dazwischen – hier schwitzt die ganze Szene.', items: [
        ...gymItems(this, close),
        { icon: '🥤', label: 'Protein-Shake', sub: '4 € · +15 Hunger · 🥤 3 Std. Training wirkt 50 % stärker', fn: buy(4, 'Vanille-Erdnuss. 🥤 Protein-Boost: 3 Stunden.', () => { eat({ hunger: 15 })(); giveBuff(s, 'shake'); }) },
        { icon: '🚿', label: 'Duschen', sub: '1 € · Hygiene voll', fn: buy(1, 'Frisch!', () => { this.pass(15); change(s, { hygiene: 100 }); this.done(track(s, 'shower')); }) }] },
      checkpoint: { t: 'Checkpoint Regenbogen', d: 'Beratung, Tests und PrEP – anonym, ohne Urteil, mit Gummibärchen.', items: [
        { icon: '🧪', label: 'HIV- und STI-Test', sub: `kostenlos · 30 Minuten · ${s.health.test ? 'letzter Test: Tag ' + s.health.test : 'noch nie getestet'}${symptoms(s).length ? ' · ⚠️ Beschwerden' : ''}`, fn: () => { close(); this.fade(() => { this.pass(30); s.health.test = s.day; change(s, { fun: 3 }); const r = testAndTreat(s); this.save.write(); this.city.refreshHud(); const C = (text: string) => ({ who: 'Checkpoint', color: '#3ee69a', text });
          const lines = r.found.length ? [C(`Dein Ergebnis: ${r.found.map((d) => d.icon + ' ' + d.name).join(', ')}. Kein Grund zur Scham – das ist häufig und gut behandelbar.`), ...r.found.map((d) => C(`${d.name}: ${d.cure}. In ${d.cureDays} ${d.cureDays === 1 ? 'Tag' : 'Tagen'} ausgeheilt. Bis dahin kein Sex, und sag deinen letzten Partner*innen Bescheid.`))] : [C('Alles negativ. 💚 Bleib dran: regelmäßig testen ist das beste Safer-Sex-Werkzeug.')];
          if (r.pep) lines.push(C('Und weil das ungeschützte Mal weniger als 72 Stunden her ist und du keine PrEP nimmst: Hier ist deine PEP. Vier Wochen Tabletten, dann ein Kontrolltest.'));
          if (r.hivNew) lines.push(C('Der HIV-Test ist reaktiv. Atme durch: HIV ist heute gut behandelbar. Du startest heute die Therapie, in wenigen Tagen bist du unter der Nachweisgrenze – dann ist HIV nicht mehr übertragbar (U=U), und du lebst so lange wie alle anderen.'));
          if (s.flags.hiv && !r.hivNew) lines.push(C(hivUU(s) ? 'Deine HIV-Therapie wirkt: unter der Nachweisgrenze. U=U – nicht übertragbar. 💚' : 'Deine HIV-Therapie läuft. Bald bist du unter der Nachweisgrenze.'));
          this.dialog.say(lines); }); } },
        ...(s.settings.adult ? [{ icon: '🦠', label: 'STI-Infos', sub: inTreatment(s).length ? `in Behandlung: ${inTreatment(s).map((d) => d.name).join(', ')}` : 'Chlamydien, Tripper, Syphilis, PEP, Doxy-PEP', fn: () => { close(); this.dialog.say(STI_INFO.map(([t, x]) => ({ who: t, color: '#3ee69a', text: x }))); } }] : []),
        { icon: '💊', label: s.health.prep ? 'PrEP beenden' : 'PrEP beginnen', sub: 'Tablette, die vor HIV schützt · Beratung gratis', fn: () => { s.health.prep = !s.health.prep; if (s.health.prep && s.health.test !== s.day) toast('Vor dem Start gehört ein HIV-Test dazu – mach ihn gleich mit!'); else toast(s.health.prep ? 'PrEP läuft. Regelmäßig testen nicht vergessen! 💊' : 'PrEP beendet.'); this.save.write(); close(); } },
        { icon: '🎈', label: 'Gratis Kondome', sub: '3 Stück, einmal am Tag', fn: () => { if (s.flags.freeCondoms === s.day) { toast('Für heute hast du schon welche.'); return; } s.flags.freeCondoms = s.day; s.inv.condom = (s.inv.condom || 0) + 3; toast('Drei Kondome eingesteckt. 🎈'); sfx('coin'); close(); } },
        { icon: 'ℹ️', label: 'Infos: U=U, PrEP, PEP, Safer Sex', fn: () => { close(); this.dialog.say(HEALTH_INFO.map(([t, x]) => ({ who: t, color: '#3ee69a', text: x }))); } }] },
      studio: { t: 'Studio Klappe Auf', d: s.settings.adult ? 'Fotostudio für Pässe, Paare und Pride-Plakate. Hinten, hinter der roten Tür: die Nachtschicht für Filme ab 18.' : 'Fotostudio für Pässe, Paare und Pride-Plakate.', items: s.settings.adult ? [
        { icon: '🎬', label: s.flags.drehCast ? 'Nachtschicht: Dreh am Set' : 'Nachtschicht: Casting', sub: s.flags.drehCast ? `${s.flags.drehDay === s.day ? 'heute schon gedreht' : 'ein Dreh pro Tag · Test nicht älter als 14 Tage'} · ${stand(s, karriere('dreh')!)}` : 'Erwachsenen-Darsteller*in werden · Regeln, Tests, Absprachen', fn: () => dreh(this) }] : [] },
      kopfkino: { t: 'Videothek Kopfkino', d: s.settings.adult ? 'Neonlicht, Samtvorhang und ein Regal für Erwachsene. Hinten die Kabinen.' : 'Filme für jeden Geschmack. Der hintere Bereich ist nur ab 18.', items: s.settings.adult ? [
        { icon: '📼', label: 'Film ausleihen', sub: '5 € · Titel und Cover nur als Text', fn: () => this.rentFilm() },
        { icon: '🚪', label: 'Kabinen', sub: '3 € · Klopfzeichen gilt als Frage, Antwort abwarten', fn: () => this.cabin() },
        { icon: '🎈', label: 'Kondomautomat', sub: `1 € · du hast ${s.inv.condom || 0}`, fn: buy(1, 'Klack – ein Kondom. 🎈', () => { s.inv.condom = (s.inv.condom || 0) + 1; }) }] : [
        { icon: '🎬', label: 'Komödie ausleihen', sub: '3 € · +10 Spaß', fn: buy(3, 'Popcorn-Abend! 🍿', eat({ fun: 10 })) },
        { icon: '🔞', label: 'Hinterer Bereich', sub: 'nur mit „Inhalte ab 18“', fn: () => { close(); this.adultOnly('Videothek Kopfkino'); } }] },
      rosa: { t: 'Haus Rosa', d: s.settings.adult ? 'Rotes Licht, freundliche Türsteherin. Sexarbeit ist Arbeit – hier mit Respekt.' : 'Ein Haus mit rotem Licht. Nur für Erwachsene.', items: s.settings.adult ? [
        { icon: '🏮', label: 'Eintreten', sub: 'Wer arbeitet heute?', fn: () => this.rosa() }] : [
        { icon: '🔞', label: 'Eintreten', sub: 'nur mit „Inhalte ab 18“', fn: () => { close(); this.adultOnly('Haus Rosa'); } }] },
      park: { t: 'Regenbogenpark', d: 'Bäume, Wasserturm und Bänke. Nachts hat der Park ein zweites Leben.', items: [
        { icon: '🚶', label: 'Spazieren gehen', sub: '30 Minuten · +8 Spaß, +5 Energie', fn: () => { close(); this.fade(() => { this.pass(30); change(s, { fun: 8, energy: 5 }); this.save.write(); toast('Frische Luft tut gut. 🌳'); }); } },
        ...(s.settings.adult ? [{ icon: '🌙', label: 'Cruising', sub: isLateNight(hour(s)) ? 'Blicke, Nicken, Büsche – nur mit Zustimmung und Kondom' : 'erst ab 22 Uhr', disabled: !isLateNight(hour(s)), fn: () => this.cruising() }] : [])] },
      tram: { t: 'Tram Rainbow City', d: 'Für 2 € in zehn Minuten an jeden Ort – auch raus ins Hafenviertel.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
      police: { t: 'Polizeiwache Mitte', d: 'Freund und Helfer – mit eigener Ansprechperson für queere Menschen.', items: [
        ...(this.city.combat?.wanted.stars ? [{ icon: '💶', label: 'Stellen und Bußgeld zahlen', sub: `${this.city.combat.wanted.fines + this.city.combat.wanted.stars * 10} € · Fahndung sofort vorbei`, fn: buy(this.city.combat.wanted.fines + this.city.combat.wanted.stars * 10, 'Bußgeld bezahlt. Akte zu, Glitzer bleibt. 🚓', () => this.city.combat.wanted.clear()) }] : []),
        { icon: '⚖️', label: 'Gesetze von Rainbow City', sub: 'Was die Polizei verfolgt', fn: () => { close(); this.dialog.say(Object.values(LAWS).map((l) => ({ who: 'Kommissarin Yıldız', color: '#5b86d6', text: `${l.name}: ${'★'.repeat(l.stars)} · Bußgeld ${l.fine} €` })).concat([{ who: 'Kommissarin Yıldız', color: '#5b86d6', text: 'Wer Sterne hat, wird verfolgt. Abhängen geht, wenn dich lange keine Streife sieht – oder du stellst dich hier und zahlst.' }])); } },
        { icon: '🗣️', label: 'Ansprechperson LSBTIQ*', sub: 'Beratung bei Anfeindungen', fn: () => { close(); this.dialog.say([
          { who: 'Kommissarin Yıldız', color: '#5b86d6', text: 'Ich bin hier die Ansprechperson für LSBTIQ*. Wenn dich jemand beleidigt, bedroht oder angreift: Komm vorbei oder ruf 110 an.' },
          { who: 'Kommissarin Yıldız', color: '#5b86d6', text: 'Hassgewalt gehört angezeigt – auch wenn es „nur“ Worte waren. Das Regenbogenhaus begleitet dich, wenn du magst.' }]); } },
        ...(s.chapter === 4 && s.step >= 2 ? [{ icon: '📄', label: 'Anzeige gegen Glanz Immobilien', sub: 'Einschüchterung melden · +3 Ruf', disabled: !!s.flags.anzeige, fn: () => { s.flags.anzeige = true; s.rep += 3; toast('Anzeige aufgenommen. Die Polizei ermittelt. 🚓'); this.save.write(); close(); } }] : [])] },
      fire: { t: 'Feuerwache Regenbogen', d: 'Löschzug, Drehleiter und eine Kaffeemaschine, die nie ausgeht.', items: [
        { icon: '🚒', label: 'Tag der offenen Tür', sub: '1 Stunde · +12 Spaß · +2 Ruf (einmal am Tag)', fn: () => { if (s.flags.fireDay === s.day) { toast('Heute warst du schon da.'); return; } close(); this.fade(() => { s.flags.fireDay = s.day; this.pass(60); change(s, { fun: 12, social: 8 }); s.rep += 2; this.save.write(); toast('Einmal Drehleiter fahren – check! 🚒'); }); } },
        { icon: '🔥', label: 'Tipps zum Brandschutz', fn: () => { close(); this.dialog.say([{ who: 'Feuerwehr', color: '#ff4b3b', text: 'Rauchmelder in jedes Schlafzimmer, einmal im Monat testen. Kerzen nie unbeaufsichtigt – auch nicht beim Date. 😉' }, { who: 'Feuerwehr', color: '#ff4b3b', text: 'Notruf 112: Wo ist es? Was ist passiert? Wie viele Verletzte? Warten auf Rückfragen.' }]); } }] },
      onelove: { t: 'One Love Bar', d: 'Ein Herz über der Tür, das nicht ausgeht. Hier tritt Lady Luma auf – und hier erzählt Leon seine Geschichte.', items: [
        { icon: '✨', label: 'Leons Geschichte', sub: s.chapter < 2 ? 'ab Kapitel 2' : lichtPart(s) >= LICHT_CHAPTERS.length ? `erlebt · Ende „${lichtEnding(lichtLight(s)).title}“` : `Rückblende ${lichtPart(s) + 1}/${LICHT_CHAPTERS.length} · Licht ${lichtLight(s)}`, disabled: s.chapter < 2, fn: () => { close(); this.city.talkTo('leon'); } },
        { icon: '🎤', label: 'Lady Lumas Drag-Show spielen', sub: (s.flags.lichtEnd || lichtPart(s) >= 5) ? 'Buch-Hymne oder Klaviersongs · +Spaß · +Ruf' : 'ab Leons 5. Rückblende', disabled: !(s.flags.lichtEnd || lichtPart(s) >= 5), fn: () => { close(); this.showMenu((o) => this.goDance(false, undefined, o)); } },
        { icon: '👨', label: s.flags.playAs === 'leon' ? 'Wieder du selbst sein' : 'Als Leon Sommer spielen', sub: 'Leon als Mann, wie im Roman', disabled: s.chapter < 2, fn: () => { close(); this.playAs(s.flags.playAs === 'leon' ? '' : 'leon'); } },
        { icon: '👑', label: s.flags.playAs === 'luma' ? 'Abschminken – wieder du selbst' : 'Als Lady Luma spielen', sub: 'Leon in Drag: Glitzer, Perücke, Lichtumhang', disabled: !(s.flags.lichtEnd || lichtPart(s) >= 5), fn: () => { close(); this.playAs(s.flags.playAs === 'luma' ? '' : 'luma'); } },
        { icon: '🍸', label: 'Drink an der Bar', sub: '5 € · +8 Spaß · +6 Kontakte', fn: buy(5, 'Velvet schiebt dir das Glas rüber. 🍸', eat({ fun: 8, social: 6 })) },
        { icon: '📖', label: 'Den Roman lesen', sub: '„Ich bin das Licht“ von RicoReWi', fn: () => { close(); this.book(); } }] },
      garage: (() => {
        const mine = myCar(s), tl = tuneLevel(s), hue = s.flags.carHue === undefined ? -1 : Number(s.flags.carHue), pi = Math.max(0, PAINTS.findIndex((q) => q[2] === hue)), np = PAINTS[(pi + 1) % PAINTS.length];
        const done = (why: string | null, ok: string, after?: () => void) => { if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(ok); after?.(); this.save.write(); this.city.refreshHud(); close(); this.placeMenu('garage'); };
        return { t: 'Garage Schraubenschlüssel', d: `Meisterin Rosi schraubt an allem, was Räder hat. ${mine ? `Dein Wagen: ${mine.icon} ${mine.name}${tl ? ` · Turbo-Stufe ${tl}` : ''}. Er wartet dort, wo du ihn abgestellt hast.` : 'Kauf dir deinen ersten eigenen Wagen: Niemand hält dich dann mehr für einen Autodieb.'}`, items: [
          { icon: '🎬', label: 'TV-Show „Aufgemotzt!“', sub: `Folge ${episode(s) + 1} · ${clientFor(s).name} bringt eine Rostlaube · Honorar + Ruf`, fn: () => { close(); void this.city.show.start(); } },
          ...(mine && !mine.fly ? [{ icon: '🛠️', label: 'Tuning-Werkstatt', sub: 'Felgen, Neon, Hydraulik, Bass, Extras für deinen Wagen', fn: () => { close(); this.workshop(); } }] : []),
          ...(mine ? [
            ...(!mine.fly ? [{ icon: '⛽', label: tankOf(s) >= 100 ? 'Tank ist voll' : 'Volltanken und Ölwechsel', sub: `${TANK.price(s)} € · Tank jetzt ${tankOf(s)} %`, disabled: tankOf(s) >= 100, fn: () => done(s.money < TANK.price(s) ? 'Nicht genug Geld.' : null, '⛽ Vollgetankt! Rosi poliert noch schnell die Scheibe.', () => { s.money -= TANK.price(s); s.flags.tank = 100; }) }] : []),
            { icon: '🅿️', label: 'Wagen vor die Garage holen', sub: 'Rosi fährt ihn dir vor', fn: () => { close(); void this.city.placeOwnCar(true).then(() => toast(`${mine.icon} ${mine.name} steht vor der Garage.`)); } },
            { icon: np[1], label: `Umlackieren: ${np[0]}`, sub: `${PAINT_COST} € · jetzt ${PAINTS[pi][0]}`, fn: () => done(buyPaint(s, np[2]), `Frisch lackiert: ${np[0]}!`, () => void this.city.placeOwnCar(true)) },
            { icon: '🚀', label: tl >= TUNE_COST.length ? 'Turbo voll ausgebaut' : `Turbo-Stufe ${tl + 1} einbauen`, sub: tl >= TUNE_COST.length ? `Spitze ${Math.round(stats(mine, tl).turbo * 3.6)} km/h` : `${TUNE_COST[tl]} € · +7 % Tempo, besserer Antritt`, disabled: tl >= TUNE_COST.length, fn: () => done(buyTune(s), 'Der Turbo pfeift! 🚀') }] : []),
          ...SHOP.map((c) => ({ icon: c.icon, label: ownsCar(s, c.id) ? (mine?.id === c.id ? `${c.name} ✓` : `${c.name} nehmen`) : `${c.name} kaufen`, sub: `${ownsCar(s, c.id) ? 'gehört dir' : c.price + ' €'} · Spitze ${Math.round(c.turbo * 3.6)} km/h${c.cargo ? ' · Ladefläche' : ''}`, disabled: mine?.id === c.id,
            fn: () => { if (ownsCar(s, c.id)) { s.flags.myCar = c.id; done(null, `${c.icon} ${c.name} steht bereit.`, () => void this.city.placeOwnCar(true)); } else done(buyCar(s, c), `${c.icon} ${c.name} gehört jetzt dir!`, () => void this.city.placeOwnCar(true)); } }))] };
      })(),
      tramhafen: { t: 'Tram Hafen', d: 'Endstation am Regenbogenkai. Zurück in die Innenstadt in zehn Minuten.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
      tramhoch: { t: 'Hochbahn Hochstadt', d: 'Die Hochbahn rattert über die Avenue. Von hier kommst du in jedes Viertel – auch zurück über die Regenbogenbrücke.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
      laterne: { t: 'Laternenmeile', d: s.settings.adult ? 'Rote Lichter, Leuchtschilder und nachts Sexarbeiter*innen am Bordstein. Fahr im Auto langsam vorbei und hup: Wer mag, kommt ans Fenster.' : 'Eine Straße mit roten Leuchtschildern. Hier ist vor allem nachts etwas los.', items: [
        { icon: '🚗', label: 'Wie läuft das?', sub: 'Im Auto anhalten und hupen', fn: () => { close(); this.dialog.say([{ who: 'Laternenmeile', color: '#ff2a55', text: s.settings.adult ? 'Nachts ab etwa 22 Uhr stehen hier Nico, Roxy, Teo und Jules. Fahr langsam heran und hup (Angriffstaste). Preis und Regeln werden vorher abgesprochen, das Kondom bringen sie mit.' : 'Hier gibt es nur etwas zu sehen, wenn „Inhalte ab 18“ in den Optionen eingeschaltet ist.' }, ...(s.settings.adult ? [{ who: 'Laternenmeile', color: '#ff2a55', text: 'Fahr danach an eine ruhige Ecke. Und Achtung: Sieht dich eine Streife dabei, gibt es einen Stern.' }] : [])]); } }] },
      penthouse: { t: 'Penthouse Himmelblau', d: 'Die Concierge lächelt: „42. Stock, Whirlpool, Blick bis zum Hafen. Der Schlüssel gehört Ihnen, sobald die Unterschrift trocken ist.“', items: [
        { icon: '🏙️', label: 'Penthouse kaufen', sub: `${PENTHOUSE} € · eigenes Zuhause über den Dächern: schlafen, Whirlpool, Gäste`, fn: () => { if (s.money < PENTHOUSE) { toast(`Dafür fehlen dir ${PENTHOUSE - s.money} €.`); sfx('miss'); return; } s.money -= PENTHOUSE; s.flags.penthouse = s.day; s.rep += 5; sfx('win'); this.save.write(); this.city.refreshHud(); close(); this.hud.banner('🏙️ Penthouse Himmelblau', 'Der Schlüssel gehört dir. Fahr hoch!', 'info', 3600); } },
        { icon: '👀', label: 'Nur mal gucken', sub: 'Die Concierge zeigt dir Fotos', fn: () => { close(); this.dialog.say([{ who: 'Concierge Bente', color: '#9ad8ff', text: 'Bodentiefe Fenster nach Westen. Abends sehen Sie die Regenbogenbrücke leuchten, und morgens weckt Sie die Hochbahn. Ganz leise.' }]); } }] },
      samenbank: { t: 'Samenbank Zukunft', d: 'Hier spenden Menschen für Paare und Singles mit Kinderwunsch, auch für queere Familien. Diskret, ärztlich begleitet und nur für Erwachsene.', items: [
        { icon: '🧪', label: 'Spenden', sub: !s.settings.adult ? 'nur mit „Inhalten ab 18“' : s.flags.donate === s.day ? 'Heute schon gespendet. Morgen wieder.' : `+${DONATE} € · 45 Minuten · Test nicht älter als ${TEST_EVERY} Tage`, disabled: !s.settings.adult || s.flags.donate === s.day, fn: () => { close(); this.donate(); } },
        { icon: 'ℹ️', label: 'Wie läuft das ab?', sub: 'Ablauf, Rechte, Familien', fn: () => { close(); this.dialog.say([
          { who: 'Dr. Amara Wolff', color: '#7fd4ff', text: 'Wer spenden will, braucht einen aktuellen Gesundheitstest. Den macht der Checkpoint Regenbogen kostenlos.' },
          { who: 'Dr. Amara Wolff', color: '#7fd4ff', text: 'Gespendet wird allein in einer ruhigen Kabine. Wir untersuchen die Probe, frieren sie ein und vermitteln sie an Familien mit Kinderwunsch.' },
          { who: 'Dr. Amara Wolff', color: '#7fd4ff', text: 'Kinder dürfen später erfahren, wer ihr Spender ist. Eltern bist du dadurch aber nicht – das bleiben die Familien. 💙' }]); } }] },
      beach: { t: 'Strandbar Sandbank', d: 'Liegestühle, Sand zwischen den Zehen und der beste Sonnenuntergang der Stadt.', items: [
        { icon: '🍹', label: 'Cocktail am Strand', sub: '5 € · +12 Spaß · +6 Kontakte', fn: buy(5, 'Sonne, Sand, Strohhalm. 🍹', eat({ fun: 12, social: 6 })) },
        { icon: '🏊', label: 'Schwimmen gehen', sub: '45 Minuten · +15 Spaß · −10 Energie', fn: () => { close(); this.fade(() => { this.pass(45); change(s, { fun: 15, energy: -10, hygiene: 10 }); this.save.write(); toast('Erfrischend! 🌊'); }); } },
        { icon: '😎', label: 'In der Sonne liegen', sub: '1 Stunde · +12 Energie · Sonnencreme nicht vergessen', fn: () => { close(); this.fade(() => { this.pass(60); change(s, { energy: 12, fun: 5 }); this.save.write(); toast('Schön braun. ☀️'); }); } },
        { icon: '🏐', label: 'Beachvolleyball', sub: '30 Minuten · +14 Kontakte · −8 Energie', fn: () => { close(); this.fade(() => { this.pass(30); change(s, { social: 14, fun: 8, energy: -8 }); this.save.write(); toast('Punkt für dein Team! 🏐'); }); } },
        { icon: '🌅', label: 'Sonnenuntergangs-Treff', sub: hour(s) >= 18 && hour(s) < 22 ? '1 Stunde · neue Leute · +20 Kontakte' : 'ab 18 Uhr', disabled: !(hour(s) >= 18 && hour(s) < 22) || s.flags.sunset === s.day, fn: () => { close(); this.fade(() => { s.flags.sunset = s.day; this.pass(60); change(s, { social: 20, fun: 10 }); this.save.write(); this.dialog.say([{ who: 'Bruno', color: '#d56300', text: ['Jeden Abend um diese Zeit kommen alle her. Siehst du den Typen mit dem Hut? Seit zwanzig Jahren jeden Tag.', 'Hier haben sich schon mehr Paare gefunden als bei Rainbow Match. Behaupte ich jetzt einfach.', 'Wenn die Sonne weg ist, wird es leise. Das ist die schönste Minute am ganzen Tag.'][s.day % 3] }]); }); } },
        ...((s.day - 1) % 7 === 6 && (hour(s) >= 20 || hour(s) < 3) ? [{ icon: '🎉', label: 'Queer Beach Party (Sonntag)', sub: 'Tanz-Battle im Sand', fn: () => { close(); this.goDance(false); } }] : []),
        ...this.treffItems('beach', close),
        { icon: '☀️', label: 'Sonne und Strand: gut zu wissen', sub: 'UV, Nachcremen, Trinken', fn: () => { close(); this.dialog.say(BEACH_INFO.map(([h, x]) => ({ who: '☀️ ' + h, color: '#ffd23b', text: x }))); } }] },
      sauna: { t: 'Sauna Heißer Stein', d: `Holz, Dampf und Ruhe am Hafen. Sauna-Torsten führt den Laden seit 1987.${regular(s, 'sauna') ? ' Du bist hier Stammgast.' : ''}`, items: [
        { icon: '💆', label: 'Massage', sub: `${regular(s, 'sauna') ? 15 : 25} € · 45 Minuten · +20 Energie · +10 Spaß`, fn: buy(regular(s, 'sauna') ? 15 : 25, 'Torstens Kollegin knetet dir die Woche aus den Schultern. 💆', () => { this.pass(45); change(s, { energy: 20, fun: 10, hygiene: 5 }); }) },
        { icon: '🥤', label: 'Saftschorle an der Theke', sub: '3 € · +8 Energie · nach dem Schwitzen trinken!', fn: buy(3, 'Kalt und sauer. Genau richtig.', eat({ energy: 8, hunger: 4 })) },
        ...this.treffItems('sauna', close),
        { icon: '📜', label: 'Sauna-Knigge und Geschichte', sub: 'Handtuch, Aufguss, Gesundheit, Zustimmung', fn: () => { close(); this.dialog.say(SAUNA_INFO.map(([h, x]) => ({ who: '🧖 ' + h, color: '#ff9a3b', text: x }))); } }] },
      bar: s.flags.bar ? { t: 'Club Leuchtturm', d: `Dein eigener Club am Hafen. ${s.flags.barDeko ? 'Discokugel und Neon funkeln.' : 'Noch etwas kahl – Deko bringt mehr Trinkgeld.'} ${s.flags.rex === 'dj' ? 'Rex legt freitags auf.' : ''}`, items: [
        { icon: '🍸', label: 'Hinter die Bar', sub: `Barkeeper-Minispiel · 75 Sekunden · Rekord ${s.best.bar || 0} Drinks`, fn: () => { close(); this.barShift(); } },
        { icon: '🪩', label: 'Party-Nacht veranstalten', sub: isLateNight(hour(s)) || hour(s) >= 21 ? 'einmal pro Nacht · Eintritt und Ruf' : 'ab 21 Uhr', disabled: !(isLateNight(hour(s)) || hour(s) >= 21) || s.flags.party === s.day, fn: () => { close(); this.party(); } },
        { icon: '✨', label: s.flags.barDeko ? 'Deko schon gekauft' : 'Deko kaufen', sub: '80 € · Discokugel und Neon · mehr Trinkgeld', disabled: !!s.flags.barDeko, fn: buy(80, 'Der Leuchtturm funkelt! ✨', () => { s.flags.barDeko = true; }) }] } : {
        t: 'Alte Lagerhalle', d: `Ein Schild an der Tür: „Zu vermieten – ${BAR_COST} € Startmiete“. Platz für einen ganzen Club.`, items: [] },
    };
    { const bz = BUSINESSES.find((x) => x.poi === id && owns(s, x.id)); if (P[id] && bz) P[id].items.unshift({ icon: '📊', label: 'Dein Geschäft führen', sub: `${issueOf(s, bz.id) ? '⚠️ Problem · ' : ''}+${bizDaily(s, bz).net} € am Tag · Personal, Ausbau, Events`, fn: () => { this.closeMenu(); this.phone('biz_' + bz.id); } }); }
    for (const pr of PROFILES) {
      const r = s.dates[pr.id];
      if (P[id] && r && r.plan === s.day && r.at === id) P[id].items.unshift({ icon: '💘', label: `Date mit ${pr.name}`, sub: `${pr.age} · ${pr.pron} · ${DATE_STAGE[r.st]}`, fn: () => { close(); this.runDate(pr.id); } });
    }
    if (P[id]) for (const j of jobsAt(id)) {
      const why = blocked(s, j);
      P[id].items.unshift({ icon: '💼', label: `Schicht als ${j.name}`, sub: why || `${jobTitle(s, j)} · ${wage(s, j)} €/h · 4 Stunden`, disabled: !!why && !why.startsWith('Du bist'), fn: () => this.runShift(j.id) });
    }
    const p = P[id]; if (!p) return;
    this.touch.show(false);
    this.openMenu(`<div class="col"><div class="panel"><h3>${p.t}</h3><p>${p.d}</p><div class="slot"></div></div></div>`, [...p.items, { icon: '←', label: 'Zurück', fn: close }], close, '');
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
  }

  /* ---------- Barkeeper-Minispiel: Zutaten wählen, servieren, gegen die Uhr ---------- */
  /** Barkeeper-Schicht im Club Leuchtturm: 3D-Minispiel „bar“ (Cocktails mixen), Lohn und Trinkgeld wie bisher */
  barShift(done?: () => void, practice = false) {
    this.playMini('bar', {
      back: practice ? done : undefined,
      onDone: (r) => {
        const s = this.save.data, served = r.extra?.served || 0, tips = r.extra?.tips || 0;
        s.best.bar = Math.max(s.best.bar || 0, served);
        if (practice) { this.save.write(); return; }
        const pay = tips + served * 4; s.money += pay; change(s, { social: 15, fun: 8, energy: -12 }); this.pass(120); s.rep += Math.floor(served / 3);
        toast(`Schicht im Leuchtturm: ${served} Drinks, +${pay} €`); this.city.refreshHud(); this.save.write();
        this.dialog.say([{ who: 'Club Leuchtturm', color: '#ffd23b', text: served >= 10 ? 'Legendär! Die Gäste wollen dich jeden Abend hinter der Bar.' : served >= 5 ? 'Gute Schicht! Die Leute kommen wieder.' : 'Das wird noch. Merk dir die Karte!' }], () => done?.());
      },
    });
  }

  private party() {
    const s = this.save.data;
    this.fade(() => {
      s.flags.party = s.day; this.pass(180);
      const guests = 40 + Math.min(160, s.rep * 2) + (s.flags.barDeko ? 40 : 0) + (s.flags.rex === 'dj' ? 30 : 0);
      const pay = Math.round(guests * 1.5);
      s.money += pay; s.rep += 3; change(s, { fun: 25, social: 20, energy: -25 });
      this.save.write(); this.city.refreshHud();
      this.dialog.say([{ who: 'Club Leuchtturm', color: '#ffd23b', text: `${guests} Gäste, Bass bis zum Morgengrauen${s.flags.rex === 'dj' ? ' und Rex an den Reglern' : ''}. Eintritt: +${pay} €, +3 Ruf.` }]);
    });
  }

  /* ---------- Romane von RicoReWi im Handy („Ich bin das Licht“, „Leuchtfeuer“) ---------- */
  private bookData: Record<string, { title: string; sections: Array<{ label: string; title: string; p: string[] }> }> = {};
  async book(i = -1, id: BookId = 'licht') {
    const B = BOOKS[id], T = B.title, mark = 'book_' + id;
    const s = this.save.data;
    this.touch.show(false);
    const close = () => { this.closeMenu(); this.touch.show(true); };
    const frame = (title: string, body: string) => `<div class="phoneBox book"><div class="ph"><span>${clock(s)}</span><b>${esc(title)}</b><span>📖</span></div>${body}<div class="slot"></div></div>`;
    if (!this.bookData[id]) {
      this.openMenu(frame(T, '<div class="pbody"><p>Das Buch wird geladen …</p></div>'), [{ icon: '←', label: 'Zurück', fn: close }], close, 'phone');
      try { this.bookData[id] = await (await fetch(B.file)).json(); } catch { this.openMenu(frame(T, '<div class="pbody"><p>Das Buch konnte nicht geladen werden. Bitte später nochmal versuchen.</p></div>'), [{ icon: '←', label: 'Zurück', fn: close }], close, 'phone'); return; }
    }
    const b = this.bookData[id], n = b.sections.length;
    if (i < 0) {
      const last = Number(s.flags[mark] ?? (id === 'licht' ? s.flags.bookS : 0) ?? 0);
      this.openMenu(frame(T, '<div class="pbody"><img class="cover" src="${B.cover}" alt=""><p>${B.blurb}</p></div>'), [
        ...(last ? [{ icon: '🔖', label: 'Weiterlesen', sub: `${b.sections[last].label} · ${b.sections[last].title}`, fn: () => this.book(last, id) }] : []),
        ...b.sections.map((x, k) => ({ icon: k === last ? '🔖' : '📄', label: x.title, sub: x.label, fn: () => this.book(k, id) })),
        { icon: '←', label: 'Handy weglegen', fn: close }], close, 'phone');
      return;
    }
    const x = b.sections[i]; s.flags[mark] = i; this.save.write();
    const body = `<div class="pbody read"><p class="lab">${esc(x.label)}</p><h3>${esc(x.title)}</h3>${x.p.map((t) => (t === '∗ ∗ ∗' ? '<p class="sep">∗ ∗ ∗</p>' : `<p>${esc(t)}</p>`)).join('')}</div>`;
    this.openMenu(frame(x.label, body), [
      ...(i < n - 1 ? [{ icon: '▶', label: 'Nächstes Kapitel', sub: b.sections[i + 1].title, fn: () => this.book(i + 1, id) }] : []),
      ...(i > 0 ? [{ icon: '◀', label: 'Vorheriges Kapitel', sub: b.sections[i - 1].title, fn: () => this.book(i - 1, id) }] : []),
      { icon: '☰', label: 'Inhalt', fn: () => this.book(-1, id) },
      { icon: '←', label: 'Handy weglegen', fn: close }], close, 'phone');
    this.overlay?.querySelector('.read')?.scrollTo(0, 0);
  }

  /** Abspann nach der Parade (auch aus dem Story-Menü) */
  ending(back?: () => void) {
    const s = this.save.data;
    const fin = back || (() => { this.closeMenu(); this.touch.show(true); });
    this.touch.show(false);
    this.openMenu(`<div class="col"><div class="panel" style="max-height:72dvh;overflow:auto;text-align:center"><h3>🏳️‍🌈 Pride City – Ein Leben in allen Farben</h3>
      <p>${esc(s.name)} kam mit einem Koffer nach Rainbow City. Heute gehören ein Club, eine Wahlfamilie und ein gerettetes Regenbogenhaus dazu.</p>
      <p>Tag ${s.day} · ${s.money} € · Ruf ${s.rep} · Tanz-Rekord ${s.best.dance || 0}</p>
      <p><small>Mit Mo, Jules, Nova, Rex, Bruno, Lena, Tariq, Hilde, Sam und Kim.<br>Figuren von Quaternius, Stadt von KayKit (beide CC0), Musik live erzeugt.<br>Alle Figuren sind erwachsen und frei erfunden. Zustimmung zählt.</small></p>
      <p>Danke fürs Spielen! Die Stadt läuft weiter – freies Spiel.</p><div class="slot"></div></div></div>`,
    [{ icon: '▶', label: 'Weiterspielen', fn: fin }], fin, '');
  }

  /** Minispiel aus Gay Life! oder einer Roman-Rückblende im Vollbild über der Stadt (Sprung direkt ins Spiel, danach zurück) */
  roman(id: 'licht' | 'leuchtfeuer' | 'gaylife', game = '', done?: () => void) {
    if (document.querySelector('.roman')) return;
    this.closeMenu(); this.touch.show(false); this.hud.show(false); music(null); sfx('open');
    const box = el(`<div class="roman"><iframe src="${id === 'gaylife' ? `classic/gay-life/index.html${game ? '?game=' + game : ''}` : `romane/${id}/index.html${game ? '?pc=' + game : ''}`}" allow="autoplay; fullscreen; gamepad; encrypted-media" title="${id === 'licht' ? 'Ich bin das Licht' : id === 'leuchtfeuer' ? 'Leuchtfeuer' : 'Gay Life!'}"></iframe><button class="rClose" aria-label="Zurück nach Pride City">✕ Pride City</button></div>`);
    document.body.appendChild(box);
    const prevPaused = this.engine.paused; this.engine.paused = true;
    const close = () => { removeEventListener('message', onMsg); box.remove(); this.engine.paused = prevPaused; this.hud.show(this.where !== 'city' || this.city.mode === 'play'); this.touch.show(true); music(this.where === 'inside' ? this.inside?.theme.music || 'city' : 'city'); this.city.refreshHud(); done?.(); };
    const onMsg = (e: MessageEvent) => { if (e.data?.pcRoman === 'close') close(); };
    addEventListener('message', onMsg);
    box.querySelector<HTMLButtonElement>('.rClose')!.onclick = close;
    box.querySelector('iframe')!.focus();
  }

  /** Rolle wechseln: eigene Figur, Leon Sommer oder Lady Luma */
  playAs(role: '' | 'leon' | 'luma') {
    const s = this.save.data;
    this.fade(async () => {
      s.flags.playAs = role; this.save.write();
      await this.city.rebuildPlayer();
      sfx('open');
      toast(role === 'leon' ? 'Du spielst jetzt Leon Sommer. 🌈' : role === 'luma' ? 'Hallo, Lady Luma! ✨ Ich bin das Licht.' : `Du bist wieder ${s.name}.`);
    });
  }

  /* ---------- Drag-Show: Lied wählen (Buch-Hymne über YouTube, Klavierlicht-Songs, Beat) ---------- */
  async showMenu(go: (o: ConstructorParameters<typeof DanceScene>[2]) => void, story = false) {
    const s = this.save.data;
    this.touch.show(false);
    const close = () => { this.closeMenu(); this.touch.show(true); if (story) s.flags.lichtShow = false; };
    const ytOk = () => { s.flags.ytOk = true; this.save.write(); go({ song: { kind: 'yt' }, show: true }); };
    const panel = (p: string) => `<div class="col"><div class="panel"><h3>🎤 Lady Lumas Show</h3>${p}<div class="slot"></div></div></div>`;
    const base = [
      { icon: '✨', label: 'Ich bin das Licht – Buchsong', sub: s.flags.ytOk ? 'Offizielles Video (YouTube)' : 'Offizielles Video – lädt YouTube nach Zustimmung', fn: () => {
        if (s.flags.ytOk) { ytOk(); return; }
        this.openMenu(panel('<p>Der Buchsong läuft als offizielles YouTube-Video im Spiel. Erst wenn du zustimmst, wird das Video geladen (youtube-nocookie.com); dabei werden Daten an YouTube/Google übertragen.</p>'), [
          { icon: '▶', label: 'Mit YouTube spielen', fn: ytOk },
          { icon: '🥁', label: 'Ohne YouTube: Beat im Takt', fn: () => go({ song: { kind: 'beat' }, show: true }) },
          { icon: '←', label: 'Zurück', fn: () => this.showMenu(go, story) }], () => this.showMenu(go, story));
      } },
      { icon: '🥁', label: 'Ich bin das Licht – Beat', sub: 'ohne Internet, gleicher Takt', fn: () => go({ song: { kind: 'beat' }, show: true }) },
    ];
    this.openMenu(panel('<p>Welches Lied singt Lady Luma heute? Die Klaviersongs kommen aus Klavierlicht.</p><p><small>Klaviersongs werden geladen …</small></p>'), [...base, ...(story ? [] : [{ icon: '←', label: 'Zurück', fn: close }])], story ? null : close);
    let songs: Awaited<ReturnType<typeof pianoSongs>> = [];
    try { songs = await pianoSongs(); } catch { /* offline: nur Buchsong */ }
    if (!this.menuOpen) return;
    this.openMenu(panel(`<p>Welches Lied singt Lady Luma heute? ${songs.length ? `${songs.length} Klaviersongs aus Klavierlicht, alle gemeinfrei.` : 'Klavierlicht ist gerade nicht erreichbar.'}</p>`), [
      ...base,
      ...songs.map((x) => ({ icon: '🎹', label: x.title, sub: `${x.artist || ''}${x.dur ? ` · ${Math.round(x.dur)} s` : ''}`, fn: async () => {
        this.loading.show('Klavierlicht', x.title);
        try { const parts = await pianoParts(x); this.loading.hide(); go({ song: { kind: 'piano', id: x.id, title: x.title, artist: x.artist, lic: x.lic }, parts, show: true }); }
        catch { this.loading.hide(); toast('Das Lied konnte nicht geladen werden.'); }
      } })),
      ...(story ? [] : [{ icon: '←', label: 'Zurück', fn: close }])], story ? null : close);
  }

  /** 3D-Minispiel starten (Schnittstelle für Clubs, Story, Innenräume): danach zurück an den alten Ort bzw. zu back.
      title = aus dem Titelmenü (keine Wirkung aufs Leben), onDone bekommt Punkte und ob das Ziel erreicht wurde. */
  playMini(id: string, o: { back?: () => void; title?: boolean; onDone?: (r: MiniResult) => void } = {}) {
    const def = miniById(id); if (!def) return;
    const s0 = this.save.data, adult = !!s0.settings.adult;
    if (def.adultOnly && !adult) { toast('Nur mit 18+ (Einstellungen).'); sfx('miss'); return; }
    this.closeMenu();
    this.loading.show(miniName(def, adult), 'Minispiel in 3D');
    this.loading.progress(.4, 'Licht und Glitzer');
    const sc = def.make(this, def, adult, (r) => {
      const s = this.save.data;
      if (!o.title && !r.quit) { change(s, { fun: r.won ? 18 : 10, energy: -4 }); this.pass(15); if (r.won) s.rep += 1; }
      if (!o.title && !r.quit && id === 'gym') { const gain = train(s, 'beine', trainBoost(s)); if (gain) setTimeout(() => this.hud.banner(`🦵 Beinetag: Muskeln +${gain}`, 'Kniebeugen zahlen sich aus.', 'good', 3400), 1200); }
      this.save.write();
      this.fade(() => {
        if (o.back) o.back(); else if (o.title) this.title(); else { this.resume(); this.city.refreshHud(); }
        o.onDone?.(r);
      });
    });
    sc.build().then(() => { this.loading.progress(1, 'Los!'); this.engine.setScene(sc); this.loading.hide(); })
      .catch((e) => { console.error(e); this.loading.hide(); toast('Das Minispiel konnte nicht starten.'); if (o.back) o.back(); else if (o.title) this.title(); else this.resume(); });
  }

  /* ---------- Minispiel ---------- */
  goDance(_story: boolean, back?: () => void, opt: ConstructorParameters<typeof DanceScene>[2] = {}) {
    const s0 = this.save.data;
    if (!opt.song && s0.flags.lichtShow) { this.showMenu((o) => this.goDance(_story, back, o), true); return; }
    this.closeMenu();
    this.loading.show(opt.show ? 'One Love Bar' : 'Club Prisma', opt.show ? 'Lady Lumas Show' : 'Tanz-Battle');
    this.loading.progress(.4, 'Lichtshow startet');
    const sc = new DanceScene(this, (won) => {
      const s = this.save.data;
      change(s, { fun: 20, social: 10, energy: -10 }); advance(s, 20);
      const fin = track(s, 'dance');
      this.save.write();
      setTimeout(() => this.done(fin), 1200);
      this.fade(() => {
        if (back) { this.title(); return; }
        this.resume();
        if (opt.show && !s.flags.lichtShow) { change(s, { fun: 10 }); s.rep += won ? 2 : 1; toast(won ? 'Lady Luma: „Ich bin das Licht!“ ✨ Standing Ovations!' : 'Applaus für Lady Luma! ✨'); this.save.write(); this.city.refreshHud(); return; }
        danceResult(this.city.ctx(), won);
      });
    }, opt);
    sc.build().then(() => { this.loading.progress(1, 'Los!'); this.engine.setScene(sc); this.loading.hide(); });
    music(null);
  }
}

/* QR-Code für den Einladungslink: kleine Bibliothek aus ../vendor, erst bei Bedarf geladen */
type QrMake = (type: number, level: string) => { addData(d: string): void; make(): void; createSvgTag(o: { cellSize: number; margin: number; scalable: boolean }): string };
let qrLib: Promise<QrMake> | null = null;
function loadQr(): Promise<QrMake> {
  const w = window as unknown as { qrcode?: QrMake };
  return qrLib || (qrLib = new Promise<QrMake>((res, rej) => {
    if (w.qrcode) return res(w.qrcode);
    const sc = document.createElement('script'); sc.src = '../vendor/qrcode-generator-1.4.4.js';
    sc.onload = () => (w.qrcode ? res(w.qrcode) : rej(new Error('qr'))); sc.onerror = () => { qrLib = null; rej(new Error('qr')); };
    document.head.appendChild(sc);
  }));
}
