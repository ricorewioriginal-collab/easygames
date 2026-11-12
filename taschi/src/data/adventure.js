// Abenteuer-Inhalte: Gilden-Hinterhalte auf den Routen, Ankunfts-Szenen je
// Region, Agentin Juna und ihre Gildenspuren sowie gestufte Rätselhinweise.
// {mon} wird durch das gefangene Taschi ersetzt.

// Hinterhalte in allen Regionen ohne Gildenlager – die Schattengilde ist so
// ab der ersten Route ständig präsent. member bestimmt Aussehen und Name.
export const AMBUSHES = {
  0: {
    title: 'Hilferufe am Südpfad', member: 'grunt', where: 'Südpfad',
    intro: [
      { who: 'Erzähler', text: 'Vom Südpfad hallt ein klägliches Fiepen herüber. Ein Netz zappelt im Gras!', mood: 'surprised' },
      { who: 'Gildenhelfer', text: 'Halt still, du kleines {mon}! Kommandantin Varga will jedes Taschi in diesem Tal gezählt und gefangen.', mood: 'angry' },
      { who: 'Gildenhelfer', text: 'Hä? Ein Kind mit Taschi-Kapsel? Ulme schickt jetzt schon Kinder? Dann zeig mal, was du kannst!', mood: 'angry' }
    ],
    win: [
      { who: 'Gildenhelfer', text: 'Autsch! Das war … nicht Teil des Plans.', mood: 'sad' },
      { who: 'Kommandantin Varga', text: '(Aus dem Funkgerät:) Bericht. Wieso höre ich Kampfgeräusche?', mood: 'angry' },
      { who: 'Gildenhelfer', text: 'Ä-äh, Kommandantin! Ein Trainer aus Sonnenhain! Ich ziehe mich zurück!', mood: 'worried' },
      { who: 'Erzähler', text: 'Der Helfer flieht. Über den Wipfeln gleitet ein violett-oranger Ballon nach Norden. Das befreite {mon} hüpft dankbar zurück ins Gras.', mood: 'talk' }
    ]
  },
  1: {
    title: 'Netze im Hafen', member: 'kett', format: 'double', where: 'Hafenweg',
    intro: [
      { who: 'Kett', text: 'Kora! Das {mon} hier ist perfekt für Vargas Liste!', mood: 'happy' },
      { who: 'Kora', text: 'Sei leise, Kett! Da steht jemand. Mit … einem Taschi. Und einem sehr entschlossenen Blick.', mood: 'surprised' },
      { who: 'Kett', text: 'Wir sind Kett und Kora, die besten Fänger der Schattengilde! Zu zweit sind wir unschlagbar!', mood: 'angry' }
    ],
    win: [
      { who: 'Kora', text: 'Unschlagbar, hast du gesagt?!', mood: 'angry' },
      { who: 'Kett', text: 'Zu zweit gegen eins! Das war unfair … für uns irgendwie.', mood: 'sad' },
      { who: 'Erzähler', text: 'Die Zwillinge rennen davon und lassen das Netz fallen. Das {mon} schüttelt sich und springt zurück ins Wasser.', mood: 'talk' }
    ]
  },
  3: {
    title: 'Geisterfang unter Kirschblüten', member: 'grunt', where: 'Kirschweg',
    intro: [
      { who: 'Gildenhelfer', text: 'Selma will schimmernde Geister für ihre Sammlung. Dieses {mon} leuchtet so schön …', mood: 'happy' },
      { who: 'Gildenhelfer', text: 'Du schon wieder! Die ganze Gilde redet von dir. Na warte!', mood: 'angry' }
    ],
    win: [
      { who: 'Gildenhelfer', text: 'Selma wird mich zu Konfetti verarbeiten …', mood: 'worried' },
      { who: 'Erzähler', text: 'Das {mon} schwebt aus dem Käfig und verschwindet kichernd zwischen den Blüten.', mood: 'talk' }
    ]
  },
  5: {
    title: 'Eierdiebe an der Klippe', member: 'grunt', format: 'double', where: 'Klippenpfad',
    intro: [
      { who: 'Gildenhelfer', text: 'Schnell, pack die Nester ein! Flug-Taschis bringen bei Varga extra Punkte.', mood: 'talk' },
      { who: 'Gildenhelferin', text: 'Wir sind zu zweit, du bist allein. Mathe ist auf unserer Seite!', mood: 'angry' }
    ],
    win: [
      { who: 'Gildenhelferin', text: 'Mathe hat uns verraten …', mood: 'sad' },
      { who: 'Erzähler', text: 'Ein aufgeregtes {mon} kreist über dir, als die Nester sicher zurück an der Klippe liegen.', mood: 'happy' }
    ]
  },
  7: {
    title: 'Störsender unter den Sternen', member: 'grunt', where: 'Sternenweg',
    intro: [
      { who: 'Gildenhelfer', text: 'Der Sender stört das Teleskop. Niemand soll sehen, wie das Licht flackert.', mood: 'talk' },
      { who: 'Brix', text: '(Hinter einem Felsen, leise:) Das … das war nicht abgesprochen. Wieso sperrt ihr ein {mon} in den Sender?', mood: 'worried' },
      { who: 'Gildenhelfer', text: 'Klappe, Brix! Und du da – verschwinde, oder ich mache dich zum Versuchsobjekt!', mood: 'angry' }
    ],
    win: [
      { who: 'Brix', text: 'Du hast den Sender abgeschaltet … Danke. Ich hätte es selbst tun sollen.', mood: 'sad' },
      { who: 'Erzähler', text: 'Brix verschwindet in der Dunkelheit. Das befreite {mon} blinzelt in den Sternenhimmel.', mood: 'talk' }
    ]
  },
  9: {
    title: 'Der Eisbohrer', member: 'kett', format: 'double', where: 'Frostpfad',
    intro: [
      { who: 'Kora', text: 'Bohren, Kett! Unter dem Eis schlafen Taschis mit reiner Kälteenergie.', mood: 'talk' },
      { who: 'Kett', text: 'Mir ist kalt, Kora. Und da kommt schon wieder unser Lieblingsproblem.', mood: 'worried' },
      { who: 'Kora', text: 'Diesmal haben wir trainiert! In einer Kühltruhe!', mood: 'angry' }
    ],
    win: [
      { who: 'Kett', text: 'Die Kühltruhe hat nicht gereicht.', mood: 'sad' },
      { who: 'Erzähler', text: 'Der Bohrer verstummt. Ein verschlafenes {mon} krabbelt aus dem Eisloch und schnaubt die Zwillinge an.', mood: 'talk' }
    ]
  },
  11: {
    title: 'Blitzfalle in der Steppe', member: 'grunt', format: 'double', where: 'Steppenweg',
    intro: [
      { who: 'Gildenhelfer', text: 'Die Batterie ist fast voll. Noch ein {mon}, dann ist die Lieferung für den Sternengipfel komplett.', mood: 'happy' },
      { who: 'Kommandantin Varga', text: '(Als Lichtbild über der Batterie:) Wieder du. Du kämpfst für Lichter, die ohnehin erlöschen. Halte sie auf!', mood: 'angry' }
    ],
    win: [
      { who: 'Kommandantin Varga', text: '(Das Lichtbild flackert:) Eine Batterie weniger. Ich habe hundert weitere.', mood: 'talk' },
      { who: 'Erzähler', text: 'Die Batterie entlädt sich in einem harmlosen Funkenregen. Das {mon} galoppiert frei über die Steppe.', mood: 'happy' }
    ]
  },
  13: {
    title: 'Jagd auf einen Verräter', member: 'grunt', format: 'double', where: 'Gezeitenweg',
    intro: [
      { who: 'Gildenhelfer', text: 'Brix muss hier irgendwo sein. Wer ihn findet, kriegt Vargas Lob!', mood: 'talk' },
      { who: 'Gildenhelferin', text: 'Bis dahin nehmen wir dieses {mon} als Köder. Und dich halten wir auch auf!', mood: 'angry' }
    ],
    win: [
      { who: 'Gildenhelferin', text: 'Rückzug! Melde, dass Brix Hilfe hat!', mood: 'worried' },
      { who: 'Erzähler', text: 'Das {mon} taucht in die silberne Brandung. In der Ferne siehst du Brix kurz winken – dann ist er verschwunden.', mood: 'talk' }
    ]
  },
  15: {
    title: 'Vorhut vor dem Gipfel', member: 'kett', format: 'double', where: 'Wolkenweg',
    intro: [
      { who: 'Kora', text: 'Kett, das ist er. Der Grund, warum wir sechzehnmal verloren haben.', mood: 'worried' },
      { who: 'Kett', text: 'Fünfzehnmal! Heute nicht. Varga braucht dieses {mon} für die Maschine!', mood: 'angry' }
    ],
    win: [
      { who: 'Kora', text: 'Sechzehnmal, Kett.', mood: 'sad' },
      { who: 'Kett', text: 'Weißt du was, Kora? Vielleicht sind wir auf der falschen Seite.', mood: 'sad' },
      { who: 'Erzähler', text: 'Die Zwillinge sehen sich lange an und lassen das {mon} frei. Hoch über den Wolken glüht der Sternengipfel.', mood: 'talk' }
    ]
  }
};

