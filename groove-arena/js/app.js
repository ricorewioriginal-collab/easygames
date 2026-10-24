/* Groove Arena – Ablauf: Laden, Titel, Konsolen-Menü, Songs (Kategorien, iTunes-Suche, YouTube-Link), Tanz-Videos, Vorbereitung
 * (Video-Auswahl, Kamera/Handy, Takt), Tanzen (YouTube-Player + Vortänzer + Piktogramme + Bewertung), Ergebnis, Online & Handys.
 * Speichern: groove-arena-* (Einstellungen, Takt je Video, Bestwerte). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P_ = 'groove-arena-', C = GACore, V = GAView, M = GAMedia, SE = GASense, SN = GASound;
  const LS = { get(k, d) { try { const v = localStorage.getItem(P_ + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(P_ + k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sfx: true, vib: true, name: '', diff: 'normal', lat: 120, input: 'cam', skel: true, mirror: true }, LS.get('settings', {}));
  const ST = Object.assign({ songs: 0, stars: 0, best: 0, golds: 0, perfekt: 0 }, LS.get('stats', {}));
  const BEST = LS.get('best', {}), SYNC = LS.get('sync', {}), RECENT = LS.get('recent', []);
  const saveSet = () => LS.set('settings', SET), saveSt = () => { LS.set('stats', ST); if (ST.best > (LS.get('highscore', 0) || 0)) LS.set('highscore', ST.best); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches, sfx = n => { if (SET.sfx && SN.sfx[n]) SN.sfx[n](); }, vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const fmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  const CATS = {
    pop: ['Dua Lipa', 'Taylor Swift', 'Ed Sheeran', 'Harry Styles', 'The Weeknd', 'Miley Cyrus', 'Lady Gaga', 'Bruno Mars'], hiphop: ['Black Eyed Peas', 'Cro', 'Apache 207', 'Drake', 'Missy Elliott', 'Kendrick Lamar', 'Ski Aggu'],
    latin: ['Shakira', 'Bad Bunny', 'J Balvin', 'Daddy Yankee', 'Luis Fonsi', 'Karol G', 'Rosalía'], kpop: ['BTS', 'BLACKPINK', 'TWICE', 'Stray Kids', 'NewJeans', 'PSY', 'aespa'],
    disco: ['ABBA', 'Bee Gees', 'Boney M.', 'Michael Jackson', 'Madonna', 'Earth, Wind & Fire', 'Kool & The Gang'], kids: ['Kinderdisco', 'Volker Rosin', 'Simone Sommerland', 'Detlev Jöcker', 'Kinderlieder zum Tanzen', 'Herr H'],
    fitness: ['Zumba', 'Pitbull', 'David Guetta', 'Calvin Harris', 'Workout Hits', 'Avicii'], line: ['Line Dance', 'Dolly Parton', 'Shania Twain', 'Billy Ray Cyrus', 'Lil Nas X', 'Brooks & Dunn'],
    party: ['Party Hits', 'DJ Ötzi', 'Mickie Krause', 'Las Ketchup', 'Los Del Rio', 'Vengaboys'], schlager: ['Helene Fischer', 'Andrea Berg', 'Beatrice Egli', 'Vanessa Mai', 'Michelle', 'Wolfgang Petry'],
  };
  const VIDEO_CATS = [['🧸 Kids-Tanz', 'kids dance along'], ['💪 Zumba', 'zumba dance workout'], ['🔥 Trend-Tänze', 'easy trend dance tutorial'], ['✨ K-Pop (gespiegelt)', 'kpop dance mirrored'], ['🤠 Line Dance', 'line dance tutorial'], ['🧢 Hip-Hop Choreo', 'hip hop choreography beginner'], ['🪩 Disco-Workout', 'disco dance workout'], ['🎉 Party-Tänze', 'party dance tutorial']];
  const DIFF = { leicht: { n: '🧸 Leicht', armsOnly: true, k: .85 }, normal: { n: '🙂 Normal', armsOnly: false, k: 1 }, profi: { n: '🔥 Profi', armsOnly: false, k: 1.15 } };

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); setTimeout(() => { try { fitStage(); } catch (e) { } }, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const rootEl = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(rootEl().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse() || (cur === 'sDance' && !overlays().length)) return; const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero') || e.classList.contains('on')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); } function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) { const els = navEls(); if (!els.length) return; const a = document.activeElement; if (!els.includes(a)) { els[0].focus(); return; } const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9; for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, al = x * dx + y * dy; if (al <= 4) continue; const d = al + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } } if (best) { best.focus(); sfx('nav'); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); } }
  const BACK = { sMenu: () => scr('sTitle'), sSongs: () => toMenu(), sPrep: () => { closeSong(); scr('sSongs'); }, sHelp: () => toMenu(), sMine: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sResult: () => { const b = $('rsBtns').querySelector('.pri'); if (b) b.click(); }, sPhone: () => { netClose(); toMenu(); } };
  function back() { const ov = overlays().pop(); if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); } if (cur === 'sDance') return pause(); sfx('back'); if (BACK[cur]) BACK[cur](); }
  function seg(el, opts, val, cb) { el.innerHTML = opts.map(o => `<button class="sg nav${String(o.v) === String(val) ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join(''); el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(b.dataset.v); }); }

  /* ---------- Menü ---------- */
  function toMenu() { endDance(); closeSong(); netClose(); SE.Cam.stop(); SE.Motion.stop(); G = null; document.body.classList.remove('camOn', 'padOnly'); document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); $('menuStat').innerHTML = `<span>⭐ ${ST.stars}</span><span>🎵 ${ST.songs}</span><span>🏆 ${ST.best}</span>`; scr('sMenu'); stageIdle = true; }
  document.querySelectorAll('#mList .mi').forEach(b => { b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; }; b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'songs') songsScreen('pop'); else if (g === 'videos') songsScreen('videos'); else if (g === 'online') openOv('ovOnline'); else if (g === 'mine') mineScreen(); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') scr('sHelp'); }; });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i; $('helpBack').onclick = () => toMenu();
  // Einstellungen
  $('oSfx').checked = SET.sfx; $('oVib').checked = SET.vib; $('oSkel').checked = SET.skel; $('oMirror').checked = SET.mirror; $('oLat').value = SET.lat; $('oLatV').textContent = SET.lat + ' ms';
  $('oSfx').onchange = () => { SET.sfx = $('oSfx').checked; saveSet(); }; $('oVib').onchange = () => { SET.vib = $('oVib').checked; saveSet(); }; $('oSkel').onchange = () => { SET.skel = $('oSkel').checked; saveSet(); }; $('oMirror').onchange = () => { SET.mirror = $('oMirror').checked; saveSet(); document.body.classList.toggle('noMirror', !SET.mirror); };
  $('oLat').oninput = () => { SET.lat = +$('oLat').value; $('oLatV').textContent = SET.lat + ' ms'; saveSet(); }; $('optX').onclick = () => closeOv('ovOpts'); document.body.classList.toggle('noMirror', !SET.mirror);
  seg($('oDiff'), Object.keys(DIFF).map(v => ({ v, n: DIFF[v].n })), SET.diff, v => { SET.diff = v; saveSet(); });

  /* ---------- Songs & Tanz-Videos ---------- */
  let cat = 'pop', results = [], qBusy = 0;
  function songsScreen(c) {
    scr('sSongs'); cat = c || cat;
    $('cats').innerHTML = Object.keys(C.STYLES).map(k => `<button class="chip nav${k === cat ? ' on' : ''}" data-c="${k}">${C.STYLES[k]}</button>`).join('') + `<button class="chip nav vid${cat === 'videos' ? ' on' : ''}" data-c="videos">🎬 Tanz-Videos</button>`;
    $('cats').querySelectorAll('.chip').forEach(b => b.onclick = () => { sfx('nav'); songsScreen(b.dataset.c); });
    $('vcats').hidden = cat !== 'videos'; $('sq').placeholder = cat === 'videos' ? 'Tanz-Video suchen (z. B. „Kids Dance“) …' : 'Song oder Interpret suchen …';
    if (cat === 'videos') { $('vcats').innerHTML = VIDEO_CATS.map(([n, q]) => `<button class="chip nav small" data-q="${esc(q)}">${n}</button>`).join(''); $('vcats').querySelectorAll('.chip').forEach(b => b.onclick = () => videoSearch(b.dataset.q)); videoSearch(VIDEO_CATS[0][1]); }
    else catSongs(cat);
  }
  async function catSongs(c) { const terms = CATS[c].slice().sort(() => Math.random() - .5).slice(0, 3), my = ++qBusy; msg('🔎 Songs werden geladen …'); grid([]);
    try { const lists = await Promise.all(terms.map(t => M.songs(t, 12).catch(() => []))); if (my !== qBusy) return; const seen = new Set(), all = []; lists.forEach(l => l.slice(0, 8).forEach(s => { const k = (s.artist + s.title).toLowerCase(); if (!seen.has(k) && s.dur > 90) { seen.add(k); all.push(Object.assign(s, { style: c })); } })); results = all; grid(all); msg(all.length ? '' : 'Keine Songs gefunden – Internet an?'); } catch (e) { msg('📶 Keine Verbindung – prüfe das Internet.'); } }
  async function songSearch(q) { q = q.trim(); if (!q) return; const id = M.idFromUrl(q); if (id) return openVideo({ id, title: 'YouTube-Video', by: '' }, cat === 'videos' ? 'video' : 'song');
    const my = ++qBusy; msg('🔎 Suche …'); grid([]); try { const l = await M.songs(q, 25); if (my !== qBusy) return; results = l.filter(s => s.dur > 60).map(s => Object.assign(s, { style: C.styleOf(s.genre) })); grid(results); msg(results.length ? '' : 'Nichts gefunden – anderer Suchbegriff?'); } catch (e) { msg('📶 Keine Verbindung – prüfe das Internet.'); } }
  async function videoSearch(q) { const my = ++qBusy; msg('🔎 Tanz-Videos werden gesucht …'); grid([]); try { const l = await M.videos(q); if (my !== qBusy) return; results = l.map(v => Object.assign(v, { isVideo: true })); grid(results); msg(results.length ? '' : 'Nichts gefunden.'); } catch (e) { msg('📶 Die Video-Suche ist gerade nicht erreichbar. Du kannst einen YouTube-Link einfügen.'); } }
  function msg(t) { $('sMsg').textContent = t; $('sMsg').hidden = !t; }
  function grid(list) { $('grid').innerHTML = list.map((s, i) => { const b = s.isVideo ? BEST['v:' + s.id] : BEST[(s.artist + '|' + s.title).toLowerCase()]; return `<button class="card nav" data-i="${i}"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(s.isVideo ? s.thumb : s.cover)}"><b>${esc(s.title)}</b><small>${esc(s.isVideo ? s.by : s.artist)}${s.dur ? ' · ' + fmt(s.dur) : ''}</small>${b ? `<i class="st">${'★'.repeat(b.stars)}</i>` : ''}</button>`; }).join(''); $('grid').querySelectorAll('.card').forEach(b => b.onclick = () => { sfx('ok'); const s = results[+b.dataset.i]; if (s.isVideo) openVideo(s, 'video'); else openSong(s); }); $('grid').querySelectorAll('img').forEach(im => im.onerror = () => { im.style.visibility = 'hidden'; }); }
  $('sGo').onclick = () => cat === 'videos' && !M.idFromUrl($('sq').value) ? videoSearch($('sq').value) : songSearch($('sq').value);
  $('sq').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') $('sGo').click(); });
  $('sBack').onclick = () => toMenu();

  /* ---------- Vorbereitung ---------- */
  let S = null; // aktueller Song { song, vids, vi, mode: song|video, player, sync, sections }
  const songKey = s => (s.artist + '|' + s.title).toLowerCase();
  async function openSong(song) { S = { song, mode: 'song', vids: [], vi: 0 }; prep(); $('pInfo').textContent = '🔎 Passendes YouTube-Video wird gesucht …';
    M.lyrics(song).then(lrc => { if (S && S.song === song && lrc) { S.sections = C.sectionsFromLyrics(C.parseLRC(lrc), song.dur || 240); prepInfo(); } });
    try { S.vids = await M.videoFor(song); } catch (e) { S.vids = []; } if (!S || S.song !== song) return; if (!S.vids.length) { $('pInfo').innerHTML = '📶 Kein Video gefunden. Füge einen YouTube-Link ein: <button class="btn small nav" id="pLink">🔗 Link einfügen</button>'; $('pLink').onclick = askLink; return; } loadVid(0); }
  function openVideo(v, mode) { const pt = M.parseTitle(v.title); S = { song: { title: v.title, artist: v.by || pt.artist, dur: v.dur, style: mode === 'video' ? 'pop' : C.styleOf('') }, mode, vids: [v], vi: 0 }; prep(); loadVid(0); }
  function askLink() { const u = prompt('YouTube-Link oder Video-ID:'); const id = M.idFromUrl(u); if (!id) return toast('Das ist kein YouTube-Link'); S.vids.unshift({ id, title: S.song.title, by: '' }); loadVid(0); }
  function prep() { scr('sPrep'); document.body.classList.add('hasVideo'); $('pTitle').textContent = S.song.title; $('pArtist').textContent = (S.song.artist || '') + (S.song.dur ? ' · ' + fmt(S.song.dur) : ''); $('pCover').src = S.song.cover || ''; $('pCover').hidden = !S.song.cover;
    seg($('pInput'), [{ v: 'cam', n: '📷 Kamera' }, { v: 'phone', n: '📱 Handy in der Hand' }, { v: 'none', n: '👀 Nur tanzen' }], SET.input, v => { SET.input = v; saveSet(); inputReady(); });
    seg($('pDiff'), Object.keys(DIFF).map(v => ({ v, n: DIFF[v].n })), SET.diff, v => { SET.diff = v; saveSet(); });
    const styles = Object.keys(C.STYLES); seg($('pStyle'), styles.map(v => ({ v, n: C.STYLES[v] })), S.song.style || 'pop', v => { S.song.style = v; V.setLook(v); prepInfo(); }); V.setLook(S.song.style || 'pop'); $('pStyleRow').hidden = S.mode === 'video';
    $('pVids').innerHTML = ''; $('pGo').disabled = true; inputReady(); prepInfo(); }
  function prepInfo() { if (!S) return; const v = S.vids[S.vi], sy = v && SYNC[v.id]; $('pSync').textContent = S.mode === 'video' ? '🎬 Tanz-Video: du tanzt dem Video nach – bewertet werden Takt und Bewegung.' : sy ? `🎵 Takt gespeichert: ${sy.bpm.toFixed(1)} BPM ✓ ${S.sections ? '· 📜 Songaufbau aus dem Liedtext' : ''}` : `🎤 Der Takt wird beim Start über das Mikrofon erkannt (oder du klopfst mit). ${S.sections ? '· 📜 Songaufbau aus dem Liedtext' : ''}`;
    $('pLook').textContent = S.mode === 'video' ? '' : `💃 Vortänzer: ${V.LOOKS[S.song.style || 'pop'].name} · eigene Choreografie für genau diesen Song`; }
  function loadVid(i) { if (!S) return; S.vi = i; const v = S.vids[i]; if (S.player) S.player.destroy(); $('ytWrap').innerHTML = '<div id="yt"></div>'; S.ready = false; $('pGo').disabled = true; $('pInfo').textContent = '⏳ Video lädt …';
    S.player = M.player($('yt'), v.id, (ev, P) => { if (!S || S.player !== P) return; if (ev === 'ready') { S.ready = true; $('pGo').disabled = false; $('pInfo').textContent = '▶️ ' + (v.title || 'Video') + (v.by ? ' · ' + v.by : ''); if (!S.song.dur) S.song.dur = Math.round(P.duration()); prepInfo(); }
      if (ev === 'error') { if (P.err === 'api') { $('pInfo').textContent = '📶 YouTube ist gerade nicht erreichbar.'; return; } if (i + 1 < S.vids.length) { toast('Dieses Video darf nicht eingebettet werden – nächstes …'); loadVid(i + 1); } else $('pInfo').textContent = '🚫 Kein abspielbares Video gefunden.'; }
      if (ev === 'state' && D) danceState(P); });
    $('pVids').innerHTML = S.vids.slice(0, 6).map((x, k) => `<button class="vchip nav${k === i ? ' on' : ''}" data-k="${k}"><img alt="" referrerpolicy="no-referrer" src="${esc(x.thumb || ('https://i.ytimg.com/vi/' + x.id + '/default.jpg'))}"><span>${esc((x.title || '').slice(0, 42))}</span></button>`).join('') + '<button class="vchip nav" id="pLink2">🔗 Eigener Link</button>';
    $('pVids').querySelectorAll('.vchip[data-k]').forEach(b => b.onclick = () => loadVid(+b.dataset.k)); $('pLink2').onclick = askLink; }
  function closeSong() { if (S && S.player) S.player.destroy(); S = null; $('ytWrap').innerHTML = ''; document.body.classList.remove('hasVideo'); }
  async function inputReady() { const i = SET.input; $('pCamBox').hidden = i !== 'cam'; $('pPhoneTip').hidden = i !== 'phone';
    if (i === 'cam' && !SE.Cam.on) { $('camMsg').textContent = '📷 Kamera wird gestartet …'; try { await SE.Cam.start($('camv')); document.body.classList.add('camOn'); $('camMsg').textContent = 'Stell dich so hin, dass du von Kopf bis Knie zu sehen bist.'; } catch (e) { $('camMsg').textContent = '🚫 ' + (SE.Cam.err || 'Kamera nicht verfügbar') + ' – wähle „Handy in der Hand“ oder „Nur tanzen“.'; } }
    if (i !== 'cam' && SE.Cam.on) { SE.Cam.stop(); document.body.classList.remove('camOn'); }
    if (i === 'phone' && !SE.Motion.on) { try { await SE.Motion.start(); } catch (e) { toast('Bewegungssensor nicht erlaubt'); } } }
  $('pBack').onclick = () => { closeSong(); SE.Cam.stop(); document.body.classList.remove('camOn'); scr('sSongs'); }; $('pGo').onclick = () => startDance();

  /* ---------- Tanzen ---------- */
  let D = null; // { ch, hits, hi, score, max, combo, counts, golds, locked, t, … }
  function startDance(remote) {
    if (!S || !S.player) return; const v = S.vids[S.vi], sy = remote ? { bpm: remote.bpm, beat0: remote.beat0 } : SYNC[v.id];
    D = { v, mode: S.mode, input: remote ? remote.input : SET.input, diff: DIFF[SET.diff], score: 0, max: 0, combo: 0, best: 0, counts: { perfekt: 0, super: 0, gut: 0, ok: 0, daneben: 0 }, golds: 0, hi: 0, win: null, locked: false, est: 0, energy: [], beatScored: -1, remote: !!remote, taps: [] };
    scr('sDance'); document.body.classList.add('dancing'); fitStage(); SN.ctx();
    if (!remote) { S.player.seek(0); S.player.play(); }
    if (sy) lock(sy.bpm, sy.beat0, true); else if (!remote) { setSync('🎤 Ich höre auf den Takt … (oder klopf mit: Leertaste / 👆)'); SE.Mic.start(() => S.player.playing() ? S.player.time() : 0).catch(() => setSync('👆 Mikrofon aus – klopf 8× im Takt mit (Leertaste oder 👆)')); }
    $('dTitle').textContent = S.song.title; $('dHud').hidden = false; $('dLive').innerHTML = '';
    if (NET && NET.role === 'host') netSong();
  }
  function lock(bpm, beat0, saved) {
    const lat = saved ? 0 : SET.lat / 1000; D.locked = true; D.bpm = bpm; D.beat0 = beat0 - lat; const dur = S.song.dur || S.player.duration() || 240;
    D.ch = C.choreograph({ id: D.v.id, dur, bpm, beat0: D.beat0, style: S.song.style, sections: S.sections }); D.hits = D.mode === 'video' ? [] : C.hits(D.ch); D.hi = 0; D.max = D.hits.length * 100 + D.ch.golds * 150;
    const now = S.player.time(); while (D.hi < D.hits.length && D.hits[D.hi].t < now + .3) D.hi++;
    SYNC[D.v.id] = { bpm, beat0: D.beat0 }; LS.set('sync', SYNC); setSync(saved ? '' : `✅ Takt gefunden: ${bpm.toFixed(1)} BPM`); if (!saved) setTimeout(() => setSync(''), 2500); sfx('lock');
    if (NET && NET.role === 'host') netSong();
  }
  function setSync(t) { $('dSync').textContent = t; $('dSync').hidden = !t; }
  function tap() { if (!D) return; const t = S.player.time(); D.taps.push(t); D.taps = D.taps.filter(x => t - x < 6); sfx('tap'); flash('👆'); if (D.taps.length >= 8) { const r = C.tapTempo(D.taps); if (r) { SE.Mic.stop(); lock(r.bpm, r.beat0 + SET.lat / 1000 * .4); D.taps = []; } } else setSync(`👆 Weiter klopfen … ${D.taps.length}/8`); }
  $('dTap').onclick = () => tap(); $('dNudgeL').onclick = () => nudge(-.03); $('dNudgeR').onclick = () => nudge(.03);
  function nudge(d) { if (!D || !D.locked) return; D.beat0 += d; D.ch.beat0 = D.beat0; D.hits = D.mode === 'video' ? [] : C.hits(D.ch); const now = S.player.time(); D.hi = 0; while (D.hi < D.hits.length && D.hits[D.hi].t < now + .3) D.hi++; SYNC[D.v.id] = { bpm: D.bpm, beat0: D.beat0 }; LS.set('sync', SYNC); toast((d > 0 ? '▶ später ' : '◀ früher ') + Math.abs(d * 1000) + ' ms'); if (NET && NET.role === 'host') netSong(); }
  function danceState(P) { if (P.ended() && D && !D.over) finish(); }
  function endDance() { if (D) { SE.Mic.stop(); } D = null; document.body.classList.remove('dancing'); $('dHud').hidden = true; }
  // Bewertung je Treffer (Kamera: beste Übereinstimmung im Zeitfenster, Handy: Bewegungsverlauf)
  function scoreTick(t) {
    const h = D.hits[D.hi]; if (!h) return;
    if (D.input === 'cam' && SE.Cam.lm && t > h.t - .25) { const cv = C.coachVec(C.at(D.ch, h.t).pose), uv = C.userVec(SE.Cam.lm, SE.Cam.aspect), s = C.compare(cv, uv, D.diff.armsOnly); if (s >= (D.win || 0)) { D.win = s; D.winUv = uv; D.winCv = cv; } }
    if (t > h.t + .35) { let s = 0;
      if (D.input === 'cam') { s = D.win || 0; if (D.winUv && D.lastUv && C.change(D.winCv, D.lastCv) > .55 && C.change(D.winUv, D.lastUv) < .15) s *= .45; if (D.winUv) { D.lastUv = D.winUv; D.lastCv = D.winCv; } D.winUv = null; }
      else if (D.input === 'phone') { const nowP = performance.now() / 1000, off = nowP - t, coach = C.handAccel(D.ch, h.t - .4, h.t + .3, 30), ph = SE.Motion.series(h.t - .4 + off, h.t + .3 + off, 30); s = SE.Motion.alive() ? C.motionScore(coach, ph) : 0; }
      else s = .75;
      s = Math.min(1, s * (D.diff.k > 1 ? 1 / D.diff.k + .1 : 1 / D.diff.k)); if (SET.diff === 'profi') s = Math.max(0, s - .06);
      award(s, h); D.win = null; D.hi++; }
  }
  function award(s, h) { const r = C.rate(s), pts = Math.round(r[3] * 33.4); D.score += pts; D.counts[r[1]]++; if (r[1] === 'perfekt' || r[1] === 'super') D.combo++; else D.combo = 0; D.best = Math.max(D.best, D.combo);
    if (h.gold && (r[1] === 'perfekt' || r[1] === 'super')) { D.score += 150; D.golds++; V.gold(); flash('✨ GOLD!', 'gold'); sfx('gold'); vib([30, 30, 60]); } else if (D.input !== 'none') { flash(r[2] + (D.combo >= 5 ? ' ×' + D.combo : ''), r[1]); if (r[1] === 'perfekt') sfx('perfect'); }
    if (NET) netSend({ t: 'sc', s: D.score, r: r[1] }); }
  let flT = 0; function flash(t, cls) { const e = $('dFlash'); e.textContent = t; e.className = 'fl ' + (cls || ''); void e.offsetWidth; e.classList.add('pop'); clearTimeout(flT); flT = setTimeout(() => { e.className = 'fl'; }, 700); }
  function stars(sc, mx) { const p = mx ? sc / mx : 0; return p >= .9 ? 5 : p >= .76 ? 4 : p >= .6 ? 3 : p >= .4 ? 2 : p >= .2 ? 1 : 0; }
  function danceFrame(dt) {
    const t = S.player.time(); if (!S.player.playing() && !D.remote) { V.pose(C.idle(t, D.ch), dt); return; }
    if (D.remote) { /* Zeit kommt vom Gastgeber */ }
    if (!D.locked && SE.Mic.on && t > 6 && t - D.est > 1.5) { D.est = t; const r = SE.Mic.estimate(); if (r && r.conf > .2 && t > 7.5) { SE.Mic.stop(); lock(r.bpm, r.beat0); } else if (t > 20 && r) { SE.Mic.stop(); lock(r.bpm, r.beat0); } }
    const ch = D.ch; if (!ch) { V.pose(C.idle(t, null), dt); V.beat((t * 2) % 1); drawPictos(t); return; }
    const a = C.at(ch, t); V.pose(D.mode === 'video' ? C.idle(t, ch) : a.pose, dt); const bph = ((a.bt % 1) + 1) % 1; V.beat(bph);
    if (D.mode !== 'video') scoreTick(t);
    if (D.mode === 'video') videoScore(t, a);
    drawPictos(t); hud(t);
    if (t > (S.song.dur || 1e9) - .5 && !D.over && !D.remote) finish();
  }
  // Tanz-Video: Rhythmus (Bewegungs-Akzente auf den Schlägen)
  function videoScore(t, a) { const e = D.input === 'cam' ? SE.Cam.energy() * 3 : D.input === 'phone' ? ((SE.Motion.buf[SE.Motion.buf.length - 1] || {}).m || 0) / 12 : 0; D.energy.push({ t, e }); if (D.energy.length > 120) D.energy.shift();
    const b = Math.floor(a.bt) - 1; if (b > D.beatScored && b >= 0) { D.beatScored = b; if (b % 2) return; const bt = D.ch.beat0 + b * D.ch.spb, s = D.input === 'none' ? .7 : C.rhythmScore(D.energy, bt); D.max += 100; award(s, { t: bt, gold: b % 32 === 30 }); } }
  // Piktogramm-Leiste: kommende Moves wandern zur Markierung
  function drawPictos(t) {
    const cv = $('pics'), x = cv.getContext('2d'), w = cv.width = cv.clientWidth * (devicePixelRatio > 1 ? 1.5 : 1), h = cv.height = cv.clientHeight * (devicePixelRatio > 1 ? 1.5 : 1); x.clearRect(0, 0, w, h);
    if (!D || !D.ch || D.mode === 'video') { x.fillStyle = 'rgba(255,255,255,.7)'; x.font = `600 ${h * .22}px Fredoka, sans-serif`; x.textAlign = 'center'; x.fillText(D && D.mode === 'video' ? '🎬 Tanz dem Video nach – im Takt!' : '🎵 Takt wird erkannt …', w / 2, h * .6); return; }
    const ch = D.ch, bt = (t - ch.beat0) / ch.spb, pxB = h * .42, nowX = w * .16, sz = Math.round(h * .86);
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(nowX - 2, 0, 4, h);
    const curI = Math.max(0, C.at(ch, t).i); for (let i = Math.max(0, curI - 1), shown = 0; i < ch.list.length && shown < 10; i++) { const it = ch.list[i]; if (it.sec === 'intro' || !it.mv.hits.length) continue; const pk = it.mv.hits.length > 1 ? it.mv.hits[1] : it.mv.hits[0], hb = it.b0 + it.mv.hits[0], X0 = nowX + (hb - bt) * pxB; if (X0 > w + sz) break; if (X0 < -sz) continue; const hit = pk, hh = { gold: it.gold };
      const col = hh.gold ? '#ffd23a' : V.look.glow, img = V.picto(it.mv, hit, col, sz); const a = X0 < nowX ? Math.max(0, 1 - (nowX - X0) / (sz * .8)) : 1; x.globalAlpha = a; x.drawImage(img, X0 - sz / 2, (h - sz) / 2, sz, sz); x.globalAlpha = 1; shown++; }
  }
  function hud(t) { const st = stars(D.score, D.max * .8 || 1); $('dScore').textContent = D.score; $('dStars').innerHTML = '★★★★★'.split('').map((s, i) => `<i class="${i < st ? 'on' : ''}">★</i>`).join(''); $('dBar').style.width = Math.min(100, D.max ? D.score / (D.max * .8) * 100 : 0) + '%';
    $('dTime').textContent = fmt(t) + ' / ' + fmt(S.song.dur || 0); $('dCombo').textContent = D.combo >= 3 ? '🔥 ' + D.combo : ''; $('dSec').textContent = D.ch && D.ch.list.length ? ({ intro: '🎶 Intro', verse: '🎤 Strophe', chorus: '🔁 Refrain', bridge: '🌉 Bridge', outro: '🏁 Finale' }[(D.ch.list[C.at(D.ch, t).i] || {}).sec] || '') : '';
    if (SET.skel) drawSkel(); }
  function drawSkel() { const cv = $('camSk'); if (!cv || D.input !== 'cam') return; const v = $('camv'), w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight, x = cv.getContext('2d'); x.clearRect(0, 0, w, h); const lm = SE.Cam.lm; if (!lm) return; const X = p => (SET.mirror ? 1 - p.x : p.x) * w, Y = p => p.y * h;
    x.strokeStyle = V.look.glow; x.lineWidth = 3; x.lineCap = 'round'; [[11, 13, 15], [12, 14, 16], [23, 25, 27], [24, 26, 28], [11, 12, 24, 23, 11]].forEach(c => { x.beginPath(); c.forEach((i, k) => k ? x.lineTo(X(lm[i]), Y(lm[i])) : x.moveTo(X(lm[i]), Y(lm[i]))); x.stroke(); }); void v; }
  function finish() {
    if (!D || D.over) return; D.over = true; S.player.pause(); const st = stars(D.score, D.max * .8 || 1), key = D.mode === 'video' ? 'v:' + D.v.id : songKey(S.song), prev = BEST[key];
    if (D.input !== 'none') { if (!prev || D.score > prev.score) BEST[key] = { score: D.score, stars: st, title: S.song.title, artist: S.song.artist, id: D.v.id, style: S.song.style, mode: D.mode, cover: S.song.cover || '' }; LS.set('best', BEST); ST.songs++; ST.stars += st; ST.golds += D.golds; ST.perfekt += D.counts.perfekt; if (D.score > ST.best) ST.best = D.score; saveSt(); }
    const rec = { title: S.song.title, artist: S.song.artist, id: D.v.id, style: S.song.style, mode: D.mode, cover: S.song.cover || '', dur: S.song.dur }; const ri = RECENT.findIndex(r => r.id === rec.id); if (ri >= 0) RECENT.splice(ri, 1); RECENT.unshift(rec); RECENT.length = Math.min(RECENT.length, 30); LS.set('recent', RECENT);
    const c = D.counts, nb = !prev || D.score > prev.score; sfx('finish'); if (NET) netSend({ t: 'end', s: D.score, st });
    $('rsT').textContent = st >= 5 ? '🌟 Superstar!' : st >= 3 ? '🎉 Stark getanzt!' : '💃 Geschafft!'; $('rsBody').innerHTML = `<div class="bigStars">${'★'.repeat(st)}<span>${'★'.repeat(5 - st)}</span></div><div class="bigNum">${D.score}</div>${nb && D.input !== 'none' ? '<p class="hint">🆕 Neuer Bestwert!</p>' : ''}<div class="rgrid"><span class="perfekt">PERFEKT <b>${c.perfekt}</b></span><span class="super">SUPER <b>${c.super}</b></span><span class="gut">GUT <b>${c.gut}</b></span><span class="ok">OK <b>${c.ok}</b></span><span class="daneben">DANEBEN <b>${c.daneben}</b></span><span class="gold">GOLD <b>${D.golds}</b></span></div><p class="hint">Beste Combo: ${D.best} · ${esc(S.song.title)}</p>` + (netBoard() || '');
    $('rsBtns').innerHTML = '<button class="btn nav" id="rsMenu">☰ Menü</button><button class="btn nav" id="rsSongs">🎵 Anderer Song</button><button class="btn pri big nav" id="rsAgain">↻ Nochmal</button>'; scr('sResult');
    $('rsMenu').onclick = () => toMenu(); $('rsSongs').onclick = () => { endDance(); closeSong(); songsScreen(cat); }; $('rsAgain').onclick = () => { endDance(); scr('sPrep'); $('pGo').disabled = !S.ready; };
    endDance();
  }
  // Pause
  function pause() { if (!D) return; S.player.pause(); openOv('ovPause'); } function resume() { closeOv('ovPause'); if (D && !D.remote) S.player.play(); }
  $('dPause').onclick = () => pause(); $('paGo').onclick = () => resume(); $('paQuit').onclick = () => { closeOv('ovPause'); if (D) { D.over = true; S.player.pause(); } endDance(); scr('sPrep'); $('pGo').disabled = !(S && S.ready); };
  $('paRe').onclick = () => { closeOv('ovPause'); if (S && S.vids[S.vi]) { delete SYNC[S.vids[S.vi].id]; LS.set('sync', SYNC); } endDance(); startDance(); };

  /* ---------- Meine Songs ---------- */
  function mineScreen() { scr('sMine'); const list = RECENT.slice(0, 24); $('mineGrid').innerHTML = list.length ? list.map((r, i) => { const b = BEST[r.mode === 'video' ? 'v:' + r.id : (r.artist + '|' + r.title).toLowerCase()]; return `<button class="card nav" data-i="${i}"><img alt="" referrerpolicy="no-referrer" src="${esc(r.cover || 'https://i.ytimg.com/vi/' + r.id + '/mqdefault.jpg')}"><b>${esc(r.title)}</b><small>${esc(r.artist || '')}</small>${b ? `<i class="st">${'★'.repeat(b.stars)} · ${b.score}</i>` : ''}</button>`; }).join('') : '<p class="hint">Noch keine Songs getanzt – leg los! 💃</p>';
    $('mineGrid').querySelectorAll('.card').forEach(b => b.onclick = () => { const r = list[+b.dataset.i]; S = { song: { title: r.title, artist: r.artist, dur: r.dur, style: r.style, cover: r.cover }, mode: r.mode || 'song', vids: [{ id: r.id, title: r.title, by: r.artist }], vi: 0 }; prep(); loadVid(0); if (r.mode !== 'video') M.lyrics(S.song).then(l => { if (S && l) { S.sections = C.sectionsFromLyrics(C.parseLRC(l), r.dur || 240); prepInfo(); } }); }); }
  $('mineBack').onclick = () => toMenu();

  /* ---------- Eingaben ---------- */
  addEventListener('keydown', e => { if (e.code !== 'Tab') document.body.classList.add('kbd'); if (e.target && e.target.tagName === 'INPUT') return;
    if (e.code === 'Escape') { e.preventDefault(); back(); return; }
    if (cur === 'sDance' && !overlays().length) { if (e.code === 'Space') { e.preventDefault(); tap(); } if (e.code === 'BracketLeft' || e.code === 'Comma') nudge(-.03); if (e.code === 'BracketRight' || e.code === 'Period') nudge(.03); if (e.code === 'KeyP') pause(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code]; if (d) { e.preventDefault(); moveFocus(d[0], d[1]); } });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  let padPrev = {}, padDir = null, padT = 0;
  function pad(dt) { let gp = null; try { gp = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).find(p => p && p.connected); } catch (e) { } if (!gp) return; const b = gp.buttons || [], ax = gp.axes || [], pr = n => !!(b[n] && (b[n].pressed || b[n].value > .5)), now = { a: pr(0), b: pr(1), st: pr(9), x: pr(2) }, edge = k => now[k] && !padPrev[k];
    if (cur === 'sDance' && !overlays().length) { if (edge('st')) pause(); if (edge('a')) tap(); padPrev = now; return; }
    let x = Math.abs(ax[0] || 0) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1] || 0) > .5 ? Math.sign(ax[1]) : 0; if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1; if (x || z || now.a || now.b) document.body.classList.add('kbd');
    const key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null; if (key && (key !== padDir || padT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padT = key !== padDir ? .3 : .12; } padDir = key; padT -= dt;
    if (edge('a')) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } } if (edge('b')) back(); if (edge('st') && !$('ovPause').hidden) resume(); padPrev = now; }

  /* ---------- Online & Handys (PeerJS über ../cloud/fire-peer.js) ---------- */
  // Der Gastgeber spielt das Video ab und schickt Song, Takt und Zeit. Jedes Gerät rechnet die Choreo selbst und bewertet lokal
  // (Handy-Bewegung oder Kamera) – zurück kommen nur die Punkte. Von woanders: Video läuft auf dem eigenen Gerät mit.
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'groove-arena-', N = { role: '', code: '', peer: null, conns: new Map() }, libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer); N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) { conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); }); conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); }); const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); }; conn.on('close', gone); conn.on('error', gone); }
    N.host = async function () { N.close(); await N.loadPeer(); for (let k = 0; k < 6 && !N.peer; k++) { const code = mkCode(); const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false; p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); }); p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); }); if (ok === 'err') throw new Error('broker'); } if (!N.peer) throw new Error('code'); N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } }); return N.code; };
    N.join = async function (code) { code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer(); await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000); p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); }); p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); }); };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) try { c.send(d); } catch (e) { } }; N.send = d => { for (const [, c] of N.conns) if (c.open) try { c.send(d); } catch (e) { } };
    N.close = () => { for (const [, c] of N.conns) try { c.close(); } catch (e) { } N.conns.clear(); if (N.peer) try { N.peer.destroy(); } catch (e) { } N.peer = null; N.role = ''; N.code = ''; }; return N;
  }
  const netErr = e => ({ nocode: 'Diesen Code gibt es nicht (mehr).', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar.');
  let NET = null; const PL = new Map(); // Gastgeber: Mitspieler { name, col, score, st, r }
  const COLS = ['#ff3aa8', '#3ad8ff', '#ffd23a', '#3ae07a', '#b06aff', '#ff8a3a', '#ff5a5a', '#5a8aff'];
  function netClose() { if (NET) NET.close(); NET = null; PL.clear(); clearInterval(clkT); }
  const netSend = m => { if (NET) NET.send(m); };
  $('onX').onclick = () => closeOv('ovOnline'); $('onHost').onclick = () => { closeOv('ovOnline'); hostLobby(); }; $('onJoin').onclick = () => { closeOv('ovOnline'); joinScreen(''); };
  function hostLobby() { netClose(); scr('sLobby'); $('code').textContent = '····'; $('qr').textContent = '…'; $('url').textContent = ''; $('lobbyMsg').textContent = 'Die Tanzfläche wird vorbereitet …'; drawLobby();
    NET = mkNet({ onMsg: hostMsg, onLeave: id => { const p = PL.get(id); PL.delete(id); drawLobby(); if (p) toast('📴 ' + p.name + ' ist weg'); } });
    NET.host().then(async code => { $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Handys & Freunde: QR-Code scannen oder Code eingeben – von überall!'; try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; } }).catch(e => { $('lobbyMsg').textContent = netErr(e); }); }
  function drawLobby() { $('lobbyList').innerHTML = Array.from(PL.values()).map(p => `<div class="seat" style="--pc:${p.col}"><i></i><b>${esc(p.name)}</b><small>${p.where === 'remote' ? '🌍' : '📱'}</small></div>`).join('') || '<p class="hint">Noch niemand verbunden – du kannst auch allein loslegen.</p>'; }
  function hostMsg(id, m) {
    if (m.t === 'hi') { if (PL.size >= 8) return NET.sendTo(id, { t: 'full' }); PL.set(id, { name: String(m.name || 'Gast').slice(0, 12), col: COLS[PL.size % COLS.length], score: 0, where: m.where === 'remote' ? 'remote' : 'room', r: '' }); drawLobby(); sfx('ok'); toast('🌐 ' + m.name + ' tanzt mit!'); if (D && D.locked) netSong(id); return; }
    if (m.t === 'ping') return NET.sendTo(id, { t: 'pong', c: m.c, h: S && S.player ? S.player.time() : 0, pl: S && S.player ? S.player.playing() : false });
    const p = PL.get(id); if (!p) return; if (m.t === 'sc') { p.score = m.s | 0; p.r = m.r; liveBoard(); } if (m.t === 'end') { p.score = m.s | 0; p.st = m.st | 0; }
  }
  function netSong(to) { if (!NET || NET.role !== 'host' || !D || !D.locked) return; const m = { t: 'song', id: D.v.id, title: S.song.title, artist: S.song.artist, dur: S.song.dur, style: S.song.style, sections: S.sections || null, bpm: D.bpm, beat0: D.beat0, mode: D.mode }; if (to) NET.sendTo(to, m); else NET.send(m); }
  function liveBoard() { if (!D) return; const list = Array.from(PL.values()).sort((a, b) => b.score - a.score); $('dLive').innerHTML = list.map(p => `<div style="--pc:${p.col}"><i></i>${esc(p.name)} <b>${p.score}</b>${p.r ? `<em class="${p.r}">${p.r === 'perfekt' ? '✨' : ''}</em>` : ''}</div>`).join(''); }
  function netBoard() { if (!PL.size) return ''; const me = { name: SET.name || 'Du', col: '#ffffff', score: D ? D.score : 0 }; return '<div class="board">' + Array.from(PL.values()).concat(D && D.input !== 'none' ? [me] : []).sort((a, b) => b.score - a.score).map((p, i) => `<div class="rsl" style="--pc:${p.col}"><span>${i + 1}. ${esc(p.name)}</span><b>${p.score}</b></div>`).join('') + '</div>'; }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbGo').onclick = () => songsScreen('pop'); $('lbBack').onclick = () => { netClose(); toMenu(); };
  // Gast (Handy-Controller oder von woanders)
  let G = null, clkT = 0;
  function joinScreen(code) { netClose(); scr('sPhone'); $('jWrap').hidden = false; $('phPlay').hidden = true; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Gib den Code vom Bildschirm ein.'; seg($('jWhere'), [{ v: 'room', n: '📱 Ich bin im selben Raum' }, { v: 'remote', n: '🌍 Ich bin woanders' }], 'room', v => { $('jWhere').dataset.v = v; }); $('jWhere').dataset.v = 'room'; }
  $('jBack').onclick = () => toMenu();
  $('jGo').onclick = async () => { const name = $('jName').value.trim().slice(0, 12) || 'Gast', where = $('jWhere').dataset.v || 'room'; SET.name = name; saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; SN.ctx();
    if (where === 'room') { document.body.classList.add('padOnly'); try { await SE.Motion.start(); } catch (e) { } }
    NET = mkNet({ onMsg: guestMsg, onLeave: () => { toast('📴 Verbindung verloren'); toMenu(); } });
    try { await NET.join($('jCode').value); G = { where, off: 0, rtt: .2, ht: 0, hat: 0, playing: false, song: null }; NET.send({ t: 'hi', name, where }); $('jWrap').hidden = true; $('phPlay').hidden = false; phoneUi('⏳ Warte auf den nächsten Song …', ''); clkT = setInterval(ping, 1000); ping(); } catch (e) { $('jMsg').textContent = netErr(e); }
    $('jGo').disabled = false; };
  function ping() { if (NET) NET.send({ t: 'ping', c: performance.now() }); }
  function phoneUi(a, b) { $('phMsg').textContent = a; $('phSub').textContent = b; }
  function guestMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = 'Die Tanzfläche ist voll (8).'; return; }
    if (m.t === 'pong') { const now = performance.now(), rtt = (now - m.c) / 1000; G.rtt = G.rtt * .7 + rtt * .3; G.ht = m.h + rtt / 2; G.hat = now; G.playing = m.pl; return; }
    if (m.t === 'song') { G.song = m; const ch = C.choreograph({ id: m.id, dur: m.dur || 240, bpm: m.bpm, beat0: m.beat0, style: m.style, sections: m.sections }); G.ch = ch; G.hits = m.mode === 'video' ? [] : C.hits(ch); G.hi = 0; G.score = 0; G.combo = 0; V.setLook(m.style || 'pop'); phoneUi('💃 ' + m.title, G.where === 'room' ? '📱 Halte das Handy in der RECHTEN Hand und tanz mit!' : '🎬 Tanz mit dem Video auf deinem Gerät mit.');
      if (G.where === 'remote' && (!S || !S.vids || S.vids[0].id !== m.id)) { S = { song: { title: m.title, artist: m.artist, dur: m.dur, style: m.style }, mode: m.mode, vids: [{ id: m.id, title: m.title }], vi: 0, sections: m.sections, remoteSong: m }; $('ytWrap').innerHTML = '<div id="yt"></div>'; document.body.classList.add('hasVideo'); S.player = M.player($('yt'), m.id, ev => { if (ev === 'ready') { $('phJoinVid').hidden = false; } }); }
      return; }
  }
  $('phJoinVid').onclick = () => { if (!S || !S.player) return; $('phJoinVid').hidden = true; const m = S.remoteSong; S.player.seek(Math.max(0, gTime())); S.player.play(); startDance({ bpm: m.bpm, beat0: m.beat0, input: SET.input === 'phone' ? 'phone' : 'cam' }); };
  const gTime = () => G ? G.ht + (G.playing ? (performance.now() - G.hat) / 1000 : 0) : 0;
  function guestFrame(dt) { // Handy-Controller im selben Raum: nur Bewegung bewerten
    if (!G || !G.ch || G.where !== 'room') return; const t = gTime(); const h = G.hits[G.hi]; if (!h) return;
    if (t > h.t + .35) { const off = performance.now() / 1000 - t, coach = C.handAccel(G.ch, h.t - .4, h.t + .3, 30), ph = SE.Motion.series(h.t - .4 + off, h.t + .3 + off, 30), s = SE.Motion.alive() ? C.motionScore(coach, ph) : 0, r = C.rate(s); G.score += Math.round(r[3] * 33.4) + (h.gold && r[3] >= 2 ? 150 : 0); G.combo = r[3] >= 2 ? G.combo + 1 : 0; G.hi++;
      $('phRate').textContent = h.gold && r[3] >= 2 ? '✨ GOLD!' : r[2]; $('phRate').className = 'phRate ' + (h.gold && r[3] >= 2 ? 'gold' : r[1]); $('phScore').textContent = G.score; if (r[3] >= 2) vib(20); NET.send({ t: 'sc', s: G.score, r: r[1] }); }
    while (G.hits[G.hi] && G.hits[G.hi].t < t - 1.5) G.hi++; // aufholen, falls das Handy kurz weg war
    const it = G.ch.list[C.at(G.ch, t).i]; $('phNext').textContent = it ? (it.gold ? '✨ Gold-Move: ' : '➡️ ') + it.mv.n.split('+')[0] : '';
  }

  /* ---------- Bühne & Hauptschleife ---------- */
  let stageIdle = true, last = performance.now();
  function fitStage() { const el = $('stage'), r = el.getBoundingClientRect(); V.resize(r.width, r.height); }
  addEventListener('resize', () => { fitStage(); });
  function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { pad(dt); if (D && S && S.player) danceFrame(dt); else { const t = now / 1000; V.pose(menuPose(t), dt); V.beat((t * 2) % 1); } if (G) guestFrame(dt); if (!document.body.classList.contains('padOnly')) V.render(dt); } catch (e) { console.error(e); }
    requestAnimationFrame(frame); }
  // Menü: die Vortänzerin tanzt eine kleine Demo-Choreo
  const demo = C.choreograph({ id: 'demo', dur: 600, bpm: 118, beat0: 0, style: 'pop' }); demo.list = demo.list.filter(x => x.sec !== 'intro').map((x, i, a) => Object.assign({}, x, { b0: i ? a.slice(0, i).reduce((s, y) => s + y.mv.b, 0) : 0 }));
  const menuPose = t => C.at(demo, t % 300).pose;
  function pressStart() { SN.ctx(); sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart; $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });
  (async function boot() { const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; }; bar(.2); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); fitStage(); if (/[?&]lowfx/.test(location.search)) V.quality(0); } catch (e) { console.error(e); toast('3D wird von diesem Gerät nicht unterstützt'); }
    bar(.8); requestAnimationFrame(frame); await new Promise(r => setTimeout(r, 600)); bar(1); $('sLoad').classList.add('out'); setTimeout(() => $('sLoad').classList.remove('on', 'out'), 450);
    const q = new URLSearchParams(location.search), jc = q.get('join'); if (jc) return joinScreen(jc.toUpperCase()); if (q.has('tv')) return hostLobby(); scr('sTitle'); setTimeout(() => SE.Cam.preload(), 1500); })();
  // Test-Hilfen: Songzeit vorspulen (ohne echte Wartezeit), dabei jedes Bild rechnen
  function sim(sec, dt) { dt = dt || 1 / 30; for (let i = 0; i < sec / dt && D && S && S.player; i++) { const P = S.player; P.t0 = P.time() + dt; P.at = performance.now(); if (P.yt && P.yt.__set) P.yt.__set(P.t0); danceFrame(dt); if (G) guestFrame(dt); } }
  window.GAApp = { sim, get D() { return D; }, get S() { return S; }, get G() { return G; }, SET, ST, BEST, SYNC, C, openSong, openVideo, startDance, lock, finish, toMenu, songsScreen, tap, award };
})();
