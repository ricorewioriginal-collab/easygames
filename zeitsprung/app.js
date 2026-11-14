// ZEITSPRUNG – Die große Zeitreise-Show. Ein Spiel für alle Zeitsprung-Ausgaben:
// Hauptmenü mit Ausgaben-Auswahl, Spieler mit KayKit-Figuren, Gesamtmodus über alle Ausgaben, 3D-Studio, Stimme, Steuerung.
// Die Ausgaben selbst laufen unverändert im transparenten iframe (#show) und bekommen per ?zs=1 das neue Design.
import { ALL, EDITIONS, MARATHON, FIGURES, PLAYER_COLORS, byId } from './editions.js';
import { createVoice } from './voice.js';
import { createInput } from './input.js';

const $ = id => document.getElementById(id);
const body = document.body;
const store = { get: (k, d) => { try { const v = localStorage.getItem('zs-' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } }, set: (k, v) => { try { localStorage.setItem('zs-' + k, JSON.stringify(v)); } catch (_) {} } };
const MOBILE = matchMedia('(max-width: 780px)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const app = {
  view: 'boot', studio: null, edIndex: 0, edition: MARATHON,
  players: store.get('players', null) || [{ name: 'Spieler 1', figure: 'mage', device: '' }],
  settings: Object.assign({ quality: 'auto', voice: true, volume: .9 }, store.get('settings', {})),
  show: { edition: null, started: false, snap: null },
  marathon: null
};
window.ZEITSPRUNG = app;

// ---------- Stimme ----------
const voice = createVoice({ base: './vo/' });
window.ZSVoice = voice;
voice.setEnabled(app.settings.voice); voice.setVolume(app.settings.volume);

// ---------- Studio-Sound (synthetisch, ohne Dateien) ----------
let actx = null, master = null;
function ac() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = .5 * app.settings.volume; master.connect(actx.destination); } catch (_) {} } if (actx?.state === 'suspended') actx.resume(); return actx; }
function tone(f, d, type = 'sine', v = .2, when = 0) { const c = ac(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + when; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g).connect(master); o.start(t); o.stop(t + d + .05); }
function noise(d, v = .25, freq = 1800, q = .7, when = 0) { const c = ac(); if (!c) return; const n = c.createBuffer(1, c.sampleRate * d, c.sampleRate), ch = n.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + when; s.buffer = n; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f).connect(g).connect(master); s.start(t); }
const sfx = {
  move: () => tone(880, .06, 'triangle', .05),
  ok: () => { tone(660, .09, 'triangle', .08); tone(990, .12, 'triangle', .06, .05); },
  back: () => tone(420, .1, 'triangle', .06),
  sting: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .5, 'sawtooth', .05, i * .07)); noise(.6, .05, 6000, .5); },
  applause: () => { for (let i = 0; i < 6; i++) noise(1.6 + Math.random(), .16, 1400 + Math.random() * 1600, .6, i * .12); },
  wrong: () => { tone(220, .35, 'sawtooth', .07); tone(165, .5, 'sawtooth', .07, .18); },
  fanfare: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .45, 'square', .05, i * .14)); sfx.applause(); },
  whoosh: () => noise(.5, .12, 900, .4)
};

// ---------- Ansichten ----------
function setView(v) {
  app.view = v; body.dataset.view = v;
  $('show').hidden = v !== 'show' && !app.pairOpen;
  const rects = MOBILE
    ? { title: null, menu: { x: 0, y: .05, w: 1, h: .42 }, setup: { x: 0, y: .06, w: 1, h: .32 }, show: { x: 0, y: .07, w: 1, h: .3 }, interlude: null }
    : { title: null, menu: { x: .36, y: .02, w: .64, h: .72 }, setup: { x: 0, y: .05, w: .6, h: .95 }, show: { x: .3, y: .1, w: .4, h: .6 }, interlude: null };
  app.studio?.setViewRect(rects[v] ?? null);
  clearFocus(); hints();
  if (v === 'menu' || v === 'setup' || v === 'title' || v === 'interlude') setTimeout(() => autoFocus(), 80);
}

