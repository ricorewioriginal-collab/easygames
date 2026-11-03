// Leuchtfeuer – Ablauf, Menüs, Geschichte, Spiele, Buch; Steuerung per Tastatur, Touch und Controller (../gamepad.js)
import './style.css';
import * as C from './core.js';
import * as EN from './engine.js';
import { scene, pose, talkCam, fig, faceEach, place, W } from './world.js';
import * as A from './audio.js';
import * as Beam from './games/beam.js';
import * as Poster from './games/poster.js';
import * as Booth from './games/booth.js';
import * as Run from './games/run.js';

const $ = id => document.getElementById(id);
const PI = Math.PI;
const KEY = 'lf-save', RK = 'lf-read';
const LS = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
let S = C.fixSave(LS.get(KEY));
const save = () => LS.set(KEY, S);
const touch = matchMedia('(pointer: coarse)').matches;
const embedded = (() => { try { return top !== self; } catch (e) { return true; } })();
A.setOpt(S.opt);
['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => A.unlock(), { capture: true, once: false, passive: true }));

// ------------------------------------------------------------ Bildschirme
let screen = 'sLoad';
function go(id) {
  document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); screen = id;
  const f = $(id).querySelector('.nav:not([hidden]), .chip'); if (f && !touch) setTimeout(() => { if (screen === id) f.focus({ preventScroll: true }); }, 40);
}
function toast(t, ms = 2200) { if (!t) return; const e = $('toast'); e.textContent = t; e.hidden = false; e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; clearTimeout(toast.h); toast.h = setTimeout(() => e.hidden = true, ms); }
const fade = async (fn) => { $('fade').classList.add('on'); await new Promise(r => setTimeout(r, 360)); await fn(); $('fade').classList.remove('on'); };
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ------------------------------------------------------------ Leuchtkraft
const story = { i: 0, step: 0, glow: C.GLOW_START, phase: 'idle', active: false };
function setGlow(v) { story.glow = C.clampGlow(v); const p = C.glowPct(story.glow); $('glowFill').style.width = p + '%'; $('glowTxt').textContent = '🔆 Leuchtkraft ' + p + ' %'; }

// ------------------------------------------------------------ Geschichte
const SPK = id => (C.PEOPLE[id] && C.PEOPLE[id].name) || '';
const chap = () => C.CHAPTERS[story.i];
const flow = () => C.FLOW[story.i].flow;
async function chapter(i) {
  story.i = i; story.step = 0; story.active = true; const c = chap(); setGlow(story.glow); document.querySelector('#sStory .meter').hidden = false;
  $('chapLbl').textContent = (/^\d/.test(c.n) ? 'Kapitel ' + c.n : c.n) + ' · ' + c.title;
  $('choices').innerHTML = ''; $('line').textContent = '…'; $('who').hidden = true; $('xhud').hidden = true; $('bSolve').hidden = true;
  go('sStory'); $('talk').hidden = false; story.phase = 'busy';
  await fade(() => scene(c.set, c.cast, { ch: +c.n || 0, winter: !!c.winter, night: !!c.night, fog: !!c.fog }));
  A.ambient(ambFor(c.set, c)); A.music(c.night || c.fog || c.set === 'aula' ? 'nacht' : c.n === '15' ? 'hell' : 'ruhig');
  S.story.resume = { i, glow: story.glow }; save();
  runStep();
}
function ambFor(set, c) { return { kap: 'wind', strand: 'feuer', deich: 'wind', markt: 'meer', halle: 'halle', aula: 'sturm', schule: c && c.n === '4' ? 'regen' : 'wind' }[set] || 'innen'; }
function runStep() {
  const c = chap(), f = flow(), part = f[story.step];
  if (!part) { nextChapter(); return; }
  if (part === 'lines' || part === 'after') { story.phase = part; story.li = 0; story.lines = part === 'lines' ? c.lines : c.after; $('talk').hidden = false; showLine(); return; }
  if (part === 'choices') { story.phase = 'choice'; $('talk').hidden = false; renderChoices(c); return; }
  if (part === 'explore') { startExplore(c); return; }
  if (part === 'game') { $('talk').hidden = true; openIntro(c.game.k, { story: true, lvl: c.game.lvl, line: c.gameLine }); return; }
}
function stepDone() { story.step++; runStep(); }
function showLine() {
  const L = story.lines[story.li], who = L[0];
  $('who').hidden = !who; $('who').textContent = SPK(who);
  $('line').textContent = L[1]; $('line').classList.toggle('narr', !who); $('nextHint').hidden = false; $('choices').innerHTML = '';
  talkCam(who || null);
  if (who) pose(who, 'yes', { once: true, speed: 0.55 });
}
function advance() {
  if (screen !== 'sStory') return;
  if (story.phase === 'examine') { story.phase = story.backTo || 'explore'; $('talk').hidden = true; return; }
  if (story.phase === 'lines' || story.phase === 'after') {
    if (story.li < story.lines.length - 1) { story.li++; showLine(); A.sfx('next'); return; }
    stepDone(); return;
  }
  if (story.phase === 'reply') { stepDone(); return; }
}
function renderChoices(c) {
  $('nextHint').hidden = true; $('who').hidden = true; $('line').textContent = c.choices.length ? 'Was tust du?' : ''; $('line').classList.add('narr');
  const box = $('choices'); box.innerHTML = '';
  c.choices.forEach((ch, k) => { const b = document.createElement('button'); b.className = 'chip nav'; b.textContent = ch.t; b.onclick = e => { e.stopPropagation(); choose(k); }; box.appendChild(b); });
  if (!touch) box.firstChild.focus();
  talkCam(null);
}
function choose(k) {
  if (story.phase !== 'choice') return; const ch = chap().choices[k];
  story.phase = 'reply'; setGlow(story.glow + ch.g); A.sfx('choice');
  $('choices').innerHTML = ''; $('who').hidden = true; $('line').textContent = ch.r; $('line').classList.add('narr'); $('nextHint').hidden = false;
  if (ch.g >= 8) { const pl = chap().player; pose(pl, 'yes', { once: true }); }
}
function nextChapter() {
  if (chap().end) { endStory(); return; }
  if (story.i < C.CHAPTERS.length - 1) chapter(story.i + 1); else endStory();
}
function startStory(fresh) {
  A.ac();
  if (fresh || !S.story.resume) { setGlow(C.GLOW_START); chapter(0); }
  else { setGlow(S.story.resume.glow); chapter(S.story.resume.i); }
}
function endStory() {
  story.active = false; const pct = C.glowPct(story.glow), e = C.ending(pct);
  S.story.done++; S.glowBest = Math.max(S.glowBest, pct); if (!S.story.endings.includes(e.id)) S.story.endings.push(e.id); S.story.resume = null; save();
  $('endTitle').textContent = e.title; $('endText').textContent = e.text; $('endGlow').textContent = '🔆 Leuchtkraft am Ende: ' + pct + ' %';
  go('sEnd'); A.music('hell'); A.sfx('win'); menuInfo();
}
function storyPause() { endExplore(); if (story.active) { S.story.resume = { i: story.i, glow: story.glow }; save(); } toMenu(); }

