// FUNKHAUS – Die Live-WG: Spiel-Inhalte (Deutsch)
export const TRAITS = ['ehrgeizig','herzlich','intrigant','lustig','ruhig','chaot','ehrlich','eitel'];

export const CAST = [
  { n:'Mira', age:24, job:'Podcast-Produzentin', bio:'Will unbedingt ganz nach oben und prüft dafür jedes Spiegelbild.', traits:['ehrgeizig','eitel'], g:'f' },
  { n:'Jonas', age:31, job:'Altenpfleger', bio:'Hört zu, bleibt gelassen und umarmt auch den schlimmsten Morgenmuffel.', traits:['herzlich','ruhig'], g:'m' },
  { n:'Leyla', age:27, job:'Stand-up-Comedienne', bio:'Reißt Witze mit einem Lächeln und plant dabei schon den nächsten Coup.', traits:['intrigant','lustig'], g:'f' },
  { n:'Tobi', age:22, job:'Student der Medienkunde', bio:'Sein Zimmer ist ein Schlachtfeld, seine Laune bombig.', traits:['chaot','lustig'], g:'m' },
  { n:'Hanna', age:35, job:'Hebamme', bio:'Sagt dir die Wahrheit mit einer Tasse Tee in der Hand.', traits:['ehrlich','herzlich'], g:'f' },
  { n:'Kemal', age:29, job:'Fitnesstrainer', bio:'Steht um fünf auf, bleibt cool und will am Ende die Krone.', traits:['ehrgeizig','ruhig'], g:'m' },
  { n:'Svenja', age:26, job:'Influencerin', bio:'Für das perfekte Foto flüstert sie auch mal ein Gerücht ins Ohr.', traits:['eitel','intrigant'], g:'f' },
  { n:'Ole', age:44, job:'Fischer von der Nordsee', bio:'Spricht wenig, sagt aber immer genau, was er denkt.', traits:['ruhig','ehrlich'], g:'m' },
  { n:'Pia', age:20, job:'Azubi im Blumenladen', bio:'Bringt gute Laune mit und verteilt Herzlichkeit wie Konfetti.', traits:['lustig','herzlich'], g:'f' },
  { n:'Dario', age:33, job:'Friseur', bio:'Sein Haar sitzt immer, sein Chaos findet man trotzdem überall.', traits:['eitel','chaot'], g:'m' },
  { n:'Fenja', age:28, job:'Rechtsreferendarin', bio:'Hat große Ziele und sagt dir offen, wenn du im Weg stehst.', traits:['ehrgeizig','ehrlich'], g:'f' },
  { n:'Bruno', age:52, job:'Busfahrer im Ruhestand', bio:'Ein weiches Herz mit einem Hang zu spontanen Katastrophen.', traits:['herzlich','chaot'], g:'m' },
  { n:'Yara', age:25, job:'Start-up-Gründerin', bio:'Webt Netze im Hintergrund und kennt nur ein Ziel: Gewinnen.', traits:['intrigant','ehrgeizig'], g:'f' },
  { n:'Lukas', age:38, job:'Bibliothekar', bio:'Ruhig wie ein Lesesaal, mit trockenem Humor im Gepäck.', traits:['ruhig','lustig'], g:'m' },
  { n:'Nele', age:23, job:'Skaterin und Kellnerin', bio:'Stolpert in jede Situation und sagt frei heraus, was Sache ist.', traits:['chaot','ehrlich'], g:'f' },
  { n:'Emre', age:30, job:'Taxifahrer', bio:'Der Spaßvogel im Haus, der stets den Kamerawinkel prüft.', traits:['lustig','eitel'], g:'m' },
  { n:'Gitta', age:55, job:'Kneipenwirtin', bio:'Ein offenes Ohr für alle, aber sie weiß, wer mit wem tuschelt.', traits:['intrigant','herzlich'], g:'f' },
  { n:'Ravi', age:27, job:'Software-Entwickler', bio:'Optimiert alles, auch seinen Weg zum Sieg, ganz ohne Hektik.', traits:['ehrgeizig','ruhig'], g:'m' },
  { n:'Tilda', age:34, job:'Modedesignerin', bio:'Liebt Glanz und Glamour, aber lügt nie über deinen Pulli.', traits:['eitel','ehrlich'], g:'f' },
  { n:'Marek', age:41, job:'Hobby-Zauberer', bio:'Seine Tricks sind Chaos, seine Absichten selten ganz sauber.', traits:['intrigant','chaot'], g:'m' },
  { n:'Soraya', age:36, job:'Yogalehrerin', bio:'Herzensgut und posiert gern für jedes Licht im Haus.', traits:['herzlich','eitel'], g:'f' },
  { n:'Finn', age:19, job:'Schüler und Gamer', bio:'Macht Quatsch ohne Plan und hinterlässt dabei Krümelspuren.', traits:['lustig','chaot'], g:'m' },
  { n:'Odette', age:47, job:'Antiquitätenhändlerin', bio:'Spricht leise, lächelt fein und kennt jedes Geheimnis im Haus.', traits:['intrigant','ruhig'], g:'f' },
  { n:'Karlo', age:32, job:'Marathonläufer', bio:'Sagt, was er denkt, und rennt dem Sieg hinterher.', traits:['ehrlich','ehrgeizig'], g:'m' },
];

