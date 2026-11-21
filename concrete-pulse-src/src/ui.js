// Oberfläche: Menüs (Tastatur/TV/Touch/Controller über gamepad.js), HUD, Ergebnisse.
import { PARKS, SKATERS, BOARDS, customSkater } from './parks.js';
import { PIECES, THEMES, MAX_PIECES, MAX_SLOTS, newSlot, parkFromSlot } from './editor.js';
import { save, persist } from './save.js';
import * as A from './audio.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => Math.round(n).toLocaleString('de-DE');
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const MODE_NAME = { career: 'Karriere', score: 'Highscore-Lauf', free: 'Freies Fahren', duel: 'Duell', comp: 'Wettbewerb', skate: 'S-K-A-T-E' };
const MEDAL = ['', '🥉', '🥈', '🥇'];
const STAT_N = { speed: 'Tempo', ollie: 'Sprung', spin: 'Drehung', balance: 'Balance', air: 'Air' };
// Editor-Felder: [Schlüssel, Bezeichnung, [[Wert, Anzeige] …]]
const COLS = ['#ff5a3c', '#ffd43a', '#2ecc71', '#2ec4ff', '#7c4dff', '#ff4f8b', '#111318', '#f2f2f2', '#26324d', '#5a4636'];
const sw = c => [c, `<span class="sw" style="background:${c}"></span>`];
const EDIT = [
  ['body', 'Figur', [['m', 'A'], ['f', 'B']]],
  ['skin', 'Haut', ['#f0c7a3', '#e6b48f', '#c9926a', '#8d5a3b', '#5c3a26'].map(sw)],
  ['hairStyle', 'Frisur', [['short', 'Kurz'], ['long', 'Lang'], ['pony', 'Zopf'], ['bob', 'Bob'], ['afro', 'Locken'], ['bald', 'Glatze']]],
  ['hair', 'Haarfarbe', ['#120c08', '#2b1b12', '#d9a441', '#ff4f8b', '#6a3dff', '#e8e4d8'].map(sw)],
  ['hat', 'Kopf', [['none', 'Nichts'], ['cap', 'Kappe'], ['beanie', 'Mütze'], ['helmet', 'Helm']]],
  ['hatColor', 'Kopf-Farbe', COLS.slice(0, 8).map(sw)],
  ['topStyle', 'Oberteil', [['tee', 'Shirt'], ['tank', 'Top'], ['long', 'Langarm']]],
  ['top', 'Oberteil-Farbe', COLS.map(sw)],
  ['bottomStyle', 'Hose', [['pants', 'Lang'], ['shorts', 'Kurz']]],
  ['bottom', 'Hosen-Farbe', COLS.map(sw)],
  ['shoes', 'Schuhe', COLS.slice(0, 8).map(sw)]
];

export class UI {
  constructor() {
    this.stack = []; this.game = null;
    this.lets = $('#lets'); this.lets.innerHTML = 'PULSE'.split('').map(c => `<b>${c}</b>`).join('');
    // Menü-Navigation mit Pfeilen / Enter / Esc (Tastatur, TV-Fernbedienung)
    addEventListener('keydown', e => this.menuKey(e), true);
    document.addEventListener('click', e => this.click(e));
    $('#bPause').addEventListener('click', () => this.game && this.game.pause(true));
    $('#bGoals').addEventListener('click', () => this.game && this.toggleGoals(this.game));
    this.comboEl = $('#combo'); this.cT = $('#cT'); this.cV = $('#cV');
    this.initEditHud(); this.initReplayHud();
  }
  bind(game) { this.game = game; }

