import { EVENTS } from './events.js';

// Songs laufen über die bestehende Deezer-Suche. Es werden keine Audiodateien gespeichert.
const base = EVENTS.filter(event => !event.cancelled && event.year !== 1969).map(event => ({
  id: `song:${event.year}`, work: `ESC ${event.year} · ${event.winner}`, title: event.song,
  artist: event.artist, event, world: event.world, category: event.category
}));
const tie = [
  ['Spanien', 'Salomé', 'Vivo cantando'],
  ['Vereinigtes Königreich', 'Lulu', 'Boom Bang-a-Bang'],
  ['Niederlande', 'Lenny Kuhr', 'De troubadour'],
  ['Frankreich', 'Frida Boccara', 'Un jour, un enfant']
].map(([country, artist, title], i) => {
  const event = EVENTS.find(e => e.year === 1969);
  return { id: `song:1969:${i}`, work: `ESC 1969 · ${country}`, title, artist, event, world: event.world, category: event.category };
});
export const SONGS = [...base, ...tie];
export const CLIPS = {};
export const songFor = event => SONGS.find(song => song.event === event) || null;
export function clipSource() { return null; }
export function introSource() { return null; }
export function songChoices(item, pool = SONGS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  const choices=[item.work,...others.slice(0,3)];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
}
