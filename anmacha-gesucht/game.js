'use strict';
/* AnMaCha Gesucht & Gefunden – vier Rate-Spielarten im TV-Studio: Hinweis-Raten, Fragen-Raten, Gesichter-Radar, Stirnband-Party. */
const $ = id => document.getElementById(id);
const NAMES = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio'];
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen: ' + src)); document.head.appendChild(s); });
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const SLOTC = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'], SKILLS = ['Anfänger', 'Normal', 'Profi'];
const MODES = [
  { id: 'hint', name: '💡 Hinweis-Raten', sub: '5 Hinweise – je früher richtig, desto mehr Punkte', max: 4, rounds: [3, 5, 8], rl: 'RUNDEN' },
  { id: 'ask', name: '❓ Fragen-Raten', sub: 'Ja/Nein-Fragen stellen, Lösung finden', max: 4, rounds: [1, 2, 3], rl: 'RUNDEN PRO SPIELER' },
  { id: 'radar', name: '🙂 Gesichter-Radar', sub: 'Allein gegen den Moderator', max: 1, rounds: null, rl: 'MODERATOR-STÄRKE' },
  { id: 'band', name: '🎉 Stirnband-Party', sub: 'Gruppenspiel mit 60-Sekunden-Timer', max: 4, rounds: [1, 2, 3], rl: 'RUNDEN PRO SPIELER' }
];
const TURN_SECS = 60, ASK_MAX = 15;

