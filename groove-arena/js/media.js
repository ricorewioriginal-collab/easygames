/* Groove Arena – Songs & Videos ohne API-Schlüssel:
 *  - Songsuche über die iTunes-Suche (wie RicoReWi Radio): Titel, Interpret, Länge, Genre, Cover
 *  - passendes YouTube-Video über freie Piped/Invidious-Server (mehrere gleichzeitig, der schnellste gewinnt; Liste wird aktualisiert)
 *  - Liedtext-Zeitstempel über lrclib (nur für den Songaufbau: Strophe/Refrain – der Text wird nicht angezeigt)
 *  - Wiedergabe mit dem offiziellen YouTube-Player (IFrame-API, youtube-nocookie), sichtbar und mindestens 200 × 200 Pixel */
(function () {
  'use strict';
  const TO = 7000;
  async function getJSON(url, ms) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms || TO); try { const r = await fetch(url, { signal: ac.signal, referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error('http ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
  const firstOk = list => new Promise((res, rej) => { let left = list.length; if (!left) return rej(new Error('none')); list.forEach(p => p.then(v => { if (v && v.length) res(v); else if (!--left) rej(new Error('empty')); }, () => { if (!--left) rej(new Error('fail')); })); });
  const ID = /^[A-Za-z0-9_-]{11}$/;
  function idFromUrl(s) { s = String(s || '').trim(); if (ID.test(s)) return s; const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }

  /* ---------- iTunes-Suche ---------- */
  async function songs(term, limit) {
    const u = 'https://itunes.apple.com/search?media=music&entity=song&country=DE&lang=de_de&limit=' + (limit || 25) + '&term=' + encodeURIComponent(term);
    const j = await getJSON(u); return (j.results || []).filter(x => x.trackName && x.artistName).map(x => ({ title: x.trackName, artist: x.artistName, dur: Math.round((x.trackTimeMillis || 0) / 1000), genre: x.primaryGenreName || '', cover: (x.artworkUrl100 || '').replace('100x100', '300x300'), year: (x.releaseDate || '').slice(0, 4) }));
  }

  /* ---------- YouTube-Suche über Piped / Invidious ---------- */
  const LS = 'groove-arena-yt-hosts';
  let PIPED = ['https://pipedapi.kavin.rocks', 'https://api.piped.private.coffee', 'https://pipedapi.adminforge.de', 'https://pipedapi.leptons.xyz', 'https://pipedapi.reallyaweso.me'];
  let INV = ['https://inv.nadeko.net', 'https://invidious.nerdvpn.de', 'https://yewtu.be', 'https://invidious.f5.si', 'https://iv.ggtyler.dev', 'https://invidious.privacyredirect.com'];
  try { const c = JSON.parse(localStorage.getItem(LS) || 'null'); if (c && Date.now() - c.t < 864e5) { PIPED = c.p.concat(PIPED).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8); INV = c.i.concat(INV).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8); } } catch (e) { }
  let refreshed = false;
  async function refreshHosts() { if (refreshed) return; refreshed = true; const p = [], i = [];
    try { const j = await getJSON('https://api.invidious.io/instances.json?sort_by=health', 5000); for (const [, v] of j) if (v && v.api && v.cors !== false && v.type === 'https' && v.uri) i.push(v.uri.replace(/\/$/, '')); } catch (e) { }
    try { const j = await getJSON('https://piped-instances.kavin.rocks/', 5000); for (const v of j) if (v && v.api_url) p.push(v.api_url.replace(/\/$/, '')); } catch (e) { }
    if (p.length) PIPED = p.slice(0, 6).concat(PIPED).filter((x, k, a) => a.indexOf(x) === k).slice(0, 8); if (i.length) INV = i.slice(0, 6).concat(INV).filter((x, k, a) => a.indexOf(x) === k).slice(0, 8);
    try { localStorage.setItem(LS, JSON.stringify({ t: Date.now(), p: PIPED.slice(0, 6), i: INV.slice(0, 6) })); } catch (e) { } }
  const good = new Set(); // Server, die zuletzt geantwortet haben, kommen nach vorn
  function fromPiped(h, q) { return getJSON(h + '/search?filter=videos&q=' + encodeURIComponent(q)).then(j => { good.add(h); return (j.items || []).filter(x => x.url && /watch\?v=/.test(x.url)).map(x => ({ id: idFromUrl(x.url), title: x.title || '', dur: x.duration || 0, by: x.uploaderName || '', thumb: x.thumbnail || '' })).filter(x => x.id); }); }
  function fromInv(h, q) { return getJSON(h + '/api/v1/search?type=video&q=' + encodeURIComponent(q)).then(j => { good.add(h); return (Array.isArray(j) ? j : []).filter(x => x.videoId).map(x => ({ id: x.videoId, title: x.title || '', dur: x.lengthSeconds || 0, by: x.author || '', thumb: 'https://i.ytimg.com/vi/' + x.videoId + '/mqdefault.jpg' })).filter(x => ID.test(x.id)); }); }
  async function videos(q) {
    refreshHosts(); const order = a => a.slice().sort((x, y) => (good.has(y) ? 1 : 0) - (good.has(x) ? 1 : 0));
    const tries = order(PIPED).slice(0, 4).map(h => fromPiped(h, q)).concat(order(INV).slice(0, 4).map(h => fromInv(h, q)));
    const list = await firstOk(tries); return list.filter(v => !v.dur || (v.dur > 45 && v.dur < 1200)).map(v => Object.assign(v, { thumb: 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg' }));
  }
  // bestes Video zu einem Song: offizielle Videos/Audio bevorzugt, Länge passend
  async function videoFor(song) {
    const list = await videos(song.artist + ' ' + song.title + ' official'); const nm = s => s.toLowerCase();
    const art = nm(song.artist).split(/[ ,&]/)[0], compact = x => nm(x).replace(/[^a-z0-9äöüß]/g, '');
    const score = v => { let s = 0; const t = nm(v.title), by = compact(v.by || '');
      if (t.includes(nm(song.title).slice(0, 12))) s += 3; if (t.includes(art)) s += 1.5;
      if (by && (by.includes(compact(song.artist).slice(0, 10)) || by.endsWith('vevo') || by.includes(compact(art)))) s += 4;   // offizieller Kanal des Interpreten
      if (/official (music )?video|offizielles musikvideo|official visuali[sz]er/.test(t)) s += 3; else if (/official|offiziell/.test(t)) s += 1.5;
      if (/\blyrics?\b|songtext|letra/.test(t)) s -= 2.5; if (/\blive\b|cover|karaoke|reaction|tutorial|8d|sped up|slowed|nightcore|remix|instrumental|1 hour|loop/.test(t)) s -= 4;
      if (song.dur && v.dur) { const d = Math.abs(v.dur - song.dur); s -= d < 25 ? 0 : Math.min(3, (d - 25) / 20); }   // Musikvideos haben oft Intro/Outro
      return s; };
    return list.map(v => Object.assign(v, { s: score(v) })).sort((a, b) => b.s - a.s);
  }

  /* ---------- Liedtext-Zeitstempel (lrclib) ---------- */
  async function lyrics(song) { try { const j = await getJSON('https://lrclib.net/api/get?artist_name=' + encodeURIComponent(song.artist) + '&track_name=' + encodeURIComponent(song.title) + (song.dur ? '&duration=' + song.dur : ''), 6000); return j && j.syncedLyrics ? j.syncedLyrics : null; } catch (e) { return null; } }
  // Video-Titel „Interpret - Titel (Official Video)“ → Song-Teile
  function parseTitle(t) { const c = String(t || '').replace(/\(.*?\)|\[.*?\]|official.*$|video|audio|lyrics?/gi, '').trim(); const m = c.split(/\s[-–—|]\s/); return m.length >= 2 ? { artist: m[0].trim(), title: m[1].trim() } : { artist: '', title: c }; }

  /* ---------- YouTube-Player (offizielle IFrame-API) ---------- */
  let apiP = null;
  function loadApi() { if (window.YT && window.YT.Player) return Promise.resolve(); if (apiP) return apiP; apiP = new Promise((res, rej) => { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { if (prev) try { prev(); } catch (e) { } res(); }; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => { apiP = null; rej(new Error('yt')); }; document.head.appendChild(s); setTimeout(() => { if (!(window.YT && window.YT.Player)) { apiP = null; rej(new Error('yt-timeout')); } }, 15000); }); return apiP; }
  // Spieler mit sauberer Zeit (zwischen den Abfragen weich hochgezählt)
  function player(el, id, cb) {
    const P = { ready: false, t: 0, t0: 0, at: 0, state: -1, dur: 0, err: null };
    loadApi().then(() => {
      P.yt = new YT.Player(el, { videoId: id, host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%', playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1, fs: 0, iv_load_policy: 3, origin: location.origin && location.origin !== 'null' ? location.origin : undefined },
        events: { onReady: () => { P.ready = true; try { P.dur = P.yt.getDuration(); } catch (e) { } cb && cb('ready', P); }, onStateChange: e => { P.state = e.data; P.sync(); cb && cb('state', P); }, onError: e => { P.err = e.data; cb && cb('error', P); } } });
    }).catch(e => { P.err = 'api'; cb && cb('error', P); });
    P.sync = () => { try { const t = P.yt.getCurrentTime(), now = performance.now(), pred = P.t0 + (P.state === 1 ? (now - P.at) / 1000 : 0), d = t - pred; P.t0 = P.state === 1 && Math.abs(d) < .25 ? pred + d * .25 : t; P.at = now; } catch (e) { } };   // weich nachführen statt springen
    P.time = () => { if (!P.ready) return 0; const now = performance.now(); if (now - P.at > 250) P.sync(); return P.state === 1 ? P.t0 + (performance.now() - P.at) / 1000 : P.t0; };
    P.play = () => { try { P.yt.playVideo(); } catch (e) { } }; P.pause = () => { try { P.yt.pauseVideo(); } catch (e) { } }; P.seek = s => { try { P.yt.seekTo(s, true); P.t0 = s; P.at = performance.now(); } catch (e) { } };
    P.vol = v => { try { P.yt.setVolume(v); } catch (e) { } }; P.destroy = () => { try { P.yt.destroy(); } catch (e) { } };
    P.playing = () => P.state === 1; P.ended = () => P.state === 0; P.duration = () => { try { return P.yt.getDuration() || P.dur; } catch (e) { return P.dur; } };
    P.info = () => { try { return P.yt.getVideoData() || {}; } catch (e) { return {}; } };   // { author: Kanal, title }
    return P;
  }

  /* ---------- RicoReWi-Radio (laut.fm): Livestream mit derselben Schnittstelle wie der YouTube-Player ---------- */
  // Der Stream hat eine CORS-Freigabe – dann wird der Takt direkt aus dem Stream erkannt. Klappt das nicht, läuft er ohne Analyse (plain).
  function radio(slug, cb) {
    const P = { ready: true, radio: true, slug, t0: 0, at: 0, state: -1, err: null, plain: false, want: false };
    const make = cors => { const el = new Audio(); el.preload = 'none'; if (cors) el.crossOrigin = 'anonymous';
      el.addEventListener('playing', () => { P.sync(); P.state = 1; cb && cb('state', P); });
      el.addEventListener('pause', () => { P.sync(); P.state = 2; cb && cb('state', P); });
      el.addEventListener('waiting', () => { P.sync(); P.state = 3; });
      el.addEventListener('error', () => { if (P.el !== el) return; if (cors && P.state !== 1) { P.plain = true; P.el = make(false); cb && cb('plain', P); if (P.want) P.play(); } else { P.err = 'stream'; P.state = 2; cb && cb('error', P); } });
      el.src = 'https://stream.laut.fm/' + encodeURIComponent(slug); return el; };
    P.el = make(true);
    P.sync = () => { const t = P.el.currentTime || 0, now = performance.now(), pred = P.t0 + (P.state === 1 ? (now - P.at) / 1000 : 0), d = t - pred; P.t0 = P.state === 1 && Math.abs(d) < .25 ? pred + d * .25 : Math.max(t, P.t0); P.at = now; };
    P.time = () => { const now = performance.now(); if (now - P.at > 250) P.sync(); return P.state === 1 ? P.t0 + (now - P.at) / 1000 : P.t0; };
    P.play = () => { P.want = true; try { const pr = P.el.play(); if (pr && pr.catch) pr.catch(() => cb && cb('blocked', P)); } catch (e) { } };
    P.pause = () => { P.want = false; try { P.el.pause(); } catch (e) { } };
    P.seek = () => { }; P.vol = v => { P.el.volume = v / 100; };
    P.destroy = () => { P.want = false; try { P.el.pause(); P.el.removeAttribute('src'); P.el.load(); } catch (e) { } };
    P.playing = () => P.state === 1; P.ended = () => false; P.duration = () => 0; P.info = () => ({});
    return P;
  }
  const stInfo = {};
  function station(slug) { return stInfo[slug] || (stInfo[slug] = getJSON('https://api.laut.fm/station/' + encodeURIComponent(slug), 6000).then(j => ({ name: j.display_name || j.name || slug, logo: (j.images || {}).station_120x120 || (j.images || {}).station || '', page: j.page_url || 'https://laut.fm/' + slug, genres: j.genres || [], format: j.format || '' })).catch(() => { delete stInfo[slug]; return null; })); }
  const pd = v => Date.parse(String(v || '').replace(/^(\S+) (\S+) ([+-]\d\d)(\d\d)$/, '$1T$2$3:$4')) || 0;   // „2026-10-25 02:14:09 +0200“ → ISO
  function nowPlaying(slug) { return getJSON('https://api.laut.fm/station/' + encodeURIComponent(slug) + '/current_song', 6000).then(j => j && j.title ? { title: String(j.title), artist: j.artist && j.artist.name ? String(j.artist.name) : '', type: String(j.type || 'song'), start: pd(j.started_at), end: pd(j.ends_at), length: +j.length || 0 } : null).catch(() => null); }
  /* ---------- Tempo aus öffentlicher Quelle: 30-Sekunden-Hörprobe von Apple iTunes (frei abrufbar), im Gerät ausgewertet ----------
   * laut.fm liefert in Stream-Tags und Titelinfos kein Tempo (BPM) – daher zählt das Spiel den Takt in der Hörprobe desselben Titels. Ergebnis je Song gespeichert. */
  const BK = 'groove-arena-bpm', bpmP = {}; let bpmC = {}; try { bpmC = JSON.parse(localStorage.getItem(BK) || '{}') || {}; } catch (e) { }
  function onsets(buf) {   // Einsatz-Hüllkurve mit 100 Hz (Bass betont) – dieselbe Form wie bei der Live-Erkennung
    const d = buf.getChannelData(0), hop = Math.round(buf.sampleRate / 100), out = []; let lp = 0, pl = 0, pa = 0;
    for (let i = 0, k = 0; i + hop <= d.length; i += hop, k++) { let lo = 0, al = 0; for (let j = i; j < i + hop; j++) { const x = d[j]; lp += (x - lp) * .02; lo += lp * lp; al += x * x; } lo = Math.sqrt(lo / hop); al = Math.sqrt(al / hop); out.push({ t: k / 100 + .01, v: Math.max(0, lo - pl) * 2.2 + Math.max(0, al - pa) }); pl = lo; pa = al; }
    return out; }
  const nmz = s => String(s || '').toLowerCase().replace(/\(.*?\)|\[.*?\]|feat\..*$/g, '').replace(/[^a-z0-9äöüß]/g, '');
  function bpmOf(n) {
    if (!n || !n.title) return Promise.resolve(null); const key = nmz(n.artist) + '|' + nmz(n.title); if (bpmC[key]) return Promise.resolve(bpmC[key]); if (bpmP[key]) return bpmP[key];
    return bpmP[key] = (async () => {
      const j = await getJSON('https://itunes.apple.com/search?media=music&entity=song&country=DE&limit=8&term=' + encodeURIComponent(((n.artist || '') + ' ' + n.title).trim()));
      const t = nmz(n.title).slice(0, 12), a = nmz(n.artist).slice(0, 6), r = (j.results || []).filter(x => x.previewUrl && nmz(x.trackName).startsWith(t));
      const hit = r.find(x => !a || nmz(x.artistName).includes(a)) || (a ? null : r[0]); if (!hit) return null;
      const ab = await (await fetch(hit.previewUrl, { referrerPolicy: 'no-referrer' })).arrayBuffer(), OC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OC) return null;
      const buf = await new Promise((res, rej) => { const p = new OC(1, 44100, 44100).decodeAudioData(ab, res, rej); if (p && p.catch) p.catch(rej); });
      const tm = GACore.tempo(onsets(buf)); if (!tm) return null; const v = { bpm: tm.bpm, conf: tm.conf };
      bpmC[key] = v; const ks = Object.keys(bpmC); if (ks.length > 400) ks.slice(0, 100).forEach(k => delete bpmC[k]); try { localStorage.setItem(BK, JSON.stringify(bpmC)); } catch (e) { } return v;
    })().catch(() => null).finally(() => { delete bpmP[key]; });
  }
  window.GAMedia = { songs, videos, videoFor, lyrics, idFromUrl, parseTitle, player, radio, station, nowPlaying, bpmOf, onsets, loadApi, hosts: () => ({ piped: PIPED, inv: INV }) };
})();