// Ankunft in einer neuen Region – kurze Zwischensequenz über der Stadt.
export const ARRIVALS = [
  null,
  'Salzige Luft, kreischende Möwen: Perlenhafen. Hier hat die Schattengilde angeblich Netze ausgelegt.',
  'Die Windräder des Funkenfelds surren unruhig. Jemand zapft die Gewitterenergie ab.',
  'Rosa Blüten schweben durch die Luft. In den Kirschbäumen des Blütenhains kichern Geister.',
  'Der Käferwald verschluckt das Tageslicht. Irgendwo knackt ein Ast – du bist nicht allein.',
  'Sturmböen zerren an deiner Jacke. Auf der Sturmklippe hält nur, wer fest steht.',
  'Hitze flimmert über dem Glutland. Am Fuß des Glutkegels brummt etwas, das kein Vulkan ist.',
  'Die Sternenau liegt still. Über dir flackert eines der sechzehn Lichter.',
  'Nebel kriecht über die Stege. Im Nebelmoor verschwinden Wege – und manchmal Menschen.',
  'Dein Atem gefriert. Das Eis des Spiegelsees singt ein Lied, das nach Warnung klingt.',
  'Hängebrücken schwingen hoch über dem Boden. Im Wipfelreich lebt alles in den Baumkronen.',
  'Donner rollt über die Steppe. Blitze schlagen in Kupferstäbe – und in Batterien der Gilde.',
  'Kristalle summen in den Felswänden. Ihre Energie ist genau das, was Varga sucht.',
  'Silbernes Mondlicht spiegelt sich in der Bucht. Die Gezeiten flüstern von einem Verräter.',
  'Die Sonne brennt auf goldene Treppen. Auf der Sonnenhöhe kreist eine uralte Legende.',
  'Wolkeninseln, Sternenstaub, eisige Höhe. Himmelskrone – das letzte Tor vor dem Sternengipfel.'
];

