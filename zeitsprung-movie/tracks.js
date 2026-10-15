// Filmkatalog: Titel | verantwortliches Studio | Kinostartjahr.
// Jahreszahlen beziehen sich auf den ursprünglichen Kinostart, nicht auf spätere deutsche Starts.
export const COLLECTIONS = {
  'Disney-Klassiker': `Schneewittchen und die sieben Zwerge|Walt Disney Animation Studios|1937
Cinderella|Walt Disney Animation Studios|1950
Dornröschen|Walt Disney Animation Studios|1959
Arielle, die Meerjungfrau|Walt Disney Animation Studios|1989
Die Schöne und das Biest|Walt Disney Animation Studios|1991
Aladdin|Walt Disney Animation Studios|1992
Der König der Löwen|Walt Disney Animation Studios|1994
Mulan|Walt Disney Animation Studios|1998
Rapunzel – Neu verföhnt|Walt Disney Animation Studios|2010
Die Eiskönigin – Völlig unverfroren|Walt Disney Animation Studios|2013
Die Eiskönigin 2|Walt Disney Animation Studios|2019
Vaiana|Walt Disney Animation Studios|2016
Encanto|Walt Disney Animation Studios|2021`,
  'Pixar': `Toy Story|Pixar Animation Studios|1995
Das große Krabbeln|Pixar Animation Studios|1998
Die Monster AG|Pixar Animation Studios|2001
Findet Nemo|Pixar Animation Studios|2003
Die Unglaublichen|Pixar Animation Studios|2004
Cars|Pixar Animation Studios|2006
Ratatouille|Pixar Animation Studios|2007
WALL·E|Pixar Animation Studios|2008
Oben|Pixar Animation Studios|2009
Alles steht Kopf|Pixar Animation Studios|2015
Coco – Lebendiger als das Leben!|Pixar Animation Studios|2017
Alles steht Kopf 2|Pixar Animation Studios|2024`,
  'Marvel': `Iron Man|Marvel Studios|2008
Marvel's The Avengers|Marvel Studios|2012
Guardians of the Galaxy|Marvel Studios|2014
Avengers: Age of Ultron|Marvel Studios|2015
The First Avenger: Civil War|Marvel Studios|2016
Doctor Strange|Marvel Studios|2016
Black Panther|Marvel Studios|2018
Avengers: Infinity War|Marvel Studios|2018
Captain Marvel|Marvel Studios|2019
Avengers: Endgame|Marvel Studios|2019
Shang-Chi and the Legend of the Ten Rings|Marvel Studios|2021
Black Panther: Wakanda Forever|Marvel Studios|2022`,
  'DC & Superhelden': `Superman|Warner Bros.|1978
Batman|Warner Bros.|1989
The Dark Knight|Warner Bros.|2008
The Dark Knight Rises|Warner Bros.|2012
Man of Steel|Warner Bros.|2013
Wonder Woman|Warner Bros.|2017
Aquaman|Warner Bros.|2018
Shazam!|Warner Bros.|2019
Joker|Warner Bros.|2019
The Batman|Warner Bros.|2022
Blue Beetle|Warner Bros.|2023
The Flash|Warner Bros.|2023`,
  'Kinderkino': `Shrek|DreamWorks Animation|2001
Madagascar|DreamWorks Animation|2005
Kung Fu Panda|DreamWorks Animation|2008
Drachenzähmen leicht gemacht|DreamWorks Animation|2010
Der gestiefelte Kater|DreamWorks Animation|2011
Ich – Einfach unverbesserlich|Illumination|2010
Minions|Illumination|2015
Sing|Illumination|2016
Pets|Illumination|2016
Trolls|DreamWorks Animation|2016
The Boss Baby|DreamWorks Animation|2017
Der Super Mario Bros. Film|Illumination|2023`,
  'Fantasy & Abenteuer': `Harry Potter und der Stein der Weisen|Warner Bros.|2001
Harry Potter und die Kammer des Schreckens|Warner Bros.|2002
Harry Potter und der Gefangene von Askaban|Warner Bros.|2004
Harry Potter und die Heiligtümer des Todes – Teil 2|Warner Bros.|2011
Der Herr der Ringe: Die Gefährten|New Line Cinema|2001
Der Herr der Ringe: Die zwei Türme|New Line Cinema|2002
Der Herr der Ringe: Die Rückkehr des Königs|New Line Cinema|2003
Der Hobbit: Eine unerwartete Reise|New Line Cinema|2012
Die Chroniken von Narnia: Der König von Narnia|Walt Disney Pictures|2005
Alice im Wunderland|Walt Disney Pictures|2010
Fluch der Karibik|Walt Disney Pictures|2003
Maleficent – Die dunkle Fee|Walt Disney Pictures|2014`,
  'Science-Fiction & Action': `Krieg der Sterne|Lucasfilm|1977
Das Imperium schlägt zurück|Lucasfilm|1980
Die Rückkehr der Jedi-Ritter|Lucasfilm|1983
Star Wars: Das Erwachen der Macht|Lucasfilm|2015
E.T. – Der Außerirdische|Universal Pictures|1982
Jurassic Park|Universal Pictures|1993
Zurück in die Zukunft|Universal Pictures|1985
Matrix|Warner Bros.|1999
Avatar – Aufbruch nach Pandora|20th Century Fox|2009
Dune|Warner Bros.|2021
Inception|Warner Bros.|2010
Alien – Das unheimliche Wesen aus einer fremden Welt|20th Century Fox|1979`,
  'Filmklassiker': `Casablanca|Warner Bros.|1942
Der Zauberer von Oz|Metro-Goldwyn-Mayer|1939
Singin’ in the Rain|Metro-Goldwyn-Mayer|1952
Der weiße Hai|Universal Pictures|1975
Rocky|United Artists|1976
Der Pate|Paramount Pictures|1972
Forrest Gump|Paramount Pictures|1994
Pulp Fiction|Miramax|1994
Kevin – Allein zu Haus|20th Century Fox|1990
Mrs. Doubtfire|20th Century Fox|1993
Ghostbusters – Die Geisterjäger|Columbia Pictures|1984
Schindlers Liste|Universal Pictures|1993`,
  'Moderne Kinohits': `Barbie|Warner Bros.|2023
Oppenheimer|Universal Pictures|2023
Top Gun|Paramount Pictures|1986
Top Gun: Maverick|Paramount Pictures|2022
Mission: Impossible|Paramount Pictures|1996
The Fast and the Furious|Universal Pictures|2001
Der Teufel trägt Prada|20th Century Fox|2006
La La Land|Lionsgate|2016
Die Tribute von Panem – The Hunger Games|Lionsgate|2012
Twilight – Biss zum Morgengrauen|Summit Entertainment|2008
Wicked|Universal Pictures|2024
Greatest Showman|20th Century Fox|2017`
};
export const TRACKS = Object.entries(COLLECTIONS).flatMap(([category,block]) => block.trim().split('\n').map((line,index)=>{const [title,studio,year]=line.split('|');return{id:`${category}:${index}`,category,title,studio,year:Number(year)};}));
// Nur überprüfte offizielle Trailer-IDs. Die Spielseite öffnet keine fremde Seite.
export const VIDEOS = {
  'Die Eiskönigin 2':'Zi4LMpSDccc',
  'Alles steht Kopf 2':'LEjhY15eCx0',
  'Avengers: Endgame':'TcMBFSGVi1c',
  'Barbie':'pBk4NYhWNMM',
  'Oppenheimer':'uYPbbksJxIg',
  'Dune':'n9xhJrPXop4',
  'Der Super Mario Bros. Film':'TnGl01FkMMo',
  'Black Panther: Wakanda Forever':'_Z3QKkl1WyM',
  'Encanto':'CaimKeDcudo',
  'Wicked':'6COmYeLsz4c',
  'Top Gun: Maverick':'qSqVVswa420',
  'Shrek':'CwXOrWvPBPk'
};
export const questionFor = film => `In welchem Jahr startete „${film.title}“ im Kino?`;
