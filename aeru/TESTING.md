# Tests

Alle Befehle aus dem Ordner `aeru/` ausführen. Node 18+ genügt; nur der Browsertest braucht Playwright.

| Befehl | Dauer (ca.) | Prüft |
|---|---|---|
| `node tests/story.cjs` | wenige Sekunden | komplette Hauptgeschichte vom Neustart bis zum Abspann |
| `node tests/logic.cjs` | wenige Sekunden | Steuerung, Physik, Kampf, Negativfälle, Spielstände, Erreichbarkeit |
| `node tests/landing.cjs` | < 5 s | Landung auf den schwebenden Inseln (Landehilfe) |
| `node tests/culling.cjs` | < 5 s | Landschaft verschwindet nicht per Frustum-Culling |
| `node tests/webview.cjs` | < 5 s | 2D-Ersatzmodus ohne WebGL |
| `NODE_PATH=$(npm root -g) node tests/browser.cjs` | ca. 5 min | echtes Chromium in 9 Viewports, Screenshots, Bildzeiten |

`story`, `logic` und `webview` laden das echte Spiel (alle vier Skripte) mit echter Three.js-r128-Geometrie in eine Node-VM (`tests/harness.cjs`). Nur Zeichnen und DOM sind Attrappen; Physik, Quests, Kampf und Speichern laufen unverändert.

## Story-Validierung (`story.cjs`)

Der Test setzt **keine Flags**. Er liest wie ein Spieler das aktuelle Ziel und den Zielpfeil und führt echte Aktionen aus: hingehen (Teleport in die Nähe), mit der Figur sprechen, Laternen per Windstoß von einem festen Standplatz aus wecken, Gegner besiegen, Gegenstände und Ringe einsammeln, Bosskämpfe mit Springen über Wellen, Ausweichen vor Warnkreisen, Schlägen bei offenem Schild und Ankerzerstörung im Flug. Geprüft wird:

- alle 6 Kapitel und 10 Hauptquests werden durchlaufen, alle 6 Kerne erhalten, beide Bosse besiegt;
- die 32 Storydialoge erscheinen genau einmal und in der vorgesehenen Reihenfolge;
- Abspann erscheint, danach freies Weiterspielen, Inselwahl, Reaktionen der Figuren auf das Ende, Vesper wohnt im Hafen;
- der gespeicherte Stand enthält das abgeschlossene Finale.

## Logik und Negativfälle (`logic.cjs`)

- Laufen und Abbremsen, variable Sprunghöhe, Coyote Time, Sprungpuffer, Gleiten, Treppe mit echten Sprüngen, unter Plattformen hindurchlaufen.
- Flug: Steigen kostet Kraft, Sinken, Landung, Aufladen, Aufwind; echter Hin- und Rückflug zur Außeninsel per Tasten-Autopilot.
- Kantenhilfe und Kantenschutz an der Ostinsel, fester Fels unter Inseln.
- Vom Startpunkt in acht Richtungen loslaufen: Aeru kommt weg, versinkt nicht, steckt nie in einer Baumkrone, die Kamera nie im Laub; kein Sammelobjekt, keine Laterne, kein Ring und keine Figur steckt in einem Baum.
- Kamera bleibt über dem Boden, Ausweichen.
- 30/60/120 Hz ergeben dieselbe Laufstrecke.
- Kampf: Angriffe werden angekündigt, Schaden nur in der Angriffsphase, Windstoß trifft, Tod setzt am Rastpunkt zurück.
- **Negativfälle:** Quest zu früh abschließen (Figur erneut ansprechen), Folgequest bleibt gesperrt, Dialog doppelt auslösen, gesperrtes Tor und gesperrte Inselwahl, Pause im Dialog (Dialog setzt an derselben Zeile fort), Speichern/Laden mitten in einer Quest, keine doppelten Splitter nach dem Laden, Boss zu früh (kein Kampf, kein Schaden), Tod im Bosskampf (Arenaeingang, Boss auf Phasenbeginn, Quest bleibt).
- **Spielstände:** Version 1 mit altem Vesper-Sieg → Kapitel 4; Version 2 mit allen sechs alten Inseln → neues Finale wartet und ist bis zum Abspann spielbar; widersprüchliche Kerne und halbes Laternenrätsel; leerer `{version:3}`; unmögliche Abschlüsse werden verworfen; unlesbarer Stand wird gesichert, nicht gelöscht.
- Splitter-Upgrades: Flügelkraft bei 24, alle 144 Splitter auf sechs Inseln einsammelbar, zwei Zusatzherzen, Sternenglanz hält die Flügelkraft beim Steigen voll.
- **Erreichbarkeit:** Auf allen 6 Inseln stehen Splitter, Laternen und Rastpunkte auf festem Boden; versteckte Stufen im Bernsteinhain mit echten Sprüngen, Kristallturm per Aufwind, je ein Ring pro Ringinsel im echten Flug.

## Browser und Geräte (`browser.cjs`)

Chromium 141 (Playwright 1.56) headless, Viewports 1920×1080, 1366×768, 1280×720, 360×800, 390×844, 412×915, 800×360, 915×412 und 904×407 mit Pixelverhältnis 3 (Querformat wie im Fehlerbericht vom 11.10.2026); Handys mit Touch-Emulation und Pixelverhältnis 2. Pro Viewport: Start, Dialog vollständig sichtbar, echte Bewegung per Taste bzw. Touch-Stick, keine Überlappung der Bedienelemente (Herzen, Zähler, Pause, Ziel, Karte, Flügelkraft, Stick, Aktionstasten, Bossanzeige), kein horizontaler Überlauf, Pausenknöpfe mindestens 32 px hoch, keine Konsolenfehler. Screenshots (Titel, Dialog, Spiel, Pause, Tagebuch, Einstellungen) landen in `tests/screenshots/` (nicht im Repository).

Die Prüfung läuft im Flug, damit auch die Flügelkraftanzeige zwischen den Bedienelementen Platz haben muss.

Letzter Lauf: **alle 9 Viewports bestanden.**

### Messwerte – bitte richtig lesen

Diese Umgebung hat keine GPU. Chromium rendert mit **SwiftShader (Software auf der CPU)**. Die Werte sind deshalb **keine** Smartphone- oder Grafikkarten-Messungen, sondern nur ein Vergleich der Stufen auf dieser Maschine:

| | Draw Calls | Dreiecke | FPS (SwiftShader) |
|---|---|---|---|
| Desktop, Hoch | 184–194 | ~22 000 | 10–18 |
| Desktop, Sparsam | 164–167 | ~20 000 | 10–17 |
| Handy hochkant, Ausgewogen (auto) | 104–117 | ~18 000 | 10–17 |
| Handy hochkant, Sparsam | 98–113 | ~18 000 | 12–21 |
| Handy quer, Ausgewogen (auto) | 175–180 | ~21 000 | 10–16 |

Die Automatik hat in den Läufen die Auflösung gesenkt (×1 → ×0,85 bzw. ×1,06 → ×0,88), wie vorgesehen. Wie schnell das Spiel auf echten Handys läuft, ist **nicht gemessen**. Die Leistungsanzeige (Einstellungen → Leistungsanzeige) zeigt auf jedem Gerät FPS, Bildzeit, Draw Calls, Dreiecke, Auflösung und Stufe.

## Andere Spiele

Geändert wurden nur Dateien in `aeru/` und die Beschreibung im Spielekatalog (`index.html` im Hauptordner).
