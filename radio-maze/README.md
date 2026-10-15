# AnMaCha Radio Maze 3D

Eigenständiges, kostenloses 3D-Labyrinth-Arcadespiel im easygames-Verzeichnis `radio-maze/`. Inspiriert vom klassischen Geister-/Labyrinthspiel, mit eigener Radiowelt, UI und Gestaltung.

## Inhalte
- **60 Level** in sechs optisch unterschiedlichen Radiowelten, deterministisch mit verbundenen Wegen generiert (damit alle Frequenzen und Sender erreichbar bleiben).
- **Three.js r128** aus dem bestehenden lokalen `../vendor/three-r128.min.js`. Kein Build, keine zusätzlichen CDNs.
- Bis zu vier Geister mit Wegsuche, Verfolgung, Flucht bei Turbo und Kollisionen. Münzen, Verstärker, originale 13 Senderlogos aus `../anmacha-memory/logos/`, Punktestand, Lebenssystem, Highscore.
- Hauptmenü, realer Ladebalken, Levelauswahl mit Freischaltung, Pause, Game Over, Sieg und Vollbild.
- PC: Pfeiltasten/WASD, P/Esc, F. Mobil: D-Pad oder Wischrichtung, Vollbild-Button. Anpassung an Hoch-/Querformat.
- Spielstand lokal unter `easygames.radio-maze.v1` mit Fortschritt innerhalb des aktuellen Levels. Optionaler Google-Cloud-Abgleich über `../cloud/anmacha-cloud.js` (bestehendes easygames-Firebase-Projekt). Google-Zugang braucht Internet.
- Offline-PWA mit eigener Cache-Version `sw.js`; Radio-Maze-Oberfläche, Three.js und Senderlogos werden nach erfolgreicher Installation offline nutzbar, Cloud-Sync nicht.

## Lokales Testen
Über einen HTTP-Server aus dem Repository-Hauptverzeichnis starten, z. B. `python3 -m http.server 8080`, dann `http://localhost:8080/radio-maze/` öffnen. `file://` ist wegen Service Worker / Cloud keine vollständige Testumgebung.

## Prüfungen
`node tools/test-radio-maze.cjs` validiert unter anderem deterministische Level, zusammenhängende Wege, Geisterstartpositionen und erreichbare Sammlerstücke. `node tools/check-games.js` validiert die easygames-Katalogintegration.

## Grenzen
WebGL-fähiger Browser ist nötig. Bei fehlender WebGL-Unterstützung gibt es eine sichtbare Fehlermeldung mit Wiederholen-Knopf statt endlosem Laden. Die 60 Level wurden prozedural angelegt, nicht von Hand als 60 einzigartige Karten entworfen. Automatische Google-Sicherung funktioniert nur bei aktivierter Anmeldung / ausreichender Online-Verbindung und hängt von der bestehenden Firebase-Konfiguration ab.
