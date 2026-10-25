// Start: Laden, Spielstand-Übernahme, Eingabe (Tastatur, Touch, Controller über ../gamepad.js) und Bildschleife.
import { Game, M, SAVE_KEY } from './game.js';
import { UI } from './ui.js';
import { View, STATIC_MODELS } from './view.js';
import * as A from './assets.js';
import * as L from './logic.js';
import { readGodotSave } from './godotsave.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
  has(k) { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } }
};
function fail(e) {
  console.error(e);
  const b = $('lerr');
  b.style.display = 'block';
  b.textContent = 'Fehler beim Start: ' + (e && e.message ? e.message : String(e));
  $('ltxt').textContent = 'Das Spiel konnte nicht starten.';
  $('load').classList.remove('out');
}
addEventListener('error', (e) => { if (!started) fail(e.error || e.message); });
let started = false;

// Grafikstufe: ?q=0|1|2, sonst gespeichert, sonst nach Gerät
const CFG = 'anmachaQuest_cfg';
let cfg = {};
try { cfg = JSON.parse(store.get(CFG)) || {}; } catch (e) { }
const coarse = matchMedia('(pointer: coarse)').matches;
let quality = params.has('q') ? Math.max(0, Math.min(2, +params.get('q') | 0)) : (cfg.q ?? (coarse ? 1 : 2));
const qLocked = params.has('q');

async function boot() {
  const canvas = $('cv');
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('Dein Browser unterstützt kein WebGL.');
  // Alter Spielstand der Godot-Fassung wird einmalig übernommen
  if (!store.has(SAVE_KEY)) {
    const old = await readGodotSave();
    if (old) store.set(SAVE_KEY, JSON.stringify(old));
  }
  const game = new Game(null, null, { store, debug: params.has('debug') });
  const ui = new UI(game);
  const view = new View(canvas, game, quality);
  game.ui = ui;
  game.view = view;
  ui.view = view;
  view.onQuality = (q) => { cfg.q = q; store.set(CFG, JSON.stringify(cfg)); };
  window.__quest = game;   // für Tests
  // Laden: feste Modelle + Figuren des Funkhafens
  const files = [...STATIC_MODELS, 'hero_Warrior.glb', 'hero_Wizard.glb', 'hero_Rogue.glb'];
  let n = 0;
  A.setProgress(() => {});
  await Promise.all(files.map(f => A.load(f).then(() => { n++; const p = Math.round(n / files.length * 100); $('lfill').style.width = p + '%'; $('ltxt').textContent = `Lade Spielwelt … ${p} %`; })));
  // Titel-Hintergrund: der Funkhafen
  L.loadMap(game.S, game.rng, 'hub', { x: 12, y: 12 });
  game.mode = M.TITLE;
  await view.ready();
  view.frame(0.016);
  started = true;
  $('load').classList.add('out');
  setTimeout(() => $('load').remove(), 600);
  setTimeout(() => $('rot')?.remove(), 9000);
  input(game, ui);
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.update(dt);
    view.frame(dt);
    ui.frame();
    view.watchFps(dt, qLocked || document.hidden);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  game.showTitle();
}

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'ok', Enter: 'ok', NumpadEnter: 'ok', KeyZ: 'ok', Escape: 'cancel', KeyX: 'cancel', Backspace: 'cancel', KeyM: 'menu', Tab: 'menu'
};
const DIRV = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
function input(game, ui) {
  addEventListener('keydown', (e) => {
    if (e.code === 'F8' || e.code === 'F9') { game.debugKey(e.code); return; }
    const a = KEYMAP[e.code] || (e.key === 'Enter' ? 'ok' : e.key === 'Escape' ? 'cancel' : null);
    if (!a) return;
    e.preventDefault();
    if (DIRV[a] && !e.repeat) game.pressDir(DIRV[a], true);
    if (e.repeat && !DIRV[a]) return;
    if (ui.action(a)) return;
    // Escape öffnet auf der Karte das Menü (wie in der Godot-Fassung)
    if ((a === 'menu' || e.code === 'Escape') && game.mode === M.WORLD) game.openMenu();
  });
  addEventListener('keyup', (e) => {
    const a = KEYMAP[e.code];
    if (a && DIRV[a]) game.pressDir(DIRV[a], false);
  });
  addEventListener('blur', () => game.clearDirs());
  document.addEventListener('visibilitychange', () => { if (document.hidden) game.clearDirs(); });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
}

boot().catch(fail);
