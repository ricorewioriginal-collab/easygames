// 📷 Fotomodus: Spiel anhalten, Kamera frei um die Figur drehen, zoomen und
// verschieben, Filter und Posen wählen, Foto aufnehmen. Mit jedem Gerät:
// Stick/WASD verschiebt, rechter Stick/Ziehen dreht, Rad/ZL-ZR/± zoomt.
// Fotos landen im Album (die letzten 12, im Browser gespeichert) und lassen
// sich speichern oder teilen.
import { h, FocusNav } from './ui.js';
import { THREE } from '../engine/three.js';

const ALBUM_KEY = 'taschi.photos.v1', ALBUM_MAX = 12;
export const FILTERS = [
  ['Natur', 'none'], ['Warm', 'sepia(0.25) saturate(1.25) brightness(1.04)'], ['Kühl', 'hue-rotate(-12deg) saturate(1.1) brightness(1.03)'],
  ['Kräftig', 'saturate(1.6) contrast(1.08)'], ['Schwarzweiß', 'grayscale(1) contrast(1.15)'], ['Retro', 'sepia(0.6) contrast(0.92) brightness(1.05)'], ['Traum', 'saturate(1.3) brightness(1.1) blur(0.6px)']
];
const POSES = [['Stehen', 'idle'], ['Winken', 'wave'], ['Jubeln', 'cheer'], ['Werfen', 'throw']];

export function loadAlbum() { try { const a = JSON.parse(localStorage.getItem(ALBUM_KEY) || '[]'); return Array.isArray(a) ? a.filter(x => typeof x?.src === 'string') : []; } catch (e) { return []; } }
function storeAlbum(a) {
  for (let n = a.length; n > 0; n--) { try { localStorage.setItem(ALBUM_KEY, JSON.stringify(a.slice(0, n))); return true; } catch (e) { } }
  return false;
}

