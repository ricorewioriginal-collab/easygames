// Steuert Menü, HUD, Werkzeuge, Fenster und Speichern. Spielregeln liegen in core/, Darstellung in rendering/.
import { BUILDING, BUILDINGS, CATEGORY_LABEL, ROAD_COST } from './catalogs/buildings';
import { CROPS, ITEM, ITEMS, MARKET, ORDERS, RECIPE } from './catalogs/items';
import { ACHIEVEMENTS, NPCS, QUEST, TASK_TEMPLATES } from './catalogs/quests';
import { Audio, type Sfx } from './audio/audio';
import { City, footprint, GIFT_AMOUNT, GIFT_ITEMS, maxEnergy, NEIGHBOR_HELPS, newCityState, SECTOR, sectorCost, utcDay, xpToNext } from './core/city';
import { localKV, parse, SaveManager, saveKey, type Slot } from './core/save';
import type { Building, BuildingDef, Category, CityState, GameEvent, Mode, QuestDef, Rot } from './core/types';
import { Controls } from './input/controls';
import { World, type Quality } from './rendering/world';
import { bridge, NeighborApi, SocialError } from './social/api';
import { helpable, msgName, toPublic, validMsg, visitState, type InboxMsg, type PublicCity } from './social/codec';
import { fmtDur, fmtTime, h, num } from './ui/dom';

type Tool = 'normal' | 'build' | 'road' | 'move' | 'rotate' | 'demolish' | 'info' | 'expand';

interface Settings {
  music: number;
  fx: number;
  amb: number;
  muted: boolean;
  quality: 'auto' | Quality;
  dayNight: boolean;
  bubbles: boolean;
  anim: boolean;
}
interface Profile {
  name: string;
  crest: string;
}

const SETTINGS_KEY = 'ricoville.settings';
const PROFILE_KEY = 'ricoville.profile';
const CRESTS = ['🏰', '🦁', '🦅', '🌻', '⚓', '🍀', '⭐', '🐻', '🦊', '🌊', '🍎', '🎡'];
const CAT_ICON: Record<Category, string> = {
  residential: '🏠', business: '🏪', farm: '🌾', community: '🏛️', production: '🏭', storage: '📦', transport: '🚂', decoration: '🌳', special: '🗼',
};
const BUILD_TABS: Category[] = ['residential', 'business', 'farm', 'production', 'community', 'storage', 'transport', 'special', 'decoration'];
const BUBBLES = [
  'Was für ein schöner Tag in {c}!', 'Der neue Laden ist super!', 'Ich liebe unseren Park.', 'Hat jemand frische Brötchen?', 'Endlich ein Zuhause!',
  'Die Straßen werden immer belebter.', 'Mehr Blumen, bitte!', 'Die Bürgermeisterin macht das toll.', 'Ich geh heute shoppen.', 'Hach, diese Aussicht!',
  'Unser Viertel wird richtig gemütlich.', 'Riecht nach frischem Mehl …', 'Wann kommt der nächste Zug?', 'Hier will ich nie wieder weg!',
];

function loadJSON<T>(k: string, def: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? { ...def, ...(JSON.parse(v) as T) } : def;
  } catch {
    return def;
  }
}
function saveJSON(k: string, v: unknown): void {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* privater Modus */
  }
}

function defIcon(d: BuildingDef): string {
  return d.model.sign ?? (d.cat === 'decoration' ? { tree: '🌳', flowers: '🌷', bench: '🪑', lamp: '💡', fountain: '⛲', fence: '🚧', path: '🟫' }[d.model.kind] ?? '✨' : CAT_ICON[d.cat]);
}

export class App {
  private ui = document.getElementById('ui')!;
  private canvas = document.getElementById('scene') as HTMLCanvasElement;
  private world!: World;
  private controls!: Controls;
  private audio = new Audio();
  private city!: City;
  private saves!: SaveManager;
  private slot: Slot = 'main';
  private offset = 0;
  private settings: Settings = loadJSON<Settings>(SETTINGS_KEY, { music: 0.35, fx: 0.7, amb: 0.3, muted: false, quality: 'auto', dayNight: false, bubbles: true, anim: true });
  private profile: Profile = loadJSON<Profile>(PROFILE_KEY, { name: 'Bürgermeister:in', crest: '🏰' });
  private tool: Tool = 'normal';
  private placing: { def: string; x: number; y: number; rot: Rot; moveUid?: number; set: boolean } | null = null;
  private roadStroke: { sx: number; sy: number; tiles: [number, number][] } | null = null;
  private lastStroke: [number, number][] = [];
  private panel: HTMLElement | null = null;
  private panelRefresh: (() => void) | null = null;
  private saveTimer = 0;
  private syncState: 'ok' | 'saving' | 'conflict' | 'error' = 'ok';
  private inGame = false;
  private unsub: (() => void) | null = null;
  private fps = { t: 0, n: 0, checked: false };
  private seenQuestIntro = new Set<string>();
  private els: Record<string, HTMLElement> = {};
  private e2e = new URLSearchParams(location.search).has('e2e');
  // Nachbarn
  private visit: { nid: string; pub: PublicCity; city: City } | null = null;
  private inbox: InboxMsg[] = [];
  private publishedAt = 0;
  private pendingNeighbor = new URLSearchParams(location.search).get('nachbar');

