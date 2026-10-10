# Wobbel – Das Schiebe-Puzzle

Ein modernes 3D-Browser-Puzzlespiel im Sokoban-Prinzip von **RicoReWi**: Wobbel, ein kleiner rosa Blob, schiebt Kisten auf Zielfelder – durch fünf bunte Welten. Alle Level sind handentworfen und werden automatisch auf Lösbarkeit geprüft – **nur vom Löser bestätigte Level kommen ins Spiel** (aktuell 30, weitere folgen laufend).

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
    └── e2e …               Browser-Test (Playwright), siehe unten
```

## Tests

```bash
cd wobbel
node tests/engine-tests.js                                   # Regeln (Schieben, Wasser, Eis, Farben, Schlüssel …)
node --max-old-space-size=4096 tests/check-levels.js         # alle Level: Aufbau, Lösbarkeit, Züge/Schübe/Zustände
node --max-old-space-size=4096 tests/build-par.js            # Level verifizieren, Par-Werte + Freigabe neu berechnen (js/game/levels/par.js)
```

`check-levels.js` löst jedes Level per Breitensuche über sämtliche Spielzüge, **spielt die gefundene Lösung mit der echten Spiellogik nach** und meldet jedes unlösbare oder zu große Level.

## Eigene Level

Level sind einfache Textkarten (`js/game/levels/worldN.js`):

```
#   Wand            ' ' Boden          @  Wobbel
$   Kiste           r g b  farbige Kiste     .  Zielfeld     R G B  farbiges Ziel
~   Wasser          i  Eis             1 2 3  Farbklecks rot/grün/blau
k   Schlüssel       D  Tür
```

Alles außerhalb der Wände wird automatisch zu Meer. Nach dem Ändern: `check-levels.js` und `build-par.js` laufen lassen.
