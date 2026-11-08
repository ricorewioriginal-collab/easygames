/**
 * Schatzfieber – Hauptprogramm: Laden, Altersabfrage, Titel, Figurenerstellung, Spielschleife (Insel und Rätselorte),
 * Interaktionen, Zeit, Speichern. Gespräche/Szenen in game/talk.ts, Fenster in ui/panels.ts.
 */
import * as THREE from 'three';
import { UI, esc } from './ui/ui';
import { Input } from './game/input';
import { Player, FollowCam, type Ground } from './game/player';
import { Human } from './char/human';
import { World, CLIMBS, type NpcActor } from './world/world';
import { DungeonView } from './world/dungeonView';
import { Sound } from './audio/sound';
import { Puzzle, CELL } from './core/puzzle';
import { DUNGEONS, MAIN_QUESTS, item, dungeon } from './core/data';
import { NPCS } from './core/npcs';
import { poi, height } from './world/island';
import * as S from './core/state';
import type { Look, Gender, Pref } from './core/types';
import { talk, playScene, runEnding } from './game/talk';
import * as P from './ui/panels';

const SAVE_KEY = 'schatzfieber-save';
const AGE_KEY = 'schatzfieber-age';
const SET_KEY = 'schatzfieber-settings';
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

export interface Target { label: string; d: number; run: () => void | Promise<void>; icon?: string }

