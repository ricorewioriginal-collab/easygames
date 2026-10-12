'use strict';
/* Bunte Insel – Inhalt von Handbuch 📘 und Lösungsbuch 🗝️ (Text). Wird im Spiel (js/buch.js) und als Markdown (docs/HANDBUCH.md, docs/LOESUNGSBUCH.md, per tools/gen-docs.mjs) benutzt.
   Blöcke: ['p', Text] · ['h', Überschrift] · ['ul', [Punkte]] · ['tip', Text] · ['tbl', [[Spalte1, Spalte2], …]].
   Dynamische Teile (Tasten, Welten, Sticker, Aufgabenlisten, Codes) erzeugt buch.js automatisch aus dem Spiel – neue Inseln/Sticker erscheinen dort von selbst.
   NEUE INHALTE: bitte hier ein bis zwei Sätze zur neuen Welt in WELTEN und eine Lösung in LOESUNG ergänzen (siehe docs/NEUE-INHALTE.md). */
BI.BUCH = {
  handbuch: [
    { id: 'willkommen', icon: '🏝️', title: 'Willkommen auf der Bunten Insel', body: [
      ['p', 'Die Bunte Insel ist eine große, offene Spielwelt für Kinder (ab ca. 4 Jahren, mit Vorlesen und Bildern). Man läuft, fährt, schwimmt und fliegt über die Hauptinsel und viele kleine Welten, spielt Mini-Spiele, sammelt Sterne ⭐ und Sticker 🏅, gestaltet sein Zuhause und erlebt Abenteuer.'],
      ['h', 'Zwei Spielmodi – ein Spielstand'],
      ['ul', ['🌍 Freie Welt: alles ist offen, man kann überall hin und alles ausprobieren.', '📖 Story-Modus: gleiche Welt, aber die Welten müssen nach und nach freigespielt werden (wie in einem Rollenspiel). Man startet zuhause.', 'Der Modus lässt sich jederzeit im Pause-Menü oder in ⚙️ wechseln. Sterne, Sticker und Aufgaben gelten in beiden Modi.']],
      ['h', 'Speichern'],
      ['p', 'Das Spiel speichert automatisch im Browser (💾 Spielstand 1–3 im Hauptmenü, unter „Wechseln“). Im Pause-Menü gibt es „Jetzt speichern“ und „Sichern (Datei)“.']
    ] },
    { id: 'steuerung', icon: '🎮', title: 'Steuerung', body: [
      ['h', '📱 Touch (Handy, Tablet)'],
      ['ul', ['Links im Bild: Joystick zum Laufen und Fahren (ganz außen = rennen). Der Stick erscheint dort, wo der Finger hintippt.', 'Rechts wischen: Kamera drehen.', 'Großer Knopf A (unten rechts): Aktion – einsteigen, reden, einkaufen, Türen öffnen. Seine Beschriftung zeigt, was gerade passiert.', 'B: Springen (im Fahrzeug Turbo). Y: Hallo winken (im Fahrzeug Hupe). X: zweite Aktion – gibt es zwei Möglichkeiten (z. B. Auto und Tür), ist A die erste und X die zweite; sonst „Hauen“.']],
      ['h', '⌨️ Tastatur und Maus'],
      ['p', 'Alle Tasten lassen sich im Pause-Menü unter „⌨️ Tasten & Controller belegen“ frei ändern. Standard:'],
      ['@tasten'],
      ['ul', ['Maus ziehen: Kamera drehen · Mausrad: Abstand.', 'Zifferntasten 1–0: Spaß-Aktionen (Tanzen, Kaugummi, Ball, Feuerwerk, Luftballons, Boxen, Bellen, Suchen, Seifenblasen, XXL).', 'Esc oder P: Pause.']],
      ['h', '🎮 Controller (Xbox, PlayStation, Switch …)'],
      ['p', 'Controller werden automatisch erkannt (erst eine Taste drücken). Unbekannte Controller bekommen einen kurzen Einrichtungs-Assistenten.'],
      ['ul', ['Linker Stick laufen/fahren · rechter Stick Kamera · A Aktion · B Springen/Turbo · X zweite Aktion/Hauen · Y Hallo/Hupe', 'RT/LT Gas und Bremse · Start Pause · Select Aufgaben · LB Kamera', 'Steuerkreuz: ↑ Wohin, ← Spaß, → Tasche, ↓ Aufgaben', 'In Menüs: Steuerkreuz bewegt die Markierung, A drückt, B geht zurück. In Mini-Spielen: Stick/Steuerkreuz = Pfeiltasten, A = Leertaste.']]
    ] },
    { id: 'tv', icon: '📺', title: 'Fernseher und Handy-Controller', body: [
      ['p', 'Das Spiel kann auf einem Fernseher oder großen Bildschirm laufen, während Handys (bis 4 Spieler) die Controller sind.'],
      ['ul', ['Am Fernseher/Computer: Hauptmenü → „📺 Spiel am Fernseher öffnen“. Es erscheinen ein Link, ein 4-stelliger Code und ein QR-Code.', 'Am Handy: Hauptmenü → „📱 Handy-Controller öffnen“ (oder den Link öffnen / QR scannen) und den Code eingeben.', 'Spieler 1 steuert die Hauptfigur (auch Menüs per Zeiger), Spieler 2–4 sind Mitspieler-Figuren. Optional Splitscreen (🪟).', 'Bricht die Verbindung ab, verbindet sich das Handy automatisch neu und bekommt seinen Platz zurück (30 Sekunden reserviert).', 'Mit einem Controller direkt am Fernseher/Computer braucht man kein Handy.']],
      ['tip', 'Der Fernseher merkt sich seinen Code, das Handy den letzten Code – beim nächsten Mal verbindet es sich von allein.']
    ] },
    { id: 'modi', icon: '📖', title: 'Freie Welt und Story-Modus', body: [
      ['p', 'Im Hauptmenü wählt man „🌍 Freie Welt“ oder „📖 Story-Modus“. Beide benutzen denselben Spielstand: alles, was man in einem Modus schafft, zählt auch im anderen.'],
      ['h', 'Story-Modus'],
      ['ul', ['Start zuhause. Das Aufgaben-Buch 📋 zeigt die Hauptquest „Die Inselreise“ mit Fortschrittsbalken.', 'Jede Welt hat 3 klare Aufgaben (Sticker). Sind sie geschafft, öffnet sich die Welt mit Fanfare.', 'Gesperrte Welten liegen hinter einer durchsichtigen Glaswand mit Schlössern; ein Schild zeigt, was zu tun ist.', 'In „🧭 Wohin?“ sind gesperrte Orte mit 🔒 markiert, ohne Weg-Anzeige und ohne Hinzaubern.', 'Neue Welten, die später ins Spiel kommen, werden automatisch gesperrt und bekommen eigene Aufgaben.']]
    ] },
    { id: 'orientierung', icon: '🧭', title: 'Orientierung und Menüs', body: [
      ['ul', ['⭐ oben links: deine Sterne. 📋 Aufgaben & Hinweise, ⚙️ Einstellungen, ⏸ Pause, runde Minikarte oben rechts.', 'Links: 🎒 Tasche (Futter, Gegenstände), 🎉 Spaß (Tanz, Spiele, Karten …), ☰ Mehr (Wohin, Kamera, Bauen …).', '🧭 Wohin?: Orte nach Themen. 👣 zeigt den Weg (Pfeil + Entfernung), ✨ zaubert dich hin.', '⚙️ Einstellungen: Tag & Nacht, Vorlesen, Musik, Geräusche – außerdem 📚 Handbuch & Lösungen, 🔑 Code eingeben, 🐞 Fehler melden und der Moduswechsel.', 'Pause-Menü: Spielstand speichern, Mitspielen, Eltern-Bereich (Knopf gedrückt halten), Tasten belegen, Modus wechseln.']]
    ] },
    { id: 'fahren', icon: '🚗', title: 'Fahren, Schwimmen, Fliegen', body: [
      ['ul', ['Fahrzeuge: an ein Fahrzeug herantreten, A „Einsteigen“. Laufende Autos erst anhalten (A), dann einsteigen. Hupe, Turbo, bei Polizei/Feuerwehr Sirene (X/F).', 'Mitfahren: bei einem Freund einsteigen; nur der Fahrer lenkt.', 'Zug, Segelboot ⛵, Hubschrauber 🚁: einsteigen und die Insel von oben oder vom Wasser entdecken; Hubschrauber/Boot geben Sticker.', 'Schwimmen: am Strand und im Meer kann man überall schwimmen – es gibt keine unsichtbaren Mauern. Nur ganz weit draußen ist Schluss.', 'Brücken verbinden die Hauptinsel mit den Welten.']]
    ] },
    { id: 'fahrzeugmenue', icon: '🚗', title: 'Fahrzeug-Menü', body: [
      ['p', 'Alle Fahrzeuge des Spiels stehen unter 🧭 Wohin? → Reiter 🚗 Fahrzeuge (28 Arten plus Boot und Piratenschiff).'],
      ['ul', ['🚗 Herholen: Auto, Polizei, Krankenwagen, Feuerwehr, Bus, Traktor, Mähdrescher, Hubschrauber, RC-Auto und alle Spielzeug-Fahrzeuge bekommst du als eigenes Exemplar neben dich gestellt.', '👣 Weg zeigen und ✨ Hinzaubern führen zu Fahrzeugen, die zu ihrer Welt gehören (Schlüsselschwert-Mobil, Reit-Drache, Fellnasen-Mobil, Wannen-Mobil, Aqua-Gleiter, Nautilux, Segelboot).', 'Spielzeug-Fahrzeuge (Tretroller, Fahrrad, Autoscooter, Aufsitzmäher, Rutschauto, Motorrad, Taxi, Eiswagen, Limousine, RC-Hubschrauber, Skateboard, Rollator) kaufst du im Spielzeugladen 🧸 (Reiter 🚗 Fahrzeuge); vorher zeigt das Menü 🔒.', 'Im Story-Modus sind Fahrzeuge gesperrter Welten mit 🔒 und den fehlenden Aufgaben markiert.']]
    ] },
    { id: 'zuhause', icon: '🏠', title: 'Zuhause, Garten und Bauernhof', body: [
      ['ul', ['Jeder Held hat eine eigene Wohnung mit Garten. Zimmer einrichten, im Bett schlafen, im Garten ernten.', 'Bauernhof (Bauer Heinz): Tiere streicheln, Felder mähen, in der Hofküche kochen. Hof-Aufgaben stehen oben im Aufgaben-Chip.', 'Freunde besuchen: ❤️ Herzen für das Zimmer schenken.']]
    ] },
    { id: 'gebaeude', icon: '🚪', title: 'Gebäude betreten', body: [
      ['p', 'Alle massiven Gebäude der Welten haben eine echte Haustür und eine goldene Türmatte davor. Auf die Matte stellen, A „… betreten“.'],
      ['ul', ['Drinnen gibt es je nach Haus Bett (ausruhen), Tisch (Snack ⭐), Bücherregal (Tipps), Schatztruhe (einmal pro Haus: ⭐ + Futter), Bewohner zum Reden, Läden, Schmiede, Fernrohr, Kristallkugel, Thron …', 'Die Uralte Höhle auf der Rätsel-Insel hat einen Abstieg ins Mini-Spiel.', 'Am Ausgang „Hinausgehen“. Neu betretene Häuser geben ⭐; Sticker für 5, 20 und 40 Gebäude und für 10 Truhen.']]
    ] },
    { id: 'begleiter', icon: '🐾', title: 'Haustiere und Begleiter', body: [
      ['ul', ['Unter „Mein Held → 🐾 Haustier“ wählst du dein Tier. „Mitnehmen“ lässt es überall mitkommen, „Zu Hause lassen“ wartet es in der Wohnung.', 'Freischaltbare Tiere: 🦊 Funki (Sticker Schlüsselreisender), 🦝 Räubi (Bucht-Besucher), 🦄 Sternenstaub (Karussell-Kind), 🐻 Brummi (Türöffner).', 'Maskottchen aus den Welten (z. B. Zündel, Willi, Felli) werden dort als Partner freigeschaltet.', 'Dein Kapselmonster (Rätsel-Insel) ist ebenfalls ein Begleiter, sobald du am Kapsel-Schrein ein Ei gewählt hast – es kämpft im Wald weiter mit.']]
    ] },
    { id: 'figuren', icon: '🧑‍🎤', title: 'Figuren und Spielzeugladen', body: [
      ['ul', ['Unter „Mein Held“ wählst du aus über 45 Figuren: die Klassiker (Jannis, Mia, Fee Luna, Ritter Ben …), Helden aus den Welten (Käpt’n Muschel, Fee Glimmer, Drachenwächterin Brisa, Kapselmeisterin Pim, Lichtwanderer Lio, Schwammi, Orakel Okeana, Mira von Lunaris …) und deinen eigenen Held im Studio.', 'Spielzeugladen 🧸: 7 Reiter – Mützen, Zubehör, Spielzeug, Zimmer, Hüte & mehr, 🚗 Fahrzeuge (zum Herholen) und 💍 Style (Brillen, Ohrringe, Ketten, Stirnbänder, Masken, Bärte, Uhr, Regenbogen-/Fuchs-Look). Gekaufte Sachen liegen im Rucksack 🎒.']]
    ] },
    { id: 'sterne', icon: '⭐', title: 'Sterne, Sticker und Läden', body: [
      ['ul', ['⭐ Sterne gibt es für Aufträge, Kapitel, Mini-Spiele, Tagesgeschenk, Schätze, Truhen … Mit Sternen kauft man im Spielzeugladen, in Läden und Automaten.', '🏅 Sticker sind Erfolge (über 100). Jeder gibt +2 ⭐. Alle stehen im Lösungsbuch mit ihrer Aufgabe.', 'Das Tagesgeschenk wartet beim ersten Start jedes Tages; Tage hintereinander spielen gibt den Sticker „Stammgast“.']]
    ] },
    { id: 'kaempfen', icon: '⚔️', title: 'Kämpfen und Monster', body: [
      ['ul', ['Arena: Kämpfe gegen Gegner (Sticker „Kämpfer“). Verbotener Wald: Waldmonster, Trickfilm-Monster und Riesen-Gegner.', 'Das Kapselmonster (Rätsel-Insel, Kapsel-Schrein) kämpft mit, wird gefüttert und entwickelt sich bis Stufe 5.', 'Schwert verbessern: Schmiede auf der Rätsel-Insel (kostet ⭐).', 'Wird die Lebensanzeige leer, ist der Kampf vorbei – nichts geht verloren.']]
    ] },
    { id: 'spiele', icon: '🕹️', title: 'Mini-Spiele und Spielautomaten', body: [
      ['ul', ['🎉 Spaß-Menü: viele Mini-Spiele (Geschicklichkeit, Denken, Lernen), allein oder mit Freunden.', 'Spielautomaten stehen auf vielen Inseln und passen zur Welt. Sie geben ⭐.', 'Mit Controller: Stick/Steuerkreuz = Pfeiltasten, A = Leertaste, B = zurück.']]
    ] },
    { id: 'welten', icon: '🗺️', title: 'Die Welten', body: [['@welten']] },
    { id: 'mitspielen', icon: '👥', title: 'Mitspielen', body: [
      ['ul', ['Hauptmenü → „👥 Mitspielen“: „Neues Spiel eröffnen“ gibt einen Code zum Teilen, „Spiel beitreten“ nimmt einen Code oder QR.', 'Fernseher-Codes im Beitreten-Feld machen das Handy automatisch zum Controller.', 'Das Kart-Spiel (anmacha-kart) hat ebenfalls einen Beitritts-Code (?join=CODE).']]
    ] },
    { id: 'hilfe', icon: '🛟', title: 'Hilfe, Eltern, Fehler melden', body: [
      ['ul', ['Eltern-Bereich: im Pause-Menü „👪 Eltern“ gedrückt halten – Lautstärke, Sparmodus, Vorlesen, Jahreszeit, Pausen-Erinnerung.', '🐞 Fehler melden (⚙️ oder Pause-Menü): kurze Beschreibung schreiben, das Spiel hängt Gerät, Welt und letzte Fehler an. „Per Mail senden“ öffnet das Mailprogramm (ricorewioriginal@gmail.com), „Kopieren“ legt den Bericht in die Zwischenablage.', '🔑 Code eingeben (⚙️): Geheimcodes für Specials und Freischaltungen (siehe Lösungsbuch).', 'Läuft etwas ruckelig: im Eltern-Bereich den Sparmodus einschalten.']]
    ] }
  ],
  loesung: [
    { id: 'reise', icon: '📖', title: 'Die Inselreise Schritt für Schritt', body: [['@reise']] },
    { id: 'freischalten', icon: '🔓', title: 'Story: Welten freischalten', body: [['p', 'Für jede Welt müssen 3 Sticker geschafft werden. Die Aufgaben stehen auch an der Glaswand, im 🧭 Wohin? und im Aufgaben-Buch.'], ['@freischalten']] },
    { id: 'geschichten', icon: '📜', title: 'Inselgeschichten', body: [['p', 'Betrittst du eine Welt, erzählt dir eine Figur dort ihre Geschichte in Akten. Jeder Akt hat ein Ziel (ein Sticker); schon Geschafftes zählt gleich mit. Pro Akt +3 ⭐, am Ende +10 ⭐ und ein Sticker. Der Aufgaben-Chip oben zeigt den nächsten Akt, solange du auf der Insel bist.'], ['@geschichten']] },
    { id: 'raetsel', icon: '🗿', title: 'Rätsel-Insel der Uralten', body: [
      ['p', 'Brücke im Süden. Zelda-/Lufia-Gefühl: Rätsel im Prüfungsturm, Dorf, Schmiede, Kapsel-Schrein und die Uralte Höhle.'],
      ['ul', ['Truhe in der Vorhalle des Prüfungsturms öffnen → Bomben.', 'Raum 1 – Block-Rätsel: den Block (Aktion „Block schieben“) zuerst nach oben, dann auf die leuchtende Platte (Lichtstrahl, Schild „Block hierher schieben!“) schieben → Tor A öffnet, dahinter die Bogen-Truhe.', 'Raum 2: mit dem Bogen den blauen Kristall treffen (von weit weg zielen) → Wasser/Tor öffnet sich.', 'Rissige Wand: in Raum 2 leuchtet an der Seitenwand eine Platte mit Rissen und dem Schild „💣 Rissige Wand“. Davorstellen, A „Bombe legen“, Abstand halten → Wand bricht, dahinter die Truhe mit dem Enterhaken.', 'Abgrund: an den Haken-Pfosten „Enterhaken“ benutzen und hinüberschwingen → Schatz des Turms.', 'Kapsel-Schrein: ein Ei wählen, Kapselmonster füttern (Futter aus Truhen/Läden) bis Stufe 5.', 'Schmiede: Schwert gegen ⭐ verbessern. Dorf: 6 Schatztruhen im Umland.', 'Uralte Höhle: Tür betreten, über die Stufen ins Mini-Spiel absteigen.']],
      ['tip', 'Der Titan Kron (Verbotener Wald) wird mit verbessertem Schwert und Kapselmonster viel leichter.']
    ] },
    { id: 'schluessel', icon: '🗝️', title: 'Schlüsselreich', body: [
      ['p', 'Mit dem Lichtschlüssel öffnest du 5 Schlüssellöcher, danach das Tor der Herzen.'],
      ['ul', ['🌴 Strand der Freunde: 5 Sternfrüchte von der krummen Palme und am Strand sammeln.', '🕰️ Dämmerstadt: Meersalz-Eis kaufen → zu Uhrmacher Tilo bringen → die Glocke am Uhrturm läuten.', '🏰 Kristall-Burg: Licht-Rätsel im Burghof (Platten in der gezeigten Reihenfolge betreten; die Folge wird jede Runde länger).', '🌲 Wald der Schatten: 8 Glühpilze sammeln. 🗼 Schleier-Turm: 3 Licht-Splitter finden.', 'Alle fünf Schlüssellöcher offen → Tor der Herzen öffnen (Feuerwerk!). Laternen anzünden (12), Ringstraße abfahren, Schlüsselschwert-Mobil fliegen.']]
    ] },
    { id: 'schwamm', icon: '🧽', title: 'Schwammi-Bucht', body: [
      ['p', 'Brücke im Norden. Unterwasser-Stadt-Gefühl mit vielen kleinen Aufgaben.'],
      ['ul', ['In der Knusper-Krabbe an der Theke essen (drei verschiedene Gerichte → „Stammgast“); dort gibt es auch das Burger-Mini-Spiel.', 'An Schwammis Fruchthaus klingeln, Sternchens Stein hochheben, bei Plankto am Eimerchen vorbeischauen.', 'Quallen fangen (5), Karate bei Sunny (10×), Wannen-Mobil im Heldenheim fahren.', 'Die Häuser der Bucht lassen sich betreten (Truhen!).']]
    ] },
    { id: 'maerchen', icon: '🎠', title: 'Märchenland', body: [
      ['p', 'Brücke im Nordwesten. Märchenpark mit Schloss, Basar, Taxi und Umzug.'],
      ['ul', ['Karussell, Schwanenboot (Perlenlagune), Eisrutsche vom Frostgipfel, Schloss-Show am Pult vor dem Schloss, Umzug (8 Sekunden bei den Wagen bleiben).', 'Wunschbrunnen: 3 Wünsche (+1 ⭐ je Wunsch). Feenstaub von Fee Glimmer holen und fliegen. Greifer im Spielzeug-Land: 5 Gewinne.', 'Basar mit Zelten und Händler Aladin; Taxi fährt zwischen den Orten. Stempelheft: 10 Orte besuchen.']]
    ] },
    { id: 'weitere', icon: '🌊', title: 'Weitere Welten', body: [
      ['ul', ['🏖️ Badestrand: Meer, Wasserrutsche, Hüpfburg, Rutschen-Sticker.', '🔱 Atlantis (Treppe nach unten an der Küste): Hologramm-Archiv, Stufenberg, Kristall-Harfe, Schwerelos-Halle, Aqua-Gleiter.', '🦊 Zotik – Lunaris: Quest „Der Ruf des Kristalls“ (Mira → Hinweis im Hafen → Riss an der Akademie → Bericht).', '📻 Funkwelle: 13 Sender je 20 Sekunden hören (+1 ⭐, alle +10 ⭐).', '🐉 Drachenhöhen: Fackeln, Kristall-Freunde, Flugringe, Himmelstor „Drachenflug“.', '🚢 Dampfer-Hafen: Farbeimer, Orchester, Noten, Stummfilm. 🏗️ Bauland: Blöcke bauen, Startblock. ⚽ Fußball-Arena: Tore schießen, Turnier.', '🗺️ Schatzsuche: mit Schatzmeister Piet reden und alle 8 Kisten finden.']]
    ] },
    { id: 'taschi', icon: '🔴', title: 'Taschi-Land: fangen, kämpfen, Orden', body: [
      ['p', 'Brücke im Osten. Hier leben Taschis – freundliche Taschenwesen. Ziel der Insel: 8 Orden sammeln und Taschi-Meister werden.'],
      ['ul', ['🔬 Professor Ulme (Labor, große Statue auf dem Platz): Erstes Taschi wählen (Glutzahn 🔥, Samenling 🌿 oder Plätscherchen 💧), Taschidex, Orden, Geschenke.', '🌿 Hohes Gras (4 Zonen: Blumenwiese, Teichufer, Felsgrat, Glut-Hügel): wilde Taschis erscheinen. Fangen mit Taschibällen 🔴 – je weniger Lebenspunkte, desto besser klappt es.', '⚔️ Kampf: abwechselnd. Wähle Attacke, Beutel (Bälle, Tränke), Team oder Flucht. Typen: 🔥 schlägt 🌿, 🌿 schlägt 💧, 💧 schlägt 🔥🪨, ⚡ schlägt 💧🕊️, 🪨 schlägt 🔥🕊️, 🕊️ schlägt 🌿, 👻 schlägt 👻.', '⬆️ Level & Entwicklung: Gewinner bekommen EP, steigen auf und entwickeln sich. Fellino wird mit einem Stein zu Wellino, Flamino, Blitzino oder Laubino.', '💖 Heilhaus (Schwester Hanna) heilt dein Team gratis. 🛒 Fangladen: Bälle, Tränke, Steine für Sterne. Wird dein Team müde, wachst du im Heilhaus auf.', '🏟️ Arena: Fels-Fiete, Perla, Käpt’n Volt, Blüte – jeder gibt einen Orden. Meisterin Aurelia wartet erst, wenn du 7 Orden hast.', '🎈 Team Funke (Jette, Jim, Mauzi) im Lager hinten: drei Kämpfe in Folge, dann gehört dir ihr Heißluftballon (Fahrzeug).', '💛 Freunde: Blitzi, Fellino, Flamino & Co. laufen auf dem Platz herum. Sie sind nie Gegner – streicheln erlaubt!']],
      ['p', 'Die 8 Orden: 🔴 Fang · 🪨 Fels · 💧 Perlen · ⚡ Funken · 🌿 Blüten · 📘 Forscher (8 Taschis) · 🎈 Ballon (Team Funke) · 👑 Meister. Alles hier ist selbst erfunden – inspiriert von klassischen Sammel-Rollenspielen.']
    ] },
    { id: 'aufgaben', icon: '📋', title: 'Alle Aufgaben der Welten', body: [['@aufgaben']] },
    { id: 'sticker', icon: '🏅', title: 'Alle Sticker', body: [['p', 'So bekommst du jeden Sticker:'], ['@sticker']] },
    { id: 'codes', icon: '🔑', title: 'Geheimcodes', body: [['p', 'Eingabe über ⚙️ → „🔑 Code eingeben“ (Groß-/Kleinschreibung egal). Specials lassen sich mit demselben Code wieder ausschalten.'], ['@codes']] },
    { id: 'tricks', icon: '💡', title: 'Tipps und Tricks', body: [
      ['ul', ['Sterne sparen: erst Aufgaben und Tagesgeschenk, dann einkaufen.', 'Schnell reisen: 🧭 Wohin? → ✨ (im Story-Modus nur zu offenen Welten).', 'Truhen in Häusern öffnen – jedes Haus hat eine, 10 Truhen geben einen Sticker.', 'Futter für das Kapselmonster: in Häusern (Tisch, Truhen) und im Laden.', 'Zwei Aktionen in der Nähe? A = erste, X = zweite Aktion.', 'Hängt etwas? 🐞 Fehler melden hilft bei der Weiterentwicklung.']]
    ] }
  ],
  /* Kurze Beschreibung je Welt (Schlüssel = BI.<KEY>), für Handbuch „Die Welten“ */
  welten: {
    CITY: 'Große Stadt mit Hochhäusern, Läden und Verkehr – alle Gebäude sind begehbar.', PUPS: 'Fellretter-Bucht: Einsatz-Tafel und Rettungs-Einsätze mit den Fellrettern.', RAINBOW: 'Regenbogeninsel: eine bunte Insel zum Entdecken.',
    DAMPF: 'Dampfer-Hafen: Schiff, Orchester, Farbeimer und Freiluftkino.', DRACHEN: 'Drachenhöhen: Aufwind, Flugringe, Kristall-Freunde und das Himmelstor.', PARK: 'Freizeitpark: Attraktionen fahren, Park bauen und verwalten (Park-Büro).',
    FUSSBALL: 'Fußball-Arena: Tore schießen und Turniere gewinnen.', BAULAND: 'Bauland: eigene Häuser aus Blöcken bauen, Pixel-Plan-Automat.', MAERCHEN: 'Märchenland: Schloss, Karussell, Basar, Taxi, Umzug und viel Mitmachen.',
    SCHLUESSEL: 'Schlüsselreich: Lichtschlüssel, Schlüssellöcher, Tor der Herzen.', SCHWAMM: 'Schwammi-Bucht: Unterwasser-Stadt mit Knusper-Krabbe und Fruchthaus.', RAETSEL: 'Rätsel-Insel der Uralten: Prüfungsturm, Kapselmonster, Schmiede, Uralte Höhle.',
    ZOTIK: 'Zotik & Lunaris: Mond-Welt mit Luftschiff, Quest und Elementar-Kampf.', RADIO: 'Funkwelle: 13 Radiosender, Visual Radio, Noten sammeln.', TASCHI: 'Taschi-Land: Taschis fangen, rundenweise kämpfen, Arena und 8 Orden sammeln.', ATLANTIS: 'Atlantis: versunkene Stadt mit Hologramm-Archiv, Harfe und Aqua-Gleitern.'
  }
};
