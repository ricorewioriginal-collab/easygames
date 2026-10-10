/* Wobbel – Start, Menüs, Spielablauf. */
import LEVELS from './game/levels/index.js';
import { WORLDS } from './game/worlds.js';
import { Session, starsFor } from './game/session.js';
import { GameView } from './render/scene.js';
import { initInput } from './input.js';
import { Save } from './storage.js';
import { SFX, Music, Audio_ } from './audio.js';
import { initEditor } from './editor/editor.js';
import { decode } from './editor/codec.js';
import { initBonus } from './bonus/ui.js';
import { Shop, levelReward, SKIP_PRICE, TIP_PRICE } from './bonus/shop.js';
import { askTip, cancelTip } from './game/tip.js';
import { checkAchievements } from './bonus/achievements.js';
import { dailyIndex, dayStr, dailyStatus, completeDaily } from './bonus/daily.js';
import { initCommunity } from './community.js';

const $ = id => document.getElementById(id);
const err = m => { $('err').hidden = false; $('errTxt').textContent = m; };
if (!window.THREE) { err('Three.js konnte nicht geladen werden. Bitte Internetverbindung prüfen.'); throw new Error('three'); }
if (window.self !== window.top) $('backLink').hidden = true;
if (!LEVELS.length) { err('Keine Level gefunden.'); throw new Error('levels'); }
const coarse = matchMedia('(pointer:coarse)').matches;
if (Save.settings.dpad == null) Save.setSetting('dpad', coarse);

const view = new GameView($('cv'));
view.cb.sfx = n => SFX[n] && SFX[n]();
let t0 = 0, tEnd = 0, dailyRun = false, shareText = '', lastClock = 0, playing = false, custom = null, editorOn = false, autoTimer = 0, session = null, lastToast = 0, worldTab = 0, curIdx = 0;
const setSky = w => { document.documentElement.style.setProperty('--sky1', w.sky[0]); document.documentElement.style.setProperty('--sky2', w.sky[1]); document.querySelector('meta[name=theme-color]').content = w.sky[0]; };
const show = id => ['menu', 'levels', 'editor', 'bonus'].forEach(s => { $(s).hidden = s !== id; });
const dlg = (id, on) => { $(id).hidden = !on; };

// Logo (optional logo.png im Spielordner)
{ const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }

