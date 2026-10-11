// Oberfläche, Eingabe (Tastatur/Maus/Touch), Menüs, Speichern.
import './style.css';
import { Game } from './game.js';
import { B, NAMES, LOGO0, H, isLogo, GEN_LATEST } from './world.js';
import { BLOCKS, CATS, INV_BLOCKS } from './blocks.js';
import { SLOTS, readMeta, readWorld, writeWorld, deleteWorld, readBackup, hasBackup, restoreBackup, exportText, importText, freeSlot } from './storage.js';
import { RECIPES, checkRecipe, craft, craftable, recipeMatches, MAX_STACK, STATION_NAMES } from './crafting.js';
import { ITEMS, ITEM_LIST, isItem, nameOf } from './items.js';
import { MAX_HP, MAX_FOOD, MAX_AIR } from './survival.js';
import { loadSettings, saveSettings, DEFAULTS, autoBase } from './settings.js';
import { unlockAudio, sfx } from './audio.js';
import { QUESTS, questProgress } from './quests.js';

const $ = id => document.getElementById(id);
const canvas = $('c');
const coarse = window.matchMedia('(pointer: coarse)').matches;
let settings = loadSettings();
const game = new Game(canvas, coarse, settings.quality);
window.__bv = game; // Testzugriff

let state = 'menu';       // menu | loading | playing | paused | inventory | settings
let setReturn = 'menu';   // wohin „Einstellungen schließen“ zurückführt
let slot = -1;
let touchMode = coarse;
const keys = new Set();

// ---------- Icons / Atlas ----------
document.documentElement.style.setProperty('--atlas', `url(${game.atlasCanvas.toDataURL()})`);
const itemRows = game.itemCanvas.height / 32;
document.documentElement.style.setProperty('--items', `url(${game.itemCanvas.toDataURL()})`);
document.documentElement.style.setProperty('--itemRows', itemRows * 100 + '%');
const icon = t => {
  if (isItem(t)) { const k = ITEMS[t] ? ITEMS[t].icon : 0; return `<i class="ic it" style="background-position:${(k % 8) * 100 / 7}% ${itemRows > 1 ? Math.floor(k / 8) * 100 / (itemRows - 1) : 0}%"></i>`; }
  if (isLogo(t)) { const k = t - LOGO0; return `<i class="ic lg" style="background-position:${(k % 4) * 100 / 3}% ${Math.floor(k / 4) * 100 / 3}%"></i>`; }
  if (t === B.RAINBOW) return '<i class="ic rb"></i>';
  const k = BLOCKS[t] ? BLOCKS[t].icon : 0;
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
    d.title = t ? nameOf(t) : '';
    d.innerHTML = `<span class="k">${i + 1}</span>${t ? icon(t) : ''}<span class="n">${t ? n : ''}</span>`;
  }
}

