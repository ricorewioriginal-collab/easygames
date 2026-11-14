#!/usr/bin/env node
// Brücke TikTok LIVE → easygames-Stream-Overlay (stream.html?game=<id>&tiktok=1). Läuft auf dem Stream-PC.
//
//   npm i tiktok-live-connector               einmalig im Ordner dieses Skripts (github.com/zerodytrash/TikTok-Live-Connector, liest den LIVE ohne Anmeldung)
//   node tools/tiktok-bridge.mjs DEIN_NAME    verbindet sich mit deinem LIVE, sobald du live bist (versucht es alle 30 s)
//   node tools/tiktok-bridge.mjs --demo       Test ohne TikTok: zufällige Kommentare, Geschenke und Likes
//   Optionen: --port 21213  --config <datei> (Standard: tiktok-config.json neben diesem Skript)
//
// Stellt ws://127.0.0.1:<port> bereit (nur dieser Rechner). Nachrichten an das Overlay: {type:'event', ev}, {type:'config', config},
// {type:'status', msg}. Vom Overlay: {type:'getConfig'}, {type:'setConfig', config}, {type:'inject', ev} (Test).
// Ereignis-Format: {type:'chat'|'gift'|'like'|'follow'|'share'|'sub'|'join', user, text, gift, giftId, count, diamonds}
// Ohne Zusatzpakete (eigener kleiner WebSocket-Server); nur der Live-Modus braucht tiktok-live-connector.
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const PORT = +opt('--port', 21213);
const CONFIG = path.resolve(opt('--config', path.join(path.dirname(fileURLToPath(import.meta.url)), 'tiktok-config.json')));
const USER = argv.find((a, i) => !a.startsWith('--') && !['--port', '--config'].includes(argv[i - 1]));
const DEMO = argv.includes('--demo'), TEST = argv.includes('--test');   // --test: keine Quelle, nur inject (für tools/test-stream-tiktok.cjs)

// ---------- kleiner WebSocket-Server (RFC 6455, nur Text) ----------
const clients = new Set();
function frame(text) {
  const p = Buffer.from(text), n = p.length;
  const h = n < 126 ? Buffer.from([0x81, n]) : n < 65536 ? Buffer.from([0x81, 126, n >> 8, n & 255]) : Buffer.concat([Buffer.from([0x81, 127, 0, 0, 0, 0]), Buffer.from([n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255])]);
  return Buffer.concat([h, p]);
}
function send(sock, obj) { try { sock.write(frame(JSON.stringify(obj))); } catch (e) { } }
function broadcast(obj) { for (const c of clients) send(c, obj); }
function onMessage(sock, text) {
  let m; try { m = JSON.parse(text); } catch (e) { return; }
  if (m.type === 'getConfig') { const c = readConfig(); if (c) send(sock, { type: 'config', config: c }); send(sock, { type: 'status', msg: status }); if (gifts.length) send(sock, { type: 'gifts', list: gifts }); }
  else if (m.type === 'setConfig' && m.config && typeof m.config === 'object' && JSON.stringify(m.config).length < 200000) {
    fs.writeFileSync(CONFIG, JSON.stringify(m.config, null, 1)); broadcast({ type: 'config', config: m.config }); log('Belegung gespeichert: ' + CONFIG);
  }
  else if (m.type === 'inject' && m.ev) emit(m.ev);
}
const server = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/plain; charset=utf-8'); r.end('easygames TikTok-Brücke läuft. ' + status + '\n'); });
server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) return sock.destroy();
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  clients.add(sock);
  let buf = Buffer.alloc(0);
  sock.on('data', d => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= 2) {
      const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      const need = off + (masked ? 4 : 0) + len; if (buf.length < need) return;
      let data = buf.subarray(off + (masked ? 4 : 0), need);
      if (masked) { const k = buf.subarray(off, off + 4); data = Buffer.from(data.map((b, i) => b ^ k[i & 3])); }
      buf = buf.subarray(need);
      if (op === 8) { sock.end(); return; }
      if (op === 9) { sock.write(Buffer.concat([Buffer.from([0x8a, data.length]), data])); continue; }
      if (op === 1) onMessage(sock, data.toString('utf8'));
    }
  });
  const drop = () => clients.delete(sock);
  sock.on('close', drop); sock.on('error', drop);
});

// ---------- Ereignisse ----------
let gifts = [];   // aktuelle Geschenke-Liste von TikTok (Name, Diamanten, Bild) für die Einstellungen
let status = DEMO ? 'Demo-Modus' : TEST ? 'Testmodus' : 'Warte auf LIVE von @' + USER;
const log = s => console.log(new Date().toLocaleTimeString('de-DE') + '  ' + s);
function readConfig() { try { return JSON.parse(fs.readFileSync(CONFIG, 'utf8')); } catch (e) { return null; } }
function emit(ev) { broadcast({ type: 'event', ev }); log(ev.type + '  ' + (ev.user || '') + '  ' + (ev.text || ev.gift || ev.count || '')); }
function setStatus(s) { status = s; log(s); broadcast({ type: 'status', msg: s }); }

