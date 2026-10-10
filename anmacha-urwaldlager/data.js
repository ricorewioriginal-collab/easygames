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
  // Camp-Ereignisse. {A},{B} = zufällige Mitcamper. sym = deine Beliebtheit, en = Energie, food = Camp-Vorrat, bond = {A|B:+-n}
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
  // tägliche Freizeitaktionen
  const ACTIONS = [
    { id: 'wasch', e: '🧺', l: 'Wäsche am Fluss', d: '+14 Energie', en: 14, sym: 1 },
    { id: 'koch', e: '🍲', l: 'Fürs Camp kochen', d: '+10 Vorrat, +2 Beliebtheit', food: 10, sym: 2, en: -4 },
    { id: 'tage', e: '🎥', l: 'Kamera-Tagebuch', d: '+4 Beliebtheit, −6 Energie', sym: 4, en: -6 },
    { id: 'ruhe', e: '😴', l: 'Hängematte & Ausruhen', d: '+24 Energie', en: 24 },
    { id: 'frei', e: '🙋', l: 'Freiwillig zur Prüfung!', d: 'Du bist heute dran: +4 Beliebtheit', sym: 4, volunteer: true }
  ];
  const QUIPS = {
    intro: ['Willkommen im Urwaldlager – hier gibt es Reis, Bohnen und echte Gefühle!', 'Ihr Hörer entscheidet: Wer muss heute zur Prüfung?', 'Heute zeigt sich, wer wirklich aus dem richtigen Holz geschnitzt ist.'],
    great: ['Absolut bühnenreif! Das Camp isst heute wie Könige!', 'Sterne ohne Ende – das gab es selten!', 'Da bleibt selbst dem Dschungel der Mund offen.'],
    ok: ['Ordentlich! Das Abendessen ist zumindest gerettet.', 'Nicht schlecht, aber da war mehr drin.', 'Ein paar Sterne – der Reis wird mit Soße serviert.'],
    bad: ['Autsch. Heute gibt es nur Bohnen pur.', 'Das war… mutig. Aber nicht erfolgreich.', 'Der Magen des Camps knurrt lauter als der Jaguar.']
  };
  const SKINS = ['#f6d3b4', '#e8b98f', '#d9a47a', '#c68863', '#a86f4c', '#7a4a30'];
  const HAIRS = ['#111111', '#3b2a1c', '#7a4a20', '#d9a441', '#c0392b', '#9aa0a6'];
  const TOPS = ['#e63946', '#2a9d8f', '#3a86ff', '#f4a300', '#9b5de5', '#2b2d42'];
  const HSTYLES = [['short', 'Kurz'], ['long', 'Lang'], ['bun', 'Dutt'], ['curly', 'Locken'], ['pony', 'Zopf'], ['bald', 'Glatze']];
  root.JD = { HOSTS, CAST, TYPES, TRIALS, FINAL, EVENTS, ACTIONS, QUIPS, SKINS, HAIRS, TOPS, HSTYLES };
  if (typeof module !== 'undefined') module.exports = root.JD;
})(typeof window !== 'undefined' ? window : globalThis);
