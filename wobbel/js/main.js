/* Wobbel – Start, Menüs, Spielablauf. */
import LEVELS from './game/levels/index.js';
import { WORLDS } from './game/worlds.js';
import { Session, starsFor } from './game/session.js';
import { GameView } from './render/scene.js';
import { initInput } from './input.js';
import { Save } from './storage.js';
import { SFX, Music, Audio_ } from './audio.js';

const $ = id => document.getElementById(id);
const err = m => { $('err').hidden = false; $('errTxt').textContent = m; };
if (!window.THREE) { err('Three.js konnte nicht geladen werden. Bitte Internetverbindung prüfen.'); throw new Error('three'); }
if (window.self !== window.top) $('backLink').hidden = true;
const PAR = (await import('./game/levels/par.js').then(m => m.default).catch(() => []));
LEVELS.forEach((l, i) => { l.par = PAR[i] || 0; });
if (!LEVELS.length) { err('Keine Level gefunden.'); throw new Error('levels'); }
const coarse = matchMedia('(pointer:coarse)').matches;
if (Save.settings.dpad == null) Save.setSetting('dpad', coarse);

const view = new GameView($('cv'));
view.cb.sfx = n => SFX[n] && SFX[n]();
let playing = false, session = null, lastToast = 0, worldTab = 0, curIdx = 0;
const setSky = w => { document.documentElement.style.setProperty('--sky1', w.sky[0]); document.documentElement.style.setProperty('--sky2', w.sky[1]); document.querySelector('meta[name=theme-color]').content = w.sky[0]; };
const show = id => ['menu', 'levels'].forEach(s => { $(s).hidden = s !== id; });
const dlg = (id, on) => { $(id).hidden = !on; };

// Logo (optional logo.png im Spielordner)
{ const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }

// ---------------------------------------------------------------- Sitzung
session = new Session(view, {
  onChange: s => renderHud(s), onStart: s => { $('tWorld').textContent = `${s.world.emoji} ${s.world.name} · Level ${s.def.indexInWorld + 1}`; $('tName').textContent = s.def.name; if (s.def.hint) toast(s.def.hint, 5200); },
  onSolved: s => solved(s)
});
function renderHud(s) {
  const st = s.stats; $('cMoves').textContent = '👣 ' + st.moves; $('cPush').textContent = '📦 ' + st.pushes; $('cGoal').textContent = `🎯 ${st.done}/${st.total}`; $('cGoal').classList.toggle('done', st.done === st.total); $('bUndo').disabled = !st.canUndo;
  $('cKey').hidden = !s.L.keys.length && !st.keys; $('cKey').textContent = '🔑 ' + st.keys;
}
function toast(msg, ms) { const t = $('toast'); t.textContent = msg; t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; const id = ++lastToast; setTimeout(() => { if (id === lastToast) t.hidden = true; }, ms || 3000); }
function startLevel(i) {
  curIdx = Math.max(0, Math.min(LEVELS.length - 1, i)); const def = LEVELS[curIdx]; setSky(WORLDS[def.world]); Save.setSetting('last', curIdx);
  show(null); dlg('win', false); $('hud').hidden = false; playing = true; view.orbit = false; applyPad(); session.start(def); Music.play('game');
}
function applyPad() { const dp = document.body.classList.contains('dpad'), small = innerWidth < 600, portrait = innerHeight > innerWidth; view.setPad(small ? 118 : 100, dp ? (portrait ? 210 : 26) : 24, dp && !portrait ? 200 : 10, 66); }
function solved(s) {
  const st = s.stats, def = s.def, stars = starsFor(st.moves, def.par), res = Save.complete(def.index, st.moves, st.pushes, stars); view.celebrate(); SFX.win();
  setTimeout(() => {
    $('wTitle').textContent = ['', 'Geschafft!', 'Super!', 'Perfekt!'][stars]; $('wStars').innerHTML = [1, 2, 3].map(k => `<span class="${k <= stars ? '' : 'off'}">★</span>`).join('');
    $('wInfo').innerHTML = `👣 ${st.moves} Züge · 📦 ${st.pushes} Schübe${def.par ? ` · Bestmarke ${def.par}` : ''}<br>${res.newBest && Save.level(def.index).plays > 1 ? '🏆 Neuer persönlicher Rekord!' : ''}`;
    $('wNext').textContent = curIdx + 1 < LEVELS.length ? 'Nächstes Level ▶' : 'Zum Menü'; dlg('win', true); [1, 2, 3].forEach(k => k <= stars && setTimeout(() => SFX.star(k), 250 * k));
  }, 900);
}
const actions = { playing: () => playing && $('win').hidden && $('how').hidden && $('set').hidden, session: () => session, undo: () => session.undo(), restart: () => session.restart(), rotate: d => view.rotate(d), back: () => toMenu(), next: () => {} };
initInput({ view, session: () => session, canvas: $('cv'), actions });
$('bUndo').onclick = () => { SFX.click(); session.undo(); }; $('bRestart').onclick = () => session.restart(); $('bRot').onclick = () => { SFX.click(); view.rotate(1); }; $('bMenu').onclick = () => { SFX.click(); toMenu(); };
$('bSound').onclick = () => { setSound(!Save.settings.sound); };
$('wNext').onclick = () => { SFX.click(); if (curIdx + 1 < LEVELS.length) startLevel(curIdx + 1); else toMenu(); }; $('wAgain').onclick = () => { SFX.click(); dlg('win', false); session.restart(); }; $('wMenu').onclick = () => { SFX.click(); dlg('win', false); openLevels(); };

