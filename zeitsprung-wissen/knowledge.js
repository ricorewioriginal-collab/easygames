// Redaktionell geschriebene, zeitstabile Wissensfragen: Frage | richtig | drei Ablenker.
// Jede Kategorie gehört zu einer Themenwelt aus events.js.
const sets = {
'Geschichte': `Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?|Konrad Adenauer|Ludwig Erhard|Willy Brandt|Helmut Schmidt
Wer war der erste römische Kaiser?|Augustus|Julius Caesar|Nero|Konstantin
In welcher Stadt wurde Julius Caesar ermordet?|Rom|Athen|Alexandria|Karthago
Wer leitete die Expedition, die als erste die Erde umrundete?|Ferdinand Magellan|Christoph Kolumbus|Vasco da Gama|James Cook
Wer veröffentlichte 1517 die 95 Thesen in Wittenberg?|Martin Luther|Johannes Calvin|Jan Hus|Ulrich Zwingli
Wie hieß der letzte deutsche Kaiser?|Wilhelm II.|Wilhelm I.|Friedrich III.|Otto I.
Wer war der erste Reichskanzler des Deutschen Kaiserreichs?|Otto von Bismarck|Leo von Caprivi|Gustav Stresemann|Friedrich Ebert
Wer war der erste Reichspräsident der Weimarer Republik?|Friedrich Ebert|Paul von Hindenburg|Gustav Stresemann|Walther Rathenau
In welchen Städten wurde der Westfälische Frieden geschlossen?|Münster und Osnabrück|Köln und Bonn|Wien und Prag|Augsburg und Ulm
Welche Stadt wurde 1949 vorläufige Hauptstadt der Bundesrepublik?|Bonn|Frankfurt am Main|Köln|Stuttgart
Wer führte die DDR, als 1961 die Berliner Mauer gebaut wurde?|Walter Ulbricht|Erich Honecker|Egon Krenz|Wilhelm Pieck
Wer war der letzte Staatschef der Sowjetunion?|Michail Gorbatschow|Leonid Breschnew|Boris Jelzin|Nikita Chruschtschow
Welches Volk gründete die Stadt Karthago?|Phönizier|Römer|Griechen|Ägypter
Welche ägyptische Herrscherin verbündete sich mit Marcus Antonius?|Kleopatra VII.|Nofretete|Hatschepsut|Nefertari
Welcher Feldherr zog mit Kriegselefanten über die Alpen?|Hannibal|Julius Caesar|Alexander der Große|Attila
Wie hieß der Cherusker, der im Jahr 9 die Römer besiegte?|Arminius|Vercingetorix|Marbod|Spartacus
Welches Reich begründete Dschingis Khan?|Mongolisches Reich|Osmanisches Reich|Perserreich|Byzantinisches Reich
Welcher französische Kaiser verlor 1815 bei Waterloo?|Napoleon Bonaparte|Ludwig XIV.|Karl der Große|Napoleon III.
Welcher König wurde „Sonnenkönig“ genannt?|Ludwig XIV.|Ludwig XVI.|Heinrich IV.|Friedrich II.
Welcher preußische König wird „der Große“ genannt?|Friedrich II.|Friedrich Wilhelm I.|Wilhelm I.|Friedrich III.
Wie heißt die römische Grenzbefestigung in Germanien?|Limes|Hadrianswall|Atlantikwall|Danewerk
Wer war US-Präsident während des Amerikanischen Bürgerkriegs?|Abraham Lincoln|George Washington|Thomas Jefferson|Ulysses S. Grant
Wer war der erste Präsident der USA?|George Washington|Thomas Jefferson|John Adams|Benjamin Franklin
Mit welchem Schiff kamen 1620 die Pilgerväter nach Amerika?|Mayflower|Santa María|Bounty|Victoria
Wie hieß das Flaggschiff von Kolumbus im Jahr 1492?|Santa María|Pinta|Niña|Mayflower
Wer schrieb mit Friedrich Engels das „Kommunistische Manifest“?|Karl Marx|Lenin|Rosa Luxemburg|August Bebel
Wer führte 1917 die Bolschewiki in der Oktoberrevolution an?|Lenin|Stalin|Trotzki|Kerenski
Wie heißt die Konferenz der Siegermächte 1945 bei Berlin?|Potsdamer Konferenz|Konferenz von Jalta|Konferenz von Teheran|Wannseekonferenz
In welcher Stadt standen ab 1945 die NS-Hauptkriegsverbrecher vor Gericht?|Nürnberg|München|Berlin|Frankfurt am Main
Wie nennt man die Versorgung West-Berlins aus der Luft 1948/49?|Berliner Luftbrücke|Operation Overlord|Operation Barbarossa|Marshallplan
Welches US-Programm unterstützte nach 1945 den Wiederaufbau Europas?|Marshallplan|New Deal|Morgenthau-Plan|Dawes-Plan
Wer war von 1982 bis 1998 Bundeskanzler?|Helmut Kohl|Helmut Schmidt|Gerhard Schröder|Willy Brandt
Welcher Bundeskanzler erhielt 1971 den Friedensnobelpreis?|Willy Brandt|Helmut Schmidt|Konrad Adenauer|Helmut Kohl
Welche Bürgerrechtlerin weigerte sich 1955, ihren Sitzplatz im Bus zu räumen?|Rosa Parks|Harriet Tubman|Angela Davis|Coretta Scott King
Welche britische Kolonie wurde 1947 in Indien und Pakistan geteilt?|Britisch-Indien|Ceylon|Burma|Malaya
Wer führte Indiens gewaltfreien Kampf um die Unabhängigkeit an?|Mahatma Gandhi|Indira Gandhi|Muhammad Ali Jinnah|Rabindranath Tagore
Welche Seuche tötete im 14. Jahrhundert etwa ein Drittel der Menschen in Europa?|Pest|Cholera|Pocken|Spanische Grippe
Welcher Pharao wurde durch sein 1922 entdecktes Grab berühmt?|Tutanchamun|Ramses II.|Cheops|Echnaton
Welche Stadt wurde im Jahr 79 vom Vesuv verschüttet?|Pompeji|Ostia|Syrakus|Ravenna
Welches antike Weltwunder steht bis heute?|Pyramiden von Gizeh|Koloss von Rhodos|Hängende Gärten von Babylon|Leuchtturm von Alexandria`,
'Politik': `Wie viele Bundesländer hat Deutschland?|16|14|15|18
Wer wählt den Bundeskanzler?|Bundestag|Bundesrat|Bundesversammlung|Bundespräsident
Wer wählt den Bundespräsidenten?|Bundesversammlung|Bundestag|Bundesrat|das Volk direkt
Für wie viele Jahre wird der Bundestag gewählt?|4 Jahre|5 Jahre|6 Jahre|3 Jahre
Für wie viele Jahre wird der Bundespräsident gewählt?|5 Jahre|4 Jahre|6 Jahre|7 Jahre
Wie heißt die Verfassung der Bundesrepublik Deutschland?|Grundgesetz|Bundesverfassung|Reichsverfassung|Staatsvertrag
Welcher Artikel des Grundgesetzes beginnt mit „Die Würde des Menschen ist unantastbar“?|Artikel 1|Artikel 3|Artikel 5|Artikel 20
Welches Verfassungsorgan vertritt die Länder auf Bundesebene?|Bundesrat|Bundestag|Bundesversammlung|Bundesverfassungsgericht
In welcher Stadt sitzt das Bundesverfassungsgericht?|Karlsruhe|Berlin|Leipzig|Bonn
In welchem Gebäude tagt der Deutsche Bundestag?|Reichstagsgebäude|Bundeskanzleramt|Schloss Bellevue|Rotes Rathaus
Wie heißt der Amtssitz des Bundespräsidenten in Berlin?|Schloss Bellevue|Bundeskanzleramt|Reichstagsgebäude|Schloss Charlottenburg
Ab welchem Alter darf man bei der Bundestagswahl wählen?|18 Jahre|16 Jahre|21 Jahre|17 Jahre
Wie viele Stimmen hat man bei der Bundestagswahl?|zwei|eine|drei|vier
Wie heißt die Aufteilung der Staatsmacht in Gesetzgebung, Regierung und Rechtsprechung?|Gewaltenteilung|Föderalismus|Subsidiarität|Parlamentarismus
Wie nennt man die Aufteilung Deutschlands in Bund und Länder?|Föderalismus|Zentralismus|Gewaltenteilung|Absolutismus
Wie viele Prozent der Zweitstimmen braucht eine Partei normalerweise für den Bundestag?|5 Prozent|3 Prozent|10 Prozent|7 Prozent
Welcher Partei gehörte Konrad Adenauer an?|CDU|SPD|FDP|CSU
In welcher Stadt hat das Europäische Parlament seinen offiziellen Sitz?|Straßburg|Brüssel|Luxemburg|Frankfurt am Main
In welcher Stadt sitzt die Europäische Zentralbank?|Frankfurt am Main|Brüssel|Paris|Luxemburg
Wie viele Mitgliedstaaten hat die EU seit dem Brexit?|27|28|25|30
Wie viele Sterne zeigt die Europaflagge?|12|15|27|10
Welches Land verließ 2020 die Europäische Union?|Vereinigtes Königreich|Irland|Dänemark|Griechenland
Welche Melodie ist die Hymne der Europäischen Union?|Beethovens „Ode an die Freude“|Händels „Halleluja“|Mozarts „Kleine Nachtmusik“|Elgars „Pomp and Circumstance“
In welcher Stadt haben die Vereinten Nationen ihren Hauptsitz?|New York|Genf|Washington, D.C.|Wien
Wie viele ständige Mitglieder hat der UN-Sicherheitsrat?|5|7|10|15
Welches Land ist kein ständiges Mitglied des UN-Sicherheitsrats?|Deutschland|Frankreich|China|Russland
In welcher Stadt hat die NATO ihr Hauptquartier?|Brüssel|Washington, D.C.|Genf|Den Haag
Wo sitzt der Internationale Gerichtshof?|Den Haag|Genf|Straßburg|New York
Wie heißt das Unterhaus des britischen Parlaments?|House of Commons|House of Lords|Senate|Staatsduma
Wie heißt das Unterhaus des russischen Parlaments?|Staatsduma|Knesset|Sejm|Storting
Wie heißt das Parlament Israels?|Knesset|Duma|Sejm|Riksdag
Wie heißt das Unterhaus des polnischen Parlaments?|Sejm|Rada|Storting|Riksdag
Wie heißt der Amtssitz des US-Präsidenten?|Weißes Haus|Kapitol|Pentagon|Lincoln Memorial
In welchem Gebäude tagt der US-Kongress?|Kapitol|Weißes Haus|Pentagon|Federal Hall
Für wie viele Jahre wird der US-Präsident gewählt?|4 Jahre|5 Jahre|6 Jahre|8 Jahre
Wie lautet die Adresse des britischen Premierministers?|10 Downing Street|Buckingham Palace|Whitehall 1|Baker Street 221b
Wie heißt der Amtssitz des französischen Präsidenten?|Élysée-Palast|Louvre|Schloss Versailles|Palais Bourbon
In welcher Stadt wird der Friedensnobelpreis verliehen?|Oslo|Stockholm|Genf|Kopenhagen`,
'Erdkunde': `Welcher Fluss fließt durch Köln?|Rhein|Main|Elbe|Mosel
Welcher Fluss fließt durch Hamburg?|Elbe|Weser|Rhein|Oder
Welcher Fluss fließt durch Wien, Budapest und Belgrad?|Donau|Rhein|Moldau|Theiß
Durch welche Stadt fließt die Themse?|London|Paris|Dublin|Edinburgh
Durch welche Stadt fließt die Seine?|Paris|Lyon|Marseille|Brüssel
Welcher Fluss fließt durch Prag?|Moldau|Elbe|Donau|Oder
Welcher Fluss bildet einen großen Teil der deutsch-polnischen Grenze?|Oder|Elbe|Weichsel|Spree
Wie heißt der höchste Berg Deutschlands?|Zugspitze|Watzmann|Brocken|Feldberg
In welchem Bundesland liegt die Zugspitze?|Bayern|Baden-Württemberg|Sachsen|Thüringen
Wie heißt der höchste Berg der Erde?|Mount Everest|K2|Kangchendzönga|Mont Blanc
Wie heißt der höchste Berg Afrikas?|Kilimandscharo|Mount Kenya|Toubkal|Ruwenzori
Wie heißt der höchste Berg der Alpen?|Mont Blanc|Matterhorn|Großglockner|Zugspitze
In welchem Mittelgebirge liegt der Brocken?|Harz|Schwarzwald|Erzgebirge|Thüringer Wald
Welches Gebirge trennt Spanien und Frankreich?|Pyrenäen|Alpen|Apenninen|Karpaten
Welches Gebirge gilt als Grenze zwischen Europa und Asien?|Ural|Karpaten|Pyrenäen|Apenninen
Welcher ist der größte Ozean der Erde?|Pazifik|Atlantik|Indischer Ozean|Arktischer Ozean
Welcher ist der größte Kontinent der Erde?|Asien|Afrika|Nordamerika|Europa
Welches ist flächenmäßig das größte Land der Erde?|Russland|Kanada|China|USA
Welches ist das kleinste Land der Erde?|Vatikanstadt|Monaco|San Marino|Liechtenstein
Welches Land hat seit 2023 die meisten Einwohner?|Indien|China|USA|Indonesien
Welcher ist der größte See, der ganz in Deutschland liegt?|Müritz|Bodensee|Chiemsee|Starnberger See
Welches Land grenzt nicht an den Bodensee?|Frankreich|Deutschland|Österreich|Schweiz
Wie viele Nachbarländer hat Deutschland?|9|8|10|7
Welches ist die größte deutsche Insel?|Rügen|Usedom|Fehmarn|Sylt
Wie heißt Deutschlands Hochseeinsel in der Nordsee?|Helgoland|Rügen|Fehmarn|Usedom
Welche Stadt hat die meisten Einwohner in Deutschland?|Berlin|Hamburg|München|Köln
Welche ist die größte Hitzewüste der Erde?|Sahara|Gobi|Kalahari|Atacama
Welcher Fluss führt weltweit das meiste Wasser?|Amazonas|Nil|Jangtse|Mississippi
Welches Meer liegt zwischen Europa und Afrika?|Mittelmeer|Rotes Meer|Schwarzes Meer|Kaspisches Meer
Wie heißt die Meerenge zwischen Spanien und Marokko?|Straße von Gibraltar|Bosporus|Ärmelkanal|Straße von Messina
Welche Meerenge trennt in Istanbul Europa und Asien?|Bosporus|Straße von Gibraltar|Straße von Hormus|Ärmelkanal
Welcher Kanal verbindet das Mittelmeer mit dem Roten Meer?|Suezkanal|Panamakanal|Nord-Ostsee-Kanal|Kanal von Korinth
In welchem Land liegt Machu Picchu?|Peru|Bolivien|Chile|Mexiko
In welcher Stadt steht der Schiefe Turm?|Pisa|Florenz|Rom|Venedig
Welche Stadt trägt den Spitznamen „Big Apple“?|New York|Chicago|Los Angeles|Boston
Auf welchem Kontinent liegt der größte Teil des Amazonas-Regenwalds?|Südamerika|Afrika|Asien|Ozeanien
Wie heißt die Linie, die die Erde in Nord- und Südhalbkugel teilt?|Äquator|Nullmeridian|Wendekreis des Krebses|Datumsgrenze
Durch welchen Londoner Stadtteil verläuft der Nullmeridian?|Greenwich|Soho|Camden|Westminster
Wie viele Kontinente zählt man in Deutschland üblicherweise?|7|5|6|8
Welcher ist der höchste aktive Vulkan Europas?|Ätna|Vesuv|Stromboli|Hekla
Welches Land hat die Form eines Stiefels?|Italien|Griechenland|Spanien|Portugal
Wie heißt der größte Gletscher der Alpen?|Großer Aletschgletscher|Pasterze|Rhonegletscher|Mer de Glace
Welche Klimazone liegt rund um den Äquator?|Tropen|Subtropen|gemäßigte Zone|Polarzone
Wie nennt man eine Flussmündung, die sich in viele Arme aufteilt?|Delta|Fjord|Lagune|Haff
Wie heißen die langen, tief ins Land reichenden Meeresbuchten Norwegens?|Fjorde|Lagunen|Atolle|Haffe`,
'Wissenschaft & Natur': `Welcher Planet ist der Sonne am nächsten?|Merkur|Venus|Mars|Erde
Welcher ist der größte Planet unseres Sonnensystems?|Jupiter|Saturn|Neptun|Uranus
Wie viele Planeten hat unser Sonnensystem?|8|9|7|10
Welcher Planet wird „Roter Planet“ genannt?|Mars|Venus|Jupiter|Merkur
Welcher Planet hat die auffälligsten Ringe?|Saturn|Jupiter|Uranus|Neptun
Welches chemische Symbol hat Gold?|Au|Ag|Go|Gd
Welches Element hat das Symbol Fe?|Eisen|Fluor|Francium|Fermium
Welches Gas nehmen Pflanzen bei der Fotosynthese auf?|Kohlendioxid|Sauerstoff|Stickstoff|Wasserstoff
Bei wie viel Grad Celsius siedet Wasser auf Meereshöhe?|100 Grad|90 Grad|120 Grad|80 Grad
Wofür steht die Formel H₂O?|Wasser|Wasserstoffperoxid|Kochsalz|Ozon
Wie viele Knochen hat ein erwachsener Mensch etwa?|206|180|250|312
Wie viele Chromosomen hat ein Mensch normalerweise?|46|23|44|48
Welches Organ pumpt das Blut durch den Körper?|Herz|Lunge|Leber|Niere
Welches ist das größte Organ des Menschen?|Haut|Leber|Lunge|Gehirn
Wie viele Zähne hat ein vollständiges Erwachsenengebiss mit Weisheitszähnen?|32|28|30|36
Wer entwickelte die Relativitätstheorie?|Albert Einstein|Isaac Newton|Max Planck|Niels Bohr
Wer formulierte das Gravitationsgesetz?|Isaac Newton|Galileo Galilei|Johannes Kepler|Albert Einstein
Wer entdeckte das Penicillin?|Alexander Fleming|Louis Pasteur|Robert Koch|Marie Curie
Wer entdeckte den Erreger der Tuberkulose?|Robert Koch|Rudolf Virchow|Paul Ehrlich|Louis Pasteur
Wer erhielt als erster Mensch zwei Nobelpreise?|Marie Curie|Albert Einstein|Linus Pauling|Niels Bohr
Wie schnell ist Licht im Vakuum ungefähr?|300.000 km pro Sekunde|30.000 km pro Sekunde|3 Millionen km pro Sekunde|3.000 km pro Sekunde
Wie lange braucht das Sonnenlicht ungefähr bis zur Erde?|8 Minuten|8 Sekunden|1 Stunde|1 Tag
Welches ist das größte Tier der Erde?|Blauwal|Afrikanischer Elefant|Pottwal|Walhai
Welches dieser Säugetiere kann aktiv fliegen?|Fledermaus|Gleithörnchen|Lemur|Faultier
Wie viele Beine hat eine Spinne?|8|6|10|12
Wer erfand in Europa den Buchdruck mit beweglichen Lettern?|Johannes Gutenberg|Martin Luther|Albrecht Dürer|Leonardo da Vinci
Wer erhielt 1876 das Patent auf das Telefon?|Alexander Graham Bell|Thomas Edison|Nikola Tesla|Guglielmo Marconi
Wer baute den Patent-Motorwagen von 1886?|Carl Benz|Gottlieb Daimler|Henry Ford|Rudolf Diesel
Wie heißt die feste, in Platten zerbrochene Gesteinshülle der Erde?|Lithosphäre|Atmosphäre|Hydrosphäre|Biosphäre`,
'Allgemeinwissen': `Wer malte die „Mona Lisa“?|Leonardo da Vinci|Michelangelo|Raffael|Rembrandt
Wer malte die Decke der Sixtinischen Kapelle?|Michelangelo|Leonardo da Vinci|Raffael|Botticelli
Wer schrieb „Faust“?|Johann Wolfgang von Goethe|Friedrich Schiller|Heinrich Heine|Thomas Mann
Wer schrieb das Drama „Die Räuber“?|Friedrich Schiller|Johann Wolfgang von Goethe|Gotthold Ephraim Lessing|Heinrich von Kleist
Welcher in Bonn geborene Komponist verlor sein Gehör?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach|Franz Schubert
In welcher Stadt wurde Mozart geboren?|Salzburg|Wien|Prag|München
Wer komponierte „Eine kleine Nachtmusik“?|Wolfgang Amadeus Mozart|Ludwig van Beethoven|Johann Sebastian Bach|Joseph Haydn
Wer schrieb „Romeo und Julia“?|William Shakespeare|Charles Dickens|Oscar Wilde|Molière
Wer schrieb die Märchen „Hänsel und Gretel“ und „Rumpelstilzchen“ auf?|Brüder Grimm|Hans Christian Andersen|Wilhelm Hauff|Ludwig Bechstein
Wie viele Spieler einer Fußballmannschaft stehen auf dem Platz?|11|10|9|12
Alle wie viele Jahre finden Olympische Sommerspiele statt?|4|2|3|5
Wie viele Ringe zeigt das olympische Symbol?|5|4|6|7
Wie viele Tage hat ein Schaltjahr?|366|365|364|367
Wie viele Minuten hat ein Tag?|1.440|1.200|1.000|2.400
Wie viele Felder hat ein Schachbrett?|64|81|100|49
Wie viele Farben hat ein Regenbogen nach klassischer Einteilung?|7|5|6|8
Wie heißt die Währung Japans?|Yen|Yuan|Won|Ringgit
Wie heißt die Währung Großbritanniens?|Pfund Sterling|Euro|Dollar|Krone
Wie heißt die Währung der Schweiz?|Franken|Euro|Krone|Gulden
Welche Sprache spricht man in Brasilien?|Portugiesisch|Spanisch|Französisch|Italienisch
Welche Sprache hat weltweit die meisten Muttersprachler?|Chinesisch (Mandarin)|Englisch|Spanisch|Hindi
Für welche Weltausstellung wurde der Eiffelturm gebaut?|Paris 1889|Paris 1900|London 1851|Wien 1873
In welcher Stadt steht das Brandenburger Tor?|Berlin|Potsdam|Brandenburg an der Havel|Dresden
In welchem Land steht das Taj Mahal?|Indien|Pakistan|Iran|Bangladesch
In welcher Stadt steht das Kolosseum?|Rom|Athen|Verona|Neapel
In welchem Land steht die Freiheitsstatue?|USA|Frankreich|Kanada|Großbritannien
Welches Tier zeigt das Bundeswappen Deutschlands?|Adler|Löwe|Bär|Hirsch
Welche Farben hat die deutsche Flagge von oben nach unten?|Schwarz-Rot-Gold|Rot-Schwarz-Gold|Gold-Rot-Schwarz|Schwarz-Gold-Rot
Welche Strophe des Deutschlandlieds ist die Nationalhymne?|die dritte|die erste|die zweite|die vierte
Welches Musikinstrument hat in der Regel 88 Tasten?|Klavier|Akkordeon|Harmonium|Cembalo`
};