  async start(progress: (p: number, msg: string) => void): Promise<void> {
    progress(0.15, 'Grafik wird vorbereitet …');
    await new Promise((r) => setTimeout(r, 0));
    const preview = this.loadSlot('main') ?? newCityState('RicoVille', 'relaxed', Date.now());
    this.city = new City(preview, () => this.clock());
    this.world = new World(this.canvas, this.city);
    progress(0.6, 'Stadtmodelle werden gebaut …');
    await new Promise((r) => setTimeout(r, 0));
    this.applySettings();
    this.world.resize();
    this.controls = new Controls(this.canvas, this.world, {
      tap: (x, y) => this.onTap(x, y),
      hover: (x, y) => this.onHover(x, y),
      paints: () => this.tool === 'road',
      paint: (x, y, ph) => this.onPaint(x, y, ph),
    });
    this.controls.enabled = false;
    window.addEventListener('resize', () => this.world.resize());
    window.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('pointerdown', () => this.audio.unlock(), { capture: true });
    window.addEventListener('keydown', () => this.audio.unlock(), { capture: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveNow();
      else if (this.inGame) this.tick();
    });
    window.addEventListener('pagehide', () => this.saveNow());
    window.addEventListener('storage', (e) => {
      if (this.inGame && e.key === saveKey(this.slot) && this.saves.storedRev() > this.city.s.rev) this.conflict();
    });
    window.addEventListener('online', () => this.hud());
    window.addEventListener('offline', () => this.hud());
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.saveNow();
      this.fatal('Die Grafik wurde vom Browser zurückgesetzt. Dein Spielstand ist gespeichert.');
    });
    progress(0.9, 'Spielstand wird geladen …');
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      this.controls.frame(dt);
      this.world.frame(this.settings.anim ? dt : 0);
      this.measureFps(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    setInterval(() => this.tick(), 1000);
    setInterval(() => this.bubble(), 9000);
    (window as unknown as { __rv: unknown }).__rv = {
      app: this,
      get city() {
        return (window as unknown as { __rvApp: App }).__rvApp.city;
      },
      advance: this.e2e ? (sec: number) => ((this.offset += sec * 1000), this.tick()) : undefined,
      stats: () => this.world.stats(),
      /** Nur für Tests: Bildschirmpunkt der Feldmitte und Kamera auf ein Feld richten. */
      screen: (x: number, y: number) => this.world.project(x + 0.5, 0, y + 0.5),
      look: (x: number, y: number) => (this.world.target.set(x, 0, y), this.world.placeCamera()),
      save: () => this.saveNow(),
    };
    (window as unknown as { __rvApp: App }).__rvApp = this;
    progress(1, 'Fertig!');
    this.showMenu();
  }

  private clock(): number {
    return Date.now() + this.offset;
  }
  private loadSlot(slot: Slot): CityState | null {
    return new SaveManager(localKV, slot).load();
  }

  // ================================================================ Einstellungen
  private applySettings(): void {
    const s = this.settings;
    this.audio.vol = { music: s.music, fx: s.fx, amb: s.amb };
    this.audio.muted = s.muted;
    this.audio.apply();
    this.world.setQuality(s.quality === 'auto' ? (matchMedia('(pointer:coarse)').matches ? 'medium' : 'high') : s.quality);
    this.world.dayNight = s.dayNight;
    saveJSON(SETTINGS_KEY, s);
  }
  private measureFps(dt: number): void {
    if (this.fps.checked || this.settings.quality !== 'auto' || !this.inGame) return;
    this.fps.t += dt;
    this.fps.n++;
    if (this.fps.t > 5) {
      this.fps.checked = true;
      const f = this.fps.n / this.fps.t;
      if (f < 28 && this.world.quality !== 'low') {
        this.world.setQuality(this.world.quality === 'high' ? 'medium' : 'low');
        this.toast('Grafik automatisch angepasst, damit es flüssig läuft.');
      }
    }
  }

  // ================================================================ Menü
  private showMenu(): void {
    this.leaveGame();
    this.ui.innerHTML = '';
    const main = this.loadSlot('main');
    const creative = this.loadSlot('creative');
    const cont = main
      ? h('button', { class: 'big-btn primary', id: 'btn-continue', onclick: () => this.enter(this.loadSlot('main')!, 'main') },
          h('span', { class: 'ic' }, main.crest || '🏙️'),
          h('span', {}, 'Meine Stadt', h('small', {}, `${main.name} · Level ${main.level} · ${num(this.popOf(main))} Einwohner · ${num(main.coins)} 💰`)))
      : null;
    const cloud = document.getElementById('cloudMount');
    const card = h('div', { class: 'menu-card' },
      cont,
      h('button', { class: `big-btn ${main ? 'blue' : 'primary'}`, id: 'btn-new', onclick: () => this.newCityDialog() },
        h('span', { class: 'ic' }, '✨'), h('span', {}, 'Neue Stadt', h('small', {}, main ? 'Ersetzt deine Stadt (eine Sicherung bleibt)' : 'Als Gast starten – ganz ohne Konto'))),
      h('button', { class: 'big-btn', id: 'btn-creative', onclick: () => this.enter(creative ?? newCityState('Sandkasten', 'creative', this.clock()), 'creative') },
        h('span', { class: 'ic' }, '🎨'), h('span', {}, 'Kreativ-Sandkasten', h('small', {}, 'Frei bauen, eigener Speicherplatz, ohne Wertung'))),
      h('div', { class: 'menu-row' },
        h('button', { class: 'big-btn', id: 'btn-menu-neighbors', onclick: () => (main ? (this.enter(this.loadSlot('main')!, 'main'), void this.neighborsPanel()) : this.newCityDialog()) }, h('span', { class: 'ic' }, '👥'), 'Nachbarn'),
        h('button', { class: 'big-btn', onclick: () => this.profilePanel() }, h('span', { class: 'ic' }, this.profile.crest), 'Profil'),
        h('button', { class: 'big-btn', onclick: () => this.settingsPanel() }, h('span', { class: 'ic' }, '⚙️'), 'Einstellungen'),
      ),
      h('div', { class: 'menu-row' },
        h('button', { class: 'big-btn', onclick: () => this.helpPanel() }, h('span', { class: 'ic' }, '❓'), 'Hilfe'),
        h('button', { class: 'big-btn', onclick: () => this.toggleFullscreen() }, h('span', { class: 'ic' }, '⛶'), 'Vollbild'),
        h('button', { class: 'big-btn', onclick: () => (location.href = '../') }, h('span', { class: 'ic' }, '🎮'), 'easygames'),
      ),
      h('div', { class: 'cloud-card' }, h('b', {}, '☁️ Google-Speicherstand'), h('div', { id: 'menuCloud' })),
    );
    const title = h('div', { class: 'title' },
      h('div', { class: 'logo', 'aria-label': 'RicoVille' }, ...'RicoVille'.split('').map((c, i) => h('span', { style: `animation-delay:${i * 0.12}s` }, c))),
      h('div', { class: 'tagline' }, 'Deine Stadt lebt!'),
    );
    this.ui.append(h('div', { id: 'menu' }, h('div', { class: 'wrap' }, title, card)));
    if (cloud) {
      cloud.classList.remove('hidden');
      document.getElementById('menuCloud')!.append(cloud);
    }
    this.world.target.set(24, 0, 24);
    this.world.setZoom(0.8);
  }
  private popOf(s: CityState): number {
    return s.buildings.reduce((a, b) => a + (b.state === 'done' ? BUILDING.get(b.def)?.pop ?? 0 : 0), 0);
  }

  private newCityDialog(): void {
    let mode: Mode = 'nostalgic';
    const name = h('input', { type: 'text', id: 'cityname', maxlength: 28, value: 'Sonnental', 'aria-label': 'Stadtname' }) as HTMLInputElement;
    const seg = h('div', { class: 'seg' });
    const modes: [Mode, string, string][] = [
      ['nostalgic', '⚡ Nostalgisch', 'Klassischer Energie- und Sammelzyklus: Aktionen kosten Energie, die sich alle 3 Minuten auflädt.'],
      ['relaxed', '🌿 Entspannt', 'Keine Energie, alle Wartezeiten halbiert.'],
    ];
    const info = h('p', { class: 'meta' });
    const draw = () => {
      seg.innerHTML = '';
      for (const [m, label, txt] of modes) {
        seg.append(h('button', { class: m === mode ? 'on' : '', onclick: () => ((mode = m), draw()) }, label));
        if (m === mode) info.textContent = txt;
      }
    };
    draw();
    this.openPanel('Neue Stadt gründen', h('div', {},
      h('p', {}, 'Wie soll deine Stadt heißen?'), name,
      h('p', {}, h('b', {}, 'Spielweise')), seg, info,
      this.loadSlot('main') ? h('p', { style: 'color:#a12b22' }, '⚠️ Deine bisherige Stadt wird ersetzt. Die vorige Fassung bleibt als Sicherung im Browser.') : null,
      h('div', { class: 'btns' },
        h('button', { class: 'btn good', id: 'btn-found', onclick: () => {
          const s = newCityState(name.value, mode, this.clock());
          const sm = new SaveManager(localKV, 'main');
          sm.load();
          sm.force(s, this.clock());
          this.closePanel();
          this.enter(s, 'main');
        } }, 'Stadt gründen'),
        h('button', { class: 'btn alt', onclick: () => this.closePanel() }, 'Abbrechen'),
      )));
    setTimeout(() => name.select(), 50);
  }

  // ================================================================ Spiel betreten/verlassen
  private enter(state: CityState, slot: Slot): void {
    this.closePanel();
    this.slot = slot;
    this.saves = new SaveManager(localKV, slot);
    this.saves.load();
    this.city = new City(state, () => this.clock());
    this.unsub = this.city.on((e) => this.onEvent(e));
    this.world.setCity(this.city);
    this.world.setZoom(1);
    this.inGame = true;
    this.controls.enabled = true;
    this.buildHud();
    this.city.update();
    this.world.sync();
    this.hud();
    this.saveNow();
    const cloud = document.getElementById('cloudMount');
    if (cloud) {
      cloud.classList.add('hidden');
      document.body.append(cloud);
    }
    this.introQuest();
    if (slot === 'main') void this.socialStart();
  }
  private leaveGame(): void {
    if (!this.inGame) return;
    if (this.visit) this.closeVisit();
    this.saveNow();
    this.setTool('normal');
    this.unsub?.();
    this.inGame = false;
    this.controls.enabled = false;
    this.closePanel();
  }

  // ================================================================ HUD
  private buildHud(): void {
    this.ui.innerHTML = '';
    const tb = (id: string, e: string, label: string, fn: () => void) =>
      (this.els[id] = h('button', { class: 'tb', id: `tb-${id}`, onclick: () => (this.audio.play('click'), fn()), 'aria-label': label }, h('span', { class: 'e' }, e), label));
    const hud = h('div', { id: 'hud' },
      (this.els.city = h('button', { class: 'chip city', onclick: () => this.profilePanel() })),
      (this.els.pop = h('div', { class: 'chip', title: 'Einwohner / Grenze' })),
      (this.els.coins = h('div', { class: 'chip', title: 'Münzen' })),
      (this.els.energy = h('div', { class: 'chip', title: 'Energie' })),
      (this.els.goods = h('button', { class: 'chip', title: 'Lager', onclick: () => this.storagePanel() })),
      h('div', { class: 'grow' }),
      (this.els.sync = h('button', { class: 'chip sync', onclick: () => (this.syncState === 'conflict' ? this.conflict() : this.saveNow(true)) })),
    );
    const bar = h('nav', { id: 'bar', 'aria-label': 'Spielmenü' },
      tb('build', '🏗️', 'Bauen', () => this.buildMenu()),
      tb('road', '🛣️', 'Straße', () => this.setTool(this.tool === 'road' ? 'normal' : 'road')),
      tb('farm', '🌾', 'Farm', () => this.buildMenu('farm')),
      tb('shops', '🏪', 'Geschäfte', () => this.shopsPanel()),
      tb('quests', '📜', 'Aufgaben', () => this.questPanel()),
      tb('transport', '🚂', 'Transport', () => this.transportPanel()),
      tb('storage', '📦', 'Lager', () => this.storagePanel()),
      tb('expand', '🗺️', 'Erweitern', () => this.setTool(this.tool === 'expand' ? 'normal' : 'expand')),
      tb('neighbors', '👥', 'Nachbarn', () => void this.neighborsPanel()),
      tb('settings', '⚙️', 'Optionen', () => this.settingsPanel()),
      tb('menu', '🏠', 'Menü', () => this.showMenu()),
    );
    const tools = h('div', { id: 'tools', 'aria-label': 'Werkzeuge' },
      ...([['normal', '👆', 'Spielen'], ['move', '↔️', 'Versetzen'], ['rotate', '🔄', 'Drehen'], ['demolish', '💥', 'Abriss'], ['info', 'ℹ️', 'Info']] as [Tool, string, string][]).map(([t, e, l]) =>
        (this.els['tool-' + t] = h('button', { class: 'tb', id: `tool-${t}`, onclick: () => this.setTool(t), 'aria-label': l }, h('span', { class: 'e' }, e), l))),
    );
    this.els.placebar = h('div', { id: 'placebar', class: 'hidden' });
    this.els.questfab = h('div', { id: 'questfab' });
    this.els.toast = h('div', { id: 'toast', 'aria-live': 'polite' });
    this.ui.append(hud, this.els.questfab, tools, bar, this.els.placebar, this.els.toast);
    this.setTool('normal');
  }

  private hud(): void {
    if (!this.inGame) return;
    const c = this.city;
    const s = c.s;
    const need = xpToNext(s.level);
    this.els.city!.innerHTML = '';
    this.els.city!.append(h('span', { class: 'lvl' }, s.level), h('span', {}, `${s.crest} ${s.name}`, c.creative ? h('small', {}, ' Kreativ') : h('div', { class: 'xpbar', title: `${s.xp}/${need} EP` }, h('i', { style: `width:${Math.min(100, (s.xp / need) * 100)}%` }))));
    this.els.pop!.innerHTML = `<span class="e">👥</span>${num(c.population())}<small>/${num(c.popCap())}</small>`;
    this.els.coins!.innerHTML = `<span class="e">💰</span>${c.creative ? '∞' : num(s.coins)}`;
    if (c.energyOn) {
      c.regen();
      const nx = c.nextEnergyIn();
      this.els.energy!.classList.remove('hidden');
      this.els.energy!.innerHTML = `<span class="e">⚡</span>${s.energy}<small>/${maxEnergy(s.level)}${nx ? ' · ' + fmtTime(nx) : ''}</small>`;
    } else this.els.energy!.classList.add('hidden');
    this.els.goods!.innerHTML = `<span class="e">📦</span>${c.storageUsed()}<small>/${c.storageCap()}</small>`;
    const off = !navigator.onLine;
    const st = this.syncState;
    this.els.sync!.className = `chip sync ${st === 'conflict' ? 'conflict' : off ? 'offline' : ''}`;
    this.els.sync!.textContent = st === 'conflict' ? '⚠️ Konflikt' : st === 'error' ? '⚠️ Speicherfehler' : st === 'saving' ? '💾 Speichert …' : off ? '📴 Offline · lokal gespeichert' : '✅ Gespeichert';
    // Quest-Knöpfe und Tutorial-Hinweis
    const qs = c.activeQuests();
    const fab = this.els.questfab!;
    fab.innerHTML = '';
    for (const q of qs.slice(0, 4)) {
      const done = c.s.quests[q.id]?.done;
      fab.append(h('button', { class: `qf ${done ? 'done' : ''}`, title: q.title, onclick: () => this.questDetail(q) }, NPCS[q.giver]?.face ?? '📜'));
    }
    const claimable = qs.filter((q) => c.s.quests[q.id]?.done).length + [...(s.daily?.tasks ?? []), ...(s.weekly?.tasks ?? [])].filter((t) => t.c >= t.n && !t.claimed).length;
    this.badge('quests', claimable);
    const ready = s.buildings.filter((b) => ['cash', 'supply'].includes(c.status(b).kind) && BUILDING.get(b.def)!.cat === 'business').length;
    this.badge('shops', ready);
    for (const id of ['build', 'road', 'farm']) this.els[id]?.classList.remove('pulse');
    if (s.tutorial === 'on') {
      const main = qs.find((q) => q.id.startsWith('m') && !c.s.quests[q.id]?.done);
      if (main?.hint && this.els[main.hint]) this.els[main.hint]!.classList.add('pulse');
    }
    this.panelRefresh?.();
  }
  private badge(id: string, n: number): void {
    const el = this.els[id];
    if (!el) return;
    el.querySelector('.badge')?.remove();
    if (n > 0) el.append(h('span', { class: 'badge' }, n));
  }

  private tick(): void {
    if (!this.inGame) return;
    this.city.update();
    this.world.sync();
    this.hud();
  }

  // ================================================================ Ereignisse → Rückmeldung
  private onEvent(e: GameEvent): void {
    const sfx: Record<string, Sfx> = { harvested: 'harvest', planted: 'plant', supplied: 'deliver', delivery: 'deliver', road: 'road', placed: 'build', delivered: 'deliver', upgraded: 'build', expanded: 'level', started: 'click', orderStarted: 'deliver', bought: 'coin' };
    if (sfx[e.type]) this.audio.play(sfx[e.type]!);
    switch (e.type) {
      case 'reward':
        if (e.coins || e.xp) {
          this.audio.play('coin');
          this.floatAt(e.uid, `${e.coins ? `+${num(e.coins)} 💰 ` : ''}${e.xp ? `+${e.xp} ⭐` : ''}`);
        }
        break;
      case 'harvested':
      case 'produced':
        this.floatAt(e.uid, `+${e.n} ${ITEM.get(e.id ?? '')?.icon ?? ''}`, 400);
        if (e.type === 'produced') this.audio.play('harvest');
        break;
      case 'finished': {
        const d = BUILDING.get(e.id ?? '');
        if (d?.cat === 'residential' && e.uid) {
          this.world.moveIn(e.uid, e.n ?? 3);
          this.floatAt(e.uid, `+${e.n} Einwohner ziehen ein 🏡`, 300);
        }
        if (d && d.cat !== 'decoration') this.audio.play('build');
        break;
      }
      case 'levelup':
        this.audio.play('level');
        this.levelUp(e.n ?? 1, e.coins ?? 0);
        break;
      case 'questDone': {
        const q = QUEST.get(e.id ?? '');
        if (q) {
          this.audio.play('quest');
          this.toast(`📜 Erfüllt: ${q.title} – Belohnung abholen!`, 'good');
        }
        break;
      }
      case 'questClaimed':
        setTimeout(() => this.introQuest(), 400);
        break;
      case 'achievement': {
        const a = ACHIEVEMENTS.find((x) => x.id === e.id);
        if (a) this.toast(`${a.icon} Erfolg: ${a.name}`, 'good');
        break;
      }
      case 'expanded':
        this.toast('🗺️ Neues Gebiet erschlossen!', 'good');
        break;
      case 'gift':
        this.audio.play('deliver');
        this.floatAt(undefined, `+${e.n} ${ITEM.get(e.id ?? '')?.icon ?? '🎁'}`);
        break;
    }
    this.world.sync();
    this.hud();
    this.scheduleSave();
  }

  private floatAt(uid: number | undefined, text: string, delay = 0): void {
    const p = uid !== undefined ? this.world.buildingTop(uid) : null;
    const pos = p ? this.world.project(p.x, p.y + 0.6, p.z) : { x: innerWidth / 2, y: innerHeight / 2 };
    setTimeout(() => {
      const el = h('div', { class: 'float', style: `left:${pos.x}px;top:${pos.y}px` }, text);
      document.body.append(el);
      setTimeout(() => el.remove(), 1500);
    }, delay);
  }
  private toast(msg: string, kind: '' | 'good' | 'bad' = ''): void {
    const host = this.els.toast;
    if (!host) return;
    const el = h('div', { class: `toast ${kind}` }, msg);
    host.append(el);
    while (host.children.length > 3) host.firstElementChild?.remove();
    setTimeout(() => el.remove(), kind === 'bad' ? 2600 : 3200);
  }
  private fail(msg?: string): void {
    this.audio.play('error');
    this.toast(msg ?? 'Das geht gerade nicht.', 'bad');
  }
  private bubble(): void {
    if (!this.inGame || this.visit || !this.settings.bubbles || this.panel || document.hidden) return;
    const homes = this.city.s.buildings.filter((b) => b.state === 'done' && ['residential', 'business'].includes(BUILDING.get(b.def)!.cat));
    if (!homes.length) return;
    const b = homes[Math.floor(Math.random() * homes.length)]!;
    const p = this.world.buildingTop(b.uid);
    if (!p) return;
    const pos = this.world.project(p.x, p.y + 0.9, p.z);
    if (pos.x < 0 || pos.y < 60 || pos.x > innerWidth || pos.y > innerHeight - 80) return;
    const t = BUBBLES[Math.floor(Math.random() * BUBBLES.length)]!.replace('{c}', this.city.s.name);
    const el = h('div', { class: 'bubble', style: `left:${pos.x}px;top:${pos.y}px` }, t);
    document.body.append(el);
    setTimeout(() => el.remove(), 3600);
  }

  // ================================================================ Speichern
  private scheduleSave(): void {
    if (!this.inGame) return;
    this.syncState = this.syncState === 'conflict' ? 'conflict' : 'saving';
    clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.saveNow(), 1200);
  }
  saveNow(manual = false): void {
    if (!this.inGame || !this.saves || this.syncState === 'conflict') return;
    clearTimeout(this.saveTimer);
    const r = this.saves.save(this.city.s, this.clock());
    if (r.ok) {
      this.syncState = 'ok';
      if (manual) this.toast('💾 Gespeichert.');
    } else if (r.msg === 'conflict') this.conflict();
    else {
      this.syncState = 'error';
      this.toast('Speichern fehlgeschlagen: ' + r.msg, 'bad');
    }
    this.hud();
  }
  private conflict(): void {
    this.syncState = 'conflict';
    this.hud();
    const stored = parse(localStorage.getItem(saveKey(this.slot)));
    this.openPanel('Neuerer Spielstand gefunden', h('div', {},
      h('p', {}, 'Deine Stadt wurde inzwischen in einem anderen Tab oder auf einem anderen Gerät weitergespielt. Damit nichts verloren geht, wurde hier nicht überschrieben.'),
      stored ? h('div', { class: 'kv' },
        h('span', {}, 'Gespeicherter Stand'), h('span', {}, `Level ${stored.level} · ${num(stored.coins)} 💰 · ${new Date(stored.savedAt).toLocaleString('de-DE')}`),
        h('span', {}, 'Dieser Tab'), h('span', {}, `Level ${this.city.s.level} · ${num(this.city.s.coins)} 💰`)) : null,
      h('div', { class: 'btns' },
        h('button', { class: 'btn good', onclick: () => {
          const s = this.saves.adopt();
          this.syncState = 'ok';
          this.closePanel();
          if (s) this.enter(s, this.slot);
        } }, 'Neueren Stand laden'),
        h('button', { class: 'btn alt', onclick: () => {
          this.syncState = 'ok';
          this.saves.force(this.city.s, this.clock());
          this.closePanel();
          this.toast('Dieser Stand wurde gespeichert.');
          this.hud();
        } }, 'Diesen Stand behalten'),
      )), false);
  }

  // ================================================================ Werkzeuge
  private setTool(t: Tool): void {
    if (this.tool === 'expand') this.world.showSectors(false);
    this.tool = t;
    if (t !== 'build' && t !== 'move') {
      this.placing = null;
      this.world.showGhost(null);
    }
    this.world.showTile(0, 0, null);
    for (const k of ['normal', 'move', 'rotate', 'demolish', 'info']) this.els['tool-' + k]?.classList.toggle('on', k === t || (k === 'normal' && ['build', 'road', 'expand'].includes(t)));
    this.els.road?.classList.toggle('on', t === 'road');
    this.els.expand?.classList.toggle('on', t === 'expand');
    this.els.build?.classList.toggle('on', t === 'build');
    if (t === 'expand') this.world.showSectors(true);
    this.placebar();
  }

  private placebar(msg?: string, ok?: boolean): void {
    const pb = this.els.placebar;
    if (!pb) return;
    pb.innerHTML = '';
    const t = this.tool;
    const label: Partial<Record<Tool, string>> = {
      road: `🛣️ Ziehen oder tippen = Straße bauen (${ROAD_COST} 💰/Feld)`,
      move: this.placing ? 'Neuen Platz antippen' : '↔️ Tippe ein Gebäude zum Versetzen an',
      rotate: '🔄 Tippe ein Gebäude zum Drehen an',
      demolish: '💥 Tippe ein Gebäude oder eine Straße zum Abreißen an',
      info: 'ℹ️ Tippe ein Gebäude für Details an',
      expand: '🗺️ Tippe ein gelbes Gebiet zum Erschließen an',
    };
    if (t === 'normal') return pb.classList.add('hidden');
    pb.classList.remove('hidden');
    if ((t === 'build' || t === 'move') && this.placing) {
      const d = BUILDING.get(this.placing.def)!;
      const chk = this.placing.set ? this.checkPlacing() : { ok: false, msg: 'Platz auf der Karte antippen' };
      pb.append(
        h('span', { class: 'msg' }, `${defIcon(d)} ${d.name}${this.placing.moveUid ? '' : ` · ${num(d.cost)} 💰`}`, h('br'), h('small', {}, msg ?? chk.msg ?? 'Passt! ✓ zum Bauen')),
        h('button', { onclick: () => this.rotatePlacing(), 'aria-label': 'Drehen', title: 'Drehen (R)' }, '⟳'),
        h('button', { class: 'ok', id: 'place-ok', disabled: !chk.ok || ok === false, onclick: () => this.confirmPlace(), 'aria-label': 'Bauen' }, '✓'),
        h('button', { class: 'no', onclick: () => this.setTool('normal'), 'aria-label': 'Abbrechen' }, '✕'),
      );
      return;
    }
    pb.append(h('span', { class: 'msg' }, msg ?? label[t] ?? ''));
    if (t === 'road' && this.lastStroke.length)
      pb.append(h('button', { onclick: () => this.undoRoad(), id: 'road-undo' }, '↶ Rückgängig'));
    pb.append(h('button', { class: 'no', onclick: () => this.setTool('normal') }, '✕'));
  }

  private checkPlacing(): { ok: boolean; msg?: string } {
    const p = this.placing!;
    return this.city.canPlace(p.def, p.x, p.y, p.rot, p.moveUid, !!p.moveUid);
  }
  private rotatePlacing(): void {
    if (!this.placing) return;
    this.placing.rot = ((this.placing.rot + 1) % 4) as Rot;
    this.refreshGhost();
  }
  private refreshGhost(): void {
    const p = this.placing;
    if (!p) return;
    const chk = this.checkPlacing();
    this.world.showGhost(p.set ? p.def : null, p.x, p.y, p.rot, chk.ok);
    this.placebar();
  }
  private startPlacing(defId: string, moveUid?: number): void {
    const b = moveUid ? this.city.get(moveUid) : undefined;
    this.closePanel();
    this.tool = moveUid ? 'move' : 'build';
    const t = this.world.target;
    const d = BUILDING.get(defId)!;
    this.placing = { def: defId, x: b?.x ?? Math.floor(t.x - d.w / 2), y: b?.y ?? Math.floor(t.z - d.h / 2), rot: b?.rot ?? 0, moveUid, set: !!b || !matchMedia('(pointer:fine)').matches };
    if (this.placing.set && !b) this.placing.set = true;
    this.setToolButtons();
    this.refreshGhost();
  }
  private setToolButtons(): void {
    for (const k of ['normal', 'move', 'rotate', 'demolish', 'info']) this.els['tool-' + k]?.classList.toggle('on', k === this.tool);
    this.els.build?.classList.toggle('on', this.tool === 'build');
  }
  private confirmPlace(): void {
    const p = this.placing;
    if (!p) return;
    if (p.moveUid) {
      const r = this.city.move(p.moveUid, p.x, p.y, p.rot);
      if (!r.ok) return this.fail(r.msg);
      this.audio.play('build');
      this.setTool('normal');
      return;
    }
    const r = this.city.place(p.def, p.x, p.y, p.rot);
    if (!r.ok) return this.fail(r.msg);
    const d = BUILDING.get(p.def)!;
    if (d.materials && this.city.get(r.uid!)?.state === 'site') this.toast(`🧱 Fundament gelegt – liefere jetzt Material an die Baustelle.`);
    // Kleine, häufige Objekte bleiben im Baumodus
    if (['decoration', 'farm'].includes(d.cat) && this.city.canPlace(p.def, p.x, p.y, p.rot).msg !== undefined) {
      this.refreshGhost();
      return;
    }
    this.setTool('normal');
  }

  private tileAt(cx: number, cy: number): { x: number; y: number; uid?: number } | null {
    return this.world.pick(cx, cy);
  }

  private onHover(cx: number, cy: number): void {
    if (!this.inGame) return;
    const t = this.tileAt(cx, cy);
    if (!t) return;
    if ((this.tool === 'build' || (this.tool === 'move' && this.placing)) && this.placing) {
      const d = BUILDING.get(this.placing.def)!;
      const { w, h: hh } = footprint(d, this.placing.rot);
      const nx = t.x - Math.floor((w - 1) / 2);
      const ny = t.y - Math.floor((hh - 1) / 2);
      if (nx !== this.placing.x || ny !== this.placing.y || !this.placing.set) {
        this.placing.x = nx;
        this.placing.y = ny;
        this.placing.set = true;
        this.refreshGhost();
      }
    } else if (this.tool === 'road') this.world.showTile(t.x, t.y, this.city.canRoad(t.x, t.y).ok);
  }

  private onTap(cx: number, cy: number): void {
    if (!this.inGame) return;
    if (this.panel) return this.closePanel();
    if (this.visit) {
      const t = this.tileAt(cx, cy);
      const vb = t ? (t.uid !== undefined ? this.visit.city.get(t.uid) : this.visit.city.at(t.x, t.y)) : undefined;
      if (vb) this.helpAt(vb);
      return;
    }
    const t = this.tileAt(cx, cy);
    if (!t) return;
    const b = t.uid !== undefined ? this.city.get(t.uid) : this.city.at(t.x, t.y);
    switch (this.tool) {
      case 'build':
      case 'move': {
        if (this.tool === 'move' && !this.placing) {
          if (!b) return;
          if (b.def === 'rathaus') return this.fail('Das Rathaus bleibt an seinem Platz.');
          return this.startPlacing(b.def, b.uid);
        }
        const p = this.placing!;
        const d = BUILDING.get(p.def)!;
        const { w, h: hh } = footprint(d, p.rot);
        const nx = t.x - Math.floor((w - 1) / 2);
        const ny = t.y - Math.floor((hh - 1) / 2);
        if (p.set && nx === p.x && ny === p.y) return this.confirmPlace();
        p.x = nx;
        p.y = ny;
        p.set = true;
        this.refreshGhost();
        if (matchMedia('(pointer:fine)').matches && this.checkPlacing().ok) this.confirmPlace();
        return;
      }
      case 'road':
        return;
      case 'rotate': {
        if (!b) return;
        const r = this.city.move(b.uid, b.x, b.y, ((b.rot + 1) % 4) as Rot);
        if (!r.ok) this.fail(r.msg);
        else this.audio.play('click');
        return;
      }
      case 'demolish': {
        if (!b) {
          if (this.city.roads().has(`${t.x},${t.y}`)) {
            const r = this.city.removeRoad(t.x, t.y);
            if (!r.ok) this.fail(r.msg);
            else this.audio.play('road');
          }
          return;
        }
        return this.confirmDemolish(b);
      }
      case 'info':
        if (b) this.infoPanel(b);
        return;
      case 'expand': {
        const sx = Math.floor(t.x / SECTOR);
        const sy = Math.floor(t.y / SECTOR);
        const can = this.city.canExpand(sx, sy);
        if (this.city.s.sectors.includes(`${sx},${sy}`)) return;
        const c = sectorCost(this.city.s.sectors.length);
        this.openPanel('Gebiet erschließen', h('div', {},
          h('p', {}, `Neues Bauland (${SECTOR}×${SECTOR} Felder) für ${this.city.creative ? 'kostenlos' : `${num(c.coins)} 💰`}. Benötigt ${c.pop} Einwohner.`),
          !can.ok ? h('p', { style: 'color:#a12b22' }, can.msg ?? '') : null,
          h('div', { class: 'btns' },
            h('button', { class: 'btn good', disabled: !can.ok, id: 'btn-expand', onclick: () => {
              const r = this.city.expand(sx, sy);
              this.closePanel();
              if (!r.ok) return this.fail(r.msg);
              this.world.showSectors(true);
            } }, 'Erschließen'),
            h('button', { class: 'btn alt', onclick: () => this.closePanel() }, 'Abbrechen'))));
        return;
      }
      default:
        if (b) this.interact(b);
    }
  }

  /** Normales Antippen: das Naheliegende sofort tun (Kassieren, Ernten, Beliefern), sonst passendes Fenster. */
  private interact(b: Building): void {
    const st = this.city.status(b);
    const d = BUILDING.get(b.def)!;
    switch (st.kind) {
      case 'rent':
      case 'cash':
      case 'harvest':
      case 'ready': {
        const r = this.city.collect(b.uid);
        if (!r.ok) this.fail(r.msg);
        return;
      }
      case 'supply': {
        const r = this.city.supply(b.uid);
        if (!r.ok) {
          this.infoPanel(b);
          this.toast(r.msg ?? '', 'bad');
        }
        return;
      }
      case 'plant':
        return this.seedPanel(b);
      case 'idle':
        return d.cat === 'production' ? this.productionPanel(b) : this.ordersPanel(b);
      default:
        return this.infoPanel(b);
    }
  }

  private onPaint(cx: number, cy: number, phase: 'start' | 'move' | 'end'): void {
    const t = this.tileAt(cx, cy);
    if (phase === 'start') {
      if (!t) return;
      this.roadStroke = { sx: t.x, sy: t.y, tiles: [[t.x, t.y]] };
    } else if (this.roadStroke && t) {
      const { sx, sy } = this.roadStroke;
      // L-förmiger Weg: erst die längere Achse, dann die kürzere
      const tiles: [number, number][] = [];
      const horizFirst = Math.abs(t.x - sx) >= Math.abs(t.y - sy);
      const cx2 = horizFirst ? t.x : sx;
      const cy2 = horizFirst ? sy : t.y;
      const line = (x0: number, y0: number, x1: number, y1: number) => {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let i = 0; i <= n; i++) tiles.push([x0 + Math.sign(x1 - x0) * Math.min(i, Math.abs(x1 - x0)), y0 + Math.sign(y1 - y0) * Math.min(i, Math.abs(y1 - y0))]);
      };
      line(sx, sy, cx2, cy2);
      line(cx2, cy2, t.x, t.y);
      this.roadStroke.tiles = tiles.filter((p, i) => tiles.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
      const last = this.roadStroke.tiles[this.roadStroke.tiles.length - 1]!;
      this.world.showTile(last[0], last[1], this.city.canRoad(last[0], last[1]).ok);
      const cost = this.roadStroke.tiles.filter(([x, y]) => this.city.canRoad(x, y).ok).length * ROAD_COST;
      this.placebar(`🛣️ ${this.roadStroke.tiles.length} Felder · ${cost} 💰 – loslassen zum Bauen`);
    }
    if (phase === 'end' && this.roadStroke) {
      const placed: [number, number][] = [];
      let err: string | undefined;
      for (const [x, y] of this.roadStroke.tiles) {
        const r = this.city.placeRoad(x, y);
        if (r.ok) placed.push([x, y]);
        else if (!err && !/schon eine Straße/.test(r.msg ?? '')) err = r.msg;
      }
      this.roadStroke = null;
      if (placed.length) this.lastStroke = placed;
      else if (err) this.fail(err);
      this.placebar();
    }
  }
  private undoRoad(): void {
    for (const [x, y] of this.lastStroke) this.city.removeRoad(x, y, true);
    this.lastStroke = [];
    this.placebar();
    this.world.sync();
    this.hud();
    this.scheduleSave();
  }

  private onKey(e: KeyboardEvent): void {
    if ((e.target as HTMLElement)?.closest?.('input,textarea,select')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      if (this.panel) this.closePanel();
      else if (this.inGame) this.setTool('normal');
    }
    if (!this.inGame || this.panel || this.visit) return;
    if (k === 'r' && this.placing) this.rotatePlacing();
    if (k === 'q') this.world.yaw += Math.PI / 2;
    if (k === 'e') this.world.yaw -= Math.PI / 2;
    if (k === 'b') this.buildMenu();
    if (k === 't') this.setTool(this.tool === 'road' ? 'normal' : 'road');
    if (k === 'l') this.questPanel();
    if (k === 'f') this.toggleFullscreen();
    if (k === 'enter' && this.placing) this.confirmPlace();
  }

  private confirmDemolish(b: Building): void {
    const d = BUILDING.get(b.def)!;
    const refund = this.city.creative ? 0 : this.city.demolishRefund(b);
    this.openPanel(`${d.name} abreißen?`, h('div', {},
      h('p', {}, `Du erhältst ${num(refund)} 💰 zurück (die Hälfte des Baupreises). Gelieferte Materialien und laufende Vorgänge gehen verloren.`),
      h('div', { class: 'btns' },
        h('button', { class: 'btn bad', id: 'btn-demolish', onclick: () => {
          const r = this.city.demolish(b.uid);
          this.closePanel();
          if (!r.ok) this.fail(r.msg);
          else this.audio.play('build');
        } }, 'Abreißen'),
        h('button', { class: 'btn alt', onclick: () => this.closePanel() }, 'Behalten'))));
  }

  // ================================================================ Fenster
  private openPanel(title: string, body: HTMLElement, closable = true, wide = false, tabs?: HTMLElement, refresh?: () => void): void {
    this.closePanel();
    const p = h('section', { class: `panel ${wide ? 'wide' : ''}`, role: 'dialog', 'aria-label': title },
      h('header', {}, h('h2', {}, title), closable ? h('button', { class: 'x', 'aria-label': 'Schließen', onclick: () => this.closePanel() }, '✕') : null),
      tabs ?? null,
      h('div', { class: 'body' }, body));
    p.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.ui.append(p);
    this.panel = p;
    this.panelRefresh = refresh ?? null;
  }
  private closePanel(): void {
    this.panel?.remove();
    this.panel = null;
    this.panelRefresh = null;
  }
  /** Fenster mit Inhalt, der sich jede Sekunde aktualisiert (Timer). */
  private livePanel(title: string, render: () => HTMLElement, wide = false, tabs?: HTMLElement): void {
    const holder = h('div', {}, render());
    this.openPanel(title, holder, true, wide, tabs, () => {
      const sc = holder.parentElement?.scrollTop ?? 0;
      holder.replaceChildren(render());
      if (holder.parentElement) holder.parentElement.scrollTop = sc;
    });
  }

  private buildMenu(cat: Category = 'residential'): void {
    if (!this.inGame) return;
    const tabs = h('div', { class: 'tabs', role: 'tablist' });
    const grid = h('div', { class: 'grid' });
    const draw = (c: Category) => {
      tabs.innerHTML = '';
      for (const t of BUILD_TABS) tabs.append(h('button', { class: `tab ${t === c ? 'on' : ''}`, role: 'tab', onclick: () => draw(t) }, `${CAT_ICON[t]} ${CATEGORY_LABEL[t]}`));
      grid.innerHTML = '';
      const list = BUILDINGS.filter((b) => b.cat === c && b.level < 99).sort((a, b) => a.level - b.level || a.cost - b.cost);
      for (const d of list) {
        const locked = d.level > this.city.s.level && !this.city.creative;
        const maxed = !!d.max && this.city.count(d.id) >= d.max;
        const meta: string[] = [`${d.w}×${d.h}`];
        if (d.pop) meta.push(`👥 ${d.pop}`, `💰 ${d.rent}/${fmtDur(this.city.dur(d.rentTime ?? 0) / 1000)}`);
        if (d.revenue) meta.push(`💵 ${d.revenue}/${fmtDur(this.city.dur(d.saleTime ?? 0) / 1000)}`, `ab 👥 ${d.minPop}`);
        if (d.popCap) meta.push(`+${d.popCap} Einwohnergrenze`);
        if (d.storage) meta.push(`+${d.storage} Lager`);
        if (d.appeal) meta.push(`✨ +${d.appeal}`);
        if (d.recipes) meta.push(d.recipes.map((r) => ITEM.get(RECIPE.get(r)!.output)!.icon).join(' '));
        if (d.materials) meta.push('🧱 ' + Object.entries(d.materials).map(([k, v]) => `${v} ${ITEM.get(k)!.icon}`).join(' '));
        if (d.buildTime) meta.push(`🔨 ${fmtDur(this.city.dur(d.buildTime) / 1000)}`);
        grid.append(h('button', {
          class: `card ${locked || maxed ? 'locked' : ''}`, 'data-def': d.id, title: d.desc,
          onclick: () => (locked ? this.fail(`Ab Stadtlevel ${d.level}.`) : maxed ? this.fail('Davon gibt es schon eines.') : this.startPlacing(d.id)),
        },
          h('div', { class: 'pic' }, defIcon(d)), h('b', {}, d.name), h('div', { class: 'meta' }, meta.join(' · ')),
          h('div', { class: 'price' }, locked ? `🔒 Level ${d.level}` : d.cost ? `${num(d.cost)} 💰` : 'kostenlos')));
      }
    };
    draw(cat);
    this.openPanel('Bauen', grid, true, true, tabs);
  }

  private statusText(b: Building): string {
    const st = this.city.status(b);
    const left = st.at ? fmtTime(st.at - this.city.now()) : '';
    const m: Record<string, string> = {
      materials: '🧱 Baustelle wartet auf Material', building: `🔨 Im Bau – fertig in ${left}`, noroad: '🚧 Keine Straße angeschlossen',
      rent: '💰 Miete abholbereit', wait: `⏳ Nächste Miete in ${left}`, supply: '📦 Braucht Waren', cash: '💵 Ausverkauft – Einnahmen kassieren',
      selling: `🛍️ Verkauft – fertig in ${left}`, plant: '🌱 Bereit zum Säen', harvest: '🌾 Reif – ernten!', growing: `🌿 Wächst – reif in ${left}`,
      idle: '💤 Bereit für einen Auftrag', ready: '✅ Fertig – abholen!', working: `⚙️ Läuft – fertig in ${left}`, none: '',
    };
    return m[st.kind] ?? '';
  }

  private infoPanel(b: Building): void {
    const render = (): HTMLElement => {
      const cur = this.city.get(b.uid);
      if (!cur) return h('p', {}, 'Dieses Gebäude gibt es nicht mehr.');
      const d = BUILDING.get(cur.def)!;
      const c = this.city;
      const kv = h('div', { class: 'kv' });
      const add = (k: string, v: string) => kv.append(h('span', {}, k), h('span', {}, v));
      add('Art', `${CAT_ICON[d.cat]} ${CATEGORY_LABEL[d.cat]}`);
      if (d.pop) {
        add('Einwohner', `${d.pop}`);
        add('Miete', `${c.rentOf(cur)} 💰 alle ${fmtDur(c.dur(d.rentTime ?? 0) / 1000)}`);
        add('Zufriedenheit', `${c.happiness()} % (Mietfaktor ×${c.rentFactor().toFixed(2).replace('.', ',')})`);
      }
      if (d.revenue) {
        add('Erlös', `${c.revenueOf(cur)} 💰 in ${fmtDur(c.dur(d.saleTime ?? 0) / 1000)}`);
        add('Braucht', `${d.stockPer} × ` + (d.accepts ?? []).map((i) => `${ITEM.get(i)!.icon} ${ITEM.get(i)!.name} (${c.item(i)})`).join(', '));
      }
      if (d.pop || d.revenue) {
        add('Attraktivität', `+${Math.round(c.appeal(cur) * 100)} % durch Deko`);
        add('Ausbaustufe', `${cur.lvl ?? 1} / 3`);
      }
      if (d.popCap) add('Einwohnergrenze', `+${d.popCap}`);
      if (d.happiness) add('Zufriedenheit', `+${d.happiness}`);
      if (d.appeal) add('Attraktivität', `+${d.appeal} im Umkreis von ${d.radius} Feldern`);
      if (d.storage) add('Lagerplätze', `+${d.storage}`);
      if (d.bonus) add('Stadtbonus', Object.entries(d.bonus).map(([k, v]) => `+${Math.round(v * 100)} % ${{ rent: 'Miete', revenue: 'Erlös', xp: 'Erfahrung' }[k]}`).join(', '));
      const acts = h('div', { class: 'btns' });
      const st = c.status(cur);
      if (['rent', 'cash', 'harvest', 'ready'].includes(st.kind)) acts.append(h('button', { class: 'btn good', onclick: () => this.act(c.collect(cur.uid)) }, 'Abholen'));
      if (st.kind === 'supply') acts.append(h('button', { class: 'btn good', id: 'btn-supply', disabled: !c.supplyChoice(cur), onclick: () => this.act(c.supply(cur.uid)) }, '📦 Beliefern'));
      if (st.kind === 'plant') acts.append(h('button', { class: 'btn good', onclick: () => this.seedPanel(cur) }, '🌱 Säen'));
      if (st.kind === 'idle') acts.append(h('button', { class: 'btn good', onclick: () => (d.cat === 'production' ? this.productionPanel(cur) : this.ordersPanel(cur)) }, 'Auftrag wählen'));
      if (cur.state === 'site') acts.append(h('button', { class: 'btn good', onclick: () => this.sitePanel(cur) }, '🧱 Material liefern'));
      if ((d.pop || d.revenue) && cur.state === 'done' && (cur.lvl ?? 1) < 3)
        acts.append(h('button', { class: 'btn warn', disabled: !c.creative && c.s.coins < c.upgradeCost(cur), onclick: () => this.act(c.upgrade(cur.uid)) }, `⬆️ Ausbauen (${num(c.upgradeCost(cur))} 💰, +20 %)`));
      if (d.id !== 'rathaus') {
        acts.append(h('button', { class: 'btn alt', onclick: () => this.startPlacing(cur.def, cur.uid) }, '↔️ Versetzen'));
        acts.append(h('button', { class: 'btn alt', onclick: () => this.act(c.move(cur.uid, cur.x, cur.y, ((cur.rot + 1) % 4) as Rot)) }, '🔄 Drehen'));
        acts.append(h('button', { class: 'btn alt', onclick: () => this.confirmDemolish(cur) }, '💥 Abreißen'));
      }
      return h('div', {}, h('p', {}, h('b', {}, this.statusText(cur))), h('p', { class: 'meta' }, d.desc), kv, acts);
    };
    this.livePanel(`${defIcon(BUILDING.get(b.def)!)} ${BUILDING.get(b.def)!.name}`, render);
  }
  private act(r: { ok: boolean; msg?: string }): void {
    if (!r.ok) this.fail(r.msg);
  }

  private seedPanel(b: Building): void {
    const d = BUILDING.get(b.def)!;
    const render = () => {
      const g = h('div', { class: 'grid' });
      for (const c of CROPS) {
        const locked = c.level > this.city.s.level && !this.city.creative;
        g.append(h('button', { class: `card ${locked ? 'locked' : ''}`, 'data-crop': c.id, onclick: () => {
          if (locked) return this.fail(`${c.name} gibt es ab Level ${c.level}.`);
          const r = this.city.plant(b.uid, c.id);
          if (!r.ok) return this.fail(r.msg);
          this.closePanel();
        } },
          h('div', { class: 'pic' }, c.icon), h('b', {}, c.name),
          h('div', { class: 'meta' }, `⏱ ${fmtDur(this.city.dur(c.time * (d.growFactor ?? 1)) / 1000)} · Ertrag ${c.yield} · +${c.xp} ⭐`),
          h('div', { class: 'price' }, locked ? `🔒 Level ${c.level}` : `${c.seed} 💰`)));
      }
      const empty = this.city.s.buildings.filter((x) => BUILDING.get(x.def)!.cat === 'farm' && x.state === 'done' && !x.job);
      const all = h('div', { class: 'btns' }, h('span', { class: 'meta' }, `${empty.length} freie Äcker. `),
        h('button', { class: 'btn alt', onclick: () => {
          const last = (this.city.s.stats.lastCrop ?? 0) as number;
          const crop = CROPS[last] && CROPS[last]!.level <= this.city.s.level ? CROPS[last]! : CROPS[0]!;
          let n = 0;
          for (const p of empty) if (this.city.plant(p.uid, crop.id).ok) n++;
          if (!n) this.fail('Keine Energie oder Münzen mehr.');
          this.closePanel();
        } }, `Alle freien mit ${CROPS[(this.city.s.stats.lastCrop ?? 0) as number]?.icon ?? '🍓'} besäen`));
      return h('div', {}, g, all);
    };
    this.livePanel('Was soll wachsen?', render, true);
    // Merkt sich die zuletzt gewählte Pflanze für „Alle besäen“
    this.panel?.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).closest('[data-crop]')?.getAttribute('data-crop');
      const i = CROPS.findIndex((c) => c.id === id);
      if (i >= 0) this.city.s.stats.lastCrop = i;
    }, { capture: true });
  }

  private productionPanel(b: Building): void {
    const render = () => {
      const cur = this.city.get(b.uid);
      if (!cur) return h('p', {}, '–');
      const d = BUILDING.get(cur.def)!;
      const wrap = h('div', {}, h('p', {}, h('b', {}, this.statusText(cur))));
      if (cur.job && this.city.status(cur).kind === 'ready') wrap.append(h('button', { class: 'btn good', onclick: () => this.act(this.city.collect(cur.uid)) }, 'Abholen'));
      for (const rid of d.recipes ?? []) {
        const r = RECIPE.get(rid)!;
        const out = ITEM.get(r.output)!;
        const has = Object.entries(r.inputs).every(([k, v]) => this.city.item(k) >= v);
        wrap.append(h('div', { class: 'row' },
          h('div', { style: 'font-size:30px' }, out.icon),
          h('div', { class: 'f' }, h('b', {}, `${r.amount} × ${out.name}`),
            h('small', {}, Object.entries(r.inputs).map(([k, v]) => `${v} ${ITEM.get(k)!.icon} ${ITEM.get(k)!.name} (${this.city.item(k)})`).join(' + ') + ` · ⏱ ${fmtDur(this.city.dur(r.time) / 1000)}`)),
          h('button', { class: 'btn', disabled: !!cur.job || !has, 'data-recipe': rid, onclick: () => this.act(this.city.startProduction(cur.uid, rid)) }, 'Starten')));
      }
      return wrap;
    };
    this.livePanel(`${defIcon(BUILDING.get(b.def)!)} ${BUILDING.get(b.def)!.name}`, render);
  }

  private ordersPanel(b: Building): void {
    const render = () => {
      const cur = this.city.get(b.uid);
      if (!cur) return h('p', {}, '–');
      const d = BUILDING.get(cur.def)!;
      const wrap = h('div', {}, h('p', {}, h('b', {}, this.statusText(cur))));
      if (cur.job && this.city.status(cur).kind === 'ready') wrap.append(h('button', { class: 'btn good', onclick: () => this.act(this.city.collect(cur.uid)) }, 'Lieferung abholen'));
      for (const o of ORDERS.filter((x) => x.station === d.station)) {
        const locked = o.level > this.city.s.level && !this.city.creative;
        const give = o.give ? Object.entries(o.give).map(([k, v]) => `${v} ${ITEM.get(k)!.icon} (${this.city.item(k)})`).join(' ') : '';
        const get = o.get ? Object.entries(o.get).map(([k, v]) => `${v} ${ITEM.get(k)!.icon} ${ITEM.get(k)!.name}`).join(' ') : '';
        wrap.append(h('div', { class: 'row' },
          h('div', { class: 'f' }, h('b', {}, o.name),
            h('small', {}, `${give ? 'Liefert ab: ' + give + ' → ' : ''}${get ? 'Bringt ' + get : ''}${o.coins ? ` ${num(o.coins)} 💰` : ''} · ⏱ ${fmtDur(this.city.dur(o.time) / 1000)} · +${o.xp} ⭐`)),
          h('button', { class: 'btn', 'data-order': o.id, disabled: !!cur.job || locked, onclick: () => this.act(this.city.startOrder(cur.uid, o.id)) }, locked ? `🔒 ${o.level}` : o.cost ? `${num(o.cost)} 💰` : 'Senden')));
      }
      return wrap;
    };
    this.livePanel(`${defIcon(BUILDING.get(b.def)!)} ${BUILDING.get(b.def)!.name}`, render);
  }

  private sitePanel(b: Building): void {
    const render = () => {
      const cur = this.city.get(b.uid);
      if (!cur) return h('p', {}, '–');
      const d = BUILDING.get(cur.def)!;
      const wrap = h('div', {}, h('p', {}, `Großbauten entstehen in Phasen: Fundament ✓ → Material liefern → Bauzeit → fertig.`));
      for (const [k, need] of Object.entries(d.materials ?? {})) {
        const got = cur.delivered?.[k] ?? 0;
        const it = ITEM.get(k)!;
        const missing = need - got;
        wrap.append(h('div', { class: 'row' }, h('div', { style: 'font-size:28px' }, it.icon),
          h('div', { class: 'f' }, h('b', {}, `${it.name}: ${got}/${need}`), h('small', {}, `Im Lager: ${this.city.item(k)}`), h('div', { class: 'prog' }, h('i', { style: `width:${(got / need) * 100}%` }))),
          missing > 0 && MARKET[k] ? h('button', { class: 'btn alt', onclick: () => this.act(this.city.buyMaterial(k, Math.max(0, missing - this.city.item(k)) || 1)) }, `Kaufen (${MARKET[k]} 💰/Stk)`) : null));
      }
      wrap.append(h('div', { class: 'btns' }, h('button', { class: 'btn good', id: 'btn-deliver', onclick: () => this.act(this.city.deliver(cur.uid)) }, '🧱 Alles Vorhandene liefern')),
        h('p', { class: 'meta' }, 'Material kommt per Zug und Schiff, aus dem Sägewerk oder vom Baustoffhändler (teurer, aber sofort). Nachbarhilfe ist nie Pflicht.'));
      return wrap;
    };
    this.livePanel(`🧱 Baustelle: ${BUILDING.get(b.def)!.name}`, render);
  }

  private shopsPanel(): void {
    const render = () => {
      const c = this.city;
      const shops = c.s.buildings.filter((b) => BUILDING.get(b.def)!.cat === 'business');
      if (!shops.length) return h('div', {}, h('p', {}, 'Noch keine Geschäfte. Baue eine Bäckerei oder einen Mini-Markt an einer Straße!'), h('button', { class: 'btn', onclick: () => this.buildMenu('business') }, '🏪 Geschäft bauen'));
      const wrap = h('div', {});
      let readyCash = 0, needSupply = 0;
      for (const b of shops) {
        const d = BUILDING.get(b.def)!;
        const st = c.status(b);
        if (st.kind === 'cash') readyCash++;
        if (st.kind === 'supply') needSupply++;
        wrap.append(h('div', { class: 'row' },
          h('div', { style: 'font-size:28px' }, defIcon(d)),
          h('div', { class: 'f' }, h('b', {}, d.name), h('small', {}, `${this.statusText(b)} · ${c.revenueOf(b)} 💰 · braucht ${d.stockPer}× ${(d.accepts ?? []).map((i) => ITEM.get(i)!.icon).join('/')}`)),
          st.kind === 'cash' ? h('button', { class: 'btn good', onclick: () => this.act(c.collect(b.uid)) }, 'Kassieren')
            : st.kind === 'supply' ? h('button', { class: 'btn', disabled: !c.supplyChoice(b), onclick: () => this.act(c.supply(b.uid)) }, 'Beliefern')
              : h('button', { class: 'btn alt', onclick: () => (this.closePanel(), this.world.focus(b.uid)) }, 'Zeigen')));
      }
      const top = h('div', { class: 'btns' },
        h('button', { class: 'btn good', disabled: !readyCash, onclick: () => shops.forEach((b) => c.status(b).kind === 'cash' && c.collect(b.uid)) }, `Alle kassieren (${readyCash})`),
        h('button', { class: 'btn', disabled: !needSupply, onclick: () => shops.forEach((b) => c.status(b).kind === 'supply' && c.supply(b.uid)) }, `Alle beliefern (${needSupply})`));
      return h('div', {}, top, wrap);
    };
    this.livePanel('🏪 Geschäfte', render, true);
  }

  private transportPanel(): void {
    const st = this.city.s.buildings.filter((b) => BUILDING.get(b.def)!.cat === 'transport');
    const info = h('div', {});
    for (const id of ['bahnhof', 'hafen', 'flughafen']) {
      const d = BUILDING.get(id)!;
      const own = st.find((b) => b.def === id);
      info.append(h('div', { class: 'row' }, h('div', { style: 'font-size:28px' }, { rail: '🚂', sea: '🚢', air: '✈️' }[d.station!]),
        h('div', { class: 'f' }, h('b', {}, d.name), h('small', {}, own ? this.statusText(own) : `${d.desc} Ab Level ${d.level}.`)),
        own ? h('button', { class: 'btn', onclick: () => (own.state === 'site' ? this.sitePanel(own) : this.ordersPanel(own)) }, 'Öffnen')
          : h('button', { class: 'btn alt', disabled: d.level > this.city.s.level && !this.city.creative, onclick: () => this.startPlacing(id) }, 'Bauen')));
    }
    this.openPanel('🚂 Transport & Lieferungen', info);
  }

  private storagePanel(): void {
    const render = () => {
      const c = this.city;
      const wrap = h('div', {}, h('p', {}, `Belegt: ${c.storageUsed()} von ${c.storageCap()} Plätzen. Scheunen, Silos und Lagerhäuser schaffen mehr Platz.`),
        h('div', { class: 'prog' }, h('i', { style: `width:${Math.min(100, (c.storageUsed() / c.storageCap()) * 100)}%` })));
      const kinds: [string, string][] = [['crop', '🌾 Ernte'], ['good', '🏭 Waren'], ['import', '🚂 Importe'], ['material', '🧱 Baumaterial']];
      for (const [k, label] of kinds) {
        const items = ITEMS.filter((i) => i.kind === k && c.item(i.id) > 0);
        if (!items.length) continue;
        wrap.append(h('h3', {}, label), h('div', { class: 'grid' }, ...items.map((i) => h('div', { class: 'card', style: 'min-height:0' }, h('div', { class: 'pic' }, i.icon), h('b', {}, i.name), h('div', { class: 'price' }, `${c.item(i.id)} Stück`)))));
      }
      wrap.append(h('h3', {}, '🏗️ Baustoffhändler'), h('p', { class: 'meta' }, 'Sofort verfügbar, aber teurer als Lieferungen.'));
      for (const [id, price] of Object.entries(MARKET)) {
        const it = ITEM.get(id)!;
        wrap.append(h('div', { class: 'row' }, h('div', { style: 'font-size:26px' }, it.icon), h('div', { class: 'f' }, h('b', {}, it.name), h('small', {}, `${price} 💰 pro Stück · im Lager ${c.item(id)}`)),
          h('button', { class: 'btn alt', onclick: () => this.act(c.buyMaterial(id, 1)) }, '+1'),
          h('button', { class: 'btn alt', onclick: () => this.act(c.buyMaterial(id, 5)) }, '+5')));
      }
      return wrap;
    };
    this.livePanel('📦 Lager', render, true);
  }

  // ================================================================ Quests
  private questProgressEl(q: QuestDef): HTMLElement {
    const goals = h('div', {});
    q.goals.forEach((g, i) => {
      const v = this.city.goalValue(q, i);
      let label = '';
      if ('ev' in g) {
        const names: Record<string, string> = { harvest: 'Ernten', plant: 'Säen', produce: 'Herstellen', supply: 'Beliefern', collectRent: 'Miete kassieren', collectShop: 'Kassieren', road: 'Straßen', order: 'Lieferungen', expand: 'Gebiete erschließen', upgrade: 'Ausbauen', build: 'Bauen', buildCat: 'Bauen' };
        const what = g.id ? (ITEM.get(g.id)?.name ?? BUILDING.get(g.id)?.name ?? CATEGORY_LABEL[g.id as Category] ?? { rail: 'Zug', sea: 'Schiff', air: 'Flugzeug' }[g.id] ?? g.id) : '';
        label = `${names[g.ev] ?? g.ev}${what ? ': ' + what : ''}`;
      } else if ('own' in g) label = `Besitze: ${BUILDING.get(g.own)?.name}`;
      else if ('ownCat' in g) label = `Besitze: ${CATEGORY_LABEL[g.ownCat]}`;
      else if ('pop' in g) label = 'Einwohner';
      else if ('level' in g) label = 'Stadtlevel';
      else label = 'Erschlossene Gebiete';
      goals.append(h('div', { style: 'margin:6px 0' }, h('small', {}, `${label} – ${num(v.have)}/${num(v.need)}`), h('div', { class: 'prog' }, h('i', { style: `width:${(v.have / v.need) * 100}%` }))));
    });
    return goals;
  }
  private rewardText(q: QuestDef): string {
    const r = q.reward;
    return [r.coins ? `${num(r.coins)} 💰` : '', r.xp ? `${r.xp} ⭐` : '', r.energy ? `${r.energy} ⚡` : ''].filter(Boolean).join(' · ');
  }
  private questDetail(q: QuestDef): void {
    const render = () => {
      const p = this.city.s.quests[q.id];
      if (p?.claimed) return h('p', {}, 'Erledigt! 🎉');
      const npc = NPCS[q.giver]!;
      const target = this.questTarget(q);
      return h('div', {},
        h('div', { class: 'npc' }, h('div', { class: 'face' }, npc.face), h('div', {}, h('b', {}, `${npc.name}, ${npc.role}`), h('p', {}, q.text))),
        this.questProgressEl(q),
        h('p', {}, h('b', {}, 'Belohnung: '), this.rewardText(q)),
        h('div', { class: 'btns' },
          p?.done ? h('button', { class: 'btn good', id: 'btn-claim', onclick: () => {
            const r = this.city.claimQuest(q.id);
            if (!r.ok) return this.fail(r.msg);
            this.closePanel();
          } }, 'Belohnung abholen') : null,
          !p?.done && target ? h('button', { class: 'btn', onclick: target }, '🧭 Hinführen') : null,
          this.city.s.tutorial === 'on' && q.id.startsWith('m') ? h('button', { class: 'btn alt', onclick: () => ((this.city.s.tutorial = 'skipped'), this.closePanel(), this.hud(), this.scheduleSave()) }, 'Tutorial-Hinweise aus') : null));
    };
    this.livePanel(`📜 ${q.title}`, render);
  }
  /** Navigationshilfe: Kamera zum passenden Gebäude oder Baumenü an der richtigen Stelle. */
  private questTarget(q: QuestDef): (() => void) | null {
    for (const g of q.goals) {
      const id = 'own' in g ? g.own : 'ev' in g && g.ev === 'build' ? g.id : 'ev' in g && g.ev === 'supply' ? g.id : undefined;
      if (id && BUILDING.has(id)) {
        const b = this.city.s.buildings.find((x) => x.def === id);
        return b ? () => (this.closePanel(), this.world.focus(b.uid)) : () => this.buildMenu(BUILDING.get(id)!.cat);
      }
      if ('ev' in g && ['harvest', 'plant'].includes(g.ev)) {
        const b = this.city.s.buildings.find((x) => BUILDING.get(x.def)!.cat === 'farm');
        return b ? () => (this.closePanel(), this.world.focus(b.uid)) : () => this.buildMenu('farm');
      }
      if ('ev' in g && g.ev === 'produce') return () => this.buildMenu('production');
      if ('ev' in g && g.ev === 'road') return () => (this.closePanel(), this.setTool('road'));
      if ('ev' in g && g.ev === 'expand') return () => (this.closePanel(), this.setTool('expand'));
      if ('ev' in g && g.ev === 'order') return () => this.transportPanel();
      if ('ev' in g && (g.ev === 'collectRent' || g.ev === 'collectShop')) {
        const b = this.city.s.buildings.find((x) => ['rent', 'cash'].includes(this.city.status(x).kind));
        if (b) return () => (this.closePanel(), this.world.focus(b.uid));
      }
      if ('buildCat' === ('ev' in g ? g.ev : '') && 'id' in g && g.id) return () => this.buildMenu(g.id as Category);
      if ('pop' in g) return () => this.buildMenu('residential');
    }
    return null;
  }
  private introQuest(): void {
    if (!this.inGame || this.city.creative || this.panel) return;
    const q = this.city.activeQuests().find((x) => x.id.startsWith('m') && !this.city.s.quests[x.id]?.done);
    if (q && !this.seenQuestIntro.has(q.id) && (this.city.s.tutorial === 'on' || !this.city.s.stats[`intro_${q.id}`])) {
      this.seenQuestIntro.add(q.id);
      this.city.s.stats[`intro_${q.id}`] = 1;
      this.questDetail(q);
    }
  }

  private questPanel(tab: 'story' | 'tasks' | 'ach' = 'story'): void {
    const tabs = h('div', { class: 'tabs' });
    const t = (id: typeof tab, label: string) => h('button', { class: `tab ${id === tab ? 'on' : ''}`, onclick: () => this.questPanel(id) }, label);
    tabs.append(t('story', '📜 Aufgaben'), t('tasks', '📅 Täglich & Woche'), t('ach', '🏆 Erfolge'));
    const render = () => {
      const c = this.city;
      if (c.creative) return h('p', {}, 'Im Kreativ-Sandkasten gibt es keine Aufgaben und keine Wertung.');
      const wrap = h('div', {});
      if (tab === 'story') {
        for (const q of c.activeQuests()) {
          const p = c.s.quests[q.id];
          const npc = NPCS[q.giver]!;
          wrap.append(h('div', { class: 'row' }, h('div', { style: 'font-size:30px' }, npc.face),
            h('div', { class: 'f' }, h('b', {}, q.title), h('small', {}, `${npc.name} · ${this.rewardText(q)}`), this.questProgressEl(q)),
            p?.done ? h('button', { class: 'btn good', onclick: () => this.act(c.claimQuest(q.id)) }, 'Abholen') : h('button', { class: 'btn alt', onclick: () => this.questDetail(q) }, 'Details')));
        }
        const done = Object.values(c.s.quests).filter((q) => q.claimed).length;
        wrap.append(h('p', { class: 'meta' }, `${done} Aufgaben erledigt.`));
      } else if (tab === 'tasks') {
        for (const [label, ts, weekly] of [['Heute', c.s.daily, false], ['Diese Woche', c.s.weekly, true]] as const) {
          wrap.append(h('h3', {}, label));
          ts?.tasks.forEach((task, i) => {
            const tpl = TASK_TEMPLATES.find((x) => x.id === task.tpl)!;
            wrap.append(h('div', { class: 'row' }, h('div', { class: 'f' }, h('b', {}, tpl.text.replace('{n}', String(task.n))), h('small', {}, `${task.c}/${task.n} · ${tpl.coins + 10 * c.s.level} 💰 · ${tpl.xp} ⭐`), h('div', { class: 'prog' }, h('i', { style: `width:${(task.c / task.n) * 100}%` }))),
              task.claimed ? h('span', {}, '✅') : h('button', { class: 'btn good', disabled: task.c < task.n, onclick: () => this.act(c.claimTask(weekly, i)) }, 'Abholen')));
          });
        }
        wrap.append(h('p', { class: 'meta' }, 'Kein Druck: Verpasste Aufgaben verfallen ohne Nachteil, morgen gibt es neue.'));
      } else {
        const g = h('div', { class: 'grid' });
        for (const a of ACHIEVEMENTS) {
          const have = c.s.achievements.includes(a.id);
          g.append(h('div', { class: `card ${have ? '' : 'locked'}`, style: 'min-height:0' }, h('div', { class: 'pic' }, a.icon), h('b', {}, a.name), h('div', { class: 'meta' }, `${num(Math.min(a.n, c.s.stats[a.stat] ?? 0))}/${num(a.n)}`)));
        }
        wrap.append(g);
      }
      return wrap;
    };
    this.livePanel('Aufgaben', render, true, tabs);
  }

  private levelUp(level: number, coins: number): void {
    const unlocked = BUILDINGS.filter((b) => b.level === level).map((b) => `${defIcon(b)} ${b.name}`);
    const crops = CROPS.filter((c) => c.level === level).map((c) => `${c.icon} ${c.name}`);
    setTimeout(() => {
      this.openPanel(`🎉 Stadtlevel ${level}!`, h('div', {},
        h('p', {}, `Glückwunsch! Du erhältst ${num(coins)} 💰${this.city.energyOn ? ' und volle Energie' : ''}.`),
        unlocked.length || crops.length ? h('p', {}, h('b', {}, 'Neu freigeschaltet: '), [...unlocked, ...crops].join(', ')) : null,
        h('div', { class: 'btns' }, h('button', { class: 'btn good', onclick: () => this.closePanel() }, 'Weiter bauen'))));
    }, 500);
  }

  // ================================================================ Sonstige Fenster
  // ================================================================ Nachbarn (Firestore, Spark-Tarif, ohne Server)
  private async socialApi(): Promise<NeighborApi | null> {
    try {
      const acc = await bridge()?.account?.();
      return acc ? new NeighborApi(acc) : null;
    } catch {
      return null;
    }
  }
  /** Nach dem Betreten der eigenen Stadt: Kurzansicht veröffentlichen und Post zählen (still, nur wenn angemeldet). */
  private async socialStart(): Promise<void> {
    const api = await this.socialApi();
    if (!api) {
      if (this.pendingNeighbor && this.inGame) void this.neighborsPanel('find');
      return;
    }
    try {
      await this.publishCity(api);
      await this.loadInbox(api);
      if (this.pendingNeighbor && this.inGame && !this.visit) void this.neighborsPanel('find');
    } catch {
      /* offline oder Regeln noch nicht veröffentlicht: das Fenster zeigt es beim Öffnen */
    }
  }
  private async publishCity(api: NeighborApi, force = false): Promise<void> {
    if (this.slot !== 'main' || this.city.creative) return;
    if (!force && Date.now() - this.publishedAt < 10 * 60_000) return;
    await api.putCity(toPublic(this.city.s, this.city.population(), Date.now()));
    this.publishedAt = Date.now();
  }
  private async loadInbox(api: NeighborApi): Promise<void> {
    const all = await api.inbox();
    const today = utcDay(Date.now());
    this.inbox = all.filter((m) => !m.done && validMsg(m, Date.now()));
    this.badge('neighbors', this.inbox.length);
    // Erledigtes von gestern und früher aufräumen (die Regeln erlauben Löschen erst ab dem Folgetag)
    for (const m of all.filter((x) => (x.done || !validMsg(x, Date.now())) && x.day < today).slice(0, 20)) void api.remove(m.id).catch(() => undefined);
  }
  private inviteLink(uid: string): string {
    return `${location.origin}${location.pathname}?nachbar=${encodeURIComponent(uid)}`;
  }

  private async neighborsPanel(tab: 'mine' | 'post' | 'find' = 'mine'): Promise<void> {
    const tabs = h('div', { class: 'tabs' });
    const t = (id: typeof tab, label: string) => h('button', { class: `tab ${id === tab ? 'on' : ''}`, 'data-tab': id, onclick: () => void this.neighborsPanel(id) }, label);
    tabs.append(t('mine', '👥 Meine Nachbarn'), t('post', `📬 Post${this.inbox.length ? ` (${this.inbox.length})` : ''}`), t('find', '🔎 Neue finden'));
    const body = h('div', {}, h('p', { class: 'meta' }, 'Lädt …'));
    this.openPanel('👥 Nachbarn', body, true, true, tabs);
    const panel = this.panel;
    const show = (...els: HTMLElement[]) => {
      if (this.panel === panel) body.replaceChildren(...els);
    };
    if (this.city.creative || this.slot !== 'main') return show(h('p', {}, 'Im Kreativ-Sandkasten gibt es keine Nachbarn. In deiner eigenen Stadt geht es los.'));
    const b = bridge();
    if (!b?.account) return show(h('p', {}, 'Nachbarn gibt es in der easygames-Fassung mit Google-Anmeldung.'));
    const api = await this.socialApi();
    if (!api) {
      return show(h('div', {},
        h('p', {}, 'Melde dich einmal mit Google an. Dann siehst du die Städte anderer Spieler, besuchst sie, hilfst beim Wachsen und schickst Baumaterial.'),
        h('p', { class: 'meta' }, 'Andere sehen nur Stadtname, Wappen, Motto, Level, Einwohnerzahl und deine Gebäude. Dein Google-Name und deine E-Mail bleiben privat.'),
        h('div', { class: 'btns' }, h('button', { class: 'btn good', id: 'btn-social-login', onclick: async () => {
          await b.signIn?.();
          void this.neighborsPanel(tab);
        } }, 'Mit Google anmelden'))));
    }
    const retry = (e: unknown) => show(h('div', {},
      h('p', { style: 'color:#a12b22' }, e instanceof SocialError ? e.message : 'Das hat nicht geklappt.'),
      e instanceof SocialError && e.status === 403 ? h('p', { class: 'meta' }, 'Hinweis für den Betreiber: Die Regeln aus cloud/firestore.rules müssen in der Firebase-Konsole veröffentlicht sein.') : h('span'),
      h('div', { class: 'btns' }, h('button', { class: 'btn', onclick: () => void this.neighborsPanel(tab) }, 'Nochmal versuchen'))));
    try {
      await this.publishCity(api);
      const mine = await api.neighbors();
      const isMine = new Set(mine.map((n) => n.uid));
      if (tab === 'mine') {
        const wrap = h('div', {});
        if (!mine.length) wrap.append(h('p', {}, 'Noch keine Nachbarn. Unter „Neue finden“ siehst du Städte anderer Spieler, oder du schickst jemandem deinen Einladungslink.'));
        for (const n of mine) {
          const left = this.city.helpsLeft(n.uid);
          wrap.append(h('div', { class: 'row', 'data-neighbor': n.uid }, h('div', { style: 'font-size:28px' }, '🏘️'),
            h('div', { class: 'f' }, h('b', {}, n.name || 'Nachbarstadt'), h('small', {}, `🤝 heute noch ${left}× helfen${this.city.canGift(n.uid) ? ' · 🎁 Geschenk möglich' : ''}`)),
            h('button', { class: 'btn', onclick: () => void this.startVisit(n.uid) }, 'Besuchen'),
            h('button', { class: 'btn alt', disabled: !this.city.canGift(n.uid), 'aria-label': 'Geschenk', onclick: () => this.giftDialog(n.uid, n.name) }, '🎁'),
            h('button', { class: 'btn alt', 'aria-label': 'Entfernen', onclick: async () => {
              try {
                await api.removeNeighbor(n.uid);
                void this.neighborsPanel('mine');
              } catch (e) {
                this.fail(e instanceof SocialError ? e.message : undefined);
              }
            } }, '✕')));
        }
        const link = this.inviteLink(api.uid);
        wrap.append(h('h3', {}, 'Einladungslink'),
          h('div', { class: 'row' }, h('input', { class: 'f', readonly: true, value: link, 'aria-label': 'Einladungslink', onclick: (e: Event) => (e.target as HTMLInputElement).select() }),
            h('button', { class: 'btn', onclick: () => {
              const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
              if (nav.share) void nav.share({ title: 'RicoVille', text: `Werde mein Nachbar in ${this.city.s.name}!`, url: link }).catch(() => undefined);
              else void navigator.clipboard?.writeText(link).then(() => this.toast('📋 Link kopiert.', 'good'));
            } }, 'Teilen')),
          h('p', { class: 'meta' }, `Pro Nachbar und Tag: ${NEIGHBOR_HELPS}× helfen und ein Geschenk. Wer dir hilft, bringt dir Münzen und Erfahrung.`));
        return show(wrap);
      }
      if (tab === 'post') {
        await this.loadInbox(api);
        const wrap = h('div', {});
        if (!this.inbox.length) wrap.append(h('p', {}, 'Keine neue Post. Nachbarn, die dich besuchen oder beschenken, erscheinen hier.'));
        else wrap.append(h('div', { class: 'btns' }, h('button', { class: 'btn good', id: 'btn-claim-all', onclick: async () => {
          for (const m of [...this.inbox]) if (m.type !== 'hello' && !(await this.claimMsg(api, m))) break;
          void this.neighborsPanel('post');
        } }, 'Alles annehmen')));
        for (const m of this.inbox) {
          const who = msgName(m);
          const text = m.type === 'visit' ? `${who} hat dir ${m.n}× geholfen.` : m.type === 'gift' ? `${who} schenkt dir ${GIFT_AMOUNT}× ${ITEM.get(m.item ?? '')?.name ?? 'Material'}.` : `${who} ist jetzt dein Nachbar.`;
          const icon = m.type === 'visit' ? '🤝' : m.type === 'gift' ? ITEM.get(m.item ?? '')?.icon ?? '🎁' : '👋';
          wrap.append(h('div', { class: 'row', 'data-msg': m.id }, h('div', { style: 'font-size:28px' }, icon), h('div', { class: 'f' }, h('b', {}, text)),
            m.type === 'hello' && !isMine.has(m.from)
              ? h('button', { class: 'btn', onclick: async () => {
                  try {
                    await api.addNeighbor(m.from, who, Date.now());
                    await this.claimMsg(api, m);
                  } catch (e) {
                    this.fail(e instanceof SocialError ? e.message : undefined);
                  }
                  void this.neighborsPanel('post');
                } }, 'Auch hinzufügen')
              : h('button', { class: 'btn good', onclick: async () => {
                  await this.claimMsg(api, m);
                  void this.neighborsPanel('post');
                } }, m.type === 'hello' ? 'OK' : 'Annehmen')));
        }
        return show(wrap);
      }
      // Neue finden: zuletzt gespielte Städte, dazu eine per Einladungslink geöffnete
      const list = (await api.recentCities(30)).filter((c) => c.uid !== api.uid && !isMine.has(c.uid));
      if (this.pendingNeighbor && this.pendingNeighbor !== api.uid && !isMine.has(this.pendingNeighbor)) {
        const inv = await api.getCity(this.pendingNeighbor);
        if (inv) list.unshift(inv);
      }
      this.pendingNeighbor = null;
      const wrap = h('div', {});
      if (!list.length) wrap.append(h('p', {}, 'Gerade keine weiteren Städte gefunden. Schick deinen Einladungslink an Freunde!'));
      for (const c of list.filter((x, i, a) => a.findIndex((y) => y.uid === x.uid) === i)) {
        wrap.append(h('div', { class: 'row', 'data-city': c.uid }, h('div', { style: 'font-size:28px' }, String(c.crest || '🏰').slice(0, 8)),
          h('div', { class: 'f' }, h('b', {}, String(c.name).slice(0, 24)), h('small', {}, `Level ${c.level} · ${num(Number(c.pop) || 0)} Einwohner${c.slogan ? ` · „${String(c.slogan).slice(0, 60)}“` : ''}`)),
          h('button', { class: 'btn alt', onclick: () => void this.startVisit(c.uid) }, 'Ansehen'),
          h('button', { class: 'btn good', onclick: async () => {
            try {
              await api.addNeighbor(c.uid, String(c.name), Date.now());
              await api.send(c.uid, 'hello', utcDay(Date.now()), this.city.s.name).catch(() => undefined);
              this.toast(`👥 ${String(c.name)} ist jetzt dein Nachbar.`, 'good');
            } catch (e) {
              this.fail(e instanceof SocialError ? e.message : undefined);
            }
            void this.neighborsPanel('find');
          } }, 'Hinzufügen')));
      }
      return show(wrap);
    } catch (e) {
      retry(e);
    }
  }

  /** Post annehmen: erst auf dem Server als erledigt markieren (verhindert doppeltes Annehmen, auch auf anderen Geräten), dann gutschreiben. */
  private async claimMsg(api: NeighborApi, m: InboxMsg): Promise<boolean> {
    if (m.type === 'gift') {
      const can = this.city.canReceiveGift(m.item ?? '');
      if (!can.ok) {
        this.fail(can.msg);
        return false;
      }
    }
    try {
      await api.markDone(m.id);
    } catch (e) {
      this.fail(e instanceof SocialError ? e.message : undefined);
      return false;
    }
    if (m.type === 'visit') this.city.receiveVisit(m.n ?? 1);
    else if (m.type === 'gift') this.city.receiveGift(m.item ?? '');
    this.inbox = this.inbox.filter((x) => x.id !== m.id);
    this.badge('neighbors', this.inbox.length);
    this.saveNow();
    return true;
  }

  private async startVisit(nid: string): Promise<void> {
    const api = await this.socialApi();
    if (!api) return;
    let pub: PublicCity | null;
    try {
      pub = await api.getCity(nid);
    } catch (e) {
      return this.fail(e instanceof SocialError ? e.message : undefined);
    }
    if (!pub) return this.fail('Diese Stadt gibt es nicht mehr.');
    this.saveNow();
    this.closePanel();
    this.setTool('normal');
    const vc = new City(visitState(pub, this.clock()), () => this.clock());
    this.visit = { nid, pub, city: vc };
    this.world.statusFor = (b) => (helpable(b.def) && b.state === 'done' && this.city.helpsLeft(nid) > 0 && !this.city.helpedToday(nid, b.uid) ? 'help' : undefined);
    this.world.setCity(vc);
    this.ui.classList.add('visiting');
    this.visitBar();
    this.audio.play('click');
  }
  private visitBar(): void {
    const v = this.visit;
    if (!v) return;
    let bar = this.els.visitbar;
    if (!bar) {
      bar = this.els.visitbar = h('div', { id: 'visitbar' });
      this.ui.append(bar);
    }
    const left = this.city.helpsLeft(v.nid);
    bar.replaceChildren(
      h('div', { class: 'msg' }, h('b', {}, `${String(v.pub.crest || '🏰').slice(0, 8)} ${v.city.s.name}`), h('small', {}, ` · Level ${v.city.s.level}`), h('br'),
        h('small', {}, left ? `🤝 Tippe auf Gebäude mit 🤝 und hilf (noch ${left}× heute)` : '🤝 Heute hast du hier genug geholfen. Danke!')),
      h('button', { id: 'btn-visit-gift', disabled: !this.city.canGift(v.nid), onclick: () => this.giftDialog(v.nid, v.city.s.name) }, '🎁'),
      h('button', { class: 'ok', id: 'btn-visit-home', onclick: () => void this.endVisit() }, '🏠 Heim'));
  }
  private helpAt(b: Building): void {
    const v = this.visit!;
    const d = BUILDING.get(b.def)!;
    if (!helpable(b.def) || b.state !== 'done') return this.toast(`${d.name}: Hier gibt es nichts zu helfen.`);
    const r = this.city.helpNeighbor(v.nid, b.uid);
    if (!r.ok) return this.fail(r.msg);
    this.floatAt(b.uid, '🤝 Geholfen!', 200);
    this.world.sync();
    this.visitBar();
  }
  /** Besuch beenden ohne Netz (z. B. beim Verlassen des Spiels). */
  private closeVisit(): { nid: string; helped: number; name: string } | null {
    const v = this.visit;
    if (!v) return null;
    this.visit = null;
    this.world.statusFor = null;
    this.ui.classList.remove('visiting');
    this.els.visitbar?.remove();
    delete this.els.visitbar;
    this.world.setCity(this.city);
    this.world.sync();
    this.hud();
    this.saveNow();
    return { nid: v.nid, helped: NEIGHBOR_HELPS - this.city.helpsLeft(v.nid), name: v.city.s.name };
  }
  private async endVisit(): Promise<void> {
    const r = this.closeVisit();
    if (!r || r.helped < 1) return;
    const api = await this.socialApi();
    try {
      await api?.send(r.nid, 'visit', utcDay(Date.now()), this.city.s.name, { n: r.helped });
      this.toast(`🤝 ${r.name} erfährt, dass du geholfen hast.`, 'good');
    } catch {
      /* Heute schon gemeldet (eine Besuchsnachricht pro Tag) oder offline: die eigene Belohnung bleibt. */
    }
  }
  private giftDialog(nid: string, name: string): void {
    if (!this.city.canGift(nid)) return this.toast('Heute hast du dieser Stadt schon etwas geschenkt.');
    const g = h('div', { class: 'grid' });
    for (const id of GIFT_ITEMS) {
      const it = ITEM.get(id)!;
      g.append(h('button', { class: 'card', 'data-gift': id, onclick: async () => {
        const api = await this.socialApi();
        if (!api) return;
        try {
          await api.send(nid, 'gift', utcDay(Date.now()), this.city.s.name, { item: id });
        } catch (e) {
          return this.fail(e instanceof SocialError && e.status === 403 ? 'Heute schon verschenkt (oder die Nachbar-Regeln fehlen noch).' : e instanceof SocialError ? e.message : undefined);
        }
        this.city.markGifted(nid);
        this.audio.play('deliver');
        this.toast(`🎁 ${GIFT_AMOUNT}× ${it.name} an ${name} geschickt.`, 'good');
        this.scheduleSave();
        this.closePanel();
        this.visitBar();
      } }, h('div', { class: 'pic' }, it.icon), h('b', {}, it.name), h('div', { class: 'meta' }, `${GIFT_AMOUNT}× · kostet dich nichts`)));
    }
    this.openPanel(`🎁 Geschenk für ${name}`, h('div', {}, h('p', {}, 'Such ein Baumaterial aus. Einmal am Tag pro Nachbar, und es kostet dich nichts.'), g));
  }

  private profilePanel(): void {
    const s = this.inGame ? this.city.s : null;
    const name = h('input', { type: 'text', maxlength: 24, value: this.profile.name, 'aria-label': 'Anzeigename' }) as HTMLInputElement;
    const city = h('input', { type: 'text', maxlength: 28, value: s?.name ?? '', 'aria-label': 'Stadtname' }) as HTMLInputElement;
    const slogan = h('input', { type: 'text', maxlength: 60, value: s?.slogan ?? '', placeholder: 'z. B. „Wo die Sonne zuerst lacht“', 'aria-label': 'Slogan' }) as HTMLInputElement;
    const crest = h('div', { class: 'seg' });
    let pick = s?.crest ?? this.profile.crest;
    const drawCrest = () => {
      crest.innerHTML = '';
      for (const c of CRESTS) crest.append(h('button', { class: c === pick ? 'on' : '', onclick: () => ((pick = c), drawCrest()) }, c));
    };
    drawCrest();
    const cloudHost = h('div', {});
    const body = h('div', {},
      h('p', {}, h('b', {}, 'Anzeigename')), name,
      s ? h('div', {}, h('p', {}, h('b', {}, 'Stadtname')), city, h('p', {}, h('b', {}, 'Slogan')), slogan) : null,
      h('p', {}, h('b', {}, 'Stadtwappen')), crest,
      s ? h('div', { class: 'kv', style: 'margin-top:12px' },
        h('span', {}, 'Level'), h('span', {}, String(s.level)),
        h('span', {}, 'Einwohner'), h('span', {}, num(this.city.population())),
        h('span', {}, 'Gebäude'), h('span', {}, String(s.buildings.length)),
        h('span', {}, 'Erfolge'), h('span', {}, `${s.achievements.length}/${ACHIEVEMENTS.length}`),
        h('span', {}, 'Gegründet'), h('span', {}, new Date(s.createdAt).toLocaleDateString('de-DE'))) : null,
      h('h3', {}, '☁️ Google-Speicherstand'), cloudHost,
      h('div', { class: 'btns' },
        h('button', { class: 'btn good', onclick: () => {
          this.profile = { name: name.value.trim() || 'Bürgermeister:in', crest: pick };
          saveJSON(PROFILE_KEY, this.profile);
          if (s) {
            s.name = city.value.trim().slice(0, 28) || s.name;
            s.slogan = slogan.value.trim().slice(0, 60);
            s.crest = pick;
            this.scheduleSave();
          }
          this.closePanel();
          this.hud();
        } }, 'Speichern'),
        h('button', { class: 'btn alt', onclick: () => this.exportData() }, '⬇️ Daten exportieren'),
        h('button', { class: 'btn bad', onclick: () => this.deleteData() }, '🗑️ Lokale Daten löschen')));
    this.openPanel('Profil', body);
    const cloud = document.getElementById('cloudMount');
    if (cloud) {
      cloud.classList.remove('hidden');
      cloudHost.append(cloud);
    } else cloudHost.append(h('p', { class: 'meta' }, 'Google-Speicher ist nur in der easygames-Fassung verfügbar.'));
  }
  private exportData(): void {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith('ricoville.')) data[k] = localStorage.getItem(k);
    }
    const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })), download: `ricoville-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
  }
  private deleteData(): void {
    this.openPanel('Alle lokalen Daten löschen?', h('div', {},
      h('p', {}, 'Löscht Städte, Sicherungen, Profil und Einstellungen von RicoVille in diesem Browser. Cloud-Daten bei Google löschst du nach der Anmeldung im Google-Bereich. Das kann nicht rückgängig gemacht werden.'),
      h('div', { class: 'btns' },
        h('button', { class: 'btn bad', onclick: () => {
          this.inGame = false;
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)!.startsWith('ricoville.')) keys.push(localStorage.key(i)!);
          keys.forEach((k) => localStorage.removeItem(k));
          location.reload();
        } }, 'Endgültig löschen'),
        h('button', { class: 'btn alt', onclick: () => this.closePanel() }, 'Abbrechen'))));
  }

  private settingsPanel(): void {
    const s = this.settings;
    const range = (label: string, key: 'music' | 'fx' | 'amb') => {
      const r = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s[key], 'aria-label': label }) as HTMLInputElement;
      r.addEventListener('input', () => ((s[key] = Number(r.value)), this.applySettings()));
      return h('label', { class: 'set' }, label, r);
    };
    const check = (label: string, key: 'muted' | 'dayNight' | 'bubbles' | 'anim') => {
      const c = h('input', { type: 'checkbox', 'aria-label': label }) as HTMLInputElement;
      c.checked = s[key];
      c.addEventListener('change', () => ((s[key] = c.checked), this.applySettings()));
      return h('label', { class: 'set' }, label, c);
    };
    const q = h('select', { 'aria-label': 'Grafikqualität' }) as HTMLSelectElement;
    for (const [v, l] of [['auto', 'Automatisch'], ['low', 'Niedrig (schont Akku)'], ['medium', 'Mittel'], ['high', 'Hoch']]) q.append(h('option', { value: v, selected: s.quality === v }, l));
    q.addEventListener('change', () => ((s.quality = q.value as Settings['quality']), (this.fps.checked = false), this.applySettings()));
    const modeSeg = h('div', { class: 'seg' });
    if (this.inGame && !this.city.creative) {
      for (const [m, l] of [['nostalgic', '⚡ Nostalgisch'], ['relaxed', '🌿 Entspannt']] as [Mode, string][])
        modeSeg.append(h('button', { class: this.city.s.mode === m ? 'on' : '', onclick: () => (this.city.setMode(m), this.scheduleSave(), this.hud(), this.settingsPanel()) }, l));
    }
    this.openPanel('⚙️ Einstellungen', h('div', {},
      this.inGame && !this.city.creative ? h('div', {}, h('p', {}, h('b', {}, 'Spielweise')), modeSeg, h('p', { class: 'meta' }, 'Nostalgisch: Energie für Aktionen, lädt alle 3 Min. Entspannt: keine Energie, halbe Wartezeiten.')) : null,
      range('🎵 Musik', 'music'), range('🔊 Effekte', 'fx'), range('🐦 Umgebung', 'amb'), check('🔇 Stumm', 'muted'),
      h('label', { class: 'set' }, '🖥️ Grafik', q), check('🌗 Tag-/Nacht-Stimmung', 'dayNight'), check('💬 Sprechblasen der Bewohner', 'bubbles'), check('🎞️ Animationen', 'anim'),
      h('div', { class: 'btns' },
        h('button', { class: 'btn alt', onclick: () => this.toggleFullscreen() }, '⛶ Vollbild'),
        h('button', { class: 'btn alt', onclick: () => this.helpPanel() }, '❓ Hilfe')),
      h('p', { class: 'meta' }, `RicoVille ${__APP_VERSION__} · Inspiriert von klassischen Social-Städtebauspielen, eigenständig entwickelt. Keine Verbindung zu Zynga.`)));
  }

  private helpPanel(): void {
    this.openPanel('❓ So funktioniert RicoVille', h('div', {},
      h('p', {}, '🏠 Häuser bringen Einwohner und Miete. Tippe auf die 💰-Blase, um zu kassieren. Neue Häuser brauchen Platz unter der Einwohnergrenze – Gemeinschaftsgebäude wie Schule oder Polizei erhöhen sie.'),
      h('p', {}, '🌾 Auf Äckern säst du Pflanzen. Nach der Wachstumszeit erntest du sie (🌾-Blase). Ernte kommt ins Lager.'),
      h('p', {}, '🏭 Produktionsgebäude machen aus Ernte Waren: Weizen → Mehl, Erdbeeren → Saft, Baumwolle → Stoff …'),
      h('p', {}, '🏪 Geschäfte an Straßen brauchen Waren (📦-Blase). Nach der Verkaufszeit kassierst du die Einnahmen (💵).'),
      h('p', {}, '🚂 Bahnhof, Hafen und Flughafen bringen Baumaterial und Importwaren oder kaufen deine Waren für Münzen.'),
      h('p', {}, '🌳 Deko im Umkreis erhöht Miete und Erlös um bis zu 50 %. Gemeinschaftsgebäude und Deko machen die Stadt zufriedener (Mietfaktor 0,85 bis 1,15).'),
      h('p', {}, '🗺️ Mit „Erweitern“ erschließt du neues Land – mit genug Einwohnern und Münzen.'),
      h('p', {}, '⏱️ Alle Zeiten laufen auch, wenn das Spiel geschlossen ist. Die Stadt verfällt nie.'),
      h('p', {}, '🖱️ PC: Ziehen = Kamera, Mausrad = Zoom, Q/E = Drehen, B = Bauen, T = Straße, R = Gebäude drehen, L = Aufgaben, Esc = Abbrechen. 📱 Handy: Ein Finger schiebt, zwei Finger zoomen.'),
      h('p', {}, '💾 Gespeichert wird automatisch im Browser. Mit Google-Anmeldung (Menü/Profil) folgt dir die Stadt auf andere Geräte. Hinweis: Im Gastmodus zählt die Uhr deines Geräts; zurückgestellte Uhren werden ignoriert, vorgestellte nicht erkannt.')));
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => this.toast('Vollbild wird hier nicht unterstützt.'));
  }

  fatal(msg: string): void {
    const el = h('div', { id: 'err' }, h('div', {},
      h('h2', {}, 'Hoppla!'), h('p', {}, msg),
      h('div', { class: 'btns', style: 'justify-content:center' },
        h('button', { class: 'btn good', onclick: () => location.reload() }, 'Neu laden'),
        h('button', { class: 'btn alt', onclick: () => void resetCaches() }, 'Cache leeren & neu laden'))));
    document.body.append(el);
  }
}

export async function resetCaches(): Promise<void> {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = (await caches?.keys()) ?? [];
    await Promise.all(keys.filter((k) => k.startsWith('ricoville')).map((k) => caches.delete(k)));
  } catch {
    /* egal */
  }
  location.reload();
}