// ---------------------------------------------------------------- Sitzung
session = new Session(view, {
  onChange: s => renderHud(s), onStart: s => { $('tWorld').textContent = `${s.world.emoji} ${s.world.name} · ${custom ? 'Eigenes Level' : (dailyRun ? '📅 Tageslevel' : 'Level ' + (s.def.indexInWorld + 1))}`; $('tName').textContent = s.def.name; $('bTip').hidden = false; cancelTip(); session.view.hideTip(); $('bSkip').hidden = !!custom || !!Save.level(s.def.index); if (s.def.hint) toast(s.def.hint, 5200); },
  onSolved: s => solved(s)
});
function renderHud(s) {
  const st = s.stats; if (!st.moves && !st.canUndo) { t0 = 0; tEnd = 0; $('cTime').textContent = '⏱ 0:00.0'; } else if (st.moves && !t0) t0 = performance.now() - 1;
  $('cMoves').textContent = '👣 ' + st.moves; $('cPush').textContent = '📦 ' + st.pushes; $('cGoal').textContent = `🎯 ${st.done}/${st.total}`; $('cGoal').classList.toggle('done', st.done === st.total); $('bUndo').disabled = !st.canUndo;
  $('cKey').hidden = !s.L.keys.length && !st.keys; $('cKey').textContent = '🔑 ' + st.keys;
}
function toast(msg, ms) { const t = $('toast'); t.textContent = msg; t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; const id = ++lastToast; setTimeout(() => { if (id === lastToast) t.hidden = true; }, ms || 3000); }
function startLevel(i, daily) {
  dailyRun = !!daily; curIdx = Math.max(0, Math.min(LEVELS.length - 1, i)); const def = LEVELS[curIdx]; setSky(WORLDS[def.world]); Save.setSetting('last', curIdx);
  show(null); dlg('win', false); $('hud').hidden = false; playing = true; view.orbit = false; applyPad(); session.start(def); Music.play('game');
}
function applyPad() { const dp = document.body.classList.contains('dpad'), small = innerWidth < 600, portrait = innerHeight > innerWidth; view.setPad(small ? 118 : 100, dp ? (portrait ? 210 : 26) : 24, dp && !portrait ? 200 : 10, 66); }
const fmtT = t => { t = Math.max(0, t); return `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`; };
const dailyIdx = () => dailyIndex(dayStr(), LEVELS.length);
function announce(got) { got.forEach((a, k) => setTimeout(() => { toast(`🏅 ${a.name} (+${a.reward} 🐚)`, 3000); SFX.place(); }, 400 + k * 1900)); return got; }
const checkAch = () => announce(checkAchievements(LEVELS));
function solved(s) {
  tEnd = performance.now(); const secs = t0 ? Math.round((tEnd - t0) / 100) / 10 : 0, st = s.stats, def = s.def, stars = starsFor(st.moves, def.par);
  const old = custom ? null : Save.level(def.index), reward = custom ? 0 : levelReward(old, stars), res = custom ? { newBest: false, newTime: false } : Save.complete(def.index, st.moves, st.pushes, stars, secs); let dly = null;
  if (!custom) { if (reward) Save.addCoins(reward); if (s.undos === 0 && st.moves >= 10) Save.addStat('clean'); if (secs && secs < 15 && st.moves >= 10) Save.addStat('fast'); if (dailyRun && def.index === dailyIdx()) dly = completeDaily(); }
  view.celebrate(); SFX.win();
  if (custom) { if (custom.auto) { stopAuto(); } else { if (custom.opts.community) Save.addStat('community'); if (custom.opts.onSolved) custom.opts.onSolved({ moves: st.moves, pushes: st.pushes }); } }
  const got = custom && custom.auto ? [] : checkAchievements(LEVELS);
  shareText = custom ? `Wobbel „${def.name}" – ${st.moves} Züge${secs ? ' in ' + fmtT(secs) : ''}. Schaffst du es besser?` : `Wobbel ${def.world + 1}-${def.indexInWorld + 1} „${def.name}" ${'⭐'.repeat(stars)} · ${st.moves} Züge${secs ? ' · ⏱ ' + fmtT(secs) : ''}`;
  setTimeout(() => {
    $('wTitle').textContent = ['', 'Geschafft!', 'Super!', 'Perfekt!'][stars]; $('wStars').innerHTML = [1, 2, 3].map(k => `<span class="${k <= stars ? '' : 'off'}">★</span>`).join('');
    $('wInfo').innerHTML = `👣 ${st.moves} Züge · 📦 ${st.pushes} Schübe${secs ? ' · ⏱ ' + fmtT(secs) : ''}${def.par ? `<br>Bestmarke ${def.par} Züge` : ''}${!custom && res.newBest && Save.level(def.index).plays > 1 ? '<br>🏆 Neuer persönlicher Rekord!' : ''}${!custom && res.newTime && old && old.time ? '<br>⏱ Neue Bestzeit!' : ''}`;
    const coin = reward + (dly ? dly.reward : 0); $('wCoins').hidden = !coin; $('wCoins').innerHTML = `+${coin} 🐚${dly ? `<br><small>📅 Tageslevel geschafft · 🔥 Serie ${dly.streak} (+${dly.reward})</small>` : ''}`;
    $('wAch').hidden = !got.length; $('wAch').innerHTML = got.map(a => `🏅 ${a.name} (+${a.reward} 🐚)`).join('<br>');
    $('wNext').textContent = custom ? '✏️ Zurück zum Editor' : curIdx + 1 < LEVELS.length ? 'Nächstes Level ▶' : 'Zum Menü'; $('wMenu').hidden = !!custom; dlg('win', true); [1, 2, 3].forEach(k => k <= stars && setTimeout(() => SFX.star(k), 250 * k));
  }, 900);
}
$('wShare').onclick = async () => { SFX.click(); const url = location.origin + location.pathname; try { if (navigator.share) { await navigator.share({ text: shareText, url }); return; } await navigator.clipboard.writeText(shareText + ' ' + url); toast('Ergebnis kopiert ✓', 1800); } catch (e) { /* abgebrochen */ } };
const actions = { playing: () => playing && $('win').hidden && $('how').hidden && $('set').hidden, session: () => session, undo: () => session.undo(), restart: () => session.restart(), rotate: d => view.rotate(d), back: () => toMenu(), next: () => {} };
initInput({ view, session: () => session, canvas: $('cv'), actions });
$('bUndo').onclick = () => { SFX.click(); session.undo(); }; $('bRestart').onclick = () => session.restart(); $('bRot').onclick = () => { SFX.click(); view.rotate(1); }; $('bMenu').onclick = () => { SFX.click(); toMenu(); };
$('bSound').onclick = () => { setSound(!Save.settings.sound); };
$('wNext').onclick = () => { SFX.click(); if (custom) { exitCustom(); return; } if (curIdx + 1 < LEVELS.length) startLevel(curIdx + 1); else toMenu(); }; $('wAgain').onclick = () => { SFX.click(); dlg('win', false); session.restart(); }; $('wMenu').onclick = () => { SFX.click(); dlg('win', false); openLevels(); };

