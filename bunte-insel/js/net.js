'use strict';
/* Bunte Insel – Mitspielen: Geräte verbinden sich direkt (WebRTC über PeerJS), Kopplung per kurzem Code oder QR-Code.
   Es werden nur Position, Fahrzeug und kleine Gesten gesendet (10x pro Sekunde) – die Welt ist auf allen Geräten gleich.
   Die Bibliotheken werden erst geladen, wenn jemand „Mitspielen“ wählt (kein Mehrverbrauch fürs normale Spiel).
   Aufbau: Host-Gerät hält die Verbindungen und leitet Nachrichten an die anderen weiter (bis zu 4 Spieler). */
BI.createNet = function (cb) {
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'bunteinsel-', MAX = 3;
  const N = { role: '', code: '', id: '', peer: null, conns: new Map(), busy: false, names: {} };
  const libs = {};
  const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
  N.loadPeer = () => load('https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', () => !!window.Peer);
  N.loadQR = () => load('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', () => !!window.qrcode);
  const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
  N.normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '').replace(/I/g, '').replace(/L/g, '').replace(/[01]/g, '').slice(0, 4);
  N.connected = () => N.conns.size > 0;
  N.count = () => N.conns.size + 1;
  N.link = () => location.href.split('#')[0] + '#join=' + N.code;

  function handle(from, d) {
    if (!d || typeof d !== 'object') return;
    if (N.role === 'host' || !d.id) d.id = from;
    if (N.role === 'host') for (const [id, c] of N.conns) if (id !== from && c.open) { try { c.send(d); } catch (e) { } }
    cb.onMsg(d);
  }
  function reg(conn, onOpen) {
    conn.on('open', () => {
      if (N.role === 'host' && N.conns.size >= MAX) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
      N.conns.set(conn.peer, conn); cb.onJoin(conn.peer); if (onOpen) onOpen();
    });
    conn.on('data', d => handle(conn.peer, d));
    const gone = () => { if (!N.conns.delete(conn.peer)) return; cb.onLeave(conn.peer); if (N.role === 'host') for (const [, c] of N.conns) { try { c.send({ t: 'bye', id: conn.peer }); } catch (e) { } } if (N.role === 'guest') { N.close(true); cb.onClosed && cb.onClosed(); } };
    conn.on('close', gone); conn.on('error', gone);
  }
  N.host = async function () {
    if (N.busy) return; N.busy = true; N.close(true);
    try {
      await N.loadPeer();
      for (let k = 0; k < 6; k++) {
        const code = mkCode(); const ok = await new Promise(res => {
          const p = new Peer(PRE + code); let done = false;
          p.on('open', id => { done = true; N.peer = p; N.code = code; N.id = id; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } else cb.onStatus('Verbindung wackelt …'); });
        });
        if (ok === true) break; if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', reg); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      N.busy = false; return N.code;
    } catch (e) { N.busy = false; N.close(true); throw e; }
  };
  N.join = async function (code) {
    if (N.busy) return; code = N.normCode(code); if (code.length !== 4) throw new Error('code'); N.busy = true; N.close(true);
    try {
      await N.loadPeer();
      await new Promise((res, rej) => {
        const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); else cb.onStatus('Verbindung wackelt …'); });
        p.on('open', id => {
          N.peer = p; N.id = id; N.role = 'guest'; N.code = code; const c = p.connect(PRE + code, { reliable: true });
          reg(c, () => { if (done) return; done = true; res(); });
        });
      });
      N.busy = false;
    } catch (e) { N.busy = false; N.close(true); throw e; }
  };
  N.send = function (d) { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
  N.close = function (quiet) {
    const had = N.conns.size; for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear();
    if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; N.id = ''; if (!quiet || had) cb.onClosed && cb.onClosed();
  };
  return N;
};
