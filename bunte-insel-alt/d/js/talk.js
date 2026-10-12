'use strict';
/* Bunte Insel – Die Leute auf der Insel haben Namen und erzählen etwas (Witze, Inselwissen, Tipps). Lustig, freundlich, kindgerecht. */
BI.TALK = {
  adults: [
    ['Bäckerin Brigitte', ['Frische Brötchen! Magst du eins? 🥖', 'Mein Geheimrezept: viel Liebe und ein bisschen Zucker.', 'Im Hofladen gibt es Erdbeeren – daraus wird die beste Marmelade!']],
    ['Fischer Frieder', ['Gestern habe ich einen Fisch mit Hut gefangen. Ehrlich! 🎣', 'Vom Pier aus fährt das Segelboot. Ahoi!', 'Fische schlafen mit offenen Augen. Ob sie dabei träumen?']],
    ['Gärtnerin Gerda', ['Pflanzen mögen es, wenn man mit ihnen spricht. 🌻', 'Gieß deine Beete – nach dem Regen wachsen sie besonders schnell!', 'Sonnenblumen drehen sich immer zur Sonne.']],
    ['Postbote Paul', ['Ich bringe Briefe, Pakete und gute Laune! 📮', 'Ich kenne jede Straße auf der Insel. Frag mich ruhig!', 'Mein Fahrrad hat sogar eine Klingel. Kling-ling!']],
    ['Opa Otto', ['Früher gab es hier nur eine einzige Straße. 👴', 'Weißt du, wie man ein Lagerfeuer-Märchen erzählt? Setz dich zum Camp!', 'Ein guter Spaziergang macht den Kopf frei.']],
    ['Oma Berta', ['Kinder, trinkt genug Wasser! 💧', 'Ich stricke gerade einen Schal – für den Winter, falls es schneit.', 'Der Zug fährt einmal rund um die Insel. Tut tuuut!']],
    ['Lehrerin Lina', ['Wusstest du? Ein Hubschrauber fliegt mit einem Drehflügel. 🚁', 'Zähl mal die Sterne, die du heute gefunden hast!', 'Neugierig sein ist das Beste, was man machen kann.']],
    ['Feuerwehrmann Franz', ['Feuerwehr, Polizei und Krankenwagen helfen immer. 🚒', 'Spiel nie mit Streichhölzern – nur mit dem Spielzeug-Feuer im Camp!', 'Die Feuerwehr hat einen Wasserschlauch, der hat richtig Power!']],
    ['Touristin Tina', ['Wo geht es zum Freibad? Ach, drück einfach auf 🧭! 🗺️', 'Diese Insel ist so bunt, ich will gar nicht mehr nach Hause.', 'Ich habe schon 100 Fotos gemacht!']],
    ['Radfahrer Rudi', ['Mit dem Fahrrad kommt man überall hin – und es ist ganz leise. 🚲', 'Klingel, wenn jemand im Weg steht!', 'Ich fahre jeden Tag drei Runden um den Park.']],
    ['Künstlerin Kira', ['Ich male die Insel in 100 Farben. 🎨', 'Mal doch ein Bild für dein Zimmer – es hängt dann an der Wand!', 'Blau ist meine Lieblingsfarbe. Und Regenbogen!']],
    ['Musikant Max', ['La la la … kennst du die Melodie? 🎵', 'Mit dem Klavier kannst du sogar mit Freunden zusammen spielen.', 'Musik macht gute Laune, hört man schon von Weitem.']],
    ['Bauer Bernd', ['Mein Hof ist bei Bauer Heinz gleich nebenan. 🚜', 'Kühe geben Milch – sag ihnen schön Danke!', 'Wenn das Feld gemäht ist, wächst es wieder nach.']],
    ['Sportlerin Sabine', ['Ich jogge jeden Morgen! Rennen macht fit. 🏃', 'Beim Rennen musst du den Joystick ganz nach außen schieben.', 'Am Beckenrand nicht rennen, sonst pfeift Herr Fischer!']],
    ['Köchin Kathi', ['Heute koche ich Kürbissuppe! 🥣', 'Wer in der Hofküche kocht, wird ein Hobbykoch.', 'Eier, Milch und Erdbeeren geben einen leckeren Kuchen.']],
    ['Kapitän Karl', ['Ahoi! Auf dem Meer gibt es viel zu entdecken. ⚓', 'Das Piratenschiff am Strand hat sogar Kanonen!', 'Wer die Schatztruhe findet, wird reich. Vielleicht.']]
  ],
  kids: [
    ['Finn', ['Was ist grün und klopft an die Tür? Ein Klopfsalat! 😂', 'Fang mich doch, ich bin ganz schnell!', 'Ich habe heute einen Regenbogen gesehen!']],
    ['Lotta', ['Was sagt der große Stift zum kleinen Stift? „Wachs-mal-stift!“ 🖍️', 'Hast du schon die Kühe im Zoo besucht? Muh!', 'Ich wünsche mir ein Fahrrad mit Glitzer.']],
    ['Emil', ['Warum können Geister so schlecht lügen? Man sieht durch sie hindurch! 👻', 'Ich sammle Sterne – schon 12 Stück!', 'Spielst du mit mir Fangen?']],
    ['Nele', ['Was macht ein Pirat am Computer? Er drückt die Enter-Taste! 🏴‍☠️', 'Ich mag Marshmallows am Lagerfeuer.', 'Mein Papa ist Feuerwehrmann. Cool, oder?']],
    ['Paula', ['Was ist gelb und schwimmt im Wasser? Eine Bananenboot-Fahrerin! 🍌', 'Ich kann schon rückwärts schwimmen.', 'Magst du Eis? Ich nehme Schoko!']],
    ['Theo', ['Was ist rot und steht am Straßenrand? Ein Hund mit Sonnenbrand! 🐶', 'Wir bauen gleich ein Haus aus Kissen.', 'Heute ist der allerschönste Tag!']],
    ['Mila', ['Welches Tier ist am schlauesten? Das Schaf – es kennt alle Wolle-Wörter! 🐑', 'Ich war im Streichelzoo und habe ein Pferd gestreichelt.', 'Kommst du mit zum Spielplatz?']],
    ['Jonas', ['Was ist das Lieblingsessen von Autos? Reifen-Pommes! 🚗', 'Ich fahre am liebsten mit dem Roller.', 'Pssst – im Park liegt noch ein Stern!']]
  ]
};
/* Märchen zum Vorlesen (Bücherregale), kurze Witze fürs Fernsehen, Ladenplaudereien */
BI.TALK.tales = [
  ['Der Mond und die Katze', 'Eine kleine Katze wollte den Mond fangen. Sie sprang auf das Dach, aber der Mond war immer noch weit weg. Da setzte sie sich hin und schnurrte ihm ein Lied. Der Mond lächelte und leuchtete extra hell für sie.'],
  ['Das Gespenst Fridolin', 'Fridolin war ein freundliches Gespenst. Er wollte niemanden erschrecken, sondern Freunde finden. Als er den Kindern beim Suchen eines verlorenen Balls half, luden sie ihn zum Eisessen ein.'],
  ['Der kleine Traktor', 'Der kleine Traktor Toni fuhr jeden Morgen aufs Feld. Er war nicht der größte, aber er gab immer sein Bestes. Und als der große Mähdrescher stecken blieb, zog Toni ihn heraus.'],
  ['Die Regenbogen-Reise', 'Lia und ihr Hund wollten das Ende des Regenbogens finden. Sie liefen über Wiesen und Brücken. Am Ende fanden sie keinen Schatz, aber einen Spielplatz voller neuer Freunde.']
];
BI.TALK.jokes = ['Was machen Fernseher im Winter? – Sie sehen sich ein Heizungsprogramm an! 😂', 'Der Wetterbericht sagt: Heute Sonne, morgen Eis – und übermorgen Eis mit Sonne! 🍦', 'Warum hat der Roboter keinen Hunger? – Er hat schon einen Byte gegessen! 🤖', 'Kasperle fragt das Krokodil: Hast du schon gegessen? – Ja, aber du siehst lecker aus! 🐊😄'];
BI.TALK.shops = {
  supermarkt: ['Frau Kasse', 'Heute gibt es besonders frische Äpfel! 🍎'], baeckerei: ['Bäcker Benno', 'Frisch aus dem Ofen – Vorsicht, heiß! 🥐'], blumen: ['Floristin Flora', 'Schenk jemandem einen Blumenstrauß – das macht beide froh! 💐'],
  apotheke: ['Apothekerin Anna', 'Meine Tränke helfen im Verbotenen Wald – aber bleib vorsichtig! ⚕️'], cafe: ['Kellner Karl', 'Eine heiße Schokolade gefällig? ☕'], buecherei: ['Bibliothekarin Berta', 'Psst! Such dir ein schönes Buch aus. 📚'],
  tiere: ['Tierpfleger Timo', 'Hast du Futter für die Tiere im Zoo? 🐾'], mode: ['Schneiderin Sina', 'Probier doch etwas Neues an! 👒']
};

