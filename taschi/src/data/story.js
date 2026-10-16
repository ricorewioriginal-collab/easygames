// Story scripts. Lines are { who, text, mood } – mood drives the speaker's
// dialogue animation (talk, happy, worried, angry, surprised, sad).

export const CHAPTERS = [
  { title: 'Das Erwachen', text: 'Über Sonnenhain verblasst das uralte Himmelslicht. Professor Ulme bittet dich, die sechzehn Licht-Siegel zusammenzuführen – und die Schattengilde stiehlt Taschis in allen Regionen. Dein Rivale Rian will dir dabei unbedingt zuvorkommen.' },
  { title: 'Funken im Feld', text: 'Im Funkenfeld hast du die Schattengilde zum ersten Mal gestellt. Ihre Fanggeräte saugen Energie aus wilden Taschis. Was haben sie vor?' },
  { title: 'Die Station im Glutkegel', text: 'In der Forschungsstation im Glutland arbeitet der Tüftler Brix an einer Maschine, die Licht speichern soll. Kommandantin Varga treibt das Projekt voran.' },
  { title: 'Risse im Nebel', text: 'Brix zweifelt. Varga will die sechzehn Lichter in Kristallen bündeln und kontrollieren. Die Professoren der Regionen schließen sich zusammen – und auch Rian hat erfahren, wie skrupellos die Gilde ist.' },
  { title: 'Der Weg zum Sternengipfel', text: 'Mit Brix’ Zugangskarte kannst du die Sperre am Sternengipfel lösen. Varga wartet dort mit ihrer Maschine.' },
  { title: 'Die Sternenliga', text: 'Die Lichter leuchten wieder. Nun warten die fünf Meisterprüfungen der Sternenliga auf dich.' },
  { title: 'Sternenmeister', text: 'Du bist Sternenmeister. Die Legenden der vier Wächter, stärkere Champions und ein vollständiger Taschidex warten.' }
];

export const INTRO_SLIDES = [
  { title: 'Die Welt der Taschis', text: 'Sechzehn Regionen, sechzehn Lichter. Seit Jahrhunderten leben Menschen und Taschis hier Seite an Seite – in Tälern, Küsten, Wäldern und über den Wolken.' },
  { title: 'Die Licht-Siegel', text: 'In jeder Region hütet eine Arena ein Licht-Siegel. Wer alle sechzehn sammelt, darf sich der Sternenliga stellen.' },
  { title: 'Ein Schatten zieht auf', text: 'Doch die Lichter flackern. Ein violett-orangefarbener Ballon wurde über den Feldern gesehen. Taschis verschwinden.' },
  { title: 'Sonnenhain', text: 'Deine Reise beginnt in Sonnenhain im Moostal. Professor Ulme erwartet dich vor seiner gläsernen Kuppel.' }
];

