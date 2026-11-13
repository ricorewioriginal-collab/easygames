# Assets und Lizenzen

RicoLife 3D verwendet als einzige fremde Dateien **3D-Modelle von Kenney unter CC0** (gemeinfrei, keine Namensnennung nötig – wir nennen sie trotzdem). Keine fremden Bilder, Töne oder Schriften.

| Asset | Herkunft | Lizenz |
|---|---|---|
| 3D-Figuren, Haustiere, Möbel, Gebäude, Gelände, Himmel, Wetter | prozedural im Code erzeugt (`src/render/*`) | Teil des Projekts (MIT, siehe Repository) |
| Bäume, Kiefern, Birke, Büsche, Blumen, Felsen, Baumstumpf, Stamm (`assets-src/kenney/tree_*.glb`, `bush*.glb`, `flower_red.glb`, `rock_*.glb`, `stump.glb`, `log.glb`) | [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) von Kenney (www.kenney.nl) | **CC0 1.0** (`assets-src/kenney/CC0-1.0.txt`; Lizenzdatei des Pakets: „Creative Commons Zero, CC0“) |
| Autos `sedan`, `taxi`, `van`, `suv`, `hatchback_sports` (`assets-src/kenney/*.glb`) | [Kenney Car Kit](https://kenney.nl/assets/car-kit) von Kenney (www.kenney.nl) | **CC0 1.0** |
| Klänge und Musik | zur Laufzeit per WebAudio synthetisiert (`src/audio/audio.ts`) | Teil des Projekts |
| Symbole, Kachelbild, App-Icons (`public/favicon.svg`, `public/card.svg`, `public/icons/*.png`) | eigens gezeichnet (SVG), PNGs daraus mit Chromium gerendert | Teil des Projekts |
| Emojis in der Oberfläche | Systemschrift des Geräts | – |
| three.js 0.180 | npm-Paket, im Build gebündelt | MIT |
| `../cloud/anmacha-cloud.js`, `../cloud/fire-peer.js` | vorhandene easygames-Skripte | wie Repository |

Alle Namen, Orte (Lindenhafen), Marken und Figuren sind frei erfunden. Es werden keine Logos, Symbole oder Sprachen anderer Lebenssimulationen nachgebildet; die Figuren sprechen in Sprechblasen mit Symbolen statt einer Fantasiesprache.

## Echte 3D-Modelle: Herkunft und Aufbereitung

- Quelle der GLB-Dateien: npm-Paket `@netforge/asset-library-files` 0.2.0 (`library/lowpoly/*.glb`), dessen `NOTICE` je Paket die Kenney-Herkunft
  und die CC0-Lizenz („License: (Creative Commons Zero, CC0)“) nachweist; die Zuordnung Datei → Kenney-Originaldatei steht in
  `@netforge/asset-library` (`manifest/lowpoly.json`), z. B. `tree_oak.glb` = Nature Kit `tree_oak.glb`, `sedan.glb` = Car Kit `sedan.glb`.
- Die 17 Quell-Modelle (252 KB) liegen unverändert in `assets-src/kenney/`. `node tools/bake-models.mjs` backt sie in **eine** Datei
  `public/models/kenney.bin` (≈ 232 KB, 12 500 Vertices): Positionen 16 Bit, Normalen 8 Bit, Farben je Vertex (bei den Autos aus der
  Farbpalette der Textur übernommen). Im Spiel ist dadurch weder GLTFLoader noch ein Textur-Download nötig – schonend fürs Handy.
- Farben: Laub, Gras und Blüten bekommen die Jahreszeiten-Farben der Stadt, Rinde, Stein und Holz die Palette von Lindenhafen.
- Die Datei ist optional: Fehlt sie (z. B. allererster Start offline), zeigt das Spiel die bisherigen prozeduralen Modelle.
- Der Service Worker legt sie beim Installieren mit ab (offline spielbar).
