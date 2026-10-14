# Bestandsaufnahme: Bunte Insel 1 (Grundlage für Bunte Insel 2)

Stand der Analyse: Oktober 2026, Commit `d7b6a47` des Repos `easygames`, Ordner `/bunte-insel/`.
Quellen: der tatsächliche Code (`js/*.js`, 86 Module, ≈18 200 Zeilen, `main.js` allein 2 530 sehr lange Zeilen / 312 KB), `README.md`, `CLAUDE.md`, `docs/HANDBUCH.md`, `docs/LOESUNGSBUCH.md`, `tests/*.mjs`.

## 1. Technik des Originals

| Bereich | Befund |
|---|---|
| Engine | Three.js **r128** als klassisches Skript (`vendor/three.min.js`), globaler Namensraum `BI` |
| Code | ES5-ähnliches, sehr dicht geschriebenes JS ohne Build; ein Monolith `main.js` (312 KB) plus 85 Modulen, die alle über `BI.*` gekoppelt sind |
| Laden | 86 Skript-Tags, Ladebalken über einen **manuell gepflegten Zähler** (`all=`) – Fehlerquelle für „hängt beim Laden“ (eigener Test `tests/laden.mjs` existiert genau deshalb) |
| Welt | Alles in einer Szene: Hauptinsel (R = 190 m) + 18 weitere Inseln bis x = 1 200 m; statische Geometrie als gebündelte Vertexfarben-Meshes, Bäume als Instanzen, keine Schattenkarten |
| Speichern | `localStorage`, 3 Slots: `bunteInsel.save` (Slot 1), `bunteInsel.s2.save`, `bunteInsel.s3.save` + `build`, `photos`, `art`; Meta `bunteInsel.meta`. Kein Versionsfeld, „nur Felder ergänzen“ als Regel |
| Steuerung | Touch-Joystick + Knopf-Raute (A/X/Y/B), Tastatur (frei belegbar, `keys.js`), Gamepad (`gamepad.js`) |
| Audio | Musik komplett im Browser erzeugt (`audio.js` + `themes.js`, eigene Kompositionen je Welt), 20 CC0-Geräusche in `sounds/` |
| Mehrspieler | WebRTC über **PeerJS** (öffentlicher Vermittlungsserver), bis 4 Geräte, Code + QR; TV-Modus mit Handy als Controller (`tv.js`, `controller.html`) – kein eigenes Backend |
| PWA | `sw.js` (Netz zuerst, Cache `eg-bunte-insel-v8`), `manifest.webmanifest`, Icons in `/pwa-icons/` |
| Tests | 45 Playwright-Skripte (`tests/*.mjs`), je Welt einer |

## 2. Welten und Inseln (tatsächlich im Code vorhanden)

Koordinaten aus den `BI.<WELT>`-Objekten (x/z in m, R = Radius).