// ---------- Fokus-Navigation (Controller, Tastatur, Fernbedienung) ----------
let focused = null;
const visible = el => { if (!el || el.disabled || el.hidden) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = el.ownerDocument.defaultView.getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > .05; };
function shellFocusables() {
  if (!$('settings').hidden) return [...$('settings').querySelectorAll('button,select,input')].filter(visible);
  const root = { title: $('title'), menu: $('menu'), setup: $('setup'), interlude: $('interlude') }[app.view];
  const list = root ? [...root.querySelectorAll('button,select,input,a.btn')] : [];
  return list.concat([...document.querySelectorAll('.hud-btn')]).filter(visible);
}
function showFocusables() {
  const d = showDoc(); if (!d) return [];
  const pair = d.getElementById('pairPanel');
  const root = pair && !pair.classList.contains('hidden') ? pair : d.getElementById('game');
  return [...root.querySelectorAll('button,a[href]')].filter(visible);
}
function clearFocus() { document.querySelectorAll('.focus').forEach(e => e.classList.remove('focus')); showDoc()?.querySelectorAll('.zs-focus').forEach(e => e.classList.remove('zs-focus')); focused = null; }
function setFocus(el, scroll = true) {
  if (focused === el) return; clearFocus(); if (!el) return;
  focused = el; el.classList.add(el.ownerDocument === document ? 'focus' : 'zs-focus');
  try { el.focus({ preventScroll: true }); } catch (_) {}
  if (scroll) el.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  if (el.closest?.('#carousel')) selectEdition(+el.dataset.index, false);
  const row = el.closest?.('.player-row'); if (row) app.studio?.setShot('setup', +row.dataset.index);
}
function inShow() { return app.view === 'show' || app.pairOpen; }
function autoFocus() {
  const list = inShow() ? showFocusables() : shellFocusables();
  if (focused && list.includes(focused)) return;
  const pref = inShow() ? list.find(e => e.matches('.quiz-options button,.slot')) || list.find(e => e.matches('.next-button,.primary')) : list.find(e => e.matches('.card.active,.btn-main,.press-start,#pairDone'));
  if (input.kind() !== 'touch' && input.kind() !== 'mouse') setFocus(pref || list[0], false);
}
function navigate(dir) {
  const list = inShow() ? showFocusables() : shellFocusables();
  if (!list.length) return;
  if (!focused || !list.includes(focused)) { autoFocus(); if (!focused) setFocus(list[0]); return; }
  const r = focused.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, score = Infinity;
  for (const el of list) {
    if (el === focused) continue;
    const q = el.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, dx = x - cx, dy = y - cy;
    const along = dir === 'left' ? -dx : dir === 'right' ? dx : dir === 'up' ? -dy : dy;
    const across = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    if (along <= 4) continue;
    const s = along + across * 2.2; if (s < score) { score = s; best = el; }
  }
  if (best) { setFocus(best); sfx.move(); }
  else if (focused.tagName === 'SELECT' && (dir === 'left' || dir === 'right')) stepSelect(focused, dir === 'right' ? 1 : -1);
}
function stepSelect(sel, d) { const n = sel.options.length; if (!n) return; sel.selectedIndex = (sel.selectedIndex + d + n) % n; sel.dispatchEvent(new Event('change', { bubbles: true })); sfx.move(); }
function activate(el) {
  if (!el) return;
  if (el.tagName === 'SELECT') { stepSelect(el, 1); return; }
  if (el.tagName === 'INPUT' && el.type === 'text') { el.select?.(); return; }
  el.click(); sfx.ok();
}

// ---------- Eingabe ----------
const input = createInput({
  onCommand: command,
  onKind(k) { body.dataset.input = k; const d = showDoc(); if (d) d.documentElement.dataset.zsInput = k; hints(); if (k !== 'touch' && k !== 'mouse') autoFocus(); else clearFocus(); },
  onDevices(list) { renderDevices(list); if (app.view === 'setup') renderPlayers(); }
});
body.dataset.input = input.kind();

function command(cmd, arg, dev) {
  ac(); // Audio im ersten Tastendruck freischalten
  if (app.view === 'boot') return;
  if (app.view === 'title') { if (['ok', 'buzzer', 'answer', 'menu'].includes(cmd) || cmd === 'nav') enterMenu(); return; }
  // Geräte im Setup: Knopf drücken = beitreten
  if (app.view === 'setup' && dev && dev.key !== 'kbd' && dev.player < 0 && ['ok', 'buzzer', 'answer'].includes(cmd) && dev.type !== 'pad') { joinDevice(dev); return; }
  if (app.view === 'setup' && dev && dev.type === 'pad' && dev.player < 0 && cmd === 'ok' && !focused) { joinDevice(dev); return; }
  if (!$('settings').hidden) { if (cmd === 'back' || cmd === 'menu') closeSettings(); else if (cmd === 'nav') navigate(arg); else if (cmd === 'ok') activate(focused); return; }
  if (inShow()) return showCommand(cmd, arg, dev);
  if (cmd === 'nav') {
    if (app.view === 'menu' && (arg === 'left' || arg === 'right') && (!focused || focused.closest('#carousel'))) { selectEdition(app.edIndex + (arg === 'right' ? 1 : -1)); setFocus($('carousel').children[app.edIndex]); sfx.move(); return; }
    navigate(arg); return;
  }
  if (cmd === 'prev' || cmd === 'next') { if (app.view === 'menu') { selectEdition(app.edIndex + (cmd === 'next' ? 1 : -1)); setFocus($('carousel').children[app.edIndex]); } return; }
  if (cmd === 'ok' || cmd === 'buzzer') { if (focused) activate(focused); else if (app.view === 'menu') openSetup(); return; }
  if (cmd === 'back') { sfx.back(); if (app.view === 'setup') enterMenu(); else if (app.view === 'menu') setView('title'); return; }
  if (cmd === 'menu') { if (app.view === 'setup') enterMenu(); return; }
  if (cmd === 'pair') { if (app.view === 'menu' || app.view === 'setup') openPair(); }
}