export const ULME = {
  greet: [
    { who: 'Professor Ulme', text: 'Da bist du ja! Willkommen in Sonnenhain. Ich bin Professor Ulme – ich erforsche die Bindung zwischen Menschen und Taschis.', mood: 'happy' },
    { who: 'Professor Ulme', text: 'Taschis sind Wesen, die in Wiesen, Meeren, Wäldern und sogar in den Wolken leben. Mit einem Taschiball kannst du ein Taschi einladen, dich zu begleiten.', mood: 'talk' },
    { who: 'Professor Ulme', text: 'Aber hör gut zu: Die sechzehn Lichter am Himmel werden schwächer. Und seit Wochen fängt eine Bande namens Schattengilde wilde Taschis ein.', mood: 'worried' },
    { who: 'Professor Ulme', text: 'Ich brauche jemanden, der durch alle Regionen reist, die Licht-Siegel sammelt und herausfindet, was die Gilde vorhat.', mood: 'talk' },
    { who: 'Professor Ulme', text: 'Unter meiner Glaskuppel liegen drei Taschibälle auf dem Podest. Geh hinein und sieh sie dir einzeln an. Wähle mit dem Herzen!', mood: 'happy' }
  ],
  reminder: [{ who: 'Professor Ulme', text: 'Das Podest steht unter der Glaskuppel. Untersuche die drei Taschibälle!', mood: 'talk' }],
  afterStarter: [
    { who: 'Professor Ulme', text: 'Wunderbar! Ihr beide passt hervorragend zusammen.', mood: 'happy' },
    { who: 'Professor Ulme', text: 'Oh! Hörst du das? Im Beet vor der Kuppel raschelt es. Ein wildes Taschi! Zeig mir, wie ihr zusammen kämpft!', mood: 'surprised' }
  ],
  afterBattle: [
    { who: 'Professor Ulme', text: 'Großartig gemacht! Du hast ein echtes Gespür für Taschis.', mood: 'happy' },
    { who: 'Professor Ulme', text: 'Hier sind fünf Taschibälle, zwei Heilbälle, drei Tränke und die Pfadkarte. Im Laden gibt es mit jedem Siegel neue Ballsorten – jede hat ihre Stärke.', mood: 'talk' },
    { who: 'Professor Ulme', text: 'Dein erster Auftrag: Löse das Mühlstein-Rätsel an der alten Wassermühle, dann öffnet Fels-Fiete seine Arena. Und fang unterwegs ein paar Taschis für deinen Taschidex!', mood: 'talk' },
    { who: 'Professor Ulme', text: 'Wenn du Hilfe brauchst: Im Heilzentrum werden deine Taschis versorgt, im Laden gibt es Ausrüstung. Viel Glück!', mood: 'happy' }
  ]
};

// Regional professors: introduction (regional info), research request and
// story-dependent remarks.
export const PROFESSORS = [
  { intro: 'Das Moostal ist sanft, aber nicht langweilig. Pflanzen- und Normal-Taschis leben hier eng beieinander – manche teilen sich sogar Nester.' },
  { intro: 'Ich bin Marea. Die Korallküste lebt von ihren Strömungen. Wasser- und Flug-Taschis folgen ihnen wie Reisende einer Straße. Der Leuchtturm zeigt dir den Weg.' },
  { intro: 'Volt mein Name, Professor Volt! Im Funkenfeld lädt sich jedes Gewitter in den Elektro-Taschis auf. Leider zapft jemand diese Energie gerade ab …' },
  { intro: 'Willkommen im Blütenhain. Ich bin Liora. Hier ist die Grenze zwischen Diesseits und Geisterwelt dünn – Geist-Taschis wohnen in den Kirschbäumen.' },
  { intro: 'Bork. Professor. Insekten. Wald. Mehr muss man nicht wissen. Gut, vielleicht noch: Im Käferwald verschwinden Taschis aus ihren Nestern.' },
  { intro: 'Hier oben auf der Sturmklippe zählt jeder Aufwind. Ich bin Professorin Aeris und studiere, wie Flug-Taschis die Gewitterfronten lesen.' },
  { intro: 'Ignis. Vulkanologe. Im Glutland ist der Boden selbst lebendig. Und seit kurzem brummt der Glutkegel – das ist nicht natürlich.' },
  { intro: 'Ich bin Nova. In der Sternenau beobachten wir die sechzehn Lichter. Eines davon flackert seit deinem Aufbruch immer stärker.' },
  { intro: 'Professor Nebel. Ja, wirklich. Das Nebelmoor verbirgt mehr, als es zeigt: Wege, Irrlichter und manchmal auch Menschen, die nicht gefunden werden wollen.' },
  { intro: 'Fjella, Eisforscherin. Im Frosttal gibt es Eis-Taschis, die nirgendwo sonst leben. Pass auf den Spiegelsee auf – das Eis singt, bevor es bricht.' },
  { intro: 'Ich bin Linde. Im Wipfelreich lebt alles in den Baumkronen. Pflanzen- und Flug-Taschis helfen einander – eine perfekte Symbiose.' },
  { intro: 'Tessa, Wetterforscherin. Die Donnersteppe ist das gewitterreichste Land der Welt. Die Gilde sammelt hier Blitze in Batterien.' },
  { intro: 'Professor Granit. Kristalle speichern Energie – das weiß jedes Kind im Kristallberg. Und genau das nutzt die Gilde aus.' },
  { intro: 'Luna. In der Mondbucht bestimmt der Mond die Gezeiten – und die Gezeiten bestimmen die Geist-Taschis. Der Mondbogen ist uralt.' },
  { intro: 'Solan! Auf der Sonnenhöhe misst man die Kraft der Sonne. Auraflamme, die Legende, soll über dem Tempel kreisen.' },
  { intro: 'Ich bin Astra, Hüterin der Chronik der Sternenliga. Himmelskrone ist das Tor zum Sternengipfel. Dort oben entscheidet sich alles.' }
];

