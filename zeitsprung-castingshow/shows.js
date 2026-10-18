// Staffeldaten der Castingshows (Star Search: laufende Nummer statt Staffel, je Kategorie eine Zeile), geprüft mit de./en.wikipedia (Stand Oktober 2026).
// Zeile: Staffel | Jahr des Finales | Sieger | Platz 2 | Siegersong | Interpret | Deezer (1 = auf Deezer gefunden)
//        | Top 10, Finalisten, Coaches oder Bandmitglieder (;) | Jury (;) | Moderation (;) | Siegercoach/Mentor | Act/Kategorie
export const SHOW_INFO = {
  dsds: { name: 'DSDS', full: 'Deutschland sucht den Superstar', world: 'Deutschland sucht den Superstar', list: 'top10', song: 'Siegersong', songQ: 'der Siegersong' },
  st: { name: 'Das Supertalent', world: 'Supertalent & Got Talent', list: 'finale' },
  bgt: { name: 'Britain’s Got Talent', world: 'Supertalent & Got Talent' },
  agt: { name: 'America’s Got Talent', world: 'Supertalent & Got Talent' },
  gtd: { name: 'Got to Dance', world: 'Supertalent & Got Talent' },
  tvog: { name: 'The Voice of Germany', world: 'The Voice', list: 'coaches', song: 'Eigener Finalsong', songQ: 'der eigene Finalsong' },
  tvk: { name: 'The Voice Kids', world: 'The Voice' },
  vus: { name: 'The Voice (USA)', world: 'The Voice' },
  pop: { name: 'Popstars', world: 'Popstars & weitere deutsche Shows', list: 'band', song: 'Erste Single', songQ: 'die erste Single' },
  xf: { name: 'X Factor (Deutschland)', world: 'Popstars & weitere deutsche Shows', song: 'Eigener Finalsong', songQ: 'der eigene Finalsong' },
  ss: { name: 'Star Search', world: 'Popstars & weitere deutsche Shows' },
  gntm: { name: 'Germany’s Next Topmodel', world: 'Popstars & weitere deutsche Shows' },
  pi: { name: 'Pop Idol', world: 'Idol, X Factor & international', song: 'Siegersingle', songQ: 'die Siegersingle' },
  ai: { name: 'American Idol', world: 'Idol, X Factor & international', song: 'Siegersingle', songQ: 'die Siegersingle' },
  xfuk: { name: 'The X Factor (UK)', world: 'Idol, X Factor & international', song: 'Siegersingle', songQ: 'die Siegersingle' }
};