// Befehle während der Show: alles wird auf die Knöpfe der Ausgabe abgebildet (Logik bleibt unverändert)
function showCommand(cmd, arg, dev) {
  const d = showDoc(); if (!d) return;
  const pairPanel = d.getElementById('pairPanel'), pairOpen = pairPanel && !pairPanel.classList.contains('hidden');
  if (pairOpen) {
    if (cmd === 'back' || cmd === 'menu') { d.getElementById('pairDone')?.click(); return; }
    if (cmd === 'nav') navigate(arg); else if (cmd === 'ok' || cmd === 'buzzer') activate(focused || d.getElementById('pairDone'));
    return;
  }
  if (app.pairOpen) return;
  const snap = app.show.snap || {};
  // Mehrere Controller: Nur das Gerät des Spielers am Zug darf antworten (wie ein Buzzer-Pult)
  const owned = input.devices().filter(x => x.player >= 0);
  const mine = !dev || dev.key === 'kbd' || dev.player < 0 || owned.length < 2 || dev.player === snap.active;
  const btn = sel => { const el = d.querySelector(sel); if (el && visible(el)) { el.click(); sfx.ok(); return true; } return false; };
  switch (cmd) {
    case 'nav': navigate(arg); break;
    case 'ok': if (!mine && !snap.solved) return toast(`${snap.names?.[snap.active] || 'Der Spieler am Zug'} ist dran!`); if (focused && showFocusables().includes(focused)) activate(focused); else autoFocus(); break;
    case 'answer': {
      if (!mine) return toast(`${snap.names?.[snap.active] || 'Der Spieler am Zug'} ist dran!`);
      if (snap.solved) return;
      const opts = [...d.querySelectorAll('#quizOptions button')].filter(visible);
      if (opts.length) { opts[arg]?.click(); return; }
      const slots = [...d.querySelectorAll('#timeline .slot')].filter(visible);
      if (slots.length) { if (focused?.classList.contains('slot')) focused.click(); else setFocus(slots[Math.min(arg, slots.length - 1)]); }
      break;
    }
    case 'buzzer': // roter Buzzer / Move-Taste: Weiter, sonst Clip starten, sonst bestätigen
      if (!mine && !snap.solved) return;
      if (btn('#next')) return; if (focused && showFocusables().includes(focused) && !focused.matches('.quiz-options button')) { activate(focused); return; } btn('#playMusic'); break;
    case 'play': btn('#playMusic'); break;
    case 'swap': btn('#swapTrailer') || btn('#swapClip') || btn('#switchSource'); break;
    case 'next': btn('#next'); break;
    case 'back': case 'menu': leaveShow(); break;
    case 'pair': d.getElementById('pairToggle')?.click(); break;
  }
}

function hints() {
  const k = input.kind(), v = app.view, el = $('hints');
  const H = (key, txt, round) => `<span><kbd class="${round ? 'r' : ''}">${key}</kbd>${txt}</span>`;
  let html = '';
  const pad = k === 'gamepad' || k === 'playstation';
  const A = k === 'playstation' ? '✕' : 'A', B = k === 'playstation' ? '○' : 'B', X = k === 'playstation' ? '□' : 'X', Y = k === 'playstation' ? '△' : 'Y';
  if (v === 'title') html = pad ? H(A, 'Start', 1) : k === 'keyboard' ? H('Enter', 'Start') : '';
  else if (pad) html = v === 'show' ? H('✚', 'Auswahl') + H(A, 'Bestätigen', 1) + H(X, 'Clip/Song', 1) + H(Y, 'Tauschen', 1) + H('☰', 'Menü') : H('✚', 'Auswahl') + H(A, 'OK', 1) + H(B, 'Zurück', 1) + (v === 'menu' ? H('LB/RB', 'Ausgabe') : '');
  else if (k === 'keyboard' || k === 'mouse') html = v === 'show' ? H('A–D', 'Antwort') + H('1–9', 'Zeitstrahl') + H('←→', 'Auswahl') + H('Enter', 'OK') + H('Esc', 'Menü') : H('←→', 'Auswahl') + H('Enter', 'OK') + H('Esc', 'Zurück');
  else if (k === 'buzz') html = H('🔵🟠🟢🟡', 'Antwort A–D') + H('🔴', 'Weiter / Clip');
  else if (k === 'move') html = H('□△○✕', 'Antwort A–D') + H('MOVE', 'Weiter') + H('T', 'Clip/Song');
  el.innerHTML = v === 'boot' ? '' : html;
}
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