// ---------------------------------------------------------------- Menüs
function demo() { const def = LEVELS[Math.min(curIdx, LEVELS.length - 1)]; setSky(WORLDS[def.world]); session.start(Object.assign({}, def)); view.orbit = true; view.setPad(40, 40, 10, 10); $('hud').hidden = true; playing = false; }
function toMenu() { dlg('win', false); playing = false; show('menu'); $('hud').hidden = true; renderMenuStat(); demo(); Music.play('menu'); }
function renderMenuStat() { const unlocked = Save.unlockedUpTo(LEVELS.length) + 1, total = LEVELS.length * 3; $('menuStat').textContent = `★ ${Save.totalStars()} / ${total} · Level ${Math.min(unlocked, LEVELS.length)} / ${LEVELS.length}`; $('bPlay').textContent = Save.level(0) ? '▶ Weiterspielen' : '▶ Spielen'; }
$('bPlay').onclick = () => { SFX.click(); const n = Math.min(Save.unlockedUpTo(LEVELS.length), LEVELS.length - 1); startLevel(n); };
$('bLevels').onclick = () => { SFX.click(); openLevels(); }; $('bLvBack').onclick = () => { SFX.click(); toMenu(); };
$('bHow').onclick = () => { SFX.click(); dlg('how', true); }; $('howOk').onclick = () => { SFX.click(); dlg('how', false); };
function openLevels() { show('levels'); $('hud').hidden = true; playing = false; worldTab = LEVELS[curIdx] ? LEVELS[curIdx].world : 0; renderLevels(); }
function renderLevels() {
  const unlocked = Save.unlockedUpTo(LEVELS.length); $('tabs').innerHTML = WORLDS.map((w, i) => { const ls = LEVELS.filter(l => l.world === i); return ls.length ? `<button class="tab ${i === worldTab ? 'on' : ''}" data-w="${i}">${w.emoji} ${w.name}</button>` : ''; }).join('');
  $('tabs').querySelectorAll('[data-w]').forEach(b => b.onclick = () => { SFX.click(); worldTab = +b.dataset.w; renderLevels(); });
  const w = WORLDS[worldTab], ls = LEVELS.filter(l => l.world === worldTab); setSky(w); const got = ls.reduce((a, l) => a + (Save.level(l.index) ? Save.level(l.index).stars : 0), 0);
  $('wHead').innerHTML = `<b>${w.emoji} ${w.name}</b><small>${w.blurb} · ★ ${got}/${ls.length * 3}</small>`;
  $('lgrid').innerHTML = ls.map(l => { const sv = Save.level(l.index), lock = l.index > unlocked; return `<button class="lv ${lock ? 'lock' : ''} ${l.index === unlocked ? 'cur' : ''}" data-i="${l.index}" title="${l.name}">${l.indexInWorld + 1}<span class="st">${sv ? '★'.repeat(sv.stars) + '☆'.repeat(3 - sv.stars) : ''}</span></button>`; }).join('');
  $('lgrid').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { SFX.click(); startLevel(+b.dataset.i); });
}
// Einstellungen
const syncSet = () => { const s = Save.settings; $('swSound').classList.toggle('on', s.sound); $('swMusic').classList.toggle('on', s.music); $('swDpad').classList.toggle('on', !!s.dpad); $('bSound').textContent = s.sound ? '🔊' : '🔇'; document.body.classList.toggle('dpad', !!s.dpad); Audio_.setSfx(s.sound); Music.setOn(s.music); };
function setSound(v) { Save.setSetting('sound', v); Save.setSetting('music', v); syncSet(); if (v) SFX.click(); }
$('bSet').onclick = () => { SFX.click(); dlg('set', true); }; $('setOk').onclick = () => { SFX.click(); dlg('set', false); };
$('sSound').onclick = () => { Save.setSetting('sound', !Save.settings.sound); syncSet(); SFX.click(); }; $('sMusic').onclick = () => { Save.setSetting('music', !Save.settings.music); syncSet(); }; $('sDpad').onclick = () => { Save.setSetting('dpad', !Save.settings.dpad); syncSet(); if (playing) applyPad(); };
$('sReset').onclick = () => { if (confirm('Wirklich den gesamten Fortschritt löschen?')) { Save.reset(); syncSet(); renderMenuStat(); dlg('set', false); } };
syncSet();

// ---------------------------------------------------------------- Schleife
function resize() { view.resize(innerWidth, innerHeight); if (playing) applyPad(); } addEventListener('resize', resize); resize();
let last = performance.now(); (function loop(n) { requestAnimationFrame(loop); const dt = Math.min(0.05, (n - last) / 1000); last = n; session.update(); view.tick(dt); })(last);
document.addEventListener('pointerdown', () => { Audio_.unlock(); if (!playing) Music.play('menu'); }, { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) Music.setOn(false); else Music.setOn(Save.settings.music); });
window.__wobbel = { view, get session() { return session; }, LEVELS, Save, startLevel, toMenu };
const u = new URLSearchParams(location.search).get('level'); if (u) startLevel(+u - 1); else { curIdx = Math.min(Save.settings.last || 0, LEVELS.length - 1); toMenu(); if (!Save.level(0)) setTimeout(() => dlg('how', true), 600); }
