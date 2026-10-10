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
const SLOTC = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'], SKILLS = ['Anfänger', 'Normal', 'Profi'];
const ITEM_ICON = { boost: '🚀', boost3: '🚀', banana: '🍌', banana3: '🍌', rock: '🪨', rock3: '🪨', mine: '📢', rocket: '🎯', shield: '🛡️', flash: '⚡', fog: '🌫️' };
const ITEM_NAME = { boost: 'Bass-Boost', boost3: 'Turbo-Trio', banana: 'Bananenschale', banana3: 'Bananen-Trio', rock: 'Felsbrocken', rock3: 'Stein-Trio', mine: 'Störsignal', rocket: 'Jingle-Rakete', shield: 'Frequenz-Schild', flash: 'Funk-Blitz', fog: 'Nebelbombe' };
const itemHtml = (it, n) => it ? ITEM_ICON[it] + (it.endsWith('3') && n > 1 ? '<small class="cnt">×' + n + '</small>' : '') : '';
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
const clampN = (v, a, b) => v < a ? a : v > b ? b : v;
// Analoge Touch-Steuerung: links Daumen ziehen = lenken (Ring folgt dem Finger), rechts Drift / Item / Bremse
function buildTouch(root, st) {
  root.innerHTML = '<div class="steer"><span class="hint">◀ ZIEHEN ZUM LENKEN ▶</span><div class="ring"></div><div class="knob"></div></div><div class="tbtn tb-g" data-k="g">GAS</div><div class="tbtn tb-b" data-k="b">BREMSE</div><div class="tbtn tb-i" data-k="i">ITEM</div><div class="tbtn tb-d" data-k="d">DRIFT</div>';
  const ring = root.querySelector('.ring'), knob = root.querySelector('.knob'), hint = root.querySelector('.hint'), btns = new Map(); let sid = null, ox = 0, oy = 0;
  const R = () => Math.max(50, Math.min(100, Math.min(innerWidth, innerHeight) * 0.16)), upd = () => { st.g = st.b = st.d = st.i = 0; btns.forEach(k => { st[k] = 1; }); root.querySelectorAll('.tbtn').forEach(el => el.classList.toggle('on', !!st[el.dataset.k])); };
  root.addEventListener('pointerdown', e => {
    const bt = e.target.closest('[data-k]'); try { root.setPointerCapture(e.pointerId); } catch (x) {}
    if (bt) { btns.set(e.pointerId, bt.dataset.k); upd(); }
    else if (sid === null && e.clientX < innerWidth * 0.6) { sid = e.pointerId; ox = e.clientX; oy = e.clientY; ring.style.display = knob.style.display = 'block'; hint.style.display = 'none'; ring.style.left = knob.style.left = ox + 'px'; ring.style.top = knob.style.top = oy + 'px'; st.s = 0; }
    e.preventDefault();
  });
  root.addEventListener('pointermove', e => { if (e.pointerId === sid) { const dx = e.clientX - ox, r = R(); let s = clampN(dx / r, -1, 1); if (Math.abs(s) < 0.05) s = 0; st.s = s; knob.style.left = (ox + clampN(dx, -r, r)) + 'px'; knob.style.top = oy + 'px'; } });
  const end = e => { if (e.pointerId === sid) { sid = null; st.s = 0; ring.style.display = knob.style.display = 'none'; hint.style.display = ''; } if (btns.delete(e.pointerId)) upd(); };
  ['pointerup', 'pointercancel'].forEach(ev => root.addEventListener(ev, end)); root.addEventListener('contextmenu', e => e.preventDefault());
}
// Gamepad (Standard-Belegung): Stick/Steuerkreuz lenken, A/RT Gas, RB/X driften, Y/LB Item, B/LT bremsen
const Pads = {
  list() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean); } catch (e) { return []; } },
  read(pad) {
    if (!pad) return { s: 0, g: 0, b: 0, d: 0, i: 0 }; const a = pad.axes || [], bt = pad.buttons || [], pr = i => bt[i] && (bt[i].pressed || bt[i].value > 0.5); let s = a[0] || 0;
    s = Math.abs(s) < 0.14 ? 0 : Math.sign(s) * (Math.abs(s) - 0.14) / 0.86; if (pr(14)) s = -1; else if (pr(15)) s = 1;
    return { s, g: pr(0) || pr(7) || pr(12) ? 1 : 0, b: pr(6) || pr(1) || pr(13) ? 1 : 0, d: pr(5) || pr(2) ? 1 : 0, i: pr(4) || pr(3) ? 1 : 0 };
  },
  any() { const m = { s: 0, g: 0, b: 0, d: 0, i: 0 }; Pads.list().forEach(p => { const r = Pads.read(p); if (Math.abs(r.s) > Math.abs(m.s)) m.s = r.s; m.g |= r.g; m.b |= r.b; m.d |= r.d; m.i |= r.i; }); return m; }
};

