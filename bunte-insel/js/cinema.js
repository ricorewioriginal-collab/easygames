'use strict';
/* Bunte Insel – Kino & Autokino (Erweiterung): ein Kino-Gebäude und direkt daneben ein Open-Air-Autokino im Ort.
   In beiden schaut man Filme/Serien über eingebettete YouTube-Player (youtube-nocookie, Werbung/Empfehlungen werden vom Anbieter gesteuert).
   - Kacheln: geprüfte, kostenlose Kinderfilme/-serien (jede ID wurde per YouTube-oEmbed geprüft: öffentlich + einbettbar).
   - Suche: echte YouTube-Suche (Data API v3) – nur mit einem Schlüssel, den die Eltern im Eltern-Bereich eintragen; immer safeSearch=strict + nur einbettbare Videos.
   Der Schlüssel liegt nur lokal auf diesem Gerät (localStorage), nicht im Spielstand/in der Cloud. Es wird erst etwas geladen, wenn ein Film gestartet wird. */
BI.CINEMA = { x0: -90, z0: 20, x1: -58, z1: 50, kino: { cx: -77, cz: 27.5, w: 24, d: 11, h: 6.5 }, lot: { x0: -88, x1: -60, z0: 35.5, z1: 47 }, screen: { cx: -74, z: 48.3, w: 22, h: 9.5, y: 3.2 }, seat: { x: -75, z: 43.5 }, door: { x: -77, z: 35.4 } };
BI.CINEFILMS = [
  { id: 'SSBVPKNsXc0', t: 'Die Dackel sind los', e: '🐕' }, { id: 'HTplFr86wlA', t: 'Mulan', e: '🐉' }, { id: 'ouh-Y7EDzyk', t: 'Die kleine Prinzessin', e: '👑' },
  { id: 'cy95g6krxAw', t: 'Noch mehr Dalmatiner', e: '🐶' }, { id: 'F0CH-szlIVY', t: 'Die Polarbärchen', e: '🐻' }, { id: '9AGcwVQeweE', t: 'Hachiko', e: '🐕' }
];
BI.CINESERIES = [
  { pl: 'PLmg8abQEyLpfVP00fN5aJPU-kJfmpX5aG', t: 'Unser Sandmännchen', e: '🌙', c: '#3b5bdb' }, { pl: 'PLO8lnEN5VWhO0Raa5q118BHwPle_E9sjt', t: 'Die Sendung mit der Maus', e: '🐭', c: '#f08c00' },
  { id: 'lJnQChnv1T4', t: 'MausSpots', e: '🐘', c: '#e8590c' }, { pl: 'PLoB4EtLTyAUEB3jcptE7MEtQMxqgwgwol', t: 'Paw Patrol & Co.', e: '🐾', c: '#1c7ed6' },
  { pl: 'PLYbELRCXraUVI8Klwfe0pkgMlZFbPRbea', t: 'Caillou', e: '🧒', c: '#2f9e44' }, { id: 'PgZdOxtkUd8', t: 'Bluey', e: '🐕', c: '#1098ad' }
];