// Hauptstädte: Land | Hauptstadt | Kontinent (leer = Kontinentfrage nicht eindeutig).
const COUNTRIES = `Deutschland|Berlin|Europa
Frankreich|Paris|Europa
Italien|Rom|Europa
Spanien|Madrid|Europa
Portugal|Lissabon|Europa
Vereinigtes Königreich|London|Europa
Irland|Dublin|Europa
Niederlande|Amsterdam|Europa
Belgien|Brüssel|Europa
Schweiz|Bern|Europa
Österreich|Wien|Europa
Polen|Warschau|Europa
Tschechien|Prag|Europa
Slowakei|Bratislava|Europa
Ungarn|Budapest|Europa
Dänemark|Kopenhagen|Europa
Schweden|Stockholm|Europa
Norwegen|Oslo|Europa
Finnland|Helsinki|Europa
Island|Reykjavík|Europa
Estland|Tallinn|Europa
Lettland|Riga|Europa
Litauen|Vilnius|Europa
Griechenland|Athen|Europa
Rumänien|Bukarest|Europa
Bulgarien|Sofia|Europa
Kroatien|Zagreb|Europa
Slowenien|Ljubljana|Europa
Serbien|Belgrad|Europa
Ukraine|Kiew|Europa
Albanien|Tirana|Europa
Malta|Valletta|Europa
Russland|Moskau|
Türkei|Ankara|
China|Peking|Asien
Japan|Tokio|Asien
Südkorea|Seoul|Asien
Nordkorea|Pjöngjang|Asien
Indien|Neu-Delhi|Asien
Pakistan|Islamabad|Asien
Bangladesch|Dhaka|Asien
Thailand|Bangkok|Asien
Vietnam|Hanoi|Asien
Philippinen|Manila|Asien
Malaysia|Kuala Lumpur|Asien
Mongolei|Ulaanbaatar|Asien
Iran|Teheran|Asien
Irak|Bagdad|Asien
Saudi-Arabien|Riad|Asien
Afghanistan|Kabul|Asien
Nepal|Kathmandu|Asien
Kasachstan|Astana|
Jordanien|Amman|Asien
Syrien|Damaskus|Asien
Libanon|Beirut|Asien
Katar|Doha|Asien
Vereinigte Arabische Emirate|Abu Dhabi|Asien
Ägypten|Kairo|Afrika
Marokko|Rabat|Afrika
Algerien|Algier|Afrika
Tunesien|Tunis|Afrika
Nigeria|Abuja|Afrika
Ghana|Accra|Afrika
Senegal|Dakar|Afrika
Kenia|Nairobi|Afrika
Äthiopien|Addis Abeba|Afrika
Uganda|Kampala|Afrika
Ruanda|Kigali|Afrika
Angola|Luanda|Afrika
Mali|Bamako|Afrika
Simbabwe|Harare|Afrika
Namibia|Windhuk|Afrika
Madagaskar|Antananarivo|Afrika
Kamerun|Yaoundé|Afrika
Demokratische Republik Kongo|Kinshasa|Afrika
USA|Washington, D.C.|Nordamerika
Kanada|Ottawa|Nordamerika
Mexiko|Mexiko-Stadt|Nordamerika
Kuba|Havanna|
Jamaika|Kingston|
Costa Rica|San José|
Brasilien|Brasília|Südamerika
Argentinien|Buenos Aires|Südamerika
Chile|Santiago de Chile|Südamerika
Peru|Lima|Südamerika
Kolumbien|Bogotá|Südamerika
Venezuela|Caracas|Südamerika
Ecuador|Quito|Südamerika
Uruguay|Montevideo|Südamerika
Paraguay|Asunción|Südamerika
Australien|Canberra|Ozeanien
Neuseeland|Wellington|Ozeanien
Fidschi|Suva|Ozeanien
Papua-Neuguinea|Port Moresby|Ozeanien`.split('\n').map(line => { const [country, capital, continent] = line.split('|'); return { country, capital, continent }; });

