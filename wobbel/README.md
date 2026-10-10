# Wobbel – Das Schiebe-Puzzle

Ein modernes 3D-Browser-Puzzlespiel im Sokoban-Prinzip von **RicoReWi**: Wobbel, ein kleiner rosa Blob, schiebt Kisten auf Zielfelder – durch fünf bunte Welten. **55 Level in 5 Welten**, alle automatisch auf Lösbarkeit geprüft – **nur vom Löser bestätigte Level kommen ins Spiel**.

## Starten

Das Spiel besteht nur aus statischen Dateien (HTML, CSS, JavaScript-Module, Three.js r128 per CDN). Es braucht einen kleinen Webserver, weil Browser ES-Module nicht von `file://` laden:

```bash
cd wobbel
python3 -m http.server 8080        # oder: npm run serve
# dann http://localhost:8080 öffnen
```

Auf GitHub Pages läuft es unverändert unter `…/easygames/wobbel/`. Zum Ausprobieren aller Level ohne Freischalten: `?unlock=1` an die Adresse hängen, ein bestimmtes Level direkt starten: `?level=12`.

## Spielregeln

- Wobbel kann Kisten nur **schieben** (nicht ziehen, nicht zwei auf einmal).
- Ein Level ist geschafft, wenn **jedes Zielfeld** eine passende Kiste trägt.
- Fünf Welten führen neue Elemente ein:

| Welt | Neues Element |
|---|---|
| 🌳 Wiesenhain | klassisches Schieben |
| 🏖️ Sandstrand | **Wasser** – eine hineingeschobene Kiste baut eine Brücke (und ist dann verbraucht) |
| 🎨 Farbfabrik | **Farben** – rote/grüne/blaue Kisten gehören auf Felder derselben Farbe; **Kleckse** färben Kisten um |
| ❄️ Eishöhle | **Eis** – Kisten rutschen weiter, bis sie anstoßen |
| 🏰 Zauberschloss | **Schlüssel & Türen** – und alles zusammen |

- Sterne gibt es nach der Zahl der Züge im Vergleich zur kürzesten Lösung (Par). Der Fortschritt (Level, Bestzüge, Sterne, Einstellungen) wird im Browser gespeichert (`localStorage`). Das nächste Level wird nach dem Abschluss des vorherigen freigeschaltet.

## Steuerung

| Aktion | Desktop | Handy / Tablet |
|---|---|---|
| Bewegen | Pfeiltasten oder WASD | Wischen/Ziehen auf dem Spielfeld, optionales Steuerkreuz |
| Hinlaufen | Klick auf ein Feld | Tippen auf ein Feld |
| Zug zurück | `Z` / `Backspace` / ↶ | ↶ |
| Neustart | `R` / ⟲ | ⟲ |
| Kamera drehen | `Q` / `E` / ⟳ | ⟳ |
| Menü | `Esc` / ☰ | ☰ |

Die Richtungen sind **bildschirmbezogen**: „hoch" bewegt Wobbel in die Richtung, die auf dem Bildschirm am ehesten nach oben zeigt – auch nach dem Drehen der Kamera.

## Projektstruktur

```
wobbel/
├── index.html              Einstiegsseite (Menüs, HUD, Dialoge)
├── css/style.css           Gestaltung
├── js/
│   ├── main.js             Start, Menüs, Spielablauf, Sterne/Speichern
│   ├── input.js            Tastatur, Wischen, Tippen, Steuerkreuz
│   ├── audio.js            Soundeffekte + Musik (WebAudio, keine Audiodateien)
│   ├── storage.js          Fortschritt & Einstellungen
│   ├── editor/             Level-Editor: editor.js (Raster-Editor), codec.js (Prüfung, Teilen-Codes), custom-levels.js (Speicher), solve-worker.js (Löser im Worker)
│   ├── game/
│   │   ├── engine.js       Spielregeln (rein, ohne Grafik) – auch vom Test benutzt
│   │   ├── solver.js       Breitensuche, findet die kürzeste Lösung
│   │   ├── session.js      Zustand, Rückgängig, Neustart, Eingabepuffer
│   │   ├── worlds.js       Welten/Themen
│   │   └── levels/         world1.js … world5.js (je 11 Level), index.js, par.js (kürzeste Lösungen)
│   └── render/
│       ├── models.js       prozedurale Cartoon-Modelle (Figur, Kisten, Wände, Deko …)
│       └── scene.js        Three.js-Szene, Kamera, Animationen, Partikel
└── tests/
    ├── engine-tests.js     Regeltests der Spiellogik
    ├── check-levels.js     prüft Aufbau + Lösbarkeit aller Level (Breitensuche, spielt die Lösung nach)
    ├── build-par.js        berechnet Par-Werte und tests/solutions.json
    ├── editor-tests.js     Tests für Editor-Prüfung, Codes und Speicher (alle 55 Level laufen durch Kodierung)
    ├── e2e-editor.mjs      Browser-Test des Editors (malen, prüfen, testen, speichern, teilen)
    ├── e2e-play.mjs        Browser-Test (Playwright): spielt jedes Level mit der Löser-Lösung durch
    └── solutions.json      kürzeste Lösung je Level (von build-par.js erzeugt)
```

