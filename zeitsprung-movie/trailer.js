import { VIDEOS } from './tracks.js';

// Konkrete, kuratierte YouTube-Videos im Privacy-Enhanced-Embed.
// Die Trailer bleiben im Spiel; fremde Videos und vollständige Filme werden nicht kopiert.
export function sourcesFor(film) {
  const id = VIDEOS[film.title];
  return id ? [{ name: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0` }] : [];
}
