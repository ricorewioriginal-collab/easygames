/* AnMaCha – Der Podcast – Radio & Podcast im Spiel.
   Sender: die 13 AnMaCha-/RicoReWi-Sender live von laut.fm (Stream + „Jetzt läuft“ über api.laut.fm).
   Podcast: offizielle Folgen direkt vom Podcast-Hoster (podcaster.de) – Liste aus dem RSS-Feed, sonst aus dem iTunes-Verzeichnis,
   sonst die eingebaute Liste. Nichts wird kopiert oder neu gehostet; abgespielt wird immer das Original. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const D = AMC.Data;
  const KEY = 'anmachaPodcastTycoon.media.v1';
  const M = AMC.Media = {
    kind: '', slug: 'anmacha24', ep: 0, playing: false, loading: false, err: '',
    title: '', artist: '', pos: 0, dur: 0, episodes: D.EPISODES.slice(), feedState: 'eingebaut'
  };
  let el = null, token = 0, songTimer = null, startTimer = null, store = { slug: 'anmacha24', ep: 0, pos: {} };
  const subs = new Set();
  try { Object.assign(store, JSON.parse(root.localStorage.getItem(KEY) || '{}')); } catch (e) { /* ohne Speicher */ }
  M.slug = store.slug || 'anmacha24'; M.ep = store.ep || 0;
  const save = () => { try { root.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* egal */ } };
  const emit = () => subs.forEach(f => { try { f(M); } catch (e) { /* Anzeige darf nichts stören */ } });
  M.subscribe = f => { subs.add(f); return () => subs.delete(f); };
  M.station = () => D.STATIONS.find(s => s.slug === M.slug) || D.STATIONS[0];
  M.episode = () => M.episodes[M.ep] || M.episodes[0];
  M.active = () => M.playing || M.loading;

  function audio() {
    if (el) return el;
    el = new root.Audio(); el.preload = 'none'; el.setAttribute('playsinline', '');
    el.addEventListener('playing', () => {
      if (el._t !== token) return;
      M.playing = true; M.loading = false; M.err = ''; clearTimeout(startTimer); duck(true); emit();
      if (M.kind === 'radio' && !songTimer) { song(token); songTimer = setInterval(() => song(token), 20000); }
    });
    el.addEventListener('timeupdate', () => {
      if (M.kind !== 'podcast') return;
      M.pos = el.currentTime || 0; M.dur = isFinite(el.duration) ? el.duration : (M.episode().dur || 0);
      const now = Date.now(); if (!el._saved || now - el._saved > 5000) { el._saved = now; store.pos[M.episode().url] = M.pos; save(); }
      emit();
    });
    el.addEventListener('ended', () => { if (M.kind === 'podcast') { store.pos[M.episode().url] = 0; save(); M.next(); } });
    el.addEventListener('error', () => { if (el._t === token && el.getAttribute('src')) fail(M.kind === 'radio' ? 'Sender nicht erreichbar – Internet prüfen.' : 'Folge nicht erreichbar – Internet prüfen.', token); });
    el.addEventListener('stalled', () => { if (M.kind === 'radio' && M.playing) setTimeout(() => { if (el && el._t === token && el.paused && M.playing) restart(); }, 3500); });
    return el;
  }
  const duck = on => { if (AMC.Audio) AMC.Audio.duck(on); };
  function fail(msg, t) { if (t !== token) return; M.err = msg; M.loading = false; M.playing = false; release(); emit(); }
  function release() {
    clearInterval(songTimer); songTimer = null; clearTimeout(startTimer); startTimer = null; duck(false);
    if (el) { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) { /* schon frei */ } }
  }
  function song(t) {
    if (t !== token || M.kind !== 'radio' || typeof fetch !== 'function' || document.hidden) return;
    const slug = M.slug, ac = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(() => ac && ac.abort(), 7000);
    fetch('https://api.laut.fm/station/' + encodeURIComponent(slug) + '/current_song', Object.assign({ cache: 'no-store' }, ac ? { signal: ac.signal } : {}))
      .then(r => (r.ok ? r.json() : null)).then(j => {
        clearTimeout(to); if (t !== token || !j || slug !== M.slug) return;
        const nt = String(j.title || ''), na = j.artist && j.artist.name ? String(j.artist.name) : '';
        if (nt !== M.title || na !== M.artist) { M.title = nt; M.artist = na; emit(); if (AMC.onSong) AMC.onSong(M); }
      }).catch(() => clearTimeout(to));
  }
  function start(src, t) {
    const a = audio(); a._t = t; a.volume = AMC.Save.data.settings.radio; a.src = src;
    startTimer = setTimeout(() => { if (!M.playing && t === token) fail('Keine Antwort – vielleicht blockiert das Netz Audio-Streams.', t); }, 15000);
    let pr; try { pr = a.play(); } catch (e) { fail('Abspielen nicht möglich.', t); return; }
    if (pr && pr.catch) pr.catch(e => {
      if (t !== token) return;
      if (e && e.name === 'NotAllowedError') fail('Der Browser hat das Abspielen blockiert – bitte nochmal antippen.', t);
      else if (e && e.name !== 'AbortError') fail('Nicht erreichbar – Internet prüfen.', t);
    });
  }
  function restart() { if (M.kind === 'radio') M.playStation(M.slug); }

  /** Sender abspielen (aus einer Bedienhandlung heraus aufrufen). */
  M.playStation = function (slug) {
    if (slug && D.STATIONS.some(s => s.slug === slug)) M.slug = slug;
    store.slug = M.slug; save(); release(); const t = ++token;
    Object.assign(M, { kind: 'radio', err: '', title: '', artist: '', playing: false, loading: true, pos: 0, dur: 0 }); emit(); duck(true);   // sofort leiser: man hört gleich, dass das Radio startet
    if (typeof root.Audio !== 'function') return fail('Dein Gerät kann keine Streams abspielen.', t);
    start('https://stream.laut.fm/' + encodeURIComponent(M.slug) + '?t=' + Date.now(), t);
  };
  /** Podcast-Folge abspielen (setzt an der gemerkten Stelle fort). */
  M.playEpisode = function (i) {
    if (i != null) M.ep = Math.max(0, Math.min(M.episodes.length - 1, i));
    store.ep = M.ep; save(); release(); const t = ++token, ep = M.episode();
    Object.assign(M, { kind: 'podcast', err: '', title: ep.nr + ' – ' + ep.title, artist: D.PODCAST.name, playing: false, loading: true, pos: store.pos[ep.url] || 0, dur: ep.dur || 0 }); emit();
    if (typeof root.Audio !== 'function') return fail('Dein Gerät kann keine Folgen abspielen.', t);
    start(ep.url, t);
    const a = audio(), seek = store.pos[ep.url] || 0;
    if (seek > 5) a.addEventListener('loadedmetadata', function f() { a.removeEventListener('loadedmetadata', f); if (a._t === t) try { a.currentTime = seek; } catch (e) { /* egal */ } });
  };
  M.stop = function () { token++; M.playing = false; M.loading = false; release(); emit(); };
  M.toggle = function () { if (M.active()) M.stop(); else if (M.kind === 'podcast') M.playEpisode(); else M.playStation(); };
  M.seek = function (sec) { if (el && M.kind === 'podcast' && M.playing) try { el.currentTime = Math.max(0, Math.min((el.duration || 1e9) - 1, el.currentTime + sec)); } catch (e) { /* egal */ } };
  M.next = function () { if (M.kind === 'podcast') M.playEpisode((M.ep + 1) % M.episodes.length); else M.cycle(1); };
  /** Durch Podcast + 13 Sender schalten (LB / N im Spiel). */
  M.cycle = function (dir) {
    const list = ['podcast'].concat(D.STATIONS.map(s => s.slug));
    const cur = M.kind === 'podcast' ? 0 : list.indexOf(M.slug);
    const n = list[(Math.max(0, cur) + (dir || 1) + list.length) % list.length];
    if (n === 'podcast') M.playEpisode(); else M.playStation(n);
  };
  M.setVolume = v => { AMC.Save.data.settings.radio = Math.max(0, Math.min(1, +v || 0)); if (el) el.volume = AMC.Save.data.settings.radio; };
  /** Kurzer Text für die Titelanzeige. */
  M.label = function () {
    if (M.kind === 'podcast') { const ep = M.episode(); return { src: '🎙️ ' + D.PODCAST.name, main: ep.nr + ' – ' + ep.title, sub: M.dur ? AMC.U.time(M.pos) + ' / ' + AMC.U.time(M.dur) : 'Folge vom ' + ep.date.split('-').reverse().join('.') }; }
    const s = M.station(); return { src: s.icon + ' ' + s.name, main: M.title ? M.title : (M.loading ? 'Verbinde …' : s.desc), sub: M.title ? M.artist : 'live · laut.fm' };
  };

  // ------------------------------------------------------------------ Folgenliste aktualisieren (Feed → iTunes → eingebaut)
  function setEpisodes(list, state) {
    if (!list || !list.length) return false;
    const cur = M.episode() && M.episode().url;
    M.episodes = list; M.feedState = state;
    const i = list.findIndex(e => e.url === cur); M.ep = i >= 0 ? i : 0;
    emit(); return true;
  }
  function nrOf(t) { const m = /(Spezial\s*#?\s*\d+|#\s*\d+)/i.exec(t); return m ? m[1].replace(/\s+/g, ' ').replace('# ', '#') : '🎙️'; }
  function cleanTitle(t) { return String(t).replace(/^AnMaCha\s*(-|–)?\s*(Der Podcast)?\s*(-|–)?\s*/i, '').replace(/^(Spezial\s*)?#\s*\d+\s*(\([^)]*\))?\s*(-|–)\s*/i, '').trim() || t; }
  function fromRss(xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml'), out = [];
    doc.querySelectorAll('item').forEach(it => {
      const enc = it.querySelector('enclosure'), t = (it.querySelector('title') || {}).textContent || '';
      if (!enc || !enc.getAttribute('url')) return;
      const d = new Date((it.querySelector('pubDate') || {}).textContent || 0), du = (it.getElementsByTagName('itunes:duration')[0] || {}).textContent || '';
      const secs = du.split(':').reduce((a, b) => a * 60 + (+b || 0), 0);
      const desc = ((it.querySelector('description') || {}).textContent || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
      out.push({ nr: nrOf(t), title: cleanTitle(t), url: enc.getAttribute('url').replace(/^http:/, 'https:'), date: isNaN(d) ? '' : d.toISOString().slice(0, 10), dur: secs, desc });
    });
    return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  function fromItunes() {
    return new Promise((res, rej) => {
      const cb = '__amcItunes' + Date.now(), s = document.createElement('script'), to = setTimeout(() => { cleanup(); rej(new Error('timeout')); }, 8000);
      const cleanup = () => { clearTimeout(to); delete root[cb]; s.remove(); };
      root[cb] = j => { cleanup(); res((j.results || []).filter(r => r.kind === 'podcast-episode' && r.episodeUrl).map(r => ({ nr: nrOf(r.trackName), title: cleanTitle(r.trackName), url: r.episodeUrl.replace(/^http:/, 'https:'), date: (r.releaseDate || '').slice(0, 10), dur: Math.round((r.trackTimeMillis || 0) / 1000), desc: String(r.description || '').replace(/\s+/g, ' ').slice(0, 180) })).sort((a, b) => b.date.localeCompare(a.date))); };
      s.onerror = () => { cleanup(); rej(new Error('jsonp')); };
      s.src = 'https://itunes.apple.com/lookup?id=' + D.PODCAST.itunes + '&entity=podcastEpisode&limit=200&callback=' + cb;
      document.head.appendChild(s);
    });
  }
  M.refresh = function () {
    if (M._refreshing || typeof fetch !== 'function' || (root.navigator && root.navigator.onLine === false)) return;
    M._refreshing = true;
    const ac = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(() => ac && ac.abort(), 8000);
    fetch(D.PODCAST.feed, ac ? { signal: ac.signal } : undefined).then(r => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(x => { clearTimeout(to); if (!setEpisodes(fromRss(x), 'Feed')) throw new Error('leer'); })
      .catch(() => { clearTimeout(to); return fromItunes().then(l => setEpisodes(l, 'Verzeichnis')); })
      .catch(() => { /* eingebaute Liste bleibt */ });
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && M.kind === 'radio' && M.playing) song(token); });
})(typeof window !== 'undefined' ? window : globalThis);
