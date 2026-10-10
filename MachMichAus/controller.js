/* Mach mich aus! – Handy-Pad: beitreten, dann private Entscheidungen (Lampe, Quiz, Talent, Joker, Wahl). */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
import { renderAsk, candCard, esc, av } from './panel.js';
import { look } from './avatars.js';
const $ = id => document.getElementById(id), CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6'];
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', cur = null, curId = 0;
  try { name = localStorage.getItem('mmPhoneName') || ''; } catch (e) {}
  const put = html => { if (cur) { cur.destroy(); cur = null; } curId = 0; root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    put(`<h2>Mach mich aus!<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und tritt bei. Deine Entscheidungen bleiben auf diesem Handy privat!'}</div><input type="text" id="cn" maxlength="9" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><button class="btn green" id="cj">Beitreten</button>`);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 9) || 'Gast'; try { localStorage.setItem('mmPhoneName', name); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('mm-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000); conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'full') return screenJoin(m.msg);
    if (m.t === 'wel') { put('<div class="info">Verbunden ✓ – du bist Mensch ' + (m.slot + 1) + '. Warte aufs Spiel …</div>'); return; }
    if (m.t === 'st') render(m);
  }
  function render(s) {
    if (s.view === 'menu' || !s.cand) { if (!/Warte aufs Spiel/.test(root.textContent)) put('<div class="info">Warte aufs Spiel …</div>'); return; }
    const me = s.totals && s.totals[s.me] ? s.totals[s.me] : { n: name, s: 0 }, ml = look({ n: me.n, g: 'd' }, s.me), head = `<div class="ch" style="--pc:${CSS[s.me % 4]}">${av({ look: ml }, 36)}<b>${esc(me.n)}</b><span>Runde ${s.round}/${s.rounds} · 💡 ${s.on} · ${me.s} Pkt</span></div>`;
    const cand = Object.assign({}, s.cand); const ask = s.asks && s.asks[s.me];
    if (ask) {
      if (ask.id === curId) return; put(`${head}${candCard(cand, cand.rev)}<div id="ca"></div>`); curId = ask.id;
      cur = renderAsk($('ca'), ask, v => { tx({ t: 'ans', v }); if (cur) { cur.destroy(); cur = null; } $('ca').innerHTML = '<div class="info">✔ Abgegeben – die Show läuft weiter …</div>'; }); return;
    }
    const key = 'w' + s.round + '|' + s.on + '|' + (s.say || '').length + '|' + JSON.stringify(s.cand.rev).length + '|' + (s.totals || []).map(t => t.s).join(',');
    if (root.dataset.k === key && !cur) return; root.dataset.k = key;
    put(`${head}${candCard(cand, cand.rev)}<div class="info">${esc(s.say || '📺 Die Show läuft – schau auf den großen Bildschirm.')}</div>${(s.tick || []).map(t => `<div class="tl">${esc(t)}</div>`).join('')}`);
  }
  addEventListener('pagehide', () => { try { peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