| # | Welt (Code-Schlüssel) | Lage | Inhalte laut Code |
|---|---|---|---|
| 1 | **Hauptinsel** (`world.js`, `main.js`) | Mitte, R 190 | Ort mit Rathaus, Schule, Polizei, Feuerwehr, Krankenhaus + Landeplatz, Eisdiele, Spielzeugladen (Frau Bunt), Wohnblock „Haus Sonnenschein“ (4 Wohnungen, Kinderzimmer, Bett, Kleiderschrank, Garten), Bauernhof (Bauer Heinz, Felder, Streichelzoo, Hofküche, Hofladen), Freibad (Herr Fischer), Badestrand & Wasserpark (Bademeisterin Maja), Park mit Spielplatz, Piratenschiff-Spielplatz, Schießbude (Herr Hannes, nur Attrappen), Kino + Autokino, Camp mit Lagerfeuer, Leuchtturm, See mit Enten, Steg + Segelboot, Schienenring mit 4 Bahnhöfen + Zug, Himmels-Parcours, **Kampfarena** (Kampfmeister Kai), **Verbotener Wald** (Norden) |
| 2 | Stadtinsel (`CITY`) | Nord (0,−290), R 62 | Brunnen, Uhrturm, Skyline, 8 Läden (Supermarkt, Bäckerei, Blumen, Apotheke, Café, Bücherei, Tierhandlung, Kleider), begehbare Häuser, Hochhäuser |
| 3 | Fellretter-Bucht (`PUPS`) | Süd (−90,275), R 52 | Bellwarte mit 7 Hallentoren, 7 Rettungshunde mit Fahrzeugen, goldene Statue „Jannis & Blitz“, Sonnenbucht, Einsatz-Tafel (12 Einsätze in andere Welten), Fellnasen-Mobil |
| 4 | Regenbogenwelt (`RAINBOW`) | West (−285,20), R 46 | Plaza mit Brunnen „Freude teilen“, Familien (zwei Mamas, zwei Papas …), Lehrer Leo, Regenbogen-Bühne, Pride-Parade, Pride-Disco-Rhythmusspiel |
| 5 | Dampfer-Hafen (`DAMPF`) | Nordwest (−262,−135), R 48 | Schwarz-Weiß-Welt der 1920er, Dampfer-Willi (gemeinfreie Maus-Vorlage von 1928, bewusst neutralisiert), 6 Farbeimer, Orchester (6 Instrumente), 8 Noten, Dampfer „Brummel“, Stummfilm-Kino, Hafen-Kran-Spiel |
| 6 | Drachenhöhen (`DRACHEN`) | Süd (100,275), R 48 | Drache Zündel (Begleiter), 6 Fackeln → Himmelstor → Drachenflug, 6 Kristall-Freunde, Funkelsteine, Aufwinde, Flugringe, Drachenflügel (Gleiten), Reit-Drache, Drachenhöhle (Höhlenforscherin Flora) |
| 7 | Freizeitpark (`PARK`) | Ost (285,20), R 56 | Park-Tycoon (Wege, Buden, Karussell, Riesenrad, Achterbahn, Forschung, 13 Missionen), Autoscooter, Dosen-Knall |
| 8 | Fußball-Arena (`FUSSBALL`) | Südwest | Stadion, Torwarte, Turnier gegen Roboter (Kapitän Jannis, Trainerin Lena) |
| 9 | Märchenland (`MAERCHEN`) | Nordwest, R ≈ 78 | Schloss „Sternenglanz“ (Prinzessin Lilia, Königin Aurelia, Thronsaal), Frostgipfel, Königsfels, Piratenschiff, Perlenlagune, Wüsten-Basar, Dschungel/Honigwald, Spielzeug-Land, Gruselhügel, Strand der Träume, Roboter-Ecke, Nimmerland (Feenstaub-Schweben), Karussell, Schwanenboot, Eisrutsche, Schloss-Show, Umzug, Stempelheft, 33 Figuren |
| 10 | Bauland (`BAULAND`) | Nordost, R 150 | Werkbank, Block-Bauen (30 Blocksorten, Voxel), Pixel-Plan-Merkspiel |
| 11 | Schlüsselreich (`SCHLUESSEL`) | West | Statue Lichtwanderer Lio, 5 Schlüssellöcher (Strand der Freunde, Dämmerstadt, Kristall-Burg mit Licht-Rätsel, Wald der Schatten mit 8 Glühpilzen, Schleier-Turm), Lichtzauber (12 Laternen), Tor der Herzen, Wuschel-Laden, Schlüsselschwert-Mobil |
| 12 | Wunsch-Insel (`WUNSCH`) | hinter dem Schlüsselreich | 3 Wunschfrüchte, geheime Schlucht (5 Wandzeichen in Reihenfolge), Floß aus 6 Teilen, Aussichtsturm, Truhen, Sternscherben, Schattenarena mit Endgegner Umbra (Kira, Silvan) |
| 13 | Schwammi-Bucht (`SCHWAMM`) | hoher Norden | Unterwasser-Stadt-Insel: Schwammi, Sternchen, Tadeus Tintenfuß, Sunny, Käpt'n Zangenfuß, Plankto; Knusper-Krabbe (Restaurant, Burger braten), Quallenfischen, Wannen-Mobil |
| 14 | Rätsel-Insel der Uralten (`RAETSEL`) | Südwest | Prüfungsturm (Truhen → Bomben, Bogen, Kristall, Enterhaken; Block-Rätsel), Kapselmonster (5 Stufen), Schmiede (Schwert Holz → Titan), Uralte Höhle, Titanen-Festung (Held Milo, Sela, Gunnar, Arto, Pim, Brokk) |
| 15 | Zotik – Lunaris (`ZOTIK`) | Süd (0,380), R 70 | Mondkristall-Brunnen, Markt „Wanderhand“ (Rurik), Burg auf 8-stufigem Hügel, Akademie, Hafen, Luftschiff Nautilux, Quest „Der Ruf des Kristalls“ (Mira), Weltentore, 64 Splitter, Moosling Felli, Tor ins eigene Zotik-Spiel |
| 16 | Funkwelle / Radio-Insel (`RADIO`) | Südost (240,184), R 64 | Funkturm, 13 Sender-Plätze mit Live-Streams (laut.fm), Visual Radio, Noten sammeln, Frequenz-Dreher |
| 17 | Atlantis (`ATLANTIS`) | unterirdisch (x 1 200), Eingang Steintreppe Südküste | Ringe aus Land und Wasser, Tempel, Herz von Atlantis, Aqua-Gleiter, Schwerelos-Halle, Kristall-Harfe (8 Kristalle), Hologramm-Archiv, 72 Orichalcum-Splitter, Strömungs-Rätsel |
| 18 | Taschi-Land (`TASCHI`) | Ost | 28 Taschi-Arten, Professor Ulme, Heilhaus (Hanna), Fangladen, hohes Gras, Fang mit Taschibällen, Rundenkämpfe, Entwicklung, Arena mit 5 Trainern, Team Funke + Funken-Ballon, 8 Orden |
| 19 | Hüpfland (`HUEPF`) | West (−560,180), R 85 | Dino Tupfi (Reittier), Röhren-Paare, Sternblöcke, Flitzer-Kart-Rennen (Ferdi, Pia, Pelle), Felsenkönig Brocko, Dino-Oma Mira |
| 20 | Prisma-Archipel (`PRISMA`) | Nordost (540,−380), R 92 | Ki-Garten, Runen-Arena, Datenhain – **jeweils dasselbe Drei-Farben-Pylon-Rätsel** (`prisma.js`), 3 Themenautos (Ki-Blitz-Roadster, Runen-Duell-Coupé, Datenhain-Buggy) |

