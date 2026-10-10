'use strict';
/* AnMaCha Kart Rush – Host/Solo: Menü, Rennablauf, Splitscreen-HUD, Handy-Kopplung (PeerJS). Controller: controller.js */
const $ = id => document.getElementById(id);
const qp = new URLSearchParams(location.search);
const JOIN = (qp.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), PH = qp.get('ph') || '';
const NAMES = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio'];
const CDN = { three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', peer: 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', qr: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js' };
const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen: ' + src)); document.head.appendChild(s); });
const peerCfg = () => { if (!PH) return {}; const [h, p] = PH.split(':'); return { host: h, port: +p || 9000, path: '/', secure: false }; };
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const fmtT = t => { if (t == null || !isFinite(t)) return '–'; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
const SLOTC = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'], SKILLS = ['Anfänger', 'Normal', 'Profi'], ITEM_ICON = { boost: '🚀', mine: '📢', rocket: '🎯', shield: '🛡️' }, ITEM_NAME = { boost: 'Bass-Boost', mine: 'Störsignal', rocket: 'Jingle-Rakete', shield: 'Frequenz-Schild' };
const GP_PTS = [15, 12, 10, 8, 6, 4, 2, 1];
const ordinal = n => n + '.';

// Neigungssteuerung (optional, Handy): liefert TILT.v in -1..1
const TILT = {
  on: false, inv: false, v: 0,
  async enable() { try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false; } } catch (e) { return false; }
    if (!TILT.h) { TILT.h = e => { const a = (screen.orientation && screen.orientation.angle != null) ? screen.orientation.angle : (window.orientation || 0); let raw = a === 90 ? e.beta : (a === 270 || a === -90) ? -e.beta : a === 180 ? -e.gamma : e.gamma; raw = (raw || 0) / 25; TILT.v = Math.max(-1, Math.min(1, TILT.inv ? -raw : raw)); if (Math.abs(TILT.v) < 0.06) TILT.v = 0; }; addEventListener('deviceorientation', TILT.h); }
    TILT.on = true; return true; },
  disable() { TILT.on = false; TILT.v = 0; }
};
// Touch-Flächen: Zeiger -> Taste (auch beim Rüberwischen)
function bindZones(root, state) {
  const ptr = new Map(), calc = () => { const on = { l: 0, r: 0, b: 0, d: 0, i: 0 }; ptr.forEach(k => { if (k) on[k] = 1; }); Object.assign(state, on); root.querySelectorAll('.zone').forEach(z => z.classList.toggle('on', !!on[z.dataset.k])); };
  const keyAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.dataset && el.dataset.k && root.contains(el) ? el.dataset.k : null; };
  root.addEventListener('pointerdown', e => { ptr.set(e.pointerId, keyAt(e)); calc(); e.preventDefault(); });
  root.addEventListener('pointermove', e => { if (ptr.has(e.pointerId)) { ptr.set(e.pointerId, keyAt(e)); calc(); } });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => root.addEventListener(ev, e => { ptr.delete(e.pointerId); calc(); }));
  root.addEventListener('contextmenu', e => e.preventDefault());
}

if (JOIN) { document.body.classList.add('ctrl'); loadScript('controller.js').then(() => window.startController && window.startController()).catch(e => { $('err').hidden = false; $('errTxt').textContent = e.message; }); }
else initHost();