// ---------- Hauptmenü ----------
function buildCarousel() {
  const nav = $('carousel'); nav.replaceChildren();
  ALL.forEach((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.dataset.index = i;
    b.style.backgroundImage = `url(img/${e.id}.webp), linear-gradient(160deg, ${e.colors[2]}, ${e.colors[0]} 60%, ${e.colors[1]})`;
    b.style.setProperty('--ca', e.colors[0]);
    b.innerHTML = `<span class="card-icon">${e.icon}</span>${e.id === 'gesamt' ? '<span class="card-badge">ALLE</span>' : ''}<span class="card-name"></span><span class="card-sub"></span>`;
    b.querySelector('.card-name').textContent = e.title; b.querySelector('.card-sub').textContent = e.id === 'gesamt' ? 'ALLE AUSGABEN' : 'AUSGABE';
    b.setAttribute('aria-label', e.name);
    b.onclick = () => { if (app.edIndex === i) openSetup(); else selectEdition(i); };
    nav.append(b);
  });
}
function selectEdition(i, announce = true) {
  i = (i + ALL.length) % ALL.length; const changed = i !== app.edIndex || !app.menuReady;
  app.edIndex = i; app.edition = ALL[i]; app.menuReady = true; const e = app.edition;
  [...$('carousel').children].forEach((c, k) => c.classList.toggle('active', k === i));
  $('menuKicker').textContent = e.id === 'gesamt' ? 'GESAMTMODUS · ALLE AUSGABEN' : `AUSGABE ${i} VON ${EDITIONS.length}`;
  $('menuTitle').textContent = e.id === 'gesamt' ? 'ZEITSPRUNG-NACHT' : e.title;
  $('menuTag').textContent = e.tag; $('menuDesc').textContent = e.desc;
  $('menuStats').innerHTML = e.stats.map(s => `<li>${s}</li>`).join('');
  $('menuExtra').hidden = !e.extra; if (e.extra) { $('menuExtra').textContent = e.extra.label; $('menuExtra').href = e.extra.href; }
  $('menuOnline').hidden = e.id === 'gesamt';
  setAccent(e);
  if (changed) { app.studio?.setEdition(e); app.studio?.setBanner({ top: e.id === 'gesamt' ? 'DIE GROSSE' : 'ZEITSPRUNG', mid: e.id === 'gesamt' ? 'ZEITSPRUNG-NACHT' : e.title, sub: e.tag }); if (announce) sfx.whoosh(); }
}
function setAccent(e) {
  const r = document.documentElement.style; r.setProperty('--a', e.colors[1]); r.setProperty('--b', e.colors[0]); r.setProperty('--c', e.colors[2]);
  const d = showDoc(); if (d) { const s = d.documentElement.style; s.setProperty('--zs-a', e.colors[0]); s.setProperty('--zs-b', e.colors[1]); s.setProperty('--zs-c', e.colors[2]); }
  $('hudEdition').textContent = e.id === 'gesamt' ? 'GESAMTMODUS' : `ZEITSPRUNG ${e.title}`;
}
function enterMenu() {
  if (app.view === 'boot') return;
  if (app.view === 'title') { sfx.sting(); voice.say('Willkommen bei Zeitsprung, der großen Zeitreise-Show! Wählt eure Ausgabe oder spielt alle im Gesamtmodus.', { interrupt: true }); }
  app.studio?.setPlayers([]); app.studio?.preview(null); app.studio?.setShot('menu');
  selectEdition(app.edIndex, false); setView('menu');
  setTimeout(() => setFocus($('carousel').children[app.edIndex], false), 90);
}

// ---------- Spieler & Show-Vorbereitung ----------
function figureOf(id) { return FIGURES.find(f => f.id === id) || FIGURES[0]; }
function renderPlayers() {
  const box = $('playerRows'); box.replaceChildren();
  const devs = input.devices();
  app.players.forEach((p, i) => {
    const row = document.createElement('div'); row.className = 'player-row'; row.dataset.index = i;
    const dev = devs.find(d => d.player === i);
    row.innerHTML = `<span class="dot" style="background:${PLAYER_COLORS[i]}">${i + 1}</span><input type="text" maxlength="22" aria-label="Name Spieler ${i + 1}"><span class="fig-pick"><button class="fig-btn" type="button" data-d="-1" aria-label="Figur zurück">◀</button><span class="fig-name"></span><button class="fig-btn" type="button" data-d="1" aria-label="Figur weiter">▶</button></span><span class="dev" title="${dev ? dev.label : 'kein Controller'}">${dev ? { buzz: '🔴', move: '🟣', pad: '🎮' }[dev.type] || '🎮' : ''}</span>`;
    const inp = row.querySelector('input'); inp.value = p.name; inp.oninput = () => { p.name = inp.value; savePlayers(); syncSetupStudio(); };
    row.querySelector('.fig-name').textContent = figureOf(p.figure).name;
    row.querySelectorAll('.fig-btn').forEach(b => b.onclick = () => { const k = FIGURES.findIndex(f => f.id === p.figure); p.figure = FIGURES[(k + +b.dataset.d + FIGURES.length) % FIGURES.length].id; row.querySelector('.fig-name').textContent = figureOf(p.figure).name; savePlayers(); syncSetupStudio(); app.studio?.setShot('setup', i); });
    if (app.players.length > 1) { const rm = document.createElement('button'); rm.className = 'rm'; rm.type = 'button'; rm.textContent = '✕'; rm.setAttribute('aria-label', `Spieler ${i + 1} entfernen`); rm.onclick = () => { app.players.splice(i, 1); input.devices().forEach(d => { if (d.player === i) input.assign(d.key, -1); else if (d.player > i) input.assign(d.key, d.player - 1); }); savePlayers(); renderPlayers(); syncSetupStudio(); }; row.append(rm); }
    box.append(row);
  });
  $('addPlayer').hidden = app.players.length >= 4;
  syncSetupStudio();
}
function savePlayers() { store.set('players', app.players.map(p => ({ name: p.name, figure: p.figure }))); }
function addPlayer() {
  if (app.players.length >= 4) return null;
  const used = new Set(app.players.map(p => p.figure));
  const fig = (FIGURES.find(f => f.edition === app.edition.id && !used.has(f.id)) || FIGURES.find(f => !used.has(f.id)) || FIGURES[0]).id;
  app.players.push({ name: `Spieler ${app.players.length + 1}`, figure: fig }); savePlayers(); renderPlayers();
  return app.players.length - 1;
}
function joinDevice(dev) {
  const taken = new Set(input.devices().filter(d => d.player >= 0).map(d => d.player));
  let slot = app.players.findIndex((_, i) => !taken.has(i));
  if (slot < 0) slot = addPlayer() ?? -1;
  if (slot < 0) return toast('Alle vier Plätze sind schon belegt.');
  input.assign(dev.key, slot); if (dev.type === 'move') input.moveColor(dev.key, PLAYER_COLORS[slot]);
  sfx.ok(); toast(`${dev.label} spielt für ${app.players[slot].name}`); renderPlayers();
}
function syncSetupStudio() {
  if (app.view !== 'setup') return;
  app.studio?.setPlayers(app.players.map((p, i) => ({ name: p.name || `Spieler ${i + 1}`, figure: p.figure, color: PLAYER_COLORS[i], score: '' })));
}
async function openSetup() {
  const e = app.edition; sfx.ok();
  if (app.players.length === 1 && app.players[0].name === 'Spieler 1') app.players[0].figure = e.figure;
  $('setupKicker').textContent = e.id === 'gesamt' ? 'GESAMTMODUS · ALLE AUSGABEN' : `ZEITSPRUNG ${e.title}`;
  $('setupTitle').textContent = 'Wer spielt mit?';
  const marathon = e.id === 'gesamt';
  $('fieldActs').hidden = $('fieldEditions').hidden = !marathon; $('fieldCategory').hidden = marathon; $('setupOnline').hidden = marathon;
  $('setupResume').hidden = true;
  renderPlayers(); setView('setup'); app.studio?.setShot('setup'); syncSetupStudio();
  // Optionen kommen aus der Ausgabe selbst (Themenwelten, Spielarten)
  const ed = marathon ? EDITIONS[0] : e;
  try {
    const d = await loadShow(ed);
    fillSelect($('optCategory'), d.getElementById('category'));
    fillSelect($('optMode'), d.getElementById('musicMode'), store.get('mode', null));
    $('setupResume').hidden = marathon || !hasSave(ed);
  } catch (_) { toast('Die Ausgabe konnte nicht geladen werden. Bitte Internetverbindung prüfen.'); }
}
function fillSelect(target, source, pick) {
  target.replaceChildren(...[...(source?.options || [])].map(o => new Option(o.textContent, o.value)));
  if (pick && [...target.options].some(o => o.value === pick)) target.value = pick;
}
function hasSave(ed) { try { return !!localStorage.getItem(ed.save); } catch (_) { return false; } }

