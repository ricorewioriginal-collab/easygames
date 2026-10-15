# KIKO – Das Geheimnis der Sterneninseln

Ein eigenständiges Three.js-Abenteuer mit 20 unterschiedlichen Leveln in vier Welten. Sämtliche Modelle, Effekte und Klänge entstehen im Browser. Das Spiel speichert Fortschritt und Einstellungen lokal und auf Wunsch über den bestehenden Google-Cloud-Speicher von EasyGames.

## Starten

Im Repository funktioniert `kiko-sterneninseln/index.html` direkt über einen statischen HTTP-Server. Zum Beispiel im Repository-Stamm: `python3 -m http.server 8000`, danach `http://localhost:8000/kiko-sterneninseln/` öffnen. Die gebündelte Three.js-Datei liegt im Spielordner.

Mit Node.js 18 oder neuer: `npm ci`, `npm run dev`, `npm test`, `npm run build`. Das Ergebnis liegt unter `dist/` und kann auf einem statischen Webserver veröffentlicht werden. Für die GitHub-Pages-Struktur von easygames reicht der Quellordner ohne Build.

## Steuerung

WASD oder Pfeiltasten bewegen Kiko. Leertaste springt, E interagiert, Maus ziehen dreht die Kamera, Esc pausiert. Auf dem Smartphone: linker Joystick, rechts Sprung- und Interaktionstasten, rechts wischen für die Kamera. Am Gamepad: linker und rechter Stick, A, X und Start. Das Spiel ist für Querformat ausgelegt.

Sammle pro Level fünf Kristalle. Drei versteckte Sterne sind optional. Bei Rätseln aktivierst du Schalter mit E oder der Interaktionstaste. Im letzten Level kündigt Violett den Angriff an. Überspringe Ring oder Drehbalken. Nach jedem Angriff leuchtet das Sternenherz 3,2 Sekunden blau: Gehe heran und drücke einmal AKTION. In dieser Zeit ist es sicher. Das aktive Portal beendet das Level.

## Technik

Three.js r128 liegt lokal unter `vendor/three.min.js` (MIT-Lizenz, siehe `vendor/LICENSE.three.txt`). Vite 5.4.21 ist nur für Entwicklung und Build nötig. Das Spiel funktioniert ohne Anmeldung. Der optionale Google-Cloud-Speicher nutzt dieselbe Firebase-Anbindung wie die anderen EasyGames-Spiele.

Die Level werden in `src/data.js` definiert. `src/scene.js` baut die 3D-Welt, `src/physics.js` bewegt Kiko, `src/input.js` liest Tastatur, Touch und Gamepad, `src/ui.js` verwaltet Menüs, `src/save.js` speichert lokal, `src/audio.js` erzeugt Töne, `src/game.js` verbindet die Systeme; `src/main.js` startet das Spiel.

## Überarbeitung – Fassung 7

Die Bewegung folgt der tatsächlichen Blickrichtung der Kamera. Links/rechts wurde anhand ihrer Matrix geprüft. Die Physik nutzt Teilzeitschritte bis 1/120 Sekunde, feste Plattformoberseiten, seitliche Kollisionen und Kollisionen an der Unterseite. Ein kurzer Sprungpuffer und eine kleine Kulanz an Kanten machen Sprünge verlässlicher. Nach einem Absturz erscheint Kiko wieder am sicheren Start oder Checkpoint.

Touchflächen unterbinden Browsergesten während der Steuerung. Joystick, Sprung und Kamerawischen besitzen getrennte Pointer. Aktionen enden auch nach einem Abbruch oder dem Loslassen außerhalb der Taste. Eine in eingebetteten Frames gesperrte Gamepad API blockiert die übrige Steuerung nicht.

Ein Missionsfenster erklärt den Einstieg. Während des Spielens zeigt ein dauerhafter Zielkompass den nächsten Kristall, notwendigen Schalter oder das Portal. Pflichtschalter werden vor späteren Kristallen hinter einem Tor angefordert. Sprung und Aktion sind beschriftet. Blaue Kristalle tragen sichtbare Lichtmarkierungen; Bonussterne und Kikos Abzeichen haben eine Sternform. Die Farben der Standardmaterialien werden für Three.js r128 korrekt aus sRGB umgerechnet.

## Figuren, Spielmechaniken und Landschaft – Fassung 9

Über **Figur wählen** im Hauptmenü oder **Figur wechseln** in der Pause stehen vier vollständig modellierte Figuren bereit. Ihre Wahl wird lokal und mit dem Google-Spielstand gespeichert. Ein Wechsel in der Pause erhält Position, Herzen und Levelzustand.

