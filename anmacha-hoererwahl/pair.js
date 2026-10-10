/* Hörerwahl – Handy-Kopplung (PeerJS über WebRTC): Das Spiel am großen Bildschirm ist der Gastgeber, Handys sind Antwort-Pads für Team 1 oder Team 2.
   Nachrichten Handy → Spiel: {t:'join',name,team} {t:'ans',text} {t:'choose',play} {t:'next'} {t:'fans',text}
   Spiel → Handy: {t:'wel',team,names} {t:'full',msg} {t:'st', …Momentaufnahme} */
export const CDN = { peer: 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', qr: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js' };
const qp = new URLSearchParams(location.search);
export const JOIN = (qp.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), PH = qp.get('ph') || '';
export const peerCfg = () => { if (!PH) return {}; const [h, p] = PH.split(':'); return { host: h, port: +p || 9000, path: '/', secure: false }; };
export const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen: ' + src)); document.head.appendChild(s); });
export const MAX_PER_TEAM = 3;
const $ = id => document.getElementById(id), esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const randCode = n => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);

/** h: {names():[a,b], onMessage(team, msg), onChange(), snapshot()} */
export function initPair(h) {
  let peer = null, room = ''; const phones = new Map(); let timer = 0;   // conn → {name, team}
  const send = (c, m) => { try { if (c && c.open) c.send(m); } catch (e) {} };
  const list = () => [...phones.values()];
  const count = team => list().filter(p => p.team === team).length;
  function push() { clearTimeout(timer); timer = setTimeout(() => { if (!phones.size) return; const s = Object.assign({ t: 'st' }, h.snapshot()); phones.forEach((p, c) => send(c, Object.assign({}, s, { me: p.team }))); }, 40); }
  function renderList() { const el = $('pairList'); if (!el) return; const n = h.names(); el.innerHTML = list().length ? [0, 1].map(t => `<div>📱 <b>${esc(n[t])}</b>: ${list().filter(p => p.team === t).map(p => esc(p.name)).join(', ') || '–'}</div>`).join('') : 'Noch kein Handy verbunden.'; }
  async function open() {
    $('pair').hidden = false;
    if (!peer) { $('code').textContent = '….'; $('pairUrl').textContent = 'Verbinde …'; try { await Promise.all([window.Peer || loadScript(CDN.peer), window.qrcode || loadScript(CDN.qr)]); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich (Internet?)'; return; } create(); } else show();
  }
  function create() {
    room = randCode(4); try { peer = new Peer('hw-' + room, peerCfg()); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich'; return; }
    peer.on('open', show);
    peer.on('error', e => { if (e.type === 'unavailable-id') { try { peer.destroy(); } catch (x) {} peer = null; create(); } else $('pairUrl').textContent = 'Verbindung zum Koppel-Server nicht möglich (' + e.type + ')'; });
    peer.on('connection', c => { c.on('data', m => onData(c, m)); c.on('close', () => gone(c)); c.on('error', () => gone(c)); });
  }
  const url = () => location.href.split('#')[0].split('?')[0] + '?join=' + room + (PH ? '&ph=' + encodeURIComponent(PH) : '');
  function show() { $('code').textContent = room; const u = url(); $('pairUrl').textContent = u; try { const q = qrcode(0, 'M'); q.addData(u); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').innerHTML = ''; } renderList(); }
  function onData(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      const team = m.team === 1 ? 1 : 0; if (count(team) >= MAX_PER_TEAM && !phones.has(c)) return send(c, { t: 'full', msg: `Für ${h.names()[team]} sind schon ${MAX_PER_TEAM} Handys verbunden.` });
      phones.set(c, { name: clean(m.name, 14) || 'Gast', team }); send(c, { t: 'wel', team, names: h.names() }); renderList(); h.onChange(); push(); return;
    }
    const p = phones.get(c); if (!p) return;   // nur angemeldete Handys
    h.onMessage(p.team, { t: String(m.t || ''), text: clean(m.text, 40), play: !!m.play });
  }
  function gone(c) { if (phones.delete(c)) { renderList(); h.onChange(); } }
  $('bPairOk').onclick = () => { $('pair').hidden = true; };
  return { open, push, count, phones: list, get room() { return room; } };
}