// ---------- Inventar: Kategorien, Suche, Rezepte ----------
let invCat = 'all', invQuery = '', invOwned = false, invStations = new Set(), invAt = null;
const TABS = [{ id: 'all', name: 'Alle' }, ...CATS, { id: 'items', name: 'Werkzeuge & Essen' }];
const itemInfo = it => it.tool ? ` · ${it.tool.speed}× schneller · hält ${it.tool.dur} Blöcke` : it.food ? ` · +${it.food} Hunger` : '';
function renderInvTabs() {
  $('invTabs').innerHTML = TABS.map(c => `<button role="tab" data-cat="${c.id}" class="${c.id === invCat ? 'on' : ''}" aria-selected="${c.id === invCat}">${c.name}</button>`).join('');
}
function renderInventory() {
  const creative = game.mode === 'creative', q = invQuery.trim().toLowerCase();
  $('invHint').textContent = creative ? 'Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.'
    : 'Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.';
  $('invOwnedL').hidden = creative;
  $('invSt').hidden = creative || !invAt;
  if (invAt) $('invSt').textContent = invAt === 'ofen' ? '🔥 Am Schmelzofen: Barren schmelzen und Essen braten' : '🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen';
  let h = '';
  for (const t of [...INV_BLOCKS, ...ITEM_LIST]) {
    const b = BLOCKS[t] && !isItem(t) ? BLOCKS[t] : ITEMS[t], n = creative ? '∞' : (game.inv[t] || 0);
    if (invCat !== 'all' && b.cat !== invCat) continue;
    if (q && !b.name.toLowerCase().includes(q)) continue;
    if (invOwned && !creative && !n) continue;
    const tip = isItem(t) ? itemInfo(b) : b.tool ? ' · am besten mit ' + b.tool[0].toUpperCase() + b.tool.slice(1) : '';
    h += `<button class="cell ${n ? 'has' : 'dim'}" data-t="${t}" title="${b.name}${tip}">${icon(t)}<span>${b.name}</span><b>${n}</b></button>`;
  }
  $('invGrid').innerHTML = h || '<div class="empty-note">Nichts gefunden.</div>';
  $('recH').hidden = creative;
  if (creative) { $('recipes').innerHTML = ''; return; }
  const list = RECIPES.map((r, i) => [r, i]).filter(([r]) => (invCat === 'all' || r.cat === invCat) && recipeMatches(r, q));
  $('recipes').innerHTML = list.length ? list.map(([r, i]) => {
    const c = checkRecipe(game.inv, r, MAX_STACK, invStations), k = craftable(game.inv, r, MAX_STACK, invStations);
    const need = r.need.map(([t, n]) => { const have = game.inv[t] || 0; return have >= n ? `${n}× ${nameOf(t)}` : `<i>${n}× ${nameOf(t)} (${have})</i>`; }).join(' + ');
    const why = c.full ? ' · Vorrat voll' : c.noStation ? ` · <i>${STATION_NAMES[r.st]} nicht in der Nähe</i>` : '';
    const badge = r.st ? `<span class="badge">${r.st === 'ofen' ? '🔥' : '🪚'} ${STATION_NAMES[r.st]}</span>` : '';
    return `<button data-r="${i}" ${c.ok ? '' : 'disabled'}>${icon(r.give[0])}<span><b>${r.give[1]}× ${nameOf(r.give[0])}</b>${badge}<small>aus ${need}${why}</small></span><span class="cnt">${k ? k + '×' : ''}</span></button>`;
  }).join('') : '<div class="empty-note">Kein passendes Rezept.</div>';
}
$('invTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  invCat = b.dataset.cat; renderInvTabs(); renderInventory();
});
$('invSearch').addEventListener('input', e => { invQuery = e.target.value; renderInventory(); });
$('invOwned').addEventListener('change', e => { invOwned = e.target.checked; renderInventory(); });
$('invGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  const t = Number(b.dataset.t), i = game.hotbar.indexOf(t);
  if (i >= 0) game.hotbar[i] = game.hotbar[game.sel];
  game.hotbar[game.sel] = t;
  game.unsaved = true;
  game.onChange();
});
$('recipes').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const r = RECIPES[Number(b.dataset.r)];
  let made = 0, res = null;
  for (let k = e.shiftKey ? 5 : 1; k > 0; k--) { res = craft(game.inv, r, MAX_STACK, invStations); if (!res.ok) break; made++; }
  if (!made) { toast(res.msg); return; }
  game.unsaved = true; game.onChange();
  game.questEvent('craft', r.give[0], r.give[1] * made);
  toast(`+${r.give[1] * made} ${nameOf(r.give[0])}`);
});
game.onChange = () => { renderHotbar(); if (state === 'inventory') renderInventory(); };