// Bild aus dem aktuellen Kamerabild: Filter einbrennen, Rahmen mit Ort und Datum
export function capture(game, { filter = 'none', frame = true, width = 1280 } = {}) {
  const w = game.world, canvas = game.renderer.renderer.domElement;
  game.renderer.render(w.scene, w.camera, w.current?.type === 'interior' ? 'indoor' : 'day');
  const W = Math.min(width, canvas.width), H = Math.round(W * canvas.height / canvas.width);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  if (filter !== 'none' && 'filter' in ctx) ctx.filter = filter;
  ctx.drawImage(canvas, 0, 0, W, H);
  ctx.filter = 'none';
  if (frame) {
    const pad = Math.round(H * 0.035), fs = Math.max(12, Math.round(H * 0.032));
    ctx.font = `700 ${fs}px system-ui, sans-serif`; ctx.textBaseline = 'bottom';
    const place = game.hud?.loc?.querySelector('.reg')?.textContent || 'Taschi';
    const txt = '📷 ' + place + ' · ' + new Date().toLocaleDateString('de-DE');
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(txt, pad + 2, H - pad + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(txt, pad, H - pad);
    ctx.textAlign = 'right'; ctx.font = `900 ${Math.round(fs * 1.15)}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText('TASCHI', W - pad + 2, H - pad + 2);
    ctx.fillStyle = '#ffd34d'; ctx.fillText('TASCHI', W - pad, H - pad);
  }
  return out.toDataURL('image/jpeg', 0.86);
}

async function saveOrShare(game, src) {
  const name = 'taschi-foto-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.jpg';
  try {
    const blob = await (await fetch(src)).blob();
    const file = new File([blob], name, { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Mein Taschi-Foto' }); return; }
  } catch (e) { if (e?.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = src; a.download = name; document.body.append(a); a.click(); a.remove();
  game.ui.toast('Foto gespeichert', '📷');
}

export function openPhotoMode(game) {
  const w = game.world;
  if (!w.current || !w.player) return Promise.resolve();
  return new Promise(resolve => {
    const c = w.cam, p = w.player.root.position;
    w.photo = { yaw: c.yaw, pitch: Math.min(0.9, c.pitch), dist: Math.min(9, c.dist || 8), target: c.target.clone(), home: new THREE.Vector3(p.x, p.y + 1.1, p.z) };
    let fi = 0, pose = 0, frame = true;
    game.hud.show(false);
    const label = h('span.photo-filter', {}, FILTERS[0][0]);
    const view = h('div.photo-drag');
    const applyFilter = () => { const f = FILTERS[fi][1]; game.renderer.renderer.domElement.style.filter = f === 'none' ? '' : f; label.textContent = FILTERS[fi][0]; };
    const btn = (txt, fn, extra = '') => h('button.chip.focusable' + extra, { onclick: fn }, txt);
    const shutter = btn('📸 Foto', () => shoot(), '.primary');
    const bar = h('div.photo-bar', {},
      shutter,
      btn('🎨 Filter', () => { fi = (fi + 1) % FILTERS.length; applyFilter(); }), label,
      btn('🕺 Pose', () => { pose = (pose + 1) % POSES.length; const a = POSES[pose][1]; if (a === 'idle') w.player.hold('idle'); else w.player.play(a, 2.4); w.follower?.c?.play?.('happy', 1.5); game.ui.toast(POSES[pose][0], '🕺'); }),
      btn('🖼 Rahmen', () => { frame = !frame; game.ui.toast(frame ? 'Rahmen an' : 'Rahmen aus', '🖼'); }),
      btn('🗂 Album', () => openAlbum(game)),
      btn('✕ Ende', () => done()));
    const el = h('div.screen.photo-mode', {}, view, h('div.photo-help', {}, 'Ziehen/rechter Stick: drehen · Rad/ZL/ZR: zoomen · Bewegen: verschieben'), bar);
    const screen = { el };
    let drag = null;
    view.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; view.setPointerCapture?.(e.pointerId); });
    view.addEventListener('pointermove', (e) => { if (!drag || drag.id !== e.pointerId) return; const ph = w.photo; if (!ph) return; ph.yaw -= (e.clientX - drag.x) * 0.006; ph.pitch += (e.clientY - drag.y) * 0.005; drag.x = e.clientX; drag.y = e.clientY; });
    const up = () => { drag = null; }; view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
    view.addEventListener('wheel', (e) => { e.preventDefault(); if (w.photo) w.photo.dist *= e.deltaY > 0 ? 1.1 : 0.9; }, { passive: false });
    screen.onInput = (input) => {
      const ph = w.photo; if (!ph) return false;
      if (input.held?.('camLeft')) ph.dist *= 1.02; if (input.held?.('camRight')) ph.dist *= 0.98;
      const m = input.move || { x: 0, y: 0 };
      if (Math.abs(m.x) + Math.abs(m.y) > 0.15) { const s = 0.12, sy = Math.sin(ph.yaw), cy = Math.cos(ph.yaw); ph.target.x += (m.x * cy + m.y * sy) * s; ph.target.z += (-m.x * sy + m.y * cy) * s; return true; }
      return false;
    };
    const shoot = () => {
      game.audio.sfx('item');
      const flash = h('div.photo-flash'); el.append(flash); setTimeout(() => flash.remove(), 420);
      bar.style.visibility = 'hidden';
      const src = capture(game, { filter: FILTERS[fi][1], frame });
      bar.style.visibility = '';
      const album = loadAlbum(); album.unshift({ src, t: Date.now() });
      if (!storeAlbum(album.slice(0, ALBUM_MAX))) game.ui.toast('Album voll – Foto nur zum Speichern', '📷');
      game.save.flags.photos = (game.save.flags.photos || 0) + 1;
      showPhoto(game, src);
    };
    const done = () => { game.ui.pop(screen); };
    screen.onBack = done; screen.onMenu = done;
    screen.onClose = () => { w.photo = null; game.renderer.renderer.domElement.style.filter = ''; w.player.hold('idle'); game.hud.show(true); resolve(); };
    game.ui.push(screen);
    requestAnimationFrame(() => screen.nav?.focus(shutter));
  });
}

function showPhoto(game, src) {
  const screen = { el: null };
  const close = () => game.ui.pop(screen);
  screen.el = h('div.screen', {}, h('div.panel.small', {}, h('div.panel-head', {}, h('h2', {}, '📷 Foto'), h('button.closebtn.focusable', { 'aria-label': 'Schließen', onclick: close }, '✕')),
    h('div.panel-body', {}, h('img.photo-shot', { src, alt: 'Foto' }),
      h('div.row', {}, h('button.btn.focusable.primary', { 'data-autofocus': '', onclick: () => saveOrShare(game, src) }, '⇩ Speichern / Teilen'), h('button.btn.focusable', { onclick: close }, 'Weiter fotografieren')))));
  screen.onBack = close;
  game.ui.push(screen);
}

export function openAlbum(game) {
  const screen = { el: null };
  const close = () => game.ui.pop(screen);
  const build = () => {
    const a = loadAlbum();
    return h('div.screen', {}, h('div.panel', {}, h('div.panel-head', {}, h('h2', {}, '🗂 Fotoalbum (' + a.length + ')'), h('button.closebtn.focusable', { 'aria-label': 'Schließen', onclick: close }, '✕')),
      h('div.panel-body', {}, a.length ? h('div.photo-album', {}, a.map((p, i) => h('button.card.focusable', { onclick: () => showPhoto(game, p.src) }, h('img', { src: p.src, alt: 'Foto ' + (i + 1) }))))
        : h('p.muted', {}, 'Noch keine Fotos. Öffne den Fotomodus im Menü (Team › 📷 Fotomodus).'),
        a.length ? h('button.btn.focusable', { onclick: () => { storeAlbum([]); try { localStorage.removeItem(ALBUM_KEY); } catch (e) { } const old = screen.el; screen.el = build(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); } }, '🗑 Album leeren') : null)));
  };
  screen.el = build();
  screen.onBack = close;
  game.ui.push(screen);
}