/* ---------- Gebäude, Leinwand, Parkplatz (statisch, in die Welt-Sammelgeometrie) ---------- */
BI.buildCinema = function (c) {
  const { W, st, lamp, ROADY } = c, C = BI.CINEMA, K = C.kino, S = C.screen, COL = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8fc8];
  W.pads.push([C.x0, C.z0, C.x1, C.z1], [C.x1, 34.5, -43, 39.5]);
  W.spots.cinema = { kino: { x: C.door.x, z: C.door.z }, drive: { x: C.seat.x, z: C.seat.z } };
  /* Boden: Platz vor dem Kino, Parkplatz mit Linien, Zufahrt zur Ringstraße */
  st.rect(C.x0, C.z0, C.x1, 35, ROADY, 0xd9cfc0); st.rect(C.x0, 35, C.x1, C.z1, ROADY, 0x3d4350); st.rect(C.x1, 34.5, -43, 39.5, ROADY, 0x3d4350);
  for (let x = C.x1 + 1; x < -44; x += 5) st.rect(x, 36.9, x + 2.4, 37.1, ROADY + .01, 0xfff3c0);
  for (const z of [38.5, 43.5]) for (let i = 0; i <= 5; i++) st.rect(-86.4 + i * 4.5 - .06, z - 2.2, -86.4 + i * 4.5 + .06, z + 2.2, ROADY + .01, 0xffffff);
  st.rect(-76.9, 41, -73.1, 46, ROADY + .012, 0x4cd07d); st.rect(-76.6, 41.3, -73.4, 45.7, ROADY + .014, 0xffd23f); // Dein Platz
  /* Kino-Gebäude */
  { const { cx, cz, w, d, h } = K, fz = cz + d / 2;
    st.box(cx, 0, cz, w, h, d, 0x8e3b5e); st.box(cx, h, cz, w + .8, .7, d + .8, 0x3a1d33); st.box(cx, 0, cz, w + .3, .6, d + .3, 0x5a2640);
    for (const sd of [-1, 1]) { st.cyl(cx + sd * 6, h + .7, cz, 1.9, 1.9, .5, 0xf2f2f2, 16, Math.PI / 2); st.cyl(cx + sd * 6, h + .7, cz, .5, .5, .6, 0x3a1d33, 8, Math.PI / 2); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; st.cyl(cx + sd * 6, h + .7 + Math.sin(a) * 1.1, cz + Math.cos(a) * 1.1, .38, .38, .62, 0x3a1d33, 8, Math.PI / 2); } }
    st.box(cx, 3.5, fz + 1.1, 12, .45, 2.4, 0xfafafa); st.box(cx, 3.95, fz + 1.1, 12.4, .12, 2.6, 0xe0382b);
    for (let i = 0; i < 13; i++) lamp.sph(cx - 6 + i, 3.3, fz + 2.35, .16, COL[i % COL.length], 1);
    for (const sd of [-1, 1]) st.box(cx + sd * 5.7, 0, fz + 2, .5, 3.5, .5, 0xfafafa);
    st.box(cx, 0, fz + .06, 4, 2.7, .12, 0x2a1630); st.box(cx, 0, fz + .1, .1, 2.7, .1, 0xffd23f);
    for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { const px = cx + sd * (5.2 + k * 3.3) + (sd > 0 ? 0 : 0); st.box(px, 1.0, fz + .06, 2.4, 2.6, .1, 0x222222); st.box(px, 1.15, fz + .1, 2.1, 2.3, .06, COL[(k * 2 + (sd > 0 ? 1 : 0) + 2) % COL.length]); st.sph(px, 2.2, fz + .16, .5, 0xffffff, 1); }
    W.addBox(cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2, false, h + 2);
    /* Popcorn-Wagen */
    const px = -62.5, pz = 29; st.box(px, .5, pz, 2.2, 1.1, 1.4, 0xe0382b); st.box(px, 1.6, pz, 2.4, .1, 1.6, 0xffffff); for (let k = 0; k < 5; k++) st.box(px - 1 + k * .5, 2.2, pz - .8, .5, .9, .1, k % 2 ? 0xffffff : 0xe0382b);
    st.cyl(px, 1.7, pz, .5, .5, .5, 0xf6f0d0, 10); for (let k = 0; k < 6; k++) st.sph(px + Math.cos(k) * .4, 2.35, pz + Math.sin(k) * .4, .22, 0xfff3b0, 1); for (const sd of [-1, 1]) st.cyl(px + sd * .8, 0, pz + .9, .3, .3, .2, 0x333333, 8, Math.PI / 2);
    W.addBox(px - 1.3, pz - .9, px + 1.3, pz + .9);
  }
  /* Leinwand mit Gerüst */
  st.box(S.cx, S.y - .6, S.z + .2, S.w + 1.2, S.h + 1.2, .5, 0x20242c); lamp.box(S.cx, S.y, S.z - .15, S.w, S.h, .12, 0xf4f7ff);
  for (let i = 0; i < 6; i++) lamp.box(S.cx - S.w / 2 + 1 + i * (S.w - 2) / 5.4, S.y + .4, S.z - .22, 1.6, .5, .06, COL[i]);
  for (const sd of [-1, 1]) { st.box(S.cx + sd * 8, 0, S.z + .5, .8, S.y + S.h + 1.4, .8, 0x555a66); }
  st.box(S.cx, S.y + S.h + .7, S.z - .1, S.w + 1.2, .4, .9, 0xffd23f);
  W.addBox(S.cx - S.w / 2 - .6, S.z - .4, S.cx + S.w / 2 + .6, S.z + .9, false, 14);
  /* parkende Autos (auf Leinwand ausgerichtet), Lautsprechersäulen, Lichter */
  const rnd = BI.rng(311);
  for (const z of [38.5, 43.5]) for (let i = 0; i < 5; i++) {
    const x = -84 + i * 4.5; if (z === 43.5 && i === 2) continue;
    if (rnd() < .3) continue;
    const col = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d, 0xb36bff, 0xff8a1f, 0xffffff][(rnd() * 7) | 0];
    st.box(x, .35, z, 2, .7, 4.1, col); st.box(x, 1.0, z - .2, 1.7, .6, 2.2, 0xcfe8ff); st.box(x, .95, z - .22, 1.74, .08, 2.26, col);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) st.cyl(x + sx * .95, .3, z + sz * 1.3, .3, .3, .22, 0x222222, 8, Math.PI / 2);
    lamp.sph(x - .6, .55, z + 2.05, .13, 0xfff2b0, 1); lamp.sph(x + .6, .55, z + 2.05, .13, 0xfff2b0, 1);
    W.addBox(x - 1.1, z - 2.1, x + 1.1, z + 2.1, false, 1.8);
  }
  for (let i = 0; i <= 5; i++) { const x = -86.4 + i * 4.5; st.cyl(x + 2.25, 0, 41, .06, .08, 1.5, 0x555a66, 5); st.box(x + 2.25, 1.2, 41, .3, .4, .2, 0x2b2f3a); }
  for (const [x, z] of [[-89, 35.5], [-59, 35.5], [-89, 48], [-59, 48], [-89, 22], [-59, 22]]) { st.cyl(x, 0, z, .08, .1, 4.4, 0x555a66, 6); lamp.sph(x, 4.6, z, .34, 0xfff2b0, 1); }
  for (let i = 0; i < 3; i++) { st.box(-84 + i * 4, .35, 31.2, 2.2, .1, .6, 0x8a5a33); st.box(-84 + i * 4, .6, 31.5, 2.2, .35, .1, 0x8a5a33); }
};

