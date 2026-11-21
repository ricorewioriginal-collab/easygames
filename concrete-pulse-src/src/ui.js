// Oberfläche: Menüs (Tastatur/TV/Touch/Controller über gamepad.js), HUD, Ergebnisse.
import { PARKS, SKATERS, BOARDS } from './parks.js';
import { save, persist } from './save.js';
import * as A from './audio.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => Math.round(n).toLocaleString('de-DE');

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
  }
  go(what) {
    const g = this.game;
    switch (what) {
      case 'career': case 'score': case 'free': this.parkMode = what; return this.show('mPark');
      case 'duel': return this.show('mDuel');
      case 'skater': return this.show('mSkater');
      case 'board': return this.show('mBoard');
      case 'settings': return this.show('mSettings');
      case 'help': return this.show('mHelp');
      case 'resume': this.stack = []; return g.pause(false);
      case 'restart': this.stack = []; this.show(null, false); return g.restart();
      case 'goals': return this.show('mGoals');
      case 'quit': this.stack = []; g.quit(); this.show('mMain', false); return g.showcase(0);
    }
  }
  async pickPark(i) {
    const g = this.game; this.stack = [];
    this.show(null, false);
    if (this.qualityChanged) { this.qualityChanged = false; }
    await g.start(this.parkMode, i, this.parkMode === 'duel' ? this.duelPlayers : undefined);
  }

  fill(id) {
    const g = this.game;
    if (id === 'mMain') {
      const n = g.goalsTotal(); $('#mStats').textContent = `🎯 ${n}/${PARKS.reduce((a, p) => a + p.goals.length, 0)} Ziele · Bestwert ${fmt(save.best || 0)}`;
    }
    if (id === 'mPark') {
      const mode = this.parkMode;
      $('#pTitle').textContent = { career: 'Karriere', score: 'Highscore-Lauf', free: 'Freies Fahren', duel: 'Duell' }[mode] || 'Park';
      $('#pSub').textContent = mode === 'career' ? 'Erfülle Ziele im 2-Minuten-Lauf. 5 Ziele schalten den nächsten Park frei.' : mode === 'free' ? 'Fahr ohne Zeitdruck – ideal zum Üben.' : mode === 'duel' ? `${this.duelPlayers || 2} Spieler, je 60 Sekunden.` : 'Zwei Minuten, ein Ziel: Punkte.';
      $('#pList').innerHTML = PARKS.map((p, i) => {
        const pr = save.parks[p.id] || { goals: [], best: 0 }, open = g.parkUnlocked(i) || mode === 'free';
        return `<button class="card ${open ? '' : 'lock'}" data-park="${i}"><b>${open ? '' : '🔒 '}${p.name}</b><span>${p.sub}</span><span>🎯 ${pr.goals.length}/${p.goals.length} · Bestwert ${fmt(pr.best || 0)}</span>${open ? '' : '<span>5 Ziele im vorigen Park nötig</span>'}</button>`;
      }).join('');
    }
    if (id === 'mSkater') {
      const tot = g.goalsTotal();
      $('#skList').innerHTML = SKATERS.map((s, i) => { const lock = (s.unlock || 0) > tot; return `<button class="card ${i === save.skater ? 'cur' : ''} ${lock ? 'lock' : ''}" data-sk="${i}" style="min-height:70px"><b style="font-size:15px">${lock ? '🔒 ' : ''}${s.name}</b><span>${lock ? s.unlock + ' Ziele' : s.style}</span></button>`; }).join('');
      const s = g.skaterDef; $('#skName').textContent = s.name; $('#skStyle').textContent = 'Stil: ' + s.style + ' · Spezial: ' + s.specials.map(x => x.name).join(', ');
      const N = { speed: 'Tempo', ollie: 'Sprung', spin: 'Drehung', balance: 'Balance', air: 'Air' };
      $('#skStats').innerHTML = Object.keys(N).map(k => `<span>${N[k]}</span><i style="width:${s.stats[k] * 10}%"></i>`).join('');
    }
    if (id === 'mBoard') {
      const tot = g.goalsTotal(), cur = save.board >= 0 ? save.board : g.skaterDef.board;
      $('#bdList').innerHTML = BOARDS.map((b, i) => { const lock = (b.unlock || 0) > tot; return `<button class="card ${i === cur ? 'cur' : ''} ${lock ? 'lock' : ''}" data-bd="${i}" style="min-height:64px"><b style="font-size:15px;background:linear-gradient(90deg,${b.c1},${b.c2});-webkit-background-clip:text;background-clip:text;color:transparent">${lock ? '🔒 ' : ''}${b.name}</b><span>${lock ? b.unlock + ' Ziele' : b.label}</span></button>`; }).join('');
      $('#bdName').textContent = BOARDS[cur] ? BOARDS[cur].name : '';
    }
    if (id === 'mSettings') {
      for (const box of $$('#mSettings [data-set]')) { const k = box.dataset.set, v = String(save.settings[k]); box.querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o.dataset.v === v)); }
      if (this.qualityChanged) $('#mSettings .sub') && 0;
    }
    if (id === 'mGoals') this.fillGoals();
    if (id === 'mPause') { const p = g.park; $('#psSub').textContent = p.name + ' · ' + ({ career: 'Karriere', score: 'Highscore-Lauf', free: 'Freies Fahren', duel: 'Duell' }[g.mode]); }
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
    if (g.mode === 'duel') this.flash(`Spieler ${g.duel.cur + 1}`); else this.flash(g.park.name);
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

  results(g, r) {
    this.stack = [];
    const duel = g.mode === 'duel' ? g.duel : null;
    $('#rsTitle').textContent = duel ? `Spieler ${duel.cur} fertig` : g.mode === 'free' ? 'Session beendet' : 'Lauf beendet';
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
    $('#rsGoals').innerHTML = goalsHtml;
    const btns = [];
    if (duel && duel.cur < duel.players) btns.push(['next', '▶', `Spieler ${duel.cur + 1} starten`, true]);
    else if (duel) btns.push(['duelAgain', '↻', 'Neues Duell', true]);
    else btns.push(['again', '↻', 'Nochmal', true]);
    btns.push(['menu', '⌂', 'Hauptmenü']);
    $('#rsBtns').innerHTML = btns.map(([k, ic, t, p]) => `<button class="btn ${p ? 'prim' : ''}" data-res="${k}"><span class="ic">${ic}</span><span>${t}</span></button>`).join('');
    this.show('mResults', false);
  }
  async resultAction(k) {
    const g = this.game; A.sfx('ui'); this.stack = []; this.show(null, false);
    if (k === 'again') return g.restart();
    if (k === 'next') return g.start('duel', g.parkIdx);
    if (k === 'duelAgain') { const n = g.duel.players; g.duel = null; return g.start('duel', g.parkIdx, n); }
    g.quit(); this.show('mMain', false); g.showcase(0);
  }
}
