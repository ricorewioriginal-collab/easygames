# easygames-Figuren

Realistische, animierte Menschen für alle easygames (Three.js r128 oder neuer, ohne Build-Schritt).

- `figuren.js` – Baukasten: `EasyFiguren.create({ THREE, GLTFLoader, base: '../figuren/' })` → `kit.make(look)` → Figur mit `root`, `play(name)`, `update(dt)`, `reach(0…1)`, `ghost()`, `recolor()`, `dispose()`.
  Kleidung (Oberteil Tanktop/T-Shirt/Langarm, Shorts/lange Hose, Schuhe), Hautton, Bart, Frisuren (kurz, Buzz, Pony, Bob, lang, Zopf, Dutt, Irokese, Locken, Stachel, Glatze) und Hüte entstehen zur Laufzeit.
  `kit.fromRoster(look)` übersetzt die Steckbriefe aus `easyclash/js/roster.js`, damit Figuren aus allen Spielen überall spielbar sind.
- `mann.glb`, `frau.glb` – zwei Grundkörper (je ca. 13 000 Dreiecke, 430 KB), `anim.glb` – 22 Bewegungen (Stehen, Gehen, Joggen, Sprinten, Springen, Klettern, Schwimmen, Jubeln, …).
- Für Spiele mit `THREE` r128 aus `vendor/`: vorher `vendor/three-r128-gltfloader.js` laden.

Herkunft: Quaternius, „Universal Base Characters“ und „Universal Animation Library 1/2“ (Standard), Lizenz **CC0** (https://quaternius.com).
Aufbereitet mit `tools/make-figuren.mjs` (Texturen verkleinert, Geometrie quantisiert, Bewegungen ausgedünnt).
