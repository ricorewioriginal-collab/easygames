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
import { CHAPTERS, goal, danceResult } from './story';

export class Game {
  engine: Engine;
  save = new Save();
  loading = new Loading();
  dialog = new Dialog();
  hud = new Hud();
  touch: Touch;
  city!: CityScene;
  menuOpen = false;
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
    this.hud.onPrompt = () => this.city?.interact();
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
    if (q.has('play') && s.started) { this.city.setPlay(); return; }
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
        if (fromGame) { this.engine.setScene(this.city); this.city.setPlay(); return; }
        this.loadChapter();
      });
    }, () => this.fade(() => (fromGame ? (this.engine.setScene(this.city), this.city.setPlay()) : this.title())));
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
    this.fade(() => { this.engine.setScene(this.city); this.city.setPlay(); });
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
      { icon: '📖', label: 'Story', sub: 'Kapitel und Entscheidungen', fn: () => this.storyMenu(() => { this.closeMenu(); this.pauseMenu(); }) },
      { icon: '👗', label: 'Kleiderschrank', sub: 'Look, Farbwelt, Pronomen', fn: () => this.fade(() => this.creator(true)) },
      { icon: '⚙️', label: 'Optionen', fn: () => this.options(() => { this.closeMenu(); this.pauseMenu(); }) },
      { icon: '💾', label: 'Speichern', fn: () => { this.save.write(); toast('Gespeichert.'); } },
      { icon: '🏠', label: 'Titelbildschirm', sub: 'Speichert automatisch', fn: () => { this.save.write(); this.closeMenu(); this.fade(() => this.title()); } },
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
      <p>Figuren und Stadt-Bausteine: <b style="color:#fff">KayKit</b> von Kay Lousberg (Character Pack: Adventurers, City Builder Bits) – CC0 1.0. In Pride-Farben umgefärbt.</p>
      <p>3D: three.js (MIT). Musik und Klänge werden live im Spiel erzeugt.</p>
      <p>Alle Figuren sind erwachsen und frei erfunden. Zustimmung zählt.</p><div class="slot"></div></div></div>`,
    [{ icon: '←', label: 'Zurück', fn: () => this.title() }], () => this.title());
  }

  placeMenu(id: string) {
    const s = this.save.data;
    const close = () => { this.closeMenu(); this.touch.show(true); };
    const buy = (cost: number, msg: string, fx: () => void) => () => { if (s.money < cost) { toast('Nicht genug Geld.'); sfx('miss'); return; } s.money -= cost; fx(); toast(msg); sfx('coin'); this.city.refreshHud(); close(); };
    const P: Record<string, { t: string; d: string; items: Item[] }> = {
      cafe: { t: 'Café Kaffeeklatsch', d: 'Mo macht den besten Hafer-Cappuccino der Stadt.', items: [
        { icon: '☕', label: 'Cappuccino', sub: '3 € · +1 Ruf beim ersten Mal am Tag', fn: buy(3, 'Lecker! Mo zwinkert dir zu.', () => { if (s.flags.coffee !== s.day) { s.rep++; s.flags.coffee = s.day; } }) },
        { icon: '🍰', label: 'Regenbogenkuchen', sub: '5 €', fn: buy(5, 'Sechs Schichten Glück.', () => {}) }] },
      spaeti: { t: 'Späti Lecker', d: 'Bruno hat alles, was man nachts braucht.', items: [
        { icon: '🥨', label: 'Brezel', sub: '2 €', fn: buy(2, 'Frisch und warm.', () => {}) },
        { icon: '🧃', label: 'Mate', sub: '3 €', fn: buy(3, 'Energie für die Nacht!', () => {}) }] },
      home: { t: 'Deine Wohnung', d: 'Klein, aber deins.', items: [
        { icon: '😴', label: 'Schlafen bis 8 Uhr', sub: 'Speichert das Spiel', fn: () => { close(); this.fade(() => { s.day++; s.time = 2 / 24; this.city.world.setTime(s.time); this.save.write(); toast(`Guten Morgen! Tag ${s.day}.`); this.city.refreshHud(); }); } },
        { icon: '👗', label: 'Kleiderschrank', fn: () => this.fade(() => this.creator(true)) }] },
      club: { t: 'Club Prisma', d: 'Neon, Bass und die beste Tanzfläche der Stadt.', items: [
        { icon: '🪩', label: 'Tanz-Battle', sub: `Rekord ${s.best.dance || 0}`, fn: () => this.goDance(false) }] },
      center: { t: 'Regenbogenhaus', d: 'Beratung, Jugendgruppe, Kaffee und Kummer – seit dreißig Jahren.', items: [
        { icon: '💜', label: 'Spenden', sub: '10 € · +2 Ruf', fn: buy(10, 'Danke! Jedes bisschen hilft.', () => { s.rep += 2; }) }] },
      tram: { t: 'Tram Rainbow City', d: 'Weitere Viertel öffnen sich mit deinem Ruf in kommenden Updates.', items: [] },
    };
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
      this.save.write();
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