// ------------------------------------------------------------ Erkunden (Geschichte und Pias Fall)
const keys = {};
let caseRun = null;
function startExplore(c, hotOverride) {
  story.phase = 'explore'; $('talk').hidden = true; $('xhud').hidden = false; $('obj').textContent = c.obj || '';
  const pl = fig(c.player), meta = C.FLOW[story.i] || {}, followers = (meta.follow || []).map(fig).filter(Boolean);
  const hot = hotOverride || (W.data.hot || []).map(h => Object.assign({}, h, { goal: h.id === c.goal }));
  const gl = hot.find(h => h.goal), pp = pl.root.position;
  EN.explore({ player: pl, hot, followers, yaw: gl ? Math.atan2(pp.x - gl.x, pp.z - gl.z) : undefined }); EN.markAt(gl || null);
  $('joy').hidden = !touch; $('act').hidden = !touch;
}
function endExplore() { EN.exploreOff(); EN.markAt(null); EN.move(0, 0, false); $('xhud').hidden = true; $('prompt').hidden = true; $('joy').hidden = true; $('act').hidden = true; $('bSolve').hidden = true; }
function interact() {
  if (screen !== 'sStory' || story.phase !== 'explore') return false;
  const h = EN.X.near; if (!h) return false;
  if (caseRun) { caseClue(h); return true; }
  if (h.goal) { reachGoal(h); return true; }
  if (h.t) { story.phase = 'examine'; story.backTo = 'explore'; EN.move(0, 0, false); $('prompt').hidden = true; $('talk').hidden = false; $('choices').innerHTML = ''; $('who').hidden = true; $('line').textContent = h.t; $('line').classList.add('narr'); $('nextHint').hidden = false; A.sfx('tick'); return true; }
  return false;
}
async function reachGoal(h) {
  const c = chap(); endExplore(); story.phase = 'busy';
  await fade(async () => {
    const gs = (W.data.goalSpot || {})[h.id]; if (gs) place(c.player, gs[0], gs[1], gs[2]);
    const meta = C.FLOW[story.i] || {}; (meta.follow || []).forEach((id, k) => { if (gs) place(id, gs[0] + Math.cos(gs[2] + PI / 2) * (0.9 + k * 0.6), gs[1] - Math.sin(gs[2] + PI / 2) * (0.9 + k * 0.6), gs[2]); });
    if (meta.follow && meta.follow[0]) faceEach(c.player, meta.follow[0]);
    EN.camSnap(EN.E.cam.position.clone(), EN.E.camLookCur.clone());
  });
  A.sfx('clue'); stepDone();
}
function moveFromKeys() {
  if (screen !== 'sStory' || story.phase !== 'explore' || joy.id != null) return;
  const x = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), z = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  const n = Math.hypot(x, z) || 1; EN.move(x / n, z / n, !!(keys.ShiftLeft || keys.ShiftRight));
  EN.turnCam((keys.KeyE ? 1 : 0) - (keys.KeyQ ? 1 : 0));
}
function promptTick() {
  if (screen !== 'sStory' || story.phase !== 'explore') { $('prompt').hidden = true; return; }
  const h = EN.X.near, lbl = h ? (caseRun ? caseLabel(h) : h.l || 'Ansehen') : '';
  if (touch) { $('act').disabled = !h; $('act').textContent = h ? lbl : '●'; return; }
  $('prompt').hidden = !h; if (h) $('prompt').innerHTML = '<b>Enter</b>' + esc(lbl) + (h.goal ? ' ★' : '');
}
const joy = { id: null, cx: 0, cy: 0 };
$('joy').addEventListener('pointerdown', e => { e.preventDefault(); const r = $('joy').getBoundingClientRect(); joy.id = e.pointerId; joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2; $('joy').setPointerCapture(e.pointerId); joyMove(e); });
$('joy').addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.id = null; $('joyKnob').style.transform = ''; EN.move(0, 0, false); };
$('joy').addEventListener('pointerup', joyEnd); $('joy').addEventListener('pointercancel', joyEnd);
function joyMove(e) { let dx = e.clientX - joy.cx, dy = e.clientY - joy.cy; const d = Math.hypot(dx, dy), max = 52; if (d > max) { dx *= max / d; dy *= max / d; } $('joyKnob').style.transform = `translate(${dx}px,${dy}px)`; EN.move(dx / max, dy / max, d > max * 0.95); }
$('act').addEventListener('pointerdown', e => { e.preventDefault(); interact(); });