## 3. Figuren, Begleiter, Fahrzeuge

- **Spielfigur:** Jannis (blonder Pilzkopf) oder eigener Held; Charakter-Studio mit Alter, Größe, Körperform, 13 Hautfarben, 23 Frisuren, 18 Haarfarben, Bart, Brillen, Kleidung, 18 Hüten, 20 Vorlagen (Oma Gerda, Ninja Kai, Prinzessin Lilly …), Outfits.
- **Begleiter:** Polizeihund **Blitz** (Tricks, Apport, „Blitz such!“), Ballon **Pappnase**, Haustiere (Bello, Mieze, Hoppel, Schnuffel, Rexi), Maskottchen-Partner Zündel, Willi, Felli, Kapselmonster, Taschis.
- **Wichtige NPCs Hauptinsel:** Bürgermeisterin Rosi (Inselreise), Bauer Heinz, Frau Bunt, Herr Hannes, Herr Fischer, Bademeisterin Maja, Schatzmeister Piet, Kampfmeister Kai, Mama & Papa.
- **Fahrzeuge (35 Typen in `vehicles.js`):** Auto, Taxi, Autoscooter, Motorrad, Polizeiauto, Krankenwagen, Feuerwehr, Bus, Traktor, Mähdrescher, Fahrrad, Tretroller, Rollator, Skateboard, Aufsitzmäher, RC-Auto, Segelboot, RC-Hubschrauber, Hubschrauber, Schlüsselschwert-Mobil, Reit-Drache Zündel, Fellnasen-Mobil, Wannen-Mobil, Aqua-Gleiter, Floß, Funken-Ballon, Nautilux, Limousine, Rutschauto, Flitzer-Kart, Dino Tupfi, Eiswagen, Ki-Blitz-Roadster, Runen-Duell-Coupé, Datenhain-Buggy – dazu der Zug.

