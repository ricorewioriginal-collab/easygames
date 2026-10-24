/* Spaß-Oberfläche: Marco & Andrew im HUD (Energie, Laune, Tipps), Sprechblasen über den Figuren, Studio-Stufe,
   Tagesziele, Sende-Serie, Studio-Momente (Zeitgeber), Hosts schlendern durchs Studio, Veröffentlichungs-Show
   und Stufen-Popup mit Konfetti. Logik in src/sim/fun.js (PT.Fun). Eingebunden über main.js: init(), hud(), frame(dt).
   Keine Popup-Flut: Sprechblasen nacheinander, Popups über die Hinweis-Warteschlange (G.enqueue) und nur, wenn nichts offen ist. */
(function (root) {
  'use strict';
  const PT = root.PT, UI = PT.UI, D = PT.DATA, esc = PT.esc;
  const Fu = UI.Fun = {};
  const G = () => PT.G, F = () => PT.Fun;
  const HOSTS = ['marco', 'andrew'];
  let box = null, layer = null, bub = null, lastSt = null, collapsed = null;
  let says = [], cur = null, curLeft = 0, pause = 0;
  let momentT = 0, nextMoment = 80, idleT = 0, nextIdle = 45, wanderT = 0, nextWander = 14;
  let rel = null; // laufende Veröffentlichungs-Show
  const homes = {}, mine = {};
  const now = () => Date.now();
  const rm = () => !!(UI.settings && UI.settings.reducedMotion);
  const name = id => id === 'andrew' ? 'Andrew' : 'Marco';

  // ── Aufbau ────────────────────────────────────────────────
  Fu.init = function () {
    const h = document.getElementById('hud'); if (!h || box) return;
    box = UI.el('<div class="pt-fun" id="funBox"><div class="pt-fun-hosts">' + HOSTS.map(id => '<button class="pt-fun-host" data-act="host" data-id="' + id + '" title="' + name(id) + ' – tippen für einen Tipp">' + UI.avatar(id, 36) + '<span class="pt-fun-hi"><b>' + name(id) + ' <i data-k="icon"></i></b><span class="pt-fun-en" title="Energie"><i data-k="en"></i></span></span></button>').join('') + '</div>' +
      '<div class="pt-fun-lvl" data-k="lvl"></div><div class="pt-fun-goals"><button class="pt-fun-gh" data-act="goals" aria-expanded="true"></button><ul data-k="goals"></ul></div></div>');
    h.appendChild(box);
    layer = UI.el('<div class="pt-fun-layer" aria-live="polite"></div>'); h.appendChild(layer);
    bub = UI.el('<div class="pt-bub" hidden><b></b><span></span></div>'); layer.appendChild(bub);
    collapsed = innerWidth <= 620;
    UI.bind(box, {
      host: b => { const st = G().st; if (!st) return; const t = F().tip(st); says.unshift({ who: b.dataset.id === t[0] ? t[0] : b.dataset.id, text: t[1], ts: now(), prio: true }); if (cur) { cur = null; } pause = 0; PT.Audio && PT.Audio.fx('pop'); b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); },
      goals: () => { collapsed = !collapsed; Fu.hud(); }
    });
  };

  // ── HUD (alle 0,25 s aus main.js) ─────────────────────────
  Fu.hud = function () {
    const g = G(), st = g && g.st; if (!box || !st) return;
    if (st !== lastSt) onState(st);
    const Fn = F(), hs = Fn.hostState(st), on = Fn.active(st);
    HOSTS.forEach(id => { const b = box.querySelector('[data-id="' + id + '"]'); b.querySelector('[data-k="icon"]').textContent = hs[id].icon; const en = b.querySelector('[data-k="en"]'); en.style.width = hs[id].energy + '%'; en.className = hs[id].energy < 25 ? 'low' : hs[id].energy < 50 ? 'mid' : ''; b.title = name(id) + ' · Energie ' + hs[id].energy + ' · Laune ' + hs[id].mood + ' – tippen für einen Tipp'; });
    const lv = box.querySelector('[data-k="lvl"]'), gl = box.querySelector('.pt-fun-goals');
    lv.hidden = gl.hidden = !on;
    if (on) {
      const p = Fn.progress(st), sk = Fn.streakNow(st);
      const html = '<b>Stufe ' + p.lvl + '</b>' + UI.bar(p.xp, p.need, 'pt-fun-xp') + '<small>' + esc(p.title) + '</small>' + (sk >= 1 ? '<span class="pt-fun-streak" title="Sende-Serie: Tage am Stück mit neuer Folge">🔥' + sk + '</span>' : '');
      if (lv._h !== html) { lv.innerHTML = html; lv._h = html; }
      const goals = Fn.goals(st), done = goals.filter(x => x.done).length, open = goals.find(x => !x.done);
      const head = '📋 Tagesziele ' + done + '/' + goals.length + (collapsed && open ? ' · ' + open.icon + ' ' + open.label : '') + (collapsed ? ' ▸' : ' ▾');
      const gh = gl.querySelector('.pt-fun-gh'); if (gh.textContent !== head) gh.textContent = head; gh.setAttribute('aria-expanded', String(!collapsed));
      const list = collapsed ? '' : goals.map(x => '<li class="' + (x.done ? 'done' : '') + '"><span>' + (x.done ? '✅' : x.icon) + ' ' + esc(x.label) + '</span>' + (x.need > 1 && !x.done ? '<small>' + x.have + '/' + x.need + '</small>' : '') + '<em>+' + PT.money(Math.round(x.rew.money * PT.Sim.diffRules(st).money)) + '</em></li>').join('');
      const ul = gl.querySelector('ul'); if (ul._h !== list) { ul.innerHTML = list; ul._h = list; }
    }
    // unter die Missionsbox schieben
    const m = document.getElementById('hMission'), st0 = document.querySelector('.pt-hud-stats');
    const ref = m && m.offsetParent && m.innerHTML ? m : st0; if (ref) { const r = ref.getBoundingClientRect(); box.style.top = Math.round(r.bottom + 6) + 'px'; }
  };
  function onState(st) {
    lastSt = st; says = []; cur = null; bub.hidden = true; momentT = 0; nextMoment = 80; idleT = 0; nextIdle = 40; wanderT = 0;
    F().ensure(st); F().goals(st); F().take(st);
    if (st.mode === 'career' && st.missions.done.length) F().say(st, 'welcome');
  }

  // ── Jedes Bild (aus main.js) ──────────────────────────────
  let lastFrame = 0;
  Fu.frame = function () {
    const t = now(), dt = lastFrame ? Math.min(0.5, (t - lastFrame) / 1000) : 0; lastFrame = t; // Echtzeit (unabhängig von der Bildrate)
    const g = G(), st = g && g.st; if (!box || !st) { if (bub) bub.hidden = true; return; }
    if (st !== lastSt) onState(st);
    consume(st);
    const busy = UI.isOpen() || g.mode === 'mg' || !!rel;
    bubbles(dt, busy, g);
    if (!busy && g.mode === 'walk' && !document.hidden) { moments(dt, st); idle(dt, st); wander(dt, st, g); }
  };
  function consume(st) {
    const items = F().take(st); if (!items.length) return;
    items.forEach((it, i) => {
      if (it.t === 'say') {
        if (it.key === 'level' && it._used) return;
        if (rel && /^pub/.test(it.key || '')) { rel.lines.push([it.who, it.text]); return; }
        says.push({ who: it.who, text: it.text, ts: now() }); while (says.length > 6) says.shift();
      } else if (it.t === 'goal') {
        const r = it.g.rew; UI.toast('✅ Tagesziel: ' + it.g.label + ' · +' + PT.money(Math.round(r.money * PT.Sim.diffRules(st).money)) + (r.fans ? ' · +' + r.fans + ' Fans' : ''), 'good', 4500); PT.Audio && PT.Audio.fx('cash'); flash();
      } else if (it.t === 'allgoals') {
        UI.toast('🏆 Alle Tagesziele geschafft! Bonus +' + PT.money(Math.round(it.rew.money * PT.Sim.diffRules(st).money)) + ' · +' + it.rew.fans + ' Fans', 'ach', 5500); confetti(40); PT.Audio && PT.Audio.fx('win');
      } else if (it.t === 'level') {
        const lines = items.slice(i + 1).filter(x => x.t === 'say' && x.key === 'level').slice(0, 2); lines.forEach(x => { x._used = true; });
        const show = () => waitFree().then(() => levelUp(it, lines.map(x => [x.who, x.text])));
        if (G().enqueue) G().enqueue(show); else show();
      }
    });
  }
  function flash() { if (!box) return; box.classList.remove('pt-fun-flash'); void box.offsetWidth; box.classList.add('pt-fun-flash'); }
  function waitFree() {
    return new Promise(res => { const t = setInterval(() => { const g = G(); if (!g || !g.st) { clearInterval(t); res(); return; } if (!UI.isOpen() && !rel && g.mode === 'walk') { clearInterval(t); res(); } }, 300); });
  }

  // ── Sprechblasen ─────────────────────────────────────────
  const V = { x: 0, y: 0, z: 0 };
  function project(g, id) {
    const w = g.world; if (!w || !w.debug || !w.camera || !w.THREE) return null;
    const n = w.debug.npcs.find(x => x.id === id), pl = w.debug.player; if (!n) return null;
    const mode = w.camMode ? w.camMode() : 'follow';
    if (mode === 'follow' && (!pl || Math.hypot(pl.x - n.x, pl.z - n.z) > 22)) return null;
    if (mode !== 'follow' && mode !== 'build') return null;
    const v = Fu._v || (Fu._v = new w.THREE.Vector3()); v.set(n.x, 2.35, n.z); v.project(w.camera);
    if (v.z > 1 || v.x < -0.95 || v.x > 0.95 || v.y < -0.9 || v.y > 0.95) return null;
    V.x = (v.x + 1) / 2 * innerWidth; V.y = (1 - v.y) / 2 * innerHeight; return V;
  }
  function bubbles(dt, busy, g) {
    if (pause > 0) pause -= dt;
    if (cur) {
      if (busy && !cur.prio) { bub.hidden = true; cur.left = Math.max(cur.left, 1.2); return; }
      cur.left -= dt;
      if (cur.left <= 0) { cur = null; bub.hidden = true; pause = 0.6; return; }
      place(g, cur);
      return;
    }
    if (busy || pause > 0) { says = says.filter(s => now() - s.ts < 25000); return; }
    const s = says.shift(); if (!s) return;
    if (now() - s.ts > 25000 && !s.prio) return;
    cur = s; cur.left = Math.min(6.5, Math.max(2.6, 1.6 + s.text.length * 0.045));
    bub.querySelector('b').textContent = name(s.who); bub.querySelector('span').textContent = s.text;
    bub.className = 'pt-bub ' + s.who; bub.hidden = false;
    if (PT.Audio && PT.Audio.blip) PT.Audio.blip(s.who);
    place(g, cur);
  }
  function place(g, s) {
    const p = project(g, s.who);
    if (p) { bub.classList.remove('hud'); bub.style.left = Math.round(Math.min(innerWidth - 120, Math.max(120, p.x))) + 'px'; bub.style.top = Math.round(Math.max(60, p.y)) + 'px'; bub.hidden = false; return; }
    const b = box && box.querySelector('[data-id="' + s.who + '"]');
    if (!b || !b.offsetParent || document.body.classList.contains('pt-building')) { bub.hidden = true; return; }
    const r = b.getBoundingClientRect(); bub.classList.add('hud'); bub.style.left = Math.round(r.left + 4) + 'px'; bub.style.top = Math.round(r.bottom + 8) + 'px'; bub.hidden = false;
  }

  // ── Studio-Momente, Geplauder, Schlendern ─────────────────
  function moments(dt, st) {
    if (!F().active(st) || st.missions.done.length < 2 || st.prod || st.pending.length) return;
    momentT += dt; if (momentT < nextMoment) return;
    momentT = 0; nextMoment = 110 + Math.random() * 70;
    const ev = F().rollMoment(st); if (ev) PT.Audio && PT.Audio.fx('beep');
  }
  function idle(dt, st) {
    idleT += dt; if (idleT < nextIdle) return;
    idleT = 0; nextIdle = 50 + Math.random() * 40;
    const H = st.hosts; if ((H.marco.energy + H.andrew.energy) / 2 < 25) { F().say(st, 'tired', null, 300); return; }
    const pos = G().world && G().world.playerPos && G().world.playerPos();
    if (pos && pos.district === 'altstudio') F().say(st, 'idle');
  }
  function wander(dt, st, g) {
    wanderT += dt; if (wanderT < nextWander) return;
    wanderT = 0; nextWander = 10 + Math.random() * 14;
    const w = g.world; if (!w || !w.debug || !w.debug.lotsR || !w.debug.nav) return;
    const R = w.debug.lotsR.studio, nav = w.debug.nav, lot = st.lots.studio, pl = w.debug.player; if (!R || !lot || !pl || !PT.Build) return;
    const id = HOSTS[Math.random() < 0.5 ? 0 : 1], n = w.debug.npcs.find(x => x.id === id); if (!n || !n.home) return;
    if (n.home !== mine[id]) homes[id] = n.home; // placeHosts hat neu gesetzt → das ist der Stammplatz
    if (!homes[id]) homes[id] = n.home;
    if (Math.hypot(pl.x - n.x, pl.z - n.z) < 3.5) return; // nicht weglaufen, wenn man gerade hingeht
    const m = PT.Sim.currentMission(st), wanted = m && m.actor === id && st.missions.curState === 'offer';
    let target = homes[id];
    if (!wanted && Math.random() < 0.6) {
      const base = homes[id], cells = [];
      for (let z = 1; z < lot.d - 1; z++) for (let x = 1; x < lot.w - 1; x++) {
        if (!lot.floor[PT.Build.idx(lot, x, z)]) continue;
        const wx = R.ox + x + 0.5, wz = R.oz + z + 0.5; if (Math.hypot(wx - base[0], wz - base[1]) > 7) continue;
        if (nav.solid(nav.cell(wx), nav.cell(wz))) continue; cells.push([wx, wz]);
      }
      if (cells.length) target = cells[Math.floor(Math.random() * cells.length)];
    }
    if (target === n.home) return;
    mine[id] = n.home = [target[0], target[1]]; n.goalKey = '';
  }

  // ── Veröffentlichungs-Show ───────────────────────────────
  /** Startet die kurze Show nach dem Veröffentlichen (überspringbar). Hält die Hinweis-Warteschlange an, bis sie zu ist. */
  Fu.release = function (R) {
    if (!R || !R.ep || rel) return;
    const e = R.ep, comments = (e.comments || []).slice(0, 3);
    const el = UI.el('<div class="pt-rel" role="dialog" aria-label="Die Folge geht online"><div class="pt-rel-card">' +
      '<div class="pt-rel-top"><canvas width="112" height="112"></canvas><div><div class="pt-rel-air">📡 <span>3</span></div><h3>' + esc(e.title) + '</h3><div class="pt-rel-stars">' + '★★★★★'.split('').map(() => '<i>★</i>').join('') + '</div></div></div>' +
      '<div class="pt-rel-count"><b>0</b><small>Hörerinnen und Hörer</small></div><ul class="pt-rel-feed"></ul><div class="pt-rel-fx"></div>' +
      '<div class="pt-rel-hosts">' + HOSTS.map(id => '<div class="pt-rel-h" data-id="' + id + '">' + UI.avatar(id, 44) + '<p></p></div>').join('') + '</div>' +
      '<button class="pri" data-act="go">Überspringen ⏩</button></div></div>');
    UI.layer().appendChild(el);
    try { UI.drawCover(el.querySelector('canvas'), { cover: e.cover, title: e.title, icon: e.icon, accent: e.accent }); } catch (x) { /* Cover optional */ }
    let done, timers = [], raf = 0, finished = false;
    const hold = new Promise(r => { done = r; });
    rel = { el, lines: [] };
    if (G().enqueue) G().enqueue(() => hold);
    const $ = s => el.querySelector(s), cnt = $('.pt-rel-count b'), air = $('.pt-rel-air span');
    const at = (ms, f) => timers.push(setTimeout(f, ms));
    const lineFor = id => { const l = rel.lines.find(x => x[0] === id); return l ? l[1] : null; };
    function final() {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
      air.textContent = 'ON AIR'; el.classList.add('live', 'end'); cnt.textContent = PT.fmt(R.listeners);
      el.querySelectorAll('.pt-rel-stars i').forEach((s, k) => s.classList.toggle('on', k < e.stars));
      const feed = $('.pt-rel-feed'); if (!feed.children.length) comments.forEach(c => feed.insertAdjacentHTML('beforeend', '<li>💬 ' + esc(c) + '</li>'));
      $('.pt-rel-fx').innerHTML = ['💶 +' + PT.money(R.revenue), '💛 ' + (R.fansGain >= 0 ? '+' : '') + R.fansGain + ' Fans', '⭐ Ruf ' + (R.repDelta >= 0 ? '+' : '') + R.repDelta].concat(R.fun || []).map(t => '<span>' + esc(t) + '</span>').join('');
      HOSTS.forEach(id => { const t = lineFor(id); const p = el.querySelector('.pt-rel-h[data-id="' + id + '"] p'); p.textContent = t || (id === 'marco' ? (e.stars >= 3 ? 'Läuft!' : 'Nächstes Mal besser!') : (e.stars >= 3 ? 'Wir sind live!' : 'Kopf hoch!')); p.parentNode.classList.add('say'); });
      if (e.stars >= 4) confetti(50);
      $('[data-act="go"]').textContent = 'Zum Bericht ▶';
      at(9000, close);
    }
    function close() { if (!rel) return; timers.forEach(clearTimeout); cancelAnimationFrame(raf); removeEventListener('keydown', key, true); el.remove(); const lines = rel.lines; rel = null; lines.forEach(l => says.push({ who: l[0], text: l[1], ts: now() - 20000 })); done(); }
    function key(ev) { if (['Enter', 'Space', 'Escape', 'NumpadEnter'].includes(ev.code)) { ev.preventDefault(); ev.stopPropagation(); if (finished) close(); else final(); } }
    const t0 = now(); // Geister-Klicks vom Tippen auf „Veröffentlichen“ ignorieren
    el.addEventListener('click', () => { if (now() - t0 < 500) return; if (finished) close(); else final(); });
    addEventListener('keydown', key, true);
    if (rm()) { final(); return hold; }
    // Ablauf: 3-2-1 → live, Zähler läuft hoch, Kommentare fliegen rein, Sterne, Reaktionen
    [3, 2, 1].forEach((n, k) => at(k * 450, () => { air.textContent = n; PT.Audio && PT.Audio.fx('tick'); }));
    at(1350, () => {
      air.textContent = 'ON AIR'; el.classList.add('live'); PT.Audio && PT.Audio.fx('onair');
      const t0 = performance.now(), dur = 2400, N = R.listeners;
      const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(N * (1 - Math.pow(1 - k, 3))); cnt.textContent = PT.fmt(v); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    });
    comments.forEach((c, k) => at(1700 + k * 700, () => { $('.pt-rel-feed').insertAdjacentHTML('beforeend', '<li class="in">💬 ' + esc(c) + '</li>'); PT.Audio && PT.Audio.fx('pop'); }));
    for (let k = 0; k < 5; k++) at(3900 + k * 170, () => { const s = el.querySelectorAll('.pt-rel-stars i')[k]; if (s && k < e.stars) { s.classList.add('on'); PT.Audio && PT.Audio.fx('coin'); } });
    at(4900, final);
    return hold;
  };
  Fu.releaseOpen = () => !!rel;
  Fu.debug = () => ({ momentT, nextMoment, idleT, nextIdle, wanderT, nextWander, says: says.length, cur: cur && cur.text });

  // ── Stufen-Popup ─────────────────────────────────────────
  function levelUp(it, lines) {
    const g = G(); if (!g || !g.st) return Promise.resolve();
    return new Promise(res => {
      const r = it.rew || {}, money = Math.round((r.money || 0) * PT.Sim.diffRules(g.st).money);
      const p = UI.panel('Studio-Stufe ' + it.lvl + '!', '<div class="pt-lvlup"><div class="pt-lvl-badge">' + it.lvl + '</div><h3>' + esc(it.title) + '</h3><p class="pt-rew">💶 +' + PT.money(money) + (r.fans ? ' · 💛 +' + r.fans + ' Fans' : '') + '</p>' +
        (lines.length ? '<div class="pt-lvl-lines">' + lines.map(l => '<div class="pt-lvl-l">' + UI.avatar(l[0], 40) + '<p><b>' + name(l[0]) + ':</b> ' + esc(l[1]) + '</p></div>').join('') + '</div>' : '') +
        '<p class="pt-hint">Höhere Stufe = größere Belohnungen für Tagesziele.</p></div>', { icon: '🎉', onClose: res, cls: 'pt-lvl-panel' });
      p.footer('<button data-act="x" data-primary class="pri">Weiter so! 🎙️</button>'); UI.bind(p.root, { x: () => p.close() });
      PT.Audio && PT.Audio.fx('win'); confetti(70);
    });
  }

  // ── Konfetti ──────────────────────────────────────────────
  function confetti(n) {
    if (rm() || typeof document === 'undefined') return;
    const c = UI.el('<div class="pt-confetti" aria-hidden="true"></div>'), cols = ['#ff8a1e', '#ffb02e', '#4be08a', '#6ef0ff', '#ff7ad9', '#c58bff', '#fff'];
    let h = ''; for (let i = 0; i < n; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + cols[i % cols.length] + ';animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's;animation-duration:' + (1.8 + Math.random() * 1.4).toFixed(2) + 's;--r:' + Math.round(Math.random() * 720 - 360) + 'deg;--x:' + Math.round(Math.random() * 160 - 80) + 'px"></i>';
    c.innerHTML = h; document.body.appendChild(c); setTimeout(() => c.remove(), 3600);
  }
  Fu.confetti = confetti;
})(typeof window !== 'undefined' ? window : globalThis);
