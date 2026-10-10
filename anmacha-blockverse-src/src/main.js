// Oberfläche, Eingabe (Tastatur/Maus/Touch), Menüs, Speichern.
import './style.css';
import { Game } from './game.js';
import { B, NAMES, LOGO0, LOGO_COUNT } from './world.js';
import { SLOTS, readMeta, readWorld, writeWorld, deleteWorld } from './storage.js';
import { unlockAudio, sfx } from './audio.js';

const $ = id => document.getElementById(id);
const canvas = $('c');
const coarse = window.matchMedia('(pointer: coarse)').matches;
const game = new Game(canvas, coarse);
window.__bv = game; // Testzugriff

let state = 'menu';       // menu | loading | playing | paused | inventory
let slot = -1;
let touchMode = coarse;
const keys = new Set();

// ---------- Icons / Atlas ----------
document.documentElement.style.setProperty('--atlas', `url(${game.atlasCanvas.toDataURL()})`);
const ICON_TILE = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7, 7: 8, 8: 9, 9: 10 };
const icon = t => {
  if (t >= LOGO0) { const k = t - LOGO0; return `<i class="ic lg" style="background-position:${(k % 4) * 100 / 3}% ${Math.floor(k / 4) * 100 / 3}%"></i>`; }
  const k = ICON_TILE[t] ?? 0;
  return `<i class="ic" style="background-position:${(k % 8) * 100 / 7}% ${Math.floor(k / 8) * 100 / 7}%"></i>`;
};
// Logo-Atlas als Bild für Hotbar/Inventar, sobald alle Logos geladen sind
game.onLogos = () => { document.documentElement.style.setProperty('--logos', `url(${game.logoCanvas.toDataURL('image/png')})`); };

// ---------- Hinweise ----------
let toastTimer = 0;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 1800);
}
game.onToast = toast;

// ---------- Hotbar / Inventar ----------
function renderHotbar() {
  const hb = $('hotbar');
  if (!hb.children.length) {
    for (let i = 0; i < 9; i++) {
      const d = document.createElement('div');
      d.className = 'slot';
      d.addEventListener('pointerdown', e => { e.stopPropagation(); game.selectSlot(i); });
      hb.appendChild(d);
    }
  }
  for (let i = 0; i < 9; i++) {
    const d = hb.children[i], t = game.hotbar[i];
    const n = game.mode === 'creative' ? '∞' : (game.inv[t] || 0);
    d.className = 'slot' + (i === game.sel ? ' sel' : '') + (t && n === 0 ? ' empty' : '');
    d.title = NAMES[t] || '';
    d.innerHTML = `<span class="k">${i + 1}</span>${t ? icon(t) : ''}<span class="n">${t ? n : ''}</span>`;
  }
}

const RECIPES = [
  { give: [B.PLANKS, 4], need: [[B.WOOD, 1]] },
  { give: [B.GLASS, 1], need: [[B.SAND, 2]] },
  { give: [B.LAMP, 2], need: [[B.GLASS, 2], [B.WOOD, 1]] }
];
function renderInventory() {
  const creative = game.mode === 'creative';
  $('invHint').textContent = creative ? 'Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.'
    : 'Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.';
  let h = '';
  for (let t = 1; t <= 9; t++) {
    const n = creative ? '∞' : (game.inv[t] || 0);
    h += `<button class="cell ${n ? 'has' : 'dim'}" data-t="${t}">${icon(t)}<span>${NAMES[t]}</span><b>${n}</b></button>`;
  }
  $('invGrid').innerHTML = h;
  let lg = '';
  for (let i = 0; i < LOGO_COUNT; i++) {
    const t = LOGO0 + i, n = creative ? '∞' : (game.inv[t] || 0);
    lg += `<button class="cell ${n ? 'has' : 'dim'}" data-t="${t}">${icon(t)}<span>${NAMES[t]}</span><b>${n}</b>${creative ? '' : `<i class="plus" data-craft="${t}" title="1 Bretter → 2 Logo-Blöcke">＋</i>`}</button>`;
  }
  $('logoGrid').innerHTML = lg;
  $('recipes').innerHTML = creative ? '<small>Herstellen ist im Kreativmodus nicht nötig.</small>' : RECIPES.map((r, i) => {
    const ok = r.need.every(([t, n]) => (game.inv[t] || 0) >= n);
    const need = r.need.map(([t, n]) => `${n}× ${NAMES[t]}`).join(' + ');
    return `<button data-r="${i}" ${ok ? '' : 'disabled'}>${icon(r.give[0])}<span><b>${r.give[1]}× ${NAMES[r.give[0]]}</b> aus ${need}</span></button>`;
  }).join('');
}
function onInvClick(e) {
  const pl = e.target.closest('[data-craft]');
  if (pl) {
    if ((game.inv[B.PLANKS] || 0) < 1) { toast('Dafür brauchst du 1 Bretter'); return; }
    const t = Number(pl.dataset.craft);
    game.inv[B.PLANKS]--; game.inv[t] = Math.min(999, (game.inv[t] || 0) + 2);
    game.unsaved = true; game.onChange(); return;
  }
  const b = e.target.closest('[data-t]'); if (!b) return;
  const t = Number(b.dataset.t), i = game.hotbar.indexOf(t);
  if (i >= 0) game.hotbar[i] = game.hotbar[game.sel];
  game.hotbar[game.sel] = t;
  game.onChange();
}
$('invGrid').addEventListener('click', onInvClick);
$('logoGrid').addEventListener('click', onInvClick);
$('recipes').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const r = RECIPES[Number(b.dataset.r)];
  if (!r.need.every(([t, n]) => (game.inv[t] || 0) >= n)) return;
  for (const [t, n] of r.need) game.inv[t] -= n;
  game.inv[r.give[0]] = Math.min(999, (game.inv[r.give[0]] || 0) + r.give[1]);
  game.unsaved = true; game.onChange();
});
game.onChange = () => { renderHotbar(); if (state === 'inventory') renderInventory(); };