// tiktok-live-connector: Felder je nach Version – 1.x (comment, likeCount, giftDetails.giftType, uniqueId) und 2.x (Protokoll v3:
// content, count, gift.type/name/diamondCount, user.nickname/displayId). Beides wird hier auf dasselbe Ereignis gebracht.
const who = d => { const u = d.user || d; return u.nickname || u.uniqueId || u.displayId || 'Jemand'; };
const chatText = d => String(d.comment ?? d.content ?? '');
const likeCount = d => Math.max(1, Number(d.likeCount ?? d.count ?? 1) || 1);
function giftOf(d) {
  const g = d.giftDetails || d.gift || {};
  return { name: d.giftName || g.giftName || g.name || '', id: d.giftId || g.id, type: Number(d.giftType ?? g.giftType ?? g.type ?? 0),
    diamonds: Number(d.diamondCount || g.diamondCount || g.diamond_count || 0), count: Math.max(1, Number(d.repeatCount || d.comboCount || 1) || 1), end: !!Number(d.repeatEnd) || d.repeatEnd === true };
}
async function live(name) {
  // https://github.com/zerodytrash/TikTok-Live-Connector (ESM): im Ordner dieses Skripts installieren
  let lib;
  try { lib = await import('tiktok-live-connector'); } catch (e) {
    console.error('Bitte zuerst im Ordner ' + path.dirname(fileURLToPath(import.meta.url)) + ' ausführen:  npm i tiktok-live-connector'); process.exit(2);
  }
  const Conn = lib.TikTokLiveConnection || lib.WebcastPushConnection;
  const c = new Conn(name.replace(/^@/, ''), { processInitialData: false, enableExtendedGiftInfo: false });   // 2.x verlangt das Einstellungsobjekt; alte Nachrichten beim Verbinden nicht als neue Ereignisse zählen
  c.on('chat', d => { const t = chatText(d).trim(); if (t) emit({ type: 'chat', user: who(d), text: t }); });
  c.on('gift', d => {
    const g = giftOf(d);
    if (g.type === 1 && !g.end) return;   // Serien-Geschenk (Combo): erst am Ende einmal mit der Anzahl zählen
    emit({ type: 'gift', user: who(d), gift: g.name, giftId: g.id, count: g.count, diamonds: g.diamonds });
  });
  c.on('like', d => emit({ type: 'like', user: who(d), count: likeCount(d) }));
  c.on('follow', d => emit({ type: 'follow', user: who(d) }));
  c.on('share', d => emit({ type: 'share', user: who(d) }));
  c.on('subscribe', d => emit({ type: 'sub', user: who(d) }));   // 1.x
  c.on('subNotify', d => emit({ type: 'sub', user: who(d) }));   // 2.x
  c.on('member', d => emit({ type: 'join', user: who(d) }));
  const loadGifts = () => Promise.resolve((c.fetchAvailableGifts || c.getAvailableGifts || (() => []))).then(f => f.call(c)).then(list => {
    gifts = (Array.isArray(list) ? list : []).map(g => ({ name: g.name || g.giftName, diamonds: g.diamond_count || g.diamondCount || 0, img: ((g.image && (g.image.url_list || g.image.urlList)) || [])[0] || '' }))
      .filter(g => g.name).sort((a, b) => a.diamonds - b.diamonds);
    if (gifts.length) { broadcast({ type: 'gifts', list: gifts }); log(gifts.length + ' Geschenke von TikTok geladen'); }
  }).catch(() => {});
  const go = () => c.connect().then(() => { setStatus('Verbunden mit dem LIVE von @' + name); loadGifts(); }).catch(e => { setStatus('Noch nicht live oder nicht erreichbar (' + (e && e.message || e) + ') – neuer Versuch in 30 s'); setTimeout(go, 30000); });
  c.on('disconnected', () => { setStatus('LIVE getrennt – neuer Versuch in 30 s'); setTimeout(go, 30000); });
  c.on('streamEnd', () => setStatus('LIVE beendet'));
  go();
}
function demo() {
  const names = ['Mia', 'Leon', 'Ben', 'Emma', 'Noah', 'Lina'], words = ['links', 'rechts', 'hoch', 'runter', 'a', 'spring', 'hallo'];
  const gifts = [['Rose', 1], ['Rose', 5], ['Finger Heart', 1], ['Galaxy', 1]];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  setInterval(() => {
    const r = Math.random(), u = pick(names);
    if (r < 0.6) emit({ type: 'chat', user: u, text: pick(words) });
    else if (r < 0.75) emit({ type: 'like', user: u, count: 15 });
    else if (r < 0.8) emit({ type: pick(['follow', 'share', 'join']), user: u });
    else { const g = pick(gifts); if (g[0] !== 'Galaxy' || Math.random() < 0.2) emit({ type: 'gift', user: u, gift: g[0], count: g[1] }); }
  }, 1500);
}

if (!DEMO && !TEST && !USER) { console.error('Aufruf: node tools/tiktok-bridge.mjs DEIN_TIKTOK_NAME   oder   --demo'); process.exit(2); }
server.listen(PORT, '127.0.0.1', () => {
  log('Brücke bereit: ws://127.0.0.1:' + PORT + '  ·  Belegung: ' + CONFIG);
  log('Overlay: stream.html?game=<spiel>&tiktok=1   ·   Einstellungen: …&tiktok=1&setup=1');
  if (DEMO) demo(); else if (!TEST) live(USER);
});
