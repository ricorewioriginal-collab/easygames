/* Funkhaus – Handy-Pad: beitreten, privat planen, nominieren und die Wochenaufgabe spielen. */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
import { renderAsk, starsTxt, av } from './panel.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6', '#ff9a1f', '#00c46a', '#ff5252', '#4f7cff'];
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', cur = null, curId = 0;
  try { name = localStorage.getItem('fhPhoneName') || ''; } catch (e) {}
  const put = html => { if (cur) { cur.destroy(); cur = null; } curId = 0; root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    put(`<h2>Funkhaus<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und tritt bei. Dein Tagesplan und deine Nominierung bleiben auf diesem Handy geheim!'}</div><input type="text" id="cn" maxlength="9" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><button class="btn green" id="cj">Beitreten</button>`);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 9) || 'Gast'; try { localStorage.setItem('fhPhoneName', name); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('fh-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000); conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'full') return screenJoin(m.msg);
    if (m.t === 'wel') { put('<div class="info">Verbunden ✓ – du bist Mensch ' + (m.slot + 1) + '. Warte aufs Spiel …</div>'); return; }
    if (m.t === 'st') render(m);
  }
  const head = s => { const c = s.pub && s.pub.cast[s.me]; return c ? `<div class="ch" style="--pc:${CSS[s.me % 8]}">${av(c, 36)}<b>${esc(c.n)}</b><span>${starsTxt(c.stars)}${c.immune ? ' 🛡️' : ''}</span></div>` : ''; };
  function render(s) {
    if (s.view === 'menu' || !s.pub) { if (!/Warte aufs Spiel/.test(root.textContent)) put('<div class="info">Warte aufs Spiel …</div>'); return; }
    const ask = s.asks && s.asks[s.me];
    if (ask) {
      if (ask.id === curId) return; const keep = root.querySelector('#ca') ? 1 : 0; put(`${head(s)}<div id="ca"></div>`); curId = ask.id;
      cur = renderAsk($('ca'), ask, s.pub, v => { tx({ t: 'ans', v }); if (cur) { cur.destroy(); cur = null; } $('ca').innerHTML = '<div class="info">✔ Abgegeben – warte auf die anderen …</div>'; }); return;
    }
    const key = 'w' + s.pub.week + '|' + s.pub.phase + '|' + s.pub.day + '|' + (s.say || '').length + '|' + s.pub.cast.map(c => (c.alive ? 1 : 0) + '' + c.stars + (c.nom ? 'n' : '')).join('');
    if (root.dataset.k === key && !cur) return; root.dataset.k = key;
    put(`${head(s)}<div class="info">${esc(s.say || '📺 Das Haus läuft … schau auf den großen Bildschirm.')}</div><div style="display:flex;gap:6px;overflow:auto">${s.pub.cast.map(c => `<div class="cc ${c.alive ? '' : 'out'} ${c.nom ? 'nom' : ''}">${av(c, 38)}<span class="nm">${esc(c.n)}</span><em>${starsTxt(c.stars)}</em></div>`).join('')}</div>${(s.tick || []).map(t => `<div class="tl">${esc(t)}</div>`).join('')}`);
  }
  addEventListener('pagehide', () => { try { peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
