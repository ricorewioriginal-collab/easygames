/* Handy-Controller: koppelt per Code/QR und lenkt das Kart auf dem Host-Bildschirm. Gas ist automatisch. */
window.startController = function () {
  const root = $('ctl'); let peer = null, conn = null, ph = 'lobby', tries = 0, sendT = 0, last = '', wake = null;
  let name = '', logo = 6, ch = 1; try { name = localStorage.getItem('akName') || ''; logo = +localStorage.getItem('akLogo'); if (!(logo >= 0 && logo < 13)) logo = 6; ch = +localStorage.getItem('akChar'); if (!(ch >= 0 && ch < CHARS.length)) ch = 1; } catch (e) {}
  const logoSrc = i => `logos/${String(i + 1).padStart(2, '0')}.png`, put = html => { root.classList.remove('play'); root.innerHTML = html; }, st = { s: 0, b: 0, d: 0, i: 0 };
  const tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    stopPlay();
    put(`<h2>AnMaCha Kart Rush<br><small style="font-size:14px;color:var(--y)">Handy-Lenkrad · Raum ${esc(JOIN)}</small></h2>
      <div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Sender-Logo für das Kart.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off">
      <div class="chars" id="cch" style="align-self:center">${CHARS.map((c, i) => `<button class="${ch === i ? 'on' : ''}" data-ch="${i}"><b>${c.emoji}</b>${c.name}</button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="chip" id="cl" style="display:flex;gap:10px;align-items:center"><img id="cli" src="${logoSrc(logo)}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover"><span id="cln">${esc(NAMES[logo])}</span></button></div>
      <div class="row" style="justify-content:center"><button class="chip ${TILT.on ? 'on' : ''}" id="ct">📱 Kippen zum Lenken</button><button class="chip ${TILT.inv ? 'on' : ''}" id="ci">⇄ Richtung tauschen</button></div>
      <button class="big" id="cj">BEITRETEN</button>
      <div class="info">Tipp: Handy quer halten. Gas gibt das Kart automatisch.</div>`);
    $('cch').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { ch = +b.dataset.ch; $('cch').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.ch === ch)); });
    $('cl').onclick = () => { logo = (logo + 1) % 13; $('cli').src = logoSrc(logo); $('cln').textContent = NAMES[logo]; };
    $('ct').onclick = async () => { if (TILT.on) TILT.disable(); else await TILT.enable(); $('ct').classList.toggle('on', TILT.on); };
    $('ci').onclick = () => { TILT.inv = !TILT.inv; $('ci').classList.toggle('on', TILT.inv); };
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('akName', name); localStorage.setItem('akLogo', logo); localStorage.setItem('akChar', ch); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {}
    peer = new Peer(undefined, peerCfg());
    peer.on('error', e => { if (e.type === 'peer-unavailable') screenJoin('Raum ' + JOIN + ' nicht gefunden. Ist die Lobby offen?'); else screenJoin('Verbindungsfehler (' + e.type + ').'); });
    peer.on('open', () => {
      conn = peer.connect('amk-' + JOIN, { reliable: false, serialization: 'json' }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000);
      conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name, logo, ch }); });
      conn.on('data', onData);
      conn.on('close', () => { screenJoin(tries++ < 2 ? 'Verbindung getrennt – tippe auf „Beitreten“, um zurückzukehren.' : 'Verbindung getrennt.'); });
    });
  }
  function waitScreen(title, msg) { stopPlay(); put(`<h2>${title}</h2><div class="st">${esc(msg || '')}</div>`); }
  function onData(m) {
    if (!m) return;
    if (m.t === 'wel') waitScreen('Du bist dabei! 🎉', 'Warte, bis das Rennen startet …');
    else if (m.t === 'full') { screenJoin(m.msg || 'Leider kein Platz mehr.'); try { conn.close(); } catch (e) {} }
    else if (m.t === 'ev') { if (m.e === 'hit' && navigator.vibrate) navigator.vibrate([120, 40, 120]); if (m.e === 'fin') hud('🏁 Ziel! Platz ' + m.pos); if (m.e === 'res') { waitScreen('Rennen beendet 🏁', 'Du wurdest ' + m.pos + '. – warte auf das nächste Rennen …'); } }
    else if (m.t === 'st') {
      if (m.ph === 'lobby') { if (ph !== 'lobby') waitScreen('Zurück in der Lobby', 'Warte auf den nächsten Start …'); ph = 'lobby'; return; }
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
    clearInterval(sendT); sendT = setInterval(() => { const pa = Pads.any(); let s = clampN(st.s + pa.s, -1, 1); if (TILT.on && !s) s = TILT.v; const msg = { t: 'in', s: Math.round(s * 100) / 100, b: st.b | pa.b, d: st.d | pa.d, i: st.i | pa.i }, k = msg.s + '|' + msg.b + msg.d + msg.i; if (k !== last || (Date.now() % 400) < 40) { last = k; tx(msg); } }, 33);
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
  }
  function stopPlay() { clearInterval(sendT); sendT = 0; ph = 'lobby'; try { wake && wake.release(); } catch (e) {} wake = null; }
  screenJoin();
};