// ------------------------------------------------------------ Pia ermittelt (Fall 14)
function caseLabel(h) { const cl = C.CLUES.find(c => c.at === h.id); return caseRun.found.includes(cl.id) ? 'Schon notiert' : cl.l; }
async function startCase(fromStory) {
  caseRun = C.newCase(); caseRun.story = fromStory; story.active = fromStory;
  if (!fromStory) { $('chapLbl').textContent = 'Fall 14 · Pia ermittelt'; }
  document.querySelector('#sStory .meter').hidden = !fromStory;
  go('sStory'); $('talk').hidden = true; story.phase = 'busy';
  await fade(() => scene('kueche', ['pia']));
  A.ambient('innen'); A.music('spiel');
  const hot = C.CLUES.map(cl => { const h = W.data.hot.find(x => x.id === cl.at); return Object.assign({}, h, { l: cl.l }); });
  startExplore({ player: 'pia', obj: 'Finde mindestens vier Beweise in Küche und Flur. Dann: Fall lösen.' }, hot);
  caseInfo();
}
function caseInfo() { $('xinfo').hidden = false; $('xinfo').textContent = '🔍 Beweise ' + caseRun.found.length + ' / ' + C.CLUES.length; $('bSolve').hidden = !C.caseReady(caseRun); }
function caseClue(h) {
  const cl = C.CLUES.find(c => c.at === h.id); const isNew = C.caseFind(caseRun, cl.id);
  if (isNew && !S.clues.includes(cl.id)) { S.clues.push(cl.id); save(); }
  story.phase = 'examine'; story.backTo = 'explore'; EN.move(0, 0, false); $('talk').hidden = false; $('who').hidden = false; $('who').textContent = 'Pias Detektiv-Tagebuch';
  $('line').textContent = cl.t; $('line').classList.remove('narr'); $('choices').innerHTML = ''; $('nextHint').hidden = false; A.sfx(isNew ? 'clue' : 'tick'); caseInfo();
  if (isNew && caseRun.found.length === 4) toast('Genug Beweise! Du kannst den Fall jetzt lösen – oder weitersuchen.', 3200);
}
function caseSolve() {
  if (!caseRun || !C.caseReady(caseRun)) return; endExplore(); story.phase = 'caseVerdict';
  $('talk').hidden = false; $('who').hidden = false; $('who').textContent = 'Pia'; $('line').textContent = 'Zeit für die Auflösung. Was ist der Tatbestand?'; $('line').classList.remove('narr'); $('nextHint').hidden = true;
  const box = $('choices'); box.innerHTML = '';
  C.VERDICTS.forEach((v, k) => { const b = document.createElement('button'); b.className = 'chip nav'; b.textContent = v.t; b.onclick = e => { e.stopPropagation(); verdict(k); }; box.appendChild(b); });
  if (!touch) box.firstChild.focus();
}
function verdict(k) {
  const v = C.caseVerdict(caseRun, k); $('choices').innerHTML = ''; $('line').textContent = v.r; $('nextHint').hidden = false;
  if (v.ok) { A.sfx('win'); pose('pia', 'yes', { once: true }); story.phase = 'caseDone'; }
  else { A.sfx('wrong'); story.phase = 'caseRetry'; }
}
function caseAdvance() {
  if (story.phase === 'caseRetry') { caseSolve(); return true; }
  if (story.phase === 'caseDone') {
    const r = { score: C.caseScore(caseRun), stars: C.caseStars(caseRun), rows: [['Beweise', caseRun.found.length + ' / ' + C.CLUES.length], ['Falsche Lösungen', caseRun.wrongs]] };
    const fromStory = caseRun.story; caseRun = null; $('xinfo').hidden = true;
    gameOver('case', 0, r, fromStory); return true;
  }
  return false;
}

