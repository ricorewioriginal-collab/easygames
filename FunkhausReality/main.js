/* Funkhaus – Spielablauf: Einzug → Wochen mit Tagesplänen, Aufgabe, Nominierung (Beichtstuhl), Hörervotum, Auszug → Finale. */
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
  const [E, Cn, AV, V, P] = await Promise.all([import('./engine.js'), import('./content.js'), import('./avatars.js'), import('./views.js'), import('./panel.js')]); const { House } = await import('./house.js');
  const { newGame, resolveDay, resolveTask, nominate, vote, finalVote, alive, finalRanking, SLOTS } = E, { CAST, TEXT, EVENTS, VOICE, ROOMS: ROOMNAME, TIPS, TRAITS } = Cn, { look, avatar } = AV, { planView, nomView, taskView, publicState } = V, { renderAsk, ACT_ORDER, starsTxt, av } = P;
  const house = new House($('cv')); addEventListener('resize', () => house.resize()); new ResizeObserver(() => house.resize()).observe($('stage'));
  { const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.tag').style.marginTop = '0'; }; im.onerror = () => {}; im.src = 'logo.png'; }

  const FAST = () => window.__fhFast || 1, sleep = ms => new Promise(r => setTimeout(r, ms / FAST() / (skip ? 20 : 1)));
  const rnd = a => a[(Math.random() * a.length) | 0], fmt = (t, v) => String(t).replace(/\{(\w)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6', '#ff9a1f', '#00c46a', '#ff5252', '#4f7cff'];
  const S = { n: 1, total: 6, humans: store.get('fhHumans', []), tts: store.get('fhTts', false), snd: store.get('fhSnd', true) };
  const randTraits = () => { const a = TRAITS.slice().sort(() => Math.random() - 0.5); return a.slice(0, 2); };
  for (let i = 0; i < 4; i++) { const h = S.humans[i] || (S.humans[i] = {}); h.name = h.name || 'Spieler ' + (i + 1); h.traits = h.traits && h.traits.length === 2 ? h.traits : randTraits(); h.g = h.g || ['f', 'm', 'd', 'f'][i]; }
  let G = null, info = [], pubS = null, token = 0, pending = null, skip = false, say = '', logHist = [], asks = {}, pend = {}, askId = 0, curAsk = null;
  Audio_.setOn(S.snd); const show = id => { for (const s of ['menu', 'setup']) $(s).hidden = s !== id; };
  const setSnd = () => { $('bSound').textContent = S.snd ? '🔊 Ton' : '🔇 Ton'; $('bSnd').textContent = S.snd ? '🔊' : '🔇'; $('bVoice').style.opacity = S.tts ? 1 : 0.45; };
  const toggleSnd = () => { S.snd = !S.snd; Audio_.setOn(S.snd); store.set('fhSnd', S.snd); setSnd(); SFX.click(); }; setSnd();
  $('tip').textContent = '💡 ' + rnd(TIPS);

  // ------------------------------------------------------------ Karten (Dialoge) mit Warte-Funktion
  function card(html, ids) { if (skip) { return Promise.resolve(ids[0]); } $('dlgBox').innerHTML = html; $('dlg').hidden = false; return new Promise(res => { pending = { res, ids }; }); }
  function fire(id) { if (pending && pending.ids.includes(id)) { const p = pending; pending = null; $('dlg').hidden = true; p.res(id); } }
  $('dlgBox').addEventListener('click', e => { const b = e.target.closest('button[id]'); if (b) { SFX.click(); fire(b.id); } });
  function abort() { token++; const p = pending; pending = null; $('dlg').hidden = true; for (const k in pend) { try { pend[k].res(null); } catch (e) {} } pend = {}; asks = {}; if (curAsk) { curAsk.destroy(); curAsk = null; } skip = false; G = null; if (p) p.res('abort'); push(); }

  // ------------------------------------------------------------ Hilfen für Anzeige
  let clock = 0; setInterval(() => { clock++; $('recT').textContent = String((clock / 60) | 0).padStart(2, '0') + ':' + String(clock % 60).padStart(2, '0'); }, 1000);
  let view = 12400; setInterval(() => { const t = G ? 9000 + G.week * 2300 + (G.phase === 'vote' ? 5000 : 0) : 8000; view += (t - view) * 0.2 + (Math.random() - 0.5) * 300; $('hView').textContent = (view / 1000).toFixed(1) + 'k'; }, 2000);
  const PH = { day: 'Tagesplan', task: 'Wochenaufgabe', nom: 'Nominierung', vote: 'Hörervotum', finalvote: 'Finale' };
  function hud() { if (!G) return; pubS = publicState(G, info); $('hWeek').textContent = G.finalWeek ? 'FINALWOCHE' : 'Woche ' + G.week; $('hSub').textContent = G.phase === 'day' ? `Tag ${Math.min(G.day + 1, 3)}/3` : PH[G.phase] || ''; castStrip(); }
  function castStrip() { $('cast').innerHTML = pubS.cast.map(c => `<button class="cc ${c.alive ? '' : 'out'} ${c.human >= 0 ? 'me' : ''} ${c.nom ? 'nom' : ''}" data-i="${c.i}"><img class="av" src="${avatar(c.look, 80)}" width="38" height="38" alt=""><span class="nm">${esc(c.n)}</span><em>${starsTxt(c.stars)}</em>${c.immune ? '<span class="bd">🛡️</span>' : c.nom ? '<span class="bd">❌</span>' : pubS.allies.some(a => a.includes(c.i)) ? '<span class="bd">🤝</span>' : ''}</button>`).join(''); }
  $('cast').addEventListener('click', e => { const b = e.target.closest('.cc'); if (!b || !G) return; const c = pubS.cast[+b.dataset.i]; SFX.click(); $('dlgBox').innerHTML = `<div class="dc"><div style="text-align:center">${av(c, 88)}</div><h2>${esc(c.n)}${c.human >= 0 ? ' 🙋' : ''}</h2><div class="sub">${c.age ? c.age + ' · ' : ''}${esc(c.job || '')}</div><div class="bio">${esc(c.bio || '')}</div><div class="chips" style="justify-content:center">${c.traits.map(t => `<span class="chip on">${t}</span>`).join('')}</div><div class="sub">Hörer: ${starsTxt(c.stars)} · Stimmung ${c.mood}%${c.immune ? ' · 🛡️ immun' : ''}${c.alive ? '' : ' · ausgezogen'}</div><button class="btn" id="dClose">Schließen</button></div>`; $('dlg').hidden = false; pending = { res() {}, ids: ['dClose'] }; });
  function addLog(text, cls) { logHist.push(text); if (logHist.length > 80) logHist.shift(); const el = document.createElement('div'); el.className = 'tl ' + (cls || ''); el.textContent = text; $('ticker').appendChild(el); while ($('ticker').children.length > 3) $('ticker').firstChild.remove(); setTimeout(() => el.remove(), 9000 / FAST()); }
  $('bLog').onclick = () => { SFX.click(); $('dlgBox').innerHTML = `<div class="dc"><h2>📜 Live-Ticker</h2><div class="tbl" style="max-height:55vh;overflow:auto">${logHist.slice().reverse().map(l => `<div class="tr"><b style="white-space:normal">${esc(l)}</b></div>`).join('') || '<div class="info">Noch nichts passiert.</div>'}</div><button class="btn" id="dClose">Schließen</button></div>`; $('dlg').hidden = false; pending = { res() {}, ids: ['dClose'] }; };
  let vt = 0; function voice(key, vars, idx) { if (!VOICE[key]) return; const t = fmt(idx != null ? VOICE[key][idx] : rnd(VOICE[key]), vars || {}); say = t; $('voiceTxt').textContent = t; $('voice').hidden = false; clearTimeout(vt); vt = setTimeout(() => { $('voice').hidden = true; }, Math.max(3500, t.length * 60) / FAST()); if (S.tts && !skip && window.speechSynthesis) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.pitch = 0.55; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {} } push(); return t; }
  function banner(t, sub) { $('banner').innerHTML = esc(t) + (sub ? `<small>${esc(sub)}</small>` : ''); $('banner').hidden = false; $('banner').style.animation = 'none'; void $('banner').offsetWidth; $('banner').style.animation = ''; setTimeout(() => { $('banner').hidden = true; }, 1700 / FAST()); }
  const nm = i => info[i].n, N2 = (a, b) => ({ a: nm(a), b: b != null && b >= 0 ? nm(b) : '' });
  function logLine(ev) {
    if (ev.t === 'act') return fmt(rnd(TEXT[ev.act][ev.ok ? 'ok' : 'bad']), Object.assign(N2(ev.a, ev.tgt), { r: ROOMNAME[ev.room] }));
    if (ev.t === 'event') return fmt(rnd(EVENTS[ev.id]), Object.assign(N2(ev.a, ev.b), { r: ROOMNAME[ev.room] }));
    if (ev.t === 'leak') return `${nm(ev.by)} plaudert ein Geheimnis von ${nm(ev.a)} aus – das spricht sich herum!`;
    return '';
  }

  // ------------------------------------------------------------ Szenen im Haus
  const ICON = { talk: ['talk', '💬'], cook: ['cook', '🍳'], alliance: ['talk', '🤝'], tease: ['argue', '😜'], secret: ['think', '🤫'], rumor: ['think', '🗣️'], show: ['mic', '🎤'], relax: ['lie', '😌'] };
  const EVICON = { party: ['dance', '🎉'], fight: ['argue', '💢'], birthday: ['cheer', '🎂'], blackout: ['think', '🔦'], rain: ['sad', '🌧️'], gift: ['cheer', '🎁'], gossip: ['think', '👂'], burnt: ['sad', '🔥'], karaoke: ['mic', '🎤'], insomnia: ['sad', '🌙'] };
  const walk = (i, room, k) => Promise.race([house.walkTo(i, room, k), sleep(9000)]);
  async function scene(ev, tok) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    if (skip) return;
    house.focusRoom(ev.room);
    if (ev.t === 'act') {
      const a = ev.a, b = ev.tgt, [pose, ic] = ICON[ev.act]; await A(Promise.all([walk(a, ev.room, 0), b >= 0 ? walk(b, ev.room, 1) : null])); if (b >= 0) house.faceEach(a, b); else house.face(a, house.figs[a].x, house.figs[a].z + 5);
      if (ev.act === 'relax' && ev.room !== 'wohn') { house.setPose(a, 'idle', ic); } else house.setPose(a, pose, ic);
      if (b >= 0) house.setPose(b, ev.act === 'tease' || ev.act === 'rumor' ? (ev.act === 'tease' ? 'sad' : 'talk') : pose === 'think' ? 'think' : 'talk', ev.act === 'tease' ? '😠' : ev.act === 'rumor' ? '😮' : ic);
      if (ev.act === 'show') { SFX.beep(660); house.cheer(0.8); }
      await A(sleep(1300)); house.say(a, ev.ok ? (ev.act === 'tease' ? '😈' : ev.act === 'rumor' ? '😏' : '👍') : '😬'); if (b >= 0) house.say(b, ev.ok ? (ev.act === 'tease' ? '😤' : '😊') : '🙄'); ev.ok ? SFX.ding() : SFX.buzz(); await A(sleep(1200)); house.setPose(a, 'idle'); if (b >= 0) house.setPose(b, 'idle');
    } else if (ev.t === 'event') {
      const [pose, ic] = EVICON[ev.id]; const ids = ev.id === 'party' || ev.id === 'karaoke' || ev.id === 'gift' || ev.id === 'blackout' || ev.id === 'rain' ? alive(G).map(r => r.i) : [ev.a, ev.b]; await A(Promise.all(ids.map((i, k) => walk(i, ev.room, k))));
      ids.forEach(i => house.setPose(i, ids.length > 3 ? (ev.id === 'blackout' || ev.id === 'rain' ? 'sad' : 'dance') : pose, ic)); if (ev.id === 'fight') house.faceEach(ev.a, ev.b); if (ids.length > 3) house.cheer(0.9); ev.id === 'fight' ? SFX.sting() : SFX.pad(2); await A(sleep(2300)); ids.forEach(i => house.setPose(i, 'idle'));
    } else if (ev.t === 'leak') { await A(Promise.all([walk(ev.by, 'schlaf', 0), walk(ev.a, 'schlaf', 1)])); house.faceEach(ev.by, ev.a); house.setPose(ev.by, 'talk', '🗣️'); house.setPose(ev.a, 'sad', '😳'); SFX.sting(); await A(sleep(1800)); house.setPose(ev.by, 'idle'); house.setPose(ev.a, 'idle'); }
  }
  function scatter() { const al = alive(G); al.forEach((r, k) => { const rooms = ['wohn', 'kueche', 'garten', 'schlaf', 'wohn', 'studio']; house.place(r.i, rooms[(k + (Math.random() * 6 | 0)) % 6], k); house.setPose(r.i, 'idle'); }); }
  function highlights(evs) { const hum = e => (e.t === 'act' && (info[e.a].human >= 0 || (e.tgt >= 0 && info[e.tgt].human >= 0))); const sel = []; for (const e of evs) if (e.t !== 'act' || hum(e) || e.hl) sel.push(e); const pick = sel.sort(() => Math.random() - 0.5).slice(0, 6); return evs.filter(e => pick.includes(e)); }

  // ------------------------------------------------------------ Eingaben (Hot-Seat und Handy)
  const decodePlan = v => { const out = []; if (Array.isArray(v)) for (let k = 0; k + 1 < v.length && out.length < SLOTS; k += 2) { const a = ACT_ORDER[v[k]]; if (a) out.push({ a, t: v[k + 1] }); } return out; };
  async function collect(tok, kind) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const hum = G.res.filter(r => r.alive && r.human >= 0), out = {}; if (!hum.length || skip) return out;
    const mk = r => (kind === 'plan' ? planView(G, r.i) : kind === 'nom' ? nomView(G, r.i) : taskView(G)), pub = publicState(G, info);
    const phone = hum.filter(r => pair.has(r.human)), seat = hum.filter(r => !pair.has(r.human));
    const ps = phone.map(r => new Promise(res => { asks[r.human] = Object.assign(mk(r), { id: ++askId }); pend[r.human] = { res, kind }; }).then(v => { out[r.i] = v; delete asks[r.human]; delete pend[r.human]; }));
    push();
    const seq = (async () => {
      for (const r of seat) {
        if (kind === 'nom') { house.focusRoom('beicht'); house.place(r.i, 'beicht', 4); house.setPose(r.i, 'think'); }
        if (seat.length > 1 || phone.length) { $('act').innerHTML = `<div class="dc"><h2>🙈 ${esc(r.n)}</h2><div class="sub">Nur ${esc(r.n)} schaut jetzt auf den Bildschirm!</div><button class="btn green" id="bReady">Bereit!</button></div>`; await A(card('<div class="dc"><h2>🙈 ' + esc(r.n) + ' ist dran</h2><div class="sub">Alle anderen bitte wegschauen.</div><button class="btn green" id="bReady">Bereit!</button></div>', ['bReady'])); }
        const v = await A(new Promise(res => { curAsk = renderAsk($('act'), mk(r), pub, res); })); curAsk.destroy(); curAsk = null; out[r.i] = v; $('act').innerHTML = `<div class="info">✔ ${esc(r.n)}: abgegeben.</div>`;
      }
      if (seat.length && phone.length) $('act').innerHTML = '<div class="info">⏳ Warte auf die Handys …</div>';
    })();
    await A(Promise.all([...ps, seq])); push(); return out;
  }
  const status = html => { $('act').innerHTML = `<div class="info">${html}</div>`; };

  // ------------------------------------------------------------ Staffel
  async function season(tok) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const hs = S.humans.slice(0, S.n).map(h => ({ n: (h.name || 'Spieler').slice(0, 9), traits: h.traits, age: '', job: 'Das bist du!', bio: 'Du ziehst ins Funkhaus – mach das Beste draus.', g: h.g })); const used = new Set(hs.map(h => h.n.toLowerCase()));
    const pool = CAST.filter(c => !used.has(c.n.toLowerCase())).sort(() => Math.random() - 0.5).slice(0, S.total - hs.length); info = [...hs, ...pool].map((c, i) => Object.assign({}, c, { look: look(c, i) }));
    const seed = (Math.random() * 1e9) | 0; G = newGame({ cast: info, humans: hs.map((_, i) => i), seed }); G.asksReset = 0; skip = false; logHist = []; asks = {}; pend = {};
    house.setCast(info.map(c => c.look)); show(null); hud(); status('🏠 Einzug …'); house.setTime(0.8); scatter(); house.focusRoom(null);
    banner('WILLKOMMEN', 'im Funkhaus'); SFX.fanfare(); voice('welcome'); house.confetti(0, 2); await A(sleep(3200));
    while (G.phase !== 'end') {
      hud();
      if (G.phase === 'day') {
        if (G.day === 0) { banner(G.finalWeek ? 'FINALWOCHE' : 'WOCHE ' + G.week, G.finalWeek ? 'die letzten Drei' : alive(G).length + ' Bewohner'); SFX.sting(); voice('weekStart', { w: G.week }); await A(sleep(2400)); }
        house.setTime(0.8); voice('morning'); scatter(); house.focusRoom(null); hud(); status(`☀️ Tag ${G.day + 1}: Plane deinen Tag.`);
        const plans = {}; const got = await collect(tok, 'plan'); for (const k in got) plans[k] = got[k] ? decodePlan(got[k]) : [];
        status('📺 Der Tag läuft …'); house.setTime(1); const evs = resolveDay(G, plans); hud();
        const hl = highlights(evs); for (const e of evs) { const l = logLine(e); if (!skip) addLog(l, e.t === 'event' ? 'ev' : e.ok === false ? 'bad' : ''); else logHist.push(l); }
        for (const e of hl) await scene(e, tok);
        house.focusRoom(null); house.setTime(0.12); voice('night'); alive(G).forEach((r, k) => { house.place(r.i, 'schlaf', k); house.setPose(r.i, 'lie'); }); await A(sleep(1800));
      } else if (G.phase === 'task') {
        house.setTime(0.45); house.focusRoom('studio'); voice('task'); banner('WOCHENAUFGABE'); alive(G).forEach((r, k) => { house.place(r.i, 'studio', k); }); SFX.sting(); hud(); await A(sleep(2200)); status('🏆 Wochenaufgabe!');
        const got = await collect(tok, 'task'); const sc = {}; for (const k in got) sc[k] = got[k] ? got[k][0] : 0; const t = resolveTask(G, sc); hud();
        const w = t.winner; house.setPose(w, 'cheer', '🏆'); SFX.top(); voice('taskWin', { a: nm(w) });
        await A(card(`<div class="dc"><h2>🏆 ${esc(nm(w))} gewinnt!</h2><div class="sub">${esc(({ reflex: 'Funk-Reflex', memory: 'Merk-Melodie', guess: 'Schätz-Radar' })[t.kind])} · Immun diese Woche 🛡️</div><div class="tbl">${t.scores.map((s, k) => `<div class="tr ${k === 0 ? 'win' : ''}">${av(info[s.i], 30)}<b>${esc(nm(s.i))}</b><span>${Math.round(s.s)}</span></div>`).join('')}</div><button class="btn green" id="bNext">Weiter ▶</button></div>`, ['bNext']));
      } else if (G.phase === 'nom') {
        house.setTime(0.35); voice('nomIntro'); banner('NOMINIERUNG', 'Beichtstuhl'); SFX.sting(); hud(); await A(sleep(2000)); status('🔴 Beichtstuhl: Nominierungen');
        const got = await collect(tok, 'nom'); const picks = {}; for (const k in got) picks[k] = got[k] || []; const nmr = nominate(G, picks); hud(); house.focusRoom('studio'); alive(G).forEach((r, k) => house.place(r.i, 'studio', k)); SFX.drum();
        const ids = nmr.nominees; voice(ids.length > 2 ? 'nomResult3' : 'nomResult', { a: nm(ids[0]), b: nm(ids[1]), c: ids[2] != null ? nm(ids[2]) : '' });
        const rows = alive(G).map(r => `<div class="tr"><b>${esc(r.n)}</b><em>wählt</em><span>${(nmr.votes[r.i] || []).map(j => esc(nm(j))).join(', ')}</span></div>`).join('');
        await A(card(`<div class="dc"><h2>❌ Nominiert</h2><div class="tbl">${ids.map(i => `<div class="tr lose">${av(info[i], 34)}<b>${esc(nm(i))}</b><span>${nmr.points[i]} Pkt</span></div>`).join('')}</div><div class="sub">So haben alle gewählt:</div><div class="tbl" style="max-height:30vh;overflow:auto">${rows}</div><button class="btn red" id="bNext">Zum Hörervotum ▶</button></div>`, ['bNext']));
      } else if (G.phase === 'vote') {
        const ids = G.nominees.slice(); house.setTime(0.3); house.focusRoom('studio'); voice('voteIntro'); banner('HÖRERVOTUM'); SFX.sting(); hud(); await A(sleep(2200));
        const r = vote(G); const bars = $('bars'); bars.hidden = false; bars.innerHTML = `<h3>🎙 Wer muss gehen? Raus-Stimmen der Hörer</h3>` + ids.map(i => `<div class="br" data-i="${i}">${av(info[i], 44)}<div class="bw"><div class="bf"></div><span>${esc(nm(i))} · <b class="pc">0</b> %</span></div></div>`).join(''); await A(sleep(300));
        ids.forEach((i, k) => { const row = bars.querySelector(`[data-i="${i}"]`); row.querySelector('.bf').style.width = r.pct[k] + '%'; let n = 0; const t0 = performance.now(); const tick = () => { const u = Math.min(1, ((performance.now() - t0) * FAST() * (skip ? 20 : 1)) / 2600); row.querySelector('.pc').textContent = Math.round(r.pct[k] * u); if (u < 1) requestAnimationFrame(tick); }; tick(); }); SFX.drum(); await A(sleep(1000)); SFX.drum(); await A(sleep(1800));
        bars.querySelector(`[data-i="${r.leaver}"]`).classList.add('lose'); SFX.sad(); await A(sleep(1400)); bars.hidden = true;
        voice('leave', { a: nm(r.leaver) }); hud(); status(`🚪 ${esc(nm(r.leaver))} verlässt das Haus.`); house.focusRoom('garten'); house.setPose(r.leaver, 'sad', '😢'); await A(sleep(1600)); const ex = house.exitHouse(r.leaver); house.focusRoom(null); house.cheer(1); SFX.clap(2); await A(Promise.race([ex, sleep(9000)])); house.cheer(1);
        const hum = info[r.leaver].human >= 0; await A(card(`<div class="dc"><div style="text-align:center">${av(info[r.leaver], 80)}</div><h2>${esc(nm(r.leaver))} ist ausgezogen</h2><div class="sub">${r.pct[ids.indexOf(r.leaver)]} % der Hörer wollten ${esc(nm(r.leaver))} nicht mehr im Haus${hum ? '.<br>Du schaust jetzt zu – oder überspringst bis zum Finale.' : '.'}</div>${hum && alive(G).every(x => x.human < 0) ? '<button class="btn blue" id="bSkip">⏩ Bis zum Finale überspringen</button>' : ''}<button class="btn green" id="bNext">Weiter ▶</button></div>`, hum && alive(G).every(x => x.human < 0) ? ['bNext', 'bSkip'] : ['bNext'])).then(id => { if (id === 'bSkip') skip = true; });
      } else if (G.phase === 'finalvote') {
        skip = false; house.setTime(0.3); house.focusRoom('studio'); voice('finalIntro'); banner('DAS FINALE'); SFX.sting(); alive(G).forEach((r, k) => house.place(r.i, 'studio', k)); hud(); await A(sleep(2400)); const r = finalVote(G); hud();
        const w = r.order[0]; house.setPose(w, 'cheer', '👑'); house.confetti(0, -2); SFX.fanfare(); SFX.clap(3); voice('winner', { a: nm(w) });
        const rk = finalRanking(G); await A(sleep(1800)); const hum = info.some(x => x.human >= 0);
        const pick = await A(card(`<div class="dc"><div style="text-align:center;font-size:54px">👑</div><div style="text-align:center">${av(info[w], 96)}</div><h2>${esc(nm(w))} gewinnt das Funkhaus!</h2><div class="tbl">${rk.map((i, k) => `<div class="tr ${k === 0 ? 'win' : ''}"><em>${k + 1}.</em>${av(info[i], 30)}<b>${esc(nm(i))}${info[i].human >= 0 ? ' 🙋' : ''}</b>${k < 3 ? `<span>${r.pct[k] || ''}${r.pct[k] ? ' %' : ''}</span>` : ''}</div>`).join('')}</div><div class="prize"><img src="logos/16.png" alt="RicoReWi Radioportal" width="52" height="52"><div><b>Hauptgewinn: Ruhm &amp; Ehre</b><small>gestiftet vom RicoReWi Radioportal 😉</small></div></div><div class="row"><button class="btn green" id="bAgain">Neue Staffel</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
        if (pick === 'bAgain') { startSeason(); } else { abort(); show('menu'); } return;
      }
    }
  }
  function startSeason() { abort(); const tok = token; season(tok).catch(e => { if (e !== ABORT) throw e; }); }

  // ------------------------------------------------------------ Handy-Kopplung
  const pair = initPair({
    names: () => S.humans.slice(0, S.n).map(h => h.name),
    freeSlot: () => { const n = G ? G.res.filter(r => r.human >= 0).length : S.n; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
    onJoin: (slot, name) => { S.humans[slot].name = name.slice(0, 9); store.set('fhHumans', S.humans); fillHumans(); if (G && info[slot]) { info[slot].n = G.res[slot].n = S.humans[slot].name; hud(); } },
    onMessage: (slot, m) => { const p = pend[slot]; if (p && m.t === 'ans' && Array.isArray(m.v)) p.res(m.v); },
    onChange: () => { for (const k in pend) if (!pair.has(+k)) { try { pend[k].res(null); } catch (e) {} delete pend[k]; delete asks[k]; } push(); },
    snapshot: () => (G ? { view: G.phase === 'end' ? 'end' : 'play', pub: publicState(G, info), asks, say, tick: logHist.slice(-3) } : { view: 'menu' })
  });
  const push = () => { try { pair.push(); } catch (e) {} };

  // ------------------------------------------------------------ Einrichtung
  function fillHumans() { $('humans').innerHTML = S.humans.slice(0, S.n).map((h, i) => `<div class="hc" style="--pc:${CSS[i]}"><input data-i="${i}" maxlength="9" value="${esc(h.name)}" aria-label="Name Mensch ${i + 1}" autocomplete="off"><div class="seg gseg" data-i="${i}">${[['f', '♀'], ['m', '♂'], ['d', '⚧']].map(([v, l]) => `<button data-v="${v}" class="${h.g === v ? 'on' : ''}">${l}</button>`).join('')}</div><div class="chips" data-i="${i}">${TRAITS.map(t => `<button class="chip ${h.traits.includes(t) ? 'on' : ''}" data-t="${t}">${t}</button>`).join('')}</div></div>`).join(''); }
  $('humans').addEventListener('input', e => { const i = +e.target.dataset.i; if (e.target.tagName === 'INPUT') { S.humans[i].name = e.target.value.trim().slice(0, 9) || 'Spieler ' + (i + 1); store.set('fhHumans', S.humans); } });
  $('humans').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; SFX.click(); const hc = b.closest('[data-i]'), i = +hc.dataset.i, h = S.humans[i]; if (b.dataset.v) { h.g = b.dataset.v; } else if (b.dataset.t) { const t = b.dataset.t, k = h.traits.indexOf(t); if (k >= 0) { if (h.traits.length > 1) h.traits.splice(k, 1); } else { h.traits.push(t); if (h.traits.length > 2) h.traits.shift(); } } store.set('fhHumans', S.humans); fillHumans(); });
  const seg = (id, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; SFX.click(); $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); });
  seg('sgPl', v => { S.n = v; fillHumans(); push(); }); seg('sgTot', v => { S.total = v; });

  show('menu'); house.setCast([]); house.focusRoom(null); house.setTime(0.9);
  $('bPlay').onclick = () => { Audio_.unlock(); SFX.click(); $('sgPl').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.v === S.n)); fillHumans(); show('setup'); };
  $('bSetBack').onclick = () => { SFX.click(); show('menu'); };
  $('bStart').onclick = () => { Audio_.unlock(); SFX.click(); S.humans.forEach(h => { if (h.traits.length < 2) h.traits = [...h.traits, TRAITS.find(t => !h.traits.includes(t))]; }); startSeason(); };
  $('bPairMenu').onclick = $('bPairSetup').onclick = () => { SFX.click(); pair.open(); };
  $('bMenu').onclick = () => { SFX.click(); if (confirm('Staffel wirklich beenden?')) { abort(); show('menu'); } };
  $('bRules').onclick = () => { SFX.click(); $('rules').hidden = false; }; $('rulesOk').onclick = () => { $('rules').hidden = true; };
  $('bSound').onclick = $('bSnd').onclick = toggleSnd; $('bVoice').onclick = () => { S.tts = !S.tts; store.set('fhTts', S.tts); setSnd(); if (S.tts) voice('welcome'); else try { speechSynthesis.cancel(); } catch (e) {} };
  let last = performance.now(); (function loop(now) { house.frame((now - last) / 1000); last = now; requestAnimationFrame(loop); })(last);
  window.__fh = { get G() { return G; }, S, house, get info() { return info; } };
}
