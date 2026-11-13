/* AnMaCha – Der Podcast (Offizielles Spiel) – Inhalte: Rubriken, Story-Kapitel, Dialoge, Quiz, Sender, Podcast-Folgen.
   Story frei erzählt nach den öffentlichen Infos auf anmacha.de (Rubriken, Folgen, Podcastnacht, Podfluencer Festival). */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const D = AMC.Data = {};

  D.TITLE = 'AnMaCha – Der Podcast';
  D.SUB = 'Offizielles Spiel';
  D.SLOGAN = 'Seid Ihr bereit, angemacht zu werden?';

  // ---------------------------------------------------------------- Rubriken (Themen-Funken in der Stadt, Karten in der Live-Aufnahme)
  D.RUBRICS = {
    serious: { name: 'Serious 15', icon: '🧠', color: '#4fa3ff' },
    tech: { name: 'Tech-News', icon: '💡', color: '#2fe0c0' },
    musik: { name: 'Musik-Anmacher', icon: '🎵', color: '#ff4fa0' },
    tv: { name: 'TV-Anmacher', icon: '📺', color: '#b36cff' },
    feel: { name: 'Feelgood', icon: '☀️', color: '#ffc93c' }
  };
  D.RUBRIC_IDS = Object.keys(D.RUBRICS);

  // ---------------------------------------------------------------- Die beiden Hosts (Figuren nach der Designvorlage: schwarze Polos mit orangem Play-Logo)
  D.HOSTS = {
    andrew: {
      id: 'andrew', name: 'Andrew', color: '#ff9d2e',
      look: { body: 'm', skin: '#f3cdb2', hair: { style: 'short', color: '#c9844a' }, top: '#17181d', topStyle: 'tee', bottom: '#34507e', bottomStyle: 'pants', shoes: '#1d1d22', bulk: 1.0 },
      speed: 7.4, jump: 8.6, wave: 4.6, waveDmg: 1, strong: ['musik', 'feel'],
      perk: 'Schneller und springt höher. Feelgood-Welle: großer Radius, betäubt Störsender.',
      blurb: 'Musikgefühl, gute Laune und ein Lachen bis in die Kaffeeküche.'
    },
    marco: {
      id: 'marco', name: 'Marco', color: '#ffb35a',
      look: { body: 'm', skin: '#f0c8a8', hair: { style: 'short', color: '#6b4528' }, beard: '#6b4528', top: '#17181d', topStyle: 'tee', bottom: '#2a2e38', bottomStyle: 'pants', shoes: '#1d1d22', bulk: 1.1 },
      speed: 6.6, jump: 7.6, wave: 3.6, waveDmg: 2, strong: ['tech', 'tv'],
      perk: 'Kräftiger. Technik-Welle: schaltet Störsender sofort ab und repariert Geräte schneller.',
      blurb: 'Technik-Herz, Serienkenner und Hüter von Marcos Tagebuch.'
    }
  };

  // ---------------------------------------------------------------- Sprüche in der Live-Aufnahme (je Rubrik)
  D.LINES = {
    serious: [
      'Serious 15 – jetzt wird es kurz ernst. Versprochen: nur 15 Minuten!',
      'Reißverschlussverkehr: Warum schaffen wir das eigentlich nicht?',
      'Smartphone-Sucht – ich schau nur noch kurz … oh, schon drei Stunden.',
      'Online oder regional einkaufen? Wir haben da eine Meinung. Oder zwei.',
      'Barrierefreiheit geht uns alle an – auch im Radio.',
      'Zusammenhalt in der Gesellschaft: Mehr reden, weniger schreien.'
    ],
    tech: [
      'Tech-News! Neue Fritzbox, neues Glück – oder erst mal Kabel prüfen?',
      'Soundbars: Warum? Wofür? Und warum hängt da schon wieder ein Kabel raus?',
      'Internet über DSL oder Glasfaser – wer hat die längste Leitung?',
      'Künstliche Intelligenz moderiert bald selbst? Nicht mit uns!',
      'Elektroautos und Verkaufs-Apps – die Zukunft hat Akku.',
      'Kabel ist Kabel, sagt man. Ich sage: Kabel ist Leidenschaft!'
    ],
    musik: [
      'Musik-Anmacher: Dieser Song läuft heute rauf und runter auf AnMaCha24!',
      'Der ESC-Rückblick – wer hat getanzt, wer hat gewackelt?',
      'House Is A Feeling – Clubradio24 lässt grüßen!',
      '90er-Hits vor der 1996er-Party – Kassette rein, Lautstärke hoch!',
      'Schlager oder Rap? Bei uns läuft beides – nur nicht gleichzeitig.',
      'Musik, die mich anmacht – das ist nicht nur ein Slogan!'
    ],
    tv: [
      'TV-Anmacher: Diese Serie müsst ihr gesehen haben!',
      'All-inclusive-Streaming: Wie viele Abos sind eigentlich zu viele?',
      'Sportabos für die Bundesliga – man braucht inzwischen einen Taschenrechner.',
      'Der neue Streaming-Start – wir haben schon mal reingeschaut.',
      'Slow-TV: Stundenlang Zugfahrt gucken. Und ja, es ist großartig.',
      'Lineares Fernsehen – erinnert sich noch wer an die Fernbedienung mit Kabel?'
    ],
    feel: [
      'Feelgood! Heute gibt es nur gute Nachrichten. Und Köttbullar.',
      'Giselas Camper – die schönste Reise beginnt auf dem Campingplatz.',
      'Ein Hörer hat uns geschrieben: Ihr rettet meinen Montag!',
      'Hausgrillen statt Urlaub – Sommer ist, was man draus macht.',
      'Zeit für Dein nächstes Abenteuer – und für ein Eis.',
      'Gute Laune ist ansteckend. Bitte weitersagen!'
    ],
    life: [
      'Wenig Interessantes aus unserem Leben – also los, wir haben viel davon!',
      'Marcos Tagebuch: Liebes Tagebuch, heute war wieder Kabel-Tag.',
      'Andrew hat diese Woche … nichts erlebt. Und das erzählt er jetzt ausführlich.'
    ]
  };

  // Hörer-Kommentare im Live-Chat
  D.CHAT = {
    good: ['🔥 Bester Podcast!', 'Haha, Marco 😂', 'Andrew ist heute on fire!', 'Feelgood pur ☀️', 'Gänsehaut-Moment', 'Ich hör euch beim Bügeln 🧺', 'Grüße aus München!', 'Mehr davon!!', 'Wir ♥ Medien', '#AnMaCha', 'Folge des Jahres', 'Ich lach mich weg 😆'],
    bad: ['Hallo? Ton weg?', 'Rauscht bei mir…', 'zu leise 😕', 'Kabel ab?', 'Wann kommt die Pointe?', 'Hmm…', 'zappt kurz zu Clubradio24'],
    hype: ['🎉🎉🎉', 'LEGENDÄR', 'ANMACHA! ANMACHA!', 'Ich bin bereit, angemacht zu werden!', '🙌 Zugabe!']
  };

  // Hörerinnen und Hörer in der Stadt
  D.FAN_NAMES = ['Sabine', 'Timo', 'Lea', 'Kevin', 'Gül', 'Jonas', 'Mira', 'Paul', 'Anja', 'Deniz', 'Heike', 'Luca', 'Nina', 'Ole', 'Sven', 'Yasmin', 'Rolf', 'Tanja'];
  D.FAN_LINES = [
    ['Ihr seid doch die vom Podcast! Mein Thema für euch: Warum klingeln Paketboten nie?', 'serious'],
    ['Ich hab eine neue Soundbar und keine Ahnung, welches Kabel wohin. Hilfe!', 'tech'],
    ['Spielt mal wieder 90er! Ich hab noch Kassetten im Keller.', 'musik'],
    ['Welche Serie soll ich als Nächstes schauen? Ich hab alles durch!', 'tv'],
    ['Erzählt doch mal was Schönes. Die Welt kann gute Nachrichten brauchen.', 'feel'],
    ['Ich hör euch nachts in der Podcastnacht auf AnMaCha24 – perfekte Einschlafhilfe! (Positiv gemeint.)', 'feel'],
    ['Mein Router blinkt orange. Ist das ein Zeichen? Ein AnMaCha-Zeichen?', 'tech'],
    ['Online bestellen oder im Laden kaufen – was ist besser für die Innenstadt?', 'serious'],
    ['Der ESC war ja wieder wild. Macht da mal eine Folge drüber!', 'musik'],
    ['Habt ihr schon den neuen Streamingdienst? Lohnt sich das?', 'tv'],
    ['Mein Zug hatte heute nur 40 Minuten Verspätung. Ein Rekord!', 'serious'],
    ['Ich hab euren Podcast meiner Oma gezeigt. Sie will jetzt auch einen machen.', 'feel']
  ];

  // ---------------------------------------------------------------- Story: „Staffel“ in 8 Kapiteln
  // obj.type: collect | guest | antenna | train | party | boss; t = Zeit (s); n = Anzahl
  D.CHAPTERS = [
    {
      id: 'c1', title: 'Da muss man erstmal reinwachsen', when: 'Sommer 2020', ep: 1,
      sky: 'day', obj: { type: 'collect', n: 8, t: 300 }, drones: 2, show: { rounds: 4, goal: [120, 220, 320] },
      intro: [
        ['n', 'Sommer 2020. Aus der AnMaCha-Show soll ein Podcast werden. Zwei Mikrofone, eine Idee – und sehr viel Kabel.'],
        ['m', 'Andrew, ich hab die Mikros angeschlossen. Also … zwei von drei Kabeln. Das dritte ist Deko.'],
        ['a', 'Perfekt. Fehlen nur noch Themen. Die liegen ja quasi auf der Straße.'],
        ['m', 'Wortwörtlich! Schau, da leuchtet was. Themen-Funken! Lass uns die einsammeln, bevor die Störsender sie wegrauschen.'],
        ['n', 'Sammle Themen-Funken in der Stadt und bring sie ins AnMaCha-Funkhaus. Mit {x} sendest du eine Schallwelle gegen Störsender.']
      ],
      outro: [['a', 'Folge 1 ist im Kasten! Da muss man erstmal reinwachsen.'], ['m', 'Und ich wachse schon. Vor allem in den Kabelsalat.']]
    },
    {
      id: 'c2', title: 'Es ist Typsache!', when: 'Heiligabend 2020', ep: 2,
      sky: 'xmas', obj: { type: 'guest', n: 3, t: 300 }, drones: 4, show: { rounds: 5, goal: [180, 320, 460] },
      intro: [
        ['n', 'Heiligabend. Draußen schneit es, drinnen läuft Christmasradio24 – und die neue Folge braucht Gäste mit Geschichten.'],
        ['a', 'Wir fragen einfach Leute in der Stadt nach ihrem Weihnachtstyp. Plätzchen-Typ, Geschenke-in-letzter-Minute-Typ …'],
        ['m', 'Ich bin der Typ, der die Lichterkette entwirrt. Seit drei Stunden.'],
        ['n', 'Finde drei Gäste (Sprechblase ⭐) und bring sie ins Funkhaus. Sie folgen dir, wenn du mit ihnen sprichst.']
      ],
      outro: [['m', 'Frohe Weihnachten an alle da draußen!'], ['a', 'Und denkt dran: Es ist alles Typsache.']]
    },
    {
      id: 'c3', title: 'Neujahrstalgie', when: 'Neujahr 2021', ep: 3,
      sky: 'night', obj: { type: 'collect', n: 14, t: 280, gold: 3 }, drones: 5, show: { rounds: 5, goal: [220, 380, 540] },
      intro: [
        ['n', 'Silvesternacht. Lineares Fernsehen, Klapphandys, Dating online oder offline – die Folge wird ein Rückblick.'],
        ['a', 'Erinnerst du dich an Klapphandys? Zack, zu. Das war noch Auflegen mit Gefühl!'],
        ['m', 'Und an Fernseher mit Röhre. Die waren so schwer wie unser Mischpult.'],
        ['n', 'Sammle Themen-Funken und drei goldene Erinnerungen (🌟) über den Dächern. Springe mit {a}, sprinte mit {rb}.']
      ],
      outro: [['a', 'Frohes Neues! Und ein Hoch auf die Nostalgie.'], ['m', 'Ich nehm mein Klapphandy mit ins Jahr. Für die Akustik.']]
    },
    {
      id: 'c4', title: 'Ma\' wird ja wohl mal noch …', when: 'Staffel 2', ep: 8,
      sky: 'sunset', obj: { type: 'antenna', n: 3, t: 300 }, drones: 6, show: { rounds: 6, goal: [260, 440, 620] },
      intro: [
        ['n', 'Staffel 2 startet. Doch kurz vor der Aufnahme rauscht es auf allen Kanälen: Die Störsender haben den Sendemast gekapert!'],
        ['m', 'Drei Verteiler oben am Mast sind verstellt. Ich kenne jedes Kabel da oben persönlich.'],
        ['a', 'Dann klettern wir hoch. Ma\' wird ja wohl mal noch einen Sendemast reparieren dürfen!'],
        ['n', 'Steige den Sendemast hinauf und repariere drei Verteiler mit {x}. Marco repariert schneller.']
      ],
      outro: [['a', 'Signal steht! Staffel 2 kann kommen.'], ['m', 'Und ich hab Höhenangst überwunden. Für etwa vier Minuten.']]
    },
    {
      id: 'c5', title: 'Die Bahn kommt! – Irgendwann', when: 'Staffel 3', ep: 13,
      sky: 'day', obj: { type: 'train', n: 10, t: 150 }, drones: 4, show: { rounds: 6, goal: [300, 500, 700] },
      intro: [
        ['n', 'Staffel 3. Die Folge über die Bahn soll pünktlich erscheinen. Ironisch, dass ausgerechnet der Zug nicht pünktlich ist.'],
        ['a', 'Der Zug fällt aus! Wir müssen zu Fuß durch die Stadt, alle Haltestellen abklappern.'],
        ['m', 'Zehn Haltestellen, ein Fahrplan und null Verspätung. Wir zeigen der Bahn, wie das geht!'],
        ['n', 'Lauf durch alle Haltestellen-Tore, bevor die Zeit abläuft. Jedes Tor gibt Zeit dazu.']
      ],
      outro: [['m', 'Pünktlich! Wir! Das glaubt uns keiner.'], ['a', 'Schreib es in dein Tagebuch, Marco.']]
    },
    {
      id: 'c6', title: 'Köttbullar und andere gute Nachrichten', when: 'Staffel 4', ep: 22,
      sky: 'day', obj: { type: 'collect', n: 18, t: 260, focus: 'feel' }, drones: 7, show: { rounds: 7, goal: [360, 580, 800] },
      intro: [
        ['n', 'Staffel 4. Die Welt braucht gute Nachrichten – und die Störsender versuchen, genau die zu verschlucken.'],
        ['a', 'Diese Folge wird ganz viel Feelgood. Und Köttbullar. Frag nicht.'],
        ['m', 'Ich frag nicht. Ich ess sie nur.'],
        ['n', 'Sammle vor allem Feelgood-Funken (☀️). Je mehr passende Funken, desto stärker die Karten in der Aufnahme.']
      ],
      outro: [['a', 'So viele gute Nachrichten in einer Folge!'], ['m', 'Und kein einziges Köttbullar übrig.']]
    },
    {
      id: 'c7', title: '(Sch)Leckmuschel', when: 'Live vor der 1996er-Party', ep: 23,
      sky: 'party', obj: { type: 'party', n: 10, t: 240 }, drones: 6, show: { rounds: 7, goal: [420, 660, 900] },
      intro: [
        ['n', 'Diese Folge wird LIVE aufgenommen – vor der 1996er-Party der Rückspul Helden. Die Stadt leuchtet in Neonfarben.'],
        ['m', '1996! Kassetten, Discman, Tamagotchi. Ich hab meine Bauchtasche dabei.'],
        ['a', 'Wir brauchen die Party-Playlist. Zehn Kassetten sind in der Stadt verteilt – und die Gäste wollen tanzen!'],
        ['n', 'Sammle zehn Kassetten (📼). Bringe tanzende Gäste mit {x} in Stimmung – das gibt Bonuszeit.']
      ],
      outro: [['a', 'Was für eine authentische Folge!'], ['m', 'Ich glaub, mein Tamagotchi hat gerade Hunger.']]
    },
    {
      id: 'c8', title: 'LIVE vom Podfluencer Festival', when: 'Herbst 2026 · München', ep: 24,
      sky: 'festival', obj: { type: 'boss', n: 3, t: 360 }, drones: 4, show: { rounds: 8, goal: [500, 780, 1050] },
      intro: [
        ['n', 'München, Podfluencer Festival 2026. Side-Stage, LIVE im Radio auf AnMaCha24 – der Start in die neue Staffel.'],
        ['a', 'Das ist es, Marco. Die große Bühne. Das neue Gesicht von AnMaCha.'],
        ['m', 'Und ausgerechnet jetzt taucht DAS FUNKLOCH auf. Der größte Störsender, den die Stadt je gesehen hat.'],
        ['a', 'Dann rauschen wir zurück. Seid ihr bereit, angemacht zu werden?'],
        ['n', 'Besiege das Funkloch: Weiche seinen Rauschwellen aus ({rt}) und triff es mit Schallwellen ({x}), wenn sein Schild offen ist.']
      ],
      outro: [
        ['m', 'Wir haben es geschafft. LIVE. Vor allen.'],
        ['a', 'Danke an alle, die uns seit 2020 zuhören. Das hier ist erst der Anfang.'],
        ['n', 'Das neue Gesicht von AnMaCha – Der Podcast. Die neue Staffel beginnt. Hört rein: überall, wo es Podcasts gibt.']
      ]
    }
  ];

  // ---------------------------------------------------------------- Die 13 Sender (AnMaCha-Radioproduktion bei laut.fm, alle auch bei RicoReWi Radio)
  D.STATIONS = [
    { slug: 'anmacha24', name: 'AnMaCha24', desc: 'Musik, die mich anmacht! Nachts die AnMaCha & Friends Podcastnacht.', icon: '▶️', color: '#ff8a1e' },
    { slug: 'ricorewi', name: 'RicoReWi Radio', desc: 'Der Sender der RicoReWi-Familie.', icon: '📻', color: '#ffd45a' },
    { slug: 'yourtime-fm', name: 'YourTime-FM', desc: 'Reisen, Freizeit, Feelgood – Zeit für Dein nächstes Abenteuer.', icon: '🧭', color: '#2fd3a0' },
    { slug: 'chartradio24', name: 'Chartradio24', desc: 'Die aktuellen Hits.', icon: '🏆', color: '#ff4f6d' },
    { slug: 'clubradio24', name: 'Clubradio24', desc: 'Dance und House – erlebe den Beat!', icon: '🪩', color: '#a46cff' },
    { slug: 'special-radio', name: 'Special-Radio', desc: 'Besondere Sendungen und Specials.', icon: '✨', color: '#5fb8ff' },
    { slug: 'kultradio24', name: 'Kultradio24', desc: 'Kult-Hits der 80er und 90er.', icon: '📼', color: '#ff9fd0' },
    { slug: 'rockradio24', name: 'Rockradio24', desc: 'Gitarren und Gas.', icon: '🎸', color: '#e0503a' },
    { slug: 'zockerfm', name: 'Zocker-FM', desc: 'Musik zum Zocken.', icon: '🎮', color: '#6cff8a' },
    { slug: 'rapradio24', name: 'Rapradio24', desc: 'Rap, R&B und Groove.', icon: '🎤', color: '#ffcf3a' },
    { slug: 'schlagerpop24', name: 'Schlagerpop24', desc: 'Schlager und Gefühl.', icon: '💖', color: '#ff6fb0' },
    { slug: 'christmasradio24', name: 'Christmasradio24', desc: 'Weihnachtsmusik – das ganze Jahr.', icon: '🎄', color: '#4fd06a' },
    { slug: 'radiofloh', name: 'RadioFloh', desc: 'Das Kinderradio.', icon: '🦊', color: '#ffa94d' }
  ];

  // ---------------------------------------------------------------- Podcast: offizieller Feed (podcaster.de) + eingebaute Liste als Rückfall
  D.PODCAST = {
    name: 'AnMaCha – Der Podcast', by: 'Marco und Andrew',
    feed: 'https://fodftf.podcaster.de/dieanmacha.rss', itunes: 1546299338,
    page: 'https://anmacha.de/podcast/', spotify: 'https://open.spotify.com/show/1EAnAGpmpO759oJO8hEm81'
  };
  const M = 'https://fodftf.podcaster.de/dieanmacha/media/';
  D.EPISODES = [
    ['#24', 'LIVE vom Podfluencer Festival 2026', 'AnMaCha_-_Der_Podcast_-24_-_Live_vom_Podfluencer_Festival_2026.mp3', '2026-11-04', 2144, 'Der LIVE-Mitschnitt von der Side-Stage in München – Start in die neue Staffel.'],
    ['Spezial #2', 'Die verrückte KI-Quizshow', 'Die_verrueckte_KI-Quizshow_by_AnMaCha.mp3', '2025-11-29', 1459, 'Vom Podfluencer-Festival 2025 in München: eine total verrückte Quizshow.'],
    ['#23', '(Sch)Leckmuschel', 'AnMaCha_-_Der_Podcast_-23_-_Leckmuschel_Final.mp3', '2026-03-07', 3895, 'LIVE aufgenommen vor der 1996er-Party der Rückspul Helden.'],
    ['#22', 'Köttbullar und andere gute Nachrichten', 'AnMaCha_-_Der_Podcast_-22_-_Koettbullar_und_andere_gute_Nachrichten.mp3', '2026-01-16', 5042, 'Serious 15: Smartphone-Sucht, ganz viel Feelgood, TV-Anmacher: Start HBO Max.'],
    ['#21', 'Wehrpflicht meets Feelgood', 'AnMaCha_-_Der_Podcast_-21_-_Wehrpflicht_meets_Feelgood.mp3', '2025-10-18', 4534, 'Marcos Tagebuch, Serious 15: Wehrpflicht, TV-Anmacher: Sportabos.'],
    ['#20', 'Giselas Camper', 'AnMaCha_-_Der_Podcast_-20_-_-Giselas_Camper_Final(1).mp3', '2025-08-10', 4007, 'Jubiläums-Folge: Camping, Urlaub und FKK.'],
    ['#19', '„Haißer Baddy“', 'AnMaCha_-_Der_Podcast_-19_-_-_Haisser_Bady.mp3', '2025-06-19', 3848, 'Serious 15: Beziehungen früher und heute, ESC-Rückblick.'],
    ['#18', 'Hypersensibel', 'AnMaCha_-_Der_Podcast_-18_-_Hypersensibel_cut.mp3', '2025-05-04', 4807, 'Serious 15: Gendern und Gender-Pay-Gap, TV-Anmacher: ESC 2025.'],
    ['#17', 'Bahnfetisch', 'AnMaCha_-_Der_Podcast_-17_-_Bahnfetisch_cut.mp3', '2025-04-12', 4594, 'Serious 15: Einkauf – online oder regional?'],
    ['#16', 'Total zerbeult', 'AnMaCha_-_Der_Podcast_-16_-_Slow-TV.mp3', '2024-05-10', 3573, 'Serious 15: Reißverschlussverkehr, TEC News: Kabelvertrag und Fritzbox.'],
    ['#15', 'Beschissen aber lustig', 'AnMaCha_-_Der_Podcast_-15_-_Beschissen_aber_lustig.mp3', '2024-01-31', 3814, 'Serious 15: Zusammenhalt in der Gesellschaft.'],
    ['#14', 'All Inclusive Streaming', 'AnMaCha_-_Der_Podcast_-014_-_All_Inclusive_Streaming.mp3', '2023-11-12', 4245, 'Serious 15: Barrierefreiheit, TEC News: Soundbars.'],
    ['#13', 'Die Bahn kommt! – Irgendwann', 'AnMaCha_-013_-_Die_Bahn_kommt-_-_Irgendwann.mp3', '2023-09-20', 3669, 'Warum die Bahn es gut meint, aber nichts auf die Reihe bekommt.'],
    ['#12', 'Hör\' mir uff!', 'AnMaCha_-_Der_Podcast_-12_-_Hoer-_mir_uff.mp3', '2023-04-24', 3957, 'Serious 15: Künstliche Intelligenz, TEC News: DSL oder Glasfaser.'],
    ['#11', 'Die Katze und die Gurke', 'AnMaCha_-011_-_Die_Katze_und_die_Gurke.mp3', '2023-02-11', 3951, 'Elektroautos, Verkaufs-Apps und ein Geburtstag.'],
    ['#10', 'Der AnMaCha Doppel-Wumms', 'AnMaCha_-_Der_Podcast_-010_-_Der_AnMaCha_Doppel-Wumms.mp3', '2023-01-07', 3981, 'Staffel 3: Wohnungsmangel, Streaming-Neuheiten und mehr.'],
    ['Spezial #1', 'Bericht von der polnisch-ukrainischen Grenze', 'AnMaCha_-_Spezial_-01_-_Bericht_von_der_polnisch-ukrainischen_Grenze.mp3', '2022-03-29', 2561, 'Marcos Bericht von der Grenze.'],
    ['#09', 'Wer billig kauft, kauft zweimal!', 'AnMaCha_09_-_Wer_billig_kauft-_kauft_zweimal.mp3', '2022-02-26', 4050, 'Staffel 2 geht weiter.'],
    ['#08', 'Ma\' wird ja wohl mal noch …', 'AnMaCha_-_Der_Podcast_-08_-_Ma-_wird_ja_wohl_mal_noch.mp3', '2021-11-04', 4478, 'Es geht in die 2. Staffel!'],
    ['#07', 'Hausgrillen (Sommerausgabe)', 'AnMaCha_-_Der_Podcast_007_-_Hausgrillen_(Sommeredition).mp3', '2021-07-17', 3868, 'Sommer zu Hause im zweiten Corona-Sommer.'],
    ['#06', '#Gemüsemüsli', 'AnMaCha_-_Der_Podcast_-006_inout_-_-Gemuesemuesli.mp3', '2021-05-23', 4144, 'Fast ohne Dauerthema – dafür mit Rezeptideen.'],
    ['#05', 'Das Wort mit „C“', 'AnMaCha_-_Der_Podcast_-005_-_Das_Wort_mit_C_fertig.mp3', '2021-04-08', 3433, 'Episode 4 … ach quatsch, 5!'],
    ['#04', 'Imbisskind', 'AnMaCha_-_Der_Podcast_-04_-_Imbisskind.mp3', '2021-02-12', 3572, 'Mensakind oder Imbisskind? Gaming und TV im Januar.'],
    ['#03', 'Neujahrstalgie', 'AnMaCha_-_Der_Podcast_-03_-_Neujahrstalgie.mp3', '2021-01-02', 3868, 'Lineares Fernsehen, Klapphandys, Dating online oder offline.'],
    ['#02', 'Es ist Typsache!', 'AnMaCha-Der_Podcast_-02_-_Es_ist_Typsache.mp3', '2020-12-29', 3654, 'Vom Sommer an den Heiligen Abend 2020.'],
    ['#01', 'Da muss man erstmal reinwachsen', 'AnMaCha_-_Der_Podcast_-01_-_Da_muss_man_erstmal_reinwachsen_edit_12.mp3', '2020-12-29', 3065, 'Die erste Ausgabe – aufgenommen im Sommer 2020.']
  ].map(([nr, title, file, date, dur, desc]) => ({ nr, title, url: M + file, date, dur, desc }));

  // ---------------------------------------------------------------- KI-Quizshow (nach „AnMaCha Spezial #2 – Die verrückte KI-Quizshow“)
  // [Frage, richtige Antwort, falsch, falsch, falsch, Kategorie]
  D.QUIZ = [
    ['Wer moderiert „AnMaCha – Der Podcast“?', 'Marco und Andrew', 'Jule und Nele', 'Tom und Jerry', 'Ernie und Bert', 'AnMaCha'],
    ['Wie heißt die Rubrik, in der es kurz ernst wird?', 'Serious 15', 'Ernst 10', 'Deep Talk 30', 'Kopf-Kino', 'AnMaCha'],
    ['Wann startet die AnMaCha & Friends Podcastnacht auf AnMaCha24?', 'Täglich ab 0 Uhr', 'Täglich ab 6 Uhr', 'Nur sonntags', 'Nur an Silvester', 'AnMaCha'],
    ['Wo wurde Folge #24 LIVE aufgenommen?', 'Podfluencer Festival in München', 'Im Kölner Dom', 'Auf der Zugspitze', 'Im Bundestag', 'AnMaCha'],
    ['Folge #23 wurde live vor welcher Party aufgenommen?', '1996er-Party der Rückspul Helden', 'Ü30-Schlagerparty', 'Silvester am Brandenburger Tor', 'Oktoberfest-Opening', 'AnMaCha'],
    ['Wie heißt Spezial #2 von AnMaCha?', 'Die verrückte KI-Quizshow', 'Wer wird Podcaster?', 'Schlag den Marco', 'Das Kabel-Duell', 'AnMaCha'],
    ['Mit welchem Slogan wirbt Clubradio24?', 'Erlebe den Beat!', 'Rock bis zum Morgen', 'Nur die Hits', 'Leise ist out', 'Radio'],
    ['Wofür steht YourTime-FM?', 'Reisen, Freizeit, Feelgood', 'Nachrichten rund um die Uhr', 'Heavy Metal', 'Börsenkurse', 'Radio'],
    ['Welcher AnMaCha-Sender ist das Kinderradio?', 'RadioFloh', 'Rockradio24', 'Zocker-FM', 'Kultradio24', 'Radio'],
    ['Wie viele eigene Radiostreams hat die AnMaCha-Radioproduktion?', '12', '3', '50', '1', 'Radio'],
    ['Wofür steht „UKW“?', 'Ultrakurzwelle', 'Unterhaltungs-Kanal-Welle', 'Universal-Klang-Weite', 'Ultra-Klarer-Wellenfunk', 'Radio'],
    ['In welchem Frequenzbereich sendet UKW-Radio in Deutschland?', '87,5 bis 108 MHz', '1 bis 5 MHz', '500 bis 600 MHz', '2,4 GHz', 'Radio'],
    ['Wofür steht „DAB“ bei DAB+?', 'Digital Audio Broadcasting', 'Deutsche Audio-Bank', 'Direkt-Analog-Band', 'Digitale Antennen-Box', 'Radio'],
    ['Aus welchen zwei Wörtern setzt sich „Podcast“ zusammen?', 'iPod und Broadcast', 'Podium und Cast', 'Pod und Castle', 'Podest und Kasten', 'Radio'],
    ['Wer gewann den Eurovision Song Contest 2024?', 'Nemo (Schweiz)', 'Loreen (Schweden)', 'Måneskin (Italien)', 'Lena (Deutschland)', 'Musik'],
    ['Wer gewann den Eurovision Song Contest 2025?', 'JJ (Österreich)', 'Nemo (Schweiz)', 'Käärijä (Finnland)', 'Duncan Laurence (Niederlande)', 'Musik'],
    ['Mit welchem Lied gewann Lena 2010 den ESC?', 'Satellite', 'Taken by a Stranger', 'Ein bisschen Frieden', 'Euphoria', 'Musik'],
    ['Wer gewann 1982 den ESC für Deutschland?', 'Nicole', 'Nena', 'Lena', 'Helene Fischer', 'Musik'],
    ['Wer sang „99 Luftballons“?', 'Nena', 'Nicole', 'Sandra', 'Kim Wilde', 'Musik'],
    ['Von wem ist „Atemlos durch die Nacht“?', 'Helene Fischer', 'Andrea Berg', 'Beatrice Egli', 'Vanessa Mai', 'Musik'],
    ['Welche Band veröffentlichte „Bohemian Rhapsody“?', 'Queen', 'The Beatles', 'ABBA', 'Pink Floyd', 'Musik'],
    ['Wo wurde das MP3-Format maßgeblich entwickelt?', 'Fraunhofer-Institut in Erlangen', 'Bei Apple in Kalifornien', 'An der Uni Oxford', 'Bei Sony in Tokio', 'Tech'],
    ['In welchem Jahr kam das erste iPhone heraus?', '2007', '2001', '2010', '1999', 'Tech'],
    ['Wofür steht „WLAN“?', 'Wireless Local Area Network', 'Wide Link Audio Node', 'World Line Access Net', 'Web Linked Area Number', 'Tech'],
    ['Wofür steht „USB“?', 'Universal Serial Bus', 'Ultra Speed Band', 'United System Board', 'Universal Sound Box', 'Tech'],
    ['Wie viele Bit hat ein Byte?', '8', '2', '10', '16', 'Tech'],
    ['Welche Firma stellt die PlayStation her?', 'Sony', 'Nintendo', 'Microsoft', 'Sega', 'Tech'],
    ['In welchem Jahr erschien der erste Game Boy?', '1989', '1995', '1982', '2001', 'Tech'],
    ['Wofür steht „HTML“?', 'Hypertext Markup Language', 'High Tech Media Link', 'Home Tool Markup List', 'Hyper Transfer Mail Line', 'Tech'],
    ['In welchem Land wurde Spotify gegründet?', 'Schweden', 'USA', 'Deutschland', 'Japan', 'Tech'],
    ['In welchem Jahr wurde YouTube gegründet?', '2005', '1998', '2010', '2013', 'Tech'],
    ['Wann wurde Netflix gegründet?', '1997', '2007', '2012', '1989', 'TV'],
    ['Seit wann gibt es die „Tagesschau“?', '1952', '1972', '1986', '1999', 'TV'],
    ['Wer moderierte als Erster „Wetten, dass..?“', 'Frank Elstner', 'Thomas Gottschalk', 'Markus Lanz', 'Michelle Hunziker', 'TV'],
    ['Welcher Sender ist für „Die Sendung mit der Maus“ verantwortlich?', 'WDR', 'RTL', 'ProSieben', 'Arte', 'TV'],
    ['Seit wann läuft der „Tatort“?', '1970', '1955', '1990', '2003', 'TV'],
    ['In welchem Jahr startete die Fußball-Bundesliga?', '1963', '1949', '1974', '1990', 'TV'],
    ['Woher kommen Köttbullar ursprünglich?', 'Schweden', 'Italien', 'Griechenland', 'Polen', 'Feelgood'],
    ['Wie hoch ist der Berliner Fernsehturm ungefähr?', '368 Meter', '120 Meter', '540 Meter', '828 Meter', 'Feelgood'],
    ['Was misst man in Dezibel?', 'Lautstärke (Schallpegel)', 'Temperatur', 'Stromverbrauch', 'Helligkeit', 'Tech'],
    ['Welches Gerät wandelt Schall in elektrische Signale um?', 'Mikrofon', 'Lautsprecher', 'Router', 'Akku', 'Tech'],
    ['Was macht ein Pop-Schutz vor dem Mikrofon?', 'Dämpft P- und B-Laute', 'Macht den Ton lauter', 'Spielt Popmusik', 'Schützt vor Regen', 'Tech'],
    ['Wie heißt die Plattform, auf der die AnMaCha-Sender laufen?', 'laut.fm', 'leise.fm', 'radio.tv', 'stream.de', 'Radio'],
    ['Was bedeutet „On Air“ im Studio?', 'Wir sind auf Sendung', 'Die Lüftung läuft', 'Das Studio ist frei', 'Feierabend', 'Radio'],
    ['Wie heißt die Rubrik über Fernsehen und Streaming?', 'TV-Anmacher', 'Glotzen-Talk', 'Serien-Sofa', 'Bildschirm-Bingo', 'AnMaCha'],
    ['Wie heißt die Rubrik über Musik bei AnMaCha?', 'Musik-Anmacher', 'Ohrwurm-Ecke', 'Hitparade 15', 'Beat-Box', 'AnMaCha']
  ];

  // ---------------------------------------------------------------- Tipps (Ladebildschirm, Pause)
  D.TIPS = [
    'Wechsle mit Y / Q jederzeit zwischen Andrew und Marco – jeder hat eigene Stärken.',
    'Andrew läuft schneller und springt höher, Marco schaltet Störsender mit einer Welle ab.',
    'Passende Themen-Funken machen deine Karten in der Live-Aufnahme stärker.',
    'Wechsle in der Aufnahme mit „Übergabe“ den Sprecher – abwechselnd reden gibt Kombo-Bonus!',
    'Der Jingle rettet jede Störung. Aber du hast nur drei pro Folge.',
    'Mit LB / N schaltest du durch die AnMaCha-Sender – auch mitten im Spiel.',
    'Im Menü „Radio & Podcast“ hörst du alle Folgen von AnMaCha – Der Podcast.',
    'Ausweichen (RT / C) macht dich kurz unverwundbar – perfekt gegen Rauschwellen.',
    'Goldene Erinnerungen 🌟 liegen meist auf den Dächern.',
    'Hörerinnen und Hörer mit „!“ haben Themen für euch – sprich sie an.'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
