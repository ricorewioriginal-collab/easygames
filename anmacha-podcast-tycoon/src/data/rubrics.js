/* Rubriken und 60 Themenideen. Alles fiktiv und eigens formuliert; keine echten Sendungen, Marken oder Personen.
   Felder Thema: research/tech 1..5 (Bedarf), aud = Zielgruppe, trend = { kind, peak, width } (Trendverlauf über Spieltage),
   tags = Stichworte (passende Gäste/Segmente). Wiederholungsabzug rechnet die Simulation (je frühere Folge zum Thema). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};

  D.rubrics = [
    { id: 'wenig', name: 'Wenig Interessantes aus unserem Leben', short: 'Wenig Interessantes', icon: '☕', color: '#ffb02e', pop: 1.0, host: 'andrew', needs: { humor: 3, research: 1, tech: 1 },
      desc: 'Alltagsgeschichten, kleine Pannen und große Gefühle über Kleinigkeiten. Lebt von guter Laune der Hosts.' },
    { id: 'serious15', name: 'Serious 15', short: 'Serious 15', icon: '🧭', color: '#6ea8ff', pop: 0.85, host: 'both', needs: { humor: 0, research: 4, tech: 2 },
      desc: 'Fünfzehn ernsthafte Minuten: abwägen, Perspektiven zeigen, sachlich bleiben. Gute Recherche zahlt sich aus.' },
    { id: 'tec', name: 'TEC News', short: 'TEC News', icon: '💾', color: '#6ef0ff', pop: 1.05, host: 'marco', needs: { humor: 1, research: 3, tech: 4 },
      desc: 'Technik verständlich: Probleme erklären, Infos prüfen, Lösungen zeigen. Braucht saubere Technik im Studio.' },
    { id: 'tv', name: 'TV-Anmacher', short: 'TV-Anmacher', icon: '📺', color: '#ff7ad9', pop: 1.1, host: 'marco', needs: { humor: 2, research: 2, tech: 3 },
      desc: 'Film-, Serien- und Fernsehtrends als Quiz und Plauderei – allgemein gehalten, ohne fremde Bilder oder Marken.' },
    { id: 'feelgood', name: 'Feelgood', short: 'Feelgood', icon: '🌈', color: '#4be08a', pop: 0.95, host: 'andrew', needs: { humor: 2, research: 2, tech: 1 },
      desc: 'Gute Nachrichten, wertschätzende Hörerpost und kleine positive Challenges.' },
    { id: 'musik', name: 'Musik-Anmacher', short: 'Musik-Anmacher', icon: '🎵', color: '#c58bff', pop: 1.0, host: 'andrew', needs: { humor: 1, research: 2, tech: 3 },
      desc: 'Musikentdeckungen mit ausschließlich selbst produzierter Ingame-Musik. Ein Musikraum hilft enorm.' }
  ];

  // Segmentvorlagen einer Folge (Produktionsmappe: 2–5 Rubriken-Blöcke plus feste Intro/Outro)
  D.segments = {
    wenig: ['Kaffeetassen-Talk', 'Panne der Woche', 'Was wir gelernt haben'],
    serious15: ['Faktenlage', 'Perspektiven', 'Unser Fazit'],
    tec: ['Gerät der Woche', 'Problem & Lösung', 'Mythos-Check'],
    tv: ['Trend-Radar', 'Szene erraten', 'Couch-Urteil'],
    feelgood: ['Gute Nachricht', 'Hörerpost', 'Mini-Challenge'],
    musik: ['Studio-Session', 'Klangreise', 'Beat-Bau']
  };

  const T = (id, rubric, title, tags, research, tech, aud, kind, peak, width) => ({ id, rubric, title, tags, research, tech, aud, trend: { kind, peak, width } });
  D.topics = [
    // Wenig Interessantes aus unserem Leben (10)
    T('w01', 'wenig', 'Der Kaffeeautomat, der nur dienstags funktioniert', ['alltag', 'technik', 'kaffee'], 1, 1, 'alle', 'evergreen', 0, 0),
    T('w02', 'wenig', 'Wer hat die Fernbedienung in den Kühlschrank gelegt?', ['alltag', 'nostalgie'], 1, 1, 'familie', 'evergreen', 0, 0),
    T('w03', 'wenig', 'Unser erster Versuch, Brot zu backen', ['alltag', 'essen'], 1, 1, 'alle', 'welle', 12, 8),
    T('w04', 'wenig', 'Zwölf Minuten Stau am Supermarkt-Parkplatz', ['alltag', 'auto'], 1, 1, 'alle', 'evergreen', 0, 0),
    T('w05', 'wenig', 'Die Pflanze, die einfach nicht sterben will', ['alltag', 'natur'], 1, 1, 'familie', 'saison', 20, 10),
    T('w06', 'wenig', 'Andrews Socken-Sortiersystem', ['alltag', 'humor'], 1, 1, 'jung', 'evergreen', 0, 0),
    T('w07', 'wenig', 'Marco und das Navi, das ihn ins Maisfeld schickte', ['alltag', 'auto', 'technik'], 1, 2, 'alle', 'welle', 30, 10),
    T('w08', 'wenig', 'Der Tag, an dem der Wecker gewonnen hat', ['alltag', 'humor'], 1, 1, 'jung', 'evergreen', 0, 0),
    T('w09', 'wenig', 'Camping im Wohnzimmer: Ein Erfahrungsbericht', ['alltag', 'camping'], 1, 1, 'familie', 'saison', 45, 12),
    T('w10', 'wenig', 'Warum Bahnsteigkanten so spannend sind', ['alltag', 'bahn'], 2, 1, 'nostalgie', 'evergreen', 0, 0),
    // Serious 15 (10)
    T('s01', 'serious15', 'Wie viel Bildschirmzeit ist gesund?', ['familie', 'technik', 'gesundheit'], 4, 2, 'familie', 'evergreen', 0, 0),
    T('s02', 'serious15', 'Ehrenamt im Ort: Wer hält die Vereine am Laufen?', ['gesellschaft', 'ort'], 4, 1, 'alle', 'welle', 25, 12),
    T('s03', 'serious15', 'Pünktlichkeit im Nahverkehr – was steckt dahinter?', ['bahn', 'gesellschaft'], 4, 2, 'alle', 'welle', 18, 9),
    T('s04', 'serious15', 'Falschmeldungen erkennen: eine kleine Anleitung', ['medien', 'technik'], 5, 2, 'alle', 'evergreen', 0, 0),
    T('s05', 'serious15', 'Lebensmittel retten statt wegwerfen', ['essen', 'natur'], 4, 1, 'familie', 'saison', 35, 12),
    T('s06', 'serious15', 'Einsamkeit im Alter und was Nachbarschaft bewirkt', ['gesellschaft', 'feelgood'], 5, 1, 'alle', 'evergreen', 0, 0),
    T('s07', 'serious15', 'Datenschutz im Alltag ohne Panik', ['technik', 'medien'], 5, 3, 'technik', 'welle', 40, 10),
    T('s08', 'serious15', 'Stromsparen: Was bringt wirklich etwas?', ['technik', 'natur'], 4, 3, 'familie', 'saison', 55, 14),
    T('s09', 'serious15', 'Wie entstehen eigentlich Nachrichten?', ['medien', 'radio'], 4, 2, 'alle', 'evergreen', 0, 0),
    T('s10', 'serious15', 'Zwischen Stadt und Land: Wo wollen wir wohnen?', ['gesellschaft', 'ort'], 4, 1, 'alle', 'welle', 60, 15),
    // TEC News (10)
    T('t01', 'tec', 'Warum das WLAN im Keller streikt', ['technik', 'netz'], 3, 4, 'technik', 'evergreen', 0, 0),
    T('t02', 'tec', 'Akkus richtig laden – Mythen und Fakten', ['technik', 'akku'], 3, 3, 'alle', 'evergreen', 0, 0),
    T('t03', 'tec', 'Der beste Platz für das Podcast-Mikrofon', ['technik', 'audio', 'radio'], 2, 4, 'technik', 'evergreen', 0, 0),
    T('t04', 'tec', 'Retro-Computer im Keller wiederbelebt', ['technik', 'nostalgie'], 3, 4, 'nostalgie', 'welle', 22, 8),
    T('t05', 'tec', 'Passwörter, die man sich merken kann', ['technik', 'netz', 'medien'], 3, 2, 'alle', 'evergreen', 0, 0),
    T('t06', 'tec', 'Smarte Glühbirnen: Fluch oder Segen?', ['technik', 'haus'], 3, 3, 'technik', 'welle', 33, 10),
    T('t07', 'tec', 'Kabelsalat besiegen in fünf Schritten', ['technik', 'audio', 'humor'], 2, 3, 'alle', 'evergreen', 0, 0),
    T('t08', 'tec', 'Was ein Audiointerface eigentlich tut', ['technik', 'audio'], 3, 5, 'technik', 'evergreen', 0, 0),
    T('t09', 'tec', 'Navigation ohne Netz im Camper', ['technik', 'camping', 'auto'], 3, 4, 'alle', 'saison', 48, 12),
    T('t10', 'tec', 'Die Technik hinter Bahnhofsanzeigen', ['technik', 'bahn'], 4, 4, 'nostalgie', 'welle', 70, 14),
    // TV-Anmacher (10)
    T('v01', 'tv', 'Die schönsten Serien-Klischees der Fernsehgeschichte', ['tv', 'humor', 'nostalgie'], 2, 3, 'alle', 'evergreen', 0, 0),
    T('v02', 'tv', 'Warum Vorabendserien so gemütlich sind', ['tv', 'nostalgie'], 2, 2, 'nostalgie', 'evergreen', 0, 0),
    T('v03', 'tv', 'Spieleshows von früher – was war das Erfolgsrezept?', ['tv', 'quiz', 'nostalgie'], 3, 3, 'nostalgie', 'welle', 28, 10),
    T('v04', 'tv', 'Synchronstimmen: die unsichtbaren Stars', ['tv', 'audio'], 3, 3, 'alle', 'welle', 38, 12),
    T('v05', 'tv', 'Wie eine Kochshow entsteht', ['tv', 'essen'], 3, 3, 'familie', 'evergreen', 0, 0),
    T('v06', 'tv', 'Das große Finale: Warum wir Cliffhanger lieben', ['tv', 'humor'], 2, 3, 'jung', 'welle', 50, 10),
    T('v07', 'tv', 'Testbild und Sendeschluss – eine Erinnerung', ['tv', 'nostalgie', 'technik'], 3, 3, 'nostalgie', 'evergreen', 0, 0),
    T('v08', 'tv', 'Filmmusik selbst gemacht', ['tv', 'musik'], 2, 4, 'alle', 'welle', 64, 12),
    T('v09', 'tv', 'Reality-TV im Bahnhof: unsere eigene Idee', ['tv', 'bahn', 'humor'], 2, 3, 'jung', 'welle', 80, 14),
    T('v10', 'tv', 'Quizshow-Regeln, die keiner versteht', ['tv', 'quiz', 'humor'], 2, 3, 'alle', 'evergreen', 0, 0),
    // Feelgood (10)
    T('f01', 'feelgood', 'Die Nachbarschaft, die ein Klavier rettete', ['feelgood', 'ort', 'musik'], 2, 1, 'alle', 'evergreen', 0, 0),
    T('f02', 'feelgood', 'Hörerpost: Eure schönsten Alltagsmomente', ['feelgood', 'hoerer'], 1, 1, 'alle', 'evergreen', 0, 0),
    T('f03', 'feelgood', 'Eine Woche lang jeden Tag ein Kompliment', ['feelgood', 'challenge'], 1, 1, 'jung', 'welle', 15, 8),
    T('f04', 'feelgood', 'Der Zugbegleiter, der für alle sang', ['feelgood', 'bahn', 'musik'], 2, 1, 'alle', 'welle', 42, 10),
    T('f05', 'feelgood', 'Gemeinschaftsgarten statt Brachfläche', ['feelgood', 'natur', 'ort'], 2, 1, 'familie', 'saison', 30, 12),
    T('f06', 'feelgood', 'Fundbüro-Geschichten mit Happy End', ['feelgood', 'bahn', 'ort'], 2, 1, 'alle', 'evergreen', 0, 0),
    T('f07', 'feelgood', 'Campingplatz-Freundschaften fürs Leben', ['feelgood', 'camping'], 1, 1, 'familie', 'saison', 52, 12),
    T('f08', 'feelgood', 'Kleine Erfindungen, die Großes bewirken', ['feelgood', 'technik'], 2, 2, 'alle', 'evergreen', 0, 0),
    T('f09', 'feelgood', 'Danke-Sendung: Unsere Hörerinnen und Hörer', ['feelgood', 'hoerer'], 1, 2, 'alle', 'welle', 75, 15),
    T('f10', 'feelgood', 'Die Festival-Spendenaktion', ['feelgood', 'festival', 'musik'], 2, 2, 'jung', 'welle', 90, 15),
    // Musik-Anmacher (10)
    T('u01', 'musik', 'Wir bauen einen Beat aus Küchengeräuschen', ['musik', 'humor', 'kaffee'], 1, 4, 'jung', 'evergreen', 0, 0),
    T('u02', 'musik', 'Was macht einen Ohrwurm aus?', ['musik', 'wissen'], 3, 3, 'alle', 'evergreen', 0, 0),
    T('u03', 'musik', 'Synthesizer erklärt für Neugierige', ['musik', 'technik'], 3, 4, 'technik', 'welle', 26, 10),
    T('u04', 'musik', 'Unser Jingle-Wettbewerb', ['musik', 'hoerer', 'radio'], 2, 4, 'alle', 'welle', 36, 10),
    T('u05', 'musik', 'Roadtrip-Playlist: nur eigene Songs', ['musik', 'camping', 'auto'], 2, 3, 'jung', 'saison', 46, 12),
    T('u06', 'musik', 'Die Geschichte der Kassette', ['musik', 'nostalgie', 'technik'], 3, 3, 'nostalgie', 'evergreen', 0, 0),
    T('u07', 'musik', 'Lagerfeuer-Akkorde für Anfänger', ['musik', 'camping'], 2, 2, 'familie', 'saison', 56, 12),
    T('u08', 'musik', 'Ein Lied in einer Stunde – Live im Studio', ['musik', 'challenge'], 2, 5, 'jung', 'welle', 66, 12),
    T('u09', 'musik', 'Bahnhofsgeräusche als Musik', ['musik', 'bahn'], 2, 4, 'nostalgie', 'welle', 72, 12),
    T('u10', 'musik', 'Festival-Hymne der Anmacher', ['musik', 'festival'], 2, 5, 'jung', 'welle', 95, 18)
  ];

  // Zielgruppen: Anteil an der Grundreichweite und Lieblingsrubriken
  D.audiences = {
    alle: { name: 'Alle', mult: 1.0 }, familie: { name: 'Familien', mult: 0.95 }, jung: { name: 'Junge Leute', mult: 1.05 },
    technik: { name: 'Technikfans', mult: 0.9 }, nostalgie: { name: 'Nostalgiker', mult: 0.92 }
  };

  // Formate (Länge) – Zeitbedarf in Spielminuten, Kosten, Reichweitenfaktor, Energiebedarf
  D.formats = [
    { id: 'kurz', name: 'Kurzfolge (20 min)', minutes: 20, cost: 40, reach: 0.8, energy: 15, segments: [2, 3] },
    { id: 'normal', name: 'Normalfolge (45 min)', minutes: 45, cost: 90, reach: 1.0, energy: 25, segments: [2, 4] },
    { id: 'lang', name: 'Spezial (90 min)', minutes: 90, cost: 180, reach: 1.25, energy: 40, segments: [3, 5] }
  ];
  // Veröffentlichungszeitpunkt
  D.slots = [
    { id: 'morgen', name: 'Morgens (7 Uhr)', hour: 7, mult: 0.95 },
    { id: 'mittag', name: 'Mittags (12 Uhr)', hour: 12, mult: 0.9 },
    { id: 'abend', name: 'Abends (19 Uhr)', hour: 19, mult: 1.1 }
  ];
  // Cover-Vorlagen und Teaser (Marketing ohne echte Social-API)
  D.covers = [
    { id: 'klassik', name: 'Klassisch', cost: 0, reach: 0, colors: ['#10142a', '#ffb02e'] },
    { id: 'neon', name: 'Neon', cost: 30, reach: 0.04, colors: ['#1a0f3a', '#6ef0ff'] },
    { id: 'retro', name: 'Retro', cost: 30, reach: 0.04, colors: ['#3a1f0f', '#ffd36b'] },
    { id: 'foto', name: 'Studio-Szene', cost: 60, reach: 0.07, colors: ['#0f2a3a', '#ff7ad9'] }
  ];
  D.teasers = [
    { id: 'none', name: 'Kein Teaser', cost: 0, reach: 0 },
    { id: 'clip', name: 'Kurzer Hörschnipsel', cost: 50, reach: 0.08 },
    { id: 'video', name: 'Video-Teaser (braucht Kamera)', cost: 120, reach: 0.16, needCat: 'kamera' },
    { id: 'event', name: 'Fan-Aktion im Fan-Treff', cost: 200, reach: 0.22, needChapter: 2 }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