// ------------------------------------------------------------ Spiele
const GAMES = {
  beam: { name: 'Leuchtturm', mod: Beam, eye: 'Briefe in Flaschen', text: 'Du bist Anselm, der Leuchtturmwärter. Dreh den Lichtstrahl über das Meer: Bleibt eine Flaschenpost kurz im Licht, gehört ihr Brief dir. Kutter brauchen etwas länger Licht, um sicher heimzufinden.',
    keys: ['PC: ← → oder A D (auch Maus bewegen), Leertaste = Lichtblitz', 'Handy: übers Bild wischen, 🔆 = Lichtblitz', 'Controller: Stick links/rechts, A oder X = Lichtblitz'], levels: () => C.BEAM_LEVELS.map(l => l.name), best: 'beam' },
  poster: { name: 'Sturmnacht-Plakat', mod: Poster, eye: 'Dreißig Zentimeter', text: 'Finns feine Linien, Bens wilde Wellen: Tausche immer zwei Teile, bis das Plakat stimmt. In den großen Stufen sind manche Teile auch gedreht.',
    keys: ['PC: Pfeile wählen, Enter nehmen/tauschen, Leertaste drehen', 'Handy: Teil antippen, dann das Ziel antippen; gewähltes Teil nochmal antippen = drehen', 'Controller: Steuerkreuz, A tauschen, X drehen'], levels: () => C.POSTER_LEVELS.map(l => l.name + ' ' + l.cols + '×' + l.rows), best: 'poster' },
  booth: { name: 'Zwei mit Zwiebeln', mod: Booth, eye: 'Albrecht am Hafen, seit 1974', text: 'Die Kundschaft sagt, was sie will. Leg den richtigen Fisch aufs Brötchen (zweimal antippen = zwei Brötchen), Zwiebeln ja oder nein – und ausgeben. Wer schnell ist, bekommt Trinkgeld.',
    keys: ['PC: Q Lachs, F Matjes, E Makrele, Leertaste Zwiebeln, Enter ausgeben, ⌫ neu', 'Handy: die Knöpfe unten antippen', 'Controller: LB Lachs, Y Matjes, RB Makrele, X Zwiebeln, A ausgeben, Select neu'], levels: () => C.BOOTH_LEVELS.map(l => l.name), best: 'booth' },
  run: { name: 'Gegenwind', mod: Run, eye: 'Lauf über den Deich', text: 'Drei Spuren, Regen und Wind: Spring über Treibgut und Pfützen, duck dich unter Möwen weg, lauf um Wellen und Bänke herum. Sammle die Laternenlichter. Drei Herzen hast du.',
    keys: ['PC: ← → Spur, ↑ oder Leertaste springen, ↓ ducken', 'Handy: wischen – links/rechts Spur, hoch springen, runter ducken, tippen springen', 'Controller: Stick/Steuerkreuz, A springen, ↓ ducken'], levels: () => C.RUN_LEVELS.map(l => l.name), best: 'run' },
  case: { name: 'Pia ermittelt', eye: 'Fall 14', text: 'Pia Albrecht, zwölf Jahre und fünf Monate, Detektivin. Hauptverdächtiger: ihr Bruder. Durchsuche Küche und Flur, sammle mindestens vier Beweise und löse den Fall.',
    keys: ['PC: W A S D laufen, Enter untersuchen, Q/E Kamera', 'Handy: Joystick und Knopf', 'Controller: linker Stick, A untersuchen, rechter Stick Kamera'], levels: () => ['Fall 14'], best: 'case' }
};
let pending = null, game = null, gk = null, paused = false;
function bestOf(k, i) { return k === 'case' ? S.best.case : (S.best[k] || [])[i] || 0; }
function openIntro(k, o = {}) {
  const G = GAMES[k]; pending = { k, lvl: o.lvl || 0, story: !!o.story };
  $('inEye').textContent = o.story ? (/^\d/.test(chap().n) ? 'Kapitel ' + chap().n : chap().n) + ' · ' + G.name : G.eye; $('inTitle').textContent = G.name;
  $('inText').textContent = o.line || G.text; $('inKeys').innerHTML = G.keys.map(t => `<li>${esc(t)}</li>`).join('');
  const seg = $('inLevels'); seg.innerHTML = '';
  if (!o.story) {
    G.levels().forEach((name, i) => { const b = document.createElement('button'); b.className = 'nav' + (i === pending.lvl ? ' on' : ''); const best = bestOf(k, i); b.innerHTML = esc(name) + `<small>${best ? '★ ' + best.toLocaleString('de-DE') : '–'}</small>`; b.onclick = () => { pending.lvl = i; [...seg.children].forEach((x, j) => x.classList.toggle('on', j === i)); }; seg.appendChild(b); });
  }
  $('bInBack').hidden = !!o.story; go('sIntro');
}
async function startGame() {
  const p = pending; if (!p) return; A.ac();
  if (p.k === 'case') { startCase(p.story); return; }
  const G = GAMES[p.k]; gk = p.k; paused = false;
  go('sGame'); $('gName').textContent = G.name; ['ctlBeam', 'ctlPoster', 'ctlBooth'].forEach(id => $(id).hidden = true); $('gProg').hidden = p.k !== 'run'; $('letter').hidden = true; $('say').hidden = true; $('bubbles').innerHTML = '';
  $('gHint').textContent = touch ? { beam: 'Übers Bild wischen, um den Strahl zu drehen', poster: 'Teil antippen, dann Ziel antippen', booth: '', run: 'Wischen: ← → Spur · ↑ springen · ↓ ducken' }[p.k] : { beam: '← → drehen · Leertaste Lichtblitz', poster: 'Pfeile · Enter tauschen' + (C.POSTER_LEVELS[p.lvl].rot ? ' · Leertaste drehen' : ''), booth: '', run: '← → Spur · ↑/Leertaste springen · ↓ ducken' }[p.k];
  const ctx = {
    lvl: p.lvl, diff: S.opt.diff, story: p.story, who: p.story ? (C.FLOW[story.i].runner || chap().player) : 'finn',
    paused: () => paused, sfx: A.sfx, toast,
    hud: h => { $('gTime').textContent = typeof h.time === 'number' ? fmtT(h.time, p.k) : h.time; $('gScore').textContent = (h.score || 0).toLocaleString('de-DE'); $('gA').textContent = h.a || ''; $('gB').textContent = h.b || ''; if (h.prog != null) $('gProgI').style.width = Math.min(100, h.prog * 100) + '%'; if (p.k === 'beam') $('bFlash').disabled = !h.flash; if (h.made) madeTxt(h.made); },
    letter: (t, i) => { if (!S.letters.includes(i)) { S.letters.push(i); save(); } const e = $('letter'); e.innerHTML = '<b>Flaschenpost</b>' + esc(t); e.hidden = false; e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; clearTimeout(ctx.lt); ctx.lt = setTimeout(() => e.hidden = true, 3800); },
    say: (t, good) => { const e = $('say'); e.textContent = t; e.className = 'say ' + (good ? 'good' : 'bad'); e.hidden = false; clearTimeout(ctx.st); ctx.st = setTimeout(() => e.hidden = true, 2000); },
    bubbles: list => renderBubbles(list),
    end: r => gameOver(p.k, p.lvl, r, p.story)
  };
  A.music('spiel');
  game = null;
  await fade(async () => { game = await G.mod.start(ctx); });
  A.ambient(p.k === 'beam' ? 'meer' : p.k === 'run' ? (C.RUN_LEVELS[p.lvl].weather === 'storm' ? 'sturm' : C.RUN_LEVELS[p.lvl].weather === 'rain' ? 'regen' : 'wind') : 'innen');
  $('ctlBeam').hidden = p.k !== 'beam'; $('ctlPoster').hidden = p.k !== 'poster' || !C.POSTER_LEVELS[p.lvl].rot; $('ctlBooth').hidden = p.k !== 'booth';
}
const fmtT = (t, k) => k === 'poster' ? Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') : '⏱ ' + t;
function madeTxt(m) { const f = m.fish ? C.FISH.find(x => x.id === m.fish).name : null; $('made').textContent = f ? (m.count === 2 ? '2× ' : '') + f + (m.onion ? ' mit Zwiebeln' : ' ohne Zwiebeln') : 'Leeres Brötchen – wähl einen Fisch'; }
function renderBubbles(list) {
  const box = $('bubbles'); const have = new Map([...box.children].map(e => [e.dataset.id, e]));
  for (const b of list) {
    let e = have.get(String(b.id)); if (!e) { e = document.createElement('div'); e.className = 'bub'; e.dataset.id = b.id; box.appendChild(e); } have.delete(String(b.id));
    e.classList.toggle('first', b.first); e.style.left = (b.x * 100) + '%'; e.style.top = (b.y * 100) + '%';
    const html = esc(b.text) + `<i style="width:${Math.round(b.pat * 100)}%;background:${b.pat > 0.5 ? '#3aa35a' : b.pat > 0.25 ? '#e0a030' : '#d04040'}"></i>`; if (e._h !== html) { e.innerHTML = html; e._h = html; }
  }
  for (const e of have.values()) e.remove();
}
function gameOver(k, lvl, r, fromStory) {
  if (game) { game.stop(); game = null; }
  renderBubbles([]);
  const best = k === 'case' ? r.score > S.best.case : r.score > (S.best[k][lvl] || 0);
  if (best) { if (k === 'case') S.best.case = r.score; else S.best[k][lvl] = r.score; }
  save();
  $('resTitle').textContent = r.lost ? 'Fast geschafft!' : r.stars >= 3 ? 'Großartig!' : r.stars >= 1 ? 'Geschafft!' : 'Weiter üben!';
  $('resStars').textContent = '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
  $('resGrid').innerHTML = `<span>Punkte</span><b>${r.score.toLocaleString('de-DE')}${best ? ' 🏆' : ''}</b>` + r.rows.map(x => `<span>${esc(x[0])}</span><b>${esc(x[1])}</b>`).join('') + (fromStory ? `<span>Leuchtkraft</span><b>+${C.gameGlow(k, r.stars)}</b>` : '');
  if (fromStory) setGlow(story.glow + C.gameGlow(k, r.stars));
  $('bResNext').textContent = fromStory ? 'Weiter in der Geschichte' : 'Zum Menü';
  pending = { k, lvl, story: fromStory }; A.sfx(r.stars ? 'win' : 'sink');
  go('sResult'); menuInfo();
}
function pause(on) {
  if (screen !== 'sGame' && screen !== 'sPause') return;
  paused = on; A.suspend(on); go(on ? 'sPause' : 'sGame');
}

