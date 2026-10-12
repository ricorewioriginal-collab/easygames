/* Handy-Controller: koppelt per Code/QR und lenkt das Kart auf dem Host-Bildschirm. Gas per Knopf. */
window.startController = function () {
  const root = $('ctl'); let peer = null, conn = null, ph = 'lobby', tries = 0, sendT = 0, last = '', lastAt = 0, wake = null, joined = false, kicked = false, joinT = 0, reT = 0;
  let name = '', logo = 6, ch = 1, kt = 0; try { name = localStorage.getItem('akName') || ''; logo = +localStorage.getItem('akLogo'); if (!(logo >= 0 && logo < 13)) logo = 6; ch = +localStorage.getItem('akChar'); if (!(ch >= 0 && ch < CHARS.length)) ch = 1; kt = +localStorage.getItem('akKart'); if (!(kt >= 0 && kt < KARTS.length)) kt = 0; } catch (e) {}
  // Feste Geräte-Kennung: nach Verbindungsabbruch (Bildschirmsperre, WLAN-Wechsel) bekommt das Handy sein Kart zurück
  let cid = ''; try { cid = localStorage.getItem('akCid') || ''; } catch (e) {} if (!/^[a-z0-9]{8,16}$/.test(cid)) { cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem('akCid', cid); } catch (e) {} }
  const logoSrc = i => `logos/${String(i + 1).padStart(2, '0')}.png`, put = html => { root.classList.remove('play'); root.innerHTML = html; }, st = { s: 0, g: 0, b: 0, d: 0, i: 0 };
  const tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    stopPlay(); joined = false; clearTimeout(reT); clearInterval(joinT);
    put(`<h2>AnMaCha Kart Rush<br><small style="font-size:14px;color:var(--y)">Handy-Lenkrad · Raum ${esc(JOIN)}</small></h2>
      <div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Sender-Logo für das Kart.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off">
      <div class="chars" id="cch" style="align-self:center">${CHARS.map((c, i) => `<button class="${ch === i ? 'on' : ''}" data-ch="${i}"><b>${c.emoji}</b>${c.name}</button>`).join('')}</div>
      <div class="kcards" id="ckt" style="align-self:center">${KARTS.map((k, i) => `<button class="${kt === i ? 'on' : ''}" data-kt="${i}"><b>${k.emoji}</b>${k.name}<div class="st">${esc(k.desc)}</div></button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="chip" id="cl" style="display:flex;gap:10px;align-items:center"><img id="cli" src="${logoSrc(logo)}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover"><span id="cln">${esc(NAMES[logo])}</span></button></div>
      <div class="row" style="justify-content:center"><button class="chip ${TILT.on ? 'on' : ''}" id="ct">📱 Kippen zum Lenken</button><button class="chip ${TILT.inv ? 'on' : ''}" id="ci">⇄ Richtung tauschen</button></div>
      <button class="big" id="cj">BEITRETEN</button>
      <div class="info">Tipp: Handy quer halten. Rechts unten ist GAS – ohne Gas rollst du nur.</div>`);
    $('cch').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { ch = +b.dataset.ch; $('cch').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.ch === ch)); });
    $('ckt').querySelectorAll('[data-kt]').forEach(b => b.onclick = () => { kt = +b.dataset.kt; $('ckt').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.kt === kt)); });
    $('cl').onclick = () => { logo = (logo + 1) % 13; $('cli').src = logoSrc(logo); $('cln').textContent = NAMES[logo]; };
    $('ct').onclick = async () => { if (TILT.on) TILT.disable(); else await TILT.enable(); $('ct').classList.toggle('on', TILT.on); };
    $('ci').onclick = () => { TILT.inv = !TILT.inv; $('ci').classList.toggle('on', TILT.inv); };
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('akName', name); localStorage.setItem('akLogo', logo); localStorage.setItem('akChar', ch); localStorage.setItem('akKart', kt); } catch (e) {} connect(); };
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
      const c = conn = pe.connect('amk-' + JOIN, { reliable: false, serialization: 'json' }); const to = setTimeout(() => { if (c === conn && !c.open) { if (joined) retry(); else screenJoin('Keine Antwort vom Spiel. Code richtig?'); } }, 9000);
      // Beitritt wiederholen, bis das Spiel antwortet (der Kanal ist bewusst unzuverlässig = schnell)
      c.on('open', () => { clearTimeout(to); tries = 0; const j = () => tx({ t: 'join', name, logo, ch, kt, cid }); j(); clearInterval(joinT); joinT = setInterval(j, 1000); });
      c.on('data', onData);
      c.on('close', () => { if (c !== conn || kicked) return; if (joined) retry(); else screenJoin('Verbindung getrennt.'); });
    });
  }
  // Automatisch neu verbinden; erst nach mehreren Fehlversuchen zurück zum Beitreten-Bildschirm
  function retry() { stopPlay(); clearInterval(joinT); clearTimeout(reT); if (tries++ >= 5) return screenJoin('Verbindung getrennt – tippe auf „Beitreten“, um zurückzukehren.'); put('<h2>Verbindung weg …</h2><div class="info">Verbinde neu – dein Kart wartet auf dich.</div>'); reT = setTimeout(() => connect(true), 600 + tries * 700); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && joined && !(conn && conn.open)) { tries = 0; connect(true); } });
  // Warte-Bildschirm mit Start-Knopf: so lässt sich das nächste Rennen vom Sofa aus starten (Fernseher braucht keine Maus)
  function waitScreen(title, msg, go) { stopPlay(); put(`<h2>${title}</h2><div class="st">${esc(msg || '')}</div>${go ? `<div id="ccfg"></div><button class="big" id="cgo">${go}</button><div class="info" style="text-align:center">Startet für alle – erst drücken, wenn alle dabei sind.</div>` : ''}`); if (go) { $('cgo').onclick = () => tx({ t: 'go' }); showCfg(); } }
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
    root.classList.add('play'); root.innerHTML = '<div class="hudline"></div><div class="tc" id="cz" style="display:block"></div>'; buildTouch($('cz'), st);
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; }).catch(() => {}); } catch (e) {}
    clearInterval(sendT); sendT = setInterval(() => { const pa = Pads.any(); let s = clampN(st.s + pa.s, -1, 1); if (TILT.on && !s) s = TILT.v; const msg = { t: 'in', s: Math.round(s * 100) / 100, g: st.g | pa.g, b: st.b | pa.b, d: st.d | pa.d, i: st.i | pa.i }, k = msg.s + '|' + msg.g + msg.b + msg.d + msg.i, now = Date.now(); if (k !== last || now - lastAt > 250) { last = k; lastAt = now; tx(msg); } }, 33);
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
  }
  function stopPlay() { clearInterval(sendT); sendT = 0; ph = 'lobby'; try { touchReset && touchReset(); } catch (e) {} for (const k in st) st[k] = 0; last = ''; try { wake && wake.release(); } catch (e) {} wake = null; }
  screenJoin();
};
