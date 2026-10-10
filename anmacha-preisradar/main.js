/* Preisradar – Oberfläche und Ablauf (DOM). Spiellogik: engine.js, Eingaben: inputs.js, Skala: gauge.js, Handys: pair.js / controller.js */
import { Show, publicSpec, hiloTruth } from './engine.js';
import PRODUCTS from './products.js';
import { SFX, Audio_ } from './audio.js';
import { initStudio } from './studio.js';
import { mountInput, card, eur } from './inputs.js';
import { drawGauge, PCOL } from './gauge.js';
import { initPair, JOIN } from './pair.js';
if (JOIN) { document.body.classList.add('ctrl'); import('./controller.js').then(m => m.startController()).catch(e => { document.getElementById('err').hidden = false; document.getElementById('errTxt').textContent = e.message; }); }

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
if (!PRODUCTS.length) { $('err').hidden = false; $('errTxt').textContent = 'Keine Produkte gefunden.'; throw new Error('products'); }
if (window.self !== window.top) $('backLink').hidden = true;
const studio = initStudio($('bg'));
const KEY = 'preisradar1', ABORT = { abort: true }, CPU_NAMES = ['Preis-Paula', 'Radio-Rudi'];
const TITLES = { bid: '💶 Gebotsduell', dial: '📻 Frequenz-Skala', hilo: '⚖️ Teurer oder billiger?', cart: '🛒 Einkaufswagen', final: '🏆 Preisfinale' };
let cfg = { hum: 2, cpu: 0, diff: 'normal', length: 4, names: ['Spieler 1', 'Spieler 2', 'Spieler 3', 'Spieler 4'], sound: true };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const saveCfg = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
let SH = null, token = 0, queue = [], curSlot = -1, hostInput = null, resolving = false, nextShown = false, endShown = false, lastSay = '', lastResult = null, gaugeMarks = null;
const show = id => ['menu', 'setup', 'game', 'end'].forEach(s => { $(s).hidden = s !== id; });
const sleep = async ms => { const t = token; await new Promise(r => setTimeout(r, ms * (window.__prFast || 1))); if (t !== token) throw ABORT; };
const say = txt => { lastSay = txt; $('hostTxt').textContent = txt; pair.push(); };
const playerList = () => { const l = []; for (let i = 0; i < cfg.hum; i++) l.push({ name: (cfg.names[i] || 'Spieler ' + (i + 1)).trim() || 'Spieler ' + (i + 1) }); for (let i = 0; i < Math.max(cfg.cpu, cfg.hum < 2 && cfg.cpu < 1 ? 1 : 0); i++) l.push({ name: CPU_NAMES[i], cpu: true }); return l; };