// ------------------------------------------------------------ Menü
function menuInfo() {
  const r = S.story.resume; $('mStory').textContent = r ? 'Weiter: ' + (/^\d/.test(C.CHAPTERS[r.i].n) ? 'Kapitel ' + C.CHAPTERS[r.i].n : C.CHAPTERS[r.i].n) + ' · ' + C.CHAPTERS[r.i].title : S.story.done ? 'Nochmal erleben · beste Leuchtkraft ' + S.glowBest + ' %' : 'Finns Jahr in 16 Kapiteln';
  const st = (k) => { const b = Math.max(...S.best[k]); return b ? 'Rekord ' + b.toLocaleString('de-DE') : null; };
  $('mBeam').textContent = st('beam') || 'Briefe in Flaschen'; $('mPoster').textContent = st('poster') || 'Dreißig Zentimeter'; $('mBooth').textContent = st('booth') || 'Fischbrötchen-Theke'; $('mRun').textContent = st('run') || 'Lauf über den Deich';
  $('mCase').textContent = S.best.case ? 'Gelöst · ' + S.best.case.toLocaleString('de-DE') : 'Fall 14'; $('mLetters').textContent = S.letters.length + ' von ' + C.LETTERS.length + ' Briefen';
  $('menuGlow').textContent = '🔆 Beste Leuchtkraft ' + (S.glowBest || 0) + ' %';
  const rd = LS.get(RK); if (rd && rd.s > 1) $('mRead').textContent = 'Weiterlesen';
}
let menuBusy = false;
async function menuScene() {
  if (menuBusy) return; menuBusy = true;
  try { await scene('strand', ['finn', 'ben'], { beamOn: true, sky: 'night', spots: { finn: [-1.6, -3.4, -2.3], ben: [-0.8, -3.1, -2.35] }, cam: { pos: [0.9, 1.45, 0.4], look: [-40, 7, -72] } }); } catch (e) { console.warn(e); }
  menuBusy = false; A.ambient('meer'); A.music('ruhig');
  const b = fig('ben'); if (b) b.root.rotation.y = -2.5;
}
function toMenu() { story.active = false; caseRun = null; if (game) { game.stop(); game = null; } paused = false; A.suspend(false); go('sMenu'); menuInfo(); menuScene(); }
function openRec() {
  const E = { feuer: 'Leuchtfeuer', fenster: 'Ein Licht im Fenster', strahl: 'Ein erster Strahl' };
  let h = '<span class="sec">Geschichte</span>' + `<span>Erlebt</span><b>${S.story.done}×</b><span>Beste Leuchtkraft</span><b>${S.glowBest} %</b>` + Object.keys(E).map(k => `<span>Ende „${E[k]}“</span><b>${S.story.endings.includes(k) ? '✓' : '–'}</b>`).join('');
  h += '<span class="sec">Leuchtturm</span>' + C.BEAM_LEVELS.map((l, i) => `<span>${esc(l.name)}</span><b>${(S.best.beam[i] || 0).toLocaleString('de-DE')}</b>`).join('');
  h += '<span class="sec">Plakat</span>' + C.POSTER_LEVELS.map((l, i) => `<span>${esc(l.name)}</span><b>${(S.best.poster[i] || 0).toLocaleString('de-DE')}</b>`).join('');
  h += '<span class="sec">Zwei mit Zwiebeln</span>' + C.BOOTH_LEVELS.map((l, i) => `<span>${esc(l.name)}</span><b>${(S.best.booth[i] || 0).toLocaleString('de-DE')}</b>`).join('');
  h += '<span class="sec">Gegenwind</span>' + C.RUN_LEVELS.map((l, i) => `<span>${esc(l.name)}</span><b>${(S.best.run[i] || 0).toLocaleString('de-DE')}</b>`).join('');
  h += `<span class="sec">Pia ermittelt</span><span>Fall 14</span><b>${(S.best.case || 0).toLocaleString('de-DE')}</b><span>Beweise je gefunden</span><b>${S.clues.length} / ${C.CLUES.length}</b><span>Flaschenpost-Briefe</span><b>${S.letters.length} / ${C.LETTERS.length}</b>`;
  $('recGrid').innerHTML = h; go('sRec');
}
function openLetters() { $('lettersBox').innerHTML = C.LETTERS.map((t, i) => S.letters.includes(i) ? `<p>„${esc(t)}“</p>` : `<p class="no">✉️ Brief ${i + 1} – noch im Meer</p>`).join(''); go('sLetters'); }
function openOpts() { $('oSfx').checked = S.opt.sfx; $('oMus').checked = S.opt.music; $('oDiff').value = S.opt.diff; $('oQ').value = S.opt.quality; go('sOpts'); }
$('oSfx').onchange = e => { S.opt.sfx = e.target.checked; save(); A.setOpt(S.opt); };
$('oMus').onchange = e => { S.opt.music = e.target.checked; save(); A.setOpt(S.opt); };
$('oDiff').onchange = e => { S.opt.diff = e.target.value; save(); };
$('oQ').onchange = e => { S.opt.quality = e.target.value; save(); toast('Gilt nach dem nächsten Start.'); };

