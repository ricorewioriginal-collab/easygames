/* Das eigentliche Spiel: wird erst geladen, wenn die Grafik-Engine bereit ist (siehe main.ts). */
import { Game } from './game.ts';
import { browserKV, SaveStore, type SaveData } from './persistence/save.ts';
import { logError } from './core/log.ts';
import { Hud } from './ui/hud.ts';
import { Menus } from './ui/menus.ts';
import { closeAllModals, anyModal, topModal } from './ui/dom.ts';
import { openEditor } from './ui/editor.ts';
import { AudioEngine } from './audio/music.ts';
import { THEMES } from './audio/themes.ts';
import { ALL_WORLDS } from './world/worlds/index.ts';
import { installSystems } from './systems.ts';
import { registerServiceWorker } from './pwa.ts';

const boot = window.__boot ?? { set: () => {}, fail: (m: string) => console.error(m), done: () => {} };
const nextFrame = () => new Promise<void>(r => requestAnimationFrame(() => r()));

export async function start(): Promise<void> {
  boot.set(60, 'Bereite die Insel vor …');
  await nextFrame();
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  let g: Game;
  const store = new SaveStore(browserKV());
  const settings = store.loadSettings();
  document.documentElement.style.setProperty('--ui-scale', String(settings.touchScale));
  try { g = new Game(canvas, store, settings); }
  catch (e) { logError('WebGL', e); boot.fail('Dein Gerät oder Browser unterstützt kein WebGL (3D-Grafik). ' + (e instanceof Error ? e.message : '')); return; }
  boot.set(68, 'Baue Inseln und Brücken …');
  await nextFrame();
  g.registerWorlds(ALL_WORLDS);
  boot.set(90, 'Lade Klänge …');
  await nextFrame();
  const audio = new AudioEngine('./');
  const applyAudio = () => audio.setVolumes(g.settings.musicVol, g.settings.sfxVol, g.settings.ambientVol, g.settings.muted);
  g.sfxHook = (n, v) => audio.sfx(n, v ?? 1);
  let hud: Hud | null = null;
  const unlockAudio = () => { audio.unlock(); applyAudio(); audio.preload(['coins', 'buy', 'hit', 'enter', 'dog']); };
  window.addEventListener('pointerdown', unlockAudio, { once: false, passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  const sys = installSystems(g, audio);
  boot.set(80, 'Pflanze Bäume auf der Hauptinsel …');
  await nextFrame();
  g.worlds.stream(0, 0, true);
  const menus: Menus = new Menus(g, {
    play: (save: SaveData) => play(save),
    toTitle: () => toTitle(),
    afterSettings: () => { applyAudio(); g.input.setKeys(g.settings.keys); },
    unlockAudio
  });
  const pause = () => { if (g.phase !== 'play' || anyModal()) return; menus.showPause(sys.pauseExtras()); };
  function play(save: SaveData): void {
    closeAllModals();
    menus.hideTitle();
    if (!hud) {
      hud = new Hud(g, { map: () => g.openPanel('map'), journal: () => g.openPanel('journal'), inventory: () => g.openPanel('inventory'), pause, emote: () => g.openPanel('emotes') });
      sys.attachHud(hud);
    }
    hud.show(true);
    g.start(save);
    applyAudio();
  }
  function toTitle(): void {
    closeAllModals();
    hud?.show(false);
    g.enterTitle();
    audio.setTheme(THEMES.insel);
    menus.showTitle();
  }
  g.panels.editor = () => {
    if (g.phase !== 'play') return;
    hud?.show(false);
    openEditor(g, { look: g.save.look, name: g.save.name, owned: [...g.save.cosmetics, ...g.save.achievements, ...g.save.abilities], askName: true, title: 'Kleiderschrank', done: (look, name) => { g.save.look = look; g.save.name = name; g.avatar.setLook(look); g.setFlag('outfit'); hud?.show(true); g.persist(); }, cancel: () => hud?.show(true) });
  };
  g.panels.pause = pause;
  g.onFrame = dt => {
    if (g.phase !== 'play') return;
    hud?.update(dt);
    // Tasten für Menüs
    const inp = g.input;
    if (inp.pressed('pause')) { if (anyModal()) topModal()?.close(); else pause(); }
    if (!anyModal() && g.busy === 0) {
      if (inp.pressed('map')) g.openPanel('map');
      if (inp.pressed('journal')) g.openPanel('journal');
      if (inp.pressed('inventory')) g.openPanel('inventory');
      if (inp.pressed('emote')) g.openPanel('emotes');
    }
  };
  // Musik/Umgebung laufen immer
  setInterval(() => { try { audio.update(); } catch (e) { logError('Audio', e); } }, 100);

  g.enterTitle();
  g.startLoop();
  boot.set(100, 'Fertig!');
  await nextFrame();
  menus.showTitle();
  boot.done();
  audio.setTheme(THEMES.insel);
  registerServiceWorker();
  // Test-Schnittstelle (nur für automatische Tests)
  if (/[?&]test=1/.test(location.search)) window.__bi2 = { g, menus, sys, play, store };
}