(function main() {
  if (window.self !== window.top) $('backLink').hidden = true;
  let save = { mode: 'hint', cats: [], rounds: { hint: 5, ask: 1, band: 1 }, skill: 1, n: 2, names: ['', '', '', ''], logos: [6, 1, 3, 8], top: {} };
  try { const s = JSON.parse(localStorage.getItem('ggSave') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem('ggSave', JSON.stringify(save)); } catch (e) {} };
  const DATA = window.GG_DATA || [], catById = id => DATA.find(c => c.id === id);
  if (!Array.isArray(save.cats) || !save.cats.length) save.cats = DATA.map(c => c.id);
  let logos = [], ready = false, running = false, G = null, ents = [], lastLay = '';
  const cfg = () => ({ mode: MODES.find(m => m.id === save.mode) || MODES[0] });

  const probe = i => new Promise(res => { const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg']; let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ idx: i - 1, src, im, name: NAMES[i - 1] }); im.onerror = nx; im.src = src; }; nx(); });
  const loadLogos = () => Promise.all(Array.from({ length: 13 }, (_, i) => probe(i + 1))).then(r => { logos = r.filter(Boolean); });
  const logoSrc = i => { const l = logos.find(x => x.idx === i); return l ? l.src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; };
  (function brand() {
    const c = []; ['', '../'].forEach(d => ['png', 'jpg', 'jpeg', 'svg', 'webp'].forEach(e => c.push(`${d}logo.${e}`)));
    Promise.all(c.map(src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; }))).then(l => { const s = l.find(Boolean); if (!s) return; const im = $('brandImg'); im.src = s; im.hidden = false; $('brandText').hidden = true; if (!s.startsWith('../')) $('brandSub').hidden = true; });
  })();

  // ------------------------------------------------------------------ Menü
  const nextLogo = i => { if (!logos.length) return i; const ids = logos.map(l => l.idx), p = ids.indexOf(i); return ids[(p + 1) % ids.length]; };
  const nPlayers = () => Math.min(save.n, cfg().mode.max);
  function previewCast() { if (!ready) return; const n = nPlayers(); Studio.setCast(Array.from({ length: n }, (_, i) => ({ name: (save.names[i] || '').trim() || 'Spieler ' + (i + 1), logo: save.logos[i] }))); }
  function renderSetup() {
    const md = cfg().mode;
    $('modes').innerHTML = MODES.map(m => `<button class="mode ${m.id === md.id ? 'on' : ''}" data-m="${m.id}">${m.name}<small>${m.sub}</small></button>`).join('');
    $('modes').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { save.mode = b.dataset.m; persist(); renderSetup(); previewCast(); });
    const useCats = md.id !== 'radar';
    $('cats').previousElementSibling.hidden = $('cats').hidden = !useCats;
    $('cats').innerHTML = DATA.map(c => { const dis = md.id === 'ask' && !c.qs.length; return `<button class="chip ${save.cats.includes(c.id) && !dis ? 'on' : ''}" data-c="${c.id}" ${dis ? 'disabled style="opacity:.35"' : ''}>${c.icon} ${esc(c.name)}<small>${c.items.length} Begriffe</small></button>`; }).join('');
    $('cats').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const id = b.dataset.c, i = save.cats.indexOf(id); if (i >= 0) { if (save.cats.length > 1) save.cats.splice(i, 1); } else save.cats.push(id); persist(); renderSetup(); });
    $('rh').textContent = md.rl;
    if (md.rounds) $('rounds').innerHTML = md.rounds.map(r => `<button class="chip ${save.rounds[md.id] === r ? 'on' : ''}" data-r="${r}">${r}</button>`).join('');
    else $('rounds').innerHTML = SKILLS.map((s, i) => `<button class="chip ${save.skill === i ? 'on' : ''}" data-k="${i}">${s}</button>`).join('');
    $('rounds').querySelectorAll('[data-r]').forEach(b => b.onclick = () => { save.rounds[md.id] = +b.dataset.r; persist(); renderSetup(); });
    $('rounds').querySelectorAll('[data-k]').forEach(b => b.onclick = () => { save.skill = +b.dataset.k; persist(); renderSetup(); });
    const multi = md.max > 1; $('plh').hidden = $('pcount').hidden = !multi && false;
    $('plh').textContent = multi ? 'SPIELER / TEAMS' : 'SPIELER';
    $('pcount').innerHTML = multi ? [1, 2, 3, 4].filter(n => n <= md.max).map(n => `<button class="chip ${nPlayers() === n ? 'on' : ''}" data-n="${n}">${n}</button>`).join('') : '';
    $('pcount').querySelectorAll('[data-n]').forEach(b => b.onclick = () => { save.n = +b.dataset.n; persist(); renderSetup(); previewCast(); });
    const box = $('plist'); box.innerHTML = '';
    for (let i = 0; i < nPlayers(); i++) {
      const d = document.createElement('div'); d.className = 'pc glass'; d.style.setProperty('--sc', SLOTC[i]);
      d.innerHTML = `<img class="lg" alt="" src="${logoSrc(save.logos[i])}" title="${esc(NAMES[save.logos[i]] || '')}"><div class="col"><input maxlength="14" value="${esc(save.names[i])}" placeholder="Spieler ${i + 1}"><span class="info">Auf das Logo tippen = anderes Sender-Shirt</span></div>`;
      const inp = d.querySelector('input'); inp.oninput = () => { save.names[i] = inp.value; persist(); };
      d.querySelector('.lg').onclick = e => { save.logos[i] = nextLogo(save.logos[i]); e.target.src = logoSrc(save.logos[i]); persist(); previewCast(); };
      box.appendChild(d);
    }
    $('bPlay').disabled = !(ready && !running); $('bPlay').textContent = ready ? 'SPIEL STARTEN' : 'LADEN …';
  }
  const syncSnd = () => { $('bSnd').textContent = AUD.muted ? '🔇' : '🔊'; $('bMenuSnd').textContent = AUD.muted ? '🔇 Ton aus' : '🔊 Ton an'; $('bVoice').style.opacity = AUD.tts ? 1 : 0.45; $('bMenuVoice').textContent = AUD.tts ? '🎙 Stimme: an' : '🎙 Stimme: aus'; $('bMenuVoice').hidden = $('bVoice').hidden = !AUD.hasTts; };
  const togSnd = () => { AUD.setMute(!AUD.muted); syncSnd(); if (!G && !AUD.muted) AUD.bed('menu'); };
  const togVoice = () => { AUD.setTts(!AUD.tts); syncSnd(); if (AUD.tts) AUD.say('Hallo und willkommen bei Gesucht und Gefunden!'); };
  $('bSnd').onclick = $('bMenuSnd').onclick = togSnd; $('bVoice').onclick = $('bMenuVoice').onclick = togVoice; syncSnd();

  // Bestenliste (lokal)
  let topTab = 'hint';
  function addTop(mode, name, pts) { if (!(pts > 0)) return; const l = save.top[mode] || (save.top[mode] = []); l.push([name, pts, new Date().toLocaleDateString('de-DE')]); l.sort((a, b) => b[1] - a[1]); l.length = Math.min(l.length, 10); persist(); }
  function renderTop() {
    $('topTabs').innerHTML = MODES.map(m => `<button class="chip ${m.id === topTab ? 'on' : ''}" data-t="${m.id}">${m.name}</button>`).join('');
    $('topTabs').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { topTab = b.dataset.t; renderTop(); });
    const l = save.top[topTab] || []; $('topList').innerHTML = l.length ? l.map((r, i) => `<div class="brow" style="--sc:${SLOTC[i % 4]}"><span>${i + 1}. ${esc(r[0])} <small style="color:var(--mut)">${esc(r[2])}</small></span><b>${r[1]}</b></div>`).join('') : '<p class="sub" style="text-align:center">Noch keine Einträge – leg los!</p>';
  }
  $('bTop').onclick = () => { topTab = save.mode; renderTop(); $('top').hidden = false; }; $('bTopClose').onclick = () => { $('top').hidden = true; };

  Promise.all([loadLogos(), loadScript(THREE_CDN).then(() => loadScript('studio.js'))]).then(() => {
    Studio.init($('cv'), logos); Studio.setMood('menu'); Studio.shot('players'); Studio.mystery('', null);
    ready = true; layout(true); $('loadInfo').textContent = `${DATA.reduce((a, c) => a + c.items.length, 0)} Begriffe · ${DATA.length} Themen · ${logos.length} Sender-Logos`; renderSetup(); previewCast();
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
  function renderScore() {
    $('race').innerHTML = ents.map((e, i) => `<div class="pchip ${G && G.active === i ? 'act' : ''} ${G && G.out && G.out[i] ? 'out' : ''}" style="--sc:${SLOTC[i]}"><img alt="" src="${logoSrc(e.logo)}"><span>${esc(e.name)}</span><b>${e.pts}</b></div>`).join('');
    ents.forEach((e, i) => Studio.podium(i, e.name, e.pts + ' Punkte', G && G.active === i)); layout();
  }
  function setPanel(html, tall) { const gp = $('gp'); gp.classList.toggle('tall', !!tall); gp.hidden = false; $('gpIn').innerHTML = html; layout(true); }
  const showPanel = on => { $('gp').hidden = !on; layout(true); };
  // wartet auf Klick auf ein [data-v]-Element im Panel; liefert dessen Wert
  function pick() {
    const g = G; return new Promise((res, rej) => { const el = $('gpIn'); const h = e => { const b = e.target.closest('[data-v]'); if (!b || b.disabled) return; el.removeEventListener('click', h); if (G !== g) return rej('abort'); res(b.dataset.v); }; el.addEventListener('click', h); });
  }
  const go = (title, text, label) => { setPanel(`<div class="gtitle">${title}</div><div class="gsub">${text}</div><button class="pill go" data-v="go">${label || 'LOS!'}</button>`); return pick(); };
  const cluesHtml = list => `<div class="clues">${list.map((c, i) => `<div class="clue"><b>${i + 1}</b>${esc(c)}</div>`).join('')}</div>`;
  const setActive = p => { G.active = p; Studio.setActive(p); Studio.shot(p >= 0 ? 'active' : 'players', p); ents.forEach((x, i) => Studio.pose(i, i === p ? 'think' : 'idle')); renderScore(); };
  function pickItem(catIds, needAt) {
    const cats = DATA.filter(c => catIds.includes(c.id) && (!needAt || c.qs.length)); const pool = cats.length ? cats : DATA.filter(c => !needAt || c.qs.length);
    let all = []; pool.forEach(c => c.items.forEach(it => all.push({ cat: c, item: it, key: c.id + ':' + it.a })));
    let free = all.filter(x => !G.used.has(x.key)); if (!free.length) { G.used.clear(); free = all; }
    const x = rnd(free); G.used.add(x.key); return x;
  }
  async function reveal(cat, item, ok, extra) {
    setActive(-1); Studio.curtain(true); Studio.shot('mystery'); AUD.sfx.curtain(); await sleep(700); Studio.mystery(cat.icon, item.a);
    if (ok) { Studio.setMood('good'); AUD.sfx.right(); Studio.confetti(120); Studio.allPose('cheer'); } else { Studio.setMood('bad'); AUD.sfx.wrongAll(); Studio.allPose('sad'); }
    setPanel(`<div class="gtitle">${ok ? '🎉 Gefunden!' : 'Leider nicht gefunden'}</div><div class="gsub">Gesucht war: <b style="color:var(--y);font-size:1.2em">${esc(item.a)}</b>${extra ? '<br>' + extra : ''}</div><button class="pill go" data-v="go">WEITER</button>`);
    const pp = pick(); await say(ok ? `Gesucht – gefunden: ${item.a}!` : `Die Lösung wäre ${item.a} gewesen.`, 2200); await pp;
    Studio.setMood('menu'); Studio.allPose('idle'); Studio.curtain(false); Studio.mystery(cat.icon, null); Studio.shot('players'); hideBubble();
  }
  const roundLabel = (a, b) => { $('rnd').innerHTML = a + '<small>' + esc(b) + '</small>'; };

  // ------------------------------------------------------------------ Spielablauf
  async function startGame() {
    if (!ready || running) return; AUD.unlock(); running = true; const md = cfg().mode, n = nPlayers();
    ents = Array.from({ length: n }, (_, i) => ({ name: (save.names[i] || '').trim() || 'Spieler ' + (i + 1), logo: save.logos[i], pts: 0, host: false }));
    if (md.id === 'radar') ents.push({ name: 'Moderator', logo: 6, pts: 0, host: true });
    G = { mode: md.id, active: -1, out: null, over: false, used: new Set() }; const g = G;
    $('menu').hidden = true; $('end').hidden = true; $('pause').hidden = true; $('top').hidden = true; $('ui').hidden = false; $('gp').hidden = true; hideBubble();
    Studio.setCast(ents.map(e => ({ name: e.name, logo: e.logo, host: e.host }))); Studio.setMood('menu'); Studio.curtain(false); Studio.mystery('', null); renderScore(); layout(true);
    try { await run(md); } catch (e) { if (e !== 'abort') console.error(e); }
  }
  async function run(md) {
    Studio.shot('players'); AUD.bed('off'); AUD.sfx.intro(); Studio.allPose('cheer'); Studio.hostPose('wave');
    await say(`Willkommen bei Gesucht und Gefunden – heute: ${md.name.replace(/^\S+\s/, '')}!`, 2400); Studio.allPose('idle'); Studio.hostPose('idle');
    if (md.id === 'hint') await modeHint(); else if (md.id === 'ask') await modeAsk(); else if (md.id === 'radar') await modeRadar(); else await modeBand();
  }

  // ---- 1) Hinweis-Raten
  async function modeHint() {
    const n = ents.length, R = save.rounds.hint || 5;
    for (let r = 0; r < R; r++) {
      const { cat, item } = pickItem(save.cats, false); roundLabel(`Runde ${r + 1}/${R}`, cat.icon + ' ' + cat.name); const alive = ents.map(() => true); G.out = alive.map(() => false); Studio.curtain(false); Studio.mystery(cat.icon, null); Studio.shot('players'); AUD.bed('tension', r / R);
      await say(`Runde ${r + 1}: Gesucht ist etwas aus dem Bereich ${cat.name}. Je früher ihr es erratet, desto mehr Punkte gibt es!`, 2800);
      let solved = -1; const shown = [], start = r % n;
      for (let k = 0; k < 5 && solved < 0 && alive.some(Boolean); k++) {
        shown.push(item.c[k]); AUD.sfx.clue(); Studio.ledMessage('HINWEIS ' + (k + 1), '#ffd24a', 2); const pts = 5 - k;
        for (let i = 0; i < n && solved < 0; i++) {
          const p = (start + i) % n; if (!alive[p]) continue; setActive(p);
          setPanel(`${cluesHtml(shown)}<div class="gsub"><b style="color:${SLOTC[p]}">${esc(ents[p].name)}</b> ist dran – ${pts} ${pts === 1 ? 'Punkt' : 'Punkte'} möglich</div><div class="row"><button class="pill go" data-v="a">🙋 Ich rate (${pts} P.)</button>${k < 4 ? '<button class="pill" data-v="p">Weiter</button>' : ''}</div>`);
          const v = await pick(); if (v === 'p') { AUD.sfx.click(); continue; }
          AUD.sfx.select(); const opts = shuffle([{ t: item.a, ok: true }].concat(shuffle(cat.items.filter(x => x.a !== item.a && !(item.alt || []).includes(x.a)).slice()).slice(0, 3).map(x => ({ t: x.a, ok: false }))));
          setPanel(`${cluesHtml(shown)}<div class="opts">${opts.map((o, j) => `<button class="opt" data-v="${j}">${esc(o.t)}</button>`).join('')}</div>`);
          const sel = +await pick(); const bs = $('gpIn').querySelectorAll('.opt'); bs.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('ok'); else if (j === sel) b.classList.add('no'); });
          if (opts[sel].ok) { solved = p; ents[p].pts += pts; AUD.sfx.buzzRight(); banner(`+${pts} für ${ents[p].name}`, '', 'good', 1800); } else { alive[p] = false; G.out[p] = true; AUD.sfx.buzzWrong(); Studio.pose(p, 'sad'); banner('Falsch!', ents[p].name + ' scheidet aus', 'bad', 1800); }
          renderScore(); await sleep(1100);
        }
      }
      AUD.bed('off'); G.out = null; await reveal(cat, item, solved >= 0);
    }
    await finish('hint');
  }

  // ---- 2) Fragen-Raten
  async function modeAsk() {
    const n = ents.length, R = save.rounds.ask || 1; let turn = 0;
    for (let r = 0; r < R; r++) for (let p = 0; p < n; p++) {
      const { cat, item } = pickItem(save.cats, true); turn++; roundLabel(`Runde ${turn}/${R * n}`, cat.icon + ' ' + cat.name); Studio.curtain(false); Studio.mystery(cat.icon, null); setActive(p);
      if (n > 1) await go(esc(ents[p].name), `ist dran! Gesucht ist etwas aus dem Bereich <b>${esc(cat.name)}</b>. Stelle Ja/Nein-Fragen und rate die Lösung.`, 'LOS!'); else await say(`Gesucht ist etwas aus dem Bereich ${cat.name}. Stelle Ja/Nein-Fragen!`, 2200);
      AUD.bed('tension', 0.2); let q = 0, solved = false, over = false; const asked = new Set(), log = [], wrong = new Set(), idx = cat.items.indexOf(item);
      while (!over) {
        const must = q >= ASK_MAX, pts = Math.max(1, ASK_MAX - q);
        const head = `<div class="gsub">Frage <b>${Math.min(q + 1, ASK_MAX)}</b>/${ASK_MAX} · Trefferpunkte jetzt: <b style="color:var(--y)">${pts}</b></div><div class="qlog">${log.map(l => `<div>${esc(l[0])} <b class="${l[1] ? 'y' : 'n'}">${l[1] ? 'JA' : 'NEIN'}</b></div>`).join('')}</div>`;
        setPanel(head + (must ? '<div class="gsub">Keine Fragen mehr – jetzt musst du raten!</div>' : `<div class="qlist">${cat.qs.map(x => `<button class="qb" data-v="q${x.k}" ${asked.has(x.k) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>`) + (must ? '' : '<div class="row" style="margin-top:8px"><button class="pill go" data-v="g">🎯 Lösung raten</button></div>'), true);
        let v = must ? 'g' : await pick();
        if (v[0] === 'q') { const key = v.slice(1), qi = cat.qs.findIndex(x => x.k === key), ans = item.at[qi] === '1'; asked.add(key); q++; log.push([cat.qs[qi].t, ans]); ans ? AUD.sfx.buzzRight() : AUD.sfx.buzzWrong(); await sleep(250); continue; }
        const cand = cat.items.map((x, j) => ({ x, j })).filter(o => !wrong.has(o.j)).sort((a, b) => a.x.a.localeCompare(b.x.a, 'de'));
        setPanel(`<div class="gsub">Was ist es? ${must ? '<b>Letzter Tipp!</b>' : 'Falsch raten kostet 3 Punkte.'}</div><div class="opts">${cand.map(o => `<button class="opt" data-v="c${o.j}">${esc(o.x.a)}</button>`).join('')}</div>${must ? '' : '<div class="row" style="margin-top:8px"><button class="pill" data-v="b">← Zurück zu den Fragen</button></div>'}`, true);
        v = await pick(); if (v === 'b') continue; const j = +v.slice(1);
        if (j === idx) { solved = true; ents[p].pts += pts; over = true; banner(`+${pts} Punkte`, `nach ${q} ${q === 1 ? 'Frage' : 'Fragen'}`, 'good', 2000); }
        else { wrong.add(j); q++; ents[p].pts = Math.max(0, ents[p].pts - 3); AUD.sfx.buzzWrong(); banner('Falsch!', '−3 Punkte', 'bad', 1500); Studio.pose(p, 'sad'); renderScore(); if (must) over = true; await sleep(700); Studio.pose(p, 'think'); }
      }
      AUD.bed('off'); renderScore(); await reveal(cat, item, solved, solved ? `${q} ${q === 1 ? 'Frage' : 'Fragen'} gebraucht` : '');
    }
    await finish('ask');
  }

  // ---- 3) Gesichter-Radar (gegen den Moderator)
  async function modeRadar() {
    roundLabel('Gesichter-Radar', 'Finde das Gesicht des Moderators'); const faces = FACES.gen(), mine = rnd(faces), his = rnd(faces.filter(f => f !== mine)); const skill = save.skill;
    let candH = faces.slice(), candB = faces.slice(); const askedH = new Set(), askedB = new Set(), log = []; let qn = 0, sel = -1, result = null; Studio.mystery('🙂', null); setActive(0);
    await say(`Dein geheimes Gesicht ist ${mine.name}. Frage mich aus und finde meins – ich suche deins!`, 3200); AUD.bed('tension', 0.2);
    while (!result) {
      const render = () => setPanel(`<div class="fcrow"><img alt="" src="${mine.img}"><span>Dein Gesicht: <b style="color:var(--y)">${esc(mine.name)}</b> · Fragen: ${qn}</span></div><div class="gsub" style="margin:6px 0">${sel >= 0 ? `Ist es <b>${esc(faces[sel].name)}</b>? Nochmal antippen = <b>Tipp abgeben</b>.` : 'Stelle eine Frage – oder tippe ein Gesicht an, um zu raten.'}</div><div class="board">${faces.map((f, i) => `<button class="fc ${candH.includes(f) ? '' : 'off'} ${i === sel ? 'sel' : ''}" data-v="f${i}"><img alt="${esc(f.name)}" src="${f.img}"><span>${esc(f.name)}</span></button>`).join('')}</div><div class="qlog" style="max-height:70px;margin-top:6px">${log.slice(-3).map(l => `<div>${l}</div>`).join('')}</div><div class="qlist" style="margin-top:6px">${FACES.Q.map(x => `<button class="qb" data-v="q${x.k}" ${askedH.has(x.k) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>`, true);
      render(); const v = await pick();
      if (v[0] === 'f') { const i = +v.slice(1); if (sel === i) { result = faces[i] === his ? 'win' : 'lose'; break; } sel = i; AUD.sfx.click(); continue; }
      sel = -1; const q = FACES.Q.find(x => x.k === v.slice(1)), ans = FACES.answer(q, his); askedH.add(q.k); qn++; candH = candH.filter(f => FACES.answer(q, f) === ans); log.push(`Du: ${esc(q.t)} <b class="${ans ? 'y' : 'n'}">${ans ? 'JA' : 'NEIN'}</b>`); ans ? AUD.sfx.buzzRight() : AUD.sfx.buzzWrong(); render(); await sleep(900);
      if (candH.length === 1 && false) { }
      // Zug des Moderators
      setActive(1); Studio.pose(1, 'think');
      if (candB.length <= 1 || (candB.length === 2 && skill === 2 && Math.random() < 0.5) || !FACES.botQuestion(candB, askedB, skill)) {
        const gs = candB.length === 1 ? candB[0] : rnd(candB); await say(`Ich tippe auf ${gs.name}!`, 1800); result = gs === mine ? 'lose' : 'win-bot-wrong'; if (result === 'win-bot-wrong') { result = 'win'; } break;
      }
      const bq = FACES.botQuestion(candB, askedB, skill), ba = FACES.answer(bq, mine); askedB.add(bq.k); candB = candB.filter(f => FACES.answer(bq, f) === ba); log.push(`Moderator: ${esc(bq.t)} <b class="${ba ? 'y' : 'n'}">${ba ? 'JA' : 'NEIN'}</b>`);
      await say(`${bq.t} – ${ba ? 'Ja' : 'Nein'}, sagst du?`, 1500); setActive(0);
    }
    AUD.bed('off'); const win = result === 'win'; const pts = win ? Math.max(1, 13 - qn) : 0; ents[0].pts = pts; renderScore(); G.out = null;
    Studio.curtain(true); Studio.shot('mystery'); AUD.sfx.curtain(); await sleep(600); Studio.mystery('🙂', his.name);
    if (win) { Studio.setMood('good'); AUD.sfx.right(); Studio.confetti(120); Studio.allPose('cheer'); } else { Studio.setMood('bad'); AUD.sfx.wrongAll(); Studio.allPose('sad'); }
    setPanel(`<div class="gtitle">${win ? '🎉 Gefunden!' : 'Der Moderator war schneller'}</div><div class="fcrow"><img alt="" src="${his.img}"><span>Sein Gesicht: <b style="color:var(--y)">${esc(his.name)}</b></span></div><div class="gsub">${win ? `Nach ${qn} Fragen – ${pts} Punkte!` : `Er hat ${esc(mine.name)} erraten.`}</div><button class="pill go" data-v="go">WEITER</button>`);
    const pp = pick(); await say(win ? 'Respekt, du hast mich durchschaut!' : 'Ätsch – diesmal gewinne ich!', 2000); await pp; await finish('radar', win);
  }

  // ---- 4) Stirnband-Party
  async function modeBand() {
    const n = ents.length, R = save.rounds.band || 1; let words = []; const pool = () => { const a = []; DATA.filter(c => save.cats.includes(c.id)).forEach(c => c.items.forEach(it => a.push(it.a))); return shuffle(a.length ? a : DATA.flatMap(c => c.items.map(i => i.a))); };
    for (let r = 0; r < R; r++) for (let p = 0; p < n; p++) {
      roundLabel(`Runde ${r * n + p + 1}/${R * n}`, 'Stirnband-Party'); setActive(p);
      await go(esc(ents[p].name), 'Halte das Gerät mit dem Bildschirm nach außen an die Stirn – die anderen beschreiben dir das Wort, ohne es zu nennen. Richtig = ✅, nicht zu erraten = ⏭.', 'BEREIT!');
      for (const c of [3, 2, 1]) { setPanel(`<div class="gtitle" style="font-size:72px">${c}</div>`); AUD.sfx.tickLow(); await sleep(700); }
      showPanel(false); const ok = await bandTurn(() => { if (!words.length) words = pool(); return words.pop(); }, p);
      ents[p].pts += ok; renderScore(); setActive(-1);
      if (ok > 0) { Studio.setMood('good'); AUD.sfx.cheer(2.2, 1); Studio.confetti(40 + ok * 10); Studio.pose(p, 'cheer'); } else { AUD.sfx.aww(); Studio.pose(p, 'sad'); }
      await go(ok > 0 ? '⏰ Zeit um!' : '⏰ Zeit um!', `<b>${esc(ents[p].name)}</b>: ${ok} ${ok === 1 ? 'Wort' : 'Wörter'} erraten.`, 'WEITER'); Studio.setMood('menu'); Studio.allPose('idle');
    }
    await finish('band');
  }
  function bandTurn(next, p) {
    const g = G; return new Promise(res => {
      const band = $('band'); let ok = 0, skip = 0, t0 = Date.now(), cur = next(), last = -1;
      const show = () => { $('bandWord').textContent = cur; $('bandSc').textContent = `✅ ${ok}  ·  ⏭ ${skip}`; }; show(); band.hidden = false; AUD.bed('tension', 0.9);
      const done = () => { clearInterval(iv); document.removeEventListener('keydown', kd); $('bandOk').onclick = $('bandSkip').onclick = null; band.hidden = true; AUD.bed('off'); if (G === g) res(ok); };
      const act = good => { if (G !== g) return done(); good ? (ok++, AUD.sfx.buzzRight()) : (skip++, AUD.sfx.click()); cur = next(); show(); };
      const kd = e => { if (e.key === 'ArrowRight' || e.key === 'Enter') act(true); else if (e.key === 'ArrowLeft' || e.key === ' ') { e.preventDefault(); act(false); } };
      $('bandOk').onclick = () => act(true); $('bandSkip').onclick = () => act(false); document.addEventListener('keydown', kd);
      const iv = setInterval(() => { if (G !== g) return done(); const el = (Date.now() - t0) * SPD() / 1000, left = Math.max(0, TURN_SECS - el); $('bandBar').style.transform = `scaleX(${left / TURN_SECS})`; const s = Math.ceil(left); if (s !== last) { last = s; if (s <= 10 && s > 0) AUD.sfx.tick(); } if (left <= 0) done(); }, 100);
    });
  }

  // ------------------------------------------------------------------ Ende
  async function finish(mode, win) {
    G.over = true; showPanel(false); AUD.bed('off'); setActive(-1); G.out = null;
    const humans = ents.filter(e => !e.host), best = humans.slice().sort((a, b) => b.pts - a.pts), top = best[0];
    humans.forEach(e => addTop(mode, e.name, e.pts));
    Studio.shot('all'); Studio.setMood('win'); AUD.sfx.win(); Studio.allPose('cheer'); Studio.hostPose('wave'); hideBubble();
    const tie = best.length > 1 && best[1].pts === top.pts, title = mode === 'radar' ? (win ? `🏆 ${top.name} hat gewonnen!` : 'Der Moderator gewinnt') : humans.length === 1 ? `🏆 ${top.name}: ${top.pts} Punkte` : tie ? '🏆 Gleichstand!' : `🏆 ${top.name} gewinnt!`;
    banner(title.replace('🏆 ', ''), mode === 'radar' ? '' : humans.length > 1 ? `${top.pts} Punkte` : '', 'gold', 3400);
    await say(mode === 'radar' && !win ? 'Der Moderator gewinnt – aber die Revanche wartet!' : `${title.replace('🏆 ', '')} Herzlichen Glückwunsch!`, 3000);
    $('endTitle').textContent = title; $('endSub').textContent = MODES.find(m => m.id === mode).name;
    $('rankList').innerHTML = best.map((e, k) => `<div class="brow" style="--sc:${SLOTC[ents.indexOf(e)]}"><span>${k + 1}. ${esc(e.name)}</span><b>${e.pts} Punkte</b></div>`).join('');
    await sleep(1500); $('end').hidden = false; $('ui').hidden = true; running = false;
  }
  function quit() {
    G = null; running = false; ents = []; $('ui').hidden = true; $('pause').hidden = true; $('end').hidden = true; $('band').hidden = true; $('menu').hidden = false; AUD.bed('menu'); try { speechSynthesis.cancel(); } catch (e) {}
    Studio.setMood('menu'); Studio.curtain(false); Studio.mystery('', null); Studio.shot('players'); Studio.setActive(-1); previewCast(); renderSetup(); layout(true);
  }
  $('bPlay').onclick = startGame; $('bAgain').onclick = () => { $('end').hidden = true; running = false; G = null; startGame(); }; $('bBack').onclick = quit;
  $('bEnd').onclick = () => { if (G && !G.over) $('pause').hidden = false; }; $('bResume').onclick = () => { $('pause').hidden = true; }; $('bQuit').onclick = quit;
  addEventListener('keydown', ev => { if (ev.target && ev.target.tagName === 'INPUT') return; const k = ev.key.toLowerCase(); if (k === 'm') togSnd(); if (k === 'enter' && !G && ready && !$('menu').hidden) startGame(); });
  window.__gg = { get G() { return G; }, get ents() { return ents; }, save, startGame, quit, get logos() { return logos; } };
})();
