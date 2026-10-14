/* Abenteuer auf der Hauptinsel (in beiden Modi). */
import type { QuestDef } from '../../gameplay/quests.ts';

export const HUB_QUESTS: QuestDef[] = [
  {
    id: 'h_huehner', title: 'Ausgebüxt!', icon: '🐔', world: 'hub', kind: 'side', giver: 'heinz',
    summary: 'In der Sturmnacht ist das Gatter aufgesprungen – Bauer Heinz’ drei Hühner sind über die ganze Insel verstreut.',
    stages: [
      { text: 'Finde Heinz’ drei Hühner und scheuche sie zurück (Aktion drücken, wenn du bei einem Huhn bist).', hints: ['Hühner mögen Körner, Wasser und Schatten.', 'Eins pickt am Ententeich, eins beim Camp, eins hinter der Schule.', 'Ententeich westlich vom Ortsplatz, Camp im Südwesten, Schule südöstlich vom Brunnen.'],
        objectives: [{ id: 'h1', type: 'interact', target: 'huhn1', label: 'Huhn Gackerlotte (am Wasser)' }, { id: 'h2', type: 'interact', target: 'huhn2', label: 'Huhn Federica (bei Zelten)' }, { id: 'h3', type: 'interact', target: 'huhn3', label: 'Huhn Eierlinde (bei der Schule)' }] },
      { text: 'Sag Bauer Heinz Bescheid.', hints: ['Heinz ist am Bauernhof.', 'Der Hof ist im Osten mit der roten Scheune.', 'Sprich mit Heinz.'],
        objectives: [{ id: 'heinz', type: 'talk', target: 'heinz', label: 'Sprich mit Bauer Heinz' }],
        dialog: { heinz: { start: { t: 'Alle drei? Du bist ein Schatz! Hier – frische Karotten und ein paar Sterne. Und meine Tiere freuen sich, wenn du sie besuchst!', do: [{ friend: 2 }], end: false } } } }
    ],
    rewards: { stars: 12, xp: 50, items: [['karotte', 4], ['apfel', 2]], text: 'Alle Hühner sind wieder zu Hause.' }
  },
  {
    id: 'h_angeln', title: 'Petri Heil!', icon: '🎣', world: 'hub', kind: 'side', giver: 'fischer',
    summary: 'Herr Fischer zeigt dir, wie man angelt – wenn du ihm einen Fisch für seine Katze fängst.',
    offer: { start: { t: 'Kennst du die Kunst des Angelns? Ich leih dir meine alte Angel. Fang einen Fisch für meine Katze Mimi, dann darfst du sie behalten!', choices: [{ t: '🎣 Abgemacht!', do: [{ give: ['angel', 1] }, { start: 'h_angeln' }] }, { t: 'Später vielleicht.' }] } },
    stages: [
      { text: 'Fang einen Fisch: stell dich ans Wasser, drück „Angeln“ und dann im richtigen Moment, wenn es beißt.', hints: ['Am Ententeich oder am Strand geht es am besten.', 'Schau direkt aufs Wasser. Dann erscheint „🎣 Angeln“.', 'Warte, bis „❗ Es beißt!“ erscheint – dann sofort drücken.'],
        objectives: [{ id: 'f', type: 'fish', target: '*', label: 'Fang einen Fisch' }] },
      { text: 'Bring Herrn Fischer den Fisch.', hints: ['Herr Fischer ist am Freibad.', 'Freibad im Süden.', 'Sprich mit ihm.'],
        objectives: [{ id: 't', type: 'talk', target: 'fischer', label: 'Sprich mit Herrn Fischer' }],
        dialog: { fischer: { start: { t: 'Ein Prachtexemplar! Mimi wird schnurren. Die Angel gehört jetzt dir – das Sammelbuch hat noch viele Seiten!', do: [{ take: ['fisch', 1] }, { friend: 2 }], end: false } } } }
    ],
    rewards: { stars: 8, xp: 40, text: 'Du bist jetzt Anglerin bzw. Angler!' }
  },
  {
    id: 'h_strand', title: 'Strandgut', icon: '⛏️', world: 'hub', kind: 'side', giver: 'maja',
    summary: 'Der Sturm hat Dinge an den Strand gespült. Maja gibt dir eine Schaufel.',
    offer: { start: { t: 'Siehst du das Glitzern im Sand? Der Sturm hat lauter Sachen angespült. Hier, eine Schaufel – grab zwei Dinge aus!', choices: [{ t: '⛏️ Los geht’s!', do: [{ give: ['schaufel', 1] }, { start: 'h_strand' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Grab an zwei glitzernden Stellen am Strand.', hints: ['Glitzernde Stellen erscheinen am Sandstrand rund um die Insel.', 'Lauf am Ufer entlang und achte auf funkelnde Punkte.', 'Stell dich darauf und drück „Buddeln“.'],
        objectives: [{ id: 'b', type: 'interact', target: 'buddeln', n: 2, label: 'Buddle zwei Fundstücke aus' }] },
      { text: 'Zeig Maja deine Funde.', hints: ['Maja ist am Badestrand.', 'Im Südosten.', 'Sprich mit Maja.'],
        objectives: [{ id: 't', type: 'talk', target: 'maja', label: 'Sprich mit Maja' }],
        dialog: { maja: { start: { t: 'Wow! Du hast ein echtes Schatzsucher-Händchen. Behalt die Schaufel – auf jeder Insel gibt es Strände!', do: [{ friend: 2 }], end: false } } } }
    ],
    rewards: { stars: 8, xp: 40, items: [['kescher', 1]], text: 'Mit Schaufel und Kescher bist du bestens ausgerüstet.' }
  },
  {
    id: 'h_feuer', title: 'Feuer im Camp!', icon: '🚒', world: 'hub', kind: 'side', giver: 'fenja',
    summary: 'Ein Blitz aus der Sturmnacht hat im Camp kleine Feuer entfacht. Fenja braucht Hilfe mit dem Löschfahrzeug!',
    offer: { start: { t: 'Alarm! Im Camp brennen drei Glutnester. Du darfst das Löschfahrzeug fahren! Es steht vor der Feuerwache.', choices: [{ t: '🚒 Ich fahre!', do: [{ start: 'h_feuer' }] }, { t: 'Gleich!' }] } },
    stages: [
      { text: 'Steig ins Löschfahrzeug, fahr zum Camp und lösch die Feuer (⤓ oder ✦ hält den Wasserstrahl).', hints: ['Das Löschfahrzeug steht vor der Feuerwache nördlich vom Brunnen.', 'Das Camp liegt im Südwesten. Halte ⤓ (Taste X) bzw. ✦ (F) für Wasser.', 'Zielen: Fahr so, dass das Feuer etwa 10 m vor dir liegt, und spritze.'],
        objectives: [{ id: 'f1', type: 'interact', target: 'feuer:1', label: 'Feuer 1 gelöscht' }, { id: 'f2', type: 'interact', target: 'feuer:2', label: 'Feuer 2 gelöscht' }, { id: 'f3', type: 'interact', target: 'feuer:3', label: 'Feuer 3 gelöscht' }] },
      { text: 'Melde Fenja den Erfolg.', hints: ['Fenja ist an der Feuerwache.', 'Nördlich vom Brunnen.', 'Sprich mit ihr.'],
        objectives: [{ id: 't', type: 'talk', target: 'fenja', label: 'Sprich mit Fenja' }],
        dialog: { fenja: { start: { t: 'Wasser marsch – und alles gelöscht! Du bist ab heute Ehren-Feuerwehrmitglied. Hier, dein Helm!', do: [{ friend: 3 }, { cosmetic: 'hat:helm' }], end: false } } } }
    ],
    rewards: { stars: 15, xp: 60, text: 'Das Camp ist gerettet!' }
  },
  {
    id: 'h_schatz', title: 'Piets Schatzkarte', icon: '🗺️', world: 'hub', kind: 'side', giver: 'piet',
    summary: 'Piet hat eine alte Karte mit Rätseln. Wo sind die zwei Truhen versteckt?',
    offer: { start: { t: 'Arrr, ich hab eine Karte gefunden, aber meine Augen sind nicht mehr so gut. Rätsel 1: „Wo das Licht die Schiffe ruft, liegt das Gold im Fels-Schatten nach Süden.“', choices: [{ t: '🗺️ Ich finde es!', do: [{ start: 'h_schatz' }] }, { t: 'Klingt schwierig …' }] } },
    stages: [
      { text: 'Rätsel 1: „Wo das Licht die Schiffe ruft, liegt das Gold im Fels-Schatten nach Süden.“', hints: ['„Licht, das Schiffe ruft“ – das ist der Leuchtturm!', 'Geh zum Leuchtturm und dann ein Stück nach Süden.', 'Die Truhe steht südlich vom Leuchtturm-Hügel bei den Felsen.'],
        objectives: [{ id: 'c1', type: 'interact', target: 'chest:piet1', label: 'Finde die erste Truhe' }] },
      { text: 'Rätsel 2 (lag in der Truhe): „Wo Kinder schaukeln und Kanonen nie schießen, schläft das Gold im Mast-Schatten.“', hints: ['Kanonen, die nie schießen … ein Spiel-Piratenschiff!', 'Das Piratenschiff steht am Strand im Süden.', 'Die Truhe liegt am Sand neben dem Schiff.'],
        objectives: [{ id: 'c2', type: 'interact', target: 'chest:piet2', label: 'Finde die zweite Truhe' }] },
      { text: 'Erzähl Piet von deinem Fund.', hints: ['Piet steht beim Piratenschiff.', 'Im Süden am Strand.', 'Sprich mit Piet.'],
        objectives: [{ id: 't', type: 'talk', target: 'piet', label: 'Sprich mit Piet' }],
        dialog: { piet: { start: { t: 'ARRR! Du hast beide gefunden! Du bist eine echte Schatzjägerin, ein echter Schatzjäger. Nimm den Piratenhut – den hast du dir verdient!', do: [{ cosmetic: 'hat:piratenhut' }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 20, xp: 60, text: 'Beide Schätze gefunden!' }
  },
  {
    id: 'h_training', title: 'Kais Wald-Training', icon: '🥋', world: 'hub', kind: 'side', giver: 'kai',
    summary: 'Kampfmeister Kai bringt dir das Kämpfen im Verbotenen Wald bei – und am Ende die Lichtwelle.',
    offer: { start: { t: 'Wer in den Verbotenen Wald will, muss vorbereitet sein. Erst die Puppen, dann echte Monster. Bereit?', choices: [{ t: '🥋 Bereit!', do: [{ start: 'h_training' }] }, { t: 'Noch nicht.' }] } },
    stages: [
      { text: 'Triff die Trainingspuppen auf der Lichtung 10 Mal (Schlag: J / ⚔️ – dreimal hintereinander für die Kombo).', hints: ['Die Puppen stehen im Kreis um Kai.', 'Lauf nah an eine Puppe heran und schlage zu.', 'Drei Schläge schnell nacheinander = Wirbel-Kombo!'],
        objectives: [{ id: 'p', type: 'interact', target: 'puppe', n: 10, label: 'Triff die Trainingspuppen' }] },
      { text: 'Besiege drei Wald-Monster. Weiche mit der Rolle (K / 🌀) aus, wenn sie ausholen!', hints: ['Geh tiefer in den Wald – Monster tauchen von selbst auf.', 'Wenn ein Monster wackelt, holt es aus: Jetzt ausweichen!', 'Herzen ❤️ von besiegten Monstern heilen dich.'],
        objectives: [{ id: 'm', type: 'defeat', target: '*', n: 3, label: 'Besiege Wald-Monster' }] },
      { text: 'Geh zurück zu Kai.', hints: ['Kai ist auf der Trainings-Lichtung.', 'Westlich vom Waldtor.', 'Sprich mit Kai.'],
        objectives: [{ id: 't', type: 'talk', target: 'kai', label: 'Sprich mit Kai' }],
        dialog: { kai: { start: { t: 'Stark! Jetzt bist du bereit für die Lichtwelle: Sie schiebt alle Monster um dich herum zurück. Taste U oder 🌟 – sie braucht Energie 💠.', do: [{ ability: 'lichtwelle' }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 15, xp: 80, text: 'Du beherrschst den Kampf im Verbotenen Wald.' }
  },
  {
    id: 'h_eis', title: 'Die vergessene Eissorte', icon: '🍦', world: 'hub', kind: 'side', giver: 'emma_eis',
    summary: 'Eis-Emma hat die Zutaten ihrer neuen Sorte vergessen. Die Leute im Ort haben sie probiert …',
    offer: { start: { t: 'Gestern hab ich eine neue Sorte erfunden, alle fanden sie super – und heute weiß ich nicht mehr, was drin war! Frag doch bitte Rosi, Paul und Doktor Hilde.', choices: [{ t: '🍦 Mach ich!', do: [{ start: 'h_eis' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Frag Rosi, Polizist Paul und Doktor Hilde nach der Eissorte.', hints: ['Alle drei sind rund um den Ortsplatz.', 'Rosi am Rathaus, Paul an der Polizei, Hilde am Krankenhaus.', 'Sprich alle drei an – jeder erinnert sich an eine Zutat.'],
        objectives: [{ id: 'r', type: 'talk', target: 'rosi', label: 'Rosi: „Es war … rosa!“' }, { id: 'p', type: 'talk', target: 'paul', label: 'Paul: „Ich schmeckte Honig!“' }, { id: 'h', type: 'talk', target: 'hilde', label: 'Hilde: „Mit knackigen Apfelstückchen!“' }] },
      { text: 'Erzähl Emma die Zutaten.', hints: ['Emma ist in der Eisdiele.', 'Südlich vom Brunnen.', 'Sprich mit Emma und wähle die richtigen Zutaten.'],
        objectives: [{ id: 'e', type: 'flag', target: 'eis_richtig', label: 'Sag Emma die richtige Mischung' }],
        dialog: { emma_eis: {
          start: { t: 'Und? Was war drin?', choices: [
            { t: 'Rosa Erdbeere, Honig und Apfel!', do: [{ flag: 'eis_richtig' }, { friend: 3 }, { give: ['eis', 3] }], to: 'ok' },
            { t: 'Schokolade, Banane und Nüsse!', to: 'no' },
            { t: 'Blau, Pfefferminz und Gurke!', to: 'no' }] },
          ok: { t: 'JA! „Rosa Honig-Apfel-Traum“! Hier, drei Kugeln für dich – geht aufs Haus!', end: false },
          no: { t: 'Hmm, das klingt nicht richtig … Hast du wirklich alle drei gefragt?', end: false }
        } } }
    ],
    rewards: { stars: 10, xp: 40, text: 'Der „Rosa Honig-Apfel-Traum“ ist zurück!' }
  },
  {
    id: 'h_zuhause', title: 'Zuhause ist es am schönsten', icon: '🏠', world: 'hub', kind: 'side', giver: 'mama',
    summary: 'Mama möchte, dass du dich ausruhst und dir etwas Schönes anziehst.',
    offer: { start: { t: 'Du siehst müde aus, Schatz. Zieh dich im Kleiderschrank um und ruh dich im Bett aus – dann hast du wieder Kraft für Abenteuer.', choices: [{ t: '😴 Okay, Mama.', do: [{ start: 'h_zuhause' }] }, { t: 'Gleich!' }] } },
    stages: [
      { text: 'Zieh dich im Kleiderschrank um und schlaf in deinem Bett.', hints: ['Beides ist im Haus Sonnenschein.', 'Der Kleiderschrank steht an der hinteren Wand, das Bett links.', 'Drück an beiden die Aktionstaste.'],
        objectives: [{ id: 'k', type: 'flag', target: 'outfit', label: 'Zieh dich um' }, { id: 's', type: 'flag', target: 'geschlafen', label: 'Schlaf im Bett' }] }
    ],
    rewards: { stars: 6, xp: 30, items: [['kuchen', 1]], text: 'Ausgeruht und schick – und Mama hat dir Kuchen eingepackt.' }
  }
];
