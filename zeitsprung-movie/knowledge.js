// Redaktionell geschriebene, zeitstabile Film- und Serienfragen: Frage | richtig | drei Ablenker.
const sets = {
'Disney & Pixar': `Wie heißt Simbas Vater in „Der König der Löwen“?|Mufasa|Scar|Rafiki|Timon
Wie heißt Arielles Fischfreund?|Fabius|Sebastian|König Triton|Scuttle
Welches Tier ist Sebastian aus „Arielle“?|Krabbe|Fisch|Möwe|Seestern
Wie heißt Elsas Schwester in „Die Eiskönigin“?|Anna|Rapunzel|Merida|Mirabel
Wie heißt die Familie in „Encanto“?|Madrigal|Rivera|Parr|Andersen
Welcher Pixar-Film spielt überwiegend in Rileys Gedankenwelt?|Alles steht Kopf|Coco|Oben|Ratatouille
Wie heißt der Cowboy in „Toy Story“?|Woody|Buzz|Jessie|Rex
Welche Pixar-Figur ist ein Müllroboter?|WALL·E|Baymax|BB-8|R2-D2
Welchen Beruf träumt Remy in „Ratatouille“ auszuüben?|Koch|Pilot|Detektiv|Maler
Welche Farbe hat Lightning McQueen in „Cars“?|Rot|Blau|Grün|Gelb`,
'Marvel & Superhelden': `Wie lautet Iron Mans bürgerlicher Name?|Tony Stark|Steve Rogers|Bruce Banner|Peter Parker
In welchem fiktiven Land ist Black Panther König?|Wakanda|Asgard|Latveria|Genosha
Wie heißt Captain Americas Schildmaterial?|Vibranium|Adamantium|Kryptonit|Unobtainium
Welcher Held schwingt den Hammer Mjölnir?|Thor|Loki|Hulk|Hawkeye
Wie lautet der bürgerliche Name des Hulk?|Bruce Banner|Tony Stark|Scott Lang|Stephen Strange
Welcher Schurke sammelt die Infinity-Steine?|Thanos|Ultron|Loki|Red Skull
Welcher Held schrumpft mithilfe eines Spezialanzugs?|Ant-Man|Hawkeye|Falcon|Vision
Wie heißt Peter Parkers Superheldenname?|Spider-Man|Doctor Strange|Star-Lord|Cyclops
Welches Tier ist Rocket aus „Guardians of the Galaxy“?|Waschbär|Fuchs|Marder|Dachs
Wie heißt die Schwester von T’Challa in „Black Panther“?|Shuri|Nakia|Okoye|Ramonda`,
'Kinderfilme': `Wie heißt der Esel an Shreks Seite?|Esel|Puss|Fiona|Lord Farquaad
Welcher Film erzählt von einem Clownfisch auf der Suche nach seinem Sohn?|Findet Nemo|Madagascar|Shrek|Sing
Wie heißt der Panda in „Kung Fu Panda“?|Po|Shifu|Tigress|Tai Lung
Wie heißt Hicks’ Drache in „Drachenzähmen leicht gemacht“?|Ohnezahn|Sturmpfeil|Hakenzahn|Fleischklops
Wer ist der Adoptivvater der Minions in „Ich – Einfach unverbesserlich“?|Gru|Vector|Wild Knuckles|El Macho
Welcher Bär liebt Marmeladenbrote?|Paddington|Balu|Po|Winnie Puuh
Welche Spielzeugfigur ist ein Space Ranger?|Buzz Lightyear|Woody|Rex|Forky
Wie heißt der Schneemann in „Die Eiskönigin“?|Olaf|Sven|Kristoff|Hans
Welcher Film zeigt Tiere, die in einem Gesangswettbewerb antreten?|Sing|Pets|Cars|Trolls
Welche Farbe haben die meisten Minions?|Gelb|Blau|Rot|Grün`,
'Kinderserien': `Wer leitet das Hundeteam in „PAW Patrol“?|Ryder|Chase|Marshall|Rocky
Welcher „PAW Patrol“-Hund ist Polizist?|Chase|Marshall|Skye|Rubble
Wie heißt Peppa Wutz’ kleiner Bruder?|Schorsch|Ben|Max|Tom
Wie heißt Blueys jüngere Schwester?|Bingo|Coco|Muffin|Chilli
In welcher Unterwasserstadt lebt SpongeBob?|Bikini Bottom|Atlantis|Korallenstadt|Neptunia
Wer ist Pikachus langjähriger Trainer im Anime „Pokémon“?|Ash Ketchum|Brock|Gary Oak|Professor Eich
Welches Tier ist die Biene Maja?|Biene|Hummel|Wespe|Libelle
Was sind Tom und Jerry?|Katze und Maus|Hund und Katze|Zwei Mäuse|Fuchs und Hase
Welches Tier ist Shaun in „Shaun das Schaf“?|Schaf|Ziege|Hund|Kuh
Welche Farbe hat das Krümelmonster aus der Sesamstraße?|Blau|Grün|Rot|Gelb`,
'Serien & Figuren': `In welcher Stadt spielt „Stranger Things“?|Hawkins|Springfield|Gotham|Stars Hollow
Wie heißt die Bar beziehungsweise das Café in „Friends“?|Central Perk|Luke’s Diner|The Bronze|MacLaren’s
Welchen Beruf unterrichtete Walter White vor seinen Verbrechen?|Chemie|Geschichte|Mathematik|Physik
Wie heißt die Firma in der US-Serie „The Office“?|Dunder Mifflin|Sterling Cooper|Waystar Royco|Pied Piper
Wie heißt das zeitreisende Raumschiff in „Doctor Who“?|TARDIS|Enterprise|Serenity|Rocinante
Wie heißt das Kind an der Seite des Mandalorianers Din Djarin?|Grogu|Yoda|Ezra|Anakin
Wie lautet der Nachname von Wednesday aus der gleichnamigen Serie?|Addams|Munster|Granger|Cooper
In welcher US-Stadt wohnen „Die Simpsons“?|Springfield|Quahog|South Park|Arlen
Wer spielt Sherlock Holmes in der BBC-Serie „Sherlock“?|Benedict Cumberbatch|Martin Freeman|David Tennant|Matt Smith
Welche Serie handelt von einem Kampf um den Eisernen Thron?|Game of Thrones|The Witcher|Vikings|The Crown`,
'Streaming & Plattformen': `Welche Serie mit Elf und dem Upside Down wurde als Netflix-Original bekannt?|Stranger Things|The Mandalorian|Ted Lasso|The Boys
Welche Star-Wars-Serie startete als Original auf Disney+?|The Mandalorian|The Boys|The Crown|The Office
Welche Superheldensatire startete bei Prime Video?|The Boys|Loki|Daredevil|The Flash
Welche Fußball-Comedy startete als Apple-TV+-Original?|Ted Lasso|The Bear|Cobra Kai|Wednesday
Welche Serie um die königliche Familie wurde als Netflix-Original bekannt?|The Crown|The Last of Us|Andor|Succession
Was bedeutet „Streaming“ bei Videos?|Übertragung über das Internet während des Abspielens|Nur das Herunterladen einer DVD|Eine Aufnahme auf VHS|Ein Film ohne Ton
Was ist eine Streaming-Flatrate?|Ein Abo mit Zugriff auf einen Katalog|Ein einzelnes Kinoticket|Ein Fernsehsender ohne Internet|Ein Speicherstick
Wofür steht „VOD“ im Videobereich?|Video on Demand|Voice of Director|View of Disney|Virtual Open Drama
Was bedeutet „Original“ bei einer Streamingserie meist?|Der Dienst hat sie selbst beauftragt oder exklusiv vermarktet|Sie hat keine Schauspieler|Sie ist immer kostenlos|Sie hat keine Untertitel
Was ist Binge-Watching?|Mehrere Folgen hintereinander ansehen|Einen Film rückwärts ansehen|Im Kino abstimmen|Einen Trailer schneiden`,
'Fantasy-Welten': `In welcher Schule lernt Harry Potter Zaubern?|Hogwarts|Durmstrang|Beauxbatons|Ilvermorny
Zu welchem Haus gehört Harry Potter in Hogwarts?|Gryffindor|Slytherin|Hufflepuff|Ravenclaw
Wie heißt der Hobbit, der den Ring nach Mordor bringt?|Frodo Beutlin|Bilbo Beutlin|Samweis Gamdschie|Pippin Tuk
Wo soll der Eine Ring zerstört werden?|Im Schicksalsberg|In Bruchtal|In Minas Tirith|Im Auenland
Wie heißt der Pirat, den Johnny Depp in „Fluch der Karibik“ spielt?|Jack Sparrow|Will Turner|Davy Jones|Barbossa
Durch welchen Gegenstand gelangen die Kinder nach Narnia?|Kleiderschrank|Spiegel|Aufzug|Kamin
Wie heißt die junge Heldin von „Die Tribute von Panem“?|Katniss Everdeen|Tris Prior|Bella Swan|Hermione Granger
Welcher Zauberer trägt in „Der Herr der Ringe“ zunächst einen grauen Mantel?|Gandalf|Saruman|Radagast|Elrond
Welches Tier führt Alice in vielen Versionen ins Wunderland?|Weißes Kaninchen|Grinsekatze|Raupe|Flamingo
Wer besitzt die Schokoladenfabrik in „Charlie und die Schokoladenfabrik“?|Willy Wonka|Charlie Bucket|Oompa Loompa|Grandpa Joe`,
'Kino & Filmwissen': `Wer verantwortet die kreative Leitung eines Filmdrehs?|Regie|Maske|Kasse|Verleih
Wie heißt die schriftliche Vorlage mit Szenen und Dialogen?|Drehbuch|Storyboard|Abspann|Call Sheet
Was ist eine Fortsetzung eines Films?|Sequel|Prequel|Teaser|Cameo
Was erzählt eine Vorgeschichte zu einem bestehenden Film?|Prequel|Sequel|Remake|Spin-off
Was ist ein Cameo-Auftritt?|Kurzer Gastauftritt einer bekannten Person|Schnittfehler|Eine lange Tanzszene|Ein Kinoplakat
Was zeigt ein Storyboard?|Gezeichnete Planung von Einstellungen|Ticketverkäufe|Sprecherverträge|Filmpreise
Was ist ein Trailer?|Ein kurzer Vorschaufilm|Der Nachspann|Ein Mikrofon|Eine Filmkamera
Was ist eine Post-Credit-Szene?|Szene nach oder während des Abspanns|Szene ohne Ton|Erster Drehbuchentwurf|Filmpremiere
Wie heißt die Person, die Bilder und Ton zu einer Filmfassung zusammenfügt?|Editor oder Cutter|Maskenbildner|Stuntdouble|Kinobetreiber
Was bedeutet „Synchronisation“ bei einem fremdsprachigen Film?|Dialoge in einer anderen Sprache neu einsprechen|Den Film schneller abspielen|Nur Untertitel löschen|Die Musik austauschen`,
'Deutsche Filme & Fernsehen': `Wie heißt Bully Herbigs Figur in „Der Schuh des Manitu“?|Abahachi|Winnetou|Ranger|Santa Maria
Wie heißt Elyas M’Bareks Lehrerfigur in „Fack ju Göhte“?|Zeki Müller|Lenny|Philipp|Marc
Welches Überwachungssystem steht in „Das Leben der Anderen“ im Mittelpunkt?|Stasi|FBI|MI6|Interpol
Welches Land existiert in „Good Bye, Lenin!“ in der Filmhandlung zunächst weiter?|DDR|BRD|Österreich|Schweiz
Welche Schauspielerin spielt die Hauptrolle in „Lola rennt“?|Franka Potente|Nora Tschirner|Diane Kruger|Jella Haase
Welches Tier ist die Hauptfigur der „Sendung mit der Maus“?|Maus|Hase|Ente|Fuchs
Wie heißt der Wikingerjunge einer bekannten Kinderserie?|Wickie|Bibi|Pumuckl|Jim Knopf
Was ist Bibi Blocksberg?|Hexe|Meerjungfrau|Detektivin|Astronautin
Wer schrieb die Vorlage zu „Das kleine Gespenst“?|Otfried Preußler|Michael Ende|Erich Kästner|Cornelia Funke
Wie heißt die Lokomotive in „Jim Knopf und Lukas der Lokomotivführer“?|Emma|Molly|Lilli|Erna`,
'Trailer & Filmfiguren': `Welche Filmreihe zeigt einen gelben Camaro namens Bumblebee?|Transformers|Cars|Fast & Furious|Jurassic Park
Wer offenbart Luke Skywalker im Film, sein Vater zu sein?|Darth Vader|Yoda|Han Solo|Obi-Wan Kenobi
Welche Filmfigur trägt oft Peitsche und Fedora?|Indiana Jones|Jack Sparrow|James Bond|Neo
Welcher Film zeigt einen Tyrannosaurus in einem Freizeitpark?|Jurassic Park|Jumanji|Avatar|Godzilla
Wie heißt die Prinzessin, die Mario oft retten will?|Peach|Daisy|Zelda|Rosalina
Welcher Film spielt in der Welt Pandora?|Avatar – Aufbruch nach Pandora|Dune|Matrix|Star Wars
Welche Figur nimmt in „Matrix“ die rote Pille?|Neo|Morpheus|Trinity|Agent Smith
Wie heißt Batmans Heimatstadt?|Gotham City|Metropolis|Central City|Star City
Welche Figur singt im Film „Barbie“ den Song „I'm Just Ken“?|Ken|Allan|Barbie|Sasha
Welcher Film erzählt vom Bau der ersten Atombombe und ihrem wissenschaftlichen Leiter?|Oppenheimer|The Imitation Game|Apollo 13|Interstellar`
};
export const KNOWLEDGE = Object.entries(sets).flatMap(([category,block])=>block.trim().split('\n').map((line,index)=>{const [prompt,answer,...wrong]=line.split('|');return{id:`k:${category}:${index}`,category,prompt,answer,options:[answer,...wrong]};}));
export const SPECIAL_CATEGORIES = Object.keys(sets);
