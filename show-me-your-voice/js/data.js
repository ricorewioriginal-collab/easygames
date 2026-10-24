/* SHOW ME YOUR VOICE – Spieldaten: Jury, Kandidaten, Runden, Songs, Dialoge, Show-Archiv.
   Reine Daten, keine Logik. Läuft im Browser (window.SMYV_DATA) und in Node (Tests). */
(function (root) {
  'use strict';

  const CRIT = {
    timing: 'Timing', stimme: 'Stimme', ausdruck: 'Ausdruck',
    praesenz: 'Bühnenpräsenz', mut: 'Mut', entwicklung: 'Entwicklung'
  };

  // Drei stimmberechtigte Juroren (Bilder aus dem Original-Asset-Sheet). Gewichte ergeben je 1.
  const JURY = [
    { id: 'marc', name: 'Marc', role: 'Der Perfektionist', img: 'img/jury-marc.jpg', need: 60,
      w: { timing: 0.45, stimme: 0.35, ausdruck: 0.2 },
      lines: {
        top: ['Ich nehme die Brille ab. Das passiert selten, {n}. Das war präzise bis in die letzte Silbe.',
          'Kein Wackler, kein Wenn und Aber. So klingt jemand, der gearbeitet hat.',
          'Ich suche immer den Fehler. Heute habe ich keinen gefunden.',
          'Dein {s} war messerscharf. Mehr muss ich nicht sagen.',
          'Das war Studioqualität – und zwar live. Respekt.'],
        yes: ['Solide. Dein {s} trägt dich, an {w} feilen wir noch.',
          'Nicht perfekt, aber ehrlich gut. Ja von mir.',
          'Ich habe ein paar Unsauberkeiten gehört – aber die Basis stimmt.',
          'Du warst im Takt, wo es zählt. Weiter so.',
          'Das Fundament steht. Jetzt bau bitte ein Haus drauf.',
          'Ich bin nicht leicht zu überzeugen. Heute hast du es geschafft.'],
        close: ['Knapp, {n}. Dein {w} hat dich Punkte gekostet.',
          'Da war mehr drin. Zwei, drei saubere Einsätze und ich hätte Ja gesagt.',
          'Ich höre Potenzial – aber Potenzial allein gewinnt keine Staffel.',
          'Tut mir leid, das war mir im {w} zu wackelig.'],
        no: ['Das war nicht dein Tag. Timing ist kein Gefühl, Timing ist Arbeit.',
          'Ich habe zu viele verpasste Einsätze gehört. Von mir ein Nein.',
          'Ehrlich? Da hat die Band allein gespielt.',
          'Ich sage Nein – aber geh trainieren und zeig es mir beim nächsten Mal.',
          'Das war leider noch nicht bühnenreif.'],
        battle: ['Mein Punkt geht an {x}. Sauberer, klarer, präziser.', 'Für mich zählt Genauigkeit – und die hatte heute {x}.', '{x}. Weniger Fehler, mehr Kontrolle.']
      } },
    { id: 'lena', name: 'Lena', role: 'Die Gefühlsjägerin', img: 'img/jury-lena.jpg', need: 55,
      w: { ausdruck: 0.4, praesenz: 0.35, stimme: 0.25 },
      lines: {
        top: ['Ich habe Gänsehaut bis in die Ohrringe! {n}, das war magisch.',
          'Du hast nicht gesungen, du hast erzählt. Ich habe jedes Wort geglaubt.',
          'WOW. Einfach nur wow. Ich brauche kurz ein Taschentuch.',
          'So eine Ausstrahlung kann man nicht lernen. Die hat man.',
          'Das Publikum hat dir aus der Hand gefressen – ich übrigens auch.'],
        yes: ['Ich habe dich gespürt, und darum geht es. Ja!',
          'Dein {s} hat mich abgeholt. Bleib genau so.',
          'Ein paar Töne haben gewackelt, dein Herz nicht. Ja von mir.',
          'Du gehörst auf diese Bühne. Das sieht man sofort.',
          'Mir hat die Geschichte in deiner Stimme gefallen.',
          'Mehr Blickkontakt mit dem Publikum, dann wird es noch größer. Ja!'],
        close: ['Ich war so kurz davor, mich mitreißen zu lassen … aber eben nur kurz.',
          'Dein {w} hat mich noch nicht erreicht. Es tut mir weh, aber nein.',
          'Du warst sehr in dir drin. Lass uns beim nächsten Mal mit rein.',
          'Schön, aber zu vorsichtig. Ich will dich fühlen!'],
        no: ['Ich habe die Musik gehört, aber nicht dich.',
          'Da fehlte mir heute das Feuer. Leider nein.',
          'Ich glaube, die Nerven haben gewonnen. Das passiert den Besten.',
          'Ich sage Nein, aber bitte hör nicht auf zu singen.',
          'Das war leider ganz weit weg von meinem Herzen.'],
        battle: ['Mein Herz sagt {x}. Da war mehr Gefühl.', '{x} hat mich berührt – das entscheidet für mich.', 'Ich gehe mit {x}. Diese Ausstrahlung!']
      } },
    { id: 'david', name: 'David', role: 'Der Produzent', img: 'img/jury-david.jpg', need: 57,
      w: { mut: 0.3, timing: 0.25, praesenz: 0.2, entwicklung: 0.25 },
      lines: {
        top: ['Ich habe im Kopf schon den Remix gebaut. Das war ein Hit, {n}!',
          'Groove, Mut, Haltung – du hast das komplette Paket abgeliefert.',
          'Ich hätte fast den Hut in die Luft geworfen. Fast!',
          'Du bist ein Risiko eingegangen und hast es gewonnen. Das liebe ich!',
          'Das war kein Casting mehr, das war schon ein Konzert.'],
        yes: ['Da war Groove drin. Ich bin dabei!',
          'Mutig gewählt, sauber geliefert. Ja!',
          'Dein {s} war stark. An {w} schrauben wir im Studio.',
          'Ich mag Leute, die sich was trauen. Ja von mir.',
          'Nicht fehlerfrei, aber mit Charakter. Das bleibt hängen.',
          'Du hast dich gesteigert, und das sehe ich. Weiter!'],
        close: ['Fast, {n}. Mir fehlte der Moment, in dem du alles riskierst.',
          'Gute Idee, halbe Umsetzung. Diesmal noch Nein.',
          'Ich habe mit dem Fuß mitgewippt – aber nur mit einem.',
          'Dein {w} hat den Groove gebremst. Knapp vorbei.'],
        no: ['Das war mir zu sicher, zu klein, zu leise. Nein.',
          'Der Beat ist weggelaufen und du bist nicht hinterher.',
          'Ich habe nichts gefunden, woran ich produzieren könnte. Sorry.',
          'Mutig wäre gewesen, es durchzuziehen. Heute leider Nein.',
          'Ich glaube an Comebacks. Komm wieder, wenn es brennt.'],
        battle: ['{x}! Mehr Mut, mehr Groove.', 'Ich nehme {x} mit ins Studio.', 'Mein Punkt: {x}. Da war Risiko – und es hat sich gelohnt.']
      } },
    // Gastjuroren (frei erfunden, gezeichnet): wechseln ab dem Recall in die Jury, wenn „Wechselnde Jury“ an ist.
    { id: 'nina', name: 'Nina Sturm', role: 'Die Rockröhre', guest: true, need: 58, favs: ['rock'],
      look: { skin: 0, hair: 'lang', hairColor: 4, outfit: 'lederjacke', outfitColor: 5, acc: 'ohrring', piercing: 'nase' },
      w: { stimme: 0.35, mut: 0.35, praesenz: 0.3 },
      lines: {
        top: ['Das war laut, ehrlich und dreckig schön, {n}. Genau so!', 'Ich habe gerade meine Stimmbänder beneidet. Wahnsinn.', 'Du hast die Bühne nicht betreten, du hast sie erobert.'],
        yes: ['Dein {s} hat Kraft. Ja!', 'Da war Feuer drin. An {w} arbeiten wir.', 'Rau, aber echt. Ich bin dabei.'],
        close: ['Fast! Lass beim nächsten Mal alles raus.', 'Dein {w} hat mich noch nicht gepackt. Knapp nein.', 'Zu brav, {n}. Ich will dich schreien hören.'],
        no: ['Das war mir zu leise im Herzen. Nein.', 'Da fehlte die Wut im Bauch. Heute nicht.', 'Ich habe gewartet, dass es knallt – es kam nicht.'],
        battle: ['{x}! Mehr Druck, mehr Rock.', 'Ich nehme {x}. Da hat es gebrannt.', 'Für mich ganz klar {x}.']
      } },
    { id: 'kofi', name: 'Kofi Mensah', role: 'Der Gesangslehrer', guest: true, need: 60, favs: ['soul', 'ballade'],
      look: { skin: 5, hair: 'buzz', hairColor: 0, outfit: 'sakko', outfitColor: 0, acc: 'brille', beard: 'stoppeln' },
      w: { stimme: 0.5, timing: 0.3, ausdruck: 0.2 },
      lines: {
        top: ['Technisch sauber und trotzdem frei. Das ist die Königsklasse, {n}.', 'Diese Stütze, diese Linie – ich würde dich sofort unterrichten wollen. Oder von dir lernen.', 'Jeder Ton saß. Ich habe nichts zu korrigieren.'],
        yes: ['Gute Technik, besonders im {s}. Ja.', 'Die Stimme trägt. Am {w} feilen wir noch.', 'Saubere Arbeit. Du hast geübt, das hört man.'],
        close: ['Die Stimme ist da, aber der {w} wackelt noch.', 'Knapp. Atme tiefer, dann wird es stabil.', 'Ich höre Talent, aber noch zu wenig Kontrolle.'],
        no: ['Da hat die Technik heute nicht mitgespielt. Nein.', 'Zu viele Töne daneben, {n}. Üben, dann wieder kommen.', 'Ich sage Nein – aber mit einem Übungsplan.'],
        battle: ['{x} – die saubere Technik entscheidet.', 'Mein Punkt geht an {x}. Mehr Kontrolle.', '{x}. Die Stimme saß einfach besser.']
      } },
    { id: 'jule', name: 'Jule Winter', role: 'Die Social-Media-Queen', guest: true, need: 54, favs: ['pop'],
      look: { skin: 1, hair: 'dutt', hairColor: 3, outfit: 'glitzer', outfitColor: 4, acc: 'sonnenbrille' },
      w: { praesenz: 0.45, ausdruck: 0.3, entwicklung: 0.25 },
      lines: {
        top: ['Das geht viral, {n}! Ich habe schon drei Clips im Kopf.', 'Du bist ein Star für die Handykamera und für die Bühne.', 'Kommentarspalte: nur Herzen. Und meins ist dabei.'],
        yes: ['Du hast Ausstrahlung. Ja!', 'Dein {s} macht dich besonders. Zeig mehr davon.', 'Das Publikum mag dich – ich auch.'],
        close: ['Hübsch, aber noch nicht teilbar. Knapp.', 'Mir fehlte der Moment fürs Video, {n}.', 'Dein {w} war mir noch zu blass.'],
        no: ['Ich hätte weitergescrollt. Sorry, nein.', 'Da war keine Story drin.', 'Heute leider kein Like von mir.'],
        battle: ['{x}! Mehr Wow-Momente.', 'Ich nehme {x} – die Fans auch.', '{x}. Das war der Auftritt fürs Highlight-Video.']
      } },
    { id: 'tarik', name: 'Tarik Aydın', role: 'Der Beat-Bauer', guest: true, need: 58, favs: ['pop', 'rock'],
      look: { skin: 2, hair: 'undercut', hairColor: 0, outfit: 'hoodie', outfitColor: 2, acc: 'kopfhoerer', beard: 'vollbart' },
      w: { timing: 0.5, mut: 0.3, praesenz: 0.2 },
      lines: {
        top: ['Auf den Punkt, Bro! Jeder Einsatz im Raster, {n}.', 'Das war tighter als mein Metronom.', 'Ich will sofort einen Track mit dir bauen.'],
        yes: ['Gutes Timing, guter Vibe. Ja!', 'Dein {s} sitzt. {w} geht noch tighter.', 'Ich habe mitgenickt. Das heißt was.'],
        close: ['Ein paar Einsätze waren off. Knapp, {n}.', 'Der Groove war da, aber nicht durchgehend.', 'Dein {w} hat den Beat verloren.'],
        no: ['Das lief neben dem Beat. Nein.', 'Zu viele verpasste Einsätze, sorry.', 'Ich habe den Takt gesucht – du leider auch.'],
        battle: ['{x}, ganz klar. Tighter im Beat.', 'Mein Punkt: {x}. Bessere Einsätze.', '{x} hatte den Groove.']
      } },
    { id: 'greta', name: 'Greta Lind', role: 'Die Musical-Diva', guest: true, need: 60, favs: ['ballade'],
      look: { skin: 0, hair: 'locken', hairColor: 4, outfit: 'glitzer', outfitColor: 1, acc: 'ohrring' },
      w: { ausdruck: 0.4, stimme: 0.4, praesenz: 0.2 },
      lines: {
        top: ['Bravo, {n}! Das war großes Theater mit echter Stimme.', 'Ich habe Standing Ovations im Kopf gehört.', 'So singt man eine Geschichte. Wunderbar.'],
        yes: ['Ausdrucksstark und klar. Ja.', 'Dein {s} hat mich überzeugt, den {w} polieren wir.', 'Da war eine Figur, ein Gefühl, ein Bogen. Ja!'],
        close: ['Schön, aber noch nicht groß genug.', 'Mir fehlte der letzte Bogen, {n}.', 'Dein {w} hat die Geschichte gebremst.'],
        no: ['Da kam keine Geschichte bei mir an. Nein.', 'Zu flach, zu vorsichtig. Leider nein.', 'Der Vorhang fällt heute zu früh.'],
        battle: ['{x}. Das war die größere Geschichte.', 'Mein Applaus gilt {x}.', 'Ich wähle {x} – mehr Bühne, mehr Gefühl.']
      } }
  ];
  const MAIN_JURY = ['marc', 'lena', 'david'];

  const COACH = { id: 'sophie', name: 'Sophie', role: 'Vocal-Coach', img: 'img/jury-sophie.jpg',
    tips: ['Atme vor dem Einsatz, nicht mittendrin – dann sitzt der erste Ton.',
      'Marc achtet auf Timing und Stimme. Saubere Einsätze sind bei ihm Gold wert.',
      'Lena will Gefühl sehen. „Mit Gefühl“ und ein Moment mit dem Publikum helfen bei ihr.',
      'David liebt Mut und Entwicklung. Wenn du dich steigerst, merkt er das.',
      'Combo halten bringt Ausdruck – lieber sicher treffen als hektisch drücken.',
      'Show-Momente sind dein Draht zum Publikum: Sie bringen Bühnenpräsenz und Votes.',
      'Risiko lohnt sich nur, wenn du mindestens 70 % triffst. Sonst kostet es Punkte.',
      'Training hilft, ersetzt aber keinen guten Auftritt. Die Bühne entscheidet.',
      'Beim Gesangsteil zählt, wie lange du auf der Linie bleibst. Ruhige Bewegungen!',
      'Deine Fans wachsen mit guten Auftritten und Community-Aktionen – und Votes können dich retten.'] };

  // Showmaster (fiktionale Spielfigur nach RicoReWi). Avatar-Werte für avatar.js.
  const HOST = { id: 'rico', name: 'Rico', role: 'Showmaster',
    look: { skin: 1, hair: 'stachelig', hairColor: 1, beard: 'vollbart', outfit: 'tshirt', outfitColor: 1, acc: 'keine', piercing: 'beide', mic: true },
    intro: {
      casting: ['Herzlich willkommen bei SHOW ME YOUR VOICE! Ich bin Rico – und heute zählt nur eins: deine Stimme.',
        'Die Jury ist bereit, das Publikum ist laut. {n}, die Bühne gehört dir!'],
      recall: ['Recall! Nur die Top {x} ziehen in die Mottoshow. Performance, Jury und eure Votes entscheiden.'],
      motto: ['Mottoshow! Heute Abend: {motto}. Nur die Top {x} kommen ins Battle.'],
      battle: ['Battle-Zeit! Zwei Stimmen, eine Bühne. Die Jury entscheidet – und eure Votes können eine Person retten.'],
      halbfinale: ['Halbfinale! Vier Stimmen, drei Plätze im Finale. Eure Votes zählen heute besonders viel.'],
      finale: ['DAS FINALE! Das Konfetti ist geladen, die Lichter sind an. Wer gewinnt SHOW ME YOUR VOICE?']
    },
    golden: 'Moment! Ich habe noch etwas in der Tasche … das GOLDENE TICKET! {n}, du bist weiter!',
    advance: ['Du hast es geschafft, {n}! Wir sehen uns in der nächsten Runde.', 'Weiter geht’s! {n}, das Publikum will mehr von dir.', 'Applaus für {n} – du bist eine Runde weiter!'],
    out: ['Das war es leider für dich, {n}. Aber das ist nicht das Ende – sondern erst der Anfang.', 'Heute hat es nicht gereicht, {n}. Komm stärker zurück – wir glauben an dich.'],
    saved: 'Die Community hat gesprochen: Mit den meisten Votes der Battle-Verlierer bleibt {n} im Rennen!',
    winner: 'Der Sieg dieser Staffel geht an … {n}!!!',
    welcome: ['Schön, dass du da bist, {n}! Im Backstage bereitest du dich vor – Training, Community, und dann ab auf die Bühne.',
      'Kurzer Tipp vom Showmaster: Unter „Steuerung & Tutorial“ im Menü kannst du jederzeit üben.']
  };

  // Elf erfundene KI-Kandidaten. skill = Grundniveau, cons = Schwankung, crit = Stärken/Schwächen je Kriterium.
  const CANDIDATES = [
    { id: 'mira', name: 'Mira Sonnfeld', style: 'soul', skill: 72, cons: 6, fans: 55, bio: 'Kirchenchor, Soul-Stimme, große Nerven.',
      strong: 'Stimme', weak: 'Lampenfieber', crit: { stimme: 8, ausdruck: 4, mut: -6 }, rival: 'jaxx', friend: 'elif',
      look: { skin: 3, hair: 'locken', hairColor: 0, outfit: 'glitzer', outfitColor: 2, acc: 'ohrring' } },
    { id: 'jaxx', name: 'Jaxx Delmar', style: 'rock', skill: 69, cons: 10, fans: 62, bio: 'Garagenband-Frontmann. Alles oder nichts.',
      strong: 'Mut', weak: 'Konstanz', crit: { mut: 12, praesenz: 6, timing: -6 }, rival: 'mira', friend: 'benno',
      look: { skin: 0, hair: 'undercut', hairColor: 7, outfit: 'lederjacke', outfitColor: 5, acc: 'ohrring', piercing: 'ohr' } },
    { id: 'lio', name: 'Lio Kerner', style: 'pop', skill: 65, cons: 6, fans: 48, bio: 'Straßenmusiker mit Ohrwurm-Garantie.',
      strong: 'Timing', weak: 'Ausdruck', crit: { timing: 6, ausdruck: -5 }, rival: 'tamo', friend: 'nova',
      look: { skin: 1, hair: 'kurz', hairColor: 3, outfit: 'hoodie', outfitColor: 3, acc: 'kopfhoerer' } },
    { id: 'nova', name: 'Nova Brandt', style: 'pop', skill: 63, cons: 7, fans: 66, bio: 'Tänzerin, die jetzt singt. Publikumsmagnet.',
      strong: 'Bühnenpräsenz', weak: 'Stimme', crit: { praesenz: 10, stimme: -6 }, rival: 'clara', friend: 'lio',
      look: { skin: 2, hair: 'dutt', hairColor: 8, outfit: 'glitzer', outfitColor: 1, acc: 'keine' } },
    { id: 'tamo', name: 'Tamo Eke', style: 'soul', skill: 71, cons: 5, fans: 50, bio: 'R&B-Groove, Studio-Erfahrung, ruhig wie ein Metronom.',
      strong: 'Timing', weak: 'Mut', crit: { timing: 9, mut: -5 }, rival: 'lio', friend: 'ruben',
      look: { skin: 5, hair: 'buzz', hairColor: 0, outfit: 'sakko', outfitColor: 0, acc: 'brille' } },
    { id: 'elif', name: 'Elif Akar', style: 'ballade', skill: 67, cons: 8, fans: 44, bio: 'Leise Stimme, riesige Gefühle.',
      strong: 'Ausdruck', weak: 'Lampenfieber', crit: { ausdruck: 10, praesenz: -6 }, rival: 'nova', friend: 'mira',
      look: { skin: 2, hair: 'lang', hairColor: 0, outfit: 'tshirt', outfitColor: 6, acc: 'ohrring' } },
    { id: 'benno', name: 'Benno Wiese', style: 'rock', skill: 58, cons: 11, fans: 58, bio: 'Beatboxer und Rampensau. Unberechenbar.',
      strong: 'Mut', weak: 'Stimme', crit: { mut: 10, timing: 4, stimme: -8 }, rival: 'tamo', friend: 'jaxx',
      look: { skin: 1, hair: 'stachelig', hairColor: 4, outfit: 'hoodie', outfitColor: 4, acc: 'cap' } },
    { id: 'clara', name: 'Clara Fink', style: 'ballade', skill: 62, cons: 6, fans: 40, bio: 'Musical-Schule, jede Geste sitzt.',
      strong: 'Ausdruck', weak: 'Mut', crit: { ausdruck: 6, praesenz: 4, mut: -8 }, rival: 'nova', friend: 'yuki',
      look: { skin: 0, hair: 'lang', hairColor: 3, outfit: 'sakko', outfitColor: 2, acc: 'keine' } },
    { id: 'ruben', name: 'Ruben Holm', style: 'pop', skill: 55, cons: 7, fans: 74, bio: 'Schlager-Herz, Community-Liebling.',
      strong: 'Bühnenpräsenz', weak: 'Timing', crit: { praesenz: 8, timing: -7 }, rival: 'benno', friend: 'tamo',
      look: { skin: 1, hair: 'kurz', hairColor: 1, outfit: 'sakko', outfitColor: 4, acc: 'hut' } },
    { id: 'yuki', name: 'Yuki Arendt', style: 'ballade', skill: 60, cons: 7, fans: 38, bio: 'Indie-Songwriterin mit Gitarre und Geduld.',
      strong: 'Stimme', weak: 'Bühnenpräsenz', crit: { stimme: 6, praesenz: -7 }, rival: 'elif', friend: 'clara',
      look: { skin: 0, hair: 'kurz', hairColor: 6, outfit: 'hoodie', outfitColor: 0, acc: 'brille' } },
    { id: 'fenja', name: 'Fenja Lux', style: 'rock', skill: 57, cons: 8, fans: 46, bio: 'Folk-Rock vom Land, laut und herzlich.',
      strong: 'Mut', weak: 'Timing', crit: { mut: 7, timing: -5 }, rival: 'jaxx', friend: 'ruben',
      look: { skin: 2, hair: 'locken', hairColor: 4, outfit: 'lederjacke', outfitColor: 6, acc: 'hut' } }
  ];

  // Songs (eigene Titel, Musik wird live im Browser erzeugt)
  const STYLES = {
    ballade: { name: 'Ballade', bpm: 80, desc: 'Langsam und gefühlvoll – Lena liebt das.', fav: 'lena' },
    pop: { name: 'Pop', bpm: 108, desc: 'Eingängig und tanzbar – ein guter Allrounder.', fav: '' },
    soul: { name: 'Soul', bpm: 94, desc: 'Groovig und stimmstark – Marcs Lieblingsstil.', fav: 'marc' },
    rock: { name: 'Rock', bpm: 132, desc: 'Schnell und laut – David feiert Mut.', fav: 'david' }
  };
  const SONGS = {
    ballade: 'Lichter über der Stadt', pop: 'Herzschlag-Sommer', soul: 'Goldene Stunde', rock: 'Laut wie wir'
  };
  const MOTTOS = [
    { id: 'retro', name: 'Best of 80er & 90er', songs: { pop: 'Neonnacht 1989', ballade: 'Kassettenliebe', rock: 'Rave im Kopf', soul: 'Walkman-Soul' } },
    { id: 'iconic', name: 'Iconic Hits', songs: { pop: 'Kronen aus Konfetti', ballade: 'Für immer Refrain', rock: 'Stadionlicht', soul: 'Samtstimme' } },
    { id: 'herz', name: 'Herzensmomente', songs: { pop: 'Sag es laut', ballade: 'Ein Brief an mich', rock: 'Narben aus Gold', soul: 'Zuhause in dir' } }
  ];

  const APPROACH = {
    sicher: { name: 'Sicher', desc: 'Weniger Noten, leichter zu treffen – Wertung ×0,95, wenig Mut.', density: 0.55, mut: 30, ausdruck: -6 },
    gefuehl: { name: 'Mit Gefühl', desc: 'Normale Notendichte, +10 Ausdruck.', density: 0.75, mut: 55, ausdruck: 10 },
    risiko: { name: 'Volles Risiko', desc: 'Viele Noten. Ab 70 % Treffern Wertung ×1,08, darunter ×0,94. Viel Mut.', density: 1.0, mut: 85, ausdruck: 4 }
  };
  const ACTION = {
    publikum: { name: 'Publikum einbeziehen', desc: '3 Show-Momente statt 2, +6 Bühnenpräsenz, +4 Votes.', shows: 3, praesenz: 6, mut: 5, votes: 4 },
    fokus: { name: 'Ganz bei mir', desc: 'Nur 1 Show-Moment, volle Konzentration: +4 Timing.', shows: 1, praesenz: -4, mut: 0, timing: 4 },
    gross: { name: 'Großer Auftritt', desc: 'Lichtshow und Pyro: +10 Bühnenpräsenz, +12 Mut – aber die Show-Momente kommen schneller.', shows: 2, praesenz: 10, mut: 12, fast: true }
  };

  // Staffelablauf (eigene Struktur nach dem Vorbild der echten Staffeln: Casting, Recall, Mottoshow, Halbfinale, Finale)
  const ROUNDS = [
    { id: 'casting', name: 'Casting', icon: '🎤', parts: ['rhythm'], len: 30, rule: 'Weiter mit mindestens 2 von 3 Jury-Ja. Rico hat ein Goldenes Ticket.', bg: 'stage' },
    { id: 'recall', name: 'Gruppen-Recall', icon: '🔁', parts: ['rhythm', 'group', 'pitch'], len: 20, topX: 8, w: { perf: 0.5, jury: 0.3, votes: 0.2 }, rule: 'Du singst in einer Dreiergruppe, bewertet wird jede Stimme einzeln. Top 8 nach Gesamtwertung ziehen in die Mottoshow.', bg: 'arena' },
    { id: 'motto', name: 'Mottoshow', icon: '🎭', parts: ['rhythm'], len: 32, topX: 6, w: { perf: 0.5, jury: 0.3, votes: 0.2 }, rule: 'Top 6 nach Gesamtwertung kommen ins Battle.', bg: 'stage' },
    { id: 'battle', name: 'Battle', icon: '⚔️', parts: ['rhythm', 'rival', 'rhythm'], len: 16, battle: true, w: { perf: 0.5, jury: 0.3, votes: 0.2 }, rule: 'Jury-Mehrheit gewinnt das Duell. Der Verlierer mit den meisten Votes wird gerettet.', bg: 'chairs' },
    { id: 'halbfinale', name: 'Halbfinale', icon: '⭐', parts: ['pitch', 'rhythm'], len: 24, topX: 3, w: { perf: 0.45, jury: 0.25, votes: 0.3 }, rule: 'Top 3 nach Gesamtwertung erreichen das Finale (Votes zählen 30 %).', bg: 'arena' },
    { id: 'finale', name: 'Finale', icon: '👑', parts: ['rhythm', 'pitch', 'rhythm'], len: 22, final: true, w: { perf: 0.4, jury: 0.3, votes: 0.3 }, rule: 'Platz 1 bis 3 nach Gesamtwertung: Performance 40 %, Jury 30 %, Votes 30 %.', bg: 'stage' }
  ];

  const COMMUNITY = [
    { id: 'live', name: 'Fan-Livestream', icon: '📱', desc: '+8 Fans, kostet 1 Trainingseinheit dieser Runde.', fans: 8, train: -1 },
    { id: 'video', name: 'Backstage-Video posten', icon: '🎬', desc: '+5 Fans.', fans: 5 },
    { id: 'duett', name: 'Spontan-Duett im Flur', icon: '🎶', desc: '+3 Fans und dauerhaft +3 Ausdruck.', fans: 3, attr: { ausdruck: 3 } }
  ];

  const TRAINING = [
    { id: 'rhythm', name: 'Rhythmus-Training', icon: '🥁', attr: 'timing', desc: 'Beats treffen, Combo aufbauen. Verbessert Timing.' },
    { id: 'cues', name: 'Bühnenpräsenz', icon: '🙌', attr: 'praesenz', desc: 'Reagiere blitzschnell auf Publikums-Signale. Verbessert Bühnenpräsenz.' },
    { id: 'pitch', name: 'Ton-Training', icon: '🎵', attr: 'stimme', desc: 'Halte die Melodielinie – mit Tasten, Touch oder Mikrofon. Verbessert Stimme.' }
  ];

  const ACHIEVEMENTS = [
    { id: 'talent', icon: 4, name: 'Talent', desc: 'Das erste Casting bestanden.' },
    { id: 'stimme', icon: 5, name: 'Starke Stimme', desc: 'Im Gesangsteil 90 % auf der Linie.' },
    { id: 'durchhalter', icon: 6, name: 'Durchhalter', desc: 'Das Finale erreicht.' },
    { id: 'herz', icon: 7, name: 'Herz der Community', desc: 'In einer Runde die meisten Votes geholt.' },
    { id: 'krone', icon: 8, name: 'Top 6', desc: 'Die Mottoshow überstanden.' },
    { id: 'sieger', icon: 9, name: 'Sieger', desc: 'Eine Staffel gewonnen.' }
  ];

  // Show-Archiv: echte Folgen von smyv.ricorewi.de (YouTube)
  const ARCHIVE = [
    { id: 'staffel-2', title: 'Staffel 2', sub: 'Die Show geht weiter · 1.–7. Juni 2026', playlist: 'PLOTyQR2JWZQ0NtdGtM_cNmL7aD_cdIDTv',
      winners: ['Carina', 'MAX.X.X', 'GIZMO'], top4: 'Top 4: Max.x.x, GIZMO, Carina, Lord Tiger',
      eps: [['Casting 1 – Alle Kandidaten, Goldene Tickets & Entscheidungen', 'lLvk-xvvDbw'], ['Casting 2 – Wer schafft den Recall?', '2Nmls-GiXls'],
        ['Recall – Wer schafft den Einzug in die Mottoshow?', 'HycW7hUBp_Y'], ['Mottoshow 1 – Best of 80er & 90er', 'WpylUh39YP8'], ['Halbfinale – Iconic Hits & Top 6', 'NVj_S6ocSUc']] },
    { id: 'staffel-1', title: 'Staffel 1', sub: 'Hier begann alles · TikTok LIVE', winners: ['Becca', 'Eleven', 'Bommelchen'],
      eps: [['Folge 1 · Casting', 'kOAoSGu_76Y'], ['Folge 2 · Casting', 'ZuGQudq_owk'], ['Folge 3 · Recall', 'E7grV4u112s'], ['Folge 4 · Mottoshow', 'cxHCreutw_c'],
        ['Folge 5 · Halbfinale', 'eO3hHL3sfh0'], ['Folge 6 · Best of Exit', 'oMPvX3TwaVA']] },
    { id: 'christmas', title: 'Christmas Edition', sub: 'Staffel 1.1 · Weihnachtsspecial', winners: ['Carina Brinkhaus', 'Sandy'],
      eps: [['Casting 1', 'F2qbwwtziPo'], ['Casting 2', 'hQDdPztUd1o'], ['Recall', 'SHQnuK6uZqY'], ['Skandalshow', 'CGnlHUTu9rY'], ['Halbfinale', 'Ad695aVsW6o'], ['Finale', 'SYoR6OCd76M']] },
    { id: 'bonus', title: 'Backstage & Bonus', sub: 'Bonusmaterial aus Staffel 1', winners: [],
      eps: [['Bonus 1', 'z7jZwz7Bd8s'], ['Bonus 2', 'JnzIc9sA-HU'], ['Bonus 3', 'to1FzOK5t7Q'], ['Bonus 4', '7bFz4v_pUDk'], ['Bonus 5', 'job4TqJEpr8'], ['Bonus 6', 'tEfU_io9N0s'], ['Nach der Show – Aussprache', 'xaCurUs_LTM']] }
  ];


  // Musikquellen: die RicoReWi-Sender auf laut.fm (dieselbe Liste wie in den anderen easygames-Spielen).
  // Im Auftritt erkennt das Spiel die Beats im laufenden Programm und erzeugt daraus die Noten. Quelle und Titel werden angezeigt.
  const STATIONS = [
    { slug: 'ricorewi', name: 'RicoReWi Radio', style: 'pop', desc: 'Der Hauptsender – bunt gemischt' },
    { slug: 'chartradio24', name: 'Chartradio 24', style: 'pop', desc: 'Aktuelle Hits' },
    { slug: 'rockradio24', name: 'Rockradio 24', style: 'rock', desc: 'Gitarren und Gas' },
    { slug: 'schlagerpop24', name: 'Schlagerpop 24', style: 'ballade', desc: 'Schlager und Gefühl' },
    { slug: 'rapradio24', name: 'Rapradio 24', style: 'soul', desc: 'Rap, R&B und Groove' },
    { slug: 'clubradio24', name: 'Clubradio 24', style: 'pop', desc: 'Dance und Club' },
    { slug: 'kultradio24', name: 'Kultradio 24', style: 'pop', desc: 'Kult-Hits der 80er und 90er' },
    { slug: 'yourtime-fm', name: 'YourTime-FM', style: 'pop', desc: 'Musik für jede Zeit' },
    { slug: 'anmacha24', name: 'AnMaCha 24', style: 'pop', desc: 'Das AnMaCha-Programm' },
    { slug: 'christmasradio24', name: 'Christmasradio 24', style: 'winter', desc: 'Weihnachtsmusik (Winterglanz-Gala)' }
  ];

  // Jury-Gespräch vor dem Auftritt (Casting und Freies Casting). s = Sympathie je Juror (fließt sichtbar in dessen Wertung), v = Votes
  const INTERVIEW = [
    { q: 'Marc: „Erzähl kurz – wer steht da vor uns?“', a: [
      ['„Ich bin {n}, und Musik ist mein Leben.“', { lena: 1, marc: 1 }],
      ['„Ich bin der nächste Superstar, merkt euch den Namen!“', { david: 2, marc: -1 }],
      ['„Ehrlich? Ich bin total nervös …“', { lena: 2, david: -1 }]] },
    { q: 'Lena: „Was bedeutet dir dieser Auftritt?“', a: [
      ['„Ich singe für meine Familie, die heute zuschaut.“', { lena: 2 }],
      ['„Ich will zeigen, dass ich mich weiterentwickelt habe.“', { david: 1, marc: 1 }],
      ['„Spaß! Ich will einfach die Bühne rocken.“', { david: 2, lena: -1 }]] },
    { q: 'David: „Warum sollten wir gerade dich nehmen?“', a: [
      ['„Weil ich hart arbeite und jede Kritik annehme.“', { marc: 2 }],
      ['„Weil ich anders bin als alle anderen hier.“', { david: 2 }],
      ['„Das entscheidet ihr – ich lasse meine Stimme sprechen.“', { marc: 1, lena: 1 }]] }
  ];
  // Ricos Interview vor späteren Runden: wirkt auf Votes oder Jury-Sympathie
  const HOST_Q = [
    { q: 'Rico: „Was willst du deinen Fans vor dem Auftritt sagen?“', a: [
      ['„Danke für jeden Vote – ihr seid der Wahnsinn!“', {}, 5], ['„Heute zeige ich euch eine ganz neue Seite.“', { david: 1 }, 2], ['„Ich gebe alles – für euch und für mich.“', { lena: 1 }, 3]] },
    { q: 'Rico: „Die Konkurrenz ist stark. Wie gehst du damit um?“', a: [
      ['„Ich konzentriere mich nur auf mich.“', { marc: 2 }, 0], ['„Konkurrenz spornt mich an!“', { david: 2 }, 1], ['„Wir sind hier eine Familie.“', { lena: 1 }, 3]] },
    { q: 'Rico: „Was war dein bisher schönster Moment in der Staffel?“', a: [
      ['„Die erste Ja-Stimme. Gänsehaut!“', { lena: 1 }, 2], ['„Jede Probe mit Sophie.“', { marc: 1 }, 1], ['„Die Fans, die mir schreiben.“', {}, 4]] }
  ];

  // Backstage-Drama: einmal pro Runde ab dem Recall. Effekte gelten für die nächste Runde (Sympathie, Kriterien) oder dauerhaft (Fans, Werte).
  const EVENTS = [
    { id: 'heiser', icon: '🤒', title: 'Heiserkeit!', text: 'Deine Stimme kratzt nach der langen Probe.',
      a: [{ t: 'Kräutertee und schonen', d: '–1 Training in dieser Runde, keine Nachteile', train: -1 }, { t: 'Durchziehen', d: 'Stimme –6 im nächsten Auftritt', crit: { stimme: -6 } }] },
    { id: 'laester', icon: '🗯️', title: 'Lästerei im Backstage', text: '{rival} lästert vor laufender Kamera über deinen letzten Auftritt.',
      a: [{ t: 'Souverän ignorieren', d: 'Lena +2 Sympathie', symp: { lena: 2 } }, { t: 'Vor der Kamera kontern', d: '+6 Fans, Marc –2 Sympathie', fans: 6, symp: { marc: -2 } }] },
    { id: 'plakat', icon: '🪧', title: 'Fan-Plakat!', text: 'Im Publikum hält jemand ein riesiges Plakat mit deinem Namen hoch.',
      a: [{ t: 'Selfie mit den Fans', d: '+4 Fans', fans: 4 }, { t: 'Fokus auf den Auftritt', d: '+1 Training in dieser Runde', train: 1 }] },
    { id: 'fieber', icon: '😰', title: 'Lampenfieber', text: 'Die Hände zittern, das Herz rast.',
      a: [{ t: 'Atemübung mit Sophie', d: '–1 Training in dieser Runde, dafür Ausdruck +4 im Auftritt', train: -1, crit: { ausdruck: 4 } }, { t: 'Augen zu und durch', d: 'Mut +6, aber Timing –4 im Auftritt', crit: { mut: 6, timing: -4 } }] },
    { id: 'duett', icon: '🎶', title: 'Duett-Angebot', text: '{friend} fragt, ob ihr zusammen für Social Media singt.',
      a: [{ t: 'Klar, gerne!', d: '+3 Fans, Ausdruck dauerhaft +2', fans: 3, attr: { ausdruck: 2 } }, { t: 'Lieber proben', d: 'Timing dauerhaft +2', attr: { timing: 2 } }] },
    { id: 'interview', icon: '📺', title: 'Kamera-Interview', text: 'Das Backstage-Team will wissen, wie es dir geht.',
      a: [{ t: 'Emotional erzählen', d: 'Lena +2 Sympathie, +2 Fans', symp: { lena: 2 }, fans: 2 }, { t: 'Selbstbewusst auftreten', d: 'David +2 Sympathie', symp: { david: 2 } }] }
  ];

  const DATA = { MAIN_JURY, STATIONS, INTERVIEW, HOST_Q, EVENTS, CRIT, JURY, COACH, HOST, CANDIDATES, STYLES, SONGS, MOTTOS, APPROACH, ACTION, ROUNDS, COMMUNITY, TRAINING, ACHIEVEMENTS, ARCHIVE };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA; else root.SMYV_DATA = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
