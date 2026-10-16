import { EVENTS } from './events.js';

// Clips: frei lizenzierte bzw. gemeinfreie Filmaufnahmen von Wikimedia Commons.
// Die Dateinamen stammen aus der Commons-Suche; eingebettet wird der offizielle Commons-Player.
export const CLIPS = {
  'Mondlandung von Apollo 11': 'Partially Restored Apollo 11 Video.ogv',
  'Hindenburg-Katastrophe in Lakehurst': 'Hindenburg Explodes.webm',
  'Einsturz der Tacoma-Narrows-Brücke': 'Tacoma Narrows Bridge destruction.ogv',
  'Kennedy: „Ich bin ein Berliner“': '"Ich bin ein Berliner!" - John F. Kennedy 1963 in Berlin.webm',
  'Martin Luther Kings Rede „I Have a Dream“': 'Trechos do discurso I Have A Dream, de Martin Luther King Jr. (28-08-1963, Washington).webm',
  'Challenger-Katastrophe': 'Challenger Launch and Breakup.ogv',
  'Landung in der Normandie (D-Day)': 'D-Day 1944 Office of War Information.webm',
  'Juri Gagarin fliegt als erster Mensch ins All': '1961-04-19 First Pictures-Yuri Gagarin-selection.ogv',
  'Lindbergh überquert allein den Atlantik': 'First Pictures of Lindbergh as He Reaches Paris In Flight From New York.webm',
  'Start von Sputnik 1': '1957-10-07 New Moon.ogv',
  'Ausbruch des Mount St. Helens': 'Eruption of Mount St. Helens, 1980.ogv',
  'Untergang der Titanic': 'Titanic Disaster - Genuine Footage (1911-1912).webm',
  'Bau der Berliner Mauer': 'So wurde die Berliner Mauer gebaut (CC BY 4.0).webm',
  'Fall der Berliner Mauer': 'Grenzöffnung November 1989 - Selmsdorf (DDR) - Lübeck-Schlutup.webm',
  'Reagan: „Tear down this wall!“': "President Ronald Reagan's Speech at the Berlin Wall, June 12, 1987.webm",
  'Atombombe auf Hiroshima': 'President Harry S. Truman on the Atomic Bombing of Hiroshima (1945).webm'
};

export function clipSource(event) {
  const file = CLIPS[event?.title];
  if (!file) return null;
  const page = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
  return { name: 'Clip', kind: 'clip', src: `${page}?embedplayer=yes`, page };
}

// Songs, die das Ereignis besingen oder untrennbar damit verbunden sind: Song | Interpret | Ereignis.
// Abgespielt wird ausschließlich über den Deezer-Player (siehe music.js).
const rows = `Wind of Change|Scorpions|Fall der Berliner Mauer
Heroes|David Bowie|Bau der Berliner Mauer
Sunday Bloody Sunday|U2|Blutsonntag in Derry
Zombie|The Cranberries|IRA-Anschlag in Warrington
Biko|Peter Gabriel|Tod von Steve Biko
Free Nelson Mandela|The Special AKA|Nelson Mandela wird freigelassen
Ohio|Crosby, Stills, Nash & Young|Kent-State-Massaker
Space Oddity|David Bowie|Mondlandung von Apollo 11
Enola Gay|Orchestral Manoeuvres in the Dark|Atombombe auf Hiroshima
Waterloo|ABBA|Schlacht bei Waterloo
Rasputin|Boney M.|Ermordung Rasputins
Brothers in Arms|Dire Straits|Falklandkrieg
Smoke on the Water|Deep Purple|Brand im Casino von Montreux
Candle in the Wind 1997|Elton John|Tod von Prinzessin Diana
Do They Know It's Christmas?|Band Aid|Hungersnot in Äthiopien: Band Aid singt für Hilfe
Pride (In the Name of Love)|U2|Ermordung Martin Luther Kings
The Wreck of the Edmund Fitzgerald|Gordon Lightfoot|Untergang der Edmund Fitzgerald
My Heart Will Go On|Céline Dion|Untergang der Titanic
99 Luftballons|Nena|NATO-Doppelbeschluss
Fortunate Son|Creedence Clearwater Revival|US-Kampftruppen landen in Vietnam
American Pie|Don McLean|Flugzeugabsturz von Buddy Holly
When the Levee Breaks|Led Zeppelin|Mississippi-Flut
The Battle of New Orleans|Johnny Horton|Schlacht von New Orleans
Abraham, Martin and John|Dion|Ermordung John F. Kennedys
Woodstock|Joni Mitchell|Woodstock-Festival`;

const eventByTitle = new Map(EVENTS.map(event => [event.title, event]));
export const SONGS = rows.split('\n').map((line, index) => {
  const [title, artist, work] = line.split('|');
  const event = eventByTitle.get(work);
  return { id: `song:${index}`, title, artist, work, event, category: event?.category, world: event?.world };
});
export const songFor = event => SONGS.find(song => song.event === event) || null;

export function songChoices(item, pool = SONGS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  return [item.work, ...others.sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
}
