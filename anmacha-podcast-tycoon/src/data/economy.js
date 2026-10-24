/* Raumfunktionen, Wirtschaftsregeln, Sponsoren, Chaos-Ereignisse, Herausforderungen, Erfolge und Hörerkommentare. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};

  // Raumfunktionen: req = Mindestausstattung (Gruppe oder Objekt-ID: Anzahl), stats = welche Objektwerte zählen, minArea = Mindestfläche
  D.roomFns = {
    aufnahme: { name: 'Aufnahmeraum', icon: '🎙️', color: '#ff4d6d', minArea: 6, req: { mikro: 2, seats: 2 }, stats: ['audio', 'absorb', 'tech', 'reliab', 'comfort'], desc: 'Hier wird aufgenommen. Mikrofone, Absorber und Technik bestimmen die Klangqualität.' },
    regie: { name: 'Regie & Schnitt', icon: '🎚️', color: '#ffb02e', minArea: 4, req: { bildschirm: 1, seats: 1 }, reqAny: ['mixer', 'interface'], stats: ['tech', 'audio', 'reliab'], desc: 'Bessere Schnittwerte und automatischer Schnitt durch das Schnitt-Team.' },
    redaktion: { name: 'Redaktion', icon: '📝', color: '#6ea8ff', minArea: 4, req: { surfaceWork: 1, seats: 1 }, stats: ['research', 'comfort'], desc: 'Recherchepunkte für jede Folge.' },
    lounge: { name: 'Gäste-Lounge', icon: '🛋️', color: '#ff7ad9', minArea: 6, req: { seats: 2 }, stats: ['comfort', 'energy'], desc: 'Bekannte Gäste kommen nur mit Lounge. Gute Laune der Gäste.' },
    kueche: { name: 'Kaffeeküche', icon: '☕', color: '#a8845a', minArea: 3, req: { energy: 1 }, stats: ['energy', 'comfort'], desc: 'Energie-Erholung für Hosts und Team, bessere Stimmung.' },
    werkstatt: { name: 'Technikwerkstatt', icon: '🔧', color: '#8a8f99', minArea: 4, req: { mo_werkbank: 1 }, stats: ['reliab', 'tech'], desc: 'Repariert Technik günstiger und hält die Zuverlässigkeit hoch.' },
    tvbuehne: { name: 'TV-Bühne', icon: '📺', color: '#c58bff', minArea: 12, req: { kamera: 2, licht: 2 }, stats: ['visual', 'tech', 'absorb'], desc: 'Videofolgen und Live-Shows (mehr Reichweite für TV-Anmacher).' },
    quizbuehne: { name: 'Quizbühne', icon: '❓', color: '#4bb8ff', minArea: 10, req: { rq_buzzer: 2, licht: 1 }, stats: ['visual', 'comfort'], desc: 'Quizshow-Aufzeichnungen mit Ticketeinnahmen.' },
    social: { name: 'Social-Media-Büro', icon: '📣', color: '#4be08a', minArea: 4, req: { bildschirm: 1, seats: 1 }, stats: ['social', 'research'], desc: 'Mehr Reichweite für jede Folge.' },
    musik: { name: 'Musikraum', icon: '🎵', color: '#c58bff', minArea: 6, req: { music: 3 }, stats: ['music', 'absorb', 'audio'], desc: 'Bonus für Musik-Anmacher und eigene Jingles.' },
    lager: { name: 'Lager', icon: '📦', color: '#6b5a3a', minArea: 3, req: { storage: 2 }, stats: ['storage', 'reliab'], desc: 'Weniger Verschleiß und Platz für Merch.' },
    shop: { name: 'Merch-Shop', icon: '🛍️', color: '#ffd36b', minArea: 4, req: { shop: 3 }, stats: ['shop', 'social', 'comfort'], desc: 'Merch-Einnahmen bei jeder Veröffentlichung.' },
    radio: { name: 'Radiostudio', icon: '📻', color: '#ff3b5c', minArea: 6, req: { rd_pult: 1, mikro: 1, onair: 1 }, stats: ['radio', 'audio', 'tech', 'absorb'], desc: 'Radiosendungen auf AnMaCha24: wenig Geld, aber Werbung für die nächste Podcast-Folge.' }
  };

  // Wirtschaftsregeln (dokumentiert in README „Regeln“). Werte je Spieltag bzw. je Folge.
  D.rules = {
    startMoney: 6000, startFans: 12, startRep: 5,
    rent: { studio: 140, campus: 420 },        // Miete je Grundstück und Tag
    revenuePerListener: 0.35,                   // Hörererlös je Hörer am Veröffentlichungstag
    tailDays: 6, tailShare: [0.42, 0.26, 0.16, 0.1, 0.06, 0.04], // Nachhören an den Folgetagen (Anteil der Starthörer)
    tailRevenue: 0.15,                          // Erlös je Nachhörer
    fanConversion: 0.05,                        // Anteil der Hörer, die Fans werden (× Qualitätsfaktor)
    fanDecayAfterDays: 4, fanDecay: 0.012,      // ohne neue Folge ab Tag 4 täglich 1,2 % Fans weniger
    merchPerFan: 0.03,                          // Merch-Umsatz je Fan und Folge bei Shop-Wert 10
    energyNight: 70, creativityNight: 25,       // nächtliche Erholung der Hosts
    reliabWearPerEpisode: 6, reliabRepairFree: 35, repairCostPerPoint: 9,
    conditionDecay: 0.6, conditionCostPerPoint: 6,
    overloadEpisodesPerDay: 2,                  // mehr Folgen pro Tag = Überlastung des Teams
    trainingCost: 250, trainingDays: 1,
    sellRefund: 0.6,
    sideJobCap: 3,                              // volle Belohnung für die ersten 3 Nebenjobs je Tag, danach abnehmend
    difficulty: [
      { id: 'locker', name: 'Locker', money: 1.3, cost: 0.8, listeners: 1.15, chaos: 0.6 },
      { id: 'standard', name: 'Standard', money: 1.0, cost: 1.0, listeners: 1.0, chaos: 1.0 },
      { id: 'profi', name: 'Profi', money: 0.85, cost: 1.2, listeners: 0.9, chaos: 1.35 }
    ]
  };

  // Fiktive Sponsorenverträge: Ziel je Folge (goal), Laufzeit in Folgen, Bonus bei Erfüllung, Malus bei Verfehlung
  D.sponsors = [
    { id: 'sp_kaffee', name: 'Röstwerk Bohnenglück', icon: '☕', minFans: 20, episodes: 3, perEpisode: 140, bonus: 300, malus: 100, goal: { minQ: 45 }, desc: 'Drei Folgen mit mindestens 45 % Qualität.' },
    { id: 'sp_kabel', name: 'Kabelkönig Strippe & Söhne', icon: '🔌', minFans: 60, episodes: 3, perEpisode: 220, bonus: 450, malus: 150, goal: { rubric: 'tec', minQ: 50 }, desc: 'Drei TEC-News-Folgen mit mindestens 50 % Qualität.' },
    { id: 'sp_camping', name: 'Zeltwerk Heringsdorf', icon: '⛺', minFans: 150, episodes: 4, perEpisode: 300, bonus: 700, malus: 250, goal: { tag: 'camping', minQ: 55 }, desc: 'Vier Folgen mit Camping-Bezug (Thema oder Gast).' },
    { id: 'sp_bahn', name: 'Funkbahn Reiseservice', icon: '🚆', minFans: 250, episodes: 3, perEpisode: 420, bonus: 900, malus: 300, goal: { tag: 'bahn', minQ: 60 }, desc: 'Drei Folgen rund um Bahn und Reisen mit 60 % Qualität.' },
    { id: 'sp_couch', name: 'Sofawelt Kuschelmeister', icon: '🛋️', minFans: 400, episodes: 4, perEpisode: 520, bonus: 1200, malus: 400, goal: { rubric: 'tv', minQ: 60 }, desc: 'Vier TV-Anmacher-Folgen mit 60 % Qualität.' },
    { id: 'sp_synth', name: 'Klangfabrik Oszillator', icon: '🎹', minFans: 600, episodes: 3, perEpisode: 700, bonus: 1500, malus: 500, goal: { rubric: 'musik', minQ: 65 }, desc: 'Drei Musik-Anmacher-Folgen mit 65 % Qualität.' },
    { id: 'sp_gut', name: 'Stiftung Sonnenschein', icon: '🌞', minFans: 900, episodes: 4, perEpisode: 800, bonus: 2000, malus: 0, goal: { rubric: 'feelgood', minQ: 60 }, desc: 'Vier Feelgood-Folgen – ohne Malus, für den guten Zweck.' },
    { id: 'sp_festival', name: 'Festival-Kollektiv Bassgeflüster', icon: '🎪', minFans: 1500, episodes: 5, perEpisode: 1100, bonus: 3500, malus: 800, goal: { minQ: 70, video: true }, desc: 'Fünf Videofolgen mit mindestens 70 % Qualität.' }
  ];

  // Chaos-Ereignisse: treten deterministisch (Seed) auf, abhängig von Zuverlässigkeit, Zustand und Schwierigkeit.
  // choices: Effekte auf Geld/Fans/Ruf/Zuverlässigkeit/Energie/Qualität der laufenden Produktion, mg = Minispiel zur Lösung, story = Story-Punkte
  D.events = [
    { id: 'ev_brumm', title: 'Brummen auf der Leitung!', text: 'Ein tiefes Brummen zieht durch alle Kanäle. Bodo vermutet eine Masseschleife.', when: 'record', choices: [
      { label: 'Signalweg prüfen (Minispiel)', mg: 'P04', win: { quality: 6, reliab: 5 }, lose: { quality: -6 } },
      { label: 'Einfach weiter aufnehmen', effect: { quality: -8, story: { chaos: 1 } } }] },
    { id: 'ev_kaffee', title: 'Kaffeemaschine streikt', text: 'Kein Kaffee. Die Stimmung kippt. Marco starrt ins Leere.', when: 'day', choices: [
      { label: 'Reparieren lassen (80 SC)', effect: { money: -80, energy: 10 } },
      { label: 'Tee-Tag ausrufen', effect: { energy: -10, story: { publikum: 1 } } }] },
    { id: 'ev_gastzuspaet', title: 'Gast steckt im Stau', text: 'Euer Gast meldet sich: zwanzig Minuten Verspätung. Mindestens.', when: 'record', needGuest: true, choices: [
      { label: 'Spontan ohne Gast beginnen', effect: { quality: -4, story: { chaos: 1 } } },
      { label: 'Warten und Hörerfragen vorziehen', effect: { quality: 2, energy: -8, story: { publikum: 1 } } }] },
    { id: 'ev_strom', title: 'Kurzer Stromausfall', text: 'Klack. Dunkel. Klack. Hell. Die Aufnahme ist kurz unterbrochen.', when: 'record', choices: [
      { label: 'Notstrom verkabeln (Minispiel)', mg: 'T01', win: { quality: 5, reliab: 4 }, lose: { quality: -8, reliab: -4 } },
      { label: 'Neu ansetzen', effect: { quality: -3, energy: -12 } }] },
    { id: 'ev_katze', title: 'Besuch im Studio', text: 'Die Nachbarskatze sitzt plötzlich auf dem Mischpult. Sie schnurrt ins Mikro.', when: 'record', choices: [
      { label: 'Als Gag in die Folge nehmen', effect: { quality: 3, fans: 8, story: { publikum: 1 } } },
      { label: 'Freundlich hinausbegleiten', effect: { quality: 0 } }] },
    { id: 'ev_server', title: 'Upload hängt', text: 'Der Rechner zeigt seit zehn Minuten 99 %. Klassiker.', when: 'publish', choices: [
      { label: 'Netzwerk umleiten (Minispiel)', mg: 'T02', win: { reach: 0.06 }, lose: { reach: -0.08 } },
      { label: 'Abwarten und Kaffee trinken', effect: { reach: -0.05 } }] },
    { id: 'ev_hall', title: 'Es hallt wie in einer Kirche', text: 'Der Raum klingt heute besonders hallig. Liegt es am Wetter?', when: 'record', choices: [
      { label: 'Akustik optimieren (Minispiel)', mg: 'T04', win: { quality: 6 }, lose: { quality: -5 } },
      { label: 'Decken aufhängen', effect: { quality: 1, energy: -6 } }] },
    { id: 'ev_kritik', title: 'Kritischer Hörerbrief', text: 'Jemand schreibt: „Zu viel Gelaber, zu wenig Inhalt.“ Autsch.', when: 'day', choices: [
      { label: 'Ehrlich antworten und verbessern', effect: { rep: 2, story: { legende: 1 } } },
      { label: 'Mit Humor nehmen', effect: { fans: 5, story: { publikum: 1 } } }] },
    { id: 'ev_kamera', title: 'Kamera zeigt alles blau', text: 'Der Weißabgleich spinnt. Andrew sieht aus wie ein Blaubeer-Gespenst.', when: 'record', needVideo: true, choices: [
      { label: 'Kamera kalibrieren (Minispiel)', mg: 'T03', win: { quality: 5 }, lose: { quality: -6 } },
      { label: 'Als Kunstfilter verkaufen', effect: { quality: -2, story: { chaos: 1 } } }] },
    { id: 'ev_rohr', title: 'Wasserrohr tropft', text: 'Im Flur tropft es. Der Gebäudezustand leidet.', when: 'day', choices: [
      { label: 'Handwerker rufen (150 SC)', effect: { money: -150, condition: 12 } },
      { label: 'Eimer drunter', effect: { condition: -6, story: { chaos: 1 } } }] },
    { id: 'ev_viral', title: 'Ein Ausschnitt geht herum', text: 'Ein lustiger Versprecher aus der letzten Folge wird überall geteilt!', when: 'day', needEpisode: true, choices: [
      { label: 'Mitlachen und Teaser posten', effect: { fans: 25, reach: 0.04, story: { publikum: 1 } } },
      { label: 'Lieber seriös bleiben', effect: { rep: 3, story: { legende: 1 } } }] },
    { id: 'ev_kabel', title: 'Kabelsalat deluxe', text: 'Jemand hat alle Kabel umgesteckt. Niemand war es.', when: 'record', choices: [
      { label: 'Neu verkabeln (Minispiel)', mg: 'T01', win: { quality: 4, reliab: 6 }, lose: { quality: -6 } },
      { label: 'Nur das Nötigste stecken', effect: { quality: -3, reliab: -3 } }] },
    { id: 'ev_hitze', title: 'Hitzewelle', text: 'Im Studio ist es so warm, dass der Schaumstoff schwitzt.', when: 'day', choices: [
      { label: 'Ventilatoren kaufen (120 SC)', effect: { money: -120, energy: 8 } },
      { label: 'Früh aufnehmen, mittags Pause', effect: { energy: -6, story: { legende: 1 } } }] },
    { id: 'ev_fanpost', title: 'Paket von Fans', text: 'Fans schicken selbstgebackene Kekse in Mikrofonform.', when: 'day', needEpisode: true, choices: [
      { label: 'In der nächsten Folge danken', effect: { fans: 12, story: { publikum: 1 } } },
      { label: 'Mit dem Team teilen', effect: { energy: 12, mood: 6 } }] }
  ];

  // Herausforderungen (eigener Spielstand, getrennte Wertung)
  D.challenges = [
    { id: 'ch_pleite', name: 'Pleite-Studio', icon: '💸', days: 20, start: { money: 1200, fans: 5 }, goal: { fans: 300 }, desc: 'Nur 1.200 SC Startgeld: Erreiche in 20 Tagen 300 Fans.' },
    { id: 'ch_tec', name: 'Nur TEC News', icon: '💾', days: 15, start: { money: 5000 }, rules: { onlyRubric: 'tec' }, goal: { avgQ: 70, episodes: 6 }, desc: 'Sechs TEC-Folgen mit Ø 70 % Qualität in 15 Tagen.' },
    { id: 'ch_chaos', name: 'Chaos-Woche', icon: '🌀', days: 7, start: { money: 6000 }, rules: { chaos: 3 }, goal: { episodes: 5, minQ: 50 }, desc: 'Dreifache Pannen: Veröffentliche fünf Folgen mit mindestens 50 % in 7 Tagen.' },
    { id: 'ch_spar', name: 'Sparfuchs', icon: '🦊', days: 25, start: { money: 4000 }, rules: { noBuild: true }, goal: { money: 9000 }, desc: 'Ohne Bauen: Habe nach 25 Tagen 9.000 SC auf dem Konto.' },
    { id: 'ch_quiz', name: 'Quizmarathon', icon: '❓', days: 10, start: { money: 3000 }, goal: { minigameWins: 8, group: 'quiz' }, desc: 'Gewinne acht Quizspiele in 10 Tagen.' },
    { id: 'ch_gast', name: 'Gästeliste', icon: '📇', days: 30, start: { money: 9000, rep: 30 }, goal: { distinctGuests: 6 }, desc: 'Sechs verschiedene Gäste in 30 Tagen.' }
  ];

  // Spiel-Erfolge (werden zusätzlich für die easygames-Erfolgsseite gemeldet)
  D.achievements = [
    { id: 'first_ep', icon: '🎙️', title: 'Auf Sendung', desc: 'Veröffentliche die erste Folge.' },
    { id: 'ten_ep', icon: '📼', title: 'Archivar', desc: 'Veröffentliche 10 Folgen.' },
    { id: 'fifty_ep', icon: '🗄️', title: 'Sendeanstalt', desc: 'Veröffentliche 50 Folgen.' },
    { id: 'q90', icon: '💎', title: 'Goldene Ohren', desc: 'Eine Folge mit mindestens 90 % Qualität.' },
    { id: 'fans1k', icon: '👥', title: 'Tausend Freunde', desc: 'Erreiche 1.000 Fans.' },
    { id: 'fans10k', icon: '🏟️', title: 'Stadionstimmung', desc: 'Erreiche 10.000 Fans.' },
    { id: 'rich', icon: '💰', title: 'Studio-Mogul', desc: 'Habe 50.000 SC auf dem Konto.' },
    { id: 'all_rubrics', icon: '🌈', title: 'Allrounder', desc: 'Veröffentliche in allen sechs Rubriken.' },
    { id: 'team5', icon: '🤝', title: 'Starkes Team', desc: 'Beschäftige fünf Leute gleichzeitig.' },
    { id: 'builder', icon: '🏗️', title: 'Baumeister', desc: 'Platziere 60 Objekte.' },
    { id: 'all_mg', icon: '🕹️', title: 'Minispiel-Profi', desc: 'Gewinne alle 24 Minispiele mindestens einmal.' },
    { id: 'chapter3', icon: '📺', title: 'Fernsehreif', desc: 'Schließe Kapitel 3 ab.' },
    { id: 'finale', icon: '🎆', title: 'Festival der Anmacher', desc: 'Schließe das große Finale ab.' },
    { id: 'guests10', icon: '⭐', title: 'Gästebuch', desc: 'Begrüße 10 verschiedene Gäste.' },
    { id: 'sponsor', icon: '🤑', title: 'Gut gesponsert', desc: 'Erfülle einen Sponsorenvertrag.' },
    { id: 'party', icon: '🎉', title: 'Partylöwe', desc: 'Spiele eine Party-Runde mit mindestens zwei Personen.' }
  ];

  // Fiktive Hörerkommentare nach Qualitätsstufe
  D.comments = {
    top: ['Beste Folge bisher, ich hab beim Abwasch laut gelacht!', 'Unfassbar gut geschnitten. Respekt!', 'Ihr seid mein Lieblings-Morgenritual.', 'Diese Folge schicke ich meiner ganzen Familie.', 'Gänsehaut beim Outro.', 'Endlich mal jemand, der das verständlich erklärt.'],
    good: ['Sehr schöne Folge, gerne mehr davon.', 'Ihr seid einfach sympathisch.', 'Habe wieder was gelernt.', 'Gute Mischung aus Spaß und Inhalt.', 'Euer Intro ist ein Ohrwurm.', 'Marco und Andrew harmonieren einfach.'],
    ok: ['Ganz nett, aber der Ton war etwas dumpf.', 'Der Mittelteil zog sich ein bisschen.', 'Thema gut, Schnitt ausbaufähig.', 'Ich hör trotzdem jede Folge!', 'Mehr Hörerfragen bitte.', 'Das Rauschen hat mich etwas gestört.'],
    bad: ['Hm, da hat es aber geknistert.', 'Ich habe nach zehn Minuten abgeschaltet, sorry.', 'War das Mikro aus?', 'Das könnt ihr besser!', 'Zu viele Ähms heute.', 'Der Ton sprang ständig – bitte nachbessern.']
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
