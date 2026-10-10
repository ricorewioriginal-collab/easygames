'use strict';
/* Oberfläche von AnMaCha Markthalle 24: Zeichnen (Draufsicht), Eingabe, Fenster, Ton, Speichern. */
(() => {
  const D = Data, P = D.PRODUCTS, $ = id => document.getElementById(id), fmt = D.fmt, KEY = 'amh_save_v1';
  const now = () => performance.now(); let hintT = 0, S = null, spd = 1, mode = null, cardId = null, chooser = false, panel = null, tabCat = 'obst', heatOn = false, snd = true, last = performance.now(), hudT = 0, prevMoney = 0, saveT = 0, ghost = null, tick = 0;
  try { snd = localStorage.getItem('amh_snd') !== '0'; } catch (e) {}
  const cv = $('cv'), cv3 = $('cv3'), ctx = cv.getContext('2d'); let use3d = false, topView = false, lastDt = .016, focus = null;
  try { if (typeof View3D !== 'undefined' && View3D && View3D.init(cv3)) { use3d = true; document.body.classList.add('v3', 'fps'); } } catch (e) { use3d = false; } let cw = 0, ch = 0, dpr = 1, T = 32, ox = 0, oy = 0, floor = null, floorKey = '';
  const TC = { fam: '#ff9a1f', stud: '#8b5cf6', sen: '#ffb3c7', job: '#3ba0ff', spar: '#43e08a', krit: '#ff2d95' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Start / Speichern ----------
  function newGame() { S = Sim.create(); prevMoney = S.money; resize(); }
  function save() { try { localStorage.setItem(KEY, Sim.save(S)); } catch (e) {} }
  function load() { try { const j = localStorage.getItem(KEY); if (j) { S = Sim.load(j); prevMoney = S.money; return true; } } catch (e) {} return false; }
  if (!load()) { newGame(); setTimeout(() => openPanel('hilfe'), 300); }
  // ---------- Marktradio (Live-Stream von laut.fm) ----------
  const RAD = { on: true, name: 'ricorewi', vol: .6, list: [{ n: 'ricorewi', d: 'RicoReWi' }], el: null, cur: '', gest: false, err: '', song: '', songT: 0, busy: false };
  try { const j = JSON.parse(localStorage.getItem('amh_radio') || 'null'); if (j) { RAD.on = j.on !== false; RAD.name = j.name || RAD.name; RAD.vol = typeof j.vol === 'number' ? j.vol : RAD.vol; if (Array.isArray(j.list) && j.list.length) RAD.list = j.list.filter(x => x && x.n).slice(0, 12); } } catch (e) {}
  const radSave = () => { try { localStorage.setItem('amh_radio', JSON.stringify({ on: RAD.on, name: RAD.name, vol: RAD.vol, list: RAD.list })); } catch (e) {} };
  const slug = s => { s = String(s || '').trim().toLowerCase(); const m = s.match(/laut\.fm\/([a-z0-9_-]+)/); if (m) s = m[1]; return s.replace(/^https?:\/\//, '').replace(/[^a-z0-9_-]/g, '').slice(0, 40); };
  const radName = () => (RAD.list.find(x => x.n === RAD.name) || { d: RAD.name }).d;
  function radioSync() {
    if (!S) return; const rads = S.objs.filter(o => o.k === 'radio'), want = RAD.on && rads.length > 0 && !document.hidden; let el = RAD.el;
    if (typeof View3D !== 'undefined' && View3D) View3D.st.radioOn = !!(el && !el.paused && want);
    if (want) {
      if (!el) { el = RAD.el = new Audio(); el.preload = 'none'; el.addEventListener('error', () => { if (el.getAttribute('src')) { RAD.err = 'Stream nicht erreichbar – Sendername oder Internet prüfen.'; } }); el.addEventListener('playing', () => { RAD.err = ''; }); }
      if (RAD.cur !== RAD.name) { el.src = 'https://stream.laut.fm/' + encodeURIComponent(RAD.name); RAD.cur = RAD.name; RAD.err = ''; RAD.song = ''; RAD.songT = 0; }
      const p = S.player; let d = 99; rads.forEach(o => { d = Math.min(d, Math.hypot(o.x + .5 - p.x, o.y + .5 - p.y)); }); el.volume = Math.max(0, Math.min(1, RAD.vol * Math.max(.1, Math.min(1, 1.2 - d / 15))));
      if (el.paused && RAD.gest && !RAD.busy) { RAD.busy = true; const pr = el.play(); if (pr && pr.then) pr.then(() => { RAD.busy = false; }).catch(() => { RAD.busy = false; RAD.err = 'Abspielen blockiert – klicke ins Spiel oder drücke „Radio an“.'; }); else RAD.busy = false; }
      radioSong();
    } else if (el && RAD.cur) { el.pause(); el.removeAttribute('src'); el.load(); RAD.cur = ''; RAD.busy = false; }
  }
  function radioSong() { const t = performance.now(); if (t - RAD.songT < 25000) return; RAD.songT = t; const n = RAD.name; fetch('https://api.laut.fm/station/' + encodeURIComponent(n) + '/current_song').then(r => r.ok ? r.json() : null).then(j => { if (j && n === RAD.name) { RAD.song = (j.artist && j.artist.name ? j.artist.name + ' – ' : '') + (j.title || ''); if (panel === 'radio' || cardId != null) { refresh(); } } }).catch(() => {}); }
  function radioToggle(on) { RAD.on = on == null ? !RAD.on : on; RAD.gest = true; radSave(); radioSync(); }
  ['pointerdown', 'keydown'].forEach(n => addEventListener(n, () => { if (!RAD.gest) { RAD.gest = true; radioSync(); } }, { capture: true }));
  async function radioAdd(raw) {
    const n = slug(raw); if (!n) return 'Bitte einen Sendernamen eingeben, z. B. ricorewi.'; if (RAD.list.some(x => x.n === n)) { RAD.name = n; radSave(); radioSync(); return ''; }
    try { const c = new AbortController(), to = setTimeout(() => c.abort(), 7000), r = await fetch('https://api.laut.fm/station/' + encodeURIComponent(n), { signal: c.signal }); clearTimeout(to); if (!r.ok) return 'Den Sender „' + n + '“ gibt es bei laut.fm nicht.'; const j = await r.json(); RAD.list.push({ n, d: j.display_name || n }); if (RAD.list.length > 12) RAD.list.shift(); RAD.name = n; RAD.on = true; RAD.gest = true; radSave(); radioSync(); return ''; }
    catch (e) { return 'Sender konnte nicht geprüft werden (Internet?).'; }
  }
  // ---------- Ton ----------
  let AC = null, radioT = 0;
  const tone = (f, dur, type, vol, delay) => { if (!snd) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .02); } catch (e) {} };
  const sfx = { scan() { tone(1760, .07, 'square', .05); tone(2217, .06, 'square', .04, .05); }, coin() { tone(1175, .12, 'square', .04); tone(1568, .18, 'square', .04, .07); }, ok() { tone(660, .1, 'triangle', .08); }, bad() { tone(150, .2, 'sawtooth', .06); }, lvl() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .1, i * .1)); } };
  function radioLoop() { clearInterval(radioT); const gn = D.GENRES[S.radio.genre]; let i = 0; radioT = setInterval(() => { if (RAD.on && RAD.el && !RAD.el.paused) return; if (!snd || !S || !S.up.radio || !S.radio.on || S.phase === 'summary' || document.hidden || spd === 0 || panel) return; const n = gn.notes[i++ % gn.notes.length]; tone(220 * Math.pow(2, n / 12), .35, 'triangle', .025); if (i % 3 === 0) tone(110 * Math.pow(2, gn.notes[0] / 12), .3, 'sine', .03); }, 60000 / gn.bpm); }
  // ---------- Größe / Boden ----------
  function resize() {
    if (!S) return; dpr = Math.min(2, devicePixelRatio || 1); const r = $('stage').getBoundingClientRect(); cw = r.width; ch = r.height; if (use3d) { View3D.resize(cw, ch); return; } cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    T = Math.max(14, Math.min(cw / (S.W + .4), ch / (S.H + 1.1))); ox = (cw - T * S.W) / 2; oy = (ch - T * (S.H + .9)) / 2 + 2; floorKey = '';
  }
  addEventListener('resize', resize); new ResizeObserver(resize).observe($('stage'));
  function buildFloor() {
    floor = document.createElement('canvas'); floor.width = Math.round(cw * dpr); floor.height = Math.round(ch * dpr); const g = floor.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#10162c'; g.fillRect(0, 0, cw, ch);
    for (let y = 0; y < S.H; y++) for (let x = 0; x < S.W; x++) { const wall = x === 0 || y === 0 || x === S.W - 1 || y === S.H - 1, door = y === S.H - 1 && x === 2; g.fillStyle = door ? '#c9a24a' : wall ? '#252d52' : (x + y) % 2 ? '#d9dfe9' : '#cdd4e2'; g.fillRect(ox + x * T, oy + y * T, T + .5, T + .5); }
    g.fillStyle = '#ffd24a'; g.font = `800 ${T * .36}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText('EINGANG', ox + 2.5 * T, oy + (S.H + .55) * T); g.fillStyle = '#5a6a9a'; g.fillText('MARKTHALLE 24', ox + S.W * T / 2, oy + T * .62); floorKey = S.W + 'x' + S.H + '@' + T.toFixed(1) + cw;
  }
  // ---------- Zeichnen ----------
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const em = (g, e, x, y, s) => { g.font = `${s}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, x, y); };
  function draw(now) {
    if (use3d) { if (S && cw && ch) View3D.render(S, lastDt, now, { heat: heatOn, ghost, place: mode && mode.t === 'place' ? mode : null }); return; }
    const g = ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch); if (!S || !cw || !ch) return; const key = S.W + 'x' + S.H + '@' + T.toFixed(1) + cw; if (key !== floorKey) buildFloor(); g.drawImage(floor, 0, 0, cw, ch);
    if (heatOn) { let mx = 1; S.heat.forEach(h => { if (h > mx) mx = h; }); for (let y = 0; y < S.H; y++) for (let x = 0; x < S.W; x++) { const h = S.heat[y * S.W + x]; if (h > 0.2) { g.fillStyle = `rgba(255,${Math.round(160 - 140 * h / mx)},30,${Math.min(.75, .15 + .6 * h / mx)})`; g.fillRect(ox + x * T, oy + y * T, T, T); } } }
    S.objs.forEach(o => drawObj(g, o)); S.messes.forEach(m => em(g, '💧', ox + (m.x + .5) * T, oy + (m.y + .5) * T, T * .6));
    S.staff.forEach(s => { g.fillStyle = '#fff'; g.beginPath(); g.arc(ox + s.x * T, oy + s.y * T, T * .3, 0, 7); g.fill(); em(g, D.STAFF[s.k].e, ox + s.x * T, oy + s.y * T, T * .5); if (s.carry) em(g, '📦', ox + s.x * T, oy + (s.y - .5) * T, T * .4); });
    S.customers.slice().sort((a, b) => a.y - b.y).forEach(c => drawCust(g, c));
    const p = S.player; g.fillStyle = '#00e5ff'; g.beginPath(); g.arc(ox + p.x * T, oy + p.y * T, T * .34, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); em(g, '🧑‍💼', ox + p.x * T, oy + p.y * T, T * .52); p.carry.forEach((b, i) => { em(g, P[b.p].e, ox + p.x * T, oy + (p.y - .55 - i * .35) * T, T * .45); });
    if (mode && mode.t === 'place' && ghost) { const t = D.OBJ[mode.k], w = mode.rot ? t.h : t.w, h = mode.rot ? t.w : t.h; g.fillStyle = 'rgba(0,255,200,.35)'; g.strokeStyle = '#00ffc8'; g.lineWidth = 3; rr(g, ox + ghost.x * T, oy + ghost.y * T, w * T, h * T, 6); g.fill(); g.stroke(); em(g, t.e, ox + (ghost.x + w / 2) * T, oy + (ghost.y + h / 2) * T, T * .6); }
    const wx = S.weather; if (wx === 'regen') { g.strokeStyle = 'rgba(150,190,255,.45)'; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 70; i++) { const x = (i * 97 + now * .25) % cw, y = (i * 53 + now * .6) % ch; g.moveTo(x, y); g.lineTo(x - 4, y + 12); } g.stroke(); } else if (wx === 'heiss') { g.fillStyle = 'rgba(255,150,0,.07)'; g.fillRect(0, 0, cw, ch); } else if (wx === 'kalt') { g.fillStyle = 'rgba(120,170,255,.08)'; g.fillRect(0, 0, cw, ch); }
    if (S.blackout) { g.fillStyle = 'rgba(0,0,20,.5)'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#ffd24a'; g.font = `900 ${Math.max(16, T * .6)}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText('⚡ STROMAUSFALL', cw / 2, oy + T * 1.4); }
    if (S.phase === 'prep') { g.fillStyle = 'rgba(0,0,30,.18)'; g.fillRect(0, 0, cw, ch); }
  }
  function drawObj(g, o) {
    const t = D.OBJ[o.k], x = ox + o.x * T, y = oy + o.y * T, w = o.w * T, h = o.h * T; g.fillStyle = 'rgba(0,0,0,.22)'; rr(g, x + 2, y + 3, w - 2, h - 2, 6); g.fill(); g.fillStyle = t.col; rr(g, x + 1, y + 1, w - 3, h - 3, 6); g.fill();
    if (o.k === 'ramp') { em(g, '📦', x + w / 2, y + h / 2, T * .6); g.fillStyle = '#fff'; g.font = `900 ${T * .34}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText(S.ramp.length + (S.backlog.length ? '+' + S.backlog.length : '') + ' Kart.', x + w / 2, y + h - T * .1); for (let i = 0; i < Math.min(6, S.ramp.length); i++) em(g, P[S.ramp[i].p].e, x + (i % 3 + .5) * T, y - T * .22 - ((i / 3) | 0) * T * .3, T * .38); return; }
    if (o.k === 'kasse' || o.k === 'sco') { em(g, t.e, x + w / 2, y + h / 2, T * .55); const st = Sim.serviceTile(o), op = S.staff.some(s => s.reg === o.id) || Math.hypot(S.player.x - st[0] - .5, S.player.y - st[1] - .5) < 1.25 || o.k === 'sco'; g.fillStyle = op ? '#43e08a' : '#ff6b7a'; g.beginPath(); g.arc(x + w - T * .18, y + T * .18, T * .09, 0, 7); g.fill(); if (!op && S.phase === 'open') em(g, '⚠️', x + w / 2, y - T * .3, T * .4); return; }
    if (o.k === 'lager') { em(g, t.e, x + w / 2, y + h / 2 - T * .08, T * .55); g.fillStyle = '#fff'; g.font = `800 ${T * .26}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText('+10 Platz', x + w / 2, y + h - T * .12); return; }
    if (o.k === 'deko' || o.k === 'radio') { em(g, t.e, x + w / 2, y + h / 2, T * .7); return; }
    const c = Sim.cap(S, o); if (!o.p) { em(g, '➕', x + w / 2, y + h / 2, T * .45); return; }
    const pr = P[o.p], n = o.w * o.h, per = Math.max(1, Math.ceil(Math.min(o.qty, c) / c * 2)); g.globalAlpha = o.qty ? 1 : .3; for (let i = 0; i < n; i++) { const cx = x + (o.w > o.h ? (i + .5) * T : w / 2), cy = y + (o.h > o.w ? (i + .5) * T : h / 2); em(g, pr.e, cx, cy - T * .06, T * (per > 1 ? .5 : .42)); } g.globalAlpha = 1;
    const f = Math.min(1, o.qty / c); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x + 4, y + h - T * .2, w - 8, T * .1); g.fillStyle = f > .5 ? '#43e08a' : f > .2 ? '#ffd24a' : '#ff6b7a'; g.fillRect(x + 4, y + h - T * .2, (w - 8) * f, T * .1);
    if (T >= 30) { g.fillStyle = '#fff'; g.font = `800 ${T * .27}px Inter,sans-serif`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(fmt(Sim.effPrice(S, o)).replace(' €', ''), x + 4, y + T * .27); if (o.disc) { g.fillStyle = '#ff2d95'; g.fillText('−30%', x + w - T * .85, y + T * .27); } }
    if (o.qty === 0 && S.phase === 'open') { g.fillStyle = '#ff6b7a'; g.font = `900 ${T * .3}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText('LEER', x + w / 2, y + h / 2 + T * .1); }
  }
  function drawCust(g, c) {
    const x = ox + c.x * T, y = oy + c.y * T, tp = D.TYPES[c.type], mood = Math.max(0, Math.min(1, c.mood / 100)); g.fillStyle = TC[c.type]; g.beginPath(); g.arc(x, y, T * .3, 0, 7); g.fill(); g.strokeStyle = `hsl(${mood * 120},90%,55%)`; g.lineWidth = 3; g.stroke(); em(g, tp.e, x, y, T * .48);
    if (c.basket.length) { g.fillStyle = '#fff'; g.font = `900 ${T * .26}px Inter,sans-serif`; g.textAlign = 'center'; g.fillText('🧺' + c.basket.reduce((a, b) => a + b.q, 0), x, y + T * .55); }
    if (c.bub) { g.fillStyle = 'rgba(255,255,255,.95)'; rr(g, x - T * .3, y - T * .95, T * .6, T * .55, 8); g.fill(); em(g, c.bub, x, y - T * .67, T * .38); }
    else if (c.st === 'shop' && c.shelf != null) { const it = c.list[c.li]; if (it) { g.fillStyle = 'rgba(255,255,255,.85)'; rr(g, x - T * .25, y - T * .85, T * .5, T * .45, 7); g.fill(); em(g, P[it.p].e, x, y - T * .62, T * .32); } }
  }
  // ---------- Eingabe ----------
  const keys = {}; let joy = { x: 0, y: 0 }, touch = false;
  addEventListener('keydown', e => { if (panel || !S) return; const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault(); keys[k] = 1; document.body.classList.add('kb'); if (k === 'e' || k === ' ' || k === 'enter') doAct(); if (k === 'r' && mode && mode.t === 'place') { mode.rot = mode.rot ? 0 : 1; } if (k === 'v') toggleView(); if (k === 'f') inspect(cw / 2, ch / 2); if (k === 'escape') { mode = null; showCard(null); } if (k === 'p') setSpd(spd ? 0 : 1); });
  addEventListener('keyup', e => { delete keys[e.key.toLowerCase()]; });
  function doAct() { const c = Sim.act(S, focus); if (c && c.a === 'scan') sfx.scan(); else if (c && c.a === 'radio') { radioToggle(); toast(RAD.on ? '📻 ' + radName() + ' läuft' : '📻 Radio aus'); } else if (c) sfx.ok(); else sfx.bad(); }
  $('act').addEventListener('pointerdown', e => { e.preventDefault(); doAct(); });
  const stick = $('stick'), knob = $('knob'); let sid = null;
  const mv = e => { const r = stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = Math.abs(dx) < .15 ? 0 : dx; joy.y = Math.abs(dy) < .15 ? 0 : dy; knob.style.transform = `translate(${dx * r.width * .3}px,${dy * r.height * .3}px)`; };
  stick.addEventListener('pointerdown', e => { sid = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch (x) {} mv(e); e.preventDefault(); });
  stick.addEventListener('pointermove', e => { if (e.pointerId === sid) mv(e); });
  ['pointerup', 'pointercancel'].forEach(n => stick.addEventListener(n, e => { if (e.pointerId === sid) { sid = null; joy.x = joy.y = 0; knob.style.transform = ''; } }));
  addEventListener('touchstart', () => { if (!touch) { touch = true; document.body.classList.add('touch'); } }, { passive: true });
  const tileAt = e => { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left - ox) / T), Math.floor((e.clientY - r.top - oy) / T)]; };
  const objAt = (x, y) => S.objs.find(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  function buildAt(x, y) {
    {
      if (mode.t === 'place') { const inv = mode.inv != null ? S.inv[mode.inv] : null; const o = Sim.place(S, mode.k, x, y, mode.rot, inv); if (o) { if (inv) { S.inv.splice(mode.inv, 1); mode = null; } sfx.ok(); if (!inv && (S.money < D.OBJ[mode.k].price)) mode = null; } else { sfx.bad(); toast('Hier geht das nicht (Platz, Wege oder Geld?).'); } showModeCard(); }
      else { const o = objAt(x, y); if (o) { const ok = mode.t === 'sell' ? Sim.sell(S, o.id) : Sim.pickUp(S, o.id); if (ok) { sfx.ok(); if (mode.t === 'pick') { mode = null; toast('Aufgehoben – unter „Bauen“ wieder platzieren.'); } } else { sfx.bad(); toast('Das lässt sich nicht aufheben.'); } showModeCard(); } }
    }
  }
  cv.addEventListener('pointermove', e => { if (mode && mode.t === 'place') { const [x, y] = tileAt(e); ghost = { x, y }; } });
  cv.addEventListener('pointerdown', e => {
    if (!S || panel) return; const [x, y] = tileAt(e); ghost = { x, y }; if (mode) { buildAt(x, y); return; }
    const o = objAt(x, y); showCard(o && o.k !== 'deko' ? o.id : null);
  });
  // ---- 3D: Blick, Antippen, Ansicht ----
  const inspect = (px, py) => { if (!use3d || !S || panel) return; if (mode) { return; } const h = View3D.pick(px, py, topView ? 200 : 7), o = h ? Sim.obj(S, h.id) : null; showCard(o && o.k !== 'deko' ? o.id : null); };
  function toggleView() { topView = !topView; $('bView').textContent = topView ? '🚶 Ego-Ansicht' : '👁️ Vogelperspektive'; syncView(); }
  function syncView() { if (!use3d) return; const top = topView || !!mode; View3D.setTop(top); document.body.classList.toggle('fps', !top); if (top && document.pointerLockElement) document.exitPointerLock(); }
  let drag = null;
  cv3.addEventListener('pointerdown', e => { if (!S || panel) return; if (e.pointerType === 'mouse') { if (View3D.st.top) { if (mode) { const t = View3D.floorAt(e.clientX - cv3.getBoundingClientRect().left, e.clientY - cv3.getBoundingClientRect().top); if (t) buildAt(t[0], t[1]); } else inspect(e.clientX - cv3.getBoundingClientRect().left, e.clientY - cv3.getBoundingClientRect().top); } else if (document.pointerLockElement !== cv3) { try { cv3.requestPointerLock(); } catch (x) {} } else inspect(cw / 2, ch / 2); return; } drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() }; try { cv3.setPointerCapture(e.pointerId); } catch (x) {} });
  cv3.addEventListener('pointermove', e => { const r = cv3.getBoundingClientRect(); if (mode && mode.t === 'place' && View3D.st.top) { const t = View3D.floorAt(e.clientX - r.left, e.clientY - r.top); if (t) ghost = { x: t[0], y: t[1] }; } if (e.pointerType === 'mouse') { if (document.pointerLockElement === cv3) View3D.look(e.movementX * .0024, e.movementY * .0024); return; } if (drag && e.pointerId === drag.id && !View3D.st.top) { View3D.look((e.clientX - drag.x) * .006, (e.clientY - drag.y) * .006); drag.x = e.clientX; drag.y = e.clientY; } });
  ['pointerup', 'pointercancel'].forEach(n => cv3.addEventListener(n, e => { if (!drag || e.pointerId !== drag.id) return; const r = cv3.getBoundingClientRect(), moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy); if (n === 'pointerup' && moved < 10 && performance.now() - drag.t < 350) { const px = e.clientX - r.left, py = e.clientY - r.top; if (mode && View3D.st.top) { const t = View3D.floorAt(px, py); if (t) { ghost = { x: t[0], y: t[1] }; buildAt(t[0], t[1]); } } else inspect(px, py); } drag = null; }));
  $('bView').onclick = () => toggleView();
  // ---------- HUD ----------
  function setSpd(v) { spd = v; ['s0', 's1', 's2', 's3'].forEach((id, i) => $(id).classList.toggle('on', [0, 1, 2, 4][i] === v)); }
  $('s0').onclick = () => setSpd(0); $('s1').onclick = () => setSpd(1); $('s2').onclick = () => setSpd(2); $('s3').onclick = () => setSpd(4);
  $('bOpen').onclick = () => { if (S.phase === 'prep') { if (Sim.openShop(S)) { sfx.ok(); toast('Der Laden ist geöffnet!'); } else toast(S.log[S.log.length - 1].t); } else if (S.phase === 'open') { S.t = Sim.DAYLEN; } };
  let toastT = 0; function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { el.style.opacity = 0; setTimeout(() => { el.hidden = true; }, 400); }, 3200); }
  let lastLog = 0;
  function hud() {
    $('money').textContent = fmt(S.money); $('money').classList.toggle('neg', S.money < 0); const W = D.WEATHER[S.weather], nx = D.WEATHER[S.forecast];
    $('clock').textContent = `${Sim.DOW[(S.day - 1) % 7]} · Tag ${S.day} · ${S.phase === 'prep' ? 'Vorbereitung' : Sim.clock(S)}`; $('wx').textContent = `${W.e} → ${nx.e}`; $('wx').title = `Heute ${W.name}, morgen ${nx.name}`;
    const st = Sim.stars(S); $('stars').textContent = '⭐'.repeat(Math.max(1, Math.round(st))) + ' ' + st.toFixed(1); $('lvl').textContent = 'Stufe ' + S.level; const need = Sim.lvlNeed(S.level), prev = S.level > 1 ? Sim.lvlNeed(S.level - 1) : 0; $('xpb').firstChild.style.width = Math.min(100, (S.xp - prev) / (need - prev) * 100) + '%';
    const b = $('bOpen'); if (S.phase === 'prep') { b.textContent = 'LADEN ÖFFNEN'; b.className = 'btn go'; b.disabled = false; } else if (S.phase === 'open') { b.textContent = 'FEIERABEND'; b.className = 'btn stop'; b.disabled = false; } else { b.textContent = 'Schluss …'; b.disabled = true; }
    if (S.money > prevMoney + 20) sfx.coin(); prevMoney = S.money; if (S.log.length && S.log[S.log.length - 1] !== lastLog) { lastLog = S.log[S.log.length - 1]; toast(lastLog.t); }
    if (S.phase === 'open' && now() - hintT > 25000 && S.customers.some(c => c.st === 'pay' && c.wait > 6)) { const r = S.objs.find(o => o.k === 'kasse'); if (r && !S.staff.some(x => x.k === 'kasse') && Math.hypot(S.player.x - r.x - .5, S.player.y - r.y + .5) > 1.3) { hintT = now(); toast('Kunden warten! Stell dich auf das Feld über der Kasse 💶'); } }
    if (use3d) { const hh = View3D.st.top ? null : View3D.pick(cw / 2, ch / 2, 3.6); focus = hh ? Sim.obj(S, hh.id) : null; const tp = $('tip'), tt = focus && !mode ? tipText(focus) : ''; tp.hidden = !tt; if (tt) tp.textContent = tt; }
    radioSync();
    const c = Sim.context(S, focus), a = $('act'); a.textContent = c ? c.label : '✋ Aktion'; a.classList.toggle('idle', !c);
  }
  function tipText(o) { const t = D.OBJ[o.k]; if (o.k === 'ramp') return `📦 Rampe · ${S.ramp.length} Kartons`; if (o.k === 'kasse' || o.k === 'sco') return `${t.e} ${t.name} · Schlange ${o.q.length}`; if (D.OBJ[o.k].cap > 0) return o.p ? `${P[o.p].e} ${P[o.p].name} · ${o.qty}/${Sim.cap(S, o)} · ${fmt(Sim.effPrice(S, o))}` : `${t.e} ${t.name} · frei – Klick: Ware wählen`; return `${t.e} ${t.name}`; }
  // ---------- Karte (Regal/Kasse antippen) ----------
  function showCard(id) { cardId = id; chooser = false; renderCard(); }
  function showModeCard() { renderCard(); }
  function renderCard() {
    const el = $('card'); if (mode) { el.hidden = false; el.innerHTML = `<h3>🔧 Baumodus: ${mode.t === 'place' ? D.OBJ[mode.k].name + ' platzieren' : mode.t === 'sell' ? 'Verkaufen (60 %)' : 'Aufheben'}</h3><small class="warn">Tippe auf das Spielfeld.${mode.t === 'place' ? ' Mit „Drehen“ wechselst du die Ausrichtung.' : ''}</small><div class="row">${mode.t === 'place' ? '<button class="btn sm" data-a="rot">🔄 Drehen</button>' : ''}<button class="btn sm go" data-a="modeoff">✔ Fertig</button></div>`; return; }
    const o = cardId != null ? Sim.obj(S, cardId) : null; if (!o) { el.hidden = true; return; } el.hidden = false; const t = D.OBJ[o.k];
    if (o.k === 'ramp') { el.innerHTML = `<h3>📦 Rampe</h3><small>${S.ramp.length} Kartons bereit${S.backlog.length ? `, ${S.backlog.length} warten draußen` : ''}. Geh heran und drücke die Aktionstaste.</small><div class="row">${S.ramp.slice(0, 10).map(b => `<span title="${esc(P[b.p].name)}">${P[b.p].e}×${b.n}</span>`).join(' ')}</div><div class="row"><button class="btn sm" data-a="cx">Schließen</button></div>`; return; }
    if (o.k === 'radio') { el.innerHTML = `<h3>📻 Marktradio · ${esc(radName())}</h3><small>${RAD.on ? (RAD.el && !RAD.el.paused ? '▶ läuft' : '⏳ startet …') : '⏸ aus'}${RAD.song ? ' · ' + esc(RAD.song) : ''}${RAD.err ? '<br><span class="bad">' + esc(RAD.err) + '</span>' : ''}</small><div class="row"><button class="btn sm ${RAD.on ? 'stop' : 'go'}" data-a="rplay">${RAD.on ? '⏸ Aus' : '▶ An'}</button><button class="btn sm" data-a="rpanel">📻 Sender &amp; Lautstärke</button><button class="btn sm" data-a="cx">✕</button></div>`; return; }
    if (o.k === 'kasse' || o.k === 'sco') { el.innerHTML = `<h3>${t.e} ${t.name}</h3><small>Schlange: ${o.q.length} Kunde(n). ${o.k === 'kasse' ? 'Stell dich oberhalb an die Kasse oder stell Kassenkräfte ein.' : 'Arbeitet allein, aber langsam.'}</small><div class="row"><button class="btn sm" data-a="cx">Schließen</button></div>`; return; }
    const pr = o.p ? P[o.p] : null, c = Sim.cap(S, o);
    if (chooser || !pr) { const opts = Object.values(P).filter(p => S.lic[p.cat] && Sim.fits(o, p.id)); el.innerHTML = `<h3>${t.e} ${t.name}: Ware wählen</h3><div class="row" style="max-height:34vh;overflow:auto">${opts.map(p => `<button class="btn sm" data-a="as" data-p="${p.id}">${p.e} ${esc(p.name)}</button>`).join('') || '<small>Keine passende Ware freigeschaltet.</small>'}</div><div class="row"><button class="btn sm" data-a="cx">Schließen</button></div>`; return; }
    const price = S.price[o.p], r = Sim.ref(S, o.p), cost = Sim.wholesale(S, o.p), mg = Math.round((Sim.effPrice(S, o) - cost) / Sim.effPrice(S, o) * 100), rv = Sim.rival(S, o.p);
    el.innerHTML = `<h3>${pr.e} ${esc(pr.name)} <small>${o.qty}/${c} · Ø ${o.age.toFixed(1)} Tage alt${pr.life ? ' (hält ' + pr.life + ')' : ''}</small></h3><div class="row"><button class="btn sm" data-a="pm" data-v="-5">−5 ct</button><b style="min-width:76px;text-align:center">${fmt(price)}</b><button class="btn sm" data-a="pm" data-v="5">+5 ct</button><button class="btn sm" data-a="pfair">Fair</button></div>
      <small>Markt ${fmt(r)} · Billigo ${fmt(rv)} · Einkauf ${fmt(cost)} · Marge <b class="${mg < 10 ? 'bad' : 'good'}">${mg} %</b>${price > r * 1.15 ? ' · <span class="bad">teurer als der Markt!</span>' : ''}${price > rv * 1.06 ? ' · <span class="warn">Billigo ist günstiger</span>' : ''}</small>
      <div class="row">${pr.life ? `<button class="btn sm ${o.disc ? 'go' : ''}" data-a="disc">🏷️ Reduziert −30 %</button>` : ''}<button class="btn sm" data-a="chg">🔁 Ware wechseln</button><button class="btn sm" data-a="clr">↩️ Leeren</button><button class="btn sm" data-a="cx">✕</button></div>`;
  }
  $('card').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, o = cardId != null ? Sim.obj(S, cardId) : null;
    if (a === 'rplay') { radioToggle(); renderCard(); } else if (a === 'rpanel') openPanel('radio'); else if (a === 'cx') showCard(null); else if (a === 'modeoff') { mode = null; renderCard(); } else if (a === 'rot') { mode.rot = mode.rot ? 0 : 1; }
    else if (o && a === 'pm') { Sim.setPrice(S, o.p, S.price[o.p] + +b.dataset.v); renderCard(); } else if (o && a === 'pfair') { Sim.setPrice(S, o.p, Math.round(Sim.ref(S, o.p) * 1.08 / 5) * 5); renderCard(); }
    else if (o && a === 'disc') { o.disc = !o.disc; renderCard(); } else if (o && a === 'chg') { chooser = true; renderCard(); } else if (o && a === 'clr') { Sim.assign(S, o.id, null); renderCard(); }
    else if (o && a === 'as') { if (Sim.assign(S, o.id, b.dataset.p)) { chooser = false; sfx.ok(); } renderCard(); }
  });
  // ---------- Fenster ----------
  const tabs = (items, cur, act) => `<div class="tabs">${items.map(([k, n]) => `<button class="btn glass ${k === cur ? 'on' : ''}" data-a="${act}" data-v="${k}">${n}</button>`).join('')}</div>`;
  const stock = p => { let q = 0; S.objs.forEach(o => { if (o.p === p) q += o.qty; }); const bx = S.ramp.concat(S.backlog).filter(b => b.p === p).length, ord = S.orders.filter(o => o.p === p).reduce((a, o) => a + o.boxes, 0); return { q, bx, ord }; };
  const R = {
    hilfe() { return `<div class="glass it"><b>So spielst du</b><small>1. <b>Bewegen &amp; Umsehen (Ego-Ansicht):</b> PC: ins Bild klicken, dann Maus = umsehen, WASD = laufen, Esc = Maus freigeben. Handy: Joystick links, rechts ins Bild ziehen = umsehen, antippen = Info. 2. <b>Kartons:</b> Geh zur 📦 Warenannahme (Rampe) hinten links, drücke E (Handy: Aktionsknopf), schau auf ein Regal und drücke E erneut – so füllst du es. F oder Klick auf ein Regal öffnet Preise &amp; Infos. V wechselt zur Vogelperspektive. 3. <b>Kasse:</b> Stell dich hinter die 💶 Kasse (Feld oberhalb). Dann scannst du jeden Artikel auf dem Band mit E (halten = schnell) – ohne Scannen geht es nur sehr langsam. 4. <b>Bestellen:</b> Im 🛒 Markt – Lieferung morgen früh. 5. <b>Preise:</b> Tippe ein Regal an oder nutze 🏷️ Preise. Marktpreis +8 % ist fair, teurer vertreibt Kunden, Billigo gegenüber lockt Schnäppchenjäger. 6. <b>Öffnen:</b> Mit „Laden öffnen“ startet der Tag (12 Minuten Ladenzeit).</small></div>
      <div class="glass it" style="margin-top:8px"><b>Das ist neu</b><small>📻 Eigener Radiosender (Musik &amp; Werbung lenken Kunden) · 🏪 Preis-Duell mit dem Konkurrenten „Billigo“ · 🧑‍🍳 Kunden mit Rezept-Einkäufen (Bonus bei vollständigem Set) · ⭐ Stammkunden mit Namen &amp; Treue · 🔥 Laufweg-Heatmap für dein Layout · 🌦️ Wetter-Vorhersage &amp; Ereignisse · 🏷️ Reduzieren statt wegwerfen · 🤖 Regalbot-Mitarbeiter mit Eigenarten · 🥐 Backstation (frische Backwaren jeden Morgen, lockt mit Duft) · 🏗️ Lager-Regale · 🤳 Online-Bewertungen &amp; Influencerinnen · 🏆 Erfolge.</small></div>`; },
    markt() {
      const cat = D.CATS[tabCat], lock = !S.lic[tabCat]; let h = tabs(Object.keys(D.CATS).map(c => [c, D.CATS[c].e + ' ' + D.CATS[c].name + (S.lic[c] ? '' : ' 🔒')]), tabCat, 'cat');
      const inc = S.orders.reduce((a, o) => a + o.boxes, 0); h += `<p class="h">Bestellte Lieferung (kommt morgen früh): <b>${inc}</b> Kartons. ${S.up.drohne ? '🚁 Mit Express-Drohne in 40 Sekunden (+25 %).' : ''} Stufe ${S.level} · Kasse ${fmt(S.money)}</p>`;
      if (lock) return h + `<div class="glass it"><b>${cat.e} ${cat.name}: Lizenz</b><small>${S.level >= cat.lvl ? 'Mit der Lizenz darfst du diese Warengruppe bestellen und verkaufen.' : 'Ab Stufe ' + cat.lvl + ' erhältlich.'}</small><div class="row"><button class="btn sm go" data-a="lic" data-v="${tabCat}" ${S.level < cat.lvl || S.money < cat.cost ? 'disabled' : ''}>Lizenz kaufen · ${fmt(cat.cost)}</button></div></div>`;
      h += '<div class="grid">'; Object.values(P).filter(p => p.cat === tabCat).forEach(p => { const s = stock(p.id), cs = Sim.wholesale(S, p.id), w = S.wish[p.id] || 0; h += `<div class="glass it"><div style="display:flex;gap:8px;align-items:center"><span class="e">${p.e}</span><b>${esc(p.name)}</b></div><small>Einkauf ${fmt(cs)}/Stk · Karton (${p.box}) ${fmt(cs * p.box)}<br>Markt ${fmt(Sim.ref(S, p.id))} · dein Preis ${fmt(S.price[p.id])}<br>Regal ${s.q} · Rampe ${s.bx} Kart. · bestellt ${s.ord}${S.up.scanner ? `<br>Nachfrage ${'🔥'.repeat(Math.min(5, Math.ceil(w / 6)))}${w ? ' (' + w + ' Wünsche)' : ' –'}` : ''}${p.life ? `<br>haltbar ${p.life} Tage` : ''}</small><div class="row"><button class="btn sm" data-a="buy" data-p="${p.id}" data-n="1">+1 Kart.</button><button class="btn sm" data-a="buy" data-p="${p.id}" data-n="3">+3</button><button class="btn sm" data-a="buy" data-p="${p.id}" data-n="6">+6</button>${S.up.drohne ? `<button class="btn sm" data-a="buyx" data-p="${p.id}">🚁 +1</button>` : ''}</div></div>`; }); return h + '</div>';
    },
    bauen() {
      let h = '<p class="h">Lege dein Layout selbst fest. Kunden brauchen freie Wege zu jedem Regal und zur Kasse. Tipp: Die 🍬 Quengelzone an der Kasse verkauft Süßes extra gut. In der 🔥 Heatmap (Zahlen) siehst du, wo Kunden laufen.</p><div class="grid">';
      Object.keys(D.OBJ).filter(k => !D.OBJ[k].fixed).forEach(k => { const t = D.OBJ[k], ok = S.level >= t.lvl && S.money >= t.price; h += `<div class="glass it"><b>${t.e} ${t.name}</b><small>${t.cap ? 'Platz ' + t.cap + ' · ' + t.st.map(s => ({ dry: 'trocken', cold: 'gekühlt', frost: 'tiefgekühlt', prod: 'frisch' }[s])).join('/') : ''} ${t.w}×${t.h}${S.level < t.lvl ? ' · ab Stufe ' + t.lvl : ''}</small><div class="row"><button class="btn sm go" data-a="bset" data-v="${k}" ${ok ? '' : 'disabled'}>Platzieren · ${fmt(t.price)}</button></div></div>`; });
      h += '</div>'; if (S.inv.length) h += '<h3>Im Lager</h3><div class="grid">' + S.inv.map((it, i) => `<div class="glass it"><b>${D.OBJ[it.k].e} ${D.OBJ[it.k].name}</b><small>${it.p ? esc(P[it.p].name) + ' ×' + it.qty : 'leer'}</small><div class="row"><button class="btn sm go" data-a="binv" data-v="${i}">Platzieren (gratis)</button></div></div>`).join('') + '</div>';
      h += '<div class="row" style="display:flex;gap:8px;margin:10px 0"><button class="btn glass" data-a="bpick">✋ Aufheben / Verschieben</button><button class="btn glass" data-a="bsell">💸 Verkaufen (60 %)</button></div>';
      const n = D.EXPAND[S.exp + 1]; h += n ? `<div class="glass it"><b>🏗️ Anbau: ${n.W}×${n.H} Felder</b><small>Mehr Fläche für mehr Regale, höhere Miete.${S.level < n.lvl ? ' Ab Stufe ' + n.lvl : ''}</small><div class="row"><button class="btn sm go" data-a="exp" ${S.level < n.lvl || S.money < n.price ? 'disabled' : ''}>Ausbauen · ${fmt(n.price)}</button></div></div>` : '<p class="h">Maximale Ladengröße erreicht.</p>'; return h;
    },
    preise() {
      const ps = Object.keys(P).filter(p => S.lic[P[p].cat] && (S.objs.some(o => o.p === p) || S.ramp.some(b => b.p === p))); let h = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button class="btn glass sm" data-a="pall" data-v="0.97">Günstig −3 %</button><button class="btn glass sm" data-a="pall" data-v="1.08">Fair +8 %</button><button class="btn glass sm" data-a="pall" data-v="1.18">Gierig +18 %</button></div><p class="h">Preise gelten für alle Regale einer Ware. Gierige Preise bringen mehr pro Stück, vertreiben aber Kunden – vor allem Sparfüchse und Studenten. Das Preisradar vergleicht mit Billigo.</p>`;
      if (!ps.length) return h + '<p class="h">Noch keine Ware im Laden.</p>'; h += '<table class="tbl"><tr><th>Ware</th><th>EK</th><th>Markt</th><th>Billigo</th><th>Dein Preis</th><th>Marge</th></tr>';
      ps.forEach(p => { const pr = S.price[p], r = Sim.ref(S, p), c = Sim.wholesale(S, p), rv = Sim.rival(S, p), mg = Math.round((pr - c) / pr * 100); h += `<tr><td>${P[p].e} ${esc(P[p].name)}</td><td>${fmt(c)}</td><td>${fmt(r)}</td><td class="${rv < pr * .94 ? 'warn' : ''}">${fmt(rv)}</td><td><button class="btn sm" data-a="pp" data-p="${p}" data-v="-5">−</button> <b>${fmt(pr)}</b> <button class="btn sm" data-a="pp" data-p="${p}" data-v="5">+</button></td><td class="${mg < 10 ? 'bad' : 'good'}">${mg} %</td></tr>`; });
      return h + '</table>';
    },
    staff() {
      let h = '<p class="h">Mitarbeiter bekommen jeden Abend ihren Lohn. Jede Person hat eine Eigenart. Kassenkräfte brauchen eine freie Kasse.</p>'; if (S.staff.length) { h += '<div class="grid">' + S.staff.map(s => `<div class="glass it"><b>${D.STAFF[s.k].e} ${esc(s.name)} · ${D.STAFF[s.k].name}</b><small>${D.TRAITS.find(t => t[0] === s.trait)[1]}<br>Lohn ${fmt(D.STAFF[s.k].wage)}/Tag</small><div class="row"><button class="btn sm" data-a="fire" data-v="${s.id}">Entlassen</button></div></div>`).join('') + '</div><h3>Einstellen</h3>'; }
      h += '<div class="grid">' + Object.keys(D.STAFF).map(k => { const t = D.STAFF[k]; return `<div class="glass it"><b>${t.e} ${t.name}</b><small>${t.desc}<br>${t.buy ? 'Kauf ' + fmt(t.buy) + ' · kein Lohn' : 'Lohn ' + fmt(t.wage) + '/Tag'}${S.level < t.lvl ? '<br>Ab Stufe ' + t.lvl : ''}</small><div class="row"><button class="btn sm go" data-a="hire" data-v="${k}" ${S.level < t.lvl || S.money < (t.buy || 0) ? 'disabled' : ''}>${t.buy ? 'Kaufen' : 'Einstellen'}</button></div></div>`; }).join('') + '</div>'; return h;
    },
    radio() {
      const has = S.objs.some(o => o.k === 'radio'), playing = RAD.el && !RAD.el.paused;
      let h = `<div class="glass it"><b>📻 Marktradio – Live-Stream</b><small>Sender: <b>${esc(radName())}</b> (laut.fm/${esc(RAD.name)}) · ${RAD.on ? (playing ? '▶ läuft' : '⏳ startet …') : '⏸ aus'}${RAD.song ? '<br>Jetzt läuft: <b>' + esc(RAD.song) + '</b>' : ''}${RAD.err ? '<br><span class="bad">' + esc(RAD.err) + '</span>' : ''}${has ? '' : '<br><span class="warn">Du hast noch kein Marktradio im Laden – stelle eins unter „Bauen“ auf.</span>'}<br>Die Lautstärke hängt davon ab, wie nah du am Radio stehst.</small><div class="row"><button class="btn sm ${RAD.on ? 'stop' : 'go'}" data-a="rplay">${RAD.on ? '⏸ Radio aus' : '▶ Radio an'}</button><label style="display:flex;gap:6px;align-items:center;font-size:13px">🔊 <input type="range" min="0" max="100" value="${Math.round(RAD.vol * 100)}" data-a="rvol" style="width:130px"></label></div>
        <div class="row">${RAD.list.map(x => `<button class="btn sm ${x.n === RAD.name ? 'go' : ''}" data-a="rst" data-v="${esc(x.n)}">${esc(x.d)}</button>`).join('')}</div>
        <div class="row"><input id="rname" placeholder="Sendername, z. B. ricorewi" maxlength="60" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font:600 14px Inter,sans-serif;min-width:200px"><button class="btn sm go" data-a="radd">Sender hinzufügen</button></div><small id="rmsg" class="bad"></small><small>Alle Sender von laut.fm gehen: Der Name steht hinten im Link (stream.laut.fm/<b>name</b>).</small></div><h3 style="margin-top:12px">Markt-Funk 24 (Spielfunktion)</h3>`;
      if (!S.up.radio) return h + '<div class="glass it"><b>📻 Radiostudio „Markt-Funk 24“</b><small>Dein eigener Sender im Laden: Der Musikstil lockt bestimmte Kunden, Werbespots machen eine Ware zum Tageshit (×2,6 Nachfrage). Kaufbar unter „Ausbau“ ab Stufe 3.</small></div>';
      h += `<div style="display:flex;gap:6px;margin-bottom:8px"><button class="btn glass ${S.radio.on ? 'on' : ''}" data-a="ron" style="${S.radio.on ? 'background:linear-gradient(180deg,#43e08a,#0f9a54);color:#04170d' : ''}">${S.radio.on ? '📻 Sender läuft' : '📻 Sender aus'}</button></div><h3>Musikstil</h3><div class="grid">` + Object.keys(D.GENRES).map(g => { const t = D.GENRES[g], fans = Object.keys(D.TYPES).filter(k => D.TYPES[k].music === g).map(k => D.TYPES[k].e + ' ' + D.TYPES[k].name).join(', '); return `<div class="glass it"><b>${t.e} ${t.name}</b><small>Mehr: ${fans}</small><div class="row"><button class="btn sm ${S.radio.genre === g ? 'go' : ''}" data-a="rg" data-v="${g}">${S.radio.genre === g ? 'Läuft' : 'Spielen'}</button></div></div>`; }).join('') + '</div>';
      const ads = Object.keys(S.radio.ads).length; h += `<h3>Werbespots für heute (${ads}/3) · 40 € pro Spot</h3><div class="grid">` + Object.keys(P).filter(p => S.objs.some(o => o.p === p)).map(p => `<div class="glass it"><b>${P[p].e} ${esc(P[p].name)}</b><div class="row"><button class="btn sm ${S.radio.ads[p] ? 'go' : ''}" data-a="rad" data-p="${p}" ${!S.radio.ads[p] && (ads >= 3 || S.money < 4000) ? 'disabled' : ''}>${S.radio.ads[p] ? '✔ gebucht' : 'Spot buchen'}</button></div></div>`).join('') + '</div>'; return h;
    },
    up() {
      let h = '<div class="grid">' + D.UPGRADES.map(u => `<div class="glass it"><b>${u.e} ${u.name}</b><small>${u.desc}${S.level < u.lvl ? '<br>Ab Stufe ' + u.lvl : ''}</small><div class="row">${S.up[u.id] ? '<span class="good">✔ gekauft</span>' : `<button class="btn sm go" data-a="up" data-v="${u.id}" ${S.level < u.lvl || S.money < u.price ? 'disabled' : ''}>${fmt(u.price)}</button>`}</div></div>`).join('') + '</div>';
      h += `<h3>🏦 Bank</h3><div class="glass it"><small>Kredit: <b>${fmt(S.loan)}</b> (3 % Zinsen pro Tag) · Rahmen ${fmt(Sim.loanMax(S))}</small><div class="row"><button class="btn sm" data-a="loan" data-v="50000">+ 500 € leihen</button><button class="btn sm" data-a="loan" data-v="-50000">500 € zurück</button></div></div>`; return h;
    },
    stat() {
      const T = S.today, hist = S.hist.slice(-14), mx = Math.max(1, ...hist.map(h => Math.max(h.rev, Math.abs(h.profit)))); let h = `<div class="grid"><div class="glass it"><b>Heute</b><small>Umsatz ${fmt(T.rev)}<br>Verkaufte Artikel ${T.items} · Kunden ${T.served}<br>Verlorene Kunden ${T.lost} · Diebstahl ${fmt(T.stolen)}<br>Stammkunden: ${S.regs.length}</small></div><div class="glass it"><b>Ruf ${Sim.stars(S).toFixed(1)} ⭐</b><small>Preise, volle Regale, kurze Schlangen und Sauberkeit machen Kunden glücklich. Gesamtumsatz ${fmt(S.totalRev)}, bester Tag ${fmt(S.bestRev)}.</small></div></div>`;
      h += '<h3>Letzte Tage</h3><div style="display:flex;gap:4px;align-items:flex-end;height:110px">' + (hist.map(x => `<div title="Tag ${x.d}: Umsatz ${fmt(x.rev)} Gewinn ${fmt(x.profit)}" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%"><div style="height:${x.rev / mx * 100}%;background:linear-gradient(180deg,var(--c),#0a7aa8);border-radius:4px 4px 0 0"></div><small style="text-align:center;color:${x.profit < 0 ? '#ff6b7a' : '#43e08a'}">${x.d}</small></div>`).join('') || '<small>Noch keine Tage.</small>') + '</div>';
      const w = Object.keys(S.wish).sort((a, b) => S.wish[b] - S.wish[a]).slice(0, 6); h += '<h3>Wunschzettel der Kunden</h3>' + (S.up.scanner ? (w.length ? '<table class="tbl">' + w.map(p => `<tr><td>${P[p].e} ${esc(P[p].name)}</td><td>${S.wish[p]}× gewünscht</td></tr>`).join('') + '</table>' : '<p class="h">Noch nichts.</p>') : '<p class="h">Mit „Marktforschung“ (Ausbau) siehst du, welche Ware Kunden vermissen.</p>');
      h += `<h3>🤳 Online-Bewertungen</h3>`; const rv = S.reviews.slice(-8).reverse(), avg = S.reviews.length ? S.reviews.reduce((a, r) => a + r.s, 0) / S.reviews.length : 0;
      h += S.reviews.length ? `<p class="h">Ø ${avg.toFixed(1)} ⭐ aus ${S.reviews.length} Bewertungen · Online-Hype <b class="${S.buzz >= 0 ? 'good' : 'bad'}">${S.buzz >= 0 ? '+' : ''}${Math.round(S.buzz * 100)} %</b> Kundschaft. Gute Bewertungen (und Influencerinnen!) lassen mehr Leute kommen.</p><table class="tbl">` + rv.map(r => `<tr><td>${'⭐'.repeat(r.s)}</td><td>${esc(r.n)}: ${esc(r.t)}</td></tr>`).join('') + '</table>' : '<p class="h">Noch keine Bewertungen – sie kommen nach den ersten Kunden.</p>';
      return h + `<h3>Laufwege</h3><button class="btn glass" data-a="heat">${heatOn ? '🔥 Heatmap ausblenden' : '🔥 Heatmap einblenden'}</button><p class="h">Rot = viele Kunden. Stelle Teures und Spontankäufe auf die roten Wege.</p>`;
    },
    ziele() {
      const need = Sim.lvlNeed(S.level); let h = `<div class="glass it"><b>Stufe ${S.level}</b><div class="bar"><i style="width:${Math.min(100, S.xp / need * 100)}%"></i></div><small>${S.xp} / ${need} Erfahrung</small></div><h3>Tagesziele</h3><div class="grid">`;
      h += S.quests.map(q => { const d = D.QUESTS.find(x => x.id === q.id), v = Sim.questVal(S, q); return `<div class="glass it"><b>${d.t.replace('{n}', q.n)}</b><div class="bar"><i style="width:${d.max ? 100 : Math.min(100, v / q.n * 100)}%"></i></div><small>${d.max ? 'bisher ' + v : v + ' / ' + q.n} · Belohnung ${fmt(d.r)}</small></div>`; }).join('') + '</div>';
      h += `<h3>🏆 Erfolge (${Sim.achDone(S)}/${D.ACH.length})</h3><div class="grid">` + D.ACH.map(a => `<div class="glass it" style="opacity:${S.ach[a[0]] ? 1 : .55}"><b>${a[2]} ${a[1]} ${S.ach[a[0]] ? '✔' : '🔒'}</b><small>${a[3]}<br>Belohnung ${fmt(a[4])}</small></div>`).join('') + '</div>'; return h;
    },
    menu() { return `<div class="grid"><div class="glass it"><b>💾 Speichern</b><small>Es wird auch automatisch am Tagesende gespeichert.</small><div class="row"><button class="btn sm go" data-a="save">Jetzt speichern</button></div></div><div class="glass it"><b>🔊 Ton</b><div class="row"><button class="btn sm" data-a="snd">${snd ? 'An – ausschalten' : 'Aus – einschalten'}</button></div></div><div class="glass it"><b>❓ Hilfe</b><div class="row"><button class="btn sm" data-a="hilfe">Anleitung</button></div></div><div class="glass it"><b>🗑️ Neues Spiel</b><small>Löscht deinen Spielstand.</small><div class="row"><button class="btn sm stop" data-a="reset">Neu beginnen</button></div></div></div>`; }
  };
  const TITLES = { hilfe: '❓ Anleitung', markt: '🛒 Großhandel', bauen: '🔧 Bauen', preise: '🏷️ Preise', staff: '👥 Personal', radio: '📻 Marktradio', up: '⭐ Ausbau', stat: '📊 Zahlen', ziele: '🎯 Ziele', menu: '☰ Menü' };
  function openPanel(n) { try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { } panel = n; mode = null; showCard(null); $('pt').textContent = TITLES[n]; $('pb').innerHTML = R[n](); $('panel').hidden = false; }
  function refresh() { if (panel) { const y = $('panel').scrollTop; $('pb').innerHTML = R[panel](); $('panel').scrollTop = y; } }
  function closePanel() { panel = null; $('panel').hidden = true; }
  $('px').onclick = closePanel; document.querySelectorAll('#dock [data-p]').forEach(b => b.onclick = () => openPanel(b.dataset.p));
  $('pb').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, v = b.dataset.v, p = b.dataset.p; let ok = true;
    if (a === 'rplay') radioToggle(); else if (a === 'rst') { RAD.name = slug(v); RAD.on = true; RAD.gest = true; radSave(); radioSync(); } else if (a === 'rvol') return; else if (a === 'radd') { radioAdd($('rname').value).then(msg => { if (msg) { const m = $('rmsg'); if (m) m.textContent = msg; } else refresh(); }); return; }
    else if (a === 'cat') tabCat = v; else if (a === 'buy') ok = Sim.order(S, p, +b.dataset.n); else if (a === 'buyx') ok = Sim.order(S, p, 1, true); else if (a === 'lic') ok = Sim.buyLic(S, v);
    else if (a === 'bset') { mode = { t: 'place', k: v, rot: 0 }; closePanel(); renderCard(); return; } else if (a === 'binv') { mode = { t: 'place', k: S.inv[+v].k, rot: 0, inv: +v }; closePanel(); renderCard(); return; } else if (a === 'bpick') { mode = { t: 'pick' }; closePanel(); renderCard(); return; } else if (a === 'bsell') { mode = { t: 'sell' }; closePanel(); renderCard(); return; }
    else if (a === 'exp') { ok = Sim.expand(S); resize(); } else if (a === 'pp') Sim.setPrice(S, p, S.price[p] + +v); else if (a === 'pall') Object.keys(P).forEach(q => { if (S.lic[P[q].cat]) Sim.setPrice(S, q, Math.round(Sim.ref(S, q) * +v / 5) * 5); });
    else if (a === 'hire') ok = !!Sim.hire(S, v); else if (a === 'fire') Sim.fire(S, +v); else if (a === 'ron') S.radio.on = !S.radio.on; else if (a === 'rg') { S.radio.genre = v; radioLoop(); }
    else if (a === 'rad') { if (S.radio.ads[p]) { delete S.radio.ads[p]; S.money += 4000; } else if (S.money >= 4000 && Object.keys(S.radio.ads).length < 3) { S.money -= 4000; S.radio.ads[p] = 1; } }
    else if (a === 'up') { ok = Sim.buyUp(S, v); if (ok && v === 'radio') radioLoop(); } else if (a === 'loan') ok = +v > 0 ? Sim.borrow(S, +v) : Sim.repay(S, -v); else if (a === 'heat') heatOn = !heatOn;
    else if (a === 'save') { save(); toast('Gespeichert.'); } else if (a === 'snd') { snd = !snd; try { localStorage.setItem('amh_snd', snd ? '1' : '0'); } catch (e) {} } else if (a === 'hilfe') { openPanel('hilfe'); return; }
    else if (a === 'reset') { if (confirm('Wirklich neu beginnen? Der Spielstand geht verloren.')) { try { localStorage.removeItem(KEY); } catch (e) {} newGame(); closePanel(); } return; }
    if (ok === false) { sfx.bad(); if (S.log.length) toast(S.log[S.log.length - 1].t); } else if (['buy', 'buyx', 'lic', 'hire', 'up', 'exp'].includes(a)) sfx.ok(); refresh();
  });
  $('pb').addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.a === 'rvol') { RAD.vol = Math.max(0, Math.min(1, +t.value / 100)); radSave(); radioSync(); } });
  // ---------- Tagesabschluss ----------
  function showSummary() {
    const m = S.summary; save(); $('sum').hidden = false; closePanel();
    $('sb').innerHTML = `<div class="glass" style="padding:16px"><h1 style="margin:0 0 8px;font:900 26px 'Trebuchet MS',sans-serif;color:var(--y)">Feierabend – Tag ${m.day}</h1>
      <table class="tbl"><tr><td>Umsatz</td><td><b>${fmt(m.rev)}</b></td></tr><tr><td>Wareneinsatz</td><td>${fmt(-m.cogs)}</td></tr>${m.bills.map(b => `<tr><td>${b[0]}</td><td>${fmt(-b[1])}</td></tr>`).join('')}${m.wasteVal ? `<tr><td>Verdorben (${esc(m.waste.join(', '))})</td><td class="bad">${fmt(-m.wasteVal)}</td></tr>` : ''}${m.stolen ? `<tr><td>Diebstahl &amp; Schwund</td><td class="bad">${fmt(-m.stolen)}</td></tr>` : ''}<tr><td><b>Gewinn</b></td><td><b class="${m.profit < 0 ? 'bad' : 'good'}">${fmt(m.profit)}</b></td></tr></table>
      <p class="h">👥 ${m.served} Kunden bedient · 😞 ${m.lost} verloren · 🛍️ ${m.items} Artikel · ⭐ ${m.stars.toFixed(1)}</p>${m.top.length ? `<p class="h">Bestseller: ${m.top.map(esc).join(' · ')}</p>` : ''}
      ${m.ach && m.ach.length ? `<p class="warn">🏆 Neuer Erfolg:<br>${m.ach.map(esc).join('<br>')}</p>` : ''}
      ${m.done.length ? `<p class="good">🎯 Ziele erreicht:<br>${m.done.map(esc).join('<br>')}</p>` : ''}${m.lv ? `<p class="warn">⭐ Aufstieg auf Stufe ${m.level}!</p>` : ''}
      <p class="h">Kontostand: <b>${fmt(S.money)}</b>${S.money < 0 ? ' – Achtung, du bist im Minus! Nimm bei Bedarf einen Kredit unter „Ausbau“.' : ''}</p>
      <p class="h">Morgen: ${D.WEATHER[S.forecast].e} ${D.WEATHER[S.forecast].name}.</p><button class="btn go" id="nd" style="width:100%;font-size:17px;padding:12px">Weiter zu Tag ${m.day + 1}</button></div>`;
    $('nd').onclick = () => { Sim.nextDay(S); $('sum').hidden = true; save(); prevMoney = S.money; };
    if (m.lv) sfx.lvl();
  }
  // ---------- Hauptschleife ----------
  function frame(now) {
    requestAnimationFrame(frame); const dt = Math.min(.1, (now - last) / 1000); last = now; lastDt = dt; if (!S) return; tick++;
    const pause = panel || !$('sum').hidden;
    if (!pause && use3d) { const fw = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) - joy.y, sd = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + joy.x; if (keys.arrowleft) View3D.look(-dt * 2.2, 0); if (keys.arrowright) View3D.look(dt * 2.2, 0); const [vx, vy] = View3D.move(Math.max(-1, Math.min(1, fw)), Math.max(-1, Math.min(1, sd))); S.player.vx = vx; S.player.vy = vy; if (spd > 0) Sim.step(S, dt * spd); else { S.player.vx = S.player.vy = 0; } }
    else if (!pause) { let vx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), vy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0); S.player.vx = vx || joy.x; S.player.vy = vy || joy.y; if (spd > 0) Sim.step(S, dt * spd); else { S.player.vx = S.player.vy = 0; } }
    if (S.phase === 'summary' && $('sum').hidden) showSummary();
    if (use3d && (topView || !!mode) !== View3D.st.top) syncView();
    hudT -= dt; if (hudT <= 0) { hudT = .2; hud(); if (cardId != null && tick % 6 === 0 && !chooser && !mode) renderCard(); } saveT += dt; if (saveT > 45 && S.phase !== 'summary') { saveT = 0; save(); } draw(now);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.phase !== 'summary') save(); });
  addEventListener('beforeunload', () => { if (S && S.phase !== 'summary') save(); });
  if (use3d && matchMedia('(pointer:fine)').matches) setTimeout(() => toast('Tipp: Klicke ins Bild, um dich mit der Maus umzusehen (Esc gibt sie frei).'), 1500);
  if (S.up.radio) radioLoop(); resize(); requestAnimationFrame(frame);
  window.__amh = { get S() { return S; }, Sim };
})();