export const ROOMS = { schlaf:'im Schlafzimmer', kueche:'in der Küche', wohn:'im Wohnzimmer', studio:'im Studio', garten:'im Garten', beicht:'im Beichtstuhl' };

export const TEXT = {
  talk: {
    ok: [
      '{a} und {b} plaudern {r} stundenlang und verstehen sich blendend.',
      '{a} erzählt {b} {r} eine Anekdote, und beide lachen Tränen.',
      '{a} und {b} entdecken {r}, dass sie dieselbe Lieblingsserie haben.',
      'Ein tiefes Gespräch {r}: {a} öffnet sich, {b} hört aufmerksam zu.',
      '{a} und {b} teilen {r} ein Stück Schokolade und ein paar Sorgen.',
      '{b} gibt {a} {r} einen Rat, und der sitzt wirklich.',
    ],
    bad: [
      '{a} redet {r} so lange, dass {b} mit offenen Augen einschläft.',
      '{a} und {b} missverstehen sich {r} komplett und reden aneinander vorbei.',
      '{a} fragt {b} {r} etwas Dummes, und die Stimmung kippt.',
      '{b} verdreht {r} die Augen, als {a} zum dritten Mal dieselbe Story erzählt.',
      'Das Gespräch {r} läuft aus dem Ruder: {a} und {b} schweigen sich an.',
    ],
  },
  cook: {
    ok: [
      '{a} und {b} zaubern {r} ein Festmahl, das nach Sieg schmeckt.',
      '{a} schnippelt, {b} rührt, und {r} duftet das ganze Haus.',
      '{a} und {b} kochen {r} Hand in Hand, und das Salz sitzt perfekt.',
      '{b} lobt {a} {r} für die Soße, und {a} strahlt wie ein Scheinwerfer.',
      '{a} und {b} backen {r} Pfannkuchen, und alle stehen Schlange.',
      'Beim Kochen {r} wird gelacht: {a} und {b} naschen und würzen die Freundschaft.',
    ],
    bad: [
      '{a} verwechselt {r} Zucker und Salz, und {b} schluckt tapfer.',
      '{a} und {b} streiten {r} über das Rezept, und die Nudeln kleben.',
      '{a} lässt {r} den Reis anbrennen, und {b} reißt die Fenster auf.',
      '{b} schneidet {r} Zwiebeln und weint, {a} lacht und fängt sich einen Blick.',
      'Das Essen {r} wird ungenießbar, und {a} schiebt es auf {b}.',
    ],
  },
  alliance: {
    ok: [
      '{a} und {b} besiegeln {r} per Handschlag eine Allianz.',
      '{a} flüstert {b} {r} einen Plan zu, und {b} nickt entschlossen.',
      '{a} und {b} schwören {r}, sich gegenseitig durch die Woche zu tragen.',
      'Neues Bündnis {r}: {a} und {b} halten ab jetzt zusammen.',
      '{b} sagt {r} ja zu {a}, und ein geheimes Zeichen wird vereinbart.',
      '{a} und {b} stoßen {r} mit Saft auf ihre neue Allianz an.',
    ],
    bad: [
      '{a} bietet {b} {r} ein Bündnis an, doch {b} lehnt kühl ab.',
      'Jemand lauscht {r}, als {a} und {b} ihre Allianz planen.',
      '{b} verplappert sich {r}, und {a}s Plan ist kein Geheimnis mehr.',
      '{a} und {b} geraten {r} wegen der Rollenverteilung aneinander.',
      '{b} sagt {r} zu, grinst aber, und {a} ahnt nichts Gutes.',
    ],
  },
  tease: {
    ok: [
      '{a} stichelt {r} gegen {b}, und der Spruch sitzt, ohne zu verletzen.',
      '{a} nimmt {b} {r} liebevoll auf die Schippe, und alle lachen.',
      '{a} und {b} liefern sich {r} ein Wortgefecht mit Applaus.',
      '{a} gibt {b} {r} einen frechen Spitznamen, der sofort hängen bleibt.',
      '{b} kontert {r} spitz, aber {a} nimmt es mit Humor.',
      '{a} ärgert {b} {r} mit einem Streich, und der Haussegen hängt nur leicht schief.',
    ],
    bad: [
      '{a} geht {r} zu weit, und {b} verlässt wortlos den Raum.',
      'Der Spruch von {a} {r} trifft {b} tiefer als gedacht.',
      '{b} kontert {r} so scharf, dass {a} sprachlos bleibt.',
      '{a} stichelt {r} gegen {b}, und die ganze WG geht auf Abstand.',
      'Der Scherz {r} geht nach hinten los, und {a} muss sich bei {b} entschuldigen.',
    ],
  },
  secret: {
    ok: [
      '{a} vertraut {b} {r} ein Geheimnis an, und {b} schweigt wie ein Grab.',
      '{a} flüstert {b} {r} ein Geheimnis, und die beiden rücken näher zusammen.',
      '{b} verspricht {a} {r}, nichts zu verraten, und hält Wort.',
      '{a} gesteht {b} {r} eine alte Peinlichkeit und fühlt sich leichter.',
      '{a} beichtet {b} {r} sein Lampenfieber, und {b} macht Mut.',
      'Ein stiller Moment {r}: {a} teilt ein Geheimnis, {b} nimmt es dankbar an.',
    ],
    bad: [
      '{a} vertraut {b} {r} ein Geheimnis an, doch {b} plaudert es sofort aus.',
      'Die Wand ist dünn: {b} hört {r} das Geheimnis von {a} und erzählt es weiter.',
      '{b} lacht {r} über das Geheimnis von {a}, und das tut weh.',
      '{a} bereut {r}, {b} etwas erzählt zu haben, denn {b} grinst verdächtig.',
      'Ein Mikrofon {r} läuft mit, und das Geheimnis von {a} und {b} ist auf Sendung.',
    ],
  },
  rumor: {
    ok: [
      '{a} streut {r} ein Gerücht über {b}, und niemand ahnt die Quelle.',
      '{a} flüstert {r} Halbwahrheiten über {b}, und die Runde glaubt jedes Wort.',
      '{a} deutet {r} an, {b} spiele falsch, und die Zweifel wachsen.',
      'Das Gerücht über {b} wandert {r} von Ohr zu Ohr, dank {a}.',
      '{a} lässt {r} beiläufig fallen, {b} lästere über alle, und es wirkt.',
      '{b} merkt {r} nichts, während {a} das Gerücht genüsslich weiterspinnt.',
    ],
    bad: [
      '{b} belauscht {r}, wie {a} das Gerücht streut, und stellt {a} zur Rede.',
      'Das Gerücht von {a} über {b} fliegt {r} auf, und alle blicken auf {a}.',
      '{a} verhaspelt sich {r} beim Gerücht über {b} und macht sich lächerlich.',
      '{b} dreht {r} den Spieß um und deckt die Lüge von {a} auf.',
      'Niemand glaubt {r} {a}s Gerede über {b}, und {a} verliert Sympathien.',
    ],
  },
  show: {
    ok: [
      '{a} legt {r} einen Auftritt hin, bei dem das Publikum applaudiert.',
      '{a} rockt {r} das Mikrofon, und die Hörer drehen auf.',
      '{a} liefert {r} eine Moderation wie aus dem Bilderbuch.',
      'Die Hörer lieben es: {a} erzählt {r} eine Geschichte mit Gänsehaut.',
      '{a} improvisiert {r} einen Song, und die Anrufleitung glüht.',
      '{a} strahlt {r} ins Mikro und gewinnt jede Menge neue Fans.',
    ],
    bad: [
      '{a} verpatzt {r} den Einsatz, und die Hörer schalten genervt um.',
      '{a} vergisst {r} den Text und stammelt sich durch die Sendung.',
      'Das Mikrofon pfeift {r} laut, und {a} verliert den Faden.',
      '{a} versteht die Frage {r} falsch, und der Auftritt wird peinlich.',
      '{a} hustet {r} mitten in den Jingle, und die Regie seufzt.',
    ],
  },
  relax: {
    ok: [
      '{a} streckt sich {r} aus und lädt die Akkus wieder auf.',
      '{a} liest {r} ein Buch und vergisst den ganzen Trubel.',
      '{a} atmet {r} tief durch und findet die innere Ruhe.',
      '{a} summt {r} leise vor sich hin und fühlt sich pudelwohl.',
      '{a} legt {r} die Füße hoch und gönnt sich eine Auszeit.',
      '{a} schließt {r} die Augen und tankt neue Energie.',
    ],
    bad: [
      '{a} will {r} entspannen, doch der Lärm der Mitbewohner nervt.',
      '{a} schläft {r} ein und verpasst die Hälfte vom Tag.',
      '{a} grübelt {r} nur über die nächste Nominierung nach.',
      'Kaum liegt {a} {r} bequem, klingelt schon der Wecker der Redaktion.',
      '{a} streckt sich {r} aus und rutscht unsanft vom Sofa.',
    ],
  },
};

