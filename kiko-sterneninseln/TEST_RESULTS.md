# Testergebnisse – Fassung 11, 15. Oktober 2026

## Automatisch geprüft

`npm test`: sieben Testdateien erfolgreich. Die Dateien enthalten insgesamt 65 Testfälle.

- Echte Kameraachse gegen WASD/Joystick: Vorwärts und Rechts stimmen mit der dargestellten Ansicht überein. Der Zielkompass nutzt dieselbe Orientierung.
- Physik: Landung, keine Luft-Mehrfachsprünge, feste höhere Kanten, Sprünge auf Kanten, Hindernisse, Deckenkollision, Sprungpuffer und dauerhafter Bodenkontakt bei 15/30/60/120 Hz.
- Weltaufbau: alle 20 Level, fünf Pflichtkristalle und drei Bonussterne pro Level mit gültigen Koordinaten; Kristalle und Portale liegen über erreichbaren Bodenflächen. Aufbau und Freigabe der 3D-Szenen werden geprüft.
- Bewegliche Plattformen nehmen ihre Sammelobjekte mit. Inaktive Zeitplattformen blenden ihren Unterbau aus.
- Eingabe: Tastatur, gleichzeitiger Touch-Joystick und Sprung, Pointer-Abbruch, Loslassen außerhalb einer Taste, Kamerafinger, Fokusverlust, Gamepad und Controller-Abbruch. Eine gesperrte Gamepad API im Iframe darf Touch und Tastatur nicht abschalten.
- Zustände: Start, Level-Sperren, Pause, Fortsetzen, Game Over und Checkpoint-Neustart.
- Vollständige Runden mit `Game.update`: Alle vier Figuren laufen und springen bei 30 und 60 Hz durch alle 20 Level, sammeln die 100 Pflichtkristalle, lösen alle vorhandenen Rätsel und betreten jedes aktive Portal. Alle Gegner, Windzonen, Zeitfenster, Federpilze, Strahlen und einstürzenden Inseln bleiben aktiv. Die Teststeuerung plant Sprünge und wartet auf Plattformen. Sie versetzt Kiko nicht auf Zielinseln und schaltet keine Level künstlich frei. Reguläre Game-Over-Neustarts am Checkpoint sind erlaubt. In den Runden werden bei Bedarf reguläre Checkpoint-Neustarts verwendet. Alle 20 Ziele werden mit allen vier Figuren und beiden Zeitschritten erreicht.
- Neue Mechaniken: Pulsreichweite, Betäubung, Aufladezeit, Vorrang eines Schalters vor dem Puls, Sprungangriff, einmaliges Heilen durch Sterne und Checkpoints, Schutzschild ohne Nachladen durch Figurenwechsel, Medaillen, Bestzeiten und Speicherung der gewählten Figur.
- Neue Kampagnenfunktionen: Druckplatten brauchen kontinuierlichen Bodenkontakt; Leuchtfeuer werden durch den echten Puls aktiviert und nicht doppelt gezählt; Uhrtore laufen ab und können neu gestartet werden; bröckelnde Inseln verschwinden samt Unterbau und kehren zurück; Federpilze, lokale Windkräfte und der Sprung über Strahlen werden geprüft.
- Spielstandmigration: Ein alter Acht-Level-Spielstand wird auf die ursprünglichen Abschnitte im neuen 20-Level-Plan übertragen; Ergebnisse, Figur und Steuerung bleiben erhalten, ein erneutes Laden bleibt stabil.
- Terrain: begehbarer Aufgang ohne Sprung und ohne Verlust des Bodenkontakts; alle vier Figuren erreichen jede neue Bonusinsel in Wald und Frostwelt.
- Oberfläche: Auswahl von vier Figuren in der Pause erhält den Fortschritt. Die Anleitung erklärt 20 Levelrätsel, Fähigkeiten und die tatsächliche Tastenbelegung.
- Fortschritt: Freischaltung bis Level 20, beste Ergebnisse und erneutes Laden des lokalen Spielstands.
- Syntaxprüfung aller Quell- und Testdateien mit `node --check`.

## Korrektur des Bosskampfs