// ------------------------------------------------------------ Buch lesen (book.json mit Illustrationen)
let book = null, rs = LS.get(RK) || { s: 1, y: 0, f: 19 };
const rSave = () => LS.set(RK, rs);
async function openRead() {
  go('sRead'); $('page').style.setProperty('--rf', rs.f + 'px');
  if (!book) { $('page').innerHTML = '<p class="first">Das Buch wird geladen …</p>'; try { book = await (await fetch('book.json')).json(); } catch (e) { $('page').innerHTML = '<p class="first">Das Buch konnte nicht geladen werden. Bitte später nochmal versuchen.</p>'; return; } }
  renderToc(); readSec(rs.s, rs.y);
}
function renderToc() { $('toc').innerHTML = book.sections.map((x, i) => `<button class="nav${i === rs.s ? ' on' : ''}" data-i="${i}"><small>${esc(x.label)}</small>${esc(x.title)}</button>`).join(''); $('toc').querySelectorAll('button').forEach(b => b.onclick = () => { $('toc').hidden = true; readSec(+b.dataset.i, 0); }); }
function readSec(i, y) {
  const n = book.sections.length; i = Math.max(0, Math.min(n - 1, i)); rs.s = i; const x = book.sections[i], imgs = (x.img || []).slice();
  let first = true, out = `<p class="lab">${esc(x.label)}</p><h2>${esc(x.title)}</h2>` + (imgs.length ? `<img src="img/${imgs.shift()}" alt="" loading="lazy">` : '');
  const at = imgs.length ? Math.floor(x.p.length * 0.6) : -1;
  x.p.forEach((t, k) => { if (k === at) out += `<img src="img/${imgs.shift()}" alt="" loading="lazy">`; if (t === '∗ ∗ ∗') { out += '<p class="sep">∗ ∗ ∗</p>'; return; } out += `<p${first ? ' class="first"' : ''}>${esc(t)}</p>`; first = false; });
  out += `<div class="endCh">${i < n - 1 ? '<button class="press nav" id="bNextIn">Weiter: ' + esc(book.sections[i + 1].title) + '</button>' : '— Ende —'}</div>`;
  $('page').innerHTML = out; const nb = $('bNextIn'); if (nb) nb.onclick = () => readSec(i + 1, 0);
  $('rLbl').textContent = x.label + ' · ' + x.title; $('rProg').textContent = (i + 1) + ' / ' + n; $('bPrevCh').disabled = i === 0; $('bNextCh').disabled = i === n - 1;
  requestAnimationFrame(() => { $('page').scrollTop = y || 0; if (!touch) $('page').focus({ preventScroll: true }); });
  rSave(); renderToc(); $('mRead').textContent = 'Weiterlesen: ' + x.title; A.sfx('page');
}
$('page').addEventListener('scroll', () => { rs.y = $('page').scrollTop; clearTimeout(rSave.t); rSave.t = setTimeout(rSave, 300); }, { passive: true });
$('bToc').onclick = () => { $('toc').hidden = !$('toc').hidden; if (!$('toc').hidden) { const b = $('toc').querySelector('.on'); if (b) b.focus(); } };
$('bReadBack').onclick = () => { $('toc').hidden = true; go('sMenu'); menuInfo(); };
$('bPrevCh').onclick = () => readSec(rs.s - 1, 0); $('bNextCh').onclick = () => readSec(rs.s + 1, 0);
$('bFontP').onclick = () => { rs.f = Math.min(30, rs.f + 2); $('page').style.setProperty('--rf', rs.f + 'px'); rSave(); };
$('bFontM').onclick = () => { rs.f = Math.max(14, rs.f - 2); $('page').style.setProperty('--rf', rs.f + 'px'); rSave(); };

