import { EVENTS } from './events.js';
import { SEASONS, SHOW_INFO } from './shows.js';

// Videos: konkrete YouTube-Videos (meist offizielle Kanäle), jede ID per oEmbed geprüft.
// Eingebettet wird der datenschutzfreundliche Player youtube-nocookie.com, erst auf Knopfdruck.
// Moment | YouTube-ID | was zu sehen ist
const rows = `Sieg bei Britain’s Got Talent: Paul Potts|dnp-8GrHOIk|Paul Potts singt „Nessun Dorma“ im Casting
Susan Boyle singt im BGT-Casting „I Dreamed a Dream“|yE1Lxw5ZyXk|Susan Boyle im Casting von Britain’s Got Talent
Sieg bei Britain’s Got Talent: Diversity|jtJeSrXuQ68|Diversity kehren zehn Jahre nach ihrem Sieg ins Finale zurück
Loren Allred bekommt bei BGT den Goldenen Buzzer|oTw8AECmUNA|Loren Allred singt „Never Enough“
One Direction formieren sich bei The X Factor (UK)|VclS_bw2oRo|die fünf Einzel-Castings und der erste Auftritt als Gruppe
Sieg bei The X Factor (UK): Leona Lewis|sxbX-z5-QHs|Siegersingle „A Moment Like This“
Sieg bei American Idol: Kelly Clarkson|S7b8ADhadJU|Siegersingle „A Moment Like This“
Sieg bei American Idol: Carrie Underwood|OptOGu3Nl5M|Siegersingle „Inside Your Heaven“ (Audio)
William Hung singt „She Bangs“ im American-Idol-Casting|PxOQriOSFdQ|das Casting von William Hung
Sieg bei Pop Idol: Will Young|Bc-sq7cJGho|Siegersingle „Evergreen“
Tanzcrew Unreal bekommt bei AGT den Goldenen Buzzer|kKcfFw_ds_Q|Unreal im Casting von America’s Got Talent
Sieg bei DSDS: Alexander Klaws|DmgDOFtzRFA|Siegersong „Take Me Tonight“
Sieg bei DSDS: Mark Medlock|wHN8AJZsSx0|Siegersong „Now or Never“
Sieg bei DSDS: Tobias Regner|KwtVAEn31kM|Siegersong „I Still Burn“ (Audio)
Sieg bei DSDS: Pietro Lombardi|sIzuc5N5nGE|Siegersong „Call My Name“ (Audio)
Sieg bei DSDS: Beatrice Egli|rvBBMSfF31w|Siegersong „Mein Herz“
Sieg bei DSDS: Ramon Roselly|m1OmuKPsedY|Ramon Roselly singt „Eine Nacht“ im Finale
Daniel Küblböck wird Dritter bei DSDS|iOKmZSvL-Ng|Daniel Küblböck singt „Heartbeat“
DSDS-Allstars singen „We Have a Dream“|4HNzj7mUwDo|die DSDS-Allstars mit Dieter Bohlen am Flügel
Alicia-Awa bekommt im DSDS-Casting die Goldene CD|4hQcS-ax_vY|Alicia-Awa singt „Stay“ im Casting
Nicole Frolov singt „Never Enough“ im DSDS-Casting|0aLK9kyzLTI|Nicole Frolov im DSDS-Casting
Bewerbungsstart für DSDS-Staffel 23|_fpn-Dhntt0|Bewerbungs-Trailer von RTL
Sieg bei Popstars: No Angels|L75D2i7wkdE|erste Single „Daylight in Your Eyes“
Sieg bei Popstars: Monrose|P6IoPxRdXZo|erste Single „Shame“
Sieg bei Unser Star für Oslo: Lena Meyer-Landrut|8QSgNM9yNjo|offizielles Video zu „Satellite“
Lena gewinnt den Eurovision Song Contest in Oslo|7pL9vdpSvnY|Lena singt „Satellite“ im ESC-Finale
Sieg bei The Voice of Germany: Andreas Kümmert|TpV-waaO4kY|Andreas Kümmert singt „Rocket Man“ in den Blind Auditions
Matthias Nebel singt „Bed of Roses“ in den Blind Auditions|xGcQev48cXU|Matthias Nebel bei The Voice of Germany
Coaches eröffnen The Voice of Germany mit „As It Was“|bN4rVnjA_NY|das Staffel-Opening der Coaches
Georgia Balke singt „Creep“ beim Supertalent|13_2BDT7KL4|Georgia Balke im Supertalent-Casting
Sieg bei Das Supertalent: Alexa Lauenburger|DBDNHTyc_fU|Alexa zeigt ihre Dressurnummer mit acht Hunden`;

export const CLIPS = Object.fromEntries(rows.split('\n').map(line => { const [title, id, what] = line.split('|'); return [title, { id, what }]; }));

export function clipSource(event) {
  const clip = CLIPS[event?.title];
  if (!clip) return null;
  return { name: 'YouTube', kind: 'clip', src: `https://www.youtube-nocookie.com/embed/${clip.id}?autoplay=1&playsinline=1&rel=0`, page: `https://www.youtube.com/watch?v=${clip.id}`, what: clip.what };
}

// Songs: Sieger- und Finalsongs, die die Deezer-Suche findet (Spalte „Deezer“ in shows.js).
// Abgespielt wird ausschließlich über den Deezer-Player (siehe music.js).
// In Songrunden wird die Show gesucht, aus der der Song stammt (der Deezer-Player zeigt Titel und Interpret).
const eventBySeason = new Map(EVENTS.filter(event => event.season).map(event => [event.season.id, event]));
export const SONGS = SEASONS.filter(season => season.song?.deezer).map(season => {
  const event = eventBySeason.get(season.id);
  return { id: `song:${season.id}`, title: season.song.title, artist: season.song.artist, work: SHOW_INFO[season.show].full || SHOW_INFO[season.show].name, event, category: event.category, world: event.world };
});
export const songFor = event => SONGS.find(song => song.event === event) || null;

export function songChoices(item, pool = SONGS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  return [item.work, ...others.sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
}