Der neue Regressionstest wurde zuerst gegen die alte Spiellogik ausgeführt und schlug wie gemeldet fehl: Ein Bossbalken nahm trotz einer Fußhöhe von einem Schritt über dem Boden ein Herz ab (`2 !== 3`). Nach der Korrektur bleibt die springende Figur ungetroffen; dieselbe Position am Boden wird weiterhin getroffen.

Elf zusätzliche Testfälle prüfen den Fehler und den überarbeiteten Ablauf:

- Alle vier Figuren überspringen bei 30 und 60 Hz sämtliche drei Bossangriffe mit normaler Sprungphysik und dem im HUD angezeigten Sprunghinweis. Anschließend treffen sie das Herz dreimal und laufen zum Portal. **Keine Treffer, keine Herzverluste, keine verbrauchten Schutzschilde und keine Checkpoint-Neustarts** in diesen acht gezielten Bossdurchläufen. Die Ausgangslage auf der Bossinsel mit fünf Kristallen wird für diese Tests eingerichtet; während des Kampfes werden Position und Herzen nicht korrigiert.
- Das gesamte blaue Fenster ist ohne Ring- oder Balkenangriff. Die Aktion funktioniert aus 2,4 Schritten Entfernung, außerhalb der alten Reichweite. Violette Phasen akzeptieren keinen Treffer. Jeder Phasenwechsel startet wieder mit einer Vorwarnung; mehrfaches Drücken überspringt keine Phase.
- Die Balkenkollision folgt der sichtbaren Drehung und hat dieselbe endliche Länge. Positionen seitlich und hinter den Enden bleiben sicher. Die Mitte eines auseinanderlaufenden Rings ist sicher.

Die vollständigen 20-Level-Runden mit allen Figuren bei beiden Bildraten bestehen ebenfalls erneut.

## Google-Cloud-Prüfungen

Fünf neue Testfälle führen das unveränderte EasyGames-Cloud-Modul mit simuliertem Storage und simulierten Auth-/Firestore-Antworten aus: Ohne Anmeldung gibt es keine Cloud-Anfragen; ein angemeldeter Testnutzer erhält den eigenen Kiko-Stand; geänderter Fortschritt wird nur unter dem Kiko-Dokument hochgeladen; ein Netzausfall erhält den lokalen Stand; geladene Daten werden von SaveManager validiert und übernommen. Die HTML-Anbindung wird auf Spiel-ID, Speicherpräfix und Menü-Mount geprüft.

Vier weitere Fälle prüfen die Menüintegration und Figurenauswahl mit modellierten DOM-Elementen: Derselbe Google-Bereich bleibt beim Menüwechsel erhalten, ist im Spiel ausgeblendet und aktualisiert Freischaltungen nach einem empfangenen Cloud-Stand ohne Rückschreiben veralteter Daten.

Es wurden keine echten Google-Zugangsdaten verwendet und keine echten Firebase-Spielstände verändert. Das interaktive Google-Anmeldefenster sowie der Abgleich mit dem produktiven Firebase-Projekt wurden in dieser Umgebung nicht live geprüft.

Die geometrische Sprungprüfung betrachtet alle Plattformen als verfügbar und prüft die reine Erreichbarkeit. Der vollständige Durchlauf darüber hinaus verwendet die wirklichen zeitgesteuerten und bröckelnden Plattformzustände.

## Grenzen dieser Prüfung

Dies ist ein Durchlauf der tatsächlichen Spiellogik mit Three.js-Objekten in Node.js, ohne WebGL-Ausgabe. Die Eingabetests senden modellierte Pointer-, Tastatur- und Gamepadereignisse; sie ersetzen keinen Test auf einem physischen Telefon.

Chromium ist vorhanden, kann hier aber nicht starten (`setsockopt: Operation not permitted`). Ein lokaler HTTP-Server kann keinen Socket öffnen. Daher wurden Bildschirmdarstellung, Smartphonebedienung und die vollständige Runde nicht grafisch im Browser bestätigt.

`npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` scheitert beim Herunterladen von Vite mit `connect EPERM`. Deshalb ist Vite nicht ausführbar und der Produktionsbuild in dieser Umgebung nicht bestätigt. Der in EasyGames verwendete statische Quellordner benötigt zum Spielen keinen Vite-Build; Three.js liegt lokal im Repository.
