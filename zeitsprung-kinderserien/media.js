import { EVENTS } from './events.js';

// Wiedergegeben werden ausschließlich externe Player; im Repository liegen keine Musikdateien.
// Video-IDs sind konkrete Intro-Videos, darunter Disney, Nickelodeon, Bluey und Cartoon Network.
const ROWS = `Disneys Große Pause|Recess Main Theme|Denis M. Hannigan|Disneys Große Pause startet|IbJCdfTCkuI
SpongeBob Schwammkopf|SpongeBob SquarePants Theme Song|SpongeBob SquarePants|SpongeBob Schwammkopf startet|r9L4AseD-aA
Kim Possible|Call Me, Beep Me!|Christina Milian|Kim Possible startet|bvmlLqLQSjs
Phineas und Ferb|Today Is Gonna Be a Great Day|Bowling for Soup|Phineas und Ferb startet|NkQrKxTFARM
Gravity Falls|Gravity Falls Theme|Brad Breeck|Gravity Falls startet|xr6WClFQfuY
Bluey|Bluey Theme Tune|Joff Bush|Bluey startet|8nv1m-aTCZI
PAW Patrol|PAW Patrol Theme Song|PAW Patrol|PAW Patrol startet|nwRh3OyYd_E
Die Rugrats|Rugrats Theme|Mark Mothersbaugh|Die Rugrats starten|jMEj9kQg3F8
Hey Arnold!|Hey Arnold! Theme|Jim Lang|Hey Arnold! startet|Z2EotmVUdDE
Die Powerpuff Girls|The Powerpuff Girls Theme|Cartoon Network|Die Powerpuff Girls starten|f7MiaSr-0ug
Der Zauberschulbus|The Magic School Bus Theme|Scholastic|Der Zauberschulbus startet|xQj1dV5xNwA
Die fantastische Welt von Gumball|The Amazing World of Gumball Theme|Cartoon Network|Die fantastische Welt von Gumball startet|LOBOJQocArs
DuckTales|DuckTales Theme Song|Disney|DuckTales kehrt als Neuauflage zurück|YKSU82afy1w
iCarly|Leave It All to Me|Miranda Cosgrove|iCarly startet|oPEU9DO6tBw
Victorious|Make It Shine|Victoria Justice|Victorious startet|FpLBDJw8iJI
Hannah Montana|The Best of Both Worlds|Hannah Montana|Hannah Montana startet|nDMIuuO_PQo
Pokémon|Pokémon Theme|Jason Paige|Pokémon startet|hxooaOBJUjs
Digimon Adventure|Leb deinen Traum|Frank Schindel|Digimon Adventure startet|k3qiK-9oGDM
Winx Club|Under the Sign of the Winx|Winx Club|Winx Club startet|bDHo6fM05Kc
Miraculous|Miraculous Theme Song|Lou & Lenni-Kim|Miraculous startet|q_G4IT4I0F8
Darkwing Duck|Darkwing Duck Theme|Disney|Darkwing Duck startet|9d1_N1XrmRk
Die Gummibärenbande|Gummibärenbande Titellied|Disney|Die Gummibärenbande beendet ihre Originalserie|WvMZh03x7_A
Schloss Einstein|Schloss Einstein Titelsong|Schloss Einstein|Schloss Einstein startet|3Egh0uQWXHA
Die Pfefferkörner|Die Pfefferkörner Titelsong 2026|Nina Chuba|Nina Chuba singt das neue Pfefferkörner-Intro|pZMPAnGLrHM
H2O – Plötzlich Meerjungfrau|No Ordinary Girl|Kate Alexa|H2O – Plötzlich Meerjungfrau startet|OxtkigHRnF4
Der kleine Drache Kokosnuss|Kokosnuss Titellied|Der kleine Drache Kokosnuss|Der kleine Drache Kokosnuss startet als Serie|zRDZuiODNxU
Cosmo und Wanda|The Fairly OddParents Theme Song|Nickelodeon|Cosmo und Wanda startet|no8vgXg_rlw
Dora|Dora the Explorer Theme Song|Nickelodeon|Dora startet|We-IrsK7zj0
Avatar – Der Herr der Elemente|Avatar: The Last Airbender Theme|Nickelodeon|Avatar – Der Herr der Elemente startet|d1EnW4kn1kg
Ben 10|Ben 10 Theme Song|Cartoon Network|Ben 10 startet|yX0AhxgR0_I
Adventure Time|Adventure Time Theme|Pendleton Ward|Adventure Time startet|cvDxko2Zm0Q
The Owl House|The Owl House Theme Song|Disney|The Owl House startet|EYqzwDPczqs
Gabby's Dollhouse|Gabby's Dollhouse Theme Song|DreamWorks|Gabby's Dollhouse startet|flhy5P3GtLU`;
const eventByTitle = new Map(EVENTS.map(event => [event.title, event]));
export const SONGS = ROWS.split('\n').map((line,index) => {
  const [work,title,artist,eventTitle,youtubeId] = line.split('|');
  const event = eventByTitle.get(eventTitle);
  return { id: `intro:${index}`, work, title, artist, youtubeId, event, category: event?.category, world: event?.world };
}).filter(song => song.event);
export const CLIPS = Object.fromEntries(SONGS.filter(song => song.youtubeId).map(song => [song.event.title, { id: song.youtubeId, what: 'Das bekannte Serienintro' }]));
export function clipSource(event) {
  const clip = CLIPS[event?.title];
  if (!clip) return null;
  return { name: 'YouTube', kind: 'clip', src: `https://www.youtube-nocookie.com/embed/${clip.id}?autoplay=1&playsinline=1&rel=0`, page: `https://www.youtube.com/watch?v=${clip.id}`, what: clip.what };
}
export function introSource(song) {
  if (!song?.youtubeId) return null;
  return { name: 'YouTube', kind: 'intro', src: `https://www.youtube-nocookie.com/embed/${song.youtubeId}?autoplay=1&playsinline=1&rel=0`, page: `https://www.youtube.com/watch?v=${song.youtubeId}`, what: 'Serienintro' };
}
export const songFor = event => SONGS.find(song => song.event === event) || null;
export function songChoices(item, pool = SONGS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
  const choices = [item.work, ...others.slice(0, 3)];
  for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  return choices;
}

