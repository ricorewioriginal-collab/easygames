/* AnMaCha UNDERCOVER 3D – Verbindung über ../cloud/fire-peer.js (PeerJS-kompatibles window.Peer, Vermittlung über Firebase).
   Keine eigene Vermittlung. Gastgeber-Kennung: 'amu-' + Code. Gespielt wird direkt zwischen den Geräten (WebRTC).
   AMU.Online.host(opts) / AMU.Online.join(code, opts) → Sitzung { kind, code, host?, client?, send…, close() }
   opts.on(kind, data) meldet: open, lobby, welcome, start, view, ev, res, end, kick, error(text, retry), lost */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
  }
  const ensurePeer = () => root.Peer ? Promise.resolve() : loadScript('../vendor/peerjs-1.5.4.min.js');
  const ensureQR = () => root.qrcode ? Promise.resolve() : loadScript('../vendor/qrcode-generator-1.4.4.js').catch(() => {});
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* privat */ } }
  };
  /** Einladungslink – immer über die easygames-Homepage (EasyGamesLink.share). */
  function shareUrl(code) {
    const u = location.href.split('#')[0].split('?')[0] + '?join=' + code;
    return root.EasyGamesLink ? root.EasyGamesLink.share(u) : u;
  }
  function qrSvg(text) {
    if (!root.qrcode) return '';
    try { const q = root.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }

  function Session(kind, opts) {
    this.kind = kind; this.opts = opts; this.on = opts.on || function () {}; this.closed = false;
    this.peer = null; this.conns = new Map(); this.conn = null; this.timer = null; this.code = null; this.open = false;
  }
  Session.prototype = {
    emit(k, d) { if (!this.closed) { try { this.on(k, d); } catch (e) { if (root.console) console.error(e); } } },
    fail(text, retry) { this.cleanup(); this.emit('error', { text, retry }); },
    cleanup() {
      clearTimeout(this.timer); this.timer = null;
      this.conns.forEach(c => { try { c.close(); } catch (e) { /* schon zu */ } }); this.conns.clear();
      if (this.conn) { try { this.conn.close(); } catch (e) { /* schon zu */ } } this.conn = null;
      if (this.peer) { try { this.peer.destroy(); } catch (e) { /* schon zu */ } } this.peer = null;
    },
    close() {
      if (this.closed) return;
      try {
        if (this.host) { this.host.close(); }
        else if (this.client && this.conn && this.conn.open) this.client.bye();
      } catch (e) { /* egal */ }
      if (AMU.PublicRooms && this.kind === 'host') AMU.PublicRooms.unpublish(this.code);
      const self = this; this.closed = true;
      setTimeout(() => self.cleanup(), 250);
    },
    // ---------- Gastgeber ----------
    startHost(tries) {
      tries = tries || 0;
      const S = this, code = AMU.Net.makeCode();
      S.code = code;
      S.host = new AMU.Net.Host({ code, settings: S.opts.settings, hostPlayer: { name: S.opts.name, look: S.opts.look }, max: 12,
        send: (to, m) => { const c = S.conns.get(to); if (c && c.open) { try { c.send(JSON.stringify(m)); } catch (e) { /* Verbindung weg */ } } },
        onChange: k => S.emit(k === 'lobby' ? 'lobby' : k, S.host.lobbyState()) });
      S.host.fillBots();
      let n = 0;
      Promise.all([ensurePeer(), ensureQR()]).then(() => {
        if (S.closed) return;
        let peer; try { peer = new root.Peer(AMU.Net.PEER_PREFIX + code); } catch (e) { S.fail('Online-Verbindung nicht möglich.', true); return; }
        S.peer = peer;
        S.timer = setTimeout(() => S.fail('Keine Verbindung zum Online-Dienst. Bitte Internet prüfen.', true), 15000);
        peer.on('open', () => { clearTimeout(S.timer); S.open = true; S.emit('open', { code, url: shareUrl(code), qr: qrSvg(shareUrl(code)) }); S.emit('lobby', S.host.lobbyState()); });
        peer.on('error', e => {
          if (S.peer !== peer) return;
          if (e && e.type === 'unavailable-id' && tries < 5) { S.cleanup(); S.startHost(tries + 1); return; }
          if (!S.open) S.fail('Online-Verbindung nicht möglich (' + ((e && e.type) || 'Fehler') + ').', true);
        });
        peer.on('disconnected', () => { if (S.peer === peer && !S.closed) { try { peer.reconnect(); } catch (e) { /* neu versuchen geht nicht immer */ } } });
        peer.on('connection', c => {
          const id = 'c' + (++n); S.conns.set(id, c);
          c.on('data', d => { if (S.host && !S.closed) S.host.receive(id, d, Date.now()); });
          const gone = () => { if (S.conns.get(id) === c) { S.conns.delete(id); if (S.host) S.host.drop(id, Date.now()); } };
          c.on('close', gone); c.on('error', gone);
        });
      }, () => S.fail('Online-Modul konnte nicht geladen werden (Internet?).', true));
    },
    // ---------- Gast ----------
    startJoin(code) {
      code = AMU.Net.normCode(code);
      if (!AMU.Net.validCode(code)) { this.fail('Der Code hat ' + AMU.Net.CODE_LEN + ' Zeichen (Buchstaben und Ziffern).', false); return; }
      const S = this; S.code = code;
      S.client = new AMU.Net.Client({ send: m => { if (S.conn && S.conn.open) { try { S.conn.send(JSON.stringify(m)); } catch (e) { /* weg */ } } }, key: store.get('amu-key-' + code),
        on: (k, d) => { if (k === 'welcome') store.set('amu-key-' + code, S.client.key); S.emit(k, d); } });
      ensurePeer().then(() => {
        if (S.closed) return;
        let peer; try { peer = new root.Peer(); } catch (e) { S.fail('Online-Verbindung nicht möglich.', true); return; }
        S.peer = peer;
        S.timer = setTimeout(() => S.fail('Keine Antwort von Raum ' + code + '. Stimmt der Code und läuft der Raum noch?', true), 20000);
        peer.on('error', e => {
          if (S.peer !== peer) return;
          if (e && e.type === 'peer-unavailable') S.fail('Raum ' + code + ' nicht gefunden. Stimmt der Code und läuft der Raum noch?', true);
          else if (!S.conn || !S.conn.open) S.fail('Verbindungsfehler (' + ((e && e.type) || 'unbekannt') + ').', true);
        });
        peer.on('open', () => {
          const c = peer.connect(AMU.Net.PEER_PREFIX + code, { reliable: true }); S.conn = c;
          c.on('open', () => { clearTimeout(S.timer); S.open = true; S.client.hello(S.opts.name, S.opts.look); S.emit('open', { code }); });
          c.on('data', d => { if (S.conn === c) S.client.receive(d); });
          c.on('close', () => { if (S.conn !== c || S.closed) return; S.conn = null; S.emit('lost', { code }); });
        });
      }, () => S.fail('Online-Modul konnte nicht geladen werden (Internet?).', true));
    }
  };

  AMU.Online = {
    shareUrl, qrSvg, ensureQR,
    host(opts) { const s = new Session('host', opts); s.startHost(); return s; },
    join(code, opts) { const s = new Session('client', opts); s.startJoin(code); return s; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
