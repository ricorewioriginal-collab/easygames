import '@fontsource/cinzel/latin-700.css';
import '@fontsource/cinzel/latin-900.css';
// Start: Laden, Spielstand-Übernahme, Eingabe (Tastatur, Touch, Controller über ../gamepad.js) und Bildschleife.
import { Game, M, SAVE_KEY } from './game.js';
import { UI } from './ui.js';
import { View, STATIC_MODELS } from './view.js';
import * as A from './assets.js';
import * as L from './logic.js';
import { readGodotSave } from './godotsave.js';
import { Sound } from './audio.js';

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
  await importLegacySave();
  const audio = new Sound();
  audio.on = cfg.music !== false;
  const unlock = () => audio.unlock();
  addEventListener('pointerdown', unlock, true);
  addEventListener('keydown', unlock, true);
  const game = new Game(null, null, { store, debug: params.has('debug'), audio });
  game.onAudio = (on) => { cfg.music = on; store.set(CFG, JSON.stringify(cfg)); };
  const ui = new UI(game);
  const view = new View(canvas, game, quality);
  game.ui = ui;
  game.view = view;
  ui.view = view;
  view.onQuality = (q) => { cfg.q = q; store.set(CFG, JSON.stringify(cfg)); };
  window.__quest = game;   // für Tests
  // Laden: feste Modelle + Figuren von Hafenau
  const files = [...STATIC_MODELS, 'kk/Knight.glb', 'kk/Mage.glb', 'kk/Rogue_Hooded.glb'];
  let n = 0;
  A.setProgress(() => {});
  const hdr = view.loadHdr();
  await Promise.all(files.map(f => A.load(f).then(() => { n++; const p = Math.round(n / files.length * 100); $('lfill').style.width = p + '%'; $('ltxt').textContent = `Lade Spielwelt … ${p} %`; })));
  await hdr;
  // Titel-Hintergrund: Hafenau
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
    game.stick = padStick();
    game.update(dt);
    view.frame(dt);
    ui.frame();
    view.watchFps(dt, qLocked || document.hidden);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  game.showTitle();
}

// Linker Stick des Controllers stufenlos (gamepad.js meldet ihn zusätzlich als Pfeiltasten für die Menüs)
function padStick() {
  let pads = [];
  try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { }
  for (const p of pads) {
    if (!p || !p.connected || !p.axes || p.axes.length < 2) continue;
    const x = p.axes[0] || 0, y = p.axes[1] || 0, m = Math.hypot(x, y);
    if (m > 0.22) return { x, y, m: Math.min(1, (m - 0.22) / 0.7) };
  }
  return null;
}

// Spielstand der Godot-Fassung übernehmen. Die Cloud kann eine neuere alte Datei erst nach dem Start
// zurückspielen (und lädt dann neu) – daher merken wir uns, was übernommen wurde, und übernehmen eine
// geänderte alte Datei erneut, solange in der neuen Fassung seitdem nicht gespeichert wurde.
const LEGACY = 'anmachaQuest_legacy';
const fp = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + ':' + str.length; };
async function importLegacySave() {
  const old = await readGodotSave();
  if (!old) return;
  const json = JSON.stringify(old), mark = { src: fp(json), save: fp(json) };
  let prev = null;
  try { prev = JSON.parse(store.get(LEGACY)); } catch (e) { }
  const cur = store.get(SAVE_KEY);
  if (prev && prev.src === mark.src) return;                   // diese alte Datei ist schon übernommen
  if (cur !== null && (!prev || fp(cur) !== prev.save)) return; // in der neuen Fassung wurde schon gespielt
  store.set(SAVE_KEY, json);
  store.set(LEGACY, JSON.stringify(mark));
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
    if (a === 'ok' && !e.repeat && game.actionFront()) return;
    // Escape öffnet auf der Karte das Menü (wie in der Godot-Fassung)
    if ((a === 'menu' || e.code === 'Escape') && game.mode === M.WORLD) game.openMenu();
  });
  // Umschalt gedrückt halten = gehen statt rennen
  const shift = (e) => { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') game.walkKey = e.type === 'keydown'; };
  addEventListener('keydown', shift);
  addEventListener('keyup', shift);
  addEventListener('keyup', (e) => {
    const a = KEYMAP[e.code];
    if (a && DIRV[a]) game.pressDir(DIRV[a], false);
  });
  addEventListener('blur', () => { game.clearDirs(); game.walkKey = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) game.clearDirs(); });
  document.addEventListener('contextmenu', e => e.preventDefault());
  camInput(game);
  document.addEventListener('gesturestart', e => e.preventDefault());
}

// Kamera: Q/E (Controller: rechter Stick, LB/RB) drehen, R/F oder Mausrad zoomen, Ziehen mit Maus/Finger dreht, zwei Finger zoomen
function camInput(game) {
  const v = () => game.view;
  const held = new Set();
  const upd = () => { v().camKeys = (held.has('KeyE') ? 1 : 0) - (held.has('KeyQ') ? 1 : 0); };
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyQ' || e.code === 'KeyE') { held.add(e.code); upd(); }
    else if (!e.repeat && (e.code === 'KeyR' || e.code === 'PageUp')) v().zoomCam(-1);
    else if (!e.repeat && (e.code === 'KeyF' || e.code === 'PageDown')) v().zoomCam(1);
  });
  addEventListener('keyup', (e) => { if (held.delete(e.code)) upd(); });
  addEventListener('blur', () => { held.clear(); upd(); });
  const cv = $('cv');
  const pts = new Map();
  let pinch = 0;
  cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (_) { } if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
  cv.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    if (pts.size === 1) v().rotateCam(-(e.clientX - p.x) * 0.008);
    else if (pts.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch && Math.abs(d - pinch) > 60) { v().zoomCam(d > pinch ? -1 : 1); pinch = d; }
      return;
    }
    p.x = e.clientX; p.y = e.clientY;
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  let wheelT = 0;
  cv.addEventListener('wheel', (e) => { e.preventDefault(); const now = performance.now(); if (now - wheelT < 180) return; wheelT = now; v().zoomCam(e.deltaY > 0 ? 1 : -1); }, { passive: false });
}

boot().catch(fail);