## 4. Spielsysteme

| System | Umsetzung im Original |
|---|---|
| Story | „Die Inselreise“ (`story.js`): 9 Kapitel × 3 Ziele, Rosi; jedes Ziel = ein Sticker („einmal X tun“). „Inselgeschichten“ (`inselstory.js`) je Welt. Story-Modus (`storymode.js`) sperrt Inseln hinter Glaswänden, bis 3 Sticker gesammelt sind |
| Freie Welt | alles offen, gleicher Spielstand wie Story |
| Quests | Sticker-Album (≈ 120 Sticker), Tagesaufgaben, Hof-Aufgaben, Fellretter-Einsätze, Park-Missionen, Aufgaben-Log `tasklog.js` |
| Kampf | `combat.js`: Kampfarena (Duell, Monster-Wellen) **und** Verbotener Wald (freie Kämpfe, Bosse Waldgeist, Dunkelriese, Großer Klecks, Plankto-Roboter, Titan Kron). Zusätzlich Schattenarena auf der Wunsch-Insel, Elementar-Kampf (Zotik), Taschi-Rundenkämpfe |
| Sammeln | Sterne ⭐ als Hauptwährung, Weltwährungen (Funkelsteine, Splitter, Orichalcum, Noten → Sterne), Sammelbuch (Angeln, Käfer, Buddeln, 42 Einträge), Schatzsuche |
| Bauen | Bauen wie bei den Sims (4-m-Raster), Block-Bauen im Bauland, Umzug der Wohnung, Zimmer einrichten, Garten |
| Mini-Spiele | > 30 (Ballon-Pop, Memory, Heli-Rettung, Taxi-Rush, Pride-Disco, Hafen-Kran, Pixel-Plan, Drachenflug, Elementar-Kampf, Strömungs-Rätsel …) |
| Navigation | „Wohin?“-Menü mit 5 Reitern, „👣 Weg zeigen“ + „✨ Hinzaubern“, Minikarte, Bild-Tafeln mit Vorlesen |
| Kinderfreundlich | Vorlesen (Browser-Stimme), Bilder statt Text, Eltern-Bereich, Pausen-Erinnerung |

## 5. Festgestellte Probleme (Code-Befund)

1. **Monolith & globale Kopplung:** `main.js` mit 312 KB; Module greifen kreuz und quer über `BI.*` und `G.*` zu – Änderungen sind riskant.
2. **Laden:** 86 einzelne Skripte und ein handgepflegter Ladezähler – bekannter Grund für hängende Ladebalken.
3. **Flache Aufgabenlogik:** Fast alle Ziele sind „tu X einmal“ (Sticker). Die Story-Kapitel sind Checklisten ohne erzählerische Konsequenz.
4. **Prisma-Archipel:** drei Zonen mit **identischer Mechanik** (drei Farb-Pylone in Reihenfolge) – genau die im Auftrag beschriebene Schwäche.
5. **Kampfregel nicht eindeutig:** Gekämpft wird neben dem Verbotenen Wald auch in der Kampfarena, der Schattenarena (Wunsch-Insel), beim Elementar-Kampf und in Taschi-Rundenkämpfen.
6. **Story-Modus sperrt über Sticker,** die thematisch nichts mit der gesperrten Welt zu tun haben (z. B. Atlantis über „Schmied“).
7. **Kein versioniertes Speicherformat,** keine Migrationen; Slot 1 nutzt historische Schlüssel ohne Präfix.
8. **Sehr viele kleine Einzelsysteme** statt wiederverwendbarer Bausteine (jede Welt hat eigene Interaktions- und Fortschrittslogik).

