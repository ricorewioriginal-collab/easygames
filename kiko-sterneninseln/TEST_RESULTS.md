# Testergebnisse – Fassung 7, 15. Oktober 2026

## Automatisch geprüft

`npm test`: fünf Testdateien erfolgreich. Die Dateien enthalten insgesamt 26 Testfälle.

- Echte Kameraachse gegen WASD/Joystick: Vorwärts und Rechts stimmen mit der dargestellten Ansicht überein. Der Zielkompass nutzt dieselbe Orientierung.
- Physik: Landung, keine Luft-Mehrfachsprünge, feste höhere Kanten, Sprünge auf Kanten, Hindernisse, Deckenkollision, Sprungpuffer und dauerhafter Bodenkontakt bei 15/30/60/120 Hz.
- Weltaufbau: alle acht Level, fünf Pflichtkristalle und drei Bonussterne pro Level mit gültigen Koordinaten; Kristalle und Portale liegen über erreichbaren Bodenflächen. Aufbau und Freigabe der 3D-Szenen werden geprüft.
- Bewegliche Plattformen nehmen ihre Sammelobjekte mit. Inaktive Zeitplattformen blenden ihren Unterbau aus.
- Eingabe: Tastatur, gleichzeitiger Touch-Joystick und Sprung, Pointer-Abbruch, Loslassen außerhalb einer Taste, Kamerafinger, Fokusverlust, Gamepad und Controller-Abbruch. Eine gesperrte Gamepad API im Iframe darf Touch und Tastatur nicht abschalten.
- Zustände: Start, Level-Sperren, Pause, Fortsetzen, Game Over und Checkpoint-Neustart.
- Vollständige Runde mit `Game.update`: Die Teststeuerung läuft und springt durch alle acht Level, sammelt alle 40 Pflichtkristalle, löst Brücke, Lichtsteinfolge, Schlüssel und beide Himmelsschalter, beendet drei Bossphasen und betritt jedes aktive Portal. Bei 30 Hz: 1502 Simulationsschritte; bei 60 Hz: 2993. In beiden Runden war ein regulärer Checkpoint-Neustart im Endkampf nötig. Gegner und Schaden bleiben aktiv. Die Teststeuerung setzt Kiko nicht auf Zielplattformen und schaltet keine Level künstlich frei.
- Fortschritt: Freischaltung bis Level acht, beste Ergebnisse und erneutes Laden des lokalen Spielstands.
- Syntaxprüfung aller Quell- und Testdateien mit `node --check`.

## Grenzen dieser Prüfung

Dies ist ein Durchlauf der tatsächlichen Spiellogik mit Three.js-Objekten in Node.js, ohne WebGL-Ausgabe. Die Eingabetests senden modellierte Pointer-, Tastatur- und Gamepadereignisse; sie ersetzen keinen Test auf einem physischen Telefon.

Chromium ist vorhanden, kann hier aber nicht starten (`setsockopt: Operation not permitted`). Ein lokaler HTTP-Server kann keinen Socket öffnen. Daher wurden Bildschirmdarstellung, Smartphonebedienung und die vollständige Runde nicht grafisch im Browser bestätigt.

`npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` scheitert beim Herunterladen von Vite mit `connect EPERM`. Deshalb ist Vite nicht ausführbar und der Produktionsbuild in dieser Umgebung nicht bestätigt. Der in EasyGames verwendete statische Quellordner benötigt zum Spielen keinen Vite-Build; Three.js liegt lokal im Repository.
