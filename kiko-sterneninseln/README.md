# KIKO – Das Geheimnis der Sterneninseln

Ein eigenständiges Three.js-Abenteuer mit acht Leveln in vier Welten. Sämtliche Modelle, Effekte und Klänge entstehen im Browser. Das Spiel speichert Fortschritt und Einstellungen lokal und auf Wunsch über den bestehenden Google-Cloud-Speicher von EasyGames.

## Starten

Im Repository funktioniert `kiko-sterneninseln/index.html` direkt über einen statischen HTTP-Server. Zum Beispiel im Repository-Stamm: `python3 -m http.server 8000`, danach `http://localhost:8000/kiko-sterneninseln/` öffnen. Die gebündelte Three.js-Datei liegt im Spielordner.

Mit Node.js 18 oder neuer: `npm ci`, `npm run dev`, `npm test`, `npm run build`. Das Ergebnis liegt unter `dist/` und kann auf einem statischen Webserver veröffentlicht werden. Für die GitHub-Pages-Struktur von easygames reicht der Quellordner ohne Build.

## Steuerung

WASD oder Pfeiltasten bewegen Kiko. Leertaste springt, E interagiert, Maus ziehen dreht die Kamera, Esc pausiert. Auf dem Smartphone: linker Joystick, rechts Sprung- und Interaktionstasten, rechts wischen für die Kamera. Am Gamepad: linker und rechter Stick, A, X und Start. Das Spiel ist für Querformat ausgelegt.

Sammle pro Level fünf Kristalle. Drei versteckte Sterne sind optional. Bei Rätseln aktivierst du Schalter mit E oder der Interaktionstaste. Im letzten Level leuchtet das Sternenherz abwechselnd blau; nur dann kannst du es treffen. Das aktive Portal beendet das Level.

## Technik

Three.js r128 liegt lokal unter `vendor/three.min.js` (MIT-Lizenz, siehe `vendor/LICENSE.three.txt`). Vite 5.4.21 ist nur für Entwicklung und Build nötig. Das Spiel funktioniert ohne Anmeldung. Der optionale Google-Cloud-Speicher nutzt dieselbe Firebase-Anbindung wie die anderen EasyGames-Spiele.

Die Level werden in `src/data.js` definiert. `src/scene.js` baut die 3D-Welt, `src/physics.js` bewegt Kiko, `src/input.js` liest Tastatur, Touch und Gamepad, `src/ui.js` verwaltet Menüs, `src/save.js` speichert lokal, `src/audio.js` erzeugt Töne, `src/game.js` verbindet die Systeme; `src/main.js` startet das Spiel.

## Überarbeitung – Fassung 7

Die Bewegung folgt der tatsächlichen Blickrichtung der Kamera. Links/rechts wurde anhand ihrer Matrix geprüft. Die Physik nutzt Teilzeitschritte bis 1/120 Sekunde, feste Plattformoberseiten, seitliche Kollisionen und Kollisionen an der Unterseite. Ein kurzer Sprungpuffer und eine kleine Kulanz an Kanten machen Sprünge verlässlicher. Nach einem Absturz erscheint Kiko wieder am sicheren Start oder Checkpoint.

Touchflächen unterbinden Browsergesten während der Steuerung. Joystick, Sprung und Kamerawischen besitzen getrennte Pointer. Aktionen enden auch nach einem Abbruch oder dem Loslassen außerhalb der Taste. Eine in eingebetteten Frames gesperrte Gamepad API blockiert die übrige Steuerung nicht.

Ein Missionsfenster erklärt den Einstieg. Während des Spielens zeigt ein dauerhafter Zielkompass den nächsten Kristall, notwendigen Schalter oder das Portal. Pflichtschalter werden vor späteren Kristallen hinter einem Tor angefordert. Sprung und Aktion sind beschriftet. Blaue Kristalle tragen sichtbare Lichtmarkierungen; Bonussterne und Kikos Abzeichen haben eine Sternform. Die Farben der Standardmaterialien werden für Three.js r128 korrekt aus sRGB umgerechnet.

## Google-Spielstand – Fassung 8

Im Hauptmenü, in der Pause, in den Einstellungen und nach einem Levelabschluss gibt es die aufklappbare Karte **Google-Spielstand**. Dort stehen Anmeldung, Kontoprofil, manuelles Sichern, Wiederherstellung des Cloud-Stands, die vorhandene ältere Sicherung und Abmeldung zur Verfügung. Während des Spiels wird die Karte ausgeblendet.

Die Datei `vendor/anmacha-cloud.js` ist eine unveränderte lokale Kopie des vorhandenen EasyGames-Moduls `cloud/anmacha-cloud.js` (Git-Blob `bf9fa7a5d110224d4938e08701d15b3f4d7d34c7`). Sie wird mit `data-game="kiko-sterneninseln"` und `data-prefix="kiko-sterneninseln-v1"` eingebunden. Dadurch nutzt Kiko die vorhandene Google/Firebase-Konfiguration und einen eigenen Spielstand unter `users/<uid>/saves/kiko-sterneninseln`. An Firebase-Konfiguration und Firestore-Regeln wurde nichts geändert. Bei zukünftigen Änderungen des gemeinsamen Cloud-Moduls sollte diese Kopie mit aktualisiert werden.

Gesichert werden die freigeschalteten Level, Bonussterne, Bestwerte, Einstellungen und Tastenbelegung. Lokales Spielen bleibt ohne Konto möglich. Das Cloud-Modul lädt das Firebase-SDK in der vorhandenen Version 10.12.2 erst für die Anmeldung bzw. eine bereits aktivierte Verbindung. Es behält die bisherige Regel bei: Der neuere gespeicherte Stand gewinnt. Bei einem geladenen Stand übernimmt Kiko die validierten Daten auch im geöffneten Menü; Spielstände anderer Spiele werden nicht mit hochgeladen.

Die lokale Kopie ermöglicht dieselbe Anmeldung sowohl aus dem EasyGames-Ordner als auch beim eigenständigen Start mit Vite oder aus `dist/`. Der vorhandene Vite-Kopierschritt übernimmt `vendor/` vollständig. Für die Anmeldung ist Netzwerkzugriff auf Google/Firebase erforderlich. Ein Zurücksetzen des Spielstands fragt ausdrücklich nach und weist auf die Synchronisierung des zurückgesetzten Stands hin.

## Durchgeführte Prüfungen

Siehe [TEST_RESULTS.md](TEST_RESULTS.md) für die ausgeführten Prüfungen und ihre Grenzen. Die vollständige Spiellogik wurde bei 30 und 60 simulierten Bildern pro Sekunde bis zum achten Portal geprüft. Eine grafische Browserprüfung und ein Produktionsbuild konnten in dieser Ausführungsumgebung wegen ihrer Prozess- und Netzwerkbeschränkungen nicht abgeschlossen werden.