// ---------- Die Ausgabe im iframe ----------
const frame = $('show');
function showDoc() { try { return frame.contentDocument && frame.contentDocument.getElementById('game') ? frame.contentDocument : null; } catch (_) { return null; } }
let observer = null;
function loadShow(ed, fresh = false) {
  if (!fresh && app.show.edition === ed.id && !app.show.started && showDoc()?.getElementById('category')?.options.length > 0) return Promise.resolve(showDoc());
  app.show = { edition: ed.id, started: false, snap: null };
  observer?.disconnect(); observer = null;
  return new Promise((resolve, reject) => {
    const url = ed.path + '?zs=1';
    let done = false;
    const check = setInterval(() => {
      const d = showDoc();
      if (d && d.readyState === 'complete' && d.getElementById('category')?.options.length > 0) { clearInterval(check); done = true; attachShow(d, ed); resolve(d); }
    }, 120);
    setTimeout(() => { if (!done) { clearInterval(check); reject(new Error('timeout')); } }, 20000);
    frame.src = url;
  });
}
function attachShow(d, ed) {
  input.attachFrame(frame.contentWindow);
  d.documentElement.dataset.zsInput = input.kind();
  setAccent(app.marathon ? ed : app.edition);
  d.getElementById('pairClose')?.addEventListener('click', () => setTimeout(closePairView, 30));
  d.getElementById('pairDone')?.addEventListener('click', () => setTimeout(closePairView, 30));
  observer = new MutationObserver(() => { if (!observer._q) { observer._q = true; requestAnimationFrame(() => { observer._q = false; readShow(); }); } });
  observer.observe(d.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'disabled'], characterData: true });
}
// Zustand der Ausgabe lesen (nur lesen, nichts an der Logik ändern) und das Studio darauf reagieren lassen
function readShow() {
  const d = showDoc(); if (!d) return;
  const game = d.getElementById('game'), inGame = !game.classList.contains('hidden');
  const chips = [...d.querySelectorAll('#scoreboard .score-chip')];
  const names = chips.map(c => (c.firstChild?.textContent || '').trim());
  const scores = chips.map(c => parseInt(c.querySelector('b')?.textContent, 10) || 0);
  const active = chips.findIndex(c => c.classList.contains('active'));
  const result = d.getElementById('result'), solved = !result.classList.contains('hidden');
  const good = result.classList.contains('good');
  const next = d.getElementById('next');
  const finished = solved && !next.classList.contains('hidden') && /↻/.test(next.textContent);
  const snap = { inGame, names, scores, active, solved, good, finished, mode: d.getElementById('modeBadge')?.textContent || '', round: d.getElementById('roundLabel')?.textContent || '', cat: d.getElementById('catLabel')?.textContent || '' };
  const prev = app.show.snap || {}; app.show.snap = snap;
  if (!inGame || app.view !== 'show') return;
  const studio = app.studio;
  if (names.join('|') !== (prev.names || []).join('|') || scores.join() !== (prev.scores || []).join()) {
    studio?.setPlayers(names.map((n, i) => ({ name: n, figure: app.players[i]?.figure || FIGURES[i % FIGURES.length].id, color: PLAYER_COLORS[i], score: scores[i] })));
  }
  if (active !== prev.active || snap.round !== prev.round) {
    studio?.setActive(active); input.lights(active);
    if (snap.round !== prev.round) { studio?.setShot('show', active); setTimeout(() => app.show.snap === snap && !snap.solved && studio?.setShot('show'), 2600); sfx.sting(); }
    studio?.setBanner({ top: (snap.names[active] || '').toUpperCase() + ' IST AM ZUG', mid: snap.mode || 'ZEITSPRUNG', sub: snap.cat || '' });
    setTimeout(autoFocus, 120);
  }
  if (solved && !prev.solved) {
    studio?.react(active, good);
    if (good) sfx.applause(); else sfx.wrong();
    studio?.setBanner({ top: good ? 'RICHTIG!' : 'AUFGELÖST', mid: good ? '+1 PUNKT' : 'KNAPP DANEBEN', sub: (names[active] || '') + ' · ' + (scores[active] ?? 0) + ' PUNKTE' });
    if (app.marathon) marathonRound(snap, prev);
    setTimeout(() => { const n = d.getElementById('next'); if (n && visible(n) && input.kind() !== 'touch' && input.kind() !== 'mouse') setFocus(n, false); }, 300);
  }
  if (finished && !prev.finished && !app.marathon) { studio?.winner(active); sfx.fanfare(); studio?.setBanner({ top: 'SIEG!', mid: (names[active] || '').toUpperCase(), sub: 'GEWINNT ' + app.edition.name }); }
  if (!solved && prev.solved) studio?.setShot('show');
}
function showFrame() { setView('show'); frame.hidden = false; setTimeout(autoFocus, 400); }
async function startShow({ resume = false } = {}) {
  const e = app.edition;
  if (e.id === 'gesamt') return startMarathon();
  store.set('mode', $('optMode').value);
  sfx.sting(); app.studio?.setShot('show');
  const d = await loadShow(e).catch(() => null);
  if (!d) return toast('Die Ausgabe konnte nicht geladen werden.');
  app.show.started = true;
  if (resume) d.getElementById('resume')?.click();
  else configureEdition(d, { category: $('optCategory').value, mode: $('optMode').value });
  syncPlayersFromShow(d);
  showFrame();
}
function configureEdition(d, { category, mode }) {
  const add = d.getElementById('addPlayer'), inputs = () => [...d.querySelectorAll('#players input')];
  let guard = 0; while (inputs().length < app.players.length && !add.hidden && guard++ < 4) add.click();
  inputs().forEach((inp, i) => { if (app.players[i]) { inp.value = (app.players[i].name || '').trim() || `Spieler ${i + 1}`; inp.dispatchEvent(new Event('input', { bubbles: true })); } });
  const cat = d.getElementById('category'); if (category && [...cat.options].some(o => o.value === category)) cat.value = category;
  const mm = d.getElementById('musicMode'); if (mode && [...mm.options].some(o => o.value === mode)) mm.value = mode;
  d.getElementById('start').click();
}
// Über Handys beigetretene Spieler auch im Studio führen
function syncPlayersFromShow(d) {
  const names = [...d.querySelectorAll('#scoreboard .score-chip')].map(c => (c.firstChild?.textContent || '').trim()).filter(Boolean);
  names.forEach((n, i) => { if (!app.players[i]) app.players[i] = { name: n, figure: FIGURES[i % FIGURES.length].id }; else app.players[i].name = n; });
}
function leaveShow() {
  const d = showDoc();
  if (app.marathon) { app.marathon = null; $('hudAct').hidden = true; }
  d?.getElementById('menuButton')?.click(); // Ausgabe speichert ihren Spielstand selbst
  voice.stop(); frame.hidden = true; app.show.started = false; app.show.edition = null;
  input.lights(-1); enterMenu();
}

