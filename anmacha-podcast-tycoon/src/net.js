/* AnMaCha – Der Podcast · Online-Koop
   Zwei Geräte, eine Stadt: Der Gastgeber spielt seine Figur und rechnet die Welt (Funken, Störsender, Boss …),
   der Gast steuert die andere Figur auf seinem eigenen Gerät. Verbindung über ../cloud/fire-peer.js (Firebase vermittelt,
   gespielt wird direkt Gerät zu Gerät). Beitritt per 5-stelligem Code, Link (?koop=CODE) oder QR-Code. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, D = AMC.Data, UI = AMC.UI, I = AMC.Input;
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', CODE_LEN = 5, PREFIX = 'amc-koop-', V = 1;
  const N = AMC.Net = { role: null, code: '', conn: null, peer: null, ready: false };
  const makeCode = () => { let s = ''; for (let i = 0; i < CODE_LEN; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]; return s; };
  const norm = s => String(s || '').toUpperCase().split('').filter(c => CODE_CHARS.indexOf(c) >= 0).join('').slice(0, CODE_LEN);
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const ensurePeer = () => root.Peer ? Promise.resolve() : load('../vendor/peerjs-1.5.4.min.js');
  const ensureQR = () => root.qrcode ? Promise.resolve() : load('../vendor/qrcode-generator-1.4.4.js').catch(() => {});
  N.link = code => { const u = location.href.split('#')[0].split('?')[0] + '?koop=' + code; return root.EasyGamesLink ? root.EasyGamesLink.share(u) : u; };
  N.active = () => !!(N.conn && N.conn.open && N.ready);

  N.send = function (m) { try { if (N.conn && N.conn.open) N.conn.send(Object.assign({ v: V }, m)); } catch (e) { /* Verbindung weg */ } };
  N.close = function (silent) {
    const c = N.conn, p = N.peer; N.conn = null; N.peer = null; N.ready = false; N.role = null;
    try { if (c) { if (!silent) c.send({ v: V, t: 'bye' }); c.close(); } } catch (e) { }
    try { if (p) p.destroy(); } catch (e) { }
  };
  function lost() {
    if (!N.role) return;
    N.close(true); UI.toast('🌐 Verbindung zum Mitspieler verloren.');
    AMC.Game.netLost && AMC.Game.netLost();
  }
  function onData(d) {
    if (!d || typeof d !== 'object' || d.v !== V || typeof d.t !== 'string') return;
    if (d.t === 'bye') return lost();
    if (d.t === 'hello' && N.role === 'host') { N.ready = true; N.guestName = 'Mitspieler'; N.send({ t: 'welcome', host: AMC.Game.host }); N.render && N.render(); AMC.Audio.sfx('cheer'); return; }
    if (d.t === 'welcome' && N.role === 'guest') { N.ready = true; N.hostHost = d.host === 'marco' ? 'marco' : 'andrew'; N.render && N.render(); AMC.Audio.sfx('cheer'); return; }
    if (d.t === 'start' && N.role === 'guest') {
      const me = d.host === 'marco' ? 'andrew' : 'marco', ch = d.ch == null ? null : D.CHAPTERS[d.ch | 0];
      if (!/^(jagd|free|story)$/.test(d.mode) || (d.mode === 'story' && !ch)) return;
      UI.closeAll(); AMC.Game.startNet(d.mode, ch, d.seed | 0, me, 'guest'); return;
    }
    if (d.t === 'end' && N.role === 'guest') { AMC.Play.netFinish(Object.assign({ net: true }, typeof d.res === 'object' && d.res ? d.res : {})); return; }
    if (d.t === 'lobby' && N.role === 'guest') { AMC.Game.netLobby && AMC.Game.netLobby(); return; }
    if (d.t === 's' || d.t === 'i') AMC.Play.netRecv(d);
  }
  function wire(c) {
    N.conn = c;
    c.on('data', d => { if (N.conn === c) onData(d); });
    const gone = () => { if (N.conn === c) lost(); };
    c.on('close', gone); c.on('error', gone);
  }

  // ------------------------------------------------------------------ Gastgeber
  N.host = function (tries) {
    tries = tries || 0; N.close(true);
    N.role = 'host'; N.code = makeCode(); N.ready = false;
    return Promise.all([ensurePeer(), ensureQR()]).then(() => new Promise((res, rej) => {
      let peer; try { peer = new root.Peer(PREFIX + N.code); } catch (e) { return rej(e); }
      N.peer = peer;
      const to = setTimeout(() => rej(new Error('timeout')), 15000);
      peer.on('open', () => { clearTimeout(to); res(N.code); });
      peer.on('error', e => {
        if (N.peer !== peer) return;
        if (e && e.type === 'unavailable-id' && tries < 4) { clearTimeout(to); N.host(tries + 1).then(res, rej); return; }
        if (!N.ready) { clearTimeout(to); rej(e); }
      });
      peer.on('connection', c => {
        if (N.conn && N.conn.open) { try { c.on('open', () => { c.send({ v: V, t: 'bye' }); c.close(); }); } catch (e) { } return; }   // nur ein Gast
        wire(c);
      });
    }));
  };
  // ------------------------------------------------------------------ Gast
  N.join = function (code) {
    code = norm(code); N.close(true);
    if (code.length !== CODE_LEN) return Promise.reject(new Error('Der Code hat ' + CODE_LEN + ' Zeichen.'));
    N.role = 'guest'; N.code = code;
    return ensurePeer().then(() => new Promise((res, rej) => {
      let peer; try { peer = new root.Peer(); } catch (e) { return rej(e); }
      N.peer = peer;
      const to = setTimeout(() => rej(new Error('Keine Antwort von ' + code + '. Stimmt der Code?')), 20000);
      peer.on('error', e => { if (N.peer === peer && !N.ready) { clearTimeout(to); rej(new Error(e && e.type === 'peer-unavailable' ? 'Spiel ' + code + ' nicht gefunden. Stimmt der Code?' : 'Verbindungsfehler.')); } });
      peer.on('open', () => {
        const c = peer.connect(PREFIX + code, { reliable: true }); wire(c);
        c.on('open', () => { clearTimeout(to); N.send({ t: 'hello' }); res(code); });
      });
    }));
  };

  // ------------------------------------------------------------------ Lobby-Fenster
  N.lobby = function (joinCode) {
    const G = AMC.Game, st = AMC.Save.data.story;
    let chIdx = Math.min(st.done, D.CHAPTERS.length - 1), err = '';
    const s = UI.open('<div class="panel glass koop"><header><h2>🌐 Online-Koop</h2><button class="btn small" data-nav id="kBack">' + AMC.glyph('b') + ' Zurück</button></header><div id="kBody"></div></div>', { back: leave });
    const body = s.el.querySelector('#kBody');
    function leave() { N.close(); N.render = null; UI.close(s); }
    s.el.querySelector('#kBack').onclick = leave;
    function bind() {
      const $ = id => body.querySelector('#' + id);
      if ($('kHost')) $('kHost').onclick = () => { body.innerHTML = '<p class="lead">Spiel wird eröffnet …</p>'; N.host().then(render, e => { err = 'Online nicht erreichbar (' + ((e && e.type) || (e && e.message) || 'Fehler') + '). Internet prüfen und nochmal versuchen.'; N.close(true); render(); }); };
      if ($('kJoin')) $('kJoin').onclick = () => { const c = $('kCode').value; body.innerHTML = '<p class="lead">Verbinde mit ' + U.esc(norm(c)) + ' …</p>'; N.join(c).then(render, e => { err = (e && e.message) || 'Verbindung nicht möglich.'; N.close(true); render(); }); };
      if ($('kCode')) $('kCode').oninput = e => { e.target.value = norm(e.target.value); };
      if ($('kCopy')) $('kCopy').onclick = () => { const l = N.link(N.code); (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => UI.toast('🔗 Link kopiert')).catch(() => UI.toast(l)); };
      if ($('kPrev')) $('kPrev').onclick = () => { chIdx = (chIdx + D.CHAPTERS.length - 1) % (Math.min(st.done, D.CHAPTERS.length - 1) + 1); render(); };
      if ($('kNext')) $('kNext').onclick = () => { chIdx = (chIdx + 1) % (Math.min(st.done, D.CHAPTERS.length - 1) + 1); render(); };
      body.querySelectorAll('[data-km]').forEach(b => b.onclick = () => {
        if (!N.active()) return;
        const mode = b.dataset.km, seed = Math.floor(Math.random() * 1e6), ch = mode === 'story' ? chIdx : null;
        N.send({ t: 'start', mode, ch, seed, host: G.host });
        N.render = null; UI.closeAll(); G.startNet(mode, ch == null ? null : D.CHAPTERS[ch], seed, G.host, 'host');
      });
      if (UI.top() === s) { const f = body.querySelector('[data-first]:not([disabled])') || body.querySelector('[data-nav]:not([disabled])') || s.el.querySelector('#kBack'); if (f) UI.focus(f); }
    }
    function render() {
      if (!N.role) {
        body.innerHTML = (err ? '<p class="k-err">⚠️ ' + U.esc(err) + '</p>' : '') +
          '<p class="lead">Spielt zu zweit auf zwei Geräten: einer als Andrew, einer als Marco. Mitspieler können per Link, Code oder QR-Code von überall beitreten.</p>' +
          '<div class="row wrap"><button class="btn primary big" data-nav data-first id="kHost">📡 Spiel eröffnen<small>du bist ' + D.HOSTS[G.host].name + '</small></button></div>' +
          '<div class="k-join"><label for="kCode">Beitreten mit Code</label><div class="row"><input id="kCode" data-nav maxlength="5" autocomplete="off" autocapitalize="characters" placeholder="z. B. K7QX2" value="' + U.esc(joinCode || '') + '"><button class="btn" data-nav id="kJoin">Beitreten</button></div></div>';
      } else if (N.role === 'host') {
        const other = D.HOSTS[G.host === 'andrew' ? 'marco' : 'andrew'].name, ch = D.CHAPTERS[chIdx];
        body.innerHTML = '<div class="k-share"><div class="k-qr" id="kQr"></div><div><small>Code</small><div class="k-code">' + N.code + '</div><button class="btn small" data-nav id="kCopy">🔗 Link kopieren</button>' +
          '<p class="hint">Mitspieler öffnet den Link oder scannt den QR-Code – oder gibt unter „🌐 Online-Koop“ den Code ein.</p></div></div>' +
          '<p class="k-status ' + (N.ready ? 'ok' : '') + '">' + (N.ready ? '✔ Mitspieler verbunden – spielt ' + other + '!' : '⏳ Warte auf Mitspieler (spielt ' + other + ') …') + '</p>' +
          '<div class="k-modes"><button class="btn primary" data-nav data-first data-km="jagd"' + (N.ready ? '' : ' disabled') + '>🏃 Themenjagd zu zweit<small>3 Minuten, gemeinsame Punkte</small></button>' +
          '<button class="btn" data-nav data-km="free"' + (N.ready ? '' : ' disabled') + '>🏙️ Stadt zu zweit<small>Frei spielen, Störsender jagen</small></button>' +
          '<div class="k-ch"><button class="btn small" data-nav id="kPrev">◀</button><button class="btn" data-nav data-km="story"' + (N.ready ? '' : ' disabled') + '>🎬 Kapitel ' + (chIdx + 1) + ' zu zweit<small>' + U.esc(ch.title) + '</small></button><button class="btn small" data-nav id="kNext">▶</button></div></div>';
        if (root.qrcode) { try { const q = root.qrcode(0, 'M'); q.addData(N.link(N.code)); q.make(); body.querySelector('#kQr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { } }
      } else {
        body.innerHTML = '<p class="k-status ' + (N.ready ? 'ok' : '') + '">' + (N.ready ? '✔ Verbunden mit ' + N.code + '. Du spielst ' + D.HOSTS[N.hostHost === 'marco' ? 'andrew' : 'marco'].name + '.' : '⏳ Verbinde …') + '</p><p class="lead">Der Gastgeber wählt gleich den Modus. Halte dich bereit!</p>';
      }
      bind();
    }
    N.render = render;
    render();
    if (joinCode) setTimeout(() => { const b = body.querySelector('#kJoin'); if (b) b.click(); }, 50);
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