  // ---------------------------------------------------------- Menüs
  show(id, push = true) {
    const cur = $('.menu.on');
    if (cur && push && cur.id !== id) this.stack.push(cur.id);
    $$('.menu').forEach(m => m.classList.toggle('on', m.id === id));
    if (id) { const m = $('#' + id); this.fill(id); setTimeout(() => this.focusFirst(m), 30); }
    $('#hud').classList.toggle('off', !(this.game && (this.game.state === 'play' || this.game.state === 'ending') && !id));
    $('#touch').classList.toggle('on', !id && this.game && this.game.state === 'play');
  }
  hideAll() { this.stack = []; this.show(null, false); }
  back() {
    A.sfx('uiBack');
    if (!this.stack.length && this.game.state === 'edit') { this.show(null, false); return; }
    const id = this.stack.pop();
    if (id === 'mPause' || (!id && this.game.state === 'play')) { if (this.game.paused && !id) return this.game.pause(false); return this.show('mPause', false); }
    this.show(id || 'mMain', false);
    if ((id || 'mMain') === 'mMain' && this.game.state === 'menu') this.game.showcase(this.game.parkIdx);
  }
  focusFirst(m) {
    if (!m || document.documentElement.classList.contains('eg-pad')) return;
    const b = m.querySelector('.sel, .cur, .opt.on') || m.querySelector('button:not([disabled])');
    if (b && !document.documentElement.classList.contains('touch')) b.focus({ preventScroll: false });
  }
  menuKey(e) {
    const m = $('.menu.on'); if (!m) return;
    const k = e.key;
    if (e.target && e.target.tagName === 'INPUT' && k !== 'Escape' && k !== 'Enter') return;
    if (k === 'Escape' || k === 'Backspace' || k === 'GoBack' || k === 'BrowserBack') {
      e.preventDefault(); e.stopImmediatePropagation();
      const b = m.querySelector('[data-back]'); if (b) b.click(); else if (m.id === 'mPause') this.game.pause(false);
      return;
    }
    if (!/^Arrow/.test(k)) return;
    const btns = [...m.querySelectorAll('button:not([disabled])')].filter(b => b.offsetParent !== null);
    if (!btns.length) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const cur = document.activeElement && btns.includes(document.activeElement) ? document.activeElement : null;
    if (!cur) { btns[0].focus(); return; }
    const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
    let best = null, bd = 1e9;
    for (const b of btns) {
      if (b === cur) continue; const q = b.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
      const along = dx * dir[0] + dy * dir[1]; if (along <= 4) continue;
      const side = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]); const d = along + side * 2.2;
      if (d < bd) { bd = d; best = b; }
    }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); A.sfx('ui'); }
  }
  click(e) {
    const b = e.target.closest('button'); if (!b) return;
    A.initAudio();
    const g = this.game;
    if (b.hasAttribute('data-back')) return this.back();
    const go = b.dataset.go;
    if (go) { A.sfx('ui'); return this.go(go); }
    if (b.dataset.park != null) { if (b.classList.contains('lock')) { A.sfx('uiBack'); return; } A.sfx('ui'); return this.pickPark(+b.dataset.park); }
    if (b.dataset.sk != null) { if (b.classList.contains('lock')) return A.sfx('uiBack'); save.skater = +b.dataset.sk; persist(); A.sfx('ui'); this.fill('mSkater'); g.spawnSkater().then(() => g.skater.reset(g.park.spawn)); return; }
    if (b.dataset.statup) { A.sfx(g.addStat(g.skaterDef, b.dataset.statup) ? 'collect' : 'uiBack'); return this.fill('mSkater'); }
    if (b.hasAttribute('data-statreset')) { g.resetStats(g.skaterDef); A.sfx('ui'); return this.fill('mSkater'); }
    if (b.dataset.ed) { const v = b.dataset.v; save.custom[b.dataset.ed] = v; persist(); A.sfx('ui'); this.fill('mEdit'); if (save.skater === -1) { clearTimeout(this._edT); this._edT = setTimeout(() => g.spawnSkater().then(() => g.skater.reset(g.park.spawn)), 120); } return; }
    if (b.dataset.skate) { A.sfx('ui'); this.skatePlayers = +b.dataset.skate; this.parkMode = 'skate'; return this.show('mPark'); }
    if (b.dataset.bd != null) { if (b.classList.contains('lock')) return A.sfx('uiBack'); save.board = +b.dataset.bd; persist(); A.sfx('ui'); this.fill('mBoard'); g.spawnSkater().then(() => g.skater.reset(g.park.spawn)); return; }
    if (b.dataset.players) { A.sfx('ui'); this.duelPlayers = +b.dataset.players; this.parkMode = 'duel'; return this.show('mPark'); }
    if (b.classList.contains('opt')) {
      const key = b.parentElement.dataset.set; let v = b.dataset.v;
      v = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
      save.settings[key] = v; persist(); A.sfx('ui');
      if (key === 'music') { A.vol.music = v; A.setVolumes(); }
      if (key === 'sfx') { A.vol.sfx = v; A.setVolumes(); }
      if (key === 'track' && g.state === 'play') A.playMusic(v >= 0 ? v : g.park.music);
      if (key === 'quality') this.qualityChanged = true;
      this.fill('mSettings');
      return;
    }
    if (b.dataset.res) return this.resultAction(b.dataset.res);
    if (b.dataset.slot != null) { A.sfx('ui'); if (b.dataset.slot === 'new') { if (save.myParks.length >= MAX_SLOTS) return A.sfx('uiBack'); this.slotId = newSlot().id; } else this.slotId = +b.dataset.slot; return this.show('mSlot'); }
    if (b.dataset.slotact) return this.slotAction(b.dataset.slotact);
  }
  go(what) {
    const g = this.game;
    switch (what) {
      case 'career': case 'score': case 'free': this.parkMode = what; return this.show('mPark');
      case 'duel': return this.show('mDuel');
      case 'comp': this.parkMode = 'comp'; return this.show('mPark');
      case 'edit': if (save.skater !== -1) { save.skater = -1; persist(); g.spawnSkater().then(() => g.skater.reset(g.park.spawn)); } return this.show('mEdit');
      case 'skater': return this.show('mSkater');
      case 'board': return this.show('mBoard');
      case 'settings': return this.show('mSettings');
      case 'help': return this.show('mHelp');
      case 'resume': this.stack = []; return g.pause(false);
      case 'restart': this.stack = []; this.show(null, false); return g.restart();
      case 'goals': return this.show('mGoals');
      case 'quit': this.stack = []; g.quit(); this.show('mMain', false); return g.showcase(0);
      case 'parks': return this.show('mParks');
      case 'replay': this.stack = []; this.show(null, false); if (!g.openReplay('mPause')) this.show('mPause', false); return;
      case 'build': this.stack = []; this.show(null, false); g.paused = false; return g.editor.enter(false);
      case 'bauResume': this.stack = []; return this.show(null, false);
      case 'bauTest': this.stack = []; this.show(null, false); return g.editor.test();
      case 'bauTheme': this.stack = []; this.show(null, false); return g.editor.setTheme();
      case 'bauClear': if (!this._clr) { this._clr = true; $('#bauClear small').textContent = 'Nochmal drücken zum Bestätigen'; return; } this._clr = false; g.editor.clearAll(); this.stack = []; return this.show(null, false);
    }
  }
  async pickPark(i) {
    const g = this.game; this.stack = [];
    this.show(null, false);
    if (this.qualityChanged) { this.qualityChanged = false; }
    await g.start(this.parkMode, i, this.parkMode === 'duel' ? this.duelPlayers : this.parkMode === 'skate' ? this.skatePlayers : this.parkMode === 'comp' ? 'new' : undefined);
  }

  fill(id) {
    const g = this.game;
    if (id === 'mMain') {
      const n = g.goalsTotal(); $('#mStats').textContent = `🎯 ${n}/${PARKS.reduce((a, p) => a + p.goals.length, 0)} Ziele · Bestwert ${fmt(save.best || 0)}`;
    }
    if (id === 'mPark') {
      const mode = this.parkMode;
      $('#pTitle').textContent = MODE_NAME[mode] || 'Park';
      $('#pSub').textContent = mode === 'career' ? 'Erfülle Ziele im 2-Minuten-Lauf und sammle Stat-Punkte (grüne Marken). 5 Ziele schalten den nächsten Park frei.' : mode === 'free' ? 'Fahr ohne Zeitdruck – ideal zum Üben. Stat-Punkte kannst du auch hier sammeln.' : mode === 'duel' ? `${this.duelPlayers || 2} Spieler, je 60 Sekunden.` : mode === 'comp' ? 'Drei Läufe à 60 Sekunden vor der Jury. Die besten zwei zählen. Platz 1–3 gibt eine Medaille und Stat-Punkte.' : mode === 'skate' ? `${this.skatePlayers || 2} Spieler, je ein Combo-Versuch pro Runde.` : 'Zwei Minuten, ein Ziel: Punkte.';
      $('#pList').innerHTML = PARKS.map((p, i) => {
        const pr = save.parks[p.id] || { goals: [], best: 0 }, open = g.parkUnlocked(i) || mode === 'free' || mode === 'duel' || mode === 'skate', md = save.medals[p.id] || 0;
        return `<button class="card ${open ? '' : 'lock'}" data-park="${i}"><b>${open ? '' : '🔒 '}${p.name} ${md ? MEDAL[md] : ''}</b><span>${p.sub}</span><span>🎯 ${pr.goals.length}/${p.goals.length} · ⬢ ${(save.coins[p.id] || []).length}/${(p.coins || []).length} · Bestwert ${fmt(pr.best || 0)}</span>${open ? '' : '<span>5 Ziele im vorigen Park nötig</span>'}</button>`;
      }).join('');
    }
    if (id === 'mSkater') {
      const tot = g.goalsTotal();
      $('#skList').innerHTML = SKATERS.map((s, i) => { const lock = (s.unlock || 0) > tot; return `<button class="card ${i === save.skater ? 'cur' : ''} ${lock ? 'lock' : ''}" data-sk="${i}" style="min-height:64px"><b style="font-size:14px">${lock ? '🔒 ' : ''}${s.name}</b><span>${lock ? s.unlock + ' Ziele' : s.style}</span></button>`; }).join('')
        + `<button class="card ${save.skater === -1 ? 'cur' : ''}" data-sk="-1" style="min-height:64px"><b style="font-size:14px">✏️ ${save.custom.name || 'Eigener Skater'}</b><span>Eigenbau</span></button>`;
      const s = g.skaterDef, st = g.statsFor(s), free = g.statPoints() - g.spentFor(s.id);
      $('#skName').textContent = s.name; $('#skStyle').textContent = 'Stil: ' + s.style + ' · Spezial: ' + s.specials.map(x => x.name).join(', ');
      $('#skPts').innerHTML = `⬢ <b>${free}</b> ${free === 1 ? "freier Stat-Punkt" : "freie Stat-Punkte"} für ${s.name} · Punkte gibt es für Ziele, grüne Marken in den Parks und Medaillen`;
      $('#skStats').innerHTML = Object.keys(STAT_N).map(k => `<span>${STAT_N[k]} ${st[k]}</span><div class="bar"><i style="width:${st[k] * 10}%"></i></div><button data-statup="${k}" aria-label="${STAT_N[k]} erhöhen" ${free > 0 && st[k] < 10 ? '' : 'disabled'}>+</button>`).join('');
      $('#skEdit').querySelector('span:last-child').textContent = save.skater === -1 ? 'Aussehen' : 'Eigener Skater';
    }
    if (id === 'mEdit') {
      const c = save.custom;
      $('#edRows').innerHTML = EDIT.map(([k, label, opts]) => `<div class="set"><span>${label}</span><div class="opts">${opts.map(([v, t]) => `<button class="opt ${String(c[k]) === v ? 'on' : ''}" data-ed="${k}" data-v="${v}">${t}</button>`).join('')}</div></div>`).join('');
    }
    if (id === 'mBoard') {
      const tot = g.goalsTotal(), cur = save.board >= 0 ? save.board : g.skaterDef.board, gold = g.medalsGold();
      $('#bdList').innerHTML = BOARDS.map((b, i) => { const lock = (b.unlock || 0) > tot || (b.medal || 0) > gold; return `<button class="card ${i === cur ? 'cur' : ''} ${lock ? 'lock' : ''}" data-bd="${i}" style="min-height:64px"><b style="font-size:15px;background:linear-gradient(90deg,${b.c1},${b.c2});-webkit-background-clip:text;background-clip:text;color:transparent">${lock ? '🔒 ' : ''}${b.name}</b><span>${lock ? (b.medal ? b.medal + ' Goldmedaillen' : b.unlock + ' Ziele') : b.label}</span></button>`; }).join('');
      $('#bdName').textContent = BOARDS[cur] ? BOARDS[cur].name : '';
    }
    if (id === 'mSettings') {
      for (const box of $$('#mSettings [data-set]')) { const k = box.dataset.set, v = String(save.settings[k]); box.querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o.dataset.v === v)); }
      if (this.qualityChanged) $('#mSettings .sub') && 0;
    }
    if (id === 'mGoals') this.fillGoals();
    if (id === 'mParks') {
      const n = save.myParks.length;
      $('#mpList').innerHTML = save.myParks.map(s => { const b = (save.parks['mine-' + s.id] || {}).best || 0; return `<button class="card" data-slot="${s.id}"><b>🛠️ ${esc(s.name)}</b><span>${s.pieces.length} Bauteile · ${THEMES[s.theme || 0].name}</span><span>Bestwert ${fmt(b)}</span></button>`; }).join('')
        + (n < MAX_SLOTS ? `<button class="card" data-slot="new"><b>＋ Neuer Park</b><span>Startet mit ein paar Bauteilen – alles änderbar</span><span>${n}/${MAX_SLOTS} Plätze belegt</span></button>` : '');
    }
    if (id === 'mSlot') {
      const s = save.myParks.find(x => x.id === this.slotId); if (!s) return;
      $('#slName').value = s.name; this._del = false;
      $('#slInfo').textContent = `${s.pieces.length}/${MAX_PIECES} Bauteile · Stimmung: ${THEMES[s.theme || 0].name} · Bestwert ${fmt((save.parks['mine-' + s.id] || {}).best || 0)}`;
      $('#slDel small').textContent = 'Park endgültig entfernen';
    }
    if (id === 'mBau') { const s = g.editor.slot; $('#bauSub').textContent = s ? `${s.name} · ${s.pieces.length}/${MAX_PIECES} Bauteile · wird automatisch gespeichert` : ''; $('#bauTheme small').textContent = 'Jetzt: ' + THEMES[(s && s.theme) || 0].name; this._clr = false; $('#bauClear small').textContent = 'Alle Bauteile entfernen'; }
    if (id === 'mPause') { const p = g.park; $('#psSub').textContent = p.name + ' · ' + (g.editor.testing ? 'Testfahrt' : MODE_NAME[g.mode]); $('#psBuild').hidden = !g.editor.testing; $('#psReplay').hidden = !g.canReplay(); $('#psGoals').hidden = !!g.custom; }
  }
  fillGoals() {
    const g = this.game, p = g.park, pr = save.parks[p.id] || { goals: [] };
    $('#glTitle').textContent = 'Ziele · ' + p.name;
    $('#glSub').textContent = g.mode === 'career' ? `${pr.goals.length}/${p.goals.length} erledigt. Ziele zählen nur in der Karriere.` : 'Ziele zählen nur in der Karriere – hier kannst du üben.';
    $('#glList').innerHTML = p.goals.map((x, i) => `<div class="${pr.goals.includes(i) ? 'ok' : ''}"><i>${pr.goals.includes(i) ? '✓' : '○'}</i>${x.text}</div>`).join('');
  }
  toggleGoals(g) { if ($('#mGoals').classList.contains('on')) { this.show(null, false); g.paused = false; } else { g.paused = true; this.stack = []; this.show('mGoals', false); this._goalsFromGame = true; } }

  loading(on, name) { const l = $('#loading'); if (on) { l.classList.remove('hide'); $('#ldTxt').textContent = name ? name + ' wird aufgebaut …' : 'Lädt …'; } else l.classList.add('hide'); }

  // ---------------------------------------------------------- HUD
  startRun(g) {
    this.show(null, false); this.stack = [];
    $('#feed').innerHTML = ''; this.letters(new Set());
    $('#hTime').hidden = g.mode === 'free'; $('#bGoals').hidden = g.mode !== 'career';
    this.lastPts = -1; this.comboHold = 0; this.comboEl.className = ''; this.cT.textContent = ''; this.cV.textContent = '';
    const dev = g.input.lastDevice;
    $('#hint').textContent = dev === 'pad' ? 'A Ollie · X Flip · B Grab · Y Grind · LB/RB Drehen · Hoch→Runter Manual · LT/RT Revert' : 'Leertaste Ollie · J Flip · K Grab · L Grind · Q/E Drehen · W→S Manual · R Revert · Esc Pause';
    setTimeout(() => { $('#hint').style.opacity = '0'; $('#hint').style.transition = 'opacity 1s'; }, 9000);
    $('#hint').style.opacity = '1';
    const pr = save.parks[g.park.id] || { goals: [] }; $('#gCount').textContent = `${pr.goals.length}/${g.park.goals.length}`;
    if (g.mode === 'duel') this.flash(`Spieler ${g.duel.cur + 1}`);
    else if (g.mode === 'comp') this.flash(`Lauf ${g.comp.run + 1} von 3`);
    else if (g.mode === 'skate') { this.flash(`Spieler ${g.skate.cur + 1}: eine Combo!`); this.feed('S-K-A-T-E: Lande eine Combo – nur der erste Versuch zählt', 'gap'); }
    else this.flash(g.park.name);
  }
  hud(g, dt) {
    const sk = g.skater, run = g.run;
    if (run.score !== this.lastPts) { $('#hPts').textContent = fmt(run.score); this.lastPts = run.score; }
    if (run.t !== Infinity) { const t = Math.ceil(run.t), s = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; const el = $('#hTime'); if (el.textContent !== s) el.textContent = s; el.classList.toggle('low', run.t <= 10 && run.t > 0); }
    const sp = $('#spec'); sp.firstChild.style.width = (sk.special * 100).toFixed(1) + '%'; sp.classList.toggle('full', sk.special >= 1);
    // Combo
    const c = sk.combo;
    if (c.active) { this.comboEl.className = ''; this.cT.textContent = c.text(); this.cV.innerHTML = `${fmt(c.sum)} <em>× ${c.mult}</em>`; this.comboEl.style.opacity = 1; this.comboHold = 0; }
    else if (this.comboHold > 0) { this.comboHold -= dt; if (this.comboHold <= 0) this.comboEl.style.opacity = 0; }
    else this.comboEl.style.opacity = 0;
    // Balance
    const bal = $('#bal');
    if (sk.grind) { bal.className = 'on'; bal.firstChild.style.left = (50 + sk.grind.bal * 50) + '%'; bal.firstChild.style.top = ''; }
    else if (sk.manual) { bal.className = 'on v'; bal.firstChild.style.top = (50 - sk.manual.bal * 50) + '%'; bal.firstChild.style.left = ''; }
    else bal.className = '';
  }
  bank(v, list) { this.comboEl.className = 'bank'; this.cV.innerHTML = '+' + fmt(v); this.comboHold = 1.6; this.comboEl.style.opacity = 1; }
  bail(why, lost) { this.comboEl.className = 'fail'; this.cT.textContent = why; this.cV.textContent = lost ? '−' + fmt(lost) : 'Sturz!'; this.comboHold = 1.6; this.comboEl.style.opacity = 1; }
  trick(e, special, gap) {
    const t = $('#trk'); t.textContent = (gap ? '⟿ ' : '') + e.name; t.className = special ? 'spec' : ''; void t.offsetWidth; t.classList.add('go');
    if (gap) this.feed(e.name + ' +' + fmt(e.pts), 'gap');
  }
  flash(txt) { const f = $('#flash'); f.textContent = txt; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  feed(txt, cls) { const d = document.createElement('div'); d.textContent = txt; if (cls) d.className = cls; const F = $('#feed'); F.prepend(d); while (F.children.length > 4) F.lastChild.remove(); setTimeout(() => d.remove(), 4200); }
  letters(set) { [...this.lets.children].forEach((b, i) => b.classList.toggle('on', set.has(i))); }
  goalDone(goal, g) { this.feed('✓ Ziel: ' + goal.text, 'goal'); this.flash('Ziel geschafft!'); const pr = save.parks[g.park.id]; $('#gCount').textContent = `${pr.goals.length}/${g.park.goals.length}`; }
  pause(on, g) { if (on) { this.stack = []; this.show('mPause', false); } else { this.stack = []; this.show(null, false); } }

  currentMenu() { const m = $('.menu.on'); return m ? m.id : null; }

  // ---------------------------------------------------------- Eigene Parks
  async slotAction(k) {
    const g = this.game, s = save.myParks.find(x => x.id === this.slotId); if (!s) return;
    const nm = $('#slName').value.trim(); if (nm && nm !== s.name) { s.name = nm.slice(0, 24); persist(); }
    A.sfx('ui');
    if (k === 'del') {
      if (!this._del) { this._del = true; $('#slDel small').textContent = 'Nochmal drücken zum Löschen'; return; }
      save.myParks.splice(save.myParks.indexOf(s), 1); delete save.parks['mine-' + s.id]; persist(); this.stack = []; return this.show('mParks', false);
    }
    this.stack = []; this.show(null, false);
    if (k === 'edit') return g.editor.open(s.id);
    if (k === 'free' || k === 'score') { g.editor.slotId = s.id; return g.start(k, 0, undefined, { def: parkFromSlot(s) }); }
  }

  // ---------------------------------------------------------- Park-Editor (HUD)
  initEditHud() {
    $('#edStrip').innerHTML = PIECES.map((p, i) => `<button data-pc="${i}"><i>${p.ic}</i><b>${p.name}</b></button>`).join('');
    const hud = $('#edHud');
    hud.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); A.initAudio();
      const ed = this.game.editor; if (this.game.state !== 'edit') return;
      if (b.dataset.pc != null) return ed.choose(+b.dataset.pc);
      const a = b.dataset.bau;
      if (a === 'place') ed.place(); else if (a === 'del') ed.remove(); else if (a === 'undo') ed.back(); else if (a === 'rot') ed.turn();
      else if (a === 'cam') ed.cam(); else if (a === 'zoom') ed.zoomStep(); else if (a === 'prev') ed.pick(-1); else if (a === 'next') ed.pick(1);
      else if (a === 'test') ed.test(); else if (a === 'menu') this.editMenu();
    });
    // Zeigen/Tippen auf das Spielfeld setzt den Cursor; Mausklick setzt das Bauteil direkt
    const cv = $('#cv'); let down = null;
    cv.addEventListener('pointerdown', e => { if (this.game.state !== 'edit' || $('.menu.on')) return; down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, m: e.pointerType === 'mouse', b: e.button }; if (!down.m) this.game.editor.pointerTo(e.clientX, e.clientY); });
    cv.addEventListener('pointermove', e => { if (this.game.state !== 'edit' || $('.menu.on')) return; if (e.pointerType === 'mouse' || (down && down.id === e.pointerId)) this.game.editor.pointerTo(e.clientX, e.clientY); });
    cv.addEventListener('pointerup', e => {
      if (!down || down.id !== e.pointerId) return; const d = down; down = null;
      if (this.game.state !== 'edit') return;
      if (d.m && d.b === 0 && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) { this.game.editor.pointerTo(e.clientX, e.clientY); this.game.editor.place(); }
      if (d.m && d.b === 2) this.game.editor.remove();
    });
    cv.addEventListener('contextmenu', e => { if (this.game.state === 'edit') e.preventDefault(); });
    cv.addEventListener('wheel', e => { if (this.game.state !== 'edit') return; e.preventDefault(); this.game.editor.zoomStep(e.deltaY > 0 ? 1 : -1); }, { passive: false });
    addEventListener('keydown', e => {
      if (this.game.state !== 'edit' || $('.menu.on') || (e.target && e.target.tagName === 'INPUT')) return;
      const ed = this.game.editor, k = e.code;
      if (k === 'Delete' || k === 'Backspace' || k === 'KeyX') { e.preventDefault(); ed.remove(); }
      else if (k === 'KeyZ' || k === 'KeyU') ed.back();
      else if (k === 'KeyC') ed.cam();
      else if (k === 'KeyV') ed.zoomStep();
      else if (k === 'KeyT') ed.test();
    });
  }
  editHud(on, ed) {
    $('#edHud').hidden = !on; $('#hud').classList.add('off'); $('#touch').classList.remove('on');
    if (on) { this.stack = []; this.show(null, false); $('#hud').classList.add('off'); this.editInfo(ed); const dev = this.game.input.lastDevice;
      $('#edHint').textContent = dev === 'pad' ? 'Stick Cursor · A Setzen · Y Drehen · X Löschen · B Zurück · LB/RB Bauteil · rechter Stick Kamera · Select Testfahrt · Start Menü' : 'WASD Cursor · Klick/Leertaste Setzen · R Drehen · Entf/Rechtsklick Löschen · Z Zurück · Q/E Bauteil · C Kamera · Mausrad Zoom · T Testfahrt · Esc Menü'; }
  }
  editInfo(ed) {
    const s = ed.slot; if (!s) return; const P = PIECES[ed.sel];
    $('#edName').textContent = s.name; $('#edCount').textContent = `${s.pieces.length}/${MAX_PIECES} Bauteile`;
    $('#edCur').innerHTML = `<i>${P.ic}</i> ${P.name} · ${ed.rot * 90}°`;
    const hi = ed.hovered(); $('#edOver').textContent = hi >= 0 ? 'Unter dem Cursor: ' + PIECES.find(p => p.id === s.pieces[hi].t).name : '';
    $$('#edStrip button').forEach((b, i) => b.classList.toggle('on', i === ed.sel));
    const cb = $('#edStrip button.on'); if (cb && cb.scrollIntoView && !this._noScroll) cb.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  editMsg(txt) { const m = $('#edMsg'); m.textContent = txt; m.classList.remove('go'); void m.offsetWidth; m.classList.add('go'); }
  editMenu() { this.stack = []; this.show('mBau', false); }

  // ---------------------------------------------------------- Replay (HUD)
  initReplayHud() {
    $('#rp').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); const p = this.game.player; if (!p) return;
      const a = b.dataset.rp;
      if (a === 'play') p.toggle(); else if (a === 'back') p.seek(p.pos - 5); else if (a === 'fwd') p.seek(p.pos + 5);
      else if (a === 'speed') p.nextSpeed(); else if (a === 'cam') p.nextCam(); else if (a === 'exit') this.game.closeReplay();
    });
    $('#rpSeek').addEventListener('input', e => { const p = this.game.player; if (p) p.seek(e.target.value / 1000 * p.duration); });
  }
  replayHud(on, p) {
    $('#rp').hidden = !on; if (on) { this.show(null, false); $('#hud').classList.add('off'); $('#touch').classList.remove('on'); $('#rpTrk').textContent = ''; }
  }
  replayTick(p) {
    const t = p.pos, f = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const s = f(t) + ' / ' + f(p.duration); if (this._rpS !== s) { this._rpS = s; $('#rpTime').textContent = s; }
    if (document.activeElement !== $('#rpSeek')) $('#rpSeek').value = Math.round(t / (p.duration || 1) * 1000);
    $('#rpPlay').textContent = p.playing ? '❚❚' : '▶'; $('#rpSpeed').textContent = p.speed + '×'; $('#rpCam').textContent = '🎥 ' + p.camName;
    const v = fmt(p.score || 0); if (this._rpV !== v) { this._rpV = v; $('#rpPts').textContent = v; }
  }
  replayTrick(ev) { const t = $('#rpTrk'); t.textContent = ev.txt; t.className = ev.cls || ''; void t.offsetWidth; t.classList.add('go'); }

  results(g, r) {
    this.stack = [];
    const duel = g.mode === 'duel' ? g.duel : null, comp = g.mode === 'comp' ? g.comp : null, sk8 = g.mode === 'skate' ? g.skate : null;
    $('#rsTitle').textContent = duel ? `Spieler ${duel.cur} fertig` : comp ? (comp.run >= 3 ? 'Wettbewerb beendet' : `Lauf ${comp.run} von 3`) : sk8 ? (sk8.winner != null ? 'S-K-A-T-E beendet' : 'Zug beendet') : g.mode === 'free' ? 'Session beendet' : 'Lauf beendet';
    $('#rsScore').textContent = fmt(r.score);
    $('#rsSub').textContent = g.park.name + (r.newBest ? ' · Neuer Bestwert!' : '');
    $('#rsInfo').textContent = `Beste Combo: ${fmt(r.bestCombo)}`;
    let goalsHtml = '';
    if (g.mode === 'career') {
      const pr = save.parks[g.park.id];
      goalsHtml = g.park.goals.map((x, i) => `<div class="${pr.goals.includes(i) ? 'ok' : ''}"><i>${r.done.includes(i) ? '★' : pr.goals.includes(i) ? '✓' : '○'}</i>${x.text}</div>`).join('');
      const next = g.park === PARKS[PARKS.length - 1] ? null : PARKS[PARKS.indexOf(g.park) + 1];
      if (next && pr.goals.length >= 5 && r.done.length && pr.goals.length - r.done.filter(Boolean).length < 5) goalsHtml += `<div class="ok"><i>🔓</i>${next.name} freigeschaltet!</div>`;
    }
    if (duel) {
      const sc = duel.scores, done = duel.cur >= duel.players;
      goalsHtml = sc.map((s, i) => `<div class="${done && s === Math.max(...sc) ? 'ok' : ''}"><i>${done && s === Math.max(...sc) ? '🏆' : i + 1}</i>Spieler ${i + 1}: ${fmt(s)}</div>`).join('');
      if (!done) goalsHtml += `<div><i>➜</i>Als Nächstes: Spieler ${duel.cur + 1} – Gerät weitergeben!</div>`;
    }
    if (comp) {
      const last = comp.scores[comp.scores.length - 1];
      $('#rsInfo').textContent = `Jury: ${last.judges.map(j => j.toFixed(1)).join(' · ')} → ${last.avg.toFixed(1)} · ${r.bestCombo ? 'Beste Combo ' + fmt(r.bestCombo) : ''}`;
      if (comp.run >= 3) {
        goalsHtml = comp.table.map((t, i) => `<div class="${t.me ? 'ok' : ''}"><i>${i < 3 ? MEDAL[3 - i] : i + 1}</i>${t.name}: ${t.score.toFixed(1)}</div>`).join('');
        if (comp.newMedal) goalsHtml += `<div class="ok"><i>⬢</i>Neue Medaille – mehr Stat-Punkte!</div>`;
      } else goalsHtml = comp.scores.map((x, i) => `<div><i>${i + 1}</i>Lauf ${i + 1}: ${x.avg.toFixed(1)} (${fmt(x.pts)} Punkte)</div>`).join('') + comp.rivals.map(t => `<div><i>•</i>${t.name}: ${t.score.toFixed(1)}</div>`).join('');
    }
    if (sk8) {
      const W = 'SKATE';
      $('#rsScore').textContent = r.score ? fmt(r.score) : 'Kein Combo';
      goalsHtml = sk8.letters.map((l, i) => `<div class="${sk8.winner === i ? 'ok' : ''}"><i>${sk8.winner === i ? '🏆' : l >= 5 ? '✗' : i + 1}</i>Spieler ${i + 1}: <b style="letter-spacing:.2em;margin-left:6px">${W.slice(0, l) || '–'}</b></div>`).join('');
      if (sk8.last && sk8.round.length === 0) goalsHtml = `<div><i>ℹ</i>${sk8.last.loser >= 0 ? `Runde vorbei: Spieler ${sk8.last.loser + 1} bekommt einen Buchstaben.` : 'Runde vorbei: Gleichstand, kein Buchstabe.'}</div>` + goalsHtml;
      if (sk8.winner == null) goalsHtml += `<div><i>➜</i>Als Nächstes: Spieler ${sk8.cur + 1} – Gerät weitergeben!</div>`;
    }
    $('#rsGoals').innerHTML = goalsHtml;
    const btns = [];
    if (comp && comp.run < 3) btns.push(['compNext', '▶', `Lauf ${comp.run + 1} starten`, true]);
    else if (comp) btns.push(['compAgain', '↻', 'Neuer Wettbewerb', true]);
    else if (sk8 && sk8.winner == null) btns.push(['skateNext', '▶', `Spieler ${sk8.cur + 1} starten`, true]);
    else if (sk8) btns.push(['skateAgain', '↻', 'Neue Partie', true]);
    else if (duel && duel.cur < duel.players) btns.push(['next', '▶', `Spieler ${duel.cur + 1} starten`, true]);
    else if (duel) btns.push(['duelAgain', '↻', 'Neues Duell', true]);
    else btns.push(['again', '↻', 'Nochmal', true]);
    if (g.canReplay()) btns.push(['replay', '🎬', 'Replay']);
    if (g.editor.testing) btns.push(['build', '🛠️', 'Weiter bauen']);
    btns.push(['menu', '⌂', 'Hauptmenü']);
    $('#rsBtns').innerHTML = btns.map(([k, ic, t, p]) => `<button class="btn ${p ? 'prim' : ''}" data-res="${k}"><span class="ic">${ic}</span><span>${t}</span></button>`).join('');
    this.show('mResults', false);
  }
  async resultAction(k) {
    const g = this.game; A.sfx('ui'); this.stack = []; this.show(null, false);
    if (k === 'replay') { if (!g.openReplay('mResults')) this.show('mResults', false); return; }
    if (k === 'build') return g.editor.enter(false);
    if (k === 'again') return g.restart();
    if (k === 'next') return g.start('duel', g.parkIdx);
    if (k === 'duelAgain') { const n = g.duel.players; g.duel = null; return g.start('duel', g.parkIdx, n); }
    if (k === 'compNext') return g.start('comp', g.parkIdx);
    if (k === 'compAgain') return g.start('comp', g.parkIdx, 'new');
    if (k === 'skateNext') return g.start('skate', g.parkIdx);
    if (k === 'skateAgain') return g.start('skate', g.parkIdx, g.skate.players);
    g.quit(); this.show('mMain', false); g.showcase(0);
  }
}