## 6. Zuordnung: Originalwelt → Bunte Insel 2

Format: Originalwelt → BI2-Version → erhaltene Merkmale → neue Spielmechaniken → verbesserte Geschichte.

| Original | Bunte Insel 2 | Erhalten | Neue Mechaniken | Geschichte |
|---|---|---|---|---|
| Hauptinsel | **Hauptinsel Sonnenhafen** (Mittelpunkt) | Ort mit Rathaus/Polizei/Feuerwehr/Krankenhaus, Haus Sonnenschein, Bauernhof, Freibad, Badestrand, Leuchtturm, See, Steg, Schienenring mit Zug, Piratenschiff, Camp, Spielzeugladen | Begehbare Häuser mit echten Interaktionen, Zugstrecke als Rundfahrt, Feuerwehr-Löscheinsätze, Bauernhof-Pflege, Angeln/Käfer/Buddeln, Schnellreise-Steine | Prolog: Der Regenbogen-Kompass im Leuchtturm zerbricht – Auslöser der Hauptgeschichte |
| Verbotener Wald | **Verbotener Wald** (Nordteil der Hauptinsel) | Einziger Kampfort, Gegner aller Welten, Bosse, Herzen | Echtzeit-Kampf mit Kombo, Ausweichen, Block, Lichtwelle, Zielauf­schaltung, Gegner-KI (Jäger, Stürmer, Fernwerfer, Springer), Bosse mit Phasen | Finale der Geschichte (Grauschleier-Riese, Wolkenwesen Flick) |
| Kampfarena | **Trainings-Lichtung im Verbotenen Wald** | Kampfmeister Kai | Übungskämpfe – die Arena zieht in den Wald, damit die Kampfregel eindeutig ist | Kai bildet den Spieler vor dem Finale aus |
| Stadtinsel | **Stadtinsel** | Brunnen, Uhrturm, Läden, Skyline | Ladenstraße mit echtem Einkauf, Uhrturm-Rätsel (Uhrzeiger stellen), Bus | Kapitel 2: Die Stadt hat ihre Zeit vergessen |
| Fellretter-Bucht | **Fellretter-Bucht** | Bellwarte, 7 Rettungshunde, Statue Jannis & Blitz, Fellnasen-Mobil | Einsätze mit Spürnase (Duftspur folgen), Welpen finden | Kapitel 2: verschwundene Welpen |
| Regenbogenwelt | **Regenbogenwelt** | Plaza, Familien, Lehrer Leo, Bühne, Parade, Botschaft „Jeder ist richtig, wie er ist“ | Erinnerungs-Fotoalbum (Fotos an den richtigen Orten), Tanz-Rhythmus an der Bühne | Kapitel 4: Der Grauschleier lässt Familien ihre gemeinsamen Erinnerungen vergessen |
| Dampfer-Hafen | **Dampfer-Hafen** | Schwarz-Weiß-Optik, Dampfer-Willi, Farbeimer, Orchester, Dampfer Brummel | Farbe zurückbringen färbt die Welt live ein, Orchester als Hör-Merkspiel | Kapitel 3 |
| Drachenhöhen | **Drachenhöhen** | Zündel, Fackeln, Himmelstor, Kristall-Freunde, Drachenflügel, Reit-Drache | Fackeln in der Reihenfolge der Wandbilder, Gleiten als freischaltbare Fähigkeit, Aufwind-Flug | Kapitel 3 |
| Freizeitpark | **Freizeitpark** | Karussell, Riesenrad, Achterbahn, Autoscooter, Dosenwerfen | Zahnräder in Fahrgeschäft-Prüfungen gewinnen, Fahrgeschäfte reparieren | Kapitel 4 |
| Fußball-Arena | **Fußball-Arena** | Stadion, Torwart, Turnier, Trainerin Lena | Elfmeter-Turnier mit Ziel und Kraft | Kapitel 4 |
| Märchenland | **Märchenland** | Schloss Sternenglanz, Frostgipfel, Wunschbrunnen, Nimmerland-Feenstaub, Prinzessin Lilia | Feenstaub-Schweben, Stempelheft, Eisrutsche | Kapitel 5 |
| Schlüsselreich | **Schlüsselreich** | Statue Lio, Schlüssellöcher, Laternen, Tor der Herzen, Glühpilze | Fähigkeit **Lichtzauber** (Laternen, verborgene Wege) | Kapitel 5 |
| Wunsch-Insel | **Wunsch-Insel** | Wunschfrüchte, geheime Schlucht mit 5 Wandzeichen, Floß, Aussichtsturm | Floß bauen aus gefundenen Teilen, Zeichen-Rätsel; die Schattenarena zieht in den Verbotenen Wald | Kapitel 5 |
| Schwammi-Bucht | **Schwammi-Bucht** | Knusper-Krabbe, Schwammi, Sternchen, Tadeus, Plankto | Burger-Bestellungen als Merkspiel, Quallen fangen | Kapitel 6 |
| Atlantis | **Atlantis** (Tiefenkuppel, Eingang Südküste) | Ringstadt, Kristall-Harfe, Hologramm-Archiv, Aqua-Gleiter | Harfen-Melodie nachspielen, Strömungsweg | Kapitel 6 |
| Funkwelle | **Funkwelle** | Funkturm, Sender-Plätze, Noten sammeln | Frequenz einstellen (Timing), Noten-Sammeln; Live-Radio optional | Kapitel 6 |
| Zotik – Lunaris | **Lunaris** | Mondkristall-Brunnen, Burghügel, Mira, Rurik, Nautilux, Splitter | Weltentore als Schnellreise, Mondkristall-Rätsel | Kapitel 7 |
| Taschi-Land | **Taschi-Land** | Professor Ulme, hohes Gras, Taschis, Arena | Taschis durch Vertrauen gewinnen (kein Kampf), Kunststück-Wettbewerb statt Rundenkampf | Kapitel 7 |
| Hüpfland | **Hüpfland** | Dino Tupfi, Röhren, Sternblöcke, Flitzer-Kart, Felsenkönig Brocko | Sternblöcke von unten, Röhren-Reise, Kart-Runde | Kapitel 7 |
| Bauland | **Bauland** | Werkbank, Block-Bauen | Bauplätze mit Bauplan, Block-Bauen | Kapitel 7 |
| Rätsel-Insel | **Rätsel-Insel der Uralten** | Prüfungsturm, Block-Rätsel, Werkzeuge, Schmiede, Kapselmonster | Schiebe-Rätsel, Werkzeuge (Knallbeeren, Enterhaken), Schwertschmiede (Wirkung nur im Wald) | Kapitel 7 |
| Prisma-Archipel | **Prisma-Insel** (eine große Insel) | Prisma-Stadt, Ki-Garten, Runen-Arena, Datenhain, 3 Themenautos | **Ki-Garten:** Energie-Aufladen, Ki-Sprung, Flugringe, Hindernis-Turnier · **Runen-Arena:** eigenes Kartenspiel mit Deck, Holo-Kreaturen, Turnier · **Datenhain:** Begleiter-Pflege, Entwicklung, seltene Kreaturen | Kapitel 7 |

Alle Original-Welten kommen in Bunte Insel 2 vor; nichts wird stillschweigend gestrichen. Was in BI2 (noch) nicht in voller Breite des Originals umgesetzt ist, steht in `STATUS.md`.
