/* FALL·AKTE – Inhalte: 6 Welten mit je 3 Schauplätzen, Figuren, Verbrechen und Motiven, Texte für Spuren und Verhöre.
 * Schauplätze bestehen aus Gegenständen [Typ, x, y, Größe, Name]; x/y im Bild 1000×600 (y = Standfläche). Die Zeichnung macht js/scene.js. */
(function (root) {
  'use strict';
  const WORLDS = [
    { id: 'villa', n: 'Villa Rabenstein', sub: 'Ein Herrenhaus voller Geheimnisse', acc: '#e0383e', crime: 'Der Rabenstein-Diamant ist aus der Vitrine verschwunden.', loot: 'den Diamanten',
      motives: ['Spielschulden bei den falschen Leuten', 'Rache für ein geplatztes Erbe', 'ein Käufer aus dem Ausland, der bar zahlt'],
      cast: [['Baronin Adele', 'Hausherrin', 'f'], ['Butler Bertram', 'Butler', 'm'], ['Dr. Kurt Faber', 'Hausarzt', 'm'], ['Gräfin Lotte', 'Nichte', 'f'], ['Gärtner Emil', 'Gärtner', 'm'], ['Hilde Sommer', 'Köchin', 'f'], ['Viktor Rabe', 'Neffe', 'm']],
      locs: [
        { id: 'salon', n: 'Salon', wall: 'wallpaper', objs: [['vitrine', 500, 470, 1, 'Leere Vitrine'], ['sofa', 250, 500, 1, 'Sofa'], ['fireplace', 800, 470, 1, 'Kamin'], ['painting', 300, 200, 1, 'Ölgemälde'], ['clock', 640, 470, 1, 'Standuhr'], ['rug', 520, 545, 1, 'Teppich'], ['plant', 940, 520, .9, 'Palme'], ['table', 120, 520, .8, 'Teetisch']] },
        { id: 'biblio', n: 'Bibliothek', wall: 'panel', objs: [['shelf', 200, 470, 1, 'Bücherregal'], ['shelf', 420, 470, 1, 'Regal mit Atlanten'], ['desk', 720, 510, 1, 'Schreibtisch'], ['lamp', 880, 510, 1, 'Leselampe'], ['globe', 580, 520, .9, 'Globus'], ['bin', 940, 540, .8, 'Papierkorb'], ['window', 720, 220, 1, 'Fenster'], ['chair', 90, 530, .9, 'Ohrensessel']] },
        { id: 'garten', n: 'Wintergarten', wall: 'glass', objs: [['plant', 150, 520, 1.2, 'Farn'], ['plant', 880, 520, 1.3, 'Zitronenbaum'], ['bench', 470, 530, 1, 'Gartenbank'], ['fountain', 690, 530, 1, 'Brunnen'], ['pot', 300, 540, 1, 'Blumentopf'], ['crate', 820, 545, .8, 'Werkzeugkiste'], ['door', 470, 330, 1, 'Glastür']] }
      ] },
    { id: 'hafen', n: 'Hafen Nebelstadt', sub: 'Nebel, Möwen und dunkle Geschäfte', acc: '#2fc4d6', crime: 'Eine Kiste mit wertvollen Gewürzen ist aus dem Lager verschwunden.', loot: 'die Gewürzkiste',
      motives: ['ein Schmugglerring zahlt gut', 'die Reederei schuldet noch drei Monatslöhne', 'ein eigenes Boot auf Raten'],
      cast: [['Kapitän Hark', 'Kapitän', 'm'], ['Marie Wellen', 'Hafenmeisterin', 'f'], ['Olaf Netz', 'Fischer', 'm'], ['Jette Tau', 'Matrosin', 'f'], ['Sven Kran', 'Kranführer', 'm'], ['Paula Möwe', 'Zollbeamtin', 'f'], ['Ingo Anker', 'Lagerverwalter', 'm']],
      locs: [
        { id: 'kai', n: 'Kai', wall: 'fog', objs: [['bollard', 200, 540, 1, 'Poller'], ['barrel', 360, 540, 1, 'Fass'], ['lifebuoy', 560, 260, 1, 'Rettungsring'], ['crate', 720, 540, 1.1, 'Kistenstapel'], ['lamp_post', 880, 540, 1, 'Laterne'], ['rope', 470, 560, 1, 'Tauwerk'], ['bench', 100, 540, .8, 'Wartebank']] },
        { id: 'lager', n: 'Lagerhalle', wall: 'brick', objs: [['crate', 180, 540, 1.3, 'Großer Stapel'], ['crate', 400, 540, .9, 'Offene Kiste'], ['barrel', 560, 540, 1, 'Ölfass'], ['shelf', 760, 470, 1, 'Regal'], ['desk', 920, 520, .8, 'Pult mit Frachtbuch'], ['window', 520, 200, 1, 'Oberlicht'], ['bin', 280, 550, .8, 'Mülltonne']] },
        { id: 'kajuete', n: 'Kapitänskajüte', wall: 'panel', objs: [['wheel', 500, 330, 1, 'Steuerrad'], ['desk', 280, 520, 1, 'Kartentisch'], ['porthole', 760, 230, 1, 'Bullauge'], ['chest', 760, 545, 1, 'Seekiste'], ['lamp', 120, 510, 1, 'Öllampe'], ['bed', 900, 530, .9, 'Koje'], ['coat', 620, 520, 1, 'Ölzeug am Haken']] }
      ] },
    { id: 'funk', n: 'Funkhaus', sub: 'Live auf Sendung – bis jemand den Stecker zieht', acc: '#f5b82e', crime: 'Mitten in der Live-Sendung wurde das Mischpult sabotiert.', loot: 'die Sendung',
      motives: ['Neid auf die Moderatorin', 'ein Konkurrenzsender hat Geld geboten', 'die Kündigung zum Monatsende'],
      cast: [['Rita Rauschen', 'Moderatorin', 'f'], ['Toni Tonband', 'Techniker', 'm'], ['Nora Netz', 'Redakteurin', 'f'], ['Max Mikro', 'Praktikant', 'm'], ['Dora Dezibel', 'Musikchefin', 'f'], ['Felix Frequenz', 'Sendeleiter', 'm'], ['Uli Ultrakurz', 'Wettermann', 'm']],
      locs: [
        { id: 'studio', n: 'Studio', wall: 'foam', objs: [['console', 500, 520, 1, 'Mischpult'], ['mic', 300, 520, 1, 'Mikrofon'], ['onair', 500, 150, 1, 'ON-AIR-Lampe'], ['speaker', 120, 520, 1, 'Lautsprecher'], ['speaker', 880, 520, 1, 'Monitorbox'], ['chair', 700, 530, .9, 'Drehstuhl'], ['cable', 380, 565, 1, 'Kabelsalat']] },
        { id: 'archiv', n: 'Plattenarchiv', wall: 'panel', objs: [['shelf', 180, 470, 1, 'Plattenregal'], ['shelf', 400, 470, 1, 'Bandregal'], ['turntable', 640, 520, 1, 'Plattenspieler'], ['crate', 820, 545, .8, 'Kiste mit Singles'], ['bin', 940, 550, .8, 'Papierkorb'], ['wallclock', 560, 210, 1, 'Uhr'], ['poster', 780, 220, 1, 'Konzertplakat']] },
        { id: 'kantine', n: 'Kantine', wall: 'tiles', objs: [['table', 300, 530, 1, 'Tisch'], ['table', 620, 530, 1, 'Ecktisch'], ['coffee', 880, 510, 1, 'Kaffeemaschine'], ['fridge', 120, 520, 1, 'Kühlschrank'], ['bin', 760, 550, .8, 'Mülleimer'], ['poster', 470, 210, .9, 'Dienstplan'], ['coat', 980, 520, .9, 'Garderobe']] }
      ] },
    { id: 'zirkus', n: 'Zirkus Stella', sub: 'Manege frei für einen rätselhaften Fall', acc: '#ff5ab4', crime: 'Die Abendkasse ist leer – mitten in der Vorstellung.', loot: 'die Abendkasse',
      motives: ['ein eigener kleiner Zirkus als Traum', 'Schulden beim Futterhändler', 'Wut über die gestrichene Nummer'],
      cast: [['Direktor Bruno', 'Zirkusdirektor', 'm'], ['Stella Stern', 'Seiltänzerin', 'f'], ['Clown Pippo', 'Clown', 'm'], ['Lena Löwe', 'Dompteurin', 'f'], ['Kalle Kraft', 'Gewichtheber', 'm'], ['Mira Magie', 'Zauberin', 'f'], ['Otto Orgel', 'Kapellmeister', 'm']],
      locs: [
        { id: 'manege', n: 'Manege', wall: 'tent', objs: [['podium', 500, 540, 1, 'Podest'], ['hoop', 260, 520, 1, 'Feuerreifen'], ['drum', 780, 540, 1, 'Pauke'], ['ladder', 120, 540, 1, 'Strickleiter'], ['ball', 380, 555, .9, 'Artistenball'], ['curtain', 900, 470, 1, 'Vorhang'], ['lamp_post', 640, 540, .9, 'Scheinwerfer']] },
        { id: 'wagen', n: 'Wohnwagen', wall: 'panel', objs: [['mirror', 300, 300, 1, 'Schminkspiegel'], ['table', 300, 530, .9, 'Schminktisch'], ['chest', 560, 545, 1, 'Kostümtruhe'], ['bed', 820, 530, 1, 'Klappbett'], ['coat', 680, 520, 1, 'Kostümständer'], ['window', 560, 220, .8, 'Wagenfenster'], ['bin', 130, 550, .8, 'Eimer']] },
        { id: 'stall', n: 'Stall', wall: 'wood', objs: [['hay', 220, 545, 1.1, 'Heuballen'], ['cage', 520, 540, 1, 'Löwenkäfig'], ['barrel', 800, 545, 1, 'Wassertonne'], ['crate', 920, 545, .8, 'Futterkiste'], ['lamp', 360, 510, .9, 'Stalllaterne'], ['rope', 680, 565, 1, 'Longe'], ['door', 100, 330, 1, 'Stalltor']] }
      ] },
    { id: 'museum', n: 'Museum der Zeiten', sub: 'Wo die Kunst den Atem anhält', acc: '#8fd14f', crime: 'Ein berühmtes Gemälde wurde gegen eine Fälschung vertauscht.', loot: 'das Original',
      motives: ['ein Sammler bietet ein Vermögen', 'Eifersucht auf die Kuratorin', 'Beweis, dass man selbst der bessere Maler ist'],
      cast: [['Kuratorin Clara', 'Kuratorin', 'f'], ['Wächter Willi', 'Nachtwächter', 'm'], ['Prof. Ida Eich', 'Kunstexpertin', 'f'], ['Malte Pinsel', 'Restaurator', 'm'], ['Gina Gold', 'Sammlerin', 'f'], ['Hugo Hall', 'Hausmeister', 'm'], ['Rosa Rahmen', 'Fotografin', 'f']],
      locs: [
        { id: 'galerie', n: 'Galerie', wall: 'gallery', objs: [['painting', 220, 230, 1, 'Fälschung'], ['painting', 520, 230, .8, 'Stillleben'], ['painting', 800, 230, .9, 'Porträt'], ['statue', 380, 540, 1, 'Marmorbüste'], ['bench', 640, 540, 1, 'Sitzbank'], ['rope', 230, 560, 1, 'Absperrkordel'], ['camera', 940, 120, 1, 'Kamera']] },
        { id: 'werk', n: 'Restaurierung', wall: 'panel', objs: [['easel', 300, 540, 1, 'Staffelei'], ['table', 560, 530, 1, 'Werktisch'], ['shelf', 820, 470, .9, 'Farbregal'], ['lamp', 680, 510, 1, 'Arbeitslampe'], ['bin', 120, 550, .8, 'Lappenkorb'], ['crate', 950, 545, .8, 'Rahmenkiste'], ['window', 420, 200, .9, 'Fenster']] },
        { id: 'sicher', n: 'Sicherheitsraum', wall: 'tiles', objs: [['monitors', 500, 470, 1, 'Monitorwand'], ['desk', 500, 530, 1, 'Wachpult'], ['locker', 140, 520, 1, 'Spind'], ['keyboard', 780, 520, 1, 'Schlüsselbrett'], ['coffee', 900, 510, .9, 'Kaffeemaschine'], ['chair', 330, 530, .9, 'Stuhl'], ['wallclock', 760, 180, 1, 'Uhr']] }
      ] },
    { id: 'hotel', n: 'Schneehotel Alpenblick', sub: 'Eingeschneit – und einer von euch war es', acc: '#6fa8ff', crime: 'Das geheime Rezeptbuch des Küchenchefs wurde gestohlen.', loot: 'das Rezeptbuch',
      motives: ['ein eigenes Restaurant in der Stadt', 'eine Wette um den Kochpreis', 'Rache für eine schlechte Kritik'],
      cast: [['Chefkoch Anton', 'Küchenchef', 'm'], ['Frau Berger', 'Hotelchefin', 'f'], ['Skilehrer Ben', 'Skilehrer', 'm'], ['Zimmermädchen Ella', 'Zimmermädchen', 'f'], ['Gast Sir Henry', 'Stammgast', 'm'], ['Kritikerin Yvonne', 'Restaurantkritikerin', 'f'], ['Portier Jakob', 'Portier', 'm']],
      locs: [
        { id: 'lobby', n: 'Lobby', wall: 'wood', objs: [['desk', 500, 520, 1.1, 'Rezeption'], ['fireplace', 180, 470, 1, 'Kamin'], ['sofa', 780, 530, 1, 'Ledercouch'], ['keyboard', 500, 250, 1, 'Schlüsselbrett'], ['plant', 940, 530, .9, 'Tanne im Topf'], ['rug', 330, 555, 1, 'Fell'], ['wallclock', 650, 200, 1, 'Kuckucksuhr']] },
        { id: 'kueche', n: 'Küche', wall: 'tiles', objs: [['stove', 260, 520, 1, 'Herd'], ['fridge', 90, 520, 1, 'Kühlraum'], ['table', 560, 530, 1, 'Arbeitsplatte'], ['shelf', 800, 470, .9, 'Gewürzregal'], ['bin', 940, 550, .8, 'Abfalleimer'], ['pot', 420, 545, .9, 'Suppentopf'], ['window', 600, 210, .9, 'Durchreiche']] },
        { id: 'keller', n: 'Skikeller', wall: 'brick', objs: [['skis', 220, 520, 1, 'Skiständer'], ['locker', 430, 520, 1, 'Spind'], ['bench', 640, 540, 1, 'Bank'], ['boots', 820, 555, 1, 'Skischuhe'], ['crate', 940, 545, .8, 'Kiste mit Mützen'], ['lamp', 90, 510, .9, 'Wandlampe'], ['door', 640, 330, .9, 'Hintertür']] }
      ] }
  ];

  // Merkmale der Verdächtigen und was eine Spur dazu verrät
  const ATTR = {
    hair: { n: 'Haarfarbe', vals: ['schwarz', 'blond', 'rot', 'grau', 'braun'], seen: true },
    glasses: { n: 'Brille', vals: ['ja', 'nein'], seen: true },
    shoe: { n: 'Schuhgröße', vals: [37, 38, 39, 40, 41, 42, 43, 44, 45] },
    hand: { n: 'Händigkeit', vals: ['links', 'rechts'] },
    smoke: { n: 'Raucher', vals: ['ja', 'nein'] },
    print: { n: 'Fingerabdruck', vals: ['Bogen', 'Schlaufe', 'Wirbel'] }
  };
  // Spur je Merkmal: Fundort-Text, Ergebnis, ggf. Labor-Aufgabe
  const CLUES = {
    hair: { icon: '🧶', find: 'Ein einzelnes Haar', lab: null, text: v => 'Ein ' + v + 'es Haar – der Täter hat ' + v + 'e Haare.', ask: null },
    glasses: { icon: '👓', find: v => v === 'ja' ? 'Ein Splitter von einem Brillenglas' : 'Ein Zeugen-Zettel', lab: null, text: v => v === 'ja' ? 'Brillensplitter – der Täter trägt eine Brille.' : 'Zeugin: „Keine Brille, da bin ich mir sicher.“', ask: null },
    shoe: { icon: '👣', find: 'Ein Schuhabdruck', lab: 'shoe', text: v => 'Schuhabdruck Größe ' + v + '.', ask: 'Welche Schuhgröße haben Sie?' },
    hand: { icon: '✍️', find: v => 'Eine verwischte Notiz', lab: null, text: v => 'Die Schrift verwischt nach ' + (v === 'links' ? 'rechts – geschrieben mit links.' : 'links nicht – geschrieben mit rechts.'), ask: 'Mit welcher Hand schreiben Sie?' },
    smoke: { icon: '🚬', find: v => v === 'ja' ? 'Ein Zigarettenstummel' : 'Ein unberührter Aschenbecher', lab: null, text: v => v === 'ja' ? 'Frische Asche – der Täter raucht.' : 'Es roch nicht nach Rauch – der Täter raucht nicht.', ask: 'Rauchen Sie?' },
    print: { icon: '🖐️', find: 'Ein Fingerabdruck', lab: 'print', text: v => 'Fingerabdruck mit ' + v + 'muster.', ask: 'Darf ich Ihre Fingerabdrücke nehmen?' },
    initial: { icon: '✉️', find: 'Eine Geheimnachricht', lab: 'cipher', text: v => 'Entschlüsselt – unterschrieben mit „' + v + '.“', ask: null },
    alibi: { icon: '📜', find: 'Ein zerrissener Brief', lab: 'letter', text: (v, name) => 'Der Brief bestätigt: ' + name + ' war zur Tatzeit woanders.', ask: null }
  };
  const EMPTY = ['Nichts Auffälliges.', 'Nur Staub.', 'Hier ist nichts.', 'Sauber – zu sauber?', 'Fehlanzeige.', 'Nichts als Fusseln.', 'Leer.', 'Kein Hinweis.'];
  const ALIBI = ['war in der Kantine beim Abendessen', 'telefonierte mit der Schwester', 'saß beim Arzt im Wartezimmer', 'war beim Kartenspielen', 'hat einen Spaziergang gemacht', 'war im Bad', 'hat ferngesehen', 'hat Briefe geschrieben', 'war im Keller und hat Holz geholt', 'hat geschlafen'];
  const RANKS = [[0, 'Spürnase in Ausbildung'], [3000, 'Hilfskommissar'], [9000, 'Kommissar'], [18000, 'Oberkommissar'], [30000, 'Chefinspektor'], [45000, 'Meisterdetektiv']];
  const FA_DATA = { WORLDS, ATTR, CLUES, EMPTY, ALIBI, RANKS };
  if (typeof module !== 'undefined' && module.exports) module.exports = FA_DATA;
  root.FA_DATA = FA_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