// ---------------------------------------------------------------- Menüs
function demo() { const def = LEVELS[Math.min(curIdx, LEVELS.length - 1)]; setSky(WORLDS[def.world]); session.start(Object.assign({}, def)); view.orbit = true; view.setPad(40, 40, 10, 10); $('hud').hidden = true; playing = false; }
function stopAuto() { clearInterval(autoTimer); autoTimer = 0; }
function setEditorOn(v) { editorOn = v; $('cv').style.visibility = v ? 'hidden' : ''; }
// Eigene Level: Probespiel aus dem Editor / geteilter Link
function startCustom(def, opts) {
  opts = opts || {}; if (ed && ed.isOpen()) ed.close(); setEditorOn(false); custom = { opts, auto: !!opts.autoplay }; setSky(WORLDS[def.world] || WORLDS[0]);
  show(null); dlg('win', false); $('hud').hidden = false; playing = true; view.orbit = false; applyPad(); stopAuto();
  session.start(Object.assign({ index: -1, indexInWorld: 0, key: 'custom', hint: '', par: 0 }, def)); Music.play('game');
  if (opts.autoplay) { const path = [...opts.autoplay]; toast('Lösung wird vorgespielt …', 2500); autoTimer = setInterval(() => { if (!path.length) { stopAuto(); return; } if (!view.busy && !session.queue.length) { const d = 'URDL'.indexOf(path.shift()); if (d >= 0) session.push(d); } }, 90); }
}
function exitCustom() { const c = custom; custom = null; stopAuto(); dlg('win', false); playing = false; $('hud').hidden = true; if (c && c.opts.onExit) c.opts.onExit(); else toMenu(); }
function toMenu() { if (custom) { exitCustom(); return; } dlg('win', false); setEditorOn(false); playing = false; show('menu'); $('hud').hidden = true; renderMenuStat(); demo(); Music.play('menu'); }
function renderMenuStat() { const unlocked = Save.unlockedUpTo(LEVELS.length) + 1, total = LEVELS.length * 3; $('menuStat').textContent = `★ ${Save.totalStars()} / ${total} · 🐚 ${Save.coins} · Level ${Math.min(unlocked, LEVELS.length)} / ${LEVELS.length}`; $('bPlay').textContent = Save.level(0) ? '▶ Weiterspielen' : '▶ Spielen'; const d = dailyStatus(); $('bDaily').textContent = d.done ? `📅 Tageslevel ✔ · 🔥 ${d.streak}` : `📅 Tageslevel${d.streak ? ' · 🔥 ' + d.streak : ''}`; }
$('bPlay').onclick = () => { SFX.click(); const n = Math.min(Save.unlockedUpTo(LEVELS.length), LEVELS.length - 1); startLevel(n); };
$('bDaily').onclick = () => { SFX.click(); startLevel(dailyIdx(), true); };
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
// Bonus & Laden
const bonus = initBonus({ toast, sfx: (n, ...a) => SFX[n] && SFX[n](...a), back: () => toMenu(), onLook: l => view.setLook(l), onShow: v => setEditorOn(v), checkAch });
view.setLook(Save.look);
$('bBonus').onclick = () => { SFX.click(); show(null); setEditorOn(true); bonus.open('games'); };
let tipBusy = false;
$('bTip').onclick = async () => {
  if (tipBusy || session.solved) return; if (Save.coins < TIP_PRICE) { SFX.blocked(); toast(`Ein Tipp kostet ${TIP_PRICE} 🐚 – hol dir welche in den Bonusspielen!`, 3200); return; }
  tipBusy = true; $('bTip').disabled = true; toast('💡 Der Löser denkt nach …', 12000); const r = await askTip(session.def, session.state); tipBusy = false; $('bTip').disabled = false;
  if (!r.ok) { if (r.reason !== 'abgebrochen') toast(r.reason === 'unlösbar' ? '🤔 Von hier aus ist das Level nicht mehr lösbar – mach Züge rückgängig (↶).' : '🤔 Das ist zu komplex für einen Tipp – versuch es ein Stück weiter.', 4200); return; }
  Save.addCoins(-TIP_PRICE); const dirs = [...r.path].map(c => 'URDL'.indexOf(c)); session.view.showTip(dirs); SFX.place(); toast(`💡 Tipp: ${dirs.slice(0, 3).map(d => '⬆️➡️⬇️⬅️'.match(/.{1,2}/gu)[d]).join(' ')} … noch ${dirs.length} Züge bis zur Lösung`, 5000);
};
$('bSkip').onclick = () => {
  if (custom || Save.level(curIdx)) return; if (Save.coins < SKIP_PRICE) { SFX.blocked(); toast(`Zum Überspringen brauchst du ${SKIP_PRICE} 🐚 – hol dir welche in den Bonusspielen!`, 3800); return; }
  if (!confirm(`Level für ${SKIP_PRICE} 🐚 überspringen? (ohne Sterne)`)) return; Shop.skip(curIdx); SFX.place(); if (curIdx + 1 < LEVELS.length) startLevel(curIdx + 1); else toMenu();
};
// Editor
const ed = initEditor({ toast, sfx: n => SFX[n] && SFX[n](), playTest: startCustom, back: () => toMenu(), event: n => { if (n === 'save') Save.addStat('editorSaves'); else if (n === 'solved') Save.addStat('editorSolved'); checkAch(); } });
function openEditor(keep) { dlg('win', false); show('editor'); $('hud').hidden = true; playing = false; setEditorOn(true); Music.play('menu'); ed.open(keep); }
$('bEditor').onclick = () => { SFX.click(); openEditor(false); };