export function professorLines(region, save, regionData) {
  const p = PROFESSORS[region.id] || PROFESSORS[0];
  const name = regionData.professor.title;
  const beaten = save.champions[region.id];
  const badge = save.badges > region.id;
  const lines = [];
  if (!save.flags['prof:' + region.id]) {
    lines.push({ who: name, text: p.intro, mood: 'happy' });
    lines.push({ who: name, text: 'Mein Fachgebiet: ' + regionData.professor.focus + '. Wenn du mir hilfst, helfe ich dir.', mood: 'talk' });
  } else if (beaten) lines.push({ who: name, text: 'Champion von ' + regionData.name + '! Die Forschung hier verdankt dir viel. Die nächste Region wartet auf dich.', mood: 'happy' });
  else if (badge) lines.push({ who: name, text: 'Mit dem Siegel in der Tasche wartet ' + regionData.champion.name + ' auf dich. Der Pavillon des Champions liegt auf dem Hügel.', mood: 'talk' });
  else lines.push({ who: name, text: 'Hast du schon das Rätsel „' + regionData.puzzle.name + '“ gesehen? ' + regionData.puzzle.hint, mood: 'talk' });
  return lines;
}

// Schattengilde – scenes per site (index matches region.guild).
export const GUILD_SCENES = [
  { // Funkenfeld
    title: 'Fangnetze im Windradfeld',
    intro: [
      { who: 'Kett', text: 'Kora, da kommt jemand!', mood: 'surprised' },
      { who: 'Kora', text: 'Seh ich selbst, Kett. Hey du! Das hier ist ein … äh … wissenschaftliches Sperrgebiet!', mood: 'angry' },
      { who: 'Kett', text: 'Genau! Die Knister hier gehören jetzt der Schattengilde. Befehl von Kommandantin Varga!', mood: 'talk' }
    ],
    win: [
      { who: 'Kora', text: 'Das war deine Schuld, Kett!', mood: 'angry' },
      { who: 'Kett', text: 'MEINE Schuld? Du hast den Ballon falsch geparkt! Rückzug!', mood: 'angry' },
      { who: 'Erzähler', text: 'Die Zwillinge flüchten zum violett-orangen Ballon. Du öffnest das Fanggerät – die Knister springen funkelnd davon.', mood: 'talk' }
    ]
  },
  { // Käferwald
    title: 'Käfige im Unterholz',
    intro: [
      { who: 'Selma', text: 'Ah, ein Publikum! Wie entzückend. Ich bin Selma, Sammlerin seltener Schönheiten.', mood: 'happy' },
      { who: 'Selma', text: 'Diese Käferli und Vogelnester sind für die Forschung der Gilde. Ein glänzendes Federkleid für jede meiner Sammlungen!', mood: 'talk' }
    ],
    win: [
      { who: 'Selma', text: 'Meine Frisur! Mein Auftritt! Das wird Varga gar nicht gefallen …', mood: 'angry' },
      { who: 'Erzähler', text: 'Selma flieht. Du öffnest die Käfige, und die Taschis summen erleichtert zurück in den Wald.', mood: 'talk' }
    ]
  },
  { // Glutland – research station
    title: 'Die Forschungsstation',
    intro: [
      { who: 'Brix', text: 'O-oh. Du darfst nicht hier sein. Niemand darf hier sein. Außer mir. Und Schnurrik.', mood: 'worried' },
      { who: 'Brix', text: 'Diese Maschine speichert Licht in Kristallen. Varga sagt, damit retten wir die Welt, wenn die Lichter erlöschen …', mood: 'sad' },
      { who: 'Brix', text: 'Aber dafür brauchen wir die Energie von hunderten Taschis. Ich … ich muss dich aufhalten. Schnurrik, bitte!', mood: 'worried' }
    ],
    win: [
      { who: 'Brix', text: 'Du kämpfst, als ob dir deine Taschis wirklich etwas bedeuten …', mood: 'sad' },
      { who: 'Brix', text: 'Schnurrik mag dich. Es mag sonst niemanden. Das gibt mir zu denken.', mood: 'talk' },
      { who: 'Erzähler', text: 'Brix schaltet die Maschine ab und verschwindet mit Schnurrik durch einen Seitengang. Die gefangenen Feuer-Taschis sind frei.', mood: 'talk' }
    ]
  },
  { // Nebelmoor
    title: 'Begegnung am Stelzensteg',
    intro: [
      { who: 'Kommandantin Varga', text: 'Brix hat Notizen verloren und gezögert. Und du bist der Grund dafür, nicht wahr?', mood: 'angry' },
      { who: 'Kommandantin Varga', text: 'Ich bin Varga. Die Lichter sterben, Kind. Wenn niemand sie bündelt und bewahrt, erlischt alles. Ich tue, was nötig ist.', mood: 'talk' },
      { who: 'Kommandantin Varga', text: 'Geh mir aus dem Weg – oder ich zeige dir, wie Entschlossenheit aussieht.', mood: 'angry' }
    ],
    win: [
      { who: 'Kommandantin Varga', text: 'Interessant. Du bist stärker als erwartet. Das ändert nichts.', mood: 'talk' },
      { who: 'Kommandantin Varga', text: 'Am Ende werden alle verstehen, dass ich recht habe.', mood: 'angry' },
      { who: 'Erzähler', text: 'Varga steigt in den Ballon. Brix bleibt am Steg zurück und starrt ins Wasser.', mood: 'talk' }
    ]
  },
  { // Wipfelreich
    title: 'Der Ballon im Weltenbaum',
    intro: [
      { who: 'Selma', text: 'Du schon wieder! Siehst du nicht, dass ich hier festhänge? Mein Ballon! Mein wunderschöner Ballon!', mood: 'angry' },
      { who: 'Selma', text: 'Wenn ich schon hier oben bin, nehme ich wenigstens die schönsten Nester mit. Aus dem Weg!', mood: 'talk' }
    ],
    win: [
      { who: 'Selma', text: 'Na schön. Ich gebe auf. Für heute. Aber merk dir: Varga hat einen Plan für den Sternengipfel.', mood: 'sad' },
      { who: 'Erzähler', text: 'Die Nester sind gerettet. Selma klettert schimpfend vom Weltenbaum.', mood: 'talk' }
    ]
  },
  { // Kristallberg
    title: 'Das versteckte Lager',
    intro: [
      { who: 'Kett', text: 'Kora! Der schon wieder!', mood: 'surprised' },
      { who: 'Kora', text: 'Dieses Lager ist streng geheim. Hier speichern wir das Licht für Vargas großen Plan!', mood: 'angry' },
      { who: 'Kett', text: 'Psst! Das war geheim!', mood: 'angry' }
    ],
    win: [
      { who: 'Kora', text: 'Wir sagen jetzt gar nichts mehr. Außer: Der Sternengipfel! Ups.', mood: 'surprised' },
      { who: 'Erzähler', text: 'Du findest Kisten voller Lichtkristalle und befreist die Gestein-Taschis, die sie bewacht haben.', mood: 'talk' }
    ]
  },
  { // Sonnenhöhe
    title: 'Brix’ Entscheidung',
    intro: [
      { who: 'Brix', text: 'Du! Bitte, hilf mir! Ich habe die Gilde verlassen. Selma soll mich zurückbringen!', mood: 'worried' },
      { who: 'Selma', text: 'Verräter! Varga will ihre Zugangskarte zurück. Und dich gleich mit!', mood: 'angry' }
    ],
    win: [
      { who: 'Selma', text: 'Das … war mein letzter Auftritt für die Gilde. Ich gehe in den Ruhestand. Mit Stil.', mood: 'sad' },
      { who: 'Brix', text: 'Danke. Hier – Brix’ Zugangskarte. Damit lässt sich die Sperre am Sternengipfel lösen.', mood: 'happy' },
      { who: 'Brix', text: 'Varga will alle sechzehn Lichter in ihre Maschine leiten. Wenn sie es schafft, erlöschen sie für immer. Du musst sie aufhalten!', mood: 'worried' }
    ]
  },
  { // Sternengipfel – finale
    title: 'Die Maschine am Sternengipfel',
    intro: [
      { who: 'Kommandantin Varga', text: 'Du bist also tatsächlich gekommen. Sechzehn Siegel. Beeindruckend.', mood: 'talk' },
      { who: 'Kommandantin Varga', text: 'Sieh dir die Lichter an: Sie flackern. Meine Maschine bewahrt sie, bevor sie verlöschen. Und wer sie bewahrt, bestimmt über sie.', mood: 'angry' },
      { who: 'Kommandantin Varga', text: 'Genug geredet. Zeig mir, ob deine Bindung stärker ist als meine Entschlossenheit!', mood: 'angry' }
    ],
    win: [
      { who: 'Kommandantin Varga', text: 'Wie … wie können sie so hell leuchten? Die Maschine hat sie nie so leuchten lassen …', mood: 'surprised' },
      { who: 'Professor Ulme', text: 'Weil die Lichter nicht gefangen werden wollen, Varga. Sie leuchten, wenn Menschen und Taschis einander vertrauen.', mood: 'talk' },
      { who: 'Brix', text: 'Die Maschine ist aus. Alle gespeicherten Lichter fließen zurück an den Himmel!', mood: 'happy' },
      { who: 'Kommandantin Varga', text: '… Ich habe mich geirrt. Die Gilde ist aufgelöst. Ich werde helfen, die gestohlenen Taschis nach Hause zu bringen.', mood: 'sad' },
      { who: 'Professor Astra', text: 'Die sechzehn Lichter leuchten wieder. Das Tor der Sternenliga steht dir offen, Champion.', mood: 'happy' }
    ]
  }
];

