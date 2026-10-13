'use strict';
/* Bunte Insel – Inselgeschichten 📜: jede Welt erzählt eine kleine eigene Geschichte in Akten (inspiriert von ihrem Vorbild, aber mit eigenen Figuren und Namen).
   Ein Erzähler/eine Figur der Welt spricht beim Betreten den Auftrag, die Ziele sind echte Aufgaben der Welt (Sticker). Schon Geschafftes zählt rückwirkend (Freie Welt wie Story-Modus).
   Das Aufgaben-Buch (📋) zeigt „📜 Inselgeschichten“, oben im Aufgaben-Chip steht der nächste Akt, sobald man auf der Insel ist. Fertig = Sticker + Sterne.
   NEUE WELT? Hier einen Eintrag ergänzen (key = BI.<KEY>, goal = Sticker-IDs aus js/kids.js) und den Abschluss-Sticker 'geschichte_<key>' in kids.js anlegen (siehe docs/NEUE-INHALTE.md). */
BI.INSELSTORY = [
  { key: 'HUEPF', icon: '🍄', npc: 'Pia', title: 'Der Sonnenstern', acts: [
    { text: 'Willkommen im Hüpfland! Felsenkönig Brocko hat unseren Sonnenstern in seine Burg geholt – seitdem ist hier alles ein bisschen grau. Lern erst die Insel kennen: Am Stall wartet Dino Tupfi auf dich!', hint: 'Reite auf Dino Tupfi (Dino-Stall)', goal: ['huepf_dino'], done: 'Tupfi hüpft vor Freude im Kreis!' },
    { text: 'Die bunten Röhren bringen dich blitzschnell über die Insel, und überall schweben Sternblöcke. Stoß sie von unten an!', hint: 'Reise durch eine Röhre und stoß alle Sternblöcke an', goal: ['huepf_roehre', 'huepf_bloecke'], done: 'Alle Sternblöcke leuchten – die Insel wird wieder bunter!' },
    { text: 'Flitzefuchs Ferdi fordert dich zum Kart-Rennen heraus! Und im Automaten am Platz wartet das Hüpf-Abenteuer bis zur Burg.', hint: 'Fahr ein Kart-Rennen und schaffe das Hüpf-Abenteuer', goal: ['huepf_kart', 'huepf_level'], done: 'Schnell und geschickt – du bist bereit für die Burg!' },
    { text: 'Jetzt die Mutprobe: Brocko ist gar nicht böse, nur grummelig. Drück seine drei Kitzel-Knöpfe und weich den rollenden Kieseln aus!', hint: 'Kitzle Felsenkönig Brocko in seiner Burg durch', goal: ['huepf_brocko'], done: 'Brocko lacht und gibt den Sonnenstern zurück!' }
  ], end: 'Die Sonne strahlt wieder über dem Hüpfland – Pia, Pelle, Ferdi und sogar Brocko feiern dich als Hüpf-Held!' },
  { key: 'RAETSEL', icon: '🗿', npc: 'Kapselmeisterin Pim', title: 'Die Prüfung der Uralten', acts: [
    { text: 'Willkommen, Held! Die Uralten schliefen tief – jetzt erwacht die schwebende Festung am Himmel. Nur wer die Prüfung im Turm besteht, darf sie betreten. Geh zum Prüfungsturm!', hint: 'Schaffe alle Rätsel im Prüfungsturm (Block, Pfeil, Bombe, Enterhaken)', goal: ['turm_s'], done: 'Der Turm ist bezwungen – das Siegel der Uralten bricht!' },
    { text: 'Du brauchst Verbündete: Am Kapsel-Schrein wartet ein Ei, und der Schmied macht dein Schwert stark.', hint: 'Wähle am Kapsel-Schrein ein Ei und schmiede ein Silberschwert', goal: ['kapsel', 'schmied'], done: 'Ein Kapselmonster an deiner Seite und ein scharfes Schwert – gut gerüstet!' },
    { text: 'Tief unter dem Dorf liegt die Uralte Höhle. Dort erzählen die Steine von Titan Kron.', hint: 'Steige in die Uralte Höhle hinab', goal: ['hoehle'], done: 'Du hast die Höhle erforscht und weißt nun, wo Titan Kron haust.' },
    { text: 'Titan Kron wartet im Verbotenen Wald! Nimm dein Kapselmonster mit und besiege ihn.', hint: 'Besiege Titan Kron im Verbotenen Wald', goal: ['titan'], done: 'Titan Kron ist besiegt – die Insel ist gerettet!' }
  ], end: 'Die Uralten verneigen sich: Du bist der Held der Rätsel-Insel!' },
  { key: 'SCHLUESSEL', icon: '🗝️', npc: 'Lichtwanderer Lio', title: 'Das Licht der Schlüssel', acts: [
    { text: 'Das Schlüsselreich versinkt im Schatten! Dunkelwichtel löschen die Laternen. Nur der Lichtschlüssel kann sie wieder entzünden.', hint: 'Zünde 12 Laternen mit dem Lichtschlüssel an', goal: ['laternen'], done: 'Die Laternen leuchten – die Dunkelwichtel weichen zurück!' },
    { text: 'Die Ringstraße und der Himmel gehören dem Licht. Sammle die Sterne und flieg mit dem Schlüsselschwert-Mobil.', hint: 'Sammle alle Sterne der Ringstraße und flieg mit dem Schlüsselschwert-Mobil', goal: ['rundfahrt', 'mobil_s'], done: 'Die ganze Insel strahlt wieder!' },
    { text: 'Fünf Schlüssellöcher hüten das Tor der Herzen. Öffne sie alle!', hint: 'Öffne das Tor der Herzen im Schlüsselreich', goal: ['herzentor'], done: 'Das Tor der Herzen steht offen – Feuerwerk!' },
    { text: 'Doch im Verbotenen Wald lauert noch der Dunkelriese. Nur der Schlüsselträger kann ihn besiegen.', hint: 'Besiege den Dunkelriesen im Verbotenen Wald', goal: ['schluesseltraeger'], done: 'Der Dunkelriese ist besiegt!' },
    { text: 'Hinter dem Schlüsselreich liegt die Wunsch-Insel. Geh über die Holzbrücke im Westen und sammle drei Wunschfrüchte – dann zeigt der große Baum ein geheimes Zeichen.', hint: 'Besuche die Wunsch-Insel, finde 3 Wunschfrüchte und das geheime Zeichen am Baum', goal: [{ log: 'wunsch', row: 0 }, { log: 'wunsch', row: 1 }, { log: 'wunsch', row: 2 }], done: 'Das Zeichen ist entdeckt!' },
    { text: 'In der Schlucht schläft ein Licht, und am Strand wartet ein Floß, das noch gebaut werden muss!', hint: 'Öffne das Tor in der Schlucht, bau das Floß und mach die Probefahrt', goal: [{ log: 'wunsch', row: 3 }, { log: 'wunsch', row: 5 }, { log: 'wunsch', row: 6 }], done: 'Das Floß schwimmt!' },
    { text: 'Die Insel hat Geheimnisse in der Höhe: Klettere auf den Aussichtsturm und finde die drei Truhen.', hint: 'Besteige den Aussichtsturm und öffne 3 Truhen', goal: [{ log: 'wunsch', row: 7 }, { log: 'wunsch', row: 8 }], done: 'Alle Truhen gefunden!' },
    { text: 'Der Abend kommt … Schau dir den Sonnenuntergang an der Hängematte an – und halte durch, wenn die Dunkelheit einbricht!', hint: 'Überstehe den Einbruch der Dunkelheit (40 Sekunden)', goal: [{ log: 'wunsch', row: 9 }], done: 'Die Dunkelheit weicht!' },
    { text: 'Aus dem dunklen Portal erwacht die Schattenarena. Besiege die Schattenwesen und den Schatten-Riesen Umbra!', hint: 'Gewinne 3 Runden in der Schattenarena und besiege Umbra', goal: [{ log: 'wunsch', row: 10 }, { log: 'wunsch', row: 11 }], done: 'Umbra ist besiegt!' }
  ], extra: 'WUNSCH', end: 'Lio lächelt: Du bist der wahre Schlüsselträger – und der Held der Wunsch-Insel!' },
  { key: 'SCHWAMM', icon: '🧽', npc: 'Schwammi', title: 'Das Geheimrezept der Knusper-Krabbe', acts: [
    { text: 'Hihi, willkommen in der Bucht! Das Geheimrezept der Knusper-Krabbe ist verschwunden – und alle haben Hunger. Probier erst mal die Gerichte, dann ermitteln wir!', hint: 'Iss drei verschiedene Gerichte in der Knusper-Krabbe', goal: ['stammgast'], done: 'Lecker! Du hast jetzt eine Nase für das Rezept.' },
    { text: 'Im Quallenfeld und bei Sunny in der Luftkuppel gibt es Hinweise. Sei flink und stark!', hint: 'Fang 15 Quallen und übe zehnmal Karate bei Sunny', goal: ['qualler', 'karate_s'], done: 'Flink gefangen, fleißig geübt – die Spur ist heiß!' },
    { text: 'Der winzige Plankto steckt dahinter – mit einem Riesen-Roboter! Hol dir das Rezept zurück!', hint: 'Besiege Planktos Riesen-Roboter im Verbotenen Wald', goal: ['plankton'], done: 'Planktos Roboter ist Geschichte – das Rezept ist zurück!' }
  ], end: 'Die Krabbe feiert dich: Held der Bucht!' },
  { key: 'MAERCHEN', icon: '🎠', npc: 'Fee Glimmer', title: 'Das verlorene Märchenbuch', acts: [
    { text: 'Oh, wie gut, dass du da bist! Das große Märchenbuch hat seine Seiten verloren – und mit ihnen die Magie. Fahr erst mal Karussell und Schwanenboot, dann kehrt der Zauber zurück!', hint: 'Fahr mit dem Märchen-Karussell und dem Schwanenboot', goal: ['karussell', 'schwan'], done: 'Funken sprühen – die ersten Seiten leuchten!' },
    { text: 'Weiter geht’s: Rutsch vom Frostgipfel und lauf beim Umzug mit.', hint: 'Rutsch vom Frostgipfel und lauf beim Märchen-Umzug mit', goal: ['eisrutsche', 'umzug'], done: 'Mehr Seiten sind gefunden!' },
    { text: 'Die letzten Seiten stecken im Stempelheft und in der Schloss-Show.', hint: 'Fülle das Stempelheft und starte die Schloss-Show', goal: ['stempel', 'schlossshow'], done: 'Alle Seiten sind zurück!' }
  ], end: 'Das Märchenbuch strahlt – und du stehst jetzt darin!' },
  { key: 'PARK', icon: '🎡', npc: 'Parkchef Bruno', title: 'Der Traumpark', acts: [
    { text: 'Willkommen im Freizeitpark! Er ist noch ein bisschen leer. Probier eine Attraktion aus – dann bauen wir ihn gemeinsam aus!', hint: 'Fahr eine Attraktion im Freizeitpark', goal: ['park'], done: 'Hui! Der Park hat Gäste!' },
    { text: 'Geh ins Park-Büro am Eingang: Baue etwas und schließe eine Park-Mission ab.', hint: 'Baue etwas im Park und schließe eine Park-Mission ab', goal: ['tybuild', 'tymis'], done: 'Dein Park wächst!' },
    { text: 'Jetzt der große Schritt: 3 Sterne Parkbewertung und alle Missionen!', hint: 'Erreiche 3 Sterne Parkbewertung und schaffe alle Park-Missionen', goal: ['tystar', 'tydir'], done: 'Der Traumpark ist perfekt!' }
  ], end: 'Bruno jubelt: Du bist Parkdirektor!' },
  { key: 'BAULAND', icon: '🧱', npc: 'Baumeisterin Berta', title: 'Die Stadt aus Blöcken', acts: [
    { text: 'Hier gehört alles dir: Block für Block entsteht deine Welt! Bau dein erstes Teil.', hint: 'Bau ein Teil (Bauen-Knopf 🧱)', goal: ['build'], done: 'Der erste Block sitzt!' },
    { text: 'Jetzt ein richtiger Parcours – bau ihn und schaffe ihn selbst!', hint: 'Schaffe deinen selbst gebauten Parcours', goal: ['parcours'], done: 'Dein Parcours ist geschafft!' }
  ], end: 'Berta staunt: Meisterbaumeister!' },
  { key: 'CITY', icon: '🏙️', npc: 'Stadtführerin Luna', title: 'Die Lichter der Großstadt', acts: [
    { text: 'Willkommen in der Stadt, die niemals schläft! Hier kennt fast jeder jeden. Lerne ein paar Stadtbewohner kennen: tippe auf sie und sag Hallo!', hint: 'Sprich mit 3 Stadtbewohnern der Stadtinsel', goal: [{ talk: 'CITY', n: 3 }], done: 'Die ersten Freunde in der Großstadt!' },
    { text: 'Die Ampeln der Stadt spinnen und der Verkehr steht still! Am Spielautomaten der Stadt kannst du den Verkehr ordnen.', hint: 'Spiele das Ampel-Spiel am Spielautomaten der Stadtinsel', goal: [{ flag: 'ampel' }], done: 'Der Verkehr fließt wieder!' },
    { text: 'Jetzt kennst du die Straßen. Zeig, dass die ganze Stadt dein Zuhause ist – sag allen Hallo!', hint: 'Sprich mit 8 Stadtbewohnern der Stadtinsel', goal: [{ talk: 'CITY', n: 8 }], done: 'Die ganze Stadt kennt dich!' }
  ], end: 'Luna jubelt: Du bist Ehren-Stadtkind – die Lichter leuchten für dich!' },
  { key: 'PUPS', icon: '🐶', npc: 'Bürgermeister Berti', title: 'Die große Fellretter-Parade', acts: [
    { text: 'Ein Notruf! Die Fellretter helfen überall, wo Not am Pfötchen ist. Nimm an der Einsatz-Tafel deinen ersten Einsatz an und schließe ihn ab!', hint: 'Schließe 1 Einsatz an der Einsatz-Tafel ab', goal: [{ einsatz: 1 }], done: 'Erster Einsatz geschafft – ein echter Fellretter!' },
    { text: 'Es gibt viel zu tun in der Bucht! Drei Einsätze, dann gehörst du zum Team.', hint: 'Schließe 3 Einsätze ab', goal: [{ einsatz: 3 }], done: 'Das Team ist stolz auf dich!' },
    { text: 'Die große Parade wartet auf alle Helden. Schaffe alle Einsätze, dann bekommst du die goldene Medaille!', hint: 'Schaffe alle Fellretter-Einsätze (Medaille)', goal: [{ medal: 1 }], done: 'Alle Einsätze geschafft – goldene Medaille!' }
  ], end: 'Berti ruft: Hurra für den Fellretter-Helden – Parade für dich!' },
  { key: 'RAINBOW', icon: '🌈', npc: 'Regenbogen-Romy', title: 'Jeder gehört dazu', acts: [
    { text: 'Hallo und willkommen! Auf unserer Regenbogeninsel ist jeder anders – und jeder gehört dazu. Lerne drei von uns kennen, jeder hat etwas Eigenes zu erzählen.', hint: 'Sprich mit 3 Bewohnern der Regenbogeninsel', goal: [{ talk: 'RAINBOW', n: 3 }], done: 'Neue Freunde – jeder ist besonders!' },
    { text: 'Gemeinsam macht alles mehr Spaß! Komm zum großen Regenbogen auf der Plaza und teile deine Freude mit allen.', hint: 'Teile Freude am großen Regenbogen der Plaza (Aktionstaste direkt am Regenbogen)', goal: [{ flag: 'rb_share' }], done: 'Die Plaza tanzt mit dir!' },
    { text: 'Jetzt fehlt nur noch, dass du alle kennst. Sag Hallo – dann wird die Plaza ganz bunt!', hint: 'Sprich mit 8 Bewohnern der Regenbogeninsel', goal: [{ talk: 'RAINBOW', n: 8 }], done: 'Alle Farben sind beisammen!' }
  ], end: 'Romy strahlt: Hier gehört jeder dazu – auch du!' },
  { key: 'DAMPF', icon: '🚢', npc: 'Käpt’n Muschel', title: 'Das Orchester der Farben', acts: [
    { text: 'Ahoi! Der Hafen ist ganz grau geworden – die Farbe ist weg! Öffne die sechs Farbeimer und bring die Farbe zurück.', hint: 'Öffne alle 6 Farbeimer im Dampfer-Hafen', goal: [{ log: 'dampf', row: 0 }], done: 'Der Hafen ist wieder bunt!' },
    { text: 'Jetzt fehlt die Musik! Spiel die Instrumente des Dampfer-Orchesters und finde die verlorenen Noten.', hint: 'Spiele alle 6 Instrumente und finde alle 8 Noten', goal: [{ log: 'dampf', row: 1 }, { log: 'dampf', row: 2 }], done: 'Das Orchester spielt wieder!' },
    { text: 'Zum großen Finale zeigen wir einen Stummfilm im Freiluftkino. Setz dich und schau zu!', hint: 'Sieh dir einen Stummfilm im Freiluftkino an', goal: [{ log: 'dampf', row: 3 }], done: 'Bravo – Vorhang zu, Applaus!' }
  ], end: 'Käpt’n Muschel pfeift: Ehren-Matrose des Dampfer-Hafens!' },
  { key: 'DRACHEN', icon: '🐉', npc: 'Drachenwächterin Brisa', title: 'Zündels Himmelsflug', acts: [
    { text: 'Die Drachenhöhen sind dunkel und kalt. Zündel, der kleine Drache, braucht deine Hilfe: Zünde alle sechs Fackeln an!', hint: 'Zünde alle 6 Fackeln an (Zündel hilft)', goal: [{ log: 'drachen', row: 0 }], done: 'Die Höhlen leuchten warm!' },
    { text: 'Gefangene Kristall-Freunde warten auf dich, und im Aufwind warten die Flugringe!', hint: 'Befreie alle 6 Kristall-Freunde und fliege durch alle 8 Flugringe', goal: [{ log: 'drachen', row: 1 }, { log: 'drachen', row: 2 }], done: 'Alle frei und alle Ringe geflogen!' },
    { text: 'Jetzt ist Zündel bereit für den Himmelsflug: Öffne das Himmelstor!', hint: 'Öffne das Himmelstor und spiele „Drachenflug“', goal: [{ log: 'drachen', row: 4 }], done: 'Zündel fliegt hoch hinaus!' }
  ], end: 'Brisa lächelt: Du bist Drachenfreund fürs Leben!' },
  { key: 'FUSSBALL', icon: '⚽', npc: 'Trainerin Lena', title: 'Der goldene Pokal', acts: [
    { text: 'Willkommen in der Arena! Jede Meisterin hat mal klein angefangen. Schieß deinen ersten Ball!', hint: 'Schieß einmal richtig (Knopf am Ball)', goal: [{ log: 'fussball', row: 0 }], done: 'Der erste Schuss sitzt!' },
    { text: 'Gut so! Jetzt zeig, dass du treffen kannst: fünf Tore!', hint: 'Schieße 5 Tore', goal: [{ log: 'fussball', row: 1 }], done: 'Fünf Tore – du hast den Dreh raus!' },
    { text: 'Fehlt nur noch Ausdauer! Schaffe 25 Tore.', hint: 'Schieße 25 Tore', goal: [{ log: 'fussball', row: 2 }], done: '25 Tore – Wahnsinn!' },
    { text: 'Das Turnier wartet! Gewinne den goldenen Pokal!', hint: 'Gewinne das Fußball-Turnier', goal: ['cupwin'], done: 'Pokalsieger!' }
  ], end: 'Lena hebt den Pokal: Du bist die Meisterin der Arena!' },
  { key: 'ZOTIK', icon: '🦊', npc: 'Mira', title: 'Der Ruf des Kristalls', acts: [
    { text: 'Reisende, ich habe auf dich gewartet! Der große Kristall von Lunaris ruft nach Hilfe. Sprich mit mir in der Taverne – dann geht es los.', hint: 'Besuche Lunaris und sprich mit Mira in der Taverne', goal: [{ log: 'zotik', row: 0 }, { log: 'zotik', row: 1 }], done: 'Mira vertraut dir!' },
    { text: 'Ein Hinweis liegt im Hafen. Such ihn!', hint: 'Finde den Hinweis im Hafen', goal: [{ log: 'zotik', row: 2 }], done: 'Der Hinweis führt zur Akademie!' },
    { text: 'An der Akademie ist ein Riss in der Luft. Untersuche ihn – aber sei auf einen Kampf gefasst!', hint: 'Untersuche den Riss an der Akademie (Elementar-Kampf)', goal: [{ log: 'zotik', row: 3 }], done: 'Der Riss ist geschlossen!' },
    { text: 'Erzähl Mira, was geschehen ist!', hint: 'Berichte Mira vom Kampf', goal: [{ log: 'zotik', row: 4 }], done: 'Der Kristall strahlt wieder!' }
  ], end: 'Mira verneigt sich: Du bist der Held von Lunaris!' },
  { key: 'RADIO', icon: '📻', npc: 'Funkmeisterin Frida', title: 'Die dreizehn Sender', acts: [
    { text: 'Hörst du das Rauschen? Die Funkwelle hat 13 Sender! Schalte am Platz ein Radio ein und hör 20 Sekunden zu.', hint: 'Höre einen Sender (Radio am Platz, 20 Sekunden zuhören)', goal: [{ log: 'radio', row: 1 }], done: 'Dein erster Sender!' },
    { text: 'Das Visual Radio zeigt die Musik als Bilder. Schau es dir an einem Bildschirm an!', hint: 'Sieh dir das Visual Radio an einem Bildschirm an', goal: [{ log: 'radio', row: 3 }], done: 'Musik zum Sehen!' },
    { text: 'Jetzt der große Empfang: alle 13 Sender!', hint: 'Höre alle 13 Sender', goal: [{ log: 'radio', row: 2 }], done: 'Alle Sender empfangen!' }
  ], end: 'Frida dreht auf: Du bist Funkmeister!' },
  { key: 'ATLANTIS', icon: '🔱', npc: 'Orakel Okeana', title: 'Das Herz von Atlantis', acts: [
    { text: 'Willkommen in der versunkenen Stadt! Die Hologramme erzählen ihre Geschichte – schau sie dir an.', hint: 'Sieh dir alle 5 Hologramme im Archiv an', goal: [{ log: 'atlantis', row: 1 }], done: 'Du kennst die Geschichte von Atlantis!' },
    { text: 'Das Herz von Atlantis schlägt auf dem Stufenberg. Steig hinauf und berühre es – und lass die Kristall-Harfe klingen!', hint: 'Berühre das Herz auf dem Stufenberg und spiele die Kristall-Harfe', goal: [{ log: 'atlantis', row: 2 }, { log: 'atlantis', row: 3 }], done: 'Das Herz schlägt wieder!' },
    { text: 'Zum Schluss: Schwerelos hüpfen und mit dem Aqua-Gleiter fahren!', hint: 'Hüpfe in die Schwerelos-Halle und fahre mit einem Aqua-Gleiter', goal: [{ log: 'atlantis', row: 4 }, { log: 'atlantis', row: 5 }], done: 'Du schwebst durch Atlantis!' }
  ], end: 'Okeana flüstert: Atlantis hat einen neuen Hüter!' },
  { key: 'TASCHI', icon: '🔴', npc: 'Professor Ulme', title: 'Der Weg zum Meister', acts: [
    { text: 'Willkommen in Taschi-Land! Hier leben freundliche Taschis. Such dir bei mir deinen ersten Freund aus und fang dann im hohen Gras ein wildes Taschi!', hint: 'Wähle bei Professor Ulme dein erstes Taschi und fang ein wildes im Gras', goal: [{ log: 'taschi', row: 0 }, { log: 'taschi', row: 1 }], done: 'Du bist ein echter Taschi-Trainer!' },
    { text: 'Jetzt die Arena! Besiege Fels-Fiete, Perla, Käpt’n Volt und Blüte – du bekommst jedes Mal einen Orden.', hint: 'Besiege die 4 Arena-Leiter (4 Orden)', goal: [{ log: 'taschi', row: 2 }, { log: 'taschi', row: 3 }, { log: 'taschi', row: 4 }, { log: 'taschi', row: 5 }], done: 'Vier Orden – stark!' },
    { text: 'Zwei Aufgaben fehlen noch: fang 8 verschiedene Taschis für meinen Forscher-Orden – und schnapp dir Team Funke bei ihrem Heißluftballon!', hint: 'Forscher-Orden (8 Taschis) und Ballon-Orden (Team Funke besiegen)', goal: [{ log: 'taschi', row: 6 }, { log: 'taschi', row: 7 }], done: 'Der Ballon gehört dir!' },
    { text: 'Der letzte Orden: Fordere Meisterin Aurelia in der Arena heraus!', hint: 'Besiege Meisterin Aurelia (Meister-Orden)', goal: [{ log: 'taschi', row: 8 }], done: 'Alle 8 Orden!' }
  ], end: 'Professor Ulme verneigt sich: Du bist Taschi-Meister – und seine Statue strahlt für dich!' },
  { key: 'PRISMA', icon: '🌀', npc: 'Nuri', title: 'Die drei Lichtsignale', acts: [
    { text: 'Willkommen im Prisma-Archipel! Drei Bereiche haben ihr Signal verloren. Nuri zeigt dir den Ki-Garten.', hint: 'Löse die Lichtfolge im Ki-Garten', goal: ['prisma_ki'], done: 'Das erste Signal leuchtet wieder!' },
    { text: 'In der Runen-Arena warten leuchtende Zeichen. Lies den Hinweis und tippe die drei Symbole in der richtigen Reihenfolge.', hint: 'Löse das Zeichenrätsel in der Runen-Arena', goal: ['prisma_runen'], done: 'Die Runen-Arena ist wieder aktiv!' },
    { text: 'Im Datenhain sind die Wegweiser durcheinander. Stelle die Lichtfolge wieder her.', hint: 'Repariere die Signalfolge im Datenhain', goal: ['prisma_daten'], done: 'Alle drei Signale verbinden die Insel – gut gemacht!' }
  ], end: 'Das Prisma-Archipel strahlt wieder. Nuri und Tavi feiern deine Entdeckerleistung!' },
];
BI.createInselStory = function (G) {
  const { save, say, persist, P } = G, K = { cur: null }, ST = BI.INSELSTORY, got = id => (save.stk || []).includes(id);
  const S = () => { const s = save.inselstory || (save.inselstory = {}); return s; };
  const of = key => ST.find(q => q.key === key);
  const stage = d => { const a = S()[d.key]; return a == null ? -1 : a; }; /* -1 nicht begonnen, 0..n-1 Akt, n fertig */
  /* Ziele: Sticker-ID · { log, row } (Zeile der Aufgabenliste der Welt erledigt) · { talk, n } (n Bewohner der Insel angesprochen) · { flag } · { einsatz: n } · { medal } */
  const logs = () => (G.logs ? G.logs() : {});
  const residents = key => { const O = BI[key], out = new Set(); if (O && G.folk) for (const n of G.folk()) if (n.p && n.p.name && Math.hypot(n.x - O.x, n.z - O.z) < O.R + 5) out.add(n.p.name); return out; };
  const goalDone = g => {
    if (typeof g === 'string') return got(g);
    try {
      if (g.log) { const f = logs()[g.log], l = f && f(), r = l && l.rows[g.row]; return !!(r && r.ok); }
      if (g.talk) { const names = residents(g.talk), T = save.talked || []; let n = 0; for (const q of T) if (names.has(q)) n++; return n >= g.n; }
      if (g.flag) return !!(save.flags && save.flags[g.flag]);
      if (g.einsatz != null) { const f = logs().einsatz, l = f && f(); return !!(l && l.state.done.length >= g.einsatz); }
      if (g.medal) { const f = logs().einsatz, l = f && f(); return !!(l && l.state.medal); }
    } catch (e) { }
    return false;
  };
  K.goalDone = goalDone;
  const actDone = a => a.goal.every(goalDone);
  /* Fortschritt prüfen: erledigte Akte weiterschalten (leise nachholen, wenn es schon Geschafftes gibt) */
  function advance(d, quiet) {
    const s = S(); let moved = false;
    while (s[d.key] != null && s[d.key] < d.acts.length && actDone(d.acts[s[d.key]])) {
      const a = d.acts[s[d.key]]; s[d.key]++; moved = true;
      if (!quiet) { G.addStars(3); say('📜 ✔ ' + a.done + ' +3 ⭐', 4200); G.fanfare && G.fanfare(); }
      if (s[d.key] >= d.acts.length) { finish(d, quiet); break; }
      else if (!quiet) setTimeout(() => announce(d), 2600);
    }
    if (moved) persist(); return moved;
  }
  function finish(d, quiet) { const id = 'geschichte_' + d.key.toLowerCase(); if (!quiet) { G.addStars(10); setTimeout(() => say('🏆 ' + d.icon + ' „' + d.title + '“ geschafft! ' + d.end + ' +10 ⭐', 6200), 1200); if (G.speak) G.speak(d.end); } if (G.earn) G.earn(id); }
  function announce(d) { const a = d.acts[S()[d.key]]; if (!a) return; say(d.icon + ' ' + d.npc + ': „' + a.text + '“', 8200); if (G.speak) G.speak(a.text); }
  function start(d) { const s = S(); if (s[d.key] != null) return; s[d.key] = 0; persist(); if (!advance(d, true)) announce(d); else { const a = d.acts[s[d.key]]; if (a) announce(d); else say(d.icon + ' „' + d.title + '“ hast du schon geschafft! 🏆', 3600); } }
  let tmr = 0;
  K.update = function (dt) {
    tmr -= dt; if (tmr > 0) return; tmr = .8; K.cur = null; const x = P.veh ? P.veh.x : P.x, z = P.veh ? P.veh.z : P.z;
    for (const d of ST) {
      const O = BI[d.key]; if (!O) continue; const E = d.extra && BI[d.extra], on = Math.hypot(x - O.x, z - O.z) < O.R + 12 || !!(G.inside && G.inside(d.key)) || !!(E && Math.hypot(x - E.x, z - E.z) < E.R + 12); /* Atlantis liegt unter Wasser: dort zählt „drinnen“ */
      if (S()[d.key] != null) advance(d, false);
      if (on && !K.locked(d)) { if (S()[d.key] == null) start(d); const a = d.acts[S()[d.key]]; if (a) K.cur = { d, a, i: S()[d.key] }; }
    }
  };
  K.locked = d => { const O = BI[d.key]; return !!(G.lockedAt && O && G.lockedAt(O.x, O.z)); };
  /* Anzeige im Aufgaben-Chip, wenn man auf der Insel ist */
  K.goal = function () { const c = K.cur; if (!c) return null; return { icon: c.d.icon, title: c.d.title + ' · Akt ' + (c.i + 1) + '/' + c.d.acts.length, text: c.a.hint }; };
  K.log = function () {
    const rows = []; let n = 0;
    for (const d of ST) { const a = S()[d.key], done = a != null && a >= d.acts.length; if (done) n++; rows.push({ ok: done, icon: d.icon, text: d.title + (a == null ? ' – noch nicht begonnen (geh auf die Insel)' : done ? ' – geschafft! 🏆' : ' – Akt ' + (a + 1) + '/' + d.acts.length + ': ' + d.acts[a].hint), dest: null });
      if (a != null && !done) for (let i = 0; i < d.acts.length; i++) rows.push({ ok: i < a, icon: '  ' + (i < a ? '✔' : '▫'), text: d.acts[i].hint, dest: null }); }
    return { title: '📜 Inselgeschichten', count: n + ' von ' + ST.length, rows };
  };
  K.dbg = { S, advance, start, stage, ST, goalDone, residents };
  return K;
};
