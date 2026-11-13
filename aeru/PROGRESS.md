# Stand der Überarbeitung

Grundlage: Masterprompt „AERU – Die Sterneninseln“ (Phasen A–F). Diese Datei listet nur, was tatsächlich gebaut und geprüft wurde. Stand: 13.11.2026.

## Umgesetzt und automatisch getestet

- **Durchgehende Geschichte** über 6 Kapitel mit Vesper als Mittelpunkt (Kapitel 3) und neuem Finale gegen die Stille (Kapitel 6), Abspann, freies Weiterspielen danach. → `tests/story.cjs`
- **Datengetriebene Quest-Engine** (`quests.js` + `story.js`): Zustände gesperrt/verfügbar/aktiv/Teilziel/bereit/abgeschlossen, Voraussetzungen, kein vorzeitiger Abschluss, rückwirkendes Zählen nur wo ausdrücklich erlaubt, keine doppelten Belohnungen. → `story.cjs`, `logic.cjs`
- **Zielfeld, Kompass, Lichtstrahl, Minikartenmarker, Tagebuch** mit Kapitelübersicht. → Zielpfeil wird von `story.cjs` für jeden Schritt benutzt; Tagebuch per Screenshot in allen Viewports geprüft.
- **Steuerung:** variable Sprunghöhe, Coyote Time, Sprungpuffer, Gleiten, vereinheitlichter Flug mit Ausdauer, Aufwinde, Ausweichen, Landung, keine unsichtbaren Wände. → `logic.cjs`
- **Bildratenunabhängigkeit** 30/60/120 Hz. → `logic.cjs`
- **Kampf** mit angekündigten Angriffen, Unverwundbarkeit, drei Gegnertypen, verzögertem Wiedererscheinen. **Bosse** mit Phasen, Rücksetzpunkt am Arenaeingang und Phasen-Checkpoint. → `story.cjs`, `logic.cjs`
- **Dialogsystem:** kein Doppelstart, pausensicher, Überspringen bekannter Dialoge, Reaktionen nach Meilensteinen. → `logic.cjs`, `story.cjs`
- **Spielstand-Migration** von Version 1/2 auf 3 inkl. altem Vesper-Finale und alter Sechs-Insel-Erweiterung, Sicherungskopien, Reparatur unvollständiger/widersprüchlicher Stände, unlesbare Stände werden gesichert statt gelöscht. → `logic.cjs`
- **Splitter-Belohnungen:** alle 144 Splitter sind einsammelbar; Sternenglanz (144) macht die Flügelkraft unbegrenzt und färbt die Flugspur golden. → `logic.cjs`
- **Erreichbarkeit** aller Splitter, Laternen, Rastpunkte; versteckte Stufen, Kristallturm, Ringe im echten Flug. → `logic.cjs`
- **Mobile Oberfläche** ohne Überlappungen/Überläufe in 3 Desktop-, 3 Hochkant- und 3 Querformat-Viewports (Chromium, Touch-Emulation), auch im Flug. Kompakte Questanzeige und neu geordnete Touch-Tasten nach dem Fehlerbericht vom 11.10.2026. → `browser.cjs`
- **Kollision:** Fels unter Inseln folgt der sichtbaren Form, Kantenhilfe bis 1,3 m, Flügelkraft lädt im Flug ohne Steigen langsam nach (Fehlerbericht „man fällt durch“). → `logic.cjs`
- **2D-Ersatzmodus** ohne WebGL: schräge Pseudo-3D-Ansicht mit sichtbarer Höhe (Inseln mit Dicke, Schatten und Landering am Boden, Höhenlinie, Tiefensortierung). → `webview.cjs`
- **Grafikstufen** Sparsam/Ausgewogen/Hoch/Automatisch; die Automatik senkt nachweislich die Auflösung bei langsamen Bildern. → `browser.cjs`

