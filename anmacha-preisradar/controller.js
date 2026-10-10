/* Preisradar – Handy-Pad: beitreten, geheime Gebote/Skala/Teurer-Billiger/Einkaufswagen eingeben, Ergebnis sehen. */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
import { mountInput, card, eur } from './inputs.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', mount = null, key = '', lastSt = null;
  try { name = localStorage.getItem('prName') || ''; } catch (e) {}
  const put = html => { if (mount) { mount.destroy(); mount = null; } root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    key = ''; put(`<h2>Preisradar<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und tritt bei. Deine Gebote bleiben geheim!'}</div><input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><button class="btn green" id="cj">Beitreten</button>`);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('prName', name); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('pr-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000); conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) { if (!m || typeof m !== 'object') return; if (m.t === 'full') return screenJoin(m.msg); if (m.t === 'wel') { put('<div class="info">Verbunden ✓ – du bist Spieler ' + (m.slot + 1) + '. Warte aufs Spiel …</div>'); return; } if (m.t === 'st') render(m); }
  function head(s) { const me = s.players[s.me]; return `<div class="ch"><b>${esc(me.name)}</b><span>${me.total} Pkt</span></div><div class="hs">${esc(s.say)}</div>`; }
  function render(s) {
    lastSt = s; const me = s.me, p = s.players[me], k = s.view + '|' + s.index + '|' + s.phase + '|' + (p.done ? 1 : 0);
    if (s.view === 'end') { put(`${head(s)}<div class="q">${esc(s.say)}</div>` + s.players.map(x => `<div class="pl"><b>${esc(x.name)}</b><span>${x.total} Punkte</span></div>`).join('')); key = k; return; }
    if (s.view !== 'game') { put('<div class="info">Warte aufs Spiel …</div>'); return; }
    if (k === key && s.phase !== 'reveal') { return; }   // laufende Eingabe nicht neu zeichnen
    key = k;
    if (s.phase === 'collect' && !p.done) { const k2 = s.spec.kind, showItems = k2 === 'bid' || k2 === 'dial' || k2 === 'final'; put(`${head(s)}${showItems ? `<div class="stage">${s.spec.items.map(it => card(it, false)).join('')}</div>` : ''}<div id="inbox"></div>`); mount = mountInput($('inbox'), s.spec, { onSubmit: v => { tx({ t: 'ans', v }); } }); }
    else if (s.phase === 'collect') put(`${head(s)}<div class="info">✔ Abgegeben – geheim! Warte auf die anderen …</div>` + s.players.map(x => `<div class="pl"><b>${esc(x.name)}</b><span>${x.done ? '✔' : '…'}</span></div>`).join(''));
    else { const r = s.result; put(`${head(s)}<div class="q">${r ? esc(r.lines[me]) : ''}</div>` + s.players.map((x, i) => `<div class="pl ${i === me ? 'me' : ''}"><b>${esc(x.name)}</b><span>${r ? '+' + r.points[i] : ''} · ${x.total}</span></div>`).join('') + (s.nextReady ? '<button class="btn" id="cn2">Weiter ▶</button>' : '')); const b = $('cn2'); if (b) b.onclick = () => { tx({ t: 'next' }); b.disabled = true; }; }
  }
  addEventListener('pagehide', () => { try { peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