function initHost() {
  if (window.self !== window.top) $('backLink').hidden = true;
  const coarse = matchMedia('(pointer:coarse)').matches; if (coarse) document.body.classList.add('touch');
  let save = { rmode: 'race', track: 0, laps: 3, skill: 1, name: '', logo: 6, best: {}, kb: true };
  try { const s = JSON.parse(localStorage.getItem('akSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('akSave', JSON.stringify(save)); } catch (e) {} };
  const TR = Track.DEFS; let trCache = {}; const getTrack = i => trCache[i] || (trCache[i] = Track.build(TR[i]));
  let logos = [], ready = false, R = null, lobbyOpen = false, peer = null, room = '', players = [], loopOn = false, lastT = 0, paused = false, curTrackIdx = -1, GP = null, nVp = 1;
  const kb = { l: 0, r: 0, b: 0, d: 0, i: 0 }, tc = { l: 0, r: 0, b: 0, d: 0, i: 0 };

  // ------------------------------------------------------------------ Logos / Marke
  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  (function brand() { const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`))); Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; }); })();

  // ------------------------------------------------------------------ Menü
  function renderMenu() {
    $('rmode').innerHTML = [['race', 'Einzelrennen'], ['gp', 'Grand Prix', '3 Strecken'], ['tt', 'Zeitfahren', 'allein, ohne Items']].map(m => `<button class="chip ${save.rmode === m[0] ? 'on' : ''}" data-m="${m[0]}">${m[1]}${m[2] ? `<small>${m[2]}</small>` : ''}</button>`).join('');
    $('rmode').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { save.rmode = b.dataset.m; persist(); renderMenu(); });
    $('tracks').hidden = $('tracks').previousElementSibling.hidden = save.rmode === 'gp';
    $('tracks').innerHTML = TR.map((t, i) => `<button class="chip ${save.track === i ? 'on' : ''}" data-t="${i}">${esc(t.name)}</button>`).join('');
    $('tracks').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { save.track = +b.dataset.t; persist(); renderMenu(); if (ready) { View.setTrack(getTrack(save.track)); curTrackIdx = save.track; } });
    $('laps').innerHTML = [2, 3, 5].map(n => `<button class="chip ${save.laps === n ? 'on' : ''}" data-l="${n}">${n}</button>`).join(''); $('laps').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { save.laps = +b.dataset.l; persist(); renderMenu(); });
    $('skill').innerHTML = SKILLS.map((s, i) => `<button class="chip ${save.skill === i ? 'on' : ''}" data-k="${i}">${s}</button>`).join(''); $('skill').querySelectorAll('[data-k]').forEach(b => b.onclick = () => { save.skill = +b.dataset.k; persist(); renderMenu(); });
    $('skill').hidden = $('skill').previousElementSibling.hidden = save.rmode === 'tt';
    $('pcard').innerHTML = `<img alt="" src="${logoSrc(save.logo)}" title="${esc(NAMES[save.logo] || '')}"><input maxlength="14" value="${esc(save.name)}" placeholder="Dein Name"><span class="info">Logo antippen</span>`;
    $('pcard').querySelector('img').onclick = e => { save.logo = nextLogo(save.logo); e.target.src = logoSrc(save.logo); persist(); };
    $('pcard').querySelector('input').oninput = e => { save.name = e.target.value; persist(); };
    $('bSolo').disabled = $('bMulti').disabled = !ready; $('bSolo').textContent = ready ? (coarse ? 'SOLO – LOS!' : 'SOLO FAHREN') : 'LADEN …';
  }
  const syncSnd = () => { $('bSnd').textContent = AUD.muted ? '🔇' : '🔊'; $('bMenuSnd').textContent = AUD.muted ? '🔇 Ton aus' : '🔊 Ton an'; };
  const togSnd = () => { AUD.setMute(!AUD.muted); syncSnd(); if (!R && !AUD.muted) AUD.bed('menu'); };
  $('bSnd').onclick = $('bMenuSnd').onclick = togSnd; syncSnd();
  function renderTop() {
    $('topList').innerHTML = TR.map(t => { const b = save.best[t.id] || {}; return `<div class="brow" style="--sc:${t.sky[1]}"><span>${esc(t.name)}</span><b>${b.lap ? '⏱ ' + fmtT(b.lap) : '–'}</b></div>`; }).join('') + '<p class="info">Beste Runde je Strecke (lokal im Browser).</p>';
  }
  $('bTop').onclick = () => { renderTop(); $('top').hidden = false; }; $('bTopClose').onclick = () => { $('top').hidden = true; };

  // ------------------------------------------------------------------ Start: Solo / Mehrspieler
  Promise.all([loadLogos(), loadScript(CDN.three).then(() => loadScript('view.js'))]).then(() => {
    View.init($('cv'), logos); curTrackIdx = save.track; View.setTrack(getTrack(save.track)); View.resize(innerWidth, innerHeight, 1); ready = true; $('loadInfo').textContent = `${TR.length} Strecken · ${logos.length} Sender-Logos`; renderMenu();
    lastT = performance.now(); loopOn = true; requestAnimationFrame(frame);
  }).catch(e => { $('err').hidden = false; $('errTxt').textContent = 'Das Spiel konnte nicht geladen werden (' + e.message + '). Bitte Internetverbindung prüfen.'; });
  renderMenu(); document.addEventListener('pointerdown', () => AUD.unlock(), { once: true }); document.addEventListener('pointerdown', () => { if (!R && ready && !AUD.muted) AUD.bed('menu'); }, { once: true });
  addEventListener('resize', () => { if (ready) { View.resize(innerWidth, innerHeight, nVp); layoutHud(); } });
  bindZones($('tcSolo'), tc); if (coarse) { $('tiltRow').hidden = false; $('tiltBtn').onclick = async () => { if (TILT.on) TILT.disable(); else await TILT.enable(); $('tiltBtn').classList.toggle('on', TILT.on); }; $('tiltInv').onclick = () => { TILT.inv = !TILT.inv; $('tiltInv').classList.toggle('on', TILT.inv); }; }
  $('bSolo').onclick = () => { players = [{ name: (save.name || '').trim() || 'Fahrer', logo: save.logo, conn: null, input: { s: 0, b: 0, d: 0, i: 0 }, local: true }]; beginSeries(); };
  $('bMulti').onclick = openLobby;

  // ------------------------------------------------------------------ Koppeln (PeerJS)
  const randCode = n => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const remotes = () => players.filter(p => p.conn);
  async function openLobby() {
    AUD.unlock(); $('menu').hidden = true; $('lobby').hidden = false; lobbyOpen = true; players = players.filter(p => p.conn && p.conn.open); if (save.kb) addKbPlayer(); updateLobby();
    if (!peer) {
      $('code').textContent = '….'; $('pairUrl').textContent = 'Verbinde …';
      try { await Promise.all([window.Peer || loadScript(CDN.peer), window.qrcode || loadScript(CDN.qr)]); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich (Internet?)'; return; }
      createRoom();
    } else showPair();
  }
  function createRoom() {
    room = randCode(4);
    try { peer = new Peer('amk-' + room, peerCfg()); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich'; return; }
    peer.on('open', showPair);
    peer.on('error', e => { if (e.type === 'unavailable-id') { try { peer.destroy(); } catch (x) {} peer = null; createRoom(); } else $('pairUrl').textContent = 'Verbindung zum Koppel-Server nicht möglich (' + e.type + ')'; });
    peer.on('connection', c => { c.on('data', m => onRemote(c, m)); c.on('close', () => onGone(c)); c.on('error', () => onGone(c)); });
  }
  const pairUrl = () => location.href.split('#')[0].split('?')[0] + '?join=' + room + (PH ? '&ph=' + encodeURIComponent(PH) : '');
  function showPair() { $('code').textContent = room; const url = pairUrl(); $('pairUrl').textContent = url; try { const q = qrcode(0, 'M'); q.addData(url); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').innerHTML = ''; } }
  const send = (c, m) => { try { if (c && c.open) c.send(m); } catch (e) {} };
  function addKbPlayer() { if (!players.some(p => p.kbp)) players.push({ name: (save.name || '').trim() || 'Tastatur', logo: save.logo, conn: null, input: { s: 0, b: 0, d: 0, i: 0 }, kbp: true }); }
  function onRemote(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      const old = players.find(p => p.conn === c); const nm = String(m.name || 'Gast').trim().slice(0, 14) || 'Gast', lg = Number.isInteger(m.logo) && m.logo >= 0 && m.logo < 13 ? m.logo : 6;
      if (old) { old.name = nm; old.logo = lg; return updateLobby(); }
      if (R && R.S.state !== 'done') return send(c, { t: 'full', msg: 'Das Rennen läuft schon – bitte nach dem Rennen beitreten.' });
      if (players.length >= 4) return send(c, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
      players.splice(players.filter(p => p.conn).length, 0, { name: nm, logo: lg, conn: c, input: { s: 0, b: 0, d: 0, i: 0 } }); send(c, { t: 'wel', slot: players.findIndex(p => p.conn === c) }); updateLobby();
    } else if (m.t === 'in') { const p = players.find(x => x.conn === c); if (p) { p.input.s = Math.max(-1, Math.min(1, +m.s || 0)); p.input.b = m.b ? 1 : 0; p.input.d = m.d ? 1 : 0; p.input.i = m.i ? 1 : 0; } }
  }
  function onGone(c) { const i = players.findIndex(p => p.conn === c); if (i < 0) return; const p = players[i]; p.gone = true; if (R && R.S.state !== 'done') { const k = R.S.karts[R.humans.indexOf(p)]; if (k) k.auto = true; } else players.splice(i, 1); updateLobby(); }
  function updateLobby() {
    $('lobList').innerHTML = players.map((p, i) => `<div class="pc glass" style="--c:${SLOTC[i]}"><img alt="" src="${logoSrc(p.logo)}" style="border-color:${SLOTC[i]}"><b style="flex:1;text-align:left">${esc(p.name)}</b><span class="info">${p.conn ? '📱 gekoppelt' : '⌨️ Tastatur'}</span></div>`).join('') || '<p class="info">Noch niemand verbunden.</p>';
    $('bGo').disabled = !players.length; $('kbToggle').classList.toggle('on', players.some(p => p.kbp));
  }
  $('kbToggle').onclick = () => { if (players.some(p => p.kbp)) players = players.filter(p => !p.kbp); else if (players.length < 4) addKbPlayer(); save.kb = players.some(p => p.kbp); persist(); updateLobby(); };
  $('bLobBack').onclick = () => { $('lobby').hidden = true; $('menu').hidden = false; lobbyOpen = false; };
  $('bGo').onclick = () => { $('lobby').hidden = true; lobbyOpen = false; beginSeries(); };

  // ------------------------------------------------------------------ Serie / Rennen
  function beginSeries() {
    const multi = players.length > 1 || players.some(p => p.conn), tt = save.rmode === 'tt' && players.length === 1;
    const total = tt ? 1 : 8, specs = players.map((p, i) => ({ name: p.name, logo: p.logo, human: true })), used = new Set(players.map(p => p.logo));
    const pool = Array.from({ length: 13 }, (_, i) => i).filter(i => !used.has(i)).sort(() => Math.random() - 0.5);
    for (let b = 0; specs.length < total; b++) { const lg = pool[b % pool.length]; specs.push({ name: NAMES[lg].replace(/ 24$/, ''), logo: lg, human: false, skill: save.skill }); }
    GP = { specs, tt, race: 0, pts: specs.map(() => 0), gp: save.rmode === 'gp' && !tt, order: save.rmode === 'gp' ? [0, 1, 2] : [save.track], multi };
    startRace();
  }
  function startRace() {
    const tIdx = GP.order[GP.race], tr = getTrack(tIdx); if (curTrackIdx !== tIdx) { View.setTrack(tr); curTrackIdx = tIdx; }
    const racers = GP.specs.map((s, i) => ({ name: s.name, logo: s.logo, human: s.human, skill: s.skill, color: View.KCOL[i % 8] }));
    const S = Sim.create({ track: tr, laps: save.laps, racers, items: !GP.tt }), humans = players.slice();
    humans.forEach(p => { p.gone = p.gone && !p.conn ? false : p.gone; });
    R = { S, tr, tIdx, humans, count: 4, lastCount: 99, huds: [], miniAt: 0, pushAt: 0, firstFin: false, ended: false, trackMap: null };
    humans.forEach((p, i) => { if (p.gone) S.karts[i].auto = true; });
    nVp = Math.min(4, humans.length); $('tbar').classList.toggle('mid', nVp > 1); View.resize(innerWidth, innerHeight, nVp); View.setupRace(S, humans.map((_, i) => i)); buildHud(); buildMap();
    document.body.classList.add('racing'); $('menu').hidden = true; $('res').hidden = true; $('hud').hidden = false; $('tbar').hidden = false; AUD.bed('race');
    banner(TR[tIdx].name, GP.gp ? `Grand Prix ${GP.race + 1}/3` : '', 1600); paused = false; push('grid');
  }
  function banner(t, sub, ms, cls) { const b = $('banner'); b.innerHTML = esc(t) + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.className = 'pop'; b.style.color = cls || '#fff'; b.hidden = false; void b.offsetWidth; clearTimeout(banner.k); if (ms) banner.k = setTimeout(() => { b.hidden = true; }, ms); }
  // HUD je Fahrer
  function buildHud() {
    const hud = $('hud'); hud.innerHTML = ''; R.huds = R.humans.map((p, i) => { const d = document.createElement('div'); d.className = 'vp'; d.style.setProperty('--sc', SLOTC[i]); d.innerHTML = `<div class="nm">${esc(p.name)}</div><div class="item"></div><canvas width="160" height="160"></canvas><div class="pos"></div><div class="lap"></div><div class="spd"></div><div class="msg"></div>`; hud.appendChild(d); return { d, item: d.querySelector('.item'), cv: d.querySelector('canvas'), pos: d.querySelector('.pos'), lap: d.querySelector('.lap'), spd: d.querySelector('.spd'), msg: d.querySelector('.msg'), lastItem: null, msgT: 0 }; }); layoutHud();
  }
  function layoutHud() { if (!R) return; const rs = View.rects(Math.max(1, R.huds.length), innerWidth, innerHeight); R.huds.forEach((h, i) => { const r = rs[i]; Object.assign(h.d.style, { left: r[0] + 'px', top: (innerHeight - r[1] - r[3]) + 'px', width: r[2] + 'px', height: r[3] + 'px' }); }); }
  function buildMap() {
    const tr = R.tr; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < tr.N; i++) { x0 = Math.min(x0, tr.P[i * 2]); x1 = Math.max(x1, tr.P[i * 2]); z0 = Math.min(z0, tr.P[i * 2 + 1]); z1 = Math.max(z1, tr.P[i * 2 + 1]); }
    const sc = 140 / Math.max(x1 - x0, z1 - z0), c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'); const X = x => 10 + (x - x0) * sc, Z = z => 150 - (z - z0) * sc;
    g.lineJoin = 'round'; g.lineCap = 'round'; const path = () => { g.beginPath(); for (let i = 0; i <= tr.N; i++) { const j = i % tr.N; i ? g.lineTo(X(tr.P[j * 2]), Z(tr.P[j * 2 + 1])) : g.moveTo(X(tr.P[0]), Z(tr.P[1])); } }; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 12; path(); g.stroke(); g.strokeStyle = '#f2f6ff'; g.lineWidth = 7; path(); g.stroke();
    g.fillStyle = '#111'; g.fillRect(X(tr.P[0]) - 6, Z(tr.P[1]) - 2, 12, 4); R.trackMap = { c, X, Z };
  }
  function drawMini(h, hi) {
    const g = h.cv.getContext('2d'), m = R.trackMap; g.clearRect(0, 0, 160, 160); g.drawImage(m.c, 0, 0); const S = R.S;
    S.karts.forEach((k, i) => { if (i === hi) return; g.fillStyle = k.human ? SLOTC[i % 4] : '#ff9a1f'; g.beginPath(); g.arc(m.X(k.x), m.Z(k.z), 5, 0, 7); g.fill(); }); const k = S.karts[hi]; g.fillStyle = '#fff'; g.beginPath(); g.arc(m.X(k.x), m.Z(k.z), 9, 0, 7); g.fill(); g.fillStyle = SLOTC[hi % 4]; g.beginPath(); g.arc(m.X(k.x), m.Z(k.z), 6.5, 0, 7); g.fill();
  }
  function updateHud(dt) {
    const S = R.S; R.humans.forEach((p, i) => {
      const h = R.huds[i], k = S.karts[i], n = S.karts.length, lap = Math.max(1, Math.min(S.laps, k.lap));
      h.pos.innerHTML = `${k.rank}<small>/${n}</small>`; h.lap.textContent = `🏁 ${k.finished ? S.laps : lap}/${S.laps}`; h.spd.innerHTML = `${Math.round(Math.max(0, k.vf) * 3.6 * 0.9)}<small>km/h</small>`;
      const it = k.itemT > 0 ? '❓' : k.item ? ITEM_ICON[k.item] : ''; if (it !== h.lastItem) { h.item.textContent = it; h.lastItem = it; } h.item.classList.toggle('roll', k.itemT > 0); h.item.style.opacity = it ? 1 : 0.45;
      if (h.msgT > 0) { h.msgT -= dt; if (h.msgT <= 0) h.msg.textContent = ''; }
      if (R.miniAt <= 0) drawMini(h, i);
    }); if (R.miniAt <= 0) R.miniAt = 0.12; else R.miniAt -= dt;
  }
  const hmsg = (ki, t, sec) => { const h = R.huds[ki]; if (h) { h.msg.textContent = t; h.msgT = sec || 1.6; } };
  function push(ph) { R && R.humans.forEach((p, i) => { if (!p.conn) return; const k = R.S.karts[i]; send(p.conn, { t: 'st', ph, pos: k.rank, n: R.S.karts.length, lap: Math.max(1, Math.min(R.S.laps, k.lap)), laps: R.S.laps, item: k.item ? ITEM_ICON[k.item] : '', roll: k.itemT > 0, spd: Math.round(Math.max(0, k.vf) * 3.24), fin: k.finished }); }); }
  const isHuman = ki => ki < R.humans.length;
  function onEvent(e) {
    const S = R.S;
    switch (e.t) {
      case 'go': banner('LOS!', '', 800, '#7cff9a'); AUD.sfx.beep(true); break;
      case 'box': if (isHuman(e.k)) AUD.sfx.box(); break;
      case 'got': if (isHuman(e.k)) { AUD.sfx.got(); hmsg(e.k, ITEM_NAME[e.item], 1.2); } break;
      case 'use': if (isHuman(e.k)) { ({ boost: AUD.sfx.boost, shield: AUD.sfx.shield, rocket: AUD.sfx.rocket, mine: AUD.sfx.click })[e.item](); } break;
      case 'hit': if (isHuman(e.k)) { AUD.sfx.hit(); hmsg(e.k, 'GETROFFEN!', 1.2); const p = R.humans[e.k]; if (p.conn) send(p.conn, { t: 'ev', e: 'hit' }); } break;
      case 'shieldHit': if (isHuman(e.k)) AUD.sfx.shield(); break;
      case 'wall': if (isHuman(e.k)) AUD.sfx.wall(); break;
      case 'bump': if (isHuman(e.k) || isHuman(e.o)) AUD.sfx.bump(); break;
      case 'pad': if (isHuman(e.k)) AUD.sfx.pad(); break;
      case 'miniturbo': if (isHuman(e.k)) { AUD.sfx.mini(e.tier); hmsg(e.k, ['', 'MINI-TURBO', 'SUPER-TURBO', 'ULTRA-TURBO'][e.tier], 1); } break;
      case 'boom': AUD.sfx.boom(); break;
      case 'lap': if (isHuman(e.k)) { AUD.sfx.lap(); const left = S.laps - e.lap; hmsg(e.k, left === 1 ? 'LETZTE RUNDE!' : left > 1 ? 'RUNDE ' + (e.lap + 1) : '', 1.8); if (GP.tt || true) noteLap(e.k, e.time); } break;
      case 'finish': if (isHuman(e.k)) { const k = S.karts[e.k]; if (!R.firstFin) { R.firstFin = true; AUD.sfx.finish(); } hmsg(e.k, k.rank === 1 ? '🏆 SIEG!' : 'ZIEL! Platz ' + k.rank, 4); if (e.k === 0 && !GP.multi) banner(k.rank === 1 ? 'SIEG!' : 'ZIEL!', 'Platz ' + k.rank, 2200, '#ffd24a'); const p = R.humans[e.k]; if (p.conn) send(p.conn, { t: 'ev', e: 'fin', pos: k.rank }); } break;
    }
  }
  function noteLap(ki, time) { if (GP.multi || ki !== 0) return; const id = R.tr.def.id, b = save.best[id] || (save.best[id] = {}); if (!b.lap || time < b.lap) { b.lap = time; persist(); R.newBest = time; } }
  // Eingabe der Menschen
  function readInputs() {
    return R.humans.map(p => {
      if (p.conn) return p.input;
      let s = (kb.r - kb.l) + (tc.r - tc.l); if (TILT.on && !s) s = TILT.v; const i = { s: Math.max(-1, Math.min(1, s)), b: kb.b || tc.b ? 1 : 0, d: kb.d || tc.d ? 1 : 0, i: kb.i || tc.i ? 1 : 0 }; return i;
    });
  }
  function finishRace() {
    if (R.ended) return; R.ended = true; AUD.engine(false); AUD.bed('off'); document.body.classList.remove('racing'); $('hud').hidden = true; $('tbar').hidden = true; $('banner').hidden = true;
    const res = Sim.results(R.S); GP.race++; const finalGp = GP.gp && GP.race >= 3;
    res.forEach(r => { GP.pts[r.k.k] += GP_PTS[r.pos - 1] || 0; });
    const humanBest = R.humans.length === 1 ? res.find(r => r.k.k === 0) : null;
    if (humanBest && humanBest.finished && !GP.multi) { const id = R.tr.def.id, b = save.best[id] || (save.best[id] = {}); const key = 'race' + save.laps; if (!b[key] || humanBest.time < b[key]) { b[key] = humanBest.time; persist(); } }
    const rows = GP.gp ? res.slice().sort((a, b) => GP.pts[b.k.k] - GP.pts[a.k.k] || a.pos - b.pos) : res;
    $('resTitle').textContent = finalGp ? '🏆 Grand-Prix-Wertung' : GP.gp ? `Ergebnis ${GP.race}/3 – ${R.tr.def.name}` : GP.tt ? 'Zeitfahren' : R.tr.def.name;
    $('resSub').textContent = R.newBest && !GP.multi ? '🏆 Neue Bestrunde: ' + fmtT(R.newBest) : GP.gp ? 'Punkte: 15 · 12 · 10 · 8 · 6 · 4 · 2 · 1' : '';
    $('resList').innerHTML = rows.map((r, i) => { const hi = r.k.human, ci = hi ? r.k.k % 4 : -1; return `<div class="brow" style="--sc:${hi ? SLOTC[ci] : '#9fb4d6'}"><span>${GP.gp ? i + 1 : r.pos}. ${esc(r.k.name)}${r.finished ? '' : ' (nicht im Ziel)'} <small style="color:var(--mut)">${r.best ? '⏱ ' + fmtT(r.best) : ''}</small></span><b>${GP.gp ? GP.pts[r.k.k] + ' P.' : fmtT(r.time)}</b></div>`; }).join('');
    $('bNext').textContent = GP.gp && !finalGp ? 'NÄCHSTE STRECKE' : 'NOCH EINMAL'; $('res').hidden = false; push('res');
    R.humans.forEach((p, i) => { if (p.conn) send(p.conn, { t: 'ev', e: 'res', pos: res.find(r => r.k.k === i).pos }); });
    R.finalGp = finalGp;
  }
  $('bNext').onclick = () => { $('res').hidden = true; const wasGp = GP.gp, fin = R.finalGp; if (wasGp && !fin) startRace(); else { players = players.filter(p => !p.gone); if (R.humans.length === 1 && !R.humans[0].conn && !R.humans[0].kbp) { players[0] = R.humans[0]; } beginSeries(); } };
  $('bMenu').onclick = toMenu;
  function toMenu() { R = null; $('res').hidden = true; $('pause').hidden = true; $('hud').hidden = true; $('tbar').hidden = true; $('banner').hidden = true; document.body.classList.remove('racing'); AUD.engine(false); AUD.bed('menu'); $('menu').hidden = false; nVp = 1; View.resize(innerWidth, innerHeight, 1); players.forEach(p => { if (p.conn) send(p.conn, { t: 'st', ph: 'lobby' }); }); players = players.filter(p => p.conn && !p.gone); }
  $('bPause').onclick = () => { if (R && !R.ended) { paused = true; $('pause').hidden = false; } }; $('bResume').onclick = () => { paused = false; $('pause').hidden = true; }; $('bQuit').onclick = toMenu;

  // ------------------------------------------------------------------ Hauptschleife
  let acc = 0, tAll = 0;
  function frame(now) {
    requestAnimationFrame(frame); let dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; tAll += dt;
    if (!R) { View.renderMenu(dt, tAll); return; }
    if (!paused && !R.ended) {
      const ff = window.__ffwd || 1; acc += dt * ff; let n = 0; const S = R.S;
      while (acc >= 1 / 60 && n++ < 5 * ff) { acc -= 1 / 60; Sim.step(S, 1 / 60, readInputs()); S.events.forEach(onEvent); if (S.state === 'done') break; }
      if (S.state === 'grid') { const c = Math.ceil(S.count - 0.2); if (c !== R.lastCount && c >= 1 && c <= 3) { R.lastCount = c; banner(String(c), '', 900, c === 1 ? '#ffd24a' : '#fff'); AUD.sfx.beep(false); } }
      const k0 = S.karts[0]; AUD.engine(S.state !== 'done' && !paused, Math.max(0, k0.vf) / 36, k0.boostT > 0);
      updateHud(dt); R.pushAt -= dt; if (R.pushAt <= 0) { R.pushAt = 0.15; push(S.state === 'grid' ? 'grid' : 'race'); }
      if (S.state === 'done') finishRace();
    }
    View.renderRace(R.S, paused ? 0 : dt, tAll, nVp);
  }
  // Tastatur
  const KEYS = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowDown: 'b', s: 'b', S: 'b', Shift: 'd', z: 'd', Z: 'd', ' ': 'i', Enter: 'i', x: 'i', X: 'i' };
  addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; const k = KEYS[e.key]; if (k) { kb[k] = 1; if (R) e.preventDefault(); } if (e.key === 'm' || e.key === 'M') togSnd(); if (e.key === 'Escape' && R && !R.ended) $('bPause').click(); });
  addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) kb[k] = 0; });
  addEventListener('blur', () => { Object.keys(kb).forEach(k => kb[k] = 0); });
  window.__ak = { get R() { return R; }, kb, tc, save, beginSeries, get players() { return players; }, set players(v) { players = v; } };
}
