# Bunte Insel

Kinderspiel mit kleiner offener Insel-Welt (Three.js r128 per CDN, sonst keine Bibliothek, keine Bilder/Sounds zum Laden – Sounds und Musik werden im Browser erzeugt).

- **Laufen** (springen, „Hallo!“ rufen) und **8 Fahrzeuge**: Auto, Motorrad, Polizeiauto, Krankenwagen, Feuerwehr (mit Wasserstrahl), Bus, Traktor, Eiswagen (spielt ein Lied) – dazu ein **Zug** auf dem Schienenring mit automatischem Bahnhofshalt.
- **Einsätze** je Fahrzeug (Streife, Notruf mit Krankenhaus, Feuer löschen, Bus-Haltestellen, Eis liefern, Taxi, Paket-Kurier, Heu einsammeln, Zugrunde mit Halt) und **Sterne** zum Sammeln (werden gespeichert).
- Insel mit Stadt, Krankenhaus, Polizei, Feuerwehr, Bahnhof, Park mit Spielplatz, Farm mit Tieren, See mit Enten, Strand, Leuchtturm. **Tag/Nacht**, Minimap, 6 Heldenfarben × 6 Mützen.
- Steuerung: **Touch** – Joystick links, Kamera rechts wischen, Knöpfe für Einsteigen/Hupe/Sirene/Turbo/Springen. **Tastatur** – WASD/Pfeile, E einsteigen, Leertaste Hupe bzw. Sprung, Shift Turbo/Rennen, F Sirene, N Nacht, M Ton, C Kameraabstand, Q/R Kamera drehen, P/Esc Pause. Maus ziehen dreht die Kamera.

## Leichtgewichtig
Die ganze statische Welt ist ein einziges gebündeltes Mesh mit Vertexfarben (ca. 90 Draw-Calls, ~100 k Dreiecke), keine Schatten-Maps, Partikel in einem Draw-Call, Bildschirmauflösung passt sich bei niedriger Bildrate automatisch an.

## Starten / Testen
```bash
python3 -m http.server 8080            # im Repo-Hauptordner
# http://localhost:8080/bunte-insel/
npm i -D playwright                    # einmalig, nur für den Test
BASE=http://localhost:8080 node bunte-insel/tests/e2e.mjs   # optional THREE=/pfad/three.min.js für Offline
```
Dateien: `js/util.js` (Geometrie-Bündelung, Figur, Partikel), `js/audio.js`, `js/world.js` (Insel, Straßen, Schienen, Kollision), `js/vehicles.js` (Fahrzeuge, Zug), `js/main.js` (Steuerung, Kamera, Missionen, Figuren, Tiere, Verkehr).