// ---------- Überleben: Herzen, Hunger, Luft, Abbau-Fortschritt, Umkippen ----------
const vitCtx = $('vit').getContext('2d');
// 7×6-Pixelmuster: Herz und Keule
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const LEG = ['....##.', '...####', '..#####', '.####..', '##.....', '#......'];
const BUBBLE = ['..###..', '.#...#.', '#.....#', '#.....#', '.#...#.', '..###..'];
function pix(pat, x, y, full, half, empty) {
  for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) if (pat[j][i] === '#') {
    vitCtx.fillStyle = i < 3.5 ? (full || half ? (full ? full : half) : empty) : (full ? full : empty);
    vitCtx.fillRect(x + i * 2, y + j * 2, 2, 2);
  }
}
function renderVitals() {
  const v = game.vitals, el = $('vit');
  el.hidden = !v || state === 'menu';
  if (!v) return;
  vitCtx.clearRect(0, 0, 200, 34);
  const hp = Math.ceil(v.hp), fd = Math.ceil(v.food);
  for (let i = 0; i < MAX_HP / 2; i++) { const k = hp - i * 2; pix(HEART, i * 10, 18, k >= 2 ? '#ff3b4a' : null, k === 1 ? '#ff3b4a' : null, '#3a1a20'); }
  for (let i = 0; i < MAX_FOOD / 2; i++) { const k = fd - i * 2; pix(LEG, 186 - i * 10, 18, k >= 2 ? '#d89048' : null, k === 1 ? '#d89048' : null, '#3a2a1a'); }
  if (v.air < MAX_AIR) for (let i = 0; i < Math.ceil(v.air); i++) pix(BUBBLE, 186 - i * 10, 2, '#9ad8ff', null, '#9ad8ff');
}
game.onVitals = renderVitals;
let hurtTimer = 0;
game.onHurt = () => {
  const h = $('hurt'); h.classList.add('on'); renderVitals();
  clearTimeout(hurtTimer); hurtTimer = setTimeout(() => h.classList.remove('on'), 120);
  if (navigator.vibrate && touchMode) try { navigator.vibrate(60); } catch (e) { /* ignorieren */ }
};
game.onMine = p => { $('mine').classList.toggle('on', p > 0); $('mine').firstChild.style.width = Math.round(p * 100) + '%'; };
const DEATH_WHY = { Sturz: 'Zu tief gefallen.', Ertrunken: 'Unter Wasser ging die Luft aus.', Magma: 'Magma ist heiß.', Hunger: 'Vor Hunger.' };
game.onDeath = (cause, grave) => {
  releaseInput(); setState('dead');
  $('deadWhy').textContent = (DEATH_WHY[cause] || '') + (grave ? ' Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.' : ' Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort.');
  if (locked()) document.exitPointerLock();
  saveNow(false);
};
$('dRevive').onclick = () => { game.revive(); renderHotbar(); setState('playing'); lockPointer(); };
$('dMenu').onclick = () => { game.revive(); $('pMenu').onclick(); };
game.onStation = st => { invAt = st; invCat = 'all'; openInventory(); };

// ---------- Story: Auftragsanzeige, Banner, Liste ----------
let questMin = false, bannerTimer = 0;
function renderQuest() {
  const el = $('quest'), s = game.story;
  if (!s || game.menuMode) { el.hidden = true; return; }
  el.hidden = false; el.classList.toggle('min', questMin);
  if (s.done) { el.innerHTML = '<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>'; return; }
  const q = QUESTS[s.i], [cur, n] = questProgress(game, q), pct = Math.min(100, Math.round(cur / n * 100));
  el.innerHTML = `<b>Auftrag ${s.i + 1}/${QUESTS.length} · ${q.t}</b><div class="bar"><i style="width:${pct}%"></i></div><small>${Math.min(cur, n)} / ${n}</small><small class="txt">${q.d}</small>`;
}
function showBanner(html) {
  const b = $('banner'); b.innerHTML = html; b.classList.add('on');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 4200);
}
game.onQuest = renderQuest;
game.onQuestDone = (q, last) => {
  const rw = Object.entries(q.r || {}).map(([t, c]) => `+${c} ${NAMES[t]}`).join(' · ');
  showBanner(last ? `🎉 Story abgeschlossen!<small>${q.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>` : `✔ Auftrag erledigt: ${q.t}<small>${rw}</small>`);
};
function renderQuestLog() {
  const s = game.story; if (!s) return;
  $('qlist').innerHTML = QUESTS.map((q, i) => {
    const done = s.done || i < s.i, cur = !s.done && i === s.i;
    return `<div class="qi ${done ? 'done' : cur ? 'cur' : ''}"><span class="st">${done ? '✔' : cur ? '➜' : i + 1}</span><div><b>${q.t}</b>${done || cur ? `<small>${q.d}</small>` : ''}</div></div>`;
  }).join('');
}
$('quest').addEventListener('click', () => { questMin = !questMin; renderQuest(); });
$('pQuests').onclick = () => { renderQuestLog(); show('qlog', true); };
$('qlogClose').onclick = () => show('qlog', false);