export const LEAGUE_FINALE = [
  { who: 'Sternenmeisterin Lyra', text: 'Fünf Prüfungen, sechzehn Siegel und eine ganze Welt voller Freundschaften. Du bist der neue Sternenmeister.', mood: 'happy' },
  { who: 'Professor Ulme', text: 'Ich wusste es vom ersten Tag an! Erinnerst du dich an das Podest in Sonnenhain?', mood: 'happy' },
  { who: 'Brix', text: 'Schnurrik möchte dich begleiten. Es hat sich selbst entschieden – und ich finde, das ist das Schönste, was passieren kann.', mood: 'happy' },
  { who: 'Sternenmeisterin Lyra', text: 'Deine Reise ist nicht vorbei. Die vier uralten Wächter, die Champions und der vollständige Taschidex warten auf dich.', mood: 'talk' }
];

export const CREDITS = [
  'TASCHI – Die 16 Lichter',
  'Ein eigenständiges Abenteuer aus der easygames-Sammlung',
  'Welt, Wesen, Figuren, Musik und Geschichte: eigene Entwicklung',
  '3D: Three.js r128 (MIT)',
  'Schrift: Fredoka (SIL Open Font License)',
  'Danke fürs Spielen!'
];

// Rivale Rian: grew up with the player in Sonnenhain, takes the starter that
// beats the player's and meets them five times on the journey. The arc runs
// from pure rivalry to teaming up against the Schattengilde.
export const RIVAL = {
  name: 'Rian',
  ulme: { who: 'Professor Ulme', text: 'Ach, und noch etwas: Rian, mein anderer Schützling, hat sich gerade das Taschi vom Podest geschnappt, das gegen deins im Vorteil ist. Rian will unbedingt als Erstes alle Siegel sammeln – ihr werdet euch unterwegs bestimmt begegnen!', mood: 'happy' },
  stages: [
    { // Korallküste
      before: [
        { text: 'Da bist du ja endlich! Ich warte hier schon seit Stunden. Na gut, seit zehn Minuten.', mood: 'happy' },
        { text: 'Ich hab mein Taschi extra so gewählt, dass es deins schlägt. Taktik nennt man das! Zeig mal, was du draufhast!', mood: 'talk' }
      ],
      win: [{ text: 'Was?! Das war … nur Glück. Beim nächsten Mal bin ich vorbereitet. Wir sehen uns im Käferwald!', mood: 'angry' }],
      lose: [{ text: 'Ha! Ich wusste es. Aber keine Sorge – du hast ja noch fünfzehn Siegel Zeit, um aufzuholen.', mood: 'happy' }]
    },
    { // Käferwald
      before: [
        { text: 'Hast du es auch gehört? Im Wald verschwinden Taschis aus ihren Nestern. Diese Schattengilde steckt dahinter, da bin ich sicher.', mood: 'worried' },
        { text: 'Ich nehme es mit denen allein auf. Aber vorher will ich sehen, ob mein Team stärker geworden ist als deins!', mood: 'talk' }
      ],
      win: [{ text: 'Mist. Du wirst richtig gut … Pass im Wald auf dich auf, ja? Die Gilde ist nicht so fair wie ich.', mood: 'sad' }],
      lose: [{ text: 'Mein Team ist bereit für die Gilde. Und deins … bald vielleicht auch.', mood: 'happy' }]
    },
    { // Nebelmoor
      before: [
        { text: 'Gut, dass du da bist. Die Gilde hat mir im Nebel mein erstes gefangenes Taschi abgenommen. Einfach so.', mood: 'sad' },
        { text: 'Ich war zu leichtsinnig. Kämpf gegen mich – ich muss wissen, ob ich stark genug bin, um es zurückzuholen!', mood: 'angry' }
      ],
      win: [{ text: 'Du hast recht, allein schaffe ich das nicht. Wenn du die Gilde hier vertreibst … holst du es für mich zurück? Danke.', mood: 'sad' }],
      lose: [{ text: 'Das gibt mir Mut. Trotzdem: Wenn du der Gilde begegnest, gib ihnen auch einen von mir mit.', mood: 'talk' }]
    },
    { // Kristallberg
      before: [
        { text: 'Mein Taschi ist wieder bei mir! Die Gilde hat in den Kristallen nach Energie gesucht und die gefangenen Taschis zurückgelassen.', mood: 'happy' },
        { text: 'Das verdanke ich dir. Und deshalb kämpfe ich jetzt mit allem, was ich habe – das bin ich dir schuldig!', mood: 'happy' }
      ],
      win: [{ text: 'Unglaublich. Du bist wirklich die beste Person, gegen die ich je verloren habe. Bis zur Himmelskrone!', mood: 'happy' }],
      lose: [{ text: 'Gewonnen! Aber ehrlich gesagt war das der knappste Kampf meines Lebens.', mood: 'surprised' }]
    },
    { // Himmelskrone
      before: [
        { text: 'Hier oben endet die Reise. Varga wartet am Sternengipfel, und die Lichter flackern immer stärker.', mood: 'worried' },
        { text: 'Ein letzter Kampf zwischen uns. Kein Taktieren, keine Ausreden. Danach stoppen wir Varga – zusammen!', mood: 'angry' }
      ],
      win: [
        { text: 'Das war unser bester Kampf. Ich trete zurück und passe auf die Region auf, während du hinaufsteigst.', mood: 'happy' },
        { text: 'Nimm meine Ausrüstung. Ich glaube an dich – seit Sonnenhain.', mood: 'happy' }
      ],
      lose: [{ text: 'Ich habe gewonnen … aber Varga ist ein anderes Kaliber. Trainiere noch ein bisschen, dann gehen wir gemeinsam hinauf.', mood: 'worried' }]
    }
  ]
};
