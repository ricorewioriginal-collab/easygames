import type { StoryDef } from './types';

// Verzweigte Lebensgeschichten. Ziele zählen Ereignisse des Spiel-Ereignisbusses (siehe GoalKind in types.ts).

export const STORIES: StoryDef[] = [
  // ======================================================================
  {
    id: 'story-traumhaus',
    title: 'Vom alten Elternhaus zum Traumhaus',
    summary:
      'Familie Sonnberg hat ein Haus geerbt, das mehr Macken als Zimmer hat. Repariere, baue, richte ein und mach aus der Baustelle am Ahornweg ein Zuhause, auf das alle stolz sind.',
    icon: '🏡',
    mentor: 'npc-bruno-kaczmarek',
    start: 'sh-2',
    startFunds: 9000,
    household: 'hh-sonnberg',
    firstQuest: 'th-macken',
    quests: [
      {
        id: 'th-macken',
        title: 'Ein Haus voller Macken',
        intro:
          'Moin! Ich bin Bruno von der Hafenwerkstatt. Dein Wasserhahn tropft im Takt von einem schlechten Schlager und die Spülmaschine klingt wie ein Kutter bei Sturm. Schnapp dir Werkzeug – ich zeig dir, wo man draufhaut. Und wo lieber nicht.',
        goals: [
          { kind: 'interaction', id: 'repair', n: 3, label: 'Repariere 3 kaputte Geräte' },
          { kind: 'interaction', id: 'clean', n: 2, label: 'Räume 2-mal gründlich auf' },
        ],
        reward: { money: 500, moodlet: 'homeproud', memory: 'Die ersten Macken im Elternhaus sind repariert.' },
        outro:
          'Na bitte, der Hahn schweigt und die Spülmaschine schnurrt. Du hast goldene Hände – leicht ölverschmiert, aber golden. Als Nächstes brauchst du eine Küche, in der man mehr als Toast machen kann.',
        next: 'th-kueche',
      },
      {
        id: 'th-kueche',
        title: 'Herzstück Küche',
        intro:
          'Eine Familie ohne ordentliche Küche ist wie ein Boot ohne Ruder: Man dreht sich im Kreis und alle sind hungrig. Kauf dir ein paar anständige Küchengeräte und koch was Leckeres. Bonuspunkte, wenn nichts brennt.',
        goals: [
          { kind: 'buyObject', id: 'cat:kitchen', n: 3, label: 'Kaufe 3 Küchenobjekte' },
          { kind: 'interaction', id: 'cook', n: 3, label: 'Koche 3 Mahlzeiten' },
        ],
        reward: { money: 400, item: 'groceries', moodlet: 'bestmeal' },
        outro:
          'Es duftet nach Zuhause! Pia hat sogar freiwillig Gemüse gegessen – das ist offiziell ein Wunder. Jetzt wird es Zeit, dass dich der Ahornweg kennenlernt.',
        next: 'th-nachbarn',
      },
      {
        id: 'th-nachbarn',
        title: 'Hallo, Ahornweg!',
        intro:
          'In Sonnenhain wird hinter jedem Gartenzaun geredet – also red am besten selber mit. Stell dich den Nachbar:innen vor, plaudere ein bisschen und finde heraus, wer dir die Leiter leiht. Tipp: Mehmet im Park hat immer Zeit. Viel Zeit.',
        goals: [
          { kind: 'meet', n: 5, label: 'Lerne 5 Leute kennen' },
          { kind: 'social', id: 'chat', n: 5, label: 'Plaudere 5-mal mit anderen' },
        ],
        reward: { money: 300, moodlet: 'newfriend', item: 'cake' },
        outro:
          'Siehst du, schon kennt dich die halbe Straße – und die andere Hälfte hat von dir gehört. Mit so vielen Leuten im Haus wird es aber eng. Zeit für mehr Platz!',
        next: 'th-anbau',
      },
      {
        id: 'th-anbau',
        title: 'Mehr Platz für alle',
        intro:
          'Mats will ein eigenes Zimmer, Pia will ein Zimmer für Bolle und Bolle will einfach nur das Sofa. Zieh ein paar Wände hoch und schaff richtige Räume. Und denk dran: Erst messen, dann mauern, dann jubeln.',
        goals: [
          { kind: 'buildWalls', n: 12, label: 'Baue 12 Wandsegmente' },
          { kind: 'buildRoom', n: 4, label: 'Habe 4 geschlossene Räume' },
        ],
        reward: { money: 800, moodlet: 'proud' },
        outro:
          'Respekt, das steht wie eine Eins! Und jetzt die große Frage, die jede Familie spaltet: Wird der Keller eine Werkstatt – oder verwandelst du den Garten in ein Gemüseparadies?',
        branch: [
          { label: 'Werkstatt im Keller einrichten', next: 'th-werkstatt' },
          { label: 'Einen Gemüsegarten anlegen', next: 'th-garten' },
        ],
      },
      {
        id: 'th-werkstatt',
        title: 'Werkstatt im Keller',
        intro:
          'Eine Werkstatt! Du hast gerade mein Herz erobert. Bau dir eine Werkbank auf, tüftel was zusammen und werd richtig geschickt. Mats hat übrigens schon angekündigt, einen Roboter zu bauen, der den Abwasch macht. Wir werden sehen.',
        goals: [
          { kind: 'skill', id: 'handiness', n: 4, label: 'Erreiche Handwerk Stufe 4' },
          { kind: 'interaction', id: 'tinker', n: 3, label: 'Tüftle 3-mal an der Werkbank' },
        ],
        reward: { money: 700, moodlet: 'skillup', item: 'key' },
        outro:
          'Der Roboter macht keinen Abwasch, aber er kann winken. Ein Anfang! Mit der Werkstatt kannst du jetzt alles selbst reparieren – und das steigert den Wert vom Haus enorm.',
        next: 'th-wert',
      },
      {
        id: 'th-garten',
        title: 'Gemüsegarten',
        intro:
          'Ein Gemüsegarten – sehr gute Wahl, Ruth vom Gemeinschaftsgarten wird dich lieben. Leg Beete an, gieß fleißig und ernte, was die Erde hergibt. Pia hat schon angekündigt, eine Möhre namens Günther großzuziehen.',
        goals: [
          { kind: 'skill', id: 'gardening', n: 4, label: 'Erreiche Gärtnern Stufe 4' },
          { kind: 'interaction', id: 'gardenHarvest', n: 5, label: 'Ernte 5-mal im Garten' },
        ],
        reward: { money: 700, moodlet: 'harvest', item: 'herbs' },
        outro:
          'Günther ist prächtig geworden – Pia weigert sich allerdings, ihn zu essen. Dein Garten ist jetzt der grünste am Ahornweg, und so was treibt den Hauswert nach oben.',
        next: 'th-wert',
      },
      {
        id: 'th-wert',
        title: 'Ein Haus mit Wert',
        intro:
          'Jetzt kommt der Feinschliff. Dekoration, gemütliche Möbel, ein bisschen Glanz – das macht aus einem Haus ein Schmuckstück. Wenn der Hauswert stimmt, schmeißen wir ein Fest, von dem der ganze Ahornweg redet.',
        goals: [
          { kind: 'buyObject', id: 'cat:deco', n: 5, label: 'Kaufe 5 Dekorationen' },
          { kind: 'homeValue', n: 60000, label: 'Steigere den Hauswert auf 60.000 §' },
        ],
        reward: { money: 1000, moodlet: 'homeproud' },
        outro:
          'Ich hab schon viele Häuser gesehen, aber das hier ... da krieg ich glatt Pipi in den Augen. Sag ich niemandem. Jetzt lad alle ein – es ist Zeit für das große Gartenfest!',
        next: 'th-fest',
      },
      {
        id: 'th-fest',
        title: 'Das große Gartenfest',
        intro:
          'Wirf den Grill an, häng Lichterketten auf und lad alle ein, die dir unterwegs geholfen haben. Heute wird gefeiert, getanzt und mindestens einmal über Brunos Witze gelacht. Das ist Pflicht.',
        goals: [
          { kind: 'interaction', id: 'grill', n: 3, label: 'Grille 3-mal für deine Gäste' },
          { kind: 'friend', n: 4, label: 'Habe 4 Freundschaften' },
          { kind: 'social', id: 'danceTogether', n: 2, label: 'Tanze 2-mal mit Gästen' },
        ],
        reward: { money: 2000, moodlet: 'partyfun', memory: 'Das große Gartenfest am Ahornweg – aus dem alten Elternhaus ist ein Traumhaus geworden.' },
        outro:
          'Schau dich um: lachende Nachbar:innen, ein glücklicher Hund und ein Haus, das endlich wieder lebt. Deine Eltern wären stolz. Und ich? Ich nehm noch ein Würstchen. Danke, dass ich dabei sein durfte!',
      },
    ],
  },
  // ======================================================================
  {
    id: 'story-hafen',
    title: 'Neuanfang im Hafenviertel',
    summary:
      'Neue Stadt, neues Loft, neues Leben: Komm im Hafenviertel an, finde Arbeit, Freund:innen und deinen Stammplatz im Café Möwe – und entscheide, ob dein Herz für die Liebe oder die Karriere schlägt.',
    icon: '⚓',
    mentor: 'npc-marlene-voss',
    start: 'hv-2',
    startFunds: 5000,
    household: '',
    firstQuest: 'hf-ankommen',
    quests: [
      {
        id: 'hf-ankommen',
        title: 'Moin, Hafenviertel!',
        intro:
          'Na, du bist doch die neue Person aus dem Kaiweg 14! Ich bin Marlene vom Café Möwe. Erstmal die wichtigsten Regeln: Die Möwen klauen Pommes, Wilhelm erzählt Seemannsgarn, und am Pier ist der schönste Sonnenuntergang der Stadt. Geh gucken – und sag ein paar Leuten Hallo!',
        goals: [
          { kind: 'visitLot', id: 'hv-pier', n: 1, label: 'Besuche die Hafenpromenade' },
          { kind: 'meet', n: 3, label: 'Lerne 3 Leute kennen' },
        ],
        reward: { money: 200, moodlet: 'movedin' },
        outro:
          'Siehst du, die Promenade beißt nicht – nur die Möwen. Aber vom Sonnenuntergang allein wird die Miete nicht bezahlt. Zeit, dass du dir einen Job suchst!',
        next: 'hf-job',
      },
      {
        id: 'hf-job',
        title: 'Anheuern',
        intro:
          'In Lindenhafen sucht immer jemand Hilfe: der Radiosender, die Werkstatt, das Kaufhaus – sogar ich, wenn Tuan wieder Milchschaum-Kunst übt statt Tassen zu spülen. Such dir was Schönes aus und geh ein paar Mal zur Arbeit.',
        goals: [
          { kind: 'career', n: 1, label: 'Finde einen Job' },
          { kind: 'work', n: 3, label: 'Arbeite 3 Schichten' },
        ],
        reward: { money: 500, moodlet: 'goodday' },
        outro:
          'Gehaltszettel, Feierabend und dieser kleine Stolz im Bauch – herzlich willkommen im Arbeitsleben am Hafen! Und weißt du, wohin man nach Feierabend geht? Genau. Zu mir.',
        next: 'hf-stammgast',
      },
      {
        id: 'hf-stammgast',
        title: 'Stammgast im Café Möwe',
        intro:
          'Stammgast wird man nicht über Nacht – man muss sich hochtrinken. Kaffee, natürlich! Komm vorbei, trink ein paar Tassen und erzähl mir, wie es läuft. Ich hab eine Torte probiert, die braucht dringend eine ehrliche Meinung.',
        goals: [
          { kind: 'visitLot', id: 'hv-cafe', n: 1, label: 'Besuche das Café Möwe' },
          { kind: 'interaction', id: 'drinkCoffee', n: 5, label: 'Trink 5 Kaffee' },
          { kind: 'friendWith', id: 'npc-marlene-voss', n: 30, label: 'Freunde dich mit Marlene an' },
        ],
        reward: { money: 300, item: 'cake', moodlet: 'goodchat' },
        outro:
          'Ab heute hast du deinen eigenen Becher an der Wand – mit Möwe drauf, wie sich das gehört. Aber eine Stammkneipe allein macht noch keine Heimat. Du brauchst Freund:innen!',
        next: 'hf-freunde',
      },
      {
        id: 'hf-freunde',
        title: 'Leute vom Kai',
        intro:
          'Hier am Hafen hält man zusammen – bei Sturm, bei Flaute und beim Karaoke in der Bar Leuchtfeuer. Mach ein paar Witze, hör zu und schließ echte Freundschaften. Deniz vom Radio lacht übrigens über alles. Fang da an.',
        goals: [
          { kind: 'social', id: 'joke', n: 5, label: 'Erzähle 5 Witze' },
          { kind: 'friend', n: 3, label: 'Habe 3 Freundschaften' },
        ],
        reward: { money: 400, moodlet: 'newfriend' },
        outro:
          'Drei Freund:innen in so kurzer Zeit – du bist offiziell ein Kai-Kind! Wilhelm meinte übrigens, du hättest „Fischerhände“. Ob das ein Kompliment war? Finde es am Pier heraus.',
        next: 'hf-angeln',
      },
      {
        id: 'hf-angeln',
        title: 'Petri Heil am Pier',
        intro:
          'Wer am Hafen lebt, muss angeln können. Das steht nirgendwo, ist aber trotzdem Gesetz. Schnapp dir eine Rute, setz dich zu Wilhelm und Birgit – und halt dich aus ihrem Wettstreit raus, wenn dir dein Leben lieb ist.',
        goals: [
          { kind: 'interaction', id: 'fish', n: 5, label: 'Angle 5-mal am Pier' },
          { kind: 'skill', id: 'fishing', n: 3, label: 'Erreiche Angeln Stufe 3' },
        ],
        reward: { money: 500, moodlet: 'bigcatch', item: 'fish_big' },
        outro:
          'Ein Hafenhecht! Wilhelm behauptet, früher wären sie größer gewesen – aber er hat ganz schön geguckt. Und jetzt, wo du hier angekommen bist: Wonach sehnt sich dein Herz – nach Liebe oder nach der großen Karriere?',
        branch: [
          { label: 'Der Liebe eine Chance geben', next: 'hf-liebe' },
          { label: 'Voll auf die Karriere setzen', next: 'hf-karriere' },
        ],
      },
      {
        id: 'hf-liebe',
        title: 'Herzklopfen an der Promenade',
        intro:
          'Oh, ich hab es gewusst! Ich sehe doch, wie du manchmal aus dem Fenster schaust, wenn jemand Bestimmtes vorbeigeht. Trau dich: Lade jemanden auf ein Date ein. Mein Tipp: Sonnenuntergang am Pier und keine Fischbrötchen mit Zwiebeln.',
        goals: [
          { kind: 'romance', n: 40, label: 'Baue eine romantische Beziehung auf' },
          { kind: 'social', id: 'askOut', n: 1, label: 'Lade jemanden zu einem Date ein' },
        ],
        reward: { money: 300, moodlet: 'inlove', item: 'flowers' },
        outro:
          'Ihr zwei seid ja zum Dahinschmelzen – ich musste glatt eine Extraportion Sahne essen. Und jetzt kommt das Beste: Das Hafenfest steht vor der Tür, und ihr seid natürlich dabei!',
        next: 'hf-fest',
      },
      {
        id: 'hf-karriere',
        title: 'Volle Kraft voraus',
        intro:
          'Karriere! Respekt. Dann gib Gas – aber vergiss nicht, ab und zu bei mir einen Kaffee zu trinken, sonst wirst du grummelig wie Oskar von der Galerie. Arbeite hart, sammel Erfahrung und lass dich befördern.',
        goals: [
          { kind: 'career', n: 3, label: 'Erreiche Karrierestufe 3' },
          { kind: 'earn', n: 3000, label: 'Verdiene 3.000 §' },
        ],
        reward: { money: 1000, moodlet: 'promoted', item: 'watch' },
        outro:
          'Stufe drei – und das in Rekordzeit! Ingrid aus dem Rathaus hat schon nach dir gefragt. Gönn dir eine Pause: Das Hafenfest steht vor der Tür, und du hast es dir mehr als verdient.',
        next: 'hf-fest',
      },
      {
        id: 'hf-fest',
        title: 'Das Hafenfest',
        intro:
          'Lampions, Livemusik und der berühmte Fischbrötchen-Wettessen-Wettbewerb: Das Hafenfest ist der schönste Abend des Jahres! Tanz mit deinen Freund:innen, feier mit der ganzen Promenade und zeig, dass du jetzt wirklich dazugehörst.',
        goals: [
          { kind: 'interaction', id: 'dance', n: 2, label: 'Tanze 2-mal' },
          { kind: 'friend', n: 4, label: 'Habe 4 Freundschaften' },
          { kind: 'money', n: 10000, label: 'Habe 10.000 § auf dem Konto' },
        ],
        reward: { money: 1500, moodlet: 'festival', memory: 'Mein erstes Hafenfest – Lindenhafen ist jetzt mein Zuhause.' },
        outro:
          'Weißt du noch, wie du hier mit einem Koffer und großen Augen angekommen bist? Jetzt hast du Freund:innen, einen Stammplatz und einen Lieblingssonnenuntergang. Willkommen zu Hause, Kai-Kind. Der nächste Kaffee geht auf mich!',
      },
    ],
  },
  // ======================================================================
  {
    id: 'story-radio',
    title: 'Auf Sendung: Aufstieg bei Radio Lindenwelle',
    summary:
      'Vom Kaffeekochen im Studio bis ans große Mikro: Starte bei Radio Lindenwelle, trainiere Stimme und Schreibkunst, finde deinen eigenen Stil in Musik oder Nachrichten – und werde zur Stimme von Lindenhafen.',
    icon: '📻',
    mentor: 'npc-vivien-hartmann',
    start: 'as-2',
    startFunds: 7000,
    household: '',
    firstQuest: 'rd-bewerbung',
    quests: [
      {
        id: 'rd-bewerbung',
        title: 'Der erste Tag im Studio',
        intro:
          'Hallo und herzlich willkommen bei Radio Lindenwelle – dem Sender mit der schönsten Aussicht und der wackeligsten Kaffeemaschine! Ich bin Vivien, die Chefin. Bewirb dich bei uns und übe schon mal vor dem Spiegel. Glaub mir: Dein Spiegelbild ist ein ehrlicheres Publikum als jede Möwe.',
        goals: [
          { kind: 'career', id: 'medien', n: 1, label: 'Starte bei Radio Lindenwelle' },
          { kind: 'interaction', id: 'mirrorPractice', n: 3, label: 'Übe 3-mal vor dem Spiegel' },
        ],
        reward: { money: 300, moodlet: 'proud' },
        outro:
          'Willkommen an Bord! Dein Platz ist der mit dem Kaffeefleck – Tradition. Und jetzt lern das Team kennen: Ohne Deniz, Lukas und Thi Mai läuft hier gar nichts.',
        next: 'rd-team',
      },
      {
        id: 'rd-team',
        title: 'Das Team der Lindenwelle',
        intro:
          'Radio ist Teamsport! Deniz weckt die Stadt, Lukas rettet die Technik und Thi Mai prüft jede Nachricht dreimal. Plaudere über gemeinsame Interessen und freunde dich mit Deniz an – die Morgenshow sucht nämlich Verstärkung.',
        goals: [
          { kind: 'friendWith', id: 'npc-deniz-arslan', n: 30, label: 'Freunde dich mit Deniz an' },
          { kind: 'social', id: 'shareInterest', n: 3, label: 'Tausche dich 3-mal über Interessen aus' },
        ],
        reward: { money: 400, moodlet: 'newfriend' },
        outro:
          'Deniz hat mir gerade erzählt, dass du über die Ampel-Witze gelacht hast. Damit bist du offiziell Teil der Familie. Jetzt arbeiten wir an deiner Stimme und deinen Texten!',
        next: 'rd-stimme',
      },
      {
        id: 'rd-stimme',
        title: 'Stimme & Feder',
        intro:
          'Gutes Radio braucht zwei Dinge: eine Stimme, der man gern zuhört, und Texte, die man nicht vergisst. Trainiere dein Charisma und schreib, schreib, schreib. Und nein, „Äh“ zählt nicht als Überleitung.',
        goals: [
          { kind: 'skill', id: 'charisma', n: 4, label: 'Erreiche Charisma Stufe 4' },
          { kind: 'skill', id: 'writing', n: 3, label: 'Erreiche Schreiben Stufe 3' },
        ],
        reward: { money: 600, moodlet: 'skillup', item: 'book' },
        outro:
          'Ich hab deine Probeaufnahme gehört – Gänsehaut! Und das nicht nur, weil Lukas die Klimaanlage wieder auf Arktis gestellt hat. Du bist bereit für deine erste Live-Sendung.',
        next: 'rd-live',
      },
      {
        id: 'rd-live',
        title: 'Rotes Licht: Live!',
        intro:
          'Wenn das rote Licht angeht, gibt es kein Zurück – nur dich, das Mikro und halb Lindenhafen am Frühstückstisch. Arbeite ein paar Schichten im Studio und hol dir die nächste Beförderung. Atmen nicht vergessen!',
        goals: [
          { kind: 'work', n: 5, label: 'Arbeite 5 Schichten beim Radio' },
          { kind: 'career', id: 'medien', n: 2, label: 'Erreiche Stufe 2 bei Radio Lindenwelle' },
        ],
        reward: { money: 800, moodlet: 'promoted' },
        outro:
          'Fünf Sendungen, null Pannen – na gut, eine, aber die Möwe auf dem Fenstersims hat keiner bemerkt. Jetzt musst du dich entscheiden: Willst du in die Musikredaktion oder zu den Nachrichten und Interviews?',
        branch: [
          { label: 'Musikredaktion: Sound für die Stadt', next: 'rd-musik' },
          { label: 'Nachrichten & Interviews: nah dran', next: 'rd-interview' },
        ],
      },
      {
        id: 'rd-musik',
        title: 'Die Musikredaktion',
        intro:
          'Musik! Dann brauchst du ein Ohr für Hits und ein Herz für Geheimtipps. Lern ein Instrument, damit du weißt, wovon du redest, und hol dir die nächste Stufe. Kofi aus der Loft-WG würde übrigens alles für ein Live-Set bei uns geben.',
        goals: [
          { kind: 'skill', id: 'music', n: 4, label: 'Erreiche Musik Stufe 4' },
          { kind: 'interaction', id: 'playGuitar', n: 5, label: 'Spiele 5-mal Gitarre' },
          { kind: 'career', id: 'medien', n: 3, label: 'Erreiche Stufe 3 bei Radio Lindenwelle' },
        ],
        reward: { money: 1000, moodlet: 'musicjoy' },
        outro:
          'Deine Playlist „Möwen, Meer & Melancholie“ ist der Hit des Monats! Sogar Oskar hat zugegeben, dass er mitgesummt hat. Jetzt fehlt nur noch eins: dein Publikum.',
        next: 'rd-hoerer',
      },
      {
        id: 'rd-interview',
        title: 'Nachrichten & Interviews',
        intro:
          'Nah dran an den Menschen – das ist echtes Lokalradio! Führe tiefgründige Gespräche, diskutiere fair und hol dir die nächste Stufe. Thi Mai bringt dir bei, die richtigen Fragen zu stellen. Und die Bürgermeisterin wartet schon auf ihr Interview.',
        goals: [
          { kind: 'social', id: 'deepTalk', n: 5, label: 'Führe 5 tiefgründige Gespräche' },
          { kind: 'social', id: 'debate', n: 3, label: 'Diskutiere 3-mal fair' },
          { kind: 'career', id: 'medien', n: 3, label: 'Erreiche Stufe 3 bei Radio Lindenwelle' },
        ],
        reward: { money: 1000, moodlet: 'proud', item: 'manuscript' },
        outro:
          'Dein Interview mit Ingrid Falkenberg wurde sogar in der Zeitung zitiert! Thi Mai hat „Belegt.“ gesagt – das ist bei ihr eine stehende Ovation. Jetzt holen wir dir dein Publikum.',
        next: 'rd-hoerer',
      },
      {
        id: 'rd-hoerer',
        title: 'Die Stimme der Stadt',
        intro:
          'Radio lebt von den Menschen, die zuhören. Geh raus, triff deine Hörer:innen, schließ Freundschaften und zeig, dass du nicht nur durchs Mikro sympathisch bist. Und leg ein bisschen was zur Seite – der Ruhm bezahlt keine Miete.',
        goals: [
          { kind: 'friend', n: 4, label: 'Habe 4 Freundschaften' },
          { kind: 'money', n: 15000, label: 'Habe 15.000 § auf dem Konto' },
        ],
        reward: { money: 1200, moodlet: 'grateful', item: 'flowers' },
        outro:
          'Im Café Möwe erkennen sie dich schon an der Stimme, wenn du bestellst! Marlene sagt, ihre Gäste wollen Autogramme auf Servietten. Ein letzter Schritt noch – und ich weiß genau, welcher.',
        next: 'rd-finale',
      },
      {
        id: 'rd-finale',
        title: 'Auf Sendung – ganz oben',
        intro:
          'Ich verrate dir ein Geheimnis: Ich suche jemanden, der eines Tages meine Morgenrunde übernimmt. Zeig mir, dass du das Zeug dazu hast. Arbeite hart, bleib du selbst und hol dir die Spitze der Lindenwelle.',
        goals: [
          { kind: 'career', id: 'medien', n: 4, label: 'Erreiche Stufe 4 bei Radio Lindenwelle' },
          { kind: 'work', n: 10, label: 'Arbeite 10 Schichten beim Radio' },
        ],
        reward: { money: 2000, moodlet: 'promoted', memory: 'Ganz oben bei Radio Lindenwelle – ich bin die Stimme von Lindenhafen.' },
        outro:
          'Meine Damen, Herren und alle dazwischen und drumherum – hier ist die neue Stimme von Lindenhafen! Ich bin so stolz auf dich, dass ich fast meinen Kaffee verschüttet hätte. Fast. Und jetzt: Mikro an, die Stadt hört zu!',
      },
    ],
  },
];
