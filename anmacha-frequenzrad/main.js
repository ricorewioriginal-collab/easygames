/* Frequenzrad – Oberfläche und Ablauf (DOM). Spiellogik: engine.js, Rad: wheel.js, Handys: pair.js / controller.js */
import { Game, SEGMENTS, VOWELS, VOWEL_COST, LETTERS, COLS, ROWS } from './engine.js';
import PUZZLES from './puzzles.js';
import { SFX, Audio_ } from './audio.js';
import { initStudio } from './studio.js';
import { createWheel } from './wheel.js';
import { initPair, JOIN } from './pair.js';
if (JOIN) { document.body.classList.add('ctrl'); import('./controller.js').then(m => m.startController()).catch(e => { document.getElementById('err').hidden = false; document.getElementById('errTxt').textContent = e.message; }); }

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
if (!PUZZLES.length) { $('err').hidden = false; $('errTxt').textContent = 'Keine Rätsel gefunden.'; throw new Error('puzzles'); }
if (window.self !== window.top) $('backLink').hidden = true;
const studio = initStudio($('bg'));
const KEY = 'frequenzrad1', ABORT = { abort: true }, CPU_NAMES = ['Funk-Fritz', 'Radio-Rita'];
let cfg = { hum: 2, cpu: 0, diff: 'normal', rounds: 3, names: ['Spieler 1', 'Spieler 2', 'Spieler 3', 'Spieler 4'], sound: true };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const saveCfg = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
let G = null, token = 0, busy = false, awaiting = false, roundShown = false, endShown = false, solvingHost = false, wheel = null, lastSay = '';
const show = id => ['menu', 'setup', 'game', 'end'].forEach(s => { $(s).hidden = s !== id; });
const sleep = async ms => { const t = token; await new Promise(r => setTimeout(r, ms * (window.__frFast || 1))); if (t !== token) throw ABORT; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const say = txt => { lastSay = txt; $('hostTxt').textContent = txt; pair.push(); };
const flash = (txt, ms = 1500) => { const f = $('flash'); f.textContent = txt; f.hidden = false; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; return sleep(ms).then(() => { f.hidden = true; }); };
const total = () => Math.max(2, cfg.hum + cfg.cpu);
const playerList = () => { const l = []; for (let i = 0; i < cfg.hum; i++) l.push({ name: (cfg.names[i] || 'Spieler ' + (i + 1)).trim() || 'Spieler ' + (i + 1) }); for (let i = 0; i < Math.max(cfg.cpu, cfg.hum < 2 && cfg.cpu < 1 ? 1 : 0); i++) l.push({ name: CPU_NAMES[i], cpu: true }); return l; };

{ const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.tag').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }
$('logoRow').innerHTML = Array.from({ length: 13 }, (_, i) => `<img src="logos/${String(i + 1).padStart(2, '0')}.png" alt="" loading="lazy">`).join('');

// ---------------------------------------------------------------- Anzeige
function updatePlayers() {
  $('players').innerHTML = G.players.map((p, i) => `<div class="pl ${i === G.turn && G.phase !== 'gameEnd' ? 'act' : ''} ${p.cpu ? 'cpu' : ''} ${!p.cpu && pair.has(i) ? 'ph' : ''}"><b>${esc(p.name)}</b><div class="tot">${p.total}</div><small>Runde: ${p.round}</small></div>`).join('');
}
function buildBoard(cells) {
  const b = $('tboard'); b.innerHTML = ''; const map = new Map(cells.map(c => [c.row * COLS + c.col, c.ch]));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const d = document.createElement('div'), ch = map.get(r * COLS + c); d.className = 'tile' + (ch ? ' on' : ''); if (ch) { d.dataset.ch = ch; d.textContent = ch; } b.appendChild(d); }
}
async function revealLetter(ch, cls) { const tiles = [...$('tboard').querySelectorAll(`.tile.on[data-ch="${ch}"]`)].filter(t => !t.classList.contains('show') && !t.classList.contains('late')); for (const t of tiles) { t.classList.add(cls || 'show'); if (!cls) t.classList.add('hit'); SFX.ding(); studio.cheer(0.6); await sleep(520); } }
function renderAct() {
  const a = $('act'); a.innerHTML = ''; if (!G) return; const add = html => { a.insertAdjacentHTML('beforeend', html); };
  if (G.phase === 'roundEnd') { if (roundShown) { add(`<button class="btn" id="bNext">${G.round + 1 >= G.total ? 'Ergebnis ▶' : 'Nächste Runde ▶'}</button>`); $('bNext').onclick = () => { SFX.click(); doNext(); }; } return; }
  if (G.isCpu) { add(`<div class="info">🤖 ${esc(G.cur.name)} überlegt …</div>`); return; }
  if (pair.has(G.turn)) { add(`<div class="info">📱 ${esc(G.cur.name)} spielt am Handy …</div>`); return; }
  if (!awaiting || busy) { return; }
  const ph = G.phase; add(`<div class="info"><b>${esc(G.cur.name)}</b> ist dran</div>`);
  if (solvingHost) { add(`<form class="solve" id="sform" autocomplete="off"><input id="sinp" maxlength="60" placeholder="Die Lösung …" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn green small" type="submit">Lösen</button><button class="btn ghost small" id="sno" type="button">Zurück</button></form>`); $('sform').onsubmit = e => { e.preventDefault(); const v = $('sinp').value; solvingHost = false; doAction(G.turn, { t: 'solve', text: v }); }; $('sno').onclick = () => { solvingHost = false; renderAct(); }; setTimeout(() => { const i = $('sinp'); if (i) i.focus(); }, 30); return; }
  if (ph === 'consonant' || ph === 'vowel' || ph === 'vowelFree') {
    const vow = ph !== 'consonant'; add(`<div class="hs">${vow ? (ph === 'vowelFree' ? '🎁 Gratis-Vokal: wähle einen Vokal' : `Wähle einen Vokal (${VOWEL_COST} Punkte)`) : `Wähle einen Konsonanten · ${G.val} pro Buchstabe`}</div><div class="kb">${[...'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'].map(k => `<button data-k="${k}" ${VOWELS.has(k) !== vow || G.rev.has(k) ? 'disabled' : ''}>${k}</button>`).join('')}</div>`);
    a.querySelectorAll('[data-k]').forEach(b => b.onclick = () => doAction(G.turn, { t: 'letter', ch: b.dataset.k })); return;
  }
  add(`<div class="row2"><button class="btn green" id="bSpin">🎡 Drehen</button>${G.canBuy() ? `<button class="btn blue" id="bBuy">🅰 Vokal kaufen (${VOWEL_COST})</button>` : ''}<button class="btn ghost" id="bSolve">💬 Lösen</button></div>`);
  $('bSpin').onclick = () => doAction(G.turn, { t: 'spin' }); if ($('bBuy')) $('bBuy').onclick = () => doAction(G.turn, { t: 'buy' }); $('bSolve').onclick = () => { solvingHost = true; renderAct(); };
}
const style = s => (s.t === 'val' ? `${s.v} pro Buchstabe` : s.t === 'bank' ? '💣 BANKROTT' : s.t === 'skip' ? '⏸ AUSSETZEN' : '🎁 GRATIS-VOKAL');

// ---------------------------------------------------------------- Ablauf
async function startGame() {
  token++; busy = false; awaiting = false; roundShown = false; endShown = false; solvingHost = false;
  G = new Game({ players: playerList(), rounds: cfg.rounds, diff: cfg.diff }, PUZZLES); show('game'); if (!wheel) wheel = createWheel($('wheel'), SEGMENTS); wheel.fit(); wheel.setHighlight(-1); $('tboard').innerHTML = ''; $('act').innerHTML = ''; updatePlayers(); say('Willkommen beim Frequenzrad! Dreht das Rad und löst das Rätsel.'); SFX.jingle(); studio.cheer(0.7);
  try { await sleep(1200); await runRound(G.startRound()); } catch (e) { if (e !== ABORT) throw e; }
}
async function runRound(ev) {
  roundShown = false; buildBoard(G.cells); $('cat').textContent = ev.cat; $('rinfo').innerHTML = `<small>Runde ${ev.round + 1} von ${ev.total}</small>`; $('wval').textContent = 'Dreh das Rad!'; wheel.setHighlight(-1); updatePlayers();
  say(`Runde ${ev.round + 1}: Kategorie „${ev.cat}". ${G.players[ev.starter].name} beginnt!`); SFX.jingle(); await sleep(1400); await turn();
}
async function turn() {
  busy = false; awaiting = false; updatePlayers();
  if (G.phase === 'roundEnd') { renderAct(); pair.push(); return; }
  if (G.isCpu) { renderAct(); pair.push(); await cpuTurn(); return; }
  awaiting = true; renderAct(); pair.push();
}
async function doAction(slot, a) {
  if (!G) return; if (a.t === 'next') return doNext();
  if (!awaiting || busy || G.isCpu || slot !== G.turn) return;
  busy = true; awaiting = false; solvingHost = false; renderAct(); pair.push();
  try {
    if (a.t === 'spin') await actSpin(); else if (a.t === 'letter') { if (!(await actLetter(a.ch))) { busy = false; awaiting = true; renderAct(); pair.push(); } } else if (a.t === 'buy') await actBuy(); else if (a.t === 'solve') await actSolve(a.text); else { busy = false; awaiting = true; renderAct(); }
  } catch (e) { if (e !== ABORT) throw e; }
}
async function actSpin() {
  if (!['spin', 'choose'].includes(G.phase)) { await turn(); return; } const who = G.cur.name, ev = G.spin(); if (ev.type === 'ignored') { await turn(); return; }
  $('wval').textContent = '…'; await wheel.spinTo(ev.idx, 3800 * (window.__frFast || 1), () => SFX.tick()); const s = ev.seg; $('wval').textContent = style(s); SFX.flip(); await sleep(500);
  if (s.t === 'val') { say(ev.noCons ? `${s.v} – aber alle Konsonanten sind schon da! Kaufe einen Vokal oder löse.` : `${who}: ${s.v} pro Buchstabe – nenne einen Konsonanten!`); }
  else if (s.t === 'bank') { say(`💣 BANKROTT! ${who} verliert alle Rundenpunkte.`); SFX.sad(); await flash('💣 BANKROTT'); }
  else if (s.t === 'skip') { say(`⏸ Aussetzen – ${G.cur.name} ist dran.`); SFX.buzz(); await flash('⏸ AUSSETZEN'); }
  else { say(ev.again ? 'Gratis-Vokal – aber alle Vokale sind weg. Nochmal drehen!' : `🎁 Gratis-Vokal für ${who}!`); SFX.fanfare(); studio.confetti(40); }
  await sleep(500); await turn();
}
/** liefert true, wenn der Zug abgeschlossen ist (turn() wurde aufgerufen), false bei „nochmal wählen" */
async function actLetter(ch) {
  const who = G.cur.name, ev = G.guess(ch);
  if (ev.type === 'ignored' || ev.type === 'invalid') { say(ev.why || 'Das geht gerade nicht.'); SFX.tick(); return false; }
  if (ev.type === 'dup') { say(`„${ch}" gab es schon – wähle einen anderen Buchstaben.`); SFX.tick(); return false; }
  updatePlayers();
  if (ev.type === 'miss') { say(`${who}: Leider kein „${ch}" im Rätsel.`); SFX.buzz(); await sleep(1300); await turn(); return true; }
  say(`${who}: „${ch}" kommt ${ev.n}× vor${ev.gain ? ` – ${ev.gain} Punkte!` : '!'}`); await revealLetter(ch); SFX.clap(0.8); if (ev.gain) SFX.fanfare(); updatePlayers();
  if (ev.roundEnd) { await finishRound(ev); return true; } await sleep(500); await turn(); return true;
}
async function actBuy() { const ev = G.buyVowel(); if (ev.type === 'ignored') { await turn(); return; } say(`${G.cur.name} kauft einen Vokal (${VOWEL_COST} Punkte) – wähle einen!`); SFX.click(); await sleep(400); await turn(); }
async function actSolve(text) {
  const who = G.cur.name, ev = G.solve(text); if (ev.type === 'ignored') { await turn(); return; } updatePlayers();
  if (ev.ok) { say(`✅ „${ev.text.trim().toUpperCase()}" – richtig gelöst!`); await sleep(900); await finishRound(ev, true); return; }
  say(`❌ „${String(text || '').trim()}" ist leider falsch. ${G.cur.name} ist dran.`); SFX.buzz(); await sleep(1500); await turn();
}
async function finishRound(ev, solvedAll) {
  say(`${G.players[ev.winner].name} gewinnt die Runde! ${ev.gained} Punkte (inkl. ${ev.bonus} Bonus).`); SFX.fanfare(); SFX.clap(1.6); studio.cheer(1); studio.confetti(100);
  for (const t of $('tboard').querySelectorAll('.tile.on:not(.show)')) { t.classList.add(solvedAll ? 'show' : 'late'); await sleep(90); }
  flash(`+${ev.gained}`, 1500).catch(() => {}); updatePlayers(); await sleep(1700); roundShown = true; busy = false; awaiting = false; renderAct(); pair.push();
}
async function doNext() {
  if (!G || G.phase !== 'roundEnd' || !roundShown) return; roundShown = false; $('act').innerHTML = '';
  try { const ev = G.next(); if (ev.type === 'round') await runRound(ev); else await showEnd(ev); } catch (e) { if (e !== ABORT) throw e; }
}
async function cpuTurn() {
  busy = true; await sleep(1000 + Math.random() * 600);
  for (let tries = 0; tries < 6; tries++) {
    const a = G.cpuAction(); if (a.type === 'spin') { await actSpin(); return; } if (a.type === 'buy') { await actBuy(); return; } if (a.type === 'solve') { say(`🤖 ${G.cur.name} will lösen: „${a.text}"`); await sleep(1300); await actSolve(a.text); return; }
    say(`🤖 ${G.cur.name} wählt „${a.ch}" …`); await sleep(900); if (await actLetter(a.ch)) return;
  }
  G.passTurn(); await turn();
}
async function showEnd(ev) {
  endShown = true; show('end'); const best = ev.winners, names = G.players.map(p => p.name); $('endTitle').textContent = best.length > 1 ? 'Unentschieden!' : `${names[best[0]]} gewinnt!`; $('trophy').textContent = best.length > 1 ? '🤝' : '🏆';
  $('endScores').innerHTML = G.players.map((p, i) => `<div class="${best.includes(i) ? 'win' : ''}">${esc(p.name)}<b>${p.total}</b></div>`).join(''); SFX.fanfare(); SFX.clap(2); studio.confetti(160); studio.cheer(1); pair.push();
}

// ---------------------------------------------------------------- Handy-Kopplung
function boardRows() {
  const rows = Array.from({ length: ROWS }, () => Array(COLS).fill(' ')); if (!G || !G.cells) return rows.map(r => r.join(''));
  const all = G.phase === 'roundEnd'; G.cells.forEach(c => { rows[c.row][c.col] = all || G.rev.has(c.ch) ? c.ch : '·'; }); return rows.map(r => r.join(''));
}
function snapshot() {
  const names = G ? G.players.map(p => p.name) : playerList().map(p => p.name);
  if (!G) return { view: 'idle', players: names.map(n => ({ name: n, total: 0, round: 0 })), turn: 0, board: boardRows(), cat: '', say: '', accept: false };
  return { view: endShown ? 'end' : 'game', players: G.players.map(p => ({ name: p.name, total: p.total, round: p.round })), turn: G.turn || 0, phase: G.phase, val: G.val, board: boardRows(), cat: G.puzzle ? G.puzzle.cat : '', say: endShown ? $('endTitle').textContent : lastSay, accept: awaiting && !busy && !G.isCpu, canBuy: G.canBuy(), vowelCost: VOWEL_COST, used: [...(G.rev || [])], next: G.phase === 'roundEnd' && roundShown };
}
const pair = initPair({
  names: () => (G ? G.players.map(p => p.name) : playerList().map(p => p.name)), freeSlot: () => { const n = G ? G.players.filter(p => !p.cpu).length : cfg.hum; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
  onJoin: (slot, name) => { cfg.names[slot] = name; if (G && G.players[slot]) { G.players[slot].name = name; updatePlayers(); } },
  onMessage: (slot, m) => { if (m.t === 'next') doNext(); else if (m.t === 'spin') doAction(slot, { t: 'spin' }); else if (m.t === 'letter') doAction(slot, { t: 'letter', ch: String(m.ch || '').toUpperCase() }); else if (m.t === 'buy') doAction(slot, { t: 'buy' }); else if (m.t === 'solve') doAction(slot, { t: 'solve', text: m.text }); },
  snapshot, onChange: () => { if (G) { updatePlayers(); renderAct(); } }
});
['bPairMenu', 'bPairSetup', 'bPairTop'].forEach(id => { $(id).onclick = () => { Audio_.unlock(); SFX.click(); pair.open(); }; });

// ---------------------------------------------------------------- Menüs
function renderNames() { $('names').innerHTML = Array.from({ length: cfg.hum }, (_, i) => `<input data-i="${i}" maxlength="14" value="${esc(cfg.names[i] || '')}" placeholder="Spieler ${i + 1}" aria-label="Name Spieler ${i + 1}" autocomplete="off">`).join(''); $('names').querySelectorAll('input').forEach(inp => { inp.oninput = () => { cfg.names[+inp.dataset.i] = inp.value; }; }); }
function syncSetup() {
  if (cfg.hum + cfg.cpu < 2) cfg.cpu = 1; if (cfg.hum + cfg.cpu > 4) cfg.cpu = 4 - cfg.hum; const seg = (id, v) => $(id).querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === String(v)); b.disabled = id === 'sgCpu' && cfg.hum + +b.dataset.v > 4; });
  seg('sgHum', cfg.hum); seg('sgCpu', cfg.cpu); seg('sgDiff', cfg.diff); seg('sgRounds', cfg.rounds); $('fldDiff').hidden = cfg.cpu < 1; renderNames();
}
[['sgHum', 'hum', Number], ['sgCpu', 'cpu', Number], ['sgDiff', 'diff', String], ['sgRounds', 'rounds', Number]].forEach(([id, k, cast]) => $(id).querySelectorAll('button').forEach(b => b.onclick = () => { SFX.click(); cfg[k] = cast(b.dataset.v); syncSetup(); }));
$('bPlay').onclick = () => { Audio_.unlock(); SFX.click(); syncSetup(); show('setup'); };
$('bSetBack').onclick = () => { SFX.click(); show('menu'); };
$('bStart').onclick = () => { Audio_.unlock(); SFX.click(); saveCfg(); startGame(); };
$('bRules').onclick = () => { SFX.click(); $('rules').hidden = false; }; $('rulesOk').onclick = () => { SFX.click(); $('rules').hidden = true; };
const setSound = v => { cfg.sound = v; saveCfg(); Audio_.setOn(v); $('bSound').textContent = v ? '🔊 Ton' : '🔇 Ton'; $('bSnd').textContent = v ? '🔊' : '🔇'; if (v) SFX.click(); };
$('bSound').onclick = () => setSound(!cfg.sound); $('bSnd').onclick = () => setSound(!cfg.sound); setSound(cfg.sound);
$('bMenu').onclick = () => { if (G && !confirm('Spiel abbrechen und zurück ins Menü?')) return; abortToMenu(); };
$('bEndMenu').onclick = () => { SFX.click(); abortToMenu(); }; $('bAgain').onclick = () => { SFX.click(); startGame(); };
function abortToMenu() { token++; busy = false; awaiting = false; roundShown = false; endShown = false; solvingHost = false; G = null; $('flash').hidden = true; show('menu'); pair.push(); }
// Tastatur am Gastgeber: Buchstaben wählen, Enter dreht
addEventListener('keydown', e => {
  if (!G || !awaiting || busy || G.isCpu || pair.has(G.turn) || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
  const k = e.key.length === 1 ? e.key.toUpperCase() : e.key; if (['consonant', 'vowel', 'vowelFree'].includes(G.phase) && LETTERS.includes(k)) doAction(G.turn, { t: 'letter', ch: k }); else if (k === 'Enter' && ['spin', 'choose'].includes(G.phase) && !solvingHost) doAction(G.turn, { t: 'spin' });
});
document.addEventListener('pointerdown', () => Audio_.unlock(), { once: true });
document.addEventListener('visibilitychange', () => studio.pause(document.hidden));
window.__fr = { get G() { return G; }, get awaiting() { return awaiting && !busy; }, get roundShown() { return roundShown; }, get endShown() { return endShown; }, doAction, doNext, cfg, startGame, pair, PUZZLES };
if (!JOIN) show('menu');
