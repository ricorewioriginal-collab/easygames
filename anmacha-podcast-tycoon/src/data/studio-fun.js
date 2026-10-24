/* Spaß-Daten: Sprüche von Marco und Andrew (D.banter), Studio-Momente mit Entscheidungen (D.studioEvents),
   Tagesziele (D.funGoals), Stufen-Titel und Moderations-Boni. Logik in src/sim/fun.js.
   Sprüche: „M:“ = Marco, „A:“ = Andrew, „|“ trennt einen kurzen Wortwechsel. {name}, {n}, {q}, {lvl}, {title} werden ersetzt. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};

  D.banter = {
    welcome: ['M:Da ist ja unsere Studioleitung!|A:Kaffee steht bereit. Also … fast.', 'A:Heute wird gesendet! Oder zumindest geplant.|M:Oder Kabel sortiert. Wir sehen dann.', 'M:Gut, dass du da bist, {name}. Andrew hat schon wieder am Mischpult gedreht.|A:Nur ein bisschen!'],
    morning: ['A:Guten Morgen! Neuer Tag, neue Tagesziele.', 'M:Moin! Ich hab geträumt, wir hätten eine Million Hörer.|A:Und? Wie war’s?|M:Laut.', 'A:Frühstück, Folge, Feierabend. So der Plan.', 'M:Kaffee. Dann reden. In dieser Reihenfolge.'],
    idle: ['M:Andrew, hast du meine Lieblingstasse gesehen?|A:Welche? Die mit dem Sprung?|M:Die mit Charakter!', 'A:Ich hab einen Beat im Kopf … dum-tschak-dum.|M:Bitte nicht ins Mikro.', 'M:Wusstest du, dass dieses Kabel älter ist als unser Podcast?|A:Merkt man.', 'A:Wollen wir mal eine Folge über Socken machen?|M:Wenig Interessantes aus unserem Leben – perfekt!', 'M:Wenn das Rotlicht angeht, bin ich hellwach.|A:Und davor?|M:Davor bin ich Marco.', 'A:Die Pflanze in der Ecke braucht Wasser.|M:Die Pflanze ist aus Plastik.|A:Ach so. Deshalb lebt sie noch.', 'M:Ich glaube, das Mischpult mag mich.|A:Es blinkt dich an. Das ist eine Warnung.', 'A:Sollen wir ein AnMaCha-Kochbuch machen?|M:Mit einem Rezept: Kaffee.', 'M:Psst, {name} guckt. Tu beschäftigt!|A:Ich bin beschäftigt! Mit Gucken.'],
    tired: ['A:Ich bin so müde, ich könnte im Stehen moderieren. Mit geschlossenen Augen.', 'M:Meine Energie ist bei 2 %. Ladegerät? Kaffeeküche? Bett?', 'A:Wenn ich jetzt aufnehme, sage ich nur noch „ähm“.'],
    build: ['M:Oh, schick! Das kommt in die Studio-Tour.', 'A:Neues Spielzeug! Darf ich drücken?', 'M:Das passt da perfekt hin. Fast so gut wie ich.', 'A:Sieht schon viel mehr nach Profi aus!', 'M:Moment, ich mess kurz nach … passt!'],
    buildBig: ['M:Wow, das hat aber was gekostet!|A:Wir verkaufen einfach Marcos Bart-Öl.', 'A:Das ist ja ein richtiges Studio jetzt!|M:Ich muss mich kurz setzen.'],
    pubTop: ['A:Wahnsinn! Die Leute lieben es!|M:Ich hab’s ja gesagt. Kabel ist Leidenschaft!', 'M:{n} Hörer! Ich bekomme Gänsehaut.|A:Das ist der Ventilator.|M:Lass mir den Moment!', 'A:Fünf Sterne, Marco! FÜNF!|M:Ich zähle nur vier … ach, da ist der fünfte.'],
    pubOk: ['M:Solide Folge! Da geht noch mehr.', 'A:Nicht schlecht für einen Dienstag. Oder welcher Tag ist heute?', 'M:{n} Leute hören uns zu. Hallo ihr alle!|A:Die hören das erst morgen, Marco.'],
    pubBad: ['A:Hm. Das Mikro war … an, oder?|M:Lass uns nicht drüber reden.', 'M:Okay, das war eher eine Übungsfolge.|A:Eine sehr ehrliche Übungsfolge.', 'A:Nächstes Mal mehr Technik und weniger Chaos. Oder mehr Chaos, aber mit Technik.'],
    mission: ['A:Mission erledigt! High five!|M:Nicht ins Mikro hauen!', 'M:Das läuft ja wie geschnitten Brot.', 'A:Abgehakt! Was kommt als Nächstes?'],
    mgWin: ['M:Starke Leistung!', 'A:Wie ein Profi! Hast du heimlich geübt?', 'M:Ich hätte das auch geschafft. Irgendwann.'],
    mgLose: ['A:Knapp daneben ist auch vorbei … aber nur knapp!', 'M:Nicht schlimm, das Gerät hat geschummelt.', 'A:Nochmal! Diesmal klappt’s.'],
    goal: ['A:Tagesziel geschafft! Weiter so!', 'M:Haken dran. Ich liebe Haken.', 'A:Läuft bei uns!'],
    allGoals: ['M:Alle Tagesziele! Konfetti!|A:Wer räumt das nachher auf?|M:Morgen-Marco.', 'A:Was für ein Tag! Alles erledigt!'],
    level: ['M:Studio-Stufe {lvl}! Wir sind jetzt offiziell „{title}“.|A:Das drucken wir auf Tassen.', 'A:Stufe {lvl}! Ich muss meine Mutter anrufen.|M:Die hört doch eh jede Folge.'],
    streak: ['A:{n} Tage am Stück eine Folge! Die Serie lebt!', 'M:Sende-Serie: {n} Tage! Nicht aufhören jetzt!'],
    broke: ['M:Äh, das Konto ist im Minus.|A:Nebenjob? Ich kann gut Kisten tragen.', 'A:Sparkurs! Ab heute nur noch Leitungswasser-Kaffee.'],
    repair: ['M:Repariert! Riecht nur noch ganz leicht nach Toast.', 'A:Alles brummt wieder richtig. Also gar nicht. Gut so!'],
    hire: ['A:Willkommen im Team! Kaffee ist links, Chaos überall.', 'M:Endlich Verstärkung! Ich zeig dir, wo die Kabel wohnen.'],
    leadMarco: ['M:Ich übernehme! Heute wird’s technisch.|A:Ich mach die Geräusche.'],
    leadAndrew: ['A:Ich moderiere! Mit ganz viel Herz.|M:Und ich drück die Knöpfe.'],
    leadBoth: ['M:Wir beide zusammen!|A:Das Dream-Team. Mit Doppel-Chaos.']
  };

  // Moderation: wer die Folge führt (Planung). q = Qualität, fans = Anteil zusätzlicher neuer Fans, mood/energy für beide Hosts
  D.funLeads = {
    marco: { icon: '🔧', short: 'Technik-Profi: +3 Qualität bei TEC/TV, sonst +1', q: 1, qRub: { tec: 3, tv: 3 } },
    andrew: { icon: '💛', short: 'Publikumsliebling: +10 % neue Fans', q: 0, fans: 0.1 },
    both: { icon: '🤝', short: 'Doppel-Chemie: +2 Qualität, gute Laune, aber mehr Energie', q: 2, mood: 4, energy: 5 }
  };

  D.funTitles = ['Garagen-Podcaster', 'Kabelsalat-Profis', 'Kiez-Stimmen', 'Lokalfunk-Helden', 'Stadtgespräch', 'Charts-Kletterer', 'Studio-Bosse', 'Podcast-Promis', 'Medien-Mogule', 'AnMaCha-Ikonen'];

  // Tagesziele: ev = welches Ereignis zählt (siehe PT.Fun.goalMatch), need = Anzahl, rew = Belohnung, cond = wann im Topf
  D.funGoals = [
    { id: 'pub1', icon: '🎙️', label: 'Veröffentliche eine Folge', ev: 'publish', need: 1, rew: { money: 150, xp: 30 }, pub: true },
    { id: 'pubq', icon: '💎', label: 'Folge mit mindestens {q} % Qualität', ev: 'publish', minQ: true, need: 1, rew: { money: 220, fans: 5, xp: 40 }, pub: true, cond: 'episode' },
    { id: 'lead', icon: '🎤', label: 'Lass {host} eine Folge moderieren', ev: 'publish', lead: true, need: 1, rew: { money: 180, xp: 35 }, pub: true, cond: 'episode' },
    { id: 'listen', icon: '🎧', label: 'Erreiche {n} Hörer mit einer Folge', ev: 'publish', listeners: true, need: 1, rew: { money: 200, fans: 8, xp: 40 }, pub: true, cond: 'episode' },
    { id: 'mg1', icon: '🕹️', label: 'Gewinne ein Minispiel', ev: 'minigame', win: true, need: 1, rew: { money: 100, xp: 20 } },
    { id: 'build2', icon: '🔨', label: 'Platziere 2 Objekte im Studio', ev: 'build', need: 2, rew: { money: 120, xp: 20 } },
    { id: 'talk2', icon: '💬', label: 'Plaudere mit 2 Leuten', ev: 'talk', need: 2, rew: { money: 80, xp: 15 } },
    { id: 'moment', icon: '⚡', label: 'Kläre einen Studio-Moment', ev: 'event', need: 1, rew: { money: 100, fans: 3, xp: 20 }, cond: 'moments' },
    { id: 'visit', icon: '🗺️', label: 'Besuche einen anderen Bezirk', ev: 'visit', need: 1, rew: { money: 90, xp: 15 }, cond: 'district' },
    { id: 'guest', icon: '⭐', label: 'Veröffentliche eine Folge mit Gast', ev: 'publish', guest: true, need: 1, rew: { money: 250, fans: 6, xp: 45 }, pub: true, cond: 'guests' }
  ];

  // Studio-Momente: kurze Entscheidungen zwischendurch (when: 'studio'). Wirkung wie D.events, dazu hmood (Laune der Hosts),
  // creat (Kreativität der Hosts). say = Reaktion von Marco/Andrew. mg = Minispiel mit win/lose.
  D.studioEvents = [
    { id: 'fe_fan', title: 'Ein Fan steht vor der Tür!', text: 'Andrew: „Da klingelt jemand mit selbstgemaltem AnMaCha-Shirt. Was machen wir?“', when: 'studio', choices: [
      { label: 'Autogramm und Selfie', effect: { fans: 6, hmood: 5, energy: -3 }, say: 'A:Ich hab „Andrew“ falsch geschrieben. Egal, ist jetzt ein Sammlerstück!' },
      { label: 'Spontanes Fan-Quiz (Minispiel)', mg: 'Q01', win: { fans: 15, rep: 1, hmood: 6 }, lose: { fans: 3 }, say: 'M:Quizshow vor der Haustür – das machen wir öfter!' },
      { label: 'Freundlich vertrösten', effect: { energy: 3 }, say: 'M:Nächstes Mal gibt’s Kekse, versprochen!' }] },
    { id: 'fe_viral', title: 'Andrews Lachen geht viral', text: 'Marco: „Jemand hat Andrews Lachen aus der letzten Folge geremixt. Es läuft überall!“', when: 'studio', needEpisode: true, choices: [
      { label: 'Remix offiziell posten', effect: { fans: 22, rep: -1, story: { publikum: 1 } }, say: 'A:Ich bin jetzt ein Klingelton. Mein Leben ist komplett.' },
      { label: 'Ein Danke-Video drehen', effect: { fans: 12, rep: 1, energy: -5 }, say: 'M:Herzlich, ehrlich, AnMaCha. So geht das!' }] },
    { id: 'fe_shit', title: 'Mini-Shitstorm!', text: 'Andrew: „Marco hat gesagt, Ananas auf Pizza sei Kunst. Das Internet brennt.“', when: 'studio', needEpisode: true, choices: [
      { label: 'Entschuldigungs-Video', effect: { rep: 2, fans: -4 }, say: 'M:Ich entschuldige mich. Aber nur ein bisschen.' },
      { label: 'Mit Humor kontern', effect: { fans: 14, rep: -2, story: { chaos: 1 } }, say: 'A:Pizza-Umfrage gestartet. 51 % für Ananas! Wir haben gewonnen!' },
      { label: 'Aussitzen', effect: { fans: -8 }, say: 'M:Das geht vorbei. Hoffentlich. Bald. Bitte.' }] },
    { id: 'fe_mic', title: 'Mikro auf den Boden!', text: 'Marco: „Uuups. Das Mikro ist runtergefallen. Es macht jetzt so … krrrks.“', when: 'studio', choices: [
      { label: 'Profi-Reparatur (60 SC)', effect: { money: -60, reliab: 5 }, say: 'M:Wie neu! Sogar besser als vorher.' },
      { label: 'Selbst neu verkabeln (Minispiel)', mg: 'T01', win: { reliab: 9, hmood: 4 }, lose: { reliab: -4 }, say: 'A:Ich halte die Taschenlampe!' },
      { label: 'Klebeband drum', effect: { reliab: -3, story: { chaos: 1 } }, say: 'A:Hält. Irgendwie. Nicht anfassen!' }] },
    { id: 'fe_pizza', title: 'Falsche Pizza-Lieferung', text: 'Andrew: „Der Bote bringt vier Pizzen, die keiner bestellt hat. Sie riechen fantastisch.“', when: 'studio', choices: [
      { label: 'Bezahlen und futtern (25 SC)', effect: { money: -25, energy: 15, hmood: 8 }, say: 'M:Beste Fehlbestellung aller Zeiten.' },
      { label: 'Ehrlich zurückschicken', effect: { rep: 1 }, say: 'A:Tschüss, Pizza. Ich werde dich nie vergessen.' }] },
    { id: 'fe_nachbar', title: 'Der Nachbar klopft', text: 'Marco: „Herr Krüger von nebenan sagt, wir wären zu laut. Er hält einen Schneebesen in der Hand.“', when: 'studio', choices: [
      { label: 'Shoutout in der nächsten Folge', effect: { fans: 4, rep: 1 }, say: 'A:Herr Krüger hört jetzt mit! Er hat sogar abonniert.' },
      { label: 'Türdichtung kaufen (80 SC)', effect: { money: -80, condition: 8 }, say: 'M:Ruhe im Flur, Frieden im Haus.' }] },
    { id: 'fe_gurke', title: 'Seltsames Werbeangebot', text: 'Andrew: „Ein Getränkehersteller will Werbung für ‚Gurkenwasser-Energy‘. Sie zahlen sofort.“', when: 'studio', choices: [
      { label: 'Annehmen (+250 SC)', effect: { money: 250, rep: -3 }, say: 'M:Schmeckt wie … Rasen. Aber bezahlter Rasen!' },
      { label: 'Höflich ablehnen', effect: { rep: 2, story: { legende: 1 } }, say: 'A:Wir bleiben glaubwürdig. Und gurkenfrei.' }] },
    { id: 'fe_idee', title: 'Geistesblitz!', text: 'Andrew: „Ich hab DIE Idee: eine Folge nur mit Geräuschen aus der Kaffeeküche!“', when: 'studio', choices: [
      { label: 'Sofort aufschreiben', effect: { creat: 12, hmood: 4 }, say: 'M:Das ist so verrückt, das könnte funktionieren.' },
      { label: 'Erst mal Pause machen', effect: { energy: 10 }, say: 'A:Okay, aber ich summe die Idee leise weiter.' }] },
    { id: 'fe_kaffee', title: 'Kaffee ist alle!', text: 'Marco starrt auf die leere Dose. „Das … ist das Ende.“', when: 'studio', choices: [
      { label: 'Schnell Kaffee holen (15 SC)', effect: { money: -15, energy: 12 }, say: 'M:Ich lebe wieder! Danke, Studioleitung!' },
      { label: 'Tee-Tag ausrufen', effect: { energy: -4, hmood: -3, story: { publikum: 1 } }, say: 'A:Kamille ist auch … flüssig.' }] },
    { id: 'fe_anruf', title: 'Hörerin am Telefon', text: 'Andrew: „Frau Bauer ruft an und hat eine Quizfrage für uns. Live!“', when: 'studio', needEpisode: true, choices: [
      { label: 'Wahr oder Quatsch spielen (Minispiel)', mg: 'Q02', win: { fans: 12, rep: 2 }, lose: { fans: 4 }, say: 'M:Frau Bauer ist jetzt offiziell Ehrenmitglied.' },
      { label: 'Nett plaudern', effect: { fans: 6, energy: -3 }, say: 'A:Sie hat uns Plätzchen versprochen!' }] },
    { id: 'fe_bodo', title: 'Bodo mit der Kabelkiste', text: 'Bodo: „Ich hab hier ein paar richtig gute Kabel. Fast neu. Für euch: 100 SC.“', when: 'studio', choices: [
      { label: 'Kaufen (100 SC)', effect: { money: -100, reliab: 12 }, say: 'M:Goldstecker! Ich muss kurz weinen.' },
      { label: 'Nein danke', effect: {}, say: 'A:Wir haben genug Kabel. Glaube ich. Marco?' }] },
    { id: 'fe_tour', title: 'Studio-Tour fürs Netz', text: 'Marco: „Lass uns eine kleine Studio-Tour filmen. Die Leute wollen sehen, wo die Magie passiert!“', when: 'studio', choices: [
      { label: 'Klar, Kamera an!', effect: { fans: 10, energy: -6, hmood: 3 }, say: 'A:Und hier sehen Sie: Kabel. Und da: mehr Kabel.' },
      { label: 'Erst aufräumen', effect: { condition: 5 }, say: 'M:Gute Idee. Da liegt noch ein Sandwich von 2019.' }] },
    { id: 'fe_wette', title: 'Jingle-Wettsingen', text: 'Andrew: „Wetten, ich singe den AnMaCha-Jingle schneller als Marco?“', when: 'studio', choices: [
      { label: 'Team Andrew!', effect: { hmood: 6, fans: 3 }, say: 'A:Ha! Neun Sekunden! Weltrekord!' },
      { label: 'Team Marco!', effect: { hmood: 6, creat: 5 }, say: 'M:Mit Bass-Stimme zählt doppelt!' },
      { label: 'Beat-Battle (Minispiel)', mg: 'Y02', win: { hmood: 10, fans: 8 }, lose: { hmood: 3 }, say: 'A:Das gibt einen Remix!' }] },
    { id: 'fe_licht', title: 'Das Licht flackert', text: 'Marco: „Das Deckenlicht macht Disco. Ungefragt.“', when: 'studio', choices: [
      { label: 'Elektriker rufen (40 SC)', effect: { money: -40, condition: 7 }, say: 'A:Licht an, Disco aus. Schade eigentlich.' },
      { label: 'Ignorieren und weitermachen', effect: { condition: -5, story: { chaos: 1 } }, say: 'M:Nennen wir es Stimmungsbeleuchtung.' }] },
    { id: 'fe_oma', title: 'Post von Oma Gerda', text: 'Andrew: „Ein Brief von Oma Gerda, 93 Jahre, hört jede Folge zweimal. Mit Strickmütze für Marco!“', when: 'studio', needEpisode: true, choices: [
      { label: 'In der Folge vorlesen', effect: { fans: 8, rep: 1, hmood: 6 }, say: 'M:Die Mütze trage ich ab jetzt bei jeder Aufnahme.' },
      { label: 'Persönlich zurückschreiben', effect: { rep: 2, story: { legende: 1 } }, say: 'A:Mit Autogramm und Foto vom Studio!' }] },
    { id: 'fe_trend', title: 'Ein Thema trendet!', text: 'Marco: „Alle reden gerade über sprechende Kühlschränke. Sollen wir da was zu machen?“', when: 'studio', choices: [
      { label: 'Spontan ein Clip dazu', effect: { fans: 9, energy: -4 }, say: 'A:Unser Kühlschrank sagt übrigens nur „Brummm“.' },
      { label: 'Lieber beim Plan bleiben', effect: { creat: 6 }, say: 'M:Fokus! Gute Folgen brauchen Ruhe.' }] }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
