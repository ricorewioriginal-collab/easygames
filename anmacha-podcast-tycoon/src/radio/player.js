/* Echter Radio-Player: AnMaCha24 und die anderen Sender von meinradio.com live über laut.fm (Muster wie anmacha-markthalle).
   Startet nur nach Klick (Autoplay-Regeln), „Jetzt läuft“ alle 30 s nur während der Wiedergabe, Spielmusik wird solange stumm geschaltet. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const KEY = 'anmachaPodcastTycoon.radio.v1';
  const P = PT.RadioPlayer = { slug: 'anmacha24', vol: 0.7, playing: false, loading: false, err: '', song: '' };
  let el = null, token = 0, songTimer = null, startTimer = null;
  const subs = new Set();
  try { const j = JSON.parse(root.localStorage.getItem(KEY) || 'null'); if (j) { if (typeof j.slug === 'string') P.slug = j.slug; if (typeof j.vol === 'number') P.vol = Math.max(0, Math.min(1, j.vol)); } } catch (e) { /* ohne Speicher */ }
  const save = () => { try { root.localStorage.setItem(KEY, JSON.stringify({ slug: P.slug, vol: P.vol })); } catch (e) { /* egal */ } };
  const stations = () => (PT.Radio && PT.Radio.STATIONS) || [{ slug: 'anmacha24', name: 'AnMaCha24' }];
  P.station = () => stations().find(s => s.slug === P.slug) || stations()[0];
  const emit = () => subs.forEach(f => { try { f(P); } catch (e) { /* Anzeige darf den Player nicht stören */ } });
  P.subscribe = f => { subs.add(f); return () => subs.delete(f); };
  const duck = on => { if (PT.Audio && PT.Audio.duck) PT.Audio.duck(on); };

  function fail(msg, t) {
    if (t !== token) return;
    P.err = msg; P.loading = false; P.playing = false; release(); emit();
  }
  function release() {
    clearInterval(songTimer); songTimer = null; clearTimeout(startTimer); startTimer = null; duck(false);
    if (el) { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) { /* schon frei */ } }
  }
  function song(t) {
    if (t !== token || !P.playing || typeof fetch !== 'function') return;
    const slug = P.slug, ac = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(() => ac && ac.abort(), 7000);
    fetch('https://api.laut.fm/station/' + encodeURIComponent(slug) + '/current_song', ac ? { signal: ac.signal } : undefined)
      .then(r => (r.ok ? r.json() : null)).then(j => { clearTimeout(to); if (t !== token || !j) return; P.song = (j.artist && j.artist.name ? j.artist.name + ' – ' : '') + (j.title || ''); emit(); })
      .catch(() => { clearTimeout(to); });
  }
  /** Sender abspielen (nur aus einem Klick heraus aufrufen). */
  P.play = function (slug) {
    if (slug && stations().some(s => s.slug === slug)) P.slug = slug;
    save(); release(); const t = ++token;
    P.err = ''; P.song = ''; P.playing = false; P.loading = true; emit();
    if (typeof root.Audio !== 'function') { fail('Dein Browser kann keine Radio-Streams abspielen.', t); return; }
    if (!el) {
      el = new root.Audio(); el.preload = 'none';
      el.addEventListener('playing', () => { if (el._t !== token) return; P.playing = true; P.loading = false; P.err = ''; clearTimeout(startTimer); duck(true); emit(); if (!songTimer) { song(token); songTimer = setInterval(() => song(token), 30000); } });
      el.addEventListener('error', () => { if (el._t === token && el.getAttribute('src')) fail('Stream nicht erreichbar – Internet prüfen oder später nochmal versuchen.', token); });
    }
    el._t = t; el.volume = P.vol; el.src = 'https://stream.laut.fm/' + encodeURIComponent(P.slug);
    startTimer = setTimeout(() => { if (!P.playing) fail('Der Sender antwortet nicht. Vielleicht blockiert das Netz Radio-Streams.', t); }, 15000);
    let pr; try { pr = el.play(); } catch (e) { fail('Abspielen nicht möglich.', t); return; }
    if (pr && pr.catch) pr.catch(e => { if (e && e.name === 'NotAllowedError') fail('Der Browser hat das Abspielen blockiert – tippe nochmal auf „Abspielen“.', t); else if (e && e.name !== 'AbortError') fail('Stream nicht erreichbar – Internet prüfen oder später nochmal versuchen.', t); });
  };
  P.stop = function () { token++; P.playing = false; P.loading = false; P.song = ''; release(); emit(); };
  P.toggle = slug => { if ((P.playing || P.loading) && (!slug || slug === P.slug)) P.stop(); else P.play(slug); };
  P.setVolume = function (v) { P.vol = Math.max(0, Math.min(1, +v || 0)); if (el) el.volume = P.vol; save(); };
  P.active = () => P.playing || P.loading;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
