// Deezer-Suche und offizieller eingebetteter Deezer-Player. Keine Musikdateien werden kopiert.
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const pending = new Map();

export function resolveDeezer(item) {
  if (pending.has(item.id)) return pending.get(item.id);
  const promise = new Promise(resolve => {
    const callback = `zcDeezer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    let done = false;
    const finish = value => { if (done) return; done = true; clearTimeout(timer); delete window[callback]; script.remove(); resolve(value); };
    window[callback] = data => {
      const title = normalize(item.title), artist = normalize(item.artist.split(/ feat\.| & |, /i)[0]);
      const candidates = Array.isArray(data?.data) ? data.data : [];
      const best = candidates.map(entry => {
        const foundTitle = normalize(entry.title_short || entry.title), foundArtist = normalize(entry.artist?.name);
        const titleMatch = foundTitle === title ? 5 : foundTitle.includes(title) || title.includes(foundTitle) ? 3 : 0;
        const artistMatch = foundArtist === artist ? 4 : foundArtist.includes(artist) || artist.includes(foundArtist) ? 2 : 0;
        return { id: entry.id, score: titleMatch + artistMatch };
      }).sort((a,b) => b.score-a.score)[0];
      finish(best?.score >= 5 && Number.isSafeInteger(best.id) ? best.id : null);
    };
    const timer = setTimeout(() => finish(null), 6500);
    script.onerror = () => finish(null);
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(`${item.artist} ${item.title}`)}&output=jsonp&callback=${callback}`;
    document.head.append(script);
  });
  pending.set(item.id, promise);
  return promise;
}

export function musicSources(deezerId) {
  return deezerId ? [{ name: 'Deezer', kind: 'song', src: `https://widget.deezer.com/widget/dark/track/${deezerId}` }] : [];
}
