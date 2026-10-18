/* Spinwelten 3D – 🌐 Online: private Räume über cloud/fire-peer.js (PeerJS-Schnittstelle, Vermittlung über Firebase),
 * öffentliche Räume und Online-Konto nur mit eingetragenem Spinwelten-Server. Kein Freitext-Chat.
 * Einladungslinks zeigen immer auf die easygames-Homepage (EasyGamesLink.share). */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en), tx = o => SW.tx(o), F = n => SW.fmt(n);
  const UI = () => SW.UI, A = () => SW.App, G = () => SW.App.g;
  const h = (...a) => SW.UI.h(...a), btn = (...a) => SW.UI.btn(...a);
  const PRE = 'spinwelten-', RKEY = 'spinweltenRoom';
  const N = { peer: null, conns: [], host: null, guest: null, code: '', role: '', st: null, lastMsg: 0, retry: 0, paidOut: {}, view: false, timer: 0 };
  function pid() { try { let p = localStorage.getItem('spinweltenPid'); if (!p) { p = SW.rng.uid(14); localStorage.setItem('spinweltenPid', p); } return p; } catch (e) { return N._pid || (N._pid = SW.rng.uid(14)); } }
  const myName = () => (G().s.name || L('Weltenhüter', 'Keeper')).slice(0, 16);
  function shareUrl(code) { const u = location.href.split('#')[0].split('?')[0] + '#join=' + code; return window.EasyGamesLink ? window.EasyGamesLink.share(u) : u; }
  function qrImg(text) {
    if (typeof window.qrcode !== 'function') return null;
    try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return h('img', { cls: 'qr', src: q.createDataURL(5, 2), alt: 'QR-Code' }); } catch (e) { return null; }
  }
  function send(c, m) { try { if (c && c.open !== false) c.send(m); } catch (e) { /* Verbindung weg */ } }
  // ---------- Gastgeber ----------
  function host(mode, max, restoreJson) {
    leave(true);
    if (!window.Peer) { UI().toast(L('Online nicht verfügbar (Verbindungsbaustein fehlt).', 'Online unavailable (connection module missing).')); return; }
    N.role = 'host';
    N.host = restoreJson ? SW.Room.Host.restore(restoreJson) : new SW.Room.Host({ mode, max, hostId: pid(), hostName: myName() });
    N.code = N.host.code; N.tries = 0;
    open();
  }
  function open() {
    const p = N.peer = new window.Peer(PRE + N.code);
    p.on('open', () => { N.ready = true; render(); publish(); });
    p.on('error', e => {
      if (e && (e.type === 'unavailable-id') && N.tries++ < 4 && N.host.st.phase === 'lobby') { try { p.destroy(); } catch (x) { /* */ } N.host.st.code = N.code = SW.Room.makeCode(); open(); return; }
      UI().toast(L('Online-Fehler: ', 'Online error: ') + ((e && e.type) || '?'));
    });
    p.on('connection', c => {
      c.on('data', d => onHostMsg(c, d));
      c.on('close', () => { if (c.pid) { N.host.leave(c.pid); bcast(); } N.conns = N.conns.filter(x => x !== c); });
      N.conns.push(c);
    });
    clearInterval(N.timer);
    N.timer = setInterval(() => { if (!N.host) return; if (N.host.pump()) bcast(); else if (Date.now() - (N.beat || 0) > 3000) { N.beat = Date.now(); bcast(); } }, 400);
  }
  function onHostMsg(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'hello') {
      if (typeof m.pid !== 'string' || !/^[a-z0-9]{6,20}$/.test(m.pid)) return;
      const r = N.host.join(m.pid, m.name);
      if (r.error) { send(c, { t: 'err', code: r.error }); setTimeout(() => { try { c.close(); } catch (e) { /* */ } }, 300); return; }
      c.pid = m.pid; send(c, { t: 'welcome', you: m.pid, snap: N.host.snapshot() }); bcast();
    } else if (m.t === 'act' && c.pid) {
      const r = N.host.action(c.pid, m.a); send(c, { t: 'ack', aid: m.a && m.a.aid, r }); if (!r.dup) bcast();
    } else if (m.t === 'sync' && c.pid) send(c, { t: 'state', snap: N.host.snapshot() });
  }
  function bcast() {
    const snap = N.host.snapshot(); N.st = snap.st;
    for (const c of N.conns) if (c.pid) send(c, { t: 'state', snap });
    try { sessionStorage.setItem(RKEY, JSON.stringify({ t: Date.now(), d: N.host.serialize() })); } catch (e) { /* ohne Speicher */ }
    onState();
  }
  function hostAct(kind, data) { const r = N.host.action(pid(), { aid: SW.rng.uid(12), seq: (N.host.seq[pid()] || 0) + 1, kind, data }); if (r.error) UI().toast(r.error); bcast(); }
  function publish() {
    if (!N.host || !SW.OnlineAPI || !SW.OnlineAPI.configured() || !N.pub) return;
    const st = N.host.st; if (st.phase !== 'lobby') { SW.OnlineAPI.rooms.unpublish().catch(() => {}); return; }
    SW.OnlineAPI.rooms.publish(N.code, st.mode, st.players.length, st.max).catch(() => {});
  }
  // ---------- Gast ----------
  function join(code) {
    code = String(code || '').trim().toUpperCase();
    if (!SW.Room.validCode(code)) { UI().toast(L('Ungültiger Code (z. B. BAU47).', 'Invalid code (e.g. BAU47).')); return; }
    if (!window.Peer) { UI().toast(L('Online nicht verfügbar.', 'Online unavailable.')); return; }
    leave(true);
    N.role = 'guest'; N.code = code; N.guest = new SW.Room.Guest(pid()); N.retry = 0;
    connect();
    clearInterval(N.timer);
    N.timer = setInterval(() => { if (N.role === 'guest' && N.lastMsg && Date.now() - N.lastMsg > 9000) lost(); }, 1000);
    render();
  }
  function connect() {
    if (!N.peer || N.peer.destroyed) { N.peer = new window.Peer(); N.peer.on('error', e => { if (e && e.type === 'peer-unavailable') lost(true); }); }
    const go = () => {
      const c = N.peer.connect(PRE + N.code, { reliable: true }); N.conn = c;
      c.on('open', () => { N.lastMsg = Date.now(); send(c, { t: 'hello', pid: pid(), name: myName() }); for (const k in N.guest.pending) send(c, { t: 'act', a: N.guest.pending[k] }); });
      c.on('data', onGuestMsg);
      c.on('close', () => lost());
    };
    if (N.peer.open) go(); else N.peer.on('open', go);
  }
  function onGuestMsg(m) {
    N.lastMsg = Date.now(); if (N.paused) { N.paused = false; veil(null); }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'welcome' || m.t === 'state') { const r = N.guest.receive(m.snap); if (r === 'checksum') send(N.conn, { t: 'sync' }); else if (r === 'ok') { N.st = N.guest.st; onState(); } }
    else if (m.t === 'ack') { if (m.aid) delete N.guest.pending[m.aid]; if (m.r && m.r.error && m.r.error !== 'done') UI().toast(L('Aktion abgelehnt: ', 'Action rejected: ') + m.r.error); }
    else if (m.t === 'err') { UI().toast(m.code === 'full' ? L('Der Raum ist voll.', 'The room is full.') : m.code === 'started' ? L('Das Spiel läuft schon.', 'The game has already started.') : m.code); leave(); }
  }
  function lost(gone) {
    if (N.role !== 'guest' || N.paused) return;
    N.paused = true;
    veil(L('Verbindung zum Gastgeber unterbrochen', 'Connection to host lost'), L('Das Spiel ist pausiert. Ich versuche, die Verbindung wiederherzustellen …', 'The game is paused. Trying to reconnect …'));
    const again = () => {
      if (!N.paused || N.role !== 'guest') return;
      if (N.retry++ > 20) { veil(L('Gastgeber nicht erreichbar', 'Host unreachable'), L('Der Raum ist nicht mehr da. Du kannst ihn verlassen.', 'The room is gone. You can leave it.')); return; }
      try { if (N.conn) N.conn.close(); } catch (e) { /* */ }
      connect(); setTimeout(again, 3000);
    };
    setTimeout(again, gone ? 2500 : 800);
  }
  function guestAct(kind, data) { const m = N.guest.nextAction(kind, data); send(N.conn, { t: 'act', a: m }); }
  function act(kind, data) { if (N.role === 'host') hostAct(kind, data); else if (N.role === 'guest') guestAct(kind, data); SW.Audio.sfx(kind === 'spin' ? 'spin' : 'dig'); }
  function leave(silent) {
    clearInterval(N.timer);
    if (N.role === 'host' && SW.OnlineAPI && SW.OnlineAPI.configured() && N.pub) SW.OnlineAPI.rooms.unpublish().catch(() => {});
    for (const c of N.conns) try { c.close(); } catch (e) { /* */ }
    try { if (N.peer) N.peer.destroy(); } catch (e) { /* */ }
    if (N.role === 'host') try { sessionStorage.removeItem(RKEY); } catch (e) { /* */ }
    Object.assign(N, { peer: null, conns: [], host: null, guest: null, code: '', role: '', st: null, conn: null, paused: false, lastMsg: 0, ready: false, pub: false });
    veil(null);
    if (!silent && UI().sheetOpen()) UI().rerender();
  }
  function veil(title, text) {
    let v = document.getElementById('veil'); if (!title) { if (v) v.remove(); return; }
    if (!v) { v = h('div', { id: 'veil' }); document.getElementById('ui').appendChild(v); }
    v.innerHTML = ''; v.appendChild(h('h3', null, title)); v.appendChild(h('p', null, text)); v.appendChild(btn(L('Raum verlassen', 'Leave room'), () => leave(), 'coral'));
  }
  // Ergebnis einmal gutschreiben (idempotent je Sitzung, auch nach Neuladen)
  function onState() {
    const st = N.st; if (!st) return;
    if (st.phase === 'end' && st.result) {
      const me = st.result.places.find(p => p[0] === pid());
      if (me) { const rw = G().onlineResult(st.session, me[1], st.players.length); if (rw) { A().after(); SW.Audio.sfx(me[1] === 1 ? 'big' : 'win'); UI().toast(L('Online-Belohnung: ', 'Online reward: ') + UI().rwText(rw), 4000); } }
    }
    if (N.view) render();
  }
  // ---------- Oberfläche ----------
  function roomView(body) {
    const st = N.st, me = pid();
    body.appendChild(h('div', { cls: 'code' }, N.code));
    if (!st) { body.appendChild(h('p', { cls: 'note', style: 'text-align:center' }, N.role === 'host' ? L('Raum wird eröffnet …', 'Opening room …') : L('Verbinde mit dem Raum …', 'Connecting to room …'))); body.appendChild(btn(L('Abbrechen', 'Cancel'), () => leave(), 'ghost wide')); return; }
    const M = SW.Room.MODES[st.mode];
    body.appendChild(h('p', { cls: 'note', style: 'text-align:center' }, tx(M.name) + ' · ' + tx(M.desc)));
    if (st.phase === 'lobby') {
      const url = shareUrl(N.code);
      body.appendChild(h('p', { style: 'text-align:center' }, L('Mitspieler treten per Link, QR-Code oder Code von überall bei – Handy, Tablet oder PC.', 'Friends join from anywhere via link, QR code or code – phone, tablet or PC.')));
      const q = qrImg(url); if (q) body.appendChild(q);
      body.appendChild(h('div', { cls: 'row', style: 'justify-content:center' }, [btn(L('Link kopieren', 'Copy link'), () => { try { navigator.clipboard.writeText(url).then(() => UI().toast(L('Link kopiert', 'Link copied'))); } catch (e) { UI().toast(url); } }, 'small'),
        navigator.share ? btn(L('Teilen', 'Share'), () => navigator.share({ title: 'Spinwelten 3D', text: L('Komm in meinen Raum: ', 'Join my room: ') + N.code, url }).catch(() => {}), 'small') : null]));
    }
    const list = h('div', { cls: 'list' });
    st.players.slice().sort((a, b) => (st.phase === 'lobby' ? 0 : b.score - a.score)).forEach(p => {
      const status = st.phase === 'play' ? (p.done ? '✓' : '…') : '';
      const last = p.last ? (p.last.ids ? p.last.ids.map(i => (SW.REELS.SYMBOLS.find(s => s.id === i) || {}).glyph).join(' ') + ' +' + p.last.pts : p.last.got !== undefined ? L('Stelle ', 'Spot ') + (p.last.pick + 1) + ' +' + p.last.got : '') : '';
      list.appendChild(h('div', { cls: 'item' }, [h('div', { cls: 'tx' }, [h('b', null, p.name + (p.id === me ? L(' (du)', ' (you)') : '') + (p.host ? ' 👑' : '')), h('small', null, (p.bot ? L('Computer-Spieler', 'Computer player') + ' · ' : '') + (p.on ? '' : L('getrennt · ', 'disconnected · ')) + last)]), h('b', null, st.phase === 'lobby' ? '' : F(p.score) + ' ' + status)]));
    });
    if (st.mode === 'coop' && st.phase !== 'lobby') { body.appendChild(h('p', null, L('Teamziel: ', 'Team goal: ') + F(st.team) + ' / ' + F(st.goal))); body.appendChild(UI().prog(st.team, st.goal)); }
    if (st.phase === 'play') body.appendChild(h('p', { style: 'text-align:center' }, L('Runde ', 'Round ') + st.round + ' / ' + st.rounds + (st.between ? L(' · Auswertung …', ' · scoring …') : '')));
    body.appendChild(list);
    const mine = st.players.find(p => p.id === me);
    if (st.phase === 'lobby') {
      if (N.role === 'host') {
        const row = h('div', { cls: 'row', style: 'justify-content:center;margin-top:10px' });
        Object.keys(SW.Room.MODES).forEach(k => row.appendChild(btn(tx(SW.Room.MODES[k].name), () => { N.host.setMode(k); bcast(); publish(); }, st.mode === k ? 'gold small' : 'small')));
        body.appendChild(row);
        if (SW.OnlineAPI && SW.OnlineAPI.configured()) body.appendChild(h('label', { cls: 'set' }, [h('span', null, L('Öffentlich anzeigen (Server)', 'List publicly (server)')), (() => { const c = h('input', { type: 'checkbox' }); c.checked = !!N.pub; c.addEventListener('change', () => { N.pub = c.checked; if (N.pub) publish(); else SW.OnlineAPI.rooms.unpublish().catch(() => {}); }); return c; })()]));
        body.appendChild(btn(L('Spiel starten (freie Plätze: Computer-Spieler)', 'Start game (free seats: computer players)'), () => { N.host.start(true); bcast(); publish(); }, 'gold wide'));
      } else body.appendChild(h('p', { cls: 'note', style: 'text-align:center' }, L('Warte, bis der Gastgeber startet …', 'Waiting for the host to start …')));
    } else if (st.phase === 'play' && mine) {
      if (st.mode === 'duel') {
        if (st.reveal) body.appendChild(h('p', { style: 'text-align:center' }, L('Fundstellen: ', 'Spots: ') + st.reveal.join(' · ')));
        const row = h('div', { cls: 'row', style: 'justify-content:center' });
        for (let i = 0; i < 6; i++) row.appendChild(btn(L('Stelle ', 'Spot ') + (i + 1), () => act('dig', { i }), 'gold small', { disabled: mine.done }));
        body.appendChild(row);
      } else body.appendChild(btn(mine.done ? L('Warte auf die anderen …', 'Waiting for the others …') : L('Drehen!', 'Spin!'), () => act('spin'), 'gold wide', { disabled: mine.done, id: 'roomSpin' }));
    } else if (st.phase === 'end') {
      const r = st.result, my = r.places.find(p => p[0] === me);
      body.appendChild(h('h3', { style: 'text-align:center;color:var(--brass2)' }, st.mode === 'coop' ? (r.win ? L('Teamziel geschafft! 🎉', 'Team goal reached! 🎉') : L('Knapp verfehlt – nächstes Mal!', 'Just missed – next time!')) : (my && my[1] === 1 ? L('Gewonnen! 🎉', 'You won! 🎉') : L('Platz ', 'Place ') + (my ? my[1] : '?'))));
    }
    body.appendChild(btn(L('Raum verlassen', 'Leave room'), () => leave(), 'ghost wide', { style: 'margin-top:10px' }));
  }
  function privTab(body) {
    if (N.role) { roomView(body); return; }
    body.appendChild(h('p', null, L('🌐 Spiele mit Freunden auf ihren eigenen Geräten: Raum erstellen und Code, Link oder QR-Code teilen – Mitspieler können von überall beitreten. 2–8 Spieler, freie Plätze übernehmen Computer-Spieler.', '🌐 Play with friends on their own devices: create a room and share the code, link or QR code – friends can join from anywhere. 2–8 players, computer players fill free seats.')));
    const sel = h('select'); Object.keys(SW.Room.MODES).forEach(k => sel.appendChild(h('option', { value: k }, tx(SW.Room.MODES[k].name))));
    const max = h('select'); [2, 3, 4, 5, 6, 8].forEach(n => { const o = h('option', { value: n }, n + L(' Spieler', ' players')); if (n === 4) o.selected = true; max.appendChild(o); });
    body.appendChild(h('label', { cls: 'set' }, [h('span', null, L('Modus', 'Mode')), sel]));
    body.appendChild(h('label', { cls: 'set' }, [h('span', null, L('Plätze', 'Seats')), max]));
    body.appendChild(btn(L('Raum erstellen', 'Create room'), () => { host(sel.value, +max.value); render(); }, 'gold wide'));
    let saved = null; try { saved = JSON.parse(sessionStorage.getItem(RKEY) || 'null'); } catch (e) { saved = null; }
    if (saved && Date.now() - saved.t < 30 * 60000) body.appendChild(btn(L('Meinen Raum fortsetzen', 'Resume my room'), () => { host(null, null, saved.d); render(); }, 'jade wide', { style: 'margin-top:8px' }));
    body.appendChild(h('div', { cls: 'sec' }, L('Beitreten', 'Join')));
    const inp = h('input', { type: 'text', maxlength: 5, placeholder: 'BAU47', style: 'text-transform:uppercase;max-width:none;flex:1', autocomplete: 'off', inputmode: 'text' });
    body.appendChild(h('div', { cls: 'row' }, [inp, btn(L('Beitreten', 'Join'), () => join(inp.value), 'jade')]));
    body.appendChild(h('p', { cls: 'note' }, L('Hinweis: Es gibt keinen Chat. Räume sind privat und nur mit Code erreichbar. Die Spielregeln prüft der Gastgeber – doppelte oder veraltete Aktionen werden verworfen.', 'Note: there is no chat. Rooms are private and only reachable by code. The host checks the rules – duplicate or outdated actions are discarded.')));
  }
  function pubTab(body) {
    const api = SW.OnlineAPI;
    if (!api || !api.configured()) {
      body.appendChild(h('p', null, L('Öffentliche Räume brauchen einen Spinwelten-Server. Es ist noch keiner eingetragen – private Räume per Code funktionieren trotzdem.', 'Public rooms require a Spinwelten server. None is set up yet – private rooms by code still work.')));
      body.appendChild(btn(L('Server eintragen', 'Set up server'), () => SW.Panels.settings('n'), 'small')); return;
    }
    const out = h('div', { cls: 'list' }, h('p', { cls: 'note' }, L('Lade Räume …', 'Loading rooms …'))); body.appendChild(out);
    api.rooms.list().then(r => {
      out.innerHTML = ''; const rooms = (r.result && r.result.rooms) || r.result || [];
      if (!rooms.length) out.appendChild(h('p', { cls: 'note' }, L('Gerade keine offenen Räume. Erstelle selbst einen und setze „Öffentlich anzeigen“.', 'No open rooms right now. Create one and enable “List publicly”.')));
      rooms.forEach(x => out.appendChild(h('div', { cls: 'item' }, [h('div', { cls: 'tx' }, [h('b', null, x.code + ' · ' + tx((SW.Room.MODES[x.mode] || {}).name || x.mode)), h('small', null, x.players + ' / ' + x.max)]), btn(L('Beitreten', 'Join'), () => join(x.code), 'jade small')])));
    }).catch(e => { out.innerHTML = ''; out.appendChild(h('p', { cls: 'warn' }, L('Server nicht erreichbar: ', 'Server unreachable: ') + (e.code || e.message))); });
  }
  function accTab(body) {
    const api = SW.OnlineAPI;
    if (!api || !api.configured()) { body.appendChild(h('p', null, L('Mit einem Spinwelten-Server spielst du ein gemeinsames Online-Konto: Der Server würfelt und bucht, du kannst echte Spieler angreifen, in Teams spielen und in weltweiten Ranglisten stehen. Dein Offline-Spiel bleibt davon getrennt.', 'With a Spinwelten server you play a shared online account: the server rolls and books, you can attack real players, join teams and appear in worldwide leaderboards. Your offline game stays separate.'))); body.appendChild(btn(L('Server eintragen', 'Set up server'), () => SW.Panels.settings('n'), 'small')); return; }
    const out = h('div'); body.appendChild(out);
    const fail = e => { out.innerHTML = ''; out.appendChild(h('p', { cls: 'warn' }, e.code === 'needs-login' ? L('Bitte zuerst über ☁ mit Google anmelden.', 'Please sign in with Google via ☁ first.') : L('Fehler: ', 'Error: ') + (e.code || e.message))); };
    const show = r => {
      out.innerHTML = ''; const s = r.state || {}; N.srv = s;
      out.appendChild(h('div', { cls: 'kv' }, [h('span', null, L('Insel', 'Island')), h('b', null, String(s.island)), h('span', null, '🪙'), h('b', null, F(s.coins)), h('span', null, '⚡'), h('b', null, String(s.energy)), h('span', null, '🛡️'), h('b', null, String(s.shields)), h('span', null, 'ID'), h('b', null, String(s.pid || ''))]));
      const row = h('div', { cls: 'row', style: 'margin-top:8px' }, [btn(L('Drehen (Server)', 'Spin (server)'), () => api.spin(1).then(x => { UI().toast((x.result.ids || []).join(' ') + ' 🪙 ' + F(x.result.coins || 0)); show(x); }).catch(fail), 'gold small')]);
      (s.stages || []).forEach((st, b) => row.appendChild(btn((s.damaged && s.damaged[b] ? '🔧 ' : '🏗️ ') + (b + 1) + ' (' + st + ')', () => (s.damaged && s.damaged[b] ? api.repair(b) : api.build(b)).then(show).catch(fail), 'small', { disabled: st >= 5 && !(s.damaged && s.damaged[b]) })));
      out.appendChild(row);
      if (s.pending) out.appendChild(btn(s.pending.kind === 'attack' ? L('⚡ Ziel wählen', '⚡ Choose target') : L('🧭 Ziel wählen', '🧭 Choose target'), () => api.targets().then(t => {
        const list = h('div', { cls: 'list' }); (t.result.targets || []).forEach(x => list.appendChild(h('div', { cls: 'item' }, [h('div', { cls: 'tx' }, [h('b', null, x.name + (x.shield ? ' 🛡️' : '')), h('small', null, L('Insel ', 'Island ') + x.island)]),
          btn(L('Los', 'Go'), () => { d.close(); const b = x.stages.findIndex(v => v > 0); (t.result.kind === 'attack' ? api.attack(x.target, Math.max(0, b)) : api.raid(x.target, [0, 2, 4])).then(y => { UI().toast(L('Erledigt: ', 'Done: ') + JSON.stringify(y.result).slice(0, 80)); show(y); }).catch(fail); }, 'coral small')])));
        if (!(t.result.targets || []).length) list.appendChild(h('p', { cls: 'note' }, L('Gerade keine angreifbaren Spieler (Anfängerschutz/Limits).', 'No attackable players right now (newbie protection/limits).')));
        const d = UI().dialog({ title: L('Echte Spieler', 'Real players'), node: list, buttons: [{ label: L('Schließen', 'Close') }] });
      }).catch(fail), 'coral small'));
      const lb = h('div', { cls: 'list' }); out.appendChild(h('div', { cls: 'sec' }, L('Weltweite Rangliste', 'Worldwide leaderboard'))); out.appendChild(lb);
      api.leaderboard('islands').then(x => { const top = (x.result && (x.result.top || x.result.list)) || []; top.slice(0, 20).forEach((e, i) => lb.appendChild(h('div', { cls: 'item' }, [h('b', null, (i + 1) + '. ' + e.name), h('span', { style: 'margin-left:auto' }, F(e.value))]))); if (!top.length) lb.appendChild(h('p', { cls: 'note' }, '–')); }).catch(() => {});
      out.appendChild(h('div', { cls: 'sec' }, 'Team'));
      const tm = h('div'); out.appendChild(tm);
      api.teams.mine().then(x => { const t = x.result && x.result.team; tm.appendChild(t ? h('div', null, [h('p', null, t.name + ' · ' + (t.members || []).length + L(' Mitglieder', ' members')), btn(L('Team verlassen', 'Leave team'), () => api.teams.leave().then(show).catch(fail), 'small')]) : h('div', null, [h('p', { cls: 'note' }, L('Kein Team.', 'No team.')), btn(L('Offene Teams', 'Open teams'), () => api.teams.list().then(y => { const l = h('div', { cls: 'list' }); ((y.result && y.result.teams) || y.result || []).forEach(z => l.appendChild(h('div', { cls: 'item' }, [h('b', null, z.name), btn(L('Beitreten', 'Join'), () => { dd.close(); api.teams.join(z.id).then(show).catch(fail); }, 'small')]))); const dd = UI().dialog({ title: L('Teams', 'Teams'), node: l, buttons: [{ label: L('Schließen', 'Close') }] }); }).catch(fail), 'small')])); }).catch(() => {});
    };
    out.appendChild(h('p', { cls: 'note' }, L('Verbinde …', 'Connecting …')));
    api.init().then(show).catch(fail);
  }
  function render() { if (!N.view || !UI().sheetOpen()) return; UI().rerender(); }
  N.open = function (tab) {
    N.view = true;
    UI().sheet('🌐 Online', [{ id: 'p', label: L('Privater Raum', 'Private room'), render: privTab }, { id: 'o', label: L('Öffentlich', 'Public'), render: pubTab }, { id: 'k', label: L('Online-Konto', 'Online account'), render: accTab }], tab || 'p', () => { N.view = false; });
  };
  N.join = join; N.leave = leave; N.act = act; N.pid = pid; N.shareUrl = shareUrl;
  N.active = () => !!N.role;
  // Aufruf über Link: …#join=BAU47 oder ?join=BAU47
  N.fromUrl = function () {
    const m = (location.hash + '&' + location.search).match(/[#?&]join=([A-Za-z0-9]{5})/);
    if (!m) return false;
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ }
    N.open('p'); join(m[1]); return true;
  };
  SW.Lobby = N;
})(globalThis.SW = globalThis.SW || {});
