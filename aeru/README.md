# AERU – Die Sterneninseln

Eigenständiges, abgeschlossenes 3D-Drachenabenteuer für Desktop- und mobile Browser. Start: `index.html`; kein Build, kein Backend, keine externen Downloads. Im Hauptverzeichnis der Spielesammlung eingetragen.

## Spielen

- WASD / Pfeiltasten: bewegen. Maus ziehen oder Q/E: Kamera drehen.
- Leertaste: springen; in der Luft erneut drücken: Flügelschlag. Halten: gleiten.
- G / FLUG: abheben und Flug aktivieren; erneut drücken: landen. Aufwinde laden die Flügelkraft auf.
- Umschalt: Sprint. C: Kamera hinter Aeru ausrichten.
- F / WIND halten: wiederholte, sichtbare Windwirbel mit sieben Metern Reichweite. R: sprechen, Dialog fortsetzen, Portal benutzen.
- Escape / Pauseknopf: Pause, Ton, sparsame Grafik, Rettung zum Startpunkt und Auswahl bereits erreichter Inseln.
- Menüs: Pfeiltasten oder W/S wählen, Enter bestätigt. Dialoge: R, Leertaste oder Klick/Tippen (erster Druck zeigt den ganzen Satz).
- Handy: linker Joystick, rechts Kamera ziehen, FLUG zum Abheben/Landen, SPRUNG zum Flügelschlag, WIND und REDEN.

Entzünde drei Windlaternen pro Insel durch einen gerichteten Windstoß. Sammle mindestens zwölf Splitter und sprich mit dem örtlichen Hüter, um einen Leuchtkern zu erhalten. Das Tor am Ende der Treppe führt weiter. Auf der dritten Insel wartet Vesper: seinen Sturmring überspringen und das offene Schild mit Wind treffen. Nach dem Ende können alle Inseln erneut erkundet werden.

Sechs Gebiete (Windwiesen, Bernsteinhain, Sternenwarte, Wolkenriffe, Kristallklamm, Morgenruinen), 18 NPCs, 144 Splitter, sechs Nebenaufträge, sechs Leuchtkerne, Gegner, Boss, Epilog und freie Erkundung. Die beiden Außeninseln jeder Welt enthalten die Gegenstände für den jeweiligen Nebenauftrag.

Die drei neuen Inseln folgen auf das ursprüngliche Bossfinale. Jede verlangt zusätzlich drei durchflogene Himmelsringe; die Kristallklamm hat erhöhte Laternenplattformen. Aufwind trägt bis zu deren Höhe.

Alte Spielstände werden automatisch auf sechs Inseln erweitert; Splitter, Aufgaben und Bossabschluss bleiben erhalten. Der Spielstand wird unter `aeru-save-v1` im Browser gespeichert. Inselaufgaben und Bossfortschritt bleiben erhalten; die Position beginnt beim Fortsetzen am sicheren Inselstart. „Neues Abenteuer“ startet eine neue Reise. Kein Cloud-Speicher. Audio beginnt erst nach Interaktion. Bei blockiertem Speicher bleibt die aktuelle Sitzung spielbar.

## Technik und Prüfung

Three.js r186 liegt lokal unter `vendor/three.min.js` – als klassisches Skript gebündelt und auf die 30 tatsächlich genutzten Klassen reduziert (546 KB statt 603 KB bei r128). Neu bauen: in einem leeren Ordner `npm i three@0.186.1 esbuild`, eine Einstiegsdatei mit `import {…} from 'three'; globalThis.THREE={…};` anlegen und `npx esbuild entry.js --bundle --format=iife --minify` ausführen; als Footer `if(typeof module==='object'&&module.exports)module.exports=globalThis.THREE;` anhängen, damit die Node-Tests sie laden können. Lichtstärken sind seit r155 physikalisch und deshalb mit π multipliziert, Farben laufen über das Color-Management. Feste 60-Hz-Spielsimulation, geglättete Bewegung und Kamera, instanzierte Landschaftsobjekte, prozedurale Polygonmodelle, dynamische Schatten, Partikel, Minikarte und synthetisierte Musik/Sounds. Sparsame Grafik deaktiviert Schatten und reduziert die Auflösung. WebGL und ein aktueller Browser sind erforderlich.

`node aeru/tests/logic.cjs` prüft die echte Spiellogik mit realen Three.js-Geometrien und einem simulierten DOM/Renderer: Bewegung, Sprung, Gleiten, begehbare Treppe, Absturz, Tod, alle Sammelobjekte/Laternen, Nebenaufträge, Portalfolge, Boss, beide Enden, alte Spielstände, Windeffektdauer, gehaltene Angriffe, tatsächlicher Hin-/Rückflug über eine Insellücke sowie gleichmäßiges Tempo bei 30/60/120 Hz. Rendering und echte Geräteperformance sind damit nicht getestet.

`node aeru/tests/browser.cjs` ist ein optionaler Playwright-Smoke-Test (Playwright lokal installieren; `CHROMIUM_PATH` optional, z. B. `/opt/pw-browsers/chromium`). Er lädt die lokale HTML-Datei und erstellt Screenshots im Testordner. Die Oberfläche (Titel, HUD, Dialog, Pause) wurde mit Chromium (SwiftShader) auf Desktop, Handy hochkant und Handy quer per Screenshot geprüft; die Grafik mit r186 entspricht der r128-Fassung. Echte Geräteperformance ist damit nicht getestet.

`?test` aktiviert ausschließlich lokale Testinstrumentierung. Normale URLs enthalten keine Teststeuerung.

## Urheber und Lizenzen

Figuren, Namen, Dialoge, Levelgestaltung, Polygonmodelle, SVG und Musik wurden für dieses Spiel erstellt. Keine übernommenen Spyro-/PlayStation-Assets, Namen, Geschichten oder Audiodateien. Die allgemeine Idee eines 3D-Erkundungsspiels mit einem Drachen ist die Inspiration. Eine rechtliche Markenprüfung der neuen Namen ist nicht erfolgt.

Three.js: Copyright 2010–2026 three.js authors, MIT-Lizenz, siehe `vendor/LICENSE.three.txt`. Übriger Code unter der Lizenz des übergeordneten Repositories.
