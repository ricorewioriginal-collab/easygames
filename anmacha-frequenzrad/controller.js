/* Frequenzrad – Handy-Pad: Name eingeben, beitreten, dann drehen, Buchstaben tippen, Vokale kaufen, lösen. */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
const $ = id => document.getElementById(id), esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const KEYS = [...'QWERTZUIOPÜ', ...'ASDFGHJKLÖÄ', ...'YXCVBNM'], VOW = new Set([...'AEIOUÄÖÜ']);
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', solving = false, lastSt = null;
  try { name = localStorage.getItem('frName') || ''; } catch (e) {}
  const put = html => { root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    put(`<h2>Frequenzrad<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und tritt bei.'}</div><input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><button class="btn green" id="cj">Beitreten</button>`);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('frName', name); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('fr-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000); conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) { if (!m || typeof m !== 'object') return; if (m.t === 'full') return screenJoin(m.msg); if (m.t === 'wel') { put('<div class="info">Verbunden ✓ – du bist Spieler ' + (m.slot + 1) + '. Warte aufs Spiel …</div>'); return; } if (m.t === 'st') render(m); }
  function render(s) {
    lastSt = s; const me = s.me, mine = s.players[me], myTurn = s.turn === me && s.accept;
    const rows = s.board.map(r => `<div class="br">${[...r].map(ch => `<i class="${ch === ' ' ? 'sp' : ch === '·' ? 'hid' : 'on'}">${ch === ' ' || ch === '·' ? '' : esc(ch)}</i>`).join('')}</div>`).join('');
    const ps = s.players.map((p, i) => `<div class="pl ${i === s.turn ? 'act' : ''} ${i === me ? 'me' : ''}"><b>${esc(p.name)}</b><span>${p.total}</span><small>Runde ${p.round}</small></div>`).join('');
    let act = '';
    if (s.view === 'end') act = `<div class="q">${esc(s.say)}</div>`;
    else if (s.next) act = '<button class="btn" data-a="next">Weiter ▶</button>';
    else if (myTurn && solving) act = `<form id="sform" autocomplete="off"><input id="sinp" maxlength="60" placeholder="Die Lösung …" autocomplete="off" autocapitalize="characters" spellcheck="false"><div class="row2"><button class="btn green" type="submit">Lösen</button><button class="btn ghost" id="sno" type="button">Zurück</button></div></form>`;
    else if (myTurn && (s.phase === 'consonant' || s.phase === 'vowel' || s.phase === 'vowelFree')) { const vow = s.phase !== 'consonant', used = new Set(s.used); act = `<div class="hs">${vow ? (s.phase === 'vowelFree' ? 'Gratis-Vokal: wähle einen Vokal' : 'Wähle einen Vokal (' + s.vowelCost + ' Punkte)') : `Wähle einen Konsonanten · ${s.val} pro Buchstabe`}</div><div class="kb">${KEYS.map(k => `<button data-k="${k}" ${VOW.has(k) !== vow || used.has(k) ? 'disabled' : ''}>${k}</button>`).join('')}</div>`; }
    else if (myTurn) act = `<div class="row2"><button class="btn green" data-a="spin">🎡 Drehen</button></div><div class="row2">${s.canBuy ? `<button class="btn blue" data-a="buy">🅰 Vokal kaufen (${s.vowelCost})</button>` : ''}<button class="btn ghost" data-a="solve">💬 Lösen</button></div>`;
    else act = `<div class="info">${esc(s.players[s.turn].name)} ist dran …</div>`;
    put(`<div class="ch"><b>${esc(mine.name)}</b><span>${mine.total} Pkt · Runde ${mine.round}</span></div><div class="q"><small>${esc(s.cat)}</small></div><div class="bd">${rows}</div><div class="hs">${esc(s.say)}</div>${act}<div class="pls">${ps}</div>`);
    root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a; if (a === 'solve') { solving = true; render(lastSt); return; } tx({ t: a }); b.disabled = true; });
    root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { tx({ t: 'letter', ch: b.dataset.k }); root.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; }); });
    const f = $('sform'); if (f) { setTimeout(() => { const i = $('sinp'); if (i) i.focus(); }, 30); f.onsubmit = e => { e.preventDefault(); solving = false; tx({ t: 'solve', text: $('sinp').value }); }; $('sno').onclick = () => { solving = false; render(lastSt); }; }
    if (!myTurn) solving = false;
  }
  addEventListener('pagehide', () => { try { peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