// Agentin Juna von der Sternenwacht verfolgt die Gilde durch alle Regionen.
// Ihre Gildennotizen erzählen nach und nach Vargas Geschichte.
export const JUNA = {
  name: 'Agentin Juna',
  intro: 'Psst! Juna, Sternenwacht. Ich jage die Schattengilde. Sie verliert überall Notizen – such mir eine, dann erzähle ich dir, was drinsteht.',
  notes: [
    'Notiz: „Moostal – Zählung beginnen. Jedes Taschi erfassen. – V.“ Varga plant schon lange.',
    'Notiz: „Kett & Kora: Netze NICHT im Hafenbecken vergessen!“ Darunter, krakelig: „Haben wir aber.“',
    'Notiz: „Windradfeld: Energie reicht für 3 Kristalle.“ Kristalle? Die Gilde speichert Energie.',
    'Notiz: „Selma, keine Glitzergeister mehr für deine Sammlung. Wir brauchen Energie, kein Deko!“',
    'Notiz: „Fanggerät Modell B – entworfen von Brix.“ Daneben ein kleines gezeichnetes Herz für Schnurrik.',
    'Notiz: „Die Lichter verlieren jedes Jahr an Kraft. Ich habe es gemessen. Niemand glaubt mir. – V.“',
    'Notiz: „Projekt Lichtspeicher. Ziel: alle 16 Lichter in Kristalle leiten, bevor sie verlöschen.“',
    'Notiz: „Brix zögert. Beobachten.“ Varga traut ihren eigenen Leuten nicht.',
    'Ein Tagebuchblatt: „Als Kind sah ich ein Licht erlöschen. Danach wurde mein Dorf dunkel. Nie wieder.“ – Varga',
    'Notiz: „Kälteenergie stabilisiert die Kristalle.“ Darum bohrt die Gilde im Eis.',
    'Notiz: „Selma kündigt bald. Ersatz suchen.“ Die Gilde bröckelt.',
    'Lieferschein: „47 Batterien → Sternengipfel.“ Der Gipfel ist ihr Ziel.',
    'Notiz: „Kristalllager voll. Maschine bereit zum Test.“ Die Zeit wird knapp.',
    'Notiz: „Brix ist geflohen. Zugangskarte gesperrt? NEIN – er hat noch eine Kopie!“',
    'Notiz: „Wenn die Lichter in der Maschine sind, bestimme ich, wo es hell wird. – V.“',
    'Letzte Notiz, in zitternder Schrift: „Was, wenn die Lichter gar nicht sterben – sondern nur Vertrauen brauchen?“ – V.'
  ],
  thanks: [
    'Gute Arbeit, Partner. Jede Notiz bringt uns näher an Vargas Plan.',
    'Ich schreibe das in meinen Bericht für die Sternenwacht. Wir sehen uns in der nächsten Region!'
  ]
};

