/* Hörerwahl – Handy-Controller: per Code/QR beitreten, Team wählen, Antworten eintippen, Spielen/Weitergeben und Weiter tippen. */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
const $ = id => document.getElementById(id), esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', team = 0, last = null, myTeam = 0;
  try { name = localStorage.getItem('hwName') || ''; team = +localStorage.getItem('hwTeam') === 1 ? 1 : 0; } catch (e) {}
  const put = html => { root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  function screenJoin(msg) {
    put(`<h2>Hörerwahl<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und wähle dein Team.'}</div>
      <input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><div class="seg" id="ct"><button data-v="0" class="${team === 0 ? 'on' : ''}">Team 1</button><button data-v="1" class="${team === 1 ? 'on' : ''}">Team 2</button></div>
      <button class="btn green" id="cj">Beitreten</button>`);
    $('ct').querySelectorAll('button').forEach(b => b.onclick = () => { team = +b.dataset.v; $('ct').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('hwName', name); localStorage.setItem('hwTeam', team); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('hw-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000);
      conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name, team }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'full') { screenJoin(m.msg); return; }
    if (m.t === 'wel') { myTeam = m.team; last = null; put('<div class="info">Verbunden ✓ – warte aufs Spiel …</div>'); return; }
    if (m.t === 'st') render(m);
  }
  const dots = n => '✕'.repeat(n) + '<span class="dim">' + '✕'.repeat(Math.max(0, 3 - n)) + '</span>';
  function render(s) {
    myTeam = s.me; const n = s.names, mine = n[s.me], turnName = n[s.turn];
    let body = '';
    if (s.view === 'finale') {
      body = `<div class="q">⭐ Finale: ${esc(s.fin.q)}</div><div class="info">${s.fin.total} / ${s.fin.goal} Punkte · Frage ${Math.min(s.fin.i + 1, s.fin.count)}/${s.fin.count}</div>` + (s.fin.team === s.me ? (s.fin.accept ? ask('Schnell – deine Antwort!', 'fans') : s.fin.start ? '<button class="btn" data-a="next">Los!</button>' : '<div class="info">Gleich geht’s los …</div>') : `<div class="info">${esc(n[s.fin.team])} spielt das Finale.</div>`);
    } else if (s.view === 'end') body = `<div class="q">${esc(s.say)}</div><div class="info">${esc(n[0])} ${s.scores[0]} : ${s.scores[1]} ${esc(n[1])}</div>`;
    else if (s.view === 'game') {
      const bd = s.board.map((b, i) => `<div class="bi ${b ? 'on' : ''}"><span>${i + 1}</span>${b ? `<b>${esc(b.t)}</b><i>${b.p}</i>` : '<b>• • •</b>'}</div>`).join('');
      body = `<div class="q"><small>${esc(s.cat)}</small>${esc(s.q)}</div><div class="bd">${bd}</div><div class="bk">Bank <b>${s.bank}</b>${s.mult > 1 ? ' ×' + s.mult : ''} · <span class="x">${dots(s.strikes)}</span></div><div class="hs">${esc(s.say)}</div>`;
      if (s.choose && s.control === s.me) body += `<div class="row2"><button class="btn green" data-a="play">▶ Wir spielen</button><button class="btn blue" data-a="give">↪ Weitergeben</button></div>`;
      else if (s.next) body += `<button class="btn" data-a="next">${esc(s.nextLabel || 'Weiter ▶')}</button>`;
      else if (s.accept && s.turn === s.me) body += ask(s.phase === 'steal' ? 'Klauen! Eine Antwort …' : 'Deine Antwort …', 'ans');
      else body += `<div class="info">${s.accept ? esc(turnName) + ' antwortet …' : '…'}</div>`;
    } else body = '<div class="info">Warte aufs Spiel …</div>';
    put(`<div class="ch"><b>${esc(mine)}</b><span>${s.scores[s.me]} Pkt</span></div>${body}`);
    const inp = $('cinp'); if (inp) { inp.onkeydown = null; $('cform').onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; tx({ t: inp.dataset.k, text: v }); }; if (s.accept || (s.fin && s.fin.accept)) setTimeout(() => inp.focus(), 30); const ps = $('cpass'); if (ps) ps.onclick = () => tx({ t: 'ans', text: '' }); }
    root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a; tx(a === 'next' ? { t: 'next' } : { t: 'choose', play: a === 'play' }); b.disabled = true; });
  }
  const ask = (ph, k) => `<form id="cform" autocomplete="off"><input id="cinp" data-k="${k}" maxlength="40" placeholder="${esc(ph)}" enterkeyhint="send" autocomplete="off" autocapitalize="sentences" spellcheck="false"><div class="row2"><button class="btn" type="submit">Antworten</button>${k === 'ans' ? '<button class="btn ghost" id="cpass" type="button">🤷 Weiß nicht</button>' : ''}</div></form>`;
  addEventListener('pagehide', () => { try { peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
