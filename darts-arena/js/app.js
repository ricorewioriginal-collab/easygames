/* Darts-Arena 3D – App: Ladebildschirm, Titel, Konsolen-Menü, Spielmodi mit Einrichtung (1–4 Spieler, auch Computer in 3 Stärken),
 * Wurf per Wischen (Ziehen = zielen, Wischtempo = Höhe, Wischrichtung = Seite), Tastatur und Controller (Kraftbalken), zitternde Hand,
 * Anzeigetafel je Modus (X01 mit Checkout-Hilfe, Cricket-Tafel), Caller, Ergebnis-Bildschirm und Rekorde. Regeln: js/core.js (DA). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'darts-arena-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, caller: true, vib: true, low: false, reticle: true, zoom: true, feel: 1, setup: {} }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.DASound, SC = window.DAScene;
  S.sfxOn = SET.sound; S.musicOn = SET.music; S.callerOn = SET.caller;
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let has3d = false;
  const LV = DA.LEVEL;
  const FEEL = [{ n: 'Locker', d: 'Ruhige Hand, Wischfehler zählen nur halb.', sway: 2.2, err: .45, sd: 2.6 }, { n: 'Normal', d: 'Wie am echten Board: leichtes Zittern, das Wischtempo zählt.', sway: 4.2, err: 1, sd: 4 }, { n: 'Profi', d: 'Spürbar zitternde Hand, jeder Wisch zählt voll.', sway: 6.5, err: 1.35, sd: 5.2 }];
  const feel = () => FEEL[clamp(SET.feel | 0, 0, 2)];

  /* ---------- Spielmodi für die Oberfläche ---------- */
  const ML = [
    { id: 'x01', i: '🎯', n: '501 / 301 / 701', d: 'Der Klassiker: genau auf 0, Doppel zum Schluss', opts: [['start', 'Startpunkte', [[301, '301'], [501, '501'], [701, '701']], 501], ['in', 'Einstieg', [['single', 'Single In'], ['double', 'Double In']], 'single'], ['out', 'Ausstieg', [['double', 'Double Out'], ['master', 'Master Out'], ['single', 'Single Out']], 'double'], ['legs', 'Legs zum Sieg', [[1, '1'], [2, '2'], [3, '3']], 1]] },
    { id: 'cricket', i: '🦗', n: 'Cricket', d: '15–20 und Bull schließen und punkten', opts: [['variant', 'Variante', [['std', 'Standard'], ['cut', 'Cut-Throat'], ['none', 'Ohne Punkte']], 'std']] },
    { id: 'elimination', i: '💥', n: 'Elimination', d: 'Hoch bis 301 – gleiche Punktzahl wirft raus', min: 2, opts: [['target', 'Ziel', [[301, '301'], [501, '501']], 301]] },
    { id: 'killer', i: '🔪', n: 'Killer', d: 'Eigenes Doppel treffen, dann Leben jagen', min: 2, opts: [['lives', 'Leben', [[3, '3'], [5, '5']], 3]] },
    { id: 'shanghai', i: '🀄', n: 'Shanghai', d: 'Runde für Runde – ein Shanghai gewinnt sofort', opts: [['rounds', 'Runden', [[7, '1 – 7'], [20, '1 – 20']], 7]] },
    { id: 'halveit', i: '✂️', n: 'Halve-It', d: 'Ziel verfehlt = Punkte halbiert' },
    { id: 'clock', i: '🕐', n: 'Around the Clock', d: '1 bis 20 und Bull der Reihe nach', solo: true, opts: [['variant', 'Treffer', [['any', 'Alle Felder'], ['double', 'Nur Doppel'], ['triple', 'Nur Triple']], 'any']] },
    { id: 'bobs27', i: '🎓', n: 'Bob’s 27', d: 'Das Doppel-Training der Profis', solo: true },
    { id: 'countup', i: '📈', n: 'Count-Up', d: '8 Aufnahmen, höchste Summe – zählt für die Rangliste', solo: true, opts: [['rounds', 'Aufnahmen', [[8, '8'], [10, '10']], 8]] },
    { id: 'training', i: '🏋️', n: 'Freies Training', d: 'Werfen ohne Regeln', solo: true, max: 1 }
  ];
  const ml = id => ML.find(m => m.id === id);
  const modeName = (id, o) => id === 'x01' ? (o && o.start || 501) + (o && o.out === 'master' ? ' Master-Out' : o && o.out === 'single' ? ' Single-Out' : ' Double-Out') : ml(id).n;

  /* ---------- Rekorde ---------- */
  const ST = Object.assign({ games: 0, wins: [0, 0, 0], darts: 0, pts: 0, n180: 0, hiTurn: 0, hiCo: 0, bestLeg: 0, bestAvg: 0, bestBob: null, bestClock: 0, bestHalve: 0, shanghai: 0, kicks: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => LS.set(P + 'stats', ST);
  const avgAll = () => ST.darts ? (ST.pts / ST.darts * 3).toFixed(1) : '–';
  function menuStat() { $('menuStat').textContent = '🎯 Ø ' + avgAll() + ' · 💯 180er ' + ST.n180; }
  function showRec() {
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('📈 Bestes Count-Up', LS.get(P + 'highscore', 0) || 0) + c('Ø 3-Dart-Schnitt (X01)', avgAll()) + c('🔥 Bester Leg-Schnitt', ST.bestAvg ? ST.bestAvg.toFixed(1) : '–') + c('💯 180er', ST.n180)
      + c('🏁 Höchstes Checkout', ST.hiCo || '–') + c('⚡ Kürzestes 501-Leg', ST.bestLeg ? ST.bestLeg + ' Darts' : '–') + c('🎯 Höchste Aufnahme', ST.hiTurn || '–') + c('🎓 Bestes Bob’s 27', ST.bestBob == null ? '–' : ST.bestBob)
      + c('🕐 Schnellste Runde um die Uhr', ST.bestClock ? ST.bestClock + ' Darts' : '–') + c('✂️ Bestes Halve-It', ST.bestHalve || '–') + c('🀄 Shanghais', ST.shanghai) + c('💥 Rausgeworfen (Elimination)', ST.kicks)
      + c('🎮 Spiele', ST.games) + LV.map((l, i) => c(l.i + ' CPU ' + l.n + ' besiegt', ST.wins[i])).join('');
  }

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sModes: () => toMenu(), sSetup: () => openModes(setup && setup.train) };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; if (has3d) SC.mode = id === 'sGame' ? 'game' : 'menu'; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, input.field')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(); const el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sGame' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  const closeAllOv = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); if (ov.id === 'ovEnd') return $('eMenu').click(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); return closeOv(ov.id); }
    if (cur === 'sGame') return pause();
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }

  /* ---------- Spielzustand ---------- */
  // phase: aim → fly → (aim | after) → aim … → over
  const A = { G: null, demo: true, phase: 'aim', t: 0, aim: { x: 0, y: 103 }, swayT: 0, power: 0, charging: false, chDir: 1, cpu: null, pend: null, speed: 1, legDarts: [], last: null, pull: 0 };
  const curP = () => A.G && DA.curPlayer(A.G);
  const isCpu = () => A.demo || !!(curP() && curP().cpu != null);
  const canAim = () => cur === 'sGame' && !overlays().length && A.phase === 'aim' && !isCpu() && A.G && !A.G.over;
  const colorOf = p => p ? p.i % SC.COL.length : 0;
  function sway() { const a = feel().sway, t = A.swayT; return { x: a * (Math.sin(t * 1.7) + .6 * Math.sin(t * 2.9 + 1.3)) / 1.6, y: a * (Math.cos(t * 1.3 + .4) + .5 * Math.sin(t * 3.3)) / 1.5 }; }
  function aimNow() { const s = sway(); return { x: A.aim.x + s.x, y: A.aim.y + s.y }; }
  const suggest = () => { const c = DA.cpuAim(A.G, 2), t = DA.parse(c); return DA.aimPoint(t.n, t.m); };

  function start(mode, opts, players) {
    closeAllOv(); A.demo = false; A.last = { mode, opts, players };
    A.G = DA.newGame(mode, players, opts); A.legDarts = players.map(() => 0); A.counted = false;
    if (has3d) SC.clearAll();
    scr('sGame'); S.music('game'); turnStart(true);
    bigText('GAME ON'); S.call('Game on!');
  }
  function turnStart(first) {
    const p = curP(); A.phase = 'aim'; A.t = 0; A.cpu = null; A.pend = null; A.charging = false; A.power = 0;
    if (!A.demo) A.aim = p.cpu == null ? suggest() : { x: 0, y: 0 };
    if (has3d) SC.setHeld(colorOf(p), !A.demo && p.cpu == null);
    if (A.demo) return;
    if (A.G.players.length > 1 && !first) say(p.name + ' ist dran', 1.6);
    $('swipeHint').hidden = isCpu() || !!LS.get(P + 'swiped', 0);
    $('power').hidden = isCpu();
    board(); turnBox(); hint();
  }
  let sayT = 0; function say(m, d) { $('msg').textContent = m; sayT = d || 2; }
  function bigText(t, bad) { const b = $('bigTxt'); b.textContent = t; b.classList.toggle('bad', !!bad); b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(bigText.t); bigText.t = setTimeout(() => { b.hidden = true; }, 1500); }
  const lab = h => !h ? '' : !h.n ? '–' : h.code === 'DB' ? 'Bull' : h.code === 'SB' ? '25' : h.code;
  const labC = c => c === 'DB' ? 'Bull' : c === 'SB' ? '25' : c;

  /* ---------- Anzeige ---------- */
  function board() {
    const G = A.G; if (!G || A.demo) return;
    $('board').classList.toggle('crk', G.mode === 'cricket');
    if (G.mode === 'cricket') {
      const sym = m => ['', '/', '✕', 'Ⓧ'][m] || '';
      const dead = n => G.players.every(p => p.marks[n] >= 3);
      let h = '<table class="cric"><thead><tr><th></th>' + G.players.map((p, i) => '<th class="' + (i === G.cur ? 'on' : '') + '">' + esc(p.name) + '</th>').join('') + '</tr></thead><tbody>';
      DA.CRICKET.forEach(n => { h += '<tr><td class="n' + (dead(n) ? ' dead' : '') + '">' + (n === 25 ? 'B' : n) + '</td>' + G.players.map(p => '<td class="m">' + sym(p.marks[n]) + '</td>').join('') + '</tr>'; });
      if (G.opts.variant !== 'none') h += '<tr><td class="n">Pkt</td>' + G.players.map(p => '<td><b>' + p.score + '</b></td>').join('') + '</tr>';
      $('board').innerHTML = h + '</tbody></table>'; return;
    }
    $('board').innerHTML = G.players.map((p, i) => {
      let ex = '';
      if (G.mode === 'x01') ex = 'Ø ' + DA.avg(p).toFixed(1) + ((G.opts.legs || 1) > 1 ? ' · Legs ' + p.legs : '');
      else if (G.mode === 'killer') ex = 'Zahl ' + p.num;
      else if (G.mode === 'clock') ex = p.darts + ' Darts';
      else if (G.mode === 'elimination') ex = 'Rest ' + (G.opts.target - p.score);
      return '<div class="pl' + (i === G.cur && !G.over ? ' on' : '') + (p.out ? ' out' : '') + '"><span class="nm"><i style="background:' + SC.COL[colorOf(p)] + '"></i>' + esc(p.name) + '</span><span class="sc">' + esc(G.M.show(p, G)) + '</span>' + (ex ? '<span class="ex">' + esc(ex) + '</span>' : '') + '</div>';
    }).join('');
  }
  function turnBox() {
    const p = curP(); if (!p || A.demo) return; const t = p.turn;
    let h = ''; for (let k = 0; k < 3; k++) { const x = t[k]; h += '<span class="' + (x ? (x.m === 3 ? 'd3' : x.m === 2 ? 'd2' : !x.n ? 'x' : '') : 'x') + '">' + (x ? lab(x) : '·') + '</span>'; }
    $('turn').innerHTML = h + '<span class="t">' + DA.sumTurn(p) + '</span>';
  }
  function hint() {
    const G = A.G, p = curP(); if (!p || A.demo) return; const left = 3 - p.turn.length; let h = '';
    if (G.mode === 'x01') {
      if (!p.opened) h = 'Zum Einstieg ein Doppel treffen';
      else if (p.score <= 170) { const co = DA.checkout(p.score, left, G.opts.out); h = co ? '✔ Checkout: ' + co.map(labC).join(' · ') : p.score > 1 ? 'Kein Finish mit ' + left + (left === 1 ? ' Dart' : ' Darts') : ''; }
    } else if (G.mode === 'elimination') h = 'Noch ' + (G.opts.target - p.score) + ' bis ' + G.opts.target + ' · gleiche Zahl wirft raus';
    else if (G.mode === 'clock') { const n = DA.CLOCK[Math.min(20, p.next)], v = G.opts.variant; h = 'Ziel: ' + (n === 25 ? 'Bull' : (v === 'double' ? 'Doppel ' : v === 'triple' ? 'Triple ' : '') + n); }
    else if (G.mode === 'shanghai') h = 'Runde ' + (G.round + 1) + '/' + G.rounds + ' · nur die ' + (G.round + 1) + ' zählt';
    else if (G.mode === 'killer') h = p.killer ? '🔪 Killer – triff die Doppel der anderen' : 'Doppel ' + p.num + ' treffen = Killer werden';
    else if (G.mode === 'halveit') { const t = DA.HALVE[G.round]; h = 'Runde ' + (G.round + 1) + '/9 · Ziel: ' + (t === 'D' ? 'ein Doppel' : t === 'T' ? 'ein Triple' : t === 'B' ? 'Bull' : t) + ' – sonst halbiert'; }
    else if (G.mode === 'bobs27') h = 'Ziel: ' + (G.round < 20 ? 'Doppel ' + (G.round + 1) : 'Bullseye') + ' · Treffer +, kein Treffer −';
    else if (G.mode === 'countup') h = 'Aufnahme ' + (G.round + 1) + '/' + G.rounds;
    else if (G.mode === 'training') h = 'Freies Werfen – Pause ⏸ zum Beenden';
    else if (G.mode === 'cricket') { const o = p.marks; const open = DA.CRICKET.filter(n => o[n] < 3); h = open.length ? 'Offen: ' + open.map(n => n === 25 ? 'Bull' : n).join(' ') : 'Alles zu – jetzt punkten'; }
    $('hint2').textContent = h;
  }

  /* ---------- Wurf ---------- */
  // land: Board-Punkt (mm), wo der Dart landet
  function release(land, cpu) {
    if (A.phase !== 'aim' || !A.G || A.G.over) return;
    const h = DA.hit(land.x, land.y);
    A.pend = { land, hit: h, cpu: !!cpu }; A.phase = 'fly'; A.t = 0; A.charging = false;
    const p = curP(); if (p && p.cpu == null && !A.demo) p.lastAim = { x: A.aim.x, y: A.aim.y };
    if (has3d) SC.throwDart(colorOf(p), land.x, land.y, { cpu: !!cpu });
    if (!A.demo) S.sfx('whoosh');
  }
  function nearWire(h) {
    if (!h.n) return false; const r = h.r || 0;
    if ([DA.R_IB, DA.R_OB, DA.R_TI, DA.R_TO, DA.R_DI, DA.R_DO].some(w => Math.abs(r - w) < 1.1)) return true;
    return false;
  }
  function impact() {
    const { hit: h } = A.pend, p = curP(), G = A.G;
    if (!A.demo) { if (h.off) S.sfx('wall'); else { S.sfx('thud'); if (nearWire(h)) S.sfx('wire'); } vib(h.n ? 12 : 30); }
    const res = DA.throwDart(G, h);
    if (A.demo) { A.phase = res.turnOver ? 'after' : 'aim'; A.t = 0; A.cpu = null; if (G.turnOver) { A.wait = 1.2; } return; }
    A.legDarts[p.i] = (A.legDarts[p.i] || 0) + 1;
    const human = p.cpu == null;
    // Rückmeldung je Dart
    if (res.msg) say(res.msg, 2.2);
    else if (h.off) say('Am Board vorbei!', 1.4);
    else if (!h.n) say('Daneben', 1.2);
    else if (h.code === 'DB') { say('Bullseye!', 1.4); S.sfx('good'); }
    else if (res.good) S.sfx('good');
    if (res.shanghai) { bigText('SHANGHAI!'); S.call('Shanghai!'); if (human) ST.shanghai++; }
    turnBox(); board(); hint();
    let wait = .35;
    if (res.turnOver) {
      let tot = res.total; wait = 1.7;
      if (G.mode === 'x01') {
        tot = p.snap ? p.snap.score - p.score : tot;   // tatsächlich gespielte Punkte (Bust = 0, Double-In)
        if (res.bust) tot = 0;
        if (human) { ST.darts += p.turn.length; ST.pts += tot; }
        if (res.bust) { bigText('BUST', true); S.sfx('bust'); S.call('Bust'); vib([60, 40, 60]); }
        else if (!res.legWon && !res.over) {
          if (tot === 180) { bigText('180!'); S.sfx('180'); S.call('Einhundertachtzig!'); vib([40, 60, 40, 60, 120]); if (human) ST.n180++; wait = 2.6; }
          else { if (tot >= 100) S.sfx('ton'); S.call(tot ? String(tot) : 'No Score'); }
        }
        if (human && !res.bust) ST.hiTurn = Math.max(ST.hiTurn, tot);
      } else if (['countup', 'shanghai', 'halveit', 'training'].includes(G.mode) && !res.over) { if (tot) S.call(String(tot)); if (tot === 180) { bigText('180!'); S.sfx('180'); if (human) ST.n180++; } else if (tot >= 100) S.sfx('ton'); }
      const af = res.after;
      if (af && af.kicked) { bigText('RAUS!'); S.sfx('kick'); say('💥 ' + af.kicked.join(', ') + ' fliegt raus – zurück auf 0!', 2.6); S.call('Raus!'); if (human) ST.kicks += af.kicked.length; wait = 2.4; }
      if (af && af.halved) { bigText('HALBIERT', true); S.sfx('bust'); say('✂️ Ziel verfehlt – Punkte halbiert', 2); wait = 2.2; }
      if (af && af.bobOut) { bigText('AUS', true); S.sfx('lose'); say('Unter 0 – Bob’s 27 vorbei', 2.2); wait = 2.2; }
      if (res.legWon) {
        bigText('GAME SHOT'); S.sfx('leg'); S.call('Game shot, und das Leg!'); wait = 2.8; say(p.name + ' gewinnt das Leg' + (res.hit ? ' mit ' + lab(res.hit) : ''), 2.6);
        if (human) legStats(p, res);
      }
      if (res.over) { if (G.mode === 'x01' && human) legStats(p, res); return endGame(true); }
      saveSt();
    } else if (res.over) return endGame(true);
    A.phase = res.turnOver ? 'after' : 'settle'; A.t = 0; A.wait = wait;
  }
  function legStats(p, res) {
    const n = A.legDarts[p.i]; if (A.G.opts.start === 501 && A.G.opts.out === 'double' && (!ST.bestLeg || n < ST.bestLeg)) ST.bestLeg = n;
    ST.hiCo = Math.max(ST.hiCo, res.checkout || 0); const la = A.G.opts.start / Math.max(1, n) * 3; if (A.G.opts.start === 501) ST.bestAvg = Math.max(ST.bestAvg, la); saveSt();
  }
  function afterTurn() {
    if (has3d) SC.pullAll();
    const r = DA.nextTurn(A.G);
    if (A.demo) { if (A.G.over || A.G.round > 40) attract(); else turnStart(); return; }
    if (r.over) return endGame(false);
    if (r.legStart) { A.legDarts = A.G.players.map(() => 0); say('Leg ' + (A.G.leg + 1) + ' – ' + curP().name + ' beginnt', 2.4); }
    turnStart(r.legStart);
  }
  function endGame(won) {
    const G = A.G; A.phase = 'over'; if (A.counted) return; A.counted = true; void won;
    const rk = DA.ranking(G), humans = G.players.filter(p => p.cpu == null), win = G.winner;
    const cpus = G.players.filter(p => p.cpu != null), single = humans.length === 1;
    if (humans.length) ST.games++;
    if (single && cpus.length && win && win.cpu == null) { const l = Math.max(...cpus.map(c => c.cpu)); ST.wins[l]++; }
    let title = '', sub = '';
    const me = humans[0];
    if (G.mode === 'countup' && G.rounds === 8) humans.forEach(p => { const hs = LS.get(P + 'highscore', 0) || 0; if (p.score > hs) { LS.set(P + 'highscore', p.score); sub = '⭐ Neuer Rekord für die Rangliste!'; } });
    if (G.mode === 'bobs27') humans.forEach(p => { if (ST.bestBob == null || p.score > ST.bestBob) { ST.bestBob = p.score; sub = '⭐ Neuer Bob’s-27-Rekord!'; } });
    if (G.mode === 'clock') humans.forEach(p => { if (p.next >= DA.CLOCK.length && (!ST.bestClock || p.darts < ST.bestClock)) { ST.bestClock = p.darts; sub = '⭐ Neuer Rekord: ' + p.darts + ' Darts'; } });
    if (G.mode === 'halveit') humans.forEach(p => { if (p.score > ST.bestHalve) { ST.bestHalve = p.score; sub = '⭐ Neuer Halve-It-Rekord!'; } });
    if (G.players.length === 1 && me) {
      title = G.mode === 'clock' ? (me.next >= DA.CLOCK.length ? 'Geschafft in ' + me.darts + ' Darts' : 'Runde beendet') : G.mode === 'x01' ? 'Leg in ' + me.darts + ' Darts' : G.mode === 'bobs27' ? (me.out ? 'Aus bei ' + me.score : me.score + ' Punkte') : me.score + ' Punkte';
      if (G.mode === 'x01') sub = sub || 'Schnitt ' + DA.avg(me).toFixed(1);
    } else title = win ? (win.cpu != null && single ? '🤖 ' + win.name + ' gewinnt' : '🏆 ' + win.name + ' gewinnt!') : 'Spiel beendet';
    saveSt(); const good = !single || (win && win.cpu == null) || !cpus.length; S.sfx(good ? 'win' : 'lose'); if (good && win) S.call('Game shot, und das Match! ' + win.name + ' gewinnt.');
    $('eKick').textContent = modeName(G.mode, G.opts) + (cpus.length && single ? ' · gegen CPU' : '');
    $('eTitle').textContent = title; $('eSub').textContent = sub;
    $('eRank').innerHTML = rk.map((p, k) => { const ex = G.mode === 'x01' ? ' <small>Ø ' + DA.avg(p).toFixed(1) + (p.n180 ? ' · ' + p.n180 + '×180' : '') + '</small>' : ''; return '<div><span>' + (['🥇', '🥈', '🥉'][k] || (k + 1) + '.') + ' ' + esc(p.name) + ex + '</span><b>' + esc(G.mode === 'x01' && (G.opts.legs || 1) > 1 ? p.legs + ' Legs' : G.M.show(p, G)) + '</b></div>'; }).join('');
    board(); setTimeout(() => openOv('ovEnd'), 1100);
  }

  /* ---------- Computer ---------- */
  function cpuTick(dt) {
    if (A.phase !== 'aim' || !isCpu() || overlays().length) return;
    A.t += dt;
    if (!A.cpu) { if (A.t < (A.demo ? .5 : .55)) return; const p = curP(), lvl = A.demo ? 2 : p.cpu; A.cpu = { shot: DA.cpuThrow(A.G, lvl), t: 0, from: Object.assign({}, A.aim) }; return; }
    const c = A.cpu; c.t += dt; const k = Math.min(1, c.t / .55), e = k * k * (3 - 2 * k);
    A.aim.x = c.from.x + (c.shot.aim.x - c.from.x) * e; A.aim.y = c.from.y + (c.shot.aim.y - c.from.y) * e;
    if (c.t > .85) release({ x: c.shot.x, y: c.shot.y }, true);
  }

  /* ---------- Schleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000) * A.speed; last = now;
    pollPads(dt);
    const paused = cur === 'sGame' && overlays().some(o => o.id === 'ovPause');
    if (A.G && !paused) {
      A.swayT += dt;
      if (A.phase === 'aim') { keysAim(dt); cpuTick(dt); if (A.charging) { A.power += A.chDir * dt / 1.05; if (A.power >= 1) { A.power = 1; A.chDir = -1; } if (A.power <= 0) { A.power = 0; A.chDir = 1; } } }
      else if (A.phase === 'fly') { A.t += dt; if ((!has3d || !SC.flying()) && A.t > .12) impact(); }
      else if (A.phase === 'settle') { A.t += dt; if (A.t > A.wait) { A.phase = 'aim'; A.t = 0; A.cpu = null; } }
      else if (A.phase === 'after') { A.t += dt; if (A.t > A.wait) afterTurn(); }
      if (sayT > 0 && (sayT -= dt) <= 0) $('msg').textContent = '';
      if (cur === 'sGame') $('powFill').style.height = Math.round(A.power * 100) + '%';
    }
    if (has3d) {
      const show = A.G && (A.phase === 'aim') && cur !== 'sLoad';
      const human = !isCpu();
      SC.update(dt, { aim: show ? (human ? aimNow() : { x: A.aim.x, y: A.aim.y }) : null, reticle: show && (human ? SET.reticle : !A.demo), cpu: !human, zoom: SET.zoom && human && cur === 'sGame', pull: A.charging ? A.power : SW.id !== null && SW.flick ? .6 : 0, space: innerHeight > innerWidth ? .62 : .72 });
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Eingabe: Tastatur ---------- */
  const K = {};
  const clampAim = () => { const r = Math.hypot(A.aim.x, A.aim.y); if (r > 235) { A.aim.x *= 235 / r; A.aim.y *= 235 / r; } };
  function keysAim(dt) {
    if (!canAim()) return; const sp = (K.ShiftLeft || K.ShiftRight ? 40 : 130) * dt;
    if (K.ArrowLeft) A.aim.x -= sp; if (K.ArrowRight) A.aim.x += sp; if (K.ArrowUp) A.aim.y += sp; if (K.ArrowDown) A.aim.y -= sp; clampAim();
  }
  function startCharge() { if (!canAim()) return; A.charging = true; A.power = 0; A.chDir = 1; }
  function endCharge() {
    if (!A.charging) return; A.charging = false; if (A.power < .05) { A.power = 0; return; }
    const d = A.power - .55, dz = .07, f = feel(), ey = Math.abs(d) > dz ? (d - Math.sign(d) * dz) * 170 * f.err : 0;
    throwHuman({ x: 0, y: ey }, aimNow()); feedback(ey, 0);
  }
  function throwHuman(err, at) { const f = feel(); release({ x: at.x + err.x + DA.gauss(Math.random) * f.sd, y: at.y + err.y + DA.gauss(Math.random) * f.sd }); }
  function feedback(ey, ex) { if (ey > 7) say('Zu fest ↑', 1.2); else if (ey < -7) say('Zu sanft ↓', 1.2); else if (Math.abs(ex) > 7) say(ex > 0 ? 'Nach rechts verzogen →' : '← Nach links verzogen', 1.2); }
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code; K[c] = true;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (cur === 'sGame' && !overlays().length) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(c)) e.preventDefault();
      if (e.repeat) return;
      if (c === 'Space' || c === 'Enter') return startCharge();
      if (c === 'KeyZ') { SET.zoom = !SET.zoom; saveSet(); $('sZoom').checked = SET.zoom; }
      return;
    }
    if (e.target && e.target.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(c)) return;
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { K[e.code] = false; if (e.code === 'Space' || e.code === 'Enter') endCharge(); });
  addEventListener('blur', () => { for (const k in K) K[k] = false; A.charging = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);

  /* ---------- Eingabe: Ziehen und Wischen ---------- */
  // Ziehen verschiebt das Zielkreuz (feiner als der Finger); ein zügiger Wisch nach oben wirft.
  // Tempo des Wischs → Höhe (zu langsam = tiefer, zu schnell = höher), Richtung → Seite.
  const SW = { id: null, pts: [], flick: false };
  const zone = $('aimZone');
  zone.addEventListener('pointerdown', e => { if (!canAim() || SW.id !== null) return; e.preventDefault(); try { zone.setPointerCapture(e.pointerId); } catch (x) { } SW.id = e.pointerId; SW.flick = false; SW.pts = [{ x: e.clientX, y: e.clientY, t: performance.now(), ax: A.aim.x, ay: A.aim.y }]; });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== SW.id) return; const l = SW.pts[SW.pts.length - 1], now = performance.now();
    const ppm = has3d ? SC.pxPerMm() : 1.5, k = .55 / ppm;
    if (canAim()) { A.aim.x += (e.clientX - l.x) * k; A.aim.y -= (e.clientY - l.y) * k; clampAim(); }
    SW.pts.push({ x: e.clientX, y: e.clientY, t: now, ax: A.aim.x, ay: A.aim.y }); if (SW.pts.length > 120) SW.pts.splice(0, 20);
    SW.flick = l.y - e.clientY > 2 && (l.y - e.clientY) / Math.max(1, now - l.t) > .6;
  });
  function swipeEnd(e) {
    if (e.pointerId !== SW.id) return; SW.id = null; SW.flick = false;
    if (e.type !== 'pointerup' || !canAim()) return;
    const pts = SW.pts, z = pts[pts.length - 1]; let i = pts.length - 1;
    while (i > 0 && z.t - pts[i - 1].t <= 170 && pts[i - 1].y >= pts[i].y - 2) i--;
    const a = pts[i], dy = a.y - z.y, dx = z.x - a.x, dur = Math.max(16, z.t - a.t);
    const hs = dy / dur * 1000 / innerHeight;   // Bildschirmhöhen pro Sekunde
    if (dy < Math.max(34, innerHeight * .05) || hs < 1) return;
    LS.set(P + 'swiped', 1); $('swipeHint').hidden = true;
    // Zielpunkt vom Beginn des Wischs (der Wisch selbst verschiebt das Kreuz nicht)
    A.aim.x = a.ax; A.aim.y = a.ay;
    const f = feel(), IDEAL = 3.4, DZ = 1.1, d = hs - IDEAL;
    const ey = clamp(Math.abs(d) > DZ ? (d - Math.sign(d) * DZ) * 15 * f.err : 0, -90, 90);
    const ang = Math.atan2(dx, dy), ex = clamp(Math.abs(ang) > .09 ? (ang - Math.sign(ang) * .09) * 120 * f.err : 0, -90, 90);
    throwHuman({ x: ex, y: ey }, aimNow()); feedback(ey, ex);
  }
  zone.addEventListener('pointerup', swipeEnd); zone.addEventListener('pointercancel', swipeEnd); zone.addEventListener('lostpointercapture', e => { if (e.pointerId === SW.id) SW.id = null; });
  // Kraftbalken halten
  const pw = $('power'); let pwId = null;
  pw.addEventListener('pointerdown', e => { if (!canAim()) return; e.preventDefault(); pwId = e.pointerId; try { pw.setPointerCapture(e.pointerId); } catch (x) { } startCharge(); });
  const pwUp = e => { if (e.pointerId !== pwId) return; pwId = null; endCharge(); };
  pw.addEventListener('pointerup', pwUp); pw.addEventListener('pointercancel', e => { if (e.pointerId === pwId) { pwId = null; A.charging = false; A.power = 0; } });
  $('bPause').onclick = () => pause();
  $('bUndo').onclick = () => { SET.zoom = !SET.zoom; saveSet(); $('sZoom').checked = SET.zoom; toast(SET.zoom ? '🔍 Zoom beim Zielen an' : '🔍 Zoom aus – ganzes Board'); };

  /* ---------- Eingabe: Gamecontroller ---------- */
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const gp = list.find(p => p && p.connected); if (!gp) return;
    const ax = gp.axes || [], bt = gp.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k], up = k => !now[k] && PAD.b[k];
    const dz = v => Math.abs(v) < .16 ? 0 : v;
    if (cur === 'sGame' && !overlays().length) {
      document.body.classList.remove('kbd');
      if (canAim()) {
        let mx = dz(ax[0] || 0), my = dz(ax[1] || 0); if (now[14]) mx = -1; if (now[15]) mx = 1; if (now[12]) my = -1; if (now[13]) my = 1;
        const sp = (now[4] || now[5] ? 40 : 140) * dt; A.aim.x += mx * sp; A.aim.y -= my * sp; clampAim();
        if (down(0)) startCharge();
      }
      if (up(0)) endCharge();
      if (down(9) || down(1)) pause();
    } else {
      let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0;
      if (now[14]) x = -1; if (now[15]) x = 1; if (now[12]) z = -1; if (now[13]) z = 1;
      const d = x || z ? (Math.abs(x) >= Math.abs(z) ? [x, 0] : [0, z]) : null, key = d ? d.join() : null;
      document.body.classList.add('kbd');
      if (d && (key !== PAD.dir || padNavT <= 0)) { moveFocus(d[0], d[1]); padNavT = key !== PAD.dir ? .35 : .14; }
      PAD.dir = key;
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
      if (down(1)) back();
      if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });

  /* ---------- Menü ---------- */
  function toMenu() { closeAllOv(); attract(); scr('sMenu'); menuStat(); S.music('menu'); try { speechSynthesis.cancel(); } catch (e) { } }
  function pause() { if (cur === 'sGame') { A.charging = false; openOv('ovPause'); } }
  function resume() { closeOv('ovPause'); }
  function attract() { A.demo = true; A.G = DA.newGame('countup', [{ name: 'Demo', cpu: 2 }], { rounds: 99 }); A.phase = 'aim'; A.t = 0; A.cpu = null; A.aim = { x: 0, y: 103 }; if (has3d) { SC.clearAll(); SC.setHeld(0, false); } }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; pressStart(); });
  document.querySelectorAll('#tiles [data-go]').forEach(t => {
    t.onclick = () => {
      S.unlock(); S.sfx('ok'); const g = t.dataset.go;
      if (g === 'quick') start('x01', { start: 501, out: 'double', in: 'single', legs: 1 }, [{ name: 'Du' }, { name: 'CPU ' + LV[1].i, cpu: 1 }]);
      else if (g === 'modes') openModes();
      else if (g === 'train') openModes(true);
      else if (g === 'rec') { showRec(); openOv('ovRec'); }
      else if (g === 'opts') openOv('ovOpts');
      else if (g === 'help') openOv('ovHelp');
    };
  });
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { sSound: 'sound', sMusic: 'music', sCaller: 'caller', sReticle: 'reticle', sZoom: 'zoom', sVib: 'vib', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; S.callerOn = SET.caller; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (id === 'sLow') toast('Gilt nach dem nächsten Neustart'); if (id === 'sCaller' && SET.caller) S.call('Game on!'); }; }
  function feelSeg() { $('feelSeg').innerHTML = FEEL.map((f, i) => '<button class="btn nav' + (i === SET.feel ? ' on' : '') + '" data-f="' + i + '">' + f.n + '</button>').join(''); $('feelTxt').textContent = feel().d; $('feelSeg').querySelectorAll('[data-f]').forEach(b => { b.onclick = () => { SET.feel = +b.dataset.f; saveSet(); S.sfx('move'); feelSeg(); b.blur(); const nb = $('feelSeg').querySelector('[data-f="' + SET.feel + '"]'); if (nb && !coarse()) nb.focus(); }; }); }
  feelSeg();
  $('pGo').onclick = resume; $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pRestart').onclick = () => { if (A.last) start(A.last.mode, A.last.opts, A.last.players); };
  $('pQuit').onclick = () => toMenu();
  $('eAgain').onclick = () => { S.sfx('ok'); if (A.last) start(A.last.mode, A.last.opts, A.last.players); };
  $('eMenu').onclick = () => toMenu();

  /* ---------- Modus wählen und einrichten ---------- */
  function openModes(train) {
    const list = train ? ML.filter(m => ['training', 'clock', 'bobs27', 'countup'].includes(m.id)) : ML.filter(m => m.id !== 'training');
    $('modeGrid').innerHTML = list.map(m => '<button class="btn tile mode nav" data-m="' + m.id + '"><i>' + m.i + '</i><b>' + m.n + '</b><small>' + m.d + '</small></button>').join('');
    $('modeGrid').querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { S.sfx('ok'); openSetup(b.dataset.m, train); }; });
    $('modeGrid').querySelector('.mode').classList.add('pri');
    scr('sModes');
  }
  $('modesBack').onclick = () => toMenu();
  let setup = null;
  function openSetup(id, train) {
    const m = ml(id), saved = SET.setup[id] || {};
    const opts = {}; (m.opts || []).forEach(([k, , list, def]) => { opts[k] = saved.opts && list.some(x => x[0] === saved.opts[k]) ? saved.opts[k] : def; });
    let pl = saved.players && saved.players.length ? saved.players.slice(0, m.max || 4) : m.solo ? [{ name: 'Du', cpu: null }] : [{ name: 'Du', cpu: null }, { name: 'CPU', cpu: 1 }];
    while (pl.length < (m.min || 1)) pl.push({ name: 'CPU', cpu: 1 });
    setup = { id, opts, train: !!train, players: pl.map(p => ({ name: p.name, cpu: p.cpu })) };
    $('setTitle').textContent = m.i + ' ' + m.n; $('setDesc').textContent = m.d;
    optBox(); slots(); scr('sSetup');
  }
  function optBox() {
    const m = ml(setup.id);
    $('optBox').innerHTML = (m.opts || []).map(([k, n, list]) => '<div class="optRow"><p class="lbl">' + n + '</p><div class="seg">' + list.map(([v, l]) => '<button class="btn nav' + (setup.opts[k] === v ? ' on' : '') + '" data-o="' + k + '" data-v="' + v + '">' + l + '</button>').join('') + '</div></div>').join('');
    $('optBox').querySelectorAll('[data-o]').forEach(b => { b.onclick = () => { const k = b.dataset.o, list = m.opts.find(o => o[0] === k)[2]; setup.opts[k] = list.find(x => String(x[0]) === b.dataset.v)[0]; S.sfx('move'); b.parentNode.querySelectorAll('.btn').forEach(x => x.classList.toggle('on', x === b)); }; });
  }
  const KIND = [null, 0, 1, 2], kindTxt = k => k == null ? '🙂 Mensch' : '🤖 ' + LV[k].n;
  function slots() {
    const m = ml(setup.id);
    $('slots').innerHTML = setup.players.map((s, i) => '<div class="slot"><input class="field" data-i="' + i + '" maxlength="12" value="' + esc(s.name) + '" aria-label="Name Spieler ' + (i + 1) + '"><button class="btn nav kind" data-k="' + i + '"><span class="dot" style="background:' + SC.COL[i % SC.COL.length] + '"></span>' + kindTxt(s.cpu) + '</button></div>').join('');
    $('slots').querySelectorAll('input').forEach(n => { n.oninput = () => { setup.players[+n.dataset.i].name = n.value.slice(0, 12); }; });
    $('slots').querySelectorAll('[data-k]').forEach(b => { b.onclick = () => { const s = setup.players[+b.dataset.k]; s.cpu = KIND[(KIND.indexOf(s.cpu) + 1) % KIND.length]; if (/^(CPU|Du|Spieler \d)/.test(s.name) || !s.name) s.name = s.cpu == null ? (+b.dataset.k === 0 ? 'Du' : 'Spieler ' + (+b.dataset.k + 1)) : 'CPU'; S.sfx('move'); slots(); const nb = $('slots').querySelector('[data-k="' + b.dataset.k + '"]'); if (nb && !coarse()) nb.focus(); }; });
    $('slAdd').disabled = setup.players.length >= (m.max || 4); $('slDel').disabled = setup.players.length <= (m.min || 1);
  }
  $('slAdd').onclick = () => { const m = ml(setup.id); if (setup.players.length < (m.max || 4)) { setup.players.push({ name: 'CPU', cpu: 1 }); S.sfx('move'); slots(); } };
  $('slDel').onclick = () => { const m = ml(setup.id); if (setup.players.length > (m.min || 1)) { setup.players.pop(); S.sfx('move'); slots(); } };
  $('setBack').onclick = () => openModes(setup.train);
  $('setGo').onclick = () => {
    SET.setup[setup.id] = { opts: setup.opts, players: setup.players }; saveSet(); S.sfx('ok');
    // gleiche Computer-Namen unterscheidbar machen
    const names = {}; const pl = setup.players.map((p, i) => { let n = (p.name || '').trim() || (p.cpu != null ? 'CPU' : 'Spieler ' + (i + 1)); if (p.cpu != null && n === 'CPU') n = 'CPU ' + LV[p.cpu].i; names[n] = (names[n] || 0) + 1; return { name: n, cpu: p.cpu }; });
    const seen = {}; pl.forEach(p => { if (names[p.name] > 1) { seen[p.name] = (seen[p.name] || 0) + 1; p.name += ' ' + seen[p.name]; } });
    start(setup.id, Object.assign({}, setup.opts), pl);
  };

  /* ---------- Laden ---------- */
  const TIPS = ['Board wird aufgehängt …', 'Flights werden gerichtet …', 'Abwurflinie wird geklebt …', 'Caller räuspert sich …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15); await wait(60);
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); }
    bar(.6); await wait(40); attract(); bar(.9);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1100 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (!has3d) toast('3D wird auf diesem Gerät nicht unterstützt.');
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), qm = q.get('mode');
    if (qm && DA.MODES[qm]) { S.unlock(); const lvl = clamp(+q.get('cpu') || 1, 0, 2); const solo = ml(qm).solo && !q.get('cpu'); start(qm, {}, solo ? [{ name: 'Du' }] : [{ name: 'Du' }, { name: 'CPU ' + LV[lvl].i, cpu: lvl }]); }
    else scr('sTitle');
  })();
  window.DAApp = { A, start, release, toMenu, openSetup, get cur() { return cur; }, aimNow, board };
})();
