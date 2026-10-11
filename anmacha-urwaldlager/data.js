/* Urwaldlager – Daten: Kandidaten, Prüfungen, Camp-Ereignisse, Sprüche (alles frei erfunden) */
(function (root) {
  'use strict';
  const HOSTS = [{ n: 'Kiki Klack', c: '#ff8a3d' }, { n: 'Boris Busch', c: '#37d6a0' }];
  // stats: mut / ekel / kopf (0-100). trait: diva | kumpel | stratege | clown | sensibel | tough
  const CAST = [
    { id: 'tina', name: 'Tina Tornado', job: 'Reality-Sternchen', age: 29, mut: 55, ekel: 30, kopf: 40, trait: 'diva', skin: '#f1c9a5', hair: '#e8c25a', hs: 'long', top: '#ff5fa2', acc: ['ring'] },
    { id: 'bernd', name: 'Dr. Bernd Brummel', job: 'Zahnarzt', age: 52, mut: 40, ekel: 75, kopf: 80, trait: 'stratege', skin: '#e8b98f', hair: '#8a8a8a', hs: 'short', top: '#2e7bd6', acc: ['glasses'] },
    { id: 'mandy', name: 'Mandy Möhre', job: 'Influencerin', age: 24, mut: 35, ekel: 25, kopf: 45, trait: 'diva', skin: '#f6d3b4', hair: '#ff7a3d', hs: 'pony', top: '#9b5de5', acc: ['ring'] },
    { id: 'kalle', name: 'Kalle Kranich', job: 'Ex-Torwart', age: 41, mut: 80, ekel: 55, kopf: 35, trait: 'kumpel', skin: '#d9a47a', hair: '#3b2a1c', hs: 'short', top: '#d62828', acc: ['beard'] },
    { id: 'gisela', name: 'Gisela Glanz', job: 'Schlagersängerin', age: 63, mut: 45, ekel: 60, kopf: 55, trait: 'kumpel', skin: '#f2cfb3', hair: '#e9e9e9', hs: 'bun', top: '#f4a300', acc: ['ring'] },
    { id: 'ace', name: 'Ace Aksoy', job: 'Rapper', age: 27, mut: 70, ekel: 50, kopf: 55, trait: 'clown', skin: '#b57b52', hair: '#111111', hs: 'cap', top: '#334155', acc: [] },
    { id: 'lilo', name: 'Lilo Lindner', job: 'Schauspielerin', age: 38, mut: 60, ekel: 45, kopf: 70, trait: 'sensibel', skin: '#e3b08a', hair: '#5a2a1a', hs: 'curly', top: '#2a9d8f', acc: [] },
    { id: 'dschoerg', name: 'Dschörg Dreher', job: 'Comedian', age: 45, mut: 50, ekel: 65, kopf: 75, trait: 'clown', skin: '#f0c9a8', hair: '#000000', hs: 'bald', top: '#e76f51', acc: ['glasses'] },
    { id: 'sunny', name: 'Sunny Sonnleitner', job: 'Yoga-Coach', age: 33, mut: 65, ekel: 70, kopf: 60, trait: 'sensibel', skin: '#c68863', hair: '#2b1b12', hs: 'bun', top: '#52b788', acc: [] },
    { id: 'rocco', name: 'Rocco Rüstig', job: 'Ex-Bodybuilder', age: 36, mut: 85, ekel: 40, kopf: 30, trait: 'tough', skin: '#a86f4c', hair: '#111111', hs: 'bald', top: '#222831', acc: ['beard'] },
    { id: 'nele', name: 'Nele Nebel', job: 'Wetterfee', age: 31, mut: 40, ekel: 55, kopf: 85, trait: 'stratege', skin: '#f5d5bd', hair: '#c0392b', hs: 'curly', top: '#4cc9f0', acc: ['glasses'] },
    { id: 'egon', name: 'Prinz Egon von Eisenstein', short: 'Prinz Egon', job: 'Adelsspross', age: 58, mut: 35, ekel: 35, kopf: 65, trait: 'diva', skin: '#f3d6bf', hair: '#cfcfcf', hs: 'short', top: '#6a4c93', acc: ['beard'] }
  ];
  const TYPES = [
    { id: 'held', name: 'Mutprobe-Held', e: '🦁', mut: 85, ekel: 55, kopf: 50, sym: 46, desc: 'Springt zuerst – Brücken & Höhen liegen dir. Das Publikum fiebert mit.' },
    { id: 'magen', name: 'Magen aus Stahl', e: '🦈', mut: 60, ekel: 88, kopf: 50, sym: 48, desc: 'Käfer, Schleim, Delikatessen: dir wird so schnell nicht schlecht.' },
    { id: 'kopf', name: 'Schlaukopf', e: '🦉', mut: 55, ekel: 50, kopf: 88, sym: 48, desc: 'Du behältst die Nerven und hast ein Gedächtnis wie ein Elefant.' },
    { id: 'liebling', name: 'Publikumsliebling', e: '💖', mut: 55, ekel: 55, kopf: 55, sym: 66, desc: 'Alle mögen dich schon vor der ersten Prüfung – aber das will gehalten sein.' }
  ];
  // Prüfungen: kind = Ekel | Mut | Kopf; stat = welcher Wert zählt für Computer-Kandidaten
  const TRIALS = [
    { id: 'kiste', name: 'Die Krabbelkiste', kind: 'Ekel', stat: 'ekel', e: '🪲', how: 'Tippe die Sterne in der Kiste an – aber lass die Krabbeltiere in Ruhe! Wer ein Tier berührt, verliert Zeit.' },
    { id: 'bruecke', name: 'Die Wackelbrücke', kind: 'Mut', stat: 'mut', e: '🌉', how: 'Halte die Balance! Links/rechts drücken (Pfeiltasten, A/D oder linke/rechte Bildschirmhälfte), Sterne einsammeln. Drei Stürze und es ist vorbei.' },
    { id: 'schleim', name: 'Das Schleimbecken', kind: 'Mut', stat: 'mut', e: '🟢', how: 'Halten = tauchen, loslassen = auftauchen. Sammle die Sterne am Grund, meide Blutegel – und vergiss die Luft nicht! Zeiger bewegen = schwimmen.' },
    { id: 'echo', name: 'Das Tierstimmen-Echo', kind: 'Kopf', stat: 'kopf', e: '🦜', how: 'Merke dir die Reihenfolge der Tierstimmen und spiele sie nach. Jede Runde wird länger – zwei Fehler sind erlaubt.' },
    { id: 'fress', name: 'Das Delikatessen-Dinner', kind: 'Ekel', stat: 'ekel', e: '🍽️', how: 'Tippe, wenn der Schieber im grünen Bereich ist, um die Delikatesse runterzuschlucken. Drei Würgeanfälle und das Dinner ist aus.' }
  ];
  const FINAL = { id: 'marathon', name: 'Das große Finale: Wildnis-Marathon', kind: 'Alles', e: '🏆', how: 'Drei Kurz-Prüfungen hintereinander. Jeder Stern zählt für die Hörerwahl!' };
  // Momente: ein Mitcamper ({A}) spricht dich an und du reagierst. sym = Sympathie beim (simulierten) Publikum, en = Energie, food = Vorrat, bond = Beziehung
  // when: Tageszeit-Fenster (Stunden), wo: Treffpunkt-Art
  const EVENTS = [
    { t: 'Nachts raschelt es im Camp. {A} schwört, eine Schlange im Zelt gesehen zu haben.', ch: [
      { l: 'Mutig nachsehen', r: 'Es war nur ein Gummiband! Alle lachen – du giltst als Held.', sym: 4, en: -8, bond: { A: 8 } },
      { l: 'Ruhe bewahren & beruhigen', r: '{A} ist dir sehr dankbar.', sym: 2, en: -2, bond: { A: 12 } },
      { l: 'Lauthals mitkreischen', r: 'Das Publikum liebt die Szene. {A} fand es weniger lustig.', sym: 3, en: -4, bond: { A: -6 } } ] },
    { t: 'Reis-Streit: {A} meint, du hättest dir zu große Portionen genommen.', ch: [
      { l: 'Entschuldigen', r: 'Frieden am Kochtopf.', sym: 1, bond: { A: 8 } },
      { l: 'Kontern', r: 'Hitzige Szene – die Quote steigt!', sym: 4, en: -3, bond: { A: -12 } },
      { l: 'Portion teilen', r: 'Alle sind gerührt. Der Magen knurrt trotzdem.', sym: 3, en: -4, bond: { A: 8 } } ] },
    { t: 'Holzsammeln: {A} will lieber faul in der Hängematte liegen bleiben.', ch: [
      { l: 'Allein sammeln', r: 'Rücken kaputt, Ansehen gestiegen.', sym: 3, en: -10, food: 2 },
      { l: 'Gemeinsam anpacken', r: '{A} kommt mit – zusammen geht es schneller.', sym: 2, en: -5, bond: { A: 8 } },
      { l: 'Petzen', r: 'Das Publikum findet Petzen doof.', sym: -3, bond: { A: -15 } } ] },
    { t: 'Ein Affe klaut {A} die Bananen und flüchtet auf einen Baum.', ch: [
      { l: 'Den Affen jagen', r: 'Du rettest drei Bananen und eine Wäscheleine!', sym: 3, en: -8, food: 4 },
      { l: 'Lachen und filmen', r: 'Lustig fürs Publikum, blöd für {A}.', sym: 2, bond: { A: -6 } },
      { l: 'Eigene Banane abgeben', r: '{A} schwört dir ewige Freundschaft.', sym: 3, food: -2, bond: { A: 15 } } ] },
    { t: 'Lagerfeuer-Abend: {A} will über Geheimnisse reden.', ch: [
      { l: 'Ehrlich erzählen', r: 'Ein ehrlicher Moment – rührend.', sym: 3, en: -2, bond: { A: 12 } },
      { l: 'Ordentlich aufschneiden', r: 'Das Publikum glaubt kein Wort, feiert dich aber.', sym: 5, bond: { A: -10 } },
      { l: 'Einfach zuhören', r: 'Du lernst viel – und ruhst dich aus.', sym: 2, en: 5, bond: { A: 8 } } ] },
    { t: 'Es regnet in Strömen, das Zeltdach leckt.', ch: [
      { l: 'Dach reparieren', r: 'Mit Lianen und Kaugummi: dicht!', sym: 3, en: -10 },
      { l: 'Bei {A} unterkriechen', r: 'Kuschelig und trocken.', sym: 1, en: 2, bond: { A: 14 } },
      { l: 'Im Regen duschen', r: 'Das Publikum jubelt.', sym: 4, en: -4 } ] },
    { t: '{A} verrät dir im Flüsterton, wen sie als Nächstes ins Aus wählen würde.', ch: [
      { l: 'Sag nichts weiter', r: 'Dein Wort gilt etwas.', sym: 1, bond: { A: 10 } },
      { l: 'Weiterplaudern', r: 'Das Gerücht fliegt durchs Camp, {A} ist stocksauer.', sym: 2, bond: { A: -20 } },
      { l: 'Taktisch nutzen', r: 'Schlau gespielt – das Publikum merkt es.', sym: 3, en: -3 } ] },
    { t: 'Bad im Fluss: {A} fordert dich zum Wettschwimmen heraus.', ch: [
      { l: 'Annehmen', r: 'Knappes Rennen! Du gewinnst um eine Nasenlänge.', sym: 4, en: -8, bond: { A: 6 } },
      { l: 'Ablehnen', r: 'Du bleibst am Ufer und sparst Kräfte.', sym: -1, en: 3 },
      { l: 'Schummeln', r: 'Abkürzung durchs Schilf – erwischt, aber lustig.', sym: 3, bond: { A: -15 } } ] },
    { t: 'Tagebuchzeit: Die Kamera wartet auf dein Statement.', ch: [
      { l: 'Authentisch sein', r: 'Ehrlich kommt an.', sym: 3 },
      { l: 'Showeinlage!', r: 'Ein Tanz mit Kochlöffel: Kult!', sym: 5, en: -6 },
      { l: 'Über {A} lästern', r: 'Das Publikum schmunzelt, {A} hört später davon.', sym: 4, bond: { A: -15 } } ] },
    { t: 'Nachts knurrt der Magen. {A} schleicht zum Vorratszelt.', ch: [
      { l: 'Erwischen!', r: 'Betreten schweigend geht {A} zurück ins Bett.', sym: 3, food: 3, bond: { A: -12 } },
      { l: 'Mitnaschen', r: 'Zwei Komplizen, ein Reis-Pudding.', sym: 2, food: -6, bond: { A: 12 } },
      { l: 'Wegsehen & weiterschlafen', r: 'Du schläfst tief und fest.', sym: 0, en: 6 } ] },
    { t: 'Ein Gewitter erleuchtet den Himmel. {A} hat schreckliche Angst.', ch: [
      { l: 'Trösten', r: 'Der schönste Moment der Woche.', sym: 4, en: -3, bond: { A: 15 } },
      { l: 'Einen Witz erzählen', r: 'Alle lachen – selbst der Donner.', sym: 3, bond: { A: 8 } },
      { l: 'Selbst Angst zeigen', r: 'Zwei zitternde Camper – das Publikum ist gerührt.', sym: 2, bond: { A: 5 } } ] },
    { t: 'Kochdienst: Heute gibt es Bohnen – zum fünften Mal in Folge.', ch: [
      { l: 'Wilde Kräuter suchen', r: 'Du findest Wildminze und rettest das Abendessen.', sym: 4, food: 8, en: -8 },
      { l: 'Laut meckern', r: 'Das Publikum findet Meckern nicht schön.', sym: -3 },
      { l: 'Wortlos essen', r: 'Bohnen sind auch nur Gemüse.', sym: 1, food: 2 } ] },
    { t: 'Lagerfeuer-Lied: {A} schlägt vor, gemeinsam zu singen.', ch: [
      { l: 'Voller Einsatz!', r: 'Vierstimmig und vollkommen falsch – herrlich.', sym: 4, en: -4, bond: { A: 8 } },
      { l: 'Absichtlich schief singen', r: 'Comedy-Gold.', sym: 4, bond: { A: -2 } },
      { l: 'Davonschleichen', r: 'Du verpasst das beste Lagerfeuer des Jahres.', sym: -2, en: 4 } ] },
    { t: 'Dein Zelt steht im Matsch, das von {A} ist knochentrocken.', ch: [
      { l: 'Tausch verlangen', r: '{A} ist wenig begeistert.', sym: -1, en: 6, bond: { A: -10 } },
      { l: 'Lächeln und ertragen', r: 'Das Publikum ist beeindruckt von deiner Haltung.', sym: 3, en: -6 },
      { l: 'Tausch anbieten', r: '{A} ist gerührt und hilft beim Umzug.', sym: 3, en: -8, bond: { A: 14 } } ] },
    { t: '{A} und {B} streiten lautstark über den Abwasch.', ch: [
      { l: 'Schlichten', r: 'Beide danken dir.', sym: 3, en: -5, bond: { A: 5, B: 5 } },
      { l: 'Popcorn holen', r: 'Das Publikum lacht Tränen.', sym: 4 },
      { l: 'Für {A} Partei ergreifen', r: '{A} ist glücklich, {B} verschnupft.', sym: 2, bond: { A: 12, B: -12 } } ] },
    { t: 'Plötzlich fällt die Taschenlampe aus. Es raschelt, quakt und knackt.', ch: [
      { l: 'Laut singen', r: 'Wer singt, hat keine Angst. Das Publikum summt mit.', sym: 4, en: -3 },
      { l: 'Sich an {A} klammern', r: '{A} ist nicht begeistert – aber hilft.', sym: 2, bond: { A: 8 } },
      { l: 'Mit der Stirnlampe voran', r: 'Es war nur ein Frosch. Ein sehr großer.', sym: 3, en: -5 } ] }
  ];
  const QUIPS = {
    intro: ['Willkommen im Urwaldlager – hier gibt es Reis, Bohnen und echte Gefühle!', 'Ihr Hörer entscheidet: Wer muss heute zur Prüfung?', 'Heute zeigt sich, wer wirklich aus dem richtigen Holz geschnitzt ist.'],
    great: ['Absolut bühnenreif! Das Camp isst heute wie Könige!', 'Sterne ohne Ende – das gab es selten!', 'Da bleibt selbst dem Dschungel der Mund offen.'],
    ok: ['Ordentlich! Das Abendessen ist zumindest gerettet.', 'Nicht schlecht, aber da war mehr drin.', 'Ein paar Sterne – der Reis wird mit Soße serviert.'],
    bad: ['Autsch. Heute gibt es nur Bohnen pur.', 'Das war… mutig. Aber nicht erfolgreich.', 'Der Magen des Camps knurrt lauter als der Jaguar.']
  };

  // ---------- Neu: Persönlichkeiten, Sprechblasen, Gespräche, Lagerfeuer, Tagebuch, Moderation ----------
  // fleiss = arbeitet fürs Camp, sozial = sucht Gesellschaft, drama = Streitlust, humor, empathie
  const TRAITS = {
    diva: { n: 'Diva', fleiss: .22, sozial: .55, drama: .85, humor: .35, empathie: .3, likes: ['kompliment', 'lastern'], hates: ['kritik'] },
    kumpel: { n: 'Kumpel', fleiss: .85, sozial: .85, drama: .2, humor: .55, empathie: .7, likes: ['hilfe', 'plaudern'], hates: ['lastern'] },
    stratege: { n: 'Stratege', fleiss: .55, sozial: .6, drama: .55, humor: .3, empathie: .4, likes: ['buendnis', 'lastern'], hates: ['witz'] },
    clown: { n: 'Spaßvogel', fleiss: .42, sozial: .85, drama: .45, humor: .95, empathie: .5, likes: ['witz', 'plaudern'], hates: ['kritik'] },
    sensibel: { n: 'Feingeist', fleiss: .62, sozial: .55, drama: .55, humor: .35, empathie: .92, likes: ['troesten', 'plaudern'], hates: ['witz', 'lastern'] },
    tough: { n: 'Macher', fleiss: .92, sozial: .4, drama: .55, humor: .3, empathie: .3, likes: ['hilfe', 'kritik'], hates: ['kompliment'] },
    you: { n: 'Du', fleiss: .6, sozial: .6, drama: .5, humor: .5, empathie: .5, likes: [], hates: [] }
  };
  // Verträglichkeit zwischen Typen (-1 … 1)
  const AFF = { diva: { diva: -.5, kumpel: .2, stratege: .1, clown: .1, sensibel: -.2, tough: -.6 }, kumpel: { kumpel: .7, stratege: .1, clown: .5, sensibel: .4, tough: .5 }, stratege: { stratege: -.3, clown: -.2, sensibel: 0, tough: .1 }, clown: { clown: .3, sensibel: -.1, tough: -.2 }, sensibel: { sensibel: .4, tough: -.3 }, tough: { tough: .2 } };
  const aff = (a, b) => (AFF[a] && AFF[a][b] != null) ? AFF[a][b] : (AFF[b] && AFF[b][a] != null) ? AFF[b][a] : 0;
  // eigene Sprüche je Kandidat (frei erfunden)
  const LINES = {
    tina: ['Ich bin hier der Sturm, Leute!', 'Mein Lidstrich hält länger als dieser Reis.', 'Kamera? Wo ist die Kamera?'],
    bernd: ['Erst die Zähne, dann die Würmer.', 'Statistisch gesehen überleben wir das.', 'Bitte zweimal täglich putzen – auch im Dschungel.'],
    mandy: ['Das poste ich, sobald ich wieder Netz hab!', 'Hashtag Bohnenliebe.', 'Ist das Licht hier gut für mich?'],
    kalle: ['Ich halte alles – auch die Stimmung!', 'Anpacken, nicht quatschen.', 'Früher hab ich Elfmeter gehalten, heute Holz.'],
    gisela: ['Ein Lied geht immer!', 'Kinder, früher hatten wir gar keinen Dschungel!', 'Schalalala, Holz muss da!'],
    ace: ['Yo, das Feuer brennt wie mein Flow.', 'Bohnen im Takt, Reis auf dem Beat.', 'Ich droppe gleich ’nen Dschungel-Track.'],
    lilo: ['Das ist alles so … intensiv.', 'Ich spüre die Energie dieses Ortes.', 'In meiner Rolle als Camperin fühle ich viel.'],
    dschoerg: ['Kommt ein Käfer in die Bar …', 'Ich bin nur wegen dem Buffet hier.', 'Lacht ruhig, ich hab Zeit bis Freitag.'],
    sunny: ['Tief einatmen – und den Wurm loslassen.', 'Sonnengruß für die Bohnen!', 'Alles ist im Fluss. Besonders der Fluss.'],
    rocco: ['Holz? Ich trag den ganzen Baum.', 'Protein ist Protein.', 'Kein Schmerz, kein Reis.'],
    nele: ['Heute: heiter bis wolkig mit Krabbelschauern.', 'Die Luftfeuchte liegt bei Dschungel.', 'Ich hab einen Plan – und einen Plan B.'],
    egon: ['In meinem Schloss gab es Personal für so was.', 'Man reiche mir den Reis.', 'Ein Prinz schwitzt nicht, er glänzt.']
  };
  const SAY = {
    hi: ['Na, alles fit?', 'Moin, Mitcamper!', 'Hey du!', 'Gut geschlafen?', 'Schön, dich zu sehen.'],
    work: ['Holz holen, Holz holen …', 'Einer muss es ja machen.', 'Puh, schweißtreibend!', 'Gleich geschafft!'],
    water: ['Wasser marsch!', 'Der Eimer wiegt eine Tonne.', 'Frisch aus der Lagune!'],
    cook: ['Heute gibt’s Reis à la Urwald!', 'Wer hat das Salz versteckt?', 'Riecht schon fast essbar.'],
    eat: ['Mmmh … Reis.', 'Lecker! Na ja. Essbar.', 'Ich könnte drei Portionen essen.'],
    hungry: ['Mein Magen knurrt lauter als ein Jaguar.', 'Wann gibt’s Essen?', 'Ich träume von Pommes.'],
    tired: ['Ich bin sooo müde.', 'Kurz die Augen zu …', 'Gähn!'],
    lazy: ['Arbeiten? Ich hab Urlaub.', 'Ich bewache die Hängematte.', 'Später vielleicht.'],
    happy: ['Was für ein Tag!', 'Ich liebe dieses Camp!', 'Haha, herrlich!'],
    sad: ['Ich vermisse mein Bett …', 'Heute ist nicht mein Tag.', 'Ach Mensch.'],
    chat: ['Und dann sag ich zu ihm …', 'Echt jetzt?', 'Erzähl mehr!', 'Haha, genau!', 'Weißt du, was ich gehört hab?', 'Das bleibt unter uns.'],
    argue: ['Du hast schon wieder nichts gemacht!', 'Lass mich in Ruhe!', 'Das sag ich den Zuschauern!', 'Unmöglich bist du!', 'Ich hab genug von dir!', 'Wer hat meinen Löffel?'],
    rain: ['Mein Schlafsack ist nass!', 'Regen, Regen, Regen …', 'Ab unter die Plane!'],
    cold: ['Das Feuer ist aus! Brrr!', 'Wer kümmert sich ums Feuer?'],
    scared: ['AAAH!', 'Was war das?!', 'Hilfe! Ein Monster! … ach, Gummi.'],
    cheer: ['Bravo!', 'Super gemacht!', 'Juhu!'],
    trial: ['Drückt mir die Daumen!', 'Ich zittere jetzt schon.', 'Das schaff ich!'],
    thanks: ['Danke dir!', 'Du bist ein Schatz.', 'Das vergesse ich dir nicht.'],
    sleep: ['Gute Nacht, Camp!', 'Schlaft schön!', 'Zzz …']
  };
  // Gesprächsoptionen des Spielers: Antworten je nachdem, ob es ankommt (+), neutral (0) oder nicht (-)
  const TALK = {
    plaudern: { l: '💬 Plaudern', s: 'Ein bisschen quatschen', '+': ['Schön, mit dir zu reden!', 'Du verstehst mich.', 'Ha, genau so seh ich das auch.'], '0': ['Mhm, ja.', 'Okay …', 'Kann man so sehen.'], '-': ['Ich hab gerade keinen Kopf dafür.', 'Lass mal.', 'Später, ja?'] },
    witz: { l: '😂 Witz erzählen', s: 'Gut fürs Publikum', '+': ['HAHAHA! Der war gut!', 'Ich kann nicht mehr! Hihi!', 'Du bist ja ein Komiker!'], '0': ['Hehe. Ganz nett.', 'Den kannte ich schon.', 'Höflichkeitslacher.'], '-': ['Wie geschmacklos.', 'Echt jetzt? Nicht lustig.', 'Ich lach später, versprochen.'] },
    kompliment: { l: '🌸 Kompliment', s: 'Schmeicheln', '+': ['Oh, du bist süß!', 'Endlich sagt’s mal jemand!', 'Danke, das tut gut.'], '0': ['Äh, danke.', 'Nett von dir.', 'Hm, okay.'], '-': ['Spar dir das Geschleime.', 'Was willst du von mir?', 'Bisschen dick aufgetragen.'] },
    hilfe: { l: '🤝 Hilfe anbieten', s: 'Gemeinsam anpacken', '+': ['Super, komm mit!', 'Endlich hilft mal jemand!', 'Zu zweit geht’s schneller.'], '0': ['Na gut, wenn du willst.', 'Okay.', 'Meinetwegen.'], '-': ['Ich schaff das allein.', 'Brauch ich nicht.', 'Nö.'] },
    lastern: { l: '🤫 Über {X} lästern', s: 'Riskant – kann sich herumsprechen', '+': ['Oh ja, {X} nervt total!', 'Ich dachte, das merkt nur ich!', 'Erzähl mehr …'], '0': ['Hm, weiß nicht.', 'Na ja …', 'Kann sein.'], '-': ['Das find ich nicht fair.', 'Lästern ist echt mies.', 'Sag ihr das doch selbst.'] },
    buendnis: { l: '🛡️ Bündnis vorschlagen', s: 'Ab Beziehung 40', '+': ['Abgemacht – wir halten zusammen!', 'Deal! Wir zwei gegen den Dschungel.', 'Ich bin dabei!'], '0': ['Ich überleg’s mir.', 'Vielleicht.', 'Noch nicht.'], '-': ['Ich spiel lieber allein.', 'Bündnisse sind nichts für mich.', 'Nein danke.'] },
    kritik: { l: '😤 Zur Rede stellen', s: 'Faulheit ansprechen', '+': ['Okay, du hast recht. Ich pack mehr an.', 'Stimmt … sorry.', 'Fair. Ich hol gleich Holz.'], '0': ['Ja, ja.', 'Mal sehen.', 'Ist ja gut.'], '-': ['Was fällt dir ein?!', 'Kümmer dich um deinen Kram!', 'Na warte!'] },
    troesten: { l: '🫂 Trösten', s: 'Wenn jemand traurig ist', '+': ['Danke … das hab ich gebraucht.', 'Du bist echt lieb.', 'Jetzt geht’s mir besser.'], '0': ['Danke.', 'Schon gut.', 'Geht schon.'], '-': ['Lass mich einfach.', 'Ich will allein sein.', 'Nicht jetzt.'] },
    teilen: { l: '🍌 Essen teilen', s: 'Deine Frucht abgeben', '+': ['Für mich? Wie lieb!', 'Du rettest meinen Tag!', 'Mmmh, danke!'], '0': ['Danke.', 'Oh, okay.', 'Nett.'], '-': ['Hab keinen Hunger.', 'Iss du das mal.', 'Nein, danke.'] },
    einladen: { l: '🔥 Zum Lagerfeuer einladen', s: 'Geheimauftrag', '+': ['Klar komm ich!', 'Ich bring gute Laune mit!', 'Bin dabei!'], '0': ['Mal sehen.', 'Vielleicht.', 'Hm.'], '-': ['Ich geh früh schlafen.', 'Ohne mich.', 'Nö.'] },
    entschuldigen: { l: '🙏 Entschuldigen', s: 'Für das Lästern', '+': ['Okay … Schwamm drüber.', 'Danke, dass du ehrlich bist.', 'Na gut. Vergeben.'], '0': ['Mal sehen, ob ich dir glaube.', 'Hm.', 'Wir werden sehen.'], '-': ['Zu spät!', 'Das glaub ich dir nicht.', 'Pff.'] }
  };
  // Lagerfeuer-Runden (abends, wenn du am Feuer sitzt)
  const CAMPFIRE = [
    { id: 'held', t: 'Die Buschtrommel fragt: „Wer war heute die größte Hilfe im Camp?“ Alle schauen dich an.', kind: 'name', ch: [{ l: 'Den fleißigsten Camper loben', r: 'Fair und ehrlich – das kommt gut an.', fx: 'loben' }, { l: 'Mich selbst nennen', r: 'Selbstbewusst! Ob das alle so sehen?', fx: 'selbst' }, { l: 'Diplomatisch: „Wir alle!“', r: 'Harmonie am Feuer.', fx: 'alle' }] },
    { id: 'geschichte', t: 'Gisela-Stimmung am Feuer: Jemand soll eine Geschichte erzählen. Die Runde zeigt auf dich.', kind: 'story', ch: [{ l: 'Lustige Pannengeschichte', r: 'Tränen gelacht!', fx: 'lustig' }, { l: 'Rührende Familiengeschichte', r: 'Einige wischen sich die Augen.', fx: 'ruehrend' }, { l: 'Gruselgeschichte vom Dschungelgeist', r: 'Alle rücken näher ans Feuer.', fx: 'grusel' }] },
    { id: 'lied', t: 'Jemand summt eine Melodie. Soll das Camp gemeinsam singen?', kind: 'song', ch: [{ l: 'Laut mitsingen', r: 'Vielstimmig und herrlich schief.', fx: 'singen' }, { l: 'Den Takt auf einem Topf trommeln', r: 'Rhythmus im Urwald!', fx: 'trommeln' }, { l: 'Lieber zuhören', r: 'Du genießt die Stimmung.', fx: 'zuhoeren' }] },
    { id: 'faul', t: 'Ein Camper beschwert sich am Feuer: „Manche hier tun gar nichts!“ Alle Blicke wandern.', kind: 'blame', ch: [{ l: 'Die faulste Person direkt ansprechen', r: 'Autsch – das sitzt. Drama am Feuer!', fx: 'anprangern' }, { l: 'Schlichten: „Morgen teilen wir uns die Arbeit auf.“', r: 'Ein Plan! Die Stimmung entspannt sich.', fx: 'plan' }, { l: 'Schweigen und ins Feuer starren', r: 'Die Glut knistert. Niemand sagt etwas.', fx: 'still' }] },
    { id: 'geheimnis', t: 'Die Runde spielt „Wahrheit oder Wahrheit“. Du bist dran: Was war dein peinlichster Moment?', kind: 'secret', ch: [{ l: 'Ehrlich erzählen', r: 'Mutig! Alle mögen dich ein Stück mehr.', fx: 'ehrlich' }, { l: 'Maßlos übertreiben', r: 'Keiner glaubt dir, aber alle lachen.', fx: 'flunkern' }, { l: 'Ausweichen', r: 'Etwas langweilig, aber sicher.', fx: 'ausweichen' }] },
    { id: 'strategie', t: 'Leise Frage am Feuer: „Wer, glaubst du, fliegt als Nächstes raus?“', kind: 'strat', ch: [{ l: 'Offen eine Person nennen', r: 'Diese Person hat es gehört …', fx: 'nennen' }, { l: '„Das entscheidet das Publikum.“', r: 'Souverän.', fx: 'souveraen' }, { l: 'Witz drüber machen', r: 'Lacher statt Ärger.', fx: 'witz' }] }
  ];
  // Plauderhöhle (Video-Tagebuch)
  const DIARY = [
    { l: '😌 Ehrlich über Gefühle reden', r: 'Ein ehrliches Tagebuch – das berührt.', S: 4, E: 1 },
    { l: '🎭 Große Show mit Kochlöffel-Tanz', r: 'Kult! Die Kamera liebt dich.', S: 1, E: 5 },
    { l: '🗡️ Über die größte Rivalin / den größten Rivalen sprechen', r: 'Spitze Worte – Drama garantiert, aber nicht jeder findet das nett.', S: -2, E: 6, rival: true },
    { l: '🙏 Den Mitcampern danken', r: 'So viel Teamgeist!', S: 5, E: 0, team: true }
  ];
  // Moderation (Kiki Klack & Boris Busch – eigene Figuren)
  const HOST = {
    morning: ['Guten Morgen, Urwaldlager! Hier spricht eure Buschtrommel.', 'Aufwachen, Camper! Der Dschungel wartet nicht.', 'Tag {d} im Urwaldlager – die Bohnen sind schon wach.'],
    nominate: ['Das simulierte Publikum hat entschieden: Heute muss {N} zur Prüfung!', 'Nach Auswertung der simulierten Stimmen geht heute {N} zur Prüfung.', '{N}, pack die Stirnlampe ein – du bist dran!'],
    good: ['Absolut bühnenreif! Das Camp isst heute wie Könige!', 'Sterne ohne Ende – das gab es selten!', 'Da bleibt selbst dem Dschungel der Mund offen.'],
    ok: ['Ordentlich! Das Abendessen ist zumindest gerettet.', 'Nicht schlecht, aber da war mehr drin.', 'Ein paar Sterne – der Reis wird mit Soße serviert.'],
    bad: ['Autsch. Heute gibt es nur Bohnen pur.', 'Das war … mutig. Aber nicht erfolgreich.', 'Der Magen des Camps knurrt lauter als der Jaguar.'],
    call: ['Alle Camper bitte zum Moderationsfelsen! Die Entscheidung des Tages steht an.', 'Kiki und Boris bitten zur Abendrunde am Moderationsfelsen.'],
    safe: ['{N} – du bleibst im Camp!', '{N}, du darfst weiter Bohnen essen!', 'Ein lautes Uff von {N}: sicher!'],
    out: ['{N}, für dich ist das Abenteuer heute vorbei.', '{N}, die Hängebrücke wartet – du verlässt das Urwaldlager.'],
    final: ['Das große Finale! Wer wird Urwald-Champion?', 'Drei sind noch da – und nur einer bekommt die Lianenkrone.'],
    noElim: ['Heute muss niemand gehen – genießt den Abend!', 'Durchatmen: Heute bleibt das Camp vollzählig.']
  };
  // Staffellängen
  const SEASONS = { kurz: { n: 6, l: 'Kurz · 6 Camper · 5 Tage' }, normal: { n: 8, l: 'Normal · 8 Camper · 7 Tage' }, lang: { n: 12, l: 'Lang · 12 Camper · 11 Tage' } };
  const PANTS = ['#3d4a3a', '#2b2d42', '#4a3a2a', '#556b2f', '#3a3a4a', '#6b4a2a'];
  const SKINS = ['#f6d3b4', '#e8b98f', '#d9a47a', '#c68863', '#a86f4c', '#7a4a30'];
  const HAIRS = ['#111111', '#3b2a1c', '#7a4a20', '#d9a441', '#c0392b', '#9aa0a6'];
  const TOPS = ['#e63946', '#2a9d8f', '#3a86ff', '#f4a300', '#9b5de5', '#2b2d42'];
  const HSTYLES = [['short', 'Kurz'], ['long', 'Lang'], ['bun', 'Dutt'], ['curly', 'Locken'], ['pony', 'Zopf'], ['bald', 'Glatze']];
  root.JD = { HOSTS, CAST, TYPES, TRIALS, FINAL, EVENTS, QUIPS, SKINS, HAIRS, TOPS, HSTYLES, TRAITS, AFF, aff, LINES, SAY, TALK, CAMPFIRE, DIARY, HOST, SEASONS, PANTS };
  if (typeof module !== 'undefined') module.exports = root.JD;
})(typeof window !== 'undefined' ? window : globalThis);
