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