// ------------------------------------------------------------ Knöpfe
document.querySelectorAll('.tile').forEach(t => t.onclick = () => {
  const g = t.dataset.go; A.ac();
  if (g === 'story') startStory(false); else if (GAMES[g]) openIntro(g); else if (g === 'read') openRead(); else if (g === 'letters') openLetters(); else if (g === 'rec') openRec(); else if (g === 'opts') openOpts(); else if (g === 'help') go('sHelp');
});
document.querySelectorAll('.back2').forEach(b => b.onclick = () => { go('sMenu'); menuInfo(); });
$('bPress').onclick = () => { A.ac(); A.music('ruhig'); go('sMenu'); menuInfo(); };
$('talk').onclick = () => { if (!caseAdvance()) advance(); };
$('bStoryMenu').onclick = e => { e.stopPropagation(); storyPause(); };
$('bSolve').onclick = () => caseSolve();
$('bGo').onclick = () => startGame();
$('bInBack').onclick = () => { go('sMenu'); menuInfo(); };
$('bPause').onclick = () => pause(true); $('bResume').onclick = () => pause(false);
$('bRestart').onclick = () => { if (game) { game.stop(); game = null; } paused = false; A.suspend(false); startGame(); };
$('bQuit').onclick = () => { if (pending && pending.story) { story.active && (S.story.resume = { i: story.i, glow: story.glow }, save()); } toMenu(); };
$('bResNext').onclick = () => { if (pending && pending.story) { go('sStory'); $('talk').hidden = false; story.phase = 'busy'; resumeAfterGame(); } else toMenu(); };
$('bResAgain').onclick = () => startGame();
$('bEndMenu').onclick = () => toMenu(); $('bEndAgain').onclick = () => startStory(true);
$('bFlash').onpointerdown = e => { e.preventDefault(); game && game.flash && game.flash(); };
$('bRot').onpointerdown = e => { e.preventDefault(); game && game.rotate && game.rotate(); };
document.querySelectorAll('#ctlBooth [data-a]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); game && game.act && game.act(b.dataset.a); }));
if (embedded) document.querySelectorAll('.back').forEach(a => a.hidden = true);
async function resumeAfterGame() {
  const c = chap(); await fade(() => scene(c.set, c.cast, { ch: +c.n || 0, winter: !!c.winter, night: !!c.night, fog: !!c.fog }));
  A.ambient(ambFor(c.set, c)); A.music('ruhig'); stepDone();
}

// ------------------------------------------------------------ Zeiger auf der 3D-Fläche (Spiele, Kamera drehen)
const cv = $('cv'); const drag = { id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0 };
cv.addEventListener('pointerdown', e => {
  drag.id = e.pointerId; drag.x = drag.sx = e.clientX; drag.y = drag.sy = e.clientY; drag.t = performance.now();
  if (screen === 'sGame' && game) game.pointer('down', e.clientX / innerWidth, e.clientY / innerHeight);
});
addEventListener('pointermove', e => {
  if (screen === 'sGame' && game && (e.pointerId === drag.id || (e.pointerType === 'mouse' && gk === 'beam'))) game.pointer('move', e.clientX / innerWidth, e.clientY / innerHeight);
  if (e.pointerId === drag.id && screen === 'sStory' && story.phase === 'explore') { EN.turnBy(-(e.clientX - drag.x) * 0.008); }
  if (e.pointerId === drag.id) { drag.x = e.clientX; drag.y = e.clientY; }
});
addEventListener('pointerup', e => {
  if (e.pointerId !== drag.id) return; drag.id = null;
  if (screen === 'sGame' && game) { game.pointer('up', e.clientX / innerWidth, e.clientY / innerHeight); if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 14 && performance.now() - drag.t < 450) game.pointer('tap', e.clientX / innerWidth, e.clientY / innerHeight); }
});

