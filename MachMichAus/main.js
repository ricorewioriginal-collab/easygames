/* Mach mich aus! – Spielablauf: pro Runde ein Kandidat, vier Enthüllungsphasen mit Lampen-Entscheidungen, Joker, Wahl, Date, Punkte. */
import { SFX, Audio_ } from './audio.js';
import { initPair, JOIN, loadScript } from './pair.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', ABORT = { abort: 1 };
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
addEventListener('error', e => { $('errTxt').textContent = String(e.message || e); $('err').hidden = false; });
addEventListener('unhandledrejection', e => { if (e.reason === ABORT) return; $('errTxt').textContent = String((e.reason && e.reason.message) || e.reason); $('err').hidden = false; });

if (JOIN) {
  document.body.classList.add('ctrl'); (await import('./controller.js')).startController();
} else {
  try { await loadScript(THREE_URL); } catch (e) { $('errTxt').textContent = 'Die 3D-Bibliothek konnte nicht geladen werden (Internet?).'; $('err').hidden = false; throw e; }
  const [E, Cn, AV, P] = await Promise.all([import('./engine.js'), import('./content.js'), import('./avatars.js'), import('./panel.js')]); const { Studio } = await import('./studio.js');
  const { newShow, startRound, reveal, decide, joker, aiJoker, choose, aiChoose, scoreRound, nextRound, ranking, estimate, lightsOn, PHASES } = E, { CANDIDATES, PULTE, QUIZ, VOICE, DATE, OFFLINES, STAYS, TIPS, TAGS, TAGINFO, STYLES, STYLEINFO } = Cn, { look } = AV, { renderAsk, candCard, av, tagChip, styleChip } = P;
  const studio = new Studio($('cv')); addEventListener('resize', () => studio.resize()); new ResizeObserver(() => studio.resize()).observe($('stage'));
  { const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }

  const FAST = () => window.__mmFast || 1, sleep = ms => new Promise(r => setTimeout(r, ms / FAST()));
  const rnd = a => a[(Math.random() * a.length) | 0], fmt = (t, v) => String(t).replace(/\{(\w)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6'], PHL = { look: 'Erster Eindruck', steck: 'Steckbrief', talent: 'Talent', quiz: 'Quiz' };
  const S0 = { n: 1, humans: store.get('mmHumans', []), tts: store.get('mmTts', false), snd: store.get('mmSnd', true) };
  const randProfile = () => { const t = TAGS.slice().sort(() => Math.random() - 0.5); return { likes: t.slice(0, 3), nogos: t.slice(3, 5), style: rnd(STYLES) }; };
  for (let i = 0; i < 4; i++) { const h = S0.humans[i] || (S0.humans[i] = {}); h.name = h.name || 'Spieler ' + (i + 1); h.g = h.g || ['f', 'm', 'd', 'f'][i]; if (!h.likes || h.likes.length !== 3 || !h.nogos || h.nogos.length !== 2) Object.assign(h, randProfile()); h.style = h.style || rnd(STYLES); }
  let S = null, token = 0, pending = null, say = '', logHist = [], asks = {}, pend = {}, askId = 0, curAsk = null, cardData = null, humanSeatOn = {};
  Audio_.setOn(S0.snd); const show = id => { for (const s of ['menu', 'setup']) $(s).hidden = s !== id; };
  const setSnd = () => { $('bSound').textContent = S0.snd ? '🔊 Ton' : '🔇 Ton'; $('bSnd').textContent = S0.snd ? '🔊' : '🔇'; $('bVoice').style.opacity = S0.tts ? 1 : 0.45; };
  const toggleSnd = () => { S0.snd = !S0.snd; Audio_.setOn(S0.snd); store.set('mmSnd', S0.snd); setSnd(); SFX.click(); }; setSnd(); $('tip').textContent = '💡 ' + rnd(TIPS);

  // ------------------------------------------------------------ Karten, Ticker, Stimme
  function card(html, ids) { $('dlgBox').innerHTML = html; $('dlg').hidden = false; return new Promise(res => { pending = { res, ids }; }); }
  function fire(id) { if (pending && pending.ids.includes(id)) { const p = pending; pending = null; $('dlg').hidden = true; p.res(id); } }
  $('dlgBox').addEventListener('click', e => { const b = e.target.closest('button[id]'); if (b) { SFX.click(); fire(b.id); } });
  function abort() { token++; const p = pending; pending = null; $('dlg').hidden = true; for (const k in pend) { try { pend[k].res(null); } catch (e) {} } pend = {}; asks = {}; if (curAsk) { curAsk.destroy(); curAsk = null; } S = null; $('clip').hidden = true; $('cardc').innerHTML = ''; if (p) p.res('abort'); push(); }
  function addLog(text, cls) { logHist.push(text); if (logHist.length > 100) logHist.shift(); const el = document.createElement('div'); el.className = 'tl ' + (cls || ''); el.textContent = text; $('ticker').appendChild(el); while ($('ticker').children.length > 3) $('ticker').firstChild.remove(); setTimeout(() => el.remove(), 7000 / FAST()); }
  $('bLog').onclick = () => { SFX.click(); $('dlgBox').innerHTML = `<div class="dc"><h2>📜 Live-Ticker</h2><div class="tbl" style="max-height:55vh;overflow:auto">${logHist.slice().reverse().map(l => `<div class="tr"><b style="white-space:normal">${esc(l)}</b></div>`).join('') || '<div class="info">Noch nichts passiert.</div>'}</div><button class="btn" id="dClose">Schließen</button></div>`; $('dlg').hidden = false; pending = { res() {}, ids: ['dClose'] }; };
  let vt = 0; function voice(key, vars) { if (!VOICE[key]) return ''; const t = fmt(rnd(VOICE[key]), vars || {}); say = t; $('voiceTxt').textContent = t; $('voice').hidden = false; clearTimeout(vt); vt = setTimeout(() => { $('voice').hidden = true; }, Math.max(3200, t.length * 55) / FAST()); if (S0.tts && window.speechSynthesis) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.pitch = 0.8; u.rate = 1; speechSynthesis.speak(u); } catch (e) {} } push(); return t; }
  function banner(t, sub) { $('banner').innerHTML = esc(t) + (sub ? `<small>${esc(sub)}</small>` : ''); $('banner').hidden = false; $('banner').style.animation = 'none'; void $('banner').offsetWidth; $('banner').style.animation = ''; setTimeout(() => { $('banner').hidden = true; }, 1700 / FAST()); }
  async function clip(title, html, ms = 4200) { $('clip').innerHTML = `<h3>${esc(title)}</h3>${html}`; $('clip').hidden = false; await sleep(ms); $('clip').hidden = true; }
  const setLamps = n => { const el = $('hLamps'); if (+el.textContent !== n) { el.textContent = n; $('hLamps').parentElement.classList.remove('pulse'); void el.offsetWidth; $('hLamps').parentElement.classList.add('pulse'); } };
  const showCard = () => { if (!S || !S.R) { $('cardc').innerHTML = ''; return; } $('cardc').innerHTML = candCard(Object.assign({}, S.R.cand, { look: candLook }), S.R.rev); };
  let candLook = null;

  // ------------------------------------------------------------ Eingaben (Hot-Seat und Handy)
  const hostAsk = ask => new Promise(res => { curAsk = renderAsk($('act'), ask, v => { res(v); }); }).then(v => { if (curAsk) { curAsk.destroy(); curAsk = null; } return v; });
  async function askSlots(tok, slots, make, opts = {}) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; }; const out = {}; if (!slots.length) return out;
    const phone = slots.filter(h => pair.has(h)), seat = slots.filter(h => !pair.has(h));
    const ps = phone.map(h => new Promise(res => { asks[h] = Object.assign(make([h]), { id: ++askId }); pend[h] = { res }; }).then(v => { out[h] = v; delete asks[h]; delete pend[h]; })); push();
    const seq = (async () => {
      if (!seat.length) return;
      if (opts.combine) { const v = await A(hostAsk(make(seat))); seat.forEach((h, i) => { out[h] = [v[i]]; }); return; }
      for (const h of seat) { if (opts.gate && (seat.length > 1 || phone.length)) await A(card(`<div class="dc"><h2>🙈 ${esc(S.H[h].p.n)} ist dran</h2><div class="sub">Alle anderen bitte wegschauen.</div><button class="btn green" id="bReady">Bereit!</button></div>`, ['bReady'])); out[h] = await A(hostAsk(make([h]))); }
    })();
    await A(Promise.all([...ps, seq])); $('act').innerHTML = '<div class="info">⏳ Die Pulte entscheiden …</div>'; push(); return out;
  }

  // ------------------------------------------------------------ Show
  async function runShow(tok) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const hs = S0.humans.slice(0, S0.n).map(h => ({ n: (h.name || 'Spieler').slice(0, 9), g: h.g, age: 26, style: h.style, likes: h.likes.slice(), nogos: h.nogos.slice() }));
    S = newShow({ content: { CANDIDATES, PULTE, QUIZ }, humans: hs, seed: (Math.random() * 1e9) | 0 }); logHist = []; asks = {}; pend = {}; show(null);
    studio.addHost(look({ n: 'Moderator', g: 'd' }, 5)); studio.focus('all');
    while (!S.done) {
      const R = startRound(S), c = R.cand, hc = R.humanCand, rd = S.round + 1; candLook = look(c, 2 + S.round); humanSeatOn = {};
      studio.setSeats(R.seats.map(s => ({ p: s.p, look: look(s.p, s.k), human: s.human >= 0 }))); studio.setCandidate(candLook); studio.focus('all'); setLamps(20); showCard();
      $('hRound').textContent = `Runde ${rd}/${S.rounds}`; $('hSub').textContent = hc >= 0 ? `Kandidat: ${c.n} 🙋` : `Kandidat: ${c.n}`; $('act').innerHTML = `<div class="info">🎬 Runde ${rd}: <b>${esc(c.n)}</b> betritt die Bühne.</div>`; push();
      banner('RUNDE ' + rd, c.n); SFX.fanfare(); voice('intro', { a: c.n }); await A(sleep(2200));
      studio.focus('candBack'); const walkP = studio.walkCand(0, 3.4 + 0.4); await A(Promise.race([walkP, sleep(7000)])); studio.stand(); studio.cheer(0.8); SFX.clap(1.5);
      for (const ph of PHASES) {
        $('hSub').textContent = PHL[ph]; let input = null;
        if (ph === 'talent' && hc >= 0) { studio.focus('candBack'); const got = await A(askSlots(tok, [hc], () => ({ kind: 'talent', me: c.n }), { gate: false })); input = got[hc] ? got[hc][0] : 6; }
        if (ph === 'quiz' && hc >= 0) { const qs = [0, 1].map(k => QUIZ[S.quizOrder[(S.qi + k) % S.quizOrder.length]]); const got = await A(askSlots(tok, [hc], () => ({ kind: 'quiz', me: c.n, likes: c.likes, qs }), { gate: true })); input = got[hc] || [0, 0]; }
        const info = reveal(S, ph, input); showCard();
        // Szene + Einspieler
        if (ph === 'look') { studio.focus('candBack'); studio.pose('cand', 'cheer', '👋'); await A(sleep(900)); await clip('ERSTER EINDRUCK', `<p class="big">${esc(c.n)}, ${c.age || ''} ${esc(c.job ? '· ' + c.job : '')}</p><p>${styleChip(c.style)}</p>`, 2600); }
        else if (ph === 'steck') { studio.focus('cand'); studio.pose('cand', 'talk', '📼'); const a = c.likes.slice(0, 2).map(t => TAGINFO[t][0] + ' ' + TAGINFO[t][1]).join(' & '); await clip('📼 EINSPIELER', hc >= 0 ? `<p class="big">„Ich mag ${esc(a)}!“</p>` : `<p class="big">„${esc(c.motto)}“</p><p>🙈 Macke: ${esc(c.quirk)}</p><p>💘 Traum-Date: ${esc(c.dream)}</p><p>Mag: ${esc(a)}</p>`, 5200); }
        else if (ph === 'talent') { studio.focus('stage'); studio.pose('cand', 'dance', '🎭', 4); studio.cheer(0.9); SFX.pad(2); await clip('🎭 TALENT', hc >= 0 ? `<p class="big">Funk-Takt: ${info.rev.talent} / 12</p>` : `<p class="big">${esc(c.talent.t)}</p><p>${esc(c.talent.d)}</p><p>Eindruck: ${'⭐'.repeat(Math.max(1, Math.round(info.rev.talent / 3)))}</p>`, 4600); }
        else if (ph === 'quiz') { studio.focus('cand'); studio.pose('cand', 'talk', '🎤'); const html = info.questions.map(q => { const Q = QUIZ[q.qi]; return `<p><b>${esc(Q.q)}</b><br>→ ${esc(Q.a[q.a].t)} <span class="chip tg">${TAGINFO[q.tag][0]}</span></p>`; }).join(''); await clip('🎤 FRAGERUNDE', html, 5200); }
        voice(ph === 'look' ? 'look' : ph === 'steck' ? 'steck' : ph === 'talent' ? 'talent' : 'quiz', { a: c.n, n: lightsOn(S) });
        // Entscheidungen der Pulte
        studio.focus('all'); studio.pose('cand', 'idle'); const humanSeats = R.seats.filter(s => s.human >= 0); let hcm = {};
        if (humanSeats.length) {
          const slots = humanSeats.map(s => s.human).filter(h => R.seats[S.seatOf[h]].on); const mk = hs => ({ kind: 'lamp', phaseTxt: PHL[ph], items: hs.map(h => { const s = R.seats[S.seatOf[h]], p = s.p; return { k: s.k, me: { n: p.n, look: look(p, s.k), styles: p.styles, likes: p.likes, nogos: p.nogos }, est: estimate(p, R.rev) }; }) });
          const got = await A(askSlots(tok, slots, mk, { combine: true })); for (const h in got) { const s = R.seats[S.seatOf[+h]]; hcm[s.k] = got[h] ? got[h][0] === 1 : true; }
        }
        const dec = decide(S, ph, hcm);
        let shown = 0; for (const o of dec.off) { studio.lampOff(o.k); SFX.off(); setLamps(lightsOn(S) + (dec.off.length - 1 - dec.off.indexOf(o))); if (shown < 4) { shown++; addLog(`${R.seats[o.k].p.n}: „${rnd(OFFLINES)}“`, o.human >= 0 ? 'ev' : ''); } await A(sleep(o.human >= 0 ? 400 : 140)); }
        setLamps(lightsOn(S)); const left = lightsOn(S); if (dec.off.length) { studio.pose('cand', left < 6 ? 'shock' : 'sad', left < 6 ? '😮' : '😕', 1.8); voice('lightsOff', { a: c.n, n: left }); } else { studio.pose('cand', 'cheer', '😊', 1.8); addLog(rnd(STAYS)); }
        if (left > 0) R.seats.filter(s => s.on).slice(0, 3).forEach(s => studio.pose(s.k, 'cheer', null)); await A(sleep(1500));
        if (left === 0) break;
      }
      // Joker
      if (lightsOn(S) > 0 && !R.jokerUsed && R.seats.some(s => !s.on)) {
        if (hc >= 0) { const off = R.seats.filter(s => !s.on).map(s => ({ k: s.k, n: s.p.n, age: s.p.age, job: s.p.job, look: look(s.p, s.k) })); const got = await A(askSlots(tok, [hc], () => ({ kind: 'joker', off }), { gate: false })); const k = got[hc] ? got[hc][0] : -1; if (k >= 0 && joker(S, k)) { studio.lampOn(k); SFX.on(); setLamps(lightsOn(S)); addLog(`🔌 Anmach-Joker: ${R.seats[k].p.n} ist wieder dabei!`, 'ev'); await A(sleep(1400)); } }
        else { const k = aiJoker(S); if (k >= 0) { studio.lampOn(k); SFX.on(); setLamps(lightsOn(S)); addLog(`🔌 Anmach-Joker: ${R.seats[k].p.n} ist wieder dabei!`, 'ev'); await A(sleep(1400)); } }
      }
      // Wahl
      let pick = -1; const left = lightsOn(S); $('hSub').textContent = 'Die Wahl';
      if (left === 0) { voice('blackout', { a: c.n }); SFX.sad(); studio.pose('cand', 'sad', '🌑', 3); banner('BLACKOUT', 'alle Lampen aus'); await A(sleep(2200)); }
      else {
        if (left === 1) voice('lastLight', { a: c.n }); else voice('choose', { a: c.n });
        studio.focus('candBack'); await A(sleep(1400));
        if (hc >= 0) { const on = R.seats.filter(s => s.on).map(s => ({ k: s.k, n: s.p.n, age: s.p.age, job: s.p.job, look: look(s.p, s.k), hint: s.p.likes[0] })); const got = await A(askSlots(tok, [hc], () => ({ kind: 'choose', on }), { gate: false })); pick = got[hc] ? got[hc][0] : aiChoose(S); }
        else pick = aiChoose(S);
      }
      const d = choose(S, pick); let dateTxt = '';
      if (!d.none) {
        const seat = R.seats[d.k]; studio.spot(d.k, 2); SFX.jingle(); studio.pose(d.k, 'cheer', '💘', 2); voice('dateIntro', { a: c.n, b: seat.p.n }); await A(sleep(1600)); studio.focus('stage'); await A(Promise.race([studio.walkSeat(d.k), sleep(7000)])); studio.fo = ''; studio.pose('cand', 'cheer', '💘', 3); studio.pose(d.k, 'cheer', null);
        if (d.bucket >= 3) { studio.confetti(80); SFX.fanfare(); SFX.clap(2.5); studio.sparks(0, 2.4, 3.4, 0xff2d95); } else if (d.bucket <= 1) SFX.sad(); else SFX.ding();
        dateTxt = fmt(rnd(DATE['k' + d.bucket]), { a: c.n, b: seat.p.n }); say = dateTxt; push();
        const sp = R.seats[d.k].p; await A(card(`<div class="dc"><div style="display:flex;justify-content:center;gap:14px;align-items:center">${av({ look: candLook }, 70)}<span style="font-size:34px">💘</span>${av({ look: look(sp, d.k) }, 70)}</div><h2>${esc(c.n)} &amp; ${esc(sp.n)}</h2><div class="bigt">${d.chem} %</div><div class="sub">Passgenauigkeit${d.bluff ? ` · ⚠ geflunkert (−${d.bluff * 12} %)` : ''}</div><div class="bio">${esc(dateTxt)}</div><button class="btn green" id="bNext">Weiter ▶</button></div>`, ['bNext']));
      }
      const pts = scoreRound(S); showCard();
      const rows = S.H.map(h => `<div class="tr"><b>${esc(h.p.n)}</b><em>${pts[h.i].role === 'cand' ? '🎤 Kandidat' : '💡 Pult'}</em><span>+${pts[h.i].pts}</span><em>${h.score}</em></div>`).join('');
      const last = S.round + 1 >= S.rounds; await A(card(`<div class="dc"><h2>Runde ${rd}: ${esc(c.n)}</h2><div class="sub">${d.none ? 'Blackout – ' + esc(c.n) + ' geht allein nach Hause.' : esc(dateTxt)}</div><div class="tbl">${rows}</div><div class="sub">Punkte der Runde · Gesamt</div><button class="btn green" id="bNext">${last ? 'Endstand ▶' : 'Nächster Kandidat ▶'}</button></div>`, ['bNext']));
      if (!nextRound(S)) break;
    }
    const rk = ranking(S), w = S.H[rk[0]]; SFX.fanfare(); studio.confetti(100); voice('final', {}); studio.focus('stage');
    const pick = await A(card(`<div class="dc"><div style="text-align:center;font-size:54px">🏆</div><h2>${S.H.length > 1 ? esc(w.p.n) + ' gewinnt die Show!' : 'Show geschafft!'}</h2><div class="tbl">${rk.map((i, k) => `<div class="tr ${k === 0 ? 'win' : ''}"><em>${k + 1}.</em><b>${esc(S.H[i].p.n)}</b><em>🎤 ${S.H[i].asCand}× · 💡 ${S.H[i].pult}×</em><span>${S.H[i].score}</span></div>`).join('')}</div><div class="prize"><img src="logos/16.png" alt="RicoReWi Radioportal" width="52" height="52"><div><b>Hauptgewinn: Ruhm &amp; Ehre</b><small>gestiftet vom RicoReWi Radioportal 😉</small></div></div><div class="row"><button class="btn green" id="bAgain">Neue Show</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
    if (pick === 'bAgain') startShow(); else { abort(); show('menu'); }
  }
  function startShow() { abort(); const tok = token; runShow(tok).catch(e => { if (e !== ABORT) throw e; }); }

  // ------------------------------------------------------------ Handy-Kopplung
  const pair = initPair({
    names: () => S0.humans.slice(0, S0.n).map(h => h.name),
    freeSlot: () => { const n = S ? S.H.length : S0.n; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
    onJoin: (slot, name) => { S0.humans[slot].name = name.slice(0, 9); store.set('mmHumans', S0.humans); fillHumans(); },
    onMessage: (slot, m) => { const p = pend[slot]; if (p && m.t === 'ans' && Array.isArray(m.v)) p.res(m.v); },
    onChange: () => { for (const k in pend) if (!pair.has(+k)) { try { pend[k].res(null); } catch (e) {} delete pend[k]; delete asks[k]; } push(); },
    snapshot: () => (S && S.R ? { view: S.done ? 'end' : 'play', round: S.round + 1, rounds: S.rounds, on: lightsOn(S), cand: { n: S.R.cand.n, age: S.R.cand.age, job: S.R.cand.job, look: candLook, rev: S.R.rev }, asks, say, tick: logHist.slice(-3), totals: S.H.map(h => ({ n: h.p.n, s: h.score })), seatOf: S.seatOf } : { view: 'menu' })
  });
  const push = () => { try { pair.push(); } catch (e) {} };

  // ------------------------------------------------------------ Einrichtung
  const tagBtn = (h, i, t, kind) => { const li = h.likes.indexOf(t), ni = h.nogos.indexOf(t); const on = kind === 'l' ? li >= 0 : ni >= 0; return `<button class="chip ${on ? (kind === 'l' ? 'on' : 'non') : ''}" data-k="${kind}" data-t="${t}">${kind === 'l' && li >= 0 ? '①②③'[li] + ' ' : ''}${TAGINFO[t][0]} ${esc(TAGINFO[t][1])}</button>`; };
  function fillHumans() {
    $('humans').innerHTML = S0.humans.slice(0, S0.n).map((h, i) => `<div class="hc" style="--pc:${CSS[i]}" data-i="${i}"><div class="chips"><input data-i="${i}" maxlength="9" value="${esc(h.name)}" aria-label="Name Mensch ${i + 1}" autocomplete="off" style="flex:1;min-width:110px"><div class="seg s2 gseg">${[['f', '♀'], ['m', '♂'], ['d', '⚧']].map(([v, l]) => `<button data-v="${v}" class="${h.g === v ? 'on' : ''}">${l}</button>`).join('')}</div><button class="chip" data-dice="1">🎲</button></div><div class="chips"><span class="cl">Stil</span>${STYLES.map(s => `<button class="chip ${h.style === s ? 'on' : ''}" data-s="${s}">${STYLEINFO[s][0]} ${esc(STYLEINFO[s][1])}</button>`).join('')}</div><div class="chips"><span class="cl">Mag (3)</span>${TAGS.map(t => tagBtn(h, i, t, 'l')).join('')}</div><div class="chips"><span class="cl">Nogo (2)</span>${TAGS.map(t => tagBtn(h, i, t, 'n')).join('')}</div></div>`).join('');
  }
  $('humans').addEventListener('input', e => { if (e.target.tagName === 'INPUT') { const i = +e.target.dataset.i; S0.humans[i].name = e.target.value.trim().slice(0, 9) || 'Spieler ' + (i + 1); store.set('mmHumans', S0.humans); } });
  $('humans').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; SFX.click(); const hc = b.closest('.hc'), i = +hc.dataset.i, h = S0.humans[i];
    if (b.dataset.v) h.g = b.dataset.v; else if (b.dataset.s) h.style = b.dataset.s; else if (b.dataset.dice) Object.assign(h, randProfile());
    else if (b.dataset.t) { const t = b.dataset.t, L = h.likes, N = h.nogos; if (b.dataset.k === 'l') { const k = L.indexOf(t); if (k >= 0) { if (L.length > 1) L.splice(k, 1); } else { const n = N.indexOf(t); if (n >= 0) N.splice(n, 1); L.push(t); if (L.length > 3) L.shift(); } } else { const k = N.indexOf(t); if (k >= 0) { if (N.length > 1) N.splice(k, 1); } else { const l = L.indexOf(t); if (l >= 0 && L.length > 1) L.splice(l, 1); N.push(t); if (N.length > 2) N.shift(); } } }
    store.set('mmHumans', S0.humans); fillHumans();
  });
  const seg = (id, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; SFX.click(); $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); });
  seg('sgPl', v => { S0.n = v; fillHumans(); push(); });

  show('menu'); studio.setSeats(Array.from({ length: 20 }, (_, k) => { const p = PULTE[k % PULTE.length]; return { p, look: look(p, k), human: false }; })); studio.focus('all');
  $('bPlay').onclick = () => { Audio_.unlock(); SFX.click(); $('sgPl').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.v === S0.n)); fillHumans(); show('setup'); };
  $('bSetBack').onclick = () => { SFX.click(); show('menu'); };
  $('bStart').onclick = () => { Audio_.unlock(); SFX.click(); startShow(); };
  $('bPairMenu').onclick = $('bPairSetup').onclick = () => { SFX.click(); pair.open(); };
  $('bMenu').onclick = () => { SFX.click(); if (confirm('Show wirklich beenden?')) { abort(); show('menu'); studio.setSeats(Array.from({ length: 20 }, (_, k) => { const p = PULTE[k % PULTE.length]; return { p, look: look(p, k), human: false }; })); studio.focus('all'); studio.setCandidate(null); } };
  $('bRules').onclick = () => { SFX.click(); $('rules').hidden = false; }; $('rulesOk').onclick = () => { $('rules').hidden = true; };
  $('bSound').onclick = $('bSnd').onclick = toggleSnd; $('bVoice').onclick = () => { S0.tts = !S0.tts; store.set('mmTts', S0.tts); setSnd(); if (!S0.tts) try { speechSynthesis.cancel(); } catch (e) {} };
  let last = performance.now(); (function loop(now) { studio.frame((now - last) / 1000); last = now; requestAnimationFrame(loop); })(last);
  window.__mm = { get S() { return S; }, S0, studio };
}
