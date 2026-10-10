'use strict';
/* AnMaCha Showdown – Das Mikro-Duell: 7 Mini-Spiele (1–7 Punkte), wer zuerst 15 hat, gewinnt. Gegen den Moderator (Bot) oder zu zweit an einem Gerät. */
const $ = id => document.getElementById(id);
const NAMES = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio'];
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen: ' + src)); document.head.appendChild(s); });
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const SLOTC = ['#00E5FF', '#FF2D95'], WIN = 15, ROUNDS = 7, SKILLS = ['Anfänger', 'Normal', 'Profi'];

(function main() {
  if (window.self !== window.top) $('backLink').hidden = true;
  let save = { opp: 'bot', skill: 1, names: ['', ''], logos: [6, 1], stats: { 0: [0, 0], 1: [0, 0], 2: [0, 0] } };
  try { const s = JSON.parse(localStorage.getItem('asdSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('asdSave', JSON.stringify(save)); } catch (e) {} };
  const cfg = { opp: save.opp === 'duo' ? 'duo' : 'bot', skill: [0, 1, 2].includes(save.skill) ? save.skill : 1 };
  let logos = [], ready = false, running = false, G = null, ents = [], lastLay = '';

  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  (function brand() {
    const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`)));
    Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; });
  })();

  // ------------------------------------------------------------------ Menü
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  function renderSetup() {
    document.querySelectorAll('[data-opp]').forEach(b => b.classList.toggle('on', b.dataset.opp === cfg.opp));
    document.querySelectorAll('[data-skill]').forEach(b => b.classList.toggle('on', +b.dataset.skill === cfg.skill));
    $('skillRow').hidden = cfg.opp !== 'bot';
    const box = $('plist'); box.innerHTML = '';
    for (let i = 0; i < (cfg.opp === 'duo' ? 2 : 1); i++) {
      const d = document.createElement('div'); d.className = 'pc glass'; d.style.setProperty('--sc', SLOTC[i]);
      d.innerHTML = `<img class="lg" alt="" src="${logoSrc(save.logos[i])}" title="${esc(NAMES[save.logos[i]] || '')}"><div class="col"><input maxlength="14" value="${esc(save.names[i])}" placeholder="Spieler ${i + 1}"><span class="info">Auf das Logo tippen = anderes Sender-Shirt</span></div>`;
      const inp = d.querySelector('input'); inp.oninput = () => { save.names[i] = inp.value; persist(); };
      d.querySelector('.lg').onclick = e => { save.logos[i] = nextLogo(save.logos[i]); e.target.src = logoSrc(save.logos[i]); persist(); };
      box.appendChild(d);
    }
    $('games').innerHTML = (window.SD_GAMES || []).map(g => `<span>${esc(g.name)}</span>`).join('');
    const st = save.stats[cfg.skill] || [0, 0]; $('stats').textContent = cfg.opp === 'bot' ? `Bilanz gegen den Moderator (${SKILLS[cfg.skill]}): ${st[0]} Siege · ${st[1]} Niederlagen` : '';
    $('bPlay').disabled = !(ready && !running); $('bPlay').textContent = ready ? 'DUELL STARTEN' : 'LADEN …';
  }
  document.querySelectorAll('[data-opp]').forEach(b => b.onclick = () => { cfg.opp = b.dataset.opp; save.opp = cfg.opp; persist(); renderSetup(); });
  document.querySelectorAll('[data-skill]').forEach(b => b.onclick = () => { cfg.skill = +b.dataset.skill; save.skill = cfg.skill; persist(); renderSetup(); });
  const syncSnd = () => { $('bSnd').textContent = AUD.muted ? '🔇' : '🔊'; $('bMenuSnd').textContent = AUD.muted ? '🔇 Ton aus' : '🔊 Ton an'; $('bVoice').style.opacity = AUD.tts ? 1 : 0.45; $('bMenuVoice').textContent = AUD.tts ? '🎙 Stimme: an' : '🎙 Stimme: aus'; $('bMenuVoice').hidden = $('bVoice').hidden = !AUD.hasTts; };
  const togSnd = () => { AUD.setMute(!AUD.muted); syncSnd(); if (!G && !AUD.muted) AUD.bed('menu'); };
  const togVoice = () => { AUD.setTts(!AUD.tts); syncSnd(); if (AUD.tts) AUD.say('Hallo und willkommen zum Showdown!'); };
  $('bSnd').onclick = $('bMenuSnd').onclick = togSnd; $('bVoice').onclick = $('bMenuVoice').onclick = togVoice; syncSnd();

  Promise.all([loadLogos(), loadScript(THREE_CDN).then(() => loadScript('studio.js'))]).then(() => {
    Studio.init($('cv'), logos); Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Moderator', logo: 6, host: true }]); Studio.setMood('menu'); Studio.shot('players');
    ready = true; layout(true); $('loadInfo').textContent = `${window.SD_GAMES.length} Mini-Spiele · ${logos.length} Sender-Logos`; renderSetup();
    let last = performance.now(); (function loop(n) { requestAnimationFrame(loop); const dt = Math.min(0.1, (n - last) / 1000); last = n; Studio.frame(dt); })(last);
  }).catch(e => { $('err').hidden = false; $('errTxt').textContent = 'Das Studio konnte nicht geladen werden (' + e.message + '). Bitte Internetverbindung prüfen.'; });
  renderSetup(); addEventListener('resize', () => layout(true));
  document.addEventListener('pointerdown', () => AUD.unlock(), { once: true });
  document.addEventListener('pointerdown', () => { if (!G && ready && !AUD.muted) AUD.bed('menu'); }, { once: true });

  // ------------------------------------------------------------------ Hilfen
  const SPD = () => window.__fast || 1;
  function sleep(ms) { const g = G; return new Promise((res, rej) => setTimeout(() => G === g && g ? res() : rej('abort'), ms / SPD())); }
  function say(text, hold) {
    const g = G; hold = hold || 2000; const b = $('bubble'); b.innerHTML = '<b style="color:var(--c);letter-spacing:.1em;font-size:.8em;display:block">🎤 MODERATOR</b>' + esc(text); b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; Studio.hostTalk(hold / 1000 + 0.2);
    return new Promise((res, rej) => { let done = false; const fin = () => { if (done) return; done = true; if (G !== g) return rej('abort'); res(); }; if (AUD.tts) AUD.say(text, () => setTimeout(fin, 250)); else setTimeout(fin, hold / SPD()); });
  }
  const hideBubble = () => { $('bubble').hidden = true; };
  function banner(text, sub, cls, ms) { const b = $('banner'); b.className = cls || ''; b.innerHTML = esc(text) + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(banner.k); banner.k = setTimeout(() => { b.hidden = true; }, ms || 2400); }
  function layout(force) {
    if (!ready) return; const w = innerWidth, h = innerHeight, top = $('ui').hidden ? 0 : $('race').offsetTop + $('race').offsetHeight + 6, bot = $('ui').hidden || $('gp').hidden ? 20 : $('gp').offsetHeight + 14, key = [w, h, top, bot].join(); if (!force && key === lastLay) return; lastLay = key; Studio.resize(w, h, top, bot);
  }
  function renderRace() {
    $('race').innerHTML = ents.map((e, i) => `<div class="rrow" style="--sc:${SLOTC[i]}"><img alt="" src="${logoSrc(e.logo)}"><span class="nm">${esc(e.name)}</span><div class="pips">${Array.from({ length: WIN }, (_, k) => `<i class="${k < e.pts ? 'on' : ''}"></i>`).join('')}</div><b>${e.pts}</b></div>`).join('');
    ents.forEach((e, i) => Studio.podium(i, e.name, e.pts + ' Punkte', G && G.active === i)); layout();
  }
  function showPanel(on) { $('gp').hidden = !on; layout(true); }
  function ready$(title, text, label) {
    const g = G; showPanel(true); $('gpIn').innerHTML = `<div class="gtitle">${title}</div><div class="gsub">${text}</div><button class="pill go" id="rd">${label || 'LOS!'}</button>`; layout(true);
    return new Promise((res, rej) => { const done = () => { document.removeEventListener('keydown', kd); if (G !== g) return rej('abort'); res(); }; const kd = e => { if ((e.key === 'Enter' || e.key === ' ') && !(e.target && e.target.tagName === 'INPUT')) { e.preventDefault(); done(); } }; $('rd').onclick = done; document.addEventListener('keydown', kd); });
  }

  // ------------------------------------------------------------------ Spielablauf
  async function startGame() {
    if (!ready || running) return; AUD.unlock(); running = true; const bot = cfg.opp === 'bot';
    ents = [{ name: (save.names[0] || '').trim() || 'Spieler 1', logo: save.logos[0], pts: 0, host: false, bot: false }, bot ? { name: 'Moderator', logo: 6, pts: 0, host: true, bot: true } : { name: (save.names[1] || '').trim() || 'Spieler 2', logo: save.logos[1], pts: 0, host: false, bot: false }];
    G = { active: -1, paused: false, over: false }; const g = G;
    $('menu').hidden = true; $('end').hidden = true; $('pause').hidden = true; $('ui').hidden = false; $('gp').hidden = true; hideBubble();
    Studio.setCast(ents.map(e => ({ name: e.name, logo: e.logo, host: e.host }))); Studio.setMood('menu'); renderRace(); layout(true);
    try { await run(); } catch (e) { if (e !== 'abort') console.error(e); } if (G === g) { /* regulär beendet */ }
  }
  async function run() {
    Studio.shot('players'); AUD.bed('off'); AUD.sfx.intro(); Studio.allPose('cheer'); Studio.hostPose('wave');
    await say(`Willkommen zum AnMaCha Showdown! ${ents[0].name} gegen ${ents[1].name}.`, 2600); Studio.allPose('idle'); Studio.hostPose('idle');
    await say(`Sieben Spiele – das erste zählt einen Punkt, das letzte sieben. Wer zuerst ${WIN} hat, gewinnt!`, 3000);
    const order = shuffle(window.SD_GAMES.slice()).slice(0, ROUNDS); let starter = 0, winner = -1;
    for (let r = 0; r < ROUNDS; r++) {
      const gm = order[r], pts = r + 1, P0 = { shared: {} }; $('rnd').innerHTML = `Spiel ${r + 1}/${ROUNDS}<small>${esc(gm.name)} · ${pts} ${pts === 1 ? 'Punkt' : 'Punkte'}</small>`; Studio.setMood('menu'); Studio.ledMessage(`SPIEL ${r + 1}`, '#ffd24a', 2.4);
      await say(`Spiel ${r + 1}: ${gm.name}. Es gibt ${pts} ${pts === 1 ? 'Punkt' : 'Punkte'}!`, 2200); AUD.bed('tension', r / 6);
      const res = [null, null], seq = [starter, 1 - starter];
      for (const k of seq) res[k] = await turn(gm, k, P0, k === seq[0]);
      showPanel(false); await settle(gm, res, pts); if (ents.some(e => e.pts >= WIN)) break; starter = 1 - starter;
    }
    // Entscheidung
    while (!ents.some(e => e.pts >= WIN) && ents[0].pts === ents[1].pts) {
      await say('Gleichstand! Es gibt ein Stechen – Tipp-Fieber, sechs Sekunden!', 2400); const tap = window.SD_GAMES.find(x => x.id === 'tap'), res = [null, null], P0 = { shared: {} };
      for (const k of [0, 1]) res[k] = await turn(tap, k, P0, k === 0, 6); showPanel(false); await settle(tap, res, 1, true);
    }
    winner = ents[0].pts > ents[1].pts ? 0 : 1; await finish(winner);
  }
  async function turn(gm, k, P0, first, secs) {
    const e = ents[k]; G.active = k; renderRace(); Studio.setActive(k); Studio.shot('active', k); ents.forEach((x, i) => Studio.pose(i, i === k ? 'think' : 'idle'));
    const P = { el: $('gpIn'), shared: P0.shared, logos, sleep, alive: () => !!G && !G.over, sfx: { click: AUD.sfx.click, select: AUD.sfx.select, reveal: AUD.sfx.reveal, tick: AUD.sfx.tick, bad: AUD.sfx.bad, good: AUD.sfx.good } };
    if (e.bot) {
      showPanel(true); $('gpIn').innerHTML = `<div class="gtitle">${esc(gm.name)}</div><div class="gsub">🎤 Der Moderator spielt <span class="dots"></span></div>`; layout(true); await say(rnd(['Jetzt zeige ich euch, wie das geht!', 'Moment, ich muss mich kurz konzentrieren.', 'Das kriege ich hin!']), 1500); await sleep(1500 + Math.random() * 1200);
      const r = secs ? gm.bot(cfg.skill, P, secs) : gm.bot(cfg.skill, P); $('gpIn').innerHTML = `<div class="gtitle">${esc(gm.name)}</div><div class="gsub">Moderator: <b style="color:var(--y)">${esc(r.text)}</b></div>`; AUD.sfx.reveal(2); await sleep(1500); hideBubble(); return r;
    }
    window.__sdP = P; if (window.__autoplay) { const r = secs ? gm.bot(2, P, secs) : gm.bot(2, P); await sleep(300); return r; }
    const duo = !ents[0].bot && !ents[1].bot; hideBubble();
    await ready$(esc(gm.name), `${gm.rules}<br><b>${esc(e.name)}</b>${duo ? ', gib das Gerät weiter und mach dich bereit!' : ', bist du bereit?'}`, 'LOS!'); AUD.sfx.whoosh();
    for (const n of [3, 2, 1]) { $('gpIn').innerHTML = `<div class="gtitle" style="font-size:72px">${n}</div>`; AUD.sfx.tickLow(); await sleep(650); }
    const r = await (secs ? gm.play(P, secs) : gm.play(P)); hideBubble(); return r;
  }
  async function settle(gm, res, pts, sudden) {
    const better = gm.better === 'high' ? 1 : -1, d = (res[0].v - res[1].v) * better, tie = Math.abs(res[0].v - res[1].v) < (gm.id === 'react' ? 1 : 1e-6), w = tie ? -1 : d > 0 ? 0 : 1;
    AUD.bed('off'); Studio.shot('players'); ents.forEach((e, i) => Studio.pose(i, 'idle')); G.active = -1; Studio.setActive(-1);
    const ans = res.find(r => r.answer); const line = `${ents[0].name}: ${res[0].text} · ${ents[1].name}: ${res[1].text}` + (ans ? ` · Lösung: ${ans.answer[1]}${ans.answer[2] ? ' ' + ans.answer[2] : ''}` : '');
    if (w < 0) { banner('Unentschieden', 'kein Punkt', 'gold'); AUD.sfx.reveal(3); await say(`Unentschieden! ${line}`, 3200); }
    else { ents[w].pts += pts; const humanWin = !ents[w].bot; Studio.pose(w, 'cheer'); Studio.pose(1 - w, 'sad'); Studio.setMood(humanWin || cfg.opp === 'duo' ? 'good' : 'bad'); Studio.ledMessage(`+${pts} ${ents[w].name.toUpperCase()}`, '#7CFF9A', 2.6); if (humanWin) AUD.sfx.right(); else AUD.sfx.wrongAll(); banner(`+${pts} für ${ents[w].name}`, sudden ? 'Stechen entschieden!' : `${pts === 1 ? 'Ein Punkt' : pts + ' Punkte'}`, humanWin ? 'good' : 'bad', 3000); renderRace(); Studio.confetti(humanWin ? 80 : 20); await say(`${ents[w].name} gewinnt das Spiel! ${line}`, 3400); }
    Studio.setMood('idle'); Studio.pose(0, 'idle'); Studio.pose(1, 'idle'); await sleep(300);
  }
  async function finish(w) {
    G.over = true; showPanel(false); AUD.bed('off'); const win = ents[w], bot = cfg.opp === 'bot';
    if (bot) { const st = save.stats[cfg.skill] || (save.stats[cfg.skill] = [0, 0]); if (w === 0) st[0]++; else st[1]++; persist(); }
    Studio.shot('all'); Studio.setMood('win'); AUD.sfx.win(); Studio.pose(w, 'cheer'); Studio.pose(1 - w, 'sad'); Studio.hostPose('wave'); renderRace(); banner(win.name + ' gewinnt!', `${ents[0].pts} : ${ents[1].pts}`, 'gold', 3600);
    await say(w === 0 || !bot ? `${win.name} gewinnt den Showdown mit ${win.pts} Punkten! Herzlichen Glückwunsch!` : 'Der Moderator gewinnt – aber die Revanche wartet!', 3600);
    $('endTitle').textContent = (!bot || w === 0) ? `🏆 ${win.name} gewinnt!` : 'Der Moderator gewinnt'; $('endSub').textContent = bot ? `Stärke: ${SKILLS[cfg.skill]}` : 'Zu zweit am Gerät';
    $('rankList').innerHTML = [0, 1].sort((a, b) => ents[b].pts - ents[a].pts).map((i, k) => `<div class="brow" style="--sc:${SLOTC[i]}"><span>${k + 1}. ${esc(ents[i].name)}</span><b>${ents[i].pts} Punkte</b></div>`).join('');
    await sleep(1800); $('end').hidden = false; $('ui').hidden = true; running = false;
  }
  function quit() {
    G = null; running = false; ents = []; $('ui').hidden = true; $('pause').hidden = true; $('end').hidden = true; $('menu').hidden = false; AUD.bed('menu'); try { speechSynthesis.cancel(); } catch (e) {}
    Studio.setCast([{ name: 'Spieler 1', logo: 6 }, { name: 'Moderator', logo: 6, host: true }]); Studio.setMood('menu'); Studio.shot('players'); renderSetup();
  }
  $('bPlay').onclick = startGame; $('bAgain').onclick = () => { $('end').hidden = true; running = false; G = null; startGame(); }; $('bBack').onclick = quit;
  $('bEnd').onclick = () => { if (G && !G.over) { $('pause').hidden = false; } }; $('bResume').onclick = () => { $('pause').hidden = true; }; $('bQuit').onclick = quit;
  addEventListener('keydown', ev => { if (ev.target && ev.target.tagName === 'INPUT') return; const k = ev.key.toLowerCase(); if (k === 'm') togSnd(); if (k === 'enter' && !G && ready && !$('menu').hidden) startGame(); });
  window.__sd = { get logos() { return logos; }, get G() { return G; }, get ents() { return ents; }, cfg, startGame, quit, save };
})();
