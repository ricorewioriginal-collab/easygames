/* Spielablauf: Ladebildschirm → Titel (Stadt als Kulisse) → Editor → Stadt ↔ Minispiele. Menüs im Konsolen-Stil. */
import { Engine } from '../engine/Engine';
import { Save } from '../engine/Save';
import { trackProgress, preload } from '../engine/Assets';
import { unlock, music, vol, applyVolume, sfx, nightSounds } from '../engine/Audio';
import { Loading, Dialog, Menu, el, $, esc, hints, toast, chapterCard, bindInputMode, type Item } from '../ui/ui';
import { Hud } from '../ui/Hud';
import { Touch } from '../ui/Touch';
import { CityScene, STICKERS } from './CityScene';
import { CreatorScene } from './CreatorScene';
import { DanceScene } from './minigames/DanceScene';
import { World } from './World';
import { BODIES } from './palettes';
import { pianoSongs, pianoParts } from './minigames/showSongs';
import { CHAPTERS, goal, danceResult, NPCS, chapterLabel, BAR_COST, lichtPart, lichtLight, lfPart, lfGlow } from './story';
import { LF_CHAPTERS, lfEnding, lfPct } from './leuchtfeuer';
import { LICHT_CHAPTERS, lichtEnding } from './licht';
import { HomeScene } from './HomeScene';
import { InteriorScene } from './InteriorScene';
import type { Spot, Theme } from './interiors';
import type { Sfx } from '../engine/Audio';
import { JOBS, jobsAt, blocked, situations, finish, title as jobTitle, wage, level } from './jobs';
import { photo } from './Photo';
import { PROFILES, profileShots, profile, dateRec, dateQuestions, finishDate, canStay, DATE_STAGE, testDue, HEALTH_INFO, GLOSSARY, feed, post, bond, TEST_EVERY, FILMS, WORKERS, isLateNight, canMeet, encounter } from './social';
import { NEEDS, mood, moodIcon, moodName, change, advance, minutesUntil, track, dailyState, clock, weekday, hour, type Daily } from './life';

type BookId = 'licht' | 'leuchtfeuer';
const BOOKS: Record<BookId, { title: string; file: string; cover: string; blurb: string }> = {
  licht: { title: 'Ich bin das Licht', file: 'book/ich-bin-das-licht.json', cover: 'book/cover.jpg', blurb: 'Der Roman von RicoReWi: Leon Sommer, Lady Luma und die One Love Bar. In Pride City erzählt Leon seine Geschichte auch selbst – an der One Love Bar.' },
  leuchtfeuer: { title: 'Leuchtfeuer', file: 'book/leuchtfeuer.json', cover: 'book/leuchtfeuer.jpg', blurb: 'Der Jugendroman von RicoReWi: Finn und Ben, ein Schuljahr in Warnholm und der Leuchtturm Rotenhorn. In Pride City erzählt Finn die Geschichte selbst – am Leuchtturm auf dem Steg.' },
};

/** Die 14 Minispiele aus Gay Life! (Original-Code, in classic/gay-life/ eingebettet) */
export const GL_GAMES: Array<[string, string, string, string]> = [
  ['dates', '🎲', 'Date-Roulette', 'Gay Life! · Wer passt zu dir?'], ['club', '🎛️', 'Clubnacht-Manager', 'Gay Life! · Gäste, Musik, Stimmung'],
  ['rave', '🌈', 'Regenbogen-Rave', 'Gay Life! · Farben im Takt'], ['style', '👗', 'Outfit-Check', 'Gay Life! · Mode-Urteil'],
  ['gym', '🏋️', 'Beinetag', 'Gay Life! · Muckibude'], ['match', '✨', 'Glitzer-Match', 'Gay Life! · Paare finden'],
  ['run', '🏃', 'Parade-Runner', 'Gay Life! · Durch die Parade'], ['dance', '💃', 'Tanzbattle (klassisch)', 'Gay Life! · Tanzschule Pirouette'],
  ['pool', '🏊', 'Strandbad-Sprung', 'Gay Life! · Sprungturm'], ['kara', '🎤', 'Karaoke', 'Gay Life! · Mikro-Mimosa'],
  ['sauna', '🧖', 'Sauna-Aufguss', 'Gay Life! · Heißer Stein'], ['dark', '🌑', 'Dunkelkammer', 'Gay Life! · Blackout'],
  ['cast', '🎬', 'Casting-Tag', 'Gay Life! · Studio Klappe Auf'], ['quiz', '❓', 'Klischee-Quiz', 'Gay Life! · Vorurteile knacken'],
];