const STATES = `Baden-Württemberg|Stuttgart
Bayern|München
Brandenburg|Potsdam
Hessen|Wiesbaden
Mecklenburg-Vorpommern|Schwerin
Niedersachsen|Hannover
Nordrhein-Westfalen|Düsseldorf
Rheinland-Pfalz|Mainz
Saarland|Saarbrücken
Sachsen|Dresden
Sachsen-Anhalt|Magdeburg
Schleswig-Holstein|Kiel
Thüringen|Erfurt`.split('\n').map(line => line.split('|'));

const WORLD_OF = { 'Geschichte': 'Geschichte', 'Politik': 'Politik', 'Erdkunde': 'Erdkunde & Geographie', 'Hauptstädte': 'Erdkunde & Geographie', 'Kontinente': 'Erdkunde & Geographie', 'Bundesländer': 'Erdkunde & Geographie', 'Wissenschaft & Natur': 'Wissenschaft & Entdeckungen', 'Allgemeinwissen': 'Kultur & Allgemeinwissen' };
// Wählt reproduzierbar verschiedene Ablenker aus einer Liste.
const pick = (list, index, count) => { const out = []; for (let i = 0; out.length < count && i < list.length * 2; i++) { const item = list[(index + 1 + i * 7) % list.length]; if (!out.includes(item)) out.push(item); } for (const item of list) if (out.length < count && !out.includes(item)) out.push(item); return out; };
const question = (id, category, prompt, answer, wrong) => ({ id, category, world: WORLD_OF[category], prompt, answer, options: [answer, ...wrong] });