// ---------- Zustände ----------
const show = (id, on) => { $(id).hidden = !on; };
function setState(s) {
  state = s;
  document.body.classList.toggle('playing', s === 'playing');
  show('menu', s === 'menu'); show('pause', s === 'paused'); show('inv', s === 'inventory'); show('loading', s === 'loading');
  show('hud', s === 'playing' || s === 'paused' || s === 'inventory');
}
const locked = () => document.pointerLockElement === canvas;
function lockPointer() {
  if (touchMode || locked()) return;
  try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignorieren */ }
}
function releaseInput() {
  game.breakHeld = game.placeHeld = false; keys.clear(); syncKeys();
  Object.assign(game.input, { f: 0, r: 0, jump: false, down: false, sprint: false });
}

function pause() {
  if (state !== 'playing') return;
  game.stop(); releaseInput(); saveNow();
  setState('paused');
  $('vd').value = game.viewDist; $('vdVal').textContent = game.viewDist;
  if (locked()) document.exitPointerLock();
}
function resume() {
  setState('playing'); game.resume(); lockPointer();
}
function openInventory() {
  if (state !== 'playing') return;
  releaseInput(); setState('inventory'); renderInventory();
  if (locked()) document.exitPointerLock();
  game.stop(); // statisches Bild – spart Akku
}
function closeInventory() {
  if (state !== 'inventory') return;
  setState('playing'); game.resume(); lockPointer();
  if (!touchMode) setTimeout(() => { if (state === 'playing' && !locked()) pause(); }, 250);
}

document.addEventListener('pointerlockchange', () => { if (!locked() && state === 'playing' && !touchMode) pause(); });
document.addEventListener('pointerlockerror', () => { if (state === 'playing' && !touchMode) pause(); });

// ---------- Speichern ----------
function saveNow(announce) {
  if (!game.world || slot < 0) return;
  const ok = writeWorld(slot, game.serialize());
  if (ok) game.unsaved = false;
  if (announce || !ok) toast(ok ? 'Gespeichert ✔' : 'Speichern fehlgeschlagen (Speicher voll?)');
  return ok;
}
setInterval(() => { if (state === 'playing') saveNow(false); }, 30000);
window.addEventListener('pagehide', () => saveNow(false));
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') pause(); });