// ---------- Zustände ----------
const show = (id, on) => { $(id).hidden = !on; };
function setState(s) {
  state = s;
  document.body.classList.toggle('playing', s === 'playing');
  show('menu', s === 'menu'); show('pause', s === 'paused'); show('inv', s === 'inventory'); show('loading', s === 'loading'); show('set', s === 'settings'); show('dead', s === 'dead');
  show('hud', s === 'playing' || s === 'paused' || s === 'inventory' || s === 'dead' || (s === 'settings' && setReturn === 'paused'));
  if (s !== 'playing') game.onMine(0);
  if (s !== 'paused') show('qlog', false);
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
  $('pQuests').hidden = !game.story;
  $('td').value = Math.round(game.time * 100); $('tdVal').textContent = game.clockText();
  if (locked()) document.exitPointerLock();
}
function resume() {
  setState('playing'); game.resume(); lockPointer();
}
function openInventory() {
  if (state !== 'playing') return;
  invStations = game.stationsNear();
  if (invAt && !invStations.has(invAt)) invAt = null;
  releaseInput(); setState('inventory'); renderInvTabs(); renderInventory();
  if (locked()) document.exitPointerLock();
  game.stop(); // statisches Bild – spart Akku
}
function closeInventory() {
  if (state !== 'inventory') return;
  invAt = null;
  setState('playing'); game.resume(); lockPointer();
  if (!touchMode) setTimeout(() => { if (state === 'playing' && !locked()) pause(); }, 250);
}

document.addEventListener('pointerlockchange', () => { if (!locked() && state === 'playing' && !touchMode) pause(); });
document.addEventListener('pointerlockerror', () => { if (state === 'playing' && !touchMode) pause(); });

// ---------- Speichern ----------
function saveNow(announce) {
  if (!game.world || slot < 0 || game.menuMode) return;
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
    const meta = readMeta(i);
    if (meta) {
      const d = new Date(meta.savedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }), cr = meta.mode === 'creative', st = meta.mode === 'story';
      const pill = st ? `<span class="pill st">📜 Story · ${meta.q === -1 ? 'abgeschlossen' : 'Auftrag ' + ((meta.q ?? 0) + 1) + '/' + QUESTS.length}</span>` : `<span class="pill ${cr ? 'cr' : ''}">${cr ? 'Kreativ' : 'Überleben'}</span>`;
      h += `<div class="card"><div class="top"><div class="ico">${st ? '📜' : cr ? '🕊' : '⛏'}</div><div class="ttl"><b>${esc(meta.name)}</b>${pill}</div></div>
        <small>${st ? 'Feste Story-Welt' : 'Startwert ' + esc(meta.seed)}${(meta.gen || 1) < GEN_LATEST ? ' · klassische Welt' : ''} · zuletzt ${d}</small>
        <div class="row"><button class="go" data-act="load" data-i="${i}">▶ Weiterspielen</button><button data-act="exp" data-i="${i}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${hasBackup(i) ? `<button data-act="bak" data-i="${i}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>` : ''}<button data-act="del" data-i="${i}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`;
    } else {
      h += `<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${i + 1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${i}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${i}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${i}"><button class="on" data-mode="survival">⛏ Überleben</button><button data-mode="creative">🕊 Kreativ</button><button data-mode="story">📜 Story</button></div>
        <button class="go" data-act="new" data-i="${i}">Welt erzeugen</button></div>`;
    }
  }
  $('slots').innerHTML = h;
}
$('slots').addEventListener('click', e => {
  const sg = e.target.closest('.seg [data-mode]');
  if (sg) {
    for (const x of sg.parentNode.children) x.classList.toggle('on', x === sg);
    const card = sg.closest('.card'), story = sg.dataset.mode === 'story', inp = card.querySelector('input');
    inp.disabled = story; inp.placeholder = story ? 'feste Story-Welt' : 'Startwert (leer = Zufall)'; card.querySelector('[data-act=dice]').disabled = story;
    return;
  }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const i = Number(b.dataset.i);
  if (b.dataset.act === 'dice') {
    $('seed' + i).value = String(Math.floor(Math.random() * 900000) + 100000);
  } else if (b.dataset.act === 'del') {
    if (confirm('Diese Welt wirklich löschen?')) { deleteWorld(i); renderSlots(); }
  } else if (b.dataset.act === 'load') {
    let s = readWorld(i);
    if (!s) {
      const bk = readBackup(i);
      if (bk && confirm('Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?')) { restoreBackup(i); s = bk; }
      else { toast('Speicherstand nicht lesbar'); renderSlots(); return; }
    }
    launch(i, s);
  } else if (b.dataset.act === 'exp') {
    const s = readWorld(i);
    if (!s) { toast('Speicherstand nicht lesbar'); return; }
    downloadText(`klotzfunk-${s.name.replace(/[^\w-]+/g, '_')}.json`, exportText(s));
  } else if (b.dataset.act === 'bak') {
    const bk = readBackup(i);
    if (!bk) { toast('Keine lesbare Sicherung'); renderSlots(); return; }
    const when = new Date(bk.savedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
    if (confirm(`Sicherung vom ${when} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)) { toast(restoreBackup(i) ? 'Sicherung wiederhergestellt' : 'Wiederherstellen fehlgeschlagen'); renderSlots(); }
  } else {
    const mode = $('mode' + i).querySelector('.on').dataset.mode;
    launch(i, { name: mode === 'story' ? 'Story ' + (i + 1) : 'Welt ' + (i + 1), seed: mode === 'story' ? 777 : parseSeed($('seed' + i).value), mode,
      // Story bleibt vorerst auf der erprobten Originalwelt (alle 15 Aufträge dort lösbar); neue Story-Kapitel folgen mit Generator 2
      gen: mode === 'story' ? 1 : GEN_LATEST });
  }
});

