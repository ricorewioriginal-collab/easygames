'use strict';
/* AnMaCha Koffer DEALER – Host (Studio + Spiellogik + Handy-Kopplung per PeerJS) · Controller: controller.js */
const $ = id => document.getElementById(id);
const qp = new URLSearchParams(location.search);
const JOIN = (qp.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), PH = qp.get('ph') || '';
const NAMES = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio'];
const CDN = { three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', peer: 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', qr: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js' };
const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen: ' + src)); document.head.appendChild(s); });
const peerCfg = () => { if (!PH) return {}; const [h, p] = PH.split(':'); return { host: h, port: +p || 9000, path: '/', secure: false }; };
const fmt = n => n.toLocaleString('de-DE') + ' €';
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const VALUES = [1, 10, 50, 100, 250, 500, 1000, 5000, 10000, 25000, 100000, 500000, 1000000];
const SLOTC = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'];
const nice = x => { const m = x < 100 ? 1 : x < 1000 ? 5 : x < 10000 ? 50 : x < 100000 ? 500 : 5000; return Math.max(1, Math.round(x / m) * m); };

if (JOIN) { document.body.classList.add('ctrl'); loadScript('controller.js').then(() => window.startController && window.startController()).catch(e => { $('err').hidden = false; $('errTxt').textContent = e.message; }); }
else initHost();

function initHost() {
  if (window.self !== window.top) $('backLink').hidden = true;
  let save = { hof: [], form: 'solo', dealer: 1, names: ['', '', '', ''], logos: [6, 1, 2, 8] };
  try { const s = JSON.parse(localStorage.getItem('akdSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('akdSave', JSON.stringify(save)); } catch (e) {} };
  const cfg = { form: ['solo', 'reihum', 'duell'].includes(save.form) ? save.form : 'solo', dealer: [0, 1, 2].includes(save.dealer) ? save.dealer : 1 };
  let players = [{ name: save.names[0] || '', logo: save.logos[0], conn: null }];
  let logos = [], ready = false, running = false;

  // ------------------------------------------------------------------ Logos
  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  (function brand() {
    const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`)));
    Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; });
  })();

  // ------------------------------------------------------------------ Menü
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  const notice = t => { $('loadInfo').textContent = t; };
  function setForm(f) {
    const remotes = players.filter(p => p.conn).length;
    if (f === 'solo' && remotes > 1) return notice('Solo geht nur mit einem gekoppelten Handy.');
    if (f === 'duell' && remotes > 2) return notice('Duell: höchstens 2 Handys.');
    cfg.form = f; const want = f === 'solo' ? 1 : f === 'duell' ? 2 : Math.max(2, players.length);
    while (players.length < want) { const n = players.length; players.push({ name: save.names[n] || '', logo: save.logos[n] ?? 6, conn: null }); }
    while (players.length > want) { const k = players.map(p => !p.conn).lastIndexOf(true); if (k < 0) break; players.splice(k, 1); }
    save.form = f; persist(); renderSetup();
  }
  function renderSetup() {
    document.querySelectorAll('[data-form]').forEach(b => b.classList.toggle('on', b.dataset.form === cfg.form));
    document.querySelectorAll('[data-dealer]').forEach(b => b.classList.toggle('on', +b.dataset.dealer === cfg.dealer));
    const box = $('plist'); box.innerHTML = '';
    players.forEach((p, i) => {
      const d = document.createElement('div'); d.className = 'pc glass'; d.style.setProperty('--sc', SLOTC[i % 4]);
      d.innerHTML = `<img class="lg" alt="" src="${logoSrc(p.logo)}" title="${esc(NAMES[p.logo] || '')}"><div class="col"><input maxlength="14" value="${esc(p.name)}" placeholder="Spieler ${i + 1}" ${p.conn ? 'readonly' : ''}>${p.conn ? '<span class="tag">📱 GEKOPPELT</span>' : '<span class="info">Auf das Logo tippen = anderes Sender-Shirt</span>'}</div>${cfg.form === 'reihum' && players.length > 2 ? '<button class="rm" title="Entfernen">✕</button>' : ''}`;
      const inp = d.querySelector('input'); inp.oninput = () => { p.name = inp.value; if (!p.conn) { save.names[i] = inp.value; persist(); } };
      d.querySelector('.lg').onclick = e => { p.logo = nextLogo(p.logo); e.target.src = logoSrc(p.logo); save.logos[i] = p.logo; persist(); };
      const rm = d.querySelector('.rm'); if (rm) rm.onclick = () => { const c = players[i].conn; if (c) try { c.send({ t: 'kick' }); c.close(); } catch (e) {} players.splice(i, 1); renderSetup(); };
      box.appendChild(d);
    });
    $('bAdd').hidden = cfg.form !== 'reihum' || players.length >= 4;
    $('hof').innerHTML = `<div class="glass"><h4>💰 HÖCHSTE GEWINNE</h4>${save.hof.slice(0, 5).map((r, i) => `<p><span>${i + 1}. ${esc(r.n)}</span><b>${fmt(r.v)}</b></p>`).join('') || '<p><span>noch leer</span></p>'}</div>`;
    $('bPlay').disabled = !(ready && !running); $('bPlay').textContent = ready ? 'SHOW STARTEN' : 'LADEN …';
  }
  document.querySelectorAll('[data-form]').forEach(b => b.onclick = () => setForm(b.dataset.form));
  document.querySelectorAll('[data-dealer]').forEach(b => b.onclick = () => { cfg.dealer = +b.dataset.dealer; save.dealer = cfg.dealer; persist(); renderSetup(); });
  $('bAdd').onclick = () => { if (players.length < 4) { const n = players.length; players.push({ name: '', logo: save.logos[n] ?? 6, conn: null }); renderSetup(); } };
  const syncSnd = () => { $('bSnd').textContent = AUD.muted ? '🔇' : '🔊'; $('bMenuSnd').textContent = AUD.muted ? '🔇 Ton aus' : '🔊 Ton an'; $('bVoice').style.opacity = AUD.tts ? 1 : 0.45; $('bMenuVoice').textContent = AUD.tts ? '🎙 Stimme: an' : '🎙 Stimme: aus'; $('bMenuVoice').hidden = $('bVoice').hidden = !AUD.hasTts; };
  const togSnd = () => { AUD.setMute(!AUD.muted); syncSnd(); if (!G && !AUD.muted) AUD.bed('menu'); };
  const togVoice = () => { AUD.setTts(!AUD.tts); syncSnd(); if (AUD.tts) AUD.say('Hallo und willkommen beim Koffer Dealer!'); };
  $('bSnd').onclick = $('bMenuSnd').onclick = togSnd; $('bVoice').onclick = $('bMenuVoice').onclick = togVoice; syncSnd();

  // ------------------------------------------------------------------ Koppeln (PeerJS)
  let peer = null, room = '';
  const conns = new Set();
  const randCode = n => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  async function openPair() {
    $('pair').hidden = false; AUD.unlock();
    if (!peer) {
      $('code').textContent = '….'; $('pairUrl').textContent = 'Verbinde …';
      try { await Promise.all([window.Peer || loadScript(CDN.peer), window.qrcode || loadScript(CDN.qr)]); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich (Internet?)'; return; }
      createRoom();
    } else showPair();
  }
  function createRoom() {
    room = randCode(4);
    try { peer = new Peer('akd-' + room, peerCfg()); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich'; return; }
    peer.on('open', showPair);
    peer.on('error', e => { if (e.type === 'unavailable-id') { try { peer.destroy(); } catch (x) {} peer = null; createRoom(); } else $('pairUrl').textContent = 'Verbindung zum Koppel-Server nicht möglich (' + e.type + ')'; });
    peer.on('connection', c => { conns.add(c); c.on('data', m => onRemote(c, m)); c.on('close', () => onGone(c)); c.on('error', () => onGone(c)); });
  }
  const pairUrl = () => location.href.split('#')[0].split('?')[0] + '?join=' + room + (PH ? '&ph=' + encodeURIComponent(PH) : '');
  function showPair() {
    $('code').textContent = room; const url = pairUrl(); $('pairUrl').textContent = url;
    try { const q = qrcode(0, 'M'); q.addData(url); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').innerHTML = ''; }
    updatePairList();
  }
  function updatePairList() { const n = players.filter(p => p.conn).map(p => p.name); $('pairList').textContent = n.length ? '📱 Verbunden: ' + n.join(', ') : 'Noch niemand verbunden.'; }
  $('bPair').onclick = openPair; $('bPairOk').onclick = () => { $('pair').hidden = true; };
  const send = (c, m) => { try { if (c && c.open) c.send(m); } catch (e) {} };
  function onRemote(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      if (running) return send(c, { t: 'full', msg: 'Die Show läuft schon – bitte nach der Runde beitreten.' });
      const nm = String(m.name || 'Gast').trim().slice(0, 14) || 'Gast', lg = Number.isInteger(m.logo) && m.logo >= 0 && m.logo < 13 ? m.logo : 6;
      const np = { name: nm, logo: lg, conn: c }, empty = players.findIndex(p => !p.conn && !p.name.trim());
      if (empty >= 0) players[empty] = np; else if (players.length < 4) players.push(np); else return send(c, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
      if (players.length > 1 && cfg.form === 'solo') cfg.form = 'reihum'; if (players.length > 2 && cfg.form === 'duell') cfg.form = 'reihum';
      if (cfg.form === 'reihum' && players.length < 2) players.push({ name: '', logo: save.logos[1], conn: null });
      send(c, { t: 'wel', slot: players.indexOf(np) }); renderSetup(); updatePairList(); AUD.sfx.select(); return;
    }
    act(m, c);
  }
  function onGone(c) {
    conns.delete(c);
    if (running && G) { ents.forEach(e => e.members.forEach(mb => { if (mb.conn === c) mb.conn = null; })); render(); return; }
    players = players.filter(p => p.conn !== c); if (!players.length) players.push({ name: '', logo: 6, conn: null }); if (cfg.form === 'reihum' && players.length < 2) players.push({ name: '', logo: 1, conn: null });
    renderSetup(); updatePairList();
  }

  // ------------------------------------------------------------------ Laden
  Promise.all([loadLogos(), loadScript(CDN.three).then(() => loadScript('studio.js'))]).then(() => {
    Studio.init($('cv'), logos); Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Spieler 2', logo: 1 }]); Studio.buildKoffer(13); Studio.setMood('menu'); Studio.shot('wide');
    ready = true; layout(true); $('loadInfo').textContent = `13 Koffer · ${logos.length} Sender-Logos`; renderSetup();
    let last = performance.now(); (function loop(n) { requestAnimationFrame(loop); const dt = Math.min(0.1, (n - last) / 1000); last = n; Studio.frame(dt); })(last);
  }).catch(e => { $('err').hidden = false; $('errTxt').textContent = 'Das Studio konnte nicht geladen werden (' + e.message + '). Bitte Internetverbindung prüfen.'; });
  renderSetup();
  addEventListener('resize', () => layout(true));
  document.addEventListener('pointerdown', () => AUD.unlock(), { once: true });
  document.addEventListener('pointerdown', () => { if (!G && ready && !AUD.muted) AUD.bed('menu'); }, { once: true });

  // ------------------------------------------------------------------ Spiellogik
  let G = null, ents = [], kof = [], lastLay = '';
  const SPD = () => window.__fast || 1;
  const activeMember = e => e.members[e.mi % e.members.length];
  const multi = () => ents.length > 1;
  function sleep(ms) { const g = G; return new Promise((res, rej) => setTimeout(() => G === g && g ? res() : rej('abort'), ms / SPD())); }
  function say(who, text, hold) {
    const g = G; hold = hold || 2000; const b = $('bubble'); b.innerHTML = `<b>${who === 'dealer' ? '🎩 DEALER' : '🎤 MODERATOR'}</b>${esc(text)}`; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    if (who === 'dealer') Studio.dealerTalk(hold / 1000 + 0.2); else Studio.hostTalk(hold / 1000 + 0.2);
    return new Promise((res, rej) => { let done = false; const fin = () => { if (done) return; done = true; if (G !== g) return rej('abort'); res(); }; if (AUD.tts) AUD.say(text, () => setTimeout(fin, 250)); else setTimeout(fin, hold / SPD()); });
  }
  const hideBubble = () => { $('bubble').hidden = true; };
  function banner(text, sub, cls, ms) { const b = $('banner'); b.className = cls || ''; b.innerHTML = esc(text) + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(banner.k); banner.k = setTimeout(() => { b.hidden = true; }, ms || 2400); }
  const setHint = t => { $('hint').textContent = t || ''; $('hint').hidden = !t; layout(); };

  function buildEnts() {
    const n = cfg.form === 'solo' ? 1 : cfg.form === 'duell' ? 2 : Math.min(4, players.length);
    return players.slice(0, n).map((p, i) => { const nm = (p.name || '').trim() || 'Spieler ' + (i + 1); return { name: nm, logo: p.logo, members: [{ name: nm, conn: p.conn }], mi: 0, own: -1, dealt: false, banked: 0, payout: 0 }; });
  }
  async function startGame() {
    if (!ready || running) return; AUD.unlock(); ents = buildEnts(); if (!ents.length) return; running = true;
    const vals = shuffle(VALUES.slice()); kof = vals.map((v, i) => ({ v, st: 'closed', owner: -1 }));
    G = { turn: 0, pick: null, offer: null, activeEnt: null, over: false, ei: 0, round: 0, msg: '', needle: null };
    $('menu').hidden = true; $('pair').hidden = true; $('end').hidden = true; $('pause').hidden = true; $('ui').hidden = false; $('offer').hidden = true; hideBubble();
    Studio.setCast(ents.map(e => ({ name: e.name, logo: e.logo }))); Studio.buildKoffer(13); Studio.setMood('menu'); Studio.onAir(false);
    buildDial(); buildCards(); updatePodiums(); layout(true); render();
    const g = G; try { await run(); } catch (e) { if (e !== 'abort') console.error(e); } if (G === g) { /* beendet */ }
  }
  const closedPool = () => kof.map((k, i) => ({ k, i })).filter(x => x.k.st === 'closed').map(x => x.i);
  async function run() {
    Studio.shot('all'); AUD.bed('off'); AUD.sfx.intro(); Studio.allPose('cheer'); Studio.hostPose('wave');
    await say('host', 'Herzlich willkommen bei AnMaCha Koffer Dealer!', 2400); Studio.allPose('idle'); Studio.hostPose('idle');
    Studio.shot('dealer'); Studio.onAir(true); AUD.sfx.onair(); Studio.dealerPose('talk');
    await say('dealer', 'Dreizehn Koffer. Dreizehn Beträge. Und ich habe das Geld. Spielen wir!', 2800); Studio.onAir(false); Studio.dealerPose('idle');
    Studio.shot('wide'); AUD.bed('menu');
    for (let i = 0; i < ents.length; i++) await pickOwn(ents[i], i);
    let r = 0, opened = 0; const pat = [3, 3, 2, 2, 1, 1, 1, 1, 1];
    while (true) {
      const pool = closedPool(), alive = ents.filter(e => !e.dealt);
      if (!alive.length || (ents.length === 1 && pool.length <= 1) || (ents.length > 1 && pool.length === 0)) break;
      let k = Math.min(pat[r] || 1, ents.length === 1 ? pool.length - 1 : pool.length);
      await say('host', `Runde ${r + 1}: ${k === 1 ? 'Ein Koffer wird' : k + ' Koffer werden'} geöffnet.`, 1500); AUD.bed('tension', Math.min(1, r / 6));
      for (let j = 0; j < k; j++) await openTurn(alive[(opened++) % alive.length], k - j);
      r++; G.round = r;
      const rest = closedPool(); if (ents.length > 1 && rest.length === 0) break;
      for (const e of alive) if (!e.dealt) await offerTurn(e, r, ents.length === 1 && rest.length === 1);
    }
    await finale();
  }
  function setActive(e, sub) {
    const ei = ents.indexOf(e), mb = activeMember(e); G.activeEnt = e; G.ei = ei; $('whoImg').src = logoSrc(e.logo); $('whoName').textContent = e.name; $('whoSub').textContent = sub || ''; $('who').style.borderColor = SLOTC[ei % 4];
    Studio.setActive(ei); ents.forEach((x, k) => { if (k !== ei && !x.dealt) Studio.pose(k, 'idle'); }); Studio.pose(ei, 'think'); updatePodiums(); void mb;
  }
  const updatePodiums = () => ents.forEach((e, i) => Studio.podium(i, e.name, e.dealt ? fmt(e.banked) : (e.own >= 0 ? 'Koffer ' + (e.own + 1) : ''), G && G.ei === i));
  function waitPick(mode, e) {
    return new Promise(res => {
      G.pick = { mode, ent: e, resolve: i => { G.pick = null; Studio.pulseKoffer(null); render(); res(i); } };
      Studio.pulseKoffer(kof.map((k, i) => ({ k, i })).filter(x => x.k.st === 'closed').map(x => x.i)); render();
    });
  }
  async function pickOwn(e, ei) {
    setActive(e, 'wählt den eigenen Koffer'); Studio.shot('wide'); const mb = activeMember(e);
    setHint(`${mb.name}: Wähle deinen Koffer – er gehört dir bis zum Schluss!`); await say('host', multi() ? `${mb.name}, such dir deinen Koffer aus.` : 'Such dir deinen Koffer aus. Er gehört dir bis zum Schluss.', 1700);
    const i = await waitPick('own', e); e.own = i; kof[i].st = 'mine'; kof[i].owner = ei; Studio.kofferState(i, 'mine', ei); AUD.sfx.latch(); AUD.sfx.select(); Studio.shot('player', ei);
    banner('Koffer ' + (i + 1), mb.name + ' hält die Hand drauf', 'gold'); Studio.pose(ei, 'cheer'); updatePodiums(); render(); await sleep(1700); Studio.pose(ei, 'idle'); Studio.shot('wide');
  }
  async function openTurn(e, left) {
    const ei = ents.indexOf(e), mb = activeMember(e); setActive(e, 'öffnet einen Koffer'); Studio.shot('wide'); e.mi++; setHint(`${mb.name}: Öffne einen Koffer${left > 1 ? ' (noch ' + left + ' in dieser Runde)' : ''}`);
    const i = await waitPick('open', e); const v = kof[i].v; kof[i].st = 'open'; setHint(''); Studio.shot('koffer', i); AUD.sfx.caseOpen(); Studio.kofferState(i, 'open'); Studio.openKoffer(i, v); render();
    await sleep(1100); updateDial(); const bad = v >= 100000, good = v <= 1000;
    if (bad) { AUD.sfx.bad(); Studio.setMood('bad'); Studio.ledMessage(fmt(v), '#ff7a8a', 2.2); Studio.pose(ei, 'sad'); banner(fmt(v), 'Autsch – ein dicker Fisch ist weg', 'bad'); }
    else if (good) { AUD.sfx.good(); Studio.setMood('good'); Studio.ledMessage(fmt(v), '#7CFF9A', 2.2); Studio.pose(ei, 'cheer'); banner(fmt(v), 'Raus damit!', 'good'); }
    else { AUD.sfx.reveal(3); Studio.ledMessage(fmt(v), '#ffd24a', 2); banner(fmt(v), '', 'gold'); }
    await sleep(2100); Studio.pose(ei, 'idle'); Studio.setMood('idle'); Studio.shot('wide'); await sleep(300);
  }

  // --- Dealer-Angebote
  function computeOffer(round) {
    const live = kof.filter(k => k.st !== 'open').map(k => k.v), ev = live.reduce((a, b) => a + b, 0) / live.length;
    const f = [0.2, 0.32, 0.46, 0.6, 0.74, 0.86, 0.94][Math.min(round - 1, 6)] * [1.15, 1, 0.88][cfg.dealer];
    return { offer: nice(ev * Math.min(f, 1.02) * (0.94 + Math.random() * 0.12)), ev };
  }
  async function offerTurn(e, round, last) {
    const ei = ents.indexOf(e), mb = activeMember(e); setActive(e, 'bekommt einen Funkspruch'); const o = computeOffer(round); let amt = o.offer, haggled = false;
    Studio.shot('dealer'); Studio.setMood('offer'); Studio.onAir(true); AUD.sfx.onair(); Studio.dealerPose('phone'); AUD.bed('tension', Math.min(1, round / 6 + 0.2)); setHint(''); await sleep(1200);
    const lines = [`Funkspruch vom Dealer! ${mb.name}, ich biete dir ${fmt(amt)}.`, `Hier spricht der Dealer: ${fmt(amt)} in bar – sofort.`, `${mb.name}, hör gut zu: ${fmt(amt)}. Das Angebot gilt nur jetzt.`];
    G.offer = { ent: e, amt, ev: Math.round(o.ev), canHaggle: true, last, wait: null }; AUD.sfx.offer(); needleTo(amt); render(); $('offer').hidden = false; layout(true);
    await say('dealer', rnd(lines), 2600);
    while (true) {
      const d = await new Promise(res => { G.offer.wait = res; G.offer.amt = amt; G.offer.canHaggle = !haggled; render(); });
      if (d.d === 'haggle') {
        haggled = true; const need = 1 + d.pct / 100, maxF = 1 + Math.pow(Math.random(), 1.5) * 0.6 * [1.3, 1, 0.7][cfg.dealer]; G.offer.wait = null;
        if (need <= maxF) { amt = nice(amt * need); AUD.sfx.safe(); Studio.dealerPose('shrug'); await say('dealer', `Na gut, weil du so nett fragst: ${fmt(amt)}. Letztes Wort.`, 2400); Studio.dealerPose('phone'); needleTo(amt); continue; }
        AUD.sfx.buzzWrong(); Studio.dealerPose('talk'); banner('Abgelehnt!', 'Das Angebot ist vom Tisch', 'bad'); await say('dealer', 'Kein Interesse! Das Angebot ist vom Tisch.', 2200); G.offer.wait = null; d.d = 'weiter';
      }
      if (d.d === 'deal') { e.dealt = true; e.banked = amt; break; } else { break; }
    }
    $('offer').hidden = true; G.offer = null; Studio.onAir(false); Studio.dealerPose('idle'); render(); const dealt = e.dealt;
    if (dealt) { AUD.sfx.kaching(); Studio.setMood('good'); Studio.pose(ei, 'cheer'); Studio.dealerPose('cheer'); Studio.ledMessage('DEAL!', '#00ffc8', 2.5); banner(fmt(e.banked), 'DEAL!', 'gold', 3000); Studio.confetti(120, true); updatePodiums(); await say('dealer', `Deal! ${mb.name} nimmt ${fmt(e.banked)} mit. Der Koffer bleibt zu.`, 2600); Studio.dealerPose('idle'); }
    else { AUD.sfx.swell(1.1); Studio.setMood('tension'); Studio.pose(ei, 'think'); banner('Weiter!', 'Kein Deal', 'good', 1800); await say('host', rnd(['Mutig! Wir spielen weiter.', 'Kein Deal – das nenne ich Nerven!', 'Weiter geht’s, es bleibt spannend.']), 1800); }
    Studio.setMood('idle'); Studio.pose(ei, dealt ? 'idle' : 'idle'); Studio.shot('wide'); await sleep(250);
  }
  function needleTo(amt) {
    const n = $('needle'), sc = $('dialScale'), chips = [...sc.children]; let i = 0; while (i < VALUES.length - 1 && VALUES[i + 1] <= amt) i++;
    const lo = VALUES[i], hi = VALUES[Math.min(i + 1, VALUES.length - 1)], f = hi > lo ? Math.min(1, Math.max(0, (Math.log(amt) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)))) : 0;
    const a = chips[i], b = chips[Math.min(i + 1, chips.length - 1)]; if (!a) return; const ca = a.offsetLeft + a.offsetWidth / 2, cb = b.offsetLeft + b.offsetWidth / 2; n.style.left = (sc.offsetLeft + ca + (cb - ca) * f) + 'px'; n.style.opacity = 1;
  }

  // --- Finale
  async function finale() {
    AUD.bed('off'); $('offer').hidden = true; setHint(''); Studio.setActive(-1); hideBubble();
    if (ents.length === 1 && !ents[0].dealt) {
      const e = ents[0], pool = closedPool(); if (pool.length === 1) {
        const other = pool[0]; setActive(e, 'letzte Entscheidung'); Studio.shot('wide'); AUD.bed('tension', 1);
        await say('host', `Zwei Koffer sind übrig: dein Koffer ${e.own + 1} und Koffer ${other + 1}. Willst du tauschen?`, 3000);
        G.offer = { ent: e, swap: other, amt: 0, ev: 0, wait: null }; $('offer').hidden = false; layout(true);
        const d = await new Promise(res => { G.offer.wait = res; render(); }); $('offer').hidden = true; G.offer = null;
        if (d.d === 'swap') { const old = e.own; kof[old].st = 'closed'; kof[old].owner = -1; Studio.kofferState(old, 'closed'); kof[other].st = 'mine'; kof[other].owner = 0; e.own = other; Studio.kofferState(other, 'mine', 0); AUD.sfx.latch(); banner('Getauscht!', 'Jetzt gehört dir Koffer ' + (other + 1), 'gold'); await sleep(1800); } else { banner('Behalten!', 'Koffer ' + (e.own + 1) + ' bleibt deiner', 'gold'); await sleep(1500); }
      }
    }
    // Aufdecken
    Studio.setMood('tension'); await say('host', 'Jetzt wird aufgedeckt!', 1400); AUD.sfx.drum(1.6);
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i], k = kof[e.own]; if (!k) continue; Studio.shot('player', i); G.ei = i; $('whoImg').src = logoSrc(e.logo); $('whoName').textContent = e.name; $('whoSub').textContent = e.dealt ? 'Koffer wird aufgedeckt' : 'Das Finale'; updatePodiums(); await sleep(900);
      AUD.sfx.caseOpen(); Studio.openKoffer(e.own, k.v); k.st = 'open'; k.owner = i; render(); await sleep(1300); updateDial();
      if (e.dealt) { e.payout = e.banked; const diff = e.banked - k.v; if (diff >= 0) { AUD.sfx.good(); Studio.pose(i, 'cheer'); banner('Gute Wahl!', `${fmt(k.v)} waren drin – ${fmt(e.banked)} gesichert`, 'good'); await say('host', `Im Koffer waren ${fmt(k.v)}. ${e.name} hat klug gedealt!`, 2600); } else { AUD.sfx.bad(); Studio.pose(i, 'sad'); banner('Verdealt!', `${fmt(k.v)} wären drin gewesen`, 'bad'); await say('host', `Im Koffer waren ${fmt(k.v)} – ${fmt(-diff)} mehr als der Deal.`, 2600); } }
      else { e.payout = k.v; if (k.v >= 100000) { AUD.sfx.kaching(); Studio.setMood('win'); Studio.pose(i, 'cheer'); banner(fmt(k.v), 'Jackpot!', 'gold', 3200); await say('host', `${fmt(k.v)}! Das ist ein Traum-Koffer!`, 2600); } else if (k.v >= 5000) { AUD.sfx.good(); Studio.pose(i, 'cheer'); banner(fmt(k.v), 'Ordentlich!', 'good'); await say('host', `${fmt(k.v)} – kann sich sehen lassen.`, 2200); } else { AUD.sfx.bad(); Studio.pose(i, 'sad'); banner(fmt(k.v), 'Hätte besser laufen können', 'bad'); await say('host', `Nur ${fmt(k.v)} im Koffer – hättest du doch gedealt!`, 2400); } }
      Studio.setMood('idle'); await sleep(500);
    }
    G.over = true; const rank = ents.map((e, i) => ({ e, i })).sort((a, b) => b.e.payout - a.e.payout), top = rank[0];
    rank.forEach(r => { if (r.e.payout > 0) save.hof.push({ n: r.e.name, v: r.e.payout }); }); save.hof.sort((a, b) => b.v - a.v); save.hof = save.hof.slice(0, 10); persist();
    Studio.shot('all'); Studio.setMood(top.e.payout >= 5000 ? 'win' : 'idle'); AUD.sfx.win(); ents.forEach((e, i) => Studio.pose(i, i === top.i || !multi() ? 'cheer' : 'sad')); Studio.hostPose('wave');
    $('endTitle').textContent = multi() ? `🏆 ${top.e.name} gewinnt!` : (top.e.payout >= 100000 ? '💰 DICKER GEWINN!' : 'Ende der Show'); $('endSub').textContent = 'Auszahlung nach Dealer-Runde';
    $('rankList').innerHTML = rank.map((r, k) => `<div class="brow" style="--sc:${SLOTC[r.i % 4]}"><span>${k + 1}. ${esc(r.e.name)}<small>${r.e.dealt ? 'Deal bei ' + fmt(r.e.banked) + ' · Koffer ' + (r.e.own + 1) + ': ' + fmt(kof[r.e.own].v) : 'Koffer ' + (r.e.own + 1) + ' behalten'}</small></span><b>${fmt(r.e.payout)}</b></div>`).join('');
    await sleep(2600); $('end').hidden = false; $('ui').hidden = true; running = false; pushState();
  }
  function quit() {
    G = null; running = false; ents = []; $('ui').hidden = true; $('pause').hidden = true; $('end').hidden = true; $('menu').hidden = false; AUD.bed('menu'); try { speechSynthesis.cancel(); } catch (e) {}
    Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Spieler 2', logo: 1 }]); Studio.buildKoffer(13); Studio.setMood('menu'); Studio.shot('wide'); Studio.onAir(false); renderSetup(); pushState();
  }
  $('bPlay').onclick = startGame; $('bAgain').onclick = () => { $('end').hidden = true; running = false; G = null; startGame(); }; $('bBack').onclick = quit;
  $('bEnd').onclick = () => { if (G && !G.over) { G.paused = true; $('pause').hidden = false; } }; $('bResume').onclick = () => { if (G) { G.paused = false; $('pause').hidden = true; } }; $('bQuit').onclick = quit;

  // ------------------------------------------------------------------ Eingaben
  const authorized = c => { const e = G && (G.pick ? G.pick.ent : G.offer ? G.offer.ent : null); if (!e) return false; return (activeMember(e).conn || null) === (c || null); };
  function act(m, c) {
    if (!G || G.paused || !authorized(c)) return;
    if (m.t === 'pick' && G.pick) { const i = m.i | 0; if (i >= 0 && i < 13 && kof[i].st === 'closed') G.pick.resolve(i); }
    else if (m.t === 'dec' && G.offer && G.offer.wait) {
      const o = G.offer, w = o.wait; if (o.swap != null) { if (m.d === 'swap' || m.d === 'keep') { o.wait = null; w({ d: m.d }); } return; }
      if (m.d === 'deal' || m.d === 'weiter') { o.wait = null; w({ d: m.d }); } else if (m.d === 'haggle' && o.canHaggle && [10, 25, 50].includes(m.pct | 0)) { o.wait = null; w({ d: 'haggle', pct: m.pct | 0 }); }
    }
  }
  addEventListener('keydown', ev => {
    if (ev.target && ev.target.tagName === 'INPUT') return; const k = ev.key.toLowerCase(); if (k === 'm') return togSnd(); if (!G || G.over) { if (k === 'enter' && !G && ready && !$('menu').hidden) startGame(); return; }
    if (k === 'escape' || k === 'p') { if (G.paused) $('bResume').click(); else $('bEnd').click(); return; }
    if (G.offer && G.offer.wait) { if (G.offer.swap != null) { if (k === 't') act({ t: 'dec', d: 'swap' }, null); if (k === 'b') act({ t: 'dec', d: 'keep' }, null); } else { if (k === 'd' || k === 'enter') act({ t: 'dec', d: 'deal' }, null); if (k === 'w' || k === 'n') act({ t: 'dec', d: 'weiter' }, null); } }
  });
  $('cv').addEventListener('pointerup', ev => { if (!G || !G.pick || !ready) return; const i = Studio.pick(ev.clientX, ev.clientY); if (i >= 0) act({ t: 'pick', i }, null); });
  $('cv').addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse' && G && G.pick) Studio.hover(ev.clientX, ev.clientY); });

  // ------------------------------------------------------------------ Oberfläche
  function buildDial() { const sc = $('dialScale'); sc.innerHTML = ''; VALUES.forEach(v => { const d = document.createElement('div'); d.className = 'dv' + (v >= 100000 ? ' hi' : ''); d.innerHTML = `<span class="f">${v >= 1000000 ? '1 Mio' : v.toLocaleString('de-DE')}</span><span class="c">${v >= 1000000 ? '1M' : v >= 1000 ? v / 1000 + 'T' : v}</span>`; d.dataset.v = v; sc.appendChild(d); }); $('needle').style.opacity = 0; }
  function updateDial() { const open = new Set(kof.filter(k => k.st === 'open').map(k => k.v)); [...$('dialScale').children].forEach(d => d.classList.toggle('gone', open.has(+d.dataset.v))); }
  function buildCards() {
    const box = $('cards'); box.innerHTML = '';
    for (let i = 0; i < 13; i++) { const b = document.createElement('button'); b.className = 'kc'; b.innerHTML = `<img alt="" src="${logoSrc(i)}"><b>${i + 1}</b><small></small>`; b.onclick = () => act({ t: 'pick', i }, null); box.appendChild(b); }
  }
  function renderCards() {
    const loc = G && G.pick && authorized(null); [...$('cards').children].forEach((b, i) => {
      const k = kof[i]; if (!k) return; b.classList.toggle('mine', k.st === 'mine'); b.classList.toggle('open', k.st === 'open'); b.classList.toggle('sel', !!loc && k.st === 'closed'); b.disabled = !(loc && k.st === 'closed');
      b.querySelector('small').textContent = k.st === 'mine' ? '★ ' + (ents[k.owner] ? ents[k.owner].name.slice(0, 7) : 'MEIN') : k.st === 'open' ? (k.v >= 1000000 ? '1 Mio' : k.v.toLocaleString('de-DE')) : '';
    });
  }
  function layout(force) {
    if (!ready) return; const w = innerWidth, h = innerHeight, d = $('dial'), top = $('ui').hidden ? 0 : d.offsetTop + d.offsetHeight + 8, bot = $('ui').hidden ? 20 : $('bot').offsetHeight + 8, key = [w, h, top, bot].join();
    if (!force && key === lastLay) return; lastLay = key; Studio.resize(w, h, top, bot);
  }
  function render() {
    if (!G) return; renderCards(); const o = G.offer;
    if (o) {
      const loc = authorized(null), btns = $('offerBtns'); $('offerWho').textContent = o.swap != null ? '🎤 LETZTE ENTSCHEIDUNG' : '📞 FUNKSPRUCH VOM DEALER'; $('offerAmt').textContent = o.swap != null ? `Koffer ${o.ent.own + 1} ⇄ Koffer ${o.swap + 1}` : fmt(o.amt);
      $('offerSub').textContent = o.swap != null ? 'Tauschen oder deinen Koffer behalten?' : `Ø der restlichen Werte: ${fmt(o.ev)} · ${activeMember(o.ent).name} entscheidet`;
      btns.innerHTML = ''; const mk = (txt, cls, d) => { const b = document.createElement('button'); b.className = 'pill ' + cls; b.textContent = txt; b.disabled = !loc || !o.wait; b.onclick = () => act({ t: 'dec', d }, null); btns.appendChild(b); };
      if (o.swap != null) { mk('TAUSCHEN', 'deal', 'swap'); mk('BEHALTEN', 'go', 'keep'); } else { mk('DEAL!', 'deal', 'deal'); mk(o.last ? 'WEITER (Tausch)' : 'WEITER', 'go', 'weiter'); }
      $('haggle').hidden = o.swap != null || !o.canHaggle || !loc; document.querySelectorAll('#haggle button').forEach(b => b.disabled = !o.wait);
    }
    const loc2 = authorized(null); if (G.pick) setHint(loc2 ? ($('hint').textContent || '') : '📱 ' + activeMember(G.pick.ent).name + ' wählt am Handy …');
    layout(); pushState();
  }
  $('haggle').onclick = ev => { const b = ev.target.closest('button'); if (b) act({ t: 'dec', d: 'haggle', pct: +b.dataset.h }, null); };

  // ------------------------------------------------------------------ Zustand an Handys
  let pushT = 0;
  function pushState() { if (!conns.size || pushT) return; pushT = setTimeout(() => { pushT = 0; conns.forEach(c => send(c, stateFor(c))); }, 30); }
  function stateFor(c) {
    const meEnt = ents.find(e => e.members.some(m => m.conn === c)), me = meEnt ? { name: meEnt.name, line: meEnt.dealt ? 'Deal: ' + fmt(meEnt.banked) : meEnt.own >= 0 ? 'Koffer ' + (meEnt.own + 1) : '' } : null;
    if (!G) return { t: 'st', ph: 'lobby', me, msg: running ? '' : 'Warte auf den Start der Show …' };
    if (G.over) return { t: 'st', ph: 'end', me, msg: 'Die Show ist beendet. Danke fürs Mitspielen!' };
    const values = VALUES.map(v => ({ v, gone: kof.some(k => k.v === v && k.st === 'open') })), koffer = kof.map((k, i) => ({ n: i + 1, st: k.st, v: k.st === 'open' ? k.v : null, own: k.st === 'mine' ? (ents[k.owner] ? ents[k.owner].name : '') : '' }));
    if (G.pick) { const mine = activeMember(G.pick.ent).conn === c; return { t: 'st', ph: 'pick', me, mine, who: activeMember(G.pick.ent).name, mode: G.pick.mode, koffer, values, msg: G.pick.mode === 'own' ? 'Wähle deinen eigenen Koffer' : 'Öffne einen Koffer' }; }
    if (G.offer) { const o = G.offer, mine = activeMember(o.ent).conn === c; return { t: 'st', ph: 'offer', me, mine, who: activeMember(o.ent).name, koffer, values, offer: { amt: o.amt, ev: o.ev, haggle: o.canHaggle, swap: o.swap != null ? o.swap + 1 : null, own: o.ent.own + 1, last: !!o.last, wait: !!o.wait } }; }
    return { t: 'st', ph: 'wait', me, koffer, values, msg: 'Gleich geht’s weiter …' };
  }
  window.__kd = { get G() { return G; }, get ents() { return ents; }, get kof() { return kof; }, act, startGame, cfg, get players() { return players; }, quit, VALUES };
}
