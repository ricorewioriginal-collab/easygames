/* Handy-Controller für AnMaCha Koffer DEALER: per Code/QR beitreten, Koffer wählen, Dealer-Angebote entscheiden. */
window.startController = function () {
  const root = $('ctl'); let peer = null, conn = null, wasMine = false;
  let name = '', logo = 6; try { name = localStorage.getItem('akdName') || ''; logo = +localStorage.getItem('akdLogo'); if (!(logo >= 0 && logo < 13)) logo = 6; } catch (e) {}
  const logoSrc = i => `logos/${String(i + 1).padStart(2, '0')}.png`;
  const put = html => { root.innerHTML = html; };
  const tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };

  function screenJoin(msg) {
    put(`<h2>AnMaCha Koffer DEALER<br><small style="font-size:14px;color:var(--y)">Handy-Controller · Raum ${esc(JOIN)}</small></h2>
      <div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Sender-Shirt.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off">
      <div class="row2"><button class="chip" id="cl" style="display:flex;gap:10px;align-items:center"><img id="cli" src="${logoSrc(logo)}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover"><span id="cln">${esc(NAMES[logo])}</span></button></div>
      <button class="big" id="cj" style="align-self:center">BEITRETEN</button>
      <div class="info">Auf das Logo tippen = anderes Sender-Shirt für deinen Avatar.</div>`);
    $('cl').onclick = () => { logo = (logo + 1) % 13; $('cli').src = logoSrc(logo); $('cln').textContent = NAMES[logo]; };
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('akdName', name); localStorage.setItem('akdLogo', logo); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {}
    peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => {
      conn = peer.connect('akd-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000);
      conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name, logo }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten“, um zurückzukehren.'));
    });
  }
  function onData(m) {
    if (!m) return;
    if (m.t === 'wel') put('<h2>Du bist dabei! 🎉</h2><div class="info">Warte, bis die Show startet …</div>');
    else if (m.t === 'full') { screenJoin(m.msg || 'Leider kein Platz mehr.'); try { conn.close(); } catch (e) {} }
    else if (m.t === 'kick') screenJoin('Du wurdest aus dem Spiel entfernt.');
    else if (m.t === 'st') draw(m);
  }
  const meLine = m => m.me ? `<div class="st" style="color:#9fe8ff">${esc(m.me.name)}${m.me.line ? ' · ' + esc(m.me.line) : ''}</div>` : '';
  const dial = m => m.values ? `<div class="dialc">${m.values.map(v => `<span class="${v.gone ? 'gone' : ''}">${v.v >= 1000000 ? '1 Mio' : v.v.toLocaleString('de-DE')}</span>`).join('')}</div>` : '';
  function draw(m) {
    if (m.ph === 'lobby' || m.ph === 'end') { put(`<h2>${m.ph === 'end' ? 'Show beendet 🏁' : 'AnMaCha Koffer DEALER'}</h2>${meLine(m)}<div class="st">${esc(m.msg || '')}</div>`); wasMine = false; return; }
    if (m.ph === 'wait') { put(`<h2>Show läuft …</h2>${meLine(m)}${dial(m)}<div class="st">${esc(m.msg || '')}</div>`); return; }
    const mine = m.mine; if (mine && !wasMine && navigator.vibrate) navigator.vibrate([80, 40, 80]); wasMine = mine;
    if (m.ph === 'pick') {
      put(`<div class="st">${mine ? '🎯 DU BIST DRAN' : '👀 ' + esc(m.who) + ' ist dran'}</div>${meLine(m)}${dial(m)}<div class="st" style="color:#fff">${esc(m.msg || '')}</div><div class="kgrid" id="kg"></div>`);
      m.koffer.forEach((k, i) => { const b = document.createElement('button'); b.className = k.st === 'mine' ? 'mine' : k.st === 'open' ? 'open' : (mine ? 'sel' : ''); b.innerHTML = `<img alt="" src="${logoSrc(i)}">${k.n}<small>${k.st === 'open' ? (k.v >= 1000000 ? '1 Mio' : k.v.toLocaleString('de-DE')) : k.st === 'mine' ? '★ ' + esc(k.own || '').slice(0, 8) : ''}</small>`; b.disabled = !(mine && k.st === 'closed'); b.onclick = () => tx({ t: 'pick', i }); $('kg').appendChild(b); });
      return;
    }
    if (m.ph === 'offer') {
      const o = m.offer;
      if (o.swap != null) put(`<div class="st">${mine ? '🎯 DU BIST DRAN' : '👀 ' + esc(m.who) + ' entscheidet'}</div>${meLine(m)}<h2>Letzte Entscheidung</h2><div class="oamt">Koffer ${o.own} ⇄ ${o.swap}</div><div class="info">Tauschen oder deinen Koffer behalten?</div><div class="row2" id="ob"></div>`);
      else put(`<div class="st">${mine ? '📞 FUNKSPRUCH FÜR DICH' : '👀 ' + esc(m.who) + ' bekommt ein Angebot'}</div>${meLine(m)}${dial(m)}<div class="oamt">${o.amt.toLocaleString('de-DE')} €</div><div class="info">Ø der restlichen Werte: ${o.ev.toLocaleString('de-DE')} €</div><div class="row2" id="ob"></div><div class="row2" id="hg"></div>`);
      const mk = (txt, cls, d, box, extra) => { const b = document.createElement('button'); b.className = 'pill ' + cls; b.textContent = txt; b.disabled = !(mine && o.wait); b.onclick = () => tx(Object.assign({ t: 'dec', d }, extra || {})); $(box || 'ob').appendChild(b); };
      if (o.swap != null) { mk('TAUSCHEN', 'deal', 'swap'); mk('BEHALTEN', 'go', 'keep'); }
      else { mk('DEAL!', 'deal', 'deal'); mk(o.last ? 'WEITER (Tausch)' : 'WEITER', 'go', 'weiter'); if (o.haggle && mine) [10, 25, 50].forEach(p => mk('Handeln +' + p + ' %', 'mag', 'haggle', 'hg', { pct: p })); }
    }
  }
  screenJoin(); if (JOIN.length < 4) screenJoin('Ungültiger Code.');
};