{ const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.tag').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }
$('logoRow').innerHTML = Array.from({ length: 16 }, (_, i) => `<img src="logos/${String(i + 1).padStart(2, '0')}.png" alt="" loading="lazy">`).join('');

// ---------------------------------------------------------------- Anzeige
function updatePlayers() {
  if (!SH) { $('players').innerHTML = ''; return; }
  $('players').innerHTML = SH.players.map((p, i) => { const done = SH.phase === 'collect' && SH.answers[i] !== undefined; return `<div class="pl ${p.cpu ? 'cpu' : ''} ${!p.cpu && pair.has(i) ? 'ph' : ''} ${done ? 'done' : ''}" style="--pc:${PCOL[i % 4]}"><b>${esc(p.name)}</b><div class="tot">${p.total}</div><small>${done ? '✔ bereit' : SH.phase === 'collect' && !p.cpu ? '… denkt' : ''}</small></div>`; }).join('');
}
function renderStage(ev) {
  const s = ev.spec, st = $('stage'); gaugeMarks = null; $('reveal').hidden = true; $('reveal').innerHTML = '';
  if (s.kind === 'bid') st.innerHTML = `<div class="sq">Was kostet das?</div>${card(s.items[0], false)}`;
  else if (s.kind === 'final') st.innerHTML = `<div class="sq">Was kostet das <b>ganze Paket</b>?</div><div class="trio">${s.items.map(it => card(it, false)).join('')}</div>`;
  else if (s.kind === 'dial') st.innerHTML = `<div class="sq">Stelle die Frequenz auf den Preis!</div>${card(s.items[0], false)}<canvas id="gauge" class="gauge"></canvas>`;
  else if (s.kind === 'hilo') st.innerHTML = `<div class="sq">Jeweils: Ist das nächste Produkt teurer oder billiger?</div><div class="chain">${s.items.map((it, i) => `${i ? '<span class="arrow">→</span>' : ''}${card(it, i === 0)}`).join('')}</div>`;
  else st.innerHTML = `<div class="sq">Packe den Wagen auf genau <b class="big">${eur(s.target)}</b> – nicht drüber!</div><div class="cart ro">${s.items.map(it => `<div class="ct"><span>${esc(it.e)}</span><b>${esc(it.n)}</b><i>${eur(it.p)}</i></div>`).join('')}</div>`;
  if (s.kind === 'dial') drawGauge($('gauge'), s, [], null);
}
function explain(res, i) {
  const k = res.kind, a = res.answers[i], r = res.reveal;
  if (k === 'bid') return `Preis: ${eur(r.price)} · dein Gebot: ${eur(a)}`; if (k === 'final') return `Gesamtpreis: ${eur(r.price)} · dein Gebot: ${eur(a)}`; if (k === 'dial') return `Preis: ${eur(r.price)} · deine Einstellung: ${eur(a)}`;
  if (k === 'hilo') return `Richtig: ${r.truth.map(t => (t ? '⬆' : '⬇')).join(' ')} · du: ${(a || []).map(t => (t ? '⬆' : '⬇')).join(' ')}`; return `Ziel ${eur(r.target)} · dein Wagen: ${eur(r.totals[i])}${r.totals[i] > r.target + 1e-9 ? ' (zu viel!)' : ''}`;
}
async function showResult(res) {
  const el = $('reveal'), s = SH.spec; el.hidden = false; const best = Math.max(...res.points), rows = () => SH.players.map((p, i) => `<div class="rrow ${res.points[i] === best && best > 0 ? 'win' : ''}" style="--pc:${PCOL[i % 4]}"><b>${esc(p.name)}</b><span>${esc(explain(res, i).split(' · ').slice(1).join(' · ').replace(/\bdein(e|en)? /g, '').replace(/^du:/, 'Tipp:').replace(/^(\w)/, c => c.toUpperCase()))}</span><em>+${res.points[i]}</em></div>`).join('');
  let head = '';
  if (res.kind === 'bid' || res.kind === 'final' || res.kind === 'dial') head = `<div class="rhead">Der echte Preis: <b id="pv">0,00 €</b></div>`;
  else if (res.kind === 'hilo') head = `<div class="rhead">${s.items.map((it, i) => `<span class="rp">${esc(it.e)} ${eur(it.p)}</span>`).join(' → ')}</div>`;
  else head = `<div class="rhead">Ziel: <b>${eur(res.reveal.target)}</b> · perfekte Lösung: ${res.reveal.solution.map((x, i) => (x ? s.items[i].e + ' ' + esc(s.items[i].n) : null)).filter(Boolean).join(' + ')}</div>`;
  el.innerHTML = head + '<div id="rrows"></div>';
  if (res.kind === 'dial') { drawGauge($('gauge'), s, res.answers.map((v, i) => ({ v, color: PCOL[i % 4], label: SH.players[i].name.slice(0, 6) })), res.reveal.price); }
  if (res.kind === 'bid' || res.kind === 'final' || res.kind === 'dial') { const target = res.reveal.price, t0 = performance.now(), dur = 1600 * (window.__prFast || 1); await new Promise(r => { (function tk(n) { const k = Math.min(1, (n - t0) / dur); $('pv').textContent = eur(target * (1 - Math.pow(1 - k, 3))); if (Math.floor(k * 14) !== Math.floor(((n - 16 - t0) / dur) * 14)) SFX.tick(); if (k < 1) requestAnimationFrame(tk); else r(); })(t0); }); $('pv').textContent = eur(target); }
  else await sleep(500);
  SFX.flip(); await sleep(500); $('rrows').innerHTML = rows(); if (best > 0) { SFX.fanfare(); SFX.clap(1); studio.cheer(1); studio.confetti(70); } else SFX.buzz();
}

// ---------------------------------------------------------------- Ablauf
async function startShow() {
  token++; resolving = false; nextShown = false; endShown = false; queue = []; curSlot = -1; closeHostInput(); lastResult = null;
  SH = new Show({ players: playerList(), length: cfg.length, diff: cfg.diff }, PRODUCTS); show('game'); $('stage').innerHTML = ''; $('reveal').hidden = true; $('act').innerHTML = ''; updatePlayers(); say('Willkommen beim Preisradar! Wer schätzt am besten?'); SFX.jingle(); studio.cheer(0.7);
  try { await sleep(1200); await runRound(SH.startRound()); } catch (e) { if (e !== ABORT) throw e; }
}
async function runRound(ev) {
  resolving = false; nextShown = false; lastResult = null; $('rinfo').innerHTML = `<small>Spiel ${ev.index + 1} von ${ev.total}</small> · ${TITLES[ev.kind]}`; renderStage(ev); updatePlayers(); $('act').innerHTML = '';
  say(ev.kind === 'final' ? 'Das große Preisfinale! Wie viel kostet das ganze Paket?' : `${TITLES[ev.kind]} – gebt eure geheimen Tipps ab!`); SFX.jingle(); await sleep(600);
  queue = SH.players.map((p, i) => (!p.cpu && !pair.has(i) ? i : -1)).filter(i => i >= 0); curSlot = -1; pair.push(); nextHot();
}
function nextHot() {
  if (!SH || SH.phase !== 'collect') return; queue = queue.filter(s => SH.answers[s] === undefined && !pair.has(s));
  if (!queue.length) { updatePlayers(); renderWait(); checkAll(); return; }
  curSlot = queue.shift(); const name = SH.players[curSlot].name; $('act').innerHTML = `<div class="cover"><div>🎩 <b>${esc(name)}</b> ist dran</div><small>Alle anderen bitte wegschauen – dein Tipp bleibt geheim!</small><button class="btn green" id="bReady">Bereit</button></div>`; $('bReady').onclick = () => { SFX.click(); openHostInput(curSlot); };
}
function renderWait() { if (!SH || SH.phase !== 'collect') return; const pend = SH.humansPending().map(i => SH.players[i].name); $('act').innerHTML = pend.length ? `<div class="info">⏳ Warte auf: ${pend.map(esc).join(', ')} 📱 <button class="btn ghost small" id="bSkip">Überspringen</button></div>` : ''; const b = $('bSkip'); if (b) b.onclick = () => { SH.humansPending().forEach(i => SH.submit(i, SH.spec.kind === 'hilo' ? [true, true, true] : SH.spec.kind === 'cart' ? [] : SH.spec.kind === 'dial' ? SH.spec.min : 0)); updatePlayers(); checkAll(); }; }
function openHostInput(slot) {
  closeHostInput(); $('act').innerHTML = ''; const dlg = $('inDlg'); dlg.hidden = false; const box = $('inBox'); const spec = publicSpec(SH.spec);
  hostInput = mountInput(box, spec, { name: `${SH.players[slot].name} – dein geheimer Tipp`, onSubmit: v => { closeHostInput(); submitFor(slot, v); }, onChange: v => { const cv = $('gaugeIn'); if (cv) drawGauge(cv, spec, [], null, v); } });
  if (spec.kind === 'dial') { box.insertAdjacentHTML('afterbegin', '<canvas id="gaugeIn" class="gauge"></canvas>'); drawGauge($('gaugeIn'), spec, [], null, (spec.min + spec.max) / 2); }
}
function closeHostInput() { if (hostInput) { hostInput.destroy(); hostInput = null; } $('inDlg').hidden = true; }
function submitFor(slot, v) {
  if (!SH || SH.phase !== 'collect') return; if (!SH.submit(slot, v)) return; SFX.click(); updatePlayers(); pair.push();
  if (slot === curSlot) { curSlot = -1; nextHot(); } else { renderWait(); checkAll(); }
}
function checkAll() { if (SH && SH.phase === 'collect' && SH.humansPending().length === 0 && queue.length === 0 && curSlot < 0) resolveRound(); }
async function resolveRound() {
  if (resolving || !SH || SH.phase !== 'collect') return; resolving = true; $('act').innerHTML = ''; closeHostInput(); const t = token;
  try {
    say('Alle Tipps sind abgegeben – und jetzt der Preis …'); await sleep(900); const res = SH.resolve(); if (!res) return; updatePlayers();
    lastResult = { points: res.points, lines: SH.players.map((p, i) => explain(res, i)) }; pair.push(); await showResult(res);
    const best = Math.max(...res.points), win = res.points.map((p, i) => (p === best && best > 0 ? SH.players[i].name : null)).filter(Boolean); say(win.length ? `Punkte für ${win.join(' & ')}! (+${best})` : 'Diesmal keine Punkte – knapp daneben!'); updatePlayers();
    await sleep(900); nextShown = true; const last = SH.index + 1 >= SH.total; $('act').innerHTML = `<button class="btn" id="bNext">${last ? 'Ergebnis ▶' : SH.index + 2 >= SH.total ? 'Zum Finale ▶' : 'Nächstes Spiel ▶'}</button>`; $('bNext').onclick = () => { SFX.click(); doNext(); }; pair.push();
  } catch (e) { if (e !== ABORT) throw e; }
}
async function doNext() {
  if (!SH || SH.phase !== 'reveal' || !nextShown) return; nextShown = false; $('act').innerHTML = '';
  try { const ev = SH.next(); if (ev.type === 'round') await runRound(ev); else showEnd(ev); } catch (e) { if (e !== ABORT) throw e; }
}
function showEnd(ev) {
  endShown = true; show('end'); const best = ev.winners; $('endTitle').textContent = best.length > 1 ? 'Unentschieden!' : `${SH.players[best[0]].name} gewinnt!`; $('trophy').textContent = best.length > 1 ? '🤝' : '🏆';
  $('endScores').innerHTML = SH.players.map((p, i) => `<div class="${best.includes(i) ? 'win' : ''}" style="--pc:${PCOL[i % 4]}">${esc(p.name)}<b>${p.total}</b></div>`).join(''); SFX.fanfare(); SFX.clap(2); studio.confetti(160); studio.cheer(1); pair.push();
}

// ---------------------------------------------------------------- Handy-Kopplung
function snapshot() {
  const names = SH ? SH.players.map(p => p.name) : playerList().map(p => p.name);
  if (!SH || !SH.spec) return { view: 'idle', players: names.map(n => ({ name: n, total: 0, done: false })), index: 0, phase: 'idle', say: '' };
  const sp = publicSpec(SH.spec);
  return { view: endShown ? 'end' : 'game', players: SH.players.map((p, i) => ({ name: p.name, total: p.total, done: SH.answers[i] !== undefined })), index: SH.index, total: SH.total, phase: SH.phase === 'collect' ? 'collect' : 'reveal', spec: sp, say: endShown ? $('endTitle').textContent : lastSay, result: SH.phase === 'reveal' ? lastResult : null, nextReady: nextShown };
}
const pair = initPair({
  names: () => (SH ? SH.players.map(p => p.name) : playerList().map(p => p.name)), freeSlot: () => { const n = SH ? SH.players.filter(p => !p.cpu).length : cfg.hum; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
  onJoin: (slot, name) => { cfg.names[slot] = name; if (SH && SH.players[slot]) { SH.players[slot].name = name; updatePlayers(); } },
  onMessage: (slot, m) => { if (m.t === 'ans') { if (SH && SH.phase === 'collect' && slot !== curSlot) submitFor(slot, m.v); } else if (m.t === 'next') doNext(); },
  snapshot, onChange: () => { if (SH) { updatePlayers(); if (SH.phase === 'collect' && curSlot < 0) nextHot(); } }
});
['bPairMenu', 'bPairSetup', 'bPairTop'].forEach(id => { $(id).onclick = () => { Audio_.unlock(); SFX.click(); pair.open(); }; });

// ---------------------------------------------------------------- Menüs
function renderNames() { $('names').innerHTML = Array.from({ length: cfg.hum }, (_, i) => `<input data-i="${i}" maxlength="14" value="${esc(cfg.names[i] || '')}" placeholder="Spieler ${i + 1}" aria-label="Name Spieler ${i + 1}" autocomplete="off">`).join(''); $('names').querySelectorAll('input').forEach(inp => { inp.oninput = () => { cfg.names[+inp.dataset.i] = inp.value; }; }); }
function syncSetup() {
  if (cfg.hum + cfg.cpu < 2) cfg.cpu = 1; if (cfg.hum + cfg.cpu > 4) cfg.cpu = 4 - cfg.hum; const seg = (id, v) => $(id).querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === String(v)); b.disabled = id === 'sgCpu' && cfg.hum + +b.dataset.v > 4; });
  seg('sgHum', cfg.hum); seg('sgCpu', cfg.cpu); seg('sgDiff', cfg.diff); seg('sgLen', cfg.length); $('fldDiff').hidden = cfg.cpu < 1; renderNames();
}
[['sgHum', 'hum', Number], ['sgCpu', 'cpu', Number], ['sgDiff', 'diff', String], ['sgLen', 'length', Number]].forEach(([id, k, cast]) => $(id).querySelectorAll('button').forEach(b => b.onclick = () => { SFX.click(); cfg[k] = cast(b.dataset.v); syncSetup(); }));
$('bPlay').onclick = () => { Audio_.unlock(); SFX.click(); syncSetup(); show('setup'); };
$('bSetBack').onclick = () => { SFX.click(); show('menu'); };
$('bStart').onclick = () => { Audio_.unlock(); SFX.click(); saveCfg(); startShow(); };
$('bRules').onclick = () => { SFX.click(); $('rules').hidden = false; }; $('rulesOk').onclick = () => { SFX.click(); $('rules').hidden = true; };
const setSound = v => { cfg.sound = v; saveCfg(); Audio_.setOn(v); $('bSound').textContent = v ? '🔊 Ton' : '🔇 Ton'; $('bSnd').textContent = v ? '🔊' : '🔇'; if (v) SFX.click(); };
$('bSound').onclick = () => setSound(!cfg.sound); $('bSnd').onclick = () => setSound(!cfg.sound); setSound(cfg.sound);
$('bMenu').onclick = () => { if (SH && !confirm('Spiel abbrechen und zurück ins Menü?')) return; abortToMenu(); };
$('bEndMenu').onclick = () => { SFX.click(); abortToMenu(); }; $('bAgain').onclick = () => { SFX.click(); startShow(); };
function abortToMenu() { token++; resolving = false; nextShown = false; endShown = false; queue = []; curSlot = -1; closeHostInput(); SH = null; lastResult = null; show('menu'); pair.push(); }
document.addEventListener('pointerdown', () => Audio_.unlock(), { once: true });
document.addEventListener('visibilitychange', () => studio.pause(document.hidden));
window.addEventListener('resize', () => { if (SH && SH.spec && SH.spec.kind === 'dial' && $('gauge') && !resolving) drawGauge($('gauge'), SH.spec, [], null); });
window.__pr = { get SH() { return SH; }, get phase() { return SH ? SH.phase : null; }, get nextShown() { return nextShown; }, get curSlot() { return curSlot; }, get endShown() { return endShown; }, submitFor, doNext, cfg, startShow, pair, PRODUCTS };
if (!JOIN) show('menu');
