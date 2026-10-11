# AERU – Die Sterneninseln

Eigenständiges, abgeschlossenes 3D-Drachenabenteuer für Desktop- und mobile Browser. Start: `index.html`; kein Build, kein Backend, keine externen Downloads. Im Hauptverzeichnis der Spielesammlung eingetragen.

## Spielen

- WASD / Pfeiltasten: bewegen. Maus ziehen oder Q/E: Kamera drehen.
- Leertaste: springen. In der Luft halten: gleiten.
- F: Windstoß. R: sprechen, Dialog fortsetzen, Portal benutzen.
- Escape / Pauseknopf: Pause, Ton, sparsame Grafik, Rettung zum Startpunkt.
- Handy: linker Joystick, rechts Kamera ziehen, SPRUNG halten zum Gleiten, WIND und REDEN.

Entzünde drei Windlaternen pro Insel durch einen gerichteten Windstoß. Sammle mindestens zwölf Splitter und sprich mit dem örtlichen Hüter, um einen Leuchtkern zu erhalten. Das Tor am Ende der Treppe führt weiter. Auf der letzten Insel wartet Vesper: seinen Sturmring überspringen und das offene Schild mit Wind treffen. Nach dem Ende können alle Inseln erneut erkundet werden.

Drei Gebiete (Windwiesen, Bernsteinhain, Sternenwarte), neun NPCs, 72 Splitter, drei Nebenaufträge, drei Leuchtkerne, Gegner, Boss, Epilog und freie Erkundung. Die beiden Außeninseln jeder Welt enthalten die Gegenstände für den jeweiligen Nebenauftrag.

Der Spielstand wird unter `aeru-save-v1` im Browser gespeichert. Inselaufgaben und Bossfortschritt bleiben erhalten; die Position beginnt beim Fortsetzen am sicheren Inselstart. „Abenteuer beginnen“ startet eine neue Reise. Kein Cloud-Speicher. Audio beginnt erst nach Interaktion. Bei blockiertem Speicher bleibt die aktuelle Sitzung spielbar.

## Technik und Prüfung

Three.js r128 liegt lokal unter `vendor/`. Prozedurale Polygonmodelle, dynamische Schatten, Partikel, Minikarte und synthetisierte Musik/Sounds. Sparsame Grafik deaktiviert Schatten und reduziert die Auflösung. WebGL und ein aktueller Browser sind erforderlich.

`node aeru/tests/logic.cjs` prüft die echte Spiellogik mit realen Three.js-Geometrien und einem simulierten DOM/Renderer: Bewegung, Sprung, Gleiten, begehbare Treppe, Absturz, Tod, alle Sammelobjekte/Laternen, Nebenaufträge, Portalfolge, Boss, Ende und Speicherfortsetzung. Rendering und echte Geräteperformance sind damit nicht getestet.

`node aeru/tests/browser.cjs` ist ein optionaler Playwright-Smoke-Test (Playwright lokal installieren; `CHROMIUM_PATH` optional). Er lädt die lokale HTML-Datei und erstellt Screenshots im Testordner. Die Entwicklungsumgebung blockierte den Chromium-Prozess per Sandbox; deshalb liegt für diese Fassung keine erfolgreiche visuelle Browserprüfung vor.

`?test` aktiviert ausschließlich lokale Testinstrumentierung. Normale URLs enthalten keine Teststeuerung.

## Urheber und Lizenzen

Figuren, Namen, Dialoge, Levelgestaltung, Polygonmodelle, SVG und Musik wurden für dieses Spiel erstellt. Keine übernommenen Spyro-/PlayStation-Assets, Namen, Geschichten oder Audiodateien. Die allgemeine Idee eines 3D-Erkundungsspiels mit einem Drachen ist die Inspiration. Eine rechtliche Markenprüfung der neuen Namen ist nicht erfolgt.

Three.js: Copyright 2010–2021 Three.js Authors, MIT-Lizenz, siehe `vendor/LICENSE.three.txt`. Übriger Code unter der Lizenz des übergeordneten Repositories.
