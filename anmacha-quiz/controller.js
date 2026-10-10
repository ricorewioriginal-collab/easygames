/* Handy-Controller: tritt per Code/QR einem laufenden Quiz bei (PeerJS) und steuert dort die eigenen Antworten. */
window.startController = function () {
  const root = $('ctl'); let peer = null, conn = null, st = null, wasMine = false, tries = 0;
  let name = '', logo = 6; try { name = localStorage.getItem('amqName') || ''; logo = +localStorage.getItem('amqLogo'); if (!(logo >= 0 && logo < 13)) logo = 6; } catch (e) {}
  const LET = 'ABCD', logoSrc = i => `logos/${String(i + 1).padStart(2, '0')}.png`;
  const put = html => { root.innerHTML = html; };
  const tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };

  function screenJoin(msg) {
    put(`<h2>Machst du mich an?<br><small style="font-size:14px;color:var(--y)">Handy-Controller · Raum ${esc(JOIN)}</small></h2>
      <div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Sender-Shirt.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off">
      <div class="row2"><button class="chip" id="cl" style="display:flex;gap:10px;align-items:center"><img id="cli" src="${logoSrc(logo)}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover"><span id="cln">${esc(NAMES[logo])}</span></button></div>
      <button class="big" id="cj" style="align-self:center">BEITRETEN</button>
      <div class="info">Auf das Logo tippen = anderes Sender-Shirt für deinen Avatar.</div>`);
    $('cl').onclick = () => { logo = (logo + 1) % 13; $('cli').src = logoSrc(logo); $('cln').textContent = NAMES[logo]; };
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('amqName', name); localStorage.setItem('amqLogo', logo); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {}
    peer = new Peer(undefined, peerCfg());
    peer.on('error', e => { if (e.type === 'peer-unavailable') screenJoin('Raum ' + JOIN + ' nicht gefunden. Läuft das Quiz noch?'); else screenJoin('Verbindungsfehler (' + e.type + ').'); });
    peer.on('open', () => {
      conn = peer.connect('amq-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Quiz. Code richtig?'); }, 9000);
      conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name, logo }); });
      conn.on('data', onData);
      conn.on('close', () => { if (tries++ < 2) { screenJoin('Verbindung getrennt – tippe auf „Beitreten“, um zurückzukehren.'); } else screenJoin('Verbindung getrennt.'); });
    });
  }
  function onData(m) {
    if (!m) return;
    if (m.t === 'wel') { put('<h2>Du bist dabei! 🎉</h2><div class="info">Warte, bis die Show startet …</div>'); }
    else if (m.t === 'full') { screenJoin(m.msg || 'Leider kein Platz mehr.'); try { conn.close(); } catch (e) {} }
    else if (m.t === 'kick') screenJoin('Du wurdest vom Quiz entfernt.');
    else if (m.t === 'st') { st = m; draw(m); }
  }
  const meLine = m => m.me ? `<div class="st" style="color:#9fe8ff">${esc(m.me.name)} · ${esc(m.me.line)}</div>` : '';
  function draw(m) {
    if (m.ph === 'lobby' || m.ph === 'wait' || m.ph === 'end') { put(`<h2>${m.ph === 'end' ? 'Show beendet 🏁' : 'Machst du mich an?'}</h2>${meLine(m)}<div class="st">${esc(m.msg || '')}</div>`); wasMine = false; return; }
    if (m.ph === 'cat') {
      if (m.mine && !wasMine && navigator.vibrate) navigator.vibrate(80); wasMine = m.mine;
      put(`<h2>${m.mine ? 'Du bist dran!' : esc(m.who) + ' wählt …'}</h2>${meLine(m)}<div class="st">${m.mine ? 'Wähle eine Kategorie (10 Fragen)' : 'Gleich geht’s weiter'}</div><div class="ab" id="cg"></div>`);
      m.cats.forEach((c, i) => { const b = document.createElement('button'); b.innerHTML = `<b>${c.i}</b>${esc(c.n)}${c.done ? ' · gespielt' : ''}`; b.disabled = !m.mine || c.done; b.style.opacity = b.disabled ? .45 : 1; b.onclick = () => tx({ t: 'cat', i }); $('cg').appendChild(b); });
      return;
    }
    // Frage
    const mine = m.mine, q = m.q, pl = m.phase, canPick = mine && (pl === 'choose' || pl === 'confirm');
    if (mine && !wasMine && navigator.vibrate) navigator.vibrate([80, 40, 80]); wasMine = mine;
    put(`<div class="st">${mine ? '🎯 DU BIST DRAN' : '👀 ' + esc(m.who) + ' ist dran'}${m.time != null ? ' · ⏱ ' + m.time + ' s' : ''}</div>${meLine(m)}
      <div class="info">${esc(q.cat)} · ${esc(q.lvl)}</div><div class="q">${esc(q.text)}</div><div class="ab" id="ca"></div>
      <div class="st" id="cm" style="color:#cfe0f5;font-weight:600">${esc(m.msg || '')}</div><div class="row2" id="cc"></div><div class="jr" id="cj2"></div>`);
    q.ans.forEach((a, i) => {
      const b = document.createElement('button'); b.innerHTML = `<b>${LET[i]}:</b> <span>${a == null ? '' : esc(a)}</span>`; if (a == null) b.classList.add('hid');
      if (m.sel === i && pl !== 'result') b.classList.add('sel'); if (pl === 'result' && i === m.right) b.classList.add('right'); if (pl === 'result' && m.sel === i && i !== m.right) b.classList.add('wrong');
      b.disabled = !canPick; if (!canPick && !b.classList.contains('right') && !b.classList.contains('wrong') && !b.classList.contains('sel')) b.style.opacity = .7; b.onclick = () => tx({ t: 'ans', i }); $('ca').appendChild(b);
    });
    if (mine && pl === 'confirm') $('cc').innerHTML = '<button class="big" style="padding:12px 30px;font-size:18px" id="cy">Ja, final!</button><button class="ghost" id="cn2">Nein</button>';
    if (mine && pl === 'confirmWalk') $('cc').innerHTML = '<button class="big" style="padding:12px 30px;font-size:18px" id="cy">Aussteigen</button><button class="ghost" id="cn2">Weiterspielen</button>';
    if ($('cy')) { $('cy').onclick = () => tx({ t: 'yes' }); $('cn2').onclick = () => tx({ t: 'no' }); }
    if (mine && m.canWalk) { const w = document.createElement('button'); w.className = 'ghost'; w.textContent = 'Aussteigen · ' + m.walk; w.onclick = () => tx({ t: 'walk' }); $('cc').appendChild(w); }
    if (!m.night) ['½ 50:50', '👥 Publikum', '📞 Telefon', '🔄 Tausch'].forEach((n, k) => { const b = document.createElement('button'); b.className = 'ghost'; b.style.padding = '8px 10px'; b.style.fontSize = '12px'; b.textContent = n; b.disabled = !(canPick && m.jokers && m.jokers[k]); if (m.jokers && !m.jokers[k]) b.style.textDecoration = 'line-through'; b.onclick = () => tx({ t: 'jk', k }); $('cj2').appendChild(b); });
  }
  screenJoin();
  if (JOIN.length < 4) screenJoin('Ungültiger Code.');
};