// ---------- Online & Handys (Kopplung der Ausgabe) ----------
async function openPair() {
  const e = app.edition; if (e.id === 'gesamt') return toast('Handys koppelt ihr in einer einzelnen Ausgabe.');
  const d = app.view === 'show' ? showDoc() : await loadShow(e).catch(() => null);
  if (!d) return toast('Die Kopplung ist gerade nicht erreichbar.');
  app.pairOpen = true; frame.hidden = false; d.getElementById('pairToggle')?.click();
  setTimeout(autoFocus, 300);
}
function closePairView() {
  if (!app.pairOpen) return; app.pairOpen = false;
  const d = showDoc();
  if (app.view !== 'show') {
    frame.hidden = true;
    if (d) { const inputs = [...d.querySelectorAll('#players input')]; inputs.forEach((inp, i) => { const n = inp.value.trim(); if (!n) return; if (!app.players[i]) app.players[i] = { name: n, figure: FIGURES[i % FIGURES.length].id }; else app.players[i].name = n; }); renderPlayers(); }
  }
  clearFocus(); setTimeout(autoFocus, 100);
}

// ---------- Gesamtmodus: Akt für Akt durch alle Ausgaben ----------
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startMarathon() {
  const count = +$('optEditions').value || 6;
  app.marathon = { order: shuffle(EDITIONS).slice(0, count), act: -1, perPlayer: +$('optActs').value || 2, mode: $('optMode').value, rounds: 0, totals: app.players.map(() => 0), actStart: [] };
  store.set('mode', $('optMode').value);
  nextAct();
}
function nextAct() {
  const m = app.marathon; if (!m) return;
  m.act++; m.rounds = 0;
  if (m.act >= m.order.length) return marathonFinale();
  const ed = m.order[m.act];
  app.studio?.setEdition(ed); setAccent(ed);
  $('interKicker').textContent = `AKT ${m.act + 1} VON ${m.order.length}`;
  $('interTitle').textContent = ed.title;
  $('interText').textContent = `${ed.tag}. ${m.perPlayer} ${m.perPlayer === 1 ? 'Runde' : 'Runden'} pro Spieler, jeder Punkt zählt für die Gesamtwertung.`;
  renderBoard();
  $('interGo').textContent = 'Akt starten ▶'; $('interGo').onclick = () => playAct(ed);
  $('hudAct').hidden = false; $('hudAct').textContent = `AKT ${m.act + 1}/${m.order.length}`;
  setView('interlude'); app.studio?.setShot('menu'); app.studio?.setBanner({ top: `AKT ${m.act + 1}`, mid: ed.title, sub: 'DIE GROSSE ZEITSPRUNG-NACHT' });
  sfx.sting(); voice.say(`Akt ${m.act + 1}: Zeitsprung ${ed.title.toLowerCase()}! ${ed.tag}.`, { interrupt: true });
}
function renderBoard(final = false) {
  const m = app.marathon; const order = app.players.map((p, i) => ({ p, i, s: m.totals[i] || 0 })).sort((a, b) => b.s - a.s);
  $('interBoard').innerHTML = order.map((o, k) => `<li><i style="background:${PLAYER_COLORS[o.i]}"></i>${final && k === 0 ? '🏆 ' : ''}${escapeHtml(o.p.name || `Spieler ${o.i + 1}`)}<b>${o.s}</b></li>`).join('');
}
const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function playAct(ed) {
  const m = app.marathon; sfx.ok();
  const d = await loadShow(ed, true).catch(() => null);
  if (!d) { toast(`${ed.name} ist gerade nicht erreichbar – weiter zum nächsten Akt.`); return nextAct(); }
  app.show.started = true; m.actStart = [...m.totals];
  configureEdition(d, { category: 'all', mode: m.mode });
  showFrame(); app.studio?.setShot('show');
}
function marathonRound(snap, prev) {
  const m = app.marathon; m.rounds++;
  snap.scores.forEach((s, i) => { m.totals[i] = (m.actStart[i] || 0) + s; });
  const limit = m.perPlayer * Math.max(1, snap.names.length);
  if (m.rounds >= limit || snap.finished) {
    // Rundenende abwarten, dann zum Zwischenstand
    const d = showDoc(); const n = d?.getElementById('next');
    if (n) { n.textContent = m.act + 1 < m.order.length ? 'Zum Zwischenstand ▶' : 'Zum großen Finale ▶'; n.classList.remove('hidden'); n.onclick = () => { frame.hidden = true; nextAct(); }; }
  }
}
function marathonFinale() {
  const m = app.marathon;
  const best = m.totals.reduce((b, s, i) => s > m.totals[b] ? i : b, 0);
  $('interKicker').textContent = 'DAS GROSSE FINALE';
  $('interTitle').textContent = (app.players[best]?.name || 'Spieler 1').toUpperCase();
  $('interText').textContent = `gewinnt die große Zeitsprung-Nacht mit ${m.totals[best]} Punkten aus ${m.order.length} Ausgaben!`;
  renderBoard(true);
  $('interGo').textContent = '↻ Neue Zeitsprung-Nacht'; $('interGo').onclick = () => { app.marathon = null; $('hudAct').hidden = true; openSetup(); };
  setView('interlude');
  app.studio?.setEdition(MARATHON); app.studio?.setPlayers(app.players.map((p, i) => ({ name: p.name, figure: p.figure, color: PLAYER_COLORS[i], score: m.totals[i] })));
  setTimeout(() => app.studio?.winner(best), 200); sfx.fanfare();
  app.studio?.setBanner({ top: 'SIEG IN DER ZEITSPRUNG-NACHT', mid: (app.players[best]?.name || '').toUpperCase(), sub: `${m.totals[best]} PUNKTE` });
  voice.say(`Was für eine Nacht! ${app.players[best]?.name || 'Spieler 1'} gewinnt die große Zeitsprung-Nacht mit ${m.totals[best]} Punkten!`, { interrupt: true });
}