export const EVENTS = {
  party: [
    'Küchenparty! Alle tanzen zwischen Töpfen und Pfannen, und die Stimmung kocht über.',
    'Jemand dreht das Radio auf, und die Küche verwandelt sich in einen Club.',
    'Spontane Party in der Küche: Löffel werden zu Mikrofonen, die Laune steigt.',
    'Chips, Musik und gute Laune: Das Funkhaus feiert in der Küche bis spät.',
  ],
  fight: [
    '{a} und {b} geraten wegen des Abwaschs aneinander, und die Türen knallen.',
    'Dicke Luft: {a} wirft {b} vor, immer das letzte Wort zu haben.',
    '{a} und {b} streiten über die Fernbedienung, und der Rest hält Popcorn bereit.',
    'Zwischen {a} und {b} fliegen die Fetzen, und das ganze Haus lauscht.',
  ],
  birthday: [
    '{a} hat heute Geburtstag, und das Haus singt schief, aber laut.',
    'Alles Gute, {a}! Die Mitbewohner basteln eine Torte aus Keksen.',
    'Geburtstag im Funkhaus: {a} bekommt eine Krone aus Alufolie.',
    '{a} wird ein Jahr älter, und die Hörer schicken eine Glückwunschsendung.',
  ],
  blackout: [
    'Stromausfall! Das Funkhaus liegt im Dunkeln, und Taschenlampen tanzen durch die Flure.',
    'Es wird stockfinster, und jemand schreit im Flur. Es war nur der Kühlschrank.',
    'Das Licht fällt aus, und alle rücken im Kerzenschein zusammen.',
    'Blackout im Haus: Man hört nur Gekicher und das Tapsen der Füße.',
  ],
  rain: [
    'Regen im Garten! Alle rennen mit Decken über dem Kopf zurück ins Haus.',
    'Ein Platzregen fegt über den Garten, und die Wäsche hängt klatschnass.',
    'Es schüttet in Strömen, und die Gartenstühle schwimmen davon.',
    'Der Garten wird zum Matschfeld, und die Gummistiefel haben ihren großen Auftritt.',
  ],
  gift: [
    'Überraschungspaket der Hörer! Darin: Süßigkeiten, Socken und eine Karte voller Grüße.',
    'Die Hörer schicken ein Paket, und das Haus jubelt über Kekse und Brettspiele.',
    'Post von draußen! Ein Karton voller Snacks sorgt für Freudentänze.',
    'Ein Paket der Hörer landet im Flur, und alle stürzen sich neugierig darauf.',
  ],
  gossip: [
    '{a} belauscht zufällig, wie {b} über einen Mitbewohner tuschelt.',
    'Hinter der Tür hört {a}, was {b} wirklich über die anderen denkt.',
    '{a} steht lauschend am Fenster, als {b} ein pikantes Geheimnis ausplaudert.',
    '{a} schnappt ein Telefonat von {b} auf und schweigt vielsagend.',
  ],
  burnt: [
    'Es riecht verbrannt: Das Abendessen ist ein Fall für die Mülltonne.',
    'Der Rauchmelder schlägt Alarm, denn der Auflauf ist pechschwarz.',
    'Angebranntes Essen! Heute gibt es Toast und viel Humor.',
    'In der Küche qualmt es, und die Pizza hat sich in Kohle verwandelt.',
  ],
  karaoke: [
    'Karaoke-Abend! Das Wohnzimmer bebt, und niemand trifft einen Ton.',
    'Beim Karaoke singt das ganze Haus aus voller Kehle, aber ohne Gnade.',
    'Das Mikrofon wandert von Hand zu Hand, und jede Nummer wird gefeiert.',
    'Karaoke im Funkhaus: Die Nachbarn klopfen, doch der Refrain muss sein.',
  ],
  insomnia: [
    '{a} kann nicht schlafen und tigert nachts durchs dunkle Haus.',
    'Um drei Uhr nachts sitzt {a} wach in der Küche und starrt in den Kühlschrank.',
    '{a} wälzt sich hin und her und zählt Schäfchen, aber die streiken.',
    'Schlaflos im Funkhaus: {a} lauscht dem Rauschen der Heizung.',
  ],
};

