import { EVENTS } from './events.js';

// Songs laufen über die bestehende Deezer-Suche. Es werden keine Audiodateien gespeichert.
const OFFICIAL_VIDEOS = { 1974: '4XJBNJ2wq0Y', 2024: 'CO_qJf-nW0k', 2025: 'onOex2WXjbA', 2026: 'EltgrumKJfk' };
const citySlugs = { 'Frankfurt am Main':'frankfurt', 'Den Haag':'the-hague', 'Göteborg':'gothenburg', 'München':'munich', 'Wien':'vienna', 'Kyjiw':'kyiv', 'Lissabon':'lisbon', 'Rom':'rome', 'Athen':'athens', 'Belgrad':'belgrade', 'Moskau':'moscow', 'Kopenhagen':'copenhagen', 'Neapel':'naples', 'Brüssel':'brussels', 'Luxemburg':'luxembourg' };
const officialPage = event => `https://www.eurovision.com/eurovision-song-contest/${citySlugs[event.city] || event.city.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${event.year}/`;
const base = EVENTS.filter(event => !event.cancelled && event.year !== 1969).map(event => ({
  id: `song:${event.year}`, work: `ESC ${event.year} · ${event.winner}`, title: event.song,
  artist: event.artist, event, world: event.world, category: event.category, youtubeId: OFFICIAL_VIDEOS[event.year], officialPage: officialPage(event)
}));
const tie = [
  ['Spanien', 'Salomé', 'Vivo cantando'],
  ['Vereinigtes Königreich', 'Lulu', 'Boom Bang-a-Bang'],
  ['Niederlande', 'Lenny Kuhr', 'De troubadour'],
  ['Frankreich', 'Frida Boccara', 'Un jour, un enfant']
].map(([country, artist, title], i) => {
  const event = EVENTS.find(e => e.year === 1969);
  return { id: `song:1969:${i}`, work: `ESC 1969 · ${country}`, title, artist, event, world: event.world, category: event.category, officialPage: officialPage(event) };
});
export const SONGS = [...base, ...tie];
export const CLIPS = {};
export const songFor = event => SONGS.find(song => song.event === event) || null;
export function clipSource() { return null; }
export function introSource(song) {
  if (!song?.youtubeId) return null;
  return { name: 'YouTube', kind: 'intro', src: `https://www.youtube-nocookie.com/embed/${song.youtubeId}?autoplay=1&playsinline=1&rel=0`, page: `https://www.youtube.com/watch?v=${song.youtubeId}`, what: 'ESC-Siegersong' };
}
export function songChoices(item, pool = SONGS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  const choices=[item.work,...others.slice(0,3)];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
}
