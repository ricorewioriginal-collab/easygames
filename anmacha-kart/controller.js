/* Handy-Controller: koppelt per Code/QR und lenkt das Kart auf dem Host-Bildschirm. Gas per Knopf. */
window.startController = function () {
  const root = $('ctl'); let peer = null, conn = null, ph = 'lobby', tries = 0, sendT = 0, last = '', lastAt = 0, wake = null, joined = false, kicked = false, joinT = 0, reT = 0;
  let itemSeq = 0, prevItem = 0;
  let name = '', logo = 6, ch = 1, kt = 0; try { name = localStorage.getItem('akName') || ''; logo = +localStorage.getItem('akLogo'); if (!(logo >= 0 && logo < 13)) logo = 6; ch = +localStorage.getItem('akChar'); if (!(ch >= 0 && ch < CHARS.length)) ch = 1; kt = +localStorage.getItem('akKart'); if (!(kt >= 0 && kt < KARTS.length)) kt = 0; } catch (e) {}
  // Feste Geräte-Kennung: nach Verbindungsabbruch (Bildschirmsperre, WLAN-Wechsel) bekommt das Handy sein Kart zurück
  let viewOn = false; try { viewOn = localStorage.getItem('akView') === '1'; } catch (e) {}
  let cid = ''; try { cid = localStorage.getItem('akCid') || ''; } catch (e) {} if (!/^[a-z0-9]{8,16}$/.test(cid)) { cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem('akCid', cid); } catch (e) {} }
  const logoSrc = i => `logos/${String(i + 1).padStart(2, '0')}.png`, put = html => { root.classList.remove('play', 'view'); root.innerHTML = html; }, st = { s: 0, g: 0, b: 0, d: 0, i: 0 };
  const tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  const full = () => { const d = document.documentElement; if (document.fullscreenElement || document.webkitFullscreenElement) return; try { const r = (d.requestFullscreen || d.webkitRequestFullscreen).call(d, { navigationUI: 'hide' }); if (r && r.then) r.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }, () => {}); } catch (e) {} };
  function screenJoin(msg) {
    stopPlay(); joined = false; clearTimeout(reT); clearInterval(joinT);
    put(`<h2>AnMaCha Kart Rush<br><small style="font-size:14px;color:var(--y)">Handy-Lenkrad · Raum ${esc(JOIN)}</small></h2>
      <div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Sender-Logo für das Kart.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off">
      <div class="chars" id="cch" style="align-self:center">${CHARS.map((c, i) => `<button class="${ch === i ? 'on' : ''}" data-ch="${i}"><b>${c.emoji}</b>${c.name}</button>`).join('')}</div>
      <div class="kcards" id="ckt" style="align-self:center">${KARTS.map((k, i) => `<button class="${kt === i ? 'on' : ''}" data-kt="${i}"><b>${k.emoji}</b>${k.name}<div class="st">${esc(k.desc)}</div></button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="chip" id="cl" style="display:flex;gap:10px;align-items:center"><img id="cli" src="${logoSrc(logo)}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover"><span id="cln">${esc(NAMES[logo])}</span></button></div>
      <div class="row" style="justify-content:center"><button class="chip ${TILT.on ? 'on' : ''}" id="ct">📱 Kippen zum Lenken</button><button class="chip ${TILT.inv ? 'on' : ''}" id="ci">⇄ Richtung tauschen</button></div>
      <div class="row" style="justify-content:center"><button class="chip ${viewOn ? 'on' : ''}" id="cv1">🎬 Rennbild auf diesem Handy</button></div>
      <button class="big" id="cj">BEITRETEN</button>
      <div class="info">Tipp: Handy quer halten. Rechts unten ist GAS – ohne Gas rollst du nur.</div>`);
    $('cch').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { ch = +b.dataset.ch; $('cch').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.ch === ch)); });
    $('ckt').querySelectorAll('[data-kt]').forEach(b => b.onclick = () => { kt = +b.dataset.kt; $('ckt').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.kt === kt)); });
    $('cl').onclick = () => { logo = (logo + 1) % 13; $('cli').src = logoSrc(logo); $('cln').textContent = NAMES[logo]; };
    $('ct').onclick = async () => { if (TILT.on) TILT.disable(); else await TILT.enable(); $('ct').classList.toggle('on', TILT.on); };
    $('ci').onclick = () => { TILT.inv = !TILT.inv; $('ci').classList.toggle('on', TILT.inv); };
    $('cv1').onclick = () => setView(!viewOn);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('akName', name); localStorage.setItem('akLogo', logo); localStorage.setItem('akChar', ch); localStorage.setItem('akKart', kt); } catch (e) {} full(); connect(); };
  }
  async function connect(re) {
    kicked = false; clearTimeout(reT); clearInterval(joinT); if (!re) tries = 0;
    put(re ? '<h2>Verbindung weg …</h2><div class="info">Verbinde neu – dein Kart wartet auf dich.</div>' : '<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    // Alte Verbindung erst abhängen, damit ihr Schließen keinen weiteren Neuversuch auslöst
    const op = peer; peer = null; conn = null; try { if (op) op.destroy(); } catch (e) {}
    const pe = peer = new Peer(undefined, peerCfg());
    // Fehler des Vermittlungs-Servers stören eine laufende Verbindung nicht – dann einfach weiterfahren
    pe.on('error', e => { if (pe !== peer || (conn && conn.open)) return; if (!joined) screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Ist die Lobby offen?' : 'Verbindungsfehler (' + e.type + ').'); else retry(); });
    pe.on('open', () => {
      const c = conn = pe.connect('amk-' + JOIN, { reliable: false, serialization: 'json' , reliable: true }); const to = setTimeout(() => { if (c === conn && !c.open) { if (joined) retry(); else screenJoin('Keine Antwort vom Spiel. Code richtig?'); } }, 9000);
      // Beitritt wiederholen, bis das Spiel antwortet (der Kanal ist bewusst unzuverlässig = schnell)
      c.on('open', () => { clearTimeout(to); tries = 0; const j = () => tx({ t: 'join', name, logo, ch, kt, cid, view: viewOn }); j(); clearInterval(joinT); joinT = setInterval(j, 1000); });
      c.on('data', onData);
      c.on('close', () => { if (c !== conn || kicked) return; if (joined) retry(); else screenJoin('Verbindung getrennt.'); });
    });
  }
  // Automatisch neu verbinden; erst nach mehreren Fehlversuchen zurück zum Beitreten-Bildschirm
  function retry() { stopPlay(); clearInterval(joinT); clearTimeout(reT); if (tries++ >= 5) return screenJoin('Verbindung getrennt – tippe auf „Beitreten“, um zurückzukehren.'); put('<h2>Verbindung weg …</h2><div class="info">Verbinde neu – dein Kart wartet auf dich.</div>'); reT = setTimeout(() => connect(true), 600 + tries * 700); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && joined && !(conn && conn.open)) { tries = 0; connect(true); } });
  // Warte-Bildschirm mit Start-Knopf: so lässt sich das nächste Rennen vom Sofa aus starten (Fernseher braucht keine Maus)
  function waitScreen(title, msg, go) { stopPlay(); put(`<h2>${title}</h2><div class="st">${esc(msg || '')}</div>${go ? `<div class="row" style="justify-content:center"><button class="chip ${viewOn ? 'on' : ''}" id="cv2">🎬 Rennbild auf diesem Handy</button></div><div id="ccfg"></div><button class="big" id="cgo">${go}</button><div class="info" style="text-align:center">Startet für alle – erst drücken, wenn alle dabei sind.</div>` : ''}`); if (go) { $('cgo').onclick = () => tx({ t: 'go' }); $('cv2').onclick = () => { setView(!viewOn); tx({ t: 'join', name, logo, ch, kt, cid, view: viewOn }); }; showCfg(); } }
  function setView(on) { viewOn = on; try { localStorage.setItem('akView', on ? '1' : '0'); } catch (e) {} ['cv1', 'cv2'].forEach(id => { const b = $(id); if (b) b.classList.toggle('on', on); }); }

  // ---------------------------------------------------------------- Eigenes Rennbild
  // Der Fernseher/das Hauptgerät rechnet das Rennen und schickt den Zustand; das Handy zeichnet nur die eigene Verfolger-Kamera
  // und gleitet zwischen zwei Zuständen (ruckelfrei trotz ~20 Updates pro Sekunde). Grafik wird erst bei Bedarf geladen.
  let M = null, vLoad = null, vRaf = 0, vLast = 0, vT = 0, recvAt = 0, ivl = 50, needAt = 0, trC = {};
  const loadView = () => vLoad || (vLoad = (window.THREE ? Promise.resolve() : loadScript(CDN.three)).then(() => window.View ? 0 : loadScript('view.js'))
    .then(() => Promise.all(Array.from({ length: 13 }, (_, i) => new Promise(r => { const im = new Image(); im.onload = () => r({ idx: i, im }); im.onerror = () => r(null); im.src = logoSrc(i); }))))
    .then(lg => { View.init($('cv'), lg.filter(Boolean)); addEventListener('resize', () => { if (M) View.resize(innerWidth, innerHeight, 1); }); }));
  async function onRace(m) {
    if (!viewOn) return;
    try { await loadView(); } catch (e) { return; }
    if (M && M.rid === m.r) return;
    const tr = trC[m.tr] || (trC[m.tr] = Track.build(Track.DEFS[m.tr])); View.setTrack(tr); View.resize(innerWidth, innerHeight, 1);
    M = { rid: m.r, me: m.me, karts: m.karts.map((a, i) => ({ k: i, logo: a[0], char: a[1], kart: a[2], x: 0, z: 0, th: 0, px: null, pz: 0, pth: 0, vf: 0, steer: 0, drift: 0, spinT: 0, boostT: 0, shieldT: 0, rough: false, dTier: 0, item: null, itemN: 0 })),
      boxes: m.boxes.map(b => ({ x: b[0], z: b[1], cd: 0 })), pads: m.pads.map(q => ({ x: q[0], z: q[1], th: q[2] })), hazards: [], proj: [], events: [], ok: false };
    View.setupRace(M, [m.me]); if (!trC.warm) { trC.warm = 1; try { View.warmup(); } catch (e) {} }
    if (ph === 'race') viewStart();
  }
  function onSnap(m) {
    if (!viewOn) return;
    if (!M || M.rid !== m.r) { const now = Date.now(); if (now - needAt > 1500) { needAt = now; tx({ t: 'need' }); } return; }
    const a = m.k, n = M.karts.length; if (!Array.isArray(a) || a.length < n * 13) return;
    for (let i = 0; i < n; i++) { const k = M.karts[i], o = i * 13; k.px = M.ok ? k.x : a[o]; k.pz = M.ok ? k.z : a[o + 1]; k.pth = M.ok ? k.th : a[o + 2];
      k.x = a[o]; k.z = a[o + 1]; k.th = a[o + 2]; k.vf = a[o + 3]; k.steer = a[o + 4]; k.drift = a[o + 5]; k.spinT = a[o + 6]; k.boostT = a[o + 7]; k.shieldT = a[o + 8]; k.rough = !!a[o + 9]; k.dTier = a[o + 10]; k.item = a[o + 11] || null; k.itemN = a[o + 12]; }
    const b = String(m.b || ''); M.boxes.forEach((x, i) => { x.cd = b[i] === '1' ? 1 : 0; });
    M.hazards = (m.h || []).map(h => ({ kind: h[0], x: h[1], z: h[2] })); M.proj = (m.p || []).map(q => ({ kind: q[0], x: q[1], z: q[2], th: q[3] }));
    if (Array.isArray(m.e) && m.e.length) M.events = M.events.concat(m.e);
    const now = performance.now(); if (M.ok) ivl += (Math.min(120, Math.max(25, now - recvAt)) - ivl) * 0.2; recvAt = now; M.ok = true;
    if (ph === 'race' && !vRaf) viewStart();
  }
  function viewStart() { if (!M || vRaf) return; root.classList.add('view'); vLast = performance.now(); vRaf = requestAnimationFrame(vFrame); }
  function vFrame(now) {
    vRaf = requestAnimationFrame(vFrame); const raw = now - vLast, dt = Math.min(0.1, raw / 1000); vLast = now; vT += dt;
    if (!M.ok) return; View.renderRace(M, dt, vT, 1, Math.min(1, (now - recvAt) / ivl)); M.events.length = 0; View.perf(raw);
  }
  function viewStop() { if (vRaf) cancelAnimationFrame(vRaf); vRaf = 0; root.classList.remove('view'); }
  // Strecke und Runden für alle wählen (der Fernseher übernimmt die Auswahl und schickt sie an jedes Handy)
  let cfg = null;
  function showCfg() {
    const el = $('ccfg'); if (!el || !cfg || !Array.isArray(cfg.opts)) return;
    el.innerHTML = `<div class="info" style="text-align:center">Strecke</div><div class="row" style="justify-content:center">${cfg.opts.map(o => `<button class="chip ${o[0] === cfg.sel ? 'on' : ''}" data-s="${esc(o[0])}">${esc(o[1])}</button>`).join('')}</div>
      <div class="info" style="text-align:center">Runden</div><div class="row" style="justify-content:center">${[2, 3, 5].map(n => `<button class="chip ${n === cfg.laps ? 'on' : ''}" data-l="${n}">${n}</button>`).join('')}</div>`;
    el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => tx({ t: 'cfg', sel: b.dataset.s, laps: cfg.laps }));
    el.querySelectorAll('[data-l]').forEach(b => b.onclick = () => tx({ t: 'cfg', sel: cfg.sel, laps: +b.dataset.l }));
  }
  function onData(m) {
    if (!m) return;
    if (m.cfg) { cfg = m.cfg; if (m.t === 'cfg') return showCfg(); }
    if (m.t === 's') return onSnap(m);
    if (m.t === 'race') return void onRace(m);
    if (m.t === 'wel' && Number.isInteger(m.slot)) root.style.setProperty('--acc', SLOTC[m.slot % 4]);
    if (m.t === 'wel') { clearInterval(joinT); if (joined && ph !== 'lobby') return; joined = true; tries = 0; waitScreen('Du bist dabei! 🎉', 'Warte, bis das Rennen startet …', m.race ? '' : '▶ RENNEN STARTEN'); }
    else if (m.t === 'full') { kicked = true; screenJoin(m.msg || 'Leider kein Platz mehr.'); try { conn.close(); } catch (e) {} }
    else if (m.t === 'ev') { if (m.e === 'hit' && navigator.vibrate) navigator.vibrate([120, 40, 120]); if (m.e === 'fin') hud('🏁 Ziel! Platz ' + m.pos); if (m.e === 'res') { waitScreen('Rennen beendet 🏁', 'Du wurdest ' + m.pos + '. – weiter geht’s mit dem nächsten Rennen.', '▶ WEITER'); } }
    else if (m.t === 'st') {
      if (m.ph === 'lobby') { if (ph !== 'lobby') waitScreen('Zurück im Menü', 'Am Fernseher geht’s weiter …'); ph = 'lobby'; return; }
      if (m.ph === 'res') { ph = 'res'; return; }
      if (ph !== 'race') { startPlay(); ph = 'race'; }
      hud(`${m.ph === 'grid' ? 'Gleich geht’s los …' : ordinal(m.pos) + ' Platz / ' + m.n + ' · Runde ' + m.lap + '/' + m.laps} ${m.item ? ' · ' + m.item : ''}${m.roll ? ' · ❓' : ''}`);
    }
  }
  const ordinal = n => n + '.';
  function hud(t) { const h = root.querySelector('.hudline'); if (h) h.textContent = t; }
  // Steuerfläche (Vollbild)
  function startPlay() {
    root.classList.add('play'); root.innerHTML = '<div class="hudline"></div><div class="tc" id="cz" style="display:block"></div>'; buildTouch($('cz'), st); $('cz').addEventListener('pointerdown', full); if (viewOn && M && M.ok) viewStart();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; }).catch(() => {}); } catch (e) {}
    clearInterval(sendT); sendT = setInterval(() => { const pa = Pads.any(); let s = clampN(st.s + pa.s, -1, 1); if (TILT.on && !s) s = TILT.v; const pressed = st.i | pa.i; if (pressed && !prevItem) itemSeq++; prevItem = pressed; const msg = { t: 'in', s: Math.round(s * 100) / 100, g: st.g | pa.g, b: st.b | pa.b, d: st.d | pa.d, i: pressed, n: itemSeq }, k = msg.s + '|' + msg.g + msg.b + msg.d + msg.i, now = Date.now(); if (k !== last || now - lastAt > 250) { last = k; lastAt = now; tx(msg); } }, 33);
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
  }
  function stopPlay() { viewStop(); clearInterval(sendT); sendT = 0; ph = 'lobby'; try { touchReset && touchReset(); } catch (e) {} for (const k in st) st[k] = 0; prevItem = 0; last = ''; try { wake && wake.release(); } catch (e) {} wake = null; }
  screenJoin();
};