const editorial = Object.entries(sets).flatMap(([category, block]) => block.trim().split('\n').map((line, index) => {
  const [prompt, answer, ...wrong] = line.split('|');
  return question(`k:${category}:${index}`, category, prompt, answer, wrong);
}));
const capitals = COUNTRIES.map((entry, index) => {
  const sameContinent = COUNTRIES.filter(other => other !== entry && (other.continent || 'x') === (entry.continent || 'x'));
  const pool = (sameContinent.length >= 6 ? sameContinent : COUNTRIES.filter(other => other !== entry)).map(other => other.capital);
  return question(`cap:${index}`, 'Hauptstädte', `Was ist die Hauptstadt von ${entry.country}?`, entry.capital, pick(pool, index, 3));
});
const CONTINENTS = ['Europa', 'Asien', 'Afrika', 'Nordamerika', 'Südamerika', 'Ozeanien'];
const continents = COUNTRIES.filter(entry => entry.continent).map((entry, index) => {
  const wrong = CONTINENTS.filter(name => name !== entry.continent);
  return question(`kont:${index}`, 'Kontinente', `Auf welchem Kontinent liegt ${entry.country}?`, entry.continent, pick(wrong, index, 3));
});
const states = STATES.map(([state, capital], index) => question(`land:${index}`, 'Bundesländer', `Was ist die Landeshauptstadt von ${state}?`, capital, pick(STATES.map(s => s[1]).filter(c => c !== capital), index, 3)));

export const KNOWLEDGE = [...editorial, ...capitals, ...continents, ...states];
