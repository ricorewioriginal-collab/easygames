/* Hörerwahl – Oberfläche und Ablauf (DOM). Spiellogik: engine.js, Antwort-Erkennung: matcher.js */
import { Match, STRIKES, FINALE_GOAL } from './engine.js';
import QUESTIONS from './questions.js';
import { SFX, Audio_ } from './audio.js';
import { initStudio } from './studio.js';
import { initPair, JOIN } from './pair.js';
if (JOIN) { document.body.classList.add('ctrl'); import('./controller.js').then(m => m.startController()).catch(e => { document.getElementById('err').hidden = false; document.getElementById('errTxt').textContent = e.message; }); }

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const err = m => { $('err').hidden = false; $('errTxt').textContent = m; };
if (!QUESTIONS.length) { err('Keine Fragen gefunden.'); throw new Error('questions'); }
if (window.self !== window.top) $('backLink').hidden = true;
const studio = initStudio($('bg'));
const KEY = 'hoererwahl1', ABORT = { abort: true };
let cfg = { mode: 'duell', t1: 'Team Antenne', t2: 'Team Frequenz', rounds: 4, diff: 'normal', time: 0, finale: 1, sound: true };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const saveCfg = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
let M = null, token = 0, timerId = 0, busy = false, nextResolve = null, awaiting = false, endShown = false, finSubmit = null, finAccept = false;
const show = id => ['menu', 'setup', 'game', 'finale', 'end'].forEach(s => { $(s).hidden = s !== id; });
const sleep = async ms => { const t = token; await new Promise(r => setTimeout(r, ms * (window.__hwFast || 1))); if (t !== token) throw ABORT; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const name = t => M.teams[t].name;

// Logo (optional logo.png) + Sender-Logos im Menü
{ const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.tag').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }
$('logoRow').innerHTML = Array.from({ length: 13 }, (_, i) => `<img src="logos/${String(i + 1).padStart(2, '0')}.png" alt="" loading="lazy">`).join('');

// ---------------------------------------------------------------- Moderator
const HOST = {
  start: ['Willkommen zur Hörerwahl! 100 Hörer wurden befragt – was haben sie geantwortet?', 'Mikrofon an, Ohren auf: Die Hörerwahl beginnt!'],
  hit: ['Das steht an der Tafel!', 'Sehr gut, die Hörer sehen es genauso!', 'Treffer!', 'Genau das haben viele gesagt!'],
  top: ['Die Nummer 1 – ganz oben an der Tafel!', 'Volltreffer! Das war die Top-Antwort!'],
  miss: ['Leider nicht an der Tafel.', 'Das haben die Hörer nicht gesagt.', 'Knapp daneben – aber nicht auf der Tafel.'],
  dup: ['Die steht schon an der Tafel!', 'Die hatten wir schon!'],
  steal: ['Drei Fehler! Jetzt darf der Gegner klauen – eine Antwort entscheidet!', 'Klauen! Eine Antwort für die ganze Bank!'],
  win: ['Und die Bank geht an …', 'Runde entschieden!']
};
const say = (txt) => { $('hostTxt').textContent = txt; pair.push(); };
const flash = (txt, ms = 1600) => { const f = $('flash'); f.textContent = txt; f.hidden = false; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; return sleep(ms).then(() => { f.hidden = true; }); };

// ---------------------------------------------------------------- Anzeige
function renderScores(anim) {
  [0, 1].forEach(t => { const el = $('sc' + t), to = M.teams[t].score, from = +el.textContent || 0; if (!anim || from === to) { el.textContent = to; return; } const t0 = performance.now(); (function tick(n) { const k = Math.min(1, (n - t0) / 700); el.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(tick); })(t0); });
  $('tn0').textContent = name(0); $('tn1b').textContent = name(1);
}
function setTurnUI() {
  [0, 1].forEach(t => { $('tm' + t).classList.toggle('act', M.turn === t && ['faceoff', 'play', 'steal', 'choose'].includes(M.phase)); $('tm' + t).classList.toggle('ctl', M.control === t && ['play', 'steal'].includes(M.phase)); });
  const n = name(M.turn), cpu = M.isCpu; let w = '';
  if (M.phase === 'faceoff') w = cpu ? `${n} überlegt …` : `${n}: Duell – nennt die beliebteste Antwort!`;
  else if (M.phase === 'play') w = cpu ? `${n} überlegt …` : `${n} ist dran · noch ${STRIKES - M.strikes} Fehler erlaubt`;
  else if (M.phase === 'steal') w = cpu ? `${n} will klauen …` : `${n} darf klauen – nur eine Antwort!`;
  else if (M.phase === 'choose') w = `${n} hat das Duell gewonnen!`; else if (M.phase === 'roundEnd') w = 'Runde beendet';
  if (!cpu && ['faceoff', 'play', 'steal'].includes(M.phase) && pair.count(M.turn)) w = `📱 ${n} antwortet per Handy …`;
  $('who').textContent = w; pair.push(); $('bankLbl').textContent = M.mult > 1 ? `Bank ×${M.mult}` : 'Bank'; $('bank').textContent = M.bank;
  [...$('strikes').children].forEach((s, i) => s.classList.toggle('on', i < M.strikes));
}
function buildBoard(n) {
  const b = $('board'); b.style.gridTemplateRows = `repeat(${Math.ceil(n / 2)},1fr)`; b.innerHTML = Array.from({ length: n }, (_, i) => `<div class="slot" data-i="${i}"><div class="n">${i + 1}</div><div class="face"><span class="t"></span><span class="p"></span></div></div>`).join('');
}
function revealSlot(i, missed) {
  const el = $('board').children[i], bd = M.board[i]; el.querySelector('.t').textContent = bd.t; el.querySelector('.p').textContent = bd.p; el.classList.add('show'); el.classList.toggle('missed', !!missed); el.classList.toggle('top', i === 0 && !missed);
  pair.push(); SFX.flip(); if (!missed) { setTimeout(() => (i === 0 ? SFX.top() : SFX.ding()), 220); studio.cheer(i === 0 ? 1 : 0.6); if (i === 0) studio.confetti(70); }
}
function setInput(enabled, opts = {}) {
  pair.push(); $('inp').disabled = !enabled; $('bSend').disabled = !enabled; $('bPass').disabled = !enabled; $('choose').hidden = !opts.choose; $('nextRow').hidden = !opts.next; $('ask').querySelector('.askrow').hidden = !!opts.choose || !!opts.next;
  if (enabled) { $('inp').value = ''; if (!matchMedia('(pointer:coarse)').matches || opts.focus) setTimeout(() => $('inp').focus(), 30); }
}
function bigX() { const x = $('bigx'); x.hidden = false; x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; setTimeout(() => { x.hidden = true; }, 900); }
// Zeitlimit
function startTimer() {
  stopTimer(); if (!cfg.time) { $('timer').hidden = true; return; } const t0 = performance.now(), ms = cfg.time * 1000, tk = token; $('timer').hidden = false;
  timerId = setInterval(() => { if (tk !== token) { stopTimer(); return; } const k = Math.max(0, 1 - (performance.now() - t0) / ms); $('timerBar').style.transform = `scaleX(${k})`; if (k <= 0) { stopTimer(); submit(''); } }, 100);
}
function stopTimer() { clearInterval(timerId); timerId = 0; $('timer').hidden = true; }

// ---------------------------------------------------------------- Ablauf
async function startMatch() {
  endShown = false; awaiting = false; finAccept = false; finSubmit = null; const t = ++token; stopTimer(); busy = false; M = new Match({ teams: [cfg.t1.trim() || 'Team 1', cfg.mode === 'solo' ? 'Funkhaus-Team' : (cfg.t2.trim() || 'Team 2')], solo: cfg.mode === 'solo', diff: cfg.diff, rounds: cfg.rounds, finale: !!cfg.finale }, QUESTIONS);
  show('game'); renderScores(false); setInput(false); $('board').innerHTML = ''; $('question').textContent = '…'; $('cat').textContent = ''; say(pick(HOST.start)); SFX.jingle(); studio.cheer(0.7);
  try { await sleep(1200); await runRound(M.startRound()); } catch (e) { if (e !== ABORT) throw e; }
}
async function runRound(ev) {
  buildBoard(ev.count); $('rinfo').innerHTML = `<small>Runde ${ev.round + 1} von ${ev.total}</small>${ev.mult > 1 ? ` · <b>×${ev.mult} Punkte</b>` : ''}`; $('question').textContent = ev.q; $('cat').textContent = ev.cat; $('bank').textContent = 0; [...$('strikes').children].forEach(s => s.classList.remove('on')); renderScores(false);
  setInput(false); say(ev.round === 0 ? pick(HOST.start) : `Runde ${ev.round + 1}${ev.mult > 1 ? ` – jetzt zählt alles ${ev.mult}-fach!` : ''}`);
  if (ev.mult > 1) { SFX.fanfare(); await flash(`×${ev.mult} Punkte!`); } else SFX.jingle(); await sleep(500); await turn();
}
async function turn() {
  setTurnUI(); busy = false; awaiting = false;
  if (['faceoff', 'play', 'steal'].includes(M.phase)) { if (M.isCpu) { await cpuAct(); } else { setInput(!pair.count(M.turn)); awaiting = true; startTimer(); pair.push(); } }
  else if (M.phase === 'choose') {
    if (M.solo && M.control === 1) { await sleep(1100); const play = M.cpuChoosesPlay(); say(play ? 'Das Funkhaus-Team spielt die Runde.' : 'Das Funkhaus-Team gibt weiter – ihr seid dran!'); M.choose(play); await sleep(1100); await turn(); }
    else { setInput(false, { choose: true }); say(`${name(M.control)}: Spielen oder weitergeben?`); }
  } else if (M.phase === 'roundEnd') { /* wartet auf „Weiter" */ }
}
async function cpuAct() {
  setInput(false); await sleep(900 + Math.random() * 600); const text = M.cpuText(), inp = $('inp'); inp.disabled = true; inp.value = '';
  for (const ch of text) { inp.value += ch; SFX.type(); await sleep(55); } await sleep(450); await handle(text);
}
async function submit(text) {
  if (busy || !M || !awaiting) return; stopTimer(); try { await handle(text); } catch (e) { if (e !== ABORT) throw e; }
}
async function handle(text) {
  busy = true; awaiting = false; setInput(false); const r = M.submit(text), who = name(r.team != null ? r.team : M.turn), shown = String(text || '').trim();
  const typed = shown ? `${who}: „${shown}"` : `${who} weiß es nicht`; $('bank').textContent = M.bank;
  if (r.type === 'faceoff-answer') {
    if (r.idx >= 0) { say(`${typed} – ${r.idx === 0 ? pick(HOST.top) : pick(HOST.hit)}`); revealSlot(r.idx); await sleep(1500); }
    else { say(`${typed} – ${r.dup ? pick(HOST.dup) : pick(HOST.miss)}`); SFX.buzz(); bigX(); await sleep(1300); }
    if (r.retry) { say('Beide daneben – noch ein Versuch für beide!'); await sleep(1400); } if (r.coin) { say('Wieder nichts – das Los entscheidet!'); await sleep(1400); }
    if (r.winner != null) { say(`${name(r.winner)} gewinnt das Duell!`); SFX.clap(1); studio.cheer(0.8); await sleep(1100); }
  } else if (r.type === 'play-answer') {
    if (r.idx >= 0) { say(`${typed} – ${r.idx === 0 ? pick(HOST.top) : pick(HOST.hit)}`); revealSlot(r.idx); await sleep(1400); }
    else if (r.dup) { say(`${typed} – ${pick(HOST.dup)}`); SFX.tick(); await sleep(1200); }
    else { say(`${typed} – ${pick(HOST.miss)}`); SFX.buzz(); bigX(); [...$('strikes').children].forEach((s, i) => s.classList.toggle('on', i < r.strikes)); await sleep(1300); }
    if (r.steal != null) { say(pick(HOST.steal)); SFX.steal(); await sleep(1600); }
  } else if (r.type === 'steal-answer') {
    if (r.idx >= 0) { say(`${typed} – GEKLAUT! ${name(r.team)} holt sich die Bank!`); revealSlot(r.idx); SFX.steal(); await sleep(1800); }
    else { say(`${typed} – daneben! ${name(r.team === 0 ? 1 : 0)} behält die Bank.`); SFX.buzz(); bigX(); await sleep(1700); }
  }
  $('bank').textContent = M.bank;
  if (r.roundEnd) await finishRound(r); else await turn();
}
async function finishRound(r) {
  setInput(false); pair.push(); for (const i of r.rest) { revealSlot(i, true); await sleep(380); } await sleep(300);
  say(`${name(r.winner)} bekommt die Bank: ${r.bank}${r.mult > 1 ? ` × ${r.mult}` : ''} = ${r.gained} Punkte!`); SFX.fanfare(); SFX.clap(1.4); studio.cheer(1); studio.confetti(80); flash(`+${r.gained}`, 1500).catch(() => {}); renderScores(true);
  [0, 1].forEach(t => $('tm' + t).classList.toggle('act', t === r.winner)); $('who').textContent = 'Runde beendet'; await sleep(1500);
  const last = M.round + 1 >= M.total; $('bNext').textContent = last ? 'Ergebnis ▶' : 'Nächste Runde ▶'; setInput(false, { next: true }); pair.push(); await new Promise(res => { nextResolve = res; });
}
$('bNext').onclick = async () => { SFX.click(); const t = token; if (!nextResolve) return; nextResolve(); nextResolve = null; setInput(false); try { const ev = M.next(); if (ev.type === 'round') await runRound(ev); else await matchEnd(ev); } catch (e) { if (e !== ABORT) throw e; } };
$('bPlayRound').onclick = async () => { SFX.click(); if (M.phase !== 'choose') return; M.choose(true); say(`${name(M.control)} spielt die Runde!`); setInput(false); try { await sleep(700); await turn(); } catch (e) { if (e !== ABORT) throw e; } };
$('bGive').onclick = async () => { SFX.click(); if (M.phase !== 'choose') return; M.choose(false); say(`${name(M.control)} muss spielen – weitergegeben!`); setInput(false); try { await sleep(900); await turn(); } catch (e) { if (e !== ABORT) throw e; } };
$('ask').onsubmit = e => { e.preventDefault(); if (busy || $('inp').disabled) return; submit($('inp').value); };
$('bPass').onclick = () => { if (busy || $('inp').disabled) return; SFX.click(); submit(''); };

// ---------------------------------------------------------------- Spielende und Finale
async function matchEnd(ev) {
  const [a, b] = ev.scores; show('game'); setInput(false);
  const finaleTeam = ev.finale && (cfg.mode === 'duell' || ev.winner === 0) ? ev.winner : null;
  if (finaleTeam != null) { say(`${name(finaleTeam)} hat gewonnen – und spielt das Hörer-Finale!`); SFX.fanfare(); studio.confetti(120); await sleep(2200); await runFinale(finaleTeam); } else await showEnd(ev, null);
  if (finaleTeam != null) await showEnd(ev, M.finaleResult);
}
let finTimer = 0;
async function runFinale(team) {
  show('finale'); const f = M.startFinale(team); $('finIntro').innerHTML = `<b>${esc(name(team))}</b>: 5 Fragen, je eine Antwort – erreicht <b>${FINALE_GOAL} Punkte</b> in 45 Sekunden!`; $('finList').innerHTML = ''; $('finQ').textContent = 'Bereit?'; $('finPts').textContent = `0 / ${FINALE_GOAL}`; $('finBar').style.transform = 'scaleX(1)';
  $('finForm').hidden = true; $('finGo').hidden = false; pair.push(); await new Promise(res => { $('finGo').onclick = () => { SFX.click(); res(); }; });
  $('finGo').hidden = true; $('finForm').hidden = false; $('finQ').textContent = f.q; const inp = $('finInp'); inp.value = ''; inp.focus(); SFX.jingle(); const tk = token; const t0 = performance.now(), TOTAL = 45000;
  await new Promise(resolve => {
    let done = false; finAccept = true; pair.push(); const finish = () => { if (done) return; done = true; finAccept = false; finSubmit = null; clearInterval(finTimer); while (M.phase === 'finale') { const r = M.finaleAnswer(''); addRow(r, ''); } resolve(); };
    function addRow(r, text) { const q = M.finale.results[M.finale.results.length - 1]; const row = document.createElement('div'); row.className = 'fin-row ' + (r.pts > 0 ? 'good' : 'bad'); row.innerHTML = `<span>${esc(text || '—')}<small>${r.pts > 0 ? esc(r.answerText) : 'Top: ' + esc(r.best)}</small></span><b>${r.pts > 0 ? '+' + r.pts : '0'}</b>`; $('finList').prepend(row); $('finPts').textContent = `${r.total} / ${FINALE_GOAL}`; }
    finSubmit = text0 => { if (done) return; const text = String(text0 == null ? '' : text0); const r = M.finaleAnswer(text); addRow(r, text.trim()); r.pts > 0 ? SFX.ding() : SFX.buzz(); if (r.total >= FINALE_GOAL) { SFX.top(); } if (r.done) { finish(); } else { $('finQ').textContent = r.next.q; } pair.push(); };
    $('finForm').onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; finSubmit(v); };
    finTimer = setInterval(() => { if (tk !== token) { clearInterval(finTimer); resolve(); return; } const k = Math.max(0, 1 - (performance.now() - t0) / TOTAL); $('finBar').style.transform = `scaleX(${k})`; if (k <= 0) finish(); }, 100);
  });
  const total = M.finale.total, won = total >= FINALE_GOAL; M.finaleResult = { team, total, won }; $('finQ').textContent = won ? '🎉 Hörer-Champions!' : 'Leider nicht ganz …'; won ? (SFX.fanfare(), studio.confetti(160), SFX.clap(2)) : SFX.sad(); $('finForm').hidden = true; await sleep(2200);
}
async function showEnd(ev, fin) {
  endShown = true; show('end'); const [a, b] = ev.scores, w = ev.winner; $('endTitle').textContent = w == null ? 'Unentschieden!' : `${name(w)} gewinnt!`; $('trophy').textContent = w == null ? '🤝' : '🏆';
  $('endScores').innerHTML = [0, 1].map(t => `<div class="${w === t ? 'win' : ''}">${esc(name(t))}<b>${ev.scores[t]}</b></div>`).join(''); $('endNote').textContent = fin ? (fin.won ? `⭐ Finale gewonnen: ${fin.total} Punkte – Hörer-Champions!` : `Finale: ${fin.total} von ${FINALE_GOAL} Punkten`) : w == null ? 'Beide Teams sind gleich gut.' : (M.solo && w === 1 ? 'Das Funkhaus-Team war diesmal besser.' : '');
  w == null ? SFX.jingle() : (SFX.fanfare(), studio.confetti(140), SFX.clap(2)); studio.cheer(1);
}

// ---------------------------------------------------------------- Handy-Kopplung
function snapshot() {
  const names = M ? [name(0), name(1)] : [cfg.t1.trim() || 'Team 1', cfg.mode === 'solo' ? 'Funkhaus-Team' : (cfg.t2.trim() || 'Team 2')];
  if (!M) return { view: 'idle', names, scores: [0, 0], say: '' };
  const base = { names, scores: M.teams.map(t => t.score), say: $('hostTxt').textContent };
  if (endShown) return Object.assign(base, { view: 'end', say: $('endTitle').textContent });
  if (M.phase === 'finale' || M.phase === 'finaleEnd') { const f = M.finale; return Object.assign(base, { view: 'finale', fin: { team: f.team, q: f.i < f.qs.length ? f.qs[f.i].q : '–', i: f.i, count: f.qs.length, total: f.total, goal: FINALE_GOAL, accept: finAccept, start: !$('finGo').hidden } }); }
  const all = M.phase === 'roundEnd';
  return Object.assign(base, { view: 'game', phase: M.phase, turn: M.turn, control: M.control, round: M.round, total: M.total, mult: M.mult, q: M.q ? M.q.q : '', cat: M.q ? M.q.cat : '', board: M.board ? M.board.map(b => (b.shown || all ? { t: b.t, p: b.p } : null)) : [], bank: M.bank, strikes: M.strikes, accept: awaiting && !busy, choose: M.phase === 'choose' && !$('choose').hidden, next: !!nextResolve, nextLabel: $('bNext').textContent });
}
function onPhone(team, m) {
  if (!M) return;
  if (m.t === 'ans') { if (awaiting && !busy && M.turn === team && ['faceoff', 'play', 'steal'].includes(M.phase)) submit(m.text); }
  else if (m.t === 'choose') { if (M.phase === 'choose' && M.control === team && !$('choose').hidden) (m.play ? $('bPlayRound') : $('bGive')).click(); }
  else if (m.t === 'next') { if (nextResolve) $('bNext').click(); else if (M.phase === 'finale' && !$('finGo').hidden && M.finale.team === team) $('finGo').click(); }
  else if (m.t === 'fans') { if (finSubmit && finAccept && M.finale && M.finale.team === team) finSubmit(m.text); }
}
const pair = initPair({ names: () => (M ? [name(0), name(1)] : [cfg.t1.trim() || 'Team 1', cfg.mode === 'solo' ? 'Funkhaus-Team' : (cfg.t2.trim() || 'Team 2')]), snapshot, onMessage: onPhone,
  onChange: () => { if (M && awaiting && !busy) { setInput(!pair.count(M.turn)); setTurnUI(); } } });
$('bPairMenu').onclick = () => { Audio_.unlock(); SFX.click(); pair.open(); }; $('bPairTop').onclick = () => { SFX.click(); pair.open(); };

// ---------------------------------------------------------------- Menüs
function syncSetup() {
  const seg = (id, v) => $(id).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v)));
  seg('sgMode', cfg.mode); seg('sgRounds', cfg.rounds); seg('sgDiff', cfg.diff); seg('sgTime', cfg.time); seg('sgFinale', cfg.finale); $('tn1').value = cfg.t1; $('tn2').value = cfg.t2; $('fld2').hidden = cfg.mode === 'solo'; $('fldDiff').hidden = cfg.mode !== 'solo';
}
[['sgMode', 'mode', String], ['sgRounds', 'rounds', Number], ['sgDiff', 'diff', String], ['sgTime', 'time', Number], ['sgFinale', 'finale', Number]].forEach(([id, k, cast]) => $(id).querySelectorAll('button').forEach(b => b.onclick = () => { SFX.click(); cfg[k] = cast(b.dataset.v); syncSetup(); }));
$('bPlay').onclick = () => { Audio_.unlock(); SFX.click(); syncSetup(); show('setup'); };
$('bSetBack').onclick = () => { SFX.click(); show('menu'); };
$('bStart').onclick = () => { Audio_.unlock(); SFX.click(); cfg.t1 = $('tn1').value; cfg.t2 = $('tn2').value; saveCfg(); startMatch(); };
$('bRules').onclick = () => { SFX.click(); $('rules').hidden = false; }; $('rulesOk').onclick = () => { SFX.click(); $('rules').hidden = true; };
const setSound = v => { cfg.sound = v; saveCfg(); Audio_.setOn(v); $('bSound').textContent = v ? '🔊 Ton' : '🔇 Ton'; $('bSnd').textContent = v ? '🔊' : '🔇'; if (v) SFX.click(); };
$('bSound').onclick = () => setSound(!cfg.sound); $('bSnd').onclick = () => setSound(!cfg.sound); setSound(cfg.sound);
$('bMenu').onclick = () => { if (M && !confirm('Spiel abbrechen und zurück ins Menü?')) return; abortToMenu(); };
$('bEndMenu').onclick = () => { SFX.click(); abortToMenu(); }; $('bAgain').onclick = () => { SFX.click(); startMatch(); };
function abortToMenu() { endShown = false; awaiting = false; finAccept = false; finSubmit = null; token++; stopTimer(); clearInterval(finTimer); nextResolve = null; M = null; $('bigx').hidden = true; $('flash').hidden = true; show('menu'); }
document.addEventListener('pointerdown', () => Audio_.unlock(), { once: true });
document.addEventListener('visibilitychange', () => studio.pause(document.hidden));
window.__hw = { get M() { return M; }, get awaiting() { return awaiting && !busy; }, get nextReady() { return !!nextResolve; }, get finAccept() { return finAccept; }, cfg, QUESTIONS, startMatch, submit, pair };
if (!JOIN) show('menu');
