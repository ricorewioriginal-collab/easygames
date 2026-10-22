// Redaktionell formulierte Vier-Antworten-Fragen zu Figuren, Welten und deutschen Serien.
const ROWS = `Disney & Disney Channel|Wie heißt der Anführer der Kinder in Disneys Große Pause?|T. J. Detweiler|Mikey Blumberg|Randall Weems|Vince LaSalle
Disney & Disney Channel|Wie heißt die Schule aus Disneys Große Pause?|Third Street School|Hollywood Arts|Schloss Einstein|Lakewood Elementary
Disney & Disney Channel|Welche Figur ist Schulhof-König in Disneys Große Pause?|King Bob|Gronkel Stan|Dr. Drakken|Perry
Disney & Disney Channel|Wer gehört zur Clique in Disneys Große Pause?|Spinelli|Candace|Starfire|Sam Puckett
Disney & Disney Channel|Wer ist Kim Possibles bester Freund?|Ron Stoppable|Dr. Drakken|Wade Load|Gill
Disney & Disney Channel|Welcher Schurke trifft häufig auf Kim Possible?|Dr. Drakken|Plankton|Bill Cipher|Megatron
Disney & Disney Channel|Wie heißt Kim Possibles Helfer am Computer?|Wade|Perry|Ferb|Skipper
Disney & Disney Channel|Welches Tier ist Rufus bei Kim Possible?|Nacktmull|Meerschweinchen|Hamster|Maus
Disney & Disney Channel|Welche Figur führt heimlich ein Doppelleben als Popstar?|Miley Stewart|Carly Shay|Tori Vega|Lizzie McGuire
Disney & Disney Channel|Wie heißt das Schnabeltier bei Phineas und Ferb?|Perry|Rufus|Boots|Gary
Disney & Disney Channel|Wer versucht Phineas und Ferb oft zu verpetzen?|Candace|Isabella|Vanessa|Mabel
Disney & Disney Channel|Wie heißt Phineas' Bruder?|Ferb|Dipper|Ron|Hiro
Disney & Disney Channel|Welcher Ort steckt voller Rätsel in Gravity Falls?|Gravity Falls|Bikini Bottom|Trolberg|Elmore
Disney & Disney Channel|Wie heißen die Zwillinge in Gravity Falls?|Dipper und Mabel|Phineas und Ferb|Tick und Trick|Sam und Clover
Disney & Disney Channel|Wer ist der Betreiber der Mystery Shack?|Gronkel Stan|Dr. Doofenshmirtz|Scrooge McDuck|Dr. Drakken
Disney & Disney Channel|Wer ist die Hauptfigur von The Owl House?|Luz Noceda|Anne Boonchuy|Marinette Dupain-Cheng|Violetta Castillo
Disney & Disney Channel|Wie heißt die Hexe, bei der Luz lebt?|Eda Clawthorne|Miss Frizzle|Morgana|Ursula
Disney & Disney Channel|In welcher Welt landet Anne in Amphibia?|Amphibia|Avalor|Trolberg|Ooo
Disney & Disney Channel|Welcher Schurke kämpft gegen Agent P?|Dr. Doofenshmirtz|Bill Cipher|Dr. Drakken|Plankton
Disney & Disney Channel|Wie heißt Lizzie McGuires bester Freund?|Gordo|Ron|Ferb|Wade
Disney & Disney Channel|Wer ist in DuckTales Dagoberts Neffe?|Donald Duck|Mickey Maus|Goofy|Perry
Disney & Disney Channel|Welche drei Enten sind Donalds Neffen?|Tick, Trick und Track|Phineas, Ferb und Perry|Dipper, Mabel und Stan|Tommy, Chuckie und Phil
Nickelodeon|Wie heißt SpongeBobs Heimatstadt?|Bikini Bottom|Retroville|Elmore|Kandisburg
Nickelodeon|Welches Tier ist SpongeBobs bester Freund Patrick?|Seestern|Krabbe|Qualle|Schnecke
Nickelodeon|Wie heißt SpongeBobs Haustier?|Gary|Rufus|Perry|Boots
Nickelodeon|Wo arbeitet SpongeBob?|Krosse Krabbe|Krusty Burger|Mystery Shack|Chum Bucket
Nickelodeon|Was versucht Plankton immer wieder zu stehlen?|Krabbenburger-Geheimformel|Omnitrix|Goldene Krone|Zauberstab
Nickelodeon|Wie heißt der Besitzer der Krossen Krabbe?|Mr. Krabs|Thaddäus|Plankton|Meerjungfraumann
Nickelodeon|Welchen Luftbändiger begleitet Katara bei Avatar?|Aang|Zuko|Sokka|Ozai
Nickelodeon|Welche Elemente kann der Avatar meistern?|Wasser, Erde, Feuer und Luft|Wasser, Eis, Licht und Schatten|Feuer, Blitz, Metall und Wind|Erde, Holz, Mond und Sonne
Nickelodeon|Wie heißt Aangs fliegender Bison?|Appa|Momo|Naga|Pabu
Nickelodeon|Wer ist Zukos Schwester?|Azula|Katara|Toph|Korra
Nickelodeon|Wie heißen Timmy Turners Feenpaten?|Cosmo und Wanda|Pinky und Brain|Tommy und Chuckie|Phineas und Ferb
Nickelodeon|Welches Erkennungszeichen hat Arnold aus Hey Arnold!?|Football-Kopf|Quadratschädel|Gelber Schwamm|Grüner Helm
Nickelodeon|Wie heißt der Junge aus Jimmy Neutron?|Jimmy Neutron|Timmy Turner|Henry Hart|Doug Funnie
Nickelodeon|Was trägt Ben Tennyson am Handgelenk?|Omnitrix|Miraculous|Power-Münze|Digivice
Nickelodeon|Wie heißt Carlys Webshow?|iCarly|iStudio|Carly TV|Nick Live
Nickelodeon|Wie heißt Henry Harts Superhelden-Name?|Kid Danger|Captain Man|Darkwing Duck|Ben 10
Nickelodeon|Wie viele Schwestern hat Lincoln Loud?|zehn|fünf|sieben|zwölf
Nickelodeon|Wie heißt der Chef der Pinguine aus Madagaskar?|Skipper|Kowalski|Rico|Private
Nickelodeon|Welche Figur reist mit Dora?|Boots|Appa|Perry|Rufus
Nickelodeon|Welches Baby führt die Rugrats oft an?|Tommy Pickles|Chuckie Finster|Angelica Pickles|Phil DeVille
Nickelodeon|Wie heißt Doug mit Nachnamen?|Funnie|Pickles|Neutron|Loud
KiKA & deutsche Serien|In welcher Stadt ermitteln Die Pfefferkörner?|Hamburg|Berlin|München|Leipzig
KiKA & deutsche Serien|Welche Art von Serie ist Schloss Einstein?|Internatsserie|Unterwasser-Comedy|Superhelden-Serie|Musik-Wettbewerb
KiKA & deutsche Serien|Wer singt 2026 das neue Intro der Pfefferkörner?|Nina Chuba|Lena Meyer-Landrut|Sarah Connor|Annett Louisan
KiKA & deutsche Serien|Für welche Staffel wurde das neue Pfefferkörner-Intro mit Nina Chuba aufgenommen?|22. Staffel|10. Staffel|15. Staffel|30. Staffel
KiKA & deutsche Serien|Welche Sendung verfolgt Fälle einer jungen Ermittlergruppe?|Die Pfefferkörner|Schloss Einstein|Bluey|Hilda
KiKA & deutsche Serien|Welcher deutsche Kinderkanal zeigt Schloss Einstein?|KiKA|Nickelodeon|Disney Channel|ProSieben
KiKA & deutsche Serien|Was ist die Grundidee von Wissen macht Ah!?|Wissensfragen und Experimente|Kriminalfälle|Puppenhaus-Abenteuer|Superhelden
KiKA & deutsche Serien|Welche Figur sagt häufig „Mist“?|Bernd das Brot|SpongeBob|Perry|Mikey
KiKA & deutsche Serien|Wer begleitet Bernd das Brot bei Tolle Sachen?|Chili das Schaf und Briegel der Busch|Cosmo und Wanda|Finn und Jake|Dipper und Mabel
KiKA & deutsche Serien|Welche drei Mädchen werden in H2O zu Meerjungfrauen?|Cleo, Emma und Rikki|Sam, Clover und Alex|Mia, Yuko und Mo|Marinette, Alya und Chloé
KiKA & deutsche Serien|Was löst in H2O die Verwandlung aus?|Kontakt mit Wasser|Mondlicht allein|ein Zauberspruch|Musik
KiKA & deutsche Serien|Wie heißt Mias magische Welt?|Centopia|Avalor|Amphibia|Trolberg
KiKA & deutsche Serien|Welches Tier ist Onchao in Mia and me?|Einhorn|Drache|Hund|Pinguin
KiKA & deutsche Serien|Welche Sportart spielen Die Wilden Kerle?|Fußball|Basketball|Handball|Eishockey
KiKA & deutsche Serien|Wer schrieb die Bücher über Die Wilden Kerle?|Joachim Masannek|Ingo Siegner|Cornelia Funke|Michael Ende
KiKA & deutsche Serien|Wie heißen die Freunde von Kokosnuss?|Oskar und Matilda|Ron und Rufus|Finn und Jake|Dipper und Mabel
KiKA & deutsche Serien|Welches Tier ist Kokosnuss?|Drache|Dinosaurier|Krokodil|Eichhörnchen
Kultserien der 90er|Welche drei Figuren wohnen im Animaniacs-Wasserturm?|Yakko, Wakko und Dot|Tick, Trick und Track|Phineas, Ferb und Perry|Tommy, Chuckie und Angelica
Kultserien der 90er|Was planen Pinky und der Brain fast jede Nacht?|Die Weltherrschaft|eine Reise nach Kanto|einen Krabbenburger|eine Fernsehshow
Kultserien der 90er|Wie heißt die Lehrerin mit dem Zauberschulbus?|Miss Frizzle|Miss Finster|Eda Clawthorne|Frau Martin
Kultserien der 90er|Welche vier Farben tragen die Teletubbies?|Lila, Grün, Gelb und Rot|Blau, Rot, Schwarz und Weiß|Pink, Orange, Braun und Grau|Gelb, Blau, Silber und Gold
Kultserien der 90er|Wie heißt der gelbe Teletubby?|Laa-Laa|Po|Dipsy|Tinky Winky
Kultserien der 90er|Was ist Arthur für ein Tier?|Erdferkel|Biber|Bär|Hund
Kultserien der 90er|Welche Stadt beschützen die Powerpuff Girls?|Townsville|Bluffington|Retroville|Elmore
Kultserien der 90er|Welche Powerpuff-Figur trägt häufig Rosa?|Blossom|Bubbles|Buttercup|Mojo Jojo
Kultserien der 90er|Wie heißt Sportacus' Gegenspieler in LazyTown?|Robbie Rotten|Plankton|Dr. Drakken|Bill Cipher
Kultserien der 90er|Welche Farbe hat Stephanies Haar in LazyTown?|pink|blau|grün|schwarz
Anime & Action|Wie heißt Ashs bekanntestes Pokémon?|Pikachu|Glumanda|Evoli|Mauzi
Anime & Action|Welches Ziel verfolgt Ash Ketchum in Pokémon?|Pokémon-Meister werden|Weltmeister im Duellieren werden|Avatar werden|Power Ranger werden
Anime & Action|Was benutzen die Kinder in Digimon Adventure?|Digivices|Omnitrix|Miraculous|Power-Münzen
Anime & Action|Wie heißt Yugis Kartenspiel-Serie?|Yu-Gi-Oh!|Digimon|Pokémon|Ben 10
Anime & Action|In welcher Schule lernen die Winx Feenmagie?|Alfea|Third Street|Hollywood Arts|Schloss Einstein
Anime & Action|Wie heißt die zentrale Fee im Winx Club?|Bloom|Stella|Flora|Musa
Anime & Action|Welcher Held trägt eine Fledermausmaske?|Batman|Robin|Ben 10|Aang
Anime & Action|Wie heißt der Anführer der Teen Titans?|Robin|Cyborg|Beast Boy|Raven
Anime & Action|Welche Star-Wars-Figur ist Anakins Padawan in The Clone Wars?|Ahsoka Tano|Leia Organa|Rey|Sabine Wren
Anime & Action|Welche Figur ruft die Power Rangers zunächst zusammen?|Zordon|Rita Repulsa|Megatron|Ozai
Anime & Action|Welches Team kehrt in X-Men ’97 zurück?|X-Men|Teen Titans|Power Rangers|Winx Club
Neue Favoriten|Welche Hunderasse ist Bluey?|Blue Heeler|Dalmatiner|Beagle|Pudel
Neue Favoriten|Wie heißt Blueys kleine Schwester?|Bingo|Chilli|Muffin|Honey
Neue Favoriten|Wie heißen Blueys Eltern?|Bandit und Chilli|Ryder und Katie|Tommy und Didi|Finn und Jake
Neue Favoriten|Wer leitet die PAW Patrol?|Ryder|Skipper|Henry|Bandit
Neue Favoriten|Welcher Hund aus PAW Patrol ist Polizist?|Chase|Marshall|Rubble|Rocky
Neue Favoriten|Wer ist Ladybugs Partner in Miraculous?|Cat Noir|Kid Danger|Spidey|Robin
Neue Favoriten|Wie heißt Ladybug im Alltag?|Marinette|Alya|Chloé|Kagami
Neue Favoriten|In welcher Stadt spielt Miraculous hauptsächlich?|Paris|London|New York|Berlin
Neue Favoriten|Welches Tier ist Jake aus Adventure Time?|Hund|Katze|Fuchs|Pinguin
Neue Favoriten|Wie heißt Finns Begleiter in Adventure Time?|Jake|Gumball|Darwin|Barry
Neue Favoriten|Welche beiden Freunde wohnen in Elmore?|Gumball und Darwin|Finn und Jake|Dipper und Mabel|Phineas und Ferb
Neue Favoriten|Welche Farbe hat Gumball Watterson?|blau|grün|rot|gelb
Neue Favoriten|Wo erlebt Hilda ihre Abenteuer?|Trolberg|Bikini Bottom|Retroville|Elmore
Neue Favoriten|In welcher Serie betritt Gabby ein magisches Puppenhaus?|Gabby's Dollhouse|Bluey|Hilda|Kiff
Neue Favoriten|Wie heißt Spideys Freundin mit Spinnenkräften?|Ghost-Spider|Ladybug|Starfire|Raven
Neue Favoriten|Welches Tier ist Kiff?|Eichhörnchen|Hamster|Hund|Katze`;
export const KNOWLEDGE = ROWS.split('\n').map((line,index) => { const [world,prompt,answer,...wrong] = line.split('|'); return { id: `k:${index}`, category: world, world, prompt, answer, options: [answer,...wrong] }; });