const TABLES = {
  dsds: `1|2003|Alexander Klaws|Juliette Schoppmann|Take Me Tonight|Alexander Klaws|1|Alexander Klaws;Juliette Schoppmann;Daniel Küblböck;Vanessa Struhler;Gracia Baur;Nicole Süßmilch;Daniel Lopes;Nektarios Bamiatzis;Judith Lefeber;Andrea Josten|Dieter Bohlen;Thomas Bug;Shona Fraser;Thomas M. Stein|Michelle Hunziker;Carsten Spengemann
2|2004|Elli Erl|Denise Tillmanns|||0|Elli Erl;Denise Tillmanns;Philippe Bühler;Benjamin Martell;Gunther Göbbel;Anke Wagner;Aida Ilijasevic;Judith Burmeister;Kemi Awosogba;Lorenzo Woodard|Dieter Bohlen;Thomas Bug;Shona Fraser;Thomas M. Stein|Michelle Hunziker;Carsten Spengemann
3|2006|Tobias Regner|Mike Leon Grosch|I Still Burn|Tobias Regner|1|Tobias Regner;Mike Leon Grosch;Vanessa Jean Dedmon;Nevio Passaro;Didi Knoblauch;Anna-Maria Zimmermann;Daniel Munoz;Lena Hanenberg;Dascha Semcov;Carolina Escolano|Dieter Bohlen;Sylvia Kollek;Heinz Henn|Marco Schreyl;Tooske Ragas
4|2007|Mark Medlock|Martin Stosch|Now or Never|Mark Medlock|1|Mark Medlock;Martin Stosch;Lisa Bund;Max Buskohl;Lauren Talbot;Thomas Enns;Francisca Urio;Julia Falke;Jonathan Enns;Laura Martin|Dieter Bohlen;Heinz Henn;Anja Lukaseder|Marco Schreyl;Tooske Ragas
5|2008|Thomas Godoj|Fady Maalouf|Love Is You|Thomas Godoj|1|Thomas Godoj;Fady Maalouf;Linda Teodosiu;Monika Ivkic;Rania Zeriri;Benjamin Herd;Collins Owusu;Stella Salato;Sahra Drone;Jermaine Alford|Dieter Bohlen;Anja Lukaseder;Andreas Läsker|Marco Schreyl
6|2009|Daniel Schuhmacher|Sarah Kreuz|Anything but Love|Daniel Schuhmacher|1|Daniel Schuhmacher;Sarah Kreuz;Annemarie Eilfeld;Dominik Büchele;Benny Kieckhäben;Vanessa Neigert;Holger Göpfert;Marc Jentzen;Cornelia Patzlsperger;Michelle Bowers|Dieter Bohlen;Nina Eichinger;Volker Neumüller|Marco Schreyl
7|2010|Mehrzad Marashi|Menowin Fröhlich|Don’t Believe|Mehrzad Marashi|1|Mehrzad Marashi;Menowin Fröhlich;Manuel Hoffmann;Kim Debkowski;Thomas Karaoglan;Helmut Orosz;Ines Redjeb;Nelson Sangaré;Marcel Pluschke;Steffi Landerer|Dieter Bohlen;Nina Eichinger;Volker Neumüller|Marco Schreyl
8|2011|Pietro Lombardi|Sarah Engels|||0|Pietro Lombardi;Sarah Engels;Ardian Bujupi;Marco Angelini;Sebastian Wurth;Zazou Mall;Norman Langen;Anna-Carina Woitschack;Nina Richel;Marvin Cybulski|Dieter Bohlen;Fernanda Brandão;Patrick Nuo|Marco Schreyl
9|2012|Luca Hänni|Daniele Negroni|||0|Luca Hänni;Daniele Negroni;Jesse Ritch;Fabienne Rothe;Joey Heindle;Kristof Hering;Hamed Anousheh;Vanessa Krasniqi;Silvia Amaru;Thomas Pegram|Dieter Bohlen;Natalie Horler;Bruce Darnell|Marco Schreyl
10|2013|Beatrice Egli|Lisa Wohlgemuth|Mein Herz|Beatrice Egli|1|Beatrice Egli;Lisa Wohlgemuth;Ricardo Bielecki;Susan Albers;Erwin Kintop;Tim David Weller;Simone Mangiapane;Timo Tiggeler;Maurice Glover;Nora Ferjani|Dieter Bohlen;Bill Kaulitz;Tom Kaulitz;Mateo Jaschik|Nazan Eckes;Raúl Richter
11|2014|Aneta Sablik|Meltem Acikgöz|||0|Aneta Sablik;Meltem Acikgöz;Daniel Ceylan;Richard Schlögl;Christopher Schnell;Yasemin Kocak;Elif Batman;Enrico von Krawczynski;Vanessa Valera Rojas;Alessandro Di Lella|Dieter Bohlen;Kay One;Mieze Katz;Marianne Rosenberg|Nazan Eckes
12|2015|Severino Seeger|Viviana Grisafi|||0|Severino Seeger;Viviana Grisafi;Antonio Gerardi;Jeannine Rossi;Erica Greenfield;Seraphina Ueberholz;Laura Lopez;Robin Eichinger;Marcel Kärcher;Leon Heidrich|Dieter Bohlen;Mandy Capristo;DJ Antoine;Heino|Oliver Geissen
13|2016|Prince Damien|Laura van den Elzen|Glücksmoment|Prince Damien|1|Prince Damien;Laura van den Elzen;Thomas Katrozan;Anita Wiegand;Igor Barbosa;Mark Hoffmann;Sandra Berger;Tobias Soltau;Ramona Mihailovic;Aytug Gün|Dieter Bohlen;Michelle;Vanessa Mai;H. P. Baxxter|Oliver Geissen
14|2017|Alphonso Williams|Alexander Jahnke|What Becomes of the Broken Hearted|Alphonso Williams|1|Alphonso Williams;Alexander Jahnke;Maria Voskania;Duygu Goenel;Noah Schärer;Chanelle Wyrsch;Sandro Brehorst;Monique Simon;Ivanildo Kembel;Ruben Mateo|Dieter Bohlen;Michelle;H. P. Baxxter;Shirin David|Oliver Geissen
15|2018|Marie Wegener|Michel Truog|Königlich|Marie Wegener|1|Marie Wegener;Michel Truog;Michael Rauscher;Janina el Arguioui;Lukas Otte;Mia Gucek;Giulio Arancio;Mario Turtak;Isa Martino;Emilija Mihailova|Dieter Bohlen;Ella Endlich;Carolin Niemczyk;Mousse T.|Oliver Geissen
16|2019|Davin Herbrüggen|Nick Ferretti|The River|Davin Herbrüggen|1|Davin Herbrüggen;Nick Ferretti;Joana Kesenci;Alicia-Awa Beissert;Taylor Luc Jacobs;Clarissa Schöppe;Momo Chahine;Jonas Weisser;Lukas Kepser;Angelina Mazzamurro|Dieter Bohlen;Pietro Lombardi;Oana Nechiti;Xavier Naidoo|Oliver Geissen
17|2020|Ramon Roselly|Chiara D’Amico|Eine Nacht|Ramon Roselly|1|Ramon Roselly;Chiara D’Amico;Joshua Tappe;Paulina Wagner;Lydia Kelovitz;Marcio Pereira Conrado;Ricardo Rodrigues|Dieter Bohlen;Pietro Lombardi;Oana Nechiti;Xavier Naidoo;Florian Silbereisen|Alexander Klaws
18|2021|Jan-Marten Block|Karl Jeroboan|Never Not Try|Jan-Marten Block|1|Jan-Marten Block;Karl Jeroboan;Kevin Jenewein;Starian Dwayne McCoy;Pia-Sophie Remmel;Michelle Patz;Jan Böckmann;Daniele Puccia;Daniel „Ludi“ Ludwig|Dieter Bohlen;Maite Kelly;Mike Singer|Oliver Geissen
19|2022|Harry Laffontien|Amber van den Elzen|Someone to You|Harry Laffontien|1|Harry Laffontien;Amber van den Elzen;Melissa Mantzoukis;Gianni Laffontien;Dominik Simmen;Melissa Turan;Din Omerhodzic;Tina Umbricht;Abigail Nova Campos;Domenico Tarantino|Florian Silbereisen;Ilse DeLange;Toby Gad|Marco Schreyl
20|2023|Sem Eisinger|Monika Gajek|Don’t Let Me Go|Sem Eisinger|1|Sem Eisinger;Monika Gajek;Lorent Berisha;Kiyan Yousefbeik;David Leischik;Peris Grigoriadis;Aileen Sager;Lawa Baban;Natalie Nock;Rose Ndumba|Dieter Bohlen;Pietro Lombardi;Katja Krasavice;Leony|Laura Wontorra
21|2024|Christian Jährig|Philip Matas|Auf eigenen Beinen|Christian Jährig|1|Christian Jährig;Philip Matas;Nissim Mizrahi;Tom Mc Conner|Dieter Bohlen;Pietro Lombardi;Beatrice Egli;Loredana|Laura Wontorra
22|2026|Menowin Fröhlich|Constance Dizendorf|Mercy On Me|Menowin|1|Menowin Fröhlich;Constance Dizendorf;Tyrell Hagedorn;Paco Simic;Abii Faizan;Maric Verch;Lex Spielhaupter;Kadischa Weiß;Valentina Wagner;Peter Heimerdinger|Dieter Bohlen;Bushido;Isi Glück|Laura Wontorra`,
  st: `1|2007|Ricardo Marinello|Tilly Horn|||0|Ricardo Marinello;Tilly Horn;Robert Wolf;Gino Badagliacca;Tobias Krieger;Philipp Fedan;Daniel Carr;Udo Uhse-Thews;Rabiniak-Schwestern;Renate Recknagel und Roswitha Wahl|Dieter Bohlen;Ruth Moschner;André Sarrasani|Marco Schreyl||Opernsänger (Tenor)
2|2008|Michael Hirte|Kelvin Kalvus|||0|Michael Hirte;Kelvin Kalvus;Marcel Pietruch;Vanessa Krasniqi;Yosefin Buohler;Christoph Haese;Shinouda Ayad;Lucas Wecker;Carlos Fassanelli;Duri Krasniqi|Dieter Bohlen;Sylvie Meis;Bruce Darnell|Marco Schreyl;Daniel Hartwich||Mundharmonikaspieler
3|2009|Yvo Antoni & PrimaDonna|Vanessa Calcagno|||0|Yvo Antoni & PrimaDonna;Vanessa Calcagno;Petruța Küpper;Davy Kaufmann;Richard Istel;Fabienne Bender;Oliver Roemer;Karin Andreev;Saraph (Hannes Schwarz);Tamina Geuting|Dieter Bohlen;Sylvie Meis;Bruce Darnell|Marco Schreyl;Daniel Hartwich||Hundedressur (Jack-Russell-Terrier)
4|2010|Freddy Sahin-Scholl|Michael Holderbusch|||0|Freddy Sahin-Scholl;Michael Holderbusch;Tobias Kramer;Andrea Renzullo;Ramona Fottner;Natalya Netselya;Stevie Starr;Darko Kordic;Thomas Lohse;Bubble Beatz|Dieter Bohlen;Sylvie Meis;Bruce Darnell|Marco Schreyl;Daniel Hartwich||Sänger (klassischer Gesang in zwei Stimmlagen)
5|2011|Leo Rojas|Sven Müller|||0|Leo Rojas;Sven Müller;Ricky Kam;Jörg Perreten;Julian Pecher;Mark Ashley;Miroslav Žilka;Desire Capaldo;Dergin Tokmak;Oleksandr Yenivatov|Dieter Bohlen;Sylvie Meis;Motsi Mabuse|Marco Schreyl;Daniel Hartwich||Panflötist
6|2012|Jean-Michel Aweh|Christian Bakotessa|||0|Jean-Michel Aweh;Christian Bakotessa;Dan Sperry;Papagei Jacko;Laura Pinski;Juliette Schoppmann;Emil Kusmirek;TaBeA;Hammou Bensalah;Deidra Jones|Dieter Bohlen;Michelle Hunziker;Thomas Gottschalk|Daniel Hartwich||Sänger und Pianist
7|2013|Lukas Pratschker & Falco|Torsten Ritter|||0|Lukas Pratschker & Falco;Torsten Ritter;Viviana Grisafi;Sophie Schwerthöffer;La Vision;Christian Jährig;Fortunato Lacovara;Heidi Schimiczek;Fantastic 5;Patrick De Souza Campelo Feldmann|Dieter Bohlen;Lena Gercke;Bruce Darnell;Guido Maria Kretschmer|Daniel Hartwich||Hundedressur (Dogdancing mit Border Collie)
8|2014|Marcel Kaupp|Andreas Hruska|||0|Marcel Kaupp;Andreas Hruska;Die Filieri-Brüder;Tumar KR;Duo You and Me;Light Balance;Show-Projekt;Emin Abdullaev;Patrick Müller-Klug;Laurent Kremer|Dieter Bohlen;Lena Gercke;Bruce Darnell;Guido Maria Kretschmer|Daniel Hartwich||Sänger und Travestiekünstler
9|2015|Jay Oh|Erwin Frankello mit Seelöwen Itchy & Scratchy|||0|Jay Oh;Erwin Frankello;Alessio Greco;Frank Lorenz;Lavinia Meinhardt;D’Holmikers;Russischer Barren Trio;Zymbalinka;Paddy & Nicko;Fabien Kachev|Dieter Bohlen;Inka Bause;Bruce Darnell|Daniel Hartwich||Sänger
10|2016|Angel Flukes|Thomas Stieben|||0|Angel Flukes;Thomas Stieben;Gebrüder Scholl;Alina Ruppel;Carlos Zaspel;Annette Dytrt & Yannick Bonheur;Emil Kusmirek;Alex Mihajlovski;Salvatore Scire;Mannheimer Schule 2.0|Dieter Bohlen;Victoria Swarovski;Bruce Darnell|Daniel Hartwich||Sängerin
11|2017|Alexa Lauenburger|Allegra Tinnefeld|||0|Alexa Lauenburger;Allegra Tinnefeld;Baba Yega;Noel Lehar;Jason Brügger;Stefanie Millinger;Los Manolos Bonn;Lucas Fischer;Seicento;Barbara, Irene & Jannis|Dieter Bohlen;Nazan Eckes;Bruce Darnell|Daniel Hartwich||Hundedressur (mit acht Hunden)
12|2018|Stevie Starr|Mo'Voce|||0|Stevie Starr;Mo'Voce;Lorenzo Sposato;Step Out;Fair Play Crew;Luciano Velardi, Holger Stemmer & Rosario Ribaudo;Gennady Papizh;Olena UUTAi;Hannes Schwarz;Kevin Elsnig|Dieter Bohlen;Sylvie Meis;Bruce Darnell|Daniel Hartwich||Regurgitations-Illusionist
13|2019|Christian Stoinev & Percy|Georgia Balke|||0|Christian Stoinev & Percy;Georgia Balke;Jürgen Kern;Dima Shine;Ameli Bilyk;Nina Richel;De Facto Quartet;The Space Cowboy;Mirko Casella;Angela Kim & Stuart McKenzie|Dieter Bohlen;Sarah Lombardi;Bruce Darnell|Daniel Hartwich||Handstand-Akrobatik mit Hundedressur (Chihuahua)
14|2020|Nick Ferretti|Messoudi Brothers|||0|Nick Ferretti;Messoudi Brothers;Vanessa Calcagno;Elastic & Francesca;Guy First;Paul Morocco & Olé;Rony & Jesse;Magus Utopia;Rafael-Evitan Grombelka;Immortals|Dieter Bohlen;Bruce Darnell;Chris Tall;Evelyn Burdecki|Daniel Hartwich;Victoria Swarovski||Sänger
15|2021|Elena Turcan|Vitória Bueno|||0|Elena Turcan;Vitória Bueno;Drew Colby;Inclusion Dance Show;Chris Cross;Helena Berlinghof;Keiichi Iwasaki;Light Balance Kids;Karabo Morake;Na' Mouléma|Michael Michalsky;Lukas Podolski;Chantal Janzen;Ehrlich Brothers|Chris Tall;Lola Weippert||Opernsängerin (Sopran), 10 Jahre
16|2024|Alexander Doghmani|Black Widow|||0|Alexander Doghmani;Black Widow;Ramadhani Brothers;The Blackouts;Maximilian von Lütgendorff;Bomba Trio;Mystery;Denys Zhygaltsov;Daniele Tommasi & Naimana Casanova;Dalton Sessumes|Dieter Bohlen;Bruce Darnell;Ekaterina Leonova;Anna Ermakova|Victoria Swarovski;Jens „Knossi“ Knossalla||Opernsänger (Tenor/Countertenor)
17|2025|Jayden Swingewood|Fab Fox (Fabian Blochberger)|||0|Jayden Swingewood;Fab Fox;Ashlee Rose Montague;Viggo Venn;Lucky Kids;Maximilian Bijak;Avio Focolari;Solange Kardinaly;Anja Luna;Alexander Leshchenko|Dieter Bohlen;Bruce Darnell;Ekaterina Leonova;Tony Bauer|Victoria Swarovski;Jens „Knossi“ Knossalla||Popsänger`,
  bgt: `1|2007|Paul Potts||||0|||||Opernsänger
2|2008|George Sampson|Signature|||0|||||Streetdancer
3|2009|Diversity|Susan Boyle|||0|||||Tanzgruppe
4|2010|Spelbound|Twist and Pulse|||0|||||Turngruppe (Akrobatik)
5|2011|Jai McDowall|Ronan Parke|||0|||||Sänger
6|2012|Ashleigh and Pudsey|Jonathan and Charlotte|||0|||||Hundenummer (Trainerin & Hund)
7|2013|Attraction|Jack Carroll|||0|||||Schattentheater-Gruppe aus Ungarn
8|2014|Collabro|Lucy Kay|||0|||||Boyband
9|2015|Jules O'Dwyer & Matisse|Jamie Raven|||0|||||Hundenummer
10|2016|Richard Jones|Wayne Woodward|||0|||||Zauberer
11|2017|Tokio Myers|Issy Simpson|||0|||||Pianist
12|2018|Lost Voice Guy (Lee Ridley)|Robert White|||0|||||Stand-up-Comedian
13|2019|Colin Thackery|Marc Spelmann („X“)|||0|||||Sänger
14|2020|Jon Courtenay|Sign Along with Us|||0|||||Comedy-Pianist
15|2022|Axel Blake|Jamie Leahey|||0|||||Comedian
16|2023|Viggo Venn|Lillianna Clifton|||0|||||Comedian (Norwegen)
17|2024|Sydnie Christmas|Jack Rhodes|||0|||||Sängerin
18|2025|Harry Moulding|The Blackouts|||0|||||Zauberer
19|2026|The Hawkstone Farmers Choir|Celestial|||0|||||Chor`,
  agt: `1|2006|Bianca Ryan||||0|||||Sängerin
2|2007|Terry Fator|Cas Haley|||0|||||Bauchredner und Gesangs-Imitator
3|2008|Neal E. Boyd|Eli Mattson|||0|||||Opernsänger
4|2009|Kevin Skinner|Bárbara Padilla|||0|||||Country-Sänger
5|2010|Michael Grimm|Jackie Evancho|||0|||||Sänger/Musiker
6|2011|Landau Eugene Murphy Jr.|Silhouettes|||0|||||Sänger
7|2012|Olate Dogs|Tom Cotter|||0|||||Hundenummer
8|2013|Kenichi Ebina|Taylor Williamson|||0|||||Kampfkunst-Tänzer/Pantomime (erster ausländischer Sieger)
9|2014|Mat Franco|Emily West|||0|||||Zauberer
10|2015|Paul Zerdin|Drew Lynch|||0|||||Bauchredner
11|2016|Grace VanderWaal|The Clairvoyants|||0|||||Singer-Songwriterin
12|2017|Darci Lynne|Angelica Hale|||0|||||Singende Bauchrednerin
13|2018|Shin Lim|Zurcaroh|||0|||||Zauberer
14|2019|Kodi Lee|Detroit Youth Choir|||0|||||Sänger und Pianist
15|2020|Brandon Leake|Broken Roots|||0|||||Spoken-Word-Poet
16|2021|Dustin Tavella|Aidan Bryant|||0|||||Zauberer
17|2022|Mayyas|Kristy Sellars|||0|||||Tanzgruppe
18|2023|Adrian Stoica and Hurricane|Anna DeGuzman|||0|||||Hundenummer
19|2024|Richard Goodall|Roni Sagi & Rhythm|||0|||||Sänger
20|2025|Jessica Sanchez|Chris Turner|||0|||||Sängerin
21|2026|Nene Royal|Geno Ploeger|||0|||||Sängerin und Gitarristin`,
  gtd: `1|2013|Daniel Schmuck & Veronika Obholz|Dennis Mac Dao|||0||Palina Rojinski;Howard Donald;Nikeata Thompson|Johanna Klum||Latein-Tanzpaar (13 Jahre)
2|2014|Majid Kessab||||0||Palina Rojinski;Howard Donald;Nikeata Thompson|Johanna Klum||Hip-Hop-Tänzer
3|2015|Duo Piti||||0||Palina Rojinski;Anton Zetterholm;Marvin A. Smith|Alexandra Maurer||Tanzduo aus Hannover`,
  tvog: `1|2012|Ivy Quainoo|Kim Sanders|Do You Like What You See|Ivy Quainoo|0|Nena;Xavier Naidoo;Rea Garvey;The BossHoss||Stefan Gödde;Doris Golpashin|The BossHoss
2|2012|Nick Howard|Isabell Schmidt|Unbreakable|Nick Howard|1|Nena;Xavier Naidoo;Rea Garvey;The BossHoss||Thore Schölermann;Doris Golpashin|Rea Garvey
3|2013|Andreas Kümmert|Chris Schummert|Simple Man|Andreas Kümmert|1|Nena;The BossHoss;Max Herre;Samu Haber||Thore Schölermann;Doris Golpashin|Max Herre
4|2014|Charley Ann Schmutzler|Lina Arndt|Blue Heart|Charley Ann Schmutzler|1|Rea Garvey;Michi Beck & Smudo;Stefanie Kloß;Samu Haber||Thore Schölermann;Doris Golpashin|Michi Beck & Smudo
5|2015|Jamie-Lee Kriewitz|Ayke Witt|Ghost|Jamie-Lee Kriewitz|0|Rea Garvey;Stefanie Kloß;Michi Beck & Smudo;Andreas Bourani||Thore Schölermann;Lena Gercke|Michi Beck & Smudo
6|2016|Tay Schmedtmann|Robin Resch|Lauf, Baby, Lauf|Tay Schmedtmann|0|Samu Haber;Yvonne Catterfeld;Michi Beck & Smudo;Andreas Bourani||Thore Schölermann;Lena Gercke|Andreas Bourani
7|2017|Natia Todua|Benedikt Köstler|||0|Mark Forster;Michi Beck & Smudo;Yvonne Catterfeld;Samu Haber||Thore Schölermann;Lena Gercke|Samu Haber
8|2018|Samuel Rösch|Ben Dolic|||0|Michael Patrick Kelly;Mark Forster;Yvonne Catterfeld;Michi Beck & Smudo||Thore Schölermann;Lena Gercke|Michael Patrick Kelly
9|2019|Claudia Emmanuela Santoso|Erwin Kintop|Goodbye|Claudia Emmanuela Santoso|1|Mark Forster;Alice Merton;Sido;Rea Garvey||Thore Schölermann;Lena Gercke|Alice Merton
10|2020|Paula Dalla Corte|Oliver Henrich|Someone Better|Paula Dalla Corte|1|Stefanie Kloß & Yvonne Catterfeld;Nico Santos;Samu Haber & Rea Garvey;Mark Forster||Thore Schölermann;Lena Gercke|Samu Haber & Rea Garvey
11|2021|Sebastian Krenz|Gugu Zulu|What They Call Life|Sebastian Krenz|1|Mark Forster;Nico Santos;Sarah Connor;Johannes Oerding||Thore Schölermann;Lena Gercke|Johannes Oerding
12|2022|Anny Ogrezeanu|Julian Pförtner|||0|Mark Forster;Rea Garvey;Stefanie Kloß;Peter Maffay||Thore Schölermann;Melissa Khalaj|Mark Forster
13|2023|Malou Lovis Kreyelkamp|Desirey Sarpong Agyemang|Glacier Rivers|Malou Lovis Kreyelkamp|0|Giovanni Zarrella;Shirin David;Ronan Keating;Bill & Tom Kaulitz||Thore Schölermann;Melissa Khalaj|Bill & Tom Kaulitz
14|2024|Jennifer Lynn|Jenny Hohlbauch|Light the Sky|Jennifer Lynn|1|Mark Forster;Yvonne Catterfeld;Samu Haber;Kamrad||Thore Schölermann;Melissa Khalaj|Samu Haber
15|2025|Anne Mosters|Max Pesé|Gravity|Anne Mosters|1|Rea Garvey;Nico Santos;Shirin David;Michi Beck & Smudo||Thore Schölermann;Melissa Khalaj|Nico Santos`,
  tvk: `1|2013|Michèle Bircher||||0||||Henning Wehland
2|2014|Danyiom Mesmer||||0||||Henning Wehland
3|2015|Noah-Levi Korth||||0||||Lena Meyer-Landrut
4|2016|Lukas Janisch||||0||||Mark Forster
5|2017|Sofie Thomas||||0||||Nena & Larissa Kerner
6|2018|Anisa Celik||||0||||Mark Forster
7|2019|Mimi & Josefin||||0||||The BossHoss
8|2020|Lisa-Marie Ramm||||0||||Sasha
9|2021|Egon Werler||||0||||Stefanie Kloß
10|2022|Georgia Balke||||0||||Michi Beck & Smudo
11|2023|Emma Filipović||||0||||Michi Beck & Smudo
12|2024|Jakob Hebgen||||0||||Wincent Weiss
13|2025|Neo Klingl||||0||||Wincent Weiss
14|2026|Katelyn Harrington||||0||||Michael Patrick Kelly`,
  vus: `1|2011|Javier Colon|Dia Frampton|||0||||Adam Levine
2|2012|Jermaine Paul|Juliet Simms|||0||||Blake Shelton
3|2012|Cassadee Pope|Terry McDermott|||0||||Blake Shelton
4|2013|Danielle Bradbery|Michelle Chamuel|||0||||Blake Shelton
5|2013|Tessanne Chin|Jacquie Lee|||0||||Adam Levine
6|2014|Josh Kaufman|Jake Worthington|||0||||Usher
7|2014|Craig Wayne Boyd|Matt McAndrew|||0||||Blake Shelton
8|2015|Sawyer Fredericks|Meghan Linsey|||0||||Pharrell Williams
9|2015|Jordan Smith|Emily Ann Roberts|||0||||Adam Levine
10|2016|Alisan Porter|Adam Wakefield|||0||||Christina Aguilera
11|2016|Sundance Head|Billy Gilman|||0||||Blake Shelton
12|2017|Chris Blue|Lauren Duski|||0||||Alicia Keys
13|2017|Chloe Kohanski|Addison Agen|||0||||Blake Shelton
14|2018|Brynn Cartelli|Britton Buchanan|||0||||Kelly Clarkson
15|2018|Chevel Shepherd|Chris Kroeze|||0||||Kelly Clarkson
16|2019|Maelyn Jarmon|Gyth Rigdon|||0||||John Legend
17|2019|Jake Hoot|Ricky Duran|||0||||Kelly Clarkson
18|2020|Todd Tilghman|Toneisha Harris|||0||||Blake Shelton
19|2020|Carter Rubin|Jim Ranger|||0||||Gwen Stefani
20|2021|Cam Anthony|Kenzie Wheeler|||0||||Blake Shelton
21|2021|Girl Named Tom|Wendy Moten|||0||||Kelly Clarkson
22|2022|Bryce Leatherwood|Bodie|||0||||Blake Shelton
23|2023|Gina Miles|Grace West|||0||||Niall Horan
24|2023|Huntley|Ruby Leigh|||0||||Niall Horan
25|2024|Asher HaVon|Josh Sanders|||0||||Reba McEntire
26|2024|Sofronio Vasquez|Shye|||0||||Michael Bublé
27|2025|Adam David|Jaelen Johnston|||0||||Michael Bublé
28|2025|Aiden Ross|Ralph Edwards|||0||||Niall Horan
29|2026|Alexia Jayy|Liv Ciara|||0||||Adam Levine`,
  pop: `1|2000|No Angels||Daylight in Your Eyes|No Angels|1|Nadja Benaissa;Lucy Diakovska;Sandy Mölling;Vanessa Petruo;Jessica Wahls|Simone Angel;Mario M. Mendryzcki;Rainer Moslener
2|2001|Bro’Sis||I Believe|Bro’Sis|1|Ross Antony;Hila Bronstein;Giovanni Zarrella;Shaham Joyce;Faiz Mangat;Indira Weis|Detlef D! Soost;Alex Christensen;Noah Sow
3|2003|Overground||Schick mir ’nen Engel|Overground|1|Ahmet „Akay“ Kayed;Ken Miyao;Marq Porciuncula;Meiko Reißmann|Detlef D! Soost;Uwe Fahrenkrog-Petersen;Sabrina Setlur|Arabella Kiesbauer
4|2004|Nu Pagadi||||0|Markus Grimm;Patrick Boinet;Kristina Dörfer;Doreen Steinert|Uwe Fahrenkrog-Petersen;Lukas Hilbert;Sandy Mölling|Oliver Pocher;Barbara Schöneberger
5|2006|Monrose||Shame|Monrose|1|Senna Guemmour;Bahar Kızıl;Mandy Capristo|Detlef D! Soost;Nina Hagen;Dieter Falk|Oliver Petszokat
6|2007|Room2012||Haunted|Room2012|0|Julian;Sascha;Cristobal;Tialda|Detlef D! Soost;Nina Hagen;Dieter Falk;Jane Comerford;Marusha|Oliver Petszokat
7|2008|Queensberry||No Smoke|Queensberry|1|Leonore „Leo“ Bartsch;Victoria Ulbrich;Gabriella De Almeida Rinne;Antonella Trapani|Detlef D! Soost;Loona;Sido|Oliver Petszokat;Charlotte Engelhardt
8|2009|Some & Any||Last Man Standing|Some & Any|0|Vanessa Meisinger;Leonardo Ritzmann|Detlef D! Soost;Michelle Leonard;Alex Christensen|Giovanni Zarrella;Charlotte Engelhardt
9|2010|LaVive||No Time for Sleeping|LaVive|0|Sarah Rensing;Meike Ehnert;Julia Köster;Katrin Mehlberg|Detlef D! Soost;Marta Jandová;Thomas M. Stein|Charlotte Engelhardt
10|2012|Melouria||How Do You Do! 2012|Melouria|0|Alessio Intemperante;Stephanie Graf;Alexander Babacan;Cem Özdemir|Detlef D! Soost;Lucy Diakovska;Ross Antony;Senna Guemmour|Nela Panghy-Lee
11|2015|Leandah||Tage wie Juwelen|Leandah|0|Patricia „Pati“ Ekkert;Alena Fischer;Selina Frimpong-Ansah;Sabrina Kolip|Stefanie Heinzmann;Miss Platnum;Bella Garcia|Collien Ulmen-Fernandes`,
  xf: `1|2010|Edita Abdieski|Big Soul|I’ve Come to Life|Edita Abdieski|0||Sarah Connor;Till Brönner;George Glueck|Jochen Schropp|Till Brönner
2|2011|David Pfeffer|Raffaela Wais|I’m Here|David Pfeffer|0||Sarah Connor;Till Brönner;Das Bo|Jochen Schropp|Till Brönner
3|2012|Mrs. Greenbird|Melissa Heiduk|Shooting Stars & Fairy Tales|Mrs. Greenbird|0||Sarah Connor;H. P. Baxxter;Sandra Nasić;Moses Pelham|Jochen Schropp|Sandra Nasić
4|2018|EES & The Yes-Ja! Band|Wait of the World|Try Try Try|EES|0||Sido;Ignacio Uriarte;Thomas Anders;Jennifer Weist|Charlotte Würdig;Bence Istenes|Jennifer Weist`,
  ss: `1|2003|Daniel Siegert|Senta-Sofia Delliponti|||0|||||Music Act bis 15 Jahre
2|2003|Maureen Sauter|Daniela Domröse|||0|||||Model
3|2003|Ingo Oschmann|John Doyle|||0|||||Comedian
4|2003|Martin Kesici|Thomas Wohlfahrt|||0|||||Music Act ab 16 Jahre
5|2004|Maresa Maisenbacher|Johannes Braun|||0|||||Music Act bis 15 Jahre
6|2004|Oliver Tienken|Matthias Hopp|||0|||||Model
7|2004|Oliver Beerhenke|Thomas Müller|||0|||||Comedian
8|2004|Florence Joy Büttner|Stefanie Nerpel|||0|||||Music Act ab 16 Jahre`,
  gntm: `1|2006|Lena Gercke||||0
2|2007|Barbara Meier||||0
3|2008|Jennifer Hof||||0
4|2009|Sara Nuru||||0
5|2010|Alisar Ailabouni||||0
6|2011|Jana Beller||||0
7|2012|Luisa Hartema||||0
8|2013|Lovelyn Enebechi||||0
9|2014|Stefanie Giesinger||||0
10|2015|Vanessa Fuchs||||0
11|2016|Kim Hnizdo||||0
12|2017|Céline Bethmann||||0
13|2018|Toni Dreher-Adenuga||||0
14|2019|Simone Kowalski||||0
15|2020|Jacqueline „Jacky“ Wruck||||0
16|2021|Alex Mariah Peter||||0
17|2022|Lou-Anne Gleissenebner||||0
18|2023|Vivien Blotzki||||0
19|2024|Lea Oude Engberink & Jermaine Kokoú Kothé||||0
20|2025|Daniela „Dani“ Djokic & Moritz Rüdiger||||0
21|2026|Aurélie Carina Siewitz & Ibrahim „Ibo“ Ouro-Bodi||||0`,
  pi: `1|2002|Will Young|Gareth Gates|Anything Is Possible / Evergreen|Will Young|1
2|2003|Michelle McManus|Mark Rhodes|All This Time|Michelle McManus|0`,
  ai: `1|2002|Kelly Clarkson|Justin Guarini|A Moment Like This|Kelly Clarkson|1
2|2003|Ruben Studdard|Clay Aiken|Flying Without Wings|Ruben Studdard|0
3|2004|Fantasia Barrino|Diana DeGarmo|I Believe|Fantasia Barrino|0
4|2005|Carrie Underwood|Bo Bice|Inside Your Heaven|Carrie Underwood|1
5|2006|Taylor Hicks|Katharine McPhee|Do I Make You Proud|Taylor Hicks|0
6|2007|Jordin Sparks|Blake Lewis|This Is My Now|Jordin Sparks|1
7|2008|David Cook|David Archuleta|The Time of My Life|David Cook|1
8|2009|Kris Allen|Adam Lambert|No Boundaries|Kris Allen|1
9|2010|Lee DeWyze|Crystal Bowersox|Beautiful Day|Lee DeWyze|0
10|2011|Scotty McCreery|Lauren Alaina|I Love You This Big|Scotty McCreery|0
11|2012|Phillip Phillips|Jessica Sanchez|Home|Phillip Phillips|1
12|2013|Candice Glover|Kree Harrison|I Am Beautiful|Candice Glover|0
13|2014|Caleb Johnson|Jena Irene|As Long as You Love Me|Caleb Johnson|0
14|2015|Nick Fradiani|Clark Beckham|Beautiful Life|Nick Fradiani|0
15|2016|Trent Harmon|La'Porsha Renae|Falling|Trent Harmon|0
16|2018|Maddie Poppe|Caleb Lee Hutchinson|Going, Going, Gone|Maddie Poppe|0
17|2019|Laine Hardy|Alejandro Aranda|Flame|Laine Hardy|0
18|2020|Just Sam|Arthur Gunn|Rise Up|Just Sam|0
19|2021|Chayce Beckham|Willie Spence|23|Chayce Beckham|0
20|2022|Noah Thompson|HunterGirl|One Day Tonight|Noah Thompson|0
21|2023|Iam Tongi|Megan Danielle|||0
22|2024|Abi Carter|Will Moseley|This Isn't Over|Abi Carter|0
23|2025|Jamal Roberts|John Foster|Heal|Jamal Roberts|0
24|2026|Hannah Harper|Jordan McCullough|||0`,
  xfuk: `1|2004|Steve Brookstein|G4|Against All Odds|Steve Brookstein|0||||Simon Cowell
2|2005|Shayne Ward|Andy Abraham|That's My Goal|Shayne Ward|1||||Louis Walsh
3|2006|Leona Lewis|Ray Quinn|A Moment Like This|Leona Lewis|1||||Simon Cowell
4|2007|Leon Jackson|Rhydian Roberts|When You Believe|Leon Jackson|0||||Dannii Minogue
5|2008|Alexandra Burke|JLS|Hallelujah|Alexandra Burke|1||||Cheryl Cole
6|2009|Joe McElderry|Olly Murs|The Climb|Joe McElderry|1
7|2010|Matt Cardle|Rebecca Ferguson|When We Collide|Matt Cardle|1||||Dannii Minogue
8|2011|Little Mix|Marcus Collins|Cannonball|Little Mix|1||||Tulisa
9|2012|James Arthur|Jahméne Douglas|Impossible|James Arthur|1||||Nicole Scherzinger
10|2013|Sam Bailey|Nicholas McDonald|Skyscraper|Sam Bailey|0||||Sharon Osbourne
11|2014|Ben Haenow|Fleur East|Something I Need|Ben Haenow|0||||Simon Cowell
12|2015|Louisa Johnson|Reggie 'n' Bollie|Forever Young|Louisa Johnson|0||||Rita Ora
13|2016|Matt Terry|Saara Aalto|When Christmas Comes Around|Matt Terry|0||||Nicole Scherzinger
14|2017|Rak-Su|Grace Davies|Dimelo|Rak-Su feat. Wyclef Jean & Naughty Boy|0||||Simon Cowell
15|2018|Dalton Harris|Scarlett Lee|The Power of Love|Dalton Harris feat. James Arthur|0||||Louis Tomlinson`
};

const list = value => value ? value.split(';') : [];
export const SEASONS = Object.entries(TABLES).flatMap(([show, block]) => block.trim().split('\n').map(line => {
  const [n, year, winner, runnerUp = '', title = '', artist = '', deezer = '', members = '', jury = '', hosts = '', coach = '', act = ''] = line.split('|');
  return { id: `${show}:${n}`, show, n: Number(n), year: Number(year), winner, runnerUp, song: title ? { title, artist, deezer: deezer === '1' } : null, list: list(members), jury: list(jury), hosts: list(hosts), coach, act };
}));
export const seasonsOf = show => SEASONS.filter(season => season.show === show);
