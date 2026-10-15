# Testergebnisse – Fassung 9, 15. Oktober 2026

## Automatisch geprüft

`npm test`: sieben Testdateien erfolgreich. Die Dateien enthalten insgesamt 47 Testfälle.

- Echte Kameraachse gegen WASD/Joystick: Vorwärts und Rechts stimmen mit der dargestellten Ansicht überein. Der Zielkompass nutzt dieselbe Orientierung.
- Physik: Landung, keine Luft-Mehrfachsprünge, feste höhere Kanten, Sprünge auf Kanten, Hindernisse, Deckenkollision, Sprungpuffer und dauerhafter Bodenkontakt bei 15/30/60/120 Hz.
- Weltaufbau: alle acht Level, fünf Pflichtkristalle und drei Bonussterne pro Level mit gültigen Koordinaten; Kristalle und Portale liegen über erreichbaren Bodenflächen. Aufbau und Freigabe der 3D-Szenen werden geprüft.
- Bewegliche Plattformen nehmen ihre Sammelobjekte mit. Inaktive Zeitplattformen blenden ihren Unterbau aus.
- Eingabe: Tastatur, gleichzeitiger Touch-Joystick und Sprung, Pointer-Abbruch, Loslassen außerhalb einer Taste, Kamerafinger, Fokusverlust, Gamepad und Controller-Abbruch. Eine gesperrte Gamepad API im Iframe darf Touch und Tastatur nicht abschalten.
- Zustände: Start, Level-Sperren, Pause, Fortsetzen, Game Over und Checkpoint-Neustart.
- Vollständige Runden mit `Game.update`: Alle vier Figuren laufen und springen bei 30 und 60 Hz durch alle acht Level, sammeln die 40 Pflichtkristalle, lösen Brücke, Lichtsteinfolge, Schlüssel und Himmelsschalter, beenden drei Bossphasen und betreten jedes aktive Portal. Gegner und Schaden bleiben aktiv. Kein Versetzen auf Zielplattformen und kein künstliches Freischalten von Leveln. Kiko benötigt 1572/3129, Mira 1615/3220, Boro 1493/2970 und Lumi 1515/3015 Schritte bei 30/60 Hz. Je Runde war bei Kiko, Mira und Lumi ein regulärer Checkpoint-Neustart im Endkampf nötig; Boro schaffte die Runde ohne Neustart.
- Neue Mechaniken: Pulsreichweite, Betäubung, Aufladezeit, Vorrang eines Schalters vor dem Puls, Sprungangriff, einmaliges Heilen durch Sterne und Checkpoints, Schutzschild ohne Nachladen durch Figurenwechsel, Medaillen, Bestzeiten und Speicherung der gewählten Figur.
- Terrain: begehbarer Aufgang ohne Sprung und ohne Verlust des Bodenkontakts; alle vier Figuren erreichen jede neue Bonusinsel in Wald und Frostwelt.
- Oberfläche: Auswahl von vier Figuren in der Pause erhält den Fortschritt. Die Anleitung erklärt acht Levelrätsel, Fähigkeiten und die tatsächliche Tastenbelegung.
- Fortschritt: Freischaltung bis Level acht, beste Ergebnisse und erneutes Laden des lokalen Spielstands.
- Syntaxprüfung aller Quell- und Testdateien mit `node --check`.

## Google-Cloud-Prüfungen

Fünf neue Testfälle führen das unveränderte EasyGames-Cloud-Modul mit simuliertem Storage und simulierten Auth-/Firestore-Antworten aus: Ohne Anmeldung gibt es keine Cloud-Anfragen; ein angemeldeter Testnutzer erhält den eigenen Kiko-Stand; geänderter Fortschritt wird nur unter dem Kiko-Dokument hochgeladen; ein Netzausfall erhält den lokalen Stand; geladene Daten werden von SaveManager validiert und übernommen. Die HTML-Anbindung wird auf Spiel-ID, Speicherpräfix und Menü-Mount geprüft.

Drei weitere Fälle prüfen die Menüintegration und Figurenauswahl mit modellierten DOM-Elementen: Derselbe Google-Bereich bleibt beim Menüwechsel erhalten, ist im Spiel ausgeblendet und aktualisiert Freischaltungen nach einem empfangenen Cloud-Stand ohne Rückschreiben veralteter Daten.

Es wurden keine echten Google-Zugangsdaten verwendet und keine echten Firebase-Spielstände verändert. Das interaktive Google-Anmeldefenster sowie der Abgleich mit dem produktiven Firebase-Projekt wurden in dieser Umgebung nicht live geprüft.

## Grenzen dieser Prüfung

Dies ist ein Durchlauf der tatsächlichen Spiellogik mit Three.js-Objekten in Node.js, ohne WebGL-Ausgabe. Die Eingabetests senden modellierte Pointer-, Tastatur- und Gamepadereignisse; sie ersetzen keinen Test auf einem physischen Telefon.

Chromium ist vorhanden, kann hier aber nicht starten (`setsockopt: Operation not permitted`). Ein lokaler HTTP-Server kann keinen Socket öffnen. Daher wurden Bildschirmdarstellung, Smartphonebedienung und die vollständige Runde nicht grafisch im Browser bestätigt.

`npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` scheitert beim Herunterladen von Vite mit `connect EPERM`. Deshalb ist Vite nicht ausführbar und der Produktionsbuild in dieser Umgebung nicht bestätigt. Der in EasyGames verwendete statische Quellordner benötigt zum Spielen keinen Vite-Build; Three.js liegt lokal im Repository.