- **Erweiterung (Himmelsinseln, Rammstoß, Nachtgarten):** 21 Himmelsinseln mit Truhen und Schwung-Ringen, Rammstoß, siebte Welt mit eigener Geschichte (Epilog), neuen Gegnern (Nachtmotte, Wurzelwächter) und Boss (Nachtblüte). → `sky.cjs`, `neu.cjs`, `story.cjs`
- **Spyro-Ausbau, Schritt 1 (13.11.2026):** Spieleportale zur Bunten Insel und nach Zotik in allen 7 Welten mit Rückweg-Knopf in beiden Spielen, analoge Controller-Steuerung (Sticks, Vibration, PlayStation-/Switch-Symbole), Ladebild, Weltkarte beim Betreten, modernisiertes Titelbild mit Fortschritt. → `portale.cjs`, `browser.cjs`; Controller und Rückweg zusätzlich im echten Chromium mit nachgebautem DualSense geprüft.
- **Spyro-Ausbau, Schritt 2 (13.11.2026):** freie CC0-Modelle – Bäume, Felsen und Gras von Wizp je Welt (instanziert), alle fünf Gegnerarten als animierte Quaternius-Monster; Rückfall auf die eigenen Formen bei „Sparsam“, ohne WebGL oder bei Ladefehlern; Seitenfelsen sind jetzt fest. → `browser.cjs` (über HTTP, alle Gegner mit Modell), alle Logiktests
- **Spyro-Ausbau, Schritt 3 (13.11.2026):** Ansturm (Rammtaste halten), Schatzkörbe in allen Welten, Lichtfalter (heilen), Begleiter Funkel (Lebensfarbe, Splitter-Magnet), Splitter-Kette im Ton, neue Klänge für Korb, Falter und Ansturm, Hinweise beim ersten Mal. → `tests/spyro.cjs`, alle Logiktests
- **Spyro-Ausbau, Schritt 4 (13.11.2026):** Welten etwa dreimal so groß – vier Gebiete je Welt mit Brücken, Edelsteine in fünf Farbwerten, Schatzkörbe mit Edelsteinen, 28 Kristalldrachen zum Befreien, ein Eierdieb je Welt, Weltentore (hineinlaufen = nächste/vorige Welt ohne Menü), größere Sichtweite. → `tests/welten.cjs`, alle Logiktests
- **Spyro-Ausbau, Schritt 5 (13.11.2026):** Feueratem statt Windstoß (Flammen, Klang, Texte), Sprachausgabe für alle Dialoge (abschaltbar), ein Wächter je Welt im Westgebiet mit lila Edelstein. → `tests/welten.cjs`
- **Spyro-Ausbau, Schritt 6 (13.11.2026):** Heimatwelt „Heimathain“ in Welt 1 mit Ältestem Ormun und sechs Levelportalen (öffnen mit dem Leuchtkern der Vorwelt), Heimtor in jeder anderen Welt, Gleiten per Doppelsprung wie auf der PS1 (ohne Flügelkraft, Ramm lässt fallen, dritter Druck = Flug). → `tests/welten.cjs`, `tests/spyro.cjs`

## Umgesetzt, aber nicht vollständig getestet

- **Leistung auf echten Geräten:** Nur unter SwiftShader (Software-Rendering, keine GPU) gemessen, siehe TESTING.md. Echte Handys und Grafikkarten wurden nicht getestet.
- **Touch auf echten Geräten:** Mehrfachberührung (Stick + Taste gleichzeitig), Safe Areas mit Notch und `100dvh` sind im Code berücksichtigt, aber nur per Emulation geprüft.
- **Audio:** Musik pro Insel, Lautstärke, Stummschaltung und Anhalten im Hintergrund sind gebaut; Klang und Lautstärkeverhältnis hat niemand angehört.
- **Verlorener WebGL-Kontext:** löst ein Neuladen aus (Spielstand bleibt); nicht künstlich ausgelöst getestet.
- **Einstellungen** (Empfindlichkeiten, Kamerahilfe, Textgeschwindigkeit, große Schrift, reduzierte Bewegung, Vollbild): werden gespeichert und angewendet, aber nicht jede Option einzeln automatisch geprüft.
- **Modelle auf echten Handys:** Auf „Hoch“/„Ausgewogen“ zeichnet eine Welt jetzt ca. 120–180k Dreiecke (vorher ~22k) bei etwa gleich vielen Draw Calls; unter SwiftShader gemessen, nicht auf echter Hardware. Die Automatik fällt bei langsamen Bildern auf „Sparsam“ (eigene Formen) zurück, wirksam ab der nächsten Insel.
- **Controller an echter Hardware:** Erkennung, Symbole und Analogsteuerung nur mit nachgebautem Controller im Browser geprüft; Vibration nur im Code (Chromium headless hat keine).
- **Nebenquests:** Ablauf und Reihenfolge laufen über dieselbe Engine; im Story-Test wird nur Pip indirekt berührt, die übrigen fünf nicht vollständig durchgespielt.

## Offen

- Test auf echten Geräten (mindestens ein Android-Handy, ein iPhone, ein Notebook mit integrierter Grafik) und Eintrag der Messwerte in TESTING.md.
- Bäume und Gras bewegen sich nicht im Wind.
- Sprachausgabe nutzt die Stimme des Geräts (keine eigene Vertonung); Texte nur auf Deutsch.
- Spyro-Ausbau, nächste Schritte: Aeru selbst bleibt das eigene Modell (der freie Quaternius-Drache kann nur fliegen, nicht laufen); mehr Sound-Effekte und Animationen.

## Bekannte Fehler und Grenzen

- Unter SwiftShader liegen die Bildraten bei 10–20 FPS; das sagt nichts über echte Geräte aus, zeigt aber, dass die Automatik bis zur Stufe Sparsam heruntergehen kann.
- Draw Calls liegen bei 100–195; auf sehr schwachen Geräten kann das trotz Stufe Sparsam begrenzen.
- Halb entzündete Laternen der Liedinsel aus alten Spielständen werden gelöscht (Hinweis erscheint), weil das Rätsel jetzt eine Reihenfolge hat.
- Nebenquests eines nicht abgeschlossenen alten Kapitels werden neu gespielt; gesammelte Splitter zählen dafür rückwirkend.

## Für die nächste Sitzung

Alle vier Tests müssen grün bleiben (`node tests/story.cjs`, `node tests/logic.cjs`, `node tests/webview.cjs`, Browsertest). Neue Quests nur in `story.js` anlegen; `AERU_QUESTS.validate(story)` prüft die Datenstruktur (läuft zu Beginn von `tests/story.cjs`).