// ---------- Menü ----------
function parseSeed(str) {
  str = (str || '').trim();
  if (!str) return Math.floor(Math.random() * 2147483647);
  if (/^-?\d{1,9}$/.test(str)) return Number(str);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h | 0;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderSlots() {
  let h = '';
  for (let i = 0; i < SLOTS; i++) {
    const m = readMeta(i);
    if (m) {
      const d = new Date(m.savedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
      h += `<div class="card"><b>${esc(m.name)}</b><small>${m.mode === 'creative' ? 'Kreativ' : 'Überleben'} · Startwert ${esc(m.seed)} · ${d}</small>
        <div class="row"><button class="go" data-act="load" data-i="${i}">▶ Weiterspielen</button><button data-act="del" data-i="${i}" aria-label="Löschen">🗑</button></div></div>`;
    } else {
      h += `<div class="card"><b>Neue Welt</b>
        <input id="seed${i}" placeholder="Startwert (leer = zufällig)" maxlength="24" autocomplete="off">
        <select id="mode${i}"><option value="survival">Überleben</option><option value="creative">Kreativ (fliegen)</option></select>
        <button class="go" data-act="new" data-i="${i}">✨ Welt erzeugen</button></div>`;
    }
  }
  $('slots').innerHTML = h;
}
$('slots').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const i = Number(b.dataset.i);
  if (b.dataset.act === 'del') {
    if (confirm('Diese Welt wirklich löschen?')) { deleteWorld(i); renderSlots(); }
  } else if (b.dataset.act === 'load') {
    const s = readWorld(i);
    if (!s) { toast('Speicherstand nicht lesbar'); renderSlots(); return; }
    launch(i, s);
  } else {
    launch(i, { name: 'Welt ' + (i + 1), seed: parseSeed($('seed' + i).value), mode: $('mode' + i).value });
  }
});

function launch(i, save) {
  unlockAudio();
  slot = i;
  setState('loading');
  // Ein Frame Pause, damit der Ladebildschirm sichtbar wird
  requestAnimationFrame(() => setTimeout(() => {
    try {
      game.start(save);
      if (save.mode === 'creative') game.player.flying = false;
      $('bFly').hidden = !(touchMode && game.mode === 'creative');
      renderHotbar(); setState('playing'); lockPointer();
      if (!game.unsaved && save.px === undefined) saveNow(false);
    } catch (err) {
      console.error(err); setState('menu'); renderSlots(); alert('Die Welt konnte nicht gestartet werden.');
    }
  }, 30));
}

$('pResume').onclick = () => { unlockAudio(); resume(); };
$('pSave').onclick = () => saveNow(true);
$('pRespawn').onclick = () => { game.respawn(); resume(); };
$('pSound').onclick = () => { sfx.enabled = !sfx.enabled; $('pSound').textContent = sfx.enabled ? '🔊 Ton: an' : '🔇 Ton: aus'; };
$('pFull').onclick = () => { try { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()); } catch (e) { /* ignorieren */ } };
$('pMenu').onclick = () => { saveNow(false); game.stop(); game.clearWorld(); slot = -1; renderSlots(); setState('menu'); };
$('vd').oninput = e => { game.setViewDist(Number(e.target.value)); $('vdVal').textContent = e.target.value; };
$('invClose').onclick = closeInventory;
$('bInv').onclick = openInventory;
$('bPause').onclick = pause;

// ---------- Tastatur ----------
function syncKeys() {
  const inp = game.input;
  if (touchActive.joy) return;
  inp.f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  inp.r = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  const fly = game.player.flying;
  inp.sprint = keys.has('ControlLeft') || (!fly && keys.has('ShiftLeft'));
  inp.down = fly && (keys.has('ShiftLeft') || keys.has('KeyQ')) || touchActive.down;
  inp.jump = keys.has('Space') || touchActive.jump;
}
const touchActive = { joy: false, jump: false, down: false };
let lastSpace = 0;
function toggleFly() {
  if (game.mode !== 'creative') return;
  const p = game.player; p.flying = !p.flying; p.vy = 0;
  toast(p.flying ? 'Fliegen an' : 'Fliegen aus');
  $('bDown').hidden = !(touchMode && p.flying); $('bFly').classList.toggle('on', p.flying);
}
window.addEventListener('keydown', e => {
  if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (state === 'inventory') { if (e.code === 'KeyE' || e.code === 'Escape') { e.preventDefault(); closeInventory(); } return; }
  if (state !== 'playing') return;
  if (e.code === 'Space' || e.code === 'Tab' || e.code.startsWith('Arrow')) e.preventDefault();
  if (e.repeat) return;
  if (/^Digit[1-9]$/.test(e.code)) { game.selectSlot(Number(e.code[5]) - 1); return; }
  if (e.code === 'KeyE') { e.preventDefault(); openInventory(); return; }
  if (e.code === 'KeyF') { toggleFly(); return; }
  if (e.code === 'Space') { const n = performance.now(); if (n - lastSpace < 280) toggleFly(); lastSpace = n; }
  keys.add(e.code); syncKeys();
});
window.addEventListener('keyup', e => { keys.delete(e.code); if (state === 'playing') syncKeys(); });
window.addEventListener('blur', () => { keys.clear(); syncKeys(); });