// ---------- Einstellungen ----------
function openSettings() { $('settings').hidden = false; $('optQuality').value = app.settings.quality; $('optVoice').value = app.settings.voice ? 'on' : 'off'; $('optVolume').value = Math.round(app.settings.volume * 100); renderDevices(input.devices()); const vi = voice.info(); $('voiceInfo').textContent = `Stimme: ${vi.clips ? `${vi.clips} vorproduzierte Edge-Neural-Sätze` : 'Edge-Neural-Sätze werden geladen'}${vi.system ? ` · ergänzt durch „${vi.system}“` : ''}.`; clearFocus(); setTimeout(autoFocus, 50); }
function closeSettings() { $('settings').hidden = true; store.set('settings', app.settings); clearFocus(); setTimeout(autoFocus, 50); }
function renderDevices(list) {
  const ul = $('deviceList'); if (!ul) return;
  ul.innerHTML = list.length ? list.map(d => `<li><span>${{ buzz: '🔴', move: '🟣', pad: '🎮' }[d.type] || '🎮'} ${escapeHtml(d.label)}</span><span>${d.player >= 0 ? escapeHtml(app.players[d.player]?.name || `Spieler ${d.player + 1}`) : 'frei'}</span></li>`).join('') : '<li class="empty">Noch kein Controller erkannt – einfach einen Knopf drücken.</li>';
}

