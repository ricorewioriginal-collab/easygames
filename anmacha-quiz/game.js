'use strict';
/* Machst du mich an? – Das Quiz!  (Host: TV-Studio mit Spiellogik · Handys koppeln per PeerJS · Controller: controller.js) */
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
const LADDER = [50, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 500000, 1000000], SAFE = [4, 9];
const SLOTC = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'], LET = 'ABCD', JNAMES = ['50:50', 'Publikum', 'Telefon', 'Tausch'], JICON = ['½', '👥', '📞', '🔄'];
const FRIENDS = ['Oma Gerda', 'Kumpel Tom', 'Tante Heidi', 'Opa Willi', 'Praktikant Ben', 'Nachbarin Frau Meier', 'Onkel Dieter'];

if (JOIN) { document.body.classList.add('ctrl'); loadScript('controller.js').then(() => window.startController && window.startController()).catch(e => { $('err').hidden = false; $('errTxt').textContent = e.message; }); }
else initHost();

function initHost() {
  if (window.self !== window.top) $('backLink').hidden = true;
  // ------------------------------------------------------------------ Speicher / Einstellungen
  let save = { hof: { ladder: [], night: [] }, mode: 'ladder', form: 'solo', ncat: 3, timer: 0, names: ['', '', '', ''], logos: [6, 1, 2, 8] };
  try { const s = JSON.parse(localStorage.getItem('amqSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('amqSave', JSON.stringify(save)); } catch (e) {} };
  const cfg = { mode: save.mode === 'night' ? 'night' : 'ladder', form: ['solo', 'reihum', 'duell', 'teams'].includes(save.form) ? save.form : 'solo', ncat: [1, 3, 5, 10].includes(save.ncat) ? save.ncat : 3, timer: save.timer === 60 ? 60 : 0 };
  let players = [{ name: save.names[0] || '', logo: save.logos[0], conn: null }];
  let teams = [{ name: 'Team Rot', logo: save.logos[0], mem: '', remote: [] }, { name: 'Team Blau', logo: save.logos[1], mem: '', remote: [] }];
  let logos = [], ready = false, running = false;

  // ------------------------------------------------------------------ Logos
  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  (function brand() {
    const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`)));
    Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; });
  })();

  // ------------------------------------------------------------------ Menü / Spieler
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  function setForm(f) {
    const remotes = players.filter(p => p.conn).length + teams.reduce((a, t) => a + t.remote.length, 0);
    if (f === 'solo' && remotes) return notice('Solo geht nur ohne gekoppelte Handys.');
    if (f === 'duell' && players.length > 2 && remotes > 2) return notice('Duell: höchstens 2 Handys.');
    cfg.form = f;
    if (f !== 'teams') {
      const want = f === 'solo' ? 1 : f === 'duell' ? 2 : Math.max(2, players.length);
      while (players.length < want) { const n = players.length; players.push({ name: save.names[n] || '', logo: save.logos[n] ?? 6, conn: null }); }
      while (players.length > want) { const k = players.map(p => !p.conn).lastIndexOf(true); if (k < 0) break; players.splice(k, 1); }
    }
    save.form = f; persist(); renderSetup();
  }
  function notice(t) { $('loadInfo').textContent = t; }
  function renderSetup() {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === cfg.mode));
    document.querySelectorAll('[data-form]').forEach(b => b.classList.toggle('on', b.dataset.form === cfg.form));
    document.querySelectorAll('[data-ncat]').forEach(b => b.classList.toggle('on', +b.dataset.ncat === cfg.ncat));
    $('ncatRow').hidden = cfg.mode !== 'night';
    document.querySelectorAll('[data-timer]').forEach(b => b.classList.toggle('on', +b.dataset.timer === cfg.timer));
    const box = $('plist'); box.innerHTML = '';
    if (cfg.form === 'teams') {
      teams.forEach((t, ti) => {
        const d = document.createElement('div'); d.className = 'pc glass'; d.style.setProperty('--sc', SLOTC[ti]);
        d.innerHTML = `<img class="lg" alt="" src="${logoSrc(t.logo)}" title="Logo wechseln"><div class="col"><input maxlength="14" value="${esc(t.name)}" placeholder="Teamname"><input maxlength="60" value="${esc(t.mem)}" placeholder="Mitspieler (mit Komma trennen)">${t.remote.length ? '<span class="tag">📱 ' + t.remote.map(r => esc(r.name)).join(', ') + '</span>' : ''}</div>`;
        const [i0, i1] = d.querySelectorAll('input'); i0.oninput = () => t.name = i0.value; i1.oninput = () => t.mem = i1.value;
        d.querySelector('.lg').onclick = e => { t.logo = nextLogo(t.logo); e.target.src = logoSrc(t.logo); };
        box.appendChild(d);
      });
    } else players.forEach((p, i) => {
      const d = document.createElement('div'); d.className = 'pc glass'; d.style.setProperty('--sc', SLOTC[i % 4]);
      d.innerHTML = `<img class="lg" alt="" src="${logoSrc(p.logo)}" title="${esc(NAMES[p.logo] || '')}"><div class="col"><input maxlength="14" value="${esc(p.name)}" placeholder="Spieler ${i + 1}" ${p.conn ? 'readonly' : ''}>${p.conn ? '<span class="tag">📱 GEKOPPELT</span>' : '<span class="info">Auf das Logo tippen = anderes Sender-Shirt</span>'}</div>${cfg.form === 'reihum' && players.length > 2 ? '<button class="rm" title="Entfernen">✕</button>' : ''}`;
      const inp = d.querySelector('input'); inp.oninput = () => { p.name = inp.value; if (!p.conn) { save.names[i] = inp.value; persist(); } };
      d.querySelector('.lg').onclick = e => { p.logo = nextLogo(p.logo); e.target.src = logoSrc(p.logo); save.logos[i] = p.logo; persist(); };
      const rm = d.querySelector('.rm'); if (rm) rm.onclick = () => { const c = players[i].conn; if (c) try { c.send({ t: 'kick' }); c.close(); } catch (e) {} players.splice(i, 1); renderSetup(); };
      box.appendChild(d);
    });
    $('bAdd').hidden = cfg.form !== 'reihum' || players.length >= 4;
    const h = save.hof; $('hof').innerHTML = [['🪜 Leiter – höchste Gewinne', h.ladder, fmt], ['🎤 Quiznight – Bestpunkte', h.night, v => v + ' Pkt']].map(([t, l, f]) => `<div class="glass"><h4>${t}</h4>${l.slice(0, 5).map((r, i) => `<p><span>${i + 1}. ${esc(r.n)}</span><b>${f(r.v)}</b></p>`).join('') || '<p><span>noch leer</span></p>'}</div>`).join('');
    const rdy = ready && !running; $('bPlay').disabled = !rdy; $('bPlay').textContent = ready ? 'SHOW STARTEN' : 'LADEN …';
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { cfg.mode = b.dataset.mode; save.mode = cfg.mode; persist(); renderSetup(); });
  document.querySelectorAll('[data-form]').forEach(b => b.onclick = () => setForm(b.dataset.form));
  document.querySelectorAll('[data-timer]').forEach(b => b.onclick = () => { cfg.timer = +b.dataset.timer; save.timer = cfg.timer; persist(); renderSetup(); });
  document.querySelectorAll('[data-ncat]').forEach(b => b.onclick = () => { cfg.ncat = +b.dataset.ncat; save.ncat = cfg.ncat; persist(); renderSetup(); });
  $('bAdd').onclick = () => { if (players.length < 4) { const n = players.length; players.push({ name: '', logo: save.logos[n] ?? 6, conn: null }); renderSetup(); } };
  const syncSnd = () => { $('bSnd').textContent = AUD.muted ? '🔇' : '🔊'; $('bMenuSnd').textContent = AUD.muted ? '🔇 Ton aus' : '🔊 Ton an'; $('bVoice').style.opacity = AUD.tts ? 1 : 0.45; $('bMenuVoice').textContent = AUD.tts ? '🎙 Moderator-Stimme: an' : '🎙 Moderator-Stimme: aus'; $('bMenuVoice').hidden = $('bVoice').hidden = !AUD.hasTts; };
  const togSnd = () => { AUD.setMute(!AUD.muted); syncSnd(); if (!G && !AUD.muted) AUD.bed('menu'); };
  const togVoice = () => { AUD.setTts(!AUD.tts); syncSnd(); if (AUD.tts) AUD.say('Hallo und herzlich willkommen!'); };
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
    try { peer = new Peer('amq-' + room, peerCfg()); } catch (e) { $('pairUrl').textContent = 'Koppeln nicht möglich'; return; }
    peer.on('open', showPair);
    peer.on('error', e => { if (e.type === 'unavailable-id') { try { peer.destroy(); } catch (x) {} peer = null; createRoom(); } else $('pairUrl').textContent = 'Verbindung zum Koppel-Server nicht möglich (' + e.type + ')'; });
    peer.on('connection', c => { conns.add(c); c.on('data', m => onRemote(c, m)); c.on('close', () => onGone(c)); c.on('error', () => onGone(c)); });
  }
  function pairUrl() { return location.href.split('#')[0].split('?')[0] + '?join=' + room + (PH ? '&ph=' + encodeURIComponent(PH) : ''); }
  function showPair() {
    $('code').textContent = room; const url = pairUrl(); $('pairUrl').textContent = url;
    try { const q = qrcode(0, 'M'); q.addData(url); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').innerHTML = ''; }
    updatePairList();
  }
  function updatePairList() {
    const names = players.filter(p => p.conn).map(p => p.name).concat(...teams.map(t => t.remote.map(r => r.name)));
    $('pairList').textContent = names.length ? '📱 Verbunden: ' + names.join(', ') : 'Noch niemand verbunden.';
  }
  $('bPair').onclick = openPair; $('bPairOk').onclick = () => { $('pair').hidden = true; };
  function send(c, m) { try { if (c && c.open) c.send(m); } catch (e) {} }
  function onRemote(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      if (running) return send(c, { t: 'full', msg: 'Die Show läuft schon – bitte nach der Runde beitreten.' });
      const nm = String(m.name || 'Gast').trim().slice(0, 14) || 'Gast', lg = Number.isInteger(m.logo) && m.logo >= 0 && m.logo < 13 ? m.logo : 6;
      if (cfg.form === 'teams') {
        const cnt = teams.reduce((a, t) => a + t.remote.length + t.mem.split(',').filter(x => x.trim()).length, 0); if (cnt >= 8) return send(c, { t: 'full', msg: 'Alle Plätze sind belegt.' });
        const t = teams[0].remote.length + teams[0].mem.split(',').filter(x => x.trim()).length <= teams[1].remote.length + teams[1].mem.split(',').filter(x => x.trim()).length ? teams[0] : teams[1];
        t.remote.push({ name: nm, conn: c }); send(c, { t: 'wel', team: t.name });
      } else {
        const np = { name: nm, logo: lg, conn: c }, empty = players.findIndex(p => !p.conn && !p.name.trim());
        if (empty >= 0) players[empty] = np; else if (players.length < 4) players.push(np); else return send(c, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
        if (players.length > 1 && cfg.form === 'solo') cfg.form = 'reihum'; if (players.length > 2 && cfg.form === 'duell') cfg.form = 'reihum';
        if (cfg.form === 'reihum' && players.length < 2) players.push({ name: '', logo: save.logos[1], conn: null });
        send(c, { t: 'wel', slot: players.indexOf(np) });
      }
      renderSetup(); updatePairList(); AUD.sfx.select(); return;
    }
    act(m, c);
  }
  function onGone(c) {
    conns.delete(c);
    if (running && G) { ents.forEach(e => e.members.forEach(mb => { if (mb.conn === c) mb.conn = null; })); render(); return; }
    players = players.filter(p => p.conn !== c); teams.forEach(t => t.remote = t.remote.filter(r => r.conn !== c));
    if (!players.length) players.push({ name: '', logo: 6, conn: null }); if (cfg.form === 'reihum' && players.length < 2) players.push({ name: '', logo: 1, conn: null });
    renderSetup(); updatePairList();
  }

  // ------------------------------------------------------------------ Laden
  Promise.all([loadLogos(), loadScript(CDN.three).then(() => Promise.all([loadScript('questions.js'), loadScript('studio.js')]))]).then(() => {
    Studio.init($('cv'), logos); Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Spieler 2', logo: 1 }]); Studio.setMood('menu'); Studio.shot('players');
    ready = true; layout(); $('loadInfo').textContent = `${window.QUIZ_Q.length} Fragen in ${window.QUIZ_CATS.length} Kategorien · ${logos.length} Sender-Logos`; renderSetup();
    let last = performance.now(); (function loop(n) { requestAnimationFrame(loop); const dt = Math.min(0.1, (n - last) / 1000); last = n; tickTimer(dt); Studio.frame(dt); })(last);
  }).catch(e => { $('err').hidden = false; $('errTxt').textContent = 'Das Studio konnte nicht geladen werden (' + e.message + '). Bitte Internetverbindung prüfen.'; });
  renderSetup();
  addEventListener('resize', () => layout(true));
  document.addEventListener('pointerdown', () => AUD.unlock(), { once: true });
  document.addEventListener('pointerdown', () => { if (!G && ready && !AUD.muted) AUD.bed('menu'); }, { once: true });

  // ------------------------------------------------------------------ Spiellogik
  let G = null, ents = [], lastLay = '';
  const cur = e => e.level > 0 ? LADDER[e.level - 1] : 0;
  const activeMember = e => e.members[e.mi % e.members.length];
  const multi = () => ents.length > 1;
  const SPD = () => window.__fast || 1;
  function sleep(ms) { const g = G; return new Promise((res, rej) => setTimeout(() => G === g && g ? res() : rej('abort'), ms / SPD())); }
  function say(text, hold) {
    const g = G; hold = hold || 2000; const b = $('bubble'); b.textContent = text; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    Studio.hostTalk(hold / 1000 + 0.2);
    return new Promise((res, rej) => {
      let done = false; const fin = () => { if (done) return; done = true; if (G !== g) return rej('abort'); res(); };
      if (AUD.tts) AUD.say(text, () => setTimeout(fin, 250)); else setTimeout(fin, hold / SPD());
    });
  }
  const hideBubble = () => { $('bubble').hidden = true; };
  function banner(text, sub, cls, ms) { const b = $('banner'); b.className = cls || ''; b.innerHTML = esc(text) + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(banner.k); banner.k = setTimeout(() => { b.hidden = true; }, ms || 2200); }

  function mkQ(raw) { const idx = shuffle([0, 1, 2, 3]); return { raw, c: raw.c, d: raw.d, q: raw.q, a: idx.map(i => raw.a[i]), r: idx.indexOf(0) }; }
  function drawQ(tier, e) {
    const all = window.QUIZ_Q; let pool = all.filter(q => q.d === tier && !G.used.has(q));
    if (!pool.length) pool = all.filter(q => q.d === tier);
    const lastC = e && e.lastCat; const alt = pool.filter(q => q.c !== lastC); if (alt.length) pool = alt;
    const raw = rnd(pool); G.used.add(raw); if (e) e.lastCat = raw.c; return mkQ(raw);
  }
  const getQ = (e, lvl) => e.qs[lvl] || (e.qs[lvl] = drawQ(Math.floor(lvl / 3) + 1, e));
  function buildNight(c) {
    const out = []; for (let d = 1; d <= 5; d++) { const pool = shuffle(window.QUIZ_Q.filter(q => q.c === c && q.d === d)); pool.slice(0, 2).forEach(r => out.push(mkQ(r))); } return out;
  }

  function buildEnts() {
    const mk = (name, logo, members) => ({ name, logo, members, mi: 0, level: 0, payout: 0, out: false, jokers: [1, 1, 1, 1], score: 0, right: 0, qs: [], lastCat: -1 });
    if (cfg.form === 'teams') return teams.map((t, i) => { const ms = t.mem.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n.slice(0, 14), conn: null })).concat(t.remote.map(r => ({ name: r.name, conn: r.conn }))); const nm = (t.name || '').trim() || 'Team ' + (i + 1); return mk(nm, t.logo, ms.length ? ms : [{ name: nm, conn: null }]); });
    const n = cfg.form === 'solo' ? 1 : cfg.form === 'duell' ? 2 : Math.min(4, players.length);
    return players.slice(0, n).map((p, i) => { const nm = (p.name || '').trim() || 'Spieler ' + (i + 1); return mk(nm, p.logo, [{ name: nm, conn: p.conn }]); });
  }
  async function startGame() {
    if (!ready || running) return; AUD.unlock();
    ents = buildEnts(); if (ents.length < 1) return;
    running = true; G = { mode: cfg.mode, used: new Set(), turn: null, paused: false, over: false, catWait: null, catEnt: null, catsDone: new Set(), msg: '' };
    $('menu').hidden = true; $('pair').hidden = true; $('end').hidden = true; $('pause').hidden = true; $('ui').hidden = false; $('qbox').hidden = true; $('panelJ').hidden = true; hideBubble();
    $('ladder').hidden = G.mode !== 'ladder'; $('board').hidden = G.mode === 'ladder'; $('jokers').hidden = G.mode !== 'ladder';
    buildJokers(); buildLadder(); Studio.setCast(ents.map(e => ({ name: e.name, logo: e.logo }))); updatePodiums(); layout(true); render();
    const g = G; try { await run(); } catch (e) { if (e !== 'abort') console.error(e); }
    if (G === g) { /* regulär beendet */ }
  }
  async function run() {
    Studio.setMood('menu'); Studio.shot('all'); AUD.bed('off'); AUD.sfx.intro(); Studio.allPose('cheer'); Studio.hostPose('wave');
    await say('Herzlich willkommen zu: Machst du mich an? – Das Quiz!', 2600); Studio.allPose('idle'); Studio.hostPose('idle');
    if (G.mode === 'ladder') await runLadder(); else await runNight();
    await finish();
  }
  function setActive(ei, sub) {
    const e = ents[ei], mb = activeMember(e); G.ei = ei; $('whoImg').src = logoSrc(e.logo);
    $('whoName').textContent = e.members.length > 1 || multi() ? (e.members.length > 1 ? `${e.name} · ${mb.name}` : e.name) : e.name; $('whoSub').textContent = sub || ''; $('whoName').parentElement.parentElement.style.borderColor = SLOTC[ei % 4];
    Studio.setActive(ei); Studio.shot('active', ei); ents.forEach((x, k) => { if (k !== ei && !x.out) Studio.pose(k, 'idle'); }); Studio.pose(ei, 'think'); updatePodiums();
  }
  function updatePodiums() { ents.forEach((e, i) => Studio.podium(i, e.name, G && G.mode === 'night' ? e.score + ' Pkt' : e.out ? (e.payout ? fmt(e.payout) : 'raus') : fmt(cur(e)), G && G.ei === i)); }

  // --- Leiter
  async function runLadder() {
    while (true) {
      const act = ents.filter(e => !e.out); if (!act.length) break;
      for (const e of act) { if (!e.out) await turn(e, ents.indexOf(e)); }
    }
  }
  // --- Quiznight
  async function runNight() {
    let pick = 0, played = 0;
    while (played < cfg.ncat && G.catsDone.size < window.QUIZ_CATS.length) {
      const picker = ents[pick % ents.length]; const c = await pickCategory(picker, pick % ents.length); if (c < 0) break;
      G.catsDone.add(c); played++; const qs = buildNight(c), cat = window.QUIZ_CATS[c];
      Studio.setMood('menu'); await say(`Kategorie ${cat.name}! Zehn Fragen – los geht's.`, 1800);
      for (let k = 0; k < qs.length; k++) { const ei = (pick + k) % ents.length; await turn(ents[ei], ei, qs[k], k); }
      pick++;
    }
  }
  function pickCategory(picker, ei) {
    return new Promise(res => {
      G.turn = null; $('qbox').hidden = true; $('panelJ').hidden = true; hideBubble(); setActive(ei, 'wählt die Kategorie'); layout(); AUD.bed('menu');
      G.catWait = { resolve: v => { G.catWait = null; $('catpick').hidden = true; res(v); } }; G.catEnt = picker;
      const mb = activeMember(picker), local = !mb.conn;
      $('catTitle').textContent = `${mb.name}, wähle eine Kategorie`; $('catSub').textContent = local ? '10 Fragen – von leicht bis schwer.' : '📱 ' + mb.name + ' wählt am Handy …';
      const grid = $('catgrid'); grid.innerHTML = '';
      window.QUIZ_CATS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'cat'; b.style.setProperty('--cc', c.col); b.disabled = !local || G.catsDone.has(i); b.innerHTML = `<i>${c.icon}</i>${esc(c.name)}<small>${G.catsDone.has(i) ? 'schon gespielt' : '10 Fragen'}</small>`; b.onclick = () => act({ t: 'cat', i }, null); grid.appendChild(b); });
      $('bShowEnd').hidden = !local; $('catpick').hidden = false; render();
    });
  }
  $('bShowEnd').onclick = () => act({ t: 'cat', i: -1 }, null);

  // --- eine Frage
  const answersEl = $('answers'), ansEls = [0, 1, 2, 3].map(i => { const b = document.createElement('button'); b.className = 'hex ans pre'; b.innerHTML = `<span><b>${LET[i]}:</b><em style="font-style:normal"></em></span>`; b.onclick = () => act({ t: 'ans', i }, null); answersEl.appendChild(b); return b; });
  async function turn(e, ei, nq, nk) {
    const night = G.mode === 'night'; const lvl = e.level, q = night ? nq : getQ(e, lvl), mb = activeMember(e);
    $('panelJ').hidden = true; $('qbox').hidden = true; hideBubble(); G.turn = null; G.catEnt = null;
    const cat = window.QUIZ_CATS[q.c];
    setActive(ei, night ? `${cat.name} · Frage ${nk + 1}/10` : `Frage ${lvl + 1}/15 · ${fmt(LADDER[lvl])}`);
    Studio.setMood('idle'); layout(); render();
    if (night) await say(multi() ? `${mb.name}, die Frage geht an Sie.` : 'Hier kommt die nächste Frage.', 1300);
    else await say(multi() || e.members.length > 1 ? `${mb.name}, Frage ${lvl + 1} für ${fmt(LADDER[lvl])}.` : `Frage ${lvl + 1} für ${fmt(LADDER[lvl])}.`, 1700);
    const T = G.turn = { ent: e, ei, q, mb, hidden: new Set(), sel: -1, phase: 'reveal', right: -1, ok: null, pj: null, pjText: '', busy: false, tl: 0, limit: cfg.timer ? cfg.timer : night ? (q.d >= 4 ? 25 : 20) : 0, resolve: null, night, k: nk, cat };
    AUD.bed('tension', night ? q.d / 5 : lvl / 14); hideBubble(); await showQuestion(q);
    T.phase = 'choose'; T.tl = T.limit; render();
    const res = await new Promise(r => { T.resolve = r; render(); });
    await afterAnswer(T, res);
  }
  async function showQuestion(q) {
    const T = G.turn; T.phase = 'reveal'; const cat = window.QUIZ_CATS[q.c];
    $('qbox').hidden = false; $('qcat').textContent = cat.icon + ' ' + cat.name; $('qcat').style.setProperty('--cc', cat.col);
    $('qlvl').textContent = T.night ? `Frage ${T.k + 1}/10 · ${100 * q.d} Pkt` : `${fmt(LADDER[T.ent.level])}`; $('timer').hidden = !T.limit;
    $('qtext').textContent = q.q; const h = $('qhex'); h.classList.remove('in'); void h.offsetWidth; h.classList.add('in');
    ansEls.forEach((b, i) => { b.className = 'hex ans pre'; b.querySelector('em').textContent = q.a[i]; });
    layout(true); render(); AUD.sfx.whoosh();
    if (AUD.tts) await say(q.q, 800); else await sleep(900);
    for (let i = 0; i < 4; i++) { if (T.hidden.has(i)) continue; ansEls[i].classList.remove('pre'); AUD.sfx.reveal(i); if (AUD.tts) await say(`${LET[i]}: ${q.a[i]}`, 500); else await sleep(520); }
    hideBubble();
  }
  async function afterAnswer(T, res) {
    const e = T.ent, q = T.q, ei = T.ei; mb_next(e);
    if (res.walk) { AUD.bed('off'); e.out = true; e.payout = cur(e); T.phase = 'result'; T.ok = null; updatePodiums(); render(); AUD.sfx.safe(); Studio.pose(ei, 'cheer'); banner('Ausgestiegen', fmt(e.payout) + ' gesichert', 'good', 3000); await say(`${e.name} steigt aus und nimmt ${fmt(e.payout)} mit nach Hause.`, 2600); await sleep(600); G.turn = null; render(); return; }
    T.phase = 'locked'; render();
    if (!res.timeout) { Studio.pose(ei, 'lock'); AUD.sfx.lock(); if (T.night) await sleep(700); else { AUD.sfx.drum(1.9); await sleep(2100); } } else { await sleep(300); }
    AUD.bed('off'); const ok = !res.timeout && res.ans === q.r; T.ok = ok; T.right = q.r; T.phase = 'result'; render();
    if (ok) {
      e.right++; Studio.setMood('good'); Studio.pose(ei, 'cheer'); AUD.sfx.right(); Studio.ledMessage('RICHTIG!', '#7CFF9A', 2.4);
      if (T.night) { const bonus = Math.round(100 * q.d * 0.5 * Math.max(0, T.tl) / T.limit), pts = 100 * q.d + bonus; e.score += pts; banner('+' + pts, bonus ? `davon ${bonus} Zeitbonus` : '', 'good'); updatePodiums(); await say(rnd(['Das ist richtig!', 'Absolut korrekt!', 'Sehr stark!', 'Richtig!']), 1400); }
      else {
        e.level++; const amount = LADDER[e.level - 1]; updatePodiums(); buildLadder();
        if (e.level === 15) { e.out = true; e.payout = amount; Studio.setMood('win'); AUD.sfx.million(); AUD.sfx.cheer(6, 1.4); Studio.ledMessage('1.000.000 €', '#ffd24a', 5); banner('MILLIONÄR!', e.name + ' gewinnt eine Million Euro', 'good', 4500); Studio.allPose('cheer'); await say(`${e.name}, Sie sind Millionär!`, 3800); }
        else if (SAFE.includes(e.level - 1)) { AUD.sfx.safe(); AUD.sfx.cheer(3.2, 1.2); banner(fmt(amount), 'Sicherheitsstufe erreicht!', 'good'); await say('Richtig! Sie haben die Sicherheitsstufe erreicht.', 2200); }
        else { banner(fmt(amount), '', 'good'); await say(rnd(['Das ist richtig!', 'Absolut korrekt!', 'Richtig – weiter geht’s!', 'Sehr gut!']), 1600); }
      }
    } else {
      Studio.setMood('bad'); Studio.pose(ei, 'sad'); AUD.sfx.wrongAll(); Studio.ledMessage(res.timeout ? 'ZEIT ABGELAUFEN' : 'FALSCH', '#ff7a8a', 2.4);
      if (T.night) { banner(res.timeout ? 'Zeit abgelaufen' : 'Leider falsch', 'Richtig war: ' + q.a[q.r], 'bad'); await say(res.timeout ? 'Die Zeit ist leider abgelaufen.' : rnd(['Leider falsch.', 'Oh nein, das war nicht richtig.']), 1700); }
      else {
        const safeAmt = e.level >= 10 ? LADDER[9] : e.level >= 5 ? LADDER[4] : 0; e.out = true; e.payout = safeAmt; updatePodiums();
        banner(res.timeout ? 'Zeit abgelaufen' : 'Leider falsch', 'Richtig war: ' + q.a[q.r] + ' – Gewinn: ' + fmt(safeAmt), 'bad', 3200); await say(`${res.timeout ? 'Die Zeit ist abgelaufen.' : 'Leider falsch.'} Richtig war ${q.a[q.r]}. Sie nehmen ${fmt(safeAmt)} mit nach Hause.`, 3200);
      }
    }
    await sleep(900); G.turn = null; if (!e.out || T.night) Studio.pose(ei, 'idle'); Studio.setMood('idle'); render();
  }
  const mb_next = e => { e.mi++; };

  // ------------------------------------------------------------------ Eingaben (lokal + Handy)
  const authorized = c => { const e = G && (G.turn ? G.turn.ent : G.catEnt); if (!e) return false; return (activeMember(e).conn || null) === (c || null); };
  function act(m, c) {
    if (!G || G.paused) return; if (m.t === 'cat') { if (G.catWait && authorized(c)) { const v = m.i | 0; if (v < 0 || (!G.catsDone.has(v) && v < window.QUIZ_CATS.length)) G.catWait.resolve(v); } return; }
    const T = G.turn; if (!T || T.busy || !authorized(c)) return;
    if (m.t === 'ans') {
      const i = m.i | 0; if (T.phase !== 'choose' && T.phase !== 'confirm') return; if (i < 0 || i > 3 || T.hidden.has(i)) return;
      T.sel = i; AUD.sfx.select(); if (T.night) { T.phase = 'locked'; T.resolve({ ans: i }); } else { T.phase = 'confirm'; say(`Ist ${LET[i]} Ihre endgültige Antwort?`, 1600).catch(() => {}); } render();
    } else if (m.t === 'yes') {
      if (T.phase === 'confirm' && T.sel >= 0) { T.phase = 'locked'; T.resolve({ ans: T.sel }); hideBubble(); } else if (T.phase === 'confirmWalk') { T.phase = 'locked'; T.resolve({ walk: true }); }
      render();
    } else if (m.t === 'no') { if (T.phase === 'confirm') { T.sel = -1; T.phase = 'choose'; } else if (T.phase === 'confirmWalk') T.phase = 'choose'; hideBubble(); render(); }
    else if (m.t === 'walk') { if (!T.night && T.phase === 'choose' && T.ent.level > 0) { T.phase = 'confirmWalk'; render(); } }
    else if (m.t === 'jk') useJoker(m.k | 0);
  }
  async function useJoker(k) {
    const T = G.turn, e = T.ent, q = T.q; if (T.night || k < 0 || k > 3 || !e.jokers[k] || (T.phase !== 'choose' && T.phase !== 'confirm')) return;
    const prev = T.phase; T.busy = true; T.phase = 'joker'; e.jokers[k] = 0; AUD.sfx.joker(); render(); const g = G;
    try {
      const left = [0, 1, 2, 3].filter(i => !T.hidden.has(i)), wrongs = left.filter(i => i !== q.r);
      if (k === 0) { shuffle(wrongs).slice(0, 2).forEach(i => T.hidden.add(i)); T.sel = -1; T.pjText = '50:50 – zwei falsche Antworten fallen weg.'; Studio.ledMessage('50 : 50', '#ffd24a', 2); await sleep(500); }
      else if (k === 1) {
        const base = [0.9, 0.78, 0.64, 0.5, 0.4][q.d - 1] + (4 - left.length) * 0.1; let pr = Math.min(0.95, Math.max(0.3, base + (Math.random() - 0.5) * 0.14)); const lead = q.d >= 4 && Math.random() < 0.15 ? rnd(wrongs) : q.r;
        const w = {}; left.forEach(i => w[i] = Math.random() + 0.2); const others = left.filter(i => i !== lead), tot = others.reduce((a, i) => a + w[i], 0) || 1; const pc = {}; let sum = 0;
        others.forEach(i => { pc[i] = Math.round((1 - pr) * 100 * w[i] / tot); sum += pc[i]; }); pc[lead] = 100 - sum; [0, 1, 2, 3].forEach(i => { if (!(i in pc)) pc[i] = 0; });
        T.pj = { type: 'aud', pc }; T.pjText = 'Publikum: ' + [0, 1, 2, 3].filter(i => !T.hidden.has(i)).map(i => `${LET[i]} ${pc[i]} %`).join(' · '); AUD.sfx.applause(1.8, 0.5); Studio.setMood('good'); await sleep(1700); Studio.setMood('idle');
      } else if (k === 2) {
        const f = rnd(FRIENDS); T.pj = { type: 'tel', f, text: '' }; T.pjText = `📞 Anruf bei ${f} …`; AUD.sfx.ring(); render(); await sleep(2200);
        const knows = Math.random() < [0.95, 0.85, 0.72, 0.55, 0.4][q.d - 1] + (4 - left.length) * 0.05, pick = knows ? q.r : rnd(left), conf = knows ? 80 + Math.floor(Math.random() * 18) : 30 + Math.floor(Math.random() * 25);
        T.pj.text = knows ? `Hmm … ja, das weiß ich! Ich bin mir zu ${conf} % sicher: ${LET[pick]}.` : `Puh … keine Ahnung. Ich würde ${LET[pick]} nehmen, aber sicher bin ich mir nur zu ${conf} %.`; T.pjText = `📞 ${f}: „${T.pj.text}“`; AUD.say(T.pj.text);
      } else if (k === 3) {
        const nq = drawQ(q.d, e); T.q = nq; e.qs[e.level] = nq; T.hidden = new Set(); T.sel = -1; T.pj = null; T.pjText = ''; Studio.ledMessage('NEUE FRAGE', '#00e5ff', 1.6); $('panelJ').hidden = true; await showQuestion(nq);
      }
    } catch (x) { if (x === 'abort') return; throw x; }
    if (G !== g) return; T.busy = false; T.phase = T.sel >= 0 && prev === 'confirm' && !T.hidden.has(T.sel) ? 'confirm' : 'choose'; render();
  }

  // ------------------------------------------------------------------ Zeit (Quiznight)
  let tmrAcc = 0;
  function tickTimer(dt) {
    const T = G && G.turn; if (!T || !T.limit || G.paused || (T.phase !== 'choose' && T.phase !== 'confirm')) return;
    const before = Math.ceil(T.tl); T.tl -= dt; const after = Math.ceil(T.tl);
    const warn = T.limit > 30 ? 10 : 5; if (after !== before) { if (T.tl <= warn && T.tl > 0) AUD.sfx.tickLow(); else if (T.tl > 0 && T.limit <= 30) AUD.sfx.tick(); }
    tmrAcc += dt; if (tmrAcc > 0.1) { tmrAcc = 0; drawTimer(T); }
    if (T.tl <= 0) { T.phase = 'locked'; T.tl = 0; drawTimer(T); T.resolve({ timeout: true }); render(); }
  }
  function drawTimer(T) { const t = $('timer'); t.style.setProperty('--p', Math.max(0, T.tl / T.limit)); $('timerN').textContent = Math.ceil(Math.max(0, T.tl)); t.classList.toggle('low', T.tl <= (T.limit > 30 ? 10 : 5)); }

  // ------------------------------------------------------------------ Ende
  async function finish() {
    G.turn = null; G.over = true; $('qbox').hidden = true; $('panelJ').hidden = true; hideBubble(); AUD.bed('off'); layout(true);
    const night = G.mode === 'night', val = e => night ? e.score : e.payout;
    const rank = ents.map((e, i) => ({ e, i })).sort((a, b) => val(b.e) - val(a.e) || b.e.level - a.e.level), top = rank[0];
    const h = save.hof[night ? 'night' : 'ladder']; rank.forEach(r => { if (val(r.e) > 0) h.push({ n: r.e.name, v: val(r.e) }); }); h.sort((a, b) => b.v - a.v); save.hof[night ? 'night' : 'ladder'] = h.slice(0, 10); persist();
    Studio.shot('all'); Studio.setMood('win'); AUD.sfx.win(); Studio.setActive(-1);
    ents.forEach((e, i) => Studio.pose(i, i === top.i ? 'cheer' : (multi() && val(e) < val(top.e) ? 'sad' : 'cheer'))); Studio.hostPose('wave'); updatePodiums();
    $('endTitle').textContent = multi() ? `🏆 ${top.e.name} gewinnt!` : (night ? 'Show beendet' : (top.e.payout >= 1000000 ? '🏆 MILLIONÄR!' : 'Ende der Show'));
    $('endSub').textContent = night ? 'Wertung nach Punkten' : 'Gewinne nach Leiter';
    $('rankList').innerHTML = rank.map((r, k) => `<div class="brow" style="--sc:${SLOTC[r.i % 4]}"><span>${k + 1}. ${esc(r.e.name)}</span><b>${night ? r.e.score + ' Pkt' : fmt(r.e.payout)}</b></div>`).join('');
    await sleep(2800); $('end').hidden = false; $('ui').hidden = true; running = false; G.over = true; pushState();
  }
  function quit() {
    G = null; running = false; ents = []; $('ui').hidden = true; $('pause').hidden = true; $('end').hidden = true; $('catpick').hidden = true; $('menu').hidden = false; AUD.bed('menu'); try { speechSynthesis.cancel(); } catch (e) {}
    Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Spieler 2', logo: 1 }]); Studio.setMood('menu'); Studio.shot('players'); Studio.hostPose('idle'); renderSetup(); pushState();
  }
  $('bPlay').onclick = startGame; $('bAgain').onclick = () => { $('end').hidden = true; running = false; G = null; startGame(); }; $('bBack').onclick = quit;
  $('bEnd').onclick = () => { if (G && !G.over) { G.paused = true; $('pause').hidden = false; } };
  $('bResume').onclick = () => { if (G) { G.paused = false; $('pause').hidden = true; } }; $('bQuit').onclick = quit;
  addEventListener('keydown', ev => {
    if (ev.target && ev.target.tagName === 'INPUT') return; const k = ev.key.toLowerCase();
    if (k === 'm') return togSnd(); if (!G || G.over) { if (k === 'enter' && !G && ready && !$('menu').hidden) startGame(); return; }
    if (k === 'escape' || k === 'p') { if (G.paused) $('bResume').click(); else $('bEnd').click(); return; }
    if ('abcd'.includes(k) && k.length === 1) act({ t: 'ans', i: LET.toLowerCase().indexOf(k) }, null);
    else if (k === 'enter' || k === 'j' || k === ' ') act({ t: 'yes' }, null); else if (k === 'n') act({ t: 'no' }, null);
    else if (k >= '1' && k <= '4') act({ t: 'jk', k: +k - 1 }, null);
  });
  $('bYes').onclick = () => act({ t: 'yes' }, null); $('bNo').onclick = () => act({ t: 'no' }, null); $('bWalk').onclick = () => act({ t: 'walk' }, null);
  $('ladder').onclick = () => { if (matchMedia('(max-width:820px),(max-aspect-ratio:1/1)').matches) $('ladder').classList.toggle('open'); };

  // ------------------------------------------------------------------ Oberfläche zeichnen
  function buildJokers() {
    const box = $('jokers'); box.innerHTML = ''; JNAMES.forEach((n, k) => { const b = document.createElement('button'); b.className = 'jk'; b.innerHTML = `${JICON[k]}<small>${n}</small>`; b.onclick = () => act({ t: 'jk', k }, null); box.appendChild(b); });
  }
  function buildLadder() {
    const e = G && G.turn ? G.turn.ent : (G && ents[G.ei || 0]) || { level: 0 }, ol = $('ladList'); ol.innerHTML = '';
    for (let i = 14; i >= 0; i--) { const li = document.createElement('li'); li.className = (SAFE.includes(i) ? 'safe ' : '') + (i < e.level ? 'done ' : '') + (i === e.level && !e.out ? 'cur' : ''); li.innerHTML = `<span>${i + 1}</span><span>${fmt(LADDER[i])}</span>`; ol.appendChild(li); }
    $('ladCur').innerHTML = `<small>FRAGE ${Math.min(15, e.level + 1)}/15</small>${fmt(LADDER[Math.min(14, e.level)])}`;
  }
  function layout(force) {
    if (!ready) return; const w = innerWidth, h = innerHeight, top = $('ui').hidden ? 0 : ($('tbar').offsetHeight + (matchMedia('(max-width:820px),(max-aspect-ratio:1/1)').matches && G && G.mode === 'ladder' ? 54 : 0)), bot = !$('qbox').hidden ? $('qbox').offsetHeight + 12 : 20;
    const key = [w, h, top, bot].join(); if (!force && key === lastLay) return; lastLay = key; Studio.resize(w, h, top, bot);
  }
  function render() {
    if (!G) return; const T = G.turn, night = G.mode === 'night';
    // Joker
    if (!night) { const e = T ? T.ent : ents[G.ei || 0]; const can = T && !T.busy && (T.phase === 'choose' || T.phase === 'confirm') && authorized(null); [...$('jokers').children].forEach((b, k) => { b.classList.toggle('used', !e || !e.jokers[k]); b.disabled = !can; }); buildLadder(); }
    else { $('board').innerHTML = '<h4>WERTUNG</h4>' + ents.map((e, i) => `<div class="brow ${G.ei === i ? 'act' : ''}" style="--sc:${SLOTC[i % 4]}"><span>${esc(e.name)}</span><b>${e.score}</b></div>`).join(''); }
    // Frage
    if (T) {
      const loc = authorized(null), pl = T.phase;
      ansEls.forEach((b, i) => {
        b.classList.toggle('hid', T.hidden.has(i)); b.classList.toggle('sel', T.sel === i && pl !== 'result'); b.classList.toggle('lock', T.sel === i && pl === 'locked');
        b.classList.toggle('right', pl === 'result' && i === T.right); b.classList.toggle('wrong', pl === 'result' && !T.ok && i === T.sel); b.disabled = !(loc && (pl === 'choose' || pl === 'confirm'));
      });
      const showConf = (pl === 'confirm' || pl === 'confirmWalk') && loc; $('confirm').hidden = !showConf;
      if (showConf) { $('confirmTxt').textContent = pl === 'confirm' ? `${LET[T.sel]}: ${T.q.a[T.sel]} – endgültige Antwort?` : `Aussteigen und ${fmt(cur(T.ent))} mitnehmen?`; $('bYes').textContent = pl === 'confirm' ? 'Ja, final!' : 'Aussteigen'; }
      const w = $('bWalk'); w.hidden = T.night || T.ent.level === 0 || pl !== 'choose' || !loc; w.textContent = `Aussteigen · ${fmt(cur(T.ent))}`;
      if (!loc && pl !== 'result') $('whoSub').textContent = '📱 ' + T.mb.name + ' spielt am Handy';
      if (T.limit) drawTimer(T);
      const pj = $('panelJ'); if (T.pj) { pj.hidden = false; if (T.pj.type === 'aud') { if (!pj.dataset.aud || pj.dataset.aud !== String(T.q.q)) { pj.dataset.aud = T.q.q; pj.innerHTML = '<h5>👥 PUBLIKUM</h5><div class="bars">' + [0, 1, 2, 3].map(i => `<div class="${T.hidden.has(i) ? 'hid' : ''}"><b>${T.pj.pc[i]}%</b><i data-h="${T.pj.pc[i]}"></i><span>${LET[i]}</span></div>`).join('') + '</div>'; requestAnimationFrame(() => requestAnimationFrame(() => pj.querySelectorAll('i').forEach(x => x.style.height = x.dataset.h + '%'))); } } else { pj.dataset.aud = ''; pj.innerHTML = `<h5>📞 TELEFONJOKER</h5><div class="tel"><b>${esc(T.pj.f)}</b>: ${T.pj.text ? '„' + esc(T.pj.text) + '“' : 'Es klingelt …'}</div>`; } } else { pj.hidden = true; pj.dataset.aud = ''; }
    }
    layout(); pushState();
  }
  // ------------------------------------------------------------------ Zustand an Handys senden
  let pushT = 0;
  function pushState() { if (!conns.size || pushT) return; pushT = setTimeout(() => { pushT = 0; conns.forEach(c => send(c, stateFor(c))); }, 30); }
  function stateFor(c) {
    const meEnt = ents.find(e => e.members.some(m => m.conn === c)), me = meEnt ? { name: meEnt.name, line: G && G.mode === 'night' ? meEnt.score + ' Punkte' : (meEnt.out ? 'Gewinn: ' + fmt(meEnt.payout) : fmt(cur(meEnt)) + ' · Frage ' + (meEnt.level + 1)) } : null;
    if (!G) return { t: 'st', ph: 'lobby', me, msg: running ? '' : 'Warte auf den Start der Show …' };
    if (G.over) return { t: 'st', ph: 'end', me, msg: 'Die Show ist beendet. Danke fürs Mitspielen!' };
    if (G.catWait && G.catEnt) { const mine = activeMember(G.catEnt).conn === c; return { t: 'st', ph: 'cat', me, mine, who: activeMember(G.catEnt).name, cats: window.QUIZ_CATS.map((x, i) => ({ n: x.name, i: x.icon, done: G.catsDone.has(i) })) }; }
    const T = G.turn; if (!T) return { t: 'st', ph: 'wait', me, msg: 'Gleich geht’s weiter …' };
    const e = T.ent, mine = activeMember(e).conn === c;
    return { t: 'st', ph: 'q', me, mine, who: T.mb.name, night: T.night, q: { cat: T.cat.icon + ' ' + T.cat.name, lvl: T.night ? `Frage ${T.k + 1}/10` : `Frage ${e.level + 1}/15 · ${fmt(LADDER[e.level])}`, text: T.q.q, ans: T.q.a.map((a, i) => T.hidden.has(i) ? null : a) }, sel: T.sel, phase: T.phase, right: T.phase === 'result' ? T.right : -1, jokers: e.jokers, canWalk: !T.night && e.level > 0 && T.phase === 'choose', walk: fmt(cur(e)), time: T.limit && (T.phase === 'choose' || T.phase === 'confirm') ? Math.ceil(T.tl) : null, msg: T.pjText || '' };
  }
  // Test-/Debug-Zugriff
  window.__quiz = { get G() { return G; }, get ents() { return ents; }, act, startGame, cfg, get players() { return players; }, get teams() { return teams; }, get ready() { return ready; }, quit, LADDER };
}