// ---------- Maus ----------
const SENS = 0.0022;
function look(dx, dy, s) {
  game.yaw -= dx * s;
  game.pitch = Math.max(-1.55, Math.min(1.55, game.pitch - dy * s));
}
window.addEventListener('mousemove', e => { if (state === 'playing' && locked()) look(e.movementX, e.movementY, SENS); });
canvas.addEventListener('mousedown', e => {
  if (state !== 'playing' || touchMode && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
  unlockAudio();
  if (!locked()) { lockPointer(); return; }
  if (e.button === 0) game.breakHeld = true;
  else if (e.button === 2) game.placeHeld = true;
  e.preventDefault();
});
window.addEventListener('mouseup', e => { if (e.button === 0) game.breakHeld = false; else if (e.button === 2) game.placeHeld = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('wheel', e => {
  if (state !== 'playing') return;
  game.selectSlot(game.sel + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });

// ---------- Touch ----------
function enableTouch() {
  if (touchMode && document.body.classList.contains('touch')) return;
  touchMode = true; document.body.classList.add('touch');
  $('bFly').hidden = game.mode !== 'creative';
}
if (touchMode) document.body.classList.add('touch');
window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') enableTouch(); }, { capture: true });

(function setupTouch() {
  const zl = $('zl'), zr = $('zr'), joy = $('joy'), thumb = $('thumb');
  const R = 52;
  let jp = null, lp = null;
  zl.addEventListener('pointerdown', e => {
    if (jp) return;
    unlockAudio();
    jp = { id: e.pointerId, x: e.clientX, y: e.clientY }; zl.setPointerCapture(e.pointerId);
    joy.style.display = 'block'; joy.style.left = e.clientX + 'px'; joy.style.top = e.clientY + 'px';
    thumb.style.transform = 'translate(0,0)'; touchActive.joy = true;
  });
  zl.addEventListener('pointermove', e => {
    if (!jp || e.pointerId !== jp.id) return;
    let dx = e.clientX - jp.x, dy = e.clientY - jp.y;
    const len = Math.hypot(dx, dy), k = len > R ? R / len : 1;
    thumb.style.transform = `translate(${dx * k}px,${dy * k}px)`;
    const m = Math.min(1, len / R), dead = m < 0.14 ? 0 : (m - 0.14) / 0.86;
    const nx = len ? dx / len : 0, ny = len ? dy / len : 0;
    game.input.r = nx * dead; game.input.f = -ny * dead; game.input.sprint = len > R * 1.35;
  });
  const endJoy = e => {
    if (!jp || e.pointerId !== jp.id) return;
    jp = null; joy.style.display = 'none'; touchActive.joy = false;
    game.input.f = game.input.r = 0; game.input.sprint = false; syncKeys();
  };
  zl.addEventListener('pointerup', endJoy); zl.addEventListener('pointercancel', endJoy);

  zr.addEventListener('pointerdown', e => { if (lp) return; lp = { id: e.pointerId, x: e.clientX, y: e.clientY }; zr.setPointerCapture(e.pointerId); });
  zr.addEventListener('pointermove', e => {
    if (!lp || e.pointerId !== lp.id) return;
    look(e.clientX - lp.x, e.clientY - lp.y, 0.0058); lp.x = e.clientX; lp.y = e.clientY;
  });
  const endLook = e => { if (lp && e.pointerId === lp.id) lp = null; };
  zr.addEventListener('pointerup', endLook); zr.addEventListener('pointercancel', endLook);

  const hold = (id, on, off) => {
    const el = $(id);
    el.addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); el.setPointerCapture(e.pointerId); el.classList.add('on'); on(); });
    const up = () => { el.classList.remove('on'); off(); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };
  hold('bBreak', () => { game.breakHeld = true; }, () => { game.breakHeld = false; });
  hold('bPlace', () => { game.placeHeld = true; }, () => { game.placeHeld = false; });
  hold('bJump', () => { touchActive.jump = true; game.input.jump = true; }, () => { touchActive.jump = false; game.input.jump = keys.has('Space'); });
  hold('bDown', () => { touchActive.down = true; game.input.down = true; }, () => { touchActive.down = false; game.input.down = false; });
  $('bFly').addEventListener('click', toggleFly);
})();

// ---------- Fenster ----------
window.addEventListener('resize', () => game.resize());
setInterval(() => {
  if (state !== 'playing') return;
  const p = game.player;
  $('info').textContent = `${game.clockText()} ${game.time < 0.5 ? '☀' : '☾'} · X ${p.x.toFixed(0)} Y ${p.y.toFixed(0)} Z ${p.z.toFixed(0)}${p.flying ? ' · fliegt' : ''}`;
  $('uw').classList.toggle('on', !!game.underwater);
}, 250);

renderSlots();
setState('menu');