// ---------- Verdrahtung ----------
function wire() {
  $('pressStart').onclick = enterMenu;
  $('menuPlay').onclick = openSetup;
  $('menuOnline').onclick = openPair;
  $('menuGuide').onclick = () => { const id = app.edition.id === 'gesamt' ? 'zeitsprung' : 'zeitsprung-' + app.edition.id; location.href = `../anleitung.html?game=${id}`; };
  $('setupBack').onclick = enterMenu;
  $('addPlayer').onclick = () => { const i = addPlayer(); if (i !== null) setTimeout(() => setFocus($('playerRows').children[i]?.querySelector('input')), 50); };
  $('setupStart').onclick = () => startShow();
  $('setupResume').onclick = () => startShow({ resume: true });
  $('setupOnline').onclick = openPair;
  $('interMenu').onclick = () => { app.marathon = null; $('hudAct').hidden = true; enterMenu(); };
  $('btnHome').onclick = () => { if (app.view === 'show') leaveShow(); else enterMenu(); };
  $('btnPair').onclick = () => { if (app.view === 'show') showDoc()?.getElementById('pairToggle')?.click(); else openPair(); };
  $('btnVoice').onclick = () => { app.settings.voice = !app.settings.voice; voice.setEnabled(app.settings.voice); $('btnVoice').setAttribute('aria-pressed', String(app.settings.voice)); store.set('settings', app.settings); toast(app.settings.voice ? 'Vito moderiert wieder.' : 'Moderation aus.'); };
  $('btnVoice').setAttribute('aria-pressed', String(app.settings.voice));
  $('btnFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {}); };
  $('btnSettings').onclick = openSettings; $('settingsClose').onclick = closeSettings;
  $('settings').addEventListener('click', e => { if (e.target === $('settings')) closeSettings(); });
  $('optQuality').onchange = e => { app.settings.quality = e.target.value; app.studio?.setQuality(app.settings.quality); store.set('settings', app.settings); };
  $('optVoice').onchange = e => { app.settings.voice = e.target.value === 'on'; voice.setEnabled(app.settings.voice); $('btnVoice').setAttribute('aria-pressed', String(app.settings.voice)); };
  $('optVolume').oninput = e => { app.settings.volume = e.target.value / 100; voice.setVolume(app.settings.volume); if (master) master.gain.value = .5 * app.settings.volume; };
  const hid = async which => { const r = await input.connectHid(which); toast(r.ok ? (which === 'move' ? 'PS Move verbunden – im Spieler-Menü die Move-Taste drücken.' : 'Buzzer verbunden – im Spieler-Menü einen Buzzer drücken.') : r.reason); renderDevices(input.devices()); };
  $('connectBuzz').onclick = () => hid('buzz'); $('connectMove').onclick = () => hid('move');
  if (!input.hidSupported()) $('hidNote').textContent = 'Buzz!-Buzzer und PS Move brauchen Chrome oder Edge am PC (WebHID). Gamepads und Buzzer, die sich als Controller melden, funktionieren überall.';
  addEventListener('pagehide', () => { const d = showDoc(); if (app.view === 'show' && d) d.defaultView.dispatchEvent(new Event('pagehide')); });
  $('pressText').textContent = matchMedia('(pointer: coarse)').matches ? 'Tippe zum Starten' : 'Drücke eine Taste';
  document.addEventListener('visibilitychange', () => app.studio?.pause(document.hidden));
}

// ---------- Start ----------
async function boot() {
  wire(); buildCarousel(); selectEdition(0, false);
  const bar = p => { $('bootBar').style.width = p + '%'; };
  bar(10);
  try { await Promise.all([document.fonts.load('900 40px ZSDisplay'), document.fonts.load('800 20px ZSText')]); } catch (_) {}
  bar(25); $('bootText').textContent = 'Kameras, Licht und Publikum …';
  try {
    const { createStudio } = await import('./studio.js');
    app.studio = await createStudio($('studio'), { quality: app.settings.quality, onProgress: p => bar(25 + p * .7) });
    app.studio.setEdition(MARATHON); app.studio.setShot('title');
  } catch (err) { console.warn('3D-Studio nicht verfügbar', err); $('studio').style.background = 'radial-gradient(circle at 50% 30%, #1d2160, #03040a 70%)'; }
  bar(100); $('bootText').textContent = 'Bühne frei!';
  await sleep(350);
  setView('title');
  if (new URLSearchParams(location.search).has('menu')) enterMenu();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
// Erster Druck irgendwo startet vom Titelbildschirm (Tastatur, Touch, Klick)
addEventListener('keydown', e => { if (app.view === 'title' && !e.repeat) enterMenu(); });
$('title').addEventListener('pointerup', () => { if (app.view === 'title') enterMenu(); });
boot();