- Kiko: ausgeglichen; besonders weiter Sternenpuls.
- Mira: Mondohren und höhere Sprünge.
- Boro: Felsenhörner; ein Schutzschild pro Level. Figurenwechsel laden einen verbrauchten Schild nicht neu auf.
- Lumi: kleine Flügel; höheres Lauftempo und kürzere Pulsaufladung.

Abseits von Rätselobjekten löst **E / X / AKTION** einen Sternenpuls aus, der nahe Schattenwesen für 3,5 Sekunden betäubt. Eine Anzeige zeigt die Aufladung. In der Nähe eines Schalters betätigt dieselbe Taste das Rätselobjekt. Schattenhüpfer können auch durch eine Landung von oben betäubt werden; die Figur federt dabei ab. Fliegern muss ausgewichen werden oder der Puls hilft.

Bonussterne heilen jeweils ein Herz, Checkpoints füllen beim ersten Erreichen alle Herzen auf. Schnelle Kristallketten geben Zusatzpunkte. Pro Level werden Bestzeit, Anzahl Abschlüsse und beste Medaille gespeichert: Gold für drei Sterne ohne Schaden und Sturz, Silber für mindestens zwei Sterne, sonst Bronze.

Die Landschaft besitzt abgerundete Inselkanten, geschwungene Bodenwege, Felsunterbauten, schwebende Hintergrundinseln, Wolken und Lichtpartikel mit unterschiedlichen Weltfarben. Die ersten passenden Übergänge erhalten begehbare, sanft gekrümmte Aufgänge. Deren sichtbare Geometrie und Kollisionshöhe werden aus denselben Terrainfunktionen erzeugt. Wald und Frostwelt haben zusätzliche Seiteninseln für Bonussterne. Blinkende Zeitplattformen warnen vor dem Verschwinden. Niedrige Grafikqualität und die automatische Leistungsreduktion schalten Schatten ab.

Die **Abenteuer-Anleitung** bietet vier Kapitel: Mission, Geräte-Steuerung mit der aktuellen Tastenbelegung, Überlebensregeln und ein Tagebuch zu allen 20 Inselrätseln. Beim ersten Einstieg gibt es eine dreiseitige Einführung und Spieltipps, die auf Bewegung, Sammeln und Springen reagieren. Die Einführung kann direkt übersprungen werden.

## Google-Spielstand – Fassung 8

Im Hauptmenü, in der Pause, in den Einstellungen und nach einem Levelabschluss gibt es die aufklappbare Karte **Google-Spielstand**. Dort stehen Anmeldung, Kontoprofil, manuelles Sichern, Wiederherstellung des Cloud-Stands, die vorhandene ältere Sicherung und Abmeldung zur Verfügung. Während des Spiels wird die Karte ausgeblendet.

Die Datei `vendor/anmacha-cloud.js` ist eine unveränderte lokale Kopie des vorhandenen EasyGames-Moduls `cloud/anmacha-cloud.js` (Git-Blob `bf9fa7a5d110224d4938e08701d15b3f4d7d34c7`). Sie wird mit `data-game="kiko-sterneninseln"` und `data-prefix="kiko-sterneninseln-v1"` eingebunden. Dadurch nutzt Kiko die vorhandene Google/Firebase-Konfiguration und einen eigenen Spielstand unter `users/<uid>/saves/kiko-sterneninseln`. An Firebase-Konfiguration und Firestore-Regeln wurde nichts geändert. Bei zukünftigen Änderungen des gemeinsamen Cloud-Moduls sollte diese Kopie mit aktualisiert werden.

Gesichert werden die freigeschalteten Level, Bonussterne, Bestwerte, Einstellungen und Tastenbelegung. Lokales Spielen bleibt ohne Konto möglich. Das Cloud-Modul lädt das Firebase-SDK in der vorhandenen Version 10.12.2 erst für die Anmeldung bzw. eine bereits aktivierte Verbindung. Es behält die bisherige Regel bei: Der neuere gespeicherte Stand gewinnt. Bei einem geladenen Stand übernimmt Kiko die validierten Daten auch im geöffneten Menü; Spielstände anderer Spiele werden nicht mit hochgeladen.

Die lokale Kopie ermöglicht dieselbe Anmeldung sowohl aus dem EasyGames-Ordner als auch beim eigenständigen Start mit Vite oder aus `dist/`. Der vorhandene Vite-Kopierschritt übernimmt `vendor/` vollständig. Für die Anmeldung ist Netzwerkzugriff auf Google/Firebase erforderlich. Ein Zurücksetzen des Spielstands fragt ausdrücklich nach und weist auf die Synchronisierung des zurückgesetzten Stands hin.

