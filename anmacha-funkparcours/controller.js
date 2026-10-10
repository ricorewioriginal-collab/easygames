/* Funkparcours – Handy-Pad: beitreten, „Bereit" sagen, dann links/rechts/springen/greifen. */
import { JOIN, CDN, peerCfg, loadScript } from './pair.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6'];
export function startController() {
  const root = $('ctl'); let peer = null, conn = null, name = '', key = '', mask = 0;
  try { name = localStorage.getItem('fpPhoneName') || ''; } catch (e) {}
  const put = html => { root.innerHTML = html; }, tx = m => { try { conn && conn.open && conn.send(m); } catch (e) {} };
  const setMask = m => { if (m !== mask) { mask = m; tx({ t: 'in', v: m }); } };
  function screenJoin(msg) {
    key = ''; mask = 0; put(`<h2>Funkparcours<br><small>Handy-Pad · Raum ${esc(JOIN)}</small></h2><div class="info">${msg ? esc(msg) : 'Gib deinen Namen ein und tritt bei. Dann steuerst du deinen Läufer mit diesem Handy.'}</div><input id="cn" maxlength="14" placeholder="Dein Name" value="${esc(name)}" autocomplete="off"><button class="btn green" id="cj">Beitreten</button>`);
    $('cj').onclick = () => { name = ($('cn').value || '').trim().slice(0, 14) || 'Gast'; try { localStorage.setItem('fpPhoneName', name); } catch (e) {} connect(); };
  }
  async function connect() {
    put('<h2>Verbinde …</h2><div class="info">Einen Moment bitte.</div>');
    try { if (!window.Peer) await loadScript(CDN.peer); } catch (e) { return screenJoin('Verbindung nicht möglich (Internet?).'); }
    try { if (peer) peer.destroy(); } catch (e) {} peer = new Peer(undefined, peerCfg());
    peer.on('error', e => screenJoin(e.type === 'peer-unavailable' ? 'Raum ' + JOIN + ' nicht gefunden. Läuft das Spiel noch?' : 'Verbindungsfehler (' + e.type + ').'));
    peer.on('open', () => { conn = peer.connect('fp-' + JOIN, { reliable: true }); const to = setTimeout(() => { if (!conn.open) screenJoin('Keine Antwort vom Spiel. Code richtig?'); }, 9000); conn.on('open', () => { clearTimeout(to); tx({ t: 'join', name }); }); conn.on('data', onData); conn.on('close', () => screenJoin('Verbindung getrennt – tippe auf „Beitreten", um zurückzukehren.')); });
  }
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'full') return screenJoin(m.msg);
    if (m.t === 'wel') { key = 'wel'; put('<div class="info">Verbunden ✓ – du bist Läufer ' + (m.slot + 1) + '. Warte aufs Spiel …</div>'); return; }
    if (m.t === 'st') render(m);
  }
  const head = s => { const p = s.players[s.me]; return p ? `<div class="ch" style="--pc:${CSS[s.me]}"><b>${esc(p.n)}</b><span>${p.p} Pkt</span></div>` : ''; };
  const board = s => s.players.map((p, i) => `<div class="tr ${i === s.me ? 'me' : ''}" style="--pc:${CSS[i]}"><b>${esc(p.n)}</b><span>${p.p} Pkt</span></div>`).join('');
  function render(s) {
    const k = s.view + '|' + s.cur + '|' + s.phase + '|' + s.me; if (k === key) return; key = k; mask = 0;
    if (s.view === 'end') { put(`${head(s)}<div class="hs hint">${esc(s.say || '')}</div><div class="tbl">${(s.order || []).map((i, n) => `<div class="tr ${i === s.me ? 'me' : ''}" style="--pc:${CSS[i]}"><em>${n + 1}.</em><b>${esc(s.players[i].n)}</b><span>${s.players[i].p} Pkt</span></div>`).join('')}</div>`); return; }
    if (s.view !== 'game') { put('<div class="info">Warte aufs Spiel …</div>'); return; }
    if (s.cur !== s.me) { put(`${head(s)}<div class="info">${esc(s.players[s.cur].n)} ist dran – ${esc(s.cname)}</div><div class="tbl">${board(s)}</div>`); return; }
    if (s.phase === 'ready') { put(`${head(s)}<div class="info">Du bist dran: <b>${esc(s.cname)}</b></div><button class="btn green" id="cr" style="min-height:120px;font-size:30px">Bereit!</button>`); $('cr').onclick = () => { tx({ t: 'ready' }); $('cr').disabled = true; }; return; }
    if (s.phase === 'count') { put(`${head(s)}<div class="bigt">3 · 2 · 1</div><div class="info">Halte dich bereit …</div>`); return; }
    if (s.phase === 'run') {
      put(`<div class="cpad"><div class="pg"><button data-b="1" aria-label="links">◀</button><button data-b="2" aria-label="rechts">▶</button></div><div class="pg"><button data-b="8" aria-label="greifen">✊</button><button data-b="4" class="big" aria-label="springen">⤒</button></div></div>`);
      const act = new Map(); root.querySelectorAll('.cpad button').forEach(b => {
        const bit = +b.dataset.b, rel = () => { if (act.has(bit)) { act.delete(bit); b.classList.remove('on'); setMask([...act.keys()].reduce((a, x) => a | x, 0)); } };
        b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} act.set(bit, 1); b.classList.add('on'); setMask([...act.keys()].reduce((a, x) => a | x, 0)); });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, rel));
      }); return;
    }
    put(`${head(s)}<div class="bigt">${esc(s.say || '')}</div><div class="tbl">${board(s)}</div>`);
  }
  addEventListener('pagehide', () => { try { setMask(0); peer && peer.destroy(); } catch (e) {} });
  screenJoin();
}
