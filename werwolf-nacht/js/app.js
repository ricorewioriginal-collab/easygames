/* Werwolf-Nacht – App: Ladebildschirm, Titel, Menü, Solo (du gegen Computer-Dorfbewohner), Online & Handys (Fernseher = Dorf
 * und Erzähler, jedes Handy = geheime Rollenkarte, Computer füllen auf), Ergebnis, Rekorde, Rollen-Übersicht.
 * Ablauf (Spielleiter): Nacht (Leibwächter → Werwölfe → Seherin → Hexe) → Morgen → Tag (Aussagen) → Abstimmung → … bis zum Sieg.
 * Online über ../cloud/fire-peer.js (PeerJS-kompatibel); Links über die easygames-Homepage (EasyGamesLink.share). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'werwolf-nacht-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const { NAMES, NARR, TALK } = WW_DATA, R = WW.ROLES, S = window.WWSound, V = window.WWVoice, SC = window.WWScene;
  const SET = Object.assign({ voice: true, sound: true, amb: true, fast: false, vib: true, name: '', size: 8, role: 'random', time: 120 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const applySet = () => { S.sfxOn = SET.sound; S.ambOn = SET.amb; V.on = SET.voice; };
  applySet();
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fill = (t, o) => t.replace(/\{(\w)\}/g, (_, k) => o[k] != null ? o[k] : '');
  const ST = Object.assign({ games: 0, wins: 0, asWolf: 0, wolfWins: 0, survived: 0, pts: 0, wolvesCaught: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => { LS.set(P + 'stats', ST); if (ST.pts > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', ST.pts); };

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sSolo: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sPhone: () => { if (!$('pJoin').hidden) { netClose(); toMenu(); } } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sGame' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  const closeAll = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); if (ov.id === 'ovEnd') return $('eMenu').click(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); return closeOv(ov.id); }
    if (cur === 'sGame') return pause();
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }
  const sky = (ph, o) => { $('village').innerHTML = SC.village(ph, o); };

  /* ---------- Spielleiter ---------- */
  const A = { mode: '', G: null, run: 0, me: -1, paused: false, pend: null, sel: -1, goodVotes: 0, speed: 1, bubbles: {}, seenMe: {} };
  const ABORT = { abort: true };
  const live = tok => { if (tok !== A.run) throw ABORT; };
  async function wait(ms, tok) { let t = ms * (SET.fast ? .45 : 1) * A.speed; while (t > 0) { live(tok); await new Promise(r => setTimeout(r, Math.min(100, t))); if (!A.paused) t -= 100; } live(tok); }
  // Erzähler: Text zeigen, vorlesen, an die Handys schicken
  async function narr(text, tok, o) {
    live(tok); o = o || {};
    $('say').textContent = text; if (A.mode === 'host') netAll({ t: 'info', text });
    const p = V.speak(text, o.queue), min = wait(Math.min(4200, 900 + text.length * 38), tok);
    await Promise.race([Promise.all([p, min]), wait(9000, tok)]); live(tok);
  }
  const G = () => A.G;
  const nm = i => A.G.p[i].name;
  const roleN = i => R[A.G.p[i].role].n;
  const artN = i => { const r = A.G.p[i].role; return ({ wolf: 'ein Werwolf', seer: 'die Seherin', witch: 'die Hexe', guard: 'der Leibwächter', hunter: 'der Jäger', villager: 'ein Dorfbewohner' })[r]; };
  function phase(ph) {
    const g = A.G; A.phase = ph; sky(ph, { wolfEyes: ph === 'night' ? WW.alive(g).filter(p => p.role === 'wolf').length : 0 });
    $('phase').textContent = { night: '🌙 Nacht ' + g.day, dawn: '🌅 Morgen ' + g.day, day: '☀️ Tag ' + g.day, vote: '⚖️ Abstimmung', over: '🏁 Spielende' }[ph];
    S.ambience(ph === 'night' ? 'night' : ph === 'vote' ? 'vote' : ph === 'over' ? '' : 'day');
    if (A.mode === 'host') netAll({ t: 'phase', ph, day: g.day });
    ring();
  }
  // Spielerkreis um das Lagerfeuer
  function ring() {
    const g = A.G; if (!g) return; const el = $('ring'), n = g.p.length, me = A.me, por = innerWidth < innerHeight, small = innerWidth < 700;
    const pw = small ? (n > 8 ? 62 : 70) : 92, ph = small ? (n > 8 ? 78 : 88) : 122;
    el.style.setProperty('--pw', pw + 'px'); el.style.setProperty('--ph', ph + 'px');
    const order = g.p.map(p => p.id); if (me >= 0) { const k = order.indexOf(me); order.push(...order.splice(0, k)); }
    const mates = me >= 0 && g.p[me].role === 'wolf';
    el.innerHTML = order.map((id, k) => {
      const p = g.p[id], th = Math.PI / 2 + 2 * Math.PI * k / n, cx = 50 + Math.cos(th) * (por ? 39 : 41), cy = (por ? 62 : 64) + Math.sin(th) * (por ? 24 : 24), sc = .78 + .22 * (Math.sin(th) + 1) / 2;
      let rl = '';
      if (!p.alive || A.phase === 'over') rl = R[p.role].icon + ' ' + R[p.role].n;
      else if (id === me) rl = R[p.role].icon + ' Du';
      else if (mates && p.role === 'wolf') rl = '🐺 Rudel';
      else if (A.seenMe[id] !== undefined) rl = A.seenMe[id] ? '🔮 Werwolf!' : '🔮 unschuldig';
      return `<button class="pl nav${p.alive ? '' : ' dead'}${id === me ? ' me' : ''}" data-id="${id}" style="left:${cx}%;top:${cy}%;transform:translate(-50%,-100%) scale(${sc});z-index:${Math.round(cy)}">${A.bubbles[id] ? `<span class="bub${cx < 22 ? ' l' : cx > 78 ? ' r' : ''}">${esc(A.bubbles[id])}</span>` : ''}<span class="sil">${SC.figure(p.look)}</span><span class="nm">${esc(p.name)}</span>${rl ? `<span class="rl">${esc(rl)}</span>` : ''}${A.tags && A.tags[id] ? `<span class="tag">${A.tags[id]}</span>` : ''}</button>`;
    }).join('');
    el.querySelectorAll('.pl').forEach(b => { b.onclick = () => tapPlayer(+b.dataset.id); });
    if (A.pend && A.pend.targets) markTargets();
    const w = WW.alive(g).filter(p => p.role === 'wolf').length; $('wolvesLeft').textContent = '🐺 ' + w + ' · 👥 ' + WW.alive(g).length;
    $('myRole').hidden = me < 0; if (me >= 0) $('myRole').textContent = R[g.p[me].role].icon + ' ' + R[g.p[me].role].n;
  }
  function bubble(id, text, ms) { const ks = Object.keys(A.bubbles); if (ks.length >= 3) delete A.bubbles[ks[0]]; A.bubbles[id] = text; ring(); setTimeout(() => { if (A.bubbles[id] === text) { delete A.bubbles[id]; ring(); } }, ms || 3200); }
  function feed(html, cls) { const f = $('feed'), p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; f.appendChild(p); while (f.children.length > 40) f.firstChild.remove(); f.scrollTop = f.scrollHeight; }
  /* ---------- Fragen an Spieler ---------- */
  // spec: { q, targets: [ids], opts: [{ v, label }], def }
  function uiAsk(spec, tok) {
    live(tok);
    return new Promise((res, rej) => {
      A.pend = { spec, res, rej, tok, targets: spec.targets || null }; A.sel = -1; drawAsk(); markTargets(); vib(25);
      setTimeout(() => { const f = spec.targets && spec.targets.length ? $('ring').querySelector('.pl.can') : $('ask').querySelector('.btn'); if (f && !coarse()) try { f.focus(); } catch (e) { } }, 30);
    });
  }
  function drawAsk() {
    const p = A.pend, a = $('ask'); if (!p) { a.innerHTML = ''; return; }
    let h = `<p class="q">${esc(p.spec.q)}</p>`;
    if (p.targets && A.sel >= 0) h += `<button class="btn pri nav" data-v="${A.sel}">✔ ${esc(nm(A.sel))}</button>`;
    else if (p.targets && p.targets.length) h += `<span class="hint">${coarse() ? 'Tippe' : 'Wähle'} eine leuchtende Person an.</span>`;
    (p.spec.opts || []).forEach(o => { h += `<button class="btn nav${o.cls ? ' ' + o.cls : ''}" data-v="${o.v}">${esc(o.label)}</button>`; });
    a.innerHTML = h;
    a.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => answer(+b.dataset.v); });
  }
  function markTargets() { const p = A.pend; $('ring').querySelectorAll('.pl').forEach(b => { const id = +b.dataset.id; b.classList.toggle('can', !!(p && p.targets && p.targets.includes(id))); b.classList.toggle('sel', id === A.sel); }); }
  function tapPlayer(id) {
    const p = A.pend; if (!p || !p.targets || !p.targets.includes(id)) { if (A.mode === 'solo' && A.G) { const g = A.G.p[id]; toast(g.name + (g.alive ? '' : ' – ' + R[g.role].n + ' (tot)')); } return; }
    if (A.sel === id) return answer(id);
    A.sel = id; S.sfx('move'); markTargets(); drawAsk(); const b = $('ask').querySelector('.btn.pri'); if (b && document.body.classList.contains('kbd')) b.focus();
  }
  function answer(v) { const p = A.pend; if (!p) return; A.pend = null; A.sel = -1; drawAsk(); markTargets(); S.sfx('ok'); p.res(v); }
  function cancelAsk() { const p = A.pend; A.pend = null; drawAsk(); if (p) p.rej(ABORT); }
  // an einen Spieler (lokal, Handy oder Computer)
  function askPlayer(pid, spec, tok) {
    const pl = A.G.p[pid];
    if (pl.bot) return Promise.resolve(spec.def);
    if (A.mode === 'solo') return pid === A.me ? uiAsk(spec, tok) : Promise.resolve(spec.def);
    return netAsk(pid, spec, tok);
  }
  function tell(pid, text) { if (A.G.p[pid].bot) return; if (A.mode === 'solo') { if (pid === A.me) { feed('🤫 ' + esc(text), 'me'); toast(text, 3600); } } else netTo(pid, { t: 'secret', text }); }

  /* ---------- Spielablauf ---------- */
  async function play() {
    const tok = ++A.run, g = A.G;
    try {
      phase('night');
      if (A.mode === 'solo') { showMyRole(); await waitClosed('ovRole', tok); }
      else { roleCards(); await narr('Willkommen in Düsterwald! Schaut heimlich auf eure Handys – dort steht eure Rolle.', tok); await wait(2500, tok); }
      while (!g.over) {
        await night(tok); if (g.over) break;
        await dawn(tok); if (g.over) break;
        await day(tok); await vote(tok); if (g.over) break;
        WW.nextNight(g);
      }
      await finale(tok);
    } catch (e) { if (e !== ABORT) { console.error(e); toast('Fehler im Spielablauf'); } }
  }
  async function waitClosed(id, tok) { while (!$(id).hidden) { live(tok); await new Promise(r => setTimeout(r, 120)); } }
  async function night(tok) {
    const g = A.G; phase('night'); $('feed').innerHTML = ''; A.tags = null;
    if (g.day === 1) S.sfx('howl'); await narr(pick(NARR.night1), tok);
    for (const kind of WW.ORDER) {
      if (!WW.needs(g, kind)) continue;
      await narr(NARR.wake[kind], tok);
      if (kind === 'wolf') { S.sfx('howl'); WW.botNight(g, 'wolf'); }
      if (kind === 'witch') WW.botNight(g, 'wolf');
      const humans = WW.actors(g, kind).filter(p => !p.bot);
      await Promise.all(humans.map(p => nightHuman(kind, p, tok)));
      WW.botNight(g, kind);
      if (!humans.length || (A.mode === 'solo' && !humans.some(p => p.id === A.me))) await wait(1300 + Math.random() * 900, tok);
      await narr(NARR.sleep[kind], tok);
    }
  }
  async function nightHuman(kind, P, tok) {
    const g = A.G, ts = WW.targets(g, kind, P.id), def = ts[Math.floor(Math.random() * ts.length)];
    if (kind === 'guard') { const v = await askPlayer(P.id, { q: '🛡️ Wen beschützt du heute Nacht?', targets: ts, def }, tok); WW.act(g, 'guard', P.id, v >= 0 ? v : def); }
    else if (kind === 'wolf') {
      const mates = WW.actors(g, 'wolf').filter(w => w.id !== P.id), plan = mates.map(w => g.night.wolfVotes[w.id] >= 0 ? nm(w.id) + ' will ' + nm(g.night.wolfVotes[w.id]) : '').filter(Boolean);
      const v = await askPlayer(P.id, { q: '🐺 Wen fresst ihr heute Nacht?' + (plan.length ? ' (' + plan.join(', ') + ')' : mates.length ? ' (Rudel: ' + mates.map(w => w.name).join(', ') + ')' : ''), targets: ts, def }, tok);
      WW.act(g, 'wolf', P.id, v >= 0 ? v : def);
    } else if (kind === 'seer') {
      if (!ts.length) { tell(P.id, 'Du hast schon alle durchschaut.'); return; }
      const v = await askPlayer(P.id, { q: '🔮 In wessen Seele blickst du?', targets: ts, def }, tok), t = v >= 0 ? v : def;
      WW.act(g, 'seer', P.id, t); const wolf = g.seen[P.id][t];
      if (P.id === A.me) { A.seenMe[t] = wolf; ring(); S.sfx('magic'); }
      tell(P.id, nm(t) + (wolf ? ' ist ein WERWOLF! 🐺' : ' ist kein Werwolf.'));
    } else if (kind === 'witch') {
      const vic = WW.wolfVictim(g), ex = {};
      if (vic >= 0 && g.potions.heal) { const h = await askPlayer(P.id, { q: '🧪 Die Werwölfe haben ' + (vic === P.id ? 'DICH' : nm(vic)) + ' angegriffen. Heiltrank benutzen?', opts: [{ v: 1, label: '🧪 Ja, retten', cls: 'pri' }, { v: 0, label: 'Nein' }], def: 0 }, tok); ex.heal = h === 1; }
      else if (vic < 0) tell(P.id, 'Heute Nacht haben die Werwölfe niemanden angegriffen.');
      else tell(P.id, 'Heute wurde ' + nm(vic) + ' angegriffen – dein Heiltrank ist leer.');
      if (g.potions.kill) { const k = await askPlayer(P.id, { q: '☠️ Gifttrank einsetzen?', targets: WW.targets(g, 'witch', P.id), opts: [{ v: -1, label: 'Nein, heute nicht' }], def: -1 }, tok); if (k >= 0) ex.kill = k; }
      WW.act(g, 'witch', P.id, -1, ex);
    }
  }
  async function dawn(tok) {
    const g = A.G; phase('dawn'); S.sfx('bell');
    const r = WW.resolveNight(g); await narr(pick(NARR.dawn), tok); ring();
    if (!r.died.length) await narr(pick(NARR.noDeath), tok);
    for (const d of r.died) { S.sfx('death'); vib(120); ring(); await narr(fill(pick(g.p[d].how === 'poison' ? NARR.poison : NARR.death), { n: nm(d), r: artN(d) }), tok); feed('💀 <b>' + esc(nm(d)) + '</b> starb in der Nacht – ' + esc(roleN(d)) + '.', 'sys'); }
    if (r.hunter >= 0) await hunter(r.hunter, tok);
    if (A.me >= 0 && !g.p[A.me].alive && r.died.includes(A.me)) toast('💀 Du bist tot – du schaust jetzt zu.', 3600);
  }
  async function hunter(id, tok) {
    const g = A.G, ts = WW.aliveIds(g).filter(i => i !== id);
    await narr(nm(id) + ' war der Jäger und legt ein letztes Mal an …', tok);
    let t;
    if (g.p[id].bot) t = WW.hunterShot(g, id);
    else { const v = await askPlayer(id, { q: '🏹 Dein letzter Schuss – wen nimmst du mit?', targets: ts, def: ts[0] }, tok); t = WW.hunterShot(g, id, v >= 0 ? v : ts[0]); }
    if (t !== false && t >= 0) { S.sfx('death'); ring(); await narr(fill(NARR.hunter, { n: nm(id), t: nm(t), r: artN(t) }), tok); feed('🏹 <b>' + esc(nm(t)) + '</b> wurde vom Jäger erschossen – ' + esc(roleN(t)) + '.', 'sys'); }
  }
  function talkText(s) {
    const t = s.target >= 0 ? nm(s.target) : '';
    if (s.kind === 'claim') return fill(pick(s.wolf ? TALK.claimWolf : TALK.claimGood), { t });
    return fill(pick(TALK[s.kind] || TALK.calm), { t });
  }
  async function day(tok) {
    const g = A.G; phase('day'); await narr(pick(NARR.day), tok);
    const talk = WW.dayTalk(g);
    for (const s of talk) { const tx = talkText(s); bubble(s.pid, tx, 3400); feed('<b>' + esc(nm(s.pid)) + ':</b> ' + esc(tx)); if (s.kind === 'claim') V.speak(nm(s.pid) + ' sagt: ' + tx, true); if (A.mode === 'host') netAll({ t: 'talk', text: nm(s.pid) + ': ' + tx }); await wait(1200, tok); }
    if (A.mode === 'solo') await soloDay(tok); else await hostDay(tok);
  }
  async function soloDay(tok) {
    const g = A.G, me = g.p[A.me];
    if (!me.alive) { await wait(1800, tok); return; }
    for (let k = 0; k < 8; k++) {
      const v = await uiAsk({ q: 'Was sagst du dem Dorf?', opts: [{ v: 1, label: '🗣️ Jemanden verdächtigen' }, { v: 2, label: '🔮 „Ich bin die Seherin …“' }, { v: 3, label: '⚖️ Zur Abstimmung', cls: 'pri' }] }, tok);
      if (v === 3) return;
      const others = WW.aliveIds(g).filter(i => i !== A.me);
      const t = await uiAsk({ q: v === 1 ? 'Wen verdächtigst du?' : 'Über wen sprichst du als Seherin?', targets: others, opts: [{ v: -1, label: '← Zurück' }] }, tok);
      if (t < 0) continue;
      let tx;
      if (v === 1) { WW.accuse(g, A.me, t, 1.4); tx = fill(pick(TALK.accuse), { t: nm(t) }); }
      else { const w = await uiAsk({ q: nm(t) + ' ist …', opts: [{ v: 1, label: '🐺 ein Werwolf!', cls: 'red' }, { v: 0, label: '😇 unschuldig' }] }, tok); WW.claim(g, A.me, t, w === 1); tx = fill(pick(w === 1 ? TALK.claimWolf : TALK.claimGood), { t: nm(t) }); }
      bubble(A.me, tx, 3200); feed('<b>Du:</b> ' + esc(tx), 'me'); await wait(900, tok);
      // Reaktionen des Dorfs
      const bots = WW.shuffle(g.r, WW.alive(g).filter(p => p.bot)).slice(0, 2);
      for (const b of bots) {
        const s = g.sus[b.id][t], meS = g.sus[b.id][A.me];
        const r = b.id === t ? pick(TALK.back) : meS > 25 && Math.random() < .5 ? pick(TALK.back) : s > 8 ? fill(pick(TALK.agree), { t: nm(t) }) : fill(pick(TALK.disagree), { t: nm(t) });
        if (b.id === t || r === TALK.back[0] || r === TALK.back[1]) WW.accuse(g, b.id, A.me, .4);
        bubble(b.id, r, 3000); feed('<b>' + esc(b.name) + ':</b> ' + esc(r)); await wait(1000, tok);
      }
    }
  }
  async function hostDay(tok) {
    const g = A.G, humans = WW.alive(g).filter(p => !p.bot); let end = Date.now() + SET.time * 1000 * A.speed; const ready = new Set(); let go = false;
    humans.forEach(p => netAsk(p.id, { q: 'Diskutiert! Bereit zur Abstimmung?', opts: [{ v: 1, label: '✋ Bereit' }], def: 1 }, tok, 0).then(() => { ready.add(p.id); }).catch(() => { }));
    const tv = uiAsk({ q: 'Diskussion läuft …', opts: [{ v: 1, label: '⚖️ Abstimmung jetzt', cls: 'pri' }] }, tok).then(() => { go = true; }).catch(() => { });
    void tv;
    while (!go && Date.now() < end && ready.size < humans.length) {
      live(tok); const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); $('say').innerHTML = 'Diskutiert! ⏳ <span class="timer">' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + '</span> · Bereit: ' + ready.size + '/' + humans.length;
      if (left <= 10 && left > 0) S.sfx('tick'); await new Promise(r => setTimeout(r, A.paused ? 200 : 1000)); if (A.paused) end += 1000;
    }
    if (A.pend) { const p = A.pend; A.pend = null; drawAsk(); p.res(0); }
    H.asks.clear(); netAll({ t: 'clear' });
  }
  async function vote(tok) {
    const g = A.G; phase('vote'); S.sfx('drum'); await narr(pick(NARR.vote), tok);
    const votes = WW.botVotes(g), others = id => WW.aliveIds(g).filter(i => i !== id);
    const humans = WW.alive(g).filter(p => !p.bot);
    await Promise.all(humans.map(p => askPlayer(p.id, { q: '⚖️ Wen verbannst du aus dem Dorf?', targets: others(p.id), opts: [{ v: -1, label: 'Enthalten' }], def: -1 }, tok).then(v => { votes[p.id] = v; })));
    // Stimmen nacheinander zeigen
    A.tags = {};
    for (const k of WW.shuffle(g.r, Object.keys(votes))) { const v = votes[k]; if (v < 0) { feed('<b>' + esc(nm(+k)) + '</b> enthält sich.'); continue; } A.tags[v] = (A.tags[v] || 0) + 1; ring(); feed('<b>' + esc(nm(+k)) + '</b> ➜ ' + esc(nm(v))); S.sfx('tick'); await wait(380, tok); }
    if (A.me >= 0 && votes[A.me] >= 0 && g.p[votes[A.me]].role === 'wolf') A.goodVotes++;
    const r = WW.resolveVote(g, votes); await wait(600, tok);
    if (r.out < 0) await narr(pick(NARR.tie), tok);
    else { S.sfx('death'); vib(120); A.tags = null; ring(); await narr(fill(pick(NARR.lynch), { n: nm(r.out), r: artN(r.out) }), tok); feed('⚖️ <b>' + esc(nm(r.out)) + '</b> wurde verbannt – ' + esc(roleN(r.out)) + '.', 'sys'); if (g.p[r.out].role === 'wolf') S.sfx('reveal'); }
    if (r.hunter >= 0) await hunter(r.hunter, tok);
    A.tags = null;
  }
  async function finale(tok) {
    const g = A.G; phase('over'); const win = g.over;
    S.sfx(A.me < 0 || R[g.p[A.me].role].team === win ? 'win' : 'lose');
    await narr(win === 'village' ? NARR.winVillage : NARR.winWolf, tok);
    let pts = 0, kick = A.mode === 'solo' ? 'Solo · ' + g.n + ' Dorfbewohner' : '🌐 Online & Handys', title = win === 'village' ? '☀️ Das Dorf gewinnt!' : '🐺 Die Werwölfe gewinnen!', sub = '';
    if (A.mode === 'solo') {
      const me = g.p[A.me], won = R[me.role].team === win;
      pts = (won ? (me.role === 'wolf' ? 150 : 100) : 0) + (me.alive ? 30 : 0) + A.goodVotes * 15;
      ST.games++; if (won) ST.wins++; if (me.role === 'wolf') { ST.asWolf++; if (won) ST.wolfWins++; } if (me.alive) ST.survived++; ST.wolvesCaught += A.goodVotes; ST.pts += pts; saveSt();
      sub = (won ? '🏆 Du hast gewonnen' : 'Du hast verloren') + ' – als ' + R[me.role].n + '. +' + pts + ' Punkte (gesamt ' + ST.pts + ').';
    } else netAll({ t: 'over', win, roles: g.p.map(p => [p.name, p.role, p.alive]) });
    $('endBody').innerHTML = `<p class="hint" style="text-align:center">${esc(kick)}</p><h2 class="endTitle">${title}</h2><p style="text-align:center">${esc(sub)}</p>
      <div class="reveal">${g.p.map(p => `<div class="${p.alive ? '' : 'dead'}"><span class="sil">${SC.figure(p.look, { color: p.role === 'wolf' ? '#ff8a7a' : '#fff4cf' })}</span><b class="${p.role === 'wolf' ? 'w' : ''}">${R[p.role].icon} ${esc(R[p.role].n)}</b>${esc(p.name)}${p.alive ? '' : ' ✝'}</div>`).join('')}</div>`;
    openOv('ovEnd');
  }
  function showMyRole() {
    const g = A.G, me = g.p[A.me], r = R[me.role], mates = me.role === 'wolf' ? g.p.filter(p => p.role === 'wolf' && p.id !== A.me).map(p => p.name) : [];
    $('roleBody').innerHTML = `<div class="bigRole"><p class="hint">Deine geheime Rolle</p><i>${r.icon}</i><b>${r.n}</b><p>${esc(r.desc)}</p>${mates.length ? '<p>🐺 Dein Rudel: <b>' + esc(mates.join(', ')) + '</b></p>' : ''}<p class="hint">Team: ${r.team === 'wolf' ? 'Werwölfe' : 'Dorf'}</p></div>`;
    openOv('ovRole');
  }
  $('roleX').onclick = () => closeOv('ovRole'); $('myRole').onclick = () => showMyRole();
  function stopGame() { A.run++; cancelAsk(); V.stop(); S.ambience(''); A.G = null; }
  function pause() { if (cur !== 'sGame') return; A.paused = true; openOv('ovPause'); }
  function resume() { A.paused = false; closeOv('ovPause'); }
  $('bPause').onclick = pause; $('pGo').onclick = resume;
  $('pRoles').onclick = () => { rolesOv(); openOv('ovRoles'); }; $('pOpts').onclick = () => openOv('ovOpts');
  $('pQuit').onclick = () => { if (A.mode === 'host') netAll({ t: 'info', text: 'Der Spielleiter hat das Spiel beendet.' }); stopGame(); A.paused = false; toMenu(); };
  $('eAgain').onclick = () => { S.sfx('ok'); closeOv('ovEnd'); if (A.mode === 'solo') startSolo(); else hostStart(); };
  $('eMenu').onclick = () => { stopGame(); if (A.mode === 'host') { netAll({ t: 'info', text: 'Danke fürs Spielen!' }); } toMenu(); };

  /* ---------- Solo ---------- */
  const SIZES = [6, 7, 8, 9, 10], SROLES = [['random', '🎲 Zufall'], ['wolf', '🐺 Werwolf'], ['seer', '🔮 Seherin'], ['witch', '🧪 Hexe'], ['hunter', '🏹 Jäger'], ['villager', '🧑‍🌾 Dorf']];
  function soloSetup() {
    $('soName').value = SET.name || '';
    const draw = () => {
      $('soSize').innerHTML = SIZES.map(n => `<button class="nav${SET.size === n ? ' on' : ''}" data-n="${n}">${n}</button>`).join('');
      $('soRole').innerHTML = SROLES.map(([k, l]) => `<button class="nav${SET.role === k ? ' on' : ''}" data-r="${k}">${l}</button>`).join('');
      const d = WW.deal(SET.size), c = k => d.filter(x => x === k).length;
      $('soInfo').textContent = SET.size + ' Personen: ' + c('wolf') + ' Werwolf/Werwölfe, Seherin' + (c('witch') ? ', Hexe' : '') + (c('hunter') ? ', Jäger' : '') + (c('guard') ? ', Leibwächter' : '') + ', ' + c('villager') + ' Dorfbewohner.';
      $('soSize').querySelectorAll('[data-n]').forEach(b => { b.onclick = () => { SET.size = +b.dataset.n; if (SET.role === 'hunter' && SET.size < 7) SET.size = 7; saveSet(); S.sfx('move'); draw(); }; });
      $('soRole').querySelectorAll('[data-r]').forEach(b => { b.onclick = () => { SET.role = b.dataset.r; if (SET.role === 'hunter' && SET.size < 7) SET.size = 7; saveSet(); S.sfx('move'); draw(); }; });
    };
    draw(); scr('sSolo');
  }
  $('soBack').onclick = () => toMenu();
  $('soGo').onclick = () => { SET.name = ($('soName').value || '').trim().slice(0, 14); saveSet(); S.unlock(); S.sfx('ok'); startSolo(); };
  function startSolo() {
    stopGame(); A.mode = 'solo'; A.me = 0; A.goodVotes = 0; A.seenMe = {}; A.bubbles = {};
    const names = WW.shuffle(Math.random, NAMES.filter(n => n !== SET.name)).slice(0, SET.size - 1);
    const players = [{ name: SET.name || 'Du', bot: false, look: (LS.get(P + 'look', 0) || 0) }].concat(names.map(n => ({ name: n, bot: true, look: Math.floor(Math.random() * 1e5) })));
    A.G = WW.newGame(players, { seed: (Math.random() * 2 ** 31) >>> 0, force: SET.role !== 'random' ? { 0: SET.role } : null });
    closeAll(); $('feed').innerHTML = ''; $('ask').innerHTML = ''; scr('sGame'); play();
  }

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'wwnacht-';
    const N = { role: '', code: '', peer: null, conns: new Map() }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    N.host = async function () {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null;
  function netClose() { if (NET) NET.close(); NET = null; }

  /* ---------- Fernseher (Gastgeber) ---------- */
  const H = { seats: [], asks: new Map(), askN: 0 };   // seats: { name, peer, tok, bot, look }
  const BOTS = () => H.seats.filter(s => s.bot).length;
  async function hostOpen() {
    stopGame(); A.mode = 'host'; A.me = -1; H.seats = []; scr('sLobby'); lobby();
    $('lobbyMsg').textContent = 'Raum wird eröffnet …'; netClose();
    NET = mkNet({ onMsg: hostMsg, onLeave: peer => { const s = H.seats.find(x => x.peer === peer); if (s) { s.on = false; lobby(); if (A.G) toast('📴 ' + s.name + ' hat die Verbindung verloren'); } } });
    try {
      await NET.host(); $('code').textContent = NET.code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Scannt den QR-Code oder öffnet den Link – von überall!';
      try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = NET.code; }
    } catch (e) { $('lobbyMsg').textContent = netErr(e); }
  }
  function lobby() {
    $('lobbyList').innerHTML = H.seats.map(s => `<div class="lp"><div class="sil">${SC.figure(s.look, { color: '#fff4cf' })}</div>${esc(s.name)}<small>${s.bot ? '🤖 Computer' : s.on === false ? '📴 getrennt' : '📱 Handy'}</small></div>`).join('') || '<p class="hint">Noch niemand da …</p>';
    const n = H.seats.length; $('lbGo').disabled = n < 5 || n > 12 || !H.seats.some(s => !s.bot);
    $('lbGo').textContent = n < 5 ? '🌙 Mindestens 5 (noch ' + (5 - n) + ')' : '🌙 Spiel starten (' + n + ')';
    $('lbTime').innerHTML = [60, 120, 180].map(t => `<button class="nav${SET.time === t ? ' on' : ''}" data-t="${t}">⏳ ${t / 60} Min</button>`).join('');
    $('lbTime').querySelectorAll('[data-t]').forEach(b => { b.onclick = () => { SET.time = +b.dataset.t; saveSet(); lobby(); }; });
  }
  $('lbBot').onclick = () => { if (H.seats.length >= 12) return; const used = H.seats.map(s => s.name); H.seats.push({ name: pick(NAMES.filter(n => !used.includes(n))), bot: true, look: Math.floor(Math.random() * 1e5) }); S.sfx('ok'); lobby(); };
  $('lbBotX').onclick = () => { for (let i = H.seats.length - 1; i >= 0; i--) if (H.seats[i].bot) { H.seats.splice(i, 1); break; } lobby(); };
  $('lbBack').onclick = () => { netClose(); toMenu(); };
  $('lbGo').onclick = () => { S.unlock(); S.sfx('ok'); hostStart(); };
  function hostMsg(peer, d) {
    if (d.t === 'hello') {
      let s = H.seats.find(x => x.tok && x.tok === d.tok);
      if (s) { s.peer = peer; s.on = true; }
      else { if (A.G || H.seats.length >= 12) { NET.sendTo(peer, { t: 'info', text: A.G ? 'Das Spiel läuft schon – warte auf die nächste Runde.' : 'Das Dorf ist voll.' }); return; } s = { name: String(d.name || 'Gast').slice(0, 14), peer, tok: d.tok, bot: false, look: Math.floor(Math.random() * 1e5), on: true }; H.seats.push(s); S.sfx('ok'); }
      NET.sendTo(peer, { t: 'welcome', name: s.name }); lobby();
      if (A.G) { const pid = H.seats.indexOf(s); sendRole(pid); for (const [, q] of H.asks) if (q.pid === pid) NET.sendTo(peer, { t: 'ask', id: q.id, q: q.q, opts: q.opts }); }
      return;
    }
    if (d.t === 'ans') { const q = H.asks.get(d.id); if (q && H.seats[q.pid] && H.seats[q.pid].peer === peer) { H.asks.delete(d.id); clearTimeout(q.tm); q.res(+d.v); } }
  }
  const netTo = (pid, msg) => { const s = H.seats[pid]; if (NET && s && s.peer && !s.bot) NET.sendTo(s.peer, msg); };
  const netAll = msg => { if (NET && A.mode === 'host') H.seats.forEach((s, i) => { if (!s.bot) netTo(i, msg); }); };
  function netAsk(pid, spec, tok, timeout) {
    live(tok);
    const id = ++H.askN, opts = (spec.targets || []).map(t => ({ v: t, label: nm(t) })).concat(spec.opts || []);
    return new Promise((res, rej) => {
      const q = { id, pid, q: spec.q, opts, res, rej, tok };
      if (timeout !== 0) q.tm = setTimeout(() => { if (H.asks.has(id)) { H.asks.delete(id); netTo(pid, { t: 'clear' }); res(spec.def); } }, (timeout || 75000) * A.speed);
      H.asks.set(id, q); netTo(pid, { t: 'ask', id, q: spec.q, opts });
    });
  }
  function sendRole(pid) { const g = A.G, p = g.p[pid], mates = p.role === 'wolf' ? g.p.filter(x => x.role === 'wolf' && x.id !== pid).map(x => x.name) : []; netTo(pid, { t: 'role', role: p.role, name: p.name, mates, alive: p.alive }); }
  function roleCards() { A.G.p.forEach(p => { if (!p.bot) sendRole(p.id); }); }
  function hostStart() {
    stopGame(); A.mode = 'host'; A.me = -1; A.seenMe = {}; A.bubbles = {}; H.asks.clear();
    A.G = WW.newGame(H.seats.map(s => ({ name: s.name, bot: s.bot, look: s.look })), { seed: (Math.random() * 2 ** 31) >>> 0 });
    closeAll(); $('feed').innerHTML = ''; $('ask').innerHTML = ''; scr('sGame'); play();
  }

  /* ---------- Handy (Mitspieler) ---------- */
  const C = { tok: '', role: null };
  try { C.tok = sessionStorage.getItem(P + 'tok') || Math.random().toString(36).slice(2, 10); sessionStorage.setItem(P + 'tok', C.tok); } catch (e) { C.tok = Math.random().toString(36).slice(2, 10); }
  function phoneOpen(code) { stopGame(); A.mode = 'phone'; $('jName').value = SET.name || ''; if (code) $('jCode').value = code; $('pJoin').hidden = false; $('pPlay').hidden = true; $('jMsg').textContent = ''; sky('night'); scr('sPhone'); }
  async function phoneJoin() {
    const name = ($('jName').value || '').trim().slice(0, 14); if (!name) { $('jMsg').textContent = 'Bitte gib deinen Namen ein.'; return; }
    SET.name = name; saveSet(); $('jMsg').textContent = 'Verbinde …'; netClose();
    NET = mkNet({ onMsg: (pe, d) => phoneMsg(d), onLeave: () => { $('pInfo').textContent = '📴 Verbindung getrennt – lade die Seite neu, um wieder beizutreten.'; } });
    try { await NET.join($('jCode').value); NET.send({ t: 'hello', name, tok: C.tok }); $('pJoin').hidden = true; $('pPlay').hidden = false; $('pName').textContent = name; $('pInfo').textContent = 'Du bist im Dorf! Warte auf den Spielbeginn …'; keepAwake(); }
    catch (e) { $('jMsg').textContent = netErr(e); }
  }
  $('jGo').onclick = () => { S.unlock(); phoneJoin(); };
  $('jBack').onclick = () => { netClose(); toMenu(); };
  function phoneMsg(d) {
    if (d.t === 'welcome') $('pName').textContent = d.name;
    else if (d.t === 'role') { C.role = d; const r = R[d.role]; $('pRole').innerHTML = `<i>${r.icon}</i><b>${r.n}</b><small>${esc(r.desc)}</small>${d.mates.length ? '<small>🐺 Rudel: ' + esc(d.mates.join(', ')) + '</small>' : ''}`; vib([60, 60, 60]); $('pInfo').textContent = d.alive ? 'Halte die Karte gedrückt, um deine Rolle heimlich zu sehen.' : '💀 Du bist ausgeschieden.'; }
    else if (d.t === 'info' || d.t === 'talk') { $('pInfo').textContent = d.text; }
    else if (d.t === 'phase') { sky(d.ph); }
    else if (d.t === 'secret') { $('pInfo').textContent = '🤫 ' + d.text; vib(80); S.sfx('magic'); }
    else if (d.t === 'ask') { const a = $('pAsk'); a.innerHTML = `<p class="q">${esc(d.q)}</p>` + d.opts.map(o => `<button class="btn nav${o.v === 1 && /Bereit|retten/.test(o.label) ? ' pri' : ''}" data-v="${o.v}">${esc(o.label)}</button>`).join(''); vib(40); S.sfx('ok');
      a.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => { NET.send({ t: 'ans', id: d.id, v: +b.dataset.v }); a.innerHTML = '<p class="hint">✔ ' + esc(b.textContent) + '</p>'; S.sfx('ok'); }; }); setTimeout(focusFirst, 0); }
    else if (d.t === 'clear') $('pAsk').innerHTML = '';
    else if (d.t === 'over') { const me = C.role && R[C.role.role]; $('pAsk').innerHTML = ''; $('pInfo').textContent = (d.win === 'village' ? '☀️ Das Dorf gewinnt!' : '🐺 Die Werwölfe gewinnen!') + (me ? (me.team === d.win ? ' 🏆 Du hast gewonnen!' : ' Du hast verloren.') : ''); S.sfx(me && me.team === d.win ? 'win' : 'lose'); }
  }
  // Rollenkarte: gedrückt halten zeigt die Rolle
  const card = $('pCard');
  const showCard = on => { card.classList.toggle('show', on && !!C.role); };
  card.addEventListener('pointerdown', e => { e.preventDefault(); showCard(true); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => card.addEventListener(t, () => showCard(false)));
  card.addEventListener('keydown', e => { if (e.code === 'Enter' || e.code === 'Space') showCard(true); });
  card.addEventListener('keyup', () => showCard(false));
  let wake = null; function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }

  /* ---------- Menü ---------- */
  function toMenu() { closeAll(); A.mode = ''; sky('night', { wolfEyes: 2 }); scr('sMenu'); S.ambience(SET.amb ? 'night' : ''); $('menuStat').innerHTML = '🏆 ' + ST.pts + ' Punkte<br>' + ST.wins + ' Siege in ' + ST.games + ' Spielen'; }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); V.speak('Willkommen in der Werwolf-Nacht.'); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; pressStart(); });
  function rolesOv() { $('rolesList').innerHTML = Object.keys(R).map(k => `<div><b>${R[k].icon} ${R[k].n}</b> <small class="hint">${R[k].team === 'wolf' ? 'Team Werwölfe' : 'Team Dorf'}</small><p>${esc(R[k].desc)}</p></div>`).join(''); }
  function recOv() { const c = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`; $('recList').innerHTML = c('🏆 Punkte', ST.pts) + c('Siege', ST.wins + ' / ' + ST.games) + c('🐺 Als Werwolf', ST.wolfWins + ' / ' + ST.asWolf) + c('❤️ Überlebt', ST.survived) + c('⚖️ Werwölfe entlarvt', ST.wolvesCaught); }
  document.querySelectorAll('#tiles [data-go]').forEach(t => { t.onclick = () => {
    S.unlock(); S.sfx('ok'); const g = t.dataset.go;
    if (g === 'solo') soloSetup(); else if (g === 'host') hostOpen(); else if (g === 'join') phoneOpen('');
    else if (g === 'roles') { rolesOv(); openOv('ovRoles'); } else if (g === 'rec') { recOv(); openOv('ovRec'); } else if (g === 'opts') openOv('ovOpts');
  }; });
  $('rolesX').onclick = () => closeOv('ovRoles'); $('recX').onclick = () => closeOv('ovRec'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { oVoice: 'voice', oSound: 'sound', oAmb: 'amb', oFast: 'fast', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); applySet(); if (id === 'oAmb') S.ambience(SET.amb && A.phase ? (A.phase === 'night' ? 'night' : 'day') : ''); }; }

  /* ---------- Tastatur & Controller ---------- */
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape') { e.preventDefault(); back(); return; }
    if (e.target && e.target.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(c)) { if (c === 'Enter') { if (e.target.id === 'jCode' || e.target.id === 'jName') phoneJoin(); } return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  const PAD = { b: [], dir: null }; let padT = 0, last = performance.now();
  (function poll(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const gp = list.find(p => p && p.connected);
    if (gp) {
      const ax = gp.axes || [], bt = gp.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5)), now2 = []; for (let k = 0; k < 17; k++) now2[k] = pr(k); const down = k => now2[k] && !PAD.b[k];
      let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0; if (now2[14]) x = -1; if (now2[15]) x = 1; if (now2[12]) z = -1; if (now2[13]) z = 1;
      const dd = x || z ? (Math.abs(x) >= Math.abs(z) ? [x, 0] : [0, z]) : null, key = dd ? dd.join() : null;
      document.body.classList.add('kbd');
      if (dd && (key !== PAD.dir || padT <= 0)) { moveFocus(dd[0], dd[1]); padT = key !== PAD.dir ? .35 : .14; }
      PAD.dir = key;
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
      if (down(1)) back(); if (down(9)) { if (cur === 'sTitle') pressStart(); else if (cur === 'sGame') { if (A.paused) resume(); else pause(); } }
      PAD.b = now2; padT -= dt;
    }
    requestAnimationFrame(poll);
  })(last);
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  addEventListener('resize', () => { if (A.G && cur === 'sGame') ring(); });

  /* ---------- Laden ---------- */
  const TIPS = ['Der Mond geht auf …', 'Die Fenster werden verriegelt …', 'Irgendwo heult ein Wolf …', 'Das Lagerfeuer knistert …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.25); sky('night', { wolfEyes: 2 }); await new Promise(r => setTimeout(r, 80)); bar(.8);
    await new Promise(r => setTimeout(r, Math.max(0, 1000 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { phoneOpen(String(jc).toUpperCase().slice(0, 4)); return; }
    if (q.has('tv')) { hostOpen(); return; }
    if (q.get('mode') === 'solo') { startSolo(); return; }
    scr('sTitle');
  })();
  window.WWApp = { A, startSolo, hostOpen, hostStart, H, answer, tapPlayer, get cur() { return cur; }, ring };
})();
