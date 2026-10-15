// Hörfragen: bekannte Songs und Themen, die in den genannten Produktionen vorkommen.
// Die Player beziehen die Musik ausschließlich von Deezer oder Spotify.
const rows = `Disney-Klassiker|Let It Go|Idina Menzel|Die Eiskönigin – Völlig unverfroren
Disney-Klassiker|Into the Unknown|Idina Menzel|Die Eiskönigin 2
Disney-Klassiker|We Don't Talk About Bruno|Carolina Gaitán|Encanto
Disney-Klassiker|How Far I'll Go|Auli'i Cravalho|Vaiana
Disney-Klassiker|Reflection|Christina Aguilera|Mulan
Disney-Klassiker|Beauty and the Beast|Céline Dion|Die Schöne und das Biest
Pixar|You've Got a Friend in Me|Randy Newman|Toy Story
Pixar|Remember Me|Miguel|Coco – Lebendiger als das Leben!
Pixar|Life Is a Highway|Rascal Flatts|Cars
Pixar|Le Festin|Camille|Ratatouille
Kinderkino|All Star|Smash Mouth|Shrek
Kinderkino|Happy|Pharrell Williams|Ich – Einfach unverbesserlich 2
Kinderkino|Can't Stop the Feeling!|Justin Timberlake|Trolls
Kinderkino|I'm a Believer|Smash Mouth|Shrek
Kinderkino|Try Everything|Shakira|Zoomania
Fantasy & Abenteuer|Hedwig's Theme|John Williams|Harry Potter und der Stein der Weisen
Fantasy & Abenteuer|He's a Pirate|Klaus Badelt|Fluch der Karibik
Fantasy & Abenteuer|Concerning Hobbits|Howard Shore|Der Herr der Ringe: Die Gefährten
Science-Fiction & Action|The Imperial March|John Williams|Das Imperium schlägt zurück
Science-Fiction & Action|Back to the Future|Alan Silvestri|Zurück in die Zukunft
Science-Fiction & Action|Jurassic Park Theme|John Williams|Jurassic Park
Filmklassiker|Eye of the Tiger|Survivor|Rocky III
Filmklassiker|Ghostbusters|Ray Parker Jr.|Ghostbusters – Die Geisterjäger
Filmklassiker|My Heart Will Go On|Céline Dion|Titanic
Filmklassiker|Bohemian Rhapsody|Queen|Wayne's World
Moderne Kinohits|Shallow|Lady Gaga|A Star Is Born
Moderne Kinohits|Skyfall|Adele|Skyfall
Moderne Kinohits|Lose Yourself|Eminem|8 Mile
Moderne Kinohits|What Was I Made For?|Billie Eilish|Barbie
Moderne Kinohits|City of Stars|Ryan Gosling|La La Land
Serien & Figuren|I'll Be There for You|The Rembrandts|Friends
Serien & Figuren|Running Up That Hill|Kate Bush|Stranger Things
Serien & Figuren|Red Right Hand|Nick Cave & The Bad Seeds|Peaky Blinders
Serien & Figuren|California|Phantom Planet|O.C., California
Serien & Figuren|Woke Up This Morning|Alabama 3|Die Sopranos
Serien & Figuren|Bad Things|Jace Everett|True Blood
Serien & Figuren|The Skye Boat Song|Bear McCreary|Outlander
Kinderserien|The Best Day Ever|SpongeBob SquarePants|SpongeBob Schwammkopf`;

export const SOUNDTRACKS = rows.split('\n').map((line, index) => {
  const [category, title, artist, work] = line.split('|');
  return { id: `audio:${index}`, category, title, artist, work };
});

export function audioChoices(item, pool = SOUNDTRACKS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  const wrong = others.sort(() => Math.random() - .5).slice(0, 3);
  return [item.work, ...wrong].sort(() => Math.random() - .5);
}
