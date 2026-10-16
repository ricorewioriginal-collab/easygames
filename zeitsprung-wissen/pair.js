// ZEITSPRUNG WISSEN: PeerJS/WebRTC-Kopplung. Die PIN bleibt nur auf dem TV sichtbar.
const params = new URLSearchParams(location.search);
export const JOIN_CODE = (params.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
export const IS_CONTROLLER = params.has('controller') || params.has('join');
const $ = id => document.getElementById(id);
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const roomCode = () => 'WR' + Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
const pinCode = () => String(Math.floor(1000 + Math.random() * 9000));
const load = (src, globalName) => new Promise((resolve, reject) => {
  if (window[globalName]) return resolve();
  const script = document.createElement('script'); script.src = src;
  script.onload = resolve; script.onerror = () => reject(new Error(`${src} konnte nicht geladen werden`));
  document.head.append(script);
});
const peerLibrary = () => load('../vendor/peerjs-1.5.4.min.js', 'Peer');
const qrLibrary = () => load('../vendor/qrcode-generator-1.4.4.js', 'qrcode');
const cleanName = name => String(name || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 22) || 'Gast';

export function startHost(handlers) {
  let peer = null, code = '', pin = '';
  const clients = new Map(); // data connection → Spielerindex
  const send = (connection, message) => { try { if (connection.open) connection.send(message); } catch (_) {} };
  const url = () => `${location.origin}${location.pathname}?join=${code}`;

  function showStatus(message) { $('pairStatus').textContent = message; }
  function render() {
    $('roomCode').textContent = code || '…'; $('roomPin').textContent = pin || '••••';
    $('pairLink').textContent = code ? url() : 'Verbindung wird aufgebaut …';
    $('pairLink').href = code ? url() : '#';
    $('pairMembers').textContent = clients.size ? `${clients.size} Handy${clients.size === 1 ? '' : 's'} verbunden` : 'Noch kein Handy verbunden';
    if (code && window.qrcode) {
      try { const qr = window.qrcode(0, 'M'); qr.addData(url()); qr.make(); $('pairQr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true }); }
      catch (_) { $('pairQr').textContent = 'QR-Code nicht verfügbar'; }
    }
  }
  function closeConnection(connection) {
    const slot = clients.get(connection);
    if (slot === undefined) return;
    clients.delete(connection); handlers.onLeave(slot); render(); broadcast();
  }
  function receive(connection, message) {
    if (!message || typeof message !== 'object') return;
    if (message.t === 'join') {
      if (clients.has(connection)) return;
      if (String(message.pin || '') !== pin) { send(connection, { t: 'error', message: 'PIN falsch. Bitte am Fernseher nachsehen.' }); return; }
      const slot = handlers.allocate(cleanName(message.name));
      if (slot < 0) { send(connection, { t: 'error', message: 'Alle vier Plätze sind belegt.' }); return; }
      clients.set(connection, slot); send(connection, { t: 'welcome', slot }); render(); broadcast(); return;
    }
    const slot = clients.get(connection);
    if (slot === undefined) return;
    if (message.t === 'answer' && Number.isInteger(message.position)) handlers.onAnswer(slot, message.position);
    if (message.t === 'choice' && Number.isInteger(message.choice)) handlers.onChoice(slot, message.choice);
    if (message.t === 'play') handlers.onPlay(slot);
    if (message.t === 'source') handlers.onSource(slot);
    if (message.t === 'next') handlers.onNext(slot);
  }
  function create() {
    code = roomCode(); pin = pinCode(); render();
    try { peer = new window.Peer(`zw-${code.toLowerCase()}`); }
    catch (_) { showStatus('WebRTC konnte nicht starten.'); return; }
    peer.on('open', () => { showStatus('Raum bereit. Code und PIN auf dem Handy eingeben.'); render(); });
    peer.on('connection', connection => {
      connection.on('data', message => receive(connection, message));
      connection.on('close', () => closeConnection(connection));
      connection.on('error', () => closeConnection(connection));
    });
    peer.on('error', error => {
      if (error.type === 'unavailable-id') { peer.destroy(); peer = null; create(); }
      else showStatus(`Kopplung fehlgeschlagen: ${error.type || 'Netzwerkfehler'}.`);
    });
  }
  async function open() {
    $('pairPanel').classList.remove('hidden');
    if (peer) return render();
    showStatus('Kopplung wird vorbereitet …');
    try { await Promise.all([peerLibrary(), qrLibrary()]); create(); }
    catch (_) { showStatus('Kopplung nicht verfügbar. Prüfe die Internetverbindung.'); }
  }
  function broadcast() {
    const snapshot = handlers.snapshot();
    clients.forEach((slot, connection) => send(connection, { t: 'state', ...snapshot, me: slot }));
  }
  function destroy() {
    clients.forEach((_, connection) => { try { connection.close(); } catch (_) {} });
    clients.clear(); if (peer) peer.destroy(); peer = null; code = ''; pin = '';
  }
  addEventListener('pagehide', destroy);
  return { open, broadcast, destroy, has: slot => [...clients.values()].includes(slot) };
}

export function startController() {
  const root = $('controller'); root.classList.remove('hidden'); $('appShell').classList.add('hidden');
  let peer = null, connection = null, name = '', pin = '', currentState = null, submittedRound = -1;
  try { name = localStorage.getItem('zw-name') || ''; } catch (_) {}
  const send = message => { try { if (connection?.open) connection.send(message); } catch (_) {} };
  function joinScreen(message = '') {
    root.replaceChildren();
    const title = document.createElement('h1'); title.textContent = 'ZEITSPRUNG WISSEN';
    const info = document.createElement('p'); info.textContent = message || (JOIN_CODE ? `Handy-Controller für Raum ${JOIN_CODE}. Gib die PIN vom Fernseher ein.` : 'Gib WR-Code und PIN vom Fernseher ein.');
    const codeInput = document.createElement('input'); codeInput.placeholder = 'WR-Code, z. B. WRABCD'; codeInput.maxLength = 6; codeInput.value = JOIN_CODE; codeInput.autocapitalize = 'characters'; codeInput.setAttribute('aria-label', 'WR-Code vom Fernseher');
    const nameInput = document.createElement('input'); nameInput.placeholder = 'Dein Name'; nameInput.maxLength = 22; nameInput.value = name; nameInput.setAttribute('aria-label', 'Dein Name');
    const pinInput = document.createElement('input'); pinInput.placeholder = '4-stellige PIN'; pinInput.inputMode = 'numeric'; pinInput.pattern = '[0-9]{4}'; pinInput.maxLength = 4; pinInput.value = pin; pinInput.setAttribute('aria-label', 'PIN vom Fernseher');
    const button = document.createElement('button'); button.textContent = 'Mit TV verbinden'; button.className = 'primary';
    button.onclick = () => { const code = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); name = cleanName(nameInput.value); pin = pinInput.value.replace(/\D/g, '').slice(0,4); if (!/^WR[A-HJ-NP-Z2-9]{4}$/.test(code)) { info.textContent = 'Bitte den sechsstelligen WR-Code vom Fernseher eingeben.'; return; } if (pin.length !== 4) { info.textContent = 'Bitte die vierstellige PIN eingeben.'; return; } try { localStorage.setItem('zw-name', name); sessionStorage.setItem('zw-pin', pin); } catch (_) {} if (code !== JOIN_CODE) { location.href = `${location.pathname}?join=${code}`; return; } connect(); };
    root.append(title, info, codeInput, nameInput, pinInput, button);
  }
  function waiting(message) { root.replaceChildren(); const h = document.createElement('h2'); h.textContent = 'ZEITSPRUNG WISSEN'; const p = document.createElement('p'); p.textContent = message; root.append(h,p); }
  async function connect() {
    waiting('Verbindung wird hergestellt …');
    try { await peerLibrary(); } catch (_) { joinScreen('PeerJS konnte nicht geladen werden. Prüfe die Internetverbindung.'); return; }
    if (peer) { try { peer.destroy(); } catch (_) {} }
    peer = new window.Peer();
    peer.on('error', error => joinScreen(error.type === 'peer-unavailable' ? 'WR-Code nicht gefunden. Läuft der TV-Modus?' : `Verbindungsfehler: ${error.type || 'unbekannt'}`));
    peer.on('open', () => {
      connection = peer.connect(`zw-${JOIN_CODE.toLowerCase()}`, { reliable: true });
      const timeout = setTimeout(() => { if (!connection?.open) joinScreen('Keine Antwort vom TV. WR-Code prüfen.'); }, 10000);
      connection.on('open', () => { clearTimeout(timeout); send({ t: 'join', name, pin }); });
      connection.on('data', message => {
        if (!message || typeof message !== 'object') return;
        if (message.t === 'error') joinScreen(message.message || 'Beitritt nicht möglich.');
        if (message.t === 'welcome') waiting(`Verbunden als ${name}. Schau auf den Fernseher!`);
        if (message.t === 'state') { currentState = message; renderState(); }
      });
      connection.on('close', () => joinScreen('Verbindung getrennt. Erneut verbinden.'));
    });
  }
  function renderState() {
    const s = currentState; if (!s) return;
    root.replaceChildren();
    const h = document.createElement('h2'); h.textContent = `ZEITSPRUNG WISSEN · ${name}`; root.append(h);
    const score = document.createElement('p'); score.className = 'controller-score'; score.textContent = `${s.players?.[s.me]?.score || 0} / ${s.win || 8} Punkte · Runde ${s.round}`; root.append(score);
    if (s.phase !== 'game') { const p = document.createElement('p'); p.textContent = 'Warte, bis am Fernseher das Spiel beginnt.'; root.append(p); return; }
    if (s.active !== s.me) { const p = document.createElement('p'); p.textContent = `${s.players?.[s.active]?.name || 'Jemand anderes'} ist am Zug. Schau auf den Fernseher!`; root.append(p); return; }
    if (s.solved) {
      const p = document.createElement('p'); p.textContent = s.result || 'Runde beendet.'; root.append(p);
      const button = document.createElement('button'); button.className = 'primary'; button.textContent = 'Nächste Runde →'; button.onclick = () => send({ t: 'next' }); root.append(button); return;
    }
    const prompt = document.createElement('p'); prompt.textContent = submittedRound === s.round ? 'Antwort gesendet. Warte auf die Auflösung am TV.' : s.prompt; root.append(prompt);
    if (s.type === 'visual') { const symbols=document.createElement('div');symbols.className='controller-symbols';symbols.textContent=(s.symbols||[]).join('  ');root.append(symbols); }
    if (s.media?.length) {
      const play = document.createElement('button'); play.className = 'secondary'; play.textContent = s.media[0] === 'clip' ? '▶ Clip am TV starten' : '♫ Song am TV starten'; play.onclick = () => send({ t: 'play' }); root.append(play);
      if (s.media.length > 1) { const source = document.createElement('button'); source.className = 'secondary'; source.textContent = '↔ Clip / Song am TV wechseln'; source.onclick = () => send({ t: 'source' }); root.append(source); }
    }
    const choices = document.createElement('div'); choices.className = 'controller-choices';
    const items = s.type === 'timeline' ? (s.slots || []) : (s.options || []);
    items.forEach((label, position) => {
      const button = document.createElement('button'); button.textContent = `${s.type === 'timeline' ? position + 1 : 'ABCD'[position]}. ${label}`; button.disabled = submittedRound === s.round;
      button.onclick = () => { submittedRound = s.round; send(s.type === 'timeline' ? { t: 'answer', position } : { t: 'choice', choice: position }); renderState(); };
      choices.append(button);
    });
    root.append(choices);
  }
  addEventListener('pagehide', () => { try { peer?.destroy(); } catch (_) {} });
  try { pin = sessionStorage.getItem('zw-pin') || ''; sessionStorage.removeItem('zw-pin'); } catch (_) {}
  joinScreen();
}