function downloadText(name, text) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) { toast('Export nicht möglich'); }
}
$('mImport').onclick = () => {
  if (freeSlot() < 0) { toast('Kein freier Platz – lösche zuerst eine Welt'); return; }
  $('importFile').value = ''; $('importFile').click();
};
$('importFile').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  if (f.size > 8 * 1024 * 1024) { toast('Datei zu groß'); return; }
  f.text().then(text => {
    const s = importText(text), i = freeSlot();
    if (!s) { toast('Keine gültige KLOTZFUNK-Welt'); return; }
    if (i < 0) { toast('Kein freier Platz'); return; }
    toast(writeWorld(i, s) ? `„${s.name}“ importiert (Platz ${i + 1})` : 'Import fehlgeschlagen (Speicher voll?)');
    renderSlots();
  }).catch(() => toast('Datei nicht lesbar'));
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
      renderHotbar(); renderQuest(); setState('playing'); renderVitals(); lockPointer();
      if (game.story && game.story.i === 0 && game.story.p === 0 && save.px === undefined) showBanner('📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>');
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
$('pMenu').onclick = () => { saveNow(false); slot = -1; renderSlots(); setState('menu'); game.startMenu(); renderQuest(); renderVitals(); };
$('vd').oninput = e => { const v = Number(e.target.value); game.maxView = v; game.setViewDist(v); $('vdVal').textContent = v; };
$('invClose').onclick = closeInventory;
$('bInv').onclick = openInventory;
$('bWp').onclick = () => game.toggleWaypoint();
$('bMap').onclick = toggleMap;
$('td').oninput = e => { game.time = Number(e.target.value) / 100; $('tdVal').textContent = game.clockText(); game.updateSky(); game.render(); };
$('pFreeze').onclick = () => { game.timeFrozen = !game.timeFrozen; $('pFreeze').textContent = game.timeFrozen ? '⏸ Zeit steht still' : '⏱ Zeit läuft'; };
$('bPause').onclick = pause;

// ---------- Tastatur ----------
function syncKeys() {
  const inp = game.input;
  if (touchActive.joy) return;
  inp.f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  inp.r = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  const fly = game.player.flying;
  inp.sprint = keys.has('ControlLeft') || (!fly && keys.has('ShiftLeft'));
  inp.down = fly && keys.has('ShiftLeft') || touchActive.down;
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
  if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) {
    if (e.code === 'Escape') { e.target.blur(); if (state === 'inventory') closeInventory(); else if (state === 'settings') closeSettings(); }
    return;
  }
  if (state === 'settings') { if (e.code === 'Escape') closeSettings(); return; }
  if (state === 'inventory') { if (e.code === 'KeyE' || e.code === 'Escape') { e.preventDefault(); closeInventory(); } return; }
  if (state !== 'playing') return;
  if (e.code === 'Space' || e.code === 'Tab' || e.code.startsWith('Arrow')) e.preventDefault();
  if (e.repeat) return;
  if (/^Digit[1-9]$/.test(e.code)) { game.selectSlot(Number(e.code[5]) - 1); return; }
  if (e.code === 'KeyE') { e.preventDefault(); openInventory(); return; }
  if (e.code === 'KeyF') { toggleFly(); return; }
  if (e.code === 'KeyQ') { game.fireHook(); return; }
  if (e.code === 'KeyB') { game.toggleWaypoint(); return; }
  if (e.code === 'KeyM') { toggleMap(); return; }
  if (e.code === 'KeyJ') { questMin = !questMin; renderQuest(); return; }
  if (e.code === 'Space') { const n = performance.now(); if (n - lastSpace < 280) toggleFly(); lastSpace = n; }
  keys.add(e.code); syncKeys();
});
window.addEventListener('keyup', e => { keys.delete(e.code); if (state === 'playing') syncKeys(); });
window.addEventListener('blur', () => { keys.clear(); syncKeys(); });

