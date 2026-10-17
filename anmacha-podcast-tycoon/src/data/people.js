/* Figuren: Hosts, 14 Stadtfiguren (12 feste + 2 freundliche Rivalen), Gäste (10 Archetypen), Bewerbernamen.
   Alle Figuren sind fiktiv. Marco und Andrew sind stilisierte Spielrollen (freundlich, nicht täuschend echt).
   look: Farben/Formen für das 3D-Modell. routine: [Stunde, Ortsschlüssel] – Ortsschlüssel stehen in districts.js (spots). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};

  D.hosts = [
    { id: 'marco', name: 'Marco', role: 'Host', skills: { wenig: 6, serious15: 6, tec: 8, tv: 8, feelgood: 6, musik: 5 },
      look: { skin: '#f0c8a8', hair: '#6b4528', beard: '#6b4528', shirt: '#16171c', pants: '#2b2f3a', badge: '#ff8a1e', build: 1.12, hairStyle: 'short' },
      bio: 'Technik-Herz und Serienkenner. Erklärt jedes Kabel mit Begeisterung – und hat immer einen Bart-Witz parat.',
      lines: ['Kabel ist Kabel, sagt man. Ich sage: Kabel ist Leidenschaft!', 'Wenn das Rotlicht angeht, bin ich hellwach.', 'Andrew, hast du wieder meine Lieblingstasse benutzt?'] },
    { id: 'andrew', name: 'Andrew', role: 'Host', skills: { wenig: 8, serious15: 6, tec: 5, tv: 6, feelgood: 8, musik: 8 },
      look: { skin: '#f3cdb2', hair: '#c9844a', beard: null, shirt: '#16171c', pants: '#3a4f78', badge: '#ff8a1e', build: 1.0, hairStyle: 'short' },
      bio: 'Musikgefühl, Herzlichkeit und ein Lachen, das man bis in die Kaffeeküche hört.',
      lines: ['Seid ihr bereit, angemacht zu werden?', 'Ich hab da so einen Beat im Kopf …', 'Marco, das Mikro ist an. Schon die ganze Zeit.'] }
  ];

  // role: Rolle im Team (hire = einstellbar), dist: Heimatbezirk, skill 1..10, salary je Tag
  D.npcs = [
    { id: 'lea', name: 'Lea Lautsprecher', role: 'redaktion', roleName: 'Redaktion', hire: true, skill: 5, salary: 70, dist: 'medien', trait: 'Faktenfuchs',
      look: { skin: '#e8b896', hair: '#2b1d14', shirt: '#2a6a8a', pants: '#2b2f3a', hairStyle: 'long' }, routine: [[6, 'medien.cafe'], [9, 'medien.agentur'], [13, 'medien.cafe'], [15, 'medien.agentur'], [20, 'plaza.bank']],
      talk: ['Eine gute Folge beginnt mit einer guten Frage.', 'Ich habe drei Quellen geprüft. Und dann noch eine.', 'Serious 15 braucht Ruhe und Recherche – gib mir Zeit, dann wird das richtig gut.'] },
    { id: 'bodo', name: 'Bodo Brummer', role: 'technik', roleName: 'Tontechnik', hire: true, skill: 4, salary: 65, dist: 'altstudio', trait: 'Ohren wie ein Luchs',
      look: { skin: '#d9a07a', hair: '#9a9a9a', beard: '#9a9a9a', shirt: '#3a3f4d', pants: '#2b2f3a', build: 1.15, hairStyle: 'bald' }, routine: [[7, 'altstudio.hof'], [10, 'tecpark.laden'], [14, 'altstudio.hof'], [19, 'medien.plattenladen']],
      talk: ['Hörst du das Brummen? Das ist eine Masseschleife. Oder mein Magen.', 'Ein Mikrofon ist nur so gut wie der Raum drumherum.', 'Absorber an die erste Reflexion, dann reden wir weiter.'] },
    { id: 'mira', name: 'Mira Schnippel', role: 'schnitt', roleName: 'Schnitt', hire: true, skill: 5, salary: 70, dist: 'medien', trait: 'Ähm-Jägerin',
      look: { skin: '#f0c8a8', hair: '#c0392b', shirt: '#1d1f26', pants: '#5a4a3a', hairStyle: 'bob' }, routine: [[8, 'medien.druck'], [12, 'medien.cafe'], [14, 'medien.druck'], [21, 'plaza.brunnen']],
      talk: ['Jedes „Ähm“ ist ein kleiner Gegner.', 'Gute Schnitte hört man nicht.', 'Intro, Thema, Gast, Outro – Reihenfolge ist alles.'] },
    { id: 'kai', name: 'Kai Klickmann', role: 'social', roleName: 'Social & Marketing', hire: true, skill: 4, salary: 60, dist: 'medien', trait: 'Trendnase',
      look: { skin: '#c98d64', hair: '#1d1f26', shirt: '#ff7ad9', pants: '#2b2f3a', hairStyle: 'curly' }, routine: [[9, 'medien.fantreff'], [12, 'plaza.brunnen'], [15, 'medien.fantreff'], [19, 'festival.eingang']],
      talk: ['Ein gutes Cover ist die halbe Miete.', 'Teaser raus, Fans rein!', 'Die Leute lieben echte Momente – keine Hochglanz-Fassade.'] },
    { id: 'elif', name: 'Elif Termin', role: 'booking', roleName: 'Booking', hire: true, skill: 5, salary: 75, dist: 'medien', trait: 'Kennt alle',
      look: { skin: '#e3b08c', hair: '#3b2a1e', shirt: '#ffb02e', pants: '#1d1f26', hairStyle: 'bun' }, routine: [[8, 'medien.agentur'], [12, 'plaza.bank'], [14, 'medien.agentur'], [18, 'tvstudio.foyer']],
      talk: ['Ich habe da jemanden für euch. Bahnexpertin. Sehr pünktlich.', 'Gäste mögen eine gemütliche Lounge.', 'Mit gutem Ruf kommen bessere Gäste.'] },
    { id: 'tom', name: 'Tom Linse', role: 'kamera', roleName: 'Kamera', hire: true, skill: 4, salary: 70, dist: 'tvstudio', trait: 'Ruhige Hand',
      look: { skin: '#f3cdb2', hair: '#d8b878', shirt: '#2b2f3a', pants: '#3a4f78', hairStyle: 'short', cap: '#1d1f26' }, routine: [[8, 'tvstudio.foyer'], [10, 'tvstudio.buehne'], [16, 'tvstudio.foyer'], [20, 'plaza.bank']],
      talk: ['Licht von vorne, Kamera auf Augenhöhe, fertig.', 'Ein Bild sagt mehr als tausend Ähms.', 'Weißabgleich nicht vergessen!'] },
    { id: 'nele', name: 'Nele Rampe', role: 'event', roleName: 'Bühne & Event', hire: true, skill: 4, salary: 70, dist: 'tvstudio', trait: 'Chaos-Bändigerin',
      look: { skin: '#d9a07a', hair: '#ffd36b', shirt: '#4be08a', pants: '#2b2f3a', hairStyle: 'ponytail' }, routine: [[9, 'tvstudio.buehne'], [13, 'festival.buehne'], [17, 'tvstudio.buehne'], [21, 'festival.eingang']],
      talk: ['Eine Live-Show ist wie ein Schiff: Alle rudern, einer ruft.', 'Wo ist das Klemmbrett? Ah, in meiner Hand.', 'Publikum warm machen ist eine Kunst.'] },
    { id: 'sven', name: 'Sven Lötkolben', role: 'reparatur', roleName: 'Reparatur', hire: true, skill: 5, salary: 65, dist: 'tecpark', trait: 'Repariert alles',
      look: { skin: '#e8b896', hair: '#5a4a3a', beard: '#5a4a3a', shirt: '#c0392b', pants: '#3a3f4d', hairStyle: 'short' }, routine: [[7, 'tecpark.werkstatt'], [12, 'tecpark.laden'], [13, 'tecpark.werkstatt'], [19, 'camping.garage']],
      talk: ['Wegwerfen? Nur über meine Lötstation!', 'Die meisten Pannen sind ein lockeres Kabel.', 'Wartung ist billiger als Reparatur.'] },
    { id: 'pixel', name: 'Herr Pixelberg', role: 'haendler', roleName: 'Technikhändler', hire: false, skill: 6, salary: 0, dist: 'tecpark', trait: 'Rabattkönig',
      look: { skin: '#f0c8a8', hair: '#e8e8e8', shirt: '#6ef0ff', pants: '#2b2f3a', hairStyle: 'side', glasses: true }, routine: [[8, 'tecpark.laden'], [18, 'tecpark.rechenzentrum'], [20, 'plaza.bank']],
      talk: ['Heute im Angebot: Kabel, die sich nicht verknoten. Fast nicht.', 'Für Stammkunden gibt es immer etwas.', 'Das Rechenzentrum? Brummt wie ein Bienenstock.'] },
    { id: 'gleis', name: 'Frau Gleis', role: 'bahnhof', roleName: 'Bahnhofsvorsteherin', hire: false, skill: 7, salary: 0, dist: 'bahnhof', trait: 'Auf die Minute',
      look: { skin: '#e3b08c', hair: '#7a5a3a', shirt: '#c0392b', pants: '#1d1f26', hairStyle: 'bun', cap: '#c0392b' }, routine: [[5, 'bahnhof.bahnsteig'], [11, 'bahnhof.halle'], [14, 'bahnhof.bahnsteig'], [22, 'bahnhof.halle']],
      talk: ['Der Regio-Anmacher fährt pünktlich. Meistens.', 'Ein Bahnhof ist voller Geschichten.', 'Bitte zurücktreten – Sie stehen auf meinem Lieblingsfliesenmuster.'] },
    { id: 'oskar', name: 'Oskar Hering', role: 'camping', roleName: 'Platzwart', hire: false, skill: 6, salary: 0, dist: 'camping', trait: 'Lagerfeuer-Profi',
      look: { skin: '#d9a07a', hair: '#9a9a9a', beard: '#e8e8e8', shirt: '#3e8a49', pants: '#6b5a3a', hairStyle: 'short', cap: '#3e8a49' }, routine: [[6, 'camping.rezeption'], [10, 'camping.platz'], [15, 'camping.garage'], [19, 'camping.feuer']],
      talk: ['Hier draußen ist das WLAN schwach und die Geschichten stark.', 'Rückwärts einparken üben wir noch.', 'Am Lagerfeuer wird jeder zum Moderator.'] },
    { id: 'jule', name: 'Jule Bass', role: 'festival', roleName: 'Festival-Veranstalterin', hire: false, skill: 7, salary: 0, dist: 'festival', trait: 'Denkt groß',
      look: { skin: '#c98d64', hair: '#c58bff', shirt: '#1d1f26', pants: '#2b2f3a', hairStyle: 'long' }, routine: [[9, 'festival.buero'], [13, 'festival.buehne'], [16, 'festival.buero'], [20, 'festival.buehne']],
      talk: ['Ein Festival nur mit eigener Musik? Genau mein Ding.', 'Die Bühne braucht Strom, Licht – und euch.', 'Wir planen groß, aber mit Herz.'] },
    { id: 'ronja', name: 'Ronja Funkfuchs', role: 'rivale', roleName: 'Die Funkfüchse', hire: false, skill: 7, salary: 0, dist: 'campus', trait: 'Ehrgeizig, aber fair',
      look: { skin: '#f0c8a8', hair: '#e07a2a', shirt: '#2a6a8a', pants: '#1d1f26', hairStyle: 'ponytail' }, routine: [[9, 'campus.tor'], [14, 'medien.fantreff'], [18, 'campus.tor']],
      talk: ['Wir sind die Funkfüchse. Freundliche Konkurrenz belebt das Geschäft!', 'Nächste Woche schlagen wir eure Hörerzahlen. Vielleicht.', 'Respekt für eure letzte Folge.'] },
    { id: 'flo', name: 'Flo Funkfuchs', role: 'rivale', roleName: 'Die Funkfüchse', hire: false, skill: 6, salary: 0, dist: 'campus', trait: 'Technikverliebt',
      look: { skin: '#e8b896', hair: '#1d1f26', shirt: '#2a6a8a', pants: '#3a3f4d', hairStyle: 'curly', glasses: true }, routine: [[10, 'campus.tor'], [13, 'tecpark.laden'], [17, 'campus.tor']],
      talk: ['Habt ihr schon das neue Interface? Wir schon. Hehe.', 'Ronja plant schon wieder etwas Großes.', 'Ein Duell im Quiz? Jederzeit!'] }
  ];

  // Gäste: arche = Archetyp, fame 1..10 (Reichweite), fee, fit = passende Rubriken, need = Bedingung (Lounge, Ruf)
  D.guestArchetypes = {
    technikfan: 'Technikfan', comedian: 'Comedian', bahnexpertin: 'Bahnexpertin', camper: 'Camper', serienkritikerin: 'Serienkritikerin',
    synchronsprecher: 'Synchronsprecher', radiodj: 'Radio-DJ', veranstalterin: 'Veranstalterin', hoerervertretung: 'Hörervertretung', ueberraschung: 'Überraschungsgast'
  };
  D.guests = [
    { id: 'g_byte', name: 'Bernd „Byte“ Brettschneider', arche: 'technikfan', fame: 3, fee: 120, fit: ['tec', 'wenig'], need: { rep: 0 }, line: 'Ich habe zu Hause elf Router. Fragt nicht.', look: { shirt: '#6ef0ff', hair: '#5a4a3a', glasses: true } },
    { id: 'g_giggles', name: 'Gisela Gackerle', arche: 'comedian', fame: 4, fee: 180, fit: ['wenig', 'tv', 'feelgood'], need: { rep: 10 }, line: 'Ich bringe gute Laune mit. Und Kekse.', look: { shirt: '#ffb02e', hair: '#c0392b' } },
    { id: 'g_takt', name: 'Dr. Tamara Taktfahrplan', arche: 'bahnexpertin', fame: 5, fee: 220, fit: ['serious15', 'tec', 'wenig'], need: { rep: 15 }, line: 'Jede Verspätung hat eine Ursache. Meistens drei.', look: { shirt: '#c0392b', hair: '#2b1d14' } },
    { id: 'g_zelt', name: 'Zeltmeister Zacharias', arche: 'camper', fame: 3, fee: 100, fit: ['feelgood', 'wenig', 'musik'], need: { rep: 5 }, line: 'Ein Hering hält mehr aus als man denkt.', look: { shirt: '#3e8a49', hair: '#9a9a9a', beard: '#9a9a9a' } },
    { id: 'g_couch', name: 'Clara Couchkritik', arche: 'serienkritikerin', fame: 5, fee: 240, fit: ['tv', 'serious15'], need: { rep: 20 }, line: 'Drei Staffeln an einem Wochenende? Anfängerin.', look: { shirt: '#ff7ad9', hair: '#1d1f26' } },
    { id: 'g_stimme', name: 'Viktor Vollton', arche: 'synchronsprecher', fame: 6, fee: 300, fit: ['tv', 'musik', 'feelgood'], need: { rep: 25, lounge: true }, line: 'Sie kennen meine Stimme. Nur mein Gesicht nicht.', look: { shirt: '#1d1f26', hair: '#7a5a3a' } },
    { id: 'g_dj', name: 'DJ Dorle Dezibel', arche: 'radiodj', fame: 6, fee: 280, fit: ['musik', 'feelgood', 'tv'], need: { rep: 25 }, line: 'Bässe sind wie Freundschaften: spürbar.', look: { shirt: '#c58bff', hair: '#ffd36b', cap: '#c58bff' } },
    { id: 'g_event', name: 'Valeska Veranstaltung', arche: 'veranstalterin', fame: 7, fee: 350, fit: ['feelgood', 'musik', 'serious15'], need: { rep: 35, lounge: true }, line: 'Ich plane Feste für zehntausend Leute – und vergesse nie die Klos.', look: { shirt: '#4be08a', hair: '#3b2a1e' } },
    { id: 'g_hoerer', name: 'Holger Hörer', arche: 'hoerervertretung', fame: 2, fee: 60, fit: ['feelgood', 'wenig', 'serious15'], need: { rep: 0 }, line: 'Ich vertrete die Leute an den Radios! Und mich.', look: { shirt: '#2a6a8a', hair: '#9a9a9a' } },
    { id: 'g_mystery', name: 'Die Maske', arche: 'ueberraschung', fame: 8, fee: 500, fit: ['tv', 'musik', 'wenig', 'feelgood'], need: { rep: 45, lounge: true }, line: '…', look: { shirt: '#111', hair: '#111', mask: true } },
    { id: 'g_akku', name: 'Anja Akkuschrauber', arche: 'technikfan', fame: 5, fee: 220, fit: ['tec', 'serious15'], need: { rep: 20 }, line: 'Wer repariert, gewinnt.', look: { shirt: '#c0392b', hair: '#e07a2a' } },
    { id: 'g_witz', name: 'Willi Witzbold', arche: 'comedian', fame: 7, fee: 380, fit: ['wenig', 'tv'], need: { rep: 40, lounge: true }, line: 'Kommt ein Mikro in die Bar …', look: { shirt: '#ffd36b', hair: '#2b1d14' } },
    { id: 'g_weiche', name: 'Wolfgang Weichensteller', arche: 'bahnexpertin', fame: 3, fee: 110, fit: ['wenig', 'tec', 'feelgood'], need: { rep: 8 }, line: 'Weichen stellen ist wie Lebenswege planen.', look: { shirt: '#1d1f26', hair: '#e8e8e8', cap: '#c0392b' } },
    { id: 'g_wohnmobil', name: 'Wanda Wohnmobil', arche: 'camper', fame: 5, fee: 200, fit: ['feelgood', 'tec', 'wenig'], need: { rep: 20 }, line: 'Vierzig Länder, ein Kühlschrank.', look: { shirt: '#ffb02e', hair: '#c9844a' } }
  ];

  // Namenspool für weitere Bewerberinnen und Bewerber (ab Kapitel 5 wächst das Team)
  D.applicantNames = ['Paula Pegel', 'Ben Brumm', 'Svea Spur', 'Malte Marker', 'Ida Ideenreich', 'Jonas Jingle', 'Lotte Lautheit', 'Emil Ecke', 'Rosa Rauschfrei', 'Theo Takt', 'Hanna Hall', 'Nils Netzwerk'];
  D.roles = {
    redaktion: { name: 'Redaktion', icon: '📝', desc: 'Recherche-Punkte für jede Folge (Serious 15 und TEC profitieren besonders).', station: ['mo_schreib', 'bs_laptop', 'bs_monitor'] },
    technik: { name: 'Tontechnik', icon: '🎛️', desc: 'Weniger Pannen beim Technikcheck, hält die Zuverlässigkeit hoch.', station: ['mx_podcast', 'mx_analog', 'mx_digital', 'if_4', 'if_8'] },
    schnitt: { name: 'Schnitt', icon: '✂️', desc: 'Kann Folgen automatisch schneiden und verbessert den Schnitt.', station: ['bs_monitor', 'hp_offen', 'bs_laptop'] },
    social: { name: 'Social & Marketing', icon: '📣', desc: 'Mehr Reichweite für jede Folge und bessere Teaser.', station: ['bs_social', 'bs_laptop'] },
    booking: { name: 'Booking', icon: '📇', desc: 'Günstigere und bekanntere Gäste.', station: ['mo_schreib', 'mo_tresen'] },
    kamera: { name: 'Kamera', icon: '🎥', desc: 'Bessere Videofolgen auf der TV-Bühne.', station: ['cam_hd', 'cam_kran', 'cam_schwenk'] },
    event: { name: 'Bühne & Event', icon: '🎪', desc: 'Mehr Einnahmen bei Live-Shows und Festivals.', station: ['rq_buehne', 'rq_buzzer'] },
    reparatur: { name: 'Reparatur', icon: '🔧', desc: 'Repariert Technik täglich und senkt Reparaturkosten.', station: ['mo_werkbank', 'if_patch', 'bs_server'] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
