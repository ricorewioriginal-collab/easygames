/* Spielablauf: Ladebildschirm → Titel (Stadt als Kulisse) → Editor → Stadt ↔ Minispiele. Menüs im Konsolen-Stil. */
import { Engine } from '../engine/Engine';
import { Save } from '../engine/Save';
import { trackProgress, preload } from '../engine/Assets';
import { unlock, music, vol, applyVolume, sfx } from '../engine/Audio';
import { Loading, Dialog, Menu, el, $, hints, toast, chapterCard, bindInputMode, type Item } from '../ui/ui';
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
      this.openMenu(frame('Kontakte', `<div class="pbody">${met.length ? met.map((n) => { const f = Number(s.rel[n.id].f) || 0; return `<p><b style="color:${n.color}">●</b> <b>${n.name}</b> <small>(${n.pron})</small><br>${'❤️'.repeat(Math.min(5, Math.ceil(f / 20)))}${'🤍'.repeat(5 - Math.min(5, Math.ceil(f / 20)))} ${f >= 80 ? 'eng befreundet' : f >= 50 ? 'befreundet' : f >= 20 ? 'bekannt' : 'neu'}</p>`; }).join('') : '<p>Noch niemand. Sprich Leute in der Stadt an!</p>'}</div>`),
        [{ icon: '←', label: 'Zurück', fn: home }], home, 'phone');
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
      { icon: '⛶', label: 'Vollbild', sub: 'Ein- oder ausschalten', fn: () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {}); } },
      { icon: '←', label: 'Zurück', fn: back },
    ], back);
    const slot = this.overlay?.querySelector('#cloudSlot'), cm = document.getElementById('cloudMount');
    if (slot && cm) { cm.classList.remove('hidden'); slot.appendChild(cm); }
    hints([['dpad', 'Wählen'], ['lr', 'Ändern'], ['b', 'Zurück']]);
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
        { icon: '🥕', label: 'Lebensmittel', sub: `6 € · 3 Portionen zum Kochen (du hast ${s.food})`, fn: buy(6, 'Ab in den Kühlschrank damit.', () => { s.food += 3; }) }] },
      club: { t: 'Club Prisma', d: 'Neon, Bass und die beste Tanzfläche der Stadt.', items: [
        { icon: '🪩', label: 'Tanz-Battle', sub: `Rekord ${s.best.dance || 0}`, fn: () => this.goDance(false) },
        { icon: '🍹', label: 'Drink an der Bar', sub: '6 € · +10 Spaß · +8 Kontakte', fn: buy(6, 'Prost! 🍹', eat({ fun: 10, social: 8, energy: -3 })) }] },
      center: { t: 'Regenbogenhaus', d: 'Beratung, Jugendgruppe, Kaffee und Kummer – seit dreißig Jahren.', items: [
        { icon: '💜', label: 'Spenden', sub: '10 € · +2 Ruf', fn: buy(10, 'Danke! Jedes bisschen hilft.', () => { s.rep += 2; }) }] },
      boutique: { t: 'Boutique Fabelhaft', d: 'Glitzer, Leder, Regenbogen – hier findest du deinen Look.', items: [
        { icon: '👗', label: 'Neuer Look', sub: 'Zum Kleiderschrank', fn: () => this.fade(() => this.creator(true)) }] },
      gym: { t: 'Muckibude Muskelkater', d: 'Bären, Twinks und alle dazwischen – hier schwitzt die ganze Szene.', items: [
        { icon: '🏋️', label: 'Training', sub: '4 € · 1 Stunde · +15 Spaß, −20 Energie, −20 Hygiene', fn: () => { if (s.needs.energy < 20) { toast('Zu erschöpft fürs Training.'); sfx('miss'); return; } buy(4, 'Gepumpt! 💪', () => { this.pass(60); change(s, { fun: 15, energy: -20, hygiene: -20, hunger: -10 }); })(); } },
        { icon: '🚿', label: 'Duschen', sub: '1 € · Hygiene voll', fn: buy(1, 'Frisch!', () => { this.pass(15); change(s, { hygiene: 100 }); this.done(track(s, 'shower')); }) }] },
      studio: { t: 'Studio Klappe Auf', d: 'Fotostudio für Pässe, Paare und Pride-Plakate.', items: [] },
      tram: { t: 'Tram Rainbow City', d: 'Für 2 € in zehn Minuten an jeden Ort. Weitere Viertel folgen.', items: [
        { icon: '🗺️', label: 'Fahrplan', sub: 'Ziel wählen', fn: () => this.phone('map') }] },
    };
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