## Tests

```bash
cd wobbel
node tests/engine-tests.js                                   # Regeln (Schieben, Wasser, Eis, Farben, Schlüssel …)
node --max-old-space-size=4096 tests/check-levels.js         # alle Level: Aufbau, Lösbarkeit, Züge/Schübe/Zustände
node --max-old-space-size=4096 tests/build-par.js            # Level verifizieren, Par-Werte + Freigabe neu berechnen (js/game/levels/par.js)
```

Der Browser-Test `tests/e2e-play.mjs` (`npm i -D playwright`, Server starten, `npm run e2e`) spielt jedes Level mit der Lösung des Lösers im echten Spiel bis zum Level-Abschluss durch.

`check-levels.js` löst jedes Level per Breitensuche über sämtliche Spielzüge, **spielt die gefundene Lösung mit der echten Spiellogik nach** und meldet jedes unlösbare oder zu große Level.

## Level-Editor

Im Menü: **🛠 Level-Editor**. Eigene Level werden auf einem Raster gezeichnet (bis 16×14 Felder):

- **Malen:** Werkzeug wählen, klicken oder ziehen; Rechtsklick radiert. Meer außerhalb der Mauern wird live angezeigt. Strg+Z / Strg+Y, Größe ändern, „Rand mauern", Welt-Thema wählen.
- **Prüfen:** Das Statusfeld meldet Fehler (kein Wobbel, kein Ziel, mehr Ziele als Kisten …). „🔍 Prüfen" lässt den Löser (Web Worker, UI bleibt flüssig) die kürzeste Lösung suchen; „▶ Lösung ansehen" spielt sie vor.
- **Testen:** „▶ Testen" öffnet das Level im 3D-Spiel; wer es löst, bestätigt es damit als lösbar.
- **Speichern:** „Meine Level" (📁) liegt im Browser (`localStorage`) – spielen, bearbeiten, teilen, löschen.
- **Teilen:** Code `WOBBEL1-…` oder Link `…/wobbel/?code=…`. Wer den Link öffnet, spielt das Level direkt; „📥 Code einfügen" lädt einen Code in den Editor. Der Fortschritt der 55 Hauptlevel bleibt davon unberührt.

## Wie die Level entstanden sind

Die Level-Tutorials und die Insel-Formen sind von Hand entworfen. Viele der späteren Level wurden mit Hilfe einer Zufalls-/Hill-Climbing-Suche über handgezeichnete Vorlagen erzeugt (Objektpositionen, Eis, Wasser), vom Löser auf Lösbarkeit und Schwierigkeit geprüft und anschließend ausgewählt. Das Hilfswerkzeug für Welt 5 liegt unter `tests/tools/gen-world5.js`. Keines der Level stammt aus bekannten Sokoban- oder Pushy-Sammlungen.

## Eigene Level

Level sind einfache Textkarten (`js/game/levels/worldN.js`):

```
#   Wand            ' ' Boden          @  Wobbel
$   Kiste           r g b  farbige Kiste     .  Zielfeld     R G B  farbiges Ziel
~   Wasser          i  Eis             1 2 3  Farbklecks rot/grün/blau
k   Schlüssel       D  Tür
```

Alles außerhalb der Wände wird automatisch zu Meer. Nach dem Ändern: `check-levels.js` und `build-par.js` laufen lassen.