export class App {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 5000);
  readonly ui = new UI();
  readonly input: Input;
  readonly sound = new Sound();
  readonly cam: FollowCam;
  world!: World;
  dungeon: DungeonView | null = null;
  puzzle: Puzzle | null = null;
  save!: S.Save;
  player!: Player;
  playerBody!: Human;
  portraits: Record<string, string> = {};
  mode: 'load' | 'menu' | 'create' | 'play' | 'scene' = 'load';
  talking: string | null = null;
  quality: number;
  settings: S.Settings;
  private clock = new THREE.Clock();
  private creatorScene = new THREE.Scene();
  private creatorBody: Human | null = null;
  private crLook!: Look;
  private crCfg = { name: '', gender: 'm' as Gender, pref: 'w' as Pref };
  private crEdit = false;
  private stepT = 0;
  private autosave = 0;
  private target: Target | null = null;
  private lastPromptKey = '';
  private mapCache: HTMLCanvasElement | null = null;
  private demo: S.Save | null = null;
  private swimT = 0;

  constructor() {
    const canvas = document.getElementById('scene') as HTMLCanvasElement;
    this.settings = { ...S.defaultSettings(), ...this.readJSON(SET_KEY, {}) };
    const mobile = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
    if (this.readJSON(SET_KEY, null) === null) this.settings.quality = mobile ? 0 : 1;
    this.quality = this.settings.quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality > 0, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality > 1 ? 2 : this.quality > 0 ? 1.5 : 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = this.quality > 0;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.input = new Input(canvas, document.getElementById('stick')!, document.getElementById('knob')!);
    this.cam = new FollowCam(this.camera);
    this.ui.onClick = () => this.sound.play('click');
    this.ui.textSpeed = this.settings.textSpeed;
    addEventListener('resize', () => this.resize());
    this.resize();
    this.bindStatic();
    this.boot();
  }

  readJSON<T>(key: string, def: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch {
      return def;
    }
  }
  writeJSON(key: string, v: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* Speicher voll oder gesperrt */
    }
  }
  resize() {
    const w = innerWidth,
      h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 72 : 60;
    this.camera.updateProjectionMatrix();
  }

  private progress(p: number, tip: string) {
    (document.getElementById('loadBar') as HTMLElement).style.width = Math.round(p * 100) + '%';
    document.getElementById('loadTip')!.textContent = tip;
  }

  private async boot() {
    this.progress(0.1, 'Die Insel taucht aus dem Meer auf …');
    await nextFrame();
    this.world = new World(this.renderer, this.quality);
    this.progress(0.6, 'Die Bewohner:innen machen sich schick …');
    await nextFrame();
    this.makePortraits();
    this.progress(0.85, 'Palmen werden gegossen …');
    await nextFrame();
    // Spielerfigur (Platzhalter bis zur Erstellung)
    this.playerBody = new Human(this.defaultLook('m'), this.quality > 0 ? 1 : 0);
    this.player = new Player(this.playerBody);
    this.world.scene.add(this.playerBody.root);
    this.setupCreatorScene();
    // Shader vorab übersetzen
    this.world.update(0.016, S.newSave({ name: '', gender: 'm', pref: 'all', look: this.defaultLook('m') }), new THREE.Vector3(0, 3, 150), null);
    this.camera.position.set(60, 40, 260);
    this.camera.lookAt(0, 5, 150);
    this.renderer.compile(this.world.scene, this.camera);
    this.progress(1, 'Fertig!');
    this.mode = 'menu';
    this.clock.start();
    this.renderer.setAnimationLoop(() => this.frame());
    if (localStorage.getItem(AGE_KEY) === '1' || new URLSearchParams(location.search).has('age')) this.showTitle();
    else this.ui.show('sAge');
    (window as unknown as { SFReady: boolean }).SFReady = true;
  }

  private bindStatic() {
    const on = (id: string, f: () => void) => document.getElementById(id)!.addEventListener('click', f);
    on('ageYes', () => {
      localStorage.setItem(AGE_KEY, '1');
      this.sound.start();
      this.showTitle();
    });
    on('ageNo', () => (location.href = '../'));
    on('bPhone', () => this.mode === 'play' && !this.ui.busy && P.phone(this));
    on('bMenu', () => this.mode === 'play' && !this.ui.busy && P.pause(this));
    on('crBack', () => (this.crEdit ? this.finishCreator(true) : this.showTitle()));
    on('crGo', () => this.finishCreator(false));
    const tb = (id: string, b: 'act' | 'jump') => {
      const el = document.getElementById(id)!;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.input.press(b);
      });
      el.addEventListener('mousedown', () => this.input.press(b));
    };
    tb('tAct', 'act');
    tb('tJump', 'jump');
    on('tRun', () => {
      this.input.runToggle = !this.input.runToggle;
      document.getElementById('tRun')!.classList.toggle('on', this.input.runToggle);
    });
  }

  // ---------- Titel ----------
  showTitle() {
    this.mode = 'menu';
    this.sound.start();
    this.sound.setVolumes(this.settings.music, this.settings.sfx);
    this.sound.setTheme('island');
    const has = !!localStorage.getItem(SAVE_KEY);
    const m = document.getElementById('tMenu')!;
    m.innerHTML =
      (has ? '<button class="btn gold xl pref" data-a="cont">▶ Weiterspielen</button>' : '') +
      `<button class="btn ${has ? '' : 'gold xl pref'}" data-a="new">✨ Neues Spiel</button><button class="btn" data-a="gal">🖼️ Galerie</button><button class="btn" data-a="set">⚙️ Einstellungen</button><button class="btn" data-a="help">📖 Anleitung</button>`;
    this.ui.bind(
      {
        cont: () => this.loadGame(),
        new: () => (has ? P.confirm(this, 'Neues Spiel beginnen? Der alte Spielstand wird überschrieben.', () => this.openCreator(false)) : this.openCreator(false)),
        gal: () => P.gallery(this, true),
        set: () => P.settings(this),
        help: () => (location.href = '../anleitung.html?game=schatzfieber'),
      },
      m,
    );
    this.ui.show('sTitle');
  }

  // ---------- Figurenerstellung ----------
  defaultLook(g: Gender): Look {
    const w = g === 'w';
    return {
      body: w ? 'w' : 'm', height: w ? 1.7 : 1.8, build: 0.45, curve: w ? 0.55 : 0.1, skin: '#d9a07a', hair: w ? 'lang' : 'kurz', hairColor: '#3a2416', beard: 0, eyes: '#5a4030', lips: w ? '#b8505a' : '#a86058',
      top: w ? 'top' : 'tshirt', topColor: w ? '#ffffff' : '#2ad4c4', bottom: w ? 'shorts' : 'shorts', bottomColor: w ? '#3a5a8a' : '#2c4a6e', shoes: '#f4f0e8', swim: w ? 'bikini' : 'badehose', swimColor: '#ff5a6a',
    };
  }
  private setupCreatorScene() {
    const s = this.creatorScene;
    s.background = new THREE.Color(0x0b2a3a);
    s.fog = new THREE.Fog(0x0b2a3a, 6, 16);
    const key = new THREE.DirectionalLight(0xfff0e0, 2.6);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    const rim = new THREE.DirectionalLight(0x6ad8ff, 1.8);
    rim.position.set(-3, 2, -3);
    s.add(key, rim, new THREE.HemisphereLight(0xbfe0ff, 0x6a5040, 1));
    const fl = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshStandardMaterial({ color: 0xd8c49a, roughness: 1 }));
    fl.rotation.x = -Math.PI / 2;
    fl.receiveShadow = true;
    s.add(fl);
  }
  openCreator(edit: boolean) {
    this.crEdit = edit;
    if (edit && this.save) {
      this.crCfg = { name: this.save.player.name, gender: this.save.player.gender, pref: this.save.player.pref };
      this.crLook = { ...this.save.player.look, swimming: false };
    } else {
      this.crCfg = { name: '', gender: 'm', pref: 'w' };
      this.crLook = this.defaultLook('m');
    }
    this.creatorBody?.dispose();
    if (this.creatorBody) this.creatorScene.remove(this.creatorBody.root);
    this.creatorBody = new Human(this.crLook, 1);
    this.creatorScene.add(this.creatorBody.root);
    this.mode = 'create';
    document.getElementById('crTitle')!.textContent = edit ? 'Kleiderschrank & Spiegel' : 'Deine Figur';
    document.getElementById('crGo')!.textContent = edit ? 'Fertig ✓' : 'Los geht’s ▶';
    this.renderCreator();
    this.ui.show('sCreate');
  }
  private renderCreator() {
    const L = this.crLook,
      C = this.crCfg;
    const SK = ['#f6d7c3', '#f0c8a8', '#e4b896', '#d9a07a', '#c48a64', '#a86e4a', '#7a4a30', '#5a3422'];
    const HC = ['#120c08', '#3a2416', '#6a4428', '#a8743a', '#d8b070', '#f0dca0', '#b8b0a8', '#a83a2a', '#9a5cff', '#2a8ad8'];
    const CL = ['#ffffff', '#1a1a1a', '#2ad4c4', '#ff5a6a', '#ffc85a', '#3a5a8a', '#6a8a3a', '#9a5cff', '#e8dcc0', '#d62848', '#2a2a40', '#f08a3a'];
    const EY = ['#5a4030', '#3a6a8a', '#4a6a3a', '#2a1a10', '#6a7a8a', '#8a6a3a'];
    type Opt = { label: string; get: () => string; step: (d: number) => void };
    const cyc = <T,>(list: readonly T[], cur: T, d: number) => list[(list.indexOf(cur) + d + list.length) % list.length];
    const sw = (c: string) => `<span class="sw" style="background:${c}"></span>`;
    const G: Record<Gender, string> = { m: 'Mann', w: 'Frau', d: 'Divers' };
    const PR: Record<Pref, string> = { w: 'Frauen', m: 'Männer', all: 'Alle' };
    const opts: Opt[] = [
      { label: 'Ich bin', get: () => G[C.gender], step: (d) => { C.gender = cyc(['m', 'w', 'd'] as Gender[], C.gender, d); if (!this.crEdit) { const keep = this.crLook.skin; this.crLook = { ...this.defaultLook(C.gender === 'd' ? 'm' : C.gender), skin: keep }; if (C.gender === 'd') { this.crLook.hair = 'undercut'; this.crLook.curve = 0.3; } } if (C.gender === 'd') C.pref = 'all'; } },
      { label: 'Ich date', get: () => PR[C.pref], step: (d) => { C.pref = C.gender === 'd' ? 'all' : cyc(['w', 'm', 'all'] as Pref[], C.pref, d); } },
      { label: 'Körperbau', get: () => (L.body === 'w' ? 'feminin' : 'maskulin'), step: () => { L.body = L.body === 'w' ? 'm' : 'w'; L.curve = L.body === 'w' ? 0.55 : 0.1; } },
      { label: 'Größe', get: () => L.height.toFixed(2) + ' m', step: (d) => (L.height = Math.max(1.55, Math.min(1.98, +(L.height + d * 0.03).toFixed(2)))) },
      { label: 'Statur', get: () => ['schlank', 'sportlich', 'kräftig'][Math.round(L.build * 2)], step: (d) => (L.build = Math.max(0, Math.min(1, L.build + d * 0.5))) },
      { label: 'Kurven', get: () => ['dezent', 'mittel', 'betont'][Math.round(L.curve * 2)], step: (d) => (L.curve = Math.max(0, Math.min(1, Math.round((L.curve + d * 0.5) * 2) / 2))) },
      { label: 'Hautton', get: () => sw(L.skin), step: (d) => (L.skin = cyc(SK, L.skin, d)) },
      { label: 'Frisur', get: () => L.hair[0].toUpperCase() + L.hair.slice(1), step: (d) => (L.hair = cyc(['kurz', 'undercut', 'locken', 'lang', 'zopf', 'dutt', 'bob', 'afro', 'glatze'] as const, L.hair, d)) },
      { label: 'Haarfarbe', get: () => sw(L.hairColor), step: (d) => (L.hairColor = cyc(HC, L.hairColor, d)) },
      { label: 'Bart', get: () => ['keiner', 'Stoppeln', 'Vollbart'][L.beard], step: (d) => (L.beard = ((L.beard + d + 3) % 3) as 0 | 1 | 2) },
      { label: 'Augen', get: () => sw(L.eyes), step: (d) => (L.eyes = cyc(EY, L.eyes, d)) },
      { label: 'Oberteil', get: () => ({ tshirt: 'T-Shirt', hemd: 'Hemd', tank: 'Tanktop', bluse: 'Bluse', kleid: 'Kleid', polo: 'Polo', top: 'Crop-Top' })[L.top], step: (d) => { L.top = cyc(['tshirt', 'hemd', 'tank', 'polo', 'bluse', 'top', 'kleid'] as const, L.top, d); if (L.top === 'kleid') L.bottom = 'kleid'; else if (L.bottom === 'kleid') L.bottom = 'shorts'; } },
      { label: 'Farbe oben', get: () => sw(L.topColor), step: (d) => (L.topColor = cyc(CL, L.topColor, d)) },
      { label: 'Unterteil', get: () => ({ jeans: 'Jeans', shorts: 'Shorts', rock: 'Rock', chino: 'Chino', kleid: 'Kleid' })[L.bottom], step: (d) => { if (L.top === 'kleid') return; L.bottom = cyc(['shorts', 'jeans', 'chino', 'rock'] as const, L.bottom === 'kleid' ? 'shorts' : L.bottom, d); } },
      { label: 'Farbe unten', get: () => sw(L.bottomColor), step: (d) => (L.bottomColor = cyc(CL, L.bottomColor, d)) },
      { label: 'Badeoutfit', get: () => ({ badehose: 'Badehose', trunks: 'Boardshorts', bikini: 'Bikini', badeanzug: 'Badeanzug' })[L.swim], step: (d) => (L.swim = cyc(['badehose', 'trunks', 'bikini', 'badeanzug'] as const, L.swim, d)) },
      { label: 'Badefarbe', get: () => sw(L.swimColor), step: (d) => (L.swimColor = cyc(CL, L.swimColor, d)) },
    ];
    const body = document.getElementById('crBody')!;
    body.innerHTML =
      `<div class="opt"><label>Name</label><input type="text" id="crName" maxlength="16" value="${esc(C.name)}" placeholder="Dein Name" /></div>` +
      opts.map((o, i) => `<div class="opt"><label>${o.label}</label><button class="btn" data-i="${i}" data-d="-1" aria-label="${o.label} zurück">◀</button><span class="val">${o.get()}</span><button class="btn" data-i="${i}" data-d="1" aria-label="${o.label} weiter">▶</button></div>`).join('') +
      `<p class="crHint">Figuren, die zu dir passen, können sich in dich verlieben – alle anderen werden gute Freund:innen. „Ich date“ kannst du jederzeit in den Einstellungen ändern. Tipp: Ziehe im Bild, um die Figur zu drehen.</p>`;
    body.querySelectorAll<HTMLButtonElement>('button[data-i]').forEach((b) =>
      b.addEventListener('click', () => {
        opts[+b.dataset.i!].step(+b.dataset.d!);
        this.creatorBody!.setLook(this.crLook);
        const keep = document.activeElement as HTMLElement;
        const idx = Array.from(body.querySelectorAll('button')).indexOf(keep as HTMLButtonElement);
        this.renderCreator();
        (body.querySelectorAll('button')[idx] as HTMLElement | undefined)?.focus();
      }),
    );
    const nm = document.getElementById('crName') as HTMLInputElement;
    nm.addEventListener('input', () => (C.name = nm.value.trim()));
    this.crLook = L;
  }
  private finishCreator(cancel: boolean) {
    if (this.crEdit) {
      if (!cancel) {
        this.save.player = { ...this.crCfg, name: this.crCfg.name || this.save.player.name, look: { ...this.crLook } };
        this.playerBody.setLook(this.save.player.look);
        this.saveGame();
      }
      this.ui.show('sGame');
      this.mode = 'play';
      return;
    }
    const name = this.crCfg.name || ({ m: 'Alex', w: 'Alex', d: 'Alex' } as Record<Gender, string>)[this.crCfg.gender];
    this.newGame({ name, gender: this.crCfg.gender, pref: this.crCfg.pref, look: { ...this.crLook } });
  }

  // ---------- Spielstand ----------
  private async newGame(cfg: S.PlayerCfg) {
    this.save = S.newSave(cfg);
    this.save.settings = this.settings;
    this.enterWorld();
    this.playerBody.setLook(cfg.look);
    this.player.place(34, 232, this.world, Math.PI);
    this.cam.yaw = Math.PI;
    this.cam.snap(this.player.pos);
    this.ui.show('sGame');
    this.mode = 'scene';
    this.ui.cinema(true);
    await this.ui.fade(true, 'Ein Brief vom Notar: Deine Tante Hedda hat dir ihr Strandhaus auf Isla Corazón vererbt – und ein Geheimnis.');
    await new Promise((r) => setTimeout(r, 2600));
    await this.ui.fade(false);
    await this.ui.say('', '', null, 'Die Fähre legt ab. Vor dir liegt Isla Corazón: weiße Strände, ein schlafender Vulkan – und irgendwo der verschollene Schatz der Piratin Ysolde Marrow.');
    await this.ui.say(cfg.name, '#ffc85a', this.portraits.player || null, 'Okay, Abenteuer. Zuerst brauche ich den Schlüssel vom Hafenmeister.');
    this.ui.endDialog();
    this.ui.cinema(false);
    this.mode = 'play';
    this.ui.toast('🧭 WASD/Stick laufen · Maus/rechter Stick umsehen · E/Ⓐ interagieren · Tab/Ⓨ Handy');
    this.saveGame();
  }
  loadGame() {
    const s = this.readJSON<S.Save | null>(SAVE_KEY, null);
    if (!s) return this.showTitle();
    this.save = S.normalize(s);
    this.settings = { ...this.settings, ...this.save.settings };
    this.save.settings = this.settings;
    this.enterWorld();
    this.playerBody.setLook(this.save.player.look);
    this.player.place(this.save.pos.x, this.save.pos.z, this.world, this.save.pos.ry);
    this.cam.yaw = this.save.pos.ry;
    this.cam.snap(this.player.pos);
    this.ui.show('sGame');
    this.mode = 'play';
  }
  saveGame() {
    if (!this.save) return;
    if (!this.dungeon) this.save.pos = { x: this.player.pos.x, z: this.player.pos.z, ry: this.player.yaw };
    this.save.settings = this.settings;
    this.writeJSON(SAVE_KEY, this.save);
  }
  saveSettings() {
    this.writeJSON(SET_KEY, this.settings);
    if (this.save) this.save.settings = this.settings;
    this.sound.setVolumes(this.settings.music, this.settings.sfx);
    this.ui.textSpeed = this.settings.textSpeed;
  }
  private enterWorld() {
    this.leaveDungeon(false);
    this.world.setHouse(this.save.renov);
    this.world.newDay(this.save);
    this.world.resetNpcs();
    this.portraits.player = this.portrait(this.save.player.look);
  }

  // ---------- Porträts ----------
  portrait(look: Look): string {
    const size = 160,
      rt = new THREE.WebGLRenderTarget(size, size, { samples: 4 });
    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0x14384a);
    const l = new THREE.DirectionalLight(0xfff0e0, 2.4);
    l.position.set(1, 2, 3);
    sc.add(l, new THREE.HemisphereLight(0xcfe8ff, 0x6a5040, 1.2));
    const h = new Human({ ...look, swimming: false }, 1);
    h.update(0.016);
    sc.add(h.root);
    const f = h.faceWorld();
    const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 10);
    cam.position.set(f.x + 0.08, f.y + 0.02, f.z + 0.75);
    cam.lookAt(f.x, f.y - 0.03, f.z);
    const prevTone = this.renderer.toneMappingExposure;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setRenderTarget(rt);
    this.renderer.render(sc, cam);
    const px = new Uint8Array(size * size * 4);
    this.renderer.readRenderTargetPixels(rt, 0, 0, size, size, px);
    this.renderer.setRenderTarget(null);
    this.renderer.toneMappingExposure = prevTone;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!,
      img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(px.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    ctx.putImageData(img, 0, 0);
    h.dispose();
    rt.dispose();
    return c.toDataURL('image/jpeg', 0.85);
  }
  private makePortraits() {
    for (const n of NPCS) this.portraits[n.id] = this.portrait(n.look);
  }

  // ---------- Rätselorte ----------
  get ground(): Ground {
    return this.dungeon || this.world;
  }
  get scene(): THREE.Scene {
    return this.mode === 'create' ? this.creatorScene : this.dungeon ? this.dungeon.scene : this.world.scene;
  }
  async enterDungeon(id: string) {
    const def = dungeon(id);
    await this.ui.fade(true, def.name);
    this.saveGame();
    this.puzzle = new Puzzle(def, this.save.dungeons[id]);
    this.dungeon = new DungeonView(this.puzzle, this.quality);
    if (id === 'temple') this.dungeon.showGems(this.puzzle.isOpen(...this.puzzle.cells('O')[0]) ? 3 : 0);
    this.world.scene.remove(this.playerBody.root);
    this.dungeon.scene.add(this.playerBody.root);
    const [sx, sy] = this.puzzle.start();
    this.player.place(sx * CELL, sy * CELL - 0.2, this.dungeon, Math.PI);
    this.cam.yaw = Math.PI;
    this.cam.dist = 5;
    this.cam.snap(this.player.pos);
    this.sound.setTheme('dungeon');
    await this.ui.fade(false);
    this.ui.toast(`🕯️ ${def.name}${this.puzzle.chests.size ? '' : ' – finde das Amulett-Stück!'}`);
  }
  async leaveDungeon(fade = true) {
    if (!this.dungeon) return;
    const id = this.puzzle!.def.id;
    if (fade) await this.ui.fade(true);
    this.save.dungeons[id] = this.puzzle!.save();
    this.dungeon.scene.remove(this.playerBody.root);
    this.dungeon.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
    });
    this.dungeon = null;
    this.puzzle = null;
    this.world.scene.add(this.playerBody.root);
    const p = poi(dungeon(id).poi);
    const out = { cave: [p.x + 7, p.z, -Math.PI / 2], ruins: [p.x, p.z + 5, 0], cellar: [p.x, p.z + 4, 0], temple: [p.x, p.z + 6, 0] }[id] as number[];
    this.player.place(out[0], out[1], this.world, out[2] + Math.PI);
    this.cam.yaw = out[2] + Math.PI;
    this.cam.dist = 6;
    this.cam.snap(this.player.pos);
    this.sound.setTheme(this.world.env.night > 0.5 ? 'night' : 'island');
    this.saveGame();
    if (fade) await this.ui.fade(false);
    if (this.save.flags.treasure && !this.save.ending) await runEnding(this);
  }

  // ---------- Interaktionen ----------
  private targets(): Target[] {
    const s = this.save,
      p = this.player.pos,
      out: Target[] = [];
    const add = (x: number, z: number, r: number, label: string, run: () => void | Promise<void>, icon = '✋') => {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < r) out.push({ label, d, run, icon });
    };
    if (this.dungeon && this.puzzle) return this.dungeonTargets();
    const W = this.world;
    for (const a of W.npcs) if (a.present && a.body.root.visible) add(a.body.root.position.x, a.body.root.position.z, 2.9, `Mit ${a.def.name} sprechen`, () => talk(this, a), '💬');
    W.active.shells.forEach((i) => !s.picked.includes('shell' + i) && add(W.shells[i].x, W.shells[i].z, 1.6, 'Muschel aufheben', () => this.pick('shell', i, 'shell')));
    W.active.coconuts.forEach((i) => !s.picked.includes('coco' + i) && add(W.coconuts[i].x, W.coconuts[i].z, 1.6, 'Kokosnuss aufheben', () => this.pick('coco', i, 'coconut')));
    W.active.digs.forEach((i) => !s.picked.includes('dig' + i) && add(W.digs[i].x, W.digs[i].z, 1.9, 'Hier graben', () => this.dig(i), '⛏️'));
    if (this.player.swimming && s.inv.goggles) W.active.dives.forEach((i) => !s.picked.includes('dive' + i) && add(W.dives[i].x, W.dives[i].z, 3.2, 'Tauchen', () => this.dive(i), '🤿'));
    for (const c of CLIMBS) {
      add(c.bottom.x, c.bottom.z, 2.6, `Zum ${c.name} hinaufklettern`, () => this.climb(c.id, true), '🪢');
      add(c.top.x, c.top.z, 2.2, 'Hinunterklettern', () => this.climb(c.id, false), '🪢');
      if (!s.flags['climb_' + c.id]) add(c.top.x + 1.5, c.top.z, 2.2, 'Truhe öffnen', () => this.climbChest(c.id, c.loot), '📦');
    }
    const H = poi('house');
    add(H.x, H.z, 2.6, s.inv.house_key ? 'Strandhaus betreten' : 'Strandhaus (abgeschlossen)', () => (s.inv.house_key ? P.house(this) : this.ui.toast('🔒 Abgeschlossen. Hafenmeister Jonas hat den Schlüssel.')), '🏠');
    add(37.5, 136, 3, 'Kramladen', () => P.shop(this), '🛍️');
    add(0, 112, 3, 'Inselmuseum', () => P.museum(this), '🏛️');
    add(0, 154.5, 1.6, 'Münze in den Brunnen werfen (1 €)', () => this.wish(), '⛲');
    const C = poi('cave'),
      R = poi('ruins'),
      L = poi('lighthouse'),
      T = poi('temple');
    add(C.x + 3, C.z, 3, 'Höhle der Gezeiten betreten', () => this.tryDungeon('cave'), '🕳️');
    add(R.x, R.z + 1, 3, 'Ruine betreten', () => this.tryDungeon('ruins'), '🗿');
    add(L.x, L.z, 2.6, 'Leuchtturm-Gewölbe betreten', () => this.tryDungeon('cellar'), '🗼');
    add(T.x, T.z + 1.5, 3, 'Vulkantempel betreten', () => this.tryDungeon('temple'), '🌋');
    return out;
  }
  private dungeonTargets(): Target[] {
    const pz = this.puzzle!,
      dv = this.dungeon!,
      out: Target[] = [];
    const [cx, cy] = Puzzle.cellOf(this.player.pos.x, this.player.pos.z);
    const fx = Math.sin(this.player.yaw),
      fz = Math.cos(this.player.yaw);
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = cx + dx,
        y = cy + dy,
        c = pz.at(x, y),
        key = Puzzle.key(x, y);
      const [wx, wz] = Puzzle.pos(x, y);
      const d = Math.hypot(this.player.pos.x - wx, this.player.pos.z - wz);
      const facing = dx || dy ? (dx * fx + dy * fz) : 1;
      if ((dx || dy) && facing < 0.3) continue;
      const score = d - facing;
      const add = (label: string, run: () => void, icon = '✋') => out.push({ label, d: score, run, icon });
      if (pz.crates.has(key) && (dx || dy))
        add('Kiste schieben', () => {
          const r = pz.push(x, y, dx, dy);
          if (r.moved) {
            dv.moveCrate(key, Puzzle.key(x + dx, y + dy));
            this.sound.play('push');
            if (r.opened.length) {
              this.sound.play('door');
              this.ui.toast('🚪 Ein Tor öffnet sich!');
            }
            this.save.dungeons[pz.def.id] = pz.save();
          } else {
            this.sound.play('error');
            this.ui.toast('Die Kiste bewegt sich nicht.');
          }
        }, '📦');
      else if ('1234'.includes(c))
        add(`Hebel ziehen (${pz.def.leverNames?.[+c - 1] || c})`, () => {
          const r = pz.pull(+c);
          this.sound.play('lever');
          if (r === 'ok') dv.setLever(+c, true);
          if (r === 'open') {
            dv.setLever(+c, true);
            this.sound.play('door');
            this.ui.toast('🚪 Mit lautem Grollen öffnet sich das Tor!');
          }
          if (r === 'reset') {
            dv.setLever(+c, true);
            setTimeout(() => dv.resetLevers(), 500);
            this.ui.toast('❌ Falsche Reihenfolge – alle Hebel springen zurück.');
          }
          if (r === 'done') this.ui.toast('Das Tor ist schon offen.');
          this.save.dungeons[pz.def.id] = pz.save();
        }, '🕹️');
      else if (c === 'H') add('Inschrift lesen', () => this.ui.say('', '', null, pz.def.hints[key] || '…').then(() => this.ui.endDialog()), '📜');
      else if (c === 'K' && !pz.isOpen(x, y)) add('Symbolschloss', () => P.lock(this), '🔐');
      else if ('tTZ'.includes(c) && !pz.chests.has(key)) add(c === 'Z' ? 'Den Schatz öffnen' : 'Truhe öffnen', () => this.openChest(x, y), c === 'Z' ? '💰' : '📦');
      else if (c === 'V' && !pz.isOpen(x, y))
        add('Lianen durchschlagen', () => {
          pz.cut(x, y);
          dv.cutVine(key);
          this.sound.play('dig');
          this.save.dungeons[pz.def.id] = pz.save();
        }, '🔪');
      else if (c === 'Q') add('Altar', () => this.altar(), '🛕');
      else if (c === 'S') add('Hinausgehen', () => this.leaveDungeon(), '🚪');
    }
    return out;
  }
  private async openChest(x: number, y: number) {
    const pz = this.puzzle!;
    const it = pz.openChest(x, y);
    if (!it) return;
    this.dungeon!.openChest(Puzzle.key(x, y));
    S.addItem(this.save, it);
    this.save.dungeons[pz.def.id] = pz.save();
    if (it.startsWith('amulet_')) {
      this.sound.play('amulet');
      const isTreasure = pz.at(x, y) === 'Z';
      if (isTreasure) this.save.flags.treasure = 1;
      await this.ui.say('', '', null, isTreasure ? 'Gold, Juwelen, Ysoldes Logbuch – und in der Mitte, auf rotem Samt, das letzte Stück: das Herz. Die vier Teile fügen sich in deiner Hand zusammen. Das Herz der Insel leuchtet.' : `Du hast ein Stück von Ysoldes Amulett gefunden: ${item(it).icon} ${item(it).name}!`);
      this.ui.endDialog();
      this.saveGame();
      if (isTreasure) await this.leaveDungeon();
    } else {
      this.sound.play('chest');
      this.ui.toast(`📦 Gefunden: ${item(it).icon} ${item(it).name}`);
    }
  }
  private async altar() {
    const pz = this.puzzle!,
      n = S.pieces(this.save);
    if (pz.cells('O').every(([x, y]) => pz.isOpen(x, y))) return this.ui.toast('Die Amulett-Stücke leuchten auf dem Altar.');
    if (n < 3) {
      await this.ui.say('', '', null, `Drei Vertiefungen: eine Sonne, ein Mond, ein Stern. Du hast erst ${n} von 3 Stücken.`);
      return this.ui.endDialog();
    }
    pz.activateAltar();
    this.dungeon!.showGems(3);
    this.sound.play('amulet');
    setTimeout(() => this.sound.play('door'), 600);
    this.save.dungeons[pz.def.id] = pz.save();
    this.ui.toast('✨ Sonne, Mond und Stern leuchten – das Tor zur Schatzkammer öffnet sich!');
  }
  private tryDungeon(id: string) {
    const def = dungeon(id),
      s = this.save;
    if (id === 'cave' && !s.flags.leaMap) return this.ui.toast('🌊 Eine dunkle Höhle. Vielleicht weiß jemand im Museum mehr darüber …');
    if (def.needs && !s.inv[def.needs]) {
      const why: Record<string, string> = { lamp: 'Stockdunkel – du brauchst eine Laterne (Kramladen).', machete: 'Dichte Lianen versperren den Eingang – eine Machete wäre gut (Kramladen).', lighthouse_key: 'Die Kellertür ist verschlossen. Mira, die Leuchtturmwärterin, hat den Schlüssel.', rope: 'Der Eingang liegt hinter einer Felsspalte – ohne Kletterseil (Kramladen) kommst du nicht hinüber.' };
      return this.ui.toast('🔒 ' + why[def.needs]);
    }
    this.enterDungeon(id);
  }
  private pick(kind: string, i: number, id: string) {
    this.save.picked.push(kind + i);
    S.addItem(this.save, id);
    this.world.syncPicks(this.save);
    this.sound.play('pick');
    this.ui.toast(`+1 ${item(id).icon} ${item(id).name}`);
  }
  private dig(i: number) {
    if (!this.save.inv.shovel) return;
    this.player.busy = 1.6;
    this.player.busyMode = 'dig';
    this.sound.play('dig');
    setTimeout(() => {
      const it = S.digLoot(this.save.day * 131 + i * 17);
      this.save.picked.push('dig' + i);
      this.save.stats.dug++;
      S.addItem(this.save, it);
      this.world.syncPicks(this.save);
      this.sound.play(item(it).kind === 'artifact' ? 'chest' : 'pick');
      this.ui.toast(`⛏️ Ausgegraben: ${item(it).icon} ${item(it).name}${item(it).kind === 'artifact' && !this.save.museum.includes(it) ? ' <small>(fürs Museum!)</small>' : ''}`);
    }, 1500);
  }
  private dive(i: number) {
    this.player.busy = 2.4;
    this.player.busyMode = 'dive';
    this.sound.play('splash');
    setTimeout(() => {
      const it = S.diveLoot(this.save.day * 97 + i * 31);
      this.save.picked.push('dive' + i);
      this.save.stats.dived++;
      S.addItem(this.save, it);
      this.world.syncPicks(this.save);
      this.sound.play('chest');
      this.ui.toast(`🤿 Vom Meeresgrund: ${item(it).icon} ${item(it).name}`);
    }, 2300);
  }
  private async climb(id: string, up: boolean) {
    const c = CLIMBS.find((x) => x.id === id)!;
    if (up && !this.save.inv.rope) return this.ui.toast('🪢 Die Lianenwand ist zu steil – mit einem Kletterseil aus dem Kramladen ginge es.');
    await this.ui.fade(true, up ? 'Du kletterst die Lianen hinauf …' : 'Vorsichtig hinunter …');
    const p = up ? c.top : c.bottom;
    this.player.place(p.x, p.z, this.world);
    this.cam.snap(this.player.pos);
    this.save.time += 10;
    await this.ui.fade(false);
  }
  private climbChest(id: string, loot: string) {
    this.save.flags['climb_' + id] = 1;
    S.addItem(this.save, loot);
    this.world.syncPicks(this.save);
    this.sound.play('chest');
    this.ui.toast(`📦 Eine alte Seemannstruhe: ${item(loot).icon} ${item(loot).name}!`);
    this.saveGame();
  }
  private wish() {
    if (this.save.money < 1) return this.ui.toast('Du hast keine Münze mehr.');
    this.save.money -= 1;
    this.sound.play('coin');
    const w = ['Platsch! Du wünschst dir … das bleibt dein Geheimnis. 🤫', 'Die Münze glitzert am Grund. Heute wird ein guter Tag!', 'Ein Fisch schnappt nach der Münze. Ist das ein Zeichen?', 'Du hörst ein leises Kichern hinter dir – Kim malt dich gerade.'];
    this.ui.toast('⛲ ' + w[Math.floor(Math.random() * w.length)]);
  }

  /** Erschöpfung nach 2 Uhr */
  private async passOut() {
    this.mode = 'scene';
    await this.ui.fade(true, 'Du bist völlig erschöpft und schläfst im Sand ein … Jemand bringt dich nach Hause.');
    if (this.dungeon) await this.leaveDungeon(false);
    S.sleep(this.save, 9 * 60);
    const H = poi('house');
    this.player.place(H.x, H.z + 2, this.world, 0);
    this.cam.snap(this.player.pos);
    this.world.newDay(this.save);
    this.saveGame();
    await new Promise((r) => setTimeout(r, 1800));
    await this.ui.fade(false);
    this.mode = 'play';
  }
  async sleepUntil(toEvening: boolean) {
    this.mode = 'scene';
    await this.ui.fade(true, toEvening ? 'Du ruhst dich in der Hängematte aus …' : 'Gute Nacht. Die Wellen rauschen dich in den Schlaf.');
    if (toEvening) this.save.time = Math.max(this.save.time, 18 * 60);
    else {
      S.sleep(this.save);
      this.world.newDay(this.save);
    }
    this.saveGame();
    await new Promise((r) => setTimeout(r, 1400));
    await this.ui.fade(false);
    this.mode = 'play';
    this.ui.toast(toEvening ? '🌅 Es ist Abend geworden.' : `☀️ Tag ${this.save.day} beginnt.`);
  }

  // ---------- HUD ----------
  private hud() {
    const s = this.save;
    document.getElementById('hudTime')!.textContent = S.clock(s.time);
    document.getElementById('hudDay')!.textContent = `${S.WEEKDAYS[(s.day - 1) % 7]} · Tag ${s.day}`;
    document.getElementById('hudMoney')!.textContent = s.money + ' €';
    const q = this.currentQuest();
    document.getElementById('hudQuest')!.innerHTML = q ? `<b>${esc(q.title)}</b>${esc(q.text)}` : '';
    // Blickrichtung (Norden = −z, Osten = +x)
    const head = ((Math.atan2(Math.sin(this.cam.yaw), -Math.cos(this.cam.yaw)) * 180) / Math.PI + 360) % 360;
    const dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    document.getElementById('compass')!.textContent = this.dungeon ? this.puzzle!.def.name : `🧭 ${dirs[Math.round(head / 45) % 8]}`;
  }
  currentQuest() {
    return MAIN_QUESTS.find((q) => !this.save.flags[q.done]) || null;
  }
  mapCanvas(): HTMLCanvasElement {
    if (this.mapCache) return this.mapCache;
    const N = 220,
      c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d')!,
      img = x.createImageData(N, N);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const wx = (i / N - 0.5) * 600,
          wz = (j / N - 0.5) * 600,
          h = height(wx, wz);
        let col: number[];
        if (h < 0) col = [30 + h * 1.2, 110 + h * 4, 160 + h * 3];
        else if (h < 2.4) col = [232, 214, 168];
        else if (h > 40) col = [110, 100, 96];
        else col = [86 + h, 150 - h * 0.8, 70];
        const k = (j * N + i) * 4;
        img.data.set([col[0], col[1], col[2], 255], k);
      }
    x.putImageData(img, 0, 0);
    this.mapCache = c;
    return c;
  }

  // ---------- Hauptschleife ----------
  private frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    const inp = this.input;
    inp.menu = this.ui.busy || this.mode !== 'play';
    inp.poll();
    const menuFrame = this.ui.busy || this.mode !== 'play';
    if (menuFrame && document.pointerLockElement) document.exitPointerLock();
    if (this.ui.busy || this.mode === 'menu' || this.mode === 'create') {
      if (inp.take('up')) this.ui.nav('up');
      if (inp.take('down')) this.ui.nav('down');
      if (inp.take('left')) this.ui.nav('left');
      if (inp.take('right')) this.ui.nav('right');
      if (inp.usingPad && inp.take('ok')) this.ui.ok();
      else if (this.ui.dialogOpen && !this.ui.overlayOpen && (inp.take('act') || inp.take('jump'))) this.ui.advance();
      if (inp.take('back')) this.ui.back();
      if (this.mode === 'play' && this.ui.overlayOpen && (inp.take('phone') || inp.take('map'))) this.ui.close();
      const tabSwitch = (this as unknown as { tabSwitch?: (d: number) => void }).tabSwitch;
      if (tabSwitch && this.ui.overlayOpen && document.querySelector('#ovBox [data-a="tab"]')) {
        if (inp.take('tabL')) tabSwitch(-1);
        if (inp.take('tabR')) tabSwitch(1);
      }
    }
    if (this.mode === 'create' && this.creatorBody) {
      this.creatorBody.root.rotation.y += dt * 0.4 - inp.look.x * 0.01;
      this.creatorBody.mode = 'idle';
      this.creatorBody.update(dt);
      const narrow = innerWidth < 640;
      // Figur rechts neben dem Bedienfeld bzw. oberhalb auf dem Handy
      this.camera.position.set(narrow ? 0 : -0.62, narrow ? 1.5 : 1.2, narrow ? 4.2 : 2.7);
      this.camera.lookAt(narrow ? 0 : -0.62, narrow ? 0.55 : 0.98, 0);
      this.renderer.render(this.creatorScene, this.camera);
      inp.endFrame();
      return;
    }
    if (!this.save) {
      // Titel: Kamerafahrt über die Insel
      const t = performance.now() / 1000;
      this.demo ||= { ...S.newSave({ name: '', gender: 'm', pref: 'all', look: this.defaultLook('m') }), time: 17.6 * 60 };
      this.world.update(dt, this.demo, new THREE.Vector3(0, 3, 150), null);
      this.camera.position.set(Math.sin(t * 0.05) * 230, 60, 150 + Math.cos(t * 0.05) * 230);
      this.camera.lookAt(0, 8, 60);
      this.renderer.render(this.world.scene, this.camera);
      inp.endFrame();
      return;
    }
    const s = this.save;
    if (this.mode === 'play' && !this.ui.busy) {
      // Tasten, die gerade ein Menü bedient haben, nicht noch einmal im Spiel auswerten
      if (menuFrame) for (const b of ['act', 'pause', 'phone', 'map', 'jump', 'back', 'ok'] as const) inp.take(b);
      if (inp.take('pause')) P.pause(this);
      else if (inp.take('phone')) P.phone(this);
      else if (inp.take('map')) P.phone(this, 'map');
      s.time += dt * (this.dungeon ? 0.5 : 1);
      if (s.time >= S.DAY_END) this.passOut();
      this.player.update(dt, inp, this.cam.moveYaw, this.ground);
      // Badekleidung im Wasser
      const wantSwim = this.player.swimming;
      this.swimT = wantSwim !== !!s.player.look.swimming && (wantSwim || this.player.onGround) ? this.swimT + dt : 0;
      if (this.swimT > 0.5) {
        this.swimT = 0;
        s.player.look.swimming = wantSwim;
        this.playerBody.setLook(s.player.look);
        if (wantSwim) this.sound.play('splash');
      }
      // Schritte
      if (this.player.onGround && this.player.speed > 0.8) {
        this.stepT -= dt * this.player.speed;
        if (this.stepT <= 0) {
          this.stepT = 1.25;
          this.sound.play('step');
        }
      }
      // Ziel für Interaktion
      const ts = this.player.busy > 0 ? [] : this.targets().sort((a, b) => a.d - b.d);
      this.target = ts[0] || null;
      const pr = document.getElementById('prompt')!;
      const key = this.target ? this.target.label : '';
      if (key !== this.lastPromptKey) {
        this.lastPromptKey = key;
        pr.hidden = !this.target;
        if (this.target) pr.innerHTML = `<kbd>${inp.usingPad ? 'Ⓐ' : inp.touch ? '✋' : 'E'}</kbd>${this.target.icon || ''} ${esc(this.target.label)}`;
      }
      if (inp.take('act') && this.target) this.target.run();
      this.autosave += dt;
      if (this.autosave > 60) {
        this.autosave = 0;
        this.saveGame();
      }
    } else if (this.mode !== 'play') {
      this.playerBody.update(dt);
      document.getElementById('prompt')!.hidden = true;
      this.lastPromptKey = '';
    } else this.playerBody.update(dt);
    if (this.dungeon) {
      this.dungeon.update(dt, this.player.pos, !!s.inv.lamp);
      this.renderer.toneMappingExposure = 1.2;
    }
    else this.world.update(dt, s, this.player.pos, this.talking);
    this.cam.update(dt, this.player.pos, inp, this.ground, this.settings.sens, this.settings.invert, !!this.dungeon);
    const night = this.dungeon ? 0 : this.world.env.night;
    if (!this.dungeon && this.mode === 'play') this.sound.setTheme(night > 0.6 ? 'night' : 'island');
    this.sound.update(this.dungeon ? 0 : this.world.seaNear(this.player.pos), night);
    this.hud();
    this.renderer.render(this.scene, this.camera);
    inp.endFrame();
  }

  // ---------- Gespräche (Hilfen für talk.ts) ----------
  actor(id: string): NpcActor {
    return this.world.npcs.find((a) => a.def.id === id)!;
  }
  /** Gesprächs-Kamera und Haltung */
  beginTalk(a: NpcActor) {
    this.talking = a.def.id;
    this.mode = 'scene';
    const p = this.player.pos,
      n = a.body.root.position;
    const yaw = Math.atan2(n.x - p.x, n.z - p.z);
    this.player.yaw = yaw;
    this.player.sync();
    a.body.root.rotation.y = yaw + Math.PI;
    a.body.mode = 'talk';
    a.body.speed = 0;
    this.playerBody.mode = 'idle';
    this.playerBody.speed = 0;
    const dir = new THREE.Vector3(n.x - p.x, 0, n.z - p.z).normalize();
    const side = new THREE.Vector3(dir.z, 0, -dir.x);
    const face = a.body.faceWorld();
    // Nahaufnahme der Figur, leicht seitlich über die Schulter der Spielfigur
    this.cam.shot = { pos: face.clone().addScaledVector(dir, -1.35).addScaledVector(side, 0.5).setY(face.y + 0.06), at: face.clone().setY(face.y - 0.08) };
  }
  endTalk(a: NpcActor) {
    this.talking = null;
    this.cam.shot = null;
    a.body.mode = 'idle';
    this.ui.endDialog();
    this.ui.cinema(false);
    this.mode = 'play';
    this.saveGame();
  }
  /** für Szenen: Kamera um einen Punkt kreisen lassen */
  orbit(center: THREE.Vector3, radius: number, h: number, ang: number) {
    this.cam.shot = { pos: new THREE.Vector3(center.x + Math.sin(ang) * radius, center.y + h, center.z + Math.cos(ang) * radius), at: center.clone().setY(center.y + h - 0.15) };
  }
  playScene = (id: string, replay = false) => playScene(this, id, replay);
  get dungeons() {
    return DUNGEONS;
  }
}