// ---------- Maus ----------
const SENS = 0.0022, TOUCH_SENS = 0.0058;
function look(dx, dy, s) {
  game.yaw -= dx * s;
  game.pitch = Math.max(-1.55, Math.min(1.55, game.pitch - dy * s * (settings.invertY ? -1 : 1)));
}
window.addEventListener('mousemove', e => { if (state === 'playing' && locked()) look(e.movementX, e.movementY, SENS * settings.mouseSens); });
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
    const m = Math.min(1, len * settings.joySens / R), dead = m < 0.14 ? 0 : (m - 0.14) / 0.86;
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
    look(e.clientX - lp.x, e.clientY - lp.y, TOUCH_SENS * settings.touchSens); lp.x = e.clientX; lp.y = e.clientY;
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
  $('bHook').addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); game.fireHook(); });
})();

// ---------- Fenster ----------
window.addEventListener('resize', () => game.resize());
// ---------- Minikarte (Blick von oben, Norden oben) ----------
let mapOn = true;
function toggleMap() { mapOn = !mapOn; $('mm').classList.toggle('off', !mapOn); }
const mmCtx = $('mm').getContext('2d'), mmImg = mmCtx.createImageData(56, 56);
function drawMap() {
  const w = game.world, p = game.player, d = mmImg.data, ox = Math.floor(p.x) - 28, oz = Math.floor(p.z) - 28, py = p.y;
  for (let j = 0; j < 56; j++) for (let i = 0; i < 56; i++) {
    const wx = ox + i, wz = oz + j, c = w.getChunk(wx >> 4, wz >> 4), o = (j * 56 + i) * 4;
    let r = 14, g = 18, b = 32;
    if (c) {
      const idx = (wx & 15) + (wz & 15) * 16;
      let y = Math.min(H - 1, c.maxY);
      while (y > 0 && c.data[idx + y * 256] === 0) y--;
      const t = c.data[idx + y * 256], col = BLOCKS[t] ? BLOCKS[t].map : [200, 200, 210], k = t === B.WATER ? 1 : Math.max(0.55, Math.min(1.25, 1 + (y - py) * 0.025));
      r = col[0] * k; g = col[1] * k; b = col[2] * k;
    }
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
  }
  mmCtx.putImageData(mmImg, 0, 0);
  if (game.wp) { // Wegpunkt (am Rand angedockt, wenn weiter weg)
    let dx = game.wp.x - p.x, dz = game.wp.z - p.z; const m = Math.max(Math.abs(dx), Math.abs(dz)), s = m > 25 ? 25 / m : 1;
    dx *= s; dz *= s;
    mmCtx.fillStyle = '#ff2d95'; mmCtx.fillRect(28 + dx - 2, 28 + dz - 2, 5, 5);
    mmCtx.strokeStyle = '#fff'; mmCtx.strokeRect(28 + dx - 2.5, 28 + dz - 2.5, 6, 6);
  }
  mmCtx.save(); mmCtx.translate(28, 28); mmCtx.rotate(-game.yaw); // Pfeil zeigt Blickrichtung
  mmCtx.fillStyle = '#fff'; mmCtx.strokeStyle = '#000'; mmCtx.beginPath(); mmCtx.moveTo(0, -5); mmCtx.lineTo(3.5, 4); mmCtx.lineTo(0, 2); mmCtx.lineTo(-3.5, 4); mmCtx.closePath(); mmCtx.fill(); mmCtx.stroke();
  mmCtx.restore();
}
let mapTick = 0;
setInterval(() => {
  if (state !== 'playing') return;
  const p = game.player;
  let extra = '';
  if (p.flying) extra += ' · fliegt'; if (p.gliding) extra += ' · gleitet'; if (game.hookT > 0) extra += ' · Haken';
  if (game.wp) extra += ` · 📍 ${Math.round(Math.hypot(game.wp.x - p.x, game.wp.z - p.z))} m`;
  if (game.radioDist < 24) extra += ' · ♪';
  const bio = game.biomeName();
  if (bio) extra += ' · ' + bio;
  if (settings.showFps) extra += ` · ${game.fps} FPS`;
  $('info').textContent = `${game.clockText()} ${game.time < 0.5 ? '☀' : '☾'} · X ${p.x.toFixed(0)} Y ${p.y.toFixed(0)} Z ${p.z.toFixed(0)}${extra}`;
  $('uw').classList.toggle('on', !!game.underwater);
  if (mapOn && (mapTick++ & 1) === 0) drawMap();
  if (game.story) renderQuest();
}, 250);