export class Game {
  engine: Engine;
  save = new Save();
  loading = new Loading();
  dialog = new Dialog();
  hud = new Hud();
  touch: Touch;
  city!: CityScene;
  menuOpen = false;
  home: HomeScene | null = null;
  where: 'city' | 'home' | 'inside' = 'city';
  inside: InteriorScene | null = null;
  private insideBack = { x: 0, z: 0, yaw: 0 };
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
    vol.music = st.music; vol.sfx = st.sfx;
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
    await Promise.all([World.load(), preload(BODIES.map((b) => 'people/' + b.id + '.glb'))]);
    this.loading.progress(.96, 'Stadt wird aufgebaut');
    this.city = new CityScene(this);
    await this.city.build();
    stop();
    this.engine.setScene(this.city);
    this.engine.start();
    this.loading.progress(1, 'Bereit');
    setTimeout(() => this.loading.hide(), 250);
    const q = new URLSearchParams(location.search);
    if (q.has('play') && s.started) { if (s.inside) this.enterHome(); else this.city.setPlay(); return; }
    this.title();
  }

  /* ---------- Overlay-Menüs ---------- */
  private openMenu(html: string, items: Item[], onBack: (() => void) | null, cls = 'title') {
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
    if (s.hasGame) items.push({ icon: '▶', label: 'Fortsetzen', sub: `${s.data.name} · Kapitel ${Math.min(s.data.chapter, 5)} · Tag ${s.data.day}`, big: true, fn: () => this.play() });
    items.push({ icon: '✨', label: 'Neues Spiel', sub: 'Dein Leben in Rainbow City beginnt', big: !s.hasGame, fn: () => this.newGame() });
    items.push({ icon: '📖', label: 'Story', sub: 'Kapitel und roter Faden', fn: () => this.storyMenu(() => this.title()) });
    items.push({ icon: '🪩', label: 'Minispiele', sub: 'Tanz-Battle und mehr', fn: () => this.minigames(() => this.title()) });
    items.push({ icon: '⚙️', label: 'Optionen', sub: 'Grafik, Ton, Steuerung', fn: () => this.options(() => this.title()) });
    items.push({ icon: '💜', label: 'Mitwirkende', sub: 'Assets und Lizenzen', fn: () => this.credits() });
    this.openMenu(`<div class="col"><div class="logo"><span class="l1">Pride</span><span class="l2">City</span><small>Ein Leben in allen Farben</small></div><div class="slot"></div></div>
      <div class="side panel pass" style="display:none"></div><div class="ver">v${__APP_VERSION__} · ab 16 · alle Figuren frei erfunden</div>`, items, null);
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen']]);
  }

  private newGame() {
    const start = () => {
      this.save.newGame();
      if (this.save.oldFound && importOld) this.save.importOld();
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
        if (fromGame) { this.resume(); return; }
        this.loadChapter();
      });
    }, () => this.fade(() => (fromGame ? this.resume() : this.title())));
    this.engine.setScene(sc);
  }

  private loadChapter() {
    const s = this.save.data, ch = CHAPTERS[Math.min(4, s.chapter - 1)];
    this.loading.show(s.chapter > 5 ? 'Rainbow City' : `Kapitel ${ch.n}`, s.chapter > 5 ? 'Freies Spiel' : ch.title);
    let p = 0;
    const iv = setInterval(() => { p = Math.min(1, p + .2); this.loading.progress(p, p < 1 ? 'Rainbow City erwacht' : 'Bereit'); if (p >= 1) { clearInterval(iv); go(); } }, 160);
    const go = () => {
      this.engine.setScene(this.city);
      this.city.setPlay();
      this.loading.hide();
      if (s.chapter === 1 && s.step === 0) {
        chapterCard(`Kapitel ${ch.n}`, ch.title, ch.text).then(() => {
          this.dialog.say([
            { who: 'Du', color: '#444', text: 'Rainbow City. Endlich. Die Tram ist weg, der Koffer ist schwer – und überall wehen Flaggen.' },
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
    this.fade(() => { this.where = 'city'; s.inside = false; s.pos = { x: 3.6, z: 40, yaw: Math.PI / 2 }; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
  }
  /* ---------- Innenräume aller Häuser ---------- */
  /** Haus betreten: Einrichtung aus interiors.ts, zurück vor die Tür (back) */
  enterInterior(theme: Theme, back: { x: number; z: number; yaw: number }, placeId = '') {
    const s = this.save.data;
    if (theme.adult && !s.settings.adult) { toast('Nur mit 18+ (Einstellungen).'); sfx('miss'); return; }
    sfx('door'); this.closeMenu();
    this.insideBack = back; s.pos = { ...back };
    this.fade(async () => {
      const key = theme.id + '|' + placeId;
      let sc = this.interiors.get(key);
      if (!sc) { this.loading.show(theme.title, 'Einrichtung'); sc = new InteriorScene(this, theme, placeId); await sc.build(); this.interiors.set(key, sc); this.loading.hide(); }
      this.inside = sc; this.where = 'inside';
      this.engine.setScene(sc);
    });
  }
  leaveInterior() {
    const s = this.save.data;
    sfx('door');
    this.fade(() => { this.where = 'city'; this.inside = null; s.pos = { ...this.insideBack }; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
  }
  /** Stelle im Innenraum benutzen */
  interiorAct(sp: Spot, sc: InteriorScene) {
    const s = this.save.data, a = sp.act;
    if (a.k === 'menu') { if (sc.placeId) this.placeMenu(sc.placeId); return; }
    if (a.k === 'gl') { this.roman('gaylife', a.id); return; }
    if (a.k === 'dance') { this.goDance(false); return; }
    if (a.k === 'show') {
      if (!(s.flags.lichtEnd || lichtPart(s) >= 5)) { toast('Lady Luma probt noch. Ihre Show gibt es ab Leons 5. Rückblende.'); sfx('miss'); return; }
      this.showMenu((o) => this.goDance(false, undefined, o)); return;
    }
    if (a.k === 'bar') { this.barShift(); return; }
    if (a.k === 'book') { this.book(-1, a.id); return; }
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
    if (id === 'wardrobe') { this.fade(() => this.creator(true)); return; }
    if (id === 'shower') { busy('shower', 20, () => { change(s, { hygiene: 100, fun: 3 }); this.done(track(s, 'shower')); }, 'Frisch geduscht! 🚿'); return; }
    if (id === 'tv') { busy('tv', 60, () => { change(s, { fun: 25, energy: -2 }); }, 'Eine Folge „Drag Race“. Herrlich. 📺'); return; }
    if (id === 'stove') {
      if (s.food <= 0) { toast('Keine Lebensmittel. Im Späti Lecker gibt es welche.'); sfx('miss'); return; }
      busy('stove', 45, () => { s.food--; change(s, { hunger: 50, fun: 5 }); this.done(track(s, 'eat')); }, `Lecker gekocht! Noch ${s.food - 1 < 0 ? 0 : s.food} Portionen übrig.`); return;
    }
    if (id === 'fridge') { toast(s.food ? `Im Kühlschrank: ${s.food} Portionen zum Kochen.` : 'Der Kühlschrank ist leer.'); return; }
    if (id === 'bed') {
      const back = () => { this.closeMenu(); this.touch.show(true); };
      this.touch.show(false);
      this.openMenu(`<div class="col"><div class="panel"><h3>Bett</h3><p>Es ist ${clock(s)} Uhr. Schlafen speichert das Spiel.</p><div class="slot"></div></div></div>`, [
        { icon: '🌙', label: 'Schlafen bis 7 Uhr', sub: 'Energie voll, neuer Tag', fn: () => { back(); this.fade(() => { this.pass(minutesUntil(s, 7), true); change(s, { energy: 100 }); this.save.write(); toast(`Guten Morgen! ${weekday(s)}, Tag ${s.day}.`); }); } },
        ...(s.flags.wild === s.day && s.settings.adult ? [{ icon: '🧺', label: 'Aufräumen', sub: 'Was für eine Nacht …', fn: () => { back(); s.flags.wild = 0; this.pass(15); h.showMess(); toast('Bett frisch bezogen, Verpackungen im Müll. 🧺'); } }] : []),
        { icon: '💤', label: 'Nickerchen (2 Stunden)', sub: '+25 Energie', fn: () => { back(); this.fade(() => { this.pass(120, true); this.save.write(); toast('Ausgeruht.'); }); } },
        { icon: '←', label: 'Zurück', fn: back },
      ], back, '');
    }
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
        { icon: '💼', label: 'Jobs', sub: `${JOBS.length} Jobs in der Stadt`, fn: () => this.phone('jobs') },
        { icon: '👥', label: 'Kontakte', sub: `${Object.keys(s.rel).length} Leute kennengelernt`, fn: () => this.phone('contacts') },
        { icon: '💘', label: 'Rainbow Match', sub: `Dating · ${PROFILES.filter((p) => s.dates[p.id]).length} Matches`, fn: () => this.phone('dating') },
        { icon: '📣', label: 'Feed', sub: 'Was in der Szene los ist', fn: () => this.phone('feed') },
        { icon: '🩺', label: 'Gesundheit', sub: testDue(s) ? '⚠️ Test fällig!' : s.health.prep ? 'PrEP aktiv' : 'Tests, PrEP, U=U', fn: () => this.phone('health') },
        { icon: '📚', label: 'Glossar', sub: 'Begriffe aus der Szene', fn: () => this.phone('glossary') },
        { icon: '📖', label: 'Ich bin das Licht', sub: 'Der Roman von RicoReWi – komplett lesen', fn: () => this.book() },
        { icon: '🗼', label: 'Leuchtfeuer', sub: 'Der Jugendroman von RicoReWi – komplett lesen', fn: () => this.book(-1, 'leuchtfeuer') },
        { icon: '🎮', label: 'Ich bin das Licht – Das Spiel', sub: 'Original-Spiel: Leon, Lady Luma, Show mit Buch-Hymne', fn: () => { close(); this.roman('licht'); } },
        { icon: '🏳️‍🌈', label: 'Gay Life! – Das Original', sub: 'Das alte Spiel komplett: sieben Viertel, Mehrspieler, 14 Minispiele', fn: () => { close(); this.roman('gaylife'); } },
        { icon: '🎮', label: 'Leuchtfeuer – Das Spiel', sub: 'Original-Spiel: 16 Kapitel, fünf Minispiele, Fall 14', fn: () => { close(); this.roman('leuchtfeuer'); } },
        { icon: '←', label: 'Handy weglegen', fn: close },
      ], close, 'phone');
    } else if (app === 'status') {
      const bars = NEEDS.map((n) => `<div class="nd"><span>${n.icon} ${n.name}</span><i><b style="width:${Math.round(s.needs[n.k])}%;background:${s.needs[n.k] < 25 ? '#ff5d6c' : s.needs[n.k] < 50 ? '#ffc53d' : '#3ee69a'}"></b></i><small>${n.tip}</small></div>`).join('');
      this.openMenu(frame('Status', `<div class="pbody"><p><b>${moodIcon(mood(s))} ${moodName(mood(s))}</b> · ${weekday(s)}, Tag ${s.day} · ${clock(s)} Uhr</p>${bars}<p>💶 ${s.money} € · 🌈 ${s.rep} Ruf · ✨ ${s.glitter} Glitzer · 🥕 ${s.food} Portionen</p></div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'goals') {
      const g = goal(s), d = dailyState(s), st = s.goals.filter((x) => x.startsWith('sticker')).length;
      this.openMenu(frame('Ziele', `<div class="pbody"><p><b>⭐ ${g.title}</b><br>${g.sub || ''}</p><h4>Heute</h4>${d.map((x) => `<p>${x.done ? '✅' : '⬜'} ${x.text} (${x.have}/${x.n}) · +${x.glitter} ✨</p>`).join('')}<h4>Sammeln</h4><p>🌈 Pride-Sticker ${st}/8 · 🪩 Tanz-Rekord ${s.best.dance || 0}</p></div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'jobs') {
      this.openMenu(frame('Jobs', '<div class="pbody"><p>Wähle einen Job, um ihn auf der Karte zu markieren. Arbeiten kannst du vor Ort.</p></div>'),
        [...JOBS.map((j) => ({ icon: '💼', label: `${j.name} · ${jobTitle(s, j)}`, sub: `${j.place} · ${j.from}–${j.to} Uhr · ${wage(s, j)} €/h · Stufe ${level(s, j.id) + 1}`, fn: () => { s.pin = j.poi; toast(`${j.place} auf der Karte markiert.`); close(); } })),
          { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'contacts') {
      const met = NPCS.filter((n) => s.rel[n.id]);
      this.openMenu(frame('Kontakte', `<div class="pbody">${met.length ? met.map((n) => { const f = Number(s.rel[n.id].f) || 0; return `<p><b style="color:${n.color}">●</b> <b>${n.name}</b> <small>(${n.pron})</small><br>${'❤️'.repeat(Math.min(5, Math.ceil(f / 20)))}${'🤍'.repeat(5 - Math.min(5, Math.ceil(f / 20)))} ${bond(f)}</p>`; }).join('') : '<p>Noch niemand. Sprich Leute in der Stadt an!</p>'}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'feed') {
      this.openMenu(frame('Feed', `<div class="pbody">${feed(s).map((p) => `<p class="post"><b>@${esc(p.who)}</b> <small>Tag ${p.d}</small><br>${esc(p.t)}</p>`).join('')}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'health') {
      const due = testDue(s);
      this.openMenu(frame('Gesundheit', `<div class="pbody"><p>${due ? '⚠️ <b>Dein Test ist fällig.</b> Geh im Checkpoint vorbei.' : '💚 Alles im grünen Bereich.'}</p><p>🧪 Letzter Test: ${s.health.test ? 'Tag ' + s.health.test : 'noch keiner'}<br>💊 PrEP: ${s.health.prep ? `aktiv, Test alle ${TEST_EVERY} Tage` : 'nicht aktiv'}<br>🎈 Kondome: ${s.inv.condom || 0} · 💧 Gleitgel: ${s.inv.lube || 0}</p>${HEALTH_INFO.map(([t, x]) => `<h4>${t}</h4><p>${x}</p>`).join('')}</div>`),
        [{ icon: '📍', label: 'Checkpoint markieren', fn: () => { s.pin = 'checkpoint'; toast('Checkpoint auf der Karte markiert.'); close(); } }, { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'glossary') {
      const g = GLOSSARY.filter(([, , a]) => !a || s.settings.adult);
      this.openMenu(frame('Glossar', `<div class="pbody">${g.map(([t, x]) => `<p><b>${t}</b><br>${x}</p>`).join('')}${s.settings.adult ? '' : '<p><small>Weitere Begriffe mit „Inhalte ab 18“ in den Optionen.</small></p>'}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    } else if (app === 'dating') {
      this.dating();
      return;
    } else if (app === 'matches') {
      const ms = PROFILES.filter((p) => s.dates[p.id]);
      this.openMenu(frame('Matches', `<div class="pbody">${ms.length ? '<p>Wähle ein Match, um ein Date zu planen.</p>' : '<p>Noch keine Matches. Wisch los!</p>'}</div>`),
        [...ms.map((p) => { const r = dateRec(s, p.id); return { icon: '💘', label: `${p.name}, ${p.age}`, sub: `${DATE_STAGE[r.st]}${r.plan === s.day ? ' · Date heute: ' + (r.at === 'club' ? 'Club Prisma' : 'Café') : ''}`, fn: () => this.planDate(p.id) }; }),
          { icon: '←', label: 'Zurück', fn: () => this.phone('dating') }], () => this.phone('dating'), 'phone');
    } else if (app === 'map') {
      const pois = this.city.world.pois.filter((p) => !p.id.startsWith('tram'));
      this.openMenu(frame('Karte', `<div class="pbody"><canvas id="pmap" width="300" height="300"></canvas><p>Tram: 2 €, 10 Minuten – auch ins Hafenviertel. Oder hinlaufen und ein Auto nehmen.</p></div>`),
        [...pois.map((p) => ({ icon: p.icon, label: p.name, sub: s.pin === p.id ? '⭐ markiert · A: mit der Tram hinfahren' : 'A: mit der Tram hinfahren',
          fn: () => { if (s.money < 2) { toast('Nicht genug Geld für die Tram.'); return; } s.money -= 2; s.pin = ''; close(); this.travel(p.x, p.z); } })),
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
      ${s.settings.adult ? `<p class="adult">🔞 <b>${next.role}</b> · ${esc(next.into)}</p>` : ''}<div class="stamp no">NOPE</div><div class="stamp yes">LIKE</div></div>`
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
  private planDate(id: string) {
    const s = this.save.data, p = profile(id)!, r = dateRec(s, id), close = () => { this.closeMenu(); this.touch.show(true); };
    if (r.last === s.day) { toast(`Ihr hattet heute schon ein Date. ${p.name} schreibt: „Bis morgen? 😘“`); return; }
    const set = (at: string, msg: string) => { r.plan = s.day; r.at = at; s.pin = at; this.save.write(); toast(msg); close(); };
    this.openMenu(`<div class="phoneBox"><div class="ph"><span>${clock(s)}</span><b>💬 ${p.name}</b><span>${DATE_STAGE[r.st]}</span></div><div class="pbody">
      <p class="bubble">Hey! ${r.st ? 'Ich hab an dich gedacht. 🥰' : 'Schön, dass wir gematcht haben. 😊'} Wollen wir uns treffen?</p></div><div class="slot"></div></div>`, [
      { icon: '☕', label: 'Café Kaffeeklatsch', sub: 'heute, wann du willst', fn: () => set('cafe', `Date mit ${p.name} im Café – auf der Karte markiert.`) },
      { icon: '🪩', label: 'Club Prisma', sub: 'heute Abend', fn: () => set('club', `Date mit ${p.name} im Club Prisma – auf der Karte markiert.`) },
      { icon: '←', label: 'Zurück', fn: () => this.phone('matches') },
    ], () => this.phone('matches'), 'phone');
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
  private wildNight(id: string) {
    const s = this.save.data, p = profile(id)!;
    const lube = (s.inv.lube || 0) > 0;
    s.inv.condom--; if (lube) s.inv.lube--;
    const b = el(`<div class="night"><p>💜 ${p.name} und du …</p><small>Zustimmung: ✔︎ · Kondom: ✔︎${lube ? ' · Gleitgel: ✔︎' : ''}${s.health.prep ? ' · PrEP: ✔︎' : ''}</small></div>`);
    document.body.appendChild(b); nightSounds();
    setTimeout(() => {
      this.pass(minutesUntil(s, 8), true);
      change(s, { energy: 100, social: 40, fun: 40, hygiene: -30 });
      s.flags.wild = s.day; post(s, 'Du', 'Was für eine Nacht. 🔥');
      const morning = ['Okay … wo ist meine zweite Socke? 😅', 'Das Bett sieht aus wie nach einem Erdbeben. Hat sich gelohnt.', `${p.name} hat Kaffee dagelassen und ein Herz auf den Zettel gemalt. 💌`];
      this.enterHome(() => { b.remove(); this.home!.showMess(); this.dialog.say([{ who: 'Du', color: '#ff4fa3', text: morning[s.day % 3] }, { who: 'Du', color: '#ff4fa3', text: 'Erst mal duschen. Und aufräumen.' }]); this.save.write(); });
    }, 2600);
  }

  /* ---------- Nachtleben 18+ (Durchgang 3b): angedeutet, Abblende, Zustimmung und Kondom ---------- */
  /** Abblende mit kurzer Zeile, danach Zeit vorspulen und weiter */
  private fadeNight(title: string, tags: string[], minutes: number, kind: Parameters<typeof encounter>[1], after?: () => void) {
    const s = this.save.data;
    const b = el(`<div class="night"><p>${esc(title)}</p><small>${tags.map(esc).join(' · ')}</small></div>`);
    document.body.appendChild(b); if (kind !== 'talk') nightSounds();
    setTimeout(() => {
      this.pass(minutes);
      const r = encounter(s, kind);
      this.save.write(); this.city.refreshHud(); b.remove();
      if (r.remindTest && kind !== 'talk') toast('🩺 Denk an deinen nächsten Test im Checkpoint – anonym und kostenlos.');
      after?.();
    }, 2600);
  }
  private adultOnly(name: string) {
    this.dialog.say([{ who: name, color: '#ff6ad5', text: 'Hier kommst du nur rein, wenn „Inhalte ab 18“ in den Optionen eingeschaltet ist.' }]);
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
        this.dialog.say([V('Zwei Klopfer zurück: Ja! 😏')], () => this.fadeNight('🚪 Kabine 3 …', ['Klopfzeichen: Ja ✔︎', 'Kondom ✔︎', s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean), 25, 'cabin'));
      }, 50) },
      { label: 'Nur gucken und wieder gehen', fn: () => {} },
    ])]);
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
    const s = this.save.data, Q = (text: string, choices?: Array<{ label: string; fn: () => void }>) => ({ who: 'Im Gebüsch', color: '#3ee69a', text, choices });
    this.closeMenu(); this.touch.show(true);
    if (Math.random() < .25) { this.dialog.say([Q('Heute ist nichts los. Nur ein Igel raschelt im Laub. 🦔')]); this.pass(20); return; }
    this.dialog.say([Q('Im Schatten der Bäume steht jemand. Ein Blick, ein Lächeln, ein Nicken in Richtung der Büsche.', [
      { label: 'Zurücknicken und mitgehen', fn: () => setTimeout(() => {
        if (canMeet(s) === 'condom') { this.dialog.say([Q('„Hast du ein Gummi?“ – Hast du nicht. „Dann ein andermal.“ Er zwinkert und verschwindet.')]); return; }
        this.fadeNight('🌙 Zwischen den Büschen …', ['Nicken: Ja ✔︎', 'Kondom ✔︎', s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean), 30, 'cruising', () => this.dialog.say([{ who: 'Du', color: '#ff4fa3', text: 'Die Verpackung kommt in den Mülleimer. Wir sind ja nicht die anderen. 😅' }]));
      }, 50) },
      { label: 'Freundlich den Kopf schütteln und weitergehen', fn: () => setTimeout(() => this.dialog.say([Q('Er nickt verständnisvoll. Kein Ding.')]), 50) },
    ])]);
  }

  private drawMap() {
    const c = document.getElementById('pmap') as HTMLCanvasElement | null; if (!c) return;
    // Ausschnitt x −115…65 (mit Hafen), z −90…90
    const x = c.getContext('2d')!, k = 300 / 180, PX = (v: number) => (v + 115) * k, PZ = (v: number) => (v + 90) * k;
    x.fillStyle = '#2f8fd0'; x.fillRect(0, 0, 300, 300);
    x.fillStyle = '#5c9a52'; x.fillRect(PX(-65), PZ(-65), 130 * k, 130 * k);
    x.fillStyle = '#bdb5a8'; x.fillRect(PX(-92), PZ(-35), 27 * k, 80 * k); x.fillStyle = '#f0d9a0'; x.fillRect(PX(-97), PZ(17), 5 * k, 26 * k);
    x.fillStyle = '#8a5a35'; x.fillRect(PX(-111), PZ(-3.5), 20 * k, 3 * k);
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
  travel(x: number, z: number) {
    const s = this.save.data;
    sfx('tram');
    const go = () => { this.where = 'city'; s.inside = false; s.pos = { x: x > 0 ? x - 2.2 : x + 2.2, z, yaw: x > 0 ? Math.PI / 2 : -Math.PI / 2 }; this.pass(10); this.done(track(s, 'tram')); this.engine.setScene(this.city); this.city.setPlay(); toast('🚋 Angekommen.'); };
    this.fade(go);
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
      { icon: '👗', label: 'Kleiderschrank', sub: 'Look, Farbwelt, Pronomen', fn: () => this.fade(() => this.creator(true)) },
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
      f.lichtIntro ? `Ich bin das Licht: ${Math.min(lichtPart(s), LICHT_CHAPTERS.length)}/${LICHT_CHAPTERS.length} Rückblenden · Licht ${lichtLight(s)}${f.lichtEnd ? ' · Ende „' + lichtEnding(lichtLight(s)).title + '“' : ''}` : '',
    ].filter(Boolean);
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Story</span><small>Ein Leben in allen Farben</small></div><div class="slot"></div></div>
      <div class="side panel"><h3>Deine Entscheidungen</h3><p>${choices.length ? choices.join('<br>') : 'Noch keine – die Stadt merkt sich alles.'}</p></div>`,
    [...CHAPTERS.map((c) => ({ icon: c.n < s.chapter ? '✅' : c.n === s.chapter ? '⭐' : '🔒', label: `Kapitel ${c.n}: ${c.title}`, sub: c.n <= s.chapter ? c.text : 'Noch nicht freigespielt', disabled: c.n > s.chapter })),
      ...(s.chapter > 5 ? [{ icon: '🏁', label: 'Abspann ansehen', fn: () => this.ending(back) }] : []),
      { icon: '←', label: 'Zurück', fn: back }], back);
  }

  options(back: () => void) {
    const st = this.save.data.settings;
    const q = ['Automatisch', 'Niedrig', 'Mittel', 'Hoch'];
    const pct = (v: number) => Math.round(v * 100) + ' %';
    const step = (v: number, d: number) => Math.max(0, Math.min(1, Math.round((v + d) * 10) / 10));
    const set = () => { vol.music = st.music; vol.sfx = st.sfx; applyVolume(); this.engine.setQuality(st.quality); this.save.write(); };
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Optionen</span></div><div class="slot"></div></div>
      <div class="side panel" id="cloudSlot"><h3>☁️ Spielstand sichern</h3><p>Dein Fortschritt liegt auf diesem Gerät.</p></div>`, [
      { icon: '🎞️', label: 'Grafik', value: () => q[st.quality + 1], left: () => { st.quality = st.quality <= -1 ? 2 : st.quality - 1; set(); }, right: () => { st.quality = st.quality >= 2 ? -1 : st.quality + 1; set(); } },
      { icon: '🎵', label: 'Musik', value: () => pct(st.music), left: () => { st.music = step(st.music, -.1); set(); }, right: () => { st.music = step(st.music, .1); set(); } },
      { icon: '🔊', label: 'Effekte', value: () => pct(st.sfx), left: () => { st.sfx = step(st.sfx, -.1); set(); }, right: () => { st.sfx = step(st.sfx, .1); set(); } },
      { icon: '🎥', label: 'Kamera-Tempo', value: () => st.camSpeed.toFixed(1) + '×', left: () => { st.camSpeed = Math.max(.4, +(st.camSpeed - .2).toFixed(1)); set(); }, right: () => { st.camSpeed = Math.min(2.4, +(st.camSpeed + .2).toFixed(1)); set(); } },
      { icon: '↕️', label: 'Kamera umkehren', value: () => (st.invertY ? 'An' : 'Aus'), left: () => { st.invertY = !st.invertY; set(); }, right: () => { st.invertY = !st.invertY; set(); } },
      { icon: '🔞', label: 'Inhalte ab 18', sub: 'Flirts, Vorlieben, angedeutete Nächte – Gesundheitsinfos sind immer an', value: () => (st.adult ? 'An' : 'Aus'), left: () => this.toggleAdult(back), right: () => this.toggleAdult(back), fn: () => this.toggleAdult(back) },
      { icon: '⛶', label: 'Vollbild', sub: 'Ein- oder ausschalten', fn: () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {}); } },
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
    const slot = this.overlay?.querySelector('#cloudSlot'), cm = document.getElementById('cloudMount');
    if (slot && cm) { cm.classList.remove('hidden'); slot.appendChild(cm); }
    hints([['dpad', 'Wählen'], ['lr', 'Ändern'], ['b', 'Zurück']]);
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
      { icon: '🍸', label: 'Barkeeper-Schicht', sub: `Club Leuchtturm · 75 Sekunden · Rekord ${b.bar || 0} Drinks`, fn: () => this.barShift(() => this.minigames(back), true) },
      { icon: '🎤', label: 'Lady Lumas Drag-Show', sub: 'Buch-Hymne oder Klaviersongs aus Klavierlicht', fn: () => this.showMenu((o) => this.goDance(false, back, o)) },
      ...GL_GAMES.map(([id, icon, n, d]) => ({ icon, label: n, sub: d, fn: () => this.roman('gaylife', id) })),
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
  }

  credits() {
    this.openMenu(`<div class="col"><div class="panel" style="max-height:70dvh;overflow:auto"><h3>Mitwirkende</h3>
      <p><b style="color:#fff">Pride City</b> – Relaunch von Gay Life! für easygames.</p>
      <p>Figuren: <b style="color:#fff">Quaternius</b> (über Poly Pizza) – CC0 1.0. Stadt und Wohnung: <b style="color:#fff">KayKit</b> von Kay Lousberg (City Builder Bits, Furniture Bits, Restaurant Bits) – CC0 1.0. In Pride-Farben umgefärbt.</p>
      <p>3D: three.js (MIT). Musik und Klänge werden live im Spiel erzeugt.</p>
      <p>Alle Figuren sind erwachsen und frei erfunden. Zustimmung zählt.</p><div class="slot"></div></div></div>`,
    [{ icon: '←', label: 'Zurück', fn: () => this.title() }], () => this.title());
  }

  placeMenu(id: string) {
    const s = this.save.data;
    const close = () => { this.closeMenu(); this.touch.show(true); };
    const buy = (cost: number, msg: string, fx: () => void) => () => { if (s.money < cost) { toast('Nicht genug Geld.'); sfx('miss'); return; } s.money -= cost; fx(); toast(msg); sfx('coin'); this.city.refreshHud(); close(); };
    const eat = (fx: Parameters<typeof change>[1], goal?: string) => () => { change(s, fx); if (goal) this.done(track(s, goal)); };
    const P: Record<string, { t: string; d: string; items: Item[] }> = {
      cafe: { t: 'Café Kaffeeklatsch', d: 'Mo macht den besten Hafer-Cappuccino der Stadt.', items: [
        { icon: '☕', label: 'Cappuccino', sub: '3 € · +12 Energie · +1 Ruf beim ersten Mal am Tag', fn: buy(3, 'Lecker! Mo zwinkert dir zu.', () => { eat({ energy: 12, fun: 2 }, 'coffee')(); if (s.flags.coffee !== s.day) { s.rep++; s.flags.coffee = s.day; } }) },
        { icon: '🍰', label: 'Regenbogenkuchen', sub: '5 € · +20 Hunger · +6 Spaß', fn: buy(5, 'Sechs Schichten Glück.', eat({ hunger: 20, fun: 6 }, 'eat')) },
        { icon: '💬', label: 'Mit Gästen plaudern', sub: '30 Minuten · +14 Kontakte', fn: () => { close(); this.fade(() => { this.pass(30); change(s, { social: 14, fun: 4 }); this.save.write(); toast('Nette Leute hier. ☕'); }); } }] },
      spaeti: { t: 'Späti Lecker', d: 'Bruno hat alles, was man nachts braucht.', items: [
        { icon: '🥨', label: 'Brezel', sub: '2 € · +15 Hunger', fn: buy(2, 'Frisch und warm.', eat({ hunger: 15 }, 'eat')) },
        { icon: '🧃', label: 'Mate', sub: '3 € · +15 Energie', fn: buy(3, 'Energie für die Nacht!', eat({ energy: 15 })) },
        { icon: '🎈', label: 'Kondome (3 Stück)', sub: `3 € · du hast ${s.inv.condom || 0}`, fn: buy(3, 'Safer Sex ist sexy. 🎈', () => { s.inv.condom = (s.inv.condom || 0) + 3; }) },
        { icon: '💧', label: 'Gleitgel', sub: `4 € · du hast ${s.inv.lube || 0}`, fn: buy(4, 'Gleitgel eingepackt. 💧', () => { s.inv.lube = (s.inv.lube || 0) + 1; }) },
        { icon: '🥕', label: 'Lebensmittel', sub: `6 € · 3 Portionen zum Kochen (du hast ${s.food})`, fn: buy(6, 'Ab in den Kühlschrank damit.', () => { s.food += 3; }) }] },
      club: { t: 'Club Prisma', d: 'Neon, Bass und die beste Tanzfläche der Stadt.', items: [
        { icon: '🪩', label: 'Tanz-Battle', sub: `Rekord ${s.best.dance || 0}`, fn: () => this.goDance(false) },
        { icon: '🍹', label: 'Drink an der Bar', sub: '6 € · +10 Spaß · +8 Kontakte', fn: buy(6, 'Prost! 🍹', eat({ fun: 10, social: 8, energy: -3 })) }] },
      center: { t: 'Regenbogenhaus', d: 'Beratung, Jugendgruppe, Kaffee und Kummer – seit dreißig Jahren.', items: [
        { icon: '💜', label: 'Spenden', sub: '10 € · +2 Ruf', fn: buy(10, 'Danke! Jedes bisschen hilft.', () => { s.rep += 2; }) }] },
      boutique: { t: 'Boutique Fabelhaft', d: 'Glitzer, Leder, Regenbogen – hier findest du deinen Look.', items: [
        { icon: '👗', label: 'Neuer Look', sub: 'Zum Kleiderschrank', fn: () => this.fade(() => this.creator(true)) },
        ...(s.settings.adult ? [{ icon: '🍆', label: 'Toy aus der Hinterzimmer-Ecke', sub: `25 € · diskret verpackt · du hast ${s.inv.toy || 0}`, fn: buy(25, 'Diskret verpackt. Viel Spaß! 😏', () => { s.inv.toy = (s.inv.toy || 0) + 1; change(s, { fun: 10 }); }) }] : [])] },
      gym: { t: 'Muckibude Muskelkater', d: 'Bären, Twinks und alle dazwischen – hier schwitzt die ganze Szene.', items: [
        { icon: '🏋️', label: 'Training', sub: '4 € · 1 Stunde · +15 Spaß, −20 Energie, −20 Hygiene', fn: () => { if (s.needs.energy < 20) { toast('Zu erschöpft fürs Training.'); sfx('miss'); return; } buy(4, 'Gepumpt! 💪', () => { this.pass(60); change(s, { fun: 15, energy: -20, hygiene: -20, hunger: -10 }); })(); } },
        { icon: '🚿', label: 'Duschen', sub: '1 € · Hygiene voll', fn: buy(1, 'Frisch!', () => { this.pass(15); change(s, { hygiene: 100 }); this.done(track(s, 'shower')); }) }] },
      checkpoint: { t: 'Checkpoint Regenbogen', d: 'Beratung, Tests und PrEP – anonym, ohne Urteil, mit Gummibärchen.', items: [
        { icon: '🧪', label: 'HIV- und STI-Test', sub: `kostenlos · 30 Minuten · ${s.health.test ? 'letzter Test: Tag ' + s.health.test : 'noch nie getestet'}`, fn: () => { close(); this.fade(() => { this.pass(30); s.health.test = s.day; change(s, { fun: 3 }); this.save.write(); this.dialog.say([{ who: 'Checkpoint', color: '#3ee69a', text: 'Alles negativ. Danke, dass du auf dich und andere achtest! 💚' }, { who: 'Checkpoint', color: '#3ee69a', text: s.health.prep ? `Mit PrEP sehen wir uns in ${TEST_EVERY} Tagen wieder – das Handy erinnert dich.` : 'Wenn du öfter wechselnde Partner*innen hast: Frag uns nach PrEP.' }]); }); } },
        { icon: '💊', label: s.health.prep ? 'PrEP beenden' : 'PrEP beginnen', sub: 'Tablette, die vor HIV schützt · Beratung gratis', fn: () => { s.health.prep = !s.health.prep; if (s.health.prep && s.health.test !== s.day) toast('Vor dem Start gehört ein HIV-Test dazu – mach ihn gleich mit!'); else toast(s.health.prep ? 'PrEP läuft. Regelmäßig testen nicht vergessen! 💊' : 'PrEP beendet.'); this.save.write(); close(); } },
        { icon: '🎈', label: 'Gratis Kondome', sub: '3 Stück, einmal am Tag', fn: () => { if (s.flags.freeCondoms === s.day) { toast('Für heute hast du schon welche.'); return; } s.flags.freeCondoms = s.day; s.inv.condom = (s.inv.condom || 0) + 3; toast('Drei Kondome eingesteckt. 🎈'); sfx('coin'); close(); } },
        { icon: 'ℹ️', label: 'Infos: U=U, PrEP, PEP, Safer Sex', fn: () => { close(); this.dialog.say(HEALTH_INFO.map(([t, x]) => ({ who: t, color: '#3ee69a', text: x }))); } }] },
      studio: { t: 'Studio Klappe Auf', d: 'Fotostudio für Pässe, Paare und Pride-Plakate.', items: [] },
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
      tramhafen: { t: 'Tram Hafen', d: 'Endstation am Regenbogenkai. Zurück in die Innenstadt in zehn Minuten.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
      beach: { t: 'Strandbar Sandbank', d: 'Liegestühle, Sand zwischen den Zehen und der beste Sonnenuntergang der Stadt.', items: [
        { icon: '🍹', label: 'Cocktail am Strand', sub: '5 € · +12 Spaß · +6 Kontakte', fn: buy(5, 'Sonne, Sand, Strohhalm. 🍹', eat({ fun: 12, social: 6 })) },
        { icon: '🏊', label: 'Schwimmen gehen', sub: '45 Minuten · +15 Spaß · −10 Energie', fn: () => { close(); this.fade(() => { this.pass(45); change(s, { fun: 15, energy: -10, hygiene: 10 }); this.save.write(); toast('Erfrischend! 🌊'); }); } },
        { icon: '😎', label: 'In der Sonne liegen', sub: '1 Stunde · +12 Energie · Sonnencreme nicht vergessen', fn: () => { close(); this.fade(() => { this.pass(60); change(s, { energy: 12, fun: 5 }); this.save.write(); toast('Schön braun. ☀️'); }); } },
        { icon: '🏐', label: 'Beachvolleyball', sub: '30 Minuten · +14 Kontakte · −8 Energie', fn: () => { close(); this.fade(() => { this.pass(30); change(s, { social: 14, fun: 8, energy: -8 }); this.save.write(); toast('Punkt für dein Team! 🏐'); }); } }] },
      bar: s.flags.bar ? { t: 'Club Leuchtturm', d: `Dein eigener Club am Hafen. ${s.flags.barDeko ? 'Discokugel und Neon funkeln.' : 'Noch etwas kahl – Deko bringt mehr Trinkgeld.'} ${s.flags.rex === 'dj' ? 'Rex legt freitags auf.' : ''}`, items: [
        { icon: '🍸', label: 'Hinter die Bar', sub: `Barkeeper-Minispiel · 75 Sekunden · Rekord ${s.best.bar || 0} Drinks`, fn: () => { close(); this.barShift(); } },
        { icon: '🪩', label: 'Party-Nacht veranstalten', sub: isLateNight(hour(s)) || hour(s) >= 21 ? 'einmal pro Nacht · Eintritt und Ruf' : 'ab 21 Uhr', disabled: !(isLateNight(hour(s)) || hour(s) >= 21) || s.flags.party === s.day, fn: () => { close(); this.party(); } },
        { icon: '✨', label: s.flags.barDeko ? 'Deko schon gekauft' : 'Deko kaufen', sub: '80 € · Discokugel und Neon · mehr Trinkgeld', disabled: !!s.flags.barDeko, fn: buy(80, 'Der Leuchtturm funkelt! ✨', () => { s.flags.barDeko = true; }) }] } : {
        t: 'Alte Lagerhalle', d: `Ein Schild an der Tür: „Zu vermieten – ${BAR_COST} € Startmiete“. Platz für einen ganzen Club.`, items: [] },
    };
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
  barShift(done?: () => void, practice = false) {
    const s = this.save.data;
    const ING: Array<[string, string]> = [['🍊', 'Orange'], ['🍋', 'Zitrone'], ['🍓', 'Erdbeere'], ['🫐', 'Blaubeere'], ['🧉', 'Mate'], ['🍺', 'Bier'], ['🧊', 'Eis'], ['🫧', 'Soda'], ['✨', 'Glitzer']];
    const MENU: Array<[string, string]> = [['Pride-Spritz', '🍊🫧🍓'], ['Glitzer-Mate', '🧉🧊✨'], ['Leuchtturm-Tonic', '🍋🧊🫧'], ['Bärenbier', '🍺'], ['Nova Nights', '🫐🍋✨'], ['Hildes Mocktail', '🍓🍋🫧']];
    const GUESTS = ['Mo', 'Bruno', 'Lena', 'Tariq', 'Sam', 'Kim', 'Hilde', 'Nova', 'Jules', 'ein Gast in Leder', 'zwei Drag Queens', 'eine Touristin'];
    const split = (r: string) => [...r.matchAll(/\p{Extended_Pictographic}|✨/gu)].map((m) => m[0]);
    let left = 75, served = 0, tips = 0, glass: string[] = [], order = 0, guest = '';
    const next = () => { order = Math.floor(Math.random() * MENU.length); guest = GUESTS[Math.floor(Math.random() * GUESTS.length)]; glass = []; };
    next();
    const render = () => {
      const box = this.overlay?.querySelector('#barBox'); if (!box) return;
      box.innerHTML = `<p><b style="color:#fff">${esc(guest)}</b> möchte: <b style="color:#ffd23b">${MENU[order][0]}</b></p>
        <p style="font-size:28px;letter-spacing:4px;min-height:36px">${glass.join('') || '<small>leeres Glas</small>'}</p>
        <div class="bar"><i style="width:${left / 75 * 100}%"></i></div><p>⏱ ${left} s · 🍸 ${served} · 💶 ${tips} €</p>
        <p><small>${MENU.map(([n, r]) => `${n}: ${r}`).join(' · ')}</small></p>`;
    };
    const serve = () => {
      const want = split(MENU[order][1]).sort().join(''), got = glass.slice().sort().join('');
      sfx('pour'); setTimeout(() => sfx('glass'), 500);
      if (want === got) { served++; const t = 3 + Math.floor(Math.random() * 4) + (s.flags.barDeko ? 2 : 0); tips += t; sfx('coin'); toast(`${guest}: „Perfekt!“ +${t} €`); }
      else { sfx('miss'); toast(`${guest}: „Das hab ich nicht bestellt …“`); }
      next(); render();
    };
    const end = () => {
      clearInterval(iv); this.closeMenu();
      s.best.bar = Math.max(s.best.bar || 0, served);
      if (!practice) { const pay = tips + served * 4; s.money += pay; change(s, { social: 15, fun: 8, energy: -12 }); this.pass(120); s.rep += Math.floor(served / 3); toast(`Schicht im Leuchtturm: ${served} Drinks, +${pay} €`); this.city.refreshHud(); }
      else toast(`${served} Drinks in 75 Sekunden!`);
      this.save.write();
      this.dialog.say([{ who: 'Club Leuchtturm', color: '#ffd23b', text: served >= 10 ? 'Legendär! Die Gäste wollen dich jeden Abend hinter der Bar.' : served >= 5 ? 'Gute Schicht! Die Leute kommen wieder.' : 'Das wird noch. Merk dir die Karte!' }], () => { if (done) done(); else this.touch.show(true); });
    };
    this.touch.show(false);
    this.openMenu(`<div class="col"><div class="panel barPanel"><h3>🍸 Hinter der Bar</h3><div id="barBox"></div><div class="slot"></div></div></div>`,
      [...ING.map(([i, n]) => ({ icon: i, label: n, fn: () => { if (glass.length < 4) { glass.push(i); sfx('move'); render(); } } })),
        { icon: '🛎️', label: 'Servieren', fn: serve },
        { icon: '🗑️', label: 'Leeren', fn: () => { glass = []; render(); } },
        { icon: '⏹', label: 'Feierabend', fn: () => { left = 0; } }], null, '');
    hints([['dpad', 'Zutat'], ['a', 'Rein ins Glas']]);
    const iv = setInterval(() => { if (!this.overlay?.querySelector('#barBox')) { clearInterval(iv); return; } left = Math.max(0, left - 1); render(); if (left <= 0) end(); }, 1000);
    render();
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

  /** Original-Romanspiel (aus dem früheren easygames-Spiel, unverändert) im Vollbild über der Stadt */
  roman(id: 'licht' | 'leuchtfeuer' | 'gaylife', game = '') {
    if (document.querySelector('.roman')) return;
    this.closeMenu(); this.touch.show(false); this.hud.show(false); music(null); sfx('open');
    const box = el(`<div class="roman"><iframe src="${id === 'gaylife' ? `classic/gay-life/index.html${game ? '?game=' + game : ''}` : `romane/${id}/index.html`}" allow="autoplay; fullscreen; gamepad; encrypted-media" title="${id === 'licht' ? 'Ich bin das Licht' : id === 'leuchtfeuer' ? 'Leuchtfeuer' : 'Gay Life!'}"></iframe><button class="rClose" aria-label="Zurück nach Pride City">✕ Pride City</button></div>`);
    document.body.appendChild(box);
    const prevPaused = this.engine.paused; this.engine.paused = true;
    const close = () => { removeEventListener('message', onMsg); box.remove(); this.engine.paused = prevPaused; this.hud.show(this.where !== 'city' || this.city.mode === 'play'); this.touch.show(true); music(this.where === 'inside' ? this.inside?.theme.music || 'city' : 'city'); this.city.refreshHud(); };
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
