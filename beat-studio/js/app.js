/* Beat-Studio – Oberfläche: Laden, Titel, Konsolen-Menü, Song-Assistent, Meine Songs, Studio (Aufbau, Drums, Bass, Akkorde,
 * Melodie, Gesang, Mixer), Export (WAV, Einzelspuren, MIDI, Projekt), Radio-Jury. Speichern: beat-studio-* (Cloud über anmacha-cloud),
 * Gesangsaufnahmen nur auf dem Gerät (IndexedDB). */
(function () {
  'use strict';
  const C = BSCore, E = BSEngine, P = E.P, $ = id => document.getElementById(id), PX = 'beat-studio-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(PX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(PX + k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  const SET = Object.assign({ lat: 120, hp: false, wide: 'auto' }, LS.get('settings', {})), saveSet = () => LS.set('settings', SET);
  let SONGS = (LS.get('songs', []) || []).map(C.repair).filter(Boolean);
  let S = null, cur = 'sLoad', tab = 'arr', sec = 'verse', bar = 0, noteLen = 2, chordBar = 0, undo = [], redo = [], saveT = 0;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const coarse = () => matchMedia('(pointer: coarse)').matches, narrow = () => SET.wide === 'bar' || (SET.wide !== 'all' && innerWidth < 1000);
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2400); }
  const keyName = s => C.NOTE[s.key] + '-' + (s.scale === 'moll' ? 'Moll' : 'Dur');

  /* ---------- Bildschirme, Fokus, Tastatur ---------- */
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const ovOpen = () => !$('ov').hidden;
  function focusFirst() { if (coarse()) return; const root = ovOpen() ? $('ovBox') : $(cur); if (!root) return; const el = root.querySelector('[data-focus]') || root.querySelector('.mi, .nav:not([disabled])'); if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  let ovEsc = null;
  function overlay(html, binds) { $('ovBox').innerHTML = html; $('ov').hidden = false; $('ovBox').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { const f = binds[b.dataset.act]; if (f) f(b); }; }); ovEsc = binds.esc || closeOv; setTimeout(focusFirst, 0); }
  function closeOv() { $('ov').hidden = true; $('ovBox').innerHTML = ''; ovEsc = null; setTimeout(focusFirst, 0); }
  $('ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });
  function navMove(dx, dy) {
    const root = ovOpen() ? $('ovBox') : $(cur), els = Array.from(root.querySelectorAll('.nav, .mi, .cell')).filter(x => !x.disabled && x.offsetParent !== null); if (!els.length) return;
    const a = document.activeElement; if (!els.includes(a)) { els[0].focus(); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 2) continue; const d = along + Math.abs(x * dy + y * dx) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  const BACK = { sTitle: null, sMenu: () => scr('sTitle'), sWizard: () => menu(), sSongs: () => menu(), sHelp: () => menu(), sResult: () => openStudio(S), sStudio: () => menu() };
  addEventListener('keydown', e => {
    const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    if (e.code === 'Escape') { e.preventDefault(); if (ovOpen()) { if (ovEsc) ovEsc(); return; } if (typing) { t.blur(); return; } if (BACK[cur]) BACK[cur](); return; }
    if (typing) return;
    if (t && t.type === 'range' && /^Arrow/.test(e.code)) return;   // Schieberegler mit Pfeilen verstellen
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); menu(); return; }
    if (cur === 'sStudio' && !ovOpen()) {
      if (e.code === 'Space') { e.preventDefault(); toggleSong(); return; }
      if (e.code === 'KeyL') { toggleLoop(); return; }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') { e.preventDefault(); doRedo(); return; }
      if (e.code === 'BracketLeft' || e.code === 'BracketRight') { const i = TABS.findIndex(x => x[0] === tab), n = TABS[(i + (e.code === 'BracketRight' ? 1 : TABS.length - 1)) % TABS.length][0]; setTab(n); return; }
      if (/^Digit[1-7]$/.test(e.code)) { setTab(TABS[+e.code.slice(5) - 1][0]); return; }
    }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); navMove(d[0], d[1]); }
  });

  /* ---------- Speichern ---------- */
  function persist(now) { clearTimeout(saveT); const go = () => { if (!S) return; S.updated = Date.now(); const i = SONGS.findIndex(x => x.id === S.id); if (i >= 0) SONGS[i] = S; else SONGS.unshift(S); SONGS = SONGS.slice(0, 40); if (!LS.set('songs', SONGS)) toast('⚠️ Speicher voll – lösche alte Songs'); LS.set('last', S.id); }; if (now) go(); else saveT = setTimeout(go, 400); }
  const snap = () => JSON.stringify(S);
  function edit(fn, opt) { if (!opt || !opt.noUndo) { undo.push(snap()); if (undo.length > 40) undo.shift(); redo = []; } if (S.demo) delete S.demo; fn(); S.edits = (S.edits || 0) + 1; persist(); P.update(S); if (!opt || !opt.quiet) renderStudio(opt && opt.keep); }
  function doUndo() { if (!undo.length) return toast('Nichts rückgängig zu machen'); redo.push(snap()); S = C.repair(JSON.parse(undo.pop())); persist(); P.update(S); renderStudio(); toast('↶ Rückgängig', 900); }
  function doRedo() { if (!redo.length) return; undo.push(snap()); S = C.repair(JSON.parse(redo.pop())); persist(); P.update(S); renderStudio(); toast('↷ Wiederholt', 900); }

  /* ---------- Menü ---------- */
  function menu() { stopAll(); scr('sMenu'); const last = SONGS.find(x => x.id === LS.get('last')) || SONGS[0], best = LS.get('highscore', 0) || 0;
    const items = [last && ['cont', '▶', 'Weiter bearbeiten', '„' + esc(last.name) + '“ – ' + C.G[last.genre].n + ', ' + fmt(C.songSec(last)) + '. Mach weiter, wo du aufgehört hast.', esc(last.name)],
      ['new', '✨', 'Neuer Song', 'Der Song-Assistent baut dir in Sekunden einen kompletten Song – Genre, Tonart und Tempo wählst du. Danach machst du ihn zu deinem.'],
      ['songs', '📂', 'Meine Songs', SONGS.length + ' gespeicherte Songs – öffnen, kopieren, löschen, als Projektdatei sichern oder laden.'],
      ['demo', '🎧', 'Demo anhören', 'Ein Zufalls-Song aus dem Assistenten zum Reinhören und Ausprobieren.'],
      ['help', '❓', 'So geht\'s', 'Vom ersten Beat zum fertigen Song: alle Werkzeuge erklärt.'],
      ['opts', '⚙️', 'Einstellungen', 'Raster-Ansicht, Kopfhörer und Aufnahme-Verzögerung.']].filter(Boolean);
    $('mList').innerHTML = items.map(([id, ic, t, d, sub]) => `<button class="mi${id === 'cont' || (!last && id === 'new') ? ' hero' : ''}" data-go="${id}" data-i="${esc(d)}" data-ic="${ic}"><i>${ic}</i><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</button>`).join('');
    const info = b => { $('mInfo').innerHTML = `<i>${b.dataset.ic}</i><b>${b.querySelector('b').textContent}</b><p>${b.dataset.i}</p>${best ? `<p class="best">🏆 Bester Jury-Wert: <b>${best}</b></p>` : ''}`; };
    $('mList').querySelectorAll('.mi').forEach(b => { b.onfocus = b.onmouseenter = () => info(b); b.onclick = () => menuGo(b.dataset.go); }); info($('mList').firstElementChild);
  }
  function menuGo(g) { if (g === 'cont') { const l = SONGS.find(x => x.id === LS.get('last')) || SONGS[0]; if (l) openStudio(l); } else if (g === 'new') wizard(); else if (g === 'songs') songsScreen(); else if (g === 'demo') { const s = C.generate({ genre: Object.keys(C.G)[Math.floor(Math.random() * 6)], name: 'Demo-Song', len: 'kurz' }); s.demo = true; openStudio(s); setTimeout(() => toggleSong(), 300); } else if (g === 'help') help(); else if (g === 'opts') opts(); }

  /* ---------- Song-Assistent ---------- */
  const W = { genre: 'pop', key: 0, scale: 'dur', bpm: 0, len: 'normal', name: '', artist: '' };
  function wizard() {
    scr('sWizard'); const g = C.G[W.genre], bpm = W.bpm || Math.round((g.bpm[0] + g.bpm[1]) / 2);
    $('wizBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>✨ Song-Assistent</h2><span></span></header>
      <h3><span class="n">1</span> Genre</h3><div class="cards">${Object.keys(C.G).map(k => `<button class="gcard nav${k === W.genre ? ' on' : ''}" data-g="${k}"><i>${C.G[k].icon}</i><b>${C.G[k].n}</b><small>${C.G[k].bpm[0]}–${C.G[k].bpm[1]} BPM</small></button>`).join('')}</div>
      <h3><span class="n">2</span> Tonart</h3><div class="chips">${C.NOTE.map((n, i) => `<button class="chip nav${i === W.key ? ' on' : ''}" data-k="${i}">${n}</button>`).join('')}</div>
      <div class="chips">${['dur', 'moll'].map(x => `<button class="chip nav${x === W.scale ? ' on' : ''}" data-sc="${x}">${x === 'dur' ? '☀️ Dur (fröhlich)' : '🌙 Moll (traurig, cool)'}</button>`).join('')}</div>
      <h3><span class="n">3</span> Tempo <b id="wBpmV">${bpm} BPM</b></h3><input type="range" class="nav" id="wBpm" min="60" max="180" value="${bpm}">
      <h3><span class="n">4</span> Länge</h3><div class="chips">${[['kurz', 'Kurz (~1:30)'], ['normal', 'Normal (~2:30)'], ['lang', 'Lang (~3:00)']].map(([k, n]) => `<button class="chip nav${k === W.len ? ' on' : ''}" data-l="${k}">${n}</button>`).join('')}</div>
      <h3><span class="n">5</span> Name</h3><div class="row"><input class="field nav" id="wName" maxlength="60" placeholder="Songtitel" value="${esc(W.name)}"><input class="field nav" id="wArtist" maxlength="40" placeholder="Künstlername" value="${esc(W.artist)}"></div>
      <div class="row end"><button class="btn nav" id="wRnd">🎲 Alles zufällig</button><button class="btn gold xl nav" id="wGo" data-focus>🎵 Song erstellen</button></div>`;
    const box = $('wizBox');
    box.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { W.genre = b.dataset.g; W.bpm = 0; if (b.dataset.g === 'lofi' || b.dataset.g === 'hiphop') W.scale = 'moll'; wizard(); const nb = box.querySelector(`[data-g="${W.genre}"]`); if (nb) nb.focus(); });
    box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { W.key = +b.dataset.k; box.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); });
    box.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => { W.scale = b.dataset.sc; box.querySelectorAll('[data-sc]').forEach(x => x.classList.toggle('on', x === b)); });
    box.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { W.len = b.dataset.l; box.querySelectorAll('[data-l]').forEach(x => x.classList.toggle('on', x === b)); });
    $('wBpm').oninput = () => { W.bpm = +$('wBpm').value; $('wBpmV').textContent = W.bpm + ' BPM'; };
    $('wName').oninput = () => { W.name = $('wName').value; }; $('wArtist').oninput = () => { W.artist = $('wArtist').value; };
    $('wRnd').onclick = () => { const ks = Object.keys(C.G); W.genre = ks[Math.floor(Math.random() * ks.length)]; W.key = Math.floor(Math.random() * 12); W.scale = Math.random() < .5 ? 'dur' : 'moll'; W.bpm = 0; wizard(); };
    $('wGo').onclick = () => { const s = C.generate({ genre: W.genre, key: W.key, scale: W.scale, bpm: +$('wBpm').value, len: W.len, name: W.name.trim() || C.G[W.genre].n + '-Hit', artist: W.artist.trim(), seed: Date.now() }); S = s; undo = []; redo = []; persist(true); openStudio(s); toast('🎵 Dein Song steht! Jetzt mach ihn zu deinem.', 3000); };
    box.querySelector('[data-back]').onclick = () => menu();
  }

  /* ---------- Meine Songs ---------- */
  function songsScreen() {
    scr('sSongs'); const best = LS.get('scores', {});
    $('songsBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>📂 Meine Songs</h2><label class="btn sm nav" tabindex="0">📥 Projekt laden<input type="file" id="sImp" accept=".json,.beatstudio,application/json" hidden></label></header>
      ${SONGS.length ? `<div class="songList">${SONGS.map((s, i) => `<div class="songRow"><button class="sOpen nav" data-i="${i}"><i>${C.G[s.genre].icon}</i><b>${esc(s.name)}</b><small>${C.G[s.genre].n} · ${keyName(s)} · ${s.bpm} BPM · ${fmt(C.songSec(s))}${best[s.id] ? ' · 🏆 ' + best[s.id] : ''}</small></button><button class="btn sm nav" data-dup="${i}" title="Kopie">⧉</button><button class="btn sm nav" data-del="${i}" title="Löschen">🗑</button></div>`).join('')}</div>` : '<p class="hint">Noch keine Songs – starte mit dem Song-Assistenten!</p>'}
      <div class="row end"><button class="btn gold nav" id="sNew" data-focus>✨ Neuer Song</button></div>`;
    const box = $('songsBox'); box.querySelector('[data-back]').onclick = () => menu(); $('sNew').onclick = () => wizard();
    box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => openStudio(SONGS[+b.dataset.i]));
    box.querySelectorAll('[data-dup]').forEach(b => b.onclick = () => { const c = C.repair(JSON.parse(JSON.stringify(SONGS[+b.dataset.dup]))); c.id = 's' + Date.now().toString(36); c.name += ' (Kopie)'; c.vox = {}; SONGS.unshift(c); LS.set('songs', SONGS); songsScreen(); toast('⧉ Kopie angelegt (ohne Gesang)'); });
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const s = SONGS[+b.dataset.del]; overlay(`<h3>🗑 „${esc(s.name)}“ löschen?</h3><p class="hint">Das kann man nicht rückgängig machen. Sichere ihn vorher als Projektdatei, wenn du ihn behalten willst.</p><div class="row"><button class="btn nav" data-act="n">Abbrechen</button><button class="btn red nav" data-act="y">Löschen</button></div>`, { n: closeOv, y: () => { Object.values(s.vox || {}).forEach(id => E.DB.del(s.id + ':' + id)); SONGS = SONGS.filter(x => x !== s); LS.set('songs', SONGS); closeOv(); songsScreen(); } }); });
    $('sImp').onchange = async () => { const f = $('sImp').files[0]; if (!f) return; try { const j = JSON.parse(await f.text()), s = C.repair(j.song || j); if (!s) throw new Error('x'); s.id = 's' + Date.now().toString(36); const vox = j.voxData || {}; const map = {};
      for (const k of Object.keys(s.vox)) { const d = vox[s.vox[k]]; if (d) { const bytes = Uint8Array.from(atob(d), c => c.charCodeAt(0)); await E.DB.put(s.id + ':' + s.vox[k], bytes.buffer); map[k] = s.vox[k]; } } s.vox = map; SONGS.unshift(s); LS.set('songs', SONGS); toast('📥 „' + s.name + '“ geladen'); songsScreen(); } catch (e) { toast('Das ist keine Beat-Studio-Projektdatei.'); } };
  }

  /* ---------- Studio ---------- */
  const TABS = [['arr', '🧩', 'Aufbau'], ['drums', '🥁', 'Drums'], ['bass', '🎸', 'Bass'], ['chords', '🎹', 'Akkorde'], ['lead', '🎺', 'Melodie'], ['vox', '🎤', 'Gesang'], ['mix', '🎚️', 'Mixer']];
  function openStudio(s) { stopAll(); S = s; if (!s.demo) LS.set('last', s.id); if (!undo.length || undo.songId !== s.id) { undo = []; redo = []; undo.songId = s.id; } sec = s.arr[0] ? (s.arr.find(b => b.sec === 'verse') || s.arr[0]).sec : 'verse'; bar = 0; scr('sStudio'); renderStudio(); }
  function setTab(t) { tab = t; renderStudio(); const b = $('stTabs').querySelector(`[data-t="${t}"]`); if (b && !coarse()) b.focus(); }
  function renderStudio(keepFocus) {
    if (!S) return; const fk = keepFocus && document.activeElement && document.activeElement.dataset ? Object.assign({}, document.activeElement.dataset) : null;
    $('stName').value = S.name; $('stBpm').textContent = S.bpm + ' BPM'; $('stKey').textContent = keyName(S);
    $('stTabs').innerHTML = TABS.map(([k, ic, n], i) => `<button class="tab nav${k === tab ? ' on' : ''}" data-t="${k}" title="${n} (${i + 1})"><i>${ic}</i><span>${n}</span></button>`).join('');
    $('stTabs').querySelectorAll('.tab').forEach(b => b.onclick = () => setTab(b.dataset.t));
    timeline(); secBar(); ({ arr: edArr, drums: edDrums, bass: edRoll, lead: edRoll, chords: edChords, vox: edVox, mix: edMix }[tab])();
    if (fk) { const sel = Object.keys(fk).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${fk[k]}"]`).join(''); const el = sel && $('sStudio').querySelector(sel); if (el) el.focus({ preventScroll: true }); }
  }
  function timeline() {
    const tot = C.songSec(S) || 1;
    $('stTime').innerHTML = S.arr.map((b, i) => `<button class="tb${b.sec === sec ? ' on' : ''}" data-b="${i}" style="flex:${C.blockSec(S, b)};--c:${C.SECS[b.sec].c}" title="${C.SECS[b.sec].n}${b.rep === 2 ? ' ×2' : ''}">${C.SECS[b.sec].n}${S.vox[i] ? ' 🎤' : ''}</button>`).join('') + '<i class="ph" id="stPh"></i>';
    $('stTime').querySelectorAll('.tb').forEach(b => b.onclick = () => { const i = +b.dataset.b; sec = S.arr[i].sec; if (P.on && P.mode === 'song') startSong(i); renderStudio(); });
    $('stPos').textContent = fmt(P.on && P.mode === 'song' ? P.pos() : 0) + ' / ' + fmt(tot);
  }
  const PAT_TABS = ['drums', 'bass', 'chords', 'lead'];
  function secBar() {
    const el = $('stSecs'); if (!PAT_TABS.includes(tab)) { el.innerHTML = ''; el.hidden = true; return; } el.hidden = false;
    const used = new Set(S.arr.map(b => b.sec));
    el.innerHTML = `<div class="chips secs">${Object.keys(C.SECS).map(k => `<button class="chip nav sec${k === sec ? ' on' : ''}${used.has(k) ? '' : ' unused'}" data-sec="${k}" style="--c:${C.SECS[k].c}">${C.SECS[k].n}</button>`).join('')}</div>
      <div class="chips acts">${tab !== 'chords' && narrow() ? [0, 1, 2, 3].map(i => `<button class="chip nav${i === bar ? ' on' : ''}" data-bar="${i}">Takt ${i + 1}</button>`).join('') : ''}
        <button class="chip nav" data-a="roll" title="Diese Spur in diesem Abschnitt neu würfeln">🎲 Neu</button><button class="chip nav" data-a="copy" title="Aus anderem Abschnitt übernehmen">📋 Kopieren</button><button class="chip nav" data-a="clear">🧹 Leeren</button></div>`;
    el.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => { sec = b.dataset.sec; renderStudio(); const nb = $('stSecs').querySelector(`[data-sec="${sec}"]`); if (nb && !coarse()) nb.focus(); if (P.on && P.mode === 'pat') startLoop(); });
    el.querySelectorAll('[data-bar]').forEach(b => b.onclick = () => { bar = +b.dataset.bar; renderStudio(true); });
    el.querySelector('[data-a="roll"]').onclick = () => edit(() => C.reroll(S, sec, tab, Date.now()));
    el.querySelector('[data-a="clear"]').onclick = () => edit(() => { const p = S.pat[sec]; if (tab === 'drums') C.DRUMS.forEach(([k]) => p.drums[k].fill(0)); else if (tab === 'chords') p.chords = [0, 0, 0, 0]; else p[tab] = []; });
    el.querySelector('[data-a="copy"]').onclick = () => overlay(`<h3>📋 ${TABS.find(x => x[0] === tab)[2]} übernehmen aus …</h3><div class="chips">${Object.keys(C.SECS).filter(k => k !== sec).map(k => `<button class="chip nav" data-act="${k}" style="--c:${C.SECS[k].c}">${C.SECS[k].n}</button>`).join('')}</div><button class="btn nav" data-act="x">Abbrechen</button>`,
      Object.assign({ x: closeOv }, ...Object.keys(C.SECS).map(k => ({ [k]: () => { closeOv(); edit(() => { S.pat[sec][tab] = JSON.parse(JSON.stringify(S.pat[k][tab])); }); toast('📋 Aus ' + C.SECS[k].n + ' übernommen'); } }))));
  }
  const range = () => narrow() ? [bar * 16, bar * 16 + 16] : [0, C.PSTEPS];
  // Drum-Computer
  function edDrums() {
    const p = S.pat[sec], [a, b] = range();
    $('stEd').innerHTML = `<div class="grid drums" style="--cols:${b - a}">${C.DRUMS.map(([k, n]) => `<div class="rowL"><button class="lbl nav" data-hear="${k}" title="Anhören">${n}</button></div>` + Array.from({ length: b - a }, (_, j) => { const i = a + j, v = p.drums[k][i]; return `<button class="cell${v ? ' on' : ''}${i % 4 === 0 ? ' beat' : ''}${i % 16 === 0 ? ' b0' : ''}" data-r="${k}" data-s="${i}" aria-label="${n} Schritt ${i + 1}${v ? ' an' : ''}"></button>`; }).join('')).join('')}</div>
      <p class="hint">Antippen = Schlag an/aus · Leertaste spielt den Song, L den Abschnitt in Schleife · Kit im Mixer: ${C.PRESETS.kit.find(x => x[0] === S.mix.drums.preset)[1]}</p>`;
    $('stEd').querySelectorAll('.cell').forEach(c => c.onclick = () => { const k = c.dataset.r, i = +c.dataset.s; edit(() => { S.pat[sec].drums[k][i] = S.pat[sec].drums[k][i] ? 0 : 1; }, { quiet: true }); c.classList.toggle('on'); if (c.classList.contains('on')) P.preview(S, { tr: 'drums', drum: k }); });
    $('stEd').querySelectorAll('[data-hear]').forEach(c => c.onclick = () => P.preview(S, { tr: 'drums', drum: c.dataset.hear }));
  }
  // Bass/Melodie: Tonleiter-Raster (alle Töne passen zur Tonart)
  function edRoll() {
    const tr = tab, p = S.pat[sec], [a, b] = range(), rows = tr === 'lead' ? 15 : 12, base = tr === 'lead' ? 60 : 36;
    const cover = {}; p[tr].forEach((n, idx) => { for (let k = 0; k < n.l; k++) cover[n.n + ':' + (n.s + k)] = { idx, start: k === 0 }; });
    const chordTones = st => { const c = p.chords[Math.floor(st / 16)]; return new Set([c, c + 2, c + 4].map(x => ((x % 7) + 7) % 7)); };
    let html = `<div class="grid roll" style="--cols:${b - a}">`;
    for (let r = rows - 1; r >= 0; r--) { const m = C.midi(S, r, base), nm = C.NOTE[m % 12] + (Math.floor(m / 12) - 1);
      html += `<div class="rowL"><button class="lbl nav${r % 7 === 0 ? ' root' : ''}" data-hear="${m}">${nm}</button></div>` + Array.from({ length: b - a }, (_, j) => { const i = a + j, cv = cover[r + ':' + i], ct = chordTones(i).has(((r % 7) + 7) % 7);
        return `<button class="cell${cv ? (cv.start ? ' on' : ' cont') : ''}${ct ? ' ct' : ''}${i % 4 === 0 ? ' beat' : ''}${i % 16 === 0 ? ' b0' : ''}" data-r="${r}" data-s="${i}" aria-label="${nm} Schritt ${i + 1}${cv ? ' Note' : ''}"></button>`; }).join(''); }
    html += `</div><div class="chips acts"><span class="lab">Notenlänge:</span>${[[1, '1/16'], [2, '1/8'], [4, '1/4'], [8, '1/2'], [16, 'Ganze']].map(([l, n]) => `<button class="chip nav${l === noteLen ? ' on' : ''}" data-len="${l}">${n}</button>`).join('')}</div>
      <p class="hint">Antippen = Note setzen oder löschen · helle Felder passen zum Akkord · Klang im Mixer: ${C.PRESETS[tr].find(x => x[0] === S.mix[tr].preset)[1]}</p>`;
    $('stEd').innerHTML = html;
    $('stEd').querySelectorAll('[data-len]').forEach(c => c.onclick = () => { noteLen = +c.dataset.len; renderStudio(true); });
    $('stEd').querySelectorAll('[data-hear]').forEach(c => c.onclick = () => P.preview(S, { tr, m: +c.dataset.hear, d: .4 }));
    $('stEd').querySelectorAll('.cell').forEach(c => c.onclick = () => { const r = +c.dataset.r, i = +c.dataset.s, cv = cover[r + ':' + i];
      edit(() => { const arr = S.pat[sec][tr]; if (cv) arr.splice(cv.idx, 1); else { const l = Math.min(noteLen, C.PSTEPS - i); for (let k = arr.length - 1; k >= 0; k--) { const n = arr[k]; if (n.n === r && n.s < i + l && n.s + n.l > i) arr.splice(k, 1); } arr.push({ s: i, n: r, l }); arr.sort((x, y) => x.s - y.s); } }, { keep: true });
      if (!cv) P.preview(S, { tr, m: C.midi(S, r, base), d: noteLen * 15 / S.bpm }); });
  }
  // Akkorde: je Takt eine Stufe, Vorlagen bekannter Folgen
  const PROGS = [['I–V–vi–IV', [0, 4, 5, 3]], ['vi–IV–I–V', [5, 3, 0, 4]], ['I–IV–V–IV', [0, 3, 4, 3]], ['I–vi–IV–V', [0, 5, 3, 4]], ['ii–V–I–I', [1, 4, 0, 0]], ['IV–V–iii–vi', [3, 4, 2, 5]], ['i–VI–III–VII', [0, 5, 2, 6]], ['i–iv–v–i', [0, 3, 4, 0]]];
  function edChords() {
    const p = S.pat[sec];
    $('stEd').innerHTML = `<div class="chordBars">${p.chords.map((c, i) => `<button class="cbar nav${i === chordBar ? ' on' : ''}" data-cb="${i}"><small>Takt ${i + 1}</small><b>${C.chordName(S, c)}</b><span>${C.ROMAN[c]}</span></button>`).join('')}</div>
      <h4>Akkord für Takt ${chordBar + 1}</h4><div class="chips">${[0, 1, 2, 3, 4, 5, 6].map(d => `<button class="chip nav big${p.chords[chordBar] === d ? ' on' : ''}" data-cd="${d}"><b>${C.chordName(S, d)}</b><small>${C.ROMAN[d]}</small></button>`).join('')}</div>
      <h4>Bekannte Folgen</h4><div class="chips">${PROGS.map(([n, pr], i) => `<button class="chip nav" data-pr="${i}">${n} <small>(${pr.map(d => C.chordName(S, d)).join(' ')})</small></button>`).join('')}</div>
      <h4>Spielweise</h4><div class="chips">${C.CHORD_STYLES.map(([k, n]) => `<button class="chip nav${S.mix.chords.style === k ? ' on' : ''}" data-cs="${k}">${n}</button>`).join('')}</div>
      <h4>Klang</h4><div class="chips">${C.PRESETS.chords.map(([k, n]) => `<button class="chip nav${S.mix.chords.preset === k ? ' on' : ''}" data-cp="${k}">${n}</button>`).join('')}</div>
      <p class="hint">Bass und Melodie behalten ihre Stufen – nach einem Akkordwechsel passt „🎲 Neu“ bei Bass oder Melodie alles wieder zusammen. Spielweise und Klang gelten für den ganzen Song.</p>`;
    const ed = $('stEd');
    ed.querySelectorAll('[data-cb]').forEach(b => b.onclick = () => { chordBar = +b.dataset.cb; renderStudio(true); });
    ed.querySelectorAll('[data-cd]').forEach(b => b.onclick = () => { const d = +b.dataset.cd; edit(() => { S.pat[sec].chords[chordBar] = d; }, { keep: true }); hearChord(d); });
    ed.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => edit(() => { S.pat[sec].chords = PROGS[+b.dataset.pr][1].slice(); }, { keep: true }));
    ed.querySelectorAll('[data-cs]').forEach(b => b.onclick = () => edit(() => { S.mix.chords.style = b.dataset.cs; }, { keep: true }));
    ed.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { edit(() => { S.mix.chords.preset = b.dataset.cp; }, { keep: true }); hearChord(S.pat[sec].chords[chordBar]); });
  }
  function hearChord(d) { [d, d + 2, d + 4].forEach(x => P.preview(S, { tr: 'chords', m: C.midi(S, x, 48), d: .8, v: .7 })); }
  // Aufbau (Arrangement)
  function edArr() {
    const tot = C.songSec(S);
    $('stEd').innerHTML = `<div class="blocks">${S.arr.map((b, i) => `<div class="blk" style="--c:${C.SECS[b.sec].c}"><b>${i + 1}. ${C.SECS[b.sec].n}</b><small>${4 * (b.rep || 1)} Takte · ${fmt(C.blockSec(S, b))}${S.vox[i] ? ' · 🎤 Gesang' : ''}</small>
        <div class="bt"><button class="btn sm nav" data-mv="${i}:-1" ${i ? '' : 'disabled'} aria-label="nach vorn">◀</button><button class="btn sm nav" data-rep="${i}" title="4 oder 8 Takte">${b.rep === 2 ? '×2' : '×1'}</button><button class="btn sm nav" data-play="${i}" aria-label="ab hier abspielen">▶</button><button class="btn sm nav" data-mv="${i}:1" ${i < S.arr.length - 1 ? '' : 'disabled'} aria-label="nach hinten">▶▶</button><button class="btn sm nav" data-del="${i}" aria-label="löschen">🗑</button></div></div>`).join('')}</div>
      <h4>Abschnitt anhängen</h4><div class="chips">${Object.keys(C.SECS).map(k => `<button class="chip nav" data-add="${k}" style="--c:${C.SECS[k].c}">＋ ${C.SECS[k].n}</button>`).join('')}</div>
      <h4>Vorlagen</h4><div class="chips">${Object.keys(C.ARR).map(k => `<button class="chip nav" data-tpl="${k}">${{ kurz: 'Kurz', normal: 'Normal', lang: 'Lang' }[k]}</button>`).join('')}</div>
      <p class="hint">Songlänge: <b>${fmt(tot)}</b> · Radio-Hits sind meist 2:30–3:30 lang. Jeder Abschnitt (Intro, Strophe …) hat sein eigenes Pattern – bearbeite es in Drums, Bass, Akkorde und Melodie.</p>`;
    const ed = $('stEd');
    ed.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => { const [i, d] = b.dataset.mv.split(':').map(Number); edit(() => moveBlock(i, i + d)); });
    ed.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => edit(() => { const x = S.arr[+b.dataset.rep]; x.rep = x.rep === 2 ? 1 : 2; }, { keep: true }));
    ed.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (S.arr.length <= 1) return toast('Ein Abschnitt muss bleiben'); edit(() => delBlock(+b.dataset.del)); });
    ed.querySelectorAll('[data-play]').forEach(b => b.onclick = () => startSong(+b.dataset.play));
    ed.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { if (S.arr.length >= 40) return toast('Maximal 40 Abschnitte'); edit(() => S.arr.push({ sec: b.dataset.add, rep: 1 }), { keep: true }); });
    ed.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => edit(() => { S.arr = C.ARR[b.dataset.tpl].map(sec2 => ({ sec: sec2, rep: sec2 === 'verse' || sec2 === 'chorus' ? 2 : 1 })); const v = {}; Object.keys(S.vox).forEach(k => { if (+k < S.arr.length) v[k] = S.vox[k]; }); S.vox = v; }));
  }
  function moveBlock(i, j) { if (j < 0 || j >= S.arr.length) return; const [b] = S.arr.splice(i, 1); S.arr.splice(j, 0, b); const v = Object.assign({}, S.vox), a = v[i], c = v[j]; delete S.vox[i]; delete S.vox[j]; if (a) S.vox[j] = a; if (c) S.vox[i] = c; }
  function delBlock(i) { S.arr.splice(i, 1); const v = {}; Object.keys(S.vox).forEach(k => { const n = +k; if (n < i) v[n] = S.vox[k]; else if (n > i) v[n - 1] = S.vox[k]; else E.DB.del(S.id + ':' + S.vox[k]); }); S.vox = v; }
  // Gesang
  const voxMem = {};   // clipId → AudioBuffer
  async function voxBuf(id) { if (voxMem[id]) return voxMem[id]; const ab = await E.DB.get(S.id + ':' + id); if (!ab) return null; try { voxMem[id] = await E.decode(ab); } catch (e) { return null; } return voxMem[id]; }
  async function voxBufs(from) { const m = {}; for (const k of Object.keys(S.vox)) { if (+k < (from || 0)) continue; const b = await voxBuf(S.vox[k]); if (b) m[+k] = b; } return m; }
  function edVox() {
    $('stEd').innerHTML = `<div class="panel note"><p>🎤 Sing über deinen Song: Wähle einen Abschnitt, drück <b>Aufnehmen</b> – nach dem Einzähler läuft die Musik und das Mikrofon nimmt genau diesen Abschnitt auf. ${SET.hp ? '🎧 Kopfhörer-Modus an.' : '🎧 Am besten mit Kopfhörern (in den Einstellungen einschalten), sonst hört das Mikro die Musik mit.'}</p><p class="hint">Die Aufnahmen bleiben auf diesem Gerät – beim Export und in der Projektdatei sind sie dabei.</p></div>
      <div class="blocks">${S.arr.map((b, i) => `<div class="blk" style="--c:${C.SECS[b.sec].c}"><b>${i + 1}. ${C.SECS[b.sec].n}</b><small>${fmt(C.blockSec(S, b))}${S.vox[i] ? ' · 🎤 aufgenommen' : ''}</small><div class="bt"><button class="btn sm red nav" data-rec="${i}">● Aufnehmen</button>${S.vox[i] ? `<button class="btn sm nav" data-play="${i}">▶</button><button class="btn sm nav" data-vdel="${i}" aria-label="Aufnahme löschen">🗑</button>` : ''}</div></div>`).join('')}</div>
      <h4>Stimm-Effekt</h4><div class="chips">${Object.keys(E.VOXFX).map(k => `<button class="chip nav${S.mix.vox.fx === k ? ' on' : ''}" data-fx="${k}">${E.VOXFX[k]}</button>`).join('')}</div>`;
    const ed = $('stEd');
    ed.querySelectorAll('[data-rec]').forEach(b => b.onclick = () => record(+b.dataset.rec));
    ed.querySelectorAll('[data-play]').forEach(b => b.onclick = () => startSong(+b.dataset.play));
    ed.querySelectorAll('[data-vdel]').forEach(b => b.onclick = () => { const i = +b.dataset.vdel; edit(() => { E.DB.del(S.id + ':' + S.vox[i]); delete S.vox[i]; }); });
    ed.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => edit(() => { S.mix.vox.fx = b.dataset.fx; }, { keep: true }));
  }
  async function record(i) {
    if (S.demo) return toast('Erst speichern: Demo-Songs nehmen keinen Gesang auf – leg einen neuen Song an.');
    stopAll(); try { await E.Rec.open(SET.hp); } catch (e) { overlay(`<h3>🎙️ Mikrofon gesperrt</h3><p>${/wv\)|RicoReWiApp|EasyGamesApp/i.test(navigator.userAgent) ? 'Erlaube das Mikrofon in den App-Berechtigungen und öffne das Spiel neu.' : 'Erlaube das Mikrofon im Browser (Schloss-Symbol neben der Adresse). Ist das Spiel eingebunden, öffne es direkt.'}</p><button class="btn nav" data-act="x">OK</button>`, { x: closeOv }); return; }
    const b = S.arr[i], len = C.blockSec(S, b);
    overlay(`<h3>🎙️ Aufnahme: ${C.SECS[b.sec].n}</h3><div class="count" id="recCount">3</div><p class="hint" id="recTxt">Gleich geht's los …</p><button class="btn red nav" data-act="x">■ Abbrechen</button>`, { x: () => { abort = true; finish(); }, esc: () => { abort = true; finish(); } });
    let abort = false, done = false;
    const finish = async () => { if (done) return; done = true; P.stop(); const blob = await E.Rec.stop(); closeOv(); if (abort || !blob) { E.Rec.close(); return; }
      try { const { buf, wav } = await E.toBuffer(blob, SET.lat / 1000); const id = 'v' + Date.now().toString(36); await E.DB.put(S.id + ':' + id, wav.buffer); voxMem[id] = buf; edit(() => { if (S.vox[i]) E.DB.del(S.id + ':' + S.vox[i]); S.vox[i] = id; }); toast('🎤 Aufgenommen! Mit ▶ anhören.'); } catch (e) { toast('Die Aufnahme konnte nicht gespeichert werden.'); }
      E.Rec.close(); };
    for (let n = 3; n > 0 && !abort; n--) { const el = $('recCount'); if (el) el.textContent = n; P.preview(S, { tr: 'drums', drum: n === 1 ? 'perc' : 'hat' }); await new Promise(r => setTimeout(r, 60000 / S.bpm)); }
    if (abort) return; const el = $('recCount'); if (el) { el.textContent = '● REC'; el.classList.add('on'); }
    const vox = await voxBufs(); delete vox[i]; E.Rec.start(); P.start(S, { mode: 'song', from: i, vox }); P.onEnd = null;
    const t0 = performance.now(), tick = () => { if (done) return; const t = (performance.now() - t0) / 1000, tx = $('recTxt'); if (tx) tx.textContent = fmt(t) + ' / ' + fmt(len); if (t >= len + .3) finish(); else requestAnimationFrame(tick); }; tick();
  }
  // Mixer
  function edMix() {
    const m = S.mix, N = { drums: '🥁 Drums', bass: '🎸 Bass', chords: '🎹 Akkorde', lead: '🎺 Melodie', vox: '🎤 Gesang' };
    const pre = { drums: C.PRESETS.kit, bass: C.PRESETS.bass, chords: C.PRESETS.chords, lead: C.PRESETS.lead };
    $('stEd').innerHTML = `<div class="mixer">${C.TRACKS.map(k => `<div class="strip"><b>${N[k]}</b>
        <label>Lautstärke<input type="range" class="nav" min="0" max="1.2" step="0.01" value="${m[k].vol}" data-vol="${k}"></label>
        <label>Panorama<input type="range" class="nav" min="-1" max="1" step="0.05" value="${m[k].pan}" data-pan="${k}"></label>
        <div class="ms"><button class="btn sm nav${m[k].mute ? ' red' : ''}" data-mute="${k}">M</button><button class="btn sm nav${m[k].solo ? ' gold' : ''}" data-solo="${k}">S</button></div>
        ${pre[k] ? `<select class="nav" data-pre="${k}" aria-label="Klang">${pre[k].map(([v, n]) => `<option value="${v}"${m[k].preset === v ? ' selected' : ''}>${n}</option>`).join('')}</select>` : `<select class="nav" data-vfx="1" aria-label="Effekt">${Object.keys(E.VOXFX).map(v => `<option value="${v}"${m.vox.fx === v ? ' selected' : ''}>${E.VOXFX[v]}</option>`).join('')}</select>`}</div>`).join('')}
      <div class="strip master"><b>🔊 Master</b><label>Lautstärke<input type="range" class="nav" min="0.2" max="1.2" step="0.01" value="${m.master.vol}" data-mvol="1"></label><label>Hall<input type="range" class="nav" min="0" max="0.8" step="0.01" value="${m.master.reverb}" data-rev="1"></label>
        <label>Swing<input type="range" class="nav" min="0" max="0.35" step="0.01" value="${S.swing}" data-swing="1"></label></div></div>
      <p class="hint">M = stumm, S = solo. Änderungen hörst du sofort – auch während der Song läuft.</p>`;
    const ed = $('stEd'), q = { quiet: true, noUndo: true };
    ed.querySelectorAll('[data-vol]').forEach(i => i.oninput = () => edit(() => { m[i.dataset.vol].vol = +i.value; }, q));
    ed.querySelectorAll('[data-pan]').forEach(i => i.oninput = () => edit(() => { m[i.dataset.pan].pan = +i.value; }, q));
    ed.querySelectorAll('[data-mute]').forEach(b => b.onclick = () => edit(() => { const t = m[b.dataset.mute]; t.mute = t.mute ? 0 : 1; }, { keep: true }));
    ed.querySelectorAll('[data-solo]').forEach(b => b.onclick = () => edit(() => { const t = m[b.dataset.solo]; t.solo = t.solo ? 0 : 1; }, { keep: true }));
    ed.querySelectorAll('[data-pre]').forEach(s => s.onchange = () => edit(() => { m[s.dataset.pre].preset = s.value; }, q));
    ed.querySelectorAll('[data-vfx]').forEach(s => s.onchange = () => edit(() => { m.vox.fx = s.value; }, q));
    ed.querySelector('[data-mvol]').oninput = e => edit(() => { m.master.vol = +e.target.value; }, q);
    ed.querySelector('[data-rev]').oninput = e => edit(() => { m.master.reverb = +e.target.value; }, q);
    ed.querySelector('[data-swing]').oninput = e => edit(() => { S.swing = +e.target.value; }, q);
  }

  /* ---------- Wiedergabe ---------- */
  function stopAll() { P.stop(); setPlayUi(); }
  async function startSong(from) { const vox = await voxBufs(from || 0); P.start(S, { mode: 'song', from: from || 0, vox }); P.onEnd = () => setPlayUi(); setPlayUi(); loop(); }
  function startLoop() { P.start(S, { mode: 'pat', sec }); P.onEnd = null; setPlayUi(); loop(); }
  function toggleSong() { if (P.on && P.mode === 'song') stopAll(); else startSong(0); }
  function toggleLoop() { if (P.on && P.mode === 'pat') stopAll(); else startLoop(); }
  function setPlayUi() { $('stPlay').textContent = P.on && P.mode === 'song' ? '■' : '▶'; $('stPlay').classList.toggle('on', P.on && P.mode === 'song'); $('stLoop').classList.toggle('on', P.on && P.mode === 'pat'); }
  let raf = 0, lastStep = -1;
  function loop() { cancelAnimationFrame(raf); const f = () => { if (!P.on || cur !== 'sStudio') { document.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now')); setPlayUi(); return; }
    const pos = P.pos(), tot = C.songSec(S); $('stPos').textContent = fmt(pos) + ' / ' + fmt(tot); const ph = $('stPh'); if (ph) ph.style.left = (P.mode === 'song' ? Math.min(100, pos / tot * 100) : -10) + '%';
    let step = -1; if (P.mode === 'pat') step = Math.floor(pos / (60 / S.bpm / 4)); else { let t = 0; for (let i = 0; i < S.arr.length; i++) { const d = C.blockSec(S, S.arr[i]); if (pos < t + d) { if (S.arr[i].sec === sec) step = Math.floor(((pos - t) % C.patSec(S)) / (60 / S.bpm / 4)); break; } t += d; } }
    if (step !== lastStep) { lastStep = step; document.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now')); if (step >= 0) document.querySelectorAll(`#stEd .cell[data-s="${step}"]`).forEach(c => c.classList.add('now')); }
    raf = requestAnimationFrame(f); }; f(); }
  $('stPlay').onclick = () => toggleSong(); $('stLoop').onclick = () => toggleLoop();
  $('stMenu').onclick = () => menu(); $('stUndo').onclick = () => doUndo(); $('stRedo').onclick = () => doRedo();
  $('stName').oninput = () => { if (!S) return; S.name = $('stName').value.slice(0, 60) || 'Mein Song'; persist(); };
  $('stName').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  $('stBpmM').onclick = e => edit(() => { S.bpm = Math.max(50, S.bpm - (e.shiftKey ? 10 : 1)); }, { keep: true });
  $('stBpmP').onclick = e => edit(() => { S.bpm = Math.min(200, S.bpm + (e.shiftKey ? 10 : 1)); }, { keep: true });
  $('stKey').onclick = () => overlay(`<h3>🎼 Tonart</h3><div class="chips">${C.NOTE.map((n, i) => `<button class="chip nav${i === S.key ? ' on' : ''}" data-act="k${i}">${n}</button>`).join('')}</div><div class="chips">${['dur', 'moll'].map(x => `<button class="chip nav${x === S.scale ? ' on' : ''}" data-act="${x}">${x === 'dur' ? '☀️ Dur' : '🌙 Moll'}</button>`).join('')}</div><p class="hint">Alle Noten wandern mit – der Song bleibt stimmig.</p><button class="btn nav" data-act="x">Fertig</button>`,
    Object.assign({ x: closeOv, dur: () => edit(() => { S.scale = 'dur'; }), moll: () => edit(() => { S.scale = 'moll'; }) }, ...C.NOTE.map((n, i) => ({ ['k' + i]: () => edit(() => { S.key = i; }) }))));
  $('stJury').onclick = () => jury(); $('stExport').onclick = () => exportOv();

  /* ---------- Export ---------- */
  const fileName = (s, ext) => (s.name || 'song').replace(/[^\wäöüÄÖÜß -]+/g, '').trim().replace(/\s+/g, '_').slice(0, 50) + ext;
  function download(name, bytes, type) { const blob = new Blob([bytes], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); return blob; }
  async function voxBytes() { const m = {}; for (const k of Object.keys(S.vox)) { const ab = await E.DB.get(S.id + ':' + S.vox[k]); if (ab) m[k] = ab; } return m; }
  function exportOv() {
    stopAll();
    overlay(`<h3>📤 Song exportieren</h3><p class="hint">„${esc(S.name)}“ · ${fmt(C.songSec(S))} · ${S.bpm} BPM · ${keyName(S)}</p>
      <div class="exp"><button class="btn gold nav" data-act="wav" data-focus>🎵 Song als WAV<small>fertig gemischt, 44,1 kHz Stereo – für Handy, PC, Streaming</small></button>
      <button class="btn nav" data-act="stems">🎚️ Einzelspuren (WAV)<small>Drums, Bass, Akkorde, Melodie, Gesang – zum Weiterbearbeiten</small></button>
      <button class="btn nav" data-act="midi">🎹 MIDI-Datei<small>alle Noten für GarageBand, FL Studio, Ableton …</small></button>
      <button class="btn nav" data-act="proj">💾 Projektdatei<small>zum Sichern oder auf einem anderen Gerät weiterbauen (mit Gesang)</small></button></div>
      <p class="hint" id="expMsg"></p><button class="btn nav" data-act="x">Schließen</button>`,
    { x: closeOv, wav: () => doWav(), stems: () => doStems(), midi: () => { download(fileName(S, '.mid'), C.midiFile(S), 'audio/midi'); msg('🎹 MIDI-Datei gespeichert'); },
      proj: async () => { const vb = await voxBytes(), vd = {}; Object.keys(vb).forEach(k => { const u = new Uint8Array(vb[k]); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); vd[S.vox[k]] = btoa(s); });
        download(fileName(S, '.beatstudio.json'), JSON.stringify({ app: 'beat-studio', v: 1, song: S, voxData: vd }), 'application/json'); msg('💾 Projektdatei gespeichert'); } });
    const msg = t => { const m = $('expMsg'); if (m) m.textContent = t; };
    const busy = on => $('ovBox').querySelectorAll('.exp .btn').forEach(b => { b.disabled = on; });
    async function doWav() { busy(true); msg('⏳ Song wird gerechnet … (' + fmt(C.songSec(S)) + ')'); try { const r = await E.render(S, { vox: await voxBytes(), onProgress: f => msg('⏳ Song wird gerechnet … ' + Math.round(f * 100) + ' %') }); const bytes = r.wav(); download(fileName(S, '.wav'), bytes, 'audio/wav'); msg('✅ ' + fileName(S, '.wav') + ' gespeichert (' + (bytes.length / 1048576).toFixed(1) + ' MB)'); LS.set('exported', (LS.get('exported', 0) || 0) + 1); } catch (e) { msg('⚠️ Export nicht möglich: ' + (e.message || e)); } busy(false); }
    async function doStems() { busy(true); try { const vb = await voxBytes(); for (const k of C.TRACKS) { if (k === 'vox' && !Object.keys(vb).length) continue; msg('⏳ Spur ' + k + ' …'); const r = await E.render(S, { only: k, vox: vb }); download(fileName(S, '_' + k + '.wav'), r.wav(), 'audio/wav'); await new Promise(res => setTimeout(res, 400)); } msg('✅ Einzelspuren gespeichert'); } catch (e) { msg('⚠️ Export nicht möglich: ' + (e.message || e)); } busy(false); }
  }

  /* ---------- Radio-Jury ---------- */
  function jury() {
    stopAll(); const r = C.rate(S), scores = LS.get('scores', {}), prev = scores[S.id] || 0;
    if (!S.demo) { scores[S.id] = Math.max(prev, r.score); LS.set('scores', scores); if (r.score > (LS.get('highscore', 0) || 0)) LS.set('highscore', r.score); }
    scr('sResult');
    $('resBox').innerHTML = `<header class="hd"><span></span><h2>🏆 Die Radio-Jury</h2><span></span></header>
      <div class="resTop"><div class="stars">${'★'.repeat(r.stars)}<span>${'★'.repeat(5 - r.stars)}</span></div><div class="score">${r.score}</div>
        <p class="chart">${r.chart ? `📻 Platz <b>${r.chart}</b> in den RicoReWi-Charts!` : '📻 Noch nicht in den Charts – da geht mehr!'}${r.score > prev && prev ? ' · 🆕 Neuer Bestwert' : ''}</p></div>
      <div class="crit">${Object.keys(r.crit).map(k => `<div><span>${C.CRIT_N[k]}</span><i><b style="width:${r.crit[k]}%"></b></i><em>${Math.round(r.crit[k])}</em></div>`).join('')}</div>
      <div class="says">${r.says.map(x => `<div class="say"><i>${x.j.img}</i><div><b>${x.j.name}</b> <small>${x.j.role}</small><p>„${esc(x.t)}“</p></div></div>`).join('')}</div>
      <div class="row end"><button class="btn nav" id="rMenu">☰ Menü</button><button class="btn nav" id="rExp">📤 Exportieren</button><button class="btn gold nav" id="rEdit" data-focus>🎛️ Weiter bearbeiten</button></div>`;
    $('rMenu').onclick = () => menu(); $('rEdit').onclick = () => openStudio(S); $('rExp').onclick = () => { openStudio(S); exportOv(); };
  }

  /* ---------- Anleitung & Einstellungen ---------- */
  function help() { scr('sHelp'); $('helpBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>❓ So geht's</h2><span></span></header><div class="help">
    <p><b>1. Song-Assistent:</b> Genre, Tonart, Tempo und Länge wählen – du bekommst sofort einen kompletten Song mit Intro, Strophe, Pre-Chorus, Refrain, Bridge und Outro.</p>
    <p><b>2. Mach ihn zu deinem:</b> Oben wählst du den Bereich (🧩 Aufbau, 🥁 Drums, 🎸 Bass, 🎹 Akkorde, 🎺 Melodie, 🎤 Gesang, 🎚️ Mixer), darunter den Abschnitt (Strophe, Refrain …). Jeder Abschnitt hat eigene Beats und Noten.</p>
    <p><b>Drums:</b> Raster mit 16tel-Schritten – antippen setzt einen Schlag. <b>Bass & Melodie:</b> Das Raster zeigt nur Töne der Tonart, helle Felder passen zum Akkord. Notenlänge unten wählen. <b>Akkorde:</b> Je Takt ein Akkord, oder eine bekannte Folge übernehmen.</p>
    <p><b>🎲 Neu</b> würfelt eine Spur neu, <b>📋 Kopieren</b> übernimmt sie aus einem anderen Abschnitt, <b>↶ ↷</b> macht rückgängig.</p>
    <p><b>🧩 Aufbau:</b> Abschnitte anhängen, verschieben, doppelt (×2 = 8 Takte) spielen. <b>🎤 Gesang:</b> Abschnitt wählen, aufnehmen – mit Hall, Echo, Radio- oder Roboter-Stimme.</p>
    <p><b>📤 Export:</b> fertiger Song als WAV, Einzelspuren, MIDI-Datei für andere Musikprogramme und Projektdatei. <b>🏆 Jury:</b> Rico, DJ Mia und Kalle bewerten Länge, Aufbau, Melodie, Groove, Abwechslung, Mix, Gesang und deine eigene Handschrift.</p>
    <p><b>Steuerung:</b> Maus/Touch · Leertaste = Song abspielen, L = Abschnitt in Schleife, 1–7 oder [ ] = Bereich wechseln, Pfeile + Enter im Raster, Strg+Z rückgängig, Esc zurück · Controller: Steuerkreuz + Ⓐ, Ⓧ = Abspielen, Ⓨ = Schleife, LB/RB = Bereich.</p></div>
    <div class="row end"><button class="btn gold nav" data-focus id="hOk">Los geht's</button></div>`; $('helpBox').querySelector('[data-back]').onclick = () => menu(); $('hOk').onclick = () => menu(); }
  function opts() { overlay(`<h3>⚙️ Einstellungen</h3>
      <p class="lbl">Raster-Ansicht</p><div class="chips">${[['auto', 'Automatisch'], ['all', 'Alle 4 Takte'], ['bar', 'Taktweise']].map(([k, n]) => `<button class="chip nav${SET.wide === k ? ' on' : ''}" data-act="w${k}">${n}</button>`).join('')}</div>
      <p class="lbl">Gesang aufnehmen</p><div class="chips"><button class="chip nav${SET.hp ? ' on' : ''}" data-act="hp">🎧 Ich nehme mit Kopfhörern auf</button></div>
      <p class="lbl">Aufnahme-Verzögerung ausgleichen: <b id="oLatV">${SET.lat} ms</b></p><input type="range" class="nav" id="oLat" min="0" max="400" step="10" value="${SET.lat}">
      <button class="btn gold nav" data-act="x">Fertig</button>`, { x: closeOv, wauto: () => setW('auto'), wall: () => setW('all'), wbar: () => setW('bar'), hp: b => { SET.hp = !SET.hp; saveSet(); b.classList.toggle('on', SET.hp); } });
    $('oLat').oninput = () => { SET.lat = +$('oLat').value; $('oLatV').textContent = SET.lat + ' ms'; saveSet(); };
    function setW(k) { SET.wide = k; saveSet(); $('ovBox').querySelectorAll('[data-act^="w"]').forEach(b => b.classList.toggle('on', b.dataset.act === 'w' + k)); } }

  /* ---------- Start ---------- */
  $('bPress').onclick = () => menu(); $('sTitle').addEventListener('click', e => { if (!e.target.closest('a,button')) menu(); });
  addEventListener('resize', () => { if (cur === 'sStudio' && SET.wide === 'auto') renderStudio(true); });
  (function boot() { const tips = ['Die Lautsprecher werden warm …', 'Kabel werden gesteckt …', 'Der Drum-Computer zählt ein …']; let p = 0;
    const t = setInterval(() => { p += 25; $('loadBar').style.width = Math.min(100, p) + '%'; $('loadTip').textContent = tips[Math.min(tips.length - 1, Math.floor(p / 35))]; if (p >= 100) { clearInterval(t); if (cur === 'sLoad') scr('sTitle'); } }, 120); })();
  window.BSApp = { get S() { return S; }, set S(v) { S = v; }, open: openStudio, wizard, menu, jury, setTab, edit, startSong, startLoop, stopAll, songs: () => SONGS, sec: v => { if (v) sec = v; return sec; } };
})();
