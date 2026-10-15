// Offizielle eingebettete Player: Deezer (30-Sekunden-Vorschau), Spotify und
// YouTube Privacy Enhanced. Keine Audio-Datei wird kopiert oder zwischengespeichert.
import { VIDEOS } from './tracks.js';

// Verifizierte Spotify-Titel-IDs. Nur Originalinterpretationen auswählen.
export const SPOTIFY = {
  'Bohemian Rhapsody':'4u7EnebtmKWzUH433cf5Qv',
  'Never Gonna Give You Up':'4PTG3Z6ehGkBFwjybzWkR8',
  'Take On Me':'05tfeQK6dSLpjYj46UMJK1',
  'Billie Jean':'1Rt3oh7shVSWj6q2MieDHa',
  'Gangnam Style':'5Xxg4gH02KvfYIHJrzs1rb',
  'Smells Like Teen Spirit':'5ghIJDpPoe3CfHMGu71E6T',
  'Shape of You':'7qiZfU4dY1lWllzX7mPBI3',
  'Blinding Lights':'0sf12qNH5qcw8qpgymFOqD'
};

const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const pending = new Map();

/** Sucht eine Deezer-Track-ID per öffentlicher JSONP-Suche, ohne API-Schlüssel. */
export function resolveDeezer(track) {
  if (pending.has(track.id)) return pending.get(track.id);
  const promise = new Promise(resolve => {
    const callback = `zrDeezer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    let done = false;
    const finish = value => { if (done) return; done = true; clearTimeout(timer); delete window[callback]; script.remove(); resolve(value); };
    window[callback] = data => {
      const title = normalize(track.title), artist = normalize(track.artist.split(/ feat\.| & |, /i)[0]);
      const candidates = Array.isArray(data?.data) ? data.data : [];
      const best = candidates.map(item => {
        const itemTitle = normalize(item.title_short || item.title), itemArtist = normalize(item.artist?.name);
        const titleMatch = itemTitle === title ? 5 : itemTitle.includes(title) || title.includes(itemTitle) ? 3 : 0;
        const artistMatch = itemArtist === artist ? 4 : itemArtist.includes(artist) || artist.includes(itemArtist) ? 2 : 0;
        return { id: item.id, score: titleMatch + artistMatch };
      }).sort((a,b) => b.score-a.score)[0];
      finish(best?.score >= 5 && Number.isSafeInteger(best.id) ? best.id : null);
    };
    const timer = setTimeout(() => finish(null), 6500);
    script.onerror = () => finish(null);
    const query = `${track.artist.split(/ feat\./i)[0]} ${track.title}`;
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=${callback}`;
    document.head.append(script);
  });
  pending.set(track.id, promise);
  return promise;
}

export function sourcesFor(track, deezerId = null) {
  const sources = [];
  if (deezerId) sources.push({ name: 'Deezer', src: `https://widget.deezer.com/widget/dark/track/${deezerId}` });
  if (SPOTIFY[track.title]) sources.push({ name: 'Spotify', src: `https://open.spotify.com/embed/track/${SPOTIFY[track.title]}?utm_source=generator` });
  if (VIDEOS[track.title]) sources.push({ name: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${VIDEOS[track.title]}?autoplay=1&playsinline=1&rel=0` });
  return sources;
}