// Gestufte Hinweise je Rätselart (1. Stufe ist der Regionstext).
export const PUZZLE_TIPS = {
  runes: ['Sieh dir jedes Wandbild an und merke dir die Reihenfolge der Zeichen.', 'Jeder Runenstein gehört zu genau einem Bild. Dreh ihn so oft, bis Farbe und Form passen.'],
  switches: ['Ein Hebel schaltet sich selbst und die direkten Nachbarn um.', 'Arbeite dich von einer Seite zur anderen: Schalte immer den Nachbarn einer dunklen Laterne.'],
  plates: ['Schieb die Blöcke nur, wenn dahinter Platz ist – sonst steckst du fest.', 'Mit dem Rücksetzhebel fängst du von vorne an. Plane erst den Block, der am weitesten weg ist.'],
  order: ['Zähl die Punkte auf jeder Laterne genau.', 'Tritt die Platten von der kleinsten zur größten Zahl. Ein Fehler setzt alles zurück.'],
  maze: ['Leuchtende Blätter markieren den richtigen Weg.', 'Bleib dicht an den glimmenden Blättern. Sackgassen haben nie ein leuchtendes Blatt.'],
  crystals: ['Ein Spiegel lenkt das Licht um 90 Grad.', 'Verfolge den Strahl vom Ursprung aus und dreh immer den ersten Spiegel, an dem er vorbeigeht.'],
  ice: ['Eis rutscht, bis es an etwas stößt. Nutze Felsen als Bremse.', 'Mit dem Rücksetzhebel fängst du neu an. Schieb zuerst die Blöcke, die direkt auf eine Platte rutschen können.']
};