if (JOIN) { document.body.classList.add('ctrl'); loadScript('controller.js').then(() => window.startController && window.startController()).catch(e => { $('err').hidden = false; $('errTxt').textContent = e.message; }); }
else initHost();

function initHost() {
  if (window.self !== window.top) $('backLink').hidden = true;
  const coarse = matchMedia('(pointer:coarse)').matches; if (coarse) document.body.classList.add('touch');
  let save = { rmode: 'race', track: 0, laps: 3, skill: 1, name: '', logo: 6, char: 1, kart: 0, cup: 0, assist: null, best: {}, kb: true };
  try { const s = JSON.parse(localStorage.getItem('akSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('akSave', JSON.stringify(save)); } catch (e) {} };
  const TR = Track.DEFS; let trCache = {}; const getTrack = i => trCache[i] || (trCache[i] = Track.build(TR[i]));
  let logos = [], ready = false, R = null, lobbyOpen = false, peer = null, room = '', players = [], loopOn = false, lastT = 0, paused = false, curTrackIdx = -1, GP = null, nVp = 1;
  const kb = { l: 0, r: 0, g: 0, b: 0, d: 0, i: 0 }, tc = { s: 0, g: 0, b: 0, d: 0, i: 0 };
  const assistLvl = () => save.assist == null ? (coarse ? 1 : 0) : save.assist, ASSIST = [0, 0.4, 0.75];

  // ------------------------------------------------------------------ Logos / Marke
  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  (function brand() { const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`))); Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; }); })();

  // ------------------------------------------------------------------ Menü
  function renderMenu() {
    $('rmode').innerHTML = [['race', 'Einzelrennen'], ['gp', 'Cup', '3 Strecken'], ['tt', 'Zeitfahren', 'allein, ohne Items']].map(m => `<button class="chip ${save.rmode === m[0] ? 'on' : ''}" data-m="${m[0]}">${m[1]}${m[2] ? `<small>${m[2]}</small>` : ''}</button>`).join('');
    $('rmode').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { save.rmode = b.dataset.m; persist(); renderMenu(); });
    $('tracks').previousElementSibling.textContent = save.rmode === 'gp' ? 'CUP' : 'STRECKE';
    $('tracks').innerHTML = save.rmode === 'gp' ? Track.CUPS.map((c, i) => `<button class="chip ${save.cup === i ? 'on' : ''}" data-cup="${i}">${esc(c.name)}<small>${c.tracks.map(t => esc(TR[t].name)).join(' · ')}</small></button>`).join('') : TR.map((t, i) => `<button class="chip ${save.track === i ? 'on' : ''}" data-t="${i}">${esc(t.name)}</button>`).join('');
    $('tracks').querySelectorAll('[data-cup]').forEach(b => b.onclick = () => { save.cup = +b.dataset.cup; persist(); renderMenu(); });
    $('tracks').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { save.track = +b.dataset.t; persist(); renderMenu(); if (ready) { View.setTrack(getTrack(save.track)); curTrackIdx = save.track; } });
    $('laps').innerHTML = [2, 3, 5].map(n => `<button class="chip ${save.laps === n ? 'on' : ''}" data-l="${n}">${n}</button>`).join(''); $('laps').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { save.laps = +b.dataset.l; persist(); renderMenu(); });
    $('skill').innerHTML = SKILLS.map((s, i) => `<button class="chip ${save.skill === i ? 'on' : ''}" data-k="${i}">${s}</button>`).join(''); $('skill').querySelectorAll('[data-k]').forEach(b => b.onclick = () => { save.skill = +b.dataset.k; persist(); renderMenu(); });
    $('skill').hidden = $('skill').previousElementSibling.hidden = save.rmode === 'tt';
    $('pcard').innerHTML = `<img alt="" src="${logoSrc(save.logo)}" title="${esc(NAMES[save.logo] || '')}"><input maxlength="14" value="${esc(save.name)}" placeholder="Dein Name"><span class="info">Logo antippen</span>`;
    $('pcard').querySelector('img').onclick = e => { save.logo = nextLogo(save.logo); e.target.src = logoSrc(save.logo); persist(); };
    $('pcard').querySelector('input').oninput = e => { save.name = e.target.value; persist(); };
    $('chars').innerHTML = CHARS.map((c, i) => `<button class="${save.char === i ? 'on' : ''}" data-ch="${i}"><b>${c.emoji}</b>${c.name}<small>${c.kind}</small></button>`).join('');
    $('chars').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { save.char = +b.dataset.ch; persist(); renderMenu(); });
    const rng = [['mv', 0.9, 1.1], ['ma', 0.85, 1.25], ['mt', 0.8, 1.2], ['mw', 0.75, 1.45]], lbl = ['Tempo', 'Beschl.', 'Lenken', 'Gewicht'];
    $('kcards').innerHTML = KARTS.map((k, i) => `<button class="${save.kart === i ? 'on' : ''}" data-kt="${i}"><b>${k.emoji}</b>${k.name}${rng.map((r, j) => `<div class="bar"><i style="width:${Math.round(Math.max(8, Math.min(100, (k[r[0]] - r[1]) / (r[2] - r[1]) * 100)))}%"></i></div>`).join('')}<div class="st">${esc(k.desc)}</div></button>`).join('');
    $('kcards').querySelectorAll('[data-kt]').forEach(b => b.onclick = () => { save.kart = +b.dataset.kt; persist(); renderMenu(); });
    $('assist').innerHTML = ['Aus', 'Leicht', 'Stark'].map((s, i) => `<button class="chip ${assistLvl() === i ? 'on' : ''}" data-a="${i}">${s}</button>`).join(''); $('assist').querySelectorAll('[data-a]').forEach(b => b.onclick = () => { save.assist = +b.dataset.a; persist(); renderMenu(); });
    const pads = Pads.list(); $('padInfo').hidden = !pads.length; if (pads.length) $('padInfo').textContent = '🎮 Gamepad erkannt: ' + pads.map(p => p.id.slice(0, 28)).join(' · ');
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
  buildTouch($('tcSolo'), tc); if (coarse) { $('tiltRow').hidden = false; $('tiltBtn').onclick = async () => { if (TILT.on) TILT.disable(); else await TILT.enable(); $('tiltBtn').classList.toggle('on', TILT.on); }; $('tiltInv').onclick = () => { TILT.inv = !TILT.inv; $('tiltInv').classList.toggle('on', TILT.inv); }; }
  $('bSolo').onclick = () => { players = [{ name: (save.name || '').trim() || 'Fahrer', logo: save.logo, char: save.char, kart: save.kart, conn: null, input: { s: 0, g: 0, b: 0, d: 0, i: 0 }, local: true }]; beginSeries(); };
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
  function addKbPlayer() { if (!players.some(p => p.kbp)) players.push({ name: (save.name || '').trim() || 'Tastatur', logo: save.logo, char: save.char, kart: save.kart, conn: null, input: { s: 0, g: 0, b: 0, d: 0, i: 0 }, kbp: true }); }
  function onRemote(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      const old = players.find(p => p.conn === c); const nm = String(m.name || 'Gast').trim().slice(0, 14) || 'Gast', lg = Number.isInteger(m.logo) && m.logo >= 0 && m.logo < 13 ? m.logo : 6, ch = Number.isInteger(m.ch) && m.ch >= 0 && m.ch < CHARS.length ? m.ch : 1, kt = Number.isInteger(m.kt) && m.kt >= 0 && m.kt < KARTS.length ? m.kt : 0;
      if (old) { old.name = nm; old.logo = lg; old.char = ch; old.kart = kt; return updateLobby(); }
      if (R && R.S.state !== 'done') return send(c, { t: 'full', msg: 'Das Rennen läuft schon – bitte nach dem Rennen beitreten.' });
      if (players.length >= 4) return send(c, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
      players.splice(players.filter(p => p.conn).length, 0, { name: nm, logo: lg, char: ch, kart: kt, conn: c, input: { s: 0, g: 0, b: 0, d: 0, i: 0 } }); send(c, { t: 'wel', slot: players.findIndex(p => p.conn === c) }); updateLobby();
    } else if (m.t === 'in') { const p = players.find(x => x.conn === c); if (p) { p.input.s = Math.max(-1, Math.min(1, +m.s || 0)); p.input.g = m.g ? 1 : 0; p.input.b = m.b ? 1 : 0; p.input.d = m.d ? 1 : 0; p.input.i = m.i ? 1 : 0; } }
  }
  function onGone(c) { const i = players.findIndex(p => p.conn === c); if (i < 0) return; const p = players[i]; p.gone = true; if (R && R.S.state !== 'done') { const k = R.S.karts[R.humans.indexOf(p)]; if (k) k.auto = true; } else players.splice(i, 1); updateLobby(); }
  function updateLobby() {
    $('lobList').innerHTML = players.map((p, i) => `<div class="pc glass" style="--c:${SLOTC[i]}"><img alt="" src="${logoSrc(p.logo)}" style="border-color:${SLOTC[i]}"><b style="flex:1;text-align:left">${CHARS[p.char % CHARS.length].emoji}${KARTS[(p.kart || 0) % KARTS.length].emoji} ${esc(p.name)}</b><span class="info">${p.conn ? '📱 gekoppelt' : p.pad != null ? '🎮 Gamepad' : '⌨️ Tastatur'}</span></div>`).join('') || '<p class="info">Noch niemand verbunden.</p>';
    $('bGo').disabled = !players.length; $('kbToggle').classList.toggle('on', players.some(p => p.kbp));
  }
  $('padAdd').onclick = () => { const used = new Set(players.filter(p => p.pad != null).map(p => p.pad)), pad = Pads.list().find(p => !used.has(p.index)); if (!pad) { $('padAdd').textContent = '🎮 Kein Gamepad – Taste am Gamepad drücken'; setTimeout(() => { $('padAdd').textContent = '🎮 Gamepad-Spieler hinzufügen'; }, 2500); return; } if (players.length < 4) players.push({ name: 'Gamepad ' + (used.size + 1), logo: save.logo, char: save.char, kart: save.kart, conn: null, input: { s: 0, g: 0, b: 0, d: 0, i: 0 }, pad: pad.index }); updateLobby(); };
  addEventListener('gamepadconnected', () => { renderMenu(); });
  $('kbToggle').onclick = () => { if (players.some(p => p.kbp)) players = players.filter(p => !p.kbp); else if (players.length < 4) addKbPlayer(); save.kb = players.some(p => p.kbp); persist(); updateLobby(); };
  $('bLobBack').onclick = () => { $('lobby').hidden = true; $('menu').hidden = false; lobbyOpen = false; };
  $('bGo').onclick = () => { $('lobby').hidden = true; lobbyOpen = false; beginSeries(); };

  // ------------------------------------------------------------------ Serie / Rennen
  function beginSeries() {
    const multi = players.length > 1 || players.some(p => p.conn), tt = save.rmode === 'tt' && players.length === 1;
    const total = tt ? 1 : 8, specs = players.map((p, i) => ({ name: p.name, logo: p.logo, char: p.char == null ? save.char : p.char, kart: p.kart == null ? save.kart : p.kart, human: true, assist: p.conn ? Math.max(1, assistLvl()) : assistLvl() })), used = new Set(players.map(p => p.logo)), usedC = new Set(specs.map(s => s.char)), cpool = CHARS.map((_, i) => i).filter(i => !usedC.has(i)).sort(() => Math.random() - 0.5);
    const pool = Array.from({ length: 13 }, (_, i) => i).filter(i => !used.has(i)).sort(() => Math.random() - 0.5);
    for (let b = 0; specs.length < total; b++) { const lg = pool[b % pool.length]; const ch = cpool.length ? cpool.pop() : Math.floor(Math.random() * CHARS.length); specs.push({ name: CHARS[ch].name, logo: lg, char: ch, kart: Math.floor(Math.random() * KARTS.length), human: false, skill: save.skill }); }
    GP = { specs, tt, race: 0, pts: specs.map(() => 0), gp: save.rmode === 'gp' && !tt, order: save.rmode === 'gp' && !tt ? Track.CUPS[save.cup].tracks.slice() : [save.track], multi };
    startRace();
  }
  function startRace() {
    const tIdx = GP.order[GP.race], tr = getTrack(tIdx); if (curTrackIdx !== tIdx) { View.setTrack(tr); curTrackIdx = tIdx; }
    const racers = GP.specs.map((s, i) => ({ name: s.name, logo: s.logo, char: s.char, kart: s.kart, assist: s.assist, human: s.human, skill: s.skill, color: View.KCOL[i % 8] }));
    const S = Sim.create({ track: tr, laps: save.laps, racers, items: !GP.tt, shuffle: true }), humans = players.slice();
    humans.forEach(p => { p.gone = p.gone && !p.conn ? false : p.gone; });
    R = { S, tr, tIdx, humans, count: 4, lastCount: 99, huds: [], miniAt: 0, pushAt: 0, firstFin: false, ended: false, trackMap: null };
    humans.forEach((p, i) => { if (p.gone) S.karts[i].auto = true; });
    nVp = Math.min(4, humans.length); $('tbar').classList.toggle('mid', nVp > 1); View.resize(innerWidth, innerHeight, nVp); View.setupRace(S, humans.map((_, i) => i)); buildHud(); buildMap();
    document.body.classList.add('racing'); $('menu').hidden = true; $('res').hidden = true; $('hud').hidden = false; $('tbar').hidden = false; AUD.bed('race');
    banner(TR[tIdx].name, GP.gp ? `${Track.CUPS[save.cup].name} ${GP.race + 1}/${GP.order.length}` : '', 1600); paused = false; push('grid');
  }
  function banner(t, sub, ms, cls) { const b = $('banner'); b.innerHTML = esc(t) + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.className = 'pop'; b.style.color = cls || '#fff'; b.hidden = false; void b.offsetWidth; clearTimeout(banner.k); if (ms) banner.k = setTimeout(() => { b.hidden = true; }, ms); }
  // HUD je Fahrer
  function buildHud() {
    const hud = $('hud'); hud.innerHTML = ''; R.huds = R.humans.map((p, i) => { const d = document.createElement('div'); d.className = 'vp'; d.style.setProperty('--sc', SLOTC[i]); d.innerHTML = `<div class="nm">${esc(p.name)}</div><div class="item"></div><div class="fog"></div><canvas width="160" height="160"></canvas><div class="pos"></div><div class="lap"></div><div class="spd"></div><div class="msg"></div>`; hud.appendChild(d); return { d, item: d.querySelector('.item'), fog: d.querySelector('.fog'), fogT: 0, cv: d.querySelector('canvas'), pos: d.querySelector('.pos'), lap: d.querySelector('.lap'), spd: d.querySelector('.spd'), msg: d.querySelector('.msg'), lastItem: null, msgT: 0 }; }); layoutHud();
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
      const it = k.itemT > 0 ? '❓' : itemHtml(k.item, k.itemN); if (it !== h.lastItem) { h.item.innerHTML = it; h.lastItem = it; } h.item.classList.toggle('roll', k.itemT > 0); h.item.style.opacity = it ? 1 : 0.45;
      if (h.msgT > 0) { h.msgT -= dt; if (h.msgT <= 0) h.msg.textContent = ''; } if (h.fogT > 0) { h.fogT -= dt; if (h.fogT <= 0) h.fog.classList.remove('on'); }
      if (R.miniAt <= 0) drawMini(h, i);
    }); if (R.miniAt <= 0) R.miniAt = 0.12; else R.miniAt -= dt;
  }
  const hmsg = (ki, t, sec) => { const h = R.huds[ki]; if (h) { h.msg.textContent = t; h.msgT = sec || 1.6; } };
  function push(ph) { R && R.humans.forEach((p, i) => { if (!p.conn) return; const k = R.S.karts[i]; send(p.conn, { t: 'st', ph, pos: k.rank, n: R.S.karts.length, lap: Math.max(1, Math.min(R.S.laps, k.lap)), laps: R.S.laps, item: k.item ? ITEM_ICON[k.item] + (k.itemN > 1 ? '×' + k.itemN : '') : '', roll: k.itemT > 0, spd: Math.round(Math.max(0, k.vf) * 3.24), fin: k.finished }); }); }
  const isHuman = ki => ki < R.humans.length;
  function onEvent(e) {
    const S = R.S;
    switch (e.t) {
      case 'go': banner('LOS!', '', 800, '#7cff9a'); AUD.sfx.beep(true); break;
      case 'box': if (isHuman(e.k)) AUD.sfx.box(); break;
      case 'got': if (isHuman(e.k)) { AUD.sfx.got(); hmsg(e.k, ITEM_NAME[e.item], 1.2); } break;
      case 'use': if (isHuman(e.k)) { ({ boost: AUD.sfx.boost, shield: AUD.sfx.shield, rocket: AUD.sfx.rocket, mine: AUD.sfx.drop, banana: AUD.sfx.drop, rock: AUD.sfx.throw, flash: () => {}, fog: AUD.sfx.fogs })[e.item](); } break;
      case 'hit': if (isHuman(e.k)) { if (e.kind === 'banana') AUD.sfx.slip(); else if (e.kind !== 'flash') AUD.sfx.hit(); hmsg(e.k, { banana: 'AUSGERUTSCHT!', rock: 'FELSBROCKEN!', flash: 'FUNK-BLITZ!', rocket: 'GETROFFEN!', mine: 'STÖRSIGNAL!' }[e.kind] || 'GETROFFEN!', 1.3); const p = R.humans[e.k]; if (p.conn) send(p.conn, { t: 'ev', e: 'hit' }); } break;
      case 'flash': AUD.sfx.thunder(); { const f = $('fxFlash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); } if (isHuman(e.k)) hmsg(e.k, 'FUNK-BLITZ!', 1.2); break;
      case 'fog': AUD.sfx.fogs(); (e.ids || []).forEach(id => { if (isHuman(id)) { const h = R.huds[id]; h.fog.classList.add('on'); h.fogT = 3.8; hmsg(id, 'NEBELBOMBE!', 1.4); } }); break;
      case 'splat': AUD.sfx.splat(); break;
      case 'smash': AUD.sfx.smash(); break;
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
    const pads = Pads.list();
    return R.humans.map(p => {
      if (p.conn) return p.input;
      if (p.pad != null) return Pads.read(pads.find(x => x.index === p.pad));
      const pa = Pads.any(); let s = (kb.r - kb.l) + tc.s + (p.local ? pa.s : 0); if (TILT.on && !s) s = TILT.v;
      return { s: clampN(s, -1, 1), g: kb.g || tc.g || (p.local && pa.g) ? 1 : 0, b: kb.b || tc.b || (p.local && pa.b) ? 1 : 0, d: kb.d || tc.d || (p.local && pa.d) ? 1 : 0, i: kb.i || tc.i || (p.local && pa.i) ? 1 : 0 };
    });
  }
  function finishRace() {
    if (R.ended) return; R.ended = true; AUD.engine(false); AUD.bed('off'); document.body.classList.remove('racing'); $('hud').hidden = true; $('tbar').hidden = true; $('banner').hidden = true;
    const res = Sim.results(R.S); GP.race++; const finalGp = GP.gp && GP.race >= GP.order.length;
    res.forEach(r => { GP.pts[r.k.k] += GP_PTS[r.pos - 1] || 0; });
    const humanBest = R.humans.length === 1 ? res.find(r => r.k.k === 0) : null;
    if (humanBest && humanBest.finished && !GP.multi) { const id = R.tr.def.id, b = save.best[id] || (save.best[id] = {}); const key = 'race' + save.laps; if (!b[key] || humanBest.time < b[key]) { b[key] = humanBest.time; persist(); } }
    const rows = GP.gp ? res.slice().sort((a, b) => GP.pts[b.k.k] - GP.pts[a.k.k] || a.pos - b.pos) : res;
    $('resTitle').textContent = finalGp ? '🏆 Cup-Wertung' : GP.gp ? `Ergebnis ${GP.race}/${GP.order.length} – ${R.tr.def.name}` : GP.tt ? 'Zeitfahren' : R.tr.def.name;
    $('resSub').textContent = R.newBest && !GP.multi ? '🏆 Neue Bestrunde: ' + fmtT(R.newBest) : GP.gp ? 'Punkte: 15 · 12 · 10 · 8 · 6 · 4 · 2 · 1' : '';
    $('resList').innerHTML = rows.map((r, i) => { const hi = r.k.human, ci = hi ? r.k.k % 4 : -1; return `<div class="brow" style="--sc:${hi ? SLOTC[ci] : '#9fb4d6'}"><span>${GP.gp ? i + 1 : r.pos}. ${CHARS[r.k.char % CHARS.length].emoji} ${esc(r.k.name)}${r.finished ? '' : ' (nicht im Ziel)'} <small style="color:var(--mut)">${r.best ? '⏱ ' + fmtT(r.best) : ''}</small></span><b>${GP.gp ? GP.pts[r.k.k] + ' P.' : fmtT(r.time)}</b></div>`; }).join('');
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
  const KEYS = { ArrowUp: 'g', w: 'g', W: 'g', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowDown: 'b', s: 'b', S: 'b', Shift: 'd', z: 'd', Z: 'd', ' ': 'i', Enter: 'i', x: 'i', X: 'i' };
  addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; const k = KEYS[e.key]; if (k) { kb[k] = 1; if (R) e.preventDefault(); } if (e.key === 'm' || e.key === 'M') togSnd(); if (e.key === 'Escape' && R && !R.ended) $('bPause').click(); });
  addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) kb[k] = 0; });
  addEventListener('blur', () => { Object.keys(kb).forEach(k => kb[k] = 0); });
  window.__ak = { get R() { return R; }, kb, tc, save, beginSeries, get players() { return players; }, set players(v) { players = v; } };
}