/* ---------- Noch mehr Leute, Gespräche, Tipps ---------- */
BI.TALK.adults.push(
  ['Bürgermeisterin Martha', ['Willkommen auf unserer bunten Insel! 🏝️', 'Hier darf jeder mithelfen: Sterne sammeln, bauen, fahren, spielen.', 'Im Park haben wir einen neuen Spielplatz – probier die Schaukel!']],
  ['Eisverkäufer Enzo', ['Eis, Eis, Eis! Welche Sorte magst du? 🍦', 'Mein Eiswagen spielt ein Lied – hör mal, wenn er vorbeifährt!', 'Schoko, Erdbeere, Vanille … und manchmal Regenbogen!']],
  ['Taxifahrerin Tamara', ['Mein Taxi ist gelb mit einem Schild auf dem Dach. 🚕', 'Steig in ein Taxi – dann fragt dich das Spiel, ob du einen Fahrgast fahren möchtest.', 'Pünktlich sein ist das Wichtigste beim Taxifahren!']],
  ['Polizist Peter', ['Ich passe auf, dass alle sicher über die Straße kommen. 🚓', 'Auf dem Zebrastreifen haben immer die Fußgänger Vorrang.', 'Du darfst mit dem Polizeiauto sogar die Sirene anmachen!']],
  ['Ärztin Dr. Doris', ['Ein Apfel am Tag hält den Doktor fern. 🍎', 'Bei Bauchweh hilft Tee und ein bisschen Ruhe.', 'Im Krankenhaus gibt es einen Hubschrauberlandeplatz!']],
  ['Zugführerin Zora', ['Alles einsteigen, bitte! Der Zug fährt gleich ab. 🚂', 'Am Bahnsteig kannst du selbst den Zug fahren.', 'Pfeife nicht zu laut, sonst erschrecken die Schafe!']],
  ['Zoowärter Zack', ['Die Tiere im Streichelzoo lieben Streicheleinheiten. 🐑', 'Kühe muss man vorsichtig melken – ganz sanft.', 'Ein Pferd erkennt dich nach ein paar Besuchen wieder.']],
  ['Bademeisterin Bea', ['Im Freibad gibt es zwei Rutschen und ein Sprungbrett! 🏊', 'Erst abkühlen, dann rein ins Wasser.', 'Schwimmflügel sind keine Schande – sie machen Spaß!']],
  ['Pilot Paulchen', ['Der Hubschrauber startet am Landeplatz neben dem Krankenhaus. 🚁', 'Von oben sieht die Insel aus wie ein bunter Kuchen.', 'Mit ⬆ und ⬇ steuerst du die Flughöhe.']],
  ['Schmied Sven', ['Klong klong klong! Ich baue ein Hufeisen. 🔨', 'Wer Bäume haut, braucht kräftige Arme!', 'Wenn man oft genug haut, fällt der Baum um – Achtung, TIMBER!']],
  ['Imkerin Ida', ['Bienen machen Honig und bestäuben die Blumen. 🐝', 'Summ summ summ – die Blumen im Park lieben meine Bienen.', 'Bienen stechen nur, wenn man sie ärgert.']],
  ['Hausmeister Hugo', ['Ich repariere alles: Türen, Lampen, Fahrräder. 🔧', 'Wenn die Schaukel quietscht, öle ich sie.', 'Mit einem Schraubenzieher kommt man weit.']],
  ['Sängerin Sophie', ['Do – Re – Mi – Fa – So – La – Ti – Do! 🎤', 'Die Musik-Tasten im Spiel heißen C D E F G A H.', 'Singen macht glücklich, auch wenn es schief klingt!']],
  ['Gymnastiklehrer Gregor', ['Strecken, beugen, hüpfen! Das Trampolin im Park ist super. 🤸', 'Fünf Mal hoch springen – und noch ein Salto!', 'Bewegung macht müde Knochen munter.']],
  ['Verkäuferin Vera', ['Im Supermarkt gibt es alles: Obst, Brot, Milch. 🛒', 'Frag an der Kasse nach Sonderangeboten!', 'Mit Sternen bezahlst du bei uns ganz einfach.']],
  ['Detektiv Dario', ['Ich suche einen verschwundenen Ball. Hast du ihn gesehen? 🔍', 'Ein guter Detektiv schaut genau hin – zum Beispiel nach goldenen Sternen.', 'Die Schatztruhe liegt am Strand. Geheimtipp!']],
  ['Astronomin Astrid', ['Nachts sieht man hier Sterne ohne Ende. 🔭', 'Der Mond ist ungefähr 384.000 Kilometer entfernt.', 'Drück den Mond-Knopf, dann wird es Nacht!']],
  ['Kunstlehrer Karim', ['Mal ein Bild im Mal-Block – es kommt in dein Album! 🖌️', 'Aus Gelb und Blau mischt man Grün.', 'Es gibt keine falschen Farben.']],
  ['Pizzabäcker Paolo', ['Eine Pizza mit extra viel Käse! 🍕', 'Der Teig muss ganz dünn gerollt werden.', 'Mamma mia, das duftet!']],
  ['Hirtin Helga', ['Meine Schafe sind heute ganz brav. 🐑', 'Schafe haben ein sehr gutes Gedächtnis für Gesichter.', 'Mäh! Das heißt: Guten Morgen!']],
  ['Bibliothekar Benedikt', ['Pssst! Bücher sind wie Reisen ohne Koffer. 📚', 'In der Bücherei kann man sich Geschichten vorlesen lassen.', 'Lesen macht klug und müde zugleich.']],
  ['Gärtner Gustav', ['Ich schneide gerade die Hecke. Schnipp schnapp! ✂️', 'Gieß deine Pflanzen am besten morgens.', 'Aus kleinen Samen werden große Pflanzen.']],
  ['Postfrau Petra', ['Einen Brief für dich! Ach nein, der ist für den Bäcker. ✉️', 'Briefmarken sind kleine Kunstwerke.', 'Ich trage täglich 100 Briefe aus.']],
  ['Pirat Pit', ['Arrr! Ich suche den Schatz der Insel. 🏴‍☠️', 'Am Strand steht ein Piratenschiff – mit Kanonen!', 'Ein Pirat ist auch nur ein Kind mit Papphut.']],
  ['Zauberer Zarino', ['Abrakadabra – und schon ist ein Stern da! ✨', 'Zaubern ist 90 Prozent Übung und 10 Prozent Tricks.', 'Wer lächelt, zaubert Freude.']]
);
BI.TALK.kids.push(
  ['Anna', ['Ich habe eine Sandburg gebaut – mit Turm! 🏰', 'Magst du mit mir schaukeln?', 'Wippen geht nur zu zweit!']],
  ['Ben', ['Ich bin schneller als ein Hubschrauber! 🚁 Na ja, fast.', 'Hast du schon die Zuckerwatte probiert?', 'Ich möchte später Zugführer werden.']],
  ['Clara', ['Meine Lieblingsfarbe ist Regenbogen. 🌈', 'Ich male jeden Tag ein Bild.', 'Weißt du, wie Pferde schlafen? Im Stehen!']],
  ['David', ['Mein Fahrrad hat drei Gänge. 🚲', 'Ich übe gerade Einrad fahren.', 'Fang mich, fang mich!']],
  ['Ella', ['Wusstest du, dass Delfine miteinander sprechen? 🐬', 'Ich mag Pfannkuchen mit Zucker.', 'Wir spielen Verstecken – du darfst suchen!']],
  ['Felix', ['Ich habe einen Frosch gefunden! 🐸 Quaak!', 'Beim Hüpfen auf dem Trampolin kann ich fast fliegen.', 'Heute Abend gibt es Feuerwerk, glaub ich.']],
  ['Greta', ['Schau, ich habe ein Vierblättriges Kleeblatt! 🍀', 'Ich möchte einen Hund. Oder einen Hamster.', 'Wollen wir Seilspringen?']],
  ['Hannes', ['Was ist grün und hüpft über die Wiese? Ein Gras-hüpfer! 🦗', 'Meine Katze heißt Wolke.', 'Ich kann pfeifen – hör mal!']],
  ['Ida', ['Heute bin ich Prinzessin. 👑', 'Meine Puppe hat ein Kleid aus Seide.', 'Ich tanze gern – tanz mit mir!']],
  ['Jakob', ['Ich baue ein Raumschiff aus Kartons. 🚀', 'Drei, zwei, eins – Start!', 'Weißt du, wie viele Monde der Mars hat? Zwei!']],
  ['Klara', ['Im Wald gibt es Kämpfe – aber nur im Verbotenen Wald! ⚔️', 'Ich passe auf meinen kleinen Bruder auf.', 'Magst du Gummibärchen?']],
  ['Leo', ['Ich bin ein Löwe! Rooaar! 🦁', 'Mein Papa kocht die beste Nudelsuppe.', 'Ich zähle gern Sterne – schon 15 heute!']],
  ['Marie', ['Ich lerne Klavier – spiel doch mit mir! 🎹', 'Hast du das Lied „Alle meine Entchen“ geübt? C D E F G G.', 'Meine Lieblingstiere sind Hasen.']],
  ['Noah', ['Ich habe Hunger! Hast du einen Keks? 🍪', 'Das Taxi ist gelb – sieht man sofort!', 'Heute wird ein toller Tag!']],
  ['Olivia', ['Ich mag das Planschbecken. 💦', 'Wer zuerst unten an der Rutsche ist, gewinnt!', 'Meine Schwester kann einen Handstand.']],
  ['Paul', ['Ich bin Feuerwehrmann – tatütata! 🚒', 'Ich rette Katzen aus Bäumen.', 'Wasser marsch!']]
);
/* Allgemeiner Plausch + Tipps fürs Spiel – wird gern zwischen die persönlichen Sätze gemischt */
BI.TALK.chat = [
  'Schönes Wetter heute, oder? ☀️', 'Hast du schon das Feuerwerk ausprobiert? 🎆 Schau einfach in den Himmel!', 'Im Park gibt es eine Schaukel, eine Rutsche und ein Trampolin. 🛝',
  'Hast du die Häuser schon besucht? Du kannst überall hineingehen! 🏠', 'In der Stadt gibt es acht verschiedene Läden. 🛒', 'Ich liebe diese Insel!', 'Kennst du schon den Verbotenen Wald? Nur dort darf man kämpfen. ⚔️',
  'Sammle die goldenen Sterne – sie liegen überall herum. ⭐', 'Wenn du in ein Auto steigst, fragt dich das Spiel, ob du einen Auftrag annehmen willst.', 'Das gelbe Auto mit dem Dachschild ist ein Taxi! 🚕',
  'Mit dem Zug kannst du einmal um die Insel fahren. 🚂', 'Im Camp erzählt man Geschichten am Lagerfeuer. 🔥', 'Kennst du schon den Streichelzoo? Da gibt es Kühe, Schafe und Ziegen!', 'Die Knöpfe A, B, X und Y sind auf dem Bildschirm wie bei einer Spielkonsole angeordnet. 🎮',
  'Hast du schon einen Baum gehauen? Wenn er umkippt, ruf laut TIMBER! 🌳', 'Ein Lächeln kostet nichts und macht andere froh. 😊', 'Hallo! Schön, dass du da bist!', 'Gleich gibt es Mittagessen, glaube ich.', 'Heute habe ich schon viel erlebt!',
  'Wusstest du, dass der Mond immer dasselbe Gesicht zeigt? 🌙', 'Im Freibad kannst du rutschen und tauchen. 🏊', 'Kennst du den Trick mit dem Fahrrad? Einfach schneller treten!', 'Wenn du müde bist, schlaf in einem Bett – in jedem Haus steht eins. 🛏️',
  'Möchtest du dir meinen Hut ausleihen? Besser nicht … 🎩', 'Weißt du, wer die schnellste Schnecke der Welt ist? Ich nicht. 🐌', 'Mein Lieblingsplatz ist die Bank im Park.', 'Lass uns Freunde sein! 🤝'
];
/* Passende Sätze zur Lage: Tageszeit, Wetter, Sterne – env = { night, kind ('rain'|'snow'|'clear'|'cloudy'), stars, name } */
BI.TALK.ctx = function (env) {
  const pick = a => a[(Math.random() * a.length) | 0], out = [];
  if (env.night) out.push('Es ist schon dunkel. Gute Nacht, bald! 🌙', 'Hörst du die Grillen? Nachts ist es besonders still.', 'Bei Nacht sieht man die Sterne am Himmel funkeln. ✨');
  else out.push('Die Sonne scheint – ein richtig guter Tag! ☀️', 'Morgens ist die Luft am frischesten.');
  if (env.kind === 'rain') out.push('Es regnet! Hast du einen Schirm? ☔', 'Nach dem Regen kommt manchmal ein Regenbogen. 🌈', 'Die Pfützen sind perfekt zum Reinspringen!');
  else if (env.kind === 'snow') out.push('Es schneit! Schneemänner bauen? ⛄', 'Brrr, ist das kalt. Mütze auf! 🧣');
  else if (env.kind === 'cloudy') out.push('Heute ist es bewölkt. Vielleicht kommt gleich Regen.');
  if (env.stars >= 100) out.push('Wow, du hast ' + env.stars + ' Sterne – du bist ein Superstar! 🌟');
  else if (env.stars >= 20) out.push('Du hast schon ' + env.stars + ' Sterne gesammelt. Weiter so! ⭐');
  else out.push('Hast du schon Sterne gesammelt? Die liegen überall herum. ⭐');
  return pick(out);
};
