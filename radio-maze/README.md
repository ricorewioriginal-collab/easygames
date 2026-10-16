# AnMaCha Radio Maze 3D

Der Arcade-Labyrinth-Klassiker als originalgetreuer Nachbau in 3D-Optik, im easygames-Verzeichnis `radio-maze/`. Regeln und Verhalten folgen dem Automaten-Original, Gestaltung, Namen und Töne sind eigene AnMaCha-Radiowelt.

## Originalgetreu
- **Labyrinth 28 × 31** mit 240 Frequenzpunkten, 4 Verstärkern, Seitentunnel, Geisterhaus mit Tür und den Sperrfeldern, an denen die Geister nicht nach oben abbiegen.
- **Vier Störsender mit Original-KI:** Rauschi (rot) jagt direkt, Pfeifi (rosa) zielt 4 Felder voraus (inklusive des Versatzes beim Blick nach oben), Knacki (cyan) spiegelt über Rauschi, Brummi (orange) wird unter 8 Feldern scheu. Streu-/Jagdphasen, Richtungswechsel beim Phasenwechsel, Zufallsbewegung im Fluchtmodus, Augen kehren ins Haus zurück.
- **Level-Tabelle:** Tempo von Spieler, Geistern, Tunnel und Flucht, Turbo-Zeit, Elroy-Beschleunigung von Rauschi, Freigabe aus dem Haus per Punktezähler und Leerlauf-Timer – jeweils nach Level, ab Level 21 konstant.
- **Punkte:** 10 / 50, Geister 200 – 400 – 800 – 1600, zwei Bonus-Senderlogos pro Level (100 bis 5000), Extraleben bei 10.000, kurzes Anhalten beim Fressen.

## Erweiterungen
- 60 Level in sechs Radiowelten mit eigener Farbgebung, Levelauswahl mit Freischaltung.
- Zwei Kameras: klassische 3D-Übersicht und Verfolger-Kamera (Taste C oder 🗺/🎥).
- Steuerung per Tastatur, Steuerkreuz, Wischen (auch während der Bewegung) und Gamepad.
- Spielstand lokal unter `easygames.radio-maze.v1` mit Fortschritt im Level, optionaler Google-Cloud-Abgleich über `../cloud/anmacha-cloud.js`.
- Offline-PWA mit eigener Cache-Version in `sw.js`.

## Technik und Ressourcen
- `logic.js`: komplette Spiellogik ohne DOM, in Node testbar. `game.js`: Three.js r128 aus `../vendor/three-r128.min.js`, kein Build, keine CDNs.
- Wände, Konturen und Punkte als InstancedMesh (je ein Draw-Call), geteilte Geometrien, Lambert-Materialien, Pixel-Ratio höchstens 1,5.
- Gerendert wird nur im Spiel; im Menü steht die 3D-Szene still. Die Sirene ist ein einziger Oszillator und schweigt bei Pause oder verstecktem Tab.
- Auf langsamen Geräten wird in kleinen Zeitschritten gerechnet, damit das Tempo stimmt.

## Lokales Testen
Aus dem Repository-Hauptverzeichnis `python3 -m http.server 8080` starten und `http://localhost:8080/radio-maze/` öffnen.

## Prüfungen
`node tools/test-radio-maze.cjs` prüft Labyrinth, Level-Tabelle, Zielverhalten der Störsender, Augen-Rückkehr, Bonus-Logo, Extraleben, Fortsetzen und lässt einen Bot Level 1, 2, 5, 13, 21 und 60 komplett durchspielen. `node tools/check-games.js` prüft die Katalogintegration.