// ---------- Einstellungen ----------
function applySettings() {
  const auto = settings.quality === 'auto';
  game.setQuality(auto ? autoBase(coarse) : settings.quality, auto);
  game.placeDelay = settings.placeDelay; game.deathLoss = settings.deathLoss;
  sfx.vol = settings.sfxVol; sfx.music = settings.musicVol;
  document.documentElement.style.setProperty('--tbs', String(settings.btnScale));
  document.body.classList.toggle('lefty', settings.lefty);
}
const SET_RANGES = [['sMouse', 'mouseSens', v => v.toFixed(1) + '×'], ['sTouch', 'touchSens', v => v.toFixed(1) + '×'], ['sJoy', 'joySens', v => v.toFixed(1) + '×'],
  ['sBtn', 'btnScale', v => Math.round(v * 100) + ' %'], ['sSfx', 'sfxVol', v => Math.round(v * 100) + ' %'], ['sMus', 'musicVol', v => Math.round(v * 100) + ' %']];
const SET_CHECKS = [['sLefty', 'lefty'], ['sInvY', 'invertY'], ['sPlace', 'placeDelay'], ['sFps', 'showFps']];
function renderSettings() {
  $('sQuality').value = settings.quality; $('sDeath').value = settings.deathLoss;
  for (const [id, k, f] of SET_RANGES) { $(id).value = settings[k]; $(id + 'V').textContent = f(settings[k]); }
  for (const [id, k] of SET_CHECKS) $(id).checked = settings[k];
}
function changed(quality) {
  saveSettings(settings);
  if (quality) applySettings();
  else { // ohne Grafikwechsel: Sichtweite/Auflösung nicht zurücksetzen
    game.placeDelay = settings.placeDelay; game.deathLoss = settings.deathLoss; sfx.vol = settings.sfxVol; sfx.music = settings.musicVol;
    document.documentElement.style.setProperty('--tbs', String(settings.btnScale));
    document.body.classList.toggle('lefty', settings.lefty);
  }
}
$('sQuality').onchange = e => { settings.quality = e.target.value; changed(true); };
$('sDeath').onchange = e => { settings.deathLoss = e.target.value; changed(false); };
for (const [id, k, f] of SET_RANGES) $(id).oninput = e => { settings[k] = Number(e.target.value); $(id + 'V').textContent = f(settings[k]); changed(false); };
for (const [id, k] of SET_CHECKS) $(id).onchange = e => { settings[k] = e.target.checked; changed(false); };
$('sReset').onclick = () => { settings = { ...DEFAULTS }; changed(true); renderSettings(); toast('Standard wiederhergestellt'); };
function openSettings() { setReturn = state; renderSettings(); setState('settings'); }
function closeSettings() { if (state !== 'settings') return; setState(setReturn); if (setReturn === 'paused') { $('vd').value = game.viewDist; $('vdVal').textContent = game.viewDist; } }
$('pSettings').onclick = openSettings;
$('mSettings').onclick = openSettings;
$('setClose').onclick = closeSettings;

applySettings();
renderSlots();
setState('menu');
game.startMenu();