export const VOICE = {
  weekStart: [
    'Woche {w} im Funkhaus beginnt: Die Mikrofone sind an, die Nerven blank.',
    'Woche {w} bricht an, und das Funkhaus knistert vor Spannung.',
    'Willkommen zu Woche {w}: Wer sendet, bleibt. Wer patzt, wackelt.',
    'Woche {w} im Funkhaus beginnt, und die Hörer sind wach wie nie.',
    'Der Zeiger springt: Woche {w} geht auf Sendung.',
  ],
  task: [
    'Eure Wochenaufgabe: Zeigt, dass ihr als Team ein Programm füllen könnt.',
    'Die Aufgabe dieser Woche lautet: Unterhaltet die Hörer, ohne zu streiten.',
    'Heute wartet eine Aufgabe, die Mut, Humor und Teamgeist verlangt.',
    'Die Wochenaufgabe steht an: Wer glänzt, wird belohnt.',
    'Hört gut zu, Bewohner: Die Hörer haben sich eine knifflige Aufgabe ausgedacht.',
  ],
  taskWin: [
    '{a} hat die Aufgabe gemeistert und sichert sich den Applaus der Hörer.',
    'Die Aufgabe geht an {a}, und der Jubel hallt durchs Funkhaus.',
    'Bravo, {a}! Diese Runde gehört dir.',
    '{a} hat gewonnen und darf sich diese Woche besonders sicher fühlen.',
  ],
  nomIntro: [
    'Nun geht jeder Bewohner einzeln in den Beichtstuhl und nennt seine Namen.',
    'Die Nominierungen beginnen: Einer nach dem anderen betritt den Beichtstuhl.',
    'Es wird ernst, denn jeder Bewohner muss im Beichtstuhl Farbe bekennen.',
    'Die Tür zum Beichtstuhl geht auf, und die Wahl der Namen beginnt.',
  ],
  nomResult: [
    '{a} und {b} sind nominiert, und die Hörer entscheiden über ihr Schicksal.',
    'Die Entscheidung ist gefallen: {a} und {b} stehen zur Wahl.',
    'Zittern müssen diese Woche {a} und {b}.',
    'Es trifft {a} und {b}, und nun hat das Publikum das Wort.',
  ],
  nomResult3: [
    '{a}, {b} und {c} sind nominiert, und die Hörer haben nun die Wahl.',
    'Drei Namen stehen zur Wahl: {a}, {b} und {c}.',
    'Zittern müssen diese Woche {a}, {b} und {c}.',
    'Es trifft {a}, {b} und {c}, und das Publikum spricht das Machtwort.',
  ],
  voteIntro: [
    'Die Hörer haben abgestimmt, und die Leitungen glühen noch.',
    'Das Votum der Hörer liegt vor, und es wird still im Funkhaus.',
    'Die Stimmen sind gezählt, und die Spannung ist zum Greifen nah.',
    'Die Hörer haben entschieden, und gleich wissen wir mehr.',
  ],
  leave: [
    '{a}, die Hörer haben entschieden: Du musst das Funkhaus verlassen.',
    'Das war es für {a}, denn das Funkhaus muss ohne dich weitersenden.',
    '{a} muss das Funkhaus verlassen, und die Tür fällt leise ins Schloss.',
    'Schluss für {a}: Dein Mikrofon wird abgeschaltet.',
    'Die Hörer haben gesprochen, {a}. Pack deine Sachen, es ist vorbei.',
    'Auf Wiederhören, {a}! Du musst das Funkhaus verlassen.',
  ],
  safe: [
    '{a} darf bleiben, und die Hörer atmen auf.',
    'Aufatmen im Funkhaus: {a} bleibt im Spiel.',
    'Die Hörer geben {a} eine weitere Chance.',
  ],
  finalIntro: [
    'Nur noch drei Bewohner sind übrig: {a}, {b} und {c} stehen im Finale.',
    'Das große Finale naht, denn {a}, {b} und {c} kämpfen um die Krone.',
    'Die letzten drei im Funkhaus: {a}, {b} und {c}. Wer wird Hörerliebling?',
  ],
  winner: [
    '{a} ist der Hörerliebling und wird zum Sieger des Funkhauses gekrönt.',
    'Der Sieger steht fest: {a} hat die Herzen der Hörer erobert.',
    'Applaus für {a}, den strahlenden Gewinner im Funkhaus.',
    '{a} gewinnt, und im ganzen Land drehen sich die Radios auf Anschlag.',
    'Das Publikum hat entschieden: {a} ist der Hörerliebling!',
  ],
  night: [
    'Es wird still im Funkhaus: Die Nachtruhe beginnt.',
    'Die Lichter gehen aus, und nur das Radio flüstert leise weiter.',
    'Gute Nacht, Funkhaus. Morgen wartet ein neuer Tag voller Überraschungen.',
    'Nachtruhe im Funkhaus: Wer jetzt noch tuschelt, tut das auf eigene Gefahr.',
  ],
  morning: [
    'Guten Morgen im Funkhaus! Der Kaffee läuft, und die Laune schwankt.',
    'Ein neuer Tag bricht an, und das Funkhaus gähnt herzhaft.',
    'Guten Morgen, ihr Langschläfer. Die Hörer sind schon seit Stunden wach.',
    'Die Sonne kitzelt die Antenne: Guten Morgen im Funkhaus!',
  ],
  welcome: [
    'Willkommen im Funkhaus! Die neuen Bewohner ziehen ein, und die Show beginnt.',
    'Herzlich willkommen: Acht Bewohner, ein Haus, unzählige Hörer.',
    'Das Funkhaus öffnet seine Tür, und die neuen Bewohner stolpern hinein.',
  ],
};

export const TIPS = [
  'Gute Freunde schützen dich, wenn die Hörer abstimmen.',
  'Wer beliebt ist, bekommt weniger Nominierungen. Pflege deine Beziehungen.',
  'Ein starker Studio-Auftritt macht dich bei den Hörern bekannt.',
  'Gerüchte wirken schnell, können aber auf dich zurückfallen.',
  'Allianzen helfen bei der Nominierung, doch Verrat bleibt selten geheim.',
  'Vergiss das Entspannen nicht, denn schlechte Laune kostet Sympathie.',
  'Jede Eigenschaft hat Vor- und Nachteile. Nutze sie klug.',
  'Gemeinsames Kochen stärkt die Bindung, wenn nichts anbrennt.',
];