// Community-Level
const community = initCommunity({ toast, sfx: n => SFX[n] && SFX[n](), play: (def, opts) => { setEditorOn(false); startCustom(def, opts); }, edit: d => { show('editor'); setEditorOn(true); ed.open(false); ed.load(d.map, d.name, d.world, null, null); }, back: () => { show('levels'); }, home: () => { toMenu(); } });
$('bComm').onclick = () => { SFX.click(); community.open(); };
// Einstellungen
const syncSet = () => { const s = Save.settings; $('swSound').classList.toggle('on', s.sound); $('swMusic').classList.toggle('on', s.music); $('swDpad').classList.toggle('on', !!s.dpad); $('bSound').textContent = s.sound ? '🔊' : '🔇'; document.body.classList.toggle('dpad', !!s.dpad); Audio_.setSfx(s.sound); Music.setOn(s.music); };
function setSound(v) { Save.setSetting('sound', v); Save.setSetting('music', v); syncSet(); if (v) SFX.click(); }
$('bSet').onclick = () => { SFX.click(); dlg('set', true); }; $('setOk').onclick = () => { SFX.click(); dlg('set', false); };
$('sSound').onclick = () => { Save.setSetting('sound', !Save.settings.sound); syncSet(); SFX.click(); }; $('sMusic').onclick = () => { Save.setSetting('music', !Save.settings.music); syncSet(); }; $('sDpad').onclick = () => { Save.setSetting('dpad', !Save.settings.dpad); syncSet(); if (playing) applyPad(); };
$('sReset').onclick = () => { if (confirm('Wirklich den gesamten Fortschritt löschen?')) { Save.reset(); syncSet(); renderMenuStat(); dlg('set', false); } };
syncSet();

// ---------------------------------------------------------------- Schleife
function resize() { view.resize(innerWidth, innerHeight); if (playing) applyPad(); } addEventListener('resize', resize); resize();
let last = performance.now(); (function loop(n) { requestAnimationFrame(loop); const dt = Math.min(0.05, (n - last) / 1000) * (window.__ffwd || 1); last = n; if (!editorOn) { session.update(); view.tick(dt); if (playing && t0 && !tEnd && n - lastClock > 200) { lastClock = n; $('cTime').textContent = '⏱ ' + fmtT((n - t0) / 1000); } } })(last);
document.addEventListener('pointerdown', () => { Audio_.unlock(); if (!playing) Music.play('menu'); }, { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) Music.setOn(false); else Music.setOn(Save.settings.music); });
window.__wobbel = { ed, startCustom, view, get session() { return session; }, LEVELS, Save, startLevel, toMenu };
const sharedCode = new URLSearchParams(location.search).get('code'), u = new URLSearchParams(location.search).get('level');
if (sharedCode) { try { const d = decode(sharedCode); curIdx = 0; toMenu(); startCustom(d, { onExit: () => { history.replaceState(null, '', location.pathname); toMenu(); } }); toast(`„${d.name}" – geteiltes Level`, 3500); } catch (e) { toMenu(); toast(e.message, 5000); } }
else if (u) startLevel(+u - 1); else { curIdx = Math.min(Save.settings.last || 0, LEVELS.length - 1); toMenu(); if (!Save.level(0)) setTimeout(() => dlg('how', true), 600); }
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