/* ---------- Laufzeit: Eingang/Platz, Anzeigetafel, Player, Suche ---------- */
BI.createCinema = function (G) {
  const { scene, P, say, A } = G, $ = id => document.getElementById(id), C = BI.CINEMA, K = { open: false, mode: 'kino' };
  const KEY = 'bi-ytkey', getKey = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  K.keyOk = k => /^[A-Za-z0-9_-]{20,64}$/.test(k || '');
  K.setKey = k => { try { if (k) localStorage.setItem(KEY, k); else localStorage.removeItem(KEY); } catch (e) { } };
  K.hasKey = () => K.keyOk(getKey());
  /* Schilder (zwei kleine Flächen, nur in der Nähe sichtbar) */
  function sign(txt, w, h, bg, fg, x, y, z, ry) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = bg; c.beginPath(); c.moveTo(24, 0); c.arcTo(512, 0, 512, 128, 28); c.arcTo(512, 128, 0, 128, 28); c.arcTo(0, 128, 0, 0, 28); c.arcTo(0, 0, 512, 0, 28); c.fill();
    c.fillStyle = fg; c.font = 'bold 74px system-ui,"Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 256, 68);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
  }
  const signs = [sign('🎬 KINO', 8, 2, '#3a1d33', '#ffd23f', C.kino.cx, C.kino.h + 2.6, C.kino.cz + C.kino.d / 2 + .5, 0), sign('🚗 AUTOKINO', 12, 3, '#20242c', '#ffffff', C.screen.cx, C.screen.y + C.screen.h + 2.6, C.screen.z - .6, Math.PI), sign('Dein Platz 🍿', 3.4, .85, '#2b8a3e', '#ffffff', C.seat.x, 2.6, C.seat.z + 2.2, 0)];
  K.near = function () {
    if (P.veh || K.open) return null;
    if (Math.hypot(P.x - C.door.x, P.z - C.door.z) < 3.4 && P.y < 1) return { k: 'kino' };
    if (Math.hypot(P.x - C.seat.x, P.z - C.seat.z) < 2.8 && P.y < 1) return { k: 'drive' };
    return null;
  };
  /* ---------- Player + Auswahl ---------- */
  let tab = 'film', musicWas = true, lastQ = 0, busyQ = false; const cache = new Map(), card = $('cineCard');
  const embed = it => 'https://www.youtube-nocookie.com/embed/' + (it.pl ? 'videoseries?list=' + encodeURIComponent(it.pl) + '&' : encodeURIComponent(it.id) + '?') + 'autoplay=1&rel=0&playsinline=1';
  const watchUrl = it => it.pl ? 'https://www.youtube.com/playlist?list=' + encodeURIComponent(it.pl) : 'https://www.youtube.com/watch?v=' + encodeURIComponent(it.id);
  K.play = function (it) {
    if (!it || !(it.id ? /^[A-Za-z0-9_-]{6,20}$/.test(it.id) : /^[A-Za-z0-9_-]{10,60}$/.test(it.pl || ''))) return;
    $('cineFrame').src = embed(it); $('cineNow').textContent = it.t; $('cineOpen').href = watchUrl(it); $('cineStage').hidden = false; $('cineList').hidden = true;
    if (G.earn) G.earn('cinema'); K.playing = it;
  };
  K.stopPlay = function () { $('cineFrame').src = 'about:blank'; $('cineStage').hidden = true; $('cineList').hidden = false; K.playing = null; };
  function tile(it, thumb) {
    const b = document.createElement('button'); b.className = 'ctile'; b.setAttribute('aria-label', it.t);
    if (thumb) { const im = new Image(); im.loading = 'lazy'; im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = thumb; im.onerror = () => { im.remove(); b.classList.add('noimg'); }; b.appendChild(im); } else { b.classList.add('noimg'); if (it.c) b.style.setProperty('--tc', it.c); }
    const e = document.createElement('i'); e.textContent = it.e || '🎞️'; b.appendChild(e); const s = document.createElement('span'); s.textContent = it.t; b.appendChild(s); b.onclick = () => K.play(it); return b;
  }
  const thumbOf = id => 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
  function grid(items) { const g = $('cineGrid'); g.innerHTML = ''; for (const it of items) g.appendChild(tile(it.thumb !== undefined ? it : it, it.thumb !== undefined ? it.thumb : (it.id ? thumbOf(it.id) : null))); }
  function render() {
    const tb = $('cineTabs'); tb.innerHTML = ''; [['film', '🎞️ Filme'], ['serie', '📺 Serien'], ['search', '🔍 Suchen']].forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'pill' + (tab === k ? ' sel' : ''); b.textContent = n; b.onclick = () => { tab = k; render(); }; tb.appendChild(b); });
    $('cineSearch').hidden = tab !== 'search';
    if (tab === 'film') grid(BI.CINEFILMS); else if (tab === 'serie') grid(BI.CINESERIES); else { $('cineGrid').innerHTML = ''; const has = K.hasKey(); $('cineQ').disabled = $('cineGo').disabled = !has; if (!has) setMsg('🔒 Die Suche ist noch ausgeschaltet. Eltern können im Eltern-Bereich (Pause-Menü, „Noch 5 Min“ gedrückt halten → 👪) einen YouTube-Schlüssel eintragen. Bis dahin: Filme & Serien ansehen!'); else if (!$('cineGrid').children.length) setMsg('Tippe etwas ein, z. B. „Peppa Wutz“, „Traktor“ oder „Dinosaurier“. Es werden nur kindersichere Videos gezeigt.'); }
  }
  function setMsg(t) { $('cineMsg').textContent = t; }
  K.search = async function (q) {
    q = (q || '').trim().slice(0, 60); if (!q || busyQ || !K.hasKey()) return null;
    const now = performance.now(); if (now - lastQ < 1500) { setMsg('Einen Moment bitte … ⏳'); return null; } lastQ = now;
    if (cache.has(q)) { grid(cache.get(q)); setMsg(cache.get(q).length ? '' : 'Nichts gefunden – versuch ein anderes Wort 🤔'); return cache.get(q); }
    busyQ = true; setMsg('Suche … 🔎'); const ac = new AbortController(), to = setTimeout(() => ac.abort(), 10000);
    try {
      const u = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&safeSearch=strict&videoEmbeddable=true&videoSyndicated=true&maxResults=12&regionCode=DE&relevanceLanguage=de&q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(getKey());
      const r = await fetch(u, { signal: ac.signal, referrerPolicy: 'no-referrer' });
      if (!r.ok) { setMsg(r.status === 400 || r.status === 403 ? '🔑 Der Schlüssel geht nicht (oder das Tageslimit ist erreicht). Eltern können ihn im Eltern-Bereich prüfen.' : 'Das hat nicht geklappt (' + r.status + '). Versuch es später nochmal.'); return null; }
      const j = await r.json(), items = [];
      for (const v of (j.items || [])) { const id = v.id && v.id.videoId; if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) continue; const th = v.snippet && v.snippet.thumbnails && (v.snippet.thumbnails.medium || v.snippet.thumbnails.default); items.push({ id, t: String((v.snippet && v.snippet.title) || 'Video').slice(0, 90), e: '▶️', thumb: th && /^https:\/\/i\.ytimg\.com\//.test(th.url || '') ? th.url : thumbOf(id) }); }
      cache.set(q, items); if (tab === 'search') { grid(items); setMsg(items.length ? '' : 'Nichts gefunden – versuch ein anderes Wort 🤔'); } return items;
    } catch (e) { setMsg(e && e.name === 'AbortError' ? 'Das dauert zu lange … ist das Internet an? 📶' : 'Keine Verbindung zu YouTube 📶'); return null; }
    finally { clearTimeout(to); busyQ = false; }
  };
  $('cineGo').addEventListener('click', () => K.search($('cineQ').value));
  $('cineQ').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') K.search($('cineQ').value); }); $('cineQ').addEventListener('keyup', e => e.stopPropagation());
  $('cineBack').addEventListener('click', K.stopPlay);
  K.show = function (mode) {
    if (K.open) return; K.open = true; K.mode = mode === 'drive' ? 'drive' : 'kino'; G.setStick(0, 0); try { musicWas = A.musicOn; A.setMusic(false); if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { }
    card.className = 'card cine ' + K.mode; $('cineTitle').textContent = K.mode === 'drive' ? '🚗 Autokino unter Sternen' : '🎬 Kino'; $('cineSub').textContent = K.mode === 'drive' ? 'Du sitzt im Auto – such dir einen Film aus 🍿' : 'Such dir einen Platz und einen Film aus 🍿';
    K.stopPlay(); render(); $('cinePanel').hidden = false;
  };
  K.close = function () { if (!K.open) return; K.open = false; K.stopPlay(); $('cinePanel').hidden = true; try { A.setMusic(musicWas); } catch (e) { } G.updateButtons(true); };
  $('cineClose').addEventListener('click', K.close);
  K.update = function () { const n = Math.hypot(P.x - C.seat.x, P.z - 35) < 90; for (const s of signs) s.visible = n; };
  return K;
};