// ------------------------------------------------------------ Tastatur (Controller kommt über gamepad.js als Tasten)
function spatial(code) {
  const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[code]; if (!dir) return false;
  const list = [...$(screen).querySelectorAll('button, a.nav, select, input')].filter(b => b.offsetParent && !b.disabled && !b.hidden && !b.closest('[hidden]'));
  if (!list.length) return false; const cur = document.activeElement; if (!list.includes(cur)) { list[0].focus(); return true; }
  const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let best = null, bs = 1e9;
  for (const b of list) { if (b === cur) continue; const q = b.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy; const along = dx * dir[0] + dy * dir[1]; if (along <= 4) continue; const side = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]); const sc = along + side * 2.2; if (sc < bs) { bs = sc; best = b; } }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); } return true;
}
addEventListener('keyup', e => { keys[e.code] = false; moveFromKeys(); if (screen === 'sGame' && game) game.key(e.code, false); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; moveFromKeys(); });
addEventListener('keydown', e => {
  const k = e.code; if (e.target && e.target.tagName === 'SELECT' && /Arrow/.test(k)) return;
  if (screen === 'sGame' && game) {
    if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); pause(true); return; }
    if (!e.repeat && game.key(k, true)) { e.preventDefault(); return; }
    if (e.repeat && /Arrow|KeyA|KeyD|KeyQ|KeyE/.test(k) && gk === 'beam') { e.preventDefault(); return; }
    return;
  }
  if (screen === 'sPause' && (k === 'Escape' || k === 'KeyP')) { e.preventDefault(); pause(false); return; }
  if (screen === 'sStory' && story.phase === 'explore') {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyQ', 'KeyE'].includes(k)) { e.preventDefault(); keys[k] = true; moveFromKeys(); return; }
    if (k === 'Enter' || k === 'Space' || k === 'KeyF') { e.preventDefault(); if (!e.repeat) interact(); return; }
    if (caseRun && (k === 'KeyX' || k === 'Backspace' || k === 'KeyM') && C.caseReady(caseRun)) { e.preventDefault(); caseSolve(); return; }
    if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); storyPause(); return; }
    return;
  }
  if (e.repeat) return;
  if (screen === 'sTitle' && (k === 'Enter' || k === 'Space')) { e.preventDefault(); $('bPress').click(); return; }
  if (screen === 'sStory') {
    const choosing = story.phase === 'choice' || story.phase === 'caseVerdict';
    if (choosing && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); const bs = [...$('choices').children], i = bs.indexOf(document.activeElement); (bs[(i + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length] || bs[0]).focus(); return; }
    if (!choosing && (k === 'Enter' || k === 'Space')) { e.preventDefault(); if (!caseAdvance()) advance(); return; }
    if (k === 'Escape') { e.preventDefault(); storyPause(); return; }
    return;
  }
  if (screen === 'sRead') {
    const pg = $('page'), tocOpen = !$('toc').hidden;
    if (!tocOpen && (k === 'ArrowDown' || k === 'ArrowUp')) { e.preventDefault(); pg.scrollBy({ top: (k === 'ArrowDown' ? 1 : -1) * pg.clientHeight * 0.4, behavior: 'smooth' }); return; }
    if (!tocOpen && (k === 'Space' || k === 'PageDown')) { e.preventDefault(); pg.scrollBy({ top: pg.clientHeight * 0.85, behavior: 'smooth' }); return; }
    if (!tocOpen && (k === 'ArrowRight' || k === 'ArrowLeft')) { e.preventDefault(); readSec(rs.s + (k === 'ArrowRight' ? 1 : -1), 0); return; }
    if (tocOpen && (k === 'ArrowDown' || k === 'ArrowUp')) { e.preventDefault(); const bs = [...$('toc').children], i = bs.indexOf(document.activeElement); (bs[(i + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length] || bs[0]).focus(); return; }
    if (k === 'Escape') { e.preventDefault(); if (tocOpen) $('toc').hidden = true; else $('bReadBack').click(); return; }
    if (k === 'KeyM' || k === 'KeyE' || k === 'KeyQ') { e.preventDefault(); $('bToc').click(); return; }
    return;
  }
  if (k === 'Escape' && ['sRec', 'sOpts', 'sHelp', 'sLetters', 'sIntro'].includes(screen)) { e.preventDefault(); if (screen === 'sIntro' && pending && pending.story) return; go('sMenu'); menuInfo(); return; }
  if (/^Arrow/.test(k) && spatial(k)) { e.preventDefault(); return; }
});
$('menuKeys').textContent = touch ? 'Tippen zum Auswählen' : 'Pfeiltasten & Enter · Controller: Steuerkreuz & A';
addEventListener('visibilitychange', () => { if (document.hidden && screen === 'sGame') pause(true); if (document.hidden && story.active) { S.story.resume = { i: story.i, glow: story.glow }; save(); } });

// ------------------------------------------------------------ Schleife
function loop() { requestAnimationFrame(loop); if (screen === 'sStory') promptTick(); EN.frame(); }

// ------------------------------------------------------------ Start
(async function boot() {
  const tips = ['Der Wecker klingelt um sechs Uhr dreißig …', 'Jörg Albrecht heizt den Räucherofen an …', 'Lotte drängelt sich zum Schwarzen Brett …', 'Pia schreibt in ihr Detektiv-Tagebuch …', 'Anselm putzt das Laternenhaus …'];
  let ti = 0; const tipT = setInterval(() => { $('loadTip').textContent = tips[++ti % tips.length]; }, 1700);
  const bar = $('loadBar'); bar.style.width = '12%';
  try {
    if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load('700 20px Fredoka'), new Promise(r => setTimeout(r, 1500))]);
    if (!window.EasyFiguren) throw new Error('Figuren fehlen (../figuren/figuren.js)');
    await EN.init(cv, { quality: S.opt.quality }); bar.style.width = '50%';
    loop();
    await EN.preload(['finn', 'ben']); bar.style.width = '80%';
    await menuScene(); bar.style.width = '100%';
    EN.preload(['lotte', 'pia', 'joerg', 'samira', 'tobi', 'marlon']).catch(() => { });
  } catch (e) { console.error(e); clearInterval(tipT); $('loadTip').textContent = '3D konnte nicht starten: ' + (e && e.message || e); return; }
  clearInterval(tipT); go('sTitle'); $('pressTxt').textContent = touch ? 'Tippen zum Starten' : 'Drücke Start';
  menuInfo();
  if (window.EasyGamesKit && EasyGamesKit.keepAwake) try { EasyGamesKit.keepAwake(); } catch (e) { }
})();
window.LF = { go, chapter, startStory, openIntro, startGame, story, get game() { return game; }, S, C, EN, interact, caseSolve, verdict };
