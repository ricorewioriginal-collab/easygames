/* FALL·AKTE – App: Ladebildschirm, Titel, Konsolen-Menü, Welten mit je 3 Fällen, Tagesfall, Zufallsfall, Fall-Bildschirm
 * (Tatorte mit Lupe, Labor-Rätsel, Verhöre mit Fragenbudget, Notizbuch, Anklage), Ergebnis mit Beweisführung, Akte mit Rang.
 * Eingabe: Touch/Maus, Tastatur, Gamecontroller. Spielstand des laufenden Falls wird gespeichert (Weiter ermitteln). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'fall-akte-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
  const { WORLDS, ATTR, CLUES, EMPTY, RANKS } = FA_DATA, S = window.FASound, SC = window.FAScene;
  const SET = Object.assign({ sound: true, music: true, rain: true, vib: true }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  S.sfxOn = SET.sound; S.musicOn = SET.music; document.body.classList.toggle('still', !SET.rain || matchMedia('(prefers-reduced-motion: reduce)').matches);
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Fortschritt ---------- */
  const CASES = LS.get(P + 'cases', {}), ST = Object.assign({ solved: 0, failed: 0, extra: 0, perfect: 0, hints: 0 }, LS.get(P + 'stats', {}));
  const saveProg = () => { LS.set(P + 'cases', CASES); LS.set(P + 'stats', ST); const t = total(); if (t > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', t); };
  const total = () => Object.values(CASES).reduce((a, c) => a + (c.s || 0), 0) + ST.extra;
  const rank = () => { let r = RANKS[0][1], nx = null; for (const [p, n] of RANKS) { if (total() >= p) r = n; else { nx = [p, n]; break; } } return { r, nx }; };
  const solvedIn = w => [0, 1, 2].filter(k => CASES[w + '-' + k] && CASES[w + '-' + k].s > 0).length;
  const unlocked = w => w === 0 || solvedIn(w - 1) >= 2;

  /* ---------- Bildschirme ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sWorlds: () => toMenu() };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sCase' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  const closeAll = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovBrief') return $('briefGo').click(); if (ov.id === 'ovEnd') return $('eMenu').click(); if (ov.id === 'ovLab') return closeOv('ovLab'); if (ov.id === 'ovFind') return closeOv('ovFind'); const x = ov.querySelector('[data-close]'); if (x) return x.click(); return closeOv(ov.id); }
    if (cur === 'sCase') return openOv('ovPause');
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }
  function bgArt(w, li) { try { $('bgArt').innerHTML = SC.scene(WORLDS[w], li || 0).svg; } catch (e) { } document.documentElement.style.setProperty('--acc', WORLDS[w].acc); }

  /* ---------- Fall ---------- */
  const G = { mode: '', w: 0, k: 0, C: null, st: null, view: 'scene', loc: 0, looked: new Set(), seed: 0 };
  const W = () => WORLDS[G.C.world];
  const clueAt = (li, oi) => G.C.clues.find(c => c.loc === li && c.obj === oi);
  const clueById = id => G.C.clues.find(c => c.id === id);
  const susName = i => G.C.sus[i].name;
  function caseTitle() { return G.mode === 'camp' ? 'Fall ' + (G.k + 1) : G.mode === 'daily' ? 'Tagesfall ' + G.C.day.split('-').reverse().join('.') : 'Zufallsfall'; }
  function buildCase(mode, w, k, seed, n) {
    if (mode === 'camp') return FA.campaign(w, k);
    if (mode === 'daily') return FA.daily();
    return FA.makeCase({ world: w, seed, n });
  }
  function startCase(mode, w, k, opt) {
    opt = opt || {};
    G.mode = mode; G.w = w; G.k = k;
    if (mode === 'random' && !opt.seed) { G.seed = (Math.random() * 2 ** 31) >>> 0; G.n = 4 + (G.seed % 2); G.w = w = G.seed % WORLDS.length; } else { G.seed = opt.seed || 0; G.n = opt.n || 4; }
    G.C = buildCase(mode, w, k, G.seed, G.n); if (mode === 'daily') G.w = G.C.world;
    G.st = FA.newState(G.C); G.looked = new Set(); G.view = 'scene'; G.loc = 0; G.lastLoc = -1;
    if (opt.run) restore(opt.run);
    bgArt(G.C.world, 0); closeAll(); scr('sCase'); S.music('case'); render();
    if (!opt.run) brief(); save();
  }
  // laufenden Fall speichern / wiederherstellen
  function save() { if (!G.C || G.st.done) { LS.del(P + 'run'); return; } const s = G.st; LS.set(P + 'run', { mode: G.mode, w: G.w, k: G.k, seed: G.seed, n: G.n, day: G.C.day, found: [...s.found], solved: [...s.solved], known: s.known, left: s.left, asked: s.asked, hints: s.hints, wrong: s.wrong, looks: s.looks, looked: [...G.looked] }); }
  function restore(r) { const s = G.st; r.found.forEach(x => s.found.add(x)); r.solved.forEach(x => s.solved.add(x)); Object.assign(s.known, r.known); s.left = r.left; s.asked = r.asked; s.hints = r.hints; s.wrong = r.wrong; s.looks = r.looks; (r.looked || []).forEach(x => G.looked.add(x)); }
  function brief() {
    const C = G.C;
    $('briefBody').innerHTML = `<p class="mono" style="color:var(--g3)">${esc(W().n.toUpperCase())} · ${esc(caseTitle())}</p><h2>${esc(C.n === 3 ? 'Ein kniffliger Abend' : C.n === 4 ? 'Ein Fall für Profis' : 'Die harte Nuss')}</h2>
      <div class="brief">${esc(W().crime)}<br>Tatzeit: <b>${C.time} Uhr</b>. ${C.n} Personen waren im Haus – eine davon war es.</div>
      <p>📍 Schauplätze: ${W().locs.map(l => esc(l.n)).join(', ')}</p><p>🗣️ Du hast <b>${C.questions} Fragen</b> für die Verhöre. 🔍 Zu finden: <b>${C.clues.length} Spuren</b>.</p>`;
    openOv('ovBrief');
  }
  $('briefGo').onclick = () => { S.unlock(); S.sfx('type'); closeOv('ovBrief'); };

  /* ---------- Darstellung ---------- */
  function render() {
    const C = G.C, st = G.st;
    $('caseTtl').innerHTML = `<b>${esc(W().n)}</b>${esc(caseTitle())}`;
    $('chipQ').textContent = '🗣️ ' + st.left; $('chipC').textContent = '🔍 ' + st.found.size + '/' + C.clues.length;
    document.querySelectorAll('.tabs [data-v]').forEach(t => t.classList.toggle('on', t.dataset.v === G.view));
    $('vScene').hidden = G.view !== 'scene'; $('vSus').hidden = G.view !== 'sus'; $('vNotes').hidden = G.view !== 'notes';
    if (G.view === 'scene') renderScene(); else if (G.view === 'sus') renderSus(); else renderNotes();
  }
  function renderScene() {
    const Wd = W();
    $('locs').innerHTML = Wd.locs.map((L, i) => { const left = Wd.locs[i].objs.filter((_, oi) => !G.looked.has(i + '.' + oi)).length; return `<button class="tab nav${i === G.loc ? ' on' : ''}" data-l="${i}">${esc(L.n)}<span class="dot">${left}</span></button>`; }).join('');
    $('locs').querySelectorAll('[data-l]').forEach(b => { b.onclick = () => { G.loc = +b.dataset.l; S.sfx('paper'); renderScene(); }; });
    const sc = SC.scene(Wd, G.loc);
    $('stage').innerHTML = sc.svg + sc.spots.map(s => { const key = G.loc + '.' + s.i, cl = clueAt(G.loc, s.i), seen = G.looked.has(key); return `<button class="hs nav${seen ? ' done' : ''}${seen && cl ? ' clue' : ''}" data-o="${s.i}" style="left:${s.l}%;top:${s.t}%;width:${s.w}%;height:${s.h}%" aria-label="${esc(s.name)}" title="${esc(s.name)}"></button>`; }).join('') + '<div class="lupe" id="lupe"></div>';
    $('stage').querySelectorAll('.hs').forEach(b => { b.onclick = () => look(G.loc, +b.dataset.o, b); });
    const sw = $('stage').parentNode; if (sw.scrollWidth > sw.clientWidth + 4 && G.lastLoc !== G.loc) sw.scrollLeft = (sw.scrollWidth - sw.clientWidth) / 2; G.lastLoc = G.loc;
  }
  function look(li, oi, el) {
    const key = li + '.' + oi, first = !G.looked.has(key), cl = clueAt(li, oi), name = W().locs[li].objs[oi][4];
    if (first) { G.looked.add(key); G.st.looks++; }
    const lp = $('lupe'); if (lp && el) { lp.style.left = (el.offsetLeft + el.offsetWidth / 2) + 'px'; lp.style.top = (el.offsetTop + el.offsetHeight / 2) + 'px'; lp.classList.add('on'); setTimeout(() => lp.classList.remove('on'), 420); }
    S.sfx('look');
    setTimeout(() => {
      if (!cl) { toast('🔍 ' + name + ': ' + EMPTY[(li * 7 + oi * 3 + G.C.seed) % EMPTY.length]); renderScene(); save(); return; }
      const isNew = !G.st.found.has(cl.id); G.st.found.add(cl.id); if (isNew) { S.sfx('find'); vib(30); }
      showFind(cl, name); render(); save();
    }, 380);
  }
  function clueFind(cl) { const f = CLUES[cl.attr].find; return typeof f === 'function' ? f(cl.val) : f; }
  function clueText(cl) { return CLUES[cl.attr].text(cl.val, cl.attr === 'alibi' ? susName(cl.val) : ''); }
  const LABN = { shoe: '👣 Fußspur vermessen', print: '🖐️ Fingerabdruck vergleichen', cipher: '🔐 Code knacken', letter: '🧩 Brief zusammensetzen' };
  function showFind(cl, where) {
    const solved = !cl.lab || G.st.solved.has(cl.id);
    $('findBody').innerHTML = `<p class="mono" style="color:var(--g3)">FUNDSTÜCK · ${esc(where || '')}</p><div class="found"><span class="big">${CLUES[cl.attr].icon}</span><div><h2>${esc(clueFind(cl))}</h2><p>${solved ? esc(clueText(cl)) : 'Das muss ins Labor, bevor du mehr weißt.'}</p></div></div>`;
    $('findBtns').innerHTML = solved ? '<button class="btn pri nav" id="fOk">Notiert</button>' : `<button class="btn pri nav" id="fLab">${LABN[cl.lab]}</button><button class="btn dark nav" id="fLater">Später</button>`;
    if (solved) $('fOk').onclick = () => { S.sfx('type'); closeOv('ovFind'); };
    else { $('fLab').onclick = () => { closeOv('ovFind'); lab(cl); }; $('fLater').onclick = () => closeOv('ovFind'); }
    openOv('ovFind');
  }

  /* ---------- Labor ---------- */
  const L = { cl: null, v: 0, sel: -1, ord: null, rot: null };
  function lab(cl) {
    L.cl = cl; L.sel = -1;
    if (cl.lab === 'shoe') L.v = cl.start;
    if (cl.lab === 'cipher') L.v = 0;
    if (cl.lab === 'letter') { L.ord = cl.order.slice(); L.rot = cl.rot.slice(); }
    S.sfx('paper'); labRender(); openOv('ovLab');
  }
  function labDone() {
    const cl = L.cl; G.st.solved.add(cl.id); S.sfx('solve'); vib([20, 40, 20]); closeOv('ovLab');
    toast('🧪 ' + clueText(cl), 3600); render(); save();
  }
  function labMiss(m) { G.st.looks += 1; S.sfx('wrong'); vib(60); toast(m); }
  function labRender() {
    const cl = L.cl, b = $('labBody');
    if (cl.lab === 'shoe') {
      b.innerHTML = `<h2>👣 Fußspur vermessen</h2><p class="hint">Stell die gestrichelte Messschablone so ein, dass sie genau auf den Abdruck passt.</p><div class="labArt">${SC.footprint(cl.val, L.v)}</div>
        <div class="dial"><button class="btn nav" id="lMinus">−</button><b>Gr. ${L.v}</b><button class="btn nav" id="lPlus">+</button></div><div class="row"><button class="btn dark nav" id="lX">Abbrechen</button><button class="btn pri nav" id="lOk">Passt genau!</button></div>`;
      $('lMinus').onclick = () => { L.v = Math.max(34, L.v - 1); S.sfx('move'); labRender(); $('lMinus').focus(); };
      $('lPlus').onclick = () => { L.v = Math.min(48, L.v + 1); S.sfx('move'); labRender(); $('lPlus').focus(); };
      $('lOk').onclick = () => L.v === cl.val ? labDone() : labMiss(L.v > cl.val ? 'Die Schablone ist noch zu groß.' : 'Die Schablone ist noch zu klein.');
    } else if (cl.lab === 'print') {
      const opts = [cl.val, ...cl.decoys].sort((a, b) => ((FA.hash(a + cl.id) % 7) - (FA.hash(b + cl.id) % 7)) || a.localeCompare(b));
      b.innerHTML = `<h2>🖐️ Fingerabdruck vergleichen</h2><p class="hint">Der Abdruck ist verwischt. Welches Grundmuster hat er?</p><div class="labArt fp">${SC.fingerprint(cl.val, cl.id.length + G.C.seed % 97, true)}</div>
        <div class="prints">${opts.map(o => `<button class="btn nav" data-p="${o}">${SC.fingerprint(o, 3, false)}<span>${o}</span></button>`).join('')}</div><div class="row"><button class="btn dark nav" id="lX">Abbrechen</button></div>`;
      b.querySelectorAll('[data-p]').forEach(x => { x.onclick = () => x.dataset.p === cl.val ? labDone() : labMiss('Das Muster passt nicht – schau dir die Linien in der Mitte genau an.'); });
    } else if (cl.lab === 'cipher') {
      const enc = FA.caesar(cl.msg, cl.shift), dec = FA.caesar(enc, -L.v);
      b.innerHTML = `<h2>🔐 Geheimcode knacken</h2><p class="hint">Jeder Buchstabe ist um dieselbe Zahl im Alphabet verschoben. Dreh das Code-Rad, bis ein Satz entsteht.</p><div class="code">${enc}</div>
        <div class="dial"><button class="btn nav" id="lMinus">◀</button><b>${String(L.v).padStart(2, '0')}</b><button class="btn nav" id="lPlus">▶</button></div><div class="code plain">${dec}</div>
        <div class="row"><button class="btn dark nav" id="lX">Abbrechen</button><button class="btn pri nav" id="lOk">Das ergibt Sinn!</button></div>`;
      $('lMinus').onclick = () => { L.v = (L.v + 25) % 26; S.sfx('move'); labRender(); $('lMinus').focus(); };
      $('lPlus').onclick = () => { L.v = (L.v + 1) % 26; S.sfx('move'); labRender(); $('lPlus').focus(); };
      $('lOk').onclick = () => L.v === cl.shift ? labDone() : labMiss('Das ist noch Kauderwelsch.');
    } else if (cl.lab === 'letter') {
      const who = susName(cl.val), signer = G.C.sus.find(s => s.i !== cl.val && s.i !== G.C.culprit) || G.C.sus.find(s => s.i !== cl.val);
      const lines = ['Bestätigung:', who.slice(0, 22), 'war um ' + G.C.time + ' Uhr', 'bei mir. ' + FA.initialOf(signer.name) + '.'];
      b.innerHTML = `<h2>🧩 Zerrissener Brief</h2><p class="hint">Tippe ein Teil an und dann ein zweites, um sie zu tauschen. ⟳ dreht das gewählte Teil.</p>
        <div class="puzzle">${L.ord.map((p, pos) => `<button class="nav${L.sel === pos ? ' sel' : ''}" data-q="${pos}" aria-label="Teil ${pos + 1}"><span style="display:block;transform:rotate(${L.rot[p] * 90}deg)">${SC.letterPiece(lines, p)}</span></button>`).join('')}</div>
        <div class="row"><button class="btn dark nav" id="lX">Abbrechen</button><button class="btn pri nav" id="lRot"${L.sel < 0 ? ' disabled' : ''}>⟳ Drehen</button></div>`;
      const check = pos => { const ok = L.ord.every((p, i) => p === i) && L.rot.every(r => r % 4 === 0); labRender(); const f = $('labBody').querySelector(pos === 'rot' ? '#lRot' : '[data-q="' + pos + '"]'); if (f && !f.disabled) f.focus(); if (ok) setTimeout(labDone, 450); };
      $('lRot').onclick = () => { if (L.sel < 0) return; const p = L.ord[L.sel]; L.rot[p] = (L.rot[p] + 1) % 4; S.sfx('paper'); check('rot'); };
      b.querySelectorAll('[data-q]').forEach(x => { x.onclick = () => {
        const pos = +x.dataset.q;
        if (L.sel === pos) { L.sel = -1; S.sfx('back'); }
        else if (L.sel >= 0) { [L.ord[L.sel], L.ord[pos]] = [L.ord[pos], L.ord[L.sel]]; L.sel = pos; S.sfx('paper'); }
        else { L.sel = pos; S.sfx('move'); }
        check(pos);
      }; });
    }
    $('lX').onclick = () => closeOv('ovLab');
  }

  /* ---------- Verdächtige & Verhör ---------- */
  function tags(s, v) {
    const st = G.st, out = [`<span class="tag">Haare: ${s.hair}</span>`, `<span class="tag">Brille: ${s.glasses}</span>`];
    for (const a of FA.ASK) { const k = st.known[s.i + ':' + a]; if (k !== undefined) out.push(`<span class="tag">${ATTR[a].n}: ${k}</span>`); }
    return out.join('') + (v.s === 'out' ? '<span class="stamp">ENTLASTET</span>' : '');
  }
  function renderSus() {
    const v = FA.verdict(G.C, G.st);
    $('cards').innerHTML = G.C.sus.map(s => `<button class="sus nav${v[s.i].s === 'out' ? ' out' : ''}" data-s="${s.i}"><div class="ph">${SC.portrait(s, W().acc)}</div><b>${esc(s.name)}</b><small>${esc(s.role)}</small><div class="tags">${tags(s, v[s.i])}</div></button>`).join('');
    $('cards').querySelectorAll('[data-s]').forEach(b => { b.onclick = () => interro(+b.dataset.s); });
  }
  const ANS = {
    shoe: (v) => '„Größe ' + v + '. Warum fragen Sie?“',
    hand: (v, s) => v === 'links' ? '„Ich bin ' + (s.sex === 'f' ? 'Linkshänderin' : 'Linkshänder') + '.“' : '„Mit rechts, wie die meisten.“',
    smoke: v => v === 'ja' ? '„Ja … ab und zu eine.“' : '„Rauchen? Niemals!“',
    print: v => '„Bitte sehr.“ – Muster: ' + v
  };
  function interro(i) {
    const s = G.C.sus[i], st = G.st, v = FA.verdict(G.C, st)[i];
    $('susBody').innerHTML = `<div class="interro"><div class="ph">${SC.portrait(s, W().acc)}</div><div><h2 style="margin-bottom:0">${esc(s.name)}</h2><p class="mono" style="color:var(--g3);margin-top:2px">${esc(s.role)}${v.s === 'out' ? ' · <b style="color:var(--red)">ENTLASTET</b>' : ''}</p>
      <div class="say">„Um ${G.C.time} Uhr? Ich ${esc(s.alibi.replace(/^hat /, 'habe '))}. Fragen Sie ruhig nach!“</div>
      <p class="mono">Haare: <b>${s.hair}</b> · Brille: <b>${s.glasses}</b> · Initiale: <b>${s.initial}</b></p></div></div>
      <h3>Fragen <small class="mono">(noch ${st.left})</small></h3><div class="qa">${FA.ASK.map(a => { const k = st.known[i + ':' + a]; return `<button class="btn nav" data-a="${a}"${k === undefined && st.left <= 0 ? ' disabled' : ''}><span>${esc(CLUES[a].ask)}</span>${k !== undefined ? '<em>' + esc(ANS[a](k, s)) + '</em>' : '<em>?</em>'}</button>`; }).join('')}</div>`;
    $('susBody').querySelectorAll('[data-a]').forEach(b => { b.onclick = () => {
      const a = b.dataset.a; if (st.known[i + ':' + a] !== undefined) return;
      if (st.left <= 0) return toast('Keine Fragen mehr übrig – jetzt heißt es kombinieren!');
      FA.ask(G.C, st, i, a); S.sfx('ask'); render(); save(); interro(i); const n = $('susBody').querySelector('[data-a="' + a + '"]'); if (n) n.focus();
      if (FA.verdict(G.C, st)[i].s === 'out' && v.s !== 'out') setTimeout(() => toast('✖ ' + s.name + ' passt nicht zu den Spuren – entlastet!'), 300);
    }; });
    openOv('ovSus');
  }
  $('susX').onclick = () => { closeOv('ovSus'); if (G.view === 'sus') renderSus(); };

  /* ---------- Notizbuch ---------- */
  function renderNotes() {
    const C = G.C, st = G.st, v = FA.verdict(C, st);
    const done = C.clues.filter(c => st.found.has(c.id) && (!c.lab || st.solved.has(c.id)));
    const cols = done.filter(c => c.attr !== 'alibi');
    let h = `<h3>📓 Notizen – Tatzeit ${C.time} Uhr</h3>`;
    h += `<table><tr><th>Person</th>${cols.map(c => `<th>${ATTR[c.attr].n}<br><b>${esc(c.val)}</b></th>`).join('')}<th>Stand</th></tr>`;
    for (const s of C.sus) {
      h += `<tr class="${v[s.i].s === 'out' ? 'out' : ''}"><td>${esc(s.name)}</td>`;
      for (const c of cols) { const k = ['hair', 'glasses'].includes(c.attr) ? s[c.attr] : st.known[s.i + ':' + c.attr]; h += k === undefined ? '<td>?</td>' : `<td class="${k === c.val ? 'y' : 'x'}">${k === c.val ? '✓' : '✗'} ${esc(k)}</td>`; }
      h += `<td>${v[s.i].s === 'out' ? '✗ raus' : v[s.i].s === 'ok' ? '<b>passt!</b>' : 'offen'}</td></tr>`;
    }
    h += '</table><h3>Spuren</h3><ul>';
    C.clues.forEach(c => { if (!st.found.has(c.id)) return; h += c.lab && !st.solved.has(c.id) ? `<li class="lab">${CLUES[c.attr].icon} ${esc(clueFind(c))} – <button class="btn nav" data-lab="${c.id}" style="min-height:30px;padding:2px 8px">${LABN[c.lab]}</button></li>` : `<li>${CLUES[c.attr].icon} ${esc(clueText(c))}</li>`; });
    if (st.found.size < C.clues.length) h += `<li class="hint">… noch ${C.clues.length - st.found.size} Spur(en) unentdeckt.</li>`;
    const left = v.filter(x => x.s !== 'out').length;
    h += `</ul><p>${left === 1 ? '⚖️ Nur noch eine Person passt – Zeit für die Anklage!' : left + ' Personen kommen noch in Frage.'}</p>`;
    $('notes').innerHTML = h;
    $('notes').querySelectorAll('[data-lab]').forEach(b => { b.onclick = () => lab(clueById(b.dataset.lab)); });
  }

  /* ---------- Anklage & Ergebnis ---------- */
  let accSel = -1;
  function openAccuse() {
    accSel = -1; $('accGo').disabled = true; const v = FA.verdict(G.C, G.st);
    $('accHint').textContent = 'Wer ist der Täter? Noch ' + (3 - G.st.wrong) + ' Versuch(e). Eine falsche Anklage kostet Punkte.';
    $('accPick').innerHTML = G.C.sus.map(s => `<button class="sus nav${v[s.i].s === 'out' ? ' out' : ''}" data-s="${s.i}"><div class="ph">${SC.portrait(s, W().acc)}</div><b>${esc(s.name)}</b>${v[s.i].s === 'out' ? '<span class="stamp">ENTLASTET</span>' : ''}</button>`).join('');
    $('accPick').querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { accSel = +b.dataset.s; $('accPick').querySelectorAll('.sus').forEach(x => x.classList.toggle('sel', x === b)); $('accGo').disabled = false; S.sfx('move'); }; });
    openOv('ovAccuse');
  }
  $('bAccuse').onclick = openAccuse; $('accX').onclick = () => closeOv('ovAccuse');
  $('accGo').onclick = () => {
    if (accSel < 0) return; const r = FA.accuse(G.C, G.st, accSel); closeOv('ovAccuse');
    if (r) { S.sfx('sting'); setTimeout(() => S.sfx('solve'), 500); vib([60, 60, 120]); finish(); }
    else { S.sfx('wrong'); vib(200); save(); if (G.st.done) finish(); else toast('✖ ' + susName(accSel) + ' war es nicht! Noch ' + (3 - G.st.wrong) + ' Versuch(e).', 3200); render(); }
  };
  function finish() {
    const C = G.C, st = G.st, ok = st.ok, sc = FA.score(C, st), stars = FA.stars(st), cu = C.sus[C.culprit];
    const before = rank().r;
    if (ok) {
      ST.solved++; ST.hints += st.hints; if (stars === 3) ST.perfect++;
      if (G.mode === 'camp') { const key = G.w + '-' + G.k, o = CASES[key] || { s: 0, st: 0 }; CASES[key] = { s: Math.max(o.s, sc), st: Math.max(o.st, stars) }; }
      else if (G.mode === 'daily') { const d = LS.get(P + 'daily', {}); if (d.key !== C.day) { ST.extra += sc; LS.set(P + 'daily', { key: C.day, score: sc, stars }); } }
      else ST.extra += sc;
    } else ST.failed++;
    saveProg(); LS.del(P + 'run');
    const after = rank().r, up = after !== before;
    const proof = C.clues.map(c => `<li>${CLUES[c.attr].icon} ${esc(clueText(c))} → ${c.attr === 'alibi' ? esc(susName(c.val)) + ' entlastet' : 'schließt aus: ' + c.elim.map(i => esc(susName(i))).join(', ')}</li>`).join('');
    $('endBody').innerHTML = `<p class="mono" style="color:var(--g3)">${esc(W().n.toUpperCase())} · ${esc(caseTitle())}</p>
      <div class="endStamp${ok ? ' ok' : ''}">${ok ? 'GELÖST' : 'UNGELÖST'}</div>
      <div class="interro"><div class="ph">${SC.portrait(cu, W().acc)}</div><div><h2>${ok ? 'Überführt: ' : 'Es war: '}${esc(cu.name)}</h2><p>${esc(cu.name)} (${esc(cu.role)}) hat ${esc(W().loot)} auf dem Gewissen. Motiv: <b>${esc(C.motive)}</b>.</p>
      ${ok ? `<div class="stars">${[1, 2, 3].map(k => `<i class="${k <= stars ? 'on' : ''}">★</i>`).join('')}</div><p class="mono">Punkte: <b>${sc}</b> · Fragen übrig: ${st.left} · Tipps: ${st.hints} · Fehlanklagen: ${st.wrong}</p>` : '<p class="mono">Drei falsche Anklagen – der Täter ist entkommen.</p>'}
      ${up ? `<p class="mono">🎖️ Befördert: <b>${esc(after)}</b>!</p>` : ''}</div></div>
      <h3>Beweisführung</h3><ul class="proof">${proof}</ul>`;
    const next = nextCase();
    $('eNext').hidden = !next; $('eNext').textContent = next && next.mode === 'random' ? '🎲 Neuer Fall' : 'Nächster Fall';
    setTimeout(() => openOv('ovEnd'), ok ? 900 : 300);
    S.sfx(ok ? 'solve' : 'fail'); render();
  }
  function nextCase() {
    if (G.mode === 'random') return { mode: 'random' };
    if (G.mode === 'camp') { for (let w = G.w; w < WORLDS.length; w++) for (let k = 0; k < 3; k++) if (!(w === G.w && k === G.k) && unlocked(w) && !(CASES[w + '-' + k] && CASES[w + '-' + k].s)) return { mode: 'camp', w, k }; if (G.k < 2) return { mode: 'camp', w: G.w, k: G.k + 1 }; }
    return null;
  }
  $('eNext').onclick = () => { const n = nextCase(); S.sfx('ok'); if (!n) return toMenu(); if (n.mode === 'random') startCase('random', 0, 0); else startCase('camp', n.w, n.k); };
  $('eAgain').onclick = () => { S.sfx('ok'); startCase(G.mode, G.w, G.k, G.mode === 'random' ? { seed: G.seed, n: G.n } : {}); };
  $('eMenu').onclick = () => toMenu();

  /* ---------- Tipps, Tabs ---------- */
  function hint() {
    if (!G.C || G.st.done) return; const h = FA.hint(G.C, G.st); S.sfx('ask'); save();
    if (h.k === 'clue') { const cl = h.clue; G.view = 'scene'; G.loc = cl.loc; render(); toast('💡 Schau dich im Schauplatz „' + W().locs[cl.loc].n + '“ genauer um.'); const el = $('stage').querySelector('[data-o="' + cl.obj + '"]'); if (el) { el.classList.add('glow'); try { el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch (e) { } } }
    else if (h.k === 'ask') toast('💡 Frag ' + susName(h.i) + ': „' + CLUES[h.attr].ask + '“', 3600);
    else toast(h.n === 1 ? '💡 Du weißt genug – nur noch eine Person passt. Klag sie an!' : '💡 Löse die Labor-Spuren in deinen Notizen.', 3600);
    $('chipQ').textContent = '🗣️ ' + G.st.left;
  }
  $('bHint').onclick = hint;
  document.querySelectorAll('.tabs [data-v]').forEach(t => { t.onclick = () => { G.view = t.dataset.v; S.sfx('paper'); render(); }; });
  $('bPause').onclick = () => openOv('ovPause');
  $('pGo').onclick = () => closeOv('ovPause'); $('pBrief').onclick = () => { closeOv('ovPause'); brief(); };
  $('pHelp').onclick = () => openOv('ovHelp'); $('pOpts').onclick = () => openOv('ovOpts');
  $('pQuit').onclick = () => { save(); toMenu(); };

  /* ---------- Menü, Welten ---------- */
  function toMenu() {
    closeAll(); bgArt(0, 0); scr('sMenu'); S.music('menu');
    const { r } = rank(); $('menuStat').innerHTML = esc(r) + '<br>🔎 ' + total() + ' Punkte';
    const sv = Object.keys(CASES).filter(k => CASES[k].s).length; $('campInfo').textContent = sv + ' von 18 Fällen gelöst · 6 Welten';
    const d = LS.get(P + 'daily', {}); $('dailyInfo').textContent = d.key === FA.dayKey() ? '✔ Heute gelöst (' + d.score + ')' : 'Für alle gleich – heute neu';
    const run = LS.get(P + 'run', null); $('tCont').hidden = !run; if (run) $('contInfo').textContent = WORLDS[run.mode === 'camp' ? run.w : run.w] ? (run.mode === 'daily' ? 'Tagesfall' : run.mode === 'random' ? 'Zufallsfall' : WORLDS[run.w].n + ' · Fall ' + (run.k + 1)) : '';
  }
  function worlds() {
    $('worlds').innerHTML = WORLDS.map((Wd, w) => {
      const un = unlocked(w);
      return `<div class="world${un ? '' : ' locked'}" style="--acc:${Wd.acc}"><div class="wart">${SC.scene(Wd, 0).svg}</div><div class="wtxt"><h3>${esc(Wd.n)}</h3><p>${esc(Wd.sub)}</p><div class="cases">${[0, 1, 2].map(k => { const c = CASES[w + '-' + k]; return `<button class="btn case nav${c && c.s ? ' solved' : ''}" data-w="${w}" data-k="${k}"${un ? '' : ' disabled'}>Fall ${k + 1}<span class="st">${c && c.st ? '★'.repeat(c.st) + '☆'.repeat(3 - c.st) : '☆☆☆'}</span></button>`; }).join('')}</div></div></div>`;
    }).join('');
    $('worldStat').textContent = total() + ' Punkte · ' + rank().r;
    $('worlds').querySelectorAll('[data-w]').forEach(b => { b.onclick = () => { S.sfx('ok'); startCase('camp', +b.dataset.w, +b.dataset.k); }; });
    scr('sWorlds');
  }
  $('wBack').onclick = () => toMenu();
  document.querySelectorAll('#tiles [data-go]').forEach(t => { t.onclick = () => {
    S.unlock(); S.sfx('ok'); const g = t.dataset.go;
    if (g === 'worlds') worlds();
    else if (g === 'daily') { const d = LS.get(P + 'daily', {}); if (d.key === FA.dayKey()) toast('Heute schon gelöst – nochmal spielen bringt keine Punkte.'); startCase('daily', 0, 0); }
    else if (g === 'random') startCase('random', 0, 0);
    else if (g === 'cont') { const run = LS.get(P + 'run', null); if (!run) return; if (run.mode === 'daily' && run.day !== FA.dayKey()) { LS.del(P + 'run'); toast('Der Tagesfall von gestern ist abgelaufen.'); return toMenu(); } startCase(run.mode, run.w, run.k, { seed: run.seed, n: run.n, run }); }
    else if (g === 'file') { fileOv(); openOv('ovFile'); }
    else if (g === 'opts') openOv('ovOpts');
    else if (g === 'help') openOv('ovHelp');
  }; });
  function fileOv() {
    const { r, nx } = rank(), c = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
    $('rankTxt').innerHTML = 'Rang: <b>' + esc(r) + '</b>' + (nx ? '<br>Nächster Rang „' + esc(nx[1]) + '“ ab ' + nx[0] + ' Punkten' : '');
    const stars = Object.values(CASES).reduce((a, x) => a + (x.st || 0), 0);
    $('fileStats').innerHTML = c('🔎 Punkte', total()) + c('✔ Gelöst', ST.solved) + c('✖ Ungelöst', ST.failed) + c('★ Sterne', stars + ' / 54') + c('🎯 Perfekte Fälle', ST.perfect) + c('💡 Tipps genutzt', ST.hints);
  }
  $('fileX').onclick = () => closeOv('ovFile'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { oSound: 'sound', oMusic: 'music', oRain: 'rain', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sCase' ? 'case' : 'menu'); document.body.classList.toggle('still', !SET.rain); }; }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('type'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; pressStart(); });

  /* ---------- Tastatur ---------- */
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape') { e.preventDefault(); back(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    if (cur === 'sCase' && !overlays().length && !e.repeat) {
      const v = { Digit1: 'scene', Digit2: 'sus', Digit3: 'notes' }[c];
      if (v) { G.view = v; S.sfx('paper'); render(); return; }
      if (c === 'Digit4') return openAccuse();
      if (c === 'KeyH') return hint();
      if (c === 'KeyP') return openOv('ovPause');
      if ((c === 'KeyQ' || c === 'KeyE') && G.view === 'scene') { G.loc = (G.loc + (c === 'KeyE' ? 1 : 2)) % 3; S.sfx('paper'); renderScene(); return; }
    }
    if (overlays().some(o => o.id === 'ovLab') && (c === 'Minus' || c === 'NumpadSubtract' || c === 'Equal' || c === 'NumpadAdd')) { const b = $(c === 'Minus' || c === 'NumpadSubtract' ? 'lMinus' : 'lPlus'); if (b) b.click(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);

  /* ---------- Gamecontroller ---------- */
  const PAD = { b: [], dir: null }; let padT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const gp = list.find(p => p && p.connected); if (!gp) return;
    const ax = gp.axes || [], bt = gp.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k];
    let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0;
    if (now[14]) x = -1; if (now[15]) x = 1; if (now[12]) z = -1; if (now[13]) z = 1;
    const d = x || z ? (Math.abs(x) >= Math.abs(z) ? [x, 0] : [0, z]) : null, key = d ? d.join() : null;
    document.body.classList.add('kbd');
    if (d && (key !== PAD.dir || padT <= 0)) { moveFocus(d[0], d[1]); padT = key !== PAD.dir ? .35 : .14; }
    PAD.dir = key;
    if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
    if (down(1)) back();
    if (down(9)) { if (cur === 'sTitle') pressStart(); else if (cur === 'sCase') { if (overlays().some(o => o.id === 'ovPause')) closeOv('ovPause'); else if (!overlays().length) openOv('ovPause'); } }
    if (cur === 'sCase' && !overlays().length) {
      if ((down(4) || down(5)) && G.view === 'scene') { G.loc = (G.loc + (down(5) ? 1 : 2)) % 3; S.sfx('paper'); renderScene(); }
      if (down(2)) { G.view = G.view === 'notes' ? 'scene' : 'notes'; render(); }
      if (down(3)) hint();
    }
    PAD.b = now; padT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  let last = performance.now();
  (function loop(now) { const dt = Math.min(.1, (now - last) / 1000); last = now; pollPads(dt); requestAnimationFrame(loop); })(last);

  /* ---------- Laden ---------- */
  const TIPS = ['Akten werden sortiert …', 'Lupe wird poliert …', 'Kaffee für die Nachtschicht …', 'Verdächtige warten im Flur …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.2); await wait(80); bgArt(0, 0); bar(.7); await wait(60); bar(1);
    await wait(Math.max(0, 900 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search);
    if (q.get('case')) { const [w, k] = q.get('case').split('-').map(Number); if (WORLDS[w] && k >= 0 && k < 3) { startCase('camp', w, k); return; } }
    if (q.get('mode') === 'daily') { startCase('daily', 0, 0); return; }
    scr('sTitle');
  })();
  window.FAApp = { G, startCase, look, lab, interro, toMenu, render, worlds, finish, get cur() { return cur; } };
})();