## 20 Level – Fassung 10

Die Kampagne besitzt vier Welten mit je fünf Leveln und insgesamt 100 Pflichtkristallen und 60 optionalen Bonussternen. Alle 20 Level besitzen eigene Namen, explizit definierte Inselanordnungen und eigene Aufgaben. Die zusätzlichen Level haben sieben oder acht Hauptinseln, unterschiedlich verlaufende Höhenprofile und kombinieren die Mechaniken in verschiedenen Reihenfolgen. [LEVELS.md](LEVELS.md) führt alle Abschnitte mit ihren Aufgaben auf.

Neue Funktionen:

- **Sternenplatten:** rund 0,65 Sekunden ununterbrochen darauf stehen, bis die Platte dauerhaft aufleuchtet.
- **Leuchtfeuer:** mit dem Sternenpuls entzünden. Bereits aktive Feuer zählen nicht erneut.
- **Uhrtore:** ein Schalter öffnet das Tor für 18 oder 26 Sekunden. Ein sichtbarer Countdown zeigt die Restzeit. Nach Ablauf kann der Schalter erneut gestartet werden.
- **Bröckelnde Inseln:** verschwinden 1,5 Sekunden nach dem Betreten und erscheinen nach 3 Sekunden wieder. Die Oberfläche warnt durch oranges Blinken.
- **Federpilze:** geben automatisch einen hohen Sprung; eine kurze Sperre verhindert mehrfaches Auslösen im selben Sprung.
- **Windzonen:** sichtbare Windfahnen und lokale Böen, gegen die gegengesteuert werden kann.
- **Energiebahnen:** bewegliche magentafarbene Strahlen, die übersprungen werden können.

Der Kompass führt auf längeren, verschlungenen Wegen über die jeweils nächste Insel. Schlüssel, Schalter, Platten und Leuchtfeuer werden vor späteren Kristallen eingeplant. Das Finale folgt erst nach Level 20. Die vier Figuren und die Google-Cloud-Anmeldung bleiben verfügbar.

### Vorhandene Spielstände

Das Datenformat wird auf Version 2 erweitert, der lokale Schlüssel `kiko-sterneninseln-v1` und das Cloud-Dokument bleiben stabil. Alte Acht-Level-Spielstände werden anhand der ursprünglichen Levelidentitäten auf die neuen Plätze **1, 2, 6, 7, 11, 12, 16 und 20** übertragen. Sterne, Bestwerte, Medaillen, Zeiten, Figurenwahl, Einstellungen und Tasten bleiben erhalten. Bereits verfügbare alte Abschnitte bleiben erreichbar. „Spielen“ setzt bei der ersten noch nicht abgeschlossenen verfügbaren Insel an, sodass die neu eingefügten Level angeboten werden.

## Bosskampf – Fassung 11

Die bisherige Trefferprüfung des Bossbalkens ignorierte die Sprunghöhe. Dieser Fehler ist behoben: Ring und Drehbalken sind niedrige Hindernisse, die jede Figur mit ihrem normalen Sprung überwinden kann. Sichtbare Angriffe und Kollisionen verwenden denselben zeitlichen Ablauf und dieselbe Geometrie aus `src/boss.js`. Der Ring trifft nur an seinem wachsenden Rand, der Balken entlang seiner tatsächlichen Drehung und Länge.

Jede der drei Phasen hat eine 1,2 Sekunden lange violette Vorwarnung, einen Angriff und anschließend ein **3,2 Sekunden langes blaues Aktionsfenster ohne Bossangriffe**. Ein Treffer startet die nächste Phase wieder mit einer vollständigen Vorwarnung. Die Aktionsreichweite beträgt 2,5 Schritte. Herangehen und einmal **E / X / AKTION** drücken; die Säule selbst muss nicht angeklickt werden. Der Zielkompass zeigt Warnzeit, einen positionsabhängigen Hinweis **JETZT SPRINGEN** und die verbleibende sichere Zeit bei Blau. Die Sprungwerte der Figuren bleiben erhalten.

## Durchgeführte Prüfungen

Siehe [TEST_RESULTS.md](TEST_RESULTS.md) für die ausgeführten Prüfungen und ihre Grenzen. Die vollständige Spiellogik wurde bei 30 und 60 simulierten Bildern pro Sekunde bis zum zwanzigsten Portal geprüft. Eine grafische Browserprüfung und ein Produktionsbuild konnten in dieser Ausführungsumgebung wegen ihrer Prozess- und Netzwerkbeschränkungen nicht abgeschlossen werden.
