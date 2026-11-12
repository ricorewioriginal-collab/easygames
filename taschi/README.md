# TASCHI – Die 16 Lichter

Eigenständiges 3D-Sammelrollenspiel im [easygames-Repository](https://github.com/ricorewioriginal-collab/easygames) nach der eigens entwickelten Taschi-Land-Idee aus Bunte Insel. Die Dateien liegen ausschließlich unter `taschi/`. Das Originalspiel wird nicht verändert.

## Spiel starten

Im GitHub-Pages-Repository: `https://ricorewioriginal-collab.github.io/easygames/taschi/`

Alternativ aus dem Repository-Hauptverzeichnis:

```bash
python3 -m http.server 8080
# Im Browser: http://localhost:8080/taschi/
```

Die Three.js-Version wird **lokal aus `../bunte-insel/vendor/three.min.js`** eingebunden. Beim Deployment muss daher die entsprechende Verzeichnisstruktur samt dieser Vendor-Datei bestehen bleiben. Kein externes Three.js-CDN notwendig; die Spielstanddaten liegen im Browser.

## Neuer Start- und Synchronisationsablauf

Beim Laden erscheint jetzt zuerst ein eigener Titel-/Ladebildschirm. Danach gibt es **Abenteuer beginnen**, **Abenteuer fortsetzen**, **Neues Abenteuer** und die Auswahl der drei Speicherplätze. Das Hauptmenü integriert den vorhandenen gemeinsamen Cloud-Speicher aus `../cloud/anmacha-cloud.js` mit `data-game="taschi"` und dem lokalen Prefix `easygames.taschi.eight-lights.v1`. Bei Google-Anmeldung benutzt Taschi somit dieselbe Infrastruktur wie Bunte Insel. Cloud-Sync setzt eine erreichbare Firebase-Konfiguration, erfolgreiches Login und Netzwerk voraus; ohne Google-Anmeldung bleibt lokal gespeicherter Fortschritt verfügbar.

Die 3D-Lichtintensität und Kameradistanz sind für mobiles Spielen reduziert, und die Oberwelt besitzt prozedurale Texturen für Gras und Wege, acht speicherbare Trainer-Duelle sowie eine kreisrunde Live-Minikarte. Im Kampf gibt es ein vierteiliges Aktionsmenü (Kampf / Fangbeutel / Taschis / Flucht) und ein separates Attacken-/Gegenstandsmenü. Beim Start führt Professor Ulme durch die Einführung und die Starterwahl. Eine vollständige Geräteprüfung ist weiterhin erforderlich.

## Großes Spielupdate (16. Oktober 2026)

- **Wiesen mit hohem Gras:** Jede Region hat jetzt 6 bis 12 große, unregelmäßige Wiesen entlang der Routen und in den Seitenfeldern (vorher nur wenige kleine Flecken). Wege und Wasser schneiden das Gras aus, sodass man wie im Vorbild wählen kann: über den Weg oder durchs Gras. Am Ufer wachsen Schilfwiesen mit Wasser-Taschis, Blumenwiesen haben eigene Bewohner. Grasdichte richtet sich nach der Grafikstufe.
- **Größere begehbare Welt:** Die Regionen sind fast doppelt so groß (260 statt 200 Einheiten, gleiche Geländeauflösung). Tore liegen weiter außen, dazwischen neue Routenabschnitte mit Wiesen. Alte Spielstände bleiben gültig; landet eine gespeicherte Position in einem Baum, startet man am Heilzentrum.
- **11 Kapselsorten:** Taschi-Kapsel, Heilkapsel (heilt das gefangene Taschi), Superkapsel, Netzkapsel (×3 bei Wasser/Pflanze), Flinkkapsel (×4 in Runde 1), Dämmerkapsel (×3 nachts und in Höhlen), Freundkapsel (sofort hohe Freundschaft), Levelkapsel (bis ×4, wenn dein Taschi höher ist), Timerkapsel (wird pro Runde besser), Sternkapsel und ein einmaliger Meisterkapsel (Geschenk von Brix). Heil- und Taschibälle gibt es ab Start, die übrigen mit den ersten Siegeln. Jeder Ball hat seine eigene Farbe im Kampf.
- **Drei Entwicklungsstufen:** Alle Starter und Original-Linien haben jetzt drei Stufen (z. B. Glutzahn → Glutdrach → Magmadrach, Plätscherchen → Krustomar → Gezeitenlon, Samenling → Blütling → Florakron, Pelzlo → Fellisto → Fellmajor). Dazu acht neue Familien mit je drei Stufen (Flöckchen, Buddelmaus, Wuschelschaf, Glimmstein, Tröpfli, Laternchen, Summbit, Pilzling). **260 Arten**, 81 Linien mit drei Stufen.
- **Leveln und Attacken:** 28 neue Attacken, jede Art lernt über die Level eine vollständige Typ-Reihe plus Attacken ihres zweiten Typs. EP skalieren wie im Vorbild nach Levelunterschied (schwächere Taschis holen schneller auf), gute Freundschaft gibt 20 % mehr EP, Level-ups zeigen die Wertzuwächse. Bei vier Attacken fragt das Spiel, welche vergessen werden soll – auch nach Entwicklungen, die neue Attacken mitbringen. Unter **Team → Taschi → Attacken verwalten** lassen sich Attacken vergessen und beim **Attacken-Erinnerer** (★80) früher verpasste Attacken neu lernen. Neues Item **EP-Bonbon** (ein Level, inklusive Entwicklung).
- **Rivale Rian:** Rian wählt das Taschi, das gegen deinen Starter im Vorteil ist, und fordert dich bei Ankunft in Korallküste, Käferwald, Nebelmoor, Kristallberg und Himmelskrone heraus. Das Team wächst mit, die Geschichte führt von Konkurrenz über die Schattengilde bis zum gemeinsamen Weg zum Sternengipfel.

Geprüft: `npm test` (31 Tests inklusive Durchlauf-Simulation bis zum Sternenmeister) sowie die Browsertests `tests/e2e/intro.mjs` und `tests/e2e/expansion.mjs` (Gras-Begegnung, Ballauswahl, Attacken vergessen/erinnern, EP-Bonbon mit Entwicklung, Rivalenkampf) ohne Browserfehler. Ein Test auf echten Handys steht weiterhin aus.

## Switch-Features: Foto, Fliegen, Raids, Koop, Stimmen (November 2026)

- **📷 Fotomodus** (`src/ui/photo.js`, Menü › Team): freie Kamera (`world.photo`, `photoCamera`), Filter, Posen, Rahmen; Fotos als JPEG im Album (`taschi.photos.v1`, die letzten 12), speichern oder teilen.
- **🕊 Fliegen** (`Ride.flyMount`, `game.flyMenu`/`flyTo`): ab 5 Siegeln mit einem Flug-Taschi zu jedem besuchten Heilzentrum, Aufstieg und Landung über `world.lift`.
- **⭐ Sternennest-Raids** (`src/logic/raid.js`): ein Nest je Region (`L.nest`), täglich ein Riese in Endform (1–5 Sterne, KP ×3–6 über `m.boss`, zwei Aktionen pro Runde). Doppelkampf mit Ranger-Helfer (`m.ally`, wählt per KI) oder Freund online; danach Belohnung und sicherer Fang.
- **🤝 Koop-Erkunden** (`src/game/coop.js`): Im Online-Menü „Zusammen erkunden“ – die Verbindung bleibt offen, beide sehen sich in derselben Region (Namensschild), können winken, wieder tauschen/kämpfen und gemeinsam Raids bestreiten (gemeinsame KP über `raidDmg`).
- **🎲 Zufallstausch** (`src/ui/wonder.js`): Partnersuche über feste Tauschplätze (`taschi-wonder-v1-0…5`) mit `Link.joinAt`/`hostAt`, vermittelt über `cloud/fire-peer.js`.
- **🗣 Sprachausgabe** (`src/core/voice.js`): Jede Figur hat ein eigenes Stimmprofil (`CAST` bzw. aus Name/Titel: Geschlecht, Alter, Klangfarbe, Tonhöhe, Tempo, Stimmung je Zeile). „🗣 Sprache“ nutzt die Web Speech API und wählt pro Figur eine passende deutsche Systemstimme; „💬 Plappern“ erzeugt Silbenlaute per WebAudio (Fallback ohne Sprachausgabe). Optionen › Audio (`voice`: true/'babble'/false, `voiceVolume`, `voiceRate`, Stimmprobe). **🐾 Taschi-Rufe** (`src/core/cries.js`): eigener Ruf je Art aus Name, Größe, Typ und Tempo – beim Erscheinen im Kampf, beim Einwechseln, tief beim Besiegtwerden, im Taschidex (🔊 Ruf) und bei der Starterwahl. Test: `tests/e2e/voices.mjs`. **🎬 Zwischensequenzen** (`game.cutscene`): Kinobalken und kreisende Kamera bei Rivale, Wächter-Schrein und Raids.
- Tests: `tests/switch-features.test.mjs`, Browsertests `tests/e2e/switch.mjs` (Foto, Fliegen, Raid) und `tests/e2e/online.mjs` (inkl. Koop-Raid).

## Spielfigur und Zotik (November 2026)

- **Eigener Abenteuer-Look** statt klassischem Trainer: Abenteuerjacke (lange Ärmel, Stehkragen, schräger Reißverschluss, Umhängegurt), Abenteuerbrille am Stirnband, Armschienen, Werkzeuggürtel mit Kapsel-Taschen und leuchtender Laterne, Rolltop-Rucksack, Cargotaschen und Wanderstiefel. Interne Schlüssel (`trainer`, `trainercap`) bleiben, alte Spielstände bekommen den neuen Look automatisch.
- **Zotik spielbar:** Im Editor unter „Figur“ den Fuchs-Abenteurer aus dem easygames-Spiel „Zotik“ wählen (`look.zotik`). Modell: `src/engine/zotik.js`, nachgebaut nach `zotik-src/src/fox.js`, gleiche Gelenke und Animationen wie die Menschen.
- **Zotik als legendäres Taschi:** Klon aus Professor Ulmes missglücktem Experiment mit der Lichtkammer, steht in Sonnenhain vor der Glaskuppel; Kampf ab dem Moos-Siegel (Stufe 16, Normal/Feuer, Attacke Lichtklinge). Im Labor erzählt die zerbrochene Lichtkammer die Geschichte, zu Hause in Sonnenhain warten Mama und Papa.
- Test: `node tests/e2e/zotik.mjs [Bildordner]`; Figurenansicht: `tools/viewer.html?mode=players` (mit `&zotik=1`).

## Steuerung für alle Geräte und neue Sammel-Features (November 2026)

- **Eine Bedienung für Touch, Tastatur+Maus und Controller:** Jedes Menü, jeder Kampf, jeder Dialog und jetzt auch die Namenseingabe (Bildschirmtastatur statt Browser-Abfrage) sind mit jedem Gerät bedienbar.
- **Controller wie auf der Nintendo Switch** (Standard): A (rechts) bestätigt, B (unten) zurück, X (oben) oder + Menü, Y (links) halten = rennen, − Karte, L/R Reiter, ZL/ZR und rechter Stick Kamera, linker Stick drücken = Team. Umschaltbar auf Xbox/PlayStation-Belegung unter Einstellungen › Controller › Tastenlayout; frei belegbar wie bisher. Alte unveränderte Standardbelegungen wechseln einmal automatisch auf Switch, eigene Belegungen bleiben.
- **Maus:** Zeigen markiert Einträge, Linksklick wählt, Rechtsklick = zurück.
- **Steuerung auf einen Blick:** Übersicht aller Aktionen für Tastatur, Controller und Touch in den Einstellungen.
- **Angeln:** Am Ufer von Seen, Flüssen, Meer und Buchten erscheint „Angeln“ (Angel von Anglerin Mira beim ersten Mal). Reaktionsspiel: beim „❗“ sofort bestätigen. Am Haken hängen vor allem Wasser- und Eis-Taschis, manchmal ein größeres.
- **Getragene Gegenstände:** Heilbeere, Klarbeere, Lernband, Kraftband, Fokusband – im Laden, anlegen über Team › Taschi › „🎒 Trägt“ oder die Tasche. Wirken im Kampf von selbst, Beeren und Fokusband werden verbraucht.
- Tests: `tests/controls-held.test.mjs`, Browsertest `node tests/e2e/controls.mjs [Bildordner]` (simulierter Switch Pro Controller).

## Modernerer Look und deutliche Entwicklungsstufen (November 2026)

- Gebaute Taschis haben eine weichere Toon-Abstufung und einen hellen Randlicht-Saum (`creatureMaterial` in `src/engine/creatures.js`).
- Jede Entwicklungsstufe sieht man sofort: Babys mit großem Kopf und kurzen Beinen, Endstufen kräftiger und hochbeiniger; Stufe 2 bekommt Rückenkamm und Musterung, Stufe 3 Hörner, schärferen Blick, Aura und einen leuchtenden Stirnstein in Typfarbe. Mit jeder Stufe wächst das Taschi sichtbar (`displayScale`).
- Drachenflügel sind jetzt geschwungene Flughäute statt flacher Dreiecke. Bildtafel zum Vergleichen: `node tests/e2e/lineup.mjs <ordner>`.

## Neue Taschis aus 3D-Modellen (November 2026)

- **57 neue Arten in 27 Entwicklungslinien** (Dex 262–318), gebaut aus dem *Ultimate Monsters Bundle* von **Quaternius** (CC0, Quelle: https://poly.pizza/bundle/Ultimate-Monsters-Bundle-5oyGWAmOB6, Lizenz in `assets/models/LICENSE.txt`). Sechs Linien nutzen die fertigen „Evolved“-Modelle, bei anderen wird aus dem einfachen das detailreiche Modell; Linien mit nur einem Modell entwickeln sich in eine größere Form mit eigenem Farbton und Glanz.
- Technik: `src/engine/models.js` lädt die GLB-Dateien (GLTFLoader aus `../vendor`), klont Skelett und Haut, wandelt die Materialien in den Toon-Look mit Umriss um und spielt die Animationen (Stehen, Laufen, Angriff, Treffer, Freude, K.o.). Die Modelle laden im Hintergrund; Kämpfe warten kurz, bis beide Teams geladen sind.
- Die Arten erscheinen nach ihrem Typ automatisch in der Wildnis, bei Trainern und in der Zucht. Tests: `tests/models.test.mjs`, Browsertest `tests/e2e/models.mjs`.

## 🌐 Online: Tauschen & Kämpfen (November 2026)
- Menü › Team, Titelbild („🌐 Online & Freunde“) oder Einladungslink `…/taschi/#join=CODE`. Ein Gerät eröffnet einen Raum (5-stelliger Code, Link, QR-Code), das andere tritt bei. Einladungslinks zeigen über `EasyGamesLink.share` immer auf die easygames-Homepage.
- Verbindung: `../cloud/fire-peer.js` (Firebase vermittelt, gespielt wird per WebRTC direkt; Rückfall PeerJS). `src/core/net.js` kapselt Raum, Beitritt und Nachrichten.
- **Tausch:** beide bieten an, beide bestätigen (Prüfsumme über beide Angebote). Empfangene Taschis laufen durch dieselbe Prüfung wie geladene Spielstände (`cleanMonster`), bekommen eine neue Kennung und merken sich den Erst-Trainer (`ot`).
- **Kampf:** 3 gegen 3, Level-50-Kopien (wie im Kampfturm), keine EP. Der Gastgeber rechnet den Kampf mit der normalen Engine (`createBattle({ pvp: true })`, `runTurn(b, eigene, gegnerische Wahl)`, `replaceFoe`), der Gast schickt seine Wahl und spielt gespiegelte Ereignisse samt Zwischenstand ab (`src/logic/link.js`). Aufgeben und Verbindungsabbruch beenden den Kampf sauber.
- Tests: `tests/link.test.mjs` (Tausch, Prüfung, kompletter gespiegelter Kampf), Browsertest `tests/e2e/online.mjs` (zwei Spielinstanzen, Tausch und Kampf).

## Reiten & Surfen (November 2026)

- **Reiten** (Taste R, Controller R3 / rechter Stick drücken, Touch 🐾): Ab dem ersten Licht-Siegel trägt dich ein großes Vierbeiner-, Golem- oder Drachen-Taschi aus dem Team (Begleiter zuerst) – schneller als Rennen. Nochmal drücken zum Absteigen; drinnen wird nicht geritten.
- **Surfen:** Ab dem dritten Siegel erscheint am Ufer „Surfen / Angeln“. Ein Wasser-Taschi trägt dich über Seen, Flüsse und das Meer; dort gibt es Wasser-Begegnungen. Wer ans Ufer schwimmt, geht automatisch an Land. Gespeichert wird beim Surfen der Startpunkt am Ufer.
- Logik: `src/logic/ride.js`; Tests `tests/ride.test.mjs`, Browsertest `tests/e2e/ride.mjs`.

## Pension, Zucht, Kampfturm und Tagesereignisse (November 2026)

- **Pension Sonnenblume** (Wirtin Ilse, in jedem Heilzentrum): zwei Taschis abgeben, sie bekommen beim Laufen 1 EP pro Schritt. Gebühr beim Abholen ★100 + ★25 je gewonnenem Level. Haben beide einen gemeinsamen Typ (oder dieselbe Linie), liegt manchmal ein Ei bereit.
- **Zucht:** Das Ei schlüpft nach 700–2600 Schritten (Team-Menü zeigt Fortschritt). Das Junge ist die Grundform des ersten Elternteils (Lv 1), erbt drei Werte, eventuell das Wesen und bis zu zwei Erbattacken. Logik: `src/logic/daycare.js`.
- **Attacken-Disks:** 23 Disks im Laden (nach Siegeln freigeschaltet), mehrfach nutzbar. Normal-Attacken lernt jedes Taschi, sonst muss der Typ passen; die Tasche zeigt „Kann lernen“.
- **Schlauere Trainer:** Trainer tragen ab dem 2. Siegel Items, die KI heilt Status mit Heilkraut, stärkt sich mit Angriffsplus und beachtet Fokusband und Klarbeere. Besiegte Trainer fordern einmal pro Tag eine **Revanche** (Team auf deiner Stufe).
- **Tagesereignisse** (`src/logic/daily.js`): Massenausbruch einer Art in einer besuchten Region (Quests-Reiter, dreifache Schillerchance), **Glücksrad** im Heilzentrum einmal pro Tag.
- **Taschi-Camp** (Team › „⛺ Taschi-Camp“): streicheln, Ball spielen, Taschi-Keks füttern; bis 40 Freundschaft pro Taschi und Tag. Beste Freunde halten manchmal einen K.o.-Treffer aus und schütteln Status ab.
- **Kampfturm** (Terminal im Heilzentrum, ab 8 Siegeln): drei Taschis auf Lv 50 ohne Taschen-Items gegen endlos viele Trainer, 7 Kämpfe pro Etage mit Etagenboss. Turmpunkte (TP) gegen seltene Belohnungen tauschen. Originale bleiben unverändert. Logik: `src/logic/tower.js`.
- Tests: `tests/daycare-disks.test.mjs`, `tests/extras.test.mjs`, Browsertests `tests/e2e/breeding.mjs`, `tests/e2e/extras.mjs`.

## Eigene Stadtbilder (November 2026)

Jede der 16 Städte hat ein eigenes Gesicht (Daten: `src/data/towns.js`, Modelle: `src/engine/townstyle.js`): eigenes Platz-Mittelstück (z. B. Ankerdenkmal, Blitzsäule, Kirschbaum, Glutschale, Eisskulptur, Sonnenobelisk), Pflasterfarbe, Laternen (Eisen, Holz, Papier, Fackel, Kristall, Muschel), Deko rund um den Platz, Wimpelketten und einen Hausstil (u. a. Pagode, Blockhaus, Rundhütte, Baumhaus, Basalt). Der Champion wartet nicht mehr überall im Pavillon, sondern an einem eigenen Ort: Kapitänsdeck, Hochspannungsring, Kirschblütenschrein, Lichtung der Ahnen, Sturmkreis, Schmiedering, Sternenplateau, Laternensteg, Eisthron, Wipfelbühne, Steppenring, Kristallkrone, Mondtempel, Sonnenterrasse und Wolkenaltar (Sonnenhain behält den Pavillon). Kollision der Orte: `VENUE_SOLIDS`. Schaubild: `node tests/e2e/towns.mjs <ordner> [regionen]`.

KayKit von Kay Lousberg (kaylousberg.com, CC0): In jeder Stadt stehen zwei reisende Abenteurer (KayKit Adventurers 2.0: Ritterin, Magier, Waldläuferin, Schatzsucher, Kundschafterin, Recke) mit Ausrüstung und eigenen Sätzen (`ADVENTURERS` in `src/data/towns.js`, Figur `src/engine/kaykit.js`). Die Figuren und Rig-Animationen liegen in `assets/kaykit/characters/` (eigene Kopie, weil die Windows-App jedes Spiel nur mit seinem eigenen Ordner installiert – Modelle aus anderen Spielordnern fehlen dort). An jeder Arena hängen Schilde mit gekreuzten Schwertern, und neben der Treppe stehen Waffenständer (KayKit Fantasy Weapons Bits 1.0, `assets/kaykit/`). Schaubild: `node tests/e2e/kaykit.mjs <ordner> [region]`.

Trainer-Look: Trainer, Arenaleiter, Champions und standardmäßig die Spielerfigur nutzen die KayKit-Abenteurer ohne Helm, Umhang und Waffen, umgefärbt (Kleidung, Akzent, Hautton per Paletten-Umfärbung) und mit eigener Ausrüstung: Abenteuerbrille am Stirnband, Rucksack und Gürtel mit Taschi-Kapseln (`trainerGear` in `src/engine/kaykit.js`, `TRAINER_MODELS`/`trainerLook` in `src/engine/characters.js`). Im Editor gibt es unter „Figur“ 🎒 Trainer (je drei Typen für Männlich und Weiblich, Divers alle sechs), Klassisch und Zotik. Auch alle Stadtbewohner und Story-Figuren nutzen diesen Stil, mit Kleidung je Rolle statt Trainer-Ausrüstung: weißer Kittel und Brille (Forscher, Professor), Schürze (Händler, Verkäufer, Handwerker), rosa Kleidung und Häubchen (Heilzentrum), Kapuze und Maske (Rüpel), kleinere Kinder (`residentLook` in `src/engine/characters.js`). Schaubild und Editor-Test: `node tests/e2e/trainers.mjs <ordner>`.

## Steuerung und Menüs

- PC: WASD/Pfeiltasten bewegen, E = Interaktion, Escape = Pause.
- Handy: Touch-Joystick und Aktionsschaltflächen.
- **Team**, **Taschidex**, **Karte**, **Pause** und **Musik an/aus** als sichtbare Schaltflächen.
- Pause: Reisekarte, Abenteuerbuch, Geschichte, Spielstand als JSON exportieren oder importieren. Drei Speicherplätze und Neustart je Spielplatz.
- Drei wählbare lokale Speicherplätze und automatisches Speichern im Browser, unabhängiger Schlüssel `easygames.taschi.eight-lights.v1`.
- Import prüft Dateigröße und Spielstandsformat; beschädigte Eingaben werden abgewiesen.

## Steuerung und Controller-Einstellungen (Oktober 2026)

Im laufenden Spiel auf **☰ → Steuerung & Controller** tippen. Einstellbar sind:
- Touch-Joystick links/rechts, Größe, Deckkraft und Totzone;
- Bewegungstempo und Sprinttaste;
- freie PC-Tastenbelegung für Vorwärts/Rückwärts/Links/Rechts, Interaktion, Pause und Sprint;
- klassische höhere oder nähere Kameraperspektive;
- Grafikqualität (Performance, Balanced, Quality) als Begrenzung der Render-Pixelratio.

**Controller:** Browser-Gamepad-API für Standard-Controller (z. B. Xbox/PlayStation über Bluetooth, sofern Browser und Gerät die Eingabe erlauben): linker Stick/D-Pad bewegen; A/untere Haupttaste Interaktion bzw. Menü bestätigen; B/rechte Taste Menü zurück; Start Pause; Y/obere Taste Team. Steuerkreuz im Dialog wählt Menüeinträge. Ein tatsächlicher Hardwaretest mit unterschiedlichen Controller-Modellen ist noch ausstehend, ebenso ein allgemeiner Controller-Remapping-Editor. Die Nutzerbelegung wird lokal unter `taschi.input.v2` gesichert.

## Konsolenorientierte Präsentation

Das HUD und die Kampfmenüs sind als kompakte, fokussierbare Spiel-Overlays gestaltet und passen sich im Hoch- und Querformat an. Die Kampfplattform zeigt Taschis mit Einblend- und Treffereaktionen, die Spielfigur besitzt eine einfache Laufanimation. Über das Pausenmenü kann optional Browser-Vollbild aktiviert werden, sofern vom Gerät unterstützt. Diese Präsentation ist weiterhin ein prozedural gestaltetes 3D-Spiel und **noch keine grafisch fertig produzierte Konsolenwelt**.

## Grafik-Überarbeitung „Konsolen-Look“ (November 2026)

- **Nachbearbeitung** (`src/engine/post.js`): Kantenglättung über ein Zwischenbild, weicher Schein um helle Stellen (Bloom), Farbabstimmung je Lage (Welt, Kampf, Innenraum) und leichte Vignette. Auf der Grafikstufe „Leistung“ ausgeschaltet.
- **Keine Low-Poly-Kanten mehr:** Baumkronen und Büsche feiner unterteilt mit weichen Normalen; Taschis und Figuren nutzen automatisch mehr Segmente für runde Teile (`fineThree` in `geometry.js`). Felsen, Kristalle und Stacheln bleiben bewusst kantig.
- **Grasteppich:** dichte, einzeln gebogene Halme auf allen grünen Flächen (Stufen „Ausgewogen“ und „Hoch“), gefärbt nach dem Boden.
- **Wasser** spiegelt den Himmel zum Rand hin (Fresnel).
- **Echte Fotos (CC0):** Himmelswolken aus dem Poly-Haven-HDRI „Kloofendal 48d Partly Cloudy (Pure Sky)“ (der Himmel behält die Farben der Region, die Fotosonne folgt der Spielsonne). Boden, Felsen und Rinde tragen Fototexturen von ambientCG (Grass004, Ground037, PavingStones070, Rock030, Bark007), im Shader nach der Bodenfarbe gewählt. Aufbereitet als kleine Graustufenbilder (zusammen ≈ 0,6 MB) in `assets/textures/`, Quellen und Lizenz in `assets/textures/LICENSE.txt`.
- **Figuren und Taschis:** gemeinsames „modernToon“-Material (`materials.js`) mit weicher 4-stufiger Schattierung, Randlicht und dezentem Glanz. Menschen haben größere Köpfe und Anime-Augen (Iris mit hellem Kern, Pupille, zwei Glanzpunkte, Lidstrich, Augenfarbe über `eyeColor`). Taschis bekommen eine Pupille und farbigere Iris. Zotik behält bewusst seinen bisherigen Look.
- **Kampfplatz** mit denselben Fototexturen wie das Gelände.
- Schaubilder: `node tests/e2e/look.mjs <ordner> <präfix>` (Welt/Kampf) und `node tests/e2e/portraits.mjs <ordner>` (Gesichter und Taschis).

## Spielsysteme

- (Stand vor dem Update vom 16. Oktober 2026, siehe oben) 17 grundlegende Taschi-Arten plus **192 prozedural erzeugte neue Arten mit eigenen Namen, Typen, Werten und teils Entwicklungsreihen**, zusammen 209 Einträge im Taschidex. Die zusätzlichen Arten besitzen unterschiedliche prozedurale Merkmale, nutzen aber einen gemeinsamen Baukasten. Das sind **keine 209 einzeln handmodellierten 3D-Kreaturen**.
- Acht Elementtypen und elementbasierte Wirksamkeiten, Angriffs- und Verteidigungswerte, EP, Levelaufstiege und einige Entwicklungen.
- Starterwahl, Wildbegegnungen, Fangchance abhängig von restlichen KP, Team mit sechs Plätzen, Lagerverwaltung, Heilung und Tränke. Sternmünzen aus Kämpfen und ein kaufbasierter Fangladen.
- 16 aufeinanderfolgende Arenen; spätere Arena-Meister besitzen Teams aus mehreren Taschis. Im Kampf können eigene Begleiter gewechselt werden. Nach jeder bestandenen Arena folgen Licht-Siegel und Belohnungen.
- Eigenständige 3D-Kampfplattform mit sichtbaren Modellen beider Taschis.
- 6 Dörfer mit eigenen Bewohnern, Aufgaben, Begegnungen, Belohnungen und Rastaktionen; 4 Höhlen mit **begehbarem einfachem 3D-Interieur**, Kristallsuche, Wildbegegnungen und Ausgang.
- Fünf Story-Kapitel sowie eine nach 16 Orden freigeschaltete Sternenliga mit fünf aufeinanderfolgenden Prüfungen und eigenständigem Meistertitel, Abenteuerbuch, Richtungsanzeige zur nächsten Arena, je nach Gebiet unterschiedliche wilde Taschi-Typen, freies Erkunden nach der 16. Herausforderung.
- Mobile Rendering-Auflösung begrenzt und Blüten per InstancedMesh zusammengefasst. Originale, synthetisch erzeugte Musik und Kampftöne (abschaltbar; keine lizenzierten Audiodateien).

## Aktuelle Qualitätsgrenzen

Die komplette **Kernfortschrittskette vom Starter bis zum 16. Arena-Siegel ist im Code angelegt**, wurde aber noch nicht mit einem automatisierten End-to-End-Browserlauf auf einem realen Smartphone verifiziert. Das Produkt erreicht derzeit **noch nicht die Qualität und den Umfang eines kommerziellen Konsolen-RPGs**. Noch fehlen insbesondere handmodellierte individuelle Monster, echte begehbare Häuser und umfangreiche Innenräume, hunderte individuelle Attacken, Status-Effekte und anspruchsvolle Gegner-KI, umfangreiche Cutscenes, professionelle Musik/Soundeffekte, große zusammenhängende Routen, mehrstufige Haupt- und Nebenquests, Multiplayer/Handel und Cross-Device-Synchronisierung.

Die Welt nutzt eigene Kunst-/Figurenansätze. Keine Pokémon-Assets oder markenrechtlich geschützten Grafiken, Sounds, Charaktere oder konkreten Spieltexte übernehmen.

## Entwicklung

Die Spielmechanik ist aktuell in `game.js` gebündelt und sollte mittelfristig modularisiert und mit Browser- und Gerätetests abgesichert werden. Bunte Insel darf dabei nicht überschrieben werden. Ein optionales **Vite-Entwicklungs- und Build-System** ist jetzt in `taschi/package.json` und `taschi/vite.config.mjs` vorhanden. Der ursprüngliche statische GitHub-Pages-Einstieg bleibt erhalten.\n\n```bash\ncd taschi\nnpm install\nnpm run dev     # Öffnet /taschi/\nnpm test        # Daten-/Syntaxregression (kein Browsertest)\nnpm run build   # Erzeugt dist/taschi plus lokalen Three.js-Vendor\n```\n\n**Wichtig:** Die oben genannten npm-Skripte wurden in dieser Sitzung nicht auf einem Build-Rechner ausgeführt. WebGL, Kamera, Ladezeiten und Mobilbedienung müssen weiterhin per Browser-/Gerätetest bestätigt werden.

## Vorbildanalyse (Spielstruktur)

Als Referenz für die übergreifende Spielschleife wurde [Pokémon (Computerspielreihe) – Spielprinzip](https://de.wikipedia.org/wiki/Pok%C3%A9mon_(Computerspielreihe)#Spielprinzip) gelesen: Starterwahl, Routen zwischen Städten, wilde Begegnungen und Trainer, Fang-/Team-/Lagersystem, EP und Entwicklung, Arenen sowie abschließende Meisterschaft. Für TASCHI gelten weiterhin **eigene** Namen, Figuren, Weltgestaltung und die abweichende Zahl von 16 Orden. Der aktuelle Code besitzt die angelegte Kernschleife und die Sternenliga; die Welt benötigt noch deutlich mehr zusammenhängende, gestaltete Wege und storygesteuerte Ereignisse.

## Verbundene Reisewege

Die bestehende Region besitzt nun ein durchgängiges sichtbares Wegenetz vom Startpunkt über die 16 Arenastandorte, aufgestellte Wegweiser mit Zielhinweisen und einen **Reiseführer** unter ☰. Bereits errungene Siegel bleiben bestehen. Die Routen sind zunächst Wege innerhalb der bestehenden Welt, **keine 16 separat ausgearbeiteten großen Regionen**. Die dargestellten Prüfungen, Wege und Wegweiser wurden statisch geprüft; tatsächliche Laufwege, Kollisionen und grafische Darstellung müssen im Browser getestet werden.

## Spielzustandsmaschine

Die Eingabelogik unterscheidet nun ausdrücklich `boot`, `title`, `world`, `dialog`, `battle` und `result`. Die Erkundungsbewegung läuft nur im Weltzustand; beim Öffnen von Dialogen wird die Bewegung blockiert. Kämpfe werden separat aktiviert, Pausenbefehle während eines Kampfes unterdrückt, und Abschlussaktionen führen aus dem Ergebnis zurück in die Spielwelt. Die Implementierung befindet sich derzeit im bestehenden `game.js`, damit bestehende Datenschnittstellen und Speicherstände unverändert bleiben. Die JavaScript-Syntax wurde geprüft; browserbasierte End-to-End-Tests sind weiterhin erforderlich.

## Landschafts-Überarbeitung (Oktober 2026)

Die Spielwelt verwendet nun mehrere prozedurale Baum-Silhouetten, detailliertere Häuser mit Fenstern, Fenstersprossen, Türen und Fassadenelementen, Uferteiche, Felsen, Blumenbeete und Laternen. Die Spielerfigur besitzt zusätzliche Kleidung, Gesichtselemente und einen Rucksack. Die 16 bisherigen Arena-Säulen wurden durch sechseckige Pavillons mit eigenen Farbschemata und Schmuckdetails ersetzt. Die Positionen der Arena-Interaktionen sind unverändert. Dies sind prozedurale, noch nicht individuell handmodellierte 3D-Modelle; Geometrie und Laufwege müssen im Browser und auf echten Mobilgeräten geprüft werden.

## Stadtregionen, Rätsel und Champions

Es gibt jetzt **16 benannte Stadtregionen** innerhalb der vorhandenen zusammenhängenden 3D-Region: jeweils ein Heilzentrum (KP und AP auffüllen), eine einmalige Schatztruhe mit Items und Sternmünzen, ein lokales Runenrätsel als Voraussetzung für die Arena, die Arena selbst und einen anschließend separat herausforderbaren regionalen Champion. Nach dem Champion lässt sich die nächste Region im Menü **☰ → Regionen & Schnellreise** anwählen. Alle einmaligen Rätsel-, Truhen- und Champion-Ergebnisse werden im bisherigen Spielstand gespeichert. Unter **☰ → Regionale Champions** sind verfügbare Duelle direkt auswählbar. Die 16 Orden und die nachgelagerte Sternenliga bleiben erhalten.

**Einschränkung:** Dies sind zunächst unterschiedliche Stadtbereiche **innerhalb einer einzigen 3D-Welt**, noch keine 16 vollständig eigenständigen Karten mit eigenem Streaming, komplexen Gebäudeeingängen oder individuellen Biomen. Die Rune-Aufgaben sind einfache Auswahlrätsel; umfangreiche Umgebungsrätsel müssen noch folgen. Die Syntax wurde geprüft, vollständige Browser-/Mobile-End-to-End-Tests fehlen.

## Biome und legendäre Wächter

Jede der 16 Stadtregionen besitzt zwei priorisierte Elementtypen (z. B. Glutland: Feuer/Gestein, Korallküste: Wasser/Flug, Kristallberg: Gestein/Geist). Wilde Begegnungen greifen primär auf die Typen der nächstgelegenen Region zurück; das Level orientiert sich an der dortigen Arena. Vier zusätzliche **originale legendäre Wächter-Taschis** (Auraflamme, Tiefenlied, Sturmkron, Mondhüter) sind nach dem entsprechenden regionalen Orden gesondert unter ☰ → Regionale Legenden herausforderbar. Sie erscheinen nicht im gewöhnlichen Wild-Taschi-Pool. Dadurch steigt der Katalog von 209 auf **213 Taschi-Arten**. Bei neuen Begegnungen sind noch vollständige Browser- und Balance-Tests erforderlich.

## Regionaler Ausbau: Einwohner, Professoren und Schattengilde

Die sechzehn Stadtregionen erhalten jeweils eine eingefärbte Bodenfläche und typabhängige 3D-Landschaftsmerkmale sowie sieben zusätzliche ansprechbare Bewohner, davon jeweils einen regionalen Professor (insgesamt 112 NPCs, 16 Professoren). Spielbeginn: Neben dem Startpunkt steht Professor Ulme; vor der Glaskuppel liegen drei räumlich anklickbare Starterbälle. Man muss Ulme zuerst ansprechen, bevor ein Starter gewählt werden kann. Das Menü wählt nicht mehr unmittelbar nach dem Spielstart den Starter aus. Die unabhängige Schattengilde nutzt einen violett-orangenen Heißluftballon und das originale katzenartige Taschi **Schnurrik**; vier Fangaktionen gegen wilde Taschis können durch Kämpfe verhindert werden. Gewinne werden über bestehende Speicherflags erfasst. Der Katalog umfasst nun **214 Arten** (209 Basisarten, 4 legendäre Wächter, Schnurrik). Diese neuen prozeduralen Assets sind keine Übernahme von Pokémon, Team Rocket oder Mauzi.

**Offen:** Die Stadtregionen teilen noch eine zusammenhängende 3D-Karte und viele Figurenmodelle benutzen gemeinsame Formen. Eine wirkliche Multi-Map-Welt mit eigenständigen Städten/Innenräumen und eine vollständig dramaturgische Schattengilde-Kampagne sind noch nicht implementiert. Syntaxchecks sind keine Laufzeit-/Mobile-Tests.

## Kampf im Konsolen-Stil (November 2026)

- **Kampf in der offenen Welt:** Draußen findet der Kampf direkt in der Weltszene statt (`BattleScene.buildWorldStage`), ausgerichtet vom Spieler zum Gegner, auch auf Flüssen und Seen beim Surfen (`World.waterAt`). Taschis und Leute in der Nähe werden ausgeblendet; Innenräume, Turm, Raids und Online-Kämpfe nutzen weiter die Bühne.
- **Befehlsmenü rechts unten** (Kampf, Taschis, Tasche, Flucht mit Symbolen, gelbe Auswahl mit Pfeil), Textleiste unten, kompakte Plaketten mit „Lv.“, ♂/♀ (`genderOf`, nur Anzeige), Typ-Symbol, KP-Zahl in der Leiste und Team-Kapselleiste.
- **Welt:** Namensschilder über wilden Taschis (Level, Geschlecht, ◉ gefangen), wilde Taschis lassen sich ansprechen (Aktion = Kampf), Begleiter-Plakette links unten. Wurf mit Leuchtspur (`Trail`).
- **Taschidex:** Raster mit Bildern, großes 3D-Modell mit Nummer und Name daneben.
- Test: `tests/e2e/battlestyle.mjs`.
