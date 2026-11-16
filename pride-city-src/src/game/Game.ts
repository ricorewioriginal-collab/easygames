/* Spielablauf: Ladebildschirm → Titel (Stadt als Kulisse) → Editor → Stadt ↔ Minispiele. Menüs im Konsolen-Stil. */
import { Engine } from '../engine/Engine';
import { Save } from '../engine/Save';
import { trackProgress, preload } from '../engine/Assets';
import { unlock, music, vol, applyVolume, sfx } from '../engine/Audio';
import { Loading, Dialog, Menu, el, $, esc, hints, toast, chapterCard, bindInputMode, type Item } from '../ui/ui';
import { Hud } from '../ui/Hud';
import { Touch } from '../ui/Touch';
import { CityScene, STICKERS } from './CityScene';
import { CreatorScene } from './CreatorScene';
import { DanceScene } from './minigames/DanceScene';
import { World } from './World';
import { BODIES } from './palettes';
import { CHAPTERS, goal, danceResult, NPCS } from './story';
import { HomeScene } from './HomeScene';
import { JOBS, jobsAt, blocked, situations, finish, title as jobTitle, wage, level } from './jobs';
import { photo } from './Photo';
import { PROFILES, profileShots, profile, dateRec, dateQuestions, finishDate, canStay, DATE_STAGE, testDue, HEALTH_INFO, GLOSSARY, feed, post, bond, TEST_EVERY } from './social';
import { NEEDS, mood, moodIcon, moodName, change, advance, minutesUntil, track, dailyState, clock, weekday, type Daily } from './life';

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
  where: 'city' | 'home' = 'city';
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
    this.hud.onPrompt = () => (this.where === 'home' ? this.engine.input.tap('confirm') : this.city?.interact());
    this.hud.onPhone = () => { if (!this.menuOpen) this.phone(); };
    this.hud.onMenu = () => this.pauseMenu();
    addEventListener('visibilitychange', () => { if (document.hidden) this.save.write(); });
  }

  async run() {
    this.loading.show('Pride City', 'Rainbow City wird gebaut');
    const stop = trackProgress((d, t) => this.loading.progress(Math.min(.95, d / Math.max(1, t)), 'Modelle und Texturen'));
    const s = this.save.data;
    await Promise.all([World.load(), preload(BODIES.map((b) => 'chars/' + b.id + '.glb'))]);
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
    this.loading.show(`Kapitel ${ch.n}`, ch.title);
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
    this.engine.setScene(this.city); this.city.setPlay();
  }

  /* ---------- Wohnung ---------- */
  enterHome(after?: () => void) {
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
    this.fade(() => { this.where = 'city'; s.inside = false; s.pos = { x: 3.6, z: 40, yaw: Math.PI / 2 }; this.engine.setScene(this.city); this.city.setPlay(); this.save.write(); });
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
    const busy = (kind: HomeScene['activity'], min: number, fx: () => void, msg: string) => { h.play(kind); setTimeout(() => { this.pass(min); fx(); toast(msg); this.save.write(); this.city.refreshHud(); }, 900); };
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
      const pois = this.city.world.pois.filter((p) => p.id !== 'tram');
      this.openMenu(frame('Karte', `<div class="pbody"><canvas id="pmap" width="300" height="300"></canvas><p>Tram: 2 €, 10 Minuten. Oder Ziel markieren und hinlaufen.</p></div>`),
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
    document.body.appendChild(b);
    setTimeout(() => {
      this.pass(minutesUntil(s, 8), true);
      change(s, { energy: 100, social: 40, fun: 40, hygiene: -30 });
      s.flags.wild = s.day; post(s, 'Du', 'Was für eine Nacht. 🔥');
      const morning = ['Okay … wo ist meine zweite Socke? 😅', 'Das Bett sieht aus wie nach einem Erdbeben. Hat sich gelohnt.', `${p.name} hat Kaffee dagelassen und ein Herz auf den Zettel gemalt. 💌`];
      this.enterHome(() => { b.remove(); this.home!.showMess(); this.dialog.say([{ who: 'Du', color: '#ff4fa3', text: morning[s.day % 3] }, { who: 'Du', color: '#ff4fa3', text: 'Erst mal duschen. Und aufräumen.' }]); this.save.write(); });
    }, 2600);
  }

  private drawMap() {
    const c = document.getElementById('pmap') as HTMLCanvasElement | null; if (!c) return;
    const x = c.getContext('2d')!, k = 300 / 130, P = (v: number) => (v + 65) * k;
    x.fillStyle = '#5c9a52'; x.fillRect(0, 0, 300, 300);
    x.fillStyle = '#3a3f55';
    for (let i = -6; i <= 6; i += 3) { x.fillRect(P(i * 10 - 5), 0, 10 * k, 300); x.fillRect(0, P(i * 10 - 5), 300, 10 * k); }
    const sel = this.menu?.items[this.menu.index]?.label;
    for (const p of this.city.world.pois) {
      x.font = (p.name === sel ? 26 : 18) + 'px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if (p.name === sel) { x.fillStyle = 'rgba(255,79,163,.55)'; x.beginPath(); x.arc(P(p.x), P(p.z), 16, 0, 7); x.fill(); }
      x.fillText(p.icon, P(p.x), P(p.z));
    }
    const pl = this.city.player.root.position;
    x.fillStyle = '#fff'; x.strokeStyle = '#ff4fa3'; x.lineWidth = 3; x.beginPath(); x.arc(P(pl.x), P(pl.z), 6, 0, 7); x.fill(); x.stroke();
  }
  travel(x: number, z: number) {
    const s = this.save.data;
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
      <div class="side panel"><h3>${s.chapter === 1 ? 'Kapitel 1 · Ankommen' : 'Freies Spiel'}</h3><p><b style="color:#fff">${gl.title}</b><br>${gl.sub || ''}</p>
      <p>🌈 Pride-Sticker: ${stickers}/${STICKERS.length} · 🪩 Tanz-Rekord: ${s.best.dance || 0}<br>✨ Glitzer: ${s.glitter} · 💶 ${s.money} € · Ruf ${s.rep}</p></div>`, [
      { icon: '▶', label: 'Weiterspielen', fn: back },
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
    const choices = [s.flags.feel ? `Ankunft: ${{ excited: 'aufgeregt', nervous: 'nervös', ready: 'bereit' }[s.flags.feel as string]}` : '', s.flags.style ? `Weg fürs Regenbogenhaus: ${style[s.flags.style as string]}` : ''].filter(Boolean);
    this.openMenu(`<div class="col"><div class="logo" style="font-size:clamp(30px,5vw,52px)"><span class="l1">Story</span><small>Ein Leben in allen Farben</small></div><div class="slot"></div></div>
      <div class="side panel"><h3>Deine Entscheidungen</h3><p>${choices.length ? choices.join('<br>') : 'Noch keine – die Stadt merkt sich alles.'}</p></div>`,
    [...CHAPTERS.map((c) => ({ icon: c.n < s.chapter ? '✅' : c.n === s.chapter ? '⭐' : '🔒', label: `Kapitel ${c.n}: ${c.title}`, sub: c.n <= s.chapter ? c.text : 'Folgt in einem kommenden Update', disabled: c.n > s.chapter })),
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
      { icon: '🍸', label: 'Barkeeper-Schicht', sub: 'Folgt im nächsten Update', disabled: true },
      { icon: '🍳', label: 'Küchen-Chaos', sub: 'Folgt im nächsten Update', disabled: true },
      { icon: '🎤', label: 'Bandprobe', sub: 'Folgt im nächsten Update', disabled: true },
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
  }

  credits() {
    this.openMenu(`<div class="col"><div class="panel" style="max-height:70dvh;overflow:auto"><h3>Mitwirkende</h3>
      <p><b style="color:#fff">Pride City</b> – Relaunch von Gay Life! für easygames.</p>
      <p>Figuren und Stadt-Bausteine: <b style="color:#fff">KayKit</b> von Kay Lousberg (Character Pack: Adventurers, City Builder Bits, Furniture Bits, Restaurant Bits) – CC0 1.0. In Pride-Farben umgefärbt.</p>
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
      tram: { t: 'Tram Rainbow City', d: 'Für 2 € in zehn Minuten an jeden Ort. Weitere Viertel folgen.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
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

  /* ---------- Minispiel ---------- */
  goDance(_story: boolean, back?: () => void) {
    this.closeMenu();
    this.loading.show('Club Prisma', 'Tanz-Battle');
    this.loading.progress(.4, 'Lichtshow startet');
    const sc = new DanceScene(this, (won) => {
      const s = this.save.data;
      change(s, { fun: 20, social: 10, energy: -10 }); advance(s, 20);
      const fin = track(s, 'dance');
      this.save.write();
      setTimeout(() => this.done(fin), 1200);
      this.fade(() => {
        if (back) { this.title(); return; }
        this.engine.setScene(this.city); this.city.setPlay();
        danceResult(this.city.ctx(), won);
      });
    });
    sc.build().then(() => { this.loading.progress(1, 'Los!'); this.engine.setScene(sc); this.loading.hide(); });
    music(null);
  }
}
