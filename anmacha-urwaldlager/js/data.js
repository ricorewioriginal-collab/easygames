/* Urwaldlager – Inhalte: Show, Moderation, Camper, Prüfungen, Gespräche, Quiz
   Alle Namen, Figuren, Sprüche und Inhalte sind frei erfunden. Ähnlichkeiten mit echten Personen sind nicht beabsichtigt. */
(function () {
  'use strict';
  const UL = window.UL;
  const D = UL.D = {};

  D.SHOW = { title: 'URWALDLAGER', sub: 'Die Promi-Show im Dschungel', exit: 'Ich bin raus aus dem Urwald!', trial: 'Urwaldprüfung', phone: 'Buschtelefon', bridge: 'Hängebrücke' };
  D.TITLE = { m: 'Urwaldkönig', w: 'Urwaldkönigin', n: 'Urwald-Royal' };

  // Moderatoren-Duo und Lager-Arzt (KayKit-Figuren, umgefärbt)
  D.HOSTS = [
    { id: 'lotte', name: 'Lotte Brandt', look: { rb: 'Business_Female_01', model: 'rogue', skin: 0, shirt: 0x7a1f3d, pants: 0x22283a, accent: 0xffd36b, hair: 0x6b3a1f, mic: true, micColor: 0x37c46a } },
    { id: 'mats', name: 'Mats Feldmann', look: { rb: 'Business_Male_01', model: 'knight', skin: 1, shirt: 0x1f2a44, pants: 0x1f2a44, accent: 0xf4f4f4, hair: 0x3a2a1a, mic: true, cards: true, micColor: 0x37c46a } }
  ];
  D.DOC = { id: 'doc', name: 'Doc Rudi', look: { rb: 'Medical_Male_01', model: 'mage', skin: 2, shirt: 0xf2f2ee, pants: 0x3a5a7a, accent: 0xffffff, glasses: true, hat: 'cap', hatColor: 0x2a8a4a } };
  // Ranger: bewachen das Lager, bringen Lieferungen, holen Camper zur Prüfung ab (frei erfunden)
  D.RANGER = { id: 'ranger', name: 'Ranger Kalle', look: { rb: 'Male_Adult_05', model: 'barbarian', skin: 1, shirt: 0x6b6a3a, pants: 0x3a4a2a, accent: 0xd8c89a, hat: 'busch', hatColor: 0x7a6a3a } };
  D.VOICE = { lotte: { pitch: 1.12, rate: 1.04 }, mats: { pitch: 0.92, rate: 1.0 }, doc: { pitch: 0.8, rate: 0.95 }, ranger: { pitch: 0.7, rate: 0.98 } };
  // Sprüche von Lager-Sanitäter Doc Rudi (eigene Figur) und Ranger Kalle
  D.DOC_LINES = {
    check: ['Zunge raus … sehr schön. Puls ein bisschen hoch, aber das ist hier normal.', 'Blutdruck okay, Hände zittern ein bisschen. Viel trinken, weniger Drama!', 'Du hast einen Mückenstich. Einen. Du wirst es überleben.', 'Kreislauf stabil. Wenn dir schwindlig wird: hinsetzen, Wasser, Schatten.'],
    trialQuit: ['Ganz ruhig, tief durchatmen. Abbrechen ist keine Schande – deine Gesundheit geht vor.', 'Alles gut, ich bin da. Erstmal hinsetzen und einen Schluck Wasser.'],
    trialBad: ['Kurz durchchecken … Puls hoch, aber alles im grünen Bereich. Du hast gekämpft!', 'Ein paar Kratzer, viel Ekel – aber medizinisch alles in Ordnung.'],
    trialGood: ['Alle Werte top. Und Nerven wie Drahtseile!', 'Ich hab schon viele Prüfungen gesehen. Das war richtig stark.'],
    tips: ['Wer wenig isst, hat schlechte Laune. Wer schlecht schläft, auch.', 'In der Prüfung zählt: ruhig atmen, dann erst handeln.', 'Holz holen und Wasser abkochen – das hält das Camp gesund.']
  };
  D.RANGER_LINES = {
    hello: ['Alles ruhig im Lager? Ich dreh meine Runde.', 'Ich hab ein Auge auf euch. Und auf die Schlangen.', 'Bleibt im Camp. Hinter der Brücke ist Sperrgebiet.'],
    tips: ['Morgen früh holen wir wieder jemanden zur Prüfung ab. Die Zuschauer haben schon abgestimmt …', 'Am Feuer redet es sich am besten. Und Komplimente kosten nichts.', 'Wer im Buschtelefon ehrlich ist, kommt bei den Zuschauern gut an.', 'Heute ist es heiß. Wasser abkochen nicht vergessen!'],
    chest: ['Psst … ich hab heute eine Kiste gesehen. Irgendwo dort hinten – ich hab sie markiert.', 'Unter uns: Da drüben steht eine Schatzkiste. Mehr verrat ich nicht.'],
    pick: ['{n}, mitkommen bitte. Die Prüfung wartet.', '{n}, du bist dran. Ich bring dich hin.'],
    delivery: ['Lieferung fürs Camp!', 'Euer Essen. Teilt gerecht!']
  };

  // Camper-Kleidung wie im Original: rote Hemden, Khaki-Hosen; Hüte und Tücher als Erkennungszeichen
  const RED = 0xc8372d, KHAKI = 0xb79a6a;
  D.CAST = [
    { id: 'mandy', name: 'Mandy Glitzer', job: 'Reality-Sternchen', form: 'w', model: 'rogue', skin: 0, hat: 'band', hatColor: 0xff4fa0, hair: 0xf2d27a, t: { nett: 0.5, drama: 0.9, mut: 0.3, fleiss: 0.3, humor: 0.6 }, quote: 'Ich bin nicht zickig, ich bin ehrlich – laut!' },
    { id: 'ronny', name: 'Ronny Bolzen', job: 'Ex-Fußballprofi', form: 'm', model: 'barbarian', skin: 1, hat: 'cap', hatColor: 0x1f6ad8, t: { nett: 0.6, drama: 0.4, mut: 0.8, fleiss: 0.6, humor: 0.5 }, quote: 'Die Prüfung ist wie ein Elfmeter: Kopf aus, rein damit.' },
    { id: 'gisela', name: 'Gisela von Hohenstein', job: 'Society-Lady', form: 'w', model: 'mage', skin: 0, glasses: true, hat: 'busch', hatColor: 0xe8e0c8, t: { nett: 0.4, drama: 0.7, mut: 0.2, fleiss: 0.2, humor: 0.4 }, quote: 'Reis und Bohnen? Darling, das ist doch kein Menü.' },
    { id: 'kev', name: 'Kev Kracher', job: 'Influencer', form: 'm', model: 'rogue_hooded', skin: 2, glasses: true, t: { nett: 0.6, drama: 0.6, mut: 0.5, fleiss: 0.3, humor: 0.8 }, quote: 'Leute, ich hab hier null Netz. Absolute Katastrophe.' },
    { id: 'bodo', name: 'Bodo Brummer', job: 'Schlagersänger', form: 'm', model: 'knight', skin: 0, hat: 'busch', t: { nett: 0.8, drama: 0.3, mut: 0.4, fleiss: 0.5, humor: 0.7 }, quote: 'Ein Lied am Lagerfeuer und alles ist wieder gut!' },
    { id: 'chantal', name: 'Chantal Funkel', job: 'Model & Unternehmerin', form: 'w', model: 'rogue', skin: 3, hat: 'kopftuch', hatColor: 0xffb000, t: { nett: 0.5, drama: 0.7, mut: 0.6, fleiss: 0.4, humor: 0.5 }, quote: 'Ich hab schon Schlimmeres gegessen. Auf Fashion-Partys.' },
    { id: 'hanno', name: 'Hanno Würze', job: 'Fernsehkoch', form: 'm', model: 'mage', skin: 1, hat: 'cap', hatColor: 0xffffff, t: { nett: 0.7, drama: 0.4, mut: 0.5, fleiss: 0.9, humor: 0.5 }, quote: 'Gebt mir eine Bohne, und ich mach euch ein Drei-Gänge-Menü.' },
    { id: 'svenja', name: 'Svenja Sturm', job: 'Wetterfee', form: 'w', model: 'rogue_hooded', skin: 0, t: { nett: 0.8, drama: 0.2, mut: 0.6, fleiss: 0.7, humor: 0.5 }, quote: 'Morgen: 30 Grad, Regen, und ganz viel Drama.' },
    { id: 'moritz', name: 'Moritz Matsch', job: 'Comedian', form: 'm', model: 'barbarian', skin: 0, keepHat: true, t: { nett: 0.6, drama: 0.5, mut: 0.5, fleiss: 0.3, humor: 1.0 }, quote: 'Ich hab Angst vor Spinnen. Und vor Bohnen. Und vor Spinnen in Bohnen.' },
    { id: 'tamara', name: 'Tamara Turbo', job: 'Ex-Rennfahrerin', form: 'w', model: 'knight', skin: 2, hat: 'band', hatColor: 0x111111, hair: 0x2a1a10, t: { nett: 0.5, drama: 0.5, mut: 1.0, fleiss: 0.7, humor: 0.4 }, quote: 'Angst? Kenn ich nur vom Hörensagen.' },
    { id: 'dieter', name: 'Dieter Dosenfeld', job: 'Kult-Wirt', form: 'm', model: 'barbarian', skin: 4, hat: 'busch', hatColor: 0x6a4a2a, mug: true, t: { nett: 0.7, drama: 0.6, mut: 0.3, fleiss: 0.4, humor: 0.8 }, quote: 'Wo ist hier der Tresen? Ich frag für einen Freund.' },
    { id: 'lia', name: 'Lia Lametta', job: 'Popsängerin', form: 'w', model: 'mage', skin: 3, hat: 'band', hatColor: 0x8a5cff, hair: 0x1a1018, t: { nett: 0.9, drama: 0.3, mut: 0.4, fleiss: 0.6, humor: 0.5 }, quote: 'Ich vermisse meine Katze. Und mein Kopfkissen. Und Pommes.' }
  ];
  D.CAST.forEach(c => { c.look = Object.assign({ model: c.model, skin: c.skin, shirt: RED, pants: KHAKI, accent: 0xf2e6c8 }, { hat: c.hat, hatColor: c.hatColor, glasses: c.glasses, hair: c.hair, keepHat: c.keepHat, mug: c.mug }); });
  // echte Menschen (Microsoft Rocketbox, MIT-Lizenz) für jeden Camper; KayKit bleibt als Rückfall, falls eine Datei fehlt
  const CAST_RB = { mandy: 'Female_Adult_03', gisela: 'Female_Adult_05', chantal: 'Female_Adult_08', svenja: 'Female_Adult_01', tamara: 'Female_Adult_04', lia: 'Female_Adult_07',
    ronny: 'Male_Adult_06', kev: 'Male_Adult_04', bodo: 'Male_Adult_02', hanno: 'Male_Adult_08', moritz: 'Male_Adult_01', dieter: 'Male_Adult_03' };
  D.CAST.forEach(c => { c.look.rb = CAST_RB[c.id]; });
  // Auswahl für die eigene Figur
  D.RB_PLAYER = [['Female_Adult_02', 'Anna'], ['Female_Adult_09', 'Jule'], ['Female_Adult_06', 'Amira'], ['Male_Adult_09', 'Ben'], ['Male_Adult_10', 'Leo'], ['Male_Adult_07', 'Can']];
  D.RB_ALL = [...new Set(Object.values(CAST_RB).concat(D.RB_PLAYER.map(x => x[0]), ['Business_Female_01', 'Business_Male_01', 'Medical_Male_01', 'Male_Adult_05']))];
  D.PLAYER_JOBS = ['Schauspieler:in', 'Sänger:in', 'Influencer:in', 'Sportler:in', 'Comedian', 'TV-Koch/Köchin', 'Model', 'Reality-Star', 'Moderator:in', 'Tänzer:in'];
  D.HATS = [['none', 'Ohne'], ['busch', 'Buschhut'], ['cap', 'Kappe'], ['band', 'Stirnband'], ['kopftuch', 'Kopftuch']];
  D.SHIRTS = [[0xc8372d, 'Camp-Rot'], [0xd8622d, 'Orange'], [0x2d6ac8, 'Blau'], [0x2d9a52, 'Grün'], [0x8a3dc8, 'Lila'], [0x333a48, 'Anthrazit']];
  D.HATCOL = [0xb08850, 0xd8402e, 0x1f6ad8, 0xffb000, 0x2a8a4a, 0xff4fa0, 0x111111, 0xffffff];

  // Längen und Schwierigkeit
  D.LENGTHS = { kurz: { days: 8, campers: 8, label: 'Kurz · 8 Tage · 8 Camper' }, normal: { days: 12, campers: 10, label: 'Normal · 12 Tage · 10 Camper' }, lang: { days: 16, campers: 12, label: 'Lang · 16 Tage · 12 Camper' } };
  D.DIFF = { leicht: { k: 0.75, label: 'Entspannt' }, normal: { k: 1, label: 'Normal' }, schwer: { k: 1.3, label: 'Knallhart' } };

  // Prüfungen: Ablauf und Wertung wie im Original – Sterne = Essensportionen fürs Camp
  D.TRIALS = [
    { id: 'kisten', name: 'Die fiesen Kisten', icon: '📦', stars: 8, time: 120, desc: 'Lauf am Kistentisch entlang, steck die Hand in die Kisten voller (virtueller) Krabbeltiere und hol die Sterne heraus. Berühr die Tiere möglichst nicht – sonst steigt dein Ekel.', ctrl: [['move', 'Laufen / Hand bewegen'], ['ok', 'Hineingreifen / Zugreifen'], ['alt', 'Kiste verlassen']] },
    { id: 'dinner', name: 'Das Urwald-Dinner', icon: '🍽️', stars: 6, time: 150, desc: 'Sechs erfundene Ekel-Gänge. Spieß die zappelnden Happen selbst mit der Gabel auf, kau sie runter, leer die Ekel-Drinks und halt dabei das Würgen in Schach.', ctrl: [['move', 'Gabel führen / Würgen ausgleichen'], ['ok', 'Aufspießen & kauen'], ['alt', 'Trinken (halten)']] },
    { id: 'tauchen', name: 'Das Schlammbecken', icon: '🤿', stars: 9, time: 120, desc: 'Tauch durchs trübe Becken und sammle die Sterne vom Grund. Achte auf deine Luft – an der Oberfläche holst du neue.', ctrl: [['move', 'Schwimmen'], ['ok', 'Abtauchen'], ['alt', 'Auftauchen']] },
    { id: 'steg', name: 'Der Wackelsteg', icon: '🌉', stars: 8, time: 110, desc: 'Balancier über den Steg hoch über der Schlucht. Wind und lose Bretter wollen dich runterholen – greif dir die Sterne an den Seilen.', ctrl: [['move', 'Gehen / Balance halten'], ['ok', 'Stern greifen'], ['alt', 'Springen']] },
    { id: 'tunnel', name: 'Der Krabbeltunnel', icon: '🪲', stars: 8, time: 140, desc: 'Kriech mit der Stirnlampe durch das enge Tunnelsystem. In den Sackgassen warten die Sterne – und jede Menge Gekrabbel.', ctrl: [['move', 'Kriechen'], ['look', 'Umsehen'], ['ok', 'Stern nehmen']] },
    { id: 'dusche', name: 'Die Ekel-Dusche', icon: '🚿', stars: 10, time: 90, desc: 'Aus den Rohren über dir regnet es Sterne – und Schleim, Fischreste und Krabbeltiere. Fang die Sterne, weich dem Rest aus.', ctrl: [['move', 'Laufen'], ['alt', 'Ducken']] },
    { id: 'quiz', name: 'Der Wissens-Tank', icon: '❓', stars: 10, time: 0, desc: 'Du liegst im Glastank. Für jede richtige Antwort gibt es einen Stern, für jede falsche kommt eine Ladung Schleim dazu. Drei Fehler, und der Tank ist voll.', ctrl: [['move', 'Antwort wählen'], ['ok', 'Antworten']] },
    { id: 'parcours', name: 'Der Schlamm-Parcours', icon: '🏃', stars: 10, time: 100, desc: 'Lauf durch den Hindernisparcours: über Baumstämme springen, unter Balken ducken, über Schlamm balancieren. Unterwegs liegen die Sterne.', ctrl: [['move', 'Laufen'], ['ok', 'Springen'], ['alt', 'Ducken / Rutschen']] },
    { id: 'bach', name: 'Der Sternen-Bach', icon: '🌊', stars: 8, time: 100, desc: 'Wate durch den Bach, schnapp dir die Schaumstoff-Sterne und bring sie ins Netz. Von oben rollen riesige Bälle heran – wer getroffen wird, verliert seinen Stern.', ctrl: [['move', 'Waten'], ['ok', 'Hechtsprung']] },
    { id: 'blind', name: 'Die Blindfahrt', icon: '🚙', stars: 6, time: 130, desc: 'Augenbinde auf, ab hinters Steuer! Dein Beifahrer sagt an, wohin es geht. An jeder Station anhalten und den Stern greifen – unterwegs warten Fässer, Schlamm- und Kakerlaken-Duschen.', ctrl: [['move', 'Gas (hoch), Lenken (links/rechts)'], ['ok', 'Bremsen & greifen']] },
    { id: 'box', name: 'Die Ekel-Box', icon: '🪳', stars: 7, time: 90, desc: 'Kopf in die Plexiglas-Box! Oben werden Kakerlaken und Mehlwürmer eingefüllt. Zieh die Sterne mit den Zähnen von den Wänden – aber beiß nicht in die Spinnennester.', ctrl: [['move', 'Kopf drehen'], ['ok', 'Stern ziehen'], ['alt', 'Ruhig atmen']] },
    { id: 'grab', name: 'Das Madengrab', icon: '⚰️', stars: 6, time: 110, desc: 'Du liegst in einer Kiste unter der Erde, Maden und Krabbeltiere rieseln herein. Führ deine Hand zu den Schrauben am Deckel, pack zu und dreh sie heraus – hinter jeder steckt ein Stern.', ctrl: [['move', 'Hand führen / im Kreis drehen'], ['ok', 'Schraube packen (halten)'], ['alt', 'Ruhig atmen']] },
    { id: 'seilbahn', name: 'Die Lianen-Rutsche', icon: '🐒', stars: 9, time: 0, desc: 'Drei Fahrten an der Seilrutsche durch die Baumkronen. Lenk dich zu den Sternen und weich Ästen und Wespennestern aus.', ctrl: [['move', 'Lenken'], ['ok', 'Bremsen'], ['alt', 'Beine anziehen']] },
    { id: 'schlangen', name: 'Die Schlangengrube', icon: '🐍', stars: 8, time: 120, desc: 'Ab in die Grube voller (ungiftiger) Schlangen! Öffne die Körbe – in manchen liegt ein Stern, in manchen noch eine Schlange. Wer rennt, weckt sie auf, also lieber leise schleichen.', ctrl: [['move', 'Laufen'], ['alt', 'Schleichen (halten)'], ['ok', 'Korb öffnen']] },
    { id: 'hoehle', name: 'Das Höhlenlabyrinth', icon: '🔦', stars: 8, time: 150, desc: 'Stockdunkle Höhle, nur eine Taschenlampe. Die Sterne siehst du nur im Lichtkegel, die Batterie wird schwächer. Und leuchte bloß keine schlafenden Fledermäuse an!', ctrl: [['move', 'Laufen'], ['alt', 'Licht an/aus']] },
    { id: 'floss', name: 'Das Floßrennen', icon: '🚣', stars: 9, time: 100, desc: 'Auf dem Floß den Dschungelfluss hinunter, gegen zwei Mit-Camper. Paddel im Takt, lenk um Felsen und Treibholz und schnapp dir die Sterne an den Bojen. Platz 1 bringt zwei Bonussterne.', ctrl: [['move', 'Lenken'], ['ok', 'Paddeln (im Takt)']] },
    { id: 'klettern', name: 'Die Kletterwand', icon: '🧗', stars: 8, time: 130, desc: 'Kletter die Felswand hoch bis zur Glocke. Die Sterne hängen an den Griffen. Die Kraft lässt nach – an grünen Griffen verschnaufen, braune Griffe brechen weg.', ctrl: [['move', 'Griff wählen'], ['ok', 'Greifen']] }
  ];
  D.TRIAL = Object.fromEntries(D.TRIALS.map(t => [t.id, t]));
  // Gruppenprüfung beim Einzug (nicht in der normalen Zuschauerwahl): alle Camper suchen gemeinsam, jeder Stern zählt fürs Camp
  D.TRIAL.fanquiz = { id: 'fanquiz', name: 'Das IBES-Fan-Quiz', icon: '🏆', stars: 10, time: 0, fan: true, desc: 'Der Wissens-Tank für echte Fans: Fragen zur deutschen Show „Ich bin ein Star – Holt mich hier raus!“ und zum britischen Original „I\'m a Celebrity … Get Me Out of Here!“. Drei Fehler, und der Tank ist voll.', ctrl: [['move', 'Antwort wählen'], ['ok', 'Antworten']] };
  D.TRIAL.marsch = { id: 'marsch', name: 'Der Dschungel-Marsch', icon: '🥾', stars: 10, time: 90, group: true, desc: 'Gruppenprüfung auf dem Weg ins Lager: Alle Camper suchen gemeinsam die Sterne im Dschungel. Jeder Stern ist eine Portion fürs erste Abendessen.', ctrl: [['move', 'Laufen'], ['ok', 'Springen'], ['alt', 'Rennen (halten)']] };
  // Finale: drei kurze Prüfungen für das Finalmenü (Vorspeise, Hauptgang, Nachtisch)
  D.FINAL = [{ id: 'dinner', course: 'Vorspeise' }, { id: 'kisten', course: 'Hauptgang' }, { id: 'quiz', course: 'Nachtisch' }];

  // Essen: Sterne = Portionen
  // Lagerfeuer-Gespräche nach dem Essen: ein Camper fragt, du antwortest. {x} = ein anderer Camper.
  // Antwort: [Text, Sympathie, Unterhaltung, Beziehung zum Fragenden, Beziehung zu allen, Beziehung zu {x}, Reaktion]
  D.FIRETALK = [
    { q: 'Was vermisst ihr hier drin am meisten?', a: [['Meine Familie. Jeden Abend.', 3, 0, 4, 2, 0, 'Oh, das geht mir genauso …'], ['Mein Bett. Und meine Kaffeemaschine. Und Pizza.', 1, 3, 2, 1, 0, 'Pizza! Sag das Wort nicht!'], ['Nichts. Ich hab hier alles, was ich brauche.', -1, 2, -2, -1, 0, 'Ja klar … du Held.']] },
    { q: 'Mal ehrlich: Wer tut hier am wenigsten im Lager?', a: [['Darüber red ich nicht hinter dem Rücken.', 3, 0, 1, 2, 0, 'Respekt, du bist fair.'], ['{x}. Hat heute kein einziges Holzscheit getragen.', -1, 5, 3, -1, -10, 'Ha! Hab ich auch gemerkt!'], ['Ich glaube, ich selbst. Ich arbeite dran!', 2, 2, 2, 2, 0, 'Wenigstens bist du ehrlich.']] },
    { q: 'Wenn ihr morgen rausfliegt – was wäre euer letzter Satz?', a: [['Danke, Leute, ihr seid die beste Truppe!', 3, 1, 2, 3, 0, 'Hör auf, ich muss gleich weinen.'], ['Ich komme wieder – als Moderator:in!', 1, 4, 1, 1, 0, 'Das würde ich sehen wollen!'], ['Ein Glück, endlich duschen.', 0, 3, 0, -1, 0, 'Charmant wie immer …']] },
    { q: 'Habt ihr schon einen Lieblingsmenschen im Camp?', a: [['Ja – {x}. Mit dir kann man lachen.', 2, 1, 0, 0, 10, '{x} strahlt übers ganze Gesicht.'], ['Du! Wer sonst?', 1, 2, 9, -1, 0, 'Oh, wie süß!'], ['Ich mag alle gleich gern.', 1, 0, 0, 2, 0, 'Diplomatisch …']] },
    { q: 'Was war heute euer peinlichster Moment?', a: [['Ich bin vorhin in den Schlamm gefallen. Mit Anlauf.', 2, 4, 2, 2, 0, 'Das hab ich gesehen! Legendär!'], ['Als {x} mich beim Schnarchen nachgemacht hat.', 0, 4, 1, 0, -3, 'Aber es war schon lustig.'], ['Peinlich? Mir passiert nie was Peinliches.', -2, 2, -1, -1, 0, 'Ja ja …']] },
    { q: 'Warum seid ihr eigentlich hier im Lager?', a: [['Ich will mich selbst herausfordern.', 3, 0, 2, 1, 0, 'Starke Antwort.'], ['Ganz ehrlich? Für die Karriere.', -1, 3, 0, -1, 0, 'Wenigstens ehrlich.'], ['Weil meine Oma gesagt hat, ich trau mich nicht.', 2, 4, 3, 2, 0, 'Grüße an deine Oma!']] },
    { q: 'Wer von uns gewinnt am Ende die Krone?', a: [['{x}! Hat es am meisten verdient.', 3, 0, 0, 1, 8, 'Wie nett von dir!'], ['Na ich natürlich!', -1, 4, -1, -2, 0, 'Träum weiter!'], ['Das entscheiden die Zuschauer, nicht wir.', 2, 0, 1, 1, 0, 'Stimmt eigentlich.']] },
    { q: 'Erzählt doch mal eine Gruselgeschichte!', a: [['Hier im Dschungel lebt ein Wesen, das nur nachts … BUH!', 1, 5, 2, 2, 0, 'AAAH! Du Idiot!'], ['Lieber nicht, sonst schläft hier keiner.', 1, 0, 0, 1, 0, 'Vernünftig.'], ['Ich hab mal mein Handy drei Tage nicht gefunden.', 1, 3, 2, 1, 0, 'Das ist wirklich gruselig!']] },
    { q: 'Was würdet ihr für ein Stück Schokolade tun?', a: [['Alles. Wirklich alles.', 0, 4, 2, 1, 0, 'Ich auch!'], ['Mit {x} teilen, wenn es eins gäbe.', 2, 0, 0, 1, 6, 'Merk ich mir!'], ['Ich ernähr mich gerade sowieso gesund.', -1, 1, -1, -1, 0, 'Pff …']] },
    { q: 'Wer war heute der größte Held im Lager?', a: [['{x} – hat sich um alle gekümmert.', 3, 0, 0, 1, 7, 'Hört, hört!'], ['Unser Lagerfeuer. Hat durchgehalten.', 1, 3, 1, 1, 0, 'Ha, gut gesagt!'], ['Ich. Ich hab heute Wasser geholt!', 0, 2, 0, -1, 0, 'Ein Mal …']] }
  ];
  D.MEALS = {
    none: 'Reis und Bohnen – wie jeden Tag ohne Sterne.',
    few: 'Ein paar Portionen Fisch, der Rest teilt sich Reis und Bohnen.',
    full: 'Volles Sterne-Menü: gegrillter Fisch mit Süßkartoffeln und Obst für alle!'
  };

  // Moderationen (Vorlagen): {n} Name, {s} Sterne, {m} maximal, {t} Prüfung, {d} Tag, {k} Camper im Camp
  // Live-Kommentar der Moderatoren während der Prüfung (kurz, nicht blockierend)
  D.LIVE = {
    star: [['lotte', 'Da ist der Stern!'], ['mats', 'Zack, eingesackt!'], ['lotte', 'Das Camp wird jubeln!'], ['mats', 'Läuft bei {n}!'], ['lotte', 'Noch einer! Weiter so!'], ['mats', 'So sieht ein Profi aus.']],
    bad: [['mats', 'Uiii, das tat weh.'], ['lotte', 'Oh nein! Nicht aufgeben!'], ['mats', 'Das gibt Bonuspunkte beim Ekelfaktor.'], ['lotte', 'Durchatmen, {n}!'], ['mats', 'Autsch. Das schauen wir uns nachher in Zeitlupe an.']],
    half: [['lotte', 'Halbzeit! {s} Sterne bisher.'], ['mats', 'Die Hälfte der Zeit ist um – {s} Sterne im Sack.']],
    last: [['mats', 'Noch zehn Sekunden!'], ['lotte', 'Gleich ist Schluss – jetzt alles geben!']],
    slow: [['mats', 'Hallo? Da liegen noch Sterne!'], ['lotte', 'Komm schon, {n}, du schaffst das!'], ['mats', 'Ich glaube, {n} macht gerade Urlaub.']]
  };
  D.MOD = {
    welcome: [
      ['lotte', 'Herzlich willkommen im Urwaldlager! {k} Promis, kein Komfort, aber jede Menge Abenteuer.'],
      ['mats', 'Ab heute heißt es: Bohnen statt Buffet. Und Sterne gibt es nur für Mut.']
    ],
    welcomeStudio: [
      ['lotte', 'Herzlich willkommen im Studio zum Urwaldlager! Unser Dschungel steht diesmal mitten in der Halle.'],
      ['mats', 'Echte Prüfungen, echtes Publikum, falsche Palmen. Los geht’s!']
    ],
    morning: [
      ['mats', 'Guten Morgen Urwald! Tag {d}. Die Zuschauer haben abgestimmt …'],
      ['lotte', 'Tag {d} im Lager. Und ihr wisst, was das heißt: Es wird gewählt!'],
      ['mats', 'Tag {d}. Die Bohnen sind gezählt, die Stimmen auch.']
    ],
    pick: [
      ['lotte', 'In die Urwaldprüfung muss: {n}!'],
      ['mats', 'Ihr habt entschieden – heute geht {n} in die Prüfung.'],
      ['lotte', 'Mit den meisten Stimmen: {n}. Viel Glück!']
    ],
    pickAgain: [
      ['mats', 'Und schon wieder trifft es {n}! Das Publikum kann einfach nicht genug bekommen.'],
      ['lotte', '{n}, die Zuschauer lieben dich. Oder sie wollen dich leiden sehen. Beides geht.']
    ],
    intro: [
      ['lotte', 'Willkommen zu „{t}“! Hier geht es um {m} Sterne – also {m} Mahlzeiten fürs Camp.'],
      ['mats', '{n}, bist du bereit für „{t}“? Du kannst jederzeit abbrechen. Du musst nur den Satz sagen.']
    ],
    rules: [['mats', 'Ich erkläre dir kurz die Regeln.']],
    ready: [['lotte', 'Bereit? Dann … los!'], ['mats', 'Die Uhr läuft. Los geht’s!']],
    good: [['lotte', 'Wahnsinn! {s} von {m} Sternen! Das Camp wird heute satt.'], ['mats', '{s} Sterne! Das war eine Heldenleistung, {n}.']],
    mid: [['mats', '{s} von {m} Sternen. Nicht perfekt, aber das Camp wird sich freuen.'], ['lotte', '{s} Sterne – ordentlich gekämpft!']],
    bad: [['lotte', 'Oh je. {s} von {m} Sternen. Heute gibt es wohl viele Bohnen.'], ['mats', 'Nur {s} Sterne … das wird ein langer Abend am Lagerfeuer.']],
    quit: [['mats', '{n} hat den Satz gesagt! Die Prüfung ist beendet – keine Sterne heute.'], ['lotte', 'Abbruch! Das Camp bekommt heute nur Reis und Bohnen.']],
    evening: [['lotte', 'Es wird Abend im Urwaldlager. Zeit, die Sterne einzulösen.']],
    exitIntro: [['mats', 'Und jetzt wird es ernst. Die Zuschauer haben gewählt, wer das Lager verlassen muss.'], ['lotte', 'Liebe Camper, das Telefon hat geklingelt. Heute muss jemand gehen.']],
    safe: [['lotte', 'Sicher ist … {n}.'], ['mats', 'Weiter im Lager bleibt … {n}.']],
    out: [['mats', '{n}, du musst das Urwaldlager leider verlassen.'], ['lotte', 'Das ist das Ende im Urwald für {n}. Danke für alles!']],
    finalIntro: [['lotte', 'Das große Finale! Nur noch drei sind übrig.'], ['mats', 'Heute gibt es das Finalmenü – drei Gänge, drei Prüfungen, eine Krone.']],
    third: [['mats', 'Auf Platz drei: {n}!']],
    second: [['lotte', 'Und Platz zwei … {n}.']],
    winner: [['mats', 'Die Krone im Urwaldlager geht an …'], ['lotte', '{n}! Herzlichen Glückwunsch!']]
  };

  // Gespräche im Camp: Thema → Wirkung (rel = Beziehung, sym = Sympathie, ent = Unterhaltung)
  D.TALK = [
    { id: 'small', label: 'Plaudern', icon: '💬', rel: 4, sym: 1, ent: 1, lines: ['Wie hast du geschlafen?', 'Was vermisst du am meisten?', 'Hast du auch so Hunger?'] },
    { id: 'lob', label: 'Kompliment machen', icon: '🌟', rel: 7, sym: 2, ent: 0, lines: ['Du warst gestern echt stark!', 'Ohne dich wäre das Camp nur halb so schön.'] },
    { id: 'witz', label: 'Witz erzählen', icon: '😂', rel: 3, sym: 2, ent: 4, lines: ['Was macht eine Bohne im Dschungel? Sie wartet auf ihren Reis.', 'Kennst du den Affen, der Bohnen hasst? Ich auch nicht – hier hassen alle Bohnen!'] },
    { id: 'troest', label: 'Trösten', icon: '🤗', rel: 8, sym: 3, ent: 1, need: 'sad', lines: ['Hey, du schaffst das. Wir halten zusammen.', 'Nur noch ein paar Tage. Dann gibt’s Pizza.'] },
    { id: 'laestern', label: 'Lästern über …', icon: '🐍', rel: 3, sym: -3, ent: 5, gossip: true, lines: ['Ehrlich, {x} macht hier gar nichts.', 'Hast du gesehen, wie {x} sich gestern angestellt hat?'] },
    { id: 'buendnis', label: 'Bündnis schmieden', icon: '🤝', rel: 10, sym: 0, ent: 2, minRel: 55, lines: ['Wir zwei halten zusammen bis zum Finale, okay?'] }
  ];
  D.REPLY = {
    good: ['Ach, das ist lieb von dir!', 'Haha, du bist mir einer!', 'Ja, total!', 'Danke, das tut gut.'],
    bad: ['Hm. Schon klar.', 'Lass mich mal in Ruhe.', 'Echt jetzt?', 'Das find ich nicht so witzig.'],
    gossipYes: ['Stimmt! Hab ich auch gedacht!', 'Psst – aber ja, total.'],
    gossipNo: ['Das finde ich nicht fair.', 'Sag ihr das doch selbst ins Gesicht.']
  };

  // Buschtelefon (Tagebuch): Frage + drei Antworten
  D.PHONE = [
    { q: 'Wer nervt dich im Camp am meisten?', a: [['Niemand – wir sind ein tolles Team.', 3, 0], ['Ganz klar {x}. Faul wie ein Faultier.', -3, 5], ['Die Mücken. Die sind die wahren Stars.', 1, 3]] },
    { q: 'Wie geht es dir nach der letzten Nacht?', a: [['Ehrlich? Ich hab Heimweh.', 3, 1], ['Super, ich schlaf wie ein Baby. Auf Bohnen.', 1, 3], ['Ich hab {x} schnarchen gehört. Wie ein Wildschwein.', -2, 4]] },
    { q: 'Was würdest du für eine Pizza tun?', a: [['Fast alles. Außer singen.', 1, 3], ['Ich würde sie mit allen teilen.', 3, 0], ['Ich würd {x} verkaufen. Sofort.', -2, 5]] },
    { q: 'Wer gewinnt die Krone?', a: [['Ich natürlich. Wer sonst?', -1, 4], ['{x} hätte es verdient.', 3, 1], ['Die Bohnen. Die halten am längsten durch.', 1, 3]] },
    { q: 'Was hast du hier über dich gelernt?', a: [['Dass ich mehr aushalte, als ich dachte.', 3, 1], ['Dass ich ohne Handy ein ganz neuer Mensch bin.', 2, 2], ['Dass ich Krabbeltiere hasse. Alle. Außer {x}.', 0, 4]] },
    { q: 'Was sagst du den Zuschauern zu Hause?', a: [['Danke für eure Stimmen! Ich geb alles!', 3, 1], ['Ruft bitte meine Mama an. Und bringt Schokolade.', 2, 3], ['Wählt {x} in die Prüfung! Bitte!', -2, 5]] }
  ];

  // Morgen-Clips aus dem Buschtelefon: Mit-Camper über dich ({m}) und andere ({x})
  D.PHONE_NPC = {
    bad: ['Ganz ehrlich? {m} spielt hier allen was vor.', '{m} denkt, die Kameras sind nur für {m} da.', 'Wenn {m} noch einmal mein Holz klaut, raste ich aus.', 'Ich trau {m} nicht über den Weg. Null.', '{m} hat gestern die größte Portion gegessen. Hab ich genau gesehen!'],
    good: ['{m} ist das Herz vom Camp. Echt jetzt.', 'Ohne {m} wär ich schon längst raus.', '{m} bringt mich jeden Tag zum Lachen.', 'Ich hoffe, {m} kommt ins Finale. Verdient!'],
    mid: ['{m}? Kann ich noch nicht einschätzen.', '{m} ist okay. Aber Freunde werden wir erst nach drei Pizzen.', 'Ich beobachte {m}. Ganz genau.'],
    other: ['{x} schnarcht wie ein Bär. Jede Nacht!', '{x} hat geheult, weil der Reis kalt war.', 'Ich vermisse mein Bett. Und {x} vermisst sich selbst.', '{x} tut immer so lieb. Ich glaub das nicht.', 'Ich hab Heimweh. Aber {x} tröstet mich.']
  };

  // Gespräche und Zoff zwischen Mit-Campern im Camp ({a} spricht zuerst, {b} antwortet, {m} = du)
  D.SCENES = {
    chat: [
      ['Wie hältst du das nur aus, {b}?', 'Ich denk an Pizza. Den ganzen Tag.', 'Pizza … jetzt hab ich Hunger.'],
      ['Meinst du, die Zuschauer mögen uns?', 'Dich bestimmt. Du redest ja ständig.', 'Haha, sehr witzig.'],
      ['Ich hab heute Nacht kein Auge zugemacht.', 'Ich auch nicht. Irgendwas hat an meinem Zeh geknabbert.', 'IIIH! Erzähl das nicht!'],
      ['Weißt du, was ich vermisse? Eine Dusche mit warmem Wasser.', 'Ich vermiss meinen Hund. Und Kaffee.', 'Kaffee … hör auf.'],
      ['Wenn ich hier rauskomme, schreib ich ein Buch.', 'Über Bohnen?', 'Über DICH, {b}.']],
    gossip: [
      ['Hast du gesehen, wie {m} sich vor der Kamera aufspielt?', 'Und ob. Total gespielt.', 'Psst, nicht so laut …'],
      ['{m} tut immer so nett. Ich glaub das nicht.', 'Ich auch nicht. Wart’s ab.', 'Die Zuschauer merken das schon.'],
      ['Wer, glaubst du, fliegt als Nächstes? Ich tipp auf {m}.', 'Hoffentlich!', 'Das hab ich jetzt nicht gesagt, okay?']],
    fight: [
      ['Wer hat schon wieder das letzte Wasser getrunken?!', 'Ich nicht! Frag doch mal dich selbst!', 'Ich hab die Nase voll von dir!'],
      ['Du hast heute gar nichts gemacht, {b}!', 'Ach ja? Und wer hat das Feuer gerettet?', 'Das war ICH!'],
      ['Hör auf, so laut zu schnarchen!', 'Ich schnarche nicht! Du redest im Schlaf!', 'Unverschämt!'],
      ['Das war MEIN Platz am Feuer!', 'Steht da dein Name drauf?', 'Gleich steht da was ganz anderes!'],
      ['Du lästerst über mich, ich weiß es!', 'Beweis es doch!', 'Die Kameras haben alles!']]
  };

  // Camp-Ereignisse (Entscheidungen)
  D.EVENTS = [
    { id: 'streit', title: 'Streit am Feuer', text: '{a} und {b} streiten lautstark darüber, wer heute Holz holen sollte.', opts: [['Schlichten: „Ich hol’s einfach!“', { sym: 4, ent: 1, work: 1 }], ['Anheizen: „{a} hat recht!“', { sym: -2, ent: 5, relA: 6, relB: -8 }], ['Popcorn holen und zuschauen', { sym: 0, ent: 2 }]] },
    { id: 'frosch', title: 'Besuch im Bett', text: 'In deinem Schlafsack sitzt ein (virtueller) Frosch und schaut dich an.', opts: [['Ganz ruhig raustragen', { sym: 3, ent: 1 }], ['Laut kreischen', { sym: 0, ent: 5 }], ['„Du darfst bleiben. Ich heiß übrigens …“', { sym: 2, ent: 4 }]] },
    { id: 'regen', title: 'Unwetter', text: 'Ein Tropengewitter! Die Plane über den Betten reißt ein.', opts: [['Sofort flicken, egal wie nass', { sym: 4, ent: 1, work: 1 }], ['Unter die Plane kuscheln und singen', { sym: 2, ent: 3 }], ['Sich beschweren: „Ich bin ein Star!“', { sym: -2, ent: 4 }]] },
    { id: 'heimweh', title: 'Heimweh', text: '{a} sitzt allein am Wasser und weint leise.', opts: [['Dazusetzen und zuhören', { sym: 4, ent: 1, relA: 10 }], ['Mit einem Witz aufmuntern', { sym: 2, ent: 3, relA: 5 }], ['Weggehen – nicht dein Problem', { sym: -3, ent: 1, relA: -6 }]] },
    { id: 'diebstahl', title: 'Die verschwundenen Kekse', text: 'Aus dem Luxus-Paket fehlen Kekse. Alle schauen auf {a}.', opts: [['{a} verteidigen', { sym: 3, ent: 2, relA: 8 }], ['Mitbeschuldigen', { sym: -2, ent: 5, relA: -10 }], ['Gestehen, dass du einen hattest', { sym: 3, ent: 4 }]] },
    { id: 'kochen', title: 'Küchen-Krise', text: '{a} will den Reis „mal anders“ kochen – mit Kokosnuss und viel zu viel Salz.', opts: [['Helfen und retten', { sym: 3, ent: 1, relA: 5, work: 1 }], ['Probieren und loben', { sym: 2, ent: 2, relA: 7 }], ['Laut sagen, dass es ungenießbar ist', { sym: -2, ent: 4, relA: -7 }]] },
    { id: 'brief', title: 'Post von zu Hause', text: 'Die Moderatoren bringen Briefe von den Familien. Deiner ist dabei.', opts: [['Laut vorlesen, Tränen inklusive', { sym: 5, ent: 2 }], ['Still für dich lesen', { sym: 2, ent: 0 }], ['Mit {a} teilen, der keinen bekommen hat', { sym: 4, ent: 1, relA: 9 }]] }
  ];

  // Schatzsuche: Frage für das Camp
  D.TREASURE = [
    { q: 'Ihr habt die Kiste gefunden! Öffnen für das Camp – oder lieber die sichere Flasche Wasser nehmen?', a: ['Kiste öffnen!', 'Wasser nehmen'] }
  ];
  // Luxusartikel: jeder Camper darf zwei mitnehmen
  D.LUX = [
    { id: 'kissen', name: 'Kopfkissen', icon: '🛏️', desc: 'Besser schlafen: jede Nacht +10 😴.' },
    { id: 'kaffee', name: 'Instant-Kaffee', icon: '☕', desc: 'Morgens wach: Müdigkeit kostet dich keine Aktion.' },
    { id: 'schoko', name: 'Tafel Schokolade', icon: '🍫', desc: 'Drei Stück für Notfälle: im Camp naschen, +20 🍗.', uses: 3 },
    { id: 'foto', name: 'Familienfoto', icon: '🖼️', desc: 'Gegen Heimweh: einmal am Tag anschauen, gute Laune und Sympathie.' },
    { id: 'karten', name: 'Kartenspiel', icon: '🃏', desc: 'Einmal am Tag mit einem Camper spielen: Freundschaft +, kostet keine Aktion.' },
    { id: 'harmonika', name: 'Mundharmonika', icon: '🎵', desc: 'Dein Lied am Lagerfeuer gelingt immer.' },
    { id: 'tagebuch', name: 'Tagebuch', icon: '📔', desc: 'Jeden Abend schreiben: die Zuschauer lieben deine Gedanken (+😂).' }
  ];
  D.LOOT = [['Kekse', '🍪'], ['Kaffee', '☕'], ['Schokolade', '🍫'], ['Kartenspiel', '🃏'], ['Kissen', '🛏️'], ['Gewürze', '🧂']];

  // Quiz (Wissens-Tank, Schatzsuche, Finale)
  D.QUIZ = [
    ['Wie viele Beine hat eine Spinne?', ['Acht', 'Sechs', 'Zehn', 'Vier']],
    ['Welches Tier ist das größte an Land?', ['Afrikanischer Elefant', 'Giraffe', 'Nashorn', 'Flusspferd']],
    ['Wie heißt die Hauptstadt von Australien?', ['Canberra', 'Sydney', 'Melbourne', 'Perth']],
    ['Wie viele Kontinente gibt es (üblich gezählt)?', ['Sieben', 'Fünf', 'Sechs', 'Neun']],
    ['Was trinkt ein Koala fast nie?', ['Wasser', 'Milch', 'Saft', 'Tee']],
    ['Welches Gas brauchen Pflanzen für die Fotosynthese?', ['Kohlendioxid', 'Sauerstoff', 'Helium', 'Stickstoff']],
    ['Wie viele Minuten hat ein Tag?', ['1440', '1200', '1600', '960']],
    ['Welche Farbe hat ein reifer Rambutan von außen?', ['Rot', 'Blau', 'Grün', 'Schwarz']],
    ['Wie nennt man ein Baby-Känguru?', ['Joey', 'Kitz', 'Fohlen', 'Welpe']],
    ['Welcher Planet ist der Sonne am nächsten?', ['Merkur', 'Venus', 'Mars', 'Erde']],
    ['Wie viele Saiten hat eine normale Gitarre?', ['Sechs', 'Vier', 'Fünf', 'Acht']],
    ['Was ist die Mehrzahl von „Kaktus“?', ['Kakteen', 'Kaktusse', 'Kaktis', 'Kaktüsser']],
    ['Wie viele Zähne hat ein erwachsener Mensch normalerweise?', ['32', '28', '36', '24']],
    ['Aus welchem Land kommt die Pizza Margherita?', ['Italien', 'Spanien', 'Griechenland', 'Frankreich']],
    ['Welches Tier schläft bis zu 20 Stunden am Tag?', ['Koala', 'Hund', 'Pferd', 'Kuh']],
    ['Wie heißt der längste Fluss Deutschlands (ganz in Deutschland)?', ['Weser', 'Elbe', 'Main', 'Donau']],
    ['Wie viele Ecken hat ein Würfel?', ['Acht', 'Sechs', 'Zwölf', 'Vier']],
    ['Welches Instrument hat schwarze und weiße Tasten?', ['Klavier', 'Trompete', 'Geige', 'Schlagzeug']],
    ['Was ist schwerer: ein Kilo Federn oder ein Kilo Steine?', ['Beides gleich', 'Steine', 'Federn', 'Kommt aufs Wetter an']],
    ['Welcher Ozean ist der größte?', ['Pazifik', 'Atlantik', 'Indischer Ozean', 'Arktischer Ozean']],
    ['Wie heißt das Fest mit bunten Eiern?', ['Ostern', 'Weihnachten', 'Silvester', 'Fasching']],
    ['Wie viele Spieler hat eine Fußballmannschaft auf dem Platz?', ['Elf', 'Zehn', 'Zwölf', 'Neun']],
    ['Was legt ein Huhn?', ['Eier', 'Nüsse', 'Steine', 'Federn']],
    ['Wie viele Tage hat ein Schaltjahr?', ['366', '365', '364', '360']],
    ['Welche Farbe entsteht aus Blau und Gelb?', ['Grün', 'Lila', 'Orange', 'Braun']],
    ['Welches Tier kann seine Farbe wechseln?', ['Chamäleon', 'Elefant', 'Pinguin', 'Igel']],
    ['Wie heißt der höchste Berg der Welt?', ['Mount Everest', 'Zugspitze', 'Kilimandscharo', 'Mont Blanc']],
    ['Wie viele Monate haben 31 Tage?', ['Sieben', 'Sechs', 'Fünf', 'Acht']],
    ['Was misst ein Thermometer?', ['Temperatur', 'Luftdruck', 'Gewicht', 'Länge']],
    ['Welcher Vogel kann nicht fliegen?', ['Strauß', 'Spatz', 'Adler', 'Taube']],
    ['Wie viele Herzen hat ein Oktopus?', ['Drei', 'Eins', 'Zwei', 'Acht']],
    ['Welche Frucht ist außen stachelig und innen gelb?', ['Ananas', 'Banane', 'Kiwi', 'Pflaume']],
    ['Wie nennt man Wasser im festen Zustand?', ['Eis', 'Dampf', 'Nebel', 'Tau']],
    ['Wie viele Sekunden hat eine Stunde?', ['3600', '6000', '360', '1000']],
    ['Was ist ein Faultier?', ['Ein Säugetier', 'Ein Vogel', 'Ein Reptil', 'Ein Insekt']],
    ['Wie heißt die größte Insel der Welt?', ['Grönland', 'Madagaskar', 'Australien', 'Island']],
    ['Wofür steht „km/h“?', ['Kilometer pro Stunde', 'Kilo pro Halbtag', 'Kilometer hoch', 'Kraft mal Höhe']],
    ['Welche Tiere leben in einem Bienenstock?', ['Bienen', 'Wespen', 'Ameisen', 'Hummeln']],
    ['Welches Organ pumpt das Blut?', ['Herz', 'Lunge', 'Leber', 'Magen']],
    ['Wie viele Beine hat ein Insekt?', ['Sechs', 'Acht', 'Vier', 'Zehn']]
  ];


  // IBES-Fan-Quiz: Fragen zur echten TV-Show „Ich bin ein Star – Holt mich hier raus!“ (RTL) und „I'm a Celebrity … Get Me Out of Here!“ (ITV).
  // Nur allgemein bekannte, geprüfte Fakten (Stand 2025). Richtige Antwort steht immer zuerst.
  D.FANQUIZ = [
    ['Wer wurde 2004 der allererste Dschungelkönig?', ['Costa Cordalis', 'Ross Antony', 'Joey Heindle', 'Marc Terenzi']],
    ['Wer wurde 2004 in der zweiten Staffel Dschungelkönigin?', ['Désirée Nick', 'Ingrid van Bergen', 'Brigitte Nielsen', 'Melanie Müller']],
    ['Wer gewann 2008 die dritte Staffel?', ['Ross Antony', 'Costa Cordalis', 'Peer Kusmagk', 'Menderes Bağcı']],
    ['Wer wurde 2009 Dschungelkönigin?', ['Ingrid van Bergen', 'Désirée Nick', 'Jenny Frankhauser', 'Djamila Rowe']],
    ['Wer wurde 2013 Dschungelkönig?', ['Joey Heindle', 'Marc Terenzi', 'Filip Pavlović', 'Costa Cordalis']],
    ['Wer wurde 2017 Dschungelkönig?', ['Marc Terenzi', 'Joey Heindle', 'Ross Antony', 'Prince Damien']],
    ['Wer wurde 2018 Dschungelkönigin?', ['Jenny Frankhauser', 'Evelyn Burdecki', 'Lilly Becker', 'Lucy Diakovska']],
    ['Wer wurde 2019 Dschungelkönigin?', ['Evelyn Burdecki', 'Jenny Frankhauser', 'Djamila Rowe', 'Désirée Nick']],
    ['Wer gewann 2022 das Dschungelcamp in Südafrika?', ['Filip Pavlović', 'Joey Heindle', 'Marc Terenzi', 'Peer Kusmagk']],
    ['Wer wurde 2023 Dschungelkönigin?', ['Djamila Rowe', 'Lucy Diakovska', 'Evelyn Burdecki', 'Ingrid van Bergen']],
    ['Wer wurde 2024 Dschungelkönigin?', ['Lucy Diakovska', 'Lilly Becker', 'Djamila Rowe', 'Jenny Frankhauser']],
    ['Wer wurde 2025 Dschungelkönigin?', ['Lilly Becker', 'Lucy Diakovska', 'Evelyn Burdecki', 'Désirée Nick']],
    ['Auf welchem Sender läuft das deutsche Dschungelcamp?', ['RTL', 'ZDF', 'ProSieben', 'Sat.1']],
    ['In welchem Land wird das deutsche Dschungelcamp normalerweise gedreht?', ['Australien', 'Brasilien', 'Thailand', 'Costa Rica']],
    ['In welchem Land fand das deutsche Dschungelcamp 2022 ausnahmsweise statt?', ['Südafrika', 'Australien', 'Wales', 'Kenia']],
    ['Welches Moderatoren-Duo führte durch die ersten Staffeln?', ['Sonja Zietlow und Dirk Bach', 'Sonja Zietlow und Daniel Hartwich', 'Ant und Dec', 'Jan Köppen und Daniel Hartwich']],
    ['Wer übernahm 2013 die Moderation an der Seite von Sonja Zietlow?', ['Daniel Hartwich', 'Jan Köppen', 'Dirk Bach', 'Oliver Pocher']],
    ['Wie heißt der Satz, mit dem man die Show freiwillig verlässt?', ['„Ich bin ein Star – holt mich hier raus!“', '„Ich will nach Hause!“', '„Ich gebe auf!“', '„Ende im Gelände!“']],
    ['Was gibt es im Camp zu essen, wenn keine Sterne erspielt wurden?', ['Reis und Bohnen', 'Nudeln mit Soße', 'Brot und Wasser', 'Kartoffeln']],
    ['Wie heißt der Ort, an dem die Camper allein in die Kamera sprechen?', ['Dschungeltelefon', 'Beichtstuhl', 'Sprechzimmer', 'Buschfunk']],
    ['Unter welchem Spitznamen wurde der langjährige Sanitäter der Show bekannt?', ['Dr. Bob', 'Dr. Jungle', 'Doc Holiday', 'Dr. Croc']],
    ['Wie hieß 2021 die Ersatz-Show aus Deutschland, als nicht im Dschungel gedreht wurde?', ['Ich bin ein Star – Die große Dschungelshow', 'Dschungelcamp Spezial', 'Das Dschungel-Studio', 'Dschungel Daheim']],
    ['Wer gewann 2002 die allererste britische Staffel von „I\'m a Celebrity“?', ['Tony Blackburn', 'Phil Tufnell', 'Joe Swash', 'Kian Egan']],
    ['Welches Duo moderiert „I\'m a Celebrity … Get Me Out of Here!“ in Großbritannien?', ['Ant und Dec', 'Sonja Zietlow und Dirk Bach', 'Holly und Phillip', 'Jedward']],
    ['Auf welchem Sender läuft die britische Show?', ['ITV', 'BBC One', 'Channel 4', 'Sky One']],
    ['In welchem Land wurde die britische Show 2020 und 2021 in einer Burg gedreht?', ['Wales', 'Schottland', 'Irland', 'Australien']],
    ['Wer gewann 2008 die britische Staffel?', ['Joe Swash', 'Matt Willis', 'Gino D\'Acampo', 'Carl Fogarty']],
    ['Welches Westlife-Mitglied gewann 2013 in Großbritannien?', ['Kian Egan', 'Shane Filan', 'Nicky Byrne', 'Mark Feehily']],
    ['Wer gewann 2015 die britische Staffel?', ['Vicky Pattison', 'Scarlett Moffatt', 'Charlie Brooks', 'Giovanna Fletcher']],
    ['Wer gewann 2016 die britische Staffel?', ['Scarlett Moffatt', 'Vicky Pattison', 'Jill Scott', 'Kerry Katona']],
    ['Welche Fußball-Europameisterin gewann 2022 in Großbritannien?', ['Jill Scott', 'Vicky Pattison', 'Scarlett Moffatt', 'Giovanna Fletcher']],
    ['Wer gewann 2023 die britische Staffel?', ['Sam Thompson', 'Danny Jones', 'Danny Miller', 'Joe Swash']],
    ['Welches McFly-Mitglied gewann 2024 in Großbritannien?', ['Danny Jones', 'Dougie Poynter', 'Tom Fletcher', 'Harry Judd']],
    ['Welches McFly-Mitglied gewann schon 2011 in Großbritannien?', ['Dougie Poynter', 'Danny Jones', 'Tom Fletcher', 'Harry Judd']]
  ];

  // Ekel-Gänge (erfunden)
  D.DISHES = [
    ['Mehlwurm-Müsli', '🪱', 1], ['Kakerlaken-Krokant', '🪳', 1], ['Fischaugen-Bowle', '👁️', 2],
    ['Grillen-Gulasch', '🦗', 2], ['Schleim-Pudding', '🟢', 3], ['Stinkfrucht-Smoothie', '🍈', 3],
    ['Schneckensuppe', '🐌', 2], ['Spinnenbein-Salat', '🕷️', 3]
  ];

  D.TIPS = [
    'Sterne aus Prüfungen sind Essensportionen. Mehr Sterne = glücklicheres Camp.',
    'Die Zuschauer wählen, wer in die Prüfung muss. Wer auffällt, muss öfter ran.',
    'Im Buschtelefon kannst du ehrlich, lustig oder fies sein – das Publikum merkt sich alles.',
    'Wer im Camp hilft (Holz, Wasser, Kochen), gewinnt Sympathie.',
    'Lästern bringt Unterhaltung, kostet aber Sympathie und Freundschaften.',
    'Der Satz „Ich bin raus aus dem Urwald!“ beendet eine Prüfung sofort – ohne Sterne.',
    'In der Buschtrommel siehst du jederzeit, wie die (simulierte) Zuschauerstimmung steht.',
    'Am Controller öffnest du das Kommandomenü mit dem Steuerkreuz – wie in einem Rollenspiel.'
  ];
})();
