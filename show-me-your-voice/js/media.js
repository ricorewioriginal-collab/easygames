/* SHOW ME YOUR VOICE – echte Songs ohne API-Schlüssel (wie Groove Arena):
 *  - Songsuche über die iTunes-Suche (Titel, Interpret, Länge, Cover, 30-s-Hörprobe)
 *  - YouTube-Videos über freie Piped/Invidious-Server (mehrere gleichzeitig, der schnellste gewinnt)
 *  - Song-Sync: Tempo aus der iTunes-Hörprobe (Beat-Analyse auf dem Gerät), Taktlage aus den lrclib-Zeitstempeln
 *  - Wiedergabe mit dem offiziellen YouTube-Player (IFrame-API, youtube-nocookie) */
(function (root) {
  'use strict';
  const TO = 7000;
  async function getJSON(url, ms) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms || TO); try { const r = await fetch(url, { signal: ac.signal, referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error('http ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
  const firstOk = list => new Promise((res, rej) => { let left = list.length; if (!left) return rej(new Error('none')); list.forEach(p => p.then(v => { if (v && v.length) res(v); else if (!--left) rej(new Error('empty')); }, () => { if (!--left) rej(new Error('fail')); })); });
  const ID = /^[A-Za-z0-9_-]{11}$/;
  function idFromUrl(s) { s = String(s || '').trim(); if (ID.test(s)) return s; const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }

  /* ---------- iTunes-Suche ---------- */
  async function songs(term, limit) {
    const u = 'https://itunes.apple.com/search?media=music&entity=song&country=DE&lang=de_de&limit=' + (limit || 20) + '&term=' + encodeURIComponent(term);
    const j = await getJSON(u); return (j.results || []).filter(x => x.trackName && x.artistName).map(x => ({ title: x.trackName, artist: x.artistName, dur: Math.round((x.trackTimeMillis || 0) / 1000), genre: x.primaryGenreName || '', cover: (x.artworkUrl100 || '').replace('100x100', '300x300'), preview: x.previewUrl || '' }));
  }

  /* ---------- YouTube-Suche über Piped / Invidious ---------- */
  const LS = 'smyv-yt-hosts';
  let PIPED = ['https://pipedapi.kavin.rocks', 'https://api.piped.private.coffee', 'https://pipedapi.adminforge.de', 'https://pipedapi.leptons.xyz', 'https://pipedapi.reallyaweso.me'];
  let INV = ['https://inv.nadeko.net', 'https://invidious.nerdvpn.de', 'https://yewtu.be', 'https://invidious.f5.si', 'https://iv.ggtyler.dev', 'https://invidious.privacyredirect.com'];
  try { const c = JSON.parse(localStorage.getItem(LS) || 'null'); if (c && Date.now() - c.t < 864e5) { PIPED = c.p.concat(PIPED).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8); INV = c.i.concat(INV).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8); } } catch (e) { /* egal */ }
  let refreshed = false;
  async function refreshHosts() { if (refreshed) return; refreshed = true; const p = [], i = [];
    try { const j = await getJSON('https://api.invidious.io/instances.json?sort_by=health', 5000); for (const [, v] of j) if (v && v.api && v.cors !== false && v.type === 'https' && v.uri) i.push(v.uri.replace(/\/$/, '')); } catch (e) { /* egal */ }
    try { const j = await getJSON('https://piped-instances.kavin.rocks/', 5000); for (const v of j) if (v && v.api_url) p.push(v.api_url.replace(/\/$/, '')); } catch (e) { /* egal */ }
    if (p.length) PIPED = p.slice(0, 6).concat(PIPED).filter((x, k, a) => a.indexOf(x) === k).slice(0, 8); if (i.length) INV = i.slice(0, 6).concat(INV).filter((x, k, a) => a.indexOf(x) === k).slice(0, 8);
    try { localStorage.setItem(LS, JSON.stringify({ t: Date.now(), p: PIPED.slice(0, 6), i: INV.slice(0, 6) })); } catch (e) { /* egal */ } }
  const good = new Set();
  function fromPiped(h, q) { return getJSON(h + '/search?filter=videos&q=' + encodeURIComponent(q)).then(j => { good.add(h); return (j.items || []).filter(x => x.url && /watch\?v=/.test(x.url)).map(x => ({ id: idFromUrl(x.url), title: x.title || '', dur: x.duration || 0, by: x.uploaderName || '' })).filter(x => x.id); }); }
  function fromInv(h, q) { return getJSON(h + '/api/v1/search?type=video&q=' + encodeURIComponent(q)).then(j => { good.add(h); return (Array.isArray(j) ? j : []).filter(x => x.videoId).map(x => ({ id: x.videoId, title: x.title || '', dur: x.lengthSeconds || 0, by: x.author || '' })).filter(x => ID.test(x.id)); }); }
  async function videos(q) {
    refreshHosts(); const order = a => a.slice().sort((x, y) => (good.has(y) ? 1 : 0) - (good.has(x) ? 1 : 0));
    const tries = order(PIPED).slice(0, 4).map(h => fromPiped(h, q)).concat(order(INV).slice(0, 4).map(h => fromInv(h, q)));
    const list = await firstOk(tries); return list.filter(v => !v.dur || (v.dur > 45 && v.dur < 1200)).map(v => Object.assign(v, { thumb: 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg' }));
  }
  const nm = s => String(s || '').toLowerCase(), compact = x => nm(x).replace(/[^a-z0-9äöüß]/g, '');
  // bestes Video zu einem Song. kind = 'official' (Original zum Mitspielen) oder 'karaoke' (Karaoke-Version mit Lyrics zum Vorsingen)
  async function videoFor(song, kind) {
    const kara = kind === 'karaoke', list = await videos(song.artist + ' ' + song.title + (kara ? ' karaoke' : ' official'));
    const art = nm(song.artist).split(/[ ,&]/)[0];
    const score = v => { let s = 0; const t = nm(v.title), by = compact(v.by);
      if (t.includes(nm(song.title).slice(0, 12))) s += 3; if (art && t.includes(art)) s += 1.5;
      if (kara) { if (/karaoke|instrumental with lyrics|sing ?along/.test(t)) s += 4; if (/musisi|stingray|zoom|karafun|sing king|singking|karaoke/.test(by)) s += 2; if (/\blive\b|reaction|tutorial|cover by/.test(t)) s -= 3; }
      else { if (by && (by.includes(compact(song.artist).slice(0, 10)) || by.endsWith('vevo') || (art && by.includes(compact(art))))) s += 4;
        if (/official (music )?video|offizielles musikvideo|official (visuali[sz]er|audio)/.test(t)) s += 3; else if (/official|offiziell/.test(t)) s += 1.5;
        if (/\blyrics?\b|songtext/.test(t)) s -= 1.5; if (/\blive\b|cover|karaoke|reaction|tutorial|8d|sped up|slowed|nightcore|remix|instrumental|1 hour|loop/.test(t)) s -= 4; }
      if (song.dur && v.dur) { const d = Math.abs(v.dur - song.dur); s -= d < 25 ? 0 : Math.min(3, (d - 25) / 20); }
      return s; };
    return list.map(v => Object.assign(v, { s: score(v) })).sort((a, b) => b.s - a.s);
  }

  /* ---------- Song-Sync ---------- */
  // lrclib: Zeitstempel der Liedzeilen (Textzeilen beginnen fast immer auf einem Schlag)
  async function lyrics(song) { try { const j = await getJSON('https://lrclib.net/api/get?artist_name=' + encodeURIComponent(song.artist) + '&track_name=' + encodeURIComponent(song.title) + (song.dur ? '&duration=' + song.dur : ''), 6000); return j && j.syncedLyrics ? j.syncedLyrics : null; } catch (e) { return null; } }
  function lrcTimes(lrc) { const o = []; String(lrc || '').split('\n').forEach(l => { const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/); if (m && m[3].trim()) o.push(+m[1] * 60 + +m[2]); }); return o; }
  // Taktlage (s) aus den Zeilenanfängen: Kreis-Mittelwert der Zeiten modulo Schlaglänge, nur wenn eindeutig genug
  function phaseFrom(times, bpm) { const P = 60 / bpm; let x = 0, y = 0; times.forEach(t => { const a = 2 * Math.PI * (t / P); x += Math.cos(a); y += Math.sin(a); }); const n = times.length; if (n < 6) return null; const R = Math.hypot(x, y) / n; if (R < 0.3) return null; return { beat0: ((Math.atan2(y, x) / (2 * Math.PI) * P) + P) % P, conf: R }; }
  // Tempo aus der 30-s-Hörprobe von iTunes (CORS frei): Einsatz-Hüllkurve → Autokorrelation (wie die Takt-Erkennung in Groove Arena)
  async function tempoOf(url) {
    if (!url) return null; const AC = root.OfflineAudioContext || root.webkitOfflineAudioContext; if (!AC) return null;
    const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 9000);
    let buf; try { const r = await fetch(url, { signal: ac.signal, referrerPolicy: 'no-referrer' }); if (!r.ok) return null; buf = await r.arrayBuffer(); } catch (e) { return null; } finally { clearTimeout(tm); }
    let au; try { const oc = new AC(1, 22050, 22050); au = await new Promise((res, rej) => { const p = oc.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); }); } catch (e) { return null; }
    const d = au.getChannelData(0), sr = au.sampleRate, hop = Math.round(sr / 100), s = []; let lp = 0, prevL = 0, prevH = 0; const k = 1 - Math.exp(-2 * Math.PI * 180 / sr);
    for (let i = 0; i + hop <= d.length; i += hop) { let eL = 0, eH = 0; for (let j = i; j < i + hop; j++) { lp += k * (d[j] - lp); eL += lp * lp; const h = d[j] - lp; eH += h * h; }
      const L = Math.log(1e-6 + eL), H = Math.log(1e-6 + eH); s.push({ t: i / sr, v: Math.max(0, L - prevL) * 1.6 + Math.max(0, H - prevH) }); prevL = L; prevH = H; }
    return tempo(s);
  }
  function tempo(samples) {
    const lo = 72, hi = 178; if (samples.length < 60) return null; const t0 = samples[0].t, t1 = samples[samples.length - 1].t, hz = 100, n = Math.floor((t1 - t0) * hz); if (n < 300) return null;
    const g = new Float32Array(n); for (const s of samples) { const i = Math.round((s.t - t0) * hz); if (i >= 0 && i < n) g[i] = Math.max(g[i], s.v); }
    for (let i = 1; i < n; i++) g[i] = Math.max(g[i], g[i - 1] * 0.55);
    let mean = 0; for (let i = 0; i < n; i++) mean += g[i]; mean /= n; for (let i = 0; i < n; i++) g[i] -= mean;
    const cand = [];
    for (let bpm = lo; bpm <= hi; bpm += 0.5) { const lag = 60 / bpm * hz; let ac = 0, c = 0; for (let k = 1; k <= 4; k++) { const L0 = lag * k; for (let i = 0; i + L0 + 1 < n; i += 2) { const j = i + L0, jf = Math.floor(j), fr = j - jf; ac += g[i] * (g[jf] * (1 - fr) + g[jf + 1] * fr); c++; } } ac /= c || 1; const prior = Math.exp(-Math.pow(Math.log2(bpm / 120), 2) / (2 * 0.45 * 0.45)); cand.push({ bpm, s: ac * (0.55 + 0.45 * prior) }); }
    cand.sort((a, b) => b.s - a.s); const best = cand[0]; if (!best || best.s <= 0) return null;
    const comb = (P, ph) => { let v = 0; for (let t = ph; t < t1 - t0; t += P) { const i = Math.round(t * hz); if (i < n) v += g[i]; } return v; };
    let bv = -1e9, fb = best.bpm; for (let bpm = best.bpm - 1; bpm <= best.bpm + 1.001; bpm += 0.05) { const P = 60 / bpm; for (let ph = 0; ph < P; ph += 0.02) { const v = comb(P, ph); if (v > bv) { bv = v; fb = bpm; } } }
    const second = cand.find(c => Math.abs(c.bpm - best.bpm) > 4 && Math.abs(c.bpm * 2 - best.bpm) > 3 && Math.abs(c.bpm / 2 - best.bpm) > 3);
    return { bpm: Math.round(fb * 10) / 10, conf: second ? Math.max(0, Math.min(1, (best.s - second.s) / Math.abs(best.s) * 2)) : 1 };
  }

  /* ---------- YouTube-Player (offizielle IFrame-API) ---------- */
  let apiP = null;
  function loadApi() { if (root.YT && root.YT.Player) return Promise.resolve(); if (apiP) return apiP; apiP = new Promise((res, rej) => { const prev = root.onYouTubeIframeAPIReady; root.onYouTubeIframeAPIReady = () => { if (prev) try { prev(); } catch (e) { /* egal */ } res(); }; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => { apiP = null; rej(new Error('yt')); }; document.head.appendChild(s); setTimeout(() => { if (!(root.YT && root.YT.Player)) { apiP = null; rej(new Error('yt-timeout')); } }, 15000); }); return apiP; }
  // Spieler mit sauberer Zeit (zwischen den Abfragen weich hochgezählt). cb(ev, P): ready | state | error
  function player(el, id, cb, opt) {
    const P = { ready: false, t0: 0, at: 0, state: -1, dur: 0, err: null };
    loadApi().then(() => {
      P.yt = new root.YT.Player(el, { videoId: id, host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%', playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: opt && opt.controls ? 1 : 0, fs: 0, iv_load_policy: 3, disablekb: 1, origin: location.origin && location.origin !== 'null' ? location.origin : undefined },
        events: { onReady: () => { P.ready = true; try { P.dur = P.yt.getDuration(); } catch (e) { /* egal */ } if (cb) cb('ready', P); }, onStateChange: e => { P.state = e.data; P.sync(); if (cb) cb('state', P); }, onError: e => { P.err = e.data; if (cb) cb('error', P); } } });
    }).catch(() => { P.err = 'api'; if (cb) cb('error', P); });
    P.sync = () => { try { const t = P.yt.getCurrentTime(), now = performance.now(), pred = P.t0 + (P.state === 1 ? (now - P.at) / 1000 : 0), d = t - pred; P.t0 = P.state === 1 && Math.abs(d) < 0.25 ? pred + d * 0.25 : t; P.at = now; } catch (e) { /* egal */ } };
    P.time = () => { if (!P.ready) return 0; const now = performance.now(); if (now - P.at > 250) P.sync(); return P.state === 1 ? P.t0 + (now - P.at) / 1000 : P.t0; };
    P.play = () => { try { P.yt.playVideo(); } catch (e) { /* egal */ } }; P.pause = () => { try { P.yt.pauseVideo(); } catch (e) { /* egal */ } };
    P.seek = s => { try { P.yt.seekTo(s, true); P.t0 = s; P.at = performance.now(); } catch (e) { /* egal */ } };
    P.vol = v => { try { P.yt.setVolume(v); } catch (e) { /* egal */ } }; P.destroy = () => { try { P.yt.destroy(); } catch (e) { /* egal */ } };
    P.playing = () => P.state === 1; P.ended = () => P.state === 0; P.duration = () => { try { return P.yt.getDuration() || P.dur; } catch (e) { return P.dur; } };
    P.info = () => { try { return P.yt.getVideoData() || {}; } catch (e) { return {}; } };
    return P;
  }
  root.SMYVMedia = { songs, videos, videoFor, lyrics, lrcTimes, phaseFrom, tempoOf, tempo, idFromUrl, player, loadApi };
})(typeof window !== 'undefined' ? window : globalThis);
