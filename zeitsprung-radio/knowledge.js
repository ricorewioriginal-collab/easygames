// Redaktionell geschriebene, zeitstabile Musikfragen. Format: Frage | richtig | 3 Ablenker.
// 300 Interpretenfragen und 300 Songtitelfragen werden aus tracks.js erzeugt.
const sets = {
  'Charts & Rekorde': `Welches Album von Michael Jackson gilt als eines der meistverkauften Alben aller Zeiten?|Thriller|Bad|Dangerous|Off the Wall
Welcher Song von PSY erreichte als erstes YouTube-Video eine Milliarde Aufrufe?|Gangnam Style|Gentleman|Daddy|That That
Welche Band veröffentlichte das Album „Abbey Road“?|The Beatles|The Rolling Stones|Queen|Pink Floyd
Welche Sängerin ging mit der „Eras Tour“ auf Welttournee?|Taylor Swift|Adele|Rihanna|Beyoncé
Welcher Titel von Queen enthält einen Opernteil?|Bohemian Rhapsody|Radio Ga Ga|We Will Rock You|Another One Bites the Dust
Welcher Song von Daft Punk und Pharrell Williams wurde 2013 ein Welthit?|Get Lucky|One More Time|Around the World|Harder, Better, Faster, Stronger
Welcher Titel wurde als „Macarena“ zum Tanzhit?|Macarena|Mambo No. 5|The Ketchup Song|Cotton Eye Joe
Welche Künstlerin sang „Rolling in the Deep“?|Adele|Sia|Pink|Duffy
Welcher Song von Mark Ronson und Bruno Mars war ein Funk-Hit?|Uptown Funk|Happy|Treasure|24K Magic
Welcher Welthit von Luis Fonsi enthält Daddy Yankee?|Despacito|Bailando|Gasolina|Danza Kuduro
Welcher Hit von a-ha ist für sein animiertes Musikvideo bekannt?|Take On Me|The Sun Always Shines on T.V.|Hunting High and Low|Stay on These Roads
Welcher Song von Rick Astley wurde zum Internetphänomen „Rickrolling“?|Never Gonna Give You Up|Together Forever|Cry for Help|She Wants to Dance with Me
Welcher Hit von The Weeknd hat das Wort „Lights“ im Titel?|Blinding Lights|Starboy|Save Your Tears|The Hills
Welche Band veröffentlichte das Album „The Dark Side of the Moon“?|Pink Floyd|Genesis|Queen|The Who
Welches Album von Nirvana enthält „Smells Like Teen Spirit“?|Nevermind|In Utero|Bleach|MTV Unplugged in New York
Welcher Song von Gloria Gaynor wurde zur Disco-Hymne?|I Will Survive|Hot Stuff|Le Freak|September
Welcher Titel von ABBA gewann den ESC und wurde international bekannt?|Waterloo|Dancing Queen|Mamma Mia|Fernando
Welcher Song von Billie Eilish trägt einen absichtlich kleingeschriebenen Titel?|bad guy|Hello|Royals|Chandelier
Welcher Künstler veröffentlichte das Album „Purple Rain“?|Prince|Stevie Wonder|Michael Jackson|Lionel Richie
Welche britische Band veröffentlichte „Viva la Vida“?|Coldplay|Muse|Radiohead|Oasis`,
  'Jahrescharts & Hits': `Welcher Song mit Pferdetanz wurde 2012 weltweit viral?|Gangnam Style|Despacito|Happy|Old Town Road
Welcher Titel von Gotye und Kimbra lief 2012 weltweit im Radio?|Somebody That I Used to Know|Some Nights|We Are Young|Call Me Maybe
Welcher Daft-Punk-Song prägte den Sommer 2013?|Get Lucky|One More Time|Digital Love|Robot Rock
Welcher Pharrell-Williams-Song prägte die Charts 2013 und 2014?|Happy|Freedom|Come Get It Bae|Frontin'
Welcher Song von Avicii wurde 2013 ein großer Crossover-Hit?|Wake Me Up|Levels|The Nights|Hey Brother
Welchen Titel veröffentlichte Adele 2015 als Comeback-Single?|Hello|Someone Like You|Skyfall|Send My Love
Welcher Ed-Sheeran-Titel dominierte Anfang 2017 die Charts?|Shape of You|Thinking Out Loud|Perfect|Bad Habits
Welcher lateinamerikanische Hit war 2017 weltweit präsent?|Despacito|Macarena|La Bamba|Bailando
Welcher Song von Lil Nas X und Billy Ray Cyrus wurde 2019 zum Crossover-Hit?|Old Town Road|Industry Baby|Montero|Sunflower
Welcher Weeknd-Hit wurde 2020 besonders häufig gespielt?|Blinding Lights|The Hills|Starboy|Earned It
Welcher Lady-Gaga-Song wurde 2009 ein großer Chart-Hit?|Bad Romance|Poker Face|Just Dance|Born This Way
Welcher Rihanna-Song mit Calvin Harris erschien 2011?|We Found Love|Umbrella|Diamonds|Only Girl
Welcher Titel von Carly Rae Jepsen prägte 2012 viele Charts?|Call Me Maybe|Run Away with Me|I Really Like You|This Kiss
Welcher Song aus „Frozen“ wurde 2013 veröffentlicht?|Let It Go|Into the Unknown|How Far I'll Go|Remember Me
Welcher Song von Clean Bandit und Jess Glynne wurde 2014 bekannt?|Rather Be|Rockabye|Symphony|Solo
Welcher Titel von Sia war 2014 ein Hit?|Chandelier|Cheap Thrills|Elastic Heart|Unstoppable
Welcher Titel von Dua Lipa erschien 2019?|Don't Start Now|New Rules|Levitating|One Kiss
Welcher Hit von Kesha erschien 2009?|Tik Tok|We R Who We R|Die Young|Timber
Welcher Song von Owl City war 2009 ein Überraschungshit?|Fireflies|Good Time|Vanilla Twilight|When Can I See You Again?
Welcher Beyoncé-Song erschien 2008?|Single Ladies|Halo|Crazy in Love|Formation`,
  'Eurovision Song Contest': `Wie heißt die internationale Musikshow der EBU?|Eurovision Song Contest|The Voice|Popstars|X Factor
Welches Land gewann 2010 mit Lenas „Satellite“?|Deutschland|Norwegen|Schweden|Österreich
Wer sang 1982 für Deutschland „Ein bißchen Frieden“?|Nicole|Lena|Katja Ebstein|Michelle
Welches Land gewann 1974 mit ABBA?|Schweden|Norwegen|Finnland|Dänemark
Welcher ABBA-Song gewann den ESC 1974?|Waterloo|Dancing Queen|Mamma Mia|S.O.S.
Mit welchem Titel gewann Lena 2010?|Satellite|Taken by a Stranger|Stardust|Neon
Welches Land gewann 2014 mit Conchita Wurst?|Österreich|Deutschland|Schweiz|Schweden
Wie hieß Conchita Wursts Siegertitel?|Rise Like a Phoenix|Euphoria|Heroes|Arcade
Welches Land gewann 2012 mit Loreen?|Schweden|Finnland|Norwegen|Island
Welcher Loreen-Song gewann 2012?|Euphoria|Tattoo|Statements|Is It Love
Wer gewann den ESC 2023 mit „Tattoo“?|Loreen|Käärijä|Måneskin|Nemo
Welches Land gewann 2023?|Schweden|Finnland|Italien|Ukraine
Welches Land gewann 2021 mit Måneskin?|Italien|Frankreich|Schweiz|Malta
Wie hieß Måneskins Siegertitel 2021?|Zitti e buoni|Beggin'|I Wanna Be Your Slave|Torna a casa
Welches Land gewann 2022 mit Kalush Orchestra?|Ukraine|Vereinigtes Königreich|Spanien|Italien
Wie hieß der ukrainische Siegertitel 2022?|Stefania|Space Man|SloMo|Brividi
Wer gewann 2019 mit „Arcade“?|Duncan Laurence|Loreen|Salvador Sobral|Netta
Welches Land gewann 2019?|Niederlande|Schweden|Italien|Belgien
Welches Land gewann 2018 mit Netta?|Israel|Zypern|Österreich|Portugal
Wie hieß Nettas Siegertitel 2018?|Toy|Fuego|Mercy|Nobody But You
Wer gewann 2024 mit „The Code“?|Nemo|Baby Lasagna|Slimane|Luna
Welches Land gewann 2024?|Schweiz|Kroatien|Frankreich|Italien
Was zeigt beim ESC die Wertung „12 points“ an?|Die höchste Einzelwertung eines Landes|Zwölf Auftritte in einem Halbfinale|Die Länge eines Songs|Zwölf Jurymitglieder
Was bedeutet beim ESC „Grand Final“?|Das große Finale|Die erste Probe|Die nationale Vorauswahl|Die Pressekonferenz
Welches Land gewann 2016 mit Jamala?|Ukraine|Russland|Australien|Schweden`,
  'DSDS & Castingshows': `Wofür steht die Abkürzung DSDS?|Deutschland sucht den Superstar|Deutschland singt die Stars|Die Show der Superstars|Deutsche Sänger des Sommers
Bei welchem Sender startete DSDS?|RTL|ProSieben|Sat.1|ZDF
Wer gewann die erste DSDS-Staffel 2003?|Alexander Klaws|Pietro Lombardi|Mark Medlock|Daniel Küblböck
Wer gewann DSDS 2011?|Pietro Lombardi|Alexander Klaws|Beatrice Egli|Luca Hänni
Wer gewann DSDS 2013?|Beatrice Egli|Pietro Lombardi|Luca Hänni|Sarah Engels
Wer sang als erster DSDS-Sieger „Take Me Tonight“?|Alexander Klaws|Mark Medlock|Pietro Lombardi|Daniel Schuhmacher
Wer wurde durch DSDS 2011 bekannt und sang später „Call My Name“?|Pietro Lombardi|Mark Medlock|Alexander Klaws|Luca Hänni
Welche Schweizer Sängerin gewann DSDS 2013?|Beatrice Egli|Luca Hänni|Sarah Engels|Anna-Maria Zimmermann
Welche Band entstand aus der ersten deutschen „Popstars“-Staffel?|No Angels|Monrose|Bro'Sis|Queensberry
Welche Girlgroup entstand 2006 bei „Popstars“?|Monrose|No Angels|Queensberry|LaVive
Welche Band entstand 2001 bei „Popstars“?|Bro'Sis|No Angels|Monrose|Nu Pagadi
Welche Castingshow nutzt „Blind Auditions“?|The Voice of Germany|DSDS|Popstars|X Factor
Was können Coaches bei einer Blind Audition zunächst nicht sehen?|Die auftretende Person|Das Studiopublikum|Die Band|Die Liedtexte
Wie wählen Coaches bei „The Voice“ in der Blind Audition ein Talent?|Sie drücken einen Buzzer und drehen den Stuhl|Sie werfen eine Münze|Sie schreiben einen Brief|Sie wählen per App
Wie heißen die Duelle zweier Talente in einem Team bei „The Voice“?|Battles|Recall|Mottoshows|Duette der Jury
Wer gewann die erste deutsche „The Voice“-Staffel?|Ivy Quainoo|Andreas Kümmert|Jamie-Lee Kriewitz|Samuel Rösch
Bei welcher Show gibt es den „Recall“ als bekannte Runde?|DSDS|The Voice of Germany|ESC|Bundesvision Song Contest
Welche Sendung stellt die Stimme schon im Titel in den Mittelpunkt?|The Voice of Germany|Popstars|DSDS|Das Supertalent
Welche Castingshow war für die Entstehung von „No Angels“ bekannt?|Popstars|DSDS|The Voice of Germany|X Factor
Welche DSDS-Gewinnerin sang später auch Schlager?|Beatrice Egli|Ivy Quainoo|Lena Meyer-Landrut|Vanessa Mai
Welcher DSDS-Sieger war später auch Juror der Sendung?|Pietro Lombardi|Alexander Klaws|Daniel Schuhmacher|Thomas Godoj
Wie heißt die Kinder-Ausgabe von „The Voice“?|The Voice Kids|The Voice Junior Stars|Popstars Kids|DSDS Kids
Welche Rolle haben die Sänger auf den drehbaren Stühlen bei „The Voice“?|Coaches|Kandidaten|Moderatoren|Zuschauer
Welche Show suchte 2000 in Deutschland eine neue Girlgroup?|Popstars|DSDS|The Voice of Germany|Star Search
Welches Duo moderierte lange „The Voice of Germany“ gemeinsam?|Thore Schölermann und Lena Gercke|Günther Jauch und Thomas Gottschalk|Dieter Bohlen und Bruce Darnell|Stefan Raab und Elton`,
  'Bands & Musikgeschichte': `Welche vier Musiker waren die klassischen Beatles?|John, Paul, George und Ringo|Freddie, Brian, Roger und John|Bono, The Edge, Adam und Larry|Mick, Keith, Charlie und Ronnie
Wer war Leadsänger der Band Queen?|Freddie Mercury|David Bowie|Elton John|George Michael
Welches Instrument spielte Ringo Starr bei den Beatles?|Schlagzeug|Bass|Keyboard|Saxofon
Wer war Sänger der Band Nirvana?|Kurt Cobain|Chris Cornell|Eddie Vedder|Dave Grohl
Welche Band veröffentlichte „Wonderwall“?|Oasis|Blur|Pulp|Radiohead
Welche Band veröffentlichte „Enjoy the Silence“?|Depeche Mode|Pet Shop Boys|New Order|Tears for Fears
Wer sang „Jolene“ zuerst?|Dolly Parton|Whitney Houston|Tina Turner|Cher
Welche Band hatte die Brüder Liam und Noel Gallagher?|Oasis|Blur|Coldplay|Muse
Welche Band veröffentlichte „Seven Nation Army“?|The White Stripes|The Strokes|The Killers|Arctic Monkeys
Welcher Musiker ist als „The Boss“ bekannt?|Bruce Springsteen|Billy Joel|Bob Dylan|Bryan Adams
Wer war Sänger und Bassist von The Police?|Sting|Bono|Phil Collins|Bryan Ferry
Welches Duo sang „Wake Me Up Before You Go-Go“?|Wham!|Erasure|Pet Shop Boys|Modern Talking
Welcher Musiker veröffentlichte „Rocket Man“?|Elton John|David Bowie|Billy Joel|Rod Stewart
Wer sang „Space Oddity“?|David Bowie|Elton John|Freddie Mercury|Peter Gabriel
Welche Band veröffentlichte „Californication“?|Red Hot Chili Peppers|Green Day|Foo Fighters|Linkin Park
Welcher Sänger war als „King of Pop“ bekannt?|Michael Jackson|Prince|Elvis Presley|Stevie Wonder
Welche Sängerin ist für „Like a Prayer“ bekannt?|Madonna|Cher|Cyndi Lauper|Whitney Houston
Welches Duo besteht aus Guy-Manuel de Homem-Christo und Thomas Bangalter?|Daft Punk|Justice|The Chemical Brothers|Air
Welche Band hatte Chester Bennington als Sänger?|Linkin Park|Green Day|Muse|Foo Fighters
Welche Gruppe veröffentlichte „Dancing Queen“?|ABBA|Boney M.|Bee Gees|The Carpenters`,
  'Musikshows & Wissen': `Was ist eine Single in der Musikbranche?|Eine einzeln vermarktete Veröffentlichung|Ein Soloauftritt ohne Publikum|Ein Album mit nur einem Künstler|Ein Song ohne Refrain
Was ist ein Refrain?|Ein wiederkehrender Liedteil|Der letzte Konzerttermin|Ein Instrument|Eine Tonart
Was bedeutet „Coverversion“?|Eine neue Interpretation eines bereits veröffentlichten Songs|Ein Song ohne Gesang|Ein Livealbum|Ein Musikvideo ohne Bild
Was ist ein Duett?|Ein Stück für zwei Singstimmen|Eine Band mit zwei Gitarren|Eine Platte mit zwei Seiten|Ein Song in zwei Sprachen
Was bezeichnet die BPM-Zahl?|Schläge pro Minute|Basspegel pro Mikrofon|Bands pro Monat|Bühnenplätze pro Musiker
Welches Instrument hat Tasten und Saiten?|Klavier|Trompete|Schlagzeug|Flöte
Welches Instrument gehört zur Familie der Blechblasinstrumente?|Trompete|Violine|Klavier|Gitarre
Was ist ein A-cappella-Auftritt?|Gesang ohne Instrumentalbegleitung|Ein Auftritt ohne Mikrofon|Ein besonders lauter Refrain|Ein Tanz ohne Musik
Was bedeutet „Live“ bei einem Konzert?|Die Darbietung findet in Echtzeit statt|Der Song ist automatisch ein Hit|Es gibt keine Bühne|Es wird nur geflüstert
Wozu dient ein Metronom?|Es gibt ein gleichmäßiges Tempo vor|Es stimmt Gitarrensaiten|Es verstärkt Gesang|Es mischt Farben im Licht
Wie heißt die hohe weibliche Stimmlage?|Sopran|Bass|Bariton|Tenor
Wie heißt die tiefe männliche Stimmlage?|Bass|Sopran|Alt|Mezzosopran
Was ist ein Musikfestival?|Eine Veranstaltung mit mehreren Musikauftritten|Ein einzelnes Musikvideo|Eine Tonleiter|Ein Studioeffekt
Was ist eine Setlist?|Die geplante Reihenfolge von Songs bei einem Auftritt|Die Sitzordnung des Publikums|Eine Liste von Tonarten|Ein Katalog von Mikrofonen
Wofür steht „DJ“?|Disc Jockey|Digital Jazz|Dance Jury|Double Jam
Was ist ein Remix?|Eine neu bearbeitete Version eines Musikstücks|Eine Aufnahme ohne Ton|Eine Coverzeichnung|Ein Konzertticket
Welche Sendung wurde von Stefan Raab als Wettbewerb zwischen deutschen Bundesländern initiiert?|Bundesvision Song Contest|Eurovision Song Contest|The Voice Kids|Popstars
Bei welcher Musikshow stimmen Länder mit Punkten über Beiträge ab?|Eurovision Song Contest|DSDS|Popstars|The Voice of Germany
Welche Sendung zeigt Coaches, die bei einer Blind Audition mit dem Rücken zur Bühne sitzen?|The Voice of Germany|DSDS|Popstars|ZDF-Fernsehgarten
Was ist ein Soundcheck?|Eine Probe zur Prüfung von Ton und Technik|Die Veröffentlichung eines Albums|Eine Preisverleihung|Der Ticketverkauf`,
  'Künstlerbiografien': `In welchem Land wurde Rihanna geboren?|Barbados|Jamaika|USA|Kanada
In welcher Stadt wurde Adele geboren?|London|Liverpool|Manchester|Birmingham
Aus welchem Land stammt Shakira?|Kolumbien|Mexiko|Spanien|Argentinien
Mit welcher Gruppe begann Beyoncé ihre Karriere?|Destiny's Child|TLC|Spice Girls|En Vogue
Mit welcher Boyband wurde Harry Styles bekannt?|One Direction|Take That|Westlife|NSYNC
Mit welcher Boyband wurde Justin Timberlake bekannt?|NSYNC|Backstreet Boys|One Direction|Boyzone
Bei welcher Band spielte Phil Collins Schlagzeug und sang später?|Genesis|The Police|Queen|U2
Bei welcher Band spielte Paul McCartney vor seiner Solokarriere?|The Beatles|The Rolling Stones|The Who|The Kinks
Auf welcher Insel wurde Freddie Mercury geboren?|Sansibar|Kreta|Sizilien|Malta
Wie lautete David Bowies Geburtsname?|David Jones|Robert Plant|Brian May|John Lennon
Welche US-Stadt ist besonders mit Prince verbunden?|Minneapolis|Seattle|Atlanta|Boston
In welchem Land wurde Bob Marley geboren?|Jamaika|Barbados|Trinidad und Tobago|Kuba
Aus welcher britischen Stadt stammte Amy Winehouse?|London|Bristol|Liverpool|Leeds
Als Frontmann welcher Band wurde Kurt Cobain bekannt?|Nirvana|Pearl Jam|Soundgarden|Foo Fighters
In welcher Familiengruppe sang Michael Jackson als Kind?|The Jackson 5|The Temptations|The Osmonds|The Supremes
In welchem US-Bundesstaat wurde Elvis Presley geboren?|Mississippi|Tennessee|Kalifornien|Texas
Mit welchem US-Bundesstaat wird Bruce Springsteen besonders verbunden?|New Jersey|Florida|Nevada|Oregon
Bei welcher Band war Sting vor seiner Solokarriere Sänger?|The Police|U2|Dire Straits|The Cure
In welchem Land wurde Sia geboren?|Australien|Neuseeland|Kanada|Irland
Aus welchem Land stammt Céline Dion?|Kanada|Frankreich|Belgien|Schweiz
Aus welchem Land stammt die Popgruppe ABBA?|Schweden|Norwegen|Dänemark|Finnland
Aus welchem Land stammt a-ha?|Norwegen|Schweden|Island|Dänemark
Aus welchem Land stammt die Band Måneskin?|Italien|Spanien|Portugal|Frankreich
In welcher deutschen Stadt wurde Kraftwerk gegründet?|Düsseldorf|Hamburg|München|Leipzig
In welcher Stadt wurde die Band Oasis gegründet?|Manchester|London|Liverpool|Bristol
Welche Sängerin wurde als Mitglied der Spice Girls als „Sporty Spice“ bekannt?|Melanie C|Emma Bunton|Geri Halliwell|Victoria Beckham
Welche Spice-Girls-Sängerin war als „Ginger Spice“ bekannt?|Geri Halliwell|Melanie C|Emma Bunton|Melanie B
Wer war Sänger der Band Linkin Park?|Chester Bennington|Kurt Cobain|Chris Martin|Billie Joe Armstrong
Welcher Künstler war vor seiner Solokarriere Mitglied von Wham!?|George Michael|Robbie Williams|Elton John|Rick Astley
In welcher Band sang Robbie Williams zuerst?|Take That|One Direction|Westlife|Boyzone
Mit welcher Band wurde Gwen Stefani bekannt?|No Doubt|The Cranberries|Garbage|Paramore
Welche Sängerin war Frontfrau der Band The Cranberries?|Dolores O'Riordan|Shirley Manson|Alanis Morissette|Dido
Wer gründete Foo Fighters nach dem Ende von Nirvana?|Dave Grohl|Kurt Cobain|Eddie Vedder|Chris Cornell
Welche Sängerin war Teil des Duos Eurythmics?|Annie Lennox|Cyndi Lauper|Dolly Parton|Tina Turner
Welche Sängerin wurde mit dem Album „Back to Black“ bekannt?|Amy Winehouse|Adele|Duffy|Lana Del Rey
Mit welcher Band trat Bono weltweit auf?|U2|Coldplay|R.E.M.|Oasis
Welche deutsche Sängerin gewann 1982 den ESC?|Nicole|Nena|Lena|Katja Ebstein
Welche Sängerin gewann 2010 den ESC für Deutschland?|Lena Meyer-Landrut|Nicole|Cascada|Sarah Connor
Welche Sängerin gewann 2013 die Castingshow DSDS?|Beatrice Egli|Ivy Quainoo|Lena Meyer-Landrut|Sarah Connor
Mit welcher Girlgroup wurde Sandy Mölling bekannt?|No Angels|Monrose|Queensberry|LaVive`,
  'Songtexte ergänzen': `„Alle meine Entchen schwimmen auf dem …“ – welches Wort fehlt?|See|Fluss|Meer|Teich
„Hänschen klein ging allein in die weite … hinein“ – was fehlt?|Welt|Stadt|Nacht|Zeit
„Backe, backe Kuchen, der … hat gerufen“ – was fehlt?|Bäcker|Koch|Vater|König
„Bruder Jakob, Bruder Jakob, schläfst du …?“ – was fehlt?|noch|schon|gut|lang
„Ein Männlein steht im Walde ganz still und …“ – was fehlt?|stumm|klein|fein|krumm
„Fuchs, du hast die Gans gestohlen, gib sie wieder …“ – was fehlt?|her|frei|fort|hin
„Grün, grün, grün sind alle meine …“ – was fehlt?|Kleider|Blätter|Wiesen|Augen
„Hänsel und Gretel verliefen sich im …“ – was fehlt?|Wald|Haus|Dorf|Tal
„Hoppe, hoppe, Reiter, wenn er fällt, dann … er“ – was fehlt?|schreit|lacht|singt|weint
„Laterne, Laterne, Sonne, Mond und …“ – was fehlt?|Sterne|Wolken|Regen|Nebel
„O Tannenbaum, o Tannenbaum, wie treu sind deine …“ – was fehlt?|Blätter|Zweige|Nadeln|Wurzeln
„Die Gedanken sind frei, wer kann sie …?“ – was fehlt?|erraten|verraten|erkennen|verstehen
„Es klappert die Mühle am rauschenden …“ – was fehlt?|Bach|Fluss|See|Meer
„Der Mond ist aufgegangen, die goldnen Sternlein …“ – was fehlt?|prangen|tanzen|strahlen|wandern
„Der Kuckuck und der Esel, die hatten einen …“ – was fehlt?|Streit|Traum|Plan|Tanz
„Freude, schöner Götterfunken, Tochter aus …“ – was fehlt?|Elysium|Olympus|Athen|Arkadia
„Stille Nacht, heilige Nacht, alles schläft, einsam …“ – was fehlt?|wacht|lacht|ruht|singt
„Sah ein Knab ein Röslein stehn, Röslein auf der …“ – was fehlt?|Heiden|Wiesen|Erden|Halde
„Am Brunnen vor dem Tore, da steht ein …“ – was fehlt?|Lindenbaum|Apfelbaum|Birnbaum|Rosenstrauch
„Bunt sind schon die Wälder, gelb die …“ – was fehlt?|Stoppelfelder|Sonnenstrahlen|Blumenfelder|Abendhimmel`
};

export const KNOWLEDGE = Object.entries(sets).flatMap(([category, block]) =>
  block.trim().split('\n').map((line, index) => {
    const [prompt, answer, ...wrong] = line.split('|');
    return { id: `k:${category}:${index}`, category, prompt, answer, options: [answer, ...wrong] };
  })
);

export const SPECIAL_CATEGORIES = Object.keys(sets);
