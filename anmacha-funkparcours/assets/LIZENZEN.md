# Titanparcours – Herkunft und Lizenzen der Assets

Alle Dateien in `assets/` sind frei nutzbar. Gemeinfreie Dateien (CC0) brauchen keine Namensnennung, sie steht hier trotzdem.

## Texturen (`tex/`) – Poly Haven, CC0 1.0

Auf 512 × 512 px verkleinert, als JPEG gespeichert (Normalmaps im OpenGL-Format).

| Datei | Original | Verwendung |
| --- | --- | --- |
| `rubber_d.jpg`, `rubber_n.jpg` | Rubber Tiles – https://polyhaven.com/a/rubber_tiles | Gummimatten auf den Plattformen |
| `metal_d.jpg`, `metal_n.jpg` | Blue Metal Plate – https://polyhaven.com/a/blue_metal_plate | Stahlplatten (Klippenhänger-Wand), Normalmap auch für Traversen |
| `wood_d.jpg`, `wood_n.jpg` | Plywood – https://polyhaven.com/a/plywood | Griffleisten, Lachsleiter, Lauffläche der Steilwand |
| `env_studio.jpg` | Studio Small 03 (HDRI) – https://polyhaven.com/a/studio_small_03, über das npm-Paket `@pmndrs/assets` (CC0) | Spiegelungen auf Metall und Polstern (auf 8 Bit umgerechnet, 512 × 256 px) |

Lizenz: https://creativecommons.org/publicdomain/zero/1.0/ – siehe auch https://polyhaven.com/license

## Geräusche (`snd/`) – Kenney, CC0 1.0

| Datei | Original |
| --- | --- |
| `jump.mp3`, `land.mp3` | Kenney „Starter Kit 3D Platformer“, `sounds/jump.ogg` und `sounds/land.ogg` – https://github.com/KenneyNL/Starter-Kit-3D-Platformer (Assets CC0, https://kenney.nl) |

Nach MP3 (Mono, 64 kbit/s) umgewandelt, damit alle Browser sie abspielen. Alle anderen Töne erzeugt das Spiel selbst (`audio.js`).

## Schriften (`fonts/`) – Barlow, SIL Open Font License 1.1

| Datei | Schrift |
| --- | --- |
| `titan-display.woff2` | Barlow Condensed ExtraBold Italic |
| `titan-cond.woff2` | Barlow Condensed SemiBold |
| `titan-text.woff2`, `titan-text-bold.woff2` | Barlow Medium und Bold |

Barlow © 2017 The Barlow Project Authors (https://github.com/jpt/barlow), über das npm-Paket `@fontsource/barlow(-condensed)`. Lizenztext: `fonts/OFL.txt`.

## Figuren

Die Läufer kommen aus dem gemeinsamen Ordner `../figuren/` (Quaternius „Universal Base Characters“ und „Universal Animation Library“, CC0) – siehe `figuren/README.md`.
