/* AnMaCha – Der Podcast: Jedes Stadtgebäude ist begehbar.
   Café, Bäckerei, Tonstudio, Fan-WG, Werbeagentur, Bücherei, Fitnessstudio, Friseur, Kiosk, Plattenbörse –
   eingerichtet mit KayKit-Möbeln (CC0), mit Leuten zum Reden und einer Aktion, die Bedürfnisse, Ideen oder Fan-Punkte bringt.
   Läuft mit den Werkzeugen aus home.js (Laufen, Oberfläche, Bedürfnisse). */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const RM = AMC.Rooms = {};
  let T, K;

  // f: [Modell, x, z, Drehung, Größe (m, längste Seite)]; npc: [x, z, Drehung, Anim, Rolle]; act: Aktion an Position
  const KINDS = [
    { id: 'cafe', icon: '☕', names: ['Café Kaffeesatz', 'Café Funkpause', 'Espresso-Eck'], w: 12, d: 9, wall: '#7a5238', floor: '#b08a62', light: 0xffc890, col: '#ff9d4a',
      f: [['kf_table_small', -3, -1, 0, 0.9], ['kf_chair_a_wood', -3, -0.1, Math.PI, 0.6], ['kf_chair_a_wood', -3, -1.9, 0, 0.6], ['kf_table_small', 0.5, 0.5, 0, 0.9], ['kf_chair_b', 0.5, 1.4, Math.PI, 0.6], ['kf_chair_b', 0.5, -0.4, 0, 0.6], ['kf_cabinet_medium_decorated', 3.5, -3.8, 0, 2.2], ['kf_lamp_standing', -5.2, -3.6, 0, 0.8], ['kf_pictureframe_large_a', -1.5, -4.35, 0, 0.9], ['kf_rug_oval_a', -1.2, 0, 0, 3.4]],
      npc: [[3.5, -2.6, Math.PI, 'idle', 'Barista'], [-3, -0.1, Math.PI, 'crouch', 'Stammgast'], [0.5, -0.4, 0, 'crouch', 'Studentin am Laptop']],
      act: { x: 3.5, z: -1.8, label: '☕ Cappuccino bestellen · 5 🎟️', cost: 5, need: { energy: 25, fun: 5 }, say: 'Mit extra Milchschaum. Jetzt kann die Folge kommen!' },
      talk: ['Habt ihr schon den neuen Hafer-Latte probiert? Schmeckt wie ein Podcast-Intro.', 'Hier sitzen jeden Morgen drei Leute und hören euch. Gleichzeitig. Mit Kopfhörern.', 'Mein Thema für euch: Warum ist Kaffee am Montag stärker?'] },
    { id: 'baecker', icon: '🥐', names: ['Bäckerei Krümel', 'Backstube Morgenrot'], w: 11, d: 8, wall: '#e6c79a', floor: '#c9b08a', light: 0xffe0b0, col: '#ffcf6a',
      f: [['kf_table_medium_long', 0, -2.6, 0, 3.4], ['kf_shelf_b_large_decorated', -3.5, -3.6, 0, 2.2], ['kf_shelf_b_large_decorated', 3.5, -3.6, 0, 2.2], ['kf_table_small', -3.5, 1.5, 0, 0.9], ['kf_chair_stool', -2.6, 1.5, 0, 0.5], ['kf_chair_stool', -4.4, 1.5, 0, 0.5]],
      npc: [[0, -3.5, 0, 'idle', 'Bäckermeisterin'], [2.5, 0.8, -2.4, 'idle', 'Frühaufsteher']],
      act: { x: 0, z: -1.4, label: '🥐 Brötchen und Kuchen holen · 4 🎟️', cost: 4, need: { hunger: 35 }, say: 'Zwei Franzbrötchen für Marco, eins für Andrew. Und eins für Gisela. Okay, auch für Marco.' },
      talk: ['Um vier Uhr morgens läuft bei mir AnMaCha24. Da kneten wir im Takt.', 'Ein Brötchen ohne Radio ist wie ein Podcast ohne Mikro.', 'Wusstet ihr, dass Teig besser aufgeht, wenn man ihm Musik vorspielt?'] },
    { id: 'tonstudio', icon: '🎚️', names: ['Tonstudio Pegelwert', 'Studio Hallraum'], w: 12, d: 9, wall: '#1d2030', floor: '#2a2d3a', light: 0x6a80ff, col: '#3dd6ff',
      f: [['kf_table_medium_long', 0, -2.8, 0, 3.4], ['kf_chair_b', 0, -1.7, Math.PI, 0.6], ['kf_couch_pillows', -3.6, 1.8, Math.PI / 2, 2.6], ['kf_shelf_a_big', 3.8, -3.9, 0, 2], ['kf_lamp_standing', 5.2, 2.6, 0, 0.8], ['kf_rug_rectangle_stripes_a', 0, 0.4, 0, 3.6]],
      npc: [[1.5, -2.0, -0.6, 'idle', 'Toningenieur'], [-3.2, 1.8, Math.PI / 2, 'crouch', 'Sängerin']],
      act: { x: 0, z: -1.3, label: '🎙️ Jingle aufnehmen · bringt eine Idee', idea: 'Neuer Jingle aus dem Tonstudio', need: { fun: 12 }, fan: 20, say: 'Der Jingle sitzt! Kommt in die nächste Folge.' },
      talk: ['Ihr habt einen guten Sound. Aber das Rascheln von Andrews Chips hört man bis hierher.', 'Wer im Studio flüstert, wird auf Platte verewigt.', 'Ich hab ein Mikro von 1958. Das hat mehr Geschichten als ich.'] },
    { id: 'wg', icon: '🛋️', names: ['Fan-WG Nr. 7', 'WG „Lauter Leben“'], w: 12, d: 9, wall: '#5a7a8a', floor: '#9a8a74', light: 0xfff0d8, col: '#6cd0ff',
      f: [['kf_couch', -1, -2.6, 0, 3], ['kf_armchair_pillows', 2.6, -1.4, -Math.PI / 2, 1.6], ['kf_table_low', -1, -0.9, 0, 2], ['kf_bed_single_a', -4.6, 1.8, 0, 2.4], ['kf_shelf_b_large_decorated', 3.6, -4, 0, 2], ['kf_lamp_table', 4.6, 2.6, 0, 0.6], ['kf_rug_rectangle_a', -1, -1, 0, 3.6], ['kf_pillow_a', 0.4, 1.8, 0, 0.6]],
      npc: [[-1.6, -2.6, 0, 'crouch', 'WG-Chef'], [-0.2, -2.6, 0, 'crouch', 'Mitbewohnerin'], [2.6, -1.4, -Math.PI / 2, 'crouch', 'Besuch']],
      act: { x: -1, z: 0.2, label: '🎮 Zocken mit der WG', need: { fun: 30, energy: -8 }, say: 'Revanche! Die WG gewinnt knapp – Andrew behauptet, der Controller hat gehakt.' },
      talk: ['Wir haben ein Poster von Gisela über dem Sofa!', 'Jeden Freitag Podcast-Abend. Mit Chips. Viel Chips.', 'Mein Mitbewohner kann eure Intros auswendig. Leider auch nachts.'] },
    { id: 'agentur', icon: '💼', names: ['Werbeagentur Klickfang', 'Agentur Reichweite & Söhne'], w: 12, d: 9, wall: '#e8e8ee', floor: '#7a7f8a', light: 0xffffff, col: '#ffd23f',
      f: [['kf_table_medium', -2.5, -2, 0, 1.8], ['kf_chair_a', -2.5, -1, Math.PI, 0.6], ['kf_table_medium', 2.5, -2, 0, 1.8], ['kf_chair_a', 2.5, -1, Math.PI, 0.6], ['kf_cabinet_small', -5, -3.8, 0, 0.8], ['kf_book_set', -5, -3.8, 0, 0.6], ['kf_pictureframe_medium', 0, -4.35, 0, 0.7], ['kf_lamp_standing', 5.2, -3.6, 0, 0.8]],
      npc: [[-2.5, -2.8, 0, 'idle', 'Chefin'], [2.5, -2.8, 0, 'idle', 'Grafiker']],
      act: { x: 0, z: -0.8, label: '🤝 Sponsor-Deal verhandeln · einmal am Tag', fan: 60, need: { energy: -6 }, say: 'Deal! Die Agentur sponsert eure nächste Folge. „Präsentiert von Klickfang“ – klingt doch gut.' },
      talk: ['Eure Zahlen steigen. Wir lieben steigende Zahlen.', 'Influencer? Nein. Ihr seid „Audio-Persönlichkeiten“.', 'Wenn ihr 10.000 Abos habt, buchen wir euch für die Weihnachtsfeier.'] },
    { id: 'buecher', icon: '📚', names: ['Stadtbücherei', 'Buchladen Seitenwind'], w: 12, d: 9, wall: '#5a3f2a', floor: '#8a6a4a', light: 0xffd8a0, col: '#ff8a1e',
      f: [['kf_shelf_b_large_decorated', -3.8, -4, 0, 2.2], ['kf_shelf_b_large_decorated', 0, -4, 0, 2.2], ['kf_shelf_b_large_decorated', 3.8, -4, 0, 2.2], ['kf_table_medium_long', 0, 0, 0, 3], ['kf_chair_a_wood', -1, 1, Math.PI, 0.6], ['kf_chair_a_wood', 1, 1, Math.PI, 0.6], ['kf_armchair', -4.5, 2, Math.PI / 2, 1.5], ['kf_lamp_standing', -5.2, 3, 0, 0.8]],
      npc: [[3.8, -2.8, 0, 'idle', 'Bibliothekarin'], [-1, 1, Math.PI, 'crouch', 'Leseratte']],
      act: { x: 0, z: -1.2, label: '🔎 Recherche für die Folge · bringt eine Idee', idea: 'Fakt aus der Bücherei', need: { fun: 6 }, say: 'Spannend: Das erste Radio-Programm in Deutschland lief 1923. Das kommt in die Folge!' },
      talk: ['Psst! … Ach, ihr seid es. Dann dürft ihr ein bisschen lauter sein.', 'RicoReWi hat hier ein ganzes Regal mit eigenen Geschichten.', 'Bücher sind Podcasts zum Lesen. Oder umgekehrt.'] },
    { id: 'fitness', icon: '🏋️', names: ['Fitness „Lautstark“', 'Studio Muskelkater'], w: 13, d: 9, wall: '#2a2f3a', floor: '#3a4048', light: 0xfff0f0, col: '#6cff8a',
      f: [['kf_rug_rectangle_a', -3, -1, 0, 3.4], ['kf_rug_rectangle_a', 3, -1, 0, 3.4], ['kf_chair_stool', -5.4, 2.6, 0, 0.5], ['kf_cabinet_small', 5.4, -3.8, 0, 0.8], ['kf_shelf_a_big', 0, -4, 0, 2]],
      npc: [[-3, -1, 0, 'jog', 'Trainerin'], [3, -1, 0, 'dance', 'Aerobic-Fan']],
      act: { x: 0, z: 0.4, label: '💪 Training mitmachen', need: { fun: 18, energy: -12, hunger: -8 }, say: 'Noch zehn! … Okay, drei. Aber die mit Gefühl.' },
      talk: ['Bei euren Folgen laufe ich immer 2 km/h schneller!', 'Marco, du solltest öfter kommen. Für Gisela, beim Anschieben.', 'Ein guter Podcast ist wie Cardio für die Ohren.'] },
    { id: 'friseur', icon: '💈', names: ['Salon Haarspalterei', 'Friseur Kamm & Klang'], w: 11, d: 8, wall: '#f0d8e0', floor: '#e8e2da', light: 0xffffff, col: '#ff6aa8',
      f: [['kf_chair_b', -2.5, -2.6, Math.PI, 0.7], ['kf_chair_b', 0, -2.6, Math.PI, 0.7], ['kf_cabinet_medium_decorated', 3.5, -3.4, 0, 1.8], ['kf_pictureframe_large_a', -2.5, -3.85, 0, 0.8], ['kf_pictureframe_large_a', 0, -3.85, 0, 0.8], ['kf_couch_pillows', -3.4, 1.8, Math.PI / 2, 2.2]],
      npc: [[-1.3, -2.0, 0, 'idle', 'Friseurin'], [-3.2, 1.8, Math.PI / 2, 'crouch', 'Wartender Kunde']],
      act: { x: -1.3, z: -1.2, label: '✂️ Frisur auffrischen · 8 🎟️', cost: 8, need: { fun: 20 }, say: 'Frisch gestylt! Die Fans werden es merken. Vor allem auf den Selfies.' },
      talk: ['Rico war letzte Woche hier. Die Stacheln brauchen eine Dose Gel. Pro Tag.', 'Beim Haareschneiden hören alle euren Podcast. Dann bewegt sich keiner.', 'Andrew, deine Haare sind ein Kunstwerk. Nicht anfassen lassen!'] },
    { id: 'kiosk', icon: '🗞️', names: ['Kiosk Ecke', 'Trinkhalle Funkstation'], w: 9, d: 7, wall: '#3a6a8a', floor: '#8a8a8a', light: 0xfff4d0, col: '#3dd6ff',
      f: [['kf_table_medium_long', 0, -2, 0, 3], ['kf_shelf_b_large_decorated', -2.6, -3, 0, 1.8], ['kf_shelf_b_large_decorated', 2.6, -3, 0, 1.8], ['kf_chair_stool', -2.6, 1.2, 0, 0.5]],
      npc: [[0, -2.8, 0, 'idle', 'Kioskbesitzer']],
      act: { x: 0, z: -0.9, label: '🗞️ Zeitung und Tratsch · bringt eine Idee', idea: 'Schlagzeile vom Kiosk', fan: 4, say: 'Schlagzeile: „Podcaster im Camper gesichtet – Anwohner begeistert“. Das sind ja wir!' },
      talk: ['Ralf Rauschmann kauft hier jeden Tag Batterien. Für was nur?', 'Die Lottozahlen sind 4, 8, 15 … ach, das war eine Serie.', 'Kauf ein Wassereis, dann erzähl ich dir den neuesten Tratsch.'] },
    { id: 'platten', icon: '💿', names: ['Plattenbörse Rille', 'Vinyl-Keller'], w: 12, d: 9, wall: '#2a1a30', floor: '#4a3a3a', light: 0xff8aff, col: '#ff3da8',
      f: [['kf_table_medium_long', -2.5, -1, 0, 3], ['kf_table_medium_long', 2.5, -1, 0, 3], ['kf_shelf_b_large_decorated', 0, -4, 0, 2.2], ['kf_couch', -3.6, 2.6, 0, 2.6], ['kf_lamp_standing', 5.2, 3, 0, 0.8], ['kf_rug_oval_a', 0, 1.5, 0, 3]],
      npc: [[2.5, -2.2, 0, 'idle', 'Plattenhändler'], [-2.5, 0, Math.PI, 'idle', 'Sammlerin']],
      act: { x: 0, z: 0.2, label: '🎵 Platten stöbern und reinhören', need: { fun: 22 }, song: true, say: 'Fund des Tages: eine Klavierlicht-Pressung. Sofort ins Repertoire!' },
      talk: ['Vinyl knistert. Streaming nicht. Das ist der Unterschied.', 'Ich hab eine Platte, auf der Gisela hupt. Ehrlich.', 'Wer eine Platte von hinten abspielt, hört geheime Botschaften. Meistens Rauschen.'] }
  ];
  RM.KINDS = KINDS;
  RM.kind = k => KINDS[k % KINDS.length];
  RM.name = k => { const t = RM.kind(k); return t.names[Math.floor(k / KINDS.length) % t.names.length]; };

  const day = () => (AMC.Career ? AMC.Career.state().day : 0);
  const done = key => ((Save.data.rooms || {})[key] === day());
  const mark = key => { (Save.data.rooms = Save.data.rooms || {})[key] = day(); Save.save(); };
  const hex = c => new root.THREE.Color(c).getHex();

  // ------------------------------------------------------------------ Spieltiefe: Schichten, Ruf und Spezial-Aktionen je Haus-Art
  // job: Minispiel-Schicht (x, z, Minispiel, Optionen), sp: Spezial-Aktion ab Ruf-Stufe 3 (einmal am Tag)
  const Q_RADIO = [['Wann lief in Deutschland die erste Radiosendung?', '1923', '1955', '1899', '1971'], ['Was misst „Hörer pro Stunde“?', 'Reichweite', 'Lautstärke', 'Kabellänge', 'Sendemast-Höhe'], ['Wie heißt Marcos Camper?', 'Gisela', 'Gerda', 'Gundula', 'Greta'], ['Was ist ein Jingle?', 'Kurze Erkennungsmelodie', 'Ein Kabel', 'Eine Antenne', 'Ein Mikrofonständer'], ['Wofür steht UKW?', 'Ultrakurzwelle', 'Unter-Kanal-Welle', 'Universal-Klang-Werk', 'Ultra-Kabel-Weg'], ['Was braucht ein Podcast zwingend?', 'Ein Mikrofon', 'Einen Camper', 'Ein Orchester', 'Einen Fernsehturm'], ['Wer ist bei AnMaCha der Feelgood-Typ?', 'Andrew', 'Marco', 'Ralf Rauschmann', 'Gisela'], ['Was verhindert ein Pop-Schutz?', 'Plopp-Laute', 'Regen', 'Werbung', 'Funklöcher']];
  const Q_WG = [['Wie viele Chips braucht ein Podcast-Abend?', 'Mehr als gedacht', 'Keine', 'Genau drei', 'Nur Salzstangen'], ['Wer darf Gisela fahren?', 'Nur Marco', 'Jeder', 'Andrew allein', 'Der Kiosk-Besitzer'], ['Wie heißt der Gegenspieler der Medienstadt?', 'Ralf Rauschmann', 'Kalle Klang', 'Udo Unwucht', 'Bernd Brumm'], ['Was ist ein Abo?', 'Ein Fan, der jede Folge hört', 'Ein Kabel', 'Ein Rezept', 'Ein Wohnmobil'], ['Wie spricht man AnMaCha aus?', 'Anmacher', 'An-Ma-Scha', 'Anmatscha', 'Ammacka'], ['Was hilft gegen Lampenfieber?', 'Gute Vorbereitung', 'Kaffee auf das Mikro', 'Lauter schreien', 'Licht aus']];
  const JOB = {
    cafe: { x: 3.6, z: 1.4, label: '☕ Barista-Schicht', mini: 'catch', o: { title: '☕ Barista-Schicht: Bestellungen fangen', good: ['☕', '🥐', '🍰'], bad: ['🪳', '💣'], basket: '🍽️' },
      sp: { x: -4.4, z: 2.0, label: '🎙️ Café-Live-Talk mit den Gästen', fan: 70, idea: 'Café-Live-Talk: Stimmen aus der Stadt', need: { fun: 15 }, say: 'Das ganze Café redet mit – das klingt wie ein Live-Publikum!' } },
    baecker: { x: 3.4, z: 1.2, label: '🥐 Backstube-Schicht', mini: 'catch', o: { title: '🥐 Frisch aus dem Ofen fangen', good: ['🥐', '🥖', '🧁'], bad: ['🔥', '🪳'], basket: '🧺' },
      sp: { x: 1.0, z: 1.8, label: '🧺 Brötchen-Abo für das Team', fan: 30, need: { hunger: 45, energy: 10 }, both: true, say: 'Jeden Morgen frische Brötchen im Funkhaus. Marco weint ein bisschen vor Glück.' } },
    tonstudio: { x: 3.6, z: -1.4, label: '🎚️ Session als Gastmusiker', mini: 'rhythm', o: { label: 'Studio-Session', n: 14 },
      sp: { x: 2.2, z: 2.4, label: '🎛️ Profi-Mastering der nächsten Folge', fan: 60, idea: 'Gemasterter Sound wie im Radio', need: { fun: 10 }, say: 'Kompressor, EQ, ein bisschen Magie – die nächste Folge klingt wie ein Kinofilm.' } },
    wg: { x: 3.4, z: 1.4, label: '❓ WG-Quizabend', mini: 'quiz', o: { title: '❓ WG-Quizabend', qs: Q_WG, n: 4 },
      sp: { x: 0.8, z: 2.6, label: '📣 Fanclub-Treffen veranstalten', fan: 50, fans: 12, need: { fun: 25, energy: -6 }, say: 'Zwölf neue Fanclub-Mitglieder! Sie haben T-Shirts mit Giselas Gesicht.' } },
    agentur: { x: 3.4, z: 1.6, label: '😂 Werbespot einsprechen', mini: 'qte', o: { title: '😂 Werbespot: Pointen auf den Punkt', n: 5 },
      sp: { x: -2.6, z: 1.6, label: '📊 Große Kampagne starten', fan: 160, need: { energy: -10 }, say: 'Plakate in der ganzen Stadt: „AnMaCha – Der Podcast“. Rauschmann kocht vor Wut.' } },
    buecher: { x: 3.8, z: 1.8, label: '🔎 Recherche-Quiz', mini: 'quiz', o: { title: '🔎 Fakten-Check in der Bücherei', qs: Q_RADIO, n: 4 },
      sp: { x: -3.6, z: -1.8, label: '📖 Hörbuch-Lesung aufnehmen', fan: 70, idea: 'Hörbuch-Special mit RicoReWi-Geschichte', need: { fun: 12 }, say: 'Die Lesung wird ein Hit. Die Bibliothekarin hat nur zweimal „Psst“ gesagt.' } },
    fitness: { x: 3.6, z: 2.2, label: '🕺 Aerobic-Kurs nachtanzen', mini: 'simon', o: { title: '🕺 Aerobic: Bewegungen nachmachen', rounds: 3, len: 3 },
      sp: { x: -2.6, z: 2.4, label: '🏅 Personal Training', fan: 20, need: { energy: 30, fun: 20, hunger: -10 }, both: true, say: 'Danach fühlt ihr euch unbesiegbar. Und ein bisschen wie Pudding.' } },
    friseur: { x: 2.8, z: 0.6, label: '📸 Vorher-Nachher-Fotos', mini: 'frame', o: { title: '📸 Vorher-Nachher für den Salon', subj: ['💇', '✂️', '💈'], shots: 3 },
      sp: { x: 1.0, z: 2.2, label: '💅 Promi-Styling vor der Show', fan: 40, hype: true, need: { fun: 25 }, say: 'Frisch gestylt für die Kamera. Die nächste Folge startet mit extra Stimmung!' } },
    kiosk: { x: 2.6, z: 0.8, label: '🗞️ Zeitungen sortieren', mini: 'catch', o: { title: '🗞️ Zeitungen und Tratsch fangen', good: ['📰', '🗞️', '⭐'], bad: ['💣', '🧨'], basket: '📦' },
      sp: { x: 0.4, z: 1.8, label: '🤫 Exklusiver Tratsch', fan: 40, idea: 'Exklusiv: Was Rauschmann wirklich plant', need: { fun: 10 }, say: 'Der Kioskbesitzer flüstert: Rauschmann kauft Batterien für einen riesigen Störsender …' } },
    platten: { x: 3.6, z: 1.6, label: '🎧 DJ-Set auflegen', mini: 'rhythm', o: { label: 'DJ-Set in der Plattenbörse', n: 16 },
      sp: { x: -0.4, z: 2.8, label: '💎 Rarität ergattern', fan: 90, idea: 'Raritäten-Special: Platten mit Geschichte', need: { fun: 20 }, say: 'Eine signierte Klavierlicht-Pressung! Die kommt in die Sendung.' } }
  };
  RM.JOB = JOB;
  const REP = [0, 3, 8, 15, 25, 40], REP_N = ['Neu hier', 'Bekannt', 'Stammgast', 'Freund des Hauses', 'VIP', 'Partner'];
  const PERK = ['', 'Aktion halber Preis', 'Schichten +25 % und eine Schicht mehr', 'Spezial-Aktion freigeschaltet', 'Aktion wirkt doppelt', 'Partner: +3 % Hörer in jeder Folge'];
  const rep = () => (Save.data.rep = Save.data.rep || {});
  RM.xp = id => rep()[id] || 0;
  RM.level = id => { const x = RM.xp(id); let l = 0; while (l < 5 && x >= REP[l + 1]) l++; return l; };
  RM.partners = () => KINDS.filter(t => RM.level(t.id) >= 5).length;
  RM.bonus = () => RM.partners() * 0.03;
  RM.levels = () => KINDS.reduce((a, t) => a + RM.level(t.id), 0);
  const stars = l => '★'.repeat(l) + '☆'.repeat(5 - l);
  function gain(t, n, at) {
    const l0 = RM.level(t.id); rep()[t.id] = RM.xp(t.id) + n; Save.save(); const l1 = RM.level(t.id);
    if (l1 > l0) {
      AMC.Audio.sfx('win'); AMC.UI.toast('⭐ Ruf in „' + RM.name(at.k) + '“: ' + REP_N[l1] + ' ' + stars(l1) + (PERK[l1] ? ' · Neu: ' + PERK[l1] : ''), 4200);
      if (at.R && K.alive(at.R) && at.R.w) W.particles.burst(at.R.w.x, 2, at.R.w.z, 0xffd23f, 50, { speed: 6 });
      if (l1 === 5 && AMC.Feed) AMC.Feed.post(t.icon, RM.name(at.k) + ' ist jetzt offizieller AnMaCha-Partner!', 'story');
    }
    if (AMC.Missions && AMC.Missions.job) AMC.Missions.job(t.id, -1);
  }
  RM.gain = (id, n) => { const t = KINDS.find(x => x.id === id); if (t) gain(t, n, { k: KINDS.indexOf(t) }); };
  function repPanel(t, k) {
    const l = RM.level(t.id), x = RM.xp(t.id), nx = REP[Math.min(5, l + 1)];
    const rows = REP_N.map((n, i) => '<div class="st-item' + (i === l ? ' on' : '') + '"><span class="st-ic">' + (i <= l ? '⭐' : '🔒') + '</span><span><b>' + stars(i) + ' ' + n + '</b><small>' + (PERK[i] || 'Erster Besuch') + ' · ab ' + REP[i] + ' Ruf</small></span></div>').join('');
    const all = KINDS.map(o => o.icon + ' ' + stars(RM.level(o.id))).join(' · ');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>⭐ Ruf: ' + U.esc(RM.name(k)) + '</h2><button class="btn small" data-nav id="rpB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">Ruf ' + x + (l < 5 ? ' / ' + nx + ' bis „' + REP_N[l + 1] + '“' : ' · Partner!') + '. Ruf bekommt ihr durch Schichten, Aktionen und Gespräche. Er gilt für alle Häuser dieser Art.</p><div class="st-list">' + rows + '</div><p class="hint">Alle Läden: ' + all + ' · Partner ' + RM.partners() + '/' + KINDS.length + '</p></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#rpB').onclick = () => AMC.UI.close(s);
  }
  // Schichten am Tag (Zähler je Haus-Art)
  const shifts = id => { const j = (Save.data.jobs = Save.data.jobs || {}), e = j[id]; return e && e.d === day() ? e.n : 0; };
  const addShift = id => { const j = (Save.data.jobs = Save.data.jobs || {}); j[id] = { d: day(), n: shifts(id) + 1, tot: ((j[id] || {}).tot || 0) + 1 }; Save.save(); };
  RM.shiftsTotal = () => Object.values(Save.data.jobs || {}).reduce((a, e) => a + (e.tot || 0), 0);
  // Station sichtbar machen: Leuchtring am Boden und schwebendes Symbol
  function marker(g, x, z, icon, col, locked) {
    const ring = new T.Mesh(new T.RingGeometry(0.55, 0.68, 32), new T.MeshBasicMaterial({ color: hex(col), transparent: true, opacity: locked ? 0.25 : 0.7, toneMapped: false, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.03, z); g.add(ring);
    const tx = W.textTex([locked ? '🔒' : icon], { w: 128, h: 128, size: 80, bg: '#14161f', accent: col }), sp = new T.Sprite(new T.SpriteMaterial({ map: tx, transparent: true, opacity: locked ? 0.55 : 1 }));
    sp.scale.set(0.6, 0.6, 1); sp.position.set(x, 1.9, z); sp.userData.bob = Math.random() * 6; g.add(sp);
    return { ring, sp };
  }

  function build(t, k) {
    const sc = new T.Scene(), g = new T.Group(); sc.add(g); sc.background = new T.Color(0x07080d);
    const hw = t.w / 2, hd = t.d / 2;
    sc.add(new T.HemisphereLight(0xfff1e0, 0x2a2030, 0.85));
    const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(3, 9, 7); sc.add(sun);
    const pl = new T.PointLight(t.light, 1.3, 16); pl.position.set(0, 3.2, -1); sc.add(pl);
    const floor = new T.Mesh(new T.PlaneGeometry(t.w, t.d), W.mat(hex(t.floor), { r: 0.85 })); floor.rotation.x = -Math.PI / 2; g.add(floor);
    const wm = W.mat(hex(t.wall), { r: 0.9 }), acc = W.mat(hex(t.col), { e: hex(t.col), ei: 0.6 });
    W.box(t.w, 3.8, 0.2, wm, 0, 1.9, -hd - 0.1, g, false); W.box(0.2, 3.8, t.d, wm, -hw - 0.1, 1.9, 0, g, false); W.box(0.2, 3.8, t.d, wm, hw + 0.1, 1.9, 0, g, false);
    W.box(t.w, 0.12, 0.24, acc, 0, 3.75, -hd, g, false);
    // Schild an der Rückwand
    const sign = W.textTex([t.icon + ' ' + RM.name(k)], { w: 768, h: 128, size: 64, accent: t.col });
    const sm = new T.Mesh(new T.PlaneGeometry(4.2, 0.7), new T.MeshBasicMaterial({ map: sign, toneMapped: false })); sm.position.set(-hw + 2.6, 3.15, -hd + 0.02); g.add(sm);
    // Senderlogo als Poster an der Seitenwand (jede Location hört einen anderen Sender)
    const st = D.STATIONS[k % D.STATIONS.length], lg = W.logoPlane(st.slug, 1.4); lg.position.set(hw - 0.03, 2.1, -hd + 2.2); lg.rotation.y = -Math.PI / 2; g.add(lg);
    // KayKit-Möbel
    const solids = [];
    t.f.forEach(([n, x, z, ry, s]) => {
      const m = W.prop(n, s * 0.8); if (!m) return; m.position.set(x, 0, z); m.rotation.y = ry || 0; g.add(m);
      if (!/rug|pictureframe|pillow|book/.test(n)) { const sz = m.userData.size; solids.push({ x, z, r: Math.max(0.3, Math.min(sz.x, sz.z) * 0.45) }); }
    });
    // Tür vorne
    W.box(1.6, 0.05, 0.6, acc, -hw + 1.4, 0.03, hd - 0.3, g, false);
    return { sc, g, solids, st };
  }

  RM.open = function (k, host, kit, onClose) {
    T = root.THREE; K = kit;
    const t = RM.kind(k), B = build(t, k), hw = t.w / 2, hd = t.d / 2, key = 'r' + k;
    const R = K.begin({ kind: 'room', sc: B.sc, g: B.g, onClose, busy: 0, t: 0, who: host || 'andrew', figs: [], npcs: [] });
    const me = W.hosts[R.who]; if (me) { if (me.root.parent) me.root.parent.remove(me.root); B.g.add(me.root); me.root.visible = true; }
    // Leute (asynchron, das Spiel läuft sofort weiter)
    (async () => {
      for (let i = 0; i < t.npc.length; i++) {
        const [x, z0, ry, anim0, role] = t.npc[i], anim = anim0 === 'crouch' ? 'idle' : anim0, z = anim0 === 'crouch' ? z0 + 0.9 : z0, fig = await W.makeFan(4000 + k * 17 + i * 5).catch(() => null);
        if (!K.alive(R)) { if (fig) fig.dispose(); return; }
        if (!fig) continue;
        fig.root.position.set(x, 0, z); fig.root.rotation.y = ry; B.g.add(fig.root); fig.play(anim);
        const n = { fig, x, z, ry, anim, role, i, name: AMC.Talk && AMC.Talk.who ? AMC.Talk.who({ x: x + k * 31, z: z + k * 7, seed: 4000 + k * 17 + i * 5 }).name : D.FAN_NAMES[(k + i) % D.FAN_NAMES.length] };
        R.npcs.push(n); R.figs.push(fig);
      }
    })();
    const say = txt => K.say(txt, 4600), J = JOB[t.id], lvl = () => RM.level(t.id);
    const mk = { job: marker(B.g, J.job ? J.x : J.x, J.z, J.label.split(' ')[0], t.col, false), sp: marker(B.g, J.sp.x, J.sp.z, J.sp.label.split(' ')[0], '#ffd23f', lvl() < 3) };
    const spots = () => {
      const list = R.npcs.map(n => ({ x: n.x, z: n.z, r: 1.7, label: '💬 ' + n.name + ' (' + n.role + ')', run: () => talk(n) }));
      const a = t.act, used = done(key + ':act');
      const cost = a.cost && lvl() >= 1 ? Math.ceil(a.cost / 2) : a.cost;
      list.push({ x: a.x, z: a.z, r: 1.4, label: used ? a.label.split(' · ')[0] + ' · heute schon' : cost !== a.cost ? a.label.replace(a.cost + ' 🎟️', cost + ' 🎟️ (Stammgast)') : a.label, run: () => act() });
      const lim = lvl() >= 2 ? 3 : 2, n = shifts(t.id);
      list.push({ x: J.x, z: J.z, r: 1.3, label: J.label + (n >= lim ? ' · morgen wieder' : ' · Schicht ' + (n + 1) + '/' + lim), run: () => job() });
      list.push({ x: J.sp.x, z: J.sp.z, r: 1.3, label: lvl() < 3 ? '🔒 ' + J.sp.label.replace(/^\S+ /, '') + ' · ab Ruf ★★★' : J.sp.label + (done(key + ':sp') ? ' · heute schon' : ''), run: () => special() });
      list.push({ x: -hw + 1.4, z: hd - 0.5, r: 1.3, label: '🚪 Raus in die Stadt', run: () => AMC.Home.close() });
      return list;
    };
    function talk(n) {
      const f = n.fig; f.root.rotation.y = Math.atan2(R.w.x - n.x, R.w.z - n.z); f.play(U.pick(['yes', 'arms']), { restart: true }); setTimeout(() => K.alive(R) && f.play(n.anim, { fade: 0.4 }), 1800);
      const first = !done(key + ':t' + n.i); say(n.name + ' (' + n.role + '): „' + t.talk[(n.i + R.talkN++) % t.talk.length] + '“' + (first ? ' · +4 ❤️ +2 🎟️' : ''));
      if (first) { mark(key + ':t' + n.i); if (AMC.Social) AMC.Social.add(n.name, 4); Save.earn(2); }
      AMC.Audio.sfx('talk');
    }
    function act() {
      const a = t.act, cost = a.cost && lvl() >= 1 ? Math.ceil(a.cost / 2) : a.cost, x2 = lvl() >= 4 ? 2 : 1; if (done(key + ':act')) { say('Heute schon gemacht – morgen wieder!'); AMC.Audio.sfx('miss'); return; }
      if (cost && Save.data.fan < cost) { say('Zu wenig Fan-Punkte (' + cost + ' 🎟️ nötig).'); AMC.Audio.sfx('miss'); return; }
      if (cost) Save.data.fan -= cost;
      mark(key + ':act');
      const n = K.needs(R.who); Object.entries(a.need || {}).forEach(([kk, v]) => { n[kk] = U.clamp((n[kk] || 0) + v * (v > 0 ? x2 : 1), 0, 100); });
      let extra = '';
      if (a.idea) { n.ideas = n.ideas || []; if (n.ideas.length < 3) { n.ideas.push(a.idea); extra += ' · 💡 Idee für die Aufnahme'; } else extra += ' · 💡 Ideen-Speicher voll'; }
      if (a.fan) extra += ' · +' + Save.earn(a.fan) + ' 🎟️';
      if (a.song && AMC.Audio.song) { try { AMC.Audio.song(U.irand(0, 20)); } catch (e) { } }
      Save.save(); K.drawNeeds(); R.busy = 1.2;
      if (me) me.play(U.pick(['yes', 'arms', 'dance']), { restart: true, fade: 0.15 });
      W.particles.burst(a.x, 1.6, a.z, hex(t.col), 30, { speed: 5 }); AMC.Audio.sfx('perfect');
      say((AMC.Data.HOSTS[R.who] || {}).name + ': „' + a.say + '“' + extra);
      if (AMC.Career) AMC.Career.mark('dance');
      gain(t, 1, { k, R });
    }
    // Schicht: Minispiel im Laden, bringt Fan-Punkte, Ruf und manchmal eine Idee
    function job() {
      if (R.mini) return; const lim = lvl() >= 2 ? 3 : 2;
      if (shifts(t.id) >= lim) { say('Für heute genug geschuftet (' + lim + '/' + lim + ' Schichten). Morgen wieder!'); AMC.Audio.sfx('miss'); return; }
      const n0 = K.needs(R.who); if (n0.energy < 12) { say('😴 Zu müde für eine Schicht. Erst ausruhen – zu Hause, in Gisela oder mit Kaffee.'); AMC.Audio.sfx('miss'); return; }
      const box = U.el('div', 'sh-mini'); box.id = 'hmMini'; U.$('homeUi').appendChild(box); R.busy = 99;
      if (me) { me.play(J.mini === 'rhythm' || J.mini === 'simon' ? 'dance' : 'push', { fade: 0.2 }); R.w.anim = 'busy'; }
      const go = song => {
        if (!K.alive(R)) { box.remove(); return; }
        const o = Object.assign({ color: t.col }, J.o, song ? { song } : {});
        R.mini = { box, ctl: AMC.Minis.start(box, J.mini, o, q => {
          if (!K.alive(R)) return;
          R.mini.ctl.destroy(); box.remove(); R.mini = null; R.busy = 0; R.w.anim = '';
          addShift(t.id);
          const n = K.needs(R.who), fan = Save.earn(Math.round((14 + q * 46) * (lvl() >= 2 ? 1.25 : 1)));
          n.energy = Math.max(0, n.energy - 8); n.fun = Math.min(100, n.fun + 4 + q * 8);
          let extra = ''; if (q >= 0.7 && (n.ideas || []).length < 3) { n.ideas = n.ideas || []; n.ideas.push(t.icon + ' Geschichte aus der Schicht: ' + RM.name(k)); extra = ' · 💡 Idee'; }
          Save.save(); K.drawNeeds();
          say((q >= 0.85 ? '🔥 Mitarbeiter des Tages!' : q >= 0.5 ? '👍 Gute Schicht!' : '😅 Holprige Schicht – aber bezahlt wird trotzdem.') + ' +' + fan + ' 🎟️ · +' + (q >= 0.75 ? 2 : 1) + ' Ruf' + extra);
          AMC.Audio.sfx(q >= 0.6 ? 'applause' : 'ok'); if (me) me.play(q >= 0.6 ? 'arms' : 'idle', { restart: true, fade: 0.2 });
          gain(t, q >= 0.75 ? 2 : 1, { k, R });
          if (AMC.Missions && AMC.Missions.job) AMC.Missions.job(t.id, q);
        }) };
      };
      if (J.mini === 'rhythm') AMC.Audio.song(U.pick(D.WISHES.concat(AMC.Home.ownedSongs ? AMC.Home.ownedSongs() : [])).id).catch(() => null).then(go); else go(null);
    }
    // Spezial-Aktion ab Ruf-Stufe 3, einmal am Tag
    function special() {
      const sp = J.sp;
      if (lvl() < 3) { say('🔒 Erst Ruf ★★★ in diesem Laden (jetzt ' + stars(lvl()) + '). Schichten, Aktionen und Gespräche bringen Ruf.'); AMC.Audio.sfx('miss'); return; }
      if (done(key + ':sp')) { say('Heute schon gemacht – morgen wieder!'); AMC.Audio.sfx('miss'); return; }
      mark(key + ':sp');
      (sp.both ? ['andrew', 'marco'] : [R.who]).forEach(id => { const n = K.needs(id); Object.entries(sp.need || {}).forEach(([kk, v]) => { n[kk] = U.clamp((n[kk] || 0) + v, 0, 100); }); });
      const n = K.needs(R.who); let extra = '';
      if (sp.idea) { n.ideas = n.ideas || []; if (n.ideas.length < 3) { n.ideas.push(sp.idea); extra += ' · 💡 Idee'; } }
      if (sp.fans && AMC.Social) AMC.Social.add(RM.name(k), sp.fans);
      if (sp.hype) { Save.data.hypeBoost = 8; extra += ' · +8 Stimmung in der nächsten Folge'; }
      if (sp.fan) extra += ' · +' + Save.earn(sp.fan) + ' 🎟️';
      Save.save(); K.drawNeeds(); R.busy = 1.4;
      if (me) me.play('arms', { restart: true, fade: 0.15 });
      W.particles.burst(sp.x, 1.8, sp.z, 0xffd23f, 50, { speed: 6 }); AMC.Audio.sfx('star');
      say((AMC.Data.HOSTS[R.who] || {}).name + ': „' + sp.say + '“' + extra);
      gain(t, 2, { k, R });
    }
    R.talkN = 0;
    R.w = K.walker({ x: -hw + 1.4, z: hd - 1.2, fig: me, bounds: { x0: -hw + 0.6, x1: hw - 0.6, z0: -hd + 0.7, z1: hd - 0.4 }, solids: () => B.solids.concat(R.npcs.map(n => ({ x: n.x, z: n.z, r: 0.4 }))), spots, camOff: [0, 6 + t.d * 0.05, 6.4 + t.d * 0.12] });
    R.dispose = () => { R.figs.forEach(f => { if (f.root.parent) f.root.parent.remove(f.root); f.dispose && f.dispose(); }); };
    const ui = K.hud(t.icon + ' ' + RM.name(k), '<button type="button" class="btn small" id="rmRep">⭐ Ruf</button>');
    ui.querySelector('#rmRep').onclick = () => repPanel(t, k);
    const top = document.querySelector('#homeUi .hm-top'); if (top) top.insertAdjacentHTML('beforeend', '<small class="hm-desc">' + stars(lvl()) + ' ' + REP_N[lvl()] + ' · ' + U.esc(B.st.name) + ' läuft · Aktion, Schicht und Spezial an den Leuchtringen</small>');
    R.tick = () => { [mk.job, mk.sp].forEach(m => { m.sp.position.y = 1.9 + Math.sin(R.t * 2.4 + m.sp.userData.bob) * 0.1; m.ring.material.opacity = (m === mk.sp && lvl() < 3 ? 0.2 : 0.5) + Math.sin(R.t * 3) * 0.15; }); return false; };
    K.drawNeeds();
    W.particles.attach(B.sc);
    AMC.Audio.sfx('door');
    const v = Save.data.roomsSeen = Save.data.roomsSeen || {};
    if (!v[k]) { v[k] = 1; const fp = Save.earn(15); Save.save(); setTimeout(() => AMC.UI.toast('🚪 Neuer Ort entdeckt: ' + RM.name(k) + ' · +' + fp + ' 🎟️ · ' + Object.keys(v).length + ' Orte'), 700); }
    setTimeout(() => K.alive(R) && say(t.icon + ' Willkommen in „' + RM.name(k) + '“! ' + t.talk[0]), 600);
    return R;
  };
})(typeof window !== 'undefined' ? window : globalThis);
