# Stand der Überarbeitung

Grundlage: Masterprompt „AERU – Die Sterneninseln“ (Phasen A–F). Diese Datei listet nur, was tatsächlich gebaut und geprüft wurde. Stand: 11.10.2026.

## Umgesetzt und automatisch getestet

- **Durchgehende Geschichte** über 6 Kapitel mit Vesper als Mittelpunkt (Kapitel 3) und neuem Finale gegen die Stille (Kapitel 6), Abspann, freies Weiterspielen danach. → `tests/story.cjs`
- **Datengetriebene Quest-Engine** (`quests.js` + `story.js`): Zustände gesperrt/verfügbar/aktiv/Teilziel/bereit/abgeschlossen, Voraussetzungen, kein vorzeitiger Abschluss, rückwirkendes Zählen nur wo ausdrücklich erlaubt, keine doppelten Belohnungen. → `story.cjs`, `logic.cjs`
- **Zielfeld, Kompass, Lichtstrahl, Minikartenmarker, Tagebuch** mit Kapitelübersicht. → Zielpfeil wird von `story.cjs` für jeden Schritt benutzt; Tagebuch per Screenshot in allen Viewports geprüft.
- **Steuerung:** variable Sprunghöhe, Coyote Time, Sprungpuffer, Gleiten, vereinheitlichter Flug mit Ausdauer, Aufwinde, Ausweichen, Landung, keine unsichtbaren Wände. → `logic.cjs`
- **Bildratenunabhängigkeit** 30/60/120 Hz. → `logic.cjs`
- **Kampf** mit angekündigten Angriffen, Unverwundbarkeit, drei Gegnertypen, verzögertem Wiedererscheinen. **Bosse** mit Phasen, Rücksetzpunkt am Arenaeingang und Phasen-Checkpoint. → `story.cjs`, `logic.cjs`
- **Dialogsystem:** kein Doppelstart, pausensicher, Überspringen bekannter Dialoge, Reaktionen nach Meilensteinen. → `logic.cjs`, `story.cjs`
- **Spielstand-Migration** von Version 1/2 auf 3 inkl. altem Vesper-Finale und alter Sechs-Insel-Erweiterung, Sicherungskopien, Reparatur unvollständiger/widersprüchlicher Stände, unlesbare Stände werden gesichert statt gelöscht. → `logic.cjs`
- **Erreichbarkeit** aller Splitter, Laternen, Rastpunkte; versteckte Stufen, Kristallturm, Ringe im echten Flug. → `logic.cjs`
- **Mobile Oberfläche** ohne Überlappungen/Überläufe in 3 Desktop-, 3 Hochkant- und 2 Querformat-Viewports (Chromium, Touch-Emulation). → `browser.cjs`
- **2D-Ersatzmodus** ohne WebGL mit Hinweis, spielbar. → `webview.cjs`
- **Grafikstufen** Sparsam/Ausgewogen/Hoch/Automatisch; die Automatik senkt nachweislich die Auflösung bei langsamen Bildern. → `browser.cjs`

## Umgesetzt, aber nicht vollständig getestet

- **Leistung auf echten Geräten:** Nur unter SwiftShader (Software-Rendering, keine GPU) gemessen, siehe TESTING.md. Echte Handys und Grafikkarten wurden nicht getestet.
- **Touch auf echten Geräten:** Mehrfachberührung (Stick + Taste gleichzeitig), Safe Areas mit Notch und `100dvh` sind im Code berücksichtigt, aber nur per Emulation geprüft.
- **Audio:** Musik pro Insel, Lautstärke, Stummschaltung und Anhalten im Hintergrund sind gebaut; Klang und Lautstärkeverhältnis hat niemand angehört.
- **Verlorener WebGL-Kontext:** löst ein Neuladen aus (Spielstand bleibt); nicht künstlich ausgelöst getestet.
- **Einstellungen** (Empfindlichkeiten, Kamerahilfe, Textgeschwindigkeit, große Schrift, reduzierte Bewegung, Vollbild): werden gespeichert und angewendet, aber nicht jede Option einzeln automatisch geprüft.
- **Nebenquests:** Ablauf und Reihenfolge laufen über dieselbe Engine; im Story-Test wird nur Pip indirekt berührt, die übrigen fünf nicht vollständig durchgespielt.

## Offen

- Test auf echten Geräten (mindestens ein Android-Handy, ein iPhone, ein Notebook mit integrierter Grafik) und Eintrag der Messwerte in TESTING.md.
- Bäume und Gras bewegen sich nicht im Wind.
- Die Belohnung bei 144 Splittern ist nur eine Auszeichnung ohne Spieleffekt.
- Keine Controller-Unterstützung (Gamepad).
- Keine Sprachausgabe/Vertonung; Texte nur auf Deutsch.

## Bekannte Fehler und Grenzen

- Unter SwiftShader liegen die Bildraten bei 10–20 FPS; das sagt nichts über echte Geräte aus, zeigt aber, dass die Automatik bis zur Stufe Sparsam heruntergehen kann.
- Draw Calls liegen bei 100–195; auf sehr schwachen Geräten kann das trotz Stufe Sparsam begrenzen.
- Halb entzündete Laternen der Liedinsel aus alten Spielständen werden gelöscht (Hinweis erscheint), weil das Rätsel jetzt eine Reihenfolge hat.
- Nebenquests eines nicht abgeschlossenen alten Kapitels werden neu gespielt; gesammelte Splitter zählen dafür rückwirkend.

## Für die nächste Sitzung

Alle vier Tests müssen grün bleiben (`node tests/story.cjs`, `node tests/logic.cjs`, `node tests/webview.cjs`, Browsertest). Neue Quests nur in `story.js` anlegen; `AERU_QUESTS.validate(story)` prüft die Datenstruktur (läuft zu Beginn von `tests/story.cjs`).
