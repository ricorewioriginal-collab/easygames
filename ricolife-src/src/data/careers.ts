import type { CareerDef } from './types';

// Berufe in Lindenhafen. days: 0 = Montag … 6 = Sonntag. pay = RicoTaler pro Stunde.
// req = nötige Fähigkeitsstufen für die Beförderung AUF diese Stufe.
export const CAREERS: CareerDef[] = [
  {
    id: 'gastro',
    name: 'Gastronomie',
    icon: '☕',
    desc: 'Vom Tellerwäscher zur Café-Chefin: Im Café Möwe dreht sich alles um Kaffee, Kuchen und gute Laune an der Promenade.',
    lot: 'hv-cafe',
    active: true,
    skills: ['cooking', 'charisma'],
    minAge: 'youngadult',
    levels: [
      { title: 'Spülhilfe', pay: 15, days: [0, 2, 4, 5, 6], start: 6, hours: 6 },
      { title: 'Servicekraft', pay: 22, days: [0, 1, 4, 5, 6], start: 7, hours: 7, req: { cooking: 2, charisma: 1 } },
      { title: 'Barista', pay: 34, days: [1, 2, 4, 5, 6], start: 7, hours: 7, req: { cooking: 3, charisma: 3 } },
      { title: 'Küchenchef*in', pay: 52, days: [1, 2, 3, 5, 6], start: 8, hours: 8, req: { cooking: 6, charisma: 4 } },
      { title: 'Café-Leitung', pay: 75, days: [0, 1, 2, 3, 5], start: 8, hours: 8, req: { cooking: 8, charisma: 6 } },
    ],
    shiftEvents: [
      { text: 'Ein Gast bestellt einen „Hafer-Kokos-Karamell-Latte, halb entkoffeiniert, extra heiß, aber nicht zu heiß“.', choices: [
        { label: 'Mit Hingabe zubereiten', perf: 12, skill: 'cooking', result: 'Perfekt temperiert. Der Gast seufzt glücklich und gibt Trinkgeld.' },
        { label: 'Einfach einen normalen Latte machen', perf: -6, result: 'Der Gast merkt es sofort. Er merkt es IMMER.' },
      ] },
      { text: 'Eine Möwe ist durch die offene Tür geflogen und sitzt jetzt auf der Kuchentheke.', choices: [
        { label: 'Mit einem Brötchen nach draußen locken', perf: 10, skill: 'charisma', result: 'Die Möwe folgt dem Brötchen gehorsam. Die Gäste applaudieren.' },
        { label: 'Wild mit dem Geschirrtuch wedeln', perf: -8, result: 'Die Möwe fliegt eine Ehrenrunde durchs Café. Drei Cappuccinos fallen um.' },
        { label: 'Ein Foto für die Speisekarte machen', perf: 4, result: 'Die „Möwen-Torte“ wird spontan zum Tagesspecial.' },
      ] },
      { text: 'Der Milchschaum will heute einfach keine Herzchen formen.', choices: [
        { label: 'Weiter üben', perf: 6, skill: 'cooking', result: 'Nach zwanzig Versuchen: ein Herz! Okay, eher eine Kartoffel. Aber mit Herz.' },
        { label: 'Einfach Möwen malen', perf: 8, result: 'Die Gäste finden die Möwen viel origineller als Herzen.' },
      ] },
      { text: 'Eine Reisegruppe von dreißig Personen kommt gleichzeitig herein.', choices: [
        { label: 'Ruhig bleiben und organisieren', perf: 18, skill: 'charisma', result: 'Wie eine gut geölte Kaffeemaschine. Die Chefin ist beeindruckt.' },
        { label: 'Kurz im Lager verstecken', perf: -12, result: 'Als {name} wieder rauskommt, ist das Chaos perfekt.' },
      ] },
      { text: 'Der Apfelkuchen ist alle, aber ein Kind schaut mit Tränen in den Augen auf die leere Vitrine.', choices: [
        { label: 'Schnell Pfannkuchen zaubern', perf: 14, skill: 'cooking', result: 'Mit Apfelmus! Das Kind strahlt und malt {name} ein Bild.' },
        { label: 'Einen Keks schenken', perf: 6, result: 'Tränen getrocknet. Ein Keks hilft fast immer.' },
      ] },
    ],
  },
  {
    id: 'medizin',
    name: 'Medizin',
    icon: '🩺',
    desc: 'In der Klinik Lindenhafen kümmerst du dich um Schnupfennasen, verstauchte Knöchel und alles dazwischen.',
    lot: 'as-klinik',
    active: true,
    skills: ['logic', 'charisma'],
    minAge: 'youngadult',
    levels: [
      { title: 'Praktikant*in', pay: 18, days: [0, 1, 2, 3, 4], start: 8, hours: 7 },
      { title: 'Pflegekraft', pay: 30, days: [0, 1, 3, 5, 6], start: 14, hours: 8, req: { logic: 2, charisma: 2 } },
      { title: 'Assistenzärzt*in', pay: 50, days: [0, 2, 3, 4, 6], start: 12, hours: 9, req: { logic: 4, charisma: 3 } },
      { title: 'Fachärzt*in', pay: 85, days: [0, 1, 2, 3, 5], start: 9, hours: 8, req: { logic: 6, charisma: 4 } },
      { title: 'Chefärzt*in', pay: 130, days: [0, 1, 2, 3, 4], start: 9, hours: 8, req: { logic: 8, charisma: 6 } },
    ],
    shiftEvents: [
      { text: 'Ein kleiner Junge hat sich eine Erbse in die Nase gesteckt. „Sie wollte da rein!“', choices: [
        { label: 'Mit der Pinzette und viel Geduld', perf: 14, skill: 'logic', result: 'Plopp! Die Erbse ist draußen. Der Junge will sie als Andenken behalten.' },
        { label: 'Zum Niesen bringen', perf: 10, skill: 'charisma', result: 'Eine Feder, ein Kitzeln, ein Hatschi – Erbse befreit.' },
      ] },
      { text: 'Herr Möller ist überzeugt, dass er eine seltene Krankheit hat. Er hat drei Stunden im Internet gelesen.', choices: [
        { label: 'Geduldig untersuchen und beruhigen', perf: 15, skill: 'charisma', result: 'Es ist ein Mückenstich. Herr Möller ist erleichtert und bringt nächste Woche Kekse.' },
        { label: '„Weniger googeln, mehr schlafen.“', perf: 2, result: 'Herr Möller ist beleidigt, aber er weiß, dass es stimmt.' },
      ] },
      { text: 'Der Kaffeeautomat im Pausenraum ist kaputt. Das Team ist kurz vor dem Zusammenbruch.', choices: [
        { label: 'Den Automaten reparieren', perf: 8, skill: 'handiness', result: 'Ein Schlag an der richtigen Stelle. Das Team feiert {name} als Helden.' },
        { label: 'Kaffee vom Café Möwe holen', perf: 12, result: 'Zwölf Becher, ein Tablett, null verschüttet. Respekt.' },
      ] },
      { text: 'Die Patientenakten sind vollkommen durcheinander geraten.', choices: [
        { label: 'Ein neues Ablagesystem erfinden', perf: 16, skill: 'logic', result: 'Farbcodiert und alphabetisch. Die Verwaltung will das System übernehmen.' },
        { label: 'Einfach irgendwie zurückstopfen', perf: -10, result: 'Frau Schulz bekommt nun die Röntgenbilder eines Golden Retrievers. Hoppla.' },
      ] },
      { text: 'Eine Patientin hat große Angst vor der Spritze.', choices: [
        { label: 'Mit einem Witz ablenken', perf: 12, skill: 'charisma', result: '„Warum gehen Ameisen nicht in die Kirche? Sie sind in Sekten.“ Pieks – schon vorbei.' },
        { label: 'Ruhig jeden Schritt erklären', perf: 10, skill: 'logic', result: 'Wissen nimmt Angst. Die Patientin bedankt sich herzlich.' },
      ] },
    ],
  },
  {
    id: 'medien',
    name: 'Medien',
    icon: '🎙️',
    desc: 'Bei Radio Lindenwelle bringst du die Stadt zum Lachen, zum Tanzen und informierst sie über die neuesten Möwen-Sichtungen.',
    lot: 'hv-radio',
    active: true,
    skills: ['charisma', 'writing', 'music'],
    minAge: 'youngadult',
    levels: [
      { title: 'Redaktionshilfe', pay: 16, days: [0, 1, 2, 3, 4], start: 9, hours: 6 },
      { title: 'Nachrichtensprecher*in', pay: 28, days: [0, 1, 2, 3, 4], start: 6, hours: 7, req: { charisma: 2, writing: 2 } },
      { title: 'Moderator*in', pay: 45, days: [1, 2, 3, 4, 5], start: 14, hours: 7, req: { charisma: 4, writing: 3, music: 2 } },
      { title: 'Programmchef*in', pay: 70, days: [0, 1, 2, 3, 4], start: 10, hours: 8, req: { charisma: 6, writing: 5, music: 3 } },
      { title: 'Senderdirektor*in', pay: 110, days: [0, 1, 2, 3, 4], start: 10, hours: 8, req: { charisma: 8, writing: 6, music: 5 } },
    ],
    shiftEvents: [
      { text: 'Live auf Sendung! Plötzlich fällt die Musik aus. Drei Minuten Funkstille drohen.', choices: [
        { label: 'Spontan ein Lied summen', perf: 12, skill: 'music', result: 'Die Hörer finden es charmant. Der Sender bekommt Fanpost.' },
        { label: 'Eine Geschichte vom Hafen erzählen', perf: 15, skill: 'charisma', result: 'Die Geschichte vom Geisterkutter wird zur neuen Kultrubrik.' },
        { label: 'Panisch Knöpfe drücken', perf: -10, result: 'Jetzt läuft der Wetterbericht von 1998. Auf Rückwärts.' },
      ] },
      { text: 'Ein Hörer ruft an und möchte unbedingt seiner Katze ein Lied widmen.', choices: [
        { label: 'Ein Katzenlied ankündigen', perf: 10, skill: 'charisma', result: 'Die Katze heißt Brunhilde. Ganz Lindenhafen kennt sie jetzt.' },
        { label: 'Höflich vertrösten', perf: -2, result: 'Der Hörer ruft noch viermal an.' },
      ] },
      { text: 'Die Nachrichtenmeldung muss in fünf Minuten fertig sein – und der Text fehlt noch.', choices: [
        { label: 'Blitzschnell schreiben', perf: 16, skill: 'writing', result: 'Pünktlich, präzise und mit einem Wortspiel. Die Chefin grinst.' },
        { label: 'Die Meldung von gestern recyceln', perf: -12, result: '„Morgen wird es sonnig“ – während draußen ein Sturm tobt.' },
      ] },
      { text: 'Ein bekannter Schlagerstar kommt überraschend ins Studio.', choices: [
        { label: 'Ein Interview improvisieren', perf: 18, skill: 'charisma', result: 'Das Interview wird landesweit zitiert. Großer Tag für Radio Lindenwelle!' },
        { label: 'Um ein Autogramm bitten', perf: 3, result: 'Das Autogramm hängt jetzt an der Studiotür.' },
      ] },
    ],
  },
  {
    id: 'handwerk',
    name: 'Handwerk',
    icon: '🔧',
    desc: 'In der Hafenwerkstatt reparierst du Boote, Fahrräder und alles, was quietscht, klemmt oder tropft.',
    lot: 'hv-pier',
    active: false,
    skills: ['handiness', 'fitness'],
    minAge: 'youngadult',
    levels: [
      { title: 'Werkstatthilfe', pay: 17, days: [0, 1, 2, 3, 4], start: 7, hours: 8 },
      { title: 'Geselle / Gesellin', pay: 27, days: [0, 1, 2, 3, 4], start: 7, hours: 8, req: { handiness: 2, fitness: 1 } },
      { title: 'Bootsbauer*in', pay: 40, days: [0, 1, 2, 3, 4], start: 7, hours: 8, req: { handiness: 4, fitness: 3 } },
      { title: 'Meister*in', pay: 60, days: [0, 1, 2, 3, 4], start: 7, hours: 8, req: { handiness: 6, fitness: 4 } },
      { title: 'Werftleitung', pay: 90, days: [0, 1, 2, 3], start: 8, hours: 9, req: { handiness: 8, fitness: 5 } },
    ],
    shiftEvents: [
      { text: 'Ein Fischkutter hat ein Leck. Der Kapitän steht nervös daneben und kaut auf seiner Mütze.', choices: [
        { label: 'Fachmännisch abdichten', perf: 16, skill: 'handiness', result: 'Dicht wie ein Tresor. Der Kapitän schenkt {name} einen Räucherfisch.' },
        { label: 'Kaugummi und Gebet', perf: -8, result: 'Hält bis zur Hafenausfahrt. Leider nicht länger.' },
      ] },
      { text: 'Ein schwerer Schiffsmotor muss an Land gehievt werden.', choices: [
        { label: 'Kräftig mit anpacken', perf: 12, skill: 'fitness', result: 'Hau-ruck! Der Motor ist an Land und {name}s Bizeps auch gewachsen.' },
        { label: 'Einen Flaschenzug konstruieren', perf: 15, skill: 'handiness', result: 'Clever! Das Team staunt über die Konstruktion.' },
      ] },
      { text: 'Ein Kind bringt ein Fahrrad mit plattem Reifen und schaut hoffnungsvoll.', choices: [
        { label: 'Kostenlos flicken', perf: 8, skill: 'handiness', result: 'Das Kind strahlt und klingelt zum Abschied fünfmal.' },
        { label: 'Zeigen, wie man es selbst macht', perf: 10, skill: 'charisma', result: 'Ein neues Nachwuchstalent! Der Meister ist begeistert.' },
      ] },
      { text: 'Der Meister hat sein Lieblingswerkzeug verlegt und ist entsprechend grummelig.', choices: [
        { label: 'Die ganze Werkstatt aufräumen', perf: 12, result: 'Gefunden – in seiner eigenen Jackentasche. Aber die Werkstatt glänzt.' },
        { label: 'Lieber unauffällig weiterarbeiten', perf: 2, result: 'Gute Entscheidung. Grummelige Meister sollte man nicht stören.' },
      ] },
      { text: 'Eine Möwe hat sich im Werkstattnetz verfangen.', choices: [
        { label: 'Vorsichtig befreien', perf: 6, result: 'Die Möwe fliegt davon – und kommt ab jetzt jeden Tag zu Besuch.' },
        { label: 'Den Tierschutz anrufen', perf: 4, result: 'Die Fachleute kommen schnell. Gut gemacht!' },
      ] },
    ],
  },
  {
    id: 'bildung',
    name: 'Bildung',
    icon: '🍎',
    desc: 'An der Schule am Lindenhain bringst du Kindern Lesen, Rechnen und das Staunen bei – und lernst selbst jeden Tag dazu.',
    lot: 'sh-schule',
    active: false,
    skills: ['logic', 'charisma', 'writing'],
    minAge: 'youngadult',
    levels: [
      { title: 'Schulbegleitung', pay: 16, days: [0, 1, 2, 3, 4], start: 8, hours: 6 },
      { title: 'Referendar*in', pay: 28, days: [0, 1, 2, 3, 4], start: 8, hours: 7, req: { logic: 2, charisma: 2 } },
      { title: 'Lehrkraft', pay: 42, days: [0, 1, 2, 3, 4], start: 8, hours: 7, req: { logic: 3, charisma: 3, writing: 2 } },
      { title: 'Oberstudienrat / -rätin', pay: 60, days: [0, 1, 2, 3, 4], start: 8, hours: 8, req: { logic: 5, charisma: 5, writing: 4 } },
      { title: 'Schulleitung', pay: 85, days: [0, 1, 2, 3, 4], start: 8, hours: 8, req: { logic: 7, charisma: 7, writing: 5 } },
    ],
    shiftEvents: [
      { text: 'Ein Schüler behauptet, sein Hund habe die Hausaufgaben gefressen. Er hat keinen Hund.', choices: [
        { label: 'Augenzwinkernd nachfragen', perf: 10, skill: 'charisma', result: '„Es war … ein Nachbarshund?“ Er bekommt einen Tag Aufschub und lacht.' },
        { label: 'Eine Strafarbeit verteilen', perf: 2, result: 'Gerecht, aber die Stimmung in der Klasse sinkt.' },
      ] },
      { text: 'Die Klasse ist nach der großen Pause völlig aufgedreht.', choices: [
        { label: 'Ein Bewegungsspiel einbauen', perf: 14, skill: 'fitness', result: 'Zehn Minuten Hampelmänner-Mathe – danach sind alle konzentriert.' },
        { label: 'Laut um Ruhe bitten', perf: -4, result: 'Es ist kurz still. Dann noch lauter.' },
        { label: 'Eine spannende Geschichte vorlesen', perf: 12, skill: 'writing', result: 'Mucksmäuschenstill. Alle wollen wissen, wie es weitergeht.' },
      ] },
      { text: 'Ein Experiment im Chemieunterricht schäumt plötzlich über.', choices: [
        { label: 'Es zur Lehrstunde machen', perf: 16, skill: 'logic', result: '„Und genau DAS ist eine exotherme Reaktion!“ Die Klasse ist begeistert.' },
        { label: 'Hastig aufwischen', perf: -6, result: 'Der Schaum ist jetzt auch in den Haaren. Bei allen.' },
      ] },
      { text: 'Elternsprechtag: Eine Mutter ist überzeugt, dass ihr Kind ein unentdecktes Genie ist.', choices: [
        { label: 'Die Stärken des Kindes betonen', perf: 14, skill: 'charisma', result: 'Die Mutter geht stolz und motiviert. Das Kind auch.' },
        { label: 'Ehrlich über die Mathenoten reden', perf: 6, skill: 'logic', result: 'Es wird ein langes, aber konstruktives Gespräch.' },
      ] },
      { text: 'Der Beamer streikt kurz vor der Präsentation.', choices: [
        { label: 'Kabel prüfen', perf: 8, skill: 'handiness', result: 'Es war der Stecker. Natürlich war es der Stecker.' },
        { label: 'An der Tafel zeichnen', perf: 12, skill: 'painting', result: 'Die Kreidezeichnung ist so schön, dass sie niemand wegwischen will.' },
      ] },
    ],
  },
  {
    id: 'kreativ',
    name: 'Kunst & Kreatives',
    icon: '🎨',
    desc: 'In der Galerie Farbenspiel kuratierst du Ausstellungen, fotografierst Kunstwerke und erschaffst irgendwann dein eigenes Meisterwerk.',
    lot: 'as-galerie',
    active: false,
    skills: ['painting', 'photography'],
    minAge: 'youngadult',
    levels: [
      { title: 'Galerieaufsicht', pay: 14, days: [2, 3, 4, 5, 6], start: 10, hours: 6 },
      { title: 'Atelierassistenz', pay: 24, days: [1, 2, 3, 4, 5], start: 10, hours: 7, req: { painting: 2, photography: 1 } },
      { title: 'Kunstfotograf*in', pay: 38, days: [1, 2, 3, 4, 5], start: 11, hours: 7, req: { painting: 3, photography: 4 } },
      { title: 'Kurator*in', pay: 62, days: [1, 2, 3, 4], start: 11, hours: 8, req: { painting: 5, photography: 5 } },
      { title: 'Gefeierte*r Künstler*in', pay: 120, days: [1, 2, 3, 4], start: 12, hours: 6, req: { painting: 8, photography: 6 } },
    ],
    shiftEvents: [
      { text: 'Ein Besucher hält den Feuerlöscher für ein Kunstwerk und bewundert ihn seit zwanzig Minuten.', choices: [
        { label: 'Ihn sanft aufklären', perf: 6, skill: 'charisma', result: 'Er lacht über sich selbst und kauft dann ein echtes Bild.' },
        { label: 'Ein Schild „Rot. Hoffnung. 2026.“ daneben hängen', perf: 10, skill: 'painting', result: 'Der Feuerlöscher wird zum beliebtesten Fotomotiv der Ausstellung.' },
      ] },
      { text: 'Ein Gemälde hängt schief – und die Vernissage beginnt in zehn Minuten.', choices: [
        { label: 'Mit Wasserwaage nachjustieren', perf: 12, skill: 'handiness', result: 'Millimetergenau. Die Kuratorin nickt anerkennend.' },
        { label: 'Alle anderen Bilder auch schief hängen', perf: 4, skill: 'painting', result: 'Die Kritik spricht von „mutiger Hängung“. Hm.' },
      ] },
      { text: 'Für den Katalog müssen alle Werke fotografiert werden, aber das Licht ist schrecklich.', choices: [
        { label: 'Mit Reflektoren experimentieren', perf: 16, skill: 'photography', result: 'Die Fotos sind so gut, dass die Künstler*innen sie selbst kaufen wollen.' },
        { label: 'Einfach Blitz an', perf: -6, result: 'Jedes Bild hat jetzt einen weißen Fleck in der Mitte.' },
      ] },
      { text: 'Ein Kind fragt, warum das blaue Quadrat 5.000 RicoTaler kostet.', choices: [
        { label: 'Über Gefühle und Farben sprechen', perf: 12, skill: 'charisma', result: 'Das Kind malt danach sein eigenes blaues Quadrat. „Für 3 Taler.“' },
        { label: '„Das frage ich mich auch.“', perf: 2, result: 'Das Kind und {name} sind sich einig. Die Kuratorin hustet.' },
      ] },
    ],
  },
  {
    id: 'it',
    name: 'IT & Technik',
    icon: '💻',
    desc: 'Im Technikbüro des Rathauses hältst du die digitale Stadt am Laufen – von der Ampelsteuerung bis zum Bürgerportal.',
    lot: 'as-rathaus',
    active: false,
    skills: ['programming', 'logic'],
    minAge: 'youngadult',
    levels: [
      { title: 'IT-Support', pay: 20, days: [0, 1, 2, 3, 4], start: 9, hours: 8 },
      { title: 'Junior-Entwickler*in', pay: 34, days: [0, 1, 2, 3, 4], start: 9, hours: 8, req: { programming: 2, logic: 2 } },
      { title: 'Softwareentwickler*in', pay: 55, days: [0, 1, 2, 3, 4], start: 10, hours: 8, req: { programming: 4, logic: 3 } },
      { title: 'Systemarchitekt*in', pay: 85, days: [0, 1, 2, 3], start: 10, hours: 9, req: { programming: 6, logic: 5 } },
      { title: 'Technische Leitung', pay: 125, days: [0, 1, 2, 3], start: 10, hours: 8, req: { programming: 8, logic: 7 } },
    ],
    shiftEvents: [
      { text: 'Der Bürgermeister kann sein Passwort nicht mehr finden. Es stand auf einem Zettel. Der Zettel ist weg.', choices: [
        { label: 'Geduldig ein neues einrichten', perf: 10, skill: 'charisma', result: 'Das neue Passwort ist nicht „Passwort123“. Ein großer Schritt für Lindenhafen.' },
        { label: 'Einen Passwort-Workshop anbieten', perf: 14, skill: 'logic', result: 'Halb das Rathaus nimmt teil. Sicherheit für alle!' },
      ] },
      { text: 'Die Ampeln am Rathausplatz zeigen alle gleichzeitig Grün.', choices: [
        { label: 'Den Code sofort debuggen', perf: 18, skill: 'programming', result: 'Ein vertauschtes Semikolon. In fünf Minuten behoben. Heldentat!' },
        { label: 'Den Server neu starten', perf: 8, result: 'Funktioniert. Warum? Niemand weiß es. Hauptsache, es klappt.' },
        { label: 'In die Mittagspause gehen', perf: -15, result: 'Als {name} zurückkommt, regelt ein Polizist mit Trillerpfeife den Verkehr.' },
      ] },
      { text: 'Ein Kollege hat Kaffee über die Tastatur geschüttet.', choices: [
        { label: 'Tastatur zerlegen und trocknen', perf: 10, skill: 'handiness', result: 'Sie funktioniert wieder. Nur die Leertaste riecht jetzt nach Cappuccino.' },
        { label: 'Eine neue aus dem Lager holen', perf: 6, result: 'Schnell und pragmatisch. Gut so.' },
      ] },
      { text: 'Das Bürgerportal soll bis Freitag ein neues Feature bekommen: Möwen-Sichtungen melden.', choices: [
        { label: 'Sauber planen und umsetzen', perf: 16, skill: 'programming', result: 'Am ersten Tag werden 412 Möwen gemeldet. Ein voller Erfolg!' },
        { label: 'Schnell zusammenhacken', perf: 4, skill: 'programming', result: 'Funktioniert – solange niemand mehr als drei Möwen gleichzeitig meldet.' },
      ] },
      { text: 'Im Serverraum piept etwas. Seit Stunden. Niemand weiß, was.', choices: [
        { label: 'Systematisch alle Geräte prüfen', perf: 12, skill: 'logic', result: 'Es war ein Rauchmelder mit leerer Batterie. Stille. Herrliche Stille.' },
        { label: 'Kopfhörer aufsetzen', perf: -4, result: 'Das Piepen hört man trotzdem. Es ist jetzt in {name}s Träumen.' },
      ] },
    ],
  },
  {
    id: 'handel',
    name: 'Handel',
    icon: '🛍️',
    desc: 'Im Kaufhaus Kranich berätst du Kundschaft, dekorierst Schaufenster und führst irgendwann das ganze Haus.',
    lot: 'as-laden',
    active: false,
    skills: ['charisma', 'handiness'],
    minAge: 'youngadult',
    levels: [
      { title: 'Regalauffüller*in', pay: 15, days: [0, 2, 3, 4, 5], start: 9, hours: 7 },
      { title: 'Verkäufer*in', pay: 23, days: [0, 1, 3, 4, 5], start: 10, hours: 8, req: { charisma: 2 } },
      { title: 'Schaufenstergestalter*in', pay: 35, days: [0, 1, 2, 4, 5], start: 9, hours: 8, req: { charisma: 3, handiness: 3 } },
      { title: 'Abteilungsleitung', pay: 55, days: [0, 1, 2, 3, 5], start: 9, hours: 8, req: { charisma: 5, handiness: 4 } },
      { title: 'Kaufhausdirektor*in', pay: 90, days: [0, 1, 2, 3, 4], start: 9, hours: 8, req: { charisma: 7, handiness: 6 } },
    ],
    shiftEvents: [
      { text: 'Eine Kundin kann sich seit einer Stunde nicht zwischen zwei identischen Pullovern entscheiden.', choices: [
        { label: 'Ehrlich beraten', perf: 12, skill: 'charisma', result: 'Sie nimmt den linken. Und dann doch beide. Umsatz!' },
        { label: 'Einen Münzwurf vorschlagen', perf: 6, result: 'Kopf! Sie ist erleichtert, dass jemand anders entschieden hat.' },
      ] },
      { text: 'Das Schaufenster braucht eine neue Deko zum Thema „Sommer am Hafen“.', choices: [
        { label: 'Einen Mini-Leuchtturm bauen', perf: 16, skill: 'handiness', result: 'Er blinkt sogar! Passanten bleiben stehen und machen Fotos.' },
        { label: 'Eine Puppe mit Sonnenbrille hinstellen', perf: 3, result: 'Funktional. Aber nicht gerade preisverdächtig.' },
      ] },
      { text: 'Ein Kunde will einen Toaster zurückgeben. Er hat ihn offensichtlich als Blumentopf benutzt.', choices: [
        { label: 'Freundlich, aber bestimmt bleiben', perf: 12, skill: 'charisma', result: 'Er sieht es ein und kauft einen richtigen Blumentopf. Win-win.' },
        { label: 'Einfach umtauschen', perf: -4, result: 'Die Chefin schaut sehr lange auf den Toaster mit Erde drin.' },
      ] },
      { text: 'Inventur! Im Lager fehlen angeblich 300 Socken.', choices: [
        { label: 'Akribisch nachzählen', perf: 14, skill: 'logic', result: 'Sie waren falsch einsortiert – bei den Handschuhen. Rätsel gelöst!' },
        { label: 'Die Waschmaschinen-Theorie aufstellen', perf: 2, result: 'Die Kollegen lachen. Die Socken bleiben verschollen.' },
      ] },
    ],
  },
  {
    id: 'nebenjob',
    name: 'Nebenjob im Supermarkt',
    icon: '🛒',
    desc: 'Regale auffüllen, Kasse machen, Pfandautomat retten: Der perfekte erste Job im Supermarkt Frischekorb – auch für Teenager.',
    lot: 'hv-markt',
    active: false,
    skills: ['charisma', 'handiness'],
    minAge: 'teen',
    levels: [
      { title: 'Aushilfe', pay: 8, days: [1, 3, 5], start: 15, hours: 3 },
      { title: 'Regalprofi', pay: 10, days: [1, 3, 5], start: 15, hours: 3, req: { handiness: 1 } },
      { title: 'Kassenkraft', pay: 13, days: [0, 2, 5], start: 15, hours: 4, req: { charisma: 2, handiness: 1 } },
      { title: 'Schichtleitung Frische', pay: 16, days: [0, 2, 5], start: 14, hours: 4, req: { charisma: 3, handiness: 3 } },
      { title: 'Marktleitung-Assistenz', pay: 20, days: [1, 3, 5], start: 14, hours: 4, req: { charisma: 6, handiness: 5 } },
    ],
    shiftEvents: [
      { text: 'Eine Pyramide aus Konservendosen wackelt bedrohlich.', choices: [
        { label: 'Schnell stabilisieren', perf: 12, skill: 'handiness', result: 'Gerettet! Die Pyramide steht – und sieht sogar besser aus als vorher.' },
        { label: 'Langsam rückwärts weggehen', perf: -8, result: 'Kawumm. Erbsen überall. Ein Kind jubelt.' },
      ] },
      { text: 'Der Pfandautomat hat schon wieder eine Flasche verschluckt und blinkt rot.', choices: [
        { label: 'Vorsichtig die Klappe öffnen', perf: 10, skill: 'handiness', result: 'Drin waren drei Flaschen und eine Socke. Rätselhaft.' },
        { label: 'Der Kundin den Pfandbon schreiben', perf: 8, skill: 'charisma', result: 'Die Kundin ist zufrieden. Der Automat bleibt beleidigt.' },
      ] },
      { text: 'Ein älterer Herr fragt nach „dem Joghurt von früher, mit der blauen Kuh drauf“.', choices: [
        { label: 'Gemeinsam suchen', perf: 12, skill: 'charisma', result: 'Die Kuh ist jetzt grün, aber der Joghurt ist derselbe. Er strahlt.' },
        { label: '„Den gibt es nicht mehr.“', perf: -2, result: 'Er schaut traurig. Und kauft dann trotzdem Joghurt.' },
      ] },
      { text: 'Die Obstabteilung sieht nach einem Ansturm aus wie nach einem Sturm.', choices: [
        { label: 'Liebevoll neu sortieren', perf: 14, result: 'Ein Regenbogen aus Obst und Gemüse. Die Chefin macht ein Foto.' },
        { label: 'Nur das Nötigste', perf: 4, result: 'Solide. Die Bananen liegen jetzt bei den Äpfeln, aber egal.' },
      ] },
    ],
  },
];
